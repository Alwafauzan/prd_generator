# PRD — Master Data: Aturan Umum (New)

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, kode A24); pola acuan: Master Data ROA (Cara Pemberian Obat); Seeder Data Awal (Google Sheets) — **sumber final & terkunci**: https://docs.google.com/spreadsheets/d/1sYIR6uoVKFzI_74da4h426pLi8krC-itcu0qSEMhjy8/edit?usp=sharing; modul konsumen (referensi, detail di PRD masing-masing): E-Resep, Pelayanan Farmasi (RJ/RI/IGD), CPO; PRD master terkait: A18 Role, A37 Akses Menu
**Versi:** 4.0 - Finalisasi keputusan (seeder spreadsheet final, maks 10 alias/entri, audit hanya backend)

## 1. Overview / Brief Summary

Modul **Master Data — Aturan Umum** adalah menu di cluster **Control Panel** yang mengelola referensi **instruksi umum penggunaan obat** secara terpusat dan terstandarisasi. Yang dimaksud Aturan Umum adalah instruksi pemakaian yang bersifat umum, misalnya: **Sebelum Makan**, **Sesudah Makan**, **Bersama Makan**, **Sebelum Tidur**, **Bila Perlu**, **Pagi dan Malam**, dan instruksi sejenis.

Saat ini nilai aturan umum pada Neurovi Medical System terbentuk **otomatis dari input bebas pengguna** pada transaksi, sehingga muncul variasi penulisan dengan makna sama ("Sesudah Makan", "sesudah makan", "SESUDAH MAKAN") dan duplikasi yang tidak terkelola.

Melalui master data ini, **Administrator** dapat melakukan **tambah, ubah, dan hapus (soft delete)** serta mencari data. Tiap entri dapat memiliki **Alias / Istilah Lain** yang disimpan sebagai **banyak nilai (multi-value)** — 1 Aturan Umum dapat memiliki beberapa alias (**maksimal 10 alias per entri**, masing-masing maks 100 karakter) — agar pencarian & suggestion tetap menemukan data meski kata yang diketik berbeda (mis. cari "Sesudah Makan" tetap menampilkan entri utama "Setelah Makan"). Data yang tersedia menjadi **sumber referensi tunggal** yang **dapat digunakan** oleh modul lain — detail pemanfaatannya dibahas pada PRD modul masing-masing, bukan di sini.

> **Pola pengelolaan = Master Data ROA.** Modul ini mengikuti pola yang sama dengan Master Data ROA: penghapusan memakai **Soft Delete**, **tidak ada** fitur Restore/Pulihkan, **tidak ada** Hard Delete via aplikasi, dan **tidak ada** Toggle Aktif/Nonaktif. Status sebuah entri ditentukan murni oleh kolom `deleted_at` (Aktif = `deleted_at` kosong/NULL; Terhapus = `deleted_at` terisi). **Jejak audit (termasuk data terhapus) hanya disimpan & dapat diakses di backend** — tidak ada view data terhapus di UI aplikasi.

> **Catatan scope:** PRD ini **hanya** mengelola referensi instruksi umum. PRD ini **tidak** membahas signa, frekuensi, dosis, satuan, mapping sediaan, cara pemberian obat (ROA), struktur instruksi resep, etiket obat, pengaturan aturan pakai pada e-Resep, maupun terminologi/dosage instruction.

Sasaran pembaca: Manajemen RS (nilai standarisasi data), Developer (spesifikasi field & API), tim UI/UX (rancangan layar CRUD).

## 2. Background

**Masalah saat ini (As-Is):**
- Instruksi umum penggunaan obat (Sebelum/Sesudah Makan, dll.) **tidak punya master terpusat**; nilai lahir otomatis dari input transaksi (free text).
- Tanpa standarisasi/validasi → muncul **variasi penulisan** dengan makna sama (kapitalisasi, spasi, istilah berbeda seperti "Setelah Makan" vs "Sesudah Makan").
- Pengguna dapat menambah instruksi baru tanpa kontrol → jumlah referensi membengkak, **duplikat & inkonsisten**.
- Pencarian sulit karena istilah yang dikenal pengguna (alias) belum tentu sama dengan nilai tersimpan.
- Pelaporan/analitik sulit karena nilai tidak terkanonisasi.

