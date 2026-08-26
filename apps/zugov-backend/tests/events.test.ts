import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { eq } from "drizzle-orm";
import { clearCommunities, testDb } from "./helpers/testDb.js";
import * as schema from "../src/db/schema.js";

process.env.CORS_ORIGIN ??= "http://localhost:5173"; // pre-existing bug, see specs/003 research.md

vi.mock("@pcd/zuauth", () => ({
  default: {
    authenticate: vi.fn(),
    ETHBERLIN04: [],
  },
}));

const { app } = await import("../src/app.js");

const CREATOR = privateKeyToAccount(`0x${"11".repeat(32)}`);
const MEMBER = privateKeyToAccount(`0x${"22".repeat(32)}`);
const OUTSIDER = privateKeyToAccount(`0x${"33".repeat(32)}`);
const ADMIN = privateKeyToAccount(`0x${"66".repeat(32)}`);

const MANAGE_TIER = {
  label: "Admin",
  canCreateProposals: true,
  canVote: true,
  canManageMembership: true,
};
const REGULAR_TIER = {
  label: "Regular",
  canCreateProposals: false,
  canVote: true,
  canManageMembership: false,
};
const NO_EVENTS_TIER = {
  label: "Observer",
  canCreateProposals: false,
  canVote: false,
  canManageMembership: false,
  canCreateEvents: false,
};

const DAY = 24 * 60 * 60;
const NOW = Math.floor(Date.now() / 1000);

async function authCookieFor(account: typeof CREATOR): Promise<string> {
  const nonceRes = await app.request("/api/auth/nonce");
  const cookie = nonceRes.headers.get("set-cookie")!.split(";")[0]!;
  const { nonce } = (await nonceRes.json()) as { nonce: string };

  const siweMessage = new SiweMessage({
    domain: "localhost",
    address: account.address,
    statement: "Sign in with Ethereum to ZuGov",
    uri: "http://localhost:5173",
    version: "1",
    chainId: 534351,
    nonce,
  });
  const message = siweMessage.prepareMessage();
  const signature = await account.signMessage({ message });

  const verifyRes = await app.request("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ message, signature }),
  });
  expect(verifyRes.status).toBe(200);
  return verifyRes.headers.get("set-cookie")!.split(";")[0]!;
}

async function registerCommunity(
  cookie: string,
  tiers: Record<string, unknown>[] = [MANAGE_TIER],
  defaultTierLabel = tiers[0]!.label as string,
): Promise<string> {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      displayName: "Events Test Community",
      source: "wizard",
      membershipPolicy: "open",
      tierChangesRequireVote: false,
      tiers,
      defaultTierLabel,
    }),
  });
  const { community } = (await res.json()) as { community: { id: string } };

  // allowJoin defaults to false for newly-created communities (Child C1, /plan-eng-review
  // 2026-08-24) — several of this file's tests join a second wallet (MEMBER) to exercise
  // non-creator permission checks, so this helper opts every community it creates into
  // joinable-by-default via the real settings PATCH, matching how a community owner would
  // actually enable it.
  await app.request(`/api/communities/${community.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ allowJoin: true }),
  });

  return community.id;
}

async function createEvent(
  cookie: string,
  communityId: string,
  overrides: Record<string, unknown> = {},
): Promise<{ res: Response; event?: { id: string; seriesId: string | null; status: string } }> {
  const res = await app.request(`/api/communities/${communityId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      title: "Morning Yoga",
      locationText: "The Hub - Wellness Space",
      startAt: NOW + DAY,
      endAt: NOW + DAY + 3600,
      ...overrides,
    }),
  });
  if (res.status !== 201) return { res };
  const { event } = (await res.json()) as { event: { id: string; seriesId: string | null; status: string } };
  return { res, event };
}

beforeEach(async () => {
  try {
    await clearCommunities();
  } catch {
    // db may not be available in unit test runs without TEST_DATABASE_URL
  }
});

afterAll(async () => {
  try {
    await clearCommunities();
  } catch {}
});

