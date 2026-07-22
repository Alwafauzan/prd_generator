# PRD — Master Data Diagnosa Perawat (Diagnosis Keperawatan)

> **Catatan cakupan:** PRD ini disusun **tanpa UI** — tidak ada mockup layar, wording frontend, komponen visual (badge/kartu/warna), maupun spesifikasi tampilan (list view/dashboard presentasi). Fokus murni pada proses bisnis, model data, business rules, skema database, dan **kontrak API**. Aturan validasi ditulis sebagai **validasi backend/API** (server-side); spesifikasi "daftar" ditulis sebagai **kontrak response & parameter query API**, bukan tampilan layar.

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — [PERLU KONFIRMASI] (disarankan: Komite Keperawatan / Bidang Keperawatan)
* **Related Documents**:
    * List Fitur V2.xlsx (sheet MVP Fitur Operasional) — code **A12** *Diagnosa Perawat*
    * Standar rujukan: **SDKI** (Standar Diagnosis Keperawatan Indonesia — PPNI), pendamping **SLKI** (Luaran) & **SIKI** (Intervensi)
    * PRD terkait: **A11** Diagnosa (medis, ICD-10/SATUSEHAT — pola master & mapping kode), A53 Admin RBAC
    * Standar interoperabilitas: SATUSEHAT/RME, klasifikasi keperawatan **ICNP**/SNOMED CT (opsional) [PERLU KONFIRMASI]
* **Document Version**: 2026-07-01, v1.0 — Draft awal (belum diverifikasi stakeholder)

## 2. Overview & Background

* **Overview / Brief Summary**:
  Modul **Master Data Diagnosa Perawat** adalah pusat pengelolaan katalog **diagnosis keperawatan** pada SIMRS RS Tipe C & D, mengacu pada **SDKI (PPNI)**. Modul mengelola daftar label diagnosis (kode SDKI, nama, kategori, subkategori, jenis diagnosis) beserta komponen turunannya: **definisi**, **penyebab/etiologi**, **tanda & gejala** (mayor/minor — subjektif/objektif), **faktor risiko** (untuk diagnosis risiko), dan **kondisi klinis terkait**. Modul menjadi *single source of truth* diagnosis keperawatan yang dipakai modul asuhan keperawatan (pengkajian, penegakan diagnosis, rencana intervensi) di RJ/RI/IGD dan pelaporan RME.

  Fokus rilis ini (Phase 1): **CRUD master diagnosis keperawatan + komponen turunannya**, tanpa approval berjenjang. Arsitektur data dirancang **siap approval berjenjang di Phase 2** (governance Komite Keperawatan) — kolom `status_approval`/`role_approver` disiapkan sejak awal.

  [ASUMSI] Penegakan diagnosis pada pasien (transaksi asuhan keperawatan), pemilihan luaran (SLKI) & intervensi (SIKI) berada di modul asuhan keperawatan; modul ini hanya menyediakan referensi master diagnosis.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini) [ASUMSI — tidak ada BPMN khusus]:
        * Perawat merujuk buku SDKI cetak / dokumen terpisah saat menegakkan diagnosis → tidak seragam antar perawat/ruangan, rawan salah kode/label.
        * Definisi, tanda-gejala, dan faktor risiko dihafal/disalin manual → dokumentasi asuhan tidak konsisten & tidak lengkap.
        * Tidak ada katalog terpusat di SIMRS → diagnosis keperawatan sulit dilaporkan, diaudit, atau dipetakan ke standar RME/SATUSEHAT.
        * Pembaruan edisi SDKI tidak terkelola → versi acuan berbeda antar unit.
    * **To-Be** (workflow digital diusulkan):
        1. Petugas berwenang (mis. admin master/PJ keperawatan) membuka **Control Panel → Master Data → Diagnosa Perawat**.
        2. Tambah/Ubah diagnosis → isi kode SDKI, nama, kategori/subkategori, jenis diagnosis, definisi.
        3. Kelola komponen: **penyebab**, **tanda-gejala mayor/minor** (subjektif/objektif), **faktor risiko**, **kondisi klinis terkait**.
        4. (Opsional) **Mapping kode standar** (ICNP/SNOMED) untuk interoperabilitas RME.
        5. Sistem **validasi duplikat** (kode SDKI / nama) sebelum simpan.
        6. Diagnosis tersimpan → tersedia sebagai referensi di modul asuhan keperawatan (pengkajian → penegakan diagnosis → rencana).
        7. Nonaktifkan (soft-delete) diagnosis lama/deprekasi tanpa menghapus → histori asuhan tetap utuh.
        8. (Phase 2) Penambahan/perubahan diagnosis melewati **approval Komite Keperawatan** sebelum berlaku.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Katalog diagnosis keperawatan terstandar SDKI | 100% entri punya kode SDKI unik + kategori/subkategori terisi |
