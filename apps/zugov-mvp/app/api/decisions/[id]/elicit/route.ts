import { NextResponse } from "next/server";
import { getDecision } from "@/lib/store";
import { elicitPreference } from "@/lib/llm/elicit";

export const maxDuration = 300;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const decision = await getDecision(id);
  if (!decision) return NextResponse.json({ error: "Decision not found." }, { status: 404 });

  const body = (await request.json()) as { subjectId?: string; text?: string };
  const text = (body.text ?? "").trim();
  if (text.length < 10) {
    return NextResponse.json({ error: "Write a few sentences, a single word isn't enough." }, { status: 400 });
  }

  const result = await elicitPreference({
    subjectId: (body.subjectId ?? "").trim() || "anonymous",
    decisionId: decision.id,
    text,
    options: decision.options,
  });

  // Always unconfirmed. A person reviews the numbers before they count.
  return NextResponse.json(result);
}
