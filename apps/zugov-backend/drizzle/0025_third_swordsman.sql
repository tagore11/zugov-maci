-- Casing-independent (Review Army red-team finding, 2026-08-25): indexing lower(contract_address)
-- instead of the raw column makes the one-contract-per-community invariant hold for every
-- existing row regardless of its original casing, with no dependency on the separate
-- backfillContractAddressChecksum.ts script ever running.
CREATE UNIQUE INDEX IF NOT EXISTS "maci_governance_configs_contract_address_unique" ON "maci_governance_configs" USING btree (lower("contract_address"));