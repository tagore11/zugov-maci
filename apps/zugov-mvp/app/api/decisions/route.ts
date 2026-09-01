import { NextResponse } from "next/server";
import { listDecisions, newId, newSalt, saveDecision } from "@/lib/store";
import type { MechanismId } from "@/lib/core/types";
import { MECHANISM_ORDER } from "@/lib/core/mechanisms";

export async function GET(request: Request) {
  const communityId = new URL(request.url).searchParams.get("topluluk") ?? undefined;
  return NextResponse.json(await listDecisions(communityId));
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    communityId?: string;
    title?: string;
    body?: string;
    options?: string[];
    mechanismId?: MechanismId;
  };

  const communityId = (body.communityId ?? "").trim();
  if (!communityId) {
    return NextResponse.json({ error: "Karar bir topluluğa ait olmalı." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const optionLabels = (body.options ?? []).map((o) => o.trim()).filter(Boolean);

  if (title.length < 3) {
    return NextResponse.json({ error: "Başlık en az 3 karakter olmalı." }, { status: 400 });
  }
  if (optionLabels.length < 2) {
    return NextResponse.json({ error: "En az iki seçenek gerekli." }, { status: 400 });
  }
  const mechanismId = body.mechanismId ?? "approval";
  if (!MECHANISM_ORDER.includes(mechanismId)) {
    return NextResponse.json({ error: "Bilinmeyen mekanizma." }, { status: 400 });
  }

  const decision = await saveDecision({
    id: newId("k"),
    communityId,
    title,
    body: (body.body ?? "").trim(),
    options: optionLabels.map((label, i) => ({ id: `s${i + 1}`, label })),
    mechanismId,
    createdAt: new Date().toISOString(),
    closesAt: null,
    grounding: null,
    preferences: [],
    salt: newSalt(),
  });

  return NextResponse.json(decision, { status: 201 });
}
