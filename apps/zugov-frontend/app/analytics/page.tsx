import { useEffect, useState } from "react";
import { Users, Vote, Activity, CalendarDays, Network, FileText } from "lucide-react";
import { Header } from "../components/Header";
import { fetchAnalytics, type AnalyticsSummary } from "@/src/services/analyticsApi";

/**
 * Every figure on this page comes from a query.
 *
 * It previously rendered constants: 1,940 members, 98 proposals, 68.4%
 * participation, and four green percentage deltas, none of which any code
 * computed. A number on a governance dashboard is a claim about the community,
 * so an invented one is worse than an absent one. Participation rate and trends
 * are absent rather than estimated, because the vote records they need live
 * on-chain and are not readable here.
 */

const TILES: { key: keyof AnalyticsSummary; label: string; icon: typeof Users }[] = [
  { key: "communities", label: "Communities", icon: Network },
  { key: "members", label: "Members", icon: Users },
  { key: "proposals", label: "Proposals", icon: FileText },
  { key: "formalizedProposals", label: "Formalized proposals", icon: Vote },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "activeUnionMemberships", label: "Active union memberships", icon: Activity },
];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAnalytics()
      .then((data) => alive && setSummary(data))
      .catch((cause: unknown) => alive && setError(cause instanceof Error ? cause.message : "Failed to load"));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-gray-400">Counts across every community on this deployment</p>
        </div>

        {error ? (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {TILES.map(({ key, label, icon: Icon }) => (
              <div key={key} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <div className="p-2 bg-accent/20 rounded-lg w-fit mb-4">
                  <Icon className="w-5 h-5 text-accent-hover" />
                </div>
                {summary ? (
                  <p className="text-2xl font-bold text-foreground mb-1 tabular-nums">
                    {summary[key].toLocaleString()}
                  </p>
                ) : (
                  <div className="h-8 w-16 bg-gray-800 animate-pulse rounded mb-1" />
                )}
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Participation is not shown</h2>
          <p className="text-sm text-gray-400 max-w-prose">
            Turnout and trends need vote records joined against an eligible-voter set. MACI ballots are on-chain and
            this database cannot read them, so those figures are left out rather than estimated.
          </p>
        </div>
      </main>
    </div>
  );
}
