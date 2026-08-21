import type { Community, UnionWithMemberCount } from "@/src/services/communityApi";

// Backend enum values (communities.category) -> the exact labels the category filter chips use.
const CATEGORY_LABELS: Record<string, string> = {
  residency: "Residency",
  pop_up_city: "Pop-up City",
  regional: "Regional",
  network_state: "Network State",
  social: "Social",
};

/** The creator-selected community type label, or "" if none is set. Independent of governance
 * status — see governanceBadgeFor for why the two must never be conflated (specs/010 US4/US5). */
export function categoryLabelFor(community: Pick<Community, "category">): string {
  return community.category ? (CATEGORY_LABELS[community.category] ?? "") : "";
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

export function communityToItem(c: Community): DiscoveryItem {
  return {
    id: c.id,
    name: c.displayName,
    description: c.description ?? "",
    logo: c.logo ?? "🏛️",
    members: 0,
    proposals: 0,
    category: categoryLabelFor(c),
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
