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

const mockSiwe = {
  isAuthenticated: false,
  isSigning: false,
  error: null as string | null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  connectionLost: false,
};
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => mockSiwe,
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
  mockSiwe.connectionLost = false;
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

  // Bug fix (2026-08-28) — a mid-session permission drop (e.g. switching MetaMask to an account
  // this site was never connected with) previously showed the exact same generic prompt as a
  // first-time visitor, making it look like the app silently got stuck. Header's own
  // WalletConnectButton shares the same connectionLost state and shows the same message too — use
  // getAllByText (not getByText) since both legitimately render it at once.
  it("shows a connection-lost message instead of the generic prompt when connectionLost is true", () => {
    mockSiwe.connectionLost = true;
    useAccountMock.mockReturnValue({ address: undefined, status: "disconnected" });
    renderGuardedRoute();

    expect(screen.getAllByText("Wallet connection lost — click Connect to resume.").length).toBeGreaterThan(0);
    expect(screen.queryByText("Connect your wallet to view this page.")).not.toBeInTheDocument();
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
