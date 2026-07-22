# PRD — Master Data Profesi (A57)

> **Kode Fitur:** A57 · **Cluster:** Control Panel · **Modul:** Master Data · **Menu:** Profesi
> SIMRS RS Tipe C & D · Persona: System Analyst senior SIMRS

---

## 1. Metadata Dokumen

* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer, Tamtech International (Signature, Date)
* **Related Documents**:
    * PRD Master Data Staf (A2) — konsumen utama: profesi tiap staf (dropdown seluruh kategori)
    * PRD Master Data Spesialisasi Praktisi (A23) — merujuk profesi ber-flag "punya spesialisasi"
    * PRD RBAC (A53) — kontrol hak akses CRUD master
    * SNOMED CT International — browser konsep occupation/healthcare professional: https://browser.ihtsdotools.org
    * Daftar Profesi — `Master_Data_Profesi` (referensi pengisian awal): https://drive.google.com/file/d/1jgoJgRKRUCjaffDulYtEfbUvSFEq4jD_/view?usp=drive_link
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-05-28 | 1.0 - Draft | Draft awal Master Data Profesi (kategori, flag spesialisasi, kode SNOMED level profesi) |
| 2026-07-03 | 1.1 - Draft | Restrukturisasi ke template PRD (phasing, state machine, skema DB, endpoint API, acceptance criteria) |
| 2026-07-03 | 1.2 - Draft | §8.3.1 diselaraskan ke Data Requirement docx: sumber Kode SNOMED memakai dropdown list referensi (drive); sumber Nama = kolom B `Master_Data_Profesi`. Field **Deskripsi** dipertahankan sebagai field **opsional** (tambahan di luar 5 field kanonik docx, atas keputusan tim). |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  Modul **Master Data Profesi** (cluster **Control Panel**, kode **A57**) adalah modul referensi yang menyimpan **daftar baku seluruh jenis profesi/jabatan** di rumah sakit — mencakup **tenaga medis**, **tenaga kesehatan** lain, maupun **tenaga non-kesehatan** (mis. administrasi, driver, keamanan). Modul ini menjadi **sumber tunggal (single source of truth)** yang dirujuk oleh **Master Data Staf (A2)** saat menetapkan profesi seorang pegawai.

  Setiap profesi memiliki dua penanda kunci: **Kategori** (Tenaga Medis / Tenaga Kesehatan / Non-Kesehatan) dan **flag "Punya Spesialisasi"**. Flag inilah yang dipakai **Master Data Spesialisasi Praktisi (A23)** untuk hanya menampilkan profesi yang relevan (Dokter, Dokter Gigi, Perawat, Apoteker), sehingga **satu master profesi melayani dua kebutuhan sekaligus tanpa duplikasi**.

  Untuk **interoperabilitas**, tiap profesi tenaga kesehatan dilengkapi **kode SNOMED CT pada level profesi**. Penempatan kode di level profesi (bukan hanya di level spesialisasi) memastikan **seluruh tenaga kesehatan — termasuk yang tidak memiliki jenjang spesialisasi** (mis. perawat umum, fisioterapis, perekam medis) — tetap memiliki kode standar untuk pertukaran data klinis (EMR).

  > `[ASUMSI]` Master Profesi adalah **master data statis** (jarang berubah) — bukan modul transaksional. Pengisian awal mengacu pada dokumen `Master_Data_Profesi`.

