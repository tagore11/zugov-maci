CREATE TABLE IF NOT EXISTS "event_rsvps" (
	"event_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"rsvped_at" integer NOT NULL,
	"cancelled_at" integer,
	CONSTRAINT "event_rsvps_event_id_wallet_address_pk" PRIMARY KEY("event_id","wallet_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"venue_id" text,
	"location_text" text,
	"start_at" integer NOT NULL,
	"end_at" integer NOT NULL,
	"series_id" text,
	"kind" text DEFAULT 'other' NOT NULL,
	"creator_address" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" integer NOT NULL,
	"cancelled_at" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "venues" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"map_url" text,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "membership_tiers" ADD COLUMN "can_create_events" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "venues" ADD CONSTRAINT "venues_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_community_start_idx" ON "events" USING btree ("community_id","start_at");