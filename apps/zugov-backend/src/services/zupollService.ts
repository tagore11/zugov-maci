import { randomUUID } from "node:crypto";
import { eq, and, inArray, isNull, sql } from "drizzle-orm";
import { keccak256, toBytes } from "viem";
import { Group } from "@semaphore-protocol/group";
import { verifyProof } from "@semaphore-protocol/proof";
import { db } from "../db/client.js";
import {
  zupollIdentityCommitments,
  zupollProposalGroups,
  zupollVotes,
  proposals,
  memberships,
  membershipTiers,
} from "../db/schema.js";
import * as membershipService from "./membershipService.js";

// specs/013-zupoll-decision-adapter — the Zupoll adapter's dedicated service. Per Principle I
// (Voting Mechanism Modularity), this is the ONLY file that imports @semaphore-protocol/* —
// no other layer touches the native Semaphore API directly.

// @semaphore-protocol/proof@4.14.3's package.json "exports" map doesn't resolve its named type
// exports (SemaphoreProof) under this project's `moduleResolution: "NodeNext"`, even though the
// package's value exports (verifyProof) resolve fine — an upstream package-export-map quirk, not
// a bug in this code. Declared locally instead of importing, matching the package's own
// documented `SemaphoreProof` shape (proof/dist/types/types/index.d.ts) exactly.
// `generateProof`'s `scope`/`message` parameters accept BigNumberish OR arbitrary text — a
// non-numeric string (e.g. a UUID proposalId) is transparently hashed-and-reduced into the
// SNARK scalar field internally, using an algorithm the package does NOT expose publicly
// (confirmed empirically: `@semaphore-protocol/proof`'s public API only exports `generateProof`/
// `verifyProof`/pack helpers, never the internal `hash()` it uses). Depending on an unexported
// internal to replicate that transformation server-side would be fragile against version bumps.
// Instead, both sides pre-hash `proposalId` into a field element THEMSELVES, using this
// standard, well-known BN254-scalar-field reduction, before it ever reaches `generateProof`'s
// scope parameter — once the value handed to `generateProof` is already numeric, its internal
// handling passes it through unchanged (verified empirically against the installed package),
// so this becomes the actual, exact scope with no dependency on the library's internal hashing.
// The frontend's proof-generation code (`useZupollIdentity`/voting UI) MUST call this exact same
// function on `proposalId` before passing it as `generateProof`'s scope argument — passing the
// raw proposalId string directly to `generateProof` there would silently produce a DIFFERENT
// scope than this function computes, and every vote would fail verification.
const SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

export function proposalScope(proposalId: string): string {
  const digest = keccak256(toBytes(proposalId));
  return (BigInt(digest) % SNARK_SCALAR_FIELD).toString();
}

export interface SemaphoreProof {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  message: string;
  nullifier: string;
  scope: string;
  points: string[];
}

export class InvalidCommitmentError extends Error {
  constructor() {
    super("Invalid Semaphore identity commitment");
  }
}

export class ZupollProposalNotFoundError extends Error {
  constructor() {
    super("Not found");
  }
}

export class InvalidVoteProofError extends Error {
  constructor(message = "Invalid or mismatched vote proof") {
    super(message);
  }
}

export class DuplicateVoteError extends Error {
  constructor() {
    super("This identity has already voted on this proposal");
  }
}

export class ProposalClosedError extends Error {
  constructor() {
    super("This proposal is no longer accepting votes");
  }
}

export class NotAuthorizedToWithdrawError extends Error {
  constructor() {
    super("Not authorized to withdraw this proposal");
  }
}

export class VotesAlreadyCastError extends Error {
  constructor() {
    super("Cannot withdraw a proposal that already has votes");
  }
}

const POSTGRES_UNIQUE_VIOLATION = "23505";

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/** A Semaphore identity commitment is a field element — a non-negative decimal integer string.
 * Rejects malformed input before it ever reaches a Merkle tree computation. */
function isValidCommitment(value: string): boolean {
  if (!/^[0-9]+$/.test(value)) return false;
  try {
    BigInt(value);
    return true;
  } catch {
    return false;
  }
}

async function getZupollProposalOrThrow(proposalId: string) {
  const [row] = await db.select().from(proposals).where(eq(proposals.id, proposalId)).limit(1);
  if (!row || row.decisionAdapterType !== "zupoll") throw new ZupollProposalNotFoundError();
  return row;
}

/** FR-003 / Clarifications Q1 — scoped per (walletAddress, communityId), never global. Upsert,
 * not insert-once: FR-014's "no recovery" means a member may register a *new* commitment for
 * future proposals, self-service, with no admin action — this is that path. Re-registering does
 * not retroactively change any proposal's already-taken snapshot (zupollProposalGroups rows are
 * immutable), so votes already possible under an old commitment remain possible. */
