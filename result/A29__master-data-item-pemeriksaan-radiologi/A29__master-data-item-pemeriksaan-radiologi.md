# PRD — Master Data Item Pemeriksaan Radiologi (New)

> **Catatan cakupan:** PRD ini disusun **tanpa UI** — tidak ada mockup layar, wording frontend, komponen visual (badge/kartu/warna), maupun spesifikasi tampilan (list view/dashboard presentasi). Fokus murni pada proses bisnis, model data, business rules, skema database, dan **kontrak API**. Aturan validasi ditulis sebagai **validasi backend/API** (server-side); spesifikasi "daftar" ditulis sebagai **kontrak response & parameter query API**, bukan tampilan layar.

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — [PERLU KONFIRMASI]
* **Related Documents**:
    * List Fitur V2.xlsx (sheet MVP Fitur Operasional) — code **A29** *Item Pemeriksaan Radiologi (New)*
    * PRD terkait: **A14** Item Pemeriksaan Laboratorium (pola kembar penunjang), A3 Unit, A10 Tindakan (pola tarif/BPJS), A11 Diagnosa & A13 Procedure (pola mapping SATUSEHAT), A53 RBAC
    * Standar: SATUSEHAT Terminology (LOINC/SNOMED CT), DICOM Modality Worklist (MWL), BPJS (tarif/LUPIS), Permenkes No. 24/2022 tentang RME
* **Document Version**: 2026-07-01, v1.0 — Draft awal (belum diverifikasi stakeholder)

## 2. Overview & Background

* **Overview / Brief Summary**:
  Modul **Master Data Item Pemeriksaan Radiologi** adalah pusat pengelolaan data referensi jenis pemeriksaan radiologi (imaging) pada SIMRS RS Tipe C & D. Modul mengelola katalog pemeriksaan per **modalitas** (X-Ray/Radiografi, USG, CT-Scan, MRI, Panoramic/Dental, Mammografi, Fluoroskopi, BMD), beserta atribut layanan (region/organ, proyeksi/posisi, penggunaan kontras, persiapan pasien, estimasi durasi, jumlah film/ekspos), komponen tarif, dan **pemetaan kode standar** (SATUSEHAT + BPJS + kode modalitas DICOM). Modul menjadi *single source of truth* yang dipakai modul transaksi radiologi (order penunjang, konfirmasi order, worklist modality, input hasil/ekspertise) dan billing.

  Fokus rilis ini (Phase 1): **CRUD master item pemeriksaan radiologi + mapping kode standar**, tanpa approval berjenjang. Arsitektur data dirancang **siap approval berjenjang di Phase 2** (kolom status & approver telah disiapkan sejak awal).

  [ASUMSI] Pengiriman `ImagingStudy`/`ServiceRequest` ke SATUSEHAT dan integrasi RIS/PACS *runtime* berada di modul transaksi radiologi; modul ini hanya menyediakan referensi master + mapping kode.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini) [ASUMSI — tidak ada BPMN khusus]:
        * Daftar pemeriksaan radiologi dikelola manual (spreadsheet/dokumen Word) atau tersebar per petugas → nama & kode tidak seragam, rawan duplikat.
        * Penentuan modalitas, penggunaan kontras, dan persiapan pasien tidak terstandar → instruksi ke pasien tidak konsisten.
        * Komponen tarif (jasa sarana, jasa medis/ekspertise, film/kontras) disalin manual ke billing → rawan beda versi & salah tagih.
        * Belum ada pemetaan kode **SATUSEHAT** (LOINC/SNOMED) → hambatan kirim `ImagingStudy` ke platform SATUSEHAT (kewajiban interoperabilitas RME).
        * Belum ada kode **modalitas DICOM** yang seragam → *Modality Worklist* (MWL) RIS/PACS harus diisi manual, rawan salah entry di alat.
    * **To-Be** (workflow digital diusulkan):
        1. Petugas berwenang membuka **Control Panel → Master Data → Item Pemeriksaan Radiologi**.
        2. Tambah/Ubah item → isi atribut (modalitas, region, proyeksi, kontras, persiapan, durasi, komponen tarif).
        3. **Mapping kode**: pilih kode SATUSEHAT (LOINC radiologi / SNOMED) → autofill display + system URI; isi kode BPJS (bila ada); set kode modalitas DICOM (CR/DX/US/CT/MR/MG/XA).
        4. Sistem **validasi duplikat** (kode internal/nama+modalitas) sebelum simpan.
        5. Item tersimpan → langsung tersedia sebagai referensi order radiologi, worklist MWL, dan billing.
        6. Nonaktifkan (soft-delete) item lama tanpa menghapus → histori transaksi tetap utuh.
        7. (Phase 2) Perubahan sensitif (tarif, aktivasi item baru) melewati **approval berjenjang** sebelum berlaku.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Katalog radiologi terstandar | 100% item punya kode internal unik + modalitas terisi |
