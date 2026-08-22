import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { Check, Copy, LogOut, User } from "lucide-react";
import { useSiwe } from "@/src/hooks/useSiwe";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function PrivyConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  // Session-lifecycle fix (2026-08-22) — "Sign out" used to disconnect Privy's wallet only,
  // leaving the backend's SIWE session (httpOnly cookie) fully valid for its full 24h TTL. On a
  // shared computer, the next person to use the browser could still act as the previous user.
  // useSiwe's own disconnect-invalidation effect covers pages with an active SiweGate/useSiwe
  // instance mounted, but this button lives in the global Header, reachable from pages with none
  // mounted at all — so sign-out itself must close the session directly, not rely on some other
  // component happening to be watching.
  const siwe = useSiwe();
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

  if (!ready) {
    return (
      <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (authenticated) {
    const address = user?.wallet?.address;

    async function copyAddress() {
      if (!address) return;
      await navigator.clipboard.writeText(address);
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
          {address ? truncateAddress(address) : "Account"}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-900 shadow-lg py-1.5 z-50">
            {address && (
              <div className="px-3 py-2 border-b border-gray-700">
                <p className="text-xs text-gray-500 mb-0.5">Signed in as</p>
                <p className="text-xs font-mono text-foreground break-all">{address}</p>
              </div>
            )}
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
                  void logout();
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
    <button
      onClick={() => login()}
      className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-[6px] hover:bg-accent-hover transition-colors"
    >
      Sign in
    </button>
  );
}
