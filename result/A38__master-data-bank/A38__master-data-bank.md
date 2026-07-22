# Product Requirement Document (PRD)
# A38 — Master Data Bank

> Catatan lingkup: PRD ini disusun **tanpa spesifikasi UI** (tanpa tabel Wording Validasi Frontend, State Design, dan diagram alur layar). Fokus dokumen: proses bisnis, data, business rules, skema database, dan endpoint API. Spesifikasi tampilan/UX diserahkan ke fase desain terpisah.

---

## 1. Metadata Dokumen

* **Approval**: [Nama Kepala Bidang Keuangan / Manajer IT, Jabatan, Tanggal]
* **Related Documents**:
  * A7 — Master Data Supplier (konsumen `bank_id` untuk rekening supplier)
  * [PERLU KONFIRMASI] SOP Pembayaran & Rekonsiliasi Bank RS
  * [PERLU KONFIRMASI] Daftar Sandi Bank Peserta Kliring Bank Indonesia (BI-RTGS/SKNBI)
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-01 | 1.0 | Draft awal PRD Master Data Bank (referensi lookup lintas modul keuangan) — tanpa spesifikasi UI |

---

## 2. Overview & Background

* **Overview/Brief Summary**: Modul **Master Data Bank** menyediakan repositori terpusat daftar bank (contoh: BCA, BNI, BRI, Mandiri, bank daerah, dsb.) yang digunakan sebagai **data referensi (lookup)** di seluruh proses keuangan RS: pencatatan rekening supplier (A7), rekening penerimaan/pembayaran RS, pengembalian dana (refund) pasien, serta rekonsiliasi transaksi non-tunai. Modul ini murni **master data referensi** — tidak menyimpan saldo, mutasi, atau transaksi. Cakupan Phase 1 adalah CRUD dasar tanpa approval berjenjang; arsitektur data dirancang siap untuk maker-checker (approval) di Phase 2.

* **Business Process (As-Is vs To-Be)**:

  * **As-Is**: Nama bank diketik bebas (free-text) di berbagai form (rekening supplier, form refund, form pembayaran) atau disimpan di spreadsheet per unit. Akibatnya: penulisan tidak konsisten ("Bank BCA", "B.C.A", "Bank Central Asia"), sulit di-*filter*/agregasi untuk pelaporan keuangan, dan rawan salah pilih bank saat transfer. Tidak ada kode bank (sandi kliring) standar yang tercatat sehingga proses transfer/kliring dan rekonsiliasi bank dilakukan manual. Tidak ada satu sumber kebenaran daftar bank yang dipakai lintas modul.

  * **To-Be**: Admin Keuangan/Backoffice mengelola daftar bank standar (kode, nama, sandi kliring BI, SWIFT/BIC) melalui CRUD di modul ini. Setiap bank memiliki `id` unik dan `kode_bank` unik. Modul lain (A7 Supplier, refund pasien, pembayaran) **memilih bank via dropdown lookup** dari master ini alih-alih mengetik bebas → data konsisten, akurat, dan dapat diagregasi. Status bank langsung `AKTIF` saat disimpan dan dapat dinonaktifkan (bukan dihapus) dari Dashboard bila bank sudah tidak dipakai, tanpa merusak referensi historis. **Phase 2**: penambahan/perubahan data bank melalui alur approval maker-checker; opsi impor daftar sandi bank BI secara batch.

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Standardisasi referensi bank | 100% modul keuangan (A7, refund, pembayaran) memakai lookup master bank; 0 field bank free-text baru |
| 2 | Konsistensi data | 0 duplikat bank (berdasarkan `kode_bank` unik) |
| 3 | Kelengkapan data kliring | ≥ 95% bank aktif memiliki `kode_bank` (sandi kliring BI) terisi |
| 4 | Akurasi transfer | Insiden salah nama/kode bank pada pembayaran turun ke 0 [ASUMSI baseline] |
| 5 | Ketersediaan data via API | Endpoint `GET /api/v1/master/banks` uptime ≥ 99,5% dan response ≤ 200ms untuk full-list |

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| CRUD data bank | Tambah / edit / nonaktifkan bank (kode, nama, sandi kliring, SWIFT); status auto-AKTIF | — |
| Toggle status | Aktif / Nonaktif dari Dashboard (soft delete) | — |
| Validasi keunikan | `kode_bank` unik; nama tidak boleh duplikat aktif | — |
| API lookup | `GET /api/v1/master/banks` dikonsumsi A7 & modul pembayaran | — |
| Approval data | Perubahan langsung efektif (single-user) | Maker-checker: usulan tambah/ubah → status `PENDING_APPROVAL` → disetujui checker → `AKTIF` |
| Impor batch | Input manual satu per satu | Impor daftar sandi bank BI via CSV |
| Audit trail | Log dasar (created_by, updated_by, timestamp) | Audit trail lengkap dengan diff nilai lama→baru |

