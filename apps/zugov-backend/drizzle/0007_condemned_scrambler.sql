ALTER TABLE "communities" ADD COLUMN "maci_deployment_block" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "subgraph_name" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "subgraph_status" text DEFAULT 'pending' NOT NULL;