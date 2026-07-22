# PRD — Master Data Diagnosa Perawat (SDKI)

**Related Document:** PRD-Master-Data-Diagnosa-Perawat-v1.1-REVISI.md; Blok-Keputusan-OQ-Master-Diagnosa-Keperawatan.md; Prinsip-Generator-dan-Alasan-PRD-Master-Diagnosa-Keperawatan-v2.md; List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A12); Related: A11 (Diagnosa medis/ICD-10), A18 (Role), A53 (RBAC), A37 (Akses Menu); Master bersaudara: SIKI (Intervensi) & SLKI (Luaran); SDKI PPNI 2016 (149 diagnosa)
**Versi:** 1.1 - Hapus BR-011 & seluruh referensi lapis naratif berlisensi PPNI

## 1. Overview / Brief Summary

**Master Data Diagnosa Perawat** (cluster *Control Panel > Master Data*, kode fitur **A12**) adalah katalog baku **diagnosa keperawatan** di dalam Neurovi yang dikelola terpusat dan dipakai ulang oleh banyak modul keperawatan.

Diagnosa keperawatan adalah penilaian perawat atas **respons pasien** terhadap masalah kesehatannya — berbeda dari **diagnosa medis** (ICD-10) yang ditegakkan dokter dan dikelola di fitur terpisah **A11**. Contoh: *"Bersihan Jalan Napas Tidak Efektif"*, *"Defisit Nutrisi"*.

Di Indonesia daftar baku ini ditetapkan **PPNI** melalui **SDKI** (Standar Diagnosis Keperawatan Indonesia): **149 diagnosa** berkode **D.0001–D.0149**, tersusun dalam **5 kategori** dan **14 subkategori**. Modul ini menyediakan kamus diagnosa baku itu — perawat **memilih dari daftar resmi, bukan mengetik bebas** — agar data seragam, cepat diisi, dan rapi untuk RME, akreditasi (KARS/STARKES), dan pelaporan.

SDKI adalah bagian kerangka **3S**: **SDKI** (diagnosa) → **SIKI** (intervensi/tindakan) → **SLKI** (luaran/target evaluasi). Master ini dirancang menampung **keterkaitan penuh ketiganya sejak awal**; rilis pertama (Phase 1) memuat & memakai **diagnosa + intervensi**, sedangkan **luaran (SLKI)** disiapkan strukturnya untuk dipakai pada Phase 2.

*Alasan dibuat terpusat:* tanpa satu sumber baku, tiap modul pelan-pelan menyimpan versi berbeda dan data tidak bisa dilaporkan atau diaudit.

Lingkup modul ini terbatas pada: **daftar diagnosa, cara mengelola & mencarinya, dan keterkaitan 3S**. Proses memilih diagnosa untuk pasien tertentu, menyusun rencana asuhan, dan menulis perkembangan berada di modul **Asesmen Perawat** dan **CPPT Perawat** yang *memakai* master ini sebagai sumber.

## 2. Background

Asuhan keperawatan adalah pelayanan inti perawat dan diatur sebagai kewajiban profesi (**UU Keperawatan No. 38/2014**). Sejak 2016, **PPNI** menetapkan **SDKI** sebagai acuan tunggal penegakan diagnosa keperawatan (149 diagnosa, 5 kategori, 14 subkategori, kode `D.0001`–`D.0149`), bagian dari kerangka **3S** (SDKI–SIKI–SLKI). Akreditasi **KARS/STARKES** menuntut asuhan keperawatan yang terstandar dan terdokumentasi.

**Kondisi saat ini (masalah) — berdasarkan telaah data v1:**
- Dokumentasi asuhan di RS tipe C/D masih banyak berbasis kertas / referensi tidak seragam → penegakan diagnosa tidak konsisten, sulit diaudit, rawan tidak memenuhi standar akreditasi. [ASUMSI]
- Data v1 hanya memuat **≈11–15 diagnosa, tanpa kode**, dengan **istilah campur NANDA/SDKI** (mis. *"Hambatan Eliminasi Urin"* alih-alih *"Gangguan Eliminasi Urine"*).
- Intervensi pada v1 disimpan sebagai **teks bebas yang menempel di tiap diagnosa** → akar inkonsistensi: satu tindakan ditulis berbeda-beda, tidak bisa dihitung/dilaporkan.

