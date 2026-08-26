import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DiscussionsSection } from "./DiscussionsSection";

const listDiscussionsMock = vi.fn();
const deleteDiscussionMock = vi.fn();

vi.mock("@/src/services/discussionApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/discussionApi")>("@/src/services/discussionApi");
  return {
    ...actual,
    listDiscussions: (...args: unknown[]) => listDiscussionsMock(...args),
    deleteDiscussion: (...args: unknown[]) => deleteDiscussionMock(...args),
  };
});

const getMembershipStatusMock = vi.fn();
const getTiersMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getMembershipStatus: (...args: unknown[]) => getMembershipStatusMock(...args),
  getTiers: (...args: unknown[]) => getTiersMock(...args),
}));

const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const AUTHOR_WALLET = "0x1234567890123456789012345678901234567890";
const OTHER_WALLET = "0x9999999999999999999999999999999999999999";

const MEMBER_TIER = {
  id: "tier-member",
  label: "Member",
  canCreateProposals: true,
  canVote: true,
  isDefault: true,
  canCreateEvents: true,
  canPostDiscussions: true,
};

const DISCUSSION = {
  id: "discussion-1",
  communityId: "0xabc",
  authorAddress: AUTHOR_WALLET,
  title: "Welcome thread",
  body: "Introduce yourself here.",
  eligibleTierIds: null,
  createdAt: 0,
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  listDiscussionsMock.mockReset();
  deleteDiscussionMock.mockReset();
  getMembershipStatusMock.mockReset();
  getTiersMock.mockReset();
  mockSignOut.mockReset();

  getTiersMock.mockResolvedValue([MEMBER_TIER]);
  listDiscussionsMock.mockResolvedValue([DISCUSSION]);
});

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D5) — renders nothing at all
// for a non-member/disconnected viewer, redundant with (not a substitute for) the backend's own
// member-row-OR-admin gate.
describe("DiscussionsSection — membership gate (D5)", () => {
  it("renders nothing for a disconnected viewer", () => {
    getMembershipStatusMock.mockResolvedValue({ status: "none" });
    const { container } = renderWithProviders(
      <DiscussionsSection communityId="0xabc" connected={false} walletAddress={undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a signed-in non-member", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "none" });
    const { container } = renderWithProviders(
      <DiscussionsSection communityId="0xabc" connected={true} walletAddress={OTHER_WALLET} />,
    );
    await waitFor(() => expect(getMembershipStatusMock).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    expect(listDiscussionsMock).not.toHaveBeenCalled();
  });

  it("renders the discussions list for a member", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Member" });
    renderWithProviders(<DiscussionsSection communityId="0xabc" connected={true} walletAddress={AUTHOR_WALLET} />);

    await screen.findByText("Welcome thread");
  });

  // /ship review army (2026-08-26, api-contract specialist) — a community's on-chain-reconciled
  // owner (communityService.ts's reconcileCreatorAddress) has real backend admin authority with
  // no memberships row, matching D5's own backend carve-out. Without isCreator composed in,
  // canAccess would be false and the section would render nothing for that wallet.
  it("renders the discussions list for the creator even with no memberships row (isCreator composed)", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "none" });
    renderWithProviders(
      <DiscussionsSection communityId="0xabc" connected={true} walletAddress={OTHER_WALLET} isCreator={true} />,
    );

    await screen.findByText("Welcome thread");
  });

  // /ship review army (2026-08-26, testing specialist) — mirrors EventsSection.test.tsx's/
  // ProposalsList.test.tsx's identical query-key-refetch test for the same walletAddress-in-key
  // pattern (D4 on this resource).
  it("refetches the discussions list when walletAddress changes", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Member" });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <DiscussionsSection communityId="0xabc" connected={true} walletAddress={AUTHOR_WALLET} />
      </QueryClientProvider>,
    );
    await screen.findByText("Welcome thread");
    expect(listDiscussionsMock).toHaveBeenCalledTimes(1);

    rerender(
      <QueryClientProvider client={queryClient}>
        <DiscussionsSection communityId="0xabc" connected={true} walletAddress={OTHER_WALLET} />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(listDiscussionsMock).toHaveBeenCalledTimes(2));
  });
});

describe("DiscussionsSection — post/edit/delete authority", () => {
  it("shows the New Discussion button when the member's tier has canPostDiscussions", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Member" });
    renderWithProviders(<DiscussionsSection communityId="0xabc" connected={true} walletAddress={AUTHOR_WALLET} />);

    await screen.findByText("New Discussion");
  });

  it("hides the New Discussion button when the member's tier lacks canPostDiscussions", async () => {
    getTiersMock.mockResolvedValue([{ ...MEMBER_TIER, canPostDiscussions: false }]);
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Member" });
    renderWithProviders(<DiscussionsSection communityId="0xabc" connected={true} walletAddress={AUTHOR_WALLET} />);

    await screen.findByText("Welcome thread");
    expect(screen.queryByText("New Discussion")).not.toBeInTheDocument();
  });

  it("shows edit and delete controls to the post's author", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Member" });
    renderWithProviders(<DiscussionsSection communityId="0xabc" connected={true} walletAddress={AUTHOR_WALLET} />);

    await screen.findByText("Welcome thread");
    expect(screen.getByLabelText("Edit")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete")).toBeInTheDocument();
  });

  // D3 — a non-author admin can delete but not edit someone else's post.
  it("shows delete but not edit to a non-author admin", async () => {
    // useIsCommunityAdmin and DiscussionsSection's own membership query share the same query key
    // (["membershipStatus", communityId]) — this wallet has an Admin-capable tier, matching a
    // non-author admin's status.
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Admin" });
    getTiersMock.mockResolvedValue([
      {
        id: "tier-admin",
        label: "Admin",
        canCreateProposals: true,
        canVote: true,
        isDefault: false,
        canCreateEvents: true,
        canPostDiscussions: true,
        canManageMembership: true,
      },
    ]);
    renderWithProviders(<DiscussionsSection communityId="0xabc" connected={true} walletAddress={OTHER_WALLET} />);

    await screen.findByText("Welcome thread");
    expect(screen.queryByLabelText("Edit")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Delete")).toBeInTheDocument();
  });

  it("deletes a post after confirming", async () => {
    deleteDiscussionMock.mockResolvedValue(undefined);
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Member" });
    renderWithProviders(<DiscussionsSection communityId="0xabc" connected={true} walletAddress={AUTHOR_WALLET} />);

    await screen.findByText("Welcome thread");
    fireEvent.click(screen.getByLabelText("Delete"));
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => expect(deleteDiscussionMock).toHaveBeenCalledWith("0xabc", "discussion-1"));
  });
});
