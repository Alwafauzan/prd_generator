# Product Requirement Document (PRD)
# A6 — Master Data Barang Gizi

---

## 1. Metadata Dokumen

* **Approval**: [Nama Kepala Instalasi Gizi / Ahli Gizi Penanggung Jawab / Manajer Operasional, Jabatan, Tanggal]
* **Related Documents**:
  * A33 — Master Data Kategori Barang (lookup kategori, **Kelompok Barang Gizi**)
  * A22 — Master Data Satuan & Kemasan (lookup satuan/kemasan + konversi)
  * A54 — Master Data Pabrikan (referensi pabrikan/principal)
  * A7 — Master Data Supplier (dipakai saat Pemesanan, bukan disimpan di master)
  * A9 — Menu Makanan (konsumen — komposisi bahan menu)
  * F7 — Order makanan gizi, F9 — Penggunaan barang gizi (konsumen operasional)
  * A5 — Master Data Barang Rumah Tangga (pola CRUD master barang non-medis setara)
  * A4 — Master Data Barang Farmasi (pola CRUD master barang + integrasi)
  * A51 — Konfigurasi Persediaan / COA (acuan pemetaan akun, Phase 3)
  * A53 — Admin RBAC (otorisasi akses CRUD master)
  * List Fitur V2.xlsx (sheet MVP) — A6
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-30 | 1.0 | PRD awal A6 Master Data Barang Gizi — format `template (1).md` (9 seksi). Konvensi: **Kode auto-generate** (prefix Kategori + nomor urut, readable, immutable), **tanpa hard delete** (soft nonaktif), **harga & konversi satuan (multi-aturan) dikelola di master ini**, **ekspor/impor `.csv`**, **COA per barang (Phase 3)**, **Status tidak diinput di form** (auto AKTIF), **supplier dipilih saat Pemesanan**. |
| 2026-06-30 | 1.1 | (1) **Hapus field Kemasan** — relasi antar-satuan diatur via section Konversi Satuan; (2) **nilai gizi/nutrisi dikelola di A9 Menu Makanan** (bukan A6); (3) filter Kategori memakai field **'Kelompok Barang' = "Gizi"** pada A33. |

> Catatan: Barang Gizi adalah **bahan makanan/nutrisi** (mis. beras, lauk, sayur, buah, bumbu, susu, makanan/minuman pendukung gizi) — **non-medis/non-farmasi**. Modul ini mengelola **definisi barang gizi** (master), **bukan stok/saldo/batch/ED** (domain Inventori/Gudang Gizi) dan **bukan komposisi/penyajian menu** (domain A9 Menu Makanan & modul Gizi).

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Barang Gizi** (code **A6**, cluster **Control Panel → Master Data**) digunakan untuk mengelola seluruh informasi dasar **bahan/barang gizi** yang dipakai Instalasi Gizi/Dapur rumah sakit — bahan makanan pokok, lauk, sayur, buah, bumbu, serta makanan/minuman pendukung gizi.

Data ini menjadi **single source of truth** dan referensi utama bagi modul yang mengonsumsi barang gizi: **Menu Makanan (A9)** (komposisi bahan per menu), **Order & Penggunaan barang gizi (F7/F9)**, **Inventori/Gudang Gizi** (penerimaan, distribusi, stok opname), dan **Keuangan** (COA/persediaan). Dengan modul ini, **Admin Master Data / Ahli Gizi** dapat mengelola barang gizi secara mandiri tanpa intervensi tim teknis, menjamin keseragaman informasi antar unit, dan memastikan referensi bahan terbaca real-time oleh modul lain.

