import { Header } from "../components/Header";
import { TrendingUp, Users, Vote, Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track governance metrics and participation across communities</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-green-600">+12.5%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">1,940</p>
            <p className="text-sm text-gray-600">Total Members</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Vote className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600">+8.3%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">98</p>
            <p className="text-sm text-gray-600">Active Proposals</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-600">+15.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">68.4%</p>
            <p className="text-sm text-gray-600">Participation Rate</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-green-600">+22.1%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">2,847</p>
            <p className="text-sm text-gray-600">Total Votes Cast</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Voting Activity (Last 30 Days)</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Growth</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Community Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Breakdown</h2>
          <div className="space-y-4">
            {[
              { name: "EDGE City", members: 890, proposals: 42, participation: 72 },
              { name: "ZuKas Residency", members: 450, proposals: 23, participation: 68 },
              { name: "ZuAfrique", members: 320, proposals: 18, participation: 65 },
              { name: "Zuitzerland", members: 280, proposals: 15, participation: 62 },
            ].map((community) => (
              <div key={community.name} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{community.name}</h3>
                  <span className="text-sm text-gray-600">{community.participation}% participation</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${community.participation}%` }}
                  />
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>{community.members.toLocaleString()} members</span>
                  <span>{community.proposals} proposals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voting Mechanism Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voting Mechanism Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600 mb-2">65%</p>
              <p className="text-sm font-medium text-gray-700">Simple Majority</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 mb-2">25%</p>
              <p className="text-sm font-medium text-gray-700">Quadratic Voting</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <p className="text-3xl font-bold text-pink-600 mb-2">10%</p>
              <p className="text-sm font-medium text-gray-700">Ranked Choice</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