| 2 | Kelengkapan komponen diagnosis | 100% diagnosis aktual punya ≥1 tanda-gejala mayor; 100% diagnosis risiko punya ≥1 faktor risiko |
| 3 | Kesiapan interoperabilitas | ≥ 80% diagnosis aktif termapping ICNP/SNOMED [ASUMSI target, bila diadopsi] |
| 4 | Efisiensi penegakan diagnosis | Waktu perawat menemukan diagnosis via pencarian < 30 detik [ASUMSI] |
| 5 | Kemudahan setup awal | ≥ 90% katalog SDKI ter-import via template massal |
| 6 | Konsistensi versi acuan | 100% diagnosis aktif menyatakan `sdki_version` sumber |

[PERLU KONFIRMASI] Angka target final ditetapkan Bidang/Komite Keperawatan.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| Diagnosa Perawat (label) | CRUD diagnosis + soft-delete (aktif/nonaktif) | Approval Komite Keperawatan untuk aktivasi/perubahan (`status_approval`, `role_approver`) |
| Komponen Diagnosis | CRUD penyebab, tanda-gejala mayor/minor, faktor risiko, kondisi klinis terkait | Riwayat versi komponen berbasis persetujuan |
| Mapping Kode Standar | Mapping opsional ICNP/SNOMED (RME) | Sinkronisasi/validasi terminologi terjadwal |
| Relasi SLKI/SIKI | *(referensi kode saja, opsional)* | Pemetaan penuh diagnosis → luaran (SLKI) → intervensi (SIKI) sebagai template asuhan |
| Import/Export Massal | Import CSV/XLSX via template + export | Import dengan tahap review/approval sebelum commit |
| Endpoint Ringkasan | Endpoint agregasi read-only (jumlah per kategori/jenis, kelengkapan komponen) | Endpoint agregasi item pending approval & tanpa mapping |

**Out of Scope**:
* Seluruh aspek **UI/UX** (mockup layar, wording frontend, komponen visual) — sesuai instruksi "tanpa UI".
* **Penegakan diagnosis pada pasien** (transaksi asuhan keperawatan: pengkajian, analisis data, penetapan diagnosis aktual pasien) — modul Asuhan Keperawatan.
* Manajemen **luaran (SLKI)** & **intervensi/implementasi (SIKI)** penuh sebagai master tersendiri — modul terpisah; di sini hanya referensi kode opsional.
* Pengiriman data diagnosis keperawatan ke **SATUSEHAT** secara real-time — modul transaksi/integrasi.
* Diagnosa **medis** (ICD-10) — dikelola modul A11 Diagnosa.
* Penilaian/skoring pengkajian keperawatan (mis. Barthel, Morse, Norton) — modul asesmen.

## 5. Related Features

| Code | Menu | Relasi Teknis/Bisnis |
|------|------|----------------------|
| A11 | Master Data / Integrasi SATUSEHAT BPJS > Diagnosa (medis) | Pola master & mapping kode standar; diagnosis medis vs keperawatan dipisah tapi konsisten strukturnya |
| A53 | Admin RBAC | Kontrol akses CRUD master (role berwenang) |
| — | Asuhan Keperawatan (Pengkajian/Diagnosis/Intervensi) | Konsumen utama: menegakkan diagnosis pasien merujuk master ini |
| — | Master SLKI (Luaran) / SIKI (Intervensi) | Relasi opsional: diagnosis → luaran → intervensi (template asuhan) — [ASUMSI belum ada di MVP] |

## 6. Business Process & User Stories

* **State Machine Table** (lifecycle master diagnosis — bukan stok):

