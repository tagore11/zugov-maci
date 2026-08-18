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