**Mengapa modul ini perlu:**
- Menyediakan **satu sumber referensi instruksi umum** yang dikelola Administrator, bukan tumbuh liar dari transaksi.
- Standarisasi referensi → kualitas data input meningkat dan konsisten.
- **Alias / Istilah Lain (multi-value)** menjaga pengalaman pencarian & suggestion tetap baik meski pengguna memakai istilah berbeda.
- Mempermudah maintenance & menjadi acuan yang **dapat dipakai** modul lain.

**Konsistensi dengan ROA:** Pengelolaan dibuat **identik dengan Master Data ROA** (soft delete tanpa restore/hard delete/toggle aktif) untuk menjaga kesederhanaan dan keseragaman pola master data, sekaligus mengamankan kebutuhan historis & audit.

**Konteks RS Tipe C & D:** SDM IT terbatas → CRUD harus sederhana, tersedia **seeder data awal** agar tidak perlu input manual dari nol, dan tetap berfungsi pada infrastruktur sederhana. [ASUMSI]

## 3. In Scope

### Scope Definition (yang dikerjakan)
1. **Dashboard / List Data** — tabel Aturan Umum **aktif** (belum di-soft delete) dengan pencarian, sort, dan paginasi.
2. **Tambah Data** — form input Nama Aturan Umum + Alias (multi-value, maks 10 alias/entri), dengan validasi.
3. **Edit Data** — ubah Nama Aturan Umum & kelola Alias (tambah/hapus beberapa alias, hingga maks 10).
4. **Hapus Data (Soft Delete)** — penghapusan lunak mengikuti pola ROA; data historis tetap tersimpan di database untuk audit, namun tidak tampil di daftar aktif.
5. **Pencarian** — **substring matching** ke Nama maupun Alias (mencari "sesudah" menemukan "Sesudah Makan"; mencari alias "Sesudah Makan" menemukan entri utama "Setelah Makan").
6. **Validasi Duplikasi** — cegah entri ganda (nama maupun alias) secara case-insensitive + trim, **hanya terhadap data yang belum di-soft delete**.
7. **Seeder Data Awal** — penyediaan kumpulan data Aturan Umum standar saat inisialisasi sistem, **bersumber dari Link Mapping Seeder Data Awal (Google Sheets) yang sudah final** (lihat Skenario 5 & Lampiran Seeder).

### Out Scope (yang TIDAK dikerjakan)
- **Restore / Pulihkan Data** atas entri yang sudah di-soft delete — **tidak disediakan** (konsisten ROA).
- **Hard Delete** via aplikasi — **tidak disediakan**.
- **View / laporan data terhapus di UI aplikasi** — **tidak disediakan**; jejak audit data terhapus hanya tersedia di backend (lihat §12 & §8 BR-012).
- **Toggle Aktif / Nonaktif** dan field `status_aktif` — **dihapus**; status ditentukan oleh `deleted_at`.
- **Filter status Aktif/Nonaktif** — tidak ada (daftar default hanya menampilkan data aktif).
- **Fuzzy / typo-tolerant search** — tidak pada fase ini; cukup substring.
- **Signa** dan singkatannya, **Frekuensi**, **Dosis** & terminologi/dosage instruction, **Satuan** & mapping sediaan.
- **Cara pemberian obat (ROA)** → modul terpisah.
- **Struktur instruksi resep** dan **etiket obat**.
- **Pengaturan aturan pakai pada e-Resep** serta logika pemilihan instruksi saat transaksi.
- **Detail pemanfaatan** Aturan Umum pada modul konsumen (E-Resep, Farmasi, dll.) → dibahas di PRD modul masing-masing.
- Integrasi terminologi eksternal (SATUSEHAT/BPJS) untuk instruksi umum — tidak ada pada kode A24. [PERLU KONFIRMASI]

## 4. Goals and Metrics

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Standarisasi referensi instruksi umum | Tersedianya master Aturan Umum terkelola (bukan free text) | 100% nilai dikelola dari master |
| Hilangkan duplikasi | Jumlah entri aktif duplikat (nama/alias makna sama, beda tulisan) | 0 setelah seeder & normalisasi |
| Pencarian akurat lewat alias (substring) | % pencarian dengan istilah alias yang berhasil menemukan data target | ≥ 95% [ASUMSI] |
| Kemudahan pengelolaan | Waktu rata-rata admin menambah/mengubah 1 entri | < 1 menit [ASUMSI] |
| Integritas & audit data | % aksi hapus yang dijalankan sebagai soft delete (data tetap tersimpan) | 100% |
| Konsistensi pola master | Kesesuaian pola pengelolaan dengan Master Data ROA | Sama persis (soft delete tanpa restore/hard delete/toggle) |
| Kesiapan awal | Tersedianya seeder data Aturan Umum standar (final per spreadsheet) saat go-live | Tersedia & sesuai spreadsheet final |

