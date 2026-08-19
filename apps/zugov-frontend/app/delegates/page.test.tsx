import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DelegatesPage from "./page";

// specs/010 US9, FR-018: no fabricated delegates/stats should ever render on this page.
describe("DelegatesPage", () => {
  it("shows a real empty state instead of placeholder delegate data", () => {
    render(
      <MemoryRouter>
        <DelegatesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Delegation isn't available yet/)).toBeInTheDocument();
    expect(screen.queryByText("Alice.eth")).not.toBeInTheDocument();
    expect(screen.queryByText("504")).not.toBeInTheDocument();
    expect(screen.queryByText("ZuKas Residency")).not.toBeInTheDocument();
  });
});
