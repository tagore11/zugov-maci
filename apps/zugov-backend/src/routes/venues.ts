import { Hono } from "hono";
import { z } from "zod";
import * as venueService from "../services/venueService.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import { isAuthorized } from "../services/membershipService.js";

const createVenueSchema = z.object({
  name: z.string().min(1).max(80),
  address: z.string().max(200).optional(),
  mapUrl: z.string().url().max(500).optional(),
});

export const venuesRouter = new Hono();

// Venues are curated shared infrastructure (2026-08-19 eng review, outside-voice finding) —
// gated on canManageMembership (organizer-level), not the more open canCreateEvents, to avoid
// duplicate/near-duplicate venue rows defeating the whole point of a reusable entity.
venuesRouter.post("/:id/venues", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const body = await c.req.json();
  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  if (!(await isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to create a venue for this community" }, 403);
  }

  const venue = await venueService.create({ communityId, ...parsed.data });
  return c.json({ venue }, 201);
});

// Public — matches GET /api/communities/:id/unions' convention (reads are public, writes
// gated separately).
venuesRouter.get("/:id/venues", async (c) => {
  const communityId = c.req.param("id");
  const venues = await venueService.list(communityId);
  return c.json({ venues });
});

venuesRouter.delete("/:id/venues/:venueId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const venueId = c.req.param("venueId");

  const session = await getSession(c);
  if (!(await isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to delete a venue for this community" }, 403);
  }

  try {
    await venueService.remove(venueId, communityId);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof venueService.VenueNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof venueService.VenueInUseError) return c.json({ error: err.message }, 409);
    throw err;
  }
});
