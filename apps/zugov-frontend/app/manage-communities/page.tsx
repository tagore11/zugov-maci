import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Header } from "../components/Header";
import { Plus, Edit, Users, FileText } from "lucide-react";
import { CreateCommunityModal } from "../components/CreateCommunityModal";
import { Link } from "react-router-dom";
import * as communityApi from "@/src/services/communityApi";

type UserCommunityItem = {
  id: string;
  name: string;
  description: string;
  logo: string;
  members: number;
  proposals: number;
};

function apiToItem(c: communityApi.Community): UserCommunityItem {
  return {
    id: c.id,
    name: c.displayName,
    description: c.description ?? "",
    logo: c.logo ?? "🏛️",
    members: 0,
    proposals: 0,
  };
}

export default function ManageCommunitiesPage() {
  const { address } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userCommunities, setUserCommunities] = useState<UserCommunityItem[]>([]);

  const fetchUserCommunities = useCallback(async () => {
    if (!address) {
      setUserCommunities([]);
      return;
    }
    try {
      const { communities: items } = await communityApi.list(1, undefined, address);
      setUserCommunities(items.map(apiToItem));
    } catch {
      // keep previous list on error
    }
  }, [address]);

  useEffect(() => {
    void fetchUserCommunities();
  }, [fetchUserCommunities]);

  // Refresh immediately after a new community is created (see app/page.tsx for the same pattern).
  useEffect(() => {
    window.addEventListener("zugov:community-created", fetchUserCommunities);
    return () => window.removeEventListener("zugov:community-created", fetchUserCommunities);
  }, [fetchUserCommunities]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Communities</h1>
          <p className="text-gray-600">Create and manage your communities</p>
        </div>

        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Community
          </button>
          <Link
            to="/manage-communities/register"
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Register Existing Community
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Communities</h2>

          {userCommunities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don't own any communities yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first community
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userCommunities.map((community) => (
                <div
                  key={community.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{community.logo}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{community.name}</h3>
                      <p className="text-sm text-gray-600">{community.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{community.members} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{community.proposals} proposals</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/manage-communities/${community.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Community</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateCommunityModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
