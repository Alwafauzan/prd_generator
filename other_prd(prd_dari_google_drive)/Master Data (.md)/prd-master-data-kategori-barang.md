# PRD — Master Data: Kategori Barang

**Related Document:** Design Figma; PRD_Master_Data_Kategori_Barang.docx; Modul terkait: Barang Farmasi (A4), Barang Rumah Tangga (A5), Barang Gizi (A6), Supplier (A7)
**Versi:** 1.2 - Penyesuaian instruksi: keunikan nama per-Jenis Kategori; Jenis Kategori statis (final); audit trail masuk Phase 1; template impor tanpa batasan khusus (ikut Data Requirement); tanpa pemetaan SATUSEHAT

## 1. Overview / Brief Summary

Dalam operasional Rumah Sakit (khususnya Tipe C & D), setiap barang yang dikelola — farmasi, rumah tangga, dan gizi — perlu dikelompokkan ke dalam **kategori yang jelas dan terstandar**. Kategori Barang berperan sebagai dasar klasifikasi yang dipakai pada pencatatan stok, pengelompokan barang per jenis, hingga proses pengadaan.

Modul **Master Data — Kategori Barang** pada Neurovi berfungsi sebagai **pusat pengelolaan kategori barang** yang diklasifikasikan berdasarkan **Jenis Kategori**, yaitu **Farmasi, Rumah Tangga, dan Gizi** (daftar nilai **statis/baku**, tidak dapat diubah oleh user). Dengan pengelolaan kategori yang terpusat, sistem memastikan setiap barang terklasifikasi secara konsisten di seluruh modul, sehingga mendukung **akurasi pencatatan stok** dan **kemudahan pelaporan**.

Modul ini berperan sebagai **single source of truth** untuk seluruh data kategori barang di sistem Neurovi, dan menjadi referensi (lookup) bagi modul Master Data Barang dan Supplier.

_Sumber utama: Lampiran `PRD_Master_Data_Kategori_Barang.docx`, dengan penyesuaian: kode kategori tidak digunakan, klasifikasi memakai Jenis Kategori (3 nilai statis), dan keunikan nama berlaku per-Jenis Kategori._

## 2. Background

Sebelum modul ini dikembangkan, kategori barang untuk masing-masing jenis (Farmasi, Rumah Tangga, Gizi) dikelola **secara terpisah**. Akibatnya (sumber: lampiran):

- Terjadi **duplikasi dan inkonsistensi penamaan** kategori antar jenis.
- **Kesulitan memetakan** barang ke kategori yang seragam.
- **Pelaporan stok per kategori menjadi tidak akurat** karena kategori tidak terstandar.
- **Integrasi dengan modul Barang dan Supplier menjadi rumit** karena tidak ada kategori baku.

Untuk RS Tipe C & D dengan SDM IT terbatas, masalah ini diperberat oleh praktik input bebas (free text) yang membuat data sulit direkonsiliasi. Modul ini dikembangkan agar seluruh data kategori barang **terstandar, terpusat, dan dapat dikelola mandiri** oleh Admin RS tanpa bantuan tim teknis. Untuk menyederhanakan pengelolaan, **kode kategori tidak digunakan** (identifikasi cukup melalui Nama) dan klasifikasi dibatasi pada **3 Jenis Kategori statis** yang baku. Keunikan nama kategori **dijaga per-Jenis Kategori** sehingga setiap jenis memiliki ruang penamaannya sendiri tanpa benturan lintas jenis.

## 3. In Scope

### Scope Definition (yang dikerjakan)

| No | Scope/Area | Phase |
|----|------------|-------|
| 1 | Dashboard — Master Data Kategori Barang (list, search, filter Jenis Kategori, sort, pagination) | Phase 1 (P0) |
| 2 | Tambah Data Kategori Barang | Phase 1 (P0) |
| 3 | Update/Edit Data Kategori Barang | Phase 1 (P0) |
| 4 | Nonaktifkan/Aktifkan Kategori Barang (status_aktif) | Phase 1 (P0) |
| 5 | Detail Data Kategori Barang | Phase 1 (P0) |
| 6 | **Audit trail perubahan data kategori** (tambah/ubah/nonaktif) | **Phase 1 (P1)** — final per instruksi user |
| 7 | Ekspor Data Kategori Barang | Phase 2 [ASUMSI: mengikuti pola modul master lain] |
| 8 | Impor Data Kategori Barang (template CSV/XLSX) | Phase 2 [ASUMSI] |

