import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildPollDeployConfig, saveWithRetry } from "./useCreateCommunity";
import { appConstants, FIXED_POLL_DEPLOY_CONSTANTS, STATE_TREE_DEPTH } from "@/src/config";
import type { RegistryData } from "./useZuGovRegistry";
import { sepolia } from "wagmi/chains";
import * as communityApi from "@/src/services/communityApi";

vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return { ...actual, register: vi.fn() };
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

const PAYLOAD = { id: "0xabc", displayName: "Test" } as unknown as communityApi.RegistrationPayload;
const registerMock = communityApi.register as unknown as ReturnType<typeof vi.fn>;

describe("saveWithRetry", () => {
  beforeEach(() => {
    registerMock.mockReset();
  });

  it("returns immediately on first success", async () => {
    registerMock.mockResolvedValue({ id: "0xabc" });
    const result = await saveWithRetry(PAYLOAD, vi.fn());
    expect(result).toEqual({ id: "0xabc" });
    expect(registerMock).toHaveBeenCalledTimes(1);
  });

  it("retries once after a fresh sign-in on AuthError", async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    registerMock.mockRejectedValueOnce(new communityApi.AuthError()).mockResolvedValueOnce({ id: "0xabc" });

    const result = await saveWithRetry(PAYLOAD, signIn);
    expect(result).toEqual({ id: "0xabc" });
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(registerMock).toHaveBeenCalledTimes(2);
  });

  it("keeps retrying with backoff when the post-sign-in retry also fails, instead of throwing immediately", async () => {
    vi.useFakeTimers();
    try {
      const signIn = vi.fn().mockResolvedValue(undefined);
      registerMock
        .mockRejectedValueOnce(new communityApi.AuthError()) // attempt 0: initial call
        .mockRejectedValueOnce(new Error("transient")) // attempt 0: retry-after-signin also fails
        .mockResolvedValueOnce({ id: "0xabc" }); // attempt 1: succeeds

      const promise = saveWithRetry(PAYLOAD, signIn);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toEqual({ id: "0xabc" });
      expect(registerMock).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("throws only after 3 attempts, even when every failure is an AuthError whose retry also fails", async () => {
    vi.useFakeTimers();
    try {
      const signIn = vi.fn().mockResolvedValue(undefined);
      registerMock.mockRejectedValue(new communityApi.AuthError());

      const promise = saveWithRetry(PAYLOAD, signIn).catch((err: unknown) => err);
      await vi.advanceTimersByTimeAsync(10000);
      const result = await promise;

      expect(result).toBeInstanceOf(communityApi.AuthError);
      expect(signIn).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });
});
