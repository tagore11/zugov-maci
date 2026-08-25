CREATE TABLE IF NOT EXISTS "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
-- Seed today's 6 category values before anything references this table (formalize-communities
-- epic, Child C1, /plan-eng-review 2026-08-24/25) — replaces a hardcoded union type so a 7th
-- category is a direct DB insert, not a code deploy.
INSERT INTO "categories" ("id", "label", "created_at") VALUES
	('residency', 'Residency', extract(epoch from now())::integer),
	('pop_up_city', 'Pop-up City', extract(epoch from now())::integer),
	('regional', 'Regional', extract(epoch from now())::integer),
	('network_state', 'Network State', extract(epoch from now())::integer),
	('social', 'Social', extract(epoch from now())::integer),
	('dao', 'DAO', extract(epoch from now())::integer)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- Defensive: communities.category was only ever a compile-time TS cast, never DB-enforced, so a
-- stray/typo'd value is plausible in prod. Self-heal to NULL (category is nullable) rather than
-- letting the FK constraint below abort the migration on unknown data (outside-voice finding,
-- /plan-eng-review 2026-08-25).
UPDATE "communities" SET "category" = NULL
	WHERE "category" IS NOT NULL AND "category" NOT IN (SELECT "id" FROM "categories");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "communities" ADD CONSTRAINT "communities_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "allow_join" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
-- Unconditional, no WHERE clause: ADD COLUMN above holds an ACCESS EXCLUSIVE lock for the
-- duration of this migration's transaction, so no concurrent INSERT can have landed between it
-- and this UPDATE — every row present here is a pre-migration row by construction. New
-- communities get allow_join=false from the column DEFAULT going forward; this backfills
-- existing communities to true so nobody already live loses the ability to be joined
-- (/plan-eng-review 2026-08-24, corrected by outside-voice review 2026-08-25 — an earlier draft
-- of this migration had an unnecessary WHERE clause implying a race that can't actually happen).
UPDATE "communities" SET "allow_join" = true;
