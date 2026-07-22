import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { prdToMarkdown, type Prd } from "./generate";

// File-based storage: one folder per PRD (keyed by feature `code`) under result/.
// Replaces the Postgres store. Layout:
//   result/<code>__<slug>/  meta.json | prd.json | prd.md | flowchart.mmd | draft.txt
const RESULT_DIR = join(process.cwd(), "result");

export type AttachmentRef = { name: string; kind: "doc" | "image" };

export type Meta = {
  code: string;
  moduleName: string;
  cluster: string | null;
  bpmnFile: string | null;
  mode: string | null;
  hasFlowchart: boolean;
  attachments?: AttachmentRef[];
  createdAt: string;
  updatedAt: string;
};

export type PrdListItem = Pick<Meta, "code" | "moduleName" | "mode" | "hasFlowchart" | "updatedAt">;

export type PrdRecord = Meta & {
  prd: Prd | null;
  markdown: string;
  draft: string | null;
  flowchart: string | null;
  attachments: AttachmentRef[];
};

export type SaveInput = {
  code: string;
  moduleName: string;
  cluster?: string | null;
  bpmnFile?: string | null;
  mode?: string | null;
  draft?: string | null;
  prd?: Prd | null;
  markdown?: string | null;
  flowchart?: string | null;
};

// Validate a feature code used in a filesystem path (no traversal).
function safeCode(code: string): string {
  const c = String(code || "").trim();
  if (!/^[A-Za-z0-9_-]+$/.test(c)) throw new Error(`Code tidak valid: ${code}`);
  return c;
}

function slug(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "prd";
}

function ensureRoot(): void {
  if (!existsSync(RESULT_DIR)) mkdirSync(RESULT_DIR, { recursive: true });
}

// All record folders (each must contain meta.json).
function recordDirs(): string[] {
  if (!existsSync(RESULT_DIR)) return [];
  return readdirSync(RESULT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(RESULT_DIR, d.name, "meta.json")))
    .map((d) => d.name);
}

// Find the existing folder for a code (slug may vary if moduleName changed).
function findDirByCode(code: string): string | null {
  const c = safeCode(code);
  for (const name of recordDirs()) {
    try {
      const meta = JSON.parse(readFileSync(join(RESULT_DIR, name, "meta.json"), "utf8")) as Meta;
      if (meta.code === c) return name;
    } catch { /* skip corrupt */ }
  }
  return null;
}

function readMeta(dir: string): Meta {
  return JSON.parse(readFileSync(join(RESULT_DIR, dir, "meta.json"), "utf8")) as Meta;
}

function readIf(dir: string, file: string): string | null {
  const p = join(RESULT_DIR, dir, file);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

export function listPrds(): PrdListItem[] {
  const items: PrdListItem[] = [];
  for (const dir of recordDirs()) {
    try {
      const m = readMeta(dir);
      items.push({ code: m.code, moduleName: m.moduleName, mode: m.mode, hasFlowchart: m.hasFlowchart, updatedAt: m.updatedAt });
    } catch { /* skip corrupt */ }
  }
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPrd(code: string): PrdRecord | null {
  const dir = findDirByCode(code);
  if (!dir) return null;
  const m = readMeta(dir);
  const prdRaw = readIf(dir, "prd.json");
  return {
    ...m,
    prd: prdRaw ? (JSON.parse(prdRaw) as Prd) : null,
    markdown: readIf(dir, "prd.md") || "",
    draft: readIf(dir, "draft.txt"),
    flowchart: readIf(dir, "flowchart.mmd"),
    attachments: m.attachments ?? [],
  };
}

// Upsert by code. Missing fields inherit from existing meta; createdAt & hasFlowchart preserved.
export function savePrd(input: SaveInput): Meta {
  ensureRoot();
  const code = safeCode(input.code);
  const now = new Date().toISOString();
  const existingDir = findDirByCode(code);
  const prev = existingDir ? readMeta(existingDir) : null;

  const moduleName = input.moduleName || prev?.moduleName || code;
  const dir = existingDir || `${code}__${slug(moduleName)}`;
  const abs = join(RESULT_DIR, dir);
  if (!existsSync(abs)) mkdirSync(abs, { recursive: true });

  const meta: Meta = {
    code,
    moduleName,
    cluster: input.cluster ?? prev?.cluster ?? null,
    bpmnFile: input.bpmnFile ?? prev?.bpmnFile ?? null,
    mode: input.mode ?? prev?.mode ?? null,
    hasFlowchart: prev?.hasFlowchart ?? false,
    attachments: prev?.attachments ?? [],
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
  };

  if (input.prd !== undefined && input.prd !== null) {
    writeFileSync(join(abs, "prd.json"), JSON.stringify(input.prd, null, 2), "utf8");
    writeFileSync(join(abs, "prd.md"), input.markdown ?? prdToMarkdown(input.prd), "utf8");
  } else if (input.markdown != null) {
    writeFileSync(join(abs, "prd.md"), input.markdown, "utf8");
  }
  if (input.draft != null) writeFileSync(join(abs, "draft.txt"), input.draft, "utf8");
  if (input.flowchart != null && input.flowchart !== "") {
    writeFileSync(join(abs, "flowchart.mmd"), input.flowchart, "utf8");
    meta.hasFlowchart = true;
  }
  writeFileSync(join(abs, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

// Persist a flowchart for an existing record. Auto-creates a stub folder if the
// PRD record does not exist yet (shouldn't happen — flowchart needs a PRD first).
export function saveFlowchart(code: string, mermaid: string, moduleName?: string): Meta {
  ensureRoot();
  const c = safeCode(code);
  let dir = findDirByCode(c);
  if (!dir) { savePrd({ code: c, moduleName: moduleName || c }); dir = findDirByCode(c)!; }
  const abs = join(RESULT_DIR, dir);
  writeFileSync(join(abs, "flowchart.mmd"), mermaid, "utf8");
  const meta = readMeta(dir);
  meta.hasFlowchart = true;
  meta.updatedAt = new Date().toISOString();
  writeFileSync(join(abs, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

export function deletePrd(code: string): boolean {
  const dir = findDirByCode(code);
  if (!dir) return false;
  rmSync(join(RESULT_DIR, dir), { recursive: true, force: true });
  return true;
}

// Persist raw attachment files under result/<code>/attachments/ and record refs
// in meta.json. Auto-creates a stub PRD folder if needed.
export function saveAttachments(
  code: string,
  files: { name: string; buffer: Buffer; kind: "doc" | "image" }[],
  moduleName?: string
): AttachmentRef[] {
  if (!files.length) return [];
  ensureRoot();
  const c = safeCode(code);
  let dir = findDirByCode(c);
  if (!dir) { savePrd({ code: c, moduleName: moduleName || c }); dir = findDirByCode(c)!; }
  const attDir = join(RESULT_DIR, dir, "attachments");
  if (!existsSync(attDir)) mkdirSync(attDir, { recursive: true });

  const meta = readMeta(dir);
  const refs: AttachmentRef[] = meta.attachments ? [...meta.attachments] : [];
  for (const f of files) {
    const safe = basename(f.name).replace(/[^\w.\- ]+/g, "_");
    writeFileSync(join(attDir, safe), f.buffer);
    if (!refs.some((r) => r.name === safe)) refs.push({ name: safe, kind: f.kind });
  }
  meta.attachments = refs;
  meta.updatedAt = new Date().toISOString();
  writeFileSync(join(RESULT_DIR, dir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
  return refs;
}