### Out Scope (yang TIDAK dikerjakan)

| No | Scope |
|----|-------|
| 1 | Pengelolaan data barang itu sendiri (ditangani modul Master Data — Barang Farmasi A4, Rumah Tangga A5, Gizi A6). |
| 2 | Pengelolaan master data gudang (ditangani modul Master Data Gudang dan Farmasi A42). Jenis Kategori pada modul ini **bukan** master gudang, melainkan enum klasifikasi statis (3 nilai). |
| 3 | Pengelolaan supplier (ditangani modul Master Data — Supplier A7). |
| 4 | Konfigurasi RBAC/role (ditangani modul Role A18 / RBAC A53). |
| 5 | **Konfigurasi/penambahan/perubahan daftar nilai Jenis Kategori.** Daftar Jenis Kategori bersifat **statis (hardcoded enum)** sebanyak 3 nilai baku (Farmasi, Rumah Tangga, Gizi) dan **tidak disediakan UI** untuk mengubahnya. Final per instruksi user. |
| 6 | **Pemetaan kategori barang ke terminologi eksternal (mis. SATUSEHAT).** Tidak dikerjakan — final per instruksi user. |

## 4. Goals and Metrics

### Goals
- Menyediakan **pusat pengelolaan kategori barang** terstandar untuk seluruh **Jenis Kategori** (Farmasi, Rumah Tangga, Gizi).
- Memastikan setiap barang dan modul terkait **mengacu pada kategori yang sama**.
- Mempermudah pengelompokan barang, pencatatan stok, dan **pelaporan per kategori**.
- Mengintegrasikan kategori barang dengan modul **Barang** dan **Supplier**.
- Meningkatkan efisiensi dan akurasi klasifikasi barang antar jenis kategori.
- Menyediakan **ketertelusuran perubahan** kategori melalui audit trail sejak Phase 1.

### Metrics (sumber: lampiran)

| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Konsistensi data antar modul | 100% modul menggunakan referensi kategori barang yang sama. |
| 2 | Kemandirian user non-teknis | 100% user Admin RS mampu melakukan setup tanpa bantuan tim teknis. |
| 3 | Kecepatan update konfigurasi | 100% perubahan data terbaca real-time tanpa restart sistem. |
| 4 | Pencarian dan filter kategori | Waktu pencarian data kategori barang < 3 detik. |
| 5 | Ketertelusuran perubahan | 100% aksi tambah/ubah/nonaktif tercatat di audit trail (Phase 1). |

## 5. Related Feature

Fitur terkait dari List Fitur (cluster **Control Panel**) dan modul Backoffice yang mengonsumsi kategori barang:

| Code | Module > Menu | Relasi |
|------|---------------|--------|
| A33 | Control Panel > Master Data > **Kategori Barang** | Modul ini |
| A4 | Control Panel > Master Data > Barang Farmasi | Konsumen — barang mengacu kategori |
| A5 | Control Panel > Master Data > Barang Rumah Tangga | Konsumen — barang mengacu kategori |
| A6 | Control Panel > Master Data > Barang Gizi | Konsumen — barang mengacu kategori |
| A7 | Control Panel > Master Data > Supplier | Kategori sebagai filter Daftar Barang Supplier |
| A21 | Control Panel > Master Data > Sediaan Barang | Master data barang terkait |
| A22 | Control Panel > Master Data > Satuan & Kemasan | Master data barang terkait |
| — | Backoffice > Inventory (Pemesanan, Penerimaan, Distribusi, Stok Opname) | Hilir — laporan stok per kategori |

