import type { Id, Option, PreferenceVector, Stance } from "../core/types";
import { clamp, fix } from "../core/mechanisms";
import { MODEL_NAME, ModelUnavailableError, completeJson } from "./provider";

/**
 * Preference elicitation.
 *
 * A participant writes what they think in their own words. The local model
 * turns that into the four numbers per option that every mechanism in this
 * project is built on. It does not decide anything: the result comes back
 * `confirmed: false`, the UI shows every number as an editable control, and
 * `decide()` refuses to count a vector no human has confirmed.
 *
 * Two shape decisions, both learned the hard way against a 3B model:
 *
 *  - One call per option, not one call per person. Asked about three options at
 *    once the model answers about whichever one it read last.
 *  - The model returns a LABEL, never a signed number. Asked for a value in
 *    -1..+1 it reliably inverted the sign, turning "bunu kesinlikle istiyorum"
 *    into strong opposition. Picking from a fixed vocabulary is a task a small
 *    model does well; the arithmetic belongs in code.
 *
 * If no model is installed the heuristic path runs instead, so the app is fully
 * usable with the model turned off. That is deliberate. A governance tool that
 * stops working without AI has made AI load-bearing.
 */

/**
 * Labels are chosen to be far apart as strings, not just in meaning. An earlier
 * vocabulary used "kesinlikle_istiyor" and "kesinlikle_istemiyor", which differ
 * by two characters, and the model returned the first one for a sentence that
 * plainly said the opposite. Distinct words fixed it outright.
 */
const STANCE_LABELS = {
  savunuyor: 1,
  olumlu: 0.5,
  kararsiz: 0,
  yok: 0,
  olumsuz: -0.5,
  reddediyor: -1,
} as const;

const IMPORTANCE_LABELS = {
  belirleyici: 1,
  onemli: 0.5,
  ikincil: 0.2,
  deginmemis: 0,
} as const;

type StanceLabel = keyof typeof STANCE_LABELS;
type ImportanceLabel = keyof typeof IMPORTANCE_LABELS;

interface OptionAnswer {
  /**
   * Asked for, then discarded. Making the model quote before it labels raises
   * label accuracy noticeably, but a 3B model paraphrases instead of quoting,
   * so what it writes here is not fit to show anyone. The sentence the UI
   * displays is pulled out of the person's own text in code, below.
   */
  alinti?: string;
  etiket?: string;
  onem?: string;
  kirmizi_cizgi?: boolean;
}

function systemPromptFor(option: Option): string {
  return [
    "Bir kişinin yazdığı metni okuyup SADECE şu seçenek hakkında ne dediğini sınıflandıracaksın.",
    `SEÇENEK: ${option.label}${option.detail ? ` (${option.detail})` : ""}`,
    "",
    "Önce kişinin bu seçenek hakkındaki cümlesini alıntıla, sonra o alıntıya bakarak etiketi seç.",
    "Diğer seçenekler hakkında söylediklerini görmezden gel.",
    "Yorum katma, ikna etme, eksik bilgiyi tamamlama. Sadece söyleneni ölç.",
    "",
    "etiket için tam olarak şu altı kelimeden birini yaz:",
    "  savunuyor    bu seçeneği güçlü biçimde savunuyor",
    "  olumlu       olumlu bakıyor ama vurgusu ılımlı",
    "  kararsiz     hem olumlu hem olumsuz şey söylemiş",
    "  olumsuz      olumsuz bakıyor",
    "  reddediyor   açıkça karşı çıkıyor",
    "  yok          bu seçenekten hiç bahsetmemiş",
    "",
    "onem için tam olarak şu dört kelimeden birini yaz:",
    "  belirleyici  kişinin kararını bu seçenek belirliyor",
    "  onemli       önemsiyor ama tek belirleyici değil",
    "  ikincil      değinmiş, üstünde durmamış",
    "  deginmemis   bu seçenekten hiç bahsetmemiş",
    "",
    "kirmizi_cizgi sadece kişi 'asla', 'kabul edemem', 'çekilirim', 'gelmem' gibi",
    "bir şey söylediyse true olsun. Sadece hoşlanmamak kırmızı çizgi değildir.",
    "",
    'Sadece şunu döndür: {"alinti":"...","etiket":"...","onem":"...","kirmizi_cizgi":false}',
  ].join("\n");
}

export interface ElicitResult {
  vector: PreferenceVector;
  producedBy: string;
  /** Options the model reported nothing about. The UI asks the person directly. */
  untouched: Id[];
  /**
   * Options where the person clearly wrote something and the draft still came
   * back blank or neutral. A small model misses Turkish nuance often enough
   * that this contradiction is worth catching mechanically: the text and the
   * draft disagree, so the person is asked to settle it rather than being shown
   * a confident zero.
   */
  needsReview: Id[];
}

