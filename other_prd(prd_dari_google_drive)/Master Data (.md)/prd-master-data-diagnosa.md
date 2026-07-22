# PRD — Master Data Diagnosa (A11)

> **Kode Fitur:** A11 · **Cluster:** Control Panel · **Modul:** Master Data / Integrasi SATUSEHAT BPJS V1 V2 · **Menu:** Diagnosa
> SIMRS RS Tipe C & D · Persona: System Analyst senior SIMRS

> **Legend Phase** (tanda pada dokumen sumber):
> — (tanpa tanda) = **Phase 1** · **[**]** = **Phase 2** · **[***]** = **Phase 3** · **[****]** = **Phase 4**.
> Setiap item bertanda dikerjakan pada fase berikutnya sesuai legend di atas. Integrasi **BPJS** = Phase 3; integrasi **Satu Sehat** = Phase 4.

---

## 1. Metadata Dokumen

* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer, Tamtech International.
* **Related Documents**:
    * Design Figma (Master Data Diagnosa)
    * SATUSEHAT — FHIR Condition Resource (Indonesia Health Services / IHS)
    * BPJS VClaim / INA-CBG (referensi kode diagnosa & klaim)
    * PRD Master Data - Instalasi; PRD Master Data Tindakan (A10/A13); PRD Asesmen & Rekam Medis (EMR)
    * Referensi: ICD-10 WHO (https://icd.who.int/browse10); ICD-10 Indonesian Modification (Pusdatin Kemenkes)
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 11 Juni 2026 | 1.0 - Draft | Draft awal Master Data Diagnosa |
| 23 Juni 2026 | 1.1 | Penambahan Phase 4 pada Scope Definition (~Rizky) |
| 2 Juli 2026 | 2.0 | Restrukturisasi sesuai template PRD (§1–§9); form input diselaraskan penuh dengan Data Requirement dokumen sumber (docx); penandaan fase [**]/[***]/[****] |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  **Master Data Diagnosa (A11)** adalah modul pengelolaan kamus kode **ICD-10** (International Classification of Diseases – 10th Revision) yang menjadi **sumber kebenaran tunggal (single source of truth)** untuk pengkodean diagnosa medis di seluruh SIMRS. Modul ini mencakup kode **ICD-10 Original (WHO)** sekaligus kode **ICD-IM (Indonesian Modification)** hasil adaptasi Kementerian Kesehatan, dengan **flagging Tipe Kode** eksplisit untuk membedakan keduanya.

  Master data ini menjadi fondasi referensi bagi modul **Asesmen** (Diagnosa Kerja/Akhir), **Rekam Medis** (Diagnosa Utama/Sekunder/Komorbiditas/Komplikasi), **integrasi BPJS** (klaim & validasi INA-CBG), **integrasi Satu Sehat** (sinkronisasi data kesehatan nasional), dan **Casemix**. Kode diagnosa cukup dikelola di satu tempat; modul lain menautkan `id_diagnosa` tanpa menduplikasi data.

  Struktur kode bersifat **hierarkis** (Chapter → Block → Category → Sub-Category) agar pelaporan agregat tetap akurat. Modul dirancang untuk RS **Tipe C & D** — mendukung impor massal kamus (~14.000+ kode) dan pencarian cepat saat dipakai di asesmen.

  Konsentrasi detail:
    * **Flagging Tipe Kode (WHO Original / ICD-IM)** wajib pada setiap kode untuk mencegah kekeliruan klaim BPJS & pelaporan Kemenkes.
    * **Hierarki parent-child** harus konsisten agar pelaporan agregat akurat.
    * **Status nonaktif** = gold standard: kode nonaktif tidak muncul di pencarian asesmen baru, namun **tetap terlihat** pada rekam medis historis.
    * **Batasan klinis** (mis. O00–O99 hanya perempuan, P00–P96 hanya neonatus) didukung untuk validasi di asesmen.
    * Pada **Phase 3+**, kode BPJS **[***]** dan Satu Sehat **[****]** diambil otomatis dari endpoint layanan (ter-fill otomatis).

* **Business Process (As-Is vs To-Be)**:

    * **As-Is** (Kondisi Saat Ini):
        * Kode ICD-10 dikelola di buku fisik, file Excel, atau PDF terpisah oleh tim koder.
        * Tidak ada pembedaan jelas antara kode **WHO Original** dan **ICD-IM** → sering tertukar.
        * Klaim BPJS sering tertolak karena kode tidak sesuai versi terkini atau tidak diakui BPJS.
        * Diagnosa di rekam medis sering ditulis bebas (free text) tanpa kode standar → menyulitkan analitik & pelaporan.
        * Pembaruan kamus (versi WHO baru, regulasi BPJS baru) tidak konsisten diadopsi antar unit.

    * **To-Be** (Kondisi Yang Diharapkan):
        * Kamus diagnosa dikelola terpusat sebagai single source of truth dengan kode ter-flag jelas (WHO / ICD-IM).
        * Modul Asesmen, Rekam Medis, dan Casemix cukup menautkan ke `id_diagnosa` tanpa menduplikasi data.
        * Pengkodean konsisten antar dokter, koder, dan modul; klaim BPJS & pelaporan Satu Sehat berjalan lancar.
        * Perubahan status kode (aktif/nonaktif) atau revisi versi langsung berdampak pada modul terkait secara real-time.

## 3. Goals & Metrics

### Goals
1. Menyediakan kamus kode diagnosa yang akurat, terpusat, dan menjadi **sumber kebenaran tunggal**.
2. Memastikan setiap kode terflag jelas sebagai **WHO Original** atau **ICD-IM**.
3. Memfasilitasi integrasi otomatis dengan BPJS **[***]**, Satu Sehat **[****]**, dan Casemix INA-CBG.
4. Meminimalkan kesalahan kode pada klaim BPJS dan pelaporan kesehatan nasional.
5. Mendukung kebutuhan klinis, administratif, dan billing dengan satu kamus referensi konsisten.

### Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan kamus | Terisi minimal **14.000** kode ICD-10 standar WHO + kode adaptasi ICD-IM yang berlaku. |
| 2 | Keunikan kode | **0 duplikasi** kode dalam satu kombinasi Tipe Kode + Versi. |
| 3 | Akurasi flag | **100%** kode memiliki flag Tipe Kode (WHO/ICD-IM) yang tervalidasi. |
| 4 | Waktu pencarian | **< 2 detik** untuk hasil pencarian by kode atau deskripsi. |
| 5 | Konsistensi integrasi | **0 mismatch** antara kode Master Data Diagnosa dengan kode yang diterima BPJS/Satu Sehat. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD + Flagging) | Fase Lanjutan |
|-------------|-------------------------------|---------------|
| Pendaftaran Kode Diagnosa | Input kode baru: Kode ICD, Deskripsi, Chapter, Tipe Kode (WHO/ICD-IM), Versi | — |
| Pengelolaan Kode Diagnosa | Ubah data, lihat detail, aktivasi/nonaktivasi | — |
| Flagging Tipe Kode | Membedakan ICD-10 Original (WHO) & ICD-IM | — |
| Status Aktif/Nonaktif | Memengaruhi kemunculan kode pada pencarian asesmen baru | — |
| Pencarian & Filter | Cari/filter/daftar by kode, deskripsi, chapter, tipe kode | — |
| Penyediaan `id_diagnosa` | Sumber tautan bagi modul Asesmen & Rekam Medis | — |
| Impor Data Diagnosa | — | **Phase 2** — impor massal (CSV/XLSX) |
| Hierarki Diagnosa (Parent-Child) **[**]** | — | **Phase 2** — Chapter → Block → Category → Sub-Category, tree view |
| Riwayat Aktivitas (Audit Log) | — | **Phase 2** — traceability create/ubah/aktivasi |
| Integrasi & validasi **BPJS** **[***]** | — | **Phase 3** — auto-fill & validasi kode BPJS (INA-CBG) |
| Integrasi **Satu Sehat** **[****]** | — | **Phase 4** — auto-fill & sinkronisasi kode Satu Sehat (FHIR Condition) |

