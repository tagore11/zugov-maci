import { describe, it, expect, beforeEach } from "vitest";
import type { Hex } from "viem";
import {
  savePendingCheckpoint,
  getPendingCheckpoint,
  clearPendingCheckpoint,
  findAnyPendingCheckpoint,
  type PendingDeploymentCheckpoint,
} from "./checkpointStore";

const WALLET = "0xAbC0000000000000000000000000000000dEf1" as Hex;

function makeCheckpoint(overrides: Partial<PendingDeploymentCheckpoint> = {}): PendingDeploymentCheckpoint {
  return {
    config: {
      displayName: "Test Community",
      description: "",
      signUpPolicy: { type: "FreeForAll" },
      allowedPolicies: [1],
      supportedModes: [1],
      stateTreeDepth: 10,
      membershipPolicy: "open",
      tierChangesRequireVote: false,
      tiers: [],
      defaultTierLabel: "Resident",
    },
    lastPhase: "deploy_sign_up_policy",
    chainId: 11155111,
    startedAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("savePendingCheckpoint / getPendingCheckpoint / clearPendingCheckpoint", () => {
  it("round-trips a checkpoint for a given wallet + community", () => {
    const checkpoint = makeCheckpoint();
    savePendingCheckpoint(WALLET, "community-1", checkpoint);
    expect(getPendingCheckpoint(WALLET, "community-1")).toEqual(checkpoint);
  });

  it("returns null for a community with no checkpoint", () => {
    expect(getPendingCheckpoint(WALLET, "nonexistent")).toBeNull();
  });

  it("keeps two communities' checkpoints independent under the same wallet (D5)", () => {
    const checkpoint1 = makeCheckpoint({ lastPhase: "deploy_sign_up_policy" });
    const checkpoint2 = makeCheckpoint({ lastPhase: "deploy_maci" });
    savePendingCheckpoint(WALLET, "community-1", checkpoint1);
    savePendingCheckpoint(WALLET, "community-2", checkpoint2);

    expect(getPendingCheckpoint(WALLET, "community-1")).toEqual(checkpoint1);
    expect(getPendingCheckpoint(WALLET, "community-2")).toEqual(checkpoint2);

    // Overwriting community-2's checkpoint (simulating a second write mid-deploy) must not
    // touch community-1's — this is the exact write-time collision the outside voice found.
    const checkpoint2Updated = makeCheckpoint({ lastPhase: "set_target" });
    savePendingCheckpoint(WALLET, "community-2", checkpoint2Updated);
    expect(getPendingCheckpoint(WALLET, "community-1")).toEqual(checkpoint1);
    expect(getPendingCheckpoint(WALLET, "community-2")).toEqual(checkpoint2Updated);
  });

  it("clearing one community's checkpoint leaves another untouched", () => {
    savePendingCheckpoint(WALLET, "community-1", makeCheckpoint());
    savePendingCheckpoint(WALLET, "community-2", makeCheckpoint());
    clearPendingCheckpoint(WALLET, "community-1");
    expect(getPendingCheckpoint(WALLET, "community-1")).toBeNull();
    expect(getPendingCheckpoint(WALLET, "community-2")).not.toBeNull();
  });
});

describe("findAnyPendingCheckpoint", () => {
  it("returns null when no checkpoint exists for the wallet", () => {
    expect(findAnyPendingCheckpoint(WALLET)).toBeNull();
  });

  it("finds a checkpoint without knowing the community id in advance", () => {
    const checkpoint = makeCheckpoint();
    savePendingCheckpoint(WALLET, "community-1", checkpoint);
    const found = findAnyPendingCheckpoint(WALLET);
    expect(found).not.toBeNull();
    expect(found!.communityId).toBe("community-1");
    expect(found!.checkpoint).toEqual(checkpoint);
  });

  it("does not match a different wallet's checkpoint", () => {
    savePendingCheckpoint(WALLET, "community-1", makeCheckpoint());
    const otherWallet = "0x0000000000000000000000000000000000dead" as Hex;
    expect(findAnyPendingCheckpoint(otherWallet)).toBeNull();
  });
});
