import Link from "next/link";
import { notFound } from "next/navigation";
import { getDecision } from "@/lib/store";
import { analyseSensitivity, decide } from "@/lib/core/decide";
import { getMechanism, labelOf } from "@/lib/core/mechanisms";
import { Hint, Panel, Title } from "@/components/ui";
import { buildReceipt } from "@/lib/core/receipt";
import { copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await getDecision(id);
  if (!decision) notFound();

  const mechanism = getMechanism(decision.mechanismId);
  const back = (
    <Link href={`/karar/${decision.id}`} className="tap text-[14px] text-ink-soft underline underline-offset-4">
      {copy.result.backToDecision}
    </Link>
  );

  if (decision.preferences.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <nav className="mb-8">{back}</nav>
        <Panel>
          <Title>{copy.result.noResultYetTitle}</Title>
          <Hint>{copy.result.noResultYetHint}</Hint>
        </Panel>
      </main>
    );
  }

  const outcome = decide(decision.preferences, decision.options, decision.mechanismId);
  const receipt = buildReceipt({
    decisionId: decision.id,
    title: decision.title,
    options: decision.options,
    mechanismId: decision.mechanismId,
    preferences: decision.preferences,
    salt: decision.salt ?? decision.id,
  });
  const sensitivity = analyseSensitivity(decision.preferences, decision.options);
  const ranked = [...outcome.scores].sort((a, b) => b.score - a.score);
  const top = Math.max(1, ...ranked.map((s) => Math.abs(s.score)));

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 md:py-16">
      <nav className="flex flex-wrap items-center justify-between gap-3">
        {back}
        <span className="font-mono text-[11px] text-ink-faint">
          {decision.preferences.length} {copy.result.participantCount}
        </span>
      </nav>

      <Panel>
        <p className="mb-2 text-[14px] text-ink-soft">{copy.result.byRule(mechanism.name)}</p>
        {outcome.winnerId ? (
          <Title as="h1">{labelOf(decision.options, outcome.winnerId)}</Title>
        ) : (
          <Title as="h1">{copy.result.noWinner}</Title>
        )}

        {outcome.contest > 0.7 ? (
          <p className="mt-4 border-l-2 border-line-strong pl-4 text-[15px]">{copy.result.closeContest}</p>
        ) : null}

        <ul className="mt-7 space-y-4">
          {ranked.map((score) => {
            const isWinner = score.optionId === outcome.winnerId;
            return (
              <li key={score.optionId}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className={`text-[16px] ${isWinner ? "font-semibold" : "text-ink-soft"}`}>
                    {labelOf(decision.options, score.optionId)}
                  </span>
                  <span className="font-mono text-[12px] tabular-nums text-ink-faint">
                    {score.score.toFixed(score.score % 1 === 0 ? 0 : 1)} {score.unit}
                  </span>
                </div>
                <span className="mt-2 block h-2 w-full overflow-hidden bg-sunk">
                  <span
                    className="block h-full"
                    style={{
                      width: `${Math.round((Math.max(0, score.score) / top) * 100)}%`,
                      background: isWinner ? "var(--ink)" : "var(--line-strong)",
                    }}
                  />
                </span>
              </li>
            );
          })}
        </ul>

        {outcome.notes.length > 0 ? (
          <ol className="mt-7 space-y-1 border-t border-line pt-5 text-[14px] text-ink-soft">
            {outcome.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ol>
        ) : null}
      </Panel>

      {outcome.redLines.length > 0 ? (
        <Panel className="border-l-2" style={{ borderLeftColor: "var(--alarm)" }}>
          <Title>{copy.result.redLinesTitle}</Title>
          <ul className="mt-4 space-y-2">
            {outcome.redLines.map((entry) => (
              <li key={entry.optionId} className="text-[16px]">
                <span className="font-medium">{labelOf(decision.options, entry.optionId)}</span>
                <span className="text-ink-soft">{copy.result.redLineCount(entry.count)}</span>
              </li>
            ))}
          </ul>

        </Panel>
      ) : null}

      <Panel>
        <Title>
          {sensitivity.verdict === "robust"
            ? copy.result.verdictTitle.robust
            : sensitivity.verdict === "leaning"
              ? copy.result.verdictTitle.leaning
              : copy.result.verdictTitle.contested}
        </Title>

        <p className="prose-read mt-3 max-w-[58ch] text-ink-soft">
          {sensitivity.verdict === "robust"
            ? copy.result.verdictBody.robust
            : sensitivity.verdict === "leaning"
              ? copy.result.verdictBody.leaning
              : copy.result.verdictBody.contested}
        </p>

        {sensitivity.verdict !== "robust" ? (
        <ul className="mt-6 divide-y divide-[color:var(--line)]">
          {sensitivity.byMechanism.map((entry) => {
            const isCurrent = entry.mechanismId === decision.mechanismId;
            return (
              <li key={entry.mechanismId} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span className={`text-[15px] ${isCurrent ? "font-semibold" : "text-ink-soft"}`}>
                  {entry.name}
                  {isCurrent ? <span className="ml-2 text-[13px] text-ink-faint">{copy.result.currentRule}</span> : null}
                </span>
                <span className="text-[15px] text-ink-soft">
                  {entry.winnerId ? labelOf(decision.options, entry.winnerId) : copy.result.noWinnerShort}
                </span>
              </li>
            );
          })}
        </ul>
        ) : null}
      </Panel>

      <Panel>
        <Title>{copy.result.verifyTitle}</Title>
        <p className="prose-read mt-3 max-w-[58ch] text-ink-soft">{copy.result.verifyBody}</p>

        <div className="mt-5 overflow-x-auto">
          <pre className="w-fit min-w-full bg-sunk px-4 py-3 font-mono text-[12px] leading-relaxed">
            {`curl -O ${"http://localhost:3400"}/api/decisions/${decision.id}/makbuz\nnpm run dogrula -- makbuz`}
          </pre>
        </div>

        <p className="mt-5 font-mono text-[12px] break-all text-ink-faint">
          {copy.result.signatureLabel} {receipt.digest}
        </p>
        <div className="mt-4">
          <a
            href={`/api/decisions/${decision.id}/makbuz`}
            className="tap text-[15px] font-medium underline underline-offset-4"
          >
            {copy.result.openReceipt}
          </a>
        </div>
      </Panel>
    </main>
  );
}
