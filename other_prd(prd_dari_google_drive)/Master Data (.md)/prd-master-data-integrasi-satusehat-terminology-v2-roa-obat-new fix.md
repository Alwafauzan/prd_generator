# PRD — Master Data / Integrasi SATUSEHAT Terminology V2: ROA Obat (A40)

**Related Document:** Design Figma — belum tersedia/belum dibuat (dikonfirmasi, lihat Open Questions); PRD Master Data Sediaan (A21) — pola master rujukan & acuan UI sementara; PRD Master Data Barang Farmasi (A4) — konsumen langsung; List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A40); Referensi terminologi Phase 2: WHO ATC route codes (http://www.whocc.no/atc), FHIR R4 Dosage.route (MedicationRequest/MedicationAdministration)
**Versi:** 1.2 - Pendalaman mapping terminologi Phase 2 (sistem ATC http://www.whocc.no/atc, FHIR Route/Dosage.route; target URI SATUSEHAT masih ditetapkan Phase 2; konfirmasi Design Figma belum dibuat). Disusun ulang mengikuti template PRD (8 bagian).
**Tanggal:** 2026-07-01

## 1. Metadata Dokumen

* **Approval**: [PERLU KONFIRMASI — Nama Stakeholder, Jabatan, Tanggal]
* **Related Documents**:
    * **Design Figma A40** — **belum tersedia/belum dibuat** (dikonfirmasi — lihat Open Questions). UI Phase 1 mengikuti pola **Master Data Sediaan (A21)** sebagai acuan sementara.
    * PRD **Master Data Sediaan (A21)** — pola master rujukan & acuan dashboard/form.
    * PRD **Master Data Barang Farmasi (A4)** — konsumen langsung daftar ROA.
    * **List Fitur V2.xlsx** (sheet MVP Fitur Operasional, code **A40**).
    * Referensi terminologi **Phase 2**: **WHO ATC route codes** (`http://www.whocc.no/atc`); **FHIR R4 `Dosage.route`** pada `MedicationRequest`/`MedicationAdministration`.
* **Document Version**: 2026-07-01, **v1.2** — Pendalaman mapping terminologi Phase 2 (ATC `http://www.whocc.no/atc`, FHIR `Dosage.route`; target system/URI SATUSEHAT masih ditetapkan Phase 2; konfirmasi Design Figma belum dibuat). Disusun ulang mengikuti template PRD (8 bagian).

## 2. Overview & Background

* **Overview/Brief Summary**: Modul **Master Data Rute Pemberian Obat (Route of Administration / ROA)** adalah **master rujukan (reference master) terpusat** untuk mengelola daftar rute pemberian obat secara terstandarisasi pada SIMRS V2 (target **RS Tipe C & D**). Daftar ROA menjadi **single source of truth** pada input **Master Data Barang Farmasi (A4)**, **e-Resep, order obat (CPO), pelayanan farmasi, EMR, dan dokumentasi pemberian obat** — seluruh modul memakai referensi rute yang sama sehingga penulisan konsisten dan tidak lagi bergantung pada input bebas tiap pengguna.

    Pada **Phase 1**, modul berfokus pada **CRUD** dengan atribut utama: **Nama Rute (wajib, unik)**, **Kode Rute (opsional, boleh duplikat)**, dan **Deskripsi (opsional)**. Karakteristik penting Phase 1:
    * **Tidak memakai status Aktif/Tidak Aktif.** Modul ini **sengaja** memakai `is_deleted` (soft delete) sebagai **satu-satunya** penanda data hidup/mati — berbeda dari master lain (mis. Sediaan A21) yang memakai `status_aktif` (dikonfirmasi — lihat BR-007).
    * Penghapusan memakai **soft delete** (`is_deleted = true`): data hilang dari UI & pilihan transaksi baru, tetapi tetap tersimpan.
    * **Kode Rute boleh duplikat**; yang dijaga unik hanya **Nama Rute** (dikonfirmasi — kode `inj.intravenous` boleh dipakai bersama oleh "Intravena" dan "Infus").
    * Sistem **belum membedakan jenis terminologi** kode (ATC/SNOMED CT/SATUSEHAT/KFA) pada phase ini.
    * **Import/Export massal tidak termasuk Phase 1** (roadmap berikutnya).

    Label fitur menyebut *Integrasi SATUSEHAT Terminology V2*, namun pada Phase 1 mapping terminologi resmi **belum diimplementasikan**. Untuk **Phase 2**, target mapping mulai diidentifikasi: **sistem kode ATC** (`http://www.whocc.no/atc`) untuk kode rute administrasi WHO, dan representasi interoperabilitas mengikuti **FHIR R4 `Dosage.route`**. **Target system/URI terminologi resmi SATUSEHAT untuk ROA masih akan ditetapkan pada Phase 2** (lihat §4 Out of Scope & §8/§9).

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini): Rute pemberian obat berpotensi diinput **tidak konsisten** karena — (1) perbedaan istilah, singkatan, format antar pengguna/RS (mis. "IV" vs "Intravena" vs "inj.intravenous"); (2) tidak ada satu daftar rute terpusat yang dirujuk A4/e-Resep/CPO/farmasi/EMR; (3) pilihan rute kemungkinan **hardcoded** atau bebas-teks pada form transaksi, sehingga tiap perubahan butuh keterlibatan tim teknis [ASUMSI — diturunkan dari pola masalah PRD Master Data Sediaan/A21]. **Dampak**: data rute tidak terstandarisasi → menyulitkan pelaporan, validasi klinis, serta interoperabilitas (mis. ke SATUSEHAT).
    * **To-Be** (kondisi diharapkan): ROA dikelola **terpusat** oleh **user Admin/Farmasi** lewat menu *Control Panel > Master Data > ROA Obat* (tambah/ubah/soft-delete). Modul perujuk (A4/e-Resep/CPO/farmasi/EMR) menampilkan daftar ROA `is_deleted = false` sebagai pilihan rute. Sistem mencegah **duplikasi Nama Rute** (Kode Rute tidak divalidasi unik); ROA yang **sudah pernah dipakai** (`sudah_terpakai = true`) **terkunci dari penghapusan** demi menjaga histori klinis. Struktur `kode_rute` dijaga fleksibel agar Phase 2 dapat menambah pemetaan terminologi (ATC/FHIR `Dosage.route`/SATUSEHAT) **tanpa migrasi besar** — fondasi interoperabilitas SATUSEHAT.

## 3. Goals & Metrics

**Goals:**
* Menyediakan daftar rute pemberian obat yang **terpusat & terstandarisasi** sebagai rujukan A4/e-Resep/CPO/farmasi/EMR.
* Memastikan **konsistensi** penamaan/penggunaan rute di seluruh modul.
* Mempermudah penambahan/perubahan rute **tanpa pengembangan ulang** sistem.
* Menjaga **integritas & histori data klinis** (data yang sudah pernah dipakai tidak boleh hilang).
* Menyiapkan fondasi mapping terminologi (ATC/FHIR `Dosage.route`/SATUSEHAT/SNOMED/KFA) untuk phase berikutnya.

**Metrics:**

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Konsistensi data rute | **0% duplikasi Nama Rute** di data non-deleted (Kode Rute boleh duplikat — tidak dihitung) |
| 2 | Kemandirian user non-teknis | **100%** user Admin/Farmasi mampu menambah ROA tanpa bantuan tim teknis |
| 3 | Rujukan oleh modul lain | **100%** field rute pemberian pada A4/e-Resep/CPO/farmasi/EMR mengambil pilihan dari master ini |
| 4 | Performa pencarian | Waktu pencarian/filter data ROA **< 3 detik** |
| 5 | Integritas data klinis | **0%** data ROA yang sudah pernah dipakai (`sudah_terpakai = true`) terhapus |
| 6 | Kesiapan mapping Phase 2 | **100%** baris ROA memiliki `kode_rute` yang dapat ditelusuri/dipetakan ke ≥1 sistem terminologi target (ATC/SATUSEHAT) saat Phase 2 dimulai [ASUMSI — leading indicator Phase 2] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Mapping Terminologi / Approval) |
|-------------|---------------------|-----------------------------------------------------|
| Dashboard / List ROA | Tabel ROA (`is_deleted=false`): pencarian, sorting, pagination 10/20/50/100 | — |
| Tambah / Edit ROA | Form (overlay): Nama Rute (wajib, unik), Kode Rute (opsional, boleh duplikat), Deskripsi (opsional) | Perubahan katalog melewati **approval berjenjang** (`status_approval`, `role_approver`) |
| Hapus ROA | **Soft delete** (`is_deleted=true`) + proteksi data `sudah_terpakai=true` | — |
| Rujukan lintas-modul | Sediakan daftar ROA non-deleted sebagai lookup untuk A4/e-Resep/CPO/farmasi/EMR | — |
| Seeding default | Seed **daftar ROA default sistem** (lihat §8.3.3) | — |
| Audit trail | Rekam tambah/ubah/hapus (user, timestamp, aksi) [ASUMSI — selaras A21] | — |
| Mapping Terminologi | — | Pemetaan `kode_rute` → **ATC** (`http://www.whocc.no/atc`) / **FHIR `Dosage.route`** / **SATUSEHAT** (URI TBD) / SNOMED CT / KFA via entitas terpisah `master_roa_mapping` |
| Import/Export massal | — | Import/Export data ROA (field `file_import`/`mode_import`) |

