import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateCommunity } from "@/src/hooks/useCreateCommunity";
import type { WizardStep } from "@/src/hooks/useCreateCommunity";
import { StepCommunityInfo } from "./StepCommunityInfo";
import { StepCommunitySetup } from "./StepCommunitySetup";
import { StepReview } from "./StepReview";
import { StepNetworkCheck } from "./StepNetworkCheck";
import { StepDeploying } from "./StepDeploying";
import { StepSuccess } from "./StepSuccess";
import { getPendingCheckpoint, clearPendingCheckpoint } from "@/src/services/checkpointStore";
import { SiweGate } from "@/app/components/SiweGate";
import type { Hex } from "viem";

const STEP_LABELS: Record<WizardStep, string> = {
  community_info: "Community Info",
  community_setup: "Community Setup",
  network_check: "Network Check",
  review: "Review",
  deploying: "Deploying",
  success: "Done",
  error: "Error",
};

const VISIBLE_STEPS: WizardStep[] = [
  "community_info",
  "community_setup",
  "network_check",
  "review",
  "deploying",
  "success",
];

export function CreateCommunityWizard() {
  const { address } = useAccount();
  const { login } = usePrivy();
  const {
    state,
    goToStep,
    goBack,
    setCommunityInfo,
    setCommunitySetup,
    startNetworkCheck,
    startDeployment,
    retryDeployment,
    saveCommunity,
    reset,
  } = useCreateCommunity();

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-gray-300">Sign in to create a community.</p>
        <button
          type="button"
          onClick={() => login()}
          className="px-6 py-3 bg-accent text-white rounded-[6px] font-semibold hover:bg-accent-hover transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  const currentIdx = VISIBLE_STEPS.indexOf(state.step);
  const checkpoint = getPendingCheckpoint(address as Hex);

  return (
    <SiweGate message="Sign in to register your community globally">
      <div className="space-y-5">
        {/* Recovery banner */}
        {state.step === "community_info" && checkpoint && (
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
                      isDone ? "bg-accent" : isActive ? "bg-accent-hover" : "bg-gray-700"
                    }`}
                  />
                  {idx < 3 && <div className="w-0.5" />}
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
        {state.step === "community_info" && (
          <StepCommunityInfo
            initialName={state.config.displayName}
            initialDescription={state.config.description}
            initialParentCommunityId={state.config.parentCommunityId}
            setCommunityInfo={setCommunityInfo}
            goBack={goBack}
          />
        )}

        {state.step === "community_setup" && (
          <StepCommunitySetup
            initialMembershipPolicy={state.config.membershipPolicy}
            initialSignUpPolicy={state.config.signUpPolicy}
            initialPolicies={state.config.allowedPolicies}
            initialModes={state.config.supportedModes}
            setCommunitySetup={setCommunitySetup}
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
