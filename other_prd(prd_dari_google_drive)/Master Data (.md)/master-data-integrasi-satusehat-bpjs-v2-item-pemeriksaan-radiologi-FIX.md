# PRD — Master Data Pemeriksaan Radiologi (A29, Integrasi SATUSEHAT BPJS V2)

## 1. Metadata Dokumen
* **Approval**: [PERLU KONFIRMASI: Nama Stakeholder, Jabatan, Tanggal]
* **Related Documents**: List Fitur V2.xlsx (A29); Overview — Master Data Pemeriksaan Radiologi (draft user, final fase ini); Data Requirement - Neurovi - Master Data Radiologi.pdf; Template Export/Import Data Pemeriksaan Radiologi.pdf; PRD terkait: A14 (Item Pemeriksaan Lab), A3 (Unit), A2 (Staff), A10 (Tindakan), A13 (Procedure); SATUSEHAT Terminology — LOINC Radiologi & Nuklir, LOINC Radiology Playbook, referensi LOINC SATUSEHAT KemKes (pre-load); SNOMED CT (BodySite).
* **Document Version**: **1.5** — Pengembangan (PHASING) atas instruksi user. Perubahan utama dari v1.4: (1) Seluruh fitur **Kelola Master Pendukung** (CRUD UI: Modalitas, Kode LOINC, Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode) dipindah ke **FASE 2**; pada FASE 1, Modalitas hanya **pre-seed** & Kode LOINC hanya **pre-load** KemKes sebagai **lookup read-only**. (2) **Organ Tubuh, Zat Kontras, Metode, Sisi Tubuh** — master maupun field input pada Teknik/Pemeriksaan — dipindah ke **FASE 2**. (3) Semua bagian ditandai **[FASE 2]** pada butir terkait. FASE 1 fokus: CRUD Pemeriksaan + Teknik + Item Hasil, status Aktif/Nonaktif per-Pemeriksaan, import/export multi-sheet, audit per-record, pemetaan LOINC opsional (parent/teknik/item). Mewarisi keputusan v1.x–v1.4 (model dua sumbu; natural key = Nama Pemeriksaan + Kode RIS; Kode RIS & Modalitas mandatory; exclusive-or LOINC parent vs teknik; tanpa hard/soft delete; status per-Pemeriksaan; child Teknik & Item dinamis; audit before/after per record; import tambah-baru via preview→commit; single modalitas; LOINC optional & tanggung jawab RS; KPTL out-scope; belum dikaitkan Unit/Tindakan).

## 2. Overview & Background

* **Overview/Brief Summary**:
  **Master Data Pemeriksaan Radiologi** adalah modul Control Panel (kode **A29**) yang mengelola seluruh basis data pemeriksaan radiologi rumah sakit secara terpusat, dapat dikelola mandiri oleh **Admin Master Radiologi** tanpa intervensi developer, dan menyiapkan landasan interoperabilitas **SATUSEHAT** melalui pemetaan kode **LOINC** dan **SNOMED CT**. Pada SIMRS v1, daftar pemeriksaan radiologi masih *hardcoded* di backend — setiap penambahan/perubahan harus lewat siklus permintaan ke tim IT dan deployment. Modul ini memindahkan kendali pengelolaan layanan radiologi dari kode aplikasi ke tangan admin master data RS.

  > ### 🔖 Pembagian Fase (PHASING) — keputusan user (v1.5)
  > - **FASE 1 (cakupan PRD ini, aktif sekarang):** CRUD Pemeriksaan + Teknik + Item Hasil, status Aktif/Nonaktif per-Pemeriksaan, import/export multi-sheet, audit per-record, dan **pemetaan LOINC opsional** (parent/teknik/item). Master pendukung inti — **Modalitas** (pre-seed) dan **Kode LOINC** (pre-load KemKes) — tersedia sebagai **lookup read-only** (tanpa UI kelola).
  > - **FASE 2 (ditunda):** (a) **Kelola Master Pendukung** — CRUD UI untuk **Modalitas, Kode LOINC, Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode**; dan (b) **Organ Tubuh, Zat Kontras, Metode, Sisi Tubuh** sebagai master sekaligus field input pada Teknik/Pemeriksaan.
  > Seluruh butir terkait ditandai **[FASE 2]**.

  **Model dua sumbu (keputusan user — final):**
  - **Sumbu permintaan** — **Modalitas → Pemeriksaan → Teknik** — dipakai dokter saat *order*. Anchor LOINC pada tingkat Pemeriksaan (bila tanpa teknik) atau tingkat Teknik (bila punya teknik).
  - **Sumbu hasil** — **Item Pemeriksaan (Item Hasil)** — dipakai radiografer/radiolog saat *input hasil*. Anchor LOINC pada tingkat item (LOINC Radiology Playbook & referensi LOINC SATUSEHAT KemKes).

  **Entitas FASE 1:** Pemeriksaan Radiologi (utama), Teknik Pemeriksaan (child dinamis opsional — Nama Teknik + LOINC Teknik opsional), Item Hasil Pemeriksaan (child dinamis opsional — Nama Item + LOINC Item opsional), serta master pendukung inti sebagai **lookup read-only**: **Modalitas** (pre-seed) dan **Kode LOINC** (pre-load KemKes). **Dipindah ke FASE 2:** Sisi Tubuh (BodySite SNOMED CT), Organ Tubuh (Anatomic Region), Zat Kontras (Pharmaceutical), Metode (Method) — beserta seluruh UI Kelola Master Pendukung.

  **Prinsip kunci (FASE 1):** (1) **Tanpa operasi hapus** apa pun — siklus hidup via status **Aktif/Nonaktif**. (2) **Status hanya per-Pemeriksaan**: Teknik & Item mengikuti parent; master pendukung TIDAK punya status. (3) **Teknik & Item = child dinamis penuh** (tambah/kurangi baris di form). (4) **Audit trail penuh** (aktor, waktu, before/after) per Create/Update/Toggle — ditelusuri **per record** (tab "Riwayat"). (5) **Onboarding via bulk import** template Excel **multi-sheet** (.xlsx — sheet Pemeriksaan/Teknik/Item) dengan alur **upload → preview validasi → commit**; **tambah baru saja** (tolak duplikat, tanpa upsert). (6) **LOINC OPTIONAL** di seluruh lokasi; pengisian = **tanggung jawab RS**, di luar kuasa tim product → bukan metrik keberhasilan produk.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini):
        1. Daftar pemeriksaan radiologi *hardcoded* di backend → setiap penambahan/perubahan lewat developer (lambat, bergantung pihak ketiga; berat bagi RS Tipe C & D dengan SDM IT terbatas). [ASUMSI dari draft]
        2. Permintaan layanan baru diajukan ke tim IT → developer mengubah kode → deployment.
        3. Tidak ada pemetaan LOINC → hasil radiologi tidak dapat dikirim ke SATUSEHAT (mandat Permenkes RME & interoperabilitas nasional).
        4. Penghapusan layanan lama berisiko merusak integritas data transaksi historis.
        5. Tidak ada Teknik/Sisi Tubuh/atribut LOINC (Organ/Zat Kontras/Metode) terstruktur maupun pemetaan SNOMED CT BodySite.
    * **To-Be — FASE 1 (aktif)**:
        1. Admin Master Radiologi membuka **Control Panel > Master Data Pemeriksaan Radiologi**.
        2. Sistem menampilkan dashboard (list + filter Modalitas + search + pagination).
        3. **Modalitas (pre-seed)** & **Kode LOINC (pre-load KemKes)** tersedia sebagai **lookup read-only** — admin tidak mengelolanya di FASE 1 *(UI kelola = [FASE 2])*.
        4. Admin **Tambah/Ubah** Pemeriksaan via formulir dua sumbu (Teknik & Item = child dinamis): Sumbu permintaan (Nama, Kode RIS, Modalitas + Teknik opsional: Nama Teknik + LOINC Teknik opsional) & Sumbu hasil (Item Hasil opsional: Nama Item + LOINC Item opsional).
        5. Sistem memvalidasi mandatory (Nama, Kode RIS, Modalitas, Status), uniqueness (Nama + Kode RIS), exclusive-or LOINC (parent vs teknik), referensi master (Modalitas/LOINC).
        6. Sistem menyimpan record + audit *before/after*; status default **Aktif**.
        7. Onboarding massal: Download Template multi-sheet (.xlsx) → isi sheet Pemeriksaan/Teknik/Item → Import → Preview validasi per baris/sheet (termasuk resolusi child-ke-parent) → Commit (valid saja) atau Batalkan batch.
        8. Menghentikan layanan: admin **menonaktifkan Pemeriksaan**. Pemeriksaan hilang dari order/input hasil baru; data historis tetap utuh. Tidak ada hapus.
        9. Pemeriksaan aktif tersedia di Formulir Permintaan Radiologi & order ke RIS; bila LOINC item terisi, kode siap dipakai modul integrasi membentuk FHIR `Observation` ke SATUSEHAT.
    * **To-Be — [FASE 2] (ditunda)**: (a) **Kelola Master Pendukung** — tambah/ubah Modalitas (Kode+Nama), Sisi Tubuh (SNOMED), Organ Tubuh, Zat Kontras, Metode, atau tambah Kode LOINC (di luar pre-load) — tanpa status (Create/View/Update). (b) **Atribut LOINC pada form** — tiap Teknik (atau parent bila tanpa teknik) dapat diisi Sisi Tubuh, Organ Tubuh, Zat Kontras, Metode (opsional), mengikuti anchor & exclusive-or LOINC.

    > [ASUMSI] Alur aktor/keputusan diturunkan dari draft overview final user + jawaban pertanyaan terbuka + pola master data lintas-modul (analogi A14) dan BPMN `g-support-radiology-flow`/`g-emr-patient-identity` (modul ini belum punya BPMN sendiri).

