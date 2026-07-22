# CLAUDE.md — PRD Generator SIMRS

Panduan untuk Claude Code / developer saat melanjutkan project ini. Berisi arsitektur,
alur data, konvensi, dan catatan penting hasil analisis kode.

---

## 1. Tujuan project

Web tool yang **menghasilkan PRD (Product Requirement Document) SIMRS** untuk RS Tipe C & D
secara otomatis. Input = pilih kode fitur + (opsional) file BPMN + draft. Output = PRD
terstruktur (JSON → render markdown). Persona generator = **System Analyst senior SIMRS**.

Fitur turunan:
- **Generate Flowchart** (Mermaid) untuk tim UI/UX — diturunkan **dari PRD** yang sudah ada.
- **Kembangkan PRD** (refine) — prompt untuk memperdalam/menambah konteks PRD existing.

Target audiens output: manajemen RS, developer, dan tim UI/UX.

## 2. Tech stack

- **Next.js 14** (App Router), React 18, TypeScript.
- **@anthropic-ai/sdk** (engine API) + **Claude Code CLI** (engine default).
- **Penyimpanan = file-based** di folder `result/` (lihat §7). Tanpa database.
- **mermaid** — render flowchart client-side.
- Platform dev: **Windows** (PowerShell + Git Bash). Model: `claude-opus-4-8`.

## 3. Cara menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

**Pemilihan engine** (di `app/lib/generate.ts` → `pickEngine()`):
1. `PRD_ENGINE` env (`api` | `claude-code` | `preview`) menang bila diset.
2. Else `api` bila ada `ANTHROPIC_API_KEY`.
3. Else **`claude-code`** (default) — spawn `claude -p` pakai login Claude Code user
   (tanpa billing API terpisah). Butuh CLI `claude` terinstal & login.

**Penyimpanan**: file-based, **tanpa setup**. Tiap generate auto-tulis ke `result/`
(lihat §7). Tidak butuh database/docker.

## 4. Arsitektur & alur data

```
data/features-mvp.json  ─┐
bpmn/*.json (Lucidchart) ─┼─► buildContext() ─► buildPrompt() ─► engine ─► parsePrdJson() ─► Prd ─► UI render
skill/*.md (system prompt)┘                                                         │
                                                                                    ├─► prdToMarkdown() ─► download .md
                                                                                    ├─► /api/flowchart (dari Prd) ─► Mermaid
                                                                                    └─► /api/refine (Prd + instruksi) ─► Prd baru
```

### Tiga pipeline (semua share engine runner)
| Pipeline | Lib | Route | System prompt | Output |
|----------|-----|-------|---------------|--------|
| Generate PRD | `app/lib/generate.ts` | `app/api/generate` | `skill/system-analyst-prd.md` | `Prd` JSON |
| Flowchart | `app/lib/flowchart.ts` | `app/api/flowchart` | `skill/flowchart-designer.md` | Mermaid (string) |
| Kembangkan PRD | `app/lib/refine.ts` | `app/api/refine` | `skill/system-analyst-prd.md` | `Prd` JSON |

### Engine runner (generic, di `generate.ts`)
- `runClaudeCode(user, systemFile, {raw})` — spawn `claude -p --output-format text --system-prompt-file <skill>`, user via stdin, timeout 5 mnt. `raw:true` untuk JSON/mermaid (skip preamble strip).
- `runApi(system, user)` — Anthropic SDK streaming, `claude-opus-4-8`, `max_tokens:32000`, thinking adaptive.
- `pickEngine()` — lihat §3.
- `buildContext(o)` — bangun blok konteks (ringkasan BPMN **atau** knowledge base lintas-proses + fitur se-cluster). Dipakai bersama oleh PRD prompt.

### Knowledge mode (BPMN kosong)
Jika fitur tak punya BPMN sendiri, `app/lib/knowledge.ts` memilih BPMN relevan
(skor: domain/cluster sama + overlap keyword + integrasi sama) sebagai acuan analogi.
Integrasi dideteksi via regex (BPJS, SATUSEHAT, Disdukcapil, LIS, RIS/PACS, dll).

## 5. Struktur direktori

