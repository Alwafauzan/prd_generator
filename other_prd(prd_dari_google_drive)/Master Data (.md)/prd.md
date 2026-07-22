# Product Requirement Document (PRD)
# A22 — Master Data Satuan & Kemasan

---

## 1. Metadata Dokumen

* **Approval**: [Nama Kepala Bidang IT / Kepala Farmasi, Jabatan, Tanggal]
* **Related Documents**:
  * A34 — Master Data Hari Libur (referensi pola master data tanpa workflow kompleks)
  * [Modul konsumen dropdown] Master Data Gizi, Master Data Farmasi/Obat, Master Data Inventori
  * Terminologi SATUSEHAT — UCUM (Unified Code for Units of Measure)
  * [PERLU KONFIRMASI] Daftar satuan & kemasan eksisting dari sistem lama
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-29 | 1.0 | Draft awal PRD Master Data Satuan & Kemasan |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Satuan & Kemasan** menyediakan daftar referensi terpusat untuk satuan ukur (mis. *mg, ml, tablet, kapsul*) dan kemasan (mis. *botol, box, ampul, strip*) yang digunakan di seluruh SIMRS. Modul ini **tidak memiliki halaman UI khusus bagi end-user**; fungsi utamanya adalah menyediakan sumber data untuk komponen dropdown di modul-modul lain (Farmasi, Gizi, Inventori, Logistik, dll.). Pengelolaan data dilakukan oleh Admin IT / Superadmin melalui panel konfigurasi sederhana.

> **[ASUMSI]** Satuan dan kemasan dipisah menjadi dua entitas berbeda dalam database, namun dikelola dalam satu modul yang sama karena sifat datanya serupa (referensi statis, jarang berubah).

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Satuan dan kemasan didefinisikan secara hard-coded per modul (Farmasi pakai daftar sendiri, Gizi pakai daftar sendiri) — tidak konsisten antar modul.
- Penambahan satuan baru memerlukan perubahan kode di setiap modul yang terpengaruh.
- Tidak ada standar terminologi; nama satuan bervariasi ("Tablet", "tab", "Tablet (tab)") tergantung inputan staf.
- Migrasi ke SATUSEHAT mensyaratkan pemetaan kode UCUM — tanpa master data terpusat, pemetaan ini tidak mungkin dilakukan konsisten.

**To-Be (Workflow Digital yang Diusulkan):**
- Satu tabel master terpusat untuk satuan dan satu untuk kemasan, dikelola Admin IT.
- **Phase 1**: Semua modul yang butuh satuan/kemasan mengonsumsi data via API internal `GET /api/master/satuan` dan `GET /api/master/kemasan` → rendered sebagai dropdown di form masing-masing modul.
- **Phase 2**: Setiap entri satuan dipetakan ke kode UCUM SATUSEHAT; sinkronisasi terminologi dari SATUSEHAT Terminology API untuk memastikan keselarasan standar nasional.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi satuan lintas modul | 0 inkonsistensi nama satuan antar modul setelah go-live |
| 2 | Adopsi dropdown oleh modul konsumen | ≥ 5 modul mengonsumsi API satuan/kemasan di Phase 1 |
| 3 | Ketersediaan API | Endpoint satuan & kemasan uptime ≥ 99,5% |
| 4 | Waktu load dropdown | Dropdown satuan/kemasan di modul konsumen load ≤ 500ms |
| 5 | [Phase 2] Kepatuhan SATUSEHAT | 100% satuan aktif memiliki pemetaan kode UCUM yang valid |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD + API) | Phase 2 (Advanced: SATUSEHAT Sync) |
|---------------|---------------------------|--------------------------------------|
| CRUD Satuan | Tambah / edit / nonaktifkan satuan (nama, singkatan, kategori, status) | Tambah field `kode_ucum` + validasi ke SATUSEHAT Terminology |
| CRUD Kemasan | Tambah / edit / nonaktifkan kemasan (nama, singkatan, status) | — |
| API internal — satuan | `GET /api/master/satuan` → array aktif untuk dropdown | Filter tambahan per `kode_ucum` |
| API internal — kemasan | `GET /api/master/kemasan` → array aktif untuk dropdown | — |
| Relasi satuan–kemasan | — | Definisi konversi satuan (mis. 1 strip = 10 tablet) |
| Sinkronisasi SATUSEHAT Terminology | — | Import terminologi UCUM dari SATUSEHAT API; mapping otomatis |
| Panel admin (UI minimal) | Tabel sederhana read-only + form tambah/edit di admin panel (akses Superadmin/Admin IT saja) | — |

