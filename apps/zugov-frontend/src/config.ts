import { scrollSepolia } from "wagmi/chains";
import type { Hex } from "viem";

export const GovernanceTypes = {
  MACI: "maci",
} as const;

export const maciArtifacts = {
  pollJoiningZkeyUrl: "/PollJoining_10_test.0.zkey",
  pollJoiningWasmUrl: "/PollJoining_10_test.wasm",
} as const;

export type GovernanceType = (typeof GovernanceTypes)[keyof typeof GovernanceTypes];

export const supportedChains = [scrollSepolia] as const;

export interface Community {
  governanceType: GovernanceType;
  id?: string;
  governanceContract: Hex;
  subgraphUrl: string;
  displayName?: string;
  description?: string;
  logoUrl?: string;
  logo?: string;
  members?: number;
  proposals?: number;
  category?: string;
}

export const appConstants: Record<
  (typeof supportedChains)[number]["id"],
  {
    chain: (typeof supportedChains)[number];
    isTestnet: boolean;
    blockTime: number;
    daos: Record<string, Community>;
    faucets?: Array<{ name: string; url: string }>;
  }
> = {
  [scrollSepolia.id]: {
    chain: scrollSepolia,
    isTestnet: true,
    blockTime: 3000,
    daos: {
      zukasNewContracts: {
        governanceType: GovernanceTypes.MACI,
        id: "zukasNewContracts",
        governanceContract: "0x47dc655e057C709FF388e83746c6f106F4B05e67",
        subgraphUrl: "https://api.studio.thegraph.com/query/1742322/zukas-new-contracts/v0.0.1",
        displayName: "zuKas",
        description: "A prototype for future living.",
      },
      zukas: {
        governanceType: GovernanceTypes.MACI,
        id: "zukas",
        governanceContract: "0xBf8eb514ccC6De1E6D2e99Ae398B955dc85D89a8",
        subgraphUrl: "https://api.studio.thegraph.com/query/1742322/maci-subgraph/v0.0.4",
        displayName: "zuKas",
        description: "A prototype for future living.",
      },
    },
    faucets: [
      {
        name: "Scroll Sepolia Faucet",
        url: "https://sepolia.scroll.io/faucet",
      },
      {
        name: "Quicknode Faucet",
        url: "https://faucet.quicknode.com/scroll/sepolia",
      },
    ],
  },
};
