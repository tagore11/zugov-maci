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
export const directAuthorizeBodySchema = createDraftBodySchema;

export type DirectAuthorizeBody = z.infer<typeof directAuthorizeBodySchema>;

export const directConfirmBodySchema = createDraftBodySchema.extend({
  pollAddress: z.string().min(1),
  pollId: z.string().min(1),
  txHash: z.string().min(1),
  pollStartDate: z.number().int().nonnegative(),
  pollEndDate: z.number().int().nonnegative(),
  options: z.array(z.string()).min(2).optional(),
});

export type DirectConfirmBody = z.infer<typeof directConfirmBodySchema>;
