import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { encodeFunctionResult } from "viem";
import { eq } from "drizzle-orm";
import { clearCommunities, testDb } from "./helpers/testDb.js";
import { communities } from "../src/db/schema.js";

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

const TEST_COMMUNITY = {
  id: "0xaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaA",
  chainId: 534351,
  displayName: "Test Community",
  description: "A test community",
  creatorAddress: "0xbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB",
  allowedPolicies: [0, 1],
  supportedModes: [0],
  signUpPolicyType: "FreeForAll",
  signUpPolicyAddress: "0xcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC",
  maciDeploymentBlock: 100,
  stateTreeDepth: 6,
  source: "wizard",
};

const FULL_COMMUNITY = {
  ...TEST_COMMUNITY,
  membershipPolicy: "open",
  tierChangesRequireVote: false,
  tiers: [{ label: "Member", canCreateGovernanceActions: true, canVote: true, canManageMembership: true }],
  defaultTierLabel: "Member",
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
});

describe("GET /api/communities/:id", () => {
  it("returns 404 for unknown address", async () => {
    const res = await app.request("/api/communities/0x0000000000000000000000000000000000000000");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Community not found");
  });

  describe("creatorAddress reconciliation against the subgraph's owner", () => {
    const STALE_OWNER = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
    const NEW_OWNER = "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC";

    async function registerReadyCommunity(id: string): Promise<void> {
      const cookie = await authCookieFor(REGISTRANT);
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id, source: "wizard" }),
      });
      expect(res.status).toBe(201);
      // POST always sets creatorAddress from the session wallet (REGISTRANT), never the client
      // body — simulate a stale row (contract ownership transferred after registration) plus a
      // ready subgraph directly, rather than waiting on the real fire-and-forget subgraph deploy
      // (which fails in this test env — no graph-node running).
      await testDb
        .update(communities)
        .set({
          creatorAddress: STALE_OWNER,
          subgraphName: `community-${id.toLowerCase()}`,
          subgraphStatus: "ready",
        })
        .where(eq(communities.id, id));
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("updates creatorAddress when the subgraph reports a new on-chain owner", async () => {
      const id = "0x7777777777777777777777777777777777777771";
      await registerReadyCommunity(id);

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
      const id = "0x7777777777777777777777777777777777777772";
      await registerReadyCommunity(id);

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
      const id = "0x7777777777777777777777777777777777777773";
      await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id, creatorAddress: STALE_OWNER, source: "wizard" }),
      });

      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(`/api/communities/${id}`);
      const { community } = (await res.json()) as { community: { creatorAddress: string } };
      expect(community.creatorAddress).toBe(REGISTRANT.address);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("falls back to the stored creatorAddress when the subgraph is unreachable", async () => {
      const id = "0x7777777777777777777777777777777777777774";
      await registerReadyCommunity(id);

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

    async function registerCommunityMissingPolicy(id: string): Promise<void> {
      const now = Math.floor(Date.now() / 1000);
      await testDb.insert(communities).values({
        id,
        chainId: 534351,
        displayName: "Legacy Community",
        creatorAddress: REGISTRANT.address,
        governanceType: "maci",
        allowedPolicies: JSON.stringify([0, 1]),
        supportedModes: JSON.stringify([0]),
        signUpPolicyType: null,
        signUpPolicyAddress: null,
        stateTreeDepth: 6,
        subgraphStatus: "pending",
        createdAt: now,
        registeredAt: now,
      });
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
      const id = "0x7777777777777777777777777777777777777776";
      await registerCommunityMissingPolicy(id);
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

      const [row] = await testDb.select().from(communities).where(eq(communities.id, id)).limit(1);
      expect(row!.signUpPolicyType).toBe("FreeForAll");
    });

    it("leaves signUpPolicyType null when no RPC is configured for the chain", async () => {
      const id = "0x7777777777777777777777777777777777777777";
      await registerCommunityMissingPolicy(id);
      getRpcUrlMock.mockReturnValue(null);

      const res = await app.request(`/api/communities/${id}`);
      expect(res.status).toBe(200);
      const { community } = (await res.json()) as { community: { signUpPolicyType: string | null } };
      expect(community.signUpPolicyType).toBeNull();
    });

    it("does not call the RPC when signUpPolicyType is already set", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const id = "0x7777777777777777777777777777777777777778";
      await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id, source: "wizard" }),
      });
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
      body: JSON.stringify(TEST_COMMUNITY),
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
    const id = "0xbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb2";
    const res = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      // Deliberately spoofing a different creatorAddress in the body.
      body: JSON.stringify({ ...FULL_COMMUNITY, id, creatorAddress: "0x9999999999999999999999999999999999999999" }),
    });
    expect(res.status).toBe(201);
    const { community } = (await res.json()) as { community: { creatorAddress: string } };
    expect(community.creatorAddress.toLowerCase()).toBe(REGISTRANT.address.toLowerCase());
  });

  it("round-trips pollDeployConfig with full fidelity", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const id = "0xcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC";
    const registerRes = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id, pollDeployConfig: POLL_DEPLOY_CONFIG }),
    });
    expect(registerRes.status).toBe(201);
    const { community: registered } = (await registerRes.json()) as { community: { pollDeployConfig: unknown } };
    expect(registered.pollDeployConfig).toEqual(POLL_DEPLOY_CONFIG);

    const getRes = await app.request(`/api/communities/${id}`);
    const { community: fetched } = (await getRes.json()) as { community: { pollDeployConfig: unknown } };
    expect(fetched.pollDeployConfig).toEqual(POLL_DEPLOY_CONFIG);
  });

  it("returns 422 when pollDeployConfig is missing a field", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const { messageBatchSize: _messageBatchSize, ...partialConfig } = POLL_DEPLOY_CONFIG;
    const res = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...FULL_COMMUNITY,
        id: "0xdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdDdD",
        pollDeployConfig: partialConfig,
      }),
    });
    expect(res.status).toBe(422);
  });

  it("omits pollDeployConfig when not provided at registration", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const id = "0xeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeE";
    const registerRes = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id }),
    });
    expect(registerRes.status).toBe(201);
    const { community } = (await registerRes.json()) as { community: { pollDeployConfig?: unknown } };
    expect(community.pollDeployConfig).toBeFalsy();
  });

  it("does not alter a persisted pollDeployConfig on a duplicate registration", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const id = "0xfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfF";
    const first = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id, pollDeployConfig: POLL_DEPLOY_CONFIG }),
    });
    expect(first.status).toBe(201);

    // Second registration for the same id, with no pollDeployConfig at all — must not clear it.
    const second = await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id }),
    });
    expect(second.status).toBe(200);
    const { community } = (await second.json()) as { community: { pollDeployConfig: unknown } };
    expect(community.pollDeployConfig).toEqual(POLL_DEPLOY_CONFIG);
  });

  describe("source: manual (specs/002 FR-013 ownership verification)", () => {
    it("does not call verifyContractOwner for a wizard-sourced registration", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: "0x111111111111111111111111111111111111111a", source: "wizard" }),
      });
      expect(res.status).toBe(201);
      expect(verifyContractOwnerMock).not.toHaveBeenCalled();
    });

    it("registers when the session wallet is verified as the contract owner", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockResolvedValue(undefined);
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: "0x222222222222222222222222222222222222222b", source: "manual" }),
      });
      expect(res.status).toBe(201);
      expect(verifyContractOwnerMock).toHaveBeenCalledWith(
        FULL_COMMUNITY.chainId,
        "0x222222222222222222222222222222222222222b",
        REGISTRANT.address,
      );
    });

    it("returns 403 when the session wallet does not match the contract owner", async () => {
      const { OwnershipMismatchError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new OwnershipMismatchError(REGISTRANT.address, "0xSomeoneElse"));
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: "0x333333333333333333333333333333333333333c", source: "manual" }),
      });
      expect(res.status).toBe(403);
    });

    it("returns 422 when the contract does not exist on the specified chain", async () => {
      const { ContractNotFoundError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new ContractNotFoundError("0xdead", 11155111));
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: "0x4444444444444444444444444444444444444d", source: "manual" }),
      });
      expect(res.status).toBe(422);
    });

    it("returns 422 when the contract does not implement owner()", async () => {
      const { NotOwnableError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new NotOwnableError("0xnotownable"));
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: "0x5555555555555555555555555555555555555e", source: "manual" }),
      });
      expect(res.status).toBe(422);
    });

    it("returns 503 when the RPC call fails", async () => {
      const { RpcUnavailableError } = await import("../src/services/contractOwnership.js");
      const cookie = await authCookieFor(REGISTRANT);
      verifyContractOwnerMock.mockRejectedValue(new RpcUnavailableError(11155111));
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: "0x666666666666666666666666666666666666666f", source: "manual" }),
      });
      expect(res.status).toBe(503);
    });
  });

  describe("parentCommunityId (communities/sub-communities)", () => {
    const PARENT_ID = "0x7777777777777777777777777777777777777779";
    const CHILD_ID = "0x777777777777777777777777777777777777777a";

    async function registerParent(cookie: string): Promise<void> {
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: PARENT_ID }),
      });
      expect(res.status).toBe(201);
    }

    it("registers a child with parentCommunityId and returns it on GET", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      await registerParent(cookie);

      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: CHILD_ID, parentCommunityId: PARENT_ID }),
      });
      expect(res.status).toBe(201);
      const { community } = (await res.json()) as { community: { parentCommunityId: string | null } };
      expect(community.parentCommunityId?.toLowerCase()).toBe(PARENT_ID.toLowerCase());

      const getRes = await app.request(`/api/communities/${CHILD_ID}`);
      const { community: fetched } = (await getRes.json()) as { community: { parentCommunityId: string | null } };
      expect(fetched.parentCommunityId?.toLowerCase()).toBe(PARENT_ID.toLowerCase());
    });

    it("defaults parentCommunityId to null when not provided", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      await registerParent(cookie);
      const { community } = (await app.request(`/api/communities/${PARENT_ID}`).then((r) => r.json())) as {
        community: { parentCommunityId: string | null };
      };
      expect(community.parentCommunityId).toBeNull();
    });

    it("returns 422 when parentCommunityId equals the community's own id", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...FULL_COMMUNITY, id: PARENT_ID, parentCommunityId: PARENT_ID }),
      });
      expect(res.status).toBe(422);
    });

    it("returns 422 when parentCommunityId does not reference an existing community", async () => {
      const cookie = await authCookieFor(REGISTRANT);
      const res = await app.request("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          ...FULL_COMMUNITY,
          id: CHILD_ID,
          parentCommunityId: "0x9999999999999999999999999999999999999999",
        }),
      });
      expect(res.status).toBe(422);
    });
  });
});

