import { Header } from "../components/Header";
import { FileText } from "lucide-react";

// No cross-community proposal listing API exists yet (governance actions are only fetched
// per-community). This page previously rendered entirely fabricated proposals — shows a real
// empty state instead of misleading visitors with fake data (specs/010 US9, FR-018). Browse a
// specific community's page for its real governance actions.
export default function ProposalsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">All Proposals</h1>
          <p className="text-gray-400">Browse and vote on proposals across all communities</p>
        </div>

        <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-700">
          <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-300 font-medium mb-1">Cross-community proposal browsing isn&apos;t available yet</p>
          <p className="text-gray-500 text-sm">Visit a specific community's page to see its governance actions.</p>
        </div>
      </main>
    </div>
  );
}
