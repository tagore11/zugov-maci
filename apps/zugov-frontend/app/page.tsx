import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { Search, TrendingUp, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthModal } from "./components/AuthModal";
import { CreateCommunityModal } from "./components/CreateCommunityModal";
import type { GovernanceType } from "@/src/config";
import { fetchMembers, fetchPolls } from "@/src/services/subgraph";
import * as communityApi from "@/src/services/communityApi";
import { communityToItem, unionToItem, type DiscoveryItem } from "@/src/lib/communityDisplay";

type CommunityItem = DiscoveryItem;

const ONE_HOUR_SEC = 3600;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
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

  const categories = ["All", "Residency", "Pop-up City", "Regional", "Network State", "Social", "DAO"];

  const fetchCommunities = useCallback(async (page: number, reset: boolean) => {
    setIsLoadingCommunities(true);
    try {
      const { communities: items, hasMore: more } = await communityApi.list(page);
      const converted = items.map(communityToItem);
      if (reset) {
        // Unions are communities too (ENGINEERING.md's structural-participation decision) — merge
        // them into the same discovery list instead of leaving them only on the separate /unions
        // page. Fetched once on reset (page 1 only); unions are typically far fewer than
        // communities, so a separate paginated merge isn't warranted yet.
        const unionItems = await communityApi
          .listAllUnions(1)
          .then(({ unions }) => unions.map(unionToItem))
          .catch(() => []);
        setCommunities([...converted, ...unionItems]);
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
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 mb-8">
          <h1
            className="text-4xl mb-4 text-foreground"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }}
          >
            Community governance, built for pop-up cities
          </h1>
          <p className="text-lg text-gray-400 mb-6">
            Join a community, vote in polls, and see decisions made in the open.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              to="/manage-communities"
              className="px-5 sm:px-6 py-3 bg-accent text-white rounded-[6px] font-semibold hover:bg-accent-hover transition-colors"
            >
              Manage Your Communities
            </Link>
            <Link
              to="/manage-profile"
              className="px-5 sm:px-6 py-3 bg-transparent text-foreground border border-gray-700 rounded-[6px] font-semibold hover:bg-gray-800 transition-colors"
            >
              Manage Profile
            </Link>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-5 sm:px-6 py-3 bg-transparent text-gray-300 border border-gray-700 rounded-[6px] font-semibold hover:bg-gray-800 transition-colors"
            >
              + Create Community
            </button>
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
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-[6px] text-foreground placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-[6px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-accent text-white"
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
            <p className="text-2xl font-bold text-foreground">{communities.length}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-400">Active Proposals</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {communities.reduce((sum, c) => sum + (communityStats[c.id]?.proposals ?? c.proposals), 0)}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-400">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {communities.reduce((sum, c) => sum + (communityStats[c.id]?.members ?? c.members), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Communities List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Showing {filteredCommunities.length} Communities</h2>
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
                  to={community.isUnion ? `/unions/${community.id}` : `/community/${community.id}`}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-6 hover:border-accent transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{community.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">{community.name}</h3>
                        {isNew && (
                          <span className="inline-block px-1.5 py-0.5 text-xs font-medium text-[#86C1A5] border border-[#64AF8C]/40 rounded-[8px]">
                            just now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {community.isUnion ? (
                          <span className="inline-block px-2 py-1 text-xs font-medium text-accent-hover border border-accent/40 rounded-[8px]">
                            Union
                          </span>
                        ) : (
                          <>
                            {community.category && (
                              <span className="inline-block px-2 py-1 text-xs font-medium text-accent-hover border border-accent/40 rounded-[8px]">
                                {community.category}
                              </span>
                            )}
                            {community.governanceBadge && (
                              <span className="inline-block px-2 py-1 text-xs font-medium text-accent-hover border border-accent/40 rounded-[8px]">
                                {community.governanceBadge}
                              </span>
                            )}
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-800 text-gray-400 rounded-[8px]">
                              {community.signUpPolicyType ?? "Unknown sign-up policy"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">{community.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {(communityStats[community.id]?.members ?? community.members).toLocaleString()}{" "}
                        {community.isUnion ? "communities" : "members"}
                      </span>
                    </div>
                    {!community.isUnion && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{communityStats[community.id]?.proposals ?? community.proposals} proposals</span>
                      </div>
                    )}
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
              className="px-6 py-3 bg-accent text-white rounded-[6px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {isLoadingCommunities ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CreateCommunityModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