**Out of Scope** (Phase 1):
1. **Penetapan ROA ke masing-masing barang/resep** — dilakukan pada modul perujuk (A4/e-Resep/CPO), bukan di master ini.
2. **Pembedaan & mapping jenis terminologi kode** (ATC Adm.R `http://www.whocc.no/atc`, SNOMED CT, SATUSEHAT, KFA, kode internal) — **Phase 2** (dikonfirmasi). Target system/URI SATUSEHAT untuk ROA **masih ditetapkan di Phase 2**.
3. **Push/integrasi aktif ke SATUSEHAT Terminology** (kirim/tarik kode resmi; pemetaan ke FHIR `Dosage.route`) — phase berikutnya; Phase 1 hanya menyimpan kode bebas.
4. **Mapping ROA ↔ jenis sediaan** (validasi klinis, rekomendasi rute, autofill peresepan) — phase berikutnya.
5. **Konsep status Aktif/Nonaktif (`status_aktif`)** — tidak digunakan (memakai soft delete `is_deleted`) — dikonfirmasi.
6. **Import/Export massal data ROA** — Phase berikutnya (dikonfirmasi). Field kanonik `file_import`/`mode_import` tidak dipakai di Phase 1.

## 5. Related Features

Fitur terkait (cluster **Control Panel**, dari List Fitur sheet MVP) dan modul yang merujuk ROA:

