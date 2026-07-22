# Product Requirement Document (PRD)
# A33 — Master Data Kategori Barang

---

## 1. Metadata Dokumen

* **Approval**: [Kepala Instalasi Farmasi / Kepala Bidang IT, Jabatan, Tanggal]
* **Related Documents**:
  * A4 — Master Data Barang Farmasi (konsumen utama dropdown kategori)
  * A22 — Master Data Satuan & Kemasan (pola master data referensi serupa)
  * A5 — Master Data Barang Gizi (konsumen dropdown kategori)
  * A6 — Master Data Barang Umum/Logistik (konsumen dropdown kategori)
  * A42 — Master Data Gudang dan Farmasi
  * H1 — Inventory Pemesanan Barang (filter laporan berbasis kategori)
  * [PERLU KONFIRMASI] Daftar kategori barang eksisting dari sistem lama / spreadsheet
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-30 | 1.0 | Draft awal PRD Master Data Kategori Barang |
| 2026-06-30 | 1.1 | Revisi: tambah field wajib **Kelompok Barang** (FARMASI / GIZI / RUMAH_TANGGA) sebagai classifier per-modul; update schema, API, validasi, dan business rules |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Kategori Barang** menyediakan daftar referensi terpusat untuk mengelompokkan seluruh barang yang digunakan di SIMRS (obat, bahan medis habis pakai, alat kesehatan, barang gizi, barang logistik umum, reagen laboratorium, dll.) ke dalam kategori-kategori yang konsisten. Modul ini **tidak memiliki halaman UI khusus bagi end-user**; fungsi utamanya adalah menyediakan sumber data untuk komponen dropdown di modul-modul lain (Master Data Barang Farmasi, Gizi, Inventori, Logistik) serta sebagai parameter filter pada laporan stok dan pemesanan. Pengelolaan data dilakukan oleh Admin IT / Superadmin melalui panel konfigurasi sederhana.

Setiap kategori wajib memiliki **Kelompok Barang** — nilai enum `FARMASI`, `GIZI`, atau `RUMAH_TANGGA` — yang menentukan modul mana saja yang boleh menampilkan kategori tersebut di dropdown. Contoh: kategori "Makanan Basah" dengan kelompok `GIZI` hanya muncul di dropdown **A5 — Master Data Barang Gizi**, tidak muncul di A4 Barang Farmasi maupun A6 Barang Umum.

> **[ASUMSI]** Kategori Barang bersifat flat (satu level), bukan hierarki pohon. Jika RS membutuhkan sub-kategori (mis. Obat → Narkotika, Psikotropika, Generik), hal tersebut masuk scope Phase 2.

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Kategori barang didefinisikan secara hard-coded atau per-kesepakatan verbal di setiap modul; tidak ada satu daftar resmi.
- Tim Farmasi, Gizi, dan Logistik menggunakan penamaan kategori berbeda untuk barang yang sama (mis. "BMHP", "Bahan Habis Pakai", "BHP" — merujuk hal sama).
- Laporan stok dan pemesanan tidak dapat difilter per kategori secara otomatis; harus dilakukan rekonsiliasi manual di Excel.
- Penambahan kategori baru membutuhkan perubahan kode di setiap modul yang menggunakannya.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin IT mengelola satu tabel master kategori barang yang dikonsumsi oleh seluruh modul terkait melalui API internal.
- **Phase 1**: CRUD kategori (nama, kode singkat, **kelompok barang**, deskripsi, status aktif/nonaktif) + API internal `GET /api/v1/master/item-categories?kelompok={FARMASI|GIZI|RUMAH_TANGGA}` → modul konsumen hanya mengambil kategori sesuai kelompoknya dan merender sebagai dropdown.
- **Phase 2**: Dukungan hierarki sub-kategori (parent–child) untuk granularitas lebih tinggi (mis. pemisahan Narkotika, Psikotropika, OOT dari kategori Obat generik).

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi penamaan kategori lintas modul | 0 inkonsistensi nama kategori antara modul Farmasi, Gizi, dan Logistik setelah go-live |
| 2 | Adopsi dropdown oleh modul konsumen | ≥ 3 modul mengonsumsi API kategori barang di Phase 1 (minimal: A4, A5, H1) |
| 3 | Ketersediaan API | Endpoint kategori barang uptime ≥ 99,5% |
| 4 | Waktu load dropdown | Dropdown kategori barang di modul konsumen load ≤ 500ms |
| 5 | Kemudahan pengelolaan | Admin IT dapat menambah / menonaktifkan kategori tanpa perubahan kode aplikasi |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Hierarki Sub-Kategori) |
|---------------|---------------------|-------------------------------------------|
| CRUD Kategori Barang | Tambah / edit / nonaktifkan kategori (nama, kode, **kelompok barang**, deskripsi, status) | Tambah relasi parent–child (sub-kategori) |
| API internal — list kategori aktif | `GET /api/v1/master/item-categories?kelompok=` → array aktif untuk dropdown, difilter per kelompok | Filter tambahan: `?parent_id=` untuk sub-kategori |
| API internal — detail kategori | `GET /api/v1/master/item-categories/{id}` | — |
| Validasi duplikasi nama/kode | Cegah duplikat nama dan kode singkat | — |
| Filter laporan berbasis kategori | Tersedia sebagai parameter filter di H1 Pemesanan Barang | Tersedia di semua laporan inventori |
| Hierarki sub-kategori | — | Mendukung parent_id; API mendukung query tree |
| Sinkronisasi ke SATUSEHAT / e-Katalog | — | Pemetaan kategori ke kode jenis barang standar nasional |
| Panel admin (UI minimal) | Tabel data + form tambah/edit di admin panel (akses Superadmin/Admin IT) | — |

