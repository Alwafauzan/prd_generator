import { NextRequest, NextResponse } from "next/server";
import { buildPrompt, generatePrd, generateViaClaudeCode, parsePrdJson, prdToMarkdown, featureByCode, type GenInput } from "@/app/lib/generate";
import { savePrd, saveAttachments } from "@/app/lib/store";
import { relatedContextFor, mergeFromPrd } from "@/app/lib/dictionary";
import { extractDocs, renderDocsBlock, isSupportedDoc, type DocInput } from "@/app/lib/attachments";

export const runtime = "nodejs";
export const maxDuration = 36000; // PRD generation can take minutes

const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10MB/file

// Parse request body from multipart (with file uploads) or plain JSON.
async function readBody(req: NextRequest): Promise<{
  code: string; bpmnFile: string; draft: string; relatedCodes: string[]; docs: DocInput[];
}> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const fd = await req.formData();
    const docs: DocInput[] = [];
    for (const f of fd.getAll("documents")) {
      if (typeof f === "string" || !("arrayBuffer" in f)) continue;
      if (f.size > MAX_DOC_BYTES) throw new Error(`Dokumen terlalu besar (maks 10MB): ${f.name}`);
      if (!isSupportedDoc(f.name, f.type)) throw new Error(`Format dokumen tidak didukung: ${f.name}`);
      docs.push({ name: f.name, mime: f.type, buffer: Buffer.from(await f.arrayBuffer()) });
    }
    const rel = fd.get("relatedCodes");
    return {
      code: String(fd.get("code") || "").trim(),
      bpmnFile: String(fd.get("bpmnFile") || "").trim(),
      draft: String(fd.get("draft") || ""),
      relatedCodes: rel ? String(rel).split(",").map((s) => s.trim()).filter(Boolean) : [],
      docs,
    };
  }
  const body = await req.json();
  return {
    code: String(body.code || "").trim(),
    bpmnFile: String(body.bpmnFile || "").trim(),
    draft: String(body.draft || ""),
    relatedCodes: Array.isArray(body.relatedCodes) ? body.relatedCodes.map(String) : [],
    docs: [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { code, bpmnFile, draft, relatedCodes, docs } = await readBody(req);

    if (!code) return NextResponse.json({ error: "Pilih code fitur dulu." }, { status: 400 });
    // bpmnFile optional — empty triggers knowledge mode (cross-process BPMN).

    // Cross-PRD consistency: compact dictionary slice (auto by overlap; manual via relatedCodes).
    const feat = featureByCode(code);
    const relatedContext = feat ? relatedContextFor(feat, relatedCodes.length ? relatedCodes : undefined) : "";

    // Extract document attachments → prompt block (per-file + total char budget).
    const extracted = docs.length ? await extractDocs(docs) : [];
    const docsBlock = renderDocsBlock(extracted);

    const input: GenInput = { bpmnFile, code, draft, format: "json", relatedContext, docsBlock };
    const { moduleName } = buildPrompt(input);

    // Engine: PRD_ENGINE env overrides; else API if key present, else Claude Code CLI.
    const engine = process.env.PRD_ENGINE
      || (process.env.ANTHROPIC_API_KEY ? "api" : "claude-code");

    if (engine === "preview") {
      const { user } = buildPrompt(input);
      return NextResponse.json({
        mode: "preview",
        moduleName,
        markdown: `> **Mode preview** — prompt rakitan (BPMN sudah diparse), bukan PRD final.\n\n\`\`\`\n${user}\n\`\`\``,
      });
    }

    const raw = engine === "api"
      ? await generatePrd(input)
      : await generateViaClaudeCode(input);
    const prd = parsePrdJson(raw);
    const markdown = prd ? prdToMarkdown(prd) : raw; // fallback: raw text if JSON parse failed
    const mode = engine === "api" ? "generated (api)" : "generated (claude code)";

    // Auto-write to result/ (file-based store) — upsert by code.
    const cluster = feat?.cluster ?? null;
    savePrd({ code, moduleName, cluster, bpmnFile: bpmnFile || null, mode, draft, prd, markdown });

    // Persist document attachments alongside the record.
    let attachments: { name: string; kind: "doc" | "image" }[] = [];
    if (docs.length) {
      attachments = saveAttachments(code, docs.map((d) => ({ name: d.name, buffer: d.buffer, kind: "doc" as const })), moduleName);
    }

    // Update shared dictionary (programmatic parse — no model tokens).
    if (prd) mergeFromPrd(prd, code);

    return NextResponse.json({ mode, parsed: !!prd, code, moduleName, prd, markdown, attachments });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
