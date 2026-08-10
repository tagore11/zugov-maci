CREATE TABLE IF NOT EXISTS "join_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"status" text NOT NULL,
	"created_at" integer NOT NULL,
	"resolved_at" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "membership_tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"label" text NOT NULL,
	"can_create_governance_actions" boolean NOT NULL,
	"can_vote" boolean NOT NULL,
	"can_manage_membership" boolean NOT NULL,
	"can_delegate" boolean DEFAULT false NOT NULL,
	"can_be_delegated_to" boolean DEFAULT false NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memberships" (
	"wallet_address" text NOT NULL,
	"community_id" text NOT NULL,
	"tier_id" text NOT NULL,
	"joined_at" integer NOT NULL,
	CONSTRAINT "memberships_wallet_address_community_id_pk" PRIMARY KEY("wallet_address","community_id")
);
--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "identity_protocol_bindings" text NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "eligibility_logic" text NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "membership_policy" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "tier_changes_require_vote" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "default_tier_id" text;