import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, scroll, scrollSepolia, sepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useState, type ReactNode } from "react";

const config = getDefaultConfig({
  appName: "ZuGov",
  projectId: "YOUR_PROJECT_ID", //TODO:
  // sepolia listed first: wagmi's useChainId() falls back to chains[0] whenever
  // no wallet is connected, so this is what makes Sepolia the default network.
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, scroll, scrollSepolia],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    // ENS resolution happens on mainnet — viem's default RPC (eth.merkle.io) blocks
    // cross-origin requests from localhost (CORS), so use a public RPC that allows it.
    // retryCount:0 so a slow RPC fails fast instead of retrying 3× and crashing
    // React reconciliation.
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com", { retryCount: 0, timeout: 5_000 }),
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
        <RainbowKitProvider initialChain={sepolia}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
