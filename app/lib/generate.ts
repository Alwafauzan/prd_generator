import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { selectRelevant, knowledgeText } from "./knowledge";
// Reuse the validated pure parser functions (no fs inside them).
// @ts-expect-error - plain ESM JS module, no type declarations
import { parseBpmn, summarizeFlow } from "../../lib/bpmn.mjs";

const ROOT = process.cwd();
const BPMN_DIR = join(ROOT, "bpmn");

export type Feature = {
  code: string; cluster: string; module: string;
  menu: string; fitur: string; notes: string;
};

export function loadSkill(): string {
  return readFileSync(join(ROOT, "skill", "system-analyst-prd.md"), "utf8");
}

export function listFeatures(): Feature[] {
  return JSON.parse(readFileSync(join(ROOT, "data", "features-mvp.json"), "utf8"));
}

// List BPMN files in bpmn/ (top level only — excludes the bpmn/json/ subfolder).
export function listBpmn(): string[] {
  return readdirSync(BPMN_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".json"))
    .map((d) => d.name)
    .sort();
}

// Suggested BPMN file per feature code. Only codes with a clear matching process
// are mapped; master data / billing / integration codes (A*, G*, C*, etc.) that
// have no BPMN are intentionally omitted — user picks manually for those.
const CODE_BPMN_SUGGEST: Record<string, string> = {
  // Admisi
  B1: "g-admisi-onsite-registration.json",
  B2: "g-admisi-inpatient-registration.json",
  B3: "g-admisi-emergency-registration.json",
  // EMR
  D3: "g-emr-patient-identity.json",
  D7: "g-emr-emergency.json",
  D8: "g-emr-inpatient.json",
  D9: "g-emr-screening.json",
  // Pelayanan utama (orders & services)
  E1: "g-service-tindakan-bhp.json",
  E2: "g-service-order-resep.json",
  E3: "g-service-order-lab.json",
  E4: "g-service-order-radiology.json",
  E5: "g-service-order-blood.json",
  E6: "g-support-ambulance.json",
  E7: "g-support-vk.json",
  E8: "g-service-order-nutrition.json",
  E10: "g-service-triage-emergency.json",
  E11: "g-service-internal-transfer.json",
  E12: "g-service-cpo-order.json",
  E13: "g-service-discharge.json",
  E14: "g-service-internal-consult.json",
  E16: "g-service-dpjp-change.json",
  E17: "g-support-hemodialysis.json",
  E22: "g-service-pathology-order.json",
  E23: "g-service-cpo-timing.json",
  // Pelayanan pendukung
  F1: "g-support-lab-flow.json",
  F2: "g-support-lab-flow.json",
  F3: "g-support-lab-flow.json",
  F4: "g-support-radiology-flow.json",
  F5: "g-support-radiology-flow.json",
  F6: "g-support-radiology-flow.json",
  F8: "g-support-nutrition-rekap.json",
  F9: "g-support-nutrition-usage.json",
  F11: "g-support-pharmacy-rj.json",
  F12: "g-support-pharmacy-rj.json",
  F13: "g-support-pharmacy-ri-igd.json",
  F14: "g-support-pharmacy-ri-igd.json",
  F15: "g-support-pharmacy-ibs.json",
  F16: "g-support-pharmacy-ibs.json",
  F17: "g-support-pharmacy-retur.json",
  F18: "g-support-pharmacy-queue.json",
  F19: "g-support-pharmacy-otc.json",
  F20: "g-support-pharmacy-return-ri.json",
  F22: "g-support-apotek-online-iter.json",
  F23: "g-support-apotek-online-iter.json",
  F24: "g-support-rehab-form.json",
  F25: "g-support-rehab-form.json",
  F26: "g-support-hemodialysis.json",
  F27: "g-support-hemodialysis.json",
  F28: "g-support-medical-display.json",
  F29: "g-support-ambulance.json",
  F30: "g-support-ambulance.json",
  F31: "g-support-blood-transfusion.json",
  F32: "g-support-blood-transfusion.json",
  F33: "g-support-ppi-surveillance.json",
  F34: "g-support-ppi-surveillance.json",
  F35: "g-support-ppi-audit.json",
  F36: "g-support-vk.json",
  F37: "g-support-vk.json",
  F38: "g-support-vk.json",
  F39: "g-support-mcu.json",
  F40: "g-support-mcu.json",
  F41: "g-support-mcu.json",
  F47: "g-support-morgue-new.json",
  F48: "g-support-morgue-history.json",
  F49: "g-service-pathology-order.json",
  F50: "g-service-pathology-order.json",
  // Backoffice inventory
  H1: "g-backoffice-inventory-pemesanan.json",
  H2: "g-backoffice-inventory-penerimaan.json",
  H3: "g-backoffice-inventory-distribusi.json",
  H6: "g-backoffice-inventory-stok-opname.json",
};
export function suggestBpmn(code: string): string | null {
  return CODE_BPMN_SUGGEST[code] || null;
}