export async function registerCommitment(
  walletAddress: string,
  communityId: string,
  commitment: string,
): Promise<{ registeredAt: number }> {
  if (!isValidCommitment(commitment)) throw new InvalidCommitmentError();

  const registeredAt = nowSeconds();
  await db
    .insert(zupollIdentityCommitments)
    .values({ walletAddress, communityId, commitment, registeredAt })
    .onConflictDoUpdate({
      target: [zupollIdentityCommitments.walletAddress, zupollIdentityCommitments.communityId],
      set: { commitment, registeredAt },
    });

  return { registeredAt };
}

/** FR-004 / User Story 5 — the historic eligibility snapshot. Called exactly once, at proposal
 * creation time (see proposalService.createZupollProposal); no code path re-runs this query
 * afterward. A member without a registered commitment is simply absent from the snapshot. */
export async function snapshotGroup(
  communityId: string,
  proposalId: string,
  eligibleTierIds: string[],
): Promise<{ groupRoot: string; groupCommitments: string[] }> {
  const rows =
    eligibleTierIds.length === 0
      ? []
      : await db
          .select({ commitment: zupollIdentityCommitments.commitment })
          .from(zupollIdentityCommitments)
          .innerJoin(
            memberships,
            and(
              eq(memberships.walletAddress, zupollIdentityCommitments.walletAddress),
              eq(memberships.communityId, zupollIdentityCommitments.communityId),
            ),
          )
          .innerJoin(membershipTiers, eq(membershipTiers.id, memberships.tierId))
          .where(
            and(
              eq(zupollIdentityCommitments.communityId, communityId),
              inArray(membershipTiers.id, eligibleTierIds),
              eq(membershipTiers.canVote, true),
            ),
          );

  const groupCommitments = rows.map((row) => row.commitment);
  const group = new Group(groupCommitments.map((commitment) => BigInt(commitment)));
  const groupRoot = group.root.toString();

  await db.insert(zupollProposalGroups).values({
    proposalId,
    groupRoot,
    groupCommitments: JSON.stringify(groupCommitments),
    createdAt: nowSeconds(),
  });

  return { groupRoot, groupCommitments };
}

/** Public — no requireAuth. FR-012: Zupoll proposals' existence/question/options are visible to
 * everyone, including non-members — unlike the generic MACI-facing proposal list
 * (proposalService.listForViewer), which is session-gated and filters to the viewer's
 * tier-eligibility. Excludes withdrawn proposals (removed from the eligible-voter view, FR-015). */
export async function listProposals(
  communityId: string,
): Promise<{ id: string; title: string; options: string[]; pollEndDate: number | null }[]> {
  const rows = await db
    .select()
    .from(proposals)
    .where(
      and(
        eq(proposals.communityId, communityId),
        eq(proposals.decisionAdapterType, "zupoll"),
        isNull(proposals.withdrawnAt),
      ),
    );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    options: row.options ? (JSON.parse(row.options) as string[]) : [],
    pollEndDate: row.pollEndDate,
  }));
}

/** Public — no requireAuth. Question/options/group data are all already-public per FR-012 and
 * research.md #8; requiring a session here would only create an asymmetry with the deliberately
 * unauthenticated vote endpoint below, not add any real protection. */
export async function getGroup(
  proposalId: string,
): Promise<{ title: string; options: string[]; groupRoot: string; groupCommitments: string[] } | null> {
  const [proposalRow] = await db.select().from(proposals).where(eq(proposals.id, proposalId)).limit(1);
  if (!proposalRow || proposalRow.decisionAdapterType !== "zupoll") return null;

  const [groupRow] = await db
    .select()
    .from(zupollProposalGroups)
    .where(eq(zupollProposalGroups.proposalId, proposalId))
    .limit(1);
  if (!groupRow) return null;

  return {
    title: proposalRow.title,
    options: proposalRow.options ? (JSON.parse(proposalRow.options) as string[]) : [],
    groupRoot: groupRow.groupRoot,
    groupCommitments: JSON.parse(groupRow.groupCommitments) as string[],
  };
}

/** research.md #3 (the single load-bearing decision of this feature) — the caller of this
 * function MUST NOT be resolved from a session. Its ONLY inputs are the proposal id and a
 * self-contained Semaphore proof; nothing here can ever be extended to accept or log a wallet
 * address without breaking FR-007. */