**Out of Scope**:
- Penyimpanan **rekening bank** (nomor rekening, atas nama) — itu milik modul konsumen (A7 Supplier menyimpan `bank_id` + `nomor_rekening` di entitasnya sendiri; rekening RS di modul Keuangan).
- Saldo, mutasi, atau transaksi bank (bukan modul core banking).
- Integrasi payment gateway / host-to-host bank (di luar cakupan master data).
- Manajemen cabang bank (branch) — Phase 1 hanya level bank; [PERLU KONFIRMASI] apakah level cabang diperlukan.

---

## 5. Related Features

* **A7 — Master Data Supplier** *(Consumer / Backoffice Administrasi)*
  A7 menyimpan rekening bank supplier dengan `bank_id` sebagai **foreign key** ke master ini (lihat kamus `_shared/dictionary.json`: `bank_id` → *"dari master Bank (A38)"*). A7 mengonsumsi `GET /api/v1/master/banks?status=AKTIF` untuk mengisi dropdown pilihan bank pada form rekening supplier. Master Bank bersifat read-only bagi A7; tidak ada write-back. Bank yang di-nonaktifkan di A38 **tidak** menghapus referensi historis di A7 (data supplier lama tetap valid).
* **Modul Keuangan / Pembayaran & Refund Pasien** *(Consumer — [ASUMSI], modul belum berkode dalam scope ini)*
  Mengonsumsi master bank untuk pemilihan bank tujuan transfer pada pengembalian dana pasien dan pembayaran supplier.

---

## 6. Business Process & User Stories

* **State Machine Table**:

| Status | Deskripsi | Efek Referensi (Lookup) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-------------------------|--------------------|--------------------|
| `AKTIF` | Bank aktif, dapat dipilih di modul konsumen | Muncul di dropdown lookup modul lain | → `NONAKTIF` (nonaktifkan via toggle Dashboard) | → `NONAKTIF`; perubahan data → `PENDING_APPROVAL` |
| `NONAKTIF` | Bank tidak dipakai lagi (soft delete) | Tidak muncul di dropdown baru; referensi historis tetap utuh | → `AKTIF` (aktifkan kembali) | → `AKTIF` |
| `PENDING_APPROVAL` | [Phase 2] Usulan tambah/ubah menunggu persetujuan checker | Belum aktif sebagai referensi | — | → `AKTIF` (disetujui) / kembali ke draft (ditolak) |

> **[ASUMSI]** Phase 1: setiap entri baru otomatis disimpan dengan status `AKTIF` (tanpa input status di form create). Pengelolaan aktif/nonaktif dilakukan di level Dashboard (toggle). Status `PENDING_APPROVAL` hanya berlaku di Phase 2 ketika alur maker-checker diaktifkan.

* **User Stories Utama**:

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A38-01 | Admin Keuangan/Backoffice | Menambah data bank baru | Agar daftar bank standar tersedia sebagai referensi lintas modul keuangan |
| US-A38-02 | Admin Keuangan/Backoffice | Mengedit data bank (nama, sandi kliring, SWIFT) | Agar informasi bank tetap akurat dan sesuai standar BI |
| US-A38-03 | Admin Keuangan/Backoffice | Menonaktifkan / mengaktifkan bank dari Dashboard | Agar bank yang tidak dipakai tidak muncul di pilihan baru tanpa merusak data historis |
| US-A38-04 | Admin Keuangan/Backoffice | Melihat & mencari daftar bank dengan filter status | Agar mudah memverifikasi kelengkapan dan menghindari duplikasi |
| US-A38-05 | Sistem (A7 Supplier / modul pembayaran) | Mengambil daftar bank aktif via API | Agar dropdown pemilihan bank konsisten dengan satu sumber kebenaran |
| US-A38-06 | [Phase 2] Checker Keuangan | Menyetujui/menolak usulan tambah/ubah bank | Agar perubahan data referensi keuangan terkontrol (maker-checker) |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

