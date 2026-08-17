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
import type { Community } from "@/src/services/communityApi";
import { useDeployPoll, getEthersSigner, votingMechanismToMode } from "@/src/hooks/useDeployPoll";
import { deployPolicyContract } from "@/src/services/policyDeploy";
import { decodeContractError } from "@/src/lib/decodeContractError";
import { GovernanceTypes, PolicyType, type SignUpPolicyType, type PollDeployConfig } from "@/src/config";
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

const TALLY_MECHANISM_OPTIONS: { value: GovernanceActionTallyMechanism; label: string }[] = [
  { value: "simple", label: "Simple Majority" },
  { value: "quadratic", label: "Quadratic Voting" },
  { value: "ranked", label: "Ranked Choice" },
  { value: "full", label: "Full Voting" },
];

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
  /** Needed to build the eligibility policy picker below (allowedPolicies). */
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

  // Each community's MACI contract only accepts a subset of tally mechanisms (see MACI.sol's
  // supportedModes allow-list) — offering an unsupported one here reverts with UnsupportedMode()
  // on deploy, so filter to what this community actually supports.
  const supportedModes = community?.supportedModes ?? [];
  const allowedTallyOptions =
    supportedModes.length > 0
      ? TALLY_MECHANISM_OPTIONS.filter((opt) => supportedModes.includes(votingMechanismToMode(opt.value)))
      : TALLY_MECHANISM_OPTIONS;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy] = useState<GovernanceActionPrivacy>("privacy_preserving");
  const [executionLocation] = useState<GovernanceActionExecutionLocation>("onchain");
  const [tallyMechanism, setTallyMechanism] = useState<GovernanceActionTallyMechanism>(
    allowedTallyOptions[0]?.value ?? "simple",
  );
  const [eligibleTierIds, setEligibleTierIds] = useState<string[]>([]);
  const [eligibilityPolicyType, setEligibilityPolicyType] = useState<SignUpPolicyType>(
    allowedPolicyTypes[0] ?? "FreeForAll",
  );
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

  const newPolicyArgs = buildPolicyArgs(eligibilityPolicyType, newPolicyInputs);
  const eligibilityPolicyReady = !directDeploymentEnabled || newPolicyArgs !== null;

  const filledOptionCount = options.filter((o) => o.trim() !== "").length;
  const directModeReady =
    !directDeploymentEnabled || (!!startDate && !!endDate && filledOptionCount >= 2 && eligibilityPolicyReady);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEligibleTierIds([]);
    setEligibilityPolicyType(allowedPolicyTypes[0] ?? "FreeForAll");
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

        if (!newPolicyArgs) throw new Error("Fill in all required eligibility policy fields");
        const signer = await getEthersSigner();
        const policyAddress = await deployPolicyContract(newPolicyArgs, signer, chainId);

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
          pollStartDate: Math.floor(new Date(startDate).getTime() / 1000),
          pollEndDate: Math.floor(new Date(endDate).getTime() / 1000),
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
      setError(decodeContractError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Create Governance Action</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {directDeploymentEnabled && !pollDeployConfig ? (
          <div className="p-8 space-y-6">
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4">
              On-chain deployment isn't linked for this community yet.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-900"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label htmlFor="governance-action-title" className="block text-sm font-semibold text-gray-900 mb-3">
                Title *
              </label>
              <input
                id="governance-action-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="governance-action-description" className="block text-sm font-semibold text-gray-900 mb-3">
                Description *
              </label>
              <textarea
                id="governance-action-description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Privacy</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                  <input type="radio" checked readOnly className="w-5 h-5" />
                  <span className="font-semibold text-gray-900">Privacy-preserving</span>
                </div>
                <div
                  className="flex items-center gap-3 p-4 border-2 border-gray-100 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <input type="radio" disabled className="w-5 h-5" />
                  <div>
                    <span className="font-semibold text-gray-900">Public</span>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Execution Location</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                  <input type="radio" checked readOnly className="w-5 h-5" />
                  <span className="font-semibold text-gray-900">Onchain</span>
                </div>
                {["Offchain", "Hybrid"].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-4 border-2 border-gray-100 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed"
                    title="Coming soon"
                  >
                    <input type="radio" disabled className="w-5 h-5" />
                    <div>
                      <span className="font-semibold text-gray-900">{label}</span>
                      <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Tally Mechanism *</label>
              <select
                value={tallyMechanism}
                onChange={(e) => setTallyMechanism(e.target.value as GovernanceActionTallyMechanism)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900"
              >
                {allowedTallyOptions.length === 0 && <option value="">No supported tally mechanisms configured</option>}
                {allowedTallyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                <option value="weighted" disabled>
                  Weighted (coming soon)
                </option>
              </select>
            </div>

            {!directDeploymentEnabled && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Eligible Tiers *</label>
                <div className="space-y-2">
                  {votingTiers.length === 0 && (
                    <p className="text-sm text-gray-500">No voting-capable tiers exist in this community yet.</p>
                  )}
                  {votingTiers.map((tier) => (
                    <label
                      key={tier.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={eligibleTierIds.includes(tier.id)}
                        onChange={() => toggleTier(tier.id)}
                        className="w-5 h-5 rounded text-indigo-600"
                      />
                      <span className="text-gray-900">{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {directDeploymentEnabled && (
              <div className="space-y-4 p-4 border-2 border-indigo-100 bg-indigo-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">
                  This community deploys polls directly — no draft or co-sponsorship needed.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Eligibility Policy *</label>
                  <p className="text-xs text-gray-600 mb-2">Who can vote on this poll, enforced on-chain.</p>
                  <select
                    value={eligibilityPolicyType}
                    onChange={(e) => setEligibilityPolicyType(e.target.value as SignUpPolicyType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900"
                  >
                    {allowedPolicyTypes.length === 0 && <option value="">No allowed policies configured</option>}
                    {allowedPolicyTypes.map((type) => (
                      <option key={type} value={type}>
                        {POLICY_TYPE_OPTIONS.find((p) => p.type === type)?.label ?? type}
                      </option>
                    ))}
                  </select>

                  <PolicyArgsFields
                    policyType={eligibilityPolicyType}
                    inputs={newPolicyInputs}
                    updateInput={(key, value) => setNewPolicyInputs((prev) => ({ ...prev, [key]: value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="poll-start-date" className="block text-xs font-semibold text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      id="poll-start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="poll-end-date" className="block text-xs font-semibold text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      id="poll-end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Options * (at least 2)</label>
                  <div className="space-y-2">
                    {options.map((option, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          placeholder={`Option ${i + 1}`}
                          onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setOptions(options.filter((_, j) => j !== i))}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setOptions([...options, ""])}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !directModeReady}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
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
