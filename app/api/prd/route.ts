import { NextRequest, NextResponse } from "next/server";
import { listPrds, savePrd } from "@/app/lib/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ items: listPrds() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const code = String(b.code || "").trim();
    const moduleName = String(b.moduleName || b.module_name || "").trim();
    if (!code || !moduleName) {
      return NextResponse.json({ error: "code & moduleName wajib." }, { status: 400 });
    }
    const meta = savePrd({
      code, moduleName,
      cluster: b.cluster ?? null,
      bpmnFile: b.bpmnFile ?? b.bpmn_file ?? null,
      mode: b.mode ?? null,
      draft: b.draft ?? null,
      prd: b.prd ?? null,
      markdown: b.markdown ?? null,
      flowchart: b.flowchart ?? null,
    });
    return NextResponse.json({ item: meta }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
