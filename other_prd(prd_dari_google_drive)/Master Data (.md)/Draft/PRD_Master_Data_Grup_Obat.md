# PRD — Master Data Grup Obat

**Related Document:** PRD Master Data Obat / Farmasi (konsumen dropdown golongan obat); UU No. 17 Tahun 2023 tentang Kesehatan (Pasal 320 - obat dengan/tanpa resep) https://peraturan.bpk.go.id/Details/258028/uu-no-17-tahun-2023; Permenkes No. 917/1993 jo. 949/2000 (penggolongan obat); UU 35/2009 Narkotika; UU 5/1997 Psikotropika

**Versi:** 1.0 - Draft awal Master Data Grup Obat

## 1. Overview / Brief Summary

Modul **Master Data Grup Obat** adalah modul referensi yang menyimpan daftar baku **golongan produk farmasi (obat)** sesuai regulasi Indonesia. Modul ini menjadi sumber tunggal yang dirujuk oleh Master Data Obat/Produk untuk mengelompokkan tiap produk ke golongannya (mis. Obat Bebas, Obat Keras, Narkotika), serta menjadi dasar aturan distribusi dan peresepan.

Lingkup data yang dikelola:
- **Identitas golongan**: nama, kode internal.
- **Penanda perlu resep**: flag untuk menentukan apakah obat golongan tersebut memerlukan resep dokter.
- **Status golongan**: aktif atau nonaktif.
- **Aturan distribusi & peresepan**: penandaan perlu resep memungkinkan sistem menegakkan aturan otomatis.

Setiap golongan menyimpan nama, kode, dan penanda apakah perlu resep dokter. Penanda ini memungkinkan sistem menegakkan aturan otomatis — misalnya memblokir penjualan bebas untuk obat keras, narkotika, dan psikotropika. Master ini mencakup:
- **Penggolongan klasik** (Permenkes 917/1993 jo. 949/2000): Obat Bebas, Obat Bebas Terbatas, OWA, Obat Keras, Psikotropika, Narkotika.
- **Kerangka obat dengan/tanpa resep** (UU 17/2023 Pasal 320).
- **Kategori pengawasan khusus**: Prekursor Farmasi, Obat-Obat Tertentu (OOT).
- **Kategori obat bahan alam**: Jamu, OHT (Obat Herbal Terstandar), Fitofarmaka.
- **Entri fallback**: Tanpa Golongan.

---

## 2. Background

### 2.1 Konteks Regulasi & Kerangka Hukum
Penggolongan obat di Indonesia diatur melalui beberapa instrumen hukum:
- **Permenkes No. 917/1993 jo. 949/2000**: penggolongan obat menjadi Bebas, Bebas Terbatas, OWA, Keras, Psikotropika, Narkotika.
- **UU No. 17 Tahun 2023 tentang Kesehatan (Pasal 320)**: kerangka obat dengan resep vs. tanpa resep.
- **UU No. 35 Tahun 2009 tentang Narkotika & UU No. 5 Tahun 1997 tentang Psikotropika**: pengawasan khusus untuk kedua golongan ini.
- **Peraturan BPOM**: Prekursor Farmasi, Obat-Obat Tertentu (OOT), dan klasifikasi obat bahan alam (Jamu, OHT, Fitofarmaka).

### 2.2 Gap: Ketiadaan Master Golongan Obat yang Terstruktur
Saat ini golongan obat kerap:
- **Diisi sebagai teks bebas** tanpa terstruktur, sehingga aturan distribusi dan peresepan sulit ditegakkan secara otomatis.
- **Tidak konsisten** antar master barang — misalnya "OBat Keras" ditulis berbeda-beda ("OK", "obat keras", "OBAT KERAS").
- **Tidak memiliki penanda perlu resep** yang terstandar, sehingga sistem tidak bisa menegakkan aturan otomatis.
- **Berisiko non-compliance** — obat keras yang seharusnya butuh resep bisa lolos karena golongannya tidak terstandar.

### 2.3 Perlunya Master Golongan Obat Terpusat
Dengan memusatkan golongan obat pada satu master baku berikut **penanda perlu resep yang jelas**, sistem dapat:
- **Menegakkan aturan peresepan secara otomatis** — memblokir penjualan obat keras/narkotika/psikotropika tanpa resep.
- **Menjaga konsistensi pengelompokan** obat sesuai regulasi yang berlaku.
- **Memudahkan audit & pelaporan** (compliance dengan regulasi BPOM & Kemenkes).
- **Mendukung integrasi modul Farmasi/Resep** dengan validasi otomatis berbasis golongan obat.

