import useAppConstants from '@/hooks/useAppConstants';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../index.module.css';
import { IPolicyConfigProps } from '../types';

const GitcoinPolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const { isConnected, chainId } = useAccount();
  const [feedback, setFeedback] = useState('');

  const { contracts, isChainSupported } = useAppConstants();

  useEffect(() => {
    if (!isConnected) {
      setFeedback('Connect to wallet to auto-select Gitcoin decoder contract.');
      if (!config.gitcoinDecoderAddress) {
        onConfigChange({ ...config, gitcoinDecoderAddress: '' });
      }
    } else if (chainId) {
      if (!isChainSupported) {
        setFeedback('Connected chain is not supported by Privote. Please switch to a supported network.');
        onConfigChange({ ...config, gitcoinDecoderAddress: '' });
        return;
      }

      const gitcoinDecoderAddress = contracts.gitcoinPassportDecoder;

      if (gitcoinDecoderAddress !== '0x') {
        setFeedback('');
        onConfigChange({ ...config, gitcoinDecoderAddress });
      } else {
        setFeedback('Gitcoin decoder contract not found for this network. Please enter the contract address manually.');
        if (!config.gitcoinDecoderAddress) {
          onConfigChange({ ...config, gitcoinDecoderAddress: '' });
        }
      }
    }
  }, [isConnected, chainId, contracts.gitcoinPassportDecoder, isChainSupported]);

  return (
    <div className={styles.policyConfig}>
      <div className={styles.configField}>
        <label htmlFor='gitcoinDecoderAddress'>Gitcoin Decoder Address</label>
        <input
          type='text'
          id='gitcoinDecoderAddress'
          placeholder='0x...'
          value={config.gitcoinDecoderAddress || ''}
          readOnly
        />
        {feedback && <p className={styles.feedback}>{feedback}</p>}
      </div>
      <div className={styles.configField}>
        <label htmlFor='passingScore'>Passing Score</label>
        <input
          type='text'
          id='passingScore'
          placeholder='Enter passing score'
          value={config.passingScore || ''}
          onChange={e => onConfigChange({ ...config, passingScore: e.target.value })}
        />
      </div>
    </div>
  );
};

export default GitcoinPolicyConfig;
