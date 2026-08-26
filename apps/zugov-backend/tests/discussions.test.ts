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
const RECONCILED_OWNER = privateKeyToAccount(`0x${"77".repeat(32)}`);

const CREATOR_TIER = {
  label: "Creator",
  canCreateProposals: true,
  canVote: true,
  canManageMembership: false,
  canPostDiscussions: true,
};
const ADMIN_TIER = {
  label: "Admin",
  canCreateProposals: true,
  canVote: true,
  canManageMembership: true,
  canPostDiscussions: true,
};
const MEMBER_TIER = {
  label: "Member",
  canCreateProposals: false,
  canVote: true,
  canManageMembership: false,
  canPostDiscussions: true,
};
const NO_POST_TIER = {
  label: "Observer",
  canCreateProposals: false,
  canVote: false,
  canManageMembership: false,
  canPostDiscussions: false,
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

async function registerCommunityWithTiers(
  cookie: string,
  tiers: Record<string, unknown>[] = [CREATOR_TIER, ADMIN_TIER, MEMBER_TIER, NO_POST_TIER],
): Promise<{ communityId: string; tierIds: Record<string, string> }> {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      displayName: "Discussions Test Community",
      source: "wizard",
      membershipPolicy: "open",
      tierChangesRequireVote: false,
      tiers,
      defaultTierLabel: "Creator",
    }),
  });
  const { community } = (await res.json()) as { community: { id: string } };

  // allowJoin defaults to false for newly-created communities — several tests join a second
  // wallet directly onto a specific tier, matching events.test.ts's/proposals.test.ts's own
  // convention (the public /join flow always lands on the default tier, so there's no API
  // surface to pick another tier).
  await app.request(`/api/communities/${community.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ allowJoin: true }),
  });

  const tiersRes = await app.request(`/api/communities/${community.id}/tiers`);
  const { tiers: created } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
  return { communityId: community.id, tierIds: Object.fromEntries(created.map((t) => [t.label, t.id])) };
}

async function joinTier(communityId: string, walletAddress: string, tierId: string): Promise<void> {
  await testDb.insert(schema.memberships).values({
    walletAddress,
    communityId,
    tierId,
    joinedAt: Math.floor(Date.now() / 1000),
  });
}

async function createDiscussion(
  cookie: string,
  communityId: string,
  overrides: Record<string, unknown> = {},
): Promise<{ res: Response; discussion?: { id: string; eligibleTierIds: string[] | null } }> {
  const res = await app.request(`/api/communities/${communityId}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      title: "Welcome thread",
      body: "Introduce yourself here.",
      ...overrides,
    }),
  });
  if (res.status !== 201) return { res };
  const { discussion } = (await res.json()) as { discussion: { id: string; eligibleTierIds: string[] | null } };
  return { res, discussion };
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

describe("POST /api/communities/:id/discussions", () => {
  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);

    const res = await app.request(`/api/communities/${communityId}/discussions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x", body: "y" }),
    });
    expect(res.status).toBe(401);
  });

  it("creates a discussion for the creator's default tier", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);

    const { res, discussion } = await createDiscussion(cookie, communityId);
    expect(res.status).toBe(201);
    expect(discussion!.eligibleTierIds).toBeNull();
  });

  it("returns 403 when the caller's tier lacks canPostDiscussions", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(cookie);
    const outsiderCookie = await authCookieFor(OUTSIDER);
    await joinTier(communityId, OUTSIDER.address, tierIds["Observer"]!);

    const { res } = await createDiscussion(outsiderCookie, communityId);
    expect(res.status).toBe(403);
  });

  it("creates a tier-restricted discussion when eligibleTierIds is provided", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(cookie);

    const { res, discussion } = await createDiscussion(cookie, communityId, {
      eligibleTierIds: [tierIds["Member"]],
    });
    expect(res.status).toBe(201);
    expect(discussion!.eligibleTierIds).toEqual([tierIds["Member"]]);
  });
});

describe("GET /api/communities/:id/discussions — membership gate (Child J, D5)", () => {
  it("returns 401 for an anonymous caller (no session at all)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    await createDiscussion(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/discussions`);
    expect(res.status).toBe(401);
  });

  it("returns 403 for a signed-in non-member (not even an unrestricted post is visible)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    await createDiscussion(cookie, communityId);
    const outsiderCookie = await authCookieFor(OUTSIDER);

    const res = await app.request(`/api/communities/${communityId}/discussions`, {
      headers: { Cookie: outsiderCookie },
    });
    expect(res.status).toBe(403);
  });

  it("returns 200 for a member", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(cookie);
    await createDiscussion(cookie, communityId);
    const memberCookie = await authCookieFor(MEMBER);
    await joinTier(communityId, MEMBER.address, tierIds["Member"]!);

    const res = await app.request(`/api/communities/${communityId}/discussions`, {
      headers: { Cookie: memberCookie },
    });
    expect(res.status).toBe(200);
  });

  // Outside-voice review finding (/plan-eng-review 2026-08-26, D5 revision): a community's
  // on-chain-reconciled owner (communityService.ts's reconcileCreatorAddress) can have real
  // isAuthorized() admin authority with NO memberships row ever inserted — must not be walled out
  // of the screen showing what they have delete authority over.
  it("returns 200 for a reconciled on-chain owner with no memberships row (D5 admin carve-out)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    await createDiscussion(cookie, communityId);

    await testDb
      .update(schema.communities)
      .set({ creatorAddress: RECONCILED_OWNER.address })
      .where(eq(schema.communities.id, communityId));
    const reconciledCookie = await authCookieFor(RECONCILED_OWNER);

    const res = await app.request(`/api/communities/${communityId}/discussions`, {
      headers: { Cookie: reconciledCookie },
    });
    expect(res.status).toBe(200);
  });
});

