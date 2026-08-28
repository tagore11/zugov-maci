import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEventRowActions } from "./useEventRowActions";
import { HttpError } from "@/src/services/httpClient";
import type { Event } from "@/src/services/eventApi";

const listRsvpsMock = vi.fn();
const rsvpMock = vi.fn();
const cancelRsvpMock = vi.fn();

vi.mock("@/src/services/eventApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/eventApi")>("@/src/services/eventApi");
  return {
    ...actual,
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
const OTHER_WALLET = "0x9999999999999999999999999999999999999999";

const EVENT: Event = {
  id: "event-1",
  communityId: "community-1",
  title: "Governance 101",
  description: null,
  venueId: null,
  locationText: null,
  startAt: 0,
  endAt: 3600,
  seriesId: null,
  kind: "workshop",
  creatorAddress: WALLET_ADDRESS,
  status: "active",
  createdAt: 0,
  cancelledAt: null,
  eligibleTierIds: null,
  parentEventId: null,
  isAllDay: false,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  listRsvpsMock.mockReset();
  rsvpMock.mockReset();
  cancelRsvpMock.mockReset();
  mockSignOut.mockReset();
});

describe("useEventRowActions", () => {
  it("hasRsvped is false when the wallet isn't in the active RSVP list", async () => {
    listRsvpsMock.mockResolvedValue([
      { walletAddress: OTHER_WALLET, status: "active", rsvpedAt: 0, cancelledAt: null },
    ]);
    const { result } = renderHook(() => useEventRowActions("community-1", EVENT, WALLET_ADDRESS), { wrapper });

    await waitFor(() => expect(result.current.isLoadingRsvps).toBe(false));
    expect(result.current.hasRsvped).toBe(false);
  });

  it("hasRsvped is true when the wallet is in the active RSVP list (case-insensitive)", async () => {
    listRsvpsMock.mockResolvedValue([
      { walletAddress: WALLET_ADDRESS.toUpperCase(), status: "active", rsvpedAt: 0, cancelledAt: null },
    ]);
    const { result } = renderHook(() => useEventRowActions("community-1", EVENT, WALLET_ADDRESS), { wrapper });

    await waitFor(() => expect(result.current.hasRsvped).toBe(true));
  });

  it("calls rsvp() when not yet RSVP'd, then invalidates and clears pending", async () => {
    listRsvpsMock.mockResolvedValue([]);
    rsvpMock.mockResolvedValue({ walletAddress: WALLET_ADDRESS, status: "active", rsvpedAt: 0, cancelledAt: null });
    const { result } = renderHook(() => useEventRowActions("community-1", EVENT, WALLET_ADDRESS), { wrapper });

    await waitFor(() => expect(result.current.isLoadingRsvps).toBe(false));
    await act(async () => {
      await result.current.handleRsvpToggle();
    });

    expect(rsvpMock).toHaveBeenCalledWith("community-1", "event-1");
    expect(cancelRsvpMock).not.toHaveBeenCalled();
    expect(result.current.rsvpPending).toBe(false);
    expect(result.current.actionError).toBeNull();
  });

  it("calls cancelRsvp() when already RSVP'd", async () => {
    listRsvpsMock.mockResolvedValue([
      { walletAddress: WALLET_ADDRESS, status: "active", rsvpedAt: 0, cancelledAt: null },
    ]);
    cancelRsvpMock.mockResolvedValue({
      walletAddress: WALLET_ADDRESS,
      status: "cancelled",
      rsvpedAt: 0,
      cancelledAt: 1,
    });
    const { result } = renderHook(() => useEventRowActions("community-1", EVENT, WALLET_ADDRESS), { wrapper });

    await waitFor(() => expect(result.current.hasRsvped).toBe(true));
    await act(async () => {
      await result.current.handleRsvpToggle();
    });

    expect(cancelRsvpMock).toHaveBeenCalledWith("community-1", "event-1");
    expect(rsvpMock).not.toHaveBeenCalled();
  });

  it("sets actionError and signs out on a 401 (expired session)", async () => {
    listRsvpsMock.mockResolvedValue([]);
    rsvpMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));
    const { result } = renderHook(() => useEventRowActions("community-1", EVENT, WALLET_ADDRESS), { wrapper });

    await waitFor(() => expect(result.current.isLoadingRsvps).toBe(false));
    await act(async () => {
      await result.current.handleRsvpToggle();
    });

    expect(result.current.actionError).toBe("Authentication required. Please sign in with Ethereum.");
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("reflects an RSVP-list fetch failure via isErrorRsvps", async () => {
    listRsvpsMock.mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useEventRowActions("community-1", EVENT, WALLET_ADDRESS), { wrapper });

    await waitFor(() => expect(result.current.isErrorRsvps).toBe(true));
  });
});
