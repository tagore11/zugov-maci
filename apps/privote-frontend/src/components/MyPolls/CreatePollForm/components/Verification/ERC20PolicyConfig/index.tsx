import useTokenDetails from '@/hooks/useTokenDetails';
import styles from '../index.module.css';
import TokenDetails from '../TokenDetails';
import { IPolicyConfigProps } from '../types';

/**
 * Configuration form for ERC20 policy
 */
const ERC20PolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const { tokenDetails, isLoading, error } = useTokenDetails(config.tokenAddress, 'ERC20');

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
      <div className={styles.configField}>
        <label htmlFor='tokenThreshold'>Minimum Token Balance</label>
        <input
          type='number'
          id='tokenThreshold'
          placeholder='1'
          value={config.threshold || ''}
          onChange={e => onConfigChange({ ...config, threshold: e.target.value })}
        />
      </div>
    </div>
  );
};

export default ERC20PolicyConfig;
