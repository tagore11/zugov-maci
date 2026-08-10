ALTER TABLE "communities" ADD COLUMN "coordinator_public_key" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "tally_processing_state_tree_depth" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "vote_option_tree_depth" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "message_batch_size" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "free_for_all_policy_factory" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "free_for_all_checker" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "constant_voice_credit_proxy_factory" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "initial_voice_credit_amount" integer;