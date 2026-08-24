import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Check, Copy, LogOut, User } from "lucide-react";
import { useSiwe } from "@/src/hooks/useSiwe";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { address, status } = useAccount();
  // /plan-eng-review (2026-08-23) — Privy removed. connectors comes from wagmiConfig.ts's own
  // registered list (a single injected() connector) — using useConnect()'s own connectors array
  // rather than instantiating injected() fresh here guarantees this references the exact same
  // connector instance the config registered, not a second independent one.
  const { connectors, connect, isPending, error } = useConnect();
  // Session-lifecycle fix (2026-08-22) — "Sign out" must close the backend's SIWE session
  // (httpOnly cookie) directly, not rely on some other mounted component to notice — this button
  // lives in the global Header, reachable from pages with no other useSiwe() instance mounted.
  const siwe = useSiwe();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click-outside close — a single click on the address used to sign the wallet out directly
  // (no confirmation, no way to just see/copy the address). Now it opens a menu instead.
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Covers both the initial "still figuring out if an already-connected wallet is available"
  // window (wagmi's reconnect-on-mount) and an in-flight connect() click — without this, a
  // returning user with an already-connected wallet would see a false "Connect Wallet" flash
  // before status resolves to "connected".
  if (status === "connecting" || status === "reconnecting") {
    return (
      <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (status === "connected" && address) {
    async function copyAddress() {
      await navigator.clipboard.writeText(address!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }

    return (
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-700 rounded-[6px] hover:bg-gray-800 transition-colors"
        >
          {truncateAddress(address)}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-900 shadow-lg py-1.5 z-50">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-xs text-gray-500 mb-0.5">Signed in as</p>
              <p className="text-xs font-mono text-foreground break-all">{address}</p>
            </div>
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy address"}
            </button>
            <Link
              to="/manage-profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              Manage Profile
            </Link>
            <div className="border-t border-gray-700 mt-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  void siwe.signOut();
                  disconnect();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => connect({ connector: connectors[0]! })}
        disabled={isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-[6px] hover:bg-accent-hover transition-colors disabled:opacity-60"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <p className="text-xs text-red-400 max-w-[16rem] text-right">
          No wallet found — install MetaMask or a similar extension.
        </p>
      )}
    </div>
  );
}
