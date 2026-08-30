"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { SessionProvider } from "@/lib/session";

/**
 * Wallet and session wiring.
 *
 * No connectors are listed. wagmi discovers browser wallets over EIP-6963 on
 * its own, which is all this app needs, and importing from wagmi/connectors to
 * name one explicitly drags in the Base Account connector, the Coinbase CDP
 * SDK and an unresolvable x402 dependency behind it. A tool meant to run on the
 * participant's own machine has no business shipping a payments SDK to get a
 * signature from MetaMask.
 */
const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
