import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { Header } from "../../../components/Header";
import { ArrowLeft } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";
import * as membershipApi from "@/src/services/membershipApi";
import * as eligibilityApi from "@/src/services/eligibilityApi";
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

export default function EditCommunityPage() {
  const params = useParams();
  const communityId = params.id!;
  const navigate = useNavigate();
  const { address } = useAccount();
  const { signOut } = useSiwe();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [membershipPolicy, setMembershipPolicy] = useState<MembershipPolicy>("open");
  const [tierChangesRequireVote, setTierChangesRequireVote] = useState(false);
  const [directDeploymentEnabled, setDirectDeploymentEnabled] = useState(false);
  const [defaultTierLabel, setDefaultTierLabel] = useState("");
  const [tiers, setTiers] = useState<EditableTier[]>([]);
  const [originalTierIds, setOriginalTierIds] = useState<Set<string>>(new Set());
  const [eligibilityRules, setEligibilityRules] = useState<RuleDraft[]>([]);
  const [governanceConfigured, setGovernanceConfigured] = useState(false);
  const [creatorAddress, setCreatorAddress] = useState<string | null>(null);
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false);

  const tiersLocked = tierChangesRequireVote;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [community, tierRows, membershipStatus, rules] = await Promise.all([
        communityApi.get(communityId),
        membershipApi.getTiers(communityId),
        membershipApi.getMembershipStatus(communityId),
        eligibilityApi.getRuleset(communityId),
      ]);
      if (cancelled) return;
      if (!community) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setDisplayName(community.displayName);
      setDescription(community.description ?? "");
      setLogo(community.logo ?? "");
      setMembershipPolicy(community.membershipPolicy);
      setTierChangesRequireVote(community.tierChangesRequireVote);
      setDirectDeploymentEnabled(community.directDeploymentEnabled);
      setGovernanceConfigured(community.governanceConfigured);
      setCreatorAddress(community.creatorAddress);
      setTiers(tierRows);
      setOriginalTierIds(new Set(tierRows.map((t) => t.id)));
      setEligibilityRules(rules.map(({ id: _id, ...draft }) => draft));
      const defaultTier = tierRows.find((t) => t.id === community.defaultTierId);
      setDefaultTierLabel(defaultTier?.label ?? tierRows[0]?.label ?? "");
      // Frontend authorization gate (2026-08-19 community-creation-rework review, D6) — this
      // page previously had none; relying on the backend alone was low-risk when the worst case
      // was a rejected PATCH, but the new "Deploy governance now" button raises the stakes to
      // real gas cost for an unauthorized wallet, so gate the whole page section, not just that
      // button.
      const memberTier =
        membershipStatus.status === "member" ? tierRows.find((t) => t.label === membershipStatus.tierLabel) : undefined;
      setIsCommunityAdmin(!!memberTier?.canManageMembership);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [communityId]);

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
              });
            } else {
              await membershipApi.createTier(communityId, tier);
            }
          }
        }

        await eligibilityApi.replaceRuleset(communityId, eligibilityRules);
      }, signOut);

      navigate(`/community/${communityId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Loading community…</p>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Community not found.</p>
          <Link to="/manage-communities" className="text-accent-hover hover:text-accent font-medium">
            Back to Manage Communities
          </Link>
        </main>
      </div>
    );
  }

  const isCreator = !!address && !!creatorAddress && address.toLowerCase() === creatorAddress.toLowerCase();
  const isAuthorized = isCreator || isCommunityAdmin;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Only this community&apos;s creator or an admin can manage it.</p>
          <Link to="/manage-communities" className="text-accent-hover hover:text-accent font-medium">
            Back to Manage Communities
          </Link>
        </main>
      </div>
    );
  }

  const deployConfig: DeployGovernanceConfig = {
    displayName,
    signUpPolicy: DEFAULT_ADVANCED_CONFIG.signUpPolicy,
    allowedPolicies: [...DEFAULT_ADVANCED_CONFIG.allowedPolicies],
    supportedModes: [...DEFAULT_ADVANCED_CONFIG.supportedModes],
  };

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/manage-communities"
          className="inline-flex items-center gap-2 text-accent-hover hover:text-accent mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Communities
        </Link>

        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Edit Community</h1>
            <Link
              to={`/manage-communities/${communityId}/members`}
              className="text-sm font-medium text-accent-hover hover:text-accent"
            >
              Review pending requests →
            </Link>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Governance</h2>
            {governanceConfigured ? (
              <p className="text-sm text-gray-400">Governance is configured for this community.</p>
            ) : (
              <DeployGovernanceSection communityId={communityId} config={deployConfig} />
            )}
          </div>

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
                checked={tierChangesRequireVote}
                onChange={(e) => setTierChangesRequireVote(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Tier changes require a community vote
                <span className="block text-xs text-gray-500">
                  Not yet available — enabling this blocks tier edits.
                </span>
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
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors text-base disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
