import { z } from "zod";

// Events expansion Approach B (/plan-eng-review 2026-08-27, D5) — extracted here since it
// was copy-pasted verbatim between routes/events.ts and routes/globalEvents.ts; expanding
// to 17 values (from 5) made that duplication expensive enough to fix. "meeting" is kept
// alongside the newer "meetup" (see schema.ts's events.kind comment) — dropping it would
// break any existing row's kind-based icon lookup with no data-migration benefit.
export const EVENT_KIND = z.enum([
  "talk",
  "panel",
  "workshop",
  "activity",
  "seminar",
  "conference",
  "meetup",
  "networking",
  "training",
  "exhibition",
  "hackathon",
  "demo_day",
  "social",
  "open_mic",
  "wellness",
  "meeting",
  "other",
]);

export type EventKind = z.infer<typeof EVENT_KIND>;
