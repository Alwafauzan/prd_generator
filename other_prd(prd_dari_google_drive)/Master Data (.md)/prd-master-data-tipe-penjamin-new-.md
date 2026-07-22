# PRD — Master Data: Tipe Penjamin (New)

**Related Document:** Design Figma; Template Import Master Data Tipe Penjamin; Template Ekspor Master Data Tipe Penjamin; PRD_Master_Data_Tipe_Penjamin.docx (v1.0)
**Versi:** 1.3 - Pengembangan: konfirmasi usulan — singkatan kode kategori final (UMUM/BPJS/ASPEM/ASWAS), Kategori read-only setelah dibuat (DIKONFIRMASI), keunikan Nama bersifat global lintas-kategori (DIKONFIRMASI), Alamat/Email/No. Telepon bersifat opsional (DIKONFIRMASI). Mewarisi v1.2 (kategori fixed, prefix tetap 'PENJAMIN', penomoran kode per-kategori PENJAMIN-<KAT>-XXXX, BPJS dapat dinonaktifkan bila belum bridging).

## 1. Overview / Brief Summary

Dalam operasional Rumah Sakit (RS) Tipe C & D, setiap transaksi pelayanan pasien memiliki **pihak penjamin (pembayar)** yang menanggung biaya. **Tipe Penjamin** adalah klasifikasi yang mengelompokkan penjamin berdasarkan kategori pembayaran, yaitu **Umum/Pribadi, BPJS, Asuransi Pemerintah, dan Asuransi Swasta** — daftar kategori ini bersifat **baku/fixed** (tidak dapat ditambah/diubah oleh user RS).

Modul **Master Data — Tipe Penjamin** (kode fitur **A20**, cluster **Control Panel**) berfungsi sebagai **pusat pengelolaan klasifikasi penjamin** yang dipakai pada proses Pendaftaran/Admisi pasien, Penagihan (Kasir/Billing), serta pencatatan Keuangan (rekap pendapatan per kategori pembayar).

Setiap tipe penjamin memiliki **kode unik yang dibuat otomatis oleh sistem** sebagai identitas referensi lintas-modul. Prefix kode bersifat **tetap `PENJAMIN`** (literal, tidak dapat dikonfigurasi per RS) dan **penomoran berjalan per kategori** sehingga format kode menjadi `PENJAMIN-<KATEGORI>-<XXXX>` (mis. `PENJAMIN-UMUM-0001`, `PENJAMIN-BPJS-0001`). Singkatan kode kategori sudah **final/baku**: Umum/Pribadi→`UMUM`, BPJS→`BPJS`, Asuransi Pemerintah→`ASPEM`, Asuransi Swasta→`ASWAS` (BR-015). Setiap kategori memiliki urutan nomornya sendiri yang dimulai dari `0001`.

Dengan pengelolaan terpusat, sistem memastikan keakuratan pengelompokan data penjamin serta mempermudah rekapitulasi pendapatan per kategori pembayar. Modul ini menjadi **single source of truth** klasifikasi penjamin di Neurovi.

> Sumber utama: **Lampiran `PRD_Master_Data_Tipe_Penjamin.docx`** + instruksi pengembangan v1.2/v1.3. Keputusan yang sudah **dikonfirmasi user** (v1.3): singkatan kode kategori final, **Kategori read-only setelah dibuat**, **keunikan Nama bersifat global** lintas-kategori, dan **Alamat/Email/No. Telepon bersifat opsional**. Bagian yang ditafsirkan/diturunkan dari analogi BPMN ditandai `[ASUMSI]`.

## 2. Background

Sebelum modul ini, klasifikasi penjamin di masing-masing modul (Pendaftaran, Kasir, Keuangan) dikelola **terpisah**. Akibatnya:

1. Terjadi **duplikasi & inkonsistensi** tipe penjamin antar modul.
2. **Sulit melakukan rekapitulasi** pendapatan per kategori pembayar.
3. **Tidak ada kode referensi terstandar** untuk tiap tipe penjamin, sehingga modul konsumen sulit menautkan data secara konsisten.
4. Integrasi dengan modul Penjaminan & Keuangan menjadi rumit karena tidak ada referensi terstandar.

Khusus konteks **RS Tipe C & D**: SDM IT terbatas dan banyak proses semi-manual, sehingga master data yang terstandar dan dapat dikelola sendiri oleh Admin RS (tanpa bantuan tim teknis) sangat penting untuk menekan kesalahan input pada pendaftaran dan billing.

Modul **Tipe Penjamin** dikembangkan sebagai **sumber kebenaran tunggal** klasifikasi penjamin di sistem Neurovi, mendukung pendaftaran yang akurat dan billing yang benar. Penomoran kode dibuat otomatis **per kategori** oleh sistem agar tidak bergantung pada disiplin penomoran manual petugas, sekaligus memudahkan identifikasi kategori langsung dari kode.

> Catatan scope: **pemetaan akun keuangan (COA) per tipe penjamin TIDAK ditangani** pada modul ini (lihat Out Scope). Konsistensi jurnal keuangan tetap menjadi domain modul Konfigurasi Jurnal Otomatis (A50).

## 3. In Scope

### Scope Definition

| No | Phase | Scope / Area |
|----|-------|--------------|
| 1 | Phase 1 | Dashboard — Master Data Tipe Penjamin (list, search, sort, pagination, detail) |
| 2 | Phase 1 | Tambah Data Tipe Penjamin (**kode auto-generate per kategori** `PENJAMIN-<KAT>-<XXXX>`) |
| 3 | Phase 1 | Update Data Tipe Penjamin (kode read-only & **kategori read-only**, tidak dapat diubah) |
| 4 | Phase 1 | Aktif/Nonaktifkan Tipe Penjamin (termasuk **kontrol khusus nonaktif BPJS bila belum bridging**) |
| 5 | Phase 2 | Impor & Ekspor Data Tipe Penjamin (template CSV/XLSX) |

