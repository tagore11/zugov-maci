import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { Header } from "../../components/Header";
import { ArrowLeft, Settings } from "lucide-react";
import { appConstants } from "@/src/config";
import * as communityApi from "@/src/services/communityApi";
import type { Community } from "@/src/services/communityApi";
import { useIsCommunityAdmin } from "@/src/hooks/useMembershipPermission";
import { JoinSection } from "./JoinSection";

export interface CommunityOutletContext {
  community: Community;
  address?: string;
  connected: boolean;
  status: ReturnType<typeof useAccount>["status"];
  isCreator: boolean;
  isCommunityAdmin: boolean;
  rpcUrl: string;
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-foreground text-right min-w-0 break-words ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function formatRelativeTime(unixSec: number): string {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(unixSec * 1000).toLocaleDateString();
}

// formalize-communities epic, community page redesign (/plan-design-review + /plan-eng-review,
// 2026-08-26) — active-tab styling matches DESIGN.md's single-accent rule: terracotta text +
// underline for the active tab, gray-400 for inactive ones. `end` on the index tab keeps it from
// matching every nested path (NavLink's default prefix match would otherwise leave "Overview"
// showing active on every tab).
function TabLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
          isActive
            ? "border-accent text-foreground"
            : "border-transparent text-gray-400 hover:text-foreground hover:border-gray-700"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function CommunityLayout() {
  const params = useParams();
  const communityId = params.id!;
  const { address, status } = useAccount();
  const chainId = useChainId();
  const rpcUrl = appConstants[chainId as keyof typeof appConstants]?.rpcUrl ?? Object.values(appConstants)[0].rpcUrl;

  const { data: backendCommunity, isLoading: isCommunityLoading } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => communityApi.get(communityId),
    enabled: !!communityId,
  });

  // The other half of the parent/child relationship (CommunityTabRoutes' Overview tab renders
  // this community's own children looking down); this looks up, so a sub-community's header can
  // link back to the community it belongs to.
  const { data: parentCommunity } = useQuery({
    queryKey: ["community", backendCommunity?.parentCommunityId],
    queryFn: () => communityApi.get(backendCommunity!.parentCommunityId!),
    enabled: !!backendCommunity?.parentCommunityId,
  });

  const isCreator =
    !!address && !!backendCommunity && address.toLowerCase() === backendCommunity.creatorAddress.toLowerCase();
  const isCommunityAdmin = useIsCommunityAdmin(communityId, !!address);

  if (isCommunityLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div
            role="status"
            aria-label="Loading community"
            className="rounded-xl border border-gray-700 bg-gray-900 p-6 animate-pulse"
          >
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  if (!backendCommunity) {
    return (
      <div className="min-h-screen bg-gray-950 text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Communities
          </Link>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
            <p className="text-xl font-semibold text-foreground mb-2">Community not found</p>
            <p className="text-gray-400 text-sm">No community is registered at this address.</p>
          </div>
        </main>
      </div>
    );
  }

  const dc = backendCommunity;
  const outletContext: CommunityOutletContext = {
    community: dc,
    address,
    connected: !!address,
    status,
    isCreator,
    isCommunityAdmin,
    rpcUrl,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Communities
        </Link>

        {/* Persistent identity + Join/Leave — visible regardless of which tab is active, since
            membership status affects what every tab shows (e.g. DiscussionsSection is members-
            only). Member/poll counts stay inside Overview's Governance card (not here) — they
            depend on the subgraph fetch, which is deliberately Overview-tab-only so Layout
            doesn't pull in governance data on every page load regardless of which tab a visitor
            actually wants (community page redesign, /plan-eng-review 2026-08-26). */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{dc.logo || "🏛️"}</span>
            <div>
              <h1 className="text-2xl font-bold">{dc.displayName}</h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{dc.id}</p>
            </div>
          </div>

          {parentCommunity && (
            <Link
              to={`/community/${parentCommunity.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent-hover transition-colors"
            >
              <span aria-hidden="true">↳</span>
              Sub-community of <span className="text-foreground font-medium">{parentCommunity.displayName}</span>
            </Link>
          )}

          {dc.description && <p className="text-gray-400 text-sm">{dc.description}</p>}

          <div className="rounded-lg border border-gray-700 divide-y divide-gray-700 text-sm">
            <InfoRow label="Created" value={formatRelativeTime(dc.createdAt)} />
            <InfoRow label="Creator" value={`${dc.creatorAddress.slice(0, 6)}…${dc.creatorAddress.slice(-4)}`} mono />
          </div>

          <JoinSection
            communityId={dc.id}
            contractAddress={dc.contractAddress}
            connected={!!address}
            status={status}
            rpcUrl={rpcUrl}
            isCreator={isCreator}
            allowJoin={dc.allowJoin}
          />
        </div>

        {/* Route-backed tab nav (community page redesign, /plan-design-review + /plan-eng-review,
            2026-08-26) — a <nav> of real links, not an ARIA tablist: each tab is a distinct route
            (shareable/bookmarkable URL, correct browser back/forward), not a single-page panel
            switch, so role="tablist" would promise keyboard-arrow panel semantics that don't
            exist here. Settings only appears for the creator or a canManageMembership admin,
            always last — same gate page.tsx used to apply to the old Settings link. */}
        <nav aria-label="Community sections" className="flex gap-1 border-b border-gray-700 overflow-x-auto">
          <TabLink to={`/community/${dc.id}`} end>
            Overview
          </TabLink>
          <TabLink to={`/community/${dc.id}/events`}>Events</TabLink>
          <TabLink to={`/community/${dc.id}/proposals`}>Proposals</TabLink>
          <TabLink to={`/community/${dc.id}/discussions`}>Discussions</TabLink>
          {(isCreator || isCommunityAdmin) && (
            <NavLink
              to={`/community/${dc.id}/settings`}
              className={({ isActive }) =>
                `ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-accent text-foreground"
                    : "border-transparent text-gray-400 hover:text-foreground hover:border-gray-700"
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
          )}
        </nav>

        <Outlet context={outletContext} />
      </main>
    </div>
  );
}
