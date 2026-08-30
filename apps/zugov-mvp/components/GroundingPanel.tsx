"use client";

import { useState } from "react";
import type { GroundingReport, Option } from "@/lib/core/types";
import { EPISTEMIC_QUESTIONS } from "@/lib/core/types";
import { Button } from "./ui";

/**
 * What the engine says, kept to what a person can hold in their head.
 *
 * One sentence naming the real choice, and one line per option saying what it
 * costs. The six-question audit is one link away for whoever wants it, and does
 * not run until then.
 */
export function GroundingPanel({
  decisionId,
  options,
  initial,
}: {
  decisionId: string;
  options: Option[];
  initial: GroundingReport | null;
}) {
  const [report, setReport] = useState<GroundingReport | null>(initial);
  const [busy, setBusy] = useState<"crux" | "audit" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(detay: boolean) {
    setBusy(detay ? "audit" : "crux");
    setError(null);
    try {
      const response = await fetch(`/api/decisions/${decisionId}/grounding${detay ? "?detay=1" : ""}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Üretilemedi.");
      setReport(data as GroundingReport);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
    } finally {
      setBusy(null);
    }
  }

  if (!report) {
    return (
      <div className="space-y-3">
        {error ? <p className="text-[14px] text-alarm">{error}</p> : null}
        <Button kind="quiet" onClick={() => void run(false)} disabled={busy !== null}>
          {busy ? "Okunuyor" : "Metin ne diyor?"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <dl className="divide-y divide-[color:var(--line)] border-t border-line">
        {options.map((option) => (
          <div key={option.id} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-5">
            <dt className="text-[15px] font-medium">{option.label}</dt>
            <dd className="prose-read text-ink-soft">
              {report.tradeoffs[option.id] ?? (
                <span className="font-sans text-[15px] text-alarm">Gerekçede geçmiyor.</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {report.sections ? (
        <dl className="divide-y divide-[color:var(--line)] border-t border-line">
          {EPISTEMIC_QUESTIONS.map((key) => {
            const section = report.sections?.[key];
            if (!section || section.observations.length === 0) return null;
            return (
              <div key={key} className="py-4">
                <dt className="text-[15px] font-medium">{section.question}</dt>
                <dd className="mt-1.5 space-y-1.5">
                  {section.observations.map((observation, index) => (
                    <p key={index} className="text-[15px] leading-relaxed text-ink-soft">
                      {observation}
                    </p>
                  ))}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <button
          type="button"
          onClick={() => void run(true)}
          disabled={busy !== null}
          className="tap text-[14px] text-ink-soft underline underline-offset-4 hover:text-ink disabled:opacity-40"
        >
          {busy === "audit" ? "Sorgulanıyor" : "Altı soruyla sorgula"}
        </button>
      )}

      {error ? <p className="text-[14px] text-alarm">{error}</p> : null}
      <p className="font-mono text-[11px] text-ink-faint">
        {report.producedBy} · {report.digest}
      </p>
    </div>
  );
}