### Out Scope

| No | Scope (TIDAK dikerjakan) |
|----|--------------------------|
| 1 | Penetapan **tarif atau plafon** per penjamin |
| 2 | Pengelolaan data **Penjamin individual** (mis. daftar perusahaan/asuransi spesifik) — itu domain modul Master Data Penjamin / Instansi Rekanan (A8) [ASUMSI] |
| 3 | **Pemetaan COA (Chart of Account) per tipe penjamin & aturan Jurnal Otomatis** — TIDAK diakomodir pada fitur ini; sepenuhnya domain A50 Konfigurasi Jurnal Otomatis |
| 4 | **Proses bridging BPJS (VClaim/SEP) itu sendiri** — domain Pendaftaran/Admisi. Modul ini hanya **membaca status bridging** sebagai prasyarat penonaktifan tipe BPJS (lihat BR-012) [ASUMSI] |
| 5 | Penambahan/penghapusan **nilai kategori** — kategori bersifat fixed/baku, bukan data yang dikelola user (BR-009) |
| 6 | **Perpindahan/ubah Kategori** setelah data dibuat — Kategori dikunci read-only (BR-014, dikonfirmasi v1.3) |

## 4. Goals and Metrics

### Goals
1. Menyediakan pusat pengelolaan klasifikasi penjamin yang terstandar untuk seluruh proses pelayanan & keuangan.
2. Memastikan setiap proses pendaftaran & penagihan mengacu pada tipe penjamin yang sama melalui **kode referensi unik per kategori**.
3. Mempermudah rekapitulasi, evaluasi, dan audit pendapatan berdasarkan kategori pembayar.
4. Menjamin **keunikan & konsistensi kode** tipe penjamin tanpa bergantung pada penomoran manual.
5. **Mencegah penonaktifan tipe penjamin BPJS yang masih dipakai bridging** demi integritas alur SEP.
6. Meningkatkan efisiensi & akurasi pengelolaan data penjamin antar modul.

### Metrics

| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Konsistensi data antar modul | 100% modul menggunakan referensi tipe penjamin (kode) yang sama |
| 2 | Kemandirian user non-teknis | 100% user Admin RS mampu melakukan setup tanpa bantuan tim teknis |
| 3 | Kecepatan update konfigurasi | 100% perubahan data terbaca real-time tanpa restart sistem |
| 4 | Pencarian tipe penjamin | Waktu pencarian data tipe penjamin **< 3 detik** |
| 5 | Keunikan kode | 0% duplikasi kode dalam satu kategori; sistem tetap menghasilkan kode unik meski penomoran 4 digit per kategori telah penuh (auto-melebar) |
| 6 | Integritas bridging BPJS | 0% tipe penjamin BPJS yang masih bridging berhasil dinonaktifkan |
| 7 | Keunikan Nama (global) | 0% duplikasi Nama tipe penjamin lintas seluruh kategori (BR-001) |

## 5. Related Feature

### Konsumen data (dari Lampiran)

| No | Module | Feature |
|----|--------|---------|
| 1 | Pendaftaran / Admisi | Pemilihan Penjamin Pasien saat registrasi (RJ/RI/IGD) |
| 2 | Kasir / Billing | Penentuan metode pembayaran & penagihan |
| 3 | Keuangan | Rekap pendapatan per tipe penjamin |

### Fitur terkait dalam cluster Control Panel (List Fitur MVP)

| Code | Menu | Relasi |
|------|------|--------|
| **A20** | Master Data > Tipe Penjamin (New) | **Modul ini** |
| A8 | Master Data > Instansi Rekanan | Penjamin tipe Asuransi/Perusahaan mengacu ke Tipe Penjamin |
| A19 | Master Data > Instalasi (New) | Pola CRUD master data sejenis |
| A50 | Admin > Konfigurasi Jurnal Otomatis | Konsumen referensi kode tipe penjamin untuk rekap pendapatan (**pemetaan COA dikelola di A50, bukan di modul ini**) |
| A53 | Admin > RBAC | Menentukan role yang boleh mengelola master ini |

### Traceability ke proses Admisi (analogi BPMN)
- `g-admisi-emergency-registration` — gateway **"Jenis Penjamin?"** & activity **"Input Data Asuransi"** → membuktikan Tipe Penjamin dipakai sebagai dropdown referensi di pendaftaran. [ASUMSI]
- `g-admisi-inpatient-registration` — gateway **"Pasien BPJS?"** → percabangan billing bergantung pada tipe penjamin; jalur ini juga sumber **status bridging** yang dibaca modul ini untuk kontrol penonaktifan BPJS.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Background]
1. Tiap modul (Pendaftaran, Kasir, Keuangan) menyimpan daftar tipe penjamin sendiri-sendiri.
2. Petugas memilih/mengetik tipe penjamin secara manual → rawan salah ketik & duplikasi.
3. Tidak ada kode standar; penomoran (jika ada) diisi manual dan tidak terjamin unik.
4. Saat rekap pendapatan, keuangan harus menyamakan label antar modul secara manual.

### B. To-Be (kondisi diharapkan — dari Lampiran + instruksi pengembangan)
**1) Pengelolaan Data Terpusat**
- User **Admin RS / Configuration Manager** mengakses menu Master Data → Tipe Penjamin.
- User dapat **menambah, mengedit, menonaktifkan** data tipe penjamin.
- Tiap tipe penjamin memiliki atribut dasar: **Kode (auto, per kategori)**, Nama, Kategori, Alamat (opsional), Kontak (opsional), Status.
- **Kode dibuat otomatis** oleh sistem dengan format `PENJAMIN-<KATEGORI>-<XXXX>` saat data baru disimpan; bersifat read-only. Nomor urut **berjalan independen per kategori**.

