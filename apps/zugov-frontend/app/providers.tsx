import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, scroll, scrollSepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useState, type ReactNode } from "react";

const config = getDefaultConfig({
  appName: "ZuGov",
  projectId: "YOUR_PROJECT_ID", //TODO:
  chains: [mainnet, polygon, optimism, arbitrum, scroll, scrollSepolia],
  transports: {
    // ENS resolution happens on mainnet — use retryCount:0 so a slow public RPC
    // fails fast instead of retrying 3× and crashing React reconciliation.
    [mainnet.id]: http(undefined, { retryCount: 0, timeout: 5_000 }),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [scroll.id]: http(),
    [scrollSepolia.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
