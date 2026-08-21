import { z } from "zod";

export const createDraftBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  privacy: z.enum(["public", "privacy_preserving"]),
  executionLocation: z.enum(["onchain", "offchain", "hybrid"]),
  votingProtocolType: z.enum(["simple", "quadratic", "ranked", "weighted", "full"]),
  eligibleTierIds: z.array(z.string()).nonempty(),
});

export type CreateDraftBody = z.infer<typeof createDraftBodySchema>;

export const formalizeConfirmBodySchema = z.object({
  pollAddress: z.string().min(1),
  pollId: z.string().min(1),
  txHash: z.string().min(1),
  pollStartDate: z.number().int().nonnegative(),
  pollEndDate: z.number().int().nonnegative(),
  // The poll's option labels, collected by the deploy-poll UI and already sent on-chain as Poll
  // metadata — persisted here too since the subgraph isn't available for every community (specs/010
  // research.md #1). Optional so a caller that somehow omits it doesn't hard-fail the confirm step.
  options: z.array(z.string()).min(2).optional(),
});

export type FormalizeConfirmBody = z.infer<typeof formalizeConfirmBodySchema>;

// specs/007: same shape as createDraftBodySchema — direct deployment reuses drafting's own
// eligibility/axis rules (research.md #2), it just skips the draft/co-sponsorship stage.
//
// Governance restructure Phase 2 (2026-08-20) — decisionTargetType/optionMemberAddresses/options
// are added here, NOT on createDraftBodySchema, deliberately: "person"-type (election) proposals
// are direct-deploy only this phase (the draft/co-sponsorship path collects options later, at
// formalize time, with no validation hook for optionMemberAddresses today — see
// proposalService.ts's validateTierAndAxis). Sending `options` at authorize time (in addition to
// confirm time, where it's sent again after the actual on-chain deploy) lets the length-match
// check against optionMemberAddresses run before the wallet-signed deploy transaction, not after.
export const directAuthorizeBodySchema = createDraftBodySchema.extend({
  decisionTargetType: z.enum(["opinion", "policy", "person"]).optional(),
  optionMemberAddresses: z.array(z.string()).optional(),
  options: z.array(z.string()).optional(),
});

export type DirectAuthorizeBody = z.infer<typeof directAuthorizeBodySchema>;

export const directConfirmBodySchema = directAuthorizeBodySchema.extend({
  pollAddress: z.string().min(1),
  pollId: z.string().min(1),
  txHash: z.string().min(1),
  pollStartDate: z.number().int().nonnegative(),
  pollEndDate: z.number().int().nonnegative(),
  options: z.array(z.string()).min(2).optional(),
});

export type DirectConfirmBody = z.infer<typeof directConfirmBodySchema>;

// specs/013-zupoll-decision-adapter — deliberately its own schema, not an extension of
// createDraftBodySchema: Zupoll proposals have no privacy/executionLocation/votingProtocolType
// choice (always "privacy_preserving"/"offchain"/"simple", set server-side, see
// proposalService.createZupollProposal) and no description field (FR-002 is question + options
// + expiry only).
export const zupollCreateBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    options: z.array(z.string().trim().min(1)).min(2),
    eligibleTierIds: z.array(z.string()).nonempty(),
    pollEndDate: z.number().int().positive(),
  })
  .refine((body) => new Set(body.options.map((option) => option.toLowerCase())).size === body.options.length, {
    message: "Options must be distinct",
    path: ["options"],
  });

export type ZupollCreateBody = z.infer<typeof zupollCreateBodySchema>;