> Acceptance Criteria dirumuskan pada level fungsional/backend (data, validasi server, API) agar testable tanpa terikat implementasi UI.

---

**Fitur: Tambah Bank**
* **User Story**: Sebagai Admin Keuangan, saya ingin menambahkan data bank baru agar tersedia sebagai referensi standar di modul keuangan.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Data yang wajib: `kode_bank` (kode/sandi kliring BI, wajib, unik), `nama_bank` (wajib). Opsional: `swift_code` (BIC), `alias` (singkatan umum, mis. "BCA"), `keterangan`. **Tidak ada input status** — sistem menyimpan dengan `status = AKTIF`.
  * **AC 2**: Sistem menolak simpan bila `kode_bank` sudah ada (case-insensitive, trim) → error `409 Conflict` dengan pesan *"Kode bank [kode] sudah terdaftar: [nama_bank]."*
  * **AC 3**: Sistem menolak simpan bila `nama_bank` identik dengan bank berstatus `AKTIF` lain → error validasi duplikat.
  * **AC 4**: `swift_code`, bila diisi, divalidasi format BIC (8 atau 11 karakter alfanumerik) di sisi server; bila tidak valid → `422 Unprocessable Entity`.
  * **AC 5**: Setelah berhasil, entri langsung tersedia via `GET /api/v1/master/banks?status=AKTIF`; log mencatat `created_by` dan `created_at` (waktu server).

---

**Fitur: Edit Bank**
* **User Story**: Sebagai Admin Keuangan, saya ingin mengubah data bank yang sudah tercatat agar informasi tetap akurat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Field yang dapat diubah: `nama_bank`, `alias`, `swift_code`, `keterangan`, dan `kode_bank`. Perubahan `kode_bank` tetap tunduk pada aturan keunikan (AC 2 fitur Tambah).
  * **AC 2**: Sistem memperbarui `updated_by` dan `updated_at` pada setiap perubahan. `status` tidak berubah akibat aksi edit.
  * **AC 3**: Perubahan `nama_bank`/`kode_bank` **tidak** mengubah referensi historis di modul konsumen — konsumen menyimpan `bank_id` (FK), sehingga rename bank otomatis konsisten ke semua referensi.
  * **AC 4**: Bila tidak ada perubahan nilai (dirty check di server), request boleh di-*no-op* dan tidak memperbarui `updated_at`.

---

**Fitur: Toggle Aktif / Nonaktif (Soft Delete)**
* **User Story**: Sebagai Admin Keuangan, saya ingin menonaktifkan bank yang tidak dipakai lagi agar tidak muncul di pilihan baru tanpa menghapus data historis.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: `PATCH .../status` mengubah `status` `AKTIF` ↔ `NONAKTIF` dan menyetel `is_active` sesuai.
  * **AC 2**: Bank berstatus `NONAKTIF` **tidak** dikembalikan pada `GET .../banks?status=AKTIF`, sehingga tidak muncul di dropdown lookup modul konsumen.
  * **AC 3**: Menonaktifkan bank **tidak** memvalidasi/menghapus referensi yang sudah ada di modul konsumen (data lama tetap menampilkan nama bank via FK). 
  * **AC 4**: [PERLU KONFIRMASI] Saat menonaktifkan bank yang masih dirujuk oleh minimal 1 supplier aktif (A7), sistem menampilkan peringatan informatif (bukan blokir) berisi jumlah referensi terkait.
  * **AC 5**: Setiap toggle memperbarui `updated_by` dan `updated_at`.

---

**Fitur: Hapus Bank (Hard Delete — terbatas)**
* **User Story**: Sebagai Admin Keuangan, saya ingin menghapus permanen entri bank yang salah input agar data tetap bersih.
* **Prioritas**: P2
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Hard delete hanya diizinkan bila bank berstatus `NONAKTIF` **dan** tidak memiliki referensi (`bank_id`) di modul manapun. Bila masih dirujuk → tolak dengan `409 Conflict`.
  * **AC 2**: Bank berstatus `AKTIF` tidak dapat dihapus — harus dinonaktifkan lebih dulu.
  * **AC 3**: Untuk data yang sudah pernah dipakai, mekanisme standar adalah **soft delete** (nonaktif), bukan hard delete.

