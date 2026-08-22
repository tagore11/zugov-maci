import { useState } from "react";
import { useChainId } from "wagmi";
import { Link, useNavigate } from "react-router-dom";
import type { Hex } from "viem";
import { Header } from "@/app/components/Header";
import { SiweGate } from "@/app/components/SiweGate";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { ALLOWED_POLICIES, VOTING_MODES, DEFAULT_MEMBERSHIP_TIERS } from "@/app/lib/placeholder-data";
import { GovernanceTypes, type GovernanceType, appConstants, supportedChains } from "@/src/config";
import * as communityApi from "@/src/services/communityApi";
import { useMaciContractConfig, type MaciContractConfig } from "@/src/hooks/useMaciContractConfig";
import { useSiwe } from "@/src/hooks/useSiwe";

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;

function labelFor(list: { id: string; name: string }[], id: number): string {
  return list.find((item) => item.id === String(id))?.name ?? `#${id}`;
}

type DetailsFormData = {
  displayName: string;
  description: string;
  logo: string;
};

const INITIAL_DETAILS: DetailsFormData = {
  displayName: "",
  description: "",
  logo: "",
};

export default function RegisterCommunityPage() {
  const navigate = useNavigate();
  const connectedChainId = useChainId();
  const [governanceType, setGovernanceType] = useState<GovernanceType | null>(null);
  const [chainId, setChainId] = useState<number>(
    connectedChainId in appConstants ? connectedChainId : supportedChains[0].id,
  );
  const [contractAddress, setContractAddress] = useState("");
  const [contractConfig, setContractConfig] = useState<MaciContractConfig | null>(null);
  const [details, setDetails] = useState<DetailsFormData>(INITIAL_DETAILS);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contract = useMaciContractConfig();
  const siwe = useSiwe();

  // suppress unused navigate warning
  void navigate;

  const isValidAddress = ADDRESS_REGEX.test(contractAddress);

  const handleLoadContract = async () => {
    const chainConstants = appConstants[chainId as keyof typeof appConstants];
    if (!chainConstants || !isValidAddress) return;

    const config = await contract.fetchConfig(chainConstants, contractAddress as Hex);
    setContractConfig(config);
  };

  const handleAddressChange = (value: string) => {
    setContractAddress(value);
    setContractConfig(null);
    contract.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contractConfig) {
      setError("Load the contract's on-chain configuration before submitting");
      return;
    }
    if (!details.displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const community = await communityApi.registerManual({
        id: contractAddress,
        contractAddress,
        chainId,
        displayName: details.displayName.trim(),
        description: details.description.trim() || undefined,
        logo: details.logo.trim() || undefined,
        allowedPolicies: contractConfig.allowedPolicies,
        supportedModes: contractConfig.supportedModes,
        signUpPolicyType: contractConfig.signUpPolicyType,
        signUpPolicyAddress: contractConfig.signUpPolicyAddress,
        maciDeploymentBlock: contractConfig.deploymentBlock,
        stateTreeDepth: contractConfig.stateTreeDepth,
        source: "manual",
        membershipPolicy: "open",
        tierChangesRequireVote: false,
        tiers: DEFAULT_MEMBERSHIP_TIERS,
        defaultTierLabel: "Regular",
        pollDeployConfig: contractConfig.pollDeployConfig,
      });
      setRegisteredId(community.id);
      setSuccess(true);
      window.dispatchEvent(new CustomEvent("zugov:community-created", { detail: { community } }));
    } catch (err) {
      if (err instanceof communityApi.OwnershipError) {
        setError(err.message);
      } else if (err instanceof communityApi.AuthError) {
        setError("Session expired. Please sign in again.");
        // Invalidate the shared SiweGate session so its "Sign in with Ethereum" prompt reappears
        // instead of continuing to show the (now-broken) submit button.
        void siwe.signOut();
      } else {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && registeredId) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="rounded-xl border border-green-600/50 bg-green-900/20 p-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Community Registered!</h1>
            <p className="text-gray-400">Your community is now globally discoverable on ZuGov.</p>
            <Link
              to={`/community/${registeredId}`}
              className="inline-block px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
            >
              View Community
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link
          to="/manage-communities"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-foreground text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Register Existing Community</h1>
          <p className="text-gray-400 text-sm mt-1">
            Register a governance contract that was already deployed. You must be the contract owner.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Governance Type <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setGovernanceType(GovernanceTypes.MACI)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                governanceType === GovernanceTypes.MACI
                  ? "border-accent bg-accent/10"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <span className="font-medium text-foreground">MACI</span>
              <span className="block text-xs text-gray-400 mt-0.5">Minimal Anti-Collusion Infrastructure</span>
            </button>
          </div>
        </div>

        {governanceType === GovernanceTypes.MACI && (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Chain</label>
              <select
                value={chainId}
                onChange={(e) => {
                  setChainId(Number(e.target.value));
                  setContractConfig(null);
                  contract.reset();
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-foreground focus:outline-none focus:border-accent"
              >
                {supportedChains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                MACI Contract Address <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-foreground placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  disabled={!isValidAddress || contract.isLoading}
                  onClick={() => void handleLoadContract()}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 text-foreground font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                  {contract.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Load Contract
                </button>
              </div>
              {contract.error && <p className="text-sm text-red-400 mt-2">{contract.error}</p>}
            </div>

            {contractConfig && (
              <div className="rounded-lg bg-gray-800/60 border border-gray-700 p-4 space-y-2 text-sm">
                <p className="text-green-400 font-medium mb-1">Detected on-chain configuration</p>
                <p className="text-gray-300">
                  Sign-up policy: <span className="text-foreground">{contractConfig.signUpPolicyType}</span>{" "}
                  <span className="text-gray-500 font-mono text-xs">({contractConfig.signUpPolicyAddress})</span>
                </p>
                <p className="text-gray-300">
                  Allowed poll policies:{" "}
                  <span className="text-foreground">
                    {contractConfig.allowedPolicies.map((id) => labelFor(ALLOWED_POLICIES, id)).join(", ")}
                  </span>
                </p>
                <p className="text-gray-300">
                  Voting modes:{" "}
                  <span className="text-foreground">
                    {contractConfig.supportedModes.map((id) => labelFor(VOTING_MODES, id)).join(", ")}
                  </span>
                </p>
                <p className="text-gray-300">
                  Voter capacity:{" "}
                  <span className="text-foreground">state tree depth {contractConfig.stateTreeDepth}</span>
                </p>
                <p className="text-gray-300">
                  Poll deployment:{" "}
                  {contractConfig.pollDeployConfig ? (
                    <span className="text-green-400">supported (uses this chain&apos;s shared infrastructure)</span>
                  ) : (
                    <span className="text-amber-400">
                      not available — this chain&apos;s registry isn&apos;t reachable or deployed
                    </span>
                  )}
                </p>
              </div>
            )}

            {contractConfig && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="My Community"
                    value={details.displayName}
                    onChange={(e) => setDetails((d) => ({ ...d, displayName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-foreground placeholder-gray-500 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    maxLength={500}
                    placeholder="Optional description..."
                    value={details.description}
                    onChange={(e) => setDetails((d) => ({ ...d, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-foreground placeholder-gray-500 focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-600/50 bg-red-900/20 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <SiweGate message="Sign in with Ethereum to submit registration">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Verifying ownership & registering..." : "Register Community"}
                  </button>
                </SiweGate>
              </>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