**2) Kategori Terstandar (Fixed)**
- Kategori dibatasi pada nilai **baku & fixed**: **Umum/Pribadi, BPJS, Asuransi Pemerintah, Asuransi Swasta**. User RS **tidak dapat menambah/menghapus** kategori.
- Setelah data disimpan, **Kategori dikunci (read-only)** dan tidak dapat dipindah agar kode tetap konsisten dengan kategorinya (dikonfirmasi v1.3, BR-014).

**3) Integrasi dengan Penjamin & Transaksi**
- Tipe penjamin **aktif** dapat dipilih di modul Master Data Penjamin dan saat pendaftaran pasien.
- Data dipakai untuk pengelompokan pendapatan & validasi pada penagihan.

**4) Validasi & Kontrol Data**
- Sistem memvalidasi **tidak ada duplikasi Nama** tipe penjamin **secara global** (lintas seluruh kategori) — dikonfirmasi v1.3 (BR-001).
- Sistem menjamin **keunikan kode per kategori** secara otomatis.
- **Field wajib**: Nama, Kategori, Status. **Field opsional**: Alamat, No. Telepon, Email, Keterangan (dikonfirmasi v1.3, BR-005).
- Status (Aktif/Nonaktif) mempengaruhi ketersediaan saat pendaftaran & penagihan.
- **Khusus kategori BPJS**: penonaktifan hanya diizinkan bila tipe penjamin tersebut **belum/tidak sedang bridging BPJS**.

**5) Audit Trail & Keamanan**
- Setiap perubahan (tambah, ubah, nonaktifkan) **terekam di audit trail**.
- Hanya role **Admin RS / Configuration Manager** yang dapat mengubah data.

### Flow ringkas (dari Lampiran)
`[Admin Master Data]` → Akses Menu Master Data – Tipe Penjamin → Pilih Kategori (fixed) + Input/Edit Data (Nama [wajib], Alamat/No. Telepon/Email [opsional]) → `[Sistem Neurovi]` Generate Kode otomatis **sesuai kategori** → Validasi Data (Nama unik global) & Simpan → Data terdistribusi otomatis ke Modul Pendaftaran, Kasir, dan Keuangan.

## 7. Main Flow / Mindmap

Aktor utama: **Admin Master Data / Admin RS / Configuration Manager** dan **Sistem Neurovi**.

### Skenario 1 — Lihat Dashboard
1. User membuka menu **Master Data → Tipe Penjamin**.
2. Sistem menampilkan tabel data tersimpan (Kode, Nama, Kategori, No. Telepon, Email, Status), default sort **Nama Penjamin A→Z**.
3. User dapat mencari (Kode / Nama / Status), filter Kategori, sorting kolom, dan pindah halaman (pagination 10/20/50/100).
4. User klik **Detail** untuk melihat satu data, atau **➕** untuk tambah data.

### Skenario 2 — Tambah Data
1. User klik **➕ Tambah Data**.
2. Sistem menampilkan form (Nama [wajib], **Kategori** [dropdown fixed, wajib], Alamat [opsional], No. Telepon [opsional], Email [opsional], Status [wajib]). **Field Kode tidak diisi user** (otomatis).
3. User memilih Kategori & mengisi field wajib → klik **Simpan**.
4. **Gateway: Nama duplikat (global)?**
   - **Ya** → Sistem tampilkan error, data tidak tersimpan.
   - **Tidak** → Sistem **generate kode per kategori** `PENJAMIN-<KAT>-<XXXX>` (ambil nomor urut berikutnya **dalam kategori terpilih**, dilebarkan bila penuh), simpan, catat audit trail, tampilkan notifikasi sukses, data muncul di Dashboard.

### Skenario 3 — Update Data
1. Dari Detail, user klik **Edit** → ubah field (Kode **read-only**, **Kategori read-only**) → **Simpan**.
2. Sistem validasi duplikasi Nama **secara global** (kecuali data dirinya sendiri) → simpan → audit trail.
3. **Catatan**: Kategori **dikunci read-only setelah dibuat** (dikonfirmasi v1.3, BR-014) sehingga kode tidak pernah perlu di-generate ulang. Bila kelak ada kebutuhan pindah kategori, harus dibuat data baru (kode baru) dan data lama dinonaktifkan.

### Skenario 4 — Aktif/Nonaktifkan
1. User mengubah **Status** (Aktif ⇄ Nonaktif).
2. **Gateway: Kategori = BPJS?**
   - **Tidak** → lanjut ke langkah 3.
   - **Ya** → **Gateway: Sudah/sedang bridging BPJS?**
     - **Ya (sudah bridging)** → Sistem **menolak** penonaktifan, tampilkan pesan: *"Tipe penjamin BPJS sedang bridging dan tidak dapat dinonaktifkan."* (BR-012)
     - **Tidak (belum bridging)** → lanjut ke langkah 3.
3. **Gateway: Status = Nonaktif?**
   - **Ya** → tipe penjamin **tidak muncul** sebagai pilihan di Pendaftaran/Kasir (data lama tetap utuh), audit trail dicatat.
   - **Tidak** → tersedia kembali sebagai pilihan.

### Skenario 5 — Impor/Ekspor (Phase 2)
1. User unduh **Template Import**, isi (tanpa kolom Kode — kode tetap di-generate sistem; **Kategori wajib salah satu nilai baku**; Alamat/No. Telepon/Email opsional), unggah file (.csv/.xlsx), pilih **Mode** (tambah / tambah+update).
2. Sistem validasi baris (duplikasi Nama global, field wajib Nama/Kategori/Status, **kategori valid sesuai daftar fixed**) → tampilkan ringkasan berhasil/gagal → simpan yang valid (generate kode per kategori untuk baris baru).
3. **Ekspor**: user klik Export → sistem hasilkan file (termasuk kolom Kode) sesuai Template Export.

