import { readFileSync } from "node:fs";
import { parseBpmn, summarizeFlow } from "./bpmn.mjs";

const file = process.argv[2] || "../bpmn/g-admisi-onsite-registration.json";
const doc = JSON.parse(readFileSync(new URL(file, import.meta.url)));
const model = parseBpmn(doc);
console.log(summarizeFlow(model));
console.log("\n--- STATS ---");
console.log("lanes:", model.lanes.length);
console.log("nodes:", model.nodes.size);
console.log("edges:", model.edges.length, "(handoff:", model.edges.filter(e=>e.handoff).length + ")");
