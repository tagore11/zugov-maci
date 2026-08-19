import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCommunities, clearCredentials, testDb } from "./helpers/testDb.js";
import * as schema from "../src/db/schema.js";

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

// Governance actions (drafts, sponsorship, formalize, vote-eligibility) are purely tier/
// membership bookkeeping — governanceActionService never touches MACI/governance-config fields
// (formalize just records a caller-supplied pollAddress/pollId; the actual on-chain deploy
// happens elsewhere). Every community in this file is identity-only, no governance attached.
function identityBody(overrides: Record<string, unknown> = {}) {
  return {
    displayName: "Test Governance Community",
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
  tiers: (typeof CREATE_TIER)[] = [CREATE_TIER, VOTER_TIER],
): Promise<{ communityId: string; tierIds: Record<string, string> }> {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(identityBody({ tiers, defaultTierLabel: tiers[0]!.label })),
  });
  const { community } = (await res.json()) as { community: { id: string } };
  const tiersRes = await app.request(`/api/communities/${community.id}/tiers`);
  const { tiers: created } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
  return { communityId: community.id, tierIds: Object.fromEntries(created.map((t) => [t.label, t.id])) };
}

async function enableDirectDeployment(cookie: string, communityId: string): Promise<void> {
  await app.request(`/api/communities/${communityId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ directDeploymentEnabled: true }),
  });
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
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(cookie);

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
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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

    const res0 = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(identityBody({ tiers: [REGULAR_TIER, ADMIN_TIER], defaultTierLabel: "Regular" })),
    });
    const { community } = (await res0.json()) as { community: { id: string } };

    const tiersRes = await app.request(`/api/communities/${community.id}/tiers`);
    const { tiers } = (await tiersRes.json()) as { tiers: { id: string; label: string }[] };
    const adminTierId = tiers.find((t) => t.label === "Admin")!.id;

    const res = await app.request(`/api/communities/${community.id}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [adminTierId] }),
    });
    expect(res.status).toBe(201);
  });

  it("returns 422 for a non-executable axis combination", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(cookie);

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
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(cookie, [CREATE_TIER, NO_RIGHTS_TIER]);

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
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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
        body: JSON.stringify({
          pollAddress: "0xPoll",
          pollId: "0",
          txHash: "0xTx",
          pollStartDate: 1000,
          pollEndDate: 2000,
        }),
      },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { governanceAction: { status: string; pollAddress: string } };
    expect(body.governanceAction.status).toBe("formalized");
    expect(body.governanceAction.pollAddress).toBe("0xPoll");
  });

  it("persists the poll's option labels (specs/010 US1, FR-001/FR-002)", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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
        body: JSON.stringify({
          pollAddress: "0xPoll",
          pollId: "0",
          txHash: "0xTx",
          pollStartDate: 1000,
          pollEndDate: 2000,
          options: ["Fund the greenhouse", "Fund the library"],
        }),
      },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { governanceAction: { options: string[] | null } };
    expect(body.governanceAction.options).toEqual(["Fund the greenhouse", "Fund the library"]);
  });
});

