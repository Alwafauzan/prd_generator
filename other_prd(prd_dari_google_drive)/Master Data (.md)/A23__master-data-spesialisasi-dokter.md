# Product Requirement Document (PRD)
# A23 — Master Data Spesialisasi Dokter (New)

---

## 1. Metadata Dokumen

* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer Tamtech International
* **PIC**: Wening, Arif
* **Related Documents**:
  * A2 — Master Data Staf (konsumen dropdown spesialisasi saat input data praktisi)
  * A20 — Master Data Profesi (sumber dropdown Jenis Profesi; flag "Punya Spesialisasi")
  * Kepdirjen Dikti No. 163/E/KPT/2022 — Nama Program Studi Spesialis & Subspesialis (55 Spesialis + 221 Subspesialis)
  * [PERLU KONFIRMASI] Tabel kode spesialisasi BPJS Terminology V2 (untuk Phase 2 e-Klaim)
  * [PERLU KONFIRMASI] Daftar spesialisasi SMF RS (scope terpisah dari modul ini)
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-05-26 | 1.0 | Draft awal Master Data Spesialisasi Praktisi (manual) |
| 2026-06-30 | 1.1 | Refactor ke template PRD standar; tambah state machine, Business Rules, API spec, phasing BPJS |
| 2026-06-30 | 1.2 | Revisi: modul **tanpa UI end-user** — pengelolaan hanya via admin panel (Admin IT); update scope, role, framing fitur, dan workflow |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Spesialisasi Dokter (New)** menyimpan daftar spesialisasi (Spesialis & Subspesialis) yang digunakan RS. Nama spesialisasi **tidak diketik bebas** — Admin IT memilih dari dropdown yang mengacu pada **Kepdirjen Dikti No. 163/E/KPT/2022** (55 Spesialis + 221 Subspesialis) dan hanya mendaftarkan spesialisasi yang relevan untuk operasional RS-nya. Modul ini **tidak memiliki halaman UI khusus bagi end-user**; fungsi utamanya adalah menyediakan **sumber data dropdown** bagi **A2 — Master Data Staf** saat input data praktisi. Pengelolaan data dilakukan oleh Admin IT / Superadmin melalui panel konfigurasi admin.

Label **(New)** menandakan versi ulang modul lama yang belum memiliki acuan baku nama dan belum siap untuk integrasi BPJS Terminology V2. Versi baru ini dirancang dengan skema dua tabel terpisah (`specialties` + `subspecialties`) agar relasi induk–turunan terjaga dan pemetaan kode BPJS dapat ditambahkan di Phase 2.

