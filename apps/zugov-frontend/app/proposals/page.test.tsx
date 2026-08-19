import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProposalsPage from "./page";

// specs/010 US9, FR-018: no fabricated cross-community proposals should ever render here.
describe("ProposalsPage", () => {
  it("shows a real empty state instead of placeholder proposal data", () => {
    render(
      <MemoryRouter>
        <ProposalsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Cross-community proposal browsing isn't available yet/)).toBeInTheDocument();
    expect(screen.queryByText("Community Space Expansion Plan")).not.toBeInTheDocument();
    expect(screen.queryByText("ZuKas Residency")).not.toBeInTheDocument();
  });
});
