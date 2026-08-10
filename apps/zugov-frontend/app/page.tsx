import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { Search, TrendingUp, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthModal } from "./components/AuthModal";
import { EXAMPLE_COMMUNITIES } from "@/app/lib/placeholder-data";
import { appConstants } from "@/src/config";
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
};

const ONE_HOUR_SEC = 3600;

const REAL_DAOS = Object.values(appConstants).flatMap(({ daos }) => Object.values(daos).filter((dao) => dao.id));

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

  const { data: communityStats = {} } = useQuery({
    queryKey: ["communityStats"],
    queryFn: () =>
      Promise.all(
        REAL_DAOS.map((dao) =>
          Promise.all([
            fetchMembers(dao.subgraphUrl, dao.governanceType),
            fetchPolls(dao.subgraphUrl, dao.governanceType).then((p) => p.length),
          ]).then(([members, proposals]) => [dao.id!, { members, proposals }] as const),
        ),
      ).then(Object.fromEntries<{ members: number; proposals: number }>),
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Discover & Participate in Community Governance</h1>
          <p className="text-lg text-indigo-100 mb-6">
            Explore communities, vote on proposals, and shape the future of decentralized organizations
          </p>
          <div className="flex gap-4">
            <Link
              to="/manage-communities"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Manage Your Communities
            </Link>
            <Link
              to="/manage-profile"
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-400 transition-colors"
            >
              Manage Profile
            </Link>
            <Link
              to="/manage-communities"
              className="px-6 py-3 bg-white/20 text-white border border-white/40 rounded-lg font-semibold hover:bg-white/30 transition-colors"
            >
              + Create Community
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Communities</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{communities.length}</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Active Proposals</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {communities.reduce((sum, c) => sum + (communityStats[c.id]?.proposals ?? c.proposals), 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {communities.reduce((sum, c) => sum + (communityStats[c.id]?.members ?? c.members), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Communities List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Showing {filteredCommunities.length} Communities</h2>
        </div>

        {isLoadingCommunities && communities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Loading communities...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No communities found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCommunities.map((community) => {
              const isNew = community.createdAt !== undefined && nowSec - community.createdAt < ONE_HOUR_SEC;
              return (
                <Link
                  key={community.id}
                  to={`/community/${community.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{community.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{community.name}</h3>
                        {isNew && (
                          <span className="inline-block px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                            just now
                          </span>
                        )}
                      </div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                        {community.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{community.description}</p>

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
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
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
