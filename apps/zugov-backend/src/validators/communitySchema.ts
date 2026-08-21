import { z } from "zod";
import { tierBodySchema } from "./membershipSchema.js";

const addressRegex = /^0x[0-9a-fA-F]{40}$/;

// Creator-selected community type tag, shown on the community explorer's filter chips —
// independent of governance status (specs/010 US5, FR-011).
export const communityCategorySchema = z.enum(["residency", "pop_up_city", "regional", "network_state", "social"]);

// Mirrors apps/zugov-frontend/src/config.ts's existing PollDeployConfig shape exactly (nested
// treeDepths) so the frontend can send/receive it with no translation layer of its own — the
// flat-vs-nested translation happens once, in communityService.ts, against the flat DB columns.
// All fields are required together — a partial config is rejected rather than silently persisted
// with gaps, since a later formalize attempt couldn't distinguish "config is absent" from "config
// is broken" (data-model.md's all-or-nothing rule).
export const pollDeployConfigSchema = z.object({
  coordinatorPublicKey: z.string().min(1),
  treeDepths: z.object({
    tallyProcessingStateTreeDepth: z.number().int().positive(),
    voteOptionTreeDepth: z.number().int().positive(),
    stateTreeDepth: z.number().int().positive(),
  }),
  messageBatchSize: z.number().int().positive(),
  freeForAllPolicyFactory: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
  freeForAllChecker: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
  constantVoiceCreditProxyFactory: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
  initialVoiceCreditAmount: z.number().int().positive(),
});

export type PollDeployConfigBody = z.infer<typeof pollDeployConfigSchema>;

// Identity + structure only (Architecture 1A/1B/2b) — a community's identity, membership
// policy, and tiers can all exist before any governance tool is configured. Every field here
// lives on the `communities` table, never `maciGovernanceConfigs`.
export const identityFieldsSchema = z.object({
  displayName: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  logo: z.string().optional(),
  // Optional: local chapters, event teams, and contributor circles nest under a parent
  // community (Lightpaper's "communities and sub-communities" building block). Existence and
  // self-reference are checked in communityService.createIdentity(), not here — this schema
  // only validates shape. Note: unlike `id` below, a parent's id may be either a UUID
  // (wizard-created) or a legacy address (pre-split rows) — no format constraint here.
  parentCommunityId: z.string().min(1).optional(),
  membershipPolicy: z.enum(["open", "approval"]),
  category: communityCategorySchema.optional(),
  tierChangesRequireVote: z.boolean(),
  tiers: z.array(tierBodySchema).nonempty(),
  defaultTierLabel: z.string().min(1),
});

export type IdentityBody = z.infer<typeof identityFieldsSchema>;

// Governance config only (Architecture 1C) — everything needed to attach MACI governance to
// an already-created community identity. contractAddress is required here even though the DB
// column is nullable (Failure Mode #3, eng review) — attaching governance with no known
// deployed contract is not a state any flow in this app produces today.
export const governanceFieldsSchema = z.object({
  contractAddress: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
  chainId: z.number().int().positive(),
  // DomainObjs.Policy has 11 members (0-10), DomainObjs.Mode has 4 (0-3) — see
  // packages/contracts/contracts/utilities/DomainObjs.sol.
  allowedPolicies: z.array(z.number().int().min(0).max(10)).nonempty(),
  supportedModes: z.array(z.number().int().min(0).max(3)).nonempty(),
  signUpPolicyType: z.enum([
    "FreeForAll",
    "Zupass",
    "EAS",
    "GitcoinPassport",
    "Semaphore",
    "AnonAadhaar",
    "ERC20Token",
    "ERC20Votes",
    "Token",
    "MerkleProof",
    "HatsProtocol",
  ]),
  signUpPolicyAddress: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
  maciDeploymentBlock: z.number().int().nonnegative(),
  stateTreeDepth: z.union([z.literal(6), z.literal(10), z.literal(14)]),
  pollDeployConfig: pollDeployConfigSchema.optional(),
});

export type GovernanceBody = z.infer<typeof governanceFieldsSchema>;

// POST /api/communities — identity-only for the wizard (server generates id); manual
// registration (an already-deployed, externally-created contract) still provides identity +
// governance together in one call, since both are already known simultaneously in that flow.
export const communityRegistrationBodySchema = z.discriminatedUnion("source", [
  identityFieldsSchema.extend({ source: z.literal("wizard") }),
  identityFieldsSchema.merge(governanceFieldsSchema).extend({
    source: z.literal("manual"),
    id: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
  }),
]);

export type CommunityRegistrationBody = z.infer<typeof communityRegistrationBodySchema>;

// POST /api/communities/:id/governance — attach governance to an existing identity.
export const attachGovernanceBodySchema = governanceFieldsSchema;
