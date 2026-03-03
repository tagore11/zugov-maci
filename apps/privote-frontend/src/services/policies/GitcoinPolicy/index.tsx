'use client';

import passportDecoderAbi from '@/abi/gitcoinPassportDecoder';
import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { GitcoinPassportPolicyData } from '@/services/decode/types';
import { PollPolicyType } from '@/types';
import { DEFAULT_SG_DATA } from '@/utils/constants';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';

const GitcoinPolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const FACTOR = BigInt(100);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, address } = useAccount();
  const { isRegistered } = usePollContext();

  // Extract token tokenAddress and threshold from policyData
  const decodedPolicyData = useDecodeService<GitcoinPassportPolicyData>(PollPolicyType.GitcoinPassport, policyData);
  const decoderAddress = decodedPolicyData?.passportDecoder || '0x';
  const threshold = decodedPolicyData?.thresholdScore ? parseFloat(formatEther(decodedPolicyData.thresholdScore)) : 0;
  const requirementsDescription = `This poll requires you to have at least ${threshold} score on Gitcoin Passport decoder ${decoderAddress}`;

  // Get user's token balance
  const { data: score } = useReadContract({
    abi: passportDecoderAbi,
    address: decoderAddress as `0x${string}`,
    functionName: 'getScore',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!decoderAddress && decoderAddress !== '0x'
    }
  });

  const userScore = score ? parseFloat(formatEther(score / FACTOR)) : 0;

  const handleNext = () => {
    setIsLoading(true);

    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (isRegistered) {
        throw new Error('Already registered');
      }

      if (!decoderAddress || decoderAddress === '0x') {
        throw new Error('Invalid decoder address');
      }

      if (userScore < threshold) {
        throw new Error(
          `Insufficient score. You need to have at least ${threshold} score on Gitcoin Passport decoder ${decoderAddress}`
        );
      }

      // For ERC20 policy, we just use the default signup data
      setSignupState(prev => ({ ...prev, data: DEFAULT_SG_DATA }));
      onNext();
    } catch (error) {
      console.error('Error generating ERC20 policy signup data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const canJoin = isConnected && !isRegistered && userScore >= threshold && decoderAddress !== '0x';
    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, isRegistered, userScore, threshold, decoderAddress, setSignupState]);

  return (
    <Common
      canJoin={signupState.canJoin}
      requirementsDescription={requirementsDescription}
      isLoading={isLoading}
      onNext={handleNext}
      onBack={onBack}
    >
      <div className={styles.policyHeader}>
        <div className={styles.policyIconWrapper}>
          <Image src='/passport-icon.svg' width={24} height={24} alt='ERC20' className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>Gitcoin Passport Access</h4>
          <span className={styles.policySubtitle}>Gitcoin Passport Required</span>
        </div>
      </div>

      <div className={styles.policyDetails}>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Decoder Contract:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{decoderAddress}</span>
        </div>

        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Threshold Score:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{threshold}</span>
        </div>
      </div>

      {/* Balance Information */}
      <div className={styles.balanceInfo}>
        <span className={styles.balanceLabel}>Your Score:</span>
        <span className={styles.balanceValue}>{userScore.toLocaleString()}</span>
      </div>

      {/* Balance Status */}
      <div className={`${styles.balanceStatus} ${userScore >= threshold ? styles.sufficient : styles.insufficient}`}>
        {userScore >= threshold ? (
          <>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' style={{ marginRight: '8px' }}>
              <path
                d='M13.5 4.5L6 12L2.5 8.5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            You meet the minimum score requirement
          </>
        ) : (
          <>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' style={{ marginRight: '8px' }}>
              <path
                d='M15 5L5 15M5 5L15 15'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Insufficient gitcoin passport score. You need {(threshold - userScore).toLocaleString()} more score
          </>
        )}
      </div>
    </Common>
  );
};

export default GitcoinPolicy;