**Catatan metrik:** angka target di atas [ASUMSI] dan perlu disepakati dengan manajemen/farmasi.

## 5. Related Feature

Fitur terkait dari List Fitur:

| Code | Menu | Hubungan |
|------|------|----------|
| **A24** | Control Panel > Master Data > Aturan Umum (New) | **Modul ini** |
| — | Master Data > ROA (Cara Pemberian Obat) | **Pola acuan** (soft delete, tanpa restore/hard delete/toggle aktif) |
| A18 | Master Data > Role | Hak akses CRUD master (RBAC) |
| A37 | Master Data > Akses Menu (New) | Pengaturan akses menu master |

**Modul konsumen (referensi saja):** Master Data Aturan Umum **dapat digunakan sebagai referensi** oleh modul lain seperti **E-Resep**, **Pelayanan Farmasi (RJ/RI/IGD)**, dan **CPO**. **Detail implementasi penggunaannya tidak dibahas dalam PRD ini** dan akan dijelaskan pada PRD modul masing-masing.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini)
1. Pengguna mengetik instruksi umum penggunaan obat secara bebas (free text) pada transaksi. [ASUMSI]
2. Sistem menyimpan nilai apa adanya dan menjadikannya opsi referensi berikutnya.
3. Tidak ada normalisasi/validasi → variasi penulisan & duplikat (mis. "Setelah Makan" vs "Sesudah Makan") terakumulasi.
4. Pencarian sulit karena istilah lain (alias) tidak dikenali.

```
Pengguna --(ketik bebas)--> Transaksi --(auto-collect)--> Daftar referensi tumbuh liar & duplikat
```

### B. To-Be (kondisi diharapkan)
1. **Administrator** mengelola Master Aturan Umum (Tambah/Ubah/Soft Delete) di Control Panel, mengikuti pola Master Data ROA.
2. Sistem **menormalisasi** input (trim + cek case-insensitive) dan **menolak duplikat** (nama & alias) saat simpan, **hanya terhadap data aktif** (yang belum di-soft delete).
3. Tiap entri dapat memiliki **beberapa Alias / Istilah Lain (multi-value, maks 10 per entri)** sehingga pencarian substring dengan istilah berbeda tetap menemukan data yang benar.
4. **Seeder** menyediakan data Aturan Umum standar sejak awal, **bersumber dari spreadsheet final**.
5. Penghapusan = **soft delete** (`deleted_at` diisi): entri hilang dari daftar aktif namun tetap di database untuk audit. **Tidak ada** Restore, **tidak ada** Hard Delete, **tidak ada** Toggle Aktif/Nonaktif, **tidak ada** view data terhapus di UI (audit hanya di backend).
6. Master Aturan Umum yang aktif **dapat digunakan** sebagai referensi oleh modul lain (mekanisme di PRD modul masing-masing).

```
Admin --(CRUD/Seeder, pola ROA)--> Master Aturan Umum (aktif=deleted_at NULL + alias multi-value ≤10) --(referensi)--> Modul lain (detail di PRD masing-masing)
```

[ASUMSI] Alur To-Be diturunkan dari pola Master Data ROA, karena modul A24 belum memiliki BPMN sendiri.

## 7. Main Flow / Mindmap

**Skenario 1 — Dashboard / List & Cari**
1. Admin buka Control Panel > Master Data > Aturan Umum.
2. Sistem menampilkan tabel data **aktif** (`deleted_at` NULL) berisi Nama Aturan Umum & daftar Alias. Data ter-soft-delete **tidak** ditampilkan.
3. Admin mengetik kata kunci → sistem melakukan **substring matching** ke Nama **dan** Alias (mencari "sesudah" menemukan "Sesudah Makan"; mencari "Sesudah Makan" pada alias menampilkan entri utama "Setelah Makan").

