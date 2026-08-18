import { randomUUID } from "node:crypto";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  communities,
  memberships,
  membershipTiers,
  governanceActions,
  governanceActionSponsors,
  type GovernanceAction,
} from "../db/schema.js";
import type { CreateDraftBody } from "../validators/governanceActionSchema.js";
import { isExecutableCombination } from "./governanceActionConstants.js";
import * as membershipService from "./membershipService.js";

export class NotAuthorizedToCreateError extends Error {
  constructor() {
    super("Not authorized to create governance actions");
  }
}

export class NonExecutableAxisCombinationError extends Error {
  constructor() {
    super("Axis combination not yet executable");
  }
}

export class IneligibleTiersError extends Error {
  public readonly invalidTierIds: string[];
  constructor(invalidTierIds: string[]) {
    super("Eligible tiers must grant voting rights");
    this.invalidTierIds = invalidTierIds;
  }
}

export class GovernanceActionNotFoundError extends Error {
  constructor() {
    super("Not found");
  }
}

export class NotAuthorizedToSponsorError extends Error {
  constructor() {
    super("Not authorized to sponsor");
  }
}

export class AlreadyFormalizedError extends Error {
  constructor() {
    super("Already formalized");
  }
}

export class CreatorNoLongerAuthorizedError extends Error {
  constructor() {
    super("Creator no longer authorized to create governance actions");
  }
}

export class ThresholdNotMetError extends Error {
  constructor() {
    super("Co-sponsorship threshold not met");
  }
}

export class DirectDeploymentDisabledError extends Error {
  constructor() {
    super("Direct deployment is not enabled for this community");
  }
}

export class DraftPathDisabledError extends Error {
  constructor() {
    super("Direct deployment is enabled for this community — drafts are not accepted");
  }
}

type ViewableGovernanceAction = Omit<GovernanceAction, "eligibleTierIds"> & { eligibleTierIds: string[] };

function deserialize(row: GovernanceAction): ViewableGovernanceAction {
  return { ...row, eligibleTierIds: JSON.parse(row.eligibleTierIds) as string[] };
}

async function getSponsorCount(governanceActionId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(governanceActionSponsors)
    .where(eq(governanceActionSponsors.governanceActionId, governanceActionId));
  return row?.count ?? 0;
}

async function getCosponsorshipThreshold(communityId: string): Promise<number> {
  const [community] = await db
    .select({ cosponsorshipThreshold: communities.cosponsorshipThreshold })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);
  return community?.cosponsorshipThreshold ?? 0;
}

async function getDirectDeploymentEnabled(communityId: string): Promise<boolean> {
  const [community] = await db
    .select({ directDeploymentEnabled: communities.directDeploymentEnabled })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);
  return community?.directDeploymentEnabled ?? false;
}

/** Shared by createDraft, authorizeDirect, and confirmDirect (research.md #2) — the eligibility rules
 * for who may create a governance action, and what it may contain, don't change based on which path
 * (draft vs. direct) creates it. */
async function validateTierAndAxis(communityId: string, creatorAddress: string, body: CreateDraftBody): Promise<void> {
  if (!(await membershipService.hasTierPermission(communityId, creatorAddress, "canCreateGovernanceActions"))) {
    throw new NotAuthorizedToCreateError();
  }

  if (!isExecutableCombination(body.privacy, body.executionLocation, body.tallyMechanism)) {
    throw new NonExecutableAxisCombinationError();
  }

  const tiers = await db
    .select({ id: membershipTiers.id, canVote: membershipTiers.canVote })
    .from(membershipTiers)
    .where(eq(membershipTiers.communityId, communityId));
  const tierById = new Map(tiers.map((t) => [t.id, t.canVote]));
  const invalidTierIds = body.eligibleTierIds.filter((id) => !tierById.get(id));
  if (invalidTierIds.length > 0) {
    throw new IneligibleTiersError(invalidTierIds);
  }
}

async function getMemberTier(
  communityId: string,
  walletAddress: string,
): Promise<{ tierId: string; canVote: boolean } | null> {
  const [row] = await db
    .select({ tierId: memberships.tierId, canVote: membershipTiers.canVote })
    .from(memberships)
    .innerJoin(membershipTiers, eq(memberships.tierId, membershipTiers.id))
    .where(and(eq(memberships.walletAddress, walletAddress), eq(memberships.communityId, communityId)))
    .limit(1);
  return row ?? null;
}

/** Once a poll is formalized, the real access gate is whatever eligibility policy was deployed
 * on-chain for it — mirrors confirmDirect's directEligibleTierIds, so the backend's coarse
 * vote-eligibility check doesn't keep enforcing the draft-time tier restriction against a poll
 * that may now be open to a different (e.g. broader) set of voters on-chain. */
