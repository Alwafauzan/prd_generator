// Document attachment extraction → plain text for PRD prompt injection.
// Supported: .txt/.md/.csv (native), .pdf (pdf-parse), .docx (mammoth),
// .xlsx/.xls (SheetJS). Images are NOT handled here (vision, fase 2).

export type DocInput = { name: string; mime: string; buffer: Buffer };
export type ExtractedDoc = { name: string; text: string; chars: number; truncated: boolean };

// Per-file and total char budgets — keep prompt token cost bounded.
const PER_FILE_CAP = 6000;
const TOTAL_CAP = 16000;

const DOC_EXT = /\.(txt|md|markdown|csv|pdf|docx|xlsx|xls)$/i;

export function isSupportedDoc(name: string, mime?: string): boolean {
  if (DOC_EXT.test(name)) return true;
  return !!mime && /(text\/|pdf|wordprocessingml|spreadsheetml|ms-excel)/i.test(mime);
}

function ext(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

async function extractOne(doc: DocInput): Promise<string> {
  const e = ext(doc.name);
  if (e === "txt" || e === "md" || e === "markdown" || e === "csv") {
    return doc.buffer.toString("utf8");
  }
  if (e === "pdf") {
    // pdf-parse v2 is class-based: new PDFParse({ data }).getText() -> { text }.
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(doc.buffer) });
    try {
      const r = await parser.getText();
      return r.text || "";
    } finally {
      await parser.destroy().catch(() => {});
    }
  }
  if (e === "docx") {
    const mammoth = await import("mammoth");
    const r = await mammoth.extractRawText({ buffer: doc.buffer });
    return r.value || "";
  }
  if (e === "xlsx" || e === "xls") {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(doc.buffer, { type: "buffer" });
    const parts: string[] = [];
    for (const sheet of wb.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheet]);
      if (csv.trim()) parts.push(`# Sheet: ${sheet}\n${csv}`);
    }
    return parts.join("\n\n");
  }
  throw new Error(`Format tidak didukung: ${doc.name}`);
}

// Extract all docs, applying per-file + total budget. Errors per file are
// captured inline (so one bad file doesn't kill the whole generate).
export async function extractDocs(docs: DocInput[]): Promise<ExtractedDoc[]> {
  const out: ExtractedDoc[] = [];
  let total = 0;
  for (const d of docs) {
    let text = "";
    try {
      text = (await extractOne(d)).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
    } catch (e) {
      text = `[gagal ekstrak: ${e instanceof Error ? e.message : String(e)}]`;
    }
    let truncated = false;
    if (text.length > PER_FILE_CAP) { text = text.slice(0, PER_FILE_CAP); truncated = true; }
    if (total + text.length > TOTAL_CAP) { text = text.slice(0, Math.max(0, TOTAL_CAP - total)); truncated = true; }
    total += text.length;
    out.push({ name: d.name, text, chars: text.length, truncated });
    if (total >= TOTAL_CAP) break;
  }
  return out;
}

// Render extracted docs as a prompt block. Empty string if none.
export function renderDocsBlock(docs: ExtractedDoc[]): string {
  if (!docs.length) return "";
  const L: string[] = ["## Lampiran Dokumen (bahan tambahan dari user)"];
  L.push("Gunakan isi dokumen di bawah sebagai sumber requirement/konteks. Bila menafsirkan, tandai [ASUMSI].");
  for (const d of docs) {
    L.push(`\n### ${d.name}${d.truncated ? " (dipotong)" : ""}`);
    L.push(d.text || "(kosong)");
  }
  return L.join("\n");
}
