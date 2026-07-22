# PRD — Master Data Satuan & Kemasan

**Related Document:** PRD Master Data Obat / Farmasi (konsumen dropdown satuan & kemasan); Kamus Farmasi dan Alat Kesehatan (KFA) - SATUSEHAT https://satusehat.kemkes.go.id/platform/docs/id/master-data/kfa/; Standar UCUM (Unified Code for Units of Measure) http://unitsofmeasure.org; Master data UCUM Observation.valueQuantity (UCUM)

**Versi:** 2.0 - Master Data Satuan (universal, multi-modul)

## 1. Overview / Brief Summary

Modul **Master Data Satuan & Kemasan** adalah modul referensi terpusat yang menyimpan daftar baku satuan pengukuran yang dipakai pada seluruh master barang di rumah sakit, mencakup Barang Farmasi (obat & alkes), Barang Rumah Tangga, dan Barang Gizi. Modul ini menjadi sumber tunggal yang dirujuk oleh ketiga master barang tersebut sebagai dropdown saat input data.

Lingkup data yang dikelola:
- **Identitas satuan**: tipe satuan, nama, kode standar (UCUM opsional).
- **Penandaan satuan farmasi**: flag "Khusus Farmasi" untuk membedakan satuan spesifik obat dari satuan umum.
- **Interoperabilitas SATUSEHAT**: pemetaan kode standar UCUM untuk satuan kekuatan/ukur obat.

Modul ini membedakan entri berdasarkan field **Tipe Satuan** dengan tiga nilai:
- **Satuan Dosis** — untuk dosis obat (mis. mg, ml, mcg, butir).
- **Satuan Kemasan** — untuk outer packaging (mis. box, strip, ampul, vial).
- **Satuan Umum** — untuk barang non-farmasi (mis. pcs, lembar, set, porsi).

Pemisahan tipe memudahkan filter saat dipakai di modul konsumen. Master juga menyediakan flag **"Khusus Farmasi"** pada level entri (Yes/No) untuk menandai satuan spesifik obat sehingga tidak muncul di dropdown Barang Rumah Tangga atau Barang Gizi. Kode standar **UCUM** disimpan **opsional** pada entri yang memiliki padanan internasional, untuk kesiapan integrasi **SATUSEHAT**.

> **Keputusan Phase 1**: untuk fase ini, daftar **satuan dengan kode UCUM** di-seed manual dan di-hardcode di frontend dalam bentuk dropdown — belum ada integrasi API live ke SATUSEHAT Terminology.

> **CATATAN**: Pada versi 2.0 ini, konsep "**Satuan Sediaan**" (bentuk fisik obat seperti Tablet, Kapsul, Sirup) DIPISAH menjadi Master Data Sediaan tersendiri yang khusus dipakai oleh Master Barang Farmasi. Modul ini fokus pada satuan **pengukuran dan kemasan**.

## 2. Background

### 2.1 Konteks Integrasi SATUSEHAT & Terminologi
Ekosistem digital kesehatan Indonesia mewajibkan integrasi data ke platform **SATUSEHAT**. Pengiriman data obat (resource **Medication**) ke SATUSEHAT wajib menggunakan standar pengkodean terminologi internasional **LOINC** untuk satuan pengukuran kekuatan obat, serta **KPTL** untuk kebutuhan klaim dan interoperabilitas. Saat ini satuan pengukuran dan kemasan barang ditulis sebagai teks bebas di tiap master (Farmasi, Rumah Tangga, Gizi), rawan **inkonsistensi penulisan** (mis. "tab", "tablet", "TAB", "butir" untuk hal sama; "pcs", "piece", "buah" untuk hal sama) → diperlukan **master universal** untuk menampung satuan baku dan memetakan ke kode standar **UCUM**.

**Catatan penting:**
- Pemetaan kode **UCUM** (Unified Code for Units of Measure) wajib bersumber dari standar internasional yang telah diverifikasi.
- **Phase 1**: daftar UCUM di-seed manual dan di-hardcode sebagai dropdown di frontend (belum tarik API live). Pembaruan daftar = rilis/seed baru.
- Validasi duplikasi satuan dievaluasi berdasarkan kombinasi **Tipe Satuan + Nama**.
- Status **nonaktif** = acuan modul lain: satuan nonaktif tidak muncul di dropdown saat input data barang baru, tetapi tetap tersimpan di history.