| No | Code | Module / Menu | Hubungan dengan ROA |
|----|------|---------------|---------------------|
| 1 | **A40** | Control Panel > Master Data / Integrasi SATUSEHAT Terminology V2 > **ROA Obat** | **Modul ini** |
| 2 | **A4** | Master Data > **Barang Farmasi** | **Merujuk langsung** — ROA dipanggil sebagai pilihan rute saat input/konfigurasi Master Data Barang Farmasi (dikonfirmasi) |
| 3 | **A21** | Master Data > **Sediaan Barang** | Pola master rujukan yang sama; roadmap mapping ROA ↔ Sediaan (Out of Scope) |
| 4 | **A24** | Master Data > **Aturan Pakai** | Aturan pakai berdampingan dengan rute pemberian pada e-Resep |
| 5 | **A35** | Master Data > **Farmaco** | Terkait data obat |
| 6 | **A36** | Master Data > **Grup Obat** | Terkait data obat |
| — | (transaksi) | **e-Resep**, **Order Obat / CPO** (BPMN g-service-cpo-order, g-service-cpo-timing), **Pelayanan Farmasi / Apotek Online** (g-support-apotek-online-iter), **EMR** (g-emr-inpatient, g-emr-patient-identity) | **Konsumen** daftar ROA |

## 6. Business Process & User Stories

* **State Machine Table** — karena modul ini **tidak** memakai `status_aktif`, siklus hidup record ROA diatur oleh kombinasi `is_deleted` & `sudah_terpakai`:

| Status | Deskripsi | Efek Data | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| `AKTIF (belum terpakai)` | `is_deleted=false`, `sudah_terpakai=false` | Tampil di list & lookup rute; **boleh diedit & dihapus** | `→ TERPAKAI` (dipakai modul perujuk) · `→ DIHAPUS` (soft delete) | Perubahan efektif setelah `status_approval=APPROVED` |
| `TERPAKAI (terkunci)` | `is_deleted=false`, `sudah_terpakai=true` | Tampil di list & lookup; **boleh diedit, TIDAK boleh dihapus** (tombol Hapus nonaktif) | `→` tetap (irreversible; tidak bisa `DIHAPUS`) | idem |
| `DIHAPUS` | `is_deleted=true` | Hilang dari UI & pilihan transaksi baru; data tetap tersimpan | Nama sama boleh dibuat ulang sebagai record baru (BR-006) | — |
| `DRAFT` *(Phase 2)* | Perubahan katalog/mapping menunggu persetujuan | Belum efektif ke modul perujuk | — | `DRAFT → APPROVED/REJECTED` oleh `role_approver` |

> **Catatan Status Behavior**: Berbeda dari panduan template generik (toggle Aktif/Nonaktif), modul ini **sengaja tidak menyediakan** input/toggle status. Penanda hidup/mati **hanya** `is_deleted` (soft delete) — dikonfirmasi (BR-007). Penandaan `sudah_terpakai` di-set otomatis oleh modul perujuk saat pemakaian pertama dan bersifat **irreversible** (BR-011).

* **User Stories Utama**:

