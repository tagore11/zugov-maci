import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, MoreVertical, Pencil, Ban, Copy, Mic, Wrench, PartyPopper, Users, Calendar } from "lucide-react";
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
// isn't a place to spend color (2026-08-19 /plan-design-review, D2).
const KIND_META: Record<EventKind, { label: string; Icon: typeof Mic }> = {
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

function formatTimeRange(startAt: number, endAt: number): string {
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
}: {
  communityId: string;
  event: Event;
  connected: boolean;
  walletAddress?: string;
  isCommunityAdmin: boolean;
  onEdit: () => void;
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
        <p className="font-medium text-foreground">{event.title}</p>
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

export function EventsSection({ communityId, connected, walletAddress }: EventsSectionProps) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const isCommunityAdmin = useIsCommunityAdmin(communityId, connected);
  const canCreateEvents = useHasTierPermission(communityId, connected, "canCreateEvents");

  const { data, isLoading } = useQuery({
    queryKey: ["events", communityId],
    queryFn: () => eventApi.listEvents(communityId, { limit: 50 }),
  });

  const events = data?.events ?? [];
  const groups: { key: string; header: string; events: Event[] }[] = [];
  for (const event of events) {
    const key = dateGroupKey(event.startAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.key === key) {
      lastGroup.events.push(event);
    } else {
      groups.push({ key, header: formatDateHeader(event.startAt), events: [event] });
    }
  }

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

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-24" />
          <div className="h-12 bg-gray-800/60 rounded" />
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6 text-center">
          <p className="text-sm text-gray-400">No upcoming events yet.</p>
          {canCreateEvents && (
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
            {group.events.map((event) => (
              <EventRow
                key={event.id}
                communityId={communityId}
                event={event}
                connected={connected}
                walletAddress={walletAddress}
                isCommunityAdmin={isCommunityAdmin}
                onEdit={() => setEditingEvent(event)}
              />
            ))}
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