export async function elicitPreference(args: {
  subjectId: Id;
  decisionId: Id;
  text: string;
  options: Option[];
}): Promise<ElicitResult> {
  const answers = new Map<Id, OptionAnswer>();
  let failures = 0;

  for (const option of args.options) {
    try {
      answers.set(
        option.id,
        await completeJson<OptionAnswer>(systemPromptFor(option), `KİŞİNİN SÖYLEDİĞİ:\n${args.text.trim()}`, {
          maxTokens: 300,
        }),
      );
    } catch (error) {
      if (!(error instanceof ModelUnavailableError)) throw error;
      failures += 1;
    }
  }

  if (failures === args.options.length) {
    return buildFromHeuristic(args, "heuristic (yerel model yanıt vermedi)");
  }

  const untouched: Id[] = [];
  const needsReview: Id[] = [];
  const stances: Stance[] = args.options.map((option) => {
    const answer = answers.get(option.id);
    const stanceLabel = normaliseLabel(answer?.etiket, STANCE_LABELS, "yok") as StanceLabel;
    const importanceLabel = normaliseLabel(answer?.onem, IMPORTANCE_LABELS, "deginmemis") as ImportanceLabel;

    const quote = quoteFor(option, args.text);
    if (!answer || stanceLabel === "yok") untouched.push(option.id);
    if (quote && STANCE_LABELS[stanceLabel] === 0) needsReview.push(option.id);

    return {
      optionId: option.id,
      support: STANCE_LABELS[stanceLabel],
      // The model's own certainty about its reading, not the person's. Never
      // touches weight; it only decides how loudly the UI asks for a review.
      confidence: stanceLabel === "yok" ? 0 : 0.5,
      salience: IMPORTANCE_LABELS[importanceLabel],
      redLine: answer?.kirmizi_cizgi === true,
      rationale: quote,
    };
  });

  return {
    producedBy: failures === 0 ? `local:${MODEL_NAME}` : `local:${MODEL_NAME} (${failures} seçenek okunamadı)`,
    untouched,
    needsReview,
    vector: draft(args, stances),
  };
}

/**
 * The sentence the person actually wrote about this option, found by keyword.
 * Taken from their own text rather than from the model, so what the UI shows
 * back to them is verbatim theirs and cannot be a paraphrase or an invention.
 */
function quoteFor(option: Option, text: string): string | undefined {
  // Stems, not whole words: Turkish agglutination turns "mutfak" into
  // "mutfağa" in the very sentence we are trying to find.
  const needles = option.label
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .map((word) => word.slice(0, Math.max(4, word.length - 2)));
  if (needles.length === 0) return undefined;

  const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((sentence) => sentence.trim()).filter(Boolean);
  const hit = sentences.find((sentence) => {
    const lower = sentence.toLocaleLowerCase("tr");
    return needles.some((needle) => lower.includes(needle));
  });
  return hit && hit.length <= 240 ? hit : hit?.slice(0, 239).concat("…");
}

function draft(args: { subjectId: Id; decisionId: Id }, stances: Stance[]): PreferenceVector {
  return {
    subjectId: args.subjectId,
    decisionId: args.decisionId,
    stances,
    source: "conversation",
    createdAt: new Date().toISOString(),
    // Never true here. Only a person flips this, and decide() enforces it.
    confirmed: false,
  };
}

function buildFromHeuristic(
  args: { subjectId: Id; decisionId: Id; text: string; options: Option[] },
  producedBy: string,
): ElicitResult {
  const raw = heuristicStances(args.text, args.options);
  const untouched: Id[] = [];
  const needsReview: Id[] = [];
  const stances: Stance[] = args.options.map((option) => {
    const given = raw.find((s) => s.optionId === option.id);
    if (!given || given.salience === 0) untouched.push(option.id);
    if (quoteFor(option, args.text) && (given?.support ?? 0) === 0) needsReview.push(option.id);
    return {
      optionId: option.id,
      support: fix(clamp(Number(given?.support ?? 0), -1, 1)),
      confidence: fix(clamp(Number(given?.confidence ?? 0), 0, 1)),
      salience: fix(clamp(Number(given?.salience ?? 0), 0, 1)),
      redLine: given?.redLine === true,
      rationale: given?.rationale,
    };
  });
  return { producedBy, untouched, needsReview, vector: draft(args, stances) };
}

function normaliseLabel(value: unknown, table: Record<string, number>, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const key = value
    .toLocaleLowerCase("tr")
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/ğ/g, "g");
  return key in table ? key : fallback;
}

/** Keyword scoring. Crude on purpose: it is a starting point a person edits. */
export function heuristicStances(text: string, options: Option[]): Partial<Stance>[] {
  const clauses = splitClauses(text.toLowerCase());
  const positive = ["istiyorum", "olsun", "destek", "taraftar", "iyi", "evet", "olmalı", "yanayım", "şart"];
  const negative = ["istemiyorum", "olmasın", "karşıyım", "kötü", "hayır", "gereksiz", "yanlış", "olmamalı"];
  const redline = ["asla", "kabul edemem", "çekilirim", "kırmızı çizgi", "ayrılırım"];

  return options.map((option) => {
    const needles = option.label.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const mentioning = clauses.filter((clause) => needles.some((n) => clause.includes(n)));
    if (mentioning.length === 0) {
      return { optionId: option.id, support: 0, confidence: 0, salience: 0, redLine: false };
    }

    // Scoring only the clauses that name the option keeps "mutfak olsun ama
    // sessiz oda istemiyorum" from cancelling itself out into indifference.
    let score = 0;
    for (const clause of mentioning) {
      score += positive.filter((w) => clause.includes(w)).length;
      score -= negative.filter((w) => clause.includes(w)).length;
    }

    return {
      optionId: option.id,
      support: fix(clamp(score * 0.5, -1, 1)),
      confidence: 0.3,
      salience: fix(clamp(0.3 + 0.2 * mentioning.length, 0, 1)),
      redLine: mentioning.some((clause) => redline.some((w) => clause.includes(w))),
      rationale: mentioning[0].trim() || undefined,
    };
  });
}

/** Turkish sentences carry direction per clause, so split on clause joiners too. */
function splitClauses(text: string): string[] {
  return text
    .split(/[.!?;\n]|,| ama | fakat | ancak | ve | ile /)
    .map((clause) => clause.trim())
    .filter(Boolean);
}
