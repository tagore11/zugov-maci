import type { Community, UnionWithMemberCount } from "@/src/services/communityApi";

/** The creator-selected community type label, or "" if none is set. Independent of governance
 * status — see governanceBadgeFor for why the two must never be conflated (specs/010 US4/US5).
 * `labels` maps category id -> display label, built by the caller from GET /api/categories (not
 * hardcoded here — formalize-communities epic, Child C1, /plan-eng-review 2026-08-24). Defaults
 * to {} for callers that don't have the fetched list handy, which resolves to "" same as before. */
export function categoryLabelFor(community: Pick<Community, "category">, labels: Record<string, string> = {}): string {
  return community.category ? (labels[community.category] ?? "") : "";
}

/** "MACI" only once governance is actually configured and its subgraph has finished indexing;
 * null otherwise. Previously this was hardcoded to "MACI" for every community regardless of
 * governance status (specs/010 US4, FR-010). */
export function governanceBadgeFor(community: Pick<Community, "governanceType" | "subgraphStatus">): string | null {
  return community.governanceType === "maci" && community.subgraphStatus === "ready" ? "MACI" : null;
}

export type DiscoveryItem = {
  id: string;
  name: string;
  description: string;
  logo: string;
  members: number;
  proposals: number;
  category: string;
  governanceBadge: string | null;
  createdAt?: number;
  signUpPolicyType?: string | null;
  subgraphStatus?: Community["subgraphStatus"];
  governanceType?: string;
  // Unions are communities per ENGINEERING.md's structural-participation decision, but link to
  // /unions/:id (not /community/:id) and have no governance/category of their own (specs/010 US6).
  isUnion?: boolean;
};

export function communityToItem(c: Community, categoryLabels: Record<string, string> = {}): DiscoveryItem {
  return {
    id: c.id,
    name: c.displayName,
    description: c.description ?? "",
    logo: c.logo ?? "🏛️",
    members: 0,
    proposals: 0,
    category: categoryLabelFor(c, categoryLabels),
    governanceBadge: governanceBadgeFor(c),
    createdAt: c.createdAt,
    signUpPolicyType: c.signUpPolicyType,
    subgraphStatus: c.subgraphStatus,
    governanceType: c.governanceType ?? undefined,
  };
}

export function unionToItem(u: UnionWithMemberCount): DiscoveryItem {
  return {
    id: u.id,
    name: u.displayName,
    description: u.description ?? "",
    logo: u.logo ?? "🤝",
    members: u.memberCount,
    proposals: 0,
    category: "",
    governanceBadge: null,
    createdAt: u.createdAt,
    isUnion: true,
  };
}