> **[ASUMSI]** Modul ini TIDAK muncul di navigasi sidebar reguler. Akses pengelolaan hanya via panel admin khusus (route `/admin/master/satuan-kemasan`).

---

## 5. Business Process & User Stories

### State Machine — Status Satuan / Kemasan

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Satuan/kemasan tersedia | Muncul di dropdown semua modul konsumen | → `NONAKTIF` | → `NONAKTIF` |
| `NONAKTIF` | Satuan/kemasan dinonaktifkan | Tidak muncul di dropdown; data historis yang sudah pakai tetap tersimpan | → `AKTIF` | → `AKTIF` |

> **[ASUMSI]** Tidak ada status `DRAFT` — data langsung aktif atau nonaktif. Tidak ada approval berjenjang karena ini data konfigurasi teknis yang dikelola Admin IT.

> **BR penting**: Satuan/kemasan yang sudah dipakai di transaksi historis TIDAK boleh dihapus permanen, hanya dapat dinonaktifkan (soft delete).

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A22-01 | Admin IT / Superadmin | Menambah satuan baru ke master data | Agar satuan tersedia sebagai pilihan dropdown di semua modul yang membutuhkan |
| US-A22-02 | Admin IT / Superadmin | Menambah kemasan baru ke master data | Agar kemasan tersedia sebagai pilihan dropdown di semua modul yang membutuhkan |
| US-A22-03 | Admin IT / Superadmin | Menonaktifkan satuan/kemasan yang sudah tidak digunakan | Agar dropdown di modul konsumen tidak menampilkan pilihan yang sudah obsolet |
| US-A22-04 | Sistem (modul konsumen) | Mengambil daftar satuan aktif via API | Agar dropdown satuan di form modul konsumen (Gizi, Farmasi, dll.) selalu up-to-date |
| US-A22-05 | Sistem (modul konsumen) | Mengambil daftar kemasan aktif via API | Agar dropdown kemasan di form modul konsumen selalu up-to-date |
| US-A22-06 | [Phase 2] Admin IT | Memetakan satuan ke kode UCUM SATUSEHAT | Agar laporan ke SATUSEHAT menggunakan kode terminologi yang valid |

---

## 6. Functional & UI/UX Requirements

### 6.1 UI/UX Requirements

> **Catatan**: Modul ini **tidak memiliki UI end-user**. Panel admin di bawah ini hanya dapat diakses oleh role `SUPERADMIN` dan `ADMIN_IT`. Tidak ada link navigasi di sidebar utama SIMRS.

**General Flow (Admin Panel Only):**
```
Route: /admin/master/satuan-kemasan
  ├─ Tab "Satuan"
  │    ├─ Tabel: Kode, Nama, Singkatan, Kategori, Status, Aksi [Edit][Nonaktifkan]
  │    └─ Tombol [+ Tambah Satuan] → Modal form
  └─ Tab "Kemasan"
       ├─ Tabel: Kode, Nama, Singkatan, Status, Aksi [Edit][Nonaktifkan]
       └─ Tombol [+ Tambah Kemasan] → Modal form
```

**Dashboard / List View:**
- Tampilan tab (Satuan | Kemasan) dalam satu halaman admin.
- Filter status (Aktif / Nonaktif / Semua), search teks pada nama.
- Tidak ada pagination jika total data < 200 baris; paginasi 50 baris/hal jika lebih.
- Tidak ada fitur export/import di Phase 1 (data dikonfigurasi manual oleh Admin IT).

