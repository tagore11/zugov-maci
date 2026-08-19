CREATE TABLE IF NOT EXISTS "eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"ruleset_id" text NOT NULL,
	"group_index" integer NOT NULL,
	"mechanism" text NOT NULL,
	"config" text NOT NULL,
	"target_tier_id" text,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eligibility_rulesets" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL,
	CONSTRAINT "eligibility_rulesets_community_id_unique" UNIQUE("community_id")
);
--> statement-breakpoint
ALTER TABLE "join_requests" ADD COLUMN "tier_id" text;--> statement-breakpoint
ALTER TABLE "membership_tiers" ADD COLUMN "rank" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eligibility_rules" ADD CONSTRAINT "eligibility_rules_ruleset_id_eligibility_rulesets_id_fk" FOREIGN KEY ("ruleset_id") REFERENCES "public"."eligibility_rulesets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eligibility_rules" ADD CONSTRAINT "eligibility_rules_target_tier_id_membership_tiers_id_fk" FOREIGN KEY ("target_tier_id") REFERENCES "public"."membership_tiers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eligibility_rulesets" ADD CONSTRAINT "eligibility_rulesets_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
