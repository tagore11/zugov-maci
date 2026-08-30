import type { Id, Option, OptionScore, Outcome, PreferenceVector, Stance } from "../types";

export const APPROVAL_THRESHOLD = 0.2;
export const OBJECTION_THRESHOLD = -0.5;
export const CREDIT_BUDGET = 100;

export function stanceFor(vector: PreferenceVector, optionId: Id): Stance {
  const found = vector.stances.find((s) => s.optionId === optionId);
  return (
    found ?? {
      optionId,
      support: 0,
      confidence: 0,
      salience: 0,
      redLine: false,
    }
  );
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Round to 4 decimals so tallies are comparable across machines. */
export function fix(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}

export function labelOf(options: Option[], id: Id): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

export function collectRedLines(
  vectors: PreferenceVector[],
  options: Option[],
): Outcome["redLines"] {
  return options
    .map((option) => ({
      optionId: option.id,
      count: vectors.filter((v) => stanceFor(v, option.id).redLine).length,
    }))
    .filter((entry) => entry.count > 0);
}

/**
 * How close the race is, on 0..1. Two options within a hair of each other give
 * ~1; a runaway winner gives ~0. Used to tell a room "this was close" instead
 * of pretending every result is equally settled.
 */
export function contestOf(scores: OptionScore[]): number {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const [first, second] = sorted;
  if (!first || !second) return 0;
  const spread = Math.abs(first.score);
  if (spread === 0) return second.score === 0 ? 1 : 0;
  return fix(clamp(1 - Math.abs(first.score - second.score) / spread, 0, 1));
}

export function winnerOf(scores: OptionScore[]): Id | null {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  if (sorted.length === 0) return null;
  if (sorted[0].score <= 0) return null;
  if (sorted[1] && sorted[1].score === sorted[0].score) return null; // honest tie
  return sorted[0].optionId;
}
