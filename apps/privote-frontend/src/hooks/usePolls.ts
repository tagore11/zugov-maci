import { EPolicy } from '@maci-protocol/core';
import { GET_POLLS_QUERY } from '@/services/queries/polls';
import type { Poll, PollOption, RawPoll } from '@/types';
import { PollPolicyType, PollStatus, PollType } from '@/types';
import { fetcher } from '@/utils/fetcher';
import { decodeOptionInfo } from '@/utils/optionInfo';
import { useInfiniteQuery, type QueryFunctionContext } from '@tanstack/react-query';

// Raw shape returned by the subgraph before transformation
export interface SubgraphPoll {
  id: string;
  pollId: string;
  name: string;
  startDate: string;
  endDate: string;
  voteOptions: string;
  options: string[];
  optionInfo: string[];
  policyType: string;
  metadata: string;
  owner: string;
  mode: string;
  duration?: string;
  totalSignups?: string;
  numMessages?: string;
  createdAt: string;
  updatedAt: string;
  maci: { id: string };
}

export function getPolicyTypeString(index: number): PollPolicyType {
  const name = EPolicy[index] as keyof typeof PollPolicyType | undefined;
  return PollPolicyType[name!] ?? PollPolicyType.FreeForAll;
}

export function buildPollOptions(names: string[], infos: string[]): PollOption[] {
  return names.map((name, i) => {
    const { cid, description, link } = decodeOptionInfo(infos[i] ?? '');
    return { id: String(i), name, description, link, cid };
  });
}

export function parseMetadata(raw: string): { pollType?: number; description?: string } {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const pollTypeIndexToString: Record<number, PollType> = {
  0: PollType.NOT_SELECTED,
  1: PollType.SINGLE_VOTE,
  2: PollType.MULTIPLE_VOTE,
  3: PollType.RANKED_VOTE
};

export function getPollTypeFromMetadata(index: number): PollType {
  return pollTypeIndexToString[index] ?? PollType.NOT_SELECTED;
}

export function transformSubgraphPoll(poll: SubgraphPoll): RawPoll {
  const meta = parseMetadata(poll.metadata);
  return {
    id: poll.id,
    pollId: poll.pollId,
    name: poll.name,
    startDate: poll.startDate,
    endDate: poll.endDate,
    voteOptions: poll.voteOptions,
    owner: poll.owner,
    maci: poll.maci,
    totalSignups: poll.totalSignups,
    numMessages: poll.numMessages,
    policyTrait: getPolicyTypeString(Number(poll.policyType)),
    options: buildPollOptions(poll.options ?? [], poll.optionInfo ?? []),
    description: meta.description,
    pollType: getPollTypeFromMetadata(meta.pollType ?? 0)
  };
}

interface PollsData {
  polls: SubgraphPoll[];
}

interface UsePollsParams {
  searchTerm?: string;
  ownerAddress?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  isTrending?: boolean;
  subgraphUrl: string;
}

export function getPollStatus(poll: RawPoll): PollStatus {
  try {
    console.log('getPollStatus Debug:');
    console.log('- Poll object:', poll);
    console.log('- Poll Name:', poll?.name || 'undefined');
    console.log('- Poll ID:', poll?.id || 'undefined');

    const now = Math.round(new Date().getTime() / 1000);
    const startTime = parseInt(poll.startDate, 10);
    const endTime = parseInt(poll.endDate, 10);

    console.log('- Start Date (timestamp):', startTime);
    console.log('- End Date (timestamp):', endTime);
    console.log('- Current Time (timestamp):', now);
    console.log('- Start Date (readable):', new Date(startTime * 1000));
    console.log('- End Date (readable):', new Date(endTime * 1000));
    console.log('- Current Time (readable):', new Date(now * 1000));

    if (startTime > now) {
      console.log('- Status: NOT_STARTED (startTime > now)');
      return PollStatus.NOT_STARTED;
    }

    if (endTime > now) {
      console.log('- Status: OPEN (endTime > now)');
      return PollStatus.OPEN;
    }

    console.log('- Status: CLOSED (endTime <= now)');
    return PollStatus.CLOSED;
  } catch (error) {
    console.error('Error in getPollStatus:', error);
    console.log('- Poll data received:', JSON.stringify(poll, null, 2));
    return PollStatus.CLOSED;
  }
}

const fetchPolls = async (
  context: QueryFunctionContext<
    readonly [
      string,
      string,
      string,
      string | undefined,
      string | undefined,
      'asc' | 'desc' | undefined,
      number | undefined,
      boolean | undefined
    ],
    number
  >
): Promise<Poll[]> => {
  const { pageParam, queryKey } = context;
  const [, subgraphUrl, searchTerm, ownerAddress, orderBy, orderDirection, limit, isTrending] = queryKey;

  const where: { name_contains_nocase?: string; owner?: string; endDate_gt?: number; startDate_lt?: number } = {};
  if (searchTerm) {
    where.name_contains_nocase = searchTerm;
  }
  if (ownerAddress) {
    where.owner = ownerAddress;
  }
  if (isTrending) {
    where.endDate_gt = Math.round(Date.now() / 1000);
    where.startDate_lt = Math.round(Date.now() / 1000);
  }

  const variables = {
    first: limit || 10,
    skip: pageParam * (limit || 10),
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: orderBy || 'createdAt',
    orderDirection: orderDirection || 'desc'
  };

  console.log('fetchPolls - subgraphUrl:', subgraphUrl);
  console.log('fetchPolls - variables:', variables);

  try {
    const data: PollsData = await fetcher([subgraphUrl, GET_POLLS_QUERY, variables]);
    console.log('fetchPolls - success, got', data.polls.length, 'polls');
    return data.polls.map(poll => {
      const transformed = transformSubgraphPoll(poll);
      return { ...transformed, status: getPollStatus(transformed) };
    });
  } catch (error) {
    console.error('fetchPolls - error fetching polls:', error);
    console.error('fetchPolls - subgraphUrl that failed:', subgraphUrl);
    console.error('fetchPolls - query variables:', variables);
    throw error;
  }
};

const usePolls = ({
  searchTerm = '',
  ownerAddress,
  orderBy,
  orderDirection,
  limit = 10,
  isTrending = false,
  subgraphUrl
}: UsePollsParams) => {
  return useInfiniteQuery({
    queryKey: ['polls', subgraphUrl, searchTerm, ownerAddress, orderBy, orderDirection, limit, isTrending] as const,
    queryFn: fetchPolls,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length;
    }
  });
};

export default usePolls;