---

## 3. In Scope

### Scope Definition

**Phase 1 (MVP):**

| **Phase** | **Scope/Area** |
|-----------|----------------|
| 1 | Pengelolaan **CRUD golongan** produk farmasi: tambah, lihat detail, ubah, dan nonaktifkan entri. |
| 1 | Pengelolaan **penanda perlu resep** (Ya/Tidak) tiap golongan sebagai dasar aturan peresepan otomatis. |
| 1 | Pengelolaan **status aktif/nonaktif** per entri (default aktif). Entri nonaktif disembunyikan dari dropdown tanpa menghapus data historis. |
| 1 | **Pencarian**, **filter** (status, perlu resep), serta **daftar (list)** golongan dengan pagination. |
| 1 | Penyediaan data sebagai sumber **dropdown** untuk Master Data Obat/Farmasi. |
| 1 | Seed data awal golongan obat sesuai regulasi (12 golongan dasar + fallback). |
| 1 | **Log aktivitas perubahan** (audit trail) untuk setiap operasi CRUD. |

**Phase 2 [[]]** (di luar MVP rilis ini, dicatat sebagai roadmap):
- **Impor & ekspor** data golongan (.xlsx/.csv) sesuai template.
- Integrasi dengan modul Farmasi/Resep untuk validasi peresepan otomatis (flagging non-compliance).

### Out Scope

| No | Scope yang TIDAK dikerjakan modul ini |
|----|----------------------------------------|
| 1 | Penetapan golongan pada masing-masing produk obat — ditangani Master Data Obat yang merujuk master ini. |
| 2 | Penegakan aturan distribusi/peresepan itu sendiri — ditangani modul Farmasi/Resep yang membaca atribut master ini. |
| 3 | Daftar zat/item spesifik per golongan narkotika-psikotropika (Gol. I/II/III) — kewenangan regulasi BPOM/Kemenkes, di luar master golongan ini. |
| 4 | Penentuan harga atau subsidi obat berdasarkan golongan — ditangani modul Billing/Harga. |
| 5 | Pengelolaan data produk obat/farmasi — ditangani Master Data Obat yang terpisah. |

---

## 4. Goals and Metrics

### Goals

Menyediakan **referensi golongan obat yang baku, terpusat, dan lengkap** dengan atribut penanda perlu resep, sehingga pengelompokan obat konsisten dan **aturan distribusi/peresepan/pelaporan dapat ditegakkan otomatis** sesuai regulasi Indonesia.

### Success Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Konsistensi data | **0 duplikasi** golongan; seluruh obat memilih golongan dari master, bukan teks bebas. |
| 2 | Kelengkapan atribut | **100%** golongan aktif memiliki penanda "perlu resep" terisi dengan benar. |
| 3 | Penegakan aturan | **100%** obat golongan keras/narkotika/psikotropika otomatis tertandai "perlu resep = Ya". |
| 4 | Cakupan golongan | **12 golongan + 1 fallback** sesuai regulasi semua tersedia & aktif di master. |
| 5 | Performa | Pencarian/filter golongan menghasilkan ≤ **3 detik** untuk dataset RS. |

---

## 5. Related Features

| No | Module | Feature |
|----|--------|---------|
| 1 | Master Data Obat / Farmasi | Dropdown golongan obat saat input data obat/produk. |
| 2 | Modul Resep & Peresepan | Membaca atribut "perlu resep" untuk validasi peresepan otomatis. |
| 3 | Modul Farmasi / Counter Obat | Filter/informasi golongan untuk aturan penjualan. |
| 4 | Modul Pelaporan / Compliance | Referensi golongan untuk audit distribusi & peresepan. |

---

## 6. Business Process

### 6.1 As-Is (Kondisi Saat Ini)
- Golongan obat diisi **tidak terstruktur** (teks bebas), aturan distribusi/peresepan sulit ditegakkan sistem.
- **Tidak ada penanda perlu resep** yang terstandar, sehingga obat keras bisa terlewat dari validasi.
- **Penggolongan tidak konsisten** antar tempat input, menyulitkan pelaporan & audit compliance.

