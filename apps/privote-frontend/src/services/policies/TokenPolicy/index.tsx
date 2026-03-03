'use client';

import useDecodeService from '@/hooks/useDecodeService';
import usePollContext from '@/hooks/usePollContext';
import { TokenPolicyData } from '@/services/decode/types';
import { PollPolicyType } from '@/types';
import { notification } from '@/utils/notification';
import { useEffect, useState } from 'react';
import { encodeAbiParameters, erc721Abi, parseAbiParameters } from 'viem';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import Common from '../Common';
import styles from '../styles.module.css';
import { PolicyProps } from '../types';

interface TokenInfo {
  tokenId: bigint;
  isSelected: boolean;
}

interface AlchemyOwnershipResponse {
  ownsToken: boolean;
  tokenIds: string[];
}

const TokenPolicy = ({ policyData, signupState, setSignupState, onNext, onBack }: PolicyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
  const [userTokens, setUserTokens] = useState<TokenInfo[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { isRegistered } = usePollContext();

  // Extract token contract address from policyData
  const decodedPolicyData = useDecodeService<TokenPolicyData>(PollPolicyType.Token, policyData);
  const tokenAddress = decodedPolicyData?.token?.address || '0x';
  const contractName = decodedPolicyData?.token?.name || 'Unknown';
  const contractSymbol = decodedPolicyData?.token?.symbol || 'Unknown';

  // Check token balance to determine if user owns any tokens
  const { data: tokenBalance, isLoading: basicLoading } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc721Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!tokenAddress && tokenAddress !== '0x' && isConnected
    }
  });

  const balance = tokenBalance ? Number(tokenBalance) : 0;

  const displayName = contractName || '';
  const displaySymbol = contractSymbol || '';

  // Get block explorer URL based on chain ID
  const getBlockExplorerUrl = (address: string, chainId: number): string => {
    const addressLower = address.toLowerCase();
    switch (chainId) {
      case 10: // Optimism
        return `https://optimistic.etherscan.io/address/${addressLower}`;
      case 11155420: // Optimism Sepolia
        return `https://sepolia-optimism.etherscan.io/address/${addressLower}`;
      case 84532: // Base Sepolia
        return `https://sepolia.basescan.org/address/${addressLower}`;
      case 534351: // Scroll Sepolia
        return `https://sepolia.scrollscan.com/address/${addressLower}`;
      default:
        return `https://etherscan.io/address/${addressLower}`;
    }
  };

  const blockExplorerUrl = tokenAddress && tokenAddress !== '0x' ? getBlockExplorerUrl(tokenAddress, chainId) : null;

  const requirementsDescription = (
    <>
      This poll requires you to own a token from the {displayName ? <strong>{displayName}</strong> : 'specified'}{' '}
      collection{' '}
      {blockExplorerUrl ? (
        <>
          (
          <a
            href={blockExplorerUrl}
            target='_blank'
            rel='noopener noreferrer'
            style={{
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
            onClick={e => e.stopPropagation()}
          >
            {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
          </a>
          )
        </>
      ) : (
        tokenAddress !== '0x' && `(${tokenAddress})`
      )}
    </>
  );

  // Fetch token IDs from Alchemy API
  useEffect(() => {
    const fetchTokensFromAlchemy = async () => {
      if (!address || !tokenAddress || tokenAddress === '0x' || !isConnected || !chainId || balance === 0) {
        setUserTokens([]);
        setSelectedTokenId(null);
        setFetchError(null);
        return;
      }

      setIsFetchingTokens(true);
      setFetchError(null);

      try {
        const params = new URLSearchParams({
          userAddress: address,
          tokenAddress: tokenAddress,
          chainId: chainId.toString()
        });

        const response = await fetch(`/api/nft/ownership/?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch NFTs' }));
          throw new Error(errorData.error || 'Failed to fetch NFTs from Alchemy');
        }

        const data: AlchemyOwnershipResponse = await response.json();

        if (data.ownsToken && data.tokenIds.length > 0) {
          const tokens: TokenInfo[] = data.tokenIds.map(tokenIdStr => ({
            tokenId: BigInt(tokenIdStr),
            isSelected: false
          }));

          setUserTokens(tokens);
          setFetchError(null);

          // Auto-select the first token (index 0) if available and none selected
          if (tokens.length > 0 && !selectedTokenId) {
            setSelectedTokenId(tokens[0].tokenId);
          }
        } else {
          setUserTokens([]);
          setSelectedTokenId(null);
          setFetchError('No tokens found from this collection');
        }
      } catch (error) {
        console.error('Error fetching tokens from Alchemy:', error);
        setFetchError(error instanceof Error ? error.message : 'Failed to fetch tokens');
        setUserTokens([]);
        setSelectedTokenId(null);
      } finally {
        setIsFetchingTokens(false);
      }
    };

    fetchTokensFromAlchemy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, tokenAddress, chainId, isConnected, balance]);

  const handleNext = () => {
    setIsLoading(true);

    try {
      if (!isConnected) {
        notification.error('Wallet not connected');
        throw new Error('Wallet not connected');
      }

      if (isRegistered) {
        notification.error('Already registered');
        throw new Error('Already registered');
      }

      if (!tokenAddress || tokenAddress === '0x') {
        notification.error('Invalid token address');
        throw new Error('Invalid token address');
      }

      if (balance <= 0) {
        notification.error('You do not own any tokens from this collection');
        throw new Error('You do not own any tokens from this collection');
      }

      if (!selectedTokenId) {
        notification.error('Please select a token to use for joining');
        throw new Error('No token selected');
      }

      // Encode the token ID as uint256 for the signup data
      const encodedData = encodeAbiParameters(parseAbiParameters('uint256'), [selectedTokenId]);
      setSignupState(prev => ({ ...prev, data: encodedData }));
      onNext();
    } catch (error) {
      console.error('Error generating Token policy signup data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const canJoin = isConnected && !isRegistered && balance > 0 && selectedTokenId !== null;
    setSignupState(prev => ({ ...prev, canJoin }));
  }, [isConnected, isRegistered, balance, selectedTokenId, setSignupState]);

  return (
    <Common
      canJoin={signupState.canJoin}
      requirementsDescription={requirementsDescription}
      isLoading={isLoading}
      onNext={handleNext}
      onBack={onBack}
    >
      {!isConnected ? (
        <div className={styles.errorMessage}>Please connect your wallet to check token ownership</div>
      ) : basicLoading || isFetchingTokens ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <span>Checking eligibility...</span>
        </div>
      ) : balance === 0 || userTokens.length === 0 ? (
        <div className={styles.errorMessage}>
          {fetchError || 'You are not eligible. You need to own a token from this collection to participate.'}
        </div>
      ) : selectedTokenId ? (
        <div className={`${styles.statusIndicator} ${styles.success}`}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
            <path
              d='M13.5 4.5L6 12L2.5 8.5'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          You are eligible to join this poll
        </div>
      ) : (
        <div className={styles.errorMessage}>{fetchError || 'Unable to verify token ownership'}</div>
      )}
    </Common>
  );
};

export default TokenPolicy;
