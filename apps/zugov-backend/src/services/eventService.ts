import { randomUUID } from "node:crypto";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { db } from "../db/client.js";
import { events, venues, eventRsvps, type Event, type EventRsvp } from "../db/schema.js";
import * as membershipService from "./membershipService.js";

export class EventNotFoundError extends Error {
  constructor(id: string) {
    super(`Event "${id}" not found`);
  }
}

export class InvalidVenueError extends Error {
  constructor() {
    super("venueId does not reference a venue in this community");
  }
}

export class EventCancelledError extends Error {
  constructor() {
    super("This event has been cancelled");
  }
}

export class RsvpNotFoundError extends Error {
  constructor() {
    super("No RSVP found for this event and wallet");
  }
}

export type EventKind = "talk" | "workshop" | "social" | "meeting" | "other";

// formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D1) — mirrors
// proposalService.ts's ViewableProposal/deserialize: the DB stores eligibleTierIds as a
// JSON-stringified string[] (or SQL NULL for "unrestricted"), callers get it back as string[] | null.
export type ViewableEvent = Omit<Event, "eligibleTierIds"> & { eligibleTierIds: string[] | null };

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D6) — moved to
// membershipService.ts (resolveViewerContext/canViewRestricted/serializeEligibleTierIds/
// deserializeEligibleTierIds), which discussionService.ts also needs. Aliased here so every
// existing call site below (list(), create(), update(), cancel(), duplicate(), cancelSeries(),
// getForViewer()) stays byte-for-byte unchanged — zero behavior change, confirmed by the full
// events.test.ts suite still passing.
const deserialize = membershipService.deserializeEligibleTierIds<Event>;
const serializeEligibleTierIds = membershipService.serializeEligibleTierIds;
const resolveViewerContext = membershipService.resolveViewerContext;
const canView = membershipService.canViewRestricted;

async function assertVenueBelongsToCommunity(venueId: string, communityId: string): Promise<void> {
  const [venue] = await db
    .select({ communityId: venues.communityId })
    .from(venues)
    .where(eq(venues.id, venueId))
    .limit(1);
  if (!venue || venue.communityId !== communityId) throw new InvalidVenueError();
}

export interface CreateEventData {
  communityId: string;
  title: string;
  description?: string;
  venueId?: string;
  locationText?: string;
  startAt: number;
  endAt: number;
  kind?: EventKind;
  creatorAddress: string;
  seriesId?: string;
  /** Omit/undefined/null = unrestricted (D1). */
  eligibleTierIds?: string[] | null;
}

export async function create(data: CreateEventData): Promise<ViewableEvent> {
  if (data.venueId) await assertVenueBelongsToCommunity(data.venueId, data.communityId);

  const now = Math.floor(Date.now() / 1000);
  const [event] = await db
    .insert(events)
    .values({
      id: randomUUID(),
      communityId: data.communityId,
      title: data.title,
      description: data.description ?? null,
      venueId: data.venueId ?? null,
      locationText: data.locationText ?? null,
      startAt: data.startAt,
      endAt: data.endAt,
      seriesId: data.seriesId ?? null,
      kind: data.kind ?? "other",
      creatorAddress: data.creatorAddress,
      status: "active",
      createdAt: now,
      cancelledAt: null,
      eligibleTierIds: serializeEligibleTierIds(data.eligibleTierIds),
    })
    .returning();
  return deserialize(event!);
}

/** Raw row, no viewer/visibility awareness — for internal existence/ownership checks
 * (assertCanManageEvent, update, cancel, duplicate) that need the real row regardless of who's
 * asking. Use getForViewer for anything reached by an end user. */
export async function get(id: string): Promise<Event | null> {
  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return rows[0] ?? null;
}

// formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D1/D2) — mirrors
// proposalService's getForViewer: returns null both for "doesn't exist" and "exists but this
// viewer can't see it," same as a 404 either way from the route's perspective.
export async function getForViewer(
  id: string,
  communityId: string,
  viewerAddress: string | undefined,
): Promise<ViewableEvent | null> {
  const row = await get(id);
  if (!row || row.communityId !== communityId) return null;
  const ctx = await resolveViewerContext(communityId, viewerAddress);
  if (!canView(row, row.creatorAddress, ctx)) return null;
  return deserialize(row);
}

