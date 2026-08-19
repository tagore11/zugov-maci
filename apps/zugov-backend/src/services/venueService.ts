import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { venues, events, type Venue } from "../db/schema.js";

export class VenueNotFoundError extends Error {
  constructor(id: string) {
    super(`Venue "${id}" not found`);
  }
}

// events.venueId is ON DELETE SET NULL, and the venueId/locationText "exactly one" invariant
// is enforced only at the Zod validator layer, not the DB (2026-08-19 eng review, outside-voice
// finding) — a naive delete would silently leave referencing events with neither field set.
// Blocking deletion while any event (active or cancelled) still references this venue closes
// that gap without needing a backfill flow.
export class VenueInUseError extends Error {
  constructor() {
    super("Cannot delete a venue that events still reference");
  }
}

export interface CreateVenueData {
  communityId: string;
  name: string;
  address?: string;
  mapUrl?: string;
}

export async function create(data: CreateVenueData): Promise<Venue> {
  const now = Math.floor(Date.now() / 1000);
  const [venue] = await db
    .insert(venues)
    .values({
      id: randomUUID(),
      communityId: data.communityId,
      name: data.name,
      address: data.address ?? null,
      mapUrl: data.mapUrl ?? null,
      createdAt: now,
    })
    .returning();
  return venue!;
}

export async function get(id: string): Promise<Venue | null> {
  const rows = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function list(communityId: string): Promise<Venue[]> {
  return db.select().from(venues).where(eq(venues.communityId, communityId));
}

export async function remove(id: string, communityId: string): Promise<void> {
  const existing = await get(id);
  if (!existing || existing.communityId !== communityId) throw new VenueNotFoundError(id);

  const [referencingEvent] = await db.select({ id: events.id }).from(events).where(eq(events.venueId, id)).limit(1);
  if (referencingEvent) throw new VenueInUseError();

  await db.delete(venues).where(and(eq(venues.id, id), eq(venues.communityId, communityId)));
}
