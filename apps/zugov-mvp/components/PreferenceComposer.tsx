"use client";

import { useMemo, useState } from "react";
import type { Option, PreferenceVector, Stance } from "@/lib/core/types";

/**
 * The centre of the product.
 *
 * A participant writes what they think in their own words. The local model
 * turns it into a first draft of the numbers. Then the participant edits those
 * numbers directly, sees a plain-language read-back, and confirms. Nothing
 * enters the tally before that confirmation, and the draft is never hidden.
 */

const SUPPORT_STEPS = [
  { value: -1, label: "Kesinlikle olmasın" },
  { value: -0.5, label: "İstemem" },
  { value: 0, label: "Fark etmez" },
  { value: 0.5, label: "İsterim" },
  { value: 1, label: "Kesinlikle olsun" },
];

const SALIENCE_STEPS = [
  { value: 0.15, label: "Az" },
  { value: 0.5, label: "Orta" },
  { value: 1, label: "Çok" },
];

type Phase = "write" | "review" | "done";

export function PreferenceComposer({
  decisionId,
  options,
  existing,
}: {
  decisionId: string;
  options: Option[];
  existing: PreferenceVector[];
}) {
  const [phase, setPhase] = useState<Phase>("write");
  const [subjectId, setSubjectId] = useState("");
  const [text, setText] = useState("");
  const [stances, setStances] = useState<Stance[]>(() => blankStances(options));
  const [producedBy, setProducedBy] = useState<string>("");
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyVoted = useMemo(
    () => existing.some((p) => p.subjectId.toLowerCase() === subjectId.trim().toLowerCase()),
    [existing, subjectId],
  );

  async function draftFromText() {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(`/api/decisions/${decisionId}/elicit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: subjectId.trim() || "anonim", text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Taslak çıkarılamadı.");
      setStances(data.vector.stances as Stance[]);
      setProducedBy(data.producedBy as string);
      setNeedsReview((data.needsReview as string[]) ?? []);
      setPhase("review");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
    } finally {
      setBusy(false);
    }
  }

  function skipToManual() {
    setStances(blankStances(options));
    setNeedsReview([]);
    setProducedBy("elle");
    setPhase("review");
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const vector: PreferenceVector = {
        subjectId: subjectId.trim() || "anonim",
        decisionId,
        stances,
        source: producedBy === "elle" ? "form" : "conversation",
        createdAt: new Date().toISOString(),
        confirmed: true,
      };
      const response = await fetch(`/api/decisions/${decisionId}/preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vector),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setPhase("done");
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
      setBusy(false);
    }
  }

  function update(optionId: string, patch: Partial<Stance>) {
    setStances((current) => current.map((s) => (s.optionId === optionId ? { ...s, ...patch } : s)));
  }

  if (phase === "done") {
    return <p className="text-[15px] text-muted">Tercihin kaydedildi.</p>;
  }

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-muted-strong">İsmin ya da rumuzun</span>
        <input
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          placeholder="ör. deniz"
          className="w-full max-w-xs rounded-[6px] border border-line bg-raised px-3 py-2 text-[15px] text-foreground placeholder:text-placeholder focus:border-accent focus:outline-none"
        />
        {alreadyVoted ? (
          <span className="mt-2 block text-[13px]" style={{ color: "var(--accent)" }}>
            Bu isimle daha önce kayıt var. Göndermen öncekini değiştirir.
          </span>
        ) : null}
      </label>

      {phase === "write" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-muted-strong">
              Bu konuda ne düşünüyorsun?
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Kendi cümlelerinle yaz. Neyi istiyorsun, neyi istemiyorsun, hangisi senin için kritik."
              className="w-full rounded-[6px] border border-line bg-raised px-3 py-2 text-[15px] leading-relaxed text-foreground placeholder:text-placeholder focus:border-accent focus:outline-none"
            />
            <span className="mt-2 block text-[13px] text-muted">
              Yazdığın bu cihazdan çıkmaz. Sonraki adımda çıkan taslağı satır satır düzeltebilirsin.
            </span>
          </label>

          {error ? <p className="text-[13px]" style={{ color: "var(--error)" }}>{error}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={draftFromText}
              disabled={busy || text.trim().length < 10}
              className="rounded-[6px] px-4 py-2 text-[15px] font-medium text-white transition-colors duration-150 active:translate-y-[1px] disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {busy ? "Okunuyor" : "Yazdığımı tabloya çevir"}
            </button>
            <button
              type="button"
              onClick={skipToManual}
              className="rounded-[6px] border border-line px-4 py-2 text-[15px] text-muted-strong transition-colors duration-150 hover:border-line-strong active:translate-y-[1px]"
            >
              Doğrudan kendim işaretlerim
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-[8px] border border-line bg-raised px-4 py-3">
            <p className="text-[13px] text-muted">
              {producedBy === "elle"
                ? "Boş bir tablo. Her satırı kendin doldur."
                : producedBy.startsWith("heuristic")
                  ? `Taslak kelime eşleşmesiyle çıkarıldı, muhtemelen kaba. Sebep: ${producedBy.replace(/^heuristic\s*\(?|\)$/g, "") || "yerel model devrede değil"}.`
                  : `Taslağı ${producedBy} çıkardı. Değiştirmediğin hiçbir satır kesin değildir.`}
            </p>
          </div>

          <div className="divide-y divide-[color:var(--gray-700)]">
            {options.map((option) => {
              const stance = stances.find((s) => s.optionId === option.id)!;
              const flagged = needsReview.includes(option.id);
              return (
                <div key={option.id} className="py-5 first:pt-0">
                  <h3 className="font-display text-[15px] font-semibold">{option.label}</h3>
                  {option.detail ? <p className="mt-1 text-[13px] text-muted">{option.detail}</p> : null}
                  {stance.rationale ? (
                    <p className="mt-2 border-l-2 border-[color:var(--accent)] pl-3 text-[13px] italic text-muted-strong">
                      {stance.rationale}
                    </p>
                  ) : null}
                  {flagged ? (
                    <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--accent)" }}>
                      Bu seçenek hakkında bir şey yazmışsın ama taslak nötr kaldı. Buraya bakman iyi olur.
                    </p>
                  ) : null}

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Segmented
                      legend="Ne düşünüyorsun"
                      steps={SUPPORT_STEPS}
                      value={nearest(SUPPORT_STEPS, stance.support)}
                      onChange={(v) => update(option.id, { support: v })}
                    />
                    <Segmented
                      legend="Senin için ne kadar önemli"
                      steps={SALIENCE_STEPS}
                      value={nearest(SALIENCE_STEPS, stance.salience)}
                      onChange={(v) => update(option.id, { salience: v })}
                    />
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-[13px] text-muted-strong">
                    <input
                      type="checkbox"
                      checked={stance.redLine}
                      onChange={(e) => update(option.id, { redLine: e.target.checked })}
                      className="size-4 accent-[color:var(--accent)]"
                    />
                    Bu benim kırmızı çizgim. Çıkarsa kabul edemem.
                  </label>
                </div>
              );
            })}
          </div>

          {error ? <p className="text-[13px]" style={{ color: "var(--error)" }}>{error}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="rounded-[6px] px-4 py-2 text-[15px] font-medium text-white transition-colors duration-150 active:translate-y-[1px] disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {busy ? "Kaydediliyor" : "Bu benim tercihim, kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setPhase("write")}
              className="rounded-[6px] border border-line px-4 py-2 text-[15px] text-muted-strong transition-colors duration-150 hover:border-line-strong active:translate-y-[1px]"
            >
              Geri dön
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Segmented({
  legend,
  steps,
  value,
  onChange,
}: {
  legend: string;
  steps: Array<{ value: number; label: string }>;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium text-muted-strong">{legend}</legend>
      <div className="flex flex-wrap gap-1">
        {steps.map((step) => {
          const active = step.value === value;
          return (
            <button
              key={step.value}
              type="button"
              onClick={() => onChange(step.value)}
              aria-pressed={active}
              className="rounded-[6px] border px-3 py-1.5 text-[13px] transition-colors duration-150 active:translate-y-[1px]"
              style={{
                borderColor: active ? "var(--accent)" : "var(--gray-700)",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--gray-300)",
              }}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function blankStances(options: Option[]): Stance[] {
  return options.map((o) => ({
    optionId: o.id,
    support: 0,
    confidence: 0.5,
    salience: 0.5,
    redLine: false,
  }));
}

function nearest(steps: Array<{ value: number }>, value: number): number {
  return steps.reduce((best, step) =>
    Math.abs(step.value - value) < Math.abs(best.value - value) ? step : best,
  ).value;
}
