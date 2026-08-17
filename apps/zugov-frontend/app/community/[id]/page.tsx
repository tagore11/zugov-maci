import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import type { Keypair } from "@maci-protocol/domainobjs";
import { Header } from "../../components/Header";
import {
  Users,
  FileText,
  MessageSquare,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { getStoredVote } from "@/src/lib/voteStorage";
import { CreateProposalModal } from "../../components/CreateProposalModal";
import { VoteModal } from "../../components/VoteModal";
import { COMMUNITY_DATA, COMMUNITY_PROPOSALS, FORUM_POSTS } from "@/app/lib/placeholder-data";
import { appConstants, maciArtifacts, type GovernanceType, type PollDeployConfig } from "@/src/config";
import * as communityApi from "@/src/services/communityApi";
import { JoinSection } from "./JoinSection";
import { GovernanceActionsList } from "../../components/GovernanceActionsList";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import {
  fetchIsRegistered,
  fetchMembers,
  fetchPolls,
  fetchIsJoinedPoll,
  formatMaciUserId,
  type SubgraphPoll,
} from "@/src/services/subgraph";
import { fetchNumMessages, fetchIsEligible } from "@/src/services/readContract";
import { useMaci } from "@/src/context/MaciContext";
import { useSignup } from "@/src/hooks/useSignup";
import { useJoinPoll } from "@/src/hooks/useJoinPoll";

const DAO_CONFIG_LOOKUP: Record<
  string,
  {
    subgraphUrl: string;
    governanceType: GovernanceType;
    governanceContract: string;
    pollDeployConfig?: PollDeployConfig;
  }
> = Object.fromEntries(
  Object.values(appConstants).flatMap(({ daos }) =>
    Object.values(daos)
      .filter((dao) => dao.id)
      .map((dao) => [
        dao.id!,
        {
          subgraphUrl: dao.subgraphUrl,
          governanceType: dao.governanceType,
          governanceContract: dao.governanceContract,
          pollDeployConfig: dao.pollDeployConfig,
        },
      ]),
  ),
);

const realCommunityEntries = Object.values(appConstants).flatMap(({ daos }) =>
  Object.values(daos).map(
    (dao) =>
      [
        dao.id ?? "",
        {
          name: dao.displayName ?? dao.id ?? "",
          description: dao.description ?? "",
          summary: dao.summary ?? "",
          logo: dao.logo ?? dao.logoUrl ?? "",
          members: dao.members ?? 0,
          category: dao.category ?? "", //TODO
          affiliatedCommunities: [], //TODO
        },
      ] as const,
  ),
);

const COMMUNITY_LOOKUP: Record<
  string,
  {
    name: string;
    description: string;
    summary: string;
    logo: string;
    members: number;
    category: string;
    affiliatedCommunities: Array<{ id: string; name: string; logo: string }>;
  }
> = {
  ...Object.fromEntries(realCommunityEntries),
  ...COMMUNITY_DATA,
};

function PollActionButton({
  poll,
  daoConfig,
  maciKeypair,
  isJoiningPoll,
  getPollStateIndex,
  joinThePoll,
  onJoined,
  onVote,
  subgraphUrl,
  governanceType,
}: {
  poll: SubgraphPoll | null;
  daoConfig: { governanceContract: string };
  maciKeypair: Keypair | null;
  isJoiningPoll: (pollAddress: string) => boolean;
  getPollStateIndex: (pollAddress: string) => string | null;
  joinThePoll: (args: {
    maciAddress: string;
    pollId: bigint;
    pollAddress: string;
    pollJoiningZkeyUrl: string;
    pollJoiningWasmUrl: string;
    subgraphUrl: string;
  }) => Promise<unknown>;
  onJoined: () => void;
  onVote: (poll: SubgraphPoll) => void;
  subgraphUrl: string;
  governanceType: GovernanceType;
}) {
  const { address } = useAccount();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pubKeyX, pubKeyY] = maciKeypair ? (maciKeypair as any).publicKey.raw : [0n, 0n];

  const { data: isJoinedOnChain = false } = useQuery({
    queryKey: ["isJoinedPoll", poll?.id, String(pubKeyX)],
    queryFn: () => fetchIsJoinedPoll(subgraphUrl, governanceType, poll!.id, pubKeyX, pubKeyY),
    enabled: !!poll && !!maciKeypair,
  });

  if (!poll) return null;

  const isJoined = isJoinedOnChain || getPollStateIndex(poll.id) !== null;
  const hasVoted = !!address && !!getStoredVote(poll.id, address);
  const joining = isJoiningPoll(poll.id);

  if (!isJoined) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            joinThePoll({
              maciAddress: daoConfig.governanceContract,
              pollId: BigInt(poll.pollId),
              pollAddress: poll.id,
              pollJoiningZkeyUrl: maciArtifacts.pollJoiningZkeyUrl,
              pollJoiningWasmUrl: maciArtifacts.pollJoiningWasmUrl,
              subgraphUrl,
            })
              .then(onJoined)
              .catch(() => {});
          }}
          disabled={joining}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {joining ? "Generating proof..." : "Join Poll"}
        </button>
        {joining && <p className="text-xs text-gray-500">This may take 1–3 minutes. Please keep this tab open.</p>}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onVote(poll);
      }}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
    >
      {hasVoted ? "Recast Vote" : "Vote Now"}
    </button>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-white text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function formatRelativeTime(unixSec: number): string {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(unixSec * 1000).toLocaleDateString();
}

