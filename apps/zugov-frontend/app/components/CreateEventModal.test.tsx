import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateEventModal } from "./CreateEventModal";
import { HttpError } from "@/src/services/httpClient";

const listVenuesMock = vi.fn();
const createEventMock = vi.fn();
const updateEventMock = vi.fn();
const getTiersMock = vi.fn();
const listEventsMock = vi.fn();

vi.mock("@/src/services/eventApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/eventApi")>("@/src/services/eventApi");
  return {
    ...actual,
    listVenues: (...args: unknown[]) => listVenuesMock(...args),
    createEvent: (...args: unknown[]) => createEventMock(...args),
    updateEvent: (...args: unknown[]) => updateEventMock(...args),
    listEvents: (...args: unknown[]) => listEventsMock(...args),
  };
});

// formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D5) — tier-picker fetches
// the community's tiers via membershipApi, same as JoinSection/ProposalsList do elsewhere.
vi.mock("@/src/services/membershipApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/membershipApi")>("@/src/services/membershipApi");
  return {
    ...actual,
    getTiers: (...args: unknown[]) => getTiersMock(...args),
  };
});

// /plan-eng-review (2026-08-23) Batch 4 -- this component now calls useSiwe() for withAuthDetect.
// Mocking the module directly (matching JoinSection.test.tsx's convention).
const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const TIERS = [
  {
    id: "tier-creator",
    label: "Creator",
    canCreateProposals: true,
    canVote: true,
    isDefault: true,
    canCreateEvents: true,
  },
  {
    id: "tier-member",
    label: "Member",
    canCreateProposals: false,
    canVote: true,
    isDefault: false,
    canCreateEvents: true,
  },
];

