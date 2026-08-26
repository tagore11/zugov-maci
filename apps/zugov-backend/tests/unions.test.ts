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

const FOUNDER = privateKeyToAccount(`0x${"11".repeat(32)}`);
const PEER_ADMIN = privateKeyToAccount(`0x${"22".repeat(32)}`);
const OUTSIDER = privateKeyToAccount(`0x${"33".repeat(32)}`);

const MANAGE_TIER = {
  label: "Admin",
  canCreateProposals: true,
  canVote: true,
  canManageMembership: true,
};
const NO_MANAGE_TIER = {
  label: "Member",
  canCreateProposals: false,
  canVote: true,
  canManageMembership: false,
};

async function authCookieFor(account: typeof FOUNDER): Promise<string> {
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

// Every community here is identity-only — unions have no governance-status restriction
// (Architecture decision 5), so no test needs to attach governance to exercise union behavior.
async function registerCommunity(
  cookie: string,
  tiers: (typeof MANAGE_TIER)[] = [MANAGE_TIER],
  displayName = "Test Community",
): Promise<string> {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      displayName,
      source: "wizard",
      membershipPolicy: "open",
      tierChangesRequireVote: false,
      tiers,
      defaultTierLabel: tiers[0]!.label,
    }),
  });
  const { community } = (await res.json()) as { community: { id: string } };
  return community.id;
}

async function createUnion(cookie: string, foundingCommunityId: string, displayName = "Test Union") {
  return app.request("/api/unions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ displayName, foundingCommunityId }),
  });
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

// community page redesign (/plan-eng-review 2026-08-26, D2) — powers the /unions listing badge
// and manage-profile's "Awaiting Your Action" card.
describe("GET /api/unions/my-pending-invites", () => {
  it("returns an empty list for an unauthenticated caller", async () => {
    const res = await app.request("/api/unions/my-pending-invites");
    expect(res.status).toBe(200);
    const { invites } = (await res.json()) as { invites: unknown[] };
    expect(invites).toEqual([]);
  });

  it("returns an empty list when the caller has no pending invites", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");

    const res = await app.request("/api/unions/my-pending-invites", { headers: { Cookie: founderCookie } });
    const { invites } = (await res.json()) as { invites: unknown[] };
    expect(invites).toEqual([]);
  });

  it("returns the pending invite for a community the caller is authorized on", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity, "Founder's Union");
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });

    const res = await app.request("/api/unions/my-pending-invites", { headers: { Cookie: peerCookie } });
    const { invites } = (await res.json()) as {
      invites: { unionId: string; unionDisplayName: string; communityId: string; communityDisplayName: string }[];
    };
    expect(invites).toEqual([
      {
        unionId: union.id,
        unionDisplayName: "Founder's Union",
        communityId: peerCommunity,
        communityDisplayName: "Peer Co",
      },
    ]);
  });

  it("does not include an active membership, only pending ones", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    await createUnion(founderCookie, founderCommunity);

    const res = await app.request("/api/unions/my-pending-invites", { headers: { Cookie: founderCookie } });
    const { invites } = (await res.json()) as { invites: unknown[] };
    expect(invites).toEqual([]); // founding community is active, not pending
  });

  it("does not include a declined invite", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: false }),
    });

    const res = await app.request("/api/unions/my-pending-invites", { headers: { Cookie: peerCookie } });
    const { invites } = (await res.json()) as { invites: unknown[] };
    expect(invites).toEqual([]);
  });
});