* **Business Process (As-Is vs To-Be)**:

    * **As-Is** (kondisi saat ini):
        1. Profesi diisi sebagai **teks bebas** pada data staf → rawan **inkonsistensi** dan **duplikasi makna** (mis. "Dokter" vs "dr." vs "Dokter Umum") dan menyulitkan pelaporan.
        2. Kode SNOMED semula direncanakan disimpan pada Master **Spesialisasi** — padahal **tidak semua** tenaga kesehatan memiliki spesialisasi, sehingga nakes tanpa spesialisasi **tidak punya kode standar** untuk interoperabilitas.
        3. **Tidak ada pembeda baku** antara tenaga medis, tenaga kesehatan, dan non-kesehatan.

    * **To-Be** (kondisi diharapkan — workflow digital baru):
        1. Profesi **dikelola terpusat** dengan **Kategori** dan **flag Punya Spesialisasi** yang jelas.
        2. Setiap profesi tenaga kesehatan memiliki **kode SNOMED CT di level profesi** → cakupan menyeluruh untuk pertukaran data klinis.
        3. **Master Staf (A2)** memakai **seluruh profesi**; **Master Spesialisasi (A23)** hanya menampilkan profesi **ber-flag punya spesialisasi**.
        4. Penulisan seragam, relasi ke spesialisasi terjaga, dan kategori nakes/non-nakes jelas untuk pelaporan.

## 3. Goals & Metrics

**Goals**: Menyediakan referensi profesi RS yang **baku dan terpusat**, dengan kategori dan flag spesialisasi yang jelas serta kode SNOMED untuk tenaga kesehatan, sehingga melayani kebutuhan **kepegawaian** sekaligus **interoperabilitas klinis**.

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Konsistensi data | 0 duplikasi profesi bermakna sama; seluruh staf memilih profesi dari master, **bukan teks bebas** |
| 2 | Akurasi kategori | 100% profesi memiliki kategori yang benar (Medis / Kesehatan / Non-Kesehatan) |
| 3 | Kelengkapan kode SNOMED | 100% profesi kategori **tenaga kesehatan** (Medis & Kesehatan) memiliki kode SNOMED CT terisi |
| 4 | Ketepatan relasi spesialisasi | Dropdown Master Spesialisasi (A23) **hanya** menampilkan profesi ber-flag "punya spesialisasi" |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) |
|-------------|---------------------|--------------------|
| Pengelolaan Profesi | CRUD profesi: tambah, lihat detail, ubah, hapus bersyarat | Approval berjenjang perubahan master (kolom `approval_status`/`approver_role` disiapkan) |
| Penanda Kategori & Flag | Set **Kategori** (Medis/Kesehatan/Non-Kesehatan) & flag **Punya Spesialisasi** | — |
| Pemetaan Kode SNOMED CT | Input **Concept ID + Display** manual pada level profesi (khusus nakes) | Sinkronisasi/validasi otomatis ke server SNOMED CT International |
| Pencarian & Filter | Cari (Nama, Kode SNOMED), filter (Kategori, Punya Spesialisasi), sort, pagination | — |
| Penyediaan Dropdown ke Modul Lain | Ekspos profesi ke **Master Staf** (semua) & **Master Spesialisasi** (ber-flag saja) | — |

> **Catatan Phasing:** Phase 1 fokus CRUD + penanda + pemetaan SNOMED manual **tanpa** approval berjenjang. Skema data menyediakan kolom `approval_status`/`approver_role` (approval Phase 2) sejak awal agar tidak perlu migrasi skema (lihat §8.1).

**Out of Scope**:

| No | Scope |
|----|-------|
| 1 | **Penetapan profesi pada masing-masing staf** — ditangani Master Data Staf (A2) yang merujuk master ini. |
| 2 | **Pengelolaan jenjang spesialisasi/subspesialisasi** — ditangani Master Data Spesialisasi Praktisi (A23). |
| 3 | **Pengiriman data nakes ke SATUSEHAT** — bersumber dari SISDMK, di luar master RS ini. |
| 4 | **Sinkronisasi otomatis terminologi** dari server SNOMED CT International; pengisian kode dilakukan **manual** pada fase ini. |

## 5. Related Features

| Code | Menu | Deskripsi Relasi (Teknis / Bisnis) |
|------|------|-------------------------------------|
| **A57** | Master Data > Profesi | **Modul ini** |
| A2 | Master Data > Staff | **Konsumen** — dropdown pemilihan profesi (**seluruh kategori**) saat input/edit data staf. A57 = sumber daftar profesi. |
| A23 | Master Data > Spesialisasi & SMF | **Konsumen** — sumber **Jenis Profesi** (**hanya** profesi ber-flag "punya spesialisasi"). |
| — | Modul Integrasi / EMR | **Konsumen** — sumber **kode SNOMED CT** profesi tenaga kesehatan untuk pertukaran data klinis. |
| A53 | Admin > RBAC | Menentukan hak akses CRUD master profesi. |

