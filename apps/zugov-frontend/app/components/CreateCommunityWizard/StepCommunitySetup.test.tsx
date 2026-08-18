import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
