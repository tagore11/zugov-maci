'use client';

import useAppConstants from '@/hooks/useAppConstants';
import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { SemaphorePolicyData } from '@/services/decode/types';
import { PollPolicyType } from '@/types';
import { getInfuraHttpUrl } from '@/utils/networks';
import { notification } from '@/utils/notification';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { encodeAbiParameters } from 'viem';
import { useAccount } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';
import { createScope } from '../utils';

// Semaphore imports
import { Group, Identity, generateProof, verifyProof, type SemaphoreProof } from '@semaphore-protocol/core';
import { SemaphoreViem } from '@semaphore-protocol/data';

type InputMode = 'proof' | 'privateKey';

const SemaphorePolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('proof');
  const [proofData, setProofData] = useState<SemaphoreProof | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [fileName, setFileName] = useState('');

  const { isConnected, address, chainId } = useAccount();
  const { isRegistered } = usePollContext();
  const { contracts } = useAppConstants();

  // Extract semaphore policy data
  const decodedPolicyData = useDecodeService<SemaphorePolicyData>(PollPolicyType.Semaphore, policyData);
  const semaphoreContract = decodedPolicyData?.semaphore || '0x';
  const groupId = decodedPolicyData?.groupId || BigInt(0);
  const requirementsDescription = `This poll requires you to be a member of Semaphore group ${groupId} on contract ${semaphoreContract.slice(0, 10)}...`;

  // Generate proof from private key
  const generateProofFromPrivateKey = async () => {
    if (!address || !chainId) {
      setError('Please Connect your wallet');
      notification.error('Please connect your wallet!');
      return;
    }

    if (!privateKey.trim()) {
      setError('Please provide a private key');
      return;
    }

    setIsGeneratingProof(true);
    setError('');

    try {
      // Create identity from private key
      const identity = Identity.import(privateKey);
      const identityCommitment = identity.commitment;

      // Initialize Semaphore viem
      const rpcUrl = getInfuraHttpUrl(chainId);
      const semaphoreViem = new SemaphoreViem(rpcUrl, {
        address: contracts.semaphore
      });

      // Check if identity is a member of the group
      const isMember = await semaphoreViem.isGroupMember(groupId.toString(), identityCommitment.toString());

      // return early if identity is not a member
      if (!isMember) {
        setError('You are not a member of the group');
        return;
      }

      // get group members from using semaphore viem
      const members = await semaphoreViem.getGroupMembers(groupId.toString());

      // create off-chain group
      const group = new Group(members);

      // Generate message for proof (use custom commitment or wallet address)
      const proofMessage = message || address || '0';

      const scope = createScope(address, groupId);

      // Generate the proof
      const proof = await generateProof(identity, group, proofMessage, scope);

      const isVerified = await verifyProof(proof);

      if (!isVerified) {
        setError('Proof verification failed');
        return;
      }

      // Set the proof data directly (already in correct format)
      setProofData(proof);
      setInputMode('proof');
      setError('');
    } catch (err) {
      console.error('Error generating proof:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate proof. Please check your private key and try again.');
      }
    } finally {
      setIsGeneratingProof(false);
    }
  };

  // Handle JSON file upload for proof
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const parsedProof = JSON.parse(content) as SemaphoreProof;

        // Validate proof structure
        if (!verifyProof(parsedProof)) {
          throw new Error('Invalid SemaphoreProof format. Please ensure your JSON contains all required fields.');
        }

        setProofData(parsedProof);
        setError('');
      } catch (err) {
        console.error('Error parsing proof file:', err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to parse proof file. Please ensure it's a valid JSON file with SemaphoreProof format."
        );
        setProofData(null);
      }
    };

    reader.readAsText(file);
  };

  const handleNext = async () => {
    if (!proofData) {
      setError('Please provide a valid SemaphoreProof');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (isRegistered) {
        throw new Error('Already registered');
      }

      // Encode the SemaphoreProof struct for the signup data
      const encodedData = encodeAbiParameters(
        [
          {
            name: 'proof',
            type: 'tuple',
            internalType: 'struct ISemaphore.SemaphoreProof',
            components: [
              { name: 'merkleTreeDepth', type: 'uint256', internalType: 'uint256' },
              { name: 'merkleTreeRoot', type: 'uint256', internalType: 'uint256' },
              { name: 'nullifier', type: 'uint256', internalType: 'uint256' },
              { name: 'message', type: 'uint256', internalType: 'uint256' },
              { name: 'scope', type: 'uint256', internalType: 'uint256' },
              { name: 'points', type: 'uint256[8]', internalType: 'uint256[8]' }
            ]
          }
        ],
        [
          {
            merkleTreeDepth: BigInt(proofData.merkleTreeDepth),
            merkleTreeRoot: BigInt(proofData.merkleTreeRoot),
            nullifier: BigInt(proofData.nullifier),
            message: BigInt(proofData.message),
            scope: BigInt(proofData.scope),
            points: proofData.points.map(point => BigInt(point)) as [
              bigint,
              bigint,
              bigint,
              bigint,
              bigint,
              bigint,
              bigint,
              bigint
            ]
          }
        ]
      );

      setSignupState(prev => ({
        ...prev,
        data: encodedData
      }));

      onNext();
    } catch (error) {
      console.error('Error generating Semaphore policy signup data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const canJoin = isConnected && !isRegistered && proofData !== null;
    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, isRegistered, proofData, setSignupState]);

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
          <Image src='/semaphore-icon.svg' width={24} height={24} alt='Semaphore' className={styles.policyIcon} />
        </div>
        <div className={styles.policyTitle}>
          <h4>Semaphore Group Access</h4>
          <span className={styles.policySubtitle}>Zero-Knowledge Group Membership</span>
        </div>
      </div>

      <div className={styles.policyDetails}>
        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Semaphore Contract:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{semaphoreContract}</span>
        </div>

        <div className={styles.policyDetailRow}>
          <span className={styles.detailLabel}>Group ID:</span>
          <span className={`${styles.detailValue} ${styles.addressText}`}>{groupId.toString()}</span>
        </div>
      </div>

      {/* Input Mode Selection */}
      <div className={styles.semaphoreInputSection}>
        <div className={styles.semaphoreModeSelector}>
          <h5>Choose Input Method</h5>
          <div className={styles.semaphoreModeButtons}>
            <button
              type='button'
              onClick={() => setInputMode('proof')}
              className={`${styles.semaphoreModeBtn} ${inputMode === 'proof' ? styles.active : ''}`}
            >
              Direct Proof
            </button>
            <button
              type='button'
              onClick={() => setInputMode('privateKey')}
              className={`${styles.semaphoreModeBtn} ${inputMode === 'privateKey' ? styles.active : ''}`}
            >
              Private Key
            </button>
          </div>
        </div>

        {/* JSON File Upload for Proof */}
        {inputMode === 'proof' && (
          <div className={styles.semaphoreInputWrapper}>
            <label htmlFor='proofFile'>Upload SemaphoreProof JSON File</label>
            <div className={styles.semaphoreFileUploadWrapper}>
              <input
                type='file'
                id='proofFile'
                accept='.json'
                onChange={handleFileUpload}
                className={styles.semaphoreFileInput}
              />
              <div className={styles.semaphoreFileUploadArea}>
                <div className={styles.semaphoreUploadIcon}>📁</div>
                <p>Click to select a JSON file or drag and drop</p>
                <small>Accepts .json files with SemaphoreProof format</small>
              </div>
            </div>

            {fileName && (
              <div className={styles.semaphoreFileName}>
                <span>📄 {fileName}</span>
              </div>
            )}

            {proofData && (
              <div className={styles.semaphoreProofPreview}>
                <h6>Proof Preview:</h6>
                <div className={styles.semaphoreProofDetails}>
                  <div>
                    <strong>Merkle Tree Depth:</strong> {proofData.merkleTreeDepth}
                  </div>
                  <div>
                    <strong>Nullifier:</strong> {proofData.nullifier.slice(0, 20)}...
                  </div>
                  <div>
                    <strong>Message:</strong> {proofData.message.slice(0, 20)}...
                  </div>
                  <div>
                    <strong>Points:</strong> {proofData.points.length} elements
                  </div>
                </div>
              </div>
            )}

            <div className={styles.semaphoreHelpText}>
              <p>
                <strong>SemaphoreProof JSON Format:</strong>
              </p>
              <pre className={styles.semaphoreCodeBlock}>
                {`{
    "merkleTreeDepth": 20,
    "merkleTreeRoot": "123...",
    "message": "456...",
    "nullifier": "789...",
    "scope": "101112...",
    "points": ["131415...", "161718..."]
}`}
              </pre>
              <p>Upload a JSON file containing your SemaphoreProof with all required fields.</p>
            </div>
          </div>
        )}

        {/* Private Key Input */}
        {inputMode === 'privateKey' && (
          <div className={styles.semaphoreInputWrapper}>
            <div className={styles.semaphorePrivateKeySection}>
              <label htmlFor='privateKey'>Private Key</label>
              <input
                type='password'
                id='privateKey'
                value={privateKey}
                onChange={e => setPrivateKey(e.target.value)}
                placeholder='Enter your Semaphore identity private key'
                className={styles.semaphorePrivateKeyInput}
              />
            </div>

            <div className={styles.semaphoreCommitmentSection}>
              <label htmlFor='message'>Message (Optional)</label>
              <input
                type='text'
                id='message'
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='Custom message or leave empty to use wallet address'
                className={styles.semaphoreCommitmentInput}
              />
            </div>

            <button
              type='button'
              onClick={generateProofFromPrivateKey}
              disabled={isGeneratingProof || !privateKey.trim()}
              className={styles.semaphoreGenerateBtn}
            >
              {isGeneratingProof ? (
                <>
                  <div className={styles.semaphoreSpinner}></div>
                  Generating Proof...
                </>
              ) : (
                'Generate Proof'
              )}
            </button>

            <div className={styles.semaphoreHelpText}>
              <p>
                Your private key will be used to generate a zero-knowledge proof of group membership. The key is
                processed locally and never sent to any server.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={styles.semaphoreErrorMessage}>
            <div className={styles.semaphoreErrorIcon}>❌</div>
            <span>{error}</span>
          </div>
        )}

        {/* Success Display */}
        {proofData && (
          <div className={styles.semaphoreSuccessMessage}>
            <div className={styles.semaphoreSuccessIcon}>✅</div>
            <span>Proof ready! You can now join the poll.</span>
          </div>
        )}
      </div>
    </Common>
  );
};

export default SemaphorePolicy;