### 2.2 Gap: Inkonsistensi Data Satuan & Ketiadaan Standarisasi
Sebelumnya, satuan barang diisi sebagai teks bebas di tiap master, menyebabkan:
- **Duplikasi makna dengan penulisan berbeda** — "tab", "tablet", "TAB" untuk hal sama.
- **Inkonsistensi lintas modul** — perhitungan stok dan pelaporan sulit karena satuan tidak seragam antar master barang.
- **Tidak ada kode standar UCUM** — data obat tidak siap dikirim ke SATUSEHAT; satuan kekuatan/ukur tidak terpetakan ke terminologi internasional.
- **Duplikasi effort** — setiap kali ada perubahan satuan, perubahan harus dilakukan di setiap master yang merujuk.

Dengan satu **master universal berkode standar (UCUM opsional)**, penulisan menjadi konsisten lintas modul, dan satuan obat siap dipetakan ke SATUSEHAT tanpa duplikasi master per modul.

### 2.3 Perlunya Pembedaan Tipe Satuan
Konsep awal dirancang khusus farmasi dengan tiga tipe. Pada update v2.0, scope diperluas menjadi **universal** (semua master barang) dengan tipe baru (Satuan Dosis / Kemasan / Umum), sedangkan konsep "Sediaan" (bentuk fisik obat) dipindah ke master tersendiri. Pembedaan tipe memudahkan:
- **Filter dropdown** di Master Barang Farmasi, Rumah Tangga, dan Gizi secara otomatis.
- **Identifikasi satuan spesifik farmasi** (flag "Khusus Farmasi") agar tidak muncul di modul non-farmasi.
- **Manajemen stok yang lebih baik** dengan satuan yang jelas per kategori barang.

## 3. In Scope

### Scope Definition
**Phase 1 (MVP):**

| **Phase** | **Scope/Area** |
|-----------|----------------|
| 1 | Pengelolaan **CRUD satuan** dalam satu master universal, dibedakan oleh field **Tipe Satuan** (Satuan Dosis / Satuan Kemasan / Satuan Umum). |
| 1 | Penandaan flag **"Khusus Farmasi"** pada entri yang spesifik untuk dosis obat (mis. mg/0.5ml, mcg/puff, IU/gram), supaya dropdown Barang RT/Gizi otomatis difilter. |
| 1 | Pemetaan kode standar **UCUM (opsional)** pada entri yang memiliki padanan internasional, untuk integrasi SATUSEHAT. |
| 1 | Pengaturan **status Aktif/Nonaktif** pada tiap entri (fitur hapus ditiadakan): entri nonaktif tetap muncul di list data tetapi tidak muncul di dropdown saat input data barang baru, sehingga referensi historis tetap valid (audit trail dipertahankan). |
| 1 | **Pencarian**, **filter** (tipe, khusus farmasi), serta **daftar (list) dengan pagination**. |
| 1 | Penyediaan data sebagai sumber **dropdown** untuk Master Barang Farmasi, Barang Rumah Tangga, dan Barang Gizi. |
| 1 | **Log aktivitas perubahan** (audit trail) untuk semua CRUD operation. |

**Phase 2 [[]]** (di luar MVP rilis ini, dicatat sebagai roadmap):
- Integrasi **UCUM API live** ke SATUSEHAT Terminology (menggantikan dropdown hardcoded Phase 1).
- **Impor & ekspor** data satuan (.xlsx/.csv) sesuai template.
- Pencatatan log pelaporan untuk akreditasi.

### Out Scope