## 6. Business Process & User Stories

### 6.1 State Machine — Status Profesi (`is_active`)

> Master Profesi tidak memiliki stok; kolom "Efek Stok" pada template diadaptasi menjadi **Efek pada Modul Konsumen**. Status **default AKTIF** saat create. Nonaktivasi adalah **soft delete** (histori data staf tetap utuh); **hapus permanen bersifat bersyarat** (lihat BR-005).

| Status | Deskripsi | Efek pada Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------------|--------------------|--------------------|
| **Aktif** | Profesi berlaku & dapat dipilih | Muncul sebagai lookup di Master Staf (A2) & — bila ber-flag — Master Spesialisasi (A23) | Create → Aktif (default); Aktif → Nonaktif (toggle) | Sama (dengan approval bila diaktifkan) |
| **Nonaktif** | Profesi tidak dipakai untuk data baru | **Tidak** muncul sebagai pilihan lookup baru; **tetap tampil di dashboard** & pada data staf lama (histori utuh) | Nonaktif → Aktif (toggle) | Sama |
| **Terhapus** | Profesi dihapus permanen | Hilang dari sistem | Aktif/Nonaktif → Terhapus **hanya bila belum pernah dipakai staf/spesialisasi** (BR-005) | Sama |

### 6.2 User Stories Utama

Prioritas: **P0** Critical/MVP · **P1** Must Have · **P2** Should Have · **P3** Low · **P4** Enhancement.

* **US-001** — Sebagai **Admin**, saya ingin melihat **daftar profesi** beserta kategori dan kode SNOMED-nya, agar mudah dikelola. *(P0)*
* **US-002** — Sebagai **Admin**, saya ingin **menambah profesi baru** beserta kategori dan kode SNOMED-nya, agar tersedia di dropdown modul lain. *(P0)*
* **US-003** — Sebagai **Admin**, saya ingin **mengubah data profesi** bila terjadi perubahan/koreksi, agar data selalu akurat. *(P0)*
* **US-004** — Sebagai **Admin**, saya ingin melihat **detail** satu profesi lengkap dengan kode SNOMED-nya. *(P1)*
* **US-005** — Sebagai **Admin**, saya ingin **menghapus profesi** yang salah/tidak terpakai **tanpa merusak** data staf historis. *(P0)*
* **US-006** — Sebagai **Admin**, saya ingin **menandai kategori** & apakah profesi punya **jenjang spesialisasi**, agar relasi ke Master Spesialisasi tepat. *(P0)*
* **US-007** — Sebagai **Admin**, saya ingin **memetakan profesi tenaga kesehatan ke kode SNOMED CT**, agar siap dipakai pertukaran data klinis (EMR). *(P0)*
* **US-008** — Sebagai **Admin**, saya ingin **mencari & memfilter** profesi berdasarkan atribut, agar cepat menemukan entri tertentu. *(P1)*
* **US-009** — Sebagai **sistem**, saya ingin **menyediakan daftar profesi** untuk dropdown Master Staf (semua) & Master Spesialisasi (ber-flag saja). *(P1)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Dashboard / Daftar Profesi**
* **User Story**: Sebagai Admin, saya ingin melihat daftar profesi beserta kategori dan kode SNOMED-nya, agar mudah dikelola. *(US-001)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik menu **Master Data → Profesi** menampilkan halaman **Dashboard**.
    * **AC 2**: Tabel menampilkan kolom: **Nama Profesi**, **Kategori**, **Punya Spesialisasi** (Ya/Tidak), **Kode SNOMED CT**.
    * **AC 3**: Urutan default berdasarkan **Nama (Ascending)**; dapat diatur **Asc/Desc**.
    * **AC 4**: Tersedia **kolom pencarian** (Nama, Kode SNOMED) dan **filter** (Kategori, Punya Spesialisasi).
    * **AC 5**: **Pagination** 10 / 20 / 50 / 100 data per halaman.
    * **AC 6**: Tiap baris memiliki tombol **Detail**, **Edit**, **Hapus**.
    * **AC 7**: Tombol **➕ Tambah** untuk menambah profesi baru.