---

### 6.2 Feature Requirements & Acceptance Criteria

---

**Fitur: Tambah Satuan**
* **User Story**: Sebagai Admin IT, saya ingin menambahkan satuan baru ke master data agar satuan tersebut tersedia sebagai pilihan dropdown di semua modul SIMRS.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form memiliki field: Nama Satuan (text, wajib, maks 100 karakter), Singkatan (text, wajib, maks 20 karakter, unik), Kategori (dropdown: Berat / Volume / Jumlah / Panjang / Waktu / Lainnya, wajib), Status (radio: Aktif / Nonaktif, default Aktif).
  * **AC 2**: Singkatan harus unik (case-insensitive); sistem menolak duplikat dan menampilkan pesan: *"Singkatan '[X]' sudah digunakan oleh satuan '[nama]'."*
  * **AC 3**: Setelah disimpan, satuan berstatus `AKTIF` langsung tersedia di endpoint `GET /api/master/satuan`.
  * **AC 4**: Log audit mencatat dan `createdAt`.

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Satuan | Text | Required | "Nama satuan wajib diisi" | "Contoh: Miligram, Mililiter, Tablet" |
  | Nama Satuan | Text | Max 100 karakter | "Nama tidak boleh lebih dari 100 karakter" | — |
  | Singkatan | Text | Required | "Singkatan wajib diisi" | "Contoh: mg, ml, tab, kap" |
  | Singkatan | Text | Max 20 karakter | "Singkatan tidak boleh lebih dari 20 karakter" | — |
  | Singkatan | Text | Unik (server) | "Singkatan '[X]' sudah digunakan oleh satuan '[nama]'" | — |
  | Kategori | Dropdown | Required | "Kategori wajib dipilih" | "Pilih kelompok satuan yang sesuai" |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Field `kode` (auto-generate sistem) tidak ditampilkan di form; hanya tampil di tabel setelah disimpan.
  * **Button State**: Tombol [Simpan] disabled selama field wajib belum terisi atau ada error; spinner + "Menyimpan..." saat request berlangsung.
  * **Empty State**: — (form selalu tampil saat dibuka via modal)

---

**Fitur: Tambah Kemasan**
* **User Story**: Sebagai Admin IT, saya ingin menambahkan kemasan baru ke master data agar kemasan tersebut tersedia sebagai pilihan dropdown di semua modul SIMRS.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form memiliki field: Nama Kemasan (text, wajib, maks 100 karakter), Singkatan (text, wajib, maks 20 karakter, unik), Status (radio: Aktif / Nonaktif, default Aktif).
  * **AC 2**: Singkatan harus unik (case-insensitive) dalam entitas kemasan; sistem menolak duplikat dan menampilkan pesan: *"Singkatan '[X]' sudah digunakan oleh kemasan '[nama]'."*
  * **AC 3**: Setelah disimpan, kemasan berstatus `AKTIF` langsung tersedia di endpoint `GET /api/master/kemasan`.
  * **AC 4**: Log audit mencatat `createdAt`.

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Kemasan | Text | Required | "Nama kemasan wajib diisi" | "Contoh: Botol, Box, Strip, Ampul, Tube" |
  | Nama Kemasan | Text | Max 100 karakter | "Nama tidak boleh lebih dari 100 karakter" | — |
  | Singkatan | Text | Required | "Singkatan wajib diisi" | "Contoh: btl, bx, strp, amp" |
  | Singkatan | Text | Unik (server) | "Singkatan '[X]' sudah digunakan oleh kemasan '[nama]'" | — |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Field `kode` (auto-generate) tidak tampil di form.
  * **Button State**: Tombol [Simpan] disabled selama ada field wajib kosong; spinner saat loading.
  * **Empty State**: — (form via modal, selalu tampil)

