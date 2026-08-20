import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepCommunitySetup } from "./StepCommunitySetup";

// Regression test for a real bug found in eng review: this step is remounted on wizard
// navigation (index.tsx conditionally renders it), so without initial-value props it silently
// wiped any Advanced settings and reset membershipPolicy to "open" whenever a resident hit
// Back then forward again — for the one screen Tarik/Sait actually depend on.
describe("StepCommunitySetup — restores state across Back navigation", () => {
  it("pre-selects 'approval-required' when initialMembershipPolicy is 'approval'", () => {
    render(<StepCommunitySetup initialMembershipPolicy="approval" setCommunitySetup={vi.fn()} goBack={vi.fn()} />);

    const approvalButton = screen.getByRole("button", { name: /organizers approve new residents/i });
    expect(approvalButton).toHaveAttribute("aria-pressed", "true");
  });

  it("opens Advanced settings and restores a non-default sign-up policy", () => {
    render(
      <StepCommunitySetup
        initialSignUpPolicy={{ type: "MerkleProof", merkleRoot: "0xabc123" }}
        initialPolicies={[2]}
        initialModes={[0]}
        setCommunitySetup={vi.fn()}
        goBack={vi.fn()}
      />,
    );

    // Advanced section should already be open, not collapsed, since there's non-default
    // content to show.
    const toggle = screen.getByRole("button", { name: /advanced settings/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const merkleRootInput = screen.getByPlaceholderText("0x...", { exact: false }) as HTMLInputElement;
    expect(merkleRootInput.value).toBe("0xabc123");
  });

  it("stays collapsed with defaults when no initial values are provided (first visit)", () => {
    render(<StepCommunitySetup setCommunitySetup={vi.fn()} goBack={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: /advanced settings/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const openButton = screen.getByRole("button", { name: /anyone can join/i });
    expect(openButton).toHaveAttribute("aria-pressed", "true");
  });

  // Same class of bug as the membership-policy/advanced-settings restore tests above, now for
  // the creation-time tier editor (2026-08-19 community-creation-rework review, D3) — a
  // creator's renamed/customized tiers must survive Back-then-forward, not silently reset to
  // the Resident/Organizer preset.
  it("restores creator-edited tiers when initialTiers is provided", () => {
    render(
      <StepCommunitySetup
        initialTiers={[{ label: "Neighbor", canVote: true, canCreateProposals: false, canManageMembership: false }]}
        setCommunitySetup={vi.fn()}
        goBack={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Neighbor")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Resident")).not.toBeInTheDocument();
  });

  it("defaults to the Resident/Organizer preset when no initialTiers is provided (first visit)", () => {
    render(<StepCommunitySetup setCommunitySetup={vi.fn()} goBack={vi.fn()} />);

    expect(screen.getByDisplayValue("Resident")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Organizer")).toBeInTheDocument();
  });
});

// specs/010 US8: voting mechanism must be a real, interactive control — not hardcoded text —
// with only MACI actually selectable (research.md #8).
describe("StepCommunitySetup — voting mechanism selector", () => {
  it("renders MACI selectable and the other families visibly present but disabled", () => {
    render(<StepCommunitySetup setCommunitySetup={vi.fn()} goBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /advanced settings/i }));

    const select = screen.getByDisplayValue("MACI") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.value).toBe("maci");

    const tokenWeightedOption = screen.getByRole("option", { name: /token-weighted/i }) as HTMLOptionElement;
    expect(tokenWeightedOption.disabled).toBe(true);
    const offchainOption = screen.getByRole("option", { name: /off-chain/i }) as HTMLOptionElement;
    expect(offchainOption.disabled).toBe(true);

    const maciOption = screen.getByRole("option", { name: "MACI" }) as HTMLOptionElement;
    expect(maciOption.disabled).toBe(false);
  });
});
