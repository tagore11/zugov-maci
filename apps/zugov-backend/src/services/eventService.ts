import { randomUUID } from "node:crypto";
import { and, eq, gte, lte, lt, ne, or, inArray, isNull, count } from "drizzle-orm";
import { db } from "../db/client.js";
import { events, venues, eventRsvps, communities, type Event, type EventRsvp } from "../db/schema.js";
import * as membershipService from "./membershipService.js";
import type { EventKind } from "../validators/eventSchema.js";

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

// Events expansion (/office-hours + /plan-eng-review 2026-08-26) — a side-event's parent must
// itself be a top-level event. A missing/cross-community parentEventId reuses EventNotFoundError
// (mirrors the existing "not found or wrong community" pattern used by update()/cancel()/
// duplicate() below), since referencing a parent that doesn't exist in this community is
// indistinguishable from referencing one that doesn't exist at all.
export class NestedSideEventError extends Error {
  constructor() {
    super("A side-event's parent cannot itself be a side-event (one level of nesting only)");
  }
}

export class MixedSeriesError extends Error {
  constructor() {
    super("Can't extend this series via duplicate — use the parent event's Repeat option instead");
  }
}

export type { EventKind };

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

const MAX_DUPLICATE_COUNT = 52;

export interface RepeatData {
  count: number;
  intervalDays: number;
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
  /** Events expansion (2026-08-26) — nullable, one level of nesting only, immutable after
   * creation (not part of UpdateEventData below, enforced structurally rather than at runtime). */
  parentEventId?: string | null;
  /** Events expansion Approach B (2026-08-27, D3) — see schema.ts's events.isAllDay comment for
   * boundary semantics. */
  isAllDay?: boolean;
  /** Events expansion Approach B (2026-08-27, D2) — creates `count` additional occurrences in the
   * same transaction as the source event, all sharing one new seriesId. A NEW code path,
   * deliberately not a reuse of duplicate() below: if this event has parentEventId set, every
   * repeat inherits the SAME parentEventId (sibling sessions under the same gathering) — the
   * opposite of duplicate()'s existing, untouched "always drop parentEventId" contract. */
  repeat?: RepeatData;
}

/** Events expansion Approach B (2026-08-27, D2, outside-voice fix) — shared row-generation logic
 * between create()'s repeat path and duplicate() below. Both need "N rows offset by
 * intervalDays * i, sharing one seriesId" — differ only in whether parentEventId is carried onto
 * the clones, which each caller passes explicitly (never hidden inside this helper) so the two
 * contracts stay visible at the call site. */
function buildRecurringRows(
  source: {
    communityId: string;
    title: string;
    description: string | null;
    venueId: string | null;
    locationText: string | null;
    startAt: number;
    endAt: number;
    kind: EventKind;
    creatorAddress: string;
    eligibleTierIds: string | null;
    isAllDay: boolean;
  },
  options: { count: number; intervalDays: number; seriesId: string; parentEventId: string | null; now: number },
) {
  const intervalSeconds = options.intervalDays * 24 * 60 * 60;
  return Array.from({ length: options.count }, (_, i) => {
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
      seriesId: options.seriesId,
      kind: source.kind,
      creatorAddress: source.creatorAddress,
      status: "active" as const,
      createdAt: options.now,
      cancelledAt: null,
      // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, outside-voice
      // finding) — without this, a tier-restricted recurring event's duplicated occurrences
      // would silently come back unrestricted.
      eligibleTierIds: source.eligibleTierIds,
      isAllDay: source.isAllDay,
      parentEventId: options.parentEventId,
    };
  });
}

