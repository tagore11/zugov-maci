import { useState, useEffect, useCallback } from "react";
import { useChainId } from "wagmi";
import { createPublicClient, http, type Hex } from "viem";
import { appConstants } from "@/src/config";

export interface RegistryData {
  pollFactory: Hex;
  messageProcessorFactory: Hex;
  tallyFactory: Hex;
  verifier: Hex;
  verifyingKeysRegistry: Hex;
  poseidonT3: Hex;
  poseidonT4: Hex;
  poseidonT5: Hex;
  poseidonT6: Hex;
  coordinatorPubKeyX: bigint;
  coordinatorPubKeyY: bigint;
}

export interface RegistryStatus {
  isLoading: boolean;
  isSupported: boolean;
  isReady: boolean;
  data: RegistryData | undefined;
  error: string | undefined;
}

export interface UseZuGovRegistryResult extends RegistryStatus {
  refetch: () => Promise<void>;
}

export const REGISTRY_ABI = [
  {
    name: "getInfrastructure",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "pollFactory", type: "address" },
          { name: "messageProcessorFactory", type: "address" },
          { name: "tallyFactory", type: "address" },
          { name: "verifier", type: "address" },
          { name: "verifyingKeysRegistry", type: "address" },
          { name: "poseidonT3", type: "address" },
          { name: "poseidonT4", type: "address" },
          { name: "poseidonT5", type: "address" },
          { name: "poseidonT6", type: "address" },
          { name: "signUpPolicy", type: "address" },
          { name: "coordinatorPubKeyX", type: "uint256" },
          { name: "coordinatorPubKeyY", type: "uint256" },
        ],
      },
    ],
  },
] as const;

const ZERO = "0x0000000000000000000000000000000000000000";

function isZero(addr: string): boolean {
  return addr.toLowerCase() === ZERO;
}

export function useZuGovRegistry(): UseZuGovRegistryResult {
  const chainId = useChainId();

  const [status, setStatus] = useState<RegistryStatus>({
    isLoading: false,
    isSupported: false,
    isReady: false,
    data: undefined,
    error: undefined,
  });

  const fetchRegistry = useCallback(async () => {
    const chainConstants = appConstants[chainId as keyof typeof appConstants];
    if (!chainConstants) {
      setStatus({ isLoading: false, isSupported: false, isReady: false, data: undefined, error: undefined });
      return;
    }

    const registryAddress = chainConstants.registryAddress;
    if (isZero(registryAddress)) {
      setStatus({
        isLoading: false,
        isSupported: false,
        isReady: false,
        data: undefined,
        error: "Registry not yet deployed on this network",
      });
      return;
    }

    setStatus((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const client = createPublicClient({ transport: http(chainConstants.rpcUrl) });

      const raw = await client.readContract({
        address: registryAddress,
        abi: REGISTRY_ABI,
        functionName: "getInfrastructure",
      });

      const data: RegistryData = {
        pollFactory: raw.pollFactory as Hex,
        messageProcessorFactory: raw.messageProcessorFactory as Hex,
        tallyFactory: raw.tallyFactory as Hex,
        verifier: raw.verifier as Hex,
        verifyingKeysRegistry: raw.verifyingKeysRegistry as Hex,
        poseidonT3: raw.poseidonT3 as Hex,
        poseidonT4: raw.poseidonT4 as Hex,
        poseidonT5: raw.poseidonT5 as Hex,
        poseidonT6: raw.poseidonT6 as Hex,
        coordinatorPubKeyX: raw.coordinatorPubKeyX,
        coordinatorPubKeyY: raw.coordinatorPubKeyY,
      };

      const isReady =
        !isZero(data.pollFactory) &&
        !isZero(data.messageProcessorFactory) &&
        !isZero(data.tallyFactory) &&
        !isZero(data.verifier) &&
        !isZero(data.verifyingKeysRegistry) &&
        !isZero(data.poseidonT3) &&
        !isZero(data.poseidonT4) &&
        !isZero(data.poseidonT5) &&
        !isZero(data.poseidonT6) &&
        data.coordinatorPubKeyX !== 0n &&
        data.coordinatorPubKeyY !== 0n;

      setStatus({ isLoading: false, isSupported: true, isReady, data, error: undefined });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ isLoading: false, isSupported: true, isReady: false, data: undefined, error: message });
    }
  }, [chainId]);

  useEffect(() => {
    void fetchRegistry();
  }, [fetchRegistry]);

  return { ...status, refetch: fetchRegistry };
}
