import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../../src/db/schema.js";

function getTestDb() {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL or DATABASE_URL must be set for tests");
  const client = postgres(url);
  return drizzle(client, { schema });
}

export const testDb = getTestDb();

// membership_tiers/memberships/join_requests/governance_actions/governance_action_sponsors all
// reference a community_id with no DB-level foreign key (this schema doesn't declare FKs), so
// clearing only `communities` silently orphans rows in every dependent table across test runs —
// they accumulate indefinitely and stale rows leak into later assertions (e.g. `.find()` picking
// up a duplicate-labeled tier from a previous run instead of the one just created). Clear every
// dependent table first, then communities.
export async function clearCommunities() {
  // zupollVotes/zupollProposalGroups FK to proposals (CASCADE), zupollIdentityCommitments FKs
  // to communities (CASCADE) — DB-level cascade already covers these deletes, but cleared
  // explicitly first anyway to match this function's existing "clear every dependent table" style
  // rather than relying on cascade behavior implicitly.
  await testDb.delete(schema.zupollVotes);
  await testDb.delete(schema.zupollProposalGroups);
  await testDb.delete(schema.zupollIdentityCommitments);
  await testDb.delete(schema.proposalSponsors);
  await testDb.delete(schema.proposals);
  // eligibilityRules.targetTierId FKs to membershipTiers.id with no ON DELETE action (RESTRICT
  // by default) — must clear before membershipTiers or that delete fails with a FK violation.
  await testDb.delete(schema.eligibilityRules);
  await testDb.delete(schema.eligibilityRulesets);
  await testDb.delete(schema.joinRequests);
  await testDb.delete(schema.memberships);
  await testDb.delete(schema.membershipTiers);
  await testDb.delete(schema.unionMemberships);
  await testDb.delete(schema.unions);
  await testDb.delete(schema.maciGovernanceConfigs);
  await testDb.delete(schema.communityDecisionAdapters);
  await testDb.delete(schema.communities);
}

export async function clearCredentials() {
  await testDb.delete(schema.credentials);
}

export async function setupTestDb() {
  await testDb.execute(sql`
    CREATE TABLE IF NOT EXISTS communities (
      id text PRIMARY KEY,
      chain_id integer NOT NULL,
      display_name text NOT NULL,
      description text,
      logo text,
      creator_address text NOT NULL,
      governance_type text NOT NULL DEFAULT 'maci',
      allowed_policies text NOT NULL,
      supported_modes text NOT NULL,
      voter_capacity_preset text NOT NULL,
      state_tree_depth integer NOT NULL,
      created_at integer NOT NULL,
      registered_at integer NOT NULL
    )
  `);
  await testDb.execute(sql`
    CREATE TABLE IF NOT EXISTS credentials (
      wallet_address text NOT NULL,
      protocol text NOT NULL,
      status text NOT NULL,
      proof_ref text,
      last_checked_at integer NOT NULL,
      created_at integer NOT NULL,
      PRIMARY KEY (wallet_address, protocol)
    )
  `);
}

export async function teardownTestDb() {
  await clearCommunities();
  await clearCredentials();
}
