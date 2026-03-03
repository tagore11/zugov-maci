'use client';

import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { MerklePolicyData } from '@/services/decode/types';
import { MerkleTreeManager } from '@/services/MerkleTreeManager';
import TreeUrlResolver from '@/services/TreeUrlResolver';
import { PollPolicyType } from '@/types';
import { notification } from '@/utils/notification';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { useAccount } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';

interface TreeValidationState {
  isValidating: boolean;
  isValid: boolean;
  error: string;
  errorType?: 'ADDRESS_NOT_FOUND' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN';
  treeMetadata?: {
    totalLeaves: number;
    treeDepth: number;
    generatedAt: string;
  };
}

const MerkleProofPolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationState, setValidationState] = useState<TreeValidationState>({
    isValidating: false,
    isValid: false,
    error: ''
  });
  const [userProof, setUserProof] = useState<string[]>([]);

  const { isConnected, address } = useAccount();
  const { hasJoinedPoll } = usePollContext();

  // Create MerkleTreeManager instance
  const merkleManager = useMemo(() => new MerkleTreeManager(), []);

  // Extract Merkle policy data
  const decodedPolicyData = useDecodeService<MerklePolicyData>(PollPolicyType.MerkleProof, policyData);
  const merkleRoot = decodedPolicyData?.merkleRoot || '0x';
  const merkleTreeVersion = decodedPolicyData?.merkleTreeVersion || '0.0.0';
  const merkleTreeUrl = decodedPolicyData?.merkleTreeUrl || '';

  const requirementsDescription = `This poll requires your address to be included in the Merkle tree`;

  // Retry validation
  const retryValidation = useCallback(() => {
    if (address && merkleTreeUrl && merkleRoot) {
      validateUserInTree();
    }
  }, [address, merkleTreeUrl, merkleRoot]);

  // Fetch and validate tree data
  const validateUserInTree = useCallback(async () => {
    if (!address || !merkleTreeUrl || !merkleRoot) {
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, error: '' }));

    try {
      // Validate version support
      if (!TreeUrlResolver.isSupportedVersion(merkleTreeVersion)) {
        console.warn(
          `Unsupported tree version: ${merkleTreeVersion}. Supported versions: ${TreeUrlResolver.getSupportedVersions().join(', ')}`
        );
      }

      // Resolve tree URL based on version
      const resolvedUrl = TreeUrlResolver.resolveTreeUrl(merkleTreeVersion, merkleTreeUrl);

      // Fetch tree.json from the resolved URL
      const response = await fetch(resolvedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch tree data from ${resolvedUrl}: ${response.statusText}`);
      }

      const treeData = await response.json();

      // Create tree from JSON data
      const tree = merkleManager.createTreeFromJSON(treeData);

      // Check if the provided root matches the tree root
      if (tree.root !== merkleRoot) {
        throw new Error('Tree root mismatch with policy data');
      }

      // Generate proof for the user
      const proof = merkleManager.getProof(address);
      setUserProof(proof);

      // Verify the proof (additional validation)
      const isProofValid = merkleManager.verifyProof(address, proof);
      if (!isProofValid) {
        throw new Error('Generated proof verification failed');
      }

      setValidationState({
        isValidating: false,
        isValid: true,
        error: '',
        errorType: undefined,
        treeMetadata: treeData.metadata
      });
    } catch (error) {
      console.error('Tree validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Determine error type based on error message
      let errorType: 'ADDRESS_NOT_FOUND' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN' = 'UNKNOWN';

      if (
        errorMessage.includes('not found in the Merkle tree') ||
        errorMessage.includes("Make sure it's in the whitelist")
      ) {
        errorType = 'ADDRESS_NOT_FOUND';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
        errorType = 'NETWORK_ERROR';
      } else if (
        errorMessage.includes('validation') ||
        errorMessage.includes('mismatch') ||
        errorMessage.includes('verification')
      ) {
        errorType = 'VALIDATION_ERROR';
      }

      setValidationState({
        isValidating: false,
        isValid: false,
        error: errorMessage,
        errorType
      });
    }
  }, [address, merkleTreeUrl, merkleRoot, merkleManager]);

  // Handle form submission
  const handleNext = useCallback(async () => {
    if (!address || userProof.length === 0) {
      notification.error('Unable to proceed: Address not found in Merkle tree');
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

      // Encode the Merkle proof as signup data
      // The proof is an array of hex strings representing the Merkle path
      const encodedProof = encodeAbiParameters(parseAbiParameters('bytes32[]'), [userProof as `0x${string}`[]]);

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
  }, [address, userProof, isConnected, hasJoinedPoll, setSignupState, onNext]);

  // Update canJoin state
  useEffect(() => {
    const canJoin = isConnected && !hasJoinedPoll && validationState.isValid;
    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, hasJoinedPoll, validationState.isValid, setSignupState]);

  // Validate user when component mounts or dependencies change
  useEffect(() => {
    if (address && merkleTreeUrl && merkleRoot) {
      validateUserInTree();
    }
  }, [validateUserInTree]);

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
          <Image src='/icons/merkle-icon.svg' alt='Merkle Tree' width={28} height={28} className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>Merkle Tree Verification</h4>
          <span className={styles.policySubtitle}>Address Allowlist Required</span>
        </div>
      </div>

      {/* <div className={styles.policyDetails}>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Merkle Root:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{merkleRoot}</span>
        </div>
      </div> */}

      <div className={styles.merkleValidationSection}>
        <div className={styles.merkleSectionHeader}>
          <h5>Address Verification</h5>
          {validationState.isValidating && (
            <div className={styles.merkleValidatingIndicator}>
              <div className={styles.merkleSpinner}></div>
              <span>Validating...</span>
            </div>
          )}
        </div>

        {validationState.error && validationState.errorType === 'ADDRESS_NOT_FOUND' && (
          <div className={styles.merkleNotFoundMessage}>
            <div className={styles.merkleNotFoundContent}>
              <strong>🚫 Address Not Whitelisted</strong>
              <p>
                Your address ({address?.slice(0, 6)}...{address?.slice(-4)}) is not included in the Merkle tree for this
                poll.
              </p>
              <div className={styles.merkleNotFoundActions}>
                <div className={styles.merkleNotFoundSuggestions}>
                  <h6>What you can do:</h6>
                  <ul>
                    <li>Verify you're using the correct wallet address</li>
                    <li>Check if you have another eligible address</li>
                  </ul>
                </div>
                <button className={styles.retryButton} onClick={retryValidation} title='Retry validation'>
                  🔄 Retry Validation
                </button>
              </div>
            </div>
          </div>
        )}

        {validationState.error && validationState.errorType === 'NETWORK_ERROR' && (
          <div className={styles.merkleErrorMessage}>
            <div className={styles.merkleErrorContent}>
              <strong>🌐 Network Error</strong>
              <p>Failed to fetch tree data. Please check your internet connection.</p>
              <button className={styles.retryButton} onClick={retryValidation} title='Retry validation'>
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {validationState.error && validationState.errorType === 'VALIDATION_ERROR' && (
          <div className={styles.merkleErrorMessage}>
            <div className={styles.merkleErrorContent}>
              <strong>⚠️ Validation Error</strong>
              <p>{validationState.error}</p>
              <button className={styles.retryButton} onClick={retryValidation} title='Retry validation'>
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {validationState.error && (!validationState.errorType || validationState.errorType === 'UNKNOWN') && (
          <div className={styles.merkleErrorMessage}>
            <div className={styles.merkleErrorContent}>
              <strong>❌ Validation Failed</strong>
              <p>{validationState.error}</p>
              <button className={styles.retryButton} onClick={retryValidation} title='Retry validation'>
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {validationState.isValid && (
          <div className={styles.merkleSuccessMessage}>
            <div className={styles.merkleSuccessContent}>
              <strong>✅ Address Verified 🎉</strong>
              <p>Your address is included in the Merkle tree. You can join this poll!</p>
              {userProof.length > 0 && (
                <div className={styles.merkleProofInfo}>
                  <span>Proof Length: {userProof.length} nodes</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* {validationState.treeMetadata && (
          <div className={styles.merkleTreeMetadata}>
            <h6>Tree Information</h6>
            <div className={styles.merkleMetadataGrid}>
              <div className={styles.merkleMetadataItem}>
                <span className={styles.merkleMetadataLabel}>Total Addresses:</span>
                <span className={styles.merkleMetadataValue}>{validationState.treeMetadata.totalLeaves}</span>
              </div>
              <div className={styles.merkleMetadataItem}>
                <span className={styles.merkleMetadataLabel}>Tree Depth:</span>
                <span className={styles.merkleMetadataValue}>{validationState.treeMetadata.treeDepth}</span>
              </div>
            </div>
          </div>
        )} */}

        {!validationState.isValidating && !validationState.error && !validationState.isValid && (
          <div className={styles.merkleHelpText}>
            <p>Connect your wallet to verify if your address is included in the Merkle tree for this poll.</p>
          </div>
        )}
      </div>
    </Common>
  );
};

export default MerkleProofPolicy;
