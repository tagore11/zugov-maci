import { supportedChains } from '@/config/chains';
import { PollPolicyType } from '@/types';
import { Hex } from 'viem';
import { baseSepolia, optimism, optimismSepolia, scrollSepolia } from 'viem/chains';

export interface FaucetProvider {
  name: string;
  url: string;
}

export type ChainConstants = {
  chain: (typeof supportedChains)[number];
  slugs: {
    eas: string;
    coordinator: string;
    infura: string;
    subgraph: string;
  };
  isTestnet: boolean;
  supportedPolicies: PollPolicyType[];
  faucets?: FaucetProvider[];
  blockTime: number;
  daos: Record<
    string,
    {
      contracts: {
        maci: Hex;
        eas: Hex;
        anonAadhaarVerifier: Hex;
        semaphore: Hex;
        gitcoinPassportDecoder: Hex;
        zupassVerifier: Hex;
      };
      subgraphUrl: string;
      displayName?: string;
      description?: string;
      logoUrl?: string;
    }
  >;
};

export const appConstants: Record<(typeof supportedChains)[number]['id'], ChainConstants> = {
  // Mainnet
  [optimism.id]: {
    chain: optimism,
    slugs: {
      eas: 'optimism',
      coordinator: 'optimism',
      infura: 'optimism',
      subgraph: 'optimism'
    },
    isTestnet: false,
    supportedPolicies: [
      PollPolicyType.FreeForAll,
      PollPolicyType.AnonAadhaar,
      PollPolicyType.EAS,
      PollPolicyType.ERC20,
      PollPolicyType.ERC20Votes,
      PollPolicyType.GitcoinPassport,
      PollPolicyType.MerkleProof,
      PollPolicyType.Token,
      PollPolicyType.Zupass
    ],
    blockTime: 2000,
    daos: {
      default: {
        contracts: {
          maci: '0x',
          eas: '0x4200000000000000000000000000000000000021',
          anonAadhaarVerifier: '0x45Db2e8649eaEB4D4c047bc790bd30Bc9e6C09f4',
          semaphore: '0x',
          gitcoinPassportDecoder: '0x5558D441779Eca04A329BcD6b47830D2C6607769',
          zupassVerifier: '0x4d14A9e85C556Fd29491b35CCC89ea3710E9FD1e'
        },
        subgraphUrl:
          process.env.NEXT_PUBLIC_OPTIMISM_SUBGRAPH_URL ||
          'https://api.goldsky.com/api/public/query/maci-subgraph/latest'
      }
    }
  },

  // Testnets
  [optimismSepolia.id]: {
    chain: optimismSepolia,
    slugs: {
      eas: 'optimism-sepolia',
      coordinator: 'optimism-sepolia',
      infura: 'optimism-sepolia',
      subgraph: 'optimism-sepolia'
    },
    isTestnet: true,
    supportedPolicies: [
      PollPolicyType.FreeForAll,
      PollPolicyType.AnonAadhaar,
      PollPolicyType.EAS,
      PollPolicyType.ERC20,
      PollPolicyType.ERC20Votes,
      PollPolicyType.GitcoinPassport,
      PollPolicyType.MerkleProof,
      PollPolicyType.Token,
      PollPolicyType.Zupass
    ],
    faucets: [
      {
        name: 'Alchemy Faucet',
        url: 'https://www.alchemy.com/faucets/optimism-sepolia'
      },
      {
        name: 'Quicknode Faucet',
        url: 'https://faucet.quicknode.com/optimism/sepolia'
      }
    ],
    blockTime: 2000,
    daos: {
      default: {
        contracts: {
          maci: '0x',
          eas: '0x4200000000000000000000000000000000000021',
          anonAadhaarVerifier: '0x276C6Ae425C58d84cE4540A4f5E8220A1ea486cc',
          semaphore: '0x697c80d1F2654e88d52B16154929EB976568DB04',
          gitcoinPassportDecoder: '0xe53C60F8069C2f0c3a84F9B3DB5cf56f3100ba56',
          zupassVerifier: '0x44ebd109487fbD1465Ca4cb035d0aFbf9f69884c'
        },
        subgraphUrl:
          process.env.NEXT_PUBLIC_BASE_SEPOLIA_SUBGRAPH_URL ||
          'https://api.goldsky.com/api/public/query/maci-subgraph/latest'
      }
    }
  },
  [baseSepolia.id]: {
    chain: baseSepolia,
    slugs: {
      eas: 'base-sepolia',
      coordinator: 'base-sepolia',
      infura: 'base-sepolia',
      subgraph: 'base-sepolia'
    },
    isTestnet: true,
    supportedPolicies: [
      PollPolicyType.FreeForAll,
      PollPolicyType.AnonAadhaar,
      PollPolicyType.EAS,
      PollPolicyType.ERC20,
      PollPolicyType.ERC20Votes,
      PollPolicyType.MerkleProof,
      PollPolicyType.Token,
      PollPolicyType.Zupass
    ],
    faucets: [
      {
        name: 'Alchemy Faucet',
        url: 'https://www.alchemy.com/faucets/base-sepolia'
      },
      {
        name: 'Quicknode Faucet',
        url: 'https://faucet.quicknode.com/base/sepolia'
      }
    ],
    blockTime: 2000,
    daos: {
      default: {
        contracts: {
          maci: '0x',
          eas: '0x4200000000000000000000000000000000000021',
          anonAadhaarVerifier: '0x63f6b6ff3FF4D986BCAde905514F651a06452f71',
          semaphore: '0x697c80d1F2654e88d52B16154929EB976568DB04',
          gitcoinPassportDecoder: '0x',
          zupassVerifier: '0x'
        },
        subgraphUrl:
          process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_SUBGRAPH_URL ||
          'https://api.goldsky.com/api/public/query/maci-subgraph/latest'
      }
    }
  },
  [scrollSepolia.id]: {
    chain: scrollSepolia,
    daos: {
      zukas: {
        contracts: {
          maci: '0xBf8eb514ccC6De1E6D2e99Ae398B955dc85D89a8',
          eas: '0xaEF4103A04090071165F78D45D83A0C0782c2B2a',
          anonAadhaarVerifier: '0x362554ed8BeeD359e2243eee5DA1865c6954C343',
          semaphore: '0x697c80d1F2654e88d52B16154929EB976568DB04',
          gitcoinPassportDecoder: '0x2443D22Db6d25D141A1138D80724e3Eee54FD4C2',
          zupassVerifier: '0x'
        },
        subgraphUrl: 'https://api.studio.thegraph.com/query/1742322/maci-subgraph/v0.0.4',
        displayName: 'zuKas',
        description: 'A prototype for future living.'
      }
    },

    slugs: {
      eas: 'scroll-sepolia',
      coordinator: 'scroll-sepolia',
      infura: 'scroll-sepolia',
      subgraph: 'scroll-sepolia'
    },
    isTestnet: true,
    supportedPolicies: [
      PollPolicyType.FreeForAll,
      PollPolicyType.AnonAadhaar,
      PollPolicyType.EAS,
      PollPolicyType.ERC20,
      PollPolicyType.ERC20Votes,
      PollPolicyType.GitcoinPassport,
      PollPolicyType.MerkleProof,
      PollPolicyType.Token
    ],
    faucets: [
      {
        name: 'Scroll Sepolia Faucet',
        url: 'https://sepolia.scroll.io/faucet'
      },
      {
        name: 'Quicknode Faucet',
        url: 'https://faucet.quicknode.com/scroll/sepolia'
      }
    ],
    blockTime: 3000
  }
} as const;
