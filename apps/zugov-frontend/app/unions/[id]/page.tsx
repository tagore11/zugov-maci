import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "../../components/Header";
import * as communityApi from "@/src/services/communityApi";
import { InviteToUnionForm } from "@/app/components/UnionMembershipSection";
import { useUnionMembershipActions } from "@/src/hooks/useUnionMembershipActions";

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

export default function UnionDetailPage() {
  const params = useParams();
  const unionId = params.id ?? "";
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["union", unionId],
    queryFn: () => communityApi.getUnion(unionId),
    enabled: !!unionId,
  });

  const [selectedActiveId, setSelectedActiveId] = useState("");
  const [selectedPendingId, setSelectedPendingId] = useState("");

  const { respond, leave, isResponding, isLeaving, errorFor } = useUnionMembershipActions(() =>
    queryClient.invalidateQueries({ queryKey: ["union", unionId] }),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-400">Loading union...</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-400">Union not found.</p>
          <Link to="/unions" className="text-accent-hover hover:text-accent text-sm mt-2 inline-block">
            &larr; Back to Unions
          </Link>
        </main>
      </div>
    );
  }

  const { union, members, myActiveCommunityIds, myPendingCommunityIds } = data;
  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  const activeActingId = myActiveCommunityIds.includes(selectedActiveId)
    ? selectedActiveId
    : (myActiveCommunityIds[0] ?? "");
  const pendingActingId = myPendingCommunityIds.includes(selectedPendingId)
    ? selectedPendingId
    : (myPendingCommunityIds[0] ?? "");

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link to="/unions" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Unions
        </Link>

        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{union.logo || "🤝"}</div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{union.displayName}</h1>
              {union.description && <p className="text-gray-400 mt-2">{union.description}</p>}
            </div>
          </div>
        </div>

        {/* Your Actions — primary, above the member list (community page redesign,
            /plan-design-review 2026-08-26, Pass 1). Active-member and pending-member action
            sets are independent: a wallet can have both kinds of relationship to the same
            union, and each renders its own section with its own picker (D5). */}
        {!!myActiveCommunityIds.length && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Your community: {displayNameFor(members, activeActingId)}
              </h2>
              <CandidatePicker
                label="Acting as"
                candidates={myActiveCommunityIds}
                members={members}
                selected={activeActingId}
                onSelect={setSelectedActiveId}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <InviteToUnionForm unionId={union.id} actingCommunityId={activeActingId} />
              <button
                type="button"
                onClick={() => void leave(union.id, activeActingId)}
                disabled={isLeaving(union.id, activeActingId)}
                className="min-h-[44px] px-3 text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isLeaving(union.id, activeActingId) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isLeaving(union.id, activeActingId) ? "Leaving…" : "Leave union"}
              </button>
            </div>
            {errorFor(union.id, activeActingId) && (
              <p className="text-xs text-red-400">{errorFor(union.id, activeActingId)}</p>
            )}
          </div>
        )}

        {!!myPendingCommunityIds.length && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {displayNameFor(members, pendingActingId)} was invited
              </h2>
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
                onClick={() => void respond(union.id, pendingActingId, true)}
                disabled={isResponding(union.id, pendingActingId)}
                className="min-h-[44px] px-4 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isResponding(union.id, pendingActingId) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Accept
              </button>
              <button
                type="button"
                onClick={() => void respond(union.id, pendingActingId, false)}
                disabled={isResponding(union.id, pendingActingId)}
                className="min-h-[44px] px-4 rounded-[6px] border border-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Decline
              </button>
            </div>
            {errorFor(union.id, pendingActingId) && (
              <p className="text-xs text-red-400">{errorFor(union.id, pendingActingId)}</p>
            )}
          </div>
        )}

        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Member communities <span className="text-gray-500 font-normal">({activeMembers.length})</span>
          </h2>

          {activeMembers.length === 0 ? (
            <p className="text-sm text-gray-500">No active member communities.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeMembers.map((member) => (
                <Link
                  key={member.communityId}
                  to={`/community/${member.communityId}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-accent transition-colors"
                >
                  <span className="text-2xl">{member.logo || "🏛️"}</span>
                  <span className="font-medium text-foreground">{member.displayName}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Only present at all when the caller is authorized on an active member — the
              backend gates includePending, so an empty array here is indistinguishable from
              "not authorized to see pending invites," which is the correct default either way. */}
          {pendingMembers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Pending invites</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingMembers.map((member) => (
                  <div
                    key={member.communityId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-800/40"
                  >
                    <span className="text-2xl opacity-60">{member.logo || "🏛️"}</span>
                    <span className="text-gray-400">{member.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
