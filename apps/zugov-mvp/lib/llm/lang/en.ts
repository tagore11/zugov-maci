/**
 * Everything in elicit.ts's heuristic path that is true of English and nothing else.
 *
 * Kept as one object behind the LanguagePack shape rather than scattered through
 * elicit.ts so that adding a second language later is "write a second file and change
 * one import," not "grep elicit.ts for every place English leaked in." elicit.ts itself
 * has no locale logic; it only calls into whichever pack LANG points at.
 */

export interface LanguagePack {
  readonly locale: string;
  /** Case-fold and strip diacritics the way this language's label matching needs. */
  foldDiacritics(value: string): string;
  /** Lowercase a word the way this locale defines "lowercase." */
  toLocaleLower(value: string): string;
  /** Reduce a label to stems worth searching for. */
  stemWords(label: string): string[];
  /** Split running text into sentences. */
  splitSentences(text: string): string[];
  /** Split running text into clauses, including this language's contrast/list joiners. */
  splitClauses(text: string): string[];
  readonly heuristicVocabulary: {
    readonly positive: readonly string[];
    readonly negative: readonly string[];
    readonly redline: readonly string[];
  };
  /** Words whose presence decides which of the six audit questions a proposal earns. */
  readonly questionTriggerVocabulary: {
    readonly commitment: readonly string[];
    readonly groups: readonly string[];
    readonly priorAttempt: readonly string[];
  };
  /** Fallback sentences the Grounding Engine writes itself, without a model. */
  readonly groundingCopy: {
    readonly cruxAllCovered: string;
    readonly cruxNoneCovered: string;
    cruxSomeMissing(silentLabels: string[]): string;
    cruxChoiceBetween(labels: string[]): string;
    producedByExtraction: string;
    producedByAuditIncomplete(base: string, failures: number): string;
    heuristicSummary(sentenceCount: number, optionCount: number): string;
    heuristicAssumption(claim: string): string;
    heuristicNoBaseRate: string;
    heuristicCounterargument(sentence: string): string;
    heuristicNoCounterargument: string;
    heuristicNoReversibilityInfo: string;
    heuristicAffectedParty(keyword: string): string;
    heuristicNoPrecedent: string;
  };
  /** Words too common to count as a keyword, filtered out of the no-model summary. */
  readonly stopwords: ReadonlySet<string>;
  readonly elicitCopy: {
    heuristicNoModelResponse: string;
    producedByLocalModel(modelName: string): string;
    producedByLocalModelPartial(modelName: string, failures: number): string;
  };
}

export const enLanguagePack: LanguagePack = {
  locale: "en",

  foldDiacritics(value) {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
  },

  toLocaleLower(value) {
    return value.toLocaleLowerCase("en");
  },

  // Stems, not whole words: strips a trailing plural/verb ending so "kitchens" and
  // "kitchen" match the same needle without needing a real stemmer for a heuristic path.
  stemWords(label) {
    return label
      .toLocaleLowerCase("en")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .map((word) => word.replace(/(ing|ies|es|ed|s)$/, ""));
  },

  splitSentences(text) {
    return text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  },

  // English carries direction per clause too, so split on clause joiners as well.
  splitClauses(text) {
    return text
      .split(/[.!?;\n]|,| but | however | yet | and | with /)
      .map((clause) => clause.trim())
      .filter(Boolean);
  },

  // Whole phrases, not bare "yes"/"no": short words like that are substrings of
  // "know", "now", or "yesterday" often enough to make the match untrustworthy.
  // "want" itself is left out of positive on purpose: it is a substring of the
  // negative phrase "don't want", so keeping it would score both at once and
  // cancel out on every sentence that uses the negative form.
  heuristicVocabulary: {
    positive: ["support", "in favor", "should happen", "good idea", "necessary", "definitely"],
    negative: ["don't want", "against", "not good", "unnecessary", "shouldn't", "opposed", "bad idea"],
    redline: ["never", "can't accept", "will walk", "dealbreaker", "will leave", "won't accept"],
  },

  questionTriggerVocabulary: {
    commitment: ["build", "construct", "buy", "rent", "contract", "agreement", "sign", "move", "invest", "budget", "cost", "fee"],
    groups: ["employee", "resident", "business", "neighbor", "member", "guest", "family", "child", "volunteer", "team"],
    priorAttempt: ["last (year|time)", "before", "previously", "prior", "not the first time", "tried this"],
  },

  groundingCopy: {
    cruxAllCovered: "The rationale says something about every option.",
    cruxNoneCovered: "The rationale says nothing about any of the options.",
    cruxSomeMissing: (silentLabels) => `Some options are never mentioned in the rationale: ${silentLabels.join(", ")}.`,
    cruxChoiceBetween: (labels) =>
      labels.length === 2
        ? `The choice is between ${labels[0]} and ${labels[1]}.`
        : `The choice is between ${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}.`,
    producedByExtraction: "the text itself",
    producedByAuditIncomplete: (base, failures) => `${base} (${failures} question unanswered)`,
    heuristicSummary: (sentenceCount, optionCount) =>
      `The text is made of ${sentenceCount} statements and asks for a decision among ${optionCount} options.`,
    heuristicAssumption: (claim) => `The following has to be true: "${claim}"`,
    heuristicNoBaseRate: "The proposal has no numeric basis. A point of comparison has to come from outside it.",
    heuristicCounterargument: (sentence) => `Sentence worth testing against a counter-reading: "${sentence}"`,
    heuristicNoCounterargument: "The text leaves no room for a counterargument.",
    heuristicNoReversibilityInfo: "The cost of reversing this is not stated in the text.",
    heuristicAffectedParty: (keyword) => `The party named as "${keyword}" in the text is affected.`,
    heuristicNoPrecedent: "No precedent is shown in the text.",
  },

  elicitCopy: {
    heuristicNoModelResponse: "heuristic (local model did not respond)",
    producedByLocalModel: (modelName) => `local:${modelName}`,
    producedByLocalModelPartial: (modelName, failures) => `local:${modelName} (${failures} options could not be read)`,
  },

  stopwords: new Set(
    "the and for with that this from a an of to in on is are was were be been being as at by or if but not have has had do does did will would can could should shall may might".split(
      " ",
    ),
  ),
};
