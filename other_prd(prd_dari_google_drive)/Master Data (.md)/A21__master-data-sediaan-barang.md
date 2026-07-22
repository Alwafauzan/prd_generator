# Product Requirement Document (PRD)
# A21 — Master Data Sediaan Barang (New)

---

## 1. Metadata Dokumen

* **Approval**: [Kepala Instalasi Farmasi / Kepala Bidang IT, Jabatan, Tanggal]
* **Related Documents**:
  * A4 — Master Data Barang Farmasi (konsumen utama dropdown sediaan)
  * A22 — Master Data Satuan & Kemasan (modul serupa; acuan pola implementasi dan SATUSEHAT mapping)
  * A33 — Master Data Kategori Barang (modul referensi serupa)
  * Pedoman SATUSEHAT Terminology V2 — Kode KFA / KFASD (Kode Farmasi / Kode Farmasi Sediaan)
  * SNOMED CT Dose Form (standar internasional bentuk sediaan farmasi)
  * [PERLU KONFIRMASI] Daftar sediaan barang eksisting dari sistem lama / spreadsheet Farmasi
  * [PERLU KONFIRMASI] Dokumentasi API SATUSEHAT Terminology V2 endpoint untuk dose form lookup
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-30 | 1.0 | Draft awal PRD Master Data Sediaan Barang (New) |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Sediaan Barang (New)** menyediakan daftar referensi terpusat untuk bentuk sediaan farmasi — yaitu bentuk fisik suatu obat atau bahan medis (mis. *Tablet, Kapsul, Sirup, Injeksi, Salep, Suppositoria, Inhaler*) — yang digunakan di seluruh SIMRS. Modul ini **tidak memiliki halaman UI khusus bagi end-user**; fungsi utamanya adalah menyediakan sumber data untuk komponen dropdown di modul-modul lain, terutama **A4 — Master Data Barang Farmasi**, serta menjadi titik pemetaan (*mapping*) ke kode standar **SATUSEHAT Terminology V2 (KFASD — Kode Farmasi Sediaan)**. Pengelolaan data dilakukan oleh Admin IT / Admin Farmasi melalui panel konfigurasi.

Label **(New)** menandakan bahwa modul ini adalah versi ulang dari master sediaan lama yang belum terintegrasi dengan standar SATUSEHAT; versi baru ini dirancang agar siap integrasi SATUSEHAT Terminology V2 sejak skema database Phase 1.

> **[ASUMSI]** Satu entri sediaan mewakili satu bentuk sediaan (dose form) yang unik secara nama. Pemetaan ke kode KFASD SATUSEHAT dilakukan di Phase 2 setelah kamus SATUSEHAT tersedia dan divalidasi oleh tim Farmasi.

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Daftar sediaan hard-coded atau disimpan dalam spreadsheet per unit; tidak ada master terpusat.
- Nama sediaan tidak konsisten ("Tablet", "tab", "Tab.", "TABLET" digunakan bergantian di modul berbeda).
- Pelaporan e-Klaim BPJS dan pengiriman data ke SATUSEHAT membutuhkan kode KFASD; tanpa master terpusat, pemetaan dilakukan manual per transaksi — rawan salah kode dan duplikasi kerja.
- Penambahan sediaan baru (mis. *Patch Transdermal*, *Lyophilized Powder*) memerlukan perubahan kode aplikasi.
- Tidak ada referensi ke standar internasional (SNOMED CT) maupun nasional (SATUSEHAT KFASD).

