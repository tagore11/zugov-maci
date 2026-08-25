import { eq } from "drizzle-orm";
import { getAddress } from "viem";
import { db } from "./client.js";
import { maciGovernanceConfigs } from "./schema.js";

/**
 * One-off backfill for the new maci_governance_configs.contract_address unique index
 * (Child C2, formalize-communities epic, /plan-eng-review 2026-08-25 — ship-time coverage
 * audit finding). attachGovernance() checksum-normalizes contractAddress via viem's
 * getAddress() before every write starting with this change, but the unique index itself
 * doesn't touch pre-existing rows — any contract attached before this migration is stored in
 * whatever case the old, un-normalized code path wrote, so a new submission of the same
 * contract in a different case would silently NOT collide with it (different byte strings),
 * defeating the whole point of the constraint for every community that existed before this
 * deploy. Normalizing existing rows to the same checksummed form new writes use closes that
 * gap for good.
 */
async function backfill(): Promise<void> {
  const rows = await db
    .select({ communityId: maciGovernanceConfigs.communityId, contractAddress: maciGovernanceConfigs.contractAddress })
    .from(maciGovernanceConfigs);

  let updated = 0;
  let skipped = 0;
  for (const row of rows) {
    if (!row.contractAddress) {
      skipped += 1;
      continue;
    }
    let checksummed: string;
    try {
      checksummed = getAddress(row.contractAddress);
    } catch (err: unknown) {
      console.error(
        `Skipping ${row.communityId}: contractAddress "${row.contractAddress}" is not a valid address:`,
        err,
      );
      skipped += 1;
      continue;
    }
    if (checksummed === row.contractAddress) {
      skipped += 1;
      continue;
    }
    try {
      await db
        .update(maciGovernanceConfigs)
        .set({ contractAddress: checksummed })
        .where(eq(maciGovernanceConfigs.communityId, row.communityId));
      updated += 1;
    } catch (err: unknown) {
      // Would only happen if two existing rows normalize to the same checksummed address —
      // an actual pre-existing duplicate the old code never caught. Logged, not silently
      // dropped, since this needs a human decision (which row keeps the address).
      console.error(`Failed to normalize ${row.communityId} ("${row.contractAddress}" -> "${checksummed}"):`, err);
    }
  }

  console.log(`Normalized ${updated} contractAddress value(s) to checksum case. ${skipped} already correct or empty.`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
