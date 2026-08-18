import { useChainId } from "wagmi";
import { appConstants } from "@/src/config";
import type { WizardState, DeployPhase, UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";

const PHASE_LABELS: Record<DeployPhase, string> = {
  deploy_sign_up_policy: "Deploy sign-up policy",
  deploy_maci: "Deploy MACI community",
  set_target: "Authorize MACI on policy",
  save_community: "Save community record",
};

const ALL_PHASES: DeployPhase[] = ["deploy_sign_up_policy", "deploy_maci", "set_target", "save_community"];

// Reads the block explorer straight off the wagmi Chain object for the connected network
// (appConstants[chainId].chain.blockExplorers) instead of hardcoding a single chain's URL —
// covers every chain in the supportedChains list (providers.tsx) automatically, including
// Ethereum Sepolia, without needing its own case here.
export function getBlockExplorerTxUrl(txHash: string, chainId: number | undefined): string {
  const chainConstants = chainId !== undefined ? appConstants[chainId as keyof typeof appConstants] : undefined;
  const explorerUrl = chainConstants?.chain.blockExplorers?.default.url;
  if (explorerUrl) return `${explorerUrl}/tx/${txHash}`;
  // No known explorer for this chain. In practice this branch shouldn't be reachable for a
  // real deployment tx — StepNetworkCheck already gates community creation to chains present
  // in appConstants (currently sepolia/scrollSepolia) — but if it is hit, link to Etherscan
  // as a last-resort guess rather than producing a dead href. Each chain has its own separate
  // explorer site (etherscan.io does NOT show non-Ethereum-chain transactions), so this will
  // be wrong for e.g. a Polygon tx — it's a fallback, not a real answer.
  return `https://etherscan.io/tx/${txHash}`;
}

interface Props {
  state: WizardState;
  retryDeployment: UseCreateCommunityResult["retryDeployment"];
  saveCommunity: UseCreateCommunityResult["saveCommunity"];
}

export function StepDeploying({ state, retryDeployment, saveCommunity }: Props) {
  const { completedPhases, currentPhase, currentTxHash, retryFromPhase } = state;
  const chainId = useChainId();

  const isError = state.step === "error";
  const isBackendFailure = isError && retryFromPhase === "save_community";
  // Restored from a checkpoint (e.g. after a page refresh) but nothing is actually
  // running — currentPhase is only set while runDeployment is mid-flight.
  const isResumable = state.step === "deploying" && !currentPhase && Boolean(retryFromPhase);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        {isError ? "Deployment failed" : isResumable ? "Deployment paused" : "Deploying…"}
      </h2>

      <div className="space-y-2">
        {ALL_PHASES.map((phase) => {
          const isDone = completedPhases.includes(phase);
          const isActive = currentPhase === phase;
          const isPending = !isDone && !isActive;

          return (
            <div
              key={phase}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                ${isActive ? "bg-accent/10 border border-accent/40" : ""}
                ${isDone ? "opacity-70" : ""}`}
            >
              {isDone && <span className="text-green-400 w-5 text-center">✓</span>}
              {isActive && (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {isPending && <span className="text-gray-600 w-5 text-center">○</span>}

              <span className={isDone ? "text-gray-400" : isActive ? "text-foreground" : "text-gray-600"}>
                {PHASE_LABELS[phase]}
              </span>
            </div>
          );
        })}
      </div>

      {currentTxHash && (
        <a
          href={getBlockExplorerTxUrl(currentTxHash, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-accent-hover hover:text-accent font-mono truncate"
        >
          {currentTxHash}
        </a>
      )}

      {isError && (
        <div className="space-y-3">
          <p className="text-sm text-red-400">{state.errorMessage}</p>
          {isBackendFailure ? (
            <button
              type="button"
              onClick={() => void saveCommunity()}
              className="w-full min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
                hover:bg-accent-hover transition-colors text-sm"
            >
              Save Community
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void retryDeployment()}
              className="w-full min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
                hover:bg-accent-hover transition-colors text-sm"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {isResumable && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            This deployment was interrupted (e.g. by a page refresh). Continue from where it left off — your wallet will
            prompt you for the next step.
          </p>
          <button
            type="button"
            onClick={() => void retryDeployment()}
            className="w-full min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
              hover:bg-accent-hover transition-colors text-sm"
          >
            Continue deployment
          </button>
        </div>
      )}
    </div>
  );
}
