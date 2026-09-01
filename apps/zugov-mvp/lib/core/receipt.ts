import { createHash } from "node:crypto";
import { decide } from "./decide";
import { getMechanism } from "./mechanisms";
import type { Id, MechanismId, Option, Outcome, PreferenceVector } from "./types";

/**
 * A receipt anyone can recompute.
 *
 * A tally that lives in one process on one laptop is a claim. This turns it
 * into something a person who was not in the room can check: the inputs, the
 * rule, the result, and one digest over all of it. Recompute from the published
 * bundle and you get the same digest, or the result was not what was claimed.
 *
 * Two decisions shape what goes in.
 *
 * Ballots are published without names. A receipt that carried wallet addresses
 * beside ballots would let anyone prove how a person voted, which makes votes
 * purchasable and undoes the reason anti-collusion voting exists at all. Each
 * ballot instead carries a hash of the voter's identity with a per-decision
 * salt, so a person can find their own entry while nobody can build the list.
 *
 * The salt is published with the receipt on purpose. It stops a reader from
 * testing a guessed address against a receipt from a *different* decision, and
 * it is honest that in a room of nine people a ballot can still identify
 * someone by its content. Hiding the ballot itself is a different problem, and
 * the one MACI solves.
 */

export interface ReceiptBallot {
  /** sha256(salt + lowercased subject id), truncated. Not reversible in bulk. */
  voter: string;
  stances: Array<{ optionId: Id; support: number; salience: number; redLine: boolean }>;
}

export interface Receipt {
  version: 1;
  decisionId: Id;
  title: string;
  mechanismId: MechanismId;
  mechanismName: string;
  options: Option[];
  salt: string;
  ballots: ReceiptBallot[];
  outcome: {
    winnerId: Id | null;
    scores: Array<{ optionId: Id; score: number; unit: string }>;
    participantCount: number;
    contest: number;
    redLines: Array<{ optionId: Id; count: number }>;
    notes: string[];
  };
  /** sha256 over the canonical form of everything above. */
  digest: string;
}

export function buildReceipt(args: {
  decisionId: Id;
  title: string;
  options: Option[];
  mechanismId: MechanismId;
  preferences: PreferenceVector[];
  salt: string;
}): Receipt {
  const options = [...args.options].sort((a, b) => a.id.localeCompare(b.id));
  const outcome = decide(args.preferences, args.options, args.mechanismId);

  const ballots: ReceiptBallot[] = args.preferences
    .map((vector) => ({
      voter: hashVoter(args.salt, vector.subjectId),
      stances: [...vector.stances]
        .sort((a, b) => a.optionId.localeCompare(b.optionId))
        .map((stance) => ({
          optionId: stance.optionId,
          support: stance.support,
          salience: stance.salience,
          redLine: stance.redLine,
        })),
    }))
    // Sorted by the hash, so the order of the published list says nothing about
    // who voted when.
    .sort((a, b) => a.voter.localeCompare(b.voter));

  const body = {
    version: 1 as const,
    decisionId: args.decisionId,
    title: args.title,
    mechanismId: args.mechanismId,
    mechanismName: getMechanism(args.mechanismId).name,
    options,
    salt: args.salt,
    ballots,
    outcome: normaliseOutcome(outcome),
  };

  return { ...body, digest: digestOf(body) };
}

/**
 * Recompute a receipt from its own published contents.
 *
 * Returns what a checker needs to say out loud: whether the digest matches the
 * body, and whether running the stated rule over the stated ballots produces
 * the stated result. The two can disagree, and which one fails says something
 * different: a broken digest means the file was edited, a broken tally means
 * the result was never what the ballots said.
 */
export function verifyReceipt(receipt: Receipt): {
  digestMatches: boolean;
  tallyMatches: boolean;
  recomputed: Outcome;
} {
  const { digest, ...body } = receipt;
  const digestMatches = digestOf(body) === digest;

  // Ballots are anonymous, so identity is reconstructed as the published hash.
  // decide() only needs vectors to be distinct and confirmed.
  const vectors: PreferenceVector[] = receipt.ballots.map((ballot) => ({
    subjectId: ballot.voter,
    decisionId: receipt.decisionId,
    source: "imported",
    createdAt: "1970-01-01T00:00:00.000Z",
    confirmed: true,
    stances: ballot.stances.map((stance) => ({ ...stance, confidence: 0 })),
  }));

  const recomputed = decide(vectors, receipt.options, receipt.mechanismId);
  const tallyMatches =
    JSON.stringify(normaliseOutcome(recomputed)) === JSON.stringify(receipt.outcome);

  return { digestMatches, tallyMatches, recomputed };
}

function normaliseOutcome(outcome: Outcome): Receipt["outcome"] {
  return {
    winnerId: outcome.winnerId,
    scores: [...outcome.scores]
      .sort((a, b) => a.optionId.localeCompare(b.optionId))
      .map((score) => ({ optionId: score.optionId, score: score.score, unit: score.unit })),
    participantCount: outcome.participantCount,
    contest: outcome.contest,
    redLines: [...outcome.redLines].sort((a, b) => a.optionId.localeCompare(b.optionId)),
    notes: outcome.notes,
  };
}

function hashVoter(salt: string, subjectId: string): string {
  return createHash("sha256").update(`${salt}:${subjectId.toLowerCase()}`).digest("hex").slice(0, 16);
}

function digestOf(body: unknown): string {
  return createHash("sha256").update(canonical(body)).digest("hex");
}

/**
 * Canonical JSON: object keys sorted, no incidental whitespace.
 *
 * Two people recomputing the same receipt have to produce byte-identical input
 * to the hash, and JSON.stringify preserves insertion order, which is a
 * property of how an object was built rather than of what it contains.
 */
function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
}
