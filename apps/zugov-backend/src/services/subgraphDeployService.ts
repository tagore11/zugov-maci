import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { communities } from "../db/schema.js";
import { getNetworkName } from "./chainRpc.js";

const execFileAsync = promisify(execFile);

// Set by deploy/docker-compose.yml (the subgraph package bundled into this
// container's image, see apps/zugov-backend/Dockerfile) and reachable over
// the compose network — defaults match local dev via apps/subgraph/docker-compose.yaml.
const SUBGRAPH_DIR = process.env.SUBGRAPH_DIR ?? "../subgraph";
const GRAPH_NODE_ADMIN_URL = process.env.GRAPH_NODE_ADMIN_URL ?? "http://localhost:8020";
const GRAPH_NODE_IPFS_URL = process.env.GRAPH_NODE_IPFS_URL ?? "http://localhost:5001";
const GRAPH_NODE_QUERY_URL = process.env.GRAPH_NODE_QUERY_URL ?? "http://localhost:8000";

export function subgraphNameFor(communityId: string): string {
  return `community-${communityId.toLowerCase()}`;
}

export function subgraphQueryUrlFor(subgraphName: string): string {
  return `${GRAPH_NODE_QUERY_URL}/subgraphs/name/${subgraphName}`;
}

// Fire-and-forget: a subgraph deploy failure must never fail community
// registration. Failures are recorded on the row (subgraphStatus: "failed")
// for the retry route to pick up instead of being thrown into the caller.
export async function deployCommunitySubgraph(communityId: string, chainId: number, startBlock: number): Promise<void> {
  const network = getNetworkName(chainId);
  const name = subgraphNameFor(communityId);

  if (!network) {
    console.error(`[subgraphDeployService] No network configured for chainId ${chainId} (community ${communityId})`);
    await db.update(communities).set({ subgraphStatus: "failed" }).where(eq(communities.id, communityId));
    return;
  }

  try {
    await execFileAsync(
      "node",
      [
        "scripts/deploy-community.mjs",
        "--address",
        communityId,
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
      .update(communities)
      .set({ subgraphName: name, subgraphStatus: "ready" })
      .where(eq(communities.id, communityId));
  } catch (err) {
    console.error(`[subgraphDeployService] Deploy failed for community ${communityId}:`, err);
    await db.update(communities).set({ subgraphStatus: "failed" }).where(eq(communities.id, communityId));
  }
}
