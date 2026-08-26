import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MapPin,
  MoreVertical,
  Pencil,
  Ban,
  Copy,
  Mic,
  Wrench,
  PartyPopper,
  Users,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import * as eventApi from "@/src/services/eventApi";
import type { Event, EventKind } from "@/src/services/eventApi";
import { useIsCommunityAdmin, useHasTierPermission } from "@/src/hooks/useMembershipPermission";
import { CreateEventModal } from "./CreateEventModal";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

interface EventsSectionProps {
  communityId: string;
  connected: boolean;
  walletAddress?: string;
}

// Monochrome icon + label, not a colored badge — DESIGN.md's single-accent rule means kind
// isn't a place to spend color (2026-08-19 /plan-design-review, D2). Exported for reuse on the
// new global /events page (2026-08-26 design review, "What already exists" — same convention,
// not a second copy).
export const KIND_META: Record<EventKind, { label: string; Icon: typeof Mic }> = {
  talk: { label: "Talk", Icon: Mic },
  workshop: { label: "Workshop", Icon: Wrench },
  social: { label: "Social", Icon: PartyPopper },
  meeting: { label: "Meeting", Icon: Users },
  other: { label: "Other", Icon: Calendar },
};

const DAY_SECONDS = 24 * 60 * 60;

function formatDateHeader(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatTimeRange(startAt: number, endAt: number): string {
  if (endAt - startAt > DAY_SECONDS) {
    return `${formatDateHeader(startAt)} – ${formatDateHeader(endAt)}`;
  }
  return `${formatTime(startAt)} – ${formatTime(endAt)}`;
}

function dateGroupKey(unixSec: number): string {
  return new Date(unixSec * 1000).toDateString();
}

function DuplicateForm({ communityId, eventId, onDone }: { communityId: string; eventId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(1);
  const [intervalDays, setIntervalDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signOut } = useSiwe();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await withAuthDetect(() => eventApi.duplicateEvent(communityId, eventId, { count, intervalDays }), signOut);
      await queryClient.invalidateQueries({ queryKey: ["events", communityId] });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 p-3 border border-gray-700 rounded-lg bg-gray-800/60 space-y-2 text-sm">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-gray-400">
          Repeat
          <input
            type="number"
            min={1}
            max={52}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-14 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-foreground"
            aria-label="Number of additional occurrences"
          />
          times
        </label>
        <label className="flex items-center gap-1.5 text-gray-400">
          every
          <input
            type="number"
            min={1}
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
            className="w-14 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-foreground"
            aria-label="Interval in days"
          />
          days
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-3 py-1.5 bg-accent text-white rounded text-xs font-medium hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create duplicates"}
        </button>
        <button onClick={onDone} className="px-3 py-1.5 text-gray-400 hover:text-foreground text-xs">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

function EventRow({
  communityId,
  event,
  connected,
  walletAddress,
  isCommunityAdmin,
  onEdit,
  sideEvents,
  isExpanded,
  onToggleExpand,
}: {
  communityId: string;
  event: Event;
  connected: boolean;
  walletAddress?: string;
  isCommunityAdmin: boolean;
  onEdit: () => void;
  /** Events expansion (2026-08-26) — client-side grouped from the same flat list() response
   * (Decision 3), never a separate fetch. Present only on top-level rows that have ≥1 side-event. */
  sideEvents?: Event[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [rsvpPending, setRsvpPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { signOut } = useSiwe();

  const { data: rsvps = [] } = useQuery({
    queryKey: ["eventRsvps", event.id],
    queryFn: () => eventApi.listRsvps(communityId, event.id),
  });

  const canManage =
    isCommunityAdmin || (!!walletAddress && event.creatorAddress.toLowerCase() === walletAddress.toLowerCase());
  const hasRsvped = !!walletAddress && rsvps.some((r) => r.walletAddress.toLowerCase() === walletAddress.toLowerCase());

  const { label: kindLabel, Icon: KindIcon } = KIND_META[event.kind];

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["events", communityId] }),
      queryClient.invalidateQueries({ queryKey: ["eventRsvps", event.id] }),
    ]);

  const handleRsvpToggle = async () => {
    setRsvpPending(true);
    setActionError(null);
    try {
      await withAuthDetect(() => {
        return hasRsvped ? eventApi.cancelRsvp(communityId, event.id) : eventApi.rsvp(communityId, event.id);
      }, signOut);
      await invalidate();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update RSVP");
    } finally {
      setRsvpPending(false);
    }
  };

  const handleCancelConfirm = async () => {
    setActionError(null);
    try {
      await withAuthDetect(() => eventApi.cancelEvent(communityId, event.id), signOut);
      await queryClient.invalidateQueries({ queryKey: ["events", communityId] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel event");
    } finally {
      setConfirmingCancel(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-gray-800 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {sideEvents && sideEvents.length > 0 && (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse side-events" : "Expand side-events"}
              className="shrink-0 p-0.5 text-gray-400 hover:text-foreground"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <p className="font-medium text-foreground">{event.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <KindIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {kindLabel}
          </span>
          <span className="font-mono tabular-nums">{formatTimeRange(event.startAt, event.endAt)}</span>
          {(event.locationText ?? event.venueId) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {event.locationText ?? "Venue"}
            </span>
          )}
          <span>{rsvps.length === 1 ? "1 going" : `${rsvps.length} going`}</span>
        </div>
        {actionError && <p className="text-xs text-error mt-1">{actionError}</p>}
        {showDuplicate && (
          <DuplicateForm communityId={communityId} eventId={event.id} onDone={() => setShowDuplicate(false)} />
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {connected &&
          (confirmingCancel ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Cancel this event?</span>
              <button onClick={handleCancelConfirm} className="text-error hover:text-error-hover font-medium">
                Confirm
              </button>
              <button onClick={() => setConfirmingCancel(false)} className="text-gray-400 hover:text-foreground">
                Never mind
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleRsvpToggle}
                disabled={rsvpPending}
                className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] sm:min-h-0 disabled:opacity-60 ${
                  hasRsvped
                    ? "border border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "bg-accent text-white hover:bg-accent-hover"
                }`}
              >
                {rsvpPending ? "..." : hasRsvped ? "Going ✓" : "RSVP"}
              </button>
              {canManage && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu((v) => !v)}
                    className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-gray-400 hover:text-foreground hover:bg-gray-800 rounded-lg"
                    aria-label="Event actions"
                    aria-haspopup="true"
                    aria-expanded={showMenu}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-800"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDuplicate(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-800"
                      >
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setConfirmingCancel(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-gray-800"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel event
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ))}
      </div>
    </div>
  );
}

// Events expansion (2026-08-26, Decision 7) — a data filter (same layout, different query), not
// a switch between distinct content panels, so aria-pressed buttons are the semantically correct
// WAI-ARIA category here, not role="tab". Visual style reuses CommunityLayout.tsx's existing
// underline convention (border-b-2, active = border-accent text-foreground).
// Exported for reuse on the new global /events page — same toggle, same visual convention
// (2026-08-26 design review, "What already exists").
export function CollectionToggle({
  collection,
  onChange,
}: {
  collection: "upcoming" | "past";
  onChange: (collection: "upcoming" | "past") => void;
}) {
  return (
    <div className="flex gap-1 border-b border-gray-700">
      {(["upcoming", "past"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={collection === option}
          onClick={() => onChange(option)}
          className={`min-h-[44px] px-3 text-sm font-medium border-b-2 transition-colors capitalize ${
            collection === option
              ? "border-accent text-foreground"
              : "border-transparent text-gray-400 hover:text-foreground hover:border-gray-700"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function EventsSection({ communityId, connected, walletAddress }: EventsSectionProps) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [collection, setCollection] = useState<"upcoming" | "past">("upcoming");
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(new Set());
  const isCommunityAdmin = useIsCommunityAdmin(communityId, connected);
  const canCreateEvents = useHasTierPermission(communityId, connected, "canCreateEvents");

  // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D4) — walletAddress in the
  // key: visibility is now viewer-dependent, so an account-switch without it could briefly render
  // the previous wallet's filtered list under the new wallet's identity (mirrors Child H's D3 fix
  // on ProposalsList.tsx). invalidateQueries elsewhere in this file still matches by prefix.
  // Events expansion (2026-08-26) — collection in the key too, so toggling tabs doesn't briefly
  // render the other tab's cached data under the new tab's identity.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", communityId, walletAddress, collection],
    queryFn: () => eventApi.listEvents(communityId, { limit: 50, collection }),
  });

  const allEvents = data?.events ?? [];
  // Events expansion (2026-08-26, Decision 3) — the single list() response already contains every
  // community event (top-level + side-events, no parentEventId filter server-side); group by
  // parentEventId client-side rather than firing a second fetch. Top-level events are
  // date-grouped as before; side-events are excluded from those groups and attached to their
  // parent's expand panel instead.
  const topLevelEvents = allEvents.filter((event) => event.parentEventId === null);
  const sideEventsByParent = new Map<string, Event[]>();
  for (const event of allEvents) {
    if (event.parentEventId === null) continue;
    const siblings = sideEventsByParent.get(event.parentEventId) ?? [];
    siblings.push(event);
    sideEventsByParent.set(event.parentEventId, siblings);
  }

  const groups: { key: string; header: string; events: Event[] }[] = [];
  for (const event of topLevelEvents) {
    const key = dateGroupKey(event.startAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.key === key) {
      lastGroup.events.push(event);
    } else {
      groups.push({ key, header: formatDateHeader(event.startAt), events: [event] });
    }
  }

  const toggleExpanded = (eventId: string) => {
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const invalidateAndClose = () => {
    queryClient.invalidateQueries({ queryKey: ["events", communityId] });
    setShowCreateModal(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Events</h2>
        {canCreateEvents && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        )}
      </div>

      <CollectionToggle collection={collection} onChange={setCollection} />

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-24" />
          <div className="h-12 bg-gray-800/60 rounded" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6 text-center">
          <p className="text-sm text-error">Couldn&apos;t load events right now.</p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["events", communityId, walletAddress, collection] })
            }
            className="mt-3 text-sm font-medium text-accent-hover hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && topLevelEvents.length === 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6 text-center">
          <p className="text-sm text-gray-400">
            {collection === "upcoming" ? "No upcoming events yet." : "No past events."}
          </p>
          {collection === "upcoming" && canCreateEvents && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-sm font-medium text-accent-hover hover:underline"
            >
              Plan the first one
            </button>
          )}
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{group.header}</h3>
          <div className="rounded-lg border border-gray-700 bg-gray-900 px-4">
            {group.events.map((event) => {
              const sideEvents = sideEventsByParent.get(event.id);
              const isExpanded = expandedParentIds.has(event.id);
              return (
                // Events expansion (2026-08-26, Decision 1) — scroll-anchor id: the global
                // /events page's cards link here (/community/:id/events#event-<id>) rather than
                // a new per-event detail route.
                <div key={event.id} id={`event-${event.id}`}>
                  <EventRow
                    communityId={communityId}
                    event={event}
                    connected={connected}
                    walletAddress={walletAddress}
                    isCommunityAdmin={isCommunityAdmin}
                    onEdit={() => setEditingEvent(event)}
                    sideEvents={sideEvents}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleExpanded(event.id)}
                  />
                  {isExpanded && sideEvents && (
                    <div className="ml-6 pl-3 border-l border-gray-800">
                      {sideEvents.map((sideEvent) => (
                        <EventRow
                          key={sideEvent.id}
                          communityId={communityId}
                          event={sideEvent}
                          connected={connected}
                          walletAddress={walletAddress}
                          isCommunityAdmin={isCommunityAdmin}
                          onEdit={() => setEditingEvent(sideEvent)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={invalidateAndClose}
        communityId={communityId}
      />
      <CreateEventModal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSuccess={invalidateAndClose}
        communityId={communityId}
        editingEvent={editingEvent}
      />
    </div>
  );
}
