'use client';
import { FaucetModal } from '@/components/shared';
import { supportedChains } from '@/config/chains';
import { appConstants } from '@/config/constants';
import { notification } from '@/utils/notification';
import { PORTO_CONNECTOR_ID } from '@/utils/constants';
import { createContext, useEffect, useState } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { IFaucetContext } from './types';

export const FaucetContext = createContext<IFaucetContext | null>(null);

const MIN_BALANCE = 0;

const FaucetProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const {
    data: balance,
    isLoading,
    refetch: refetchBalance
  } = useBalance({ address, chainId, query: { enabled: !!address && !!chainId } });
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  const checkBalance = () => {
    // Skip balance check for Porto connector
    if (connector?.id === PORTO_CONNECTOR_ID) {
      return false;
    }

    if (!address) {
      notification.error('Please connect your wallet');
      return true;
    }
    const isSupportedChain = supportedChains.some(c => c.id === chainId);

    if (!isSupportedChain) {
      notification.error('Please connect to a supported network');
      setShowFaucetModal(false);
      return true;
    }

    const chainConstants = appConstants[chainId as (typeof supportedChains)[number]['id']];
    const isTestnet = chainConstants?.isTestnet ?? false;

    if (!isLoading && balance && Number(balance.value) <= MIN_BALANCE) {
      notification.error('Insufficient balance');
      // Only show faucet modal for testnet chains
      if (isTestnet) {
        setShowFaucetModal(true);
      }

      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!isLoading && balance && Number(balance.value) > MIN_BALANCE) {
      setShowFaucetModal(false);
    }
  }, [balance, isLoading]);

  return (
    <FaucetContext.Provider value={{ checkBalance }}>
      {children}
      <FaucetModal isOpen={showFaucetModal} onClose={() => setShowFaucetModal(false)} refetchBalance={refetchBalance} />
    </FaucetContext.Provider>
  );
};

export default FaucetProvider;
