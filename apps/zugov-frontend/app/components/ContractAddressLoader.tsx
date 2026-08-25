import type { Hex } from "viem";
import { Loader2 } from "lucide-react";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import { appConstants, supportedChains } from "@/src/config";
import { useMaciContractConfig, type MaciContractConfig } from "@/src/hooks/useMaciContractConfig";

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;

function labelFor(list: { id: string; name: string }[], id: number): string {
  return list.find((item) => item.id === String(id))?.name ?? `#${id}`;
}

interface Props {
  chainId: number;
  onChainIdChange: (chainId: number) => void;
  contractAddress: string;
  onContractAddressChange: (address: string) => void;
  // Fires with the loaded config on a successful fetch, or null whenever the chain/address
  // changes and the previously-loaded config is no longer valid for the new input. The parent
  // owns the resulting config for its own submit payload and conditional rendering — this
  // component is a controlled input, not the source of truth for the loaded value (extracted
  // from manage-communities/register/page.tsx, Child C2, /plan-eng-review 2026-08-25).
  onConfigLoaded: (config: MaciContractConfig | null) => void;
}

export function ContractAddressLoader({
  chainId,
  onChainIdChange,
  contractAddress,
  onContractAddressChange,
  onConfigLoaded,
}: Props) {
  const contract = useMaciContractConfig();
  const isValidAddress = ADDRESS_REGEX.test(contractAddress);

  const handleChainChange = (nextChainId: number) => {
    onChainIdChange(nextChainId);
    onConfigLoaded(null);
    contract.reset();
  };

  const handleAddressChange = (value: string) => {
    onContractAddressChange(value);
    onConfigLoaded(null);
    contract.reset();
  };

  const handleLoadContract = async () => {
    const chainConstants = appConstants[chainId as keyof typeof appConstants];
    if (!chainConstants || !isValidAddress) return;

    const config = await contract.fetchConfig(chainConstants, contractAddress as Hex);
    onConfigLoaded(config);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Chain</label>
        <select
          value={chainId}
          onChange={(e) => handleChainChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-foreground focus:outline-none focus:border-accent"
        >
          {supportedChains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          MACI Contract Address <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-foreground placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            disabled={!isValidAddress || contract.isLoading}
            onClick={() => void handleLoadContract()}
            className="px-4 py-2.5 rounded-lg bg-gray-700 text-foreground font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {contract.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Load Contract
          </button>
        </div>
        {contract.error && <p className="text-sm text-red-400 mt-2">{contract.error}</p>}
      </div>
    </div>
  );
}

export function ContractConfigSummary({ config }: { config: MaciContractConfig }) {
  return (
    <div className="rounded-lg bg-gray-800/60 border border-gray-700 p-4 space-y-2 text-sm">
      <p className="text-green-400 font-medium mb-1">Detected on-chain configuration</p>
      <p className="text-gray-300">
        Sign-up policy: <span className="text-foreground">{config.signUpPolicyType}</span>{" "}
        <span className="text-gray-500 font-mono text-xs">({config.signUpPolicyAddress})</span>
      </p>
      <p className="text-gray-300">
        Allowed poll policies:{" "}
        <span className="text-foreground">
          {config.allowedPolicies.map((id) => labelFor(ALLOWED_POLICIES, id)).join(", ")}
        </span>
      </p>
      <p className="text-gray-300">
        Voting modes:{" "}
        <span className="text-foreground">
          {config.supportedModes.map((id) => labelFor(VOTING_MODES, id)).join(", ")}
        </span>
      </p>
      <p className="text-gray-300">
        Voter capacity: <span className="text-foreground">state tree depth {config.stateTreeDepth}</span>
      </p>
      <p className="text-gray-300">
        Poll deployment:{" "}
        {config.pollDeployConfig ? (
          <span className="text-green-400">supported (uses this chain&apos;s shared infrastructure)</span>
        ) : (
          <span className="text-amber-400">
            not available — this chain&apos;s registry isn&apos;t reachable or deployed
          </span>
        )}
      </p>
    </div>
  );
}
