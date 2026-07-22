// Prompt builder: skill (system) + draft PRD + BPMN summary + related features (user).
import { readFileSync } from "node:fs";
import { parseBpmn, summarizeFlow } from "./bpmn.mjs";

const ROOT = new URL("../", import.meta.url);

export function loadSkill() {
  return readFileSync(new URL("skill/system-analyst-prd.md", ROOT), "utf8");
}

export function loadFeatures() {
  return JSON.parse(readFileSync(new URL("data/features-mvp.json", ROOT), "utf8"));
}

// Pick feature rows relevant to a module by matching keywords against
// cluster/module/menu/fitur (case-insensitive).
export function relevantFeatures(keywords) {
  const ks = keywords.map((k) => k.toLowerCase());
  return loadFeatures().filter((f) => {
    const hay = `${f.cluster} ${f.module} ${f.menu} ${f.fitur}`.toLowerCase();
    return ks.some((k) => hay.includes(k));
  });
}

function featuresToText(rows) {
  if (!rows.length) return "(tidak ada fitur terkait yang cocok)";
  return rows
    .map((f) => `- [${f.code}] ${f.cluster} > ${f.module}${f.menu ? " > " + f.menu : ""}${f.fitur ? " > " + f.fitur : ""}${f.notes ? ` (catatan: ${f.notes})` : ""}`)
    .join("\n");
}

/**
 * Build {system, user} for one PRD generation.
 * @param {object} o
 * @param {string} o.bpmnFile  - path to a bpmn JSON (relative to repo root)
 * @param {string} o.draft     - simple draft PRD text from user
 * @param {string[]} o.featureKeywords - keywords to pick related features
 * @param {string} o.moduleName - human module name for the PRD title
 */
export function buildPrompt({ bpmnFile, draft, featureKeywords = [], moduleName }) {
  const doc = JSON.parse(readFileSync(new URL(bpmnFile, ROOT), "utf8"));
  const flow = summarizeFlow(parseBpmn(doc));
  const feats = featuresToText(relevantFeatures(featureKeywords));

  const system = loadSkill();
  const user = `Buatkan PRD lengkap untuk modul: **${moduleName}**.

Ikuti struktur PRD di bagian 5 skill. Keluarkan **markdown** lengkap (bukan JSON) untuk validasi awal ini.

## 1. Draft PRD sederhana (dari user)
${draft.trim()}

## 2. Ringkasan alur proses (hasil parse BPMN: ${bpmnFile})
${flow}

## 3. Fitur terkait (dari List Fitur, sheet MVP)
${feats}

Catatan: tandai asumsi dengan [ASUMSI] dan hal yang perlu dikonfirmasi dengan [PERLU KONFIRMASI]. Beri ID pada requirement (FR-/NFR-/BR-/US-) dan traceability ke task BPMN.`;

  return { system, user };
}
