import { useAccount } from "wagmi";
import { useCreateCommunity } from "@/src/hooks/useCreateCommunity";
import type { WizardStep } from "@/src/hooks/useCreateCommunity";
import { StepMechanism } from "./StepMechanism";
import { StepCommunityInfo } from "./StepCommunityInfo";
import { StepMembershipTiers } from "./StepMembershipTiers";
import { StepMaciConfig } from "./StepMaciConfig";
import { StepReview } from "./StepReview";
import { StepNetworkCheck } from "./StepNetworkCheck";
import { StepDeploying } from "./StepDeploying";
import { StepSuccess } from "./StepSuccess";
import { getPendingCheckpoint, clearPendingCheckpoint } from "@/src/services/checkpointStore";
import { SiweGate } from "@/app/components/SiweGate";
import type { Hex } from "viem";

const STEP_LABELS: Record<WizardStep, string> = {
  mechanism: "Mechanism",
  community_info: "Community Info",
  membership_tiers: "Membership Tiers",
  maci_config: "MACI Config",
  network_check: "Network Check",
  review: "Review",
  deploying: "Deploying",
  success: "Done",
  error: "Error",
};

const VISIBLE_STEPS: WizardStep[] = [
  "mechanism",
  "community_info",
  "membership_tiers",
  "maci_config",
  "network_check",
  "review",
  "deploying",
  "success",
];

export function CreateCommunityWizard() {
  const { address } = useAccount();
  const {
    state,
    goToStep,
    goBack,
    setMechanism,
    setCommunityInfo,
    setMembershipTiers,
    setMaciConfig,
    startNetworkCheck,
    startDeployment,
    retryDeployment,
    saveCommunity,
    reset,
  } = useCreateCommunity();

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <p className="text-gray-300">Connect your wallet to create a community.</p>
      </div>
    );
  }

  const currentIdx = VISIBLE_STEPS.indexOf(state.step);
  const checkpoint = getPendingCheckpoint(address as Hex);

  return (
    <SiweGate message="Sign in to register your community globally">
      <div className="space-y-5">
        {/* Recovery banner */}
        {state.step === "mechanism" && checkpoint && (
          <div className="rounded-lg border border-yellow-600/50 bg-yellow-900/20 p-3 text-sm text-yellow-300 flex items-center justify-between gap-3">
            <span>You have an unfinished community creation.</span>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => goToStep("deploying")} className="underline hover:text-yellow-200">
                Resume
              </button>
              <button
                type="button"
                onClick={() => clearPendingCheckpoint(address as Hex)}
                className="text-yellow-500 hover:text-yellow-400"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Step progress */}
        {state.step !== "deploying" && state.step !== "success" && state.step !== "error" && (
          <div className="flex items-center gap-1">
            {VISIBLE_STEPS.filter((s) => s !== "deploying" && s !== "success" && s !== "error").map((step, idx) => {
              const isActive = step === state.step;
              const isDone = VISIBLE_STEPS.indexOf(state.step) > idx;
              return (
                <div key={step} className="flex items-center gap-1 flex-1">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      isDone ? "bg-purple-500" : isActive ? "bg-purple-400" : "bg-gray-700"
                    }`}
                  />
                  {idx < 4 && <div className="w-0.5" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Step label */}
        {state.step !== "deploying" && state.step !== "success" && state.step !== "error" && (
          <p className="text-xs text-gray-500">
            Step {currentIdx + 1} of {VISIBLE_STEPS.length} — {STEP_LABELS[state.step]}
          </p>
        )}

        {/* Step content */}
        {state.step === "mechanism" && <StepMechanism setMechanism={setMechanism} />}

        {state.step === "community_info" && (
          <StepCommunityInfo
            initialName={state.config.displayName}
            initialDescription={state.config.description}
            setCommunityInfo={setCommunityInfo}
            goBack={goBack}
          />
        )}

        {state.step === "membership_tiers" && (
          <StepMembershipTiers
            initialTiers={state.config.tiers}
            initialMembershipPolicy={state.config.membershipPolicy}
            initialTierChangesRequireVote={state.config.tierChangesRequireVote}
            initialDefaultTierLabel={state.config.defaultTierLabel}
            setMembershipTiers={setMembershipTiers}
            goBack={goBack}
          />
        )}

        {state.step === "maci_config" && (
          <StepMaciConfig
            initialPolicies={state.config.allowedPolicies}
            initialModes={state.config.supportedModes}
            initialSignUpPolicy={state.config.signUpPolicy}
            initialVoterCapacityPreset={state.config.voterCapacityPreset}
            setMaciConfig={setMaciConfig}
            goBack={goBack}
          />
        )}

        {state.step === "network_check" && (
          <StepNetworkCheck
            registryStatus={state.registryStatus}
            startNetworkCheck={startNetworkCheck}
            goBack={goBack}
            goToReview={() => goToStep("review")}
          />
        )}

        {state.step === "review" && <StepReview state={state} startDeployment={startDeployment} goBack={goBack} />}

        {(state.step === "deploying" || state.step === "error") && (
          <StepDeploying state={state} retryDeployment={retryDeployment} saveCommunity={saveCommunity} />
        )}

        {state.step === "success" && <StepSuccess communityId={state.deployedCommunityId} reset={reset} />}
      </div>
    </SiweGate>
  );
}
