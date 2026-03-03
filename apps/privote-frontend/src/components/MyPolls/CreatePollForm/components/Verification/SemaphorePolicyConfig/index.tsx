import useAppConstants from '@/hooks/useAppConstants';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../index.module.css';
import { IPolicyConfigProps } from '../types';

const SemaphorePolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const { isConnected, chainId } = useAccount();
  const [feedback, setFeedback] = useState('');

  const { isChainSupported, contracts } = useAppConstants();

  useEffect(() => {
    if (!isConnected) {
      setFeedback('Connect to wallet to auto-select Semaphore contract.');
      if (!config.semaphoreContract) {
        onConfigChange({ ...config, semaphoreContract: '' });
      }
    } else if (chainId) {
      // Check if the connected chain is supported by Privote
      if (!isChainSupported) {
        setFeedback('Connected chain is not supported by Privote. Please switch to a supported network.');
        onConfigChange({ ...config, semaphoreContract: '' });
        return;
      }

      const semaphoreContract = contracts.semaphore;

      if (semaphoreContract) {
        setFeedback('');
        onConfigChange({ ...config, semaphoreContract });
      } else {
        setFeedback('Semaphore contract not found for this network.');
        if (!config.semaphoreContract) {
          onConfigChange({ ...config, semaphoreContract: '' });
        }
      }
    }
  }, [isConnected, chainId, isChainSupported, contracts.semaphore]);

  return (
    <div className={styles.policyConfig}>
      <div className={styles.configField}>
        <label htmlFor='semaphoreContract'>Semaphore Contract Address</label>
        <input type='text' id='semaphoreContract' placeholder='0x...' value={config.semaphoreContract || ''} readOnly />
        {feedback && <p className={styles.feedback}>{feedback}</p>}
      </div>
      <div className={styles.configField}>
        <label htmlFor='groupId'>Group Id</label>
        <input
          type='text'
          id='groupId'
          placeholder='0x...'
          value={config.groupId || ''}
          onChange={e => onConfigChange({ ...config, groupId: e.target.value })}
        />
      </div>
    </div>
  );
};

export default SemaphorePolicyConfig;