---

**Fitur: Daftar & Pencarian Bank**
* **User Story**: Sebagai Admin Keuangan, saya ingin melihat dan mencari daftar bank agar mudah memverifikasi kelengkapan dan menghindari duplikasi.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: `GET .../banks` mendukung query: `status` (default semua), `q` (search pada `nama_bank`, `alias`, `kode_bank`), `page`, `limit`, `sort`.
  * **AC 2**: Default urutan berdasarkan `nama_bank` ascending.
  * **AC 3**: Response menyertakan total data untuk kebutuhan pagination.

---

**Fitur: Approval Maker-Checker** *(Phase 2)*
* **User Story**: Sebagai Checker Keuangan, saya ingin menyetujui/menolak usulan penambahan atau perubahan data bank agar perubahan referensi keuangan terkontrol.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Usulan (maker) tersimpan dengan `status = PENDING_APPROVAL`; belum muncul sebagai referensi aktif.
  * **AC 2**: Checker berbeda dari maker (segregation of duties) — sistem menolak self-approval.
  * **AC 3**: Persetujuan mengubah `status` menjadi `AKTIF` dan mencatat `approved_by`, `approved_at`. Penolakan mencatat alasan dan mengembalikan usulan ke maker.
  * **AC 4**: Seluruh transisi approval tercatat di audit trail (nilai lama → baru).

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `bank_master`
* **Key Columns**:
  * `id`: UUID (Primary Key)
  * `kode_bank`: VARCHAR(10) NOT NULL UNIQUE — sandi kliring BI (contoh: `014` = BCA, `008` = Mandiri)
  * `nama_bank`: VARCHAR(150) NOT NULL — nama resmi bank
  * `alias`: VARCHAR(30) (nullable) — singkatan umum (contoh: "BCA", "BRI")
  * `swift_code`: VARCHAR(11) (nullable) — kode BIC/SWIFT, format 8/11 karakter
  * `keterangan`: VARCHAR(255) (nullable)
  * `status`: ENUM('AKTIF', 'NONAKTIF', 'PENDING_APPROVAL') NOT NULL DEFAULT 'AKTIF'
  * `is_active`: BOOLEAN NOT NULL DEFAULT true — flag cepat untuk filter (false = NONAKTIF)
  * `created_by`: VARCHAR(100) NOT NULL
  * `created_at`: TIMESTAMP NOT NULL DEFAULT now()
  * `updated_by`: VARCHAR(100) (nullable)
  * `updated_at`: TIMESTAMP (nullable)
  * `approved_by`: VARCHAR(100) (nullable) — [Phase 2] pengisi saat approval
  * `approved_at`: TIMESTAMP (nullable) — [Phase 2]
* **Constraint / Index**:
  * `UNIQUE (kode_bank)` — cegah duplikat kode bank.
  * `idx_bank_nama` ON (`nama_bank`) — pencarian & pengurutan.
  * Partial index / filter pada `is_active = true` untuk query lookup cepat.
