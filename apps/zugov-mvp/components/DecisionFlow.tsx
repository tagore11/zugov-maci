"use client";

import { useEffect, useMemo, useState } from "react";
import type { GroundingReport, MechanismId, Option, PreferenceVector, Stance } from "@/lib/core/types";
import { getMechanism } from "@/lib/core/mechanisms";
import { communities } from "@/lib/ag/client";
import { shortAddress, useSession } from "@/lib/session";
import { Button, Hint, Panel, Steps, Title } from "./ui";
import { GroundingPanel } from "./GroundingPanel";
import { WalletBar } from "./WalletBar";

/**
 * Taking part, with as little in the way as the decision allows.
 *
 * An earlier version asked twenty-seven questions of someone choosing between
 * three options: five levels of support and three of importance for each, plus
 * a red line. Most of those answers were invented on the spot to fill in a
 * control. This asks one question per option and one question at the end, so
 * three options cost four answers.
 *
 * Two things appear only when they are relevant. The red line appears once
 * someone has said they do not want an option, because it means nothing before
 * that. Writing in your own words is offered where it helps and skipped by
 * anyone who would rather just answer.
 */

const SUPPORT_STEPS = [
  { value: 1, label: "Olsun" },
  { value: 0, label: "Fark etmez" },
  { value: -1, label: "Olmasın" },
];

const STEP_LABELS = ["Öneri", "Seçenekler", "Önem", "Onay"];

/** The one option someone marks as mattering most carries full weight. */
const CHOSEN_SALIENCE = 1;
const OTHER_SALIENCE = 0.35;

