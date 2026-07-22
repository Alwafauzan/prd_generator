# Product Requirement Document (PRD)
# A4 — Master Data Barang Farmasi

---

## 1. Metadata Dokumen

* **Approval**: [Nama Kepala Instalasi Farmasi / Kepala Bidang IT, Jabatan, Tanggal]
* **Related Documents**:
  * A21 — Master Data Sediaan Barang (bentuk sediaan: tablet, kapsul, sirup, dll.)
  * A22 — Master Data Satuan & Kemasan (satuan terkecil & jenis kemasan)
  * A33 — Master Data Kategori Barang
  * A42 — Master Data Gudang dan Farmasi
  * Formularium Nasional (FORNAS) & Formularium RS
  * Pedoman SATUSEHAT Terminology V2 (kode KFASD / KFA)
  * Regulasi e-Klaim BPJS terkait Kode Obat
  * [PERLU KONFIRMASI] SOP Pengelolaan Obat Narkotika & Psikotropika
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-29 | 1.0 | Draft awal PRD Master Data Barang Farmasi |
| 2026-06-29 | 1.1 | Sesuaikan struktur dengan template terbaru: validasi per-fitur, 8.3 Data & Business Rules |
| 2026-06-29 | 1.2 | Update 8.1 (id → UUID), 8.2 (hapus kolom Auth), 8.3 → 8.3.1 Form Input + 8.3.2 List View |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Barang Farmasi** adalah repositori terpusat seluruh barang farmasi (obat, bahan medis habis pakai, dan alat kesehatan) yang dikelola di gudang farmasi RS. Data ini menjadi **sumber kebenaran tunggal (single source of truth)** yang dikonsumsi oleh seluruh proses operasional farmasi: dari pemesanan, penerimaan, distribusi, dispensing resep, hingga pelaporan ke BPJS dan SATUSEHAT.

> **[ASUMSI]** Ruang lingkup modul ini adalah barang yang dikelola oleh Instalasi Farmasi RS (obat, BMHP, alkes ringan). Barang rumah tangga dan barang gizi dikelola di modul terpisah (A5, A6).

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Data barang tersebar di spreadsheet Excel per unit; tidak ada satu master terpusat.
- Nama dan kode obat tidak konsisten antar unit (Farmasi, Poli, IGD, IBS masing-masing pakai istilah berbeda).
- Pemetaan kode BPJS dan SATUSEHAT dilakukan manual per transaksi klaim — rawan error dan duplikasi kerja.
- Tidak ada pengelolaan stok minimum; reorder dilakukan berdasarkan perkiraan manual petugas gudang.
- Data barang untuk e-resep dan dispensing diambil dari catatan fisik atau ingatan petugas farmasi.
- Perubahan harga atau formularium harus diupdate manual di setiap file/dokumen yang menggunakan data tersebut.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin Farmasi/IT mengelola satu master data terpusat via UI terstruktur.
- **Phase 1**: CRUD lengkap + search/filter + toggle aktif/nonaktif + API internal untuk semua modul konsumen.
- **Phase 2**: Sinkronisasi kode KFA (Kode Farmasi) dari SATUSEHAT Terminology API + sinkronisasi kode obat BPJS e-Klaim; data barang aktif otomatis tersedia di katalog Apotek Online (F22/C15).

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi data barang lintas modul | 0 inkonsistensi nama/kode barang antara modul farmasi, inventori, dan billing setelah go-live |
| 2 | Kelengkapan atribut barang | ≥ 95% barang aktif memiliki kode SATUSEHAT (KFA) terisi saat go-live Phase 2 |
| 3 | Waktu pencarian barang di form dispensing | Petugas farmasi menemukan barang yang dicari dalam ≤ 5 detik (via search autocomplete) |
| 4 | Ketersediaan API | Endpoint master barang farmasi uptime ≥ 99,5% |
| 5 | Akurasi stok minimum | 100% barang aktif memiliki `stok_minimum` terisi sebagai trigger rencana pengadaan (H10) |
| 6 | [Phase 2] Sinkronisasi SATUSEHAT | Lag sinkronisasi terminologi ≤ 1 hari kerja setelah update SATUSEHAT |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD + API) | Phase 2 (Advanced: Integrasi Eksternal) |
|---------------|---------------------------|------------------------------------------|
| Form input barang farmasi | CRUD lengkap semua atribut dasar + toggle aktif/nonaktif | Tambah field `kode_kfa`, `kode_bpjs_eklaim` |
| Dashboard daftar barang | Tabel + filter (kategori, golongan, formularium, status) + search + pagination | Filter tambahan: kode KFA, status sinkronisasi SATUSEHAT |
| Detail barang | Tampilan detail semua atribut + riwayat perubahan | Tampilkan status sinkronisasi SATUSEHAT & BPJS |
| API internal barang farmasi | `GET /api/v1/master/barang-farmasi` (list/search untuk dropdown dan tampilan) | Filter `kode_kfa`, response tambah field integrasi |
| Import data awal | — | Import massal via CSV (migrasi dari Excel) |
| Sinkronisasi SATUSEHAT (KFA) | — | Fetch terminologi KFA dari SATUSEHAT API; pemetaan per barang |
| Sinkronisasi BPJS e-Klaim | — | Pemetaan kode obat BPJS per barang |
| Katalog Apotek Online | — | Barang aktif + harga jual otomatis tersedia di F22/C15 |