> **[ASUMSI]** Lingkup teknis modul ini adalah **CRUD master data sederhana** (tambah, lihat, ubah, aktif/nonaktif) plus **ekspor/impor file `.csv`** (Phase 2) dan **pemetaan COA per barang** (Phase 3). Proses penerimaan/pengeluaran/stok opname ditangani Inventori/Gudang Gizi; komposisi & penyajian menu ditangani A9 Menu Makanan; Kategori (A33), Satuan/Kemasan (A22), Pabrikan (A54) ditangani modul masing-masing — A6 hanya **merujuk** (lookup). Modul **tidak memiliki BPMN sendiri**; pola CRUD diturunkan dari master barang sejenis (A5 Barang RT, A4 Barang Farmasi).

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):** *([ASUMSI] — diturunkan dari pola RS Tipe C&D + master sejenis)*
- Data bahan gizi dicatat manual di Excel/kertas, **tersebar & terduplikasi** antar unit (dapur, gudang, keuangan).
- **Inkonsistensi** nama bahan, satuan, atau harga antar modul karena tiap unit menyalin data sendiri.
- **Keterlambatan pembaruan** ketika ada perubahan supplier/harga; tidak ada satu sumber acuan untuk komposisi menu.
- **Ketergantungan pada tim teknis/IT** untuk menambah bahan baru atau mengoreksi data.
- Tidak ada **audit trail** — perubahan harga/satuan tidak terlacak.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin/Ahli Gizi mengelola seluruh barang gizi via form CRUD terpusat (tambah, lihat, ubah, aktif/nonaktif) **tanpa tim teknis**.
- Kategori & Satuan dipilih dari **lookup master** (A33/A22) — bukan free-text — sehingga data terstandar sejak input; Kategori **difilter ke Kelompok Barang "Gizi"**.
- Sistem melakukan **validasi otomatis** (field wajib, format, duplikasi), menyimpan ke DB master, dan **mem-publish referensi real-time** ke Menu Makanan (A9)/Inventori/Keuangan tanpa restart.
- Setiap aksi create/update/status-change **dicatat di audit trail**.
- **Phase 2**: Ekspor & Impor massal via file **.csv**. **Phase 3**: Pemetaan akun COA persediaan **per barang**.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi data antar modul | 100% modul (Menu Makanan, Inventori, Keuangan) menggunakan referensi barang gizi yang sama |
| 2 | Kemandirian user non-teknis | 100% Admin/Ahli Gizi mampu setup & memperbarui data tanpa tim teknis |
| 3 | Kecepatan baca perubahan | 100% perubahan data terbaca real-time oleh modul lain tanpa restart |
| 4 | Kecepatan pencarian/filter | Hasil pencarian/filter barang gizi tampil < 3 detik |
| 5 | Integritas data (tanpa hard delete) | 0 barang terhapus permanen; 100% upaya hapus diarahkan ke nonaktif (soft) |
| 6 | Standardisasi referensi | 0 barang tersimpan dengan Kategori/Satuan free-text; 100% mengacu master A33 (Kelompok Barang Gizi)/A22 aktif |
| 7 | Keterlacakan perubahan | 100% aksi create/update/status-change tercatat di audit trail (user, waktu, before→after) |
| 8 | Kelengkapan ekspor [Phase 2] | 100% field barang gizi ikut terekspor pada file `.csv` (tidak ada kolom hilang) |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) | Phase 3 |
|---------------|---------------------|---------------------|---------|
| Dashboard Barang Gizi | List, search (Nama/Kode), filter (Kategori/Status), sort, pagination 10/halaman | — | — |
| Tambah Barang Gizi | Form tervalidasi (lookup A33 Kelompok Barang Gizi/A22/A54); Kode auto; status auto `AKTIF` | — | — |
| Detail / Ubah Barang Gizi | Pre-filled, edit field (Kode immutable), validasi sama dengan Tambah | — | — |
| Konversi Satuan (multi-aturan) | Section input di master ini (tambah baris aturan) | — | — |
| Aktif / Nonaktifkan Barang Gizi | Soft status toggle di Dashboard; **tanpa hard delete** | — | — |
| Duplicate detection | Kode unik (auto) + (Nama+Kategori+Satuan) tidak duplikat | — | — |
| Riwayat Aktivitas / Audit Trail | Log create/update/status-change | — | — |
| Ekspor Data Barang Gizi | — | Ekspor **`.csv`** seluruh field sesuai filter aktif | — |
| Impor Massal Barang Gizi | — | **Impor via file `.csv`** (`file_import`/`mode_import`) + template + validasi per baris + laporan error | — |
| Pemetaan Akun COA Persediaan | — | — | Map COA **per barang** (acuan A51) |

> **Out of Scope**:
> * Proses penerimaan, pengeluaran, dan stok opname bahan gizi (modul Inventori/Gudang Gizi) — A6 hanya menyimpan definisi barang, **bukan stok/saldo**.
> * **Komposisi & penyajian menu** (modul **A9 Menu Makanan**), order & penggunaan barang gizi (F7/F9) — A6 hanya menyediakan referensi bahan.
> * CRUD Master Kategori (A33), Satuan & Kemasan (A22), Pabrikan (A54) — dikelola modul masing-masing; A6 hanya merujuk (lookup).
> * Proses pengadaan/pemesanan & **pemilihan supplier** (modul Pemesanan); A6 **tidak menyimpan supplier** pada master barang.
> * **Hard delete** barang — **tidak ada fitur hard delete sama sekali**; penghapusan diganti soft nonaktif.
> * **Nilai gizi/kandungan nutrisi** (kalori, protein, dll) — dikelola di **A9 Menu Makanan**, bukan di A6.

---

## 5. Related Features

| Code | Module | Relasi Teknis / Bisnis |
|------|--------|------------------------|
| A33 | Master Data Kategori Barang | **Lookup wajib** sumber `kategori_id` — **hanya kategori dengan Kelompok Barang "Gizi"** yang ditampilkan (filter field 'Kelompok Barang'), master aktif (bukan free-text) — BR-A6-04. |
| A22 | Master Data Satuan & Kemasan | **Lookup** sumber `satuan` (& satuan untuk aturan konversi); **konversi satuan (multi-aturan)** dikelola di A6. Tidak ada field Kemasan terpisah di A6. |
| A54 | Master Data Pabrikan | **Lookup read-only** sumber `pabrikan_id` — hanya referensi. |
| A7 | Master Data Supplier | Dipakai saat **Pemesanan** — supplier dipilih pada pemesanan/pengadaan, **tidak disimpan di master barang gizi A6**. |
| **A9** | Menu Makanan | **Konsumen** — memakai referensi barang gizi A6 sebagai **komposisi bahan** per menu. |
| **F7 / F9** | Order makanan gizi / Penggunaan barang gizi | **Konsumen** — memakai referensi barang gizi untuk order & pencatatan penggunaan. |
| — | Inventori / Gudang Gizi | **Konsumen** — membaca referensi barang gizi untuk penerimaan/pengeluaran/stok opname (real-time). |
| A5 | Barang Rumah Tangga | **Pola/template CRUD** master barang non-medis setara. |
| A4 | Barang Farmasi | **Pola/template CRUD** master barang (A4 + integrasi; A6 tanpa integrasi). |
| A53 | Admin RBAC | **Otorisasi** akses menu & aksi CRUD master. |
| A51 | Konfigurasi Persediaan / COA | **Acuan** pemetaan akun COA persediaan barang gizi (Phase 3). |
| — | Keuangan (Persediaan) | **Konsumen** — membaca `harga_beli`/`het` (dikelola di A6) & pemetaan COA per barang (Phase 3). |

