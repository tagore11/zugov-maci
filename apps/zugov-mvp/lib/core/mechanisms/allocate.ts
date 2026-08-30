import type { Ballot, Id, Mechanism, Option } from "../types";
import { CREDIT_BUDGET, contestOf, fix, labelOf, stanceFor, winnerOf } from "./shared";

export interface AllocateShape {
  /** optionId -> share of this participant's pot, 0..100, sums to <= 100. */
  shares: Record<Id, number>;
}

/**
 * Quadratic funding style split. Used when the decision is "how do we divide
 * something", not "which one wins". Many small contributions beat one large
 * one, because the matched amount is the square of the sum of square roots.
 */
export const allocate: Mechanism<AllocateShape> = {
  id: "allocate",
  name: "Paylaştırma",
  question: "Kaynağı seçenekler arasında nasıl bölerdin?",

  project(vector, options): Ballot<AllocateShape> {
    const weights = options.map((o) => {
      const s = stanceFor(vector, o.id);
      return { id: o.id, weight: Math.max(0, s.support) * (0.25 + 0.75 * s.salience) };
    });
    const total = weights.reduce((acc, w) => acc + w.weight, 0);
    const shares: Record<Id, number> = {};
    for (const w of weights) shares[w.id] = total === 0 ? 0 : fix((w.weight / total) * CREDIT_BUDGET);
    return { mechanismId: "allocate", subjectId: vector.subjectId, decisionId: vector.decisionId, shape: { shares } };
  },

  explain(ballot, options) {
    const given = Object.entries(ballot.shape.shares)
      .filter(([, v]) => v >= 1)
      .sort((a, b) => b[1] - a[1]);
    if (given.length === 0) return ["Payını hiçbir seçeneğe ayırmadın."];
    return [
      ...given.map(([id, v]) => `${labelOf(options, id)}: %${Math.round(v)}`),
      "Bir seçeneğe çok kişinin az vermesi, tek kişinin çok vermesinden daha ağır basar.",
    ];
  },

  tally(ballots, options) {
    const scores = options.map((option) => {
      const roots = ballots.reduce((acc, b) => acc + Math.sqrt(Math.max(0, b.shape.shares[option.id] ?? 0)), 0);
      return { optionId: option.id, score: fix(roots * roots), unit: "eşleşen pay" };
    });
    return {
      mechanismId: "allocate",
      winnerId: winnerOf(scores),
      scores,
      participantCount: ballots.length,
      contest: contestOf(scores),
      redLines: [],
      notes: ["Sonuç bir kazanan değil, bir bölüşüm önerisidir."],
    };
  },
};