**Out of Scope:**
- Pengelolaan stok fisik (penerimaan, distribusi, stok opname) — dikerjakan di modul H1–H10.
- Penetapan harga jual dinamis / diskon — [PERLU KONFIRMASI] apakah ada modul pricing terpisah.
- Master data barang rumah tangga (A5) dan barang gizi (A6).
- Manajemen supplier/vendor — [PERLU KONFIRMASI] apakah ada modul vendor terpisah.
- Pengelolaan obat narkotika & psikotropika di luar atribut kategorisasi (SOP pengelolaan fisik ada di luar scope sistem ini).

---

## 5. Related Features

| Kode | Nama Fitur | Tipe Relasi | Deskripsi Relasi Teknis & Bisnis |
|------|------------|-------------|----------------------------------|
| **H1** | Pemesanan Barang | Konsumen (lookup) | Form pemesanan menggunakan `kode_barang` dari master ini sebagai FK. Field `stok_minimum` di master menjadi trigger otomatis saran pemesanan di H10. |
| **H2** | Penerimaan Barang | Konsumen (lookup) | Penerimaan barang memvalidasi barang yang datang terhadap master ini; `satuan_terkecil` dan `konversi_kemasan` digunakan untuk kalkulasi jumlah stok yang masuk. |
| **H3** | Distribusi Barang | Konsumen (lookup) | Distribusi ke unit/poli mencatat perpindahan stok per `kode_barang`. `stok_minimum` di gudang penerima dicek saat distribusi. |
| **H5** | Mutasi Stok | Konsumen (lookup) | Semua mutasi stok (koreksi, penyesuaian) mengacu ke `kode_barang` dari master ini. |
| **H6** | Stok Opname | Konsumen (lookup) | Daftar barang yang diopname diambil dari master ini (hanya barang `AKTIF`). |
| **H7** | Peminjaman & Pengembalian Barang | Konsumen (lookup) | Barang yang dipinjam dan dikembalikan antar unit diidentifikasi via `kode_barang`. |
| **H9** | Pemusnahan Barang | Konsumen (lookup) | Proses pemusnahan mencatat barang berdasarkan `kode_barang`; kategori `NARKOTIKA`/`PSIKOTROPIKA` memerlukan berita acara khusus. |
| **H10** | Rencana Pengadaan Barang | Konsumen (trigger) | `stok_minimum` dan `stok_maksimum` dari master ini menjadi parameter kalkulasi kebutuhan pengadaan otomatis. |
| **F11** | Konfirmasi Order Resep (RJ) | Konsumen (lookup + stock check) | Petugas farmasi RJ mencari barang via `nama_generik`/`nama_dagang` dari master ini untuk konfirmasi ketersediaan stok sebelum dispensing. |
| **F12** | Penyerahan Obat (RJ) | Konsumen (lookup) | Penyerahan obat mencatat item menggunakan `kode_barang`; `satuan_terkecil` digunakan untuk kalkulasi jumlah yang diserahkan. |
| **F13** | Konfirmasi Order Resep (RI/IGD) | Konsumen (lookup + stock check) | Sama dengan F11 untuk konteks rawat inap dan IGD. |
| **F14** | Penyerahan Obat (RI/IGD) | Konsumen (lookup) | Sama dengan F12 untuk konteks rawat inap dan IGD. |
| **F15** | Konfirmasi Order Resep (IBS) | Konsumen (lookup + stock check) | Sama dengan F11 untuk konteks IBS (bedah). |
| **F16** | Penyerahan Obat (IBS) | Konsumen (lookup) | Sama dengan F12 untuk konteks IBS. |
| **F17** | Retur Obat | Konsumen (lookup) | Retur obat dari pasien/unit merujuk ke `kode_barang`; validasi bahwa barang yang diretur ada di master aktif. |
| **F19** | Penjualan Obat Bebas | Konsumen (lookup + harga) | Kasir farmasi mencari barang via master ini; `harga_jual` dari master digunakan sebagai default harga transaksi penjualan bebas. |
| **F20** | Pengembalian Obat Ranap | Konsumen (lookup) | Pengembalian sisa obat rawat inap diidentifikasi via `kode_barang`. |
| **F21** | Rekonsiliasi Obat | Konsumen (referensi) | Rekonsiliasi obat pasien (riwayat obat di luar RS) dicocokkan ke master ini via `nama_generik` atau `kode_kfa` untuk standardisasi pelaporan. |
| **F22** | Apotek Online | Konsumen (katalog) | [Phase 2] Barang `AKTIF` dengan `tersedia_apotek_online = true` dipublikasikan ke katalog apotek online dengan data `nama_dagang`, `harga_jual`, `satuan_terkecil`. |
| **C15** | Integrasi Apotek Online | Konsumen (katalog eksternal) | [Phase 2] Integrasi ke platform apotek online eksternal menggunakan `kode_kfa` SATUSEHAT sebagai identifier standar barang. |

---

## 6. Business Process & User Stories

### State Machine — Status Barang Farmasi

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Barang tersedia dan dapat digunakan di semua modul | Muncul di semua dropdown, dapat dipesan, diterima, didispensing | → `NONAKTIF` (toggle dashboard) | → `NONAKTIF`; dihapus dari katalog online |
| `NONAKTIF` | Barang tidak aktif / sudah tidak digunakan | Tidak muncul di dropdown pencarian baru; data historis transaksi tetap valid | → `AKTIF` (toggle dashboard) | → `AKTIF`; kembali ke katalog online jika `tersedia_apotek_online = true` |

