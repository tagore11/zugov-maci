import { Hono } from "hono";
import { countDistinct, eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { communities, events, memberships, proposals, unionMemberships } from "../db/schema.js";

export const analyticsRouter = new Hono();

/**
 * Real counts, or nothing.
 *
 * This endpoint exists because the Analytics page shipped hard-coded figures
 * (1,940 members, 68.4% participation, +12.5% and so on) that no query
 * produced. A number on a governance dashboard is a claim about the community,
 * and an invented one is worse than an absent one.
 *
 * Deliberately absent: participation rate and period-over-period trends. Both
 * need vote records joined against an eligible-voter set, and on-chain MACI
 * ballots are not readable from this database at all. Reporting them would mean
 * inventing them again.
 */
analyticsRouter.get("/", async (c) => {
  const [communityRow, memberRow, proposalRow, formalizedRow, eventRow, unionRow] = await Promise.all([
    db.select({ value: sql<number>`count(*)::int` }).from(communities),
    db.select({ value: countDistinct(memberships.walletAddress) }).from(memberships),
    db.select({ value: sql<number>`count(*)::int` }).from(proposals),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(proposals)
      .where(eq(proposals.status, "formalized")),
    db.select({ value: sql<number>`count(*)::int` }).from(events),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(unionMemberships)
      .where(eq(unionMemberships.status, "active")),
  ]);

  return c.json({
    communities: communityRow[0]?.value ?? 0,
    members: Number(memberRow[0]?.value ?? 0),
    proposals: proposalRow[0]?.value ?? 0,
    formalizedProposals: formalizedRow[0]?.value ?? 0,
    events: eventRow[0]?.value ?? 0,
    activeUnionMemberships: unionRow[0]?.value ?? 0,
  });
});
