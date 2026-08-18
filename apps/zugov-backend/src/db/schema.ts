import { pgTable, text, integer, boolean, primaryKey, type AnyPgColumn } from "drizzle-orm/pg-core";
import type { CredentialStatus, Protocol } from "../services/identity/IdentityProvider.js";

// Server-side session store: the cookie only ever holds an opaque random token (see
// middleware/session.ts) — session data itself lives here, so a logout actually revokes it
// (delete the row) instead of just removing a client-side cookie whose signed contents would
// otherwise still verify if replayed.
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  address: text("address"),
  chainId: integer("chain_id"),
  nonce: text("nonce"),
  nonceExpiresAt: integer("nonce_expires_at"),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const credentials = pgTable(
  "credentials",
  {
    walletAddress: text("wallet_address").notNull(),
    protocol: text("protocol").$type<Protocol>().notNull(),
    status: text("status").$type<CredentialStatus>().notNull(),
    proofRef: text("proof_ref"),
    lastCheckedAt: integer("last_checked_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.walletAddress, table.protocol] })],
);

export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;

export const communities = pgTable("communities", {
  id: text("id").primaryKey(),
  chainId: integer("chain_id").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  logo: text("logo"),
  creatorAddress: text("creator_address").notNull(),
  // Lightpaper's "communities and sub-communities" building block: local chapters, event
  // teams, and contributor circles as first-class components, not a separate hierarchy
  // bolted on top. Self-referencing, nullable — top-level communities have no parent.
  // ON DELETE SET NULL: deleting a parent orphans its children as top-level rather than
  // cascading the delete (a parent community disappearing shouldn't take its sub-communities
  // with it).
  parentCommunityId: text("parent_community_id").references((): AnyPgColumn => communities.id, {
    onDelete: "set null",
  }),
  governanceType: text("governance_type").notNull().default("maci"),
  allowedPolicies: text("allowed_policies").notNull(),
  supportedModes: text("supported_modes").notNull(),
  // Nullable: communities registered before this column existed have no recorded value.
  signUpPolicyType: text("sign_up_policy_type"),
  signUpPolicyAddress: text("sign_up_policy_address"),
  stateTreeDepth: integer("state_tree_depth").notNull(),
  membershipPolicy: text("membership_policy").$type<"open" | "approval">().notNull().default("open"),
  tierChangesRequireVote: boolean("tier_changes_require_vote").notNull().default(false),
  defaultTierId: text("default_tier_id"),
  cosponsorshipThreshold: integer("cosponsorship_threshold").notNull().default(0),
  directDeploymentEnabled: boolean("direct_deployment_enabled").notNull().default(false),
  coordinatorPublicKey: text("coordinator_public_key"),
  tallyProcessingStateTreeDepth: integer("tally_processing_state_tree_depth"),
  voteOptionTreeDepth: integer("vote_option_tree_depth"),
  messageBatchSize: integer("message_batch_size"),
  freeForAllPolicyFactory: text("free_for_all_policy_factory"),
  freeForAllChecker: text("free_for_all_checker"),
  constantVoiceCreditProxyFactory: text("constant_voice_credit_proxy_factory"),
  initialVoiceCreditAmount: integer("initial_voice_credit_amount"),
  // Block the MACI contract was deployed at — the subgraph's indexing start block.
  // Nullable: communities registered before this column existed have no recorded value.
  maciDeploymentBlock: integer("maci_deployment_block"),
  subgraphName: text("subgraph_name"),
  subgraphStatus: text("subgraph_status").$type<"pending" | "ready" | "failed">().notNull().default("pending"),
  createdAt: integer("created_at").notNull(),
  registeredAt: integer("registered_at").notNull(),
});

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;

export const membershipTiers = pgTable("membership_tiers", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull(),
  label: text("label").notNull(),
  canCreateGovernanceActions: boolean("can_create_governance_actions").notNull(),
  canVote: boolean("can_vote").notNull(),
  canManageMembership: boolean("can_manage_membership").notNull(),
  canDelegate: boolean("can_delegate").notNull().default(false),
  canBeDelegatedTo: boolean("can_be_delegated_to").notNull().default(false),
  createdAt: integer("created_at").notNull(),
});

export type MembershipTier = typeof membershipTiers.$inferSelect;
export type NewMembershipTier = typeof membershipTiers.$inferInsert;

export const memberships = pgTable(
  "memberships",
  {
    walletAddress: text("wallet_address").notNull(),
    communityId: text("community_id").notNull(),
    tierId: text("tier_id").notNull(),
    joinedAt: integer("joined_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.walletAddress, table.communityId] })],
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;

export const joinRequests = pgTable("join_requests", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  status: text("status").$type<"pending" | "approved" | "rejected">().notNull(),
  createdAt: integer("created_at").notNull(),
  resolvedAt: integer("resolved_at"),
});

export type JoinRequest = typeof joinRequests.$inferSelect;
export type NewJoinRequest = typeof joinRequests.$inferInsert;

export const governanceActions = pgTable("governance_actions", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull(),
  type: text("type").$type<"poll">().notNull().default("poll"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  privacy: text("privacy").$type<"public" | "privacy_preserving">().notNull(),
  executionLocation: text("execution_location").$type<"onchain" | "offchain" | "hybrid">().notNull(),
  tallyMechanism: text("tally_mechanism").$type<"simple" | "quadratic" | "ranked" | "weighted" | "full">().notNull(),
  eligibleTierIds: text("eligible_tier_ids").notNull(), // JSON-stringified string[]
  status: text("status").$type<"draft" | "formalized">().notNull().default("draft"),
  creationPath: text("creation_path").$type<"draft" | "direct">().notNull().default("draft"),
  creatorAddress: text("creator_address").notNull(),
  pollAddress: text("poll_address"),
  pollId: text("poll_id"),
  createdAt: integer("created_at").notNull(),
  formalizedAt: integer("formalized_at"),
});

export type GovernanceAction = typeof governanceActions.$inferSelect;
export type NewGovernanceAction = typeof governanceActions.$inferInsert;

export const governanceActionSponsors = pgTable(
  "governance_action_sponsors",
  {
    governanceActionId: text("governance_action_id").notNull(),
    walletAddress: text("wallet_address").notNull(),
    sponsoredAt: integer("sponsored_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.governanceActionId, table.walletAddress] })],
);

export type GovernanceActionSponsor = typeof governanceActionSponsors.$inferSelect;
export type NewGovernanceActionSponsor = typeof governanceActionSponsors.$inferInsert;
