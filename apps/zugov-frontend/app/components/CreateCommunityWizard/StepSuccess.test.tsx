import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StepSuccess } from "./StepSuccess";

const COMMUNITY_ID = "abcdef12-3456-7890-abcd-ef1234567890";

function renderWithRoutes(reset: () => void) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<StepSuccess communityId={COMMUNITY_ID} reset={reset} />} />
        <Route path="/community/:id" element={<div>Community page</div>} />
        <Route path="/community/:id/settings" element={<div>Settings page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("StepSuccess", () => {
  it("renders the truncated community ID", () => {
    renderWithRoutes(vi.fn());
    expect(screen.getByText("Community created!")).toBeInTheDocument();
    expect(screen.getByText(`${COMMUNITY_ID.slice(0, 8)}…${COMMUNITY_ID.slice(-6)}`)).toBeInTheDocument();
  });

  // formalize-communities epic, Child A (/plan-eng-review 2026-08-25, D1) — widened from the old
  // governance-only copy to also mention eligibility, since a brand-new community's eligibility
  // ruleset is just as unconfigured as its governance.
  it("shows copy mentioning both eligibility and governance as optional add-later steps", () => {
    renderWithRoutes(vi.fn());
    expect(
      screen.getByText(/Eligibility and Governance isn't set up yet.*You can add both anytime/),
    ).toBeInTheDocument();
  });

  it("all three actions render", () => {
    renderWithRoutes(vi.fn());
    expect(screen.getByText("Go to community")).toBeInTheDocument();
    expect(screen.getByText("Go to settings")).toBeInTheDocument();
    expect(screen.getByText("Create another community")).toBeInTheDocument();
  });

  it("'Go to community' navigates to /community/:id", () => {
    renderWithRoutes(vi.fn());
    fireEvent.click(screen.getByText("Go to community"));
    expect(screen.getByText("Community page")).toBeInTheDocument();
  });

  // formalize-communities epic, Child A (/plan-eng-review 2026-08-25, D3) — the new action.
  it("'Go to settings' navigates to /community/:id/settings", () => {
    renderWithRoutes(vi.fn());
    fireEvent.click(screen.getByText("Go to settings"));
    expect(screen.getByText("Settings page")).toBeInTheDocument();
  });

  it("'Create another community' calls reset(), not a navigation", () => {
    const reset = vi.fn();
    renderWithRoutes(reset);
    fireEvent.click(screen.getByText("Create another community"));
    expect(reset).toHaveBeenCalledTimes(1);
    // No navigation occurred — still on the success screen, not a route change.
    expect(screen.getByText("Community created!")).toBeInTheDocument();
  });
});