| ID | Role | User Story | Prioritas | Fase | Acceptance Criteria (ringkas) |
|----|------|-----------|-----------|------|-------------------------------|
| **US-001** | Admin/Farmasi | Melihat dashboard/daftar ROA agar seluruh rute yang dirujuk modul lain terpantau. | P0 | Phase 1 | Tabel data non-deleted; pencarian (Nama/Kode), sorting, pagination (10/20/50/100). |
| **US-002** | Admin/Farmasi | Menambah ROA baru (Nama, Kode opsional, Deskripsi opsional) agar rute baru dapat dipilih di A4/e-Resep/CPO/farmasi/EMR. | P0 | Phase 1 | Form overlay; Nama wajib & dicek duplikat; Kode boleh sama; tersimpan & langsung tersedia. |
| **US-003** | Admin/Farmasi | Mengubah detail ROA agar daftar selalu sesuai kebutuhan. | P0 | Phase 1 | Semua field editable; validasi duplikasi Nama; perubahan tercermin di referensi modul lain. |
| **US-004** | Admin/Farmasi | Menghapus ROA yang belum pernah dipakai agar daftar rapi tanpa kehilangan histori. | P0 | Phase 1 | Soft delete (`is_deleted=true`); data `sudah_terpakai=true` ditolak hapus (tombol nonaktif) + peringatan. |
| **US-005** | Perujuk ROA (input A4 / Dokter / Perawat / Apoteker) | Memilih rute pemberian dari daftar terstandarisasi agar penulisan konsisten. | P0 | Phase 1 | Field rute di modul perujuk mengambil ROA non-deleted; pemakaian pertama menandai `sudah_terpakai=true`. *(Trace BPMN: g-service-cpo-order/timing "Cara Pemberian")* |
| **US-006** | Admin RS | Daftar ROA default tersedia saat instalasi agar tidak input dari nol. | P1 | Phase 1 | Daftar ROA default ter-seed; dapat diubah sesuai kebutuhan. |
| **US-007** | Manajemen/Auditor | Perubahan ROA terekam agar dapat ditelusuri. | P2 [ASUMSI] | Phase 1 | Audit trail mencatat user, timestamp, aksi. |
| **US-008** | Tim Integrasi/Interop | Kode Rute dapat dipetakan ke terminologi standar (ATC/FHIR `Dosage.route`/SATUSEHAT) di Phase 2 agar data rute siap dipertukarkan ke SATUSEHAT. | P3 (Phase 2) | Phase 2 | Mekanisme mapping `kode_rute` → system/URI target; target SATUSEHAT ditetapkan saat Phase 2. [PERLU KONFIRMASI] |

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard / List ROA**
* **User Story**: US-001 — Sebagai user Admin/Farmasi, saya ingin melihat daftar ROA.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menampilkan tabel ROA `is_deleted=false` dengan kolom: No, Nama Rute, Kode Rute, Deskripsi, Status Pemakaian (Terpakai/Belum dari `sudah_terpakai`), Aksi. *(FR-001)*
    * **AC 2**: Tersedia **pencarian** berdasarkan Nama Rute & Kode Rute. *(FR-002)*
    * **AC 3**: Tersedia **sorting** kolom (default Nama Rute A→Z, dukung Z→A) & **pagination** 10/20/50/100. *(FR-003)*

**Fitur: Tambah ROA**
* **User Story**: US-002 — Sebagai user Admin/Farmasi, saya ingin menambah ROA baru.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Tambah (overlay) dengan field Nama Rute (wajib), Kode Rute (opsional), Deskripsi (opsional). *(FR-004, BR-001)*
    * **AC 2**: Sistem **memvalidasi duplikasi Nama Rute** terhadap data non-deleted sebelum simpan; **Kode Rute TIDAK divalidasi unik** (boleh sama). *(FR-005, BR-002/003/006)*
    * **AC 3**: Data tersimpan & **langsung tersedia** sebagai pilihan di modul perujuk; aksi tercatat di audit trail.

**Fitur: Update ROA**
* **User Story**: US-003 — Sebagai user Admin/Farmasi, saya ingin mengubah detail ROA.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Edit dengan **seluruh field editable**. *(FR-006)*
    * **AC 2**: Saat simpan, validasi duplikasi **Nama Rute** (non-deleted). *(BR-002)*
    * **AC 3**: Perubahan Nama Rute tercermin pada referensi di modul perujuk. [ASUMSI — pola A21]

