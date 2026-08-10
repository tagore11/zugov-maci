import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSession } from "../middleware/session.js";
import * as credentialStore from "../services/identity/credentialStore.js";
import { zupassAdapter } from "../services/identity/zupassAdapter.js";
import { zkidAdapter } from "../services/identity/zkidAdapter.js";
import type { IdentityProvider, Protocol } from "../services/identity/IdentityProvider.js";

const SUPPORTED_PROTOCOLS = ["zupass", "zkid"] as const;

const adapters: Record<(typeof SUPPORTED_PROTOCOLS)[number], IdentityProvider> = {
  zupass: zupassAdapter,
  zkid: zkidAdapter,
};

export const credentialsRouter = new Hono();

credentialsRouter.use("*", requireAuth);

credentialsRouter.get("/", async (c) => {
  const session = await getSession(c);
  const rows = await credentialStore.getCredentials(session.address!);
  const byProtocol = new Map(rows.map((row) => [row.protocol, row]));

  const result = SUPPORTED_PROTOCOLS.map((protocol) => {
    const row = byProtocol.get(protocol);
    return row
      ? { protocol: row.protocol, status: row.status, lastCheckedAt: row.lastCheckedAt }
      : { protocol, status: "unverified" as const, lastCheckedAt: null };
  });

  return c.json({ credentials: result });
});

credentialsRouter.post("/:protocol/verify", async (c) => {
  const protocolParam = c.req.param("protocol");
  if (!SUPPORTED_PROTOCOLS.includes(protocolParam as Protocol)) {
    return c.json({ error: `Unsupported protocol: ${protocolParam}` }, 404);
  }
  const protocol = protocolParam as Protocol;

  const session = await getSession(c);
  const walletAddress = session.address!;
  const adapter = adapters[protocol];
  const proofPayload: unknown = await c.req.json();
  const previous = await credentialStore.getCredential(walletAddress, protocol);
  const previousStatus = previous?.status ?? "unverified";

  try {
    const { status, proofRef } = await adapter.verify({
      walletAddress,
      proofPayload,
      previousStatus,
    });
    const now = Math.floor(Date.now() / 1000);
    const saved = await credentialStore.upsertCredential(walletAddress, protocol, status, proofRef, now);
    return c.json({ protocol, status: saved.status, lastCheckedAt: saved.lastCheckedAt });
  } catch {
    return c.json({ error: "Invalid proof payload" }, 400);
  }
});