> Trigger awal & hasil akhir analogi event BPMN: "User membuka menu" (start) → "Data tipe penjamin tersimpan & terdistribusi" (end). [ASUMSI]

## 8. Business Rules

| ID | Business Rule | Sumber |
|----|---------------|--------|
| **BR-001** | **Nama** tipe penjamin tidak boleh duplikat **secara global / lintas seluruh kategori** (case-insensitive, trim). Dua kategori berbeda pun tidak boleh memiliki Nama yang sama. | Lampiran — Validasi & Kontrol; **dikonfirmasi v1.3 (unik global)** |
| **BR-002** | **Kode** tipe penjamin **dibuat otomatis oleh sistem** dengan format `PENJAMIN-<KATEGORI>-<XXXX>` di mana: prefix **selalu literal `PENJAMIN`** (tidak dapat dikonfigurasi), `<KATEGORI>` = kode singkat kategori (BR-015), `<XXXX>` = nomor urut **per kategori** (4 digit, zero-padded, mis. `PENJAMIN-UMUM-0001`). Kode bersifat **unik per kategori** dan **read-only**. | Instruksi pengembangan v1.2 |
| **BR-003** | Hanya tipe penjamin **berstatus Aktif** yang dapat dipilih di Pendaftaran, Master Penjamin, dan Kasir/Billing. | Lampiran — To-Be #2/#3 |
| **BR-004** | Menonaktifkan tipe penjamin **tidak menghapus** data; transaksi historis yang sudah memakainya tetap valid. | [ASUMSI] praktik master data |
| **BR-005** | **Field wajib** sebelum simpan: **Nama, Kategori, Status**. **Field opsional**: Alamat, No. Telepon, Email, Keterangan. | **Dikonfirmasi v1.3** (Alamat/Email/No. Telepon opsional) |
| **BR-006** | Setiap aksi tambah/ubah/nonaktif **wajib tercatat di audit trail** (user, waktu, perubahan). | Lampiran — Audit Trail |
| **BR-007** | Hanya role **Admin RS / Configuration Manager** yang boleh mengubah data; role lain read-only. | Lampiran — Keamanan; selaras A53 RBAC |
| **BR-008** | Perubahan data berlaku **real-time** tanpa restart sistem. | Lampiran — Metrics #3 |
| **BR-009** | **Kategori** tipe penjamin bersifat **fixed/baku** pada nilai: **Umum/Pribadi, BPJS, Asuransi Pemerintah, Asuransi Swasta**. User RS **tidak dapat menambah/menghapus/mengubah** daftar kategori; nilai di luar daftar ditolak. | Instruksi pengembangan v1.2 (kategori fixed) |
| **BR-010** | Penomoran kode **berjalan independen per kategori**, masing-masing dimulai dari `0001`. Bila urutan 4 digit (`9999`) suatu kategori penuh, digit **dilebarkan otomatis** (mis. `PENJAMIN-BPJS-10000`) tanpa mengubah kode lama, tetap menjaga keunikan & keterurutan dalam kategori tersebut. | Instruksi pengembangan v1.2 (per kategori) |
| **BR-011** | Kode tidak digunakan ulang (no reuse) **dalam kategorinya**: kode milik tipe penjamin yang dinonaktifkan tidak dialokasikan ke data baru pada kategori yang sama. | [ASUMSI] integritas referensi |
| **BR-012** | Tipe penjamin **Kategori = BPJS dapat dinonaktifkan HANYA bila belum/tidak sedang bridging BPJS**. Bila tipe penjamin BPJS sudah/sedang bridging (terkait penerbitan SEP via VClaim), sistem **menolak** penonaktifan dan menampilkan pesan kesalahan. | Instruksi pengembangan v1.2 |
| **BR-013** | Saat impor (Phase 2): baris dengan Nama duplikat **global** di-skip/ditolak sesuai Mode (tambah vs tambah+update); kolom Kode pada file diabaikan (kode di-generate sistem per kategori); baris dengan **kategori di luar daftar fixed ditolak**; Alamat/No. Telepon/Email boleh kosong (opsional). | Lampiran — Phase 2 |
| **BR-014** | **Kategori bersifat read-only setelah data dibuat** (tidak dapat diubah saat Edit) agar kode `PENJAMIN-<KAT>-<XXXX>` tetap konsisten dengan kategorinya. Tidak ada fitur pindah kategori; bila perlu, buat data baru & nonaktifkan data lama. | **Dikonfirmasi v1.3** (Kategori tetap read-only) |
| **BR-015** | Pemetaan **kode singkat kategori** (`<KATEGORI>` pada kode) mengikuti tabel baku **final**: Umum/Pribadi→`UMUM`, BPJS→`BPJS`, Asuransi Pemerintah→`ASPEM`, Asuransi Swasta→`ASWAS`. | **Dikonfirmasi v1.3** (sesuai usulan) |

## 9. User Stories