---

**Fitur: Edit & Nonaktifkan Satuan / Kemasan**
* **User Story**: Sebagai Admin IT, saya ingin mengubah atau menonaktifkan satuan/kemasan yang sudah tidak relevan agar dropdown di modul lain tidak menampilkan pilihan obsolet.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Edit] membuka modal pre-filled. Field `kode` tidak dapat diubah.
  * **AC 2**: Jika Singkatan diubah dan nilai baru sudah dipakai entri lain, sistem menolak dengan pesan duplikat yang sama seperti Tambah.
  * **AC 3**: Tombol [Nonaktifkan] memunculkan konfirmasi: *"Menonaktifkan '[nama]' akan menyembunyikan pilihan ini dari semua dropdown. Data historis yang sudah menggunakan satuan/kemasan ini tidak terpengaruh. Lanjutkan?"*
  * **AC 4**: Satuan/kemasan yang sudah dipakai di ≥ 1 transaksi historis **tidak dapat dihapus permanen** — hanya dapat dinonaktifkan. Tombol [Hapus] tidak tersedia jika ada referensi historis.
  * **AC 5**: Perubahan langsung tersedia di API (tidak ada cache > 60 detik).

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Singkatan (edit) | Text | Unik (server, exclude self) | "Singkatan '[X]' sudah digunakan oleh [satuan/kemasan] lain: '[nama]'" | — |
  | Tombol [Hapus] — ada referensi historis | Button | Diblokir sistem | Tooltip: "Tidak dapat dihapus karena sudah digunakan di data transaksi. Gunakan [Nonaktifkan] untuk menyembunyikan dari dropdown." | — |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Field `kode` dan `createdAt` ditampilkan sebagai teks info, tidak bisa diedit.
  * **Button State**: [Simpan Perubahan] disabled jika tidak ada perubahan (dirty check); [Hapus] di-hide jika ada referensi historis (bukan disabled — dihilangkan dari UI); [Nonaktifkan] berubah menjadi [Aktifkan] jika status sudah NONAKTIF.
  * **Empty State**: — (form selalu pre-filled)

---

**Fitur: API Internal — Daftar Satuan**
* **User Story**: Sebagai sistem (modul konsumen seperti Farmasi, Gizi, Inventori), saya ingin mengambil daftar satuan aktif agar dapat merender dropdown satuan di form input modul tersebut.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Endpoint `GET /api/master/satuan` tersedia dengan parameter query opsional: `kategori` (filter per kategori), `search` (filter nama/singkatan), `status` (default `AKTIF`).
  * **AC 2**: Response JSON: `[{ "kode": "SAT001", "nama": "Miligram", "singkatan": "mg", "kategori": "Berat" }]`, diurutkan `nama` ascending.
  * **AC 3**: Response di-cache di server selama **60 detik** untuk mengurangi beban DB; cache di-invalidate otomatis saat ada perubahan data satuan.
  * **AC 4**: Endpoint dapat diakses oleh semua service internal tanpa autentikasi tambahan (sudah dalam perimeter internal); **tidak** exposed ke publik.
  * **AC 5**: Jika tidak ada data aktif, response adalah `[]` dengan HTTP 200.
  * **AC 6**: Response time ≤ 200ms (dari cache) / ≤ 500ms (dari DB).

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  *Fitur ini adalah API murni — tidak ada form UI. Validasi ada di sisi server (lihat AC 1–6). Modul konsumen bertanggung jawab atas rendering dropdown menggunakan data dari endpoint ini.*

  **B. State Design (UI/UX)**
  * **Read-only Mode**: — (API only)
  * **Button State**: — (API only)
  * **Empty State**: Modul konsumen wajib menangani response `[]` dengan tampilan: *"[Nama field] belum tersedia. Hubungi Admin IT."* sebagai informasi di dropdown, bukan error fatal.

---

