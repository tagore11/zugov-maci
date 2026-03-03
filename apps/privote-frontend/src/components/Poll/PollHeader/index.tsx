import { Modal, ShareModal } from '@/components/shared';
import usePollContext from '@/hooks/usePollContext';
import { PollStatus } from '@/types';
import { formatTimeRemaining, getNextTransitionTime } from '@/utils/pollStatus';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaShare } from 'react-icons/fa';
import { JoinPollButton } from '../JoinPollButton';
import styles from './index.module.css';

export const PollHeader = () => {
  console.log('PollHeader: Component rendering');

  try {
    const { poll, dynamicPollStatus, hasJoinedPoll } = usePollContext();

    console.log('PollHeader: usePollContext data');
    console.log('- poll:', poll);
    console.log('- dynamicPollStatus:', dynamicPollStatus);
    console.log('- hasJoinedPoll:', hasJoinedPoll);

    if (!poll) {
      console.log('PollHeader: No poll data available');
      return <div>No poll data</div>;
    }

    const {
      status: originalStatus,
      policyTrait: pollPolicyType,
      policyData,
      description: pollDescription,
      name: pollName,
      startDate: pollStartTime,
      endDate: pollEndTime
    } = poll;

    console.log('PollHeader: Poll data debug:');
    console.log('- Full poll object:', poll);
    console.log('- policyTrait from poll:', pollPolicyType);
    console.log('- policyData from poll:', policyData);

    // Use dynamic status if available, otherwise fall back to original status
    const status = dynamicPollStatus || originalStatus;

    // Debug logging for join button visibility
    console.log('PollHeader Debug:');
    console.log('- Poll Name:', pollName);
    console.log('- Original Status:', originalStatus);
    console.log('- Dynamic Status:', dynamicPollStatus);
    console.log('- Final Status:', status);
    console.log('- hasJoinedPoll:', hasJoinedPoll);
    console.log('- Start Time:', new Date(parseInt(pollStartTime) * 1000));
    console.log('- End Time:', new Date(parseInt(pollEndTime) * 1000));
    console.log('- Current Time:', new Date());
    console.log('- Show join button condition:', status === PollStatus.OPEN || status === PollStatus.NOT_STARTED);
    console.log(
      '- Should show button:',
      (status === PollStatus.OPEN || status === PollStatus.NOT_STARTED) && !hasJoinedPoll
    );

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(
      getNextTransitionTime(status, pollStartTime, pollEndTime)
    );

    const handleOpenShareModal = () => {
      setIsShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
      setIsShareModalOpen(false);
    };

    const handleCloseInstructionsModal = () => {
      setIsInstructionsModalOpen(false);
    };

    useEffect(() => {
      if (status !== PollStatus.CLOSED && status !== PollStatus.RESULT_COMPUTED) {
        const timer = setInterval(() => {
          const newTime = getNextTransitionTime(status, pollStartTime, pollEndTime);
          setTimeRemaining(newTime);

          if (newTime <= 0) {
            clearInterval(timer);
          }
        }, 1000);

        return () => clearInterval(timer);
      }
    }, [status, pollStartTime, pollEndTime]);

    return (
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href={'/polls'} className={styles.back}>
            <Image src='/arrow-left.svg' alt='arrow left' width={27} height={27} />
          </Link>

          <div className={styles.end}>
            <div className={styles.headerButtons}>
              <button className={styles.shareButton} onClick={handleOpenShareModal}>
                <FaShare /> Share
              </button>
            </div>

            {(status === PollStatus.OPEN || status === PollStatus.NOT_STARTED) && (
              <JoinPollButton policyType={pollPolicyType} policyData={policyData} />
            )}

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div
                style={{
                  position: 'fixed',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  zIndex: 9999,
                  maxWidth: '300px'
                }}
              >
                <div>
                  <strong>Poll Debug Info:</strong>
                </div>
                <div>Status: {status}</div>
                <div>Has Joined: {hasJoinedPoll ? 'Yes' : 'No'}</div>
                <div>
                  Show Button:{' '}
                  {(status === PollStatus.OPEN || status === PollStatus.NOT_STARTED) && !hasJoinedPoll ? 'Yes' : 'No'}
                </div>
              </div>
            )}

            {/* Modals */}
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={handleCloseShareModal}
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={pollName}
              description={pollDescription}
            />

            <Modal isOpen={isInstructionsModalOpen} onClose={handleCloseInstructionsModal} title='Instructions'>
              <div className={styles.instructions}>
                <p>Follow the instructions to vote on this poll.</p>
              </div>
            </Modal>

            <div className={styles.status}>
              <Image src='/clock.svg' alt='clock' width={24} height={24} />
              {status === PollStatus.NOT_STARTED && (
                <span className={styles.timeInfo}>Starts in: {formatTimeRemaining(timeRemaining)}</span>
              )}
              {status === PollStatus.OPEN && (
                <span className={styles.timeInfo}>Time left: {formatTimeRemaining(timeRemaining)}</span>
              )}
              {(status === PollStatus.CLOSED || status === PollStatus.RESULT_COMPUTED) && 'Poll ended'}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('PollHeader Error:', error);
    return <div>Error loading poll header</div>;
  }
};

export default PollHeader;