describe("POST /api/unions", () => {
  it("returns 401 without authentication", async () => {
    const res = await app.request("/api/unions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: "Union", foundingCommunityId: "x" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 422 for invalid payload", async () => {
    const cookie = await authCookieFor(FOUNDER);
    const res = await app.request("/api/unions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ displayName: "" }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 403 when the caller is not authorized (no canManageMembership) on the founding community", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const communityId = await registerCommunity(founderCookie, [NO_MANAGE_TIER]);

    // FOUNDER is the creator, so they're always authorized regardless of tier — use a second
    // account with no membership at all to exercise the real 403 path.
    const outsiderCookie = await authCookieFor(OUTSIDER);
    const res = await createUnion(outsiderCookie, communityId);
    expect(res.status).toBe(403);
  });

  // Matches the same isAuthorized-before-existence precedent as PATCH /communities/:id and
  // POST /communities/:id/governance — a nonexistent community has no creatorAddress to match,
  // so isAuthorized() returns false before any 404 check runs.
  it("returns 403 for a nonexistent founding community (isAuthorized runs before the existence check)", async () => {
    const cookie = await authCookieFor(FOUNDER);
    const res = await createUnion(cookie, "0x0000000000000000000000000000000000000000");
    expect(res.status).toBe(403);
  });

  it("creates the union with the founding community auto-enrolled as active", async () => {
    const cookie = await authCookieFor(FOUNDER);
    const communityId = await registerCommunity(cookie);

    const res = await createUnion(cookie, communityId);
    expect(res.status).toBe(201);
    const { union } = (await res.json()) as { union: { id: string; displayName: string } };
    expect(union.displayName).toBe("Test Union");

    const getRes = await app.request(`/api/unions/${union.id}`);
    const { members } = (await getRes.json()) as { members: { communityId: string; status: string }[] };
    expect(members).toHaveLength(1);
    expect(members[0]!.communityId).toBe(communityId);
    expect(members[0]!.status).toBe("active");
  });
});

describe("GET /api/unions/:id", () => {
  it("returns 404 for a nonexistent union", async () => {
    const res = await app.request("/api/unions/0x0000000000000000000000000000000000000000");
    expect(res.status).toBe(404);
  });

  it("does not include pending invites for an unauthenticated caller", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });

    const res = await app.request(`/api/unions/${union.id}`);
    const { members } = (await res.json()) as { members: unknown[] };
    expect(members).toHaveLength(1); // active only, pending excluded
  });

  // community page redesign (/plan-eng-review 2026-08-26, D1) — myActiveCommunityIds/
  // myPendingCommunityIds power the union page's "Your Actions" panel.
  describe("myActiveCommunityIds / myPendingCommunityIds", () => {
    it("returns empty arrays for an unauthenticated caller", async () => {
      const founderCookie = await authCookieFor(FOUNDER);
      const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
      const createRes = await createUnion(founderCookie, founderCommunity);
      const { union } = (await createRes.json()) as { union: { id: string } };

      const res = await app.request(`/api/unions/${union.id}`);
      const body = (await res.json()) as { myActiveCommunityIds: string[]; myPendingCommunityIds: string[] };
      expect(body.myActiveCommunityIds).toEqual([]);
      expect(body.myPendingCommunityIds).toEqual([]);
    });

    it("lists the founding community as an active match for its own authorized caller", async () => {
      const founderCookie = await authCookieFor(FOUNDER);
      const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
      const createRes = await createUnion(founderCookie, founderCommunity);
      const { union } = (await createRes.json()) as { union: { id: string } };

      const res = await app.request(`/api/unions/${union.id}`, { headers: { Cookie: founderCookie } });
      const body = (await res.json()) as { myActiveCommunityIds: string[]; myPendingCommunityIds: string[] };
      expect(body.myActiveCommunityIds).toEqual([founderCommunity]);
      expect(body.myPendingCommunityIds).toEqual([]);
    });

    // The key gap this extension closes: an invited community's own admin can see (and, via
    // /respond, act on) its own pending invite even with no OTHER active-member authority in
    // this union — the pre-existing "any active member" gate only controls seeing EVERYONE
    // ELSE's pending invites, not the caller's own.
    it("lists the invited community as a pending match for its own authorized caller, without any active-member authority", async () => {
      const founderCookie = await authCookieFor(FOUNDER);
      const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
      const createRes = await createUnion(founderCookie, founderCommunity);
      const { union } = (await createRes.json()) as { union: { id: string } };

      const peerCookie = await authCookieFor(PEER_ADMIN);
      const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
      await app.request(`/api/unions/${union.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: founderCookie },
        body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
      });

      const res = await app.request(`/api/unions/${union.id}`, { headers: { Cookie: peerCookie } });
      const body = (await res.json()) as {
        members: { communityId: string; status: string }[];
        myActiveCommunityIds: string[];
        myPendingCommunityIds: string[];
      };
      expect(body.myActiveCommunityIds).toEqual([]);
      expect(body.myPendingCommunityIds).toEqual([peerCommunity]);
      // Sees its own pending entry, but the members list still isn't the FULL pending list —
      // just active members plus its own pending one.
      const byId = Object.fromEntries(body.members.map((m) => [m.communityId, m.status]));
      expect(byId[peerCommunity]).toBe("pending");
    });

    it("does not leak another community's pending invite to a caller only authorized on their own pending community", async () => {
      const founderCookie = await authCookieFor(FOUNDER);
      const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
      const createRes = await createUnion(founderCookie, founderCommunity);
      const { union } = (await createRes.json()) as { union: { id: string } };

      const peerCookie = await authCookieFor(PEER_ADMIN);
      const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
      await app.request(`/api/unions/${union.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: founderCookie },
        body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
      });

      const outsiderCookie = await authCookieFor(OUTSIDER);
      const outsiderCommunity = await registerCommunity(outsiderCookie, [MANAGE_TIER], "Outsider Co");
      await app.request(`/api/unions/${union.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: founderCookie },
        body: JSON.stringify({ communityId: outsiderCommunity, actingCommunityId: founderCommunity }),
      });

      const res = await app.request(`/api/unions/${union.id}`, { headers: { Cookie: peerCookie } });
      const body = (await res.json()) as {
        members: { communityId: string; status: string }[];
        myPendingCommunityIds: string[];
      };
      expect(body.myPendingCommunityIds).toEqual([peerCommunity]);
      const byId = Object.fromEntries(body.members.map((m) => [m.communityId, m.status]));
      expect(byId[outsiderCommunity]).toBeUndefined();
    });
  });
});

describe("POST /api/unions/:id/invite", () => {
  async function foundedUnion() {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };
    return { founderCookie, founderCommunity, unionId: union.id };
  }

  it("returns 401 without authentication", async () => {
    const { unionId, founderCommunity } = await foundedUnion();
    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityId: "x", actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when the caller is not authorized on actingCommunityId", async () => {
    const { unionId, founderCommunity } = await foundedUnion();
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const outsiderCookie = await authCookieFor(OUTSIDER);
    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: outsiderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 403 when actingCommunityId is not an active member of the union", async () => {
    const { unionId, founderCookie } = await foundedUnion();
    const notMemberCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Not a member");
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: notMemberCommunity }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 for a nonexistent union", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie);
    const res = await app.request("/api/unions/0x0000000000000000000000000000000000000000/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: founderCommunity, actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 for a nonexistent target community", async () => {
    const { unionId, founderCookie, founderCommunity } = await foundedUnion();
    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({
        communityId: "0x0000000000000000000000000000000000000000",
        actingCommunityId: founderCommunity,
      }),
    });
    expect(res.status).toBe(404);
  });

  it("creates a pending membership on success", async () => {
    const { unionId, founderCookie, founderCommunity } = await foundedUnion();
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(201);
    const { membership } = (await res.json()) as { membership: { status: string } };
    expect(membership.status).toBe("pending");
  });

  it("returns 409 on a duplicate invite (already pending)", async () => {
    const { unionId, founderCookie, founderCommunity } = await foundedUnion();
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(409);
  });

  it("returns 409 when the target is already an active member", async () => {
    const { unionId, founderCookie, founderCommunity } = await foundedUnion();
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${unionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });

    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(409);
  });

  it("allows any active member (not just the founder) to invite", async () => {
    const { unionId, founderCookie, founderCommunity } = await foundedUnion();
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${unionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });

    // Now peerCommunity is an active member — it should be able to invite a third community.
    const thirdCookie = await authCookieFor(privateKeyToAccount(`0x${"44".repeat(32)}`));
    const thirdCommunity = await registerCommunity(thirdCookie, [MANAGE_TIER], "Third Co");

    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: thirdCommunity, actingCommunityId: peerCommunity }),
    });
    expect(res.status).toBe(201);
  });

  it("resets a declined membership back to pending on re-invite", async () => {
    const { unionId, founderCookie, founderCommunity } = await foundedUnion();
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${unionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: false }),
    });

    const res = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(201);
    const { membership } = (await res.json()) as { membership: { status: string } };
    expect(membership.status).toBe("pending");
  });
});

describe("POST /api/unions/:id/respond", () => {
  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(FOUNDER);
    const communityId = await registerCommunity(cookie);
    const createRes = await createUnion(cookie, communityId);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const res = await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityId, accept: true }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when the caller is not authorized on the invited community (e.g. the inviter tries to respond)", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });

    // The INVITER (founder) tries to respond on behalf of the invited community — must fail,
    // symmetric consent means only the invited community's own admin can accept/decline.
    const res = await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 when there is no pending membership", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const res = await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });
    expect(res.status).toBe(404);
  });

  it("accept moves the membership to active", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });

    const res = await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });
    expect(res.status).toBe(200);
    const { membership } = (await res.json()) as { membership: { status: string } };
    expect(membership.status).toBe("active");
  });

  it("decline moves the membership to declined", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });

    const res = await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: false }),
    });
    expect(res.status).toBe(200);
    const { membership } = (await res.json()) as { membership: { status: string } };
    expect(membership.status).toBe("declined");
  });

  it("returns 404 when responding to an already-active membership again", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });

    const res = await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/unions/:id/leave", () => {
  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(FOUNDER);
    const communityId = await registerCommunity(cookie);
    const createRes = await createUnion(cookie, communityId);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const res = await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityId }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when the caller is not authorized on the leaving community (e.g. another member tries to remove it)", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });

    // The founder tries to make the PEER leave — no "kick" path exists, only self-service.
    const res = await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 409 when the community is not an active member (e.g. never invited)", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");

    const res = await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity }),
    });
    expect(res.status).toBe(409);
  });

  it("returns 409 when trying to leave a pending (not yet accepted) invite", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });

    const res = await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity }),
    });
    expect(res.status).toBe(409);
  });

  it("moves an active membership to left, and it stops appearing in the union's member list", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });

    const res = await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity }),
    });
    expect(res.status).toBe(200);
    const { membership } = (await res.json()) as { membership: { status: string } };
    expect(membership.status).toBe("left");

    const getRes = await app.request(`/api/unions/${union.id}`, { headers: { Cookie: peerCookie } });
    const { members } = (await getRes.json()) as { members: { communityId: string }[] };
    expect(members.some((m) => m.communityId === peerCommunity)).toBe(false);
  });

  it("returns 409 on a second leave attempt (already left)", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });
    await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity }),
    });

    const res = await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity }),
    });
    expect(res.status).toBe(409);
  });

  it("a re-invite after leaving resets the membership back to pending", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity);
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });
    await app.request(`/api/unions/${union.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity }),
    });

    const res = await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    expect(res.status).toBe(201);
    const { membership } = (await res.json()) as { membership: { status: string } };
    expect(membership.status).toBe("pending");
  });
});

