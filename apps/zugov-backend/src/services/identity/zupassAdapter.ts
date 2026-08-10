import { createRequire } from "node:module";

import type { ZuAuthArgs } from "@pcd/zuauth";
import type { IdentityProvider } from "./IdentityProvider.js";

// @pcd/zuauth's ESM build has an extensionless relative import ("./configs/0xPARC_Summer")
// that Node's strict ESM resolver rejects at runtime. `import ... from "@pcd/zuauth"` in an
// ESM module resolves via the package's "import" condition straight into that broken build —
// under a lenient bundler (tsx/vite) it's masked, but plain `node` (the real prod entrypoint)
// throws ERR_MODULE_NOT_FOUND. Forcing a real CJS require() routes through the "require"
// condition instead, which points at a working CJS build with no such issue.
const require = createRequire(import.meta.url);
const { authenticate, ETHBERLIN04 } = require("@pcd/zuauth") as typeof import("@pcd/zuauth");

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
