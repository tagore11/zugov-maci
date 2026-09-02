"use client";

import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";

/**
 * A key that never leaves this browser and never holds funds. It exists only to produce
 * a valid signature over the SIWE message, so the backend accepts it through the exact same
 * /auth/nonce + /auth/verify path as a MetaMask signature. Persisted in localStorage, not
 * sessionStorage, so it survives closing the tab: someone who came back the next day to the
 * same link is still the same participant, not a fresh one.
 */
const STORAGE_KEY = "zugov.localWallet.privateKey";

export function getOrCreateLocalAccount(): PrivateKeyAccount {
  let key = window.localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = generatePrivateKey();
    window.localStorage.setItem(STORAGE_KEY, key);
  }
  return privateKeyToAccount(key as `0x${string}`);
}
