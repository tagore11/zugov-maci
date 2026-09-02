import { createHash } from "node:crypto";
import { EPISTEMIC_QUESTIONS } from "../core/types";
import type { EpistemicQuestionKey, GroundingReport, Id } from "../core/types";
import { MODEL_NAME, ModelUnavailableError, completeJson } from "./provider";
import { trLanguagePack, type LanguagePack } from "./lang/tr";
import { AUDIT_QUESTION_PROMPTS, auditContextBlock, auditQuestionSystemPrompt } from "./lang/tr-prompts";
import { copy } from "../copy";

/** The one line that changes when this app speaks a second language. */
const LANG: LanguagePack = trLanguagePack;

/**
 * The Grounding Engine.
 *
 * Its job is to make a decision legible, which means saying less, not more. By
 * default it produces one sentence naming the real dilemma and one sentence per
 * option saying what choosing it costs. For three options that is four
 * sentences.
 *
 * The six-question audit below still exists and is still the substance: what
 * has to be true, what the base rates are, the strongest objection, how
 * reversible it is, who is affected, what the precedents are. It runs when
 * someone asks for it. It no longer runs at people.
 *
 * The engine holds no vote and cannot rank the options. Nothing in the tally
 * path reads this file.
 */

export interface GroundingInput {
  decisionId: Id;
  title: string;
  body: string;
  options: { id: Id; label: string }[];
}

/**
 * The default pass. No model runs here at all.
 *
 * For each option it shows what the proposal itself says about it, in the
 * author's own sentences, and names the options the proposal says nothing
 * about. That silence is a real finding: an option nobody wrote a reason for is
 * about to be voted on anyway.
 *
 * This used to ask the model to name the dilemma and write a trade-off per
 * option. Both are synthesis, and a 3B model that classifies Turkish reliably
 * writes it badly: it produced "S işletme bütçesini azalttı" as a trade-off and
 * a question mark as a cost. Finding a sentence is exact, instant, needs no
 * model, and cannot hallucinate, because every word shown was written by the
 * person who wrote the proposal.
 *
 * Generation is left where the model is actually good: reading a participant's
 * own words into stances, and the six-question audit below, which a reader opens
 * knowing a machine wrote it.
 */
export async function groundProposal(input: GroundingInput): Promise<GroundingReport> {
  const tradeoffs: Record<Id, string> = {};
  const silent: string[] = [];

  for (const option of input.options) {
    const said = sentencesAbout(option.label, input.body);
    if (said.length > 0) tradeoffs[option.id] = said.join(" ");
    else silent.push(option.label);
  }

  const gc = LANG.groundingCopy;
  const crux =
    silent.length === 0
      ? gc.cruxAllCovered
      : silent.length === input.options.length
        ? gc.cruxNoneCovered
        : gc.cruxSomeMissing(silent);

  return assemble(input, { crux, tradeoffs, sections: null, producedBy: gc.producedByExtraction });
}

/**
 * The proposal's own sentences that name this option.
 *
 * Matched on stems, because Turkish agglutination turns "mutfak" into "mutfağa"
 * in the very sentence being looked for.
 */
function sentencesAbout(label: string, body: string): string[] {
  const stems = LANG.stemWords(label);
  if (stems.length === 0) return [];

  return LANG.splitSentences(body)
    .filter((sentence) => {
      const lower = LANG.toLocaleLower(sentence);
      return stems.some((stem) => lower.includes(stem));
    })
    .slice(0, 2);
}

/**
 * Which questions this particular proposal earns.
 *
 * Six questions asked of every proposal is six questions asked because the list
 * has six entries. Two of them apply to anything anyone proposes; the other four
 * are asked only when the text gives a reason to ask them. A proposal that cites
 * last year's attempt does not need to be asked for precedents, and one that
 * makes no numeric claim has no base rate to check.
 *
 * The selection is made from the text, not by a model, so a reader can be told
 * why a question was asked.
 */
export function questionsFor(input: GroundingInput): EpistemicQuestionKey[] {
  const text = LANG.toLocaleLower(`${input.title} ${input.body}`);
  const triggers = LANG.questionTriggerVocabulary;
  const mentions = (words: readonly string[]) => new RegExp(`(${words.join("|")})`).test(text);

  // These two hold for any proposal: something has to be true for it to work,
  // and someone can argue against it.
  const chosen: EpistemicQuestionKey[] = ["assumptions", "counterarguments"];

  // A numeric claim invites the question of what the usual figure is.
  if (/\d/.test(text)) chosen.push("baseRates");

  // Words that describe committing to something make the cost of undoing it
  // worth asking about.
  if (mentions(triggers.commitment)) chosen.push("reversibility");

  // More than two options, or a text that already names groups, means the
  // question of who is affected has something to bite on.
  if (input.options.length > 2 || mentions(triggers.groups)) chosen.push("affectedParties");

  // Asked only when the text points at no prior attempt of its own.
  if (!mentions(triggers.priorAttempt)) chosen.push("precedents");

  // A floor of three. A proposal that trips none of the conditions above still
  // deserves more than two questions, and reversibility is the one that applies
  // to anything: every decision either can be undone or cannot.
  const FLOOR = 3;
  for (const filler of ["reversibility", "affectedParties", "baseRates"] as EpistemicQuestionKey[]) {
    if (chosen.length >= FLOOR) break;
    if (!chosen.includes(filler)) chosen.push(filler);
  }

  return chosen;
}

/**
 * The six-question audit, run only when someone opens it.
 */
