import type { TierDraft } from "@/src/services/checkpointStore";
import { parseErrorOr } from "@/src/services/httpClient";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

// canPostDiscussions isn't part of TierDraft (no create/edit UI exists for it — TierEditor.tsx has
// no toggle), but the backend's GET /tiers response includes it (a full `select()` over
// membershipTiers), so the read type declares it separately rather than widening TierDraft's
// create/update shape.
export type Tier = TierDraft & {
  id: string;
  isDefault: boolean;
  canPostDiscussions: boolean;
};

export async function getTiers(communityId: string): Promise<Tier[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/tiers`);
  const data = await parseErrorOr<{ tiers: Tier[] }>(res, `Failed to fetch tiers: ${res.status}`);
  return data.tiers;
}

export async function createTier(communityId: string, tier: TierDraft): Promise<Tier> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/tiers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(tier),
  });
  const data = await parseErrorOr<{ tier: Tier }>(res, `Failed to create tier: ${res.status}`);
  return data.tier;
}

export async function updateTier(communityId: string, tierId: string, patch: Partial<TierDraft>): Promise<Tier> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/tiers/${tierId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  const data = await parseErrorOr<{ tier: Tier }>(res, `Failed to update tier: ${res.status}`);
  return data.tier;
}

export async function deleteTier(communityId: string, tierId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/tiers/${tierId}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseErrorOr<{ ok: true }>(res, `Failed to delete tier: ${res.status}`);
}

export type MembershipStatus = { status: "member" | "pending" | "none"; tierLabel?: string };

export async function getMembershipStatus(communityId: string): Promise<MembershipStatus> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/membership`, { credentials: "include" });
  return parseErrorOr<MembershipStatus>(res, `Failed to fetch membership status: ${res.status}`);
}

export class DuplicateJoinError extends Error {}

export async function join(communityId: string): Promise<{ status: "approved" | "pending"; tierLabel?: string }> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/join`, {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 409) {
    const data = (await res.json()) as { error: string };
    throw new DuplicateJoinError(data.error);
  }
  return parseErrorOr(res, `Failed to join: ${res.status}`);
}

// formalize-communities epic, Child F (/plan-eng-review 2026-08-25) — deletes the caller's own
// membership. Throws HttpError(403) if the caller is the community's creator, HttpError(409) if
// the community has any decision adapter attached, HttpError(404) if the caller isn't a member
// (including on a repeat call — Leave is deliberately not idempotent, D2).
export async function leave(communityId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/membership`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseErrorOr<{ ok: true }>(res, `Failed to leave: ${res.status}`);
}

export type PendingRequest = { id: string; walletAddress: string; createdAt: number };

export async function listPendingRequests(communityId: string): Promise<PendingRequest[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/join-requests`, { credentials: "include" });
  const data = await parseErrorOr<{ requests: PendingRequest[] }>(res, `Failed to list requests: ${res.status}`);
  return data.requests;
}

export async function approveRequest(communityId: string, requestId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/join-requests/${requestId}/approve`, {
    method: "POST",
    credentials: "include",
  });
  await parseErrorOr(res, `Failed to approve request: ${res.status}`);
}

/** Communities the current session's wallet holds an approved membership in. */
export async function listMyMemberships(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/api/memberships/mine`, { credentials: "include" });
  const data = await parseErrorOr<{ communityIds: string[] }>(res, `Failed to list memberships: ${res.status}`);
  return data.communityIds;
}

export type Member = { walletAddress: string; tierLabel: string };

/** Feeds the person-type (election) proposal creation UI's member picker (governance restructure
 * Phase 2, 2026-08-20). Membership-gated on the backend, not admin-gated. */
export async function listMembers(communityId: string): Promise<Member[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/members`, { credentials: "include" });
  const data = await parseErrorOr<{ members: Member[] }>(res, `Failed to list members: ${res.status}`);
  return data.members;
}

export async function rejectRequest(communityId: string, requestId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/join-requests/${requestId}/reject`, {
    method: "POST",
    credentials: "include",
  });
  await parseErrorOr(res, `Failed to reject request: ${res.status}`);
}