| Status | Deskripsi | Efek Stok | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| `DRAFT` | Diagnosis dibuat, belum siap dipakai | — (master, tanpa stok) | `DRAFT → ACTIVE` (langsung oleh admin) | `DRAFT → PENDING_APPROVAL` |
| `PENDING_APPROVAL` | Menunggu persetujuan Komite Keperawatan (Phase 2) | — | *(tidak dipakai di Phase 1)* | `PENDING_APPROVAL → ACTIVE` (approve) / `→ DRAFT` (reject) |
| `ACTIVE` | Aktif, dapat dipakai pada asuhan keperawatan | — | `ACTIVE → INACTIVE` (ubah status) | `ACTIVE → INACTIVE` (perlu approval bila diatur) |
| `INACTIVE` | Nonaktif/deprekasi (soft-delete), tidak muncul untuk diagnosis baru | — | `INACTIVE → ACTIVE` (reaktivasi) | `INACTIVE → PENDING_APPROVAL` |

> Catatan: Diagnosis **tidak pernah** di-*hard delete* bila sudah pernah dipakai pada asuhan pasien (jaga integritas histori & RME). Efek stok tidak berlaku (master data referensi klinis).

* **User Stories Utama**:
    * **US-001** — Sebagai *Admin Master/PJ Keperawatan*, saya ingin menambah diagnosis keperawatan (kode SDKI, kategori, jenis, definisi), agar katalog seragam dipakai semua ruangan. *(Phase 1)*
    * **US-002** — Sebagai *Admin Master*, saya ingin mengelola **tanda & gejala mayor/minor** (subjektif/objektif) per diagnosis, agar dokumentasi asuhan lengkap & konsisten. *(Phase 1)*
    * **US-003** — Sebagai *Admin Master*, saya ingin mengisi **penyebab/etiologi** & **faktor risiko**, agar perawat dapat merumuskan diagnosis (P-E-S / risiko) dengan benar. *(Phase 1)*
    * **US-004** — Sebagai *Admin Master*, saya ingin sistem mencegah **duplikat** kode SDKI/nama saat simpan, agar tidak ada entri ganda. *(Phase 1)*
    * **US-005** — Sebagai *Admin Master*, saya ingin **menonaktifkan** diagnosis lama/deprekasi tanpa menghapus, agar histori asuhan tetap utuh. *(Phase 1)*
    * **US-006** — Sebagai *Admin Master*, saya ingin **impor massal** katalog SDKI via template, agar setup awal cepat. *(Phase 1)*
    * **US-007** — Sebagai *Admin Master*, saya ingin (opsional) memetakan diagnosis ke **ICNP/SNOMED**, agar siap interoperabilitas RME. *(Phase 1, opsional)*
    * **US-008** — Sebagai *Komite Keperawatan*, saya ingin penambahan/perubahan diagnosis melewati **approval**, agar katalog terjaga mutunya. *(Phase 2)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

> Validasi ditulis sebagai **rules backend/API** (server-side), tanpa wording frontend (tanpa UI).

---

**Fitur: CRUD Diagnosa Perawat (Label)**
* **User Story**: Sebagai Admin Master/PJ Keperawatan, saya ingin membuat/mengubah/menonaktifkan diagnosis keperawatan, agar katalog referensi terkelola.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Membuat diagnosis dengan field wajib lengkap (kode SDKI, nama, kategori, subkategori, jenis) mengembalikan `201 Created` dan berstatus `ACTIVE` (status **tidak** dikirim dari input; diset sistem).
    * **AC 2**: Membuat diagnosis dengan `kode_sdki` yang sudah ada mengembalikan `409 Conflict`; data tidak tersimpan.
    * **AC 3**: Menyimpan diagnosis berjenis `AKTUAL` tanpa ≥1 tanda-gejala mayor mengembalikan `422`; berjenis `RISIKO` tanpa ≥1 faktor risiko mengembalikan `422`.
    * **AC 4**: Mengubah diagnosis yang **sudah dipakai asuhan pasien** hanya memperbolehkan perubahan atribut non-kunci & nonaktivasi; upaya hard-delete mengembalikan `409 Conflict`.
    * **AC 5**: Ubah status `ACTIVE ↔ INACTIVE` mengembalikan `200 OK`; diagnosis `INACTIVE` tidak muncul pada endpoint list konsumen (`?status=active`).
