import { NextResponse } from "next/server";
import { getDecision } from "@/lib/store";
import { elicitPreference } from "@/lib/llm/elicit";

export const maxDuration = 300;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const decision = await getDecision(id);
  if (!decision) return NextResponse.json({ error: "Karar bulunamadı." }, { status: 404 });

  const body = (await request.json()) as { subjectId?: string; text?: string };
  const text = (body.text ?? "").trim();
  if (text.length < 10) {
    return NextResponse.json({ error: "Birkaç cümle yaz, tek kelime yetmiyor." }, { status: 400 });
  }

  const result = await elicitPreference({
    subjectId: (body.subjectId ?? "").trim() || "anonim",
    decisionId: decision.id,
    text,
    options: decision.options,
  });

  // Always unconfirmed. A person reviews the numbers before they count.
  return NextResponse.json(result);
}
