import type { SignUpPolicyType, PollDeployConfig } from "@/src/config";
import type { MembershipPolicy, TierDraft } from "@/src/services/checkpointStore";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export type CommunityCategory = "residency" | "regional" | "network_state" | "social";

// Flat merged shape (Architecture Issue 3) — identity fields are always present; governance
// fields are null until governanceConfigured is true. A community's identity can exist before
// any governance tool is configured (Architecture 1A/1B), so callers must check
// governanceConfigured before relying on chainId/contractAddress/etc being non-null.
export type Community = {
  id: string;
  displayName: string;
  description: string | null;
  logo: string | null;
  creatorAddress: string;
  // Local chapters, event teams, and contributor circles nest under a parent community
  // (Lightpaper's "communities and sub-communities" building block). Null for top-level.
  parentCommunityId: string | null;
  membershipPolicy: MembershipPolicy;
  // Creator-selected community type, independent of governance — see app/page.tsx's
  // governanceBadge for why this must never be conflated with governance status.
  category: CommunityCategory | null;
  tierChangesRequireVote: boolean;
  directDeploymentEnabled: boolean;
  defaultTierId: string | null;
  cosponsorshipThreshold: number;
  createdAt: number;
  registeredAt: number;
  governanceConfigured: boolean;
  contractAddress: string | null;
  chainId: number | null;
  governanceType: string | null;
  allowedPolicies: number[];
  supportedModes: number[];
  signUpPolicyType: SignUpPolicyType | null;
  signUpPolicyAddress: string | null;
  stateTreeDepth: (6 | 10 | 14) | null;
  pollDeployConfig?: PollDeployConfig;
  subgraphStatus: "pending" | "ready" | "failed" | null;
  subgraphName: string | null;
};

export type ListResponse = {
  communities: Community[];
  total: number;
  hasMore: boolean;
};

// POST /api/communities — identity-only for the wizard (server generates id).
export type IdentityPayload = {
  displayName: string;
  description?: string;
  logo?: string;
  parentCommunityId?: string;
  membershipPolicy: MembershipPolicy;
  category?: CommunityCategory;
  tierChangesRequireVote: boolean;
  tiers: TierDraft[];
  defaultTierLabel: string;
  source: "wizard";
};

// POST /api/communities/:id/governance — attach governance to an existing identity.
export type GovernancePayload = {
  contractAddress: string;
  chainId: number;
  allowedPolicies: number[];
  supportedModes: number[];
  signUpPolicyType: SignUpPolicyType;
  signUpPolicyAddress: string;
  maciDeploymentBlock: number;
  stateTreeDepth: 6 | 10 | 14;
  pollDeployConfig?: PollDeployConfig;
};

// Manual registration (an already-deployed, externally-created contract) provides identity +
// governance together in one call, since both are already known simultaneously.
export type ManualRegistrationPayload = Omit<IdentityPayload, "source"> &
  GovernancePayload & { id: string; source: "manual" };

export type CommunityUpdatePayload = Partial<
  Pick<
    IdentityPayload,
    "displayName" | "description" | "logo" | "membershipPolicy" | "category" | "tierChangesRequireVote"
  > & {
    defaultTierLabel: string;
  }
> & {
  // PATCH-only — not settable at registration time (data-model.md: "Changed only via PATCH").
  directDeploymentEnabled?: boolean;
};

export class AuthError extends Error {
  constructor() {
    super("Authentication required. Please sign in with Ethereum.");
  }
}

export class OwnershipError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/** URL of the transparent backend proxy in front of a community's isolated subgraph deployment. */
export function subgraphQueryUrl(id: string): string {
  return `${BASE_URL}/api/communities/${id}/subgraph/query`;
}

export async function list(page = 1, chainId?: number, creatorAddress?: string): Promise<ListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (chainId !== undefined) params.set("chainId", String(chainId));
  if (creatorAddress !== undefined) params.set("creatorAddress", creatorAddress);
  const res = await fetch(`${BASE_URL}/api/communities?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch communities: ${res.status}`);
  return res.json() as Promise<ListResponse>;
}

