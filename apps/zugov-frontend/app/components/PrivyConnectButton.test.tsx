import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrivyConnectButton } from "./PrivyConnectButton";

const logoutMock = vi.fn();
const loginMock = vi.fn();
const usePrivyMock = vi.fn();

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => usePrivyMock(),
}));

// Session-lifecycle fix (2026-08-22, part 2) — Privy's logout() doesn't reliably disconnect
// wagmi's connector for an externally-connected wallet, so sign out must also call wagmi's
// disconnect() directly.
const disconnectMock = vi.fn();
vi.mock("wagmi", () => ({
  useDisconnect: () => ({ disconnect: disconnectMock }),
}));

// Session-lifecycle fix (2026-08-22) — Sign out must also close the backend SIWE session
// (previously only Privy's logout() was called, leaving the httpOnly cookie valid for 24h).
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

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <PrivyConnectButton />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  logoutMock.mockReset();
  loginMock.mockReset();
  usePrivyMock.mockReset();
  siweSignOutMock.mockReset();
  disconnectMock.mockReset();
});

describe("PrivyConnectButton", () => {
  it("shows a Sign in button and calls login() when signed out", () => {
    usePrivyMock.mockReturnValue({
      ready: true,
      authenticated: false,
      user: null,
      login: loginMock,
      logout: logoutMock,
    });
    renderWithProviders();

    fireEvent.click(screen.getByText("Sign in"));
    expect(loginMock).toHaveBeenCalled();
  });

  it("clicking the address does NOT sign out — it opens a menu instead", () => {
    usePrivyMock.mockReturnValue({
      ready: true,
      authenticated: true,
      user: { wallet: { address: "0x1234567890abcdef1234567890abcdef12345678" } },
      login: loginMock,
      logout: logoutMock,
    });
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    expect(logoutMock).not.toHaveBeenCalled();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("only calls logout() when the explicit Sign out menu item is clicked", () => {
    usePrivyMock.mockReturnValue({
      ready: true,
      authenticated: true,
      user: { wallet: { address: "0x1234567890abcdef1234567890abcdef12345678" } },
      login: loginMock,
      logout: logoutMock,
    });
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    fireEvent.click(screen.getByText("Sign out"));
    expect(logoutMock).toHaveBeenCalled();
  });

  // Session-lifecycle fix (2026-08-22) — Sign out previously disconnected only Privy's wallet,
  // leaving the backend's SIWE session (httpOnly cookie) valid for its full 24h TTL: on a shared
  // computer, the next person to use the browser could still act as the signed-out user. Sign out
  // must close both sessions, not just the wallet connection.
  it("also closes the backend SIWE session when signing out, not just the Privy wallet", () => {
    usePrivyMock.mockReturnValue({
      ready: true,
      authenticated: true,
      user: { wallet: { address: "0x1234567890abcdef1234567890abcdef12345678" } },
      login: loginMock,
      logout: logoutMock,
    });
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    fireEvent.click(screen.getByText("Sign out"));

    expect(siweSignOutMock).toHaveBeenCalled();
    expect(logoutMock).toHaveBeenCalled();
  });

  // Session-lifecycle fix (2026-08-22, part 2) — the actual reported bug: after clicking Sign
  // out, the header correctly flipped to "Sign in" (Privy's own state), but the community page's
  // JoinSection kept rendering "You're a member" because it gates on wagmi's useAccount().address,
  // which Privy's logout() alone doesn't reliably clear for an externally-connected wallet. Sign
  // out must explicitly disconnect wagmi's connector too, not rely on Privy's own bridging.
  it("explicitly disconnects wagmi's connector when signing out, not just Privy's own session", () => {
    usePrivyMock.mockReturnValue({
      ready: true,
      authenticated: true,
      user: { wallet: { address: "0x1234567890abcdef1234567890abcdef12345678" } },
      login: loginMock,
      logout: logoutMock,
    });
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    fireEvent.click(screen.getByText("Sign out"));

    expect(disconnectMock).toHaveBeenCalled();
    expect(siweSignOutMock).toHaveBeenCalled();
    expect(logoutMock).toHaveBeenCalled();
  });

  it("copies the full address to the clipboard, not the truncated form", async () => {
    usePrivyMock.mockReturnValue({
      ready: true,
      authenticated: true,
      user: { wallet: { address: "0x1234567890abcdef1234567890abcdef12345678" } },
      login: loginMock,
      logout: logoutMock,
    });
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    fireEvent.click(screen.getByText("Copy address"));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0x1234567890abcdef1234567890abcdef12345678"),
    );
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("closes the menu on an outside click without signing out", () => {
    usePrivyMock.mockReturnValue({
      ready: true,
      authenticated: true,
      user: { wallet: { address: "0x1234567890abcdef1234567890abcdef12345678" } },
      login: loginMock,
      logout: logoutMock,
    });
    renderWithProviders();

    fireEvent.click(screen.getByText("0x1234...5678"));
    expect(screen.getByText("Sign out")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();
  });
});
