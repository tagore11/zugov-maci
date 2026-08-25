import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UnionMembershipSection } from "./UnionMembershipSection";

const listUnionsForCommunityMock = vi.fn();
const inviteToUnionMock = vi.fn();
const respondToUnionInviteMock = vi.fn();
const leaveUnionMock = vi.fn();

vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    listUnionsForCommunity: (...args: unknown[]) => listUnionsForCommunityMock(...args),
    inviteToUnion: (...args: unknown[]) => inviteToUnionMock(...args),
    respondToUnionInvite: (...args: unknown[]) => respondToUnionInviteMock(...args),
    leaveUnion: (...args: unknown[]) => leaveUnionMock(...args),
  };
});

// /plan-eng-review (2026-08-23) Batch 1 — InviteToUnionForm/UnionMembershipSection call useSiwe()
// to get signOut for withAuthDetect. Mocking the module directly (matching JoinSection.test.tsx's
// convention) rather than wrapping in a real SiweProvider — no test here exercises SiweProvider's
// own state machine, only that signOut gets called on a 401.
const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const COMMUNITY_ID = "community-1";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  listUnionsForCommunityMock.mockReset();
  inviteToUnionMock.mockReset();
  respondToUnionInviteMock.mockReset();
  leaveUnionMock.mockReset();
  mockSignOut.mockReset();
});

