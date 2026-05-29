import { scrollSepolia } from "wagmi/chains";
import type { Hex } from "viem";

export const GovernanceTypes = {
  MACI: "maci",
} as const;

//TODO
/** Numeric string matching the on-chain DomainObjs.Policy enum */
export const PolicyType = {
  ERC20: "0",
  FreeForAll: "1",
  MerkleProof: "2",
  ERC20Votes: "3",
  EAS: "4",
  GitcoinPassport: "5",
  Zupass: "6",
  Semaphore: "7",
  AnonAadhaar: "8",
  Token: "9",
  Hats: "10",
} as const;

export const maciArtifacts = {
  pollJoiningZkeyUrl: "/PollJoining_10_test.0.zkey",
  pollJoiningWasmUrl: "/PollJoining_10_test.wasm",
} as const;

export type GovernanceType = (typeof GovernanceTypes)[keyof typeof GovernanceTypes];

export const supportedChains = [scrollSepolia] as const;

//TODO
export interface PollDeployConfig {
  /** Serialized coordinator MACI public key, e.g. "macipk.XXX" */
  coordinatorPublicKey: string;
  treeDepths: {
    tallyProcessingStateTreeDepth: number;
    voteOptionTreeDepth: number;
    stateTreeDepth: number;
  };
  messageBatchSize: number;
  /** FreeForAllPolicyFactory contract address */
  freeForAllPolicyFactory: Hex;
  /** Stateless FreeForAllChecker contract address (reused across all polls) */
  freeForAllChecker: Hex;
  /** ConstantInitialVoiceCreditProxyFactory contract address */
  constantVoiceCreditProxyFactory: Hex;
  /** Voice credits each voter receives */
  initialVoiceCreditAmount: number;
}

export interface Community {
  governanceType: GovernanceType;
  id?: string;
  governanceContract: Hex;
  subgraphUrl: string;
  displayName?: string;
  summary?: string;
  description?: string;
  logoUrl?: string;
  logo?: string;
  members?: number;
  proposals?: number;
  category?: string;
  pollDeployConfig?: PollDeployConfig;
}

export const appConstants: Record<
  (typeof supportedChains)[number]["id"],
  {
    chain: (typeof supportedChains)[number];
    isTestnet: boolean;
    blockTime: number;
    rpcUrl: string;
    daos: Record<string, Community>;
    faucets?: Array<{ name: string; url: string }>;
  }
> = {
  [scrollSepolia.id]: {
    chain: scrollSepolia,
    isTestnet: true,
    blockTime: 3000,
    rpcUrl: "https://sepolia-rpc.scroll.io",
    daos: {
      zukas: {
        governanceType: GovernanceTypes.MACI,
        id: "zukas",
        governanceContract: "0xFCeA14675024c89E3B11eDbE2c0Aee58043067FF",
        subgraphUrl: "https://api.studio.thegraph.com/query/1742322/zukas-new-contracts/v0.0.2",
        displayName: "ZuKas Residency",
        summary: "Zuzalu community in Kas, Turkey - innovation and collaboration hub",
        description:
          "Innovation and collaboration hub focused on decentralized governance experiments and community building.",
        logo: "🏛️",
        pollDeployConfig: {
          coordinatorPublicKey: "macipk.0d14a882fa39e12206c0ef30c1dbc293f1a84f426c14255c6ca037ae2cbe9a91",
          treeDepths: { tallyProcessingStateTreeDepth: 1, voteOptionTreeDepth: 2, stateTreeDepth: 10 },
          messageBatchSize: 20,
          freeForAllPolicyFactory: "0xC203e10a64b6855a215185E16a1f79f87DF0FCF0",
          freeForAllChecker: "0xDC8Ea3789097aae25Cc20AAfE57A0B431658a1d5",
          constantVoiceCreditProxyFactory: "0x906918431D82cf55E28754690a3390E834b1060e",
          initialVoiceCreditAmount: 99,
        },
      },
      "eth-ns": {
        governanceType: GovernanceTypes.MACI,
        id: "ETH-NS",
        governanceContract: "0x365d43FEEEf868a60C6C27603913538F1B11Cc62",
        subgraphUrl: "https://api.studio.thegraph.com/query/1742322/eth-ns/v0.0.1",
        displayName: "Ethereum Network School",
        summary: "Ethereum NS is a permanent Ethereum community node growing at Network School.",
        description: "Ethereum NS is a permanent Ethereum community node growing at Network School.",
        logo: "🏛️",
        pollDeployConfig: {
          coordinatorPublicKey: "macipk.0d14a882fa39e12206c0ef30c1dbc293f1a84f426c14255c6ca037ae2cbe9a91",
          treeDepths: { tallyProcessingStateTreeDepth: 1, voteOptionTreeDepth: 2, stateTreeDepth: 10 },
          messageBatchSize: 20,
          freeForAllPolicyFactory: "0xC203e10a64b6855a215185E16a1f79f87DF0FCF0",
          freeForAllChecker: "0xDC8Ea3789097aae25Cc20AAfE57A0B431658a1d5",
          constantVoiceCreditProxyFactory: "0x906918431D82cf55E28754690a3390E834b1060e",
          initialVoiceCreditAmount: 99,
        },
      },

      //   id: "1",
      //   name: "ZuKas Residency",
      //   description: "Zuzalu community in Kas, Turkey - innovation and collaboration hub",
      //   members: 450,
      //   proposals: 23,
      //   logo: "🏛️",
      //   category: "Residency",
      // },
      // zukasNewContracts: {
      //   governanceType: GovernanceTypes.MACI,
      //   id: "zukasNewContracts",
      //   governanceContract: "0x47dc655e057C709FF388e83746c6f106F4B05e67",
      //   subgraphUrl: "https://api.studio.thegraph.com/query/1742322/zukas-new-contracts/v0.0.1",
      //   displayName: "zuKas",
      //   description: "A prototype for future living.",
      // },
      // zukas: {
      //   governanceType: GovernanceTypes.MACI,
      //   id: "zukas",
      //   governanceContract: "0xBf8eb514ccC6De1E6D2e99Ae398B955dc85D89a8",
      //   subgraphUrl: "https://api.studio.thegraph.com/query/1742322/maci-subgraph/v0.0.4",
      //   displayName: "zuKas",
      //   description: "A prototype for future living.",
      // },
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