```
app/
  page.tsx              # UI utama (client) — form, hasil PRD, flowchart, kembangkan PRD
  layout.tsx, globals.css
  components/Mermaid.tsx # render mermaid client-side (dynamic import) + copy + mermaid.live
  api/
    generate/route.ts   # POST: generate PRD
    flowchart/route.ts  # POST: generate flowchart dari PRD
    refine/route.ts     # POST: kembangkan PRD
    options/route.ts    # GET: daftar fitur + bpmn (untuk dropdown)
    related/route.ts    # GET ?code= : kandidat PRD terkait (auto-flag) utk picker konsistensi
    prd/route.ts        # GET list / POST simpan (file store)
    prd/[id]/route.ts   # GET/PUT/DELETE per PRD — param [id] = feature `code`
  lib/
    generate.ts         # inti: prompt, engine, parse JSON, prdToMarkdown
    flowchart.ts        # prompt + generate flowchart (input = Prd)
    refine.ts           # prompt + refine PRD
    knowledge.ts        # knowledge base lintas-BPMN (knowledge mode)
    store.ts            # CRUD file-based di result/ (ganti db.ts) + attachments
    dictionary.ts       # kamus field/entitas lintas-PRD (konsistensi, hemat token)
    attachments.ts      # ekstraksi dokumen (pdf/docx/xlsx/txt) → teks utk prompt
lib/                    # PROTOTIPE STANDALONE node (legacy, lihat §9)
  bpmn.mjs              # parser BPMN Lucidchart — DIPAKAI app/lib (shared, jangan hapus)
  prompt.mjs, run-generate.mjs, test-*.mjs  # CLI lama, tidak dipakai web app
skill/
  system-analyst-prd.md # system prompt PRD ("otak" tool)
  flowchart-designer.md # system prompt flowchart
data/features-mvp.json  # 204 fitur (List Fitur V2.xlsx sheet MVP)
bpmn/*.json             # 49 BPMN (Lucidchart export); bpmn/json/ = sub-folder lain
result/                 # PENYIMPANAN — 1 folder per PRD (di-commit ke git)
example_prd/            # contoh PRD acuan struktur
out/                    # output runner standalone (gitignored)
```

## 6. Model data & konvensi

### Tipe `Prd` (`app/lib/generate.ts`)
```ts
type Prd = {
  title: string;
  meta?: { related_document?; version?; date? };
  sections: { id: string; title: string; content_md: string }[];
  open_questions?: string[];
  assumptions?: string[];
};
```
Section dirender dinamis di `page.tsx` (`prd.sections.map`) — **menambah section di skill
otomatis tampil di UI**, tak perlu ubah UI.

### Struktur section PRD (driver = `JSON_SCHEMA_HINT` di `generate.ts`, format `json`)
1 Overview · 2 Background · 3 In Scope · 4 Goals/Metrics · 5 Related Feature ·
6 Business Process (As-Is/To-Be) · 7 Main Flow · 8 Business Rules · 9 User Stories ·
10 Functional Req · **11 Data Requirements (spesifikasi field)** · 12 Non-Functional Req ·
13 Integrasi Eksternal.
> `JSON_SCHEMA_HINT` adalah **sumber kebenaran** struktur saat `format:"json"`. Daftar di
> `skill/system-analyst-prd.md` §6 sifatnya naratif/dokumentasi — selaraskan keduanya bila ubah.

### Konvensi penulisan (dipakai skill)
- Bahasa Indonesia. ID requirement: `FR-` / `NFR-` / `BR-` / `US-` + traceability ke task BPMN.
- Tandai `[ASUMSI]` dan `[PERLU KONFIRMASI]` (jangan mengarang regulasi/angka).
- **Data Requirements (skill §5.1)**: tiap layar INPUT → tabel `Field|Label|Tipe|Wajib|Validasi|Sumber|Catatan`; tiap layar TAMPIL (dashboard/list) → tabel `Kolom|Sumber Data|Format|Filter/Sort|Catatan`. Field tak pasti → `[PERLU KONFIRMASI]`, jangan kosong.

### Parsing JSON dari LLM
`parsePrdJson()` robust: slice `{..}` terluar + `repairJson()` (escape newline/tab mentah di
dalam string). `parseBpmn()`/`summarizeFlow()` di `lib/bpmn.mjs` mengubah Lucidchart JSON →
ringkasan alur (aktor/lane, aktivitas, gateway, edge berlabel, urut dari start).

