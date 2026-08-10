import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { communities, memberships, membershipTiers, joinRequests, type MembershipTier } from "../db/schema.js";
import type { TierBody } from "../validators/membershipSchema.js";

export class TierChangesRequireVoteError extends Error {
  constructor() {
    super("This community's tier changes require a community vote, which is not yet available");
  }
}

export class TierInUseError extends Error {
  constructor() {
    super("Cannot delete a tier that has members assigned, or the community's default tier");
  }
}

export class DuplicateJoinError extends Error {
  constructor() {
    super("Already a member or already have a pending request for this community");
  }
}

export class RequestNotFoundError extends Error {
  constructor() {
    super("Join request not found or already resolved");
  }
}

/**
 * Creator/owner (Community.creatorAddress) always has this authority, regardless of tier
 * configuration; a member holding a tier with canManageMembership: true also has it.
 * Clarifications, spec.md FR-008.
 */
export async function isAuthorized(communityId: string, walletAddress: string): Promise<boolean> {
  const [community] = await db
    .select({ creatorAddress: communities.creatorAddress })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);
  if (!community) return false;
  if (community.creatorAddress.toLowerCase() === walletAddress.toLowerCase()) return true;

  const rows = await db
    .select({ canManageMembership: membershipTiers.canManageMembership })
    .from(memberships)
    .innerJoin(membershipTiers, eq(memberships.tierId, membershipTiers.id))
    .where(and(eq(memberships.walletAddress, walletAddress), eq(memberships.communityId, communityId)))
    .limit(1);

  return rows[0]?.canManageMembership ?? false;
}

/**
 * Reads a member's current tier and checks a single permission flag on it — the same join
 * shape as isAuthorized's canManageMembership check, parameterized over which column to read.
 */
export async function hasTierPermission(
  communityId: string,
  walletAddress: string,
  permission: "canCreateGovernanceActions" | "canVote",
): Promise<boolean> {
  const rows = await db
    .select({
      canCreateGovernanceActions: membershipTiers.canCreateGovernanceActions,
      canVote: membershipTiers.canVote,
    })
    .from(memberships)
    .innerJoin(membershipTiers, eq(memberships.tierId, membershipTiers.id))
    .where(and(eq(memberships.walletAddress, walletAddress), eq(memberships.communityId, communityId)))
    .limit(1);

  return rows[0]?.[permission] ?? false;
}

export async function createTiersForCommunity(
  communityId: string,
  tiers: TierBody[],
  defaultTierLabel: string,
): Promise<{ defaultTierId: string; creatorTierId: string }> {
  const now = Math.floor(Date.now() / 1000);
  const rows = tiers.map((tier) => ({
    id: randomUUID(),
    communityId,
    label: tier.label,
    canCreateGovernanceActions: tier.canCreateGovernanceActions,
    canVote: tier.canVote,
    canManageMembership: tier.canManageMembership,
    canDelegate: tier.canDelegate,
    canBeDelegatedTo: tier.canBeDelegatedTo,
    createdAt: now,
  }));
  const inserted = await db.insert(membershipTiers).values(rows).returning();
  const defaultTier = inserted.find((row) => row.label === defaultTierLabel);
  if (!defaultTier) {
    throw new Error(`defaultTierLabel "${defaultTierLabel}" does not match any provided tier`);
  }

  // The creator gets full authority in their own community regardless of which tier new
  // members land in by default (specs/004 Assumptions: "the creating admin is automatically
  // assigned the Admin tier... regardless of [defaultTierLabel]") — assign them the tier with
  // every permission enabled, preferring one literally labeled "Admin" if several qualify, and
  // falling back to the default tier only if no full-permission tier exists at all.
  const fullPermissionTiers = inserted.filter(
    (row) => row.canCreateGovernanceActions && row.canVote && row.canManageMembership,
  );
  const creatorTier = fullPermissionTiers.find((row) => row.label === "Admin") ?? fullPermissionTiers[0] ?? defaultTier;

  return { defaultTierId: defaultTier.id, creatorTierId: creatorTier.id };
}

export async function listTiers(communityId: string): Promise<MembershipTier[]> {
  return db.select().from(membershipTiers).where(eq(membershipTiers.communityId, communityId));
}

export async function listTiersWithDefault(communityId: string): Promise<(MembershipTier & { isDefault: boolean })[]> {
  const [tiers, [community]] = await Promise.all([
    listTiers(communityId),
    db
      .select({ defaultTierId: communities.defaultTierId })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1),
  ]);
  return tiers.map((tier) => ({ ...tier, isDefault: tier.id === community?.defaultTierId }));
}

export async function assertTierChangesAllowed(communityId: string): Promise<void> {
  const [community] = await db
    .select({ tierChangesRequireVote: communities.tierChangesRequireVote })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);
  if (community?.tierChangesRequireVote) {
    throw new TierChangesRequireVoteError();
  }
}

export async function updateTier(
  communityId: string,
  tierId: string,
  patch: Partial<TierBody>,
): Promise<MembershipTier> {
  await assertTierChangesAllowed(communityId);
  const [updated] = await db
    .update(membershipTiers)
    .set(patch)
    .where(and(eq(membershipTiers.id, tierId), eq(membershipTiers.communityId, communityId)))
    .returning();
  if (!updated) throw new Error("Tier not found");
  return updated;
}

