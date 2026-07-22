import { NextRequest, NextResponse } from "next/server";
import { generateFlowchart } from "@/app/lib/flowchart";
import type { Prd } from "@/app/lib/generate";
import { saveFlowchart } from "@/app/lib/store";

export const runtime = "nodejs";
export const maxDuration = 36000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prd = body.prd as Prd | undefined;
    const code = String(body.code || "").trim();
    const moduleName = String(body.moduleName || "").trim();

    if (!prd || !Array.isArray(prd.sections)) {
      return NextResponse.json({ error: "PRD belum ada — generate PRD dulu sebelum buat flowchart." }, { status: 400 });
    }

    const { mermaid, engine } = await generateFlowchart({ prd, moduleName });

    // Persist alongside the PRD record (auto-write).
    if (code) saveFlowchart(code, mermaid, moduleName);

    return NextResponse.json({ moduleName, mermaid, engine });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