const POLL_STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  active: "Active",
  closed: "Closed",
};

const POLL_STATUS_CLASSES: Record<string, string> = {
  not_started: "text-amber-400",
  active: "text-green-400",
  closed: "text-gray-500",
};

function pollStatusLabel(status: string): string {
  return POLL_STATUS_LABELS[status] ?? status;
}

function pollStatusClass(status: string): string {
  return POLL_STATUS_CLASSES[status] ?? "text-gray-500";
}

const POLL_STATUS_BADGE_CLASSES: Record<string, string> = {
  not_started: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

function pollStatusBadgeClass(status: string): string {
  return POLL_STATUS_BADGE_CLASSES[status] ?? "bg-gray-100 text-gray-700";
}

export default function CommunityPage() {
  const params = useParams();
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [activeTab, setActiveTab] = useState<"proposals" | "forum">("proposals");
  const [proposals, setProposals] = useState(COMMUNITY_PROPOSALS);
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null);
  const [voteModalPoll, setVoteModalPoll] = useState<SubgraphPoll | null>(null);

  const { maciKeypair } = useMaci();
  const { address } = useAccount();
  const chainId = useChainId();

  // Try static lookup first, then backend for backend-registered communities
  const staticCommunity = COMMUNITY_LOOKUP[params.id ?? ""];
  const { data: backendCommunity, isLoading: isCommunityLoading } = useQuery({
    queryKey: ["community", params.id],
    queryFn: () => communityApi.get(params.id!),
    enabled: !staticCommunity && !!params.id,
  });
  const community = staticCommunity;
  const daoConfig = DAO_CONFIG_LOOKUP[params.id ?? ""];
  const rpcUrl = appConstants[chainId as keyof typeof appConstants]?.rpcUrl ?? Object.values(appConstants)[0].rpcUrl;

  // Static communities read their subgraph directly; backend-registered communities go through
  // the backend's transparent proxy once their subgraph has finished indexing (subgraphStatus
  // "ready") — the frontend never talks to graph-node directly for those.
  const backendSubgraphReady = backendCommunity?.subgraphStatus === "ready";
  const activeSubgraphUrl =
    daoConfig?.subgraphUrl ?? (backendSubgraphReady ? communityApi.subgraphQueryUrl(backendCommunity!.id) : undefined);
  const activeGovernanceType =
    daoConfig?.governanceType ?? (backendCommunity?.governanceType as GovernanceType | undefined);

  const queryClient = useQueryClient();
  const { isSigningUp, signupToMaci } = useSignup(daoConfig?.governanceType);
  const { isJoiningPoll, joinPollError, joinThePoll, getPollStateIndex } = useJoinPoll(daoConfig?.governanceType);

  const [isConfirmingRegistration, setIsConfirmingRegistration] = useState(false);

  const handleRegister = async () => {
    if (!daoConfig || !maciUserId) return;
    await signupToMaci(daoConfig.governanceContract);

    setIsConfirmingRegistration(true);
    try {
      const POLL_INTERVAL_MS = 2000;
      const TIMEOUT_MS = 30000;
      const deadline = Date.now() + TIMEOUT_MS;

      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        const confirmed = await fetchIsRegistered(daoConfig.subgraphUrl, daoConfig.governanceType, maciUserId);
        if (confirmed) {
          queryClient.invalidateQueries({ queryKey: ["isRegistered", params.id, maciUserId] });
          break;
        }
      }
    } finally {
      setIsConfirmingRegistration(false);
    }
  };

  const {
    data: membersData,
    isError: isMembersError,
    isLoading: isMembersLoading,
  } = useQuery({
    queryKey: ["members", params.id],
    queryFn: () => fetchMembers(activeSubgraphUrl!, activeGovernanceType!),
    enabled: !!activeSubgraphUrl && !!activeGovernanceType,
  });

  const {
    data: pollsData,
    isError: isPollsError,
    isLoading: isPollsLoading,
  } = useQuery({
    queryKey: ["polls", params.id],
    queryFn: () => fetchPolls(activeSubgraphUrl!, activeGovernanceType!),
    enabled: !!activeSubgraphUrl && !!activeGovernanceType,
  });

  const { data: messageCounts = {} } = useQuery({
    queryKey: ["pollMessageCounts", pollsData?.map((p) => p.id)],
    queryFn: () =>
      Promise.all(
        pollsData!.map((p) => fetchNumMessages(activeGovernanceType!, p.id).then((n) => [p.id, n] as const)),
      ).then(Object.fromEntries<number>),
    enabled: !!pollsData?.length && !!activeGovernanceType,
  });

  const { data: eligibilityMap = {} } = useQuery({
    queryKey: ["pollEligibility", pollsData?.map((p) => p.id), address],
    queryFn: () =>
      Promise.all(
        pollsData!.map((p) =>
          fetchIsEligible(activeGovernanceType!, p.policy, p.policyType, address!).then(
            (eligible) => [p.id, eligible] as const,
          ),
        ),
      ).then(Object.fromEntries<boolean>),
    enabled: !!pollsData?.length && !!activeGovernanceType && !!address,
  });

  const maciUserId = maciKeypair ? formatMaciUserId(maciKeypair) : null;

  const { data: isRegistered = false } = useQuery({
    queryKey: ["isRegistered", params.id, maciUserId],
    queryFn: () => fetchIsRegistered(daoConfig.subgraphUrl, daoConfig.governanceType, maciUserId!),
    enabled: !!daoConfig && !!maciUserId,
  });

  const memberCount = membersData ?? community?.members ?? 0;

  const now = Date.now() / 1000;
  const mappedPolls = pollsData?.map((poll) => ({
    id: poll.id,
    title: poll.name,
    description: poll.metadata,
    status: now < Number(poll.startDate) ? "not_started" : now < Number(poll.endDate) ? "active" : "closed",
    type: "onchain",
    privacy: "public",
    eligible: eligibilityMap[poll.id] ?? false,
    votes: messageCounts[poll.id] ?? 0,
    startDate: new Date(Number(poll.startDate) * 1000).toISOString(),
    endDate: new Date(Number(poll.endDate) * 1000).toISOString().slice(0, 10),
  }));
  // Static demo communities fall back to seeded/local-storage placeholder proposals when no
  // subgraph data has loaded yet; backend-registered communities never use this fallback (see
  // the backend-fetched render branch below), so as not to show fake data under a "ready" state.
  const displayProposals: typeof COMMUNITY_PROPOSALS = mappedPolls ?? proposals;

  useEffect(() => {
    if (pollsData) return;
    const storedProposals = localStorage.getItem(`proposals_${params.id}`);
    if (storedProposals) {
      const userProposals = JSON.parse(storedProposals);
      setProposals([...COMMUNITY_PROPOSALS, ...userProposals]);
    }
  }, [params.id, pollsData]);

  // Loading state while fetching from backend
  if (!community && isCommunityLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  // Render backend-fetched community page
  if (!community && backendCommunity) {
    const dc = backendCommunity;
    const policyNames = dc.allowedPolicies
      .map((id) => ALLOWED_POLICIES.find((p) => p.id === String(id))?.name ?? id)
      .join(", ");
    const modeNames = dc.supportedModes
      .map((id) => VOTING_MODES.find((m) => m.id === String(id))?.name ?? id)
      .join(", ");

    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Communities
          </Link>

          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{dc.logo || "🏛️"}</span>
              <div>
                <h1 className="text-2xl font-bold">{dc.displayName}</h1>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{dc.id}</p>
              </div>
            </div>

            {dc.description && <p className="text-gray-400 text-sm">{dc.description}</p>}

            <div className="rounded-lg border border-gray-700 divide-y divide-gray-700 text-sm">
              <InfoRow label="Voting mechanism" value="MACI" />
              <InfoRow label="Sign-up policy" value={dc.signUpPolicyType ?? "—"} />
              <InfoRow label="Allowed poll policies" value={policyNames || "—"} />
              <InfoRow label="Voting modes" value={modeNames || "—"} />
              <InfoRow label="Created" value={formatRelativeTime(dc.createdAt)} />
              <InfoRow label="Creator" value={`${dc.creatorAddress.slice(0, 6)}…${dc.creatorAddress.slice(-4)}`} mono />
            </div>

            {dc.subgraphStatus === "failed" ? (
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-400">
                This community's data failed to index. Member count and poll history are unavailable.
              </div>
            ) : dc.subgraphStatus !== "ready" ? (
              <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-sm text-gray-500">
                This community's data is still being indexed. Member count and poll history will appear here once
                indexing finishes.
              </div>
            ) : isMembersError || isPollsError ? (
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-400">
                Couldn't load this community's data right now. Please try again later.
              </div>
            ) : isMembersLoading || isPollsLoading ? (
              <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-sm text-gray-500 animate-pulse">
                Loading member count and poll history…
              </div>
            ) : (
              <div className="rounded-lg border border-gray-700 p-3 space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{mappedPolls?.length ?? 0} polls</span>
                  </div>
                </div>
                {!!mappedPolls?.length && (
                  <ul className="space-y-2">
                    {mappedPolls.map((poll) => (
                      <li key={poll.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-200">{poll.title}</span>
                          <p className="text-xs text-gray-500">
                            {new Date(poll.startDate).toLocaleDateString()} – {poll.endDate}
                          </p>
                        </div>
                        <span className={pollStatusClass(poll.status)}>{pollStatusLabel(poll.status)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <JoinSection communityId={dc.id} connected={!!address} rpcUrl={rpcUrl} />
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <GovernanceActionsList communityId={dc.id} connected={!!address} />
          </div>
        </main>
      </div>
    );
  }

  if (!community && !backendCommunity) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Communities
          </Link>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
            <p className="text-xl font-semibold text-white mb-2">Community not found</p>
            <p className="text-gray-400 text-sm">No community is registered at this address.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Communities</span>
        </Link>

        {/* Community Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{community.logo}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 rounded">
                  {community.category}
                </span>
              </div>
            </div>
            {daoConfig ? (
              isRegistered ? (
                <button
                  onClick={() => setShowCreateProposal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Proposal
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isSigningUp || isConfirmingRegistration}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  {isSigningUp
                    ? "Registering..."
                    : isConfirmingRegistration
                      ? "Confirming registration..."
                      : "Register"}
                </button>
              )
            ) : (
              <button
                onClick={() => setShowCreateProposal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Proposal
              </button>
            )}
          </div>

          {/* Summary & Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
            <p className="text-gray-700 mb-4">{community.summary}</p>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{community.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{memberCount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Members</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{displayProposals.length}</p>
              <p className="text-sm text-gray-600">Proposals</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{FORUM_POSTS.length}</p>
              <p className="text-sm text-gray-600">Forum Posts</p>
            </div>
          </div>

          {/* Affiliated Communities */}
          {community.affiliatedCommunities && community.affiliatedCommunities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Affiliated Communities</h2>
              <div className="flex flex-wrap gap-3">
                {community.affiliatedCommunities.map((affiliated) => (
                  <Link
                    key={affiliated.id}
                    to={`/community/${affiliated.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">{affiliated.logo}</span>
                    <span className="font-medium text-gray-900">{affiliated.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab("proposals")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "proposals"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Proposals
            </button>
            <button
              onClick={() => setActiveTab("forum")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "forum"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Forum
            </button>
          </div>

          <div className="p-6">
            {activeTab === "proposals" && (
              <div className="space-y-4">
                {displayProposals.map((proposal: any) => {
                  const storedVote = address ? getStoredVote(proposal.id, address) : null;
                  const pollData = pollsData?.find((p) => p.id === proposal.id);
                  const pollOptions = pollData?.options?.length
                    ? pollData.options
                    : pollData
                      ? Array.from({ length: Number(pollData.voteOptions) }, (_, i) => `Option ${i + 1}`)
                      : null;
                  const voteLabel =
                    storedVote && pollOptions
                      ? storedVote.type === "simple"
                        ? (pollOptions[storedVote.optionIndex] ?? `Option ${storedVote.optionIndex + 1}`)
                        : storedVote.rankedOptions.join(" > ")
                      : null;
                  return (
                    <div key={proposal.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedProposal(expandedProposal === proposal.id ? null : proposal.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">{proposal.title}</h3>
                              {expandedProposal === proposal.id ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${pollStatusBadgeClass(proposal.status)}`}
                              >
                                {pollStatusLabel(proposal.status).toUpperCase()}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                {proposal.type.toUpperCase()}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                                {proposal.privacy.toUpperCase()}
                              </span>
                              {proposal.eligible ? (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  ELIGIBLE
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  NOT ELIGIBLE
                                </span>
                              )}
                              {proposal.votingMechanism && (
                                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                                  {proposal.votingMechanism.toUpperCase()}
                                </span>
                              )}
                              {proposal.weighted && (
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                                  WEIGHTED
                                </span>
                              )}
                              {storedVote && (
                                <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  VOTED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {proposal.votes} votes
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {proposal.status === "not_started"
                                ? `Starts ${new Date(proposal.startDate).toLocaleDateString()}`
                                : proposal.status === "closed"
                                  ? `Ended ${proposal.endDate}`
                                  : `Ends ${proposal.endDate}`}
                            </span>
                          </div>
                          {proposal.eligible && proposal.status === "active" && daoConfig && (
                            <PollActionButton
                              poll={pollsData?.find((p) => p.id === proposal.id) ?? null}
                              daoConfig={daoConfig}
                              maciKeypair={maciKeypair}
                              isJoiningPoll={isJoiningPoll}
                              getPollStateIndex={getPollStateIndex}
                              joinThePoll={joinThePoll}
                              onJoined={() => queryClient.invalidateQueries({ queryKey: ["isJoinedPoll", params.id] })}
                              onVote={(poll) => setVoteModalPoll(poll)}
                              subgraphUrl={daoConfig.subgraphUrl}
                              governanceType={daoConfig.governanceType}
                            />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedProposal === proposal.id && (
                        <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                          <div className="pt-4 space-y-4">
                            {voteLabel && (
                              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <div>
                                  <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                                    Your vote
                                  </span>
                                  <p className="text-sm font-semibold text-emerald-900">{voteLabel}</p>
                                </div>
                              </div>
                            )}

                            {proposal.description && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-700">{proposal.description}</p>
                              </div>
                            )}

                            {proposal.eligibility && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Eligibility Criteria</h4>
                                <p className="text-gray-700">{proposal.eligibility}</p>
                              </div>
                            )}

                            {proposal.options && proposal.options.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Voting Options</h4>
                                <div className="space-y-2">
                                  {proposal.options.map((option: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                                    >
                                      <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full font-semibold text-sm">
                                        {idx + 1}
                                      </div>
                                      <span className="text-gray-900">{option}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {proposal.startDate && proposal.endDate && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-1">Start Date</h4>
                                  <p className="text-gray-700">{new Date(proposal.startDate).toLocaleString()}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-1">End Date</h4>
                                  <p className="text-gray-700">{new Date(proposal.endDate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "forum" && (
              <div className="space-y-4">
                {FORUM_POSTS.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{post.author}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.replies} replies
                        </span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateProposalModal
        isOpen={showCreateProposal}
        onClose={() => setShowCreateProposal(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["polls", params.id] })}
        communityId={params.id as string}
        governanceType={daoConfig?.governanceType}
        maciAddress={daoConfig?.governanceContract}
        pollDeployConfig={daoConfig?.pollDeployConfig}
        existingPollAddress={pollsData?.[0]?.id ?? null}
      />

      {voteModalPoll && (
        <VoteModal
          poll={voteModalPoll}
          maciAddress={daoConfig!.governanceContract}
          rpcUrl={rpcUrl}
          governanceType={daoConfig!.governanceType}
          onClose={() => setVoteModalPoll(null)}
          onSuccess={() => setVoteModalPoll(null)}
        />
      )}

      {joinPollError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm z-50">
          <p className="text-sm font-medium">Failed to join poll</p>
          <p className="text-xs mt-1 opacity-90">{joinPollError}</p>
        </div>
      )}
    </div>
  );
}