**Skenario 2 — Tambah Data**
1. Admin klik **Tambah** → form kosong tampil.
2. Admin isi **Nama Aturan Umum** (wajib) dan **Alias / Istilah Lain** (opsional, **bisa lebih dari satu, maksimal 10** — input multi-value/chip).
3. Admin klik **Simpan**.
4. *Gateway: Data valid & tidak duplikat terhadap data aktif?*
   - **Ya** → sistem normalisasi + simpan (nama + N alias, N≤10) → notifikasi sukses → kembali ke list.
   - **Tidak (duplikat nama/alias pada data aktif)** → tampilkan peringatan "Aturan umum/alias sudah ada" + sarankan data existing.
   - **Tidak (jumlah alias > 10)** → tampilkan pesan "Maksimal 10 alias per Aturan Umum".
   - **Tidak (validasi gagal)** → tampilkan pesan error per field.
   - *Catatan:* bila nama/alias yang sama sebelumnya sudah **di-soft delete**, admin **boleh** membuatnya kembali sebagai data baru (validasi duplikat tidak mempertimbangkan data terhapus).

**Skenario 3 — Edit Data**
1. Admin pilih baris → klik **Ubah** → form terisi (nama + daftar alias existing).
2. Admin ubah nama / tambah / hapus alias (total tetap ≤ 10) → **Simpan** → validasi sama seperti Tambah → update.

**Skenario 4 — Hapus Data (Soft Delete, pola ROA)**
1. Admin klik **Hapus** pada baris → konfirmasi.
2. Sistem mengisi `deleted_at` (+ `deleted_by`): entri menjadi **Terhapus**, hilang dari daftar aktif, **tetap tersimpan di database** untuk historis/audit.
3. **Tidak ada** opsi Restore/Pulihkan dan **tidak ada** Hard Delete via aplikasi. Data terhapus tidak dapat dikembalikan melalui UI dan **tidak ditampilkan** di UI mana pun; penelusuran hanya melalui backend (DBA/log).

**Skenario 5 — Seeder Data Awal**
1. Saat inisialisasi sistem, **seeder** mengisi master dengan kumpulan Aturan Umum standar.
2. **Sumber daftar final & terkunci = Link Mapping Seeder Data Awal (Google Sheets)** pada Related Document — telah dikonfirmasi **final & lengkap** oleh PO (tidak ada lagi item bertanda "dll" yang belum dituntaskan). Contoh isi (ilustratif, mengacu pada spreadsheet sebagai sumber kebenaran): Sebelum Makan, Sesudah Makan, Bersama Makan, Saat Makan, 30 Menit Sebelum Makan, 1 Jam Sebelum Makan, Pagi Hari, Siang Hari, Sore Hari, Malam Hari, Pagi dan Malam, Pagi/Siang/Malam, Sebelum Tidur, Bila Perlu, Saat Nyeri, Saat Demam.
3. Seeder bersifat idempoten (tidak menambah duplikat bila dijalankan ulang). [ASUMSI]

> **Catatan implementasi seeder:** Daftar lengkap & otoritatif diambil dari spreadsheet final. Bila spreadsheet diubah di kemudian hari, perubahan dianggap **change request** terpisah (versi seeder baru), bukan bagian rilis ini.

## 8. Business Rules

**Penamaan & normalisasi**
- **BR-001** **Nama Aturan Umum wajib unik** secara **case-insensitive + trim** ("Sesudah Makan" = "sesudah makan" = " SESUDAH MAKAN "). Maks 100 karakter. Duplikat ditolak saat simpan. *(traceability: To-Be lgk 2; Skenario 2; FR-003)*
- **BR-002** Saat simpan, sistem **menormalisasi** input: trim spasi awal/akhir & rapikan spasi internal. Kapitalisasi disimpan apa adanya, tetapi pengecekan duplikat tetap case-insensitive.

**Alias (multi-value)**
- **BR-003** **Alias / Istilah Lain** disimpan sebagai **banyak nilai** — 1 Aturan Umum dapat memiliki beberapa alias (bukan satu kolom teks dipisah koma). Alias dipakai untuk **pencarian & suggestion**. *(traceability: Skenario 1/2; FR-004)*
- **BR-004** Sebuah **alias tidak boleh sama dengan Nama Aturan Umum entri lain** (cek case-insensitive + trim). *(FR-003/FR-004)*
- **BR-005** Sebuah **alias tidak boleh sama dengan alias milik entri lain** (cek case-insensitive + trim). *(FR-003/FR-004)*
- **BR-006** **Validasi alias** dilakukan secara **case-insensitive + trim**, dengan **maksimal 100 karakter per alias**. Alias kosong/blank diabaikan; alias duplikat di dalam entri yang sama di-dedupe otomatis.
- **BR-013** **Jumlah alias per entri Aturan Umum maksimal 10**. Bila admin mencoba menyimpan lebih dari 10 alias (setelah dedupe internal & buang blank), sistem **menolak** simpan dengan pesan "Maksimal 10 alias per Aturan Umum". *(keputusan PO; traceability: Skenario 2/3; FR-004)*

