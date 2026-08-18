import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, scroll, scrollSepolia, sepolia } from "wagmi/chains";

// sepolia listed first: wagmi's useChainId() falls back to chains[0] whenever no wallet is
// connected, so this is what makes Sepolia the default network. Also passed to PrivyProvider's
// supportedChains (app/providers.tsx) — kept as a separate mutable array (not read off
// wagmiConfig.chains) because wagmi's createConfig types that field as a readonly tuple, which
// PrivyProvider's Chain[] rejects.
//
// Deliberately its own module, not defined inline in app/providers.tsx: hook-layer code
// (useDeployPoll.ts, useCreateCommunity.ts) needs wagmiConfig for module-level, non-hook
// signer access via wagmi/actions' getWalletClient — importing the JSX-bearing provider
// bootstrap file from a hook would be a backwards dependency (and drags PrivyProvider/
// QueryClient into every test that touches those hooks).
export const CHAINS = [sepolia, mainnet, polygon, optimism, arbitrum, scroll, scrollSepolia] as const;

export const wagmiConfig = createConfig({
  chains: CHAINS,
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