| No | Scope yang TIDAK dikerjakan modul ini |
|----|----------------------------------------|
| 1 | Faktor konversi kemasan per produk (mis. 1 box = 10 strip = 100 tablet) — spesifik per obat, ditangani Master Data Obat. |
| 2 | Pengelolaan data produk obat & kode KFA (ditangani Master Data Obat yang merujuk master ini). |
| 3 | Pengiriman resource Medication/MedicationRequest ke SATUSEHAT (ditangani Modul Integrasi SATUSEHAT). |
| 4 | Sinkronisasi otomatis (fetch) terminologi UCUM dari server eksternal; pengisian via CRUD/seed pada fase ini. |
| 5 | Bentuk sediaan obat (Tablet, Kapsul, Sirup, dll.) — ditangani Master Data Sediaan yang terpisah. |
| 6 | Pengelolaan Unit/Satuan/Profesi lainnya — dikelola modul lain (modul ini hanya menjadi lookup). |

## 4. Goals and Metrics

### Goals

Menyediakan **kamus satuan barang yang baku, terpusat, dan universal** lintas modul (Farmasi, RT, Gizi), dengan pemetaan ke kode standar **UCUM (opsional)** untuk kesiapan integrasi SATUSEHAT dan mengeliminasi duplikasi data satuan.

### Success Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Konsistensi data | **0 duplikasi** satuan/kemasan bermakna sama; seluruh data barang memilih dari master, bukan teks bebas. |
| 2 | Kelengkapan kode standar | **100%** entri yang memiliki padanan UCUM terisi kode standar; satuan lokal (ampul, butir) boleh kosong. |
| 3 | Kesiapan SATUSEHAT | **100%** satuan obat yang dikirim ke SATUSEHAT memakai kode standar valid. |
| 4 | Efisiensi pengelolaan | Penambahan/perubahan **1 entri < 2 menit** dan langsung berlaku di modul terkait. |
| 5 | Performa | Pencarian/filter satuan menghasilkan ≤ **3 detik** untuk dataset RS tipe C&D. |

## 5. Related Features

| No | Module | Feature |
|----|--------|---------|
| 1 | Master Data Obat / Farmasi | Dropdown satuan kekuatan, bentuk sediaan, dan kemasan saat input data obat. |
| 2 | Modul Stok & Inventory | Satuan untuk perhitungan stok (faktor konversi disimpan di Master Obat). |
| 3 | Modul Integrasi SATUSEHAT | Sumber kode UCUM (opsional) untuk resource Medication. |
| 4 | Master Barang Rumah Tangga | Dropdown satuan saat input data barang (filter **Khusus Farmasi=No**). |
| 5 | Master Barang Gizi | Dropdown satuan saat input data bahan gizi (filter **Khusus Farmasi=No**). |
| 6 | Modul Billing/Klaim | Referensi satuan untuk perhitungan billing & klaim. |

## 6. Business Process

### 6.1 As-Is (Kondisi Saat Ini)
- Satuan & kemasan diisi sebagai **teks bebas**, rawan **inkonsistensi penulisan** dan duplikasi makna.
- Tidak ada **kode standar UCUM**, sehingga data obat tidak siap dikirim ke SATUSEHAT.
- **Perhitungan stok** dan **pelaporan lintas modul** sulit karena satuan tidak seragam antar master barang.
- Saat ada perubahan satuan, perubahan harus dilakukan di **setiap master** yang merujuk (duplikasi effort).

### 6.2 To-Be (Kondisi Yang Diharapkan)
- Satuan & kemasan dikelola **terpusat** dalam satu master, dibedakan oleh **Tipe Satuan**.
- Satuan dengan padanan internasional memiliki **kode UCUM** untuk interoperabilitas SATUSEHAT (opsional, sesuai ketersediaan).
- **Penambahan/perubahan** dilakukan via **CRUD manual** di satu tempat; data barang memilih satuan dari **dropdown master**.
- **Status Aktif/Nonaktif** memastikan data historis tetap valid; entri yang tidak dipakai cukup dinonaktifkan (tidak ada fitur hapus permanen), dan tetap muncul di list data untuk transparansi pengelolaan.

## 7. Main Flow / User Journeys

### 7.1 Alur CRUD Satuan
1. Admin membuka menu **Control Panel → Master Data → Satuan**.
2. Sistem menampilkan **dashboard list satuan** aktif, terkelompok per tipe.
3. Admin **menambah/mengubah** entri: memilih **Tipe Satuan**, mengisi **Nama**, **Kode UCUM (opsional)**, dan flag **Khusus Farmasi**.
4. Sistem memvalidasi keunikan **Nama per Tipe Satuan**, lalu menyimpan entri.
5. Perubahan **langsung berlaku** di dropdown modul Master Barang Farmasi, Rumah Tangga, dan Gizi.

