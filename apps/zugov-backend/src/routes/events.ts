import { Hono } from "hono";
import { z } from "zod";
import * as eventService from "../services/eventService.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import { isAuthorized, hasTierPermission } from "../services/membershipService.js";

const EVENT_KIND = z.enum(["talk", "workshop", "social", "meeting", "other"]);

// venueId/locationText: exactly one, enforced here (2026-08-19 review, A3) — not a DB
// constraint. endAt must be after startAt (2026-08-19 review, T1 validation-edges finding).
const createEventSchema = z
  .object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000).optional(),
    venueId: z.string().optional(),
    locationText: z.string().max(500).optional(),
    startAt: z.number().int(),
    endAt: z.number().int(),
    kind: EVENT_KIND.optional(),
  })
  .refine((data) => !!data.venueId !== !!data.locationText, {
    message: "Provide exactly one of venueId or locationText",
  })
  .refine((data) => data.endAt > data.startAt, { message: "endAt must be after startAt" });

const updateEventSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    venueId: z.string().nullable().optional(),
    locationText: z.string().max(500).nullable().optional(),
    startAt: z.number().int().optional(),
    endAt: z.number().int().optional(),
    kind: EVENT_KIND.optional(),
  })
  .refine((data) => !(data.venueId && data.locationText), {
    message: "Cannot set both venueId and locationText",
  })
  .refine((data) => data.startAt === undefined || data.endAt === undefined || data.endAt > data.startAt, {
    message: "endAt must be after startAt",
  });

const duplicateEventSchema = z.object({
  count: z.number().int().min(1).max(52),
  intervalDays: z.number().int().min(1),
});

export const eventsRouter = new Hono();

// "Anyone can propose an event" (2026-08-19 review, D1) — gated on canCreateEvents, default
// true for every tier, not the more restrictive canManageMembership.
eventsRouter.post("/:id/events", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const body = await c.req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  if (!(await hasTierPermission(communityId, session.address!, "canCreateEvents"))) {
    return c.json({ error: "Not authorized to create events for this community" }, 403);
  }

  try {
    const event = await eventService.create({ communityId, creatorAddress: session.address!, ...parsed.data });
    return c.json({ event }, 201);
  } catch (err) {
    if (err instanceof eventService.InvalidVenueError) {
      return c.json({ error: err.message }, 422);
    }
    throw err;
  }
});

// Public — matches GET /api/communities/:id/unions' convention (reads are public, writes
// gated separately); necessary for A1's open-RSVP model to even be reachable by a non-member
// (2026-08-19 review, outside-voice finding #9).
eventsRouter.get("/:id/events", async (c) => {
  const communityId = c.req.param("id");
  const pageStr = c.req.query("page") ?? "1";
  const limitStr = c.req.query("limit") ?? "20";
  const page = Math.max(1, Number(pageStr));
  const limit = Math.min(50, Math.max(1, Number(limitStr)));

  const startAtStr = c.req.query("startAt");
  const endAtStr = c.req.query("endAt");
  const kindParam = c.req.query("kind");
  const kind = EVENT_KIND.safeParse(kindParam).success ? (kindParam as z.infer<typeof EVENT_KIND>) : undefined;

  const result = await eventService.list(communityId, page, limit, {
    startAt: startAtStr !== undefined ? Number(startAtStr) : undefined,
    endAt: endAtStr !== undefined ? Number(endAtStr) : undefined,
    kind,
  });
  return c.json(result);
});

eventsRouter.get("/:id/events/:eventId", async (c) => {
  const communityId = c.req.param("id");
  const eventId = c.req.param("eventId");
  const event = await eventService.get(eventId);
  if (!event || event.communityId !== communityId) {
    return c.json({ error: "Event not found" }, 404);
  }
  return c.json({ event });
});

// Creator OR canManageMembership (2026-08-19 review, outside-voice finding #2 — creator-only
// broke ENGINEERING.md's "authorization is one reusable pattern" rule; isAuthorized() already
// implements exactly this creator-OR-permission shape).
async function assertCanManageEvent(communityId: string, eventId: string, walletAddress: string): Promise<void> {
  const event = await eventService.get(eventId);
  if (!event || event.communityId !== communityId) throw new eventService.EventNotFoundError(eventId);
  if (event.creatorAddress.toLowerCase() === walletAddress.toLowerCase()) return;
  if (await isAuthorized(communityId, walletAddress)) return;
  throw new NotAuthorizedForEventError();
}

