'use client';

import VotesAbi from '@/abi/votes';
import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { ERC20VotesPolicyData } from '@/services/decode/types';
import { PollPolicyType } from '@/types';
import { DEFAULT_SG_DATA } from '@/utils/constants';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';

const ERC20VotesPolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, address } = useAccount();
  const { isRegistered } = usePollContext();

  // Extract token tokenAddress and threshold from policyData
  const decodedPolicyData = useDecodeService<ERC20VotesPolicyData>(PollPolicyType.ERC20Votes, policyData);
  const tokenAddress = decodedPolicyData?.token?.address || '0x';
  const threshold = decodedPolicyData?.threshold ? parseFloat(formatEther(decodedPolicyData.threshold)) : 0;
  const snapshotBlock = decodedPolicyData?.snapshotBlock || BigInt(0);
  const requirementsDescription = `This poll requires you to have at least ${threshold} tokens at block ${snapshotBlock}`;

  // Get user's token balance
  const { data: pastVotesAtSnapshotBlock } = useReadContract({
    abi: VotesAbi,
    address: tokenAddress as `0x${string}`,
    functionName: 'getPastVotes',
    args: [address as `0x${string}`, snapshotBlock],
    query: {
      enabled: !!address && !!tokenAddress && tokenAddress !== '0x' && !!snapshotBlock
    }
  });

  const userBalance = pastVotesAtSnapshotBlock ? parseFloat(formatEther(pastVotesAtSnapshotBlock)) : 0;

  const handleNext = () => {
    setIsLoading(true);

    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (isRegistered) {
        throw new Error('Already registered');
      }

      if (!tokenAddress || tokenAddress === '0x') {
        throw new Error('Invalid token address');
      }

      if (userBalance < threshold) {
        throw new Error(`Insufficient token balance. You need at least ${threshold} tokens at block ${snapshotBlock}`);
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
    const canJoin =
      isConnected && !isRegistered && userBalance >= threshold && tokenAddress !== '0x' && snapshotBlock !== BigInt(0);
    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, isRegistered, userBalance, threshold, tokenAddress, snapshotBlock, setSignupState]);

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
          <Image src='/icons/token-icon.svg' width={24} height={24} alt='ERC20' className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>Token-Based Access</h4>
          <span className={styles.policySubtitle}>ERC20 Votes Required</span>
        </div>
      </div>

      <div className={styles.policyDetails}>
        {decodedPolicyData?.token?.name && (
          <div className={styles.policyDetailRow}>
            <span className={styles.detailLabel}>Token:</span>
            <span className={styles.detailValue}>
              {decodedPolicyData.token.name} {decodedPolicyData.token?.symbol && `(${decodedPolicyData.token.symbol})`}
            </span>
          </div>
        )}
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Contract:</span>
          <span className={styles.detailValue}>
            <span className={styles.addressText}>{tokenAddress}</span>
          </span>
        </div>
        {decodedPolicyData?.threshold && (
          <div className={styles.policyDetailRow}>
            <span className={styles.detailLabel}>Required:</span>
            <span className={styles.detailValue}>
              <span className={styles.highlight}>
                {formatEther(decodedPolicyData.threshold)} {decodedPolicyData.token?.symbol || 'tokens'}
              </span>{' '}
              minimum{snapshotBlock ? ` at block ${snapshotBlock}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Balance Information */}
      <div className={styles.balanceInfo}>
        <span className={styles.balanceLabel}>Your Balance:</span>
        <span className={styles.balanceValue}>
          {userBalance.toLocaleString()} {decodedPolicyData?.token?.symbol || 'tokens'}
        </span>
      </div>

      {/* Balance Status */}
      <div className={`${styles.balanceStatus} ${userBalance >= threshold ? styles.sufficient : styles.insufficient}`}>
        {userBalance >= threshold ? (
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
            You meet the minimum balance requirement
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
            Insufficient balance. You need {(threshold - userBalance).toLocaleString()} more tokens
          </>
        )}
      </div>
    </Common>
  );
};

export default ERC20VotesPolicy;
