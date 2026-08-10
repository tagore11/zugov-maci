// Keep in sync with apps/zugov-frontend/src/config.ts's supportedChains — a chain added there
// without an entry here fails closed (getRpcUrl/getNetworkName return null; subgraph deploys for
// that chain's communities are marked "failed", not silently misrouted to another network).
const RPC_URLS: Record<number, string | undefined> = {
  534351: process.env.SCROLL_SEPOLIA_RPC_URL, // Scroll Sepolia
  11155111: process.env.SEPOLIA_RPC_URL, // Ethereum Sepolia
};

export function getRpcUrl(chainId: number): string | null {
  return RPC_URLS[chainId] ?? null;
}

// Network names as configured in graph-node's `ethereum:` env (deploy/docker-compose.yml)
// and written into each community's subgraph.yaml (apps/subgraph/templates/subgraph.template.yaml).
// Same sync requirement as RPC_URLS above.
const NETWORK_NAMES: Record<number, string | undefined> = {
  534351: "scroll-sepolia",
  11155111: "sepolia",
};

export function getNetworkName(chainId: number): string | null {
  return NETWORK_NAMES[chainId] ?? null;
}