## 7. Penyimpanan — file-based (`result/`)

Implementasi di `app/lib/store.ts`. **Tanpa database.**

**Layout** — 1 folder per `code`:
```
result/<code>__<slug-moduleName>/
  meta.json       # {code, moduleName, cluster, bpmnFile, mode, hasFlowchart, createdAt, updatedAt}
  prd.json        # Prd object (sumber kebenaran)
  prd.md          # markdown render
  flowchart.mmd   # mermaid (kalau ada)
  draft.txt       # draft input user
  attachments/    # dokumen pendukung yg di-upload (pdf/docx/xlsx/txt) — §7.2
result/_shared/dictionary.json   # kamus field/entitas/integrasi lintas-PRD (§7.1)
```

**Aturan**:
- **Key = `code`** (string). Folder dicari via scan `meta.json` (slug boleh berubah).
- **Auto-write**: setiap Generate PRD / Flowchart / Kembangkan PRD langsung tulis (upsert by code).
- **Edit manual + Simpan** → overwrite file yang sama. Satu folder per code (tanpa versi).
- `savePrd()` upsert: field kosong diwarisi dari meta lama; `createdAt` & `hasFlowchart` dipertahankan.
- `result/` **di-commit ke git** (bukan di-ignore). `result/.gitkeep` menjaga folder.

**Fungsi store**: `listPrds()`, `getPrd(code)`, `savePrd(input)`, `saveFlowchart(code, mmd)`, `deletePrd(code)`.

**Route param**: `app/api/prd/[id]` — `[id]` membawa **`code`** (bukan id numeric).

> Catatan migrasi: `app/lib/db.ts`, `pg`, `docker-compose.yml`, `db/schema.sql`,
> `DATABASE_URL` sudah **dihapus**. `id` numeric lama → `code` string.

## 7.1. Konsistensi lintas-PRD (kamus, hemat token)

Implementasi `app/lib/dictionary.ts` + `result/_shared/dictionary.json`. Tujuan: PRD
yang beririsan pakai definisi field SAMA (mis. `nip` = 18 digit unik di Staff & User).

**Mekanisme hemat token** (lihat juga diskusi di histori):
- **Ekstraksi programatik (0 token model)**: parse tabel Data Requirements + integrasi
  dari markdown PRD via regex (`parseMarkdown`). Tidak ada panggilan LLM untuk meringkas.
- **Kamus incremental**: `mergeFromPrd(prd, code)` dipanggil tiap save (generate/refine/edit
  PUT). Field keyed by nama; definisi pertama menang, modul lain hanya menambah `definedIn`.
- **`backfillDict()`**: PRD lama yang belum termasuk (mis. dibuat sebelum fitur ini) di-merge
  otomatis saat dipakai — idempotent.
- **Suntik ringkas**: `selectForModule(feat, {only})` pilih slice relevan (related code =
  manual `only` ATAU `autoRelatedCodes` = cluster/keyword/integrasi overlap, **maks 3**),
  ranking identity-field (NIP/NIK/dst) + popularitas, cap `maxFields`. `renderContext()`
  emit **1 baris/field** dengan budget char keras (~2200) → blok `## Konteks PRD terkait
  (WAJIB konsisten)` masuk prompt (`GenInput.relatedContext`).

**Alur**: pilih code di UI → `GET /api/related?code=` → checkbox pra-centang (auto) →
`relatedCodes` dikirim ke `/api/generate` → `relatedContextFor()` rakit blok → inject.

**Aturan model**: di `skill/system-analyst-prd.md` (§4) — hormati blok konteks terkait,
reuse field, beda → `[PERLU KONFIRMASI]`.

**Catatan**: auto-detect lemah utk modul lintas-cluster yang labelnya terlalu pendek
(target belum ada di kamus saat generate) → andalkan **pilih manual** di picker.

## 7.2. Lampiran dokumen (bahan generate)

Implementasi `app/lib/attachments.ts` + `saveAttachments()` di store. User upload
dokumen pendukung (SOP, regulasi, draft, daftar field) → diekstrak jadi teks →
diinject ke prompt generate. **Gambar/vision = fase 2 (belum ada).**

