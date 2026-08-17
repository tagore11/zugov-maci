import { publicEncrypt } from "node:crypto";
import { hashMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Every real community registered so far is on Sepolia, and apps/coordinator's own hardhat
// config (apps/coordinator/hardhat.config.cjs) only supports a single configured RPC network —
// it cannot serve multiple chains at once. See deploy/docker-compose.yml's coordinator service.
export const COORDINATOR_CHAIN = "sepolia";

const COORDINATOR_URL = process.env.COORDINATOR_URL;
const CALLER_PRIVATE_KEY = process.env.COORDINATOR_CALLER_PRIVATE_KEY;

// The auth message coordinator expects is a fixed literal string, not a nonce — the resulting
// signature/digest pair (and therefore the token) never changes for a given wallet, so it's
// cached for the process lifetime instead of recomputed per call. See
// apps/coordinator/tests/utils.ts's getAuthorizationHeader and
// apps/coordinator/ts/auth/AccountSignatureGuard.service.ts for the server-side counterpart.
let cachedAuthHeader: string | null = null;

async function fetchCoordinatorPublicKey(): Promise<string> {
  const res = await fetch(`${COORDINATOR_URL}/v1/proof/publicKey`);
  if (!res.ok) throw new Error(`Failed to fetch coordinator public key: ${res.status}`);
  const { publicKey } = (await res.json()) as { publicKey: string };
  return publicKey;
}

async function buildAuthHeader(): Promise<string> {
  if (!CALLER_PRIVATE_KEY) throw new Error("COORDINATOR_CALLER_PRIVATE_KEY is not configured");

  const account = privateKeyToAccount(CALLER_PRIVATE_KEY as `0x${string}`);
  const signature = await account.signMessage({ message: "message" });
  // ethers' getBytes(hashMessage(...)).toString("hex") on the coordinator/caller side produces
  // the same plain (no "0x") lowercase hex string as stripping viem's hashMessage prefix here.
  const digest = hashMessage("message").slice(2);
  const publicKey = await fetchCoordinatorPublicKey();
  const encrypted = publicEncrypt(publicKey, Buffer.from(`${signature}:${digest}`)).toString("base64");
  return `Bearer ${encrypted}`;
}

async function getAuthHeader(): Promise<string> {
  cachedAuthHeader ??= await buildAuthHeader();
  return cachedAuthHeader;
}

async function callCoordinator<T>(path: string, body: unknown): Promise<T> {
  if (!COORDINATOR_URL) throw new Error("COORDINATOR_URL is not configured");

  const request = async (authHeader: string) =>
    fetch(`${COORDINATOR_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify(body),
    });

  let res = await request(await getAuthHeader());
  if (res.status === 401) {
    // The coordinator's RSA keypair is regenerated on every image rebuild (see
    // apps/coordinator/Dockerfile's `generate-keypair` step) — a stale cached token from before
    // a rebuild would be encrypted with a public key the service no longer holds. Refetch once.
    cachedAuthHeader = null;
    res = await request(await getAuthHeader());
  }

  if (!res.ok) {
    throw new Error(`Coordinator ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export interface TallyPipelineArgs {
  /** The community's MACI contract address. */
  maciContractAddress: string;
  /** The poll's on-chain sequential ID (not its contract address). */
  pollId: number;
  /** DomainObjs.Mode value the poll was deployed with (see useDeployPoll.ts's EMode). */
  mode: number;
}

export interface TallyPipelineResult {
  tallyData: unknown;
}

/** Runs merge → generate → submit in sequence against the coordinator service. Each step is a
 * long-running, synchronous HTTP call (no job-queue/polling on the coordinator's side) — the
 * caller is responsible for running this off the request/response cycle (see tallyService.ts). */
export async function runTallyPipeline(args: TallyPipelineArgs): Promise<TallyPipelineResult> {
  const { maciContractAddress, pollId, mode } = args;

  await callCoordinator<boolean>("/v1/proof/merge", {
    maciContractAddress,
    pollId,
    chain: COORDINATOR_CHAIN,
  });

  await callCoordinator<{ tallyData: unknown }>("/v1/proof/generate", {
    maciContractAddress,
    poll: pollId,
    mode,
    chain: COORDINATOR_CHAIN,
  });

  const tallyData = await callCoordinator<unknown>("/v1/proof/submit", {
    maciContractAddress,
    pollId,
    chain: COORDINATOR_CHAIN,
  });

  return { tallyData };
}