**Out of Scope**:

| No | Scope |
|----|-------|
| 1 | Pengkodean tindakan medis (ICD-9-CM / ICD-10-PCS) — dikelola Master Data Tindakan/Procedure (A10/A13). |
| 2 | Perhitungan tarif dan grouping casemix INA-CBG. |
| 3 | Submit klaim BPJS, pelaporan SISRUTE, dan pelaporan kementerian. |
| 4 | Input/penulisan diagnosa pasien pada rekam medis (di modul Asesmen/RM). |
| 5 | Pengelolaan kamus istilah medis (SNOMED CT, LOINC) — dikelola modul lain. |

> **Catatan Phasing:** Phase 1 fokus CRUD kamus + flagging tanpa integrasi eksternal. Skema data sudah menyediakan kolom `bpjs_code` **[***]** & `satusehat_code` **[****]** dan `parent_id` **[**]** sejak Phase 1 agar fase lanjutan tidak memerlukan perubahan skema (lihat §8.1).

## 5. Related Features

| No | Module | Feature | Deskripsi Relasi |
|----|--------|---------|------------------|
| 1 | Pelayanan / Asesmen | Asesmen Awal, Asesmen Medis, Asesmen Keperawatan, Diagnosa Kerja, Diagnosa Akhir | Konsumen kamus (pencarian & pilih kode aktif via `id_diagnosa`). |
| 2 | Rekam Medis (EMR) | Resume Medis, Diagnosa Utama/Sekunder, Komorbiditas, Komplikasi | Konsumen; tampilkan kode historis walau nonaktif. |
| 3 | Casemix | INA-CBG Grouping, Mapping Diagnosa–Tarif | Konsumen kode ICD-IM untuk grouping. |

