import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import { isAuthorized } from "../services/membershipService.js";
import * as eligibilityService from "../services/eligibilityService.js";
import { rulesetBodySchema } from "../validators/eligibilitySchema.js";

export const eligibilityRulesetRouter = new Hono();

// Public — matches GET /api/communities/:id/tiers' convention (reads are public, writes gated
// separately). A community with no ruleset returns an empty rules array; the frontend/callers
// treat that as "Open" (2026-08-19 review, D4), not an error state.
eligibilityRulesetRouter.get("/:id/eligibility-ruleset", async (c) => {
  const rules = await eligibilityService.getRuleset(c.req.param("id"));
  return c.json({ rules });
});

// Creator/canManageMembership only — reuses isAuthorized (ENGINEERING.md's locked reusable
// authorization pattern), not a parallel check. Replaces the whole ruleset in one call (2026-08-19
// review — a creator edits "here's my new set of rules", not one rule at a time).
eligibilityRulesetRouter.post("/:id/eligibility-ruleset", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const body = await c.req.json();
  const parsed = rulesetBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  if (!(await isAuthorized(communityId, session.address!))) {
    return c.json({ error: "Not authorized to manage eligibility rules for this community" }, 403);
  }

  await eligibilityService.replaceRuleset(communityId, parsed.data.rules);
  const rules = await eligibilityService.getRuleset(communityId);
  return c.json({ rules }, 201);
});