> **[ASUMSI]** Scope modul ini adalah **Spesialisasi** (profesi klinis). **SMF (Satuan Medik Fungsional)** yang disebut dalam kode A23 akan ditangani dalam PRD terpisah karena entitasnya berbeda (SMF adalah unit organisasi RS, bukan gelar/jenjang profesi).

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Spesialisasi diketik bebas di setiap modul yang membutuhkan; tidak ada daftar baku terpusat.
- Nama tidak konsisten: "Sp.PD", "Spesialis Penyakit Dalam", "Internist" merujuk hal yang sama tetapi tersimpan berbeda.
- Tidak ada relasi Spesialis → Subspesialis; relasi dikelola secara implisit atau verbal.
- Pelaporan e-Klaim BPJS membutuhkan kode spesialisasi standar; tanpa master terpusat, kode dipetakan manual per transaksi — rawan salah kode.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin IT mendaftarkan spesialisasi yang dipakai RS dengan memilih dari dropdown baku Kepdirjen 163/2022 melalui panel admin.
- **Phase 1**: CRUD spesialisasi dengan cascading dropdown (Jenis Profesi → Nama Spesialis → Nama Subspesialis) di panel admin. API internal menyediakan dropdown ke Master Data Staf; modul Staf adalah satu-satunya surface yang diakses pengguna reguler.
- **Phase 2**: Setiap entri spesialisasi dipetakan ke kode BPJS Terminology V2 (kode spesialisasi e-Klaim). Pemetaan dilakukan oleh Admin melalui lookup atau input manual kode BPJS.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi nama spesialisasi | 100% nama spesialisasi berasal dari dropdown baku Kepdirjen 163/2022; 0 entri free-text |
| 2 | Akurasi relasi Spesialis–Subspesialis | 100% entri Subspesialis tertaut ke Spesialis induk yang benar |
| 3 | Kemudahan input | Admin dapat menambah 1 spesialisasi dalam ≤ 30 detik |
| 4 | Ketersediaan dropdown ke Master Staf | Dropdown spesialisasi di form Master Staf load ≤ 500ms |
| 5 | [Phase 2] Kesiapan BPJS | ≥ 90% spesialisasi aktif memiliki kode BPJS terisi sebelum go-live integrasi BPJS |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Integrasi BPJS Terminology V2) |
|---------------|---------------------|----------------------------------------------------|
| CRUD Spesialisasi (panel admin) | Tambah / edit / hapus (soft delete) via admin panel (akses Superadmin/Admin IT); tidak ada menu di navigasi utama SIMRS untuk pengguna reguler | — |
| Dropdown baku Kepdirjen 163/2022 | Form admin: pilih nama dari dropdown 55 Spesialis; Subspesialis dari dropdown 221 entri difilter by Spesialis induk | — |
| Cascading dropdown form admin | Jenis Profesi → Nama Spesialis → Nama Subspesialis (conditional) | — |
| List view panel admin | Tabel data Spesialis + Subspesialis di panel admin, dengan filter Kategori & Jenis Profesi | — |
| API dropdown ke Master Staf | `GET /api/v1/master/specialties` (dengan filter `profession_id` & `specialty_id`) — **satu-satunya** surface yang diakses pengguna reguler | Filter tambahan `?has_bpjs_code=true` |
| Gelar / inisial otomatis | Tersimpan di belakang layar, tidak ditampilkan di form/dashboard | — |
| Pemetaan kode BPJS | Kolom `bpjs_code` sudah ada di skema DB Phase 1 (nullable) | Input/lookup kode BPJS per entri; validasi ke BPJS Terminology V2 API |
| Soft delete bersyarat | Blokir hapus jika masih dipakai staf atau (Spesialis) masih punya Subspesialis | — |

**Out of Scope**:
- Halaman UI bagi pengguna reguler (staf, klinisi) untuk melihat atau mengelola data spesialisasi; akses hanya via panel admin (Superadmin/Admin IT).
- Pengetikan nama spesialisasi bebas (*free text*); nama **wajib** dari dropdown Kepdirjen 163/2022.
- Pengelolaan daftar baku Kepdirjen 163/2022 itu sendiri (di-seed sistem saat instalasi, tidak dapat diedit pengguna).
- Penetapan spesialisasi pada masing-masing staf (ditangani **A2 — Master Data Staf**).
- Pengelolaan STR / SIP / lisensi (ditangani modul Kredensial).
- Bulk import spesialisasi dari file Excel (tidak diperlukan; daftar terbatas, cukup CRUD manual).
- Pengelolaan SMF (Satuan Medik Fungsional) — scope terpisah.

---

## 5. Related Features

* **A2 — Master Data Staf**: Konsumen utama dropdown spesialisasi. Saat input data praktisi (dokter spesialis, dokter gigi spesialis, perawat spesialis), modul Staf memanggil `GET /api/v1/master/specialties?profession_id=` untuk mengisi dropdown "Spesialisasi" dan `GET /api/v1/master/subspecialties?specialty_id=` untuk dropdown "Subspesialisasi".
* **A20 — Master Data Profesi**: Sumber dropdown **Jenis Profesi** di form Spesialisasi. Flag `has_specialization = true` pada Master Profesi menentukan profesi mana yang boleh dipilih di form ini (saat ini: Dokter, Dokter Gigi, Perawat — Apoteker flagged `true` secara hukum namun daftar baku Kepdirjen belum tersedia).
* **Integrasi BPJS e-Klaim (Phase 2)**: Kode BPJS dari modul ini digunakan sebagai atribut wajib pada payload pengiriman data klaim BPJS untuk identifikasi spesialisasi praktisi.