**Fitur: Hapus ROA (Soft Delete)**
* **User Story**: US-004 — Sebagai user Admin/Farmasi, saya ingin menghapus ROA yang belum pernah dipakai.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Penghapusan memakai **soft delete** (`is_deleted=true`); data tidak dihapus fisik. *(FR-007, BR-004)*
    * **AC 2**: Sistem **mengecek flag `sudah_terpakai`** sebelum hapus; bila `true` → **tolak hapus** + peringatan, tombol Hapus **dinonaktifkan sejak awal**. Tidak menghitung jumlah pemakaian — cukup status terpakai/belum. *(FR-008, BR-005)*
    * **AC 3**: Data `is_deleted=true` boleh dibuat ulang dengan Nama Rute yang sama. *(BR-006)*

**Fitur: Rujukan Daftar ROA ke Modul Lain**
* **User Story**: US-005 — Sebagai perujuk ROA, saya ingin memilih rute dari daftar terstandarisasi.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan daftar ROA `is_deleted=false` sebagai sumber pilihan (lookup/API) untuk A4 & modul transaksi. *(FR-009, BR-008)*
    * **AC 2**: Saat ROA dipilih/dipakai **pertama kali**, modul perujuk memicu set `sudah_terpakai=true` (irreversible). *(BR-005/BR-011)*

**Fitur: Seeding Default Sistem**
* **User Story**: US-006 — Sebagai Admin RS, saya ingin daftar ROA default tersedia saat instalasi.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem men-seed daftar ROA default (lihat §8.3.3) saat inisialisasi. *(FR-010)*
    * **AC 2**: Daftar default dapat diubah/ditambah/dinonaktifkan sesuai kebutuhan implementasi RS.

**Fitur: Audit Trail** *(P2 [ASUMSI])*
* **User Story**: US-007 · **Fase**: Phase 1
* **Acceptance Criteria**: **AC 1**: Sistem merekam audit trail (user, timestamp, aksi) tiap tambah/ubah/hapus. *(FR-011, BR-010)*

**Fitur: Mapping Terminologi (ROADMAP — Phase 2, bukan Phase 1)**
* **User Story**: US-008 · **Prioritas**: P3 · **Fase**: Phase 2
* **Acceptance Criteria** *(Out of Scope Phase 1)*:
    * **AC 1**: Sistem mendukung mapping `kode_rute` → **ATC** (system URI `http://www.whocc.no/atc`), representasi **FHIR R4 `Dosage.route`** (CodeableConcept pada MedicationRequest/MedicationAdministration), serta SNOMED CT/KFA. *(FR-012)*
    * **AC 2**: **Terminologi resmi SATUSEHAT untuk ROA** — system/URI target **ditetapkan di Phase 2**. [PERLU KONFIRMASI]
    * **AC 3**: **Import/Export massal** data ROA — Out of Scope Phase 1 (field `file_import`/`mode_import` tidak dipakai). *(FR-013)*

* **Validasi (Wording Frontend — Form Tambah/Edit):**

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Rute | Text | Required, maks 100, **unik** (non-deleted) | "Nama Rute wajib diisi" / "Nama Rute sudah digunakan" | "Contoh: Oral, Intravena, Inhalasi" |
  | Kode Rute | Text | Opsional, maks 50, **boleh duplikat** (tidak divalidasi unik) | — | "Opsional. Kode boleh sama antar rute (mis. inj.intravenous)" |
  | Deskripsi | Text | Opsional, maks 255 | — | "Keterangan singkat rute pemberian" |

  > **Catatan**: Field **Jenis Terminologi Kode** (dropdown ATC/SNOMED/SATUSEHAT/KFA/Internal) **tidak ditampilkan di Phase 1** — direncanakan Phase 2 (BR-009).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion
* **Table Name**: `master_roa` (medication route of administration)
* **Key Columns**:
    * `roa_id`: UUID (Primary Key, auto-generate)
    * `nama_rute`: VARCHAR(100) NOT NULL — **unik** di antara `is_deleted=false` (unique index parsial pada `LOWER(nama_rute) WHERE is_deleted=false`)
    * `kode_rute`: VARCHAR(50) NULL — kode internal/terminologi (Phase 1 tidak dibedakan jenis); **boleh duplikat** (tanpa unique constraint)
    * `deskripsi`: VARCHAR(255) NULL
    * `is_deleted`: BOOLEAN NOT NULL DEFAULT false — **satu-satunya** penanda hidup/mati (soft delete). **Tidak ada `status_aktif`** (BR-007)
    * `sudah_terpakai`: BOOLEAN NOT NULL DEFAULT false — di-set `true` (**irreversible**) saat ROA pertama kali dipakai modul perujuk → mengunci penghapusan (BR-005/BR-011)
    * `status_approval`: VARCHAR(20) NULL DEFAULT 'APPROVED' — **SIAP Phase 2** (approval berjenjang)
    * `role_approver`: VARCHAR(20) NULL — **SIAP Phase 2**
    * `created_by`, `created_at`, `updated_by`, `updated_at`: audit metadata

