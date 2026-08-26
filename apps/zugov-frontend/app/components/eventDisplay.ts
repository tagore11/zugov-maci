// Events expansion Approach B (2026-08-27) — extracted from EventsSection.tsx to break a
// circular import: CreateEventModal.tsx needs KIND_META (D5, to derive KIND_OPTIONS) but
// EventsSection.tsx already imports CreateEventModal — a module cycle that left KIND_META
// undefined at evaluation time in some import orders (Object.entries(undefined) crash). Shared
// pieces with no dependency on either component now live here; both import from this module
// instead of from each other.
import {
  Mic,
  Mic2,
  Wrench,
  PartyPopper,
  Users,
  Calendar,
  MessagesSquare,
  Activity,
  GraduationCap,
  Presentation,
  Handshake,
  Network,
  BookOpen,
  Image,
  Code,
  Rocket,
  HeartPulse,
} from "lucide-react";
import type { EventKind } from "@/src/services/eventApi";

// Monochrome icon + label, not a colored badge — DESIGN.md's single-accent rule means kind
// isn't a place to spend color (2026-08-19 /plan-design-review, D2). Events expansion Approach B
// (2026-08-27 design review, Decisions 1/2) — widened from 5 to 17 entries; "meeting" kept
// alongside "meetup" (dropping it would crash this lookup for any existing event). Every icon
// distinct at 14px monochrome size, no two confusable (Mic vs Mic2 deliberately differ in
// silhouette — handheld vs. stand mic).
export const KIND_META: Record<EventKind, { label: string; Icon: typeof Mic }> = {
  talk: { label: "Talk", Icon: Mic },
  panel: { label: "Panel", Icon: MessagesSquare },
  workshop: { label: "Workshop", Icon: Wrench },
  activity: { label: "Activity", Icon: Activity },
  seminar: { label: "Seminar", Icon: GraduationCap },
  conference: { label: "Conference", Icon: Presentation },
  meetup: { label: "Meetup", Icon: Handshake },
  networking: { label: "Networking", Icon: Network },
  training: { label: "Training", Icon: BookOpen },
  exhibition: { label: "Exhibition", Icon: Image },
  hackathon: { label: "Hackathon", Icon: Code },
  demo_day: { label: "Demo Day", Icon: Rocket },
  social: { label: "Social", Icon: PartyPopper },
  open_mic: { label: "Open Mic", Icon: Mic2 },
  wellness: { label: "Wellness", Icon: HeartPulse },
  meeting: { label: "Meeting", Icon: Users },
  other: { label: "Other", Icon: Calendar },
};

const DAY_SECONDS = 24 * 60 * 60;

export function formatDateHeader(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// Events expansion Approach B (2026-08-27, D3 outside-voice fix + design review Decision 3) —
// isAllDay checked FIRST: without this, the old duration heuristic alone would render a real
// 25-hour meeting and a true all-day event identically, which is exactly the ambiguity isAllDay
// was added to resolve. isAllDay=false keeps the existing duration-based behavior unchanged (no
// regression to already-shipped multi-day event rendering).
export function formatTimeRange(startAt: number, endAt: number, isAllDay = false): string {
  if (isAllDay) {
    return endAt - startAt <= DAY_SECONDS ? "All day" : `${formatDateHeader(startAt)} – ${formatDateHeader(endAt)}`;
  }
  if (endAt - startAt > DAY_SECONDS) {
    return `${formatDateHeader(startAt)} – ${formatDateHeader(endAt)}`;
  }
  return `${formatTime(startAt)} – ${formatTime(endAt)}`;
}

export function dateGroupKey(unixSec: number): string {
  return new Date(unixSec * 1000).toDateString();
}

export interface DateGroup<T> {
  key: string;
  header: string;
  events: T[];
}

// Events expansion Approach B (2026-08-27, D4/D5/D6) — shared between the top-level date-grouped
// list and the nested-schedule-by-day view inside a parent's expand panel. Assumes `events` is
// already sorted by startAt (true for both call sites in EventsSection.tsx).
export function groupEventsByDate<T extends { startAt: number }>(events: T[]): DateGroup<T>[] {
  const groups: DateGroup<T>[] = [];
  for (const event of events) {
    const key = dateGroupKey(event.startAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.key === key) {
      lastGroup.events.push(event);
    } else {
      groups.push({ key, header: formatDateHeader(event.startAt), events: [event] });
    }
  }
  return groups;
}
