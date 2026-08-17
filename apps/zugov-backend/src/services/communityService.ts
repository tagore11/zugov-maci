import { eq, and, count } from "drizzle-orm";
import { createPublicClient, getAddress, http, type Address } from "viem";
import { db } from "../db/client.js";
import { communities, memberships, type Community } from "../db/schema.js";
import type { CommunityBody, PollDeployConfigBody } from "../validators/communitySchema.js";
import { getRpcUrl } from "./chainRpc.js";
import { createTiersForCommunity, listTiers } from "./membershipService.js";
import { deployCommunitySubgraph, subgraphQueryUrlFor } from "./subgraphDeployService.js";

const SIGN_UP_POLICY_ABI = [
  { type: "function", name: "signUpPolicy", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

const TRAIT_ABI = [
  { type: "function", name: "trait", stateMutability: "pure", inputs: [], outputs: [{ type: "string" }] },
] as const;

// Every BasePolicy contract implements trait() (see IPolicy.sol) returning a fixed string
// identifying its implementation. Mirrors apps/zugov-frontend/src/hooks/useMaciContractConfig.ts's
// TRAIT_TO_POLICY_TYPE, which does this same on-chain read in the browser during registration.
const TRAIT_TO_SIGN_UP_POLICY_TYPE: Record<string, string> = {
  FreeForAll: "FreeForAll",
  Zupass: "Zupass",
  EAS: "EAS",
  GitcoinPassport: "GitcoinPassport",
  Semaphore: "Semaphore",
  AnonAadhaar: "AnonAadhaar",
  ERC20: "ERC20Token",
  ERC20Votes: "ERC20Votes",
  Token: "Token",
  MerkleProof: "MerkleProof",
  Hats: "HatsProtocol",
};

const POLL_DEPLOY_CONFIG_COLUMNS = [
  "coordinatorPublicKey",
  "tallyProcessingStateTreeDepth",
  "voteOptionTreeDepth",
  "messageBatchSize",
  "freeForAllPolicyFactory",
  "freeForAllChecker",
  "constantVoiceCreditProxyFactory",
  "initialVoiceCreditAmount",
] as const;

export type CommunityRecord = Omit<
  Community,
  "allowedPolicies" | "supportedModes" | (typeof POLL_DEPLOY_CONFIG_COLUMNS)[number]
> & {
  allowedPolicies: number[];
  supportedModes: number[];
  pollDeployConfig: PollDeployConfigBody | null;
};

function parseRecord(raw: Community): CommunityRecord {
  const pollDeployConfig = POLL_DEPLOY_CONFIG_COLUMNS.every((column) => raw[column] !== null)
    ? ({
        coordinatorPublicKey: raw.coordinatorPublicKey,
        treeDepths: {
          tallyProcessingStateTreeDepth: raw.tallyProcessingStateTreeDepth,
          voteOptionTreeDepth: raw.voteOptionTreeDepth,
          stateTreeDepth: raw.stateTreeDepth,
        },
        messageBatchSize: raw.messageBatchSize,
        freeForAllPolicyFactory: raw.freeForAllPolicyFactory,
        freeForAllChecker: raw.freeForAllChecker,
        constantVoiceCreditProxyFactory: raw.constantVoiceCreditProxyFactory,
        initialVoiceCreditAmount: raw.initialVoiceCreditAmount,
      } as PollDeployConfigBody)
    : null;

  // Destructure the flat columns out rather than relying on the return type's Omit<> — a type
  // annotation doesn't strip runtime properties, so `...rest` (not `...raw`) is required to avoid
  // leaking them as duplicate top-level fields alongside the nested `pollDeployConfig` above.
  const {
    coordinatorPublicKey: _coordinatorPublicKey,
    tallyProcessingStateTreeDepth: _tallyProcessingStateTreeDepth,
    voteOptionTreeDepth: _voteOptionTreeDepth,
    messageBatchSize: _messageBatchSize,
    freeForAllPolicyFactory: _freeForAllPolicyFactory,
    freeForAllChecker: _freeForAllChecker,
    constantVoiceCreditProxyFactory: _constantVoiceCreditProxyFactory,
    initialVoiceCreditAmount: _initialVoiceCreditAmount,
    ...rest
  } = raw;

  return {
    ...rest,
    allowedPolicies: JSON.parse(raw.allowedPolicies) as number[],
    supportedModes: JSON.parse(raw.supportedModes) as number[],
    pollDeployConfig,
  };
}

export async function list(
  page: number,
  limit: number,
  chainId?: number,
  creatorAddress?: string,
): Promise<{ communities: CommunityRecord[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * limit;

  const conditions = [
    chainId !== undefined ? eq(communities.chainId, chainId) : undefined,
    creatorAddress !== undefined ? eq(communities.creatorAddress, creatorAddress) : undefined,
  ].filter((condition) => condition !== undefined);
  const baseWhere = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(communities).where(baseWhere).limit(limit).offset(offset).orderBy(communities.registeredAt),
    db.select({ value: count() }).from(communities).where(baseWhere),
  ]);

  const total = Number(totalRows[0]?.value ?? 0);
  return {
    communities: rows.map(parseRecord),
    total,
    hasMore: offset + rows.length < total,
  };
}

export async function get(id: string): Promise<CommunityRecord | null> {
  const rows = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
  return rows[0] ? parseRecord(rows[0]) : null;
}

/**
 * Brings `creatorAddress` back in sync with the contract's on-chain owner() after a
 * transferOwnership() call, which the community's subgraph picks up via its
 * OwnershipTransferred handler but which this app is never otherwise told about (no
 * webhook from graph-node — see subgraphQueryUrlFor). Called lazily when a community is
 * fetched, mirroring the on-page-load on-chain reads used elsewhere in this app rather
 * than adding new polling infrastructure.
 */
export async function reconcileCreatorAddress(community: CommunityRecord): Promise<CommunityRecord> {
  if (community.subgraphStatus !== "ready" || !community.subgraphName) return community;

  let owner: string | undefined;
  try {
    const res = await fetch(subgraphQueryUrlFor(community.subgraphName), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `{ maci(id: "${community.id.toLowerCase()}") { owner } }` }),
    });
    if (!res.ok) return community;
    const body = (await res.json()) as { data?: { maci?: { owner: string } | null } };
    owner = body.data?.maci?.owner;
  } catch {
    return community;
  }

  // "0x" is the subgraph's Bytes.empty() default before any OwnershipTransferred event is indexed.
  if (!owner || owner === "0x") return community;

  const checksummedOwner = getAddress(owner);
  if (checksummedOwner === getAddress(community.creatorAddress)) return community;

  await db.update(communities).set({ creatorAddress: checksummedOwner }).where(eq(communities.id, community.id));
  return { ...community, creatorAddress: checksummedOwner };
}