## 3. Goals & Metrics

> Metrik berlaku untuk **FASE 1** kecuali ditandai **[FASE 2]**.

| Tujuan | Fase | Metrik Terukur |
|--------|------|----------------|
| Pengelolaan pemeriksaan mandiri tanpa developer | FASE 1 | 100% penambahan/perubahan pemeriksaan, teknik, & item via UI oleh admin (0 deployment) |
| Kesiapan struktur SATUSEHAT (LOINC dasar) | FASE 1 | 100% record dapat menyimpan pemetaan LOINC di tiga lokasi (pemeriksaan/teknik/item). *Kelengkapan pengisian LOINC TIDAK dijadikan metrik produk — tanggung jawab RS (Q5).* |
| Kesiapan struktur multi-child | FASE 1 | 100% penyimpanan memakai struktur **1:N** (pemeriksaan↔teknik & pemeriksaan↔item), multi-teknik/multi-item tanpa migrasi |
| Integritas data historis | FASE 1 | 0 kasus error/data hilang/rusak pada transaksi lama akibat penonaktifan pemeriksaan |
| Keandalan onboarding (import multi-sheet) | FASE 1 | Import 1 file template (sheet Pemeriksaan/Teknik/Item) berhasil melewati preview→commit untuk ≥ 100 baris pemeriksaan dengan resolusi child-ke-parent benar & laporan baris ditolak + alasan per baris jelas |
| Akuntabilitas perubahan | FASE 1 | 100% operasi Create/Update/Toggle Status tercatat di audit trail (aktor + waktu + before/after) & dapat ditelusuri per record |
| Kemudahan pencarian | FASE 1 | Petugas menemukan pemeriksaan via filter Modalitas + search ≤ 5 detik [ASUMSI] |
| Kualitas data | FASE 1 | 0 duplikat natural key (Nama Pemeriksaan + Kode RIS) per RS; 0 child *orphan* tersimpan |
| **Kelengkapan atribut LOINC Playbook (Organ/Zat Kontras/Metode/Sisi Tubuh)** | **[FASE 2]** | 100% atribut dapat dipilih dari master & disimpan pada anchor; UI Kelola Master Pendukung tersedia |
| **Pengelolaan master pendukung mandiri** | **[FASE 2]** | 100% penambahan/koreksi Modalitas/LOINC/Sisi Tubuh/Organ/Zat Kontras/Metode via UI (0 deployment) |

> **Catatan metrik LOINC:** target lama "≥90% item punya LOINC" **dicabut sebagai metrik produk** (Q5) — kelengkapan LOINC bergantung pada RS. Produk cukup menjamin **ketersediaan field & jalur input**.

## 4. Scope Definition & Phasing

### 4.1 Entitas yang dikelola

| Entitas | Fase | Sifat | Atribut Utama |
|---|---|---|---|
| **Pemeriksaan Radiologi** | **FASE 1** | Entitas utama | Nama Pemeriksaan, Kode RIS, Modalitas, Struktur Teknik, LOINC parent (conditional), Status |
| **Teknik Pemeriksaan** | **FASE 1** | Child dinamis Pemeriksaan, **opsional (0..n)** | Nama Teknik, LOINC Teknik (opsional). *(Sisi Tubuh, Organ, Zat Kontras, Metode → **[FASE 2]**)* |
| **Item Hasil Pemeriksaan** | **FASE 1** | Child dinamis Pemeriksaan, **opsional (0..n)** | Nama Item, LOINC Item (opsional) |
| **Modalitas** | **FASE 1 = lookup read-only (pre-seed)** · **Kelola = [FASE 2]** | Master pendukung | Kode, Nama |
| **Kode LOINC** | **FASE 1 = lookup read-only (pre-load KemKes)** · **Kelola/tambah = [FASE 2]** | Master pendukung | Code, Display, System, Scale, Property, Unit |
| **Sisi Tubuh** | **[FASE 2]** | Master pendukung (BodySite SNOMED CT) | Kode SNOMED, Nama tampilan |
| **Organ Tubuh** | **[FASE 2]** | Master pendukung (Anatomic Region) | Kode (opsional), Nama tampilan |
| **Zat Kontras** | **[FASE 2]** | Master pendukung (Pharmaceutical) | Kode (opsional), Nama tampilan |
| **Metode** | **[FASE 2]** | Master pendukung (Method) | Kode (opsional), Nama tampilan |

### 4.2 Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) |
|-------------|---------------------|--------------------|
| Dashboard Master Radiologi | List, filter Modalitas, search, sorting, pagination + Daftar Pemeriksaan Non-aktif | — |
| Formulir Tambah/Ubah (dua sumbu) | Pemeriksaan + Teknik (Nama+LOINC opsional) + Item Hasil (Nama+LOINC opsional); child dinamis penuh | Atribut Sisi Tubuh/Organ/Zat Kontras/Metode sebagai field input (F2-B/F2-C) |
| CRUD Pemeriksaan/Teknik/Item | Create/View/Update; **hard delete TIDAK ada** (BR-003) | — |
| Status | Toggle Aktif/Nonaktif **per Pemeriksaan** (Teknik/Item ikut parent, BR-015) | — |
| Master pendukung inti | Modalitas pre-seed & LOINC pre-load KemKes = **lookup read-only** | **Kelola Master Pendukung (CRUD UI)** semua master (F2-A) |
| Pemetaan LOINC | Parent (conditional)/Teknik/Item — semua optional (BR-007/BR-012) | + atribut penyusun (Organ/Sisi/Zat/Metode) |
| Import/Export | Bulk import template **.xlsx multi-sheet** (Pemeriksaan/Teknik/Item), upload→preview→commit, tambah-baru; Download Template + Export simetris | Kolom atribut FASE 2 ditambahkan (aditif, kompatibel mundur) |
| Audit | Audit trail penuh Create/Update/Toggle per record (tab Riwayat) | + audit operasi master pendukung |

**FASE 2 rinci:** **F2-A** Kelola Master Pendukung (CRUD UI: Modalitas, Kode LOINC, Sisi Tubuh, Organ, Zat Kontras, Metode — tanpa status, tanpa delete); **F2-B** atribut LOINC (Sisi Tubuh/Organ/Zat Kontras/Metode) sebagai field optional pada anchor + kolom template import/export & validasi; **F2-C** exclusive-or atribut parent vs teknik mengikuti anchor LOINC. *(Struktur DB FASE 1 forward-compatible — NFR-006.)*

**Out of Scope**:
1. **Hard delete** record apa pun. **Juga tidak ada soft-delete/arsip** — penghentian layanan hanya via status Non-aktif (per Pemeriksaan). (BR-003)
2. **Kelola Master Pendukung (CRUD UI) di FASE 1** — dipindah ke FASE 2 (F2-A, BR-023). FASE 1 hanya pakai Modalitas pre-seed & LOINC pre-load sebagai lookup read-only.
3. **Sisi Tubuh / Organ Tubuh / Zat Kontras / Metode di FASE 1** (master maupun field input) — dipindah ke FASE 2 (F2-B/F2-C, BR-023).
4. **Status Aktif/Nonaktif pada master pendukung** — master pendukung hanya daftar pilihan tanpa status (BR-021).
5. **Pengelolaan kode KPTL** — tidak ada field/kolom/CTA KPTL di dashboard, form, maupun template (meski muncul di lampiran PDF).
6. **Keterkaitan ke modul lain** — relasi ke Master Unit/Instalasi (A3/A19) dan Master Tindakan/Tarif (A10/A13/A43) belum dikerjakan.
7. **Targeting kelengkapan pengisian LOINC** — pengisian = tanggung jawab RS (Q5); tanpa enforcement/KPI internal.
8. **Pengiriman Observation/hasil ke SATUSEHAT** — modul ini hanya menyediakan pemetaan kode; pengiriman aktual di modul Pelayanan Radiologi / Integrasi.
9. **Order/permintaan radiologi & input expertise** — ranah `g-support-radiology-flow`, bukan master data.
10. **Multi-modalitas pada satu pemeriksaan** — fase ini **single modalitas saja** (BR-018).
11. **Update massal via import (upsert)** — import hanya penambahan baru; perubahan existing via form satuan (BR-016).
12. **Halaman audit terpusat lintas-record** — audit cukup ditelusuri per record.

## 5. Related Features

| Code | Menu | Relasi |
|------|------|--------|
| **A29** | Control Panel > Master Data / Integrasi SATUSEHAT BPJS V2 > Item Pemeriksaan Radiologi (New) | **Modul ini** |
| A14 | Master Data > Item Pemeriksaan Laboratorium | Pola sejenis (LOINC, status aktif, import preview) — reuse `file_import`, `mode_import`, `status_aktif` |
| A2 / A55 | Staff / Jabatan | Sumber `nama` user pada audit (aktor Create/Update/Toggle) |
| A37 / A53 | Akses Menu / RBAC | Pembatasan akses pengelola master radiologi |
| A3 | Master Data > Unit | **Belum dikaitkan** (keputusan user) — potensi lookup unit radiologi fase berikut |
| A19 | Master Data > Instalasi (New) | **Belum dikaitkan** (keputusan user) |
| A10 / A13 / A43 | Tindakan / Procedure / Tarif | **Belum dikaitkan** (keputusan user) — pemetaan tarif menyusul |

