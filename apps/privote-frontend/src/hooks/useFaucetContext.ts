'use client';
import { useContext } from 'react';
import { FaucetContext } from '../contexts/FaucetContext';
import { type IFaucetContext } from '../contexts/types';

const useFaucetContext = (): IFaucetContext => {
  const faucetContext = useContext(FaucetContext);

  if (!faucetContext) {
    throw new Error('Should use context inside provider.');
  }

  return faucetContext;
};

export default useFaucetContext;
