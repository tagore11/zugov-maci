import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { communityDiscussions, type CommunityDiscussion } from "../db/schema.js";
import * as membershipService from "./membershipService.js";

export class DiscussionNotFoundError extends Error {
  constructor(id: string) {
    super(`Discussion "${id}" not found`);
  }
}

export class NotAuthorizedToPostError extends Error {
  constructor() {
    super("Not authorized to post discussions for this community");
  }
}

export class NotAuthorizedToEditError extends Error {
  constructor() {
    super("Not authorized to edit this discussion");
  }
}

export class NotAuthorizedToDeleteError extends Error {
  constructor() {
    super("Not authorized to delete this discussion");
  }
}

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D1) — mirrors
// eventService.ts's ViewableEvent: the DB stores eligibleTierIds as a JSON-stringified string[]
// (or SQL NULL for "unrestricted"), callers get it back as string[] | null.
export type ViewableDiscussion = Omit<CommunityDiscussion, "eligibleTierIds"> & { eligibleTierIds: string[] | null };

const deserialize = membershipService.deserializeEligibleTierIds<CommunityDiscussion>;

export interface CreateDiscussionData {
  communityId: string;
  authorAddress: string;
  title: string;
  body: string;
  eligibleTierIds?: string[] | null;
}

export async function create(data: CreateDiscussionData): Promise<ViewableDiscussion> {
  // Union-as-community merge (2026-08-28, D3/D10) — a union has zero membership tiers, so
  // hasTierPermission alone would lock out every active member community's admin.
  // canCreateCommunityContent branches to isAuthorizedForUnionContent for a union target.
  if (
    !(await membershipService.canCreateCommunityContent(data.communityId, data.authorAddress, "canPostDiscussions"))
  ) {
    throw new NotAuthorizedToPostError();
  }

  const now = Math.floor(Date.now() / 1000);
  const [inserted] = await db
    .insert(communityDiscussions)
    .values({
      id: randomUUID(),
      communityId: data.communityId,
      authorAddress: data.authorAddress,
      title: data.title,
      body: data.body,
      eligibleTierIds: membershipService.serializeEligibleTierIds(data.eligibleTierIds),
      createdAt: now,
    })
    .returning();
  return deserialize(inserted!);
}

async function get(id: string): Promise<CommunityDiscussion | null> {
  const rows = await db.select().from(communityDiscussions).where(eq(communityDiscussions.id, id)).limit(1);
  return rows[0] ?? null;
}

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D5, REVISED after
// outside-voice review) — member row OR admin, not member-row-only: a community's
// on-chain-reconciled owner (communityService.ts's reconcileCreatorAddress) can have real
// isAuthorized() admin authority (including delete-any-post power) with no memberships row ever
// inserted, and must not be walled out of the screen showing what they have authority over.
export async function isMemberOrAdmin(communityId: string, walletAddress: string): Promise<boolean> {
  const [isMember, isAdmin] = await Promise.all([
    membershipService.getMemberTier(communityId, walletAddress),
    membershipService.isAuthorized(communityId, walletAddress),
  ]);
  return isMember !== null || isAdmin;
}

export async function listForViewer(communityId: string, viewerAddress: string): Promise<ViewableDiscussion[]> {
  const rows = await db.select().from(communityDiscussions).where(eq(communityDiscussions.communityId, communityId));
  const ctx = await membershipService.resolveViewerContext(communityId, viewerAddress);
  return rows.filter((row) => membershipService.canViewRestricted(row, row.authorAddress, ctx)).map(deserialize);
}

export async function getForViewer(
  id: string,
  communityId: string,
  viewerAddress: string,
): Promise<ViewableDiscussion | null> {
  const row = await get(id);
  if (!row || row.communityId !== communityId) return null;
  const ctx = await membershipService.resolveViewerContext(communityId, viewerAddress);
  if (!membershipService.canViewRestricted(row, row.authorAddress, ctx)) return null;
  return deserialize(row);
}

export interface UpdateDiscussionData {
  title?: string;
  body?: string;
  eligibleTierIds?: string[] | null;
}

// Author-only (D3) — no admin edit path at all, unlike events' assertCanManageEvent. A member's
// own words are never silently rewritten by someone else.
export async function update(
  id: string,
  communityId: string,
  walletAddress: string,
  patch: UpdateDiscussionData,
): Promise<ViewableDiscussion> {
  const existing = await get(id);
  if (!existing || existing.communityId !== communityId) throw new DiscussionNotFoundError(id);
  if (existing.authorAddress.toLowerCase() !== walletAddress.toLowerCase()) throw new NotAuthorizedToEditError();

  const { eligibleTierIds, ...rest } = patch;
  const dbPatch =
    "eligibleTierIds" in patch
      ? { ...rest, eligibleTierIds: membershipService.serializeEligibleTierIds(eligibleTierIds) }
      : rest;

  const [updated] = await db
    .update(communityDiscussions)
    .set(dbPatch)
    .where(eq(communityDiscussions.id, id))
    .returning();
  return deserialize(updated!);
}

// Author OR admin (D3) — mirrors assertCanManageEvent's admin-delete-any authority, applied here
// to delete only (edit stays author-only, see update() above).
export async function remove(id: string, communityId: string, walletAddress: string): Promise<void> {
  const existing = await get(id);
  if (!existing || existing.communityId !== communityId) throw new DiscussionNotFoundError(id);

  const isAuthor = existing.authorAddress.toLowerCase() === walletAddress.toLowerCase();
  if (!isAuthor && !(await membershipService.isAuthorized(communityId, walletAddress))) {
    throw new NotAuthorizedToDeleteError();
  }

  await db
    .delete(communityDiscussions)
    .where(and(eq(communityDiscussions.id, id), eq(communityDiscussions.communityId, communityId)));
}
