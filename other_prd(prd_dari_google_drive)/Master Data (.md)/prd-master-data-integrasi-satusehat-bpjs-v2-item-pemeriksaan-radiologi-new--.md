# PRD — Master Data Pemeriksaan Radiologi (A29, Integrasi SATUSEHAT BPJS V2)

**Related Document:** List Fitur V2.xlsx (A29); Overview — Master Data Pemeriksaan Radiologi (draft user, final fase ini); Data Requirement - Neurovi - Master Data Radiologi.pdf; Template Export/Import Data Pemeriksaan Radiologi.pdf; PRD terkait: A14 (Item Pemeriksaan Lab), A3 (Unit), A2 (Staff), A10 (Tindakan), A13 (Procedure); SATUSEHAT Terminology — LOINC Radiologi & Nuklir, LOINC Radiology Playbook, referensi LOINC SATUSEHAT KemKes (pre-load); SNOMED CT (BodySite)
**Versi:** 1.5 - Pengembangan (PHASING) atas instruksi user. Perubahan utama dari v1.4: (1) Seluruh fitur **Kelola Master Pendukung** (manajemen/CRUD UI: Modalitas, Kode LOINC, Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode) DIPINDAH ke **FASE 2**. Pada FASE 1 (modul ini): Modalitas hanya **pre-seed** & Kode LOINC hanya **pre-load** dari file KemKes — keduanya dipakai sebagai **lookup read-only** (tanpa UI tambah/ubah/kelola). (2) **Organ Tubuh, Zat Kontras, Metode, dan Sisi Tubuh** — baik masternya maupun pemakaiannya sebagai field input pada Teknik/Pemeriksaan — DIPINDAH ke **FASE 2** (dikeluarkan dari form, dashboard, import/export, dan validasi FASE 1). (3) Semua bagian (Overview, In/Out Scope, Goals, Business Process, Main Flow, Business Rules, User Stories, Functional/Non-Functional Req, Data Requirements, Integrasi) ditandai **[FASE 2]** pada butir terkait. FASE 1 fokus pada: CRUD Pemeriksaan + Teknik (Nama Teknik + LOINC Teknik opsional) + Item Hasil (Nama Item + LOINC Item opsional), status Aktif/Nonaktif per-Pemeriksaan, import/export template multi-sheet, audit per-record, serta pemetaan LOINC opsional (parent/teknik/item). Mewarisi seluruh keputusan v1.x–v1.4: model dua sumbu (Modalitas→Pemeriksaan→Teknik & Item Hasil); natural key = Nama Pemeriksaan + Kode RIS; Kode RIS & Modalitas mandatory; exclusive-or LOINC parent vs teknik; tanpa hard/soft delete; status hanya per-Pemeriksaan; child Teknik & Item dinamis aktif penuh; audit before/after per record; import tambah-baru-saja via preview→commit; single modalitas; LOINC optional & tanggung jawab RS; KPTL out-scope; belum dikaitkan Unit/Tindakan.

## 1. Overview / Brief Summary

**Master Data Pemeriksaan Radiologi** adalah modul Control Panel (kode **A29**) yang mengelola seluruh basis data pemeriksaan radiologi rumah sakit secara terpusat, dapat dikelola mandiri oleh **Admin Master Radiologi** tanpa intervensi developer, dan menyiapkan landasan interoperabilitas **SATUSEHAT** melalui pemetaan kode **LOINC** dan **SNOMED CT**.

Pada SIMRS v1, daftar pemeriksaan radiologi masih *hardcoded* di backend — setiap penambahan/perubahan harus melalui siklus permintaan ke tim IT dan deployment. Modul ini memindahkan kendali pengelolaan layanan radiologi dari kode aplikasi ke tangan admin master data RS.

> ### 🔖 Pembagian Fase (PHASING) — keputusan user (v1.5)
> Atas instruksi user, modul ini dibagi dua fase:
> - **FASE 1 (cakupan PRD ini, aktif sekarang):** CRUD Pemeriksaan + Teknik + Item Hasil, status Aktif/Nonaktif per-Pemeriksaan, import/export multi-sheet, audit per-record, dan **pemetaan LOINC opsional** (parent/teknik/item). Master pendukung yang dibutuhkan inti — **Modalitas** (pre-seed) dan **Kode LOINC** (pre-load KemKes) — tersedia sebagai **lookup read-only** (tanpa UI kelola).
> - **FASE 2 (ditunda):** (a) **Kelola Master Pendukung** — manajemen/CRUD UI untuk **Modalitas, Kode LOINC, Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode**; dan (b) **Organ Tubuh, Zat Kontras, Metode, dan Sisi Tubuh** sebagai master sekaligus field input pada Teknik/Pemeriksaan.
> Seluruh butir terkait pada PRD ini ditandai **[FASE 2]**.

**Model dua sumbu (keputusan user — final):** master dipisah menjadi dua sumbu yang independen:
- **Sumbu permintaan** — **Modalitas → Pemeriksaan → Teknik** — dipakai dokter saat *order*. Anchor LOINC-nya pada tingkat Pemeriksaan (bila tanpa teknik) atau pada tingkat Teknik (bila punya teknik).
- **Sumbu hasil** — **Item Pemeriksaan (Item Hasil)** — dipakai radiografer/radiolog saat *input hasil*. Anchor LOINC-nya pada tingkat item, sesuai LOINC Radiology Playbook & referensi LOINC SATUSEHAT KemKes.

**Entitas yang dikelola di FASE 1:** Pemeriksaan Radiologi (entitas utama), Teknik Pemeriksaan (child dinamis, opsional — atribut FASE 1: Nama Teknik + LOINC Teknik opsional), Item Hasil Pemeriksaan (child dinamis, opsional — Nama Item + LOINC Item opsional), serta master pendukung inti sebagai **lookup read-only**: **Modalitas** (pre-seed) dan **Kode LOINC** (pre-loaded dari KemKes).

**Dipindah ke FASE 2:** **Sisi Tubuh** (label UI untuk BodySite SNOMED CT), **Organ Tubuh** (Anatomic Region), **Zat Kontras** (Pharmaceutical), dan **Metode** (Method) sebagai atribut LOINC Radiology Playbook — beserta seluruh **UI Kelola Master Pendukung**.

**Prinsip kunci (FASE 1):**
- **Tanpa operasi hapus apa pun** (permanen maupun sementara). Siklus hidup record pemeriksaan dikelola lewat status **Aktif/Nonaktif**.
- **Status hanya per-Pemeriksaan**: Teknik & Item Hasil mengikuti status parent. **Master pendukung TIDAK punya status** (dan kelolanya FASE 2).
- **Teknik & Item = child dinamis penuh fase ini**: dikelola langsung di form (tambah/kurangi baris).
- **Audit trail penuh** mencatat aktor, waktu, dan snapshot *before/after* untuk setiap Create, Update, dan Toggle Status — ditelusuri **per record** (tab "Riwayat" pada form detail).
- **Onboarding via bulk import** template Excel **multi-sheet** (.xlsx — sheet Pemeriksaan / Teknik / Item) dengan alur **upload → preview validasi → konfirmasi commit**; import bersifat **tambah baru saja** (tolak duplikat, tanpa upsert). Kolom atribut FASE 2 (Sisi Tubuh/Organ/Zat Kontras/Metode) **belum ada** di template FASE 1.

**Catatan kelengkapan LOINC (keputusan user — final):** field LOINC bersifat **OPTIONAL** di seluruh lokasi; pengisiannya adalah **tanggung jawab RS** dan **di luar kuasa tim product** → bukan metrik keberhasilan produk. Produk hanya menjamin ketersediaan field & jalur input.

**Penyesuaian dari v1.4 (instruksi phasing user):** (a) **Kelola Master Pendukung** (CRUD Modalitas/LOINC/Sisi Tubuh/Organ/Zat Kontras/Metode) → **FASE 2**; FASE 1 hanya pakai Modalitas pre-seed & LOINC pre-load sebagai lookup; (b) **Organ Tubuh, Zat Kontras, Metode, Sisi Tubuh** (master + field input pada teknik/pemeriksaan) → **FASE 2**, dikeluarkan dari form/dashboard/import/validasi FASE 1.

## 2. Background

**Masalah saat ini (v1 / As-Is):**
1. Daftar pemeriksaan radiologi *hardcoded* di backend → setiap penambahan/perubahan harus lewat developer (lambat, bergantung pihak ketiga; berat bagi RS Tipe C & D dengan SDM IT terbatas).
2. Permintaan layanan baru diajukan ke tim IT → developer mengubah kode → deployment.
3. Tidak ada pemetaan LOINC → hasil radiologi tidak dapat dikirim ke SATUSEHAT sesuai mandat Permenkes RME & interoperabilitas nasional.
4. Penghapusan layanan lama berisiko merusak integritas data transaksi historis.
5. Tidak ada Teknik/Sisi Tubuh/atribut LOINC (Organ/Zat Kontras/Metode) terstruktur maupun pemetaan SNOMED CT BodySite.

**Kenapa modul ini perlu:**
- RS Tipe C & D butuh pengelolaan master mandiri yang sederhana namun terstandar.
- Interoperabilitas SATUSEHAT mewajibkan `Observation` radiologi memakai **LOINC**; master harus **menyediakan tempat pemetaan kode sejak awal** (2 sumbu: permintaan & hasil). FASE 1 sudah menyediakan pemetaan LOINC (parent/teknik/item); **atribut penyusun LOINC tambahan (Organ/Anatomic Region, Sisi Tubuh/Laterality, Zat Kontras/Pharmaceutical, Metode/Method) disiapkan di FASE 2** agar tidak perlu migrasi struktur besar saat integrasi penuh diaktifkan.
- Pemisahan **sumbu permintaan** (untuk order dokter) dan **sumbu hasil** (untuk input radiografer) mencerminkan alur kerja radiologi nyata dan memetakan dengan benar ke LOINC Radiology Playbook.
- Modul ini menjadi **single source of truth** layanan radiologi SIMRS v2 dan sumber acuan untuk **Formulir Permintaan Penunjang Radiologi**, alur pelayanan radiologi (BPMN `g-support-radiology-flow`), serta tampilan hasil penunjang di EMR (`g-emr-patient-identity`).

**Alasan phasing (v1.5):** memprioritaskan inti pengelolaan pemeriksaan + LOINC dasar agar RS dapat segera lepas dari data *hardcoded*; pengelolaan master pendukung tambahan (Sisi Tubuh/Organ/Zat Kontras/Metode) dan UI kelola seluruh master pendukung — yang menambah kompleksitas form/import — ditata sebagai **FASE 2** untuk mempercepat go-live FASE 1.

## 3. In Scope

### 3.1 Entitas yang dikelola