**To-Be (Workflow Digital yang Diusulkan):**
- Admin Farmasi/IT mengelola satu tabel master sediaan terpusat yang dikonsumsi oleh seluruh modul terkait via API internal.
- **Phase 1**: CRUD sediaan (nama, kode singkat, deskripsi, status aktif/nonaktif) + API internal `GET /api/v1/master/dosage-forms` → dirender sebagai dropdown di form Master Data Barang Farmasi. Kolom `satusehat_code` (KFASD) sudah tersedia di skema namun opsional (nullable) di Phase 1.
- **Phase 2**: Integrasi SATUSEHAT Terminology V2 — Admin Farmasi/IT dapat melakukan lookup kode KFASD dari API SATUSEHAT, lalu memetakan setiap sediaan ke kode KFASD yang tepat. Kode KFASD wajib terisi untuk barang yang dikirim ke SATUSEHAT.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi nama sediaan lintas modul | 0 inkonsistensi nama sediaan antara modul Farmasi, EMR, dan Billing setelah go-live |
| 2 | Adopsi dropdown oleh modul konsumen | ≥ 2 modul mengonsumsi API sediaan di Phase 1 (minimal: A4 Barang Farmasi, form dispensing) |
| 3 | Ketersediaan API | Endpoint sediaan uptime ≥ 99,5% |
| 4 | Waktu load dropdown | Dropdown sediaan di modul konsumen load ≤ 500ms |
| 5 | [Phase 2] Kepatuhan SATUSEHAT | ≥ 90% sediaan aktif memiliki pemetaan kode KFASD valid sebelum go-live integrasi SATUSEHAT |
| 6 | [Phase 2] Akurasi kode KFASD | 0 kode KFASD duplikat atau tidak valid pada saat pengiriman data ke SATUSEHAT |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Integrasi SATUSEHAT Terminology V2) |
|---------------|---------------------|--------------------------------------------------------|
| CRUD Sediaan Barang | Tambah / edit / nonaktifkan sediaan (nama, kode singkat, deskripsi, status) | Tambah / edit kode KFASD; validasi kode ke SATUSEHAT API |
| Kolom `satusehat_code` (KFASD) | Ada di skema DB, nullable, tidak diekspos di form admin Phase 1 | Wajib diisi untuk barang yang dikirim ke SATUSEHAT; bisa via lookup atau input manual |
| API internal — list sediaan aktif | `GET /api/v1/master/dosage-forms` → array aktif untuk dropdown | Filter tambahan: `?has_satusehat_code=true` |
| Lookup SATUSEHAT Terminology V2 | — | Search/import kode KFASD dari SATUSEHAT Terminology API; tampilkan opsi pemetaan per sediaan |
| Impor batch sediaan | — | Impor dari file CSV/Excel dengan kolom nama + kode KFASD |
| Validasi duplikasi nama/kode | Cegah duplikat nama dan kode singkat | Cegah duplikat kode KFASD |
| Panel admin (UI minimal) | Tabel data + form tambah/edit di admin panel (akses Superadmin/Admin IT/Admin Farmasi) | Tambah kolom KFASD + tombol "Lookup SATUSEHAT" |

**Out of Scope**:
- Halaman UI terpisah bagi staf non-admin untuk melihat/mengelola sediaan.
- Sinkronisasi otomatis/berkala seluruh kamus SATUSEHAT (Phase 2 bersifat semi-manual / on-demand).
- Pemetaan ke SNOMED CT (hanya KFASD yang dipakai di ekosistem SATUSEHAT nasional).
- Pengelolaan stok per sediaan (ada di modul Inventori).
- Konversi antar sediaan (mis. 1 ampul = 5 ml larutan injeksi) — ada di A22 Satuan & Kemasan.

---

## 5. Related Features

* **A4 — Master Data Barang Farmasi**: Setiap barang farmasi wajib memilih `sediaan_id` dari master ini. Konsumen utama dropdown sediaan; kode KFASD dari sediaan digunakan untuk melengkapi data KFA barang saat sinkronisasi SATUSEHAT.
* **A22 — Master Data Satuan & Kemasan**: Pola implementasi identik (master referensi tanpa UI end-user, dengan integrasi SATUSEHAT Terminology V2). Jadikan acuan konvensi API, skema tabel, dan mekanisme mapping SATUSEHAT.
* **A33 — Master Data Kategori Barang**: Modul referensi serupa (pola CRUD flat, tanpa UI end-user). Jadikan acuan untuk pola toggle aktif/nonaktif dan proteksi hapus.
* **Integrasi SATUSEHAT (Phase 2)**: Kode KFASD dari modul ini digunakan sebagai atribut wajib pada payload pengiriman data obat/BMHP ke endpoint SATUSEHAT Terminology V2.