**Standar/terminologi acuan:** SATUSEHAT — LOINC Radiologi & Nuklir (acuan FASE 1), **LOINC Radiology Playbook** (acuan model dua sumbu & atribut penyusun: Anatomic Region/Organ, Laterality/Sisi Tubuh, Pharmaceutical/Zat Kontras, Method/Metode — atribut ini **[FASE 2]**), referensi **LOINC SATUSEHAT KemKes** (pre-load FASE 1), serta **SNOMED CT** (BodySite untuk Sisi Tubuh — **[FASE 2]**).

**Konsumen master ini (hilir):** Formulir Permintaan Penunjang Radiologi (sumbu permintaan: Modalitas→Pemeriksaan→Teknik), alur `g-support-radiology-flow` (push order ke RIS), input hasil radiografer/radiolog (sumbu hasil: Item), dan tampilan hasil penunjang di EMR (`g-emr-patient-identity`).

## 6. Business Process & User Stories

* **State Machine Table** (status **per Pemeriksaan**; Teknik & Item mengikuti parent — BR-015):

| Status | Deskripsi | Efek | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------|--------------------|--------------------|
| **Aktif** | Pemeriksaan dapat dipakai order & input hasil | Muncul di Formulir Permintaan Radiologi & input hasil; LOINC item siap dipakai integrasi | Aktif → Non-aktif (toggle per Pemeriksaan) | (idem; tidak berubah oleh FASE 2) |
| **Non-aktif** | Pemeriksaan dihentikan (bukan dihapus) | **Tidak** muncul pada order/input hasil **baru**; data transaksi historis tetap **utuh & tidak rusak** | Non-aktif → Aktif (reaktivasi) | (idem) |

> **Catatan:** default status baru = **Aktif** (BR-005). **Tidak ada operasi hapus** (permanen/soft-delete/arsip) — BR-003. Master pendukung **tanpa status**. Toggle **hanya di tingkat Pemeriksaan**; Teknik & Item ikut parent.

* **User Stories Utama** *(story ber-tag [FASE 2] ditunda; selebihnya FASE 1)*:

- **US-001** [FASE 1] — Sebagai Admin Master Radiologi, saya ingin menambah pemeriksaan radiologi via form, agar layanan baru tersedia tanpa menunggu developer. *(trace: g-support-radiology-flow)*
- **US-002** [FASE 1] — Sebagai Admin, saya ingin **dapat** mengisi LOINC (parent/teknik/item) **bila tersedia**, agar hasil radiologi siap dikirim ke SATUSEHAT — pengisian tidak dipaksakan saat simpan. *(BR-007, BR-012)*
- **US-003** [FASE 1] — Sebagai Admin, saya ingin memfilter daftar berdasarkan Modalitas & mencari berdasarkan Nama Pemeriksaan/Nama Item, agar cepat menemukan data.
- **US-004** [FASE 1] — Sebagai Admin, saya ingin menonaktifkan pemeriksaan (bukan menghapus), agar layanan lama aman di data historis & tidak bisa dipakai order/input hasil baru. *(BR-004, BR-015)*
- **US-005** [FASE 1] — Sebagai Admin, saya ingin mengimpor data massal via template **.xlsx multi-sheet** dengan **preview validasi sebelum commit**, agar setup awal cepat & tahu baris mana yang ditolak beserta alasannya. *(BR-017, BR-022)*
- **US-006** [FASE 1] — Sebagai Admin, saya ingin sistem menolak duplikat natural key (Nama Pemeriksaan + Kode RIS), via form maupun import, agar data bersih. *(BR-002, BR-016)*
- **US-007** [FASE 1] — Sebagai Admin, saya ingin melihat siapa & kapan terakhir mengubah data (tooltip Last Update) di dashboard. *(BR-010)*
- **US-008** [FASE 1] — Sebagai Dokter perujuk (konsumen), saya ingin hanya pemeriksaan aktif yang muncul di Formulir Permintaan Radiologi, agar tidak salah order.
- **US-009** [FASE 1] — Sebagai Product Owner, saya ingin struktur data mendukung **1:N (teknik & item)** sejak sekarang, agar multi-teknik/multi-komponen tanpa migrasi. *(BR-009)*
- **US-010** [FASE 1] — Sebagai Product Owner, saya ingin field LOINC optional, agar RS melengkapinya bertahap tanpa memblokir penyimpanan data dasar. *(BR-012)*
- **US-011** [FASE 1] — Sebagai Admin, saya ingin mendefinisikan **Teknik Pemeriksaan** (LOINC Teknik opsional) di bawah satu pemeriksaan secara **dinamis**. *(BR-013, BR-011)*
- **US-012** [FASE 2] — Sebagai Admin, saya ingin mengelola **master Modalitas** (tambah/ubah Kode+Nama, tanpa status). *(FASE 1: Modalitas pre-seed read-only.)* *(BR-006, BR-021, BR-023)*
- **US-013** [FASE 2] — Sebagai Admin, saya ingin **menambah kode LOINC sendiri** di luar pre-load KemKes. *(FASE 1: LOINC pre-load read-only.)* *(BR-020, BR-021, BR-023)*
- **US-014** [FASE 2] — Sebagai Admin, saya ingin memilih **Sisi Tubuh** (label ramah pengguna menyimpan kode SNOMED CT) pada Teknik. *(BR-014, BR-023)*
- **US-015** [FASE 1] — Sebagai Admin, saat preview import saya ingin memilih **lanjut import baris valid saja** atau **batalkan seluruh batch**. *(BR-017)*
- **US-016** [FASE 1] — Sebagai Auditor Mutu / Tim IT RS, saya ingin menelusuri **riwayat perubahan per record** (aktor, waktu, before/after) via tab Riwayat. *(BR-010)*
- **US-017** [FASE 2] — Sebagai Admin, saya ingin **memilih Organ Tubuh, Zat Kontras, dan Metode** dari daftar pilihan pada teknik/pemeriksaan. *(BR-008, BR-020, BR-023)*
- **US-018** [FASE 2] — Sebagai Admin, saya ingin **Kelola Master Pendukung** berupa daftar pilihan tanpa status (Create/View/Update). *(BR-021, BR-023)*
- **US-019** [FASE 1] — Sebagai Admin, saat import saya ingin **sheet Teknik & Item terpisah** dari sheet Pemeriksaan (di-key Kode RIS + Nama), agar tidak ambigu. *(BR-022)*
- **US-020** [FASE 1] — Sebagai Admin, saya ingin **tiap teknik dapat memiliki LOINC sendiri (opsional)** pada pemeriksaan multi-teknik. *(BR-007, BR-013)*
- **US-021** [FASE 2] — Sebagai Product Owner, saya ingin penundaan Kelola Master Pendukung & atribut LOINC ke FASE 2 dengan struktur DB forward-compatible, agar FASE 1 go-live lebih cepat tanpa migrasi besar. *(BR-023, NFR-006)*

## 7. Functional Requirements

> FR ber-tag **[FASE 2]** ditunda; selebihnya **FASE 1**.

### 7.1 Feature Requirements & Acceptance Criteria

