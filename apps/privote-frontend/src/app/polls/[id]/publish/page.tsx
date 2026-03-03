'use client';
import { CoordinatorConfig, HardhatConfig } from '@/components/PollPublish';
import { EmptyState } from '@/components/shared';
import { CoordinatorProvider } from '@/contexts/CoordinatorContext';
import { PollProvider } from '@/contexts/PollContext';
import usePollContext from '@/hooks/usePollContext';
import styles from '@/styles/publish.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Publish() {
  // Get poll ID from URL parameters
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <EmptyState title='Invalid Poll Id' description='Please try again with a valid poll id' />;
  }

  return (
    <PollProvider pollAddress={id}>
      <CoordinatorProvider>
        <PublishInternal />
      </CoordinatorProvider>
    </PollProvider>
  );
}

const PublishInternal = () => {
  const [selected, setSelected] = useState(0);
  const [isTallied, setIsTallied] = useState<boolean | null>(null);
  const [isCheckingTallied, setisCheckingTallied] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { poll, pollError, pollLoading, checkIsTallied } = usePollContext();
  const router = useRouter();
  const { id: pollAddress } = useParams<{ id: string }>();

  // Check if poll is tallied when component mounts
  useEffect(() => {
    const checkTalliedStatus = async () => {
      try {
        setisCheckingTallied(true);
        const tallied = await checkIsTallied();
        setIsTallied(tallied);

        if (tallied) {
          setIsRedirecting(true);
          setTimeout(() => {
            router.push(`/polls/${pollAddress}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking tally status:', error);
        setIsTallied(false);
      } finally {
        setisCheckingTallied(false);
      }
    };

    checkTalliedStatus();
  }, [pollAddress, checkIsTallied]);

  if (pollError) {
    return <div>Error loading poll details</div>;
  }

  if (pollLoading || isCheckingTallied || isTallied === null) {
    return (
      <div className={styles.container}>
        <div className='spinner-wrapper'>
          <span className='spinner large'></span>
          <p className={styles.loadingText}>
            {isCheckingTallied ? 'Checking poll status...' : 'Loading poll details...'}
          </p>
        </div>
      </div>
    );
  }

  // Show redirect message if poll is tallied
  if (isTallied && isRedirecting) {
    return (
      <div className={styles.container}>
        <div className={styles.talliedRedirect}>
          <div className={styles.talliedIcon}>✅</div>
          <h2 className={styles.talliedTitle}>Poll Already Published</h2>
          <p className={styles.talliedMessage}>
            This poll has already been tallied and results are available.
            <br />
            Redirecting you to the poll page...
          </p>
          <div className={`spinner-wrapper ${styles.redirectSpinner}`}>
            <span className='spinner'></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href={'/'} className={styles.back}>
        <Image src='/arrow-left.svg' alt='arrow left' width={27} height={27} />
      </Link>
      <div className={styles.details}>
        <h2 className={styles.heading}>Choose how you want to publish poll results</h2>
        <div className={styles['card-wrapper']}>
          <HardhatConfig pollId={poll?.pollId as string} isSelected={selected === 1} onClick={() => setSelected(1)} />
          <CoordinatorConfig isSelected={selected === 2} pollAddress={pollAddress} onClick={() => setSelected(2)} />
        </div>
      </div>
    </div>
  );
};