| 2 | Interoperabilitas SATUSEHAT | ≥ 90% item aktif termapping kode SATUSEHAT (LOINC/SNOMED) [ASUMSI target] |
| 3 | Kesiapan MWL RIS/PACS | 100% item aktif punya kode modalitas DICOM valid |
| 4 | Akurasi billing | 100% item aktif punya komponen tarif berlaku |
| 5 | Efisiensi entry data | Waktu input 1 item baru < 3 menit [ASUMSI] |
| 6 | Kemudahan setup awal | ≥ 80% katalog awal ter-import via template massal |
| 7 | Konsistensi instruksi pasien | 100% item berkontras punya flag persiapan/informed consent terisi |

[PERLU KONFIRMASI] Angka target final ditetapkan manajemen RS / Instalasi Radiologi.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| Item Pemeriksaan Radiologi | CRUD item + soft-delete (aktif/nonaktif), pengelolaan atribut & modalitas | Approval berjenjang untuk aktivasi item baru & perubahan tarif (`status_approval`, `role_approver`) |
| Komponen Tarif | Input komponen tarif (jasa sarana, jasa medis, film/kontras) + tarif berlaku prospektif | Approval perubahan tarif + riwayat versi tarif berbasis persetujuan |
| Mapping Kode Standar | Mapping LOINC/SNOMED (SATUSEHAT), kode BPJS, kode modalitas DICOM | Sinkronisasi otomatis terminologi SATUSEHAT + validasi kode terjadwal |
| Import/Export Massal | Import CSV/XLSX via template + export | Import dengan tahap review/approval sebelum commit |
| Endpoint Ringkasan | Endpoint agregasi read-only (total item, jumlah termapping, dsb) | Endpoint agregasi item pending approval & item tanpa mapping |

**Out of Scope**:
* Seluruh aspek **UI/UX** (mockup layar, wording frontend, komponen visual) — sesuai instruksi "tanpa UI".
* Proses **order/permintaan** pemeriksaan radiologi (modul transaksi Order Penunjang Radiologi).
* **Input hasil & ekspertise** radiologi, template hasil per jenis pemeriksaan (modul Radiologi — Input Hasil/Expertise).
* Integrasi **RIS/PACS & DICOM** secara runtime (kirim MWL, terima ImagingStudy) — modul Integrasi RIS/PACS. Modul ini hanya menyediakan kode modalitas & mapping.
* Penjurnalan/billing aktual (modul Kasir/Keuangan) — modul ini hanya menyimpan tarif referensi.
* Manajemen stok film/kontras/BHP (modul Inventory) — modul ini hanya merujuk.
* Pengiriman `ImagingStudy`/`Observation` ke SATUSEHAT secara real-time (modul transaksi/integrasi).

## 5. Related Features

| Code | Menu | Relasi Teknis/Bisnis |
|------|------|----------------------|
| A14 | Item Pemeriksaan Laboratorium | Pola kembar penunjang — struktur master, mapping SATUSEHAT/BPJS, soft-delete, snapshot tarif identik |
| A3 | Master Data > Unit | Lookup unit/instalasi radiologi pelaksana (FK `unit_id`) |
| A10 | Integrasi BPJS V2 > Tindakan | Pola mapping kode & tarif BPJS |
| A11 | Integrasi SATUSEHAT BPJS V2 > Diagnosa | Pola mapping kode SATUSEHAT (code/display/system) |
| A13 | Integrasi SATUSEHAT BPJS V2 > Procedure | Analogi terdekat mapping prosedur/imaging |
| A53 | Admin RBAC | Kontrol akses CRUD master (role berwenang) |
| — | Order Penunjang Radiologi | Konsumen: order merujuk item master ini |
| — | Integrasi RIS/PACS | Konsumen: memakai `dicom_modality_code` untuk MWL |

## 6. Business Process & User Stories

* **State Machine Table** (lifecycle item master — bukan stok):