export async function create(data: CreateEventData): Promise<ViewableEvent[]> {
  if (data.venueId) await assertVenueBelongsToCommunity(data.venueId, data.communityId);

  // Events expansion (2026-08-26) — app-level invariants (not DB constraints): a side-event's
  // communityId must match its parent's (reuses EventNotFoundError for "parent doesn't exist in
  // this community", same pattern as update()/cancel()/duplicate() below); nesting is capped at
  // one level (reject a parent that already has a parentEventId, no grandchildren).
  let parent: Event | null = null;
  if (data.parentEventId) {
    parent = await get(data.parentEventId);
    if (!parent || parent.communityId !== data.communityId) throw new EventNotFoundError(data.parentEventId);
    if (parent.parentEventId) throw new NestedSideEventError();
  }

  // Events expansion Approach B (2026-08-27, D2, outside-voice fix) — reuses duplicate()'s exact
  // cap, one source of truth for "how many events can be created in one call."
  if (data.repeat && (data.repeat.count < 1 || data.repeat.count > MAX_DUPLICATE_COUNT)) {
    throw new RangeError(`repeat.count must be between 1 and ${MAX_DUPLICATE_COUNT}`);
  }

  // Tier-inheritance-as-snapshot (2026-08-26 design review + eng review): when eligibleTierIds is
  // omitted on a side-event, copy the parent's CURRENT eligibleTierIds at creation time — a
  // snapshot, not a live reference to the parent's row. Without this, a side-event of a
  // tier-restricted parent would silently become fully public (omitted already means
  // "unrestricted" by Child I convention). An explicitly-provided eligibleTierIds (including
  // explicit null) is never overridden by inheritance.
  const eligibleTierIds =
    parent && data.eligibleTierIds === undefined
      ? parent.eligibleTierIds
      : serializeEligibleTierIds(data.eligibleTierIds);

  const now = Math.floor(Date.now() / 1000);
  const sourceValues = {
    id: randomUUID(),
    communityId: data.communityId,
    title: data.title,
    description: data.description ?? null,
    venueId: data.venueId ?? null,
    locationText: data.locationText ?? null,
    startAt: data.startAt,
    endAt: data.endAt,
    seriesId: data.seriesId ?? null,
    kind: data.kind ?? ("other" as EventKind),
    creatorAddress: data.creatorAddress,
    status: "active" as const,
    createdAt: now,
    cancelledAt: null,
    eligibleTierIds,
    isAllDay: data.isAllDay ?? false,
    parentEventId: data.parentEventId ?? null,
  };

  if (!data.repeat) {
    const [event] = await db.insert(events).values(sourceValues).returning();
    return [deserialize(event!)];
  }

  // Atomic: source + every repeat insert together, or none of them.
  return db.transaction(async (tx) => {
    const seriesId = randomUUID();
    const [source] = await tx
      .insert(events)
      .values({ ...sourceValues, seriesId })
      .returning();
    const repeatRows = buildRecurringRows(source!, {
      count: data.repeat!.count,
      intervalDays: data.repeat!.intervalDays,
      seriesId,
      // Side-event repeats stay side-events of the same parent (sibling sessions under the same
      // gathering) — deliberately diverges from duplicate()'s "always drop parentEventId"
      // contract, which is untouched and lives entirely in this NEW code path instead.
      parentEventId: source!.parentEventId,
      now,
    });
    const inserted = await tx.insert(events).values(repeatRows).returning();
    return [deserialize(source!), ...inserted.map(deserialize)];
  });
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
  /** Events expansion (2026-08-26) — upcoming = endAt >= now (an in-progress multi-day event
   * stays "upcoming" until it actually ends, never silently disappearing from both views), past =
   * endAt < now. Independent of startAt/endAt range filtering above (both can be combined). */
  collection?: "upcoming" | "past";
}

