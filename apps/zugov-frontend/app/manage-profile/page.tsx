import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Shield, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { appConstants } from "@/src/config";
import { fetchIsRegistered, formatMaciUserId } from "@/src/services/subgraph";
import { useMaci } from "@/src/context/MaciContext";
import * as credentialApi from "@/src/services/credentialApi";
import { useCredentialScan } from "@/src/hooks/useCredentialScan";

const REAL_DAOS = Object.values(appConstants).flatMap(({ daos }) => Object.values(daos).filter((dao) => dao.id));

const PROTOCOL_LABELS: Record<credentialApi.Protocol, { name: string; icon: string }> = {
  zupass: { name: "Zupass", icon: "🎫" },
  zkid: { name: "zkID", icon: "🪪" },
};

const STATUS_STYLES: Record<credentialApi.CredentialStatus, { border: string; text: string; label: string }> = {
  verified: { border: "border-green-200 bg-green-50", text: "text-green-600", label: "Verified" },
  unverified: { border: "border-gray-200 bg-gray-50", text: "text-gray-500", label: "Not Verified" },
  expired: { border: "border-amber-200 bg-amber-50", text: "text-amber-600", label: "Expired" },
};

// A check that failed to complete is distinct from a genuine "unverified" result (spec.md edge
// case: "not a silent failure and not a false 'unverified'") — its own style, not folded into
// STATUS_STYLES's three real credential states.
const CHECK_FAILED_STYLE = {
  border: "border-orange-200 bg-orange-50",
  text: "text-orange-600",
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
    queryFn: () =>
      Promise.all(
        REAL_DAOS.map((dao) =>
          fetchIsRegistered(dao.subgraphUrl, dao.governanceType, maciUserId!).then((isMember) =>
            isMember ? dao : null,
          ),
        ),
      ).then((results) => results.filter((dao) => dao !== null)),
    enabled: !!maciUserId,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Profile</h1>
          <p className="text-gray-600">View your identity badges and community affiliations</p>
        </div>

        {/* Identity Badges Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Identity Badges</h2>
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
                          <h3 className="font-semibold text-gray-900">{label.name}</h3>
                          <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                        </div>
                      </div>
                      {status === "verified" && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => void handleRecheck(protocol)}
                      disabled={isRechecking}
                      className="w-full mt-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Community Affiliations</h2>
          </div>

          {!maciUserId ? (
            <p className="text-sm text-gray-500">Connect your wallet to see your community memberships.</p>
          ) : memberCommunities.length === 0 ? (
            <p className="text-sm text-gray-500">You are not registered in any communities yet.</p>
          ) : (
            <div className="space-y-4">
              {memberCommunities.map((dao) => (
                <Link
                  key={dao.id}
                  to={`/community/${dao.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{dao.logo ?? dao.logoUrl ?? ""}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 hover:text-indigo-600 transition-colors">
                          {dao.displayName ?? dao.id}
                        </h3>
                        <p className="text-sm text-gray-600">Member</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">— / —</span>
                    </div>
                  </div>

                  {/* Reputation Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                      style={{ width: "0%" }}
                    />
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
