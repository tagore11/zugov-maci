import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as zupollApi from "@/src/services/zupollApi";
import * as membershipApi from "@/src/services/membershipApi";
import { AttachZupollAdapter } from "./AttachZupollAdapter";
import { CreateZupollProposal } from "./CreateZupollProposal";
import { ZupollProposalVoting } from "./ZupollProposalVoting";

interface ZupollSectionProps {
  communityId: string;
  connected: boolean;
}

/** specs/013-zupoll-decision-adapter — ties the attach/create/vote pieces together for the
 * community page. A separate section from the MACI-oriented "Governance" block above it
 * (community/[id]/page.tsx) — Zupoll is an independent, additive decision adapter, not a
 * replacement, and a community can have it attached with or without MACI. */
export function ZupollSection({ communityId, connected }: ZupollSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: adaptersData, refetch: refetchAdapters } = useQuery({
    queryKey: ["zupoll-adapters", communityId],
    queryFn: () => zupollApi.listDecisionAdapters(communityId),
  });
  const isAttached = adaptersData?.adapters.includes("zupoll") ?? false;

  const { data: proposalsData, refetch: refetchProposals } = useQuery({
    queryKey: ["zupoll-proposals", communityId],
    queryFn: () => zupollApi.listZupollProposals(communityId),
    enabled: isAttached,
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["tiers", communityId],
    queryFn: () => membershipApi.getTiers(communityId),
    enabled: isAttached && isCreateOpen,
  });
  const votingTierIds = tiers.filter((t) => t.canVote).map((t) => t.id);

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Zupoll — Anonymous Surveys</h2>
        {isAttached && connected && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-hover"
          >
            New Survey
          </button>
        )}
      </div>

      {!isAttached ? (
        connected ? (
          <AttachZupollAdapter communityId={communityId} isAttached={false} onAttached={() => refetchAdapters()} />
        ) : (
          <p className="text-sm text-gray-500">Connect a wallet to attach Zupoll to this community.</p>
        )
      ) : (
        <div className="space-y-4">
          {!proposalsData?.proposals.length ? (
            <p className="text-sm text-gray-500">No surveys yet.</p>
          ) : (
            proposalsData.proposals.map((proposal) => (
              <ZupollProposalVoting
                key={proposal.id}
                communityId={communityId}
                proposalId={proposal.id}
                pollEndDate={proposal.pollEndDate}
              />
            ))
          )}
        </div>
      )}

      <CreateZupollProposal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetchProposals()}
        communityId={communityId}
        votingTierIds={votingTierIds}
      />
    </div>
  );
}