export async function deleteTier(communityId: string, tierId: string): Promise<void> {
  await assertTierChangesAllowed(communityId);

  const [community] = await db
    .select({ defaultTierId: communities.defaultTierId })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);
  if (community?.defaultTierId === tierId) {
    throw new TierInUseError();
  }

  const memberRows = await db
    .select({ walletAddress: memberships.walletAddress })
    .from(memberships)
    .where(eq(memberships.tierId, tierId))
    .limit(1);
  if (memberRows.length > 0) {
    throw new TierInUseError();
  }

  await db
    .delete(membershipTiers)
    .where(and(eq(membershipTiers.id, tierId), eq(membershipTiers.communityId, communityId)));
}

export async function getMembershipStatus(
  communityId: string,
  walletAddress: string,
): Promise<{ status: "member" | "pending" | "none"; tierLabel?: string }> {
  const [membership] = await db
    .select({ label: membershipTiers.label })
    .from(memberships)
    .innerJoin(membershipTiers, eq(memberships.tierId, membershipTiers.id))
    .where(and(eq(memberships.walletAddress, walletAddress), eq(memberships.communityId, communityId)))
    .limit(1);
  if (membership) return { status: "member", tierLabel: membership.label };

  const [pendingRequest] = await db
    .select({ id: joinRequests.id })
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.walletAddress, walletAddress),
        eq(joinRequests.communityId, communityId),
        eq(joinRequests.status, "pending"),
      ),
    )
    .limit(1);
  if (pendingRequest) return { status: "pending" };

  return { status: "none" };
}

export async function submitJoinRequest(
  communityId: string,
  walletAddress: string,
): Promise<{ status: "approved" | "pending"; tierLabel?: string }> {
  const [existingMembership] = await db
    .select({ walletAddress: memberships.walletAddress })
    .from(memberships)
    .where(and(eq(memberships.walletAddress, walletAddress), eq(memberships.communityId, communityId)))
    .limit(1);
  if (existingMembership) throw new DuplicateJoinError();

  const [pendingRequest] = await db
    .select({ id: joinRequests.id })
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.walletAddress, walletAddress),
        eq(joinRequests.communityId, communityId),
        eq(joinRequests.status, "pending"),
      ),
    )
    .limit(1);
  if (pendingRequest) throw new DuplicateJoinError();

  const [community] = await db
    .select({ membershipPolicy: communities.membershipPolicy, defaultTierId: communities.defaultTierId })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);
  if (!community?.defaultTierId) {
    throw new Error("Community has no default tier configured");
  }

  const now = Math.floor(Date.now() / 1000);

  if (community.membershipPolicy === "open") {
    await db.insert(memberships).values({ walletAddress, communityId, tierId: community.defaultTierId, joinedAt: now });
    const [tier] = await db
      .select({ label: membershipTiers.label })
      .from(membershipTiers)
      .where(eq(membershipTiers.id, community.defaultTierId))
      .limit(1);
    return { status: "approved", tierLabel: tier?.label };
  }

  await db.insert(joinRequests).values({
    id: randomUUID(),
    communityId,
    walletAddress,
    status: "pending",
    createdAt: now,
    resolvedAt: null,
  });
  return { status: "pending" };
}

export async function listPendingRequests(
  communityId: string,
): Promise<{ id: string; walletAddress: string; createdAt: number }[]> {
  return db
    .select({ id: joinRequests.id, walletAddress: joinRequests.walletAddress, createdAt: joinRequests.createdAt })
    .from(joinRequests)
    .where(and(eq(joinRequests.communityId, communityId), eq(joinRequests.status, "pending")));
}

async function getPendingRequest(requestId: string) {
  const [request] = await db
    .select()
    .from(joinRequests)
    .where(and(eq(joinRequests.id, requestId), eq(joinRequests.status, "pending")))
    .limit(1);
  if (!request) throw new RequestNotFoundError();
  return request;
}

export async function approveRequest(requestId: string): Promise<void> {
  const request = await getPendingRequest(requestId);

  const [community] = await db
    .select({ defaultTierId: communities.defaultTierId })
    .from(communities)
    .where(eq(communities.id, request.communityId))
    .limit(1);
  if (!community?.defaultTierId) {
    throw new Error("Community has no default tier configured");
  }

  const now = Math.floor(Date.now() / 1000);
  await db.insert(memberships).values({
    walletAddress: request.walletAddress,
    communityId: request.communityId,
    tierId: community.defaultTierId,
    joinedAt: now,
  });
  await db.update(joinRequests).set({ status: "approved", resolvedAt: now }).where(eq(joinRequests.id, requestId));
}

export async function rejectRequest(requestId: string): Promise<void> {
  await getPendingRequest(requestId);
  const now = Math.floor(Date.now() / 1000);
  await db.update(joinRequests).set({ status: "rejected", resolvedAt: now }).where(eq(joinRequests.id, requestId));
}
