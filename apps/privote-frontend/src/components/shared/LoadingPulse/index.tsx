import React from 'react';
import styles from './index.module.css';

/**
 * LoadingPulse - A reusable loading component with elegant pulse animation
 *
 * @example
 * // Basic usage
 * <LoadingPulse />
 *
 * @example
 * // Custom size and variant
 * <LoadingPulse size="large" variant="success" text="Publishing..." />
 *
 * @example
 * // Icon only (no text)
 * <LoadingPulse size="small" variant="primary" showText={false} />
 */
interface LoadingPulseProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'check';
  text?: string;
  showText?: boolean;
  className?: string;
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({
  size = 'medium',
  variant = 'primary',
  text = 'Loading...',
  showText = true,
  className = ''
}) => {
  return (
    <div className={`${styles.loadingContainer} ${styles[variant]} ${styles[size]} ${className}`}>
      <div className={`${styles.pulseWrapper} ${styles[variant]}`}>
        <div className={styles.pulseCore}></div>
        <div className={styles.pulseRing}></div>
        <div className={styles.pulseRing}></div>
        <div className={styles.pulseRing}></div>
      </div>
      {showText && <span className={styles.loadingText}>{text}</span>}
    </div>
  );
};

export default LoadingPulse;
