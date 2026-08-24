import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";

const connectMock = vi.fn();
const useAccountMock = vi.fn();
const useConnectMock = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => useAccountMock(),
  useConnect: () => useConnectMock(),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}));

vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

const CONNECTOR = { id: "injected", name: "Injected" };

function renderGuardedRoute() {
  return render(
    <MemoryRouter initialEntries={["/manage-communities"]}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/manage-communities" element={<div>Protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  connectMock.mockReset();
  useAccountMock.mockReset();
  useConnectMock.mockReset();
  useConnectMock.mockReturnValue({ connectors: [CONNECTOR], connect: connectMock, isPending: false, error: null });
});

describe("RequireAuth", () => {
  it("renders the guarded route's content once a wallet is connected", () => {
    useAccountMock.mockReturnValue({ address: "0x1111111111111111111111111111111111111111", status: "connected" });
    renderGuardedRoute();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("shows a connect-wallet prompt instead of the route's content when disconnected", () => {
    useAccountMock.mockReturnValue({ address: undefined, status: "disconnected" });
    renderGuardedRoute();

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Connect your wallet to view this page.")).toBeInTheDocument();
  });

  it("connects with the registered connector when the prompt's Connect Wallet button is clicked", () => {
    useAccountMock.mockReturnValue({ address: undefined, status: "disconnected" });
    renderGuardedRoute();

    // Header's own WalletConnectButton also renders a "Connect Wallet" button while disconnected
    // — scope to the guard's own prompt, not the header's, to avoid ambiguity.
    const prompt = screen.getByText("Connect your wallet to view this page.").parentElement!;
    fireEvent.click(within(prompt).getByText("Connect Wallet"));
    expect(connectMock).toHaveBeenCalledWith({ connector: CONNECTOR });
  });

  // Prevents a false "Connect your wallet" flash for a returning user whose wallet is still
  // reconnecting on mount (matches WalletConnectButton's same status check).
  it("shows a loading state, not the connect prompt, while reconnecting on mount", () => {
    useAccountMock.mockReturnValue({ address: undefined, status: "reconnecting" });
    renderGuardedRoute();

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.queryByText("Connect your wallet to view this page.")).not.toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
