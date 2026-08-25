import { useState } from "react";
import { useChainId } from "wagmi";
import { appConstants, supportedChains } from "@/src/config";
import * as communityApi from "@/src/services/communityApi";
import { withAuthDetect } from "@/src/services/httpClient";
import { useSiwe } from "@/src/hooks/useSiwe";
import type { MaciContractConfig } from "@/src/hooks/useMaciContractConfig";
import { ContractAddressLoader, ContractConfigSummary } from "@/app/components/ContractAddressLoader";

interface Props {
  communityId: string;
  isAttached: boolean;
  onAttached?: () => void;
}

/** Child C2 (formalize-communities epic), /plan-eng-review 2026-08-25 — attaches an
 * already-deployed MACI contract to an existing off-chain community from the settings page,
 * shown alongside DeployGovernanceSection (not replacing it — a community can either deploy a
 * new contract or register an existing one). Reuses the exact GovernancePayload shape
 * /manage-communities/register already builds from a loaded contractConfig; no new backend
 * endpoint. */
export function RegisterExistingContract({ communityId, isAttached, onAttached }: Props) {
  const connectedChainId = useChainId();
  const [chainId, setChainId] = useState<number>(
    connectedChainId in appConstants ? connectedChainId : supportedChains[0]!.id,
  );
  const [contractAddress, setContractAddress] = useState("");
  const [contractConfig, setContractConfig] = useState<MaciContractConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signOut } = useSiwe();

  if (isAttached) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!contractConfig) {
      setError("Load the contract's on-chain configuration before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await withAuthDetect(
        () =>
          communityApi.attachGovernance(communityId, {
            contractAddress,
            chainId,
            allowedPolicies: contractConfig.allowedPolicies,
            supportedModes: contractConfig.supportedModes,
            signUpPolicyType: contractConfig.signUpPolicyType,
            signUpPolicyAddress: contractConfig.signUpPolicyAddress,
            maciDeploymentBlock: contractConfig.deploymentBlock,
            stateTreeDepth: contractConfig.stateTreeDepth,
            pollDeployConfig: contractConfig.pollDeployConfig,
          }),
        signOut,
      );
      onAttached?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register contract");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-2 border-gray-800 bg-gray-800/40 rounded-lg space-y-4">
      <div>
        <p className="font-semibold text-foreground">Register Existing Contract</p>
        <p className="text-sm text-gray-400">
          Already deployed a MACI contract for this community elsewhere? Attach it here instead of deploying a new one.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <ContractAddressLoader
          chainId={chainId}
          onChainIdChange={setChainId}
          contractAddress={contractAddress}
          onContractAddressChange={setContractAddress}
          onConfigLoaded={setContractConfig}
        />

        {contractConfig && <ContractConfigSummary config={contractConfig} />}

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={!contractConfig || isSubmitting}
          className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? "Registering…" : "Register Contract"}
        </button>
      </form>
    </div>
  );
}