* **Catatan desain Phase 2**: kolom `status` (dengan nilai `PENDING_APPROVAL`), `approved_by`, `approved_at` sudah disiapkan sejak Phase 1 agar alur approval maker-checker dapat ditambahkan tanpa migrasi struktural besar.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/master/banks` | List data (query: `status`, `q`, `page`, `limit`, `sort`) |
| GET    | `/api/v1/master/banks/{id}` | Get detail satu bank |
| POST   | `/api/v1/master/banks` | Create data (status auto = AKTIF) |
| PUT    | `/api/v1/master/banks/{id}` | Update `nama_bank`, `alias`, `swift_code`, `kode_bank`, `keterangan` |
| PATCH  | `/api/v1/master/banks/{id}/status` | Toggle Aktif / Nonaktif |
| DELETE | `/api/v1/master/banks/{id}` | Hard delete (hanya NONAKTIF & tanpa referensi) |
| POST   | `/api/v1/master/banks/import` | [Phase 2] Impor batch daftar sandi bank via CSV |
| POST   | `/api/v1/master/banks/{id}/approve` | [Phase 2] Approve usulan (checker) |
| POST   | `/api/v1/master/banks/{id}/reject` | [Phase 2] Reject usulan + alasan |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Field Entitas (CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `id` | — | UUID | Auto | Auto-generate | Sistem | Primary key, tidak diinput user |
| `kode_bank` | Kode Bank | String(10) | Ya | Unik (case-insensitive, trim); numerik/alfanumerik | Input admin / daftar BI | Sandi kliring BI; contoh `014`, `008`, `009` |
| `nama_bank` | Nama Bank | String(150) | Ya | Tidak boleh kosong; tidak duplikat dgn AKTIF lain | Input admin | Nama resmi (contoh: "Bank Central Asia") |
| `alias` | Singkatan | String(30) | Tidak | Maks 30 karakter | Input admin | Contoh: "BCA" |
| `swift_code` | Kode SWIFT/BIC | String(11) | Tidak | Format BIC 8/11 karakter alfanumerik | Input admin | Contoh: `CENAIDJA` (BCA) |
| `keterangan` | Keterangan | String(255) | Tidak | Maks 255 karakter | Input admin | Opsional |
| `status` | — | Enum | Auto | Set `AKTIF` saat create; ubah via toggle | Sistem | Tidak ada input status di create |
| `is_active` | — | Boolean | Auto | Sinkron dengan `status` | Sistem | Filter cepat |
| `created_by` / `created_at` | — | String / Timestamp | Auto | Username login / waktu server | Sistem | Log audit |
| `updated_by` / `updated_at` | — | String / Timestamp | Auto | Diisi saat edit / toggle | Sistem | Log audit |
| `approved_by` / `approved_at` | — | String / Timestamp | Auto | [Phase 2] diisi saat approval | Sistem | Null di Phase 1 |

#### 8.3.2 Spesifikasi Data — Atribut Daftar (List Payload)

> Bukan spesifikasi UI; ini atribut yang dikembalikan API list dan dapat dipakai konsumen untuk menampilkan/mengurutkan.

| Atribut | Sumber Data | Format | Filter / Sort | Catatan |
|---------|-------------|--------|---------------|---------|
| `kode_bank` | `kode_bank` | String | Search, Sort | Identitas kliring |
| `nama_bank` | `nama_bank` | String | Search, Sort (default asc) | — |
| `alias` | `alias` | String | Search | "–" bila kosong |
| `swift_code` | `swift_code` | String | — | "–" bila kosong |
| `status` | `status` | AKTIF / NONAKTIF / PENDING_APPROVAL | Filter | — |

* **Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A38-01 | `kode_bank` bersifat **unik** lintas seluruh data (termasuk NONAKTIF). Perbandingan dilakukan case-insensitive dan trim. |
| BR-A38-02 | `nama_bank` tidak boleh duplikat dengan bank berstatus `AKTIF` lain. Duplikasi dengan entri `NONAKTIF` diperbolehkan. |
| BR-A38-03 | Modul konsumen (A7 Supplier, pembayaran, refund) menyimpan **`bank_id` (FK)**, bukan teks nama bank — sehingga rename di A38 otomatis konsisten dan tidak merusak referensi historis. |
| BR-A38-04 | Bank yang sudah pernah dipakai **tidak** dihapus permanen; gunakan **soft delete** (nonaktif). Hard delete hanya untuk entri NONAKTIF tanpa referensi (salah input). |
| BR-A38-05 | Status selalu diset `AKTIF` oleh sistem saat create. Tidak ada input status di form create; pengelolaan aktif/nonaktif via Dashboard (toggle). |
| BR-A38-06 | `swift_code` opsional; bila diisi harus valid format BIC (8 atau 11 karakter). Bank lokal yang tidak melayani transaksi internasional boleh mengosongkannya. |
| BR-A38-07 | Modul ini **tidak** menyimpan nomor rekening/atas nama — itu tanggung jawab modul konsumen. A38 hanya master identitas bank. |
| BR-A38-08 | [Phase 2] Perubahan data bank harus melalui maker-checker; checker ≠ maker (segregation of duties). |
| BR-A38-09 | [PERLU KONFIRMASI] Apakah data bank perlu granularitas hingga **cabang** (branch code) untuk kebutuhan kliring, atau cukup level bank. |

---

## 9. Workflow / BPMN Interpretation

> [ASUMSI] Tidak tersedia file BPMN spesifik untuk modul ini. Alur berikut disusun berdasarkan pola Master Data referensi umum (analogi A7 Supplier / A34 Hari Libur) dan kebutuhan fungsional.

**Alur Phase 1 — Kelola & Konsumsi Master Bank**

```
[Admin Keuangan / Backoffice]
  │
  ├─ Buka Master Data Bank
  ├─ Tambah Bank → isi (kode_bank, nama_bank, alias, swift_code)
  │    ├─ [Validasi GAGAL: kode duplikat / nama duplikat aktif / SWIFT invalid] → tolak + pesan error
  │    └─ [Validasi OK] → simpan; sistem auto-set status = AKTIF
  │         └─ Bank langsung tersedia via GET /api/v1/master/banks?status=AKTIF
  │
  ├─ Edit Bank → ubah nama/alias/SWIFT/kode → update updated_by/at (status tetap)
  ├─ Dashboard → Nonaktifkan (soft delete) → status = NONAKTIF → hilang dari lookup baru
  └─ Dashboard → Aktifkan kembali → status = AKTIF