describe("GET /api/communities/:id/children", () => {
  const PARENT_ID = "0x8888888888888888888888888888888888888803";
  const CHILD_ID = "0x8888888888888888888888888888888888888804";

  it("returns 404 for a nonexistent parent", async () => {
    const res = await app.request(`/api/communities/${PARENT_ID}/children`);
    expect(res.status).toBe(404);
  });

  it("returns an empty list for a community with no children", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id: PARENT_ID }),
    });
    const res = await app.request(`/api/communities/${PARENT_ID}/children`);
    expect(res.status).toBe(200);
    const { communities: children } = (await res.json()) as { communities: unknown[] };
    expect(children).toEqual([]);
  });

  it("lists a registered child", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id: PARENT_ID }),
    });
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id: CHILD_ID, parentCommunityId: PARENT_ID }),
    });

    const res = await app.request(`/api/communities/${PARENT_ID}/children`);
    expect(res.status).toBe(200);
    const { communities: children } = (await res.json()) as { communities: { id: string }[] };
    expect(children).toHaveLength(1);
    expect(children[0]!.id.toLowerCase()).toBe(CHILD_ID.toLowerCase());
  });
});

describe("PATCH /api/communities/:id — directDeploymentEnabled (specs/007 US1, FR-001/FR-002)", () => {
  const NON_ADMIN = privateKeyToAccount(`0x${"88".repeat(32)}`);

  it("defaults to false and round-trips true then false", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const id = "0x8888888888888888888888888888888888888801";
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id }),
    });

    const initialRes = await app.request(`/api/communities/${id}`);
    const { community: initial } = (await initialRes.json()) as { community: { directDeploymentEnabled: boolean } };
    expect(initial.directDeploymentEnabled).toBe(false);

    const enableRes = await app.request(`/api/communities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ directDeploymentEnabled: true }),
    });
    expect(enableRes.status).toBe(200);
    const { community: enabled } = (await enableRes.json()) as { community: { directDeploymentEnabled: boolean } };
    expect(enabled.directDeploymentEnabled).toBe(true);

    const disableRes = await app.request(`/api/communities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ directDeploymentEnabled: false }),
    });
    const { community: disabled } = (await disableRes.json()) as { community: { directDeploymentEnabled: boolean } };
    expect(disabled.directDeploymentEnabled).toBe(false);
  });

  it("returns 403 when a non-admin attempts to change it", async () => {
    const cookie = await authCookieFor(REGISTRANT);
    const id = "0x8888888888888888888888888888888888888802";
    await app.request("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...FULL_COMMUNITY, id }),
    });

    const nonAdminCookie = await authCookieFor(NON_ADMIN);
    const res = await app.request(`/api/communities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: nonAdminCookie },
      body: JSON.stringify({ directDeploymentEnabled: true }),
    });
    expect(res.status).toBe(403);
  });
});
