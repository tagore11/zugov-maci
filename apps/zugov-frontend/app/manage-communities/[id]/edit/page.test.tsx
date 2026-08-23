import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EditCommunityPage from "./page";
import { HttpError } from "@/src/services/httpClient";

const CREATOR_ADDRESS = "0x1111111111111111111111111111111111111111";

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: CREATOR_ADDRESS }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
  };
});

const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const getCommunityMock = vi.fn();
const updateMock = vi.fn();
vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    get: (...args: unknown[]) => getCommunityMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
  };
});

const getTiersMock = vi.fn();
const getMembershipStatusMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getTiers: (...args: unknown[]) => getTiersMock(...args),
  getMembershipStatus: (...args: unknown[]) => getMembershipStatusMock(...args),
  createTier: vi.fn(),
  updateTier: vi.fn(),
  deleteTier: vi.fn(),
}));

const getRulesetMock = vi.fn();
vi.mock("@/src/services/eligibilityApi", () => ({
  getRuleset: (...args: unknown[]) => getRulesetMock(...args),
  replaceRuleset: vi.fn(),
}));

const COMMUNITY = {
  id: "community-1",
  displayName: "Zukas Residency",
  description: "",
  logo: "",
  creatorAddress: CREATOR_ADDRESS,
  membershipPolicy: "open" as const,
  tierChangesRequireVote: false,
  directDeploymentEnabled: false,
  // true so the page renders the plain "Governance is configured" text instead of
  // DeployGovernanceSection, which pulls in useChainId()/useZuGovRegistry() and needs a real
  // WagmiProvider -- unrelated to what this file tests (the save flow's 401-handling).
  governanceConfigured: true,
  defaultTierId: null,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/manage-communities/community-1/edit"]}>
      <Routes>
        <Route path="/manage-communities/:id/edit" element={<EditCommunityPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockSignOut.mockReset();
  getCommunityMock.mockReset();
  updateMock.mockReset();
  getTiersMock.mockReset();
  getMembershipStatusMock.mockReset();
  getRulesetMock.mockReset();

  getCommunityMock.mockResolvedValue(COMMUNITY);
  getTiersMock.mockResolvedValue([]);
  getMembershipStatusMock.mockResolvedValue({ status: "none" });
  getRulesetMock.mockResolvedValue([]);
});

describe("EditCommunityPage save flow", () => {
  it("saves successfully and navigates away", async () => {
    updateMock.mockResolvedValue(COMMUNITY);

    renderPage();

    fireEvent.click(await screen.findByText("Save Changes"));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // /plan-eng-review (2026-08-23) Batch 2 -- communityApi.update's call site here was the one
  // Batch 1 missed (the wizard's call to the same function was wrapped via withAuthRetry, this
  // edit-page call wasn't). The whole save sequence (update + tier CRUD + eligibility ruleset)
  // is now wrapped in one withAuthDetect call so a 401 anywhere in it signs out exactly once.
  it("shows an error and signs out when saving fails with an expired session (401)", async () => {
    updateMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    renderPage();

    fireEvent.click(await screen.findByText("Save Changes"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows an error without signing out when saving fails with a non-auth error", async () => {
    updateMock.mockRejectedValue(new Error("Network error"));

    renderPage();

    fireEvent.click(await screen.findByText("Save Changes"));

    await waitFor(() => expect(screen.getByText("Network error")).toBeInTheDocument());
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
