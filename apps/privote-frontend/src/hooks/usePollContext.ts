'use client';
import { useContext } from 'react';
import { PollContext } from '../contexts/PollContext';
import { type IPollContextType } from '../contexts/types';

const usePollContext = (): IPollContextType => {
  const pollContext = useContext(PollContext);
  console.log('usePollContext: Context value', pollContext);

  if (!pollContext) {
    throw new Error('Should use context inside provider.');
  }

  return pollContext;
};

export default usePollContext;
