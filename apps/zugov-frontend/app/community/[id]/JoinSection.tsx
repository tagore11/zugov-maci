import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as membershipApi from "@/src/services/membershipApi";
import { useSignup } from "@/src/hooks/useSignup";
import { GovernanceTypes } from "@/src/config";

export function JoinSection({ communityId, connected }: { communityId: string; connected: boolean }) {
  const queryClient = useQueryClient();
  const { isSigningUp, signupToMaci } = useSignup(GovernanceTypes.MACI);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: membership } = useQuery({
    queryKey: ["membershipStatus", communityId],
    queryFn: () => membershipApi.getMembershipStatus(communityId),
    enabled: connected,
  });

  async function handleJoin() {
    setError(null);
    try {
      await signupToMaci(communityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up on-chain");
      return;
    }

    // The on-chain signup above is what actually makes this wallet a MACI voter — the backend
    // membership row is secondary bookkeeping (tiers/permissions), so a failure here (including
    // "already a member", e.g. the community creator was auto-enrolled) shouldn't block success.
    try {
      await membershipApi.join(communityId);
    } catch {
      // best-effort
    }

    setJoined(true);
    queryClient.invalidateQueries({ queryKey: ["membershipStatus", communityId] });
  }

  if (!connected) return null;

  if (joined) {
    return (
      <div className="rounded-lg border border-green-700 bg-green-900/20 p-3 text-sm text-green-300">
        Signed up — you&apos;re now registered to vote in this community&apos;s MACI state tree.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {membership?.status === "member" && (
        <p className="text-xs text-gray-500">
          Already recorded as a member{membership.tierLabel ? ` (${membership.tierLabel} tier)` : ""} — sign up below to
          also register on-chain with MACI if you haven&apos;t yet.
        </p>
      )}
      {membership?.status === "pending" && (
        <p className="text-xs text-gray-500">Membership request pending admin review.</p>
      )}
      <button
        onClick={() => void handleJoin()}
        disabled={isSigningUp}
        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {isSigningUp ? "Signing up…" : "Join"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
