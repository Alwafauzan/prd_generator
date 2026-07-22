# Product Requirement Document (PRD)
# A5 — Master Data Barang Rumah Tangga

---

## 1. Metadata Dokumen

* **Approval**: [Nama Kepala Bagian Logistik / Manajer Operasional, Jabatan, Tanggal]
* **Related Documents**:
  * A33 — Master Data Kategori Barang (lookup wajib kategori barang)
  * A22 — Master Data Satuan & Kemasan (lookup satuan/kemasan)
  * A54 — Master Data Pabrikan (referensi pabrikan, read-only)
  * A4 — Master Data Barang Farmasi (pola/template CRUD master barang setara)
  * A53 — Admin RBAC (otorisasi akses CRUD master)
  * A51 — Konfigurasi Persediaan / COA (acuan pemetaan akun, Phase 3)
  * PRD_Master_Data_Barang_Rumah_Tangga.docx (lampiran sumber)
  * List Fitur V2.xlsx (sheet MVP) — A5
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-29 | 2.0 | Restrukturisasi PRD Master Data Barang Rumah Tangga ke format standar template (1).md — 9 seksi (Metadata, Overview, Goals, Scope, Related Features, Business Process & User Stories, Functional + Validasi & State Design per fitur, Data & Technical Specs (DB Schema + API + Business Rules), Workflow/BPMN) |
| 2026-06-30 | 2.1 | Konfirmasi: (1) `harga_beli`/HET dikelola di master ini; (2) **tidak ada hard delete** (hanya soft nonaktif); (3) `kode` **di-generate sistem** (unik, readable, immutable); (4) **faktor konversi** satuan–kemasan dikelola di master ini; (5) barang non-medis tanpa kode terminologi/standar; (6) ekspor/impor format **.csv**; (7) Phase 3 COA **per barang** |
| 2026-06-30 | 2.2 | Revisi Related Features: menambah relasi konsumen ke modul **Inventory** — Pemesanan Barang RT (H12), Distribusi Barang (H3), Mutasi Stok (H5), Informasi Stok (H4), Stok Opname (H6), Peminjaman & Pengembalian (H7), Retur Pembelian (H8), Penggunaan Barang Unit (H11). Kode `kode` diformat **prefix Kategori + nomor urut**. |
| 2026-06-30 | 2.3 | **Konversi Satuan jadi section input multi-aturan** — user dapat menambah beberapa baris aturan (1 Satuan Besar = faktor Satuan Kecil); diganti dari field tunggal `faktor_konversi` menjadi child table `household_item_unit_conversion`. |
| 2026-06-30 | 2.4 | Field **Kategori Barang** hanya menampilkan kategori dengan **Kelompok Barang "Rumah Tangga"** (filter field 'Kelompok Barang' di A33) — bukan Farmasi/Gizi (BR-A5-04). |
| 2026-07-08 | 2.5 | **Field `Supplier` (`supplier_id`) dihapus** dari master Barang RT — A5 tidak lagi menyimpan/merujuk Supplier (A7); pemilihan supplier dilakukan di modul Pengadaan/Pemesanan (H12). Menghapus lookup A7, kolom `supplier_id` di skema DB, field Supplier di form/list/ekspor/impor, dan relasi A7. |

> Catatan: Barang Rumah Tangga adalah barang **non-medis / non-farmasi** (alat kebersihan, perlengkapan kantor, perawatan fasilitas, barang habis pakai non-farmasi). Modul ini hanya mengelola **definisi barang** (master), **bukan stok/saldo** (domain Inventori/Gudang RT). Status barang **tidak** diinput di form Tambah — selalu di-set `AKTIF` oleh sistem dan dikelola via toggle di Dashboard.

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Barang Rumah Tangga** (code **A5**, cluster **Control Panel → Master Data**) digunakan untuk mengelola seluruh informasi dasar **barang non-medis/non-farmasi** yang dipakai operasional rumah sakit — alat kebersihan, perlengkapan kantor, perawatan fasilitas, dan barang habis pakai non-farmasi lainnya.

Data ini menjadi **single source of truth** dan referensi utama bagi modul yang mengonsumsi barang RT: **Inventori/Gudang RT** (penerimaan, pengeluaran, stok opname), **Keuangan** (COA/HET, persediaan), dan **Logistik/Pengadaan**. Dengan modul ini, **Admin Master Data** dapat mengelola barang secara mandiri tanpa intervensi tim teknis, menjamin keseragaman informasi antar unit, dan memastikan referensi barang terbaca real-time oleh modul lain.

