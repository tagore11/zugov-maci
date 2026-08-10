import { Header } from "../components/Header";
import { Users, FileText, Award } from "lucide-react";
import { DELEGATES } from "@/app/lib/placeholder-data";

export default function DelegatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delegates</h1>
          <p className="text-gray-600">Find and delegate your voting power to trusted community members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Delegates</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{DELEGATES.length}</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Active Delegations</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">504</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Avg Reputation</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">768</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>All Communities</option>
              <option>ZuKas Residency</option>
              <option>ZuAfrique</option>
              <option>Zuitzerland</option>
              <option>EDGE City</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>Sort by Reputation</option>
              <option>Sort by Total Votes</option>
              <option>Sort by Communities</option>
            </select>
          </div>
        </div>

        {/* Delegates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DELEGATES.map((delegate) => (
            <div
              key={delegate.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{delegate.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">{delegate.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{delegate.statement}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {delegate.communities.map((community) => (
                      <span
                        key={community}
                        className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded"
                      >
                        {community}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Votes</p>
                  <p className="text-lg font-semibold text-gray-900">{delegate.totalVotes}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reputation</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <p className="text-lg font-semibold text-gray-900">{delegate.reputation}</p>
                  </div>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Delegate to {delegate.name}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
