import {
  loadSkill, runApi, runClaudeCode, pickEngine, parsePrdJson, SKILL_PRD,
  type Prd,
} from "./generate";

export type RefineInput = {
  prd: Prd;            // the already-generated PRD to develop further
  instruction: string; // user's prompt: what to expand / add / change
  moduleName?: string;
};

// Ask the model to DEVELOP an existing PRD per the user's instruction and return
// the FULL updated PRD JSON (not a diff) so the UI can replace it wholesale.
export function buildRefinePrompt(o: RefineInput): { system: string; user: string } {
  const system = loadSkill();
  const current = JSON.stringify(o.prd, null, 2);
  const user = `Kamu sudah membuat PRD berikut${o.moduleName ? ` untuk modul **${o.moduleName}**` : ""}. Sekarang **kembangkan / perdalam** PRD ini sesuai instruksi user di bawah — bukan menulis ulang dari nol.

## Instruksi pengembangan (dari user)
${o.instruction.trim()}

## PRD saat ini (JSON)
\`\`\`json
${current}
\`\`\`

Aturan:
- Pertahankan section & isi yang sudah baik; tambahkan/perdalam yang diminta instruksi.
- Boleh menambah section baru bila relevan, jaga penomoran tetap rapi.
- Tetap pakai ID requirement (FR-/NFR-/BR-/US-) & traceability. Tandai [ASUMSI]/[PERLU KONFIRMASI] bila perlu.
- Keluarkan **HANYA satu objek JSON valid** dengan bentuk yang SAMA (title, meta, sections[], open_questions[], assumptions[]). Tanpa pagar \`\`\`, tanpa teks lain.`;
  return { system, user };
}

// Develop an existing PRD. Returns updated Prd (or null if JSON unparseable).
export async function refinePrd(o: RefineInput): Promise<{ prd: Prd | null; engine: string; raw: string }> {
  const { system, user } = buildRefinePrompt(o);
  const engine = pickEngine();
  if (engine === "preview") {
    return { prd: o.prd, engine: "preview", raw: user };
  }
  const raw = engine === "api"
    ? await runApi(system, user)
    : await runClaudeCode(user, SKILL_PRD, { raw: true });
  return { prd: parsePrdJson(raw), engine, raw };
}
