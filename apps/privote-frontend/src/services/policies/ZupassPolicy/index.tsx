'use client';

import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { ZupassPolicyData } from '@/services/decode/types';
import { PollPolicyType } from '@/types';
import { notification } from '@/utils/notification';
import { EdDSAPublicKey, generateWitness } from '@/utils/zupass';
import { decStringToBigIntToUuid, uuidToBigInt } from '@pcd/util';
import { ZKEdDSAEventTicketPCD, ZKEdDSAEventTicketPCDPackage } from '@pcd/zk-eddsa-event-ticket-pcd';
import { zuAuthPopup } from '@pcd/zuauth';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { useAccount } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';
import { ZUPASS_DEVCON_DEFAULTS } from '@/utils/constants';

const DEVCON_POLICY = {
  eventId: uuidToBigInt(ZUPASS_DEVCON_DEFAULTS.eventId).toString(),
  signer1: BigInt(ZUPASS_DEVCON_DEFAULTS.signer1),
  signer2: BigInt(ZUPASS_DEVCON_DEFAULTS.signer2)
};

const ZupassPolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [hasProof, setHasProof] = useState(false);
  const [zupassProof, setZupassProof] = useState<ZKEdDSAEventTicketPCD | null>(null);

  const { isConnected, address } = useAccount();
  const { hasJoinedPoll } = usePollContext();

  // Extract Zupass policy data
  const decodedPolicyData = useDecodeService<ZupassPolicyData>(PollPolicyType.Zupass, policyData);
  const eventId = decodedPolicyData?.eventId || 0n;
  const signer1 = decodedPolicyData?.signer1 || 0n;
  const signer2 = decodedPolicyData?.signer2 || 0n;
  const zupassVerifier = decodedPolicyData?.zupassVerifier || '0x';

  const isDevconPolicy =
    eventId.toString() === DEVCON_POLICY.eventId &&
    signer1 === DEVCON_POLICY.signer1 &&
    signer2 === DEVCON_POLICY.signer2;

  // Convert signer BigInts to hex strings for EdDSA public key
  const publicKey: EdDSAPublicKey = [signer1.toString(16).padStart(64, '0'), signer2.toString(16).padStart(64, '0')];

  const requirementsDescription = `This poll requires you to have a valid Zupass ticket for the specified event`;

  // Handle Zupass proof generation
  const handleGenerateProof = useCallback(async () => {
    if (!address || !isConnected) {
      notification.error('Please connect your wallet first');
      return;
    }

    setIsGeneratingProof(true);

    try {
      // Convert eventId from BigInt to UUID format
      let eventIdUuid = decStringToBigIntToUuid(eventId.toString());
      // eventIdUuid="3f664442-cdc8-41ab-af0c-3a79b8fa94bd";
      //     console.log('eventIdUuid', eventIdUuid);

      // Open Zupass popup for authentication
      const result = await zuAuthPopup({
        fieldsToReveal: {
          revealTicketId: true,
          revealEventId: true
        },
        watermark: address, // Bind proof to user's wallet address
        config: [
          {
            pcdType: 'eddsa-ticket-pcd',
            publicKey: publicKey,
            eventId: eventIdUuid,
            eventName: 'Devcon SEA' // Generic name, can be customized
          }
        ]
      });

      // Process the result
      if (result.type === 'pcd') {
        const parsedPCD = JSON.parse(result.pcdStr);
        const pcd = await ZKEdDSAEventTicketPCDPackage.deserialize(parsedPCD.pcd);

        setZupassProof(pcd);
        setHasProof(true);
        notification.success('Zupass proof generated successfully!');
      } else {
        notification.error('Proof generation cancelled or failed');
      }
    } catch (error) {
      console.error('Zupass proof generation error:', error);
      notification.error(error instanceof Error ? error.message : 'Failed to generate Zupass proof');
    } finally {
      setIsGeneratingProof(false);
    }
  }, [address, isConnected, eventId, publicKey]);

  // Handle form submission
  const handleNext = useCallback(async () => {
    if (!zupassProof) {
      notification.error('Please generate a Zupass proof first');
      return;
    }

    setIsLoading(true);

    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (hasJoinedPoll) {
        throw new Error('Already registered for this poll');
      }

      // Generate witness from the PCD
      const witness = generateWitness(zupassProof);

      // Encode the proof for the smart contract
      const encodedProof = encodeAbiParameters(
        parseAbiParameters('uint256[2], uint256[2][2], uint256[2], uint256[38]'),
        [
          witness._pA as [bigint, bigint],
          witness._pB as [[bigint, bigint], [bigint, bigint]],
          witness._pC as [bigint, bigint],
          witness._pubSignals as [
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            bigint
          ]
        ]
      );

      // Update signup state with the encoded proof
      setSignupState(prev => ({
        ...prev,
        data: encodedProof
      }));

      // Proceed to next step
      onNext();
    } catch (error) {
      console.error('Signup error:', error);
      notification.error(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  }, [zupassProof, isConnected, hasJoinedPoll, setSignupState, onNext]);

  // Update canJoin state
  useEffect(() => {
    const canJoin = isConnected && !hasJoinedPoll && hasProof;
    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, hasJoinedPoll, hasProof, setSignupState]);

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
          <Image src='/icons/zupass-icon.png' alt='Zupass' width={28} height={28} className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>{isDevconPolicy ? 'Devcon Verification' : 'Zupass Verification'}</h4>
          <span className={styles.policySubtitle}>Event Ticket Required</span>
        </div>
      </div>

      {/* Proof Generation Section */}
      <div className={styles.merkleValidationSection}>
        <div className={styles.merkleSectionHeader}>
          <h5>Proof Generation</h5>
          {isGeneratingProof && (
            <div className={styles.merkleValidatingIndicator}>
              <div className={styles.merkleSpinner}></div>
              <span>Generating proof...</span>
            </div>
          )}
        </div>

        {!hasProof && !isGeneratingProof && (
          <div className={styles.merkleHelpText}>
            <p>Click the button below to open Zupass and generate your zero-knowledge proof.</p>
            <button
              type='button'
              onClick={handleGenerateProof}
              className={styles.retryButton}
              disabled={!isConnected}
              style={{ marginTop: '1rem' }}
            >
              🎫 Generate Zupass Proof
            </button>
          </div>
        )}

        {hasProof && (
          <div className={styles.merkleSuccessMessage}>
            <div className={styles.merkleSuccessContent}>
              <strong>✅ Proof Generated Successfully! 🎉</strong>
              <p>Your Zupass proof has been verified. You can now join this poll!</p>
              <div className={styles.merkleProofInfo}>
                <span>Proof Type: EdDSA Event Ticket PCD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Common>
  );
};

export default ZupassPolicy;
