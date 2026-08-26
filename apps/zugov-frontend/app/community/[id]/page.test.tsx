import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CommunityPage from "./page";

// formalize-communities epic, Child G (/plan-eng-review 2026-08-25) — mutable so the new
// Settings-link visibility tests can simulate a connected wallet; disconnected by default so the
// pre-existing not-found test below doesn't need to change.
let mockAddress: string | undefined;
let mockStatus: "connected" | "disconnected" = "disconnected";
vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: mockAddress, status: mockStatus }),
    useChainId: () => 11155111,
    // WalletConnectButton (in Header) calls useConnect()/useDisconnect() directly too
    // (/plan-eng-review, 2026-08-23 — Privy removed).
    useConnect: () => ({ connectors: [{ id: "injected" }], connect: vi.fn(), isPending: false, error: null }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
    useWalletClient: () => ({ data: undefined }),
  };
});

// This page renders Header -> WalletConnectButton, which calls useSiwe() (session-lifecycle
// fix, 2026-08-22) — useSiwe needs useSignMessage() too, which the wagmi mock above doesn't
// provide, and none of that is relevant to this test's actual concern.
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

// Avoids ProposalsList's transitive useDeployPoll -> wagmiConfig.ts import, which needs
// a fuller wagmi/viem mock than this test cares about (mirrors ProposalsList.test.tsx).
vi.mock("@/src/hooks/useDeployPoll", () => ({
  useDeployPoll: () => ({ isDeploying: false, deployStep: null, deployError: null, deployPoll: vi.fn() }),
  getEthersSigner: () => Promise.resolve({}),
}));

const communityGetMock = vi.fn();
const listChildrenMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  get: (...args: unknown[]) => communityGetMock(...args),
  listChildren: (...args: unknown[]) => listChildrenMock(...args),
  subgraphQueryUrl: (id: string) => `http://mock-subgraph/${id}`,
}));

// formalize-communities epic, Child G (/plan-eng-review 2026-08-25) — feeds the new
// isCommunityAdmin computation (getTiers + getMembershipStatus, same resolution
// settings/page.tsx already does).
const getTiersMock = vi.fn();
const getMembershipStatusMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getTiers: (...args: unknown[]) => getTiersMock(...args),
  getMembershipStatus: (...args: unknown[]) => getMembershipStatusMock(...args),
}));

const CREATOR_ADDRESS = "0x1111111111111111111111111111111111111111";
const OTHER_ADDRESS = "0x2222222222222222222222222222222222222222";

const COMMUNITY = {
  id: "community-1",
  displayName: "Zukas Residency",
  description: "",
  logo: "",
  creatorAddress: CREATOR_ADDRESS,
  parentCommunityId: null,
  membershipPolicy: "open" as const,
  category: null,
  allowJoin: true,
  tierChangesRequireVote: false,
  directDeploymentEnabled: false,
  defaultTierId: null,
  cosponsorshipThreshold: 0,
  createdAt: 0,
  registeredAt: 0,
  governanceConfigured: false,
  contractAddress: null,
  chainId: null,
  governanceType: null,
  allowedPolicies: [],
  supportedModes: [],
  signUpPolicyType: null,
  signUpPolicyAddress: null,
  stateTreeDepth: null,
  subgraphStatus: null,
  subgraphName: null,
};

const ADMIN_TIER = {
  id: "tier-admin",
  label: "Admin",
  canCreateProposals: true,
  canVote: true,
  canManageMembership: true,
  isDefault: false,
  canCreateEvents: true,
};
const REGULAR_TIER = { ...ADMIN_TIER, id: "tier-regular", label: "Regular", canManageMembership: false };

beforeEach(() => {
  mockAddress = undefined;
  mockStatus = "disconnected";
  communityGetMock.mockReset();
  listChildrenMock.mockReset();
  listChildrenMock.mockResolvedValue([]);
  getTiersMock.mockReset();
  getMembershipStatusMock.mockReset();
  getTiersMock.mockResolvedValue([]);
  getMembershipStatusMock.mockResolvedValue({ status: "none" });
});

function renderWithProviders(path = "/community/unknown-id") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/community/:id" element={<CommunityPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// specs/010 US9, FR-018: no fabricated community data (the old static COMMUNITY_LOOKUP keyed by
// "1"/"2"/"3"/"4") should ever render — an unknown id must show a real not-found state, never a
// fake community.
describe("CommunityPage", () => {
  it("shows a real not-found state instead of falling back to placeholder community data", async () => {
    communityGetMock.mockResolvedValue(null);
    renderWithProviders();

    await waitFor(() => expect(screen.getByText("Community not found")).toBeInTheDocument());
    expect(screen.queryByText("ZuKas Residency")).not.toBeInTheDocument();
    expect(screen.queryByText("450")).not.toBeInTheDocument();
  });

  // formalize-communities epic, Child G (/plan-eng-review 2026-08-25, AC4) — owner/admin only.
  describe("Settings link visibility", () => {
    it("shows the Settings link to the community's creator", async () => {
      mockAddress = CREATOR_ADDRESS;
      mockStatus = "connected";
      communityGetMock.mockResolvedValue(COMMUNITY);
      renderWithProviders("/community/community-1");

      expect(await screen.findByText("Settings")).toBeInTheDocument();
    });

    it("shows the Settings link to a non-creator canManageMembership admin", async () => {
      mockAddress = OTHER_ADDRESS;
      mockStatus = "connected";
      communityGetMock.mockResolvedValue(COMMUNITY);
      getTiersMock.mockResolvedValue([ADMIN_TIER]);
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Admin" });
      renderWithProviders("/community/community-1");

      expect(await screen.findByText("Settings")).toBeInTheDocument();
    });

    it("hides the Settings link from a plain (non-admin) member", async () => {
      mockAddress = OTHER_ADDRESS;
      mockStatus = "connected";
      communityGetMock.mockResolvedValue(COMMUNITY);
      getTiersMock.mockResolvedValue([REGULAR_TIER]);
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      renderWithProviders("/community/community-1");

      await screen.findByText("Zukas Residency");
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("hides the Settings link from a disconnected visitor", async () => {
      communityGetMock.mockResolvedValue(COMMUNITY);
      renderWithProviders("/community/community-1");

      await screen.findByText("Zukas Residency");
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });
  });
});
