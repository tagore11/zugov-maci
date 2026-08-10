import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as membershipApi from "@/src/services/membershipApi";
import * as governanceActionApi from "@/src/services/governanceActionApi";
import type {
  GovernanceActionExecutionLocation,
  GovernanceActionPrivacy,
  GovernanceActionTallyMechanism,
} from "@/src/services/governanceActionApi";

interface CreateGovernanceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: { sponsorCount: number; thresholdMet: boolean }) => void;
  communityId: string;
}

export function CreateGovernanceActionModal({
  isOpen,
  onClose,
  onSuccess,
  communityId,
}: CreateGovernanceActionModalProps) {
  const { data: tiers = [] } = useQuery({
    queryKey: ["tiers", communityId],
    queryFn: () => membershipApi.getTiers(communityId),
    enabled: isOpen,
  });
  const votingTiers = tiers.filter((t) => t.canVote);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy] = useState<GovernanceActionPrivacy>("privacy_preserving");
  const [executionLocation] = useState<GovernanceActionExecutionLocation>("onchain");
  const [tallyMechanism, setTallyMechanism] = useState<GovernanceActionTallyMechanism>("simple");
  const [eligibleTierIds, setEligibleTierIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTier = (tierId: string) => {
    setEligibleTierIds((prev) => (prev.includes(tierId) ? prev.filter((id) => id !== tierId) : [...prev, tierId]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (eligibleTierIds.length === 0) {
      setError("Select at least one eligible tier.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await governanceActionApi.createDraft(communityId, {
        title,
        description,
        privacy,
        executionLocation,
        tallyMechanism,
        eligibleTierIds,
      });
      setTitle("");
      setDescription("");
      setEligibleTierIds([]);
      onSuccess?.(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create governance action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Create Governance Action</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <label htmlFor="governance-action-title" className="block text-sm font-semibold text-gray-900 mb-3">
              Title *
            </label>
            <input
              id="governance-action-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="governance-action-description" className="block text-sm font-semibold text-gray-900 mb-3">
              Description *
            </label>
            <textarea
              id="governance-action-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Privacy</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                <input type="radio" checked readOnly className="w-5 h-5" />
                <span className="font-semibold text-gray-900">Privacy-preserving</span>
              </div>
              <div
                className="flex items-center gap-3 p-4 border-2 border-gray-100 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <input type="radio" disabled className="w-5 h-5" />
                <div>
                  <span className="font-semibold text-gray-900">Public</span>
                  <p className="text-xs text-gray-400">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Execution Location</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                <input type="radio" checked readOnly className="w-5 h-5" />
                <span className="font-semibold text-gray-900">Onchain</span>
              </div>
              {["Offchain", "Hybrid"].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-4 border-2 border-gray-100 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <input type="radio" disabled className="w-5 h-5" />
                  <div>
                    <span className="font-semibold text-gray-900">{label}</span>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Tally Mechanism *</label>
            <select
              value={tallyMechanism}
              onChange={(e) => setTallyMechanism(e.target.value as GovernanceActionTallyMechanism)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900"
            >
              <option value="simple">Simple Majority</option>
              <option value="quadratic">Quadratic Voting</option>
              <option value="ranked">Ranked Choice</option>
              <option value="weighted" disabled>
                Weighted (coming soon)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Eligible Tiers *</label>
            <div className="space-y-2">
              {votingTiers.length === 0 && (
                <p className="text-sm text-gray-500">No voting-capable tiers exist in this community yet.</p>
              )}
              {votingTiers.map((tier) => (
                <label
                  key={tier.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={eligibleTierIds.includes(tier.id)}
                    onChange={() => toggleTier(tier.id)}
                    className="w-5 h-5 rounded text-indigo-600"
                  />
                  <span className="text-gray-900">{tier.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
