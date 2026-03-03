'use client';
import { MACI_ABI } from '@/contracts/maciAbi';
import useAppConstants from '@/hooks/useAppConstants';
import { useAccount } from 'wagmi';

const usePrivoteContract = () => {
  const { isConnected } = useAccount();
  const { contracts } = useAppConstants();

  if (!isConnected) return null;
  if (!contracts.maci || contracts.maci === '0x') return null;

  return {
    address: contracts.maci,
    abi: MACI_ABI
  };
};

export default usePrivoteContract;
