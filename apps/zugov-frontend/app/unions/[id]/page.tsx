import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Header } from "../../components/Header";
import * as communityApi from "@/src/services/communityApi";

export default function UnionDetailPage() {
  const params = useParams();
  const unionId = params.id ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["union", unionId],
    queryFn: () => communityApi.getUnion(unionId),
    enabled: !!unionId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-400">Loading union...</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-400">Union not found.</p>
          <Link to="/unions" className="text-accent-hover hover:text-accent text-sm mt-2 inline-block">
            &larr; Back to Unions
          </Link>
        </main>
      </div>
    );
  }

  const { union, members } = data;
  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/unions" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Unions
        </Link>

        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{union.logo || "🤝"}</div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{union.displayName}</h1>
              {union.description && <p className="text-gray-400 mt-2">{union.description}</p>}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Member communities <span className="text-gray-500 font-normal">({activeMembers.length})</span>
          </h2>

          {activeMembers.length === 0 ? (
            <p className="text-sm text-gray-500">No active member communities.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeMembers.map((member) => (
                <Link
                  key={member.communityId}
                  to={`/community/${member.communityId}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-accent transition-colors"
                >
                  <span className="text-2xl">{member.logo || "🏛️"}</span>
                  <span className="font-medium text-foreground">{member.displayName}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Only present at all when the caller is authorized on an active member — the
              backend gates includePending, so an empty array here is indistinguishable from
              "not authorized to see pending invites," which is the correct default either way. */}
          {pendingMembers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Pending invites</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingMembers.map((member) => (
                  <div
                    key={member.communityId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-800/40"
                  >
                    <span className="text-2xl opacity-60">{member.logo || "🏛️"}</span>
                    <span className="text-gray-400">{member.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
