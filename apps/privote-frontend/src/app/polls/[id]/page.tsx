'use client';
import { PollHeader, VotingSection } from '@/components/Poll';
import { EmptyState, ErrorState } from '@/components/shared';
import { PollProvider } from '@/contexts/PollContext';
import usePollContext from '@/hooks/usePollContext';
import styles from '@/styles/poll.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

const PollDetail: React.FC = () => {
  // Get poll ID from URL parameters
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <EmptyState title='Invalid Poll Id' description='Please try again with a valid poll id' />;
  }

  return (
    <PollProvider pollAddress={id}>
      <UserPoll />
    </PollProvider>
  );
};

const UserPoll = () => {
  const { pollError, pollLoading, poll } = usePollContext();

  if (pollLoading) {
    return (
      <div className={styles.container}>
        <Link href={'/'} className={styles.back}>
          <Image src='/arrow-left.svg' alt='arrow left' width={27} height={27} />
        </Link>
        <div className={styles['loading-state']}>
          <div className='spinner large'></div>
          <p style={{ color: 'white', textAlign: 'center' }}>Loading poll details...</p>
        </div>
      </div>
    );
  }

  if (pollError) {
    const errorMessage = pollError.message || 'Unknown error occurred';
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch');
    const isPollNotFound = errorMessage.includes('not found') || errorMessage.includes('Poll not found');

    let title = 'Failed to Load Poll';
    let customError = pollError;

    if (isPollNotFound) {
      title = 'Poll Not Found';
      customError = new Error(
        'This poll could not be found on any supported network. Please check the URL and try again.'
      );
    } else if (isNetworkError) {
      title = 'Network Error';
      customError = new Error('Unable to connect to the network. Please check your internet connection and try again.');
    }

    return (
      <div className={styles.container}>
        <Link href={'/polls'} className={styles.back}>
          <Image src='/arrow-left.svg' alt='arrow left' width={27} height={27} />
        </Link>
        <ErrorState title={title} error={customError} retryAction={() => window.location.reload()} />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className={styles.container}>
        <Link href={'/polls'} className={styles.back}>
          <Image src='/arrow-left.svg' alt='arrow left' width={27} height={27} />
        </Link>
        <ErrorState
          title='Poll Not Available'
          error={new Error('This poll is not available or has been removed. Please try browsing other polls.')}
          retryAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={styles['main-container']}>
      <div className={styles['poll-container']}>
        <PollHeader />
        <VotingSection pollAddress={poll.id} />
      </div>
    </div>
  );
};

export default PollDetail;
