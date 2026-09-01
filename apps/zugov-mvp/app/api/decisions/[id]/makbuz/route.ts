import { NextResponse } from "next/server";
import { getDecision } from "@/lib/store";
import { buildReceipt } from "@/lib/core/receipt";

export const dynamic = "force-dynamic";

/**
 * The published receipt for a decision. Everything a stranger needs to check
 * the count, and nothing that says who cast which ballot.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const decision = await getDecision(id);
  if (!decision) return NextResponse.json({ error: "Karar bulunamadı." }, { status: 404 });

  if (decision.preferences.length === 0) {
    return NextResponse.json({ error: "Bu kararda henüz tercih yok." }, { status: 409 });
  }

  const receipt = buildReceipt({
    decisionId: decision.id,
    title: decision.title,
    options: decision.options,
    mechanismId: decision.mechanismId,
    preferences: decision.preferences,
    // Decisions opened before receipts existed have no salt of their own.
    salt: decision.salt ?? decision.id,
  });

  return NextResponse.json(receipt, {
    headers: { "Content-Disposition": `inline; filename="makbuz-${decision.id}.json"` },
  });
}
