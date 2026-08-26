import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import * as eventApi from "@/src/services/eventApi";
import type { Event, EventKind } from "@/src/services/eventApi";
import * as membershipApi from "@/src/services/membershipApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";
import { TierRestrictionPicker } from "./TierRestrictionPicker";
import { RepeatFields } from "./RepeatFields";
import { KIND_META } from "./eventDisplay";

// Events expansion Approach B (2026-08-27, D5 design review) — derived from KIND_META
// (EventsSection.tsx) instead of a second hand-maintained list, so there's exactly one
// 17-entry taxonomy on the frontend.
const KIND_OPTIONS: { value: EventKind; label: string }[] = Object.entries(KIND_META).map(([value, meta]) => ({
  value: value as EventKind,
  label: meta.label,
}));

type LocationMode = "venue" | "custom";

function toLocalInputValue(unixSec: number): string {
  const d = new Date(unixSec * 1000);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

// Events expansion Approach B (2026-08-27, D3) — all-day date-range picker. Two native
// <input type="date">, no picker library, matching this app's established native-control
// convention. Dates are parsed/formatted in the viewer's local timezone (same mechanism
// toLocalInputValue already uses for regular datetime-local inputs).
function toDateInputValue(unixSec: number): string {
  const d = new Date(unixSec * 1000);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

function dateInputToStartOfDaySec(dateStr: string): number {
  const d = new Date(`${dateStr}T00:00:00`);
  return Math.floor(d.getTime() / 1000);
}

function dateInputToEndOfDaySec(dateStr: string): number {
  const d = new Date(`${dateStr}T23:59:59`);
  return Math.floor(d.getTime() / 1000);
}

function startOfTodayDateInputValue(): string {
  return toDateInputValue(Math.floor(Date.now() / 1000));
}

// A datetime-local input's year segment has no format constraint on its own — typing a stray
// digit produces something like "24.02.83333" with no feedback beyond "end must be after start"
// (which a huge-but-still-ordered year trivially satisfies). The `max` attribute caps what the
// native picker/typing allows; the matching JS check below covers browsers that don't enforce
// `max` on manual typing and gives an explicit error message (2026-08-23 /investigate). Mirrors
// the backend's own bound in routes/events.ts's createEventSchema/updateEventSchema.
const MAX_EVENT_YEARS_OUT = 5;
function maxEventInputValue(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + MAX_EVENT_YEARS_OUT);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  communityId: string;
  /** Present -> edit mode (pre-filled, PATCH). Absent/null -> create mode (POST). Same modal,
   * same fields, different submit verb (2026-08-19 /plan-design-review, D4). */
  editingEvent?: Event | null;
}

export function CreateEventModal({ isOpen, onClose, onSuccess, communityId, editingEvent }: CreateEventModalProps) {
  const isEdit = !!editingEvent;
  const { signOut } = useSiwe();

  const { data: venues = [] } = useQuery({
    queryKey: ["venues", communityId],
    queryFn: () => eventApi.listVenues(communityId),
    enabled: isOpen,
  });

  // Events expansion (2026-08-26, D2) — parent-event picker. Reuses the same list() response
  // EventsSection already fetches (no new endpoint); a large limit keeps this a single request
  // rather than paginating a community's own event list just to populate a picker.
  const { data: communityEventsData } = useQuery({
    queryKey: ["events", communityId, undefined],
    queryFn: () => eventApi.listEvents(communityId, { limit: 50 }),
    enabled: isOpen && !isEdit,
  });
  // Only the community's OTHER top-level events (excludes self — n/a in create mode since the
  // event doesn't exist yet — and excludes existing side-events, matching the one-level-nesting
  // cap enforced server-side).
  const parentCandidates = (communityEventsData?.events ?? []).filter((e) => e.parentEventId === null);

  // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D5).
  const { data: tiers = [] } = useQuery({
    queryKey: ["tiers", communityId],
    queryFn: () => membershipApi.getTiers(communityId),
    enabled: isOpen,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<EventKind>("other");
  const [locationMode, setLocationMode] = useState<LocationMode>("custom");
  const [venueId, setVenueId] = useState("");
  const [locationText, setLocationText] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  // Events expansion Approach B (2026-08-27, D3) — All-day OFF keeps startAt/endAt (the two
  // datetime-local inputs above) exactly as before. All-day ON swaps to startDate/endDate (two
  // native date inputs) instead — both pairs of state coexist so toggling back and forth doesn't
  // lose what was typed in either mode.
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([]);
  const [parentEventId, setParentEventId] = useState("");
  // Events expansion Approach B (2026-08-27, D2) — "Repeat" surfaced directly in the creation
  // flow, not just post-creation via DuplicateForm. Create-only: absent from edit mode's submit
  // payload (matches the backend's create()-only repeat param).
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatIntervalDays, setRepeatIntervalDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTier = (tierId: string) => {
    setSelectedTierIds((prev) => (prev.includes(tierId) ? prev.filter((id) => id !== tierId) : [...prev, tierId]));
  };

  // Reset/prefill whenever the modal opens (this instance is reused across opens) — matches
  // CreateProposalModal's own reset-on-close convention.
  useEffect(() => {
    if (!isOpen) return;
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description ?? "");
      setKind(editingEvent.kind);
      setLocationMode(editingEvent.venueId ? "venue" : "custom");
      setVenueId(editingEvent.venueId ?? "");
      setLocationText(editingEvent.locationText ?? "");
      setIsAllDay(editingEvent.isAllDay);
      if (editingEvent.isAllDay) {
        setStartDate(toDateInputValue(editingEvent.startAt));
        setEndDate(toDateInputValue(editingEvent.endAt));
      } else {
        setStartAt(toLocalInputValue(editingEvent.startAt));
        setEndAt(toLocalInputValue(editingEvent.endAt));
      }
      // D5 — null round-trips to toggle-off unambiguously; a non-null list round-trips to
      // toggle-on with the right boxes checked.
      setIsRestricted(editingEvent.eligibleTierIds !== null);
      setSelectedTierIds(editingEvent.eligibleTierIds ?? []);
    } else {
      setTitle("");
      setDescription("");
      setKind("other");
      setLocationMode("custom");
      setVenueId("");
      setLocationText("");
      setStartAt("");
      setEndAt("");
      setIsAllDay(false);
      setStartDate("");
      setEndDate("");
      setIsRestricted(false);
      setSelectedTierIds([]);
      setParentEventId("");
      setIsRepeating(false);
      setRepeatCount(1);
      setRepeatIntervalDays(7);
    }
    setError(null);
  }, [isOpen, editingEvent]);

  // Escape-key close + role="dialog"/aria-modal — no existing modal in this app has either
  // (2026-08-19 /plan-design-review, Pass 6; retrofitting the existing modals tracked separately
  // in TODOS.md).
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Events expansion Approach B (2026-08-27, D3) — when All-day is on, startAt/endAt are derived
  // from startDate/endDate (start of Start-date / end of End-date) instead of the datetime-local
  // inputs. hasDateFields/hasEndAfterStart/hasFutureStart all branch on isAllDay so the same
  // validation shape applies to whichever pair of inputs is actually active.
  const hasDateFields = isAllDay ? !!startDate && !!endDate : !!startAt && !!endAt;
  const hasEndAfterStart = isAllDay
    ? !startDate || !endDate || endDate >= startDate
    : !startAt || !endAt || new Date(endAt).getTime() > new Date(startAt).getTime();
  // Only enforced on create — editing an already-past event (e.g. fixing a typo in a concluded
  // event's title) must stay possible, matching updateEventSchema's own scope on the backend.
  // All-day events are exempted from the strict future-instant check (outside-voice fix, D3): a
  // same-day all-day event's start is already in the past the moment it's submitted, so all-day
  // only requires the date to be today or later, not strictly in the future.
  const hasFutureStart = isEdit
    ? true
    : isAllDay
      ? !startDate || startDate >= startOfTodayDateInputValue()
      : !startAt || new Date(startAt).getTime() > Date.now();
  const maxTimestamp = new Date(maxEventInputValue()).getTime();
  const hasSaneStart = isAllDay
    ? !startDate || dateInputToStartOfDaySec(startDate) * 1000 < maxTimestamp
    : !startAt || new Date(startAt).getTime() < maxTimestamp;
  const hasSaneEnd = isAllDay
    ? !endDate || dateInputToEndOfDaySec(endDate) * 1000 < maxTimestamp
    : !endAt || new Date(endAt).getTime() < maxTimestamp;
  const hasLocation = locationMode === "venue" ? !!venueId : locationText.trim().length > 0;
  const hasValidTierSelection = !isRestricted || selectedTierIds.length > 0;
  const canSubmit =
    title.trim().length > 0 &&
    hasDateFields &&
    hasEndAfterStart &&
    hasFutureStart &&
    hasSaneStart &&
    hasSaneEnd &&
    hasLocation &&
    hasValidTierSelection;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const startAtSec = isAllDay
        ? dateInputToStartOfDaySec(startDate)
        : Math.floor(new Date(startAt).getTime() / 1000);
      const endAtSec = isAllDay ? dateInputToEndOfDaySec(endDate) : Math.floor(new Date(endAt).getTime() / 1000);
      const eligibleTierIds = isRestricted ? selectedTierIds : null;
      await withAuthDetect(async () => {
        if (isEdit && editingEvent) {
          await eventApi.updateEvent(communityId, editingEvent.id, {
            title,
            description: description || undefined,
            venueId: locationMode === "venue" ? venueId : null,
            locationText: locationMode === "custom" ? locationText : null,
            startAt: startAtSec,
            endAt: endAtSec,
            kind,
            eligibleTierIds,
            isAllDay,
          });
        } else {
          await eventApi.createEvent(communityId, {
            title,
            description: description || undefined,
            venueId: locationMode === "venue" ? venueId : undefined,
            locationText: locationMode === "custom" ? locationText : undefined,
            startAt: startAtSec,
            endAt: endAtSec,
            kind,
            eligibleTierIds,
            parentEventId: parentEventId || undefined,
            isAllDay,
            repeat: isRepeating ? { count: repeatCount, intervalDays: repeatIntervalDays } : undefined,
          });
        }
      }, signOut);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "create"} event`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900 rounded-t-2xl z-10">
          <h2 id="event-modal-title" className="text-xl font-bold text-foreground">
            {isEdit ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="event-title" className="block text-sm font-semibold text-foreground mb-2">
              Title *
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="event-description" className="block text-sm font-semibold text-foreground mb-2">
              Description
            </label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="event-kind" className="block text-sm font-semibold text-foreground mb-2">
              Kind
            </label>
            <select
              id="event-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as EventKind)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {KIND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsAllDay(checked);
                  if (checked && !endDate) setEndDate(startDate);
                }}
                className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
              />
              All day
            </label>
          </div>

          {isAllDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="event-start-date" className="block text-sm font-semibold text-foreground mb-2">
                  Start date *
                </label>
                <input
                  id="event-start-date"
                  type="date"
                  required
                  min={startOfTodayDateInputValue()}
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartDate(value);
                    if (!endDate || endDate < value) setEndDate(value);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="event-end-date" className="block text-sm font-semibold text-foreground mb-2">
                  End date *
                </label>
                <input
                  id="event-end-date"
                  type="date"
                  required
                  min={startDate || startOfTodayDateInputValue()}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="event-start" className="block text-sm font-semibold text-foreground mb-2">
                  Starts *
                </label>
                <input
                  id="event-start"
                  type="datetime-local"
                  required
                  max={maxEventInputValue()}
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="event-end" className="block text-sm font-semibold text-foreground mb-2">
                  Ends *
                </label>
                <input
                  id="event-end"
                  type="datetime-local"
                  required
                  max={maxEventInputValue()}
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          )}
          {!hasEndAfterStart && (
            <p className="text-xs text-error">
              {isAllDay ? "End date must be on or after the start date." : "End time must be after the start time."}
            </p>
          )}
          {!hasFutureStart && (
            <p className="text-xs text-error">
              {isAllDay ? "Start date can't be before today." : "Start time must be in the future."}
            </p>
          )}
          {(!hasSaneStart || !hasSaneEnd) && (
            <p className="text-xs text-error">Event dates must be within {MAX_EVENT_YEARS_OUT} years from now.</p>
          )}

          {!isEdit && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={isRepeating}
                  onChange={(e) => setIsRepeating(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
                />
                Repeat
              </label>
              {isRepeating && (
                <div className="mt-2 pl-1">
                  <RepeatFields
                    count={repeatCount}
                    onCountChange={setRepeatCount}
                    intervalDays={repeatIntervalDays}
                    onIntervalDaysChange={setRepeatIntervalDays}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <span className="block text-sm font-semibold text-foreground mb-2">Location *</span>
            <div className="flex gap-2 mb-3" role="tablist" aria-label="Location type">
              <button
                type="button"
                role="tab"
                aria-selected={locationMode === "custom"}
                onClick={() => setLocationMode("custom")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  locationMode === "custom"
                    ? "border-accent bg-accent/10 text-accent-hover"
                    : "border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
              >
                Custom location
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={locationMode === "venue"}
                onClick={() => setLocationMode("venue")}
                disabled={venues.length === 0}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border disabled:opacity-40 disabled:cursor-not-allowed ${
                  locationMode === "venue"
                    ? "border-accent bg-accent/10 text-accent-hover"
                    : "border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
                title={venues.length === 0 ? "No saved venues for this community yet" : undefined}
              >
                Existing venue
              </button>
            </div>
            {locationMode === "custom" ? (
              <input
                type="text"
                placeholder="e.g. The Hub — Wellness Space"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Custom location"
              />
            ) : (
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Venue"
              >
                <option value="">Select a venue…</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {!isEdit && parentCandidates.length > 0 && (
            <div>
              <label htmlFor="event-parent" className="block text-sm font-semibold text-foreground mb-2">
                Parent event (optional)
              </label>
              <select
                id="event-parent"
                value={parentEventId}
                onChange={(e) => setParentEventId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">None — this is a top-level event</option>
                {parentCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.title}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                Nest this as a session under a bigger multi-day gathering. Can&apos;t be changed after creation.
              </p>
            </div>
          )}

          <TierRestrictionPicker
            tiers={tiers}
            isRestricted={isRestricted}
            onIsRestrictedChange={setIsRestricted}
            selectedTierIds={selectedTierIds}
            onToggleTier={toggleTier}
          />

          {error && (
            <div className="p-3 bg-error/10 border border-error/40 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-800 text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-60"
            >
              {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
