import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCommunities, clearCredentials } from "./helpers/testDb.js";

process.env.CORS_ORIGIN ??= "http://localhost:5173"; // pre-existing bug, see specs/003 research.md

// Real @pcd/zuauth (via @pcd/passport-interface -> @pcd/pod -> blakejs) fails to load under
// Vitest's Node ESM loader with a CJS/ESM named-export interop error — unrelated to membership
// logic, but importing `app` pulls in routes/credentials.ts -> zupassAdapter.ts -> @pcd/zuauth
// transitively. Mocked here purely to avoid that broken import chain (matches
// tests/credentials.test.ts's existing mock, for a different reason).
vi.mock("@pcd/zuauth", () => ({
  default: {
    authenticate: vi.fn(),
    ETHBERLIN04: [],
  },
}));

const { app } = await import("../src/app.js");

const TEST_ACCOUNT = privateKeyToAccount(`0x${"22".repeat(32)}`);

const DEFAULT_TIER = {
  label: "Regular",
  canCreateProposals: false,
  canVote: true,
  canManageMembership: false,
};

// Membership/tiers/joining are identity-layer concerns (Architecture 2b) — none of these tests
// need governance configured, so registration is identity-only. Communities.id is server-
// generated now; each test captures it from the registration response rather than hardcoding.
const IDENTITY_BODY = {
  displayName: "Test Membership Community",
  source: "wizard",
  membershipPolicy: "open",
  tierChangesRequireVote: false,
  tiers: [DEFAULT_TIER],
  defaultTierLabel: "Regular",
};

async function authCookieFor(account: typeof TEST_ACCOUNT): Promise<string> {
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

async function getAuthCookie(): Promise<string> {
  return authCookieFor(TEST_ACCOUNT);
}

async function registerIdentity(cookie: string, overrides: Record<string, unknown> = {}) {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ ...IDENTITY_BODY, ...overrides }),
  });
  const body = (await res.json()) as { community: { id: string; defaultTierId: string } };
  return { res, community: body.community };
}

beforeEach(async () => {
  try {
    await clearCommunities();
    await clearCredentials();
  } catch {
    // db may not be available in unit test runs without TEST_DATABASE_URL
  }
});

afterAll(async () => {
  try {
    await clearCommunities();
    await clearCredentials();
  } catch {}
});

describe("POST /api/communities — membership fields validation", () => {
  it("creates a community with tiers and a default tier when the body is valid", async () => {
    const cookie = await getAuthCookie();
    const { res, community } = await registerIdentity(cookie);
    expect(res.status).toBe(201);
    expect(community.defaultTierId).toBeTruthy();
  });
});

describe("GET /api/communities/:id/tiers", () => {
  it("returns tiers with isDefault set for the community's default tier", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request(`/api/communities/${community.id}/tiers`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tiers: { label: string; isDefault: boolean }[] };
    const regular = body.tiers.find((t) => t.label === "Regular");
    expect(regular?.isDefault).toBe(true);
  });
});

describe("Tier mutation authority (FR-008, FR-011)", () => {
  it("returns 403 when a non-authorized wallet attempts to create a tier", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);
    // POST /api/communities always sets creatorAddress from the session wallet — simulate a
    // non-authorized caller with a second, unrelated authenticated account instead of trying to
    // spoof creatorAddress (which the route ignores by design).
    const otherCookie = await authCookieFor(privateKeyToAccount(`0x${"33".repeat(32)}`));

    const res = await app.request(`/api/communities/${community.id}/tiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: otherCookie },
      body: JSON.stringify(DEFAULT_TIER),
    });
    expect(res.status).toBe(403);
  });

  it("returns 409 when tierChangesRequireVote is true", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie, { tierChangesRequireVote: true });

    const res = await app.request(`/api/communities/${community.id}/tiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(DEFAULT_TIER),
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/community vote/);
  });
});

