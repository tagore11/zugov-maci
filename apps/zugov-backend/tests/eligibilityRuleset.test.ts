import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCommunities, clearCredentials } from "./helpers/testDb.js";

process.env.CORS_ORIGIN ??= "http://localhost:5173";

// Same rationale as membership.test.ts: importing app pulls in the @pcd/zuauth chain, which
// fails to load under Vitest's Node ESM loader for reasons unrelated to eligibility rules.
vi.mock("@pcd/zuauth", () => ({
  default: {
    authenticate: vi.fn(),
    ETHBERLIN04: [],
  },
}));

const { app } = await import("../src/app.js");

const TEST_ACCOUNT = privateKeyToAccount(`0x${"66".repeat(32)}`);

const DEFAULT_TIER = {
  label: "Regular",
  canCreateProposals: false,
  canVote: true,
  canManageMembership: false,
};

const IDENTITY_BODY = {
  displayName: "Eligibility Ruleset Test Community",
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

  // allowJoin defaults to false for newly-created communities (Child C1, /plan-eng-review
  // 2026-08-24) — this file's grandfather test joins a second wallet to prove an existing member
  // isn't retroactively removed when the ruleset changes, so this helper opts every community it
  // creates into joinable-by-default via the real settings PATCH.
  await app.request(`/api/communities/${body.community.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ allowJoin: true }),
  });

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

describe("GET /api/communities/:id/eligibility-ruleset", () => {
  it("is public — no auth required — and returns an empty array for a community with no ruleset", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request(`/api/communities/${community.id}/eligibility-ruleset`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rules: unknown[] };
    expect(body.rules).toEqual([]);
  });
});

describe("POST /api/communities/:id/eligibility-ruleset", () => {
  it("returns 401 when unauthenticated", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: [] }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 for an authenticated wallet that isn't authorized on this community", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);
    const otherCookie = await authCookieFor(privateKeyToAccount(`0x${"77".repeat(32)}`));

    const res = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: otherCookie },
      body: JSON.stringify({ rules: [{ groupIndex: 0, mechanism: "open", config: {} }] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 422 for an unknown mechanism", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ rules: [{ groupIndex: 0, mechanism: "zupass", config: {} }] }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 for a malformed erc20_token config (bad address, non-numeric threshold)", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [
          {
            groupIndex: 0,
            mechanism: "erc20_token",
            config: { chainId: 534351, tokenAddress: "not-an-address", threshold: "abc" },
          },
        ],
      }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 201 and persists a valid ruleset for the community's creator", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    const res = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [{ groupIndex: 0, mechanism: "tier", config: { tierId: community.defaultTierId } }],
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { rules: { mechanism: string }[] };
    expect(body.rules).toHaveLength(1);
    expect(body.rules[0]?.mechanism).toBe("tier");

    const getRes = await app.request(`/api/communities/${community.id}/eligibility-ruleset`);
    const getBody = (await getRes.json()) as { rules: unknown[] };
    expect(getBody.rules).toHaveLength(1);
  });

  it("D3 grandfather: an existing member is not retroactively removed when the ruleset changes under them", async () => {
    const cookie = await getAuthCookie();
    const { community } = await registerIdentity(cookie);

    // A second wallet joins while the community is still Open (no ruleset yet).
    const memberAccount = privateKeyToAccount(`0x${"88".repeat(32)}`);
    const memberCookie = await authCookieFor(memberAccount);
    const joinRes = await app.request(`/api/communities/${community.id}/join`, {
      method: "POST",
      headers: { Cookie: memberCookie },
    });
    expect(joinRes.status).toBe(200);

    // Creator now locks the community down to an ERC20 gate the existing member could never
    // satisfy — this must not retroactively evict them.
    const setRes = await app.request(`/api/communities/${community.id}/eligibility-ruleset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        rules: [
          {
            groupIndex: 0,
            mechanism: "erc20_token",
            config: {
              chainId: 534351,
              tokenAddress: "0x000000000000000000000000000000000000dead",
              threshold: "999999999999999999999",
            },
          },
        ],
      }),
    });
    expect(setRes.status).toBe(201);

    const membershipRes = await app.request(`/api/communities/${community.id}/membership`, {
      headers: { Cookie: memberCookie },
    });
    const membershipBody = (await membershipRes.json()) as { status: string };
    expect(membershipBody.status).toBe("member");
  });
});
