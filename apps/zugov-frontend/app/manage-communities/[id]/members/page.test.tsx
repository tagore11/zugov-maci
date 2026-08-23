import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CommunityMembersPage from "./page";
import { HttpError } from "@/src/services/httpClient";

const listPendingRequestsMock = vi.fn();
const approveRequestMock = vi.fn();
const rejectRequestMock = vi.fn();

vi.mock("@/src/services/membershipApi", () => ({
  listPendingRequests: (...args: unknown[]) => listPendingRequestsMock(...args),
  approveRequest: (...args: unknown[]) => approveRequestMock(...args),
  rejectRequest: (...args: unknown[]) => rejectRequestMock(...args),
}));

// /plan-eng-review (2026-08-23) Batch 1 — this page now calls useSiwe() for withAuthDetect.
// Mocking the module directly (matching JoinSection.test.tsx's convention), not wrapping in a
// real SiweProvider — no test here exercises SiweProvider's own state machine.
const mockSignOut = vi.fn();
const mockSignIn = vi.fn();
const mockUseSiwe = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => mockUseSiwe(),
}));

// Header -> WalletConnectButton calls wagmi's useAccount()/useConnect()/useDisconnect() directly,
// which need a real WagmiProvider this lightweight page test doesn't set up (matches
// delegates/page.test.tsx's established pattern for the same issue).
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined, status: "disconnected" }),
  useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/manage-communities/community-1/members"]}>
      <Routes>
        <Route path="/manage-communities/:id/members" element={<CommunityMembersPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const REQUEST = { id: "req-1", walletAddress: "0xabc123", createdAt: 1700000000 };

beforeEach(() => {
  listPendingRequestsMock.mockReset();
  approveRequestMock.mockReset();
  rejectRequestMock.mockReset();
  mockSignOut.mockReset();
  mockSignIn.mockReset();
  mockUseSiwe.mockReset();
  mockUseSiwe.mockReturnValue({
    signOut: mockSignOut,
    signIn: mockSignIn,
    isSigning: false,
    isAuthenticated: true,
  });
});

describe("CommunityMembersPage", () => {
  it("approving a request removes it from the list on success", async () => {
    listPendingRequestsMock.mockResolvedValue([REQUEST]);
    approveRequestMock.mockResolvedValue(undefined);

    renderPage();

    fireEvent.click(await screen.findByText("Approve"));

    await waitFor(() => expect(approveRequestMock).toHaveBeenCalledWith("community-1", "req-1"));
    await waitFor(() => expect(screen.queryByText("0xabc123")).not.toBeInTheDocument());
  });

  // The bug this fix closes: handleApprove had NO catch clause at all before this pass — any
  // error, including a 401, silently vanished with the request staying in the list and zero
  // user-facing indication anything went wrong.
  it("shows an error, signs out, and keeps the request in the list when approving fails with an expired session (401)", async () => {
    listPendingRequestsMock.mockResolvedValue([REQUEST]);
    approveRequestMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    renderPage();

    fireEvent.click(await screen.findByText("Approve"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(screen.getByText("0xabc123")).toBeInTheDocument();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows an error without signing out when approving fails with a non-auth error", async () => {
    listPendingRequestsMock.mockResolvedValue([REQUEST]);
    approveRequestMock.mockRejectedValue(new Error("Network error"));

    renderPage();

    fireEvent.click(await screen.findByText("Approve"));

    await waitFor(() => expect(screen.getByText("Network error")).toBeInTheDocument());
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("rejecting a request removes it from the list on success", async () => {
    listPendingRequestsMock.mockResolvedValue([REQUEST]);
    rejectRequestMock.mockResolvedValue(undefined);

    renderPage();

    fireEvent.click(await screen.findByText("Reject"));

    await waitFor(() => expect(rejectRequestMock).toHaveBeenCalledWith("community-1", "req-1"));
    await waitFor(() => expect(screen.queryByText("0xabc123")).not.toBeInTheDocument());
  });

  it("shows an error, signs out, and keeps the request in the list when rejecting fails with an expired session (401)", async () => {
    listPendingRequestsMock.mockResolvedValue([REQUEST]);
    rejectRequestMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    renderPage();

    fireEvent.click(await screen.findByText("Reject"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(screen.getByText("0xabc123")).toBeInTheDocument();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  // /plan-eng-review Phase B (2026-08-23) — the bug this fix closes: a not-signed-in-at-all
  // visitor and a signed-in-but-unauthorized wallet used to render byte-identical text, with no
  // path to sign in for the former.
  it("shows a sign-in prompt, not the generic permission message, when the initial load fails with 401", async () => {
    listPendingRequestsMock.mockRejectedValue(new HttpError(401, "Authentication required"));

    renderPage();

    expect(await screen.findByText("Sign in to review join requests for this community.")).toBeInTheDocument();
    expect(
      screen.queryByText("You don't have permission to review join requests for this community."),
    ).not.toBeInTheDocument();
  });

  it("shows the permission-denied message, not a sign-in prompt, when the initial load fails with 403", async () => {
    listPendingRequestsMock.mockRejectedValue(new HttpError(403, "Not authorized"));

    renderPage();

    expect(
      await screen.findByText("You don't have permission to review join requests for this community."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Sign in to review join requests for this community.")).not.toBeInTheDocument();
  });

  it("retries the fetch once the sign-in prompt's button succeeds, showing the real content", async () => {
    mockUseSiwe.mockReturnValue({
      signOut: mockSignOut,
      signIn: mockSignIn,
      isSigning: false,
      isAuthenticated: false,
    });
    listPendingRequestsMock.mockRejectedValueOnce(new HttpError(401, "Authentication required"));
    listPendingRequestsMock.mockResolvedValueOnce([REQUEST]);

    const { rerender } = renderPage();

    fireEvent.click(await screen.findByText("Sign in with Ethereum"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);

    // Simulate signIn() succeeding and flipping isAuthenticated, which the page's fetch effect
    // depends on — without that dependency, the retry would never fire.
    mockUseSiwe.mockReturnValue({
      signOut: mockSignOut,
      signIn: mockSignIn,
      isSigning: false,
      isAuthenticated: true,
    });
    rerender(
      <MemoryRouter initialEntries={["/manage-communities/community-1/members"]}>
        <Routes>
          <Route path="/manage-communities/:id/members" element={<CommunityMembersPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(listPendingRequestsMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("0xabc123")).toBeInTheDocument();
  });
});