**Mengapa modul ini perlu:** menyediakan satu sumber baku berkode (D.xxxx) yang stabil, dapat dihitung & disaring sistem, dan menjadi fondasi bersama bagi Asesmen Perawat & CPPT Perawat. Kode adalah identitas stabil — nama tampilan boleh berubah, kode tetap; mengandalkan nama saja rawan salah hitung karena variasi penulisan.

**Catatan seed data (Q2):** data v1 **bukan master**. ~15 diagnosa v1 dipetakan ke kode SDKI yang benar (pembersihan istilah NANDA→SDKI) dan dipastikan aktif sebagai set yang sudah dikenal perawat (kandidat "sering dipakai"), demi menjamin **tidak mundur dari v1**.

## 3. In Scope

### Scope Definition (yang dikerjakan)

**Phase 1 (rilis pertama — "tidak mundur dari v1" + nilai inti):**
1. CRUD pengelolaan katalog **149 diagnosa SDKI** (lapis pokok): tambah/edit metadata, **aktif/nonaktif** (bukan hapus permanen).
2. **Impor massal** katalog via template (all-or-nothing + laporan per baris).
3. **Pencarian & filter** diagnosa (kode, nama, kategori, subkategori, status).
4. **Keterkaitan 3S — struktur penuh dibangun di depan:** tabel relasi diagnosa↔intervensi (SIKI) & diagnosa↔luaran (SLKI).
5. **Populasi & pakai diagnosa + intervensi (SIKI)**; pemetaan diagnosa→intervensi di-seed dari **SIKI Intervensi Utama + Pendukung** (Q13). Master **SIKI dirilis berbarengan di Phase 1 yang sama** (Q3).
6. **Salinan lokal/offline** katalog agar pemilihan tetap jalan saat koneksi terputus (RS tipe C/D).
7. **RBAC + audit log** perubahan master.

**Phase 2:**
- **Konten luaran (SLKI)** + pemakaian **evaluasi** di CPPT (struktur sudah siap di Phase 1, Q14).
- **Pemetaan terminologi SATUSEHAT/ICNP** (Q10).
- **Favorit diagnosa per ruang/unit.**

### Out Scope (yang TIDAK dikerjakan)
1. **Diagnosa custom buatan RS di master** — master dikunci ke 149 SDKI standar; kebutuhan di luar standar ditangani di sisi **CPPT lewat opsi "Lainnya"** (Q4).
2. **Proses memilih diagnosa untuk pasien tertentu**, menyusun rencana asuhan, menulis perkembangan → ranah **Asesmen Perawat & CPPT Perawat**.
3. **Struktur formulir pengkajian** → milik modul Asesmen (Q6).
4. **Pemetaan otomatis hasil pengkajian → diagnosa** (Phase 1 tidak ada; Q6).
5. **Diagnosa medis / ICD-10** → fitur terpisah **A11**.

## 4. Goals and Metrics

| # | Tujuan | Metrik Terukur |
|---|--------|----------------|
| 1 | Keseragaman data diagnosa | 100% diagnosa pada RME baru berasal dari master berkode SDKI (bukan teks bebas), setelah Phase 1 live |
| 2 | Katalog baku lengkap | 149/149 diagnosa SDKI termuat & dapat dikelola; 0 diagnosa tanpa kode D.xxxx |
| 3 | Tidak mundur dari v1 | ≥15 diagnosa v1 berhasil dipetakan ke kode SDKI yang benar & aktif; tiap diagnosa v1 punya ≥1 intervensi terkait |
| 4 | Kecepatan pencarian (Q7) | Hasil pencarian tampil **≤2 detik**; perawat menemukan + memilih diagnosa **≤10–15 detik** [target sementara, kalibrasi setelah uji coba] |
| 5 | Ketertelusuran perubahan | 100% perubahan master tercatat di audit log (siapa, kapan, apa); retensi ≥5 tahun |
| 6 | Ketahanan offline | Pemilihan diagnosa tetap berfungsi saat koneksi terputus (uji simulasi koneksi mati) |
| 7 | Kesiapan akreditasi | Laporan diagnosa per kategori/subkategori dapat dihasilkan untuk kebutuhan KARS/STARKES |

