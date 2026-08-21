import { useState } from "react";
import { X } from "lucide-react";
import * as zupollApi from "@/src/services/zupollApi";

interface CreateZupollProposalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  communityId: string;
  /** Every tier with canVote — Zupoll has no separate eligibility-policy picker (research.md #5:
   * eligibility reuses the community's existing tier data, no adapter-specific config). */
  votingTierIds: string[];
}

/** specs/013-zupoll-decision-adapter, User Story 2 — a single question, at least two distinct
 * non-empty options, and an expiry. Created immediately (FR-002) — no draft/co-sponsorship
 * stage, regardless of the community's directDeploymentEnabled setting (that flag gates MACI's
 * on-chain deploy risk, which doesn't apply to an off-chain DB insert). */
export function CreateZupollProposal({
  isOpen,
  onClose,
  onSuccess,
  communityId,
  votingTierIds,
}: CreateZupollProposalProps) {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiry, setExpiry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filledOptions = options.map((o) => o.trim()).filter((o) => o !== "");
  const hasDuplicates = new Set(filledOptions.map((o) => o.toLowerCase())).size !== filledOptions.length;
  const canSubmit = title.trim() !== "" && filledOptions.length >= 2 && !hasDuplicates && !!expiry;

  const resetForm = () => {
    setTitle("");
    setOptions(["", ""]);
    setExpiry("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await zupollApi.createZupollProposal(communityId, {
        title: title.trim(),
        options: filledOptions,
        eligibleTierIds: votingTierIds,
        pollEndDate: Math.floor(new Date(expiry).getTime() / 1000),
      });
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full my-8">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">New Zupoll Survey</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="zupoll-question" className="block text-sm font-semibold text-foreground mb-2">
              Question *
            </label>
            <input
              id="zupoll-question"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Should we hold a community potluck?"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Options * (at least 2)</label>
            <div className="space-y-2">
              {options.map((option, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    placeholder={`Option ${i + 1}`}
                    onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setOptions(options.filter((_, j) => j !== i))}
                      className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setOptions([...options, ""])}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:border-accent hover:text-accent-hover transition-colors font-medium"
              >
                + Add Option
              </button>
              {hasDuplicates && <p className="text-xs text-amber-400">Options must be distinct.</p>}
            </div>
          </div>

          <div>
            <label htmlFor="zupoll-expiry" className="block text-sm font-semibold text-foreground mb-2">
              Closes *
            </label>
            <input
              id="zupoll-expiry"
              type="datetime-local"
              required
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-800 text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="flex-1 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create Survey"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