export async function verifyAndRecordVote(proposalId: string, proof: SemaphoreProof): Promise<{ optionIdx: number }> {
  const proposalRow = await getZupollProposalOrThrow(proposalId);

  const now = nowSeconds();
  if (proposalRow.withdrawnAt !== null) throw new ProposalClosedError();
  if (proposalRow.pollEndDate !== null && now >= proposalRow.pollEndDate) throw new ProposalClosedError();

  const [groupRow] = await db
    .select()
    .from(zupollProposalGroups)
    .where(eq(zupollProposalGroups.proposalId, proposalId))
    .limit(1);
  if (!groupRow) throw new ZupollProposalNotFoundError();

  // research.md #11 — the proof's scope MUST be this exact proposalId (compared via
  // proposalScope()'s field-element encoding, see that function's doc comment for why a raw
  // string comparison against proposalId would never match). Rejects a proof generated for a
  // different proposal (or a different community's proposal) even if otherwise valid, and is
  // what makes votes by the same identity unlinkable across proposals (a fixed/global scope
  // would make every vote by one identity share the same nullifier).
  if (String(proof.scope) !== proposalScope(proposalId)) throw new InvalidVoteProofError();

  // Reject a proof built against a stale or foreign group root — the caller must be proving
  // membership in *this* proposal's immutable snapshot, not some other group that happens to
  // verify cryptographically.
  if (String(proof.merkleTreeRoot) !== groupRow.groupRoot) throw new InvalidVoteProofError();

  // The chosen option is derived from the proof's own `message` field, never trusted from a
  // separate request field — otherwise a validly-verified proof for one option could be paired
  // with a different claimed option in the request body.
  const optionIdx = Number(proof.message);
  const options = proposalRow.options ? (JSON.parse(proposalRow.options) as string[]) : [];
  if (!Number.isInteger(optionIdx) || optionIdx < 0 || optionIdx >= options.length) {
    throw new InvalidVoteProofError("Vote option out of range");
  }

  const validProof = await verifyProof(proof);
  if (!validProof) throw new InvalidVoteProofError();

  try {
    await db.insert(zupollVotes).values({
      id: randomUUID(),
      proposalId,
      optionIdx,
      nullifier: String(proof.nullifier),
      castAt: now,
    });
  } catch (err) {
    if ((err as { code?: string })?.code === POSTGRES_UNIQUE_VIOLATION) {
      throw new DuplicateVoteError();
    }
    throw err;
  }

  return { optionIdx };
}

/** FR-015 — withdraw-only, no edit, and only while zero votes exist. Creator or an authorized
 * admin (isAuthorized — the one reusable creator-or-canManageMembership pattern, matching every
 * other admin-gated mutation in this codebase). */
export async function withdraw(proposalId: string, walletAddress: string): Promise<{ withdrawnAt: number }> {
  const proposalRow = await getZupollProposalOrThrow(proposalId);

  const isCreator = proposalRow.creatorAddress.toLowerCase() === walletAddress.toLowerCase();
  if (!isCreator && !(await membershipService.isAuthorized(proposalRow.communityId, walletAddress))) {
    throw new NotAuthorizedToWithdrawError();
  }

  if (proposalRow.withdrawnAt !== null) return { withdrawnAt: proposalRow.withdrawnAt };

  const [existingVote] = await db
    .select({ id: zupollVotes.id })
    .from(zupollVotes)
    .where(eq(zupollVotes.proposalId, proposalId))
    .limit(1);
  if (existingVote) throw new VotesAlreadyCastError();

  const withdrawnAt = nowSeconds();
  await db.update(proposals).set({ withdrawnAt }).where(eq(proposals.id, proposalId));
  return { withdrawnAt };
}

/** FR-008, real server-side enforcement (not a client-side-only convention) — `nullifier` is the
 * caller's own, already-known nullifier from when they voted. Presenting it back reveals nothing
 * the server doesn't already know from the vote itself (a nullifier carries no identity
 * information), so this requires no wallet, no session, and no new identity-linking data. */
export async function getTally(
  proposalId: string,
  nullifier?: string,
): Promise<{ revealed: false } | { revealed: true; counts: number[] }> {
  const proposalRow = await getZupollProposalOrThrow(proposalId);
  const options = proposalRow.options ? (JSON.parse(proposalRow.options) as string[]) : [];

  const now = nowSeconds();
  const expired = proposalRow.pollEndDate !== null && now >= proposalRow.pollEndDate;

  let revealed = expired;
  if (!revealed && nullifier) {
    const [voteRow] = await db
      .select({ id: zupollVotes.id })
      .from(zupollVotes)
      .where(and(eq(zupollVotes.proposalId, proposalId), eq(zupollVotes.nullifier, nullifier)))
      .limit(1);
    revealed = !!voteRow;
  }

  if (!revealed) return { revealed: false };

  const rows = await db
    .select({ optionIdx: zupollVotes.optionIdx, count: sql<number>`count(*)::int` })
    .from(zupollVotes)
    .where(eq(zupollVotes.proposalId, proposalId))
    .groupBy(zupollVotes.optionIdx);

  const counts = new Array(options.length).fill(0) as number[];
  for (const row of rows) {
    if (row.optionIdx >= 0 && row.optionIdx < counts.length) counts[row.optionIdx] = row.count;
  }

  return { revealed: true, counts };
}
