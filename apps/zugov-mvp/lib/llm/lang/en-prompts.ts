/**
 * Every instruction sent to the local model, in one file.
 *
 * elicit.ts and grounding.ts hold the orchestration (which call to make, how many times,
 * what to do with a failure); this holds what gets said. A second language needs a second
 * file shaped like this one, not a hunt through both orchestration files for an embedded
 * English sentence.
 *
 * Labels the model answers with (STANCE_LABELS, IMPORTANCE_LABELS in elicit.ts;
 * EpistemicQuestionKey in core/types.ts) are not here: they are machine-readable keys, read
 * by code rather than a person, and elicit.ts's own note on why they are chosen to be far
 * apart as strings applies in any language a prompt gets translated into.
 */

import type { EpistemicQuestionKey, Option } from "../../core/types";

export function elicitationSystemPrompt(option: Option): string {
  return [
    "You will read a sentence someone wrote and classify ONLY what they said about the following option.",
    `OPTION: ${option.label}${option.detail ? ` (${option.detail})` : ""}`,
    "",
    "First quote the person's sentence about this option, then choose the label by looking at that quote.",
    "Ignore anything they said about other options.",
    "Do not add interpretation, persuasion, or fill in missing information. Only measure what was said.",
    "",
    "for stance, write exactly one of these six words:",
    "  champions    strongly advocates for this option",
    "  favorable    leans positive, mild emphasis",
    "  mixed        said both something positive and something negative",
    "  unfavorable  leans negative",
    "  rejects      clearly opposes it",
    "  silent       never mentioned this option at all",
    "",
    "for importance, write exactly one of these four words:",
    "  decisive     this option decides the person's choice",
    "  important    cares about it but it is not the sole decider",
    "  minor        touched on it, did not dwell on it",
    "  untouched    never mentioned this option at all",
    "",
    "set redLine to true only if the person said something like 'never', 'can't accept',",
    "'I'll walk', 'dealbreaker'. Simply disliking something is not a red line.",
    "",
    'Return only this: {"quote":"...","stance":"...","importance":"...","redLine":false}',
  ].join("\n");
}

export function elicitationUserContent(text: string): string {
  return `WHAT THE PERSON SAID:\n${text.trim()}`;
}

export function auditContextBlock(input: { title: string; body: string; options: { label: string }[] }): string {
  return [
    `TITLE: ${input.title}`,
    "",
    "TEXT:",
    input.body.trim(),
    "",
    `OPTIONS: ${input.options.map((option) => option.label).join(" | ")}`,
  ].join("\n");
}

export function auditQuestionSystemPrompt(instruction: string, example: readonly string[]): string {
  return [
    "You are an epistemic auditor. You have no vote, you give no recommendation, and you do not",
    "say which option should win. You answer a SINGLE question about the text you're given.",
    "",
    `QUESTION: ${instruction}`,
    "",
    "Rules:",
    "- Take no side. 'I propose', 'the best', 'should be accepted' are forbidden.",
    "- Do not invent a figure. If a piece of information is not in the text, say it is missing.",
    "- Every observation must be a full sentence, 6 to 25 words, with a verb.",
    "- Write two or three observations. Write in English.",
    "",
    "The example below belongs to an UNRELATED topic. Do not copy its sentences, only match its length:",
    JSON.stringify({ observations: example }),
    "",
    'Return only this: {"observations":["...","..."]}',
  ].join("\n");
}

export interface AuditQuestionPrompt {
  /** Fed into auditQuestionSystemPrompt's QUESTION line. */
  readonly instruction: string;
  /** An answer from an unrelated decision, so copying it would be obvious. */
  readonly example: readonly string[];
}

export const AUDIT_QUESTION_PROMPTS: Record<EpistemicQuestionKey, AuditQuestionPrompt> = {
  assumptions: {
    instruction:
      "Write the assumptions, not explicitly proven in the text, that have to turn out true for this proposal to work.",
    example: [
      "It's assumed the new stops will keep today's ridership.",
      "It's assumed riders will accept the longer travel time.",
    ],
  },
  baseRates: {
    instruction:
      "What historical data or point of comparison is needed to evaluate this decision? State plainly whether the text has it.",
    example: [
      "The text has no data on how past route changes affected ridership.",
      "Occupancy rates on neighboring lines are needed as a comparison.",
    ],
  },
  counterarguments: {
    instruction:
      "Write the strongest argument against this proposal. Build the opposing case at its best, without adding your own opinion.",
    example: [
      "It is not shown that the shorter walk offsets the longer ride.",
      "The group most affected by the change is not the group deciding it.",
    ],
  },
  reversibility: {
    instruction: "If this decision turns out badly, how easy would it be to reverse? Does the text state the cost of reversing it?",
    example: [
      "Once signage and schedules change, the cost of reverting to the old route is not stated.",
      "No trial period is defined, so there is no threshold for reversing the decision.",
    ],
  },
  affectedParties: {
    instruction: "Who is affected by this decision? List the directly affected and the easily-overlooked indirect parties separately.",
    example: [
      "Residents near the old stops and residents near the new stops are affected in opposite directions.",
      "Businesses that don't use the line but are affected by street traffic are an indirect party.",
    ],
  },
  precedents: {
    instruction: "What precedent or similar case should be examined before deciding? Does the text point to one?",
    example: [
      "An earlier route change in the same city is not mentioned in the text.",
      "How a district of similar population handled the same decision should be examined.",
    ],
  },
};

/**
 * Unused by the current default pass (see groundProposal's own note: crux and trade-off now
 * come from extracting the proposal's own sentences, not from asking a 3B model to write
 * either). Kept here, not deleted, so the model-facing prompt surface stays in one file even
 * for the path this app currently takes a different route around.
 */
export const CRUX_PROMPT = [
  "A community is about to decide. Read the text and name the real dilemma at its core in one sentence.",
  "",
  "Rules:",
  "- Do NOT say which option should win. Only say what the dilemma is.",
  "- Do not repeat or summarize the text. Name what people are actually choosing between.",
  "- One sentence, at most 25 words. Write in English.",
  "",
  "Example (unrelated topic, do not copy): ",
  '{"crux":"The choice is between something everyone benefits a little from and something a few benefit a lot from."}',
  "",
  'Return only this: {"crux":"..."}',
].join("\n");

export function tradeoffPrompt(label: string): string {
  return [
    `A community is about to decide. If the option "${label}" is chosen, say in one sentence what the`,
    "community gives up.",
    "",
    "Rules:",
    "- Do not defend or criticize this option. Only name its cost.",
    "- Do not invent a number that isn't in the text.",
    "- One sentence, at most 20 words. Write in English.",
    "",
    'Return only this: {"tradeoff":"..."}',
  ].join("\n");
}
