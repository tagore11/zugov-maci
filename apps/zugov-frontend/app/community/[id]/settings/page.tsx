import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as membershipApi from "@/src/services/membershipApi";
import * as communityApi from "@/src/services/communityApi";
import * as eligibilityApi from "@/src/services/eligibilityApi";
import * as zupollApi from "@/src/services/zupollApi";
import { AttachZupollAdapter } from "@/app/components/AttachZupollAdapter";
import { RegisterExistingContract } from "@/app/components/RegisterExistingContract";
import { UnionMembershipSection } from "@/app/components/UnionMembershipSection";
import type { RuleDraft } from "@/src/services/eligibilityApi";
import type { MembershipPolicy } from "@/src/services/checkpointStore";
import { TierEditor, type EditableTier } from "@/app/components/TierEditor";
import { EligibilityRulesetEditor } from "@/app/components/EligibilityRulesetEditor";
import { SiweGate } from "@/app/components/SiweGate";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";
import {
  useDeployGovernance,
  DEFAULT_ADVANCED_CONFIG,
  type DeployGovernanceConfig,
} from "@/src/hooks/useCreateCommunity";
import { StepNetworkCheck } from "@/app/components/CreateCommunityWizard/StepNetworkCheck";
import { StepReview } from "@/app/components/CreateCommunityWizard/StepReview";
import { StepDeploying } from "@/app/components/CreateCommunityWizard/StepDeploying";
import type { CommunityOutletContext } from "../CommunityLayout";

type DeploySubStep = "idle" | "network_check" | "review" | "deploying";

// Deploying governance for an EXISTING off-chain community — the durable, cross-session "deploy
// later" entry point (2026-08-19 community-creation-rework review, D1). Reuses the exact same
// network_check/review/deploying step components and useDeployGovernance hook the wizard uses
// right after creation, just keyed by a community id that already exists instead of one just
// created in this session.
function DeployGovernanceSection({ communityId, config }: { communityId: string; config: DeployGovernanceConfig }) {
  const siwe = useSiwe();
  const deploy = useDeployGovernance(communityId, config, siwe);
  const [subStep, setSubStep] = useState<DeploySubStep>("idle");

  useEffect(() => {
    if (deploy.state.isDeployed) {
      // Full page reload is the simplest correct way to reflect the community's new
      // governanceConfigured: true everywhere on this page (this component's local state
      // otherwise has no way to know the parent's fetched community record is stale).
      window.location.reload();
    }
  }, [deploy.state.isDeployed]);

  if (subStep === "idle") {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 space-y-2">
        <p className="text-sm text-gray-400">Governance isn&apos;t configured for this community yet.</p>
        <button
          type="button"
          onClick={() => setSubStep("network_check")}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover"
        >
          Deploy governance now
        </button>
      </div>
    );
  }

  return (
    <SiweGate message="Sign in to deploy governance for this community">
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
        {subStep === "network_check" && (
          <StepNetworkCheck deploy={deploy} goBack={() => setSubStep("idle")} goToReview={() => setSubStep("review")} />
        )}
        {subStep === "review" && (
          <StepReview
            config={config}
            membershipDescription="Existing community members."
            roleLabels={[]}
            deploy={deploy}
            goBack={() => setSubStep("network_check")}
          />
        )}
      </div>
      {(deploy.state.currentPhase || deploy.state.errorMessage || deploy.state.completedPhases.length > 0) && (
        <div className="mt-4">
          <StepDeploying deploy={deploy} />
        </div>
      )}
    </SiweGate>
  );
}