**Pencarian**
- **BR-007** Pencarian menggunakan **substring matching** terhadap Nama **dan** Alias. **Tidak** ada fuzzy/typo-tolerant pada fase ini. *(traceability: Skenario 1; FR-002)*

**Soft delete & status (pola Master Data ROA)**
- **BR-008** Penghapusan dilakukan sebagai **soft delete**: sistem mengisi `deleted_at` (+`deleted_by`); data **tetap tersimpan** di database untuk historis/audit, namun **tidak ditampilkan** pada daftar aktif. *(traceability: Skenario 4; FR-006)*
- **BR-009** **Status data ditentukan oleh `deleted_at`**: **Aktif** = `deleted_at` NULL (kosong); **Terhapus** = `deleted_at` NOT NULL (terisi). **Tidak ada** field `status_aktif`, **tidak ada** toggle aktif/nonaktif, **tidak ada** filter aktif/nonaktif, **tidak ada** fitur Restore, **tidak ada** Hard Delete via aplikasi. *(konsisten dengan Master Data ROA)*
- **BR-010** **Validasi duplikasi (nama & alias) hanya dilakukan terhadap data aktif** (`deleted_at` IS NULL). Data yang sudah di-soft delete diabaikan dalam pengecekan duplikat, sehingga admin **dapat membuat kembali** entri dengan nama/alias yang sebelumnya sudah dihapus. *(traceability: Skenario 2; FR-003)*

**Akses & audit**
- **BR-011** Hak akses CRUD master mengikuti **Role/RBAC** (A18/A37); hanya role berwenang (mis. Admin) yang bisa tambah/ubah/hapus.
- **BR-012** Setiap entri menyimpan **audit field** (`created_by/at`, `updated_by/at`, `deleted_by/at`) pada setiap aksi CRUD. **Jejak audit — termasuk data yang di-soft delete — disimpan dan diakses hanya di sisi backend** (database/log). **Tidak ada view/laporan data terhapus di UI aplikasi** pada fase ini; penelusuran historis dilakukan oleh tim teknis melalui query backend. *(keputusan PO; traceability: FR-008; §12 NFR-007)*

## 9. User Stories

