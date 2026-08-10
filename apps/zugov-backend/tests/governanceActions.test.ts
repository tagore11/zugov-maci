import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCommunities, clearCredentials } from "./helpers/testDb.js";

process.env.CORS_ORIGIN ??= "http://localhost:5173"; // pre-existing bug, see specs/003 research.md

// See tests/membership.test.ts — real @pcd/zuauth fails to load under Vitest's Node ESM loader;
// mocked here purely to avoid that broken import chain (unrelated to governance-action logic).
vi.mock("@pcd/zuauth", () => ({
  default: {
    authenticate: vi.fn(),
    ETHBERLIN04: [],
  },
}));

const { app } = await import("../src/app.js");

const CREATOR = privateKeyToAccount(`0x${"33".repeat(32)}`);
const SPONSOR = privateKeyToAccount(`0x${"44".repeat(32)}`);
const OUTSIDER = privateKeyToAccount(`0x${"55".repeat(32)}`);

const CREATE_TIER = {
  label: "Creator",
  canCreateGovernanceActions: true,
  canVote: true,
  canManageMembership: false,
};
const VOTER_TIER = {
  label: "Voter",
  canCreateGovernanceActions: false,
  canVote: true,
  canManageMembership: false,
};
const NO_RIGHTS_TIER = {
  label: "Guest",
  canCreateGovernanceActions: false,
  canVote: false,
  canManageMembership: false,
};

function communityBody(overrides: Record<string, unknown> = {}) {
  return {
    id: "0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
    chainId: 534351,
    displayName: "Test Governance Community",
    creatorAddress: CREATOR.address,
    allowedPolicies: [0],
    supportedModes: [0],
    voterCapacityPreset: "small",
    stateTreeDepth: 6,
    source: "wizard",
    membershipPolicy: "open",
    tierChangesRequireVote: false,
    tiers: [CREATE_TIER],
    defaultTierLabel: "Creator",
    ...overrides,
  };
}

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

const DRAFT_BODY = {
  title: "Fund the community garden",
  description: "A proposal to fund the community garden project.",
  privacy: "privacy_preserving",
  executionLocation: "onchain",
  tallyMechanism: "simple",
  eligibleTierIds: [] as string[], // filled per-test once tier IDs are known
};

async function createCommunityWithTiers(
  cookie: string,
  communityId: string,
  tiers: (typeof CREATE_TIER)[] = [CREATE_TIER, VOTER_TIER],
) {
  await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(communityBody({ id: communityId, tiers, defaultTierLabel: tiers[0]!.label })),
  });
  const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
  const { tiers: created } = (await tiersRes.json()) as {
    tiers: { id: string; label: string }[];
  };
  return Object.fromEntries(created.map((t) => [t.label, t.id]));
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

