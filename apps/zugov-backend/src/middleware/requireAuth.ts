import type { MiddlewareHandler } from "hono";
import { getSession } from "./session.js";

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await getSession(c);
  if (!session.address) {
    return c.json({ error: "Authentication required" }, 401);
  }
  await next();
};
