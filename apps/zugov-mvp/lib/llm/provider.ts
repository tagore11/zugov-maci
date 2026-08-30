/**
 * Local model access.
 *
 * Hard rule for this project: the model runs on hardware the participant
 * controls. A community whose epistemic auditor lives behind someone else's
 * API key is a customer of that API, not a self-governing community. So the
 * only transport here is an OpenAI-compatible endpoint on localhost. Ollama
 * by default, llama.cpp / vLLM / LM Studio work unchanged.
 *
 * Determinism is enforced (temperature 0, fixed seed) so that two members can
 * run the same proposal on their own laptops and compare digests.
 */

export const MODEL_ENDPOINT = process.env.ZUGOV_MODEL_URL ?? "http://127.0.0.1:11434/v1";
export const MODEL_NAME = process.env.ZUGOV_MODEL ?? "zugov-grounding";
export const MODEL_SEED = Number(process.env.ZUGOV_MODEL_SEED ?? 7);

export class ModelUnavailableError extends Error {
  constructor(cause: string) {
    super(cause);
    this.name = "ModelUnavailableError";
  }
}

export interface ModelStatus {
  available: boolean;
  endpoint: string;
  model: string;
  detail: string;
}

export async function checkModel(): Promise<ModelStatus> {
  try {
    const response = await fetch(`${MODEL_ENDPOINT}/models`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) {
      return { available: false, endpoint: MODEL_ENDPOINT, model: MODEL_NAME, detail: `HTTP ${response.status}` };
    }
    const body = (await response.json()) as { data?: Array<{ id: string }> };
    const ids = (body.data ?? []).map((m) => m.id);
    const present = ids.some((id) => id === MODEL_NAME || id.startsWith(`${MODEL_NAME}:`));
    return {
      available: present,
      endpoint: MODEL_ENDPOINT,
      model: MODEL_NAME,
      detail: present ? "hazır" : `sunucu açık, ${MODEL_NAME} kurulu değil`,
    };
  } catch (error) {
    return {
      available: false,
      endpoint: MODEL_ENDPOINT,
      model: MODEL_NAME,
      detail: error instanceof Error ? error.message : "bağlanılamadı",
    };
  }
}

export async function completeJson<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; timeoutMs?: number },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${MODEL_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(options?.timeoutMs ?? 120_000),
      body: JSON.stringify({
        model: MODEL_NAME,
        temperature: 0,
        top_p: 1,
        seed: MODEL_SEED,
        max_tokens: options?.maxTokens ?? 1600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch (error) {
    throw new ModelUnavailableError(error instanceof Error ? error.message : "yerel modele ulaşılamadı");
  }

  if (!response.ok) {
    throw new ModelUnavailableError(`yerel model ${response.status} döndü`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  };
  const choice = payload.choices?.[0];
  const text = choice?.message?.content ?? "";

  if (!text.trim()) {
    // A reasoning model spends the whole budget thinking and returns nothing.
    // Say so plainly rather than reporting the model as offline.
    throw new ModelUnavailableError(
      choice?.finish_reason === "length"
        ? "yerel model token bütçesini tüketti ve içerik döndürmedi (düşünme modlu bir model olabilir)"
        : "yerel model boş yanıt verdi",
    );
  }

  return parseJsonLoosely<T>(text);
}

/** Small models wrap JSON in prose or fences often enough to be worth handling. */
export function parseJsonLoosely<T>(text: string): T {
  const withoutThinking = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const fenced = withoutThinking.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : withoutThinking).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const slice = start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;
  try {
    return JSON.parse(slice) as T;
  } catch {
    throw new ModelUnavailableError("yerel model geçerli JSON üretmedi");
  }
}