> **Desain Phase 2 (tidak diimplementasi Phase 1)**: pemetaan terminologi **tidak** ditambahkan sebagai kolom inti, melainkan direncanakan di **entitas pemetaan terpisah** `master_roa_mapping` (`roa_id`, `terminology_system` [URI mis. `http://www.whocc.no/atc`], `code`, `display`, `fhir_element` [mis. `Dosage.route`]) — menjaga struktur Phase 1 stabil tanpa migrasi besar (BR-012). [PERLU KONFIRMASI — desain detail Phase 2]

### 8.2 API Endpoint Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/medication-routes` | List ROA `is_deleted=false` (search `nama_rute`/`kode_rute`, sort, pagination) |
| GET    | `/api/v1/medication-routes/{id}` | Detail satu ROA |
| POST   | `/api/v1/medication-routes` | Create ROA (validasi keunikan Nama; Kode boleh duplikat) |
| PATCH  | `/api/v1/medication-routes/{id}` | Update `nama_rute`/`kode_rute`/`deskripsi` (validasi duplikasi Nama) |
| DELETE | `/api/v1/medication-routes/{id}` | **Soft delete** (`is_deleted=true`); ditolak bila `sudah_terpakai=true` |
| GET    | `/api/v1/medication-routes/lookup` | Lookup ROA non-deleted untuk modul perujuk (A4/e-Resep/CPO/EMR) |
| PUT    | `/api/v1/medication-routes/{id}/mapping` | *(Phase 2)* Simpan mapping terminologi (ATC/FHIR `Dosage.route`/SATUSEHAT) |

### 8.3 Data & Business Rules
#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)
| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `nama_rute` | Nama Rute | text | Ya | maks 100; **unik** (`is_deleted=false`) | manual | BR-001/BR-002 |
| `kode_rute` | Kode Rute | text | Tidak | maks 50; **TIDAK divalidasi unik (boleh duplikat)** | manual | BR-003 (dikonfirmasi); Phase 1 tidak bedakan terminologi (BR-009) |
| `deskripsi` | Deskripsi | text | Tidak | maks 255 | manual | Selaras field kanonik `keterangan` |
| `jenis_terminologi` | Jenis Terminologi Kode | dropdown | Tidak | enum: ATC Adm.R (`http://www.whocc.no/atc`) / SNOMED CT / SATUSEHAT (URI TBD) / KFA / Internal | enum | **Phase 2 (dikonfirmasi)** — TIDAK ditampilkan di Phase 1 |

> **Catatan konsistensi (dikonfirmasi)**: field kanonik `status_aktif` (boolean) yang dipakai master lain (A21 dll) **tidak dipakai** di modul ini (BR-007). Penyaringan data aktif memakai `is_deleted = false`. Konsumen (termasuk A4) **wajib** mengikuti aturan ini.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No | row number | angka | – | urut tampilan |
| Nama Rute | `master_roa.nama_rute` | text | sort A-Z/Z-A (default A-Z); searchable | |
| Kode Rute | `master_roa.kode_rute` | text | searchable | kosong bila tidak diisi; boleh sama antar baris |
| Deskripsi | `master_roa.deskripsi` | text (truncate) | – | |
| Status Pemakaian | `master_roa.sudah_terpakai` | badge (Terpakai/Belum) | filter | menentukan boleh/tidak hapus (BR-005) |
| Aksi | – | tombol Edit / Hapus | – | Hapus **dinonaktifkan** bila `sudah_terpakai=true` |

> Pagination 10/20/50/100 per halaman; hanya menampilkan `is_deleted=false`. **Layar Konfirmasi Hapus** menampilkan Nama/Kode Rute + badge Status Pemakaian (merah = Terpakai → Hapus nonaktif; hijau = Belum → boleh hapus).

#### 8.3.3 Data Default Sistem (Seed, FR-010)
> Daftar rute pemberian baku untuk seed awal. Daftar dapat berubah sesuai kebutuhan implementasi RS.

| No | Nama Rute | Kode | No | Nama Rute | Kode |
|----|-----------|------|----|-----------|------|
| 1 | Implant | implant | 16 | Ocular | ocular |
| 2 | Inhalasi | Inhal | 17 | Otic | otic |
| 3 | Nasal | N | 18 | Kutanea | cutaneous |
| 4 | Oral | O | 19 | Subkutan Injeksi | inj.subcutaneous |
| 5 | Parenteral | P | 20 | Intramuskular Injeksi | inj.intramuscular |
| 6 | Rektal | R | 21 | Intravena Injeksi | inj.intravenous |
| 7 | Sublingual / Bukal | SL | 22 | Intratekal Injeksi | inj.intrathecal |
| 8 | Transdermal | TD | 23 | Topikal | ointment |
| 9 | Vagina | V | 24 | Stomatologic | stomatologic |
| 10 | Bubuk Inhalasi | Inhal.powder | 25 | Dikunyah | Chewing Gum |
| 11 | Aerosol Inhalasi | Inhal.aerosol | 26 | SC Implant | s.c. implant |
| 12 | Transdermal Patch | TD patch | 27 | Intravesical | intravesical |
| 13 | Instillation Solution | Instill.solution | 28 | Urethral | urethral |
| 14 | Oftalmik | lamella | 29 | Instillation | Instill |
| 15 | Aerosol Oral | oral aerosol | 30 | Larutan Inhalasi | Inhal.solution |

