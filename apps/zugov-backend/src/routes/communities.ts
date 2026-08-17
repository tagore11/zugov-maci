import { Hono } from "hono";
import { z } from "zod";
import { communityBodySchema } from "../validators/communitySchema.js";
import * as communityService from "../services/communityService.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import { isAuthorized } from "../services/membershipService.js";
import {
  verifyContractOwner,
  ContractNotFoundError,
  NotOwnableError,
  OwnershipMismatchError,
  RpcUnavailableError,
} from "../services/contractOwnership.js";
import { deployCommunitySubgraph, subgraphQueryUrlFor } from "../services/subgraphDeployService.js";

const communityUpdateSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().optional(),
  membershipPolicy: z.enum(["open", "approval"]).optional(),
  tierChangesRequireVote: z.boolean().optional(),
  defaultTierLabel: z.string().min(1).optional(),
  cosponsorshipThreshold: z.number().int().min(0).optional(),
  directDeploymentEnabled: z.boolean().optional(),
});

export const communitiesRouter = new Hono();

communitiesRouter.get("/", async (c) => {
  const pageStr = c.req.query("page") ?? "1";
  const limitStr = c.req.query("limit") ?? "20";
  const chainIdStr = c.req.query("chainId");
  const creatorAddress = c.req.query("creatorAddress");

  const page = Math.max(1, Number(pageStr));
  const limit = Math.min(50, Math.max(1, Number(limitStr)));
  const chainId = chainIdStr !== undefined ? Number(chainIdStr) : undefined;

  const result = await communityService.list(page, limit, chainId, creatorAddress);
  return c.json(result);
});

communitiesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const community = await communityService.get(id);
  if (!community) {
    return c.json({ error: "Community not found" }, 404);
  }
  const withCreator = await communityService.reconcileCreatorAddress(community);
  const reconciled = await communityService.reconcileSignUpPolicy(withCreator);
  return c.json({ community: reconciled });
});

// specs/002 FR-002/FR-013: the registering wallet MUST have an active SIWE session, and for the
// "manual" (register-existing-contract) source specifically, that session wallet MUST match the
// contract's on-chain owner() before the registration is accepted. The wizard source is exempt
// from the owner() check (the deploying wallet is provably the owner by construction) but still
// requires a session, per FR-002.
communitiesRouter.post("/", requireAuth, async (c) => {
  const body = await c.req.json();
  const parsed = communityBodySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  // Never trust a client-supplied creatorAddress — the session's authenticated wallet is the
  // only legitimate source of truth for who is registering this community.
  const data = { ...parsed.data, creatorAddress: session.address! };

  if (data.source === "manual") {
    try {
      await verifyContractOwner(data.chainId, data.id, session.address!);
    } catch (err) {
      if (err instanceof ContractNotFoundError) {
        return c.json({ error: err.message }, 422);
      }
      if (err instanceof NotOwnableError) {
        return c.json({ error: err.message }, 422);
      }
      if (err instanceof RpcUnavailableError) {
        return c.json({ error: `${err.message} — please retry` }, 503);
      }
      if (err instanceof OwnershipMismatchError) {
        return c.json({ error: err.message }, 403);
      }
      throw err;
    }
  }

  const { community, created } = await communityService.create(data);
  return c.json({ community }, created ? 201 : 200);
});

communitiesRouter.patch("/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const session = await getSession(c);
  if (!(await isAuthorized(id, session.address!))) {
    return c.json({ error: "Not authorized to edit this community" }, 403);
  }

  const body = await c.req.json();
  const parsed = communityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  try {
    const community = await communityService.update(id, parsed.data);
    if (!community) return c.json({ error: "Community not found" }, 404);
    return c.json({ community });
  } catch (err) {
    if (err instanceof communityService.TierLabelNotFoundError) {
      return c.json({ error: err.message }, 422);
    }
    throw err;
  }
});

// Transparent proxy in front of the community's isolated subgraph deployment — the frontend
// never needs to know graph-node's internal address or the per-community subgraph name.
communitiesRouter.post("/:id/subgraph/query", async (c) => {
  const id = c.req.param("id");
  const community = await communityService.get(id);
  if (!community) return c.json({ error: "Community not found" }, 404);
  if (community.subgraphStatus !== "ready" || !community.subgraphName) {
    return c.json({ error: "Subgraph not ready for this community" }, 503);
  }

  const body = await c.req.text();
  const response = await fetch(subgraphQueryUrlFor(community.subgraphName), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
});

communitiesRouter.post("/:id/subgraph/retry", requireAuth, async (c) => {
  const id = c.req.param("id");
  const session = await getSession(c);
  if (!(await isAuthorized(id, session.address!))) {
    return c.json({ error: "Not authorized to manage this community" }, 403);
  }

  const community = await communityService.get(id);
  if (!community) return c.json({ error: "Community not found" }, 404);
  if (community.maciDeploymentBlock === null) {
    return c.json({ error: "No recorded MACI deployment block for this community" }, 422);
  }

  void deployCommunitySubgraph(community.id, community.chainId, community.maciDeploymentBlock).catch((err: unknown) => {
    console.error(`[communities route] Unexpected error retrying subgraph deploy for ${id}:`, err);
  });

  return c.json({ status: "retrying" }, 202);
});
