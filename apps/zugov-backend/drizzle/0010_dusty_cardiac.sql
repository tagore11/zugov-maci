ALTER TABLE "governance_actions" ADD COLUMN "tally_status" text DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "governance_actions" ADD COLUMN "tally_error" text;--> statement-breakpoint
ALTER TABLE "governance_actions" ADD COLUMN "tally_requested_at" integer;--> statement-breakpoint
ALTER TABLE "governance_actions" ADD COLUMN "tally_completed_at" integer;--> statement-breakpoint
ALTER TABLE "governance_actions" ADD COLUMN "tally_result" text;