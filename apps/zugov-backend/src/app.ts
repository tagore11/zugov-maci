import { Hono } from "hono";
import { cors } from "hono/cors";
import { requireCorsOrigins } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { communitiesRouter } from "./routes/communities.js";
import { credentialsRouter } from "./routes/credentials.js";
import { membershipRouter } from "./routes/membership.js";
import { myMembershipsRouter } from "./routes/memberships.js";
import { proposalsRouter } from "./routes/proposals.js";
import { unionsRouter } from "./routes/unions.js";
import { venuesRouter } from "./routes/venues.js";
import { eventsRouter } from "./routes/events.js";
import { globalEventsRouter } from "./routes/globalEvents.js";
import { discussionsRouter } from "./routes/discussions.js";
import { eligibilityRulesetRouter } from "./routes/eligibilityRuleset.js";
import { zupollCommunityRouter, zupollProposalRouter } from "./routes/zupoll.js";
import { categoriesRouter } from "./routes/categories.js";
import { analyticsRouter } from "./routes/analytics.js";

export const app = new Hono();

// specs/002 FR-015: both the production frontend domain and its preview-deployment domains must
// be allowed simultaneously. CORS_ORIGIN is a comma-separated list, not a single origin.
const allowedOrigins = requireCorsOrigins();

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/", (c) => c.json({ ok: true }));

app.route("/api/analytics", analyticsRouter);
app.route("/api/auth", authRouter);
app.route("/api/communities", communitiesRouter);
app.route("/api/communities", membershipRouter);
app.route("/api/communities", proposalsRouter);
app.route("/api/communities", venuesRouter);
app.route("/api/communities", eventsRouter);
app.route("/api/communities", discussionsRouter);
app.route("/api/communities", eligibilityRulesetRouter);
app.route("/api/communities", zupollCommunityRouter);
app.route("/api/proposals", zupollProposalRouter);
app.route("/api/memberships", myMembershipsRouter);
app.route("/api/unions", unionsRouter);
app.route("/api/events", globalEventsRouter);
app.route("/api/credentials", credentialsRouter);
app.route("/api/categories", categoriesRouter);
