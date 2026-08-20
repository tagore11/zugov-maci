import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { encodeFunctionResult } from "viem";
import { eq } from "drizzle-orm";
import { clearCommunities, testDb } from "./helpers/testDb.js";
import { communities, maciGovernanceConfigs, communityDecisionAdapters } from "../src/db/schema.js";

process.env.CORS_ORIGIN ??= "http://localhost:5173"; // pre-existing bug, see specs/003 research.md

// Real @pcd/zuauth fails to load under Vitest's Node ESM loader (see tests/membership.test.ts) —
// importing `app` pulls in routes/credentials.ts -> zupassAdapter.ts -> @pcd/zuauth transitively.
vi.mock("@pcd/zuauth", () => ({
  default: {
    authenticate: vi.fn(),
    ETHBERLIN04: [],
  },
}));

const verifyContractOwnerMock = vi.fn();
vi.mock("../src/services/contractOwnership.js", async () => {
  const actual = await vi.importActual<typeof import("../src/services/contractOwnership.js")>(
    "../src/services/contractOwnership.js",
  );
  return {
    ...actual,
    verifyContractOwner: (...args: unknown[]) => verifyContractOwnerMock(...args) as Promise<void>,
  };
});

// chainRpc.js reads its RPC_URLS map from process.env once at import time, so a test can't just
// set process.env — this lets each signUpPolicy reconciliation test control getRpcUrl's return
// value directly instead.
const getRpcUrlMock = vi.fn((_chainId: number) => null as string | null);
vi.mock("../src/services/chainRpc.js", async () => {
  const actual = await vi.importActual<typeof import("../src/services/chainRpc.js")>("../src/services/chainRpc.js");
  return {
    ...actual,
    getRpcUrl: (chainId: number) => getRpcUrlMock(chainId),
  };
});

const { app } = await import("../src/app.js");

const REGISTRANT = privateKeyToAccount(`0x${"66".repeat(32)}`);

async function authCookieFor(account: typeof REGISTRANT): Promise<string> {
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

const IDENTITY_BODY = {
  displayName: "Test Community",
  description: "A test community",
  membershipPolicy: "open",
  tierChangesRequireVote: false,
  tiers: [{ label: "Member", canCreateProposals: true, canVote: true, canManageMembership: true }],
  defaultTierLabel: "Member",
};

const GOVERNANCE_BODY = {
  contractAddress: "0xaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaA",
  chainId: 534351,
  allowedPolicies: [0, 1],
  supportedModes: [0],
  signUpPolicyType: "FreeForAll",
  signUpPolicyAddress: "0xcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC",
  maciDeploymentBlock: 100,
  stateTreeDepth: 6,
};

const POLL_DEPLOY_CONFIG = {
  coordinatorPublicKey: "macipk.842ada068e4156f836e02336160ae0172f0dd9b43280edeb4572c57793068dd3",
  treeDepths: {
    tallyProcessingStateTreeDepth: 1,
    voteOptionTreeDepth: 2,
    stateTreeDepth: 6,
  },
  messageBatchSize: 20,
  freeForAllPolicyFactory: "0x4dF289F131b388bC805995adBB1006471e2cEedD",
  freeForAllChecker: "0xa87fCEB0064f064b6a5Fa54AF85014a24ce99162",
  constantVoiceCreditProxyFactory: "0xF49949D519f0A321bb08b0ca94dEF40E98b663eF",
  initialVoiceCreditAmount: 100,
};

async function registerIdentity(
  cookie: string,
  overrides: Record<string, unknown> = {},
): Promise<{ res: Response; community: { id: string; governanceConfigured: boolean } }> {
  const res = await app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ ...IDENTITY_BODY, source: "wizard", ...overrides }),
  });
  const { community } = (await res.json()) as { community: { id: string; governanceConfigured: boolean } };
  return { res, community };
}