- **US-001** Sebagai **Administrator**, saya ingin melihat daftar Aturan Umum **aktif** dengan pencarian (nama & alias), agar mudah menemukan dan mengelola referensi. *(source: Skenario 1)*
- **US-002** Sebagai **Administrator**, saya ingin menambah Aturan Umum baru dengan validasi anti-duplikat (terhadap data aktif), agar referensi tetap standar dan tidak ganda. *(source: Skenario 2)*
- **US-003** Sebagai **Administrator**, saya ingin menambahkan **beberapa Alias / Istilah Lain (multi-value, hingga 10)** pada sebuah Aturan Umum, agar pencarian & suggestion tetap menemukan data meski pengguna memakai istilah berbeda (mis. "Sesudah Makan"/"Habis Makan" → "Setelah Makan"). *(source: BR-003/BR-013)*
- **US-004** Sebagai **Administrator**, saya ingin mengubah Aturan Umum dan mengelola aliasnya (tambah/hapus, total ≤ 10), agar dapat memperbaiki kesalahan penulisan/penataan. *(source: Skenario 3)*
- **US-005** Sebagai **Administrator**, saya ingin menghapus Aturan Umum secara **soft delete** (mengikuti pola ROA, tanpa restore/hard delete), agar data historis tetap utuh & teraudit. *(source: Skenario 4)*
- **US-006** Sebagai **Administrator**, saya ingin dapat membuat kembali entri dengan nama/alias yang sebelumnya sudah dihapus, agar tidak terblokir validasi duplikat oleh data lama yang sudah tidak dipakai. *(source: BR-010)*
- **US-007** Sebagai **Administrator/Tim Implementasi**, saya ingin tersedia **seeder data awal** Aturan Umum standar (sesuai spreadsheet final), agar sistem siap pakai tanpa input manual dari nol. *(source: Skenario 5)*
- **US-008** Sebagai **Manajemen**, saya ingin data Aturan Umum bersih & terstandar serta konsisten dengan pola master lain (ROA), agar menjadi referensi yang andal bagi modul lain. *(source: BR-009)*
- **US-009** Sebagai **Tim Teknis/Auditor**, saya ingin jejak audit (termasuk data terhapus) tersimpan di backend, agar penelusuran historis tetap mungkin meski tidak ada tampilan data terhapus di UI. *(source: BR-012)*

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menampilkan **dashboard/list** Aturan Umum **aktif** (`deleted_at` NULL) dengan paginasi, search, dan sort. **Tidak ada** filter status aktif/nonaktif dan **tidak ada** view data terhapus (data terhapus tidak ditampilkan di UI). | US-001, BR-009, BR-012 |
| **FR-002** | Sistem menyediakan **pencarian substring** yang mencocokkan kata kunci ke **Nama maupun Alias** (BR-007). Tidak ada fuzzy search. | US-001, US-003 |
| **FR-003** | Sistem menyediakan form **Tambah** dengan validasi field & anti-duplikat **nama & alias**, dicek **hanya terhadap data aktif** (BR-001/002/004/005/006/010). | US-002, US-006 |
| **FR-004** | Sistem mendukung pengelolaan **Alias multi-value** (tambah/hapus beberapa alias per entri; dedupe internal; **maksimal 10 alias per entri** — BR-013) (BR-003). | US-003 |
| **FR-005** | Sistem menyediakan form **Edit** (ubah nama, tambah/hapus alias, total ≤ 10) dengan validasi sama seperti Tambah. | US-004 |
| **FR-006** | Sistem mendukung **Hapus (Soft Delete)** dengan mengisi `deleted_at`/`deleted_by`; data tetap tersimpan, hilang dari daftar aktif. **Tidak menyediakan** Restore maupun Hard Delete via aplikasi (pola ROA) (BR-008/009). | US-005 |
| **FR-007** | Sistem menyediakan **seeder data awal** Aturan Umum standar (idempoten) sesuai **Link Mapping Seeder Data Awal yang sudah final** (Skenario 5). | US-007 |
| **FR-008** | Sistem mencatat **audit** (siapa, kapan, aksi apa) pada setiap CRUD termasuk soft delete; audit **disimpan & diakses di backend saja** (tanpa view UI data terhapus) (BR-012). | US-008, US-009 |
| **FR-009** | Sistem menampilkan pesan validasi/duplikat yang jelas per field (nama & alias), termasuk pesan saat alias bentrok dengan nama/alias entri aktif lain **dan pesan saat jumlah alias melebihi 10** (BR-013). | US-002, US-003 |
| **FR-010** | Akses CRUD dibatasi oleh **Role/RBAC** (A18/A37) (BR-011). | A18/A37 |

> **Dihapus dari versi sebelumnya:** FR toggle **status aktif/nonaktif** dan seluruh logika status_aktif — diganti oleh penentuan status via `deleted_at` (BR-009), konsisten Master Data ROA.

## 11. Data Requirements (Spesifikasi Field)

Struktur data master Aturan Umum terdiri dari: **Nama Aturan Umum** (wajib), **Alias / Istilah Lain** (opsional, **multi-value → entitas anak terpisah, maks 10 per entri**), dan **Audit Field** (termasuk `deleted_at` untuk soft delete). **Tidak ada** field `status_aktif`, frekuensi, waktu pemberian, signa, kategori aturan pakai, cara penggunaan, dosis, maupun singkatan signa. Status entri **diturunkan** dari `deleted_at` (bukan field tersimpan terpisah).

### A. Layar INPUT — Form Tambah/Edit Aturan Umum

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_aturan_umum | Nama Aturan Umum | text | Ya | maks 100 char; **unik** (case-insensitive + trim) **di antara data aktif** | manual | inti data; BR-001/010 (FR-003) |
| alias[] | Alias / Istilah Lain | **multi-value** (daftar/chip) | Tidak | **maks 10 item per entri** (BR-013); tiap alias maks 100 char; case-insensitive + trim; **tidak boleh = nama aturan umum entri lain** & **tidak boleh = alias entri lain** (dicek pada data aktif); dedupe internal | manual | untuk pencarian & suggestion; BR-003/004/005/006/010/013 (FR-004) |

> Catatan implementasi: `alias[]` dimodelkan sebagai **tabel anak** `master_aturan_umum_alias` (relasi 1-N ke `master_aturan_umum`, maksimal 10 baris aktif per induk). Lihat entitas di bawah.

