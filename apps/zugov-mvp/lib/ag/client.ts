/**
 * The governance backend, reached through this app's own origin.
 *
 * Everything goes to /ag/*, which next.config.ts rewrites onto the backend, so
 * requests are same-origin and carry the session cookie without any CORS
 * negotiation or SameSite=None workaround.
 */

export class BackendError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

export async function ag<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/ag${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    let message = `İstek başarısız oldu (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // A non-JSON error body is still an error, and the status carries meaning.
    }
    throw new BackendError(response.status, message);
  }

  return (await response.json()) as T;
}

export interface Community {
  id: string;
  displayName: string;
  description: string | null;
  logo: string | null;
  type: "standard" | "union";
  parentCommunityId: string | null;
  membershipPolicy: "open" | "approval";
  governanceConfigured?: boolean;
}

export interface MembershipTier {
  id: string;
  label: string;
  canCreateProposals: boolean;
  canVote: boolean;
  canManageMembership: boolean;
}

/** What GET /communities/:id/membership actually returns. */
export interface MembershipStatus {
  status: "member" | "pending" | "none";
  tierLabel?: string;
  tierId?: string;
  canVote?: boolean;
  canCreateProposals?: boolean;
  canManageMembership?: boolean;
}

export const communities = {
  list: () => ag<{ communities: Community[] }>("/communities"),
  // The backend wraps this one, unlike the list endpoint next to it.
  get: async (id: string) => (await ag<{ community: Community }>(`/communities/${id}`)).community,
  children: (id: string) => ag<{ communities: Community[] }>(`/communities/${id}/children`),
  unions: (id: string) => ag<{ unions: Community[] }>(`/communities/${id}/unions`),
  tiers: (id: string) => ag<{ tiers: MembershipTier[] }>(`/communities/${id}/tiers`),
  join: (id: string) => ag<unknown>(`/communities/${id}/join`, { method: "POST", body: "{}" }),
  leave: (id: string) => ag<unknown>(`/communities/${id}/leave`, { method: "POST", body: "{}" }),
  myMembership: (id: string) => ag<MembershipStatus>(`/communities/${id}/membership`),
};

export const auth = {
  nonce: () => ag<{ nonce: string }>("/auth/nonce"),
  verify: (message: string, signature: string) =>
    ag<{ address: string; chainId: number }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ message, signature }),
    }),
  logout: () => ag<{ ok: true }>("/auth/logout", { method: "POST", body: "{}" }),
};
