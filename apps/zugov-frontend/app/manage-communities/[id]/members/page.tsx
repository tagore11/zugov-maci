import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "../../../components/Header";
import { ArrowLeft } from "lucide-react";
import * as membershipApi from "@/src/services/membershipApi";
import type { PendingRequest } from "@/src/services/membershipApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect, isAuthError, isForbiddenError } from "@/src/services/httpClient";

export default function CommunityMembersPage() {
  const params = useParams();
  const communityId = params.id!;
  const { signOut, signIn, isSigning, isAuthenticated } = useSiwe();

  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  // /plan-eng-review Phase B (2026-08-23) — a not-signed-in-at-all visitor and a signed-in but
  // unauthorized wallet used to render the byte-identical "You don't have permission" text, with
  // no path to sign in for the former. Distinguishing the two (401 vs 403, via the same
  // HttpError.status the rest of the 401-wrapper work already threads through) fixes that.
  const [notSignedIn, setNotSignedIn] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  // /plan-eng-review (2026-08-23) Batch 1 — handleApprove/handleReject used to have NO catch
  // clause at all (a bare try/finally): any error, including a 401, silently vanished with the
  // request staying in the list and zero indication anything went wrong.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotSignedIn(false);
      setForbidden(false);
      setError(null);
      try {
        const rows = await membershipApi.listPendingRequests(communityId);
        if (!cancelled) setRequests(rows);
      } catch (err) {
        if (cancelled) return;
        if (isAuthError(err)) {
          setNotSignedIn(true);
        } else if (isForbiddenError(err)) {
          setForbidden(true);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load join requests");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // isAuthenticated retries the fetch after a successful sign-in from the notSignedIn prompt
    // below — without it, clicking "Sign in with Ethereum" would flip isAuthenticated but leave
    // this page stuck showing the stale "sign in" message forever.
  }, [communityId, isAuthenticated]);

  async function handleApprove(requestId: string) {
    setActingOn(requestId);
    setError(null);
    try {
      await withAuthDetect(() => membershipApi.approveRequest(communityId, requestId), signOut);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setActingOn(null);
    }
  }

  async function handleReject(requestId: string) {
    setActingOn(requestId);
    setError(null);
    try {
      await withAuthDetect(() => membershipApi.rejectRequest(communityId, requestId), signOut);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/manage-communities"
          className="inline-flex items-center gap-2 text-accent-hover hover:text-accent mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Communities
        </Link>

        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Pending Join Requests</h1>

          {error && (
            <div className="mb-4 rounded-lg border border-red-900/50 bg-red-900/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading && <p className="text-gray-500">Loading…</p>}

          {!loading && notSignedIn && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-gray-500">Sign in to review join requests for this community.</p>
              <button
                onClick={() => void signIn()}
                disabled={isSigning}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-60"
              >
                {isSigning ? "Signing in…" : "Sign in with Ethereum"}
              </button>
            </div>
          )}

          {!loading && forbidden && (
            <p className="text-gray-500">You don&apos;t have permission to review join requests for this community.</p>
          )}

          {!loading && !notSignedIn && !forbidden && requests.length === 0 && (
            <p className="text-gray-500">No pending requests.</p>
          )}

          {!loading && !notSignedIn && !forbidden && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-2 border-gray-700 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-foreground truncate">{req.walletAddress}</p>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt * 1000).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
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
