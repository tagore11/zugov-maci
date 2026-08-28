import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import { EventDetailPage } from "./EventDetailPage";
import { HttpError } from "@/src/services/httpClient";
import type { CommunityOutletContext } from "./CommunityLayout";

const getEventMock = vi.fn();
const listEventsMock = vi.fn();
const listRsvpsMock = vi.fn();
const rsvpMock = vi.fn();
const cancelRsvpMock = vi.fn();

vi.mock("@/src/services/eventApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/eventApi")>("@/src/services/eventApi");
  return {
    ...actual,
    getEvent: (...args: unknown[]) => getEventMock(...args),
    listEvents: (...args: unknown[]) => listEventsMock(...args),
    listRsvps: (...args: unknown[]) => listRsvpsMock(...args),
    rsvp: (...args: unknown[]) => rsvpMock(...args),
    cancelRsvp: (...args: unknown[]) => cancelRsvpMock(...args),
  };
});

const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const WALLET_ADDRESS = "0x1234567890123456789012345678901234567890";

const EVENT = {
  id: "event-1",
  communityId: "community-1",
  title: "Governance 101",
  description: "A hands-on walkthrough of MACI voting.",
  venueId: null,
  locationText: "Commons Hall",
  startAt: 4102444800,
  endAt: 4102448400,
  seriesId: null,
  kind: "workshop" as const,
  creatorAddress: WALLET_ADDRESS,
  status: "active" as const,
  createdAt: 0,
  cancelledAt: null,
  eligibleTierIds: null,
  parentEventId: null,
  isAllDay: false,
};

function ParentWithContext({ context }: { context: CommunityOutletContext }) {
  return <Outlet context={context} />;
}

function baseContext(overrides: Partial<CommunityOutletContext> = {}): CommunityOutletContext {
  return {
    community: { id: "community-1" } as CommunityOutletContext["community"],
    address: undefined,
    connected: false,
    status: "disconnected",
    isCreator: false,
    isCommunityAdmin: false,
    rpcUrl: "http://mock-rpc",
    ...overrides,
  };
}