[Modul Konsumen: A7 Supplier / Pembayaran / Refund]
  └─ GET /api/v1/master/banks?status=AKTIF
       └─ Render dropdown pilihan bank → simpan bank_id (FK) di entitas masing-masing
```

**Alur Phase 2 — Maker-Checker**

```
[Maker]  usul tambah/ubah bank → status = PENDING_APPROVAL (belum jadi referensi aktif)
[Checker] (≠ maker) review
    ├─ Approve → status = AKTIF; catat approved_by/at; masuk audit trail
    └─ Reject  → kembali ke maker + alasan; audit trail
[Opsi] Impor CSV daftar sandi bank BI (batch) → masuk sebagai usulan/PENDING_APPROVAL
```

---

## 10. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-A38-01 | Performa | `GET /api/v1/master/banks` (full list, ratusan bank) response ≤ 200ms; hasil dapat di-cache di sisi konsumen. |
| NFR-A38-02 | Integritas | `kode_bank` unik ditegakkan di level database (unique constraint), bukan hanya validasi aplikasi. |
| NFR-A38-03 | Keamanan | Operasi tulis (POST/PUT/PATCH/DELETE) dibatasi role: `ADMIN_KEUANGAN`, `ADMIN_BACKOFFICE`, `SUPERADMIN`. Operasi baca lookup terbuka untuk service internal terautentikasi. |
| NFR-A38-04 | Audit | Setiap perubahan mencatat `updated_by` + `updated_at`; [Phase 2] audit trail menyimpan diff nilai lama→baru minimal 1 tahun. |
| NFR-A38-05 | Ketersediaan | Sebagai data referensi lintas modul, endpoint lookup harus uptime ≥ 99,5%. |
| NFR-A38-06 | Konsistensi | Referensi memakai `bank_id` (FK), memastikan integritas referensial lintas modul konsumen. |

---

## 11. Open Questions & Assumptions

### Asumsi
- [ASUMSI] "Bank (New)" adalah master data referensi daftar bank (bukan penyimpanan rekening/saldo). Rekening bank spesifik (nomor, atas nama) dikelola oleh modul konsumen (A7, Keuangan).
- [ASUMSI] `kode_bank` merujuk pada sandi kliring Bank Indonesia (3 digit umumnya), disiapkan panjang VARCHAR(10) untuk fleksibilitas.
- [ASUMSI] Phase 1 tanpa approval; setiap perubahan langsung efektif oleh admin berwenang.
- [ASUMSI] Modul pembayaran/refund yang mengonsumsi master ini merupakan modul terpisah dan belum berkode dalam scope PRD ini.

### Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah diperlukan granularitas **cabang bank (branch)** beserta kode cabang untuk kliring/rekonsiliasi, atau cukup level bank?
- [PERLU KONFIRMASI] Sumber otoritatif daftar bank & sandi kliring — impor manual dari daftar BI, atau integrasi/CSV berkala?
- [PERLU KONFIRMASI] Apakah `swift_code` wajib untuk bank tertentu (mis. yang melayani pembayaran valas), atau selalu opsional?
- [PERLU KONFIRMASI] Kebijakan saat menonaktifkan bank yang masih dirujuk supplier aktif — peringatan saja (asumsi saat ini) atau blokir?
- [PERLU KONFIRMASI] Apakah approval maker-checker (Phase 2) memang diperlukan untuk master bank, mengingat sifatnya referensi statis?