> Status selalu diset `AKTIF` secara otomatis saat barang baru dibuat. Pengelolaan aktif/nonaktif dilakukan via toggle di Dashboard, bukan di form create/edit.

> Tidak ada status `DRAFT`. Data tersimpan langsung `AKTIF`.

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A4-01 | Admin Farmasi | Menambah barang farmasi baru ke master data | Agar barang tersedia di semua modul operasional farmasi dan inventori |
| US-A4-02 | Admin Farmasi | Mengedit atribut barang (harga, stok min/maks, formularium) | Agar informasi barang selalu akurat sebagai acuan operasional |
| US-A4-03 | Admin Farmasi | Menonaktifkan barang yang sudah tidak digunakan | Agar dropdown di modul lain tidak menampilkan barang obsolet |
| US-A4-04 | Admin Farmasi | Mencari dan memfilter daftar barang farmasi | Agar dapat menemukan barang dengan cepat untuk keperluan audit atau pembaruan data |
| US-A4-05 | Petugas Farmasi | Mencari barang saat dispensing resep (via modul F11–F16) | Agar proses dispensing cepat dan akurat dengan autocomplete nama generik/dagang |
| US-A4-06 | Sistem (H10) | Membaca `stok_minimum` dan `stok_maksimum` barang | Agar rencana pengadaan dapat dikalkulasi otomatis berdasarkan parameter stok |
| US-A4-07 | [Phase 2] Admin IT | Memetakan barang ke kode KFA SATUSEHAT dan kode BPJS | Agar pelaporan ke SATUSEHAT dan klaim BPJS menggunakan kode standar yang valid |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Dashboard Daftar Barang Farmasi**
* **User Story**: Sebagai Admin Farmasi, saya ingin melihat seluruh daftar barang farmasi dengan kemampuan filter dan search agar dapat mengelola dan memverifikasi data dengan efisien.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Halaman menampilkan tabel dengan kolom: No, Kode Barang, Nama Generik, Nama Dagang, Kategori, Golongan, Satuan Terkecil, Harga Jual, Status, Aksi.
  * **AC 2**: Filter tersedia untuk: Kategori (multiselect), Golongan Obat (multiselect), Formularium (Ya / Tidak / Semua), Status (Aktif / Nonaktif / Semua, default: Aktif).
  * **AC 3**: Search teks bebas mencakup kolom Kode Barang, Nama Generik, dan Nama Dagang secara bersamaan; hasil muncul setelah minimal 2 karakter (debounce 300ms).
  * **AC 4**: Pagination 20 baris/halaman; jumlah entri tertera: *"Menampilkan X–Y dari Z barang"*.
  * **AC 5**: Kolom Aksi per baris: [Detail] [Edit] [Toggle Aktif/Nonaktif]. Tidak ada tombol Hapus permanen.
  * **AC 6**: Toggle Aktif/Nonaktif menampilkan konfirmasi sebelum eksekusi (lihat Fitur: Toggle).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Search | Text | Min 2 karakter untuk trigger | — | "Cari berdasarkan kode, nama generik, atau nama dagang" |
  | Filter Status | Dropdown | — | — | Default: Aktif |

---

