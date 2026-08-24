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
});
