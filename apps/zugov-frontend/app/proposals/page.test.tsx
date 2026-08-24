import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProposalsPage from "./page";

// This page renders Header -> WalletConnectButton, which calls useSiwe() (session-lifecycle
// fix, 2026-08-22) — useSiwe needs a real WagmiProvider for useAccount()/useSignMessage(), which
// this lightweight page test doesn't set up. Mock it out entirely; this test has nothing to do
// with auth state.
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

// WalletConnectButton also calls wagmi's useAccount()/useConnect()/useDisconnect() directly
// (/plan-eng-review, 2026-08-23 — Privy removed) — same WagmiProvider issue as above.
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined, status: "disconnected" }),
  useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}));

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
