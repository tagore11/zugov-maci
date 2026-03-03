import { optimismSepolia, baseSepolia, optimism, scrollSepolia } from 'viem/chains';

// First chain will be used as default chain by wagmi
export const supportedChains = [optimism, optimismSepolia, baseSepolia, scrollSepolia] as const;