### 7.2 Alur Penggunaan di Master Barang
1. Saat input data barang (Farmasi/RT/Gizi), modul menampilkan **dropdown satuan aktif** dari master ini, difilter sesuai **Tipe Satuan + flag Khusus Farmasi**.
2. Saat data obat dikirim ke SATUSEHAT, modul integrasi mengambil **kode UCUM** (jika tersedia) dari satuan yang tertaut.
3. Entri yang tidak dipakai cukup **dinonaktifkan** (toggle Aktif/Nonaktif), tidak ada fitur hapus permanen, agar referensi historis tetap terjaga.

## 8. Business Requirements & User Stories

### 8.1 Priority Level Definition

| **Level** | **Deskripsi** |
|-----------|---------------|
| **P0** | **Critical**, merupakan bagian dari MVP Product |
| **P1** | **Must Have**, eksistensinya tidak sefatal P0 |
| **P2** | **Should Have**, secara signifikan meningkatkan kenyamanan pengguna |
| **P3** | **Low**, fitur tambahan atau kosmetik product |
| **P4** | **Enhancement**, inovasi masa depan |

### 8.2 Business Requirements & User Stories

| No | Fitur | User Story | Kriteria Detail | P | Acceptance Criteria |
|----|-------|-----------|-----------------|---|-------------------|
| 1 | Dashboard - Satuan | Sebagai admin, saya ingin melihat daftar satuan & kemasan yang tersedia, terkelompok per tipe, agar mudah dikelola. | Klik menu Master Data → Satuan menampilkan halaman Dashboard. Tabel menampilkan kolom: Tipe Satuan, Nama, Kode Standar (UCUM), Khusus Farmasi. Urutan default berdasarkan Nama Ascending; dapat diatur Asc/Desc. Kolom Pencarian (Nama, Kode Standar). Pagination 10/20/50/100 data per halaman. Tiap baris ada tombol: Detail, Edit, Aksi (Aktif/Nonaktif). Tombol ➕ untuk menambah data baru. | **P0** | Seluruh data satuan tampil per tipe dengan kode standar; operasi Detail/Edit/Aksi tersedia tiap baris. |
| 2 | Tambah (Create) | Sebagai admin, saya ingin menambah entri satuan/kemasan baru beserta kode standarnya agar tersedia di master data barang farmasi, rumah tangga dan barang gizi. | Klik ➕ menampilkan form Tambah (overlay). Field: Tipe Satuan, Nama, Kode Standar (UCUM, opsional), Khusus Farmasi (default No). Code System otomatis terisi (UCUM) jika Kode Standar diisi. Validasi: Nama wajib unik per Tipe Satuan; Kode Standar UCUM opsional; flag Khusus Farmasi default No. | **P0** | Entri tersimpan; Nama unik per Tipe Satuan; langsung tersedia sebagai dropdown di master data barang farmasi, rumah tangga dan barang gizi. |
| 3 | Ubah (Update) | Sebagai admin, saya ingin mengubah data satuan/kemasan bila terjadi perubahan atau koreksi. | Klik Edit membuka form terisi data lama. Seluruh field dapat diubah. Validasi keunikan & kelengkapan tetap berlaku saat menyimpan. | **P0** | Perubahan tersimpan dan otomatis berlaku pada seluruh modul yang merujuk entri. |
| 4 | Detail | Sebagai admin, saya ingin melihat detail satu entri lengkap dengan kode standar dan code system-nya. | Klik Detail menampilkan seluruh field: Tipe Satuan, Nama, Kode Standar (UCUM), Khusus Farmasi. **[Phase 2]** Menampilkan jumlah barang yang sedang merujuk entri ini (info pemakaian). | **P1** | Seluruh atribut entri tampil lengkap dan akurat. |
| 5 | Aktif/Nonaktif | Sebagai admin, saya ingin dapat mengaktifkan maupun menonaktifkan satuan yang sudah dibuat. | Tidak ada fitur Hapus; pengelolaan status dilakukan via toggle Aktif/Nonaktif. Entri yang nonaktif tetap muncul di list data (dashboard), tetapi tidak muncul di dropdown saat input data barang baru. Data historis (barang lama yang sudah merujuk entri ini) tetap valid; referensi tetap utuh. Audit trail dicatat: siapa yang melakukan aktif/nonaktif, kapan. | **P0** | Data yang nonaktif masih muncul di list; barang lama yang merujuk entri ini tetap valid; tidak muncul di dropdown input baru. |
| 6 | Pemetaan Kode Standar UCUM | Sebagai admin, saya ingin memetakan tiap satuan ke kode standar UCUM yang benar agar siap dikirim ke SATUSEHAT. | Satuan dengan padanan UCUM → isi Kode Standar UCUM (http://unitsofmeasure.org), mis. 'mg', 'mL', 'kg'. Satuan lokal tanpa padanan UCUM (mis. ampul, butir, biji, dosin) → Kode Standar dibiarkan kosong. Tipe Satuan Kemasan & Umum biasanya tidak punya kode UCUM; tidak masalah dibiarkan kosong. Code System URI terisi otomatis = "http://unitsofmeasure.org" jika Tipe = Satuan Dosis & ada Kode UCUM. | **P0** | Entri yang punya padanan UCUM terisi kode standar yang valid; entri lokal boleh kosong. Kode system URI konsisten. |
| 7 | Pencarian & Filter | Sebagai admin, saya ingin mencari dan memfilter satuan berdasarkan tipe atau flag khusus farmasi. | Filter: Tipe Satuan (Satuan Dosis / Satuan Kemasan / Satuan Umum), Khusus Farmasi (Ya/Tidak). Pencarian: Nama, Kode Standar. Hasil real-time atau on-click search icon. | **P1** | Hasil sesuai kata kunci dan filter yang dipilih; loading ≤ 3 detik. |
| 8 | Penyediaan Dropdown ke Master Barang | Sebagai sistem, saya ingin menyediakan daftar satuan/kemasan aktif sebagai sumber dropdown pada Master Barang Farmasi, Rumah Tangga, dan Gizi. | Endpoint internal: ambil entri berdasarkan Tipe, hanya yang berstatus **Aktif** (status_aktif=true). Master Barang memanggil endpoint sesuai tipe (Satuan Dosis, Satuan Kemasan, Satuan Umum). Filter tambahan: jika barang = Farmasi, tampilkan semua; jika barang = RT/Gizi, filter Khusus Farmasi=No. Hasil terurut berdasarkan Nama Ascending. | **P1** | Dropdown menampilkan entri aktif sesuai tipe & khusus farmasi; relasi barang-satuan tersimpan dengan benar. |
| 9 | Audit Log | Sebagai sistem, setiap perubahan CRUD satuan harus tercatat untuk keperluan audit dan compliance. | Setiap operasi (Tambah/Ubah/Aktif/Nonaktif) dicatat: waktu, user, aksi, objek (Tipe+Nama satuan), perubahan (before→after). Log bersifat immutable (tidak bisa dihapus). Admin dapat melihat history melalui menu Audit Log (Phase 2). | **P1** | Seluruh operasi tercatat di audit log dengan detail akurat; immutable. |

## 9. Data Requirements (Spesifikasi Field)

### 9.1 Form Tambah/Edit Satuan — Data Umum (INPUT)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| tipe_satuan | Tipe Satuan | dropdown | Ya | Satuan Dosis / Satuan Kemasan / Satuan Umum | enum | Menentukan penggunaan di master barang |
| nama_satuan | Nama Satuan | text | Ya | unik per tipe satuan, maks 100 char | manual | Nama lengkap (mis. Milligram, Box, Pcs) |
| kode_ucum | Kode Standar (UCUM) | dropdown | Tidak | dari daftar UCUM terverifikasi (seed hardcoded frontend) | hardcoded frontend | Phase 1: hardcoded; Phase 2: API live |
| khusus_farmasi | Khusus Farmasi | boolean/toggle | Tidak | Yes/No | default No | Jika Yes, satuan ini hanya muncul di Master Barang Farmasi |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik (optional) |

### 9.2 Dashboard / List Satuan (TAMPIL)

#### 9.2.1 Filter & Search
| Elemen | Tipe | Fungsi | Catatan |
|--------|------|--------|---------|
| Filter Tipe Satuan | dropdown | Filter list berdasarkan tipe_satuan | optional; "Pilih Tipe Satuan" |
| Filter Khusus Farmasi | dropdown | Filter list berdasarkan flag khusus_farmasi (Ya/Tidak) | optional |
| Cari Satuan | text input + search icon | search by nama_satuan, kode_ucum | real-time atau on-click search icon |
| Refresh | icon button | reload data list | |

#### 9.2.2 Kolom Tabel List
| Kolom | Sumber Data | Format Tampilan | Sort | Filter | Catatan |
|-------|-------------|-----------------|------|--------|---------|
| Tipe Satuan | master_satuan.tipe_satuan | text/badge | Tidak | Ya (dropdown) | |
| Nama Satuan | master_satuan.nama_satuan | text | Ya (A-Z) | search | |
| Kode UCUM | master_satuan.kode_ucum | text | Tidak | Ya (dropdown) | optional; jika kosong tampil "-" |
| Khusus Farmasi | master_satuan.khusus_farmasi | badge (Ya/Tidak) | Tidak | Ya (dropdown) | Ya = highlight, Tidak = normal |
| Status Satuan | master_satuan.status_aktif | toggle + badge (Aktif/Nonaktif) | Tidak | Ya | Aktif = green, Nonaktif = gray; tidak ada hapus permanen |
| Aksi | – | button TOGGLE Aktif/Nonaktif + EDIT (biru) + DETAIL | Tidak | Tidak | row action; ikon/text button |

#### 9.2.3 Pagination & Summary
| Elemen | Fungsi | Catatan |
|--------|--------|---------|
| Total Satuan Aktif | Menampilkan count data aktif | ringkasan di atas/bawah tabel (optional) |
| Pagination | navigasi halaman (1, 2, 3, ... ) | default page size = 10 rows; next/prev arrows |
| Total Records | "Menampilkan X dari Y satuan" | optional di bawah tabel |

### 9.3 Audit Log (TAMPIL)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit_log.timestamp | tanggal+jam | sort desc | |
| User | audit_log.user | text | filter | |
| Aksi | audit_log.action | badge (Tambah/Edit/Aktif/Nonaktif) | filter | |
| Objek | audit_log.tipe_satuan + nama_satuan | text | search | |
| Perubahan | audit_log.diff | before → after | – | ringkas field berubah |

## 10. Non-Functional Requirements

- **NFR-001 (Performa)** — Pencarian/filter satuan menghasilkan ≤ **3 detik** untuk dataset RS tipe C&D (≤ ±500 entri satuan). *(Metric 5)*
- **NFR-002 (Ketersediaan/Offline)** — Master data satuan perlu dapat di-*cache* lokal agar Master Barang & modul lain tetap berjalan saat internet tidak stabil. Daftar UCUM Phase 1 di-seed hardcoded di frontend sehingga **tidak bergantung koneksi** saat input. [ASUMSI — kendala infrastruktur tipe C&D]
- **NFR-003 (Keamanan/RBAC)** — Akses tambah/edit/nonaktif dibatasi role (mis. Admin Master Data / Kepala Lab) sesuai modul A53 RBAC; user umum hanya baca.
- **NFR-004 (Auditability)** — Seluruh perubahan (CRUD) tercatat & tidak dapat dihapus (immutable log).
- **NFR-005 (Integritas Data)** — Tidak ada fitur hapus (baik soft delete maupun hard delete) pada master ini. Pengelolaan dilakukan via toggle **Aktif/Nonaktif** untuk menjaga referensi historis tetap utuh.
- **NFR-006 (Interoperabilitas)** — Kode UCUM mengikuti standar internasional (system `http://unitsofmeasure.org`). 
- **NFR-007 (Usability)** — Form mendukung pengisian field tanpa reload; dropdown UCUM mendukung pencarian cepat (typeahead) di sisi frontend.
- **NFR-009 (Maintainability seed UCUM)** — Daftar UCUM hardcoded Phase 1 harus terisolasi (mis. satu file konstanta/konfigurasi frontend) agar pembaruan/seed berikutnya mudah & terlacak versi. [ASUMSI implementasi]

## 11. Integrasi Eksternal

| Integrasi | Arah | Data | Catatan |
|-----------|------|------|---------|
| **SATUSEHAT — Terminologi (UCUM)** | Seed/lookup lokal | Daftar kode UCUM internasional **terverifikasi** | **Phase 1: di-seed manual & hardcoded sebagai dropdown frontend** (bukan API live). Integrasi tarik dinamis = Phase 2. |
| **Master Barang Farmasi (A24)** | Konsumsi (hilir) | Dropdown satuan aktif sesuai tipe & khusus farmasi | Master ini menyediakan source dropdown untuk form input barang farmasi. |
| **Master Barang Rumah Tangga (A25)** | Konsumsi (hilir) | Dropdown satuan aktif (filter Khusus Farmasi=No) | Satuan khusus farmasi difilter otomatis. |
| **Master Barang Gizi (A26)** | Konsumsi (hilir) | Dropdown satuan aktif (filter Khusus Farmasi=No) | Satuan khusus farmasi difilter otomatis. |
| **Modul Billing/Klaim/RME** | Sediakan (hilir) | Data satuan + UCUM | Single source of truth untuk semua satuan barang. |

> **Catatan Interoperabilitas**: pastikan setiap satuan numerik (Satuan Dosis) yang memiliki padanan internasional memiliki kode UCUM yang valid. Satuan lokal (ampul, butir, biji) atau Satuan Kemasan/Umum tidak wajib punya kode UCUM; cukup punya Nama unik per Tipe. Faktor konversi antar kemasan bersifat spesifik per produk dan dikelola pada Master Barang masing-masing, bukan master ini.

## Asumsi

- [ASUMSI] Aktor pengelola = Petugas Lab / Admin Master Data; konsumen hilir = Master Barang Farmasi/RT/Gizi & modul Billing.
- [KEPUTUSAN] Phase 1: daftar UCUM di-seed manual dan di-hardcode sebagai dropdown di frontend (tanpa API live ke SATUSEHAT Terminology). Integrasi dinamis = Phase 2.
- [KEPUTUSAN] Pembedaan satuan berdasarkan Tipe Satuan (Dosis/Kemasan/Umum) & flag Khusus Farmasi untuk kemudahan filter di modul konsumen.
- [KEPUTUSAN] Fitur **Hapus ditiadakan**, diganti dengan toggle **Aktif/Nonaktif**. Satuan yang tidak lagi dipakai cukup dinonaktifkan; entri nonaktif tetap muncul di list tetapi disembunyikan dari dropdown input, agar referensi historis tetap terjaga dan audit trail lengkap.
- [ASUMSI] Kendala infrastruktur RS tipe C&D → master data perlu cache lokal/offline (NFR-002); dropdown UCUM hardcoded mengurangi ketergantungan koneksi saat input.
- [ASUMSI] Field kanonik keterangan, status_aktif, created_at, updated_at, created_by, updated_by mengikuti definisi bersama lintas-PRD tanpa redefinisi.
- [ASUMSI] Impor/ekspor data satuan (.xlsx/.csv) ditunda ke Phase 2.

## Pertanyaan Terbuka

- [PARKIR — diabaikan untuk Phase 1] Format & kolom pasti template impor/ekspor (.xlsx/.csv) untuk update massal satuan — impor/ekspor ditunda ke Phase 2.
- [PHASE 2] Kapan & bagaimana mekanisme pembaruan daftar UCUM hardcoded (frekuensi seed ulang / proses rilis) sebelum migrasi ke API live Phase 2?
- [PERLU KONFIRMASI] Apakah ada satuan yang bisa berubah tipe atau flag "Khusus Farmasi" setelah dipakai di master barang? (implikasi ke backward compatibility)