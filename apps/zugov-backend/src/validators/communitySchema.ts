import { z } from "zod";
import { communityMembershipFieldsSchema } from "./membershipSchema.js";

const addressRegex = /^0x[0-9a-fA-F]{40}$/;

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

export const communityBodySchema = z
  .object({
    displayName: z.string().min(1).max(80),
    id: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
    chainId: z.number().int().positive(),
    creatorAddress: z.string().regex(addressRegex, "Must be a 0x-prefixed 42-character hex address"),
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
    voterCapacityPreset: z.enum(["small", "medium", "large"]),
    stateTreeDepth: z.union([z.literal(6), z.literal(10), z.literal(14)]),
    description: z.string().max(500).optional(),
    logo: z.string().optional(),
    source: z.enum(["wizard", "manual"]),
    pollDeployConfig: pollDeployConfigSchema.optional(),
  })
  .and(communityMembershipFieldsSchema);

export type CommunityBody = z.infer<typeof communityBodySchema>;