describe("GET /api/unions (browse-all)", () => {
  it("lists unions with active member counts, excluding pending/declined/left from the count", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");
    const createRes = await createUnion(founderCookie, founderCommunity, "Browse Test Union");
    const { union } = (await createRes.json()) as { union: { id: string } };

    const peerCookie = await authCookieFor(PEER_ADMIN);
    const peerCommunity = await registerCommunity(peerCookie, [MANAGE_TIER], "Peer Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: peerCommunity, actingCommunityId: founderCommunity }),
    });
    await app.request(`/api/unions/${union.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: peerCookie },
      body: JSON.stringify({ communityId: peerCommunity, accept: true }),
    });

    const pendingInviteCookie = await authCookieFor(privateKeyToAccount(`0x${"77".repeat(32)}`));
    const pendingInviteCommunity = await registerCommunity(pendingInviteCookie, [MANAGE_TIER], "Pending Invite Co");
    await app.request(`/api/unions/${union.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: pendingInviteCommunity, actingCommunityId: founderCommunity }),
    });

    const res = await app.request("/api/unions");
    expect(res.status).toBe(200);
    const { unions, total } = (await res.json()) as {
      unions: { id: string; displayName: string; memberCount: number }[];
      total: number;
    };
    expect(total).toBeGreaterThanOrEqual(1);
    const listed = unions.find((u) => u.id === union.id);
    expect(listed).toBeDefined();
    // Founder + peer are active; the pending invite doesn't count.
    expect(listed!.memberCount).toBe(2);
  });

  it("does not require authentication", async () => {
    const res = await app.request("/api/unions");
    expect(res.status).toBe(200);
  });

  it("respects page and limit query params", async () => {
    const res = await app.request("/api/unions?page=1&limit=1");
    expect(res.status).toBe(200);
    const { unions } = (await res.json()) as { unions: unknown[] };
    expect(unions.length).toBeLessThanOrEqual(1);
  });
});

