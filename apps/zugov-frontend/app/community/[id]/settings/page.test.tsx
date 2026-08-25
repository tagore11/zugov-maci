import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CommunitySettingsPage from "./page";
import { HttpError } from "@/src/services/httpClient";

const CREATOR_ADDRESS = "0x1111111111111111111111111111111111111111";
const OTHER_ADDRESS = "0x2222222222222222222222222222222222222222";

let mockAddress: string = CREATOR_ADDRESS;

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: mockAddress, status: "connected" }),
    // WalletConnectButton (in Header) calls useConnect() directly too (/plan-eng-review,
    // 2026-08-23 — Privy removed); overriding avoids needing a real WagmiProvider here.
    useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
  };
});

const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  // /plan-eng-review Phase B (2026-08-23) — Save Changes is now SiweGate-wrapped; isAuthenticated
  // must be true for these tests to reach the real button instead of the sign-in prompt.
  useSiwe: () => ({ signOut: mockSignOut, isAuthenticated: true, isSigning: false, error: null, signIn: vi.fn() }),
}));

const getCommunityMock = vi.fn();
const updateMock = vi.fn();
// UnionMembershipSection (Child D, /plan-eng-review 2026-08-25) fetches this on mount now too —
// mocked to resolve empty so it renders nothing, unrelated to what these tests exercise.
const listUnionsForCommunityMock = vi.fn();
vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    get: (...args: unknown[]) => getCommunityMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    listUnionsForCommunity: (...args: unknown[]) => listUnionsForCommunityMock(...args),
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
const replaceRulesetMock = vi.fn();
vi.mock("@/src/services/eligibilityApi", () => ({
  getRuleset: (...args: unknown[]) => getRulesetMock(...args),
  replaceRuleset: (...args: unknown[]) => replaceRulesetMock(...args),
}));

// Merged in from the zupoll decision-adapter feature (main) — this page now also fetches which
// decision adapters are attached, unrelated to what most of these tests exercise. Mocked out
// entirely so the load effect's Promise.all doesn't hit a real fetch.
const listDecisionAdaptersMock = vi.fn();
vi.mock("@/src/services/zupollApi", () => ({
  listDecisionAdapters: (...args: unknown[]) => listDecisionAdaptersMock(...args),
}));

const COMMUNITY = {
  id: "community-1",
  displayName: "Zukas Residency",
  description: "",
  logo: "",
  creatorAddress: CREATOR_ADDRESS,
  membershipPolicy: "open" as const,
  allowJoin: true,
  tierChangesRequireVote: false,
  directDeploymentEnabled: false,
  // Required by the Community type; the page's DeployGovernanceSection gate now reads
  // attachedAdapters (mocked via listDecisionAdaptersMock below), not this field directly.
  governanceConfigured: true,
  defaultTierId: null,
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/community/community-1/settings"]}>
        <Routes>
          <Route path="/community/:id/settings" element={<CommunitySettingsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockAddress = CREATOR_ADDRESS;
  mockSignOut.mockReset();
  getCommunityMock.mockReset();
  updateMock.mockReset();
  getTiersMock.mockReset();
  getMembershipStatusMock.mockReset();
  getRulesetMock.mockReset();
  replaceRulesetMock.mockReset();
  listDecisionAdaptersMock.mockReset();
  listUnionsForCommunityMock.mockReset();

  getCommunityMock.mockResolvedValue(COMMUNITY);
  getTiersMock.mockResolvedValue([]);
  getMembershipStatusMock.mockResolvedValue({ status: "none" });
  getRulesetMock.mockResolvedValue([]);
  replaceRulesetMock.mockResolvedValue(undefined);
  listUnionsForCommunityMock.mockResolvedValue([]);
  // "maci" attached (not just the old governanceConfigured flag main replaced it with) so the
  // page renders the plain "Governance is configured" text instead of DeployGovernanceSection,
  // which pulls in useChainId()/useZuGovRegistry() and needs a real WagmiProvider -- unrelated
  // to what most of these tests exercise.
  listDecisionAdaptersMock.mockResolvedValue({ adapters: ["maci"] });
});

