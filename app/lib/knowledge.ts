import { readFileSync } from "node:fs";
import { join } from "node:path";
// @ts-expect-error - plain ESM JS module, no type declarations
import { parseBpmn, summarizeFlow } from "../../lib/bpmn.mjs";
import { listBpmn } from "./generate";

const ROOT = process.cwd();
const BPMN_DIR = join(ROOT, "bpmn");

// Integration systems to detect across all BPMN (domain knowledge signal).
const INTEGRATIONS: [RegExp, string][] = [
  [/bpjs|vclaim|sep\b|eligibilit/i, "BPJS (VClaim/SEP)"],
  [/satu ?sehat|satusehat/i, "SATUSEHAT"],
  [/disdukcapil|\bnik\b|dukcapil/i, "Disdukcapil (NIK)"],
  [/\bocr\b|scan ktp/i, "OCR KTP"],
  [/\blis\b/i, "LIS (Lab)"],
  [/\bris\b|\bpacs\b/i, "RIS/PACS (Radiologi)"],
  [/biometrik|fingerprint/i, "Biometrik"],
  [/antri|antrean|antrian/i, "Antrian"],
  [/billing|tagihan|kasir|piutang/i, "Billing/Kasir"],
];

// Map a bpmn filename to a coarse domain matching feature clusters.
function domainOf(file: string): string {
  if (file.startsWith("g-admisi")) return "Admisi";
  if (file.startsWith("g-emr")) return "EMR";
  if (file.startsWith("g-service")) return "Pelayanan utama";
  if (file.startsWith("g-support")) return "Pelayanan Pendukung";
  if (file.startsWith("g-backoffice")) return "Backoffice";
  return "Lainnya";
}

export type BpmnKnowledge = {
  file: string;
  domain: string;
  title: string;
  actors: string[];
  activities: string[];
  decisions: string[];     // gateway questions / decision labels
  integrations: string[];
};

let CACHE: BpmnKnowledge[] | null = null;

export function buildKnowledge(): BpmnKnowledge[] {
  if (CACHE) return CACHE;
  const out: BpmnKnowledge[] = [];
  for (const file of listBpmn()) {
    try {
      const doc = JSON.parse(readFileSync(join(BPMN_DIR, file), "utf8"));
      const m = parseBpmn(doc);
      const activities = [...m.nodes.values()]
        .filter((n: { kind: string; text: string }) => n.kind === "activity" && n.text)
        .map((n: { text: string }) => n.text);
      const decisions = [
        ...(m.questions || []),
        ...[...m.nodes.values()]
          .filter((n: { kind: string; text: string }) => n.kind === "gateway" && n.text)
          .map((n: { text: string }) => n.text),
      ];
      const hay = `${m.title} ${activities.join(" ")} ${decisions.join(" ")}`;
      const integrations = INTEGRATIONS.filter(([re]) => re.test(hay)).map(([, name]) => name);
      out.push({
        file,
        domain: domainOf(file),
        title: m.title,
        actors: m.lanes.map((l: { name: string }) => l.name),
        activities,
        decisions: [...new Set(decisions)],
        integrations,
      });
    } catch { /* skip unreadable */ }
  }
  CACHE = out;
  return out;
}

// Compact text summary of one BPMN (for prompt injection).
function compact(k: BpmnKnowledge, maxActs = 14): string {
  const acts = k.activities.slice(0, maxActs);
  const more = k.activities.length > maxActs ? ` (+${k.activities.length - maxActs} lagi)` : "";
  return [
    `### ${k.title}  [${k.domain}]`,
    k.actors.length ? `Aktor: ${k.actors.join(", ")}` : "",
    k.integrations.length ? `Integrasi: ${k.integrations.join(", ")}` : "",
    acts.length ? `Aktivitas kunci: ${acts.join("; ")}${more}` : "",
    k.decisions.length ? `Keputusan: ${k.decisions.slice(0, 8).join("; ")}` : "",
  ].filter(Boolean).join("\n");
}

// Token-ish keyword set from a string.
function words(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3)
  );
}

/**
 * Select BPMN knowledge relevant to a feature that has NO dedicated BPMN.
 * Scores by: same domain (cluster), keyword overlap (module/menu/fitur vs
 * activities/title), and shared integrations.
 */
export function selectRelevant(
  feat: { cluster: string; module: string; menu: string; fitur: string; notes?: string },
  limit = 6
): BpmnKnowledge[] {
  const kb = buildKnowledge();
  const fw = words(`${feat.module} ${feat.menu} ${feat.fitur} ${feat.notes || ""}`);
  const featInteg = INTEGRATIONS.filter(([re]) => re.test(`${feat.module} ${feat.menu} ${feat.fitur} ${feat.notes || ""}`)).map(([, n]) => n);

  const scored = kb.map((k) => {
    let score = 0;
    if (k.domain.toLowerCase() === feat.cluster.trim().toLowerCase()) score += 5;
    const kw = words(`${k.title} ${k.activities.join(" ")}`);
    for (const w of fw) if (kw.has(w)) score += 1;
    for (const i of k.integrations) if (featInteg.includes(i)) score += 2;
    return { k, score };
  });
  scored.sort((a, b) => b.score - a.score);
  // Only return diagrams with real relevance (score > 0). If nothing scores,
  // return [] — better no context than misleading off-topic filler; the skill
  // system prompt already carries SIMRS domain knowledge (SATUSEHAT/BPJS/etc).
  return scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.k);
}

export function knowledgeText(rows: BpmnKnowledge[]): string {
  if (!rows.length) return "(tidak ada pengetahuan BPMN relevan)";
  return rows.map((k) => compact(k)).join("\n\n");
}
