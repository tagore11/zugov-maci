"use client";

import { useMemo, useState } from "react";
import type { GroundingReport, MechanismId, Option, PreferenceVector, Stance } from "@/lib/core/types";
import { getMechanism } from "@/lib/core/mechanisms";
import { Button, Hint, Panel, Steps, Title } from "./ui";
import { GroundingPanel } from "./GroundingPanel";

/**
 * The whole participation flow, one question per screen.
 *
 * The earlier version put the proposal, the report, the form and the running
 * result on one page. Two things were wrong with that. A person opening it had
 * no idea where to start, and they saw the standing result before forming their
 * own view, which is the cheapest way to manufacture a consensus that was never
 * there. Here the result is not on this page at all until the person has voted.
 */

const SUPPORT_STEPS = [
  { value: 1, label: "Kesinlikle olsun" },
  { value: 0.5, label: "Olursa iyi" },
  { value: 0, label: "Fark etmez" },
  { value: -0.5, label: "Olmasa iyi" },
  { value: -1, label: "Kesinlikle olmasın" },
];

const SALIENCE_STEPS = [
  { value: 1, label: "Çok" },
  { value: 0.5, label: "Orta" },
  { value: 0.2, label: "Az" },
];

const STEP_LABELS = ["Öneri", "Sen", "Seçenekler", "Onay"];

