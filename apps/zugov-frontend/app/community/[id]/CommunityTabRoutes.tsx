import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, FileText } from "lucide-react";
import { computePollStatus, pollStatusLabel, pollStatusClass } from "@/src/lib/pollStatus";
import { useNow } from "@/src/hooks/useNow";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import type { GovernanceType } from "@/src/config";
import * as communityApi from "@/src/services/communityApi";
import { fetchMembers, fetchPolls } from "@/src/services/subgraph";
import { fetchNumMessages, fetchIsEligible } from "@/src/services/readContract";
import { UnionsSection } from "./UnionsSection";
import { DiscussionsSection } from "./DiscussionsSection";
import { ProposalsList } from "../../components/ProposalsList";
import { EventsSection } from "../../components/EventsSection";
import { ZupollSection } from "../../components/ZupollSection";
import type { CommunityOutletContext } from "./CommunityLayout";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-foreground text-right min-w-0 break-words">{value}</span>
    </div>
  );
}

// The "about this community" grab bag — governance status, sub-communities, unions. Everything
// that isn't Events/Proposals/Discussions lives here (community page redesign, /plan-design-review
// + /plan-eng-review, 2026-08-26). Index route under CommunityLayout, so this is what visitors
// land on by default.
export function OverviewTab() {
  const { community: dc, address, rpcUrl } = useOutletContext<CommunityOutletContext>();

  const backendSubgraphReady = dc.subgraphStatus === "ready";
  const activeSubgraphUrl = backendSubgraphReady ? communityApi.subgraphQueryUrl(dc.id) : undefined;
  const activeGovernanceType = dc.governanceType as GovernanceType | undefined;

  const {
    data: membersData,
    isError: isMembersError,
    isLoading: isMembersLoading,
  } = useQuery({
    queryKey: ["members", dc.id],
    queryFn: () => fetchMembers(activeSubgraphUrl!, activeGovernanceType!),
    enabled: !!activeSubgraphUrl && !!activeGovernanceType,
  });

  const {
    data: pollsData,
    isError: isPollsError,
    isLoading: isPollsLoading,
  } = useQuery({
    queryKey: ["polls", dc.id],
    queryFn: () => fetchPolls(activeSubgraphUrl!, activeGovernanceType!),
    enabled: !!activeSubgraphUrl && !!activeGovernanceType,
  });

  // Local chapters, event teams, and contributor circles nested under this community
  // (Lightpaper's "communities and sub-communities" building block).
  const { data: subCommunities } = useQuery({
    queryKey: ["subCommunities", dc.id],
    queryFn: () => communityApi.listChildren(dc.id),
    enabled: !!dc.id,
  });

  // TODOS.md: this Promise.all pattern fires one on-chain read per poll (fetchNumMessages,
  // fetchIsEligible) — an N+1-shaped RPC fan-out, relocated unchanged from the old page.tsx
  // (community page redesign, /plan-eng-review 2026-08-26, D9 — deliberately not fixed here).
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

  const policyNames = dc.allowedPolicies
    .map((id) => ALLOWED_POLICIES.find((p) => p.id === String(id))?.name ?? id)
    .join(", ");
  const modeNames = dc.supportedModes.map((id) => VOTING_MODES.find((m) => m.id === String(id))?.name ?? id).join(", ");

  return (
    <>
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
    </>
  );
}

export function EventsTab() {
  const { community, connected, address } = useOutletContext<CommunityOutletContext>();
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
      <EventsSection communityId={community.id} connected={connected} walletAddress={address} />
    </div>
  );
}

// Zupoll renders under Proposals, not as its own tab — both already read/write the same
// underlying `proposals` table (a known, separately tracked visibility-policy overlap), so
// giving them two top-level nav slots would compound a data-model issue into the navigation
// itself (community page redesign, /plan-design-review 2026-08-26; wrapper ownership caught by
// outside-voice review during /plan-eng-review the same day).
export function ProposalsTab() {
  const { community, connected, address } = useOutletContext<CommunityOutletContext>();
  return (
    <>
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <ProposalsList communityId={community.id} connected={connected} walletAddress={address} />
      </div>
      <ZupollSection communityId={community.id} connected={connected} />
    </>
  );
}

export function DiscussionsTab() {
  const { community, connected, address, isCreator } = useOutletContext<CommunityOutletContext>();
  // Renders nothing at all for a non-member — no card wrapper here, matching the component's own
  // established behavior (formalize-communities epic, Child J).
  return (
    <DiscussionsSection
      communityId={community.id}
      connected={connected}
      walletAddress={address}
      isCreator={isCreator}
    />
  );
}

// Union-as-community merge (2026-08-28 /plan-eng-review D5 + /plan-design-review D15) — only
// rendered for type==='union' communities (CommunityLayout.tsx gates the tab-nav link itself).
// Redistributes UnionDetailPage's old member-communities grid + pending-invites section, not a
// rewrite. Pending invites section is omitted entirely when empty (D15 — matches
// UnionsSection.tsx's own established zero-state convention: an empty heading with nothing under
// it is worse than no heading).
export function MemberCommunitiesTab() {
  const { community } = useOutletContext<CommunityOutletContext>();
  const { data } = useQuery({
    queryKey: ["union", community.id],
    queryFn: () => communityApi.getUnion(community.id),
    enabled: !!community.id,
  });

  const members = data?.members ?? [];
  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
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

      {/* Only present at all when the caller is authorized on an active member — the backend
          gates includePending, so an empty array here is indistinguishable from "not authorized
          to see pending invites," which is the correct default either way. */}
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
  );
}
