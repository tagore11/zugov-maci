import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Shield, Users, Award, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { GovernanceType } from "@/src/config";
import { fetchIsRegistered, formatMaciUserId } from "@/src/services/subgraph";
import * as communityApi from "@/src/services/communityApi";
import { useMaci } from "@/src/context/MaciContext";
import * as credentialApi from "@/src/services/credentialApi";
import { useCredentialScan } from "@/src/hooks/useCredentialScan";
import { CustodialWalletCard } from "./CustodialWalletCard";
import { AwaitingActions } from "./AwaitingActions";

/** Fetches every registered community across all pages, not just the first. */
async function fetchAllCommunities(): Promise<communityApi.Community[]> {
  const communities: communityApi.Community[] = [];
  let page = 1;
  for (;;) {
    const result = await communityApi.list(page);
    communities.push(...result.communities);
    if (!result.hasMore) break;
    page += 1;
  }
  return communities;
}

const PROTOCOL_LABELS: Record<credentialApi.Protocol, { name: string; icon: string }> = {
  zupass: { name: "Zupass", icon: "🎫" },
  zkid: { name: "zkID", icon: "🪪" },
};

const STATUS_STYLES: Record<credentialApi.CredentialStatus, { border: string; text: string; label: string }> = {
  verified: { border: "border-[#64AF8C]/40 bg-[#64AF8C]/10", text: "text-[#64AF8C]", label: "Verified" },
  unverified: { border: "border-gray-700 bg-gray-800/40", text: "text-gray-500", label: "Not Verified" },
  expired: { border: "border-amber-700/40 bg-amber-900/20", text: "text-amber-400", label: "Expired" },
};

// A check that failed to complete is distinct from a genuine "unverified" result (spec.md edge
// case: "not a silent failure and not a false 'unverified'") — its own style, not folded into
// STATUS_STYLES's three real credential states.
const CHECK_FAILED_STYLE = {
  border: "border-orange-700/40 bg-orange-900/20",
  text: "text-orange-400",
  label: "Check Unavailable",
};

export default function ManageProfilePage() {
  const { maciKeypair } = useMaci();
  const maciUserId = maciKeypair ? formatMaciUserId(maciKeypair) : null;
  const { address } = useAccount();
  const { credentials, checkErrors, recheck, loadStoredOnly } = useCredentialScan(address);
  const [recheckingProtocol, setRecheckingProtocol] = useState<credentialApi.Protocol | null>(null);

  useEffect(() => {
    // Read-only on mount — never triggers a Zupass/zkID popup just from viewing this page.
    // Popups only happen for Story 1 (AuthModal, on connect) and Story 3's explicit re-check below.
    if (address) void loadStoredOnly();
  }, [address, loadStoredOnly]);

  const handleRecheck = async (protocol: credentialApi.Protocol) => {
    setRecheckingProtocol(protocol);
    try {
      await recheck(protocol);
    } finally {
      setRecheckingProtocol(null);
    }
  };

  const { data: memberCommunities = [] } = useQuery({
    queryKey: ["userMemberships", maciUserId],
    queryFn: async () => {
      const communities = await fetchAllCommunities();
      const results = await Promise.all(
        communities
          .filter((community) => community.subgraphStatus === "ready")
          .map((community) =>
            fetchIsRegistered(
              communityApi.subgraphQueryUrl(community.id),
              community.governanceType as GovernanceType,
              maciUserId!,
            ).then((isMember) => (isMember ? community : null)),
          ),
      );
      return results.filter((community) => community !== null);
    },
    enabled: !!maciUserId,
  });

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Manage Profile</h1>
          <p className="text-sm text-gray-400">Your identity, wallet, and community affiliations</p>
        </div>

        <AwaitingActions address={address} />

        <CustodialWalletCard />

        {/* Identity Badges Section */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-accent-hover" />
            <h2 className="text-lg font-semibold text-foreground">Identity Badges</h2>
          </div>

          {!address ? (
            <p className="text-sm text-gray-500">Connect your wallet to see your identity credentials.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(["zupass", "zkid"] as credentialApi.Protocol[]).map((protocol) => {
                const label = PROTOCOL_LABELS[protocol];
                const checkFailed = Boolean(checkErrors[protocol]);
                const status = credentials[protocol]?.status ?? "unverified";
                const style = checkFailed ? CHECK_FAILED_STYLE : STATUS_STYLES[status];
                const isRechecking = recheckingProtocol === protocol;
                return (
                  <div key={protocol} className={`p-4 border rounded-lg ${style.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{label.icon}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{label.name}</h3>
                          <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                        </div>
                      </div>
                      {status === "verified" && (
                        <div className="w-6 h-6 bg-[#64AF8C] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-foreground" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => void handleRecheck(protocol)}
                      disabled={isRechecking}
                      className="w-full mt-2 px-4 py-2 text-sm font-medium text-accent-hover border border-accent rounded-[6px] hover:bg-accent/10 transition-colors disabled:opacity-50"
                    >
                      {isRechecking ? "Checking…" : "Re-check"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Community Affiliations Section */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-accent-hover" />
            <h2 className="text-lg font-semibold text-foreground">Community Affiliations</h2>
          </div>

          {!maciUserId ? (
            <p className="text-sm text-gray-500">Connect your wallet to see your community memberships.</p>
          ) : memberCommunities.length === 0 ? (
            <p className="text-sm text-gray-500">You are not registered in any communities yet.</p>
          ) : (
            <div className="space-y-3">
              {memberCommunities.map((community) => (
                <Link
                  key={community.id}
                  to={`/community/${community.id}`}
                  className="block p-4 rounded-lg border border-gray-700 hover:border-accent hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{community.logo ?? ""}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{community.displayName ?? community.id}</h3>
                        <p className="text-sm text-gray-400">Member</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-300">— / —</span>
                    </div>
                  </div>

                  {/* Reputation Bar */}
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Reputation Score: —</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