class NotAuthorizedForEventError extends Error {}

eventsRouter.patch("/:id/events/:eventId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const eventId = c.req.param("eventId");
  const body = await c.req.json();
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  try {
    await assertCanManageEvent(communityId, eventId, session.address!);
    const event = await eventService.update(eventId, communityId, parsed.data);
    return c.json({ event });
  } catch (err) {
    if (err instanceof eventService.EventNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof NotAuthorizedForEventError) {
      return c.json({ error: "Not authorized to edit this event" }, 403);
    }
    if (err instanceof eventService.EventCancelledError) return c.json({ error: err.message }, 409);
    if (err instanceof eventService.InvalidVenueError) return c.json({ error: err.message }, 422);
    throw err;
  }
});

eventsRouter.delete("/:id/events/:eventId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const eventId = c.req.param("eventId");
  const session = await getSession(c);

  try {
    await assertCanManageEvent(communityId, eventId, session.address!);
    const event = await eventService.cancel(eventId, communityId);
    return c.json({ event });
  } catch (err) {
    if (err instanceof eventService.EventNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof NotAuthorizedForEventError) {
      return c.json({ error: "Not authorized to cancel this event" }, 403);
    }
    if (err instanceof eventService.EventCancelledError) return c.json({ error: err.message }, 409);
    throw err;
  }
});

// Transactional, capped at 52 (2026-08-19 review, D4/CQ2/outside-voice finding #6).
eventsRouter.post("/:id/events/:eventId/duplicate", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const eventId = c.req.param("eventId");
  const body = await c.req.json();
  const parsed = duplicateEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  try {
    await assertCanManageEvent(communityId, eventId, session.address!);
    const created = await eventService.duplicate(eventId, communityId, parsed.data);
    return c.json({ events: created }, 201);
  } catch (err) {
    if (err instanceof eventService.EventNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof NotAuthorizedForEventError) {
      return c.json({ error: "Not authorized to duplicate this event" }, 403);
    }
    if (err instanceof eventService.EventCancelledError) return c.json({ error: err.message }, 409);
    throw err;
  }
});

// Bulk series cancel (2026-08-19 review, outside-voice finding #5) — creator of every event in
// the series, OR canManageMembership on the community, may cancel the whole series.
eventsRouter.delete("/:id/events/series/:seriesId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const seriesId = c.req.param("seriesId");
  const session = await getSession(c);
  const walletAddress = session.address!;

  const seriesEvents = await eventService.listBySeriesId(seriesId, communityId);
  if (seriesEvents.length === 0) return c.json({ error: "Series not found" }, 404);

  const isAdmin = await isAuthorized(communityId, walletAddress);
  const isSoleCreator = seriesEvents.every((e) => e.creatorAddress.toLowerCase() === walletAddress.toLowerCase());
  if (!isAdmin && !isSoleCreator) {
    return c.json({ error: "Not authorized to cancel this series" }, 403);
  }

  const cancelled = await eventService.cancelSeries(seriesId, communityId);
  return c.json({ events: cancelled });
});

eventsRouter.post("/:id/events/:eventId/rsvp", requireAuth, async (c) => {
  const eventId = c.req.param("eventId");
  const session = await getSession(c);

  try {
    const rsvp = await eventService.rsvp(eventId, session.address!);
    return c.json({ rsvp }, 201);
  } catch (err) {
    if (err instanceof eventService.EventNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof eventService.EventCancelledError) return c.json({ error: err.message }, 409);
    throw err;
  }
});

eventsRouter.delete("/:id/events/:eventId/rsvp", requireAuth, async (c) => {
  const eventId = c.req.param("eventId");
  const session = await getSession(c);

  try {
    const rsvp = await eventService.cancelRsvp(eventId, session.address!);
    return c.json({ rsvp });
  } catch (err) {
    if (err instanceof eventService.RsvpNotFoundError) return c.json({ error: err.message }, 404);
    throw err;
  }
});

eventsRouter.get("/:id/events/:eventId/rsvp", async (c) => {
  const eventId = c.req.param("eventId");
  const rsvps = await eventService.listRsvps(eventId);
  return c.json({ rsvps });
});
