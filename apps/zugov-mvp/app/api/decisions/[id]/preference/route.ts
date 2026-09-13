import { NextResponse } from "next/server";
import { getDecision, upsertPreference } from "@/lib/store";
import type { PreferenceVector } from "@/lib/core/types";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const decision = await getDecision(id);
  if (!decision) return NextResponse.json({ error: "Decision not found." }, { status: 404 });

  const vector = (await request.json()) as PreferenceVector;
  if (!vector?.subjectId?.trim()) {
    return NextResponse.json({ error: "It's not clear who this preference belongs to." }, { status: 400 });
  }
  if (vector.confirmed !== true) {
    return NextResponse.json({ error: "An unconfirmed preference is not saved." }, { status: 400 });
  }

  const known = new Set(decision.options.map((o) => o.id));
  const updated = await upsertPreference(decision.id, {
    ...vector,
    decisionId: decision.id,
    stances: vector.stances.filter((s) => known.has(s.optionId)),
  });

  return NextResponse.json(updated);
}
