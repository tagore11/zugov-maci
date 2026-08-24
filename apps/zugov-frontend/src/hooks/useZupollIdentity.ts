import { useCallback } from "react";
import { Identity } from "@semaphore-protocol/identity";
import * as zupollApi from "@/src/services/zupollApi";

// specs/013-zupoll-decision-adapter — the identity secret is generated and held ENTIRELY
// client-side and never transmitted to or stored by the server (spec.md Assumptions); only the
// derived public `commitment` ever leaves the browser (via registerCommitment below). Scoped
// per-community (Clarifications Q1) — a separate localStorage key, and a separate Identity, per
// community, so no shared value could ever correlate a member's participation across
// communities.
function storageKey(communityId: string): string {
  return `zugov:zupoll-identity:${communityId}`;
}

function loadOrCreateIdentity(communityId: string): Identity {
  const stored = localStorage.getItem(storageKey(communityId));
  if (stored) {
    try {
      return Identity.import(stored);
    } catch {
      // Fall through and mint a fresh one — a corrupted stored value shouldn't hard-block voting;
      // per FR-014, "lose the old commitment, register a new one" is the intended path anyway.
    }
  }
  const identity = new Identity();
  localStorage.setItem(storageKey(communityId), identity.export());
  return identity;
}

function votedNullifierKey(proposalId: string): string {
  return `zugov:zupoll-voted:${proposalId}`;
}

export function useZupollIdentity(communityId: string) {
  const getIdentity = useCallback((): Identity => loadOrCreateIdentity(communityId), [communityId]);

  /** FR-014's self-service "no recovery, just register a new one" path — mints and persists a
   * brand new identity, then registers its commitment. Does not affect any proposal's
   * already-taken snapshot (those are immutable). */
  const rotateIdentity = useCallback(async (): Promise<void> => {
    const identity = new Identity();
    localStorage.setItem(storageKey(communityId), identity.export());
    await zupollApi.registerCommitment(communityId, identity.commitment.toString());
  }, [communityId]);

  const ensureRegistered = useCallback(async (): Promise<Identity> => {
    const identity = loadOrCreateIdentity(communityId);
    await zupollApi.registerCommitment(communityId, identity.commitment.toString());
    return identity;
  }, [communityId]);

  /** Mirrors the reference implementation's own localStorage voted-state convention
   * (votedOn()/getBallotVotes() in the original Zupoll client) — the frontend's only record of
   * "have I voted," used purely to decide when to pass a nullifier to the tally endpoint. The
   * server enforces reveal-gating for real (zupollService.getTally); this is just local UX state. */
  const recordVoted = useCallback((proposalId: string, nullifier: string) => {
    localStorage.setItem(votedNullifierKey(proposalId), nullifier);
  }, []);

  const getVotedNullifier = useCallback((proposalId: string): string | null => {
    return localStorage.getItem(votedNullifierKey(proposalId));
  }, []);

  return { getIdentity, ensureRegistered, rotateIdentity, recordVoted, getVotedNullifier };
}