### 6.2 To-Be (Kondisi Yang Diharapkan)
- Golongan obat dikelola **terpusat** dengan **penanda perlu resep yang jelas** (Ya/Tidak).
- Sistem **otomatis menegakkan aturan** peresepan berdasarkan golongan obat.
- **Penambahan/perubahan** dilakukan via **CRUD manual** di satu tempat; Master Obat memilih golongan dari **dropdown master**.
- **Soft deactivate** (nonaktif) untuk golongan yang tidak lagi relevan, agar referensi historis tetap terjaga.

---

## 7. Main Flow / User Journeys

### 7.1 Alur CRUD Golongan Obat
1. Admin membuka menu **Control Panel → Master Data → Grup Obat**.
2. Sistem menampilkan **dashboard list golongan** aktif dengan atribut.
3. Admin **menambah/mengubah** entri: mengisi **Nama Golongan**, **Kode**, **Perlu Resep (Ya/Tidak)**.
4. Sistem memvalidasi keunikan **Kode**, lalu menyimpan entri dengan **status default Aktif**.
5. Perubahan **langsung berlaku** di dropdown modul Master Obat.

### 7.2 Alur Penggunaan di Master Obat & Modul Resep
1. Saat input data obat, Master Obat menampilkan **dropdown golongan aktif** dari master ini.
2. Saat dokter meresepkan obat, modul Resep membaca **penanda perlu resep** dari golongan obat.
3. **Jika perlu resep = Ya** → sistem menegakkan validasi resep; **jika tidak = Tidak** → obat bisa dijual bebas.
4. Golongan yang tidak dipakai cukup **dinonaktifkan** (soft deactivate), tidak dihapus permanen.

---

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
| 1 | Dashboard - Grup Obat | Sebagai admin, saya ingin melihat daftar golongan obat beserta atribut penanda perlu resep & status, agar mudah dikelola. | Klik menu Master Data → Grup Obat menampilkan halaman Dashboard. Tabel menampilkan kolom: Nama Golongan, Kode, Perlu Resep (Ya/Tidak), Status. Urutan default berdasarkan Nama Ascending; dapat diatur Asc/Desc. Kolom Pencarian (Nama, Kode). Pagination 10/20/50 data per halaman. Tiap baris ada tombol: Detail, Edit, Aktif/Nonaktif, Hapus. Tombol ➕ untuk menambah data baru. | **P0** | Seluruh golongan tampil dengan atribut penanda & status; operasi tersedia tiap baris. |
| 2 | Tambah (Create) | Sebagai admin, saya ingin menambah golongan obat baru beserta atribut penandanya sesuai regulasi. | Klik ➕ menampilkan form Tambah (overlay). Field: Nama Golongan, Kode, Perlu Resep. Validasi: Nama & Kode wajib unik; Perlu Resep toggle Ya/Tidak. Status default = Aktif. | **P0** | Golongan tersimpan; kode unik tervalidasi; langsung tersedia sebagai dropdown di Master Obat. |
| 3 | Ubah (Update) | Sebagai admin, saya ingin mengubah data golongan bila terjadi perubahan regulasi atau koreksi. | Klik Edit membuka form terisi data lama. Field Nama & Perlu Resep dapat diubah. Kode **dikunci** sebagai identitas (tidak boleh diubah). Validasi keunikan tetap berlaku saat menyimpan. | **P0** | Perubahan tersimpan & berlaku di seluruh modul yang merujuk (Master Obat, Modul Resep). |
| 4 | Detail | Sebagai admin, saya ingin melihat detail satu golongan lengkap dengan seluruh atributnya termasuk pemakaian. | Klik Detail menampilkan seluruh field & atribut (Nama, Kode, Perlu Resep, Status). Menampilkan jumlah obat/produk yang merujuk golongan ini (info pemakaian). Tampilkan dasar regulasi golongan (informasional). | **P1** | Seluruh atribut golongan tampil lengkap & akurat; info pemakaian akurat. |
| 5 | Hapus Bersyarat | Sebagai admin, saya ingin menghapus golongan yang salah atau tidak terpakai tanpa merusak data obat historis. | **Hapus permanen** hanya jika golongan **belum pernah** dipakai obat manapun. Jika sudah dipakai (ada referensi di Master Obat), sistem **menolak hapus** dan menyarankan untuk **nonaktifkan** saja. | **P0** | Golongan terpakai tidak bisa dihapus; sistem memberikan pesan error & saran nonaktif. |
| 6 | Aktif / Nonaktif (Soft Deactivate) | Sebagai admin, saya ingin menonaktifkan golongan yang tidak relevan tanpa menghapus data historisnya. | Toggle **Aktif/Nonaktif** tersedia di tiap baris list & form Edit. **Nonaktif**: golongan TIDAK muncul di dropdown Master Obat & Modul Resep saat entry baru; data obat historis tetap utuh & dapat ditampilkan. Perubahan status tercatat dengan timestamp & user yang mengubah. | **P1** | Golongan nonaktif tidak muncul di dropdown baru; data obat lama yang merujuk tetap valid & tampil. |
| 7 | Pencarian & Filter | Sebagai admin, saya ingin mencari & memfilter golongan berdasarkan atribut. | Filter: Status (Aktif/Nonaktif), Perlu Resep (Ya/Tidak). Pencarian: Nama Golongan, Kode. Hasil real-time atau on-click search icon. | **P1** | Hasil sesuai kata kunci & filter yang dipilih; loading ≤ 3 detik. |
| 8 | Penyediaan Dropdown ke Master Obat | Sebagai sistem, saya ingin menyediakan daftar golongan aktif sebagai sumber dropdown pada Master Obat/Farmasi. | Endpoint internal: ambil golongan aktif (status = Aktif). Saat obat memilih golongan, atribut **penanda perlu resep** ikut terbawa sebagai acuan aturan modul Resep. Hasil terurut berdasarkan Nama Ascending. | **P1** | Dropdown menampilkan golongan aktif saja; relasi obat-golongan tersimpan dengan benar; atribut penanda terbawa. |
| 9 | Audit Log | Sebagai sistem, setiap perubahan CRUD golongan harus tercatat untuk keperluan compliance & audit. | Setiap operasi CRUD (Tambah/Ubah/Nonaktif/Hapus) dicatat: waktu, user, aksi, objek (Nama Golongan), perubahan (before→after). Log bersifat immutable (tidak bisa dihapus). Admin dapat melihat history audit melalui menu Audit Log (Phase 2). | **P1** | Seluruh operasi tercatat di audit log dengan detail akurat; immutable. |

