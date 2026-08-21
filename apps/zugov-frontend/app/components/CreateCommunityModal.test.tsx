import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CreateCommunityModal } from "./CreateCommunityModal";

// Community creation wizard fix (2026-08-21) — the modal's X button used to close
// unconditionally, which could silently orphan an in-flight registerIdentity() call (and its
// retry) if clicked mid-submission. CreateCommunityWizard is mocked here so these tests exercise
// only the modal's own gating logic, not the full wizard.
let onSubmittingChange: ((submitting: boolean) => void) | undefined;
vi.mock("./CreateCommunityWizard", () => ({
  CreateCommunityWizard: (props: { onSubmittingChange?: (submitting: boolean) => void }) => {
    onSubmittingChange = props.onSubmittingChange;
    return <div data-testid="wizard-stub" />;
  },
}));

describe("CreateCommunityModal — X button gating", () => {
  it("X is enabled on initial render (step 1), before anything has been submitted", () => {
    render(<CreateCommunityModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "" })).not.toBeDisabled();
  });

  it("X stays enabled immediately after landing on a later step, before Create Community is clicked", () => {
    render(<CreateCommunityModal isOpen={true} onClose={vi.fn()} />);
    act(() => onSubmittingChange?.(false));
    expect(screen.getByRole("button", { name: "" })).not.toBeDisabled();
  });

  it("X is disabled while the wizard reports isSubmitting: true (the registerIdentity() call)", () => {
    render(<CreateCommunityModal isOpen={true} onClose={vi.fn()} />);
    act(() => onSubmittingChange?.(true));
    expect(screen.getByRole("button", { name: "" })).toBeDisabled();
  });

  it("X is enabled again once submission resolves (success or error)", () => {
    render(<CreateCommunityModal isOpen={true} onClose={vi.fn()} />);
    act(() => onSubmittingChange?.(true));
    expect(screen.getByRole("button", { name: "" })).toBeDisabled();
    act(() => onSubmittingChange?.(false));
    expect(screen.getByRole("button", { name: "" })).not.toBeDisabled();
  });
});
