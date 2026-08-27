import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import * as discussionApi from "@/src/services/discussionApi";
import type { Discussion } from "@/src/services/discussionApi";
import * as membershipApi from "@/src/services/membershipApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";
import { TierRestrictionPicker } from "./TierRestrictionPicker";

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  communityId: string;
  /** Present -> edit mode (pre-filled, PATCH, author-only). Absent/null -> create mode (POST).
   * Same modal, same fields, different submit verb — mirrors CreateEventModal.tsx's convention. */
  editingDiscussion?: Discussion | null;
}

export function CreateDiscussionModal({
  isOpen,
  onClose,
  onSuccess,
  communityId,
  editingDiscussion,
}: CreateDiscussionModalProps) {
  const isEdit = !!editingDiscussion;
  const { signOut } = useSiwe();

  const { data: tiers = [] } = useQuery({
    queryKey: ["tiers", communityId],
    queryFn: () => membershipApi.getTiers(communityId),
    enabled: isOpen,
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTier = (tierId: string) => {
    setSelectedTierIds((prev) => (prev.includes(tierId) ? prev.filter((id) => id !== tierId) : [...prev, tierId]));
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingDiscussion) {
      setTitle(editingDiscussion.title);
      setBody(editingDiscussion.body);
      setIsRestricted(editingDiscussion.eligibleTierIds !== null);
      setSelectedTierIds(editingDiscussion.eligibleTierIds ?? []);
    } else {
      setTitle("");
      setBody("");
      setIsRestricted(false);
      setSelectedTierIds([]);
    }
    setError(null);
  }, [isOpen, editingDiscussion]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasValidTierSelection = !isRestricted || selectedTierIds.length > 0;
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && hasValidTierSelection;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const eligibleTierIds = isRestricted ? selectedTierIds : null;
      await withAuthDetect(async () => {
        if (isEdit && editingDiscussion) {
          await discussionApi.updateDiscussion(communityId, editingDiscussion.id, { title, body, eligibleTierIds });
        } else {
          await discussionApi.createDiscussion(communityId, { title, body, eligibleTierIds });
        }
      }, signOut);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "create"} discussion`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discussion-modal-title"
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900 rounded-t-2xl z-10">
          <h2 id="discussion-modal-title" className="text-xl font-bold text-foreground">
            {isEdit ? "Edit Discussion" : "New Discussion"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="discussion-title" className="block text-sm font-semibold text-foreground mb-2">
              Title *
            </label>
            <input
              id="discussion-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="discussion-body" className="block text-sm font-semibold text-foreground mb-2">
              Body *
            </label>
            <textarea
              id="discussion-body"
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <TierRestrictionPicker
            tiers={tiers}
            isRestricted={isRestricted}
            onIsRestrictedChange={setIsRestricted}
            selectedTierIds={selectedTierIds}
            onToggleTier={toggleTier}
          />

          {error && (
            <div className="p-3 bg-error/10 border border-error/40 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-800 text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-60"
            >
              {isSubmitting ? (isEdit ? "Saving..." : "Posting...") : isEdit ? "Save Changes" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
