// Named-export import fails under Node's ESM loader: @pcd/zuauth resolves to its CJS build here,
// and Node's static cjs-module-lexer detection doesn't pick up its named exports, so only the
// wrapped `default` (the real module.exports object) is available. Same interop class as the
// blakejs issue documented in specs/003's research.md.
import zuauthPkg from "@pcd/zuauth";
import type { ZuAuthArgs } from "@pcd/zuauth";
import type { IdentityProvider } from "./IdentityProvider.js";

const { authenticate, ETHBERLIN04 } = zuauthPkg;

/**
 * Placeholder ticket pipeline config — one of @pcd/zuauth's bundled sample events.
 * ZuGov needs its own registered Zupass Generic Issuance pipeline before this checks
 * anything ZuGov-specific (research.md #1's correction). Swap this constant once that
 * pipeline exists; nothing else in this adapter (or its callers) needs to change.
 */
const ZUPASS_TICKET_CONFIG: ZuAuthArgs["config"] = ETHBERLIN04;

export const zupassAdapter: IdentityProvider = {
  protocol: "zupass",
  trustModel: "zk-verified-offchain",
  walletOrigin: "attaches-to-existing-wallet",

  async verify({ walletAddress, proofPayload, previousStatus }) {
    if (typeof proofPayload !== "string") {
      throw new Error("Zupass proof payload must be a serialized PCD string");
    }

    try {
      const ticketPcd = await authenticate(proofPayload, {
        watermark: walletAddress,
        config: ZUPASS_TICKET_CONFIG,
        fieldsToReveal: {},
      });
      return { status: "verified", proofRef: ticketPcd.id };
    } catch {
      return { status: previousStatus === "verified" ? "expired" : "unverified" };
    }
  },
};