---

## 6. Business Process & User Stories

### State Machine — Status Sediaan Barang

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Sediaan tersedia dan dapat dipilih | Muncul di dropdown semua modul konsumen | → `NONAKTIF` | → `NONAKTIF` |
| `NONAKTIF` | Sediaan dinonaktifkan | Tidak muncul di dropdown untuk data baru; barang yang sudah menggunakan sediaan ini **tetap menyimpan referensi** (data historis terjaga) | → `AKTIF` | → `AKTIF` |

> **[ASUMSI]** Sediaan tidak dapat dihapus (hard delete) jika sudah direferensikan oleh ≥ 1 barang, untuk menjaga integritas data historis.

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A21-01 | Admin IT / Admin Farmasi | Menambah sediaan baru dengan nama, kode singkat, dan deskripsi | Memperluas daftar sediaan tanpa mengubah kode aplikasi |
| US-A21-02 | Admin IT / Admin Farmasi | Mengedit nama atau deskripsi sediaan yang ada | Memperbaiki penamaan yang tidak konsisten atau keliru |
| US-A21-03 | Admin IT / Admin Farmasi | Menonaktifkan sediaan yang sudah tidak digunakan | Menjaga dropdown di modul konsumen tetap bersih |
| US-A21-04 | Admin IT / Admin Farmasi | Mengaktifkan kembali sediaan yang pernah dinonaktifkan | Memulihkan sediaan yang sempat dihentikan sementara |
| US-A21-05 | System / Modul Konsumen | Mengambil daftar sediaan aktif via API | Mengisi dropdown pada form Master Data Barang Farmasi secara dinamis |
| US-A21-06 | Admin IT / Admin Farmasi | Melihat daftar seluruh sediaan (aktif dan nonaktif) beserta jumlah barang per sediaan | Mengaudit dan merencanakan konsolidasi sediaan |
| US-A21-07 | Admin Farmasi | [Phase 2] Memetakan setiap sediaan ke kode KFASD SATUSEHAT via lookup atau input manual | Memastikan data sediaan yang dikirim ke SATUSEHAT menggunakan kode standar nasional yang valid |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Tambah Sediaan Barang**

* **User Story**: Sebagai Admin IT / Admin Farmasi, saya ingin menambah sediaan barang baru dengan mengisi nama, kode singkat, dan deskripsi, agar seluruh modul konsumen dapat segera menggunakan sediaan tersebut di dropdown.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menampilkan form tambah sediaan dengan field: Nama Sediaan (wajib), Kode Singkat (wajib), Deskripsi (opsional).
    * **AC 2**: Sistem menolak penyimpanan jika Nama Sediaan sudah ada (case-insensitive, setelah trim spasi) dan menampilkan pesan `"Nama sediaan sudah digunakan"`.
    * **AC 3**: Sistem menolak penyimpanan jika Kode Singkat sudah ada (case-insensitive, setelah trim spasi) dan menampilkan pesan `"Kode singkat sudah digunakan"`.
    * **AC 4**: Setelah berhasil disimpan, status sediaan otomatis di-set `AKTIF` oleh sistem; tidak ada input status di form create.
    * **AC 5**: Sediaan baru langsung tersedia di respons API `GET /api/v1/master/dosage-forms` dalam ≤ 1 detik setelah penyimpanan.
    * **AC 6**: Kode Singkat otomatis diubah ke UPPERCASE oleh sistem sebelum disimpan.

* **Validasi**:

  **A. Wording Validasi (Frontend / API Response)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Sediaan | Text | Required; Max 100 karakter; Unik (case-insensitive) | "Nama sediaan wajib diisi" / "Nama sediaan sudah digunakan" | "Contoh: Tablet, Kapsul, Sirup, Injeksi, Salep" |
  | Kode Singkat | Text | Required; Max 20 karakter; Alfanumerik + strip; Unik; Auto-UPPERCASE | "Kode singkat wajib diisi" / "Kode singkat sudah digunakan" / "Kode hanya boleh huruf, angka, dan tanda strip" | "Contoh: TAB, KPS, SYR, INJ, SLP" |
  | Deskripsi | Textarea | Opsional; Max 500 karakter | "Deskripsi maksimal 500 karakter" | "Penjelasan singkat mengenai bentuk fisik sediaan ini" |

