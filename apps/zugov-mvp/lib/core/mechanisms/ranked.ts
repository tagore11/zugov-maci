import type { Ballot, Id, Mechanism, Option } from "../types";
import { contestOf, fix, labelOf, stanceFor } from "./shared";

export interface RankedShape {
  /** Best first. Options the participant is actively against are left out. */
  order: Id[];
}

const AGAINST = -0.34;

/**
 * Instant-runoff. Eliminates the weakest first choice each round and moves
 * those ballots to their next surviving preference.
 */
export const ranked: Mechanism<RankedShape> = {
  id: "ranked",
  name: "Sıralama",
  question: "Seçenekleri en çok istediğinden en aza doğru sırala.",

  project(vector, options): Ballot<RankedShape> {
    const order = options
      .map((o) => ({ option: o, stance: stanceFor(vector, o.id) }))
      .filter(({ stance }) => stance.support > AGAINST)
      .sort((a, b) => {
        const bySupport = b.stance.support - a.stance.support;
        if (Math.abs(bySupport) > 1e-9) return bySupport;
        const bySalience = b.stance.salience - a.stance.salience;
        if (Math.abs(bySalience) > 1e-9) return bySalience;
        return a.option.id.localeCompare(b.option.id);
      })
      .map(({ option }) => option.id);
    return { mechanismId: "ranked", subjectId: vector.subjectId, decisionId: vector.decisionId, shape: { order } };
  },

  explain(ballot, options) {
    if (ballot.shape.order.length === 0) return ["Sıralamana hiçbir seçenek girmedi."];
    const named = ballot.shape.order.map((id, i) => `${i + 1}. ${labelOf(options, id)}`);
    return [
      `Sıran: ${named.join("  ·  ")}`,
      "İlk tercihin elenirse oyun sıradaki seçeneğine geçer, boşa gitmez.",
    ];
  },

  tally(ballots, options) {
    const notes: string[] = [];
    let alive = new Set(options.map((o) => o.id));
    const firstRoundCounts = countFirst(ballots, alive);

    while (alive.size > 1) {
      const counts = countFirst(ballots, alive);
      const cast = sum(Object.values(counts));
      if (cast === 0) {
        notes.push("Hiçbir geçerli oy kalmadı.");
        break;
      }
      const leader = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (leader[1] * 2 > cast) {
        notes.push(`${labelOf(options, leader[0])} ${alive.size} seçenek arasında salt çoğunluğa ulaştı.`);
        break;
      }
      const weakest = Object.entries(counts).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0];
      alive.delete(weakest[0]);
      notes.push(`${labelOf(options, weakest[0])} elendi, oyları sonraki tercihlere aktarıldı.`);
    }

    const finalCounts = countFirst(ballots, alive);
    const scores = options.map((o) => ({
      optionId: o.id,
      score: alive.has(o.id) ? finalCounts[o.id] ?? 0 : fix((firstRoundCounts[o.id] ?? 0) * 0.001),
      unit: "oy",
    }));

    const survivors = scores.filter((s) => alive.has(s.optionId)).sort((a, b) => b.score - a.score);
    const winnerId =
      survivors.length > 0 && survivors[0].score > 0 && survivors[0].score !== survivors[1]?.score
        ? survivors[0].optionId
        : null;

    return {
      mechanismId: "ranked",
      winnerId,
      scores,
      participantCount: ballots.length,
      contest: contestOf(scores.filter((s) => alive.has(s.optionId))),
      redLines: [],
      notes,
    };
  },
};

function countFirst(ballots: Ballot<RankedShape>[], alive: Set<Id>): Record<Id, number> {
  const counts: Record<Id, number> = {};
  alive.forEach((id) => (counts[id] = 0));
  for (const ballot of ballots) {
    const top = ballot.shape.order.find((id) => alive.has(id));
    if (top !== undefined) counts[top] += 1;
  }
  return counts;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
