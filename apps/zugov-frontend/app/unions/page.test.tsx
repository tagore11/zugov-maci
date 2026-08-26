import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UnionsPage from "./page";

const listAllUnionsMock = vi.fn();
const getMyPendingUnionInvitesMock = vi.fn();

vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    listAllUnions: (...args: unknown[]) => listAllUnionsMock(...args),
    getMyPendingUnionInvites: (...args: unknown[]) => getMyPendingUnionInvitesMock(...args),
  };
});

vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: undefined, status: "disconnected" }),
    useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
  };
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UnionsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  listAllUnionsMock.mockReset();
  getMyPendingUnionInvitesMock.mockReset();
  getMyPendingUnionInvitesMock.mockResolvedValue([]);
});

// community page redesign (/plan-eng-review 2026-08-26, D2) — pending-invite badge, new coverage
// for a page that previously had zero tests.
describe("UnionsPage pending-invite badge", () => {
  it("shows no badge when the wallet has no pending invites", async () => {
    listAllUnionsMock.mockResolvedValue({
      unions: [{ id: "union-1", displayName: "Alliance", description: null, logo: null, memberCount: 2 }],
      total: 1,
      hasMore: false,
    });

    renderPage();

    await screen.findByText("Alliance");
    expect(screen.queryByText("Pending invite")).not.toBeInTheDocument();
  });

  it("shows a badge on the union with a pending invite for one of the wallet's communities", async () => {
    listAllUnionsMock.mockResolvedValue({
      unions: [
        { id: "union-1", displayName: "Alliance", description: null, logo: null, memberCount: 2 },
        { id: "union-2", displayName: "Coalition", description: null, logo: null, memberCount: 1 },
      ],
      total: 2,
      hasMore: false,
    });
    getMyPendingUnionInvitesMock.mockResolvedValue([
      { unionId: "union-1", unionDisplayName: "Alliance", communityId: "c1", communityDisplayName: "My Co" },
    ]);

    renderPage();

    await waitFor(() => expect(screen.getByText("Pending invite")).toBeInTheDocument());
    // Scoped to Alliance's card only, not Coalition's.
    const allianceCard = screen.getByText("Alliance").closest("a")!;
    const coalitionCard = screen.getByText("Coalition").closest("a")!;
    expect(allianceCard.textContent).toContain("Pending invite");
    expect(coalitionCard.textContent).not.toContain("Pending invite");
  });
});
