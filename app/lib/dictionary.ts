import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { prdToMarkdown, featureByCode, type Prd } from "./generate";
import { getPrd, listPrds } from "./store";

// Shared cross-PRD data dictionary — keeps field/entity/integration definitions
// canonical across overlapping modules (e.g. NIP must mean the same everywhere).
// Built by PROGRAMMATIC parsing (no LLM) and injected COMPACT into prompts to
// minimize tokens. Persisted at result/_shared/dictionary.json.
const SHARED_DIR = join(process.cwd(), "result", "_shared");
const DICT_PATH = join(SHARED_DIR, "dictionary.json");

export type FieldDef = {
  field: string; label: string; type: string; validation: string; source: string;
  definedIn: string[]; // feature codes that define this field
};
export type Dictionary = {
  fields: Record<string, FieldDef>;
  entities: Record<string, { label: string; fields: string[]; definedIn: string[] }>;
  integrations: Record<string, string[]>; // name -> codes
};

const KNOWN_INTEGRATIONS: [RegExp, string][] = [
  [/bpjs|vclaim|\bsep\b|aplicares|antrol/i, "BPJS (VClaim/SEP)"],
  [/satu ?sehat/i, "SATUSEHAT"],
  [/disdukcapil|dukcapil/i, "Disdukcapil (NIK)"],
  [/\bocr\b/i, "OCR KTP"],
  [/\blis\b/i, "LIS (Lab)"],
  [/\bris\b|\bpacs\b/i, "RIS/PACS (Radiologi)"],
  [/satusehat|inacbg|ina-?cbg/i, "INA-CBG"],
];

function emptyDict(): Dictionary { return { fields: {}, entities: {}, integrations: {} }; }

export function loadDict(): Dictionary {
  try {
    if (existsSync(DICT_PATH)) return JSON.parse(readFileSync(DICT_PATH, "utf8")) as Dictionary;
  } catch { /* corrupt -> rebuild */ }
  return emptyDict();
}

function saveDict(d: Dictionary): void {
  if (!existsSync(SHARED_DIR)) mkdirSync(SHARED_DIR, { recursive: true });
  writeFileSync(DICT_PATH, JSON.stringify(d, null, 2), "utf8");
}

