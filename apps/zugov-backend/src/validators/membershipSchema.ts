import { z } from "zod";

export const tierBodySchema = z.object({
  label: z.string().min(1).max(40),
  canCreateGovernanceActions: z.boolean(),
  canVote: z.boolean(),
  canManageMembership: z.boolean(),
  canDelegate: z.boolean().optional().default(false),
  canBeDelegatedTo: z.boolean().optional().default(false),
});

export type TierBody = z.infer<typeof tierBodySchema>;

export const communityMembershipFieldsSchema = z.object({
  membershipPolicy: z.enum(["open", "approval"]),
  tierChangesRequireVote: z.boolean(),
  tiers: z.array(tierBodySchema).nonempty(),
  defaultTierLabel: z.string().min(1),
});

export type CommunityMembershipFields = z.infer<typeof communityMembershipFieldsSchema>;
