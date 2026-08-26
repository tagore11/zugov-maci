import { Hono } from "hono";
import type { z } from "zod";
import * as eventService from "../services/eventService.js";
import { getSession } from "../middleware/session.js";
import { EVENT_KIND } from "../validators/eventSchema.js";

// Events expansion (/office-hours + /plan-eng-review 2026-08-26) — the first cross-community
// events route in this codebase; every existing event route lives under
// communities/:id/events. Public, no auth required, mirrors GET /api/unions' top-level
// discovery-page convention. Lists top-level events only (parentEventId IS NULL) across every
// community — side-events are visible exclusively via their parent's community event list, never
// as their own card here (locked in the design doc's Approach A).
export const globalEventsRouter = new Hono();

globalEventsRouter.get("/", async (c) => {
  const pageStr = c.req.query("page") ?? "1";
  const limitStr = c.req.query("limit") ?? "20";
  const page = Math.max(1, Number(pageStr));
  const limit = Math.min(50, Math.max(1, Number(limitStr)));

  const kindParam = c.req.query("kind");
  const kind = EVENT_KIND.safeParse(kindParam).success ? (kindParam as z.infer<typeof EVENT_KIND>) : undefined;
  const collectionParam = c.req.query("collection");
  const collection = collectionParam === "upcoming" || collectionParam === "past" ? collectionParam : undefined;

  const session = await getSession(c);
  const result = await eventService.listGlobal(page, limit, { kind, collection }, session.address);
  return c.json(result);
});
