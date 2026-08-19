import { useEffect, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { appConstants } from "@/src/config";
import type { UseDeployGovernanceResult } from "@/src/hooks/useCreateCommunity";

interface Props {
  deploy: UseDeployGovernanceResult;
  goBack: () => void;
  goToReview: () => void;
}

export function StepNetworkCheck({ deploy, goBack, goToReview }: Props) {
  const registryStatus = deploy.state.registryStatus;
  const chainId = useChainId();
  const chainConstants = appConstants[chainId as keyof typeof appConstants];
  const networkName = chainConstants?.chain.name ?? `Chain ${chainId}`;
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const [switchError, setSwitchError] = useState<string | undefined>();

  useEffect(() => {
    void deploy.startNetworkCheck();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSwitchToSepolia() {
    setSwitchError(undefined);
    try {
      await switchChainAsync({ chainId: sepolia.id });
      // The wallet's chainId change doesn't retrigger the registry check on its own —
      // re-run it against the network we just switched to.
      void deploy.startNetworkCheck();
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : "Failed to switch network");
    }
  }

  const status = registryStatus;

  if (!status || status.isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Network Check</h2>
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Checking {networkName}…</span>
        </div>
      </div>
    );
  }

  if (!status.isSupported) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Network Check</h2>
        <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4 text-sm text-red-300">
          Community creation is not yet supported on <strong>{networkName}</strong>. Switch to Sepolia to continue.
        </div>
        {switchError && <p className="text-xs text-red-400">{switchError}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-1 min-h-[44px] py-2 px-4 rounded-lg border border-gray-600 text-gray-300
              hover:bg-gray-700 transition-colors text-sm"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => void handleSwitchToSepolia()}
            disabled={isSwitching}
            className="flex-1 min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
              hover:bg-accent-hover transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSwitching ? "Switching…" : "Switch to Sepolia"}
          </button>
        </div>
      </div>
    );
  }

  if (!status.isReady) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Network Check</h2>
        <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4 text-sm text-red-300 space-y-2">
          <p>
            ZuGov infrastructure is not fully deployed on <strong>{networkName}</strong>.
          </p>
          {status.error && <p className="text-xs text-red-400 font-mono">{status.error}</p>}
          <p className="text-xs text-red-400">
            Contact the ZuGov team to deploy or configure the registry for this network.
          </p>
        </div>
        <button
          type="button"
          onClick={goBack}
          className="w-full min-h-[44px] py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Network Check</h2>
      <div className="rounded-lg border border-green-700/50 bg-green-900/20 p-4 text-sm text-green-300 flex items-start gap-2">
        <span className="mt-0.5">✓</span>
        <span>
          Ready — all infrastructure is available on <strong>{networkName}</strong>. 3 transactions required to deploy
          your community.
        </span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goToReview}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
