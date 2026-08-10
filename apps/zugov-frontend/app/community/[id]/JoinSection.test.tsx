import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { JoinSection } from "./JoinSection";

const joinMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  join: (...args: unknown[]) => joinMock(...args),
  DuplicateJoinError: class DuplicateJoinError extends Error {},
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
  joinMock.mockReset();
});

describe("JoinSection", () => {
  it("renders nothing when the wallet isn't connected", () => {
    const { container } = renderWithProviders(<JoinSection communityId="0xabc" connected={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a Join button when connected", () => {
    renderWithProviders(<JoinSection communityId="0xabc" connected={true} />);
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  it("shows the approved result after a successful join", async () => {
    joinMock.mockResolvedValue({ status: "approved", tierLabel: "Regular" });
    renderWithProviders(<JoinSection communityId="0xabc" connected={true} />);

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/Regular/)).toBeInTheDocument());
  });

  it("shows an error message when the join request fails", async () => {
    joinMock.mockRejectedValue(new Error("Already a member"));
    renderWithProviders(<JoinSection communityId="0xabc" connected={true} />);

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText("Already a member")).toBeInTheDocument());
  });
});
