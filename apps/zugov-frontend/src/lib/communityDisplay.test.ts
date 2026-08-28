import { describe, it, expect } from "vitest";
import { categoryLabelFor, governanceBadgeFor, unionToItem } from "./communityDisplay";
import type { UnionWithMemberCount } from "@/src/services/communityApi";

describe("governanceBadgeFor (specs/010 US4, FR-010)", () => {
  it("returns null for an off-chain-only community", () => {
    expect(governanceBadgeFor({ governanceType: null, subgraphStatus: null })).toBeNull();
  });

  it("returns MACI once governance is configured and the subgraph is ready", () => {
    expect(governanceBadgeFor({ governanceType: "maci", subgraphStatus: "ready" })).toBe("MACI");
  });

  it("returns null while the subgraph is still pending, even with governance configured", () => {
    expect(governanceBadgeFor({ governanceType: "maci", subgraphStatus: "pending" })).toBeNull();
  });
});

describe("categoryLabelFor (specs/010 US5, FR-011/FR-012; Child C1 /plan-eng-review 2026-08-24 — labels are DB-driven, not hardcoded)", () => {
  const LABELS = { network_state: "Network State", residency: "Residency", regional: "Regional", social: "Social" };

  it("maps the persisted category id to its display label via the provided labels map", () => {
    expect(categoryLabelFor({ category: "network_state" }, LABELS)).toBe("Network State");
    expect(categoryLabelFor({ category: "residency" }, LABELS)).toBe("Residency");
    expect(categoryLabelFor({ category: "regional" }, LABELS)).toBe("Regional");
    expect(categoryLabelFor({ category: "social" }, LABELS)).toBe("Social");
  });

  it("returns an empty string for a community with none set", () => {
    expect(categoryLabelFor({ category: null }, LABELS)).toBe("");
  });

  it("returns an empty string for a category id not present in the labels map, and defaults to {} when no map is passed", () => {
    expect(categoryLabelFor({ category: "unknown_id" }, LABELS)).toBe("");
    expect(categoryLabelFor({ category: "residency" })).toBe("");
  });
});

describe("unionToItem (specs/010 US6, FR-013)", () => {
  it("maps a union into a discoverable item flagged isUnion, with member count as its 'members' stat", () => {
    const union: UnionWithMemberCount = {
      id: "union-1",
      displayName: "Pop-up Cities Federation",
      description: "A federation of pop-up cities",
      logo: null,
      creatorAddress: "0xcreator",
      // Union-as-community merge (2026-08-28, D7) — Union is now Community & {type: 'union'},
      // so this fixture needs every Community field, not just the ones unionToItem() reads.
      type: "union",
      parentCommunityId: null,
      membershipPolicy: "open",
      category: null,
      allowJoin: false,
      tierChangesRequireVote: false,
      directDeploymentEnabled: false,
      defaultTierId: null,
      cosponsorshipThreshold: 0,
      createdAt: 1700000000,
      registeredAt: 1700000000,
      governanceConfigured: false,
      contractAddress: null,
      chainId: null,
      governanceType: null,
      allowedPolicies: [],
      supportedModes: [],
      signUpPolicyType: null,
      signUpPolicyAddress: null,
      stateTreeDepth: null,
      subgraphStatus: null,
      subgraphName: null,
      memberCount: 4,
    };

    const item = unionToItem(union);
    expect(item).toMatchObject({
      id: "union-1",
      name: "Pop-up Cities Federation",
      description: "A federation of pop-up cities",
      members: 4,
      isUnion: true,
      governanceBadge: null,
      category: "",
    });
  });
});
