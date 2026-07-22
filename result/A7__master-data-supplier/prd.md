# PRD — Master Data Supplier

**Related Document:** List Fitur V2.xlsx (sheet MVP) — A7; PRD terkait: A4 Barang Farmasi, A5 Barang Rumah Tangga, A6 Barang Gizi, A8 Instansi Rekanan, A33 Kategori Barang, A54 Pabrikan, A38 Bank; BPMN acuan: g-backoffice-inventory-pemesanan, g-backoffice-inventory-distribusi
**Versi:** 1.1 - Penajaman: kode Supplier auto-generate
**Tanggal:** 2026-06-17

## 1. Overview / Brief Summary

Modul **Master Data — Supplier** (kode A7, cluster Control Panel) adalah sumber kebenaran tunggal (*single source of truth*) data Supplier untuk seluruh modul SIMRS. Supplier = badan usaha/perorangan yang memasok barang ke RS: barang farmasi (A4), barang rumah tangga (A5), dan barang gizi (A6).

Modul menyediakan operasi CRUD (Create, Read, Update, Delete/non-aktif) data Supplier beserta atribut legal, kontak, rekening bank, dan kategori barang yang dipasok. Data Supplier dipakai ulang (di-*lookup*) oleh proses Pemesanan/Pengadaan, Penerimaan Barang, Pencatatan Stok, Peminjaman/Pengembalian, dan Retur Barang.

**Kode Supplier di-auto-generate sistem** (format baku, lihat section 14) sehingga konsisten antar unit & bebas salah ketik. Untuk RS Tipe C & D: tampilan sederhana, input minim, mendukung import massal awal, dan dapat dioperasikan SDM IT terbatas.

## 2. Background

**Masalah saat ini (As-Is):**
- Data Supplier tercatat terpisah-pisah (Excel per unit: farmasi, gudang RT, gizi) → duplikasi & tidak konsisten (nama/rekening beda antar unit). [ASUMSI]
- Kode/penanda Supplier dibuat manual per unit (atau tidak ada) → format beragam, tabrakan kode, sulit rekap belanja per Supplier. [ASUMSI]
- Saat pemesanan (lihat BPMN g-backoffice-inventory-pemesanan, aktivitas "Pilih Supplier"), pilihan Supplier diketik manual → salah ketik, salah transfer rekening. [ASUMSI]
- Tidak ada riwayat/penilaian Supplier sehingga sulit evaluasi keterlambatan & kualitas barang. [ASUMSI]

**Kenapa modul ini perlu:**
- Pengadaan, penerimaan, stok, retur semua merujuk Supplier. Tanpa master terpusat, keakuratan transaksi tidak terjaga.
- Kebutuhan single source of truth ditegaskan draft user: satu data Supplier dipakai lintas modul.
- **Kode unik otomatis** menghapus risiko tabrakan/format beda antar petugas, memudahkan referensi di transaksi & laporan.
- Mendukung keuangan (rekening bank untuk pembayaran) & perpajakan (NPWP/PKP Supplier).

## 3. In Scope

### Scope Definition (dikerjakan)
1. CRUD master Supplier: tambah, lihat (dashboard/list), detail, edit, non-aktifkan (soft delete).
2. Dashboard/list Supplier dengan pencarian, filter (kategori barang, status aktif), sorting, pagination.
3. Form Supplier: identitas legal (NPWP/PKP), kontak, alamat, rekening bank, kategori barang yang dipasok.
4. **Auto-generate kode Supplier** unik saat simpan pertama (format baku, sequence aman race-condition) — section 14.
5. Validasi keunikan (kode Supplier, NPWP) & validasi format (email, telp, NPWP).
6. Import massal (CSV/XLSX) untuk migrasi data awal + template & validasi baris (kode tetap auto-generate, bukan dari file).
7. Lookup/API internal: Supplier aktif dikonsumsi modul Pemesanan, Penerimaan, Retur.
8. Audit trail dasar (siapa & kapan buat/ubah/non-aktif).

