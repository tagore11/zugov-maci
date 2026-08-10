import { useState } from "react";
import { DEFAULT_MEMBERSHIP_TIERS } from "@/app/lib/placeholder-data";
import type { TierDraft, MembershipPolicy } from "@/src/services/checkpointStore";

interface Props {
  initialTiers?: TierDraft[];
  initialMembershipPolicy?: MembershipPolicy;
  initialTierChangesRequireVote?: boolean;
  initialDefaultTierLabel?: string;
  setMembershipTiers: (
    tiers: TierDraft[],
    membershipPolicy: MembershipPolicy,
    tierChangesRequireVote: boolean,
    defaultTierLabel: string,
  ) => void;
  goBack: () => void;
}

export function StepMembershipTiers({
  initialTiers = DEFAULT_MEMBERSHIP_TIERS,
  initialMembershipPolicy = "open",
  initialTierChangesRequireVote = false,
  initialDefaultTierLabel = "Regular",
  setMembershipTiers,
  goBack,
}: Props) {
  const [tiers, setTiers] = useState<TierDraft[]>(initialTiers);
  const [membershipPolicy, setMembershipPolicy] = useState<MembershipPolicy>(initialMembershipPolicy);
  const [tierChangesRequireVote, setTierChangesRequireVote] = useState(initialTierChangesRequireVote);
  const [defaultTierLabel, setDefaultTierLabel] = useState(initialDefaultTierLabel);
  const [submitted, setSubmitted] = useState(false);

  const labelsError =
    submitted && tiers.some((t) => t.label.trim().length === 0) ? "Every tier needs a name" : undefined;
  const tiersEmptyError = submitted && tiers.length === 0 ? "At least one tier is required" : undefined;
  const defaultTierMissing = !tiers.some((t) => t.label === defaultTierLabel);

  function updateTier(index: number, patch: Partial<TierDraft>) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTier(index: number) {
    const removedLabel = tiers[index]?.label;
    if (tiers.length <= 1) return; // never leave zero tiers
    setTiers((prev) => prev.filter((_, i) => i !== index));
    if (removedLabel === defaultTierLabel) {
      setDefaultTierLabel(tiers.find((_, i) => i !== index)?.label ?? "");
    }
  }

  function addTier() {
    setTiers((prev) => [
      ...prev,
      {
        label: `Tier ${prev.length + 1}`,
        canCreateGovernanceActions: false,
        canVote: false,
        canManageMembership: false,
      },
    ]);
  }

  function handleNext() {
    setSubmitted(true);
    if (tiers.length === 0 || tiers.some((t) => t.label.trim().length === 0) || defaultTierMissing) return;
    setMembershipTiers(tiers, membershipPolicy, tierChangesRequireVote, defaultTierLabel);
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Membership Tiers</h2>
      <p className="text-sm text-gray-400">
        Define the tiers members can hold and their permissions. Starts from the default set — rename, adjust, add, or
        remove tiers as needed.
      </p>

      <div className="space-y-3">
        {tiers.map((tier, i) => (
          <div key={i} className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tier.label}
                onChange={(e) => updateTier(i, { label: e.target.value })}
                className="flex-1 px-2 py-1.5 rounded-md border border-gray-700 bg-gray-900 text-sm text-white
                  focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => removeTier(i)}
                disabled={tiers.length <= 1}
                className="text-xs text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed px-2"
              >
                Remove
              </button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tier.canCreateGovernanceActions}
                  onChange={(e) => updateTier(i, { canCreateGovernanceActions: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-300">Can create polls</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tier.canVote}
                  onChange={(e) => updateTier(i, { canVote: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-300">Can vote</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tier.canManageMembership}
                  onChange={(e) => updateTier(i, { canManageMembership: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-300">Can manage membership</span>
              </label>
            </div>
          </div>
        ))}
        {labelsError && <p className="text-xs text-red-400">{labelsError}</p>}
        {tiersEmptyError && <p className="text-xs text-red-400">{tiersEmptyError}</p>}
        <button type="button" onClick={addTier} className="text-sm text-purple-400 hover:text-purple-300">
          + Add tier
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Default tier for new members</label>
        <select
          value={defaultTierLabel}
          onChange={(e) => setDefaultTierLabel(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {tiers.map((t, i) => (
            <option key={i} value={t.label}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Membership policy</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="membershipPolicy"
              checked={membershipPolicy === "open"}
              onChange={() => setMembershipPolicy("open")}
              className="border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Open (auto-approve)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="membershipPolicy"
              checked={membershipPolicy === "approval"}
              onChange={() => setMembershipPolicy("approval")}
              className="border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Approval required</span>
          </label>
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={tierChangesRequireVote}
          onChange={(e) => setTierChangesRequireVote(e.target.checked)}
          className="mt-0.5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
        />
        <span className="text-sm text-gray-300">
          Tier changes require a community vote
          <span className="block text-xs text-gray-500">
            Not yet available — enabling this blocks tier edits entirely until governance actions ship.
          </span>
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={goBack}
          className="flex-1 py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-2 px-4 rounded-lg bg-purple-600 text-white font-medium
            hover:bg-purple-700 transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