*Alasan metrik #4:* perawat memakai master ini berkali-kali per shift; lambat sedikit terakumulasi jadi beban kerja besar.

## 5. Related Feature

Dari List Fitur (sheet MVP, cluster *Control Panel*) dan master bersaudara:

| Code | Menu / Fitur | Relasi dengan A12 |
|------|--------------|-------------------|
| **A12** | Control Panel > Master Data > Diagnosa Perawat | **Modul ini** |
| A11 | Master Data > Diagnosa (ICD-10, SATUSEHAT/BPJS) | Diagnosa **medis** (dokter) — terpisah; jangan dicampur |
| **SIKI** (Intervensi) | Master bersaudara — 📌 **perlu assign kode fitur** | Wajib rilis Phase 1 bersama A12 (Q3); sumber pemetaan diagnosa→intervensi |
| **SLKI** (Luaran) | Master bersaudara — 📌 **perlu assign kode fitur** | Struktur siap Phase 1, konten Phase 2 (Q14) |
| A18 | Master Data > Role | Definisi peran |
| A53 | Admin > RBAC | Pembatasan akses ubah master (Manajer Keperawatan + Kepala Perawat) |
| A37 | Master Data > Akses Menu | Hak akses menu A12 |
| Asesmen Perawat | Modul pemakai (luar cluster) | Memilih diagnosa dari master ini |
| CPPT Perawat | Modul pemakai (luar cluster) | Memilih diagnosa + katup "Lainnya" untuk non-standar |

📌 **Aksi:** assign kode fitur resmi untuk master **SIKI** dan **SLKI** pada sheet List Fitur. [PERLU KONFIRMASI]

## 6. Business Process (As-Is / To-Be)

> Modul ini belum punya BPMN sendiri. Alur berikut diturunkan dari pola master-data lain dan pengetahuan proses keperawatan (g-emr-inpatient, g-emr-screening). Bagian turunan ditandai [ASUMSI].

### A. As-Is (kondisi saat ini)
1. Perawat merujuk daftar diagnosa dari kertas/referensi tidak seragam, atau dari v1 yang hanya memuat ≈11–15 diagnosa **tanpa kode**, istilah campur NANDA/SDKI. [ASUMSI sebagian]
2. Intervensi dicatat sebagai **teks bebas** yang menempel di diagnosa → tiap perawat menulis berbeda.
3. Tidak ada pengelola terpusat, tidak ada audit perubahan, tidak ada keterkaitan terstruktur ke intervensi/luaran.
4. Akibat: data tidak bisa dihitung/disaring/dilaporkan; sulit diaudit untuk akreditasi.

### B. To-Be (kondisi diharapkan)
1. **Admin berwenang (Manajer Keperawatan / Kepala Perawat)** memuat katalog 149 SDKI via **impor massal** (all-or-nothing).
2. Tiap diagnosa berkode **D.xxxx**, berkategori & subkategori, dapat **dicari/difilter** cepat.
3. Pengelola **menautkan** diagnosa ke intervensi (SIKI) — di-seed dari Utama+Pendukung; **boleh kosong** dengan penanda lembut (Q9). Struktur ke luaran (SLKI) sudah ada.
4. Diagnosa yang tak lagi dipakai **dinonaktifkan** (bukan dihapus) → hilang dari pilihan baru, histori RME tetap utuh.
5. Modul **Asesmen Perawat & CPPT Perawat** memanggil master ini sebagai sumber tunggal; pemilihan tetap jalan **offline**.
6. Setiap perubahan master tercatat di **audit log**.