| Status | Deskripsi | Efek Stok | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| `DRAFT` | Item dibuat namun belum siap dipakai | — (master, tanpa stok) | `DRAFT → ACTIVE` (langsung oleh admin) | `DRAFT → PENDING_APPROVAL` |
| `PENDING_APPROVAL` | Menunggu persetujuan approver (Phase 2) | — | *(tidak dipakai di Phase 1)* | `PENDING_APPROVAL → ACTIVE` (approve) / `→ DRAFT` (reject) |
| `ACTIVE` | Item aktif, dapat dipakai order/billing/MWL | — | `ACTIVE → INACTIVE` (ubah status) | `ACTIVE → INACTIVE` (perlu approval bila diatur) |
| `INACTIVE` | Nonaktif (soft-delete), tidak muncul di order baru | — | `INACTIVE → ACTIVE` (reaktivasi) | `INACTIVE → PENDING_APPROVAL` (reaktivasi via approval) |

> Catatan: Item **tidak pernah** di-*hard delete* bila sudah pernah dipakai transaksi (jaga integritas histori). Efek stok tidak berlaku (ini master data referensi, bukan barang).

* **User Stories Utama**:
    * **US-001** — Sebagai *Penanggung Jawab Radiologi*, saya ingin menambah jenis pemeriksaan radiologi beserta modalitas & atributnya, agar katalog seragam dipakai semua modul. *(Phase 1)*
    * **US-002** — Sebagai *Admin Master*, saya ingin menandai item yang **memakai kontras** beserta persiapan pasien & kebutuhan informed consent, agar instruksi pasien konsisten. *(Phase 1)*
    * **US-003** — Sebagai *Admin Master*, saya ingin memetakan item ke kode **SATUSEHAT (LOINC/SNOMED)** & **modalitas DICOM**, agar hasil imaging dapat dikirim ke SATUSEHAT dan MWL RIS/PACS terisi otomatis. *(Phase 1)*
    * **US-004** — Sebagai *Admin Master*, saya ingin mengelola **komponen tarif** (jasa sarana, jasa medis/ekspertise, film/kontras) berlaku prospektif, agar billing akurat. *(Phase 1)*
    * **US-005** — Sebagai *Admin Master*, saya ingin sistem mencegah **duplikat** kode/nama+modalitas saat simpan, agar tidak ada item ganda. *(Phase 1)*
    * **US-006** — Sebagai *Admin Master*, saya ingin **menonaktifkan** item lama tanpa menghapus, agar histori transaksi tetap utuh. *(Phase 1)*
    * **US-007** — Sebagai *Admin Master*, saya ingin **impor massal** katalog via template, agar setup awal cepat. *(Phase 1)*
    * **US-008** — Sebagai *Kepala Instalasi*, saya ingin perubahan **tarif & aktivasi item** melewati **approval berjenjang**, agar perubahan sensitif terkontrol. *(Phase 2)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

> Validasi ditulis sebagai **rules backend/API** (server-side), tanpa wording frontend (tanpa UI).

---

**Fitur: CRUD Item Pemeriksaan Radiologi**
* **User Story**: Sebagai Penanggung Jawab Radiologi, saya ingin membuat/mengubah/menonaktifkan item pemeriksaan radiologi, agar katalog referensi terkelola.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Membuat item dengan field wajib lengkap (kode, nama, modalitas, unit, minimal 1 komponen tarif) mengembalikan `201 Created` dan item berstatus `ACTIVE` (status **tidak** dikirim dari input; diset sistem).
    * **AC 2**: Membuat item dengan `kode_item` yang sudah ada mengembalikan `409 Conflict` dengan pesan duplikasi; data tidak tersimpan.
    * **AC 3**: Mengubah item yang **sudah dipakai transaksi** hanya memperbolehkan perubahan atribut non-kunci & nonaktivasi; upaya hard-delete mengembalikan `409 Conflict`.
    * **AC 4**: Toggle status `ACTIVE ↔ INACTIVE` mengembalikan `200 OK`; item `INACTIVE` tidak muncul pada endpoint list untuk order (`?status=active`).
    * **AC 5**: `GET` detail mengembalikan seluruh atribut termasuk komponen tarif berlaku dan mapping kode.