| ID | Requirement | Fase | Trace |
|----|-------------|------|-------|
| **FR-001** | Dashboard list pemeriksaan: Kode RIS, Nama Pemeriksaan, Modalitas, (LOINC parent bila ada), Status, Last Update, Aksi (Detail, Edit). **Tanpa CTA hapus.** | FASE 1 | US-003, BR-003 |
| **FR-002** | Filter by Modalitas; search by Nama Pemeriksaan & Nama Item; sorting by Nama Pemeriksaan; pagination 15/25/50/Semua. | FASE 1 | US-003 |
| **FR-003** | Form Tambah/Edit dua sumbu: **Permintaan** (Pemeriksaan + Teknik child dinamis) & **Hasil** (Item child dinamis). Judul dinamis: "Penambahan Data Radiologi" / "Ubah Data Radiologi". | FASE 1 | US-001 |
| **FR-004** | Validasi field mandatory (Nama Pemeriksaan, Kode RIS, Modalitas, Status) dengan pesan error per-field. **LOINC TIDAK divalidasi mandatory.** | FASE 1 | BR-001, BR-012 |
| **FR-005** | Menolak penyimpanan bila natural key **(Nama Pemeriksaan + Kode RIS)** sudah ada per RS. | FASE 1 | BR-002 |
| **FR-006** | Menyediakan & menyimpan LOINC di lokasi berlaku (parent/teknik/item) dengan preview code+display — **optional**; bila diisi harus dari master LOINC pre-load; tiap teknik dapat punya LOINC sendiri. | FASE 1 | BR-007, BR-012, BR-020, US-002, US-020 |
| **FR-007** | Dropdown/lookup **Modalitas dari master pre-seed (read-only)**; menampilkan Kode (singkatan) sebagai label utama. **UI kelola Modalitas = FR-017 [FASE 2].** | FASE 1 | BR-006, BR-023 |
| **FR-008** | Toggle Status Aktif/Non-aktif **per Pemeriksaan** (default Aktif) + halaman Daftar Pemeriksaan Non-aktif. **Tanpa fungsi hapus.** Teknik & item mengikuti status parent. | FASE 1 | BR-003, BR-005, BR-015 |
| **FR-009** | Pemeriksaan Non-aktif tidak muncul pada order baru & tidak dapat dipakai input hasil baru; data historis tetap utuh & tidak rusak. | FASE 1 | BR-004 |
| **FR-010** | Download Template **.xlsx multi-sheet** (sheet Pemeriksaan/Teknik/Item + Petunjuk), Import .xlsx, Export (simetris template FASE 1, **tanpa kolom atribut FASE 2**). CSV tidak didukung. | FASE 1 | US-005, BR-022 |
| **FR-011** | Import **tambah baru saja** (tolak duplikat natural key, tanpa upsert). Multi-teknik/multi-item via **sheet Teknik / sheet Item terpisah**. Child orphan ditolak. | FASE 1 | US-005, BR-009, BR-016, BR-022 |
| **FR-012** | Dashboard menampilkan ringkasan audit **Last Update** (dd/mm/yyyy + nama user) via tooltip. | FASE 1 | BR-010, US-007 |
| **FR-013** | **Organ Tubuh, Zat Kontras, Metode = field input OPTIONAL** pada anchor LOINC (teknik bila ada teknik; parent bila tanpa). Disimpan sebagai kolom + relasi master. **[ASUMSI]** level pelekatan mengikuti anchor LOINC. | **[FASE 2]** | BR-008, BR-023, US-017 |
| **FR-014** | **Penyimpanan WAJIB 1:N** (pemeriksaan↔teknik & pemeriksaan↔item). Teknik & item = child dinamis (tambah/kurangi baris) — aktif penuh fase ini. | FASE 1 | BR-009, BR-011, US-009 |
| **FR-015** | Sistem **tidak boleh memblokir simpan** karena field optional (LOINC) kosong; dapat dilengkapi bertahap via Edit/Import. | FASE 1 | BR-012, US-010 |
| **FR-016** | Kelola **Teknik Pemeriksaan** sebagai child dinamis: **Nama Teknik + LOINC Teknik (opsional)**; menegakkan **exclusive-or LOINC** parent vs teknik. *(Sisi Tubuh/Organ/Zat/Metode pada teknik → FR-013 [FASE 2].)* | FASE 1 | BR-013, BR-011, US-011 |
| **FR-017** | **Kelola Master Modalitas** (Kode + Nama): Create/View/Update, tanpa status & tanpa delete. | **[FASE 2]** | BR-006, BR-021, BR-023, US-012 |
| **FR-018** | **Master Kode LOINC**: FASE 1 = pre-loaded read-only dari file SATUSEHAT KemKes saat deployment. Kelola/tambah kode oleh RS (Code, Display, System, Scale, Property, Unit; tanpa status) → FASE 2. | FASE 1 (pre-load) / **[FASE 2]** (kelola) | BR-020, BR-021, BR-023, US-013 |
| **FR-019** | **Master Sisi Tubuh** (Kode SNOMED CT + Nama tampilan): Create/View/Update, tanpa status; lookup pada anchor. | **[FASE 2]** | BR-014, BR-021, BR-023, US-014 |
| **FR-020** | Import via alur **preview → konfirmasi**: tampilkan per sheet baris valid/invalid + alasan per baris (termasuk orphan child & pelanggaran exclusive-or LOINC); user memilih commit baris valid saja atau batalkan seluruh batch. | FASE 1 | BR-017, BR-022, US-015 |
| **FR-021** | **Audit trail per record**: catat aktor, waktu, snapshot before/after untuk Create/Update/Toggle Status; tampilkan via tab **Riwayat** pada form detail. | FASE 1 | BR-010, US-016 |
| **FR-022** | Validasi enum **Modalitas match master** (case-insensitive) pada form & import; modalitas tidak match → baris ditolak dengan alasan. | FASE 1 | BR-006 |
| **FR-023** | **Kelola Master Organ Tubuh / Zat Kontras / Metode** (Nama tampilan + Kode opsional): Create/View/Update, tanpa status & tanpa delete; lookup pada anchor. | **[FASE 2]** | BR-008, BR-021, BR-023, US-017 |
| **FR-024** | **Resolusi child-ke-parent saat import**: tiap baris sheet Teknik/Item dicocokkan ke baris sheet Pemeriksaan via (Kode RIS + Nama Pemeriksaan); child tanpa parent valid → **invalid (orphan)**; commit menyimpan parent + child sesuai grup. | FASE 1 | BR-022, US-019 |
| **FR-025** | Pada pemeriksaan dengan **>1 teknik**, sistem mengizinkan **tiap teknik memiliki LOINC sendiri** (opsional, independen antar teknik). | FASE 1 | BR-007, BR-013, US-020 |
| **FR-026** | **Forward-compat FASE 2**: struktur DB FASE 1 menyiapkan kolom/relasi untuk atribut Sisi Tubuh/Organ/Zat Kontras/Metode & master pendukung yang dikelola, sehingga FASE 2 tidak butuh migrasi besar. *(non-UI; struktur saja)* | FASE 1 | BR-023, NFR-006 |

* **Validasi (Wording — Frontend):**

  | Field / Aksi | Tipe Input | Rules | Error / Confirm Message |
  |--------------|------------|-------|-------------------------|
  | Nama Pemeriksaan | Text | Required; bagian natural key | "Nama Pemeriksaan wajib diisi." |
  | Kode RIS | Text | Required; format bebas; bagian natural key (BR-019) | "Kode RIS wajib diisi." |
  | Modalitas | Lookup | Required; harus match master pre-seed (case-insensitive) | "Modalitas wajib diisi." / "Modalitas tidak dikenal." |
  | (Natural key) | — | Kombinasi Nama + Kode RIS unik per RS | "Pemeriksaan dengan Nama & Kode RIS ini sudah ada." |
  | Kode LOINC (parent) | Lookup | **Optional & conditional** — aktif hanya bila TANPA teknik (BR-013); bila diisi harus dari master | "LOINC parent tidak dapat diisi karena pemeriksaan memiliki teknik." |
  | Kode LOINC (teknik/item) | Lookup | Optional; bila diisi harus dari master LOINC | "Kode LOINC tidak ada di master." |
  | Status | Toggle | Required; default Aktif; toggle per Pemeriksaan | — |

### 7.2 Non-Functional Requirements

- **NFR-001 (Performa):** Dashboard ≤ 2 detik untuk ≤ 1.000 record; pencarian/filter ≤ 1 detik. [ASUMSI target, skala RS Tipe C & D]
- **NFR-002 (Skala data):** Mendukung ≥ beberapa ratus pemeriksaan + teknik + item tanpa degradasi (pagination wajib).
- **NFR-003 (Keandalan import multi-sheet):** Import via preview→commit; validasi per sheet & per baris; baris gagal tidak menggagalkan baris valid. Resolusi child-ke-parent (Kode RIS+Nama) konsisten; commit atomik terhadap grup parent+child yang dikonfirmasi.
- **NFR-004 (Audit & keamanan):** Semua Create/Update/Toggle tercatat (aktor + waktu + before/after) & ditelusuri per record. Akses dibatasi role (RBAC A53 / Akses Menu A37). *(FASE 2: audit mencakup operasi master pendukung.)*
- **NFR-005 (Interoperabilitas):** **FASE 1** menyimpan kode **LOINC** (parent/teknik/item) untuk kesiapan FHIR `Observation` (LOINC item + UCUM). **[FASE 2]** menambah **SNOMED CT** (Sisi Tubuh/BodySite) & atribut Organ/Zat Kontras/Metode. Struktur DB FASE 1 menampung pemetaan tanpa migrasi (NFR-006).
- **NFR-006 (Forward-compatibility):** (a) Relasi **1:N (teknik & item)** disimpan sejak FASE 1. (b) Kolom & relasi master untuk atribut [FASE 2] disiapkan di skema FASE 1 (FR-026) → aktivasi FASE 2 = menambah UI/validasi, bukan migrasi data besar. *(BR-009, BR-008, BR-023)*
- **NFR-007 (Usability):** Modalitas via lookup pre-seed (kurangi salah ketik); pesan error per-field jelas Bahasa Indonesia; field optional (LOINC) tidak menampilkan error "wajib diisi".
- **NFR-008 (Kompatibilitas RS Tipe C & D):** Antarmuka sederhana; import/export berbasis **.xlsx multi-sheet**; LOINC & Modalitas pre-loaded/pre-seed mengurangi beban entri; phasing menjaga lingkup FASE 1 ringan.
- **NFR-009 (Toleransi data tidak lengkap):** Sistem tetap berfungsi saat field optional (LOINC) kosong — tanpa error, tanpa memblokir alur hilir (kecuali pengiriman SATUSEHAT yang butuh LOINC, di mana ketiadaan kode menonaktifkan pengiriman item tsb tanpa menggagalkan modul). *(BR-012, FR-015)*
- **NFR-010 (Integritas siklus hidup):** Penonaktifan pemeriksaan tidak menghapus/merusak referensi transaksi historis; operasi destruktif (hard/soft delete) tidak tersedia (BR-003). Master pendukung dirujuk by id → perubahan label aman (BR-021).
- **NFR-011 (Phasing tanpa regresi):** Aktivasi FASE 2 tidak mengubah perilaku/data FASE 1; penambahan kolom import/form bersifat aditif & kompatibel mundur dengan template FASE 1. *(BR-023, NFR-006)*

## 8. Data & Technical Specifications

> Catatan: skema tabel & endpoint di §8.1–§8.2 adalah **rekomendasi teknis [ASUMSI]** turunan dari entitas & relasi pada dokumen sumber; perlu divalidasi tim engineering. Spesifikasi field §8.3 mengikuti dokumen sumber.

### 8.1 Database Schema Suggestion