// Regression coverage (2026-08-19 eng review, outside-voice finding): hasTierPermission's
// SELECT was widened to add canCreateEvents alongside the pre-existing
// canCreateProposals/canVote — this asserts the widened SELECT still returns correct
// values for the ORIGINAL two permissions, not just the new one, so a future permission
// addition following this same pattern doesn't silently regress the ones already in use.
describe("hasTierPermission (regression: widened for canCreateEvents)", () => {
  it("returns correct values for canVote, canCreateProposals, and canCreateEvents on the same tier", async () => {
    const { hasTierPermission } = await import("../src/services/membershipService.js");

    const creatorCookie = await getAuthCookie();
    const { community } = await registerIdentity(creatorCookie);

    // DEFAULT_TIER (this file's "Regular" fixture): canVote true, canCreateProposals
    // false, canCreateEvents unset in the fixture -> schema default true.
    const memberAccount = privateKeyToAccount(`0x${"44".repeat(32)}`);
    const memberCookie = await authCookieFor(memberAccount);
    const joinRes = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: memberCookie },
    });
    expect(joinRes.status).toBe(200);

    await expect(hasTierPermission(community.id, memberAccount.address, "canVote")).resolves.toBe(true);
    await expect(hasTierPermission(community.id, memberAccount.address, "canCreateProposals")).resolves.toBe(false);
    await expect(hasTierPermission(community.id, memberAccount.address, "canCreateEvents")).resolves.toBe(true);
  });

  it("returns false for every permission on a wallet with no membership at all", async () => {
    const { hasTierPermission } = await import("../src/services/membershipService.js");

    const creatorCookie = await getAuthCookie();
    const { community } = await registerIdentity(creatorCookie);
    const strangerAddress = privateKeyToAccount(`0x${"55".repeat(32)}`).address;

    await expect(hasTierPermission(community.id, strangerAddress, "canVote")).resolves.toBe(false);
    await expect(hasTierPermission(community.id, strangerAddress, "canCreateProposals")).resolves.toBe(false);
    await expect(hasTierPermission(community.id, strangerAddress, "canCreateEvents")).resolves.toBe(false);
  });
});

describe("POST /api/communities/:id/join (FR-009 duplicate prevention)", () => {
  it("returns 409 when the wallet already holds a membership (the creator is auto-enrolled)", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(409);
  });
});

describe("GET /api/memberships/mine", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await app.request("/api/memberships/mine");
    expect(res.status).toBe(401);
  });

  it("returns the community ids the caller's wallet is a member of — the creator is auto-enrolled", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request("/api/memberships/mine", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { communityIds: string[] };
    expect(body.communityIds).toContain(community.id);
  });

  it("does not include a community the wallet never joined", async () => {
    const cookie = await getAuthCookie();
    await registerIdentity(cookie);

    const otherCookie = await authCookieFor(privateKeyToAccount(`0x${"55".repeat(32)}`));
    const res = await app.request("/api/memberships/mine", { headers: { Cookie: otherCookie } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { communityIds: string[] };
    expect(body.communityIds).toEqual([]);
  });
});

describe("GET /api/communities/:id/join-requests", () => {
  it("returns 403 for a non-authorized wallet", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const otherCookie = await authCookieFor(privateKeyToAccount(`0x${"44".repeat(32)}`));

    const res = await app.request(`/api/communities/${community.id}/join-requests`, {
      headers: { Cookie: otherCookie },
    });
    expect(res.status).toBe(403);
  });
});

