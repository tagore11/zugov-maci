import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { maciGovernanceConfigs } from "../db/schema.js";
import { getNetworkName } from "./chainRpc.js";

const execFileAsync = promisify(execFile);

// Set by deploy/docker-compose.yml (the subgraph package bundled into this
// container's image, see apps/zugov-backend/Dockerfile) and reachable over
// the compose network — defaults match local dev via apps/subgraph/docker-compose.yaml.
const SUBGRAPH_DIR = process.env.SUBGRAPH_DIR ?? "../subgraph";
const GRAPH_NODE_ADMIN_URL = process.env.GRAPH_NODE_ADMIN_URL ?? "http://localhost:8020";
const GRAPH_NODE_IPFS_URL = process.env.GRAPH_NODE_IPFS_URL ?? "http://localhost:5001";
const GRAPH_NODE_QUERY_URL = process.env.GRAPH_NODE_QUERY_URL ?? "http://localhost:8000";

export function subgraphNameFor(contractAddress: string): string {
  return `community-${contractAddress.toLowerCase()}`;
}

export function subgraphQueryUrlFor(subgraphName: string): string {
  return `${GRAPH_NODE_QUERY_URL}/subgraphs/name/${subgraphName}`;
}

// Fire-and-forget: a subgraph deploy failure must never fail community registration or
// governance attach. Failures are recorded on the governance row (subgraphStatus: "failed")
// for the retry route to pick up instead of being thrown into the caller.
//
// communityId and contractAddress are deliberately separate params (Architecture 1C): status
// writes go to maciGovernanceConfigs, keyed by communityId (the identity's stable PK), while
// the actual on-chain indexing target passed to the deploy script is contractAddress — a
// community's id is no longer guaranteed to be a deployed contract's address.
export async function deployCommunitySubgraph(
  communityId: string,
  contractAddress: string,
  chainId: number,
  startBlock: number,
): Promise<void> {
  const network = getNetworkName(chainId);
  const name = subgraphNameFor(contractAddress);

  if (!network) {
    console.error(`[subgraphDeployService] No network configured for chainId ${chainId} (community ${communityId})`);
    await db
      .update(maciGovernanceConfigs)
      .set({ subgraphStatus: "failed" })
      .where(eq(maciGovernanceConfigs.communityId, communityId));
    return;
  }

  try {
    await execFileAsync(
      "node",
      [
        "scripts/deploy-community.mjs",
        "--address",
        contractAddress,
        "--start-block",
        String(startBlock),
        "--network",
        network,
        "--name",
        name,
        "--admin-url",
        GRAPH_NODE_ADMIN_URL,
        "--ipfs-url",
        GRAPH_NODE_IPFS_URL,
      ],
      { cwd: SUBGRAPH_DIR, timeout: 5 * 60 * 1000 },
    );
    await db
      .update(maciGovernanceConfigs)
      .set({ subgraphName: name, subgraphStatus: "ready" })
      .where(eq(maciGovernanceConfigs.communityId, communityId));
  } catch (err) {
    console.error(`[subgraphDeployService] Deploy failed for community ${communityId}:`, err);
    await db
      .update(maciGovernanceConfigs)
      .set({ subgraphStatus: "failed" })
      .where(eq(maciGovernanceConfigs.communityId, communityId));
  }
}