_Catatan perubahan: field `kode` **dihapus** dari modul ini; field klasifikasi `gudang` diganti menjadi `jenis_kategori` (enum **statis** 3 nilai), sehingga modul Gudang & Farmasi (A42) **tidak lagi** menjadi sumber pilihan klasifikasi._

_Catatan konsistensi: field bersama (`nama`, `deskripsi`, `status_aktif`, `keterangan`) mengikuti definisi kanonik lintas-PRD._

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Background lampiran]
- Kategori barang diinput **terpisah** untuk tiap jenis (Farmasi, Rumah Tangga, Gizi), sering berupa **free text**.
- Tidak ada validasi duplikasi → muncul penamaan ganda (mis. "Alkes" vs "Alat Kesehatan").
- Pelaporan stok per kategori dilakukan **manual/semi-manual**, rawan tidak cocok antar jenis.
- Tidak ada pencatatan perubahan data (siapa mengubah apa, kapan).

### B. To-Be (kondisi diharapkan) — sumber: lampiran (dengan penyesuaian)

**1. Pengelolaan Kategori Barang Terpusat**
- User Admin RS / Configuration Manager mengakses menu Master Data — Kategori Barang.
- User dapat menambah, mengedit, atau menonaktifkan data kategori barang.
- Setiap kategori memiliki atribut dasar: **nama, jenis kategori, deskripsi** (tanpa kode).

**2. Klasifikasi Berdasarkan Jenis Kategori (Statis)**
- Saat membuat kategori baru, user memilih **Jenis Kategori** dari 3 nilai baku **statis**: **Farmasi, Rumah Tangga, Gizi**.
- Daftar nilai ini **hardcoded** dan tidak dapat ditambah/diubah dari UI (final per instruksi user).
- Jenis Kategori menentukan keterkaitan kategori dengan modul barang terkait (A4/A5/A6).

**3. Integrasi dengan Barang dan Supplier**
- Modul Master Data Barang mengacu kategori ini saat mendaftarkan barang.
- Modul Supplier menggunakan kategori barang sebagai filter Daftar Barang Supplier.

**4. Validasi dan Kontrol Data**
- Sistem memvalidasi agar **tidak ada duplikasi nama** kategori **dalam Jenis Kategori yang sama** (keunikan berlaku **per-Jenis Kategori**; nama yang sama boleh dipakai pada jenis berbeda).
- Status kategori (Aktif/Nonaktif) memengaruhi ketersediaan kategori saat mendaftarkan barang.

**5. Audit Trail dan Keamanan Data (Phase 1)**
- Setiap perubahan (tambah, ubah, nonaktifkan) **terekam dalam audit trail sejak Phase 1**.
- Hanya user dengan role **Admin RS / Configuration Manager** yang dapat mengubah data kategori.

## 7. Main Flow / Mindmap

Narasi alur (sumber: lampiran bagian "B. Flow", diperkaya pola master data Control Panel):

**Skenario 1 — Lihat Dashboard Kategori Barang**
1. Admin Master Data membuka menu **Master Data → Kategori Barang**.
2. Sistem menampilkan **Dashboard** berisi tabel (Nama, Jenis Kategori, Deskripsi, Status) + search (Nama), filter Jenis Kategori, sorting, pagination 10/halaman.
3. Admin dapat klik **Detail** pada satu baris, atau klik tombol **➕** untuk menambah data.

**Skenario 2 — Tambah Kategori Barang**
1. Admin klik tombol **➕ Tambah**.
2. Sistem menampilkan **form**: Nama, Jenis Kategori (dropdown 3 nilai statis), Deskripsi, Status Aktif.
3. Admin mengisi data → klik **Simpan**.
4. **[Gateway: Nama sudah ada dalam Jenis Kategori yang sama?]**
   - **Ya** → sistem menolak, tampilkan pesan error keunikan per-Jenis Kategori (BR-001). Kembali ke form.
   - **Tidak** → sistem menyimpan, **catat audit trail (Phase 1)**, kategori tersedia sebagai referensi di Modul Barang & Supplier.

