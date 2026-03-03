import PollItem from '@/components/Polls/PollItem';
import { EmptyState, ErrorState } from '@/components/shared';
import { Poll, PollPolicyType, PollStatus } from '@/types';
import usePolls from '@/hooks/usePolls';
import useAppConstants from '@/hooks/useAppConstants';
import { getSubgraphUrl } from '@/utils/subgraphUrl';
import Link from 'next/link';
import React from 'react';
import styles from './index.module.css';

// Hardcoded dummy poll data - REPLACE WITH ACTUAL DATA
// This poll will redirect to the specified URL instead of the poll detail page
const DUMMY_POLL_REDIRECT_URL = 'https://gitcoin.privote.live'; // REPLACE WITH ACTUAL URL

const DUMMY_POLLS: Poll[] = [
  {
    id: 'dummy-poll-1',
    pollId: '1',
    name: 'Gitcoin - Privacy',
    description: 'GG24 Round on Privacy',
    startDate: '1760400001',
    endDate: '1761696001',
    voteOptions: '4',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    policyTrait: PollPolicyType.GitcoinPassport,
    status: PollStatus.OPEN,
    pollType: 'MULTIPLE_VOTE',
    mode: 'QV',
    totalSignups: '150',
    numMessages: '120',
    maci: {
      id: 'dummy-maci-1'
    }
  }
];

// Wrapper component to handle dummy poll redirect
const PollItemWrapper: React.FC<{ poll: Poll; isDummy: boolean }> = ({ poll, isDummy }) => {
  if (isDummy) {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(DUMMY_POLL_REDIRECT_URL, '_blank');
    };

    return (
      <div onClick={handleClick} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
        <div style={{ pointerEvents: 'none' }}>
          <PollItem poll={poll} />
        </div>
      </div>
    );
  }
  return <PollItem poll={poll} />;
};

const Trending: React.FC = () => {
  const { daos, slugs } = useAppConstants();
  const subgraphUrl = getSubgraphUrl('default', daos, slugs) || '';

  const { data, isLoading, isError, error, refetch } = usePolls({
    orderBy: 'createdAt',
    orderDirection: 'desc',
    limit: 3,
    isTrending: true,
    subgraphUrl
  });

  // Update dummy poll status based on current time
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const updatedDummyPolls = DUMMY_POLLS.map(poll => {
    if (Number(poll.endDate) <= currentTimestamp) {
      return { ...poll, status: PollStatus.CLOSED };
    }
    return poll;
  });

  // Combine updated dummy polls with actual polls
  const actualPolls = data?.pages.flat().slice(0, 3) || [];
  const polls = [...actualPolls, ...updatedDummyPolls];

  if (!isLoading && !isError && polls.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h4>Trending Polls</h4>
      </div>
      <div className={styles['polls-container']}>
        {isLoading && <div className={`spinner ${styles.loader}`}></div>}
        {isError && <ErrorState title='Error Loading Trending Polls' error={error} retryAction={refetch} />}
        {!isLoading && !isError && polls.length === 0 && (
          <EmptyState title='No Trending Polls Found' description='There are no trending polls' />
        )}
        {polls.length > 0 && (
          <ul className={styles['polls-list']}>
            {polls.map(poll => {
              const isDummy = poll.id === 'dummy-poll-1';
              return <PollItemWrapper key={poll.id} poll={poll} isDummy={isDummy} />;
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Trending;
