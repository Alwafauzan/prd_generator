# A19 — Master Data Instalasi

**Related Document:** A3, A42, A15/A16/A17, A1, A2, A48, A18/A53; List Fitur V2.xlsx (A19)
**Versi:** 3.2
**Tanggal:** 2026-07-06

## Metadata Dokumen

* **Approval**: [Nama Kepala Bidang IT / Manajer Operasional, Jabatan, Tanggal]
* **Related Documents**:
  * A3 — Master Data Unit (konsumen utama, lokasi pemindahan Unit, **& pemilik atribut `tipe_instalasi`** — klasifikasi peruntukan kini diinput di level Unit)
  * A42 — Master Data Gudang dan Farmasi (mengonsumsi Unit ber-`tipe_instalasi = Farmasi/Gudang` — via A3)
  * A15 / A16 / A17 — Master Data Bangsal / Kamar / Bed (klasifikasi rawat inap kini di Unit ber-`tipe_instalasi = Bangsal (Rawat Inap)` — via A3)
  * A1 — Master Data User, A2 — Master Data Staff (akses per Unit/Instalasi)
  * A48 — Konfigurasi RS (identitas RS untuk konteks pelaporan)
  * A18 / A53 — Role / Admin RBAC (otorisasi akses)
  * PRD_Master_Data_Instalasi.docx (lampiran sumber)
  * List Fitur V2.xlsx (sheet MVP) — A19
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-25 | 1.7 | Tipe Instalasi disederhanakan menjadi enum **Pelayanan / Non Pelayanan**; bila **Non Pelayanan**, penanda Rawat Inap & Farmasi otomatis Tidak & disabled *(digantikan versi 3.0)* |
| 2026-06-29 | 1.1* | Konfirmasi: (1) **Impor massal instalasi via file** masuk **Phase 2**; (2) **Kode instalasi immutable** — tidak dapat diubah setelah dibuat (konsistensi pelaporan eksternal) |
| 2026-06-29 | 2.0 | Restrukturisasi PRD ke **format standar `template (1).md`** — 9 seksi. Status tidak lagi diinput di form Tambah (auto `AKTIF`, dikelola via toggle Dashboard) |
| 2026-07-06 | 3.0 | Penanda boolean `is_rawat_inap`/`is_farmasi` **dihapus**; `tipe_instalasi` menjadi **enum tunggal 6 nilai** sebagai satu-satunya klasifikasi peruntukan *(digantikan versi 3.2)* |
| 2026-07-06 | 3.1 | Menambah Data Awal (Seeder) 17 instalasi default *(dibatalkan versi 3.2)* |
| 2026-07-06 | 3.2 | **(1) Data Awal (Seeder) DIHAPUS** — sistem tidak lagi menyediakan instalasi bawaan; seluruh data instalasi diinput/di-setup Admin (§8.3.3, BR-021 dihapus). **(2) Field `tipe_instalasi` DIPINDAH ke Master Data Unit (A3)** — klasifikasi peruntukan (Non Pelayanan/Bangsal (Rawat Inap)/Poli (Rawat Jalan)/Farmasi/Gudang/Penunjang) kini **atribut Unit**, bukan Instalasi. Dari A19 dihapus: kolom DB `tipe_instalasi`, param & filter API, kolom & filter List View, field form Tambah/Ubah, warning ketergantungan, blokir perubahan tipe, seluruh AC/BR terkait (BR-010/011/015/016/017/018/020). **A19 menjadi master pengelompokan murni** (Nama, Kode, Keterangan, Status, Jumlah Unit). Dependensi berbasis tipe (Bangsal→A15/16/17, Farmasi/Gudang→A42) ditegakkan di **A3 (Unit)**. |

> **Catatan substansi (v3.2):** **Instalasi = pengelompokan tingkat atas yang membawahi Unit (A3).** Klasifikasi peruntukan (**`tipe_instalasi`**) **tidak lagi menjadi atribut Instalasi** — dipindah ke **Master Data Unit (A3)** dan diinput per Unit. Konsekuensinya, A19 tidak lagi menyimpan tipe, tidak menampilkan warning/blokir berbasis tipe, dan tidak menyediakan data awal (seeder). Ketergantungan modul turunan (Bangsal/Kamar/Bed A15/A16/A17; Gudang & Farmasi A42) kini mengacu pada **`tipe_instalasi` di Unit (A3)**.

## Overview & Background

### Overview / Brief Summary