**Fitur: Tambah Barang Farmasi**
* **User Story**: Sebagai Admin Farmasi, saya ingin menambahkan barang farmasi baru agar barang tersebut segera tersedia di seluruh modul operasional.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form mencakup semua field pada Spesifikasi Data (§8.1). Field wajib: Nama Generik, Kategori, Golongan Obat, Sediaan, Satuan Terkecil, Kemasan, Isi Per Kemasan, Harga Beli, Harga Jual, Stok Minimum.
  * **AC 2**: Kode Barang di-generate otomatis oleh sistem (format `FRM-[6 digit sequential]`); tidak dapat diinput manual.
  * **AC 3**: Status otomatis di-set `AKTIF` oleh sistem — tidak ada pilihan status di form create.
  * **AC 4**: Dropdown Sediaan mengambil data dari A21 (endpoint `GET /api/master/sediaan`); dropdown Satuan Terkecil dan Kemasan mengambil dari A22 (endpoint `GET /api/master/satuan` dan `GET /api/master/kemasan`).
  * **AC 5**: Field `Isi Per Kemasan` menerima angka positif integer; kombinasi Kemasan + Isi Per Kemasan mendefinisikan konversi (contoh: 1 Strip = 10 Tablet).
  * **AC 6**: Harga Beli dan Harga Jual menerima angka positif; Harga Jual tidak boleh lebih kecil dari Harga Beli (warning, bukan hard block — [PERLU KONFIRMASI]).
  * **AC 7**: Setelah berhasil disimpan, sistem redirect ke halaman Detail barang yang baru dibuat; tampil toast *"Barang '[nama_generik]' berhasil ditambahkan."*
  * **AC 8**: Log audit mencatat `created_by` (username) dan `created_at` (timestamp).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Generik | Text | Required | "Nama generik wajib diisi" | "Nama zat aktif / nama INN. Contoh: Amoxicillin, Paracetamol" |
  | Nama Generik | Text | Max 200 karakter | "Nama generik tidak boleh lebih dari 200 karakter" | — |
  | Nama Dagang | Text | Max 200 karakter | "Nama dagang tidak boleh lebih dari 200 karakter" | "Nama merek pabrik (opsional). Contoh: Amoxan, Sanmol" |
  | Kategori | Dropdown | Required | "Kategori wajib dipilih" | "Pilih kelompok barang farmasi" |
  | Golongan Obat | Dropdown | Required | "Golongan obat wajib dipilih" | "Contoh: Obat Keras, Obat Bebas, Narkotika, Psikotropika" |
  | Sediaan | Dropdown (dari A21) | Required | "Bentuk sediaan wajib dipilih" | "Contoh: Tablet, Kapsul, Sirup, Injeksi. Jika tidak ada, tambahkan di Master Sediaan." |
  | Satuan Terkecil | Dropdown (dari A22) | Required | "Satuan terkecil wajib dipilih" | "Satuan terkecil yang dapat didispensing. Contoh: Tablet, ml, Ampul" |
  | Kemasan | Dropdown (dari A22) | Required | "Jenis kemasan wajib dipilih" | "Kemasan pembelian dari supplier. Contoh: Strip, Box, Botol" |
  | Isi Per Kemasan | Number | Required, integer ≥ 1 | "Isi per kemasan wajib diisi dengan angka bulat positif" | "Jumlah satuan terkecil dalam satu kemasan. Contoh: 1 Strip = 10 Tablet → isi: 10" |
  | Kelas Terapi | Text | Max 100 karakter | "Kelas terapi tidak boleh lebih dari 100 karakter" | "Contoh: Analgesik, Antibiotik, Antihipertensi" |
  | Kandungan / Zat Aktif | Textarea | Max 500 karakter | "Kandungan tidak boleh lebih dari 500 karakter" | "Contoh: Amoxicillin trihydrate 500 mg" |
  | Kekuatan / Dosis | Text | Max 50 karakter | "Kekuatan tidak boleh lebih dari 50 karakter" | "Contoh: 500 mg, 125 mg/5 ml" |
  | Rute Pemberian | Dropdown | — | — | "Contoh: Oral, Injeksi IV, Injeksi IM, Topikal, Inhalasi" |
  | Harga Beli | Number | Required, ≥ 0 | "Harga beli wajib diisi dengan angka positif" | "Harga beli dari supplier (per satuan terkecil)" |
  | Harga Jual | Number | Required, ≥ 0 | "Harga jual wajib diisi dengan angka positif" | "Harga jual ke pasien (per satuan terkecil)" |
  | Harga Jual < Harga Beli | Number | Warning soft | Warning toast: "Harga jual lebih kecil dari harga beli. Pastikan ini sudah benar sebelum menyimpan." | — |
  | Stok Minimum | Number | Required, integer ≥ 0 | "Stok minimum wajib diisi" | "Jumlah stok minimal sebelum sistem menyarankan reorder. Satuan: [satuan terkecil]" |
  | Stok Maksimum | Number | Integer ≥ stok minimum | "Stok maksimum tidak boleh lebih kecil dari stok minimum" | "Jumlah stok maksimum gudang (opsional)" |

---

**Fitur: Edit Barang Farmasi**
* **User Story**: Sebagai Admin Farmasi, saya ingin mengubah atribut barang farmasi (harga, stok min/maks, formularium) agar data selalu akurat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form edit identik dengan form tambah, dengan semua field pre-filled dari data existing. Field `kode_barang` dan `created_at` tidak dapat diubah (read-only).
  * **AC 2**: Sistem mencatat perubahan field apa saja yang berubah di log audit (`updated_by`, `updated_at`, diff field).
  * **AC 3**: Perubahan `harga_jual` berlaku segera untuk transaksi baru; transaksi historis yang sudah selesai tidak terpengaruh.
  * **AC 4**: Setelah simpan, sistem tampil toast *"Data barang '[nama_generik]' berhasil diperbarui."* dan tetap di halaman Detail.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  *Validasi field sama dengan Fitur Tambah Barang (form identik, pre-filled). Perbedaan:*
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Barang | Text | Read-only | — | "Kode barang tidak dapat diubah setelah dibuat" |
  | Tanggal Dibuat | Text | Read-only | — | — |
  | Semua field lain | — | Sama dengan form Tambah | (lihat Fitur: Tambah Barang) | — |

---

**Fitur: Toggle Aktif / Nonaktif Barang**
* **User Story**: Sebagai Admin Farmasi, saya ingin menonaktifkan barang yang sudah tidak digunakan agar tidak muncul di dropdown modul lain, tanpa menghapus data historis.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol toggle di kolom Aksi pada Dashboard; label berubah dinamis: [Nonaktifkan] jika barang AKTIF, [Aktifkan] jika NONAKTIF.
  * **AC 2**: Konfirmasi sebelum toggle ke NONAKTIF: *"Menonaktifkan '[nama_generik]' akan menyembunyikan barang ini dari semua form pencarian. Stok fisik dan transaksi historis tidak terpengaruh. Lanjutkan?"*
  * **AC 3**: Konfirmasi sebelum toggle ke AKTIF: *"Mengaktifkan kembali '[nama_generik]'. Barang akan muncul kembali di semua form pencarian. Lanjutkan?"*
  * **AC 4**: Barang yang dinon-aktifkan tidak muncul di dropdown pencarian modul konsumen (default filter `status=AKTIF`).
  * **AC 5**: Tidak ada fitur hapus permanen. Semua penghapusan adalah soft delete via nonaktifkan.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Konfirmasi Nonaktifkan | Dialog | — | — | "Menonaktifkan '[nama_generik]' akan menyembunyikan barang ini dari semua form pencarian. Stok fisik dan transaksi historis tidak terpengaruh. Lanjutkan?" |
  | Konfirmasi Aktifkan | Dialog | — | — | "Mengaktifkan kembali '[nama_generik]'. Barang akan muncul kembali di semua form pencarian. Lanjutkan?" |

