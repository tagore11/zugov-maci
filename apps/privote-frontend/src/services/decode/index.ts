import { PollPolicyType } from '@/types';
import { decodeAbiParameters, erc20Abi, Hex, parseAbiParameters, PublicClient } from 'viem';
import {
  AnonAadhaarPolicyData,
  EASPolicyData,
  ERC20PolicyData,
  ERC20VotesPolicyData,
  GitcoinPassportPolicyData,
  HatsPolicyData,
  MerklePolicyData,
  PolicyData,
  SemaphorePolicyData,
  Token,
  TokenPolicyData,
  ZupassPolicyData
} from './types';

export class DecodeService {
  constructor(
    private policyTrait: PollPolicyType,
    private policyData: Hex,
    private client: PublicClient
  ) {}

  private getAbiString(): string {
    switch (this.policyTrait) {
      case PollPolicyType.AnonAadhaar:
        return 'address verifier, uint256 nullifierSeed';
      case PollPolicyType.EAS:
        return 'address eas, address attester, bytes32 schema';
      case PollPolicyType.ERC20:
        return 'address token, uint256 threshold';
      case PollPolicyType.ERC20Votes:
        return 'address token, uint256 snapshotBlock, uint256 threshold';
      case PollPolicyType.GitcoinPassport:
        return 'address passportDecoder, uint256 thresholdScore';
      // case PollPolicyType.Hats:
      //   return 'address hats, uint256[] criterionHats';
      case PollPolicyType.MerkleProof:
        return '(bytes32 merkleRoot, string merkleTreeVersion, string merkleTreeUrl)';
      // case PollPolicyType.Semaphore:
      //   return 'address semaphore, uint256 groupId';
      case PollPolicyType.Token:
        return 'address token';
      case PollPolicyType.Zupass:
        return 'uint256 eventId, uint256 signer1, uint256 signer2, address zupassVerifier';
      default:
        return '';
    }
  }

  private async fetchTokenDetails(address: Hex): Promise<Token> {
    const ercContract = {
      abi: erc20Abi,
      address
    };

    try {
      const result = await this.client.multicall({
        contracts: [
          { ...ercContract, functionName: 'name' },
          { ...ercContract, functionName: 'symbol' },
          { ...ercContract, functionName: 'decimals' }
        ]
      });

      return {
        address,
        name: result[0].status === 'success' ? result[0].result : '',
        symbol: result[1].status === 'success' ? result[1].result : '',
        decimals: result[2].status === 'success' ? Number(result[2].result) : 18
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      return {
        address,
        name: '',
        symbol: '',
        decimals: 18
      };
    }
  }

  async decode(): Promise<PolicyData> {
    const abiString = this.getAbiString();
    if (!abiString) {
      return {};
    }

    try {
      const decodedValues = decodeAbiParameters(parseAbiParameters(abiString), this.policyData);

      switch (this.policyTrait) {
        case PollPolicyType.AnonAadhaar: {
          const [verifier, nullifierSeed] = decodedValues as [Hex, bigint];
          return {
            verifier,
            nullifierSeed
          } as AnonAadhaarPolicyData;
        }

        case PollPolicyType.EAS: {
          const [easAddress, attesterAddress, schema] = decodedValues as [Hex, Hex, Hex];
          return {
            easAddress,
            attesterAddress,
            schema
          } as EASPolicyData;
        }

        case PollPolicyType.ERC20: {
          const [tokenAddress, threshold] = decodedValues as [Hex, bigint];
          const tokenDetails = await this.fetchTokenDetails(tokenAddress);
          return {
            token: tokenDetails,
            threshold
          } as ERC20PolicyData;
        }

        case PollPolicyType.ERC20Votes: {
          const [tokenAddress, snapshotBlock, threshold] = decodedValues as [Hex, bigint, bigint];
          const tokenDetails = await this.fetchTokenDetails(tokenAddress);
          return {
            token: tokenDetails,
            snapshotBlock,
            threshold
          } as ERC20VotesPolicyData;
        }

        case PollPolicyType.GitcoinPassport: {
          const [passportDecoder, thresholdScore] = decodedValues as [Hex, bigint];
          return {
            passportDecoder,
            thresholdScore
          } as GitcoinPassportPolicyData;
        }

        // case PollPolicyType.Hats: {
        //   const [hats, criterionHats] = decodedValues as [Hex, bigint[]];
        //   return {
        //     hats,
        //     criterionHats
        //   } as HatsPolicyData;
        // }

        case PollPolicyType.MerkleProof: {
          const [merkleData] = decodedValues as [{ merkleRoot: Hex; merkleTreeVersion: string; merkleTreeUrl: string }];
          return {
            merkleRoot: merkleData.merkleRoot,
            merkleTreeVersion: merkleData.merkleTreeVersion,
            merkleTreeUrl: merkleData.merkleTreeUrl
          } as MerklePolicyData;
        }

        // case PollPolicyType.Semaphore: {
        //   const [semaphore, groupId] = decodedValues as [Hex, bigint];
        //   return {
        //     semaphore,
        //     groupId
        //   } as SemaphorePolicyData;
        // }

        case PollPolicyType.Token: {
          const [tokenAddress] = decodedValues as [Hex];
          const tokenDetails = await this.fetchTokenDetails(tokenAddress);
          return {
            token: tokenDetails
          } as TokenPolicyData;
        }

        case PollPolicyType.Zupass: {
          const [eventId, signer1, signer2, zupassVerifier] = decodedValues as [bigint, bigint, bigint, Hex];
          return {
            eventId,
            signer1,
            signer2,
            zupassVerifier
          } as ZupassPolicyData;
        }

        default:
          return {};
      }
    } catch (error) {
      console.error('Error decoding policy data:', error);
      return {};
    }
  }
}