* **Table `radiology_examination`** (Pemeriksaan): `id` (PK), `kode_ris`, `nama_pemeriksaan`, `modalitas_id` (FK → `modality`), `kode_loinc_pemeriksaan` (nullable, conditional BR-013), `status_aktif` (bool, default true), `last_update_at`, `last_update_by`, `created_at/by`, `updated_at/by`. **Unique** (`nama_pemeriksaan`, `kode_ris`) per RS. *Forward-compat [FASE 2]:* `organ_tubuh_id`, `zat_kontras_id`, `metode_id` (nullable).
* **Table `radiology_technique`** (Teknik, 1:N): `id` (PK), `examination_id` (FK), `nama_teknik`, `kode_loinc_teknik` (nullable). *Forward-compat [FASE 2]:* `sisi_tubuh_id`, `organ_tubuh_id`, `zat_kontras_id`, `metode_id` (nullable).
* **Table `radiology_result_item`** (Item Hasil, 1:N): `id` (PK), `examination_id` (FK), `nama_item`, `kode_loinc_item` (nullable).
* **Table `modality`** (Modalitas, pre-seed): `id` (PK), `kode` (unik), `nama`.
* **Table `loinc_code`** (pre-load KemKes): `code` (PK/unik), `display`, `system`, `scale`, `property`, `unit`.
* **[FASE 2] master pendukung:** `body_site` (`kode_snomed` unik, `nama_tampilan`), `organ` (`kode` opsional, `nama_tampilan`), `contrast_agent` (`kode` opsional, `nama_tampilan`), `method` (`kode` opsional, `nama_tampilan`). *(struktur disiapkan FASE 1 — FR-026, tanpa delete/status — BR-021.)*
* **Table `audit_log`**: `id` (PK), `entity`, `entity_id`, `action` (`CREATE`/`UPDATE`/`TOGGLE`), `before` (JSON), `after` (JSON), `user_id`, `user_name`, `timestamp`.

### 8.2 API Endpoint Recommendations *(rekomendasi [ASUMSI])*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/radiology-examinations` | List (filter modalitas, search nama pemeriksaan/item, sort, pagination) |
| GET | `/api/v1/radiology-examinations?status=inactive` | Daftar Pemeriksaan Non-aktif |
| GET | `/api/v1/radiology-examinations/{id}` | Detail (Pemeriksaan + Teknik + Item) |
| POST | `/api/v1/radiology-examinations` | Tambah (status auto Aktif) |
| PUT | `/api/v1/radiology-examinations/{id}` | Ubah (Pemeriksaan + child dinamis) |
| PATCH | `/api/v1/radiology-examinations/{id}/status` | Toggle Aktif/Non-aktif (per Pemeriksaan). **Tidak ada DELETE** (BR-003) |
| GET | `/api/v1/radiology-examinations/template` | Download Template .xlsx multi-sheet |
| POST | `/api/v1/radiology-examinations/import` | Upload → validasi → **preview** (per sheet/baris) |
| POST | `/api/v1/radiology-examinations/import/commit` | Commit baris valid / batalkan batch |
| GET | `/api/v1/radiology-examinations/export` | Export multi-sheet (simetris template FASE 1) |
| GET | `/api/v1/radiology-examinations/{id}/audit-logs` | Riwayat per record (before/after) |
| GET | `/api/v1/modalities` | Lookup Modalitas (read-only FASE 1) |
| GET | `/api/v1/loinc-codes/search?q=` | Lookup Kode LOINC (read-only FASE 1) |

### 8.3 Data & Business Rules

> Field/master/kolom ber-tag **[FASE 2]** disiapkan struktur DB-nya (forward-compat, FR-026) namun **belum** muncul di form/dashboard/import FASE 1.

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

**Sumbu Permintaan → Pemeriksaan (parent) — FASE 1**

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_ris | **Kode RIS** | text | **Ya** | bagian *natural key*; **format bebas** | manual | Identifier RIS/PACS RS (BR-019) |
| nama_pemeriksaan | Nama Pemeriksaan | text | **Ya** | bagian *natural key*; (Nama + Kode RIS) unik per RS | manual | BR-002 |
| modalitas_id | Modalitas | lookup (master pre-seed) | **Ya** | harus match master Modalitas pre-seed | master Modalitas (read-only) | label = Kode/singkatan; dasar filter (BR-006) |
| kode_loinc_pemeriksaan | Kode LOINC (Pemeriksaan/parent) | lookup | **Tidak (optional, conditional)** | **hanya aktif bila TANPA teknik** (BR-013); bila diisi harus dari master LOINC pre-load | master LOINC (read-only) | LOINC panel/order. Pengisian = RS (BR-012) |
| ~~organ_tubuh_id (parent)~~ | Organ Tubuh (parent) | lookup | — | — | — | **[FASE 2]** — dikeluarkan dari form FASE 1 (BR-023) |
| ~~zat_kontras_id (parent)~~ | Zat Kontras (parent) | lookup | — | — | — | **[FASE 2]** — dikeluarkan dari form FASE 1 (BR-023) |
| ~~metode_id (parent)~~ | Metode (parent) | lookup | — | — | — | **[FASE 2]** — dikeluarkan dari form FASE 1 (BR-023) |
| status_aktif | Status | boolean/toggle | **Ya** | aktif / nonaktif | default **aktif** | toggle **per pemeriksaan** (BR-015); bukan delete |

**Sumbu Permintaan → Teknik Pemeriksaan (child dinamis, opsional, 0..n) — FASE 1** *(Struktur 1:N; bila ada teknik, LOINC parent dinonaktifkan — BR-013; tiap teknik boleh punya LOINC sendiri)*

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_teknik | Nama Teknik | text | Ya (bila baris teknik dibuat) | — | manual | mis. AP, PA, Lateral, Towne, Waters, Oblique |
| kode_loinc_teknik | Kode LOINC (Teknik) | lookup | Tidak (optional) | bila diisi harus dari master LOINC pre-load | master LOINC | anchor LOINC sumbu permintaan saat ada teknik; independen antar teknik (BR-007) |
| ~~sisi_tubuh_id~~ | Sisi Tubuh | lookup | — | — | — | **[FASE 2]** — BR-014/BR-023 |
| ~~organ_tubuh_id~~ | Organ Tubuh | lookup | — | — | — | **[FASE 2]** — BR-008/BR-023 |
| ~~zat_kontras_id~~ | Zat Kontras | lookup | — | — | — | **[FASE 2]** — BR-008/BR-023 |
| ~~metode_id~~ | Metode | lookup | — | — | — | **[FASE 2]** — BR-008/BR-023 |

**Sumbu Hasil → Item Hasil Pemeriksaan (child dinamis, opsional, 0..n) — FASE 1** *(Struktur 1:N)*

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_item | Nama Item | text | Ya (bila baris item dibuat) | — | manual | item hasil yang diinput radiografer/radiolog |
| kode_loinc_item | Kode LOINC (Item/Hasil) | lookup | Tidak (optional) | bila diisi harus dari master LOINC | master LOINC | **dasar `Observation.code` ke SATUSEHAT**; optional (BR-012) |

**Master pendukung — Modalitas — FASE 1 = pre-seed lookup read-only · Kelola = [FASE 2]**

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| kode | Kode | text | Ya | unik | mis. CR, DX, CT, MR, US, MG, RF, XA, PX, NM (basis DICOM) |
| nama | Nama | text | Ya | — | kepanjangan (mis. Computed Tomography) |

> **FASE 1**: Modalitas di-seed saat deployment (CR, DX, CT, MR/MRI, US, MG, RF, XA, PX, NM) & dipakai lookup read-only; validasi import match master case-insensitive (BR-006). **Create/View/Update = [FASE 2]** (FR-017). **[PERLU KONFIRMASI]** kebutuhan menambah modalitas di luar seed selama FASE 1.

**Master pendukung — Kode LOINC — FASE 1 = pre-load read-only · Kelola/tambah = [FASE 2]**

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| code | Code | text | Ya | unik | kode LOINC |
| display | Display | text | Ya | — | nama tampilan; sort A-Z saat lookup |
| system | System | text | Ya | URI LOINC | system terminologi |
| scale | Scale | text | Tidak | — | atribut LOINC |
| property | Property | text | Tidak | — | atribut LOINC |
| unit | Unit | text | Tidak | UCUM | dipakai `Observation.valueQuantity` |

> **FASE 1**: pre-load satu kali saat deployment dari file SATUSEHAT KemKes, lookup read-only. **Tambah kode oleh RS (Create/View/Update, tanpa status) = [FASE 2]** (FR-018).

**Master pendukung — Sisi Tubuh (BodySite SNOMED CT) — [FASE 2]**

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| kode_snomed | Kode SNOMED | text | Ya | unik | disimpan di backend (BodySite SNOMED CT) |
| nama_tampilan | Nama (Sisi Tubuh) | text | Ya | — | label ramah pengguna (BR-014) |

**Master pendukung — Organ Tubuh / Zat Kontras / Metode — [FASE 2]** *(struktur seragam; lookup pada anchor)*

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| kode | Kode | text | Tidak | unik bila diisi | kode internal/terminologi (opsional) |
| nama_tampilan | Nama | text | Ya | unik per master | mis. Organ: Thorax/Abdomen/Cranium; Zat Kontras: Tanpa/Dengan Kontras; Metode: CT/MRI/Plain/Doppler **[ASUMSI seed]** |

**Import Massal (Template MULTI-SHEET) — FASE 1**

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| file_import | File Data Radiologi | file | Ya | **.xlsx multi-sheet saja**, sesuai template | CSV tidak didukung fase ini |

