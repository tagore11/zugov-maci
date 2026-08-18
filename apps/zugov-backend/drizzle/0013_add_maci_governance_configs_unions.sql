CREATE TABLE IF NOT EXISTS "maci_governance_configs" (
	"community_id" text PRIMARY KEY NOT NULL,
	"contract_address" text,
	"chain_id" integer NOT NULL,
	"governance_type" text DEFAULT 'maci' NOT NULL,
	"allowed_policies" text NOT NULL,
	"supported_modes" text NOT NULL,
	"sign_up_policy_type" text,
	"sign_up_policy_address" text,
	"state_tree_depth" integer NOT NULL,
	"coordinator_public_key" text,
	"tally_processing_state_tree_depth" integer,
	"vote_option_tree_depth" integer,
	"message_batch_size" integer,
	"free_for_all_policy_factory" text,
	"free_for_all_checker" text,
	"constant_voice_credit_proxy_factory" text,
	"initial_voice_credit_amount" integer,
	"maci_deployment_block" integer,
	"subgraph_name" text,
	"subgraph_status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "union_memberships" (
	"union_id" text NOT NULL,
	"community_id" text NOT NULL,
	"status" text NOT NULL,
	"invited_by_address" text NOT NULL,
	"requested_at" integer NOT NULL,
	"responded_at" integer,
	CONSTRAINT "union_memberships_union_id_community_id_pk" PRIMARY KEY("union_id","community_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unions" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"logo" text,
	"creator_address" text NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maci_governance_configs" ADD CONSTRAINT "maci_governance_configs_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "union_memberships" ADD CONSTRAINT "union_memberships_union_id_unions_id_fk" FOREIGN KEY ("union_id") REFERENCES "public"."unions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "union_memberships" ADD CONSTRAINT "union_memberships_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- Backfill existing communities' governance data into the new table before the columns are
-- dropped below. contractAddress comes from the old id column — historically id WAS the
-- deployed MACI contract address for every row that existed before this migration.
INSERT INTO "maci_governance_configs" (
	"community_id", "contract_address", "chain_id", "governance_type", "allowed_policies",
	"supported_modes", "sign_up_policy_type", "sign_up_policy_address", "state_tree_depth",
	"coordinator_public_key", "tally_processing_state_tree_depth", "vote_option_tree_depth",
	"message_batch_size", "free_for_all_policy_factory", "free_for_all_checker",
	"constant_voice_credit_proxy_factory", "initial_voice_credit_amount", "maci_deployment_block",
	"subgraph_name", "subgraph_status"
)
SELECT
	"id", "id", "chain_id", "governance_type", "allowed_policies", "supported_modes",
	"sign_up_policy_type", "sign_up_policy_address", "state_tree_depth", "coordinator_public_key",
	"tally_processing_state_tree_depth", "vote_option_tree_depth", "message_batch_size",
	"free_for_all_policy_factory", "free_for_all_checker", "constant_voice_credit_proxy_factory",
	"initial_voice_credit_amount", "maci_deployment_block", "subgraph_name", "subgraph_status"
FROM "communities"
ON CONFLICT ("community_id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "chain_id";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "governance_type";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "allowed_policies";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "supported_modes";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "sign_up_policy_type";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "sign_up_policy_address";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "state_tree_depth";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "coordinator_public_key";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "tally_processing_state_tree_depth";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "vote_option_tree_depth";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "message_batch_size";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "free_for_all_policy_factory";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "free_for_all_checker";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "constant_voice_credit_proxy_factory";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "initial_voice_credit_amount";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "maci_deployment_block";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "subgraph_name";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "subgraph_status";