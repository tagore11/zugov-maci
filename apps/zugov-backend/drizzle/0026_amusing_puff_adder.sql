DROP INDEX IF EXISTS "maci_governance_configs_contract_address_unique";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "eligible_tier_ids" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "maci_governance_configs_contract_address_unique" ON "maci_governance_configs" USING btree (lower("contract_address"));