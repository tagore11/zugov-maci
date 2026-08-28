import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UnionActions } from "./UnionActions";

// Thin wrapper around an already-tested component (UnionMembershipSection.test.tsx covers its
// own search/invite behavior) — mocked out so these tests verify UnionActions' own layout and
// D14/D16 decisions, not InviteToUnionForm's internals.
vi.mock("./UnionMembershipSection", () => ({
  InviteToUnionForm: ({ unionId, actingCommunityId }: { unionId: string; actingCommunityId: string }) => (
    <div data-testid="invite-form">
      {unionId}:{actingCommunityId}
    </div>
  ),
}));

const getUnionMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  getUnion: (...args: unknown[]) => getUnionMock(...args),
}));

const respondMock = vi.fn();
const leaveMock = vi.fn();
vi.mock("@/src/hooks/useUnionMembershipActions", () => ({
  useUnionMembershipActions: () => ({
    respond: respondMock,
    leave: leaveMock,
    isResponding: () => false,
    isLeaving: () => false,
    errorFor: () => "",
  }),
}));

const ACTIVE_MEMBER = {
  communityId: "community-active",
  displayName: "Founding Co",
  logo: null,
  status: "active" as const,
};
const PENDING_MEMBER = {
  communityId: "community-pending",
  displayName: "Invited Co",
  logo: null,
  status: "pending" as const,
};

function renderWithProviders(unionId = "union-1", connected = true) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <UnionActions unionId={unionId} connected={connected} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getUnionMock.mockReset();
  respondMock.mockReset();
  leaveMock.mockReset();
  leaveMock.mockResolvedValue(undefined);
});

describe("UnionActions", () => {
  it("renders nothing while disconnected", () => {
    const { container } = renderWithProviders("union-1", false);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the wallet has no active or pending relationship to the union", async () => {
    getUnionMock.mockResolvedValue({
      union: {},
      members: [],
      myActiveCommunityIds: [],
      myPendingCommunityIds: [],
    });
    const { container } = renderWithProviders();
    await waitFor(() => expect(getUnionMock).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the active-member panel with the invite form when the wallet has an active membership", async () => {
    getUnionMock.mockResolvedValue({
      union: {},
      members: [ACTIVE_MEMBER],
      myActiveCommunityIds: [ACTIVE_MEMBER.communityId],
      myPendingCommunityIds: [],
    });
    renderWithProviders();

    expect(await screen.findByText(/Your community: Founding Co/)).toBeInTheDocument();
    expect(screen.getByTestId("invite-form")).toBeInTheDocument();
    expect(screen.getByText("Leave union")).toBeInTheDocument();
  });

  it("shows the pending-response panel with Accept/Decline when the wallet has a pending invite", async () => {
    getUnionMock.mockResolvedValue({
      union: {},
      members: [PENDING_MEMBER],
      myActiveCommunityIds: [],
      myPendingCommunityIds: [PENDING_MEMBER.communityId],
    });
    renderWithProviders();

    expect(await screen.findByText(/Invited Co was invited/)).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Decline")).toBeInTheDocument();
  });

  // Design review D14 — an unanswered invite needs this wallet's attention right now, so it
  // renders ABOVE ongoing-relationship management when both apply to the same wallet.
  it("renders the pending panel above the active panel when the wallet has both (D14)", async () => {
    getUnionMock.mockResolvedValue({
      union: {},
      members: [ACTIVE_MEMBER, PENDING_MEMBER],
      myActiveCommunityIds: [ACTIVE_MEMBER.communityId],
      myPendingCommunityIds: [PENDING_MEMBER.communityId],
    });
    renderWithProviders();

    await screen.findByText(/Invited Co was invited/);
    const pendingHeading = screen.getByText(/Invited Co was invited/);
    const activeHeading = screen.getByText(/Your community: Founding Co/);
    // DOCUMENT_POSITION_FOLLOWING (4) means activeHeading comes AFTER pendingHeading in the DOM.
    // eslint-disable-next-line no-bitwise
    expect(pendingHeading.compareDocumentPosition(activeHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // Design review D16 — matches JoinSection.tsx's own "Leave community" inline confirm exactly;
  // UnionDetailPage's original leave button was a single unconfirmed click with no recovery path.
  it("requires an inline confirm before leaving (D16), and 'Never mind' cancels without calling leave()", async () => {
    getUnionMock.mockResolvedValue({
      union: {},
      members: [ACTIVE_MEMBER],
      myActiveCommunityIds: [ACTIVE_MEMBER.communityId],
      myPendingCommunityIds: [],
    });
    renderWithProviders();

    fireEvent.click(await screen.findByText("Leave union"));
    expect(screen.getByText("Leave this union?")).toBeInTheDocument();
    expect(leaveMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Never mind"));
    expect(screen.queryByText("Leave this union?")).not.toBeInTheDocument();
    expect(leaveMock).not.toHaveBeenCalled();
  });

  it("calls leave() only after the inline confirm is clicked", async () => {
    getUnionMock.mockResolvedValue({
      union: {},
      members: [ACTIVE_MEMBER],
      myActiveCommunityIds: [ACTIVE_MEMBER.communityId],
      myPendingCommunityIds: [],
    });
    renderWithProviders();

    fireEvent.click(await screen.findByText("Leave union"));
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => expect(leaveMock).toHaveBeenCalledWith("union-1", ACTIVE_MEMBER.communityId));
  });
});
