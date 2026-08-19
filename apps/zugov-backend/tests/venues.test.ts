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
const OUTSIDER = privateKeyToAccount(`0x${"22".repeat(32)}`);

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
  tiers = [MANAGE_TIER],
  defaultTierLabel = tiers[0]!.label,
): Promise<string> {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      displayName: "Venue Test Community",
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

describe("POST /api/communities/:id/venues", () => {
  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "The Hub" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 for a member without canManageMembership (canCreateEvents alone is not enough)", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(creatorCookie, [MANAGE_TIER, REGULAR_TIER], "Regular");

    const outsiderCookie = await authCookieFor(OUTSIDER);
    await app.request(`/api/communities/${communityId}/join`, {
      method: "POST",
      headers: { Cookie: outsiderCookie },
    });

    const res = await app.request(`/api/communities/${communityId}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: outsiderCookie },
      body: JSON.stringify({ name: "The Hub" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 422 for an invalid body", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: "" }),
    });
    expect(res.status).toBe(422);
  });

  it("creates a venue for the community creator", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: "The Hub", address: "123 Main St", mapUrl: "https://maps.example.com/hub" }),
    });
    expect(res.status).toBe(201);
    const { venue } = (await res.json()) as { venue: { id: string; name: string; communityId: string } };
    expect(venue.name).toBe("The Hub");
    expect(venue.communityId).toBe(communityId);
  });
});

describe("GET /api/communities/:id/venues", () => {
  it("does not require authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/venues`);
    expect(res.status).toBe(200);
  });

  it("returns an empty list for a community with no venues", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);

    const res = await app.request(`/api/communities/${communityId}/venues`);
    const { venues } = (await res.json()) as { venues: unknown[] };
    expect(venues).toEqual([]);
  });

  it("lists venues created for the community", async () => {
    const cookie = await authCookieFor(CREATOR);
    const communityId = await registerCommunity(cookie);
    await app.request(`/api/communities/${communityId}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: "The Hub" }),
    });

    const res = await app.request(`/api/communities/${communityId}/venues`);
    const { venues } = (await res.json()) as { venues: { name: string }[] };
    expect(venues.map((v) => v.name)).toEqual(["The Hub"]);
  });
});
