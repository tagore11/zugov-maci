import useAppConstants from '@/hooks/useAppConstants';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../index.module.css';
import { IPolicyConfigProps } from '../types';

/**
 * Configuration form for EAS policy
 */
const EASPolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const { isConnected, chainId } = useAccount();
  const [feedback, setFeedback] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');

  const { contracts, slugs, isChainSupported } = useAppConstants();

  useEffect(() => {
    if (!isConnected) {
      setFeedback('Connect to wallet to auto-select EAS contract.');
      setExplorerUrl('');
      if (!config.easContract) {
        onConfigChange({ ...config, easContract: '' });
      }
    } else if (chainId) {
      if (!isChainSupported) {
        setFeedback('Connected chain is not supported by Privote. Please switch to a supported network.');
        setExplorerUrl('');
        onConfigChange({ ...config, easContract: '' });
        return;
      }

      const easContractAddress = contracts.eas;
      const chainSlug = slugs.eas;

      if (chainSlug) {
        setExplorerUrl(`https://${chainSlug}.easscan.org/`);
      } else {
        setExplorerUrl('');
      }

      if (easContractAddress) {
        setFeedback('');
        onConfigChange({ ...config, easContract: easContractAddress });
      } else {
        setFeedback('EAS contract not found for this network. Please enter the contract address manually.');
        // Don't clear existing manual input
        if (!config.easContract) {
          onConfigChange({ ...config, easContract: '' });
        }
      }
    }
  }, [isConnected, chainId, contracts.eas, slugs.eas, isChainSupported]);

  return (
    <div className={styles.policyConfig}>
      <div className={styles.configField}>
        <label htmlFor='easContract'>EAS Contract</label>
        <input type='text' id='easContract' placeholder='0x...' value={config.easContract || ''} readOnly />
        {feedback && <p className={styles.feedback}>{feedback}</p>}
      </div>
      <div className={styles.configField}>
        <label htmlFor='attester'>Attester Address</label>
        <input
          type='text'
          id='attester'
          placeholder='0x...'
          value={config.attester || ''}
          onChange={e => onConfigChange({ ...config, attester: e.target.value })}
        />
      </div>
      <div className={styles.configField}>
        <label htmlFor='schema'>Schema</label>
        <input
          type='text'
          id='schema'
          placeholder='0x...'
          value={config.schema || ''}
          onChange={e => onConfigChange({ ...config, schema: e.target.value })}
        />
        {explorerUrl && (
          <p className={styles.feedback}>
            Create a new schema or use an existing one from{' '}
            <a href={explorerUrl} target='_blank' rel='noopener noreferrer'>
              {explorerUrl}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default EASPolicyConfig;
