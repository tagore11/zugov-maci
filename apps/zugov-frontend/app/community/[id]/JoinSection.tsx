import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnect } from "wagmi";
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
  status,
  rpcUrl,
  isCreator,
  allowJoin = true,
}: {
  communityId: string;
  // The deployed MACI contract's address — distinct from communityId (Architecture 1C).
  // communityId is no longer guaranteed to be a callable on-chain address once a community's
  // identity can predate governance being configured; contractAddress is the one MACI__factory
  // and signupToMaci must use. Null when governance isn't configured yet.
  contractAddress: string | null;
  connected: boolean;
  // formalize-communities epic, Child G (/plan-eng-review 2026-08-25, D3) — wagmi's own
  // useAccount().status, threaded down from page.tsx (which already calls useAccount() once)
  // rather than JoinSection calling it a second time independently. Needed to distinguish "truly
  // disconnected" from "still resolving a reconnect on mount" — without it, a returning user with
  // an already-connected wallet would see a false "Connect wallet" flash before status settles,
  // the exact bug RequireAuth.tsx's own connecting/reconnecting guard exists to prevent.
  status: "connecting" | "reconnecting" | "connected" | "disconnected";
  rpcUrl: string;
  // formalize-communities epic, Child F (/plan-eng-review 2026-08-25, D1) — the creator can never
  // Leave their own community (isAuthorized() grants them settings authority independent of any
  // memberships row, so leaving would silently strip their tier permissions while they keep
  // admin access — a confusing half-state, not a real "left" state).
  isCreator: boolean;
  // Bug fix (2026-08-28) — community.allowJoin was fetched by the parent but never threaded down
  // here, so this component had no way to know joining was disabled until AFTER a click round-
  // tripped to the backend's JoinNotAllowedError. Defaults to true so the ~30 existing call sites
  // in JoinSection.test.tsx (all pre-dating allowJoin) keep their current, correct behavior
  // without needing to pass it explicitly; the one real production call site (CommunityLayout.tsx)
  // always passes the community's actual value.
  allowJoin?: boolean;
}) {
  const queryClient = useQueryClient();
  const { signOut } = useSiwe();
  const { connectors, connect, isPending: isConnecting } = useConnect();
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
  // formalize-communities epic, Child F (/plan-eng-review 2026-08-25) — inline confirm-to-leave,
  // matching EventsSection.tsx's existing cancel-event pattern (not a bare window.confirm()).
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const { data: membership } = useQuery({
    queryKey: ["membershipStatus", communityId],
    queryFn: () => membershipApi.getMembershipStatus(communityId),
    enabled: connected,
    // Bug fix (2026-08-28) — a requester waiting on admin review previously only saw the approval
    // land after a manual reload/renavigation; there's no notification infrastructure anywhere in
    // this codebase (TODOS.md) to push it instead, so poll while pending and stop once resolved
    // (member/none/rejected) to avoid indefinite background traffic for a settled request.
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 15_000 : false),
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

  async function handleLeave() {
    setError(null);
    setIsLeaving(true);
    try {
      await withAuthDetect(() => membershipApi.leave(communityId), signOut);
      setJustJoined(false);
      queryClient.invalidateQueries({ queryKey: ["membershipStatus", communityId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave");
    } finally {
      setIsLeaving(false);
      setConfirmingLeave(false);
    }
  }

  // formalize-communities epic, Child G (/plan-eng-review 2026-08-25, D1/D3) — a fully
  // disconnected visitor used to see nothing at all here (return null). Now shows a connect
  // prompt, reusing RequireAuth.tsx's exact connect({connector: connectors[0]!}) pattern — once
  // connected, useSiwe's existing auto-sign-in effect fires and SiweGate below takes over with no
  // further navigation. The connecting/reconnecting check must come first: without it, a
  // returning user with an already-connected wallet would see a false prompt before wagmi's
  // reconnect-on-mount resolves (RequireAuth.tsx's own guard for the identical race).
  if (status === "connecting" || status === "reconnecting") {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (!connected) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-400">Connect your wallet to join this community.</p>
        <button
          type="button"
          onClick={() => connect({ connector: connectors[0]! })}
          disabled={isConnecting}
          className="px-6 py-3 bg-accent text-white rounded-[6px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
        >
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </button>
      </div>
    );
  }

  if (!contractAddress) {
    // Bug fix (2026-08-28) — this used to say "but you can still join" unconditionally, which is
    // actively wrong when allowJoin is false: the Join button below would still render and fail
    // only after a round trip to the backend's JoinNotAllowedError. An existing member/pending
    // request still needs to see their own status regardless of allowJoin — it only gates NEW
    // joins, not people already in.
    const joinDisabled =
      !allowJoin && !(justJoined || membership?.status === "member" || membership?.status === "pending");
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-sm text-gray-500">
          {joinDisabled
            ? "Eligibility, Governance and Join not yet configured for this community."
            : "Governance not yet configured for this community — voting isn't available yet, but you can still join."}
        </div>
        {joinDisabled ? null : justJoined || membership?.status === "member" ? (
          <div className="space-y-1">
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
            {/* Child F (/plan-eng-review 2026-08-25, D1) — the creator can never use Leave; the
                backend enforces this too, this is just the matching client-side hide. */}
            {!isCreator &&
              (confirmingLeave ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">Leave this community?</span>
                  <button
                    onClick={() => void handleLeave()}
                    disabled={isLeaving}
                    className="text-error hover:text-error-hover font-medium disabled:opacity-60"
                  >
                    {isLeaving ? "Leaving…" : "Confirm"}
                  </button>
                  <button onClick={() => setConfirmingLeave(false)} className="text-gray-400 hover:text-foreground">
                    Never mind
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingLeave(true)}
                  className="text-xs text-gray-400 hover:text-foreground transition-colors"
                >
                  Leave community
                </button>
              ))}
          </div>
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

  if (!allowJoin && membership?.status !== "pending") {
    // Bug fix (2026-08-28) — governance can be fully configured while allowJoin is toggled off
    // (e.g. paused after launch), so this can't reuse the !contractAddress branch's "Governance
    // not yet configured" copy — governance IS configured here. Matches the backend's own
    // JoinNotAllowedError message for consistency with the reactive error a stale client would
    // otherwise still show after a round trip.
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-sm text-gray-500">
          This community is not currently accepting new members.
        </div>
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
