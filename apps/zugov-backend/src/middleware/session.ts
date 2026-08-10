import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import { db } from "../db/client.js";
import { sessions } from "../db/schema.js";

export interface SessionData {
  address?: string;
  chainId?: number;
  nonce?: string;
  nonceExpiresAt?: number;
}

const COOKIE_NAME = "zugov_session";
const SESSION_TTL_SECONDS = 86400;

const isProduction = process.env.NODE_ENV === "production";

// The frontend (Vercel) and backend (self-hosted) are on different sites in production, so the
// cookie must be SameSite=None (which browsers only allow alongside Secure) to be sent on
// cross-site requests at all. In dev both run on localhost — same-site — where Strict is safe
// and doesn't require HTTPS.
const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "None" : "Strict") as "None" | "Strict",
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
};

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

export async function getSession(c: Context): Promise<SessionData> {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return {};

  const rows = await db.select().from(sessions).where(eq(sessions.id, token)).limit(1);
  const session = rows[0];
  if (!session || session.expiresAt < nowSeconds()) return {};

  return {
    address: session.address ?? undefined,
    chainId: session.chainId ?? undefined,
    nonce: session.nonce ?? undefined,
    nonceExpiresAt: session.nonceExpiresAt ?? undefined,
  };
}

export async function saveSession(c: Context, data: SessionData): Promise<void> {
  const token = getCookie(c, COOKIE_NAME) ?? randomBytes(32).toString("hex");
  const now = nowSeconds();
  const expiresAt = now + SESSION_TTL_SECONDS;

  await db
    .insert(sessions)
    .values({
      id: token,
      address: data.address,
      chainId: data.chainId,
      nonce: data.nonce,
      nonceExpiresAt: data.nonceExpiresAt,
      createdAt: now,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: sessions.id,
      set: {
        address: data.address,
        chainId: data.chainId,
        nonce: data.nonce,
        nonceExpiresAt: data.nonceExpiresAt,
        expiresAt,
      },
    });

  setCookie(c, COOKIE_NAME, token, COOKIE_OPTS);
}

export async function destroySession(c: Context): Promise<void> {
  const token = getCookie(c, COOKIE_NAME);
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  deleteCookie(c, COOKIE_NAME, { path: "/" });
}
