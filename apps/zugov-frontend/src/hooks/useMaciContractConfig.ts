import { useState, useCallback } from "react";
import { createPublicClient, http, type Hex } from "viem";
import { MACI_ABI, BASE_POLICY_ABI } from "@/src/generated/abis";
import { appConstants, type SignUpPolicyType, type PollDeployConfig } from "@/src/config";
import type { VoterCapacityPreset } from "@/src/services/checkpointStore";
import { REGISTRY_ABI, type RegistryData } from "@/src/hooks/useZuGovRegistry";
import { buildPollDeployConfig } from "@/src/hooks/useCreateCommunity";

export interface MaciContractConfig {
  signUpPolicyAddress: Hex;
  signUpPolicyType: SignUpPolicyType;
  allowedPolicies: number[];
  supportedModes: number[];
  stateTreeDepth: 6 | 10 | 14;
  voterCapacityPreset: VoterCapacityPreset;
  // Only set when this chain's ZuGovRegistry is reachable and deployed — a MACI registered here
  // may be a genuinely external contract with no relationship to this platform's registry, so
  // this is best-effort, not required for the rest of the config to load successfully.
  pollDeployConfig: PollDeployConfig | undefined;
  deploymentBlock: number;
}

// Every BasePolicy contract implements trait() (see IPolicy.sol) returning a fixed string
// identifying its implementation — this is the only on-chain signal for which policy type a
// signUpPolicy address is.
const TRAIT_TO_POLICY_TYPE: Record<string, SignUpPolicyType> = {
  FreeForAll: "FreeForAll",
  Zupass: "Zupass",
  EAS: "EAS",
  GitcoinPassport: "GitcoinPassport",
  Semaphore: "Semaphore",
  AnonAadhaar: "AnonAadhaar",
  ERC20: "ERC20Token",
  ERC20Votes: "ERC20Votes",
  Token: "Token",
  MerkleProof: "MerkleProof",
  Hats: "HatsProtocol",
};

// communityBodySchema only accepts these three depths — they're the platform's fixed
// small/medium/large tiers, not an open range.
const DEPTH_TO_PRESET: Partial<Record<number, VoterCapacityPreset>> = {
  6: "small",
  10: "medium",
  14: "large",
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/** Binary-searches for the block a contract's code first appears at, so the subgraph can index
 * from that community's actual history instead of missing everything before registration. */
async function findDeploymentBlock(client: ReturnType<typeof createPublicClient>, address: Hex): Promise<number> {
  try {
    const latest = await client.getBlockNumber();
    let low = 0n;
    let high = latest;
    while (low < high) {
      const mid = (low + high) / 2n;
      const code = await client.getCode({ address, blockNumber: mid });
      if (code && code !== "0x") {
        high = mid;
      } else {
        low = mid + 1n;
      }
    }
    return Number(low);
  } catch {
    // Non-archive RPC nodes may not serve eth_getCode at arbitrary historical blocks — fall back
    // to indexing from genesis rather than risk silently missing this contract's earlier history.
    return 0;
  }
}

export interface UseMaciContractConfigResult {
  isLoading: boolean;
  error: string | null;
  data: MaciContractConfig | null;
  fetchConfig: (
    chainConstants: (typeof appConstants)[keyof typeof appConstants],
    maciAddress: Hex,
  ) => Promise<MaciContractConfig | null>;
  reset: () => void;
}

async function tryBuildPollDeployConfig(
  client: ReturnType<typeof createPublicClient>,
  chainConstants: (typeof appConstants)[keyof typeof appConstants],
): Promise<PollDeployConfig | undefined> {
  if (chainConstants.registryAddress === ZERO_ADDRESS) return undefined;

  try {
    const raw = await client.readContract({
      address: chainConstants.registryAddress,
      abi: REGISTRY_ABI,
      functionName: "getInfrastructure",
    });
    const registryData: RegistryData = {
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
    return buildPollDeployConfig(registryData, chainConstants);
  } catch {
    return undefined;
  }
}

/** Reads a deployed MACI contract's governance config directly on-chain, so a "register existing
 * community" flow doesn't have to trust hand-entered form fields for facts the chain already knows. */
export function useMaciContractConfig(): UseMaciContractConfigResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MaciContractConfig | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  const fetchConfig = useCallback(
    async (chainConstants: (typeof appConstants)[keyof typeof appConstants], maciAddress: Hex) => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const client = createPublicClient({ transport: http(chainConstants.rpcUrl) });

        const [signUpPolicyAddress, stateTreeDepthRaw, governanceConfig] = await Promise.all([
          client.readContract({ address: maciAddress, abi: MACI_ABI, functionName: "signUpPolicy" }),
          client.readContract({ address: maciAddress, abi: MACI_ABI, functionName: "stateTreeDepth" }),
          client.readContract({ address: maciAddress, abi: MACI_ABI, functionName: "getGovernanceConfig" }),
        ]);

        const stateTreeDepth = Number(stateTreeDepthRaw);
        const voterCapacityPreset = DEPTH_TO_PRESET[stateTreeDepth];
        if (!voterCapacityPreset) {
          throw new Error(`Unsupported state tree depth: ${stateTreeDepth} (only 6, 10, or 14 are supported)`);
        }

        const trait = await client.readContract({
          address: signUpPolicyAddress,
          abi: BASE_POLICY_ABI,
          functionName: "trait",
        });
        const signUpPolicyType = TRAIT_TO_POLICY_TYPE[trait];
        if (!signUpPolicyType) {
          throw new Error(`Unsupported sign-up policy type: "${trait}"`);
        }

        const pollDeployConfig = await tryBuildPollDeployConfig(client, chainConstants);
        const deploymentBlock = await findDeploymentBlock(client, maciAddress);

        const config: MaciContractConfig = {
          signUpPolicyAddress,
          signUpPolicyType,
          allowedPolicies: governanceConfig.allowedPolicies.map(Number),
          supportedModes: governanceConfig.supportedModes.map(Number),
          stateTreeDepth: stateTreeDepth as 6 | 10 | 14,
          voterCapacityPreset,
          pollDeployConfig,
          deploymentBlock,
        };
        setData(config);
        return config;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Could not read MACI contract: ${message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, error, data, fetchConfig, reset };
}
