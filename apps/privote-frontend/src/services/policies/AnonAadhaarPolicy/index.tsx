'use client';

import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { AnonAadhaarPolicyData } from '@/services/decode/types';
import { PollPolicyType } from '@/types';
import { notification } from '@/utils/notification';
import { LogInWithAnonAadhaar, useAnonAadhaar } from '@anon-aadhaar/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { useAccount } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';

const AnonAadhaarPolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const requirementsDescription = 'AnonAadhaar verification required to join this poll';
  const [isLoading, setIsLoading] = useState(false);
  const [anonAadhaar] = useAnonAadhaar();
  const { isConnected, address } = useAccount();
  const { hasJoinedPoll } = usePollContext();

  // Extract nullifierSeed from policyData or use default
  const decodedPolicyData = useDecodeService<AnonAadhaarPolicyData>(PollPolicyType.AnonAadhaar, policyData);
  const nullifierSeed = decodedPolicyData?.nullifierSeed ?? 4534n;

  const handleNext = () => {
    setIsLoading(true);

    try {
      if (anonAadhaar.status !== 'logged-in') {
        throw new Error('AnonAadhaar verification required');
      }

      // Get the first proof from the array
      const proofKeys = Object.keys(anonAadhaar.anonAadhaarProofs);
      if (proofKeys.length === 0) {
        throw new Error('AnonAadhaar proof not found');
      }

      const firstProofKey = proofKeys[0];
      const pcd = anonAadhaar.anonAadhaarProofs[Number(firstProofKey)]?.pcd;

      if (!pcd) {
        throw new Error('AnonAadhaar proof not found');
      }

      const parsedPCD = JSON.parse(pcd);
      const { ageAbove18, gender, pincode, state, nullifier, groth16Proof, timestamp } = parsedPCD.proof;

      const revealArray: [bigint, bigint, bigint, bigint] = [
        BigInt(ageAbove18),
        BigInt(gender),
        BigInt(pincode),
        BigInt(state)
      ];

      const groth16Proof8: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] = [
        BigInt(groth16Proof.pi_a[0]),
        BigInt(groth16Proof.pi_a[1]),
        BigInt(groth16Proof.pi_b[0][1]),
        BigInt(groth16Proof.pi_b[0][0]),
        BigInt(groth16Proof.pi_b[1][1]),
        BigInt(groth16Proof.pi_b[1][0]),
        BigInt(groth16Proof.pi_c[0]),
        BigInt(groth16Proof.pi_c[1])
      ];

      const encodedData = encodeAbiParameters(
        parseAbiParameters(
          'uint256 nullifierSeed, uint256 nullifier, uint256 timestamp, uint256 signal, uint256[4] revealArray, uint256[8] groth16Proof'
        ),
        [BigInt(nullifierSeed), nullifier, timestamp, BigInt(address || '0'), revealArray, groth16Proof8]
      );

      setSignupState(prev => ({ ...prev, data: encodedData }));
      onNext();
    } catch (error) {
      console.error('Error generating AnonAadhaar signup data:', error);
      notification.error('Error generating AnonAadhaar signup data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const canJoin = isConnected && !hasJoinedPoll && anonAadhaar.status === 'logged-in';
    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, hasJoinedPoll, anonAadhaar.status, setSignupState]);

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
          <Image src='/icons/aadhaar-icon.svg' alt='Aadhaar' width={28} height={28} className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>AnonAadhaar Verification</h4>
          <span className={styles.policySubtitle}>Identity Verification Required</span>
        </div>
      </div>

      <div className={styles.policyDetails}>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Verification:</span>
          <span className={styles.detailValue}>
            Anonymous <span className={styles.highlight}>Aadhaar proof</span>
          </span>
        </div>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Privacy:</span>
          <span className={styles.detailValue}>Zero-knowledge proof system</span>
        </div>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Data Shared:</span>
          <span className={styles.detailValue}>No personal information revealed</span>
        </div>
      </div>

      {/* Verification Status */}
      <div
        className={`${styles.statusIndicator} ${anonAadhaar.status === 'logged-in' ? styles.success : styles.warning}`}
      >
        {anonAadhaar.status === 'logged-in' ? (
          <>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <path
                d='M13.5 4.5L6 12L2.5 8.5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            AnonAadhaar verification completed
          </>
        ) : (
          <>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <circle cx='8' cy='8' r='7' stroke='currentColor' strokeWidth='2' fill='none' />
              <path d='M8 5v3' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
              <circle cx='8' cy='11' r='1' fill='currentColor' />
            </svg>
            Verification required to join this poll
          </>
        )}
      </div>

      {/* Information about AnonAadhaar */}
      <div className={styles.anonAadhaarDescription}>
        <strong>About AnonAadhaar:</strong> This verification system allows you to prove your Indian identity
        anonymously without revealing any personal information. Your Aadhaar details remain completely private.
      </div>

      {/* AnonAadhaar Login Component */}
      <div className={styles.anonAadhaarWrapper}>
        <LogInWithAnonAadhaar nullifierSeed={nullifierSeed} signal={address} />
      </div>
    </Common>
  );
};

export default AnonAadhaarPolicy;
