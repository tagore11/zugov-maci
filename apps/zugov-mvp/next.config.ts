import type { NextConfig } from "next";

/**
 * The ZuGov backend is proxied through this app's own origin.
 *
 * Its session is a cookie, and a cookie sent cross-origin needs SameSite=None
 * plus Secure, which does not hold on plain http://localhost. Rewriting
 * /agrestore/* onto the backend makes every one of those requests first-party,
 * so the cookie behaves the same in development as it will behind one domain in
 * production, and no CORS negotiation happens at all.
 */
const BACKEND = process.env.ZUGOV_API_URL ?? "http://127.0.0.1:3001";

const config: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/ag/:path*", destination: `${BACKEND}/api/:path*` }];
  },
};

export default config;
