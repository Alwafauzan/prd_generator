import { readFileSync, readdirSync } from "node:fs";
import { parseBpmn, summarizeFlow } from "./bpmn.mjs";
const dir = new URL("../bpmn/", import.meta.url);
const files = readdirSync(dir).filter(f => f.endsWith(".json"));
let ok=0, fail=0;
for (const f of files) {
  try {
    const doc = JSON.parse(readFileSync(new URL(f, dir)));
    const m = parseBpmn(doc);
    const s = summarizeFlow(m);
    const acts = [...m.nodes.values()].filter(n=>n.kind==="activity").length;
    const noLane = [...m.nodes.values()].filter(n=>n.kind==="activity"&&!n.actor).length;
    console.log(`OK  ${f.padEnd(42)} lanes=${m.lanes.length} act=${acts} noLane=${noLane} edges=${m.edges.length} q=${m.questions.length} sumLen=${s.length}`);
    ok++;
  } catch(e){ console.log(`FAIL ${f}: ${e.message}`); fail++; }
}
console.log(`\nTOTAL ok=${ok} fail=${fail}`);
