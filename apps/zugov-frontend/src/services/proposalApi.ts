const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export type ProposalPrivacy = "public" | "privacy_preserving";
export type ProposalExecutionLocation = "onchain" | "offchain" | "hybrid";
export type ProposalVotingProtocolType = "simple" | "quadratic" | "ranked" | "weighted" | "full";
export type ProposalDecisionTargetType = "opinion" | "policy" | "person";
export type ProposalStatus = "draft" | "formalized";

export type ProposalCreationPath = "draft" | "direct";

export type TallyStatus = "not_started" | "pending" | "processing" | "completed" | "failed";

export interface Proposal {
  id: string;
  communityId: string;
  type: "poll";
  title: string;
  description: string;
  privacy: ProposalPrivacy;
  executionLocation: ProposalExecutionLocation;
  votingProtocolType: ProposalVotingProtocolType;
  decisionTargetType: ProposalDecisionTargetType;
  eligibleTierIds: string[];
  status: ProposalStatus;
  creationPath: ProposalCreationPath;
  creatorAddress: string;
  pollAddress: string | null;
  pollId: string | null;
  pollStartDate: number | null;
  pollEndDate: number | null;
  options: string[] | null;
  // "person"-type only — see decisionTargetType. optionMemberAddresses[i] is options[i]'s
  // candidate wallet address; electedWalletAddress is the tally-resolved winner (null until
  // tallying completes, and null forever on a tie — never a guessed winner).
  optionMemberAddresses: string[] | null;
  electedWalletAddress: string | null;
  createdAt: number;
  formalizedAt: number | null;
  tallyStatus: TallyStatus;
  tallyError: string | null;
  tallyRequestedAt: number | null;
  tallyCompletedAt: number | null;
  tallyResult: string | null;
}

export type ProposalWithMeta = Proposal & { sponsorCount: number; thresholdMet: boolean };

export interface CreateDraftInput {
  title: string;
  description: string;
  privacy: ProposalPrivacy;
  executionLocation: ProposalExecutionLocation;
  votingProtocolType: ProposalVotingProtocolType;
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
): Promise<{ proposal: Proposal; sponsorCount: number; thresholdMet: boolean }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseErrorOr(res, `Failed to create draft: ${res.status}`);
}

export async function list(communityId: string): Promise<{ proposals: ProposalWithMeta[] }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to list governance actions: ${res.status}`);
}

export async function get(
  communityId: string,
  actionId: string,
): Promise<{ proposal: Proposal; sponsorCount: number; thresholdMet: boolean }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/${actionId}`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to fetch governance action: ${res.status}`);
}

export async function sponsor(
  communityId: string,
  actionId: string,
): Promise<{ sponsorCount: number; thresholdMet: boolean }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/${actionId}/sponsor`, {
    method: "POST",
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to sponsor: ${res.status}`);
}

export async function authorizeFormalize(communityId: string, actionId: string): Promise<{ authorized: true }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/${actionId}/formalize/authorize`, {
    method: "POST",
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to authorize formalization: ${res.status}`);
}

export async function confirmFormalize(
  communityId: string,
  actionId: string,
  input: {
    pollAddress: string;
    pollId: string;
    txHash: string;
    pollStartDate: number;
    pollEndDate: number;
    options?: string[];
  },
): Promise<{ proposal: Proposal }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/${actionId}/formalize/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseErrorOr(res, `Failed to confirm formalization: ${res.status}`);
}

export interface DirectDeployInput {
  title: string;
  description: string;
  privacy: ProposalPrivacy;
  executionLocation: ProposalExecutionLocation;
  votingProtocolType: ProposalVotingProtocolType;
  eligibleTierIds: string[];
  // "person"-type (election) proposals only, direct-deploy path only — see
  // ENGINEERING.md's Decisions Log (2026-08-20 governance restructure Phase 2). Sent at
  // authorize time too (not just confirm) so validation runs before the wallet-signed deploy.
  decisionTargetType?: ProposalDecisionTargetType;
  options?: string[];
  optionMemberAddresses?: string[];
}

export async function authorizeDirect(communityId: string, input: DirectDeployInput): Promise<{ authorized: true }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/direct/authorize`, {
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
): Promise<{ proposal: Proposal }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/direct/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseErrorOr(res, `Failed to confirm direct deployment: ${res.status}`);
}

export async function triggerTally(communityId: string, actionId: string): Promise<{ tallyStatus: TallyStatus }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/${actionId}/tally`, {
    method: "POST",
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to trigger tallying: ${res.status}`);
}

export async function getTallyStatus(
  communityId: string,
  actionId: string,
): Promise<
  Pick<
    Proposal,
    "tallyStatus" | "tallyError" | "tallyRequestedAt" | "tallyCompletedAt" | "tallyResult" | "electedWalletAddress"
  >
> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/${actionId}/tally`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to fetch tally status: ${res.status}`);
}

export type VoteEligibilityReason =
  | "tier_lacks_voting_rights"
  | "tier_not_eligible_for_action"
  | "not_formalized"
  | "poll_not_started"
  | "poll_closed";

export async function checkVoteEligibility(
  communityId: string,
  actionId: string,
): Promise<{ eligible: boolean; reason?: VoteEligibilityReason }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/proposals/${actionId}/vote-eligibility`, {
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to check vote eligibility: ${res.status}`);
}
