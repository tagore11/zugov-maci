import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { testDb, clearCommunities } from "./helpers/testDb.js";
import * as schema from "../src/db/schema.js";

// eligibilityService's erc20TokenAdapter calls viem's createPublicClient/readContract directly
// (no dependency-injection seam) — mocked here since there's no real chain to read from in
// tests. `http` just needs to be callable; its return value is opaque to the mock client below.
const mockReadContract = vi.fn();
vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({ readContract: mockReadContract })),
    http: vi.fn(() => ({})),
  };
});

// chainRpc.ts's RPC_URLS map reads process.env once at module-load time, so this must be set
// before eligibilityService.ts (which imports chainRpc.ts) is ever imported — setting it in
// beforeEach is too late.
process.env.SCROLL_SEPOLIA_RPC_URL ??= "http://mock-rpc.invalid";

const { evaluateRuleset, evaluateEligibilityAcrossUnion, replaceRuleset, getRuleset } = await import(
  "../src/services/eligibilityService.js"
);

const SCROLL_SEPOLIA = 534351;
const WALLET_A = "0x1111111111111111111111111111111111111a";
const WALLET_B = "0x2222222222222222222222222222222222222b";
const TOKEN_ADDRESS = "0x3333333333333333333333333333333333333c";

async function insertCommunity(overrides: Partial<typeof schema.communities.$inferInsert> = {}) {
  const id = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await testDb.insert(schema.communities).values({
    id,
    displayName: "Eligibility Test Community",
    creatorAddress: "0x0000000000000000000000000000000000dead",
    createdAt: now,
    registeredAt: now,
    ...overrides,
  });
  return id;
}

async function insertTier(communityId: string, overrides: Partial<typeof schema.membershipTiers.$inferInsert> = {}) {
  const id = overrides.id ?? randomUUID();
  await testDb.insert(schema.membershipTiers).values({
    communityId,
    label: "Tier",
    canCreateProposals: false,
    canVote: true,
    canManageMembership: false,
    createdAt: Math.floor(Date.now() / 1000),
    ...overrides,
    id,
  });
  return id;
}

async function insertMembership(communityId: string, walletAddress: string, tierId: string) {
  await testDb.insert(schema.memberships).values({
    walletAddress,
    communityId,
    tierId,
    joinedAt: Math.floor(Date.now() / 1000),
  });
}

// Union-as-community merge (2026-08-28) — a union is now a communities row with type='union';
// this helper is a thin wrapper over insertCommunity() rather than its own insert.
async function insertUnion(overrides: Partial<typeof schema.communities.$inferInsert> = {}) {
  return insertCommunity({ displayName: "Test Union", type: "union", ...overrides });
}

async function addUnionMembership(
  unionId: string,
  communityId: string,
  status: "pending" | "active" | "declined" | "left" = "active",
) {
  const now = Math.floor(Date.now() / 1000);
  await testDb.insert(schema.unionMemberships).values({
    unionId,
    communityId,
    status,
    invitedByAddress: "0x0000000000000000000000000000000000dead",
    requestedAt: now,
    respondedAt: status === "pending" ? null : now,
  });
}

beforeEach(async () => {
  mockReadContract.mockReset();
  try {
    await clearCommunities();
  } catch {
    // db may not be available in unit test runs without TEST_DATABASE_URL
  }
});

afterAll(async () => {
  try {
    await clearCommunities();
  } catch {}
});

describe("evaluateRuleset — no ruleset configured (D4: absence = Open)", () => {
  it("returns eligible with no tier override when the community has no ruleset row at all", async () => {
    const communityId = await insertCommunity();
    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result).toEqual({ eligible: true, tierId: null });
  });

  it("returns eligible with no tier override when the ruleset exists but has zero rules", async () => {
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, []);
    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result).toEqual({ eligible: true, tierId: null });
  });
});

describe("evaluateRuleset — open mechanism", () => {
  it("always passes, regardless of wallet", async () => {
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "open", config: {} }]);
    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(true);
  });
});