// Child D (formalize-communities epic), /plan-eng-review 2026-08-25 — relocated from
// manage-communities/UnionsPanel.test.tsx's UnionMembershipRow coverage (was scoped to N owned
// communities in one panel; this component is scoped to a single communityId, matching its new
// home on that community's own settings page).
describe("UnionMembershipSection", () => {
  it("renders nothing when the community belongs to no unions", async () => {
    listUnionsForCommunityMock.mockResolvedValue([]);
    const { container } = renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    await waitFor(() => expect(listUnionsForCommunityMock).toHaveBeenCalledWith(COMMUNITY_ID));
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a loading spinner on the invite button while submitting, disabled during submit", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    let resolveInvite: (() => void) | undefined;
    inviteToUnionMock.mockReturnValue(new Promise<void>((resolve) => (resolveInvite = resolve)));

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Invite a community"));
    fireEvent.change(screen.getByPlaceholderText("Community ID"), { target: { value: "community-2" } });
    fireEvent.click(screen.getByText("Invite"));

    await waitFor(() => expect(screen.getByText("Inviting…")).toBeInTheDocument());
    expect(screen.getByText("Inviting…").closest("button")).toBeDisabled();

    resolveInvite?.();
    await waitFor(() => expect(screen.getByText("Invited")).toBeInTheDocument());
  });

  it("shows the invited community with a pending, non-error 'awaiting response' badge", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "pending" },
    ]);
    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    const badge = await screen.findByText("Invited — awaiting response");
    expect(badge.className).toContain("text-gray-500");
    expect(badge.className).not.toMatch(/red|amber|yellow/);
  });

  it("shows an inline 403 message, not a toast, when the acting wallet isn't authorized to invite", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    const communityApi = await import("@/src/services/communityApi");
    inviteToUnionMock.mockRejectedValue(
      new communityApi.OwnershipError("You don't have permission to invite for this community"),
    );

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Invite a community"));
    fireEvent.change(screen.getByPlaceholderText("Community ID"), { target: { value: "community-2" } });
    fireEvent.click(screen.getByText("Invite"));

    await waitFor(() =>
      expect(screen.getByText("You don't have permission to invite for this community")).toBeInTheDocument(),
    );
    // Inline within the form, not a fixed/toast-positioned element.
    expect(screen.getByText("You don't have permission to invite for this community").closest("div")).not.toHaveClass(
      "fixed",
    );
  });

  it("shows 'Already invited' and disables the invite action on a 409, without letting the user retry into the same error", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    const communityApi = await import("@/src/services/communityApi");
    inviteToUnionMock.mockRejectedValue(new communityApi.ConflictError("Already invited"));

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Invite a community"));
    fireEvent.change(screen.getByPlaceholderText("Community ID"), { target: { value: "community-2" } });
    fireEvent.click(screen.getByText("Invite"));

    await waitFor(() => expect(screen.getByText("Already invited")).toBeInTheDocument());
    expect(screen.getByText("Invited").closest("button")).toBeDisabled();
  });

  it("signs the wallet out when inviting fails with an expired session (401)", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    const communityApi = await import("@/src/services/communityApi");
    inviteToUnionMock.mockRejectedValue(new communityApi.AuthError());

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Invite a community"));
    fireEvent.change(screen.getByPlaceholderText("Community ID"), { target: { value: "community-2" } });
    fireEvent.click(screen.getByText("Invite"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("accepting a pending invite moves the union from pending to active on re-fetch", async () => {
    listUnionsForCommunityMock.mockResolvedValueOnce([
      { id: "union-1", displayName: "Alliance", logo: null, status: "pending" },
    ]);
    respondToUnionInviteMock.mockResolvedValue(undefined);

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    await screen.findByText("Accept");
    listUnionsForCommunityMock.mockResolvedValueOnce([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    fireEvent.click(screen.getByText("Accept"));

    await waitFor(() =>
      expect(respondToUnionInviteMock).toHaveBeenCalledWith("union-1", { communityId: COMMUNITY_ID, accept: true }),
    );
    await waitFor(() => expect(screen.queryByText(/awaiting response/)).not.toBeInTheDocument());
  });

  it("declining a pending invite calls respond with accept: false", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "pending" },
    ]);
    respondToUnionInviteMock.mockResolvedValue(undefined);

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Decline"));

    await waitFor(() =>
      expect(respondToUnionInviteMock).toHaveBeenCalledWith("union-1", { communityId: COMMUNITY_ID, accept: false }),
    );
  });

  it("signs the wallet out when responding to an invite fails with an expired session (401)", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "pending" },
    ]);
    const communityApi = await import("@/src/services/communityApi");
    respondToUnionInviteMock.mockRejectedValue(new communityApi.AuthError());

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Accept"));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
  });

  it("Accept/Decline buttons meet the 44px minimum touch target for mobile", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "pending" },
    ]);
    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    const acceptButton = await screen.findByText("Accept");
    const declineButton = screen.getByText("Decline");
    expect(acceptButton.closest("button")?.className).toContain("min-h-[44px]");
    expect(declineButton.closest("button")?.className).toContain("min-h-[44px]");
  });

  it("clicking Leave union calls leaveUnion with the community id and refreshes on success", async () => {
    listUnionsForCommunityMock.mockResolvedValueOnce([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    leaveUnionMock.mockResolvedValue(undefined);

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    await screen.findByText("Leave union");
    listUnionsForCommunityMock.mockResolvedValueOnce([]);
    fireEvent.click(screen.getByText("Leave union"));

    await waitFor(() => expect(leaveUnionMock).toHaveBeenCalledWith("union-1", { communityId: COMMUNITY_ID }));
    await waitFor(() => expect(screen.queryByText("Alliance")).not.toBeInTheDocument());
  });

  it("shows an inline error, not a toast, when leaving fails (e.g. already left elsewhere)", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    const communityApi = await import("@/src/services/communityApi");
    leaveUnionMock.mockRejectedValue(
      new communityApi.ConflictError("This community is not an active member of this union"),
    );

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Leave union"));

    await waitFor(() =>
      expect(screen.getByText("This community is not an active member of this union")).toBeInTheDocument(),
    );
    expect(screen.getByText("This community is not an active member of this union").closest("div")).not.toHaveClass(
      "fixed",
    );
  });

  it("signs the wallet out when leaving a union fails with an expired session (401)", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "active" },
    ]);
    const communityApi = await import("@/src/services/communityApi");
    leaveUnionMock.mockRejectedValue(new communityApi.AuthError());

    renderWithProviders(<UnionMembershipSection communityId={COMMUNITY_ID} />);

    fireEvent.click(await screen.findByText("Leave union"));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
  });
});
