import { Link, useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import * as eventApi from "@/src/services/eventApi";
import type { Event } from "@/src/services/eventApi";
import { HttpError } from "@/src/services/httpClient";
import { useEventRowActions } from "@/src/hooks/useEventRowActions";
import { KIND_META, formatTimeRange } from "../../components/eventDisplay";
import type { CommunityOutletContext } from "./CommunityLayout";

// Event detail page (2026-08-28 /office-hours + /plan-eng-review + /plan-design-review) — the
// shareable, single-event page EventsSection.tsx's inline expand never gave: a real URL you can
// bookmark or send someone, landing on exactly one event instead of a scrolled-to row in a list.
// Read-only + RSVP for v1 (locked scope) — edit/cancel/duplicate stay on the list's own menu;
// building them here would duplicate EventRow's menu/DuplicateForm JSX and CreateEventModal
// wiring for no confirmed need yet (see TODOS.md's "management actions" follow-up).

// Matches WalletConnectButton.tsx's own truncation exactly, but duplicated rather than imported —
// that file is a wallet-connect UI component, not a natural home for a shared formatting util,
// and this is two lines.
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading event"
      className="rounded-xl border border-gray-700 bg-gray-900 p-6 animate-pulse space-y-4"
    >
      <div className="h-4 bg-gray-800 rounded w-24" />
      <div className="h-8 bg-gray-700 rounded w-2/3" />
      <div className="h-4 bg-gray-800 rounded w-1/3" />
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
      <p className="text-xl font-semibold text-foreground mb-2">Event not found</p>
      <p className="text-gray-400 text-sm">This event doesn&apos;t exist, or you don&apos;t have access to view it.</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6 text-center">
      <p className="text-sm text-error">Couldn&apos;t load this event right now.</p>
      <button type="button" onClick={onRetry} className="mt-3 text-sm font-medium text-accent-hover hover:underline">
        Retry
      </button>
    </div>
  );
}

// Design review Pass 5 — reuses ProposalsList.tsx's existing muted-pill convention for a neutral/
// inactive status, rather than a bespoke cancelled-specific style.
function CancelledBadge() {
  return <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded-full">Cancelled</span>;
}

function ParentLink({ communityId, parentEventId }: { communityId: string; parentEventId: string }) {
  const { data: parent } = useQuery({
    queryKey: ["event", communityId, parentEventId],
    queryFn: () => eventApi.getEvent(communityId, parentEventId),
  });

  // Design review Pass 7 / eng review decision — silently omitted on any failure (parent deleted,
  // or its eligibility drifted since this side-event was created — eligibleTierIds is a
  // creation-time snapshot with no re-propagation, see TODOS.md). Matches this app's existing
  // "absence of affordance, not an empty state" convention rather than a broken link or error text.
  if (!parent) return null;

  return (
    <p className="text-sm text-gray-400 mb-2">
      Part of:{" "}
      <Link to={`/community/${communityId}/events/${parentEventId}`} className="text-gray-300 hover:underline">
        {parent.title}
      </Link>
    </p>
  );
}