* **Validasi (Backend/API)**:

  | Field | Tipe | Rules (server-side) | Error (HTTP + kode) |
  |-------|------|---------------------|---------------------|
  | `kode_sdki` | string | Wajib, unik, pola `D.####` (mis. `D.0019`) | `422` `ERR_FORMAT` / `409` `ERR_DUPLICATE` |
  | `nama_diagnosis` | string | Wajib, ≤ 150 char | `422` `ERR_REQUIRED` |
  | `kategori` | enum | Wajib ∈ {FISIOLOGIS, PSIKOLOGIS, PERILAKU, RELASIONAL, LINGKUNGAN} | `422` `ERR_ENUM` |
  | `subkategori` | enum | Wajib, konsisten dgn kategori (mis. FISIOLOGIS→Respirasi/Sirkulasi/…) | `422` `ERR_ENUM` |
  | `jenis_diagnosis` | enum | Wajib ∈ {AKTUAL, RISIKO, PROMOSI_KESEHATAN} | `422` `ERR_ENUM` |
  | `definisi` | text | Wajib, ≤ 1000 char | `422` `ERR_REQUIRED` |
  | `status` | enum | **Tidak boleh dikirim saat create**; diabaikan → diset sistem | `422` `ERR_STATUS_IMMUTABLE` bila dikirim |

---

**Fitur: Kelola Komponen Diagnosis (Penyebab, Tanda-Gejala, Faktor Risiko)**
* **User Story**: Sebagai Admin Master, saya ingin mengelola komponen turunan diagnosis, agar perawat merumuskan diagnosis lengkap & benar.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Menambah **tanda-gejala** wajib menyertakan `tingkat` (MAYOR/MINOR) dan `sifat` (SUBJEKTIF/OBJEKTIF); nilai di luar enum → `422`.
    * **AC 2**: **Penyebab/etiologi** relevan untuk `AKTUAL` & `PROMOSI_KESEHATAN`; **faktor risiko** relevan untuk `RISIKO`. Menambah faktor risiko pada diagnosis non-risiko → `422 ERR_NOT_APPLICABLE`.
    * **AC 3**: Menghapus komponen mengembalikan `200 OK`; diagnosis tetap valid selama syarat minimum (AC pada fitur CRUD) terpenuhi.
* **Validasi (Backend/API)**:

  | Field (komponen) | Tipe | Rules | Error |
  |------------------|------|-------|-------|
  | `tingkat` (tanda-gejala) | enum | Wajib ∈ {MAYOR, MINOR} | `422` `ERR_ENUM` |
  | `sifat` (tanda-gejala) | enum | Wajib ∈ {SUBJEKTIF, OBJEKTIF} | `422` `ERR_ENUM` |
  | `deskripsi` (semua komponen) | string | Wajib, ≤ 255 char | `422` `ERR_REQUIRED` |
  | `jenis_komponen` | enum | ∈ {PENYEBAB, TANDA_GEJALA, FAKTOR_RISIKO, KONDISI_KLINIS} sesuai `jenis_diagnosis` | `422` `ERR_NOT_APPLICABLE` |

---

**Fitur: Mapping Kode Standar (ICNP/SNOMED) — Opsional**
* **User Story**: Sebagai Admin Master, saya ingin (opsional) memetakan diagnosis ke ICNP/SNOMED, agar siap interoperabilitas RME.
* **Prioritas**: P3
* **Fase**: Phase 1 (opsional)
* **Acceptance Criteria**:
    * **AC 1**: Memasukkan `terminology_code` mengharuskan `terminology_system` & `terminology_display` terisi; jika tidak → `422`.
    * **AC 2**: `terminology_system` divalidasi sebagai URI (mis. `http://snomed.info/sct`, ICNP URI).
* **Validasi (Backend/API)**:

  | Field | Tipe | Rules | Error |
  |-------|------|-------|-------|
  | `terminology_code` | string | Opsional; bila diisi → `terminology_system` + `terminology_display` wajib | `422` `ERR_CONDITIONAL_REQUIRED` |
  | `terminology_system` | string(uri) | URI valid | `422` `ERR_URI` |

---