> **[ASUMSI]** Lingkup teknis modul ini adalah **CRUD master data sederhana** (tambah, lihat, ubah, aktif/nonaktif) plus **ekspor/impor file** (Phase 2) dan **pemetaan COA** (Phase 3). Proses penerimaan/pengeluaran/stok opname ditangani modul Inventori/Gudang RT; pengelolaan Kategori (A33), Satuan/Kemasan (A22), dan Pabrikan (A54) ditangani modul masing-masing — A5 hanya **merujuk** (lookup). Modul **tidak memiliki BPMN sendiri**; pola CRUD diturunkan dari master sejenis (A4 Barang Farmasi, A33 Kategori Barang).

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):** *(diturunkan dari Background lampiran — [ASUMSI])*
- Data barang RT dicatat manual di Excel/kertas, **tersebar & terduplikasi** antar unit (gudang, keuangan, logistik).
- **Inkonsistensi** harga, jenis, atau satuan barang antar modul karena tiap unit menyalin data sendiri.
- **Keterlambatan pembaruan** ketika ada perubahan harga/atribut barang; tidak ada satu sumber acuan.
- **Ketergantungan pada tim teknis/IT** untuk menambah barang baru atau mengoreksi kesalahan.
- Tidak ada **audit trail** — perubahan harga/atribut tidak terlacak. Pada RS Tipe C&D dengan SDM IT terbatas, hal ini sangat membebani operasional.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin RS mengelola seluruh barang RT via form CRUD terpusat (tambah, lihat, ubah, aktif/nonaktif) **tanpa tim teknis**.
- Kategori & Satuan dipilih dari **lookup master** (A33/A22) — bukan free-text — sehingga data terstandar sejak input.
- Sistem melakukan **validasi otomatis** (field wajib, format, duplikasi), menyimpan ke DB master, dan **mem-publish referensi real-time** ke modul Inventori/Keuangan/Logistik tanpa restart sistem.
- Setiap aksi create/update/status-change **dicatat di audit trail** (user, waktu, before→after).
- **Phase 2**: Ekspor & Impor massal via file **.csv** (template). **Phase 3**: Pemetaan akun COA persediaan **per barang**.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi data antar modul | 100% modul (Inventori, Keuangan, Logistik) menggunakan referensi data barang RT yang sama |
| 2 | Kemandirian user non-teknis | 100% Admin RS mampu setup & memperbarui data tanpa bantuan tim teknis |
| 3 | Kecepatan baca perubahan | 100% perubahan data terbaca real-time oleh modul lain tanpa restart sistem |
| 4 | Kecepatan pencarian/filter | Hasil pencarian/filter barang RT tampil < 3 detik |
| 5 | Integritas data (no orphan / no hard-delete data terpakai) | 0 barang yang sudah dipakai transaksi terhapus permanen; 100% upaya hapus diarahkan ke nonaktif (soft) |
| 6 | Standardisasi referensi | 0 barang tersimpan dengan Kategori/Satuan free-text; 100% mengacu master A33/A22 aktif |
| 7 | Keterlacakan perubahan | 100% aksi create/update/status-change tercatat di audit trail (user, waktu, before→after) |
| 8 | Kelengkapan ekspor [Phase 2] | 100% field barang RT ikut terekspor pada file (tidak ada kolom hilang) |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) | Phase 3 |
|---------------|---------------------|---------------------|---------|
| Dashboard Barang RT | List, search (Nama/Kode), filter (Kategori/Status), sort, pagination 10/halaman | — | — |
| Tambah Barang RT | Form tervalidasi (lookup A33/A22/A54); status auto `AKTIF` | — | — |
| Detail / Ubah Barang RT | Pre-filled, edit field, validasi sama dengan Tambah | — | — |
| Aktif / Nonaktifkan Barang RT | Soft status toggle di Dashboard; blokir hard-delete barang terpakai | — | — |
| Duplicate detection | Kode unik + (Nama+Kategori+Satuan) tidak duplikat | — | — |
| Riwayat Aktivitas / Audit Trail | Log create/update/status-change (user, waktu, before→after) | — | — |
| Ekspor Data Barang RT | — | Ekspor **file** seluruh field sesuai filter aktif | — |
| Impor Massal Barang RT | — | **Impor via file** (`file_import`/`mode_import`) dengan template, validasi per baris, laporan error | — |
| Pemetaan Akun COA Persediaan | — | — | Map COA **per barang** (acuan A51) |

> **Out of Scope**:
> * Proses penerimaan, pengeluaran, dan stok opname barang (modul Inventori/Gudang RT) — A5 hanya menyimpan definisi barang, **bukan stok/saldo**.
> * CRUD Master Kategori Barang (A33), Satuan & Kemasan (A22), Pabrikan (A54) — dikelola modul masing-masing; A5 hanya merujuk (lookup).
> * Proses pengadaan/pembelian & pemilihan supplier (modul Pengadaan/Pemesanan) — A5 **tidak menyimpan** data supplier.
> * **Hard delete** barang — **tidak ada fitur hard delete sama sekali**; penghapusan selalu berupa soft nonaktif.
> * Integrasi & kode terminologi/standar SATUSEHAT/BPJS untuk data barang — barang non-medis **tidak memerlukannya** (dikonfirmasi).

---

## 5. Related Features

| Code | Module | Relasi Teknis / Bisnis |
|------|--------|------------------------|
| A33 | Master Data Kategori Barang | **Lookup wajib** sumber `kategori_id` — **hanya kategori dengan Kelompok Barang "Rumah Tangga"** yang ditampilkan (filter field 'Kelompok Barang'), dari master aktif (bukan free-text) — BR-A5-04. |
| A22 | Master Data Satuan & Kemasan | **Lookup** sumber `satuan`/`kemasan` — barang RT memakai satuan baku dari master ini. |
| A54 | Master Data Pabrikan | **Lookup read-only** sumber `pabrikan_id` — hanya referensi, tidak dikelola di A5. |
| A4 | Master Data Barang Farmasi | **Pola/template CRUD** master barang setara; A4 ber-integrasi SATUSEHAT/BPJS, A5 tidak. |
| A53 | Admin RBAC | **Otorisasi** akses menu & aksi CRUD master (role berizin Master Data). |
| A51 | Konfigurasi Persediaan / COA | **Acuan** pemetaan akun COA persediaan barang RT (Phase 3). |
| **H12** | Pemesanan Barang Rumah Tangga | **Konsumen** — referensi barang RT untuk pemesanan/pengadaan (supplier dipilih di sini). |
| **H3** | Distribusi Barang | **Konsumen** — referensi barang RT untuk distribusi antar gudang/unit. |
| **H5** | Mutasi Stok | **Konsumen** — referensi barang RT untuk mutasi stok antar lokasi. |
| **H4** | Informasi Stok | **Konsumen** — referensi barang RT untuk tampilan & laporan stok. |
| **H6** | Stok Opname | **Konsumen** — referensi barang RT untuk pencocokan stok fisik vs sistem. |
| **H7** | Peminjaman dan Pengembalian Barang | **Konsumen** — referensi barang RT untuk peminjaman & pengembalian. |
| **H8** | Retur Pembelian | **Konsumen** — referensi barang RT untuk retur ke supplier. |
| **H11** | Penggunaan Barang Unit | **Konsumen** — referensi barang RT untuk pencatatan penggunaan per unit. |
| — | Keuangan (Persediaan) | **Konsumen** — membaca `harga_beli`/`het` (dikelola di A5) & pemetaan COA per barang (Phase 3). |