describe("GET /api/communities/:id/governance-actions/:actionId/vote-eligibility (US3, FR-010/FR-011)", () => {
  it("returns not_formalized for a still-draft action", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

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
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Creator"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    await app.request(`/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: Math.floor(Date.now() / 1000),
        pollEndDate: Math.floor(Date.now() / 1000) + 3600,
      }),
    });

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/vote-eligibility`,
      { headers: { Cookie: creatorCookie } },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { eligible: boolean };
    expect(body.eligible).toBe(true);
  });

  it("returns eligible: true for a voting-tier member excluded from the draft-time eligible tiers", async () => {
    // Regression: confirmFormalize used to persist only the tiers picked at draft creation, so a
    // voting-capable member left out of that original selection stayed locked out forever, even
    // though the real on-chain poll (via the deployed eligibility policy) doesn't enforce that
    // narrower set. confirmFormalize now stamps every voting-capable tier at formalization time.
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      // Only the Creator tier is selected at draft time — the Voter tier is deliberately excluded.
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Creator"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    // Enroll SPONSOR on the excluded Voter tier directly — the public /join flow always lands new
    // members on the community's default tier, so there's no API surface to pick a specific tier.
    await testDb.insert(schema.memberships).values({
      walletAddress: SPONSOR.address,
      communityId,
      tierId: tierIds["Voter"]!,
      joinedAt: Math.floor(Date.now() / 1000),
    });

    await app.request(`/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: Math.floor(Date.now() / 1000),
        pollEndDate: Math.floor(Date.now() / 1000) + 3600,
      }),
    });

    const sponsorCookie = await authCookieFor(SPONSOR);
    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/vote-eligibility`,
      { headers: { Cookie: sponsorCookie } },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { eligible: boolean };
    expect(body.eligible).toBe(true);
  });

  it("returns poll_closed once the poll's end date has passed", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Creator"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    await app.request(`/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: Math.floor(Date.now() / 1000) - 7200,
        pollEndDate: Math.floor(Date.now() / 1000) - 3600,
      }),
    });

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/vote-eligibility`,
      { headers: { Cookie: creatorCookie } },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { eligible: boolean; reason?: string };
    expect(body.eligible).toBe(false);
    expect(body.reason).toBe("poll_closed");
  });

  it("returns poll_not_started before the poll's start date", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Creator"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    await app.request(`/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: Math.floor(Date.now() / 1000) + 3600,
        pollEndDate: Math.floor(Date.now() / 1000) + 7200,
      }),
    });

    const res = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/vote-eligibility`,
      { headers: { Cookie: creatorCookie } },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { eligible: boolean; reason?: string };
    expect(body.eligible).toBe(false);
    expect(body.reason).toBe("poll_not_started");
  });

  it("returns 401 without authentication", async () => {
    const res = await app.request("/api/communities/0xdead/governance-actions/0xdead/vote-eligibility");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/communities/:id/governance-actions/direct/authorize (specs/007 US2, FR-004/FR-005/FR-006)", () => {
  it("returns 200 authorized for an eligible member", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);
    await enableDirectDeployment(creatorCookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/governance-actions/direct/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { authorized: boolean };
    expect(body.authorized).toBe(true);
  });

  it("returns 403 when the community's directDeploymentEnabled is false", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

    const res = await app.request(`/api/communities/${communityId}/governance-actions/direct/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 403 when the caller's tier lacks canCreateGovernanceActions", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);
    await enableDirectDeployment(creatorCookie, communityId);

    const outsiderCookie = await authCookieFor(OUTSIDER);
    const res = await app.request(`/api/communities/${communityId}/governance-actions/direct/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: outsiderCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 422 for a non-executable axis combination", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);
    await enableDirectDeployment(creatorCookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/governance-actions/direct/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, privacy: "public", eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 when an eligible tier lacks canVote", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie, [CREATE_TIER, NO_RIGHTS_TIER]);
    await enableDirectDeployment(creatorCookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/governance-actions/direct/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Guest"]] }),
    });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/communities/:id/governance-actions/direct/confirm (specs/007 US2, FR-004/FR-007/FR-010)", () => {
  it("inserts a formalized, direct-path governance action with no sponsor row", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);
    await enableDirectDeployment(creatorCookie, communityId);

    const confirmRes = await app.request(`/api/communities/${communityId}/governance-actions/direct/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({
        ...DRAFT_BODY,
        eligibleTierIds: [tierIds["Voter"]],
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: 1000,
        pollEndDate: 2000,
      }),
    });
    expect(confirmRes.status).toBe(201);
    const { governanceAction } = (await confirmRes.json()) as {
      governanceAction: { id: string; status: string; creationPath: string; pollAddress: string };
    };
    expect(governanceAction.status).toBe("formalized");
    expect(governanceAction.creationPath).toBe("direct");
    expect(governanceAction.pollAddress).toBe("0xPoll");

    const getRes = await app.request(`/api/communities/${communityId}/governance-actions/${governanceAction.id}`, {
      headers: { Cookie: creatorCookie },
    });
    const getBody = (await getRes.json()) as { sponsorCount: number };
    expect(getBody.sponsorCount).toBe(0);
  });

  it("persists the poll's option labels (specs/010 US1, FR-001/FR-002)", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);
    await enableDirectDeployment(creatorCookie, communityId);

    const confirmRes = await app.request(`/api/communities/${communityId}/governance-actions/direct/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({
        ...DRAFT_BODY,
        eligibleTierIds: [tierIds["Voter"]],
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: 1000,
        pollEndDate: 2000,
        options: ["Yes", "No"],
      }),
    });
    expect(confirmRes.status).toBe(201);
    const { governanceAction } = (await confirmRes.json()) as { governanceAction: { options: string[] | null } };
    expect(governanceAction.options).toEqual(["Yes", "No"]);
  });

  it("returns 403 and leaves no record when directDeploymentEnabled is false", async () => {
    const creatorCookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(creatorCookie);

    const res = await app.request(`/api/communities/${communityId}/governance-actions/direct/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: creatorCookie },
      body: JSON.stringify({
        ...DRAFT_BODY,
        eligibleTierIds: [tierIds["Voter"]],
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: 1000,
        pollEndDate: 2000,
      }),
    });
    expect(res.status).toBe(403);

    const listRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      headers: { Cookie: creatorCookie },
    });
    const { governanceActions } = (await listRes.json()) as { governanceActions: unknown[] };
    expect(governanceActions).toHaveLength(0);
  });
});

