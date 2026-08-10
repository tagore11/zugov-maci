import { OpenAC, base64Decode, type VerifyingKeys } from "openac-sdk";
import type { IdentityProvider } from "./IdentityProvider.js";

const BASELINE_VC_SIZE = "1k" as const;

let readyPromise: Promise<{ openac: OpenAC; verifyingKeys: VerifyingKeys }> | null = null;

function getVerifier() {
  readyPromise ??= (async () => {
    const openac = await OpenAC.init();
    const keys = await openac.loadKeysFromUrl(BASELINE_VC_SIZE);
    return { openac, verifyingKeys: keys.verifyingKeys() };
  })();
  return readyPromise;
}

interface ZkidProofPayload {
  prepareProof: string; // base64
  prepareInstance: string; // base64
  showProof: string; // base64
  showInstance: string; // base64
}

function isZkidProofPayload(value: unknown): value is ZkidProofPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.prepareProof === "string" &&
    typeof v.prepareInstance === "string" &&
    typeof v.showProof === "string" &&
    typeof v.showInstance === "string"
  );
}

/**
 * `predicate` (IdentityProvider.verify's shared, optional parameter) is accepted for
 * interface compatibility but cannot be enforced here: openac-sdk bakes the predicate
 * into the proof at present()-time (client-side), and verification only confirms the
 * proof is cryptographically valid and surfaces whatever `expressionResult` was baked
 * in — it does not let a verifier choose or re-check a different predicate after the
 * fact. This feature's baseline check treats "the proof verifies and its
 * expressionResult is true" as sufficient; a future community eligibility-logic
 * feature would need its own client-side flow requesting a specific predicate at
 * proof-generation time (research.md's zkID finding, correction added 2026-08-04).
 */
export const zkidAdapter: IdentityProvider = {
  protocol: "zkid",
  trustModel: "zk-verified-offchain",
  walletOrigin: "attaches-to-existing-wallet",

  async verify({ proofPayload, previousStatus }) {
    if (!isZkidProofPayload(proofPayload)) {
      throw new Error("zkID proof payload must include prepareProof/prepareInstance/showProof/showInstance");
    }

    const { openac, verifyingKeys } = await getVerifier();

    try {
      const result = await openac.verifyComponents(
        base64Decode(proofPayload.prepareProof),
        base64Decode(proofPayload.showProof),
        verifyingKeys,
        base64Decode(proofPayload.prepareInstance),
        base64Decode(proofPayload.showInstance),
      );

      if (result.valid && result.expressionResult === true) {
        return { status: "verified" };
      }
      return { status: previousStatus === "verified" ? "expired" : "unverified" };
    } catch {
      return { status: previousStatus === "verified" ? "expired" : "unverified" };
    }
  },
};