---

## 6. Business Process & User Stories

### State Machine — Status Spesialisasi

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Spesialisasi terdaftar dan dapat dipilih | Muncul di list view panel admin; tersedia di API dropdown Master Staf | → `DIHAPUS` (bersyarat) | → `DIHAPUS` (bersyarat) |
| `DIHAPUS` | Soft delete — entri ditandai dihapus di database | **Tidak** muncul di panel admin maupun di API dropdown Master Staf; data staf historis yang merujuk entri ini **tetap utuh** | — (tidak bisa di-restore di Phase 1) | — |

> **[ASUMSI]** Tidak ada status `NONAKTIF` yang terpisah dari `DIHAPUS`. Jika Admin ingin menyembunyikan spesialisasi sementara tanpa menghapus, mekanisme ini perlu dikonfirmasi lebih lanjut — saat ini hanya ada soft delete. **[PERLU KONFIRMASI]**

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A23-01 | Admin IT | Melihat daftar seluruh spesialisasi yang sudah terdaftar via panel admin | Memantau dan mengaudit daftar spesialisasi aktif di RS |
| US-A23-02 | Admin IT | Menambah spesialisasi baru dengan memilih dari dropdown baku Kepdirjen | Mendaftarkan spesialisasi yang dipakai RS tanpa risiko typo atau inkonsistensi nama |
| US-A23-03 | Admin IT | Mengedit entri spesialisasi yang sudah ada (termasuk koreksi salah pilih) | Memperbaiki data yang salah tanpa perlu hapus dan buat ulang |
| US-A23-04 | Admin IT | Menghapus spesialisasi yang tidak terpakai (soft delete, bersyarat) | Membersihkan daftar tanpa kehilangan data historis staf |
| US-A23-05 | System / Master Staf | Mengambil daftar spesialisasi via API dengan filter Jenis Profesi dan Spesialis induk | Mengisi dropdown "Spesialisasi" dan "Subspesialisasi" di form input data praktisi |
| US-A23-06 | Admin IT | [Phase 2] Memetakan spesialisasi ke kode BPJS Terminology V2 | Memastikan klaim BPJS menggunakan kode spesialisasi standar yang valid |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Panel Admin — List Spesialisasi**

* **User Story**: Sebagai Admin IT, saya ingin melihat satu daftar gabungan seluruh spesialisasi (Spesialis & Subspesialis) yang sudah terdaftar beserta filter di panel admin, agar saya dapat memantau dan mengelola data spesialisasi RS dengan mudah.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Panel admin menampilkan satu tabel gabungan berisi seluruh entri Spesialis dan Subspesialis berstatus `AKTIF`, dengan kolom: Nama, Jenis Profesi, Kategori (Spesialis / Subspesialis).
    * **AC 2**: Kolom "Nama" menampilkan `name` subspesialis jika Kategori = Subspesialis, dan `name_id` spesialis jika Kategori = Spesialis.
    * **AC 3**: Panel admin menyediakan filter: Kategori (Spesialis / Subspesialis / Semua) dan Jenis Profesi.
    * **AC 4**: Panel admin menyediakan pencarian *by* Nama (contains, case-insensitive).
    * **AC 5**: Setiap baris memiliki aksi **Edit** dan **Hapus**.
    * **AC 6**: Tombol **+ Tambah** tersedia dan membuka form tambah.
    * **AC 7**: Route panel admin hanya dapat diakses oleh pengguna dengan role Superadmin atau Admin IT; pengguna reguler mendapat respons 403 jika mencoba mengakses langsung.

---

**Fitur: Tambah Spesialisasi**

