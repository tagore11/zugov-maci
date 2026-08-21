import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSiwe } from "./useSiwe";

const EMBEDDED_WALLET_ADDRESS = "0x1111111111111111111111111111111111111111";
const EXTERNAL_WALLET_ADDRESS = "0x2222222222222222222222222222222222222222";

const mockUseAccount = vi.fn();
const mockSignMessageAsync = vi.fn();

// useSiwe consumes only useAccount()/useSignMessage() from wagmi — the same hook interface
// whether the connected wallet came from Privy's embedded-wallet path (email/social login,
// no crypto background needed) or an external wallet (e.g. MetaMask via Privy's 'wallet'
// login method). Mocking at this level exercises both paths without needing a real Privy
// provider in the test environment.
vi.mock("wagmi", () => ({
  useAccount: () => mockUseAccount(),
  useSignMessage: () => ({ signMessageAsync: mockSignMessageAsync }),
}));

vi.mock("viem/siwe", () => ({
  createSiweMessage: () => "mock-siwe-message",
}));

function mockFetchSequence(responses: Array<{ ok: boolean; json: () => unknown }>) {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  sessionStorage.clear();
  mockUseAccount.mockReset();
  mockSignMessageAsync.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSiwe", () => {
  // Create-community wizard fix (2026-08-21) — an already-connected wallet with no SIWE session
  // yet now signs in automatically, without the caller ever calling signIn() itself. This used to
  // require a separate manual click that read to an already-Privy-authenticated user as being
  // asked to sign in twice.
  it("auto-signs in once an embedded (non-crypto-background) wallet is connected, with no explicit signIn() call", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    mockSignMessageAsync.mockResolvedValue("0xsignature");
    mockFetchSequence([
      { ok: true, json: () => ({ nonce: "abc123" }) },
      { ok: true, json: () => ({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 }) },
    ]);

    const { result } = renderHook(() => useSiwe());
    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.address).toBe(EMBEDDED_WALLET_ADDRESS);
    expect(result.current.error).toBeNull();
    expect(mockSignMessageAsync).toHaveBeenCalledTimes(1);
  });

  it("auto-signs in for an external wallet too — same code path, different address", async () => {
    mockUseAccount.mockReturnValue({ address: EXTERNAL_WALLET_ADDRESS, chainId: 11155111 });
    mockSignMessageAsync.mockResolvedValue("0xsignature");
    mockFetchSequence([
      { ok: true, json: () => ({ nonce: "def456" }) },
      { ok: true, json: () => ({ address: EXTERNAL_WALLET_ADDRESS, chainId: 11155111 }) },
    ]);

    const { result } = renderHook(() => useSiwe());

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.address).toBe(EXTERNAL_WALLET_ADDRESS);
  });

  it("auto-sign-in surfaces a clear error and does not authenticate when the wallet auth backend is unreachable", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network request failed")));

    const { result } = renderHook(() => useSiwe());

    await waitFor(() => expect(result.current.isSigning).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Network request failed");
  });

  it("auto-sign-in surfaces a clear error when the wallet-custody provider rejects or fails to produce a signature", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    mockFetchSequence([{ ok: true, json: () => ({ nonce: "abc123" }) }]);
    mockSignMessageAsync.mockRejectedValue(new Error("User rejected the request"));

    const { result } = renderHook(() => useSiwe());

    await waitFor(() => expect(result.current.isSigning).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("User rejected the request");
  });

  it("does not attempt to sign in at all while no wallet is connected", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    mockUseAccount.mockReturnValue({ address: undefined, chainId: undefined });

    renderHook(() => useSiwe());

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockSignMessageAsync).not.toHaveBeenCalled();
  });

  it("reports 'Wallet not connected' if signIn is called manually before any wallet is connected", async () => {
    mockUseAccount.mockReturnValue({ address: undefined, chainId: undefined });

    const { result } = renderHook(() => useSiwe());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Wallet not connected");
  });

  it("clears the session on sign-out even if the logout request fails", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    sessionStorage.setItem("siwe_auth", JSON.stringify({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 }));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("logout endpoint down")));

    const { result } = renderHook(() => useSiwe());
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.address).toBeNull();
    expect(sessionStorage.getItem("siwe_auth")).toBeNull();
  });

  // Critical regression test (2026-08-19 SIWE re-auth fix, commit 06c3f988): a session invalidated
  // mid-flow by withAuthRetry's AuthError handling (signOut(), wallet stays on the same address)
  // must surface as a VISIBLE sign-in gate the user re-triggers themselves, never a silent,
  // unprompted wallet popup. The new auto-sign-in effect must not treat this signOut() as "a fresh
  // address that hasn't tried yet" and re-fire signIn() on its own.
  it("does not auto-retry signIn after signOut() invalidates a session while the wallet stays on the same address", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    sessionStorage.setItem("siwe_auth", JSON.stringify({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: () => ({}) }));

    const { result } = renderHook(() => useSiwe());
    expect(result.current.isAuthenticated).toBe(true);

    // No auto-sign-in should have fired for an address that started out already authenticated.
    expect(mockSignMessageAsync).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.isAuthenticated).toBe(false);

    // Give any stray effect a tick to fire, then assert it didn't.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockSignMessageAsync).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