### Out Scope (TIDAK dikerjakan)
- Proses pengadaan/pemesanan itu sendiri (milik modul Backoffice Inventory — Pemesanan).
- Penerimaan barang, pencatatan stok, retur (modul Inventory; modul ini hanya menyediakan data Supplier).
- Pembayaran/jurnal ke Supplier (milik Keuangan).
- **Input kode Supplier manual** — kode hanya dibuat sistem (tidak bisa diketik/diedit user).
- **Instansi Rekanan** (A8) — entitas penjamin/kerja sama layanan, modul terpisah.
- **Pabrikan** (A54) — produsen barang, master terpisah; Supplier ≠ Pabrikan.
- Integrasi e-Katalog/LKPP. [PERLU KONFIRMASI]
- Scoring/evaluasi otomatis Supplier (kandidat fase berikut).

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Satu sumber data Supplier | Jumlah master Supplier ganda (duplikat NPWP/nama) | 0 duplikat |
| Kode Supplier konsisten & unik | Insiden kode tabrakan / format beda | 0 (dijamin auto-generate) |
| Pengadaan pakai data terpusat | % pesanan pakai Supplier dari master (bukan ketik manual) | 100% |
| Akurasi pembayaran | Insiden salah rekening transfer Supplier | turun ke 0 [ASUMSI baseline] |
| Kemudahan input | Waktu tambah 1 Supplier | < 2 menit |
| Migrasi awal cepat | Supplier ter-import via template | ≥ 95% baris valid sekali import |
| Kualitas data | % Supplier aktif dgn rekening bank & kontak lengkap | ≥ 90% |

## 5. Related Feature

Fitur terkait (cluster Control Panel & konsumen data):

| Code | Menu | Relasi |
|------|------|--------|
| A7 | Master Data > Supplier | **Modul ini** |
| A4 | Master Data > Barang Farmasi | Konsumen — Supplier pemasok obat |
| A5 | Master Data > Barang Rumah Tangga | Konsumen — pemasok RT |
| A6 | Master Data > Barang Gizi | Konsumen — pemasok bahan gizi |
| A33 | Master Data > Kategori Barang | Lookup — kategori barang yg dipasok |
| A54 | Master Data > Pabrikan | Pembeda — produsen, bukan Supplier |
| A8 | Master Data > Instansi Rekanan | Pembeda — penjamin layanan |
| A38 | Master Data > Bank | Lookup — bank rekening Supplier |
| A52 | Admin > Konfigurasi Perpajakan | Konsumen — NPWP/PKP Supplier |

Konsumen lintas-cluster (Backoffice Inventory): Pemesanan barang ("Pilih Supplier"), Penerimaan Barang, Retur Barang.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — tanpa BPMN khusus]
1. Tiap unit (Farmasi/Gudang RT/Gizi) simpan daftar Supplier di Excel masing-masing.
2. Saat pesan barang, petugas ketik nama Supplier manual / salin dari Excel.
3. Kode/penanda Supplier dibuat manual → format beda antar unit, rawan tabrakan.
4. Rekening & NPWP dicari ulang tiap pembayaran → rawan salah.
5. Tidak ada kontrol duplikat & status aktif.

### B. To-Be (diharapkan)
Diturunkan dari pola CRUD master + pola "Pilih Supplier" pada BPMN g-backoffice-inventory-pemesanan dan pola simpan/update master pada g-backoffice-inventory-distribusi.

1. Admin/Petugas Logistik buka Control Panel > Master Data > Supplier.
2. Sistem tampilkan dashboard/list Supplier (cari/filter).
3. Tambah Supplier → isi form (**field kode tidak ditampilkan untuk diisi**) → sistem validasi (NPWP format & unik, email/telp).
4. Sistem cek duplikat (matching NPWP / nama) sebelum simpan. [pola "Duplicate Detection" analogi g-admisi-onsite-registration]
5. Saat simpan, **sistem auto-generate kode Supplier** unik (section 14) → tampilkan ke user.
6. Edit/non-aktifkan Supplier → audit trail tercatat (**kode tidak berubah**).
7. Import massal awal via template CSV/XLSX → validasi per baris → setiap baris valid dapat kode auto-generate → ringkasan sukses/gagal.
8. Modul Pemesanan/Penerimaan/Retur lookup Supplier **aktif** saja (tampilkan kode + nama).

## 7. Main Flow / Mindmap

