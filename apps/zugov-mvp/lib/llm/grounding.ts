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
 *
 * One question per model call, deliberately. A 3B model asked six questions in
 * a single prompt either copies the example back or collapses into fragments.
 * Asked one focused question at a time it answers well, each call fails
 * independently, and a lost question costs one section instead of the report.
 */

interface QuestionSpec {
  prompt: string;
  /** Shown to the reader. */
  question: string;
  /** An answer from an unrelated decision, so copying it would be obvious. */
  example: string[];
}

const QUESTIONS: Record<EpistemicQuestionKey, QuestionSpec> = {
  assumptions: {
    question: "Bu önerinin işe yaraması için hangi varsayımların doğru çıkması gerekiyor?",
    prompt:
      "Bu önerinin işe yaraması için doğru çıkması gereken, metinde açıkça kanıtlanmamış varsayımları yaz.",
    example: [
      "Yeni durakların bugünkü yolcu yoğunluğunu koruyacağı varsayılıyor.",
      "Sürüş süresinin uzamasının yolcular tarafından kabul edileceği varsayılıyor.",
    ],
  },
  baseRates: {
    question: "Benzer kararlar geçmişte hangi sıklıkla tuttu? Karşılaştırma noktası ne?",
    prompt:
      "Kararı değerlendirmek için hangi geçmiş veriye ya da karşılaştırma noktasına ihtiyaç var? Metinde bu veri var mı, yok mu, açıkça söyle.",
    example: [
      "Geçmiş güzergâh değişikliklerinin yolcu sayısını nasıl etkilediğine dair veri metinde yok.",
      "Karşılaştırma için komşu hatların doluluk oranları gerekir.",
    ],
  },
  counterarguments: {
    question: "Buna karşı çıkan en güçlü argüman ne?",
    prompt:
      "Bu öneriye karşı çıkan en güçlü argümanı yaz. Karşı tarafın argümanını en iyi haliyle kur, kendi görüşünü katma.",
    example: [
      "Kısalan yürüme mesafesinin uzayan sürüş süresini telafi ettiği gösterilmemiş.",
      "Değişiklikten en çok etkilenen grup kararı alan grupla aynı değil.",
    ],
  },
  reversibility: {
    question: "Kötü giderse geri dönmek ne kadar kolay, maliyeti ne?",
    prompt:
      "Bu karar kötü sonuç verirse geri dönmek ne kadar kolay olur? Geri dönüşün maliyeti metinde belirtilmiş mi?",
    example: [
      "Tabelalar ve tarifeler değiştikten sonra eski hatta dönüş maliyeti belirtilmemiş.",
      "Kararın deneme süresi tanımlanmadığı için geri dönüş için bir eşik yok.",
    ],
  },
  affectedParties: {
    question: "Karardan doğrudan ve dolaylı olarak kimler etkileniyor?",
    prompt:
      "Bu karardan kimler etkileniyor? Doğrudan etkilenenleri ve kolayca gözden kaçan dolaylı tarafları ayrı ayrı yaz.",
    example: [
      "Eski duraklara yakın oturanlar ile yeni duraklara yakın oturanlar zıt yönde etkileniyor.",
      "Hattı kullanmayan ama caddedeki trafikten etkilenen esnaf dolaylı taraf.",
    ],
  },
  precedents: {
    question: "Hangi emsal ya da benzer vaka incelenmeli?",
    prompt:
      "Karar verilmeden önce hangi emsal ya da benzer vaka incelenmeli? Metinde emsal gösterilmiş mi?",
    example: [
      "Aynı şehirde daha önce yapılmış bir güzergâh değişikliği metinde anılmıyor.",
      "Benzer nüfuslu bir ilçenin aynı kararı nasıl uyguladığı incelenmeli.",
    ],
  },
};

const SUMMARY_PROMPT =
  "Metnin neyi karara bağlamak istediğini ve hangi bilginin eksik bırakıldığını tek cümlede söyle. " +
  "Metni tekrar etme, kendi cümleni kur, en fazla 30 kelime.";

function systemPromptFor(instruction: string, example: string[]): string {
  return [
    "Sen bir epistemik denetçisin. Oy hakkın yok, tavsiye vermiyorsun ve hangi seçeneğin",
    "kazanması gerektiğini söylemiyorsun. Sana verilen metin hakkında TEK bir soruyu cevaplarsın.",
    "",
    `SORU: ${instruction}`,
    "",
    "Kurallar:",
    "- Taraf tutma. 'Öneriyorum', 'en iyisi', 'kabul edilmeli' yasak.",
    "- Uydurma sayı verme. Bir bilgi metinde yoksa yok olduğunu söyle.",
    "- Her gözlem tam bir cümle olsun, 6 ile 25 kelime arası, yüklemi olsun.",
    "- Tek kelime ya da kelime öbeği yazma.",
    "- İki ya da üç gözlem yaz. Türkçe yaz.",
    "",
    "Aşağıdaki örnek BAŞKA bir konuya ait. Cümleleri kopyalama, sadece uzunluğu örnek al:",
    JSON.stringify({ observations: example }),
    "",
    'Sadece şunu döndür: {"observations":["...","..."]}',
  ].join("\n");
}