> **Catatan terminologi (informasi Phase 2, bukan implementasi Phase 1)**: kode default tampak campuran — kode huruf tunggal `O/N/R/V/P/SL` selaras **kode rute administrasi WHO ATC** (`http://www.whocc.no/atc`); sisanya (`inj.intravenous`, `ointment`, `ocular`, dst.) bersifat ekspresi/kode internal. Pemetaan formal ke system URI target & FHIR `Dosage.route` dilakukan Phase 2 (BR-009/BR-012). [ASUMSI — interpretasi asal kode]

* **Business Rules**:
    * **BR-001** — **Nama Rute wajib diisi**; Kode Rute & Deskripsi opsional. *(Trace: Tambah)*
    * **BR-002** — **Tidak boleh duplikat Nama Rute** di antara data `is_deleted=false`. *(Trace: gateway Tambah/Update)*
    * **BR-003** — **Kode Rute BOLEH duplikat** (tidak divalidasi unik). Dikonfirmasi: `inj.intravenous` dapat dipakai bersama "Intravena" & "Infus". Keunikan hanya pada **Nama Rute** (BR-002).
    * **BR-004** — Penghapusan memakai **soft delete** (`is_deleted=true`); tidak dihapus fisik.
    * **BR-005** — **ROA yang sudah pernah dipakai** (`sudah_terpakai=true` sejak pemakaian pertama oleh A4/e-Resep/CPO/farmasi/EMR) **tidak dapat dihapus**. Sekali terpakai → langsung terkunci (tanpa menghitung jumlah pemakaian).
    * **BR-006** — Bila ada data `is_deleted=true`, sistem **mengizinkan** pembuatan data baru dengan Nama Rute yang sama (data lama dianggap tidak aktif).
    * **BR-007** — Modul ini **tidak memakai `status_aktif`**. ROA hanya memakai `is_deleted`. **Konsumen WAJIB memfilter `is_deleted=false`** (bukan `status_aktif`).
    * **BR-008** — Daftar pilihan rute di modul perujuk hanya menampilkan ROA `is_deleted=false`.
    * **BR-009** — Kode Rute Phase 1 **tidak dibedakan jenis terminologinya**. Pembedaan & pemetaan ke terminologi resmi (ATC `http://www.whocc.no/atc`, FHIR `Dosage.route`, SATUSEHAT) adalah **Phase 2**.
    * **BR-010** — Setiap aksi tambah/ubah/hapus **direkam di audit trail** (user, timestamp, aksi). [ASUMSI]
    * **BR-011** — Penandaan `sudah_terpakai` bersifat **satu arah (irreversible)**: begitu `true`, tidak dikembalikan ke `false` meski transaksi/rujukan dibatalkan — menjaga histori klinis. [ASUMSI]
    * **BR-012** *(Phase 2)* — Saat mapping terminologi aktif, satu `nama_rute` dapat memiliki **>1 pemetaan** (ATC route + FHIR `Dosage.route` + kode SATUSEHAT), disimpan di `master_roa_mapping` agar tidak mengubah keunikan Nama Rute Phase 1. [PERLU KONFIRMASI — desain detail Phase 2]

## 9. Workflow / BPMN Interpretation

> Modul ini **belum punya BPMN sendiri**; alur berikut diturunkan dari pola master data (A21) dan BPMN order/pelayanan obat terkait. Bagian turunan ditandai [ASUMSI].

**Alur ringkas**: `[Admin/Farmasi]` → Akses Menu ROA Obat → Input/Edit Data (Nama unik, Kode opsional, Deskripsi opsional) → `[Sistem]` Validasi duplikasi Nama & simpan → Daftar ROA (non-deleted) tersedia sebagai pilihan rute di A4/e-Resep/CPO/Farmasi/EMR. Saat ROA pertama kali dipakai → sistem menandai `sudah_terpakai=true` (terkunci dari penghapusan).

