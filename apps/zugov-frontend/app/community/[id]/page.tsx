import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { Header } from "../../components/Header";
import { Users, FileText, ArrowLeft } from "lucide-react";
import { computePollStatus, pollStatusLabel, pollStatusClass } from "@/src/lib/pollStatus";
import { useNow } from "@/src/hooks/useNow";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import { appConstants, type GovernanceType } from "@/src/config";
import * as communityApi from "@/src/services/communityApi";
import { JoinSection } from "./JoinSection";
import { UnionsSection } from "./UnionsSection";
import { ProposalsList } from "../../components/ProposalsList";
import { EventsSection } from "../../components/EventsSection";
import { ZupollSection } from "../../components/ZupollSection";
import { fetchMembers, fetchPolls } from "@/src/services/subgraph";
import { fetchNumMessages, fetchIsEligible } from "@/src/services/readContract";

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-foreground text-right min-w-0 break-words ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
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

export default function CommunityPage() {
  const params = useParams();
  const { address } = useAccount();
  const chainId = useChainId();

  const { data: backendCommunity, isLoading: isCommunityLoading } = useQuery({
    queryKey: ["community", params.id],
    queryFn: () => communityApi.get(params.id!),
    enabled: !!params.id,
  });
  const rpcUrl = appConstants[chainId as keyof typeof appConstants]?.rpcUrl ?? Object.values(appConstants)[0].rpcUrl;

  // Backend-registered communities go through the backend's transparent proxy once their
  // subgraph has finished indexing (subgraphStatus "ready") — the frontend never talks to
  // graph-node directly.
  const backendSubgraphReady = backendCommunity?.subgraphStatus === "ready";
  const activeSubgraphUrl = backendSubgraphReady ? communityApi.subgraphQueryUrl(backendCommunity!.id) : undefined;
  const activeGovernanceType = backendCommunity?.governanceType as GovernanceType | undefined;

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

  // Local chapters, event teams, and contributor circles nested under this community
  // (Lightpaper's "communities and sub-communities" building block).
  const { data: subCommunities } = useQuery({
    queryKey: ["subCommunities", backendCommunity?.id],
    queryFn: () => communityApi.listChildren(backendCommunity!.id),
    enabled: !!backendCommunity,
  });

  // The other half of the parent/child relationship: subCommunities above shows this
  // community's children looking down; this looks up, so a sub-community's own page can link
  // back to the community it belongs to (previously only reachable in the parent -> child
  // direction, never child -> parent).
  const { data: parentCommunity } = useQuery({
    queryKey: ["community", backendCommunity?.parentCommunityId],
    queryFn: () => communityApi.get(backendCommunity!.parentCommunityId!),
    enabled: !!backendCommunity?.parentCommunityId,
  });

  const { data: messageCounts = {} } = useQuery({
    queryKey: ["pollMessageCounts", pollsData?.map((p) => p.id)],
    queryFn: () =>
      Promise.all(
        pollsData!.map((p) => fetchNumMessages(activeGovernanceType!, p.id, rpcUrl).then((n) => [p.id, n] as const)),
      ).then(Object.fromEntries<number>),
    enabled: !!pollsData?.length && !!activeGovernanceType,
  });

  const { data: eligibilityMap = {} } = useQuery({
    queryKey: ["pollEligibility", pollsData?.map((p) => p.id), address],
    queryFn: () =>
      Promise.all(
        pollsData!.map((p) =>
          fetchIsEligible(activeGovernanceType!, p.policy, p.policyType, address!, rpcUrl).then(
            (eligible) => [p.id, eligible] as const,
          ),
        ),
      ).then(Object.fromEntries<boolean>),
    enabled: !!pollsData?.length && !!activeGovernanceType && !!address,
  });

  const memberCount = membersData ?? 0;

  const now = useNow() / 1000;
  const mappedPolls = pollsData?.map((poll) => ({
    id: poll.id,
    title: poll.name,
    description: poll.metadata,
    status: computePollStatus(poll.startDate, poll.endDate, now),
    type: "onchain",
    privacy: "public",
    eligible: eligibilityMap[poll.id] ?? false,
    votes: messageCounts[poll.id] ?? 0,
    startDate: new Date(Number(poll.startDate) * 1000).toISOString(),
    endDate: new Date(Number(poll.endDate) * 1000).toISOString().slice(0, 10),
  }));
  // Loading state while fetching from backend
  if (isCommunityLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
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
  if (backendCommunity) {
    const dc = backendCommunity;
    const policyNames = dc.allowedPolicies
      .map((id) => ALLOWED_POLICIES.find((p) => p.id === String(id))?.name ?? id)
      .join(", ");
    const modeNames = dc.supportedModes
      .map((id) => VOTING_MODES.find((m) => m.id === String(id))?.name ?? id)
      .join(", ");

    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Communities
          </Link>

          {/* Info: identity fields only — who/what this community is, independent of whether
              its governance tooling is configured (Design Issue 1's card order). */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{dc.logo || "🏛️"}</span>
              <div>
                <h1 className="text-2xl font-bold">{dc.displayName}</h1>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{dc.id}</p>
              </div>
            </div>

            {parentCommunity && (
              <Link
                to={`/community/${parentCommunity.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent-hover transition-colors"
              >
                <span aria-hidden="true">↳</span>
                Sub-community of <span className="text-foreground font-medium">{parentCommunity.displayName}</span>
              </Link>
            )}

            {dc.description && <p className="text-gray-400 text-sm">{dc.description}</p>}

            <div className="rounded-lg border border-gray-700 divide-y divide-gray-700 text-sm">
              <InfoRow label="Created" value={formatRelativeTime(dc.createdAt)} />
              <InfoRow label="Creator" value={`${dc.creatorAddress.slice(0, 6)}…${dc.creatorAddress.slice(-4)}`} mono />
            </div>
          </div>

          {/* Governance status: "not yet configured" empty state (mirrors the existing
              subgraphStatus 'pending' tone), or the real config + join/vote panels once set up. */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Governance</h2>

            {!dc.governanceConfigured ? (
              <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-sm text-gray-500">
                Governance isn't configured for this community yet.
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-gray-700 divide-y divide-gray-700 text-sm">
                  <InfoRow label="Voting mechanism" value="MACI" />
                  <InfoRow label="Sign-up policy" value={dc.signUpPolicyType ?? "—"} />
                  <InfoRow label="Allowed poll policies" value={policyNames || "—"} />
                  <InfoRow label="Voting modes" value={modeNames || "—"} />
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
              </>
            )}

            <JoinSection
              communityId={dc.id}
              contractAddress={dc.contractAddress}
              connected={!!address}
              rpcUrl={rpcUrl}
            />
          </div>

          {!!subCommunities?.length && (
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Sub-communities</h2>
              <div className="flex flex-wrap gap-3">
                {subCommunities.map((child) => (
                  <Link
                    key={child.id}
                    to={`/community/${child.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700
                      hover:border-accent hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-xl">{child.logo || "🏛️"}</span>
                    <span className="font-medium text-foreground">{child.displayName}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <UnionsSection communityId={dc.id} />

          {/* Events lives in the identity/structure layer, not governance — it renders for
              ungoverned communities too, matching "structural relationships never require
              governance" (ENGINEERING.md). */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <EventsSection communityId={dc.id} connected={!!address} walletAddress={address} />
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <ProposalsList communityId={dc.id} connected={!!address} />
          </div>

          <ZupollSection communityId={dc.id} connected={!!address} />
        </main>
      </div>
    );
  }

  if (!backendCommunity) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Communities
          </Link>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
            <p className="text-xl font-semibold text-foreground mb-2">Community not found</p>
            <p className="text-gray-400 text-sm">No community is registered at this address.</p>
          </div>
        </main>
      </div>
    );
  }
}