Struktur workbook (.xlsx) FASE 1 — 3 sheet data + 1 sheet Petunjuk:
- **Sheet `Pemeriksaan` (parent):** `Kode_RIS (KEY); Nama_Pemeriksaan (KEY); Modalitas; Kode_LOINC_Pemeriksaan (conditional: hanya bila tanpa teknik); Status`
- **Sheet `Teknik` (child, key ref):** `Kode_RIS (KEY ref); Nama_Pemeriksaan (KEY ref); Nama_Teknik; Kode_LOINC_Teknik`
- **Sheet `Item` (child, key ref):** `Kode_RIS (KEY ref); Nama_Pemeriksaan (KEY ref); Nama_Item; Kode_LOINC_Item`

> - **[FASE 2]** kolom tambahan (sheet Pemeriksaan: `Organ_Tubuh / Zat_Kontras / Metode`; sheet Teknik: `Sisi_Tubuh / Organ_Tubuh / Zat_Kontras / Metode`) **belum ada** di template FASE 1 (BR-022/BR-023).
> - **Natural key** = `Kode_RIS` + `Nama_Pemeriksaan`. Duplikat existing → **ditolak** (tambah baru saja, BR-016).
> - **Multi-teknik/multi-item (1:N):** baris terpisah pada sheet Teknik/Item (hindari cartesian).
> - **Resolusi parent (FR-024):** baris Teknik/Item tanpa parent di sheet Pemeriksaan = **orphan → invalid**.
> - **Exclusive-or (BR-013):** bila pemeriksaan punya baris di sheet Teknik → `Kode_LOINC_Pemeriksaan` harus kosong.
> - Kolom LOINC boleh kosong (optional). `Modalitas` & LOINC (bila diisi) harus match master.
> - **Alur**: upload → preview (per sheet: valid/invalid + alasan per baris) → commit baris valid / batalkan batch (BR-017).
> - Kolom **Kode_KPTL** & istilah **Kode_LIS** pada lampiran PDF **dihapus/diabaikan**.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

**Dashboard Master Data Radiologi (FR-001, FR-002) — FASE 1**

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Kode RIS | pemeriksaan.kode_ris | text | — | bagian natural key |
| Nama Pemeriksaan | pemeriksaan.nama_pemeriksaan | text | **sort** A-Z / Z-A | bagian natural key |
| Modalitas | master Modalitas (via modalitas_id) | badge **singkatan** (mis. `CT`) | **filter** | dasar filter utama |
| Kode LOINC | pemeriksaan.kode_loinc_pemeriksaan | text (+display) | — | hanya bila tanpa teknik; bisa kosong |
| Status | pemeriksaan.status_aktif | toggle (Aktif/Non-aktif) | filter | hijau/abu; per pemeriksaan |
| Last Update | last_update_at + last_update_by | dd/mm/yyyy + tooltip nama user | sort | ringkasan audit |
| Aksi | — | CTA: **Detail, Edit** (TANPA hapus) | — | BR-003 |

> *Search bar:* by Nama Pemeriksaan & Nama Item. *Pagination:* 15/25/50/Semua. *CTA FASE 1:* Daftar Pemeriksaan Non-aktif, Import/Export. *CTA* **Kelola Master Pendukung** → **[FASE 2]** (tidak ditampilkan FASE 1).

**Form Detail > tab Riwayat (audit per record) — FASE 1**

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| Waktu | audit_log.timestamp | dd/mm/yyyy HH:mm | sort desc | |
| Aktor | audit_log.user (nama) | text | — | dari Staff A2 |
| Aksi | audit_log.action | badge (Create/Update/Toggle) | filter | |
| Perubahan | audit_log.before/after | diff field before→after | — | snapshot before/after (BR-010) |

**Daftar Pemeriksaan Non-aktif — FASE 1**

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| (sama dgn dashboard) | pemeriksaan where status_aktif=false | sda | filter Modalitas, search | aksi: Aktifkan kembali / Edit (tanpa hapus) |

**Preview Import (per sheet, sebelum commit — FR-020/FR-024) — FASE 1**

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| Sheet | nama sheet (Pemeriksaan/Teknik/Item) | tab/segment | filter | preview dipisah per sheet |
| Baris | nomor baris file | angka | — | |
| Status validasi | hasil validasi | badge Valid / Invalid | filter | |
| Alasan | pesan validasi | text per baris | — | mandatory kosong / Modalitas tak match / duplikat Nama+Kode RIS / **child orphan** / pelanggaran exclusive-or LOINC / LOINC tak ada di master |
| Ringkasan | agregasi | "X valid, Y invalid" per sheet + grup parent↔child + tombol **Commit valid** / **Batalkan batch** | — | BR-017, BR-022 |

* **Business Rules**:
    * **BR-001 (Mandatory):** Form Pemeriksaan tidak dapat disimpan bila field bertanda * kosong — **Nama Pemeriksaan, Kode RIS, Modalitas, Status** → error per-field. **Field LOINC TIDAK mandatory** (BR-012).
    * **BR-002 (Uniqueness / natural key):** Kombinasi **Nama Pemeriksaan + Kode RIS** wajib **unik per RS**. **Modalitas bukan bagian key.** Berlaku pada input manual & import.
    * **BR-003 (Tanpa hapus — final):** **Tidak ada operasi delete** (permanen/soft-delete/arsip) pada Pemeriksaan/Teknik/Item maupun master pendukung. Penghentian layanan hanya via status Aktif/Non-aktif (per Pemeriksaan). Tidak ada CTA hapus.
    * **BR-004 (Perilaku Non-aktif):** Pemeriksaan Non-aktif **tidak muncul pada order radiologi baru** & **tidak dapat dipakai input hasil baru**. Data transaksi historis tetap utuh, tidak hilang & tidak rusak.
    * **BR-005 (Status default):** Record Pemeriksaan baru default **Aktif**.
    * **BR-006 (Modalitas = master, FASE 1 pre-seed read-only):** Modalitas adalah master pendukung (Kode + Nama), **bukan enum statis**. Pada Pemeriksaan/import wajib **match master** (case-insensitive); UI dapat menampilkan Kode sebagai label utama. **FASE 1: pre-seed read-only (tanpa UI kelola).** **[PERLU KONFIRMASI]** apakah RS dapat onboard FASE 1 hanya dengan seed default; kebutuhan modalitas di luar seed → FASE 2 (BR-023) atau jalur konfigurasi sementara.
    * **BR-007 (LOINC multi-lokasi):** Kode LOINC dapat melekat pada **tiga lokasi**: **Pemeriksaan/parent** (hanya bila tanpa teknik — BR-013), **Teknik**, dan **Item/Hasil**. **LOINC item = dasar `Observation` ke SATUSEHAT.** Seluruhnya **optional** (BR-012). Pada multi-teknik, tiap teknik boleh punya LOINC sendiri (opsional). *(FASE 1)*
    * **BR-008 (Atribut LOINC = field optional) — [FASE 2]:** **Organ Tubuh** (Anatomic Region), **Zat Kontras** (Pharmaceutical), **Metode** (Method) sebagai field input optional **dipindah ke FASE 2**. Saat aktif: lookup dari master, melekat mengikuti **anchor sama dengan LOINC** (exclusive-or). **[ASUMSI]** level pelekatan mengikuti anchor LOINC — perlu konfirmasi bila RS ingin level berbeda.
    * **BR-009 (Relasi 1:N — penyimpanan):** Penyimpanan **pemeriksaan↔teknik** & **pemeriksaan↔item hasil** **wajib** model **1:N**. Teknik & item opsional (0..n), struktur 1:N wajib ada agar multi-teknik/multi-item tanpa migrasi. *(FASE 1)*
    * **BR-010 (Audit trail penuh):** Setiap **Create / Update / Toggle Status** pada Pemeriksaan/Teknik/Item mencatat **aktor, waktu, snapshot before/after**. Ditelusuri **per record** via tab **Riwayat**; **tidak ada halaman audit terpusat**. Dashboard menampilkan ringkasan **Last Update** via tooltip. *(FASE 2: audit juga mencakup master pendukung.)*
    * **BR-011 (Child dinamis — AKTIF PENUH FASE 1):** Teknik & Item Hasil dikelola sebagai **child dinamis** di form (tambah/kurangi baris) — Create/View/Update. Penyimpanan 1:N (BR-009) wajib.
    * **BR-012 (Field optional = tanggung jawab RS, Q5):** Field **LOINC** (parent/teknik/item) — dan saat FASE 2 atribut penyusun — bersifat **OPTIONAL**. Sistem **tidak boleh** memaksa pengisiannya sebagai syarat simpan. Pengisian = **tanggung jawab RS** → bukan metrik produk.
    * **BR-013 (Exclusive-or LOINC parent vs teknik):** Bila pemeriksaan **punya teknik** → LOINC **tidak diisi di parent**, melekat di masing-masing teknik. Bila **tanpa teknik** → LOINC **opsional di parent**. Sistem mencegah LOINC parent bersamaan dengan adanya teknik. **[FASE 2]** exclusive-or diperluas ke atribut Sisi Tubuh/Organ/Zat Kontras/Metode (F2-C).
    * **BR-014 (Sisi Tubuh — master SNOMED) — [FASE 2]:** Sisi Tubuh adalah **master pilihan** menyimpan **kode SNOMED CT** (UI menampilkan label "Sisi Tubuh" & Nama tampilan), melekat pada **anchor** (Teknik bila ada; parent bila tanpa) — **tidak** pada Item Hasil. Opsional, tanpa status. **Dipindah ke FASE 2.**
    * **BR-015 (Status per Pemeriksaan):** Toggle Aktif/Nonaktif berlaku **per Pemeriksaan saja**. Teknik & Item Hasil **mengikuti status parent**.
    * **BR-016 (Import = tambah baru saja):** Import **hanya menambah data baru**. Natural key (Nama + Kode RIS) yang sudah ada **ditolak** (tanpa upsert). Perubahan existing via form satuan.
    * **BR-017 (Import preview → commit):** Import wajib **upload → preview validasi per baris/per sheet → konfirmasi**. User memilih **commit baris valid saja** atau **batalkan seluruh batch** sebelum data ditulis.
    * **BR-018 (Single modalitas):** Satu Pemeriksaan hanya memiliki **satu Modalitas**. Multi-modalitas out-scope.
    * **BR-019 (Kode RIS — format bebas):** Kode RIS = identifier internal RIS/PACS RS; **tanpa validasi format tambahan** (alfanumerik bebas). Tetap wajib & bagian natural key.
    * **BR-020 (Referensi pilihan dari master):** Kode LOINC **opsional** namun **bila diisi harus dari master** (LOINC pre-loaded KemKes). **[FASE 2]** aturan sama untuk Sisi Tubuh/Organ/Zat Kontras/Metode.
    * **BR-021 (Master pendukung = daftar pilihan tanpa status) — [FASE 2]:** Master pendukung (**Modalitas, Kode LOINC, Sisi Tubuh, Organ, Zat Kontras, Metode**) bila dikelola = **Create/View/Update** saja: **tanpa status, tanpa delete**; koreksi via Update; rujukan **by id** sehingga perubahan label aman. **UI kelola dipindah ke FASE 2.** **[PERLU KONFIRMASI]** perlakuan bila opsi keliru ditambahkan & sudah dipakai.
    * **BR-022 (Import = template MULTI-SHEET):** Template/Export = **workbook .xlsx multi-sheet**: sheet **Pemeriksaan** (parent), **Teknik**, **Item** — child di-key **Kode RIS + Nama Pemeriksaan**. Child orphan → ditolak. **FASE 1**: kolom atribut FASE 2 belum ada.
    * **BR-023 (PHASING — keputusan user v1.5):** (a) Seluruh **Kelola Master Pendukung** (CRUD UI) → **FASE 2**; FASE 1 Modalitas pre-seed & LOINC pre-load = lookup read-only. (b) **Organ, Zat Kontras, Metode, Sisi Tubuh** (master & field input) → **FASE 2**, dikeluarkan dari form/dashboard/import/export/validasi FASE 1. (c) Struktur DB FASE 1 forward-compatible agar penambahan FASE 2 tanpa migrasi besar (NFR-006).

