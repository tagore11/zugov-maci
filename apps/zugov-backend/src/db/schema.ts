import { pgTable, text, integer, boolean, primaryKey, index, type AnyPgColumn } from "drizzle-orm/pg-core";
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
  // Creator-selected community type tag (Residency/Regional/Network State/Social), shown on the
  // community explorer's filter chips. Nullable: communities created before this column existed
  // have no value, and the explorer's "All" filter still includes them. Unrelated to governance —
  // never conflate with governanceType/subgraphStatus (see the landing page's governance badge).
  category: text("category").$type<"residency" | "regional" | "network_state" | "social">(),
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

// Governance restructure Phase 1 (2026-08-20 /plan-eng-review) — D1: governanceType generalizes
// from a single fixed value into a real menu of decision adapters a community has attached.
// This table is that menu. A community can have zero rows (no governance attached at all — an
// accepted, permanent state, not a defect, per D2) or more than one once a second adapter exists
// (Phase 1 only ever inserts adapterType: "maci"). Composite PK (communityId, adapterType)
// mirrors unionMemberships' style below — the natural key IS this pair, no synthetic id needed
// since nothing else FKs into an individual row yet. adapterType: "maci" today reads its actual
// config from maciGovernanceConfigs (unchanged, still keyed by communityId alone) rather than
// duplicating that config here — this table only tracks *which* adapters are attached, not their
// per-adapter settings.
export const communityDecisionAdapters = pgTable(
  "community_decision_adapters",
  {
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    adapterType: text("adapter_type").$type<"maci">().notNull(),
    attachedAt: integer("attached_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.communityId, table.adapterType] })],
);

export type CommunityDecisionAdapter = typeof communityDecisionAdapters.$inferSelect;
export type NewCommunityDecisionAdapter = typeof communityDecisionAdapters.$inferInsert;

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
  canCreateProposals: boolean("can_create_proposals").notNull(),
  canVote: boolean("can_vote").notNull(),
  canManageMembership: boolean("can_manage_membership").notNull(),
  canDelegate: boolean("can_delegate").notNull().default(false),
  canBeDelegatedTo: boolean("can_be_delegated_to").notNull().default(false),
  // Events (2026-08-19 eng review): default true so the "anyone can propose an event" model
  // (matched to how pop-up-city events actually work — see review's sola.day research) is the
  // out-of-the-box behavior; a community can restrict it per-tier without a migration.
  canCreateEvents: boolean("can_create_events").notNull().default(true),
  // Eligibility-adapters review (2026-08-19): breaks ties when a wallet's holdings satisfy
  // multiple eligibilityRules groups at once (e.g. an ERC20 balance clearing both a "Resident"
  // and a higher "OG" threshold) — the group targeting the highest-rank tier wins, regardless
  // of group order in the ruleset. Default 0 for every existing tier; only meaningful once a
  // community actually defines tier-targeting eligibility rules.
  rank: integer("rank").notNull().default(0),
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
  // Eligibility-adapters review (2026-08-19), outside-voice finding D7: the wallet's eligibility
  // (and resolved tier) is evaluated once, at submission time — not re-evaluated at approval
  // time, matching how the instant-join path already treats eligibility as a submission-time
  // gate. Nullable: requests submitted before this column existed, or a defensive fallback to
  // defaultTierId if something upstream failed to set it.
  tierId: text("tier_id"),
  createdAt: integer("created_at").notNull(),
  resolvedAt: integer("resolved_at"),
});

export type JoinRequest = typeof joinRequests.$inferSelect;
export type NewJoinRequest = typeof joinRequests.$inferInsert;