export function featureByCode(code: string): Feature | undefined {
  return listFeatures().find((f) => f.code === code);
}

// Read a BPMN doc by filename, guarding against path traversal.
export function readBpmnDoc(name: string): unknown {
  const safe = basename(name); // strip any path components
  if (!/^[\w.\- ]+\.json$/.test(safe)) throw new Error("Nama file BPMN tidak valid.");
  if (!listBpmn().includes(safe)) throw new Error(`BPMN tidak ditemukan: ${safe}`);
  return JSON.parse(readFileSync(join(BPMN_DIR, safe), "utf8"));
}

// E: features in the same cluster (exact match) — tighter than substring keywords.
function featuresInCluster(cluster: string): Feature[] {
  const c = cluster.trim().toLowerCase();
  return listFeatures().filter((f) => f.cluster.trim().toLowerCase() === c);
}

function featuresToText(rows: Feature[]): string {
  if (!rows.length) return "(tidak ada fitur terkait)";
  return rows
    .map((f) => `- [${f.code}] ${f.cluster} > ${f.module}${f.menu ? " > " + f.menu : ""}${f.fitur ? " > " + f.fitur : ""}${f.notes ? ` (catatan: ${f.notes})` : ""}`)
    .join("\n");
}

export type GenInput = {
  bpmnFile?: string;  // filename within bpmn/ — optional; empty = knowledge mode
  code: string;       // selected feature code
  draft: string;
  format?: "markdown" | "json"; // output shape; default markdown
  relatedContext?: string;      // compact cross-PRD consistency block (from dictionary)
  docsBlock?: string;           // extracted document attachments (## Lampiran Dokumen)
};

export type PrdSection = { id: string; title: string; content_md: string };
export type Prd = {
  title: string;
  meta?: { related_document?: string; version?: string; date?: string };
  sections: PrdSection[];
  open_questions?: string[];
  assumptions?: string[];
};

function resolve(o: GenInput) {
  const feat = featureByCode(o.code);
  if (!feat) throw new Error(`Code fitur tidak ditemukan: ${o.code}`);
  const moduleName = `${feat.module}${feat.menu ? " — " + feat.menu : ""}${feat.fitur ? " (" + feat.fitur + ")" : ""}`;
  const bpmnDoc = o.bpmnFile ? readBpmnDoc(o.bpmnFile) : null;
  return { feat, moduleName, bpmnDoc };
}

const JSON_SCHEMA_HINT = `Keluarkan HANYA satu objek JSON valid (tanpa pagar \`\`\`, tanpa teks lain), bentuk:
{
  "title": "PRD — <nama modul>",
  "meta": { "related_document": "...", "version": "1.0 - Draft awal", "date": "<tgl>" },
  "sections": [
    { "id": "overview", "title": "1. Overview / Brief Summary", "content_md": "..." },
    { "id": "background", "title": "2. Background", "content_md": "..." },
    { "id": "in-scope", "title": "3. In Scope", "content_md": "..." },
    { "id": "goals-metrics", "title": "4. Goals and Metrics", "content_md": "..." },
    { "id": "related-feature", "title": "5. Related Feature", "content_md": "..." },
    { "id": "business-process", "title": "6. Business Process (As-Is / To-Be)", "content_md": "..." },
    { "id": "main-flow", "title": "7. Main Flow / Mindmap", "content_md": "..." },
    { "id": "business-rules", "title": "8. Business Rules", "content_md": "..." },
    { "id": "user-stories", "title": "9. User Stories", "content_md": "..." },
    { "id": "functional-req", "title": "10. Functional Requirements", "content_md": "..." },
    { "id": "data-requirements", "title": "11. Data Requirements (Spesifikasi Field)", "content_md": "..." },
    { "id": "non-functional-req", "title": "12. Non-Functional Requirements", "content_md": "..." },
    { "id": "integrasi", "title": "13. Integrasi Eksternal", "content_md": "..." }
  ],
  "open_questions": ["..."],
  "assumptions": ["..."]
}
"content_md" = isi markdown (boleh tabel/list). Beri ID requirement (FR-/NFR-/BR-/US-) + traceability ke task BPMN di content_md. Tandai [ASUMSI]/[PERLU KONFIRMASI] bila perlu.

WAJIB untuk "data-requirements": rinci spesifikasi field per layar — JANGAN cuma "input data X".
- Tiap step/layar yang MENERIMA INPUT (form) → tabel: | Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
  (Tipe: text/number/date/dropdown/boolean/file/lookup; Sumber: manual/auto/integrasi BPJS-SATUSEHAT-Disdukcapil/master lain).
- Tiap step/layar yang MENAMPILKAN data (dashboard/list/detail) → tabel: | Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |.
- Contoh master data staf: nama, NIP (unik), NIK (16 digit, Disdukcapil), jenis_kelamin (L/P), tgl_lahir, jabatan, unit, no_STR, status_aktif.
- Field tak pasti → [PERLU KONFIRMASI], jangan dikosongkan. Tautkan field ke FR/step terkait bila bisa.`;