---

**Fitur: Tambah Profesi (Create)**
* **User Story**: Sebagai Admin, saya ingin menambah profesi baru beserta kategori dan kode SNOMED-nya. *(US-002, US-006, US-007)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **➕** menampilkan form **Tambah Profesi** (overlay).
    * **AC 2**: Field: **Nama**, **Kategori**, **Punya Spesialisasi**, **Kode SNOMED CT**, **SNOMED Display / FSN**, **Deskripsi** (spesifikasi di §8.3.1).
    * **AC 3**: Field **Kode SNOMED** **dianjurkan** bila Kategori = Tenaga Medis / Tenaga Kesehatan; **opsional/dikosongkan** untuk Non-Kesehatan (BR-004).
    * **AC 4**: Validasi: **Nama wajib unik** (BR-001); **Kategori wajib** (BR-002).
    * **AC 5**: Status di-set **AKTIF** oleh sistem — **tanpa** input status di form create.
    * **AC 6**: Setelah simpan, profesi **langsung tersedia** di dropdown Master Staf (dan Master Spesialisasi bila ber-flag "Ya").
* **Validasi — A. Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Profesi | Text | Required, Max 100, Unik | "Nama profesi wajib diisi." / "Profesi '{nama}' sudah terdaftar." | "Masukkan nama profesi (mis. Dokter, Perawat, Driver)" |
  | Kategori | Single Select | Required | "Kategori wajib dipilih." | "Pilih Tenaga Medis / Tenaga Kesehatan / Non-Kesehatan" |
  | Punya Spesialisasi | Toggle (Ya/Tidak) | Default: Tidak | — | "Aktifkan bila profesi ini punya jenjang spesialisasi (mis. Dokter)" |
  | Kode SNOMED CT | Text/Numeric | Dianjurkan untuk nakes; opsional untuk Non-Kesehatan | "Format Concept ID tidak valid." | "Concept ID SNOMED CT (occupation), sebaiknya berstatus active" |
  | SNOMED Display / FSN | Text | Optional, Max 255 | — | "Fully Specified Name / display dari Concept ID" |

---

**Fitur: Ubah Profesi (Update)**
* **User Story**: Sebagai Admin, saya ingin mengubah data profesi bila terjadi perubahan atau koreksi. *(US-003)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **Edit** membuka form terisi data lama.
    * **AC 2**: **Seluruh field** dapat diubah (Nama, Kategori, Punya Spesialisasi, Kode SNOMED CT, SNOMED Display / FSN, Deskripsi).
    * **AC 3**: Perubahan flag **Punya Spesialisasi** **langsung memengaruhi** ketersediaan profesi di Master Spesialisasi (A23) — BR-003.
    * **AC 4**: Validasi keunikan nama (BR-001) & kategori wajib (BR-002) tetap berlaku.
    * **AC 5**: Perubahan tersimpan dan **berlaku di seluruh modul** yang merujuk.

---

**Fitur: Detail Profesi**
* **User Story**: Sebagai Admin, saya ingin melihat detail satu profesi lengkap dengan kode SNOMED-nya. *(US-004)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **Detail** menampilkan seluruh field: **Nama**, **Kategori**, **Punya Spesialisasi**, **Kode SNOMED CT + SNOMED Display / FSN**, **Deskripsi**.
    * **AC 2**: Seluruh atribut profesi tampil **lengkap dan akurat**.

---

