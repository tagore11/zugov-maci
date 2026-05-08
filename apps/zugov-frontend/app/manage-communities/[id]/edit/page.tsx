import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "../../../components/Header";
import { Upload, ArrowLeft, X } from "lucide-react";
import { IDENTITY_PROVIDERS, VOTING_MECHANISMS, EXISTING_COMMUNITIES } from "@/app/lib/placeholder-data";

export default function EditCommunityPage() {
  const params = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "My Community",
    description: "A community for innovators",
    logo: null as File | null,
    identityProviders: ["Zupass", "MetaMask"] as string[],
    contractAddress: "0x1234567890abcdef",
    treasuryContractAddress: "",
    affiliations: [] as string[],
    affiliationInput: "",
    membershipPolicy: "Open to all verified users",
    proposalCreationPolicy: "Token holders with minimum 100 tokens",
    forumSupport: "yes",
    forumPrivacy: "public",
    votingMechanisms: ["simple", "quadratic"] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating community:", formData);
    navigate("/manage-communities");
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/manage-communities"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Communities
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Community</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
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
              <Link
                to="/manage-communities"
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center text-base"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-base"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
