import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import * as discussionApi from "@/src/services/discussionApi";
import type { Discussion } from "@/src/services/discussionApi";
import * as membershipApi from "@/src/services/membershipApi";
import { useIsCommunityAdmin, useHasTierPermission } from "@/src/hooks/useMembershipPermission";
import { CreateDiscussionModal } from "../../components/CreateDiscussionModal";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

interface DiscussionsSectionProps {
  communityId: string;
  connected: boolean;
  walletAddress?: string;
  /** Composed by the caller, same as page.tsx already does for the Settings link.
   * createIdentity() normally enrolls the creator on a full-permission tier, so `membershipStatus`
   * alone usually covers them — but `reconcileCreatorAddress` can repoint `creatorAddress` to a
   * new on-chain owner with NO memberships row ever inserted (the same edge case D5's backend
   * gate explicitly carves out). `useIsCommunityAdmin` deliberately doesn't check creatorAddress
   * on its own (see that hook's doc comment), so this must be passed in explicitly. */
  isCreator?: boolean;
}

function formatDate(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function DiscussionRow({
  communityId,
  discussion,
  walletAddress,
  isCommunityAdmin,
  onEdit,
  onDeleted,
}: {
  communityId: string;
  discussion: Discussion;
  walletAddress?: string;
  isCommunityAdmin: boolean;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { signOut } = useSiwe();

  const isAuthor = !!walletAddress && discussion.authorAddress.toLowerCase() === walletAddress.toLowerCase();
  // Author edits/deletes their own post; an admin who isn't the author can delete but not edit
  // (D3) — a member's own words are never silently rewritten by someone else.
  const canDelete = isAuthor || isCommunityAdmin;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setActionError(null);
    try {
      await withAuthDetect(() => discussionApi.deleteDiscussion(communityId, discussion.id), signOut);
      onDeleted();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete discussion");
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{discussion.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(discussion.createdAt)}</p>
        </div>
        {canDelete &&
          (confirmingDelete ? (
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-gray-400">Delete this post?</span>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="text-error hover:text-error-hover font-medium disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Confirm"}
              </button>
              <button onClick={() => setConfirmingDelete(false)} className="text-gray-400 hover:text-foreground">
                Never mind
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              {isAuthor && (
                <button
                  onClick={onEdit}
                  className="p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-800 rounded"
                  aria-label="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="p-1.5 text-gray-400 hover:text-error hover:bg-gray-800 rounded"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
      </div>
      <p className="text-sm text-gray-300 whitespace-pre-wrap">{discussion.body}</p>
      {actionError && <p className="text-xs text-error">{actionError}</p>}
    </div>
  );
}

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D5) — renders nothing at all
// (not even a wrapper) for a disconnected/non-member viewer, redundant with (not a substitute
// for) the backend's own member-row-OR-admin gate. Existence itself is meant to stay invisible to
// non-members, so there's no "there are discussions here" teaser either.
export function DiscussionsSection({
  communityId,
  connected,
  walletAddress,
  isCreator = false,
}: DiscussionsSectionProps) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const isCommunityAdmin = useIsCommunityAdmin(communityId, connected);
  const canPostDiscussions = useHasTierPermission(communityId, connected, "canPostDiscussions");

  const { data: membershipStatus } = useQuery({
    queryKey: ["membershipStatus", communityId],
    queryFn: () => membershipApi.getMembershipStatus(communityId),
    enabled: connected,
  });
  const canAccess = membershipStatus?.status === "member" || isCommunityAdmin || isCreator;

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["discussions", communityId, walletAddress],
    queryFn: () => discussionApi.listDiscussions(communityId),
    enabled: canAccess,
  });

  const invalidateAndClose = () => {
    queryClient.invalidateQueries({ queryKey: ["discussions", communityId] });
    setShowCreateModal(false);
    setEditingDiscussion(null);
  };

  if (!canAccess) return null;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Discussions</h2>
        {canPostDiscussions && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover"
          >
            <Plus className="w-4 h-4" />
            New Discussion
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-24" />
          <div className="h-12 bg-gray-800/60 rounded" />
        </div>
      )}

      {!isLoading && discussions.length === 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6 text-center">
          <p className="text-sm text-gray-400">No discussions yet.</p>
          {canPostDiscussions && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-sm font-medium text-accent-hover hover:underline"
            >
              Start the first one
            </button>
          )}
        </div>
      )}

      {discussions.length > 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 divide-y divide-gray-800">
          {discussions.map((discussion) => (
            <DiscussionRow
              key={discussion.id}
              communityId={communityId}
              discussion={discussion}
              walletAddress={walletAddress}
              isCommunityAdmin={isCommunityAdmin}
              onEdit={() => setEditingDiscussion(discussion)}
              onDeleted={() => queryClient.invalidateQueries({ queryKey: ["discussions", communityId] })}
            />
          ))}
        </div>
      )}

      <CreateDiscussionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={invalidateAndClose}
        communityId={communityId}
      />
      <CreateDiscussionModal
        isOpen={!!editingDiscussion}
        onClose={() => setEditingDiscussion(null)}
        onSuccess={invalidateAndClose}
        communityId={communityId}
        editingDiscussion={editingDiscussion}
      />
    </div>
  );
}