// Shared context block (BPMN flow summary or cross-process knowledge + related
// features) reused by PRD, flowchart, and refine prompt builders.
export function buildContext(o: GenInput): {
  feat: Feature; moduleName: string; processSection: string; featsSection: string;
} {
  const { feat, moduleName, bpmnDoc } = resolve(o);
  const processSection = bpmnDoc
    ? `## Ringkasan alur proses (hasil parse BPMN: ${o.bpmnFile})
${summarizeFlow(parseBpmn(bpmnDoc))}`
    : `## Pengetahuan lintas-proses BPMN (modul ini BELUM punya BPMN sendiri)
Tidak ada BPMN khusus untuk modul ini. Gunakan pengetahuan dari proses-proses BPMN terkait di bawah sebagai acuan pola alur, aktor, keputusan, dan integrasi. Turunkan alur (As-Is/To-Be) yang masuk akal untuk modul ini, dan tandai bagian yang diturunkan dari analogi dengan [ASUMSI].

${knowledgeText(selectRelevant(feat))}`;
  const featsSection = featuresToText(featuresInCluster(feat.cluster));
  return { feat, moduleName, processSection, featsSection };
}

export function buildPrompt(o: GenInput): { system: string; user: string; moduleName: string } {
  const { feat, moduleName, processSection, featsSection: feats } = buildContext(o);
  const system = loadSkill();
  const tail = o.format === "json"
    ? JSON_SCHEMA_HINT
    : `Catatan: tandai asumsi dengan [ASUMSI] dan hal yang perlu dikonfirmasi dengan [PERLU KONFIRMASI]. Beri ID pada requirement (FR-/NFR-/BR-/US-) dan traceability ke task BPMN.

PENTING: keluarkan HANYA dokumen PRD dalam markdown, mulai langsung dari heading judul. Tanpa kalimat pembuka/penutup, tanpa meta-komentar.`;
  const head = o.format === "json"
    ? `Buatkan PRD untuk modul: **${moduleName}** (code: ${feat.code}, cluster: ${feat.cluster}) sesuai struktur skill, dalam format JSON.`
    : `Buatkan PRD lengkap untuk modul: **${moduleName}** (code: ${feat.code}, cluster: ${feat.cluster}).\n\nIkuti struktur PRD di bagian 5 skill. Keluarkan **markdown** lengkap (bukan JSON).`;
  const related = o.relatedContext ? `\n${o.relatedContext}\n` : "";
  const docs = o.docsBlock ? `\n${o.docsBlock}\n` : "";
  const user = `${head}

## 1. Draft PRD sederhana (dari user)
${(o.draft || "(tidak ada draft — turunkan dari BPMN & fitur)").trim()}

${processSection}

## 3. Fitur terkait (cluster "${feat.cluster}", dari List Fitur sheet MVP)
${feats}
${related}${docs}
${tail}`;
  return { system, user, moduleName };
}

// Robustly extract a JSON PRD object from raw model output (handles code fences,
// leading/trailing prose). Returns null if not parseable.
// Escape raw control chars (newline/tab) that appear INSIDE JSON strings — LLMs
// frequently emit unescaped newlines in long content fields, which is invalid JSON.
function repairJson(s: string): string {
  let out = "", inStr = false, esc = false;
  for (const ch of s) {
    if (esc) { out += ch; esc = false; continue; }
    if (ch === "\\") { out += ch; esc = true; continue; }
    if (ch === '"') { inStr = !inStr; out += ch; continue; }
    if (inStr) {
      if (ch === "\n") { out += "\\n"; continue; }
      if (ch === "\r") { continue; }
      if (ch === "\t") { out += "\\t"; continue; }
    }
    out += ch;
  }
  return out;
}

export function parsePrdJson(raw: string): Prd | null {
  const s = raw.trim();
  // Slice the outermost { .. } directly. This handles bare JSON, ```json fenced
  // JSON, and trailing prose — WITHOUT a fence regex (which mis-fires when the
  // JSON's own content_md contains markdown code fences).
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  const slice = s.slice(a, b + 1);
  for (const candidate of [slice, repairJson(slice)]) {
    try {
      const obj = JSON.parse(candidate);
      if (obj && Array.isArray(obj.sections)) return obj as Prd;
    } catch { /* try next */ }
  }
  return null;
}