export interface ListEventsFilter {
  startAt?: number;
  endAt?: number;
  kind?: EventKind;
  includeCancelled?: boolean;
}

// formalize-communities epic, Child I (/plan-eng-review 2026-08-25, pagination-vs-filtering
// decision) — fetches every matching row (no LIMIT/OFFSET) and paginates the FILTERED array in
// memory, rather than filtering after a DB-level LIMIT. A DB-paginated fetch would make
// total/hasMore lie once any row is tier-restricted (a page of `limit` rows could shrink after
// filtering, and total/hasMore would still reflect the unfiltered count). Community event lists
// are realistically dozens-to-low-hundreds of rows, not a scale where the full fetch matters yet.
export async function list(
  communityId: string,
  page: number,
  limit: number,
  filter: ListEventsFilter = {},
  viewerAddress?: string,
): Promise<{ events: ViewableEvent[]; total: number; hasMore: boolean }> {
  const conditions = [
    eq(events.communityId, communityId),
    filter.includeCancelled ? undefined : ne(events.status, "cancelled"),
    filter.startAt !== undefined ? gte(events.endAt, filter.startAt) : undefined,
    filter.endAt !== undefined ? lte(events.startAt, filter.endAt) : undefined,
    filter.kind !== undefined ? eq(events.kind, filter.kind) : undefined,
  ].filter((condition) => condition !== undefined);
  const where = and(...conditions);

  const rows = await db.select().from(events).where(where).orderBy(events.startAt);
  const ctx = await resolveViewerContext(communityId, viewerAddress);
  const visible = rows.filter((row) => canView(row, row.creatorAddress, ctx));

  const offset = (page - 1) * limit;
  const pageRows = visible.slice(offset, offset + limit);
  return {
    events: pageRows.map(deserialize),
    total: visible.length,
    hasMore: offset + pageRows.length < visible.length,
  };
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  venueId?: string | null;
  locationText?: string | null;
  startAt?: number;
  endAt?: number;
  kind?: EventKind;
  eligibleTierIds?: string[] | null;
}

export async function update(id: string, communityId: string, patch: UpdateEventData): Promise<ViewableEvent> {
  const existing = await get(id);
  if (!existing || existing.communityId !== communityId) throw new EventNotFoundError(id);
  if (existing.status === "cancelled") throw new EventCancelledError();
  if (patch.venueId) await assertVenueBelongsToCommunity(patch.venueId, communityId);

  const { eligibleTierIds, ...rest } = patch;
  const dbPatch =
    "eligibleTierIds" in patch ? { ...rest, eligibleTierIds: serializeEligibleTierIds(eligibleTierIds) } : rest;

  const [updated] = await db.update(events).set(dbPatch).where(eq(events.id, id)).returning();
  return deserialize(updated!);
}

export async function cancel(id: string, communityId: string): Promise<ViewableEvent> {
  const existing = await get(id);
  if (!existing || existing.communityId !== communityId) throw new EventNotFoundError(id);
  if (existing.status === "cancelled") throw new EventCancelledError();

  const now = Math.floor(Date.now() / 1000);
  const [updated] = await db
    .update(events)
    .set({ status: "cancelled", cancelledAt: now })
    .where(eq(events.id, id))
    .returning();
  return deserialize(updated!);
}

const MAX_DUPLICATE_COUNT = 52;

export interface DuplicateEventData {
  count: number;
  intervalDays: number;
}