---

**Fitur: Edit Sediaan Barang**

* **User Story**: Sebagai Admin IT / Admin Farmasi, saya ingin mengedit nama, kode singkat, atau deskripsi sediaan yang ada, agar data sediaan dapat dikoreksi jika terjadi kesalahan penamaan.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form edit pre-populated dengan data sediaan yang dipilih (nama, kode singkat, deskripsi).
    * **AC 2**: Validasi duplikasi nama dan kode singkat tetap berlaku saat edit, dengan pengecualian untuk entri milik sediaan itu sendiri.
    * **AC 3**: Perubahan langsung tercermin di semua modul konsumen (API) setelah berhasil disimpan, tanpa restart aplikasi.
    * **AC 4**: Status (AKTIF/NONAKTIF) dan kode KFASD tidak dapat diubah melalui form edit Phase 1; masing-masing dikelola via toggle (status) dan form terpisah Phase 2 (kode KFASD).

* **Validasi**: Identik dengan form Tambah Sediaan Barang, dengan pengecualian duplikasi untuk entri sendiri.

---

**Fitur: Toggle Aktif / Nonaktif Sediaan Barang**

* **User Story**: Sebagai Admin IT / Admin Farmasi, saya ingin menonaktifkan atau mengaktifkan kembali sediaan barang melalui toggle di daftar, agar dropdown di modul konsumen hanya menampilkan sediaan yang relevan.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat men-toggle status sediaan dari `AKTIF` → `NONAKTIF` atau sebaliknya langsung dari list view tanpa membuka form edit.
    * **AC 2**: Sediaan yang dinonaktifkan langsung tidak muncul di respons API `GET /api/v1/master/dosage-forms` (endpoint dropdown modul konsumen).
    * **AC 3**: Barang yang sebelumnya menggunakan sediaan yang dinonaktifkan **tidak terpengaruh** — referensi `sediaan_id` di tabel barang tetap tersimpan.
    * **AC 4**: Admin dapat melihat sediaan nonaktif di list view admin dengan filter "Tampilkan Nonaktif".
    * **AC 5**: Sistem menampilkan dialog konfirmasi sebelum menonaktifkan sediaan yang sedang digunakan oleh ≥ 1 barang aktif: `"Sediaan ini digunakan oleh X barang aktif. Menonaktifkan sediaan tidak akan menghapus data barang tersebut. Lanjutkan?"`.

---

**Fitur: Hapus Sediaan Barang**

* **User Story**: Sebagai Admin IT, saya ingin menghapus sediaan yang dibuat salah dan belum digunakan oleh barang manapun, agar daftar sediaan tetap bersih.
* **Prioritas**: P2
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Hapus hanya diizinkan jika sediaan belum direferensikan oleh barang manapun (jumlah barang = 0).
    * **AC 2**: Jika sediaan sudah memiliki referensi barang, tombol hapus dinonaktifkan atau sistem menolak dengan pesan: `"Sediaan tidak dapat dihapus karena sudah digunakan oleh X barang. Nonaktifkan sediaan sebagai gantinya."`.
    * **AC 3**: Hapus yang berhasil menghilangkan entri secara permanen (hard delete) dari database.

---

**Fitur: API List Sediaan Barang (untuk Modul Konsumen)**

