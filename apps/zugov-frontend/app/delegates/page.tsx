import { Header } from "../components/Header";
import { Users } from "lucide-react";

// No backend delegation feature exists yet (no schema, no API) — this page previously rendered
// entirely fabricated delegates/stats. Shows a real empty state until delegation is implemented,
// rather than misleading visitors with fake data (specs/010 US9, FR-018).
export default function DelegatesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Delegates</h1>
          <p className="text-gray-400">Find and delegate your voting power to trusted community members</p>
        </div>

        <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-700">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-300 font-medium mb-1">Delegation isn&apos;t available yet</p>
          <p className="text-gray-500 text-sm">Check back once this feature ships.</p>
        </div>
      </main>
    </div>
  );
}