// Eligibility-adapters review (2026-08-19) coverage.
describe("POST /:id/join — eligibility gating", () => {
  it("regression: with no eligibility ruleset configured (D4), the joiner lands in the community's default tier — same as before this feature existed", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const joinerAccount = privateKeyToAccount(`0x${"aa".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const res = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; tierLabel?: string };
    expect(body.status).toBe("approved");
    expect(body.tierLabel).toBe("Regular");
  });

  it("returns 403 with the adapter's reason when the wallet fails the community's eligibility ruleset", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const setRulesetRes = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "tier", config: { tierId: community.defaultTierId } }],
      }),
    });
    expect(setRulesetRes.status).toBe(201);

    const joinerAccount = privateKeyToAccount(`0x${"bb".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const res = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/not yet a member/i);
  });

  it("an eligible wallet resolving to a non-default tier lands in that tier on the instant-join (open policy) path", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const vipTierRes = await app.request(`/api/communities/${community.id}/tiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DEFAULT_TIER, label: "VIP" }),
    });
    const vipTier = ((await vipTierRes.json()) as { tier: { id: string } }).tier;

    const setRulesetRes = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "open", config: {}, targetTierId: vipTier.id }],
      }),
    });
    expect(setRulesetRes.status).toBe(201);

    const joinerAccount = privateKeyToAccount(`0x${"cc".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const res = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; tierLabel?: string };
    expect(body.tierLabel).toBe("VIP");
  });

  it("an eligible wallet resolving to a non-default tier lands in that tier on the pending-then-approve (approval policy) path (D7)", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie, { membershipPolicy: "approval" });

    const vipTierRes = await app.request(`/api/communities/${community.id}/tiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DEFAULT_TIER, label: "VIP" }),
    });
    const vipTier = ((await vipTierRes.json()) as { tier: { id: string } }).tier;

    const setRulesetRes = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "open", config: {}, targetTierId: vipTier.id }],
      }),
    });
    expect(setRulesetRes.status).toBe(201);

    const joinerAccount = privateKeyToAccount(`0x${"dd".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const joinRes = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(joinRes.status).toBe(200);
    const joinBody = (await joinRes.json()) as { status: string };
    expect(joinBody.status).toBe("pending");

    const listRes = await app.request(`/api/communities/${community.id}/join-requests`, {
      headers: { Cookie: cookie },
    });
    const { requests } = (await listRes.json()) as { requests: { id: string; walletAddress: string }[] };
    const request = requests.find((r) => r.walletAddress.toLowerCase() === joinerAccount.address.toLowerCase());
    expect(request).toBeTruthy();

    const approveRes = await app.request(`/api/communities/${community.id}/join-requests/${request!.id}/approve`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    expect(approveRes.status).toBe(200);

    const membershipRes = await app.request(`/api/communities/${community.id}/membership`, {
      headers: { Cookie: joinerCookie },
    });
    const membershipBody = (await membershipRes.json()) as { status: string; tierLabel?: string };
    expect(membershipBody.status).toBe("member");
    expect(membershipBody.tierLabel).toBe("VIP");
  });

  it("membershipPolicy: approval still runs eligibility BEFORE creating the pending request (D2 ordering) — an ineligible wallet gets 403, not a pending request", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie, { membershipPolicy: "approval" });

    const setRulesetRes = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "tier", config: { tierId: community.defaultTierId } }],
      }),
    });
    expect(setRulesetRes.status).toBe(201);

    const joinerAccount = privateKeyToAccount(`0x${"ee".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const res = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(res.status).toBe(403);

    const listRes = await app.request(`/api/communities/${community.id}/join-requests`, {
      headers: { Cookie: cookie },
    });
    const { requests } = (await listRes.json()) as { requests: unknown[] };
    expect(requests).toHaveLength(0);
  });
});

describe("DELETE /:id/tiers/:tierId — eligibility rule guard (D8)", () => {
  it("returns 409 when the tier is targeted by an eligibility rule", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const targetTierRes = await app.request(`/api/communities/${community.id}/tiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DEFAULT_TIER, label: "Targeted" }),
    });
    const targetTier = ((await targetTierRes.json()) as { tier: { id: string } }).tier;

    const setRulesetRes = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "open", config: {}, targetTierId: targetTier.id }],
      }),
    });
    expect(setRulesetRes.status).toBe(201);

    const deleteRes = await app.request(`/api/communities/${community.id}/tiers/${targetTier.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    expect(deleteRes.status).toBe(409);
    const body = (await deleteRes.json()) as { error: string };
    expect(body.error).toMatch(/targeted by an eligibility rule/i);
  });
});

// Eligibility-followups review (2026-08-19), D1 — live union eligibility fallback, end to end
// through the real HTTP union routes (found/invite/respond) and the join route.
describe("POST /:id/join — union eligibility fallback (2026-08-19 follow-up review, D1)", () => {
  async function foundUnion(cookie: string, foundingCommunityId: string) {
    const res = await app.request("/api/unions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ displayName: "Test Union", foundingCommunityId }),
    });
    expect(res.status).toBe(201);
    const { union } = (await res.json()) as { union: { id: string } };
    return union.id;
  }

  async function inviteAndAccept(cookie: string, unionId: string, actingCommunityId: string, communityId: string) {
    const inviteRes = await app.request(`/api/unions/${unionId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ communityId, actingCommunityId }),
    });
    expect(inviteRes.status).toBe(201);

    const respondRes = await app.request(`/api/unions/${unionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ communityId, accept: true }),
    });
    expect(respondRes.status).toBe(200);
  }

  it("trust-gap fix: a union sibling with NO configured ruleset does not extend eligibility", async () => {
    const adminCookie = await getAuthCookie();
    const { community: communityA } = await registerIdentity(adminCookie, { displayName: "Union A" });
    const { community: communityB } = await registerIdentity(adminCookie, {
      displayName: "Union B (Open, unconfigured)",
    });

    // A requires already holding its own default tier — a fresh wallet can never satisfy this
    // directly, isolating the test to whether the union fallback (incorrectly) grants access.
    const setRulesetRes = await app.request(`/api/communities/${communityA.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "tier", config: { tierId: communityA.defaultTierId } }],
      }),
    });
    expect(setRulesetRes.status).toBe(201);

    const unionId = await foundUnion(adminCookie, communityA.id);
    await inviteAndAccept(adminCookie, unionId, communityA.id, communityB.id);

    const joinerAccount = privateKeyToAccount(`0x${"13".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const res = await app.request(`/api/communities/${communityA.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(res.status).toBe(403);
  });

  it("a wallet ineligible for A directly, but eligible for an active union sibling with a configured ruleset, can join A via the fallback", async () => {
    const adminCookie = await getAuthCookie();
    const { community: communityA } = await registerIdentity(adminCookie, { displayName: "Union A2" });
    const { community: communityC } = await registerIdentity(adminCookie, { displayName: "Union C (configured Open)" });

    const setRulesetRes = await app.request(`/api/communities/${communityA.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "tier", config: { tierId: communityA.defaultTierId } }],
      }),
    });
    expect(setRulesetRes.status).toBe(201);

    // C has an EXPLICITLY configured ruleset (even though its one rule is "open") — this is a
    // real trust decision by C's own admin, distinct from B's unconfigured state above, so it
    // must extend eligibility to union siblings.
    const setSiblingRulesetRes = await app.request(`/api/communities/${communityC.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ rules: [{ groupIndex: 0, mechanism: "open", config: {} }] }),
    });
    expect(setSiblingRulesetRes.status).toBe(201);

    const unionId = await foundUnion(adminCookie, communityA.id);
    await inviteAndAccept(adminCookie, unionId, communityA.id, communityC.id);

    const joinerAccount = privateKeyToAccount(`0x${"ee".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const res = await app.request(`/api/communities/${communityA.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; tierLabel?: string };
    expect(body.status).toBe("approved");
    // Union-sourced eligibility never carries a foreign tier target — lands in A's own default.
    expect(body.tierLabel).toBe("Regular");
  });

  it("leaving the union narrows eligibility back down immediately, with no cleanup needed", async () => {
    const adminCookie = await getAuthCookie();
    const { community: communityA } = await registerIdentity(adminCookie, { displayName: "Union A3" });
    const { community: communityC } = await registerIdentity(adminCookie, { displayName: "Union C3" });

    await app.request(`/api/communities/${communityA.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "tier", config: { tierId: communityA.defaultTierId } }],
      }),
    });
    await app.request(`/api/communities/${communityC.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ rules: [{ groupIndex: 0, mechanism: "open", config: {} }] }),
    });

    const unionId = await foundUnion(adminCookie, communityA.id);
    await inviteAndAccept(adminCookie, unionId, communityA.id, communityC.id);

    const leaveRes = await app.request(`/api/unions/${unionId}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ communityId: communityC.id }),
    });
    expect(leaveRes.status).toBe(200);

    const joinerAccount = privateKeyToAccount(`0x${"dd".repeat(32)}`);
    const joinerCookie = await authCookieFor(joinerAccount);
    const res = await app.request(`/api/communities/${communityA.id}/join`, {
      method: "POST",
      headers: { Cookie: joinerCookie },
    });
    expect(res.status).toBe(403);
  });
});
