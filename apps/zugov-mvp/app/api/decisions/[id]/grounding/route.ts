import { NextResponse } from "next/server";
import { getDecision, saveDecision } from "@/lib/store";
import { auditProposal, groundProposal } from "@/lib/llm/grounding";

export const maxDuration = 300;

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const decision = await getDecision(id);
  if (!decision) return NextResponse.json({ error: "Karar bulunamadı." }, { status: 404 });

  const input = {
    decisionId: decision.id,
    title: decision.title,
    body: decision.body || decision.title,
    options: decision.options.map((o) => ({ id: o.id, label: o.label })),
  };

  // The six-question audit runs only when it is asked for by name.
  const wantsAudit = new URL(_request.url).searchParams.get("detay") === "1";
  const base = decision.grounding ?? (await groundProposal(input));
  const report = wantsAudit ? await auditProposal(input, base) : base;

  decision.grounding = report;
  await saveDecision(decision);
  return NextResponse.json(report);
}
