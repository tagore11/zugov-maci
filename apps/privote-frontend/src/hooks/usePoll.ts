import { GET_POLL_QUERY } from '@/services/queries/polls';
import type { TransformedPoll } from '@/types';
import { EMode } from '@/types';
import { fetcher } from '@/utils/fetcher';
import { useQuery } from '@tanstack/react-query';
import useAppConstants from './useAppConstants';
import {
  getPollStatus,
  getPolicyTypeString,
  getPollTypeFromMetadata,
  buildPollOptions,
  parseMetadata,
  type SubgraphPoll
} from './usePolls';
import { Hex } from 'viem';

// Map numeric indices back to string modes
const eModeIndexToString: Record<number, keyof typeof EMode> = {
  0: 'QV',
  1: 'NON_QV',
  2: 'FULL',
  3: 'RANKED'
};

// Convert a numeric mode to its string representation
export function getEModeString(modeIndex: number): EMode {
  return eModeIndexToString[modeIndex] || 'QV';
}

interface PollData {
  poll: SubgraphPoll;
}

interface UsePollParams {
  pollAddress: string | null | undefined;
  subgraphUrl: string;
}

const usePoll = ({ pollAddress, subgraphUrl }: UsePollParams) => {
  const { updateChain } = useAppConstants();
  console.log('usePoll hook - pollAddress:', pollAddress);
  console.log('usePoll hook - subgraphUrl:', subgraphUrl);
  const result = useQuery<TransformedPoll | null>({
    queryKey: ['poll', pollAddress],
    queryFn: async () => {
      console.log('usePoll hook - queryFn started');
      if (!pollAddress) {
        console.log('usePoll hook - no pollAddress, returning null');
        return null;
      }

      // Try to fetch from all supported subgraphs if the primary one fails
      const tryFetchFromSubgraph = async (url: string): Promise<PollData | null> => {
        console.log('tryFetchFromSubgraph called with URL:', url);
        try {
          console.log('usePoll hook - making GraphQL request to:', url);
          console.log('usePoll hook - GraphQL variables:', { id: pollAddress });
          const data: PollData = await fetcher([url, GET_POLL_QUERY, { id: pollAddress }]);
          console.log('usePoll hook - GraphQL response:', data);
          return data.poll ? data : null;
        } catch (error) {
          console.warn(`Failed to fetch poll from ${url}:`, error);
          return null;
        }
      };

      console.log('usePoll hook - about to call tryFetchFromSubgraph with:', subgraphUrl);
      // First try the primary subgraph URL
      let data = await tryFetchFromSubgraph(subgraphUrl);
      console.log('usePoll hook - primary subgraph data:', data);

      // If not found and we're using a specific chain, try all other chains
      if (!data?.poll) {
        // Generate all possible subgraph URLs
        const { supportedChains } = await import('@/config/chains');
        const { appConstants } = await import('@/config/constants');
        const { getSubgraphUrl } = await import('@/utils/subgraphUrl');

        for (const chain of supportedChains) {
          const chainConstants = appConstants[chain.id];
          const daoKeys = Object.keys(chainConstants.daos);
          const defaultDaoName = daoKeys[0];
          const alternativeUrl = getSubgraphUrl(defaultDaoName, chainConstants.daos, chainConstants.slugs);

          // Skip if this is the same URL we already tried or if URL is undefined
          if (!alternativeUrl || alternativeUrl === subgraphUrl) continue;

          data = await tryFetchFromSubgraph(alternativeUrl);
          if (data?.poll) {
            updateChain(chain.id);
            console.log(`Poll found on ${chain.name} subgraph`);
            break;
          }
        }
      }

      if (!data?.poll) {
        throw new Error(`Poll not found on any supported network. Poll address: ${pollAddress}`);
      }

      const raw = data.poll;
      const meta = parseMetadata(raw.metadata);
      const modeString = getEModeString(Number(raw.mode));
      const pollTypeString = getPollTypeFromMetadata(meta.pollType ?? 0);
      const policyTrait = getPolicyTypeString(Number(raw.policyType));
      const options = buildPollOptions(raw.options ?? [], raw.optionInfo ?? []);

      // Create the transformed poll with the correct types and values
      const transformedPoll: TransformedPoll = {
        id: raw.id,
        pollId: raw.pollId,
        name: raw.name,
        startDate: raw.startDate,
        endDate: raw.endDate,
        voteOptions: raw.voteOptions,
        owner: raw.owner,
        maci: raw.maci,
        totalSignups: raw.totalSignups,
        numMessages: raw.numMessages,
        policyTrait,
        options,
        description: meta.description,
        status: getPollStatus({ ...raw, policyTrait, options }),
        pollType: pollTypeString,
        mode: modeString,
        privoteContractAddress: raw.maci.id as Hex
      };

      return transformedPoll;
    },
    enabled: !!pollAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
  });

  // Debug logging for React Query state
  console.log('usePoll hook - React Query state:', {
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    data: result.data,
    enabled: !!pollAddress
  });

  return result;
};

export default usePoll;
