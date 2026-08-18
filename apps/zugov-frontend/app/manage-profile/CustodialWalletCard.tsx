import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { useAccount, useBalance, useChainId } from "wagmi";
import { Wallet, Check, Copy } from "lucide-react";
import { appConstants } from "@/src/config";

// Privy identifies its own auto-provisioned wallets this way — 'privy-v2' is the newer embedded
// wallet implementation, 'privy' the legacy one. Both are custodial: ZuGov's Privy app manages
// the key, the resident never sees a seed phrase (providers.tsx: createOnLogin: "users-without-wallets").
const EMBEDDED_WALLET_CLIENT_TYPES = new Set(["privy", "privy-v2"]);

/**
 * Shown only for residents who signed in with email (no wallet of their own) — Privy
 * auto-provisioned this wallet on their behalf. Self-custody users who connected an external
 * wallet (MetaMask etc.) never see this card; they already know how to check their own balance.
 */
export function CustodialWalletCard() {
  const { address, isConnected } = useAccount();
  const { wallets, ready } = useWallets();
  const chainId = useChainId();
  const [copied, setCopied] = useState(false);

  const chainName = appConstants[chainId as keyof typeof appConstants]?.chain.name ?? `Chain ${chainId}`;

  const activeWallet = wallets.find((w) => w.address.toLowerCase() === address?.toLowerCase());
  const isCustodial = ready && !!activeWallet && EMBEDDED_WALLET_CLIENT_TYPES.has(activeWallet.walletClientType);

  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId,
    query: { enabled: isConnected && isCustodial },
  });

  if (!isConnected || !ready || !isCustodial || !address) return null;

  function handleCopy() {
    void navigator.clipboard.writeText(address!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Wallet className="w-5 h-5 text-accent-hover" />
        <h2 className="text-lg font-semibold text-foreground">Custodial Wallet</h2>
      </div>
      <p className="text-xs text-gray-500">
        You signed in with email — ZuGov created this wallet for you automatically. No separate app or seed phrase
        needed.
      </p>

      <div className="rounded-lg border border-gray-700 divide-y divide-gray-700 text-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5">
          <span className="text-gray-400 shrink-0">Address</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-foreground font-mono text-xs truncate">{address}</span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy wallet address"
              className="shrink-0 text-gray-500 hover:text-accent-hover transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#64AF8C]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex justify-between gap-4 px-4 py-2.5">
          <span className="text-gray-400">Network</span>
          <span className="text-foreground">{chainName}</span>
        </div>
        <div className="flex justify-between gap-4 px-4 py-2.5">
          <span className="text-gray-400">Balance</span>
          <span className="text-foreground font-mono text-xs">
            {isBalanceLoading ? "…" : balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
