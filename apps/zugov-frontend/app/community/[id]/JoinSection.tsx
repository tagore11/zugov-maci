import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as membershipApi from "@/src/services/membershipApi";

export function JoinSection({ communityId, connected }: { communityId: string; connected: boolean }) {
  const queryClient = useQueryClient();
  const [joinResult, setJoinResult] = useState<{ status: "approved" | "pending"; tierLabel?: string } | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  async function handleJoin() {
    setIsJoining(true);
    setJoinError(null);
    try {
      const result = await membershipApi.join(communityId);
      setJoinResult(result);
      queryClient.invalidateQueries({ queryKey: ["membershipEligibility", communityId] });
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setIsJoining(false);
    }
  }

  if (!connected) return null;
  if (joinResult) {
    return (
      <div className="rounded-lg border border-green-700 bg-green-900/20 p-3 text-sm text-green-300">
        {joinResult.status === "approved"
          ? `Joined! You're now a member at the "${joinResult.tierLabel}" tier.`
          : "Join request submitted — awaiting admin review."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => void handleJoin()}
        disabled={isJoining}
        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {isJoining ? "Joining…" : "Join"}
      </button>
      {joinError && <p className="text-xs text-red-400">{joinError}</p>}
    </div>
  );
}