* **User Story**: Sebagai sistem (modul konsumen), saya ingin mengambil daftar sediaan barang aktif via API, agar komponen dropdown di form Master Data Barang Farmasi dapat diisi secara dinamis.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `GET /api/v1/master/dosage-forms` mengembalikan seluruh sediaan berstatus `AKTIF`, diurutkan alfabetis berdasarkan `name`.
    * **AC 2**: Respons JSON menyertakan minimal: `id`, `name`, `code`, `description`, `is_active`, `satusehat_code` (nullable).
    * **AC 3**: Response time ≤ 500ms dalam kondisi normal (< 200 entri sediaan).
    * **AC 4**: Endpoint tidak memerlukan autentikasi khusus di luar sesi pengguna yang sudah login ke SIMRS.
    * **AC 5**: Parameter opsional `?include_inactive=true` (hanya untuk Admin) mengembalikan semua sediaan termasuk yang nonaktif.

---

**Fitur: [Phase 2] Pemetaan Kode KFASD SATUSEHAT**

* **User Story**: Sebagai Admin Farmasi, saya ingin memetakan setiap sediaan ke kode KFASD SATUSEHAT melalui pencarian di database SATUSEHAT Terminology V2, agar data obat/BMHP yang dikirim ke SATUSEHAT menggunakan kode sediaan standar nasional.
* **Prioritas**: P1
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Admin Farmasi dapat membuka form edit sediaan dan mengisi kolom "Kode KFASD" secara manual atau melalui fitur "Lookup SATUSEHAT".
    * **AC 2**: Fitur "Lookup SATUSEHAT" memanggil API SATUSEHAT Terminology V2, menampilkan daftar dose form yang cocok berdasarkan nama sediaan, dan memungkinkan Admin memilih satu kode KFASD untuk dipetakan.
    * **AC 3**: Sistem menolak penyimpanan kode KFASD jika kode tersebut sudah digunakan oleh sediaan lain dalam master ini (unik per entri sediaan).
    * **AC 4**: Sediaan yang sudah memiliki kode KFASD ditandai dengan badge "Mapped" di list view; yang belum bertanda "Unmapped".
    * **AC 5**: API `GET /api/v1/master/dosage-forms?has_satusehat_code=true` hanya mengembalikan sediaan yang sudah memiliki kode KFASD (untuk kebutuhan validasi sebelum sinkronisasi SATUSEHAT).
    * **AC 6**: Jika SATUSEHAT Terminology API tidak dapat dijangkau (timeout/error), Admin masih dapat mengisi kode KFASD secara manual dan menyimpannya.

