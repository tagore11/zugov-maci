import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import { tierBodySchema } from "../validators/membershipSchema.js";
import * as membershipService from "../services/membershipService.js";
import {
  TierChangesRequireVoteError,
  TierInUseError,
  DuplicateJoinError,
  RequestNotFoundError,
  NotEligibleError,
} from "../services/membershipService.js";

export const membershipRouter = new Hono();

membershipRouter.get("/:id/tiers", async (c) => {
  const tiers = await membershipService.listTiersWithDefault(c.req.param("id"));
  return c.json({ tiers });
});

membershipRouter.post("/:id/tiers", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  if (!(await membershipService.isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to edit this community" }, 403);
  }

  const body = await c.req.json();
  const parsed = tierBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  try {
    // createTiersForCommunity is also used by communityService.create() for a brand-new
    // community's initial tier set, where this guard must not apply (there's no prior tier
    // config to "change" yet) — so the check lives here, at the add-a-tier-to-an-existing-
    // community call site, not inside createTiersForCommunity itself.
    await membershipService.assertTierChangesAllowed(communityId);
    const { defaultTierId } = await membershipService.createTiersForCommunity(
      communityId,
      [parsed.data],
      parsed.data.label,
    );
    const tiers = await membershipService.listTiers(communityId);
    const tier = tiers.find((t) => t.id === defaultTierId);
    return c.json({ tier });
  } catch (err) {
    if (err instanceof TierChangesRequireVoteError) return c.json({ error: err.message }, 409);
    throw err;
  }
});

membershipRouter.patch("/:id/tiers/:tierId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  if (!(await membershipService.isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to edit this community" }, 403);
  }

  const body = await c.req.json();
  const parsed = tierBodySchema.partial().safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  try {
    const tier = await membershipService.updateTier(communityId, c.req.param("tierId"), parsed.data);
    return c.json({ tier });
  } catch (err) {
    if (err instanceof TierChangesRequireVoteError) return c.json({ error: err.message }, 409);
    throw err;
  }
});

membershipRouter.delete("/:id/tiers/:tierId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  if (!(await membershipService.isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to edit this community" }, 403);
  }

  try {
    await membershipService.deleteTier(communityId, c.req.param("tierId"));
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof TierChangesRequireVoteError || err instanceof TierInUseError) {
      return c.json({ error: err.message }, 409);
    }
    throw err;
  }
});

membershipRouter.get("/:id/membership", async (c) => {
  const session = await getSession(c);
  if (!session.address) return c.json({ status: "none" });
  const result = await membershipService.getMembershipStatus(c.req.param("id"), session.address);
  return c.json(result);
});

// Governance restructure Phase 2 (2026-08-20) — feeds the person-type (election) proposal
// creation UI's member picker. Membership-gated, not admin-gated: any member with
// canCreateProposals needs this to pick candidates, not just members with canManageMembership.
// Not a public read — wallet addresses aren't a public directory.
membershipRouter.get("/:id/members", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  const status = await membershipService.getMembershipStatus(communityId, session.address!);
  if (status.status !== "member") {
    return c.json({ error: "Not authorized to view this community's members" }, 403);
  }
  const members = await membershipService.listMembers(communityId);
  return c.json({ members });
});

membershipRouter.post("/:id/join", requireAuth, async (c) => {
  const session = await getSession(c);
  try {
    const result = await membershipService.submitJoinRequest(c.req.param("id"), session.address!);
    return c.json(result);
  } catch (err) {
    if (err instanceof DuplicateJoinError) {
      return c.json({ error: err.message }, 409);
    }
    if (err instanceof NotEligibleError) {
      return c.json({ error: err.message }, 403);
    }
    throw err;
  }
});

membershipRouter.get("/:id/join-requests", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  if (!(await membershipService.isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to edit this community" }, 403);
  }
  const requests = await membershipService.listPendingRequests(communityId);
  return c.json({ requests });
});

membershipRouter.post("/:id/join-requests/:requestId/approve", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  if (!(await membershipService.isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to edit this community" }, 403);
  }
  try {
    await membershipService.approveRequest(c.req.param("requestId"));
    return c.json({ status: "approved" });
  } catch (err) {
    if (err instanceof RequestNotFoundError) return c.json({ error: err.message }, 404);
    throw err;
  }
});

membershipRouter.post("/:id/join-requests/:requestId/reject", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  if (!(await membershipService.isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to edit this community" }, 403);
  }
  try {
    await membershipService.rejectRequest(c.req.param("requestId"));
    return c.json({ status: "rejected" });
  } catch (err) {
    if (err instanceof RequestNotFoundError) return c.json({ error: err.message }, 404);
    throw err;
  }
});