- **Format**: `.txt/.md/.csv` (native), `.pdf` (pdf-parse), `.docx` (mammoth),
  `.xlsx/.xls` (SheetJS) — `extractDocs()`.
- **Budget token**: cap per-file 6000 char + total 16000 char (truncate). Blok
  `## Lampiran Dokumen` masuk `GenInput.docsBlock` → `buildPrompt`.
- **Transport**: `/api/generate` terima **multipart/form-data** (field `documents`)
  ATAU JSON (tanpa file) — `readBody()` deteksi via content-type. Maks 10MB/file.
- **Simpan**: file mentah → `result/<code>/attachments/`, dicatat di
  `meta.attachments[{name,kind}]`. Termuat lagi saat load (`getPrd`).
- **Aturan model**: `skill/system-analyst-prd.md` §4 — lampiran = sumber utama,
  tafsir → `[ASUMSI]`, konflik dgn BPMN → `[PERLU KONFIRMASI]`.
- **GOTCHA pdf-parse**: pakai v2 (class `new PDFParse({data}).getText()`, BUKAN
  `pdf(buffer)`). pdfjs-dist RUSAK bila di-webpack-bundle ("Object.defineProperty
  called on non-object") → `next.config.mjs` `serverComponentsExternalPackages`
  WAJIB memuat `pdf-parse`,`pdfjs-dist`,`mammoth`,`xlsx`. Ubah config = restart dev.
- **Batas**: PDF hasil scan (gambar) tak terekstrak (perlu OCR — belum ada).

## 8. Catatan penting / gotcha

- **Windows**: `runClaudeCode` pakai `spawn("claude", {shell:true})` agar shim `.cmd/.ps1`
  ter-resolve. Bash tool = Git Bash (POSIX); PowerShell = shell utama.
- **Belum git init** (per environment). Untuk commit `result/`, jalankan `git init` dulu.
- **tsc `--noEmit` error pre-existing** (app tetap jalan via SWC, `skipLibCheck`):
  - `lib/bpmn.mjs` plain JS tanpa tipe → `@ts-expect-error` & properti `.questions`/`.lanes`.
  - `runApi` map `ContentBlock` union (ThinkingBlock tak punya `.text`) — perlu type guard.
- **Inkonsistensi data**: `features-mvp.json` punya cluster `"Pelayanan utama"` (1 baris) vs
  `"Pelayanan Utama"` (22). Pencocokan cluster sudah case-insensitive+trim, jadi aman; tetap
  rapikan bila menyentuh data.
- **mermaid** = dependency client-only, di-`import()` dinamis di `components/Mermaid.tsx`
  agar tak masuk server bundle. Edit flowchart = live re-render (invalid sementara → tampil
  error + raw code, pulih saat valid).
- Engine `claude-code` lambat (~1–2 mnt/generate), timeout 5 mnt.

## 9. Kode legacy (`lib/*.mjs`)

Prototipe CLI standalone awal:
- `lib/bpmn.mjs` — **MASIH DIPAKAI** (di-import `app/lib/generate.ts` & `knowledge.ts`). Jangan hapus.
- `lib/prompt.mjs`, `lib/run-generate.mjs`, `lib/test-*.mjs` — runner/test node lama,
  **tidak dipakai web app**. Logikanya sudah di-port ke `app/lib/`. Boleh diabaikan saat
  dev web, simpan untuk referensi/regresi.

## 10. Saat menambah fitur

- **Section PRD baru** → edit `JSON_SCHEMA_HINT` (`generate.ts`) + selaraskan `skill/system-analyst-prd.md`. UI otomatis render.
- **Aturan PRD baru** (gaya, field, dll) → edit `skill/system-analyst-prd.md`; berlaku ke
  Generate **dan** Kembangkan PRD (keduanya pakai skill ini).
- **Pipeline LLM baru** → reuse `runClaudeCode`/`runApi`/`pickEngine` + buat skill `.md` +
  route + (opsional) `buildContext`.
- Selalu pertahankan: parse JSON robust, `[ASUMSI]`/`[PERLU KONFIRMASI]`, traceability ID.
