import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";
import * as membershipApi from "@/src/services/membershipApi";
import * as governanceActionApi from "@/src/services/governanceActionApi";

type AwaitingActionItem =
  | { kind: "union_invite"; communityId: string; communityName: string; unionName: string }
  | { kind: "membership_requests"; communityId: string; communityName: string; count: number }
  | { kind: "governance_vote"; communityId: string; communityName: string; actionId: string; actionTitle: string };

/**
 * Best-effort, N+1-fetch aggregation across three unrelated backend surfaces (unions, join
 * requests, governance actions) — acceptable at this app's live-event scale (Zukas 2026), and
 * each source is independently caught so one failing source doesn't blank the whole section.
 */
async function fetchAwaitingActions(address: string): Promise<AwaitingActionItem[]> {
  const items: AwaitingActionItem[] = [];

  const [{ communities: owned }, memberCommunityIds] = await Promise.all([
    communityApi.list(1, undefined, address),
    membershipApi.listMyMemberships().catch(() => [] as string[]),
  ]);

  // Union invites + join requests: only communities this wallet owns (admin authority over them).
  await Promise.all(
    owned.map(async (community) => {
      const [unions, requests] = await Promise.all([
        communityApi.listUnionsForCommunity(community.id).catch(() => []),
        membershipApi.listPendingRequests(community.id).catch(() => []),
      ]);
      for (const union of unions.filter((u) => u.status === "pending")) {
        items.push({
          kind: "union_invite",
          communityId: community.id,
          communityName: community.displayName,
          unionName: union.displayName,
        });
      }
      if (requests.length > 0) {
        items.push({
          kind: "membership_requests",
          communityId: community.id,
          communityName: community.displayName,
          count: requests.length,
        });
      }
    }),
  );

  // Governance actions to vote on: every community this wallet is an approved member of (the
  // creator of an owned community is auto-enrolled as a member too, so this already covers them).
  const ownedNameById = new Map(owned.map((c) => [c.id, c.displayName]));
  const memberCommunities = (
    await Promise.all(
      memberCommunityIds.map(async (id) => {
        const cachedName = ownedNameById.get(id);
        if (cachedName) return { id, displayName: cachedName };
        const community = await communityApi.get(id).catch(() => null);
        return community ? { id, displayName: community.displayName } : null;
      }),
    )
  ).filter((c): c is { id: string; displayName: string } => c !== null);

  await Promise.all(
    memberCommunities.map(async ({ id, displayName }) => {
      const { governanceActions } = await governanceActionApi
        .list(id)
        .catch(() => ({ governanceActions: [] as governanceActionApi.GovernanceActionWithMeta[] }));
      const formalized = governanceActions.filter((a) => a.status === "formalized");
      const eligible = await Promise.all(
        formalized.map((a) =>
          governanceActionApi
            .checkVoteEligibility(id, a.id)
            .then((r) => (r.eligible ? a : null))
            .catch(() => null),
        ),
      );
      for (const action of eligible) {
        if (action) {
          items.push({
            kind: "governance_vote",
            communityId: id,
            communityName: displayName,
            actionId: action.id,
            actionTitle: action.title,
          });
        }
      }
    }),
  );

  return items;
}

export function AwaitingActions({ address }: { address: string | undefined }) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["awaitingActions", address],
    queryFn: () => fetchAwaitingActions(address!),
    enabled: !!address,
  });

  if (!address) return null;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <ListChecks className="w-5 h-5 text-[#86A6C1]" />
        <h2 className="text-lg font-semibold text-white">Awaiting Your Action</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 animate-pulse">Checking for pending items…</p>
      ) : !items?.length ? (
        <p className="text-sm text-gray-500">You&apos;re all caught up — nothing needs your attention right now.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={`${item.kind}-${item.communityId}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-800/40 px-4 py-3 text-sm"
            >
              <span className="text-gray-300">
                {item.kind === "union_invite" && (
                  <>
                    🤝 <span className="text-white font-medium">{item.unionName}</span> invited{" "}
                    <span className="text-white font-medium">{item.communityName}</span> to join
                  </>
                )}
                {item.kind === "membership_requests" && (
                  <>
                    👥 <span className="text-white font-medium">{item.count}</span> join request
                    {item.count === 1 ? "" : "s"} waiting in{" "}
                    <span className="text-white font-medium">{item.communityName}</span>
                  </>
                )}
                {item.kind === "governance_vote" && (
                  <>
                    🗳️ &ldquo;<span className="text-white font-medium">{item.actionTitle}</span>&rdquo; is open for
                    voting in <span className="text-white font-medium">{item.communityName}</span>
                  </>
                )}
              </span>
              <Link
                to={
                  item.kind === "union_invite"
                    ? "/manage-communities"
                    : item.kind === "membership_requests"
                      ? `/manage-communities/${item.communityId}/members`
                      : `/community/${item.communityId}`
                }
                className="shrink-0 text-xs font-medium text-[#86A6C1] hover:text-[#648DAF] transition-colors"
              >
                {item.kind === "governance_vote" ? "Vote" : "Review"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