describe("evaluateRuleset — tier mechanism", () => {
  it("passes when the wallet already holds the required tier", async () => {
    const communityId = await insertCommunity();
    const tierId = await insertTier(communityId, { label: "Resident" });
    await insertMembership(communityId, WALLET_A, tierId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(true);
  });

  it("fails with a reason when the wallet holds a different tier", async () => {
    const communityId = await insertCommunity();
    const requiredTierId = await insertTier(communityId, { label: "Resident" });
    const heldTierId = await insertTier(communityId, { label: "Guest" });
    await insertMembership(communityId, WALLET_A, heldTierId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId: requiredTierId } }]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/does not hold the required tier/i);
  });

  it("fails with a reason when the wallet is not a member at all", async () => {
    const communityId = await insertCommunity();
    const tierId = await insertTier(communityId, { label: "Resident" });
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/not yet a member/i);
  });
});

describe("evaluateRuleset — erc20_token mechanism", () => {
  it("passes when the on-chain balance meets the threshold", async () => {
    mockReadContract.mockResolvedValueOnce(1000n);
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, [
      {
        groupIndex: 0,
        mechanism: "erc20_token",
        config: { chainId: SCROLL_SEPOLIA, tokenAddress: TOKEN_ADDRESS, threshold: "500" },
      },
    ]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(true);
  });

  it("fails with the exact balance/threshold reason when below the threshold", async () => {
    mockReadContract.mockResolvedValueOnce(10n);
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, [
      {
        groupIndex: 0,
        mechanism: "erc20_token",
        config: { chainId: SCROLL_SEPOLIA, tokenAddress: TOKEN_ADDRESS, threshold: "500" },
      },
    ]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("Token balance 10 is below the required 500");
  });

  it("fails cleanly with a reason when no RPC is configured for the chain", async () => {
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, [
      {
        groupIndex: 0,
        mechanism: "erc20_token",
        config: { chainId: 999999, tokenAddress: TOKEN_ADDRESS, threshold: "1" },
      },
    ]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/no rpc configured/i);
    expect(mockReadContract).not.toHaveBeenCalled();
  });

  it("fails cleanly with a reason when the on-chain read throws, instead of propagating", async () => {
    mockReadContract.mockRejectedValueOnce(new Error("network error"));
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, [
      {
        groupIndex: 0,
        mechanism: "erc20_token",
        config: { chainId: SCROLL_SEPOLIA, tokenAddress: TOKEN_ADDRESS, threshold: "1" },
      },
    ]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/could not read on-chain token balance/i);
  });
});

