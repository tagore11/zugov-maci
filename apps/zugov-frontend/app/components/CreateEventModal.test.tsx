import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateEventModal } from "./CreateEventModal";
import { HttpError } from "@/src/services/httpClient";

const listVenuesMock = vi.fn();
const createEventMock = vi.fn();
const updateEventMock = vi.fn();

vi.mock("@/src/services/eventApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/eventApi")>("@/src/services/eventApi");
  return {
    ...actual,
    listVenues: (...args: unknown[]) => listVenuesMock(...args),
    createEvent: (...args: unknown[]) => createEventMock(...args),
    updateEvent: (...args: unknown[]) => updateEventMock(...args),
  };
});

// /plan-eng-review (2026-08-23) Batch 4 -- this component now calls useSiwe() for withAuthDetect.
// Mocking the module directly (matching JoinSection.test.tsx's convention).
const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

beforeEach(() => {
  listVenuesMock.mockReset();
  createEventMock.mockReset();
  updateEventMock.mockReset();
  mockSignOut.mockReset();
  listVenuesMock.mockResolvedValue([]);
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// Within the 5-year sane-future bound (2026-08-23 /investigate) but safely in the future.
const FUTURE_START = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
const FUTURE_END = new Date(FUTURE_START.getTime() + 60 * 60 * 1000);
function toLocalInputValue(d: Date): string {
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Title *"), { target: { value: "Morning Yoga" } });
  fireEvent.change(screen.getByLabelText("Starts *"), { target: { value: toLocalInputValue(FUTURE_START) } });
  fireEvent.change(screen.getByLabelText("Ends *"), { target: { value: toLocalInputValue(FUTURE_END) } });
  fireEvent.change(screen.getByLabelText("Custom location"), { target: { value: "The Hub" } });
}

describe("CreateEventModal", () => {
  it("creates an event successfully", async () => {
    createEventMock.mockResolvedValue({ id: "event-1" });
    const onSuccess = vi.fn();

    renderWithProviders(
      <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} communityId="0xabc" />,
    );

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    await waitFor(() => expect(createEventMock).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // /plan-eng-review (2026-08-23) Batch 4
  it("shows an error and signs out when creating an event fails with an expired session (401)", async () => {
    createEventMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    renderWithProviders(<CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows an error without signing out when creating an event fails with a non-auth error", async () => {
    createEventMock.mockRejectedValue(new Error("Network error"));

    renderWithProviders(<CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    await waitFor(() => expect(screen.getByText("Network error")).toBeInTheDocument());
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("shows an error and signs out when editing an event fails with an expired session (401)", async () => {
    updateEventMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));
    const editingEvent = {
      id: "event-1",
      communityId: "0xabc",
      title: "Morning Yoga",
      description: null,
      venueId: null,
      locationText: "The Hub",
      startAt: Math.floor(FUTURE_START.getTime() / 1000),
      endAt: Math.floor(FUTURE_END.getTime() / 1000),
      seriesId: null,
      kind: "social" as const,
      creatorAddress: "0xcreator",
      status: "active" as const,
      createdAt: 0,
      cancelledAt: null,
    };

    renderWithProviders(
      <CreateEventModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        communityId="0xabc"
        editingEvent={editingEvent}
      />,
    );

    fireEvent.click(await screen.findByText("Save Changes"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