### Skenario 1 — Tambah Supplier (utama)
1. Aktor buka menu Supplier → sistem tampilkan list (BPMN analogi: "Sistem menampilkan list ... pada dashboard").
2. Klik **Tambah Supplier** (analogi "Klik tombol tambah").
3. Isi form: identitas, NPWP/PKP, kontak, alamat, rekening bank, kategori barang. **Kode Supplier tidak diisi user** (auto saat simpan).
4. Klik Simpan → **Gateway: data valid?**
   - Tidak → tampilkan pesan error per field, tetap di form.
   - Ya → **Gateway: duplikat (NPWP/nama)?**
     - Ada kandidat → konfirmasi: lanjut buat baru / pakai existing.
     - Tidak → **sistem auto-generate kode Supplier** (section 14, ambil sequence berikutnya secara atomik) → simpan → tampilkan kode ke user → update list (analogi "Sistem menyimpan dan update data terbaru").
5. Event akhir: "Supplier berhasil disimpan dengan kode <kode_supplier>".

### Skenario 2 — Edit / Non-aktifkan
1. Pilih Supplier dari list → lihat detail (analogi "Lihat detail salah satu ...").
2. Edit field → Simpan (validasi sama) → audit trail. **Kode Supplier read-only, tidak berubah.**
3. Non-aktifkan: set status_aktif=false (soft delete). **BR:** Supplier non-aktif tidak muncul di lookup pesanan baru, tapi tetap tampil di transaksi lama. **Kode tidak di-reuse meski non-aktif.**

### Skenario 3 — Import Massal
1. Unduh template (tanpa kolom kode) → isi → unggah.
2. Sistem validasi tiap baris → tampilkan ringkasan (baris sukses / gagal + alasan).
3. Commit baris valid → tiap baris dapat kode auto-generate berurutan.

### Skenario 4 — Lookup oleh modul lain
1. Modul Pemesanan panggil daftar Supplier aktif (opsional filter kategori barang) → tampil "kode — nama" di "Pilih Supplier".

## 8. Business Rules

- **BR-001**: Kode Supplier **wajib auto-generate** oleh sistem (bukan input manual), unik, dan **immutable** (tidak berubah setelah dibuat, tidak bisa diedit). Format baku lihat section 14. (traceability: simpan, Skenario 1; FR-011)
- **BR-001a**: Sequence/nomor urut bersifat **monotonic & tidak di-reuse** — kode dari Supplier yang dihapus/non-aktif tidak dipakai ulang. Pengambilan nomor harus atomik (anti race-condition saat input/import bersamaan).
- **BR-002**: NPWP, jika diisi, harus unik & format 15/16 digit. [PERLU KONFIRMASI panjang NPWP sesuai aturan terbaru DJP].
- **BR-003**: Jika status PKP = Ya → NPWP wajib diisi.
- **BR-004**: Sebelum simpan, sistem deteksi duplikat berdasarkan NPWP atau (nama_supplier mirip) → wajib konfirmasi (analogi Duplicate Detection g-admisi-onsite-registration).
- **BR-005**: Supplier tidak dihapus permanen jika sudah dipakai transaksi (pesanan/penerimaan/retur) → hanya soft delete (status_aktif=false).
- **BR-006**: Hanya Supplier `status_aktif=true` muncul di lookup pemesanan baru (traceability: Skenario 4).
- **BR-007**: Minimal 1 kategori barang dipasok wajib dipilih (farmasi/RT/gizi) agar lookup terfilter benar.
- **BR-008**: Email format valid; No. telp 10–15 digit angka.
- **BR-009**: Rekening bank: jika diisi, butuh bank (lookup A38) + no_rekening + atas_nama.
- **BR-010**: Akses CRUD dibatasi role (RBAC A53). [ASUMSI: role Admin / Logistik / Farmasi].

## 9. User Stories

