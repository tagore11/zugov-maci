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
  const qs = params.toString();
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
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

export async function cancelEvent(communityId: string, eventId: string): Promise<Event> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/events/${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await parseErrorOr<{ event: Event }>(res, `Failed to cancel event: ${res.status}`);
  return data.event;
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
