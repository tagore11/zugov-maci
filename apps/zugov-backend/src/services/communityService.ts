import { randomUUID } from "node:crypto";
import { eq, and, count, ilike, inArray } from "drizzle-orm";
import { createPublicClient, getAddress, http, type Address } from "viem";
import { db } from "../db/client.js";
import {
  communities,
  memberships,
  membershipTiers,
  maciGovernanceConfigs,
  categories,
  type Community,
  type MaciGovernanceConfig,
  type Category,
} from "../db/schema.js";
import type { IdentityBody, GovernanceBody, PollDeployConfigBody } from "../validators/communitySchema.js";
import type { TierBody } from "../validators/membershipSchema.js";
import { getRpcUrl } from "./chainRpc.js";
import { createTiersForCommunity, listTiers, isAuthorized } from "./membershipService.js";
import { deployCommunitySubgraph, subgraphQueryUrlFor } from "./subgraphDeployService.js";
import { attach as attachDecisionAdapter } from "./decisionAdapterService.js";

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

// Flat merged shape (Architecture Issue 3, locked): callers never see the identity/governance
// table split — get()/list() join both tables and return one object, same shape a caller of
// the old single-table communities row would have seen, plus governanceConfigured so callers
// can tell "no governance row exists yet" apart from "governance fields happen to be null."
export type CommunityRecord = Community & {
  governanceConfigured: boolean;
  contractAddress: string | null;
  chainId: number | null;
  governanceType: string | null;
  allowedPolicies: number[];
  supportedModes: number[];
  signUpPolicyType: string | null;
  signUpPolicyAddress: string | null;
  stateTreeDepth: number | null;
  maciDeploymentBlock: number | null;
  subgraphName: string | null;
  subgraphStatus: "pending" | "ready" | "failed" | null;
  pollDeployConfig: PollDeployConfigBody | null;
};

function parseRecord(identity: Community, governance: MaciGovernanceConfig | null): CommunityRecord {
  if (!governance) {
    return {
      ...identity,
      governanceConfigured: false,
      contractAddress: null,
      chainId: null,
      governanceType: null,
      allowedPolicies: [],
      supportedModes: [],
      signUpPolicyType: null,
      signUpPolicyAddress: null,
      stateTreeDepth: null,
      maciDeploymentBlock: null,
      subgraphName: null,
      subgraphStatus: null,
      pollDeployConfig: null,
    };
  }

  const pollDeployConfig = POLL_DEPLOY_CONFIG_COLUMNS.every((column) => governance[column] !== null)
    ? ({
        coordinatorPublicKey: governance.coordinatorPublicKey,
        treeDepths: {
          tallyProcessingStateTreeDepth: governance.tallyProcessingStateTreeDepth,
          voteOptionTreeDepth: governance.voteOptionTreeDepth,
          stateTreeDepth: governance.stateTreeDepth,
        },
        messageBatchSize: governance.messageBatchSize,
        freeForAllPolicyFactory: governance.freeForAllPolicyFactory,
        freeForAllChecker: governance.freeForAllChecker,
        constantVoiceCreditProxyFactory: governance.constantVoiceCreditProxyFactory,
        initialVoiceCreditAmount: governance.initialVoiceCreditAmount,
      } as PollDeployConfigBody)
    : null;

  return {
    ...identity,
    governanceConfigured: true,
    contractAddress: governance.contractAddress,
    chainId: governance.chainId,
    governanceType: governance.governanceType,
    allowedPolicies: JSON.parse(governance.allowedPolicies) as number[],
    supportedModes: JSON.parse(governance.supportedModes) as number[],
    signUpPolicyType: governance.signUpPolicyType,
    signUpPolicyAddress: governance.signUpPolicyAddress,
    stateTreeDepth: governance.stateTreeDepth,
    maciDeploymentBlock: governance.maciDeploymentBlock,
    subgraphName: governance.subgraphName,
    subgraphStatus: governance.subgraphStatus,
    pollDeployConfig,
  };
}

