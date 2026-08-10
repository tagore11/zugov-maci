import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SiweMessage, generateNonce } from "siwe";
import { privateKeyToAccount } from "viem/accounts";
import { clearCredentials } from "./helpers/testDb.js";

// Pre-existing bug found while running this test suite (2026-08-04): Hono's cors()
// middleware in src/index.ts crashes on every request when CORS_ORIGIN is unset — masked
// previously because the DB client construction failed first. Not fixed here (out of this
// feature's scope, affects all routes); worked around in-test so this suite can run.
process.env.CORS_ORIGIN ??= "http://localhost:5173";

const authenticateMock = vi.fn();
vi.mock("@pcd/zuauth", () => ({
  default: {
    authenticate: (...args: unknown[]) => authenticateMock(...args),
    ETHBERLIN04: [],
  },
}));

const verifyComponentsMock = vi.fn();
vi.mock("openac-sdk", () => ({
  OpenAC: {
    init: async () => ({
      loadKeysFromUrl: async () => ({ verifyingKeys: () => ({}) }),
      verifyComponents: (...args: unknown[]) => verifyComponentsMock(...args),
    }),
  },
  base64Decode: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
}));

const { app } = await import("../src/app.js");

const TEST_ACCOUNT = privateKeyToAccount(`0x${"11".repeat(32)}`);

const ZKID_PAYLOAD = {
  prepareProof: "AA==",
  prepareInstance: "AA==",
  showProof: "AA==",
  showInstance: "AA==",
};

/** Builds a real, signed SIWE session cookie — no database involved (session is cookie-only). */
async function getAuthCookie(): Promise<string> {
  const nonceRes = await app.request("/api/auth/nonce");
  const cookieHeader = nonceRes.headers.get("set-cookie")!;
  const cookie = cookieHeader.split(";")[0]!;
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
  authenticateMock.mockReset();
  verifyComponentsMock.mockReset();
  try {
    await clearCredentials();
  } catch {
    // db may not be available in unit test runs without TEST_DATABASE_URL
  }
});

afterAll(async () => {
  try {
    await clearCredentials();
  } catch {}
});

describe("GET /api/credentials", () => {
  it("returns 401 without authentication", async () => {
    const res = await app.request("/api/credentials");
    expect(res.status).toBe(401);
  });

  it("returns both protocols as unverified with null lastCheckedAt when no rows exist", async () => {
    const cookie = await getAuthCookie();
    const res = await app.request("/api/credentials", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      credentials: { protocol: string; status: string; lastCheckedAt: number | null }[];
    };
    expect(body.credentials).toEqual(
      expect.arrayContaining([
        { protocol: "zupass", status: "unverified", lastCheckedAt: null },
        { protocol: "zkid", status: "unverified", lastCheckedAt: null },
      ]),
    );
  });
});

describe("POST /api/credentials/:protocol/verify", () => {
  it("returns 404 for an unsupported protocol", async () => {
    const cookie = await getAuthCookie();
    const res = await app.request("/api/credentials/eas/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Unsupported protocol: eas");
  });

  it("returns 401 without authentication", async () => {
    const res = await app.request("/api/credentials/zkid/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ZKID_PAYLOAD),
    });
    expect(res.status).toBe(401);
  });

  it("returns verified when the mocked zkID proof is valid", async () => {
    const cookie = await getAuthCookie();
    verifyComponentsMock.mockResolvedValue({ valid: true, expressionResult: true });

    const res = await app.request("/api/credentials/zkid/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(ZKID_PAYLOAD),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { protocol: string; status: string };
    expect(body).toMatchObject({ protocol: "zkid", status: "verified" });
    expect(verifyComponentsMock).toHaveBeenCalledOnce();
  });

  it("returns unverified (not expired) when a never-verified zkID proof fails", async () => {
    const cookie = await getAuthCookie();
    verifyComponentsMock.mockResolvedValue({ valid: false, expressionResult: false });

    const res = await app.request("/api/credentials/zkid/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(ZKID_PAYLOAD),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { protocol: string; status: string };
    expect(body).toMatchObject({ protocol: "zkid", status: "unverified" });
  });

  it("returns expired when a previously-verified zkID credential fails a re-check", async () => {
    const cookie = await getAuthCookie();

    verifyComponentsMock.mockResolvedValueOnce({ valid: true, expressionResult: true });
    const firstRes = await app.request("/api/credentials/zkid/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(ZKID_PAYLOAD),
    });
    expect((await firstRes.json()) as { status: string }).toMatchObject({ status: "verified" });

    verifyComponentsMock.mockResolvedValueOnce({ valid: false, expressionResult: false });
    const secondRes = await app.request("/api/credentials/zkid/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(ZKID_PAYLOAD),
    });

    expect(secondRes.status).toBe(200);
    const body = (await secondRes.json()) as { protocol: string; status: string };
    expect(body).toMatchObject({ protocol: "zkid", status: "expired" });
  });

  it("returns 400 when the zupass adapter throws on a malformed payload", async () => {
    const cookie = await getAuthCookie();
    const res = await app.request("/api/credentials/zupass/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ notAString: true }), // zupassAdapter requires proofPayload to be a string
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Invalid proof payload");
  });
});
