import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import { OverviewTab, EventsTab, ProposalsTab, DiscussionsTab } from "./CommunityTabRoutes";
import type { CommunityOutletContext } from "./CommunityLayout";

// Thin wrappers around already-tested components — mocked out entirely so these tests verify
// prop-forwarding from outlet context, not the wrapped components' own internal behavior (that
// coverage already exists in EventsSection.test.tsx / ProposalsList.test.tsx / etc.).
vi.mock("../../components/EventsSection", () => ({
  EventsSection: (props: Record<string, unknown>) => <div data-testid="events-section">{JSON.stringify(props)}</div>,
}));
vi.mock("../../components/ProposalsList", () => ({
  ProposalsList: (props: Record<string, unknown>) => <div data-testid="proposals-list">{JSON.stringify(props)}</div>,
}));
vi.mock("../../components/ZupollSection", () => ({
  ZupollSection: (props: Record<string, unknown>) => <div data-testid="zupoll-section">{JSON.stringify(props)}</div>,
}));
vi.mock("./DiscussionsSection", () => ({
  DiscussionsSection: (props: Record<string, unknown>) => (
    <div data-testid="discussions-section">{JSON.stringify(props)}</div>
  ),
}));

const listChildrenMock = vi.fn();
const listUnionsForCommunityMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  subgraphQueryUrl: (id: string) => `http://mock-subgraph/${id}`,
  listChildren: (...args: unknown[]) => listChildrenMock(...args),
  listUnionsForCommunity: (...args: unknown[]) => listUnionsForCommunityMock(...args),
}));

const fetchMembersMock = vi.fn();
const fetchPollsMock = vi.fn();
vi.mock("@/src/services/subgraph", () => ({
  fetchMembers: (...args: unknown[]) => fetchMembersMock(...args),
  fetchPolls: (...args: unknown[]) => fetchPollsMock(...args),
}));

vi.mock("@/src/services/readContract", () => ({
  fetchNumMessages: vi.fn().mockResolvedValue(0),
  fetchIsEligible: vi.fn().mockResolvedValue(false),
}));

const BASE_COMMUNITY = {
  id: "community-1",
  displayName: "Zukas Residency",
  description: "",
  logo: "",
  creatorAddress: "0x1111111111111111111111111111111111111111",
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
  allowedPolicies: [] as number[],
  supportedModes: [] as number[],
  signUpPolicyType: null,
  signUpPolicyAddress: null,
  stateTreeDepth: null,
  subgraphStatus: null as string | null,
  subgraphName: null,
};

function baseContext(overrides: Partial<CommunityOutletContext> = {}): CommunityOutletContext {
  return {
    community: BASE_COMMUNITY as CommunityOutletContext["community"],
    address: undefined,
    connected: false,
    status: "disconnected",
    isCreator: false,
    isCommunityAdmin: false,
    rpcUrl: "http://mock-rpc",
    ...overrides,
  };
}

function ParentWithContext({ context }: { context: CommunityOutletContext }) {
  return <Outlet context={context} />;
}

function renderTab(ui: React.ReactElement, context: CommunityOutletContext) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/x"]}>
        <Routes>
          <Route path="/x" element={<ParentWithContext context={context} />}>
            <Route index element={ui} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  listChildrenMock.mockReset();
  listUnionsForCommunityMock.mockReset();
  fetchMembersMock.mockReset();
  fetchPollsMock.mockReset();
  listChildrenMock.mockResolvedValue([]);
  listUnionsForCommunityMock.mockResolvedValue([]);
});

describe("OverviewTab", () => {
  it("shows the not-configured empty state when governance isn't set up", async () => {
    renderTab(<OverviewTab />, baseContext());

    expect(await screen.findByText("Governance isn't configured for this community yet.")).toBeInTheDocument();
  });

  it("shows the failed-indexing message when the subgraph failed", async () => {
    renderTab(
      <OverviewTab />,
      baseContext({
        community: {
          ...BASE_COMMUNITY,
          governanceConfigured: true,
          subgraphStatus: "failed",
        } as CommunityOutletContext["community"],
      }),
    );

    expect(
      await screen.findByText("This community's data failed to index. Member count and poll history are unavailable."),
    ).toBeInTheDocument();
  });

  it("shows member and poll counts once the subgraph is ready", async () => {
    fetchMembersMock.mockResolvedValue(42);
    fetchPollsMock.mockResolvedValue([]);

    renderTab(
      <OverviewTab />,
      baseContext({
        community: {
          ...BASE_COMMUNITY,
          governanceConfigured: true,
          subgraphStatus: "ready",
          governanceType: "maci",
        } as CommunityOutletContext["community"],
      }),
    );

    expect(await screen.findByText("42 members")).toBeInTheDocument();
    expect(screen.getByText("0 polls")).toBeInTheDocument();
  });

  it("renders sub-communities when the community has children", async () => {
    listChildrenMock.mockResolvedValue([{ id: "child-1", displayName: "Chapter One", logo: null }]);

    renderTab(<OverviewTab />, baseContext());

    expect(await screen.findByText("Chapter One")).toBeInTheDocument();
  });

  it("renders nothing sub-communities-related when there are no children", async () => {
    renderTab(<OverviewTab />, baseContext());

    await screen.findByText("Governance isn't configured for this community yet.");
    expect(screen.queryByText("Sub-communities")).not.toBeInTheDocument();
  });
});

describe("EventsTab", () => {
  it("forwards communityId, connected, and walletAddress to EventsSection", async () => {
    renderTab(<EventsTab />, baseContext({ connected: true, address: "0xabc" }));

    const props = JSON.parse((await screen.findByTestId("events-section")).textContent!);
    expect(props).toMatchObject({ communityId: "community-1", connected: true, walletAddress: "0xabc" });
  });
});

describe("ProposalsTab", () => {
  it("renders both ProposalsList and ZupollSection with the right props", async () => {
    renderTab(<ProposalsTab />, baseContext({ connected: true, address: "0xabc" }));

    const proposalsProps = JSON.parse((await screen.findByTestId("proposals-list")).textContent!);
    const zupollProps = JSON.parse((await screen.findByTestId("zupoll-section")).textContent!);
    expect(proposalsProps).toMatchObject({ communityId: "community-1", connected: true, walletAddress: "0xabc" });
    expect(zupollProps).toMatchObject({ communityId: "community-1", connected: true });
  });
});

describe("DiscussionsTab", () => {
  it("forwards isCreator to DiscussionsSection", async () => {
    renderTab(<DiscussionsTab />, baseContext({ connected: true, address: "0xabc", isCreator: true }));

    const props = JSON.parse((await screen.findByTestId("discussions-section")).textContent!);
    expect(props).toMatchObject({
      communityId: "community-1",
      connected: true,
      walletAddress: "0xabc",
      isCreator: true,
    });
  });
});
