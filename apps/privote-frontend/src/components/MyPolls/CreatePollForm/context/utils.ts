// Poll Deployment Helpers
import { EMode, PollPolicyType, PollType } from '@/types';
import { DEFAULT_VOICE_CREDITS, ZERO_ADDRESS, ZERO_BYTES32 } from '@/utils/constants';
import { PublicKey } from '@maci-protocol/domainobjs';
import { Hex, parseEther } from 'viem';
import type { IPollData } from '../types';
import {
  EInitialVoiceCreditProxies,
  EInitialVoiceCreditProxiesFactories,
  EPolicies,
  IDeployPolicyConfig,
  IDeployPollArgs,
  IDeployPollConfig
} from './types';

/**
 * Maps PollType string values to their corresponding numeric indices for contract use
 */
const pollTypeToIndex = {
  [PollType.NOT_SELECTED]: 0,
  [PollType.SINGLE_VOTE]: 1,
  [PollType.MULTIPLE_VOTE]: 2,
  [PollType.RANKED_VOTE]: 3
};

/**
 * Maps EMode string values to their corresponding numeric indices for contract use
 */
const eModeToIndex = {
  [EMode.QV]: 0,
  [EMode.NON_QV]: 1,
  [EMode.FULL]: 2,
  [EMode.RANKED]: 3
};

/**
 * Converts a PollType string value to its numeric index
 * @param pollType - The PollType string value
 * @returns The corresponding numeric index for the contract
 */
function getPollTypeIndex(pollType: PollType): number {
  return pollTypeToIndex[pollType] ?? 0;
}

/**
 * Converts an EMode string value to its numeric index
 * @param mode - The EMode string value
 * @returns The corresponding numeric index for the contract
 */
function getEModeIndex(mode: EMode | null): number {
  return mode ? (eModeToIndex[mode] ?? 0) : 0;
}

/**
 * Interface for the arguments needed by the getPollArgs function
 */
interface GetPollArgsParams {
  pollData: IPollData;
  encodedOptions: Hex[];
  startTime: bigint;
  endTime: bigint;
  merkleTreeUrl?: string;
}

/**
 * Interface for the arguments needed by the getCoordinatorPollArgs function
 */
interface GetCoordinatorPollArgsParams extends GetPollArgsParams {
  chain: string;
  privoteAddress: Hex;
}

/**
 * Generates the arguments needed for poll creation based on policy type and configuration
 * This utility function handles all policy types and their specific configuration needs
 *
 * @param params - The parameters needed to generate poll arguments
 * @returns An array of arguments ready to be passed to the contract function
 */
