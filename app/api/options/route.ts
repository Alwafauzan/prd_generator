import { NextResponse } from "next/server";
import { listFeatures, listBpmn, suggestBpmn } from "@/app/lib/generate";

export const runtime = "nodejs";

export async function GET() {
  const features = listFeatures().map((f) => ({
    code: f.code,
    cluster: f.cluster,
    label: `${f.code} — ${f.module}${f.menu ? " > " + f.menu : ""}${f.fitur ? " > " + f.fitur : ""}`,
    suggestBpmn: suggestBpmn(f.code),
  }));
  return NextResponse.json({ features, bpmnFiles: listBpmn() });
}
