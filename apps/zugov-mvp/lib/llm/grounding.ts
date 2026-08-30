import { createHash } from "node:crypto";
import { EPISTEMIC_QUESTIONS } from "../core/types";
import type { EpistemicQuestionKey, GroundingReport, Id } from "../core/types";
import { MODEL_NAME, ModelUnavailableError, completeJson } from "./provider";

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

const CRUX_PROMPT = [
  "Bir topluluk karar verecek. Metni oku ve kararın özündeki gerçek ikilemi tek cümlede söyle.",
  "",
  "Kurallar:",
  "- Hangi seçeneğin kazanması gerektiğini SÖYLEME. Sadece ikilemin ne olduğunu söyle.",
  "- Metni tekrar etme, özetleme. İnsanların aslında ne arasında seçim yaptığını adlandır.",
  "- Tek cümle, en fazla 25 kelime. Türkçe yaz.",
  "",
  "Örnek (başka bir konu, kopyalama): ",
  '{"crux":"Herkesin biraz yararlandığı bir şeyle, az kişinin çok yararlandığı bir şey arasında seçim yapılıyor."}',
  "",
  'Sadece şunu döndür: {"crux":"..."}',
].join("\n");

function tradeoffPrompt(label: string): string {
  return [
    `Bir topluluk karar verecek. "${label}" seçeneği seçilirse topluluğun neyden vazgeçtiğini`,
    "tek cümlede söyle.",
    "",
    "Kurallar:",
    "- Bu seçeneği savunma ya da eleştirme. Sadece bedelini adlandır.",
    "- Metinde olmayan sayı uydurma.",
    "- Tek cümle, en fazla 20 kelime. Türkçe yaz.",
    "",
    'Sadece şunu döndür: {"tradeoff":"..."}',
  ].join("\n");
}

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
  options: { id: Id; label: string }[];
}

function contextOf(input: GroundingInput): string {
  return [
    `BAŞLIK: ${input.title}`,
    "",
    "METİN:",
    input.body.trim(),
    "",
    `SEÇENEKLER: ${input.options.map((option) => option.label).join(" | ")}`,
  ].join("\n");
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

  const crux =
    silent.length === 0
      ? "Gerekçe her seçenek hakkında bir şey söylüyor."
      : silent.length === input.options.length
        ? "Gerekçe seçeneklerin hiçbiri hakkında bir şey söylemiyor."
        : `Gerekçede hiç geçmeyen seçenek var: ${silent.join(", ")}.`;

  return assemble(input, { crux, tradeoffs, sections: null, producedBy: "metnin kendisi" });
}

/**
 * The proposal's own sentences that name this option.
 *
 * Matched on stems, because Turkish agglutination turns "mutfak" into "mutfağa"
 * in the very sentence being looked for.
 */
function sentencesAbout(label: string, body: string): string[] {
  const stems = label
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .map((word) => word.slice(0, Math.max(4, word.length - 2)));
  if (stems.length === 0) return [];

  return body
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .filter((sentence) => {
      const lower = sentence.toLocaleLowerCase("tr");
      return stems.some((stem) => lower.includes(stem));
    })
    .slice(0, 2);
}

/**
 * The six-question audit, run only when someone opens it.
 */
export async function auditProposal(input: GroundingInput, base: GroundingReport): Promise<GroundingReport> {
  const context = contextOf(input);
  const raw: RawGrounding = {};
  let failures = 0;

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
      if (!(error instanceof ModelUnavailableError)) throw error;
      failures += 1;
    }
  }

  const fallback = heuristicGrounding(input);
  const source = contextOf(input);
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
        observations:
          failures === EPISTEMIC_QUESTIONS.length
            ? cleanObservations(fallback[key], source, exampleLines)
            : cleanObservations(raw[key], source, exampleLines),
      },
    ]),
  ) as Record<EpistemicQuestionKey, { question: string; observations: string[] }>;

  return assemble(input, {
    crux: base.crux,
    tradeoffs: base.tradeoffs,
    sections,
    producedBy: failures === 0 ? base.producedBy : `${base.producedBy} (${failures} soru cevapsız)`,
  });
}

function assemble(
  input: GroundingInput,
  parts: {
    crux: string;
    tradeoffs: Record<Id, string>;
    sections: Record<EpistemicQuestionKey, { question: string; observations: string[] }> | null;
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
  const labels = input.options.map((option) => option.label);
  if (labels.length === 2) return `${labels[0]} ile ${labels[1]} arasında seçim yapılıyor.`;
  return `${labels.slice(0, -1).join(", ")} ve ${labels[labels.length - 1]} arasında seçim yapılıyor.`;
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

  return {
    summary: `Metin ${sentences.length} önermeden oluşuyor ve ${input.options.length} seçenek arasında karar istiyor.`,
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
