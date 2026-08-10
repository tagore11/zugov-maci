import { z } from "zod";

export const createDraftBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  privacy: z.enum(["public", "privacy_preserving"]),
  executionLocation: z.enum(["onchain", "offchain", "hybrid"]),
  tallyMechanism: z.enum(["simple", "quadratic", "ranked", "weighted"]),
  eligibleTierIds: z.array(z.string()).nonempty(),
});

export type CreateDraftBody = z.infer<typeof createDraftBodySchema>;

export const formalizeConfirmBodySchema = z.object({
  pollAddress: z.string().min(1),
  pollId: z.string().min(1),
  txHash: z.string().min(1),
});

export type FormalizeConfirmBody = z.infer<typeof formalizeConfirmBodySchema>;
