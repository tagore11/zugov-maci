/**
 * Every instruction sent to the local model, in one file.
 *
 * elicit.ts and grounding.ts hold the orchestration (which call to make, how many times,
 * what to do with a failure); this holds what gets said. A second language needs a second
 * file shaped like this one, not a hunt through both orchestration files for an embedded
 * Turkish sentence.
 *
 * Labels the model answers with (STANCE_LABELS, IMPORTANCE_LABELS in elicit.ts;
 * EpistemicQuestionKey in core/types.ts) are not here: they are machine-readable keys, read
 * by code rather than a person, and elicit.ts's own note on why they are chosen to be far
 * apart as strings applies in any language a prompt gets translated into.
 */

import type { EpistemicQuestionKey, Option } from "../../core/types";

export function elicitationSystemPrompt(option: Option): string {
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

export function elicitationUserContent(text: string): string {
  return `KİŞİNİN SÖYLEDİĞİ:\n${text.trim()}`;
}

export function auditContextBlock(input: { title: string; body: string; options: { label: string }[] }): string {
  return [
    `BAŞLIK: ${input.title}`,
    "",
    "METİN:",
    input.body.trim(),
    "",
    `SEÇENEKLER: ${input.options.map((option) => option.label).join(" | ")}`,
  ].join("\n");
}

export function auditQuestionSystemPrompt(instruction: string, example: readonly string[]): string {
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

export interface AuditQuestionPrompt {
  /** Fed into auditQuestionSystemPrompt's SORU line. */
  readonly instruction: string;
  /** An answer from an unrelated decision, so copying it would be obvious. */
  readonly example: readonly string[];
}

export const AUDIT_QUESTION_PROMPTS: Record<EpistemicQuestionKey, AuditQuestionPrompt> = {
  assumptions: {
    instruction:
      "Bu önerinin işe yaraması için doğru çıkması gereken, metinde açıkça kanıtlanmamış varsayımları yaz.",
    example: [
      "Yeni durakların bugünkü yolcu yoğunluğunu koruyacağı varsayılıyor.",
      "Sürüş süresinin uzamasının yolcular tarafından kabul edileceği varsayılıyor.",
    ],
  },
  baseRates: {
    instruction:
      "Kararı değerlendirmek için hangi geçmiş veriye ya da karşılaştırma noktasına ihtiyaç var? Metinde bu veri var mı, yok mu, açıkça söyle.",
    example: [
      "Geçmiş güzergâh değişikliklerinin yolcu sayısını nasıl etkilediğine dair veri metinde yok.",
      "Karşılaştırma için komşu hatların doluluk oranları gerekir.",
    ],
  },
  counterarguments: {
    instruction:
      "Bu öneriye karşı çıkan en güçlü argümanı yaz. Karşı tarafın argümanını en iyi haliyle kur, kendi görüşünü katma.",
    example: [
      "Kısalan yürüme mesafesinin uzayan sürüş süresini telafi ettiği gösterilmemiş.",
      "Değişiklikten en çok etkilenen grup kararı alan grupla aynı değil.",
    ],
  },
  reversibility: {
    instruction: "Bu karar kötü sonuç verirse geri dönmek ne kadar kolay olur? Geri dönüşün maliyeti metinde belirtilmiş mi?",
    example: [
      "Tabelalar ve tarifeler değiştikten sonra eski hatta dönüş maliyeti belirtilmemiş.",
      "Kararın deneme süresi tanımlanmadığı için geri dönüş için bir eşik yok.",
    ],
  },
  affectedParties: {
    instruction: "Bu karardan kimler etkileniyor? Doğrudan etkilenenleri ve kolayca gözden kaçan dolaylı tarafları ayrı ayrı yaz.",
    example: [
      "Eski duraklara yakın oturanlar ile yeni duraklara yakın oturanlar zıt yönde etkileniyor.",
      "Hattı kullanmayan ama caddedeki trafikten etkilenen esnaf dolaylı taraf.",
    ],
  },
  precedents: {
    instruction: "Karar verilmeden önce hangi emsal ya da benzer vaka incelenmeli? Metinde emsal gösterilmiş mi?",
    example: [
      "Aynı şehirde daha önce yapılmış bir güzergâh değişikliği metinde anılmıyor.",
      "Benzer nüfuslu bir ilçenin aynı kararı nasıl uyguladığı incelenmeli.",
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

export function tradeoffPrompt(label: string): string {
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
