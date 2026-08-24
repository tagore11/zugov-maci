import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CommunityPage from "./page";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined, status: "disconnected" }),
  useChainId: () => 11155111,
  // WalletConnectButton (in Header) calls useConnect()/useDisconnect() directly too
  // (/plan-eng-review, 2026-08-23 — Privy removed).
  useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}));

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

beforeEach(() => {
  communityGetMock.mockReset();
  listChildrenMock.mockReset();
  listChildrenMock.mockResolvedValue([]);
});

function renderWithProviders() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/community/unknown-id"]}>
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
});
