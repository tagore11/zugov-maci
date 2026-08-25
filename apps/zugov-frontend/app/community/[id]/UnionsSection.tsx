import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as communityApi from "@/src/services/communityApi";

// Read-only display, mirroring the Sub-communities section's card/mini-card pattern (Design
// Issue 1) — active unions only. Pending invites and every action (invite/accept/decline/leave)
// live on the community's own settings page (UnionMembershipSection.tsx), not here — Child D,
// /plan-eng-review 2026-08-25. A pending invite used to render as a passive text badge on this
// public page; it's now invisible here entirely, not just non-actionable.
export function UnionsSection({ communityId }: { communityId: string }) {
  const { data: unions } = useQuery({
    queryKey: ["communityUnions", communityId],
    queryFn: () => communityApi.listUnionsForCommunity(communityId),
  });

  const activeUnions = unions?.filter((union) => union.status !== "pending");

  if (!activeUnions?.length) return null;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Unions</h2>
        <Link to="/unions" className="text-xs font-medium text-gray-400 hover:text-foreground transition-colors">
          Browse all unions
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {activeUnions.map((union) => (
          <div
            key={union.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/40"
          >
            <span className="text-xl">{union.logo || "🤝"}</span>
            <span className="font-medium text-foreground">{union.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