describe("POST /api/communities/:id/events", () => {
  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x", locationText: "y", startAt: NOW, endAt: NOW + 1 }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 for a member whose tier has canCreateEvents: false", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(creatorCookie, [MANAGE_TIER, NO_EVENTS_TIER], "Observer");
    const memberCookie = await authCookieFor(MEMBER);
    await app.request(`/api/communities/${communityId}/join`, { method: "POST", headers: { Cookie: memberCookie } });

    const { res } = await createEvent(memberCookie, communityId);
    expect(res.status).toBe(403);
  });

  it("creates an event with locationText (happy path)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const { res, event } = await createEvent(cookie, communityId);
    expect(res.status).toBe(201);
    expect(event!.status).toBe("active");
  });

  it("creates an event with a venueId (happy path)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const venueRes = await app.request(`/api/communities/${communityId}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: "The Hub" }),
    });
    const { venue } = (await venueRes.json()) as { venue: { id: string } };

    const { res } = await createEvent(cookie, communityId, { locationText: undefined, venueId: venue.id });
    expect(res.status).toBe(201);
  });

  it("returns 422 when both venueId and locationText are provided", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const { res } = await createEvent(cookie, communityId, { venueId: "some-id" });
    expect(res.status).toBe(422);
  });

  it("returns 422 when neither venueId nor locationText is provided", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const { res } = await createEvent(cookie, communityId, { locationText: undefined });
    expect(res.status).toBe(422);
  });

  it("returns 422 when endAt <= startAt", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const { res } = await createEvent(cookie, communityId, { startAt: NOW, endAt: NOW });
    expect(res.status).toBe(422);
  });

  it("returns 422 when startAt is in the past (specs/010 US3, FR-009)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const { res } = await createEvent(cookie, communityId, { startAt: NOW - DAY, endAt: NOW - DAY + 3600 });
    expect(res.status).toBe(422);
  });

  // Reported live (2026-08-23): a datetime-local input's year segment has no format guard, so a
  // typo like "83333" instead of "2033" produced a huge-but-still-ordered, still-future timestamp
  // that sailed past both existing checks with zero feedback beyond an unrelated
  // "end must be after start" message.
  it("returns 422 when startAt is absurdly far in the future (e.g. a mistyped 5-digit year)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const absurdYear = NOW + 100 * 365 * DAY; // ~year 2126 — still "ordered" and "future", just insane

    const { res } = await createEvent(cookie, communityId, { startAt: absurdYear, endAt: absurdYear + 3600 });
    expect(res.status).toBe(422);
  });

  it("accepts a startAt within the sane future bound", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const oneYearOut = NOW + 365 * DAY;

    const { res } = await createEvent(cookie, communityId, { startAt: oneYearOut, endAt: oneYearOut + 3600 });
    expect(res.status).toBe(201);
  });

  it("returns 422 when venueId references a venue from a different community", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const otherCommunityId = await registerCommunity(cookie);
    const venueRes = await app.request(`/api/communities/${otherCommunityId}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: "Other Community's Venue" }),
    });
    const { venue } = (await venueRes.json()) as { venue: { id: string } };

    const { res } = await createEvent(cookie, communityId, { locationText: undefined, venueId: venue.id });
    expect(res.status).toBe(422);
  });
});

// Events expansion (/office-hours + /plan-eng-review 2026-08-26) — side-events, a self-
// referential parentEventId, distinct from seriesId. See globalEvents.test.ts for the new
// cross-community feed's own coverage.
describe("POST /api/communities/:id/events — parentEventId (side-events)", () => {
  it("creates a side-event with a valid parentEventId in the same community", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event: parent } = await createEvent(cookie, communityId, { title: "Multi-day Gathering" });

    const { res, event: child } = await createEvent(cookie, communityId, {
      title: "Morning Session",
      parentEventId: parent!.id,
    });
    expect(res.status).toBe(201);
    expect((child as unknown as { parentEventId: string | null }).parentEventId).toBe(parent!.id);
  });

  it("returns 422 when parentEventId references an event in a DIFFERENT community", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const otherCommunityId = await registerCommunity(cookie);
    const { event: parent } = await createEvent(cookie, otherCommunityId, { title: "Other Community's Event" });

    const { res } = await createEvent(cookie, communityId, { title: "Side Event", parentEventId: parent!.id });
    expect(res.status).toBe(422);
  });

  it("returns 422 when parentEventId points at an event that already has a parentEventId (no grandchildren)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });
    const { event: child } = await createEvent(cookie, communityId, { title: "Child", parentEventId: parent!.id });

    const { res } = await createEvent(cookie, communityId, { title: "Grandchild", parentEventId: child!.id });
    expect(res.status).toBe(422);
  });

  it("inherits the parent's current eligibleTierIds as a snapshot when omitted on the side-event", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie, [MANAGE_TIER, REGULAR_TIER], "Regular");
    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;
    const { event: parent } = await createEvent(cookie, communityId, {
      title: "Restricted Parent",
      eligibleTierIds: [adminTierId],
    });

    const { res, event: child } = await createEvent(cookie, communityId, {
      title: "Inheriting Side Event",
      parentEventId: parent!.id,
    });
    expect(res.status).toBe(201);
    expect((child as unknown as { eligibleTierIds: string[] | null }).eligibleTierIds).toEqual([adminTierId]);
  });

  it("does NOT override an explicitly-provided eligibleTierIds on the side-event with the parent's value", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie, [MANAGE_TIER, REGULAR_TIER], "Regular");
    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;
    const { event: parent } = await createEvent(cookie, communityId, {
      title: "Restricted Parent",
      eligibleTierIds: [adminTierId],
    });

    const { res, event: child } = await createEvent(cookie, communityId, {
      title: "Explicitly Unrestricted Side Event",
      parentEventId: parent!.id,
      eligibleTierIds: null,
    });
    expect(res.status).toBe(201);
    expect((child as unknown as { eligibleTierIds: string[] | null }).eligibleTierIds).toBeNull();
  });
});

// Events expansion Approach B (/plan-eng-review 2026-08-27) — "Repeat" at creation time, an
// atomic new path inside create(), deliberately not a reuse of duplicate().
describe("POST /api/communities/:id/events — repeat at creation", () => {
  it("repeat creates count+1 total rows sharing one seriesId", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Morning Yoga",
        locationText: "The Hub",
        startAt: NOW + DAY,
        endAt: NOW + DAY + 3600,
        repeat: { count: 3, intervalDays: 1 },
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      event: { id: string; seriesId: string };
      repeatedEvents: { id: string; seriesId: string }[];
    };
    expect(body.repeatedEvents.length).toBe(3);
    const allIds = new Set([body.event.seriesId, ...body.repeatedEvents.map((e) => e.seriesId)]);
    expect(allIds.size).toBe(1);
    expect(body.event.seriesId).not.toBeNull();
  });

  it("repeat on a side-event carries the SAME parentEventId onto every repeat", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Side Session",
        locationText: "Room A",
        startAt: NOW + DAY,
        endAt: NOW + DAY + 3600,
        parentEventId: parent!.id,
        repeat: { count: 2, intervalDays: 1 },
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      event: { parentEventId: string | null };
      repeatedEvents: { parentEventId: string | null }[];
    };
    expect(body.event.parentEventId).toBe(parent!.id);
    expect(body.repeatedEvents.every((e) => e.parentEventId === parent!.id)).toBe(true);
  });

  it("repeat on a top-level event gives every repeat parentEventId: null", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Top Level",
        locationText: "Main Hall",
        startAt: NOW + DAY,
        endAt: NOW + DAY + 3600,
        repeat: { count: 2, intervalDays: 1 },
      }),
    });
    const body = (await res.json()) as { repeatedEvents: { parentEventId: string | null }[] };
    expect(body.repeatedEvents.every((e) => e.parentEventId === null)).toBe(true);
  });

  it("repeat count above the cap is rejected", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Too Many",
        locationText: "Main Hall",
        startAt: NOW + DAY,
        endAt: NOW + DAY + 3600,
        repeat: { count: 53, intervalDays: 1 },
      }),
    });
    expect(res.status).toBe(422);
  });

  it("repeat on a side-event: each repeat inherits the parent's eligibleTierIds snapshot", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie, [MANAGE_TIER, REGULAR_TIER], "Regular");
    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;
    const { event: parent } = await createEvent(cookie, communityId, {
      title: "Restricted Parent",
      eligibleTierIds: [adminTierId],
    });

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Side Session",
        locationText: "Room A",
        startAt: NOW + DAY,
        endAt: NOW + DAY + 3600,
        parentEventId: parent!.id,
        repeat: { count: 2, intervalDays: 1 },
      }),
    });
    const body = (await res.json()) as {
      event: { eligibleTierIds: string[] | null };
      repeatedEvents: { eligibleTierIds: string[] | null }[];
    };
    expect(body.event.eligibleTierIds).toEqual([adminTierId]);
    expect(body.repeatedEvents.every((e) => JSON.stringify(e.eligibleTierIds) === JSON.stringify([adminTierId]))).toBe(
      true,
    );
  });

  it("create() without repeat is unaffected — single event, empty repeatedEvents", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Morning Yoga",
        locationText: "The Hub",
        startAt: NOW + DAY,
        endAt: NOW + DAY + 3600,
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { event: { id: string }; repeatedEvents: unknown[] };
    expect(body.repeatedEvents).toEqual([]);
  });
});

// Events expansion Approach B (2026-08-27, D2 outside-voice fix) — mixed-series guard.
describe("POST /api/communities/:id/events/:eventId/duplicate — mixed-series guard", () => {
  it("rejects extending a series that already has a parented member", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });

    const createRes = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Side Session",
        locationText: "Room A",
        startAt: NOW + DAY,
        endAt: NOW + DAY + 3600,
        parentEventId: parent!.id,
        repeat: { count: 1, intervalDays: 1 },
      }),
    });
    const { event: sideEvent } = (await createRes.json()) as { event: { id: string } };

    const dupRes = await app.request(`/api/communities/${communityId}/events/${sideEvent.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ count: 1, intervalDays: 1 }),
    });
    expect(dupRes.status).toBe(409);
  });

  it("an all-unparented series can still be extended via duplicate() as before", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId, { title: "Plain Event" });

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ count: 1, intervalDays: 1 }),
    });
    expect(res.status).toBe(201);
  });
});

