import { serve } from "@hono/node-server";
import { MissingEnvironmentError, readPort, requireCorsOrigins, requireDatabaseUrl } from "./env.js";

// Read the environment before importing the app, so a misconfigured process
// prints what is missing instead of a stack trace from inside a CORS helper.
let port: number;
try {
  requireDatabaseUrl();
  requireCorsOrigins();
  port = readPort();
} catch (error) {
  if (error instanceof MissingEnvironmentError) {
    console.error(`\n${error.message}\n`);
    process.exit(1);
  }
  throw error;
}

const { app } = await import("./app.js");

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
