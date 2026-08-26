import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StepCommunityInfo } from "./StepCommunityInfo";

const CONNECTED_ADDRESS = "0x1111111111111111111111111111111111111111";
// formalize-communities epic, Child E (/plan-eng-review 2026-08-25) — StepCommunityInfo now calls
// useAccount() to filter the parent-picker to authorized communities (D2). Defaults to connected
// so the existing search-flow tests below don't need to click through a wallet-loading state; the
// dedicated "wallet not yet connected" tests further down override this.
let mockAddress: string | undefined = CONNECTED_ADDRESS;
vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: mockAddress, status: mockAddress ? "connected" : "disconnected" }),
  };
});

const listMock = vi.fn();
const getMock = vi.fn();
const listCategoriesMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  list: (...args: unknown[]) => listMock(...args),
  get: (...args: unknown[]) => getMock(...args),
  listCategories: (...args: unknown[]) => listCategoriesMock(...args),
}));

const COMMUNITY_A = { id: "community-a", displayName: "Zukas Residency" };
const COMMUNITY_B = { id: "community-b", displayName: "Zukas Pop-up" };

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  mockAddress = CONNECTED_ADDRESS;
  listMock.mockReset();
  getMock.mockReset();
  listCategoriesMock.mockReset();
  listMock.mockResolvedValue({ communities: [COMMUNITY_A, COMMUNITY_B], total: 2, hasMore: false });
  getMock.mockResolvedValue(null);
  listCategoriesMock.mockResolvedValue([
    { id: "residency", label: "Residency" },
    { id: "pop_up_city", label: "Pop-up City" },
    { id: "network_state", label: "Network State" },
    { id: "social", label: "Social" },
    { id: "regional", label: "Regional" },
    { id: "dao", label: "DAO" },
  ]);
});

// Community creation wizard fix (2026-08-21) — the parent-community picker is a server-search-
// backed combobox now, not a client-side filter over one capped page (a client-side filter would
// silently exclude any parent past the first page — the confirmed bug this replaces).
describe("StepCommunityInfo — parent combobox", () => {
  it("shows category options including Pop-up City, fetched from the categories API", async () => {
    renderWithProviders(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);
    expect(await screen.findByRole("option", { name: "Pop-up City" })).toBeInTheDocument();
    expect(listCategoriesMock).toHaveBeenCalledTimes(1);
  });

  it("shows a retry message, not a blank dropdown, when the categories fetch fails", async () => {
    listCategoriesMock.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);
    expect(await screen.findByText(/Couldn.t load categories/)).toBeInTheDocument();
    expect(screen.getByText("retry")).toBeInTheDocument();
  });

  it("searches server-side (debounced) as the user types, not a client-side filter over one fetch", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search communities…");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zukas" } });

    vi.advanceTimersByTime(350);
    await waitFor(() => expect(listMock).toHaveBeenCalledWith(1, undefined, undefined, "zukas", CONNECTED_ADDRESS));

    vi.useRealTimers();
  });

  it("selecting a result fills the input and is submitted as parentCommunityId", async () => {
    const setCommunityInfo = vi.fn();
    renderWithProviders(<StepCommunityInfo setCommunityInfo={setCommunityInfo} goBack={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search communities…");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText("Zukas Residency")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Zukas Residency"));
    expect((input as HTMLInputElement).value).toBe("Zukas Residency");

    fireEvent.change(screen.getByPlaceholderText("ZuKas"), { target: { value: "Chapter" } });
    fireEvent.click(screen.getByText("Next"));

    expect(setCommunityInfo).toHaveBeenCalledWith("Chapter", "", "community-a", undefined);
  });

  it("clicking 'None — top-level community' clears the selection", async () => {
    const setCommunityInfo = vi.fn();
    renderWithProviders(<StepCommunityInfo setCommunityInfo={setCommunityInfo} goBack={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search communities…");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText("Zukas Residency")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Zukas Residency"));
    expect((input as HTMLInputElement).value).toBe("Zukas Residency");

    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText(/None — top-level community/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/None — top-level community/));
    expect((input as HTMLInputElement).value).toBe("");

    fireEvent.change(screen.getByPlaceholderText("ZuKas"), { target: { value: "Chapter" } });
    fireEvent.click(screen.getByText("Next"));
    expect(setCommunityInfo).toHaveBeenCalledWith("Chapter", "", undefined, undefined);
  });

  it("shows a clear 'no matching communities' message on a zero-result search, not a blank list", async () => {
    listMock.mockResolvedValue({ communities: [], total: 0, hasMore: false });
    renderWithProviders(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search communities…");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText(/No matching communities/)).toBeInTheDocument());
  });

  it("resolves and pre-fills the already-selected parent's name when returning via Back", async () => {
    getMock.mockResolvedValue({ id: "community-a", displayName: "Zukas Residency" });
    renderWithProviders(
      <StepCommunityInfo initialParentCommunityId="community-a" setCommunityInfo={vi.fn()} goBack={vi.fn()} />,
    );

    await waitFor(() => expect(getMock).toHaveBeenCalledWith("community-a"));
    const input = screen.getByPlaceholderText("Search communities…") as HTMLInputElement;
    await waitFor(() => expect(input.value).toBe("Zukas Residency"));
  });

  // formalize-communities epic, Child E (/plan-eng-review 2026-08-25, D2) — fails CLOSED while
  // the wallet is still resolving: no search fires and the dropdown stays empty, rather than
  // falling back to the full public list.
  describe("authorized-only filtering (D2 — fail closed on unresolved wallet)", () => {
    it("does not call list() and shows no results while the wallet address is unresolved", async () => {
      mockAddress = undefined;
      renderWithProviders(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);

      const input = screen.getByPlaceholderText("Search communities…");
      fireEvent.focus(input);

      await waitFor(() => expect(screen.getByText(/No matching communities/)).toBeInTheDocument());
      expect(listMock).not.toHaveBeenCalled();
    });

    it("passes the connected address as authorizedFor once resolved", async () => {
      renderWithProviders(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);

      const input = screen.getByPlaceholderText("Search communities…");
      fireEvent.focus(input);

      await waitFor(() => expect(listMock).toHaveBeenCalledWith(1, undefined, undefined, "", CONNECTED_ADDRESS));
    });
  });
});
