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

  it("shows a secondary-toned pending badge, not an error/warning style, for pending invites", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-2", displayName: "Residency Federation", logo: null, status: "pending" },
    ]);
    renderWithProviders(<UnionsSection communityId="0xabc" />);

    const badge = await screen.findByText("Invited — awaiting response");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-gray-400");
    expect(badge.className).not.toMatch(/red|amber|yellow/);
  });
});
