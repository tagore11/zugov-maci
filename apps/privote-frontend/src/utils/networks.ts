import * as chains from 'viem/chains';
import { INFURA_API_KEY } from './constants';

// Mapping of chainId to RPC chain name an format followed by infura
export const RPC_CHAIN_NAMES: Record<number, string> = {
  [chains.optimism.id]: 'optimism',
  [chains.optimismSepolia.id]: 'optimism-sepolia',
  [chains.baseSepolia.id]: 'base-sepolia',
  [chains.scrollSepolia.id]: 'scroll-sepolia',
  [chains.sepolia.id]: 'sepolia'
};

export const getInfuraHttpUrl = (chainId: number) => {
  return RPC_CHAIN_NAMES[chainId] ? `https://${RPC_CHAIN_NAMES[chainId]}.infura.io/v3/${INFURA_API_KEY}` : undefined;
};
