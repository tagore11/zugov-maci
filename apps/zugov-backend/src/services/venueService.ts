import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { venues, type Venue } from "../db/schema.js";

export class VenueNotFoundError extends Error {
  constructor(id: string) {
    super(`Venue "${id}" not found`);
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
