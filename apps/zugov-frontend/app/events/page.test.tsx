import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EventsPage from "./page";

const listGlobalEventsMock = vi.fn();

vi.mock("@/src/services/eventApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/eventApi")>("@/src/services/eventApi");
  return {
    ...actual,
    listGlobalEvents: (...args: unknown[]) => listGlobalEventsMock(...args),
  };
});

vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: undefined, status: "disconnected" }),
    useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
  };
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EventsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const EVENT = {
  id: "event-1",
  communityId: "community-1",
  communityDisplayName: "Zukas Residency",
  communityLogo: null,
  title: "Morning Yoga",
  description: null,
  venueId: null,
  locationText: "The Hub",
  startAt: 4102444800,
  endAt: 4102448400,
  seriesId: null,
  kind: "social" as const,
  creatorAddress: "0xabc",
  status: "active" as const,
  createdAt: 0,
  cancelledAt: null,
  eligibleTierIds: null,
  parentEventId: null,
};

beforeEach(() => {
  listGlobalEventsMock.mockReset();
  listGlobalEventsMock.mockResolvedValue({ events: [EVENT], total: 1, hasMore: false });
});

// Events expansion (/plan-eng-review + /plan-design-review 2026-08-26) — the first cross-community
// events discovery page, mirroring /unions/page.tsx's coverage shape.
describe("EventsPage", () => {
  it("renders cards with community identity, kind, time, and location", async () => {
    renderPage();

    await screen.findByText("Morning Yoga");
    expect(screen.getByText("Zukas Residency")).toBeInTheDocument();
    expect(screen.getByText("Social")).toBeInTheDocument();
    expect(screen.getByText("The Hub")).toBeInTheDocument();
    // Fallback community-logo emoji when communityLogo is null (matches the established
    // community-display convention elsewhere in the app).
    expect(screen.getByText("🏛️")).toBeInTheDocument();
  });

  it("card links to the event's own detail page", async () => {
    renderPage();

    const card = await screen.findByText("Morning Yoga");
    expect(card.closest("a")).toHaveAttribute("href", "/community/community-1/events/event-1");
  });

  it("does not show an RSVP count on the card", async () => {
    renderPage();
    await screen.findByText("Morning Yoga");
    expect(screen.queryByText(/going/)).not.toBeInTheDocument();
  });

  it("defaults to upcoming, and switching to past refetches with collection=past", async () => {
    renderPage();

    await screen.findByText("Morning Yoga");
    expect(listGlobalEventsMock).toHaveBeenCalledWith(expect.objectContaining({ collection: "upcoming", page: 1 }));

    listGlobalEventsMock.mockResolvedValue({ events: [], total: 0, hasMore: false });
    fireEvent.click(screen.getByRole("button", { name: "past" }));

    await waitFor(() =>
      expect(listGlobalEventsMock).toHaveBeenCalledWith(expect.objectContaining({ collection: "past", page: 1 })),
    );
    await screen.findByText("No past events.");
  });

  it("shows distinct empty-state copy with no create CTA (public discovery page)", async () => {
    listGlobalEventsMock.mockResolvedValue({ events: [], total: 0, hasMore: false });
    renderPage();

    await screen.findByText("No upcoming events yet.");
    expect(screen.queryByText("Plan the first one")).not.toBeInTheDocument();
  });

  it("shows a distinct error state (not the empty state) on fetch failure, with a working Retry", async () => {
    listGlobalEventsMock.mockRejectedValue(new Error("network down"));
    renderPage();

    await screen.findByText("Couldn't load events right now.");
    expect(screen.queryByText("No upcoming events yet.")).not.toBeInTheDocument();

    listGlobalEventsMock.mockResolvedValue({ events: [EVENT], total: 1, hasMore: false });
    fireEvent.click(screen.getByText("Retry"));
    await screen.findByText("Morning Yoga");
  });

  it("paginates: switching tabs resets to page 1", async () => {
    listGlobalEventsMock.mockResolvedValue({ events: [EVENT], total: 20, hasMore: true });
    renderPage();

    await screen.findByText("Morning Yoga");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(listGlobalEventsMock).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));

    fireEvent.click(screen.getByRole("button", { name: "past" }));
    await waitFor(() =>
      expect(listGlobalEventsMock).toHaveBeenCalledWith(expect.objectContaining({ page: 1, collection: "past" })),
    );
  });
});