## 7. Main Flow / Mindmap

### Skenario 1 — Muat katalog awal (Impor massal)
1. Admin (Manajer/Kepala Perawat) buka *Control Panel > Master Data > Diagnosa Perawat*.
2. Pilih **Impor** → unduh template → unggah file (.csv/.xlsx).
3. Sistem **validasi seluruh baris** (kode D.xxxx unik & format, kategori/subkategori valid, nama wajib).
4. **Gateway: semua baris valid?**
   - **Ya** → commit seluruh batch → tampilkan ringkasan (jumlah ditambah/diperbarui).
   - **Tidak** → **batalkan seluruh batch** (all-or-nothing) + **laporan per baris** (baris, kolom, alasan). (BR-010, Q5)
5. Sistem catat ke audit log.

### Skenario 2 — Tambah / Edit diagnosa manual
1. Admin klik **Tambah** atau pilih diagnosa → **Edit**.
2. Isi/ubah field lapis pokok (kode, nama, kategori, subkategori, jenis, status).
3. **Gateway: kode D.xxxx unik & valid?** Tidak → tolak + pesan. Ya → simpan.
4. Audit log dicatat.

### Skenario 3 — Tautkan intervensi (3S)
1. Admin buka detail diagnosa → tab **Intervensi Terkait**.
2. Tambah relasi dari master SIKI (level **judul intervensi**, seed Utama+Pendukung).
3. **Intervensi boleh kosong** → sistem tampilkan **indikator non-pemblokir** ("belum ada intervensi") (Q9). Tidak memblokir simpan.

### Skenario 4 — Nonaktifkan diagnosa
1. Admin pilih diagnosa → **Nonaktifkan** (toggle `status_aktif`).
2. Sistem konfirmasi → diagnosa hilang dari pilihan baru di Asesmen/CPPT; histori RME lama tetap merujuk. (BR-005)

### Skenario 5 — Pencarian (dipakai modul hilir)
1. Pengguna ketik kata kunci/kode → sistem cari pada salinan (termasuk offline).
2. Hasil tampil ≤2 detik, dapat difilter kategori/subkategori/status.

## 8. Business Rules

| ID | Aturan | Sumber |
|----|--------|--------|
| **BR-001** | Setiap diagnosa **wajib** memiliki kode unik berformat `D.xxxx` (D.0001–D.0149) sebagai identitas stabil; nama boleh berubah, kode tidak. | Prinsip 2 |
| **BR-002** | Setiap diagnosa **wajib** berkategori (5) & subkategori (14) sesuai SDKI. | Fakta SDKI |
| **BR-003** | Kode diagnosa harus unik — duplikat ditolak saat tambah/edit/impor. | Integritas |
| **BR-004** | Master **dikunci ke 149 diagnosa SDKI standar**; tidak ada diagnosa custom di master. Kebutuhan di luar standar ditangani di **CPPT lewat "Lainnya"**. | Q4 |
| **BR-005** | Diagnosa **tidak dihapus permanen**; cukup **dinonaktifkan** agar hilang dari pilihan baru tetapi histori RME tetap utuh. | Prinsip 8 |
| **BR-006** | Akses **ubah master** (tambah/edit/impor/nonaktif) dibatasi ke **Manajer Keperawatan + Kepala Perawat** via RBAC (A53). | Q4 |
| **BR-007** | Intervensi disimpan sebagai **katalog tersendiri (SIKI)** dan ditautkan **banyak-ke-banyak**; tidak pernah sebagai teks bebas menempel di diagnosa. | Prinsip 4 |
| **BR-008** | Keterkaitan diagnosa↔intervensi tersedia di rilis pertama; **intervensi boleh kosong** untuk diagnosa aktif — sistem beri **indikator non-pemblokir**, bukan larangan simpan. | Q9 |
| **BR-009** | Pemetaan diagnosa→intervensi di-seed dari **SIKI Intervensi Utama + Pendukung**; admin boleh aktif/nonaktifkan mana yang tampil. | Q13 |
| **BR-010** | Impor massal bersifat **all-or-nothing**: bila ada baris tidak valid, **batalkan seluruh batch** + laporan per baris. Tidak ada commit sebagian. | Q5 |
| **BR-012** | **Struktur 3S** (relasi diagnosa↔intervensi↔luaran) dibangun sejak Phase 1; **konten luaran (SLKI)** & pemakaian evaluasi di Phase 2. | Q14 |
| **BR-013** | Setiap perubahan master **wajib** tercatat di audit log (siapa, kapan, apa); retensi ≥5 tahun. | Q8, Prinsip 12 |