describe("evaluateRuleset — DNF composition and rank-based tier resolution (D1/D2b/D2c)", () => {
  it("a single passing group with a targetTierId resolves to that tier", async () => {
    const communityId = await insertCommunity();
    const residentTierId = await insertTier(communityId, { label: "Resident", rank: 1 });
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "open", config: {}, targetTierId: residentTierId }]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result).toEqual({ eligible: true, tierId: residentTierId });
  });

  it("a single failing group resolves to ineligible with its adapter's reason", async () => {
    const communityId = await insertCommunity();
    const tierId = await insertTier(communityId, { label: "Resident" });
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.tierId).toBeNull();
  });

  it("when multiple groups pass and target different tiers, the highest-rank tier wins regardless of group order", async () => {
    // Resident (rank 1) is defined as groupIndex 0 (first); OG (rank 10) is groupIndex 1
    // (second) — the rank, not insertion/group order, must decide the winner.
    mockReadContract.mockResolvedValueOnce(1000n); // satisfies both thresholds at once
    const communityId = await insertCommunity();
    const residentTierId = await insertTier(communityId, { label: "Resident", rank: 1 });
    const ogTierId = await insertTier(communityId, { label: "OG", rank: 10 });
    await replaceRuleset(communityId, [
      {
        groupIndex: 0,
        mechanism: "erc20_token",
        config: { chainId: SCROLL_SEPOLIA, tokenAddress: TOKEN_ADDRESS, threshold: "100" },
        targetTierId: residentTierId,
      },
      {
        groupIndex: 1,
        mechanism: "erc20_token",
        config: { chainId: SCROLL_SEPOLIA, tokenAddress: TOKEN_ADDRESS, threshold: "100" },
        targetTierId: ogTierId,
      },
    ]);

    // Both groups read the same balance — mock every call to resolve the same way so group
    // order in evaluation doesn't accidentally starve the second group of a mocked value.
    mockReadContract.mockResolvedValue(1000n);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(true);
    expect(result.tierId).toBe(ogTierId);
  });

  it("when one passing group has no targetTierId and another does, the targeted one wins", async () => {
    const communityId = await insertCommunity();
    const residentTierId = await insertTier(communityId, { label: "Resident", rank: 1 });
    const guestTierId = await insertTier(communityId, { label: "Guest", rank: 0 });
    await insertMembership(communityId, WALLET_A, guestTierId);
    await replaceRuleset(communityId, [
      // groupIndex 0: tier-gated on already holding Guest, no target — passes, untargeted.
      { groupIndex: 0, mechanism: "tier", config: { tierId: guestTierId } },
      // groupIndex 1: open, always passes, targets Resident.
      { groupIndex: 1, mechanism: "open", config: {}, targetTierId: residentTierId },
    ]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(true);
    expect(result.tierId).toBe(residentTierId);
  });

  it("when zero groups pass, aggregates every group's failure reason joined with '; or '", async () => {
    const communityId = await insertCommunity();
    const tierAId = await insertTier(communityId, { label: "A" });
    const tierBId = await insertTier(communityId, { label: "B" });
    await replaceRuleset(communityId, [
      { groupIndex: 0, mechanism: "tier", config: { tierId: tierAId } },
      { groupIndex: 1, mechanism: "tier", config: { tierId: tierBId } },
    ]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.tierId).toBeNull();
    expect(result.reason).toContain("; or ");
  });

  it("AND within a group: both rules in the same groupIndex must pass", async () => {
    mockReadContract.mockResolvedValueOnce(1000n);
    const communityId = await insertCommunity();
    const tierId = await insertTier(communityId, { label: "Resident" });
    // Wallet holds the tier but the group also requires an ERC20 balance it doesn't have —
    // AND semantics mean the group must fail even though one of its two rules passes.
    await insertMembership(communityId, WALLET_A, tierId);
    mockReadContract.mockReset();
    mockReadContract.mockResolvedValueOnce(0n);
    await replaceRuleset(communityId, [
      { groupIndex: 0, mechanism: "tier", config: { tierId } },
      {
        groupIndex: 0,
        mechanism: "erc20_token",
        config: { chainId: SCROLL_SEPOLIA, tokenAddress: TOKEN_ADDRESS, threshold: "500" },
      },
    ]);

    const result = await evaluateRuleset(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
  });
});

describe("replaceRuleset / getRuleset", () => {
  it("round-trips rules through storage, preserving groupIndex/mechanism/config/targetTierId", async () => {
    const communityId = await insertCommunity();
    const tierId = await insertTier(communityId);
    await replaceRuleset(communityId, [
      {
        groupIndex: 0,
        mechanism: "erc20_token",
        config: { chainId: SCROLL_SEPOLIA, tokenAddress: TOKEN_ADDRESS, threshold: "42" },
        targetTierId: tierId,
      },
    ]);

    const rules = await getRuleset(communityId);
    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({ groupIndex: 0, mechanism: "erc20_token", targetTierId: tierId });
    expect(JSON.parse(rules[0]!.config)).toEqual({
      chainId: SCROLL_SEPOLIA,
      tokenAddress: TOKEN_ADDRESS,
      threshold: "42",
    });
  });

  it("replace fully clears prior rules rather than appending", async () => {
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "open", config: {} }]);
    await replaceRuleset(communityId, [
      { groupIndex: 0, mechanism: "open", config: {} },
      { groupIndex: 1, mechanism: "open", config: {} },
    ]);

    const rules = await getRuleset(communityId);
    expect(rules).toHaveLength(2);
  });

  it("replacing with an empty array clears all rules (reverting a community to Open)", async () => {
    const communityId = await insertCommunity();
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "open", config: {} }]);
    await replaceRuleset(communityId, []);

    const rules = await getRuleset(communityId);
    expect(rules).toHaveLength(0);
  });

  it("getRuleset on a community with no ruleset row returns an empty array", async () => {
    const communityId = await insertCommunity();
    const rules = await getRuleset(communityId);
    expect(rules).toEqual([]);
  });
});

