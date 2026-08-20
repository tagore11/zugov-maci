import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useCreateCommunity, type WizardStep } from "@/src/hooks/useCreateCommunity";
import { StepCommunityInfo } from "./StepCommunityInfo";
import { StepCommunitySetup } from "./StepCommunitySetup";
import { StepEligibility } from "./StepEligibility";
import { StepSuccess } from "./StepSuccess";
import { SiweGate } from "@/app/components/SiweGate";
import { useSiwe } from "@/src/hooks/useSiwe";

const STEP_LABELS: Record<WizardStep, string> = {
  community_info: "Community Info",
  community_setup: "Community Setup",
  eligibility: "Eligibility",
  success: "Done",
};

// Governance restructure Phase 1 (2026-08-20, D2): the wizard never deploys governance itself
// any more — that moved to an advanced setting on the edit page. Every reachable wizard step
// counts toward this progress bar now, so it's just the full WizardStep set minus "success".
const PROGRESS_STEPS: WizardStep[] = ["community_info", "community_setup", "eligibility"];

export function CreateCommunityWizard() {
  const { address } = useAccount();
  const { login } = usePrivy();
  // One shared instance, passed to both SiweGate and useCreateCommunity — a session invalidated
  // by an AuthError partway through (withAuthRetry's signOut()) is reflected in the gate
  // immediately instead of the gate's own stale copy still believing isAuthenticated: true
  // (2026-08-19 community-creation-rework review, D4).
  const siwe = useSiwe();
  const { state, goToStep, goBack, setCommunityInfo, setCommunitySetup, reset } = useCreateCommunity(siwe);

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

  return (
    <SiweGate message="Sign in to register your community globally" siwe={siwe}>
      <div className="space-y-5">
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
            initialCategory={state.config.category}
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

        {state.step === "eligibility" && state.identityCommunityId && (
          <StepEligibility
            communityId={state.identityCommunityId}
            goBack={goBack}
            onContinue={() => goToStep("success")}
          />
        )}

        {state.step === "success" && <StepSuccess communityId={state.identityCommunityId} reset={reset} />}
      </div>
    </SiweGate>
  );
}
