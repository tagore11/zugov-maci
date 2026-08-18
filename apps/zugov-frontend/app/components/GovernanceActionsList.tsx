import { useState, useEffect } from "react";
import { useChainId } from "wagmi";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JsonRpcProvider } from "ethers";
import * as governanceActionApi from "@/src/services/governanceActionApi";
import type {
  GovernanceActionWithMeta,
  GovernanceActionTallyMechanism,
  VoteEligibilityReason,
} from "@/src/services/governanceActionApi";
import * as communityApi from "@/src/services/communityApi";
import type { Community } from "@/src/services/communityApi";
import { useDeployPoll, getEthersSigner } from "@/src/hooks/useDeployPoll";
import { deployPolicyContract } from "@/src/services/policyDeploy";
import { GovernanceTypes, appConstants } from "@/src/config";
import { Poll__factory } from "@/src/poll-factory-shim";
import type { SubgraphPoll, PollMode } from "@/src/services/subgraph";
import { CreateGovernanceActionModal } from "./CreateGovernanceActionModal";
import { VoteModal } from "./VoteModal";
import { computePollStatus, pollStatusLabel, pollStatusClass } from "@/src/lib/pollStatus";

interface GovernanceActionsListProps {
  communityId: string;
  connected: boolean;
}

const VOTE_REASON_LABELS: Record<VoteEligibilityReason, string> = {
  tier_lacks_voting_rights: "Your current tier doesn't grant voting rights.",
  tier_not_eligible_for_action: "Your tier isn't eligible for this governance action.",
  not_formalized: "This governance action hasn't formalized yet.",
  poll_closed: "Voting has closed for this poll.",
};

function VoteEligibilityBadge({ communityId, actionId }: { communityId: string; actionId: string }) {
  const { data } = useQuery({
    queryKey: ["voteEligibility", communityId, actionId],
    queryFn: () => governanceActionApi.checkVoteEligibility(communityId, actionId),
  });
  if (!data) return null;
  if (data.eligible) {
    return (
      <span className="text-xs font-medium text-green-300 bg-green-900/30 px-2 py-1 rounded-full">You can vote</span>
    );
  }
  return (
    <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
      {data.reason ? VOTE_REASON_LABELS[data.reason] : "Not eligible to vote"}
    </span>
  );
}

/** Poll start/end dates + options aren't captured at draft time (specs/005) — collected here,
 * immediately before the real on-chain deploy, mirroring CreateProposalModal's own fields for
 * the same data (research.md #5 of specs/006). */
