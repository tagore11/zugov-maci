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

// Session-derived only — never takes an address as a query param, which is what keeps this
// safe to expose without a privacy check (community page redesign, /plan-eng-review 2026-08-26,
// D2). Anonymous callers get an empty list, matching every other session-gated route here.
unionsRouter.get("/my-pending-invites", async (c) => {
  const session = await getSession(c);
  if (!session.address) return c.json({ invites: [] });
  const invites = await unionService.listMyPendingInvites(session.address);
  return c.json({ invites });
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

// community page redesign (/plan-eng-review 2026-08-26, D1) — extended to also report which of
// the caller's own communities are active/pending here, so the union page can render "Your
// Actions" (invite/leave for an active match, accept/decline for a pending match) without a
// second round trip. getSession() returns {} (no address) for unauthenticated requests, so all
// of this safely no-ops to empty for anonymous callers.
unionsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const union = await unionService.get(id);
  if (!union) return c.json({ error: "Union not found" }, 404);

  const session = await getSession(c);
  const myActiveCommunityIds: string[] = [];
  const myPendingCommunityIds: string[] = [];
  // Pending invites are only visible to callers authorized on an already-active member
  // community (the full list, everyone's invites) OR on the specific pending community itself
  // (just their own invite, so they can see and act on it without unrelated authority
  // elsewhere in the union) — never public.
  let canSeeAllPending = false;

  if (session.address) {
    const activeMembers = await unionService.listMembers(id, false);
    for (const member of activeMembers) {
      if (await isAuthorized(member.communityId, session.address)) {
        canSeeAllPending = true;
        myActiveCommunityIds.push(member.communityId);
      }
    }
  }

  const allMembers = await unionService.listMembers(id, true);
  if (session.address) {
    for (const member of allMembers) {
      if (member.status === "pending" && (await isAuthorized(member.communityId, session.address))) {
        myPendingCommunityIds.push(member.communityId);
      }
    }
  }
  const myPendingIdSet = new Set(myPendingCommunityIds);

  const members = canSeeAllPending
    ? allMembers
    : allMembers.filter((m) => m.status === "active" || myPendingIdSet.has(m.communityId));

  return c.json({ union, members, myActiveCommunityIds, myPendingCommunityIds });
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