// Events expansion Approach B (2026-08-27, D3 outside-voice fix).
describe("POST /api/communities/:id/events — isAllDay validation", () => {
  it("a same-day all-day event (startAt = start of today) is accepted, not rejected as past", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodaySec = Math.floor(startOfToday.getTime() / 1000);
    const endOfTodaySec = startOfTodaySec + 23 * 3600 + 59 * 60 + 59;

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Rest Day",
        locationText: "Anywhere",
        startAt: startOfTodaySec,
        endAt: endOfTodaySec,
        isAllDay: true,
      }),
    });
    expect(res.status).toBe(201);
  });

  it("a genuinely past all-day event (before today) is still rejected", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdaySec = Math.floor(yesterday.getTime() / 1000);

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Already Past",
        locationText: "Anywhere",
        startAt: yesterdaySec,
        endAt: yesterdaySec + 3600,
        isAllDay: true,
      }),
    });
    expect(res.status).toBe(422);
  });

  it("isAllDay=false keeps the existing strict future-start check unchanged", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodaySec = Math.floor(startOfToday.getTime() / 1000);

    const res = await app.request(`/api/communities/${communityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Not All Day",
        locationText: "Anywhere",
        startAt: startOfTodaySec,
        endAt: startOfTodaySec + 3600,
        isAllDay: false,
      }),
    });
    expect(res.status).toBe(422);
  });
});

describe("GET /api/communities/:id/events", () => {
  it("does not require authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const res = await app.request(`/api/communities/${communityId}/events`);
    expect(res.status).toBe(200);
  });

  it("excludes cancelled events by default", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });

    const res = await app.request(`/api/communities/${communityId}/events`);
    const { events } = (await res.json()) as { events: { id: string }[] };
    expect(events.find((e) => e.id === event!.id)).toBeUndefined();
  });

  it("respects the kind filter", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    await createEvent(cookie, communityId, { kind: "workshop" });
    await createEvent(cookie, communityId, { kind: "social" });

    const res = await app.request(`/api/communities/${communityId}/events?kind=workshop`);
    const { events } = (await res.json()) as { events: { kind: string }[] };
    expect(events.every((e) => e.kind === "workshop")).toBe(true);
    expect(events.length).toBe(1);
  });

  it("respects the date-range filter", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event: nearEvent } = await createEvent(cookie, communityId, {
      startAt: NOW + DAY,
      endAt: NOW + DAY + 3600,
    });
    await createEvent(cookie, communityId, { startAt: NOW + 30 * DAY, endAt: NOW + 30 * DAY + 3600 });

    const res = await app.request(`/api/communities/${communityId}/events?startAt=${NOW}&endAt=${NOW + 2 * DAY}`);
    const { events } = (await res.json()) as { events: { id: string }[] };
    expect(events.map((e) => e.id)).toEqual([nearEvent!.id]);
  });

  // Events expansion (2026-08-26, T6) — upcoming = endAt >= now, past = endAt < now.
  describe("collection=upcoming|past filter", () => {
    it("an in-progress event (startAt < now < endAt) stays in upcoming, not past", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      // In-progress: started an hour ago (in the DB directly — createEventSchema rejects a past
      // startAt at creation time), ends an hour from now.
      const { event: future } = await createEvent(cookie, communityId, { startAt: NOW + DAY, endAt: NOW + DAY + 3600 });
      await testDb
        .update(schema.events)
        .set({ startAt: NOW - 3600, endAt: NOW + 3600 })
        .where(eq(schema.events.id, future!.id));

      const upcomingRes = await app.request(`/api/communities/${communityId}/events?collection=upcoming`);
      const { events: upcoming } = (await upcomingRes.json()) as { events: { id: string }[] };
      expect(upcoming.map((e) => e.id)).toContain(future!.id);

      const pastRes = await app.request(`/api/communities/${communityId}/events?collection=past`);
      const { events: past } = (await pastRes.json()) as { events: { id: string }[] };
      expect(past.map((e) => e.id)).not.toContain(future!.id);
    });

    it("a concluded event (endAt < now) is in past, not upcoming", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      const { event } = await createEvent(cookie, communityId, { startAt: NOW + DAY, endAt: NOW + DAY + 3600 });
      await testDb
        .update(schema.events)
        .set({ startAt: NOW - 2 * DAY, endAt: NOW - DAY })
        .where(eq(schema.events.id, event!.id));

      const pastRes = await app.request(`/api/communities/${communityId}/events?collection=past`);
      const { events: past } = (await pastRes.json()) as { events: { id: string }[] };
      expect(past.map((e) => e.id)).toContain(event!.id);

      const upcomingRes = await app.request(`/api/communities/${communityId}/events?collection=upcoming`);
      const { events: upcoming } = (await upcomingRes.json()) as { events: { id: string }[] };
      expect(upcoming.map((e) => e.id)).not.toContain(event!.id);
    });
  });
});

describe("PATCH /api/communities/:id/events/:eventId", () => {
  it("allows the creator to edit", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ title: "Updated Title" }),
    });
    expect(res.status).toBe(200);
    const { event: updated } = (await res.json()) as { event: { title: string } };
    expect(updated.title).toBe("Updated Title");
  });

  it("allows a canManageMembership admin (not the creator) to edit", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(creatorCookie, [MANAGE_TIER, REGULAR_TIER], "Regular");
    const memberCookie = await authCookieFor(MEMBER);
    await app.request(`/api/communities/${communityId}/join`, { method: "POST", headers: { Cookie: memberCookie } });
    const { event } = await createEvent(memberCookie, communityId);

    // Creator has the Admin/canManageMembership tier via createTiersForCommunity's auto-assign.
    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ title: "Admin Override Edit" }),
    });
    expect(res.status).toBe(200);
  });

  it("returns 403 for a wallet that is neither the creator nor an admin", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(creatorCookie);
    const { event } = await createEvent(creatorCookie, communityId);
    const outsiderCookie = await authCookieFor(OUTSIDER);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: outsiderCookie },
      body: JSON.stringify({ title: "Should Fail" }),
    });
    expect(res.status).toBe(403);
  });

  it("allows editing a now-past event's title (regression: updateEventSchema has no startAt-in-future check)", async () => {
    // specs/010 US3: createEventSchema rejects a past startAt, but updateEventSchema deliberately
    // does not — the edit modal always resends the event's existing startAt on every PATCH, so
    // enforcing it here would break legitimate edits to events that have since concluded.
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId, { startAt: NOW + 60, endAt: NOW + 3660 });

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      // A past startAt in the patch body — same shape the edit modal sends once real time has
      // passed the event's original (once-future) start date.
      body: JSON.stringify({ title: "Retitled After the Fact", startAt: NOW - DAY, endAt: NOW - DAY + 3600 }),
    });
    expect(res.status).toBe(200);
  });

  it("returns 422 when editing startAt to an absurdly far future date", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    const absurdYear = NOW + 100 * 365 * DAY;

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ startAt: absurdYear, endAt: absurdYear + 3600 }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 409 when editing a cancelled event", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ title: "Should Fail" }),
    });
    expect(res.status).toBe(409);
  });

  // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, D1) — coverage gap closed
  // during /ship's coverage audit: PATCH can restrict or unrestrict eligibleTierIds, not just
  // covered indirectly through create().
  it("can restrict an unrestricted event's eligibleTierIds via PATCH", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie, [MANAGE_TIER, REGULAR_TIER], "Regular");
    const { event } = await createEvent(cookie, communityId);
    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ eligibleTierIds: [adminTierId] }),
    });
    expect(res.status).toBe(200);
    const { event: updated } = (await res.json()) as { event: { eligibleTierIds: string[] | null } };
    expect(updated.eligibleTierIds).toEqual([adminTierId]);
  });

  it('can unrestrict a restricted event\'s eligibleTierIds via PATCH (explicit null, not the string "null")', async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie, [MANAGE_TIER, REGULAR_TIER], "Regular");
    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;
    const { event } = await createEvent(cookie, communityId, { eligibleTierIds: [adminTierId] });

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ eligibleTierIds: null }),
    });
    expect(res.status).toBe(200);
    const { event: updated } = (await res.json()) as { event: { eligibleTierIds: string[] | null } };
    expect(updated.eligibleTierIds).toBeNull();

    // Prove it's a real, unrestricted-to-everyone visibility change, not just a stored field —
    // an anonymous caller must now see it in the list.
    const listRes = await app.request(`/api/communities/${communityId}/events`);
    const { events } = (await listRes.json()) as { events: { id: string }[] };
    expect(events.map((e) => e.id)).toContain(event!.id);
  });

  it("returns 422 when eligibleTierIds is an empty array (min(1) — an empty restriction is nonsensical)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ eligibleTierIds: [] }),
    });
    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/communities/:id/events/:eventId (cancel)", () => {
  it("soft-cancels the event", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const { event: cancelled } = (await res.json()) as { event: { status: string } };
    expect(cancelled.status).toBe("cancelled");
  });

  it("returns 409 on a second cancel attempt", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(409);
  });

  // Events expansion (2026-08-26, D4/D5) — cancelling a parent cascades to its side-events.
  describe("cascade to side-events", () => {
    it("cancelling a parent cancels all its side-events, and the response lists them", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });
      const { event: sideA } = await createEvent(cookie, communityId, { title: "Side A", parentEventId: parent!.id });
      const { event: sideB } = await createEvent(cookie, communityId, { title: "Side B", parentEventId: parent!.id });

      const res = await app.request(`/api/communities/${communityId}/events/${parent!.id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        event: { id: string; status: string };
        cascadedSideEvents: { id: string; status: string }[];
      };
      expect(body.event.id).toBe(parent!.id);
      expect(body.event.status).toBe("cancelled");
      const cascadedIds = body.cascadedSideEvents.map((e) => e.id);
      expect(cascadedIds).toContain(sideA!.id);
      expect(cascadedIds).toContain(sideB!.id);
      expect(body.cascadedSideEvents.every((e) => e.status === "cancelled")).toBe(true);
    });

    it("cancelling a side-event does NOT cancel its parent", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });
      const { event: side } = await createEvent(cookie, communityId, { title: "Side", parentEventId: parent!.id });

      const res = await app.request(`/api/communities/${communityId}/events/${side!.id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { event: { id: string }; cascadedSideEvents: unknown[] };
      expect(body.event.id).toBe(side!.id);
      expect(body.cascadedSideEvents).toEqual([]);

      const [parentRow] = await testDb.select().from(schema.events).where(eq(schema.events.id, parent!.id));
      expect(parentRow!.status).toBe("active");
    });

    it("cancel() with no side-events still returns an empty cascadedSideEvents array, not undefined", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      const { event } = await createEvent(cookie, communityId);

      const res = await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
      });
      const body = (await res.json()) as { cascadedSideEvents: unknown[] };
      expect(body.cascadedSideEvents).toEqual([]);
    });

    it("D4: an already-cancelled side-event's cancelledAt is not overwritten when its parent is later cancelled", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });
      const { event: side } = await createEvent(cookie, communityId, { title: "Side", parentEventId: parent!.id });

      const firstCancelRes = await app.request(`/api/communities/${communityId}/events/${side!.id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
      });
      const { event: firstCancelled } = (await firstCancelRes.json()) as { event: { cancelledAt: number } };

      await app.request(`/api/communities/${communityId}/events/${parent!.id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
      });

      const [row] = await testDb.select().from(schema.events).where(eq(schema.events.id, side!.id));
      expect(row!.cancelledAt).toBe(firstCancelled.cancelledAt);
    });
  });
});

describe("POST /api/communities/:id/events/:eventId/duplicate", () => {
  it("creates count additional events sharing one seriesId, atomically", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ count: 13, intervalDays: 1 }),
    });
    expect(res.status).toBe(201);
    const { events: created } = (await res.json()) as { events: { seriesId: string }[] };
    expect(created.length).toBe(13);
    expect(new Set(created.map((e) => e.seriesId)).size).toBe(1);

    const listRes = await app.request(`/api/communities/${communityId}/events?limit=50`);
    const { events: all } = (await listRes.json()) as { events: { seriesId: string | null }[] };
    // 1 original + 13 duplicates = 14 events in the series.
    expect(all.filter((e) => e.seriesId === created[0]!.seriesId).length).toBe(14);
  });

  // formalize-communities epic, Child I (/plan-eng-review 2026-08-25, outside-voice finding) —
  // coverage gap closed during /ship's coverage audit: duplicate() copying source.eligibleTierIds
  // was a specifically-called-out fix with zero prior test asserting it.
  it("carries eligibleTierIds to every duplicated occurrence", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie, [MANAGE_TIER, REGULAR_TIER], "Regular");
    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;
    const { event } = await createEvent(cookie, communityId, { eligibleTierIds: [adminTierId] });

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ count: 3, intervalDays: 1 }),
    });
    expect(res.status).toBe(201);
    const { events: created } = (await res.json()) as { events: { eligibleTierIds: string[] | null }[] };
    for (const duplicate of created) {
      expect(duplicate.eligibleTierIds).toEqual([adminTierId]);
    }
  });

  it("returns 422 for a count above the cap", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ count: 53, intervalDays: 1 }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 403 for a non-creator, non-admin wallet", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    const outsiderCookie = await authCookieFor(OUTSIDER);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: outsiderCookie },
      body: JSON.stringify({ count: 2, intervalDays: 1 }),
    });
    expect(res.status).toBe(403);
  });

  // Events expansion (2026-08-26) — duplicate() explicitly does not carry parentEventId in
  // either direction.
  describe("parentEventId non-interaction", () => {
    it("duplicating a side-event produces a standalone clone with parentEventId: null", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });
      const { event: side } = await createEvent(cookie, communityId, { title: "Side", parentEventId: parent!.id });

      const res = await app.request(`/api/communities/${communityId}/events/${side!.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ count: 1, intervalDays: 1 }),
      });
      expect(res.status).toBe(201);
      const { events: created } = (await res.json()) as { events: { parentEventId: string | null }[] };
      expect(created[0]!.parentEventId).toBeNull();
    });

    it("duplicating a parent with side-events does NOT clone its side-events", async () => {
      const cookie = await authCookieFor(CREATOR);
      const communityId = await registerCommunity(cookie);
      const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });
      await createEvent(cookie, communityId, { title: "Side", parentEventId: parent!.id });

      const res = await app.request(`/api/communities/${communityId}/events/${parent!.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ count: 1, intervalDays: 1 }),
      });
      expect(res.status).toBe(201);

      const listRes = await app.request(`/api/communities/${communityId}/events?limit=50`);
      const { events: all } = (await listRes.json()) as { events: { title: string }[] };
      // 1 original parent + 1 original side-event + 1 duplicate of the parent = 3, NOT 4.
      expect(all.length).toBe(3);
      expect(all.filter((e) => e.title === "Side").length).toBe(1);
    });
  });
});

describe("DELETE /api/communities/:id/events/series/:seriesId", () => {
  it("cancels every event in the series in one call", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    const dupRes = await app.request(`/api/communities/${communityId}/events/${event!.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ count: 3, intervalDays: 1 }),
    });
    const { events: created } = (await dupRes.json()) as { events: { seriesId: string }[] };
    const seriesId = created[0]!.seriesId;

    const res = await app.request(`/api/communities/${communityId}/events/series/${seriesId}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const { events: cancelled } = (await res.json()) as { events: { status: string }[] };
    expect(cancelled.length).toBe(4); // 1 original + 3 duplicates
    expect(cancelled.every((e) => e.status === "cancelled")).toBe(true);
  });

  it("returns 404 for a nonexistent series", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/events/series/nonexistent`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(404);
  });

  // Events expansion (2026-08-26) — duplicate() stamps seriesId onto the SOURCE row too, so a
  // parent event with side-events can be swept into this bulk path even though it wasn't
  // originally "the series." The cascade must extend here too, not just single-event cancel().
  it("cancelling a series cascades to side-events of any series member", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event: parent } = await createEvent(cookie, communityId, { title: "Parent" });
    const { event: side } = await createEvent(cookie, communityId, { title: "Side", parentEventId: parent!.id });
    const dupRes = await app.request(`/api/communities/${communityId}/events/${parent!.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ count: 1, intervalDays: 1 }),
    });
    const { events: created } = (await dupRes.json()) as { events: { seriesId: string }[] };
    const seriesId = created[0]!.seriesId;

    const res = await app.request(`/api/communities/${communityId}/events/series/${seriesId}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const { events: cancelled } = (await res.json()) as { events: { id: string; status: string }[] };
    const cancelledIds = cancelled.map((e) => e.id);
    expect(cancelledIds).toContain(parent!.id);
    expect(cancelledIds).toContain(side!.id);
    expect(cancelled.every((e) => e.status === "cancelled")).toBe(true);
  });
});

