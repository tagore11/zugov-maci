CREATE TABLE IF NOT EXISTS "communities" (
	"id" text PRIMARY KEY NOT NULL,
	"chain_id" integer NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"logo" text,
	"creator_address" text NOT NULL,
	"governance_type" text DEFAULT 'maci' NOT NULL,
	"allowed_policies" text NOT NULL,
	"supported_modes" text NOT NULL,
	"voter_capacity_preset" text NOT NULL,
	"state_tree_depth" integer NOT NULL,
	"created_at" integer NOT NULL,
	"registered_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credentials" (
	"wallet_address" text NOT NULL,
	"protocol" text NOT NULL,
	"status" text NOT NULL,
	"proof_ref" text,
	"last_checked_at" integer NOT NULL,
	"created_at" integer NOT NULL,
	CONSTRAINT "credentials_wallet_address_protocol_pk" PRIMARY KEY("wallet_address","protocol")
);
