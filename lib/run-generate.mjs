// Standalone runner: build prompt, call Claude (streaming), write PRD markdown.
// Usage (PowerShell): fnm use 22; node lib/run-generate.mjs
import { writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt } from "./prompt.mjs";

const { system, user } = buildPrompt({
  bpmnFile: "bpmn/g-admisi-onsite-registration.json",
  moduleName: "Pendaftaran Pasien Onsite (Rawat Jalan)",
  featureKeywords: ["admisi", "pendaftaran", "pasien"],
  draft: `Modul pendaftaran pasien rawat jalan onsite untuk RS tipe C.
Tujuan: percepat registrasi, kurangi duplikasi rekam medis, validasi BPJS otomatis,
integrasi Disdukcapil (NIK) dan SATUSEHAT. Mendukung pasien baru & lama,
penjaminan umum/BPJS/asuransi, screening gejala (batuk/demam), dan antrian poli.`,
});

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

console.error("Calling Claude (streaming)...");
const stream = client.messages.stream({
  model: "claude-opus-4-8",
  max_tokens: 32000,
  thinking: { type: "adaptive" },
  system,
  messages: [{ role: "user", content: user }],
});

stream.on("text", (t) => process.stderr.write(t)); // live progress to stderr

const final = await stream.finalMessage();
const md = final.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
writeFileSync(new URL("../out/prd-admisi-onsite.md", import.meta.url), md);
console.error(`\n\n--- DONE ---`);
console.error("tokens:", JSON.stringify(final.usage));
console.error("saved: out/prd-admisi-onsite.md");
