import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users2 } from "lucide-react";
import { Header } from "../components/Header";
import * as communityApi from "@/src/services/communityApi";

// Public discovery page — not just the unions a given community belongs to (that's
// UnionsSection.tsx on the community detail page, and UnionsPanel.tsx on manage-communities).
// No wallet/auth required, mirrors the homepage's community browse pattern.
export default function UnionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["allUnions", page],
    queryFn: () => communityApi.listAllUnions(page),
  });

  // Session-derived (no address passed) — resolves to an empty list for a disconnected visitor,
  // matching every other pending-invite check in this app (community page redesign,
  // /plan-eng-review 2026-08-26, D2). Failure here is non-critical (a missed badge, not a broken
  // page), so it's allowed to fail silently rather than surfacing an error state.
  const { data: pendingInvites } = useQuery({
    queryKey: ["myPendingUnionInvites"],
    queryFn: () => communityApi.getMyPendingUnionInvites(),
    retry: false,
    throwOnError: false,
  });
  const pendingUnionIds = new Set((pendingInvites ?? []).map((invite) => invite.unionId));

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Unions</h1>
          <p className="text-gray-400">Federations of independent communities coordinating together.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-400">Loading unions...</p>
          </div>
        ) : !data?.unions.length ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-400">No unions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.unions.map((union) => (
              <Link
                key={union.id}
                to={`/unions/${union.id}`}
                className="bg-gray-900 rounded-lg border border-gray-700 p-6 hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{union.logo || "🤝"}</div>
                    <h3 className="font-semibold text-lg text-foreground mt-1">{union.displayName}</h3>
                  </div>
                  {pendingUnionIds.has(union.id) && (
                    <span className="shrink-0 mt-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent-hover text-xs font-medium">
                      Pending invite
                    </span>
                  )}
                </div>
                {union.description && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{union.description}</p>}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users2 className="w-4 h-4" />
                  <span>
                    {union.memberCount} {union.memberCount === 1 ? "community" : "communities"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {data && (data.hasMore || page > 1) && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="min-h-[44px] px-4 rounded-[6px] border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.hasMore}
              className="min-h-[44px] px-4 rounded-[6px] border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