> Field kanonik bersama: `kode`, `nama`, `keterangan`, `satuan`, `status_aktif`, `file_import`, `mode_import` mengikuti definisi kanonik di kamus `_shared/dictionary.json`.

---

## 6. Business Process & User Stories

### State Machine — Status Barang Gizi

| Status | Deskripsi | Efek ke Modul Lain | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------|--------------------|--------------------|
| `AKTIF` | Barang gizi aktif & dapat dipakai | Tampil di lookup Menu Makanan (A9)/Inventori; dapat dipakai komposisi & stok | → `NONAKTIF` (soft, via toggle) | Sama (CRUD murni) |
| `NONAKTIF` | Barang gizi dinonaktifkan (soft) | Tidak dapat dipilih sebagai opsi baru; komposisi/stok historis tetap utuh | → `AKTIF` (reaktivasi) | Sama |

> **Tidak ada fitur hard delete sama sekali** — seluruh penghapusan berupa soft `NONAKTIF` agar histori & integritas relasi terjaga (BR-A6-08). Default status saat Tambah = `AKTIF` (di-set sistem, **tidak** ada input status di form Tambah). Kolom `status_approval`/`role_approver` disiapkan SIAP Phase 2 namun MVP tanpa approval berjenjang.

### User Stories Utama

| ID | Sebagai | Ingin | Agar | Prioritas | Fase |
|----|---------|-------|------|-----------|------|
| US-A6-01 | Admin/Ahli Gizi | Melihat Dashboard barang gizi (search/filter/sort/pagination) | Data bahan gizi mudah dipantau | P0 | Phase 1 |
| US-A6-02 | Admin/Ahli Gizi | Menambah barang gizi baru lewat form tervalidasi | Data bahan terstandar sejak input | P0 | Phase 1 |
| US-A6-03 | Admin/Ahli Gizi | Melihat & mengubah detail barang gizi | Perubahan harga/satuan/atribut selalu mutakhir & tersinkron | P0 | Phase 1 |
| US-A6-04 | Admin/Ahli Gizi | Menetapkan aturan konversi satuan (multi) | Konversi bahan akurat untuk komposisi & stok | P1 | Phase 1 |
| US-A6-05 | Admin/Ahli Gizi | Menonaktifkan barang gizi (soft) | Bahan tak terpakai disembunyikan tanpa hilang histori | P0 | Phase 1 |
| US-A6-06 | Admin Master Data | Mengekspor data barang gizi ke file `.csv` | Pelaporan/backup lengkap | P2 | Phase 2 |
| US-A6-07 | Admin Master Data | Mengimpor data barang gizi massal via template `.csv` | Setup awal/migrasi cepat | P2 | Phase 2 |
| US-A6-08 | Admin Keuangan | Memetakan akun COA per barang gizi | Pencatatan persediaan otomatis sesuai jurnal | P3 | Phase 3 |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard & Pencarian Barang Gizi**
* **User Story**: Sebagai Admin/Ahli Gizi, saya ingin melihat seluruh daftar barang gizi dengan pencarian, filter, sort, dan pagination agar cepat menemukan bahan tertentu (< 3 detik).
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Menu Master Data → Barang Gizi menampilkan tabel kolom: Nomor, Kode, Nama Barang, Kategori, Satuan, Pabrikan, Status, Aksi; plus kartu ringkas Total Barang Aktif & Total Barang Nonaktif.
  * **AC 2**: Semua kolom dapat di-sort (Asc/Desc); default sort Nama ascending (A–Z).
  * **AC 3**: Pencarian teks bebas memfilter baris berdasarkan **Nama** dan **Kode**.
  * **AC 4**: Tersedia filter **Kategori** (dari A33, hanya Kelompok Barang Gizi) dan **Status** (Aktif/Nonaktif).
  * **AC 5**: Pagination menampilkan 10 data per halaman (server-side untuk ribuan barang).
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Search | Text | — | — | "Cari nama atau kode barang gizi..." |
  | Filter Kategori | Dropdown | — | — | "Semua Kategori" (default); pilihan hanya kategori Kelompok Barang Gizi |
  | Filter Status | Dropdown | — | — | "Semua Status" (default) |

---

