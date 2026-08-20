CREATE TABLE IF NOT EXISTS "community_decision_adapters" (
	"community_id" text NOT NULL,
	"adapter_type" text NOT NULL,
	"attached_at" integer NOT NULL,
	CONSTRAINT "community_decision_adapters_community_id_adapter_type_pk" PRIMARY KEY("community_id","adapter_type")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "community_decision_adapters" ADD CONSTRAINT "community_decision_adapters_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