> Modul Inventory (H3–H12) mengonsumsi **definisi** barang RT dari A5; **operasional stok/saldo/transaksi** (penerimaan, pengeluaran, batch) tetap di modul masing-masing, bukan di A5 (lihat Out of Scope).

> Konsistensi field lintas-PRD (field kanonik bersama): `kode`, `nama`, `keterangan`, `satuan`, `status_aktif`, `file_import`, `mode_import`, `pilihan_duplikat` mengikuti definisi kanonik di kamus `_shared/dictionary.json`.

---

## 6. Business Process & User Stories

### State Machine — Status Barang RT

| Status | Deskripsi | Efek ke Modul Lain | Transisi (Phase 1) |
|--------|-----------|--------------------|--------------------|
| `AKTIF` | Barang aktif & dapat dipakai | Tampil sebagai opsi pemilihan di modul Inventori/Pengadaan; terbaca referensinya real-time | → `NONAKTIF` (toggle di Dashboard) |
| `NONAKTIF` | Barang dinonaktifkan (soft) | Tidak muncul sebagai opsi pemilihan **baru** di modul lain; tetap tampil pada data historis | → `AKTIF` (reaktivasi) |

> **Tidak ada fitur hard delete sama sekali** — seluruh penghapusan berupa soft `NONAKTIF` agar histori & integritas relasi terjaga (BR-A5-08). Default status saat Tambah = `AKTIF` (di-set sistem, **tidak** ada input status di form Tambah).
>
> **Sub-state Phase 2/3 (siap-arsitektur)**: kolom `status_approval` & `role_approver` disiapkan di skema sejak awal untuk mengakomodasi kemungkinan approval berjenjang Phase 2; namun pada MVP **tidak ada approval** — barang langsung tersimpan & aktif (lihat §8.1). [ASUMSI] master data barang RT tidak membutuhkan approval berjenjang.

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A5-01 | Admin Master Data | Melihat Dashboard barang RT (tabel + search + filter + sort + pagination) | Agar cepat menemukan barang tertentu (< 3 detik) & memantau data |
| US-A5-02 | Admin Master Data | Menambah barang RT baru lewat form tervalidasi (lookup kategori/satuan) | Agar data barang non-medis terstandar sejak input |
| US-A5-03 | Admin Master Data | Melihat & mengubah detail barang RT yang sudah ada | Agar perubahan harga/atribut selalu mutakhir & tersinkron |
| US-A5-04 | Admin Master Data | Mengaktifkan/menonaktifkan barang RT dari Dashboard | Agar barang tak terpakai tidak muncul sebagai opsi baru tanpa menghapus histori |
| US-A5-05 | Admin / Supervisor | Melihat riwayat aktivitas (audit trail) perubahan barang RT | Agar setiap perubahan dapat ditelusuri |
| US-A5-06 | Sistem (modul lain) | Membaca referensi barang RT secara real-time | Agar Inventori/Keuangan tidak duplikasi/inkonsistensi data |
| US-A5-07 | Admin Master Data | Mengekspor data barang RT ke file | Agar mudah dipakai pelaporan/backup [Phase 2] |
| US-A5-08 | Admin Master Data | Mengimpor data barang RT massal via template | Agar setup awal/migrasi cepat [Phase 2] |
| US-A5-09 | Admin Keuangan | Memetakan akun COA barang RT | Agar pencatatan persediaan otomatis sesuai jurnal [Phase 3] |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard & Pencarian Barang RT**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat seluruh daftar barang RT dengan pencarian, filter, sort, dan pagination agar cepat menemukan barang tertentu (< 3 detik).
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Menu Master Data → Barang Rumah Tangga menampilkan tabel kolom: Nomor, Kode, Nama Barang, Kategori, Satuan, Pabrikan, Status, Aksi; plus kartu ringkas Total Barang Aktif & Total Barang Nonaktif.
  * **AC 2**: Semua kolom dapat di-sort (Asc/Desc); default sort Nama ascending (A–Z).
  * **AC 3**: Pencarian teks bebas memfilter baris berdasarkan **Nama** dan **Kode**.
  * **AC 4**: Tersedia filter **Kategori** (dari A33) dan **Status** (Aktif/Nonaktif).
  * **AC 5**: Pagination menampilkan 10 data per halaman (server-side untuk ribuan barang).
* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Search | Text | — | — | "Cari nama atau kode barang..." |
  | Filter Kategori | Dropdown | — | — | "Semua Kategori" (default); pilihan hanya kategori Kelompok Barang Rumah Tangga |
  | Filter Status | Dropdown | — | — | "Semua Status" (default) |

---