**Fitur: Tambah Barang Gizi**
* **User Story**: Sebagai Admin/Ahli Gizi, saya ingin menambah barang gizi baru lewat form tervalidasi agar data bahan terstandar sejak input.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form Tambah Barang menyediakan field: Nama (wajib), Kategori (dropdown lookup A33 Kelompok Barang Gizi, wajib), Satuan (dropdown lookup A22, wajib), Pabrikan (lookup A54, opsional), Harga Beli (opsional), HET (opsional), **Masa Simpan (opsional, satuan Hari)**, Barcode/SKU (opsional), Keterangan (opsional). **Kode di-generate sistem otomatis** (unik, format readable) — tidak diinput manual. **Tidak ada input Status** — status di-set `AKTIF` oleh sistem. **Tidak ada input Supplier** — supplier dipilih saat Pemesanan. Aturan konversi antar-satuan diisi pada **section Konversi Satuan** (AC 5).
  * **AC 2**: Saat simpan, sistem **men-generate Kode otomatis** yang **unik & readable** (prefix Kategori + nomor urut); Kode tidak diinput/diubah manual dan bersifat immutable setelah dibuat.
  * **AC 3**: Sistem menolak simpan jika kombinasi **Nama + Kategori + Satuan** sudah ada — tampil peringatan duplikat & minta konfirmasi/koreksi.
  * **AC 4**: Field **Kategori** hanya menampilkan kategori dari A33 yang **aktif & Kelompok Barang "Gizi"** (bukan Farmasi/Rumah Tangga); field **Satuan** dari A22 aktif. Keduanya bukan free-text & wajib divalidasi sebelum simpan.
  * **AC 5**: Form menyediakan **section Konversi Satuan** (opsional, **multi-aturan**) berupa tabel; user dapat **menambah/menghapus baris** aturan. Tiap baris: **Satuan Besar** | **Jumlah (faktor)** | **Satuan Kecil** — bermakna *1 [Satuan Besar] = [faktor] [Satuan Kecil]* (mis. 1 Karung = 25 Kg; 1 Kg = 1000 Gram). Faktor wajib > 0; Satuan dari master A22 aktif; pasangan (Satuan Besar–Satuan Kecil) **unik per barang**, Satuan Kecil ≠ Satuan Besar.
  * **AC 6**: Setelah berhasil simpan, sistem redirect ke Dashboard, data baru tampil real-time (status Aktif), notifikasi *"Data Berhasil Disimpan"*; tombol [Kembali] membatalkan tanpa menyimpan.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Barang | Auto (read-only) | Di-generate sistem, unik, format readable | — | "Kode dibuat otomatis oleh sistem" |
  | Nama Barang | Text | Required, maks 100 char | "Nama barang wajib diisi" / "Nama melebihi 100 karakter ([X]/100)" | "Contoh: Beras Premium / Ayam Fillet" |
  | Kategori | Dropdown (lookup A33) | Required, dari master aktif **Kelompok Barang Gizi** | "Kategori wajib dipilih" | "Hanya kategori Kelompok Barang Gizi" |
  | Satuan | Dropdown (lookup A22) | Required, dari master aktif | "Satuan wajib dipilih" | "Pilih dari Master Satuan & Kemasan; konversi di section Konversi Satuan" |
  | Pabrikan | Dropdown (lookup A54) | Opsional, read-only master | — | "Referensi pabrikan (opsional)" |
  | Harga Beli | Number | Opsional, ≥ 0, format Rupiah | "Harga beli tidak boleh negatif" | "Dikelola di master ini (dikonsumsi Keuangan/Pengadaan)" |
  | HET | Number | Opsional, ≥ 0, format Rupiah | "HET tidak boleh negatif" | "Harga Eceran Tertinggi (opsional)" |
  | Masa Simpan | Number (integer) | Opsional, > 0, satuan **Hari** | "Masa simpan harus lebih dari 0 hari" | "Perkiraan masa simpan bahan dalam satuan Hari (mis. 30)" |
  | Barcode / SKU | Text | Opsional, maks 50 char | "Barcode melebihi 50 karakter" | "[PERLU KONFIRMASI] kebutuhan barcode" |
  | Keterangan | Textarea | Opsional, maks 255 char | "Keterangan melebihi 255 karakter ([X]/255)" | "Keterangan tambahan (opsional)" |

  **B. Section Konversi Satuan (Input — multi-aturan)**
  Tabel input dinamis; tombol **[+ Tambah Aturan Konversi]** menambah baris, ikon hapus per baris. Tiap baris = *1 [Satuan Besar] = [Faktor] [Satuan Kecil]*.

  | Kolom (per baris) | Tipe Input | Rules | Error Message | Helper Text |
  |-------------------|------------|-------|---------------|-------------|
  | Satuan Besar | Dropdown (lookup A22) | Required (bila baris diisi), master aktif | "Satuan besar wajib dipilih" | "mis. Karung" |
  | Faktor (Jumlah) | Number | Required, > 0 | "Faktor harus lebih dari 0" | "Jumlah satuan kecil per 1 satuan besar (mis. 25)" |
  | Satuan Kecil | Dropdown (lookup A22) | Required (bila baris diisi), master aktif, ≠ Satuan Besar | "Satuan kecil wajib dipilih & berbeda dari satuan besar" | "mis. Kg" |
  | Aksi | Button | — | — | "[+ Tambah Aturan] / hapus baris" |

  *Aturan: pasangan (Satuan Besar–Satuan Kecil) **unik per barang**; section opsional (0..n baris) — BR-A6-18.*

---

**Fitur: Detail & Ubah Barang Gizi**
* **User Story**: Sebagai Admin/Ahli Gizi, saya ingin melihat & mengubah detail barang gizi agar perubahan harga/atribut/konversi selalu mutakhir dan tersinkron ke modul terkait.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Detail Barang menampilkan seluruh atribut; field dapat diubah **kecuali Kode** (immutable) & field audit (`created_by`/`created_at`).
  * **AC 2**: Perubahan tunduk validasi sama dengan Tambah (Kategori Kelompok Barang Gizi, duplikat Nama+Kategori+Satuan, lookup Kategori/Satuan, **aturan konversi multi-aturan**). Section Konversi Satuan dapat ditambah/dihapus barisnya.
  * **AC 3**: Perubahan valid tersimpan & tersinkron otomatis (real-time) ke Menu Makanan (A9)/Inventori/Keuangan.
  * **AC 4**: Halaman Detail menyediakan tab **Riwayat Aktivitas** menampilkan log create/update/status-change.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Barang | Auto (read-only) | Tidak dapat diubah (di-generate sistem) | — | "Kode immutable setelah dibuat" |
  | Nama / Kategori / Satuan | (sama Tambah) | Required, duplicate check, Kategori Kelompok Barang Gizi | (sama Tambah) | — |
  | Section Konversi Satuan | Tabel multi-baris (lihat Tambah) | Tiap aturan faktor > 0, satuan kecil ≠ besar, pasangan unik | "Faktor harus > 0; pasangan satuan unik" | "Tambah/hapus baris aturan konversi" |

---

