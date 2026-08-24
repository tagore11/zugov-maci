import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useState, type ReactNode } from "react";
import { wagmiConfig } from "@/src/services/wagmiConfig";
import { SiweProvider } from "@/src/hooks/useSiwe";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Privy removed (2026-08-23 /plan-eng-review) — plain wagmi WagmiProvider replaces
          @privy-io/wagmi's; no more embedded-wallet email login (see TODOS.md's "in-house
          email/passkey auth" follow-up). wagmiConfig.ts now registers a real injected()
          connector directly instead of Privy driving wagmi's connector state. */}
      <WagmiProvider config={wagmiConfig}>
        {/* /plan-eng-review (2026-08-23) — one SiweProvider instance for the whole app,
            closing the concurrent-auto-sign-in race by construction (every useSiwe() call
            site used to mount its own independent effect; a fresh wallet connecting could
            trigger 2-3 simultaneous auto-sign-in attempts racing each other). */}
        <SiweProvider>{children}</SiweProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