beforeEach(() => {
  listVenuesMock.mockReset();
  createEventMock.mockReset();
  updateEventMock.mockReset();
  getTiersMock.mockReset();
  listEventsMock.mockReset();
  mockSignOut.mockReset();
  listVenuesMock.mockResolvedValue([]);
  getTiersMock.mockResolvedValue(TIERS);
  listEventsMock.mockResolvedValue({ events: [], total: 0, hasMore: false });
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
      eligibleTierIds: null,
      parentEventId: null,
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

  // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D5).
  describe("tier-picker", () => {
    it("defaults to unrestricted (toggle off) and submits eligibleTierIds: null when creating", async () => {
      createEventMock.mockResolvedValue({ id: "event-1" });

      renderWithProviders(
        <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      expect(screen.queryByText("Creator")).not.toBeInTheDocument();
      fillRequiredFields();
      fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

      await waitFor(() => expect(createEventMock).toHaveBeenCalledTimes(1));
      expect(createEventMock).toHaveBeenCalledWith("0xabc", expect.objectContaining({ eligibleTierIds: null }));
    });

    it("reveals the tier checkboxes when the toggle is switched on, and submits the checked list", async () => {
      createEventMock.mockResolvedValue({ id: "event-1" });

      renderWithProviders(
        <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      fireEvent.click(screen.getByLabelText("Restrict to specific tiers"));
      await screen.findByText("Creator");
      fireEvent.click(screen.getByLabelText("Member"));

      fillRequiredFields();
      fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

      await waitFor(() => expect(createEventMock).toHaveBeenCalledTimes(1));
      expect(createEventMock).toHaveBeenCalledWith(
        "0xabc",
        expect.objectContaining({ eligibleTierIds: ["tier-member"] }),
      );
    });

    it("blocks submit when the toggle is on but zero tiers are checked", async () => {
      renderWithProviders(
        <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      fireEvent.click(screen.getByLabelText("Restrict to specific tiers"));
      await screen.findByText("Creator");
      fillRequiredFields();

      expect(screen.getByText("Select at least one tier.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Create Event" })).toBeDisabled();
      expect(createEventMock).not.toHaveBeenCalled();
    });

    it("edit mode pre-fills the toggle OFF for an existing unrestricted event", async () => {
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
        eligibleTierIds: null,
        parentEventId: null,
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

      expect(screen.getByLabelText("Restrict to specific tiers")).not.toBeChecked();
      expect(screen.queryByText("Creator")).not.toBeInTheDocument();
    });

    it("edit mode pre-fills the toggle ON with the right boxes checked for an existing restricted event", async () => {
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
        eligibleTierIds: ["tier-member"],
        parentEventId: null,
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

      await screen.findByText("Creator");
      expect(screen.getByLabelText("Restrict to specific tiers")).toBeChecked();
      expect(screen.getByLabelText("Member")).toBeChecked();
      expect(screen.getByLabelText("Creator")).not.toBeChecked();
    });
  });

  // Events expansion (2026-08-26, D2) — native <select> parent-event picker.
  describe("parent-event picker", () => {
    it("does not render the picker when the community has no other top-level events", async () => {
      renderWithProviders(
        <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      await waitFor(() => expect(listEventsMock).toHaveBeenCalled());
      expect(screen.queryByLabelText("Parent event (optional)")).not.toBeInTheDocument();
    });

    it("lists only the community's other top-level events, excluding existing side-events", async () => {
      listEventsMock.mockResolvedValue({
        events: [
          { id: "top-1", title: "Multi-day Gathering", parentEventId: null },
          { id: "top-2", title: "Another Gathering", parentEventId: null },
          { id: "side-1", title: "A Side Session", parentEventId: "top-1" },
        ],
        total: 3,
        hasMore: false,
      });

      renderWithProviders(
        <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      const select = await screen.findByLabelText("Parent event (optional)");
      expect(screen.getByText("Multi-day Gathering")).toBeInTheDocument();
      expect(screen.getByText("Another Gathering")).toBeInTheDocument();
      expect(screen.queryByText("A Side Session")).not.toBeInTheDocument();
      expect((select as HTMLSelectElement).value).toBe("");
    });

    it("submitting with a selected parent includes parentEventId in the create payload", async () => {
      listEventsMock.mockResolvedValue({
        events: [{ id: "top-1", title: "Multi-day Gathering", parentEventId: null }],
        total: 1,
        hasMore: false,
      });
      createEventMock.mockResolvedValue({ id: "event-1" });

      renderWithProviders(
        <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      const select = await screen.findByLabelText("Parent event (optional)");
      fillRequiredFields();
      fireEvent.change(select, { target: { value: "top-1" } });
      fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

      await waitFor(() =>
        expect(createEventMock).toHaveBeenCalledWith("0xabc", expect.objectContaining({ parentEventId: "top-1" })),
      );
    });

    it("submitting without selecting a parent omits parentEventId from the create payload", async () => {
      listEventsMock.mockResolvedValue({
        events: [{ id: "top-1", title: "Multi-day Gathering", parentEventId: null }],
        total: 1,
        hasMore: false,
      });
      createEventMock.mockResolvedValue({ id: "event-1" });

      renderWithProviders(
        <CreateEventModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      await screen.findByLabelText("Parent event (optional)");
      fillRequiredFields();
      fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

      await waitFor(() => expect(createEventMock).toHaveBeenCalledTimes(1));
      const payload = createEventMock.mock.calls[0]![1] as Record<string, unknown>;
      expect(payload.parentEventId).toBeUndefined();
    });

    it("does not render the picker in edit mode (parentEventId is immutable after creation)", async () => {
      listEventsMock.mockResolvedValue({
        events: [{ id: "top-1", title: "Multi-day Gathering", parentEventId: null }],
        total: 1,
        hasMore: false,
      });
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
        eligibleTierIds: null,
        parentEventId: null,
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

      await screen.findByText("Edit Event");
      expect(listEventsMock).not.toHaveBeenCalled();
      expect(screen.queryByLabelText("Parent event (optional)")).not.toBeInTheDocument();
    });
  });
});
