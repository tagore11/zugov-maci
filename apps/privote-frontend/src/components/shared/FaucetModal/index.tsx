'use client';
import React, { useState } from 'react';
import Modal from '../Modal';
import styles from './index.module.css';
import { IoWarningOutline } from 'react-icons/io5';
import { IoCopy, IoCheckmark } from 'react-icons/io5';
import { useAccount, useChainId, useChains } from 'wagmi';
import { type FaucetProvider } from '@/config/constants';
import useAppConstants from '@/hooks/useAppConstants';
import { type RefetchOptions, type QueryObserverResult } from '@tanstack/react-query';
import { GetBalanceErrorType } from 'viem';
import { GetBalanceData } from 'wagmi/query';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetchBalance: (options?: RefetchOptions) => Promise<QueryObserverResult<GetBalanceData, GetBalanceErrorType>>;
}

const FaucetModal: React.FC<FaucetModalProps> = ({ isOpen, onClose, refetchBalance }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const constants = useAppConstants();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInProgress = React.useRef(false);

  // Get available faucets for the current chain
  const availableFaucets: FaucetProvider[] = constants.faucets || [];

  // Get current chain name for description
  const currentChain = chains.find(chain => chain.id === chainId);
  const chainName = currentChain?.name || 'this network';

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetFaucet = async () => {
    if (!address || requestInProgress.current) return;

    requestInProgress.current = true;

    setIsLoading(true);
    setError(null);

    const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '', {
      action: 'faucet_request'
    });

    // wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FAUCET_URL}/api/faucets/${address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ captchaToken: token, chainId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get test ETH');
      }

      await refetchBalance();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get test ETH');
    } finally {
      setIsLoading(false);
      requestInProgress.current = false;
    }
  };

  return (
    <Modal isOpen={isOpen} showCloseButton maxWidth='400px' padding='16px' onClose={onClose}>
      <div className={styles.container}>
        <IoWarningOutline size={64} />
        <h3 className={styles.title}>Insufficient Balance</h3>
        <p className={styles.description}>
          Your wallet balance is too low to perform transactions on {chainName}. Verify that you're human to receive
          test ETH:
        </p>
        {address && (
          <div className={styles.addressContainer} onClick={handleCopy}>
            <div className={styles.address}>{`${address.slice(0, 6)}...${address.slice(-4)}`}</div>
            <button className={styles.copyButton}>{copied ? <IoCheckmark size={20} /> : <IoCopy size={20} />}</button>
          </div>
        )}
        {!isLoading && !success && (
          <button
            onClick={handleGetFaucet}
            className={styles.getFaucetButton}
            disabled={isLoading || requestInProgress.current}
          >
            Get Test ETH
          </button>
        )}

        {isLoading && (
          <div className={styles.statusMessage}>
            <span className={`${styles.spinner} spinner`}></span>Processing your request...
          </div>
        )}

        {success && <div className={styles.successMessage}>Success! Test ETH has been sent.</div>}

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className={styles.externalLinksSection}>
          <h4 className={styles.externalLinksHeader}>External Faucet Options</h4>
          {availableFaucets.length > 0 ? (
            <div className={styles.links}>
              {availableFaucets.map((faucet, index) => (
                <a key={index} href={faucet.url} target='_blank' rel='noopener noreferrer' className={styles.link}>
                  {faucet.name}
                </a>
              ))}
            </div>
          ) : (
            <div className={styles.noFaucetsMessage}>No external faucets available for this chain</div>
          )}
        </div>
        <div className={styles.recaptchaNotice}>
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href='https://policies.google.com/privacy'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.recaptchaLink}
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href='https://policies.google.com/terms'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.recaptchaLink}
          >
            Terms of Service
          </a>{' '}
          apply.
        </div>
      </div>
    </Modal>
  );
};

export default FaucetModal;
