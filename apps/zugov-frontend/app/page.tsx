import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { Search, TrendingUp, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthModal } from "./components/AuthModal";
import { EXAMPLE_COMMUNITIES } from "@/app/lib/placeholder-data";
import type { GovernanceType } from "@/src/config";
import { fetchMembers, fetchPolls } from "@/src/services/subgraph";
import * as communityApi from "@/src/services/communityApi";

type CommunityItem = {
  id: string;
  name: string;
  description: string;
  logo: string;
  members: number;
  proposals: number;
  category: string;
  createdAt?: number;
  signUpPolicyType?: string | null;
  subgraphStatus?: communityApi.Community["subgraphStatus"];
  governanceType?: string;
};

const ONE_HOUR_SEC = 3600;

function apiToItem(c: communityApi.Community): CommunityItem {
  return {
    id: c.id,
    name: c.displayName,
    description: c.description ?? "",
    logo: c.logo ?? "🏛️",
    members: 0,
    proposals: 0,
    category: "MACI",
    createdAt: c.createdAt,
    signUpPolicyType: c.signUpPolicyType,
    subgraphStatus: c.subgraphStatus,
    governanceType: c.governanceType ?? undefined,
  };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [communities, setCommunities] = useState<CommunityItem[]>([...EXAMPLE_COMMUNITIES]);
  const [filteredCommunities, setFilteredCommunities] = useState<CommunityItem[]>(communities);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Backend-registered communities whose subgraph has finished indexing go through the
  // backend's proxy (see app/community/[id]/page.tsx for the same pattern on the detail page).
  const readyBackendCommunities = communities.filter((c) => c.subgraphStatus === "ready" && c.governanceType);
  const statsSources = readyBackendCommunities.map((c) => ({
    id: c.id,
    subgraphUrl: communityApi.subgraphQueryUrl(c.id),
    governanceType: c.governanceType as GovernanceType,
  }));

  const { data: communityStats = {} } = useQuery({
    queryKey: ["communityStats", statsSources.map((s) => s.id)],
    queryFn: () =>
      Promise.all(
        statsSources.map((source) =>
          Promise.all([
            fetchMembers(source.subgraphUrl, source.governanceType),
            fetchPolls(source.subgraphUrl, source.governanceType).then((p) => p.length),
          ]).then(([members, proposals]) => [source.id, { members, proposals }] as const),
        ),
      ).then(Object.fromEntries<{ members: number; proposals: number }>),
    enabled: statsSources.length > 0,
  });

  const categories = ["All", "Residency", "Regional", "Network State", "Social"];

  const fetchCommunities = useCallback(async (page: number, reset: boolean) => {
    setIsLoadingCommunities(true);
    try {
      const { communities: items, hasMore: more } = await communityApi.list(page);
      const converted = items.map(apiToItem);
      if (reset) {
        setCommunities([...EXAMPLE_COMMUNITIES, ...converted]);
      } else {
        setCommunities((prev) => [...prev, ...converted]);
      }
      setHasMore(more);
    } catch {
      // keep existing items on error
    } finally {
      setIsLoadingCommunities(false);
    }
  }, []);

  useEffect(() => {
    void fetchCommunities(1, true);
  }, [fetchCommunities]);

  // Subscribe to community-created event for real-time updates
  useEffect(() => {
    const handleCreated = () => {
      setCurrentPage(1);
      void fetchCommunities(1, true);
    };
    window.addEventListener("zugov:community-created", handleCreated);
    return () => window.removeEventListener("zugov:community-created", handleCreated);
  }, [fetchCommunities]);

  // Filter communities whenever search or category changes
  useEffect(() => {
    let filtered = communities;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredCommunities(filtered);
  }, [searchQuery, selectedCategory, communities]);

  const nowSec = Date.now() / 1000;

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-[#16161a] border border-[#2c2c33] rounded-lg p-8 mb-8">
          <h1
            className="text-4xl mb-4 text-white"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }}
          >
            Community governance, built for pop-up cities
          </h1>
          <p className="text-lg text-gray-400 mb-6">
            Join a community, vote in polls, and see decisions made in the open.
          </p>
          <div className="flex gap-4">
            <Link
              to="/manage-communities"
              className="px-6 py-3 bg-[#648DAF] text-white rounded-[6px] font-semibold hover:bg-[#86A6C1] transition-colors"
            >
              Manage Your Communities
            </Link>
            <Link
              to="/manage-profile"
              className="px-6 py-3 bg-transparent text-white border border-[#2c2c33] rounded-[6px] font-semibold hover:bg-[#1e1e24] transition-colors"
            >
              Manage Profile
            </Link>
            <Link
              to="/manage-communities"
              className="px-6 py-3 bg-transparent text-gray-300 border border-[#2c2c33] rounded-[6px] font-semibold hover:bg-[#1e1e24] transition-colors"
            >
              + Create Community
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-[6px] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#648DAF] focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-[6px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-[#648DAF] text-white"
                    : "bg-gray-900 text-gray-300 border border-gray-700 hover:bg-gray-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-400">Total Communities</span>
            </div>
            <p className="text-2xl font-bold text-white">{communities.length}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-400">Active Proposals</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {communities.reduce((sum, c) => sum + (communityStats[c.id]?.proposals ?? c.proposals), 0)}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-400">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {communities.reduce((sum, c) => sum + (communityStats[c.id]?.members ?? c.members), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Communities List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Showing {filteredCommunities.length} Communities</h2>
        </div>

        {isLoadingCommunities && communities.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-400">Loading communities...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-400">No communities found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCommunities.map((community) => {
              const isNew = community.createdAt !== undefined && nowSec - community.createdAt < ONE_HOUR_SEC;
              return (
                <Link
                  key={community.id}
                  to={`/community/${community.id}`}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-6 hover:border-[#648DAF] transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{community.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-white">{community.name}</h3>
                        {isNew && (
                          <span className="inline-block px-1.5 py-0.5 text-xs font-medium text-[#86C1A5] border border-[#64AF8C]/40 rounded-[8px]">
                            just now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-2 py-1 text-xs font-medium text-[#86A6C1] border border-[#648DAF]/40 rounded-[8px]">
                          {community.category}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-800 text-gray-400 rounded-[8px]">
                          {community.signUpPolicyType ?? "Unknown sign-up policy"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">{community.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {(communityStats[community.id]?.members ?? community.members).toLocaleString()} members
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{communityStats[community.id]?.proposals ?? community.proposals} proposals</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {hasMore && !searchQuery && selectedCategory === "All" && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
                void fetchCommunities(nextPage, false);
              }}
              disabled={isLoadingCommunities}
              className="px-6 py-3 bg-[#648DAF] text-white rounded-[6px] font-semibold hover:bg-[#86A6C1] transition-colors disabled:opacity-60"
            >
              {isLoadingCommunities ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