**Fitur: Aktif / Nonaktifkan Barang Gizi (Status Toggle di Dashboard)**
* **User Story**: Sebagai Admin/Ahli Gizi, saya ingin menonaktifkan bahan yang tidak dipakai tanpa menghapus data, agar histori komposisi/stok tetap utuh.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Status dikelola via **toggle di Dashboard** (bukan di form Tambah). Mengubah ke `NONAKTIF` mengubah `status_aktif` tanpa menghapus data.
  * **AC 2**: **Tidak ada fitur hapus permanen (hard delete)** — penghapusan selalu berupa Nonaktif (soft). Barang yang pernah dipakai komposisi/transaksi tetap tersimpan & tampil di histori.
  * **AC 3**: Barang `NONAKTIF` tidak muncul sebagai opsi baru di Menu Makanan/Inventori, namun tetap tampil pada data historis.
  * **AC 4**: Setiap perubahan status tercatat di audit trail (user, waktu, before→after).
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Status (toggle) | Toggle/Switch | Soft status; **tidak ada hard delete** | "Penghapusan permanen tidak tersedia — gunakan Nonaktifkan." | "Nonaktif menyembunyikan barang dari opsi baru, histori tetap" |

---

**Fitur: [Phase 2] Ekspor Data Barang Gizi**
* **User Story**: Sebagai Admin Master Data, saya ingin mengekspor data barang gizi ke file `.csv` agar mudah dipakai pelaporan/backup.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Ekspor] di header Dashboard menghasilkan file **`.csv`** berisi **SELURUH field** barang gizi sesuai **filter aktif** (Kode, Nama, Kategori, Satuan, Aturan Konversi, Pabrikan, Harga Beli, HET, Masa Simpan (Hari), Barcode, Keterangan, Status). Kolom **Aturan Konversi** memuat seluruh aturan barang (mis. `1 Karung=25 Kg; 1 Kg=1000 Gram`).
  * **AC 2**: Baris pertama = header kolom; ekspor tidak memblokir UI.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Tombol Ekspor | Button | — | "Tidak ada data untuk diekspor" | "File **.csv** (UTF-8), seluruh field sesuai filter aktif" |

---

**Fitur: [Phase 2] Impor Massal Barang Gizi via File**
* **User Story**: Sebagai Admin Master Data, saya ingin mengimpor data barang gizi massal via template `.csv` agar setup awal/migrasi cepat.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Impor] membuka dialog upload file **`.csv`** (`file_import`/`mode_import`); template dapat diunduh (kolom: nama, kategori, satuan, konversi, pabrikan, harga_beli, het, masa_simpan, barcode, keterangan). Kolom **konversi** memuat aturan multi (format `SatuanBesar=faktor>SatuanKecil`, antar-aturan dipisah `;`). **Kode tidak disertakan** — di-generate sistem otomatis per baris.
  * **AC 2**: Sistem memvalidasi setiap baris: field wajib (Nama, Kategori, Satuan), duplikat Nama+Kategori+Satuan, lookup Kategori (Kelompok Barang Gizi)/Satuan valid, aturan konversi.
  * **AC 3**: Mode `tambah` melewati duplikat & melaporkan; mode `tambah+update` memperbarui existing.
  * **AC 4**: Setelah impor, Dashboard menampilkan data baru real-time + ringkasan hasil (X berhasil, Y gagal/di-skip dengan alasan per baris).
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | File Impor | File upload | Required, **.csv**, sesuai template, maks 10MB | "Format file tidak didukung. Gunakan template .csv yang disediakan." | "Unduh template impor (.csv) sebagai panduan" |
  | Mode | Dropdown | Required (tambah / tambah+update) | "Mode impor wajib dipilih" | "tambah: lewati duplikat · tambah+update: perbarui existing" |

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `master_food_item` *(Barang Gizi / nutrition & food goods)*
* **Key Columns**:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (Primary Key) | Identitas unik internal |
| `code` | VARCHAR(30), UNIQUE, system-generated | `kode` — di-generate sistem (unik, readable = prefix Kategori + urut), immutable (BR-A6-02) |
| `name` | VARCHAR(100), NOT NULL | `nama` — wajib (BR-A6-01) |
| `category_id` | UUID (FK → `master_item_category.id` / A33, **Kelompok Barang=GIZI**) | `kategori_id` — wajib, lookup aktif Kelompok Barang Gizi (BR-A6-04) |
| `unit_id` | UUID (FK → `master_unit_packaging.id` / A22) | `satuan` — wajib, lookup (BR-A6-05) |
| *(konversi)* | child table `food_item_unit_conversion` | **Multi-aturan** — konversi satuan disimpan sebagai baris terpisah (lihat tabel di bawah) (BR-A6-18) |
| `manufacturer_id` | UUID (FK → A54), NULLABLE | `pabrikan_id` — opsional, read-only ref |
| `purchase_price` | NUMERIC(15,2), NULLABLE | `harga_beli` — ≥ 0, dikelola di master ini (BR-A6-17). *Supplier tidak disimpan — domain Pemesanan* |
| `het_price` | NUMERIC(15,2), NULLABLE | `het` — Harga Eceran Tertinggi, ≥ 0 |
| `shelf_life_days` | INTEGER, NULLABLE, **> 0** | `masa_simpan` — perkiraan masa simpan bahan dalam satuan **Hari** (opsional) — BR-A6-19 |
| `barcode` | VARCHAR(50), NULLABLE | `barcode`/SKU |
| `coa_account_id` | UUID (FK → COA / A51), NULLABLE | `coa_id` — pemetaan akun persediaan **per barang** (Phase 3) |
| `description` | VARCHAR(255), NULLABLE | `keterangan` — maks 255 char |
| `is_active` | BOOLEAN, DEFAULT true | `status_aktif` — soft status (toggle Dashboard); default Aktif |
| `status_approval` | VARCHAR(20), NULLABLE | Disiapkan untuk Phase 2 — tidak dipakai MVP [ASUMSI] |
| `role_approver` | VARCHAR(50), NULLABLE | Disiapkan untuk Phase 2 — tidak dipakai MVP [ASUMSI] |
| `created_by`/`created_at`/`updated_by`/`updated_at` | — | Audit trail |

