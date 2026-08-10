const RPC_URLS: Record<number, string | undefined> = {
  534351: process.env.SCROLL_SEPOLIA_RPC_URL, // Scroll Sepolia
  11155111: process.env.SEPOLIA_RPC_URL, // Ethereum Sepolia
};

export function getRpcUrl(chainId: number): string | null {
  return RPC_URLS[chainId] ?? null;
}
