import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { StepCommunityInfo } from "./StepCommunityInfo";

const listMock = vi.fn();
const getMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  list: (...args: unknown[]) => listMock(...args),
  get: (...args: unknown[]) => getMock(...args),
}));

const COMMUNITY_A = { id: "community-a", displayName: "Zukas Residency" };
const COMMUNITY_B = { id: "community-b", displayName: "Zukas Pop-up" };

beforeEach(() => {
  listMock.mockReset();
  getMock.mockReset();
  listMock.mockResolvedValue({ communities: [COMMUNITY_A, COMMUNITY_B], total: 2, hasMore: false });
  getMock.mockResolvedValue(null);
});

// Community creation wizard fix (2026-08-21) — the parent-community picker is a server-search-
// backed combobox now, not a client-side filter over one capped page (a client-side filter would
// silently exclude any parent past the first page — the confirmed bug this replaces).
describe("StepCommunityInfo — parent combobox", () => {
  it("shows category options including Pop-up City", () => {
    render(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);
    expect(screen.getByRole("option", { name: "Pop-up City" })).toBeInTheDocument();
  });

  it("searches server-side (debounced) as the user types, not a client-side filter over one fetch", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search communities…");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zukas" } });

    vi.advanceTimersByTime(350);
    await waitFor(() => expect(listMock).toHaveBeenCalledWith(1, undefined, undefined, "zukas"));

    vi.useRealTimers();
  });

  it("selecting a result fills the input and is submitted as parentCommunityId", async () => {
    const setCommunityInfo = vi.fn();
    render(<StepCommunityInfo setCommunityInfo={setCommunityInfo} goBack={vi.fn()} />);

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
    render(<StepCommunityInfo setCommunityInfo={setCommunityInfo} goBack={vi.fn()} />);

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
    render(<StepCommunityInfo setCommunityInfo={vi.fn()} goBack={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search communities…");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText(/No matching communities/)).toBeInTheDocument());
  });

  it("resolves and pre-fills the already-selected parent's name when returning via Back", async () => {
    getMock.mockResolvedValue({ id: "community-a", displayName: "Zukas Residency" });
    render(<StepCommunityInfo initialParentCommunityId="community-a" setCommunityInfo={vi.fn()} goBack={vi.fn()} />);

    await waitFor(() => expect(getMock).toHaveBeenCalledWith("community-a"));
    const input = screen.getByPlaceholderText("Search communities…") as HTMLInputElement;
    await waitFor(() => expect(input.value).toBe("Zukas Residency"));
  });
});
