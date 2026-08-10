import { Header } from "../components/Header";
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { ALL_PROPOSALS } from "@/app/lib/placeholder-data";

export default function ProposalsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Proposals</h1>
          <p className="text-gray-600">Browse and vote on proposals across all communities</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>All Status</option>
              <option>Active</option>
              <option>Closed</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>All Types</option>
              <option>Onchain</option>
              <option>Offchain</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>All Communities</option>
              <option>ZuKas Residency</option>
              <option>ZuAfrique</option>
              <option>Zuitzerland</option>
              <option>EDGE City</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>All Eligibility</option>
              <option>Eligible Only</option>
              <option>Not Eligible</option>
            </select>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {ALL_PROPOSALS.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{proposal.communityLogo}</span>
                    <span className="text-sm font-medium text-gray-600">{proposal.community}</span>
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">{proposal.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        proposal.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {proposal.status === "active" ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : (
                        "CLOSED"
                      )}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {proposal.type.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                      {proposal.privacy.toUpperCase()}
                    </span>
                    {proposal.eligible ? (
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        ELIGIBLE TO VOTE
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        NOT ELIGIBLE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {proposal.votes.toLocaleString()} votes
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ends {proposal.endDate}
                  </span>
                </div>
                {proposal.eligible && proposal.status === "active" && (
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Vote Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
