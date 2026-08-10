CREATE TABLE IF NOT EXISTS "governance_action_sponsors" (
	"governance_action_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"sponsored_at" integer NOT NULL,
	CONSTRAINT "governance_action_sponsors_governance_action_id_wallet_address_pk" PRIMARY KEY("governance_action_id","wallet_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "governance_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"type" text DEFAULT 'poll' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"privacy" text NOT NULL,
	"execution_location" text NOT NULL,
	"tally_mechanism" text NOT NULL,
	"eligible_tier_ids" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"creator_address" text NOT NULL,
	"poll_address" text,
	"poll_id" text,
	"created_at" integer NOT NULL,
	"formalized_at" integer
);
--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "cosponsorship_threshold" integer DEFAULT 0 NOT NULL;