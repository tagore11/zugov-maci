"use client";

import { useState } from "react";
import type { GroundingReport } from "@/lib/core/types";
import { EPISTEMIC_QUESTIONS } from "@/lib/core/types";

/**
 * The Grounding Engine's surface. It asks six questions about the proposal and
 * shows what it found. It has no vote and no ranking, and the panel says so on
 * the page rather than in the docs, because the claim only means something if
 * the people using it can see it.
 */
export function GroundingPanel({ decisionId, initial }: { decisionId: string; initial: GroundingReport | null }) {
  const [report, setReport] = useState<GroundingReport | null>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/decisions/${decisionId}/grounding`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Rapor üretilemedi.");
      setReport(data as GroundingReport);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
    } finally {
      setBusy(false);
    }
  }

  if (!report) {
    return (
      <div className="space-y-4">
        <p className="max-w-[65ch] text-[15px] leading-relaxed text-muted">
          Oylamadan önce önerinin arkasındaki akıl yürütmeyi masaya koyabilirsin. Altı soru sorulur,
          cevaplar bu cihazdaki modelden gelir. Rapor kimseye oy vermez, seçenek önermez.
        </p>
        {error ? <p className="text-[13px]" style={{ color: "var(--error)" }}>{error}</p> : null}
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="rounded-[6px] border border-line px-4 py-2 text-[15px] text-muted-strong transition-colors duration-150 hover:border-line-strong active:translate-y-[1px] disabled:opacity-40"
        >
          {busy ? "Okunuyor" : "Öneriyi sorgula"}
        </button>
        {busy ? <SkeletonReport /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="max-w-[65ch] font-display text-[15px] leading-relaxed">{report.summary}</p>

      <dl className="divide-y divide-[color:var(--gray-700)]">
        {EPISTEMIC_QUESTIONS.map((key) => {
          const section = report.sections[key];
          if (!section || section.observations.length === 0) return null;
          return (
            <div key={key} className="grid gap-2 py-4 first:pt-0 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-8">
              <dt className="text-[13px] leading-relaxed text-muted">{section.question}</dt>
              <dd className="space-y-2">
                {section.observations.map((observation, i) => (
                  <p key={i} className="text-[15px] leading-relaxed">
                    {observation}
                  </p>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-4 font-mono text-[11px] text-muted">
        <span>{report.producedBy}</span>
        <span>imza {report.digest}</span>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="underline underline-offset-4 transition-colors duration-150 hover:text-muted-strong disabled:opacity-40"
        >
          {busy ? "yeniden okunuyor" : "yeniden çalıştır"}
        </button>
      </div>
      <p className="text-[13px] text-muted">
        Aynı imzayı alan iki kişi aynı raporu okumuş demektir. Farklı imza, farklı model ya da
        değişmiş metin anlamına gelir.
      </p>
    </div>
  );
}

function SkeletonReport() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-2 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-8">
          <div className="h-3 w-3/4 animate-pulse bg-line" />
          <div className="h-3 w-full animate-pulse bg-line" />
        </div>
      ))}
    </div>
  );
}
