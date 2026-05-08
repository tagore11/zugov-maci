import { useState } from "react";
import { X } from "lucide-react";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
}

export function CreateProposalModal({ isOpen, onClose, communityId }: CreateProposalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    votingMechanism: "simple",
    weighted: false,
    privacy: "public",
    startDate: "",
    endDate: "",
    eligibility: "",
    options: ["", ""],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new proposal object
    const newProposal = {
      id: Date.now().toString(),
      communityId: communityId,
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

    // Save to localStorage
    const existingProposals = localStorage.getItem(`proposals_${communityId}`);
    const proposals = existingProposals ? JSON.parse(existingProposals) : [];
    proposals.push(newProposal);
    localStorage.setItem(`proposals_${communityId}`, JSON.stringify(proposals));

    // Reset form
    setFormData({
      title: "",
      description: "",
      votingMechanism: "simple",
      weighted: false,
      privacy: "public",
      startDate: "",
      endDate: "",
      eligibility: "",
      options: ["", ""],
    });

    // Trigger page reload
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
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Describe the proposal in detail"
            />
          </div>

          {/* Voting Mechanism */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Voting Mechanism *</label>
            <select
              value={formData.votingMechanism}
              onChange={(e) => setFormData({ ...formData, votingMechanism: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
            >
              <option value="simple">Simple Majority</option>
              <option value="quadratic">Quadratic Voting</option>
              <option value="ranked">Ranked Choice</option>
            </select>
          </div>

          {/* Weighted Voting */}
          <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-200">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.weighted}
                onChange={(e) => setFormData({ ...formData, weighted: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
              />
              <div>
                <span className="text-base font-semibold text-gray-900 block mb-2">Weighted Voting</span>
                <p className="text-sm text-gray-600">Enable voting power based on token holdings or reputation score</p>
              </div>
            </label>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Privacy *</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-5 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.privacy === "public"}
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-base">Public</span>
              </label>
              <label className="flex items-center gap-3 p-5 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={formData.privacy === "private"}
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-base">Private</span>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">End Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Eligibility Criteria *</label>
            <textarea
              required
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Define who can vote on this proposal (e.g., 'All verified members', 'Token holders with minimum 100 tokens')"
            />
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
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
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-base"
            >
              Create Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
