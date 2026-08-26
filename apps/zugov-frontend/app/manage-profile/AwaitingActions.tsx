import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";
import * as membershipApi from "@/src/services/membershipApi";
import * as proposalApi from "@/src/services/proposalApi";

type AwaitingActionItem =
  | { kind: "union_invite"; communityId: string; communityName: string; unionName: string }
  | { kind: "membership_requests"; communityId: string; communityName: string; count: number }
  | { kind: "governance_vote"; communityId: string; communityName: string; actionId: string; actionTitle: string };

/**
 * Best-effort aggregation across three unrelated backend surfaces (unions, join requests,
 * governance actions) — each source is independently caught so one failing source doesn't blank
 * the whole section. Union-invite detection was migrated (community page redesign, /plan-eng-
 * review 2026-08-26, D3) off its own N+1-per-owned-community loop and page-1-only pagination
 * onto communityApi.getMyPendingUnionInvites() — a single, session-derived, correctly-paginated
 * query. Join requests and governance actions still fetch per-owned-community below — acceptable
 * at this app's live-event scale (Zukas 2026), unrelated to this fix, out of scope for it.
 */
async function fetchAwaitingActions(address: string): Promise<AwaitingActionItem[]> {
  const items: AwaitingActionItem[] = [];

  // formalize-communities epic, Child E (/plan-eng-review 2026-08-25, D4) — was creatorAddress-
  // only, so a non-creator canManageMembership admin (this function's own "admin authority"
  // comment above already claims to cover them) saw none of their awaiting actions. authorizedFor
  // matches isAuthorized()'s real definition, same fix as manage-communities/page.tsx.
  const [{ communities: owned }, memberCommunityIds, pendingUnionInvites] = await Promise.all([
    communityApi.list(1, undefined, undefined, undefined, address),
    membershipApi.listMyMemberships().catch(() => [] as string[]),
    communityApi.getMyPendingUnionInvites().catch(() => []),
  ]);

  for (const invite of pendingUnionInvites) {
    items.push({
      kind: "union_invite",
      communityId: invite.communityId,
      communityName: invite.communityDisplayName,
      unionName: invite.unionDisplayName,
    });
  }

  // Join requests: only communities this wallet owns (admin authority over them).
  await Promise.all(
    owned.map(async (community) => {
      const requests = await membershipApi.listPendingRequests(community.id).catch(() => []);
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
      const { proposals } = await proposalApi
        .list(id)
        .catch(() => ({ proposals: [] as proposalApi.ProposalWithMeta[] }));
      const formalized = proposals.filter((a) => a.status === "formalized");
      const eligible = await Promise.all(
        formalized.map((a) =>
          proposalApi
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
        <ListChecks className="w-5 h-5 text-accent-hover" />
        <h2 className="text-lg font-semibold text-foreground">Awaiting Your Action</h2>
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
                    🤝 <span className="text-foreground font-medium">{item.unionName}</span> invited{" "}
                    <span className="text-foreground font-medium">{item.communityName}</span> to join
                  </>
                )}
                {item.kind === "membership_requests" && (
                  <>
                    👥 <span className="text-foreground font-medium">{item.count}</span> join request
                    {item.count === 1 ? "" : "s"} waiting in{" "}
                    <span className="text-foreground font-medium">{item.communityName}</span>
                  </>
                )}
                {item.kind === "governance_vote" && (
                  <>
                    🗳️ &ldquo;<span className="text-foreground font-medium">{item.actionTitle}</span>&rdquo; is open for
                    voting in <span className="text-foreground font-medium">{item.communityName}</span>
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
                className="shrink-0 text-xs font-medium text-accent-hover hover:text-accent transition-colors"
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
