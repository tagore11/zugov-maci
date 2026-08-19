import { z } from "zod";

// Config shape per mechanism (2026-08-19 eligibility-adapters review) — exactly the 3 shipped
// this pass. Adding a new mechanism later means adding one more discriminated-union branch here
// plus one adapter in eligibilityService.ts; nothing else in the validation layer changes.
const openConfigSchema = z.object({});
const tierConfigSchema = z.object({ tierId: z.string().min(1) });
const erc20TokenConfigSchema = z.object({
  chainId: z.number().int(),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid 0x-prefixed address"),
  // bigint-as-string — matches how eligibilityService stores/parses it, avoids JSON's lack of a
  // real bigint type.
  threshold: z.string().regex(/^\d+$/, "Must be a non-negative integer string"),
});

const ruleInputSchema = z.discriminatedUnion("mechanism", [
  z.object({
    groupIndex: z.number().int().min(0),
    mechanism: z.literal("open"),
    config: openConfigSchema,
    targetTierId: z.string().optional(),
  }),
  z.object({
    groupIndex: z.number().int().min(0),
    mechanism: z.literal("tier"),
    config: tierConfigSchema,
    targetTierId: z.string().optional(),
  }),
  z.object({
    groupIndex: z.number().int().min(0),
    mechanism: z.literal("erc20_token"),
    config: erc20TokenConfigSchema,
    targetTierId: z.string().optional(),
  }),
]);

// A ruleset is replaced as a whole (matches eligibilityService.replaceRuleset — a creator edits
// "here's my new set of rules", not one rule at a time).
export const rulesetBodySchema = z.object({
  rules: z.array(ruleInputSchema),
});

export type RulesetBody = z.infer<typeof rulesetBodySchema>;
