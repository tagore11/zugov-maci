"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";
import { auth, BackendError } from "./ag/client";

/**
 * Sign-in with Ethereum, held in one place.
 *
 * One provider, mounted once, rather than a hook each call site instantiates.
 * Several components need to know who is signed in, and independent copies of
 * this state would each run their own nonce request, with a later one able to
 * overwrite an earlier nonce before its signature came back.
 */

interface SessionValue {
  address: string | null;
  isSignedIn: boolean;
  isConnecting: boolean;
  isSigning: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);
const STORAGE_KEY = "zugov.session.address";

/**
 * The sentence the wallet shows while asking for a signature. ASCII only, and
 * English, for two reasons that both point the same way.
 *
 * EIP-4361 restricts the statement to reserved and unreserved characters, which
 * excludes every Turkish diacritic. A statement containing "giriş" made the
 * backend's parser reject the message outright with "Invalid SIWE message
 * format", and a wallet that cannot parse a sign-in message stops rendering its
 * recognisable sign-in screen and falls back to showing raw text, which is
 * exactly the wrong thing to show someone at the moment they are asked to sign.
 *
 * The Turkish explanation belongs on our own page, next to the button, where we
 * control the typography and can spell it properly. See WalletBar.
 */
export const SIWE_STATEMENT = "Sign in to ZuGov. This is not a transaction and costs no gas.";

export function SessionProvider({ children }: { children: ReactNode }) {
  const { address, chainId, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [signedInAddress, setSignedInAddress] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSignedInAddress(window.sessionStorage.getItem(STORAGE_KEY));
    } catch {
      // Private browsing can refuse session storage. The session cookie is the
      // real authority; this only avoids re-prompting on a refresh.
    }
  }, []);

  // A wallet switched to another account is no longer the account that signed.
  useEffect(() => {
    if (!signedInAddress) return;
    if (address && address.toLowerCase() !== signedInAddress.toLowerCase()) {
      setSignedInAddress(null);
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* see above */
      }
    }
  }, [address, signedInAddress]);

  const signIn = useCallback(async () => {
    if (!address || !chainId) {
      setError("Önce cüzdanını bağla.");
      return;
    }
    setIsSigning(true);
    setError(null);
    try {
      const { nonce } = await auth.nonce();
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement: SIWE_STATEMENT,
      });
      const signature = await signMessageAsync({ message });
      const verified = await auth.verify(message, signature);
      setSignedInAddress(verified.address);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, verified.address);
      } catch {
        /* see above */
      }
    } catch (cause) {
      setError(
        cause instanceof BackendError
          ? cause.message
          : cause instanceof Error && cause.message.includes("User rejected")
            ? "İmzayı reddettin."
            : "Giriş tamamlanamadı.",
      );
    } finally {
      setIsSigning(false);
    }
  }, [address, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setSignedInAddress(null);
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* see above */
      }
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      address: signedInAddress,
      isSignedIn: signedInAddress !== null,
      isConnecting,
      isSigning,
      error,
      signIn,
      signOut,
    }),
    [signedInAddress, isConnecting, isSigning, error, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}

/** 0x1234…abcd, which is how a wallet address is read aloud. */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