describe("Draft/direct mutual exclusion (specs/007 US3, FR-003/FR-008/FR-009)", () => {
  it("still creates a draft normally when directDeploymentEnabled is false (regression)", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(cookie);

    const res = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { governanceAction: { status: string }; sponsorCount: number };
    expect(body.governanceAction.status).toBe("draft");
    expect(body.sponsorCount).toBe(1);
  });

  it("returns 403 for draft creation once directDeploymentEnabled is true", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(cookie);
    await enableDirectDeployment(cookie, communityId);

    const res = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 403 for direct/authorize and direct/confirm when directDeploymentEnabled is false", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(cookie);

    const authRes = await app.request(`/api/communities/${communityId}/governance-actions/direct/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    expect(authRes.status).toBe(403);

    const confirmRes = await app.request(`/api/communities/${communityId}/governance-actions/direct/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...DRAFT_BODY,
        eligibleTierIds: [tierIds["Voter"]],
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: 1000,
        pollEndDate: 2000,
      }),
    });
    expect(confirmRes.status).toBe(403);
  });

  it("lets a draft created before the toggle still formalize normally after it's flipped", async () => {
    const cookie = await authCookieFor(CREATOR);
    const { communityId, tierIds } = await createCommunityWithTiers(cookie);

    const createRes = await app.request(`/api/communities/${communityId}/governance-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...DRAFT_BODY, eligibleTierIds: [tierIds["Voter"]] }),
    });
    const { governanceAction } = (await createRes.json()) as { governanceAction: { id: string } };

    // Flip the toggle after the draft already exists — must not retroactively affect it (FR-008).
    await enableDirectDeployment(cookie, communityId);

    const authorizeRes = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/authorize`,
      { method: "POST", headers: { Cookie: cookie } },
    );
    expect(authorizeRes.status).toBe(200);

    const confirmRes = await app.request(
      `/api/communities/${communityId}/governance-actions/${governanceAction.id}/formalize/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          pollAddress: "0xPoll",
          pollId: "0",
          txHash: "0xTx",
          pollStartDate: 1000,
          pollEndDate: 2000,
        }),
      },
    );
    expect(confirmRes.status).toBe(200);
    const body = (await confirmRes.json()) as { governanceAction: { status: string } };
    expect(body.governanceAction.status).toBe("formalized");
  });
});
