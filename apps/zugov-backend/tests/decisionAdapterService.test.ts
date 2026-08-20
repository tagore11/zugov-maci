import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testDb, clearCommunities } from "./helpers/testDb.js";
import * as schema from "../src/db/schema.js";
import {
  getCapabilities,
  listAvailable,
  assertHasAnyAdapterAttached,
  attach,
  isAttached,
  NoDecisionAdapterAttachedError,
} from "../src/services/decisionAdapterService.js";

async function insertCommunity(overrides: Partial<typeof schema.communities.$inferInsert> = {}) {
  const id = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await testDb.insert(schema.communities).values({
    id,
    displayName: "Decision Adapter Test Community",
    creatorAddress: "0x0000000000000000000000000000000000dead",
    createdAt: now,
    registeredAt: now,
    ...overrides,
  });
  return id;
}

describe("decisionAdapterService", () => {
  beforeEach(async () => {
    await clearCommunities();
  });

  afterAll(async () => {
    await clearCommunities();
  });

  describe("getCapabilities", () => {
    it("declares maci's supported eligibility mechanisms and voting protocol types", () => {
      expect(getCapabilities("maci")).toEqual({
        adapterType: "maci",
        supportedEligibilityMechanisms: ["open", "erc20_token"],
        supportedVotingProtocolTypes: ["simple", "quadratic", "ranked", "full"],
      });
    });
  });

  describe("listAvailable / isAttached", () => {
    it("returns nothing for a community with no attached adapter", async () => {
      const communityId = await insertCommunity();
      expect(await listAvailable(communityId)).toEqual([]);
      expect(await isAttached(communityId, "maci")).toBe(false);
    });

    it("returns the attached adapter row after attach()", async () => {
      const communityId = await insertCommunity();
      await attach(communityId, "maci");

      const available = await listAvailable(communityId);
      expect(available).toHaveLength(1);
      expect(available[0]?.adapterType).toBe("maci");
      expect(await isAttached(communityId, "maci")).toBe(true);
    });

    it("is scoped per community — attaching one community's adapter doesn't leak to another", async () => {
      const attachedCommunityId = await insertCommunity();
      const otherCommunityId = await insertCommunity();
      await attach(attachedCommunityId, "maci");

      expect(await isAttached(otherCommunityId, "maci")).toBe(false);
      expect(await listAvailable(otherCommunityId)).toEqual([]);
    });
  });

  describe("attach", () => {
    it("is idempotent — attaching an already-attached adapter doesn't error or duplicate", async () => {
      const communityId = await insertCommunity();
      await attach(communityId, "maci");
      await attach(communityId, "maci");

      expect(await listAvailable(communityId)).toHaveLength(1);
    });
  });

  describe("assertHasAnyAdapterAttached", () => {
    it("throws NoDecisionAdapterAttachedError when nothing is attached", async () => {
      const communityId = await insertCommunity();
      await expect(assertHasAnyAdapterAttached(communityId)).rejects.toBeInstanceOf(NoDecisionAdapterAttachedError);
    });

    it("resolves once any adapter is attached", async () => {
      const communityId = await insertCommunity();
      await attach(communityId, "maci");
      await expect(assertHasAnyAdapterAttached(communityId)).resolves.toBeUndefined();
    });
  });
});
