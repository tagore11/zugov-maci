/**
 * One-time backfill: .data/decisions.json -> mvp_decisions in Postgres.
 *
 * Usage:  npm run migrate:decisions
 *
 * Run once, after lib/store.ts moved from a JSON file to Postgres. Safe to run
 * again: saveDecision upserts on id, so a second run just rewrites the same
 * rows. A decision from before receipts existed has no salt field at all in
 * the JSON; that gap already had a fallback at the two places that build a
 * receipt (`decision.salt ?? decision.id`), so this backfills the column with
 * decision.id for those rows rather than minting a new salt, which would
 * silently change the voter hashes in a receipt for that decision computed
 * before this migration ran.
 *
 * A decision from before communities existed in this app has no communityId
 * at all. Every one of those in this repo's own .data/decisions.json predates
 * the ZuKas Residency community and was written against it in every other
 * field, so they backfill to that community rather than being dropped.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { saveDecision, type Decision } from "../lib/store";
import { pool } from "../lib/db";

const DATA_FILE = path.join(process.env.ZUGOV_DATA_DIR ?? path.join(process.cwd(), ".data"), "decisions.json");
const FALLBACK_COMMUNITY_ID = "0xFCeA194e9B7A9A785C1a7d2bCd08f9D7b123456a"; // ZuKas Residency

interface LegacyDecision extends Omit<Decision, "salt" | "communityId"> {
  salt?: string;
  communityId?: string;
}

async function main() {
  let raw: string;
  try {
    raw = readFileSync(DATA_FILE, "utf8");
  } catch (error) {
    console.error(`Okunamadı: ${DATA_FILE}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }

  const { decisions } = JSON.parse(raw) as { decisions: LegacyDecision[] };
  console.log(`${decisions.length} karar bulundu, Postgres'e yazılıyor...`);

  for (const legacy of decisions) {
    const decision: Decision = {
      ...legacy,
      communityId: legacy.communityId ?? FALLBACK_COMMUNITY_ID,
      salt: legacy.salt ?? legacy.id,
    };
    await saveDecision(decision);
    console.log(`  ${decision.id}  ${decision.title}`);
  }

  console.log("Bitti.");
  await pool.end();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