| Entitas | Fase | Sifat | Atribut Utama |
|---|---|---|---|
| **Pemeriksaan Radiologi** | **FASE 1** | Entitas utama | Nama Pemeriksaan, Kode RIS, Modalitas, Struktur Teknik, LOINC parent (conditional), Status |
| **Teknik Pemeriksaan** | **FASE 1** | Child dinamis dari Pemeriksaan, **opsional (0..n)** | Nama Teknik, LOINC Teknik (opsional). *(Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode → **[FASE 2]**)* |
| **Item Hasil Pemeriksaan** | **FASE 1** | Child dinamis dari Pemeriksaan, **opsional (0..n)** | Nama Item, LOINC Item (opsional) |
| **Modalitas** | **FASE 1 = lookup read-only (pre-seed)** · **Kelola = [FASE 2]** | Master pendukung | Kode, Nama |
| **Kode LOINC** | **FASE 1 = lookup read-only (pre-load KemKes)** · **Kelola/tambah = [FASE 2]** | Master pendukung | Code, Display, System, Scale, Property, Unit |
| **Sisi Tubuh** | **[FASE 2]** | Master pendukung (label UI BodySite SNOMED CT) | Kode SNOMED, Nama tampilan |
| **Organ Tubuh** | **[FASE 2]** | Master pendukung (Anatomic Region) | Kode (opsional), Nama tampilan |
| **Zat Kontras** | **[FASE 2]** | Master pendukung (Pharmaceutical) | Kode (opsional), Nama tampilan |
| **Metode** | **[FASE 2]** | Master pendukung (Method) | Kode (opsional), Nama tampilan |

### 3.2 Scope Definition — **FASE 1 (yang dikerjakan sekarang)**
- **Dashboard Master Data Radiologi** (list, filter Modalitas, search, sorting, pagination) + **Daftar Pemeriksaan Non-aktif**.
- **Formulir Tambah/Ubah** Pemeriksaan dengan **dua sumbu**: Section Permintaan (Pemeriksaan + Teknik child dinamis: Nama Teknik + LOINC Teknik opsional) dan Section Hasil (Item Hasil child dinamis: Nama Item + LOINC Item opsional). **Teknik & Item dinamis aktif penuh fase ini.**
- **Create, View, Update** untuk Pemeriksaan/Teknik/Item. **Hard delete TIDAK disediakan** (BR-003).
- **Toggle Status Aktif/Nonaktif** sebagai pengganti delete — **per Pemeriksaan saja** (Teknik & Item mengikuti parent, BR-015); dari list view maupun form detail.
- **Modalitas pre-seed** & **Kode LOINC pre-load (KemKes)** sebagai **lookup read-only** dalam form & import (tanpa UI kelola — UI kelolanya FASE 2).
- **Struktur DB relasi 1:N (pemeriksaan ↔ teknik) dan 1:N (pemeriksaan ↔ item hasil) WAJIB disiapkan & menyimpan data.**
- **Pemetaan LOINC** pada Pemeriksaan (parent, conditional), Teknik, dan Item — semua **optional** (BR-007/BR-012).
- **Bulk import** data Pemeriksaan dari **template Excel multi-sheet (.xlsx)**: sheet **Pemeriksaan / Teknik / Item** terpisah, di-key **Kode RIS + Nama Pemeriksaan**, alur **upload → preview hasil validasi per-sheet → konfirmasi commit**. **Kolom FASE 1 tidak memuat Sisi Tubuh/Organ/Zat Kontras/Metode** (lihat §11.9).
  - Baris valid ditandai untuk diimport; baris invalid dilewati dengan alasan kegagalan **per baris/per sheet** (mandatory kosong, Modalitas tidak match, kombinasi Nama+Kode RIS duplikat, child *orphan* tanpa parent, pelanggaran exclusive-or LOINC, LOINC tidak ada di master, dst.).
  - User memutuskan: lanjutkan import **hanya baris valid** ATAU **batalkan seluruh batch**.
- **Download Template Excel multi-sheet** + **Export** data (simetris template FASE 1).
- **Validasi**: uniqueness natural key (Nama Pemeriksaan + Kode RIS), mandatory (Nama Pemeriksaan, Kode RIS, Modalitas, Status), enum Modalitas match master pre-seed (case-insensitive), referensi LOINC (bila diisi harus dari master), exclusive-or LOINC parent vs teknik.
- **Audit trail penuh** Create/Update/Toggle Status untuk Pemeriksaan & child — aktor, waktu, snapshot *before/after* — ditelusuri **per record** via tab **Riwayat** pada form detail.

### 3.3 Scope — **FASE 2 (ditunda; disebut di sini agar struktur siap)**
- **F2-A — Kelola Master Pendukung (CRUD UI):** Create/View/Update untuk **Modalitas** (Kode+Nama), **Kode LOINC** (tambah kode RS di luar pre-load), **Sisi Tubuh** (Kode SNOMED + Nama), **Organ Tubuh**, **Zat Kontras**, **Metode** (Kode opsional + Nama). Tanpa status, tanpa delete (koreksi via Update).
- **F2-B — Atribut LOINC sebagai field input:** **Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode** ditambahkan sebagai field optional pada anchor (Teknik bila ada teknik; Pemeriksaan/parent bila tanpa) — termasuk kolomnya di template import/export & validasi referensi master.
- **F2-C — exclusive-or atribut** (Organ/Zat/Metode/Sisi Tubuh) parent vs teknik, mengikuti anchor LOINC.
- *(Struktur DB FASE 1 disiapkan forward-compatible agar penambahan FASE 2 tidak perlu migrasi besar — lihat NFR-006.)*

### 3.4 Out Scope (yang TIDAK dikerjakan)
1. **Hard delete** record apa pun. **Juga tidak ada soft-delete/arsip** — penghentian layanan hanya via status Non-aktif (per Pemeriksaan). (BR-003)
2. **Kelola Master Pendukung (CRUD UI) di FASE 1** — **dipindah ke FASE 2** (F2-A, BR-023). FASE 1 hanya pakai Modalitas pre-seed & LOINC pre-load sebagai lookup read-only.
3. **Sisi Tubuh / Organ Tubuh / Zat Kontras / Metode di FASE 1** (master maupun field input) — **dipindah ke FASE 2** (F2-B/F2-C, BR-023).
4. **Status Aktif/Nonaktif pada master pendukung** — master pendukung hanya daftar pilihan tanpa status (berlaku saat FASE 2 diaktifkan; BR-021).
5. **Pengelolaan kode KPTL** — tidak ada field/kolom/CTA KPTL di dashboard, form, maupun template (meski muncul di lampiran PDF).
6. **Keterkaitan ke modul lain** — relasi ke Master Unit/Instalasi (A3/A19) dan Master Tindakan/Tarif (A10/A13/A43) belum dikerjakan.
7. **Targeting kelengkapan pengisian LOINC** — pengisian = tanggung jawab RS (Q5); tidak ada enforcement/KPI internal.
8. **Pengiriman Observation/hasil ke SATUSEHAT** — modul ini hanya menyediakan pemetaan kode; pengiriman aktual di modul Pelayanan Radiologi / Integrasi.
9. **Order/permintaan radiologi & input expertise** — ranah `g-support-radiology-flow`, bukan master data.
10. **Multi-modalitas pada satu pemeriksaan** — fase ini **single modalitas saja**. (BR-018)
11. **Update massal via import (upsert)** — import hanya untuk **penambahan baru**; perubahan record existing via **form satuan**. (BR-016)
12. **Halaman audit terpusat lintas-record** — audit cukup ditelusuri per record.

## 4. Goals and Metrics

> Metrik di bawah berlaku untuk **FASE 1** kecuali ditandai **[FASE 2]**.

| Tujuan | Fase | Metrik Terukur |
|--------|------|----------------|
| Pengelolaan pemeriksaan mandiri tanpa developer | FASE 1 | 100% penambahan/perubahan pemeriksaan, teknik, & item dilakukan via UI oleh admin (0 deployment) |
| Kesiapan struktur SATUSEHAT (LOINC dasar) | FASE 1 | 100% record dapat menyimpan pemetaan LOINC di tiga lokasi (pemeriksaan/teknik/item). *Kelengkapan pengisian LOINC TIDAK dijadikan metrik produk — tanggung jawab RS (Q5).* |
| Kesiapan struktur multi-child | FASE 1 | 100% penyimpanan memakai struktur **1:N** (pemeriksaan↔teknik dan pemeriksaan↔item), sehingga multi-teknik/multi-item dapat ditambah tanpa migrasi |
| Integritas data historis | FASE 1 | 0 kasus error/data hilang/rusak pada transaksi lama akibat penonaktifan pemeriksaan |
| Keandalan onboarding (import multi-sheet) | FASE 1 | Import 1 file template (sheet Pemeriksaan/Teknik/Item) berhasil melewati alur preview→commit untuk ≥ 100 baris pemeriksaan dengan resolusi child-ke-parent benar & laporan baris ditolak + alasan per baris yang jelas |
| Akuntabilitas perubahan | FASE 1 | 100% operasi Create/Update/Toggle Status tercatat di audit trail (aktor + waktu + before/after) & dapat ditelusuri per record |
| Kemudahan pencarian | FASE 1 | Petugas menemukan pemeriksaan via filter Modalitas + search ≤ 5 detik [ASUMSI] |
| Kualitas data | FASE 1 | 0 duplikat natural key (Nama Pemeriksaan + Kode RIS) per RS; 0 child *orphan* tersimpan |
| **Kelengkapan atribut LOINC Playbook (Organ/Zat Kontras/Metode/Sisi Tubuh)** | **[FASE 2]** | 100% atribut dapat dipilih dari master & disimpan pada anchor; UI Kelola Master Pendukung tersedia |
| **Pengelolaan master pendukung mandiri** | **[FASE 2]** | 100% penambahan/koreksi Modalitas/LOINC/Sisi Tubuh/Organ/Zat Kontras/Metode via UI (0 deployment) |

> **Catatan metrik LOINC:** target lama "≥90% item punya LOINC" tetap **dicabut sebagai metrik produk** (Q5) — kelengkapan LOINC bergantung pada RS. Produk cukup menjamin **ketersediaan field & jalur input**.

## 5. Related Feature

| Code | Menu | Relasi |
|------|------|--------|
| **A29** | Control Panel > Master Data / Integrasi SATUSEHAT BPJS V2 > Item Pemeriksaan Radiologi (New) | **Modul ini** |
| A14 | Master Data > Item Pemeriksaan Laboratorium | Pola sejenis (LOINC, status aktif, import preview) — reuse `file_import`, `mode_import`, `status_aktif` |
| A2 / A55 | Staff / Jabatan | Sumber `nama` user pada audit (aktor Create/Update/Toggle) |
| A37 / A53 | Akses Menu / RBAC | Pembatasan akses pengelola master radiologi |
| A3 | Master Data > Unit | **Belum dikaitkan** (keputusan user) — potensi lookup unit radiologi di fase berikut |
| A19 | Master Data > Instalasi (New) | **Belum dikaitkan** (keputusan user) |
| A10 / A13 / A43 | Tindakan / Procedure / Tarif | **Belum dikaitkan** (keputusan user) — pemetaan tarif menyusul |

