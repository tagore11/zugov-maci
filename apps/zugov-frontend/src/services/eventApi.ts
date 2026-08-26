import { parseErrorOr } from "@/src/services/httpClient";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export type EventKind = "talk" | "workshop" | "social" | "meeting" | "other";
export type EventStatus = "active" | "cancelled";
export type RsvpStatus = "active" | "cancelled";

export interface Venue {
  id: string;
  communityId: string;
  name: string;
  address: string | null;
  mapUrl: string | null;
  createdAt: number;
}

export interface Event {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  venueId: string | null;
  locationText: string | null;
  startAt: number;
  endAt: number;
  seriesId: string | null;
  kind: EventKind;
  creatorAddress: string;
  status: EventStatus;
  createdAt: number;
  cancelledAt: number | null;
  /** null = unrestricted, visible to everyone (formalize-communities epic, Child I, D1). */
  eligibleTierIds: string[] | null;
  /** Events expansion (2026-08-26) — nullable, one level of nesting only, immutable after
   * creation. Non-null means this event is a side-event of the referenced parent. */
  parentEventId: string | null;
}

/** Global cross-community feed row (GET /api/events) — additive fields on top of Event, per the
 * D6 eng-review amendment: the backend joins communities so the card can show which community
 * each event belongs to without a second client-side fetch. */
export interface GlobalEvent extends Event {
  communityDisplayName: string;
  communityLogo: string | null;
}

export interface EventRsvp {
  eventId: string;
  walletAddress: string;
  status: RsvpStatus;
  rsvpedAt: number;
  cancelledAt: number | null;
}

export async function listVenues(communityId: string): Promise<Venue[]> {
  // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, outside-voice finding) —
  // credentials: "include" was missing on every GET in this file, unlike proposalApi.ts's
  // equivalents. FE/BE are different origins in production, so without it the session cookie
  // never reaches the backend and viewer-aware tier filtering (D2/D6) would silently never
  // activate for signed-in users. Applied to all 4 GETs below, not just the new events one.
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/venues`, { credentials: "include" });
  const data = await parseErrorOr<{ venues: Venue[] }>(res, `Failed to fetch venues: ${res.status}`);
  return data.venues;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  venueId?: string;
  locationText?: string;
  startAt: number;
  endAt: number;
  kind?: EventKind;
  /** Omit or null for unrestricted (default). */
  eligibleTierIds?: string[] | null;
  /** Events expansion (2026-08-26, D2) — optional side-event parent. Immutable after creation. */
  parentEventId?: string;
}

export async function createEvent(communityId: string, input: CreateEventInput): Promise<Event> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseErrorOr<{ event: Event }>(res, `Failed to create event: ${res.status}`);
  return data.event;
}

export interface ListEventsFilter {
  page?: number;
  limit?: number;
  startAt?: number;
  endAt?: number;
  kind?: EventKind;
  /** Events expansion (2026-08-26, T6) — upcoming = endAt >= now, past = endAt < now. */
  collection?: "upcoming" | "past";
}

export async function listEvents(
  communityId: string,
  filter: ListEventsFilter = {},
): Promise<{ events: Event[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (filter.page !== undefined) params.set("page", String(filter.page));
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.startAt !== undefined) params.set("startAt", String(filter.startAt));
  if (filter.endAt !== undefined) params.set("endAt", String(filter.endAt));
  if (filter.kind !== undefined) params.set("kind", filter.kind);
  if (filter.collection !== undefined) params.set("collection", filter.collection);
  const qs = params.toString();
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to fetch events: ${res.status}`);
}

export interface ListGlobalEventsFilter {
  page?: number;
  limit?: number;
  kind?: EventKind;
  collection?: "upcoming" | "past";
}

// Events expansion (2026-08-26) — the first cross-community events call in this codebase, mirrors
// communityApi.listAllUnions()'s top-level discovery-page convention. Public, no auth required.
export async function listGlobalEvents(
  filter: ListGlobalEventsFilter = {},
): Promise<{ events: GlobalEvent[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (filter.page !== undefined) params.set("page", String(filter.page));
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.kind !== undefined) params.set("kind", filter.kind);
  if (filter.collection !== undefined) params.set("collection", filter.collection);
  const qs = params.toString();
  const res = await fetch(`${BASE_URL}/api/events${qs ? `?${qs}` : ""}`, { credentials: "include" });
  return parseErrorOr(res, `Failed to fetch events: ${res.status}`);
}

export async function getEvent(communityId: string, eventId: string): Promise<Event> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}`, {
    credentials: "include",
  });
  const data = await parseErrorOr<{ event: Event }>(res, `Failed to fetch event: ${res.status}`);
  return data.event;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  venueId?: string | null;
  locationText?: string | null;
  startAt?: number;
  endAt?: number;
  kind?: EventKind;
  eligibleTierIds?: string[] | null;
}

export async function updateEvent(communityId: string, eventId: string, patch: UpdateEventInput): Promise<Event> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  const data = await parseErrorOr<{ event: Event }>(res, `Failed to update event: ${res.status}`);
  return data.event;
}

// D5 (2026-08-26) — cancelling a parent auto-cancels its side-events; the response additively
// carries cascadedSideEvents so the caller can update side-event UI state without a refetch.
export async function cancelEvent(
  communityId: string,
  eventId: string,
): Promise<{ event: Event; cascadedSideEvents: Event[] }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to cancel event: ${res.status}`);
}

export async function duplicateEvent(
  communityId: string,
  eventId: string,
  input: { count: number; intervalDays: number },
): Promise<Event[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseErrorOr<{ events: Event[] }>(res, `Failed to duplicate event: ${res.status}`);
  return data.events;
}

export async function rsvp(communityId: string, eventId: string): Promise<EventRsvp> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}/rsvp`, {
    method: "POST",
    credentials: "include",
  });
  const data = await parseErrorOr<{ rsvp: EventRsvp }>(res, `Failed to RSVP: ${res.status}`);
  return data.rsvp;
}

export async function cancelRsvp(communityId: string, eventId: string): Promise<EventRsvp> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}/rsvp`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await parseErrorOr<{ rsvp: EventRsvp }>(res, `Failed to cancel RSVP: ${res.status}`);
  return data.rsvp;
}

export async function listRsvps(communityId: string, eventId: string): Promise<EventRsvp[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}/rsvp`, {
    credentials: "include",
  });
  const data = await parseErrorOr<{ rsvps: EventRsvp[] }>(res, `Failed to fetch RSVPs: ${res.status}`);
  return data.rsvps;
}
