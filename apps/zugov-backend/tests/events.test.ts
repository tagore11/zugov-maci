import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCommunities } from "./helpers/testDb.js";

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

const MANAGE_TIER = {
  label: "Admin",
  canCreateGovernanceActions: true,
  canVote: true,
  canManageMembership: true,
};
const REGULAR_TIER = {
  label: "Regular",
  canCreateGovernanceActions: false,
  canVote: true,
  canManageMembership: false,
};
const NO_EVENTS_TIER = {
  label: "Observer",
  canCreateGovernanceActions: false,
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