**Fitur se-cluster Control Panel terkait pola:** [A10] Tindakan (BPJS V2), [A13] Procedure (kembar A11), [A12] Diagnosa Perawat, [A28] Clinical Pathway, [A32] Wilayah (pola impor massal & integrasi terminologi).

## 6. Business Process & User Stories

### 6.1 State Machine — Status Kode Diagnosa

| Status | Deskripsi | Efek pada Modul Konsumen | Transisi (Phase 1) | Transisi (Fase Lanjutan) |
|--------|-----------|--------------------------|--------------------|--------------------------|
| **Aktif** | Kode berlaku & dapat dipilih | Muncul di pencarian asesmen baru; ditarik via `id_diagnosa` | Create → Aktif (default); Aktif → Nonaktif (toggle) | Reaktivasi memicu validasi BPJS **[***]** & Satu Sehat **[****]** |
| **Nonaktif** | Kode usang/tidak berlaku | **Tidak** muncul di pencarian asesmen baru; **tetap tampil** di RM historis (tidak dihapus) | Nonaktif → Aktif (reaktivasi) | idem + warning bila kode tak lagi diakui BPJS/Satu Sehat |

> Kode diagnosa tidak memiliki stok; kolom "Efek Stok" pada template diadaptasi menjadi **Efek pada Modul Konsumen**. Kode **tidak** di-hard-delete bila sudah dipakai transaksi (soft delete via status). Menonaktifkan parent yang masih memiliki child aktif ditolak (lihat BR & Validasi).

### 6.2 User Stories Utama

Prioritas: **P0** Critical/MVP · **P1** Must Have · **P2** Should Have · **P3** Low · **P4** Enhancement.

* **US-001** — Sebagai **Admin Master Data**, saya ingin melihat Dashboard Data Diagnosa, agar kamus kode ICD-10 terpantau & mudah dicari.
* **US-002** — Sebagai **Admin/Koder**, saya ingin menambah kode diagnosa baru beserta Tipe Kode (WHO/ICD-IM), agar kamus terpusat & tidak salah konteks klaim.
* **US-003** — Sebagai **Admin/Koder**, saya ingin mengubah detail diagnosa saat ada revisi WHO/Kemenkes, agar kamus tetap up-to-date.
* **US-004** — Sebagai **Admin/Koder**, saya ingin mengaktifkan/menonaktifkan kode sesuai berlakunya, tanpa menghilangkannya dari rekam medis lama.
* **US-005** — Sebagai **Admin/Koder/Dokter**, saya ingin melihat detail kode untuk memahami konteks & batasan klinisnya.
* **US-006** — Sebagai **Admin/Koder**, saya ingin mencari/memfilter diagnosa by kode, deskripsi, chapter, tipe kode, atau status.
* **US-007** — Sebagai **Admin/Koder**, saya ingin setiap kode terflag jelas sebagai WHO/ICD-IM agar tidak tertukar saat klaim/pelaporan.
* **US-008** *(Phase 2)* — Sebagai **Admin/Koder**, saya ingin mengimpor ribuan kode sekaligus dari file, agar tidak input manual satu per satu.
* **US-009** *(Phase 2)* — Sebagai **Admin**, saya ingin melihat riwayat perubahan kode diagnosa, agar setiap perubahan auditable.
* **US-010** *(Phase 2, [**])* — Sebagai **Admin/Koder**, saya ingin mengelola hierarki parent-child kode, agar pelaporan agregat per chapter akurat.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Dashboard — Master Data Diagnosa**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat Dashboard Data Diagnosa, agar kamus kode ICD-10 terpantau & mudah dicari.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Menu Master Data → Diagnosa menampilkan halaman Dashboard dengan tabel kolom: Kode ICD, Deskripsi, Chapter, Tipe Kode (badge), Versi, Jenis Kelamin, Status. *(Kolom **BPJS Compatible [***]** = Phase 3; **Satu Sehat Compatible [****]** = Phase 4.)*
    * **AC 2**: Semua kolom dapat diklik untuk sorting; default urut **Kode ICD Ascending (A-Z)**, dapat diubah Asc/Desc.
    * **AC 3**: Pencarian by Kode ICD, Deskripsi (EN/ID), Chapter berfungsi.
    * **AC 4**: Pagination 10/20/50/100 data per halaman.
    * **AC 5**: Tiap baris memiliki tombol **Detail**; tombol **Lihat Hierarki [**]** = Phase 2. Tombol **+** untuk Tambah Data Baru tersedia.