> Catatan revisi v1.1: **BR-011** (konten naratif berlisensi PPNI / lapis naratif "menunggu lisensi") **dihapus** beserta seluruh elemen turunannya. ID BR-012 & BR-013 dipertahankan agar traceability ke FR/NFR/US tidak berubah.

## 9. User Stories

**Aktor:** Manajer Keperawatan & Kepala Perawat (pengelola master), Admin Sistem (teknis impor), Perawat (pemakai via modul hilir — read-only di sini), Tim Mutu/Akreditasi.

- **US-001** — Sebagai **Kepala Perawat**, saya ingin **memuat 149 diagnosa SDKI sekaligus lewat impor template**, agar katalog baku siap pakai tanpa input satu per satu. *(traceability: Skenario 1, FR-007)*
- **US-002** — Sebagai **Kepala Perawat**, saya ingin **menambah/mengubah diagnosa** beserta kode, kategori, dan subkategori, agar metadata selalu sesuai standar SDKI. *(FR-001)*
- **US-003** — Sebagai **Manajer Keperawatan**, saya ingin **menonaktifkan** diagnosa yang tak lagi dipakai tanpa menghapusnya, agar histori RME lama tetap utuh. *(BR-005, FR-003)*
- **US-004** — Sebagai **Kepala Perawat**, saya ingin **menautkan intervensi (SIKI) ke tiap diagnosa**, agar perawat langsung melihat tindak lanjut yang tepat. *(FR-005, BR-008)*
- **US-005** — Sebagai **Manajer Keperawatan**, saya ingin **melihat penanda diagnosa aktif yang belum punya intervensi**, agar tahu mana yang perlu dilengkapi tanpa terblokir. *(BR-008, FR-006)*
- **US-006** — Sebagai **Perawat**, saya ingin **mencari diagnosa dengan cepat (kode/nama/kategori)**, agar pengisian asuhan cepat dan seragam. *(FR-004, NFR-001)*
- **US-007** — Sebagai **Perawat di RS dengan internet tidak stabil**, saya ingin **tetap bisa memilih diagnosa saat koneksi terputus**, agar pelayanan tidak terhenti. *(FR-009, NFR-002)*
- **US-008** — Sebagai **Admin Sistem**, saya ingin **laporan per baris saat impor gagal**, agar tahu persis baris mana yang harus diperbaiki. *(FR-007, BR-010)*
- **US-009** — Sebagai **Tim Mutu**, saya ingin **melihat jejak audit perubahan master**, agar perubahan dapat dipertanggungjawabkan untuk akreditasi. *(FR-010, BR-013)*
- **US-010** — Sebagai **Manajer Keperawatan**, saya ingin **hanya peran berwenang yang bisa mengubah master**, agar fondasi bersama tidak rusak oleh perubahan tak sah. *(BR-006, FR-011)*

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menyediakan **CRUD** diagnosa (tambah, lihat, edit) pada lapis pokok: kode, nama, kategori, subkategori, jenis, status. | US-002 |
| **FR-002** | Sistem **memvalidasi** kode `D.xxxx` (format + keunikan) saat tambah/edit/impor; duplikat & format salah ditolak. | BR-001, BR-003 |
| **FR-003** | Sistem menyediakan **toggle aktif/nonaktif** (soft-disable); tidak menyediakan hapus permanen di Phase 1. | US-003, BR-005 |
| **FR-004** | Sistem menyediakan **pencarian** (kode/nama) + **filter** (kategori, subkategori, status) + sort. | US-006 |
| **FR-005** | Sistem menyediakan tab **Intervensi Terkait** untuk menautkan/melepas relasi diagnosa↔SIKI (banyak-ke-banyak, level judul intervensi), di-seed dari Utama+Pendukung. | US-004, BR-007, BR-009 |
| **FR-006** | Sistem menampilkan **indikator non-pemblokir** (badge "belum ada intervensi") untuk diagnosa aktif tanpa intervensi; tidak menghalangi simpan. | US-005, BR-008 |
| **FR-007** | Sistem menyediakan **impor massal** via template (.csv/.xlsx) dengan mode **all-or-nothing** + **laporan per baris** (baris, kolom, alasan gagal). | US-001, US-008, BR-010 |
| **FR-008** | Sistem **tidak** memetakan otomatis hasil pengkajian → diagnosa di Phase 1 (batas dengan Asesmen). | Out Scope #4, Q6 |
| **FR-009** | Sistem menyimpan **salinan lokal** katalog sehingga pencarian & pemilihan diagnosa tetap berfungsi saat koneksi terputus; sinkron saat koneksi pulih. | US-007, NFR-002 |
| **FR-010** | Sistem mencatat **audit log** tiap perubahan master (user, timestamp, aksi, nilai lama/baru). | US-009, BR-013 |
| **FR-011** | Sistem menerapkan **RBAC**: hanya Manajer Keperawatan & Kepala Perawat dapat mengubah master; peran lain read-only. | US-010, BR-006 |
| **FR-012** | Sistem menyiapkan **struktur relasi diagnosa↔luaran (SLKI)** (kolom/tabel) tanpa konten di Phase 1; konten & evaluasi di Phase 2. | BR-012, Q14 |
| **FR-013** | Sistem menyediakan **laporan/ekspor** jumlah diagnosa per kategori/subkategori & status untuk kebutuhan akreditasi. | Goal #7 |

