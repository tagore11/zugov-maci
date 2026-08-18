ALTER TABLE "communities" ADD COLUMN "parent_community_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "communities" ADD CONSTRAINT "communities_parent_community_id_communities_id_fk" FOREIGN KEY ("parent_community_id") REFERENCES "public"."communities"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
