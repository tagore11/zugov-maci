import { useEffect, useMemo, useState } from 'react';
import { erc20Abi, erc721Abi, isAddress } from 'viem';
import { useReadContracts } from 'wagmi';

export type TokenType = 'ERC20' | 'ERC721';

export interface TokenDetails {
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: bigint;
  isValid: boolean;
  type?: TokenType;
}

export interface UseTokenDetailsResult {
  tokenDetails: TokenDetails | null;
  isLoading: boolean;
  error: string | null;
}

// Custom hook for debouncing values
const useDebounce = (value: string | undefined, delay: number): string | undefined => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useTokenDetails = (tokenAddress?: string, tokenType?: TokenType): UseTokenDetailsResult => {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce the token address to prevent excessive API calls
  const debouncedTokenAddress = useDebounce(tokenAddress, 500);

  // Validate token address
  const isValidAddress = debouncedTokenAddress && isAddress(debouncedTokenAddress);

  // Contract reads based on token type - memoized to prevent unnecessary re-renders
  const erc20Contracts = useMemo(() => {
    if (!isValidAddress) return [];

    return [
      {
        address: debouncedTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'name'
      },
      {
        address: debouncedTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'symbol'
      },
      {
        address: debouncedTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals'
      },
      {
        address: debouncedTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'totalSupply'
      }
    ];
  }, [isValidAddress, debouncedTokenAddress]);

  const erc721Contracts = useMemo(() => {
    if (!isValidAddress) return [];

    return [
      {
        address: debouncedTokenAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'name'
      },
      {
        address: debouncedTokenAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'symbol'
      },
      {
        address: debouncedTokenAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'totalSupply'
      }
    ];
  }, [isValidAddress, debouncedTokenAddress]);

  // Use specific contract type if specified, otherwise try both
  const shouldQueryERC20 = !tokenType || tokenType === 'ERC20';
  const shouldQueryERC721 = !tokenType || tokenType === 'ERC721';

  const {
    data: erc20Data,
    isLoading: isERC20Loading,
    error: erc20Error
  } = useReadContracts({
    contracts: erc20Contracts,
    query: {
      enabled: !!isValidAddress && shouldQueryERC20
    }
  });

  const {
    data: erc721Data,
    isLoading: isERC721Loading,
    error: erc721Error
  } = useReadContracts({
    contracts: erc721Contracts,
    query: {
      enabled: !!isValidAddress && shouldQueryERC721
    }
  });

  const isLoading = isERC20Loading || isERC721Loading;

  useEffect(() => {
    if (!isValidAddress) {
      setTokenDetails(null);
      setError(null);
      return;
    }

    if (isLoading) {
      setError(null);
      return;
    }

    // If specific token type is requested, only check that type
    if (tokenType === 'ERC20') {
      if (erc20Data && erc20Data.length >= 4) {
        const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = erc20Data;

        if (
          nameResult.status === 'success' &&
          symbolResult.status === 'success' &&
          decimalsResult.status === 'success'
        ) {
          setError(null);
          setTokenDetails({
            name: nameResult.result as string,
            symbol: symbolResult.result as string,
            decimals: decimalsResult.result as number,
            totalSupply: totalSupplyResult.status === 'success' ? (totalSupplyResult.result as bigint) : undefined,
            isValid: true
          });
        } else {
          setError('Invalid ERC20 token contract. Please verify the contract address.');
          setTokenDetails({
            isValid: false
          });
        }
      }
      return;
    }

    if (tokenType === 'ERC721') {
      if (erc721Data && erc721Data.length >= 3) {
        const [nameResult, symbolResult, totalSupplyResult] = erc721Data;

        if (nameResult.status === 'success' && symbolResult.status === 'success') {
          setError(null);
          setTokenDetails({
            name: nameResult.result as string,
            symbol: symbolResult.result as string,
            totalSupply: totalSupplyResult.status === 'success' ? (totalSupplyResult.result as bigint) : undefined,
            isValid: true
          });
        } else {
          setError('Invalid ERC721 token contract. Please verify the contract address.');
          setTokenDetails({
            isValid: false
          });
        }
      }
      return;
    }

    // Auto-detection mode: try ERC20 first, then ERC721
    if (erc20Data && erc20Data.length >= 4) {
      const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = erc20Data;

      if (nameResult.status === 'success' && symbolResult.status === 'success' && decimalsResult.status === 'success') {
        setError(null);
        setTokenDetails({
          name: nameResult.result as string,
          symbol: symbolResult.result as string,
          decimals: decimalsResult.result as number,
          totalSupply: totalSupplyResult.status === 'success' ? (totalSupplyResult.result as bigint) : undefined,
          isValid: true
        });
        return;
      }
    }

    // If ERC20 failed, try ERC721
    if (erc721Data && erc721Data.length >= 3) {
      const [nameResult, symbolResult, totalSupplyResult] = erc721Data;

      if (nameResult.status === 'success' && symbolResult.status === 'success') {
        setError(null);
        setTokenDetails({
          name: nameResult.result as string,
          symbol: symbolResult.result as string,
          totalSupply: totalSupplyResult.status === 'success' ? (totalSupplyResult.result as bigint) : undefined,
          isValid: true
        });
        return;
      }
    }

    // If both failed
    setError('Unable to fetch token details. Please verify the contract address.');
    setTokenDetails({
      isValid: false
    });
  }, [isValidAddress, tokenType, isLoading, erc20Data, erc721Data, erc20Error, erc721Error]);

  // Reset when address changes
  useEffect(() => {
    if (!tokenAddress) {
      setTokenDetails(null);
      setError(null);
    }
  }, [tokenAddress]);

  // Show loading state immediately when user starts typing
  const isTyping = tokenAddress !== debouncedTokenAddress;

  return {
    tokenDetails,
    isLoading: isLoading || isTyping,
    error
  };
};

export default useTokenDetails;