// formalize-communities epic, Child E (/plan-eng-review 2026-08-25, D4) — "authorized on", not
// just "created" (isAuthorized()'s own definition: creator OR a canManageMembership tier
// holder). Implemented as two simple queries unioned in application code rather than a
// correlated SQL subquery, matching this codebase's preference for composed simple queries.
// Duplicate ids between the two sets are harmless (communities.id is the PK; inArray dedupes
// by row identity) — every creator is always also a canManageMembership tier holder on their
// own community (createIdentity enrolls them at that tier), so the union is redundant-but-
// harmless for that case specifically, not a correctness concern.
//
// Extracted (union page redesign, /plan-eng-review 2026-08-26, D2) out of list() below so
// unionService's "which of my communities have a pending invite" query can reuse the same
// authorization resolution instead of a third copy.
export async function getAuthorizedCommunityIds(address: string): Promise<string[]> {
  const [creatorRows, adminTierRows] = await Promise.all([
    db.select({ id: communities.id }).from(communities).where(ilike(communities.creatorAddress, address)),
    db
      .select({ id: memberships.communityId })
      .from(memberships)
      .innerJoin(membershipTiers, eq(memberships.tierId, membershipTiers.id))
      .where(and(ilike(memberships.walletAddress, address), eq(membershipTiers.canManageMembership, true))),
  ]);
  return [...new Set([...creatorRows.map((r) => r.id), ...adminTierRows.map((r) => r.id)])];
}

export async function list(
  page: number,
  limit: number,
  chainId?: number,
  creatorAddress?: string,
  search?: string,
  authorizedFor?: string,
  // Union-as-community merge (2026-08-28, D12) — defaults to 'standard' (fails CLOSED), not
  // every type, when the caller doesn't specify. Confirmed 4 real call sites (app/page.tsx's
  // community explorer, manage-communities/page.tsx, manage-profile/page.tsx,
  // AwaitingActions.tsx) had zero type filtering before this — once union rows existed in this
  // table, they'd have appeared in the homepage directory and "my communities" views
  // indistinguishably from real communities. This default also means the union-invite search
  // combobox (which never passes this param) naturally can't surface unions as invitable
  // "member communities" of another union — an emergent, correct-by-default behavior, not a
  // separate guard.
  type: "standard" | "union" = "standard",
): Promise<{ communities: CommunityRecord[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * limit;

  const authorizedIds = authorizedFor !== undefined ? await getAuthorizedCommunityIds(authorizedFor) : undefined;

  // Community creation wizard fix (2026-08-21) — feeds the parent-community picker's search
  // box. Case-insensitive substring match on displayName; no index needed at this scale (see
  // /plan-eng-review's outside-voice finding — a client-side filter over the paginated list
  // silently excluded any parent past the first page, this fixes that properly).
  //
  // creatorAddress uses ilike (Child E, 2026-08-25, D3) rather than a case-sensitive eq() — a
  // pre-existing divergence from isAuthorized()'s own lowercase comparison caught while building
  // authorizedFor on top of it; a wallet whose stored casing differed from the queried casing
  // would otherwise silently vanish from its own creator-match results.
  const conditions = [
    eq(communities.type, type),
    chainId !== undefined ? eq(maciGovernanceConfigs.chainId, chainId) : undefined,
    creatorAddress !== undefined ? ilike(communities.creatorAddress, creatorAddress) : undefined,
    search !== undefined && search.trim() !== "" ? ilike(communities.displayName, `%${search.trim()}%`) : undefined,
    authorizedIds !== undefined ? inArray(communities.id, authorizedIds) : undefined,
  ].filter((condition) => condition !== undefined);
  const baseWhere = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(communities)
      .leftJoin(maciGovernanceConfigs, eq(communities.id, maciGovernanceConfigs.communityId))
      .where(baseWhere)
      .limit(limit)
      .offset(offset)
      .orderBy(communities.registeredAt),
    db
      .select({ value: count() })
      .from(communities)
      .leftJoin(maciGovernanceConfigs, eq(communities.id, maciGovernanceConfigs.communityId))
      .where(baseWhere),
  ]);

  const total = Number(totalRows[0]?.value ?? 0);
  return {
    communities: rows.map((row) => parseRecord(row.communities, row.maci_governance_configs)),
    total,
    hasMore: offset + rows.length < total,
  };
}