export function getPollArgs({
  pollData,
  encodedOptions,
  startTime,
  endTime,
  merkleTreeUrl
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: GetPollArgsParams): readonly any[] {
  const voiceCredits = pollData.maxVotePerPerson ?? DEFAULT_VOICE_CREDITS; // override voice credits with maxVotePerPerson if provided
  // Create poll metadata
  const metadataOb = {
    pollType: getPollTypeIndex(pollData.pollType),
    description: pollData.description?.trim()
  };
  const metadata = merkleTreeUrl
    ? JSON.stringify({ ...metadataOb, treeUrlVersion: '0.0.0', merkleTreeUrl })
    : JSON.stringify(metadataOb);

  // Common base arguments used by all policy types
  const baseArgs = [
    pollData.title as string,
    pollData.options.map(option => option.title ?? ''),
    encodedOptions,
    metadata,
    startTime,
    endTime,
    getEModeIndex(pollData.mode), // Convert EMode string to numeric index
    PublicKey.deserialize(pollData.publicKey).asContractParam(),
    [ZERO_ADDRESS] // relayers - currently just one zero address
  ];

  // Get policy-specific configuration
  const config = pollData.policyConfig || {};

  // Handle arguments based on policy type
  switch (pollData.policyType) {
    case PollPolicyType.FreeForAll:
      return [...baseArgs, voiceCredits];

    case PollPolicyType.AnonAadhaar:
      const verifierAddress = config.verifierAddress || ZERO_ADDRESS;
      const nullifierSeed = config.nullifierSeed || '156252232102234918017211621622458150229161190';

      return [...baseArgs, verifierAddress, nullifierSeed, voiceCredits];

    case PollPolicyType.ERC20: {
      const tokenAddress = config.tokenAddress || ZERO_ADDRESS;
      const threshold = config.threshold ? parseEther(config.threshold) : parseEther('1');

      return [...baseArgs, tokenAddress, threshold, voiceCredits];
    }

    case PollPolicyType.ERC20Votes: {
      const tokenAddress = config.tokenAddress || ZERO_ADDRESS;
      const threshold = config.threshold ? parseEther(config.threshold) : parseEther('1');
      const snapshotBlock = config.snapshotBlock ? BigInt(config.snapshotBlock) : 0n;

      return [...baseArgs, tokenAddress, threshold, snapshotBlock, voiceCredits];
    }

    case PollPolicyType.Token: {
      const tokenAddress = config.tokenAddress || ZERO_ADDRESS;

      return [...baseArgs, tokenAddress, voiceCredits];
    }

    case PollPolicyType.EAS: {
      const easContract = config.easContract || ZERO_ADDRESS;
      const attester = config.attester || ZERO_ADDRESS;
      const schema = config.schema || ZERO_BYTES32;

      return [...baseArgs, easContract, attester, schema, voiceCredits];
    }

    case PollPolicyType.GitcoinPassport:
      const decoderAddress = config.gitcoinDecoderAddress || ZERO_ADDRESS;
      const passingScore = config.passingScore ? BigInt(config.passingScore) : 0n;
      return [...baseArgs, decoderAddress, passingScore, voiceCredits];

    // case PollPolicyType.Hats: {
    //   const hatsContract = config.hatsContract || ZERO_ADDRESS;
    //   const hatsCriterions = config.hatsCriterions?.map(criterion => BigInt(criterion)) || [];

    //   return [...baseArgs, hatsContract, hatsCriterions, voiceCredits];
    // }

    case PollPolicyType.MerkleProof: {
      const merkleRoot = config.merkleRoot || ZERO_BYTES32;

      return [...baseArgs, merkleRoot, voiceCredits];
    }

    // case PollPolicyType.Semaphore: {
    //   const semaphoreContract = config.semaphoreContract || ZERO_ADDRESS;
    //   const groupId = config.groupId ? BigInt(config.groupId) : 0n;

    //   return [...baseArgs, semaphoreContract, groupId, voiceCredits];
    // }

    case PollPolicyType.Zupass: {
      const eventId = config.eventId || '';
      const signer1 = config.signer1 || '';
      const signer2 = config.signer2 || '';
      const zupassVerifier = config.zupassVerifier || '';

      return [...baseArgs, eventId, signer1, signer2, zupassVerifier, voiceCredits];
    }

    default:
      return [...baseArgs, voiceCredits];
  }
}

export const getCoordinatorPollArgs = ({
  pollData,
  encodedOptions,
  startTime,
  endTime,
  chain,
  privoteAddress
}: GetCoordinatorPollArgsParams): IDeployPollArgs => {
  // Create poll metadata
  const voiceCredits = pollData.maxVotePerPerson ?? DEFAULT_VOICE_CREDITS;
  const metadata = JSON.stringify({
    pollType: getPollTypeIndex(pollData.pollType),
    description: pollData.description
  });

  // Common base arguments used by all policy types
  const baseArgs: Partial<IDeployPollConfig> = {
    name: pollData.title as string,
    options: pollData.options.map(option => option.title ?? ''),
    optionsInfo: encodedOptions,
    metadata,
    startDate: Number(startTime),
    endDate: Number(endTime),
    mode: getEModeIndex(pollData.mode),
    initialVoiceCreditsProxy: {
      factoryType: EInitialVoiceCreditProxiesFactories.Constant,
      type: EInitialVoiceCreditProxies.Constant,
      args: {
        amount: Number(voiceCredits)
      }
    },
    relayers: [ZERO_ADDRESS]
  };

  const config = pollData.policyConfig;

  let policy: IDeployPolicyConfig;

  switch (pollData.policyType) {
    case PollPolicyType.FreeForAll:
      policy = {
        type: EPolicies.FreeForAll
      };
      break;

    case PollPolicyType.AnonAadhaar:
      const verifierAddress = config.verifierAddress || ZERO_ADDRESS;
      const nullifierSeed = config.nullifierSeed || '156252232102234918017211621622458150229161190';

      policy = {
        type: EPolicies.AnonAadhaar,
        args: {
          verifier: verifierAddress,
          nullifierSeed: nullifierSeed
        }
      };
      break;

    case PollPolicyType.ERC20: {
      const tokenAddress = config.tokenAddress || ZERO_ADDRESS;
      const threshold = config.threshold ? parseEther(config.threshold) : parseEther('1');

      policy = {
        type: EPolicies.ERC20,
        args: {
          token: tokenAddress,
          threshold: threshold
        }
      };
      break;
    }

    case PollPolicyType.ERC20Votes: {
      const tokenAddress = config.tokenAddress || ZERO_ADDRESS;
      const threshold = config.threshold ? parseEther(config.threshold) : parseEther('1');
      const snapshotBlock = config.snapshotBlock ? BigInt(config.snapshotBlock) : 0n;

      policy = {
        type: EPolicies.ERC20Votes,
        args: {
          token: tokenAddress,
          threshold: threshold,
          snapshotBlock: snapshotBlock
        }
      };
      break;
    }

    case PollPolicyType.Token: {
      const tokenAddress = config.tokenAddress || ZERO_ADDRESS;

      policy = {
        type: EPolicies.Token,
        args: {
          token: tokenAddress
        }
      };
      break;
    }

    case PollPolicyType.EAS: {
      const easContract = config.easContract || ZERO_ADDRESS;
      const attester = config.attester || ZERO_ADDRESS;
      const schema = config.schema || ZERO_BYTES32;

      policy = {
        type: EPolicies.EAS,
        args: {
          easAddress: easContract,
          attester: attester,
          schema: schema
        }
      };
      break;
    }

    case PollPolicyType.GitcoinPassport:
      const decoderAddress = config.gitcoinDecoderAddress || ZERO_ADDRESS;
      const passingScore = config.passingScore ? BigInt(config.passingScore) : 0n;

      policy = {
        type: EPolicies.GitcoinPassport,
        args: {
          decoderAddress: decoderAddress,
          passingScore: passingScore.toString()
        }
      };
      break;

    // case PollPolicyType.Hats: {
    //   const hatsContract = config.hatsContract || ZERO_ADDRESS;
    //   const hatsCriterions = config.hatsCriterions?.map(criterion => BigInt(criterion)) || [];

    //   return [...baseArgs, hatsContract, hatsCriterions, voiceCredits];
    // }

    // case PollPolicyType.MerkleProof: {
    //   const merkleRoot = config.merkleRoot || ZERO_BYTES32;
    //
    // policy = {
    //   type: EPolicies.Merkle,
    //   args: {
    //     root: merkleRoot,
    //   }
    // };
    // break;
    // }

    // case PollPolicyType.Semaphore: {
    //   const semaphoreContract = config.semaphoreContract || ZERO_ADDRESS;
    //   const groupId = config.groupId ? BigInt(config.groupId) : 0n;

    //   policy = {
    //     type: EPolicies.Semaphore,
    //     args: {
    //       semaphoreContract: semaphoreContract,
    //       groupId: groupId.toString()
    //     }
    //   };
    //   break;
    // }

    case PollPolicyType.Zupass: {
      const eventId = config.eventId || '';
      const signer1 = config.signer1 || '';
      const signer2 = config.signer2 || '';
      const zupassVerifier = config.zupassVerifier || '';

      policy = {
        type: EPolicies.Zupass,
        args: {
          eventId: eventId,
          signer1: signer1,
          signer2: signer2,
          zupassVerifier: zupassVerifier
        }
      };
      break;
    }

    default:
      policy = {
        type: EPolicies.FreeForAll
      };
  }

  baseArgs.policy = policy;

  return {
    chain,
    privoteAddress,
    config: baseArgs as IDeployPollConfig
  };
};