* **User Story**: Sebagai Admin IT, saya ingin menambah spesialisasi baru dengan memilih nama dari dropdown baku Kepdirjen 163/2022 melalui panel admin, agar data spesialisasi RS konsisten dengan nomenklatur resmi.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form tambah menampilkan field: Kategori (radio: Spesialis / Subspesialis), Jenis Profesi (dropdown), Nama Spesialis (dropdown), dan — jika Kategori = Subspesialis — Nama Subspesialis (dropdown kondisional).
    * **AC 2**: Dropdown Nama Spesialis hanya menampilkan 55 entri dari daftar baku Kepdirjen 163/2022 yang sesuai dengan Jenis Profesi yang dipilih.
    * **AC 3**: Dropdown Nama Subspesialis hanya muncul jika Kategori = **Subspesialis**, dan hanya menampilkan 221 entri yang merupakan turunan dari Nama Spesialis yang dipilih di AC 2.
    * **AC 4**: Jika dropdown Nama Spesialis kosong untuk Jenis Profesi yang dipilih (mis. Apoteker — daftar baku belum tersedia), sistem menampilkan pesan informatif: *"Daftar spesialisasi untuk profesi ini belum tersedia dalam acuan baku. Hubungi admin sistem."* — bukan field kosong tanpa keterangan.
    * **AC 5**: Gelar / inisial otomatis terbawa dari entri Kepdirjen yang dipilih dan tersimpan di database tanpa ditampilkan di form.
    * **AC 6**: Sistem menolak penyimpanan jika kombinasi (Kategori + Nama Spesialis) sudah ada (duplikasi); untuk Subspesialis, cek kombinasi (Kategori + Nama Spesialis + Nama Subspesialis). Pesan error: *"Spesialisasi ini sudah terdaftar."*
    * **AC 7**: Setelah berhasil disimpan, entri langsung muncul di dashboard dan tersedia di API dropdown Master Staf.

* **Validasi**:

  **A. Wording Validasi (Frontend / API Response)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kategori | Radio button | Required; nilai: `SPESIALIS` \| `SUBSPESIALIS` | "Kategori wajib dipilih" | Menentukan apakah entri ini spesialis atau subspesialis |
  | Jenis Profesi | Dropdown | Required; nilai dari Master Profesi (flag `has_specialization=true`) | "Jenis profesi wajib dipilih" | Memfilter dropdown Nama Spesialis |
  | Nama Spesialis | Dropdown | Required; nilai dari daftar baku Kepdirjen (difilter by Jenis Profesi) | "Nama spesialis wajib dipilih" | Pilih dari 55 spesialisasi baku Kepdirjen 163/2022 |
  | Nama Subspesialis | Dropdown | Required jika Kategori = SUBSPESIALIS; nilai dari daftar baku Kepdirjen (difilter by Spesialis induk) | "Nama subspesialis wajib dipilih" | Muncul hanya jika Kategori = Subspesialis; pilih dari 221 entri yang merupakan turunan spesialis di atas |

---

**Fitur: Edit Spesialisasi**

* **User Story**: Sebagai Admin IT, saya ingin mengedit entri spesialisasi yang sudah ada — termasuk koreksi salah pilih Kategori, Jenis Profesi, atau Nama — agar data dapat diperbaiki tanpa perlu hapus dan buat ulang.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form edit pre-populated dengan data entri yang dipilih (Kategori, Jenis Profesi, Nama Spesialis, Nama Subspesialis jika ada).
    * **AC 2**: Seluruh field dapat diubah — Kategori, Jenis Profesi, Nama Spesialis, Nama Subspesialis. Tidak ada field yang dikunci setelah simpan pertama.
    * **AC 3**: Mengubah Kategori dari `SPESIALIS` → `SUBSPESIALIS` memunculkan field Nama Subspesialis; sebaliknya menyembunyikannya (dan menghapus nilai Nama Subspesialis yang sebelumnya dipilih).
    * **AC 4**: Mengubah Jenis Profesi mereset dropdown Nama Spesialis (nilai sebelumnya tidak lagi valid untuk profesi baru).
    * **AC 5**: Mengubah Nama Spesialis mereset dropdown Nama Subspesialis (filter berubah sesuai Spesialis baru).
    * **AC 6**: Validasi duplikasi tetap berlaku saat edit (kombinasi Kategori + Nama tidak boleh sama dengan entri lain); pengecualian untuk entri itu sendiri.
    * **AC 7**: Perubahan tersimpan dan langsung tercermin di dashboard dan API dropdown Master Staf.