**Fitur: API Internal — Daftar Kemasan**
* **User Story**: Sebagai sistem (modul konsumen), saya ingin mengambil daftar kemasan aktif agar dapat merender dropdown kemasan di form input modul tersebut.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Endpoint `GET /api/master/kemasan` tersedia dengan parameter query opsional: `search` (filter nama/singkatan), `status` (default `AKTIF`).
  * **AC 2**: Response JSON: `[{ "kode": "KEM001", "nama": "Botol", "singkatan": "btl" }]`, diurutkan `nama` ascending.
  * **AC 3**: Response di-cache di server selama **60 detik**; cache di-invalidate otomatis saat ada perubahan data kemasan.
  * **AC 4**: Endpoint hanya untuk service internal — tidak exposed ke publik.
  * **AC 5**: Response time ≤ 200ms (cache) / ≤ 500ms (DB).

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  *API murni — tidak ada form UI. Modul konsumen menangani state dropdown.*

  **B. State Design (UI/UX)**
  * **Read-only Mode**: — (API only)
  * **Button State**: — (API only)
  * **Empty State**: Sama dengan Satuan — modul konsumen tampilkan *"Kemasan belum tersedia. Hubungi Admin IT."* bila response `[]`.

---

**Fitur: [Phase 2] Pemetaan Kode UCUM SATUSEHAT**
* **User Story**: Sebagai Admin IT, saya ingin memetakan setiap satuan ke kode UCUM SATUSEHAT agar laporan ke SATUSEHAT menggunakan terminologi standar nasional yang valid.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Setiap entri satuan memiliki field tambahan `kode_ucum` (text, opsional di Phase 1, wajib di Phase 2 untuk satuan yang dikirim ke SATUSEHAT).
  * **AC 2**: Tersedia tombol [Sinkronisasi dari SATUSEHAT] di panel admin yang mengambil daftar kode UCUM dari SATUSEHAT Terminology API dan menampilkannya sebagai suggestion untuk setiap satuan.
  * **AC 3**: Admin dapat memilih kode UCUM dari hasil sinkronisasi atau menginput manual. Validasi: kode UCUM harus ada di daftar resmi SATUSEHAT.
  * **AC 4**: Satuan yang belum dipetakan ke `kode_ucum` ditandai dengan badge *"Belum dipetakan"* di tabel admin.
  * **AC 5**: Endpoint `GET /api/master/satuan` menambahkan field `kode_ucum` di response Phase 2, bernilai `null` jika belum dipetakan.

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode UCUM | Text / Autocomplete | Harus valid sesuai daftar SATUSEHAT (server) | "Kode UCUM '[X]' tidak ditemukan dalam terminologi SATUSEHAT. Pilih dari daftar saran." | "Contoh: mg (miligram), mL (mililiter), 1 (unit)" |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Kode UCUM yang sudah divalidasi sistem SATUSEHAT ditampilkan dengan ikon centang hijau; yang belum dipetakan tampil badge kuning *"Belum dipetakan"*.
  * **Button State**: [Sinkronisasi dari SATUSEHAT] disabled + spinner "Mengambil data..." saat request berlangsung; timeout 30 detik dengan pesan error jika SATUSEHAT API tidak merespons.
  * **Empty State**: Jika SATUSEHAT API tidak mengembalikan data: *"Gagal mengambil terminologi SATUSEHAT. Coba lagi atau input kode UCUM secara manual."*

---

## 7. Data & Business Rules