---

**Fitur: Tambah Data Diagnosa**
* **User Story**: Sebagai Admin/Koder, saya ingin menambahkan kode diagnosa baru, agar tercatat di sistem & dapat dipakai modul lain.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **+** membuka overlay "Tambah Diagnosa" (tooltip **+** = "Tambah Diagnosa").
    * **AC 2**: Form terdiri dari 3 section — **Identitas Diagnosa**, **Klasifikasi Klinis**, **Status** (spesifikasi field di §8.3.1).
    * **AC 3**: Data tersimpan; **kode unik per Tipe Kode + Versi** tervalidasi; field wajib tidak boleh kosong; flag Tipe Kode terisi.
    * **AC 4**: Status di-set **AKTIF** oleh sistem saat create.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message |
  |-------|------------|-------|---------------|
  | Kode ICD | Text | Required, regex `^[A-Z][0-9]{2}(\.[0-9]{1,3})?$` | "Format kode tidak valid. Gunakan format: huruf besar + 2 digit, opsional titik dan 1-3 digit (mis. A09 atau A09.0)" |
  | Kode ICD | Text | Unik per Tipe Kode + Versi | "Kode ICD '{kode}' sudah terdaftar pada versi {versi} dengan Tipe Kode {tipe}. Pilih kode lain atau ubah Tipe Kode/Versi." |
  | Tipe Kode | Radio | Required | "Tipe Kode (WHO Original / ICD-IM) wajib diisi untuk mencegah kekeliruan saat klaim BPJS dan pelaporan." |
  | Usia Min / Usia Max | Number | Usia Min ≤ Usia Max | "Usia Minimum tidak boleh lebih besar dari Usia Maksimum." |
  | Kode Induk **[**]** | Dropdown | Bukan self/siklus | "Kode Induk tidak boleh menunjuk ke kode itu sendiri atau membentuk siklus hierarki." |
  | Kode Induk **[**]** | Dropdown | Konsistensi tipe | "Tidak dapat menambahkan kode WHO Original sebagai turunan dari kode ICD-IM. Hierarki kode WHO harus murni WHO." |

---

**Fitur: Ubah Data Diagnosa**
* **User Story**: Sebagai Admin/Koder, saya ingin mengubah detail diagnosa saat ada revisi WHO/Kemenkes atau perbaikan deskripsi, agar kamus tetap up-to-date.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **Detail** (atau klik kolom Kode ICD) membuka overlay "Detail Diagnosa"; menampilkan seluruh field seperti form Tambah.
    * **AC 2**: Field yang dapat diubah: Deskripsi (EN), Deskripsi (ID), Chapter/Block/Category, Tipe Kode, Versi ICD, Kategori Penyakit, Severity, Jenis Kelamin, Usia Min/Max, Catatan Klinis.
    * **AC 3**: **Kode ICD tidak dapat diubah** setelah tersimpan (immutable) — jika salah, nonaktifkan & buat baru.
    * **AC 4**: Perubahan tersimpan & tercatat waktunya pada riwayat aktivitas *(Riwayat Aktivitas penuh = Phase 2)*.

---

**Fitur: Kelola Status Aktif/Nonaktif**
* **User Story**: Sebagai Admin/Koder, saya ingin mengaktifkan/menonaktifkan kode diagnosa sesuai berlakunya kode di RS.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Status dapat diubah Aktif/Nonaktif via switch (di Dashboard/Detail).
    * **AC 2**: Kode nonaktif **tidak dapat dipilih** di asesmen baru; **tetap visible** di RM historis.
    * **AC 3**: **Tidak boleh menonaktifkan** kode yang merupakan parent dari kode aktif lainnya.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Kondisi | Message |
  |---------|---------|
  | Nonaktivasi kode yang jadi parent kode aktif | "Kode ini merupakan induk dari {n} kode aktif. Nonaktifkan/pindahkan kode anak terlebih dahulu sebelum menonaktifkan kode ini." → Lanjut/Kembali |
  | Nonaktivasi kode masih dipakai asesmen aktif | "Kode ini masih dipakai pada {n} asesmen/rekam medis aktif. Menonaktifkan kode hanya akan mencegah pemakaian baru; data lama tetap utuh." → Lanjut/Kembali |

---

**Fitur: Lihat Detail Diagnosa**
* **User Story**: Sebagai Admin/Koder/Dokter, saya ingin melihat detail kode diagnosa untuk memahami konteks & batasan klinisnya.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Menampilkan seluruh atribut: Kode, Deskripsi, Chapter, Block, Tipe Kode, Versi, batasan klinis, kode integrasi *(kode BPJS [***] & Satu Sehat [****] tampil pada fase masing-masing)*.
    * **AC 2**: Detail tampil lengkap & akurat sesuai data tersimpan.