function DeployPollPrompt({
  communityId,
  action,
  maciAddress,
  pollDeployConfig,
  onDeployed,
}: {
  communityId: string;
  action: GovernanceActionWithMeta;
  maciAddress: string;
  pollDeployConfig: NonNullable<Community["pollDeployConfig"]>;
  onDeployed: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const chainId = useChainId();
  const { isDeploying, deployStep, deployError, deployPoll } = useDeployPoll(GovernanceTypes.MACI);

  const filledOptionCount = options.filter((o) => o.trim() !== "").length;
  const hasEnoughOptions = filledOptionCount >= 2;

  const handleDeploy = async () => {
    setConfirmError(null);
    try {
      // No eligibility picker here (see CreateGovernanceActionModal for that) — matches this
      // prompt's prior behavior of always deploying a fresh FreeForAll policy.
      const signer = await getEthersSigner();
      const policyAddress = await deployPolicyContract({ type: "FreeForAll" }, signer, chainId);
      const { pollAddress, pollId, txHash } = await deployPoll({
        maciAddress,
        pollDeployConfig,
        existingPollAddress: null,
        policyAddress,
        formData: {
          title: action.title,
          description: action.description,
          votingMechanism: action.tallyMechanism,
          startDate,
          endDate,
          eligibility: "FreeForAll",
          options,
        },
      });
      await governanceActionApi.confirmFormalize(communityId, action.id, {
        pollAddress,
        pollId,
        txHash,
        pollStartDate: Math.floor(new Date(startDate).getTime() / 1000),
        pollEndDate: Math.floor(new Date(endDate).getTime() / 1000),
      });
      onDeployed();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Poll deployment failed");
    }
  };

  return (
    <div className="text-xs bg-amber-900/20 border border-amber-700 rounded p-3 space-y-2">
      <p className="text-amber-300">Ready to formalize — deploy the real on-chain poll.</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
          aria-label="Poll start date"
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
          aria-label="Poll end date"
        />
      </div>
      {options.map((option, i) => (
        <input
          key={i}
          type="text"
          value={option}
          placeholder={`Option ${i + 1}`}
          onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
        />
      ))}
      <button
        onClick={handleDeploy}
        disabled={isDeploying || !startDate || !endDate || !hasEnoughOptions}
        className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {isDeploying ? (deployStep ?? "Deploying...") : "Deploy Poll"}
      </button>
      {!hasEnoughOptions && <p className="text-gray-400">At least two options are required.</p>}
      {(deployError ?? confirmError) && <p className="text-red-400">{deployError ?? confirmError}</p>}
    </div>
  );
}

// FR-002's executable combination is always onchain + (simple|quadratic|ranked|full) — "weighted"
// can never reach a formalized action, per the axis-combination validation at draft creation.
const TALLY_MECHANISM_TO_MODE: Record<GovernanceActionTallyMechanism, PollMode> = {
  simple: "1",
  quadratic: "0",
  ranked: "3",
  full: "2",
  weighted: "1",
};

/** Builds the SubgraphPoll shape VoteModal (unmodified, per specs/005 plan.md) expects, from a
 * live on-chain read of the deployed Poll contract's `voteOptions()` count — there is no subgraph
 * for backend-registered communities, and the poll's option *labels* aren't recoverable once
 * deployed (the Poll contract only exposes the count, not the label strings). VoteModal already
 * falls back to "Option 1"/"Option 2"... placeholders when `options` is null, so this is a
 * correct, real ballot — just without custom option labels. */
async function loadPollForVoting(action: GovernanceActionWithMeta, rpcUrl: string): Promise<SubgraphPoll> {
  if (!action.pollAddress) throw new Error("Governance action has no deployed poll");
  const provider = new JsonRpcProvider(rpcUrl);
  const poll = Poll__factory.connect(action.pollAddress, provider);
  const voteOptions = (await poll.voteOptions()) as bigint;

  return {
    id: action.pollAddress,
    pollId: action.pollId ?? "0",
    name: action.title,
    metadata: action.description,
    startDate: "",
    endDate: "",
    voteOptions: voteOptions.toString(),
    options: null,
    mode: TALLY_MECHANISM_TO_MODE[action.tallyMechanism],
    policyType: "",
    policy: "",
  };
}

const IN_PROGRESS_TALLY_STATUSES: governanceActionApi.TallyStatus[] = ["pending", "processing"];

function TallySection({ communityId, action }: { communityId: string; action: GovernanceActionWithMeta }) {
  const queryClient = useQueryClient();
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const { data: status } = useQuery({
    queryKey: ["tallyStatus", communityId, action.id],
    queryFn: () => governanceActionApi.getTallyStatus(communityId, action.id),
    initialData: action,
    // Merge → generate → submit can take minutes to hours for a real-size poll — poll for
    // updates while it's actually running, stop once it lands on a terminal state.
    refetchInterval: (query) =>
      query.state.data && IN_PROGRESS_TALLY_STATUSES.includes(query.state.data.tallyStatus) ? 10000 : false,
  });

  const isClosed =
    !!action.pollStartDate &&
    !!action.pollEndDate &&
    computePollStatus(action.pollStartDate, action.pollEndDate) === "closed";
  if (!action.pollAddress || !isClosed) return null;

  const handleTally = async () => {
    setTriggerError(null);
    setIsTriggering(true);
    try {
      await governanceActionApi.triggerTally(communityId, action.id);
      await queryClient.invalidateQueries({ queryKey: ["tallyStatus", communityId, action.id] });
    } catch (err) {
      setTriggerError(err instanceof Error ? err.message : "Failed to trigger tallying");
    } finally {
      setIsTriggering(false);
    }
  };

  if (!status || status.tallyStatus === "not_started" || status.tallyStatus === "failed") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleTally}
          disabled={isTriggering}
          className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 disabled:opacity-60"
        >
          {isTriggering ? "Starting..." : status?.tallyStatus === "failed" ? "Retry Tally" : "Tally Results"}
        </button>
        {(status?.tallyError ?? triggerError) && (
          <p className="text-xs text-red-400">{status?.tallyError ?? triggerError}</p>
        )}
      </div>
    );
  }

  if (IN_PROGRESS_TALLY_STATUSES.includes(status.tallyStatus)) {
    return <p className="text-xs text-amber-300">Tallying in progress — this can take a while…</p>;
  }

  return <p className="text-xs text-emerald-400">Tallying complete.</p>;
}

