/**
 * Everything in elicit.ts's heuristic path that is true of Turkish and nothing else.
 *
 * Kept as one object behind the LanguagePack shape rather than scattered through
 * elicit.ts so that adding a second language later is "write a second file and change
 * one import," not "grep elicit.ts for every place Turkish leaked in." elicit.ts itself
 * has no locale logic; it only calls into whichever pack LANG points at.
 */

export interface LanguagePack {
  readonly locale: string;
  /** Case-fold and strip diacritics the way this language's label matching needs. */
  foldDiacritics(value: string): string;
  /** Lowercase a word the way this locale defines "lowercase" (Turkish's dotted/dotless I). */
  toLocaleLower(value: string): string;
  /** Reduce a label to stems worth searching for, agglutination-aware. */
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

export const trLanguagePack: LanguagePack = {
  locale: "tr",

  foldDiacritics(value) {
    return value
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/ğ/g, "g");
  },

  toLocaleLower(value) {
    return value.toLocaleLowerCase("tr");
  },

  // Stems, not whole words: Turkish agglutination turns "mutfak" into "mutfağa"
  // in the very sentence this is trying to match against.
  stemWords(label) {
    return label
      .toLocaleLowerCase("tr")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .map((word) => word.slice(0, Math.max(4, word.length - 2)));
  },

  splitSentences(text) {
    return text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  },

  // Turkish sentences carry direction per clause, so split on clause joiners too.
  splitClauses(text) {
    return text
      .split(/[.!?;\n]|,| ama | fakat | ancak | ve | ile /)
      .map((clause) => clause.trim())
      .filter(Boolean);
  },

  heuristicVocabulary: {
    positive: ["istiyorum", "olsun", "destek", "taraftar", "iyi", "evet", "olmalı", "yanayım", "şart"],
    negative: ["istemiyorum", "olmasın", "karşıyım", "kötü", "hayır", "gereksiz", "yanlış", "olmamalı"],
    redline: ["asla", "kabul edemem", "çekilirim", "kırmızı çizgi", "ayrılırım"],
  },

  questionTriggerVocabulary: {
    commitment: ["kur", "inşa", "satın", "kirala", "sözleşme", "anlaşma", "imzala", "taşın", "yatırım", "bütçe", "maliyet", "ücret"],
    groups: ["çalışan", "sakin", "esnaf", "komşu", "üye", "misafir", "aile", "çocuk", "gönüllü", "ekip"],
    priorAttempt: ["geçen (yıl|sene|sefer)", "daha önce", "geçmişte", "önceki", "ilk kez değil", "deneme"],
  },

  groundingCopy: {
    cruxAllCovered: "Gerekçe her seçenek hakkında bir şey söylüyor.",
    cruxNoneCovered: "Gerekçe seçeneklerin hiçbiri hakkında bir şey söylemiyor.",
    cruxSomeMissing: (silentLabels) => `Gerekçede hiç geçmeyen seçenek var: ${silentLabels.join(", ")}.`,
    cruxChoiceBetween: (labels) =>
      labels.length === 2
        ? `${labels[0]} ile ${labels[1]} arasında seçim yapılıyor.`
        : `${labels.slice(0, -1).join(", ")} ve ${labels[labels.length - 1]} arasında seçim yapılıyor.`,
    producedByExtraction: "metnin kendisi",
    producedByAuditIncomplete: (base, failures) => `${base} (${failures} soru cevapsız)`,
    heuristicSummary: (sentenceCount, optionCount) =>
      `Metin ${sentenceCount} önermeden oluşuyor ve ${optionCount} seçenek arasında karar istiyor.`,
    heuristicAssumption: (claim) => `Şu önermenin doğru olması gerekiyor: "${claim}"`,
    heuristicNoBaseRate: "Öneride sayısal bir dayanak yok. Karşılaştırma noktası dışarıdan getirilmeli.",
    heuristicCounterargument: (sentence) => `Karşı okuma için sınanacak cümle: "${sentence}"`,
    heuristicNoCounterargument: "Metin karşı argümana yer vermiyor.",
    heuristicNoReversibilityInfo: "Geri dönüş maliyeti metinde belirtilmemiş.",
    heuristicAffectedParty: (keyword) => `Metinde "${keyword}" başlığıyla anılan taraf etkileniyor.`,
    heuristicNoPrecedent: "Emsal metinde gösterilmemiş.",
  },

  elicitCopy: {
    heuristicNoModelResponse: "heuristic (yerel model yanıt vermedi)",
    producedByLocalModel: (modelName) => `local:${modelName}`,
    producedByLocalModelPartial: (modelName, failures) => `local:${modelName} (${failures} seçenek okunamadı)`,
  },

  stopwords: new Set(
    "ve veya ile için ama fakat çünkü bir bu şu da de ki gibi olarak olan sonra önce üzerine kadar daha çok en her hiç the and for with that this from".split(
      " ",
    ),
  ),
};