**Fitur: Import/Export Massal**
* **User Story**: Sebagai Admin Master, saya ingin impor katalog SDKI via template CSV/XLSX, agar setup awal cepat.
* **Prioritas**: P2
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Upload file sesuai template mengembalikan laporan `{total, sukses, gagal[]}` per baris.
    * **AC 2**: Baris duplikat/kode wajib kosong ditandai gagal beserta alasan; [PERLU KONFIRMASI] mode *partial commit* vs *all-or-nothing*.
    * **AC 3**: Export mengembalikan seluruh diagnosis (dengan filter aktif) dalam CSV/XLSX, termasuk komponen (format ternormalisasi/child rows).

---

**Fitur: Approval Berjenjang (Phase 2)**
* **User Story**: Sebagai Komite Keperawatan, saya ingin aktivasi/perubahan diagnosis melewati approval, agar mutu katalog terjaga.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Saat approval aktif, create/ubah menghasilkan status `PENDING_APPROVAL`, bukan langsung `ACTIVE`.
    * **AC 2**: Hanya `role_approver` (Komite Keperawatan) yang boleh approve/reject; approve → `ACTIVE`, reject → `DRAFT` + alasan.
    * **AC 3**: Seluruh transisi approval tercatat di audit log (siapa, kapan, aksi).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `nursing_diagnoses`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `kode_sdki`: VARCHAR(10) UNIQUE NOT NULL — pola `D.####`
    * `nama_diagnosis`: VARCHAR(150) NOT NULL
    * `kategori`: ENUM(`FISIOLOGIS`,`PSIKOLOGIS`,`PERILAKU`,`RELASIONAL`,`LINGKUNGAN`) NOT NULL
    * `subkategori`: VARCHAR(60) NOT NULL — mis. Respirasi, Sirkulasi, Nutrisi/Cairan, Nyeri/Kenyamanan, Keamanan/Proteksi
    * `jenis_diagnosis`: ENUM(`AKTUAL`,`RISIKO`,`PROMOSI_KESEHATAN`) NOT NULL
    * `definisi`: TEXT NOT NULL
    * `kondisi_klinis_terkait`: TEXT NULL
    * `sdki_version`: VARCHAR(20) NULL — edisi/tahun acuan SDKI
    * `terminology_code`: VARCHAR(50) NULL — ICNP/SNOMED (opsional)
    * `terminology_display`: VARCHAR(255) NULL
    * `terminology_system`: VARCHAR(255) NULL — mis. `http://snomed.info/sct`
    * `status`: ENUM(`DRAFT`,`PENDING_APPROVAL`,`ACTIVE`,`INACTIVE`) NOT NULL DEFAULT `ACTIVE`
    * `is_active`: BOOLEAN NOT NULL DEFAULT true — turunan `status=ACTIVE`
    * **`status_approval`**: ENUM(`NONE`,`PENDING`,`APPROVED`,`REJECTED`) NOT NULL DEFAULT `NONE` — *disiapkan Phase 2*
    * **`role_approver`**: VARCHAR(50) NULL — *disiapkan Phase 2*
    * `created_by` / `updated_by`: UUID (FK → staff) — audit
    * `created_at` / `updated_at`: TIMESTAMP

* **Table Name**: `nursing_diagnosis_components` (komponen turunan — 1 diagnosis : N komponen)
* **Key Columns**:
    * `id`: UUID (PK)
    * `diagnosis_id`: UUID (FK → `nursing_diagnoses.id`) NOT NULL
    * `jenis_komponen`: ENUM(`PENYEBAB`,`TANDA_GEJALA`,`FAKTOR_RISIKO`,`KONDISI_KLINIS`) NOT NULL
    * `tingkat`: ENUM(`MAYOR`,`MINOR`) NULL — hanya untuk `TANDA_GEJALA`
    * `sifat`: ENUM(`SUBJEKTIF`,`OBJEKTIF`) NULL — hanya untuk `TANDA_GEJALA`
    * `deskripsi`: VARCHAR(255) NOT NULL
    * `urutan`: INT NULL — urutan tampil/laporan
    * `created_at` / `updated_at`: TIMESTAMP

