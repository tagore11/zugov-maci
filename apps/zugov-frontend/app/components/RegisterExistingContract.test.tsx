import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterExistingContract } from "./RegisterExistingContract";
import { HttpError } from "@/src/services/httpClient";

vi.mock("wagmi", () => ({
  useChainId: () => 11155111,
}));

// Review Army finding, 2026-08-25 — attachGovernance is now wrapped in withAuthDetect, matching
// every other authenticated write in this diff (UnionMembershipSection.tsx, register/page.tsx).
const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut, isAuthenticated: true, isSigning: false, error: null, signIn: vi.fn() }),
}));

const attachGovernanceMock = vi.fn();
vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    attachGovernance: (...args: unknown[]) => attachGovernanceMock(...args),
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
  signUpPolicyType: "FreeForAll",
  signUpPolicyAddress: "0xsignup",
  deploymentBlock: 1,
  stateTreeDepth: 10,
  pollDeployConfig: undefined,
};

async function loadContract() {
  fireEvent.change(screen.getByPlaceholderText("0x..."), {
    target: { value: "0x1234567890123456789012345678901234567890" },
  });
  fetchConfigMock.mockResolvedValue(CONTRACT_CONFIG);
  fireEvent.click(screen.getByText("Load Contract"));
  await screen.findByText("Detected on-chain configuration");
}

beforeEach(() => {
  attachGovernanceMock.mockReset();
  fetchConfigMock.mockReset();
  mockSignOut.mockReset();
});

describe("RegisterExistingContract", () => {
  it("renders nothing once already attached", () => {
    const { container } = render(<RegisterExistingContract communityId="community-1" isAttached={true} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("blocks submit client-side until a contract config has been loaded", () => {
    render(<RegisterExistingContract communityId="community-1" isAttached={false} />);
    expect(screen.getByText("Register Contract")).toBeDisabled();
  });

  it("submits attachGovernance with the loaded config and calls onAttached on success", async () => {
    attachGovernanceMock.mockResolvedValue({ id: "community-1" });
    const onAttached = vi.fn();
    render(<RegisterExistingContract communityId="community-1" isAttached={false} onAttached={onAttached} />);

    await loadContract();
    fireEvent.click(screen.getByText("Register Contract"));

    await waitFor(() =>
      expect(attachGovernanceMock).toHaveBeenCalledWith(
        "community-1",
        expect.objectContaining({
          contractAddress: "0x1234567890123456789012345678901234567890",
          chainId: 11155111,
          signUpPolicyType: "FreeForAll",
        }),
      ),
    );
    expect(onAttached).toHaveBeenCalledTimes(1);
  });

  it("shows a clear error, not a crash, when attachGovernance is rejected (e.g. contract already registered elsewhere)", async () => {
    attachGovernanceMock.mockRejectedValue(new Error("Contract already registered to a different community"));
    render(<RegisterExistingContract communityId="community-1" isAttached={false} />);

    await loadContract();
    fireEvent.click(screen.getByText("Register Contract"));

    await waitFor(() =>
      expect(screen.getByText("Contract already registered to a different community")).toBeInTheDocument(),
    );
  });

  // Review Army / red-team finding, 2026-08-25 — this was the one authenticated write in this
  // diff not wrapped in withAuthDetect, so a 401 here used to dead-end on a static error message
  // with no sign-out. Now matches every sibling write's behavior.
  it("signs out when attachGovernance fails with an expired session (401)", async () => {
    attachGovernanceMock.mockRejectedValue(
      new HttpError(401, "Authentication required. Please sign in with Ethereum."),
    );
    render(<RegisterExistingContract communityId="community-1" isAttached={false} />);

    await loadContract();
    fireEvent.click(screen.getByText("Register Contract"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
