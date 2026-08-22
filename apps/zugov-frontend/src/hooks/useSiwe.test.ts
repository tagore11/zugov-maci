import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSiwe } from "./useSiwe";

const EMBEDDED_WALLET_ADDRESS = "0x1111111111111111111111111111111111111111";
const EXTERNAL_WALLET_ADDRESS = "0x2222222222222222222222222222222222222222";

const mockUseAccount = vi.fn();
const mockSignMessageAsync = vi.fn();
const mockUsePrivy = vi.fn();

// useSiwe consumes only useAccount()/useSignMessage() from wagmi — the same hook interface
// whether the connected wallet came from Privy's embedded-wallet path (email/social login,
// no crypto background needed) or an external wallet (e.g. MetaMask via Privy's 'wallet'
// login method). Mocking at this level exercises both paths without needing a real Privy
// provider in the test environment.
vi.mock("wagmi", () => ({
  useAccount: () => mockUseAccount(),
  useSignMessage: () => ({ signMessageAsync: mockSignMessageAsync }),
}));

// usePrivy().authenticated gates the auto-sign-in effect (2026-08-21 sign-in clash fix) — Privy's
// own external-wallet login can request its own signature before wagmi's address/chainId settle,
// so auto-sign-in must wait for Privy's flow to fully finish first.
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => mockUsePrivy(),
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
  // Default: Privy's own connect/auth flow already settled — most tests exercise post-Privy
  // behavior, not the race itself (that gets its own dedicated test below).
  mockUsePrivy.mockReturnValue({ authenticated: true });
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

  // Sign-in clash fix (2026-08-21) — reported after a real repro: an external wallet (MetaMask)
  // connects via Privy's own login flow, which can request its OWN signature to verify wallet
  // ownership before Privy's `authenticated` flips true. Without waiting for that, auto-sign-in
  // fired OUR SIWE signature request concurrently with Privy's — two uncoordinated wallet prompts
  // — and the user saw MetaMask confirm successfully while the SIWE session never established
  // ("Authentication required" on the next write action). wagmi's address/chainId can be populated
  // before Privy's own authenticated flag settles, so gating on address/chainId alone isn't enough.
  it("does not auto-sign-in while Privy's own connect flow hasn't finished authenticating, even with address/chainId already set", async () => {
    mockUseAccount.mockReturnValue({ address: EXTERNAL_WALLET_ADDRESS, chainId: 11155111 });
    mockUsePrivy.mockReturnValue({ authenticated: false });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(() => useSiwe());

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockSignMessageAsync).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);

    // Privy's own flow finishes — auto-sign-in should fire now, sequenced after it.
    mockSignMessageAsync.mockResolvedValue("0xsignature");
    mockFetchSequence([
      { ok: true, json: () => ({ nonce: "xyz789" }) },
      { ok: true, json: () => ({ address: EXTERNAL_WALLET_ADDRESS, chainId: 11155111 }) },
    ]);
    mockUsePrivy.mockReturnValue({ authenticated: true });
    rerender();

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(mockSignMessageAsync).toHaveBeenCalledTimes(1);
  });

  // Session-lifecycle fix (2026-08-22) — the actual reported bug: nothing previously invalidated
  // the session when the wallet disconnected or switched accounts. A disconnect left
  // isAuthenticated stuck true from stale sessionStorage; SiweGate-wrapped screens kept rendering
  // as signed in with no wallet actually connected.
  it("clears the session when the wallet disconnects, not just on an explicit signOut() call", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    sessionStorage.setItem("siwe_auth", JSON.stringify({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 }));
    const logoutFetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });
    vi.stubGlobal("fetch", logoutFetch);

    const { result, rerender } = renderHook(() => useSiwe());
    expect(result.current.isAuthenticated).toBe(true);

    mockUseAccount.mockReturnValue({ address: undefined, chainId: undefined });
    rerender();

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(result.current.address).toBeNull();
    expect(sessionStorage.getItem("siwe_auth")).toBeNull();
    expect(logoutFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/logout"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  // Session-lifecycle fix (2026-08-22) — the more severe half of the same bug: switching to a
  // DIFFERENT connected address (MetaMask account switch) left the stale session authenticated
  // as the OLD address. Every write kept silently succeeding against the old address's backend
  // cookie (nothing re-verified or invalidated it) while the UI showed the new address connected
  // — a real identity-confusion bug, not just a stale-UI one. The fix must both invalidate the old
  // session AND cleanly re-authenticate the new address, not leave the user stuck on manual retry.
  it("invalidates the old session and re-authenticates fresh when the connected address switches to a different account", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    sessionStorage.setItem("siwe_auth", JSON.stringify({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 }));
    mockSignMessageAsync.mockResolvedValue("0xsignature");
    // Invalidation (signOut's /logout) fires and completes before the fresh re-authentication's
    // /nonce and /verify calls start — queued up front in that order rather than interleaved with
    // assertions, since the re-auth is automatic and near-immediate once invalidation lands.
    const fetchMock = mockFetchSequence([
      { ok: true, json: () => ({}) },
      { ok: true, json: () => ({ nonce: "switched-account-nonce" }) },
      { ok: true, json: () => ({ address: EXTERNAL_WALLET_ADDRESS, chainId: 11155111 }) },
    ]);

    const { result, rerender } = renderHook(() => useSiwe());
    expect(result.current.isAuthenticated).toBe(true);

    mockUseAccount.mockReturnValue({ address: EXTERNAL_WALLET_ADDRESS, chainId: 11155111 });
    rerender();

    // isAuthenticated starts true (from storage, for the OLD address), so waiting on that alone
    // would pass instantly at t=0 before the invalidate-then-reauth cycle even runs — wait on the
    // actual target address instead, which only becomes true once the full cycle really completes.
    await waitFor(() => expect(result.current.address).toBe(EXTERNAL_WALLET_ADDRESS));
    expect(result.current.isAuthenticated).toBe(true);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/api/auth/logout");
  });

  it("does not try to invalidate anything on first mount, even if already authenticated from storage", async () => {
    mockUseAccount.mockReturnValue({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 });
    sessionStorage.setItem("siwe_auth", JSON.stringify({ address: EMBEDDED_WALLET_ADDRESS, chainId: 11155111 }));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useSiwe());

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current.isAuthenticated).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