---

## 9. Data Requirements (Spesifikasi Field)

### 9.1 Form Tambah/Edit Golongan Obat — Data Umum (INPUT)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_golongan | Nama Golongan | text | Ya | unik, maks 100 char | manual | Contoh: Obat Bebas, Obat Keras, Narkotika |
| kode_golongan | Kode | text | Ya | unik, maks 20 char, alfanumerik | manual | Identitas internal (mis. OB, OK, PSI, NAR) |
| perlu_resep | Perlu Resep | toggle/dropdown | Ya | Ya / Tidak | enum | Menentukan aturan peresepan otomatis |
| dasar_regulasi | Dasar Regulasi | text | Tidak | maks 255 char | manual | Informasional (mis. Permenkes 917/949, UU 35/2009) |

### 9.2 Dashboard / List Golongan Obat (TAMPIL)

#### 9.2.1 Filter & Search
| Elemen | Tipe | Fungsi | Catatan |
|--------|------|--------|---------|
| Filter Status | dropdown | Filter list berdasarkan status (Aktif/Nonaktif) | optional; "Pilih Status" |
| Filter Perlu Resep | dropdown | Filter list berdasarkan perlu_resep (Ya/Tidak) | optional |
| Cari Golongan | text input + search icon | search by nama_golongan, kode_golongan | real-time atau on-click search icon |
| Refresh | icon button | reload data list | |

#### 9.2.2 Kolom Tabel List
| Kolom | Sumber Data | Format Tampilan | Sort | Filter | Catatan |
|-------|-------------|-----------------|------|--------|---------|
| Nama Golongan | master_golongan.nama_golongan | text | Ya (A-Z) | search | |
| Kode | master_golongan.kode_golongan | text | Tidak | search | |
| Perlu Resep | master_golongan.perlu_resep | badge (Ya/Tidak) | Tidak | Ya (dropdown) | Ya = red, Tidak = green |
| Status | master_golongan.status | toggle + badge (Aktif/Nonaktif) | Tidak | Ya | Aktif = green, Nonaktif = gray |
| Aksi | – | button EDIT (biru) + toggle Aktif/Nonaktif + HAPUS (merah) | Tidak | Tidak | row action; ikon/text button |

