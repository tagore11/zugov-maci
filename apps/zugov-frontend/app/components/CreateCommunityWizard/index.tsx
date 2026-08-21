import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useCreateCommunity, type WizardStep } from "@/src/hooks/useCreateCommunity";
import { StepCommunityInfo } from "./StepCommunityInfo";
import { StepCommunitySetup } from "./StepCommunitySetup";
import { StepSuccess } from "./StepSuccess";
import { SiweGate } from "@/app/components/SiweGate";
import { useSiwe } from "@/src/hooks/useSiwe";

const STEP_LABELS: Record<WizardStep, string> = {
  community_info: "Community Details",
  community_setup: "Community Setup",
  success: "Done",
};

// Community creation wizard fix (2026-08-21) — eligibility rules moved out of the wizard
// entirely (configured later from the community's edit page); the wizard is 2 real steps now,
// not 3. Every reachable step still counts toward this progress bar — just the full WizardStep
// set minus "success".
const PROGRESS_STEPS: WizardStep[] = ["community_info", "community_setup"];

interface Props {
  // Community creation wizard fix (2026-08-21) — reports the hook's isSubmitting up so
  // CreateCommunityModal can disable its X (close) button during the registerIdentity() call.
  // Before that call starts, closing is always safe — nothing has been created yet.
  onSubmittingChange?: (submitting: boolean) => void;
}

export function CreateCommunityWizard({ onSubmittingChange }: Props) {
  const { address } = useAccount();
  const { login } = usePrivy();
  // One shared instance, passed to both SiweGate and useCreateCommunity — a session invalidated
  // by an AuthError partway through (withAuthRetry's signOut()) is reflected in the gate
  // immediately instead of the gate's own stale copy still believing isAuthenticated: true
  // (2026-08-19 community-creation-rework review, D4).
  const siwe = useSiwe();
  const { state, goBack, setCommunityInfo, setCommunitySetup, reset } = useCreateCommunity(siwe);

  useEffect(() => {
    onSubmittingChange?.(state.isSubmitting);
  }, [state.isSubmitting, onSubmittingChange]);

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
            initialTiers={state.config.tiers}
            isSubmitting={state.isSubmitting}
            setCommunitySetup={setCommunitySetup}
            goBack={goBack}
          />
        )}

        {state.step === "success" && <StepSuccess communityId={state.identityCommunityId} reset={reset} />}
      </div>
    </SiweGate>
  );
}