**Out of Scope**:
- Halaman UI terpisah bagi staf non-admin untuk melihat/mengelola kategori.
- Import batch kategori dari file Excel (dipertimbangkan Phase 2).
- Pemetaan kategori ke kode SATUSEHAT atau e-Katalog (Phase 2).
- Manajemen stok per kategori (ada di modul Inventori / H1).

---

## 5. Related Features

* **A4 — Master Data Barang Farmasi**: Setiap barang farmasi wajib memilih `kategori_id` dari master ini. Kategori menjadi filter utama di daftar barang farmasi dan laporan stok.
* **A5 — Master Data Barang Gizi**: Konsumen dropdown kategori dengan kelompok `GIZI`. Hanya kategori berstatus `AKTIF` dan `kelompok = GIZI` yang muncul di form tambah/edit barang gizi (mis. "Makanan Basah", "Makanan Kering", "Suplemen Gizi").
* **A6 — Master Data Barang Umum / Logistik**: Konsumen dropdown kategori dengan kelompok `RUMAH_TANGGA`. Hanya kategori berstatus `AKTIF` dan `kelompok = RUMAH_TANGGA` yang muncul di form tambah/edit barang umum (mis. "ATK", "Linen", "Kebersihan").
* **H1 — Inventory Pemesanan Barang**: Kategori digunakan sebagai parameter filter laporan kebutuhan dan pemesanan barang per periode.
* **A22 — Master Data Satuan & Kemasan**: Pola implementasi serupa (master referensi tanpa UI end-user); jadikan acuan konvensi API dan struktur tabel.

---

## 6. Business Process & User Stories

### State Machine — Status Kategori Barang

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Kategori tersedia dan dapat dipilih | Muncul di dropdown semua modul konsumen; dapat dijadikan filter laporan | → `NONAKTIF` | → `NONAKTIF` |
| `NONAKTIF` | Kategori dinonaktifkan | Tidak muncul di dropdown untuk data baru; barang yang sudah terlanjur dikategorikan dengan kategori ini **tetap menyimpan referensi** (data historis terjaga) | → `AKTIF` | → `AKTIF` |