* **Validasi (Backend/API)**:

  | Field | Tipe | Rules (server-side) | Error (HTTP + kode) |
  |-------|------|---------------------|---------------------|
  | `kode_item` | string | Wajib, unik, ≤ 20 char, alfanumerik `[A-Z0-9-]` | `422` `ERR_REQUIRED` / `409` `ERR_DUPLICATE` |
  | `nama_pemeriksaan` | string | Wajib, ≤ 120 char | `422` `ERR_REQUIRED` |
  | `modality` | enum | Wajib, ∈ {XRAY, USG, CT, MRI, MG, FLUORO, PANORAMIC, BMD, OTHER} | `422` `ERR_ENUM` |
  | `unit_id` | uuid | Wajib, FK ada di master Unit (A3) | `422` `ERR_FK_NOTFOUND` |
  | `use_contrast` | boolean | Wajib (default false) | `422` `ERR_TYPE` |
  | `status` | enum | **Tidak boleh dikirim saat create**; diabaikan → diset sistem | `422` `ERR_STATUS_IMMUTABLE` bila dikirim |

---

**Fitur: Atribut Kontras & Persiapan Pasien**
* **User Story**: Sebagai Admin Master, saya ingin menandai item berkontras + persiapan pasien + informed consent, agar instruksi konsisten.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Bila `use_contrast = true`, field `contrast_type` wajib terisi, jika tidak → `422`.
    * **AC 2**: Bila `use_contrast = true`, `requires_informed_consent` otomatis di-default `true` (dapat di-override eksplisit).
    * **AC 3**: `patient_preparation` (teks bebas ≤ 500 char) tersimpan dan tampil di detail item.
* **Validasi (Backend/API)**:

  | Field | Tipe | Rules | Error |
  |-------|------|-------|-------|
  | `contrast_type` | string | Wajib **bila** `use_contrast=true`, ≤ 100 char | `422` `ERR_CONDITIONAL_REQUIRED` |
  | `requires_informed_consent` | boolean | Default `true` bila `use_contrast=true` | — |
  | `patient_preparation` | text | Opsional, ≤ 500 char | `422` `ERR_MAXLEN` |

---

**Fitur: Mapping Kode Standar (SATUSEHAT / BPJS / DICOM)**
* **User Story**: Sebagai Admin Master, saya ingin memetakan item ke kode standar, agar interoperabilitas & MWL berjalan.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Memasukkan `satusehat_code` mengharuskan `satusehat_system` & `satusehat_display` terisi (autofill dari lookup); jika tidak → `422`.
    * **AC 2**: `dicom_modality_code` divalidasi terhadap daftar kode DICOM standar (CR, DX, US, CT, MR, MG, XA, RF, BMD); nilai di luar daftar → `422`.
    * **AC 3**: `kode_bpjs` opsional; bila diisi tersimpan apa adanya (referensi BPJS).
* **Validasi (Backend/API)**:

  | Field | Tipe | Rules | Error |
  |-------|------|-------|-------|
  | `satusehat_code` | string | Opsional; bila diisi → `satusehat_system` + `satusehat_display` wajib | `422` `ERR_CONDITIONAL_REQUIRED` |
  | `satusehat_system` | string(uri) | URI valid (mis. `http://loinc.org`, `http://snomed.info/sct`) | `422` `ERR_URI` |
  | `dicom_modality_code` | enum | Wajib utk item aktif; ∈ daftar DICOM | `422` `ERR_ENUM` |
  | `kode_bpjs` | string | Opsional, ≤ 30 char | `422` `ERR_MAXLEN` |

---

**Fitur: Komponen Tarif (Prospektif)**
* **User Story**: Sebagai Admin Master, saya ingin mengelola komponen tarif berlaku prospektif, agar billing akurat & histori terjaga.
* **Prioritas**: P1
* **Fase**: Phase 1 (input) / Phase 2 (approval perubahan)
* **Acceptance Criteria**:
    * **AC 1**: Setiap item aktif wajib punya ≥ 1 baris tarif dengan `effective_date` & total = jumlah komponen (`service_fee` + `doctor_fee` + `material_fee`).
    * **AC 2**: Menyimpan tarif baru dengan `effective_date` di masa depan **tidak** mengubah tarif berjalan; transaksi lama tetap memakai tarif *snapshot* saat order.
    * **AC 3**: `effective_date` < hari ini ditolak (`422`) kecuali data migrasi awal ([PERLU KONFIRMASI]).