const norm = (s: string) => (s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const uniqPush = (arr: string[], v: string) => { if (v && !arr.includes(v)) arr.push(v); };

// Split a markdown table row "| a | b |" into trimmed cells.
function cells(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}
const isSep = (line: string) => /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");

// Normalize a section heading into a clean entity/screen label.
// "A. Layar INPUT — Form Tambah/Edit User (trace FR-001–007)" -> "Form Tambah/Edit User"
function cleanHeading(s: string): string {
  let h = s.replace(/[*_`]/g, "").trim();
  h = h.replace(/\([^)]*\)/g, "");                 // drop parentheticals (trace ...)
  const dash = h.lastIndexOf("—") >= 0 ? "—" : (h.lastIndexOf("–") >= 0 ? "–" : "");
  if (dash) h = h.slice(h.lastIndexOf(dash) + 1);  // keep part after the dash
  h = h.replace(/^\s*[A-Z0-9]+[.)]\s*/, "");        // drop "A." / "1)" prefix
  h = h.replace(/\b(layar|tabel)\s+(input|tampil(?:kan)?(?:\s+data)?)\b/gi, "");
  h = h.replace(/\btrace\b.*$/i, "").replace(/\bFR-[\w–-]+/gi, "");
  return h.replace(/\s{2,}/g, " ").trim();
}

// Parse INPUT field tables (header has "field" + "tipe") from PRD markdown.
// Groups each table under its nearest preceding heading (entity/screen label).
type Parsed = {
  fields: { field: string; label: string; type: string; validation: string; source: string; entity: string }[];
  integrations: string[];
};
function parseMarkdown(md: string): Parsed {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: Parsed = { fields: [], integrations: [] };
  let heading = "";
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const h = ln.match(/^\s{0,3}#{2,5}\s+(.*)$/) || ln.match(/^\s*\*\*(.+?)\*\*\s*$/);
    if (h) { heading = cleanHeading(h[1]); continue; }
    if (!ln.includes("|")) continue;
    const head = cells(ln).map((c) => c.toLowerCase());
    const fi = head.findIndex((c) => c === "field");
    const ti = head.findIndex((c) => c.startsWith("tipe"));
    if (fi < 0 || ti < 0) continue;
    if (!isSep(lines[i + 1] || "")) continue; // must be a real table
    const li = head.findIndex((c) => c.startsWith("label"));
    const wi = head.findIndex((c) => c.startsWith("wajib"));
    const vi = head.findIndex((c) => /validasi|format/.test(c));
    const si = head.findIndex((c) => /sumber|default/.test(c));
    for (let j = i + 2; j < lines.length && lines[j].includes("|"); j++) {
      if (isSep(lines[j])) continue;
      const c = cells(lines[j]);
      const field = norm(c[fi] || "");
      if (!field || field === "field") continue;
      out.fields.push({
        field,
        label: (li >= 0 ? c[li] : c[fi]) || "",
        type: (c[ti] || "").toLowerCase(),
        validation: (vi >= 0 ? c[vi] : "") || "",
        source: (si >= 0 ? c[si] : "") || "",
        entity: heading,
      });
    }
  }
  for (const [re, name] of KNOWN_INTEGRATIONS) if (re.test(md)) out.integrations.push(name);
  return out;
}

// Merge one PRD into the shared dictionary (programmatic, no model call).
// First definition wins for a field; later modules just add to definedIn.
export function mergeFromPrd(prd: Prd, code: string): Dictionary {
  const dict = loadDict();
  const md = prdToMarkdown(prd);
  const p = parseMarkdown(md);

  for (const f of p.fields) {
    const cur = dict.fields[f.field];
    if (!cur) {
      dict.fields[f.field] = {
        field: f.field, label: f.label, type: f.type, validation: f.validation,
        source: f.source, definedIn: [code],
      };
    } else {
      uniqPush(cur.definedIn, code);
      // backfill empties from a later, more complete definition
      cur.label ||= f.label; cur.type ||= f.type; cur.validation ||= f.validation; cur.source ||= f.source;
    }
    if (f.entity) {
      const ek = norm(f.entity);
      const e = (dict.entities[ek] ||= { label: f.entity, fields: [], definedIn: [] });
      uniqPush(e.fields, f.field); uniqPush(e.definedIn, code);
    }
  }
  for (const name of p.integrations) {
    const arr = (dict.integrations[name] ||= []);
    uniqPush(arr, code);
  }
  saveDict(dict);
  return dict;
}

function words(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));
}

function codesInDict(d: Dictionary): Set<string> {
  const s = new Set<string>();
  for (const f of Object.values(d.fields)) for (const c of f.definedIn) s.add(c);
  for (const e of Object.values(d.entities)) for (const c of e.definedIn) s.add(c);
  for (const cs of Object.values(d.integrations)) for (const c of cs) s.add(c);
  return s;
}

// Backfill the dictionary from any saved PRD not yet merged (e.g. generated
// before this feature existed). Programmatic parse — no model tokens.
export function backfillDict(): void {
  const have = codesInDict(loadDict());
  for (const it of listPrds()) {
    if (have.has(it.code)) continue;
    const rec = getPrd(it.code);
    if (rec?.prd) mergeFromPrd(rec.prd, it.code);
  }
}

export type FeatureLike = { code: string; cluster: string; module: string; menu: string; fitur: string; notes?: string };

// Cross-cutting identity fields prone to inconsistency — always surfaced when a
// related PRD exists (NIP/NIK etc shared across modules).
const IDENTITY = new Set(["nik", "nip", "nama", "nama_lengkap", "tgl_lahir", "tanggal_lahir", "jenis_kelamin", "no_hp", "email", "alamat", "no_rm", "username", "unit", "unit_id", "jabatan"]);

const featWords = (f: FeatureLike) => words(`${f.module} ${f.menu} ${f.fitur} ${f.notes || ""}`);

// Auto-detect related PRD codes for a module: cluster match + keyword overlap +
// shared integration (against codes already present in the dictionary). Top `limit`.
export function autoRelatedCodes(feat: FeatureLike, limit = 3): string[] {
  backfillDict();
  const dict = loadDict();
  const candidates = new Set(listPrds().map((s) => s.code));
  candidates.delete(feat.code);

  const fw = featWords(feat);
  const featInteg = new Set(
    Object.entries(dict.integrations).filter(([, cs]) => cs.includes(feat.code)).map(([n]) => n)
  );
  const scored: { code: string; s: number }[] = [];
  for (const code of candidates) {
    const cf = featureByCode(code);
    let s = 0;
    if (cf) {
      if (cf.cluster.trim().toLowerCase() === feat.cluster.trim().toLowerCase()) s += 5;
      const cw = featWords(cf as FeatureLike);
      for (const t of fw) if (cw.has(t)) s += 1;
    }
    // shared integration
    for (const [name, cs] of Object.entries(dict.integrations))
      if (cs.includes(code) && featInteg.has(name)) s += 2;
    if (s > 0) scored.push({ code, s });
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.code);
}

// Select the dictionary slice to inject. Related codes = `only` (manual) or
// auto-detected. Then pull fields/entities/integrations from those PRDs, ranking
// identity + widely-shared fields first. Capped for token budget.
export function selectForModule(
  feat: FeatureLike,
  opts: { only?: string[]; maxFields?: number } = {}
): { fields: FieldDef[]; integrations: string[]; entities: { label: string; fields: string[] }[]; relatedCodes: string[] } {
  backfillDict();
  const dict = loadDict();
  const maxFields = opts.maxFields ?? 14;
  const relatedCodes = (opts.only && opts.only.length ? opts.only : autoRelatedCodes(feat))
    .filter((c) => c !== feat.code);
  const rel = new Set(relatedCodes);
  if (!rel.size) return { fields: [], integrations: [], entities: [], relatedCodes: [] };

  const fw = featWords(feat);
  const rank = (f: FieldDef) => {
    const fromRel = f.definedIn.filter((c) => rel.has(c)).length;
    if (!fromRel) return -1;
    let s = fromRel + f.definedIn.length;            // popularity
    if (IDENTITY.has(f.field)) s += 5;               // cross-cutting identity
    const w = words(`${f.field} ${f.label}`); for (const t of fw) if (w.has(t)) s += 1;
    return s;
  };
  const fields = Object.values(dict.fields)
    .map((f) => ({ f, s: rank(f) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, maxFields)
    .map((x) => x.f);

  const integrations = Object.entries(dict.integrations)
    .filter(([, codes]) => codes.some((c) => rel.has(c)))
    .map(([name]) => name);

  const entities = Object.values(dict.entities)
    .filter((e) => e.definedIn.some((c) => rel.has(c)))
    .slice(0, 4)
    .map((e) => ({ label: e.label, fields: e.fields }));

  return { fields, integrations, entities, relatedCodes };
}

// Render a COMPACT context block (1 line/field). Hard char budget to cap tokens.
export function renderContext(
  slice: ReturnType<typeof selectForModule>,
  budget = 2200
): string {
  if (!slice.fields.length && !slice.integrations.length && !slice.entities.length) return "";
  const L: string[] = [];
  L.push("## Konteks PRD terkait (WAJIB konsisten)");
  L.push("Field/entitas/integrasi di bawah SUDAH didefinisikan di modul lain. Pakai nama, tipe, format, dan validasi yang SAMA. Jangan buat definisi tandingan. Bila perlu beda → tandai [PERLU KONFIRMASI].");
  if (slice.fields.length) {
    L.push("\n### Field kanonik");
    for (const f of slice.fields) {
      const parts = [f.type, f.validation].filter(Boolean).join(", ");
      L.push(`- ${f.field} (${f.label})${parts ? ` — ${parts}` : ""}${f.source ? ` [sumber: ${f.source}]` : ""} {dari: ${f.definedIn.join(",")}}`);
    }
  }
  if (slice.entities.length) {
    L.push("\n### Entitas / master data");
    for (const e of slice.entities) L.push(`- ${e.label}: ${e.fields.slice(0, 10).join(", ")}`);
  }
  if (slice.integrations.length) {
    L.push("\n### Integrasi dipakai bersama");
    L.push(`- ${slice.integrations.join("; ")}`);
  }
  let out = L.join("\n");
  if (out.length > budget) out = out.slice(0, budget) + "\n…(dipotong, hemat token)";
  return out;
}

// Convenience: build the injectable context for a feature in one call.
export function relatedContextFor(feat: FeatureLike, only?: string[]): string {
  return renderContext(selectForModule(feat, { only }));
}
