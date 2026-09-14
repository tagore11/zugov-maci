/**
 * Anchor a published receipt's digest on Scroll Sepolia.
 *
 * Usage:  npm run anchor -- receipt.json
 *
 * The receipt's digest (lib/core/receipt.ts) already is the thing worth signing: a sha256
 * over the decision, the rule, and every anonymous ballot. This does not invent a second
 * signature scheme on top of it. It sends one zero-value transaction to the signer's own
 * address on Scroll Sepolia with the digest as calldata, so the digest's existence at a given
 * block height becomes a fact anyone can check on a public chain, independent of whether this
 * server is still running or still honest.
 *
 * Deliberately a CLI a human runs per receipt, not something the API does on every decision:
 * anchoring spends real (if testnet) funds, and giving the backend an always-on signing key
 * to spend automatically is a separate decision from computing the receipt.
 *
 * Needs ZUGOV_ANCHOR_PRIVATE_KEY in the environment. Never paste a private key into a chat,
 * a file this app reads by default, or anywhere other than your own shell's export.
 */

import { readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scrollSepolia } from "viem/chains";
import { verifyReceipt, type Receipt } from "../lib/core/receipt";

const path = process.argv[2];
if (!path) {
  console.error("Usage: npm run anchor -- receipt.json");
  process.exit(2);
}

const privateKey = process.env.ZUGOV_ANCHOR_PRIVATE_KEY;
if (!privateKey) {
  console.error("ZUGOV_ANCHOR_PRIVATE_KEY is not set.");
  console.error("Set it in your own shell, don't paste it here or into a file:");
  console.error('  export ZUGOV_ANCHOR_PRIVATE_KEY="0x..."');
  process.exit(2);
}

let receipt: Receipt;
try {
  receipt = JSON.parse(readFileSync(path, "utf8")) as Receipt;
} catch (error) {
  console.error(`Could not read the file: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}

const { digestMatches, tallyMatches } = verifyReceipt(receipt);
if (!digestMatches || !tallyMatches) {
  console.error("This receipt does not pass its own verification, not anchoring it.");
  console.error(`  Signature   ${digestMatches ? "matches" : "DOES NOT MATCH"}`);
  console.error(`  Tally       ${tallyMatches ? "matches" : "DOES NOT MATCH"}`);
  process.exit(1);
}

// viem ships sepolia-rpc.scroll.io as this chain's default, but as of this writing it 404s at
// the root for any JSON-RPC call, dead rather than merely rate-limited. publicnode's endpoint
// answers eth_chainId correctly (0x8274f = 534351); override with ZUGOV_ANCHOR_RPC_URL if it
// also rots.
const FALLBACK_RPC_URL = "https://scroll-sepolia-rpc.publicnode.com";

async function main() {
  const account = privateKeyToAccount(privateKey as Hex);
  const transport = http(process.env.ZUGOV_ANCHOR_RPC_URL ?? FALLBACK_RPC_URL);
  const publicClient = createPublicClient({ chain: scrollSepolia, transport });
  const walletClient = createWalletClient({ account, chain: scrollSepolia, transport });

  const balance = await publicClient.getBalance({ address: account.address });
  if (balance === 0n) {
    console.error(`${account.address} has a zero balance, needs gas on Scroll Sepolia.`);
    console.error("Faucet: https://docs.scroll.io/en/user-guide/faucet/");
    process.exit(1);
  }

  const data = `0x${receipt.digest}` as Hex;
  console.log(`Decision     ${receipt.title}`);
  console.log(`Signature    ${receipt.digest}`);
  console.log(`Sender       ${account.address}`);
  console.log("Sending transaction...");

  const hash = await walletClient.sendTransaction({ to: account.address, value: 0n, data });
  console.log(`Transaction  ${hash}`);
  console.log(`             https://sepolia.scrollscan.com/tx/${hash}`);
  console.log("Waiting for confirmation...");

  const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Block        ${txReceipt.blockNumber}`);
  console.log(txReceipt.status === "success" ? "Anchored on chain." : "Transaction returned failed.");
  process.exit(txReceipt.status === "success" ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