function SideEventsList({ communityId, event }: { communityId: string; event: Event }) {
  // One level of nesting only (Event.parentEventId's own type comment) — a side-event can never
  // itself have children, so this query only runs for a potential parent.
  const { data } = useQuery({
    queryKey: ["events", communityId, "children-of", event.id],
    queryFn: () => eventApi.listEvents(communityId, { limit: 200 }),
    enabled: !event.parentEventId,
  });

  const sideEvents = (data?.events ?? []).filter((e) => e.parentEventId === event.id);
  if (sideEvents.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-800">
      <h2 className="text-sm font-semibold text-foreground mb-3">Side events</h2>
      <div className="flex flex-col gap-2">
        {sideEvents.map((sideEvent) => (
          <Link
            key={sideEvent.id}
            to={`/community/${communityId}/events/${sideEvent.id}`}
            className="text-sm text-accent-hover hover:underline"
          >
            → {sideEvent.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function RsvpSection({
  communityId,
  event,
  connected,
  walletAddress,
}: {
  communityId: string;
  event: Event;
  connected: boolean;
  walletAddress?: string;
}) {
  const { rsvps, isLoadingRsvps, isErrorRsvps, hasRsvped, rsvpPending, actionError, handleRsvpToggle } =
    useEventRowActions(communityId, event, walletAddress);

  return (
    <>
      {event.status === "cancelled" ? (
        <CancelledBadge />
      ) : (
        connected && (
          <button
            onClick={handleRsvpToggle}
            disabled={rsvpPending}
            className={`min-h-[44px] px-4 rounded-[6px] text-sm font-medium disabled:opacity-60 ${
              hasRsvped
                ? "border border-gray-600 text-gray-300 hover:bg-gray-800"
                : "bg-accent text-white hover:bg-accent-hover"
            }`}
          >
            {rsvpPending ? "..." : hasRsvped ? "Going ✓" : "RSVP"}
          </button>
        )
      )}
      {actionError && <p className="text-xs text-error mt-2">{actionError}</p>}

      <div className="mt-8 pt-6 border-t border-gray-800">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {rsvps.length === 0 ? "Who's going" : `Who's going (${rsvps.length})`}
        </h2>
        {isLoadingRsvps && <div className="h-4 bg-gray-800 rounded w-32 animate-pulse" />}
        {!isLoadingRsvps && isErrorRsvps && <p className="text-sm text-error">Couldn&apos;t load who&apos;s going.</p>}
        {!isLoadingRsvps && !isErrorRsvps && rsvps.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-600 bg-gray-900 p-6 text-center">
            <p className="text-sm text-gray-400">No one&apos;s RSVP&apos;d yet — be the first.</p>
          </div>
        )}
        {!isLoadingRsvps && !isErrorRsvps && rsvps.length > 0 && (
          <div className="flex flex-col gap-2">
            {rsvps.map((r) => (
              <div
                key={r.walletAddress}
                className="font-mono text-xs text-gray-300 bg-gray-900 border border-gray-700 rounded-[6px] px-3 py-2"
              >
                {truncateAddress(r.walletAddress)}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function EventDetailContent({
  communityId,
  event,
  connected,
  walletAddress,
}: {
  communityId: string;
  event: Event;
  connected: boolean;
  walletAddress?: string;
}) {
  const { label: kindLabel, Icon: KindIcon } = KIND_META[event.kind];

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
      {event.parentEventId && <ParentLink communityId={communityId} parentEventId={event.parentEventId} />}
      <span className="flex items-center gap-1 text-xs text-gray-400 uppercase tracking-wide mb-2">
        <KindIcon className="w-3.5 h-3.5" aria-hidden="true" />
        {kindLabel}
      </span>
      <h1 className="text-2xl font-semibold text-foreground mb-3">{event.title}</h1>
      <div className="flex flex-col gap-1 mb-4 text-sm">
        <span className="font-mono tabular-nums text-foreground">
          {formatTimeRange(event.startAt, event.endAt, event.isAllDay)}
        </span>
        {(event.locationText ?? event.venueId) && (
          <span className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {event.locationText ?? "Venue"}
          </span>
        )}
      </div>
      {event.description && <p className="text-gray-300 leading-relaxed mb-6">{event.description}</p>}

      <RsvpSection communityId={communityId} event={event} connected={connected} walletAddress={walletAddress} />

      <SideEventsList communityId={communityId} event={event} />
    </div>
  );
}

export function EventDetailPage() {
  const { eventId } = useParams();
  const { community, connected, address } = useOutletContext<CommunityOutletContext>();
  const communityId = community.id;

  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["event", communityId, eventId],
    queryFn: () => eventApi.getEvent(communityId, eventId!),
    enabled: !!eventId,
  });

  if (isLoading) return <LoadingSkeleton />;

  // Ineligible viewers and nonexistent events both 404 identically (deliberate — see design doc's
  // Constraints, matches this app's existing tier-restricted-resource convention elsewhere).
  if (error instanceof HttpError && error.status === 404) return <NotFoundState />;
  if (!event) return <ErrorState onRetry={() => void refetch()} />;

  return <EventDetailContent communityId={communityId} event={event} connected={connected} walletAddress={address} />;
}