// CRITICAL regression (Test Review, /plan-eng-review 2026-08-24): the owner/admin auth gate
// (isCreator || isCommunityAdmin) moved here from /manage-communities/:id/edit. A route-param
// mismatch during that move could silently disable the gate with nothing catching it until a
// real user hit it — these two cases prove it still works at the new route.
describe("CommunitySettingsPage authorization gate", () => {
  it("shows the settings form to the community's creator", async () => {
    mockAddress = CREATOR_ADDRESS;
    renderPage();

    expect(await screen.findByText("Community Settings")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("blocks a non-creator, non-admin wallet with a clear message, not the form", async () => {
    mockAddress = OTHER_ADDRESS;
    getMembershipStatusMock.mockResolvedValue({ status: "none" });

    renderPage();

    expect(await screen.findByText(/Only this community.s creator or an admin can manage it/)).toBeInTheDocument();
    expect(screen.queryByText("Community Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
  });

  // Review Army / testing specialist, 2026-08-25 — the creator and denied cases above never
  // exercised the third branch: a non-creator member whose tier grants canManageMembership.
  it("grants access to a non-creator wallet with a canManageMembership tier", async () => {
    mockAddress = OTHER_ADDRESS;
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Admin" });
    getTiersMock.mockResolvedValue([
      {
        id: "tier-admin",
        label: "Admin",
        canCreateProposals: true,
        canVote: true,
        canManageMembership: true,
        canCreateEvents: true,
        isDefault: true,
      },
    ]);

    renderPage();

    expect(await screen.findByText("Community Settings")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });
});

// Ship-time coverage audit finding, 2026-08-25 — loading and not-found states had no coverage.
describe("CommunitySettingsPage load states", () => {
  it("shows a loading state before the community data resolves", () => {
    // Never resolves during this test — page should stay in its loading state.
    getCommunityMock.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText("Loading community…")).toBeInTheDocument();
    expect(screen.queryByText("Community Settings")).not.toBeInTheDocument();
  });

  it("shows a not-found state when the community doesn't exist", async () => {
    getCommunityMock.mockResolvedValue(null);
    renderPage();

    expect(await screen.findByText("Community not found.")).toBeInTheDocument();
    expect(screen.queryByText("Community Settings")).not.toBeInTheDocument();
  });
});

// Ship-time coverage audit finding, 2026-08-25 — handleTierEditorChange's removal cascade
// (resetting defaultTierLabel when the removed tier WAS the default, and dropping eligibility
// rules that referenced the removed tier) had no coverage at the new settings-page location.
describe("CommunitySettingsPage tier removal cascade", () => {
  const TIER_REGULAR = {
    id: "tier-regular",
    label: "Regular",
    canCreateProposals: false,
    canVote: true,
    canManageMembership: false,
    canCreateEvents: true,
    isDefault: true,
  };
  const TIER_VIP = {
    id: "tier-vip",
    label: "VIP",
    canCreateProposals: true,
    canVote: true,
    canManageMembership: false,
    canCreateEvents: true,
    isDefault: false,
  };

  it("resets the default tier selection when the removed tier was the default", async () => {
    getTiersMock.mockResolvedValue([TIER_REGULAR, TIER_VIP]);
    getCommunityMock.mockResolvedValue({ ...COMMUNITY, defaultTierId: "tier-regular" });

    renderPage();

    await screen.findByText("Community Settings");
    // The only <select> on this page in this scenario (governance already configured, no chain
    // picker rendered) is the Default Tier dropdown.
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("Regular");

    // Remove the "Regular" tier (the current default) — its Remove button is the first one.
    fireEvent.click(screen.getAllByText("Remove")[0]!);

    await waitFor(() => expect(select.value).toBe("VIP"));
  });

  it("drops an eligibility rule that referenced the removed tier", async () => {
    getTiersMock.mockResolvedValue([TIER_REGULAR, TIER_VIP]);
    getCommunityMock.mockResolvedValue({ ...COMMUNITY, defaultTierId: "tier-vip" });
    getRulesetMock.mockResolvedValue([
      { id: "rule-1", groupIndex: 0, mechanism: "tier", targetTierId: undefined, config: { tierId: "tier-regular" } },
    ]);
    updateMock.mockResolvedValue(COMMUNITY);

    renderPage();

    await screen.findByText("Community Settings");
    // Remove "Regular" (the tier the eligibility rule references).
    fireEvent.click(screen.getAllByText("Remove")[0]!);

    fireEvent.click(screen.getByText("Save Changes"));

    // replaceRuleset is called with the rule referencing the removed tier dropped (empty array).
    await waitFor(() => expect(replaceRulesetMock).toHaveBeenCalledWith("community-1", []));
  });
});

describe("CommunitySettingsPage save flow", () => {
  it("saves successfully and navigates away", async () => {
    updateMock.mockResolvedValue(COMMUNITY);

    renderPage();

    fireEvent.click(await screen.findByText("Save Changes"));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("includes allowJoin in the save payload", async () => {
    updateMock.mockResolvedValue(COMMUNITY);

    renderPage();

    const toggle = await screen.findByLabelText(/Allow people to join this community/);
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith("community-1", expect.objectContaining({ allowJoin: false })),
    );
  });

  // /plan-eng-review (2026-08-23) Batch 2 -- communityApi.update's call site here was the one
  // Batch 1 missed (the wizard's call to the same function was wrapped via withAuthRetry, this
  // page's call wasn't). The whole save sequence (update + tier CRUD + eligibility ruleset) is
  // now wrapped in one withAuthDetect call so a 401 anywhere in it signs out exactly once.
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
