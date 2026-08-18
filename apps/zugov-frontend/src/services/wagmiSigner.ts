import { BrowserProvider, JsonRpcSigner, type Eip1193Provider } from "ethers";
import type { Client } from "viem";
import type { Config } from "wagmi";
import { getWalletClient } from "wagmi/actions";

/**
 * Builds an ethers Signer from a wagmi walletClient — works for ANY connected wallet
 * (Privy embedded wallets, MetaMask, WalletConnect, etc.), unlike reading window.ethereum
 * directly, which only browser-extension wallets set. Privy's embedded wallets are reachable
 * only through the wagmi connector, not the global — code that falls back to window.ethereum
 * silently breaks for every non-crypto resident who signed in by email.
 */
export function getSignerFromWalletClient(walletClient: Client | undefined): JsonRpcSigner {
  if (!walletClient?.account) throw new Error("No wallet found");
  const provider = new BrowserProvider(walletClient.transport as unknown as Eip1193Provider);
  return new JsonRpcSigner(provider, walletClient.account.address);
}

/**
 * Same as getSignerFromWalletClient, but for module-level/non-hook code that can't call
 * useWalletClient() directly (e.g. a standalone async function, not a hook or component body).
 * Uses wagmi/actions' imperative getWalletClient, which reads the same connector state.
 */
export async function getSignerFromWagmiConfig(config: Config): Promise<JsonRpcSigner> {
  const walletClient = await getWalletClient(config);
  return getSignerFromWalletClient(walletClient);
}
