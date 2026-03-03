import { LoadingPulse } from '@/components/shared';
import usePollContext from '@/hooks/usePollContext';
import { PollPolicyType } from '@/types';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React, { useState } from 'react';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';
import { JoinPollModal } from '../JoinPollModal';
import styles from './index.module.css';

interface JoinPollButtonProps {
  policyType: PollPolicyType;
  policyData?: Hex;
  buttonStyle?: 'default' | 'solidPink' | 'enhancedGlass'; // For testing different styles
}

/**
 * A simplified button component for joining polls that opens a step-by-step modal
 */
export const JoinPollButton: React.FC<JoinPollButtonProps> = ({ policyType, policyData, buttonStyle = 'default' }) => {
  const { isConnected } = useAccount();
  const { hasJoinedPoll, isCheckingUserJoinedPoll, isJoiningPoll: isLoading } = usePollContext();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // If the user has already joined the poll and the modal is not open, hide the button.
  // Keep the component mounted while modal is open so the modal is not lost mid-flow.
  if (hasJoinedPoll && !isModalOpen) {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // If user is not connected, show connect wallet prompt
  if (!isConnected) {
    return (
      <div className={styles.joinButtonWrapper}>
        <ConnectButton label='Login' />
      </div>
    );
  }

  // Main join button - opens the step modal
  return (
    <div className={styles.joinButtonWrapper}>
      <button
        onClick={handleOpenModal}
        className={`${styles.joinButton} ${buttonStyle !== 'default' ? styles[buttonStyle] : ''} ${isCheckingUserJoinedPoll ? styles.checking : ''}`}
        disabled={isLoading}
      >
        {isCheckingUserJoinedPoll ? (
          <LoadingPulse size='small' variant='check' text='Checking...' />
        ) : isLoading ? (
          <LoadingPulse size='small' variant='primary' text='Joining...' />
        ) : (
          <>
            {/* <TiPlus size={20} color='#fff' /> */}
            <span>Join Poll</span>
          </>
        )}
      </button>

      {/* Step-by-step modal */}
      <JoinPollModal isOpen={isModalOpen} onClose={handleCloseModal} policyType={policyType} policyData={policyData} />
    </div>
  );
};
