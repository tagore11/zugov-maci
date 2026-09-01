/**
 * Check a published receipt without trusting whoever published it.
 *
 * Usage:  npm run dogrula -- makbuz.json
 *
 * Reads the file, recomputes the digest over its own contents, and re-runs the
 * stated counting rule over the stated ballots. Nothing here contacts the
 * server the receipt came from, which is the point: the check is worth
 * something only if it does not ask the publisher whether the publisher is
 * honest.
 */

import { readFileSync } from "node:fs";
import { verifyReceipt, type Receipt } from "../lib/core/receipt";

const path = process.argv[2];
if (!path) {
  console.error("Kullanım: npm run dogrula -- makbuz.json");
  process.exit(2);
}

let receipt: Receipt;
try {
  receipt = JSON.parse(readFileSync(path, "utf8")) as Receipt;
} catch (error) {
  console.error(`Dosya okunamadı: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}

const { digestMatches, tallyMatches, recomputed } = verifyReceipt(receipt);
const label = (id: string | null) =>
  id === null ? "kazanan çıkmadı" : (receipt.options.find((o) => o.id === id)?.label ?? id);

console.log("");
console.log(`Karar        ${receipt.title}`);
console.log(`Kural        ${receipt.mechanismName}`);
console.log(`Katılımcı    ${receipt.outcome.participantCount}`);
console.log(`Pusula       ${receipt.ballots.length}`);
console.log("");
console.log(`İmza         ${digestMatches ? "tutuyor" : "TUTMUYOR, dosya değiştirilmiş"}`);
console.log(
  `Sayım        ${tallyMatches ? "tutuyor" : "TUTMUYOR, açıklanan sonuç pusulalardan çıkmıyor"}`,
);
console.log("");
console.log(`Açıklanan    ${label(receipt.outcome.winnerId)}`);
console.log(`Hesaplanan   ${label(recomputed.winnerId)}`);

if (receipt.outcome.redLines.length > 0) {
  console.log("");
  for (const entry of receipt.outcome.redLines) {
    console.log(`Kırmızı çizgi  ${label(entry.optionId)}: ${entry.count} kişi`);
  }
}

console.log("");
process.exit(digestMatches && tallyMatches ? 0 : 1);
