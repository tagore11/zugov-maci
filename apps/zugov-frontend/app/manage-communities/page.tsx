import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Plus, Edit, Users, FileText } from "lucide-react";
import { CreateCommunityModal } from "../components/CreateCommunityModal";
import { UnionsPanel } from "./UnionsPanel";
import { Link, useNavigate } from "react-router-dom";
import * as communityApi from "@/src/services/communityApi";
import { fetchMembers, fetchPolls } from "@/src/services/subgraph";
import type { GovernanceType } from "@/src/config";

type UserCommunityItem = {
  id: string;
  name: string;
  description: string;
  logo: string;
  members: number;
  proposals: number;
  subgraphStatus: communityApi.Community["subgraphStatus"];
  governanceType: string;
};

function apiToItem(c: communityApi.Community): UserCommunityItem {
  return {
    id: c.id,
    name: c.displayName,
    description: c.description ?? "",
    logo: c.logo ?? "🏛️",
    members: 0,
    proposals: 0,
    subgraphStatus: c.subgraphStatus,
    // Only read when subgraphStatus === "ready" (see readyCommunities below), which implies
    // governance is configured — the "" fallback here is unreachable in practice.
    governanceType: c.governanceType ?? "",
  };
}

export default function ManageCommunitiesPage() {
  const { address } = useAccount();
  const navigate = useNavigate();
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

  // Same pattern as the Explore page and community detail page: only communities whose
  // subgraph has finished indexing get real stats, fetched via the backend proxy.
  const readyCommunities = userCommunities.filter((c) => c.subgraphStatus === "ready");
  const { data: communityStats = {} } = useQuery({
    queryKey: ["ownedCommunityStats", readyCommunities.map((c) => c.id)],
    queryFn: () =>
      Promise.all(
        readyCommunities.map((c) => {
          const subgraphUrl = communityApi.subgraphQueryUrl(c.id);
          const governanceType = c.governanceType as GovernanceType;
          return Promise.all([
            fetchMembers(subgraphUrl, governanceType),
            fetchPolls(subgraphUrl, governanceType).then((p) => p.length),
          ]).then(([members, proposals]) => [c.id, { members, proposals }] as const);
        }),
      ).then(Object.fromEntries<{ members: number; proposals: number }>),
    enabled: readyCommunities.length > 0,
  });

  // Refresh immediately after a new community is created (see app/page.tsx for the same pattern).
  useEffect(() => {
    window.addEventListener("zugov:community-created", fetchUserCommunities);
    return () => window.removeEventListener("zugov:community-created", fetchUserCommunities);
  }, [fetchUserCommunities]);

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Your Communities</h1>
          <p className="text-gray-400">Create and manage your communities</p>
        </div>

        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-[6px] font-semibold hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Community
          </button>
          <Link
            to="/manage-communities/register"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-accent-hover border border-accent rounded-[6px] font-semibold hover:bg-accent/10 transition-colors"
          >
            Register Existing Community
          </Link>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Your Communities</h2>

          {userCommunities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don't own any communities yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-accent-hover hover:text-accent font-medium"
              >
                Create your first community
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userCommunities.map((community) => (
                <div
                  key={community.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/community/${community.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/community/${community.id}`);
                    }
                  }}
                  className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{community.logo}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{community.name}</h3>
                      <p className="text-sm text-gray-400">{community.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{communityStats[community.id]?.members ?? community.members} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{communityStats[community.id]?.proposals ?? community.proposals} proposals</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/community/${community.id}/settings`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Community</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <UnionsPanel communities={userCommunities.map((c) => ({ id: c.id, name: c.name, logo: c.logo }))} />
      </main>

      <CreateCommunityModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