Modul **Master Data Instalasi** (code **A19**, cluster **Control Panel**) digunakan untuk mencatat dan mengelola seluruh **instalasi** di rumah sakit. Instalasi adalah **pengelompokan tingkat atas** yang membawahi sejumlah **Unit** (master A3) — misalnya Instalasi Rawat Jalan (membawahi Poli/Unit), Instalasi Rawat Inap, Instalasi Gawat Darurat, Instalasi Farmasi, serta instalasi penunjang seperti Laboratorium dan Radiologi.

Data ini menjadi **single source of truth** untuk daftar instalasi yang dipakai **Master Data Unit (A3)** sebagai **induk pengelompokan Unit**, serta modul lain (Rekam Medis, Keuangan, pelaporan) yang memerlukan instalasi sebagai pengelompokan unit. **Klasifikasi peruntukan (`tipe_instalasi`) kini bukan atribut Instalasi** — dipindah ke **Master Data Unit (A3)** dan diinput per Unit (lihat A3). Dengan demikian A19 berfokus pada **identitas & pengelompokan** instalasi.

**Aturan penting modul ini:**
- Instalasi memiliki atribut inti: **Nama** (unik), **Kode** (unik & immutable), **Keterangan** (opsional), dan **Status** (Aktif/Nonaktif). **Tidak ada** field klasifikasi peruntukan di A19 — atribut tersebut ada di Unit (A3).
- **Relasi 1 Instalasi : N Unit** — Unit (A3) merujuk ke satu Instalasi induk. **Jumlah Unit** dihitung otomatis dari Unit yang tertaut.
- **Kode instalasi bersifat immutable** — tidak dapat diubah setelah dibuat, demi konsistensi pelaporan eksternal (BPJS/SIMRS).
- Ketergantungan modul turunan **tidak lagi ditegakkan di A19**: klasifikasi Bangsal/Kamar/Bed (A15/A16/A17) dan acuan Gudang & Farmasi (A42) mengikuti **`tipe_instalasi` pada Unit (A3)**.

Lingkup teknis modul ini adalah **CRUD master data sederhana** (tambah, lihat, ubah, aktif/nonaktif) plus **ekspor/impor file .csv** (Phase 2) — bukan transaksi operasional. Penonaktifan bersifat **terkontrol**: diblokir bila masih ada Unit **aktif** tertaut; A19 mengarahkan Admin memindahkan Unit melalui **Master Data Unit (A3)** via deep-link ber-konteks. Unit **Nonaktif dibiarkan tertaut** sebagai histori dan tidak memblokir.

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):** *(diturunkan dari lampiran — [ASUMSI])*
- Daftar instalasi dicatat manual (spreadsheet/dokumen) atau tertanam tetap (hardcoded) di sistem lama.
- Penamaan & kode instalasi tidak seragam antar modul; pemetaan Unit ke instalasi manual dan rawan salah.
- Saat instalasi dihapus/dinonaktifkan, Unit tertaut bisa menggantung (orphan) tanpa kontrol.
- Perubahan struktur instalasi memerlukan bantuan tim teknis.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin RS mengelola seluruh instalasi via form CRUD terpusat (tambah, ubah, aktif/nonaktif) **tanpa tim teknis**.
- Sistem memvalidasi otomatis (field wajib, format, keunikan Nama/Kode), menyimpan ke DB master, dan **mem-publish referensi real-time** ke modul lain (terutama A3) tanpa restart.
- **Penonaktifan terkontrol**: diblokir bila masih ada Unit **aktif** tertaut → A19 mengarahkan pemindahan Unit ke **A3** (deep-link ber-konteks) lalu **menghitung ulang Jumlah Unit**.
- Setiap aksi create/update/status-change **dicatat di audit trail**.
- **Phase 2**: **Ekspor** seluruh data ke **file .csv** dan **Impor massal** via file (template, validasi per baris, laporan error).

## Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi data antar modul | 100% modul & Unit menggunakan referensi instalasi yang sama |
| 2 | Kemandirian user non-teknis | 100% Admin RS mampu setup tanpa bantuan tim teknis |
| 3 | Kecepatan baca perubahan | 100% perubahan data terbaca real-time tanpa restart sistem |
| 4 | Kecepatan pencarian/filter | Hasil pencarian data instalasi tampil < 3 detik |
| 5 | Integritas relasi saat nonaktif | 0 Unit aktif menjadi orphan; 100% penonaktifan dengan Unit aktif tertaut diblokir hingga Unit dipindahkan via A3 |
| 6 | Keunikan & integritas identitas | 100% instalasi memiliki Nama & Kode unik; 0 Kode berubah setelah dibuat (immutable) |
| 7 | Kelengkapan ekspor [Phase 2] | 100% field instalasi ikut terekspor pada file .csv (tidak ada kolom hilang) |

## Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) |
|---------------|---------------------|---------------------|
| Dashboard Instalasi | List, search (Nama/Kode), filter (Status), sort semua kolom, pagination 10/halaman | — |
| Tambah Instalasi | Form: Nama, Kode, Keterangan; status auto `AKTIF` | — |
| Detail / Ubah Instalasi | Pre-filled, edit field (Kode **immutable**), validasi sama dengan tambah | — |
| Aktif / Nonaktifkan Instalasi | Soft status (toggle Dashboard/Detail); blokir bila masih ada Unit **aktif** tertaut; Unit nonaktif dibiarkan (histori) | — |
| Pemindahan Unit | A19 **memblokir & mengarahkan** ke A3 via deep-link ber-konteks; hitung ulang Jumlah Unit | — |
| Ekspor Data Instalasi | — | Ekspor **file .csv** seluruh field |
| Impor Massal Instalasi | — | **Impor via file** (`file_import`/`mode_import`) dengan template, validasi per baris, & laporan error |

**Out of Scope**:
* CRUD Unit (ditangani **Master Data Unit — A3**).
* **Klasifikasi peruntukan Unit (`tipe_instalasi`)** — kini **atribut Unit di A3**, bukan A19.
* **Eksekusi pemindahan Unit antar instalasi** — dilakukan di **A3**, bukan A19; A19 hanya memblokir, mengarahkan, lalu menghitung ulang Jumlah Unit.
* Pengelolaan staf, jadwal, dan layanan di dalam instalasi.
* Operasional stok/obat & farmasi (ditangani **A42**); pengelolaan Bangsal/Kamar/Bed (A15/A16/A17) — mengacu Unit ber-tipe terkait (via A3).
* **Data awal (seeder) instalasi** — tidak disediakan; seluruh data diinput Admin.
* **Hard delete** instalasi — diganti soft nonaktif demi histori.

## Related Features

| Code | Module | Relasi Teknis / Bisnis |
|------|--------|------------------------|
| **A3** | Master Data Unit | **Konsumen utama, lokasi pemindahan, & pemilik `tipe_instalasi`** — Unit dipetakan ke Instalasi induk (1 Instalasi : N Unit) dan **membawa atribut klasifikasi peruntukan (`tipe_instalasi`)**. Saat instalasi dinonaktifkan & masih ada Unit aktif, **pemindahan Unit dilakukan di A3** (BR-006/BR-009). |
| A1 | Master Data User | User dapat dibatasi akses per Unit/Instalasi (`unit_id` multi-lookup A3/A19). |
| A2 | Master Data Staff | Penempatan staf mengacu Unit → Instalasi. |
| A15/A16/A17 | Bangsal / Kamar / Bed | Bernaung di bawah **Unit ber-`tipe_instalasi = Bangsal (Rawat Inap)`** (klasifikasi di A3). A19 hanya menyediakan Instalasi sebagai pengelompokan; **tidak** lagi menegakkan dependensi tipe. |
| **A42** | Gudang dan Farmasi | Mengonsumsi **Unit ber-`tipe_instalasi = Farmasi/Gudang`** (via A3) sebagai acuan farmasi/gudang. |
| A48 | Konfigurasi RS | Sumber identitas RS (Kode RS) untuk konteks pelaporan. |
| A18 / A53 | Role / Admin RBAC | Menentukan hak akses; pemindahan Unit & penonaktifan cukup role **Admin** (BR-011). |

> Field kanonik bersama: `status_aktif`, `keterangan`, `unit_id` (lookup A3/A19) — definisi sama lintas modul. Penamaan deskriptif diseragamkan menjadi **`keterangan`** (bukan 'deskripsi') — BR-010. Atribut **`tipe_instalasi`** kini didefinisikan di **A3** (Master Data Unit).

## Business Process & User Stories

### State Machine — Status Instalasi