async function getVotingTierIds(communityId: string): Promise<string[]> {
  const tiers = await db
    .select({ id: membershipTiers.id, canVote: membershipTiers.canVote })
    .from(membershipTiers)
    .where(eq(membershipTiers.communityId, communityId));
  return tiers.filter((t) => t.canVote).map((t) => t.id);
}

async function canView(action: ViewableGovernanceAction, viewerAddress: string): Promise<boolean> {
  if (action.creatorAddress.toLowerCase() === viewerAddress.toLowerCase()) return true;
  const tier = await getMemberTier(action.communityId, viewerAddress);
  if (!tier) return false;
  return action.eligibleTierIds.includes(tier.tierId);
}

export async function createDraft(
  communityId: string,
  creatorAddress: string,
  body: CreateDraftBody,
): Promise<{ governanceAction: ViewableGovernanceAction; sponsorCount: number; thresholdMet: boolean }> {
  if (await getDirectDeploymentEnabled(communityId)) {
    throw new DraftPathDisabledError();
  }
  await validateTierAndAxis(communityId, creatorAddress, body);

  const now = Math.floor(Date.now() / 1000);
  const id = randomUUID();

  const [inserted] = await db
    .insert(governanceActions)
    .values({
      id,
      communityId,
      type: "poll",
      title: body.title,
      description: body.description,
      privacy: body.privacy,
      executionLocation: body.executionLocation,
      tallyMechanism: body.tallyMechanism,
      eligibleTierIds: JSON.stringify(body.eligibleTierIds),
      status: "draft",
      creationPath: "draft",
      creatorAddress,
      pollAddress: null,
      pollId: null,
      createdAt: now,
      formalizedAt: null,
    })
    .returning();

  await db
    .insert(governanceActionSponsors)
    .values({ governanceActionId: id, walletAddress: creatorAddress, sponsoredAt: now });

  const threshold = await getCosponsorshipThreshold(communityId);
  return {
    governanceAction: deserialize(inserted!),
    sponsorCount: 1,
    thresholdMet: 1 >= threshold,
  };
}

export async function listForViewer(
  communityId: string,
  viewerAddress: string,
): Promise<(ViewableGovernanceAction & { sponsorCount: number; thresholdMet: boolean })[]> {
  const rows = await db.select().from(governanceActions).where(eq(governanceActions.communityId, communityId));
  const threshold = await getCosponsorshipThreshold(communityId);

  const viewable: (ViewableGovernanceAction & { sponsorCount: number; thresholdMet: boolean })[] = [];
  for (const row of rows) {
    const action = deserialize(row);
    if (!(await canView(action, viewerAddress))) continue;
    const sponsorCount = await getSponsorCount(action.id);
    viewable.push({ ...action, sponsorCount, thresholdMet: sponsorCount >= threshold });
  }
  return viewable;
}

export async function getForViewer(
  communityId: string,
  actionId: string,
  viewerAddress: string,
): Promise<(ViewableGovernanceAction & { sponsorCount: number; thresholdMet: boolean }) | null> {
  const [row] = await db
    .select()
    .from(governanceActions)
    .where(and(eq(governanceActions.id, actionId), eq(governanceActions.communityId, communityId)))
    .limit(1);
  if (!row) return null;

  const action = deserialize(row);
  if (!(await canView(action, viewerAddress))) return null;

  const sponsorCount = await getSponsorCount(action.id);
  const threshold = await getCosponsorshipThreshold(communityId);
  return { ...action, sponsorCount, thresholdMet: sponsorCount >= threshold };
}

async function getActionOrThrow(communityId: string, actionId: string): Promise<ViewableGovernanceAction> {
  const [row] = await db
    .select()
    .from(governanceActions)
    .where(and(eq(governanceActions.id, actionId), eq(governanceActions.communityId, communityId)))
    .limit(1);
  if (!row) throw new GovernanceActionNotFoundError();
  return deserialize(row);
}

export async function sponsor(
  communityId: string,
  actionId: string,
  walletAddress: string,
): Promise<{ sponsorCount: number; thresholdMet: boolean }> {
  const action = await getActionOrThrow(communityId, actionId);
  if (action.status !== "draft") throw new AlreadyFormalizedError();

  const tier = await getMemberTier(communityId, walletAddress);
  if (!tier || !tier.canVote || !action.eligibleTierIds.includes(tier.tierId)) {
    throw new NotAuthorizedToSponsorError();
  }

  const now = Math.floor(Date.now() / 1000);
  await db
    .insert(governanceActionSponsors)
    .values({ governanceActionId: actionId, walletAddress, sponsoredAt: now })
    .onConflictDoNothing();

  const sponsorCount = await getSponsorCount(actionId);
  const threshold = await getCosponsorshipThreshold(communityId);
  return { sponsorCount, thresholdMet: sponsorCount >= threshold };
}

