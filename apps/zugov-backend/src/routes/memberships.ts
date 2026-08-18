import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import * as membershipService from "../services/membershipService.js";

export const myMembershipsRouter = new Hono();

// Mounted at /api/memberships — deliberately separate from /api/communities (which already has
// a GET /:id handler; nesting "mine" there would collide with that route matching id="mine").
myMembershipsRouter.get("/mine", requireAuth, async (c) => {
  const session = await getSession(c);
  const memberships = await membershipService.listMembershipsForWallet(session.address!);
  return c.json({ communityIds: memberships.map((m) => m.communityId) });
});