**Entitas: master_aturan_umum (induk)**

| Field | Label | Tipe | Keterangan |
|-------|-------|------|------------|
| id | ID | id (PK) | identitas internal |
| nama_aturan_umum | Nama Aturan Umum | text | unik di antara data aktif (BR-001) |
| created_by | Dibuat Oleh | reference (user) | otomatis saat tambah |
| created_at | Dibuat Pada | datetime | otomatis saat tambah |
| updated_by | Diubah Oleh | reference (user) | otomatis saat ubah |
| updated_at | Diubah Pada | datetime | otomatis saat ubah |
| deleted_by | Dihapus Oleh | reference (user) | otomatis saat soft delete (audit backend) |
| deleted_at | Dihapus Pada | datetime (nullable) | **penentu status**: NULL = Aktif, NOT NULL = Terhapus (BR-009); hanya terlihat di backend |

**Entitas: master_aturan_umum_alias (anak, multi-value, maks 10/induk)**

| Field | Label | Tipe | Keterangan |
|-------|-------|------|------------|
| id | ID | id (PK) | identitas internal |
| aturan_umum_id | Ref Aturan Umum | reference (FK → master_aturan_umum.id) | induk pemilik alias; maks 10 alias aktif per induk (BR-013) |
| alias | Alias / Istilah Lain | text | maks 100 char; unik (case-insensitive+trim) lintas data aktif vs nama & alias lain (BR-004/005/006) |
| created_at / created_by | Audit | datetime / reference | otomatis |

> **Contoh data:** Nama = "Setelah Makan" → alias = ["Sesudah Makan", "Habis Makan"] (≤ 10 alias).

### B. Layar TAMPIL — Dashboard / List Aturan Umum

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Aturan Umum | master_aturan_umum.nama_aturan_umum (where deleted_at IS NULL) | text | search (substring), sort A-Z | kolom utama; hanya data aktif |
| Alias / Istilah Lain | master_aturan_umum_alias (daftar alias per induk, ≤10) | daftar chip/badge | search (substring) | dipakai pencocokan pencarian (FR-002) |
| Aksi | – | tombol **Ubah** / **Hapus (soft)** | – | **tidak ada** toggle aktif/nonaktif, tidak ada restore, tidak ada view data terhapus; sesuai RBAC (FR-010) |
| Total Aturan Aktif | count master_aturan_umum where deleted_at IS NULL | angka (kartu ringkasan) | – | [ASUMSI] |

> **Catatan:** Daftar **default & satu-satunya** view di UI adalah data aktif (`deleted_at` NULL). Data terhapus tetap ada di DB untuk audit namun **tidak** ditampilkan di UI mana pun, **tidak** dapat dipulihkan via aplikasi, dan penelusurannya **hanya melalui backend**.

## 12. Non-Functional Requirements

- **NFR-001 Performa:** List & pencarian substring (termasuk pencocokan alias) tampil < 2 detik untuk ≤ 5.000 entri. [ASUMSI]
- **NFR-002 Usability:** CRUD selesai dalam ≤ 3 klik utama; input alias multi-value mudah (chip/tag) dengan indikator batas **maks 10 alias**; cocok untuk SDM IT terbatas RS Tipe C/D.
- **NFR-003 Keamanan/Akses:** CRUD hanya untuk role berwenang via RBAC (A18/A37); seluruh aksi tercatat audit (FR-008).
- **NFR-004 Integritas data:** Penghapusan selalu **soft delete** via `deleted_at` (BR-008/009); normalisasi konsisten (BR-002); validasi anti-duplikat nama & alias **hanya terhadap data aktif** (BR-001/004/005/010); batas **maks 10 alias/entri** ditegakkan di sisi server (BR-013).
- **NFR-005 Konsistensi pola:** Perilaku soft delete (tanpa restore/hard delete/toggle) **identik** dengan Master Data ROA.
- **NFR-006 Ketersediaan referensi:** Data master read harus ringan agar dapat dijadikan referensi modul lain meski internet tidak stabil. [ASUMSI]
- **NFR-007 Auditability:** Simpan `created_by/at`, `updated_by/at`, dan `deleted_by/at`; data terhapus tetap tersimpan untuk historis/audit. **Jejak audit (termasuk data terhapus) disimpan & diakses di backend saja** — tidak ada view/laporan data terhapus di UI aplikasi pada fase ini (keputusan PO, BR-012). Penelusuran dilakukan tim teknis via query/log backend.
- **NFR-008 Lokalisasi:** Antarmuka Bahasa Indonesia.

