import useAppConstants from '@/hooks/useAppConstants';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../index.module.css';
import { IPolicyConfigProps } from '../types';

/**
 * Configuration form for EAS policy
 */
const AnonAadhaarPolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const { isConnected, chainId } = useAccount();
  const [feedback, setFeedback] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);

  const { isChainSupported, contracts } = useAppConstants();

  const generateRandomValue = useCallback(() => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const value = BigInt(array.join('')).toString();
    onConfigChange({ ...config, nullifierSeed: value });
  }, []);

  useEffect(() => {
    generateRandomValue();
  }, [generateRandomValue]);

  useEffect(() => {
    if (!isConnected) {
      setFeedback('Connect to wallet to auto-select EAS contract.');
      setIsManualInput(false);
      if (!config.verifierAddress) {
        onConfigChange({ ...config, verifierAddress: '' });
      }
    } else if (chainId) {
      if (!isChainSupported) {
        setFeedback('Connected chain is not supported by Privote. Please switch to a supported network.');
        setIsManualInput(false);
        onConfigChange({ ...config, verifierAddress: '' });
        return;
      }

      const verifier = contracts.anonAadhaarVerifier;

      if (verifier) {
        setFeedback('');
        setIsManualInput(false);
        onConfigChange({ ...config, verifierAddress: verifier });
      } else {
        setFeedback('Verifier contract not found for this network. Please enter the contract address manually.');
        setIsManualInput(true);
        // Don't clear existing manual input
        if (!config.verifierAddress) {
          onConfigChange({ ...config, verifierAddress: '' });
        }
      }
    }
  }, [isConnected, chainId, contracts.anonAadhaarVerifier, isChainSupported]);

  return (
    <div className={styles.policyConfig}>
      <div className={styles.configField}>
        <label htmlFor='verifierAddress'>Verifier Contract</label>
        <input
          type='text'
          id='verifierAddress'
          placeholder='0x...'
          value={config.verifierAddress || ''}
          readOnly={!isManualInput && !!config.verifierAddress}
          onChange={isManualInput ? e => onConfigChange({ ...config, verifierAddress: e.target.value }) : undefined}
        />
        {feedback && <p className={styles.feedback}>{feedback}</p>}
      </div>
      <div className={styles.configField}>
        <label htmlFor='nullifierSeed'>Nullifier Seed</label>
        <input
          type='text'
          id='nullifierSeed'
          placeholder='0x...'
          defaultValue={config.nullifierSeed || ''}
          readOnly={!!config.nullifierSeed}
          onChange={e => onConfigChange({ ...config, nullifierSeed: e.target.value })}
        />
      </div>
    </div>
  );
};

export default AnonAadhaarPolicyConfig;
