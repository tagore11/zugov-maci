import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JsonRpcProvider } from "ethers";
import * as membershipApi from "@/src/services/membershipApi";
import { useSignup } from "@/src/hooks/useSignup";
import { useMaci } from "@/src/context/MaciContext";
import { GovernanceTypes } from "@/src/config";
import { MACI__factory } from "@/src/poll-factory-shim";

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
  const { maciKeypair } = useMaci();
  const { isSigningUp, signupToMaci } = useSignup(GovernanceTypes.MACI);
  const [justJoined, setJustJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // membership row is secondary bookkeeping (tiers/permissions), so a failure here (including
    // "already a member", e.g. the community creator was auto-enrolled) shouldn't block success.
    try {
      await membershipApi.join(communityId);
    } catch {
      // best-effort
    }

    setJustJoined(true);
    queryClient.invalidateQueries({ queryKey: ["membershipStatus", communityId] });
    queryClient.invalidateQueries({ queryKey: ["maciStateIndex", communityId] });
  }

  if (!connected) return null;

  if (!contractAddress) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-sm text-gray-500">
        Governance not yet configured for this community — voting isn&apos;t available yet.
      </div>
    );
  }

  // justJoined is a local optimistic flag that covers the gap between the signup tx landing and
  // the maciStateIndex query refetch; isRegisteredOnChain is the persisted source of truth that
  // survives remounts (e.g. navigating away and back to the community card).
  if (justJoined || isRegisteredOnChain) {
    return (
      <div className="rounded-lg border border-green-700 bg-green-900/20 p-3 text-sm text-green-300">
        Signed up — you&apos;re now registered to vote in this community&apos;s MACI state tree.
        {membership?.tierLabel && (
          <>
            {" "}
            Your role: <span className="font-semibold">{membership.tierLabel}</span>.
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
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