## 13. Integrasi & Modul Konsumen

**Integrasi eksternal: Tidak ada.** Kode A24 hanya berlabel "Master Data" tanpa label integrasi SATUSEHAT/BPJS. [PERLU KONFIRMASI bila di masa depan perlu pemetaan ke terminologi eksternal].

**Modul konsumen (internal):** Master Data Aturan Umum **dapat digunakan sebagai referensi** oleh modul lain (mis. E-Resep, Pelayanan Farmasi RJ/RI/IGD, CPO).

> **Batas PRD ini:** Detail implementasi penggunaan Aturan Umum pada E-Resep, Farmasi, maupun modul lainnya **tidak dibahas** di sini dan akan dijelaskan pada **PRD modul masing-masing**. Modul ini hanya menyediakan data referensi yang **aktif** (`deleted_at` NULL) & terstandarisasi.

| Modul | Arah | Keterangan |
|-------|------|------------|
| E-Resep | referensi | dapat memakai Aturan Umum aktif sebagai referensi (detail di PRD E-Resep) |
| Pelayanan Farmasi (RJ/RI/IGD) | referensi | idem (detail di PRD Farmasi) |
| CPO | referensi | idem (detail di PRD CPO) |
| Role/RBAC (A18), Akses Menu (A37) | otorisasi | pembatasan akses CRUD master |

Ketika entri di-**soft delete** (`deleted_at` terisi), entri tersebut **berhenti** menjadi referensi bagi modul konsumen (hanya data aktif yang ditarik). Karena tidak ada restore, pengembalian data hanya mungkin via pembuatan entri baru (validasi duplikat hanya berlaku atas data aktif — BR-010).

## Asumsi
- Scope difinalisasi hanya pada Master Data Aturan Umum (referensi instruksi umum penggunaan obat); seluruh konteks signa, frekuensi, dosis, satuan, sediaan, ROA, struktur resep, etiket, dan dosage instruction dikeluarkan dari PRD ini.
- Pengelolaan mengikuti pola Master Data ROA: soft delete via deleted_at, TANPA fitur Restore/Pulihkan, TANPA Hard Delete via aplikasi, dan TANPA Toggle/field status aktif-nonaktif.
- Status entri diturunkan dari deleted_at (Aktif = deleted_at NULL; Terhapus = deleted_at NOT NULL); field status_aktif beserta filter/toggle/FR/BR terkait dihapus dari PRD.
- Alias disimpan sebagai multi-value (entitas anak master_aturan_umum_alias, relasi 1-N), bukan satu kolom teks dipisah koma; alias dipakai untuk pencarian & suggestion.
- KEPUTUSAN PO (final): jumlah alias per entri Aturan Umum maksimal 10; panjang tiap alias maks 100 karakter. Batas ditegakkan di sisi server (BR-013).
- KEPUTUSAN PO (final): jejak audit termasuk data terhapus disimpan & diakses di backend saja; tidak ada view/laporan data terhapus di UI aplikasi pada fase ini (BR-012, NFR-007).
- KEPUTUSAN PO (final): daftar seeder Aturan Umum mengacu pada Link Mapping Seeder Data Awal (Google Sheets) yang sudah final & lengkap; daftar contoh di PRD bersifat ilustratif, spreadsheet adalah sumber kebenaran. Perubahan spreadsheet di kemudian hari = change request terpisah.
- Validasi duplikat (nama & alias) bersifat case-insensitive + trim, dan HANYA dijalankan terhadap data aktif (deleted_at IS NULL) — entri yang sudah di-soft delete boleh dibuat ulang.
- Pencarian menggunakan substring matching ke nama & alias; tidak ada fuzzy/typo-tolerant search pada fase ini.
- Modul A24 belum memiliki BPMN sendiri; alur As-Is/To-Be diturunkan dari pola Master Data ROA.
- Seeder bersifat idempoten sehingga aman dijalankan ulang tanpa menambah duplikat.
- Pemanfaatan Aturan Umum oleh modul konsumen (E-Resep/Farmasi/CPO) hanya bersifat referensi atas data aktif; detail integrasi dibahas pada PRD modul masing-masing.
- Target metrik (95% pencarian alias berhasil, <1 menit input, dll.) bersifat asumsi awal dan perlu disepakati manajemen.