// Governance restructure Phase 1 (2026-08-20 /plan-eng-review) — renamed from governanceActions.
// "Proposal" is the one generic app-layer word for the thing a community decides on, matching
// what users already see (the "Proposals" nav link, /proposals, CreateProposalModal) and
// DAO-industry convention (Snapshot/Tally/Governor all call it this) — the backend previously
// disagreed with its own frontend by calling the same object "governanceAction"/"poll".
export const proposals = pgTable("proposals", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull(),
  type: text("type").$type<"poll">().notNull().default("poll"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  privacy: text("privacy").$type<"public" | "privacy_preserving">().notNull(),
  executionLocation: text("execution_location").$type<"onchain" | "offchain" | "hybrid">().notNull(),
  // Renamed from tallyMechanism — grounded in Snapshot's real documented "voting types" (ballot
  // format/aggregation rule: single-choice, approval, weighted, quadratic, ranked-choice), not
  // to be confused with "voting strategy" (voter-power computation — a distinct, currently
  // unbuilt concept per the governance-terminology glossary). Existing values/behavior
  // unchanged — this pass is a rename, not a fix for the ranked/weighted mode-mapping issue
  // tracked separately in TODOS.md.
  votingProtocolType: text("voting_protocol_type")
    .$type<"simple" | "quadratic" | "ranked" | "weighted" | "full">()
    .notNull(),
  // What kind of decision this is — opinion (non-binding, e.g. a survey/straw-poll), policy
  // (a binding decision on a proposal/rule — what every existing MACI-formalized vote already
  // is), or person (electing/assigning someone to a role, not yet built anywhere). Classification
  // only this pass — the post-proposal enactment behavior it should drive (e.g. registering an
  // elected person) is deferred, see TODOS.md. Defaults to "policy" for the same reason existing
  // rows get backfilled that way: every proposal that exists today already IS a binding decision.
  decisionTargetType: text("decision_target_type").$type<"opinion" | "policy" | "person">().notNull().default("policy"),
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
  // JSON-stringified string[] of the poll's option labels, written alongside pollAddress/pollId
  // at deploy-confirm time. A read-optimized copy of data also sent on-chain as Poll metadata —
  // not available uniformly via the subgraph (some communities have none), so this column is the
  // only source guaranteed to be present for every deployed poll's vote screen.
  options: text("options"),
  // "person"-type (election) proposals only. JSON-stringified string[], same index as
  // `options` — option[i]'s candidate wallet address. Governance restructure Phase 2
  // (2026-08-20) — direct-deploy creation path only; the draft/co-sponsorship path collects
  // options later, at formalize time, with no validation hook for this field yet.
  optionMemberAddresses: text("option_member_addresses"),
  // "person"-type only. Set once by tallyService on tally completion, from the winning
  // option's optionMemberAddresses entry. Stays null on a tie — an honest "no winner" state,
  // never a guessed one — and for every non-person-type proposal.
  electedWalletAddress: text("elected_wallet_address"),
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

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;

export const proposalSponsors = pgTable(
  "proposal_sponsors",
  {
    proposalId: text("proposal_id").notNull(),
    walletAddress: text("wallet_address").notNull(),
    sponsoredAt: integer("sponsored_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.proposalId, table.walletAddress] })],
);

export type ProposalSponsor = typeof proposalSponsors.$inferSelect;
export type NewProposalSponsor = typeof proposalSponsors.$inferInsert;

// Events (2026-08-19 eng review, see TODOS.md "Events" entries for the full design log).
// Identity/structural layer, same as unions and parentCommunityId — anchored to
// communities.id, never governance-gated. Reusable per-community location, deliberately its
// own entity (not a text field on events) so it can be referenced across many events, matching
// how a real multi-week pop-up city actually uses a handful of fixed physical spaces.
// ON DELETE CASCADE: a venue with no community behind it is meaningless (same reasoning as
// maciGovernanceConfigs). NOTE: no DELETE /venues/:id route exists yet (see TODOS.md "Venue
// deletion + venueId invariant fix") — events.venueId's ON DELETE SET NULL is currently
// unreachable via the API, but documented so whoever adds venue deletion doesn't get surprised.
export const venues = pgTable("venues", {
  id: text("id").primaryKey(),
  communityId: text("community_id")
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  mapUrl: text("map_url"),
  createdAt: integer("created_at").notNull(),
});

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;

// Anchored to communities.id per the hard constraint locked in the 2026-08-18 union-communities
// review: events live at the identity/structural layer, independent of whichever governance
// tool (MACI today) a community has configured — never reference maciGovernanceConfigs.
//
// venueId / locationText: exactly one is set, enforced by the create/update Zod validator (not
// a DB constraint) — a structured reusable venue, or a free-text fallback (virtual meeting URL,
// one-off address). ON DELETE SET NULL on venueId (not CASCADE): an event losing its venue
// reference is still a meaningful event (title/time/community intact), unlike
// maciGovernanceConfigs' CASCADE case.
//
// seriesId: NOT a self-referencing FK — just a shared UUID stamped across every row a
// duplicate() call generates, so "all events in this series" is one WHERE clause. Recurring
// events are independent rows on purpose (2026-08-19 review, D4): no RRULE engine, matching
// sola.day's own live API, which has no recurrence params either. Multi-day is never stored —
// it's computed as endAt - startAt > 24h wherever it's displayed.
//
// status: "active" | "cancelled", soft-cancel only (mirrors unionMemberships — cancel doesn't
// delete the row). Editable/cancelable by the creator OR a wallet with canManageMembership on
// the community (2026-08-19 review, outside-voice finding: creator-only broke
// ENGINEERING.md's "authorization is one reusable pattern" rule — proposals already
// re-validates permission at mutation time for the same reason).
export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    venueId: text("venue_id").references(() => venues.id, { onDelete: "set null" }),
    locationText: text("location_text"),
    startAt: integer("start_at").notNull(),
    endAt: integer("end_at").notNull(),
    seriesId: text("series_id"),
    kind: text("kind").$type<"talk" | "workshop" | "social" | "meeting" | "other">().notNull().default("other"),
    creatorAddress: text("creator_address").notNull(),
    status: text("status").$type<"active" | "cancelled">().notNull().default("active"),
    createdAt: integer("created_at").notNull(),
    cancelledAt: integer("cancelled_at"),
  },
  // Primary list query ("events for community X in date range A-B") is a range scan on exactly
  // these two columns — the first explicit secondary index in this schema file, added
  // deliberately for a known hot path rather than following the rest of the schema's
  // PK-implicit-index-only convention (2026-08-19 review, Performance section).
  (table) => [index("events_community_start_idx").on(table.communityId, table.startAt)],
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

// RSVP is intent only — check-in/confirmed-attendance is deliberately deferred to the separate
// "Contribution layer" TODO (badges/credentials), not built here (2026-08-19 review, D3).
// Deliberately open to ANY signed-in wallet, not gated on community membership — more open than
// voting/governance-action creation on purpose (2026-08-19 review, A1).
//
// status: "active" | "cancelled", soft-cancel (mirrors unionMemberships exactly) — a
// cancel-then-re-RSVP flips the same row back to "active" instead of creating a duplicate,
// same "declined row resets to pending" shape invite() already uses for unions.
export const eventRsvps = pgTable(
  "event_rsvps",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address").notNull(),
    status: text("status").$type<"active" | "cancelled">().notNull().default("active"),
    rsvpedAt: integer("rsvped_at").notNull(),
    cancelledAt: integer("cancelled_at"),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.walletAddress] })],
);

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type NewEventRsvp = typeof eventRsvps.$inferInsert;

