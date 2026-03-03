'use client';
import useAppConstants from '@/hooks/useAppConstants';
import { ONE_HOUR_MS } from '@/utils/constants';
import { getSignedupUserData } from '@/utils/subgraph';
import { Keypair, PrivateKey } from '@maci-protocol/domainobjs';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { keccak256 } from 'viem';
import { useAccount, useSignMessage } from 'wagmi';
import { SIGNATURE_MESSAGE, PORTO_CONNECTOR_ID } from '@/utils/constants';
import { generateKeypairFromSeed } from '@/utils/keypair';
import { retryWithBackoff } from '@/utils/retry';
import { getSubgraphUrl } from '@/utils/subgraphUrl';

interface ISigContext {
  maciKeypair: Keypair | null;
  isRegistered: boolean;
  stateIndex: string | undefined;
  loadKeypairFromLocalStorage: (storageKey: string) => Keypair | null;
  updateStatus: (isRegistered: boolean, stateIndex: string | undefined) => void;
  generateKeypair: () => Promise<Keypair | null>;
  deleteKeypair: () => void;
}

export const SigContext = createContext<ISigContext>({} as ISigContext);

export default function SigContextProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, connector } = useAccount();
  const [maciKeypair, setMaciKeypair] = useState<Keypair | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [stateIndex, setStateIndex] = useState<string | undefined>(undefined);

  const { signMessageAsync } = useSignMessage();
  const { daos, slugs } = useAppConstants();
  const isPorto = connector?.id === PORTO_CONNECTOR_ID;

  // Get default subgraph URL (since SigContext doesn't have DAO-specific context)
  const daoKey = Object.keys(daos).find(key => daos[key].contracts?.eas);
  const defaultDao = daoKey ? daos[daoKey] : Object.values(daos)[0];
  const subgraphUrl = defaultDao?.subgraphUrl || '';

  // constants
  const CACHE_EXPIRY_HOURS = 72;

  // Function to load keypair from localStorage
  const loadKeypairFromLocalStorage = useCallback(
    (storageKey: string) => {
      if (!address) return null;

      try {
        const storedKeypair = window.localStorage.getItem(storageKey);
        if (storedKeypair) {
          // parse the stored keypair
          const { privateKey, timestamp } = JSON.parse(storedKeypair);

          // check if privateKey & timestamp are valid
          if (!PrivateKey.isValidSerialized(privateKey) || !timestamp) {
            console.log('Invalid private key, clearing cache');
            window.localStorage.removeItem(storageKey);
            return null;
          }

          // check if the cache has expired
          const now = Date.now();
          const expiryTime = timestamp + CACHE_EXPIRY_HOURS * ONE_HOUR_MS;
          if (now > expiryTime) {
            console.log('Cached artifacts expired, clearing cache');
            window.localStorage.removeItem(storageKey);
            return null;
          }

          // return the keypair
          return new Keypair(PrivateKey.deserialize(privateKey));
        }
      } catch (error) {
        console.error('Error reading keypair from localStorage:', error);
      }
      return null;
    },
    [address]
  );

  // Function to save keypair to localStorage
  const saveKeypairToLocalStorage = useCallback(
    (keypair: Keypair) => {
      if (!address) return;

      const storageKey = `maciKeypair-${address}`;
      try {
        const privateKeyHex = keypair.privateKey.serialize();
        const localKey = {
          privateKey: privateKeyHex,
          timestamp: Date.now()
        };
        window.localStorage.setItem(storageKey, JSON.stringify(localKey));
      } catch (error) {
        console.error('Error saving keypair to localStorage:', error);
      }
    },
    [address]
  );

  const generateKeypair = useCallback(async () => {
    if (!address) return null;

    try {
      const signature = await signMessageAsync({ message: SIGNATURE_MESSAGE });
      const seed = keccak256(signature);
      const userKeyPair = generateKeypairFromSeed(seed);

      // Save to localStorage
      saveKeypairToLocalStorage(userKeyPair);
      setMaciKeypair(userKeyPair);

      return userKeyPair;
    } catch (err) {
      console.error('Error generating keypair:', err);
      return null;
    }
  }, [address, signMessageAsync, saveKeypairToLocalStorage]);

  const deleteKeypair = useCallback(() => {
    if (!address) return;

    const storageKey = `maciKeypair-${address}`;
    try {
      window.localStorage.removeItem(storageKey);
      setMaciKeypair(null);
    } catch (error) {
      console.error('Error deleting keypair from localStorage:', error);
    }
  }, [address]);

  const updateStatus = useCallback((isRegistered: boolean, stateIndex: string | undefined) => {
    setIsRegistered(isRegistered);
    setStateIndex(stateIndex);
  }, []);

  useEffect(() => {
    // Reset keypair when wallet disconnects
    if (!address || isPorto) {
      setMaciKeypair(null);
      return;
    }

    // Try to load existing keypair from localStorage
    const storageKey = `maciKeypair-${address}`;
    const existingKeypair = loadKeypairFromLocalStorage(storageKey);
    if (existingKeypair) {
      setMaciKeypair(existingKeypair);
    } else {
      setMaciKeypair(null);
      generateKeypair();
    }
  }, [address, loadKeypairFromLocalStorage, generateKeypair]);

  // check if user is registered
  useEffect(() => {
    (async () => {
      if (!isConnected) {
        setIsRegistered(false);
        return;
      }

      if (!maciKeypair) {
        setIsRegistered(false);
        setStateIndex(undefined);
        return;
      }

      if (isPorto) {
        setIsRegistered(false);
        setStateIndex(undefined);
        return;
      }

      try {
        const { isRegistered: _isRegistered, stateIndex: _stateIndex } = await getSignedupUserData(
          subgraphUrl,
          maciKeypair
        );

        setIsRegistered(_isRegistered);
        setStateIndex(_stateIndex);
      } catch (error) {
        console.log(error);
        setIsRegistered(false);
      }
    })();
  }, [maciKeypair, isConnected, subgraphUrl]);

  return (
    <SigContext.Provider
      value={{
        maciKeypair,
        isRegistered,
        stateIndex,
        loadKeypairFromLocalStorage,
        updateStatus,
        generateKeypair,
        deleteKeypair
      }}
    >
      {children}
    </SigContext.Provider>
  );
}

export const useSigContext = () => useContext(SigContext);
