import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";
const SESSION_KEY = "siwe_auth";

type AuthState = {
  address: string;
  chainId: number;
};

function readStoredAuth(): AuthState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export interface SiweContextValue {
  isAuthenticated: boolean;
  address: string | null;
  isSigning: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SiweContext = createContext<SiweContextValue | null>(null);

// /plan-eng-review (2026-08-23) — a Context provider, not a module-level singleton store. Every
// `useSiwe()` call site (up to 6 today: WalletConnectButton, the create-community wizard,
// SiweGate's own fallback, the register/edit pages, JoinSection) used to mount an INDEPENDENT
// instance of this state and its own copy of the auto-sign-in/invalidation effect below — a
// confirmed, live race: a fresh wallet connecting could trigger 2-3 simultaneous auto-sign-in
// attempts, with a later /api/auth/nonce call overwriting an earlier one's nonce before its
// signIn() finished. A Context provider makes "exactly one instance" true by construction (one
// component, mounted once in app/providers.tsx) instead of relying on shared mutable state plus
// a hand-written re-entrancy guard — the outside-voice pass on the eng review caught that the
// originally-planned module-level-singleton approach hadn't actually specified that guard.
export function SiweProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => readStoredAuth() !== null);
  const [authAddress, setAuthAddress] = useState<string | null>(() => readStoredAuth()?.address ?? null);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const signIn = useCallback(async () => {
    if (!address || !chainId) {
      setError("Wallet not connected");
      return;
    }
    setIsSigning(true);
    setError(null);
    try {
      const nonceRes = await fetch(`${BASE_URL}/api/auth/nonce`, {
        credentials: "include",
      });
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement: "Sign in with Ethereum to ZuGov",
      });

      const signature = await signMessageAsync({ message });

      const verifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        const data = (await verifyRes.json()) as { error: string };
        throw new Error(data.error);
      }

      const auth = (await verifyRes.json()) as AuthState;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(auth));
      setIsAuthenticated(true);
      setAuthAddress(auth.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setIsAuthenticated(false);
    } finally {
      setIsSigning(false);
    }
  }, [address, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      // Best-effort — clearing the local session must not depend on reaching the backend.
      // If the auth service is down (coordinator outage, network partition, etc.), the
      // resident can still sign out locally rather than getting stuck "authenticated" with
      // no way to recover.
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Swallowed intentionally — see comment above.
    } finally {
      sessionStorage.removeItem(SESSION_KEY);
      setIsAuthenticated(false);
      setAuthAddress(null);
    }
  }, []);

  // Auto-trigger SIWE right after the wallet connects (2026-08-21) — a connected wallet with no
  // SIWE session yet used to require a SEPARATE, manual "Sign in with Ethereum" click on every
  // write action (create-community wizard, register page, edit page), which reads to an
  // already-Privy-authenticated user as being asked to sign in twice. Fires once per
  // newly-connected address, not on every isAuthenticated flip — critically, NOT after signOut()
  // while the wallet stays on the same address (e.g. withAuthRetry's AuthError handling mid-flow):
  // that case must stay a visible, user-initiated re-auth, not a silent surprise wallet popup
  // (2026-08-19 SIWE re-auth fix, commit 06c3f988 — auto-firing unconditionally here would
  // reintroduce exactly the bug that fix resolved). The ref is marked for `address` as soon as
  // it's ever seen authenticated (not only when signIn() is actually called) — otherwise an
  // address that started already-authenticated (restored from sessionStorage on mount) would
  // have never claimed the ref, and a later signOut() on that same address would fall through
  // and auto-fire a fresh signIn() exactly like the bug this is meant to prevent.
  const autoSignInAttemptedFor = useRef<string | null>(null);
  // Session-lifecycle fix (2026-08-22) — nothing previously kept this session in sync with the
  // ACTUAL connected wallet: disconnecting left isAuthenticated stuck true from stale
  // sessionStorage (SiweGate-wrapped screens kept rendering as signed in), and switching accounts
  // left every write silently authenticating as the OLD address's backend cookie while the UI
  // showed the new one connected — the session and the wallet could point at two different
  // identities with no error and no indication. `previousAddress` distinguishes "this is the
  // very first render" (nothing to invalidate, may already be authenticated from storage) from
  // "the connected address actually changed" (must invalidate first, THEN let auto-sign-in — via
  // the ref reset below — pick up the new address fresh, same as a brand-new connection).
  const previousAddress = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prevAddress = previousAddress.current;
    previousAddress.current = address;

    if (prevAddress !== undefined && prevAddress !== address && isAuthenticated) {
      autoSignInAttemptedFor.current = null;
      void signOut();
      return;
    }

    if (!address) return;
    if (isAuthenticated) {
      autoSignInAttemptedFor.current = address;
      return;
    }
    if (!chainId || isSigning) return;
    if (autoSignInAttemptedFor.current === address) return;
    autoSignInAttemptedFor.current = address;
    void signIn();
  }, [address, chainId, isAuthenticated, isSigning, signIn, signOut]);

  const value: SiweContextValue = { isAuthenticated, address: authAddress, isSigning, error, signIn, signOut };

  return <SiweContext.Provider value={value}>{children}</SiweContext.Provider>;
}

export function useSiwe(): SiweContextValue {
  const ctx = useContext(SiweContext);
  if (!ctx) {
    throw new Error("useSiwe must be used within a SiweProvider");
  }
  return ctx;
}
