'use client';
import { DecodeService } from '@/services/decode';
import { PollPolicyType } from '@/types';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';
import { usePublicClient } from 'wagmi';

const useDecodeService = <T>(pollPolicyType: PollPolicyType, policyData?: Hex) => {
  const publicClient = usePublicClient();
  const [decodePolicyData, setDecodePolicyData] = useState<T | null>(null);

  useEffect(() => {
    if (!publicClient || !policyData) return;
    (async () => {
      const decodeService = new DecodeService(pollPolicyType, policyData, publicClient);
      const data = await decodeService.decode();
      setDecodePolicyData(data as T);
    })();
  }, [publicClient, pollPolicyType, policyData]);

  return decodePolicyData;
};

export default useDecodeService;