### 7.1 Spesifikasi Data — Entitas Satuan

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `kode` | Kode | String | Auto | Format: `SAT` + 3 digit (SAT001, SAT002, ...) | Sistem auto-generate | Primary key, immutable setelah dibuat |
| `nama` | Nama Satuan | String | Ya | Maks 100 karakter; tidak boleh kosong | Input Admin IT | Contoh: "Miligram", "Mililiter", "Tablet" |
| `singkatan` | Singkatan | String | Ya | Maks 20 karakter; unik case-insensitive dalam tabel satuan | Input Admin IT | Contoh: "mg", "ml", "tab" |
| `kategori` | Kategori | Enum | Ya | `BERAT`, `VOLUME`, `JUMLAH`, `PANJANG`, `WAKTU`, `LAINNYA` | Dropdown sistem | Digunakan modul konsumen untuk filter dropdown kontekstual |
| `status` | Status | Enum | Ya | `AKTIF`, `NONAKTIF` | Input Admin IT | Default: `AKTIF` |
| `kode_ucum` | Kode UCUM | String | Tidak (P1) / Ya (P2) | Validasi ke SATUSEHAT Terminology API | Phase 2: input Admin IT + API SATUSEHAT | Null di Phase 1 |
| `created_at` | — | Timestamp | Auto | Auto server time | Sistem | Log audit |
| `updated_at` | — | Timestamp | Auto | Auto server time | Sistem | Diperbarui tiap edit |
| `delete_at` | — | Timestamp | Auto | Auto server time | Sistem | Diperbarui tiap edit |

### 7.2 Spesifikasi Data — Entitas Kemasan

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `kode` | Kode | String | Auto | Format: `KEM` + 3 digit (KEM001, KEM002, ...) | Sistem auto-generate | Primary key, immutable |
| `nama` | Nama Kemasan | String | Ya | Maks 100 karakter; tidak boleh kosong | Input Admin IT | Contoh: "Botol", "Box", "Strip", "Ampul", "Tube", "Sachet" |
| `singkatan` | Singkatan | String | Ya | Maks 20 karakter; unik case-insensitive dalam tabel kemasan | Input Admin IT | Contoh: "btl", "bx", "strp", "amp" |
| `status` | Status | Enum | Ya | `AKTIF`, `NONAKTIF` | Input Admin IT | Default: `AKTIF` |
| `created_at` | — | Timestamp | Auto | Auto server time | Sistem | Log audit |
| `updated_at` | — | Timestamp | Auto | Auto server time | Sistem | Diperbarui tiap edit |
| `delete_at` | — | Timestamp | Auto | Auto server time | Sistem | Diperbarui tiap edit |

### 7.3 Spesifikasi Tampilan — Tabel Admin (List View)

**Tab Satuan:**
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kode | `kode` | String | Sort | — |
| Nama Satuan | `nama` | String | Search, Sort | — |
| Singkatan | `singkatan` | String uppercase | Search | — |
| Kategori | `kategori` | Label teks | Filter dropdown | — |
| Status | `status` | Badge: Aktif (hijau) / Nonaktif (abu) | Filter | — |
| [P2] Kode UCUM | `kode_ucum` | String / Badge "Belum dipetakan" (kuning) | Filter | Hanya tampil di Phase 2 |
| Aksi | — | [Edit] [Nonaktifkan/Aktifkan] [Hapus*] | — | *[Hapus] hanya jika tidak ada referensi historis |

**Tab Kemasan:**
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kode | `kode` | String | Sort | — |
| Nama Kemasan | `nama` | String | Search, Sort | — |
| Singkatan | `singkatan` | String | Search | — |
| Status | `status` | Badge Aktif / Nonaktif | Filter | — |
| Aksi | — | [Edit] [Nonaktifkan/Aktifkan] [Hapus*] | — | *[Hapus] hanya jika tidak ada referensi historis |

### 7.4 Business Rules

