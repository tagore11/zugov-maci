'use client';
import styles from '@/components/Poll/JoinPollModal/JoinPollModal.module.css';
import { ICommonProps } from './types';

const Common = ({ isLoading, requirementsDescription, canJoin, onNext, onBack, children }: ICommonProps) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>Poll Requirements</h3>
        <p className={styles.stepDescription}>
          Review the requirements for this poll and ensure you meet all criteria before joining.
        </p>
      </div>

      <div className={styles.stepBody}>
        {/* Requirements Description */}
        <div className={styles.requirementsSection}>
          <h4 className={styles.requirementsTitle}>Eligibility Requirements</h4>
          <div className={styles.requirementsText}>{requirementsDescription}</div>
        </div>

        {/* Policy-Specific Component */}
        <div className={styles.policyWrapper}>{children}</div>

        {!canJoin && (
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(235, 87, 87, 0.1)',
              border: '1px solid rgba(235, 87, 87, 0.2)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          >
            <strong>Unable to join:</strong> Please ensure you meet all the requirements listed above before attempting
            to join this poll.
          </div>
        )}
      </div>

      <div className={styles.stepFooter}>
        <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onBack}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
            <path
              d='M10 12L6 8L10 4'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          Back
        </button>

        <button
          className={`${styles.button} ${canJoin ? styles.primaryButton : styles.secondaryButton}`}
          onClick={onNext}
          disabled={!canJoin || isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.loader}></div>
              Checking...
            </>
          ) : (
            <>
              Continue
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path
                  d='M6 12L10 8L6 4'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Common;