async function assertReadyToFormalize(communityId: string, actionId: string): Promise<ViewableGovernanceAction> {
  const action = await getActionOrThrow(communityId, actionId);
  if (action.status !== "draft") throw new AlreadyFormalizedError();

  if (!(await membershipService.hasTierPermission(communityId, action.creatorAddress, "canCreateGovernanceActions"))) {
    throw new CreatorNoLongerAuthorizedError();
  }

  const sponsorCount = await getSponsorCount(actionId);
  const threshold = await getCosponsorshipThreshold(communityId);
  if (sponsorCount < threshold) throw new ThresholdNotMetError();

  return action;
}

export async function authorizeFormalize(communityId: string, actionId: string): Promise<{ authorized: true }> {
  await assertReadyToFormalize(communityId, actionId);
  return { authorized: true };
}

export async function confirmFormalize(
  communityId: string,
  actionId: string,
  result: { pollAddress: string; pollId: string; txHash: string; pollStartDate: number; pollEndDate: number },
): Promise<ViewableGovernanceAction> {
  await assertReadyToFormalize(communityId, actionId);

  const now = Math.floor(Date.now() / 1000);
  const eligibleTierIds = await getVotingTierIds(communityId);
  const [updated] = await db
    .update(governanceActions)
    .set({
      status: "formalized",
      pollAddress: result.pollAddress,
      pollId: result.pollId,
      pollStartDate: result.pollStartDate,
      pollEndDate: result.pollEndDate,
      eligibleTierIds: JSON.stringify(eligibleTierIds),
      formalizedAt: now,
    })
    .where(and(eq(governanceActions.id, actionId), eq(governanceActions.communityId, communityId)))
    .returning();

  return deserialize(updated!);
}

export async function authorizeDirect(
  communityId: string,
  creatorAddress: string,
  body: CreateDraftBody,
): Promise<{ authorized: true }> {
  if (!(await getDirectDeploymentEnabled(communityId))) {
    throw new DirectDeploymentDisabledError();
  }
  await validateTierAndAxis(communityId, creatorAddress, body);
  return { authorized: true };
}

export async function confirmDirect(
  communityId: string,
  creatorAddress: string,
  body: CreateDraftBody & {
    pollAddress: string;
    pollId: string;
    txHash: string;
    pollStartDate: number;
    pollEndDate: number;
  },
): Promise<ViewableGovernanceAction> {
  if (!(await getDirectDeploymentEnabled(communityId))) {
    throw new DirectDeploymentDisabledError();
  }
  await validateTierAndAxis(communityId, creatorAddress, body);

  const now = Math.floor(Date.now() / 1000);
  const id = randomUUID();

  const [inserted] = await db
    .insert(governanceActions)
    .values({
      id,
      communityId,
      type: "poll",
      title: body.title,
      description: body.description,
      privacy: body.privacy,
      executionLocation: body.executionLocation,
      tallyMechanism: body.tallyMechanism,
      eligibleTierIds: JSON.stringify(body.eligibleTierIds),
      status: "formalized",
      creationPath: "direct",
      creatorAddress,
      pollAddress: body.pollAddress,
      pollId: body.pollId,
      pollStartDate: body.pollStartDate,
      pollEndDate: body.pollEndDate,
      createdAt: now,
      formalizedAt: now,
    })
    .returning();

  return deserialize(inserted!);
}

export type VoteEligibilityReason =
  | "tier_lacks_voting_rights"
  | "tier_not_eligible_for_action"
  | "not_formalized"
  | "poll_closed";

export async function checkVoteEligibility(
  communityId: string,
  actionId: string,
  walletAddress: string,
): Promise<{ eligible: boolean; reason?: VoteEligibilityReason }> {
  const action = await getActionOrThrow(communityId, actionId);
  if (action.status !== "formalized") return { eligible: false, reason: "not_formalized" };

  const now = Math.floor(Date.now() / 1000);
  if (action.pollEndDate !== null && now >= action.pollEndDate) {
    return { eligible: false, reason: "poll_closed" };
  }

  const hasVotingRights = await membershipService.hasTierPermission(communityId, walletAddress, "canVote");
  if (!hasVotingRights) return { eligible: false, reason: "tier_lacks_voting_rights" };

  const tier = await getMemberTier(communityId, walletAddress);
  if (!tier || !action.eligibleTierIds.includes(tier.tierId)) {
    return { eligible: false, reason: "tier_not_eligible_for_action" };
  }

  return { eligible: true };
}