function FormalizedActionRow({
  communityId,
  community,
  action,
}: {
  communityId: string;
  community: Community | undefined;
  action: GovernanceActionWithMeta;
}) {
  const { data: eligibility } = useQuery({
    queryKey: ["voteEligibility", communityId, action.id],
    queryFn: () => governanceActionApi.checkVoteEligibility(communityId, action.id),
  });
  const [votingPoll, setVotingPoll] = useState<SubgraphPoll | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const rpcUrl = community ? appConstants[community.chainId as keyof typeof appConstants]?.rpcUrl : undefined;

  const handleVoteClick = async () => {
    setLoadError(null);
    if (!rpcUrl) {
      setLoadError("Unsupported chain for this community");
      return;
    }
    try {
      setVotingPoll(await loadPollForVoting(action, rpcUrl));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load poll");
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{action.title}</h3>
          <p className="text-sm text-gray-400">{action.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <VoteEligibilityBadge communityId={communityId} actionId={action.id} />
          {eligibility?.eligible && action.pollAddress && (
            <button
              onClick={handleVoteClick}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
            >
              Vote
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">Formalized{action.pollAddress ? ` — poll ${action.pollAddress}` : ""}</p>
      {action.pollStartDate && action.pollEndDate && (
        <p className="text-xs">
          <span className={pollStatusClass(computePollStatus(action.pollStartDate, action.pollEndDate))}>
            {pollStatusLabel(computePollStatus(action.pollStartDate, action.pollEndDate))}
          </span>
          <span className="text-gray-500">
            {" "}
            · {new Date(action.pollStartDate * 1000).toLocaleString()} –{" "}
            {new Date(action.pollEndDate * 1000).toLocaleString()}
          </span>
        </p>
      )}
      <TallySection communityId={communityId} action={action} />
      {loadError && <p className="text-xs text-red-400">{loadError}</p>}
      {votingPoll && rpcUrl && (
        <VoteModal
          poll={votingPoll}
          maciAddress={communityId}
          rpcUrl={rpcUrl}
          governanceType={GovernanceTypes.MACI}
          onClose={() => setVotingPoll(null)}
          onSuccess={() => setVotingPoll(null)}
        />
      )}
    </div>
  );
}

function DraftRow({
  communityId,
  community,
  action,
  sponsorCount,
  thresholdMet,
  onFormalized,
}: {
  communityId: string;
  community: Community | undefined;
  action: GovernanceActionWithMeta;
  sponsorCount: number;
  thresholdMet: boolean;
  onFormalized: () => void;
}) {
  const queryClient = useQueryClient();
  const [isSponsoring, setIsSponsoring] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);
  const [authorizeState, setAuthorizeState] = useState<"idle" | "authorized" | "rejected">("idle");
  const [authorizeMessage, setAuthorizeMessage] = useState<string | null>(null);

  const runAuthorizeIfReady = async (met: boolean) => {
    if (!met) return;
    try {
      await governanceActionApi.authorizeFormalize(communityId, action.id);
      setAuthorizeState("authorized");
    } catch (err) {
      setAuthorizeState("rejected");
      setAuthorizeMessage(err instanceof Error ? err.message : "Formalization check failed");
    }
  };

  const handleSponsor = async () => {
    setIsSponsoring(true);
    setSponsorError(null);
    try {
      const result = await governanceActionApi.sponsor(communityId, action.id);
      queryClient.invalidateQueries({ queryKey: ["governanceActions", communityId] });
      await runAuthorizeIfReady(result.thresholdMet);
    } catch (err) {
      setSponsorError(err instanceof Error ? err.message : "Failed to sponsor");
    } finally {
      setIsSponsoring(false);
    }
  };

  // A draft can already be past threshold on load (e.g. auto-sponsorship at creation already
  // meets a default threshold of 0, or a page refresh after someone else's sponsor tipped it) —
  // without this, runAuthorizeIfReady only ever fired from inside handleSponsor's own click, so
  // "Threshold met — checking..." below would render forever with nothing actually checking.
  useEffect(() => {
    if (thresholdMet && authorizeState === "idle") {
      void runAuthorizeIfReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thresholdMet, authorizeState]);

  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{action.title}</h3>
          <p className="text-sm text-gray-400">{action.description}</p>
        </div>
        <button
          onClick={handleSponsor}
          disabled={isSponsoring}
          className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSponsoring ? "Sponsoring..." : "Sponsor"}
        </button>
      </div>
      <p className="text-xs text-gray-500">Sponsors: {sponsorCount} (draft — not yet formalized)</p>
      {sponsorError && <p className="text-xs text-red-400">{sponsorError}</p>}
      {authorizeState === "authorized" &&
        (community?.pollDeployConfig ? (
          <DeployPollPrompt
            communityId={communityId}
            action={action}
            maciAddress={communityId}
            pollDeployConfig={community.pollDeployConfig}
            onDeployed={onFormalized}
          />
        ) : (
          <p className="text-xs text-amber-300 bg-amber-900/20 border border-amber-700 rounded p-2">
            Ready to formalize — on-chain deployment isn't linked for this community yet.
          </p>
        ))}
      {authorizeState === "rejected" && authorizeMessage && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-700 rounded p-2">{authorizeMessage}</p>
      )}
      {thresholdMet && authorizeState === "idle" && (
        <p className="text-xs text-gray-500">Threshold met — checking formalization eligibility...</p>
      )}
    </div>
  );
}

export function GovernanceActionsList({ communityId, connected }: GovernanceActionsListProps) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data } = useQuery({
    queryKey: ["governanceActions", communityId],
    queryFn: () => governanceActionApi.list(communityId),
    enabled: connected,
  });

  // Same query key the community detail page (app/community/[id]/page.tsx) already fetches with —
  // React Query dedupes/shares the cache, so this is not an extra network request when that page
  // is the one rendering this component.
  const { data: community } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => communityApi.get(communityId),
    enabled: connected,
  });

  const actions = data?.governanceActions ?? [];
  const drafts = actions.filter((a) => a.status === "draft");
  const formalized = actions.filter((a) => a.status === "formalized");

  if (!connected) {
    return <p className="text-sm text-gray-500">Connect your wallet to view governance actions.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Governance Actions</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          {community?.directDeploymentEnabled ? "Deploy Poll" : "New Draft"}
        </button>
      </div>

      {actions.length === 0 && <p className="text-sm text-gray-500">No governance actions yet.</p>}

      {drafts.map((action) => (
        <DraftRow
          key={action.id}
          communityId={communityId}
          community={community ?? undefined}
          action={action}
          sponsorCount={action.sponsorCount}
          thresholdMet={action.thresholdMet}
          onFormalized={() => queryClient.invalidateQueries({ queryKey: ["governanceActions", communityId] })}
        />
      ))}

      {formalized.map((action) => (
        <FormalizedActionRow
          key={action.id}
          communityId={communityId}
          community={community ?? undefined}
          action={action}
        />
      ))}

      <CreateGovernanceActionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["governanceActions", communityId] })}
        communityId={communityId}
        directDeploymentEnabled={community?.directDeploymentEnabled}
        pollDeployConfig={community?.pollDeployConfig}
        community={community ?? undefined}
      />
    </div>
  );
}
