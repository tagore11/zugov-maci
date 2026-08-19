import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildPollDeployConfig, saveWithRetry, saveIdentityWithRetry } from "./useCreateCommunity";
import { appConstants, FIXED_POLL_DEPLOY_CONSTANTS } from "@/src/config";
import { STATE_TREE_DEPTH } from "@/src/constants";
import type { RegistryData } from "./useZuGovRegistry";
import { sepolia } from "wagmi/chains";
import * as communityApi from "@/src/services/communityApi";

vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return { ...actual, attachGovernance: vi.fn(), registerIdentity: vi.fn() };
});

const REGISTRY_DATA: RegistryData = {
  pollFactory: "0x1111111111111111111111111111111111111111",
  messageProcessorFactory: "0x2222222222222222222222222222222222222222",
  tallyFactory: "0x3333333333333333333333333333333333333333",
  verifier: "0x4444444444444444444444444444444444444444",
  verifyingKeysRegistry: "0x5555555555555555555555555555555555555555",
  poseidonT3: "0x6666666666666666666666666666666666666666",
  poseidonT4: "0x7777777777777777777777777777777777777777",
  poseidonT5: "0x8888888888888888888888888888888888888888",
  poseidonT6: "0x9999999999999999999999999999999999999999",
  coordinatorPubKeyX: 14802431929778780089069300833623425749141594116135705427362850716427704038804n,
  coordinatorPubKeyY: 1884963728498262661875465697903771915700724786437437550406542361681702850003n,
};

describe("buildPollDeployConfig", () => {
  it("assembles a complete PollDeployConfig from live registry data and chain constants", () => {
    const chainConstants = appConstants[sepolia.id];
    const result = buildPollDeployConfig(REGISTRY_DATA, chainConstants);

    expect(result.coordinatorPublicKey).toBe("macipk.842ada068e4156f836e02336160ae0172f0dd9b43280edeb4572c57793068dd3");
    expect(result.treeDepths).toEqual({
      tallyProcessingStateTreeDepth: FIXED_POLL_DEPLOY_CONSTANTS.tallyProcessingStateTreeDepth,
      voteOptionTreeDepth: FIXED_POLL_DEPLOY_CONSTANTS.voteOptionTreeDepth,
      stateTreeDepth: STATE_TREE_DEPTH,
    });
    expect(result.messageBatchSize).toBe(FIXED_POLL_DEPLOY_CONSTANTS.messageBatchSize);
    expect(result.freeForAllPolicyFactory).toBe(chainConstants.policyFactories.freeForAll.policy);
    expect(result.freeForAllChecker).toBe(chainConstants.freeForAllChecker);
    expect(result.constantVoiceCreditProxyFactory).toBe(chainConstants.constantVoiceCreditProxyFactory);
    expect(result.initialVoiceCreditAmount).toBe(FIXED_POLL_DEPLOY_CONSTANTS.initialVoiceCreditAmount);
  });
});

const GOVERNANCE_PAYLOAD = { contractAddress: "0xabc" } as unknown as communityApi.GovernancePayload;
const attachGovernanceMock = communityApi.attachGovernance as unknown as ReturnType<typeof vi.fn>;

describe("saveWithRetry", () => {
  beforeEach(() => {
    attachGovernanceMock.mockReset();
  });

  it("returns immediately on first success", async () => {
    attachGovernanceMock.mockResolvedValue({ id: "identity-1" });
    const result = await saveWithRetry("identity-1", GOVERNANCE_PAYLOAD, vi.fn());
    expect(result).toEqual({ id: "identity-1" });
    expect(attachGovernanceMock).toHaveBeenCalledTimes(1);
    expect(attachGovernanceMock).toHaveBeenCalledWith("identity-1", GOVERNANCE_PAYLOAD);
  });

  // 2026-08-19 community-creation-rework review, D4 (corrected post-outside-voice): on an
  // AuthError, invalidate the shared session and fail immediately — no silent re-sign-in +
  // retry. That silent retry was exactly the "asks to sign in again with no explanation" bug;
  // the visible SiweGate prompt reappearing (via signOut()) is what re-authenticates now, not
  // an automatic wallet-signature popup triggered by this function.
  it("invalidates the session and throws immediately on AuthError, without retrying", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const authError = new communityApi.AuthError();
    attachGovernanceMock.mockRejectedValueOnce(authError);

    await expect(saveWithRetry("identity-1", GOVERNANCE_PAYLOAD, signOut)).rejects.toBe(authError);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(attachGovernanceMock).toHaveBeenCalledTimes(1);
  });

  it("keeps retrying with backoff on non-auth failures, instead of throwing immediately", async () => {
    vi.useFakeTimers();
    try {
      const signOut = vi.fn().mockResolvedValue(undefined);
      attachGovernanceMock
        .mockRejectedValueOnce(new Error("transient")) // attempt 0 fails
        .mockResolvedValueOnce({ id: "identity-1" }); // attempt 1 succeeds

      const promise = saveWithRetry("identity-1", GOVERNANCE_PAYLOAD, signOut);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toEqual({ id: "identity-1" });
      expect(attachGovernanceMock).toHaveBeenCalledTimes(2);
      expect(signOut).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("throws only after 3 attempts for a persistent non-auth failure", async () => {
    vi.useFakeTimers();
    try {
      const signOut = vi.fn().mockResolvedValue(undefined);
      attachGovernanceMock.mockRejectedValue(new Error("persistent"));

      const promise = saveWithRetry("identity-1", GOVERNANCE_PAYLOAD, signOut).catch((err: unknown) => err);
      await vi.advanceTimersByTimeAsync(10000);
      const result = await promise;

      expect(result).toBeInstanceOf(Error);
      expect(attachGovernanceMock).toHaveBeenCalledTimes(3);
      expect(signOut).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

const IDENTITY_PAYLOAD = { displayName: "Test" } as unknown as communityApi.IdentityPayload;
const registerIdentityMock = communityApi.registerIdentity as unknown as ReturnType<typeof vi.fn>;

describe("saveIdentityWithRetry", () => {
  beforeEach(() => {
    registerIdentityMock.mockReset();
  });

  it("returns immediately on first success", async () => {
    registerIdentityMock.mockResolvedValue({ id: "identity-1" });
    const result = await saveIdentityWithRetry(IDENTITY_PAYLOAD, vi.fn());
    expect(result).toEqual({ id: "identity-1" });
    expect(registerIdentityMock).toHaveBeenCalledTimes(1);
  });

  it("invalidates the session and throws immediately on AuthError, without retrying", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const authError = new communityApi.AuthError();
    registerIdentityMock.mockRejectedValueOnce(authError);

    await expect(saveIdentityWithRetry(IDENTITY_PAYLOAD, signOut)).rejects.toBe(authError);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(registerIdentityMock).toHaveBeenCalledTimes(1);
  });
});
