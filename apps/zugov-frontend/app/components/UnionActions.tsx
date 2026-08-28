import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";
import { InviteToUnionForm } from "./UnionMembershipSection";
import { useUnionMembershipActions } from "@/src/hooks/useUnionMembershipActions";

// Union-as-community merge (2026-08-28 /plan-eng-review D4 + /plan-design-review D14/D16/D17) —
// replaces <JoinSection> in CommunityLayout.tsx's persistent header action slot for
// type==='union' communities. A wallet never "joins" a union directly (its "members" are OTHER
// COMMUNITIES via unionMemberships, not wallets); this carries the same content
// UnionDetailPage's old "Your Actions" panels had, redistributed here rather than rewritten.
export function UnionActions({ unionId, connected }: { unionId: string; connected: boolean }) {
  const queryClient = useQueryClient();
  const [selectedActiveId, setSelectedActiveId] = useState("");
  const [selectedPendingId, setSelectedPendingId] = useState("");
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["union", unionId],
    queryFn: () => communityApi.getUnion(unionId),
    enabled: connected,
  });

  const { respond, leave, isResponding, isLeaving, errorFor } = useUnionMembershipActions(() =>
    queryClient.invalidateQueries({ queryKey: ["union", unionId] }),
  );

  if (!connected || isLoading || !data) return null;

  const { members, myActiveCommunityIds, myPendingCommunityIds } = data;

  const activeActingId = myActiveCommunityIds.includes(selectedActiveId)
    ? selectedActiveId
    : (myActiveCommunityIds[0] ?? "");
  const pendingActingId = myPendingCommunityIds.includes(selectedPendingId)
    ? selectedPendingId
    : (myPendingCommunityIds[0] ?? "");

  if (!myActiveCommunityIds.length && !myPendingCommunityIds.length) return null;

  return (
    <div className="space-y-4">
      {/* Design review D14 — a pending response needs this wallet's attention right now; an
          unanswered invite outranks ongoing-relationship management (invite/leave), so it
          renders first when a wallet has both relationships to this union simultaneously. */}
      {!!myPendingCommunityIds.length && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {displayNameFor(members, pendingActingId)} was invited
            </h3>
            <CandidatePicker
              label="Responding as"
              candidates={myPendingCommunityIds}
              members={members}
              selected={pendingActingId}
              onSelect={setSelectedPendingId}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void respond(unionId, pendingActingId, true)}
              disabled={isResponding(unionId, pendingActingId)}
              className="min-h-[44px] px-4 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isResponding(unionId, pendingActingId) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Accept
            </button>
            <button
              type="button"
              onClick={() => void respond(unionId, pendingActingId, false)}
              disabled={isResponding(unionId, pendingActingId)}
              className="min-h-[44px] px-4 rounded-[6px] border border-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Decline
            </button>
          </div>
          {errorFor(unionId, pendingActingId) && (
            <p className="text-xs text-red-400">{errorFor(unionId, pendingActingId)}</p>
          )}
        </div>
      )}

      {!!myActiveCommunityIds.length && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Your community: {displayNameFor(members, activeActingId)}
            </h3>
            <CandidatePicker
              label="Acting as"
              candidates={myActiveCommunityIds}
              members={members}
              selected={activeActingId}
              onSelect={setSelectedActiveId}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <InviteToUnionForm unionId={unionId} actingCommunityId={activeActingId} />
            {/* Design review D16 — matches JoinSection.tsx's own "Leave community" inline confirm
                exactly. UnionDetailPage's original leave button was a single unconfirmed click
                straight to the API; an accidental click had no recovery path short of a
                re-invite. */}
            {confirmingLeave ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Leave this union?</span>
                <button
                  onClick={() => {
                    void leave(unionId, activeActingId).then(() => setConfirmingLeave(false));
                  }}
                  disabled={isLeaving(unionId, activeActingId)}
                  className="text-error hover:text-error-hover font-medium disabled:opacity-60"
                >
                  {isLeaving(unionId, activeActingId) ? "Leaving…" : "Confirm"}
                </button>
                <button onClick={() => setConfirmingLeave(false)} className="text-gray-400 hover:text-foreground">
                  Never mind
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingLeave(true)}
                className="text-xs text-gray-400 hover:text-foreground transition-colors"
              >
                Leave union
              </button>
            )}
          </div>
          {errorFor(unionId, activeActingId) && (
            <p className="text-xs text-red-400">{errorFor(unionId, activeActingId)}</p>
          )}
        </div>
      )}
    </div>
  );
}

// community page redesign (/plan-eng-review 2026-08-26, D1/D5) — resolves a display name for a
// candidate community from the already-fetched members list (every candidate is, by definition,
// a member of this union) rather than a second fetch.
function displayNameFor(members: { communityId: string; displayName: string }[], communityId: string): string {
  return members.find((m) => m.communityId === communityId)?.displayName ?? communityId;
}

function CandidatePicker({
  label,
  candidates,
  members,
  selected,
  onSelect,
}: {
  label: string;
  candidates: string[];
  members: { communityId: string; displayName: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  if (candidates.length <= 1) return null;
  return (
    <label className="flex items-center gap-2 text-xs text-gray-400">
      {label}
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="px-2 py-1.5 rounded-[6px] bg-gray-800 border border-gray-600 text-foreground text-xs focus:outline-none focus:border-accent"
      >
        {candidates.map((id) => (
          <option key={id} value={id}>
            {displayNameFor(members, id)}
          </option>
        ))}
      </select>
    </label>
  );
}
