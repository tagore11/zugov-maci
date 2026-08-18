import { Hono } from "hono";
import { z } from "zod";
import * as unionService from "../services/unionService.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import { isAuthorized } from "../services/membershipService.js";

const createUnionSchema = z.object({
  displayName: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  logo: z.string().optional(),
  foundingCommunityId: z.string().min(1),
});

const inviteSchema = z.object({
  communityId: z.string().min(1),
  // The community the caller is acting on behalf of — must already be an active member of
  // this union, and the caller must be authorized (canManageMembership) on it. A user
  // administering multiple communities needs to say which one they're inviting as.
  actingCommunityId: z.string().min(1),
});

const respondSchema = z.object({
  communityId: z.string().min(1),
  accept: z.boolean(),
});

const leaveSchema = z.object({
  communityId: z.string().min(1),
});

export const unionsRouter = new Hono();

// Public browse-all listing — no auth required, mirrors GET /api/communities.
unionsRouter.get("/", async (c) => {
  const pageStr = c.req.query("page") ?? "1";
  const limitStr = c.req.query("limit") ?? "20";
  const page = Math.max(1, Number(pageStr));
  const limit = Math.min(50, Math.max(1, Number(limitStr)));

  const result = await unionService.listAll(page, limit);
  return c.json(result);
});

// Founding community joins as an active member automatically — the creator must be
// authorized (canManageMembership) on the community they're founding the union as.
unionsRouter.post("/", requireAuth, async (c) => {
  const body = await c.req.json();
  const parsed = createUnionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  if (!(await isAuthorized(parsed.data.foundingCommunityId, session.address!))) {
    return c.json({ error: "Not authorized to found a union on behalf of this community" }, 403);
  }

  try {
    const union = await unionService.create({ ...parsed.data, creatorAddress: session.address! });
    return c.json({ union }, 201);
  } catch (err) {
    if (err instanceof unionService.CommunityNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    throw err;
  }
});

unionsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const union = await unionService.get(id);
  if (!union) return c.json({ error: "Union not found" }, 404);

  // Pending invites are only visible to callers authorized on an already-active member
  // community — not public. getSession() returns {} (no address) for unauthenticated
  // requests, so this safely defaults to active-only.
  const session = await getSession(c);
  let includePending = false;
  if (session.address) {
    const activeMembers = await unionService.listMembers(id, false);
    for (const member of activeMembers) {
      if (await isAuthorized(member.communityId, session.address)) {
        includePending = true;
        break;
      }
    }
  }

  const members = await unionService.listMembers(id, includePending);
  return c.json({ union, members });
});

// Any active member community's admin can invite (canManageMembership on actingCommunityId) —
// not founder-only, since the union grows by its current members' consensus (Architecture
// Issue 2), but every mutation still requires real tier-permission, not just membership.
unionsRouter.post("/:id/invite", requireAuth, async (c) => {
  const unionId = c.req.param("id");
  const body = await c.req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  // Checked before the active-member membership check below: an authorized caller acting on a
  // real community should see "union not found" for a nonexistent union, not the misleading
  // "your community isn't an active member" (which implies the union exists).
  const union = await unionService.get(unionId);
  if (!union) return c.json({ error: "Union not found" }, 404);

  const session = await getSession(c);
  if (!(await isAuthorized(parsed.data.actingCommunityId, session.address!))) {
    return c.json({ error: "Not authorized to invite on behalf of this community" }, 403);
  }

  const activeMembers = await unionService.listMembers(unionId, false);
  const actingIsActiveMember = activeMembers.some((m) => m.communityId === parsed.data.actingCommunityId);
  if (!actingIsActiveMember) {
    return c.json({ error: "This community is not an active member of this union" }, 403);
  }

  try {
    const membership = await unionService.invite(unionId, parsed.data.communityId, session.address!);
    return c.json({ membership }, 201);
  } catch (err) {
    if (err instanceof unionService.UnionNotFoundError || err instanceof unionService.CommunityNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    if (err instanceof unionService.DuplicateInviteError) {
      return c.json({ error: err.message }, 409);
    }
    throw err;
  }
});

// Only the INVITED community's own admin may accept/decline — never the inviter, and never
// any other community. Symmetric consent (Architecture Issue 2): no community joins a union
// without its own authorized wallet saying so.
unionsRouter.post("/:id/respond", requireAuth, async (c) => {
  const unionId = c.req.param("id");
  const body = await c.req.json();
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  if (!(await isAuthorized(parsed.data.communityId, session.address!))) {
    return c.json({ error: "Not authorized to respond on behalf of this community" }, 403);
  }

  try {
    const membership = await unionService.respond(unionId, parsed.data.communityId, parsed.data.accept);
    return c.json({ membership });
  } catch (err) {
    if (err instanceof unionService.MembershipNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    throw err;
  }
});

// Self-service only — only the LEAVING community's own admin may call this, never another
// member (no "kick" path exists). Mirrors respond()'s auth pattern.
unionsRouter.post("/:id/leave", requireAuth, async (c) => {
  const unionId = c.req.param("id");
  const body = await c.req.json();
  const parsed = leaveSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 422);
  }

  const session = await getSession(c);
  if (!(await isAuthorized(parsed.data.communityId, session.address!))) {
    return c.json({ error: "Not authorized to act on behalf of this community" }, 403);
  }

  try {
    const membership = await unionService.leave(unionId, parsed.data.communityId);
    return c.json({ membership });
  } catch (err) {
    if (err instanceof unionService.NotActiveMemberError) {
      return c.json({ error: err.message }, 409);
    }
    throw err;
  }
});
