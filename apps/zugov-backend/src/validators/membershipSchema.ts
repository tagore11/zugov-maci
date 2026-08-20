import { z } from "zod";

export const tierBodySchema = z.object({
  label: z.string().min(1).max(40),
  canCreateProposals: z.boolean(),
  canVote: z.boolean(),
  canManageMembership: z.boolean(),
  canDelegate: z.boolean().optional().default(false),
  canBeDelegatedTo: z.boolean().optional().default(false),
  // Events (2026-08-19 eng review): defaults true so a wizard-created tier matches the schema's
  // own default without the wizard having to know about it, but stays overridable per-tier.
  canCreateEvents: z.boolean().optional().default(true),
});

export type TierBody = z.infer<typeof tierBodySchema>;

export const communityMembershipFieldsSchema = z.object({
  membershipPolicy: z.enum(["open", "approval"]),
  tierChangesRequireVote: z.boolean(),
  tiers: z.array(tierBodySchema).nonempty(),
  defaultTierLabel: z.string().min(1),
});

export type CommunityMembershipFields = z.infer<typeof communityMembershipFieldsSchema>;
