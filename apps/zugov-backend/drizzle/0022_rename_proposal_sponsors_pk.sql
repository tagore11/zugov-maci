-- 0019_proposal_rename.sql renamed governance_action_sponsors -> proposal_sponsors but Postgres
-- doesn't auto-rename a table's constraints on ALTER TABLE ... RENAME TO, leaving the primary key
-- constraint on the old name. Completes the rename drizzle-kit generate expects (matches its own
-- <table>_<columns>_pk naming convention) and was the root cause of drizzle/meta's snapshot drift
-- since 0019 (see TODOS.md).
ALTER TABLE "proposal_sponsors" RENAME CONSTRAINT "governance_action_sponsors_governance_action_id_wallet_address_" TO "proposal_sponsors_proposal_id_wallet_address_pk";
