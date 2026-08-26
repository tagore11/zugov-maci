import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EventsSection } from "./EventsSection";
import { HttpError } from "@/src/services/httpClient";

const listEventsMock = vi.fn();
const listRsvpsMock = vi.fn();
const rsvpMock = vi.fn();
const cancelRsvpMock = vi.fn();
const cancelEventMock = vi.fn();
const duplicateEventMock = vi.fn();

vi.mock("@/src/services/eventApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/eventApi")>("@/src/services/eventApi");
  return {
    ...actual,
    listEvents: (...args: unknown[]) => listEventsMock(...args),
    listRsvps: (...args: unknown[]) => listRsvpsMock(...args),
    rsvp: (...args: unknown[]) => rsvpMock(...args),
    cancelRsvp: (...args: unknown[]) => cancelRsvpMock(...args),
    cancelEvent: (...args: unknown[]) => cancelEventMock(...args),
    duplicateEvent: (...args: unknown[]) => duplicateEventMock(...args),
  };
});

const getMembershipStatusMock = vi.fn();
const getTiersMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getMembershipStatus: (...args: unknown[]) => getMembershipStatusMock(...args),
  getTiers: (...args: unknown[]) => getTiersMock(...args),
}));

// /plan-eng-review (2026-08-23) Batch 4 -- DuplicateForm/EventRow now call useSiwe() for
// withAuthDetect. Mocking the module directly (matching JoinSection.test.tsx's convention).
const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const WALLET_ADDRESS = "0x1234567890123456789012345678901234567890";

const EVENT = {
  id: "event-1",
  communityId: "0xabc",
  title: "Morning Yoga",
  description: null,
  venueId: null,
  locationText: "The Hub",
  startAt: 4102444800, // 2100-01-01 -- always in the future
  endAt: 4102448400,
  seriesId: null,
  kind: "social" as const,
  creatorAddress: WALLET_ADDRESS,
  status: "active" as const,
  createdAt: 0,
  cancelledAt: null,
  eligibleTierIds: null,
  parentEventId: null,
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  listEventsMock.mockReset();
  listRsvpsMock.mockReset();
  rsvpMock.mockReset();
  cancelRsvpMock.mockReset();
  cancelEventMock.mockReset();
  duplicateEventMock.mockReset();
  getMembershipStatusMock.mockReset();
  getTiersMock.mockReset();
  mockSignOut.mockReset();

  getMembershipStatusMock.mockResolvedValue({ status: "none" });
  getTiersMock.mockResolvedValue([]);
  listRsvpsMock.mockResolvedValue([]);
  listEventsMock.mockResolvedValue({ events: [EVENT], total: 1, hasMore: false });
});

