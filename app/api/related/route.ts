import { NextRequest, NextResponse } from "next/server";
import { featureByCode } from "@/app/lib/generate";
import { listPrds } from "@/app/lib/store";
import { autoRelatedCodes } from "@/app/lib/dictionary";

export const runtime = "nodejs";

// Candidate related PRDs for the consistency picker. `auto` = auto-detected as
// overlapping (pre-checked in UI). Excludes the target code itself.
export async function GET(req: NextRequest) {
  try {
    const code = String(req.nextUrl.searchParams.get("code") || "").trim();
    const feat = code ? featureByCode(code) : null;
    const saved = listPrds().filter((s) => s.code !== code);

    const autoCodes = new Set(feat ? autoRelatedCodes(feat) : []);
    const items = saved.map((s) => ({ code: s.code, moduleName: s.moduleName, auto: autoCodes.has(s.code) }));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