// Eligibility adapters (2026-08-19 /plan-eng-review) — identity/structural layer, anchored to
// communities.id, never governance-gated (same reasoning as venues/events: "who can join this
// community" is independent of whether/which governance tool is configured). One ruleset per
// community; absence of a row means "Open" (always eligible) — identical to every existing
// community's real current behavior, so no migration/backfill was needed to introduce this.
// ON DELETE CASCADE: a ruleset with no community behind it is meaningless.
export const eligibilityRulesets = pgTable("eligibility_rulesets", {
  id: text("id").primaryKey(),
  communityId: text("community_id")
    .notNull()
    .unique()
    .references(() => communities.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type EligibilityRuleset = typeof eligibilityRulesets.$inferSelect;
export type NewEligibilityRuleset = typeof eligibilityRulesets.$inferInsert;

// Composition is Disjunctive Normal Form (DNF): rules sharing the same groupIndex are AND-ed
// together; distinct groupIndex values are OR-ed. A wallet is eligible if ANY group's rules all
// pass. Deliberately flat (no separate groups table, no recursive tree) — covers every
// realistic eligibility scenario without a recursive data model or evaluator; a full nested
// AND/OR/NOT tree is explicitly out of scope for this pass (see TODOS.md).
//
// targetTierId: which membership tier a wallet is granted if THIS GROUP is the one that ends up
// winning (see membershipTiers.rank for how ties between multiple passing groups resolve).
// Nullable — a group with no target tier just gates access without tier-assignment (falls back
// to the community's defaultTierId). No ON DELETE behavior set (defaults to Postgres's
// NO ACTION): membershipService.deleteTier's existing TierInUseError guard is extended to block
// deleting a tier that's any rule's targetTierId, so this FK should never actually be hit by a
// real delete attempt — it exists as a defense-in-depth backstop, not the primary guard.
//
// config: JSON-stringified, shape depends on `mechanism` (matches every other JSON-as-text
// column in this file — allowedPolicies, eligibleTierIds, options, tallyResult — not jsonb).
// ON DELETE CASCADE on rulesetId: a rule with no ruleset behind it is meaningless.
export const eligibilityRules = pgTable("eligibility_rules", {
  id: text("id").primaryKey(),
  rulesetId: text("ruleset_id")
    .notNull()
    .references(() => eligibilityRulesets.id, { onDelete: "cascade" }),
  groupIndex: integer("group_index").notNull(),
  mechanism: text("mechanism").$type<"open" | "tier" | "erc20_token">().notNull(),
  config: text("config").notNull(),
  targetTierId: text("target_tier_id").references(() => membershipTiers.id),
  createdAt: integer("created_at").notNull(),
});

export type EligibilityRule = typeof eligibilityRules.$inferSelect;
export type NewEligibilityRule = typeof eligibilityRules.$inferInsert;
