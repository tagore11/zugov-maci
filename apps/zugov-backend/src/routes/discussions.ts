import { Hono } from "hono";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import * as discussionService from "../services/discussionService.js";
import {
  DiscussionNotFoundError,
  NotAuthorizedToPostError,
  NotAuthorizedToEditError,
  NotAuthorizedToDeleteError,
} from "../services/discussionService.js";

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D1) — omit/undefined/null all
// mean "unrestricted"; a non-empty array restricts to those tiers. Mirrors routes/events.ts's
// eligibleTierIdsSchema exactly.
const eligibleTierIdsSchema = z.array(z.string()).min(1).nullable().optional();

const createDiscussionSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  eligibleTierIds: eligibleTierIdsSchema,
});

const updateDiscussionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  eligibleTierIds: eligibleTierIdsSchema,
});

export const discussionsRouter = new Hono();

discussionsRouter.post("/:id/discussions", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);

  const body = await c.req.json();
  const parsed = createDiscussionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  try {
    const discussion = await discussionService.create({
      communityId,
      authorAddress: session.address!,
      ...parsed.data,
    });
    return c.json({ discussion }, 201);
  } catch (err) {
    if (err instanceof NotAuthorizedToPostError) return c.json({ error: err.message }, 403);
    throw err;
  }
});

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D5, REVISED after
// outside-voice review) — unlike Child H/I's proposals/events routes (fully public, no
// requireAuth), discussions are members-only categorically: an unrestricted post must not be
// visible to anonymous visitors or non-members. Gate is member-row OR admin, not member-row-only,
// so a community's on-chain-reconciled owner (real isAuthorized() authority, no memberships row)
// isn't walled out of the screen showing what they have delete authority over.
discussionsRouter.get("/:id/discussions", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);

  if (!(await discussionService.isMemberOrAdmin(communityId, session.address!))) {
    return c.json({ error: "Not a member of this community" }, 403);
  }

  const discussions = await discussionService.listForViewer(communityId, session.address!);
  return c.json({ discussions });
});

discussionsRouter.get("/:id/discussions/:discussionId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const session = await getSession(c);

  if (!(await discussionService.isMemberOrAdmin(communityId, session.address!))) {
    return c.json({ error: "Not a member of this community" }, 403);
  }

  const discussion = await discussionService.getForViewer(c.req.param("discussionId"), communityId, session.address!);
  if (!discussion) return c.json({ error: "Not found" }, 404);
  return c.json({ discussion });
});

// Author-only (D3) — no admin edit path at all.
discussionsRouter.patch("/:id/discussions/:discussionId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const discussionId = c.req.param("discussionId");
  const session = await getSession(c);

  const body = await c.req.json();
  const parsed = updateDiscussionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  try {
    const discussion = await discussionService.update(discussionId, communityId, session.address!, parsed.data);
    return c.json({ discussion });
  } catch (err) {
    if (err instanceof DiscussionNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof NotAuthorizedToEditError) return c.json({ error: err.message }, 403);
    throw err;
  }
});

// Author OR admin (D3) — admin can delete, not edit, any post.
discussionsRouter.delete("/:id/discussions/:discussionId", requireAuth, async (c) => {
  const communityId = c.req.param("id");
  const discussionId = c.req.param("discussionId");
  const session = await getSession(c);

  try {
    await discussionService.remove(discussionId, communityId, session.address!);
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof DiscussionNotFoundError) return c.json({ error: err.message }, 404);
    if (err instanceof NotAuthorizedToDeleteError) return c.json({ error: err.message }, 403);
    throw err;
  }
});