async function attachGovernance(
  cookie: string,
  id: string,
  overrides: Record<string, unknown> = {},
): Promise<Response> {
  return app.request(`/api/communities/${id}/governance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ ...GOVERNANCE_BODY, ...overrides }),
  });
}

// Full two-step wizard registration in one call — the common case for tests that don't care
// about the identity/governance split itself, just need a fully-configured community to exist.
async function registerFullCommunity(
  cookie: string,
  identityOverrides: Record<string, unknown> = {},
  governanceOverrides: Record<string, unknown> = {},
): Promise<{ id: string }> {
  const { community } = await registerIdentity(cookie, identityOverrides);
  const govRes = await attachGovernance(cookie, community.id, governanceOverrides);
  expect(govRes.status).toBe(201);
  return { id: community.id };
}

async function registerManualCommunity(cookie: string, id: string, overrides: Record<string, unknown> = {}) {
  return app.request("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      ...IDENTITY_BODY,
      ...GOVERNANCE_BODY,
      id,
      contractAddress: id,
      source: "manual",
      ...overrides,
    }),
  });
}

beforeEach(async () => {
  verifyContractOwnerMock.mockReset();
  verifyContractOwnerMock.mockResolvedValue(undefined);
  getRpcUrlMock.mockReset();
  getRpcUrlMock.mockReturnValue(null);
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

describe("GET /api/communities", () => {
  it("returns empty list when no communities", async () => {
    const res = await app.request("/api/communities");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { communities: unknown[]; total: number; hasMore: boolean };
    expect(Array.isArray(body.communities)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(0);
    expect(typeof body.hasMore).toBe("boolean");
  });

  it("accepts chainId filter query param", async () => {
    const res = await app.request("/api/communities?chainId=534351");
    expect(res.status).toBe(200);
  });

  it("clamps limit to 50", async () => {
    const res = await app.request("/api/communities?limit=999");
    expect(res.status).toBe(200);
  });

  it("includes ungoverned communities with governanceConfigured:false", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await app.request("/api/communities");
    const body = (await res.json()) as { communities: { id: string; governanceConfigured: boolean }[] };
    const found = body.communities.find((c) => c.id === community.id);
    expect(found?.governanceConfigured).toBe(false);
  });

  // Governance-restructure Phase 1 review (2026-08-20) — documents intentional behavior, not a
  // bug: chainId=X means "communities deployed on chain X," and an ungoverned community has no
  // chain at all, so excluding it here is correct. The real bug was a DIFFERENT call site
  // (the create-community wizard's parent-community picker, StepCommunityInfo.tsx) using this
  // chain-specific filter for a task — parent/child nesting — that has nothing to do with chain
  // at all. Fixed there by dropping the chainId argument, not by changing this filter's
  // semantics (see StepCommunityInfo.tsx's own comment for the frontend side of this fix).
  it("excludes an ungoverned community from a chainId-filtered listing (no chain to match against)", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await app.request("/api/communities?chainId=534351");
    const body = (await res.json()) as { communities: { id: string }[] };
    expect(body.communities.some((c) => c.id === community.id)).toBe(false);
  });
});

describe("GET /api/communities/:id", () => {
  it("returns 404 for unknown id", async () => {
    const res = await app.request("/api/communities/0x0000000000000000000000000000000000000000");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Community not found");
  });

  it("returns governanceConfigured:false and null governance fields for an identity-only community", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await app.request(`/api/communities/${community.id}`);
    const body = (await res.json()) as {
      community: { governanceConfigured: boolean; chainId: number | null; signUpPolicyType: string | null };
    };
    expect(body.community.governanceConfigured).toBe(false);
    expect(body.community.chainId).toBeNull();
    expect(body.community.signUpPolicyType).toBeNull();
  });

  it("returns governanceConfigured:true with governance fields once attached", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { id } = await registerFullCommunity(cookie);
    const res = await app.request(`/api/communities/${id}`);
    const body = (await res.json()) as {
      community: { governanceConfigured: boolean; chainId: number | null; contractAddress: string | null };
    };
    expect(body.community.governanceConfigured).toBe(true);
    expect(body.community.chainId).toBe(GOVERNANCE_BODY.chainId);
    expect(body.community.contractAddress).toBe(GOVERNANCE_BODY.contractAddress);
  });

  describe("creatorAddress reconciliation against the subgraph's owner", () => {
    const STALE_OWNER = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
    const NEW_OWNER = "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC";

    async function registerReadyCommunity(): Promise<string> {
      const cookie = await authCookieFor(REGISTRANT);
      const { id } = await registerFullCommunity(cookie);
      // POST always sets creatorAddress from the session wallet (REGISTRANT), never the client
      // body — simulate a stale row (contract ownership transferred after registration) plus a
      // ready subgraph directly, rather than waiting on the real fire-and-forget subgraph deploy
      // (which fails in this test env — no graph-node running).
      await testDb.update(communities).set({ creatorAddress: STALE_OWNER }).where(eq(communities.id, id));
      await testDb
        .update(maciGovernanceConfigs)
        .set({ subgraphName: `community-${GOVERNANCE_BODY.contractAddress.toLowerCase()}`, subgraphStatus: "ready" })
        .where(eq(maciGovernanceConfigs.communityId, id));
      return id;
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("updates creatorAddress when the subgraph reports a new on-chain owner", async () => {
      const id = await registerReadyCommunity();

      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: { maci: { owner: NEW_OWNER.toLowerCase() } } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(`/api/communities/${id}`);
      expect(res.status).toBe(200);
      const { community } = (await res.json()) as { community: { creatorAddress: string } };
      expect(community.creatorAddress).toBe(NEW_OWNER);

      const [row] = await testDb.select().from(communities).where(eq(communities.id, id)).limit(1);
      expect(row!.creatorAddress).toBe(NEW_OWNER);
    });

    it("leaves creatorAddress untouched when the subgraph reports the same owner", async () => {
      const id = await registerReadyCommunity();

      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: { maci: { owner: STALE_OWNER.toLowerCase() } } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(`/api/communities/${id}`);
      const { community } = (await res.json()) as { community: { creatorAddress: string } };
      expect(community.creatorAddress).toBe(STALE_OWNER);
    });

    it("does not query the subgraph when it isn't ready yet", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const { id } = await registerFullCommunity(cookie);

      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(`/api/communities/${id}`);
      const { community } = (await res.json()) as { community: { creatorAddress: string } };
      expect(community.creatorAddress).toBe(REGISTRANT.address);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not query the subgraph for an identity-only (ungoverned) community", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const { community } = await registerIdentity(cookie);

      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(`/api/communities/${community.id}`);
      expect(res.status).toBe(200);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("falls back to the stored creatorAddress when the subgraph is unreachable", async () => {
      const id = await registerReadyCommunity();

      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

      const res = await app.request(`/api/communities/${id}`);
      expect(res.status).toBe(200);
      const { community } = (await res.json()) as { community: { creatorAddress: string } };
      expect(community.creatorAddress).toBe(STALE_OWNER);
    });
  });

  describe("signUpPolicyType reconciliation against the chain", () => {
    const SIGN_UP_POLICY_ABI = [
      { type: "function", name: "signUpPolicy", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
    ] as const;
    const TRAIT_ABI = [
      { type: "function", name: "trait", stateMutability: "pure", inputs: [], outputs: [{ type: "string" }] },
    ] as const;
    const POLICY_ADDRESS = "0xDDdDddDdDdddDDddDDddDDDDdDdDDdDDdDDDDDDd";

    async function registerCommunityMissingPolicy(contractAddress: string): Promise<string> {
      const cookie = await authCookieFor(REGISTRANT);
      const { id } = await registerFullCommunity(cookie, {}, { contractAddress });
      // The Zod schema requires signUpPolicyType/Address, so simulate a legacy row (registered
      // before those fields were always known) by nulling them directly, same as the pre-split
      // test did against the old single-table schema.
      await testDb
        .update(maciGovernanceConfigs)
        .set({ signUpPolicyType: null, signUpPolicyAddress: null })
        .where(eq(maciGovernanceConfigs.communityId, id));
      return id;
    }

    function rpcResponder(result: `0x${string}`) {
      return async (_url: unknown, init?: RequestInit) => {
        const body = JSON.parse(init!.body as string) as { id: number };
        return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("backfills signUpPolicyType/Address by reading the contract when null", async () => {
      const id = await registerCommunityMissingPolicy("0x7777777777777777777777777777777777777776");
      getRpcUrlMock.mockReturnValue("http://localhost:8545");

      const fetchMock = vi
        .fn()
        .mockImplementationOnce(
          rpcResponder(
            encodeFunctionResult({
              abi: SIGN_UP_POLICY_ABI,
              functionName: "signUpPolicy",
              result: POLICY_ADDRESS,
            }),
          ),
        )
        .mockImplementationOnce(
          rpcResponder(encodeFunctionResult({ abi: TRAIT_ABI, functionName: "trait", result: "FreeForAll" })),
        );
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(`/api/communities/${id}`);
      expect(res.status).toBe(200);
      const { community } = (await res.json()) as {
        community: { signUpPolicyType: string | null; signUpPolicyAddress: string | null };
      };
      expect(community.signUpPolicyType).toBe("FreeForAll");
      expect(community.signUpPolicyAddress).toBe(POLICY_ADDRESS);

      const [row] = await testDb
        .select()
        .from(maciGovernanceConfigs)
        .where(eq(maciGovernanceConfigs.communityId, id))
        .limit(1);
      expect(row!.signUpPolicyType).toBe("FreeForAll");
    });

    it("leaves signUpPolicyType null when no RPC is configured for the chain", async () => {
      const id = await registerCommunityMissingPolicy("0x7777777777777777777777777777777777777777");
      getRpcUrlMock.mockReturnValue(null);

      const res = await app.request(`/api/communities/${id}`);
      expect(res.status).toBe(200);
      const { community } = (await res.json()) as { community: { signUpPolicyType: string | null } };
      expect(community.signUpPolicyType).toBeNull();
    });

    it("does not call the RPC when signUpPolicyType is already set", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const { id } = await registerFullCommunity(
        cookie,
        {},
        { contractAddress: "0x7777777777777777777777777777777777777778" },
      );
      getRpcUrlMock.mockReturnValue("http://localhost:8545");

      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(`/api/communities/${id}`);
      const { community } = (await res.json()) as { community: { signUpPolicyType: string | null } };
      expect(community.signUpPolicyType).toBe("FreeForAll");
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});

describe("POST /api/communities", () => {
  it("returns 401 without authentication", async () => {
    const res = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...IDENTITY_BODY, source: "wizard" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 422 for invalid payload", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const res = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ displayName: "" }),
    });
    expect(res.status).toBe(422);
  });

  it("uses the session wallet as creatorAddress, ignoring any client-supplied value", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { res, community: identity } = await registerIdentity(cookie);
    void res;
    const res2 = await app.request(`/api/communities/${identity.id}`);
    const { community } = (await res2.json()) as { community: { creatorAddress: string } };
    expect(community.creatorAddress.toLowerCase()).toBe(REGISTRANT.address.toLowerCase());
  });

  it("generates a server-side id for wizard-sourced communities, not client-supplied", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { res, community } = await registerIdentity(cookie);
    expect(res.status).toBe(201);
    expect(community.id).toBeTruthy();
    expect(community.governanceConfigured).toBe(false);
  });

  describe("source: manual (specs/002 FR-013 ownership verification)", () => {
    it("does not call verifyContractOwner for a wizard-sourced registration", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const { res } = await registerIdentity(cookie);
      expect(res.status).toBe(201);
      expect(verifyContractOwnerMock).not.toHaveBeenCalled();
    });

    it("registers with governance already attached when the session wallet is verified as owner", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockResolvedValue(undefined);
      const id = "0x222222222222222222222222222222222222222b";
      const res = await registerManualCommunity(cookie, id);
      expect(res.status).toBe(201);
      const { community } = (await res.json()) as { community: { governanceConfigured: boolean } };
      expect(community.governanceConfigured).toBe(true);
      expect(verifyContractOwnerMock).toHaveBeenCalledWith(GOVERNANCE_BODY.chainId, id, REGISTRANT.address);
    });

    it("returns 403 when the session wallet does not match the contract owner", async () => {
      const { OwnershipMismatchError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new OwnershipMismatchError(REGISTRANT.address, "0xSomeoneElse"));
      const res = await registerManualCommunity(cookie, "0x333333333333333333333333333333333333333c");
      expect(res.status).toBe(403);
    });

    it("returns 422 when the contract does not exist on the specified chain", async () => {
      const { ContractNotFoundError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new ContractNotFoundError("0xdead", 11155111));
      const res = await registerManualCommunity(cookie, "0x4444444444444444444444444444444444444d");
      expect(res.status).toBe(422);
    });

    it("returns 422 when the contract does not implement owner()", async () => {
      const { NotOwnableError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new NotOwnableError("0xnotownable"));
      const res = await registerManualCommunity(cookie, "0x5555555555555555555555555555555555555e");
      expect(res.status).toBe(422);
    });

    it("returns 503 when the RPC call fails", async () => {
      const { RpcUnavailableError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new RpcUnavailableError(11155111));
      const res = await registerManualCommunity(cookie, "0x666666666666666666666666666666666666666f");
      expect(res.status).toBe(503);
    });
  });

  describe("parentCommunityId (communities/sub-communities)", () => {
    async function registerParentIdentity(cookie: string): Promise<string> {
      const { res, community } = await registerIdentity(cookie);
      expect(res.status).toBe(201);
      return community.id;
    }

    it("registers a child with parentCommunityId and returns it on GET", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const parentId = await registerParentIdentity(cookie);

      const { res, community } = await registerIdentity(cookie, { parentCommunityId: parentId });
      expect(res.status).toBe(201);
      expect(community).toHaveProperty("id");
      const childId = community.id;

      const getRes = await app.request(`/api/communities/${childId}`);
      const { community: fetched } = (await getRes.json()) as { community: { parentCommunityId: string | null } };
      expect(fetched.parentCommunityId).toBe(parentId);
    });

    it("defaults parentCommunityId to null when not provided", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const parentId = await registerParentIdentity(cookie);
      const { community } = (await app.request(`/api/communities/${parentId}`).then((r) => r.json())) as {
        community: { parentCommunityId: string | null };
      };
      expect(community.parentCommunityId).toBeNull();
    });

    it("returns 422 when parentCommunityId equals the community's own id (manual source)", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const id = "0x7777777777777777777777777777777777777779";
      const res = await registerManualCommunity(cookie, id, { parentCommunityId: id });
      expect(res.status).toBe(422);
    });

    it("returns 422 when parentCommunityId does not reference an existing community", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          ...IDENTITY_BODY,
          source: "wizard",
          parentCommunityId: "0x9999999999999999999999999999999999999999",
        }),
      });
      expect(res.status).toBe(422);
    });
  });
});

describe("POST /api/communities/:id/governance", () => {
  it("returns 401 without authentication", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await app.request(`/api/communities/${community.id}/governance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(GOVERNANCE_BODY),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when the caller is not authorized on the community", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);

    const OTHER = privateKeyToAccount(`0x${"77".repeat(32)}`);
    const otherCookie = await authCookieFor(OTHER);
    const res = await attachGovernance(otherCookie, community.id);
    expect(res.status).toBe(403);
  });

  // Matches PATCH /:id's existing precedent: isAuthorized() runs before existence is checked,
  // so a nonexistent community reads as "not authorized" (there's no creatorAddress to match
  // against) rather than "not found" at the HTTP layer. attachGovernance()'s own
  // CommunityNotFoundError guard still exists as defense-in-depth below this route check.
  it("returns 403 for a nonexistent community (isAuthorized runs before the existence check)", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const res = await attachGovernance(cookie, "0x0000000000000000000000000000000000000000");
    expect(res.status).toBe(403);
  });

  it("returns 422 when contractAddress is missing", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const { contractAddress: _contractAddress, ...withoutAddress } = GOVERNANCE_BODY;
    const res = await attachGovernance(cookie, community.id, { ...withoutAddress, contractAddress: undefined });
    expect(res.status).toBe(422);
  });

  it("attaches governance and flips governanceConfigured to true", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await attachGovernance(cookie, community.id);
    expect(res.status).toBe(201);
    const { community: attached } = (await res.json()) as { community: { governanceConfigured: boolean } };
    expect(attached.governanceConfigured).toBe(true);
  });

  // Governance restructure Phase 1 (2026-08-20) — attachGovernance also registers "maci" as an
  // available decision adapter, which is what actually unblocks proposal creation now (see
  // proposalService's decision-adapter gate). Verified directly against the new table rather
  // than through proposal creation here, to keep this test scoped to attachGovernance's own
  // side effect.
  it("registers maci as an available decision adapter", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await attachGovernance(cookie, community.id);
    expect(res.status).toBe(201);

    const rows = await testDb
      .select()
      .from(communityDecisionAdapters)
      .where(eq(communityDecisionAdapters.communityId, community.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.adapterType).toBe("maci");
  });

  it("returns 409 on double-attach (race between two tabs finishing setup)", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const first = await attachGovernance(cookie, community.id);
    expect(first.status).toBe(201);
    const second = await attachGovernance(cookie, community.id);
    expect(second.status).toBe(409);
  });

  it("round-trips pollDeployConfig with full fidelity", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await attachGovernance(cookie, community.id, { pollDeployConfig: POLL_DEPLOY_CONFIG });
    expect(res.status).toBe(201);
    const { community: attached } = (await res.json()) as { community: { pollDeployConfig: unknown } };
    expect(attached.pollDeployConfig).toEqual(POLL_DEPLOY_CONFIG);

    const getRes = await app.request(`/api/communities/${community.id}`);
    const { community: fetched } = (await getRes.json()) as { community: { pollDeployConfig: unknown } };
    expect(fetched.pollDeployConfig).toEqual(POLL_DEPLOY_CONFIG);
  });

  it("returns 422 when pollDeployConfig is missing a field", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const { messageBatchSize: _messageBatchSize, ...partialConfig } = POLL_DEPLOY_CONFIG;
    const res = await attachGovernance(cookie, community.id, { pollDeployConfig: partialConfig });
    expect(res.status).toBe(422);
  });

  it("omits pollDeployConfig when not provided", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const res = await attachGovernance(cookie, community.id);
    expect(res.status).toBe(201);
    const { community: attached } = (await res.json()) as { community: { pollDeployConfig?: unknown } };
    expect(attached.pollDeployConfig).toBeFalsy();
  });
});

