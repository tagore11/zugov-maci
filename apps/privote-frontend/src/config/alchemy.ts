import { optimism, optimismSepolia, baseSepolia, scrollSepolia, arbitrum } from 'viem/chains';

/**
 * Mapping of chain IDs to Alchemy network identifiers for NFT API
 * Format: https://{network}.g.alchemy.com/nft/v3/{apiKey}/getNFTsForOwner
 */
export const ALCHEMY_NETWORK_MAP: Record<number, string> = {
  [optimism.id]: 'opt-mainnet',
  [optimismSepolia.id]: 'opt-sepolia',
  [baseSepolia.id]: 'base-sepolia',
  [scrollSepolia.id]: 'scroll-sepolia'
};

/**
 * Get Alchemy NFT API base URL for a given chain ID
 * @param chainId - The chain ID
 * @returns The Alchemy network identifier or undefined if not supported
 */
export const getAlchemyNetwork = (chainId: number): string | undefined => {
  return ALCHEMY_NETWORK_MAP[chainId];
};

/**
 * Get the full Alchemy NFT API URL for getNFTsForOwner endpoint
 * @param chainId - The chain ID
 * @param apiKey - The Alchemy API key
 * @returns The full API URL or undefined if chain is not supported
 */
export const getAlchemyNftApiUrl = (chainId: number, apiKey: string): string | undefined => {
  const network = getAlchemyNetwork(chainId);
  if (!network) {
    return undefined;
  }
  return `https://${network}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`;
};