export interface GroundingInput {
  decisionId: Id;
  title: string;
  body: string;
  optionLabels: string[];
}

export async function groundProposal(input: GroundingInput): Promise<GroundingReport> {
  const context = [
    `BAŞLIK: ${input.title}`,
    "",
    "METİN:",
    input.body.trim(),
    "",
    `MASADAKİ SEÇENEKLER: ${input.optionLabels.join(" | ")}`,
  ].join("\n");

  const raw: RawGrounding = {};
  const failures: string[] = [];

  // Sequential on purpose: an 8 GB laptop running one small model does not gain
  // from parallel requests, and Ollama queues them anyway.
  try {
    const summary = await completeJson<{ summary?: string }>(
      systemPromptFor(SUMMARY_PROMPT, ["Metin hattın güzergâhını değiştirmeyi istiyor ve yolcu sayısına dayanan bir gerekçe sunmuyor."]).replace(
        '{"observations":["...","..."]}',
        '{"summary":"..."}',
      ),
      context,
      { maxTokens: 300 },
    );
    raw.summary = summary.summary;
  } catch (error) {
    failures.push("özet");
    if (!(error instanceof ModelUnavailableError)) throw error;
  }

  for (const key of EPISTEMIC_QUESTIONS) {
    const spec = QUESTIONS[key];
    try {
      const answer = await completeJson<{ observations?: string[] }>(
        systemPromptFor(spec.prompt, spec.example),
        context,
        { maxTokens: 500 },
      );
      raw[key] = answer.observations;
    } catch (error) {
      failures.push(spec.question);
      if (!(error instanceof ModelUnavailableError)) throw error;
    }
  }

  // Every question failed: the model is not reachable or not answering at all.
  if (failures.length > EPISTEMIC_QUESTIONS.length) {
    return assemble(input, heuristicGrounding(input), "heuristic (yerel model yanıt vermedi)");
  }

  const producedBy =
    failures.length === 0 ? `local:${MODEL_NAME}` : `local:${MODEL_NAME} (${failures.length} soru cevapsız)`;

  const fallback = heuristicGrounding(input);
  if (!raw.summary?.trim()) raw.summary = fallback.summary;

  return assemble(input, raw, producedBy);
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

  return {
    summary: `Metin ${sentences.length} önermeden oluşuyor ve ${input.optionLabels.length} seçenek arasında karar istiyor.`,
    keywords,
    assumptions: [`Şu önermenin doğru olması gerekiyor: "${truncate(claim)}"`],
    baseRates: ["Öneride sayısal bir dayanak yok. Karşılaştırma noktası dışarıdan getirilmeli."],
    counterarguments:
      sentences.length > 1
        ? [`Karşı okuma için sınanacak cümle: "${truncate(sentences[1])}"`]
        : ["Metin karşı argümana yer vermiyor."],
    reversibility: ["Geri dönüş maliyeti metinde belirtilmemiş."],
    affectedParties: keywords.slice(0, 3).map((k) => `Metinde "${k}" başlığıyla anılan taraf etkileniyor.`),
    precedents: ["Emsal metinde gösterilmemiş."],
  };
}

function assemble(input: GroundingInput, raw: RawGrounding, producedBy: string): GroundingReport {
  const source = `${input.title} ${input.body} ${input.optionLabels.join(" ")}`;
  const exampleLines = new Set(
    Object.values(QUESTIONS)
      .flatMap((spec) => spec.example)
      .map(normalise),
  );

  const sections = Object.fromEntries(
    EPISTEMIC_QUESTIONS.map((key) => [
      key,
      {
        question: QUESTIONS[key].question,
        observations: cleanObservations(raw[key], source, exampleLines),
      },
    ]),
  ) as Record<EpistemicQuestionKey, { question: string; observations: string[] }>;

  const body = {
    summary: (raw.summary ?? "").trim() || "Özet üretilemedi.",
    keywords: (raw.keywords?.length ? cleanList(raw.keywords) : extractKeywords(`${input.title} ${input.body}`)).slice(0, 8),
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
  return text.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function truncate(text: string, limit = 140): string {
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

const STOPWORDS = new Set(
  "ve veya ile için ama fakat çünkü bir bu şu da de ki gibi olarak olan sonra önce üzerine kadar daha çok en her hiç the and for with that this from".split(
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
