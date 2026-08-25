import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

function InviteToUnionForm({ unionId, actingCommunityId }: { unionId: string; actingCommunityId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 409 (duplicate invite) permanently disables re-inviting this pair rather than letting the
  // user retry into the same error (Design Issue 2, locked).
  const [invited, setInvited] = useState(false);
  const { signOut } = useSiwe();

  async function handleInvite() {
    if (!targetId.trim()) return;
    setError(null);
    setIsInviting(true);
    try {
      await withAuthDetect(
        () => communityApi.inviteToUnion(unionId, { communityId: targetId.trim(), actingCommunityId }),
        signOut,
      );
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
        className="text-xs font-medium text-accent-hover hover:text-accent transition-colors"
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
        className="flex-1 min-w-[10rem] px-3 py-2 rounded-[6px] bg-gray-800 border border-gray-600 text-foreground placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-accent disabled:opacity-60"
      />
      <button
        type="button"
        onClick={() => void handleInvite()}
        disabled={isInviting || invited || !targetId.trim()}
        className="min-h-[44px] px-3 py-2 rounded-[6px] bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        {isInviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {isInviting ? "Inviting…" : invited ? "Invited" : "Invite"}
      </button>
      {error && <p className="text-xs text-red-400 w-full">{error}</p>}
    </div>
  );
}

/** Child D (formalize-communities epic), /plan-eng-review 2026-08-25 — union invite response,
 * invite-to-union, and leave-union for ONE community, scoped by communityId. Relocated from
 * manage-communities/UnionsPanel.tsx's per-community UnionMembershipRow (which iterated every
 * community a wallet owns in one combined dashboard panel) to this community's own settings
 * page. Create Union stays on /manage-communities — it's cross-community by nature (picks a
 * founding community from a dropdown of all owned ones), doesn't fit a single community's
 * settings page. */
export function UnionMembershipSection({ communityId }: { communityId: string }) {
  const queryClient = useQueryClient();
  const [respondingUnionId, setRespondingUnionId] = useState<string | null>(null);
  const [leavingUnionId, setLeavingUnionId] = useState<string | null>(null);
  const [errorByUnionId, setErrorByUnionId] = useState<Record<string, string>>({});
  const { signOut } = useSiwe();

  // Shared query key with the community detail page's UnionsSection — same cache entry, no
  // duplicate network request when both are mounted.
  const { data: unions, isLoading } = useQuery({
    queryKey: ["communityUnions", communityId],
    queryFn: () => communityApi.listUnionsForCommunity(communityId),
  });

  async function respond(unionId: string, accept: boolean) {
    setErrorByUnionId((prev) => ({ ...prev, [unionId]: "" }));
    setRespondingUnionId(unionId);
    try {
      await withAuthDetect(() => communityApi.respondToUnionInvite(unionId, { communityId, accept }), signOut);
      void queryClient.invalidateQueries({ queryKey: ["communityUnions", communityId] });
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

  // No confirm modal — matches Decline's existing pattern (fire immediately, surface any error
  // inline). Reversible: a re-invite after leaving resets straight back to pending.
  async function leave(unionId: string) {
    setErrorByUnionId((prev) => ({ ...prev, [unionId]: "" }));
    setLeavingUnionId(unionId);
    try {
      await withAuthDetect(() => communityApi.leaveUnion(unionId, { communityId }), signOut);
      void queryClient.invalidateQueries({ queryKey: ["communityUnions", communityId] });
    } catch (err) {
      const message =
        err instanceof communityApi.OwnershipError ||
        err instanceof communityApi.AuthError ||
        err instanceof communityApi.ConflictError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to leave union";
      setErrorByUnionId((prev) => ({ ...prev, [unionId]: message }));
    } finally {
      setLeavingUnionId(null);
    }
  }

  if (isLoading || !unions?.length) return null;

  return (
    <div className="rounded-lg border border-gray-700 p-3 space-y-2">
      <p className="text-sm font-medium text-foreground">Unions</p>
      <div className="space-y-2">
        {unions.map((union) => (
          <div key={union.id} className="pl-2 border-l-2 border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>{union.logo || "🤝"}</span>
                <span className="text-sm text-gray-300">{union.displayName}</span>
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
                    className="min-h-[44px] px-3 rounded-[6px] bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {respondingUnionId === union.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => void respond(union.id, false)}
                    disabled={respondingUnionId === union.id}
                    className="min-h-[44px] px-3 rounded-[6px] border border-gray-600 text-gray-300 text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <InviteToUnionForm unionId={union.id} actingCommunityId={communityId} />
                  <button
                    type="button"
                    onClick={() => void leave(union.id)}
                    disabled={leavingUnionId === union.id}
                    className="min-h-[44px] px-2 text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {leavingUnionId === union.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {leavingUnionId === union.id ? "Leaving…" : "Leave union"}
                  </button>
                </div>
              )}
            </div>
            {errorByUnionId[union.id] && <p className="text-xs text-red-400 mt-1">{errorByUnionId[union.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
