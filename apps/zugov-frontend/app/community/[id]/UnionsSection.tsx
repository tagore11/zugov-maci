import { useQuery } from "@tanstack/react-query";
import * as communityApi from "@/src/services/communityApi";

// Read-only display, mirroring the Sub-communities section's card/mini-card pattern (Design
// Issue 1) — actual invite/accept/decline actions live on the manage-communities page
// (UnionsPanel.tsx), scoped to communities the viewer actually manages.
export function UnionsSection({ communityId }: { communityId: string }) {
  const { data: unions } = useQuery({
    queryKey: ["communityUnions", communityId],
    queryFn: () => communityApi.listUnionsForCommunity(communityId),
  });

  if (!unions?.length) return null;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-3">Unions</h2>
      <div className="flex flex-wrap gap-3">
        {unions.map((union) => (
          <div
            key={union.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/40"
          >
            <span className="text-xl">{union.logo || "🤝"}</span>
            <span className="font-medium text-foreground">{union.displayName}</span>
            {union.status === "pending" && <span className="text-xs text-gray-400">Invited — awaiting response</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
