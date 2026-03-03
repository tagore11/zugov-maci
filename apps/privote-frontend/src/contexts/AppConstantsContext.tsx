'use client';
import { supportedChains } from '@/config/chains';
import { type ChainConstants, appConstants } from '@/config/constants';
import { createContext, useEffect, useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

type DaoContracts = ChainConstants['daos'][string]['contracts'];

export interface IAppConstantsContext extends Omit<ChainConstants, 'daos'> {
  isChainSupported: boolean;
  shadowChain: number;
  updateChain: (chainId: number) => void;
  daos: ChainConstants['daos'];
  /** Contracts for the active DAO on the current chain. */
  contracts: DaoContracts;
  /** Config key of the currently active DAO (e.g. "default", "zukas"). */
  activeDaoKey: string;
  /** Switch the active DAO. Must be a key present in the current chain's daos record. */
  updateActiveDao: (daoKey: string) => void;
}

export const AppConstantsContext = createContext<IAppConstantsContext | null>(null);

const AppConstantsProvider = ({ children }: { children: React.ReactNode }) => {
  const currentChainId = useChainId();
  const [shadowChain, setShadowChain] = useState(currentChainId);

  const constants = useMemo(() => {
    const effectiveChainId = shadowChain ?? supportedChains[0].id;
    return (
      appConstants[effectiveChainId as (typeof supportedChains)[number]['id']] ?? appConstants[supportedChains[0].id]
    );
  }, [shadowChain]);

  const isChainSupported = supportedChains.some(chain => chain.id === shadowChain);

  const updateChain = (chainId: number) => {
    if (supportedChains.some(chain => chain.id === chainId)) {
      setShadowChain(chainId);
    }
  };

  // Active DAO key within the current chain. Resets to the first DAO whenever the chain changes.
  const [activeDaoKey, setActiveDaoKey] = useState<string>(() => Object.keys(constants.daos)[0]!);

  const updateActiveDao = (daoKey: string) => {
    if (daoKey in constants.daos) {
      setActiveDaoKey(daoKey);
    }
  };

  // Reset active DAO when constants (chain) changes — the previous key may not exist on the new chain.
  useEffect(() => {
    const firstKey = Object.keys(constants.daos)[0]!;
    setActiveDaoKey(firstKey);
  }, [constants]);

  const contracts = useMemo(() => {
    return constants.daos[activeDaoKey]?.contracts ?? constants.daos[Object.keys(constants.daos)[0]!]!.contracts;
  }, [constants.daos, activeDaoKey]);

  useEffect(() => {
    if (shadowChain !== currentChainId) setShadowChain(currentChainId);
  }, [currentChainId]);

  return (
    <AppConstantsContext.Provider
      value={{
        ...constants,
        isChainSupported,
        shadowChain,
        updateChain,
        daos: constants.daos,
        contracts,
        activeDaoKey,
        updateActiveDao
      }}
    >
      {children}
    </AppConstantsContext.Provider>
  );
};

export default AppConstantsProvider;