export function DecisionFlow({
  decisionId,
  communityId,
  title,
  body,
  options,
  mechanismId,
  grounding,
  knownNames,
}: {
  decisionId: string;
  communityId: string;
  title: string;
  body: string;
  options: Option[];
  mechanismId: MechanismId;
  grounding: GroundingReport | null;
  knownNames: string[];
}) {
  const { address, isSignedIn } = useSession();
  const canVote = useVotingPermission(communityId, address);

  const [step, setStep] = useState(0);
  const [optionIndex, setOptionIndex] = useState(0);
  const [stances, setStances] = useState<Stance[]>(() => blankStances(options));
  const [mostImportant, setMostImportant] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mechanism = useMemo(() => getMechanism(mechanismId), [mechanismId]);
  const subjectId = address ?? "";
  const alreadyVoted = knownNames.some((name) => name.toLowerCase() === subjectId.toLowerCase());

  const weighted = useMemo<Stance[]>(
    () =>
      stances.map((stance) => ({
        ...stance,
        salience: mostImportant === stance.optionId ? CHOSEN_SALIENCE : OTHER_SALIENCE,
      })),
    [stances, mostImportant],
  );

  const readBack = useMemo(() => {
    const vector: PreferenceVector = {
      subjectId: subjectId || "sen",
      decisionId,
      stances: weighted,
      source: "form",
      createdAt: new Date().toISOString(),
      confirmed: false,
    };
    return mechanism.explain(mechanism.project(vector, options), options);
  }, [mechanism, weighted, options, subjectId, decisionId]);

  function update(optionId: string, patch: Partial<Stance>) {
    setStances((current) => current.map((s) => (s.optionId === optionId ? { ...s, ...patch } : s)));
  }

  async function draftFromText() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/decisions/${decisionId}/elicit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Okunamadı.");
      setStances(data.vector.stances as Stance[]);
      setWriting(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const vector: PreferenceVector = {
        subjectId,
        decisionId,
        stances: weighted,
        source: writing ? "conversation" : "form",
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

  if (step > 0 && !isSignedIn) {
    return (
      <Panel>
        <Title>Katılmak için giriş yap</Title>
        <div className="mt-5">
          <WalletBar />
        </div>
      </Panel>
    );
  }

  if (step > 0 && canVote === false) {
    return (
      <Panel>
        <Title>Bu toplulukta oy veremezsin</Title>
        <div className="mt-3">
          <Hint>Üyelik kademen oy vermeye açık değil.</Hint>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <Steps labels={STEP_LABELS} current={step} />

      {step === 0 ? (
        <Panel>
          <Title as="h1">{title}</Title>
          {body ? <p className="prose-read mt-5 max-w-[62ch]">{body}</p> : null}

          <div className="mt-7 border-t border-line pt-6">
            <GroundingPanel decisionId={decisionId} options={options} initial={grounding} />
          </div>

          <div className="mt-8">
            <Button onClick={() => setStep(1)}>Başla</Button>
          </div>
        </Panel>
      ) : null}

      {step === 1 ? (
        <Panel>
          {optionIndex === 0 && !writing ? (
            <button
              type="button"
              onClick={() => setWriting(true)}
              className="tap mb-6 text-[14px] text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Tek tek işaretlemek yerine kendi cümlelerinle yaz
            </button>
          ) : null}

          {writing ? (
            <>
              <Title>Ne düşünüyorsun?</Title>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                autoFocus
                className="mt-5 w-full rounded-[2px] border border-line bg-sunk px-4 py-3 text-[16px] leading-relaxed placeholder:text-ink-faint focus:border-ink focus:outline-none"
                placeholder="Neyi istiyorsun, neyi istemiyorsun."
              />
              {error ? <p className="mt-3 text-[14px] text-alarm">{error}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => void draftFromText()} disabled={busy || text.trim().length < 10}>
                  {busy ? "Okunuyor" : "İşaretle"}
                </Button>
                <Button kind="plain" onClick={() => setWriting(false)} disabled={busy}>
                  Vazgeç
                </Button>
              </div>
            </>
          ) : (
            <OptionStep
              option={options[optionIndex]}
              stance={stances.find((s) => s.optionId === options[optionIndex].id)!}
              index={optionIndex}
              total={options.length}
              onChange={(patch) => update(options[optionIndex].id, patch)}
              onBack={() => (optionIndex === 0 ? setStep(0) : setOptionIndex(optionIndex - 1))}
              onNext={() => (optionIndex === options.length - 1 ? setStep(2) : setOptionIndex(optionIndex + 1))}
            />
          )}
        </Panel>
      ) : null}

      {step === 2 ? (
        <Panel>
          <Title>Hangisi senin için en önemli?</Title>
          <div className="mt-6 grid gap-2">
            {options.map((option) => {
              const active = mostImportant === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMostImportant(option.id)}
                  aria-pressed={active}
                  className="tap min-h-[44px] rounded-[2px] border px-4 py-3 text-left text-[16px]"
                  style={{
                    borderColor: active ? "var(--ink)" : "var(--line)",
                    background: active ? "var(--ink)" : "var(--card)",
                    color: active ? "var(--on-ink)" : "var(--ink)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setStep(3)} disabled={mostImportant === null}>
              Devam
            </Button>
            <Button kind="plain" onClick={() => { setOptionIndex(options.length - 1); setStep(1); }}>
              Geri
            </Button>
          </div>
        </Panel>
      ) : null}

      {step === 3 ? (
        <Panel>
          <Title>Oyun şunu söylüyor</Title>
          <ul className="mt-5 space-y-2">
            {readBack.map((line, index) => (
              <li key={index} className="prose-read max-w-[60ch]">
                {line}
              </li>
            ))}
          </ul>

          {alreadyVoted ? (
            <p className="mt-5 text-[14px] text-ink-soft">
              Bu cüzdanla daha önce oy verdin. Bu, öncekinin yerine geçer.
            </p>
          ) : null}
          {error ? <p className="mt-4 text-[14px] text-alarm">{error}</p> : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={() => void submit()} disabled={busy}>
              {busy ? "Kaydediliyor" : "Onaylıyorum"}
            </Button>
            <Button kind="plain" onClick={() => setStep(2)}>
              Geri
            </Button>
            <span className="ml-auto font-mono text-[12px] text-ink-faint">{shortAddress(subjectId)}</span>
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
  onChange,
  onBack,
  onNext,
}: {
  option: Option;
  stance: Stance;
  index: number;
  total: number;
  onChange: (patch: Partial<Stance>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <p className="mb-2 font-mono text-[12px] tabular-nums text-ink-faint">
        {index + 1} / {total}
      </p>
      <Title>{option.label}</Title>
      {option.detail ? <Hint>{option.detail}</Hint> : null}

      {stance.rationale ? (
        <blockquote className="mt-4 border-l-2 border-line-strong pl-4 text-[15px] leading-relaxed text-ink-soft">
          {stance.rationale}
        </blockquote>
      ) : null}

      <div className="mt-6 grid gap-2">
        {SUPPORT_STEPS.map((choice) => {
          const active = choice.value === stance.support;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => onChange({ support: choice.value, redLine: choice.value < 0 && stance.redLine })}
              aria-pressed={active}
              className="tap min-h-[44px] rounded-[2px] border px-4 py-3 text-left text-[16px]"
              style={{
                borderColor: active ? "var(--ink)" : "var(--line)",
                background: active ? "var(--ink)" : "var(--card)",
                color: active ? "var(--on-ink)" : "var(--ink)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {choice.label}
            </button>
          );
        })}
      </div>

      {/* A red line only means something once someone is against the option. */}
      {stance.support < 0 ? (
        <label className="mt-4 flex items-start gap-3 border-l-2 border-alarm bg-sunk px-4 py-3">
          <input
            type="checkbox"
            checked={stance.redLine}
            onChange={(e) => onChange({ redLine: e.target.checked })}
            className="mt-0.5 size-5 accent-[color:var(--alarm)]"
          />
          <span className="text-[15px] leading-relaxed">Bunu kabul edemem.</span>
        </label>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={onNext}>{index === total - 1 ? "Devam" : "Sonraki"}</Button>
        <Button kind="plain" onClick={onBack}>
          Geri
        </Button>
      </div>
    </>
  );
}

/** Whether this wallet's tier in this community allows voting. Null while unknown. */
function useVotingPermission(communityId: string, address: string | null): boolean | null {
  const [canVote, setCanVote] = useState<boolean | null>(null);

  useEffect(() => {
    if (!address) {
      setCanVote(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const membership = await communities.myMembership(communityId);
        if (alive) setCanVote(membership.status === "member" && membership.canVote === true);
      } catch {
        if (alive) setCanVote(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [communityId, address]);

  return canVote;
}

function blankStances(options: Option[]): Stance[] {
  return options.map((o) => ({
    optionId: o.id,
    support: 0,
    confidence: 0.5,
    salience: OTHER_SALIENCE,
    redLine: false,
  }));
}
