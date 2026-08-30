import type { Ballot, Id, Mechanism, Option } from "../types";
import { CREDIT_BUDGET, contestOf, fix, labelOf, stanceFor, winnerOf } from "./shared";

export interface QuadraticShape {
  /** optionId -> signed credits spent. Sum of |credits| never exceeds the budget. */
  credits: Record<Id, number>;
}

/**
 * Quadratic voting. Intensity costs the square of the votes it buys, so a
 * participant who cares about one thing very much cannot also dominate
 * everything else. `salience` is the budget split; `support` is the direction.
 */
export const quadratic: Mechanism<QuadraticShape> = {
  id: "quadratic",
  name: "Ağırlık",
  question: "100 kredin var. Önemsediğin seçeneklere dağıt.",

  project(vector, options): Ballot<QuadraticShape> {
    const weights = options.map((o) => {
      const s = stanceFor(vector, o.id);
      return { id: o.id, weight: Math.abs(s.support) * (0.25 + 0.75 * s.salience), sign: Math.sign(s.support) };
    });
    const total = weights.reduce((acc, w) => acc + w.weight, 0);
    const credits: Record<Id, number> = {};
    for (const w of weights) {
      credits[w.id] = total === 0 ? 0 : fix(w.sign * (w.weight / total) * CREDIT_BUDGET);
    }
    return { mechanismId: "quadratic", subjectId: vector.subjectId, decisionId: vector.decisionId, shape: { credits } };
  },

  explain(ballot, options) {
    const spent = Object.entries(ballot.shape.credits)
      .filter(([, c]) => Math.abs(c) >= 1)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    if (spent.length === 0) return ["Kredilerini hiçbir seçeneğe yüklemedin."];
    return [
      ...spent.map(
        ([id, c]) =>
          `${labelOf(options, id)}: ${Math.abs(Math.round(c))} kredi ${c >= 0 ? "destek" : "itiraz"} → ${votesOf(c).toFixed(1)} oy`,
      ),
      "Kredi ikiye katlandığında oy sadece 1,41 katına çıkar. Şiddetli tercih pahalıdır.",
    ];
  },

  tally(ballots, options) {
    const scores = options.map((option) => ({
      optionId: option.id,
      score: fix(ballots.reduce((acc, b) => acc + votesOf(b.shape.credits[option.id] ?? 0), 0)),
      unit: "oy",
    }));
    return {
      mechanismId: "quadratic",
      winnerId: winnerOf(scores),
      scores,
      participantCount: ballots.length,
      contest: contestOf(scores),
      redLines: [],
      notes: [],
    };
  },
};

function votesOf(credits: number): number {
  return Math.sign(credits) * Math.sqrt(Math.abs(credits));
}