* **Validasi**: Identik dengan form Tambah, dengan pengecualian duplikasi untuk entri sendiri (AC 6).

---

**Fitur: Hapus Spesialisasi (Soft Delete Bersyarat)**

* **User Story**: Sebagai Admin IT, saya ingin menghapus spesialisasi yang tidak terpakai tanpa kehilangan data historis staf, agar daftar di panel admin tetap bersih namun integritas data historis terjaga.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem memvalidasi dua kondisi sebelum mengeksekusi hapus:
        * **(a)** Entri **tidak boleh dihapus** jika masih dipakai oleh ≥ 1 staf aktif. Sistem menolak dengan pesan: *"Spesialisasi ini masih digunakan oleh X staf dan tidak dapat dihapus."*
        * **(b)** Entri Spesialis **tidak boleh dihapus** jika masih punya ≥ 1 Subspesialis aktif. Sistem menolak dengan pesan: *"Spesialis ini masih memiliki N subspesialis. Hapus subspesialis terlebih dahulu."*
    * **AC 2**: Jika lolos kedua validasi, sistem menampilkan dialog konfirmasi sebelum mengeksekusi hapus.
    * **AC 3**: Hapus dieksekusi sebagai **soft delete**: kolom `is_deleted = true`, `deleted_at`, dan `deleted_by` terisi; entri tidak benar-benar dihapus dari database.
    * **AC 4**: Entri yang dihapus **tidak muncul** di dashboard utama dan **tidak muncul** di dropdown API Master Staf.
    * **AC 5**: Data staf historis yang merujuk entri yang dihapus **tetap utuh dan tetap dapat ditampilkan** (nama spesialisasi yang sudah tersimpan di data staf tidak berubah).

---

**Fitur: API Dropdown Spesialisasi (untuk Master Staf)**

* **User Story**: Sebagai sistem (Master Data Staf), saya ingin mengambil daftar spesialisasi via API dengan filter Jenis Profesi dan Spesialis induk, agar dropdown "Spesialisasi" dan "Subspesialisasi" di form input praktisi dapat diisi secara dinamis dan terfilter dengan benar.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `GET /api/v1/master/specialties?profession_id={id}` mengembalikan seluruh entri Spesialis berstatus aktif (`is_deleted = false`) untuk profesi yang diminta, diurutkan berdasarkan `name_id` ASC.
    * **AC 2**: `GET /api/v1/master/subspecialties?specialty_id={id}` mengembalikan seluruh entri Subspesialis berstatus aktif yang merupakan turunan dari Spesialis tersebut, diurutkan `name ASC`.
    * **AC 3**: Respons JSON Spesialis menyertakan minimal: `id`, `name_id`, `name_en`, `code`, `gelar` (inisial).
    * **AC 4**: Respons JSON Subspesialis menyertakan minimal: `id`, `specialty_id`, `name`, `code`, `gelar`.
    * **AC 5**: Response time ≤ 500ms dalam kondisi normal.
    * **AC 6**: Entri dengan `is_deleted = true` tidak disertakan dalam respons manapun.

---

**Fitur: [Phase 2] Pemetaan Kode BPJS Terminology V2**

* **User Story**: Sebagai Admin IT, saya ingin memetakan setiap spesialisasi ke kode BPJS Terminology V2 melalui lookup atau input manual di panel admin, agar klaim BPJS yang melibatkan spesialisasi praktisi menggunakan kode standar yang valid.
* **Prioritas**: P1
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat membuka form edit spesialisasi dan mengisi kolom "Kode BPJS" secara manual atau melalui tombol "Lookup BPJS".
    * **AC 2**: Fitur "Lookup BPJS" memanggil BPJS Terminology V2 API, menampilkan kandidat kode yang cocok berdasarkan nama spesialisasi, dan memungkinkan Admin memilih satu kode untuk dipetakan.
    * **AC 3**: Entri yang sudah memiliki kode BPJS ditandai badge "Mapped" di list view; yang belum bertanda "Unmapped".
    * **AC 4**: Sistem menolak kode BPJS duplikat (satu kode BPJS hanya boleh dipetakan ke satu entri spesialisasi).
    * **AC 5**: Jika BPJS API tidak dapat dijangkau, Admin masih dapat mengisi kode BPJS secara manual.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

