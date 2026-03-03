import { TokenDetails as TokenDetailsType } from '@/hooks/useTokenDetails';
import React from 'react';
import styles from './TokenDetails.module.css';

interface TokenDetailsProps {
  tokenDetails: TokenDetailsType | null;
  isLoading: boolean;
  error: string | null;
}

const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenDetails, isLoading, error }) => {
  if (!tokenDetails && !isLoading && !error) {
    return null;
  }

  return (
    <div className={styles.tokenDetailsContainer}>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingPulse}></div>
            <span className={styles.loadingText}>
              {tokenDetails?.type
                ? `Fetching ${tokenDetails.type} token details...`
                : 'Detecting token type and fetching details...'}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {tokenDetails && tokenDetails.isValid && !isLoading && (
        <div className={styles.successContainer}>
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>✅</div>
            <span className={styles.successTitle}>Token Details</span>
          </div>
          <div className={styles.tokenInfo}>
            <div className={styles.tokenRow}>
              <span className={styles.tokenLabel}>Name:</span>
              <span className={styles.tokenValue}>{tokenDetails.name || 'N/A'}</span>
            </div>
            <div className={styles.tokenRow}>
              <span className={styles.tokenLabel}>Symbol:</span>
              <span className={styles.tokenValue}>{tokenDetails.symbol || 'N/A'}</span>
            </div>
            {tokenDetails.decimals !== undefined && (
              <div className={styles.tokenRow}>
                <span className={styles.tokenLabel}>Decimals:</span>
                <span className={styles.tokenValue}>{tokenDetails.decimals}</span>
              </div>
            )}
            {tokenDetails.totalSupply !== undefined && (
              <div className={styles.tokenRow}>
                <span className={styles.tokenLabel}>Total Supply:</span>
                <span className={styles.tokenValue}>
                  {tokenDetails.decimals
                    ? (Number(tokenDetails.totalSupply) / Math.pow(10, tokenDetails.decimals)).toLocaleString()
                    : tokenDetails.totalSupply.toString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDetails;
