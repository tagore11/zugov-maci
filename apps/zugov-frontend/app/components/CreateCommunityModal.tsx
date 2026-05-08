import { useState } from "react";
import { X, Upload } from "lucide-react";
import { IDENTITY_PROVIDERS, VOTING_MECHANISMS, EXISTING_COMMUNITIES } from "@/app/lib/placeholder-data";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCommunityModal({ isOpen, onClose }: CreateCommunityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null as File | null,
    identityProviders: [] as string[],
    contractAddress: "",
    treasuryContractAddress: "",
    affiliations: [] as string[],
    affiliationInput: "",
    membershipPolicy: "",
    proposalCreationPolicy: "",
    forumSupport: "no",
    forumPrivacy: "public",
    votingMechanisms: [] as string[],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new community object
    const newCommunity = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      members: 1,
      proposals: 0,
      logo: "🏢",
      category: "Social",
    };

    // Save to localStorage
    const existingCommunities = localStorage.getItem("userCommunities");
    const communities = existingCommunities ? JSON.parse(existingCommunities) : [];
    communities.push(newCommunity);
    localStorage.setItem("userCommunities", JSON.stringify(communities));

    // Also save the full community data
    const fullCommunityData = {
      ...newCommunity,
      ...formData,
    };
    localStorage.setItem(`community_${newCommunity.id}`, JSON.stringify(fullCommunityData));

    // Reset form
    setFormData({
      name: "",
      description: "",
      logo: null,
      identityProviders: [],
      contractAddress: "",
      treasuryContractAddress: "",
      affiliations: [],
      affiliationInput: "",
      membershipPolicy: "",
      proposalCreationPolicy: "",
      forumSupport: "no",
      forumPrivacy: "public",
      votingMechanisms: [],
    });

    // Trigger page reload to show new community
    window.location.reload();
    onClose();
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  const addAffiliation = (community: string) => {
    if (!formData.affiliations.includes(community)) {
      setFormData({
        ...formData,
        affiliations: [...formData.affiliations, community],
      });
    }
  };

  const removeAffiliation = (community: string) => {
    setFormData({
      ...formData,
      affiliations: formData.affiliations.filter((a) => a !== community),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Create New Community</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Community Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Enter community name"
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
              placeholder="Describe your community"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Logo</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-base text-gray-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                className="hidden"
              />
            </div>
          </div>

          {/* Identity Providers */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Supported Identity Providers *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {IDENTITY_PROVIDERS.map((provider) => (
                <label
                  key={provider}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.identityProviders.includes(provider)}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        identityProviders: toggleArrayItem(formData.identityProviders, provider),
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">{provider}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contract Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Contract Address (Optional)</label>
            <input
              type="text"
              value={formData.contractAddress}
              onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="0x..."
            />
          </div>

          {/* Treasury Contract Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Treasury Contract Address (Optional)
            </label>
            <input
              type="text"
              value={formData.treasuryContractAddress}
              onChange={(e) => setFormData({ ...formData, treasuryContractAddress: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="0x..."
            />
          </div>

          {/* Affiliations */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Affiliations (Optional)</label>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Select from existing communities:</p>
                <div className="grid grid-cols-2 gap-2">
                  {EXISTING_COMMUNITIES.map((community) => (
                    <button
                      key={community}
                      type="button"
                      onClick={() => addAffiliation(community)}
                      disabled={formData.affiliations.includes(community)}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.affiliations.includes(community)
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {community}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Or enter custom affiliation:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.affiliationInput}
                    onChange={(e) => setFormData({ ...formData, affiliationInput: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                    placeholder="Enter custom community name"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.affiliationInput.trim()) {
                        addAffiliation(formData.affiliationInput.trim());
                        setFormData({ ...formData, affiliationInput: "" });
                      }
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              {formData.affiliations.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Selected affiliations:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.affiliations.map((affiliation) => (
                      <span
                        key={affiliation}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium"
                      >
                        {affiliation}
                        <button
                          type="button"
                          onClick={() => removeAffiliation(affiliation)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Membership Policy */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Membership Policy *</label>
            <textarea
              required
              value={formData.membershipPolicy}
              onChange={(e) => setFormData({ ...formData, membershipPolicy: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Define who can join the community (e.g., 'Open to all verified users', 'Token holders only')"
            />
          </div>

          {/* Proposal Creation Policy */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Proposal Creation Policy *</label>
            <textarea
              required
              value={formData.proposalCreationPolicy}
              onChange={(e) => setFormData({ ...formData, proposalCreationPolicy: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              placeholder="Define who can create proposals (e.g., 'All members', 'Token holders with minimum 100 tokens')"
            />
          </div>

          {/* Forum Support */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Forum Support *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  name="forumSupport"
                  value="yes"
                  checked={formData.forumSupport === "yes"}
                  onChange={(e) => setFormData({ ...formData, forumSupport: e.target.value })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  name="forumSupport"
                  value="no"
                  checked={formData.forumSupport === "no"}
                  onChange={(e) => setFormData({ ...formData, forumSupport: e.target.value })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium">No</span>
              </label>
            </div>
          </div>

          {/* Forum Privacy */}
          {formData.forumSupport === "yes" && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Forum Privacy</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name="forumPrivacy"
                    value="public"
                    checked={formData.forumPrivacy === "public"}
                    onChange={(e) => setFormData({ ...formData, forumPrivacy: e.target.value })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium">Public</span>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name="forumPrivacy"
                    value="private"
                    checked={formData.forumPrivacy === "private"}
                    onChange={(e) => setFormData({ ...formData, forumPrivacy: e.target.value })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium">Private</span>
                </label>
              </div>
            </div>
          )}

          {/* Voting Mechanisms */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Supported Voting Mechanisms *</label>
            <div className="space-y-3">
              {VOTING_MECHANISMS.map((mechanism) => (
                <label
                  key={mechanism.id}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.votingMechanisms.includes(mechanism.id)}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        votingMechanisms: toggleArrayItem(formData.votingMechanisms, mechanism.id),
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">{mechanism.name}</span>
                </label>
              ))}
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
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