// community page redesign (/plan-eng-review 2026-08-26, D4) — this page used to do its own
// hand-rolled useEffect + communityApi.get(communityId) fetch, completely separate from
// CommunityLayout's TanStack Query fetch of the same record, plus its own duplicate
// canManageMembership tier-lookup (the exact logic useIsCommunityAdmin already provides). Both
// are gone: `community`/`isCreator`/`isCommunityAdmin` now come from the layout's outlet context.
// This page keeps only its own settings-specific fetch (tiers/rules/decisionAdapters) and its own
// `!isAuthorized` gate — Layout does NOT enforce that gate, since other tabs stay visible to
// non-admins.
export default function CommunitySettingsPage() {
  const { community, isCreator, isCommunityAdmin } = useOutletContext<CommunityOutletContext>();
  const communityId = community.id;
  const navigate = useNavigate();
  const { signOut } = useSiwe();
  const queryClient = useQueryClient();

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(community.displayName);
  const [description, setDescription] = useState(community.description ?? "");
  const [logo, setLogo] = useState(community.logo ?? "");
  const [membershipPolicy, setMembershipPolicy] = useState<MembershipPolicy>(community.membershipPolicy);
  const [allowJoin, setAllowJoin] = useState(community.allowJoin);
  const [tierChangesRequireVote, setTierChangesRequireVote] = useState(community.tierChangesRequireVote);
  const [directDeploymentEnabled, setDirectDeploymentEnabled] = useState(community.directDeploymentEnabled);
  const [defaultTierLabel, setDefaultTierLabel] = useState("");
  const [tiers, setTiers] = useState<EditableTier[]>([]);
  const [originalTierIds, setOriginalTierIds] = useState<Set<string>>(new Set());
  const [eligibilityRules, setEligibilityRules] = useState<RuleDraft[]>([]);
  const [attachedAdapters, setAttachedAdapters] = useState<string[]>([]);

  const tiersLocked = tierChangesRequireVote;
  const isAuthorized = isCreator || isCommunityAdmin;

  useEffect(() => {
    if (!isAuthorized) return;
    let cancelled = false;
    async function load() {
      const [tierRows, rules, decisionAdapters] = await Promise.all([
        membershipApi.getTiers(communityId),
        eligibilityApi.getRuleset(communityId),
        zupollApi.listDecisionAdapters(communityId),
      ]);
      if (cancelled) return;
      setAttachedAdapters(decisionAdapters.adapters);
      setTiers(tierRows);
      setOriginalTierIds(new Set(tierRows.map((t) => t.id)));
      setEligibilityRules(rules.map(({ id: _id, ...draft }) => draft));
      const defaultTier = tierRows.find((t) => t.id === community.defaultTierId);
      setDefaultTierLabel(defaultTier?.label ?? tierRows[0]?.label ?? "");
      setSettingsLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
    // isAuthorized is stable for the lifetime of this mount (derived from context, not local
    // state this effect could invalidate) — only communityId/defaultTierId can actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, community.defaultTierId, isAuthorized]);

  // TierEditor owns add/remove/update internally (2026-08-19 review, D8) — this page only needs
  // to react to the resulting array and keep defaultTierLabel pointing at a tier that still
  // exists (the same reconciliation the old inline remove handler always did).
  function handleTierEditorChange(next: EditableTier[]) {
    if (next.length < tiers.length) {
      const removed = tiers.find((t) => !next.some((n) => (n.id ?? n.label) === (t.id ?? t.label)));
      if (removed && removed.label === defaultTierLabel) {
        setDefaultTierLabel(next[0]?.label ?? "");
      }
      // A removed tier can no longer be targeted or checked-for by an eligibility rule — drop
      // any rule that referenced it rather than letting the save fail on a dangling tierId.
      if (removed?.id) {
        setEligibilityRules((prev) =>
          prev.filter((rule) => {
            if (rule.targetTierId === removed.id) return false;
            if (rule.mechanism === "tier" && (rule.config as { tierId: string }).tierId === removed.id) return false;
            return true;
          }),
        );
      }
    }
    setTiers(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      // /plan-eng-review (2026-08-23) Batch 2 — one withAuthDetect wrap around the whole save
      // sequence, not one per call. All 5 writes below (communityApi.update, the tier CRUD
      // loop, eligibilityApi.replaceRuleset) are one atomic "save" action from the user's
      // perspective; a 401 on any of them should sign out exactly once, not risk firing signOut
      // multiple times if several calls in the sequence all 401 in a row. communityApi.update's
      // call here was the one call site Batch 1 missed — the wizard's call to the same function
      // was wrapped via withAuthRetry, but this edit-page call was left on the old generic catch.
      await withAuthDetect(async () => {
        await communityApi.update(communityId, {
          displayName: displayName.trim(),
          description: description.trim(),
          logo: logo.trim(),
          membershipPolicy,
          allowJoin,
          tierChangesRequireVote,
          directDeploymentEnabled,
          defaultTierLabel,
        });

        if (!tiersLocked) {
          const currentIds = new Set(tiers.filter((t) => t.id).map((t) => t.id!));
          for (const removedId of originalTierIds) {
            if (!currentIds.has(removedId)) {
              await membershipApi.deleteTier(communityId, removedId);
            }
          }
          for (const tier of tiers) {
            if (tier.id) {
              await membershipApi.updateTier(communityId, tier.id, {
                label: tier.label,
                canCreateProposals: tier.canCreateProposals,
                canVote: tier.canVote,
                canManageMembership: tier.canManageMembership,
                canCreateEvents: tier.canCreateEvents,
              });
            } else {
              await membershipApi.createTier(communityId, tier);
            }
          }
        }

        await eligibilityApi.replaceRuleset(communityId, eligibilityRules);
      }, signOut);

      // Bug fix (2026-08-28) — CommunityLayout.tsx caches the community under queryKey
      // ["community", communityId] with React Query's default staleTime; without invalidating it
      // here, navigate() below returns to a page still rendering the pre-save cached object (the
      // header, JoinSection, and every other tab all read from it), and only a full reload
      // (bypassing the cache entirely) previously showed the new values.
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      navigate(`/community/${communityId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">Only this community&apos;s creator or an admin can manage it.</p>
        <Link to="/manage-communities" className="text-accent-hover hover:text-accent font-medium">
          Back to Manage Communities
        </Link>
      </div>
    );
  }

  if (settingsLoading) {
    return <p className="text-gray-500">Loading settings…</p>;
  }

  const deployConfig: DeployGovernanceConfig = {
    displayName,
    signUpPolicy: DEFAULT_ADVANCED_CONFIG.signUpPolicy,
    allowedPolicies: [...DEFAULT_ADVANCED_CONFIG.allowedPolicies],
    supportedModes: [...DEFAULT_ADVANCED_CONFIG.supportedModes],
  };

  return (
    <>
      <Link
        to="/manage-communities"
        className="inline-flex items-center gap-2 text-accent-hover hover:text-accent mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Manage Communities
      </Link>

      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Community Settings</h1>
          <Link
            to={`/manage-communities/${communityId}/members`}
            className="text-sm font-medium text-accent-hover hover:text-accent"
          >
            Review pending requests →
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Governance</h2>
          {attachedAdapters.includes("maci") ? (
            <p className="text-sm text-gray-400">Governance is configured for this community.</p>
          ) : (
            <>
              <DeployGovernanceSection communityId={communityId} config={deployConfig} />
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="h-px flex-1 bg-gray-700" />
                or
                <div className="h-px flex-1 bg-gray-700" />
              </div>
              <RegisterExistingContract
                communityId={communityId}
                isAttached={false}
                onAttached={() => setAttachedAdapters((prev) => [...prev, "maci"])}
              />
            </>
          )}
          {attachedAdapters.includes("zupoll") ? (
            <p className="text-sm text-gray-400">Zupoll (anonymous surveys) is enabled for this community.</p>
          ) : (
            <AttachZupollAdapter
              communityId={communityId}
              isAttached={false}
              onAttached={() => setAttachedAdapters((prev) => [...prev, "zupoll"])}
            />
          )}
        </div>

        <UnionMembershipSection communityId={communityId} />

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Community Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Logo (emoji or URL)</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Membership Tiers *</label>
            <TierEditor tiers={tiers} onChange={handleTierEditorChange} locked={tiersLocked} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Eligibility Rules</label>
            <p className="text-xs text-gray-500 mb-3">
              Who is allowed to join, beyond the membership policy below — compose one or more conditions (optionally
              requiring several at once) with alternate ways to qualify. Existing members are never retroactively
              removed when this changes.
            </p>
            <EligibilityRulesetEditor
              rules={eligibilityRules}
              tiers={tiers.filter((t): t is EditableTier & { id: string } => !!t.id)}
              onChange={setEligibilityRules}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Default Tier</label>
            <select
              value={defaultTierLabel}
              onChange={(e) => setDefaultTierLabel(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-base"
            >
              {tiers.map((t, i) => (
                <option key={t.id ?? `new-${i}`} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Membership Policy</label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="membershipPolicy"
                  checked={membershipPolicy === "open"}
                  onChange={() => setMembershipPolicy("open")}
                />
                Open (auto-approve)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="membershipPolicy"
                  checked={membershipPolicy === "approval"}
                  onChange={() => setMembershipPolicy("approval")}
                />
                Approval required
              </label>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={allowJoin}
              onChange={(e) => setAllowJoin(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Allow people to join this community
              <span className="block text-xs text-gray-500">
                Independent of Membership Policy above — off means nobody can submit a join request at all, even under
                an open policy. Useful for registering a community before it's ready to accept members.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={tierChangesRequireVote}
              onChange={(e) => setTierChangesRequireVote(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Tier changes require a community vote
              <span className="block text-xs text-gray-500">Not yet available — enabling this blocks tier edits.</span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={directDeploymentEnabled}
              onChange={(e) => setDirectDeploymentEnabled(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Allow direct poll deployment (skip draft & co-sponsorship)
              <span className="block text-xs text-gray-500">
                When on, eligible members deploy a poll in one step instead of going through a draft.
              </span>
            </span>
          </label>

          {error && (
            <div className="rounded-lg border border-red-600/50 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>
          )}

          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <Link
              to="/manage-communities"
              className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center text-base"
            >
              Cancel
            </Link>
            {/* /plan-eng-review Phase B (2026-08-23) — Save Changes used to bypass SiweGate
                entirely, unlike this page's sibling register page, even though the save
                sequence's writes need a SIWE session. Wrapping only the button (not the whole
                form) matches the register page's own SiweGate placement. */}
            <div className="flex-1">
              <SiweGate message="Sign in to save changes">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors text-base disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </SiweGate>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