export async function auditProposal(input: GroundingInput, base: GroundingReport): Promise<GroundingReport> {
  const context = auditContextBlock(input);
  const asked = questionsFor(input);
  const raw: RawGrounding = {};
  let failures = 0;

  for (const key of asked) {
    const spec = AUDIT_QUESTION_PROMPTS[key];
    try {
      const answer = await completeJson<{ observations?: string[] }>(
        auditQuestionSystemPrompt(spec.instruction, spec.example),
        context,
        { maxTokens: 500 },
      );
      raw[key] = answer.observations;
    } catch (error) {
      if (!(error instanceof ModelUnavailableError)) throw error;
      failures += 1;
    }
  }

  const fallback = heuristicGrounding(input);
  const source = auditContextBlock(input);
  const exampleLines = new Set(
    Object.values(AUDIT_QUESTION_PROMPTS)
      .flatMap((spec) => spec.example)
      .map(normalise),
  );

  const sections = Object.fromEntries(
    asked.map((key) => [
      key,
      {
        question: copy.grounding.auditQuestions[key],
        observations:
          failures === asked.length
            ? cleanObservations(fallback[key], source, exampleLines)
            : cleanObservations(raw[key], source, exampleLines),
      },
    ]),
  ) as Partial<Record<EpistemicQuestionKey, { question: string; observations: string[] }>>;

  return assemble(input, {
    crux: base.crux,
    tradeoffs: base.tradeoffs,
    sections,
    producedBy:
      failures === 0 ? base.producedBy : LANG.groundingCopy.producedByAuditIncomplete(base.producedBy, failures),
  });
}

function assemble(
  input: GroundingInput,
  parts: {
    crux: string;
    tradeoffs: Record<Id, string>;
    sections: Partial<Record<EpistemicQuestionKey, { question: string; observations: string[] }>> | null;
    producedBy: string;
  },
): GroundingReport {
  return {
    decisionId: input.decisionId,
    generatedAt: new Date().toISOString(),
    producedBy: parts.producedBy,
    crux: parts.crux,
    tradeoffs: parts.tradeoffs,
    sections: parts.sections,
    digest: createHash("sha256")
      .update(JSON.stringify({ crux: parts.crux, tradeoffs: parts.tradeoffs, sections: parts.sections }))
      .digest("hex")
      .slice(0, 16),
  };
}

/** Without a model, name the choice from the option labels rather than guess at it. */
function heuristicCrux(input: GroundingInput): string {
  return LANG.groundingCopy.cruxChoiceBetween(input.options.map((option) => option.label));
}

/** The engine may say a figure is missing. It may not supply one. */
function groundedInSource(line: string, source: string): boolean {
  const digits = source.replace(/[.,\s]/g, "");
  for (const match of line.match(/\d[\d.,]*/g) ?? []) {
    const value = match.replace(/[.,]/g, "");
    if (value.length > 0 && !digits.includes(value)) return false;
  }
  return true;
}

interface RawGrounding {
  summary?: string;
  keywords?: string[];
  assumptions?: string[];
  baseRates?: string[];
  counterarguments?: string[];
  reversibility?: string[];
  affectedParties?: string[];
  precedents?: string[];
}

/** Deterministic report used when no model is installed. Honest about being thin. */
export function heuristicGrounding(input: GroundingInput): RawGrounding {
  const sentences = input.body
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const keywords = extractKeywords(`${input.title} ${input.body}`);
  const claim = sentences[0] ?? input.title;
  const gc = LANG.groundingCopy;

  return {
    summary: gc.heuristicSummary(sentences.length, input.options.length),
    keywords,
    assumptions: [gc.heuristicAssumption(truncate(claim))],
    baseRates: [gc.heuristicNoBaseRate],
    counterarguments:
      sentences.length > 1 ? [gc.heuristicCounterargument(truncate(sentences[1]))] : [gc.heuristicNoCounterargument],
    reversibility: [gc.heuristicNoReversibilityInfo],
    affectedParties: keywords.slice(0, 3).map((k) => gc.heuristicAffectedParty(k)),
    precedents: [gc.heuristicNoPrecedent],
  };
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 6);
}

/**
 * Three things a small model does that an auditor must never do, caught here
 * rather than trusted away in the prompt.
 *
 *  1. Answering with a bare noun phrase ("finansal", "talepler"). A fragment is
 *     not an observation; printing it fakes a rigour the report does not have.
 *  2. Copying the few-shot example back. The example is from an unrelated
 *     decision, so a copied line is a claim about the wrong subject entirely.
 *  3. Inventing figures. The engine may say a number is missing; it may not
 *     supply one. Any observation carrying a number absent from the proposal is
 *     dropped, because a fabricated cost is worse than a missing section.
 */
function cleanObservations(value: unknown, source: string, exampleLines: Set<string>): string[] {
  return cleanList(value)
    .filter((observation) => observation.split(/\s+/).length >= 4)
    .filter((observation) => !exampleLines.has(normalise(observation)))
    .filter((observation) => numbersAreGrounded(observation, source));
}

function numbersAreGrounded(observation: string, source: string): boolean {
  const sourceDigits = source.replace(/[.,\s]/g, "");
  for (const match of observation.match(/\d[\d.,]*/g) ?? []) {
    const digits = match.replace(/[.,]/g, "");
    if (digits.length > 0 && !sourceDigits.includes(digits)) return false;
  }
  return true;
}

function normalise(text: string): string {
  return LANG.toLocaleLower(text).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function truncate(text: string, limit = 140): string {
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function extractKeywords(text: string): string[] {
  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? []) {
    if (LANG.stopwords.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([word]) => word);
}
