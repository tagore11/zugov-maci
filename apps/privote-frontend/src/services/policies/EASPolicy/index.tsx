'use client';
import useAppConstants from '@/hooks/useAppConstants';
import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { EASPolicyData } from '@/services/decode/types';
import { GET_ATTESTATIONS_QUERY } from '@/services/queries/eas';
import { PollPolicyType } from '@/types';
import { request } from 'graphql-request';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { encodeAbiParameters, Hex, parseAbiParameters } from 'viem';
import { useAccount } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';

/**
 * Component for handling EAS policy
 */
const EASPolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [attestationId, setAttestationId] = useState('');
  const [isAutoDiscovering, setIsAutoDiscovering] = useState(false);
  const [autoDiscoveryError, setAutoDiscoveryError] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [networkSupported, setNetworkSupported] = useState(true);

  const { isConnected, address, chainId } = useAccount();
  const { isRegistered } = usePollContext();
  const { slugs } = useAppConstants();

  // Extract EAS policy data
  const decodedPolicyData = useDecodeService<EASPolicyData>(PollPolicyType.EAS, policyData);
  const easAddress = decodedPolicyData?.easAddress || '0x';
  const attesterAddress = decodedPolicyData?.attesterAddress || '0x';
  const schema = decodedPolicyData?.schema || '0x';
  const requirementsDescription = `This poll requires you to have a valid attestation for schema ${schema.slice(0, 10)}... by attester ${attesterAddress.slice(0, 10)}...`;

  // Check if current network is supported
  useEffect(() => {
    if (chainId) {
      const supported = !!slugs.eas;
      setNetworkSupported(supported);
      if (!supported) {
        setManualEntry(true);
        setAutoDiscoveryError(
          'Auto-discovery is not supported on this network. Please enter the attestation ID manually.'
        );
      }
    }
  }, [chainId, slugs.eas]);

  // Auto-discover attestation ID
  const autoDiscoverAttestation = async () => {
    if (!chainId || !address || !networkSupported) return;

    setIsAutoDiscovering(true);
    setAutoDiscoveryError('');

    try {
      const gqlUrl = `https://${slugs.eas}.easscan.org/graphql`;

      const variables = {
        where: {
          attester: { equals: attesterAddress },
          schemaId: { equals: schema.toLowerCase() },
          recipient: { equals: address }
        }
      };

      const response = (await request(gqlUrl, GET_ATTESTATIONS_QUERY, variables)) as {
        attestations: Array<{ id: string; time: string }>;
      };

      if (response.attestations && response.attestations.length > 0) {
        const latestAttestation = response.attestations[0];
        setAttestationId(latestAttestation.id);
        setAutoDiscoveryError('');
      } else {
        setAutoDiscoveryError('No attestations found for your address with the required schema and attester.');
        setManualEntry(true);
      }
    } catch (error) {
      console.error('Error fetching attestations:', error);
      setAutoDiscoveryError('Failed to fetch attestations. Please enter the attestation ID manually.');
      setManualEntry(true);
    } finally {
      setIsAutoDiscovering(false);
    }
  };

  // Handle form submission
  const handleNext = async () => {
    if (!attestationId.trim()) {
      setAutoDiscoveryError('Please provide an attestation ID.');
      return;
    }

    setIsLoading(true);

    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (isRegistered) {
        throw new Error('Already registered');
      }

      // For EAS policy, we use the attestation ID as signup data
      const encodedData = encodeAbiParameters(parseAbiParameters('bytes32'), [attestationId as Hex]);
      setSignupState(prev => ({
        ...prev,
        data: encodedData
      }));

      onNext();
    } catch (error) {
      console.error('Error generating EAS policy signup data:', error);
      setAutoDiscoveryError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Update canJoin state
  useEffect(() => {
    const canJoin = isConnected && !isRegistered && attestationId.trim().length > 0;

    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, isRegistered, attestationId, setSignupState]);

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
          <Image src='/icons/eas-icon.png' width={28} height={28} alt='EAS' className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>EAS Attestation Required</h4>
          <span className={styles.policySubtitle}>Ethereum Attestation Service</span>
        </div>
      </div>

      <div className={styles.policyDetails}>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>EAS Contract:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{easAddress}</span>
        </div>

        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Attester:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{attesterAddress}</span>
        </div>

        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Schema:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{schema}</span>
        </div>
      </div>

      <div className={styles.easAttestationSection}>
        <div className={styles.easSectionHeader}>
          <h5>Attestation ID</h5>
          {networkSupported && !manualEntry && (
            <button
              type='button'
              onClick={autoDiscoverAttestation}
              disabled={isAutoDiscovering || !isConnected}
              className={styles.easAutoDiscoverBtn}
            >
              {isAutoDiscovering ? (
                <>
                  <div className={styles.easSpinner}></div>
                  Discovering...
                </>
              ) : (
                'Auto-discover'
              )}
            </button>
          )}
        </div>

        <div className={styles.easInputWrapper}>
          <input
            type='text'
            value={attestationId}
            onChange={e => setAttestationId(e.target.value)}
            placeholder='Enter attestation ID or use auto-discovery'
            className={styles.easAttestationInput}
            disabled={isAutoDiscovering}
          />
        </div>

        {!networkSupported && (
          <div className={styles.easNetworkWarning}>
            <div className={styles.easWarningIcon}>⚠️</div>
            <div className={styles.easWarningText}>
              <strong>Network Not Supported</strong>
              <p>Auto-discovery is not available on this network. Please manually enter your attestation ID.</p>
            </div>
          </div>
        )}

        {autoDiscoveryError && (
          <div className={styles.easErrorMessage}>
            <div className={styles.easErrorIcon}>❌</div>
            <span>{autoDiscoveryError}</span>
          </div>
        )}

        {!manualEntry && networkSupported && (
          <div className={styles.easHelpText}>
            <p>
              Click &quot;Auto-discover&quot; to automatically find your latest attestation, or enter the attestation ID
              manually.
            </p>
          </div>
        )}

        {manualEntry && (
          <div className={styles.easManualEntryNote}>
            <div className={styles.easInfoIcon}>ℹ️</div>
            <span>Please enter your attestation ID manually.</span>
          </div>
        )}
      </div>
    </Common>
  );
};

export default EASPolicy;