---

**Fitur: Detail Barang Farmasi**
* **User Story**: Sebagai Admin Farmasi, saya ingin melihat detail lengkap satu barang farmasi termasuk riwayat perubahannya agar dapat mengaudit data dengan akurat.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Halaman detail menampilkan semua atribut barang dalam layout read-only yang terorganisir per kelompok: Identitas, Atribut Klinis, Kemasan & Satuan, Harga & Pengadaan, Integrasi Eksternal.
  * **AC 2**: Tersedia tombol [Edit] dan tombol [Toggle Aktif/Nonaktif] di halaman detail.
  * **AC 3**: Tabel riwayat perubahan menampilkan: Tanggal, Diubah Oleh, Field yang Berubah, Nilai Lama, Nilai Baru — diurutkan terbaru di atas (maks 20 entri terakhir).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  *Halaman Detail bersifat read-only sepenuhnya — tidak ada form input. Validasi tidak berlaku.*

---

**Fitur: API Internal — Search & List Barang Farmasi**
* **User Story**: Sebagai sistem (modul konsumen: F11–F16, H1–H10, dll.), saya ingin mengambil data barang farmasi via API agar dapat merender dropdown, autocomplete, dan kalkulasi stok.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: `GET /api/v1/master/barang-farmasi` mendukung query params: `search` (string, min 2 char), `kategori`, `golongan`, `formularium` (boolean), `status` (default `AKTIF`), `page`, `limit`.
  * **AC 2**: Response JSON list: `[{ "kode_barang", "nama_generik", "nama_dagang", "kategori", "golongan", "sediaan", "satuan_terkecil", "kemasan", "isi_per_kemasan", "harga_jual", "stok_minimum", "stok_maksimum" }]`.
  * **AC 3**: `GET /api/v1/master/barang-farmasi/:kode` mengembalikan detail lengkap satu barang termasuk semua field.
  * **AC 4**: Endpoint search dioptimalkan dengan index DB pada `nama_generik`, `nama_dagang`, `kode_barang`; response time ≤ 300ms untuk query tanpa filter spesifik.
  * **AC 5**: Endpoint hanya dapat diakses oleh service internal dengan autentikasi service token.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  *Fitur ini adalah API murni tanpa UI langsung — validasi ada di sisi server (lihat AC 1–5).*

---

**Fitur: [Phase 2] Pemetaan Kode KFA SATUSEHAT & Kode BPJS**
* **User Story**: Sebagai Admin IT, saya ingin memetakan setiap barang ke kode KFA SATUSEHAT dan kode BPJS e-Klaim agar pelaporan dan klaim berjalan dengan kode standar yang valid.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Field `kode_kfa` dan `kode_bpjs_eklaim` ditambahkan ke form edit barang.
  * **AC 2**: Tersedia tombol [Sinkronisasi KFA dari SATUSEHAT] di halaman admin yang mem-fetch terminologi terbaru dari SATUSEHAT Terminology API dan menyediakan autocomplete suggestion untuk field `kode_kfa`.
  * **AC 3**: Barang yang belum dipetakan ditandai badge *"KFA Belum Dipetakan"* (kuning) di Dashboard.
  * **AC 4**: Dashboard menampilkan summary: "X dari Y barang aktif sudah dipetakan ke KFA."

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode KFA | Text / Autocomplete | Format valid KFA (server) | "Kode KFA '[X]' tidak ditemukan di SATUSEHAT. Pilih dari daftar saran." | "Kode Farmasi SATUSEHAT. Gunakan tombol [Sinkronisasi KFA] untuk saran otomatis." |
  | Kode BPJS e-Klaim | Text | Max 20 karakter | "Kode BPJS tidak boleh lebih dari 20 karakter" | "Kode obat BPJS untuk kebutuhan klaim e-Klaim" |

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `pharmacy_items`**