describe("GET /api/communities/:id/discussions — tier-restricted visibility (Child J)", () => {
  async function setupDiscussions(creatorCookie: string) {
    const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
    const { discussion: unrestricted } = await createDiscussion(creatorCookie, communityId, {
      title: "Unrestricted post",
    });
    const { discussion: restricted } = await createDiscussion(creatorCookie, communityId, {
      title: "Restricted post",
      eligibleTierIds: [tierIds["Admin"]],
    });
    return { communityId, tierIds, unrestrictedId: unrestricted!.id, restrictedId: restricted!.id };
  }

  it("an eligible member (Admin tier) sees both the unrestricted and restricted post", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds, unrestrictedId, restrictedId } = await setupDiscussions(creatorCookie);
    const adminCookie = await authCookieFor(ADMIN);
    await joinTier(communityId, ADMIN.address, tierIds["Admin"]!);

    const res = await app.request(`/api/communities/${communityId}/discussions`, { headers: { Cookie: adminCookie } });
    const { discussions } = (await res.json()) as { discussions: { id: string }[] };
    const ids = discussions.map((d) => d.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).toContain(restrictedId);
  });

  it("a member whose tier is NOT eligible is excluded from the restricted post", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds, unrestrictedId, restrictedId } = await setupDiscussions(creatorCookie);
    const memberCookie = await authCookieFor(MEMBER);
    await joinTier(communityId, MEMBER.address, tierIds["Member"]!);

    const res = await app.request(`/api/communities/${communityId}/discussions`, { headers: { Cookie: memberCookie } });
    const { discussions } = (await res.json()) as { discussions: { id: string }[] };
    const ids = discussions.map((d) => d.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).not.toContain(restrictedId);
  });

  it("the creator always sees both, including a post restricted away from their own tier", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, unrestrictedId, restrictedId } = await setupDiscussions(creatorCookie);

    const res = await app.request(`/api/communities/${communityId}/discussions`, {
      headers: { Cookie: creatorCookie },
    });
    const { discussions } = (await res.json()) as { discussions: { id: string }[] };
    const ids = discussions.map((d) => d.id);
    expect(ids).toContain(unrestrictedId);
    expect(ids).toContain(restrictedId);
  });

  it("a community admin (canManageMembership) sees both regardless of their own tier being excluded", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
    // Restrict to Member only — Admin tier is deliberately excluded from eligibleTierIds, but the
    // canViewRestricted() admin bypass should still grant visibility (mirrors Child I's D2).
    const { discussion: restricted } = await createDiscussion(creatorCookie, communityId, {
      eligibleTierIds: [tierIds["Member"]],
    });
    const adminCookie = await authCookieFor(ADMIN);
    await joinTier(communityId, ADMIN.address, tierIds["Admin"]!);

    const res = await app.request(`/api/communities/${communityId}/discussions/${restricted!.id}`, {
      headers: { Cookie: adminCookie },
    });
    expect(res.status).toBe(200);
  });

  // /ship review army (2026-08-26, testing specialist) — single-item gating was only exercised
  // via the admin-bypass case above; matches events.test.ts's/proposals.test.ts's own
  // "matches list gating" nested describe pattern.
  describe("GET /api/communities/:id/discussions/:discussionId — matches list gating", () => {
    it("a signed-in non-member gets 403 for a restricted post (not a content leak)", async () => {
      const creatorCookie = await authCookieFor(CREATOR);
      const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
      const { discussion } = await createDiscussion(creatorCookie, communityId, {
        eligibleTierIds: [tierIds["Admin"]],
      });
      const outsiderCookie = await authCookieFor(OUTSIDER);

      const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
        headers: { Cookie: outsiderCookie },
      });
      expect(res.status).toBe(403);
    });

    it("a member whose tier is NOT eligible gets 404 for a restricted post fetched directly by id", async () => {
      const creatorCookie = await authCookieFor(CREATOR);
      const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
      const { discussion } = await createDiscussion(creatorCookie, communityId, {
        eligibleTierIds: [tierIds["Admin"]],
      });
      const memberCookie = await authCookieFor(MEMBER);
      await joinTier(communityId, MEMBER.address, tierIds["Member"]!);

      const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
        headers: { Cookie: memberCookie },
      });
      expect(res.status).toBe(404);
    });
  });
});

