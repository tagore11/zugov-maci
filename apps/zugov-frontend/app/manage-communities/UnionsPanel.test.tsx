import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UnionsPanel } from "./UnionsPanel";

const listUnionsForCommunityMock = vi.fn();
const createUnionMock = vi.fn();

vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    listUnionsForCommunity: (...args: unknown[]) => listUnionsForCommunityMock(...args),
    createUnion: (...args: unknown[]) => createUnionMock(...args),
  };
});

// /plan-eng-review (2026-08-23) Batch 1 — CreateUnionModal calls useSiwe() to get signOut for
// withAuthDetect. Mocking the module directly (matching JoinSection.test.tsx's convention)
// rather than wrapping in a real SiweProvider — no test here exercises SiweProvider's own state
// machine, only that signOut gets called on a 401.
const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const COMMUNITY = { id: "community-1", name: "Zukas", logo: "🏛️" };

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
  createUnionMock.mockReset();
  mockSignOut.mockReset();
});

describe("UnionsPanel", () => {
  it("renders nothing when the wallet owns no communities", () => {
    const { container } = renderWithProviders(<UnionsPanel communities={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  // Child D (formalize-communities epic), /plan-eng-review 2026-08-25 — accept/decline, invite,
  // and leave-union all moved to UnionMembershipSection.tsx on each community's own settings
  // page (see app/components/UnionMembershipSection.test.tsx). This panel keeps only Create
  // Union, which stays here because it's cross-community (picks a founding community from a
  // dropdown of every community the wallet owns) and doesn't fit a single community's settings
  // page. This test guards against that relocation silently regressing back to double-rendering
  // the same actions in two places.
  it("renders no accept/decline/leave/invite UI — only Create Union and Browse all unions", async () => {
    listUnionsForCommunityMock.mockResolvedValue([
      { id: "union-1", displayName: "Alliance", logo: null, status: "pending" },
    ]);
    renderWithProviders(<UnionsPanel communities={[COMMUNITY]} />);

    expect(await screen.findByText("+ Create union")).toBeInTheDocument();
    expect(screen.getByText("Browse all unions")).toBeInTheDocument();
    expect(screen.queryByText("Accept")).not.toBeInTheDocument();
    expect(screen.queryByText("Decline")).not.toBeInTheDocument();
    expect(screen.queryByText("Leave union")).not.toBeInTheDocument();
    expect(screen.queryByText("Invite a community")).not.toBeInTheDocument();
    expect(screen.queryByText("Alliance")).not.toBeInTheDocument();
  });

  it("creates a union via the modal", async () => {
    createUnionMock.mockResolvedValue({ id: "union-new", displayName: "New Union" });

    renderWithProviders(<UnionsPanel communities={[COMMUNITY]} />);

    fireEvent.click(screen.getByText("+ Create union"));
    fireEvent.change(screen.getByPlaceholderText("Pop-up City Alliance"), { target: { value: "New Union" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Union" }));

    await waitFor(() =>
      expect(createUnionMock).toHaveBeenCalledWith({
        displayName: "New Union",
        description: undefined,
        foundingCommunityId: "community-1",
      }),
    );
    await waitFor(() => expect(screen.queryByRole("button", { name: "Create Union" })).not.toBeInTheDocument());
  });

  it("signs the wallet out when creating a union fails with an expired session (401)", async () => {
    const communityApi = await import("@/src/services/communityApi");
    createUnionMock.mockRejectedValue(new communityApi.AuthError());

    renderWithProviders(<UnionsPanel communities={[COMMUNITY]} />);

    fireEvent.click(screen.getByText("+ Create union"));
    fireEvent.change(screen.getByPlaceholderText("Pop-up City Alliance"), { target: { value: "New Union" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Union" }));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
