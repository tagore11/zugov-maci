"use client";

import { useState } from "react";
import type { GroundingReport } from "@/lib/core/types";
import { EPISTEMIC_QUESTIONS } from "@/lib/core/types";
import { Button, Hint } from "./ui";

/**
 * The Grounding Engine's surface. Six questions about the proposal, answered by
 * a model running on this machine. It holds no vote and cannot rank the
 * options, and the panel says so on the page rather than in the docs, because
 * the claim only means something if the people using it can see it.
 *
 * Opt-in, and collapsed by default. A wall of machine-written analysis above
 * the proposal would be the loudest voice in the room before anyone else spoke.
 */
export function GroundingPanel({ decisionId, initial }: { decisionId: string; initial: GroundingReport | null }) {
  const [report, setReport] = useState<GroundingReport | null>(initial);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setOpen(true);
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
        <Hint>
          Bu öneriyi altı soruyla sorgulayabilirsin: hangi varsayımlar tutmalı, en güçlü karşı
          argüman ne, geri dönmek ne kadar kolay, kimler etkileniyor. Cevaplar bu cihazdaki
          modelden gelir. Rapor oy vermez, seçenek önermez.
        </Hint>
        {error ? <p className="text-[14px] text-alarm">{error}</p> : null}
        <Button kind="quiet" onClick={run} disabled={busy}>
          {busy ? "Okunuyor" : "Öneriyi sorgula"}
        </Button>
        {busy ? <Skeleton /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="prose-read max-w-[62ch] text-ink-soft">{report.summary}</p>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="tap text-[15px] font-medium underline underline-offset-4"
      >
        {open ? "Soruları gizle" : `Altı sorunun cevabını göster`}
      </button>

      {open ? (
        <>
          <dl className="divide-y divide-[color:var(--line)]">
            {EPISTEMIC_QUESTIONS.map((key) => {
              const section = report.sections[key];
              if (!section || section.observations.length === 0) return null;
              return (
                <div key={key} className="py-5 first:pt-2">
                  <dt className="text-[15px] font-medium">{section.question}</dt>
                  <dd className="mt-2 space-y-2">
                    {section.observations.map((observation, index) => (
                      <p key={index} className="prose-read max-w-[62ch] text-ink-soft">
                        {observation}
                      </p>
                    ))}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 font-mono text-[11px] text-ink-faint">
            <span>{report.producedBy}</span>
            <span>imza {report.digest}</span>
            <button type="button" onClick={run} disabled={busy} className="tap underline underline-offset-4">
              {busy ? "yeniden okunuyor" : "yeniden çalıştır"}
            </button>
          </div>
          <Hint>
            Aynı imzayı alan iki kişi aynı raporu okumuş demektir. Rapor küçük bir modelin okuması,
            kaynak metnin yerine geçmez.
          </Hint>
        </>
      ) : null}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-2/5 bg-sunk" />
          <div className="h-3 w-4/5 bg-sunk" />
        </div>
      ))}
    </div>
  );
}
