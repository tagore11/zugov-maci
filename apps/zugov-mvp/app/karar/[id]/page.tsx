import Link from "next/link";
import { notFound } from "next/navigation";
import { getDecision } from "@/lib/store";
import { getMechanism } from "@/lib/core/mechanisms";
import { DecisionFlow } from "@/components/DecisionFlow";
import { ModelBadge } from "@/components/ModelBadge";

export const dynamic = "force-dynamic";

export default async function DecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await getDecision(id);
  if (!decision) notFound();

  const mechanism = getMechanism(decision.mechanismId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <nav className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="tap text-[14px] text-ink-soft underline underline-offset-4">
          Kararlar
        </Link>
        <span className="font-mono text-[11px] text-ink-faint">
          {mechanism.name} · {decision.preferences.length} katılımcı
        </span>
      </nav>

      <DecisionFlow
        decisionId={decision.id}
        title={decision.title}
        body={decision.body}
        options={decision.options}
        mechanismId={decision.mechanismId}
        grounding={decision.grounding}
        knownNames={decision.preferences.map((p) => p.subjectId)}
      />

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <ModelBadge />
        <Link href={`/karar/${decision.id}/sonuc`} className="tap text-[14px] text-ink-soft underline underline-offset-4">
          Sonuca bak
        </Link>
      </footer>
    </main>
  );
}
