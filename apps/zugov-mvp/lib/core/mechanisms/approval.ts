import type { Ballot, Id, Mechanism, Option, PreferenceVector } from "../types";
import { APPROVAL_THRESHOLD, contestOf, labelOf, stanceFor, winnerOf } from "./shared";

export interface ApprovalShape {
  approved: Id[];
}

/**
 * Approval voting. The projection keeps only the sign of `support`, which is
 * exactly the information approval voting is able to count. Everything else
 * the participant told us is discarded here and recovered by other mechanisms.
 */
export const approval: Mechanism<ApprovalShape> = {
  id: "approval",
  name: "Onay",
  question: "Hangi seçenekleri kabul edebilirsin?",

  project(vector: PreferenceVector, options: Option[]): Ballot<ApprovalShape> {
    const approved = options
      .filter((o) => stanceFor(vector, o.id).support >= APPROVAL_THRESHOLD)
      .map((o) => o.id);
    return { mechanismId: "approval", subjectId: vector.subjectId, decisionId: vector.decisionId, shape: { approved } };
  },

  explain(ballot, options) {
    if (ballot.shape.approved.length === 0) {
      return ["Hiçbir seçeneği onaylamıyorsun. Oyun sayıma girmez."];
    }
    return [
      `Onayladıkların: ${ballot.shape.approved.map((id) => labelOf(options, id)).join(", ")}.`,
      "Onayladıkların arasında sıralama yok, hepsi eşit sayılır.",
    ];
  },

  tally(ballots, options) {
    const scores = options.map((option) => ({
      optionId: option.id,
      score: ballots.filter((b) => b.shape.approved.includes(option.id)).length,
      unit: "onay",
    }));
    return {
      mechanismId: "approval",
      winnerId: winnerOf(scores),
      scores,
      participantCount: ballots.length,
      contest: contestOf(scores),
      redLines: [],
      notes: [],
    };
  },
};
