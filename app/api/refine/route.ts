import { NextRequest, NextResponse } from "next/server";
import { refinePrd } from "@/app/lib/refine";
import { prdToMarkdown, type Prd } from "@/app/lib/generate";
import { savePrd } from "@/app/lib/store";
import { mergeFromPrd } from "@/app/lib/dictionary";

export const runtime = "nodejs";
export const maxDuration = 36000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prd = body.prd as Prd | undefined;
    const instruction = String(body.instruction || "").trim();
    const moduleName = String(body.moduleName || "").trim();
    const code = String(body.code || "").trim();

    if (!prd || !Array.isArray(prd.sections)) {
      return NextResponse.json({ error: "PRD belum ada — generate dulu sebelum dikembangkan." }, { status: 400 });
    }
    if (!instruction) {
      return NextResponse.json({ error: "Tulis instruksi pengembangan dulu." }, { status: 400 });
    }

    const { prd: updated, engine } = await refinePrd({ prd, instruction, moduleName });
    if (!updated) {
      return NextResponse.json({ error: "Model tidak mengembalikan PRD JSON valid. Coba lagi / persempit instruksi." }, { status: 502 });
    }
    const mode = `developed (${engine})`;
    const markdown = prdToMarkdown(updated);

    // Overwrite the stored PRD (auto-write) + refresh shared dictionary.
    if (code) { savePrd({ code, moduleName, mode, prd: updated, markdown }); mergeFromPrd(updated, code); }

    return NextResponse.json({ mode, code, moduleName, prd: updated, markdown });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
