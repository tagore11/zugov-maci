import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { sepolia } from "wagmi/chains";
import { PrivyProvider } from "@privy-io/react-auth";
import { useState, type ReactNode } from "react";
import { CHAINS, wagmiConfig } from "@/src/services/wagmiConfig";
import { SiweProvider } from "@/src/hooks/useSiwe";

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  if (!PRIVY_APP_ID) {
    // Fails loudly instead of silently rendering a broken sign-in button — a missing
    // App ID means nobody can authenticate at all, on-chain or embedded.
    throw new Error(
      "VITE_PRIVY_APP_ID is not set. Get an App ID from https://dashboard.privy.io and add it to .env.local (see .env.local.example).",
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // 'wallet' keeps existing self-custody users (e.g. MetaMask) working exactly as
        // before; 'email' is the new path for residents with no crypto background.
        loginMethods: ["email", "wallet"],
        embeddedWallets: {
          ethereum: {
            // Only auto-provision an embedded wallet for people who don't already bring one —
            // a resident who connects MetaMask should never get a second, unwanted wallet.
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: sepolia,
        supportedChains: [...CHAINS],
        // DESIGN.md: dark base + terracotta "Adobe" accent — the login modal is Privy-hosted
        // (not our own Tailwind classes), so this appearance config is the only lever we have to
        // keep it from reading as a generic default-purple auth widget bolted onto a civic-tooling
        // app. Matches globals.css's dark-mode --accent (light-mode CSS vars don't reach a
        // Privy-hosted modal, so this fixed value assumes the modal itself renders dark).
        appearance: {
          theme: "dark",
          accentColor: "#C1633B",
          logo: "/logo.svg",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {/* /plan-eng-review (2026-08-23) — one SiweProvider instance for the whole app,
              closing the concurrent-auto-sign-in race by construction (every useSiwe() call
              site used to mount its own independent effect; a fresh wallet connecting could
              trigger 2-3 simultaneous auto-sign-in attempts racing each other). */}
          <SiweProvider>{children}</SiweProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
