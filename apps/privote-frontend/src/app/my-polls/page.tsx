'use client';
import { CreatePollForm, UserPolls } from '@/components/MyPolls';
import { PollFormProvider } from '@/components/MyPolls/CreatePollForm/context';
import { Button } from '@/components/shared';
import styles from '@/styles/admin.module.css';
import React, { Suspense } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'next/navigation';

const MyPollsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const shouldShowCreate = searchParams.get('create') === 'true';
  const [showCreatePoll, setShowCreatePoll] = React.useState(shouldShowCreate);
  const { isConnected } = useAccount();

  return (
    <PollFormProvider>
      <div className={styles.wrapper}>
        <div className={styles['admin-page']}>
          <div className={styles.header}>
            {!showCreatePoll && isConnected && (
              <Button className={styles.btn} action={() => setShowCreatePoll(true)}>
                Create Poll
              </Button>
            )}
          </div>
          {!showCreatePoll && <UserPolls />}
          {showCreatePoll && isConnected && <CreatePollForm onClose={() => setShowCreatePoll(false)} />}
        </div>
      </div>
    </PollFormProvider>
  );
};

const MyPollsPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPollsContent />
    </Suspense>
  );
};

export default MyPollsPage;
