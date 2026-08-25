import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UnionsSection } from "./UnionsSection";

const listUnionsForCommunityMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  listUnionsForCommunity: (...args: unknown[]) => listUnionsForCommunityMock(...args),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  listUnionsForCommunityMock.mockReset();
});

describe("UnionsSection", () => {
  it("renders nothing when the community belongs to no unions", async () => {
    listUnionsForCommunityMock.mockResolvedValue([]);
    const { container } = renderWithProviders(<UnionsSection communityId="0xabc" />);

    await waitFor(() => expect(listUnionsForCommunityMock).toHaveBeenCalledWith("0xabc"));
    expect(container).toBeEmptyDOMElement();
  });

  it("shows active unions without a pending badge", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Pop-up Alliance", logo: null, status: "active" },
    ]);
    renderWithProviders(<UnionsSection communityId="0xabc" />);

    await waitFor(() => expect(screen.getByText("Pop-up Alliance")).toBeInTheDocument());
    expect(screen.queryByText(/awaiting response/)).not.toBeInTheDocument();
  });

  // Child D (formalize-communities epic), /plan-eng-review 2026-08-25 — pending invites used to
  // render as a passive text badge on this public page; they're now invisible here entirely.
  // Accept/decline lives on the community's settings page (UnionMembershipSection.tsx) instead.
  it("renders nothing for a pending invite, not even a passive badge", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-2", displayName: "Residency Federation", logo: null, status: "pending" },
    ]);
    const { container } = renderWithProviders(<UnionsSection communityId="0xabc" />);

    await waitFor(() => expect(listUnionsForCommunityMock).toHaveBeenCalledWith("0xabc"));
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("Residency Federation")).not.toBeInTheDocument();
  });

  it("shows active unions alongside a pending one, excluding only the pending one", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Pop-up Alliance", logo: null, status: "active" },
      { id: "union-2", displayName: "Residency Federation", logo: null, status: "pending" },
    ]);
    renderWithProviders(<UnionsSection communityId="0xabc" />);

    await waitFor(() => expect(screen.getByText("Pop-up Alliance")).toBeInTheDocument());
    expect(screen.queryByText("Residency Federation")).not.toBeInTheDocument();
  });
});
