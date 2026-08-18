import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { sepolia } from "wagmi/chains";
import { PrivyProvider } from "@privy-io/react-auth";
import { useState, type ReactNode } from "react";
import { CHAINS, wagmiConfig } from "@/src/services/wagmiConfig";

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
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
