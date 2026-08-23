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
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

// Header -> PrivyConnectButton calls wagmi's useDisconnect() directly, which needs a real
// WagmiProvider this lightweight page test doesn't set up (matches delegates/page.test.tsx's
// established pattern for the same issue).
vi.mock("wagmi", () => ({
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
});
