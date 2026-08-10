import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateGovernanceActionModal } from "./CreateGovernanceActionModal";

const getTiersMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getTiers: (...args: unknown[]) => getTiersMock(...args),
}));

const createDraftMock = vi.fn();
vi.mock("@/src/services/governanceActionApi", () => ({
  createDraft: (...args: unknown[]) => createDraftMock(...args),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  getTiersMock.mockReset();
  createDraftMock.mockReset();
  getTiersMock.mockResolvedValue([
    { id: "tier-voter", label: "Voter", canVote: true, isDefault: false },
    { id: "tier-guest", label: "Guest", canVote: false, isDefault: true },
  ]);
});

describe("CreateGovernanceActionModal", () => {
  it("renders non-executable axis options as visible but disabled", async () => {
    renderWithProviders(<CreateGovernanceActionModal isOpen={true} onClose={() => {}} communityId="0xabc" />);

    await waitFor(() => expect(screen.getByText("Voter")).toBeInTheDocument());

    const publicRadio = screen.getByText("Public").closest("div")!.parentElement!.querySelector("input")!;
    expect(publicRadio).toBeDisabled();

    const offchainRadio = screen.getByText("Offchain").closest("div")!.parentElement!.querySelector("input")!;
    expect(offchainRadio).toBeDisabled();
    const hybridRadio = screen.getByText("Hybrid").closest("div")!.parentElement!.querySelector("input")!;
    expect(hybridRadio).toBeDisabled();

    const weightedOption = screen.getByRole("option", { name: /Weighted/ }) as HTMLOptionElement;
    expect(weightedOption.disabled).toBe(true);

    // only voting-capable tiers are offered as eligible
    expect(screen.queryByText("Guest")).not.toBeInTheDocument();
  });

  it("surfaces a 403 rejection instead of silently succeeding", async () => {
    createDraftMock.mockRejectedValue(new Error("Not authorized to create governance actions"));
    renderWithProviders(<CreateGovernanceActionModal isOpen={true} onClose={() => {}} communityId="0xabc" />);

    await waitFor(() => expect(screen.getByText("Voter")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "Fund the garden" } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: "Details here" } });
    fireEvent.click(screen.getByText("Voter"));
    fireEvent.click(screen.getByText("Create Draft"));

    await waitFor(() => expect(screen.getByText("Not authorized to create governance actions")).toBeInTheDocument());
  });
});
