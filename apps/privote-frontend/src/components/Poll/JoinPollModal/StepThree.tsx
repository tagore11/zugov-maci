'use client';
import React from 'react';
import { ISignupState } from './JoinPollModal';
import styles from './JoinPollModal.module.css';

interface StepThreeProps {
  signupState: ISignupState;
  isLoading: boolean;
  onJoinPoll: () => void;
  onBack: () => void;
}

export const StepThree: React.FC<StepThreeProps> = ({ signupState, isLoading, onJoinPoll, onBack }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>Ready to Join</h3>
        <p className={styles.stepDescription}>
          You&apos;re all set! Click the button below to join this poll and start participating.
        </p>
      </div>

      <div className={styles.stepBody}>
        {/* Join Summary */}
        <div className={styles.joinSummary}>
          <h4 className={styles.summaryTitle}>
            <svg width='20' height='20' viewBox='0 0 20 20' fill='none' style={{ marginRight: '8px' }}>
              <path
                d='M16.25 6.25L7.5 15L3.75 11.25'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Everything Ready
          </h4>
          <p className={styles.summaryText}>
            You have successfully registered with Privote and meet all the requirements for this poll. Once you join,
            you&apos;ll be able to cast your vote anonymously.
          </p>
        </div>

        {/* What happens next */}
        <div className={styles.nextStepsSection}>
          <h4 className={styles.nextStepsTitle}>
            <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
              <path d='M10 2L13 8L20 9L15 14L16 21L10 18L4 21L5 14L0 9L7 8L10 2Z' fill='currentColor' />
            </svg>
            What happens when you join?
          </h4>
          <ul className={styles.nextStepsList}>
            <li>Your participation will be recorded anonymously</li>
            <li>You&apos;ll gain voting rights for this specific poll</li>
            <li>Your vote will be completely private and verifiable</li>
            <li>You can cast your vote anytime before the poll ends</li>
          </ul>
        </div>
      </div>

      <div className={styles.stepFooter}>
        <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onBack} disabled={isLoading}>
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
          className={`${styles.button} ${signupState.canJoin ? styles.primaryButton : styles.secondaryButton}`}
          onClick={onJoinPoll}
          disabled={!signupState.canJoin || isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.loader}></div>
              Joining Poll...
            </>
          ) : (
            <>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path d='M8 1V15M1 8H15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
              </svg>
              Join Poll
            </>
          )}
        </button>
      </div>
    </div>
  );
};
