import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Group } from "@semaphore-protocol/group";
import { generateProof } from "@semaphore-protocol/proof";
import * as zupollApi from "@/src/services/zupollApi";
import { useZupollIdentity } from "@/src/hooks/useZupollIdentity";
import { proposalScope } from "@/src/lib/zupollScope";

interface ZupollProposalVotingProps {
  communityId: string;
  proposalId: string;
  /** Unix seconds — used only to render a "Closed" state; the server is the actual source of
   * truth for expiry (FR-009), this is a display convenience, not an authorization check. */
  pollEndDate: number | null;
}

/** specs/013-zupoll-decision-adapter, User Story 3 — the anonymous voting flow. Fetches the
 * proposal's eligible-voter group, builds a Merkle tree client-side, generates a Semaphore proof
 * scoped to this exact proposal, and submits it to the deliberately unauthenticated vote
 * endpoint. Tallies are requested with the caller's own nullifier once voted — real server-side
 * reveal-gating (contracts/zupoll-api.md), not just a client-side convention. */
export function ZupollProposalVoting({ communityId, proposalId, pollEndDate }: ZupollProposalVotingProps) {
  const { ensureRegistered, recordVoted, getVotedNullifier } = useZupollIdentity(communityId);

  const [votedNullifier, setVotedNullifier] = useState<string | null>(() => getVotedNullifier(proposalId));
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpired = pollEndDate !== null && Date.now() / 1000 >= pollEndDate;

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["zupoll-group", proposalId],
    queryFn: () => zupollApi.fetchGroup(proposalId),
  });

  const { data: tally, refetch: refetchTally } = useQuery({
    queryKey: ["zupoll-tally", proposalId, votedNullifier],
    queryFn: () => zupollApi.fetchTally(proposalId, votedNullifier ?? undefined),
    enabled: !!group,
  });

  useEffect(() => {
    setVotedNullifier(getVotedNullifier(proposalId));
  }, [proposalId, getVotedNullifier]);

  const handleVote = async (optionIdx: number) => {
    setError(null);
    setIsVoting(true);
    try {
      const identity = await ensureRegistered();
      const freshGroup = await zupollApi.fetchGroup(proposalId);
      const semaphoreGroup = new Group(freshGroup.groupCommitments.map((c) => BigInt(c)));

      const proof = await generateProof(identity, semaphoreGroup, optionIdx, proposalScope(proposalId));
      await zupollApi.castVote(proposalId, proof);

      recordVoted(proposalId, proof.nullifier);
      setVotedNullifier(proof.nullifier);
      await refetchTally();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cast vote");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoadingGroup || !group) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  const revealed = tally?.revealed === true;
  const counts = revealed ? tally.counts : null;
  const total = counts ? counts.reduce((a, b) => a + b, 0) : 0;
  const canVote = !votedNullifier && !isExpired;

  return (
    <div className="p-4 border-2 border-gray-800 bg-gray-800/40 rounded-lg space-y-4">
      <p className="font-semibold text-foreground">{group.title}</p>

      <div className="space-y-2">
        {group.options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            disabled={!canVote || isVoting}
            onClick={() => handleVote(idx)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-sm text-foreground hover:border-accent disabled:cursor-default disabled:hover:border-gray-600"
          >
            <span>{option}</span>
            {revealed && counts && (
              <span className="text-gray-400">
                {counts[idx] ?? 0} vote{(counts[idx] ?? 0) === 1 ? "" : "s"}
                {total > 0 ? ` (${Math.round(((counts[idx] ?? 0) / total) * 100)}%)` : ""}
              </span>
            )}
          </button>
        ))}
      </div>

      {votedNullifier && <p className="text-sm text-accent-hover">You've voted on this survey.</p>}
      {isExpired && !votedNullifier && <p className="text-sm text-gray-400">This survey is closed.</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {isVoting && <p className="text-sm text-gray-400">Generating anonymous proof…</p>}
    </div>
  );
}
