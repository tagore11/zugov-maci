import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import * as eventApi from "@/src/services/eventApi";
import type { Event, EventKind } from "@/src/services/eventApi";

const KIND_OPTIONS: { value: EventKind; label: string }[] = [
  { value: "talk", label: "Talk" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

type LocationMode = "venue" | "custom";

function toLocalInputValue(unixSec: number): string {
  const d = new Date(unixSec * 1000);
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

  const { data: venues = [] } = useQuery({
    queryKey: ["venues", communityId],
    queryFn: () => eventApi.listVenues(communityId),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setStartAt(toLocalInputValue(editingEvent.startAt));
      setEndAt(toLocalInputValue(editingEvent.endAt));
    } else {
      setTitle("");
      setDescription("");
      setKind("other");
      setLocationMode("custom");
      setVenueId("");
      setLocationText("");
      setStartAt("");
      setEndAt("");
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

  const hasEndAfterStart = !startAt || !endAt || new Date(endAt).getTime() > new Date(startAt).getTime();
  // Only enforced on create — editing an already-past event (e.g. fixing a typo in a concluded
  // event's title) must stay possible, matching updateEventSchema's own scope on the backend.
  const hasFutureStart = isEdit || !startAt || new Date(startAt).getTime() > Date.now();
  const hasLocation = locationMode === "venue" ? !!venueId : locationText.trim().length > 0;
  const canSubmit =
    title.trim().length > 0 && !!startAt && !!endAt && hasEndAfterStart && hasFutureStart && hasLocation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const startAtSec = Math.floor(new Date(startAt).getTime() / 1000);
      const endAtSec = Math.floor(new Date(endAt).getTime() / 1000);
      if (isEdit && editingEvent) {
        await eventApi.updateEvent(communityId, editingEvent.id, {
          title,
          description: description || undefined,
          venueId: locationMode === "venue" ? venueId : null,
          locationText: locationMode === "custom" ? locationText : null,
          startAt: startAtSec,
          endAt: endAtSec,
          kind,
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
        });
      }
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-start" className="block text-sm font-semibold text-foreground mb-2">
                Starts *
              </label>
              <input
                id="event-start"
                type="datetime-local"
                required
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
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          {!hasEndAfterStart && <p className="text-xs text-error">End time must be after the start time.</p>}
          {!hasFutureStart && <p className="text-xs text-error">Start time must be in the future.</p>}

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
