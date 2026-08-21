// specs/013-zupoll-decision-adapter — client for the Zupoll decision adapter's backend routes.
// The vote/group/tally endpoints are deliberately called WITHOUT `credentials: "include"` — they
// are public, unauthenticated routes by design (see zupollService.verifyAndRecordVote's doc
// comment in the backend): sending a session cookie on the vote path would let the server
// correlate the caller's wallet with the vote regardless of how sound the ZK proof is. Do not
// add `credentials: "include"` to castVote/fetchGroup/fetchTally.

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export interface SemaphoreProofPayload {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  message: string;
  nullifier: string;
  scope: string;
  points: string[];
}

async function parseErrorOr<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? fallback);
  }
  return res.json() as Promise<T>;
}

export async function attachZupollAdapter(
  communityId: string,
): Promise<{ communityId: string; adapterType: "zupoll" }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/decision-adapters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ adapterType: "zupoll" }),
  });
  return parseErrorOr(res, `Failed to attach Zupoll: ${res.status}`);
}

export async function listDecisionAdapters(communityId: string): Promise<{ adapters: string[] }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/decision-adapters`);
  return parseErrorOr(res, `Failed to list decision adapters: ${res.status}`);
}

export interface ZupollProposalSummary {
  id: string;
  title: string;
  options: string[];
  pollEndDate: number | null;
}

/** Public — every Zupoll proposal's question/options/id are visible to everyone, including
 * non-members (FR-012), unlike the generic MACI-facing proposal list. */
export async function listZupollProposals(communityId: string): Promise<{ proposals: ZupollProposalSummary[] }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/zupoll/proposals`);
  return parseErrorOr(res, `Failed to list Zupoll surveys: ${res.status}`);
}

export interface CreateZupollProposalInput {
  title: string;
  options: string[];
  eligibleTierIds: string[];
  pollEndDate: number;
}

export async function createZupollProposal(
  communityId: string,
  input: CreateZupollProposalInput,
): Promise<{ proposal: { id: string } }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/zupoll/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseErrorOr(res, `Failed to create proposal: ${res.status}`);
}

export async function withdrawZupollProposal(proposalId: string): Promise<{ withdrawnAt: number }> {
  const res = await fetch(`${BASE_URL}/api/proposals/${proposalId}/withdraw`, {
    method: "POST",
    credentials: "include",
  });
  return parseErrorOr(res, `Failed to withdraw proposal: ${res.status}`);
}

export async function registerCommitment(communityId: string, commitment: string): Promise<{ registeredAt: number }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/zupoll/identity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ commitment }),
  });
  return parseErrorOr(res, `Failed to register identity: ${res.status}`);
}

export interface ZupollGroup {
  title: string;
  options: string[];
  groupRoot: string;
  groupCommitments: string[];
}

/** Public — deliberately no `credentials: "include"`. */
export async function fetchGroup(proposalId: string): Promise<ZupollGroup> {
  const res = await fetch(`${BASE_URL}/api/proposals/${proposalId}/zupoll/group`);
  return parseErrorOr(res, `Failed to fetch proposal group: ${res.status}`);
}

/** Public — deliberately no `credentials: "include"`. Do not add a session/auth header here;
 * see the file header comment. */
export async function castVote(proposalId: string, proof: SemaphoreProofPayload): Promise<{ optionIdx: number }> {
  const res = await fetch(`${BASE_URL}/api/proposals/${proposalId}/zupoll/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proof }),
  });
  return parseErrorOr(res, `Failed to cast vote: ${res.status}`);
}

export type ZupollTally = { revealed: false } | { revealed: true; counts: number[] };

/** Public — deliberately no `credentials: "include"`. Pass the caller's own nullifier (from a
 * vote already cast) to reveal tallies before expiry; omit it to check without revealing. */
export async function fetchTally(proposalId: string, nullifier?: string): Promise<ZupollTally> {
  const url = new URL(`${BASE_URL}/api/proposals/${proposalId}/zupoll/tally`);
  if (nullifier) url.searchParams.set("nullifier", nullifier);
  const res = await fetch(url.toString());
  return parseErrorOr(res, `Failed to fetch tally: ${res.status}`);
}
