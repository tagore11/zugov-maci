import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JsonRpcProvider } from "ethers";
import * as membershipApi from "@/src/services/membershipApi";
import { useSignup } from "@/src/hooks/useSignup";
import { useMaci } from "@/src/context/MaciContext";
import { GovernanceTypes } from "@/src/config";
import { MACI__factory } from "@/src/poll-factory-shim";
import { SiweGate } from "@/app/components/SiweGate";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

export function JoinSection({
  communityId,
  contractAddress,
  connected,
  rpcUrl,
}: {
  communityId: string;
  // The deployed MACI contract's address — distinct from communityId (Architecture 1C).
  // communityId is no longer guaranteed to be a callable on-chain address once a community's
  // identity can predate governance being configured; contractAddress is the one MACI__factory
  // and signupToMaci must use. Null when governance isn't configured yet.
  contractAddress: string | null;
  connected: boolean;
  rpcUrl: string;
}) {
  const queryClient = useQueryClient();
  const { signOut } = useSiwe();
  // Investigation fix (2026-08-21) — this page never previously established a SIWE session at
  // all, so clicking Join here could hit a bare "Authentication required" from the backend with
  // no way to recover: the SIWE session only ever existed if the user happened to pass through
  // the create-community wizard's SiweGate first. Wrapping the join action in the same SiweGate
  // every other write action already uses fixes the dead-end.
  const { maciKeypair } = useMaci();
  const { isSigningUp, signupToMaci } = useSignup(GovernanceTypes.MACI);
  const [justJoined, setJustJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Governance-independent join (create-community wizard fix, 2026-08-21): a community's
  // identity/membership is real before governance is ever configured (Architecture 1A/1B), so
  // joining must not require a deployed contract — only the on-chain MACI signup below does.
  const [isJoiningBackendOnly, setIsJoiningBackendOnly] = useState(false);

  const { data: membership } = useQuery({
    queryKey: ["membershipStatus", communityId],
    queryFn: () => membershipApi.getMembershipStatus(communityId),
    enabled: connected,
  });

  // The MACI contract's state index is the ground truth for on-chain registration — it's
  // available immediately after the signup tx is mined, unlike the backend membership row
  // (secondary bookkeeping) or subgraph indexing (which lags and isn't wired up for every
  // community yet).
  const pubKeyHash = maciKeypair?.publicKey.hash();
  const { data: isRegisteredOnChain = false } = useQuery({
    queryKey: ["maciStateIndex", communityId, pubKeyHash?.toString()],
    queryFn: async () => {
      const provider = new JsonRpcProvider(rpcUrl);
      const maciContract = MACI__factory.connect(contractAddress!, provider);
      const stateIndex = (await maciContract.getStateIndex(pubKeyHash)) as bigint;
      return stateIndex >= 1n;
    },
    enabled: connected && !!maciKeypair && !!contractAddress,
  });

  async function handleJoin() {
    if (!contractAddress) return;
    setError(null);
    try {
      await signupToMaci(contractAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up on-chain");
      return;
    }

    // The on-chain signup above is what actually makes this wallet a MACI voter — the backend
    // membership row is secondary bookkeeping (tiers/permissions), so "already a member" (e.g.
    // the community creator was auto-enrolled) shouldn't block success. /plan-eng-review
    // (2026-08-23) — this used to swallow EVERY error unconditionally, including a 401: an
    // unauthenticated user could complete on-chain signup, see "Signed up," and silently never
    // get a backend membership row (no tier, invisible to member lists), with zero indication
    // anything went wrong. Only the specific, actually-benign case is swallowed now.
    try {
      await withAuthDetect(() => membershipApi.join(communityId), signOut);
    } catch (err) {
      if (!(err instanceof membershipApi.DuplicateJoinError)) {
        setError(err instanceof Error ? err.message : "Failed to record community membership");
      }
    }

    setJustJoined(true);
    queryClient.invalidateQueries({ queryKey: ["membershipStatus", communityId] });
    queryClient.invalidateQueries({ queryKey: ["maciStateIndex", communityId] });
  }

  async function handleJoinBackendOnly() {
    setError(null);
    setIsJoiningBackendOnly(true);
    try {
      const result = await withAuthDetect(() => membershipApi.join(communityId), signOut);
      // justJoined covers the gap between this resolving and the invalidated query's refetch
      // landing — same optimistic-flag pattern handleJoin uses below for the on-chain path.
      if (result.status === "approved") setJustJoined(true);
      queryClient.invalidateQueries({ queryKey: ["membershipStatus", communityId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setIsJoiningBackendOnly(false);
    }
  }

  if (!connected) return null;

  if (!contractAddress) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-sm text-gray-500">
          Governance not yet configured for this community — voting isn&apos;t available yet, but you can still join.
        </div>
        {justJoined || membership?.status === "member" ? (
          <p className="text-xs text-gray-500">
            You&apos;re a member
            {membership?.tierLabel && (
              <>
                {" "}
                (<span className="font-semibold">{membership.tierLabel}</span>)
              </>
            )}
            .
          </p>
        ) : membership?.status === "pending" ? (
          <p className="text-xs text-gray-500">Membership request pending admin review.</p>
        ) : (
          <SiweGate message="Sign in to join this community">
            <button
              onClick={() => void handleJoinBackendOnly()}
              disabled={isJoiningBackendOnly}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {isJoiningBackendOnly ? "Joining…" : "Join"}
            </button>
          </SiweGate>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  // justJoined is a local optimistic flag that covers the gap between the signup tx landing and
  // the maciStateIndex query refetch; isRegisteredOnChain is the persisted source of truth that
  // survives remounts (e.g. navigating away and back to the community card).
  if (justJoined || isRegisteredOnChain) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-green-700 bg-green-900/20 p-3 text-sm text-green-300">
          Signed up — you&apos;re now registered to vote in this community&apos;s MACI state tree.
          {membership?.tierLabel && (
            <>
              {" "}
              Your role: <span className="font-semibold">{membership.tierLabel}</span>.
            </>
          )}
        </div>
        {/* On-chain signup succeeded independently of backend membership bookkeeping — a
            failure recording membership (e.g. an expired session) surfaces here rather than
            being silently swallowed alongside a true success. */}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {membership?.status === "pending" && (
        <p className="text-xs text-gray-500">Membership request pending admin review.</p>
      )}
      {/* /plan-eng-review Phase B (2026-08-23) — this Join button used to be completely ungated,
          unlike its sibling above (the governance-not-configured branch), even though handleJoin
          calls membershipApi.join() which needs a SIWE session on the backend half of the join.
          SiweGate closes that inconsistency; auto-sign-in usually means this renders straight
          through to the button anyway. */}
      <SiweGate message="Sign in to join this community">
        <button
          onClick={() => void handleJoin()}
          disabled={isSigningUp}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {isSigningUp ? "Signing up…" : "Join"}
        </button>
      </SiweGate>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
