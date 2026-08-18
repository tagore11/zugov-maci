import { useState } from "react";
import { useChainId } from "wagmi";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as membershipApi from "@/src/services/membershipApi";
import * as governanceActionApi from "@/src/services/governanceActionApi";
import type {
  GovernanceActionExecutionLocation,
  GovernanceActionPrivacy,
  GovernanceActionTallyMechanism,
} from "@/src/services/governanceActionApi";
import * as communityApi from "@/src/services/communityApi";
import type { Community } from "@/src/services/communityApi";
import { fetchPolls } from "@/src/services/subgraph";
import { useDeployPoll, getEthersSigner } from "@/src/hooks/useDeployPoll";
import { deployPolicyContract } from "@/src/services/policyDeploy";
import {
  GovernanceTypes,
  PolicyType,
  type GovernanceType,
  type SignUpPolicyType,
  type PollDeployConfig,
} from "@/src/config";
import {
  POLICY_TYPE_OPTIONS,
  DEFAULT_POLICY_INPUTS,
  buildPolicyArgs,
  PolicyArgsFields,
  type PolicyInputState,
} from "./PolicyArgsFields";

function policyIdToType(id: number): SignUpPolicyType | undefined {
  const entry = Object.entries(PolicyType).find(([, value]) => Number(value) === id);
  return entry?.[0] as SignUpPolicyType | undefined;
}

interface CreateGovernanceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  communityId: string;
  /** When true, this community skips the draft/co-sponsorship stage entirely (specs/007) — the
   * modal collects deploy-time fields up front and deploys in one step instead of creating a draft. */
  directDeploymentEnabled?: boolean;
  /** Required to actually deploy on-chain when directDeploymentEnabled is true; null/undefined means
   * this community has no linked on-chain governance contract yet (FR-006). */
  pollDeployConfig?: PollDeployConfig | null;
  /** Needed to build the eligibility policy picker below (allowedPolicies, subgraph access for
   * discovering reusable existing policy instances, chainId/governanceType). */
  community?: Community;
}