**Standar/terminologi acuan:** SATUSEHAT — LOINC Radiologi & Nuklir (acuan FASE 1), **LOINC Radiology Playbook** (acuan model dua sumbu & atribut penyusun: Anatomic Region/Organ, Laterality/Sisi Tubuh, Pharmaceutical/Zat Kontras, Method/Metode — atribut ini **[FASE 2]**), referensi **LOINC SATUSEHAT KemKes** (pre-load FASE 1), serta **SNOMED CT** (BodySite untuk Sisi Tubuh — **[FASE 2]**).

**Konsumen master ini (hilir):** Formulir Permintaan Penunjang Radiologi (sumbu permintaan: Modalitas→Pemeriksaan→Teknik), alur `g-support-radiology-flow` (push order ke RIS), input hasil radiografer/radiolog (sumbu hasil: Item), dan tampilan hasil penunjang di EMR (`g-emr-patient-identity`).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini)
1. Daftar pemeriksaan radiologi *hardcoded* di backend. [ASUMSI berdasarkan draft]
2. Permintaan penambahan/perubahan layanan diajukan ke tim IT/developer.
3. Developer mengubah kode & deployment → memakan waktu, bergantung pihak ketiga.
4. Tidak ada pemetaan LOINC → hasil radiologi tidak dapat dikirim ke SATUSEHAT.
5. Tidak ada Teknik/Sisi Tubuh/atribut LOINC terstruktur; penghapusan layanan lama berisiko terhadap data transaksi historis.

### B. To-Be — **FASE 1 (aktif)**
1. Admin Master Radiologi membuka menu **Control Panel > Master Data Pemeriksaan Radiologi**.
2. Sistem menampilkan dashboard (list + filter Modalitas + search + pagination).
3. **Modalitas (pre-seed)** & **Kode LOINC (pre-load KemKes)** sudah tersedia sebagai **lookup read-only** — admin **tidak** mengelolanya di FASE 1 *(UI kelola = **[FASE 2]**)*.
4. Admin **Tambah/Ubah** Pemeriksaan via formulir dua sumbu (Teknik & Item = child dinamis aktif penuh):
   - **Sumbu permintaan**: data Pemeriksaan (Nama, Kode RIS, Modalitas) + Teknik (opsional, dinamis; tiap teknik: Nama Teknik + LOINC Teknik opsional). *(Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode → **[FASE 2]**.)*
   - **Sumbu hasil**: Item Hasil (opsional, dinamis; tiap item: Nama Item + LOINC Item opsional).
5. Sistem memvalidasi mandatory (Nama, Kode RIS, Modalitas, Status), uniqueness (Nama + Kode RIS), aturan **exclusive-or LOINC** (parent vs teknik), dan referensi master (Modalitas/LOINC).
6. Sistem menyimpan record + audit *before/after*; status default **Aktif**.
7. Onboarding massal: **Download Template multi-sheet (.xlsx) → isi sheet Pemeriksaan/Teknik/Item → Import → Preview validasi per baris/per sheet (termasuk resolusi child-ke-parent) → Konfirmasi commit (valid saja) atau Batalkan batch**.
8. Menghentikan layanan: admin **menonaktifkan Pemeriksaan** (status Non-aktif). Pemeriksaan hilang dari order baru & input hasil baru; data transaksi historis tetap utuh. Tidak ada hapus.
9. Pemeriksaan aktif tersedia di Formulir Permintaan Radiologi & order ke RIS; bila LOINC item telah diisi RS, kode siap dipakai modul integrasi untuk membentuk FHIR `Observation` ke SATUSEHAT.

### C. To-Be — **[FASE 2] (ditunda)**
- **Kelola Master Pendukung:** admin dapat **Setup master pendukung** lebih dulu — tambah/ubah **Modalitas** (Kode+Nama), **Sisi Tubuh** (SNOMED), **Organ Tubuh**, **Zat Kontras**, **Metode**, atau tambah **Kode LOINC** (di luar pre-load). Master pendukung **tanpa status** (Create/View/Update).
- **Atribut LOINC pada form:** tiap Teknik (atau parent bila tanpa teknik) dapat diisi **Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode** (semua opsional), mengikuti anchor & exclusive-or LOINC.

[ASUMSI] Alur aktor/keputusan diturunkan dari draft overview final user + jawaban pertanyaan terbuka + pola master data lintas-modul (analogi A14) dan BPMN `g-support-radiology-flow`/`g-emr-patient-identity` (modul ini belum punya BPMN sendiri).

## 7. Main Flow / Mindmap

**Aktor:** Admin Master Radiologi (PIC RS), Sistem. *(Konsumen tak langsung: dokter perujuk/spesialis radiologi; Tim IT RS/Auditor Mutu untuk telusur audit.)*

### Skenario 0 — Kelola Master Pendukung — **[FASE 2] (ditunda)**
> Pada **FASE 1**, **Modalitas (pre-seed)** & **Kode LOINC (pre-load KemKes)** hanya tersedia sebagai **lookup read-only**; admin **tidak** dapat menambah/mengubahnya via UI. Skenario kelola berikut **aktif di FASE 2**:
1. Admin buka master **Modalitas** / **Kode LOINC** / **Sisi Tubuh** / **Organ Tubuh** / **Zat Kontras** / **Metode**.
2. Modalitas: tambah/ubah Kode + Nama. Kode LOINC: tambah kode baru (Code, Display, System, Scale, Property, Unit). Sisi Tubuh: tambah/ubah Kode SNOMED + Nama tampilan. Organ/Zat Kontras/Metode: tambah/ubah Nama tampilan (+ Kode opsional).
3. **Operasi = Create/View/Update saja**; **tidak ada status & tidak ada delete** (BR-021). Koreksi entri salah via **Update**.
4. **Catatan**: pilihan baru **wajib dibuat di master lebih dulu** sebelum dipakai pada Pemeriksaan/import (saat FASE 2 aktif).

### Skenario 1 — Tambah Pemeriksaan (manual) — **FASE 1**
1. Admin klik **Tambah Data** (judul: "Penambahan Data Radiologi").
2. **Sumbu permintaan — Pemeriksaan**: isi Kode RIS*, Nama Pemeriksaan*, Modalitas* (dari lookup pre-seed), dan (opsional) **Teknik (child dinamis)** — tiap teknik: **Nama Teknik + LOINC Teknik (opsional)**. *(Sisi Tubuh/Organ Tubuh/Zat Kontras/Metode → **[FASE 2]**.)*
3. **LOINC Pemeriksaan (parent)**: aktif **hanya bila pemeriksaan TANPA teknik** (exclusive-or, BR-013). Bila ada teknik, LOINC melekat pada teknik.
4. **Sumbu hasil — Item Hasil (child dinamis)**: isi Item (opsional) — tiap item: Nama Item + LOINC Item (opsional).
5. Klik **Simpan**.
6. Sistem validasi mandatory (Nama, Kode RIS, Modalitas, Status) → bila kosong, error per-field (LOINC tidak termasuk mandatory).
7. Sistem validasi **uniqueness** natural key (Nama Pemeriksaan + Kode RIS) → bila duplikat, tolak + pesan.
8. Sistem validasi referensi master (Modalitas/LOINC) & aturan exclusive-or LOINC.
9. Sistem simpan record + teknik + item (status default **Aktif**) + audit *before/after*. → **Event: Data tersimpan**.

### Skenario 2 — Ubah Pemeriksaan — **FASE 1**
1. Dari dashboard, klik **Edit** (judul: "Ubah Data Radiologi").
2. Sistem menampilkan data existing (Pemeriksaan + Teknik + Item) → admin ubah (tambah/kurangi teknik & item secara dinamis) → Simpan (validasi sama Skenario 1).
3. Sistem mencatat audit *before/after*. → **Event: Data diperbarui**.

### Skenario 3 — Non-aktifkan / Aktifkan (TANPA hapus, per Pemeriksaan) — **FASE 1**
1. Admin toggle status pada dashboard / detail. **Toggle hanya di tingkat Pemeriksaan**; Teknik & Item ikut status parent (BR-015).
2. Saat Non-aktif: pemeriksaan **hilang dari order baru** dan **tidak dapat dipakai untuk input hasil baru**. **Data transaksi historis tetap utuh & tidak rusak.** Tidak ada aksi hapus. → **Event: Status diperbarui** (tercatat di audit).

### Skenario 4 — Import Massal (template multi-sheet, preview → commit) — **FASE 1**
1. Admin **Download Template (.xlsx)** berisi sheet **Pemeriksaan**, **Teknik**, **Item** (+ sheet Petunjuk) → isi → **Import**. *(Kolom Sisi Tubuh/Organ/Zat Kontras/Metode **belum ada** di template FASE 1 — **[FASE 2]**.)*
2. Sistem memvalidasi **per sheet & per baris**:
   - Sheet **Pemeriksaan**: mandatory (Kode RIS, Nama, Modalitas, Status), enum Modalitas match master pre-seed, uniqueness (Nama+Kode RIS) terhadap data existing & antar-baris dalam file, exclusive-or (bila pemeriksaan punya baris di sheet Teknik → kolom LOINC di sheet Pemeriksaan harus kosong).
   - Sheet **Teknik** & **Item**: setiap baris harus mereferensikan parent (Kode RIS+Nama) yang **ada di sheet Pemeriksaan** → bila tidak ada = **child orphan** (ditolak). Referensi LOINC (bila diisi) harus ada di master.
3. Sistem menampilkan **Preview** per sheet: baris valid ditandai; baris invalid dilewati + **alasan kegagalan per baris**, plus ringkasan grup parent↔child.
4. **Keputusan user**: **Lanjutkan import (hanya baris valid)** ATAU **Batalkan seluruh batch**.
5. Import bersifat **tambah baru saja** — pemeriksaan yang Nama+Kode RIS-nya sudah ada **ditolak** (bukan upsert, BR-016). → **Event: Laporan hasil import**.

### Skenario 5 — Export — **FASE 1**
1. Admin klik **Export** → sistem unduh data dalam format multi-sheet yang **simetris dengan template import FASE 1** (sheet Pemeriksaan/Teknik/Item; tanpa kolom atribut FASE 2; KPTL & field DB-internal dikecualikan).

### Skenario 6 — Telusur Audit (per record) — **FASE 1**
1. Pada form detail Pemeriksaan, admin/auditor buka tab **Riwayat**.
2. Sistem menampilkan daftar perubahan: aktor, waktu, snapshot **before/after** untuk Create/Update/Toggle Status record tsb. (Tidak ada halaman audit terpusat.)

## 8. Business Rules

> **BR-023** menetapkan pembagian fase. Aturan ber-tag **[FASE 2]** baru berlaku saat FASE 2 diaktifkan; selebihnya berlaku **FASE 1**.