> Catatan konsistensi (selaras A11): pakai **soft-delete** (`status=INACTIVE`), kolom `status_approval`/`role_approver` disiapkan sejak Phase 1 agar migrasi Phase 2 tanpa perubahan skema. Constraint: `CHECK` bahwa `tingkat`/`sifat` hanya terisi bila `jenis_komponen='TANDA_GEJALA'`; `FAKTOR_RISIKO` hanya untuk diagnosis `RISIKO`. Index disarankan: `UNIQUE(kode_sdki)`, `INDEX(kategori, subkategori)`, `INDEX(jenis_diagnosis, is_active)`, `INDEX(diagnosis_id, jenis_komponen)`.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/nursing-diagnoses` | List diagnosis (filter: `?kategori=`, `?jenis=`, `?status=active`, `?q=`) |
| GET | `/api/v1/nursing-diagnoses/{id}` | Detail diagnosis + seluruh komponen + mapping |
| POST | `/api/v1/nursing-diagnoses` | Create diagnosis (status diset sistem = `ACTIVE`) |
| PUT | `/api/v1/nursing-diagnoses/{id}` | Update atribut diagnosis |
| PATCH | `/api/v1/nursing-diagnoses/{id}/status` | Ubah status Active/Inactive (soft-delete) |
| GET | `/api/v1/nursing-diagnoses/{id}/components` | List komponen diagnosis |
| POST | `/api/v1/nursing-diagnoses/{id}/components` | Tambah komponen (penyebab/tanda-gejala/faktor risiko) |
| PUT | `/api/v1/nursing-diagnoses/{id}/components/{componentId}` | Update komponen |
| DELETE | `/api/v1/nursing-diagnoses/{id}/components/{componentId}` | Hapus komponen |
| POST | `/api/v1/nursing-diagnoses/import` | Import massal (CSV/XLSX) → laporan per baris |
| GET | `/api/v1/nursing-diagnoses/export` | Export daftar (CSV/XLSX) |
| PATCH | `/api/v1/nursing-diagnoses/{id}/approve` | *(Phase 2)* Approve diagnosis pending |
| PATCH | `/api/v1/nursing-diagnoses/{id}/reject` | *(Phase 2)* Reject + alasan |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Request Body (Payload CREATE/EDIT)

> Kolom "Deskripsi" = penjelasan makna field pada kamus data (bukan label layar).

**A. Diagnosis (induk)**

| Field | Deskripsi | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-----------|------|-------|----------|--------|---------|
| `kode_sdki` | Kode SDKI | string | Ya | unik, pola `D.####` | manual/import | BR-001 |
| `nama_diagnosis` | Nama Diagnosis | string | Ya | ≤150 char | manual | |
| `kategori` | Kategori | enum | Ya | daftar kategori SDKI | manual | Fisiologis/Psikologis/… |
| `subkategori` | Subkategori | enum | Ya | konsisten dgn kategori | manual | Respirasi/Sirkulasi/… |
| `jenis_diagnosis` | Jenis Diagnosis | enum | Ya | Aktual/Risiko/Promosi Kesehatan | manual | menentukan komponen wajib (BR-003/004) |
| `definisi` | Definisi | text | Ya | ≤1000 char | manual/SDKI | |
| `kondisi_klinis_terkait` | Kondisi Klinis Terkait | text | Tidak | ≤1000 char | manual | |
| `sdki_version` | Versi/Edisi SDKI | string | Tidak | ≤20 char | manual | konsistensi acuan |
| `terminology_code` | Kode ICNP/SNOMED | string | Tidak | +system+display bila diisi | manual | opsional (BR-006) |
| `terminology_system` | Terminology System URI | string(uri) | Auto/Bersyarat | URI valid | manual | mis. `http://snomed.info/sct` |

**B. Komponen (child — penyebab / tanda-gejala / faktor risiko / kondisi klinis)**

| Field | Deskripsi | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-----------|------|-------|----------|--------|---------|
| `jenis_komponen` | Jenis Komponen | enum | Ya | sesuai `jenis_diagnosis` | manual | BR-003/004 |
| `deskripsi` | Deskripsi Komponen | string | Ya | ≤255 char | manual | mis. "Dispnea", "Batuk tidak efektif" |
| `tingkat` | Tingkat (tanda-gejala) | enum | Bersyarat | wajib bila `TANDA_GEJALA` | manual | MAYOR/MINOR |
| `sifat` | Sifat (tanda-gejala) | enum | Bersyarat | wajib bila `TANDA_GEJALA` | manual | SUBJEKTIF/OBJEKTIF |
| `urutan` | Urutan | number | Tidak | ≥0 | manual | urutan laporan |

