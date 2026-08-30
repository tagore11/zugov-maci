import { NextResponse } from "next/server";
import { checkModel } from "@/lib/llm/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await checkModel());
}