### 8.4 Integrasi Eksternal

**SATUSEHAT (utama):**
- **Standar:** **LOINC** untuk pemeriksaan radiologi & nuklir (FHIR `Observation`) — **FASE 1**; **SNOMED CT** untuk BodySite (Sisi Tubuh) — **[FASE 2]**.
- **Sumber katalog kode:** LOINC Radiologi (`satusehat.kemkes.go.id/platform/docs/id/terminology/loinc/radiologi/`); LOINC Nuklir (`.../loinc/nuklir/`); LOINC Radiology Playbook (acuan model dua sumbu & atribut penyusun — atribut **[FASE 2]**).
- **Pre-load:** master Kode LOINC di-*pre-load* satu kali dari file SATUSEHAT KemKes saat deployment, read-only FASE 1; penambahan kode oleh RS = **[FASE 2]** (FR-018).
- **Peran master ini (FASE 1):** menyediakan **tempat pemetaan LOINC multi-lokasi** — Pemeriksaan/parent (bila tanpa teknik), Teknik (bila ada teknik — exclusive-or BR-013; tiap teknik bisa punya LOINC sendiri), Item/Hasil. **LOINC item** = nilai `Observation.code`.
- **Pemetaan atribut → FHIR:** `unit` (UCUM) → `Observation.valueQuantity` *(FASE 1)*. **[FASE 2]:** `sisi_tubuh` (SNOMED) → Laterality/BodySite; `organ_tubuh` → Anatomic Region/BodySite; `zat_kontras` → Pharmaceutical/contrast; `metode` → Method. **[PERLU KONFIRMASI]** representasi FHIR persis diserahkan ke modul integrasi.
- **Sifat pengisian (Q5 — final):** LOINC & atribut **optional**, **tanggung jawab RS**, di luar kuasa tim product. Item tanpa LOINC tetap valid sebagai master namun tidak dapat dikirim sebagai `Observation` sampai dilengkapi.
- **Mekanisme lookup katalog LOINC** (realtime API vs cache/master lokal): diserahkan ke keputusan teknis tim developer (pendekatan pre-load mendukung mode master lokal).
- **Catatan:** Pengiriman aktual `Observation` ke SATUSEHAT **di luar scope** modul master ini.

**KPTL (BPJS) — TIDAK termasuk:** meski lampiran PDF mencantumkan Kode KPTL, **keputusan user: KPTL out-scope**. Tidak ada field, kolom, validasi, maupun integrasi KPTL.

**RIS/PACS (konsumen hilir):** `kode_ris` = identifier yang dirujuk saat order radiologi di-*push* ke RIS (`g-support-radiology-flow`). Modul ini hanya menyimpan kode; integrasi order di modul pelayanan radiologi.

**Internal (lintas-PRD):** Staff (A2)/Jabatan (A55) → sumber `nama` aktor audit; RBAC (A53)/Akses Menu (A37) → pembatasan akses; Unit (A3)/Instalasi (A19) & Tindakan/Tarif (A10/A13/A43) → **belum dikaitkan**; Item Pemeriksaan Lab (A14) → reuse konvensi `file_import`, `mode_import` (dibatasi tambah-baru), `status_aktif`.

## 9. Workflow / BPMN Interpretation

> Tidak tersedia BPMN khusus untuk A29. Interpretasi alur (Main Flow) diturunkan dari Business Process To-Be + draft user + analogi A14 + BPMN `g-support-radiology-flow`/`g-emr-patient-identity`. **Aktor:** Admin Master Radiologi (PIC RS), Sistem. *(Konsumen tak langsung: dokter perujuk/spesialis radiologi; Tim IT RS/Auditor Mutu.)*

**Skenario 0 — Kelola Master Pendukung — [FASE 2] (ditunda):** Pada FASE 1, Modalitas (pre-seed) & Kode LOINC (pre-load KemKes) hanya lookup read-only; admin tidak menambah/mengubah via UI. Saat FASE 2: buka master (Modalitas/Kode LOINC/Sisi Tubuh/Organ/Zat Kontras/Metode) → tambah/ubah (Create/View/Update, **tanpa status & tanpa delete**, BR-021) → pilihan baru wajib dibuat di master sebelum dipakai.

**Skenario 1 — Tambah Pemeriksaan (manual) — FASE 1:**
1. Admin klik **Tambah Data** ("Penambahan Data Radiologi").
2. **Sumbu permintaan — Pemeriksaan**: isi Kode RIS*, Nama Pemeriksaan*, Modalitas* (lookup pre-seed) + (opsional) **Teknik (child dinamis)**: Nama Teknik + LOINC Teknik opsional. *(Sisi Tubuh/Organ/Zat Kontras/Metode → [FASE 2].)*
3. **LOINC Pemeriksaan (parent)**: aktif **hanya bila TANPA teknik** (exclusive-or, BR-013).
4. **Sumbu hasil — Item Hasil (child dinamis)**: Item opsional (Nama Item + LOINC Item opsional).
5. Klik **Simpan**.
6. Validasi mandatory (Nama, Kode RIS, Modalitas, Status) → error per-field (LOINC bukan mandatory).
7. Validasi **uniqueness** natural key (Nama + Kode RIS) → duplikat ditolak + pesan.
8. Validasi referensi master (Modalitas/LOINC) & exclusive-or LOINC.
9. Simpan record + teknik + item (status default **Aktif**) + audit *before/after*. → **Event: Data tersimpan.**

**Skenario 2 — Ubah Pemeriksaan — FASE 1:** Dari dashboard klik **Edit** ("Ubah Data Radiologi") → data existing tampil (Pemeriksaan + Teknik + Item) → admin ubah (tambah/kurangi teknik & item dinamis) → Simpan (validasi = S1) → audit *before/after*. → **Event: Data diperbarui.**

**Skenario 3 — Non-aktifkan / Aktifkan (TANPA hapus, per Pemeriksaan) — FASE 1:** Admin toggle status di dashboard/detail. **Toggle hanya di tingkat Pemeriksaan**; Teknik & Item ikut parent (BR-015). Saat Non-aktif: hilang dari order baru & tidak dapat input hasil baru; data historis tetap utuh. Tidak ada hapus. → **Event: Status diperbarui** (tercatat audit).

**Skenario 4 — Import Massal (template multi-sheet, preview → commit) — FASE 1:**
1. Admin **Download Template (.xlsx)** (sheet Pemeriksaan/Teknik/Item + Petunjuk) → isi → **Import**. *(Kolom atribut FASE 2 belum ada.)*
2. Validasi **per sheet & per baris**: Pemeriksaan (mandatory Kode RIS/Nama/Modalitas/Status, enum Modalitas match, uniqueness Nama+Kode RIS terhadap existing & antar-baris, exclusive-or); Teknik & Item (referensi parent Kode RIS+Nama ada di sheet Pemeriksaan; LOINC bila diisi harus di master) → child tanpa parent = **orphan (ditolak)**.
3. **Preview** per sheet: baris valid ditandai; invalid dilewati + **alasan per baris**, plus ringkasan grup parent↔child.
4. **Keputusan user**: **Lanjutkan import (baris valid saja)** ATAU **Batalkan seluruh batch**.
5. Import **tambah baru saja** — duplikat Nama+Kode RIS ditolak (BR-016). → **Event: Laporan hasil import.**