describe("POST /api/communities/:id/governance-actions (US1, FR-001/FR-002/FR-003)", () => {
  it("returns 401 without authentication", async () => {
    const res = await app.request("/api/communities/0xdead/governance-actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DRAFT_BODY),
    });
    expect(res.status).toBe(401);
  });

  it("creates a draft with auto-sponsorship when the creator's tier grants the right", async () => {
    const communityId = "0xB000000000000000000000000000000000000001";
    const cookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { sponsorCount: number; thresholdMet: boolean };
    expect(body.sponsorCount).toBe(1);
    expect(body.thresholdMet).toBe(true); // default cosponsorshipThreshold is 0
  });

  it("returns 403 when the creator's tier lacks canCreateGovernanceActions", async () => {
    const communityId = "0xB000000000000000000000000000000000000002";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    // Manually add SPONSOR as a member on the no-rights tier via a join-request style flow isn't
    // available for a specific tier assignment in this API surface, so we assert directly against
    // a wallet with zero membership at all — the same rejection path (no tier => no permission).
    const sponsorCookie = await authCookieFor(SPONSOR);
    const res = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sponsorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(403);
  });

  it("enrolls the creator in a full-permission tier, not the default tier meant for new joiners", async () => {
    const communityId = "0xB000000000000000000000000000000000000099";
    const cookie = await authCookieFor(CREATOR);

    // Mirrors the real wizard's default tier set: "Regular" (the default tier assigned to new
    // joiners) lacks canCreateGovernanceActions, while a separate "Admin" tier has full rights.
    // The creator must land in "Admin", not "Regular", or they'd be locked out of their own
    // community's governance actions.
    const REGULAR_TIER = {
      label: "Regular",
      canCreateGovernanceActions: false,
      canVote: true,
      canManageMembership: false,
    };
    const ADMIN_TIER = { label: "Admin", canCreateGovernanceActions: true, canVote: true, canManageMembership: true };

    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(
        communityBody({ id: communityId, tiers: [REGULAR_TIER, ADMIN_TIER], defaultTierLabel: "Regular" }),
      ),
    });

    const tiersRes = await app.request(`/api/communities/${communityId}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;

    const res = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [adminTierId] }),
    });
    expect(res.status).toBe(201);
  });

  it("returns 422 for a non-executable axis combination", async () => {
    const communityId = "0xB000000000000000000000000000000000000003";
    const cookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...DRAFT_BODY,
        privacy: "public",
        eligibleTierIds: [tierIds["Voter"]],
      }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 when an eligible tier lacks canVote", async () => {
    const communityId = "0xB000000000000000000000000000000000000004";
    const cookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(cookie, communityId, [CREATE_TIER, NO_RIGHTS_TIER]);

    const res = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Guest"]] }),
    });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/communities/:id/governance-actions/:actionId/sponsor (US2, FR-004)", () => {
  it("dedupes a repeat sponsor without double-counting", async () => {
    const communityId = "0xB000000000000000000000000000000000000005";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    // Includes the Creator tier as eligible (not just Voter) so the creator's own re-sponsor call
    // below is a legitimate sponsorship attempt, not one rejected for tier ineligibility — there's
    // no API surface in this test to assign a wallet to a specific non-default tier, so idempotency
    // is exercised via the creator's own membership instead.
    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Creator"], tierIds["Voter"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    const res1 = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/sponsor`,
      { method: "POST", headers: { Cookie: creatorCookie } },
    );
    expect(res1.status).toBe(200);
    const body1 = (await res1.json()) as { sponsorCount: number };
    expect(body1.sponsorCount).toBe(1); // already auto-sponsored at creation — no double count

    const res2 = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/sponsor`,
      { method: "POST", headers: { Cookie: creatorCookie } },
    );
    const body2 = (await res2.json()) as { sponsorCount: number };
    expect(body2.sponsorCount).toBe(1);
  });

  it("returns 403 when the sponsor's tier isn't eligible", async () => {
    const communityId = "0xB000000000000000000000000000000000000006";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    const outsiderCookie = await authCookieFor(OUTSIDER);
    const res = await app.request(`/api/communities/${communityId}/governance-actions/${governanceAction.id}/sponsor`, {
      method: "POST",
      headers: { Cookie: outsiderCookie },
    });
    expect(res.status).toBe(403);
  });
});

describe("POST /api/communities/:id/governance-actions/:actionId/formalize/authorize (US2, FR-007)", () => {
  it("returns 409 when the co-sponsorship threshold isn't met", async () => {
    const communityId = "0xB000000000000000000000000000000000000007";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    // Set a threshold of 2 (creator alone won't meet it) via PATCH
    await app.request(`/api/communities/${communityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ cosponsorshipThreshold: 2 }),
    });

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/authorize`,
      { method: "POST", headers: { Cookie: creatorCookie } },
    );
    expect(res.status).toBe(409);
  });

  it("returns 200 authorized when threshold is 0 (default)", async () => {
    const communityId = "0xB000000000000000000000000000000000000008";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/authorize`,
      { method: "POST", headers: { Cookie: creatorCookie } },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { authorized: boolean };
    expect(body.authorized).toBe(true);
  });
});

describe("POST /api/communities/:id/governance-actions/:actionId/formalize/confirm (US2, FR-008/FR-009)", () => {
  it("formalizes and locks the action when checks pass", async () => {
    const communityId = "0xB000000000000000000000000000000000000009";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: creatorCookie },
        body: JSON.stringify({ pollAddress: "0xPoll", pollId: "0", txHash: "0xTx" }),
      },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { governanceAction: { status: string; pollAddress: string } };
    expect(body.governanceAction.status).toBe("formalized");
    expect(body.governanceAction.pollAddress).toBe("0xPoll");
  });
});

describe("GET /api/communities/:id/governance-actions/:actionId/vote-eligibility (US3, FR-010/FR-011)", () => {
  it("returns not_formalized for a still-draft action", async () => {
    const communityId = "0xB00000000000000000000000000000000000000a";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/vote-eligibility`,
      { headers: { Cookie: creatorCookie } },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { eligible: boolean; reason?: string };
    expect(body.eligible).toBe(false);
    expect(body.reason).toBe("not_formalized");
  });

  it("returns eligible: true for a qualifying member on a formalized action", async () => {
    const communityId = "0xB00000000000000000000000000000000000000b";
    const creatorCookie = await authCookieFor(CREATOR);
    const tierIds = await createCommunityWithTiers(creatorCookie, communityId);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Creator"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    await app.request(`/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ pollAddress: "0xPoll", pollId: "0", txHash: "0xTx" }),
    });

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/vote-eligibility`,
      { headers: { Cookie: creatorCookie } },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { eligible: boolean };
    expect(body.eligible).toBe(true);
  });

  it("returns 401 without authentication", async () => {
    const res = await app.request("/api/communities/0xdead/governance-actions/0xdead/vote-eligibility");
    expect(res.status).toBe(401);
  });
});