export function CreateGovernanceActionModal({
  isOpen,
  onClose,
  onSuccess,
  communityId,
  directDeploymentEnabled = false,
  pollDeployConfig,
  community,
}: CreateGovernanceActionModalProps) {
  const chainId = useChainId();
  const { data: tiers = [] } = useQuery({
    queryKey: ["tiers", communityId],
    queryFn: () => membershipApi.getTiers(communityId),
    enabled: isOpen,
  });
  const votingTiers = tiers.filter((t) => t.canVote);

  const allowedPolicyTypes = (community?.allowedPolicies ?? [])
    .map(policyIdToType)
    .filter((t): t is SignUpPolicyType => !!t);

  // Existing policy instances that are safe to reuse for a new poll: only from CLOSED past
  // polls. A policy contract has a single `target` (see src/services/policyDeploy.ts) — reusing
  // one from a still-open poll (or the community's sign-up policy) would repoint it and break
  // that poll's/the community's ability to use it. Requires the subgraph to be indexed.
  const subgraphUrl = community?.subgraphStatus === "ready" ? communityApi.subgraphQueryUrl(communityId) : undefined;
  const eligibilityGovernanceType = community?.governanceType as GovernanceType | undefined;
  const { data: pastPolls = [] } = useQuery({
    queryKey: ["pastPollsForEligibility", communityId],
    queryFn: () => fetchPolls(subgraphUrl!, eligibilityGovernanceType!),
    enabled: isOpen && directDeploymentEnabled && !!subgraphUrl && !!eligibilityGovernanceType,
  });
  const nowSec = Date.now() / 1000;
  const closedPolls = pastPolls.filter((p) => Number(p.endDate) <= nowSec);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy] = useState<GovernanceActionPrivacy>("privacy_preserving");
  const [executionLocation] = useState<GovernanceActionExecutionLocation>("onchain");
  const [tallyMechanism, setTallyMechanism] = useState<GovernanceActionTallyMechanism>("simple");
  const [eligibleTierIds, setEligibleTierIds] = useState<string[]>([]);
  const [eligibilityPolicyType, setEligibilityPolicyType] = useState<SignUpPolicyType>(
    allowedPolicyTypes[0] ?? "FreeForAll",
  );
  const [eligibilityMode, setEligibilityMode] = useState<"reuse" | "new">("new");
  const [selectedExistingPolicy, setSelectedExistingPolicy] = useState("");
  const [newPolicyInputs, setNewPolicyInputs] = useState<PolicyInputState>(DEFAULT_POLICY_INPUTS);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deployPoll } = useDeployPoll(GovernanceTypes.MACI);

  if (!isOpen) return null;

  const toggleTier = (tierId: string) => {
    setEligibleTierIds((prev) => (prev.includes(tierId) ? prev.filter((id) => id !== tierId) : [...prev, tierId]));
  };

  const existingInstancesForType = closedPolls
    .filter((p) => policyIdToType(Number(p.policyType)) === eligibilityPolicyType)
    .reduce<{ address: string; usedInPollName: string }[]>((acc, p) => {
      if (!acc.some((e) => e.address.toLowerCase() === p.policy.toLowerCase())) {
        acc.push({ address: p.policy, usedInPollName: p.name });
      }
      return acc;
    }, []);

  const newPolicyArgs = buildPolicyArgs(eligibilityPolicyType, newPolicyInputs);
  const eligibilityPolicyReady =
    !directDeploymentEnabled || (eligibilityMode === "reuse" ? !!selectedExistingPolicy : newPolicyArgs !== null);

  const filledOptionCount = options.filter((o) => o.trim() !== "").length;
  const directModeReady =
    !directDeploymentEnabled || (!!startDate && !!endDate && filledOptionCount >= 2 && eligibilityPolicyReady);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEligibleTierIds([]);
    setEligibilityPolicyType(allowedPolicyTypes[0] ?? "FreeForAll");
    setEligibilityMode("new");
    setSelectedExistingPolicy("");
    setNewPolicyInputs(DEFAULT_POLICY_INPUTS);
    setStartDate("");
    setEndDate("");
    setOptions(["", ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!directDeploymentEnabled && eligibleTierIds.length === 0) {
      setError("Select at least one eligible tier.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (directDeploymentEnabled && pollDeployConfig) {
        // The backend's checkVoteEligibility (used for the "Vote" button badge) still gates on
        // eligibleTierIds regardless of creation path — the UI no longer asks for tiers here
        // since the real gate is now the on-chain eligibility policy below, so every
        // voting-capable tier is recorded automatically rather than picked manually.
        const directEligibleTierIds = votingTiers.map((t) => t.id);

        await governanceActionApi.authorizeDirect(communityId, {
          title,
          description,
          privacy,
          executionLocation,
          tallyMechanism,
          eligibleTierIds: directEligibleTierIds,
        });

        const policyAddress =
          eligibilityMode === "reuse"
            ? selectedExistingPolicy
            : await (async () => {
                if (!newPolicyArgs) throw new Error("Fill in all required eligibility policy fields");
                const signer = await getEthersSigner();
                return deployPolicyContract(newPolicyArgs, signer, chainId);
              })();

        const { pollAddress, pollId, txHash } = await deployPoll({
          maciAddress: communityId,
          pollDeployConfig,
          existingPollAddress: null,
          policyAddress,
          formData: {
            title,
            description,
            votingMechanism: tallyMechanism,
            startDate,
            endDate,
            eligibility: eligibilityPolicyType,
            options,
          },
        });
        await governanceActionApi.confirmDirect(communityId, {
          title,
          description,
          privacy,
          executionLocation,
          tallyMechanism,
          eligibleTierIds: directEligibleTierIds,
          pollAddress,
          pollId,
          txHash,
        });
      } else {
        await governanceActionApi.createDraft(communityId, {
          title,
          description,
          privacy,
          executionLocation,
          tallyMechanism,
          eligibleTierIds,
        });
      }
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create governance action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900 rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">Create Governance Action</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {directDeploymentEnabled && !pollDeployConfig ? (
          <div className="p-8 space-y-6">
            <p className="text-sm text-amber-400 bg-amber-900/20 border border-amber-700/40 rounded-lg p-4">
              On-chain deployment isn't linked for this community yet.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-800 text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label htmlFor="governance-action-title" className="block text-sm font-semibold text-white mb-3">
                Title *
              </label>
              <input
                id="governance-action-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-[#648DAF]"
              />
            </div>

            <div>
              <label htmlFor="governance-action-description" className="block text-sm font-semibold text-white mb-3">
                Description *
              </label>
              <textarea
                id="governance-action-description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-[#648DAF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">Privacy</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border-2 border-[#648DAF] bg-[#648DAF]/10 rounded-lg">
                  <input type="radio" checked readOnly className="w-5 h-5" />
                  <span className="font-semibold text-white">Privacy-preserving</span>
                </div>
                <div
                  className="flex items-center gap-3 p-4 border-2 border-gray-800 bg-gray-800/40 rounded-lg opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <input type="radio" disabled className="w-5 h-5" />
                  <div>
                    <span className="font-semibold text-white">Public</span>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">Execution Location</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border-2 border-[#648DAF] bg-[#648DAF]/10 rounded-lg">
                  <input type="radio" checked readOnly className="w-5 h-5" />
                  <span className="font-semibold text-white">Onchain</span>
                </div>
                {["Offchain", "Hybrid"].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-4 border-2 border-gray-800 bg-gray-800/40 rounded-lg opacity-50 cursor-not-allowed"
                    title="Coming soon"
                  >
                    <input type="radio" disabled className="w-5 h-5" />
                    <div>
                      <span className="font-semibold text-white">{label}</span>
                      <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">Tally Mechanism *</label>
              <select
                value={tallyMechanism}
                onChange={(e) => setTallyMechanism(e.target.value as GovernanceActionTallyMechanism)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-[#648DAF]"
              >
                <option value="simple">Simple Majority</option>
                <option value="quadratic">Quadratic Voting</option>
                <option value="ranked">Ranked Choice</option>
                <option value="full">Full Voting</option>
                <option value="weighted" disabled>
                  Weighted (coming soon)
                </option>
              </select>
            </div>

            {!directDeploymentEnabled && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Eligible Tiers *</label>
                <div className="space-y-2">
                  {votingTiers.length === 0 && (
                    <p className="text-sm text-gray-500">No voting-capable tiers exist in this community yet.</p>
                  )}
                  {votingTiers.map((tier) => (
                    <label
                      key={tier.id}
                      className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/60"
                    >
                      <input
                        type="checkbox"
                        checked={eligibleTierIds.includes(tier.id)}
                        onChange={() => toggleTier(tier.id)}
                        className="w-5 h-5 rounded text-[#648DAF]"
                      />
                      <span className="text-white">{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {directDeploymentEnabled && (
              <div className="space-y-4 p-4 border-2 border-[#648DAF]/40 bg-[#648DAF]/10 rounded-lg">
                <p className="text-sm font-semibold text-white">
                  This community deploys polls directly — no draft or co-sponsorship needed.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Eligibility Policy *</label>
                  <p className="text-xs text-gray-400 mb-2">Who can vote on this poll, enforced on-chain.</p>
                  <select
                    value={eligibilityPolicyType}
                    onChange={(e) => {
                      setEligibilityPolicyType(e.target.value as SignUpPolicyType);
                      setEligibilityMode("new");
                      setSelectedExistingPolicy("");
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-[#648DAF]"
                  >
                    {allowedPolicyTypes.length === 0 && <option value="">No allowed policies configured</option>}
                    {allowedPolicyTypes.map((type) => (
                      <option key={type} value={type}>
                        {POLICY_TYPE_OPTIONS.find((p) => p.type === type)?.label ?? type}
                      </option>
                    ))}
                  </select>

                  <div className="mt-3 space-y-2">
                    {existingInstancesForType.map((instance) => (
                      <label
                        key={instance.address}
                        className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/60"
                      >
                        <input
                          type="radio"
                          name="eligibility-mode"
                          checked={eligibilityMode === "reuse" && selectedExistingPolicy === instance.address}
                          onChange={() => {
                            setEligibilityMode("reuse");
                            setSelectedExistingPolicy(instance.address);
                          }}
                          className="w-5 h-5 text-[#648DAF]"
                        />
                        <span className="text-sm text-gray-200">
                          Reuse existing — <span className="font-mono text-xs">{instance.address}</span> (used in &quot;
                          {instance.usedInPollName}&quot;)
                        </span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/60">
                      <input
                        type="radio"
                        name="eligibility-mode"
                        checked={eligibilityMode === "new"}
                        onChange={() => setEligibilityMode("new")}
                        className="w-5 h-5 text-[#648DAF]"
                      />
                      <span className="text-sm text-gray-200">Deploy a new instance</span>
                    </label>
                  </div>

                  {eligibilityMode === "new" && (
                    <PolicyArgsFields
                      policyType={eligibilityPolicyType}
                      inputs={newPolicyInputs}
                      updateInput={(key, value) => setNewPolicyInputs((prev) => ({ ...prev, [key]: value }))}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="poll-start-date" className="block text-xs font-semibold text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      id="poll-start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#648DAF]"
                    />
                  </div>
                  <div>
                    <label htmlFor="poll-end-date" className="block text-xs font-semibold text-gray-300 mb-1">
                      End Date *
                    </label>
                    <input
                      id="poll-end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#648DAF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Options * (at least 2)</label>
                  <div className="space-y-2">
                    {options.map((option, i) => (
                      <input
                        key={i}
                        type="text"
                        value={option}
                        placeholder={`Option ${i + 1}`}
                        onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#648DAF]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-800 text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !directModeReady}
                className="flex-1 px-6 py-3 bg-[#648DAF] text-white rounded-lg font-semibold hover:bg-[#86A6C1] disabled:opacity-60"
              >
                {isSubmitting
                  ? directDeploymentEnabled
                    ? "Deploying..."
                    : "Creating..."
                  : directDeploymentEnabled
                    ? "Deploy Poll"
                    : "Create Draft"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
