import { Outlet } from "react-router-dom";
import { useAccount, useConnect } from "wagmi";
import { Header } from "./Header";

// /plan-eng-review Phase B (2026-08-23) — a route-level guard, applied to exactly the 2 routes
// with a genuine UX case for it: /manage-communities and /manage-profile. A full 14-route audit
// found no page actually needs its whole view blocked from an unauthenticated visitor — the
// gating inconsistency elsewhere is action-level (see the JoinSection/edit-page/members-page
// fixes from the same pass) — but these 2 "your own stuff" pages show a misleadingly-empty view
// to a disconnected visitor ("You don't own any communities yet") instead of a clear prompt to
// connect. Gates on wallet connection (useAccount().address — the same "connected" concept every
// other page in this app already uses, e.g. community/[id]/page.tsx's `connected={!!address}`),
// not a SIWE session — viewing your own stuff only needs a wallet, not a signed session.
export function RequireAuth() {
  const { address, status } = useAccount();
  const { connectors, connect } = useConnect();

  // Covers wagmi's reconnect-on-mount window (matches WalletConnectButton's same check) — without
  // it, a returning user with an already-connected wallet would see a false "Connect your wallet"
  // flash before status resolves to "connected".
  if (status === "connecting" || status === "reconnecting") {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Loading…</p>
        </main>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-gray-400">Connect your wallet to view this page.</p>
          <button
            type="button"
            onClick={() => connect({ connector: connectors[0]! })}
            className="px-6 py-3 bg-accent text-white rounded-[6px] font-semibold hover:bg-accent-hover transition-colors"
          >
            Connect Wallet
          </button>
        </main>
      </div>
    );
  }

  return <Outlet />;
}