> **[ASUMSI]** Kategori tidak dapat dihapus (hard delete) jika sudah direferensikan oleh ≥ 1 barang, untuk menjaga integritas data historis. Penghapusan hanya diizinkan jika belum ada barang yang menggunakannya.

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A33-01 | Admin IT | Menambah kategori barang baru dengan nama, kode singkat, **kelompok barang**, dan deskripsi | Memperluas daftar kategori tanpa perlu mengubah kode aplikasi, sekaligus memastikan kategori hanya tampil di modul yang tepat |
| US-A33-02 | Admin IT | Mengedit nama atau deskripsi kategori yang ada | Memperbaiki penamaan yang tidak konsisten atau keliru |
| US-A33-03 | Admin IT | Menonaktifkan kategori yang sudah tidak digunakan | Menjaga dropdown di modul konsumen tetap bersih dan relevan |
| US-A33-04 | Admin IT | Mengaktifkan kembali kategori yang pernah dinonaktifkan | Memulihkan kategori yang sempat dihentikan sementara |
| US-A33-05 | System / Modul Konsumen | Mengambil daftar kategori aktif via API | Mengisi komponen dropdown pada form Master Data Barang secara dinamis |
| US-A33-06 | Admin IT | Melihat daftar seluruh kategori (aktif dan nonaktif) beserta jumlah barang per kategori | Mengaudit dan merencanakan konsolidasi kategori |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Tambah Kategori Barang**

* **User Story**: Sebagai Admin IT, saya ingin menambah kategori barang baru dengan mengisi nama, kode singkat, kelompok barang, dan deskripsi, agar kategori tersebut hanya muncul di dropdown modul yang sesuai kelompoknya.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menampilkan form tambah kategori dengan field: Nama Kategori (wajib), Kode Singkat (wajib), Kelompok Barang (wajib, dropdown pilihan: Farmasi / Gizi / Rumah Tangga), Deskripsi (opsional).
    * **AC 2**: Sistem menolak penyimpanan jika Nama Kategori sudah ada (case-insensitive, setelah trim spasi) dan menampilkan pesan error `"Nama kategori sudah digunakan"`.
    * **AC 3**: Sistem menolak penyimpanan jika Kode Singkat sudah ada (case-insensitive, setelah trim spasi) dan menampilkan pesan error `"Kode singkat sudah digunakan"`.
    * **AC 4**: Sistem menolak penyimpanan jika Kelompok Barang tidak dipilih dan menampilkan pesan `"Kelompok barang wajib dipilih"`.
    * **AC 5**: Setelah berhasil disimpan, status kategori otomatis di-set `AKTIF` oleh sistem; tidak ada input status di form create.
    * **AC 6**: Kategori baru langsung tersedia di respons API `GET /api/v1/master/item-categories?kelompok={nilai_kelompok}` dalam ≤ 1 detik setelah penyimpanan.
    * **AC 7**: Kode Singkat otomatis diubah ke UPPERCASE oleh sistem sebelum disimpan.

* **Validasi**:

  **A. Wording Validasi (Frontend / API Response)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Kategori | Text | Required; Max 100 karakter; Unik (case-insensitive) | "Nama kategori wajib diisi" / "Nama kategori sudah digunakan" | "Contoh: Obat Generik, BMHP, Makanan Basah" |
  | Kode Singkat | Text | Required; Max 20 karakter; Alfanumerik + strip; Unik; auto-UPPERCASE | "Kode singkat wajib diisi" / "Kode singkat sudah digunakan" / "Kode hanya boleh huruf, angka, dan tanda strip" | "Contoh: OBT, BMHP, MKN-BASAH" |
  | Kelompok Barang | Dropdown (single select) | Required; nilai: `FARMASI` \| `GIZI` \| `RUMAH_TANGGA` | "Kelompok barang wajib dipilih" | "Tentukan modul barang mana yang akan menggunakan kategori ini" |
  | Deskripsi | Textarea | Opsional; Max 500 karakter | "Deskripsi maksimal 500 karakter" | "Penjelasan singkat mengenai kategori ini" |

---

**Fitur: Edit Kategori Barang**

* **User Story**: Sebagai Admin IT, saya ingin mengedit nama, kode singkat, atau deskripsi kategori yang ada, agar data kategori dapat dikoreksi jika terjadi kesalahan penamaan.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form edit pre-populated dengan data kategori yang dipilih (nama, kode singkat, kelompok barang, deskripsi).
    * **AC 2**: Validasi duplikasi nama dan kode singkat tetap berlaku saat edit, namun pengecualian berlaku untuk entri milik kategori itu sendiri (boleh simpan tanpa mengubah nama/kode).
    * **AC 3**: Perubahan langsung tercermin di semua modul konsumen (API) setelah berhasil disimpan, tanpa restart aplikasi.
    * **AC 4**: Kelompok Barang **dapat diubah** melalui form edit selama kategori belum digunakan oleh barang manapun (jumlah barang = 0). Jika sudah ada barang yang menggunakannya, field Kelompok Barang di-lock (read-only) dan menampilkan tooltip `"Kelompok tidak dapat diubah karena sudah digunakan oleh X barang"`.
    * **AC 5**: Status (AKTIF/NONAKTIF) tidak dapat diubah melalui form edit; pengelolaan status dilakukan via toggle terpisah di list view.

