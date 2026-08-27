import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateDiscussionModal } from "./CreateDiscussionModal";
import { HttpError } from "@/src/services/httpClient";

const createDiscussionMock = vi.fn();
const updateDiscussionMock = vi.fn();
const getTiersMock = vi.fn();

vi.mock("@/src/services/discussionApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/discussionApi")>("@/src/services/discussionApi");
  return {
    ...actual,
    createDiscussion: (...args: unknown[]) => createDiscussionMock(...args),
    updateDiscussion: (...args: unknown[]) => updateDiscussionMock(...args),
  };
});

vi.mock("@/src/services/membershipApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/membershipApi")>("@/src/services/membershipApi");
  return {
    ...actual,
    getTiers: (...args: unknown[]) => getTiersMock(...args),
  };
});

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
    canPostDiscussions: true,
  },
  {
    id: "tier-member",
    label: "Member",
    canCreateProposals: false,
    canVote: true,
    isDefault: false,
    canCreateEvents: true,
    canPostDiscussions: true,
  },
];

beforeEach(() => {
  createDiscussionMock.mockReset();
  updateDiscussionMock.mockReset();
  getTiersMock.mockReset();
  mockSignOut.mockReset();
  getTiersMock.mockResolvedValue(TIERS);
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Title *"), { target: { value: "Welcome thread" } });
  fireEvent.change(screen.getByLabelText("Body *"), { target: { value: "Introduce yourself here." } });
}

describe("CreateDiscussionModal", () => {
  it("creates a discussion successfully", async () => {
    createDiscussionMock.mockResolvedValue({ id: "discussion-1" });
    const onSuccess = vi.fn();

    renderWithProviders(
      <CreateDiscussionModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} communityId="0xabc" />,
    );

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(createDiscussionMock).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("shows an error and signs out when creating a discussion fails with an expired session (401)", async () => {
    createDiscussionMock.mockRejectedValue(
      new HttpError(401, "Authentication required. Please sign in with Ethereum."),
    );

    renderWithProviders(
      <CreateDiscussionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
    );

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows an error without signing out when creating a discussion fails with a non-auth error", async () => {
    createDiscussionMock.mockRejectedValue(new Error("Network error"));

    renderWithProviders(
      <CreateDiscussionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
    );

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(screen.getByText("Network error")).toBeInTheDocument());
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D5's tier-picker toggle,
  // reusing Child I's D5 UX pattern via the shared TierRestrictionPicker component).
  describe("tier-picker", () => {
    it("defaults to unrestricted (toggle off) and submits eligibleTierIds: null when creating", async () => {
      createDiscussionMock.mockResolvedValue({ id: "discussion-1" });

      renderWithProviders(
        <CreateDiscussionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      expect(screen.queryByText("Creator")).not.toBeInTheDocument();
      fillRequiredFields();
      fireEvent.click(screen.getByRole("button", { name: "Post" }));

      await waitFor(() => expect(createDiscussionMock).toHaveBeenCalledTimes(1));
      expect(createDiscussionMock).toHaveBeenCalledWith("0xabc", expect.objectContaining({ eligibleTierIds: null }));
    });

    it("reveals the tier checkboxes when the toggle is switched on, and submits the checked list", async () => {
      createDiscussionMock.mockResolvedValue({ id: "discussion-1" });

      renderWithProviders(
        <CreateDiscussionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      fireEvent.click(screen.getByLabelText("Restrict to specific tiers"));
      await screen.findByText("Creator");
      fireEvent.click(screen.getByLabelText("Member"));

      fillRequiredFields();
      fireEvent.click(screen.getByRole("button", { name: "Post" }));

      await waitFor(() => expect(createDiscussionMock).toHaveBeenCalledTimes(1));
      expect(createDiscussionMock).toHaveBeenCalledWith(
        "0xabc",
        expect.objectContaining({ eligibleTierIds: ["tier-member"] }),
      );
    });

    it("blocks submit when the toggle is on but zero tiers are checked", async () => {
      renderWithProviders(
        <CreateDiscussionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} communityId="0xabc" />,
      );

      fireEvent.click(screen.getByLabelText("Restrict to specific tiers"));
      await screen.findByText("Creator");
      fillRequiredFields();

      expect(screen.getByText("Select at least one tier.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
      expect(createDiscussionMock).not.toHaveBeenCalled();
    });

    it("edit mode pre-fills the toggle OFF for an existing unrestricted discussion", async () => {
      const editingDiscussion = {
        id: "discussion-1",
        communityId: "0xabc",
        authorAddress: "0xauthor",
        title: "Welcome thread",
        body: "Introduce yourself here.",
        eligibleTierIds: null,
        createdAt: 0,
      };

      renderWithProviders(
        <CreateDiscussionModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={() => {}}
          communityId="0xabc"
          editingDiscussion={editingDiscussion}
        />,
      );

      expect(screen.getByLabelText("Restrict to specific tiers")).not.toBeChecked();
      expect(screen.queryByText("Creator")).not.toBeInTheDocument();
    });

    it("edit mode pre-fills the toggle ON with the right boxes checked for an existing restricted discussion", async () => {
      const editingDiscussion = {
        id: "discussion-1",
        communityId: "0xabc",
        authorAddress: "0xauthor",
        title: "Welcome thread",
        body: "Introduce yourself here.",
        eligibleTierIds: ["tier-member"],
        createdAt: 0,
      };

      renderWithProviders(
        <CreateDiscussionModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={() => {}}
          communityId="0xabc"
          editingDiscussion={editingDiscussion}
        />,
      );

      await screen.findByText("Creator");
      expect(screen.getByLabelText("Restrict to specific tiers")).toBeChecked();
      expect(screen.getByLabelText("Member")).toBeChecked();
      expect(screen.getByLabelText("Creator")).not.toBeChecked();
    });

    // /ship coverage audit — the two pre-fill tests above never actually submit; this proves the
    // real PATCH path calls updateDiscussion with the edited payload, not just that state renders.
    it("submits the edited title via updateDiscussion when saving an edit", async () => {
      updateDiscussionMock.mockResolvedValue({ id: "discussion-1" });
      const editingDiscussion = {
        id: "discussion-1",
        communityId: "0xabc",
        authorAddress: "0xauthor",
        title: "Welcome thread",
        body: "Introduce yourself here.",
        eligibleTierIds: null,
        createdAt: 0,
      };

      renderWithProviders(
        <CreateDiscussionModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={() => {}}
          communityId="0xabc"
          editingDiscussion={editingDiscussion}
        />,
      );

      fireEvent.change(screen.getByLabelText("Title *"), { target: { value: "Updated title" } });
      fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

      await waitFor(() => expect(updateDiscussionMock).toHaveBeenCalledTimes(1));
      expect(updateDiscussionMock).toHaveBeenCalledWith(
        "0xabc",
        "discussion-1",
        expect.objectContaining({ title: "Updated title", eligibleTierIds: null }),
      );
    });
  });
});