/**
 * Backfills signUpPolicyType/signUpPolicyAddress for communities registered before those columns
 * existed (see schema.ts's comment on signUpPolicyType) by reading MACI's immutable
 * signUpPolicy() getter and the resulting policy contract's trait() directly from chain. Unlike
 * reconcileCreatorAddress above, this value can't change after MACI's constructor runs, so it
 * only needs to be read once — no subgraph dependency, and nothing to do once it's set.
 */
export async function reconcileSignUpPolicy(community: CommunityRecord): Promise<CommunityRecord> {
  if (community.signUpPolicyType !== null) return community;

  const rpcUrl = getRpcUrl(community.chainId);
  if (!rpcUrl) return community;

  const client = createPublicClient({ transport: http(rpcUrl) });

  let signUpPolicyAddress: Address;
  let trait: string;
  try {
    signUpPolicyAddress = await client.readContract({
      address: community.id as Address,
      abi: SIGN_UP_POLICY_ABI,
      functionName: "signUpPolicy",
    });
    trait = await client.readContract({
      address: signUpPolicyAddress,
      abi: TRAIT_ABI,
      functionName: "trait",
    });
  } catch {
    return community;
  }

  const signUpPolicyType = TRAIT_TO_SIGN_UP_POLICY_TYPE[trait];
  if (!signUpPolicyType) return community;

  const checksummedPolicyAddress = getAddress(signUpPolicyAddress);
  await db
    .update(communities)
    .set({ signUpPolicyType, signUpPolicyAddress: checksummedPolicyAddress })
    .where(eq(communities.id, community.id));

  return { ...community, signUpPolicyType, signUpPolicyAddress: checksummedPolicyAddress };
}

