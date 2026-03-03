'use client';
import { DEFAULT_SG_DATA } from '@/utils/constants';
import Image from 'next/image';
import { useEffect } from 'react';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';

/**
 * FreeForAll Policy Component
 */
const FreeForAllComponent: React.FC = () => {
  return (
    <>
      <div className={styles.policyHeader}>
        <div className={styles.policyIconWrapper}>
          <Image src='/icons/free-icon.svg' width={24} height={24} alt='Free' className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>Open Access Poll</h4>
          <span className={styles.policySubtitle}>No Special Requirements</span>
        </div>
      </div>

      <div className={styles.policyDetails}>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Access Level:</span>
          <span className={styles.detailValue}>
            <span className={styles.highlight}>Public</span>
          </span>
        </div>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Requirements:</span>
          <span className={styles.detailValue}>Connected wallet only</span>
        </div>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Eligibility:</span>
          <span className={styles.detailValue}>All registered users</span>
        </div>
      </div>

      <div className={styles.freeForAllDescription}>
        This is an open poll where anyone with a registered Privote account can participate. No additional tokens, NFTs,
        or verification is required.
      </div>
    </>
  );
};

/**
 * Component for handling FreeForAll policy
 */
const FreeForAllPolicy = ({ signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const requirementsDescription = 'This is an open poll - anyone with a registered Privote account can participate';

  const handleNext = () => {
    setSignupState(prev => ({
      ...prev,
      data: DEFAULT_SG_DATA
    }));
    onNext();
  };

  useEffect(() => {
    setSignupState(prev => ({
      ...prev,
      canJoin: true
    }));
  }, [setSignupState]);

  return (
    <Common
      canJoin={signupState.canJoin}
      requirementsDescription={requirementsDescription}
      isLoading={false}
      onNext={handleNext}
      onBack={onBack}
    >
      <FreeForAllComponent />
    </Common>
  );
};

export default FreeForAllPolicy;