- **US-001**: Sebagai Admin Control Panel, saya ingin menambah data Supplier baru, agar Supplier dapat dipilih saat pengadaan. (source: BPMN "Klik tombol tambah" / "Pilih Supplier")
- **US-002**: Sebagai Petugas Logistik, saya ingin mencari & memfilter Supplier di dashboard, agar cepat menemukan Supplier yang tepat. (source: "Sistem menampilkan list ... pada dashboard")
- **US-003**: Sebagai Admin, saya ingin sistem mendeteksi duplikat NPWP/nama saat simpan, agar tidak ada Supplier ganda. (source analogi: Duplicate Detection)
- **US-004**: Sebagai Petugas Logistik, saya ingin mengubah & menon-aktifkan Supplier, agar data selalu mutakhir tanpa menghapus riwayat. (source: "Edit ...", "Sistem menyimpan dan update data terbaru")
- **US-005**: Sebagai Admin IT, saya ingin import massal Supplier via template, agar migrasi data awal cepat.
- **US-006**: Sebagai Petugas Farmasi/Gudang, saya ingin memilih Supplier aktif saat membuat pesanan, agar data pesanan akurat. (source: "Pilih Supplier" g-backoffice-inventory-pemesanan)
- **US-007**: Sebagai Bagian Keuangan, saya ingin melihat rekening bank & NPWP Supplier, agar pembayaran tepat. (source analogi: aktor Keuangan g-backoffice-inventory-pemesanan)
- **US-008**: Sebagai Admin, saya ingin kode Supplier dibuat otomatis oleh sistem dengan format seragam, agar tidak ada kode tabrakan/salah ketik dan mudah dirujuk di transaksi. (source: instruksi user; BR-001)

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-001 | Sistem menyediakan form tambah Supplier dengan field di section 11 (tanpa input kode) | US-001 |
| FR-002 | Sistem validasi field saat simpan (unik, format, wajib) per BR-002..009 | US-001, US-003 |
| FR-003 | Sistem deteksi duplikat (NPWP/nama) & minta konfirmasi sebelum simpan | US-003, BR-004 |
| FR-004 | Sistem tampilkan dashboard/list Supplier: cari (termasuk by kode), filter (kategori, status), sort, pagination | US-002 |
| FR-005 | Sistem tampilkan halaman detail Supplier (read-only) termasuk kode | US-002 |
| FR-006 | Sistem dukung edit Supplier + simpan audit trail (user, waktu); kode read-only | US-004 |
| FR-007 | Sistem dukung non-aktifkan (soft delete); blok hard delete bila terpakai transaksi | US-004, BR-005 |
| FR-008 | Sistem sediakan template import (tanpa kolom kode) + unggah CSV/XLSX + validasi per baris + auto-generate kode tiap baris valid + ringkasan | US-005 |
| FR-009 | Sistem expose lookup/endpoint internal daftar Supplier aktif (kode + nama, filter kategori opsional) | US-006, BR-006 |
| FR-010 | Sistem batasi akses CRUD per role (RBAC A53) | BR-010 |
| FR-011 | Sistem **auto-generate kode Supplier** saat simpan pertama: format `SUP-NNNNN` (section 14), nomor urut atomik & tidak di-reuse, kode immutable. Tampilkan kode ke user setelah simpan. | US-008, BR-001, BR-001a |

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Layar INPUT — Form Tambah/Edit Supplier (FR-001, FR-002)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_supplier | Kode Supplier | text (read-only) | — | format `SUP-NNNNN` (section 14), unik, immutable | **auto-generate sistem** | tidak diisi/diedit user; pada Tambah tampil "(otomatis)", pada Edit tampil nilai read-only (BR-001) |
| nama_supplier | Nama Supplier | text | Ya | maks 100 char | manual | konsisten gaya field `nama` (maks 100) {dari A1,A2} |
| jenis_supplier | Jenis Supplier | dropdown | Ya | Badan Usaha / Perorangan | enum | [ASUMSI] |
| kategori_barang | Kategori Barang Dipasok | lookup (multi) | Ya | dari master Kategori Barang (A33) | lookup A33 | min 1 (BR-007) |
| npwp | NPWP | text | Tidak | unik, 15/16 digit [PERLU KONFIRMASI] | manual | wajib jika PKP=Ya (BR-003) |
| status_pkp | PKP | boolean | Ya | Ya/Tidak | default Tidak | BR-003 |
| no_izin_usaha | No. Izin Usaha/SIUP | text | Tidak | maks 50 char | manual | [ASUMSI] |
| alamat | Alamat | text | Ya | maks 255 char | manual | reuse format `alamat` {dari A2} |
| wilayah_id | Wilayah (Prov/Kab/Kec/Kel) | lookup | Tidak | dari master Wilayah (A32) | lookup A32 | [ASUMSI] |
| nama_kontak | Nama PIC/Kontak | text | Tidak | maks 100 char | manual | |
| no_telp | No. Telepon | text | Ya | 10–15 digit angka | manual | selaras `no_hp` 10–15 {dari A1,A2} |
| email | Email | text | Tidak | format email | manual | reuse format `email` {dari A1,A2} |
| bank_id | Bank | lookup | Tidak | dari master Bank (A38) | lookup A38 | wajib jika rekening diisi (BR-009) |
| no_rekening | No. Rekening | text | Tidak | angka, maks 30 char | manual | BR-009 |
| atas_nama_rekening | Atas Nama Rekening | text | Tidak | maks 100 char | manual | BR-009 |
| termin_pembayaran | Termin Pembayaran (hari) | number | Tidak | >= 0 | manual | [ASUMSI] |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | reuse `status_aktif` {dari A1,A2} |