**Fitur: Hapus Bersyarat (Delete)**
* **User Story**: Sebagai Admin, saya ingin menghapus profesi yang salah/tidak terpakai tanpa merusak data staf historis. *(US-005)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: **Hapus permanen hanya diizinkan** bila profesi **belum pernah dipakai** oleh staf manapun **dan** tidak dipakai entri Spesialisasi (BR-005).
    * **AC 2**: Bila profesi **sudah dipakai**, sistem **menolak hapus** dan menampilkan pesan jelas.
    * **AC 3**: `[ASUMSI]` Sebagai alternatif hapus untuk profesi terpakai yang ingin dipensiunkan, Admin dapat **menonaktifkan** profesi (soft delete via `is_active`) — profesi tetap utuh pada data staf lama namun tidak dipilih untuk data baru.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Aksi | Rules | Konfirmasi/Error Message |
  |------|-------|--------------------------|
  | Hapus profesi **belum dipakai** | Izinkan hapus permanen; minta konfirmasi | "Hapus profesi '{nama}'? Tindakan ini tidak dapat dibatalkan." → Hapus/Batal |
  | Hapus profesi **sudah dipakai staf/spesialisasi** | Tolak hapus permanen | "Profesi '{nama}' tidak dapat dihapus karena masih dipakai {n} staf / entri spesialisasi. Nonaktifkan bila ingin memensiunkan." |

---

**Fitur: Kategori & Flag Spesialisasi**
* **User Story**: Sebagai Admin, saya ingin menandai kategori profesi dan apakah profesi tersebut memiliki jenjang spesialisasi. *(US-006)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: **Kategori**: Tenaga Medis / Tenaga Kesehatan / Non-Kesehatan (**single select**).
    * **AC 2**: **Punya Spesialisasi**: Ya/Tidak (**boolean**), default **Tidak**.
    * **AC 3**: **Hanya** profesi ber-flag **"Ya"** yang muncul sebagai **Jenis Profesi** di Master Spesialisasi (A23) — BR-003.
    * **AC 4**: Profesi **Non-Kesehatan** umumnya ber-flag **"Tidak"** dan **tanpa** kode SNOMED.
    * **AC 5**: Kategori & flag tersimpan benar; relasi ke Master Spesialisasi mengikuti flag.

---

**Fitur: Pemetaan Kode SNOMED CT**
* **User Story**: Sebagai Admin, saya ingin memetakan profesi tenaga kesehatan ke kode SNOMED CT agar siap dipakai pertukaran data klinis (EMR). *(US-007)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Field: **Kode SNOMED CT (Concept ID)** dan **SNOMED Display/FSN**.
    * **AC 2**: **Disarankan** untuk Kategori Tenaga Medis & Tenaga Kesehatan; **opsional/dikosongkan** untuk Non-Kesehatan (BR-004).
    * **AC 3**: Concept ID **sebaiknya berstatus active** pada SNOMED CT International (BR-007).
    * **AC 4**: Profesi nakes memiliki **Kode SNOMED CT tersimpan** dengan display yang sesuai.

---

**Fitur: Pencarian & Filter**
* **User Story**: Sebagai Admin, saya ingin mencari dan memfilter profesi berdasarkan beberapa atribut. *(US-008)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: **Filter**: Kategori, Punya Spesialisasi.
    * **AC 2**: **Pencarian**: Nama, Kode SNOMED.
    * **AC 3**: Hasil sesuai kata kunci dan filter yang dipilih.

---