#### 9.2.3 Pagination & Summary
| Elemen | Fungsi | Catatan |
|--------|--------|---------|
| Total Golongan Aktif | Menampilkan count data aktif | ringkasan di atas/bawah tabel (optional) |
| Pagination | navigasi halaman (1, 2, 3, ... ) | default page size = 10 rows; next/prev arrows |
| Total Records | "Menampilkan X dari Y golongan" | optional di bawah tabel |

### 9.3 Audit Log (TAMPIL)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit_log.timestamp | tanggal+jam | sort desc | |
| User | audit_log.user | text | filter | |
| Aksi | audit_log.action | badge (Tambah/Edit/Hapus/Nonaktif) | filter | |
| Objek | audit_log.nama_golongan | text | search | |
| Perubahan | audit_log.diff | before → after | – | ringkas field berubah |

---

## 10. Non-Functional Requirements

- **NFR-001 (Performa)** — Pencarian/filter golongan menghasilkan ≤ **3 detik** untuk dataset RS (≤ ±12-20 golongan). *(Metric 5)*
- **NFR-002 (Ketersediaan/Offline)** — Master data golongan perlu dapat di-*cache* lokal agar Master Obat & modul lain tetap berjalan saat internet tidak stabil. Daftar golongan Phase 1 di-seed awal & dapat di-cache sehingga **tidak bergantung koneksi** saat input di modul konsumen. [ASUMSI — kendala infrastruktur tipe C&D]
- **NFR-003 (Keamanan/RBAC)** — Akses tambah/edit/hapus/nonaktif dibatasi role (mis. Admin Master Data / Kepala Lab) sesuai modul A53 RBAC; user umum hanya baca.
- **NFR-004 (Auditability)** — Seluruh perubahan (CRUD) tercatat & tidak dapat dihapus (immutable log).
- **NFR-005 (Integritas Data)** — Golongan yang sudah dipakai (ada referensi di Master Obat) **tidak boleh hard-delete**, hanya nonaktif (soft deactivate).
- **NFR-006 (Compliance)** — Semua 12 golongan dasar + 1 fallback sesuai regulasi Indonesia harus tersedia & ditandai dengan benar pada seed awal.
- **NFR-007 (Usability)** — Form mendukung pengisian field tanpa reload; dropdown "Perlu Resep" UI yang intuitif (toggle atau radio button).
- **NFR-009 (Maintainability seed Golongan)** — Daftar golongan seed awal harus terisolasi (mis. satu file konstanta/konfigurasi) agar update regulasi & perubahan golongan di masa depan mudah & terlacak. [ASUMSI implementasi]

---

## 11. Integrasi Eksternal

| Integrasi | Arah | Data | Catatan |
|-----------|------|------|---------|
| **Master Data Obat / Farmasi (A24)** | Konsumsi (hilir) | Dropdown golongan aktif saat entry obat baru | Master ini menyediakan source dropdown untuk Master Obat. Atribut "perlu resep" ditampilkan sebagai informasi di form Master Obat. |
| **Modul Resep & Peresepan** | Konsumsi (hilir) | Atribut "perlu resep" per golongan untuk validasi peresepan otomatis | Modul membaca penanda perlu resep → mengizinkan/menolak resep obat. |
| **Modul Farmasi / Counter Obat** | Konsumsi (hilir) | Golongan obat untuk aturan penjualan & informasi counter | Informasi golongan ditampilkan untuk validasi penjualan di counter. |
| **Modul Pelaporan / Audit Compliance** | Sediakan (hilir) | Referensi golongan untuk audit distribusi & peresepan | Single source of truth untuk semua pelaporan terkait penggolongan obat. |

> **Catatan Interoperabilitas**: pastikan setiap golongan obat yang perlu diatur regulasinya memiliki penanda "perlu resep" yang jelas. Atribut ini adalah **single source of truth** untuk semua aturan peresepan, penjualan, dan pelaporan di seluruh sistem. Perubahan penanda di master ini langsung terpropagasi ke semua modul konsumen.

---

## Asumsi

