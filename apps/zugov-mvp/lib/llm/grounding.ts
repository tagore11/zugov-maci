import { createHash } from "node:crypto";
import { EPISTEMIC_QUESTIONS } from "../core/types";
import type { EpistemicQuestionKey, GroundingReport, Id } from "../core/types";
import { MODEL_NAME, ModelUnavailableError, completeJson } from "./provider";

/**
 * The Grounding Engine.
 *
 * It has exactly one job: put the reasoning behind a proposal on the table
 * before anyone votes. It holds no vote, no weight, no veto, and no ability to
 * rank the options. It asks six questions and reports what it found. If it is
 * wrong, a participant overrules it by simply voting; nothing in the tally path
 * reads this file.
 */

const QUESTION_TEXT: Record<EpistemicQuestionKey, string> = {
  assumptions: "Bu önerinin işe yaraması için hangi varsayımların doğru çıkması gerekiyor?",
  baseRates: "Benzer kararlar geçmişte hangi sıklıkla tuttu? Karşılaştırma noktası ne?",
  counterarguments: "Buna karşı çıkan en güçlü argüman ne?",
  reversibility: "Kötü giderse geri dönmek ne kadar kolay, maliyeti ne?",
  affectedParties: "Karardan doğrudan ve dolaylı olarak kimler etkileniyor?",
  precedents: "Hangi emsal ya da benzer vaka incelenmeli?",
};

const SYSTEM_PROMPT = [
  "Sen bir epistemik denetçisin. Oy hakkın yok, tavsiye vermiyorsun, hangi seçeneğin",
  "kazanması gerektiğini SÖYLEMİYORSUN. Görevin bir öneriyi altı başlık altında",
  "sorgulamak ve okuyanın kendi kararını daha iyi vermesini sağlamak.",
  "",
  "Kurallar:",
  "- Taraf tutma. 'Öneriyorum', 'en iyisi', 'kabul edilmeli' gibi ifadeler yasak.",
  "- Uydurma istatistik verme. Emin değilsen 'bu veri önerinin içinde yok' de.",
  "- Her gözlem tek cümle, somut, en fazla 25 kelime.",
  "- Türkçe yaz.",
  "",
  "Sadece şu JSON'u döndür:",
  '{"summary":"tek cümle, tarafsız özet","keywords":["..."],',
  '"assumptions":["..."],"baseRates":["..."],"counterarguments":["..."],',
  '"reversibility":["..."],"affectedParties":["..."],"precedents":["..."]}',
].join("\n");

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

export interface GroundingInput {
  decisionId: Id;
  title: string;
  body: string;
  optionLabels: string[];
}

export async function groundProposal(input: GroundingInput): Promise<GroundingReport> {
  const userPrompt = [
    `BAŞLIK: ${input.title}`,
    "",
    "METİN:",
    input.body.trim(),
    "",
    `MASADAKİ SEÇENEKLER: ${input.optionLabels.join(" | ")}`,
  ].join("\n");

  try {
    const raw = await completeJson<RawGrounding>(SYSTEM_PROMPT, userPrompt);
    return assemble(input, raw, `local:${MODEL_NAME}`);
  } catch (error) {
    if (error instanceof ModelUnavailableError) {
      return assemble(input, heuristicGrounding(input), `heuristic (${error.message})`);
    }
    throw error;
  }
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

  return {
    summary: `Metin ${sentences.length} önermeden oluşuyor ve ${input.optionLabels.length} seçenek arasında karar istiyor.`,
    keywords,
    assumptions: [`Şu önermenin doğru olması gerekiyor: "${truncate(claim)}"`],
    baseRates: ["Öneride sayısal bir dayanak yok; karşılaştırma noktası dışarıdan getirilmeli."],
    counterarguments: sentences.length > 1 ? [`Karşı okuma için sınanacak cümle: "${truncate(sentences[1])}"`] : ["Metin karşı argümana yer vermiyor."],
    reversibility: ["Geri dönüş maliyeti metinde belirtilmemiş."],
    affectedParties: keywords.slice(0, 3).map((k) => `"${k}" başlığıyla anılan taraf`),
    precedents: ["Emsal metinde gösterilmemiş."],
  };
}

function assemble(input: GroundingInput, raw: RawGrounding, producedBy: string): GroundingReport {
  const sections = Object.fromEntries(
    EPISTEMIC_QUESTIONS.map((key) => [
      key,
      {
        question: QUESTION_TEXT[key],
        observations: cleanList(raw[key]),
      },
    ]),
  ) as Record<EpistemicQuestionKey, { question: string; observations: string[] }>;

  const body = {
    summary: (raw.summary ?? "").trim() || "Özet üretilemedi.",
    keywords: cleanList(raw.keywords).slice(0, 8),
    sections,
  };

  return {
    decisionId: input.decisionId,
    generatedAt: new Date().toISOString(),
    producedBy,
    summary: body.summary,
    keywords: body.keywords,
    sections: body.sections,
    digest: createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 16),
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

function truncate(text: string, limit = 140): string {
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

const STOPWORDS = new Set(
  "ve veya ile için ama fakat çünkü bir bu şu o da de ki mi mı mu mü daha çok az en her hiç gibi olarak olan olarak sonra önce üzerine kadar the and for with that this from".split(
    " ",
  ),
);

function extractKeywords(text: string): string[] {
  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? []) {
    if (STOPWORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([word]) => word);
}