export async function get(id: string): Promise<Community | null> {
  const res = await fetch(`${BASE_URL}/api/communities/${id}`, { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch community: ${res.status}`);
  const data = (await res.json()) as { community: Community };
  return data.community;
}

export async function listChildren(id: string): Promise<Community[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${id}/children`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to fetch sub-communities: ${res.status}`);
  const data = (await res.json()) as { communities: Community[] };
  return data.communities;
}

async function handleCommunityResponse(res: Response): Promise<Community> {
  if (res.status === 401) throw new AuthError();
  if (res.status === 403) {
    const data = (await res.json()) as { error: string };
    throw new OwnershipError(data.error);
  }
  if (res.status === 409) {
    const data = (await res.json()) as { error: string };
    throw new ConflictError(data.error);
  }
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  const data = (await res.json()) as { community: Community };
  return data.community;
}

/** Wizard path: creates the community's identity, server generates and returns its id. */
export async function registerIdentity(payload: IdentityPayload): Promise<Community> {
  const res = await fetch(`${BASE_URL}/api/communities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleCommunityResponse(res);
}

/** Wizard path, second step: attaches governance config once MACI has been deployed. */
export async function attachGovernance(id: string, payload: GovernancePayload): Promise<Community> {
  const res = await fetch(`${BASE_URL}/api/communities/${id}/governance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleCommunityResponse(res);
}

/** Manual path: registers an already-deployed contract, identity + governance in one call. */
export async function registerManual(payload: ManualRegistrationPayload): Promise<Community> {
  const res = await fetch(`${BASE_URL}/api/communities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleCommunityResponse(res);
}

export async function update(id: string, payload: CommunityUpdatePayload): Promise<Community> {
  const res = await fetch(`${BASE_URL}/api/communities/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new AuthError();
  if (res.status === 403) {
    const data = (await res.json()) as { error: string };
    throw new OwnershipError(data.error);
  }
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? `Update failed: ${res.status}`);
  }
  const data = (await res.json()) as { community: Community };
  return data.community;
}

// ─── Unions — peer/federation relationship between independent communities ─────────────────
// Distinct from parentCommunityId's hierarchy: a union has no governance of its own, and
// member communities stay fully independent (Architecture decision on union communities).

export type UnionMembershipStatus = "pending" | "active" | "declined" | "left";

export type Union = {
  id: string;
  displayName: string;
  description: string | null;
  logo: string | null;
  creatorAddress: string;
  createdAt: number;
};

export type UnionWithMemberCount = Union & { memberCount: number };

export type UnionListResponse = {
  unions: UnionWithMemberCount[];
  total: number;
  hasMore: boolean;
};

export type UnionMember = {
  communityId: string;
  displayName: string;
  logo: string | null;
  status: "pending" | "active";
};

export type CommunityUnion = {
  id: string;
  displayName: string;
  logo: string | null;
  status: UnionMembershipStatus extends infer S ? Exclude<S, "declined" | "left"> : never;
};

export async function createUnion(payload: {
  displayName: string;
  description?: string;
  logo?: string;
  foundingCommunityId: string;
}): Promise<Union> {
  const res = await fetch(`${BASE_URL}/api/unions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new AuthError();
  if (res.status === 403) {
    const data = (await res.json()) as { error: string };
    throw new OwnershipError(data.error);
  }
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? `Failed to create union: ${res.status}`);
  }
  const data = (await res.json()) as { union: Union };
  return data.union;
}

export async function getUnion(id: string): Promise<{ union: Union; members: UnionMember[] } | null> {
  const res = await fetch(`${BASE_URL}/api/unions/${id}`, { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch union: ${res.status}`);
  return res.json() as Promise<{ union: Union; members: UnionMember[] }>;
}

export async function inviteToUnion(
  unionId: string,
  payload: { communityId: string; actingCommunityId: string },
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/unions/${unionId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new AuthError();
  if (res.status === 403) {
    const data = (await res.json()) as { error: string };
    throw new OwnershipError(data.error);
  }
  if (res.status === 409) {
    const data = (await res.json()) as { error: string };
    throw new ConflictError(data.error);
  }
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? `Failed to invite: ${res.status}`);
  }
}

export async function respondToUnionInvite(
  unionId: string,
  payload: { communityId: string; accept: boolean },
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/unions/${unionId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new AuthError();
  if (res.status === 403) {
    const data = (await res.json()) as { error: string };
    throw new OwnershipError(data.error);
  }
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? `Failed to respond: ${res.status}`);
  }
}

/** Unions this community belongs to or has a pending invite for — never includes declined. */
export async function listUnionsForCommunity(id: string): Promise<CommunityUnion[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${id}/unions`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to fetch unions: ${res.status}`);
  const data = (await res.json()) as { unions: CommunityUnion[] };
  return data.unions;
}

/** Self-service only — the community leaves on its own behalf, no "kick" path exists. */
export async function leaveUnion(unionId: string, payload: { communityId: string }): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/unions/${unionId}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new AuthError();
  if (res.status === 403) {
    const data = (await res.json()) as { error: string };
    throw new OwnershipError(data.error);
  }
  if (res.status === 409) {
    const data = (await res.json()) as { error: string };
    throw new ConflictError(data.error);
  }
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? `Failed to leave union: ${res.status}`);
  }
}

/** Public browse-all listing — no auth required. */
export async function listAllUnions(page = 1): Promise<UnionListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  const res = await fetch(`${BASE_URL}/api/unions?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch unions: ${res.status}`);
  return res.json() as Promise<UnionListResponse>;
}