### 11.2 Layar INPUT — Konfirmasi Duplikat (FR-003)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| pilihan_duplikat | Aksi | dropdown | Ya | Pakai existing / Buat baru | enum | muncul bila ada kandidat (BR-004) |

### 11.3 Layar INPUT — Import Massal (FR-008)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Supplier | file | Ya | .csv/.xlsx, maks 5MB | unggah | kolom = field 11.1 **tanpa kode_supplier** (kode auto saat commit) |

### 11.4 Layar TAMPIL — Dashboard / List Supplier (FR-004)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Supplier Aktif | count supplier where status_aktif | angka besar | – | kartu ringkasan |
| Kode | supplier.kode_supplier | text (`SUP-NNNNN`) | sort, cari | |
| Nama Supplier | supplier.nama_supplier | text | sort A-Z, cari | |
| Kategori Barang | supplier.kategori_barang | badge multi | filter | |
| NPWP / PKP | supplier.npwp, status_pkp | text + badge | filter PKP | |
| No. Telp | supplier.no_telp | text | – | |
| Status | supplier.status_aktif | badge (Aktif/Nonaktif) | filter | warna abu jika nonaktif |
| Aksi | – | tombol Detail/Edit/Nonaktif | – | sesuai RBAC |

### 11.5 Layar TAMPIL — Detail Supplier (FR-005)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| kode_supplier | supplier.kode_supplier | read-only, ditonjolkan di header | – | identitas utama Supplier |
| Semua field 11.1 lain | supplier.* | read-only grouped | – | grup: Identitas / Kontak / Bank / Pajak |
| Dibuat oleh & waktu | audit.created_by, created_at | text + datetime | – | audit trail FR-006 |
| Diubah oleh & waktu | audit.updated_by, updated_at | text + datetime | – | |

## 12. Non-Functional Requirements

- **NFR-001** Performa: list Supplier (≤ 2000 record) tampil < 2 detik; lookup pemesanan < 1 detik.
- **NFR-002** Usability: form 1 halaman, label Bahasa Indonesia, cocok SDM IT terbatas RS Tipe C&D.
- **NFR-003** Keamanan: CRUD dibatasi RBAC (A53); data Supplier (rekening/NPWP) hanya untuk role berwenang.
- **NFR-004** Audit: setiap create/update/non-aktif tercatat (user, timestamp, aksi).
- **NFR-005** Ketersediaan: master dapat diakses lokal; bila ada sinkronisasi pusat, dukung mode offline-cache. [ASUMSI internet tak stabil].
- **NFR-006** Integritas: constraint unik DB pada kode_supplier & NPWP; soft delete jaga referential integrity transaksi.
- **NFR-006a** Konkurensi kode: pengambilan nomor urut kode Supplier harus atomik (mis. sequence DB / row-lock counter) agar tidak ada kode duplikat saat input/import paralel. Nomor monotonic & tidak di-reuse (BR-001a).
- **NFR-007** Skalabilitas import: file ≤ 5MB / ~5000 baris diproses < 30 detik.

## 13. Integrasi Eksternal

**Integrasi eksternal:** Modul ini umumnya **tidak** butuh integrasi pihak luar — Supplier = data internal RS. [ASUMSI]

| Integrasi | Status | Catatan |
|-----------|--------|---------|
| e-Katalog / LKPP | Out scope | sinkronisasi Supplier dari e-katalog [PERLU KONFIRMASI apakah dibutuhkan] |
| SATUSEHAT | Tidak relevan | Supplier bukan entitas terminologi SATUSEHAT |
| BPJS / Disdukcapil | Tidak relevan | tidak ada NIK/SEP di modul ini |

**Integrasi internal (antar-modul SIMRS):**
- Master **Kategori Barang** (A33), **Bank** (A38), **Wilayah** (A32) → lookup di form.
- Modul **Inventory — Pemesanan** (g-backoffice-inventory-pemesanan) → konsumsi lookup Supplier aktif (kode + nama, FR-009).
- Modul **Penerimaan / Retur Barang** → referensi Supplier pada transaksi via kode_supplier.
- Modul **Keuangan / Perpajakan** (A52) → pakai rekening bank & NPWP/PKP Supplier.