describe("RSVP (POST/DELETE/GET /api/communities/:id/events/:eventId/rsvp)", () => {
  it("allows any signed-in wallet to RSVP, even a non-member", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(creatorCookie);
    const { event } = await createEvent(creatorCookie, communityId);
    const outsiderCookie = await authCookieFor(OUTSIDER);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`, {
      method: "POST",
      headers: { Cookie: outsiderCookie },
    });
    expect(res.status).toBe(201);

    const listRes = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`);
    const { rsvps } = (await listRes.json()) as { rsvps: { walletAddress: string }[] };
    expect(rsvps.map((r) => r.walletAddress.toLowerCase())).toContain(OUTSIDER.address.toLowerCase());
  });

  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`, { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("returns 409 when RSVPing to a cancelled event", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    await app.request(`/api/communities/${communityId}/events/${event!.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    const outsiderCookie = await authCookieFor(OUTSIDER);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`, {
      method: "POST",
      headers: { Cookie: outsiderCookie },
    });
    expect(res.status).toBe(409);
  });

  it("cancel-then-re-RSVP flips the same row back to active (mirrors unionMemberships)", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(creatorCookie);
    const { event } = await createEvent(creatorCookie, communityId);
    const outsiderCookie = await authCookieFor(OUTSIDER);

    await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`, {
      method: "POST",
      headers: { Cookie: outsiderCookie },
    });
    await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`, {
      method: "DELETE",
      headers: { Cookie: outsiderCookie },
    });
    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`, {
      method: "POST",
      headers: { Cookie: outsiderCookie },
    });
    expect(res.status).toBe(201);

    const listRes = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`);
    const { rsvps } = (await listRes.json()) as { rsvps: { walletAddress: string }[] };
    // Exactly one row for this wallet — re-RSVP flips the existing row, doesn't duplicate it.
    expect(rsvps.filter((r) => r.walletAddress.toLowerCase() === OUTSIDER.address.toLowerCase()).length).toBe(1);
  });

  it("returns 404 cancelling an RSVP that doesn't exist", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);
    const outsiderCookie = await authCookieFor(OUTSIDER);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`, {
      method: "DELETE",
      headers: { Cookie: outsiderCookie },
    });
    expect(res.status).toBe(404);
  });

  it("GET rsvps does not require authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    const { event } = await createEvent(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/events/${event!.id}/rsvp`);
    expect(res.status).toBe(200);
  });
});

