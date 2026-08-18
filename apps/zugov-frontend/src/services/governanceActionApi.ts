const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export type GovernanceActionPrivacy = "public" | "privacy_preserving";
export type GovernanceActionExecutionLocation = "onchain" | "offchain" | "hybrid";
export type GovernanceActionTallyMechanism = "simple" | "quadratic" | "ranked" | "weighted" | "full";
export type GovernanceActionStatus = "draft" | "formalized";

export type GovernanceActionCreationPath = "draft" | "direct";

export type TallyStatus = "not_started" | "pending" | "processing" | "completed" | "failed";

export interface GovernanceAction {
  id: string;
  communityId: string;
  type: "poll";
  title: string;
  description: string;
  privacy: GovernanceActionPrivacy;
  executionLocation: GovernanceActionExecutionLocation;
  tallyMechanism: GovernanceActionTallyMechanism;
  eligibleTierIds: string[];
  status: GovernanceActionStatus;
  creationPath: GovernanceActionCreationPath;
  creatorAddress: string;
  pollAddress: string | null;
  pollId: string | null;
  pollStartDate: number | null;
  pollEndDate: number | null;
  createdAt: number;
  formalizedAt: number | null;
  tallyStatus: TallyStatus;
  tallyError: string | null;
  tallyRequestedAt: number | null;
  tallyCompletedAt: number | null;
  tallyResult: string | null;
}

export type GovernanceActionWithMeta = GovernanceAction & { sponsorCount: number; thresholdMet: boolean };

export interface CreateDraftInput {
  title: string;
  description: string;
  privacy: GovernanceActionPrivacy;
  executionLocation: GovernanceActionExecutionLocation;
  tallyMechanism: GovernanceActionTallyMechanism;
  eligibleTierIds: string[];
}

async function parseErrorOr<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? fallback);
  }
  return res.json() as Promise<T>;
}

export async function createDraft(
  communityId: string,
  input: CreateDraftInput,
): Promise<{ governanceAction: GovernanceAction; sponsorCount: number; thresholdMet: boolean }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseErrorOr(res, `Failed to create draft: ${res.status}`);
}

export async function list(communityId: string): Promise<{ governanceActions: GovernanceActionWithMeta[] }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to list governance actions: ${res.status}`);
}

export async function get(
  communityId: string,
  actionId: string,
): Promise<{ governanceAction: GovernanceAction; sponsorCount: number; thresholdMet: boolean }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions/${actionId}`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to fetch governance action: ${res.status}`);
}

export async function sponsor(
  communityId: string,
  actionId: string,
): Promise<{ sponsorCount: number; thresholdMet: boolean }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions/${actionId}/sponsor`, {
    method: "POST",
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to sponsor: ${res.status}`);
}

export async function authorizeFormalize(communityId: string, actionId: string): Promise<{ authorized: true }> {
  const res = await fetch(
    `${BASE_URL}/api/communities/${communityId}/governance-actions/${actionId}/formalize/authorize`,
    { method: "POST", credentials: "include" },
  );
  return parseErrorOr(res, `Failed to authorize formalization: ${res.status}`);
}

export async function confirmFormalize(
  communityId: string,
  actionId: string,
  input: { pollAddress: string; pollId: string; txHash: string; pollStartDate: number; pollEndDate: number },
): Promise<{ governanceAction: GovernanceAction }> {
  const res = await fetch(
    `${BASE_URL}/api/communities/${communityId}/governance-actions/${actionId}/formalize/confirm`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );
  return parseErrorOr(res, `Failed to confirm formalization: ${res.status}`);
}

export interface DirectDeployInput {
  title: string;
  description: string;
  privacy: GovernanceActionPrivacy;
  executionLocation: GovernanceActionExecutionLocation;
  tallyMechanism: GovernanceActionTallyMechanism;
  eligibleTierIds: string[];
}

export async function authorizeDirect(communityId: string, input: DirectDeployInput): Promise<{ authorized: true }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions/direct/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseErrorOr(res, `Failed to authorize direct deployment: ${res.status}`);
}

export async function confirmDirect(
  communityId: string,
  input: DirectDeployInput & {
    pollAddress: string;
    pollId: string;
    txHash: string;
    pollStartDate: number;
    pollEndDate: number;
  },
): Promise<{ governanceAction: GovernanceAction }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions/direct/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseErrorOr(res, `Failed to confirm direct deployment: ${res.status}`);
}

export async function triggerTally(communityId: string, actionId: string): Promise<{ tallyStatus: TallyStatus }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions/${actionId}/tally`, {
    method: "POST",
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to trigger tallying: ${res.status}`);
}

export async function getTallyStatus(
  communityId: string,
  actionId: string,
): Promise<
  Pick<GovernanceAction, "tallyStatus" | "tallyError" | "tallyRequestedAt" | "tallyCompletedAt" | "tallyResult">
> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/governance-actions/${actionId}/tally`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to fetch tally status: ${res.status}`);
}

export type VoteEligibilityReason =
  | "tier_lacks_voting_rights"
  | "tier_not_eligible_for_action"
  | "not_formalized"
  | "poll_closed";

export async function checkVoteEligibility(
  communityId: string,
  actionId: string,
): Promise<{ eligible: boolean; reason?: VoteEligibilityReason }> {
  const res = await fetch(
    `${BASE_URL}/api/communities/${communityId}/governance-actions/${actionId}/vote-eligibility`,
    { credentials: "include" },
  );
  return parseErrorOr(res, `Failed to check vote eligibility: ${res.status}`);
}
