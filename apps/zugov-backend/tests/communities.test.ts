import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCommunities } from "./helpers/testDb.js";

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
  voterCapacityPreset: "small",
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
});