| Kolom | Tipe Data | Nullable | Default | Keterangan |
|-------|-----------|----------|---------|------------|
| `id` | UUID | NOT NULL | Auto | Primary Key |
| `kode_barang` | VARCHAR(20) | NOT NULL | Auto `FRM-000001` | Unik, immutable, indexed |
| `nama_generik` | VARCHAR(200) | NOT NULL | — | Indexed (full-text search) |
| `nama_dagang` | VARCHAR(200) | NULL | — | Indexed (full-text search) |
| `kategori` | ENUM(`OBAT`, `BMHP`, `ALKES`) | NOT NULL | — | [PERLU KONFIRMASI] kategori lainnya |
| `golongan_obat` | ENUM(`BEBAS`, `BEBAS_TERBATAS`, `KERAS`, `NARKOTIKA`, `PSIKOTROPIKA`, `OWA`) | NOT NULL | — | |
| `id_sediaan` | BIGINT (FK → `m_sediaan`) | NOT NULL | — | Relasi ke A21 |
| `id_satuan_terkecil` | BIGINT (FK → `m_satuan`) | NOT NULL | — | Relasi ke A22 |
| `id_kemasan` | BIGINT (FK → `m_kemasan`) | NOT NULL | — | Relasi ke A22 |
| `isi_per_kemasan` | INTEGER | NOT NULL | — | Jumlah satuan terkecil per kemasan |
| `kelas_terapi` | VARCHAR(100) | NULL | — | |
| `kandungan` | TEXT | NULL | — | Zat aktif dan kekuatannya |
| `kekuatan` | VARCHAR(50) | NULL | — | Contoh: "500 mg", "125 mg/5 ml" |
| `rute_pemberian` | ENUM(`ORAL`, `INJEKSI_IV`, `INJEKSI_IM`, `TOPIKAL`, `INHALASI`, `SUBLINGUAL`, `REKTAL`, `LAINNYA`) | NULL | — | |
| `formularium` | BOOLEAN | NOT NULL | FALSE | Apakah masuk formularium RS |
| `formularium_nasional` | BOOLEAN | NOT NULL | FALSE | Apakah masuk FORNAS |
| `harga_beli` | DECIMAL(15,2) | NOT NULL | 0 | Per satuan terkecil |
| `harga_jual` | DECIMAL(15,2) | NOT NULL | 0 | Per satuan terkecil |
| `stok_minimum` | INTEGER | NOT NULL | 0 | Trigger reorder di H10 |
| `stok_maksimum` | INTEGER | NULL | — | |
| `tersedia_apotek_online` | BOOLEAN | NOT NULL | FALSE | [Phase 2] Flag untuk F22/C15 |
| `kode_kfa` | VARCHAR(20) | NULL | — | [Phase 2] Kode Farmasi SATUSEHAT |
| `kode_bpjs_eklaim` | VARCHAR(20) | NULL | — | [Phase 2] Kode BPJS e-Klaim |
| `is_active` | BOOLEAN | NOT NULL | TRUE | FALSE = NONAKTIF (soft delete) |
| `created_by` | VARCHAR(100) | NOT NULL | — | Username pembuat |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | |
| `updated_by` | VARCHAR(100) | NULL | — | Username pengubah terakhir |
| `updated_at` | TIMESTAMP | NULL | — | |

**Table: `pharmacy_item_audit_logs`** *(riwayat perubahan)*

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID | PK |
| `pharmacy_item_id` | UUID (FK) | Referensi ke `pharmacy_items` |
| `changed_by` | VARCHAR(100) | Username |
| `changed_at` | TIMESTAMP | Waktu perubahan |
| `field_name` | VARCHAR(100) | Nama field yang berubah |
| `old_value` | TEXT | Nilai lama |
| `new_value` | TEXT | Nilai baru |

