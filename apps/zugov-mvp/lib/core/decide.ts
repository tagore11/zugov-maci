import { getMechanism, MECHANISM_ORDER, collectRedLines, fix } from "./mechanisms";
import type { Id, MechanismId, Option, Outcome, PreferenceVector } from "./types";

export class UnconfirmedPreferenceError extends Error {
  constructor(subjectId: Id) {
    super(
      `${subjectId} için tercih vektörü henüz bir insan tarafından onaylanmadı. ` +
        `Onaylanmamış tercih sayıma giremez.`,
    );
    this.name = "UnconfirmedPreferenceError";
  }
}

/**
 * The one door into a tally.
 *
 * Two invariants live here and nowhere else:
 *  1. A preference vector that no human confirmed is never counted, no matter
 *     how it was produced. This is what keeps the model out of the ballot box.
 *  2. Red lines are attached to every outcome, so a mechanism can never quietly
 *     drop the fact that someone said "not this one".
 */
export function decide(
  vectors: PreferenceVector[],
  options: Option[],
  mechanismId: MechanismId,
): Outcome {
  for (const vector of vectors) {
    if (!vector.confirmed) throw new UnconfirmedPreferenceError(vector.subjectId);
  }
  const mechanism = getMechanism(mechanismId);
  const ballots = vectors.map((v) => mechanism.project(v, options));
  const outcome = mechanism.tally(ballots, options);
  return { ...outcome, redLines: collectRedLines(vectors, options) };
}

export interface SensitivityReport {
  /** Winner under each mechanism. null means the mechanism produced no winner. */
  byMechanism: Array<{ mechanismId: MechanismId; name: string; winnerId: Id | null; contest: number }>;
  /** Distinct winners across mechanisms. One entry means the room, not the rule, decided. */
  distinctWinners: Id[];
  /**
   * 0 .. 1. Zero means every mechanism agrees and the choice of rule is
   * irrelevant. Approaching 1 means the rule is doing the deciding, and the
   * room should be told that before anyone calls the result legitimate.
   */
  sensitivity: number;
  verdict: "robust" | "leaning" | "rule-dependent";
}

/**
 * Runs the same confirmed preferences through every mechanism.
 *
 * Arrow's theorem says no rule is neutral. Most tools hide that by exposing one
 * rule. This exposes it: if swapping the rule swaps the winner, the room is
 * being governed by its software, and it deserves to know.
 */
export function analyseSensitivity(vectors: PreferenceVector[], options: Option[]): SensitivityReport {
  const byMechanism = MECHANISM_ORDER.map((id) => {
    const mechanism = getMechanism(id);
    const outcome = decide(vectors, options, id);
    return { mechanismId: id, name: mechanism.name, winnerId: outcome.winnerId, contest: outcome.contest };
  });

  const winners = byMechanism.map((m) => m.winnerId).filter((w): w is Id => w !== null);
  const distinctWinners = [...new Set(winners)];

  const sensitivity =
    winners.length === 0 ? 0 : fix((distinctWinners.length - 1) / Math.max(1, winners.length - 1));

  const verdict: SensitivityReport["verdict"] =
    distinctWinners.length <= 1 ? "robust" : sensitivity < 0.5 ? "leaning" : "rule-dependent";

  return { byMechanism, distinctWinners, sensitivity, verdict };
}
