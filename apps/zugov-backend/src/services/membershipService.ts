import { randomUUID } from "node:crypto";
import { eq, and, inArray, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  communities,
  memberships,
  membershipTiers,
  joinRequests,
  eligibilityRules,
  type MembershipTier,
} from "../db/schema.js";
import type { TierBody } from "../validators/membershipSchema.js";
import { evaluateEligibilityAcrossUnion } from "./eligibilityService.js";

export class TierChangesRequireVoteError extends Error {
  constructor() {
    super("This community's tier changes require a community vote, which is not yet available");
  }
}

export class TierInUseError extends Error {
  constructor() {
    super(
      "Cannot delete a tier that has members assigned, is the community's default tier, or is targeted by an eligibility rule",
    );
  }
}

export class NotEligibleError extends Error {
  constructor(reason?: string) {
    super(reason ?? "Does not meet this community's eligibility requirements");
  }
}

export class DuplicateJoinError extends Error {
  constructor() {
    super("Already a member or already have a pending request for this community");
  }
}

// Distinct from NotEligibleError: allowJoin gates whether joining is possible AT ALL (independent
// of eligibility rules), so a caller needs to tell "you don't meet the eligibility criteria" apart
// from "this community isn't accepting members right now" — different messages, different next
// steps for the user.
export class JoinNotAllowedError extends Error {
  constructor() {
    super("This community is not currently accepting new members");
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
  permission: "canCreateProposals" | "canVote" | "canCreateEvents",
): Promise<boolean> {
  const rows = await db
    .select({
      canCreateProposals: membershipTiers.canCreateProposals,
      canVote: membershipTiers.canVote,
      canCreateEvents: membershipTiers.canCreateEvents,
    })
    .from(memberships)
    .innerJoin(membershipTiers, eq(memberships.tierId, membershipTiers.id))
    .where(and(eq(memberships.walletAddress, walletAddress), eq(memberships.communityId, communityId)))
    .limit(1);

  return rows[0]?.[permission] ?? false;
}

/**
 * Batched membership check for a candidate list of addresses (governance restructure Phase 2,
 * 2026-08-20) — used to validate "person"-type (election) proposal options against real
 * community members without an N+1 loop. A single query, not one lookup per address.
 *
 * Case-insensitive: normalizes both the submitted addresses and the stored column to lowercase
 * before comparing. Every other address comparison in this file relies on the caller already
 * passing a consistently-cased address (established over time); this is a genuinely new
 * candidate-address surface (an election's member picker) with no such precedent to lean on, so
 * it normalizes explicitly rather than assuming.
 */
export async function listMembersByAddresses(communityId: string, walletAddresses: string[]): Promise<string[]> {
  if (walletAddresses.length === 0) return [];
  const normalized = [...new Set(walletAddresses.map((address) => address.toLowerCase()))];

  const rows = await db
    .select({ walletAddress: memberships.walletAddress })
    .from(memberships)
    .where(
      and(eq(memberships.communityId, communityId), inArray(sql`lower(${memberships.walletAddress})`, normalized)),
    );

  return rows.map((row) => row.walletAddress.toLowerCase());
}

/**
 * Full member listing for a community (governance restructure Phase 2, 2026-08-20) — feeds the
 * person-type (election) proposal creation UI's member picker. Gated on membership at the route
 * level (GET /:id/members, routes/membership.ts) — wallet addresses aren't a public directory,
 * but any member (not just admins) needs this to pick election candidates.
 */
export async function listMembers(communityId: string): Promise<{ walletAddress: string; tierLabel: string }[]> {
  return db
    .select({ walletAddress: memberships.walletAddress, tierLabel: membershipTiers.label })
    .from(memberships)
    .innerJoin(membershipTiers, eq(memberships.tierId, membershipTiers.id))
    .where(eq(memberships.communityId, communityId));
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
    canCreateProposals: tier.canCreateProposals,
    canVote: tier.canVote,
    canManageMembership: tier.canManageMembership,
    canDelegate: tier.canDelegate,
    canBeDelegatedTo: tier.canBeDelegatedTo,
    canCreateEvents: tier.canCreateEvents,
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
    (row) => row.canCreateProposals && row.canVote && row.canManageMembership && row.canCreateEvents,
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

  // Eligibility-adapters review (2026-08-19), D8 — a tier targeted by an eligibility rule
  // (eligibilityRules.targetTierId) can't be deleted either; the FK itself has no ON DELETE
  // behavior set specifically so this app-level guard is the primary protection, not a backstop.
  const targetingRules = await db
    .select({ id: eligibilityRules.id })
    .from(eligibilityRules)
    .where(eq(eligibilityRules.targetTierId, tierId))
    .limit(1);
  if (targetingRules.length > 0) {
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
    .select({
      membershipPolicy: communities.membershipPolicy,
      defaultTierId: communities.defaultTierId,
      allowJoin: communities.allowJoin,
    })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);
  if (!community?.defaultTierId) {
    throw new Error("Community has no default tier configured");
  }

  // Checked before eligibility evaluation, not after — allowJoin=false means joining isn't
  // possible at all, so there's no reason to spend a (potentially expensive) eligibility ruleset
  // evaluation on a request that was always going to be blocked (formalize-communities epic,
  // Child C1, /plan-eng-review 2026-08-24).
  if (!community.allowJoin) throw new JoinNotAllowedError();

  // Eligibility-adapters review (2026-08-19), D2/D2b — eligibility gates whether a wallet may
  // join at all AND resolves which tier it lands in; membershipPolicy (open/approval) is a
  // separate, orthogonal layer applied AFTER eligibility passes (does joining need a human's
  // approval, not whether the wallet is allowed to join in the first place). Evaluated once,
  // here, at submission time — not re-evaluated later for the approval path (D7).
  // eligibility-followups review (2026-08-19), D1 — evaluateEligibilityAcrossUnion wraps
  // evaluateRuleset with a live union-eligibility fallback; behaves identically to the plain
  // evaluateRuleset call for any community with no active union membership.
  const evaluation = await evaluateEligibilityAcrossUnion(communityId, walletAddress);
  if (!evaluation.eligible) throw new NotEligibleError(evaluation.reason);
  const resolvedTierId = evaluation.tierId ?? community.defaultTierId;

  const now = Math.floor(Date.now() / 1000);

  if (community.membershipPolicy === "open") {
    await db.insert(memberships).values({ walletAddress, communityId, tierId: resolvedTierId, joinedAt: now });
    const [tier] = await db
      .select({ label: membershipTiers.label })
      .from(membershipTiers)
      .where(eq(membershipTiers.id, resolvedTierId))
      .limit(1);
    return { status: "approved", tierLabel: tier?.label };
  }

  await db.insert(joinRequests).values({
    id: randomUUID(),
    communityId,
    walletAddress,
    status: "pending",
    tierId: resolvedTierId,
    createdAt: now,
    resolvedAt: null,
  });
  return { status: "pending" };
}

/** Communities this wallet holds an approved membership in — used by the profile page's
 * "awaiting actions" section to know which communities' governance actions to check. */
export async function listMembershipsForWallet(walletAddress: string): Promise<{ communityId: string }[]> {
  return db
    .select({ communityId: memberships.communityId })
    .from(memberships)
    .where(eq(memberships.walletAddress, walletAddress));
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

  // Eligibility-adapters review (2026-08-19), D7 — the tier was already resolved at submission
  // time (submitJoinRequest) and stored on the request; approval never re-runs eligibility. The
  // defaultTierId fallback here is defensive only (a request submitted before this column
  // existed) and should not be hit for any request created after this change lands.
  let tierId = request.tierId;
  if (!tierId) {
    const [community] = await db
      .select({ defaultTierId: communities.defaultTierId })
      .from(communities)
      .where(eq(communities.id, request.communityId))
      .limit(1);
    if (!community?.defaultTierId) {
      throw new Error("Community has no default tier configured");
    }
    tierId = community.defaultTierId;
  }

  const now = Math.floor(Date.now() / 1000);
  await db.insert(memberships).values({
    walletAddress: request.walletAddress,
    communityId: request.communityId,
    tierId,
    joinedAt: now,
  });
  await db.update(joinRequests).set({ status: "approved", resolvedAt: now }).where(eq(joinRequests.id, requestId));
}

export async function rejectRequest(requestId: string): Promise<void> {
  await getPendingRequest(requestId);
  const now = Math.floor(Date.now() / 1000);
  await db.update(joinRequests).set({ status: "rejected", resolvedAt: now }).where(eq(joinRequests.id, requestId));
}
