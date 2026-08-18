import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AwaitingActions } from "./AwaitingActions";

const listMock = vi.fn();
const listUnionsForCommunityMock = vi.fn();
const getMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  list: (...args: unknown[]) => listMock(...args),
  listUnionsForCommunity: (...args: unknown[]) => listUnionsForCommunityMock(...args),
  get: (...args: unknown[]) => getMock(...args),
}));

const listMyMembershipsMock = vi.fn();
const listPendingRequestsMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  listMyMemberships: () => listMyMembershipsMock(),
  listPendingRequests: (...args: unknown[]) => listPendingRequestsMock(...args),
}));

const governanceListMock = vi.fn();
const checkVoteEligibilityMock = vi.fn();
vi.mock("@/src/services/governanceActionApi", () => ({
  list: (...args: unknown[]) => governanceListMock(...args),
  checkVoteEligibility: (...args: unknown[]) => checkVoteEligibilityMock(...args),
}));

const OWNED = { id: "community-1", displayName: "ZuKas Residency", logo: null };

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  listMock.mockReset().mockResolvedValue({ communities: [], total: 0, hasMore: false });
  listUnionsForCommunityMock.mockReset().mockResolvedValue([]);
  getMock.mockReset();
  listMyMembershipsMock.mockReset().mockResolvedValue([]);
  listPendingRequestsMock.mockReset().mockResolvedValue([]);
  governanceListMock.mockReset().mockResolvedValue({ governanceActions: [] });
  checkVoteEligibilityMock.mockReset();
});

describe("AwaitingActions", () => {
  it("renders nothing when no wallet is connected", () => {
    const { container } = renderWithProviders(<AwaitingActions address={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the caught-up empty state when nothing is pending", async () => {
    renderWithProviders(<AwaitingActions address="0xabc" />);
    await waitFor(() => expect(screen.getByText(/all caught up/)).toBeInTheDocument());
  });

  it("shows a pending union invite for an owned community, linking to manage-communities", async () => {
    listMock.mockResolvedValue({ communities: [OWNED], total: 1, hasMore: false });
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Pop-up Alliance", logo: null, status: "pending" },
    ]);

    renderWithProviders(<AwaitingActions address="0xabc" />);

    await waitFor(() => expect(screen.getByText("Pop-up Alliance")).toBeInTheDocument());
    expect(screen.getByText("ZuKas Residency")).toBeInTheDocument();
    const link = screen.getByText("Review").closest("a");
    expect(link).toHaveAttribute("href", "/manage-communities");
  });

  it("shows a join-request count for an owned community, linking to that community's members page", async () => {
    listMock.mockResolvedValue({ communities: [OWNED], total: 1, hasMore: false });
    listPendingRequestsMock.mockResolvedValue([
      { id: "req-1", walletAddress: "0x1", createdAt: 1 },
      { id: "req-2", walletAddress: "0x2", createdAt: 2 },
    ]);

    renderWithProviders(<AwaitingActions address="0xabc" />);

    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
    expect(screen.getByText(/join requests waiting/)).toBeInTheDocument();
    const link = screen.getByText("Review").closest("a");
    expect(link).toHaveAttribute("href", "/manage-communities/community-1/members");
  });

  it("only shows a governance action once it passes vote-eligibility, and links to the community page", async () => {
    listMyMembershipsMock.mockResolvedValue(["community-1"]);
    listMock.mockResolvedValue({ communities: [OWNED], total: 1, hasMore: false });
    governanceListMock.mockResolvedValue({
      governanceActions: [
        { id: "action-1", title: "Fund the garden", status: "formalized" },
        { id: "action-2", title: "Draft only", status: "draft" },
      ],
    });
    checkVoteEligibilityMock.mockImplementation((_communityId: string, actionId: string) =>
      Promise.resolve({ eligible: actionId === "action-1" }),
    );

    renderWithProviders(<AwaitingActions address="0xabc" />);

    await waitFor(() => expect(screen.getByText("Fund the garden")).toBeInTheDocument());
    expect(screen.queryByText("Draft only")).not.toBeInTheDocument();
    const link = screen.getByText("Vote").closest("a");
    expect(link).toHaveAttribute("href", "/community/community-1");
  });

  it("stays usable when one data source fails (best-effort, not all-or-nothing)", async () => {
    listMock.mockResolvedValue({ communities: [OWNED], total: 1, hasMore: false });
    listUnionsForCommunityMock.mockRejectedValue(new Error("network error"));
    listPendingRequestsMock.mockResolvedValue([{ id: "req-1", walletAddress: "0x1", createdAt: 1 }]);

    renderWithProviders(<AwaitingActions address="0xabc" />);

    await waitFor(() => expect(screen.getByText(/join request/)).toBeInTheDocument());
  });
});
