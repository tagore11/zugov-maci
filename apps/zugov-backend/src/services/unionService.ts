import { randomUUID } from "node:crypto";
import { eq, and, inArray, count } from "drizzle-orm";
import { db } from "../db/client.js";
import { unions, unionMemberships, type Union, type UnionMembership } from "../db/schema.js";
import { get as getCommunity, getAuthorizedCommunityIds } from "./communityService.js";

export class UnionNotFoundError extends Error {
  constructor(id: string) {
    super(`Union "${id}" not found`);
  }
}

export class CommunityNotFoundError extends Error {
  constructor(id: string) {
    super(`Community "${id}" not found`);
  }
}

export class DuplicateInviteError extends Error {
  constructor() {
    super("This community is already a member of, or already invited to, this union");
  }
}

export class MembershipNotFoundError extends Error {
  constructor() {
    super("No pending invite found for this community and union");
  }
}

export class NotActiveMemberError extends Error {
  constructor() {
    super("This community is not an active member of this union");
  }
}

export interface CreateUnionData {
  displayName: string;
  description?: string;
  logo?: string;
  creatorAddress: string;
  foundingCommunityId: string;
}

// The union's own founding community joins as "active" directly — it doesn't invite itself,
// mirroring how a community's own creator is enrolled as a member at identity-creation time
// rather than going through a join-request flow.
export async function create(data: CreateUnionData): Promise<Union> {
  const foundingCommunity = await getCommunity(data.foundingCommunityId);
  if (!foundingCommunity) throw new CommunityNotFoundError(data.foundingCommunityId);

  const now = Math.floor(Date.now() / 1000);
  const id = randomUUID();

  const [union] = await db
    .insert(unions)
    .values({
      id,
      displayName: data.displayName,
      description: data.description ?? null,
      logo: data.logo ?? null,
      creatorAddress: data.creatorAddress,
      createdAt: now,
    })
    .returning();

  await db.insert(unionMemberships).values({
    unionId: id,
    communityId: data.foundingCommunityId,
    status: "active",
    invitedByAddress: data.creatorAddress,
    requestedAt: now,
    respondedAt: now,
  });

  return union!;
}