> **Status Behavior**: field `status` **tidak** diterima pada payload create (ditolak `422 ERR_STATUS_IMMUTABLE` bila dikirim). Sistem selalu men-set diagnosis baru = `ACTIVE` (Phase 1) atau `PENDING_APPROVAL` (Phase 2 bila approval aktif). Perubahan aktif/nonaktif hanya via endpoint `PATCH …/status`.

#### 8.3.2 Kontrak API — Endpoint List (Response & Query Params)

> Bukan spesifikasi tampilan. Berikut field yang dikembalikan `GET /api/v1/nursing-diagnoses` dan parameter query yang didukung server (sort/filter = kemampuan API, bukan komponen layar). Nilai dikembalikan mentah (tanpa pemformatan badge/warna).

**Field pada response list (per diagnosis):**

| Field Response | Sumber Data | Tipe Data | Catatan |
|----------------|-------------|-----------|---------|
| `id` | `nursing_diagnoses.id` | uuid | |
| `kode_sdki` | `kode_sdki` | string | |
| `nama_diagnosis` | `nama_diagnosis` | string | |
| `kategori` | `kategori` | enum | |
| `subkategori` | `subkategori` | string | |
| `jenis_diagnosis` | `jenis_diagnosis` | enum | AKTUAL/RISIKO/PROMOSI_KESEHATAN |
| `has_terminology` | derivasi `terminology_code IS NOT NULL` | boolean | indikator interoperabilitas |
| `component_count` | agregasi jumlah komponen | number | kelengkapan |
| `status` | `status` | enum | ACTIVE/INACTIVE/DRAFT/PENDING_APPROVAL |
| `updated_at` | audit | timestamp | |

**Parameter query yang didukung (kemampuan API):**

| Param | Contoh | Fungsi |
|-------|--------|--------|
| `q` | `?q=napas` | pencarian teks pada `kode_sdki`, `nama_diagnosis`, `definisi` |
| `kategori` | `?kategori=FISIOLOGIS` | filter per kategori |
| `subkategori` | `?subkategori=Respirasi` | filter per subkategori |
| `jenis` | `?jenis=RISIKO` | filter per jenis diagnosis |
| `status` | `?status=active` | filter status (default `ACTIVE` untuk konsumen) |
| `has_terminology` | `?has_terminology=false` | filter belum termapping (audit interoperabilitas) |
| `sort` / `order` | `?sort=kode_sdki&order=asc` | pengurutan (whitelist: `kode_sdki`,`nama_diagnosis`,`updated_at`) |
| `page` / `per_page` | `?page=1&per_page=50` | paginasi |

* **Business Rules**:
    * **BR-001**: `kode_sdki` unik & wajib, mengikuti pola `D.####`; sistem menolak duplikat (`409`). `nama_diagnosis` juga dicek untuk peringatan duplikasi.
    * **BR-002**: Diagnosis yang **sudah dipakai pada asuhan pasien** tidak boleh di-hard-delete; hanya `INACTIVE` (soft-delete) — jaga integritas RME.
    * **BR-003**: Diagnosis `AKTUAL` wajib punya **≥1 tanda-gejala MAYOR**; boleh punya penyebab & tanda-gejala minor.
    * **BR-004**: Diagnosis `RISIKO` wajib punya **≥1 faktor risiko** dan **tidak** memakai tanda-gejala mayor/minor (belum ada respons aktual).
    * **BR-005**: `subkategori` harus konsisten dengan `kategori` (validasi mapping kategori→subkategori sesuai SDKI).
    * **BR-006**: Mapping terminologi (ICNP/SNOMED) opsional; bila `terminology_code` diisi → `terminology_system` & `terminology_display` wajib.
    * **BR-007**: Komponen `tingkat`/`sifat` hanya berlaku untuk `jenis_komponen='TANDA_GEJALA'`; wajib kosong untuk komponen lain.
    * **BR-008**: Hanya role berwenang (RBAC A53) yang dapat CRUD master.
    * **BR-009**: Setiap create/update/perubahan status dicatat audit (user, timestamp, aksi).
    * **BR-010**: Status default entri baru = `ACTIVE` (Phase 1); field status tidak diterima pada payload create.
    * **BR-011** *(Phase 2)*: Saat approval aktif, penambahan/perubahan diagnosis → `status_approval=PENDING`; hanya `role_approver` (Komite Keperawatan) yang boleh approve/reject.