- [ASUMSI] Aktor pengelola = Petugas Lab / Admin Master Data; konsumen hilir = Master Obat, Modul Resep, Modul Farmasi, Modul Pelaporan.
- [KEPUTUSAN] Seed awal: **12 golongan + 1 fallback** (Tanpa Golongan) sesuai regulasi Indonesia ditambahkan pada inisialisasi sistem (Phase 1).
- [KEPUTUSAN] Field **Kode** dikunci setelah entry pertama (tidak dapat diubah) untuk menjaga konsistensi referensi.
- [KEPUTUSAN] **Soft deactivate** untuk golongan yang tidak lagi dipakai, agar referensi historis tetap terjaga dan audit trail lengkap.
- [ASUMSI] Kendala infrastruktur RS tipe C&D → master data perlu cache lokal/offline (NFR-002); dropdown golongan dapat di-seed & di-cache mengurangi ketergantungan koneksi.
- [ASUMSI] Field kanonik status, created_at, updated_at, created_by, updated_by mengikuti definisi bersama lintas-PRD tanpa redefinisi.
- [ASUMSI] Penegakan aturan peresepan otomatis (flagging non-compliance) adalah tanggung jawab modul Resep, bukan modul ini (modul ini hanya menyediakan atribut).
- [ASUMSI] Impor/ekspor data golongan (.xlsx/.csv) ditunda ke Phase 2.

---

## Lampiran: Usulan Seed Golongan Obat

### Tabel Seed Data Golongan

| No | Golongan | Kode | Perlu Resep | Dasar Regulasi |
|----|----------|------|-------------|----------------|
| 1 | Obat Bebas | OB | Tidak | Permenkes 917/949 |
| 2 | Obat Bebas Terbatas | OBT | Tidak | Permenkes 917/949 |
| 3 | Obat Wajib Apotek (OWA) | OWA | Tidak | Diserahkan apoteker |
| 4 | Obat Keras | OK | Ya | Daftar G, Permenkes 917/949 |
| 5 | Psikotropika | PSI | Ya | UU 5/1997 |
| 6 | Narkotika | NAR | Ya | UU 35/2009 |
| 7 | Prekursor Farmasi | PF | Ya | Pengawasan BPOM |
| 8 | Obat-Obat Tertentu (OOT) | OOT | Ya | Pengawasan BPOM |
| 9 | Jamu | JAM | Tidak | Obat bahan alam |
| 10 | Obat Herbal Terstandar (OHT) | OHT | Tidak | Obat bahan alam terstandar |
| 11 | Fitofarmaka | FITO | Tidak | Obat bahan alam teruji klinis |
| 12 | Suplemen Kesehatan | SUP | Tidak | Peraturan BPOM |
| 13 | Tanpa Golongan | TG | Tidak | Fallback untuk produk belum terklasifikasi |

### Dasar Peraturan Penggolongan Obat

- **UU No. 17 Tahun 2023 tentang Kesehatan (Pasal 320)**: Kerangka obat dengan resep vs. tanpa resep dokter.

- **Permenkes No. 917/Menkes/Per/X/1993 jo. No. 949/Menkes/Per/VI/2000**: Penggolongan obat menjadi kategori Bebas, Bebas Terbatas, OWA, Keras, Psikotropika, Narkotika.

- **UU No. 35 Tahun 2009 tentang Narkotika**: Golongan narkotika (I, II, III) & pengawasan ketat.

- **UU No. 5 Tahun 1997 tentang Psikotropika**: Golongan psikotropika (I, II, III, IV) & pengawasan ketat.

- **Peraturan BPOM tentang Prekursor Farmasi & Obat-Obat Tertentu (OOT)**: Pengawasan distribusi & pelaporan khusus.

- **Keputusan Kepala BPOM tentang Obat Bahan Alam**: Klasifikasi Jamu, OHT (Obat Herbal Terstandar), Fitofarmaka, dan Suplemen Kesehatan.

**Catatan:** OWA secara hukum termasuk Obat Keras yang boleh diserahkan apoteker tanpa resep dalam jumlah terbatas sesuai Permenkes.

---

## Pertanyaan Terbuka

- [PERLU KONFIRMASI] Apakah ada golongan obat lain di luar 12+1 yang perlu ditambahkan sesuai evolusi regulasi terbaru?
- [PHASE 2] Format & kolom pasti template impor/ekspor (.xlsx/.csv) untuk update massal golongan — impor/ekspor ditunda ke Phase 2.
- [PERLU KONFIRMASI] Bagaimana mekanisme update daftar golongan bila ada perubahan regulasi (frekuensi update, proses rilis)?
- [PERLU KONFIRMASI] Apakah ada kebutuhan untuk menampilkan **sub-klasifikasi narkotika/psikotropika** (Gol. I/II/III/IV) di modul ini, atau ditangani master terpisah di Phase 2?