## 11. Data Requirements (Spesifikasi Field)

> Field bersama (`status_aktif`, `keterangan`, `file_import`, `mode_import`) memakai definisi kanonik lintas-PRD agar konsisten dengan master lain (A11, A15–A17, A43, dst).
>
> Catatan revisi v1.1: field **lapis naratif berlisensi PPNI** (definisi/tanda-gejala/penyebab) **dihapus** menyusul penghapusan BR-011.

### 11.1 Layar INPUT — Form Tambah/Edit Diagnosa Perawat (FR-001)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_diagnosa | Kode Diagnosa | text | Ya | format `D.0001`–`D.0149`, **unik** | manual / impor | identitas stabil (BR-001); read-only setelah dibuat [PERLU KONFIRMASI] |
| nama_diagnosa | Nama Diagnosa | text | Ya | maks 150 char, istilah SDKI baku | manual / impor | mis. "Bersihan Jalan Napas Tidak Efektif" |
| kategori | Kategori | dropdown(enum) | Ya | 5 kategori SDKI (Fisiologis, Psikologis, Perilaku, Relasional, Lingkungan) | enum | untuk filter & laporan |
| subkategori | Subkategori | dropdown(enum) | Ya | 14 subkategori SDKI (sesuai kategori induk) | enum (lookup ke kategori) | |
| jenis_diagnosa | Jenis Diagnosa | dropdown(enum) | Ya | enum: Aktual / Risiko / Promosi Kesehatan | enum | sesuai tipe SDKI |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | **field kanonik** (BR-005) |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | **field kanonik** |