// Events expansion (/plan-eng-review 2026-08-26, D3) — shared between the existing per-community
// list() and the new global listGlobal(): both need kind/date-range/collection/includeCancelled
// conditions; only the community-scope condition (and, for listGlobal, the parentEventId IS NULL
// top-level-only condition) differs and is added by the caller. Extracted rather than
// copy-pasted a second time (DRY).
function buildEventFilterConditions(filter: ListEventsFilter) {
  const now = Math.floor(Date.now() / 1000);
  return [
    filter.includeCancelled ? undefined : ne(events.status, "cancelled"),
    filter.startAt !== undefined ? gte(events.endAt, filter.startAt) : undefined,
    filter.endAt !== undefined ? lte(events.startAt, filter.endAt) : undefined,
    filter.kind !== undefined ? eq(events.kind, filter.kind) : undefined,
    filter.collection === "upcoming" ? gte(events.endAt, now) : undefined,
    filter.collection === "past" ? lt(events.endAt, now) : undefined,
  ].filter((condition) => condition !== undefined);
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
  const where = and(eq(events.communityId, communityId), ...buildEventFilterConditions(filter));

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

export interface GlobalViewableEvent extends ViewableEvent {
  communityDisplayName: string;
  communityLogo: string | null;
}

// Events expansion (/plan-eng-review 2026-08-26, D1) — genuinely different pagination strategy
// from the per-community list() above: real DB-level LIMIT/OFFSET, not fetch-all-then-slice.
// That in-memory approach is fine for one community's dozens-to-hundreds of rows but breaks by
// definition once scope is "every community." Tier-visibility filtering still happens in JS on
// the bounded page AFTER the SQL fetch (same canView() used everywhere else) — total/hasMore
// reflect the UNFILTERED SQL count, reusing (not inventing) the exact imprecision list()'s own
// comment already accepts for the per-community case, just via a different mechanism.
//
// D6 (2026-08-26 amendment, post-design-review) — INNER JOINs communities for
// communityDisplayName/communityLogo (global feed cards need to show which community an event
// belongs to). PK join, 1:1, does not change pagination semantics. Explicit flat column-selection
// object, NOT Drizzle's default multi-table select (which would return nested
// { events: {...}, communities: {...} } results instead of the flat row shape canView()/
// deserialize() expect).
export async function listGlobal(
  page: number,
  limit: number,
  filter: ListEventsFilter = {},
  viewerAddress?: string,
): Promise<{ events: GlobalViewableEvent[]; total: number; hasMore: boolean }> {
  const where = and(isNull(events.parentEventId), ...buildEventFilterConditions(filter));
  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: events.id,
        communityId: events.communityId,
        title: events.title,
        description: events.description,
        venueId: events.venueId,
        locationText: events.locationText,
        startAt: events.startAt,
        endAt: events.endAt,
        seriesId: events.seriesId,
        kind: events.kind,
        creatorAddress: events.creatorAddress,
        status: events.status,
        createdAt: events.createdAt,
        cancelledAt: events.cancelledAt,
        eligibleTierIds: events.eligibleTierIds,
        parentEventId: events.parentEventId,
        isAllDay: events.isAllDay,
        communityDisplayName: communities.displayName,
        communityLogo: communities.logo,
      })
      .from(events)
      .innerJoin(communities, eq(events.communityId, communities.id))
      .where(where)
      .orderBy(events.startAt)
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(events).where(where),
  ]);

  const total = Number(totalRows[0]?.value ?? 0);

  // D1a (outside-voice fix) — exactly 2 queries total regardless of how many distinct
  // communities appear on this page, not a per-community fan-out.
  const distinctCommunityIds = [...new Set(rows.map((row) => row.communityId))];
  const contexts = await membershipService.resolveViewerContextsForCommunities(distinctCommunityIds, viewerAddress);
  const visible = rows.filter((row) => canView(row, row.creatorAddress, contexts.get(row.communityId) ?? null));

  return {
    events: visible.map((row) => {
      const { communityDisplayName, communityLogo, ...eventRow } = row;
      return { ...deserialize(eventRow), communityDisplayName, communityLogo };
    }),
    total,
    hasMore: offset + rows.length < total,
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
  /** Events expansion Approach B (2026-08-27, D3) — editable, unlike parentEventId. */
  isAllDay?: boolean;
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

// Events expansion (2026-08-26, D4/D5) — cancelling a parent auto-cancels all its side-events,
// mirroring cancelSeries()'s existing bulk-cancel precedent (a cancelled multi-day gathering
// shouldn't leave its component sessions looking still-active). One atomic UPDATE, not a
// multi-step transaction, so there's no partial-cascade failure mode. `status != 'cancelled'`
// guard (D4, outside-voice fix, copied from cancelSeries()'s existing guard below) prevents an
// already-independently-cancelled side-event's cancelledAt from being silently overwritten to
// the parent's cancellation time. Return type changed from ViewableEvent to ViewableEvent[] (D5,
// matching cancelSeries()'s shape) since the cascade can touch a parent plus N side-events —
// callers must pick the target row out of the array themselves (see routes/events.ts).
export async function cancel(id: string, communityId: string): Promise<ViewableEvent[]> {
  const existing = await get(id);
  if (!existing || existing.communityId !== communityId) throw new EventNotFoundError(id);
  if (existing.status === "cancelled") throw new EventCancelledError();

  const now = Math.floor(Date.now() / 1000);
  const updated = await db
    .update(events)
    .set({ status: "cancelled", cancelledAt: now })
    .where(and(or(eq(events.id, id), eq(events.parentEventId, id)), ne(events.status, "cancelled")))
    .returning();
  return updated.map(deserialize);
}

export interface DuplicateEventData {
  count: number;
  intervalDays: number;
}

// Recurring events are independent rows sharing a seriesId, not an RRULE-expanded single row
// (2026-08-19 review, D4 — matches sola.day's own API, which has no recurrence params either).
// Wrapped in one transaction so a mid-batch failure leaves zero rows persisted, not a partial
// series (2026-08-19 review, outside-voice finding #6 — also where the count cap lives).
//
// Events expansion Approach B (2026-08-27, D2 outside-voice fixes):
// - Clones ALWAYS get parentEventId: null (untouched contract — buildRecurringRows() is called
//   with parentEventId explicitly hardcoded to null here, never source.parentEventId).
// - Mixed-series guard: rejects extending a series that already has a parented member. Without
//   this, create()'s repeat path (which DOES carry parentEventId) and this function (which
//   doesn't) could add rows to the same seriesId with inconsistent parentEventId — silently
//   breaking the nested-schedule-by-day view's grouping for whichever member lacks a parent.
export async function duplicate(id: string, communityId: string, data: DuplicateEventData): Promise<ViewableEvent[]> {
  if (data.count < 1 || data.count > MAX_DUPLICATE_COUNT) {
    throw new RangeError(`count must be between 1 and ${MAX_DUPLICATE_COUNT}`);
  }

  const source = await get(id);
  if (!source || source.communityId !== communityId) throw new EventNotFoundError(id);
  if (source.status === "cancelled") throw new EventCancelledError();

  if (source.seriesId) {
    const seriesMembers = await db
      .select({ parentEventId: events.parentEventId })
      .from(events)
      .where(eq(events.seriesId, source.seriesId));
    if (seriesMembers.some((row) => row.parentEventId !== null)) throw new MixedSeriesError();
  }

  // The source event itself already exists — duplicate() generates the ADDITIONAL occurrences
  // and stamps seriesId onto the source row too, so a single WHERE seriesId = ? finds every
  // event in the series including the original.
  const seriesId = source.seriesId ?? randomUUID();
  const now = Math.floor(Date.now() / 1000);

  return db.transaction(async (tx) => {
    if (!source.seriesId) {
      await tx.update(events).set({ seriesId }).where(eq(events.id, id));
    }

    const newRows = buildRecurringRows(source, {
      count: data.count,
      intervalDays: data.intervalDays,
      seriesId,
      parentEventId: null,
      now,
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
//
// Events expansion (2026-08-26) — extended to cascade to side-events of every event in the
// series, not just the series members themselves. duplicate() stamps seriesId onto the SOURCE
// row too, so a parent event with side-events can be swept into this bulk path even though it
// wasn't originally "the series" — without this extension, its side-events would silently
// survive under a cancelled parent. Two queries: first resolves which event ids are in the
// series (needed to know which parentEventId values to cascade to), then one atomic UPDATE
// cancels the series members AND their side-events together, same `status != 'cancelled'` guard
// this function already had (the precedent D4's guard on cancel() above copied from here).
export async function cancelSeries(seriesId: string, communityId: string): Promise<ViewableEvent[]> {
  const seriesMembers = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.seriesId, seriesId), eq(events.communityId, communityId)));
  if (seriesMembers.length === 0) return [];
  const seriesMemberIds = seriesMembers.map((row) => row.id);

  const now = Math.floor(Date.now() / 1000);
  const updated = await db
    .update(events)
    .set({ status: "cancelled", cancelledAt: now })
    .where(
      and(
        eq(events.communityId, communityId),
        or(eq(events.seriesId, seriesId), inArray(events.parentEventId, seriesMemberIds)),
        ne(events.status, "cancelled"),
      ),
    )
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
