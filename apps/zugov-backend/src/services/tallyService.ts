import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { maciGovernanceConfigs, governanceActions, type GovernanceAction } from "../db/schema.js";
import { runTallyPipeline } from "./coordinatorClient.js";
import { isAuthorized } from "./membershipService.js";
import { GovernanceActionNotFoundError } from "./governanceActionService.js";

export class NotAuthorizedToTallyError extends Error {
  constructor() {
    super("Not authorized to trigger tallying for this community");
  }
}

export class PollNotDeployedError extends Error {
  constructor() {
    super("This governance action has no deployed poll to tally");
  }
}

export class PollNotClosedError extends Error {
  constructor() {
    super("This poll hasn't closed yet");
  }
}

export class TallyAlreadyInProgressError extends Error {
  constructor() {
    super("Tallying is already in progress or has already completed for this poll");
  }
}

export class UnsupportedChainForTallyError extends Error {
  constructor() {
    // Same single-network limitation documented in coordinatorClient.ts/deploy/docker-compose.yml.
    super("Tallying is currently only supported for Sepolia communities");
  }
}

// DomainObjs.Mode values (see apps/zugov-frontend/src/hooks/useDeployPoll.ts's EMode and
// GovernanceActionsList.tsx's TALLY_MECHANISM_TO_MODE — kept in sync manually, no shared package
// between frontend/backend for this small an enum).
const TALLY_MECHANISM_TO_MODE: Record<GovernanceAction["tallyMechanism"], number> = {
  quadratic: 0,
  simple: 1,
  full: 2,
  ranked: 3,
  weighted: 1,
};

const SEPOLIA_CHAIN_ID = 11155111;

async function getActionOrThrow(communityId: string, actionId: string): Promise<GovernanceAction> {
  const [row] = await db
    .select()
    .from(governanceActions)
    .where(and(eq(governanceActions.id, actionId), eq(governanceActions.communityId, communityId)))
    .limit(1);
  if (!row) throw new GovernanceActionNotFoundError();
  return row;
}

export async function getTallyStatus(
  communityId: string,
  actionId: string,
): Promise<
  Pick<GovernanceAction, "tallyStatus" | "tallyError" | "tallyRequestedAt" | "tallyCompletedAt" | "tallyResult">
> {
  const action = await getActionOrThrow(communityId, actionId);
  return {
    tallyStatus: action.tallyStatus,
    tallyError: action.tallyError,
    tallyRequestedAt: action.tallyRequestedAt,
    tallyCompletedAt: action.tallyCompletedAt,
    tallyResult: action.tallyResult,
  };
}

/** Validates the request and flips the row to "pending", then runs the actual coordinator
 * pipeline as a background task (fire-and-forget) — merge/generate/submit together can take
 * anywhere from minutes to hours for a real-size poll, far too long for a single HTTP request. */
export async function triggerTally(communityId: string, actionId: string, walletAddress: string): Promise<void> {
  if (!(await isAuthorized(communityId, walletAddress))) {
    throw new NotAuthorizedToTallyError();
  }

  const action = await getActionOrThrow(communityId, actionId);
  if (!action.pollAddress || !action.pollId) throw new PollNotDeployedError();
  if (action.tallyStatus !== "not_started" && action.tallyStatus !== "failed") {
    throw new TallyAlreadyInProgressError();
  }
  if (!action.pollEndDate || action.pollEndDate > Math.floor(Date.now() / 1000)) {
    throw new PollNotClosedError();
  }

  const [governanceConfig] = await db
    .select({ contractAddress: maciGovernanceConfigs.contractAddress, chainId: maciGovernanceConfigs.chainId })
    .from(maciGovernanceConfigs)
    .where(eq(maciGovernanceConfigs.communityId, communityId))
    .limit(1);
  if (!governanceConfig || !governanceConfig.contractAddress) throw new GovernanceActionNotFoundError();
  if (governanceConfig.chainId !== SEPOLIA_CHAIN_ID) throw new UnsupportedChainForTallyError();

  const now = Math.floor(Date.now() / 1000);
  await db
    .update(governanceActions)
    .set({ tallyStatus: "pending", tallyRequestedAt: now, tallyError: null, tallyResult: null })
    .where(eq(governanceActions.id, actionId));

  void runTallyInBackground(actionId, governanceConfig.contractAddress, action.pollId, action.tallyMechanism);
}

async function runTallyInBackground(
  actionId: string,
  maciContractAddress: string,
  pollId: string,
  tallyMechanism: GovernanceAction["tallyMechanism"],
): Promise<void> {
  try {
    await db.update(governanceActions).set({ tallyStatus: "processing" }).where(eq(governanceActions.id, actionId));

    const result = await runTallyPipeline({
      maciContractAddress,
      pollId: Number(pollId),
      mode: TALLY_MECHANISM_TO_MODE[tallyMechanism],
    });

    await db
      .update(governanceActions)
      .set({
        tallyStatus: "completed",
        tallyCompletedAt: Math.floor(Date.now() / 1000),
        tallyResult: JSON.stringify(result.tallyData),
      })
      .where(eq(governanceActions.id, actionId));
  } catch (err) {
    console.error(`[tallyService] Tally failed for governance action ${actionId}:`, err);
    await db
      .update(governanceActions)
      .set({
        tallyStatus: "failed",
        tallyError: err instanceof Error ? err.message : String(err),
      })
      .where(eq(governanceActions.id, actionId));
  }
}