**Fitur: Tambah Barang RT**
* **User Story**: Sebagai Admin Master Data, saya ingin menambah barang RT baru lewat form tervalidasi agar data barang non-medis terstandar sejak input.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form Tambah Barang menyediakan field: Nama (wajib), Kategori (dropdown lookup A33, wajib), Satuan (dropdown lookup A22, wajib), Kemasan (lookup A22, opsional), Pabrikan (lookup A54, opsional), Harga Beli (opsional), HET (opsional), Barcode/SKU (opsional), Keterangan (opsional). **Kode di-generate sistem otomatis** (unik, format readable) — tidak diinput manual. **Tidak ada input Status** — status di-set `AKTIF` oleh sistem. Aturan konversi antar-satuan diisi pada **section Konversi Satuan** (AC 5).
  * **AC 2**: Saat simpan, sistem **men-generate Kode otomatis** yang **unik & readable**; Kode tidak diinput/diubah manual dan bersifat immutable setelah dibuat.
  * **AC 3**: Sistem menolak simpan jika kombinasi **Nama + Kategori + Satuan** sudah ada — tampil peringatan duplikat & minta konfirmasi/koreksi.
  * **AC 4**: Field **Kategori** hanya menampilkan kategori dari A33 yang **aktif & Kelompok Barang "Rumah Tangga"** (bukan Farmasi/Gizi); field **Satuan** dari A22 aktif. Keduanya bukan free-text & wajib divalidasi sebelum simpan.
  * **AC 5**: Form menyediakan **section Konversi Satuan** (opsional, **multi-aturan**) berupa tabel; user dapat **menambah/menghapus baris** aturan konversi. Tiap baris: **Satuan Besar** | **Jumlah (faktor)** | **Satuan Kecil** — bermakna *1 [Satuan Besar] = [faktor] [Satuan Kecil]* (mis. 1 Box = 12 Strip; 1 Strip = 10 Pcs). Faktor wajib > 0; Satuan dari master A22 aktif; aturan tidak boleh duplikat (pasangan Satuan Besar–Satuan Kecil unik per barang).
  * **AC 6**: Setelah berhasil simpan, sistem redirect ke Dashboard, data baru tampil real-time (status Aktif), notifikasi *"Data Berhasil Diperbarui"*; tombol [Kembali] menutup overlay tanpa menyimpan.
* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Barang | Auto (read-only) | Di-generate sistem, unik, format readable | — | "Kode dibuat otomatis oleh sistem" |
  | Nama Barang | Text | Required, maks 100 char | "Nama barang wajib diisi" / "Nama melebihi 100 karakter ([X]/100)" | "Contoh: Pembersih Lantai 1L" |
  | Kategori | Dropdown (lookup A33) | Required, dari master aktif **Kelompok Barang Rumah Tangga** | "Kategori wajib dipilih" | "Hanya kategori Kelompok Barang Rumah Tangga" |
  | Satuan | Dropdown (lookup A22) | Required, dari master aktif | "Satuan wajib dipilih" | "Pilih dari Master Satuan & Kemasan" |
  | Kemasan | Dropdown (lookup A22) | Opsional | — | "Konversi antar-satuan diisi di section Konversi Satuan" |
  | Pabrikan | Dropdown (lookup A54) | Opsional, read-only master | — | "Referensi pabrikan (opsional)" |
  | Harga Beli | Number | Opsional, ≥ 0, format Rupiah | "Harga beli tidak boleh negatif" | "Dikelola di master ini (dikonsumsi Keuangan/Pengadaan)" |
  | HET | Number | Opsional, ≥ 0, format Rupiah | "HET tidak boleh negatif" | "Harga Eceran Tertinggi (opsional)" |
  | Barcode / SKU | Text | Opsional, maks 50 char | "Barcode melebihi 50 karakter" | "[PERLU KONFIRMASI] kebutuhan barcode" |
  | Keterangan | Textarea | Opsional, maks 255 char | "Keterangan melebihi 255 karakter ([X]/255)" | "Keterangan tambahan (opsional)" |

  **B. Section Konversi Satuan (Input — multi-aturan)**
  Tabel input dinamis; tombol **[+ Tambah Aturan Konversi]** menambah baris, ikon hapus per baris. Tiap baris = *1 [Satuan Besar] = [Faktor] [Satuan Kecil]*.

  | Kolom (per baris) | Tipe Input | Rules | Error Message | Helper Text |
  |-------------------|------------|-------|---------------|-------------|
  | Satuan Besar | Dropdown (lookup A22) | Required (bila baris diisi), master aktif | "Satuan besar wajib dipilih" | "mis. Box" |
  | Faktor (Jumlah) | Number | Required, > 0 | "Faktor harus lebih dari 0" | "Jumlah satuan kecil per 1 satuan besar (mis. 12)" |
  | Satuan Kecil | Dropdown (lookup A22) | Required (bila baris diisi), master aktif, ≠ Satuan Besar | "Satuan kecil wajib dipilih & berbeda dari satuan besar" | "mis. Strip" |
  | Aksi | Button | — | — | "[+ Tambah Aturan] / hapus baris" |

  *Aturan: pasangan (Satuan Besar–Satuan Kecil) **unik per barang**; section bersifat opsional (0..n baris) — BR-A5-18.*

---

**Fitur: Detail & Ubah Barang RT**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat & mengubah detail barang RT agar perubahan harga/atribut selalu mutakhir dan tersinkron ke modul terkait.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Detail] (atau klik Nama) membuka overlay pre-filled berisi seluruh atribut barang; field dapat diubah kecuali audit (`created_by`/`created_at`).
  * **AC 2**: Perubahan tunduk validasi sama dengan Tambah (Kode unik, duplikat Nama+Kategori+Satuan, lookup Kategori/Satuan).
  * **AC 3**: Perubahan valid tersimpan & tersinkron otomatis (real-time) ke modul terkait; sistem mencatat `updated_by` & `updated_at` + audit trail (update, before→after).
  * **AC 4**: Halaman Detail menyediakan tab/menu **Riwayat Aktivitas** menampilkan log create/update/status-change.
* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Barang | Auto (read-only) | Tidak dapat diubah (di-generate sistem) | — | "Kode immutable setelah dibuat" |
  | Nama / Kategori / Satuan | (sama Tambah) | Required, duplicate check | (sama Tambah) | — |

---

**Fitur: Aktif / Nonaktifkan Barang RT (Status Toggle di Dashboard)**
* **User Story**: Sebagai Admin Master Data, saya ingin mengaktifkan/menonaktifkan barang RT dari Dashboard agar barang tak terpakai tidak muncul sebagai opsi baru tanpa menghapus histori.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Status dikelola via **toggle di Dashboard** (bukan di form Tambah). Mengubah ke `NONAKTIF` mengubah `status_aktif` tanpa menghapus data.
  * **AC 2**: **Tidak ada fitur hapus permanen (hard delete)** di modul ini — penghapusan selalu berupa **Nonaktif (soft)**. Barang yang pernah dipakai transaksi tetap tersimpan & tampil di histori.
  * **AC 3**: Barang `NONAKTIF` tidak muncul sebagai opsi pemilihan **baru** di modul Inventori/Pengadaan, namun tetap tampil pada data historis.
  * **AC 4**: Setiap perubahan status tercatat di audit trail (user, waktu, before→after).
* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Status (toggle) | Toggle/Switch | Soft status; **tidak ada hard delete** | "Penghapusan permanen tidak tersedia — gunakan Nonaktifkan." | "Nonaktif menyembunyikan barang dari opsi baru, histori tetap" |

---

**Fitur: Riwayat Aktivitas / Audit Trail**
* **User Story**: Sebagai Admin/Supervisor, saya ingin melihat riwayat aktivitas perubahan barang RT agar setiap perubahan dapat ditelusuri.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Menu/tab Riwayat Aktivitas menampilkan log create/update/status-change dengan kolom: Waktu, User, Aksi, Perubahan (before→after).
  * **AC 2**: Default sort = waktu terbaru (desc); dapat difilter per User & Aksi.
  * **AC 3**: Log bersifat **immutable** (tidak dapat diubah retroaktif).
* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Filter User / Aksi | Dropdown | — | — | "Semua" (default) |

---

**Fitur: [Phase 2] Ekspor Data Barang RT**
* **User Story**: Sebagai Admin Master Data, saya ingin mengekspor data barang RT ke file agar mudah dipakai untuk pelaporan/backup.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Ekspor] di header Dashboard menghasilkan file **.csv** berisi **SELURUH field** barang RT sesuai **filter aktif** (Kode, Nama, Kategori, Satuan, Kemasan, Aturan Konversi, Pabrikan, Harga Beli, HET, Barcode, Keterangan, Status). Kolom **Aturan Konversi** memuat seluruh aturan barang (mis. `1 Box=12 Strip; 1 Strip=10 Pcs`).
  * **AC 2**: Baris pertama = header kolom; ekspor tidak memblokir UI.
* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  *Menghasilkan unduhan file **.csv** (UTF-8); tidak ada form input. [ASUMSI] delimiter koma standar.*

---

**Fitur: [Phase 2] Impor Massal Barang RT via File**
* **User Story**: Sebagai Admin Master Data, saya ingin mengimpor data barang RT massal via template agar setup awal/migrasi cepat.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Impor] membuka dialog upload file **.csv** (`file_import`/`mode_import`); template dapat diunduh dari halaman yang sama (kolom: nama, kategori, satuan, kemasan, konversi, pabrikan, harga_beli, het, barcode, keterangan). Kolom **konversi** memuat aturan multi (format `SatuanBesar=faktor>SatuanKecil`, antar-aturan dipisah `;`). **Kode tidak disertakan** — di-generate sistem otomatis per baris.
  * **AC 2**: Sistem memvalidasi setiap baris dengan aturan sama dengan input manual: field wajib (Nama, Kategori, Satuan), keunikan Kode, duplikat Nama+Kategori+Satuan, lookup Kategori/Satuan valid.
  * **AC 3**: Mode `tambah`: baris dengan Kode/Nama sudah ada → di-skip & dilaporkan. Mode `tambah+update`: baris existing di-update. Baris gagal ditampilkan per baris (baris ke-N: alasan); baris valid tetap disimpan.
  * **AC 4**: Setelah impor, Dashboard menampilkan data baru real-time + ringkasan hasil (X berhasil, Y gagal/di-skip).
* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | File Impor | File upload | Required, **.csv**, sesuai template, maks 10MB | "Format file tidak didukung. Gunakan template .csv yang disediakan." | "Unduh template impor (.csv) sebagai panduan format" |
  | Mode | Dropdown | Required (tambah / tambah+update) | "Mode impor wajib dipilih" | "tambah: lewati duplikat · tambah+update: perbarui existing" |
  | Kolom `nama` (per baris) | Cell | Required, maks 100 char | "Baris [N]: Nama wajib diisi / melebihi 100 karakter." | — |
  | Kolom `kategori`/`satuan` (per baris) | Cell | Harus cocok master aktif | "Baris [N]: Kategori/Satuan tidak ditemukan di master." | — |

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `master_household_item` *(domestik: Barang Rumah Tangga / household & non-medical goods)*
* **Key Columns**:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (Primary Key) | Identitas unik internal |
| `code` | VARCHAR(30), UNIQUE, system-generated | `kode` — **di-generate sistem** (unik, format readable), immutable (BR-A5-02) |
| `name` | VARCHAR(100), NOT NULL | `nama` — wajib (BR-A5-01) |
| `category_id` | UUID (FK → `master_item_category.id` / A33) | `kategori_id` — wajib, lookup aktif (BR-A5-04) |
| `unit_id` | UUID (FK → `master_unit_packaging.id` / A22) | `satuan` — wajib, lookup (BR-A5-05) |
| `packaging_id` | UUID (FK → `master_unit_packaging.id` / A22), NULLABLE | `kemasan` — opsional |
| *(konversi)* | child table `household_item_unit_conversion` | **Multi-aturan** — konversi satuan dikelola sebagai baris terpisah (lihat tabel di bawah), bukan kolom tunggal |
| `manufacturer_id` | UUID (FK → `master_manufacturer.id` / A54), NULLABLE | `pabrikan_id` — opsional, read-only ref |
| `purchase_price` | NUMERIC(15,2), NULLABLE | `harga_beli` — ≥ 0 |
| `het_price` | NUMERIC(15,2), NULLABLE | `het` — Harga Eceran Tertinggi, ≥ 0 |
| `barcode` | VARCHAR(50), NULLABLE | `barcode`/SKU |
| `coa_account_id` | UUID (FK → COA / A51), NULLABLE | `coa_id` — pemetaan akun persediaan **per barang** (Phase 3) |
| `description` | VARCHAR(255), NULLABLE | `keterangan` — maks 255 char |
| `is_active` | BOOLEAN, DEFAULT true | `status_aktif` — soft status (toggle Dashboard); default Aktif |
| `status_approval` | VARCHAR(20), NULLABLE | **Disiapkan untuk Phase 2** — null/tidak dipakai pada MVP [ASUMSI] |
| `role_approver` | VARCHAR(50), NULLABLE | **Disiapkan untuk Phase 2** — null/tidak dipakai pada MVP [ASUMSI] |
| `created_by` | VARCHAR | Audit — username pembuat |
| `created_at` | TIMESTAMP | Audit — server time |
| `updated_by` | VARCHAR | Audit — username pengubah |
| `updated_at` | TIMESTAMP | Audit — diperbarui tiap edit |

