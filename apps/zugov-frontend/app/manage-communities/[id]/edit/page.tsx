import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "../../../components/Header";
import { ArrowLeft } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";
import * as membershipApi from "@/src/services/membershipApi";
import type { MembershipPolicy, TierDraft } from "@/src/services/checkpointStore";

type EditableTier = TierDraft & { id?: string };

export default function EditCommunityPage() {
  const params = useParams();
  const communityId = params.id!;
  const navigate = useNavigate();

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

  const tiersLocked = tierChangesRequireVote;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [community, tierRows] = await Promise.all([
        communityApi.get(communityId),
        membershipApi.getTiers(communityId),
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
      setTiers(tierRows);
      setOriginalTierIds(new Set(tierRows.map((t) => t.id)));
      const defaultTier = tierRows.find((t) => t.id === community.defaultTierId);
      setDefaultTierLabel(defaultTier?.label ?? tierRows[0]?.label ?? "");
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [communityId]);

  function updateTierField(index: number, patch: Partial<TierDraft>) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTierAt(index: number) {
    if (tiers.length <= 1) return;
    const removedLabel = tiers[index]?.label;
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
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
              canCreateGovernanceActions: tier.canCreateGovernanceActions,
              canVote: tier.canVote,
              canManageMembership: tier.canManageMembership,
            });
          } else {
            await membershipApi.createTier(communityId, tier);
          }
        }
      }

      navigate(`/community/${communityId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Loading community…</p>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Community not found.</p>
          <Link to="/manage-communities" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Manage Communities
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/manage-communities"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Communities
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Community</h1>
            <Link
              to={`/manage-communities/${communityId}/members`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Review pending requests →
            </Link>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Community Name *</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Logo (emoji or URL)</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">Membership Tiers *</label>
                {!tiersLocked && (
                  <button
                    type="button"
                    onClick={addTier}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add tier
                  </button>
                )}
              </div>
              {tiersLocked && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  This community's tier changes require a community vote, which is not yet available.
                </p>
              )}
              <div className="space-y-3">
                {tiers.map((tier, i) => (
                  <div key={tier.id ?? `new-${i}`} className="p-4 border-2 border-gray-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tier.label}
                        disabled={tiersLocked}
                        onChange={(e) => updateTierField(i, { label: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                      />
                      {!tiersLocked && (
                        <button
                          type="button"
                          onClick={() => removeTierAt(i)}
                          disabled={tiers.length <= 1}
                          className="text-xs text-red-500 hover:text-red-600 disabled:opacity-30 px-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          disabled={tiersLocked}
                          checked={tier.canCreateGovernanceActions}
                          onChange={(e) => updateTierField(i, { canCreateGovernanceActions: e.target.checked })}
                        />
                        Can create polls
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          disabled={tiersLocked}
                          checked={tier.canVote}
                          onChange={(e) => updateTierField(i, { canVote: e.target.checked })}
                        />
                        Can vote
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          disabled={tiersLocked}
                          checked={tier.canManageMembership}
                          onChange={(e) => updateTierField(i, { canManageMembership: e.target.checked })}
                        />
                        Can manage membership
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Default Tier</label>
              <select
                value={defaultTierLabel}
                onChange={(e) => setDefaultTierLabel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              >
                {tiers.map((t, i) => (
                  <option key={t.id ?? `new-${i}`} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Membership Policy</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="membershipPolicy"
                    checked={membershipPolicy === "open"}
                    onChange={() => setMembershipPolicy("open")}
                  />
                  Open (auto-approve)
                </label>
                <label className="flex items-center gap-2 text-sm">
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

            <label className="flex items-start gap-2 text-sm">
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

            <label className="flex items-start gap-2 text-sm">
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
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                to="/manage-communities"
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center text-base"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-base disabled:opacity-60"
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
