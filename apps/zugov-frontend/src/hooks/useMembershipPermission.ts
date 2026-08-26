import { useQuery } from "@tanstack/react-query";
import * as membershipApi from "@/src/services/membershipApi";

/** Creator OR community-admin (canManageMembership) — the same authorization shape the backend
 * enforces server-side; this is a display-only approximation so the right UI shows up, not a
 * security boundary (the backend re-checks on every mutating request). Does not itself check
 * communities.creatorAddress — callers needing the full isAuthorized-equivalent shape (creator OR
 * canManageMembership) compose the creator check separately, same as EventsSection.tsx already
 * does per-event. */
export function useIsCommunityAdmin(communityId: string, connected: boolean): boolean {
  const { data: status } = useQuery({
    queryKey: ["membershipStatus", communityId],
    queryFn: () => membershipApi.getMembershipStatus(communityId),
    enabled: connected,
  });
  const { data: tiers } = useQuery({
    queryKey: ["tiers", communityId],
    queryFn: () => membershipApi.getTiers(communityId),
    enabled: connected,
  });
  if (!status || status.status !== "member" || !tiers) return false;
  return tiers.find((t) => t.label === status.tierLabel)?.canManageMembership ?? false;
}

/** Mirrors membershipService.hasTierPermission exactly, including the lack of a creator bypass —
 * a wallet with no membership row (even the community's creator, on a manually-registered
 * community with no auto-enrolled membership) returns false, matching the backend. */
export function useHasTierPermission(
  communityId: string,
  connected: boolean,
  permission: "canCreateProposals" | "canVote" | "canCreateEvents" | "canPostDiscussions",
): boolean {
  const { data: status } = useQuery({
    queryKey: ["membershipStatus", communityId],
    queryFn: () => membershipApi.getMembershipStatus(communityId),
    enabled: connected,
  });
  const { data: tiers } = useQuery({
    queryKey: ["tiers", communityId],
    queryFn: () => membershipApi.getTiers(communityId),
    enabled: connected,
  });
  if (!status || status.status !== "member" || !tiers) return false;
  return tiers.find((t) => t.label === status.tierLabel)?.[permission] ?? false;
}
