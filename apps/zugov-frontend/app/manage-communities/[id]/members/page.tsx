import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "../../../components/Header";
import { ArrowLeft } from "lucide-react";
import * as membershipApi from "@/src/services/membershipApi";
import type { PendingRequest } from "@/src/services/membershipApi";

export default function CommunityMembersPage() {
  const params = useParams();
  const communityId = params.id!;

  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const rows = await membershipApi.listPendingRequests(communityId);
        if (!cancelled) setRequests(rows);
      } catch {
        if (!cancelled) setForbidden(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [communityId]);

  async function handleApprove(requestId: string) {
    setActingOn(requestId);
    try {
      await membershipApi.approveRequest(communityId, requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } finally {
      setActingOn(null);
    }
  }

  async function handleReject(requestId: string) {
    setActingOn(requestId);
    try {
      await membershipApi.rejectRequest(communityId, requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/manage-communities"
          className="inline-flex items-center gap-2 text-[#86A6C1] hover:text-[#648DAF] mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Communities
        </Link>

        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Pending Join Requests</h1>

          {loading && <p className="text-gray-500">Loading…</p>}

          {!loading && forbidden && (
            <p className="text-gray-500">You don&apos;t have permission to review join requests for this community.</p>
          )}

          {!loading && !forbidden && requests.length === 0 && <p className="text-gray-500">No pending requests.</p>}

          {!loading && !forbidden && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 border-2 border-gray-700 rounded-lg">
                  <div>
                    <p className="font-mono text-sm text-white">{req.walletAddress}</p>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt * 1000).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleApprove(req.id)}
                      disabled={actingOn === req.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => void handleReject(req.id)}
                      disabled={actingOn === req.id}
                      className="px-4 py-2 border-2 border-red-600/50 text-red-400 rounded-lg text-sm font-medium hover:bg-red-900/20 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