**Skenario 3 — Edit / Nonaktifkan Kategori**
1. Admin pilih baris → **Detail** → **Edit**.
2. Admin mengubah data atau mengubah **Status Aktif → Nonaktif**.
3. Sistem validasi (BR-001 per-Jenis Kategori), simpan, **catat audit trail (Phase 1)**.
4. Kategori berstatus Nonaktif **tidak muncul** sebagai pilihan saat mendaftarkan barang baru (BR-003), namun barang lama tetap mereferensikannya (BR-004).

**Skenario 4 — Lihat Audit Trail (Phase 1)**
1. Admin/Manajemen membuka **Detail** kategori → panel **Riwayat Perubahan**.
2. Sistem menampilkan daftar perubahan: user, waktu, jenis aksi (tambah/ubah/nonaktif), nilai sebelum/sesudah (FR-014).

**Skenario 5 — Impor/Ekspor (Phase 2) [ASUMSI]**
- Ekspor: unduh seluruh kategori sesuai filter aktif (CSV/XLSX).
- Impor: unggah file template; sistem validasi per-baris (BR-001 per-Jenis Kategori) dengan mode Tambah / Tambah+Update; kolom Jenis Kategori divalidasi terhadap 3 nilai statis (BR-002). **Tidak ada batasan khusus** jumlah baris/ukuran untuk template — struktur kolom mengikuti **Data Requirements** modul ini (lihat section 11.B).

## 8. Business Rules

| ID | Aturan | Sumber |
|----|--------|--------|
| **BR-001** | Nama kategori **wajib unik dalam Jenis Kategori yang sama** (keunikan berlaku **per-Jenis Kategori**, bukan global). Sistem menolak penyimpanan bila ada duplikasi nama pada Jenis Kategori yang sama. Nama yang identik **boleh** dipakai pada Jenis Kategori berbeda (mis. "Umum" di Farmasi dan "Umum" di Gizi). Pengecekan keunikan disarankan **case-insensitive** dan mengabaikan spasi tepi [ASUMSI implementasi]. | Instruksi user (final); Lampiran — "Validasi dan Kontrol Data" |
| **BR-002** | Field **Jenis Kategori wajib dipilih** dari daftar enum **statis** baku: **Farmasi, Rumah Tangga, Gizi**. Daftar bersifat hardcoded; tidak ada nilai lain dan tidak ada UI untuk menambah/mengubah. | Instruksi user (final); Lampiran — "Klasifikasi" |
| **BR-003** | Kategori berstatus **Nonaktif tidak dapat dipilih** saat mendaftarkan barang baru di modul Barang. | Lampiran — "Validasi dan Kontrol Data" |
| **BR-004** | Kategori yang sudah direferensikan oleh barang **tidak boleh dihapus permanen**; hanya boleh dinonaktifkan (soft-delete) untuk menjaga integritas histori. | [ASUMSI — pola master data] |
| **BR-005** | Hanya role **Admin RS / Configuration Manager** yang dapat menambah/mengubah/menonaktifkan kategori. | Lampiran — "Audit Trail dan Keamanan Data" |
| **BR-006** | Setiap aksi tambah/ubah/nonaktif **wajib tercatat di audit trail (Phase 1)** memuat user, timestamp, jenis aksi, dan nilai sebelum/sesudah. | Instruksi user (final); Lampiran — "Audit Trail dan Keamanan Data" |
| **BR-007** | Perubahan data **berlaku real-time** tanpa restart sistem. | Lampiran — Metrik #3 |

_Catatan perubahan: aturan lama terkait keunikan/format **Kode** dihapus karena field Kode tidak digunakan; enum klasifikasi disederhanakan menjadi 3 nilai statis (BR-002); keunikan nama dipastikan **per-Jenis Kategori** (BR-001) dan audit trail dipastikan **Phase 1** (BR-006)._

## 9. User Stories