* **Validasi**: Identik dengan form Tambah Kategori Barang (lihat di atas), dengan pengecualian duplikasi untuk entri sendiri dan aturan lock Kelompok Barang (AC 4).

---

**Fitur: Toggle Aktif / Nonaktif Kategori Barang**

* **User Story**: Sebagai Admin IT, saya ingin menonaktifkan atau mengaktifkan kembali kategori barang melalui toggle di daftar, agar dropdown di modul konsumen hanya menampilkan kategori yang relevan.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin IT dapat men-toggle status kategori dari `AKTIF` → `NONAKTIF` atau sebaliknya langsung dari list view tanpa membuka form edit.
    * **AC 2**: Kategori yang dinonaktifkan langsung tidak muncul di respons API `GET /api/v1/master/item-categories` (endpoint yang digunakan modul konsumen untuk dropdown).
    * **AC 3**: Barang yang sebelumnya menggunakan kategori yang dinonaktifkan **tidak terpengaruh** — referensi `kategori_id` di tabel barang tetap tersimpan.
    * **AC 4**: Admin IT dapat melihat kategori nonaktif di list view admin dengan filter "Tampilkan Nonaktif".
    * **AC 5**: Sistem menampilkan dialog konfirmasi sebelum menonaktifkan kategori yang sedang digunakan oleh ≥ 1 barang aktif, dengan informasi jumlah barang terdampak: `"Kategori ini digunakan oleh X barang aktif. Menonaktifkan kategori tidak akan menghapus data barang tersebut. Lanjutkan?"`.

---

**Fitur: Hapus Kategori Barang**

* **User Story**: Sebagai Admin IT, saya ingin menghapus kategori yang dibuat salah dan belum digunakan oleh barang manapun, agar daftar kategori tetap bersih.
* **Prioritas**: P2
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Hapus hanya diizinkan jika kategori belum direferensikan oleh barang manapun (jumlah barang = 0).
    * **AC 2**: Jika kategori sudah memiliki referensi barang, tombol hapus dinonaktifkan atau sistem menolak dengan pesan: `"Kategori tidak dapat dihapus karena sudah digunakan oleh X barang. Nonaktifkan kategori sebagai gantinya."`.
    * **AC 3**: Hapus yang berhasil menghilangkan entri secara permanen (hard delete) dari database.

---

**Fitur: API List Kategori Barang (untuk Modul Konsumen)**

* **User Story**: Sebagai sistem (modul konsumen), saya ingin mengambil daftar kategori barang aktif via API, agar komponen dropdown di form Master Data Barang dapat diisi secara dinamis tanpa hard-code.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `GET /api/v1/master/item-categories?kelompok=FARMASI` hanya mengembalikan kategori berstatus `AKTIF` dengan `item_group = FARMASI`, diurutkan alfabetis berdasarkan `name`. Berlaku serupa untuk nilai `GIZI` dan `RUMAH_TANGGA`.
    * **AC 2**: `GET /api/v1/master/item-categories` tanpa parameter `kelompok` mengembalikan **semua** kategori aktif dari semua kelompok (digunakan admin panel untuk list view lengkap).
    * **AC 3**: Respons JSON menyertakan minimal: `id`, `name`, `code`, `item_group`, `description`, `is_active`.
    * **AC 4**: Response time ≤ 500ms dalam kondisi normal (< 200 entri kategori).
    * **AC 5**: Endpoint tidak memerlukan autentikasi khusus di luar sesi pengguna yang sudah login ke SIMRS (internal API).
    * **AC 6**: Parameter opsional `?include_inactive=true` (hanya untuk Admin IT) mengembalikan semua kategori termasuk yang nonaktif; dapat dikombinasikan dengan `?kelompok=`.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `item_categories`