**Fitur: Penyediaan Dropdown ke Modul Lain**
* **User Story**: Sebagai sistem, saya ingin menyediakan daftar profesi untuk dropdown Master Staf dan Master Spesialisasi. *(US-009)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: **Master Staf (A2)**: menerima **seluruh** profesi (semua kategori) yang **aktif**.
    * **AC 2**: **Master Spesialisasi (A23)**: menerima **hanya** profesi ber-flag "punya spesialisasi" yang **aktif** (BR-003/BR-006).
    * **AC 3**: Hasil **terurut berdasarkan Nama Ascending**.
    * **AC 4**: Tiap modul menerima daftar profesi yang **sesuai konteksnya**.

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `professions`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `name`: Varchar(100) — nama profesi (mis. "Dokter", "Perawat", "Driver")
    * `category`: Enum(`medical`, `health`, `non_health`) — **Tenaga Medis / Tenaga Kesehatan / Non-Kesehatan**
    * `has_specialization`: Boolean (default `false`) — flag "Punya Spesialisasi"
    * `snomed_concept_id`: Varchar(64) (nullable) — Concept ID SNOMED CT (occupation/healthcare professional)
    * `snomed_display`: Varchar(255) (nullable) — Fully Specified Name / display dari Concept ID
    * `description`: Text (nullable) — keterangan/catatan tambahan profesi (opsional)
    * `is_active`: Boolean (default `true`)
    * `created_by`, `updated_by`: UUID (FK → `users.id`)
    * `created_at`, `updated_at`: Timestamp
    * `deleted_at`: Timestamp (nullable) — untuk soft delete/nonaktivasi historis
    * *(Phase 2-ready, belum diaktifkan)* `approval_status`: Enum (nullable) · `approver_role`: Varchar (nullable)