> **Constraint**: `UNIQUE(code)` (di-generate sistem); disarankan `UNIQUE(name, category_id, unit_id)` untuk duplicate detection (BR-A5-03). FK ke A33/A22/A54 tidak boleh orphan; **tidak ada hard delete sama sekali** — penghapusan hanya soft `is_active=false` (NFR-A5-04).

**Child Table** — `household_item_unit_conversion` *(konversi satuan multi-aturan, BR-A5-18)*:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (Primary Key) | Identitas aturan |
| `item_id` | UUID (FK → `master_household_item.id`) | Barang RT pemilik aturan |
| `from_unit_id` | UUID (FK → A22) | Satuan Besar |
| `factor` | NUMERIC(15,4), NOT NULL, **> 0** | Jumlah satuan kecil per 1 satuan besar |
| `to_unit_id` | UUID (FK → A22) | Satuan Kecil (≠ `from_unit_id`) |
| | | **UNIQUE(`item_id`, `from_unit_id`, `to_unit_id`)** — aturan unik per barang |

> Relasi 1 barang : N aturan konversi (0..n). Mendukung rantai konversi (mis. Box→Strip, Strip→Pcs).
>
> **Audit trail** disimpan pada tabel terpisah `master_household_item_audit_log` (kolom: `id`, `item_id` FK, `action` [CREATE/UPDATE/STATUS_CHANGE], `before_json`, `after_json`, `actor`, `created_at`) — bersifat immutable.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/household-items` | List + search (`?q=`) + filter (`?category_id=`, `?is_active=`) + sort + pagination |
| GET | `/api/v1/household-items/{id}` | Detail satu barang RT |
| POST | `/api/v1/household-items` | Create barang RT (status `is_active=true` otomatis; **`code` di-generate sistem otomatis**) |
| PUT | `/api/v1/household-items/{id}` | Update barang RT (full update) |
| PATCH | `/api/v1/household-items/{id}/status` | Toggle Active/Inactive (soft status) |
| GET | `/api/v1/household-items/{id}/audit-logs` | Riwayat aktivitas (audit trail) per barang |
| GET | `/api/v1/household-items/export` | Ekspor data sesuai filter aktif **[Phase 2]** |
| POST | `/api/v1/household-items/import` | Impor massal via file (`file_import`, `mode_import`) **[Phase 2]** |
| GET | `/api/v1/household-items/import/template` | Unduh template impor **[Phase 2]** |

> Lookup memakai endpoint master masing-masing: `GET /api/v1/item-categories?is_active=true&kelompok=RUMAH_TANGGA` (A33 — **hanya kategori Kelompok Barang = Rumah Tangga**), `GET /api/v1/units?is_active=true` (A22), `GET /api/v1/manufacturers` (A54).

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE / EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `kode` | Kode Barang | Auto (read-only) | — (auto) | Unik, format readable, maks 30 char | Sistem (auto-generate) | Di-generate sistem & immutable — BR-A5-02 |
| `nama` | Nama Barang | Text | Ya | Maks 100 char | Input admin | Field kanonik `nama`; BR-A5-01 |
| `kategori_id` | Kategori Barang | Dropdown (lookup A33) | Ya | Dari master Kategori **aktif & Kelompok Barang "Rumah Tangga"** (bukan free-text) | Lookup A33 (filter Kelompok Barang) | BR-A5-04 |
| `satuan` | Satuan | Dropdown (lookup A22) | Ya | Dari master Satuan & Kemasan | Lookup A22 | Field kanonik `satuan`; BR-A5-05 |
| `kemasan` | Kemasan | Dropdown (lookup A22) | Tidak | Dari A22 | Lookup A22 | Konversi antar-satuan di section Konversi Satuan (§8.3.1.1) |
| `pabrikan_id` | Pabrikan | Dropdown (lookup A54) | Tidak | Dari master Pabrikan | Lookup A54 (read-only) | Hanya referensi |
| `harga_beli` | Harga Beli | Number | Tidak | ≥ 0, format Rupiah | Input admin | Dikelola di master ini; dikonsumsi Keuangan/Pengadaan — BR-A5-17 |
| `het` | HET | Number | Tidak | ≥ 0, format Rupiah | Input admin | Harga Eceran Tertinggi (opsional) |
| `barcode` | Barcode / SKU | Text | Tidak | Maks 50 char | Input admin | [PERLU KONFIRMASI] kebutuhan barcode |
| `coa_id` | Akun COA Persediaan | Dropdown (lookup A51) | Tidak | Dari master COA | Lookup Keuangan | Phase 3 — pemetaan **per barang** |
| `keterangan` | Keterangan | Textarea | Tidak | Maks 255 char | Input admin | Field kanonik `keterangan` |

##### 8.3.1.1 Section Konversi Satuan (Input — multi-aturan)

Section input dinamis (tabel) pada form Tambah/Edit; user dapat **menambah/menghapus baris** aturan. Disimpan ke child table `household_item_unit_conversion` (1 barang : 0..n aturan).

| Field (per baris) | Label | Tipe | Wajib | Validasi | Catatan |
|-------------------|-------|------|-------|----------|---------|
| `from_unit_id` | Satuan Besar | Dropdown (lookup A22) | Ya (bila baris diisi) | Master aktif | mis. Box |
| `factor` | Faktor (Jumlah) | Number | Ya | > 0 | Jumlah satuan kecil per 1 satuan besar |
| `to_unit_id` | Satuan Kecil | Dropdown (lookup A22) | Ya (bila baris diisi) | Master aktif, ≠ Satuan Besar | mis. Strip |

> Makna baris: *1 [Satuan Besar] = [Faktor] [Satuan Kecil]*. Pasangan (Satuan Besar–Satuan Kecil) **unik per barang**; mendukung rantai (Box→Strip, Strip→Pcs). Section opsional — BR-A5-18.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Total Barang Aktif | count `master_household_item` where `is_active` | Angka besar (kartu) | — | Ringkasan |
| Total Barang Nonaktif | count where `!is_active` | Angka besar (kartu) | — | Ringkasan |
| Nomor | Urutan baris (pagination) | Integer | Sort | Reset per halaman |
| Kode | `master_household_item.code` | Text | Search + Sort | — |
| Nama Barang | `master_household_item.name` | Text (link → Detail) | Search + Sort (default A–Z) | Klik menuju Detail |
| Kategori | join A33.name | Text | Filter + Sort | BR-A5-04 |
| Satuan | `master_household_item.unit` | Text | Filter + Sort | — |
| Pabrikan | join A54.name | Text | Filter + Sort | Opsional |
| Status | `master_household_item.is_active` | Badge (Aktif = hijau / Nonaktif = abu) | Filter + Sort | BR-A5-09 |
| Aksi | — | [Detail] + toggle Status | — | Sesuai RBAC; [Ekspor]/[Impor] di header |

#### Business Rules

| ID | Aturan |
|----|--------|
| BR-A5-01 | Field wajib (**Nama, Kategori, Satuan**) harus terisi sebelum simpan; jika tidak, simpan ditolak. |
| BR-A5-02 | **Kode barang di-generate sistem otomatis** (unik, format readable = **prefix Kategori + nomor urut**), **tidak diinput manual**, dan **immutable** setelah dibuat. |
| BR-A5-03 | Kombinasi **Nama + Kategori + Satuan** tidak boleh duplikat; jika terdeteksi → peringatan duplikat & wajib konfirmasi/koreksi. |
| BR-A5-04 | **Kategori** harus dipilih dari Master Kategori Barang (A33) berstatus **aktif** dengan **Kelompok Barang "Rumah Tangga"** — field Kategori **hanya menampilkan kategori ber-Kelompok Barang "Rumah Tangga"** (bukan Farmasi/Gizi/dll); tidak boleh free-text. Dasar filter = field **'Kelompok Barang'** pada A33. |
| BR-A5-05 | **Satuan** (dan Kemasan bila diisi) harus dipilih dari Master Satuan & Kemasan (A22) — tidak boleh free-text. |
| BR-A5-06 | Perubahan data master langsung berlaku **real-time** di seluruh modul pembaca, tanpa restart sistem. |
| BR-A5-07 | Setiap aksi **create/update/status-change** wajib dicatat di Audit Trail (user, timestamp, before→after), bersifat immutable. |
| BR-A5-08 | **Tidak ada fitur hard delete sama sekali** di modul ini — seluruh penghapusan berupa soft `NONAKTIF`; barang yang pernah dipakai transaksi tetap tersimpan sebagai histori. |
| BR-A5-09 | Barang berstatus **Nonaktif** tidak muncul sebagai opsi pemilihan **baru** di modul Inventori/Pengadaan, namun tetap tampil pada data historis. |
| BR-A5-10 | **Status di-set `AKTIF` oleh sistem** saat Tambah (tanpa input status di form); aktif/nonaktif dikelola via toggle di Dashboard. |
| BR-A5-11 | Pencarian & filter (Nama/Kode/Kategori/Status) harus mengembalikan hasil < 3 detik (server-side pagination untuk ribuan barang). |
| BR-A5-12 | Hak akses CRUD master dibatasi role berizin Master Data (RBAC A53). |
| BR-A5-13 | **[Phase 2]** Pada Impor mode `tambah`: baris dengan Kode/Nama sudah ada → di-skip & dilaporkan. Mode `tambah+update`: baris existing di-update. Field kanonik `file_import`/`mode_import`. |
| BR-A5-14 | **[Phase 2]** Ekspor mencakup **SELURUH field** barang RT sesuai filter aktif, dengan baris header. |
| BR-A5-15 | **[Phase 3]** Pemetaan akun COA persediaan mengacu A51 — **per barang**. |
| BR-A5-16 | Barang RT bersifat **non-medis/non-farmasi** → **tidak** memerlukan kode terminologi/standar maupun integrasi SATUSEHAT/BPJS (dikonfirmasi; berbeda dengan A4 Barang Farmasi). |
| BR-A5-17 | **`harga_beli` & `het` dikelola di Master Barang RT ini** (bukan di modul Keuangan/Pengadaan); modul lain hanya mengonsumsi sebagai referensi. |
| BR-A5-18 | **Konversi satuan dikelola di master ini sebagai section input multi-aturan** (child `household_item_unit_conversion`). User dapat **menambah beberapa baris** aturan; tiap aturan = *1 [Satuan Besar] = [faktor > 0] [Satuan Kecil]*. Pasangan (Satuan Besar–Satuan Kecil) **unik per barang**, Satuan Kecil ≠ Satuan Besar; section bersifat **opsional** (0..n aturan). |

---

## 9. Workflow / BPMN Interpretation

> [ASUMSI] Modul ini **tidak memiliki BPMN sendiri**. Alur diturunkan dari pola CRUD master data sejenis (A4 Barang Farmasi, A33 Kategori Barang) + flow proses lampiran. Penomoran gateway bersifat [ASUMSI].

### Alur Phase 1 — Tambah / Ubah Barang RT

```
[Admin Master Data]
  │
  ├─ Buka Master Data → Barang Rumah Tangga → Dashboard
  ├─ Tambah (atau Detail untuk ubah)
  ├─ Isi/ubah form (Nama, Kategori, Satuan, Kemasan?, Pabrikan?, Harga, HET?, Barcode?, Keterangan?)
  │    └─ Section Konversi Satuan (opsional, multi-aturan): tambah/hapus baris 1 SatuanBesar = faktor SatuanKecil
  │    ├─ Kode TIDAK diinput — sistem generate otomatis (unik, readable)
  │    └─ Status TIDAK diinput — sistem set AKTIF otomatis
  ├─ Klik [Simpan]
  │    ├─ [Gateway] Field wajib (Nama/Kategori/Satuan) terisi & valid? Tidak → error per field → kembali
  │    ├─ [Gateway] Tiap aturan konversi (bila ada): faktor > 0, satuan valid & berbeda, pasangan unik? Tidak → error → kembali
  │    │     └─ Sistem auto-generate Kode (readable, unik) saat simpan
  │    ├─ [Gateway] Kombinasi Nama+Kategori+Satuan duplikat? Ya → peringatan duplikat → konfirmasi/koreksi
  │    └─ [Valid] → simpan ke DB master → catat audit trail → redirect Dashboard (real-time, sinkron modul terkait)
  │