| Status | Deskripsi | Efek ke Modul Lain | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------|--------------------|--------------------|
| `AKTIF` | Instalasi aktif & dapat dipakai | Dapat menjadi induk Unit baru (A3) & instalasi tujuan pemindahan; tampil di lookup modul lain | → `NONAKTIF` (hanya bila tidak ada Unit **aktif** tertaut — BR-006) | Sama (CRUD murni, tanpa approval berjenjang) |
| `NONAKTIF` | Instalasi dinonaktifkan (soft) | Tidak dapat dipilih sebagai induk Unit baru / tujuan pemindahan; relasi historis tetap utuh | → `AKTIF` (reaktivasi) | Sama |

> [ASUMSI] Tidak ada hard delete. Penonaktifan adalah soft status untuk menjaga histori. Default status saat tambah = `AKTIF` (di-set sistem; tidak ada input status di form Tambah). Modul ini murni CRUD master data — **tidak ada workflow approval berjenjang** di Phase 2; arsitektur data tetap menyertakan kolom `status_approval`/`role_approver` agar SIAP bila kebijakan berubah.

### User Stories Utama

| ID | User Story | Prioritas | Fase |
|----|-----------|-----------|------|
| US-A19-01 | Sebagai **Admin Master Data**, saya ingin melihat Dashboard data Instalasi, agar data Instalasi terpantau dengan baik. | P0 | Phase 1 |
| US-A19-02 | Sebagai **Admin Master Data**, saya ingin menambahkan data Instalasi, agar data Instalasi selalu mutakhir. | P0 | Phase 1 |
| US-A19-03 | Sebagai **Admin Master Data**, saya ingin melihat & mengubah detail Instalasi, agar data selalu mutakhir. | P0 | Phase 1 |
| US-A19-04 | Sebagai **Admin Master Data**, saya ingin menonaktifkan Instalasi hanya setelah Unit aktifnya dipindahkan, agar tidak ada Unit kehilangan induk. | P0 | Phase 1 |
| US-A19-05 | Sebagai **Admin**, saya ingin memindahkan Unit dari instalasi yang akan dinonaktifkan ke instalasi lain **melalui A3**, agar penonaktifan dapat dilakukan tanpa Unit menggantung. | P0 | Phase 1 |
| US-A19-06 | Sebagai **Admin Master Data**, saya ingin mengekspor data Instalasi ke **file .csv lengkap**, agar dapat dipakai pelaporan/arsip. | P2 | Phase 2 |
| US-A19-07 | Sebagai **Admin Master Data**, saya ingin mengimpor data Instalasi massal via file, agar setup awal/banyak data lebih cepat. | P3 | Phase 2 |

## Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard & Pencarian Instalasi**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat seluruh daftar instalasi dengan pencarian, filter, sort, dan pagination agar data instalasi mudah dipantau.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Menu Master Data → Instalasi menampilkan tabel kolom: Nomor, Nama (link → Detail), Kode, Jumlah Unit, Status, Aksi.
  * **AC 2**: Semua kolom dapat di-sort (Asc/Desc); default sort Nama ascending (A–Z).
  * **AC 3**: Pencarian teks bebas memfilter baris berdasarkan **Nama** dan **Kode**.
  * **AC 4**: Tersedia filter **Status** (Aktif/Nonaktif).
  * **AC 5**: Pagination menampilkan 10 data per halaman.
  * **AC 6**: Kolom **Jumlah Unit** dihitung otomatis dari Unit (A3) yang tertaut & dihitung ulang setelah pemindahan Unit di A3.
  * **AC 7**: Badge warna: Status `AKTIF` = hijau, `NONAKTIF` = abu.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Search | Text | — | — | "Cari nama atau kode instalasi..." |
  | Filter Status | Dropdown | — | — | "Semua Status" (default) |

---

**Fitur: Tambah Instalasi**
* **User Story**: Sebagai Admin Master Data, saya ingin menambah instalasi baru lewat form tervalidasi agar data instalasi terstandar sejak input.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Aksi Tambah Instalasi membuka overlay form dengan field: Nama (wajib), Kode (wajib, unik), Keterangan (opsional). **Tidak ada input Status** — status di-set `AKTIF` oleh sistem. **Tidak ada** field Tipe Instalasi (klasifikasi ada di Unit/A3).
  * **AC 2**: Sistem menolak simpan jika **Nama** sudah digunakan (unik case-insensitive) — pesan: *"Nama instalasi sudah digunakan."*
  * **AC 3**: Sistem menolak simpan jika **Kode** sudah digunakan — pesan: *"Kode instalasi sudah digunakan."*
  * **AC 4**: Setelah berhasil simpan, sistem redirect ke Dashboard, data baru tampil real-time (status Aktif), notifikasi *"Data Berhasil Disimpan"*; tombol [Kembali] menutup overlay tanpa menyimpan.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Instalasi | Text | Required, unik (case-insensitive), maks 100 char | "Nama instalasi wajib diisi" / "Nama instalasi sudah digunakan" / "Nama melebihi 100 karakter ([X]/100)" | "Contoh: Instalasi Rawat Inap" |
  | Kode | Text | Required, unik, alfanumerik, maks 20 char | "Kode wajib diisi" / "Kode instalasi sudah digunakan" | "Dipakai pelaporan BPJS/SIMRS — tidak dapat diubah setelah dibuat" |
  | Keterangan | Textarea | Opsional, maks 255 char | "Keterangan melebihi 255 karakter ([X]/255)" | "Keterangan tambahan (opsional)" |

