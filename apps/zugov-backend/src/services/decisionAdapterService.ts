import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { communityDecisionAdapters, type CommunityDecisionAdapter } from "../db/schema.js";
import type { EligibilityMechanism } from "./eligibilityService.js";

export type DecisionAdapterType = "maci" | "zupoll";

export class NoDecisionAdapterAttachedError extends Error {
  constructor() {
    super("This community has no decision adapter attached — governance must be configured before creating proposals");
  }
}

// Governance restructure Phase 1 (2026-08-20 /plan-eng-review) — decisionAdapterService is a
// backend CAPABILITY REGISTRY only. MACI's real deploy/vote/tally flow is wallet-signed and
// browser-driven (useDeployPoll/useVote/useJoinPoll) — it can't be a pure backend function the
// way eligibility adapters are, so this service doesn't attempt to unify execution across
// adapters. It tracks two things: which adapters a community has attached
// (communityDecisionAdapters), and what each adapter TYPE is capable of (declared below, purely
// informational this pass — nothing yet enforces a proposal's chosen eligibility mechanism
// against an adapter's declared support; that's deferred to Phase 2+, see TODOS.md, since
// enforcement is moot with only one attachable adapter).
export interface DecisionAdapterCapabilities {
  adapterType: DecisionAdapterType;
  // Eligibility mechanisms this adapter can actually enforce. "tier" is deliberately absent for
  // MACI — it's a purely off-chain, app-DB check with no on-chain Policy equivalent, so MACI
  // cannot enforce it the way it can open (FreeForAll) or erc20_token (ERC20Token policy).
  supportedEligibilityMechanisms: EligibilityMechanism[];
  // "simple" (NON_QV), "quadratic" (QV), "ranked" (RANKED), and "full" (FULL) are MACI's four
  // confirmed-working voting protocol types — verified against packages/core/ts/utils/
  // constants.ts's real 4-value EMode enum and tallyService.ts's existing mode-mapping during
  // the 2026-08-20 governance-restructure Phase 2 review (TODOS.md's "audit MACI protocol
  // state" item, resolved: no bug, the mapping already matched the enum exactly). "weighted" is
  // deliberately excluded — there is no distinct on-chain EMode for it; the app aliases it to
  // NON_QV (same mode as "simple") as an honest fallback, not a real 5th protocol type.
  supportedVotingProtocolTypes: ("simple" | "quadratic" | "ranked" | "full")[];
  // The "substrate" pair (governance-terminology glossary, 2026-08-20) — where this adapter's
  // decisions execute and whether voter choices stay private. Reuses the exact same enum values
  // as proposals.executionLocation/proposals.privacy (schema.ts), not new vocabulary — a
  // 3-value union (not 2), since that's what the real column this mirrors actually declares.
  // Static per-adapterType (declared once here, not a per-attachment configurable field): the
  // governance-terminology glossary already tables clr.fund-style/Holographic-Consensus-style
  // as "on-chain or off-chain" in one row, which a future variant pair should resolve by adding
  // a second, distinct adapterType value (e.g. clr_fund_onchain/clr_fund_offchain), not by
  // making this field runtime-configurable (Child B architecture review, 2026-08-24; Child C2
  // /plan-eng-review, 2026-08-25).
  executionLocation: "onchain" | "offchain" | "hybrid";
  privacy: "public" | "privacy_preserving";
}

const ADAPTER_CAPABILITIES: Record<DecisionAdapterType, DecisionAdapterCapabilities> = {
  maci: {
    adapterType: "maci",
    supportedEligibilityMechanisms: ["open", "erc20_token"],
    supportedVotingProtocolTypes: ["simple", "quadratic", "ranked", "full"],
    executionLocation: "onchain",
    privacy: "privacy_preserving",
  },
  // specs/013-zupoll-decision-adapter — off-chain, anonymous, Semaphore-group-proof survey
  // voting. "tier" is the only eligibility mechanism it enforces (membershipTiers.canVote via
  // the eligible-voter group snapshot, see zupollService.snapshotGroup) — unlike MACI it has no
  // on-chain policy contracts, so "open"/"erc20_token" aren't meaningful here. Only "simple"
  // (single-choice per question) voting protocol type — no quadratic/ranked/full ballot formats
  // for this adapter.
  zupoll: {
    adapterType: "zupoll",
    supportedEligibilityMechanisms: ["tier"],
    supportedVotingProtocolTypes: ["simple"],
    executionLocation: "offchain",
    privacy: "privacy_preserving",
  },
};

export function getCapabilities(adapterType: DecisionAdapterType): DecisionAdapterCapabilities {
  return ADAPTER_CAPABILITIES[adapterType];
}

export async function listAvailable(communityId: string): Promise<CommunityDecisionAdapter[]> {
  return db.select().from(communityDecisionAdapters).where(eq(communityDecisionAdapters.communityId, communityId));
}

export async function assertHasAnyAdapterAttached(communityId: string): Promise<void> {
  const available = await listAvailable(communityId);
  if (available.length === 0) throw new NoDecisionAdapterAttachedError();
}

/** Idempotent — attaching an already-attached adapter is a no-op, not an error. Matches the
 * checkpoint/resume flow (useDeployGovernance) potentially re-running this call after a partial
 * failure without needing its own duplicate-attach handling. */
export async function attach(communityId: string, adapterType: DecisionAdapterType): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .insert(communityDecisionAdapters)
    .values({ communityId, adapterType, attachedAt: now })
    .onConflictDoNothing();
}

export async function isAttached(communityId: string, adapterType: DecisionAdapterType): Promise<boolean> {
  const [row] = await db
    .select({ adapterType: communityDecisionAdapters.adapterType })
    .from(communityDecisionAdapters)
    .where(
      and(
        eq(communityDecisionAdapters.communityId, communityId),
        eq(communityDecisionAdapters.adapterType, adapterType),
      ),
    )
    .limit(1);
  return !!row;
}
