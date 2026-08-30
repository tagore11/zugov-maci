import Link from "next/link";
import { notFound } from "next/navigation";
import { getDecision } from "@/lib/store";
import { analyseSensitivity, decide } from "@/lib/core/decide";
import { getMechanism, labelOf } from "@/lib/core/mechanisms";
import { GroundingPanel } from "@/components/GroundingPanel";
import { PreferenceComposer } from "@/components/PreferenceComposer";
import { ModelBadge } from "@/components/ModelBadge";
import { Panel, SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await getDecision(id);
  if (!decision) notFound();

  const mechanism = getMechanism(decision.mechanismId);
  const hasVotes = decision.preferences.length > 0;
  const outcome = hasVotes ? decide(decision.preferences, decision.options, decision.mechanismId) : null;
  const sensitivity = hasVotes ? analyseSensitivity(decision.preferences, decision.options) : null;
  const maxScore = outcome ? Math.max(1, ...outcome.scores.map((s) => Math.abs(s.score))) : 1;

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-16 md:px-6">
      <div>
        <Link href="/" className="font-mono text-[11px] text-muted underline underline-offset-4 hover:text-muted-strong">
          geri
        </Link>
        <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.1] tracking-tight">{decision.title}</h1>
        {decision.body ? (
          <p className="mt-4 max-w-[65ch] text-[16px] leading-relaxed text-muted-strong">{decision.body}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted">
          <span>kural: {mechanism.name}</span>
          <span className="tabular-nums">{decision.preferences.length} katılımcı</span>
          <ModelBadge />
        </div>
      </div>

      <Panel>
        <SectionTitle note="oy hakkı yok">Sorgulama raporu</SectionTitle>
        <GroundingPanel decisionId={decision.id} initial={decision.grounding} />
      </Panel>

      <Panel>
        <SectionTitle note={mechanism.question}>Tercihin</SectionTitle>
        <PreferenceComposer
          decisionId={decision.id}
          options={decision.options}
          existing={decision.preferences}
        />
      </Panel>

      {outcome && sensitivity ? (
        <>
          <Panel>
            <SectionTitle note={`${mechanism.name} kuralına göre`}>Sonuç</SectionTitle>

            <ul className="space-y-4">
              {[...outcome.scores]
                .sort((a, b) => b.score - a.score)
                .map((score) => {
                  const isWinner = score.optionId === outcome.winnerId;
                  return (
                    <li key={score.optionId}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className={`text-[15px] ${isWinner ? "font-semibold" : "text-muted-strong"}`}>
                          {labelOf(decision.options, score.optionId)}
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-muted">
                          {score.score.toFixed(score.score % 1 === 0 ? 0 : 2)} {score.unit}
                        </span>
                      </div>
                      <span className="mt-2 block h-[3px] w-full bg-line">
                        <span
                          className="block h-full transition-[width] duration-300 ease-out"
                          style={{
                            width: `${Math.round((Math.max(0, score.score) / maxScore) * 100)}%`,
                            background: isWinner ? "var(--accent)" : "var(--gray-500)",
                          }}
                        />
                      </span>
                    </li>
                  );
                })}
            </ul>

            {outcome.winnerId === null ? (
              <p className="mt-6 text-[15px]" style={{ color: "var(--accent)" }}>
                Bu kurala göre öne çıkan bir seçenek yok.
              </p>
            ) : null}

            {outcome.contest > 0.7 ? (
              <p className="mt-6 max-w-[65ch] text-[13px] leading-relaxed text-muted">
                İlk iki seçenek birbirine çok yakın. Bu sonucu kesin diye sunmak, odada olmayan bir
                mutabakatı varsaymak olur.
              </p>
            ) : null}

            {outcome.notes.length > 0 ? (
              <ol className="mt-6 space-y-1 border-t border-line pt-4 font-mono text-[11px] text-muted">
                {outcome.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ol>
            ) : null}

            {outcome.redLines.length > 0 ? (
              <div className="mt-6 border-t border-line pt-4">
                <h3 className="text-[13px] font-medium" style={{ color: "var(--error)" }}>
                  Kırmızı çizgiler
                </h3>
                <ul className="mt-2 space-y-1 text-[13px] text-muted-strong">
                  {outcome.redLines.map((entry) => (
                    <li key={entry.optionId}>
                      {labelOf(decision.options, entry.optionId)}: {entry.count} kişi kabul edemeyeceğini
                      söyledi.
                    </li>
                  ))}
                </ul>
                <p className="mt-2 max-w-[65ch] text-[13px] leading-relaxed text-muted">
                  Kırmızı çizgi sonucu tek başına iptal etmez. Sayımdan sonra da görünür kalması,
                  kararı alanların bunu bilerek almasını sağlar.
                </p>
              </div>
            ) : null}
          </Panel>

          <Panel>
            <SectionTitle note={`duyarlılık ${sensitivity.sensitivity.toFixed(2)}`}>
              Kuralı değiştirsek ne olurdu
            </SectionTitle>

            <p className="mb-6 max-w-[65ch] text-[15px] leading-relaxed text-muted-strong">
              {sensitivity.verdict === "robust"
                ? "Hangi sayım kuralını kullanırsan kullan sonuç değişmiyor. Kararı veren oda, yazılım değil."
                : sensitivity.verdict === "leaning"
                  ? "Kuralların çoğu aynı sonuca çıkıyor, biri ayrışıyor. Sonuç ayakta ama tartışmalı."
                  : "Kuralı değiştirmek kazananı değiştiriyor. Bu sonucu meşru saymadan önce odanın hangi kuralla karar aldığını konuşması gerekir."}
            </p>

            <ul className="divide-y divide-[color:var(--gray-700)]">
              {sensitivity.byMechanism.map((entry) => (
                <li key={entry.mechanismId} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                  <span className="text-[15px] text-muted-strong">{entry.name}</span>
                  <span className="font-mono text-[11px] text-muted">
                    {entry.winnerId ? labelOf(decision.options, entry.winnerId) : "kazanan çıkmadı"}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      ) : (
        <Panel>
          <SectionTitle>Sonuç</SectionTitle>
          <p className="max-w-[65ch] text-[15px] leading-relaxed text-muted">
            Henüz kimse tercihini yazmadı. İlk tercih kaydedildiğinde sonuç ve kural karşılaştırması
            burada belirir.
          </p>
        </Panel>
      )}
    </main>
  );
}