**Skenario 1 — Lihat & Cari Daftar ROA**
1. User membuka *Control Panel > Master Data > ROA Obat*.
2. Sistem menampilkan tabel ROA `is_deleted=false` (default sort Nama Rute A→Z).
3. User mencari (Nama/Kode) / sorting / pagination.

**Skenario 2 — Tambah ROA**
1. User klik **+ Tambah** → form overlay (Nama, Kode opsional, Deskripsi opsional).
2. User isi & **Simpan**.
3. **Gateway — Nama Rute duplikat (non-deleted)?** — **Ya** → error, batal simpan. **Tidak** → simpan (Kode Rute TIDAK dicek unik), catat audit, data langsung tersedia di modul perujuk.

**Skenario 3 — Update ROA**
1. User pilih baris → **Edit** → ubah field → **Simpan**.
2. Validasi duplikasi **Nama Rute** → simpan + audit. Perubahan tercermin pada referensi modul perujuk. [ASUMSI — pola A21]

**Skenario 4 — Hapus ROA (Soft Delete)**
1. User pilih baris → **Hapus**.
2. **Gateway — `sudah_terpakai=true`?** — **Ya** → tolak + peringatan (jaga histori klinis); tombol Hapus dinonaktifkan sejak awal. **Tidak** → konfirmasi → set `is_deleted=true`, catat audit; data hilang dari UI & pilihan transaksi baru.

**Skenario 5 — Seeding Default Sistem**
* Saat inisialisasi, sistem mengisi daftar ROA default (§8.3.3). Daftar default dapat berubah sesuai kebutuhan RS.

**Integrasi (interpretasi alur data):**
* **Phase 1**: **Tidak ada integrasi eksternal aktif.** Meski label menyebut *Integrasi SATUSEHAT Terminology V2*, Phase 1 hanya menyimpan Kode Rute bebas tanpa pertukaran data ke SATUSEHAT.
* **Integrasi Internal (konsumen daftar ROA)** — A4 (ROA→A4, pemilihan dapat memicu `sudah_terpakai=true`), e-Resep, Order Obat/CPO ("Cara Pemberian" — g-service-cpo-order/timing), Pelayanan Farmasi/Apotek Online (g-support-apotek-online-iter), EMR/Dokumentasi Pemberian Obat (g-emr-inpatient). Semua konsumen **WAJIB** memfilter `is_deleted=false` (BR-007).
* **Roadmap Mapping Terminologi (Phase 2 — Out of Scope sekarang)** — pemetaan `kode_rute` disimpan via `master_roa_mapping`: **WHO ATC** (`http://www.whocc.no/atc`, ditetapkan sebagai sistem mapping); **FHIR R4 `Dosage.route`** (CodeableConcept pada MedicationRequest/MedicationAdministration, acuan format FHIR); **SATUSEHAT Terminology — ROA** (system/URI **belum ditetapkan** — [PERLU KONFIRMASI]); **SNOMED CT** (`http://snomed.info/sct`) & **KFA** opsional. Saat data dipertukarkan ke SATUSEHAT, nilai dipublikasikan sebagai `Dosage.route` (system + code + display hasil mapping). Push/integrasi aktif tetap Out of Scope Phase 1.
* **Roadmap lain**: Import/Export massal ROA & Mapping ROA ↔ Sediaan (A21) — phase berikutnya.

## Asumsi
- Modul memakai soft delete (is_deleted) sebagai satu-satunya penanda hidup/mati — TIDAK memakai status_aktif (dikonfirmasi, BR-007).
- Nama Rute unik (non-deleted); Kode Rute boleh duplikat (dikonfirmasi, BR-003).
- Flag sudah_terpakai bersifat irreversible dan mengunci penghapusan (BR-005/BR-011).
- As-Is: rute pemberian sebelumnya hardcoded/bebas-teks pada form transaksi (diturunkan dari pola A21).
- Audit trail mengikuti pola A21 & BPMN order/pelayanan obat.
- Design Figma A40 belum tersedia → UI Phase 1 mengikuti pola dashboard/form Master Data Sediaan (A21).
- Mapping terminologi Phase 2: ATC (http://www.whocc.no/atc) + FHIR Dosage.route; kode default campuran ATC/ekspresi internal.

## Pertanyaan Terbuka
- Nama & jabatan stakeholder approval dokumen (§1 Metadata).
- Target system/URI terminologi resmi SATUSEHAT untuk Route of Administration — ditetapkan Phase 2.
- Desain detail entitas pemetaan Phase 2 (master_roa_mapping) & aturan multi-mapping per nama_rute (BR-012).
- Finalisasi daftar ROA default §8.3.3 oleh pihak RS/farmasi (perlu ditambah/dikurangi?).
- Konfirmasi ketersediaan/rencana Design Figma A40 untuk menggantikan acuan sementara A21.