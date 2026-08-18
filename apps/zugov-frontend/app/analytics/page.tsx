import { Header } from "../components/Header";
import { TrendingUp, Users, Vote, Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track governance metrics and participation across communities</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#648DAF]/20 rounded-lg">
                <Users className="w-5 h-5 text-[#86A6C1]" />
              </div>
              <span className="text-xs font-medium text-green-400">+12.5%</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">1,940</p>
            <p className="text-sm text-gray-400">Total Members</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <Vote className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-400">+8.3%</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">98</p>
            <p className="text-sm text-gray-400">Active Proposals</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#648DAF]/20 rounded-lg">
                <Activity className="w-5 h-5 text-[#86A6C1]" />
              </div>
              <span className="text-xs font-medium text-green-400">+15.7%</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">68.4%</p>
            <p className="text-sm text-gray-400">Participation Rate</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-xs font-medium text-green-400">+22.1%</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">2,847</p>
            <p className="text-sm text-gray-400">Total Votes Cast</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Voting Activity (Last 30 Days)</h2>
            <div className="h-64 flex items-center justify-center bg-gray-800/40 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Community Growth</h2>
            <div className="h-64 flex items-center justify-center bg-gray-800/40 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Community Breakdown */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Community Breakdown</h2>
          <div className="space-y-4">
            {[
              { name: "EDGE City", members: 890, proposals: 42, participation: 72 },
              { name: "ZuKas Residency", members: 450, proposals: 23, participation: 68 },
              { name: "ZuAfrique", members: 320, proposals: 18, participation: 65 },
              { name: "Zuitzerland", members: 280, proposals: 15, participation: 62 },
            ].map((community) => (
              <div key={community.name} className="border-b border-gray-700 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{community.name}</h3>
                  <span className="text-sm text-gray-400">{community.participation}% participation</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <div className="bg-[#648DAF] h-2 rounded-full" style={{ width: `${community.participation}%` }} />
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>{community.members.toLocaleString()} members</span>
                  <span>{community.proposals} proposals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voting Mechanism Distribution */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Voting Mechanism Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#648DAF]/10 rounded-lg">
              <p className="text-3xl font-bold text-[#86A6C1] mb-2">65%</p>
              <p className="text-sm font-medium text-gray-300">Simple Majority</p>
            </div>
            <div className="text-center p-4 bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-400 mb-2">25%</p>
              <p className="text-sm font-medium text-gray-300">Quadratic Voting</p>
            </div>
            <div className="text-center p-4 bg-amber-900/20 rounded-lg">
              <p className="text-3xl font-bold text-amber-400 mb-2">10%</p>
              <p className="text-sm font-medium text-gray-300">Ranked Choice</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