---

**Fitur: Filter & Pencarian**
* **User Story**: Sebagai Admin/Koder, saya ingin mencari diagnosa by kode, deskripsi, chapter, tipe kode, atau status.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Filter: Status (Aktif/Nonaktif/Semua), Tipe Kode (WHO/ICD-IM/Semua), Chapter, Kategori Penyakit.
    * **AC 2**: Search by Kode / Deskripsi (EN+ID). Hasil tampil sesuai kata kunci & filter (dapat dikombinasikan).

---

**Fitur: Flagging Tipe Kode WHO/ICD-IM**
* **User Story**: Sebagai Admin/Koder, saya ingin setiap kode terflag jelas sebagai WHO Original atau ICD-IM, agar tidak tertukar saat klaim/pelaporan.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Field Tipe Kode wajib diisi saat tambah/ubah data (WHO Original / ICD-IM).
    * **AC 2**: Ditampilkan sebagai badge berwarna: **Biru → WHO Original**, **Hijau → ICD-IM** (konsisten di tabel, detail, & seluruh modul).
    * **AC 3**: Sistem mencegah duplikasi kode dalam kombinasi Tipe Kode + Versi yang sama.
    * **AC 4**: Di modul Asesmen, koder dapat memfilter hanya WHO atau hanya ICD-IM sesuai konteks (BPJS / non-BPJS).

---

**Fitur: Impor Data Diagnosa**
* **User Story**: Sebagai Admin/Koder, saya ingin menginput kamus diagnosa secara kolektif (inisialisasi sistem / update versi WHO).
* **Prioritas**: P2
* **Fase**: **Phase 2**
* **Acceptance Criteria**:
    * **AC 1**: Upload file data diagnosa (.csv/.xlsx).
    * **AC 2**: Sistem memvalidasi tiap baris: format kode, keunikan, kelengkapan field wajib, flag Tipe Kode.
    * **AC 3**: Sistem menampilkan ringkasan: data berhasil masuk vs gagal beserta alasan; baris gagal tidak membatalkan baris valid.

---

**Fitur: Riwayat Aktivitas (Audit Log)**
* **User Story**: Sebagai Admin, saya ingin mengetahui kapan kode dibuat/diubah/dinonaktifkan/diaktifkan, oleh siapa, dan data apa yang berubah.
* **Prioritas**: P4
* **Fase**: **Phase 2**
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyimpan history: tanggal & waktu (dd/mm/yyyy 00:00), User ID/Nama, aktivitas (Dibuat/Diubah/Aktivasi/Nonaktivasi), dan data yang diubah (Field: nilai lama → nilai baru).
    * **AC 2**: Contoh: "Diubah oleh 222/Joko pada 12/09/2026 09:01 — Deskripsi (ID): Diare akut → Diare karena rotavirus".

---

**Fitur: Hierarki Diagnosa (Parent-Child) [**]**
* **User Story**: Sebagai Admin/Koder, saya ingin melihat & mengelola struktur hierarki kode (Chapter → Block → Category → Sub-Category), agar pelaporan agregat akurat.
* **Prioritas**: P2
* **Fase**: **Phase 2**
* **Acceptance Criteria**:
    * **AC 1**: Tampilan tree view pada tombol "Lihat Hierarki".
    * **AC 2**: Setiap kode memiliki **Kode Induk (Parent)** opsional.
    * **AC 3**: Validasi: tidak boleh **circular reference**; Tipe Kode anak konsisten dengan parent (WHO → WHO; ICD-IM boleh punya parent WHO).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `diagnoses`
* **Key Columns**:
    * `id`: UUID (Primary Key) — dipakai sebagai `id_diagnosa` oleh modul lain
    * `icd_code`: Varchar(10) — **immutable** setelah create
    * `description_en`: Varchar(500) — Deskripsi (English), wajib
    * `description_id`: Varchar(500) (nullable) — Deskripsi (Indonesia)
    * `code_type`: Enum(`WHO_ORIGINAL`, `ICD_IM`) — Tipe Kode, wajib
    * `icd_version`: Varchar — mis. `ICD-10 (2022)`, wajib
    * `chapter_id`: UUID (FK → `icd_chapters.id`) — wajib
    * `block_id`: UUID (FK → `icd_blocks.id`, nullable)
    * `category`: Varchar(200) (nullable)
    * `parent_id`: UUID (FK → `diagnoses.id`, nullable) — **[**] Phase 2** (self-reference hierarki)
    * `disease_categories`: JSONB/array (nullable) — Kategori Penyakit (multiple)
    * `severity`: Enum(`RINGAN`, `SEDANG`, `BERAT`, `TIDAK_SPESIFIK`, nullable)
    * `gender`: Enum(`SEMUA`, `LAKI_LAKI`, `PEREMPUAN`) default `SEMUA`
    * `age_min`: Smallint default `0` (0–150)
    * `age_max`: Smallint default `150` (0–150)
    * `clinical_notes`: Text (nullable, max 1000)
    * `bpjs_code`: Varchar (nullable) — **[***] Phase 3**
    * `satusehat_code`: Varchar (nullable) — **[****] Phase 4**
    * `is_active`: Boolean (default `true`)
    * `created_by`, `updated_by`: UUID (FK → `users.id`)
    * `created_at`, `updated_at`: Timestamp
    * `deleted_at`: Timestamp (nullable, soft delete)
