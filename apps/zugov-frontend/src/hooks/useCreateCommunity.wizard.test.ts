import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreateCommunity, RESIDENT_ORGANIZER_TIERS } from "./useCreateCommunity";

// Focused on the communities-first wizard flow added by the design review (Pass 1, 2, 7):
// StepMechanism/StepMaciConfig were removed as separate steps; the wizard now goes straight
// from community_info to community_setup, and role selection reuses existing membershipTiers
// instead of a new permission model. Registry/SIWE/wagmi are mocked to no-ops since this test
// only exercises the wizard's own step-transition and config-building logic.
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0x1111111111111111111111111111111111111111" }),
  useChainId: () => 11155111,
}));

// useCreateCommunity.ts imports wagmiConfig (src/services/wagmiConfig.ts) for module-level
// signer access (see wagmiSigner.ts) — that module calls real wagmi/@privy-io/wagmi functions
// at load time, which the plain "wagmi" mock above doesn't provide. Not needed for this test
// (nothing here exercises the actual deploy/signer path), so mock it out entirely rather than
// trying to make createConfig() work under the mock.
vi.mock("@/src/services/wagmiConfig", () => ({
  wagmiConfig: {},
  CHAINS: [],
}));

vi.mock("./useZuGovRegistry", () => ({
  useZuGovRegistry: () => ({
    isLoading: false,
    isSupported: true,
    isReady: true,
    data: undefined,
    error: undefined,
    refetch: vi.fn(),
  }),
}));

vi.mock("./useSiwe", () => ({
  useSiwe: () => ({ signIn: vi.fn() }),
}));

vi.mock("@/src/services/checkpointStore", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/checkpointStore")>(
    "@/src/services/checkpointStore",
  );
  return {
    ...actual,
    getPendingCheckpoint: () => null,
    savePendingCheckpoint: vi.fn(),
    clearPendingCheckpoint: vi.fn(),
  };
});

// setCommunitySetup now creates the community's identity via a real network call
// (Architecture 1A/1B) — mock it out so these tests only exercise step-transition logic.
let registerIdentityCounter = 0;
vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    registerIdentity: vi.fn(async () => ({ id: `identity-${++registerIdentityCounter}` })),
    update: vi.fn(async (id: string) => ({ id })),
  };
});

beforeEach(async () => {
  localStorage.clear();
  registerIdentityCounter = 0;
  const communityApi = await import("@/src/services/communityApi");
  vi.mocked(communityApi.registerIdentity).mockClear();
  vi.mocked(communityApi.update).mockClear();
});

describe("RESIDENT_ORGANIZER_TIERS", () => {
  it("Resident can vote only; Organizer can vote, create polls, and manage membership", () => {
    const resident = RESIDENT_ORGANIZER_TIERS.find((t) => t.label === "Resident");
    const organizer = RESIDENT_ORGANIZER_TIERS.find((t) => t.label === "Organizer");

    expect(resident).toEqual({
      label: "Resident",
      canVote: true,
      canCreateGovernanceActions: false,
      canManageMembership: false,
    });
    expect(organizer).toEqual({
      label: "Organizer",
      canVote: true,
      canCreateGovernanceActions: true,
      canManageMembership: true,
    });
  });
});

describe("useCreateCommunity wizard flow", () => {
  it("starts at community_info, not the removed mechanism step", () => {
    const { result } = renderHook(() => useCreateCommunity());
    expect(result.current.state.step).toBe("community_info");
  });

  it("community_info -> community_setup, then community_setup -> network_check with defaults applied", async () => {
    const { result } = renderHook(() => useCreateCommunity());

    act(() => {
      result.current.setCommunityInfo("Zukas", "Pop-up city residency");
    });
    expect(result.current.state.step).toBe("community_setup");
    expect(result.current.state.config.displayName).toBe("Zukas");

    await act(async () => {
      await result.current.setCommunitySetup({ membershipPolicy: "open" });
    });

    expect(result.current.state.step).toBe("network_check");
    expect(result.current.state.config.membershipPolicy).toBe("open");
    expect(result.current.state.config.tiers).toEqual(RESIDENT_ORGANIZER_TIERS);
    expect(result.current.state.config.defaultTierLabel).toBe("Resident");
    // Collapsed-Advanced default: FreeForAll sign-up policy, matching the zero-config path.
    expect(result.current.state.config.signUpPolicy).toEqual({ type: "FreeForAll" });
    expect(result.current.state.config.allowedPolicies).toEqual([1]);
    expect(result.current.state.config.supportedModes).toEqual([1]);
  });

  it("approval-required membership policy is preserved through to network_check, not silently reset to open", async () => {
    const { result } = renderHook(() => useCreateCommunity());

    act(() => {
      result.current.setCommunityInfo("Zukas", "");
    });
    await act(async () => {
      await result.current.setCommunitySetup({ membershipPolicy: "approval" });
    });

    expect(result.current.state.config.membershipPolicy).toBe("approval");
  });

  it("Advanced settings, when provided, override the zero-config defaults", async () => {
    const { result } = renderHook(() => useCreateCommunity());

    act(() => {
      result.current.setCommunityInfo("Zukas", "");
    });
    await act(async () => {
      await result.current.setCommunitySetup({
        membershipPolicy: "open",
        advanced: {
          signUpPolicy: { type: "MerkleProof", merkleRoot: "0xabc" },
          allowedPolicies: [2],
          supportedModes: [0],
        },
      });
    });

    expect(result.current.state.config.signUpPolicy).toEqual({ type: "MerkleProof", merkleRoot: "0xabc" });
    expect(result.current.state.config.allowedPolicies).toEqual([2]);
    expect(result.current.state.config.supportedModes).toEqual([0]);
  });

  it("setCommunitySetup creates the identity once and updates (not re-creates) it on re-submission after Back", async () => {
    const communityApi = await import("@/src/services/communityApi");
    const { result } = renderHook(() => useCreateCommunity());

    act(() => {
      result.current.setCommunityInfo("Zukas", "");
    });
    await act(async () => {
      await result.current.setCommunitySetup({ membershipPolicy: "open" });
    });
    const firstIdentityId = result.current.state.identityCommunityId;
    expect(firstIdentityId).toBeDefined();
    expect(communityApi.registerIdentity).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.goBack();
    });
    expect(result.current.state.step).toBe("community_setup");

    await act(async () => {
      await result.current.setCommunitySetup({ membershipPolicy: "approval" });
    });

    expect(result.current.state.identityCommunityId).toBe(firstIdentityId);
    expect(communityApi.registerIdentity).toHaveBeenCalledTimes(1);
    expect(communityApi.update).toHaveBeenCalledWith(
      firstIdentityId,
      expect.objectContaining({ membershipPolicy: "approval" }),
    );
  });

  it("goBack from community_setup returns to community_info", () => {
    const { result } = renderHook(() => useCreateCommunity());

    act(() => {
      result.current.setCommunityInfo("Zukas", "");
    });
    expect(result.current.state.step).toBe("community_setup");

    act(() => {
      result.current.goBack();
    });
    expect(result.current.state.step).toBe("community_info");
  });
});