| ID | Aturan |
|----|--------|
| BR-A22-01 | Singkatan satuan harus **unik** dalam tabel satuan (case-insensitive). Singkatan kemasan harus unik dalam tabel kemasan. Singkatan boleh sama antara satuan dan kemasan (berbeda entitas). |
| BR-A22-02 | Satuan/kemasan yang sudah dipakai dalam ≥ 1 record transaksi di modul manapun **tidak dapat dihapus permanen**. Hanya dapat dinonaktifkan. Sistem harus mengecek referensi sebelum mengizinkan hapus. |
| BR-A22-03 | Modul konsumen **wajib** mengambil data satuan/kemasan dari API ini, bukan hard-code. Pengecualian hanya boleh dengan persetujuan tertulis dari tim IT dan dicatat sebagai technical debt. |
| BR-A22-04 | Dropdown di modul konsumen hanya menampilkan satuan/kemasan berstatus `AKTIF`. Data historis yang sudah terlanjur menggunakan satuan/kemasan `NONAKTIF` tetap valid dan ditampilkan apa adanya di view detail — tidak perlu fallback label. |
| BR-A22-05 | Field `kategori` pada satuan digunakan modul konsumen untuk filter kontekstual. Contoh: form Farmasi dapat request `?kategori=BERAT,VOLUME` untuk hanya menampilkan satuan relevan. |
| BR-A22-06 | [Phase 2] Satuan yang digunakan dalam laporan ke SATUSEHAT **wajib** memiliki `kode_ucum` yang valid. Sistem harus memblokir pengiriman data ke SATUSEHAT jika satuan yang dipakai belum dipetakan. |
| BR-A22-07 | [PERLU KONFIRMASI] Apakah singkatan satuan case-sensitive saat ditampilkan di dropdown modul konsumen? Diasumsikan ditampilkan sesuai yang diinput Admin IT (mixed case diperbolehkan). |

---

## 8. Workflow / BPMN Interpretation

> [ASUMSI] Tidak tersedia file BPMN spesifik untuk modul ini. Alur berikut disusun berdasarkan pola master data referensi dan kebutuhan fungsional.

### Alur Phase 1 — Setup & Konsumsi Data

```
[Admin IT — Setup awal (one-time & maintenance)]
  │
  ├─ Login ke /admin/master/satuan-kemasan
  ├─ Tab "Satuan" → [+ Tambah Satuan] → Isi form → Simpan
  │    └─ Satuan AKTIF → masuk DB → tersedia via API
  ├─ Tab "Kemasan" → [+ Tambah Kemasan] → Isi form → Simpan
  │    └─ Kemasan AKTIF → masuk DB → tersedia via API
  └─ Jika perlu nonaktifkan: [Nonaktifkan] → Konfirmasi → Status jadi NONAKTIF
       └─ Cache API di-invalidate → modul konsumen tidak tampilkan lagi di dropdown

[Modul Konsumen — misal: Master Data Gizi, Form Input Barang Farmasi]
  │
  ├─ Saat form dimuat (onMount):
  │    ├─ GET /api/master/satuan?kategori=BERAT,VOLUME → render dropdown "Satuan"
  │    └─ GET /api/master/kemasan → render dropdown "Kemasan"
  ├─ User pilih satuan/kemasan dari dropdown
  └─ Nilai `kode` satuan/kemasan disimpan sebagai foreign key di tabel modul konsumen
```

### Alur Phase 2 — Pemetaan UCUM

```
[Admin IT — Pemetaan SATUSEHAT]
  │
  ├─ Tab "Satuan" → Klik [Sinkronisasi dari SATUSEHAT]
  │    └─ Sistem fetch SATUSEHAT Terminology API → tampil daftar kode UCUM resmi
  ├─ Untuk setiap satuan yang belum dipetakan (badge kuning):
  │    ├─ Klik [Edit] → pilih kode UCUM dari autocomplete / input manual
  │    └─ Simpan → `kode_ucum` diisi → badge berubah jadi centang hijau
  └─ Semua satuan aktif sudah dipetakan → siap untuk integrasi laporan SATUSEHAT
```

---

