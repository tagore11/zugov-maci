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
 * If no model is installed the heuristic path below runs instead, so the app
 * is fully usable with the model turned off. That is deliberate. A governance
 * tool that stops working without AI has made AI load-bearing.
 */

const SYSTEM_PROMPT = [
  "Bir kişinin kendi cümleleriyle anlattığı tercihi sayılara çeviriyorsun.",
  "Yorum katma, ikna etme, eksik bilgiyi tamamlama. Sadece söyleneni ölç.",
  "",
  "Her seçenek için dört değer üret:",
  "- support: -1 ile 1 arası. Kişi karşıysa negatif, taraftarsa pozitif, sessizse 0.",
  "- confidence: 0 ile 1 arası. Kişinin kendi ifadesindeki kesinlik.",
  "- salience: 0 ile 1 arası. Kişinin bu konuya ne kadar yer ayırdığı.",
  "- redLine: true sadece kişi 'asla', 'kabul edemem', 'çekilirim' türü bir şey dediyse.",
  "- rationale: kişinin kendi cümlesinden alınmış kısa alıntı. Yoksa boş bırak.",
  "",
  "Metinde hiç değinilmemiş seçenek için hepsi 0 ve redLine false olmalı.",
  "Sadece şu JSON'u döndür:",
  '{"stances":[{"optionId":"...","support":0,"confidence":0,"salience":0,"redLine":false,"rationale":""}]}',
].join("\n");

export interface ElicitResult {
  vector: PreferenceVector;
  producedBy: string;
  /** Options the model reported nothing about. The UI asks the person directly. */
  untouched: Id[];
}

export async function elicitPreference(args: {
  subjectId: Id;
  decisionId: Id;
  text: string;
  options: Option[];
}): Promise<ElicitResult> {
  const userPrompt = [
    "SEÇENEKLER:",
    ...args.options.map((o) => `- ${o.id}: ${o.label}${o.detail ? ` (${o.detail})` : ""}`),
    "",
    "KİŞİNİN SÖYLEDİĞİ:",
    args.text.trim(),
  ].join("\n");

  try {
    const raw = await completeJson<{ stances?: Partial<Stance>[] }>(SYSTEM_PROMPT, userPrompt, { maxTokens: 1200 });
    return build(args, raw.stances ?? [], `local:${MODEL_NAME}`);
  } catch (error) {
    if (error instanceof ModelUnavailableError) {
      return build(args, heuristicStances(args.text, args.options), `heuristic (${error.message})`);
    }
    throw error;
  }
}

function build(
  args: { subjectId: Id; decisionId: Id; options: Option[] },
  rawStances: Partial<Stance>[],
  producedBy: string,
): ElicitResult {
  const byOption = new Map<Id, Partial<Stance>>();
  for (const stance of rawStances) {
    if (stance?.optionId && args.options.some((o) => o.id === stance.optionId)) {
      byOption.set(stance.optionId, stance);
    }
  }

  const untouched: Id[] = [];
  const stances: Stance[] = args.options.map((option) => {
    const raw = byOption.get(option.id);
    if (!raw) untouched.push(option.id);
    return {
      optionId: option.id,
      support: fix(clamp(Number(raw?.support ?? 0), -1, 1)),
      confidence: fix(clamp(Number(raw?.confidence ?? 0), 0, 1)),
      salience: fix(clamp(Number(raw?.salience ?? 0), 0, 1)),
      redLine: raw?.redLine === true,
      rationale: typeof raw?.rationale === "string" ? raw.rationale.trim() || undefined : undefined,
    };
  });

  return {
    producedBy,
    untouched,
    vector: {
      subjectId: args.subjectId,
      decisionId: args.decisionId,
      stances,
      source: "conversation",
      createdAt: new Date().toISOString(),
      confirmed: false,
    },
  };
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