export async function create(data: CommunityBody): Promise<{ community: CommunityRecord; created: boolean }> {
  const now = Math.floor(Date.now() / 1000);
  const newRecord = {
    id: data.id,
    chainId: data.chainId,
    displayName: data.displayName,
    description: data.description ?? null,
    logo: data.logo ?? null,
    creatorAddress: data.creatorAddress,
    governanceType: "maci",
    allowedPolicies: JSON.stringify(data.allowedPolicies),
    supportedModes: JSON.stringify(data.supportedModes),
    signUpPolicyType: data.signUpPolicyType,
    signUpPolicyAddress: data.signUpPolicyAddress,
    maciDeploymentBlock: data.maciDeploymentBlock,
    stateTreeDepth: data.stateTreeDepth,
    membershipPolicy: data.membershipPolicy,
    tierChangesRequireVote: data.tierChangesRequireVote,
    coordinatorPublicKey: data.pollDeployConfig?.coordinatorPublicKey ?? null,
    tallyProcessingStateTreeDepth: data.pollDeployConfig?.treeDepths.tallyProcessingStateTreeDepth ?? null,
    voteOptionTreeDepth: data.pollDeployConfig?.treeDepths.voteOptionTreeDepth ?? null,
    messageBatchSize: data.pollDeployConfig?.messageBatchSize ?? null,
    freeForAllPolicyFactory: data.pollDeployConfig?.freeForAllPolicyFactory ?? null,
    freeForAllChecker: data.pollDeployConfig?.freeForAllChecker ?? null,
    constantVoiceCreditProxyFactory: data.pollDeployConfig?.constantVoiceCreditProxyFactory ?? null,
    initialVoiceCreditAmount: data.pollDeployConfig?.initialVoiceCreditAmount ?? null,
    createdAt: now,
    registeredAt: now,
  };

  try {
    const inserted = await db.insert(communities).values(newRecord).returning();
    const community = inserted[0]!;

    const { defaultTierId, creatorTierId } = await createTiersForCommunity(
      community.id,
      data.tiers,
      data.defaultTierLabel,
    );
    const [withDefaultTier] = await db
      .update(communities)
      .set({ defaultTierId })
      .where(eq(communities.id, community.id))
      .returning();

    // The creator otherwise has no membership row at all, so tier-scoped permission checks
    // (e.g. governanceActionService's canCreateGovernanceActions) would reject them on their own
    // community. Enroll them at the full-permission ("Admin"-equivalent) tier, not the default
    // tier meant for new joiners — those are frequently different (e.g. the wizard's own default
    // is "Regular", which lacks canCreateGovernanceActions), and a creator locked out of their
    // own community's governance actions is a real, previously-reproducible bug.
    await db.insert(memberships).values({
      walletAddress: data.creatorAddress,
      communityId: community.id,
      tierId: creatorTierId,
      joinedAt: now,
    });

    // Fire-and-forget: deploying the community's subgraph shouldn't block or fail
    // registration. deployCommunitySubgraph never throws — failures land in
    // subgraphStatus for the retry route — but .catch is kept as a defensive backstop.
    void deployCommunitySubgraph(community.id, data.chainId, data.maciDeploymentBlock).catch((err: unknown) => {
      console.error(`[communityService] Unexpected error deploying subgraph for ${community.id}:`, err);
    });

    return { community: parseRecord(withDefaultTier!), created: true };
  } catch (err: unknown) {
    const isUniqueViolation = err instanceof Error && err.message.includes("duplicate key");
    if (isUniqueViolation) {
      const existing = await get(data.id);
      return { community: existing!, created: false };
    }
    throw err;
  }
}

export interface CommunityUpdatePatch {
  displayName?: string;
  description?: string;
  logo?: string;
  membershipPolicy?: "open" | "approval";
  tierChangesRequireVote?: boolean;
  defaultTierLabel?: string;
  cosponsorshipThreshold?: number;
  directDeploymentEnabled?: boolean;
}

export class TierLabelNotFoundError extends Error {
  constructor(label: string) {
    super(`Tier "${label}" not found`);
  }
}

export async function update(id: string, patch: CommunityUpdatePatch): Promise<CommunityRecord | null> {
  const dbPatch: Partial<Community> = {};
  if (patch.displayName !== undefined) dbPatch.displayName = patch.displayName;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.logo !== undefined) dbPatch.logo = patch.logo;
  if (patch.membershipPolicy !== undefined) dbPatch.membershipPolicy = patch.membershipPolicy;
  if (patch.tierChangesRequireVote !== undefined) dbPatch.tierChangesRequireVote = patch.tierChangesRequireVote;
  if (patch.cosponsorshipThreshold !== undefined) dbPatch.cosponsorshipThreshold = patch.cosponsorshipThreshold;
  if (patch.directDeploymentEnabled !== undefined) dbPatch.directDeploymentEnabled = patch.directDeploymentEnabled;

  if (patch.defaultTierLabel !== undefined) {
    const tiers = await listTiers(id);
    const tier = tiers.find((t) => t.label === patch.defaultTierLabel);
    if (!tier) throw new TierLabelNotFoundError(patch.defaultTierLabel);
    dbPatch.defaultTierId = tier.id;
  }

  if (Object.keys(dbPatch).length === 0) return get(id);

  const [updated] = await db.update(communities).set(dbPatch).where(eq(communities.id, id)).returning();
  return updated ? parseRecord(updated) : null;
}