| ID | User Story | Prioritas | Acceptance Criteria (ringkas) |
|----|------------|-----------|-------------------------------|
| **US-001** | Sebagai **Admin Master Data**, saya ingin melihat Dashboard data Kategori Barang, agar data terpantau dengan baik. | P0 | Menu Master Data → Kategori Barang menampilkan tabel (Nama, Jenis Kategori, Deskripsi, Status); sortir semua kolom; default sort Nama A-Z; search by Nama; filter by Jenis Kategori; pagination 10/halaman; tombol Detail per baris; tombol ➕ Tambah. |
| **US-002** | Sebagai **Admin Master Data**, saya ingin menambah kategori barang baru, agar barang dapat diklasifikasi terstandar. | P0 | Form Nama, Jenis Kategori, Deskripsi, Status Aktif; Jenis Kategori dipilih dari 3 nilai statis (BR-002); validasi duplikasi nama **per-Jenis Kategori** (BR-001); simpan → muncul di dashboard + tercatat audit trail. |
| **US-003** | Sebagai **Admin Master Data**, saya ingin mengubah data kategori, agar data tetap akurat. | P0 | Edit dari Detail; validasi BR-001 (per-Jenis Kategori); simpan real-time; tercatat audit trail. |
| **US-004** | Sebagai **Admin Master Data**, saya ingin menonaktifkan kategori yang tidak terpakai, agar tidak dipilih saat input barang baru. | P0 | Toggle Status Aktif→Nonaktif; kategori nonaktif tersembunyi di pendaftaran barang (BR-003); barang lama tetap aman (BR-004); tercatat audit trail. |
| **US-005** | Sebagai **Admin Master Data**, saya ingin mencari & memfilter kategori, agar cepat menemukan data (<3 detik). | P0 | Search by Nama; filter by Jenis Kategori; hasil <3 detik. |
| **US-006** | Sebagai **Petugas Gudang/Farmasi**, saya ingin memilih kategori saat mendaftarkan barang, agar barang terklasifikasi konsisten. | P0 | Dropdown kategori aktif sesuai Jenis Kategori muncul di modul Barang (A4/A5/A6). |
| **US-007** | Sebagai **Admin/Manajemen**, saya ingin melihat audit trail perubahan kategori, agar perubahan dapat ditelusuri. | **P1 (Phase 1)** | Panel Riwayat Perubahan di Detail: user, waktu, jenis aksi, nilai sebelum/sesudah; urut waktu desc. |
| **US-008** | Sebagai **Admin Master Data**, saya ingin mengekspor & mengimpor kategori massal, agar setup awal cepat. | P2 (Phase 2) | Ekspor CSV/XLSX sesuai filter; impor via template + validasi per-baris (termasuk Jenis Kategori 3 nilai statis dan keunikan nama per-Jenis Kategori). **Template tanpa batasan khusus**, struktur kolom mengikuti Data Requirements. [ASUMSI] |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | Sistem menampilkan dashboard list kategori dengan kolom Nama, Jenis Kategori, Deskripsi, Status. | US-001 |
| **FR-002** | Sistem menyediakan sorting pada semua kolom; default Nama Ascending (A-Z). | US-001 |
| **FR-003** | Sistem menyediakan kolom pencarian berdasarkan Nama. | US-001, US-005 |
| **FR-004** | Sistem menyediakan filter berdasarkan Jenis Kategori (Farmasi/Rumah Tangga/Gizi). | US-005 |
| **FR-005** | Sistem menyediakan pagination 10 data per halaman. | US-001 |
| **FR-006** | Sistem menyediakan form Tambah kategori (Nama, Jenis Kategori, Deskripsi, Status Aktif). | US-002 |
| **FR-007** | Sistem memvalidasi keunikan Nama **dalam Jenis Kategori yang sama** sebelum simpan (BR-001), serta memvalidasi Jenis Kategori terhadap 3 nilai statis (BR-002). | US-002, US-003 |
| **FR-008** | Sistem menyimpan data dan langsung menampilkannya real-time di dashboard (tanpa restart). | US-002, BR-007 |
| **FR-009** | Sistem menyediakan halaman Detail kategori, termasuk panel Riwayat Perubahan (audit trail). | US-001, US-007 |
| **FR-010** | Sistem menyediakan fungsi Edit kategori dari halaman Detail. | US-003 |
| **FR-011** | Sistem menyediakan toggle Status Aktif/Nonaktif; kategori nonaktif disembunyikan di pendaftaran barang (BR-003). | US-004 |
| **FR-012** | Sistem mencegah penghapusan permanen kategori yang sudah direferensikan barang (soft-delete) (BR-004). | US-004 |
| **FR-013** | Sistem mengekspos kategori aktif sebagai lookup ke modul Barang (A4/A5/A6) dan filter di Supplier (A7). | US-006 |
| **FR-014** | **(Phase 1)** Sistem mencatat audit trail untuk setiap aksi tambah/ubah/nonaktif (user, timestamp, jenis aksi, nilai sebelum/sesudah) dan menampilkannya di Detail (BR-006). | US-007 |
| **FR-015** | Sistem membatasi akses tulis hanya untuk role Admin RS / Configuration Manager (BR-005). | US-002..004 |
| **FR-016** | Sistem menyediakan **enum Jenis Kategori secara statis** (Farmasi, Rumah Tangga, Gizi) tanpa antarmuka untuk menambah/mengubah daftar nilainya (BR-002). | US-002 |
| **FR-017** | (Phase 2) Sistem menyediakan Ekspor (CSV/XLSX) dan Impor via template dengan mode Tambah / Tambah+Update; kolom mengikuti Data Requirements (section 11.B); Jenis Kategori divalidasi terhadap 3 nilai statis; keunikan nama divalidasi per-Jenis Kategori. **Tidak ada batasan khusus** jumlah baris/ukuran file di luar yang ditetapkan Data Requirements. [ASUMSI] | US-008 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Tambah/Edit Kategori Barang (FR-006, FR-010)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| id | ID Kategori | text/uuid | Ya | unik, system-generated | auto-generate | mengikuti pola `id` kanonik (A19/A20); internal, tidak ditampilkan sebagai kode |
| nama | Nama Kategori | text | Ya | maks 100 char; **unik dalam Jenis Kategori yang sama** (BR-001, case-insensitive) | manual | field kanonik `nama` |
| jenis_kategori | Jenis Kategori | dropdown/enum | Ya | enum **statis** 3 nilai: Farmasi / Rumah Tangga / Gizi (BR-002) | enum statis (hardcoded) | menggantikan field `gudang`; tidak ada nilai lain & tidak dapat dikonfigurasi |
| deskripsi | Deskripsi | text | Tidak | maks 255 char | manual | field kanonik `deskripsi` |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik `status_aktif` |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik `keterangan` [ASUMSI: tersedia mengikuti pola master lain] |

