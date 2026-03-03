import { Button, EmptyState, ErrorState, LoadingPulse } from '@/components/shared';
import usePolls from '@/hooks/usePolls';
import useAppConstants from '@/hooks/useAppConstants';
import { getSubgraphUrl } from '@/utils/subgraphUrl';
import type { Poll } from '@/types';
import React from 'react';
import PollItem from '../PollItem';
import styles from './index.module.css';

interface PollsListProps {
  searchTerm: string;
}

const PollsList: React.FC<PollsListProps> = ({ searchTerm }) => {
  const { daos, slugs } = useAppConstants();
  const subgraphUrl = getSubgraphUrl('default', daos, slugs) || '';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = usePolls({
    searchTerm,
    subgraphUrl
  });

  if (isLoading) {
    return (
      <div className='spinner-wrapper'>
        <div className='spinner large'></div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState title='Error Loading Polls' error={error} retryAction={refetch} />;
  }

  const noPolls = !data?.pages || data.pages.every(page => page.length === 0);

  if (noPolls) {
    return <EmptyState title='No Polls Found' description='There are no polls for you' />;
  }

  return (
    <>
      <ul className={styles['polls-list']}>
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.map((poll: Poll) => (
              <PollItem key={poll.id} poll={poll} />
            ))}
          </React.Fragment>
        ))}
      </ul>
      {hasNextPage && (
        <Button action={() => fetchNextPage()} disabled={isFetchingNextPage} className={styles.loadMoreButton}>
          {isFetchingNextPage ? <LoadingPulse size='small' text='Loading...' variant='check' /> : 'Load More'}
        </Button>
      )}
    </>
  );
};

export default PollsList;