> **Constraint**: `UNIQUE(code)` (di-generate sistem); disarankan `UNIQUE(name, category_id, unit_id)` untuk duplicate detection (BR-A6-03). FK ke A33/A22/A54 tidak boleh orphan; **tidak ada hard delete sama sekali** — penghapusan hanya soft `is_active=false` (NFR-A6-04).

**Child Table** — `food_item_unit_conversion` *(konversi satuan multi-aturan, BR-A6-18)*:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (Primary Key) | Identitas aturan |
| `item_id` | UUID (FK → `master_food_item.id`) | Barang gizi pemilik aturan |
| `from_unit_id` | UUID (FK → A22) | Satuan Besar |
| `factor` | NUMERIC(15,4), NOT NULL, **> 0** | Jumlah satuan kecil per 1 satuan besar |
| `to_unit_id` | UUID (FK → A22) | Satuan Kecil (≠ `from_unit_id`) |
| | | **UNIQUE(`item_id`, `from_unit_id`, `to_unit_id`)** — aturan unik per barang |

> Relasi 1 barang : N aturan konversi (0..n). Mendukung rantai konversi (mis. Karung→Kg, Kg→Gram).
>
> **Audit trail** disimpan pada tabel terpisah `master_food_item_audit_log` (`id`, `item_id` FK, `action` [CREATE/UPDATE/STATUS_CHANGE], `before_json`, `after_json`, `actor`, `created_at`) — immutable.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/food-items` | List + search (`?q=`) + filter (`?category_id=`, `?is_active=`) + sort + pagination |
| GET | `/api/v1/food-items/{id}` | Detail satu barang gizi |
| POST | `/api/v1/food-items` | Create barang gizi (status `is_active=true` otomatis; **`code` di-generate sistem**) |
| PUT | `/api/v1/food-items/{id}` | Update barang gizi (full update; `code` immutable) |
| PATCH | `/api/v1/food-items/{id}/status` | Toggle Active/Inactive (soft status) |
| GET | `/api/v1/food-items/{id}/audit-logs` | Riwayat aktivitas (audit trail) per barang |
| GET | `/api/v1/food-items/export` | Ekspor `.csv` sesuai filter aktif **[Phase 2]** |
| POST | `/api/v1/food-items/import` | Impor massal `.csv` (`file_import`, `mode_import`) **[Phase 2]** |
| GET | `/api/v1/food-items/import/template` | Unduh template impor `.csv` **[Phase 2]** |

> Lookup memakai endpoint master masing-masing: `GET /api/v1/item-categories?is_active=true&kelompok=GIZI` (A33 — **hanya kategori Kelompok Barang = Gizi**), `GET /api/v1/units?is_active=true` (A22), `GET /api/v1/manufacturers` (A54).

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE / EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `kode` | Kode Barang | Auto (read-only) | — (auto) | Unik, format readable, maks 30 char | Sistem (auto-generate) | Di-generate sistem & immutable — BR-A6-02 |
| `nama` | Nama Barang | Text | Ya | Maks 100 char | Input admin | Field kanonik `nama`; BR-A6-01 |
| `kategori_id` | Kategori Barang | Dropdown (lookup A33) | Ya | Dari master Kategori **aktif & Kelompok Barang = "Gizi"** (bukan free-text) | Lookup A33 (filter Kelompok Barang Gizi) | BR-A6-04 |
| `satuan` | Satuan | Dropdown (lookup A22) | Ya | Dari master Satuan & Kemasan | Lookup A22 | Field kanonik `satuan`; konversi di §8.3.1.1; BR-A6-05 |
| `pabrikan_id` | Pabrikan | Dropdown (lookup A54) | Tidak | Dari master Pabrikan | Lookup A54 (read-only) | Hanya referensi |
| `harga_beli` | Harga Beli | Number | Tidak | ≥ 0, format Rupiah | Input admin | Dikelola di master ini; dikonsumsi Keuangan/Pengadaan — BR-A6-17 |
| `het` | HET | Number | Tidak | ≥ 0, format Rupiah | Input admin | Harga Eceran Tertinggi (opsional) |
| `masa_simpan` | Masa Simpan | Number (integer) | Tidak | > 0, satuan **Hari** | Input admin | Perkiraan masa simpan bahan dalam **Hari** — BR-A6-19 |
| `barcode` | Barcode / SKU | Text | Tidak | Maks 50 char | Input admin | [PERLU KONFIRMASI] kebutuhan barcode |
| `coa_id` | Akun COA Persediaan | Dropdown (lookup A51) | Tidak | Dari master COA | Lookup Keuangan | Phase 3 — pemetaan **per barang** |
| `keterangan` | Keterangan | Textarea | Tidak | Maks 255 char | Input admin | Field kanonik `keterangan` |

> **Status** tidak diinput di form Create/Edit — di-set `AKTIF` oleh sistem; aktif/nonaktif via toggle di List View (§8.3.2). **Supplier** tidak diinput di master — dipilih saat Pemesanan.

##### 8.3.1.1 Section Konversi Satuan (Input — multi-aturan)

Section input dinamis (tabel) pada form Tambah/Edit; user dapat **menambah/menghapus baris** aturan. Disimpan ke child table `food_item_unit_conversion` (1 barang : 0..n aturan).

| Field (per baris) | Label | Tipe | Wajib | Validasi | Catatan |
|-------------------|-------|------|-------|----------|---------|
| `from_unit_id` | Satuan Besar | Dropdown (lookup A22) | Ya (bila baris diisi) | Master aktif | mis. Karung |
| `factor` | Faktor (Jumlah) | Number | Ya | > 0 | Jumlah satuan kecil per 1 satuan besar |
| `to_unit_id` | Satuan Kecil | Dropdown (lookup A22) | Ya (bila baris diisi) | Master aktif, ≠ Satuan Besar | mis. Kg |

> Makna baris: *1 [Satuan Besar] = [Faktor] [Satuan Kecil]*. Pasangan (Satuan Besar–Satuan Kecil) **unik per barang**; mendukung rantai (Karung→Kg, Kg→Gram). Section opsional — BR-A6-18.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Total Barang Aktif | count `master_food_item` where `is_active` | Angka besar (kartu) | — | Ringkasan |
| Total Barang Nonaktif | count where `!is_active` | Angka besar (kartu) | — | Ringkasan |
| Nomor | urut baris (pagination) | Integer | Sort | Reset per halaman |
| Kode | `master_food_item.code` | Text | Search + Sort | immutable |
| Nama Barang | `master_food_item.name` | Text (link → Detail) | Search + Sort (default A–Z) | Klik menuju Detail |
| Kategori | join A33.name | Text | Filter (Kelompok Barang Gizi) + Sort | BR-A6-04 |
| Satuan | join A22.name | Text | Sort | |
| Pabrikan | join A54.name | Text | Sort | Referensi |
| Status | `master_food_item.is_active` | Badge (hijau=Aktif / abu=Nonaktif) | Filter + Sort | BR-A6-09 |
| Aksi | — | [Detail] + toggle Status | — | Sesuai RBAC; [Ekspor]/[Impor] di header (Phase 2) |

#### Business Rules

| ID | Rule |
|----|------|
| BR-A6-01 | Field wajib (**Nama, Kategori, Satuan**) harus terisi sebelum simpan; jika tidak, simpan ditolak. |
| BR-A6-02 | **Kode barang di-generate sistem otomatis** (unik, format readable = **prefix Kategori + nomor urut**), **tidak diinput manual**, dan **immutable** setelah dibuat. |
| BR-A6-03 | Kombinasi **Nama + Kategori + Satuan** tidak boleh duplikat; jika terdeteksi → peringatan duplikat & wajib konfirmasi/koreksi. |
| BR-A6-04 | **Kategori** harus dipilih dari Master Kategori Barang (A33) berstatus **aktif** dengan **Kelompok Barang = "Gizi"** — field Kategori **hanya menampilkan kategori ber-Kelompok Barang "Gizi"** (bukan Farmasi/Rumah Tangga); tidak boleh free-text. Dasar filter = field **'Kelompok Barang'** pada A33. |
| BR-A6-05 | **Satuan** harus dipilih dari Master Satuan & Kemasan (A22) — tidak boleh free-text. **Tidak ada field Kemasan terpisah**; relasi antar-satuan diatur via section Konversi Satuan. |
| BR-A6-06 | Setiap aksi **create/update/status-change** wajib dicatat di Audit Trail (user, timestamp, before→after), immutable. |
| BR-A6-07 | **Status di-set `AKTIF` oleh sistem** saat Tambah (tanpa input status di form); aktif/nonaktif dikelola via toggle di Dashboard. |
| BR-A6-08 | **Tidak ada fitur hard delete sama sekali** — seluruh penghapusan berupa soft `NONAKTIF`; barang yang pernah dipakai komposisi/transaksi tetap tersimpan sebagai histori. |
| BR-A6-09 | Barang berstatus **Nonaktif** tidak muncul sebagai opsi baru di Menu Makanan (A9)/Inventori, namun tetap tampil pada data historis. |
| BR-A6-10 | **Supplier tidak disimpan di master barang gizi** — pemilihan supplier dilakukan saat Pemesanan/pengadaan. |
| BR-A6-13 | **[Phase 2]** Impor mode `tambah` skip duplikat & laporkan; mode `tambah+update` update existing. Field kanonik `file_import`/`mode_import`. |
| BR-A6-14 | **[Phase 2]** Ekspor mencakup **SELURUH field** barang gizi sesuai filter aktif, format **`.csv`** (UTF-8), baris header. |
| BR-A6-15 | **[Phase 3]** Pemetaan akun COA persediaan mengacu A51 — **per barang**. |
| BR-A6-16 | Barang gizi bersifat **non-medis** → **tidak** memerlukan kode terminologi/standar maupun integrasi SATUSEHAT/BPJS (berbeda dengan A4 Barang Farmasi). |
| BR-A6-17 | **`harga_beli` & `het` dikelola di Master Barang Gizi ini** (bukan modul Keuangan/Pengadaan); modul lain hanya mengonsumsi sebagai referensi. |
| BR-A6-18 | **Konversi satuan dikelola di master ini sebagai section input multi-aturan** (child `food_item_unit_conversion`). User dapat **menambah beberapa baris** aturan; tiap aturan = *1 [Satuan Besar] = [faktor > 0] [Satuan Kecil]*. Pasangan (Satuan Besar–Satuan Kecil) **unik per barang**, Satuan Kecil ≠ Satuan Besar; section **opsional** (0..n aturan). |
| BR-A6-19 | **`masa_simpan` (Masa Simpan)** menyatakan perkiraan masa simpan bahan dalam satuan **Hari**; bersifat **opsional**, dan bila diisi harus **bilangan bulat > 0**. Field ini hanya menyimpan perkiraan masa simpan pada master; **tanggal kedaluwarsa (ED) aktual per batch** tetap domain Inventori/Gudang Gizi. |

---

## 9. Workflow / BPMN Interpretation

> [ASUMSI] A6 belum punya BPMN sendiri; alur CRUD & gateway validasi diturunkan dari pola master barang (A5/A4).

**Alur Phase 1 — Tambah/Ubah Barang Gizi**
```
[Admin / Ahli Gizi]
  ├─ Master Data → Barang Gizi → Dashboard → Tambah / Detail
  ├─ Isi/ubah form (Nama, Kategori[Kelompok Barang Gizi], Satuan, Pabrikan?, Harga, HET?, Masa Simpan?[Hari], Barcode?, Keterangan?)
  │    ├─ Kode TIDAK diinput — sistem generate otomatis (prefix Kategori + urut, readable)
  │    ├─ Status TIDAK diinput — sistem set AKTIF otomatis
  │    ├─ Supplier TIDAK diinput — dipilih saat Pemesanan
  │    └─ Section Konversi Satuan (opsional, multi-aturan): tambah/hapus baris 1 SatuanBesar = faktor SatuanKecil
  ├─ [Simpan]
  │    ├─ [Gateway] Field wajib (Nama/Kategori/Satuan) terisi & valid? Tidak → error per field → kembali
  │    ├─ [Gateway] Tiap aturan konversi (bila ada): faktor > 0, satuan valid & berbeda, pasangan unik? Tidak → error
  │    ├─ [Gateway] Kombinasi Nama+Kategori+Satuan duplikat? Ya → peringatan duplikat → konfirmasi/koreksi
  │    └─ [Valid] → generate Kode → simpan DB master → audit trail → redirect Dashboard (real-time)
  │
