import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { proposals, membershipTiers } from "./schema.js";

/**
 * One-off backfill for governance actions formalized before confirmFormalize started stamping
 * eligible_tier_ids from every voting-capable tier at formalization time (previously it kept
 * whatever subset was picked at draft creation, which could exclude tiers added or granted
 * canVote afterwards).
 */
async function backfill(): Promise<void> {
  const formalized = await db
    .select({ id: proposals.id, communityId: proposals.communityId })
    .from(proposals)
    .where(eq(proposals.status, "formalized"));

  let updated = 0;
  for (const action of formalized) {
    const tiers = await db
      .select({ id: membershipTiers.id, canVote: membershipTiers.canVote })
      .from(membershipTiers)
      .where(eq(membershipTiers.communityId, action.communityId));
    const eligibleTierIds = tiers.filter((t) => t.canVote).map((t) => t.id);

    await db
      .update(proposals)
      .set({ eligibleTierIds: JSON.stringify(eligibleTierIds) })
      .where(eq(proposals.id, action.id));
    updated += 1;
  }

  console.log(`Backfilled eligible_tier_ids for ${updated} formalized governance action(s).`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
