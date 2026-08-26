CREATE TABLE IF NOT EXISTS "community_discussions" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"author_address" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"eligible_tier_ids" text,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "membership_tiers" ADD COLUMN "can_post_discussions" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "community_discussions" ADD CONSTRAINT "community_discussions_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