- **BR-001 (Mandatory):** Form Pemeriksaan tidak dapat disimpan bila field bertanda * kosong — **Nama Pemeriksaan, Kode RIS, Modalitas, Status** → pesan error per-field. **Field LOINC TIDAK termasuk mandatory** (BR-012). *(trace: S1.6)*
- **BR-002 (Uniqueness / natural key):** Kombinasi **Nama Pemeriksaan + Kode RIS** wajib **unik per RS**. **Modalitas tidak bagian dari key.** Berlaku pada input manual & import. *(trace: S1.7, S4.2)*
- **BR-003 (Tanpa hapus — final):** **Tidak ada operasi delete dalam bentuk apa pun** (permanen/soft-delete/arsip) pada Pemeriksaan/Teknik/Item maupun master pendukung. Penghentian layanan hanya via status Aktif/Non-aktif (per Pemeriksaan). Dashboard/detail/form **tidak** menyediakan CTA hapus. *(trace: S3)*
- **BR-004 (Perilaku Non-aktif):** Pemeriksaan Non-aktif **tidak muncul pada order radiologi baru** dan **tidak dapat dipakai untuk input hasil baru**. Seluruh data transaksi historis tetap utuh, tidak hilang & tidak rusak. *(trace: S3.2)*
- **BR-005 (Status default):** Record Pemeriksaan baru default **Aktif**.
- **BR-006 (Modalitas = master, FASE 1 pre-seed read-only):** Modalitas adalah master pendukung (Kode + Nama), **bukan enum statis**. Pada Pemeriksaan/import, Modalitas **wajib match master** (case-insensitive); UI dapat menampilkan Kode (singkatan) sebagai label utama. **FASE 1: daftar Modalitas bersifat pre-seed read-only (tanpa UI kelola).** **[PERLU KONFIRMASI]** apakah RS dapat onboard FASE 1 dengan hanya seed default — bila butuh modalitas di luar seed, penambahan via UI baru ada di **FASE 2** (BR-023) atau perlu jalur konfigurasi sementara. *(trace: S0, S4.2)*
- **BR-007 (LOINC multi-lokasi):** Kode LOINC dapat melekat pada **tiga lokasi**: tingkat **Pemeriksaan/parent** (hanya bila tanpa teknik — BR-013), tingkat **Teknik**, dan tingkat **Item/Hasil** (observation). **LOINC item = dasar pembentukan `Observation` ke SATUSEHAT.** Seluruhnya **optional** (BR-012). Pada pemeriksaan multi-teknik, **tiap teknik boleh memiliki LOINC sendiri** (opsional, Q4). *(FASE 1)*
- **BR-008 (Atribut LOINC = field optional) — [FASE 2]:** **Organ Tubuh** (Anatomic Region), **Zat Kontras** (Pharmaceutical), dan **Metode** (Method) sebagai field input optional **DIPINDAH ke FASE 2** (sebelumnya v1.4 aktif fase ini). Saat FASE 2 aktif: disediakan sebagai **daftar pilihan/lookup** dari master, melekat mengikuti **anchor yang sama dengan LOINC** (exclusive-or). **[ASUMSI]** level pelekatan mengikuti anchor LOINC — perlu konfirmasi bila RS menginginkan level berbeda. *(BR-023)*
- **BR-009 (Relasi 1:N — penyimpanan):** Penyimpanan **pemeriksaan↔teknik** dan **pemeriksaan↔item hasil** **wajib** memakai model **1:N**. Teknik & item opsional (0..n), namun struktur 1:N wajib ada agar multi-teknik/multi-item dapat ditambah tanpa migrasi. *(FASE 1)*
- **BR-010 (Audit trail penuh):** Setiap **Create / Update / Toggle Status** pada Pemeriksaan/Teknik/Item tercatat: **aktor, waktu, snapshot before/after**. Ditelusuri **per record** via tab **Riwayat**; **tidak ada halaman audit terpusat**. Dashboard menampilkan ringkasan **Last Update** via tooltip. *(FASE 2: audit juga mencakup Create/Update master pendukung saat kelolanya aktif.)*
- **BR-011 (Child dinamis — AKTIF PENUH FASE 1):** Teknik & Item Hasil dikelola sebagai **child dinamis** di form (tambah/kurangi baris) — Create/View/Update. Penyimpanan 1:N (BR-009) wajib. *(trace: S1.2, S1.4)*
- **BR-012 (Field optional = tanggung jawab RS, Q5):** Field **LOINC** (parent/teknik/item) — dan, saat FASE 2, atribut penyusun (Sisi Tubuh/Organ/Zat Kontras/Metode) — bersifat **OPTIONAL**. Sistem **tidak boleh** memaksa pengisiannya sebagai syarat simpan. Pengisian = **tanggung jawab RS** → bukan metrik produk. *(trace: Goals, S1.6)*
- **BR-013 (Exclusive-or LOINC parent vs teknik):** Bila pemeriksaan **punya teknik** → LOINC **tidak diisi di parent**, melekat di masing-masing teknik. Bila pemeriksaan **tanpa teknik** → LOINC **opsional di parent**. Sistem mencegah pengisian LOINC parent bersamaan dengan adanya teknik. **[FASE 2]** aturan exclusive-or yang sama diperluas ke atribut Sisi Tubuh/Organ/Zat Kontras/Metode (F2-C). *(trace: S1.3)*
- **BR-014 (Sisi Tubuh — master SNOMED) — [FASE 2]:** Sisi Tubuh adalah **master pilihan** menyimpan **kode SNOMED CT** (UI menampilkan label "Sisi Tubuh" & Nama tampilan), melekat pada **anchor** (Teknik bila ada teknik; parent bila tanpa) — **tidak** pada Item Hasil. Opsional, tanpa status. **DIPINDAH ke FASE 2** (BR-023).
- **BR-015 (Status per Pemeriksaan):** Toggle Aktif/Nonaktif berlaku **per Pemeriksaan saja**. Teknik & Item Hasil **mengikuti status parent**. *(trace: S3.1)*
- **BR-016 (Import = tambah baru saja):** Import **hanya menambah data baru**. Pemeriksaan dengan natural key (Nama + Kode RIS) yang sudah ada **ditolak** (tanpa upsert). Perubahan record existing via form satuan. *(trace: S4.5)*
- **BR-017 (Import preview → commit):** Import wajib melalui alur **upload → preview validasi per baris/per sheet → konfirmasi**. User memilih **commit baris valid saja** atau **batalkan seluruh batch** sebelum data ditulis. *(trace: S4.3–S4.4)*
- **BR-018 (Single modalitas):** Satu Pemeriksaan hanya memiliki **satu Modalitas**. Multi-modalitas **out-scope**. *(trace: Out Scope)*
- **BR-019 (Kode RIS — format bebas):** Kode RIS adalah identifier internal RIS/PACS milik RS; **tidak ada validasi format tambahan** — alfanumerik bebas. Tetap wajib & bagian natural key.
- **BR-020 (Referensi pilihan dari master):** Kode LOINC **opsional** di lokasi yang berlaku, tetapi **bila diisi harus berasal dari master** (LOINC: pre-loaded KemKes). **[FASE 2]** aturan yang sama berlaku untuk Sisi Tubuh/Organ/Zat Kontras/Metode saat masternya aktif. *(trace: S0, S1.8)*
- **BR-021 (Master pendukung = daftar pilihan tanpa status) — [FASE 2]:** Master pendukung — **Modalitas, Kode LOINC, Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode** — bila dikelola adalah **daftar pilihan** dengan operasi **Create/View/Update** saja: **tanpa status, tanpa delete**; koreksi via Update; rujukan **by id** sehingga perubahan label aman. **UI kelola ini DIPINDAH ke FASE 2** (BR-023). **[PERLU KONFIRMASI]** perlakuan bila satu opsi keliru ditambahkan dan sudah dipakai.
- **BR-022 (Import = template MULTI-SHEET):** Template/Export berbentuk **workbook .xlsx multi-sheet**: sheet **Pemeriksaan** (parent), sheet **Teknik**, sheet **Item** — child di-key **Kode RIS + Nama Pemeriksaan**. Child orphan → ditolak. **FASE 1**: kolom Sisi Tubuh/Organ/Zat Kontras/Metode **belum ada** di sheet; ditambahkan saat **FASE 2** (lihat §11.9). *(trace: S4)*
- **BR-023 (PHASING — keputusan user v1.5):** (a) Seluruh **fitur Kelola Master Pendukung** (CRUD UI Modalitas/Kode LOINC/Sisi Tubuh/Organ/Zat Kontras/Metode) → **FASE 2**; pada FASE 1, Modalitas **pre-seed** & Kode LOINC **pre-load** hanya sebagai **lookup read-only**. (b) **Organ Tubuh, Zat Kontras, Metode, Sisi Tubuh** — master maupun field inputnya pada Teknik/Pemeriksaan — → **FASE 2**, dikeluarkan dari form/dashboard/import/export/validasi **FASE 1**. (c) Struktur DB FASE 1 disiapkan forward-compatible agar penambahan FASE 2 tidak butuh migrasi besar (NFR-006). *(trace: Overview phasing, Out Scope #2/#3)*

## 9. User Stories

> User story ber-tag **[FASE 2]** ditunda; selebihnya **FASE 1**.

- **US-001** [FASE 1] — Sebagai Admin Master Radiologi, saya ingin menambah pemeriksaan radiologi via form, agar layanan baru tersedia tanpa menunggu developer. *(trace: g-support-radiology-flow)*
- **US-002** [FASE 1] — Sebagai Admin, saya ingin **dapat** mengisi LOINC (parent/teknik/item) **bila tersedia**, agar hasil radiologi siap dikirim ke SATUSEHAT — pengisian tidak dipaksakan saat simpan. *(trace: BR-007, BR-012)*
- **US-003** [FASE 1] — Sebagai Admin, saya ingin memfilter daftar berdasarkan Modalitas dan mencari berdasarkan Nama Pemeriksaan/Nama Item, agar cepat menemukan data.
- **US-004** [FASE 1] — Sebagai Admin, saya ingin menonaktifkan pemeriksaan (bukan menghapus), agar layanan lama aman di data transaksi historis dan tidak bisa lagi dipakai untuk order/input hasil baru. *(trace: BR-004, BR-015)*
- **US-005** [FASE 1] — Sebagai Admin, saya ingin mengimpor data massal via template **.xlsx multi-sheet** dengan **preview validasi sebelum commit**, agar setup awal cepat & saya tahu baris mana yang ditolak beserta alasannya. *(trace: BR-017, BR-022)*
- **US-006** [FASE 1] — Sebagai Admin, saya ingin sistem menolak duplikat natural key (Nama Pemeriksaan + Kode RIS), baik via form maupun import, agar data bersih. *(trace: BR-002, BR-016)*
- **US-007** [FASE 1] — Sebagai Admin, saya ingin melihat siapa & kapan terakhir mengubah data (tooltip Last Update) di dashboard, agar ada akuntabilitas cepat. *(trace: BR-010)*
- **US-008** [FASE 1] — Sebagai Dokter perujuk (konsumen), saya ingin hanya pemeriksaan aktif yang muncul di Formulir Permintaan Radiologi, agar tidak salah order. *(trace: lampiran Formulir Permintaan Penunjang Radiologi)*
- **US-009** [FASE 1] — Sebagai Product Owner, saya ingin struktur data mendukung **1:N (teknik & item)** sejak sekarang, agar pemeriksaan multi-teknik/multi-komponen dapat diakomodasi tanpa migrasi. *(trace: BR-009)*
- **US-010** [FASE 1] — Sebagai Product Owner, saya ingin field LOINC bersifat optional, agar RS dapat melengkapinya bertahap tanpa memblokir penyimpanan data dasar. *(trace: BR-012)*
- **US-011** [FASE 1] — Sebagai Admin, saya ingin mendefinisikan **Teknik Pemeriksaan** (dengan LOINC Teknik opsional) di bawah satu pemeriksaan secara **dinamis**, agar sumbu permintaan order dokter merepresentasikan teknik pemindaian dengan benar. *(trace: BR-013, BR-011)*
- **US-012** [FASE 2] — Sebagai Admin, saya ingin mengelola **master Modalitas** (tambah/ubah Kode+Nama, tanpa status), agar dapat menambah modalitas baru tanpa developer. *(Pada FASE 1 Modalitas hanya pre-seed read-only.)* *(trace: BR-006, BR-021, BR-023)*
- **US-013** [FASE 2] — Sebagai Admin, saya ingin **menambah kode LOINC sendiri** di luar yang pre-loaded KemKes, agar pemilihan LOINC lengkap & terstandar. *(Pada FASE 1 LOINC hanya pre-load read-only.)* *(trace: BR-020, BR-021, BR-023)*
- **US-014** [FASE 2] — Sebagai Admin, saya ingin memilih **Sisi Tubuh** (label ramah pengguna menyimpan kode SNOMED CT) pada Teknik, agar BodySite terstandar. *(trace: BR-014, BR-023)*
- **US-015** [FASE 1] — Sebagai Admin, saat preview import saya ingin memilih **lanjut import baris valid saja** atau **batalkan seluruh batch**, agar saya kendali penuh sebelum data masuk. *(trace: BR-017)*
- **US-016** [FASE 1] — Sebagai Auditor Mutu / Tim IT RS, saya ingin menelusuri **riwayat perubahan per record** (aktor, waktu, before/after) via tab Riwayat, agar dapat mengaudit perubahan master radiologi. *(trace: BR-010)*
- **US-017** [FASE 2] — Sebagai Admin, saya ingin **memilih Organ Tubuh, Zat Kontras, dan Metode** dari daftar pilihan pada teknik/pemeriksaan, agar atribut penyusun LOINC Radiology Playbook terisi terstandar untuk kesiapan `Observation`. *(trace: BR-008, BR-020, BR-023)*
- **US-018** [FASE 2] — Sebagai Admin, saya ingin **Kelola Master Pendukung** berupa daftar pilihan tanpa status yang dapat saya tambah & koreksi (Create/View/Update), agar pengelolaan ringan. *(trace: BR-021, BR-023)*
- **US-019** [FASE 1] — Sebagai Admin, saat import saya ingin **sheet Teknik & Item terpisah** dari sheet Pemeriksaan (di-key Kode RIS + Nama), agar tidak ambigu memasukkan banyak teknik & banyak item untuk satu pemeriksaan. *(trace: BR-022)*
- **US-020** [FASE 1] — Sebagai Admin, saya ingin **tiap teknik dapat memiliki LOINC sendiri (opsional)** pada pemeriksaan multi-teknik, agar tiap teknik dapat dipetakan ke kode LOINC yang tepat. *(trace: BR-007, BR-013)*
- **US-021** [FASE 2] — Sebagai Product Owner, saya ingin penundaan Kelola Master Pendukung & atribut LOINC (Sisi Tubuh/Organ/Zat Kontras/Metode) ke FASE 2 dengan struktur DB forward-compatible, agar FASE 1 go-live lebih cepat tanpa migrasi besar saat FASE 2. *(trace: BR-023, NFR-006)*

## 10. Functional Requirements

> FR ber-tag **[FASE 2]** ditunda; selebihnya **FASE 1**.

| ID | Requirement | Fase | Trace |
|----|-------------|------|-------|
| **FR-001** | Dashboard list pemeriksaan dengan kolom: Kode RIS, Nama Pemeriksaan, Modalitas, (LOINC parent bila ada), Status, Last Update, Aksi (Detail, Edit). **Tanpa CTA hapus.** | FASE 1 | US-003, BR-003 |
| **FR-002** | Filter by Modalitas; search by Nama Pemeriksaan & Nama Item; sorting by Nama Pemeriksaan; pagination 15/25/50/Semua. | FASE 1 | US-003 |
| **FR-003** | Form Tambah/Edit dua sumbu: **Permintaan** (Pemeriksaan + Teknik child dinamis) & **Hasil** (Item child dinamis). Judul dinamis: "Penambahan Data Radiologi" / "Ubah Data Radiologi". | FASE 1 | US-001, S1-S2 |
| **FR-004** | Validasi field mandatory (Nama Pemeriksaan, Kode RIS, Modalitas, Status) dengan pesan error per-field. **LOINC TIDAK divalidasi mandatory.** | FASE 1 | BR-001, BR-012 |
| **FR-005** | Menolak penyimpanan bila natural key **(Nama Pemeriksaan + Kode RIS)** sudah ada per RS. | FASE 1 | BR-002 |
| **FR-006** | Menyediakan & menyimpan LOINC di lokasi yang berlaku (parent/teknik/item) dengan preview code+display — **optional**; bila diisi harus dari master LOINC pre-load; tiap teknik dapat punya LOINC sendiri. | FASE 1 | BR-007, BR-012, BR-020, US-002, US-020 |
| **FR-007** | Dropdown/lookup **Modalitas dari master pre-seed (read-only)**; menampilkan Kode (singkatan) sebagai label utama. **UI kelola Modalitas = FR-017 [FASE 2].** | FASE 1 | BR-006, BR-023 |
| **FR-008** | Toggle Status Aktif/Non-aktif **per Pemeriksaan** (default Aktif) + halaman Daftar Pemeriksaan Non-aktif. **Tanpa fungsi hapus.** Teknik & item mengikuti status parent. | FASE 1 | BR-003, BR-005, BR-015 |
| **FR-009** | Pemeriksaan Non-aktif tidak muncul pada order baru & tidak dapat dipakai input hasil baru; data transaksi historis tetap utuh & tidak rusak. | FASE 1 | BR-004 |
| **FR-010** | Download Template **.xlsx multi-sheet** (sheet Pemeriksaan/Teknik/Item + sheet Petunjuk), Import .xlsx, dan Export (simetris template FASE 1, **tanpa kolom atribut FASE 2**). CSV tidak didukung. | FASE 1 | US-005, BR-022, S4-S5 |
| **FR-011** | Import **tambah baru saja** (tolak duplikat natural key, tanpa upsert). Multi-teknik/multi-item via **sheet Teknik / sheet Item terpisah**. Child orphan ditolak. | FASE 1 | US-005, BR-009, BR-016, BR-022 |
| **FR-012** | Dashboard menampilkan ringkasan audit **Last Update** (dd/mm/yyyy + nama user) via tooltip. | FASE 1 | BR-010, US-007 |
| **FR-013** | **Organ Tubuh, Zat Kontras, Metode = field input OPTIONAL** pada anchor LOINC (teknik bila ada teknik; parent bila tanpa). Disimpan sebagai kolom + relasi master. **[ASUMSI]** level pelekatan mengikuti anchor LOINC. | **[FASE 2]** | BR-008, BR-023, US-017 |
| **FR-014** | **Penyimpanan WAJIB 1:N** (pemeriksaan↔teknik & pemeriksaan↔item). Teknik & item dikelola sebagai child dinamis di form (tambah/kurangi baris) — aktif penuh fase ini. | FASE 1 | BR-009, BR-011, US-009 |
| **FR-015** | Sistem **tidak boleh memblokir simpan** karena field optional (LOINC) kosong; dapat dilengkapi bertahap via Edit/Import. | FASE 1 | BR-012, US-010 |
| **FR-016** | Kelola **Teknik Pemeriksaan** sebagai child dinamis Pemeriksaan: **Nama Teknik + LOINC Teknik (opsional)**; menegakkan **exclusive-or LOINC** parent vs teknik. *(Sisi Tubuh/Organ/Zat Kontras/Metode pada teknik → FR-013 [FASE 2].)* | FASE 1 | BR-013, BR-011, US-011 |
| **FR-017** | **Kelola Master Modalitas** (Kode + Nama): Create/View/Update, tanpa status & tanpa delete. | **[FASE 2]** | BR-006, BR-021, BR-023, US-012 |
| **FR-018** | **Master Kode LOINC**: FASE 1 = pre-loaded read-only dari file SATUSEHAT KemKes saat deployment. **Kelola/tambah kode oleh RS (Code, Display, System, Scale, Property, Unit), tanpa status** → FASE 2. | FASE 1 (pre-load) / **[FASE 2]** (kelola) | BR-020, BR-021, BR-023, US-013 |
| **FR-019** | **Master Sisi Tubuh** (Kode SNOMED CT + Nama tampilan): Create/View/Update, tanpa status; dipakai sebagai lookup pada anchor. | **[FASE 2]** | BR-014, BR-021, BR-023, US-014 |
| **FR-020** | Import melalui alur **preview → konfirmasi**: tampilkan per sheet baris valid/invalid + alasan per baris (termasuk orphan child & pelanggaran exclusive-or LOINC); user memilih commit baris valid saja atau batalkan seluruh batch. | FASE 1 | BR-017, BR-022, US-015 |
| **FR-021** | **Audit trail per record**: catat aktor, waktu, snapshot before/after untuk Create/Update/Toggle Status; tampilkan via tab **Riwayat** pada form detail. | FASE 1 | BR-010, US-016 |
| **FR-022** | Validasi enum **Modalitas match master** (case-insensitive) pada form & import; modalitas tidak match → baris ditolak dengan alasan. | FASE 1 | BR-006, S4.2 |
| **FR-023** | **Kelola Master Organ Tubuh / Zat Kontras / Metode** (Nama tampilan + Kode opsional): Create/View/Update, tanpa status & tanpa delete; dipakai sebagai lookup pada anchor. | **[FASE 2]** | BR-008, BR-021, BR-023, US-017 |
| **FR-024** | **Resolusi child-ke-parent saat import**: tiap baris sheet Teknik/Item dicocokkan ke baris sheet Pemeriksaan via (Kode RIS + Nama Pemeriksaan); child tanpa parent valid → **invalid (orphan)**; commit menyimpan parent + child sesuai grup. | FASE 1 | BR-022, US-019 |
| **FR-025** | Pada pemeriksaan dengan **>1 teknik**, sistem mengizinkan **tiap teknik memiliki LOINC sendiri** (opsional, independen antar teknik). | FASE 1 | BR-007, BR-013, US-020 |
| **FR-026** | **Forward-compat FASE 2**: struktur DB FASE 1 menyiapkan kolom/relasi untuk atribut Sisi Tubuh/Organ/Zat Kontras/Metode & master pendukung yang dikelola, sehingga FASE 2 tidak butuh migrasi besar. *(non-UI; struktur saja)* | FASE 1 | BR-023, NFR-006 |

## 11. Data Requirements (Spesifikasi Field)

> Field/master/kolom ber-tag **[FASE 2]** disiapkan struktur DB-nya (forward-compat, FR-026) namun **belum** muncul di form/dashboard/import FASE 1.

### 11.1 Layar INPUT — Form Tambah/Edit, **Sumbu Permintaan → Pemeriksaan (parent)** — FASE 1

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_ris | **Kode RIS** | text | **Ya** | bagian *natural key*; **format bebas** | manual | Identifier RIS/PACS RS (BR-019) |
| nama_pemeriksaan | Nama Pemeriksaan | text | **Ya** | bagian *natural key*; kombinasi (Nama + Kode RIS) unik per RS | manual | BR-002 |
| modalitas_id | Modalitas | lookup (master pre-seed) | **Ya** | harus match master Modalitas pre-seed | master Modalitas (read-only) | label tampil = Kode/singkatan; dasar filter (BR-006) |
| kode_loinc_pemeriksaan | Kode LOINC (Pemeriksaan/parent) | lookup | **Tidak (optional, conditional)** | **hanya aktif bila TANPA teknik** (BR-013); bila diisi harus dari master LOINC pre-load | master LOINC (read-only) | LOINC panel/order. Pengisian = RS (BR-012) |
| ~~organ_tubuh_id (parent)~~ | Organ Tubuh (parent) | lookup | — | — | — | **[FASE 2]** — dikeluarkan dari form FASE 1 (BR-023) |
| ~~zat_kontras_id (parent)~~ | Zat Kontras (parent) | lookup | — | — | — | **[FASE 2]** — dikeluarkan dari form FASE 1 (BR-023) |
| ~~metode_id (parent)~~ | Metode (parent) | lookup | — | — | — | **[FASE 2]** — dikeluarkan dari form FASE 1 (BR-023) |
| status_aktif | Status | boolean/toggle | **Ya** | aktif / nonaktif | default **aktif** | toggle **per pemeriksaan** (BR-015); bukan delete |

### 11.2 Layar INPUT — **Sumbu Permintaan → Teknik Pemeriksaan (child dinamis, opsional, 0..n)** — FASE 1

Struktur 1:N (pemeriksaan↔teknik). Bila ada teknik, **LOINC parent dinonaktifkan** (BR-013). Tiap teknik boleh punya LOINC sendiri (Q4).

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_teknik | Nama Teknik | text | Ya (bila baris teknik dibuat) | — | manual | mis. AP, PA, Lateral, Towne, Waters, Oblique, dst. |
| kode_loinc_teknik | Kode LOINC (Teknik) | lookup | Tidak (optional) | bila diisi harus dari master LOINC pre-load | master LOINC | anchor LOINC sumbu permintaan saat ada teknik; independen antar teknik (BR-007, Q4) |
| ~~sisi_tubuh_id~~ | Sisi Tubuh | lookup | — | — | — | **[FASE 2]** — BR-014/BR-023 |
| ~~organ_tubuh_id~~ | Organ Tubuh | lookup | — | — | — | **[FASE 2]** — BR-008/BR-023 |
| ~~zat_kontras_id~~ | Zat Kontras | lookup | — | — | — | **[FASE 2]** — BR-008/BR-023 |
| ~~metode_id~~ | Metode | lookup | — | — | — | **[FASE 2]** — BR-008/BR-023 |

> Kolom Sisi Tubuh/Organ/Zat Kontras/Metode di atas **disiapkan di DB** (forward-compat, FR-026) namun **tidak ditampilkan di form FASE 1**.

### 11.3 Layar INPUT — **Sumbu Hasil → Item Hasil Pemeriksaan (child dinamis, opsional, 0..n)** — FASE 1

Struktur 1:N (pemeriksaan↔item). Dikelola sebagai child dinamis di form (aktif penuh fase ini).

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_item | Nama Item | text | Ya (bila baris item dibuat) | — | manual | item hasil yang diinput radiografer/radiolog |
| kode_loinc_item | Kode LOINC (Item/Hasil) | lookup | Tidak (optional) | bila diisi harus dari master LOINC | master LOINC | **dasar `Observation.code` ke SATUSEHAT**; optional (BR-012) |

### 11.4 Master pendukung — **Modalitas** — FASE 1 = pre-seed lookup read-only · **Kelola = [FASE 2]**

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| kode | Kode | text | Ya | unik | mis. CR, DX, CT, MR, US, MG, RF, XA, PX, NM (basis DICOM) |
| nama | Nama | text | Ya | — | kepanjangan (mis. Computed Tomography) |

> **FASE 1**: daftar Modalitas di-*seed* saat deployment (CR, DX, CT, MR/MRI, US, MG, RF, XA, PX, NM) dan dipakai sebagai **lookup read-only**; validasi import match master case-insensitive (BR-006). **Operasi Create/View/Update (tanpa status/delete) = [FASE 2]** (FR-017, BR-023). **[PERLU KONFIRMASI]** kebutuhan menambah modalitas di luar seed selama FASE 1.

### 11.5 Master pendukung — **Kode LOINC** — FASE 1 = pre-load read-only · **Kelola/tambah = [FASE 2]**

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| code | Code | text | Ya | unik | kode LOINC |
| display | Display | text | Ya | — | nama tampilan; sort A-Z saat lookup |
| system | System | text | Ya | URI LOINC | system terminologi |
| scale | Scale | text | Tidak | — | atribut LOINC |
| property | Property | text | Tidak | — | atribut LOINC |
| unit | Unit | text | Tidak | UCUM | dipakai `Observation.valueQuantity` |

> **FASE 1**: pre-load satu kali saat deployment dari file SATUSEHAT KemKes & dipakai sebagai **lookup read-only**. **Tambah kode oleh RS (Create/View/Update, tanpa status) = [FASE 2]** (FR-018, BR-023).

### 11.6 Master pendukung — **Sisi Tubuh** (label UI BodySite SNOMED CT) — **[FASE 2]**

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| kode_snomed | Kode SNOMED | text | Ya | unik | disimpan di backend (BodySite SNOMED CT) |
| nama_tampilan | Nama (Sisi Tubuh) | text | Ya | — | label ramah pengguna (BR-014) |

> **DIPINDAH ke FASE 2** (BR-023). Operasi Create/View/Update — tanpa status/delete (BR-021). Struktur DB & relasi anchor disiapkan FASE 1 (forward-compat, FR-026).

### 11.7 Master pendukung — **Organ Tubuh / Zat Kontras / Metode** — **[FASE 2]**

Tiga master pilihan dengan struktur seragam (Anatomic Region / Pharmaceutical / Method pada LOINC Radiology Playbook). Dipakai sebagai lookup pada **anchor** (Teknik bila ada teknik; Pemeriksaan/parent bila tanpa teknik).

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| kode | Kode | text | Tidak | unik bila diisi | kode internal/terminologi (opsional) |
| nama_tampilan | Nama | text | Ya | unik per master | label pilihan (mis. Organ: Thorax/Abdomen/Cranium; Zat Kontras: Tanpa Kontras/Dengan Kontras; Metode: CT/MRI/Plain/Doppler) **[ASUMSI seed]** |

> **DIPINDAH ke FASE 2** (BR-023). Operasi Create/View/Update — tanpa status/delete (BR-021). **[PERLU KONFIRMASI]** apakah Zat Kontras cukup enum tetap (Tanpa/Dengan/Tanpa & Dengan) atau master bebas; seed Organ/Metode perlu disepakati RS. Struktur DB & relasi anchor disiapkan FASE 1 (forward-compat, FR-026).

### 11.8 Field record-level / Audit — FASE 1

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| last_update_at | Last Update | datetime | auto | dd/mm/yyyy | auto-generate | ringkasan audit di dashboard |
| last_update_by | Diubah Oleh | lookup (user) | auto | `nama` user (kanonik, dari Staff A2) | auto dari sesi login | tooltip |
| audit_log[] | Riwayat | tabel | auto | aktor, waktu, aksi (Create/Update/Toggle), snapshot before/after | sistem | ditampilkan di tab **Riwayat** form detail (BR-010) |

> **Catatan v1.5:** kolom forward-compat untuk atribut **[FASE 2]** (sisi_tubuh_id, organ_tubuh_id, zat_kontras_id, metode_id pada teknik/parent) disiapkan di DB namun **tidak diekspos di UI/import FASE 1** (FR-026).

### 11.9 Layar INPUT — Import Massal (TEMPLATE MULTI-SHEET) — FASE 1

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Data Radiologi | file | Ya | **.xlsx multi-sheet saja**, sesuai template | manual upload | CSV tidak didukung fase ini |

**Struktur workbook (.xlsx) FASE 1 — 3 sheet data + 1 sheet Petunjuk:**

**Sheet `Pemeriksaan` (parent):**
`Kode_RIS (KEY); Nama_Pemeriksaan (KEY); Modalitas; Kode_LOINC_Pemeriksaan (conditional: hanya bila tanpa teknik); Status`

**Sheet `Teknik` (child, key ref ke Pemeriksaan):**
`Kode_RIS (KEY ref); Nama_Pemeriksaan (KEY ref); Nama_Teknik; Kode_LOINC_Teknik`

**Sheet `Item` (child, key ref ke Pemeriksaan):**
`Kode_RIS (KEY ref); Nama_Pemeriksaan (KEY ref); Nama_Item; Kode_LOINC_Item`

> - **[FASE 2]** kolom tambahan akan ditambahkan saat FASE 2 aktif: pada sheet Pemeriksaan `Organ_Tubuh / Zat_Kontras / Metode` (conditional parent); pada sheet Teknik `Sisi_Tubuh / Organ_Tubuh / Zat_Kontras / Metode`. **Tidak ada di template FASE 1** (BR-022/BR-023).
> - **Natural key** = `Kode_RIS` + `Nama_Pemeriksaan`. Duplikat terhadap data existing → **ditolak** (tambah baru saja, BR-016).
> - **Multi-teknik / multi-item (1:N):** baris terpisah pada sheet Teknik / sheet Item → menghilangkan ambiguitas cartesian (BR-022).
> - **Resolusi parent (FR-024):** baris Teknik/Item tanpa parent di sheet Pemeriksaan = **orphan → invalid**.
> - **Exclusive-or (BR-013):** bila suatu pemeriksaan punya baris di sheet Teknik → kolom `Kode_LOINC_Pemeriksaan` di sheet Pemeriksaan untuk key tsb harus **kosong**.
> - Kolom LOINC boleh dikosongkan (optional). `Modalitas` & LOINC (bila diisi) harus match master.
> - **Alur**: upload → **preview** (per sheet: valid/invalid + alasan per baris) → user pilih **commit baris valid** / **batalkan batch** (BR-017).
> - Kolom **Kode_KPTL** & istilah **Kode_LIS** pada lampiran PDF **dihapus/diabaikan**.

### 11.10 Layar TAMPIL — Dashboard Master Data Radiologi (FR-001, FR-002) — FASE 1

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Kode RIS | pemeriksaan.kode_ris | text | — | bagian natural key |
| Nama Pemeriksaan | pemeriksaan.nama_pemeriksaan | text | **sort** A-Z / Z-A | bagian natural key |
| Modalitas | master Modalitas (via modalitas_id) | badge **singkatan** (mis. `CT`) | **filter** | dasar filter utama |
| Kode LOINC | pemeriksaan.kode_loinc_pemeriksaan | text (+display) | — | hanya bila tanpa teknik; bisa kosong |
| Status | pemeriksaan.status_aktif | toggle (Aktif/Non-aktif) | filter | warna hijau/abu; per pemeriksaan |
| Last Update | last_update_at + last_update_by | dd/mm/yyyy + tooltip nama user | sort | ringkasan audit |
| Aksi | — | CTA: **Detail, Edit** (TANPA hapus) | — | BR-003 |

*Search bar:* by Nama Pemeriksaan & Nama Item. *Pagination:* 15 / 25 / 50 / Semua. *CTA tambahan FASE 1:* Daftar Pemeriksaan Non-aktif, Import/Export. *CTA* **Kelola Master Pendukung** (Modalitas/Kode LOINC/Sisi Tubuh/Organ/Zat Kontras/Metode) → **[FASE 2]** (tidak ditampilkan FASE 1).

### 11.11 Layar TAMPIL — Form Detail > tab **Riwayat** (audit per record) — FASE 1

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit_log.timestamp | dd/mm/yyyy HH:mm | sort desc | |
| Aktor | audit_log.user (nama) | text | — | dari Staff A2 |
| Aksi | audit_log.action | badge (Create/Update/Toggle) | filter | |
| Perubahan | audit_log.before/after | diff field before→after | — | snapshot before/after (BR-010) |

### 11.12 Layar TAMPIL — Daftar Pemeriksaan Non-aktif — FASE 1

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| (sama dgn dashboard) | pemeriksaan where status_aktif=false | sda | filter Modalitas, search | aksi: Aktifkan kembali / Edit (tanpa hapus) |

### 11.13 Layar TAMPIL — Preview Import (per sheet, sebelum commit, FR-020/FR-024) — FASE 1

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Sheet | nama sheet (Pemeriksaan/Teknik/Item) | tab/segment | filter | preview dipisah per sheet |
| Baris | nomor baris file | angka | — | |
| Status validasi | hasil validasi | badge Valid / Invalid | filter | |
| Alasan | pesan validasi | text per baris | — | mandatory kosong / Modalitas tak match / duplikat Nama+Kode RIS / **child orphan** / pelanggaran exclusive-or LOINC / LOINC tak ada di master, dst. |
| Ringkasan | agregasi | "X valid, Y invalid" per sheet + grup parent↔child + tombol **Commit valid** / **Batalkan batch** | — | BR-017, BR-022 |

### 11.14 Layar — **Kelola Master Pendukung** (CRUD UI) — **[FASE 2]**

> Layar manajemen (Create/View/Update, tanpa status/delete) untuk **Modalitas, Kode LOINC, Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode** beserta penambahan kolom atribut pada form Teknik/Pemeriksaan & template import — **dispesifikasikan & dibangun pada FASE 2** (struktur DB-nya disiapkan FASE 1, FR-026). Spesifikasi field master mengikuti §11.4–§11.7.

## 12. Non-Functional Requirements

- **NFR-001 (Performa):** Dashboard memuat ≤ 2 detik untuk ≤ 1.000 record; pencarian/filter ≤ 1 detik. [ASUMSI target, skala RS Tipe C & D]
- **NFR-002 (Skala data):** Mendukung ≥ beberapa ratus pemeriksaan + teknik + item tanpa degradasi (pagination wajib).
- **NFR-003 (Keandalan import multi-sheet):** Import melalui preview→commit; validasi per sheet & per baris; baris gagal tidak menggagalkan baris valid. Resolusi child-ke-parent (Kode RIS+Nama) konsisten; commit atomik terhadap grup parent+child yang dikonfirmasi.
- **NFR-004 (Audit & keamanan):** Semua Create/Update/Toggle tercatat (aktor + waktu + before/after) & dapat ditelusuri per record. Akses dibatasi role (RBAC A53 / Akses Menu A37). *(FASE 2: audit mencakup operasi master pendukung saat kelolanya aktif.)*
- **NFR-005 (Interoperabilitas):** **FASE 1** menyimpan kode **LOINC** (parent/teknik/item) untuk kesiapan FHIR `Observation` (LOINC item + UCUM). **[FASE 2]** menambah **SNOMED CT** (Sisi Tubuh/BodySite) & atribut penyusun **Organ (Anatomic Region) / Zat Kontras (Pharmaceutical) / Metode (Method)**. Struktur DB FASE 1 menampung pemetaan ini tanpa migrasi (NFR-006).
- **NFR-006 (Forward-compatibility):** (a) Relasi **1:N (teknik & item)** disimpan sejak FASE 1 → multi-teknik/multi-item tanpa perubahan struktur. (b) **Kolom & relasi master untuk atribut [FASE 2]** (Sisi Tubuh/Organ/Zat Kontras/Metode) & master pendukung yang dikelola **disiapkan di skema FASE 1** (FR-026) sehingga aktivasi FASE 2 = menambah UI/validasi, bukan migrasi data besar. *(trace: BR-009, BR-008, BR-023)*
- **NFR-007 (Usability):** Modalitas via lookup pre-seed (kurangi salah ketik); pesan error per-field jelas Bahasa Indonesia; field optional (LOINC) tidak menampilkan error "wajib diisi". *(FASE 2: Sisi Tubuh tampil label ramah pengguna walau menyimpan SNOMED; master pendukung tanpa status menyederhanakan UI.)*
- **NFR-008 (Kompatibilitas RS Tipe C & D):** Antarmuka sederhana; import/export berbasis spreadsheet umum **.xlsx multi-sheet**; LOINC & Modalitas pre-loaded/pre-seed mengurangi beban entri FASE 1; phasing menjaga lingkup FASE 1 tetap ringan.
- **NFR-009 (Toleransi data tidak lengkap):** Sistem tetap berfungsi saat field optional (LOINC) kosong — tanpa error, tanpa memblokir alur hilir (kecuali pengiriman SATUSEHAT yang butuh LOINC, di mana ketiadaan kode menonaktifkan pengiriman item tsb tanpa menggagalkan modul). *(trace: BR-012, FR-015)*
- **NFR-010 (Integritas siklus hidup):** Penonaktifan pemeriksaan tidak boleh menghapus/merusak referensi pada transaksi historis; operasi destruktif (hard/soft delete) tidak tersedia di seluruh entitas (BR-003). Master pendukung dirujuk by id → perubahan label aman terhadap data existing (BR-021).
- **NFR-011 (Phasing tanpa regresi):** Aktivasi **FASE 2** (Kelola Master Pendukung + atribut Sisi Tubuh/Organ/Zat Kontras/Metode) tidak boleh mengubah perilaku/data FASE 1 yang sudah berjalan; penambahan kolom import/form bersifat aditif & kompatibel mundur dengan template FASE 1. *(trace: BR-023, NFR-006)*

## 13. Integrasi Eksternal

### SATUSEHAT (utama)
- **Standar:** **LOINC** untuk pemeriksaan radiologi & nuklir (FHIR `Observation`) — **FASE 1**; **SNOMED CT** untuk BodySite (Sisi Tubuh) — **[FASE 2]**.
- **Sumber katalog kode:**
  - LOINC Radiologi: https://satusehat.kemkes.go.id/platform/docs/id/terminology/loinc/radiologi/
  - LOINC Nuklir: https://satusehat.kemkes.go.id/platform/docs/id/terminology/loinc/nuklir/
  - LOINC Radiology Playbook (acuan model dua sumbu & atribut penyusun: Anatomic Region/Organ, Laterality/Sisi Tubuh, Pharmaceutical/Zat Kontras, Method/Metode — atribut ini **[FASE 2]**).
- **Pre-load:** master Kode LOINC di-*pre-load* satu kali dari file SATUSEHAT KemKes saat deployment & dipakai read-only di FASE 1; **penambahan kode oleh RS = [FASE 2]** (FR-018).
- **Peran master ini (FASE 1):** menyediakan **tempat pemetaan LOINC multi-lokasi** — tingkat **Pemeriksaan/parent** (bila tanpa teknik), tingkat **Teknik** (bila ada teknik — exclusive-or BR-013; tiap teknik bisa punya LOINC sendiri, Q4), dan tingkat **Item/Hasil** (observation). **LOINC item** = nilai untuk `Observation.code`.
- **Pemetaan atribut → FHIR:** `unit` (UCUM, master LOINC) → `Observation.valueQuantity` *(FASE 1)*. **[FASE 2]:** `sisi_tubuh` (SNOMED) → Laterality/BodySite; `organ_tubuh` → Anatomic Region/BodySite; `zat_kontras` → Pharmaceutical/contrast; `metode` → Method. **[PERLU KONFIRMASI]** representasi FHIR persis tiap atribut diserahkan ke modul integrasi.
- **Sifat pengisian (Q5 — final):** LOINC & atribut **optional**, **tanggung jawab RS**, di luar kuasa tim product. Modul hanya menjamin **ketersediaan field & jalur input**. Item tanpa LOINC tetap valid sebagai master namun tidak dapat dikirim sebagai `Observation` sampai dilengkapi.
- **Mekanisme lookup katalog LOINC (realtime API vs cache/master lokal):** diserahkan ke keputusan teknis tim developer. Pendekatan pre-load mendukung mode master lokal.
- **Catatan:** Pengiriman aktual `Observation` ke SATUSEHAT **di luar scope** modul master ini.

### KPTL (BPJS) — **TIDAK termasuk**
- Meskipun lampiran PDF mencantumkan Kode KPTL, **keputusan user: KPTL out-scope**. Tidak ada field, kolom, validasi, maupun integrasi KPTL.

### RIS/PACS (konsumen hilir)
- `kode_ris` menjadi identifier yang dirujuk saat order radiologi di-*push* ke RIS (lihat `g-support-radiology-flow`). Modul ini hanya menyimpan kode; integrasi order ada di modul pelayanan radiologi.

### Internal (lintas-PRD)
- **Staff (A2)/Jabatan (A55):** sumber `nama` aktor untuk audit (Create/Update/Toggle).
- **RBAC (A53)/Akses Menu (A37):** pembatasan akses pengelola master.
- **Unit (A3)/Instalasi (A19) & Tindakan/Tarif (A10/A13/A43):** **belum dikaitkan** (keputusan user).
- **Item Pemeriksaan Lab (A14):** pola import preview/status/LOINC sejenis — reuse konvensi `file_import`, `mode_import` (dibatasi tambah-baru), `status_aktif`.

## Asumsi
- [KEPUTUSAN USER — PHASING v1.5] Seluruh fitur Kelola Master Pendukung (CRUD UI: Modalitas, Kode LOINC, Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode) DIPINDAH ke FASE 2. Pada FASE 1: Modalitas pre-seed & Kode LOINC pre-load (KemKes) hanya dipakai sebagai lookup read-only. (BR-023, FR-017/018/019/023, §11.4–§11.7, §11.14)
- [KEPUTUSAN USER — PHASING v1.5] Organ Tubuh, Zat Kontras, Metode, dan Sisi Tubuh — baik masternya maupun pemakaiannya sebagai field input pada Teknik/Pemeriksaan — DIPINDAH ke FASE 2; dikeluarkan dari form, dashboard, template import/export, dan validasi FASE 1. (BR-008, BR-014, BR-023, FR-013, §11.1/§11.2/§11.6/§11.7/§11.9)
- [KEPUTUSAN USER — PHASING v1.5] Struktur DB FASE 1 disiapkan forward-compatible (kolom relasi atribut FASE 2 + tabel master pendukung) agar aktivasi FASE 2 tidak butuh migrasi besar dan tidak meregresi FASE 1. (FR-026, NFR-006, NFR-011, BR-023)
- [ASUMSI — PHASING] FASE 1 dianggap cukup onboard dengan seed Modalitas default & pre-load LOINC KemKes (tanpa kemampuan tambah master via UI); risiko kebutuhan tambah Modalitas/LOINC di luar seed selama FASE 1 ditandai [PERLU KONFIRMASI]. (BR-006, FR-018)
- [KEPUTUSAN USER] Teknik & Item Hasil sebagai child dinamis di form AKTIF PENUH fase ini (Create/View/Update). FASE 1 atribut Teknik = Nama Teknik + LOINC Teknik opsional saja (atribut lain FASE 2). (BR-011, FR-014, FR-016)
- [KEPUTUSAN USER] Pada pemeriksaan multi-teknik, tiap teknik BOLEH memiliki LOINC sendiri namun OPTIONAL (independen antar teknik). (BR-007, BR-013, FR-025)
- [KEPUTUSAN USER] Tanggung jawab kelengkapan LOINC ada di RS — bukan KPI tim product; sistem tidak memblokir simpan bila field optional kosong. (BR-012, FR-015, NFR-009)
- [KEPUTUSAN USER] Representasi import = TEMPLATE MULTI-SHEET .xlsx (sheet Pemeriksaan / Teknik / Item terpisah, di-key Kode RIS + Nama Pemeriksaan); FASE 1 tanpa kolom atribut FASE 2. Export simetris dengan template import FASE 1. (BR-022, FR-010, FR-024)
- [KEPUTUSAN USER] Toggle status Aktif/Nonaktif berlaku PER PEMERIKSAAN saja; Teknik & Item Hasil mengikuti status parent. (BR-015)
- [KEPUTUSAN USER] Pemeriksaan Non-aktif tidak dapat dipakai untuk order/input hasil baru, namun data transaksi historis yang pernah memakainya tidak hilang & tidak rusak. (BR-004, NFR-010)
- [KEPUTUSAN USER] Audit trail ditelusuri PER RECORD (tab Riwayat di form detail); tidak ada halaman audit terpusat; mencatat aktor, waktu, snapshot before/after untuk Create/Update/Toggle. (BR-010, FR-021)
- [KEPUTUSAN USER] Kode RIS format bebas (tanpa validasi panjang/prefix/karakter); tetap wajib & bagian natural key. (BR-019)
- [KEPUTUSAN USER] Import = TAMBAH BARU saja (tolak duplikat natural key Nama+Kode RIS, tanpa upsert); perubahan record existing via form satuan. (BR-016)
- [KEPUTUSAN USER] Model dua sumbu: sumbu permintaan (Modalitas→Pemeriksaan→Teknik) & sumbu hasil (Item Pemeriksaan), masing-masing punya anchor LOINC.
- [KEPUTUSAN USER] Natural key = Nama Pemeriksaan + Kode RIS (Modalitas DILEPAS dari key). (BR-002)
- [KEPUTUSAN USER] Mandatory pada Pemeriksaan: Nama Pemeriksaan, Kode RIS, Modalitas, Status. (BR-001)
- [KEPUTUSAN USER] Exclusive-or LOINC: punya teknik → di teknik (parent kosong); tanpa teknik → opsional di parent. (BR-013) — FASE 2 memperluas exclusive-or ke atribut Sisi Tubuh/Organ/Zat Kontras/Metode.
- [KEPUTUSAN USER] Modalitas = master (Kode+Nama); validasi import match master case-insensitive. (BR-006)
- [KEPUTUSAN USER] Kode LOINC = master, pre-loaded sekali dari file SATUSEHAT KemKes saat deployment. (FR-018)
- [KEPUTUSAN USER] LOINC opsional di seluruh lokasi tetapi bila diisi harus dari master. (BR-020)
- [KEPUTUSAN USER] Single modalitas per pemeriksaan; multi-modalitas out-scope fase ini. (BR-018)
- [KEPUTUSAN USER] Import format .xlsx saja (CSV belum didukung); alur upload → preview validasi per baris/sheet → konfirmasi commit (valid saja) / batalkan batch. (BR-017, FR-020)
- [KEPUTUSAN USER] Tidak ada operasi delete apa pun (permanen maupun sementara/soft-delete) di seluruh entitas; pemeriksaan via status Aktif/Non-aktif. (BR-003, BR-021)
- [KEPUTUSAN USER] KPTL TIDAK termasuk scope (dihapus dari dashboard/form/template/integrasi).
- [KEPUTUSAN USER] Item radiologi belum dikaitkan ke Unit/Instalasi (A3/A19) maupun Tindakan/Tarif (A10/A13/A43) fase ini.
- [KEPUTUSAN USER] Mekanisme lookup katalog LOINC (realtime vs cache lokal) diserahkan ke tim dev — di luar PRD ini (didukung pendekatan pre-load master lokal).
- [ASUMSI] Penyimpanan relasi 1:N (pemeriksaan↔teknik & pemeriksaan↔item) wajib agar multi-teknik/multi-item dapat ditambah tanpa migrasi. (BR-009)
- [ASUMSI] Seed pilihan Organ Tubuh/Zat Kontras/Metode (mis. Thorax/Abdomen/Cranium; Tanpa/Dengan Kontras; CT/MRI/Plain/Doppler) bersifat awal & perlu disepakati RS — relevan saat scoping FASE 2. (§11.7)
- [ASUMSI] Kondisi As-Is (data hardcoded, perubahan via developer) diturunkan dari draft overview user.
- [ASUMSI] Aktor pengelola = Admin Master Radiologi (PIC RS); dokter perujuk/spesialis radiologi & Tim IT RS/Auditor Mutu sebagai konsumen tak langsung; alur diturunkan dari draft final + jawaban user + analogi A14 + BPMN g-support-radiology-flow & g-emr-patient-identity (modul ini belum punya BPMN sendiri).
- [ASUMSI] Akses modul dibatasi RBAC (A53)/Akses Menu (A37).
- [ASUMSI] Reuse konvensi field kanonik lintas-PRD: status_aktif (boolean aktif/nonaktif), file_import (.xlsx), nama (user audit). mode_import dibatasi 'tambah' (tanpa update) sesuai BR-016.

## Pertanyaan Terbuka
- [BR-006/§11.4 — PHASING] Karena Kelola Master Pendukung (termasuk tambah Modalitas) dipindah ke FASE 2, sedangkan Modalitas mandatory di FASE 1: apakah RS dapat onboard FASE 1 cukup dengan seed Modalitas default (CR/DX/CT/MR/US/MG/RF/XA/PX/NM)? Bila ada RS yang butuh modalitas di luar seed, perlukah jalur konfigurasi sementara di FASE 1 atau menunggu FASE 2? (BR-023)
- [FR-018/§11.5 — PHASING] LOINC FASE 1 hanya pre-load read-only (tambah kode RS = FASE 2). Apakah cakupan pre-load KemKes cukup untuk kebutuhan pemetaan LOINC FASE 1, atau ada risiko RS butuh menambah kode LOINC sebelum FASE 2 (mis. kode lokal/khusus)?
- [BR-008/FR-013/§11.7 — FASE 2] Level pelekatan Organ Tubuh/Zat Kontras/Metode: [ASUMSI] mengikuti anchor LOINC (Teknik bila ada teknik; Pemeriksaan/parent bila tanpa). Konfirmasi saat scoping FASE 2 apakah benar mengikuti anchor atau selalu di level Pemeriksaan.
- [§11.7 — FASE 2] Zat Kontras: cukup enum tetap (Tanpa Kontras / Dengan Kontras / Tanpa & Dengan) atau master pilihan bebas (mencakup nama agen kontras)? Seed Organ Tubuh & Metode perlu disepakati dengan RS sebelum FASE 2.
- [BR-021/BR-023 — FASE 2] Master pendukung TANPA status & TANPA delete: bagaimana menangani opsi yang keliru ditambahkan dan sudah dipakai? (mengandalkan Update untuk koreksi label; perlu konfirmasi apakah cukup atau butuh mekanisme 'sembunyikan dari pilihan baru').
- [NFR-006/FR-026 — PHASING] Konfirmasi cakupan struktur DB forward-compat yang disiapkan di FASE 1 untuk atribut/masters FASE 2 (kolom sisi_tubuh_id/organ_tubuh_id/zat_kontras_id/metode_id pada teknik & parent + tabel master pendukung), agar aktivasi FASE 2 benar-benar tanpa migrasi besar.
- [BR-022/§11.9 — PHASING] Template import FASE 1 belum memuat kolom Sisi Tubuh/Organ/Zat Kontras/Metode. Konfirmasi bahwa penambahan kolom tsb di FASE 2 bersifat aditif & kompatibel mundur (file template FASE 1 tetap dapat diimport setelah FASE 2 aktif). (NFR-011)
- [BR-013/Q4] Untuk pemeriksaan multi-teknik dengan LOINC per-teknik, representasi `Observation`/order ditegaskan oleh modul Pelayanan/Integrasi (di luar master ini).
- Perlu kesepakatan tertulis dengan manajemen/RS bahwa kelengkapan pengisian LOINC adalah tanggung jawab RS (bukan KPI tim product). (Q5, BR-012)
- [Integrasi — FASE 2] Pemetaan FHIR persis untuk Organ Tubuh (Anatomic Region/BodySite), Zat Kontras (Pharmaceutical), Metode (Method), Sisi Tubuh (Laterality/BodySite) diserahkan ke modul integrasi — perlu disepakati elemen/extension FHIR target.