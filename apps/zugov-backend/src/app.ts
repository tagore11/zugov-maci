import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/auth.js";
import { communitiesRouter } from "./routes/communities.js";
import { credentialsRouter } from "./routes/credentials.js";
import { membershipRouter } from "./routes/membership.js";
import { myMembershipsRouter } from "./routes/memberships.js";
import { proposalsRouter } from "./routes/proposals.js";
import { unionsRouter } from "./routes/unions.js";
import { venuesRouter } from "./routes/venues.js";
import { eventsRouter } from "./routes/events.js";
import { eligibilityRulesetRouter } from "./routes/eligibilityRuleset.js";

export const app = new Hono();

// specs/002 FR-015: both the production frontend domain and its preview-deployment domains must
// be allowed simultaneously — CORS_ORIGIN is a comma-separated list, not a single origin.
const allowedOrigins = process.env
  .CORS_ORIGIN!.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/", (c) => c.json({ ok: true }));

app.route("/api/auth", authRouter);
app.route("/api/communities", communitiesRouter);
app.route("/api/communities", membershipRouter);
app.route("/api/communities", proposalsRouter);
app.route("/api/communities", venuesRouter);
app.route("/api/communities", eventsRouter);
app.route("/api/communities", eligibilityRulesetRouter);
app.route("/api/memberships", myMembershipsRouter);
app.route("/api/unions", unionsRouter);
app.route("/api/credentials", credentialsRouter);