describe("PATCH /api/communities/:id/discussions/:discussionId — author-only (Child J, D3)", () => {
  it("lets the author edit their own post", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    const { discussion } = await createDiscussion(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ title: "Updated title" }),
    });
    expect(res.status).toBe(200);
    const { discussion: updated } = (await res.json()) as { discussion: { title: string } };
    expect(updated.title).toBe("Updated title");
  });

  it("rejects a PATCH from a community admin who is not the author (no admin edit path)", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
    const { discussion } = await createDiscussion(creatorCookie, communityId);
    const adminCookie = await authCookieFor(ADMIN);
    await joinTier(communityId, ADMIN.address, tierIds["Admin"]!);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ title: "Hijacked" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 for a nonexistent discussion", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);

    const res = await app.request(`/api/communities/${communityId}/discussions/nonexistent-id`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ title: "x" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    const { discussion } = await createDiscussion(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x" }),
    });
    expect(res.status).toBe(401);
  });

  // /ship coverage audit — the PATCH restrict/unrestrict branch was only exercised via title-only
  // edits in the tests above.
  it("can restrict an unrestricted post's eligibleTierIds via PATCH", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(cookie);
    const { discussion } = await createDiscussion(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ eligibleTierIds: [tierIds["Admin"]] }),
    });
    expect(res.status).toBe(200);
    const { discussion: updated } = (await res.json()) as { discussion: { eligibleTierIds: string[] | null } };
    expect(updated.eligibleTierIds).toEqual([tierIds["Admin"]]);
  });

  it('can unrestrict a restricted post\'s eligibleTierIds via PATCH (explicit null, not the string "null")', async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(cookie);
    const { discussion } = await createDiscussion(cookie, communityId, { eligibleTierIds: [tierIds["Admin"]] });

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ eligibleTierIds: null }),
    });
    expect(res.status).toBe(200);
    const { discussion: updated } = (await res.json()) as { discussion: { eligibleTierIds: string[] | null } };
    expect(updated.eligibleTierIds).toBeNull();

    // Prove it's a real visibility change, not just a stored field — a non-eligible member must
    // now see it.
    const outsiderCookie = await authCookieFor(OUTSIDER);
    await app.request(`/api/communities/${communityId}/join`, { method: "POST", headers: { Cookie: outsiderCookie } });
    const listRes = await app.request(`/api/communities/${communityId}/discussions`, {
      headers: { Cookie: outsiderCookie },
    });
    const { discussions } = (await listRes.json()) as { discussions: { id: string }[] };
    expect(discussions.map((d) => d.id)).toContain(discussion!.id);
  });

  it("returns 422 when eligibleTierIds is an empty array (min(1) — an empty restriction is nonsensical)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    const { discussion } = await createDiscussion(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ eligibleTierIds: [] }),
    });
    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/communities/:id/discussions/:discussionId — author or admin (Child J, D3)", () => {
  it("lets the author delete their own post", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    const { discussion } = await createDiscussion(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
  });

  it("lets a community admin delete a post they didn't author", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
    const { discussion } = await createDiscussion(creatorCookie, communityId);
    const adminCookie = await authCookieFor(ADMIN);
    await joinTier(communityId, ADMIN.address, tierIds["Admin"]!);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    expect(res.status).toBe(200);
  });

  it("rejects a delete from a non-author, non-admin member", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await registerCommunityWithTiers(creatorCookie);
    const { discussion } = await createDiscussion(creatorCookie, communityId);
    const memberCookie = await authCookieFor(MEMBER);
    await joinTier(communityId, MEMBER.address, tierIds["Member"]!);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "DELETE",
      headers: { Cookie: memberCookie },
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 for a nonexistent discussion", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);

    const res = await app.request(`/api/communities/${communityId}/discussions/nonexistent-id`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(404);
  });

  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId } = await registerCommunityWithTiers(cookie);
    const { discussion } = await createDiscussion(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/discussions/${discussion!.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(401);
  });
});