* **Constraints**:
    * `UNIQUE(name) WHERE deleted_at IS NULL` — nama profesi unik (BR-001).
    * `CHECK (category IN ('medical','health','non_health'))` — kategori wajib salah satu enum (BR-002).
    * **Hapus permanen bersyarat** ditegakkan di layer aplikasi: tolak `DELETE` bila terdapat referensi pada `staff` / `specializations` (BR-005). FK dari modul konsumen menunjuk `professions.id`.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/professions` | List profesi (filter: `category`, `has_specialization`, `search`, `sort`, `page`, `per_page`) — default sort Nama Asc |
| POST | `/api/v1/professions` | Create profesi; status = AKTIF (tanpa input status) |
| GET | `/api/v1/professions/{id}` | Detail profesi |
| PUT | `/api/v1/professions/{id}` | Update profesi |
| DELETE | `/api/v1/professions/{id}` | **Hapus bersyarat** — ditolak bila profesi masih dipakai staf/spesialisasi (BR-005) |
| PATCH | `/api/v1/professions/{id}/status` | Nonaktif/Aktif (soft delete) untuk memensiunkan profesi terpakai |
| GET | `/api/v1/professions/lookup?context=staff` | Lookup **seluruh** profesi aktif — untuk dropdown Master Staf (A2) |
| GET | `/api/v1/professions/lookup?context=specialization` | Lookup profesi aktif **ber-flag** `has_specialization=true` — untuk Master Spesialisasi (A23) — BR-006 |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| name | Nama Profesi | Text Input / Dropdown referensi | Ya | Max 100 char; **wajib unik** | acuan **kolom B** `Master_Data_Profesi` | mis. Dokter, Perawat, Driver |
| category | Kategori | Single Select (dropdown) | Ya | Salah satu: Tenaga Medis / Tenaga Kesehatan / Non-Kesehatan | manual | Menentukan apakah kode SNOMED relevan & apakah masuk konteks klinis |
| has_specialization | Punya Spesialisasi | Toggle (Ya/Tidak) | Tidak | Default: **Tidak** | manual | Bila **Ya**, profesi muncul sebagai Jenis Profesi di Master Spesialisasi (A23) |
| snomed_concept_id | Kode SNOMED CT (Concept ID) | Text/Numeric Input | Tidak | Concept ID SNOMED CT untuk profesi/occupation; sebaiknya berstatus **active** pada SNOMED CT International | Dropdown list referensi ([`Master_Data_Profesi`](https://drive.google.com/file/d/1jgoJgRKRUCjaffDulYtEfbUvSFEq4jD_/view?usp=drive_link)) | **Disarankan** untuk Tenaga Medis & Tenaga Kesehatan; **dikosongkan** untuk Non-Kesehatan (BR-004) |
| snomed_display | SNOMED Display / FSN | Text Input | Tidak | Max 255 char | manual (Fully Specified Name / display dari Concept ID) | FSN/display dari Concept ID SNOMED CT |
| description | Deskripsi | Textarea | Tidak | — | manual | Keterangan/catatan tambahan profesi (opsional) |

> **Catatan status behavior**: Tidak ada input **Status** di form **create** — status di-set **AKTIF** oleh sistem. Pengelolaan Aktif/Nonaktif (untuk memensiunkan profesi terpakai) dilakukan via aksi di dashboard, bukan di form create.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (Dashboard / List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nama Profesi | `name` | text | Sort (default A-Z); Search | — |
| Kategori | `category` | badge (Medis/Kesehatan/Non-Kesehatan) | Filter | — |
| Punya Spesialisasi | `has_specialization` | Ya / Tidak | Filter | — |
| Kode SNOMED CT | `snomed_concept_id` | text | Search | "-" bila kosong (umumnya Non-Kesehatan) |
| Aksi | operasi baris | tombol **Detail** · **Edit** · **Hapus** | — | Hapus bersyarat (BR-005) |

> Contoh isi dashboard:
>
> | Nama Profesi | Kategori | Punya Spesialisasi | Kode SNOMED CT | Aksi |
> |--------------|----------|--------------------|----------------|------|
> | Dokter | Tenaga Medis | Ya | 309343006 | [Detail] [Edit] [Hapus] |
> | Dokter Gigi | Tenaga Medis | Ya | 265937000 | [Detail] [Edit] [Hapus] |
> | Perawat | Tenaga Kesehatan | Ya | 224535009 | [Detail] [Edit] [Hapus] |
> | Apoteker | Tenaga Kesehatan | Ya | 46255001 | [Detail] [Edit] [Hapus] |
> | Fisioterapis | Tenaga Kesehatan | Tidak | 36682004 | [Detail] [Edit] [Hapus] |
> | Driver | Non-Kesehatan | Tidak | - | [Detail] [Edit] [Hapus] |
>
> `[PERLU KONFIRMASI]` Contoh Concept ID di atas hanya ilustrasi format — nilai final mengacu pada dropdown list `Master_Data_Profesi` dan status active di SNOMED CT International.

#### 8.3.3 Business Rules

* **BR-001** — **Keunikan**: Nama Profesi **wajib unik** di seluruh master (`UNIQUE(name)`).
* **BR-002** — **Kategori wajib** dan **single select**: Tenaga Medis / Tenaga Kesehatan / Non-Kesehatan.
* **BR-003** — **Flag Punya Spesialisasi menentukan relasi**: hanya profesi ber-flag `has_specialization = true` yang muncul sebagai **Jenis Profesi** di Master Spesialisasi (A23). Perubahan flag langsung memengaruhi ketersediaan di A23.
* **BR-004** — **Kode SNOMED**: **disarankan** untuk kategori Tenaga Medis & Tenaga Kesehatan; **dikosongkan** untuk Non-Kesehatan. Penempatan di **level profesi** memastikan nakes tanpa spesialisasi tetap punya kode standar.
* **BR-005** — **Hapus bersyarat**: hapus permanen hanya diizinkan bila profesi **belum pernah dipakai** oleh staf manapun **dan** tidak dipakai entri Spesialisasi. Bila terpakai → hapus **ditolak** (opsi: nonaktifkan/soft delete).
* **BR-006** — **Lookup per konteks**: Master Staf (A2) menerima **seluruh** profesi aktif; Master Spesialisasi (A23) menerima **hanya** profesi aktif ber-flag "punya spesialisasi". Hasil terurut Nama Ascending.
* **BR-007** — **Kualitas SNOMED**: Concept ID sebaiknya berstatus **active** pada SNOMED CT International; pengisian **manual** pada fase ini (tanpa sinkronisasi otomatis).
* **BR-008** — Hanya role dengan hak akses Master Data Control Panel (RBAC A53) yang boleh CRUD master profesi.

## 9. Workflow / BPMN Interpretation

> Modul A57 **belum punya BPMN sendiri**. Alur diturunkan dari **Main Flow/Mindmap** pada dokumen sumber dan pola master data referensi lintas modul. Bagian turunan ditandai `[ASUMSI]`.

**Skenario 1 — Tambah Profesi**
1. Admin membuka menu **Master Data → Profesi** → klik **➕ Tambah**.
2. Isi field: **Nama**, pilih **Kategori**, setel **flag Punya Spesialisasi**, isi **Kode SNOMED CT** (untuk nakes) & **SNOMED Display / FSN**, **Deskripsi** (opsional) → **SIMPAN**.
3. Sistem **memvalidasi keunikan Nama** & kelengkapan **Kategori**.
   * **Gateway — Nama sudah ada?** Ya → error "Profesi sudah terdaftar"; Tidak → lanjut.
   * **Gateway — Kategori kosong?** Ya → error "Kategori wajib dipilih"; Tidak → lanjut.
4. Tersimpan, status **Aktif** → **langsung tersedia** di dropdown Master Staf (dan Master Spesialisasi bila ber-flag "Ya").

**Skenario 2 — Ubah Profesi**
1. Admin klik **Edit** pada baris profesi → form terisi data lama.
2. Ubah field yang perlu (mis. flag Punya Spesialisasi) → **SIMPAN**.
3. Sistem validasi keunikan & kategori.
4. Perubahan berlaku lintas modul; **perubahan flag** langsung memengaruhi ketersediaan profesi di Master Spesialisasi.

**Skenario 3 — Hapus Bersyarat**
1. Admin klik **Hapus** pada baris profesi.
2. **Gateway — Profesi sudah dipakai staf/spesialisasi?**
   * **Ya** → sistem **menolak** hapus permanen + pesan "masih dipakai {n} staf/spesialisasi"; tawarkan **nonaktifkan** (soft delete).
   * **Tidak** → konfirmasi → **hapus permanen**.

**Skenario 4 — Konsumsi oleh modul lain**
1. **Master Staf (A2)** memanggil `lookup?context=staff` → menampilkan **seluruh** profesi aktif (semua kategori) di dropdown input/edit staf.
2. **Master Spesialisasi (A23)** memanggil `lookup?context=specialization` → menampilkan **hanya** profesi aktif ber-flag "punya spesialisasi".
3. **Modul Integrasi / EMR** membaca **kode SNOMED CT** profesi tenaga kesehatan untuk pertukaran data klinis.

---

## Lampiran — Asumsi & Pertanyaan Terbuka

**Asumsi & Keputusan Desain**
* `[ASUMSI]` Modul A57 belum punya BPMN sendiri; alur diturunkan dari Main Flow dokumen sumber & pola master data referensi.
* Kategori distandarkan menjadi **3 nilai**: Tenaga Medis / Tenaga Kesehatan / Non-Kesehatan (single select).
* **Kode SNOMED ditempatkan di level profesi** (bukan hanya spesialisasi) agar nakes tanpa spesialisasi tetap memiliki kode standar.
* **Punya Spesialisasi** default **Tidak**; hanya yang **Ya** yang muncul di Master Spesialisasi (A23).
* **Hapus bersyarat** (per dokumen): hapus permanen hanya bila belum dipakai; profesi terpakai dipensiunkan via **nonaktivasi (soft delete)** — kolom `is_active`/`deleted_at` disiapkan untuk menjaga histori data staf.
* Pengisian kode SNOMED bersifat **manual** pada fase ini; sinkronisasi otomatis ke SNOMED CT International = Phase 2 / out of scope.

**Pertanyaan Terbuka**
* `[PERLU KONFIRMASI]` Daftar Concept ID SNOMED CT final per profesi — mengacu dropdown list pada dokumen `Master_Data_Profesi`.
* Field **Deskripsi** dipertahankan sebagai field **opsional** (tambahan di luar 5 field kanonik Data Requirement docx) untuk catatan bebas per profesi.
* `[PERLU KONFIRMASI]` Apakah profesi Non-Kesehatan boleh sama sekali tanpa kategori klinis, atau tetap perlu penanda unit kerja? (di luar cakupan master ini)
* Hak akses (role) mana yang boleh CRUD master Profesi? (relasi A53 RBAC)