export async function get(id: string): Promise<CommunityRecord | null> {
  const rows = await db
    .select()
    .from(communities)
    .leftJoin(maciGovernanceConfigs, eq(communities.id, maciGovernanceConfigs.communityId))
    .where(eq(communities.id, id))
    .limit(1);
  const row = rows[0];
  return row ? parseRecord(row.communities, row.maci_governance_configs) : null;
}

// Lightpaper's "communities and sub-communities" building block: local chapters, event teams,
// and contributor circles nested under a parent. No pagination — sub-community counts per
// community are expected to stay small (chapters/teams, not a general listing surface).
export async function listChildren(parentId: string): Promise<CommunityRecord[]> {
  const rows = await db
    .select()
    .from(communities)
    .leftJoin(maciGovernanceConfigs, eq(communities.id, maciGovernanceConfigs.communityId))
    .where(eq(communities.parentCommunityId, parentId));
  return rows.map((row) => parseRecord(row.communities, row.maci_governance_configs));
}

/**
 * Brings `creatorAddress` back in sync with the contract's on-chain owner() after a
 * transferOwnership() call, which the community's subgraph picks up via its
 * OwnershipTransferred handler but which this app is never otherwise told about (no
 * webhook from graph-node — see subgraphQueryUrlFor). Called lazily when a community is
 * fetched, mirroring the on-page-load on-chain reads used elsewhere in this app rather
 * than adding new polling infrastructure. No-op for communities with no governance
 * configured yet — there's no subgraph to reconcile against.
 */