* **Validasi (Phase 2)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode KFASD | Text | Opsional di Phase 2; Max 50 karakter; Unik per entri sediaan (jika diisi) | "Kode KFASD sudah digunakan oleh sediaan lain" | "Kode Farmasi Sediaan dari SATUSEHAT Terminology V2. Contoh: kode dari hasil lookup" |

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `dosage_forms`
* **Key Columns**:

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` | — |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE (case-insensitive via `citext` atau collation) | Nama bentuk sediaan, mis. "Tablet", "Kapsul" |
| `code` | VARCHAR(20) | NOT NULL, UNIQUE | Kode singkat, disimpan UPPERCASE, mis. "TAB", "KPS" |
| `description` | TEXT | NULLABLE | Deskripsi opsional |
| `satusehat_code` | VARCHAR(50) | NULLABLE, UNIQUE (jika terisi) | Kode KFASD dari SATUSEHAT Terminology V2; nullable di Phase 1, diisi di Phase 2 |
| `satusehat_display` | VARCHAR(255) | NULLABLE | Nama tampilan resmi dari SATUSEHAT Terminology V2 (diisi saat lookup Phase 2) |
| `is_active` | BOOLEAN | NOT NULL, default `true` | Status aktif/nonaktif |
| `created_by` | UUID | NULLABLE, FK → `users(id)` | Admin yang membuat |
| `updated_by` | UUID | NULLABLE, FK → `users(id)` | Admin yang terakhir mengubah |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |

> **Catatan**: Kolom `satusehat_code` dan `satusehat_display` disertakan sejak Phase 1 agar skema data siap untuk integrasi SATUSEHAT Terminology V2 di Phase 2 tanpa migrasi skema yang merusak. Di Phase 1, kedua kolom nullable dan tidak diekspos di form admin.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/master/dosage-forms` | List sediaan aktif (untuk dropdown); `?include_inactive=true` untuk admin; `?has_satusehat_code=true` untuk validasi Phase 2 |
| GET | `/api/v1/master/dosage-forms/{id}` | Detail satu sediaan |
| POST | `/api/v1/master/dosage-forms` | Buat sediaan baru |
| PUT | `/api/v1/master/dosage-forms/{id}` | Edit nama, kode singkat, deskripsi (Phase 1); tambah kode KFASD (Phase 2) |
| PATCH | `/api/v1/master/dosage-forms/{id}/toggle-active` | Toggle status AKTIF ↔ NONAKTIF |
| DELETE | `/api/v1/master/dosage-forms/{id}` | Hapus sediaan (hanya jika belum direferensikan barang) |
| GET | `/api/v1/master/dosage-forms/satusehat-lookup?q={keyword}` | [Phase 2] Proxy lookup ke SATUSEHAT Terminology V2 API; kembalikan kandidat kode KFASD |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `name` | Nama Sediaan | Text | Ya | Required; Max 100 karakter; Unik case-insensitive | Input admin | Trim spasi awal/akhir sebelum validasi & simpan |
| `code` | Kode Singkat | Text | Ya | Required; Max 20 karakter; `^[A-Z0-9-]+$`; Unik; Auto-UPPERCASE | Input admin | Dipakai sebagai kode identifikasi di laporan dan dropdown |
| `description` | Deskripsi | Textarea | Tidak | Max 500 karakter | Input admin | Jelaskan karakteristik fisik/kimia sediaan |
| `satusehat_code` | Kode KFASD | Text | Tidak (Phase 1) / Ya (Phase 2 untuk barang SATUSEHAT) | Max 50 karakter; Unik jika diisi; validasi ke SATUSEHAT API (Phase 2) | Input manual atau hasil lookup SATUSEHAT | Tidak diekspos di form Phase 1 |
| `satusehat_display` | Nama SATUSEHAT | Text (readonly) | Tidak | — | Otomatis dari hasil lookup SATUSEHAT | Tidak dapat diedit manual; hanya terisi via lookup Phase 2 |
| `is_active` | — | — | — | — | Sistem | Tidak diekspos di form create; otomatis `true`. Di form edit, dikelola via toggle terpisah |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No | Auto-increment display | Integer | — | Bukan `id` database |
| Nama Sediaan | `name` | Plain text | Sort ASC/DESC; Search (contains) | — |
| Kode Singkat | `code` | Plain text UPPERCASE | Sort ASC/DESC; Search (exact/contains) | — |
| Deskripsi | `description` | Truncate 80 char + tooltip | — | Tampilkan "-" jika kosong |
| Kode KFASD | `satusehat_code` | Plain text atau badge "Mapped" / "Unmapped" | Filter: Mapped / Unmapped / Semua | Kolom ini tampil di list view Phase 2 |
| Jumlah Barang | COUNT dari tabel `drugs`/`items` | Integer | Sort ASC/DESC | Agregasi; cache 1 menit |
| Status | `is_active` | Badge: "Aktif" (hijau) / "Nonaktif" (abu) | Filter: Semua / Aktif / Nonaktif | Default filter: Aktif |
| Aksi | — | Tombol Edit, Toggle, Hapus | — | Hapus hanya enabled jika Jumlah Barang = 0 |

**Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A21-01 | Nama Sediaan unik secara case-insensitive dan setelah trim spasi. |
| BR-A21-02 | Kode Singkat unik, selalu disimpan UPPERCASE, hanya boleh mengandung huruf A–Z, angka 0–9, dan tanda strip (-). |
| BR-A21-03 | Status selalu di-set `AKTIF` saat pertama kali dibuat; tidak ada input status di form create. |
| BR-A21-04 | Sediaan yang sudah direferensikan oleh ≥ 1 barang tidak dapat dihapus (hard delete diblokir oleh constraint FK atau pengecekan aplikasi). |
| BR-A21-05 | Menonaktifkan sediaan tidak mengubah data barang yang sudah menggunakan sediaan tersebut; hanya mencegah pemilihan sediaan itu untuk barang baru. |
| BR-A21-06 | API `GET /api/v1/master/dosage-forms` (tanpa parameter `include_inactive`) **hanya** mengembalikan sediaan berstatus `AKTIF`. |
| BR-A21-07 | [Phase 2] Kode KFASD (`satusehat_code`) unik di seluruh tabel jika terisi; satu kode KFASD tidak boleh dipetakan ke lebih dari satu sediaan dalam master ini. |
| BR-A21-08 | [Phase 2] Jika Admin mengisi kode KFASD secara manual tanpa melalui lookup, sistem tetap menyimpan nilai tersebut tanpa validasi ke SATUSEHAT API secara real-time (validasi dilakukan saat sinkronisasi batch). |
| BR-A21-09 | [Phase 2] Sediaan yang belum memiliki kode KFASD (`satusehat_code IS NULL`) tidak boleh disertakan dalam payload pengiriman data ke SATUSEHAT; sistem memfilter atau memperingatkan sebelum sinkronisasi. |

---

## 9. Workflow / BPMN Interpretation

> **[ASUMSI]** Tidak ada BPMN khusus untuk modul ini karena proses bisnisnya adalah pengelolaan data referensi statis tanpa approval berjenjang. Alur operasional direpresentasikan sebagai berikut:

**Alur Pengelolaan Sediaan Barang — Phase 1 (Admin IT / Admin Farmasi):**

1. Admin login ke SIMRS dan mengakses panel admin (route `/admin/master/dosage-forms`).
2. Admin melihat daftar sediaan yang sudah ada (default: filter Aktif).
3. **Tambah**: Admin mengisi form (nama, kode singkat, deskripsi) → sistem validasi (duplikasi nama/kode) → simpan → sediaan langsung tersedia di API.
4. **Edit**: Admin klik Edit pada baris sediaan → form pre-populated → ubah field → simpan → perubahan segera tercermin di API.
5. **Nonaktifkan**: Admin klik toggle → jika sediaan digunakan oleh barang, tampilkan konfirmasi → Admin konfirmasi → status `NONAKTIF` → sediaan hilang dari dropdown modul konsumen.
6. **Aktifkan kembali**: Admin filter list "Nonaktif" → klik toggle → sediaan kembali `AKTIF` → muncul di dropdown modul konsumen.
7. **Hapus**: Admin klik Hapus (hanya aktif jika jumlah barang = 0) → konfirmasi → hapus permanen.

**Alur Pemetaan KFASD — Phase 2 (Admin Farmasi):**

1. Admin Farmasi membuka list view sediaan, filter kolom KFASD = "Unmapped".
2. Admin memilih sediaan yang belum dipetakan → klik "Mapping SATUSEHAT".
3. Sistem memanggil endpoint lookup `/api/v1/master/dosage-forms/satusehat-lookup?q={nama_sediaan}` → tampilkan daftar kandidat kode KFASD dari SATUSEHAT Terminology V2.
4. Admin memilih kode KFASD yang tepat → simpan → status berubah "Mapped".
5. Jika SATUSEHAT API tidak tersedia: Admin mengisi kode KFASD secara manual → simpan dengan peringatan "kode belum divalidasi ke SATUSEHAT".
6. Setelah semua sediaan terkait dipetakan, modul integrasi SATUSEHAT dapat menyertakan kode KFASD dalam payload data obat yang dikirimkan.

**Alur Konsumsi oleh Modul Lain (Otomatis, Phase 1 & 2):**

1. Modul konsumen (mis. form tambah Barang Farmasi) memanggil `GET /api/v1/master/dosage-forms` saat halaman dimuat.
2. API mengembalikan array sediaan aktif → dirender sebagai dropdown pilihan "Bentuk Sediaan".
3. Pengguna memilih sediaan → `id` tersimpan sebagai `sediaan_id` di tabel barang; kode KFASD (jika ada) dapat disertakan sebagai atribut metadata.
