import { NextRequest, NextResponse } from "next/server";
import { getPrd, savePrd, deletePrd } from "@/app/lib/store";
import { mergeFromPrd } from "@/app/lib/dictionary";

export const runtime = "nodejs";

// Route param `[id]` carries the feature `code` (file-based store keys by code).
function code(s: string): string | null {
  const c = String(s || "").trim();
  return /^[A-Za-z0-9_-]+$/.test(c) ? c : null;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const c = code(params.id);
    if (!c) return NextResponse.json({ error: "code tidak valid." }, { status: 400 });
    const row = getPrd(c);
    if (!row) return NextResponse.json({ error: "PRD tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ item: row });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const c = code(params.id);
    if (!c) return NextResponse.json({ error: "code tidak valid." }, { status: 400 });
    if (!getPrd(c)) return NextResponse.json({ error: "PRD tidak ditemukan." }, { status: 404 });
    const b = await req.json();
    const meta = savePrd({
      code: c,
      moduleName: String(b.moduleName || b.module_name || "").trim(),
      mode: b.mode ?? "edited",
      prd: b.prd ?? null,
      markdown: b.markdown ?? null,
      flowchart: b.flowchart ?? null,
    });
    if (b.prd && Array.isArray(b.prd.sections)) mergeFromPrd(b.prd, c); // refresh shared dictionary
    return NextResponse.json({ item: meta });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const c = code(params.id);
    if (!c) return NextResponse.json({ error: "code tidak valid." }, { status: 400 });
    const ok = deletePrd(c);
    if (!ok) return NextResponse.json({ error: "PRD tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