#### Table: `specialties` (Spesialis)

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` | — |
| `profession_id` | SMALLINT | NOT NULL, FK → `professions(id)` | Jenis profesi (Dokter, Dokter Gigi, Perawat) |
| `name_id` | VARCHAR(255) | NOT NULL | Nama spesialisasi dalam Bahasa Indonesia (dari Kepdirjen 163/2022) |
| `name_en` | VARCHAR(255) | NULLABLE | Nama dalam Bahasa Inggris (opsional) |
| `code` | VARCHAR(50) | NULLABLE, UNIQUE | Kode singkat spesialisasi |
| `gelar` | VARCHAR(50) | NULLABLE | Inisial/gelar otomatis dari Kepdirjen (mis. "Sp.PD"); tidak ditampilkan di UI |
| `bpjs_code` | VARCHAR(50) | NULLABLE | Kode BPJS Terminology V2; nullable di Phase 1, diisi di Phase 2 |
| `is_deleted` | BOOLEAN | NOT NULL, default `false` | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |
| `created_by` | VARCHAR(255) | NOT NULL | — |
| `updated_at` | TIMESTAMPTZ | NULLABLE | — |
| `updated_by` | VARCHAR(255) | NULLABLE | — |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Terisi saat soft delete |
| `deleted_by` | VARCHAR(255) | NULLABLE | Terisi saat soft delete |

**Unique constraint**: `(profession_id, name_id)` WHERE `is_deleted = false` — cegah duplikasi nama per profesi pada entri aktif.

#### Table: `subspecialties` (Subspesialis)

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` | — |
| `specialty_id` | UUID | NOT NULL, FK → `specialties(id)` | Spesialis induk |
| `name` | VARCHAR(255) | NOT NULL | Nama subspesialisasi (dari Kepdirjen 163/2022) |
| `code` | VARCHAR(50) | NULLABLE | Kode singkat; UNIQUE per `specialty_id` (composite unique) |
| `gelar` | VARCHAR(50) | NULLABLE | Inisial/gelar otomatis; tidak ditampilkan di UI |
| `bpjs_code` | VARCHAR(50) | NULLABLE | Kode BPJS Terminology V2; nullable di Phase 1 |
| `is_deleted` | BOOLEAN | NOT NULL, default `false` | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |
| `created_by` | VARCHAR(255) | NOT NULL | — |
| `updated_at` | TIMESTAMPTZ | NULLABLE | — |
| `updated_by` | VARCHAR(255) | NULLABLE | — |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | — |
| `deleted_by` | VARCHAR(255) | NULLABLE | — |

**Unique constraint**: `(specialty_id, name)` WHERE `is_deleted = false` — cegah duplikasi nama subspesialis dalam satu spesialis induk.