## 9. Workflow / BPMN Interpretation

[ASUMSI] Tidak ada BPMN khusus modul master ini; alur diturunkan dari pola master data klinis (A11 Diagnosa medis) dan proses asuhan keperawatan hilir.

**Alur inti — Tambah Diagnosa Perawat (To-Be):**
1. Admin membuka menu → aksi **Tambah**.
2. Isi data induk: kode SDKI, nama, kategori, subkategori, jenis diagnosis, definisi.
3. Tambah **komponen** sesuai jenis: `AKTUAL` → penyebab + tanda-gejala mayor/minor; `RISIKO` → faktor risiko; `PROMOSI_KESEHATAN` → penyebab/kesediaan meningkatkan.
4. (Opsional) mapping terminologi ICNP/SNOMED.
5. **Simpan** → server validasi: field wajib, pola kode, duplikat (`kode_sdki`/`nama`), konsistensi kategori-subkategori, syarat komponen minimum per jenis (BR-003/004).
    * *Gateway — duplikat?* **Ya** → `409`, blok simpan. **Tidak** → lanjut.
    * *Gateway — syarat komponen terpenuhi?* **Tidak** → `422`. **Ya** → lanjut.
    * *Gateway — approval aktif? (Phase 2)* **Ya** → status `PENDING_APPROVAL`, kirim ke Komite Keperawatan. **Tidak** → status `ACTIVE`.
6. Event: **Diagnosis tersimpan** → tersedia sebagai referensi di modul asuhan keperawatan.

**Alur — Ubah/Nonaktifkan Diagnosis:**
1. Cari diagnosis → ambil detail → **Ubah** atau **ubah status** (via `PATCH …/status`).
2. *Gateway — dipakai asuhan pasien?* **Ya** → hanya boleh nonaktif + perubahan atribut non-kunci. **Tidak** → boleh ubah penuh.
3. Simpan → audit log.

---

## Asumsi
* [ASUMSI] Modul tidak punya BPMN sendiri; alur As-Is/To-Be diturunkan dari pola A11 (Diagnosa medis) sebagai master klinis sejenis.
* [ASUMSI] Katalog mengacu **SDKI (PPNI)**; struktur kategori/subkategori & tanda-gejala mayor/minor mengikuti konvensi SDKI.
* [ASUMSI] Interoperabilitas via ICNP/SNOMED bersifat **opsional** — RS Tipe C&D dapat mengadopsi bertahap; kolom disiapkan tapi tidak wajib di Phase 1.
* [ASUMSI] Relasi ke SLKI (luaran) & SIKI (intervensi) belum masuk MVP; disiapkan sebagai Phase 2/modul terpisah.
* [ASUMSI] Soft-delete (nonaktif) dipakai, bukan hard-delete, demi integritas histori asuhan & RME.
* [ASUMSI] Kolom `status_approval`/`role_approver` disiapkan Phase 1 agar Phase 2 (approval Komite Keperawatan) tanpa perubahan skema.

## Pertanyaan Terbuka
* Edisi/versi SDKI yang dipakai sebagai acuan awal (SDKI Edisi 1 cetakan berapa)? Apakah perlu menyimpan revisi antar-edisi?
* Apakah interoperabilitas diagnosis keperawatan (ICNP/SNOMED) diwajibkan untuk SATUSEHAT/RME, atau opsional?
* Apakah relasi diagnosis → SLKI → SIKI (template asuhan) masuk lingkup berikutnya, dan di modul mana master SLKI/SIKI dikelola?
* Mode import massal: *all-or-nothing* atau *partial commit*?
* Siapa role approver Phase 2 (Komite Keperawatan / Bidang Keperawatan) dan berapa tingkat approval?
* Apakah diperlukan atribut tambahan (mis. NANDA-I sebagai referensi silang) selain SDKI?
* Apakah `PROMOSI_KESEHATAN` memakai komponen "kesediaan meningkatkan…" sebagai tanda-gejala atau kategori komponen tersendiri?
