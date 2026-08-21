import { db } from "./client.js";
import { maciGovernanceConfigs } from "./schema.js";
import * as decisionAdapterService from "../services/decisionAdapterService.js";

/**
 * One-off backfill for communities configured between 2026-08-18 (maci_governance_configs
 * shipped) and 2026-08-20 (attachGovernance started calling decisionAdapterService.attach),
 * which have a maci_governance_configs row but no community_decision_adapters row.
 */
async function backfill(): Promise<void> {
  const configured = await db.select({ communityId: maciGovernanceConfigs.communityId }).from(maciGovernanceConfigs);

  let backfilled = 0;
  for (const { communityId } of configured) {
    await decisionAdapterService.attach(communityId, "maci");
    backfilled += 1;
  }

  console.log(`Backfilled community_decision_adapters "maci" rows for ${backfilled} community/communities.`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