export async function reconcileCreatorAddress(community: CommunityRecord): Promise<CommunityRecord> {
  if (!community.governanceConfigured || community.subgraphStatus !== "ready" || !community.subgraphName) {
    return community;
  }

  let owner: string | undefined;
  try {
    const res = await fetch(subgraphQueryUrlFor(community.subgraphName), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `{ maci(id: "${community.contractAddress!.toLowerCase()}") { owner } }` }),
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
 * only needs to be read once — no subgraph dependency, and nothing to do once it's set. No-op
 * for communities with no governance configured yet — there's no deployed contract to read.
 */
export async function reconcileSignUpPolicy(community: CommunityRecord): Promise<CommunityRecord> {
  if (!community.governanceConfigured || community.signUpPolicyType !== null) return community;

  const rpcUrl = getRpcUrl(community.chainId!);
  if (!rpcUrl) return community;

  const client = createPublicClient({ transport: http(rpcUrl) });

  let signUpPolicyAddress: Address;
  let trait: string;
  try {
    signUpPolicyAddress = await client.readContract({
      address: community.contractAddress as Address,
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
    .update(maciGovernanceConfigs)
    .set({ signUpPolicyType, signUpPolicyAddress: checksummedPolicyAddress })
    .where(eq(maciGovernanceConfigs.communityId, community.id));

  return { ...community, signUpPolicyType, signUpPolicyAddress: checksummedPolicyAddress };
}

export class SelfParentError extends Error {
  constructor() {
    super("A community cannot be its own parent");
  }
}

export class ParentCommunityNotFoundError extends Error {
  constructor(id: string) {
    super(`Parent community "${id}" not found`);
  }
}

// formalize-communities epic, Child E (/plan-eng-review 2026-08-25, D1) — checked AFTER the
// self-parent/exists checks above, not before them in the route: unlike PATCH /:id or
// DELETE /:id/membership (where isAuthorized-before-existence avoids confirming a resource's
// existence to a non-owner), GET /:id is fully public here — there's no enumeration protection to
// buy, and checking auth first would make a nonexistent/self-referential parent id look
// "unauthorized" instead of "not found", regressing 2 existing tests and retiring
// SelfParentError's specific message on the one path where it fires.
export class ParentNotAuthorizedError extends Error {
  constructor() {
    super("Not authorized to create a child community under this parent");
  }
}

export class CommunityNotFoundError extends Error {
  constructor(id: string) {
    super(`Community "${id}" not found`);
  }
}

export class GovernanceAlreadyConfiguredError extends Error {
  constructor(id: string) {
    super(`Community "${id}" already has governance configured`);
  }
}

export class ContractAddressInUseError extends Error {
  constructor(address: string) {
    super(`Contract "${address}" is already registered to a different community`);
  }
}

const POSTGRES_UNIQUE_VIOLATION = "23505";

export class CategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Category "${id}" not found`);
  }
}

// Union-as-community merge (2026-08-28, D11) — a union has no governance, category, or
// hierarchy position of its own; guarded at every entry point that could otherwise let one
// acquire any of those by omission (attachGovernance, the eligibility-ruleset write route, and
// here — a union set as, or assigned, a parentCommunityId).
export class ParentIsUnionError extends Error {
  constructor(id: string) {
    super(`Community "${id}" is a union and cannot be used as a parent community`);
  }
}

export class CommunityIsUnionError extends Error {
  constructor(id: string) {
    super(`Community "${id}" is a union — governance cannot be attached to it`);
  }
}

// Reference data for the community explorer's filter chips and the creation wizard's category
// picker — a real table, not a hardcoded list, so adding a category is a direct DB insert, not a
// code deploy (formalize-communities epic, Child C1, /plan-eng-review 2026-08-24).
export async function listCategories(): Promise<Pick<Category, "id" | "label">[]> {
  return db.select({ id: categories.id, label: categories.label }).from(categories);
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (!row) throw new CategoryNotFoundError(categoryId);
}

/**
 * Creates a community's identity — displayName/description/logo, its place in the
 * parent/child hierarchy, and its membership structure (tiers + creator enrollment). No
 * governance is attached here (see attachGovernance below) — a community's identity and
 * membership can exist before any governance tool is configured (Architecture 1A/1B/2b).
 *
 * `id`: omitted for wizard-sourced communities (server generates a UUID — identity is
 * created before the MACI contract is deployed, so there's no address to use yet).
 * Provided for manual-sourced communities (the caller is registering an already-deployed
 * contract, so its address IS the natural, deterministic id — same retry-idempotency as
 * before: a duplicate-key insert on a client-supplied id returns the existing record rather
 * than erroring).
 */
export interface CreateCommunityRowData {
  id?: string;
  displayName: string;
  description?: string;
  logo?: string;
  creatorAddress: string;
  // Union-as-community merge (2026-08-28 /plan-eng-review, D1/D2) — 'standard' for every
  // existing caller (createIdentity below); unionService.create() is the only 'union' caller.
  type?: "standard" | "union";
  parentCommunityId?: string | null;
  membershipPolicy?: "open" | "approval";
  category?: string | null;
  tierChangesRequireVote?: boolean;
  tiers: TierBody[];
  defaultTierLabel: string;
  // D3 (final)/D6 — a union's content authority is derived from isAuthorized() on any active
  // member community (membershipService.isAuthorizedForUnionContent), never from a tier on the
  // union's own row, so enrolling its creator into a tier here would be dead data nothing ever
  // checks. Still creates exactly one placeholder tier regardless (below) — every community row
  // needs a non-null defaultTierId or the generic join route's `submitJoinRequest` 500s instead
  // of cleanly rejecting via allowJoin (verified: membershipService.ts's defaultTierId check
  // runs before the allowJoin check) — unionService.create() passes allowJoin: false separately,
  // so the tier stays practically unreachable either way.
  skipCreatorEnrollment?: boolean;
}

/**
 * Shared by createIdentity() (regular communities) and unionService.create() (D6). Atomic:
 * the communities-row insert, tier creation, defaultTierId backfill, and creator enrollment all
 * commit or roll back together — previously createIdentity() ran these as separate, unwrapped
 * calls, so a failure partway through (e.g. the tier insert failing after the communities row
 * already committed) could silently leave a real community with no tiers and no default tier at
 * all. Caught and fixed here as part of the union merge (eng-review outside-voice pass,
 * 2026-08-28), not scoped to unions specifically — the bug always applied to every community.
 */
export async function createCommunityRow(
  data: CreateCommunityRowData,
): Promise<{ community: Community; defaultTierId: string; creatorTierId: string }> {
  const now = Math.floor(Date.now() / 1000);
  const id = data.id ?? randomUUID();

  return db.transaction(async (tx) => {
    const [community] = await tx
      .insert(communities)
      .values({
        id,
        displayName: data.displayName,
        description: data.description ?? null,
        logo: data.logo ?? null,
        creatorAddress: data.creatorAddress,
        type: data.type ?? "standard",
        parentCommunityId: data.parentCommunityId ?? null,
        membershipPolicy: data.membershipPolicy ?? "open",
        category: data.category ?? null,
        tierChangesRequireVote: data.tierChangesRequireVote ?? false,
        createdAt: now,
        registeredAt: now,
      })
      .returning();

    const { defaultTierId, creatorTierId } = await createTiersForCommunity(
      community!.id,
      data.tiers,
      data.defaultTierLabel,
      tx,
    );

    const [withDefaultTier] = await tx
      .update(communities)
      .set({ defaultTierId })
      .where(eq(communities.id, community!.id))
      .returning();

    // The creator otherwise has no membership row at all, so tier-scoped permission checks
    // (e.g. proposalService's canCreateProposals) would reject them on their own community.
    // Enroll them at the full-permission ("Admin"-equivalent) tier, not the default tier meant
    // for new joiners — those are frequently different (e.g. the wizard's own default is
    // "Regular", which lacks canCreateProposals), and a creator locked out of their own
    // community's governance actions is a real, previously-reproducible bug.
    if (!data.skipCreatorEnrollment) {
      await tx.insert(memberships).values({
        walletAddress: data.creatorAddress,
        communityId: community!.id,
        tierId: creatorTierId,
        joinedAt: now,
      });
    }

    return { community: withDefaultTier!, defaultTierId, creatorTierId };
  });
}

export async function createIdentity(
  data: IdentityBody & { id?: string; creatorAddress: string },
): Promise<{ community: CommunityRecord; created: boolean }> {
  if (data.parentCommunityId !== undefined) {
    if (data.parentCommunityId === data.id) throw new SelfParentError();
    const parent = await get(data.parentCommunityId);
    if (!parent) throw new ParentCommunityNotFoundError(data.parentCommunityId);
    // Union-as-community merge (2026-08-28, D11) — a union has no governance, category, or
    // hierarchy position of its own; nothing about being a "parent" makes sense for it.
    if (parent.type === "union") throw new ParentIsUnionError(data.parentCommunityId);
    if (!(await isAuthorized(data.parentCommunityId, data.creatorAddress))) {
      throw new ParentNotAuthorizedError();
    }
  }

  if (data.category !== undefined) await assertCategoryExists(data.category);

  try {
    const { community } = await createCommunityRow({
      id: data.id,
      displayName: data.displayName,
      description: data.description,
      logo: data.logo,
      creatorAddress: data.creatorAddress,
      parentCommunityId: data.parentCommunityId,
      membershipPolicy: data.membershipPolicy,
      category: data.category,
      tierChangesRequireVote: data.tierChangesRequireVote,
      tiers: data.tiers,
      defaultTierLabel: data.defaultTierLabel,
    });
    return { community: parseRecord(community, null), created: true };
  } catch (err: unknown) {
    const isUniqueViolation = err instanceof Error && err.message.includes("duplicate key");
    if (isUniqueViolation && data.id !== undefined) {
      const existing = await get(data.id);
      return { community: existing!, created: false };
    }
    throw err;
  }
}

/**
 * Attaches governance config to an existing community identity — one governance row per
 * community, enforced at the DB level by maciGovernanceConfigs' communityId PK (a duplicate
 * insert throws a unique-violation, caught below and surfaced as GovernanceAlreadyConfiguredError
 * rather than a raw DB error leaking to the client). This is the fix for the eng review's
 * highest-severity failure mode: two tabs finishing wizard setup simultaneously must not both
 * succeed in attaching governance.
 */
export async function attachGovernance(id: string, data: GovernanceBody): Promise<CommunityRecord> {
  const identityRows = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
  if (!identityRows[0]) throw new CommunityNotFoundError(id);
  // D11 guard — "governance is deferred for unions" must be an enforced invariant, not just a
  // UI convention (verified during eng review: this function previously took a bare id with
  // zero type checking, so nothing stopped a union from getting a real MACI contract attached).
  if (identityRows[0].type === "union") throw new CommunityIsUnionError(id);

  // Checksum-normalize before storing (and before the unique-constraint check below runs) — a
  // bare unique index on the raw string wouldn't catch two submissions of the same contract in
  // different letter-casing (Child C2, /plan-eng-review 2026-08-25, outside-voice finding).
  const contractAddress = getAddress(data.contractAddress);

  const newGovernanceRecord = {
    communityId: id,
    contractAddress,
    chainId: data.chainId,
    governanceType: "maci",
    allowedPolicies: JSON.stringify(data.allowedPolicies),
    supportedModes: JSON.stringify(data.supportedModes),
    signUpPolicyType: data.signUpPolicyType,
    signUpPolicyAddress: data.signUpPolicyAddress,
    maciDeploymentBlock: data.maciDeploymentBlock,
    stateTreeDepth: data.stateTreeDepth,
    coordinatorPublicKey: data.pollDeployConfig?.coordinatorPublicKey ?? null,
    tallyProcessingStateTreeDepth: data.pollDeployConfig?.treeDepths.tallyProcessingStateTreeDepth ?? null,
    voteOptionTreeDepth: data.pollDeployConfig?.treeDepths.voteOptionTreeDepth ?? null,
    messageBatchSize: data.pollDeployConfig?.messageBatchSize ?? null,
    freeForAllPolicyFactory: data.pollDeployConfig?.freeForAllPolicyFactory ?? null,
    freeForAllChecker: data.pollDeployConfig?.freeForAllChecker ?? null,
    constantVoiceCreditProxyFactory: data.pollDeployConfig?.constantVoiceCreditProxyFactory ?? null,
    initialVoiceCreditAmount: data.pollDeployConfig?.initialVoiceCreditAmount ?? null,
  };

  try {
    await db.insert(maciGovernanceConfigs).values(newGovernanceRecord);
  } catch (err: unknown) {
    // Two unique constraints share this table now: communityId (the PK — one governance row per
    // community) and contractAddress (Child C2 — one community per contract). err.code (Postgres
    // SQLSTATE, not a message string-match) gates whether this is a unique violation at all;
    // constraint_name (exposed by the `postgres` driver's PostgresError type) tells the two
    // apart. Matches zupollService.ts's existing err.code precedent rather than the old
    // message.includes("duplicate key") check, which couldn't distinguish between them.
    const pgErr = err as { code?: string; constraint_name?: string };
    if (pgErr.code === POSTGRES_UNIQUE_VIOLATION) {
      if (pgErr.constraint_name === "maci_governance_configs_contract_address_unique") {
        throw new ContractAddressInUseError(contractAddress);
      }
      throw new GovernanceAlreadyConfiguredError(id);
    }
    throw err;
  }

  // Governance restructure Phase 1 (2026-08-20) — the community now has a real decision adapter
  // available, not just a maciGovernanceConfigs row. This is the one place attaching governance
  // actually persists, shared by every entry point (wizard-adjacent deploy, edit page's advanced
  // setting) — decisionAdapterService.attach is idempotent, so this is safe even if a caller
  // somehow retries attachGovernance after a partial failure elsewhere in this function.
  await attachDecisionAdapter(id, "maci");

  // Fire-and-forget: deploying the community's subgraph shouldn't block or fail attach.
  // deployCommunitySubgraph never throws — failures land in subgraphStatus for the retry
  // route — but .catch is kept as a defensive backstop.
  void deployCommunitySubgraph(id, contractAddress, data.chainId, data.maciDeploymentBlock).catch((err: unknown) => {
    console.error(`[communityService] Unexpected error deploying subgraph for ${id}:`, err);
  });

  return (await get(id))!;
}

export interface CommunityUpdatePatch {
  displayName?: string;
  description?: string;
  logo?: string;
  membershipPolicy?: "open" | "approval";
  category?: string;
  allowJoin?: boolean;
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

// All patchable fields are identity-layer (displayName, membership policy, etc.) — none of
// them touch maciGovernanceConfigs, so this never needs to join or update the governance table.
export async function update(id: string, patch: CommunityUpdatePatch): Promise<CommunityRecord | null> {
  const dbPatch: Partial<Community> = {};
  if (patch.displayName !== undefined) dbPatch.displayName = patch.displayName;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.logo !== undefined) dbPatch.logo = patch.logo;
  if (patch.membershipPolicy !== undefined) dbPatch.membershipPolicy = patch.membershipPolicy;
  if (patch.category !== undefined) {
    await assertCategoryExists(patch.category);
    dbPatch.category = patch.category;
  }
  if (patch.allowJoin !== undefined) dbPatch.allowJoin = patch.allowJoin;
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
  return updated ? get(id) : null;
}
