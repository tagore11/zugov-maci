import { NextResponse } from "next/server";
import { getDecision, saveDecision } from "@/lib/store";
import { groundProposal } from "@/lib/llm/grounding";

export const maxDuration = 300;

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const decision = await getDecision(id);
  if (!decision) return NextResponse.json({ error: "Karar bulunamadı." }, { status: 404 });

  const report = await groundProposal({
    decisionId: decision.id,
    title: decision.title,
    body: decision.body || decision.title,
    optionLabels: decision.options.map((o) => o.label),
  });

  decision.grounding = report;
  await saveDecision(decision);
  return NextResponse.json(report);
}
