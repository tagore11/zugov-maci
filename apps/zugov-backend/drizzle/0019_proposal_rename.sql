-- Governance restructure Phase 1 (2026-08-20 /plan-eng-review), T2 — literal renames, not
-- drop-and-recreate, to preserve existing row data/ids/FKs.
--> statement-breakpoint
ALTER TABLE "governance_actions" RENAME TO "proposals";
--> statement-breakpoint
ALTER TABLE "proposals" RENAME COLUMN "tally_mechanism" TO "voting_protocol_type";
--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "decision_target_type" text NOT NULL DEFAULT 'policy';
--> statement-breakpoint
ALTER TABLE "governance_action_sponsors" RENAME TO "proposal_sponsors";
--> statement-breakpoint
ALTER TABLE "proposal_sponsors" RENAME COLUMN "governance_action_id" TO "proposal_id";
--> statement-breakpoint
ALTER TABLE "membership_tiers" RENAME COLUMN "can_create_governance_actions" TO "can_create_proposals";
