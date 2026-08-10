import type { SignUpPolicyType, PollDeployConfig } from "@/src/config";
import type { VoterCapacityPreset, MembershipPolicy, TierDraft } from "@/src/services/checkpointStore";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export type Community = {
  id: string;
  chainId: number;
  displayName: string;
  description: string | null;
  logo: string | null;
  creatorAddress: string;
  governanceType: string;
  allowedPolicies: number[];
  supportedModes: number[];
  signUpPolicyType: SignUpPolicyType;
  signUpPolicyAddress: string;
  voterCapacityPreset: VoterCapacityPreset;
  stateTreeDepth: 6 | 10 | 14;
  membershipPolicy: MembershipPolicy;
  tierChangesRequireVote: boolean;
  defaultTierId: string | null;
  pollDeployConfig?: PollDeployConfig;
  createdAt: number;
  registeredAt: number;
};

export type ListResponse = {
  communities: Community[];
  total: number;
  hasMore: boolean;
};

export type RegistrationPayload = {
  displayName: string;
  id: string;
  chainId: number;
  creatorAddress: string;
  allowedPolicies: number[];
  supportedModes: number[];
  signUpPolicyType: SignUpPolicyType;
  signUpPolicyAddress: string;
  voterCapacityPreset: VoterCapacityPreset;
  stateTreeDepth: 6 | 10 | 14;
  description?: string;
  logo?: string;
  source: "wizard" | "manual";
  membershipPolicy: MembershipPolicy;
  tierChangesRequireVote: boolean;
  tiers: TierDraft[];
  defaultTierLabel: string;
  pollDeployConfig?: PollDeployConfig;
};

export type CommunityUpdatePayload = Partial<
  Pick<
    RegistrationPayload,
    "displayName" | "description" | "logo" | "membershipPolicy" | "tierChangesRequireVote" | "defaultTierLabel"
  >
>;

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

export async function register(payload: RegistrationPayload): Promise<Community> {
  const res = await fetch(`${BASE_URL}/api/communities`, {
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
    throw new Error(data.error ?? `Registration failed: ${res.status}`);
  }
  const data = (await res.json()) as { community: Community };
  return data.community;
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