* **Validasi (Backend/API)**:

  | Field | Tipe | Rules | Error |
  |-------|------|-------|-------|
  | `service_fee` / `doctor_fee` / `material_fee` | number | ≥ 0 | `422` `ERR_MIN` |
  | `total_tariff` | number | = jumlah komponen (dihitung server) | `422` `ERR_TARIFF_MISMATCH` |
  | `effective_date` | date | ≥ hari ini (kecuali migrasi) | `422` `ERR_DATE_PAST` |

---

**Fitur: Import/Export Massal**
* **User Story**: Sebagai Admin Master, saya ingin impor katalog via template CSV/XLSX, agar setup awal cepat.
* **Prioritas**: P2
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Upload file sesuai template mengembalikan laporan `{total, sukses, gagal[]}` per baris.
    * **AC 2**: Baris duplikat/kode wajib kosong ditandai gagal beserta alasan; [PERLU KONFIRMASI] mode *partial commit* vs *all-or-nothing*.
    * **AC 3**: Export mengembalikan seluruh item (dengan filter aktif) dalam CSV/XLSX.

---

**Fitur: Approval Berjenjang (Phase 2)**
* **User Story**: Sebagai Kepala Instalasi, saya ingin aktivasi item & perubahan tarif melewati approval, agar terkontrol.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Saat approval aktif, create/ubah-tarif menghasilkan status `PENDING_APPROVAL`, bukan langsung `ACTIVE`.
    * **AC 2**: Hanya `role_approver` yang berwenang meng-*approve*/*reject*; approve → `ACTIVE`, reject → `DRAFT` + alasan.
    * **AC 3**: Seluruh transisi approval tercatat di audit log (siapa, kapan, aksi).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `radiology_exam_items`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `kode_item`: VARCHAR(20) UNIQUE NOT NULL
    * `nama_pemeriksaan`: VARCHAR(120) NOT NULL
    * `modality`: ENUM(`XRAY`,`USG`,`CT`,`MRI`,`MG`,`FLUORO`,`PANORAMIC`,`BMD`,`OTHER`) NOT NULL
    * `body_region`: VARCHAR(100) NULL — mis. kepala, thorax, abdomen, ekstremitas
    * `projection`: VARCHAR(100) NULL — mis. AP/PA/Lateral/Oblique
    * `unit_id`: UUID (FK → `units.id`) NOT NULL
    * `use_contrast`: BOOLEAN NOT NULL DEFAULT false
    * `contrast_type`: VARCHAR(100) NULL — wajib bila `use_contrast=true`
    * `requires_informed_consent`: BOOLEAN NOT NULL DEFAULT false
    * `patient_preparation`: TEXT NULL
    * `estimated_duration_min`: INT NULL
    * `film_count`: INT NULL — jumlah film/ekspos
    * `radiation_dose_msv`: DECIMAL(6,3) NULL — referensi DRL (opsional)
    * `dicom_modality_code`: VARCHAR(8) NULL — CR/DX/US/CT/MR/MG/XA/RF/BMD (MWL)
    * `satusehat_code`: VARCHAR(50) NULL
    * `satusehat_display`: VARCHAR(255) NULL
    * `satusehat_system`: VARCHAR(255) NULL — mis. `http://loinc.org`
    * `kode_bpjs`: VARCHAR(30) NULL
    * `status`: ENUM(`DRAFT`,`PENDING_APPROVAL`,`ACTIVE`,`INACTIVE`) NOT NULL DEFAULT `ACTIVE`
    * `is_active`: BOOLEAN NOT NULL DEFAULT true — turunan `status=ACTIVE` (kemudahan query list)
    * **`status_approval`**: ENUM(`NONE`,`PENDING`,`APPROVED`,`REJECTED`) NOT NULL DEFAULT `NONE` — *disiapkan Phase 2*
    * **`role_approver`**: VARCHAR(50) NULL — *disiapkan Phase 2*
    * `keterangan`: VARCHAR(255) NULL
    * `created_at` / `updated_at` / `deleted_at`: TIMESTAMP

* **Table Name**: `radiology_exam_tariffs` (riwayat tarif prospektif — 1 item : N tarif)
* **Key Columns**:
    * `id`: UUID (PK)
    * `exam_item_id`: UUID (FK → `radiology_exam_items.id`) NOT NULL
    * `service_fee`: DECIMAL(14,2) NOT NULL DEFAULT 0 — jasa sarana
    * `doctor_fee`: DECIMAL(14,2) NOT NULL DEFAULT 0 — jasa medis/ekspertise
    * `material_fee`: DECIMAL(14,2) NOT NULL DEFAULT 0 — film/kontras/BHP
    * `total_tariff`: DECIMAL(14,2) NOT NULL — = jumlah komponen (dihitung server)
    * `effective_date`: DATE NOT NULL
    * `status_approval`: ENUM(`NONE`,`PENDING`,`APPROVED`,`REJECTED`) DEFAULT `NONE` — *Phase 2*
    * `created_at`: audit

> Catatan konsistensi (selaras A14): pakai **soft-delete** (`status=INACTIVE`), **snapshot tarif** prospektif, kolom `status_approval`/`role_approver` disiapkan sejak Phase 1 agar migrasi ke Phase 2 tanpa perubahan skema. Index disarankan: `UNIQUE(kode_item)`, `INDEX(modality, is_active)`, `INDEX(satusehat_code)`, `INDEX(exam_item_id, effective_date)`.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/radiology-exam-items` | List item (filter: `?modality=`, `?status=active`, `?q=`, `?has_satusehat=`) |
| GET | `/api/v1/radiology-exam-items/{id}` | Detail item + tarif berlaku + mapping kode |
| POST | `/api/v1/radiology-exam-items` | Create item (status diset sistem = `ACTIVE`) |
| PUT | `/api/v1/radiology-exam-items/{id}` | Update atribut item |
| PATCH | `/api/v1/radiology-exam-items/{id}/status` | Ubah status Active/Inactive (soft-delete) |
| POST | `/api/v1/radiology-exam-items/{id}/tariffs` | Tambah tarif berlaku prospektif |
| GET | `/api/v1/radiology-exam-items/{id}/tariffs` | Riwayat tarif item |
| POST | `/api/v1/radiology-exam-items/import` | Import massal (CSV/XLSX) → laporan per baris |
| GET | `/api/v1/radiology-exam-items/export` | Export daftar (CSV/XLSX) |
| GET | `/api/v1/radiology-exam-items/lookup/satusehat?q=` | Cari kode SATUSEHAT (LOINC/SNOMED) untuk mapping |
| PATCH | `/api/v1/radiology-exam-items/{id}/approve` | *(Phase 2)* Approve item/tarif pending |
| PATCH | `/api/v1/radiology-exam-items/{id}/reject` | *(Phase 2)* Reject + alasan |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Request Body (Payload CREATE/EDIT)

> Kolom "Deskripsi" = penjelasan makna field pada kamus data (bukan label layar).


| Field | Deskripsi | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-----------|------|-------|----------|--------|---------|
| `kode_item` | Kode Pemeriksaan | string | Ya | unik, ≤20, `[A-Z0-9-]` | manual/auto | BR-001 |
| `nama_pemeriksaan` | Nama Pemeriksaan | string | Ya | ≤120 char | manual | |
| `modality` | Modalitas | enum | Ya | daftar modalitas | manual | XRAY/USG/CT/MRI/… |
| `body_region` | Region/Organ | string | Tidak | ≤100 char | manual | kepala/thorax/abdomen/… |
| `projection` | Proyeksi/Posisi | string | Tidak | ≤100 char | manual | AP/PA/Lateral/Oblique |
| `unit_id` | Unit Pelaksana | uuid | Ya | FK master Unit (A3) | lookup A3 | |
| `use_contrast` | Pakai Kontras | boolean | Ya | default false | manual | BR-005 |
| `contrast_type` | Jenis Kontras | string | Bersyarat | wajib bila `use_contrast` | manual | ≤100 char |
| `requires_informed_consent` | Perlu Informed Consent | boolean | Bersyarat | default true bila kontras | manual/auto | BR-005 |
| `patient_preparation` | Persiapan Pasien | text | Tidak | ≤500 char | manual | mis. puasa, kandung kemih penuh |
| `estimated_duration_min` | Estimasi Durasi (menit) | number | Tidak | > 0 | manual | |
| `film_count` | Jumlah Film/Ekspos | number | Tidak | ≥ 0 | manual | |
| `radiation_dose_msv` | Dosis Radiasi (mSv) | number | Tidak | ≥ 0 | manual | referensi DRL |
| `dicom_modality_code` | Kode Modalitas DICOM | enum | Bersyarat | wajib item aktif | manual | CR/DX/US/CT/MR/MG/XA (MWL) |
| `satusehat_code` | Kode SATUSEHAT | string | Tidak | +system+display bila diisi | lookup SATUSEHAT | LOINC/SNOMED, BR-007 |
| `satusehat_display` | SATUSEHAT Display | string | Auto | — | lookup | diisi server dari hasil lookup |
| `satusehat_system` | SATUSEHAT System URI | string(uri) | Auto | URI valid | lookup | mis. `http://loinc.org` |
| `kode_bpjs` | Kode BPJS | string | Tidak | ≤30 char | manual/integrasi | bila tersedia |
| `service_fee` | Jasa Sarana | number | Ya | ≥ 0 | manual | komponen tarif |
| `doctor_fee` | Jasa Medis/Ekspertise | number | Ya | ≥ 0 | manual | komponen tarif |
| `material_fee` | Film/Kontras/BHP | number | Ya | ≥ 0 | manual | komponen tarif |
| `effective_date` | Tarif Berlaku Mulai | date | Ya | ≥ hari ini | manual | prospektif (BR-004) |
| `keterangan` | Keterangan | string | Tidak | ≤255 char | manual | |

> **Status Behavior**: field `status` **tidak** diterima pada payload create (ditolak `422 ERR_STATUS_IMMUTABLE` bila dikirim). Sistem selalu men-set item baru = `ACTIVE` (Phase 1) atau `PENDING_APPROVAL` (Phase 2 bila approval aktif). Perubahan aktif/nonaktif hanya via endpoint `PATCH …/status`.

#### 8.3.2 Kontrak API — Endpoint List (Response & Query Params)

> Bukan spesifikasi tampilan. Berikut field yang dikembalikan `GET /api/v1/radiology-exam-items` dan parameter query yang didukung server (sort/filter = kemampuan API, bukan komponen layar). Nilai dikembalikan mentah (tanpa pemformatan Rupiah/badge/warna).

**Field pada response list (per item):**

| Field Response | Sumber Data | Tipe Data | Catatan |
|----------------|-------------|-----------|---------|
| `id` | `radiology_exam_items.id` | uuid | |
| `kode_item` | `kode_item` | string | |
| `nama_pemeriksaan` | `nama_pemeriksaan` | string | |
| `modality` | `modality` | enum | |
| `body_region` | `body_region` | string | nullable |
| `use_contrast` | `use_contrast` | boolean | |
| `total_tariff` | `radiology_exam_tariffs.total_tariff` (tarif berlaku hari ini) | number | numerik mentah |
| `has_satusehat` | derivasi `satusehat_code IS NOT NULL` | boolean | indikator interoperabilitas |
| `dicom_modality_code` | `dicom_modality_code` | string | kesiapan MWL |
| `status` | `status` | enum | ACTIVE/INACTIVE/DRAFT/PENDING_APPROVAL |
| `updated_at` | audit | timestamp | |

**Parameter query yang didukung (kemampuan API):**

| Param | Contoh | Fungsi |
|-------|--------|--------|
| `q` | `?q=thorax` | pencarian teks pada `kode_item` & `nama_pemeriksaan` |
| `modality` | `?modality=CT` | filter per modalitas |
| `status` | `?status=active` | filter status (default `ACTIVE` untuk konsumen order) |
| `use_contrast` | `?use_contrast=true` | filter item berkontras |
| `has_satusehat` | `?has_satusehat=false` | filter item belum termapping (audit interoperabilitas) |
| `sort` / `order` | `?sort=kode_item&order=asc` | pengurutan (whitelist: `kode_item`,`nama_pemeriksaan`,`updated_at`) |
| `page` / `per_page` | `?page=1&per_page=50` | paginasi |

* **Business Rules**:
    * **BR-001**: `kode_item` unik & wajib; sistem menolak duplikat (`409`). Kombinasi `nama_pemeriksaan + modality` juga dicek untuk peringatan duplikasi.
    * **BR-002**: Item yang **sudah dipakai transaksi** tidak boleh di-hard-delete; hanya `INACTIVE` (soft-delete).
    * **BR-003**: Perubahan tarif berlaku **prospektif**; transaksi lama memakai tarif *snapshot* saat order (tidak retroaktif).
    * **BR-004**: `total_tariff` = `service_fee + doctor_fee + material_fee` (dihitung & divalidasi server, bukan dipercaya dari client).
    * **BR-005**: Bila `use_contrast = true` → `contrast_type` wajib dan `requires_informed_consent` default `true`.
    * **BR-006**: Item **aktif** wajib punya `dicom_modality_code` valid (kesiapan MWL RIS/PACS) dan ≥ 1 baris tarif berlaku.
    * **BR-007**: Mapping SATUSEHAT (LOINC/SNOMED) wajib untuk item aktif yang menghasilkan `ImagingStudy` dikirim ke SATUSEHAT [PERLU KONFIRMASI cakupan wajib].
    * **BR-008**: Hanya role berwenang (RBAC A53) yang dapat CRUD master.
    * **BR-009**: Setiap create/update/perubahan status dicatat audit (user, timestamp, aksi).
    * **BR-010**: Status default item baru = `ACTIVE` (Phase 1); field status tidak diterima pada payload create.
    * **BR-011** *(Phase 2)*: Saat approval aktif, aktivasi item & perubahan tarif → `status_approval=PENDING`, hanya `role_approver` yang boleh approve/reject.

## 9. Workflow / BPMN Interpretation

[ASUMSI] Tidak ada BPMN khusus modul master ini; alur diturunkan dari pola master data penunjang (A14) dan proses order radiologi hilir.

**Alur inti — Tambah Item Pemeriksaan Radiologi (To-Be):**
1. Admin membuka menu → aksi **Tambah**.
2. Isi data umum (kode, nama, modalitas, region, proyeksi, unit).
3. Tentukan atribut layanan: pakai kontras? → bila ya, isi jenis kontras + persiapan + informed consent; isi durasi, jumlah film, dosis (opsional).
4. Isi **komponen tarif** (jasa sarana + jasa medis + film/kontras) + tanggal berlaku.
5. **Mapping kode**: cari kode SATUSEHAT (LOINC/SNOMED) → autofill display/system; set kode modalitas DICOM; isi kode BPJS bila ada.
6. **Simpan** → server validasi: field wajib, duplikat (`kode_item`, `nama+modality`), konsistensi kontras, total tarif.
    * *Gateway — duplikat?* **Ya** → `409`, blok simpan. **Tidak** → lanjut.
    * *Gateway — approval aktif? (Phase 2)* **Ya** → status `PENDING_APPROVAL`, kirim ke approver. **Tidak** → status `ACTIVE`.
7. Event: **Item tersimpan** → tersedia untuk order radiologi, worklist MWL (via `dicom_modality_code`), dan billing.

**Alur — Ubah/Nonaktifkan Item:**
1. Cari item → ambil detail → **Ubah** atau **ubah status** (via `PATCH …/status`).
2. *Gateway — dipakai transaksi?* **Ya** → hanya boleh nonaktif + perubahan tarif prospektif. **Tidak** → boleh ubah penuh.
3. Simpan → audit log.

---

## Asumsi
* [ASUMSI] Modul tidak punya BPMN sendiri; alur As-Is/To-Be diturunkan dari pola A14 (Item Pemeriksaan Lab) sebagai modul kembar penunjang.
* [ASUMSI] Kode standar radiologi memakai **LOINC** (kode radiologi) dan/atau **SNOMED CT** (prosedur/organ) sesuai SATUSEHAT Terminology — kombinasi final [PERLU KONFIRMASI].
* [ASUMSI] `dicom_modality_code` memakai daftar Modality DICOM standar (CR, DX, US, CT, MR, MG, XA, RF, BMD).
* [ASUMSI] Tarif prospektif memakai mekanisme snapshot konsisten dengan A14 & konteks PRD terkait.
* [ASUMSI] Soft-delete (nonaktif) dipakai, bukan hard-delete, demi integritas histori transaksi.
* [ASUMSI] Kolom `status_approval`/`role_approver` disiapkan Phase 1 agar Phase 2 tanpa perubahan skema.

## Pertanyaan Terbuka
* Terminologi SATUSEHAT untuk radiologi: LOINC saja, SNOMED CT saja, atau kombinasi? Apakah wajib per item aktif?
* Apakah kode BPJS tersedia untuk pemeriksaan radiologi, dan sumbernya (LUPIS/manual)?
* Struktur komponen tarif final — cukup 3 komponen (sarana/medis/bahan) atau perlu rincian film/kontras terpisah?
* Mode import massal: *all-or-nothing* atau *partial commit*?
* Apakah `radiation_dose_msv` (DRL) & `film_count` relevan di RS Tipe C&D, atau cukup opsional?
* Ruang lingkup approval Phase 2: hanya tarif & aktivasi, atau termasuk perubahan mapping kode?
* Apakah master **paket pemeriksaan radiologi** (bundling beberapa item) dikelola di sini atau modul terpisah?