**Skenario 5 — Export — FASE 1:** Admin klik **Export** → unduh data multi-sheet **simetris template import FASE 1** (sheet Pemeriksaan/Teknik/Item; tanpa kolom atribut FASE 2; KPTL & field DB-internal dikecualikan).

**Skenario 6 — Telusur Audit (per record) — FASE 1:** Pada form detail Pemeriksaan, admin/auditor buka tab **Riwayat** → daftar perubahan (aktor, waktu, before/after) untuk Create/Update/Toggle record tsb. (Tidak ada halaman audit terpusat.)

---
### Asumsi
- [KEPUTUSAN USER — PHASING v1.5] Seluruh Kelola Master Pendukung (CRUD UI: Modalitas, Kode LOINC, Sisi Tubuh, Organ, Zat Kontras, Metode) dipindah ke FASE 2; FASE 1 Modalitas pre-seed & LOINC pre-load KemKes = lookup read-only. (BR-023, FR-017/018/019/023)
- [KEPUTUSAN USER — PHASING v1.5] Organ Tubuh, Zat Kontras, Metode, Sisi Tubuh (master & field input) dipindah ke FASE 2; dikeluarkan dari form/dashboard/import/export/validasi FASE 1. (BR-008, BR-014, BR-023, FR-013)
- [KEPUTUSAN USER — PHASING v1.5] Struktur DB FASE 1 forward-compatible (kolom relasi atribut FASE 2 + tabel master pendukung) agar aktivasi FASE 2 tanpa migrasi besar & tanpa regresi FASE 1. (FR-026, NFR-006, NFR-011)
- [ASUMSI — PHASING] FASE 1 dianggap cukup onboard dengan seed Modalitas default & pre-load LOINC KemKes; risiko kebutuhan tambah Modalitas/LOINC di luar seed selama FASE 1 ditandai [PERLU KONFIRMASI]. (BR-006, FR-018)
- [KEPUTUSAN USER] Teknik & Item Hasil = child dinamis AKTIF PENUH fase ini (Create/View/Update); FASE 1 atribut Teknik = Nama Teknik + LOINC Teknik opsional. (BR-011, FR-014, FR-016)
- [KEPUTUSAN USER] Multi-teknik: tiap teknik BOLEH LOINC sendiri namun OPTIONAL (independen). (BR-007, BR-013, FR-025)
- [KEPUTUSAN USER] Kelengkapan LOINC = tanggung jawab RS, bukan KPI product; simpan tidak diblokir bila optional kosong. (BR-012, FR-015, NFR-009)
- [KEPUTUSAN USER] Import = TEMPLATE MULTI-SHEET .xlsx (sheet Pemeriksaan/Teknik/Item, key Kode RIS + Nama); FASE 1 tanpa kolom atribut FASE 2; Export simetris. (BR-022, FR-010, FR-024)
- [KEPUTUSAN USER] Toggle status PER PEMERIKSAAN; Teknik & Item ikut parent. (BR-015)
- [KEPUTUSAN USER] Pemeriksaan Non-aktif tak dapat dipakai order/input hasil baru; data historis tidak hilang/rusak. (BR-004, NFR-010)
- [KEPUTUSAN USER] Audit PER RECORD (tab Riwayat); tanpa halaman audit terpusat; catat aktor/waktu/before-after. (BR-010, FR-021)
- [KEPUTUSAN USER] Kode RIS format bebas; tetap wajib & bagian natural key. (BR-019)
- [KEPUTUSAN USER] Import = TAMBAH BARU saja (tolak duplikat Nama+Kode RIS, tanpa upsert). (BR-016)
- [KEPUTUSAN USER] Model dua sumbu (permintaan: Modalitas→Pemeriksaan→Teknik; hasil: Item), masing-masing anchor LOINC.
- [KEPUTUSAN USER] Natural key = Nama Pemeriksaan + Kode RIS (Modalitas dilepas dari key). (BR-002)
- [KEPUTUSAN USER] Mandatory: Nama Pemeriksaan, Kode RIS, Modalitas, Status. (BR-001)
- [KEPUTUSAN USER] Exclusive-or LOINC: punya teknik → di teknik (parent kosong); tanpa teknik → opsional parent. (BR-013)
- [KEPUTUSAN USER] Modalitas = master (Kode+Nama); validasi import match case-insensitive. (BR-006)
- [KEPUTUSAN USER] Kode LOINC = master, pre-loaded sekali dari file SATUSEHAT KemKes. (FR-018)
- [KEPUTUSAN USER] LOINC opsional di seluruh lokasi tetapi bila diisi harus dari master. (BR-020)
- [KEPUTUSAN USER] Single modalitas per pemeriksaan; multi-modalitas out-scope. (BR-018)
- [KEPUTUSAN USER] Import .xlsx saja (CSV belum didukung); alur upload → preview → commit/batal. (BR-017, FR-020)
- [KEPUTUSAN USER] Tidak ada delete apa pun (permanen/soft-delete) di seluruh entitas; via status Aktif/Non-aktif. (BR-003, BR-021)
- [KEPUTUSAN USER] KPTL TIDAK termasuk scope.
- [KEPUTUSAN USER] Item radiologi belum dikaitkan Unit/Instalasi (A3/A19) & Tindakan/Tarif (A10/A13/A43).
- [KEPUTUSAN USER] Mekanisme lookup katalog LOINC (realtime vs cache lokal) diserahkan ke tim dev.
- [ASUMSI] Penyimpanan 1:N (pemeriksaan↔teknik & ↔item) wajib agar multi-teknik/multi-item tanpa migrasi. (BR-009)
- [ASUMSI] Seed Organ/Zat Kontras/Metode (Thorax/Abdomen/Cranium; Tanpa/Dengan Kontras; CT/MRI/Plain/Doppler) bersifat awal & perlu disepakati RS (relevan FASE 2). (§8.3.1)
- [ASUMSI] As-Is (data hardcoded, perubahan via developer) diturunkan dari draft overview user.
- [ASUMSI] Aktor pengelola = Admin Master Radiologi; dokter perujuk & Tim IT/Auditor sebagai konsumen tak langsung.
- [ASUMSI] Akses modul dibatasi RBAC (A53)/Akses Menu (A37).
- [ASUMSI] Reuse konvensi field kanonik: `status_aktif`, `file_import` (.xlsx), `nama` (user audit); `mode_import` dibatasi 'tambah' (BR-016).

### Pertanyaan Terbuka
1. Nama & jabatan **stakeholder approval** dokumen (§1 Metadata).
2. [BR-006/§8.3.1 — PHASING] Karena Kelola Master Pendukung (termasuk tambah Modalitas) → FASE 2, sedangkan Modalitas mandatory FASE 1: apakah RS dapat onboard cukup dengan seed default (CR/DX/CT/MR/US/MG/RF/XA/PX/NM)? Bila butuh modalitas di luar seed, perlukah jalur konfigurasi sementara FASE 1 atau menunggu FASE 2? (BR-023)
3. [FR-018/§8.3.1 — PHASING] LOINC FASE 1 hanya pre-load read-only; apakah cakupan pre-load KemKes cukup, atau ada risiko RS butuh menambah kode LOINC (mis. lokal/khusus) sebelum FASE 2?
4. [BR-008/FR-013 — FASE 2] Level pelekatan Organ/Zat Kontras/Metode: [ASUMSI] mengikuti anchor LOINC — konfirmasi saat scoping FASE 2 apakah benar mengikuti anchor atau selalu di level Pemeriksaan.
5. [§8.3.1 — FASE 2] Zat Kontras: enum tetap (Tanpa/Dengan/Tanpa & Dengan) atau master pilihan bebas (nama agen)? Seed Organ & Metode perlu disepakati RS.
6. [BR-021/BR-023 — FASE 2] Master pendukung TANPA status & TANPA delete: bagaimana menangani opsi keliru yang sudah dipakai? (koreksi via Update; perlu konfirmasi cukup atau butuh 'sembunyikan dari pilihan baru').
7. [NFR-006/FR-026 — PHASING] Konfirmasi cakupan struktur DB forward-compat FASE 1 untuk atribut/master FASE 2, agar aktivasi FASE 2 benar-benar tanpa migrasi besar.
8. [BR-022/§8.3.1 — PHASING] Konfirmasi penambahan kolom atribut FASE 2 pada template bersifat aditif & kompatibel mundur (template FASE 1 tetap dapat diimport setelah FASE 2). (NFR-011)
9. [BR-013/Q4] Multi-teknik dengan LOINC per-teknik: representasi `Observation`/order ditegaskan modul Pelayanan/Integrasi (di luar master ini).
10. Perlu kesepakatan tertulis dengan manajemen/RS bahwa kelengkapan pengisian LOINC = tanggung jawab RS (bukan KPI product). (Q5, BR-012)
11. [Integrasi — FASE 2] Pemetaan FHIR persis untuk Organ (Anatomic Region/BodySite), Zat Kontras (Pharmaceutical), Metode (Method), Sisi Tubuh (Laterality/BodySite) diserahkan ke modul integrasi.
