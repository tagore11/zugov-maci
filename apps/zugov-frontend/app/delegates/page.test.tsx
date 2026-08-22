import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DelegatesPage from "./page";

// This page renders Header -> PrivyConnectButton, which now calls useSiwe() (session-lifecycle
// fix, 2026-08-22) — useSiwe needs a real WagmiProvider for useAccount()/useSignMessage(), which
// this lightweight page test doesn't set up. Mock it out entirely; this test has nothing to do
// with auth state.
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

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
