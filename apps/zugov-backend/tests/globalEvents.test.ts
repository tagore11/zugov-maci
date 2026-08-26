import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCommunities, testDb } from "./helpers/testDb.js";
import * as schema from "../src/db/schema.js";
import { eq } from "drizzle-orm";

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
  canCreateProposals: true,
  canVote: true,
  canManageMembership: true,
};
const MEMBER_TIER = {
  label: "Member",
  canCreateProposals: false,
  canVote: true,
  canManageMembership: false,
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
  displayName: string,
  tiers: Record<string, unknown>[] = [MANAGE_TIER, MEMBER_TIER],
  defaultTierLabel = "Member",
): Promise<{ communityId: string; tierIds: Record<string, string> }> {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      displayName,
      source: "wizard",
      membershipPolicy: "open",
      tierChangesRequireVote: false,
      tiers,
      defaultTierLabel,
    }),
  });
  const { community } = (await res.json()) as { community: { id: string } };
  await app.request(`/api/communities/${community.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ allowJoin: true }),
  });
  const tiersRes = await app.request(`/api/communities/${community.id}/tiers`);
  const { tiers: createdTiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
  return { communityId: community.id, tierIds: Object.fromEntries(createdTiers.map((t) => [t.label, t.id])) };
}

async function createEvent(
  cookie: string,
  communityId: string,
  overrides: Record<string, unknown> = {},
): Promise<{ id: string; parentEventId: string | null }> {
  const res = await app.request(`/api/communities/${communityId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      title: "Event",
      locationText: "Somewhere",
      startAt: NOW + DAY,
      endAt: NOW + DAY + 3600,
      ...overrides,
    }),
  });
  expect(res.status).toBe(201);
  const { event } = (await res.json()) as { event: { id: string; parentEventId: string | null } };
  return event;
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