## 14. Spesifikasi Auto-Generate Kode Supplier

Memenuhi instruksi user: kode Supplier dibuat otomatis. Berikut **format yang disarankan** (rekomendasi System Analyst) — silakan dikonfirmasi.

### 14.1 Format yang disarankan (rekomendasi utama)

**`SUP-NNNNN`** — prefix `SUP-` + nomor urut global 5 digit, zero-padded.

- Contoh: `SUP-00001`, `SUP-00002`, … `SUP-09999`, `SUP-10000`.
- **Prefix `SUP-`**: penanda jelas "Supplier", beda dari master lain (mis. Pabrikan, Barang).
- **Sequence global 5 digit**: kapasitas 99.999 Supplier — jauh di atas kebutuhan RS Tipe C&D. Jika tembus, lebar digit auto-melebar (`SUP-100000`).
- **Tanpa tahun/kategori** di kode → kode **stabil seumur hidup** Supplier (tidak ada makna yang bisa basi, tidak perlu re-generate saat ganti kategori).
- Pencarian & sorting mudah (alfanumerik berurutan).

### 14.2 Aturan generate
- Dibuat **sekali** saat record disimpan pertama (Skenario 1 step 4 / import commit).
- **Immutable**: tidak berubah saat edit, tidak bisa diedit user (BR-001).
- Nomor diambil **atomik** dari counter/sequence (NFR-006a) → aman input paralel & import massal.
- **Tidak di-reuse**: kode Supplier non-aktif/terhapus tidak dipakai lagi (BR-001a).
- Disimpan unik di DB (NFR-006); ditampilkan ke user setelah simpan & di header detail.

### 14.3 Alternatif (jika RS minta makna lebih) [PERLU KONFIRMASI]
| Opsi | Format | Contoh | Trade-off |
|------|--------|--------|-----------|
| A (disarankan) | `SUP-NNNNN` | `SUP-00007` | Paling sederhana, stabil, cukup utk C&D |
| B | `SUP-YY-NNNN` | `SUP-26-0007` | Ada info tahun daftar; sequence reset/ber-segmen per tahun |
| C | `SUP-<KAT>-NNNN` | `SUP-FAR-0007` | Ada kategori, tapi Supplier bisa multi-kategori → kode jadi ambigu; **tidak disarankan** |

> Rekomendasi: **Opsi A (`SUP-NNNNN`)** untuk kesederhanaan & kestabilan. Naik ke Opsi B hanya bila manajemen butuh info tahun pendaftaran pada kode.

## Asumsi
- [ASUMSI] Kode Supplier auto-generate format `SUP-NNNNN` (sequence global 5 digit, zero-padded) — rekomendasi default, menunggu konfirmasi user (section 14).
- [ASUMSI] Tidak ada BPMN khusus Supplier; alur diturunkan dari pola CRUD master g-backoffice-inventory-pemesanan & g-backoffice-inventory-distribusi, serta pola duplicate-detection g-admisi-onsite-registration.
- [ASUMSI] As-Is: data Supplier tersebar di Excel per unit tanpa kontrol duplikat.
- [ASUMSI] Supplier hanya data internal RS → tanpa integrasi eksternal di MVP.
- [ASUMSI] Satu Supplier punya satu rekening bank utama.
- [ASUMSI] Role pengelola: Admin Control Panel / Petugas Logistik / Farmasi.
- [ASUMSI] Field jenis_supplier, no_izin_usaha, termin_pembayaran, wilayah_id bersifat tambahan; bisa dipangkas sesuai kebutuhan RS Tipe C&D.

## Pertanyaan Terbuka
- Format kode Supplier disetujui pakai `SUP-NNNNN` (Opsi A) atau pilih Opsi B `SUP-YY-NNNN`? (section 14) [PERLU KONFIRMASI]
- Lebar digit sequence cukup 5 (maks 99.999 Supplier)? (section 14.1)
- Panjang & format NPWP yang dipakai (15 vs 16 digit sesuai aturan DJP terbaru)? (BR-002)
- Apakah perlu sinkronisasi/import Supplier dari e-Katalog LKPP?
- Role mana saja boleh CRUD Supplier & boleh melihat data rekening bank? (BR-010)
- Apakah satu Supplier bisa punya >1 rekening bank? (saat ini diasumsikan 1)
- Apakah butuh field evaluasi/rating Supplier di MVP atau fase berikut?