[Menu Makanan (A9) / Inventori Gizi / Keuangan] → membaca referensi barang gizi real-time
```

**Alur Phase 1 — Kelola Status (Aktif/Nonaktif)**
```
[Admin / Ahli Gizi]
  ├─ Dashboard → toggle Status pada baris barang
  ├─ Penghapusan = SELALU soft NONAKTIF — TIDAK ADA hard delete
  └─ Catat audit trail (status change) → barang NONAKTIF tak jadi opsi baru (histori tetap)
```

**Alur Phase 2 — Ekspor & Impor Massal (.csv)**
```
[Admin Master Data] — Ekspor → file .csv (SEMUA field sesuai filter, header; aturan konversi sebagai 1 kolom)
[Admin Master Data] — Impor → unduh template .csv → isi → upload + pilih mode (tambah / tambah+update)
       └─ validasi per baris (wajib, duplikat Nama+Kategori+Satuan, lookup Kategori[Kelompok Barang Gizi]/Satuan, aturan konversi multi); Kode di-generate sistem per baris
            └─ ringkasan (X berhasil, Y gagal/skip) → Dashboard real-time
```

---

### Non-Functional Requirements
| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-A6-01 | Performa | Pencarian/filter barang gizi < 3 detik; ekspor `.csv` tidak memblokir UI (server-side pagination). |
| NFR-A6-02 | Real-time consistency | Perubahan data terbaca seluruh modul tanpa restart. |
| NFR-A6-03 | Usability | UI sederhana, pesan validasi jelas; dapat dipakai Admin/Ahli Gizi non-teknis. |
| NFR-A6-04 | Integritas data | FK ke A33/A22/A54 tidak orphan; **tidak ada hard delete** (soft `is_active`); duplikat dicegah (BR-A6-03). |
| NFR-A6-05 | Audit trail | Mencatat siapa & kapan create/update/status-change (termasuk perubahan harga/konversi). |
| NFR-A6-06 | Keamanan / RBAC | Akses menu & aksi hanya untuk role berwenang (A53). |

### Asumsi
- [ASUMSI] Modul tidak punya BPMN sendiri; alur CRUD & gateway validasi diturunkan dari pola master barang (A5/A4).
- Barang gizi bersifat non-medis → tidak memerlukan kode terminologi/standar maupun integrasi SATUSEHAT/BPJS.
- `harga_beli`, `het`, dan **konversi satuan (multi-aturan)** dikelola di master ini; **supplier** dipilih saat Pemesanan (tidak disimpan di master).
- Kode barang **di-generate sistem** (prefix Kategori + nomor urut, readable, immutable); **tidak ada hard delete** (soft nonaktif); ekspor/impor **`.csv`**; **COA per barang** (Phase 3) — mengikuti konvensi A5.
- Master Kategori Barang (A33) memiliki field **'Kelompok Barang'**; A6 memfilter Kategori ke Kelompok Barang **"Gizi"** (dikonfirmasi).
- Nilai gizi/kandungan nutrisi dikelola di **A9 Menu Makanan**, bukan di A6 (dikonfirmasi). Tidak ada field **Kemasan** terpisah — relasi antar-satuan via section Konversi Satuan.
- [ASUMSI] Kolom `status_approval`/`role_approver` disiapkan untuk Phase 2 namun tidak dipakai MVP.

### Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah perlu atribut **jenis bahan** (mis. basah/kering/bumbu/minuman) atau penanda **perishable** (mudah rusak) di master barang gizi.
- [PERLU KONFIRMASI] Kebutuhan field `barcode`/SKU & detail panjang/format `kode` readable (pola prefix Kategori + urut sudah ditetapkan).

> **Terkonfirmasi**: nilai gizi/nutrisi di **A9 Menu Makanan**; filter Kategori = field **'Kelompok Barang' = "Gizi"** pada A33; **tidak ada field Kemasan**.
