/**
 * ZuGov core types.
 *
 * The whole point of this file: a person's preference is recorded ONCE, in a
 * form that belongs to the person, not to the voting rule. Voting rules are
 * projections of that record. Change the rule, keep the preference.
 */

export type Id = string;

/** One option on the table. */
export interface Option {
  id: Id;
  label: string;
  /** Optional short description shown under the label. */
  detail?: string;
}

/**
 * What a participant actually holds about one option.
 *
 * These four numbers are deliberately orthogonal. Most voting systems collapse
 * them (approval keeps only the sign of `support`; quadratic keeps `salience`;
 * ranked keeps the ordering). Recording them separately is what makes the
 * mechanism swappable after the fact.
 */
export interface Stance {
  optionId: Id;
  /** -1 (strongly against) .. +1 (strongly for). 0 is genuine indifference. */
  support: number;
  /** 0 .. 1, how well-informed the participant feels. Never affects weight. */
  confidence: number;
  /** 0 .. 1, how much this option matters to them relative to the others. */
  salience: number;
  /** "I cannot live with this outcome." Surfaced, never silently decisive. */
  redLine: boolean;
  /** Free text in the participant's own words. */
  rationale?: string;
}

export type PreferenceSource = "form" | "conversation" | "imported";

export interface PreferenceVector {
  subjectId: Id;
  decisionId: Id;
  stances: Stance[];
  source: PreferenceSource;
  createdAt: string;
  /**
   * True only when a human looked at the final numbers and confirmed them.
   * Anything produced by a model starts false and cannot be tallied until a
   * person flips it. See `assertConfirmed`.
   */
  confirmed: boolean;
}

/** A ballot is whatever a specific mechanism needs. Opaque to the rest of the app. */
export interface Ballot<Shape = unknown> {
  mechanismId: MechanismId;
  subjectId: Id;
  decisionId: Id;
  shape: Shape;
}

export type MechanismId =
  | "approval"
  | "ranked"
  | "quadratic"
  | "consent"
  | "allocate";

export interface OptionScore {
  optionId: Id;
  score: number;
  /** Mechanism-specific unit, shown to humans: "onay", "puan", "kredi"… */
  unit: string;
}

export interface Outcome {
  mechanismId: MechanismId;
  winnerId: Id | null;
  scores: OptionScore[];
  participantCount: number;
  /**
   * 0 .. 1, how close the top two are. 1 means a tie, 0 means a landslide.
   * High contest is not a failure; it is information about the room.
   */
  contest: number;
  /** Options at least one participant declared a red line against. */
  redLines: Array<{ optionId: Id; count: number }>;
  /** Human-readable notes the mechanism wants on the record (runoff rounds etc). */
  notes: string[];
}

export interface Mechanism<Shape = unknown> {
  id: MechanismId;
  /** Shown in the UI. Plain language, no theory words. */
  name: string;
  /** One sentence a non-expert can act on. */
  question: string;
  /** Project a preference vector into a ballot this mechanism can count. */
  project(vector: PreferenceVector, options: Option[]): Ballot<Shape>;
  /** Explain, in the participant's terms, what their ballot says. */
  explain(ballot: Ballot<Shape>, options: Option[]): string[];
  tally(ballots: Ballot<Shape>[], options: Option[]): Outcome;
}

export const EPISTEMIC_QUESTIONS = [
  "assumptions",
  "baseRates",
  "counterarguments",
  "reversibility",
  "affectedParties",
  "precedents",
] as const;

export type EpistemicQuestionKey = (typeof EPISTEMIC_QUESTIONS)[number];

export interface GroundingSection {
  question: string;
  observations: string[];
}

/**
 * What the Grounding Engine puts in front of a person.
 *
 * The crux and the trade-offs, and nothing else by default. An earlier version
 * printed six questions and up to eighteen observations before anyone had
 * chosen anything, which is a research report, not help. A tool whose job is to
 * clear the crowd in someone's head cannot begin by adding to it.
 *
 * `sections` holds the six-question audit and is filled only when someone asks
 * for it. The audit is still the engine's substance; it is no longer the
 * greeting.
 */
export interface GroundingReport {
  decisionId: Id;
  generatedAt: string;
  /** "local:<model>" or "heuristic", always visible in the UI. */
  producedBy: string;
  /** One sentence naming the real dilemma. This is the whole default output. */
  crux: string;
  /** Per option, one sentence: what choosing it costs. */
  tradeoffs: Record<Id, string>;
  /**
   * Only the questions this proposal earned. Partial on purpose: asking all six
   * of everything is asking because the list has six entries.
   */
  sections: Partial<Record<EpistemicQuestionKey, GroundingSection>> | null;
  /** sha256 of the normalised report body, so two people can compare runs. */
  digest: string;
}
