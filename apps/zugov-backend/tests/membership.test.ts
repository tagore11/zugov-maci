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
  canCreateGovernanceActions: false,
  canVote: true,
  canManageMembership: false,
};

const VALID_COMMUNITY_BODY = {
  id: "0xbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB",
  chainId: 534351,
  displayName: "Test Membership Community",
  creatorAddress: TEST_ACCOUNT.address,
  allowedPolicies: [0],
  supportedModes: [0],
  voterCapacityPreset: "small",
  stateTreeDepth: 6,
  source: "wizard",
  membershipPolicy: "open",
  tierChangesRequireVote: false,
  tiers: [DEFAULT_TIER],
  defaultTierLabel: "Regular",
};

async function getAuthCookie(): Promise<string> {
  const nonceRes = await app.request("/api/auth/nonce");
  const cookie = nonceRes.headers.get("set-cookie")!.split(";")[0]!;
  const { nonce } = (await nonceRes.json()) as { nonce: string };

  const siweMessage = new SiweMessage({
    domain: "localhost",
    address: TEST_ACCOUNT.address,
    statement: "Sign in with Ethereum to ZuGov",
    uri: "http://localhost:5173",
    version: "1",
    chainId: 534351,
    nonce,
  });
  const message = siweMessage.prepareMessage();
  const signature = await TEST_ACCOUNT.signMessage({ message });

  const verifyRes = await app.request("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ message, signature }),
  });
  expect(verifyRes.status).toBe(200);
  return verifyRes.headers.get("set-cookie")!.split(";")[0]!;
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
    const res = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(VALID_COMMUNITY_BODY),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { community: { defaultTierId: string } };
    expect(body.community.defaultTierId).toBeTruthy();
  });
});

describe("GET /api/communities/:id/tiers", () => {
  it("returns tiers with isDefault set for the community's default tier", async () => {
    const cookie = await getAuthCookie();
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(VALID_COMMUNITY_BODY),
    });

    const res = await app.request(`/api/communities/${VALID_COMMUNITY_BODY.id}/tiers`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tiers: { label: string; isDefault: boolean }[] };
    const regular = body.tiers.find((t) => t.label === "Regular");
    expect(regular?.isDefault).toBe(true);
  });
});

describe("Tier mutation authority (FR-008, FR-011)", () => {
  it("returns 403 when a non-authorized wallet attempts to create a tier", async () => {
    const cookie = await getAuthCookie();
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...VALID_COMMUNITY_BODY,
        id: "0xcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC",
        creatorAddress: "0x1111111111111111111111111111111111111e", // NOT the session's own address
      }),
    });

    const res = await app.request("/api/communities/0xcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC/tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(DEFAULT_TIER),
    });
    expect(res.status).toBe(403);
  });

  it("returns 409 when tierChangesRequireVote is true", async () => {
    const cookie = await getAuthCookie();
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...VALID_COMMUNITY_BODY,
        id: "0xdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdD",
        tierChangesRequireVote: true,
      }),
    });

    const res = await app.request("/api/communities/0xdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdD/tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(DEFAULT_TIER),
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/community vote/);
  });
});

describe("POST /api/communities/:id/join (FR-009 duplicate prevention)", () => {
  it("returns 409 when the wallet already holds a membership (the creator is auto-enrolled)", async () => {
    const cookie = await getAuthCookie();
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(VALID_COMMUNITY_BODY),
    });

    const res = await app.request(`/api/communities/${VALID_COMMUNITY_BODY.id}/join`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(409);
  });
});

describe("GET /api/communities/:id/join-requests", () => {
  it("returns 403 for a non-authorized wallet", async () => {
    const cookie = await getAuthCookie();
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...VALID_COMMUNITY_BODY,
        id: "0xeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeE",
        creatorAddress: "0x1111111111111111111111111111111111111e",
      }),
    });

    const res = await app.request("/api/communities/0xeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeE/join-requests", {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(403);
  });
});