export function DecisionFlow({
  decisionId,
  title,
  body,
  options,
  mechanismId,
  grounding,
  knownNames,
}: {
  decisionId: string;
  title: string;
  body: string;
  options: Option[];
  mechanismId: MechanismId;
  grounding: GroundingReport | null;
  knownNames: string[];
}) {
  const [step, setStep] = useState(0);
  const [optionIndex, setOptionIndex] = useState(0);
  const [subjectId, setSubjectId] = useState("");
  const [text, setText] = useState("");
  const [stances, setStances] = useState<Stance[]>(() => blankStances(options));
  const [producedBy, setProducedBy] = useState("elle");
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mechanism = useMemo(() => getMechanism(mechanismId), [mechanismId]);

  const readBack = useMemo(() => {
    const vector: PreferenceVector = {
      subjectId: subjectId || "sen",
      decisionId,
      stances,
      source: "form",
      createdAt: new Date().toISOString(),
      confirmed: false,
    };
    return mechanism.explain(mechanism.project(vector, options), options);
  }, [mechanism, stances, options, subjectId, decisionId]);

  const nameTaken = knownNames.some((name) => name.toLowerCase() === subjectId.trim().toLowerCase());

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
      setOptionIndex(0);
      setStep(2);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
    } finally {
      setBusy(false);
    }
  }

  function goManual() {
    setStances(blankStances(options));
    setProducedBy("elle");
    setNeedsReview([]);
    setOptionIndex(0);
    setStep(2);
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
      window.location.href = `/karar/${decisionId}/sonuc`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
      setBusy(false);
    }
  }

  function update(optionId: string, patch: Partial<Stance>) {
    setStances((current) => current.map((s) => (s.optionId === optionId ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-6">
      <Steps labels={STEP_LABELS} current={step} />

      {step === 0 ? (
        <Panel>
          <Title as="h1">{title}</Title>
          {body ? <p className="prose-read mt-5 max-w-[62ch]">{body}</p> : null}

          <div className="mt-8 border-t border-line pt-6">
            <h2 className="mb-3 text-[17px] font-semibold">Karar verilmeden önce</h2>
            <GroundingPanel decisionId={decisionId} initial={grounding} />
          </div>

          <div className="mt-8">
            <Button onClick={() => setStep(1)}>Okudum, devam</Button>
          </div>
        </Panel>
      ) : null}

      {step === 1 ? (
        <Panel>
          <Title>Sen ne düşünüyorsun?</Title>

          <label className="mt-6 block">
            <span className="mb-2 block text-[14px] font-medium">İsmin ya da rumuzun</span>
            <input
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="deniz"
              autoComplete="off"
              className="w-full max-w-xs rounded-[2px] border border-line bg-sunk px-4 py-3 text-[16px] placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
            {nameTaken ? (
              <span className="mt-2 block text-[14px] text-ink-soft">
                Bu isimle bir kayıt var. Devam edersen onun yerine geçer.
              </span>
            ) : null}
          </label>

          <label className="mt-6 block">
            <span className="mb-2 block text-[14px] font-medium">Kendi cümlelerinle yaz</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Neyi istiyorsun, neyi istemiyorsun, senin için kritik olan ne."
              className="w-full rounded-[2px] border border-line bg-sunk px-4 py-3 text-[16px] leading-relaxed placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
          </label>
          <Hint>
            Yazdığın bu cihazdan çıkmaz. Sonraki adımda seçenek seçenek karşına gelir, her birini
            değiştirebilirsin.
          </Hint>

          {error ? <p className="mt-4 text-[14px] text-alarm">{error}</p> : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={draftFromText} disabled={busy || text.trim().length < 10}>
              {busy ? "Okunuyor" : "Devam"}
            </Button>
            <Button kind="quiet" onClick={goManual} disabled={busy}>
              Yazmadan işaretlerim
            </Button>
            <Button kind="plain" onClick={() => setStep(0)} disabled={busy}>
              Geri
            </Button>
          </div>
        </Panel>
      ) : null}

      {step === 2 ? (
        <OptionStep
          option={options[optionIndex]}
          stance={stances.find((s) => s.optionId === options[optionIndex].id)!}
          index={optionIndex}
          total={options.length}
          producedBy={producedBy}
          flagged={needsReview.includes(options[optionIndex].id)}
          onChange={(patch) => update(options[optionIndex].id, patch)}
          onBack={() => (optionIndex === 0 ? setStep(1) : setOptionIndex(optionIndex - 1))}
          onNext={() =>
            optionIndex === options.length - 1 ? setStep(3) : setOptionIndex(optionIndex + 1)
          }
        />
      ) : null}

      {step === 3 ? (
        <Panel>
          <Title>{mechanism.name} kuralında oyun şunu söylüyor</Title>

          <ul className="mt-6 space-y-3">
            {readBack.map((line, index) => (
              <li key={index} className="prose-read max-w-[60ch]">
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-[2px] bg-sunk px-5 py-4">
            <Hint>
              Bu, senin yazdıklarının bu topluluğun seçtiği sayım kuralına çevrilmiş hali. Kural
              sonradan değişirse tercihin korunur, yeniden oy vermen gerekmez.
            </Hint>
          </div>

          {error ? <p className="mt-4 text-[14px] text-alarm">{error}</p> : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={submit} disabled={busy}>
              {busy ? "Kaydediliyor" : "Onaylıyorum"}
            </Button>
            <Button kind="quiet" onClick={() => { setOptionIndex(options.length - 1); setStep(2); }}>
              Seçeneklere dön
            </Button>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function OptionStep({
  option,
  stance,
  index,
  total,
  producedBy,
  flagged,
  onChange,
  onBack,
  onNext,
}: {
  option: Option;
  stance: Stance;
  index: number;
  total: number;
  producedBy: string;
  flagged: boolean;
  onChange: (patch: Partial<Stance>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Panel>
      <p className="mb-2 font-mono text-[12px] tabular-nums text-ink-faint">
        Seçenek {index + 1} / {total}
      </p>
      <Title>{option.label}</Title>
      {option.detail ? <Hint>{option.detail}</Hint> : null}

      {stance.rationale ? (
        <figure className="mt-5 border-l-2 border-line-strong pl-4">
          <blockquote className="prose-read text-ink-soft">{stance.rationale}</blockquote>
          <figcaption className="mt-1 text-[13px] text-ink-faint">senin yazdığın cümle</figcaption>
        </figure>
      ) : null}

      {flagged ? (
        <p className="mt-5 rounded-[2px] border-l-2 border-alarm bg-sunk px-4 py-3 text-[14px] leading-relaxed">
          Bunun hakkında bir şey yazmışsın ama taslak nötr kaldı. Buraya bakman iyi olur.
        </p>
      ) : null}

      <div className="mt-8 space-y-7">
        <Choice
          legend="Bu seçenek hakkında ne diyorsun?"
          steps={SUPPORT_STEPS}
          value={nearest(SUPPORT_STEPS, stance.support)}
          onChange={(value) => onChange({ support: value })}
        />
        <Choice
          legend="Bu konu senin için ne kadar önemli?"
          steps={SALIENCE_STEPS}
          value={nearest(SALIENCE_STEPS, stance.salience)}
          onChange={(value) => onChange({ salience: value })}
        />

        <label className="flex items-start gap-3 rounded-[2px] border border-line bg-sunk px-4 py-3">
          <input
            type="checkbox"
            checked={stance.redLine}
            onChange={(e) => onChange({ redLine: e.target.checked })}
            className="mt-0.5 size-5 accent-[color:var(--alarm)]"
          />
          <span className="text-[15px] leading-relaxed">
            Bu benim kırmızı çizgim. Bu çıkarsa kabul edemem.
            <span className="mt-1 block text-[13px] text-ink-soft">
              Tek başına sonucu iptal etmez, ama sayımdan sonra da görünür kalır.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button onClick={onNext}>{index === total - 1 ? "Bitir" : "Sonraki"}</Button>
        <Button kind="plain" onClick={onBack}>
          Geri
        </Button>
        <span className="ml-auto font-mono text-[11px] text-ink-faint">
          {producedBy === "elle" ? "boş tablo" : producedBy.startsWith("heuristic") ? "kaba taslak" : "taslak"}
        </span>
      </div>
    </Panel>
  );
}

/**
 * One control, one shape, no hue. See selectionStyle below.
 */
function Choice({
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
      <legend className="mb-3 text-[15px] font-medium">{legend}</legend>
      <div className="grid gap-2">
        {steps.map((step) => {
          const active = step.value === value;
          return (
            <button
              key={step.value}
              type="button"
              onClick={() => onChange(step.value)}
              aria-pressed={active}
              className="tap min-h-[44px] rounded-[2px] border px-4 py-3 text-left text-[16px]"
              style={selectionStyle(active)}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Selection is shown with ink, not with hue.
 *
 * An earlier pass gave support a green and opposition a red, then had to give
 * "quite important" a colour too and painted it green, which told the reader
 * the opposite of what they had chosen. The direction of a choice is already
 * written in its label, so colour was carrying nothing that the words were not
 * already carrying better.
 */
function selectionStyle(active: boolean) {
  return {
    borderColor: active ? "var(--ink)" : "var(--line)",
    background: active ? "var(--ink)" : "var(--card)",
    color: active ? "var(--on-ink)" : "var(--ink)",
    fontWeight: active ? 600 : 400,
  };
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
