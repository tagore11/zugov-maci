import useTokenDetails from '@/hooks/useTokenDetails';
import styles from '../index.module.css';
import TokenDetails from '../TokenDetails';
import { IPolicyConfigProps } from '../types';

/**
 * Configuration form for Token policy
 */
const TokenPolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const { tokenDetails, isLoading, error } = useTokenDetails(config.tokenAddress, 'ERC721');

  return (
    <div className={styles.policyConfig}>
      <div className={styles.configField}>
        <label htmlFor='tokenAddress'>Token Address</label>
        <input
          type='text'
          id='tokenAddress'
          placeholder='0x...'
          value={config.tokenAddress || ''}
          onChange={e => onConfigChange({ ...config, tokenAddress: e.target.value })}
        />
        <TokenDetails tokenDetails={tokenDetails} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default TokenPolicyConfig;
