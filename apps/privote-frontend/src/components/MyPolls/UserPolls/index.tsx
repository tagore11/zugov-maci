import PollItem from '@/components/Polls/PollItem';
import { Button, EmptyState, ErrorState, LoadingPulse } from '@/components/shared';
import usePolls from '@/hooks/usePolls';
import useAppConstants from '@/hooks/useAppConstants';
import { getSubgraphUrl } from '@/utils/subgraphUrl';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import { useAccount } from 'wagmi';
import styles from './index.module.css';

const UserPolls: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { daos, slugs, activeDaoKey } = useAppConstants();
  const subgraphUrl = getSubgraphUrl(activeDaoKey, daos, slugs) || '';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch: refetchPolls
  } = usePolls({
    ownerAddress: address,
    subgraphUrl
  });

  if (!isConnected) {
    return (
      <div className={styles['empty-state']}>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your wallet to view your polls</p>
        <div className={styles['connect-button']}>
          <ConnectButton label='Login' />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='spinner-wrapper'>
        <div className='spinner large'></div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState title='Error Fetching Polls' retryAction={refetchPolls} />;
  }

  const polls = data?.pages.flat() || [];

  if (polls.length === 0) {
    return <EmptyState title='No Polls Found' description='You have not created any polls yet.' />;
  }

  return (
    <div className={styles['polls-list-container']}>
      <ul className={styles['polls-list']}>
        {polls.map(poll => (
          <PollItem key={poll.id} poll={poll} />
        ))}
      </ul>
      {hasNextPage && (
        <Button action={() => fetchNextPage()} disabled={isFetchingNextPage} className={styles.loadMoreButton}>
          {isFetchingNextPage ? <LoadingPulse size='small' text='Loading...' variant='check' /> : 'Load More'}
        </Button>
      )}
    </div>
  );
};

export default UserPolls;