### 11.2 Layar INPUT — Tautkan Intervensi (tab Intervensi Terkait, FR-005)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| diagnosa_id | Diagnosa | lookup | Ya | dari master A12 | konteks (auto) | induk relasi |
| intervensi_id | Intervensi (SIKI) | dropdown(lookup) | Tidak | dari master SIKI (judul intervensi) | lookup master SIKI | boleh kosong (BR-008) |
| peran_intervensi | Peran | dropdown(enum) | Tidak | enum: Utama / Pendukung | enum | seed dari SIKI Utama+Pendukung (BR-009) |
| tampil_aktif | Ditampilkan? | boolean | Ya | true/false | default true | admin aktif/nonaktifkan tampilan |
| luaran_terkait | Luaran (SLKI) | dropdown(lookup) | Tidak | dari master SLKI | lookup SLKI | **placeholder Phase 2** — struktur siap, konten kosong di Phase 1 (FR-012) |

### 11.3 Layar INPUT — Impor Massal (FR-007)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Diagnosa | file | Ya | .csv/.xlsx, sesuai template | manual upload | **field kanonik**; kolom template: kode_diagnosa, nama_diagnosa, kategori, subkategori, jenis_diagnosa |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | **field kanonik** |

*Catatan impor:* validasi **all-or-nothing**; bila gagal → tampil **laporan per baris** (no. baris, kolom, alasan). (BR-010)

### 11.4 Layar TAMPIL — Daftar / Dashboard Diagnosa Perawat (FR-004, FR-006, FR-013)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Diagnosa Aktif | count master diagnosa where status_aktif | angka besar (kartu) | – | ringkasan |
| Total per Kategori | count group by kategori | angka / mini-chart | – | untuk akreditasi |
| Kode | master.kode_diagnosa | text mono | sort, filter | |
| Nama Diagnosa | master.nama_diagnosa | text | sort A-Z, search | |
| Kategori | master.kategori | text | filter | |
| Subkategori | master.subkategori | text | filter | |
| Jenis | master.jenis_diagnosa | badge | filter | Aktual/Risiko/Promosi |
| Jumlah Intervensi | count relasi diagnosa↔SIKI tampil_aktif | angka + badge | sort, filter | **badge kuning "belum ada intervensi"** bila 0 & status aktif (FR-006) |
| Status | master.status_aktif | badge (Aktif hijau / Nonaktif abu) | filter | |
| Terakhir Diubah | audit log terbaru | tanggal + user | sort | dari FR-010 |

### 11.5 Layar TAMPIL — Detail Diagnosa

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Header (kode + nama + jenis) | master | judul + badge | – | |
| Kategori / Subkategori | master | breadcrumb | – | |
| Daftar Intervensi Terkait | relasi diagnosa↔SIKI | list (judul + peran Utama/Pendukung) | filter peran | level judul; aktivitas di master SIKI |
| Luaran Terkait | relasi diagnosa↔SLKI | list | – | kosong di Phase 1 (placeholder) |
| Riwayat Perubahan | audit log | tabel (user, waktu, aksi) | sort waktu | |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Hasil pencarian diagnosa tampil **≤2 detik**; perawat menemukan + memilih **≤10–15 detik** [target sementara, kalibrasi setelah uji coba]. | Q7 |
| **NFR-002** | Ketahanan/Offline | Katalog kecil & jarang berubah → simpan **salinan lokal**; pemilihan tetap jalan saat koneksi terputus; sinkron otomatis saat pulih. Target RS tipe C/D internet tidak stabil. | Prinsip 13 |
| **NFR-003** | Keamanan/Akses | Perubahan master hanya oleh **Manajer Keperawatan & Kepala Perawat** (RBAC, A53); peran lain read-only. | Q4, BR-006 |
| **NFR-004** | Auditability | Audit log perubahan disimpan **≥5 tahun** (selaras retensi rekam medis); angka final dikonfirmasi tim mutu. | Q8 |
| **NFR-005** | Integritas data | Operasi impor bersifat transaksional (all-or-nothing) — tidak meninggalkan katalog termuat sebagian. | Q5 |
| **NFR-006** | Skalabilitas/Sederhana | Katalog terbatas (~149 + relasi) — desain ringan, cocok infrastruktur sederhana RS tipe C/D. | Konteks |
| **NFR-007** | Kompatibilitas | Konsisten dengan master lain (field kanonik `status_aktif`, `keterangan`, `file_import`, `mode_import`). | Konteks lintas-PRD |

