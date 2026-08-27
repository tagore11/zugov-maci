import { useState } from "react";
import * as communityApi from "@/src/services/communityApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

function keyFor(unionId: string, communityId: string): string {
  return `${unionId}:${communityId}`;
}

// Extracted out of UnionMembershipSection.tsx (community page redesign, /plan-eng-review
// 2026-08-26, D4/D6) so the settings page and the new union detail page can share one
// implementation instead of drifting copies. Both ids are passed at call time rather than bound
// to the hook — the settings page has a fixed communityId and iterates many unions; the union
// page has a fixed unionId and iterates many candidate communities. A composite `unionId:
// communityId` key lets loading/error state work correctly either way.
export function useUnionMembershipActions(onMutated?: () => void) {
  const [respondingKey, setRespondingKey] = useState<string | null>(null);
  const [leavingKey, setLeavingKey] = useState<string | null>(null);
  const [errorByKey, setErrorByKey] = useState<Record<string, string>>({});
  const { signOut } = useSiwe();

  async function respond(unionId: string, communityId: string, accept: boolean) {
    const key = keyFor(unionId, communityId);
    setErrorByKey((prev) => ({ ...prev, [key]: "" }));
    setRespondingKey(key);
    try {
      await withAuthDetect(() => communityApi.respondToUnionInvite(unionId, { communityId, accept }), signOut);
      onMutated?.();
    } catch (err) {
      const message =
        err instanceof communityApi.OwnershipError || err instanceof communityApi.AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to respond";
      setErrorByKey((prev) => ({ ...prev, [key]: message }));
    } finally {
      setRespondingKey(null);
    }
  }

  // No confirm modal — matches the original component's precedent (fire immediately, surface
  // any error inline). Reversible: a re-invite after leaving resets straight back to pending.
  async function leave(unionId: string, communityId: string) {
    const key = keyFor(unionId, communityId);
    setErrorByKey((prev) => ({ ...prev, [key]: "" }));
    setLeavingKey(key);
    try {
      await withAuthDetect(() => communityApi.leaveUnion(unionId, { communityId }), signOut);
      onMutated?.();
    } catch (err) {
      const message =
        err instanceof communityApi.OwnershipError ||
        err instanceof communityApi.AuthError ||
        err instanceof communityApi.ConflictError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to leave union";
      setErrorByKey((prev) => ({ ...prev, [key]: message }));
    } finally {
      setLeavingKey(null);
    }
  }

  return {
    respond,
    leave,
    isResponding: (unionId: string, communityId: string) => respondingKey === keyFor(unionId, communityId),
    isLeaving: (unionId: string, communityId: string) => leavingKey === keyFor(unionId, communityId),
    errorFor: (unionId: string, communityId: string) => errorByKey[keyFor(unionId, communityId)] ?? "",
  };
}