_Catatan: field **kode** dihilangkan sesuai instruksi (kode kategori tidak diperlukan)._

### B. Layar INPUT — Impor Kategori (Phase 2, FR-017) [ASUMSI]

Struktur template **mengikuti field di tabel A** (tidak ada batasan khusus jumlah baris/ukuran file di luar ini — final per instruksi user). Kolom default template:

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Kategori | file | Ya | .csv/.xlsx; kolom: `nama`, `jenis_kategori`, `deskripsi`, `status_aktif`, `keterangan` | manual upload | field kanonik `file_import`; tanpa batas baris/ukuran khusus |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | field kanonik `mode_import` |
| nama (kolom) | Nama Kategori | text | Ya | maks 100 char; unik per-Jenis Kategori (BR-001) | dari file | divalidasi per-baris |
| jenis_kategori (kolom) | Jenis Kategori | enum | Ya | Farmasi / Rumah Tangga / Gizi (BR-002) | dari file | baris ditolak bila nilai di luar enum statis |
| deskripsi (kolom) | Deskripsi | text | Tidak | maks 255 char | dari file | |
| status_aktif (kolom) | Status Aktif | boolean | Tidak | aktif/nonaktif | default aktif | |
| keterangan (kolom) | Keterangan | text | Tidak | maks 255 char | dari file | |