---

**Fitur: Detail & Ubah Instalasi**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat & mengubah detail instalasi agar perubahan atribut selalu mutakhir dan tersinkron ke modul terkait.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Detail] (atau klik Nama) membuka overlay pre-filled berisi seluruh atribut; field dapat diubah **kecuali Kode** (immutable) dan field audit.
  * **AC 2**: Perubahan tunduk validasi sama dengan Tambah (Nama unik).
  * **AC 3**: Perubahan valid tersimpan & tersinkron otomatis (real-time) ke modul terkait (terutama A3).
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Instalasi | Text | Required, unik, maks 100 char | "Nama instalasi wajib diisi" / "Nama instalasi sudah digunakan" | — |
  | Kode | Text (read-only) | **Immutable** — tidak dapat diubah | — | "Kode tidak dapat diubah setelah dibuat" |
  | Keterangan | Textarea | Opsional, maks 255 char | "Keterangan melebihi 255 karakter" | — |

---

**Fitur: Aktif / Nonaktifkan Instalasi (Blokir & Arahan Pindah Unit ke A3)**
* **User Story**: Sebagai Admin Master Data, saya ingin menonaktifkan instalasi hanya setelah Unit aktifnya dipindahkan, agar tidak ada Unit yang kehilangan induk.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Penonaktifan dilakukan via toggle Status di Dashboard/Detail (soft status, tanpa hard delete).
  * **AC 2**: Bila masih ada Unit **aktif** tertaut → penonaktifan **diblokir**; sistem menampilkan pesan + jumlah & daftar Unit aktif + **deep-link ke layar Master Data Unit (A3) dengan konteks instalasi asal** (parameter/filter `instalasi_asal`).
  * **AC 3**: Unit berstatus **Nonaktif dibiarkan tertaut** sebagai histori dan **tidak** memblokir penonaktifan.
  * **AC 4**: Pemindahan Unit **dieksekusi di A3** (bukan A19); setelah pemindahan, A19 **menghitung ulang Jumlah Unit** kedua instalasi (real-time).
  * **AC 5**: Setelah tidak ada Unit aktif tertaut, status dapat diubah ke **Nonaktif**; data tetap tersimpan (histori).
  * **AC 6**: Instalasi Nonaktif tidak dapat dipilih sebagai induk Unit baru / tujuan pemindahan di A3, namun relasi historis tetap utuh; instalasi dapat **direaktivasi** ke Aktif.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Status (toggle Nonaktif) | Toggle | Diblokir bila ada Unit aktif tertaut | "Instalasi tidak dapat dinonaktifkan karena masih memiliki [N] Unit aktif. Pindahkan Unit terlebih dahulu melalui Master Data Unit." | "Klik tautan untuk membuka Master Data Unit (A3) ter-filter instalasi ini" |

---

**Fitur: Ekspor Data Instalasi ke CSV** *(Phase 2)*
* **User Story**: Sebagai Admin Master Data, saya ingin mengekspor data Instalasi ke file .csv lengkap, agar dapat dipakai pelaporan/arsip.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Ekspor (.csv)] menghasilkan **file .csv** memuat **SELURUH field** instalasi (Nomor, Nama, Kode, Keterangan, Jumlah Unit, Status, + metadata audit bila tersedia).
  * **AC 2**: Baris pertama = header kolom.
  * **AC 3**: Ekspor menghormati filter/sort aktif di Dashboard.
  * **AC 4**: [PERLU KONFIRMASI] delimiter (koma vs titik-koma) & encoding (UTF-8/BOM) untuk kompatibilitas Excel locale Indonesia.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Tombol Ekspor | Button | — | "Tidak ada data untuk diekspor" (bila kosong) | "Mengekspor seluruh field sesuai filter aktif" |