[Modul lain — Inventori / Keuangan / Logistik]
  └─ Membaca referensi barang RT (real-time, tanpa restart)
```

### Alur Phase 1 — Kelola Status (Aktif/Nonaktif) di Dashboard

```
[Admin Master Data]
  │
  ├─ Dashboard → toggle Status pada baris barang
  ├─ Penghapusan = SELALU soft NONAKTIF — TIDAK ADA hard delete di modul ini
  │    └─ Set status sesuai pilihan (Aktif/Nonaktif)
  └─ Catat audit trail (status change)
       └─ Barang NONAKTIF tak muncul sebagai opsi baru di modul lain (histori tetap)
```

### Alur Phase 2 — Ekspor & Impor Massal

```
[Admin Master Data] — Ekspor
  └─ Dashboard → [Ekspor]
       └─ Sistem generate file (SEMUA field sesuai filter aktif, header kolom)
            └─ Unduhan file ke perangkat Admin

[Admin Master Data] — Impor Massal (.csv)
  └─ Dashboard → [Impor] → unduh template (.csv) → isi → upload file + pilih mode (tambah / tambah+update)
       ├─ Pratinjau beberapa baris pertama
       └─ Klik [Impor] → validasi per baris (wajib, duplikat Nama+Kategori+Satuan, lookup Kategori/Satuan, aturan konversi multi); Kode di-generate sistem per baris
             ├─ Baris valid → simpan (mode tambah+update → update existing); duplikat (mode tambah) → skip & laporkan
             ├─ Baris gagal → ringkasan error (baris ke-N: alasan)
             └─ Selesai → ringkasan (X berhasil, Y gagal/di-skip) → Dashboard real-time