## 9. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-A22-01 | Performa | Endpoint `/api/master/satuan` dan `/api/master/kemasan` response time ≤ 200ms (dari cache); ≤ 500ms (dari DB) |
| NFR-A22-02 | Caching | Response API di-cache server-side 60 detik; wajib di-invalidate saat ada perubahan data (tambah/edit/nonaktifkan) |
| NFR-A22-03 | Keamanan | Panel admin `/admin/master/satuan-kemasan` hanya dapat diakses oleh role `SUPERADMIN` dan `ADMIN_IT` — redirect 403 untuk role lain |
| NFR-A22-04 | Keamanan | Endpoint API internal tidak exposed ke publik/client-side browser; hanya untuk service-to-service internal |
| NFR-A22-05 | Integritas data | Soft delete only — tidak ada hard delete jika ada referensi historis (dicek via FK constraint atau aplikasi sebelum hapus) |
| NFR-A22-06 | Audit | Setiap perubahan data mencatat `updatedAt` — tersimpan minimal 1 tahun |
| NFR-A22-07 | [Phase 2] Keamanan | Token SATUSEHAT API disimpan terenkripsi; tidak disimpan plaintext |

---

## 10. Panduan Integrasi untuk Modul Konsumen

> Bagian ini ditujukan untuk developer modul lain yang akan mengonsumsi API satuan & kemasan.

### Cara Menggunakan Dropdown Satuan

```http
GET /api/master/satuan?status=AKTIF&kategori=BERAT,VOLUME
```

**Response contoh:**
```json
[
  { "kode": "SAT001", "nama": "Miligram", "singkatan": "mg", "kategori": "BERAT" },
  { "kode": "SAT002", "nama": "Gram", "singkatan": "g", "kategori": "BERAT" },
  { "kode": "SAT003", "nama": "Mililiter", "singkatan": "ml", "kategori": "VOLUME" }
]
```

**Yang disimpan ke DB modul konsumen**: field `kode` (mis. `"SAT001"`), bukan `nama` atau `singkatan` — untuk menghindari inkonsistensi jika nama satuan diubah di master data.

### Cara Menggunakan Dropdown Kemasan

```http
GET /api/master/kemasan?status=AKTIF
```

**Yang disimpan ke DB modul konsumen**: field `kode` (mis. `"KEM001"`).

### Konvensi Tampilan di Modul Konsumen

- Dropdown menampilkan: `[nama] ([singkatan])` — contoh: *"Miligram (mg)"*
- Jika response API kosong `[]`: tampilkan placeholder *"[Nama field] belum tersedia. Hubungi Admin IT."* — jangan tampilkan dropdown kosong tanpa keterangan.
- Jika API error: tampilkan *"Gagal memuat daftar [satuan/kemasan]. Coba refresh halaman."* — jangan block submit form secara keseluruhan.

---

## 11. Open Questions & Assumptions

### Asumsi
- [ASUMSI] Satuan dan kemasan adalah dua entitas terpisah — tidak ada relasi parent-child antara keduanya di Phase 1.
- [ASUMSI] Tidak ada approval berjenjang untuk tambah/edit satuan/kemasan; langsung aktif setelah disimpan Admin IT.
- [ASUMSI] Modul ini tidak memiliki menu di sidebar navigasi utama SIMRS; hanya dapat diakses via URL admin langsung.
- [ASUMSI] Kode UCUM dari SATUSEHAT bersifat internasional (standar UCUM) dan tidak berubah sering — cukup sinkronisasi manual di Phase 2.

### Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah perlu relasi antara satuan dan kemasan? Misalnya: 1 strip (kemasan) = 10 tablet (satuan) — apakah konversi ini perlu disimpan di Phase 1 atau cukup di Phase 2?
- [PERLU KONFIRMASI] Apakah ada daftar satuan & kemasan awal yang sudah disetujui oleh tim Farmasi/Gizi yang perlu di-seed saat pertama deploy?
- [PERLU KONFIRMASI] Apakah field `kategori` pada satuan sudah cukup dengan 6 nilai yang ada, atau ada kategori tambahan yang dibutuhkan tim klinis?
- [PERLU KONFIRMASI] Untuk modul yang butuh satuan DAN kemasan sekaligus di satu field (mis. "500 mg/tablet"), apakah penggabungan ini dilakukan di modul konsumen atau ada entitas baru "Satuan Kemasan Gabungan"?
