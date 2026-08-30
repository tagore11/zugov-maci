import { Hono } from "hono";
import { SiweMessage, generateNonce } from "siwe";
import { getSession, saveSession, destroySession } from "../middleware/session.js";

export const authRouter = new Hono();

const NONCE_TTL_SECONDS = 300; // 5 minutes

authRouter.get("/nonce", async (c) => {
  const nonce = generateNonce();
  const session = await getSession(c);
  const updated = {
    ...session,
    nonce,
    nonceExpiresAt: Math.floor(Date.now() / 1000) + NONCE_TTL_SECONDS,
  };
  await saveSession(c, updated);
  return c.json({ nonce });
});

authRouter.post("/verify", async (c) => {
  const body = await c.req.json<{ message: string; signature: string }>();

  const session = await getSession(c);

  if (!session.nonce || !session.nonceExpiresAt) {
    return c.json({ error: "No active nonce. Request a nonce first." }, 400);
  }

  if (Math.floor(Date.now() / 1000) > session.nonceExpiresAt) {
    return c.json({ error: "Nonce has expired. Request a new nonce." }, 400);
  }

  let siweMessage: SiweMessage;
  try {
    siweMessage = new SiweMessage(body.message);
  } catch {
    // EIP-4361 restricts the statement to reserved and unreserved characters,
    // so a message carrying anything outside them fails to parse here rather
    // than at signature verification. A statement written in a language with
    // diacritics is the way this is usually reached, and the bare "invalid
    // format" it used to return sent people looking at their wallet instead.
    const statement = body.message.split("\n")[3] ?? "";
    const offending = [...statement].filter((character) => character.charCodeAt(0) > 126);
    return c.json(
      {
        error:
          offending.length > 0
            ? `Invalid SIWE message format. The statement contains characters EIP-4361 does not allow: ${[...new Set(offending)].join(" ")}. Statements must be ASCII.`
            : "Invalid SIWE message format.",
      },
      400,
    );
  }

  // siweMessage.verify() is documented to resolve { success: false, error } for verification
  // failures, but some malformed signatures (e.g. a non-canonical ECDSA `s` value) make the
  // underlying ethers.js recovery throw instead — an unhandled exception here previously crashed
  // the request with no response at all, rather than a clean 400.
  let result: Awaited<ReturnType<SiweMessage["verify"]>>;
  try {
    result = await siweMessage.verify({
      signature: body.signature,
      nonce: session.nonce,
    });
  } catch {
    return c.json({ error: "Invalid signature." }, 400);
  }

  if (!result.success) {
    return c.json({ error: result.error?.type ?? "SIWE verification failed." }, 400);
  }

  const { address, chainId } = result.data;
  await saveSession(c, { address, chainId });
  return c.json({ address, chainId });
});

authRouter.post("/logout", async (c) => {
  await destroySession(c);
  return c.json({ ok: true });
});