// Events expansion (/office-hours + /plan-eng-review 2026-08-26) — the first cross-community
// events route in this codebase (GET /api/events). Mirrors events.test.ts's visibility-matrix
// conventions, extended for the multi-community dimension this endpoint uniquely has to get right.
describe("GET /api/events (global feed)", () => {
  it("does not require authentication and lists top-level unrestricted events across communities", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId: communityA } = await registerCommunity(creatorCookie, "Community A");
    const { communityId: communityB } = await registerCommunity(creatorCookie, "Community B");
    const eventA = await createEvent(creatorCookie, communityA, { title: "Event A" });
    const eventB = await createEvent(creatorCookie, communityB, { title: "Event B" });

    const res = await app.request("/api/events");
    expect(res.status).toBe(200);
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(eventA.id);
    expect(ids).toContain(eventB.id);
  });

  it("D6: response includes correct communityDisplayName/communityLogo per event, no cross-community mixup", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId: communityA } = await registerCommunity(creatorCookie, "Alpha Community");
    const { communityId: communityB } = await registerCommunity(creatorCookie, "Beta Community");
    const { communityId: communityC } = await registerCommunity(creatorCookie, "Gamma Community");
    const eventA = await createEvent(creatorCookie, communityA, { title: "Event A" });
    const eventB = await createEvent(creatorCookie, communityB, { title: "Event B" });
    const eventC = await createEvent(creatorCookie, communityC, { title: "Event C" });

    const res = await app.request("/api/events?limit=50");
    const { events } = (await res.json()) as {
      events: { id: string; communityId: string; communityDisplayName: string }[];
    };
    const byId = Object.fromEntries(events.map((e) => [e.id, e]));
    expect(byId[eventA.id]!.communityDisplayName).toBe("Alpha Community");
    expect(byId[eventB.id]!.communityDisplayName).toBe("Beta Community");
    expect(byId[eventC.id]!.communityDisplayName).toBe("Gamma Community");
  });

  it("a signed-in member of community A sees A's tier-restricted event, not community B's", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId: communityA, tierIds: tiersA } = await registerCommunity(creatorCookie, "Community A");
    const { communityId: communityB, tierIds: tiersB } = await registerCommunity(creatorCookie, "Community B");
    const restrictedA = await createEvent(creatorCookie, communityA, {
      title: "Restricted A",
      eligibleTierIds: [tiersA["Member"]],
    });
    const restrictedB = await createEvent(creatorCookie, communityB, {
      title: "Restricted B",
      eligibleTierIds: [tiersB["Member"]],
    });

    const memberCookie = await authCookieFor(MEMBER);
    await testDb.insert(schema.memberships).values({
      walletAddress: MEMBER.address,
      communityId: communityA,
      tierId: tiersA["Member"]!,
      joinedAt: Math.floor(Date.now() / 1000),
    });

    const res = await app.request("/api/events?limit=50", { headers: { Cookie: memberCookie } });
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(restrictedA.id);
    expect(ids).not.toContain(restrictedB.id);
  });

  it("a page spanning 3+ distinct communities has no cross-community tier-visibility leakage", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId: communityA, tierIds: tiersA } = await registerCommunity(creatorCookie, "Community A");
    const { communityId: communityB, tierIds: tiersB } = await registerCommunity(creatorCookie, "Community B");
    const { communityId: communityC } = await registerCommunity(creatorCookie, "Community C");
    const restrictedA = await createEvent(creatorCookie, communityA, {
      title: "Restricted A",
      eligibleTierIds: [tiersA["Member"]],
    });
    const restrictedB = await createEvent(creatorCookie, communityB, {
      title: "Restricted B",
      eligibleTierIds: [tiersB["Member"]],
    });
    const unrestrictedC = await createEvent(creatorCookie, communityC, { title: "Unrestricted C" });

    const outsiderCookie = await authCookieFor(OUTSIDER);
    const res = await app.request("/api/events?limit=50", { headers: { Cookie: outsiderCookie } });
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).not.toContain(restrictedA.id);
    expect(ids).not.toContain(restrictedB.id);
    expect(ids).toContain(unrestrictedC.id);
  });

  it("side-events NEVER appear as their own top-level card in this feed", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunity(creatorCookie, "Community With Side Events");
    const parent = await createEvent(creatorCookie, communityId, { title: "Multi-day Gathering" });
    const side = await createEvent(creatorCookie, communityId, { title: "Morning Session", parentEventId: parent.id });

    const res = await app.request("/api/events?limit=50");
    const { events } = (await res.json()) as { events: { id: string }[] };
    const ids = events.map((e) => e.id);
    expect(ids).toContain(parent.id);
    expect(ids).not.toContain(side.id);
  });

  it("respects the collection=upcoming|past filter", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunity(creatorCookie, "Community");
    const future = await createEvent(creatorCookie, communityId, { title: "Future" });
    const past = await createEvent(creatorCookie, communityId, { title: "Past" });
    await testDb
      .update(schema.events)
      .set({ startAt: NOW - 2 * DAY, endAt: NOW - DAY })
      .where(eq(schema.events.id, past.id));

    const upcomingRes = await app.request("/api/events?collection=upcoming&limit=50");
    const { events: upcoming } = (await upcomingRes.json()) as { events: { id: string }[] };
    expect(upcoming.map((e) => e.id)).toContain(future.id);
    expect(upcoming.map((e) => e.id)).not.toContain(past.id);

    const pastRes = await app.request("/api/events?collection=past&limit=50");
    const { events: pastEvents } = (await pastRes.json()) as { events: { id: string }[] };
    expect(pastEvents.map((e) => e.id)).toContain(past.id);
    expect(pastEvents.map((e) => e.id)).not.toContain(future.id);
  });

  it("paginates correctly: page 2 offset math and hasMore reflect the unfiltered count", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunity(creatorCookie, "Community");
    for (let i = 0; i < 5; i++) {
      await createEvent(creatorCookie, communityId, {
        title: `Event ${i}`,
        startAt: NOW + (i + 1) * DAY,
        endAt: NOW + (i + 1) * DAY + 3600,
      });
    }

    const page1Res = await app.request("/api/events?page=1&limit=2");
    const page1 = (await page1Res.json()) as { events: { id: string }[]; total: number; hasMore: boolean };
    expect(page1.events.length).toBe(2);
    expect(page1.total).toBe(5);
    expect(page1.hasMore).toBe(true);

    const page2Res = await app.request("/api/events?page=2&limit=2");
    const page2 = (await page2Res.json()) as { events: { id: string }[]; total: number; hasMore: boolean };
    expect(page2.events.length).toBe(2);
    expect(page2.hasMore).toBe(true);
    // No overlap between page 1 and page 2.
    expect(page1.events.map((e) => e.id).some((id) => page2.events.map((e) => e.id).includes(id))).toBe(false);

    const page3Res = await app.request("/api/events?page=3&limit=2");
    const page3 = (await page3Res.json()) as { events: { id: string }[]; hasMore: boolean };
    expect(page3.events.length).toBe(1);
    expect(page3.hasMore).toBe(false);
  });
});
