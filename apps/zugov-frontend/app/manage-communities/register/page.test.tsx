import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterCommunityPage from "./page";

// Header -> PrivyConnectButton calls wagmi's useDisconnect() directly, which needs a real
// WagmiProvider this lightweight page test doesn't set up (matches delegates/page.test.tsx's
// established pattern for the same issue).
vi.mock("wagmi", () => ({
  useChainId: () => 11155111,
  useDisconnect: () => ({ disconnect: vi.fn() }),
}));

const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({
    isAuthenticated: true, // SiweGate wraps the submit button -- must be "signed in" to reach it
    isSigning: false,
    error: null,
    signIn: vi.fn(),
    signOut: mockSignOut,
  }),
}));

const registerManualMock = vi.fn();
vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    registerManual: (...args: unknown[]) => registerManualMock(...args),
  };
});

const fetchConfigMock = vi.fn();
vi.mock("@/src/hooks/useMaciContractConfig", () => ({
  useMaciContractConfig: () => ({
    isLoading: false,
    error: null,
    data: null,
    fetchConfig: fetchConfigMock,
    reset: vi.fn(),
  }),
}));

const CONTRACT_CONFIG = {
  allowedPolicies: [0],
  supportedModes: [0],
  signUpPolicyType: "free_for_all",
  signUpPolicyAddress: "0xsignup",
  deploymentBlock: 1,
  stateTreeDepth: 10,
  pollDeployConfig: undefined,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterCommunityPage />
    </MemoryRouter>,
  );
}

async function fillAndLoadContract() {
  fireEvent.click(screen.getByText("MACI"));
  fireEvent.change(screen.getByPlaceholderText("0x..."), {
    target: { value: "0x1234567890123456789012345678901234567890" },
  });
  fetchConfigMock.mockResolvedValue(CONTRACT_CONFIG);
  fireEvent.click(screen.getByText("Load Contract"));
  await screen.findByText("Detected on-chain configuration");
  fireEvent.change(screen.getByPlaceholderText("My Community"), { target: { value: "Test Community" } });
}

beforeEach(() => {
  mockSignOut.mockReset();
  registerManualMock.mockReset();
  fetchConfigMock.mockReset();
});

describe("RegisterCommunityPage", () => {
  it("registers successfully and shows the success screen", async () => {
    registerManualMock.mockResolvedValue({ id: "community-1" });

    renderPage();
    await fillAndLoadContract();
    fireEvent.click(screen.getByText("Register Community"));

    await waitFor(() => expect(screen.getByText("Community Registered!")).toBeInTheDocument());
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // Refactor-preserving regression: this used to call siwe.signOut() manually inside the catch
  // block on AuthError. It now goes through withAuthDetect instead, which fires the same
  // signOut() call before the error reaches this catch — same observable behavior, different
  // mechanism (/plan-eng-review, 2026-08-23, Batch 1).
  it("shows 'Session expired' and signs out when registration fails with an expired session (401)", async () => {
    const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
    registerManualMock.mockRejectedValue(new actual.AuthError());

    renderPage();
    await fillAndLoadContract();
    fireEvent.click(screen.getByText("Register Community"));

    await waitFor(() => expect(screen.getByText("Session expired. Please sign in again.")).toBeInTheDocument());
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows the ownership error message without signing out on a 403", async () => {
    const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
    registerManualMock.mockRejectedValue(new actual.OwnershipError("You are not the contract owner"));

    renderPage();
    await fillAndLoadContract();
    fireEvent.click(screen.getByText("Register Community"));

    await waitFor(() => expect(screen.getByText("You are not the contract owner")).toBeInTheDocument());
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