| ID | User Story | Prioritas | Traceability |
|----|-----------|-----------|--------------|
| **US-001** | Sebagai **Admin Master Data**, saya ingin **melihat Dashboard data Tipe Penjamin** (tabel, search, filter kategori, sort, pagination), agar data dapat terpantau dengan baik. | P0 | Lampiran Req#1; layar Dashboard |
| **US-002** | Sebagai **Admin Master Data**, saya ingin **menambahkan data Tipe Penjamin** baru dengan **kode yang otomatis dibuat sistem per kategori**, agar tidak perlu memikirkan penomoran manual dan kode terjamin unik. | P0 | Lampiran Req#2; BR-002/010 |
| **US-003** | Sebagai **Admin Master Data**, saya ingin **mengubah data Tipe Penjamin** existing (kode & **kategori tetap tidak berubah**), agar data selalu akurat tanpa merusak konsistensi kode. | P0 | Scope Phase 1; BR-002/014 |
| **US-004** | Sebagai **Admin Master Data**, saya ingin **mengaktifkan/menonaktifkan** Tipe Penjamin, agar pilihan yang tampil di modul lain hanya yang relevan. | P0 | Scope Phase 1; BR-003 |
| **US-005** | Sebagai **Admin Master Data**, saya ingin sistem **mencegah duplikasi Nama secara global** dan **menjamin keunikan kode per kategori**, agar tidak terjadi data ganda. | P0 | BR-001/002/010 |
| **US-006** | Sebagai **Admin Master Data**, saya ingin **memilih Kategori dari daftar baku yang fixed** (Umum/Pribadi, BPJS, Asuransi Pemerintah, Asuransi Swasta), agar pengelompokan konsisten dan tidak ada kategori liar. | P0 | BR-009 |
| **US-007** | Sebagai **Petugas Pendaftaran**, saya ingin **memilih Tipe Penjamin** dari daftar aktif saat registrasi, agar penagihan benar. | P0 | analogi `g-admisi-*` gateway "Jenis Penjamin?" |
| **US-008** | Sebagai **Manajemen/Keuangan**, saya ingin **rekap pendapatan per tipe penjamin** mengacu referensi kode yang sama, agar audit lebih mudah. | P1 | Related Feature #3 |
| **US-009** | Sebagai **Admin Master Data**, saya ingin **impor & ekspor** data Tipe Penjamin via template, agar setup massal lebih cepat. | P2 (Phase 2) | Scope Phase 2 |
| **US-010** | Sebagai **Admin RS**, saya ingin setiap perubahan **terekam di audit trail**, agar perubahan dapat ditelusuri. | P1 | BR-006 |
| **US-011** | Sebagai **Admin Master Data**, saya ingin sistem **mencegah penonaktifan tipe penjamin BPJS yang masih bridging** dan hanya mengizinkan nonaktif bila belum bridging, agar alur SEP tidak terputus. | P0 | BR-012 |
| **US-012** | Sebagai **Admin Master Data**, saya ingin dapat **mengisi data secara cepat dengan hanya field wajib** (Nama, Kategori, Status) dan **mengosongkan Alamat/No. Telepon/Email** bila belum tersedia, agar input tidak terhambat. | P1 | BR-005 |

## 10. Functional Requirements

| ID | Functional Requirement | Prioritas | Acceptance Criteria | Trace |
|----|------------------------|-----------|---------------------|-------|
| **FR-001** | Sistem menampilkan **Dashboard** Tipe Penjamin: kolom Nomor, **Kode**, Nama Penjamin, Kategori, No. Telepon, Email, Status. | P0 | Menampilkan kumpulan data tersimpan; kolom **Nama Penjamin** & **Status** dapat di-sort (Asc/Desc); default Nama A→Z; dapat **filter per Kategori**. | US-001 |
| **FR-002** | Sistem menyediakan **pencarian** berdasarkan Kode, Nama Penjamin & Status, serta filter Kategori. | P0 | Hasil sesuai keyword/filter < 3 detik. | US-001; Metrics#4 |
| **FR-003** | Sistem menyediakan **pagination** 10/20/50/100 data per halaman. | P0 | Navigasi antar halaman benar; jumlah baris sesuai pilihan. | US-001 |
| **FR-004** | Tiap baris memiliki tombol **Detail**; tersedia tombol **➕ Tambah Data**. | P0 | Klik Detail → halaman detail; klik ➕ → form tambah. | US-001/002 |
| **FR-005** | Sistem menyediakan **form Tambah Data**: **Nama (wajib)**, **Kategori [dropdown fixed] (wajib)**, **Status (wajib)**, serta Alamat, No. Telepon, Email **(opsional)**. **Kode tidak ditampilkan/diisi user** saat tambah. | P0 | Hanya field wajib (Nama/Kategori/Status) divalidasi keharusannya; Alamat/No. Telepon/Email boleh kosong; Kategori hanya menerima nilai baku; simpan sukses → kode ter-generate per kategori & data muncul di Dashboard. | US-002/006/012; BR-005 |
| **FR-006** | Sistem menyediakan **Edit Data** dengan validasi duplikasi Nama **global** (mengecualikan dirinya sendiri). **Field Kode read-only**; **Kategori read-only** setelah dibuat (BR-014). Alamat/No. Telepon/Email tetap opsional. | P0 | Perubahan tersimpan & real-time; kode & kategori tidak berubah; Nama duplikat global ditolak. | US-003; BR-001/002/008/014 |
| **FR-007** | Sistem menyediakan **toggle Status Aktif/Nonaktif**. Untuk **Kategori BPJS**, penonaktifan **divalidasi terhadap status bridging** (lihat FR-015). | P0 | Nonaktif → tidak muncul di pendaftaran/billing; data historis utuh; BPJS yang masih bridging tidak dapat nonaktif. | US-004/011; BR-003/004/012 |
| **FR-008** | Sistem **mencegah duplikasi Nama secara global** saat simpan (tambah & edit) dan **menjamin keunikan Kode per kategori** yang di-generate. | P0 | Nama duplikat (lintas kategori) → pesan error, data tidak tersimpan; kode dijamin unik dalam kategorinya. | US-005; BR-001/002/010 |
| **FR-009** | Sistem mencatat **audit trail** untuk tambah/ubah/nonaktif (user, timestamp, before/after), termasuk **penolakan nonaktif BPJS** karena bridging. | P1 | Log dapat ditelusuri. | US-010/011; BR-006/012 |
| **FR-010** | Sistem membatasi akses tulis ke role **Admin RS / Configuration Manager** (RBAC A53). | P1 | Role lain read-only. | BR-007 |
| **FR-011** | Sistem menyediakan daftar **Tipe Penjamin Aktif** (beserta kode) sebagai referensi (API/lookup) bagi modul Pendaftaran, Penjamin (A8), Kasir, Keuangan (A50). | P0 | Hanya status Aktif terekspos; update real-time. | US-007/008; BR-003 |
| **FR-012** | (Phase 2) Sistem menyediakan **Impor** (template .csv/.xlsx, mode tambah / tambah+update) & **Ekspor** data. Kolom Kode diabaikan saat impor (generate per kategori), disertakan saat ekspor; **kategori divalidasi terhadap daftar fixed**; Alamat/No. Telepon/Email boleh kosong. | P2 | Validasi baris (Nama unik global, kategori fixed); ringkasan berhasil/gagal; file ekspor sesuai template. | US-009; BR-013 |
| **FR-013** | Sistem **men-generate kode otomatis per kategori** berformat `PENJAMIN-<KATEGORI>-<XXXX>` saat data baru disimpan: tentukan kode singkat kategori (BR-015: UMUM/BPJS/ASPEM/ASWAS), ambil nomor urut berikutnya **dalam kategori tersebut**, zero-pad 4 digit; bila `9999` kategori itu penuh, **lebarkan digit** (5+) menjaga keunikan & keterurutan dalam kategori. | P0 | Data BPJS pertama → `PENJAMIN-BPJS-0001`; data Umum pertama → `PENJAMIN-UMUM-0001`; Asuransi Pemerintah → `PENJAMIN-ASPEM-0001`; Asuransi Swasta → `PENJAMIN-ASWAS-0001`; tidak ada duplikasi dalam satu kategori; setelah 9999 → `...-10000`. | US-002/005; BR-002/010/015 |
| **FR-014** | Field **Kategori** dibatasi pada enum **fixed** (Umum/Pribadi, BPJS, Asuransi Pemerintah, Asuransi Swasta) melalui dropdown; tidak ada UI untuk menambah kategori. Saat **Edit, dropdown Kategori dinonaktifkan (read-only)**. | P0 | Nilai di luar enum ditolak pada form & impor; tidak ada menu kelola kategori; Kategori tidak bisa diubah saat Edit. | US-006; BR-009/014 |
| **FR-015** | Sistem **memeriksa status bridging BPJS** sebelum menonaktifkan tipe penjamin Kategori BPJS: bila status = sudah/sedang bridging → tolak penonaktifan dengan pesan jelas; bila belum bridging → izinkan. Status bridging dibaca dari modul Pendaftaran/Admisi (VClaim/SEP). | P0 | Tipe BPJS bridging tidak dapat dinonaktifkan; tipe BPJS belum-bridging dapat dinonaktifkan; keputusan tercatat audit. | US-011; BR-012; [PERLU KONFIRMASI] sumber sinyal bridging |

