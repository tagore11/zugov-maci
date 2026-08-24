ALTER TABLE "proposals" ADD COLUMN "decision_adapter_type" text DEFAULT 'maci' NOT NULL;
--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "withdrawn_at" integer;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zupoll_identity_commitments" (
	"wallet_address" text NOT NULL,
	"community_id" text NOT NULL,
	"commitment" text NOT NULL,
	"registered_at" integer NOT NULL,
	CONSTRAINT "zupoll_identity_commitments_wallet_address_community_id_pk" PRIMARY KEY("wallet_address","community_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zupoll_proposal_groups" (
	"proposal_id" text PRIMARY KEY NOT NULL,
	"group_root" text NOT NULL,
	"group_commitments" text NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zupoll_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"proposal_id" text NOT NULL,
	"option_idx" integer NOT NULL,
	"nullifier" text NOT NULL,
	"cast_at" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zupoll_identity_commitments" ADD CONSTRAINT "zupoll_identity_commitments_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zupoll_proposal_groups" ADD CONSTRAINT "zupoll_proposal_groups_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zupoll_votes" ADD CONSTRAINT "zupoll_votes_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "zupoll_votes_proposal_nullifier_idx" ON "zupoll_votes" USING btree ("proposal_id","nullifier");