function renderPage(context: CommunityOutletContext, eventId = "event-1") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/x/${eventId}`]}>
        <Routes>
          <Route path="/x/:eventId" element={<ParentWithContext context={context} />}>
            <Route index element={<EventDetailPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getEventMock.mockReset();
  listEventsMock.mockReset();
  listRsvpsMock.mockReset();
  rsvpMock.mockReset();
  cancelRsvpMock.mockReset();
  mockSignOut.mockReset();

  listEventsMock.mockResolvedValue({ events: [], total: 0, hasMore: false });
  listRsvpsMock.mockResolvedValue([]);
});

describe("EventDetailPage", () => {
  it("shows a loading state before the event resolves", () => {
    getEventMock.mockReturnValue(new Promise(() => {}));
    renderPage(baseContext());

    expect(screen.getByRole("status", { name: "Loading event" })).toBeInTheDocument();
  });

  it("shows a not-found state for a 404 (nonexistent or ineligible — deliberately indistinguishable)", async () => {
    getEventMock.mockRejectedValue(new HttpError(404, "Event not found"));
    renderPage(baseContext());

    await screen.findByText("Event not found");
    expect(screen.getByText("This event doesn't exist, or you don't have access to view it.")).toBeInTheDocument();
  });

  it("shows a distinct error state with a working Retry for a network/500 failure", async () => {
    getEventMock.mockRejectedValueOnce(new Error("network down"));
    renderPage(baseContext());

    await screen.findByText("Couldn't load this event right now.");
    expect(screen.queryByText("Event not found")).not.toBeInTheDocument();

    getEventMock.mockResolvedValue(EVENT);
    fireEvent.click(screen.getByText("Retry"));
    await screen.findByText("Governance 101");
  });

  it("renders title, kind, time, location, and description", async () => {
    getEventMock.mockResolvedValue(EVENT);
    renderPage(baseContext());

    expect(await screen.findByText("Governance 101")).toBeInTheDocument();
    expect(screen.getByText("Workshop")).toBeInTheDocument();
    expect(screen.getByText("Commons Hall")).toBeInTheDocument();
    expect(screen.getByText("A hands-on walkthrough of MACI voting.")).toBeInTheDocument();
  });

  it('renders "All day" for an all-day event, passing isAllDay through', async () => {
    getEventMock.mockResolvedValue({ ...EVENT, isAllDay: true, endAt: EVENT.startAt + 3600 * 23 + 3599 });
    renderPage(baseContext());

    await screen.findByText("All day");
  });

  it("shows a cancelled badge and hides the RSVP button for a cancelled event", async () => {
    getEventMock.mockResolvedValue({ ...EVENT, status: "cancelled" });
    renderPage(baseContext({ connected: true, address: WALLET_ADDRESS }));

    await screen.findByText("Governance 101");
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.queryByText("RSVP")).not.toBeInTheDocument();
  });

  it("does not show the RSVP button for a disconnected viewer", async () => {
    getEventMock.mockResolvedValue(EVENT);
    renderPage(baseContext({ connected: false }));

    await screen.findByText("Governance 101");
    expect(screen.queryByText("RSVP")).not.toBeInTheDocument();
  });

  it("RSVPs successfully and toggles to Going", async () => {
    getEventMock.mockResolvedValue(EVENT);
    rsvpMock.mockResolvedValue({ walletAddress: WALLET_ADDRESS, status: "active", rsvpedAt: 0, cancelledAt: null });
    renderPage(baseContext({ connected: true, address: WALLET_ADDRESS }));

    fireEvent.click(await screen.findByText("RSVP"));

    await waitFor(() => expect(rsvpMock).toHaveBeenCalledWith("community-1", "event-1"));
  });

  it("shows a warm empty state, not bare text, when nobody has RSVP'd yet", async () => {
    getEventMock.mockResolvedValue(EVENT);
    listRsvpsMock.mockResolvedValue([]);
    renderPage(baseContext({ connected: true, address: WALLET_ADDRESS }));

    expect(await screen.findByText("No one's RSVP'd yet — be the first.")).toBeInTheDocument();
    expect(screen.getByText("Who's going")).toBeInTheDocument();
  });

  it("lists truncated RSVP addresses with a count when RSVPs exist", async () => {
    getEventMock.mockResolvedValue(EVENT);
    listRsvpsMock.mockResolvedValue([
      { walletAddress: WALLET_ADDRESS, status: "active", rsvpedAt: 0, cancelledAt: null },
    ]);
    renderPage(baseContext());

    await screen.findByText("Who's going (1)");
    expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
  });

  it("shows the event's own details even if the RSVP list fails to load (independent queries)", async () => {
    getEventMock.mockResolvedValue(EVENT);
    listRsvpsMock.mockRejectedValue(new Error("rsvp fetch failed"));
    renderPage(baseContext());

    await screen.findByText("Governance 101");
    expect(await screen.findByText("Couldn't load who's going.")).toBeInTheDocument();
  });

  describe("side-event <-> parent linking", () => {
    const PARENT = { ...EVENT, id: "parent-1", title: "Zukas Opening Ceremony", parentEventId: null };
    const SIDE = { ...EVENT, id: "event-1", title: "Governance 101", parentEventId: "parent-1" };

    it("shows a 'Part of' link on a side-event's own page", async () => {
      getEventMock.mockImplementation((_communityId: string, eventId: string) =>
        Promise.resolve(eventId === "parent-1" ? PARENT : SIDE),
      );
      renderPage(baseContext());

      await screen.findByText("Governance 101");
      const link = await screen.findByText("Zukas Opening Ceremony");
      expect(link.closest("a")).toHaveAttribute("href", "/community/community-1/events/parent-1");
    });

    it("omits the 'Part of' line silently when the parent fetch fails, without crashing", async () => {
      getEventMock.mockImplementation((_communityId: string, eventId: string) =>
        eventId === "parent-1" ? Promise.reject(new HttpError(404, "Event not found")) : Promise.resolve(SIDE),
      );
      renderPage(baseContext());

      await screen.findByText("Governance 101");
      expect(screen.queryByText(/Part of/)).not.toBeInTheDocument();
    });

    it("lists side-events as links on a parent event's own page", async () => {
      getEventMock.mockResolvedValue(PARENT);
      listEventsMock.mockResolvedValue({ events: [PARENT, SIDE], total: 2, hasMore: false });
      renderPage(baseContext(), "parent-1");

      await screen.findByText("Zukas Opening Ceremony");
      const link = await screen.findByText("→ Governance 101");
      expect(link.closest("a")).toHaveAttribute("href", "/community/community-1/events/event-1");
    });

    it("omits the Side events section entirely when there are none", async () => {
      getEventMock.mockResolvedValue(PARENT);
      listEventsMock.mockResolvedValue({ events: [PARENT], total: 1, hasMore: false });
      renderPage(baseContext(), "parent-1");

      await screen.findByText("Zukas Opening Ceremony");
      expect(screen.queryByText("Side events")).not.toBeInTheDocument();
    });
  });
});