## 11. Data Requirements (Spesifikasi Field)

Field kanonik **`status_aktif`** dan **`keterangan`** mengikuti definisi bersama lintas-PRD (status_aktif: boolean aktif/nonaktif default aktif; keterangan: text maks 255). `alamat`, `email`, `no_hp` juga mengacu definisi kanonik bila dipakai. **Catatan v1.3**: keunikan **Nama bersifat global** (lintas kategori); **Alamat/No. Telepon/Email bersifat opsional**; **Kategori read-only setelah dibuat**.

### A. Layar INPUT — Form Tambah/Edit Tipe Penjamin (FR-005, FR-006, FR-013, FR-014)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| id | ID (internal) | number | Ya | unik, auto | auto-generate | primary key internal, tidak ditampilkan |
| kode | Kode Tipe Penjamin | text | Ya (auto) | unik **per kategori**, format `PENJAMIN-<KAT>-<XXXX>` (≥4 digit, zero-pad, dapat melebar); `<KAT>`∈{UMUM,BPJS,ASPEM,ASWAS} | **auto-generate sistem per kategori** | **read-only**; BR-002/010/015; FR-013 |
| nama | Nama Penjamin | text | **Ya** | maks 100 char, **unik GLOBAL** (case-insensitive, lintas kategori) | manual | BR-001 (unik global, dikonfirmasi v1.3); selaras kanonik `nama` (maks 100) |
| kategori | Kategori | dropdown/enum | **Ya** | **fixed**: Umum/Pribadi, BPJS, Asuransi Pemerintah, Asuransi Swasta | enum (baku, fixed) | BR-009; FR-014; **read-only saat Edit** (BR-014, dikonfirmasi v1.3) |
| alamat | Alamat | text | **Tidak (opsional)** | maks 255 char | manual | field kanonik `alamat`; boleh kosong (BR-005) |
| no_telepon | No. Telepon | text | **Tidak (opsional)** | 10–15 digit (bila diisi) | manual | selaras kanonik `no_hp` (10–15 digit); boleh kosong (BR-005) |
| email | Email | text | **Tidak (opsional)** | format email valid (bila diisi) | manual | field kanonik `email`; boleh kosong (BR-005) |
| keterangan | Keterangan | text | Tidak (opsional) | maks 255 char | manual | field kanonik `keterangan` |
| status_aktif | Status | boolean | **Ya** | aktif / nonaktif | default **aktif** | field kanonik; BR-003; nonaktif BPJS tervalidasi bridging (FR-015) |