---

**Fitur: Impor Massal Instalasi** *(Phase 2)*
* **User Story**: Sebagai Admin Master Data, saya ingin mengimpor data Instalasi massal via file, agar setup awal/banyak data lebih cepat.
* **Prioritas**: P3
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Tersedia unduh **template** impor (kolom sesuai field instalasi) dan unggah file (`file_import`/`mode_import`).
  * **AC 2**: Sistem memvalidasi **per baris** (field wajib, Nama/Kode unik) dan menolak baris yang melanggar tanpa menggagalkan baris valid (sesuai `mode_import`).
  * **AC 3**: Sistem menampilkan **laporan hasil impor** (jumlah sukses/gagal + alasan per baris gagal).
  * **AC 4**: Status setiap instalasi hasil impor di-set `AKTIF` oleh sistem.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | File Impor | File | Format sesuai template (.csv/.xlsx), maks ukuran sesuai kebijakan | "Format file tidak sesuai template" / "Baris [n]: [alasan]" | "Unduh template terlebih dahulu" |

## Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `master_instalasi`
* **Key Columns**:

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `id` | UUID | Primary Key | ID internal instalasi |
| `nama` | VARCHAR(100) | NOT NULL, UNIQUE (case-insensitive) | Nama instalasi (BR-001) |
| `kode` | VARCHAR(20) | NOT NULL, UNIQUE, **immutable** | Kode pelaporan BPJS/SIMRS (BR-002) |
| `keterangan` | VARCHAR(255) | NULL | Keterangan (BR-010) |
| `status_aktif` | BOOLEAN | NOT NULL, DEFAULT true | Soft status (Aktif/Nonaktif) |
| `status_approval` | VARCHAR(20) | NULL | **SIAP Phase 2** — belum dipakai Phase 1 |
| `role_approver` | VARCHAR(50) | NULL | **SIAP Phase 2** — belum dipakai Phase 1 |
| `created_by` | UUID/VARCHAR | NOT NULL | Audit trail |
| `created_at` | TIMESTAMP | NOT NULL | Audit trail |
| `updated_by` | UUID/VARCHAR | NULL | Audit trail |
| `updated_at` | TIMESTAMP | NULL | Audit trail |

> Kolom `tipe_instalasi` **DIPINDAH ke `master_unit` (A3)** pada v3.2 (sebelumnya di sini pada v3.0/3.1). Kolom `is_rawat_inap` & `is_farmasi` telah dihapus pada v3.0. A19 tidak lagi menyimpan atribut peruntukan.

* **Constraints (integritas)**:
  * `UNIQUE(nama)` (case-insensitive) & `UNIQUE(kode)`; `kode` immutable setelah create.
  * Index pada `nama`, `kode`, `status_aktif`.
