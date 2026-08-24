-- Pure no-op (drop + recreate the identical index). drizzle/meta's 0021/0022 snapshots were
-- rebuilt via `drizzle-kit introspect` against the live DB (see TODOS.md's snapshot-drift entry)
-- rather than drizzle-kit's own schema.ts-derived diffing, and introspected index metadata isn't
-- byte-identical to schema.ts-declared index metadata even for the same index -- drizzle-kit
-- generate flagged both as "changed" once, one time only, to reconcile the representations.
-- `drizzle-kit generate` reports a clean "No schema changes, nothing to migrate" after this.
DROP INDEX IF EXISTS "events_community_start_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "zupoll_votes_proposal_nullifier_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_community_start_idx" ON "events" USING btree ("community_id","start_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "zupoll_votes_proposal_nullifier_idx" ON "zupoll_votes" USING btree ("proposal_id","nullifier");
