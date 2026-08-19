import { useEffect, useState } from "react";
import * as membershipApi from "@/src/services/membershipApi";
import * as eligibilityApi from "@/src/services/eligibilityApi";
import type { RuleDraft } from "@/src/services/eligibilityApi";
import { EligibilityRulesetEditor, type TierOption } from "@/app/components/EligibilityRulesetEditor";

interface Props {
  // The identity created by community_setup — real, persisted (Architecture 1A/1B), so its
  // tiers already have server-assigned ids by the time this step renders (2026-08-19
  // eligibility-followups review, D2 — this step can only exist after community_setup for
  // exactly that reason).
  communityId: string;
  goBack: () => void;
  onContinue: () => void;
}

// Eligibility-followups review (2026-08-19), D2 — not a thin wrapper around
// EligibilityRulesetEditor: neither the wizard's own state nor community_setup's response
// carries a tier list (only defaultTierId), so this step fetches tiers itself, mirroring the
// edit page's own fetch-with-loading pattern (corrected during that review's outside-voice
// pass, which originally undercounted this as "thin").
export function StepEligibility({ communityId, goBack, onContinue }: Props) {
  const [tiers, setTiers] = useState<TierOption[]>([]);
  const [rules, setRules] = useState<RuleDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const tierRows = await membershipApi.getTiers(communityId);
      if (cancelled) return;
      setTiers(tierRows.map((t) => ({ id: t.id, label: t.label })));
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [communityId]);

  async function handleContinue() {
    setError(null);
    // Nothing to save when the creator adds no rules — a freshly created community already has
    // no ruleset row, which is exactly "Open" (2026-08-19 eligibility-adapters review, D4).
    // Skipping the call here avoids a pointless network round trip for the common case.
    if (rules.length === 0) {
      onContinue();
      return;
    }
    setSaving(true);
    try {
      await eligibilityApi.replaceRuleset(communityId, rules);
      onContinue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save eligibility rules");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Who can join?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Optional — compose eligibility rules now, or skip and configure them later from the community&apos;s edit
          page. With no rules, anyone can join (subject to the membership policy you already chose).
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading tiers…</p>
      ) : (
        <EligibilityRulesetEditor rules={rules} tiers={tiers} onChange={setRules} />
      )}

      {error && (
        <div className="rounded-lg border border-red-600/50 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>
      )}

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
          onClick={() => void handleContinue()}
          disabled={saving || loading}
          className="flex-1 py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
