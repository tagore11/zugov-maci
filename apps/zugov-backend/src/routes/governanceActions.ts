import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import { createDraftBodySchema, formalizeConfirmBodySchema } from "../validators/governanceActionSchema.js";
import * as governanceActionService from "../services/governanceActionService.js";
import {
  NotAuthorizedToCreateError,
  NonExecutableAxisCombinationError,
  IneligibleTiersError,
  GovernanceActionNotFoundError,
  NotAuthorizedToSponsorError,
  AlreadyFormalizedError,
  CreatorNoLongerAuthorizedError,
  ThresholdNotMetError,
} from "../services/governanceActionService.js";

export const governanceActionsRouter = new Hono();

governanceActionsRouter.post("/:id/governance-actions", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);

  const body = await c.req.json();
  const parsed = createDraftBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  try {
    const result = await governanceActionService.createDraft(communityId, session.address!, parsed.data);
    return c.json(result, 201);
  } catch (err) {
    if (err instanceof NotAuthorizedToCreateError) return c.json({ error: err.message }, 403);
    if (err instanceof NonExecutableAxisCombinationError) return c.json({ error: err.message }, 422);
    if (err instanceof IneligibleTiersError) {
      return c.json({ error: err.message, details: { invalidTierIds: err.invalidTierIds } }, 422);
    }
    throw err;
  }
});

governanceActionsRouter.get("/:id/governance-actions", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  const governanceActionsList = await governanceActionService.listForViewer(communityId, session.address!);
  return c.json({ governanceActions: governanceActionsList });
});

governanceActionsRouter.get("/:id/governance-actions/:actionId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  const result = await governanceActionService.getForViewer(communityId, c.req.param("actionId"), session.address!);
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

governanceActionsRouter.post("/:id/governance-actions/:actionId/sponsor", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  try {
    const result = await governanceActionService.sponsor(communityId, c.req.param("actionId"), session.address!);
    return c.json(result);
  } catch (err) {
    if (err instanceof GovernanceActionNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof NotAuthorizedToSponsorError) return c.json({ error: err.message }, 403);
    if (err instanceof AlreadyFormalizedError) return c.json({ error: err.message }, 409);
    throw err;
  }
});

governanceActionsRouter.post("/:id/governance-actions/:actionId/formalize/authorize", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  try {
    const result = await governanceActionService.authorizeFormalize(communityId, c.req.param("actionId"));
    return c.json(result);
  } catch (err) {
    if (err instanceof GovernanceActionNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof CreatorNoLongerAuthorizedError) return c.json({ error: err.message }, 403);
    if (err instanceof AlreadyFormalizedError || err instanceof ThresholdNotMetError) {
      return c.json({ error: err.message }, 409);
    }
    throw err;
  }
});

governanceActionsRouter.post("/:id/governance-actions/:actionId/formalize/confirm", requireAuth, async (c) => {
  const communityId = c.req.param("id");

  const body = await c.req.json();
  const parsed = formalizeConfirmBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  try {
    const governanceAction = await governanceActionService.confirmFormalize(
      communityId,
      c.req.param("actionId"),
      parsed.data,
    );
    return c.json({ governanceAction });
  } catch (err) {
    if (err instanceof GovernanceActionNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof CreatorNoLongerAuthorizedError) return c.json({ error: err.message }, 403);
    if (err instanceof AlreadyFormalizedError || err instanceof ThresholdNotMetError) {
      return c.json({ error: err.message }, 409);
    }
    throw err;
  }
});

governanceActionsRouter.get("/:id/governance-actions/:actionId/vote-eligibility", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);
  try {
    const result = await governanceActionService.checkVoteEligibility(
      communityId,
      c.req.param("actionId"),
      session.address!,
    );
    return c.json(result);
  } catch (err) {
    if (err instanceof GovernanceActionNotFoundError) return c.json({ error: err.message }, 404);
    throw err;
  }
});