// Recurring events are independent rows sharing a seriesId, not an RRULE-expanded single row
// (2026-08-19 review, D4 — matches sola.day's own API, which has no recurrence params either).
// Wrapped in one transaction so a mid-batch failure leaves zero rows persisted, not a partial
// series (2026-08-19 review, outside-voice finding #6 — also where the count cap lives).
export async function duplicate(id: string, communityId: string, data: DuplicateEventData): Promise<ViewableEvent[]> {
  if (data.count < 1 || data.count > MAX_DUPLICATE_COUNT) {
    throw new RangeError(`count must be between 1 and ${MAX_DUPLICATE_COUNT}`);
  }

  const source = await get(id);
  if (!source || source.communityId !== communityId) throw new EventNotFoundError(id);
  if (source.status === "cancelled") throw new EventCancelledError();

  // The source event itself already exists — duplicate() generates the ADDITIONAL occurrences
  // and stamps seriesId onto the source row too, so a single WHERE seriesId = ? finds every
  // event in the series including the original.
  const seriesId = source.seriesId ?? randomUUID();
  const intervalSeconds = data.intervalDays * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);

  return db.transaction(async (tx) => {
    if (!source.seriesId) {
      await tx.update(events).set({ seriesId }).where(eq(events.id, id));
    }

    const newRows = Array.from({ length: data.count }, (_, i) => {
      const offset = intervalSeconds * (i + 1);
      return {
        id: randomUUID(),
        communityId: source.communityId,
        title: source.title,
        description: source.description,
        venueId: source.venueId,
        locationText: source.locationText,
        startAt: source.startAt + offset,
        endAt: source.endAt + offset,
        seriesId,
        kind: source.kind,
        creatorAddress: source.creatorAddress,
        status: "active" as const,
        createdAt: now,
        cancelledAt: null,
        // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, outside-voice
        // finding) — without this, a tier-restricted recurring event's duplicated occurrences
        // would silently come back unrestricted.
        eligibleTierIds: source.eligibleTierIds,
      };
    });

    const inserted = await tx.insert(events).values(newRows).returning();
    return inserted.map(deserialize);
  });
}

export async function listBySeriesId(seriesId: string, communityId: string): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(and(eq(events.seriesId, seriesId), eq(events.communityId, communityId)));
}

// Bulk cancel every event sharing a seriesId in one query, not N individual cancel() calls
// (2026-08-19 review, outside-voice finding #5 — duplicate() had no corresponding bulk
// lifecycle operation).
export async function cancelSeries(seriesId: string, communityId: string): Promise<ViewableEvent[]> {
  const now = Math.floor(Date.now() / 1000);
  const updated = await db
    .update(events)
    .set({ status: "cancelled", cancelledAt: now })
    .where(and(eq(events.seriesId, seriesId), eq(events.communityId, communityId), ne(events.status, "cancelled")))
    .returning();
  return updated.map(deserialize);
}

// RSVP is intent only — deliberately open to ANY signed-in wallet, no membership check
// (2026-08-19 review, D3/A1). Check-in/attendance is a separate, deferred TODO.
export async function rsvp(eventId: string, walletAddress: string): Promise<EventRsvp> {
  const event = await get(eventId);
  if (!event) throw new EventNotFoundError(eventId);
  if (event.status === "cancelled") throw new EventCancelledError();

  const now = Math.floor(Date.now() / 1000);
  const [existing] = await db
    .select()
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.walletAddress, walletAddress)))
    .limit(1);

  if (existing) {
    // Soft-cancel mirrors unionMemberships: a cancel-then-re-RSVP flips the same row back to
    // active instead of creating a duplicate (2026-08-19 review, A4).
    const [updated] = await db
      .update(eventRsvps)
      .set({ status: "active", rsvpedAt: now, cancelledAt: null })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.walletAddress, walletAddress)))
      .returning();
    return updated!;
  }

  const [created] = await db
    .insert(eventRsvps)
    .values({ eventId, walletAddress, status: "active", rsvpedAt: now, cancelledAt: null })
    .returning();
  return created!;
}

// Own wallet only — checked by the route (the caller's session address, not a param), same
// posture as unionMemberships' leave().
export async function cancelRsvp(eventId: string, walletAddress: string): Promise<EventRsvp> {
  const now = Math.floor(Date.now() / 1000);
  const [existing] = await db
    .select()
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.walletAddress, walletAddress)))
    .limit(1);
  if (!existing || existing.status !== "active") throw new RsvpNotFoundError();

  const [updated] = await db
    .update(eventRsvps)
    .set({ status: "cancelled", cancelledAt: now })
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.walletAddress, walletAddress)))
    .returning();
  return updated!;
}

export async function listRsvps(eventId: string): Promise<EventRsvp[]> {
  return db
    .select()
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "active")));
}