* **Constraints**:
    * `UNIQUE(icd_code, code_type, icd_version) WHERE deleted_at IS NULL` — keunikan kode per kombinasi (BR-002).
    * `CHECK(age_min <= age_max)`.
    * FK `parent_id` menunjuk baris aktif; cegah circular reference di service layer (**[**] Phase 2**).
* **Tabel pendukung**: `icd_chapters`, `icd_blocks` (`chapter_id`, filter cascading); `diagnosis_activity_logs` (`diagnosis_id`, `action`, `changed_by`, `changed_at`, `field`, `old_value`, `new_value`) — **[**] Phase 2**.

> **Phase-ready:** kolom `parent_id` **[**]**, `bpjs_code` **[***]**, `satusehat_code` **[****]** disiapkan sejak Phase 1 (nullable) agar fase lanjutan tanpa migrasi skema.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/diagnoses` | List (filter: `code_type`, `chapter_id`, `status`, `disease_category`, `search`, `sort`, `page`, `per_page`) |
| POST | `/api/v1/diagnoses` | Create kode baru (status = AKTIF) |
| GET | `/api/v1/diagnoses/{id}` | Detail kode + atribut klinis |
| PUT | `/api/v1/diagnoses/{id}` | Update (kecuali `icd_code` immutable) |
| PATCH | `/api/v1/diagnoses/{id}/status` | Toggle Aktif/Nonaktif (validasi parent/terpakai) |
| GET | `/api/v1/icd-chapters` · `/api/v1/icd-blocks?chapter_id={id}` | Lookup Chapter/Block (cascading) |
| GET | `/api/v1/diagnoses/{id}/history` | **[**] Phase 2** — Riwayat aktivitas |
| POST | `/api/v1/diagnoses/import` | **[**] Phase 2** — Impor massal (validasi per baris + ringkasan) |
| GET | `/api/v1/diagnoses/{id}/hierarchy` | **[**] Phase 2** — Tree view parent-child |
| GET | `/api/v1/diagnoses/{id}/validate-bpjs` | **[***] Phase 3** — Validasi/auto-fill kode BPJS |
| GET | `/api/v1/diagnoses/{id}/validate-satusehat` | **[****] Phase 4** — Validasi/auto-fill kode Satu Sehat |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT) — *(docx: Data Requirement B.1, B.2, D)*

**Section 1 — Identitas Diagnosa**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| icd_code | Kode ICD | Text Input | Ya | Min 3 (mis. A09), Max 10 (mis. A09.0.1); regex `^[A-Z][0-9]{2}(\.[0-9]{1,3})?$`; unik per Tipe Kode + Versi; **immutable** setelah simpan | Input manual | BR-002. Tidak dapat diubah setelah tersimpan |
| description_en | Deskripsi (English) | Text Input | Ya | Min 3, Max 500 | Input manual | |
| description_id | Deskripsi (Indonesia) | Text Input | Tidak | Min 3, Max 500 | Input manual | Default tampilan dashboard |
| code_type | Tipe Kode | Radio Button | Ya | `WHO Original` / `ICD-IM`; default **WHO Original** | Input manual | BR-001, field kritikal (badge Biru/Hijau) |
| icd_version | Versi ICD | Single Dropdown | Ya | `ICD-10 (2010)` / `(2016)` / `(2019)` / `(2022)`; default versi terbaru | Enum | BR-009 |
| chapter | Chapter | Single Dropdown | Ya | Dari Master Data Chapter ICD-10 | Lookup | Contoh: I (A00-B99) Certain infectious and parasitic diseases |
| block | Block | Single Dropdown | Tidak | Dari Master Data Block ICD-10 (filter by Chapter) | Lookup | Contoh: A00-A09 Intestinal infectious diseases |
| category | Category | Text Input | Tidak | Max 200 | Input manual | Contoh: A09 Diarrhoea and gastroenteritis... |
| parent_id | Kode Induk (Parent) **[**]** | Single Dropdown (searchable) | Tidak | Self-reference (status aktif); tidak boleh circular reference; Tipe Kode child ≠ WHO jika parent ICD-IM | Lookup Master Diagnosa | **Phase 2** |

**Section 2 — Klasifikasi Klinis**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| disease_categories | Kategori Penyakit | Multiple Dropdown | Tidak | Penyakit Menular / Tidak Menular / Cedera & Keracunan / Kehamilan & Persalinan / Perinatal & Neonatal / Faktor Mempengaruhi Status Kesehatan / Diagnosa Non Spesialistik BPJS / Lain-lain | Enum | |
| severity | Severity | Single Dropdown | Tidak | Ringan / Sedang / Berat / Tidak Spesifik | Enum | |
| gender | Jenis Kelamin | Single Dropdown | Tidak | Semua / Laki-laki / Perempuan; default **Semua** | Enum | Mis. O00-O99 → Perempuan, N40-N51 → Laki-laki |
| age_min | Usia Min (Tahun) | Numerik Input | Tidak | Min 0, Max 150, default 0; Usia Min ≤ Usia Max | Input manual | BR-005 |
| age_max | Usia Max (Tahun) | Numerik Input | Tidak | Min 0, Max 150, default 150 | Input manual | Mis. P00-P96 (Perinatal) usia max ~0 (< 28 hari) |
| clinical_notes | Catatan Klinis | Textarea | Tidak | Max 1000 | Input manual | Kriteria diagnosis, exclude/include note WHO |

**Section 3 — Status**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| is_active | Status Aktif/Nonaktif | Switch | Ya | Aktif / Nonaktif | Default **Aktif** (sistem) | Tidak boleh nonaktif jika kode adalah parent dari kode aktif lain. Pengelolaan via toggle Dashboard/Detail (BR-003) |

> **Catatan status behavior**: status default **AKTIF** saat create; pengelolaan Aktif/Nonaktif utamanya via toggle di Dashboard/Detail. Kode ICD immutable — koreksi dilakukan dengan menonaktifkan & membuat kode baru.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (Dashboard / List View) — *(docx: Data Requirement A)*

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kode ICD | `diagnoses.icd_code` | Text (mono) | Sort default A-Z; Search | Unik per Tipe Kode + Versi |
| Deskripsi | `diagnoses.description_id` (default ID) | Text | Search (EN/ID) | |
| Chapter | `diagnoses.chapter` | Text | Filter; Search | |
| Tipe Kode | `diagnoses.code_type` | Badge (Biru=WHO / Hijau=ICD-IM) | Filter | BR-001 |
| Versi | `diagnoses.icd_version` | Text | Filter | |
| Jenis Kelamin | `diagnoses.gender` | Text/badge | Filter | |
| Status | `diagnoses.is_active` | Badge (Aktif/Nonaktif) | Filter | Nonaktif tersamar (BR-003) |
| BPJS Compatible **[***]** | `diagnoses.bpjs_code` (terisi/tidak) | Badge ✓ / – | Filter | **Phase 3** |
| Satu Sehat Compatible **[****]** | `diagnoses.satusehat_code` (terisi/tidak) | Badge ✓ / – | Filter | **Phase 4** |
| Aksi | – | Button group | – | [Detail] · [Lihat Hierarki **[**]** = Phase 2] · [+ Tambah] |

> Pagination 10/20/50/100 per halaman. Semua kolom dapat diklik untuk sorting (Asc/Desc).

#### 8.3.3 Business Rules

* **BR-001** — Field **Tipe Kode (WHO/ICD-IM)** wajib pada setiap kode; kode tanpa Tipe Kode tidak boleh tersimpan.
* **BR-002** — Kode **unik** dalam kombinasi **Kode ICD + Tipe Kode + Versi**; duplikasi ditolak.
* **BR-003** — **Status nonaktif** = gold standard: kode nonaktif tidak muncul di pencarian asesmen baru namun **tetap tampil** di RM historis; tidak di-hard-delete bila sudah dipakai transaksi.
* **BR-004** — **Kode ICD immutable** setelah tersimpan; koreksi via nonaktifkan + buat baru.
* **BR-005** — **Batasan klinis** (gender/usia) disimpan sebagai atribut kode; enforcement dieksekusi di modul Asesmen.
* **BR-006** — **Tidak boleh menonaktifkan** kode yang menjadi parent kode aktif lainnya, atau memberi konfirmasi bila masih dipakai asesmen aktif.
* **BR-007** *([**] Phase 2)* — **Hierarki parent-child** konsisten: tidak boleh circular reference; Tipe Kode anak konsisten dengan parent (WHO → WHO; ICD-IM boleh parent WHO).
* **BR-008** *([**] Phase 2)* — **Impor massal**: baris gagal validasi tidak membatalkan baris valid; sistem menghasilkan laporan error per baris.
* **BR-009** — Field **Versi** wajib untuk membedakan revisi kamus (ICD-10 2010/2016/2019/2022).
* **BR-010** *([**] Phase 2)* — Setiap create/update/aktivasi-nonaktivasi dicatat pada **audit log** (user, timestamp, aksi, nilai lama→baru).
* **BR-011** *([***] Phase 3 / [****] Phase 4)* — Untuk klaim BPJS wajib memakai kode **ICD-IM** bila tersedia; reaktivasi kode memicu validasi BPJS **[***]** & Satu Sehat **[****]**.

## 9. Workflow / BPMN Interpretation

> Modul A11 **belum punya BPMN sendiri**. Alur diturunkan dari dokumen sumber (docx) + pola master data & integrasi BPJS/SATUSEHAT pada fitur se-cluster Control Panel. Bagian turunan ditandai `[ASUMSI]`.

**Alur Utama — Kelola Kode Diagnosa (Phase 1):**
1. Admin Master Data / Koder membuka modul **Master Data → Diagnosa**.
2. Sistem menampilkan **Dashboard** daftar kode dengan filter Tipe Kode (WHO/ICD-IM).
3. Klik **+** → isi form (Section Identitas, Klasifikasi Klinis, Status): Kode ICD, Deskripsi, Chapter, **Tipe Kode**, Versi, dst.
4. Sistem memvalidasi format kode (regex), keunikan (Kode+Tipe+Versi), kelengkapan field wajib.
   * **Gateway – Valid?** Ya → simpan, status **Aktif** → "Kode tersimpan". Tidak → tampilkan error, tidak tersimpan.
5. Kode tersedia bagi modul lain via `id_diagnosa`. Saat dipakai di asesmen/RM, modul menarik data dari Master Data Diagnosa.
6. **Nonaktivasi**: kode tidak muncul di pencarian asesmen baru namun tetap visible di RM historis; ditolak bila kode adalah parent kode aktif.

**Alur Impor Massal (Phase 2, [**]):**
1. Admin unduh template → isi → unggah (.csv/.xlsx) → pilih Mode (tambah / tambah+update).
2. Sistem validasi per baris (format, tipe kode, duplikat, parent). **Gateway – Ada baris error?** → tampilkan laporan error per baris; baris valid tetap diproses. Tidak → commit + ringkasan (tambah/update/gagal).

**Alur Integrasi (Fase Lanjutan):**
* **[***] Phase 3 — BPJS**: saat kode ditambahkan/di-reaktivasi, sistem auto-fill & validasi kode BPJS (INA-CBG); fallback input manual dengan flag "belum tervalidasi BPJS" bila endpoint down.
* **[****] Phase 4 — Satu Sehat**: sinkronisasi kode ke FHIR Condition (IHS Kemenkes).

---

### Lampiran — Edge Cases & Catatan

**Edge Cases & Mitigasi** *(docx: Case)*

| No | Case | Mitigasi |
|----|------|----------|
| 1 | Migrasi versi ICD-10 (mis. 2016 → 2019/2022) mengubah deskripsi / menambah kode | Kode lama tidak dihapus, hanya dinonaktifkan & ditandai versi lama; kode baru dibuat dengan versi baru; sediakan mapping kode lama → baru untuk pelaporan. |
| 2 | Reaktivasi kode yang sebelumnya nonaktif | Trigger validasi BPJS **[***]** & Satu Sehat **[****]**; bila sudah tidak diakui → warning, reaktivasi tetap bisa untuk keperluan non-BPJS/non-Satu-Sehat. |
| 3 | Kode ICD-IM sebagai turunan kode WHO (A09 → A09.0 versi Indonesia) | Tampilkan badge Tipe Kode di pencarian asesmen; filter default asesmen BPJS menampilkan ICD-IM lebih dulu; kode WHO tanpa padanan tetap dipakai dengan warning. |
| 4 *([***] Phase 3)* | Endpoint BPJS V-Claim down/timeout saat tambah kode | Fallback input manual Kode BPJS dengan flag "belum tervalidasi BPJS"; background job re-sync setelah endpoint pulih. |

**Informasi Lain:**
* Referensi standar: ICD-10 WHO; ICD-10 Indonesian Modification (Pusdatin Kemenkes/Permenkes); INA-CBG (BPJS); FHIR Condition (Satu Sehat/IHS).
* Inisialisasi Phase 1: kamus diisi ICD-10 WHO versi terbaru via import bulk; ICD-IM ditambahkan bertahap mengikuti Permenkes.
* Konsistensi badge warna (Biru=WHO, Hijau=ICD-IM) dipertahankan di seluruh modul SIMRS.
