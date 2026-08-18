import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users2, X } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";

type OwnedCommunity = { id: string; name: string; logo: string };

function CreateUnionModal({
  isOpen,
  onClose,
  communities,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  communities: OwnedCommunity[];
  onCreated: () => void;
}) {
  const [foundingCommunityId, setFoundingCommunityId] = useState(communities[0]?.id ?? "");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!foundingCommunityId || !displayName.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await communityApi.createUnion({
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        foundingCommunityId,
      });
      setDisplayName("");
      setDescription("");
      onCreated();
      onClose();
    } catch (err) {
      if (err instanceof communityApi.OwnershipError || err instanceof communityApi.AuthError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create union");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create Union</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Founding community <span className="text-red-400">*</span>
            </label>
            <select
              value={foundingCommunityId}
              onChange={(e) => setFoundingCommunityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[6px] bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-[#648DAF]"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Union name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Pop-up City Alliance"
              className="w-full px-4 py-2.5 rounded-[6px] bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-[#648DAF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              maxLength={500}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full px-4 py-2.5 rounded-[6px] bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-[#648DAF] resize-none"
            />
          </div>

          {error && (
            <div className="rounded-[6px] border border-red-900/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !foundingCommunityId || !displayName.trim()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-[6px] bg-[#648DAF] text-white font-semibold hover:bg-[#86A6C1] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Creating…" : "Create Union"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InviteToUnionForm({ unionId, actingCommunityId }: { unionId: string; actingCommunityId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 409 (duplicate invite) permanently disables re-inviting this pair rather than letting the
  // user retry into the same error (Design Issue 2, locked).
  const [invited, setInvited] = useState(false);

  async function handleInvite() {
    if (!targetId.trim()) return;
    setError(null);
    setIsInviting(true);
    try {
      await communityApi.inviteToUnion(unionId, { communityId: targetId.trim(), actingCommunityId });
      setInvited(true);
    } catch (err) {
      if (err instanceof communityApi.ConflictError) {
        setError("Already invited");
        setInvited(true);
      } else if (err instanceof communityApi.OwnershipError) {
        setError("You don't have permission to invite for this community");
      } else {
        setError(err instanceof Error ? err.message : "Failed to invite");
      }
    } finally {
      setIsInviting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-[#2D5F8A] hover:text-[#244d70] transition-colors"
      >
        Invite a community
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <input
        type="text"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        disabled={invited}
        placeholder="Community ID"
        className="flex-1 min-w-[10rem] px-3 py-2 rounded-[6px] bg-white border border-gray-300 text-gray-900 placeholder-gray-400 font-mono text-xs focus:outline-none focus:border-[#2D5F8A] disabled:opacity-60"
      />
      <button
        type="button"
        onClick={() => void handleInvite()}
        disabled={isInviting || invited || !targetId.trim()}
        className="min-h-[44px] px-3 py-2 rounded-[6px] bg-[#2D5F8A] text-white text-xs font-medium hover:bg-[#244d70] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        {isInviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {isInviting ? "Inviting…" : invited ? "Invited" : "Invite"}
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </div>
  );
}

function UnionMembershipRow({ community }: { community: OwnedCommunity }) {
  const queryClient = useQueryClient();
  const [respondingUnionId, setRespondingUnionId] = useState<string | null>(null);
  const [errorByUnionId, setErrorByUnionId] = useState<Record<string, string>>({});

  // Shared query key with the community detail page's UnionsSection — same cache entry, no
  // duplicate network request when both are mounted.
  const { data: unions, isLoading } = useQuery({
    queryKey: ["communityUnions", community.id],
    queryFn: () => communityApi.listUnionsForCommunity(community.id),
  });

  async function respond(unionId: string, accept: boolean) {
    setErrorByUnionId((prev) => ({ ...prev, [unionId]: "" }));
    setRespondingUnionId(unionId);
    try {
      await communityApi.respondToUnionInvite(unionId, { communityId: community.id, accept });
      void queryClient.invalidateQueries({ queryKey: ["communityUnions", community.id] });
    } catch (err) {
      const message =
        err instanceof communityApi.OwnershipError || err instanceof communityApi.AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to respond";
      setErrorByUnionId((prev) => ({ ...prev, [unionId]: message }));
    } finally {
      setRespondingUnionId(null);
    }
  }

  if (isLoading || !unions?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-3 space-y-2">
      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
        <span className="text-lg">{community.logo || "🏛️"}</span>
        {community.name}
      </p>
      <div className="space-y-2">
        {unions.map((union) => (
          <div key={union.id} className="pl-2 border-l-2 border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>{union.logo || "🤝"}</span>
                <span className="text-sm text-gray-700">{union.displayName}</span>
                {union.status === "pending" && (
                  <span className="text-xs text-gray-500">Invited — awaiting response</span>
                )}
              </div>

              {union.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void respond(union.id, true)}
                    disabled={respondingUnionId === union.id}
                    className="min-h-[44px] px-3 rounded-[6px] bg-[#2D5F8A] text-white text-xs font-medium hover:bg-[#244d70] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {respondingUnionId === union.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => void respond(union.id, false)}
                    disabled={respondingUnionId === union.id}
                    className="min-h-[44px] px-3 rounded-[6px] border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <InviteToUnionForm unionId={union.id} actingCommunityId={community.id} />
              )}
            </div>
            {errorByUnionId[union.id] && <p className="text-xs text-red-600 mt-1">{errorByUnionId[union.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function UnionsPanel({ communities }: { communities: OwnedCommunity[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  if (communities.length === 0) return null;

  function refreshAllUnions() {
    for (const c of communities) {
      void queryClient.invalidateQueries({ queryKey: ["communityUnions", c.id] });
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users2 className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Unions</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-sm font-medium text-[#2D5F8A] hover:text-[#244d70] transition-colors"
        >
          + Create union
        </button>
      </div>

      <div className="space-y-3">
        {communities.map((c) => (
          <UnionMembershipRow key={c.id} community={c} />
        ))}
      </div>

      <CreateUnionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        communities={communities}
        onCreated={refreshAllUnions}
      />
    </div>
  );
}
