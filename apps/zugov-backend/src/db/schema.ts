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

// Identity + structure only — deliberately NOT a governance object. A community's identity
// can exist before any governance tool is configured (see maciGovernanceConfigs below); this
// table holds only what's true regardless of which governance backend (if any) a community
// runs. Membership/role structure (membershipPolicy, tierChangesRequireVote, defaultTierId)
// lives here too, not in the governance table — "who belongs and what they can do" is a
// structural fact about a community, not a property of its voting mechanism.
export const communities = pgTable("communities", {
  id: text("id").primaryKey(),
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
  membershipPolicy: text("membership_policy").$type<"open" | "approval">().notNull().default("open"),
  tierChangesRequireVote: boolean("tier_changes_require_vote").notNull().default(false),
  defaultTierId: text("default_tier_id"),
  cosponsorshipThreshold: integer("cosponsorship_threshold").notNull().default(0),
  directDeploymentEnabled: boolean("direct_deployment_enabled").notNull().default(false),
  createdAt: integer("created_at").notNull(),
  registeredAt: integer("registered_at").notNull(),
});

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;

// Governance layer — MACI-specific today, but deliberately its own table (not columns bolted
// onto communities) so a community's identity doesn't imply a governance tool. 1:1 with
// communities via PK=communityId; a row here existing at all means "this community has
// governance configured" (see communityService.parseRecord's governanceConfigured flag).
// ON DELETE CASCADE: a governance config with no identity behind it is meaningless, unlike
// parentCommunityId's SET NULL (a child community remains meaningful without its parent).
export const maciGovernanceConfigs = pgTable("maci_governance_configs", {
  communityId: text("community_id")
    .primaryKey()
    .references(() => communities.id, { onDelete: "cascade" }),
  // The deployed MACI contract's address. Nullable at the DB level for flexibility, but the
  // POST /communities/:id/governance request validator requires it — attaching governance
  // without a known deployed contract is not a state this app's flows ever produce today.
  contractAddress: text("contract_address"),
  chainId: integer("chain_id").notNull(),
  governanceType: text("governance_type").notNull().default("maci"),
  allowedPolicies: text("allowed_policies").notNull(),
  supportedModes: text("supported_modes").notNull(),
  signUpPolicyType: text("sign_up_policy_type"),
  signUpPolicyAddress: text("sign_up_policy_address"),
  stateTreeDepth: integer("state_tree_depth").notNull(),
  coordinatorPublicKey: text("coordinator_public_key"),
  tallyProcessingStateTreeDepth: integer("tally_processing_state_tree_depth"),
  voteOptionTreeDepth: integer("vote_option_tree_depth"),
  messageBatchSize: integer("message_batch_size"),
  freeForAllPolicyFactory: text("free_for_all_policy_factory"),
  freeForAllChecker: text("free_for_all_checker"),
  constantVoiceCreditProxyFactory: text("constant_voice_credit_proxy_factory"),
  initialVoiceCreditAmount: integer("initial_voice_credit_amount"),
  // Block the MACI contract was deployed at — the subgraph's indexing start block.
  maciDeploymentBlock: integer("maci_deployment_block"),
  subgraphName: text("subgraph_name"),
  subgraphStatus: text("subgraph_status").$type<"pending" | "ready" | "failed">().notNull().default("pending"),
});

export type MaciGovernanceConfig = typeof maciGovernanceConfigs.$inferSelect;
export type NewMaciGovernanceConfig = typeof maciGovernanceConfigs.$inferInsert;

// Peer/federation relationship between fully independent communities — distinct from
// parentCommunityId's hierarchy. A union has no governance of its own; it's a structural
// grouping, same layer as communities themselves. id is always a server-generated UUID, never
// an address — unions are never on-chain deployed objects.
export const unions = pgTable("unions", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  logo: text("logo"),
  creatorAddress: text("creator_address").notNull(),
  createdAt: integer("created_at").notNull(),
});

export type Union = typeof unions.$inferSelect;
export type NewUnion = typeof unions.$inferInsert;

// Many-to-many, consent-gated: invite() creates a "pending" row, respond() (by the INVITED
// community's own admin, never the inviter) flips it to "active" or "declined". leave() (by the
// MEMBER community's own admin) flips an "active" row to "left". A later invite() on a
// "declined" or "left" row resets it to "pending" — neither declining nor leaving is permanent.
export const unionMemberships = pgTable(
  "union_memberships",
  {
    unionId: text("union_id")
      .notNull()
      .references(() => unions.id, { onDelete: "cascade" }),
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    status: text("status").$type<"pending" | "active" | "declined" | "left">().notNull(),
    invitedByAddress: text("invited_by_address").notNull(),
    requestedAt: integer("requested_at").notNull(),
    respondedAt: integer("responded_at"),
    leftAt: integer("left_at"),
  },
  (table) => [primaryKey({ columns: [table.unionId, table.communityId] })],
);

export type UnionMembership = typeof unionMemberships.$inferSelect;
export type NewUnionMembership = typeof unionMemberships.$inferInsert;

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
  // Unix seconds. Only set once the poll is actually deployed (alongside pollAddress/pollId) —
  // needed server-side to validate "has this poll closed" before allowing a tally trigger,
  // without requiring a live on-chain/subgraph read for that one check.
  pollStartDate: integer("poll_start_date"),
  pollEndDate: integer("poll_end_date"),
  createdAt: integer("created_at").notNull(),
  formalizedAt: integer("formalized_at"),
  // Only meaningful once pollAddress is set (i.e. the poll has actually been deployed on-chain).
  // "not_started" until someone triggers tallying via the coordinator; "pending"/"processing"
  // while the merge → generate → submit pipeline runs as a background task (it can take minutes
  // to hours for a real-size poll — never run synchronously in a request).
  tallyStatus: text("tally_status")
    .$type<"not_started" | "pending" | "processing" | "completed" | "failed">()
    .notNull()
    .default("not_started"),
  tallyError: text("tally_error"),
  tallyRequestedAt: integer("tally_requested_at"),
  tallyCompletedAt: integer("tally_completed_at"),
  // JSON-stringified ITallyData from the coordinator's submit response, once completed.
  tallyResult: text("tally_result"),
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