> Field **pemetaan COA / kategori akun keuangan DIHAPUS** dari form ini — tidak diakomodir modul Tipe Penjamin (lihat Out Scope #3, domain A50).

### A1. Field turunan/baca-saja terkait BPJS (FR-015) [PERLU KONFIRMASI sumber & nama field]

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| bridging_status | Status Bridging BPJS | enum (read-only) | – | belum_bridging / sudah_bridging | **integrasi/baca modul Pendaftaran (VClaim/SEP)** | hanya relevan Kategori=BPJS; jadi prasyarat penonaktifan (BR-012); [PERLU KONFIRMASI] definisi pasti "sudah bridging" |

### B. Layar INPUT — Impor Data (Phase 2, FR-012)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Tipe Penjamin | file | Ya | .csv/.xlsx, sesuai template (tanpa kolom Kode) | manual upload | selaras kanonik `file_import`; kode di-generate sistem per kategori |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | selaras kanonik `mode_import` |

> Pada file impor, kolom **Kategori wajib salah satu nilai fixed** (BR-009/013); baris di luar daftar ditolak. **Nama wajib & unik global**; kolom **Alamat/No. Telepon/Email boleh kosong** (opsional, BR-005).

### C. Layar TAMPIL — Dashboard Tipe Penjamin (FR-001)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nomor | urut baris / index | angka | – | nomor urut tampilan |
| Kode | tipe_penjamin.kode | text mono (`PENJAMIN-UMUM-0001`) | **search** | BR-002 |
| Nama Penjamin | tipe_penjamin.nama | text | **sort A-Z/Z-A** (default A-Z); **search** | BR-001 (unik global) |
| Kategori | tipe_penjamin.kategori | badge/text | **filter** (enum fixed) | BR-009 |
| No. Telepon | tipe_penjamin.no_telepon | text (kosong bila tak diisi) | – | opsional (BR-005) |
| Email | tipe_penjamin.email | text (kosong bila tak diisi) | – | opsional (BR-005) |
| Status | tipe_penjamin.status_aktif | badge (Aktif=hijau / Nonaktif=abu) | **sort & filter (search by Status)** | BR-003 |
| Aksi | – | tombol **Detail** | – | menuju halaman detail |
| (header) | – | tombol **➕ Tambah Data** | – | FR-004 |
| (footer) | – | pagination 10/20/50/100 | – | FR-003 |

### D. Layar TAMPIL — Detail Tipe Penjamin

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Kode | tipe_penjamin.kode | label : value read-only | – | tidak dapat diedit |
| Kategori | tipe_penjamin.kategori | label : value read-only | – | read-only setelah dibuat (BR-014) |
| Status Bridging (jika BPJS) | bridging_status | badge (belum/sudah bridging) | – | tampil hanya untuk Kategori=BPJS; menjelaskan apakah toggle nonaktif tersedia (FR-015) |
| Alamat / No. Telepon / Email | tipe_penjamin.* | label : value (tampil "-" bila kosong) | – | field opsional (BR-005) |
| Semua field form lain | tipe_penjamin.* | label : value read-only | – | tombol Edit & toggle Status |
| Riwayat Perubahan | audit_trail | tabel (user, waktu, aksi) | sort waktu desc | FR-009; BR-006 |

> Tiap field di atas tertaut ke FR-005/006/013 (form & generate kode per kategori), FR-001 (dashboard), FR-009 (audit), FR-015 (bridging BPJS). Field yang tidak pasti ditandai `[PERLU KONFIRMASI]` — tidak dikosongkan.

## 12. Non-Functional Requirements

| ID | Non-Functional Requirement | Target |
|----|----------------------------|--------|
| **NFR-001** | **Performa pencarian** Dashboard | Hasil tampil < **3 detik** (Metrics #4) |
| **NFR-002** | **Real-time** | Perubahan data langsung terbaca tanpa restart sistem (Metrics #3) |
| **NFR-003** | **Usability** untuk user non-teknis | 100% Admin RS dapat setup mandiri tanpa tim teknis (Metrics #2); form ringkas — cukup isi 3 field wajib (BR-005) |
| **NFR-004** | **Keamanan & RBAC** | Akses tulis hanya role Admin RS / Configuration Manager (A53); audit trail wajib |
| **NFR-005** | **Integritas data** | Constraint unik **Nama (global, lintas kategori)** & Kode (**unik per kategori**) di level DB; soft-delete (nonaktif), bukan hard-delete |
| **NFR-006** | **Generasi kode aman dari race condition** | Penomoran kode **per kategori** di-generate atomik (mis. sequence/lock per kategori) agar tidak duplikat saat input bersamaan; auto-melebar bila digit penuh (BR-010) |
| **NFR-007** | **Ketersediaan (RS Tipe C/D)** | Modul tetap dapat diakses pada infrastruktur sederhana; data master ringan & dapat di-cache lokal [ASUMSI] |
| **NFR-008** | **Auditability** | Log perubahan disimpan minimal sesuai kebijakan retensi RS [PERLU KONFIRMASI] |
| **NFR-009** | **Kompatibilitas import/export** | Template .csv/.xlsx, encoding UTF-8 (Phase 2) |
| **NFR-010** | **Keandalan validasi bridging BPJS** | Pengecekan status bridging sebelum nonaktif harus konsisten; bila sumber status bridging tidak terjangkau, sistem **fail-safe menolak** penonaktifan BPJS (default aman) [ASUMSI] |

## 13. Integrasi Eksternal

Modul ini bersifat **master data internal** — referensi (kode + kategori) yang dikonsumsi modul lain. Integrasi langsung ke pihak ketiga **minimal**, namun memengaruhi alur yang berintegrasi:

| Integrasi | Arah | Keterangan |
|-----------|------|------------|
| **Modul Pendaftaran/Admisi** (RJ/RI/IGD) | Internal — konsumen **&** sumber status bridging | Menyediakan daftar Tipe Penjamin **aktif** (kode + nama) sebagai dropdown saat registrasi (analogi gateway "Jenis Penjamin?" / "Pasien BPJS?"). **Sebaliknya, modul ini membaca status bridging BPJS** dari sini sebagai prasyarat penonaktifan tipe BPJS (FR-015/BR-012). [ASUMSI] |
| **Modul Kasir / Billing** | Internal — konsumen | Menentukan metode pembayaran & jalur penagihan berdasarkan tipe/kategori penjamin. |
| **Modul Keuangan / Jurnal Otomatis (A50)** | Internal — konsumen | Mengonsumsi **kode tipe penjamin** untuk rekap pendapatan. **Pemetaan COA sepenuhnya dikonfigurasi di A50**, BUKAN di modul ini (Out Scope #3). |
| **Master Penjamin / Instansi Rekanan (A8)** | Internal — konsumen | Penjamin individual mengacu ke Tipe Penjamin sebagai klasifikasi induk. |
| **BPJS (VClaim/SEP)** | Tidak langsung | Tipe penjamin kategori BPJS men-trigger jalur bridging SEP di modul Pendaftaran. **Status bridging** yang dihasilkan jalur ini menjadi acuan kontrol penonaktifan di modul ini, namun **proses bridging-nya bukan scope modul ini** (Out Scope #4). [ASUMSI] |
| **RBAC (A53)** | Internal | Penegakan hak akses tulis/baca. |

> Tidak ada panggilan API eksternal (BPJS/SATUSEHAT/Disdukcapil) **langsung** dari modul ini. Untuk kontrol nonaktif BPJS, modul membaca **status bridging** melalui modul Pendaftaran/Admisi (kontrak internal), bukan memanggil VClaim sendiri. [PERLU KONFIRMASI] bentuk kontrak/sinyal status bridging.

## Asumsi
- [DIKONFIRMASI v1.3] Singkatan kode kategori final: Umum/Pribadi→UMUM, BPJS→BPJS, Asuransi Pemerintah→ASPEM, Asuransi Swasta→ASWAS (BR-015).
- [DIKONFIRMASI v1.3] Kategori bersifat read-only setelah data tersimpan; tidak ada fitur pindah kategori (BR-014/FR-014).
- [DIKONFIRMASI v1.3] Keunikan Nama tipe penjamin bersifat global / lintas seluruh kategori (BR-001).
- [DIKONFIRMASI v1.3] Alamat, No. Telepon, dan Email bersifat opsional; hanya Nama, Kategori, dan Status yang wajib (BR-005).
- [ASUMSI] As-Is diturunkan dari Background lampiran karena tidak ada BPMN khusus modul ini.
- [ASUMSI] Kode di-generate sekali saat data baru dibuat dan tidak pernah berubah/digunakan ulang (no reuse) dalam kategorinya demi integritas referensi lintas-modul.
- [ASUMSI] Penomoran kode menggunakan satu sequence terpisah per kategori (bukan global); bila urutan 4 digit suatu kategori penuh, digit otomatis dilebarkan tanpa mengubah kode lama.
- [ASUMSI] Prefix kode selalu literal 'PENJAMIN' dan tidak dapat dikonfigurasi per RS (instruksi pengembangan).
- [ASUMSI] Kategori bersifat fixed/baku dan tidak ada UI untuk menambah/menghapus kategori (instruksi pengembangan).
- [ASUMSI] Tipe Penjamin dipakai sebagai dropdown referensi di Pendaftaran berdasarkan gateway 'Jenis Penjamin?' / 'Pasien BPJS?' pada BPMN admisi terkait.
- [ASUMSI] Status bridging BPJS dibaca dari modul Pendaftaran/Admisi melalui kontrak internal; modul ini tidak memanggil VClaim langsung.
- [ASUMSI] Bila sumber status bridging tidak terjangkau, sistem fail-safe menolak penonaktifan tipe BPJS (NFR-010).
- [ASUMSI] Menonaktifkan tipe penjamin bersifat soft-delete; transaksi historis tetap valid (praktik umum master data SIMRS).
- [ASUMSI] Role pengelola = Admin RS / Configuration Manager mengikuti definisi RBAC A53.
- [ASUMSI] Field status_aktif, keterangan, alamat, email, no_hp, file_import, mode_import mengikuti definisi kanonik lintas-PRD agar konsisten.
- [ASUMSI] Untuk RS Tipe C & D, data master ringan dan dapat di-cache lokal demi ketahanan terhadap internet tidak stabil.
- Pemetaan COA per tipe penjamin DIHAPUS dari scope modul ini sesuai instruksi pengembangan; pengelolaan COA sepenuhnya di modul Konfigurasi Jurnal Otomatis (A50).

## Pertanyaan Terbuka
- Definisi pasti 'sudah/sedang bridging BPJS' yang memblokir penonaktifan: apakah berarti VClaim sudah dikonfigurasi RS, ATAU tipe penjamin BPJS sudah pernah/aktif dipakai menerbitkan SEP? Bagaimana bentuk sinyal/kontrak datanya dari modul Pendaftaran? (FR-015/BR-012)
- Kebijakan retensi log audit trail untuk modul master data ini? (NFR-008)
- Apakah Phase 2 (Impor/Ekspor) memerlukan validasi referensial khusus (mis. mencegah nonaktif jika masih dipakai transaksi berjalan, selain aturan bridging BPJS)?
- Perilaku fail-safe NFR-010: bila sumber status bridging tidak terjangkau saat user mencoba nonaktif BPJS, apakah menolak (default aman) atau menampilkan konfirmasi manual?
- Karena Kategori dikunci read-only (BR-014 dikonfirmasi) dan tidak ada fitur pindah kategori — apakah perlu disediakan jalur 'duplikasi cepat' untuk membuat ulang data di kategori lain (Nama harus berbeda karena unik global)?