describe("evaluateEligibilityAcrossUnion — live union fallback (2026-08-19 follow-up review, D1)", () => {
  it("own ruleset passes → returns immediately, no union query needed", async () => {
    const communityId = await insertCommunity();
    // No union membership at all — if the function tried to query unions here it would still
    // work, but this asserts the own-ruleset-passes short-circuit specifically.
    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result).toEqual({ eligible: true, tierId: null });
  });

  it("own ruleset fails, no active union membership → falls through to the own failure reason", async () => {
    const communityId = await insertCommunity();
    const tierId = await insertTier(communityId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);

    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/not yet a member/i);
  });

  it("own ruleset fails, active union, no sibling passes → own failure reason still surfaces", async () => {
    const communityId = await insertCommunity();
    const siblingId = await insertCommunity();
    const tierId = await insertTier(communityId);
    const siblingTierId = await insertTier(siblingId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);
    await replaceRuleset(siblingId, [{ groupIndex: 0, mechanism: "tier", config: { tierId: siblingTierId } }]);
    const unionId = await insertUnion();
    await addUnionMembership(unionId, communityId, "active");
    await addUnionMembership(unionId, siblingId, "active");

    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/not yet a member/i);
  });

  it("own ruleset fails, an active sibling's ruleset passes → eligible with no tier override", async () => {
    const communityId = await insertCommunity();
    const siblingId = await insertCommunity();
    const tierId = await insertTier(communityId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);
    await replaceRuleset(siblingId, [{ groupIndex: 0, mechanism: "open", config: {} }]);
    const unionId = await insertUnion();
    await addUnionMembership(unionId, communityId, "active");
    await addUnionMembership(unionId, siblingId, "active");

    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result).toEqual({ eligible: true, tierId: null });
  });

  it("pools siblings across every active union the community belongs to, deduped, self excluded", async () => {
    const communityId = await insertCommunity();
    const siblingId = await insertCommunity();
    const tierId = await insertTier(communityId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);
    await replaceRuleset(siblingId, [{ groupIndex: 0, mechanism: "open", config: {} }]);
    const unionA = await insertUnion();
    const unionB = await insertUnion();
    // communityId and siblingId are both in TWO shared unions — the sibling must only be
    // checked once (dedup), and the pool must never include communityId itself.
    await addUnionMembership(unionA, communityId, "active");
    await addUnionMembership(unionA, siblingId, "active");
    await addUnionMembership(unionB, communityId, "active");
    await addUnionMembership(unionB, siblingId, "active");

    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result.eligible).toBe(true);
  });

  it("trust-gap fix: a sibling with no ruleset at all (Open) never extends eligibility", async () => {
    const communityId = await insertCommunity();
    const siblingId = await insertCommunity();
    const tierId = await insertTier(communityId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);
    // siblingId deliberately has NO ruleset configured at all (getRuleset returns []) — this is
    // the exact exploit the outside-voice pass caught: an Open sibling must not silently grant
    // eligibility to every wallet on earth just by being in the union.
    const unionId = await insertUnion();
    await addUnionMembership(unionId, communityId, "active");
    await addUnionMembership(unionId, siblingId, "active");

    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
  });

  it("a pending (not yet accepted) union membership does not extend eligibility", async () => {
    const communityId = await insertCommunity();
    const siblingId = await insertCommunity();
    const tierId = await insertTier(communityId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);
    await replaceRuleset(siblingId, [{ groupIndex: 0, mechanism: "open", config: {} }]);
    const unionId = await insertUnion();
    await addUnionMembership(unionId, communityId, "pending");
    await addUnionMembership(unionId, siblingId, "active");

    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
  });

  it("a sibling that left the union no longer extends eligibility", async () => {
    const communityId = await insertCommunity();
    const siblingId = await insertCommunity();
    const tierId = await insertTier(communityId);
    await replaceRuleset(communityId, [{ groupIndex: 0, mechanism: "tier", config: { tierId } }]);
    await replaceRuleset(siblingId, [{ groupIndex: 0, mechanism: "open", config: {} }]);
    const unionId = await insertUnion();
    await addUnionMembership(unionId, communityId, "active");
    await addUnionMembership(unionId, siblingId, "left");

    const result = await evaluateEligibilityAcrossUnion(communityId, WALLET_A);
    expect(result.eligible).toBe(false);
  });
});