> **Catatan desain Phase 2**: Kolom `kode_kfa`, `kode_bpjs_eklaim`, dan `tersedia_apotek_online` sudah disertakan sejak Phase 1 (nullable) agar tidak memerlukan migrasi schema di Phase 2.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/master/barang-farmasi` | List + search + filter; params: `search`, `category`, `drug_class`, `is_formulary`, `status`, `page`, `limit` |
| POST | `/api/v1/master/barang-farmasi` | Create barang baru; `is_active` otomatis `true` |
| GET | `/api/v1/master/barang-farmasi/:item_code` | Detail satu barang by `item_code` |
| PUT | `/api/v1/master/barang-farmasi/:item_code` | Update semua atribut (kecuali `item_code`) |
| PATCH | `/api/v1/master/barang-farmasi/:item_code/toggle` | Toggle `is_active` true ↔ false |
| GET | `/api/v1/master/barang-farmasi/:item_code/audit-log` | Riwayat perubahan per barang |
| GET | `/api/v1/master/barang-farmasi/search` | Autocomplete (min 2 char); response: `item_code`, `generic_name`, `brand_name`, `smallest_unit`, `selling_price` |

> **Catatan caching**: Endpoint list/search **tidak** di-cache agresif karena data bisa berubah oleh admin. Gunakan HTTP cache header `Cache-Control: no-store` atau max `max-age=30` untuk menghindari stale data di modul konsumen.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `generic_name` | Nama Generik | VARCHAR(200) | Ya | Not empty, max 200 | Input admin | Nama INN / zat aktif |
| `brand_name` | Nama Dagang | VARCHAR(200) | Tidak | Max 200 | Input admin | Nama merek pabrik; tampil "-" jika kosong |
| `category` | Kategori | ENUM | Ya | `OBAT`, `BMHP`, `ALKES` | Dropdown | [PERLU KONFIRMASI] kategori lainnya |
| `drug_class` | Golongan Obat | ENUM | Ya | `BEBAS`, `BEBAS_TERBATAS`, `KERAS`, `NARKOTIKA`, `PSIKOTROPIKA`, `OWA` | Dropdown | Derivasi flag narkotika/psikotropika otomatis |
| `dosage_form_id` | Sediaan | UUID (FK) | Ya | Exists di `dosage_forms` | Dropdown dari A21 | Contoh: Tablet, Kapsul, Sirup |
| `smallest_unit_id` | Satuan Terkecil | UUID (FK) | Ya | Exists di `units` | Dropdown dari A22 | Satuan terkecil yang didispensing |
| `packaging_id` | Kemasan | UUID (FK) | Ya | Exists di `packagings` | Dropdown dari A22 | Kemasan pembelian dari supplier |
| `qty_per_package` | Isi Per Kemasan | INTEGER | Ya | ≥ 1 | Input admin | Konversi: 1 kemasan = N satuan terkecil |
| `therapy_class` | Kelas Terapi | VARCHAR(100) | Tidak | Max 100 | Input admin | Contoh: Analgesik, Antibiotik |
| `composition` | Kandungan / Zat Aktif | TEXT | Tidak | Max 500 | Input admin | Contoh: Amoxicillin trihydrate 500 mg |
| `strength` | Kekuatan / Dosis | VARCHAR(50) | Tidak | Max 50 | Input admin | Contoh: 500 mg, 125 mg/5 ml |
| `route_of_admin` | Rute Pemberian | ENUM | Tidak | `ORAL`, `INJEKSI_IV`, `INJEKSI_IM`, `TOPIKAL`, `INHALASI`, `SUBLINGUAL`, `REKTAL`, `LAINNYA` | Dropdown | |
| `is_formulary` | Formularium RS | BOOLEAN | Ya | true / false | Checkbox | Default: false |
| `is_national_formulary` | Formularium Nasional | BOOLEAN | Ya | true / false | Checkbox | Default: false |
| `purchase_price` | Harga Beli | DECIMAL(15,2) | Ya | ≥ 0 | Input admin | Per satuan terkecil |
| `selling_price` | Harga Jual | DECIMAL(15,2) | Ya | ≥ 0; warning jika < `purchase_price` | Input admin | Per satuan terkecil; default harga F19 |
| `min_stock` | Stok Minimum | INTEGER | Ya | ≥ 0 (0 = tidak ada batas) | Input admin | Trigger rencana pengadaan di H10 |
| `max_stock` | Stok Maksimum | INTEGER | Tidak | ≥ `min_stock` jika diisi | Input admin | Batas atas pengadaan di H10 |
| `kfa_code` | [P2] Kode KFA SATUSEHAT | VARCHAR(20) | Tidak (P1) / Ya (P2) | Format valid KFA (validasi server) | Input / sync SATUSEHAT API | Wajib sebelum laporan SATUSEHAT dikirim |
| `bpjs_claim_code` | [P2] Kode BPJS e-Klaim | VARCHAR(20) | Tidak | Max 20 | Input admin | Untuk kebutuhan klaim BPJS |
| `available_online` | [P2] Tersedia di Apotek Online | BOOLEAN | Tidak | Hanya `true` jika `is_active` DAN `kfa_code` terisi | Checkbox | Flag untuk katalog F22/C15 |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No | Urutan tampilan | Integer | — | Reset per halaman |
| Kode Barang | `item_code` | String | Sort ascending | Immutable |
| Nama Generik | `generic_name` | String | Search (min 2 char), Sort | Indexed |
| Nama Dagang | `brand_name` | String / "-" jika null | Search | Indexed |
| Kategori | `category` | Label: Obat / BMHP / Alkes | Filter multiselect | — |
| Golongan | `drug_class` | Label singkat | Filter multiselect | — |
| Satuan Terkecil | `smallest_unit.name` | String | — | Join ke `units` |
| Harga Jual | `selling_price` | Rp #.##0 | Sort | Per satuan terkecil |
| Formularium | `is_formulary` | Badge: Ya (hijau) / Tidak (abu) | Filter: Ya / Tidak / Semua | — |
| Status | `is_active` | Badge: Aktif (hijau) / Nonaktif (abu) | Filter, default: Aktif | — |
| [P2] KFA | `kfa_code` | String / Badge kuning "Belum dipetakan" | Filter: Sudah / Belum | Phase 2 |
| Aksi | — | [Detail] [Edit] [Toggle Aktif/Nonaktif] | — | Tidak ada tombol hapus permanen |

* **Business Rules**:
  * **BR-A4-01**: Status barang saat baru dibuat **selalu `AKTIF`** — tidak ada input status di form create. Pengelolaan aktif/nonaktif hanya via toggle di Dashboard.
  * **BR-A4-02**: Tidak ada hapus permanen. Barang hanya dapat di-nonaktifkan (`is_active = false`). Data historis transaksi yang merujuk barang NONAKTIF tetap valid.
  * **BR-A4-03**: Barang `NONAKTIF` tidak muncul di dropdown/search modul konsumen kecuali diminta eksplisit (`status=NONAKTIF` atau `status=ALL`).
  * **BR-A4-04**: Konversi kemasan: `1 packaging = qty_per_package × smallest_unit`. Digunakan H2 (penerimaan) dan H3 (distribusi) untuk konversi jumlah stok.
  * **BR-A4-05**: Barang dengan `drug_class = NARKOTIKA` atau `PSIKOTROPIKA` otomatis di-flag `is_controlled_substance = true` — digunakan H9 untuk filter laporan pemusnahan khusus.
  * **BR-A4-06**: `selling_price` digunakan sebagai default harga di F19 (penjualan bebas). Modul F19 dapat meng-override harga per transaksi sesuai kebijakan RS.
  * **BR-A4-07**: [Phase 2] Barang yang digunakan dalam laporan SATUSEHAT wajib memiliki `kfa_code` valid. Sistem memblokir pengiriman laporan jika ada barang tanpa `kfa_code`.
  * **BR-A4-08**: [Phase 2] `available_online = true` hanya dapat di-set jika `is_active = true` DAN `kfa_code` sudah terisi.
  * **BR-A4-09**: [PERLU KONFIRMASI] Satu barang diasumsikan satu kemasan primer. Multi-kemasan (strip DAN box) belum di-scope di Phase 1.

---

## 9. Workflow / BPMN Interpretation

> [ASUMSI] Tidak tersedia file BPMN spesifik untuk modul ini. Alur berikut disusun berdasarkan analogi master data dan kebutuhan fungsional yang dijelaskan.

### Alur Phase 1 — Setup & Operasional

```
[Admin Farmasi — Setup Awal & Maintenance]
  │
  ├─ Buka sidebar: Control Panel → Master Data → Barang Farmasi
  ├─ Dashboard → [+ Tambah Barang Farmasi]
  │    ├─ Isi form: Identitas, Atribut Klinis, Kemasan & Satuan, Harga & Pengadaan
  │    ├─ [Validasi gagal] → Tampil error inline → Kembali ke form
  │    └─ [Validasi OK] → Simpan → Status = AKTIF → Redirect ke halaman Detail
  │
  ├─ Dashboard → Baris barang → [Edit]
  │    └─ Update atribut (harga, stok min, formularium) → Simpan → Audit log dicatat
  │
  └─ Dashboard → Baris barang → [Nonaktifkan]
       └─ Konfirmasi → Status = NONAKTIF → Barang hilang dari dropdown modul konsumen