* **Relasi**: `master_unit.instalasi_id` (A3) → FK ke `master_instalasi.id` (1 Instalasi : N Unit). **Jumlah Unit** = `COUNT(master_unit WHERE instalasi_id = id)` (BR-008). Penulisan/pemindahan `instalasi_id` Unit adalah tanggung jawab **A3**, bukan A19. Atribut `tipe_instalasi` berada di `master_unit` (A3).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/instalasi` | List data (params: `search`, `status_aktif`, `sort`, `page`, `size`) |
| GET | `/api/v1/instalasi/{id}` | Detail satu instalasi + daftar Unit tertaut |
| POST | `/api/v1/instalasi` | Create (validasi unik Nama/Kode; status auto `AKTIF`) |
| PATCH | `/api/v1/instalasi/{id}` | Update field (Kode **immutable** ditolak; validasi sama dengan create) |
| PATCH | `/api/v1/instalasi/{id}/status` | Toggle Aktif/Nonaktif (blokir bila ada Unit aktif tertaut — BR-006) |
| GET | `/api/v1/instalasi/{id}/units` | Daftar Unit tertaut (membedakan Aktif vs Nonaktif) untuk konteks blokir & deep-link A3 |
| GET | `/api/v1/instalasi/export` | **[Phase 2]** Ekspor `.csv` seluruh field (menghormati filter) |
| POST | `/api/v1/instalasi/import` | **[Phase 2]** Impor massal via file (validasi per baris + laporan hasil) |

> Param `tipe_instalasi` pada GET list **DIHAPUS** (v3.2) — filter/atribut peruntukan berada di A3 (Unit). Param `is_rawat_inap`/`is_farmasi` telah dihapus (v3.0). Pemindahan Unit antar instalasi memakai endpoint milik **A3** (mis. `PATCH /api/v1/unit/{id}` mengubah `instalasi_id`). A19 hanya menyediakan deep-link ber-konteks `instalasi_asal` dan menghitung ulang Jumlah Unit.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `nama` | Nama Instalasi | text | Ya | maks 100 char, unik (case-insensitive) | manual | BR-001 |
| `kode` | Kode | text | Ya | unik, alfanumerik, maks 20 char | manual | BR-002; **immutable** setelah create; pelaporan BPJS/SIMRS |
| `keterangan` | Keterangan | textarea | Tidak | maks 255 char | manual | BR-010 (diseragamkan dari 'deskripsi') |

> **Catatan:** Field **Tipe Instalasi** tidak lagi ada di form A19 — dipindah ke form **Master Data Unit (A3)**. Klasifikasi peruntukan diinput saat membuat/mengubah Unit.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nomor | urut baris (pagination) | angka | sort | |
| Nama | `master_instalasi.nama` | text (link → Detail) | search + sort (default A–Z) | |
| Kode | `master_instalasi.kode` | text | search + sort | |
| Jumlah Unit | `COUNT(master_unit)` (A3) where `instalasi_id` | angka | sort | BR-008; dihitung ulang setelah pindah Unit |
| Status | `master_instalasi.status_aktif` | badge (hijau=Aktif / abu=Nonaktif) | filter + sort | toggle nonaktif tunduk BR-006 |
| Aksi | — | tombol **Detail** | — | header tabel: Tambah, **Ekspor (.csv)** [Phase 2], **Impor** [Phase 2] |

> Kolom **Tipe Instalasi** pada List View **DIHAPUS** (v3.2) — atribut peruntukan tampil di layar Master Data Unit (A3).

#### 8.3.3 Business Rules

| ID | Rule |
|----|------|
| **BR-001** | **Nama instalasi wajib unik** (case-insensitive, setelah trim). |
| **BR-002** | **Kode instalasi wajib unik** & **immutable** (tidak dapat diubah setelah dibuat); dipakai pelaporan eksternal BPJS/SIMRS. |
| **BR-003** | Field wajib (**Nama, Kode**) harus terisi sebelum simpan. |
| **BR-004** | Penonaktifan tidak menghapus data; relasi historis Unit tetap tersimpan. |
| **BR-005** | Instalasi **Nonaktif** tidak boleh dipilih sebagai induk Unit baru di A3, dan tidak boleh menjadi instalasi **tujuan** pemindahan Unit. |
| **BR-006** | **Penonaktifan DIBLOKIR selama masih ada Unit AKTIF tertaut.** Sistem menolak & mengarahkan Admin memindahkan Unit via **A3** dengan **deep-link ber-konteks `instalasi_asal`**. |
| **BR-007** | Perubahan data terbaca real-time oleh modul lain tanpa restart sistem. |
| **BR-008** | **Jumlah Unit** dihitung otomatis dari Unit (A3) yang tertaut, dan dihitung ulang setelah pemindahan Unit di A3. |
| **BR-009** | **Pemindahan Unit dilakukan di A3**, bukan A19, **tanpa filter jenis/tipe Unit**; Unit apa pun dapat dipindahkan ke instalasi tujuan mana pun yang **Aktif** (≠ asal). A3 memperbarui `instalasi_id` + audit trail. |
| **BR-010** | Penamaan field deskriptif diseragamkan menjadi **`keterangan`** (bukan 'deskripsi') di seluruh layar & ekspor. |
| **BR-011** | **Pemindahan Unit & penonaktifan cukup role Admin** (tanpa persetujuan khusus tambahan); pemindahan dijalankan di A3. |
| **BR-012** | **Ekspor mencakup SELURUH field** instalasi, dihasilkan sebagai **file .csv** (Phase 2). |
| **BR-013** | **Unit Nonaktif dibiarkan tertaut** sebagai histori & tidak memblokir penonaktifan; hanya Unit **Aktif** yang menjadi penghalang (BR-006). |
| **BR-014** | **Klasifikasi peruntukan (`tipe_instalasi`) bukan tanggung jawab A19** — atribut tersebut berada di **Master Data Unit (A3)** dan seluruh aturan dependensi berbasis tipe (Bangsal→A15/16/17; Farmasi/Gudang→A42) ditegakkan di A3. A19 tidak menyimpan, memvalidasi, memfilter, maupun mengekspor tipe. |

> **Dihapus pada v3.2:** BR-010 (klasifikasi `tipe_instalasi` sebagai atribut Instalasi), BR-011 (tipe induk Bangsal), BR-015 (tipe Farmasi acuan A42), BR-016/BR-017 (blokir perubahan tipe), BR-018 (warning tipe), BR-020 (ekspor tipe), BR-021 (seeder). Aturan yang tersisa dinomori ulang.

## Workflow / BPMN Interpretation

> [ASUMSI] Modul A19 **belum memiliki BPMN sendiri**. Alur diturunkan dari analogi pola master data lain (dashboard → tambah → validasi → simpan; pola konfirmasi/duplicate-check).

**Aktor**: Admin Master Data (Admin RS), Sistem Neurovi.

1. **Lihat Dashboard** — Admin membuka Master Data → Instalasi. Sistem menampilkan tabel (Nomor, Nama, Kode, Jumlah Unit, Status), search (Nama/Kode), filter (Status), sort, pagination 10/halaman, tombol Tambah & Ekspor/Impor [Phase 2].

2. **Tambah Instalasi** — Admin klik Tambah → overlay. Isi Nama, Kode, Keterangan. **Gateway field wajib** (Nama/Kode) → bila kurang, tolak per field. **Gateway Nama/Kode duplikat** → bila duplikat, tolak. Valid → simpan (status auto `AKTIF`) → redirect Dashboard, data real-time.

3. **Detail & Ubah** — Admin klik Detail/Nama → overlay pre-filled (Kode read-only/immutable). Ubah field → validasi sama → simpan & sinkron real-time (terutama ke A3).

4. **Nonaktifkan (terkontrol)** — Admin toggle Status → Nonaktif. **Gateway Unit AKTIF tertaut?** → **Ya**: penonaktifan diblokir; tampil pesan + daftar Unit aktif + **deep-link ke A3** (konteks `instalasi_asal`). Admin memindahkan Unit **di A3** (tanpa filter jenis Unit) → A19 hitung ulang Jumlah Unit. **Tidak** (Unit nonaktif dibiarkan — BR-013): status diizinkan menjadi Nonaktif. Data tetap tersimpan (histori); instalasi nonaktif tak muncul sebagai pilihan baru.

5. **Ekspor / Impor [Phase 2]** — Ekspor menghasilkan **.csv** seluruh field. Impor massal via file dengan template, validasi per baris, & laporan hasil; instalasi hasil impor di-set `AKTIF`.

---

### Catatan Pengembang
- **Phasing**: Phase 1 = CRUD murni (tanpa approval berjenjang); arsitektur data SIAP Phase 2 (`status_approval`/`role_approver`). Modul master data ini tidak memiliki workflow approval; kolom tersebut disediakan untuk fleksibilitas masa depan.
- **Perubahan v3.2**: (1) **Data awal/seeder dihapus** — tidak ada instalasi bawaan. (2) **`tipe_instalasi` dipindah ke A3 (Unit)** — A19 tak lagi mengelola klasifikasi peruntukan maupun dependensi berbasis tipe.
- **Status Behavior**: Status tidak diinput di form Tambah — selalu `AKTIF` oleh sistem; aktif/nonaktif dikelola via toggle (tunduk BR-006).
- **Konsistensi**: API & Struktur Tabel selaras dengan Business Rules; deskripsi To-Be sejalan dengan State Machine & Acceptance Criteria.

## Asumsi
- [ASUMSI] Atribut klasifikasi peruntukan **`tipe_instalasi`** (enum: Non Pelayanan/Bangsal (Rawat Inap)/Poli (Rawat Jalan)/Farmasi/Gudang/Penunjang) kini didefinisikan & diinput di **Master Data Unit (A3)**; A19 hanya menyediakan Instalasi sebagai pengelompokan.
- [ASUMSI] Kode instalasi (mis. IRJ, IGD, IRNA) diinput Admin sesuai kebijakan RS; setelah dibuat bersifat immutable (BR-002). Tidak ada kode bawaan/seeder.

## Pertanyaan Terbuka
- Format/encoding `.csv` ekspor: delimiter koma vs titik-koma (Excel locale Indonesia) & encoding UTF-8/BOM?
- Apakah metadata audit (createdAt/updatedAt/user) termasuk dalam cakupan "semua field" saat ekspor?
- Panjang/format Kode instalasi serta apakah perlu mapping ke kode standar BPJS/SATUSEHAT untuk pelaporan?
