import { join } from "node:path";
import { readFileSync } from "node:fs";
import {
  runApi, runClaudeCode, pickEngine, prdToMarkdown, type Prd,
} from "./generate";

const ROOT = process.cwd();
const SKILL_FLOWCHART = join(ROOT, "skill", "flowchart-designer.md");

function flowchartSkill(): string {
  return readFileSync(SKILL_FLOWCHART, "utf8");
}

export type FlowchartInput = { prd: Prd; moduleName?: string };

// Build the flowchart prompt FROM the generated PRD (source of truth), not from
// raw BPMN/overview. We pass the PRD as readable markdown so the model maps
// business process / rules / FR / user stories / integrations into the flow.
export function buildFlowchartPrompt(o: FlowchartInput): { system: string; user: string } {
  const system = flowchartSkill();
  const doc = prdToMarkdown(o.prd);
  const user = `Buatkan **flowchart system** (Mermaid) yang menggambarkan alur sistem dari **PRD berikut**${o.moduleName ? ` (modul: ${o.moduleName})` : ""}.
Audiens: tim UI/UX. Turunkan flowchart HANYA dari isi PRD ini — jangan mengarang alur di luar PRD.

## PRD (sumber kebenaran)
${doc}

Keluarkan HANYA satu blok \`\`\`mermaid flowchart sesuai aturan skill, setia pada PRD di atas.`;
  return { system, user };
}

// Extract the mermaid code from model output (strips ```mermaid fences or prose).
export function extractMermaid(raw: string): string {
  const s = raw.trim();
  const fence = s.match(/```(?:mermaid)?\s*([\s\S]*?)```/i);
  let code = fence ? fence[1].trim() : s;
  // If no fence and prose leaked, slice from the first flowchart/graph keyword.
  if (!fence) {
    const i = code.search(/^\s*(flowchart|graph)\s/im);
    if (i > 0) code = code.slice(i).trim();
  }
  return code;
}

// Generate a Mermaid flowchart from a PRD. Returns raw mermaid code.
export async function generateFlowchart(o: FlowchartInput): Promise<{ mermaid: string; engine: string }> {
  const engine = pickEngine();
  if (engine === "preview") {
    return { mermaid: `flowchart TD\n  P[Preview mode - prompt rakitan]`, engine: "preview" };
  }
  const { system, user } = buildFlowchartPrompt(o);
  const raw = engine === "api"
    ? await runApi(system, user)
    : await runClaudeCode(user, SKILL_FLOWCHART, { raw: true });
  return { mermaid: extractMermaid(raw), engine };
}
