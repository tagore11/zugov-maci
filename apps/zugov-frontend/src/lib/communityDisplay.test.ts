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

describe("categoryLabelFor (specs/010 US5, FR-011/FR-012)", () => {
  it("maps the persisted category to its display label", () => {
    expect(categoryLabelFor({ category: "network_state" })).toBe("Network State");
    expect(categoryLabelFor({ category: "residency" })).toBe("Residency");
    expect(categoryLabelFor({ category: "regional" })).toBe("Regional");
    expect(categoryLabelFor({ category: "social" })).toBe("Social");
  });

  it("returns an empty string for a community with none set", () => {
    expect(categoryLabelFor({ category: null })).toBe("");
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
      createdAt: 1700000000,
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
