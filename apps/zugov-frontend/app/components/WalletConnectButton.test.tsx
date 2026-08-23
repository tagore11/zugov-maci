import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WalletConnectButton } from "./WalletConnectButton";

const disconnectMock = vi.fn();
const connectMock = vi.fn();
const useAccountMock = vi.fn();
const useConnectMock = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => useAccountMock(),
  useConnect: () => useConnectMock(),
  useDisconnect: () => ({ disconnect: disconnectMock }),
}));

// Session-lifecycle fix (2026-08-22) — Sign out must also close the backend SIWE session
// (previously only the wallet connection was torn down, leaving the httpOnly cookie valid for
// 24h).
const siweSignOutMock = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({
    isAuthenticated: true,
    isSigning: false,
    error: null,
    signIn: vi.fn(),
    signOut: siweSignOutMock,
  }),
}));

Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

const CONNECTOR = { id: "injected", name: "Injected" };
const ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <WalletConnectButton />
    </MemoryRouter>,
  );
}

function mockDisconnected(connectOverrides: Record<string, unknown> = {}) {
  useAccountMock.mockReturnValue({ address: undefined, status: "disconnected" });
  useConnectMock.mockReturnValue({
    connectors: [CONNECTOR],
    connect: connectMock,
    isPending: false,
    error: null,
    ...connectOverrides,
  });
}

function mockConnected(address = ADDRESS) {
  useAccountMock.mockReturnValue({ address, status: "connected" });
  useConnectMock.mockReturnValue({ connectors: [CONNECTOR], connect: connectMock, isPending: false, error: null });
}

beforeEach(() => {
  disconnectMock.mockReset();
  connectMock.mockReset();
  useAccountMock.mockReset();
  useConnectMock.mockReset();
  siweSignOutMock.mockReset();
});

describe("WalletConnectButton", () => {
  it("shows a Connect Wallet button and calls connect() with the registered connector when disconnected", () => {
    mockDisconnected();
    renderWithProviders();

    fireEvent.click(screen.getByText("Connect Wallet"));
    expect(connectMock).toHaveBeenCalledWith({ connector: CONNECTOR });
  });

  // /plan-eng-review (2026-08-23) — a single injected() connector covers every EIP-6963 browser
  // wallet under one entry, so there's no multi-wallet choice to present; confirms we didn't
  // regress into rendering picker UI for it.
  it("does not render a wallet-picker — a single connector connects directly", () => {
    mockDisconnected();
    renderWithProviders();

    expect(screen.queryByText(/choose a wallet/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("shows a disabled Loading state while reconnecting on mount", () => {
    useAccountMock.mockReturnValue({ address: undefined, status: "reconnecting" });
    useConnectMock.mockReturnValue({ connectors: [CONNECTOR], connect: connectMock, isPending: false, error: null });
    renderWithProviders();

    expect(screen.getByText("Loading...")).toBeDisabled();
  });

  it("shows an error message when connecting fails (no wallet found)", () => {
    mockDisconnected({ error: new Error("no connector found") });
    renderWithProviders();

    expect(screen.getByText(/install metamask/i)).toBeInTheDocument();
  });

  it("clicking the address does NOT sign out — it opens a menu instead", () => {
    mockConnected();
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    expect(siweSignOutMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("only signs out when the explicit Sign out menu item is clicked", () => {
    mockConnected();
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    fireEvent.click(screen.getByText("Sign out"));

    expect(siweSignOutMock).toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it("copies the full address to the clipboard, not the truncated form", async () => {
    mockConnected();
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    fireEvent.click(screen.getByText("Copy address"));

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(ADDRESS));
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("closes the menu on an outside click without signing out", () => {
    mockConnected();
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    expect(screen.getByText("Sign out")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
    expect(siweSignOutMock).not.toHaveBeenCalled();
  });
});