[Modul Konsumen — Contoh: Petugas Farmasi RJ (F11)]
  │
  ├─ Form konfirmasi resep → Field "Cari Obat":
  │    └─ GET /api/v1/master/barang-farmasi/search?search=amox&status=AKTIF
  │         └─ Autocomplete tampil → Petugas pilih → kode_barang tersimpan di transaksi resep
  │
[Modul Konsumen — H10: Rencana Pengadaan]
  │
  └─ Sistem baca stok_minimum per barang → bandingkan dengan stok fisik terkini
       └─ Barang yang stok < stok_minimum → masuk daftar rencana pengadaan otomatis
```

### Alur Phase 2 — Integrasi SATUSEHAT

```
[Admin IT — Pemetaan KFA]
  │
  ├─ Dashboard → Filter "KFA Belum Dipetakan" → Daftar barang tanpa kode_kfa
  ├─ Per barang → [Edit] → [Sinkronisasi KFA dari SATUSEHAT]
  │    └─ Sistem fetch SATUSEHAT Terminology API → Autocomplete kode KFA
  │         └─ Admin pilih / input manual → Simpan → Badge kuning hilang
  │
[Modul Pelaporan SATUSEHAT]
  │
  └─ Saat generate laporan → validasi semua barang yang dipakai punya kode_kfa
       ├─ [Ada yang null] → Tampil daftar barang yang perlu dipetakan → Blokir kirim
       └─ [Semua valid] → Laporan dikirim ke SATUSEHAT dengan kode KFA standar
```

---

## 10. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-A4-01 | Performa | Halaman dashboard (default filter: AKTIF) load ≤ 2 detik untuk ≤ 2000 baris |
| NFR-A4-02 | Performa | Endpoint search autocomplete response time ≤ 300ms (index pada `nama_generik`, `nama_dagang`) |
| NFR-A4-03 | Keamanan | Akses halaman master barang farmasi dibatasi role: `ADMIN_FARMASI`, `ADMIN_IT`, `SUPERADMIN` |
| NFR-A4-04 | Keamanan | Endpoint API internal tidak exposed ke browser client; hanya service-to-service |
| NFR-A4-05 | Integritas Data | Soft delete only; semua nonaktifkan dicatat di audit log |
| NFR-A4-06 | Audit | Setiap create/edit/toggle dicatat di `m_barang_farmasi_audit_log`; retensi minimal 3 tahun |
| NFR-A4-07 | [Phase 2] Keamanan | Token SATUSEHAT API disimpan terenkripsi di server; tidak di client |

---

## 11. Open Questions & Assumptions

### Asumsi
- [ASUMSI] Satu barang farmasi memiliki satu kemasan primer per entry. Multi-kemasan (strip + box) diasumsikan sebagai relasi konversi, bukan entri terpisah.
- [ASUMSI] Harga beli dan harga jual adalah per satuan terkecil (bukan per kemasan).
- [ASUMSI] Kode barang bersifat immutable setelah dibuat — tidak dapat diubah meski nama generik berubah.
- [ASUMSI] Pengelolaan formularium RS tidak memerlukan approval workflow; Admin Farmasi dapat langsung set `formularium = true/false`.

### Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah kategori barang cukup dengan `OBAT`, `BMHP`, `ALKES` atau ada kategori lain yang dibutuhkan Instalasi Farmasi?
- [PERLU KONFIRMASI] Apakah harga beli/jual per satuan terkecil sudah cukup, atau perlu juga harga per kemasan?
- [PERLU KONFIRMASI] Apakah satu barang bisa memiliki lebih dari satu kemasan (mis. tersedia dalam strip 10 tablet DAN box 100 tablet)?
- [PERLU KONFIRMASI] Apakah ada regulasi internal RS yang mensyaratkan approval sebelum barang baru aktif di sistem? Jika ya, perlu tambah workflow approval di Phase 2.
- [PERLU KONFIRMASI] Apakah field `rute_pemberian` perlu multiselect (satu obat bisa oral DAN injeksi)?