describe("EventsSection", () => {
  // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D4) — the events-list query
  // key now includes walletAddress, mirroring ProposalsList.tsx's identical Child H fix, so an
  // account switch always refetches under the new identity instead of briefly showing the
  // previous wallet's (now stale) visibility-filtered list.
  it("refetches the events list when walletAddress changes", async () => {
    const OTHER_WALLET = "0x9999999999999999999999999999999999999999";
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />
      </QueryClientProvider>,
    );
    await screen.findByText("Morning Yoga");
    expect(listEventsMock).toHaveBeenCalledTimes(1);

    // Same QueryClient (same cache), only walletAddress changes — proves the key itself, not just
    // a fresh cache, is what forces the refetch.
    rerender(
      <QueryClientProvider client={queryClient}>
        <EventsSection communityId="0xabc" connected={true} walletAddress={OTHER_WALLET} />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(listEventsMock).toHaveBeenCalledTimes(2));
  });

  it("RSVPs successfully", async () => {
    rsvpMock.mockResolvedValue({ walletAddress: WALLET_ADDRESS, status: "active", rsvpedAt: 0, cancelledAt: null });

    renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

    fireEvent.click(await screen.findByText("RSVP"));

    await waitFor(() => expect(rsvpMock).toHaveBeenCalledWith("0xabc", "event-1"));
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // /plan-eng-review (2026-08-23) Batch 4
  it("shows an error and signs out when RSVP fails with an expired session (401)", async () => {
    rsvpMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

    fireEvent.click(await screen.findByText("RSVP"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows an error and signs out when cancelling an event fails with an expired session (401)", async () => {
    cancelEventMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

    fireEvent.click(await screen.findByLabelText("Event actions"));
    fireEvent.click(screen.getByText("Cancel event"));
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows an error and signs out when duplicating an event fails with an expired session (401)", async () => {
    duplicateEventMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

    fireEvent.click(await screen.findByLabelText("Event actions"));
    fireEvent.click(screen.getByText("Duplicate"));
    fireEvent.click(screen.getByText("Create duplicates"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  // Events expansion (2026-08-26, Decision 7) — aria-pressed toggle, not role="tab".
  describe("upcoming/past toggle", () => {
    it("defaults to the upcoming tab pressed, and refetches with collection=past on click", async () => {
      renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

      await screen.findByText("Morning Yoga");
      expect(screen.getByRole("button", { name: "upcoming" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "past" })).toHaveAttribute("aria-pressed", "false");

      listEventsMock.mockResolvedValue({ events: [], total: 0, hasMore: false });
      fireEvent.click(screen.getByRole("button", { name: "past" }));

      await waitFor(() =>
        expect(listEventsMock).toHaveBeenCalledWith("0xabc", expect.objectContaining({ collection: "past" })),
      );
      expect(screen.getByRole("button", { name: "past" })).toHaveAttribute("aria-pressed", "true");
    });

    it("shows distinct empty-state copy per tab, with a create CTA only on upcoming", async () => {
      listEventsMock.mockResolvedValue({ events: [], total: 0, hasMore: false });
      getTiersMock.mockResolvedValue([
        { id: "tier-1", label: "Member", canCreateProposals: true, canVote: true, canCreateEvents: true },
      ]);

      renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

      await screen.findByText("No upcoming events yet.");
      fireEvent.click(screen.getByRole("button", { name: "past" }));

      await screen.findByText("No past events.");
      expect(screen.queryByText("Plan the first one")).not.toBeInTheDocument();
    });

    it("shows a distinct error state (not the empty state) when the fetch fails, with a working Retry", async () => {
      listEventsMock.mockRejectedValue(new Error("network down"));

      renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

      await screen.findByText("Couldn't load events right now.");
      expect(screen.queryByText("No upcoming events yet.")).not.toBeInTheDocument();

      listEventsMock.mockResolvedValue({ events: [EVENT], total: 1, hasMore: false });
      fireEvent.click(screen.getByText("Retry"));
      await screen.findByText("Morning Yoga");
    });
  });

  // Events expansion (2026-08-26, Decisions 1/3) — side-events grouped client-side from the same
  // flat list() response, no extra fetch, inline expand under the parent.
  describe("side-events", () => {
    const PARENT = { ...EVENT, id: "parent-1", title: "Multi-day Gathering", parentEventId: null };
    const SIDE = { ...EVENT, id: "side-1", title: "Morning Session", parentEventId: "parent-1" };

    it("does not show a top-level row or chevron for an event with no side-events", async () => {
      listEventsMock.mockResolvedValue({ events: [EVENT], total: 1, hasMore: false });
      renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

      await screen.findByText("Morning Yoga");
      expect(screen.queryByLabelText("Expand side-events")).not.toBeInTheDocument();
    });

    it("excludes side-events from the top-level date-grouped list, and reveals them via the parent's chevron", async () => {
      listEventsMock.mockResolvedValue({ events: [PARENT, SIDE], total: 2, hasMore: false });
      renderWithProviders(<EventsSection communityId="0xabc" connected={true} walletAddress={WALLET_ADDRESS} />);

      await screen.findByText("Multi-day Gathering");
      expect(screen.queryByText("Morning Session")).not.toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Expand side-events"));
      await screen.findByText("Morning Session");
    });
  });
});
