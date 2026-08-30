"use client";

import { useConnect, useAccount, useDisconnect } from "wagmi";
import { shortAddress, useSession } from "@/lib/session";
import { Button } from "./ui";

/**
 * Connect, then sign. Two steps, shown as two steps.
 *
 * Wallet UIs usually collapse them into one button, which leaves a person
 * wondering why a second popup appeared. Connecting grants this page the right
 * to see an address; signing proves the address belongs to whoever is at the
 * keyboard. The second one is what the backend accepts as a session.
 */
export function WalletBar() {
  const { connect, connectors, isPending } = useConnect();
  const { address: connected, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { address, isSignedIn, isSigning, error, signIn, signOut } = useSession();

  const injected = connectors.find((connector) => connector.type === "injected") ?? connectors[0];

  if (isSignedIn && address) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[12px] text-ink-soft">{shortAddress(address)}</span>
        <button
          type="button"
          onClick={() => {
            void signOut();
            disconnect();
          }}
          className="tap text-[14px] text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Çıkış
        </button>
      </div>
    );
  }

  if (isConnected && connected) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void signIn()} disabled={isSigning}>
            {isSigning ? "Cüzdanında onayla" : "İmzala ve gir"}
          </Button>
          <span className="font-mono text-[12px] text-ink-faint">{shortAddress(connected)}</span>
        </div>
        {/* The wallet's own prompt has to be English to stay a valid sign-in
            message, so the Turkish explanation lives here instead. */}
        <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">
          Cüzdanın bir imza isteyecek. Bu bir işlem değildir, zincire hiçbir şey yazılmaz ve
          ücret ödemezsin. İmza yalnızca cüzdanın sana ait olduğunu kanıtlar.
        </p>
        {error ? <p className="text-[14px] text-alarm">{error}</p> : null}
      </div>
    );
  }

  if (!injected) {
    return (
      <p className="text-[14px] text-ink-soft">
        Tarayıcında cüzdan bulunamadı. MetaMask kurulu bir tarayıcıdan aç.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button kind="quiet" onClick={() => connect({ connector: injected })} disabled={isPending}>
        {isPending ? "Cüzdan açılıyor" : "Cüzdan bağla"}
      </Button>
      {error ? <span className="text-[14px] text-alarm">{error}</span> : null}
    </div>
  );
}
