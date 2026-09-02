"use client";

import { useConnect, useAccount, useDisconnect } from "wagmi";
import { shortAddress, useSession } from "@/lib/session";
import { Button } from "./ui";
import { copy } from "@/lib/copy";

/**
 * Connect, then sign. Two steps, shown as two steps.
 *
 * Wallet UIs usually collapse them into one button, which leaves a person
 * wondering why a second popup appeared. Connecting grants this page the right
 * to see an address; signing proves the address belongs to whoever is at the
 * keyboard. The second one is what the backend accepts as a session.
 *
 * Nobody who came here without MetaMask installed has to leave. Cüzdansız devam et
 * signs the same statement with a key that stays in this browser (see localWallet.ts);
 * the wallet path is what remains for someone who already has one.
 */
export function WalletBar() {
  const { connect, connectors, isPending } = useConnect();
  const { address: connected, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { address, method, isSignedIn, isSigning, error, signIn, signInWithoutWallet, signOut } = useSession();

  const injected = connectors.find((connector) => connector.type === "injected") ?? connectors[0];

  if (isSignedIn && address) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[12px] text-ink-soft">{shortAddress(address)}</span>
        {method === "local" ? (
          <span className="text-[13px] text-ink-faint">{copy.wallet.localAccountNote}</span>
        ) : null}
        <button
          type="button"
          onClick={() => {
            void signOut();
            disconnect();
          }}
          className="tap text-[14px] text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          {copy.wallet.signOut}
        </button>
      </div>
    );
  }

  if (isConnected && connected) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void signIn()} disabled={isSigning}>
            {isSigning ? copy.wallet.walletSigning : copy.wallet.walletSign}
          </Button>
          <span className="font-mono text-[12px] text-ink-faint">{shortAddress(connected)}</span>
        </div>
        {/* The wallet's own prompt has to be English to stay a valid sign-in
            message, so the Turkish explanation lives here instead. */}
        <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">{copy.wallet.walletSignatureExplanation}</p>
        {error ? <p className="text-[14px] text-alarm">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void signInWithoutWallet()} disabled={isSigning}>
          {isSigning ? copy.wallet.signingIn : copy.wallet.signInWithoutWallet}
        </Button>
        {injected ? (
          <Button kind="quiet" onClick={() => connect({ connector: injected })} disabled={isPending}>
            {isPending ? copy.wallet.walletConnecting : copy.wallet.walletConnect}
          </Button>
        ) : null}
      </div>
      <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">{copy.wallet.noWalletExplanation}</p>
      {error ? <p className="text-[14px] text-alarm">{error}</p> : null}
    </div>
  );
}