export async function get(id: string): Promise<Union | null> {
  const rows = await db.select().from(unions).where(eq(unions.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface UnionWithMemberCount extends Union {
  memberCount: number;
}

// Public browse-all listing (Union communities follow-ups: "A page to browse all unions, not
// just the ones a given community belongs to") — no auth required, same posture as
// communityService.list(). memberCount is active-only, matching listMembers()'s public default;
// pending/declined/left member counts aren't exposed here.
export async function listAll(
  page: number,
  limit: number,
): Promise<{ unions: UnionWithMemberCount[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db.select().from(unions).orderBy(unions.createdAt).limit(limit).offset(offset),
    db.select({ value: count() }).from(unions),
  ]);

  const total = Number(totalRows[0]?.value ?? 0);
  if (rows.length === 0) return { unions: [], total, hasMore: false };

  const memberCounts = await db
    .select({ unionId: unionMemberships.unionId, value: count() })
    .from(unionMemberships)
    .where(
      and(
        inArray(
          unionMemberships.unionId,
          rows.map((u) => u.id),
        ),
        eq(unionMemberships.status, "active"),
      ),
    )
    .groupBy(unionMemberships.unionId);
  const countByUnionId = new Map(memberCounts.map((row) => [row.unionId, Number(row.value)]));

  return {
    unions: rows.map((union) => ({ ...union, memberCount: countByUnionId.get(union.id) ?? 0 })),
    total,
    hasMore: offset + rows.length < total,
  };
}

// Proposes a community join a union. A community declined once can be re-invited — invite()
// resets a "declined" row back to "pending" rather than being permanently blocked (Architecture
// decision 6). "pending" or "active" rows reject with DuplicateInviteError — no re-inviting a
// community that's already in the union or already has an open invite.
export async function invite(unionId: string, communityId: string, invitedByAddress: string): Promise<UnionMembership> {
  const union = await get(unionId);
  if (!union) throw new UnionNotFoundError(unionId);

  const community = await getCommunity(communityId);
  if (!community) throw new CommunityNotFoundError(communityId);

  const now = Math.floor(Date.now() / 1000);
  const [existing] = await db
    .select()
    .from(unionMemberships)
    .where(and(eq(unionMemberships.unionId, unionId), eq(unionMemberships.communityId, communityId)))
    .limit(1);

  if (existing) {
    if (existing.status !== "declined" && existing.status !== "left") throw new DuplicateInviteError();
    const [updated] = await db
      .update(unionMemberships)
      .set({ status: "pending", invitedByAddress, requestedAt: now, respondedAt: null, leftAt: null })
      .where(and(eq(unionMemberships.unionId, unionId), eq(unionMemberships.communityId, communityId)))
      .returning();
    return updated!;
  }

  const [created] = await db
    .insert(unionMemberships)
    .values({ unionId, communityId, status: "pending", invitedByAddress, requestedAt: now, respondedAt: null })
    .returning();
  return created!;
}

// Accept/decline — only the INVITED community's own admin may call this (checked by the route,
// via isAuthorized(communityId, caller), never the inviter). Rejects a non-pending membership
// (already active/declined/nonexistent) rather than silently no-op-ing.
export async function respond(unionId: string, communityId: string, accept: boolean): Promise<UnionMembership> {
  const now = Math.floor(Date.now() / 1000);
  const [existing] = await db
    .select()
    .from(unionMemberships)
    .where(and(eq(unionMemberships.unionId, unionId), eq(unionMemberships.communityId, communityId)))
    .limit(1);

  if (!existing || existing.status !== "pending") throw new MembershipNotFoundError();

  const [updated] = await db
    .update(unionMemberships)
    .set({ status: accept ? "active" : "declined", respondedAt: now })
    .where(and(eq(unionMemberships.unionId, unionId), eq(unionMemberships.communityId, communityId)))
    .returning();
  return updated!;
}

// Self-service only — checked by the route via isAuthorized(communityId, caller), same as
// respond(). No "kick another member out" path exists; a community leaves on its own behalf.
// Only an "active" row can leave (mirrors respond()'s "only pending can respond" guard) — a
// community that's already left, declined, or was never invited has nothing to leave. Leaving
// doesn't delete the row (keeps requestedAt/respondedAt as the original invite/accept history);
// invite() already treats "left" the same as "declined" for re-inviting.
export async function leave(unionId: string, communityId: string): Promise<UnionMembership> {
  const now = Math.floor(Date.now() / 1000);
  const [existing] = await db
    .select()
    .from(unionMemberships)
    .where(and(eq(unionMemberships.unionId, unionId), eq(unionMemberships.communityId, communityId)))
    .limit(1);

  if (!existing || existing.status !== "active") throw new NotActiveMemberError();

  const [updated] = await db
    .update(unionMemberships)
    .set({ status: "left", leftAt: now })
    .where(and(eq(unionMemberships.unionId, unionId), eq(unionMemberships.communityId, communityId)))
    .returning();
  return updated!;
}

export interface UnionMemberSummary {
  communityId: string;
  displayName: string;
  logo: string | null;
  status: "pending" | "active";
}

// Active-only by default (public browsing); includePending is gated by the route to callers
// already authorized on the union (any active member) — pending invites aren't public.
export async function listMembers(unionId: string, includePending = false): Promise<UnionMemberSummary[]> {
  const statuses: ("pending" | "active")[] = includePending ? ["pending", "active"] : ["active"];
  const membershipRows = await db
    .select()
    .from(unionMemberships)
    .where(and(eq(unionMemberships.unionId, unionId), inArray(unionMemberships.status, statuses)));

  const communities = await Promise.all(membershipRows.map((row) => getCommunity(row.communityId)));

  return membershipRows.map((row, i) => ({
    communityId: row.communityId,
    displayName: communities[i]?.displayName ?? "Unknown community",
    logo: communities[i]?.logo ?? null,
    status: row.status as "pending" | "active",
  }));
}

export interface MyPendingUnionInvite {
  unionId: string;
  unionDisplayName: string;
  communityId: string;
  communityDisplayName: string;
}

// Every pending union invite across every community the caller is authorized on — one query,
// not N (community page redesign, /plan-eng-review 2026-08-26, D2). Session-derived only; never
// takes an address as free-form input, which is what makes this safe to expose without leaking
// another wallet's pending invites (unlike the query-param design this replaced during review).
// Powers both the /unions listing page's per-row badge and manage-profile's "Awaiting Your
// Action" card (replacing that page's own N+1 loop + page-1-only pagination bug).
export async function listMyPendingInvites(address: string): Promise<MyPendingUnionInvite[]> {
  const authorizedIds = await getAuthorizedCommunityIds(address);
  if (authorizedIds.length === 0) return [];

  const rows = await db
    .select()
    .from(unionMemberships)
    .where(and(inArray(unionMemberships.communityId, authorizedIds), eq(unionMemberships.status, "pending")));
  if (rows.length === 0) return [];

  const [unionRows, communityRecords] = await Promise.all([
    db
      .select()
      .from(unions)
      .where(
        inArray(
          unions.id,
          rows.map((r) => r.unionId),
        ),
      ),
    Promise.all(rows.map((r) => getCommunity(r.communityId))),
  ]);
  const unionsById = new Map(unionRows.map((u) => [u.id, u]));

  return rows
    .map((row, i) => {
      const union = unionsById.get(row.unionId);
      const community = communityRecords[i];
      if (!union || !community) return null;
      return {
        unionId: union.id,
        unionDisplayName: union.displayName,
        communityId: row.communityId,
        communityDisplayName: community.displayName,
      };
    })
    .filter((entry): entry is MyPendingUnionInvite => entry !== null);
}

export interface UnionForCommunity {
  id: string;
  displayName: string;
  logo: string | null;
  status: "pending" | "active";
}

// Unions this community belongs to or has a pending invite for (declined unions are excluded —
// no reason to keep surfacing a relationship the community turned down). Powers the community
// detail page's "Unions" section, including the "Invited — awaiting response" state.
//
// includePending defaults to false and must be gated by the route (isAuthorized(communityId,
// caller)) before passing true — pending invites aren't public, same posture as
// listMembers()'s includePending. Fixed 2026-08-26: this previously always included pending
// status with no gating at all, letting any unauthenticated caller see a community's pending
// union invites via GET /api/communities/:id/unions.
export async function listForCommunity(communityId: string, includePending = false): Promise<UnionForCommunity[]> {
  const statuses: ("pending" | "active")[] = includePending ? ["pending", "active"] : ["active"];
  const membershipRows = await db
    .select()
    .from(unionMemberships)
    .where(and(eq(unionMemberships.communityId, communityId), inArray(unionMemberships.status, statuses)));

  if (membershipRows.length === 0) return [];

  const unionRows = await db
    .select()
    .from(unions)
    .where(
      inArray(
        unions.id,
        membershipRows.map((row) => row.unionId),
      ),
    );
  const unionsById = new Map(unionRows.map((u) => [u.id, u]));

  return membershipRows
    .map((row) => {
      const union = unionsById.get(row.unionId);
      if (!union) return null;
      return {
        id: union.id,
        displayName: union.displayName,
        logo: union.logo,
        status: row.status as "pending" | "active",
      };
    })
    .filter((entry): entry is UnionForCommunity => entry !== null);
}