// Flatten a structured PRD back to one markdown document (for download).
export function prdToMarkdown(p: Prd): string {
  const lines: string[] = [`# ${p.title || "PRD"}`];
  if (p.meta) {
    if (p.meta.related_document) lines.push(`\n**Related Document:** ${p.meta.related_document}`);
    if (p.meta.version) lines.push(`**Versi:** ${p.meta.version}`);
    if (p.meta.date) lines.push(`**Tanggal:** ${p.meta.date}`);
  }
  for (const sec of p.sections) lines.push(`\n## ${sec.title}\n\n${sec.content_md}`);
  if (p.assumptions?.length) lines.push(`\n## Asumsi\n` + p.assumptions.map((x) => `- ${x}`).join("\n"));
  if (p.open_questions?.length) lines.push(`\n## Pertanyaan Terbuka\n` + p.open_questions.map((x) => `- ${x}`).join("\n"));
  return lines.join("\n");
}

// Engine #2: drive generation through the local Claude Code CLI (`claude -p`),
// using the user's Claude Code login — no separate Anthropic API billing.
// System prompt = the skill file (passed via --system-prompt-file, replacing the
// default coding prompt); user prompt is piped via stdin.
// Drop any leading preamble before the first markdown heading (e.g. stray
// meta-commentary or plugin output-style wrapper from the spawned CLI session).
function stripPreamble(s: string): string {
  const lines = s.replace(/\r/g, "").split("\n");
  const i = lines.findIndex((l) => /^#{1,3}\s/.test(l.trim()));
  return (i > 0 ? lines.slice(i).join("\n") : s).trim();
}

// Generic Claude Code CLI runner. systemFile = path to a skill markdown used as
// the system prompt (replacing the default coding prompt). raw=true keeps output
// verbatim (for JSON/mermaid where heading-based preamble stripping would harm).
export function runClaudeCode(
  user: string,
  systemFile: string,
  opts: { raw?: boolean } = {}
): Promise<string> {
  // Windows: copy skill to temp dir to avoid --system-prompt-file choking on spaces
  let cleanup: (() => void) | undefined;
  let resolvedFile = systemFile;
  if (process.platform === "win32" && systemFile.includes(" ")) {
    const tmpDir = mkdtempSync(join(tmpdir(), "prd-skills-"));
    const tmpFile = join(tmpDir, "skill.md");
    writeFileSync(tmpFile, readFileSync(systemFile));
    resolvedFile = tmpFile;
    cleanup = () => { try { rmSync(tmpDir, { recursive: true }); } catch {} };
  }
  const args = ["-p", "--output-format", "text", "--system-prompt-file", resolvedFile];
  return new Promise((resolve, reject) => {
    // shell:true so Windows resolves the `claude` shim (.cmd/.ps1).
    const child = spawn("claude", args, { shell: true, cwd: ROOT });
    let out = "", err = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error("Claude Code timeout (5 mnt).")); }, 60 * 60_000);
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", (e) => { clearTimeout(timer); cleanup?.(); reject(new Error(`Gagal menjalankan 'claude': ${e.message}`)); });
    child.on("close", (code) => {
      clearTimeout(timer);
      cleanup?.();
      if (code === 0 && out.trim()) resolve(opts.raw ? out.trim() : stripPreamble(out));
      else reject(new Error(`claude exit ${code}: ${err.trim() || "output kosong"}`));
    });
    child.stdin.write(user);
    child.stdin.end();
  });
}

// Generic Anthropic API runner (streaming). Requires ANTHROPIC_API_KEY.
export async function runApi(system: string, user: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: user }],
  });
  const final = await stream.finalMessage();
  return final.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
}

// Engine selection shared by all features: PRD_ENGINE env overrides; else API if
// key present, else Claude Code CLI.
export function pickEngine(): "api" | "claude-code" | "preview" {
  return (process.env.PRD_ENGINE as "api" | "claude-code" | "preview")
    || (process.env.ANTHROPIC_API_KEY ? "api" : "claude-code");
}

export const SKILL_PRD = join(ROOT, "skill", "system-analyst-prd.md");

// Engine #2: drive PRD generation through the local Claude Code CLI.
export function generateViaClaudeCode(o: GenInput): Promise<string> {
  const { user } = buildPrompt(o);
  // JSON output must NOT be preamble-stripped (markdown headings inside
  // content_md strings would be mistaken for a preamble boundary).
  return runClaudeCode(user, SKILL_PRD, { raw: o.format === "json" });
}

// Engine #1: Anthropic API (streaming). Requires ANTHROPIC_API_KEY.
export async function generatePrd(o: GenInput): Promise<string> {
  const { system, user } = buildPrompt(o);
  return runApi(system, user);
}