// formalize-communities epic, Child I (/plan-eng-review 2026-08-25) — mirrors proposals.test.ts's
// "GET /api/communities/:id/proposals — visibility (Child H)" describe block, but events' canView
// also bypasses for admins (D2), which proposals' doesn't — tested separately below.
describe("GET /api/communities/:id/events — visibility (Child I)", () => {
  const CREATOR_TIER = {
    label: "Creator",
    canCreateProposals: true,
    canVote: true,
    canCreateEvents: true,
    canManageMembership: false,
  };
  const ADMIN_TIER = {
    label: "Admin",
    canCreateProposals: true,
    canVote: true,
    canCreateEvents: true,
    canManageMembership: true,
  };
  const MEMBER_TIER = {
    label: "Member",
    canCreateProposals: false,
    canVote: true,
    canCreateEvents: true,
    canManageMembership: false,
  };

  async function registerCommunityWithTiers(
    cookie: string,
  ): Promise<{ communityId: string; tierIds: Record<string, string> }> {
    const communityId = await registerCommunity(cookie, [CREATOR_TIER, ADMIN_TIER, MEMBER_TIER], "Creator");
    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    return { communityId, tierIds: Object.fromEntries(tiers.map((t) => [t.label, t.id])) };
  }

  async function setupEvents(creatorCookie: string) {
    const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
    const { event: unrestricted } = await createEvent(creatorCookie, communityId, { title: "Unrestricted event" });
    const { event: restricted } = await createEvent(creatorCookie, communityId, {
      title: "Restricted event",
      eligibleTierIds: [tierIds["Member"]],
    });
    return { communityId, tierIds, unrestrictedId: unrestricted!.id, restrictedId: restricted!.id };
  }

  it("an anonymous caller (no session at all) sees only unrestricted events", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, unrestrictedId, restrictedId } = await setupEvents(creatorCookie);

    const res = await app.request(`/api/communities/${communityId}/events`);
    expect(res.status).toBe(200);
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).not.toContain(restrictedId);
  });

  it("a signed-in non-member sees the same unrestricted-only set", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, unrestrictedId, restrictedId } = await setupEvents(creatorCookie);
    const outsiderCookie = await authCookieFor(OUTSIDER);

    const res = await app.request(`/api/communities/${communityId}/events`, { headers: { Cookie: outsiderCookie } });
    expect(res.status).toBe(200);
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).not.toContain(restrictedId);
  });

  it("a member whose tier is eligible sees the restricted event too", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds, unrestrictedId, restrictedId } = await setupEvents(creatorCookie);
    const memberCookie = await authCookieFor(MEMBER);
    // Enroll on the "Member" tier directly — the public /join flow always lands new members on
    // the community's default tier ("Creator" here), so there's no API surface to pick "Member"
    // specifically (same pattern proposals.test.ts's Child H describe block uses).
    await testDb.insert(schema.memberships).values({
      walletAddress: MEMBER.address,
      communityId,
      tierId: tierIds["Member"]!,
      joinedAt: Math.floor(Date.now() / 1000),
    });

    const res = await app.request(`/api/communities/${communityId}/events`, { headers: { Cookie: memberCookie } });
    expect(res.status).toBe(200);
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).toContain(restrictedId);
  });

  it("a member whose tier is NOT eligible is excluded from the restricted event", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, unrestrictedId, restrictedId } = await setupEvents(creatorCookie);
    const outsiderCookie = await authCookieFor(OUTSIDER);
    await app.request(`/api/communities/${communityId}/join`, { method: "POST", headers: { Cookie: outsiderCookie } });

    // /join lands OUTSIDER on the default "Creator" tier, which is not in the restricted event's
    // eligibleTierIds (["Member"]) — so this member should NOT see it.
    const res = await app.request(`/api/communities/${communityId}/events`, { headers: { Cookie: outsiderCookie } });
    expect(res.status).toBe(200);
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).not.toContain(restrictedId);
  });

  it("the creator always sees both, including an event restricted away from their own tier", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, unrestrictedId, restrictedId } = await setupEvents(creatorCookie);

    const res = await app.request(`/api/communities/${communityId}/events`, { headers: { Cookie: creatorCookie } });
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).toContain(restrictedId);
  });

  it("a community admin (canManageMembership, not the creator) sees both too (D2)", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds, unrestrictedId, restrictedId } = await setupEvents(creatorCookie);
    const adminCookie = await authCookieFor(ADMIN);
    await testDb.insert(schema.memberships).values({
      walletAddress: ADMIN.address,
      communityId,
      tierId: tierIds["Admin"]!,
      joinedAt: Math.floor(Date.now() / 1000),
    });

    const res = await app.request(`/api/communities/${communityId}/events`, { headers: { Cookie: adminCookie } });
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).toContain(restrictedId);
  });

  // Single-event access must match the list's gating exactly — both call canView() (getForViewer).
  describe("GET /api/communities/:id/events/:eventId — matches list gating", () => {
    it("anonymous caller can fetch an unrestricted event directly by id", async () => {
      const creatorCookie = await authCookieFor(CREATOR);
      const { communityId, unrestrictedId } = await setupEvents(creatorCookie);

      const res = await app.request(`/api/communities/${communityId}/events/${unrestrictedId}`);
      expect(res.status).toBe(200);
    });

    it("anonymous caller gets 404 (not a content leak) fetching a restricted event directly by id", async () => {
      const creatorCookie = await authCookieFor(CREATOR);
      const { communityId, restrictedId } = await setupEvents(creatorCookie);

      const res = await app.request(`/api/communities/${communityId}/events/${restrictedId}`);
      expect(res.status).toBe(404);
    });

    it("a signed-in non-member gets 404 for the same restricted event", async () => {
      const creatorCookie = await authCookieFor(CREATOR);
      const { communityId, restrictedId } = await setupEvents(creatorCookie);
      const outsiderCookie = await authCookieFor(OUTSIDER);

      const res = await app.request(`/api/communities/${communityId}/events/${restrictedId}`, {
        headers: { Cookie: outsiderCookie },
      });
      expect(res.status).toBe(404);
    });

    it("an eligible member can fetch the restricted event directly by id", async () => {
      const creatorCookie = await authCookieFor(CREATOR);
      const { communityId, tierIds, restrictedId } = await setupEvents(creatorCookie);
      const memberCookie = await authCookieFor(MEMBER);
      await testDb.insert(schema.memberships).values({
        walletAddress: MEMBER.address,
        communityId,
        tierId: tierIds["Member"]!,
        joinedAt: Math.floor(Date.now() / 1000),
      });

      const res = await app.request(`/api/communities/${communityId}/events/${restrictedId}`, {
        headers: { Cookie: memberCookie },
      });
      expect(res.status).toBe(200);
    });
  });
});