### C. Layar TAMPIL — Dashboard / List Kategori Barang (FR-001..005)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama | master_kategori_barang.nama | text | sort A-Z (default) / Z-A; search | klik → Detail |
| Jenis Kategori | master_kategori_barang.jenis_kategori | text/badge | filter; sort | filter utama (3 nilai statis) |
| Deskripsi | master_kategori_barang.deskripsi | text (truncate) | sort | |
| Status | master_kategori_barang.status_aktif | badge (Aktif hijau / Nonaktif abu) | filter [ASUMSI] | |
| Aksi | – | tombol Detail; ➕ Tambah (header) | – | |
| (footer) | count seluruh data | pagination 10/halaman | – | |

### D. Layar TAMPIL — Detail Kategori + Audit Trail (FR-009, FR-014)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama / Jenis Kategori / Deskripsi / Status / Keterangan | master_kategori_barang | text/badge | – | read-only + tombol Edit |
| Riwayat Perubahan | audit_trail (FR-014, Phase 1) | tabel: user, waktu, jenis aksi, nilai sebelum/sesudah | sort waktu desc | **wajib Phase 1** |
| Jumlah Barang Terkait | count barang where kategori_id | angka | – | bantu keputusan nonaktif (BR-004) [ASUMSI] |

### E. Entitas — Audit Trail (FR-014, Phase 1)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| audit_id | ID Audit | uuid | Ya | unik, system-generated | auto | |
| kategori_id | ID Kategori | uuid/relasi | Ya | relasi ke master_kategori_barang.id | auto | |
| aksi | Jenis Aksi | enum | Ya | tambah / ubah / nonaktif / aktif | sistem | |
| user_id | User Pelaku | relasi | Ya | relasi master user | dari sesi login | field kanonik user |
| timestamp | Waktu | datetime | Ya | server time | auto | |
| nilai_sebelum | Nilai Sebelum | json/text | Tidak | snapshot field berubah | sistem | kosong untuk aksi tambah |
| nilai_sesudah | Nilai Sesudah | json/text | Tidak | snapshot field berubah | sistem | kosong untuk aksi nonaktif murni [ASUMSI] |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| **NFR-001** | Performa | Pencarian & filter kategori menghasilkan data **< 3 detik** (Metrik #4). |
| **NFR-002** | Performa | Perubahan data terbaca **real-time** tanpa restart sistem (Metrik #3, BR-007). |
| **NFR-003** | Usability | Dapat dioperasikan mandiri oleh Admin RS non-teknis (Metrik #2) — UI sederhana; form ringkas tanpa field kode dan dengan pilihan Jenis Kategori statis terbatas (3 nilai) untuk mengurangi kesalahan input, sesuai keterbatasan SDM RS Tipe C & D. |
| **NFR-004** | Keamanan | Akses tulis dibatasi role Admin RS / Configuration Manager (BR-005); seluruh aksi tercatat audit trail sejak Phase 1 (BR-006). |
| **NFR-005** | Integritas Data | Soft-delete untuk kategori terpakai; validasi keunikan nama **per-Jenis Kategori** mencegah data ganda (BR-001, BR-004). |
| **NFR-006** | Konsistensi | 100% modul konsumen (Barang, Supplier) memakai referensi kategori yang sama (Metrik #1). |
| **NFR-007** | Ketersediaan | Modul tetap dapat diakses pada kondisi jaringan terbatas; perubahan tersimpan andal. [ASUMSI — konteks RS Tipe C & D] |
| **NFR-008** | Auditability | Audit trail (Phase 1) menyimpan user, timestamp, jenis aksi, nilai sebelum/sesudah, minimal sesuai kebijakan retensi RS. [PERLU KONFIRMASI durasi retensi] |

## 13. Integrasi Eksternal

Modul Master Data — Kategori Barang adalah master internal Neurovi; integrasi utamanya bersifat **internal (antar-modul)**, bukan ke pihak eksternal.

### Integrasi Internal
| Modul | Arah | Keterangan |
|-------|------|------------|
| Master Data Barang (A4/A5/A6) | Kategori → Barang | Kategori aktif menjadi lookup saat mendaftarkan barang (FR-013, BR-003). |
| Master Data Supplier (A7) | Kategori → Supplier | Kategori sebagai filter Daftar Barang Supplier (FR-013). |
| Backoffice Inventory (Pemesanan/Penerimaan/Distribusi/Stok Opname) | Kategori → Inventory | Pelaporan & pengelompokan stok per kategori. |
| RBAC / Role (A18/A53) | Role → Modul | Menentukan hak akses tulis (BR-005). |

_Catatan: field klasifikasi berupa **Jenis Kategori** (enum statis 3 nilai), sehingga modul Master Data Gudang & Farmasi (A42) **tidak** menjadi sumber daftar pilihan dan tidak diintegrasikan untuk keperluan ini._

### Integrasi Eksternal
- **SATUSEHAT / BPJS / Disdukcapil**: **Tidak ada** integrasi eksternal langsung untuk modul ini. Kategori barang adalah klasifikasi internal RS.
- **Pemetaan ke terminologi eksternal (mis. SATUSEHAT): TIDAK dikerjakan** untuk modul ini — final per instruksi user. Tidak ada field/proses pemetaan kategori ke kode eksternal. Bila ke depan terdapat kebutuhan terminologi (mis. untuk barang farmasi/sediaan), penanganan dilakukan di modul Barang Farmasi (A4) / Sediaan Barang (A21), bukan di modul ini.

## Asumsi
- [FINAL — instruksi user] Keunikan Nama kategori berlaku **per-Jenis Kategori**, bukan global; nama identik boleh ada pada Jenis Kategori berbeda (BR-001).
- [FINAL — instruksi user] Daftar Jenis Kategori bersifat **statis (hardcoded enum)** 3 nilai (Farmasi, Rumah Tangga, Gizi); tidak ada UI untuk menambah/mengubah (BR-002, FR-016).
- [FINAL — instruksi user] **Audit trail masuk Phase 1** (BR-006, FR-014, US-007), menampilkan user, timestamp, jenis aksi, dan nilai sebelum/sesudah.
- [FINAL — instruksi user] **Template Impor tanpa batasan khusus**; struktur kolom mengikuti Data Requirements (section 11.B).
- [FINAL — instruksi user] **Tidak ada pemetaan** kategori barang ke terminologi eksternal (SATUSEHAT dll) pada modul ini.
- [PERUBAHAN] Field 'Kode' dihapus dari seluruh form, dashboard, detail, dan business rule sesuai instruksi user (kode kategori tidak diperlukan).
- [PERUBAHAN] Field klasifikasi 'Gudang' diganti menjadi 'Jenis Kategori' dengan enum statis 3 nilai (menghapus keterkaitan lookup ke A42).
- [ASUMSI] Kondisi As-Is diturunkan dari Background lampiran (pengelolaan terpisah & free text per jenis).
- [ASUMSI] Field 'keterangan' tersedia mengikuti pola master data lain (definisi kanonik lintas-PRD), melengkapi 'deskripsi' yang disebut di lampiran.
- [ASUMSI] Soft-delete (nonaktif) dipakai alih-alih hard-delete untuk kategori yang sudah direferensikan barang (BR-004).
- [ASUMSI] Fitur Ekspor/Impor masuk Phase 2 dan mengikuti pola modul master lain (template CSV/XLSX, mode tambah / tambah+update).
- [ASUMSI] Kolom Status ditampilkan di dashboard dan dapat difilter, meski lampiran dashboard hanya menyebut Nama/Jenis/Deskripsi secara eksplisit.
- [ASUMSI] Akses tulis dibatasi role Admin RS / Configuration Manager sesuai bagian 'Audit Trail dan Keamanan Data' lampiran.

## Pertanyaan Terbuka
- Berapa lama retensi data audit trail yang disyaratkan kebijakan RS? (NFR-008) — audit trail sudah dipastikan masuk Phase 1, namun durasi retensi belum ditentukan.
- Apakah pengecekan keunikan nama per-Jenis Kategori bersifat case-insensitive dan trim spasi? [ASUMSI implementasi — perlu konfirmasi final].