describe("GET /api/communities/:id/children", () => {
  it("returns 404 for a nonexistent parent", async () => {
    const res = await app.request("/api/communities/0x0000000000000000000000000000000000000000/children");
    expect(res.status).toBe(404);
  });

  it("returns an empty list for a community with no children", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community: parent } = await registerIdentity(cookie);
    const res = await app.request(`/api/communities/${parent.id}/children`);
    expect(res.status).toBe(200);
    const { communities: children } = (await res.json()) as { communities: unknown[] };
    expect(children).toEqual([]);
  });

  it("lists a registered child", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community: parent } = await registerIdentity(cookie);
    const { community: child } = await registerIdentity(cookie, { parentCommunityId: parent.id });

    const res = await app.request(`/api/communities/${parent.id}/children`);
    expect(res.status).toBe(200);
    const { communities: children } = (await res.json()) as { communities: { id: string }[] };
    expect(children).toHaveLength(1);
    expect(children[0]!.id).toBe(child.id);
  });
});

describe("category (specs/010 US5, FR-011/FR-012)", () => {
  it("round-trips a valid category through creation and GET", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { res, community } = await registerIdentity(cookie, { category: "network_state" });
    expect(res.status).toBe(201);

    const getRes = await app.request(`/api/communities/${community.id}`);
    const { community: fetched } = (await getRes.json()) as { community: { category: string | null } };
    expect(fetched.category).toBe("network_state");
  });

  it("defaults to null when no category is provided", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);
    const getRes = await app.request(`/api/communities/${community.id}`);
    const { community: fetched } = (await getRes.json()) as { community: { category: string | null } };
    expect(fetched.category).toBeNull();
  });

  it("returns 422 for an invalid category value", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const res = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...IDENTITY_BODY, source: "wizard", category: "not-a-real-category" }),
    });
    expect(res.status).toBe(422);
  });

  it("round-trips a category update via PATCH", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie, { category: "social" });

    const patchRes = await app.request(`/api/communities/${community.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ category: "regional" }),
    });
    expect(patchRes.status).toBe(200);
    const { community: updated } = (await patchRes.json()) as { community: { category: string | null } };
    expect(updated.category).toBe("regional");
  });
});

describe("PATCH /api/communities/:id — directDeploymentEnabled (specs/007 US1, FR-001/FR-002)", () => {
  const NON_ADMIN = privateKeyToAccount(`0x${"88".repeat(32)}`);

  it("defaults to false and round-trips true then false", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);

    const initialRes = await app.request(`/api/communities/${community.id}`);
    const { community: initial } = (await initialRes.json()) as { community: { directDeploymentEnabled: boolean } };
    expect(initial.directDeploymentEnabled).toBe(false);

    const enableRes = await app.request(`/api/communities/${community.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ directDeploymentEnabled: true }),
    });
    expect(enableRes.status).toBe(200);
    const { community: enabled } = (await enableRes.json()) as { community: { directDeploymentEnabled: boolean } };
    expect(enabled.directDeploymentEnabled).toBe(true);

    const disableRes = await app.request(`/api/communities/${community.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ directDeploymentEnabled: false }),
    });
    const { community: disabled } = (await disableRes.json()) as { community: { directDeploymentEnabled: boolean } };
    expect(disabled.directDeploymentEnabled).toBe(false);
  });

  it("returns 403 when a non-admin attempts to change it", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { community } = await registerIdentity(cookie);

    const nonAdminCookie = await authCookieFor(NON_ADMIN);
    const res = await app.request(`/api/communities/${community.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: nonAdminCookie },
      body: JSON.stringify({ directDeploymentEnabled: true }),
    });
    expect(res.status).toBe(403);
  });
});