describe("GET /api/communities/:id/unions", () => {
  it("returns 404 for a nonexistent community", async () => {
    const res = await app.request("/api/communities/0x0000000000000000000000000000000000000000/unions");
    expect(res.status).toBe(404);
  });

  it("returns an empty list for a community with no unions", async () => {
    const cookie = await authCookieFor(FOUNDER);
    const communityId = await registerCommunity(cookie);
    const res = await app.request(`/api/communities/${communityId}/unions`);
    expect(res.status).toBe(200);
    const { unions } = (await res.json()) as { unions: unknown[] };
    expect(unions).toEqual([]);
  });

  it("shows both pending and active unions, but not declined ones", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co");

    const activeUnionRes = await createUnion(founderCookie, founderCommunity, "Active Union");
    const { union: activeUnion } = (await activeUnionRes.json()) as { union: { id: string } };

    const pendingUnionCreator = await authCookieFor(privateKeyToAccount(`0x${"55".repeat(32)}`));
    const pendingUnionFounder = await registerCommunity(pendingUnionCreator, [MANAGE_TIER], "Pending Union Founder");
    const pendingUnionRes = await createUnion(pendingUnionCreator, pendingUnionFounder, "Pending Union");
    const { union: pendingUnion } = (await pendingUnionRes.json()) as { union: { id: string } };
    await app.request(`/api/unions/${pendingUnion.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: pendingUnionCreator },
      body: JSON.stringify({ communityId: founderCommunity, actingCommunityId: pendingUnionFounder }),
    });

    const declinedUnionCreator = await authCookieFor(privateKeyToAccount(`0x${"66".repeat(32)}`));
    const declinedUnionFounder = await registerCommunity(declinedUnionCreator, [MANAGE_TIER], "Declined Union Founder");
    const declinedUnionRes = await createUnion(declinedUnionCreator, declinedUnionFounder, "Declined Union");
    const { union: declinedUnion } = (await declinedUnionRes.json()) as { union: { id: string } };
    await app.request(`/api/unions/${declinedUnion.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: declinedUnionCreator },
      body: JSON.stringify({ communityId: founderCommunity, actingCommunityId: declinedUnionFounder }),
    });
    await app.request(`/api/unions/${declinedUnion.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: founderCookie },
      body: JSON.stringify({ communityId: founderCommunity, accept: false }),
    });

    // Authenticated as the community's own authorized wallet — sees its own pending invite.
    const res = await app.request(`/api/communities/${founderCommunity}/unions`, {
      headers: { Cookie: founderCookie },
    });
    const { unions } = (await res.json()) as { unions: { id: string; status: string }[] };
    const byId = Object.fromEntries(unions.map((u) => [u.id, u.status]));
    expect(byId[activeUnion.id]).toBe("active");
    expect(byId[pendingUnion.id]).toBe("pending");
    expect(byId[declinedUnion.id]).toBeUndefined();

    // Security fix, 2026-08-26: an unauthenticated caller (or one not authorized on this
    // community) must not see pending status — only active memberships are public. Previously
    // this route included pending status unconditionally, for anyone.
    const anonRes = await app.request(`/api/communities/${founderCommunity}/unions`);
    const { unions: anonUnions } = (await anonRes.json()) as { unions: { id: string; status: string }[] };
    const anonById = Object.fromEntries(anonUnions.map((u) => [u.id, u.status]));
    expect(anonById[activeUnion.id]).toBe("active");
    expect(anonById[pendingUnion.id]).toBeUndefined();
    expect(anonById[declinedUnion.id]).toBeUndefined();
  });

  it("does not include pending status for a caller not authorized on this community", async () => {
    const founderCookie = await authCookieFor(FOUNDER);
    const founderCommunity = await registerCommunity(founderCookie, [MANAGE_TIER], "Founder Co Two");

    const pendingUnionCreator = await authCookieFor(privateKeyToAccount(`0x${"77".repeat(32)}`));
    const pendingUnionFounder = await registerCommunity(pendingUnionCreator, [MANAGE_TIER], "Other Union Founder");
    const pendingUnionRes = await createUnion(pendingUnionCreator, pendingUnionFounder, "Other Pending Union");
    const { union: pendingUnion } = (await pendingUnionRes.json()) as { union: { id: string } };
    await app.request(`/api/unions/${pendingUnion.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: pendingUnionCreator },
      body: JSON.stringify({ communityId: founderCommunity, actingCommunityId: pendingUnionFounder }),
    });

    // A different, unrelated wallet's own community has no authority over founderCommunity.
    const outsiderCookie = await authCookieFor(privateKeyToAccount(`0x${"88".repeat(32)}`));
    await registerCommunity(outsiderCookie, [MANAGE_TIER], "Outsider Co");

    const res = await app.request(`/api/communities/${founderCommunity}/unions`, {
      headers: { Cookie: outsiderCookie },
    });
    const { unions } = (await res.json()) as { unions: { id: string; status: string }[] };
    const byId = Object.fromEntries(unions.map((u) => [u.id, u.status]));
    expect(byId[pendingUnion.id]).toBeUndefined();
  });
});
