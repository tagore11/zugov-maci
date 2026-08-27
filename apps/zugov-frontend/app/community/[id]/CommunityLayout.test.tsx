import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CommunityLayout from "./CommunityLayout";

// Migrated from the deleted page.test.tsx (community page redesign, /plan-eng-review
// 2026-08-26) — same fixtures, same mocking pattern, now exercising CommunityLayout instead of
// the old monolithic CommunityPage. The loading-state test below is new: page.tsx never had one.
let mockAddress: string | undefined;
let mockStatus: "connected" | "disconnected" = "disconnected";
vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: mockAddress, status: mockStatus }),
    useChainId: () => 11155111,
    useConnect: () => ({ connectors: [{ id: "injected" }], connect: vi.fn(), isPending: false, error: null }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
    useWalletClient: () => ({ data: undefined }),
  };
});

vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

const communityGetMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  get: (...args: unknown[]) => communityGetMock(...args),
  subgraphQueryUrl: (id: string) => `http://mock-subgraph/${id}`,
}));

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
          <Route path="/community/:id" element={<CommunityLayout />}>
            <Route index element={<div>Overview tab content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CommunityLayout", () => {
  // New — page.tsx never had a test for its own loading skeleton.
  it("shows a loading state before the community data resolves", () => {
    communityGetMock.mockReturnValue(new Promise(() => {}));
    renderWithProviders("/community/community-1");

    expect(screen.getByRole("status", { name: "Loading community" })).toBeInTheDocument();
  });

  // specs/010 US9, FR-018: no fabricated community data should ever render — an unknown id must
  // show a real not-found state, never a fake community.
  it("shows a real not-found state instead of falling back to placeholder community data", async () => {
    communityGetMock.mockResolvedValue(null);
    renderWithProviders();

    await waitFor(() => expect(screen.getByText("Community not found")).toBeInTheDocument());
    expect(screen.queryByText("ZuKas Residency")).not.toBeInTheDocument();
  });

  it("does not render the Outlet's tab content while loading or not-found", async () => {
    communityGetMock.mockResolvedValue(null);
    renderWithProviders();

    await waitFor(() => expect(screen.getByText("Community not found")).toBeInTheDocument());
    expect(screen.queryByText("Overview tab content")).not.toBeInTheDocument();
  });

  // formalize-communities epic, Child G (/plan-eng-review 2026-08-25, AC4) — owner/admin only.
  // Migrated from page.test.tsx's "Settings link visibility" to the new tab-nav shape.
  describe("Settings tab visibility", () => {
    it("shows the Settings tab to the community's creator", async () => {
      mockAddress = CREATOR_ADDRESS;
      mockStatus = "connected";
      communityGetMock.mockResolvedValue(COMMUNITY);
      renderWithProviders("/community/community-1");

      expect(await screen.findByText("Settings")).toBeInTheDocument();
    });

    it("shows the Settings tab to a non-creator canManageMembership admin", async () => {
      mockAddress = OTHER_ADDRESS;
      mockStatus = "connected";
      communityGetMock.mockResolvedValue(COMMUNITY);
      getTiersMock.mockResolvedValue([ADMIN_TIER]);
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Admin" });
      renderWithProviders("/community/community-1");

      expect(await screen.findByText("Settings")).toBeInTheDocument();
    });

    it("hides the Settings tab from a plain (non-admin) member", async () => {
      mockAddress = OTHER_ADDRESS;
      mockStatus = "connected";
      communityGetMock.mockResolvedValue(COMMUNITY);
      getTiersMock.mockResolvedValue([REGULAR_TIER]);
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      renderWithProviders("/community/community-1");

      await screen.findByText("Zukas Residency");
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("hides the Settings tab from a disconnected visitor", async () => {
      communityGetMock.mockResolvedValue(COMMUNITY);
      renderWithProviders("/community/community-1");

      await screen.findByText("Zukas Residency");
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });
  });

  describe("tab nav", () => {
    it("always shows Overview, Events, Proposals, and Discussions tabs", async () => {
      communityGetMock.mockResolvedValue(COMMUNITY);
      renderWithProviders("/community/community-1");

      await screen.findByText("Zukas Residency");
      // Scoped to the community tab nav specifically — the site-wide Header also has its own
      // top-level "Proposals" nav link, which would otherwise collide with a bare getByText.
      const tabNav = within(screen.getByRole("navigation", { name: "Community sections" }));
      expect(tabNav.getByText("Overview")).toBeInTheDocument();
      expect(tabNav.getByText("Events")).toBeInTheDocument();
      expect(tabNav.getByText("Proposals")).toBeInTheDocument();
      expect(tabNav.getByText("Discussions")).toBeInTheDocument();
    });
  });
});
