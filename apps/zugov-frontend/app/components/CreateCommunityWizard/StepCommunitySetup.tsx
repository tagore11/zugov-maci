import { useState } from "react";
import type { MembershipPolicy } from "@/src/services/checkpointStore";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";
import { RESIDENT_ORGANIZER_TIERS } from "@/src/hooks/useCreateCommunity";
import { TierEditor, type EditableTier } from "@/app/components/TierEditor";

interface Props {
  initialMembershipPolicy?: MembershipPolicy;
  initialTiers?: EditableTier[];
  // Community creation wizard fix (2026-08-21) — lifted from local state into
  // useCreateCommunity's own state, single source of truth shared with CreateCommunityModal's
  // X-button gating (see useCreateCommunity.ts's WizardState.isSubmitting).
  isSubmitting: boolean;
  setCommunitySetup: UseCreateCommunityResult["setCommunitySetup"];
  goBack: UseCreateCommunityResult["goBack"];
}

export function StepCommunitySetup({
  initialMembershipPolicy,
  initialTiers,
  isSubmitting,
  setCommunitySetup,
  goBack,
}: Props) {
  const [membershipPolicy, setMembershipPolicy] = useState<MembershipPolicy>(initialMembershipPolicy ?? "open");
  // Pre-filled with the Resident/Organizer preset, fully editable (2026-08-19
  // community-creation-rework review, D3) — matches today's actual default so nothing changes
  // for a creator who clicks straight through, but they can now rename, adjust permissions on,
  // add, or remove tiers instead of being stuck with the preset. The first tier in the list is
  // the default tier a new member lands in, mirroring the original hardcoded "Resident" default.
  const [tiers, setTiers] = useState<EditableTier[]>(initialTiers ?? RESIDENT_ORGANIZER_TIERS);
  const [submitError, setSubmitError] = useState<string | undefined>();

  async function handleNext() {
    setSubmitError(undefined);
    if (tiers.length === 0) {
      setSubmitError("Add at least one tier.");
      return;
    }

    try {
      await setCommunitySetup({ membershipPolicy, tiers, defaultTierLabel: tiers[0].label });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create community identity");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Who&apos;s in your community?</h2>
        <p className="text-sm text-gray-400 mt-1">You&apos;ll be the first Organizer.</p>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-300">Who can join?</span>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setMembershipPolicy("open")}
            aria-pressed={membershipPolicy === "open"}
            className={`w-full min-h-[44px] text-left p-3 rounded-lg border transition-colors ${
              membershipPolicy === "open"
                ? "border-accent bg-accent/10"
                : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/60"
            }`}
          >
            <div className="font-medium text-foreground text-sm">Anyone can join</div>
            <div className="text-xs text-gray-400 mt-0.5">Residents join instantly, no approval needed.</div>
          </button>
          <button
            type="button"
            onClick={() => setMembershipPolicy("approval")}
            aria-pressed={membershipPolicy === "approval"}
            className={`w-full min-h-[44px] text-left p-3 rounded-lg border transition-colors ${
              membershipPolicy === "approval"
                ? "border-accent bg-accent/10"
                : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/60"
            }`}
          >
            <div className="font-medium text-foreground text-sm">Organizers approve new residents</div>
            <div className="text-xs text-gray-400 mt-0.5">Join requests wait for an Organizer to approve them.</div>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-300">Tiers</span>
        <TierEditor tiers={tiers} onChange={setTiers} />
      </div>

      {submitError && <p className="text-xs text-red-400">{submitError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={goBack}
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void handleNext()}
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover transition-colors text-sm disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Create Community"}
        </button>
      </div>
    </div>
  );
}