* **Key Columns**:

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` | — |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE (case-insensitive via `citext` atau collation) | Nama kategori |
| `code` | VARCHAR(20) | NOT NULL, UNIQUE | Kode singkat, disimpan UPPERCASE |
| `item_group` | ENUM(`FARMASI`, `GIZI`, `RUMAH_TANGGA`) | NOT NULL | Kelompok barang; menentukan modul konsumen yang berhak mengonsumsi kategori ini |
| `description` | TEXT | NULLABLE | Deskripsi opsional |
| `is_active` | BOOLEAN | NOT NULL, default `true` | Status aktif/nonaktif |
| `parent_id` | UUID | NULLABLE, FK → `item_categories(id)` | Untuk Phase 2 (hierarki sub-kategori); di Phase 1 selalu NULL |
| `created_by` | UUID | NULLABLE, FK → `users(id)` | Admin yang membuat |
| `updated_by` | UUID | NULLABLE, FK → `users(id)` | Admin yang terakhir mengubah |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |

> **Catatan**: Kolom `parent_id` disertakan sejak Phase 1 agar skema data siap untuk hierarki sub-kategori di Phase 2 tanpa migrasi skema yang merusak. Di Phase 1, `parent_id` selalu `NULL` dan tidak diekspos di form admin.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/master/item-categories` | List kategori; `?kelompok=FARMASI\|GIZI\|RUMAH_TANGGA` untuk filter per-modul konsumen; `?include_inactive=true` untuk admin |
| GET | `/api/v1/master/item-categories/{id}` | Detail satu kategori |
| POST | `/api/v1/master/item-categories` | Buat kategori baru |
| PUT | `/api/v1/master/item-categories/{id}` | Edit nama, kode, atau deskripsi kategori |
| PATCH | `/api/v1/master/item-categories/{id}/toggle-active` | Toggle status AKTIF ↔ NONAKTIF |
| DELETE | `/api/v1/master/item-categories/{id}` | Hapus kategori (hanya jika belum direferensikan barang) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `name` | Nama Kategori | Text | Ya | Required; Max 100 karakter; Unik case-insensitive | Input admin | Trim spasi awal/akhir sebelum validasi & simpan |
| `code` | Kode Singkat | Text | Ya | Required; Max 20 karakter; Alfanumerik + strip (`^[A-Z0-9-]+$`); Unik; Auto-UPPERCASE | Input admin | Dipakai sebagai kode identifikasi singkat di laporan |
| `item_group` | Kelompok Barang | Dropdown | Ya | Required; nilai: `FARMASI` \| `GIZI` \| `RUMAH_TANGGA` | Input admin (pilih dari dropdown tetap) | Lock (read-only) di form edit jika sudah ada barang yang menggunakan kategori ini |
| `description` | Deskripsi | Textarea | Tidak | Max 500 karakter | Input admin | Helper text: "Penjelasan singkat mengenai jenis barang dalam kategori ini" |
| `is_active` | — | — | — | — | Sistem | **Tidak diekspos di form create**; otomatis `true`. Di form edit, tidak diubah via form — gunakan toggle di list view |
| `parent_id` | — | — | — | — | Sistem | Tidak diekspos di Phase 1; selalu `NULL` |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No | Auto-increment display | Integer | — | Bukan `id` database |
| Nama Kategori | `name` | Plain text | Sort ASC/DESC; Search (contains) | — |
| Kode Singkat | `code` | Plain text UPPERCASE | Sort ASC/DESC; Search (exact/contains) | — |
| Kelompok Barang | `item_group` | Badge warna: "Farmasi" (biru) / "Gizi" (hijau) / "Rumah Tangga" (oranye) | Filter: Semua / Farmasi / Gizi / Rumah Tangga | Kolom utama untuk pengelompokan; tampilkan label ramah ("Farmasi", bukan "FARMASI") |
| Deskripsi | `description` | Plain text (truncate 80 char + tooltip) | — | Tampilkan "-" jika kosong |
| Jumlah Barang | COUNT dari tabel `items` / `drugs` | Integer | Sort ASC/DESC | Agregasi; update real-time atau cache 1 menit |
| Status | `is_active` | Badge: "Aktif" (hijau) / "Nonaktif" (abu) | Filter: Semua / Aktif / Nonaktif | Default filter: Aktif |
| Aksi | — | Tombol Edit, Toggle Aktif/Nonaktif, Hapus | — | Hapus hanya enabled jika Jumlah Barang = 0 |

**Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A33-01 | Nama Kategori unik secara case-insensitive dan setelah trim spasi. |
| BR-A33-02 | Kode Singkat unik, selalu disimpan dalam format UPPERCASE, hanya boleh mengandung huruf A–Z, angka 0–9, dan tanda strip (-). |
| BR-A33-03 | Status selalu di-set `AKTIF` saat pertama kali dibuat. Tidak ada input status di form create. |
| BR-A33-04 | Kategori yang sudah direferensikan oleh ≥ 1 barang tidak dapat dihapus (hard delete diblokir oleh constraint FK atau pengecekan aplikasi). |
| BR-A33-05 | Menonaktifkan kategori tidak mengubah data barang yang sudah menggunakan kategori tersebut; hanya mencegah pemilihan kategori tersebut untuk barang baru. |
| BR-A33-06 | API `GET /api/v1/master/item-categories` (tanpa parameter `include_inactive`) **hanya** mengembalikan kategori berstatus `AKTIF`. |
| BR-A33-07 | Field `item_group` wajib diisi saat create; nilai valid: `FARMASI`, `GIZI`, `RUMAH_TANGGA`. Nilai di luar enum ini ditolak dengan HTTP 400. |
| BR-A33-08 | Modul konsumen **wajib** menyertakan parameter `?kelompok=` saat memanggil API untuk keperluan dropdown, agar hanya kategori yang relevan dengan modul tersebut yang dikembalikan (A4 → `FARMASI`; A5 → `GIZI`; A6 → `RUMAH_TANGGA`). |
| BR-A33-09 | `item_group` **tidak dapat diubah** setelah kategori direferensikan oleh ≥ 1 barang. Perubahan kelompok hanya diizinkan selama jumlah barang = 0 (kategori belum digunakan). |
| BR-A33-10 | [Phase 2] Kolom `parent_id` diizinkan terisi untuk mendukung sub-kategori. Kategori dengan `parent_id` IS NULL dianggap kategori induk (root). Kedalaman hierarki dibatasi maksimal 2 level (induk → anak) di Phase 2. Sub-kategori mewarisi `item_group` dari induknya. |

---

## 9. Workflow / BPMN Interpretation

> **[ASUMSI]** Tidak ada BPMN khusus untuk modul ini karena proses bisnisnya sederhana (referensi data statis tanpa approval berjenjang). Alur operasional direpresentasikan sebagai berikut:

**Alur Pengelolaan Kategori Barang (Admin IT):**

1. Admin IT login ke SIMRS dan mengakses panel admin (route `/admin/master/item-categories`).
2. Admin IT melihat daftar kategori yang sudah ada (default: filter Aktif).
3. **Tambah**: Admin IT mengisi form → sistem validasi (duplikasi nama/kode) → simpan → kategori langsung tersedia di API.
4. **Edit**: Admin IT klik Edit pada baris kategori → form pre-populated → ubah field → simpan → perubahan segera tercermin di API.
5. **Nonaktifkan**: Admin IT klik toggle → jika kategori digunakan oleh barang, sistem tampilkan konfirmasi → Admin IT konfirmasi → status berubah `NONAKTIF` → kategori hilang dari dropdown modul konsumen.
6. **Aktifkan kembali**: Admin IT filter list "Nonaktif" → klik toggle → kategori kembali `AKTIF` → muncul kembali di dropdown modul konsumen.
7. **Hapus**: Admin IT klik Hapus (hanya muncul aktif jika barang = 0) → dialog konfirmasi → hapus permanen.

**Alur Konsumsi oleh Modul Lain (Otomatis):**

1. Modul konsumen memanggil API dengan parameter kelompok yang sesuai saat halaman dimuat:
   - A4 Barang Farmasi → `GET /api/v1/master/item-categories?kelompok=FARMASI`
   - A5 Barang Gizi → `GET /api/v1/master/item-categories?kelompok=GIZI`
   - A6 Barang Umum → `GET /api/v1/master/item-categories?kelompok=RUMAH_TANGGA`
2. API mengembalikan array kategori aktif sesuai kelompok → dirender sebagai dropdown pilihan `Kategori` di form masing-masing modul.
3. Pengguna memilih kategori → `id` kategori tersimpan sebagai `kategori_id` di tabel barang terkait.
