import { useState } from "react";
import { useChainId } from "wagmi";
import { X } from "lucide-react";
import { GovernanceTypes, type GovernanceType, type PollDeployConfig } from "@/src/config";
import { useDeployPoll, getEthersSigner } from "@/src/hooks/useDeployPoll";
import { deployPolicyContract } from "@/src/services/policyDeploy";

const MACI_ELIGIBILITY_OPTIONS: { value: string; label: string; enabled: boolean }[] = [
  { value: "FreeForAll", label: "Free For All", enabled: true },
  { value: "ERC20", label: "ERC20", enabled: false },
  { value: "MerkleProof", label: "Merkle Proof", enabled: false },
  { value: "ERC20Votes", label: "ERC20 Votes", enabled: false },
  { value: "EAS", label: "EAS", enabled: false },
  { value: "GitcoinPassport", label: "Gitcoin Passport", enabled: false },
  { value: "Zupass", label: "Zupass", enabled: false },
  { value: "Semaphore", label: "Semaphore", enabled: false },
  { value: "AnonAadhaar", label: "Anon Aadhaar", enabled: false },
  { value: "Token", label: "Token", enabled: false },
  { value: "Hats", label: "Hats", enabled: false },
];

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  communityId: string;
  governanceType?: GovernanceType;
  maciAddress?: string;
  pollDeployConfig?: PollDeployConfig;
  existingPollAddress?: string | null;
}

export function CreateProposalModal({
  isOpen,
  onClose,
  onSuccess,
  communityId,
  governanceType,
  maciAddress,
  pollDeployConfig,
  existingPollAddress,
}: CreateProposalModalProps) {
  const isMaci = governanceType === GovernanceTypes.MACI;
  const chainId = useChainId();
  const { isDeploying, deployStep, deployError, deployPoll } = useDeployPoll(governanceType);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    votingMechanism: "simple",
    weighted: false,
    privacy: isMaci ? "private" : "public", //TODO
    startDate: "",
    endDate: "",
    eligibility: isMaci ? "FreeForAll" : "",
    options: ["", ""],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate).getTime();
      const end = new Date(formData.endDate).getTime();
      if (start >= end) {
        alert("End date must be after start date.");
        return;
      }
      if (start <= Date.now()) {
        alert("Start date must be in the future.");
        return;
      }
    }

    if (isMaci && maciAddress && pollDeployConfig) {
      try {
        // Only "Free For All" is enabled in MACI_ELIGIBILITY_OPTIONS above, so a fresh
        // FreeForAll policy is always what's needed here — matches this modal's prior behavior.
        const signer = await getEthersSigner();
        const policyAddress = await deployPolicyContract({ type: "FreeForAll" }, signer, chainId);
        await deployPoll({
          maciAddress,
          pollDeployConfig,
          existingPollAddress: existingPollAddress ?? null,
          policyAddress,
          formData,
        });
        setFormData({
          title: "",
          description: "",
          votingMechanism: "simple",
          weighted: false,
          privacy: "private",
          startDate: "",
          endDate: "",
          eligibility: "FreeForAll",
          options: ["", ""],
        });
        onSuccess?.();
        onClose();
      } catch {
        // deployError is set by the hook; stay open so user can see it
      }
      return;
    }

    // Fallback: save to localStorage for non-MACI or unconfigured communities
    const newProposal = {
      id: Date.now().toString(),
      communityId,
      title: formData.title,
      description: formData.description,
      status: "active",
      type: "onchain",
      privacy: formData.privacy,
      eligible: true,
      votes: 0,
      votingMechanism: formData.votingMechanism,
      weighted: formData.weighted,
      startDate: formData.startDate,
      endDate: formData.endDate,
      eligibility: formData.eligibility,
      options: formData.options.filter((o) => o.trim() !== ""),
      createdAt: new Date().toISOString(),
    };
    const existingProposals = localStorage.getItem(`proposals_${communityId}`);
    const proposals = existingProposals ? JSON.parse(existingProposals) : [];
    proposals.push(newProposal);
    localStorage.setItem(`proposals_${communityId}`, JSON.stringify(proposals));
    setFormData({
      title: "",
      description: "",
      votingMechanism: "simple",
      weighted: false,
      privacy: isMaci ? "private" : "public", //TODO
      startDate: "",
      endDate: "",
      eligibility: isMaci ? "FreeForAll" : "", //TODO
      options: ["", ""],
    });
    window.location.reload();
    onClose();
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Create New Proposal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Proposal Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-400"
              placeholder="Enter proposal title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-400"
              placeholder="Describe the proposal in detail"
            />
          </div>

          {/* Voting Mechanism */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Voting Mechanism *</label>
            <select
              value={formData.votingMechanism}
              onChange={(e) => setFormData({ ...formData, votingMechanism: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900"
            >
              <option value="simple">Simple Majority</option>
              <option value="quadratic">Quadratic Voting</option>
              <option value="ranked">Ranked Choice</option>
              <option value="full">Full Voting</option>
            </select>
          </div>

          {/* Weighted Voting */}
          <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-200 opacity-50 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                disabled
                checked={false} //TODO
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-1 cursor-not-allowed"
              />
              <div>
                <span className="text-base font-semibold text-gray-900 block mb-2">Weighted Voting</span>
                <p className="text-sm text-gray-600">Enable voting power based on token holdings or reputation score</p>
                <p className="text-xs text-gray-400 mt-1">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Privacy *</label>
            {isMaci && <p className="text-sm text-gray-500 mb-3">MACI governance requires private voting.</p>}
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center gap-3 p-5 border-2 rounded-lg ${isMaci ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" : "border-gray-200 cursor-pointer hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.privacy === "public"}
                  disabled={isMaci} //TODO
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-base text-gray-900">Public</span>
              </label>
              <label
                className={`flex items-center gap-3 p-5 border-2 rounded-lg ${isMaci ? "border-indigo-500 bg-indigo-50 cursor-not-allowed" : "border-gray-200 cursor-pointer hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={formData.privacy === "private"}
                  disabled={isMaci} //TODO
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-base text-gray-900">Private</span>
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Start Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">End Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900"
              />
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Eligibility Criteria *</label>
            {isMaci ? (
              <select
                required
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900"
              >
                {MACI_ELIGIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={!opt.enabled}>
                    {opt.label}
                    {!opt.enabled ? " (coming soon)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-400"
                placeholder="Define who can vote on this proposal"
              />
            )}
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Voting Options *</label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-400"
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium"
              >
                + Add Option
              </button>
            </div>
          </div>

          {/* Actions */}
          {deployError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Deployment failed</p>
              <p className="text-xs text-red-600 mt-1 break-all">{deployError}</p>
            </div>
          )}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeploying}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-base text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeploying ? (deployStep ?? "Deploying...") : "Create Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
