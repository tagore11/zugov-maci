import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSignMessage } from "wagmi";
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

export function useSiwe() {
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
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      sessionStorage.removeItem(SESSION_KEY);
      setIsAuthenticated(false);
      setAuthAddress(null);
    }
  }, []);

  return { isAuthenticated, address: authAddress, isSigning, error, signIn, signOut };
}