```

---

### Asumsi
- [ASUMSI] Modul tidak punya BPMN sendiri; alur CRUD & gateway validasi/duplikasi diturunkan dari pola Master Data sejenis (A4, A33) + flow lampiran.
- [ASUMSI] Kondisi As-Is (Excel manual, ketergantungan IT, tanpa audit trail) diturunkan dari Background lampiran dokumen.
- Barang RT bersifat non-medis → **tidak** memerlukan kode terminologi/standar maupun integrasi SATUSEHAT/BPJS (dikonfirmasi; berbeda A4 Barang Farmasi).
- `harga_beli`, `het`, dan **konversi satuan (multi-aturan)** **dikelola di master ini** (dikonfirmasi). Field `barcode` opsional. Field `supplier_id` **dihapus** — supplier tidak disimpan di A5 (dikelola di modul Pengadaan/Pemesanan).
- [ASUMSI] Default status barang baru = `AKTIF` (di-set sistem, tanpa input di form Tambah). Default sort Riwayat Aktivitas = waktu terbaru.
- [ASUMSI] Kolom `status_approval`/`role_approver` disiapkan di skema untuk Phase 2 namun tidak dipakai pada MVP (master data barang RT tidak membutuhkan approval berjenjang).
- Field kanonik (`kode`, `nama`, `keterangan`, `satuan`, `status_aktif`, `file_import`, `mode_import`) mengikuti definisi bersama lintas-PRD agar konsisten dengan modul Master Data lain.

### Keputusan Terkonfirmasi *(menutup pertanyaan terbuka sebelumnya)*
- **`harga_beli` & HET** dikelola di Master Barang RT ini (BR-A5-17).
- **Hard delete**: tidak ada fitur hard delete sama sekali — hanya soft nonaktif (BR-A5-08).
- **Kode**: di-generate sistem otomatis, unik, immutable, format readable = **prefix Kategori + nomor urut** (BR-A5-02).
- **Konversi satuan**: dikelola di master ini sebagai **section input multi-aturan** (user dapat menambah baris); child `household_item_unit_conversion` (BR-A5-18).
- **Kode terminologi/standar**: barang non-medis tidak memerlukannya (BR-A5-16).
- **Ekspor & Impor**: format **.csv** (UTF-8, delimiter koma standar).
- **Phase 3 COA**: pemetaan **per barang** (BR-A5-15).

### Pertanyaan Terbuka
- [PERLU KONFIRMASI] Kebutuhan field `barcode`/SKU (opsional saat ini) — apakah dipakai pemindaian di Inventori?

> **Terkonfirmasi**: format `kode` = **prefix Kategori + nomor urut** (BR-A5-02).
