import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateCommunity, DEFAULT_ADVANCED_CONFIG, type WizardStep } from "@/src/hooks/useCreateCommunity";
import { StepCommunityInfo } from "./StepCommunityInfo";
import { StepCommunitySetup } from "./StepCommunitySetup";
import { StepReview } from "./StepReview";
import { StepNetworkCheck } from "./StepNetworkCheck";
import { StepDeploying } from "./StepDeploying";
import { StepSuccess } from "./StepSuccess";
import { SiweGate } from "@/app/components/SiweGate";
import { useSiwe } from "@/src/hooks/useSiwe";

const STEP_LABELS: Record<WizardStep, string> = {
  community_info: "Community Info",
  community_setup: "Community Setup",
  network_check: "Network Check",
  review: "Review",
  deploying: "Deploying",
  success: "Done",
  error: "Error",
};

// Only the identity-creation steps get a numbered progress bar — network_check/review/deploying
// are now reached from a separate, optional "deploy governance" opt-in on the success screen
// (2026-08-19 community-creation-rework review, D2), not a continuation of the same sequence.
const PROGRESS_STEPS: WizardStep[] = ["community_info", "community_setup"];

export function CreateCommunityWizard() {
  const { address } = useAccount();
  const { login } = usePrivy();
  // One shared instance, passed to both SiweGate and useCreateCommunity — a session invalidated
  // by an AuthError partway through (withAuthRetry's signOut()) is reflected in the gate
  // immediately instead of the gate's own stale copy still believing isAuthenticated: true
  // (2026-08-19 community-creation-rework review, D4).
  const siwe = useSiwe();
  const {
    state,
    deploy,
    goToStep,
    goBack,
    setCommunityInfo,
    setCommunitySetup,
    resumeCheckpoint,
    dismissCheckpoint,
    reset,
  } = useCreateCommunity(siwe);

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

  const showProgress = PROGRESS_STEPS.includes(state.step);
  const currentIdx = PROGRESS_STEPS.indexOf(state.step);

  const membershipDescription =
    state.config.membershipPolicy === "approval"
      ? "Organizers approve new residents before they can join."
      : "Anyone can join instantly.";
  const roleLabels = (state.config.tiers ?? []).map((t) => t.label);
  const deployConfig = state.config.displayName
    ? {
        displayName: state.config.displayName,
        signUpPolicy: state.config.signUpPolicy ?? DEFAULT_ADVANCED_CONFIG.signUpPolicy,
        allowedPolicies: state.config.allowedPolicies ?? DEFAULT_ADVANCED_CONFIG.allowedPolicies,
        supportedModes: state.config.supportedModes ?? DEFAULT_ADVANCED_CONFIG.supportedModes,
      }
    : undefined;

  return (
    <SiweGate message="Sign in to register your community globally" siwe={siwe}>
      <div className="space-y-5">
        {/* Recovery banner */}
        {state.step === "community_info" && state.pendingCheckpoint && (
          <div className="rounded-lg border border-yellow-600/50 bg-yellow-900/20 p-3 text-sm text-yellow-300 flex items-center justify-between gap-3">
            <span>You have an unfinished community creation.</span>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={resumeCheckpoint} className="underline hover:text-yellow-200">
                Resume
              </button>
              <button type="button" onClick={dismissCheckpoint} className="text-yellow-500 hover:text-yellow-400">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Step progress */}
        {showProgress && (
          <div className="flex items-center gap-1">
            {PROGRESS_STEPS.map((step, idx) => {
              const isActive = step === state.step;
              const isDone = currentIdx > idx;
              return (
                <div key={step} className="flex items-center gap-1 flex-1">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      isDone ? "bg-accent" : isActive ? "bg-accent-hover" : "bg-gray-700"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Step label */}
        {showProgress && (
          <p className="text-xs text-gray-500">
            Step {currentIdx + 1} of {PROGRESS_STEPS.length} — {STEP_LABELS[state.step]}
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
            initialTiers={state.config.tiers}
            setCommunitySetup={setCommunitySetup}
            goBack={goBack}
          />
        )}

        {state.step === "network_check" && (
          <StepNetworkCheck deploy={deploy} goBack={() => goToStep("success")} goToReview={() => goToStep("review")} />
        )}

        {state.step === "review" && deployConfig && (
          <StepReview
            config={deployConfig}
            membershipDescription={membershipDescription}
            roleLabels={roleLabels}
            deploy={deploy}
            goBack={() => goToStep("network_check")}
          />
        )}

        {(state.step === "deploying" || state.step === "error") && <StepDeploying deploy={deploy} />}

        {state.step === "success" && (
          <StepSuccess
            communityId={state.identityCommunityId}
            governanceConfigured={deploy.state.isDeployed}
            onDeployNow={() => goToStep("network_check")}
            reset={reset}
          />
        )}
      </div>
    </SiweGate>
  );
}
