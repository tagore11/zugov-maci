import type { Ballot, Id, Mechanism, Option } from "../types";
import { OBJECTION_THRESHOLD, contestOf, fix, labelOf, stanceFor } from "./shared";

export interface ConsentShape {
  /** Options the participant can live with, even without enthusiasm. */
  tolerable: Id[];
  /** Options they formally object to. A red line is always an objection. */
  objections: Id[];
}

/**
 * Consent (sociocracy). Asks "can you live with it", not "is this your
 * favourite". The winner is the option the fewest people object to, which is
 * usually not the option the most people love, and that gap is the point.
 */
export const consent: Mechanism<ConsentShape> = {
  id: "consent",
  name: "Consent",
  question: "Which options can you live with, and which do you object to?",

  project(vector, options): Ballot<ConsentShape> {
    const tolerable: Id[] = [];
    const objections: Id[] = [];
    for (const option of options) {
      const s = stanceFor(vector, option.id);
      if (s.redLine || s.support <= OBJECTION_THRESHOLD) objections.push(option.id);
      else tolerable.push(option.id);
    }
    return { mechanismId: "consent", subjectId: vector.subjectId, decisionId: vector.decisionId, shape: { tolerable, objections } };
  },

  explain(ballot, options) {
    const lines: string[] = [];
    if (ballot.shape.tolerable.length > 0) {
      lines.push(`What you can live with: ${ballot.shape.tolerable.map((id) => labelOf(options, id)).join(", ")}.`);
    }
    if (ballot.shape.objections.length > 0) {
      lines.push(`What you object to: ${ballot.shape.objections.map((id) => labelOf(options, id)).join(", ")}.`);
      lines.push("Your objection does not cancel the result on its own, but it is recorded and stays visible.");
    }
    return lines.length > 0 ? lines : ["You made no statement about any option."];
  },

  tally(ballots, options) {
    const scores = options.map((option) => {
      const objections = ballots.filter((b) => b.shape.objections.includes(option.id)).length;
      return {
        optionId: option.id,
        score: fix(ballots.length - objections),
        unit: "consent",
      };
    });
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const winnerId =
      sorted[0] && sorted[0].score > 0 && sorted[0].score !== sorted[1]?.score ? sorted[0].optionId : null;
    return {
      mechanismId: "consent",
      winnerId,
      scores,
      participantCount: ballots.length,
      contest: contestOf(scores),
      redLines: [],
      notes:
        winnerId === null && sorted.length > 0
          ? ["Consent was split evenly, no single option stood out."]
          : [],
    };
  },
};
