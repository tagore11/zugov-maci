import { Hono } from "hono";
import * as communityService from "../services/communityService.js";

export const categoriesRouter = new Hono();

categoriesRouter.get("/", async (c) => {
  const categories = await communityService.listCategories();
  return c.json({ categories });
});