> **Catatan**: Kolom `bpjs_code` disertakan sejak Phase 1 di kedua tabel agar skema siap untuk integrasi BPJS di Phase 2 tanpa migrasi merusak. Di Phase 1, kolom nullable dan tidak diekspos di form.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/master/specialties` | List spesialisasi aktif; `?profession_id=` filter by profesi; `?include_deleted=true` untuk admin |
| GET | `/api/v1/master/specialties/{id}` | Detail satu spesialisasi |
| POST | `/api/v1/master/specialties` | Tambah spesialisasi baru (Spesialis) |
| PUT | `/api/v1/master/specialties/{id}` | Edit spesialisasi |
| DELETE | `/api/v1/master/specialties/{id}` | Soft delete spesialisasi (bersyarat) |
| GET | `/api/v1/master/subspecialties` | List subspesialisasi aktif; `?specialty_id=` filter by induk |
| GET | `/api/v1/master/subspecialties/{id}` | Detail satu subspesialisasi |
| POST | `/api/v1/master/subspecialties` | Tambah subspesialisasi baru |
| PUT | `/api/v1/master/subspecialties/{id}` | Edit subspesialisasi |
| DELETE | `/api/v1/master/subspecialties/{id}` | Soft delete subspesialisasi (bersyarat) |
| GET | `/api/v1/master/specialties/bpjs-lookup?q={keyword}` | [Phase 2] Proxy lookup ke BPJS Terminology V2 API |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `kategori` | Kategori | Radio button | Ya | Required; nilai: `SPESIALIS` \| `SUBSPESIALIS` | Input admin | Menentukan visibilitas field Nama Subspesialis |
| `profession_id` | Jenis Profesi | Dropdown | Ya | Required; hanya profesi dengan `has_specialization = true` | Master Profesi (`/api/v1/master/professions?has_specialization=true`) | Memfilter dropdown Nama Spesialis; mengubah nilai ini mereset Nama Spesialis dan Subspesialis |
| `specialty_name` | Nama Spesialis | Dropdown | Ya | Required; nilai dari seed Kepdirjen 163/2022 difilter by `profession_id` | Seed data Kepdirjen (hardcoded/seeded, tidak diedit user) | Jika kosong untuk profesi terpilih → tampilkan pesan informatif (lihat AC 4 Fitur Tambah) |
| `subspecialty_name` | Nama Subspesialis | Dropdown | Kondisional | Required jika Kategori = SUBSPESIALIS; nilai dari seed Kepdirjen difilter by Spesialis induk | Seed data Kepdirjen | Hanya tampil jika Kategori = SUBSPESIALIS; mengubah Nama Spesialis mereset field ini |
| `gelar` | — | — | — | — | Otomatis dari seed Kepdirjen | Tidak diekspos di form; tersimpan di belakang layar |
| `bpjs_code` | Kode BPJS | Text | Tidak (Phase 1) | Max 50 karakter; Unik jika diisi | Input admin atau hasil lookup | Tidak diekspos di form Phase 1 |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nama | `name_id` (Spesialis) atau `name` (Subspesialis) | Plain text | Sort ASC/DESC; Search (contains) | Tampilkan nama subspesialis jika Kategori = Subspesialis |
| Jenis Profesi | `profession.name` | Plain text | Filter: Semua / Dokter / Dokter Gigi / Perawat | — |
| Kategori | `kategori` | Badge: "Spesialis" (biru) / "Subspesialis" (ungu) | Filter: Semua / Spesialis / Subspesialis | — |
| Kode BPJS | `bpjs_code` | Badge "Mapped" / "Unmapped" | Filter: Mapped / Unmapped (Phase 2) | Kolom ini tampil di Phase 2 |
| Aksi | — | Tombol Edit, Hapus | — | Hapus dinonaktifkan jika entri masih dipakai staf atau (Spesialis) masih punya subspesialis |

**Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A23-01 | Nama spesialisasi **wajib dipilih dari dropdown** seed Kepdirjen 163/2022; input free text tidak diizinkan. |
| BR-A23-02 | Dropdown Nama Spesialis difilter berdasarkan `profession_id`; mengubah Jenis Profesi mereset pilihan Nama Spesialis dan Nama Subspesialis. |
| BR-A23-03 | Dropdown Nama Subspesialis hanya muncul jika Kategori = `SUBSPESIALIS` dan hanya menampilkan entri Kepdirjen yang merupakan turunan dari Spesialis yang dipilih. |
| BR-A23-04 | Jika daftar baku Kepdirjen untuk Jenis Profesi tertentu belum tersedia (mis. Apoteker), dropdown kosong dan sistem menampilkan pesan informatif — bukan error. |
| BR-A23-05 | Gelar/inisial spesialisasi otomatis terbawa dari seed Kepdirjen dan tersimpan di database. Tidak ditampilkan di form maupun dashboard admin; digunakan oleh Master Staf untuk pembentukan gelar lengkap praktisi. |
| BR-A23-06 | Duplikasi dicegah: kombinasi `(profession_id, name_id)` untuk Spesialis dan `(specialty_id, name)` untuk Subspesialis harus unik pada entri aktif (`is_deleted = false`). |
| BR-A23-07 | Hapus bersifat **soft delete**: entri ditandai `is_deleted = true` beserta `deleted_at` dan `deleted_by`; tidak ada hard delete. |
| BR-A23-08 | Hapus Spesialis **diblokir** jika entri masih memiliki ≥ 1 Subspesialis aktif (`is_deleted = false`). Admin harus menghapus Subspesialis terlebih dahulu. |
| BR-A23-09 | Hapus Spesialis atau Subspesialis **diblokir** jika entri masih direferensikan oleh ≥ 1 staf aktif. |
| BR-A23-10 | Entri dengan `is_deleted = true` tidak dikembalikan oleh API manapun kecuali request admin dengan parameter `?include_deleted=true`. |
| BR-A23-11 | [Phase 2] Kode BPJS (`bpjs_code`) unik per tabel jika terisi; satu kode BPJS tidak boleh dipetakan ke lebih dari satu entri spesialisasi. |

---

## 9. Workflow / BPMN Interpretation

> **[ASUMSI]** Tidak ada BPMN Lucidchart tersedia untuk modul ini. Alur berdasarkan analisis draft PRD manual dan konvensi operasional RS.

**Alur Tambah Spesialisasi (Admin IT — via Panel Admin):**

1. Admin IT login ke SIMRS dan mengakses panel admin (route `/admin/master/specialties`).
2. Panel admin menampilkan 1 list gabungan Spesialis + Subspesialis berstatus aktif.
3. Admin IT klik **+ Tambah** → form overlay muncul.
4. Admin IT pilih **Kategori** (radio: Spesialis / Subspesialis).
5. Admin IT pilih **Jenis Profesi** dari dropdown → sistem memfilter dropdown Nama Spesialis.
6. Admin IT pilih **Nama Spesialis** dari dropdown (seed Kepdirjen 163/2022, difilter by Jenis Profesi).
   - Jika profesi belum punya daftar baku → pesan informatif tampil.
7. Jika Kategori = **Subspesialis**: Admin IT pilih **Nama Subspesialis** dari dropdown (seed Kepdirjen, difilter by Spesialis induk).
8. Admin IT klik **Simpan** → sistem validasi duplikasi → jika lolos, entri tersimpan dengan gelar otomatis.
9. Entri langsung tersedia di API `GET /api/v1/master/specialties` yang dikonsumsi Master Staf.

**Alur Hapus Spesialisasi (Admin IT — Soft Delete Bersyarat):**

1. Admin IT klik **Hapus** pada baris entri di panel admin.
2. Sistem memvalidasi:
   - Entri Spesialis: apakah masih punya Subspesialis aktif? → jika ya, **blokir** dengan pesan.
   - Entri Spesialis/Subspesialis: apakah masih dipakai oleh staf aktif? → jika ya, **blokir** dengan pesan.
3. Jika lolos validasi: dialog konfirmasi tampil.
4. Admin IT konfirmasi → sistem eksekusi soft delete (`is_deleted = true`, isi `deleted_at`, `deleted_by`).
5. Entri hilang dari panel admin dan dari respons API Master Staf; data staf historis tetap utuh.

**Alur Konsumsi oleh Master Staf (Otomatis):**

1. Form input data staf (praktisi) dimuat → memanggil `GET /api/v1/master/specialties?profession_id={id}` untuk dropdown "Spesialisasi".
2. Admin Staf pilih Spesialisasi → form Master Staf memanggil `GET /api/v1/master/subspecialties?specialty_id={id}` untuk dropdown "Subspesialisasi" (jika diperlukan).
3. Admin Staf pilih Subspesialisasi → `specialty_id` dan/atau `subspecialty_id` tersimpan di record staf.
