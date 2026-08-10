import { neonConfig } from "@neondatabase/serverless";

// Only applies when DATABASE_URL points at the local-neon-http-proxy dev container
// (see specs/003-005's research.md for why the app uses @neondatabase/serverless's
// neon-http driver, which otherwise only speaks to real Neon endpoints). No-op against
// a real Neon DATABASE_URL — fetchEndpoint's default behavior is unaffected for any
// other host.
neonConfig.fetchEndpoint = (host) => {
  const [protocol, port] = host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
  return `${protocol}://${host}:${port}/sql`;
};