## 13. Integrasi Eksternal

| Integrasi | Status | Keterangan |
|-----------|--------|------------|
| **Master SIKI (Intervensi)** | **Phase 1 — wajib** | Sumber relasi diagnosa→intervensi; rilis berbarengan dengan A12 (Q3). 📌 perlu assign kode fitur. |
| **Master SLKI (Luaran)** | Struktur Phase 1, konten Phase 2 | Relasi diagnosa↔luaran disiapkan; konten & evaluasi di CPPT Phase 2 (Q14). |
| **RBAC / Role (A53, A18, A37)** | Phase 1 | Pembatasan akses ubah master + hak akses menu. |
| **Modul Asesmen Perawat & CPPT Perawat** | Konsumen (internal) | Memanggil master ini sebagai sumber tunggal diagnosa; CPPT menyediakan katup "Lainnya" untuk non-standar. |
| **SATUSEHAT / ICNP (terminologi)** | **Phase 2** | Pemetaan terminologi internasional/nasional — belum di Phase 1 (Q10). [PERLU KONFIRMASI mekanisme] |

> Catatan: A12 adalah **diagnosa keperawatan** dan **tidak** berintegrasi BPJS/SATUSEHAT untuk koding (itu ranah A11 diagnosa medis/ICD-10). Pemisahan ini disengaja agar tidak tercampur.

## Asumsi
- [ASUMSI] Alur As-Is/To-Be diturunkan dari pola master-data lain + proses keperawatan (g-emr-inpatient, g-emr-screening) karena modul ini belum punya BPMN sendiri.
- [ASUMSI] Dokumentasi asuhan di RS tipe C/D masih banyak berbasis kertas dengan referensi tidak seragam.
- [ASUMSI] Jenis diagnosa SDKI = Aktual / Risiko / Promosi Kesehatan dipakai sebagai enum field jenis_diagnosa.
- [ASUMSI] kode_diagnosa bersifat read-only setelah dibuat untuk menjaga identitas stabil — perlu dikonfirmasi.
- [ASUMSI] Salinan lokal/offline diimplementasikan sebagai cache katalog yang disinkron saat koneksi pulih (katalog kecil & jarang berubah).
- Field bersama (status_aktif, keterangan, file_import, mode_import) mengikuti definisi kanonik lintas-PRD agar konsisten dengan master lain.
- Revisi v1.1: BR-011 dan seluruh elemen lapis naratif berlisensi PPNI dihapus atas instruksi PM; bila kebutuhan konten naratif muncul lagi, perlu PRD/keputusan terpisah.

## Pertanyaan Terbuka
- Q3/Q14: Assign kode fitur resmi untuk master SIKI (Intervensi) dan SLKI (Luaran) di List Fitur V2 — 📌 aksi PM.
- Apakah kode_diagnosa boleh diedit setelah dibuat, atau permanen read-only sebagai identitas stabil?
- Konfirmasi final retensi audit log (default ≥5 tahun) dari tim mutu (NFR-004).
- Kalibrasi akhir target kecepatan (≤2 detik / ≤10–15 detik) setelah uji coba lapangan (NFR-001).
- Mekanisme & jadwal pemetaan terminologi SATUSEHAT/ICNP di Phase 2 (Q10).
- Validasi tim klinis (🔎) atas hasil pemetaan ~15 diagnosa v1 (NANDA→SDKI) dan daftar kategori/subkategori final.