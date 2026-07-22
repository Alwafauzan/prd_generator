# PRD — Master Data / Integrasi SATUSEHAT BPJS V2 — Item Pemeriksaan Laboratorium (A14)

## 1. Metadata Dokumen

* **Approval**: [PERLU KONFIRMASI] Penanggung Jawab Laboratorium, [Nama, Jabatan, Tanggal]; Product Owner SIMRS, [Nama, Tanggal]
* **Related Documents**:
    * Template Export/Import Data Pemeriksaan Lab
    * LOINC Laboratory — SATUSEHAT (kode terverifikasi) & LOINC Answer List — SATUSEHAT (terverifikasi)
    * Observation.valueQuantity (UCUM via Master Satuan & Kemasan A22)
    * PRD Master Data Laboratorium v2.2 (Tamtech)
    * PRD terkait: A3 Unit, A22 Satuan & Kemasan, A10 Tindakan, A11 Diagnosa, A13 Procedure, A55 Jabatan
    * PRD Modul Pelayanan Penunjang (Lab/Radiologi)
* **Document Version**: 2026-07-01 · v1.4 · Refinement — kedua open question v1.3 DITUTUP sebagai OUT OF SCOPE A14: (1) bentuk teknis kontrak read-only A14→Pelayanan Penunjang = keputusan arsitektur; (2) perlakuan pengiriman parsial (header ber-LOINC namun sebagian komponen tidak) = logika modul Pelayanan Penunjang. Keduanya dipindah ke Out of Scope (#14, #15); daftar open questions dikosongkan. Diselaraskan ke format template PRD standar (9 bagian + Technical Context).

---

## 2. Overview & Background

### Overview / Brief Summary

**Modul:** Control Panel > Master Data / Integrasi SATUSEHAT BPJS V2 > Item Pemeriksaan Laboratorium (**Code A14**, Cluster **Control Panel**).

Master Data Item Pemeriksaan Laboratorium adalah modul pengelolaan data pemeriksaan laboratorium yang menjadi **sumber kebenaran tunggal (single source of truth)** atas seluruh layanan pemeriksaan laboratorium di rumah sakit. Modul menyimpan & mengelola: kode LIS, kode terminologi **SATUSEHAT (LOINC & LOINC Answer List)**, nama & kategori pemeriksaan, jenis spesimen, item/komponen pemeriksaan, **satuan (UCUM — bersumber dari Master Data Satuan & Kemasan A22)**, rentang nilai normal, **ambang Nilai Kritis (Critical Value)** per item numerik, dan **Kategori Hasil Pemeriksaan** (Numerik / Diskret / Narasi).

Master data ini menjadi fondasi bagi modul Administrasi, Rekam Medis (EMR), Billing, Order Penunjang, modul **Hasil Laboratorium**, dan modul **Pelayanan Penunjang** — perubahan cukup dikelola di satu tempat dan langsung berlaku di seluruh modul terkait.

**Dua kemampuan utama versi ini:**
1. **Konfigurasi Nilai Kritis (Critical Value)** — **hanya satu pasang ambang**: batas **bawah** & batas **atas** per item pemeriksaan numerik; dikonsumsi modul Hasil Laboratorium untuk flagging & notifikasi real-time ke dokter.
2. **Kategori Hasil Pemeriksaan** — pengelompokan tipe hasil menjadi **Numerik, Diskret, dan Narasi**, termasuk konfigurasi pilihan hasil terbatas (Answer List) untuk pemeriksaan diskret guna menentukan tipe validasi input di modul Hasil Laboratorium.

**Batasan integrasi (hasil refinement v1.2–v1.4):**
- Integrasi eksternal modul ini secara konseptual **hanya ke SATUSEHAT** (resource Observation). Pemetaan klaim **KPTL/BPJS tidak termasuk** (lihat Out of Scope).
- Master data **menyimpan & menyediakan** pemetaan terminologi (LOINC & Answer List) sebagai **kesiapan integrasi**, namun pemetaan ini **OPSIONAL** — tidak diwajibkan di tingkat master.
- **Keputusan pengiriman ke SATUSEHAT & pemaksaan kelengkapan LOINC sebelum kirim BUKAN tanggung jawab modul ini** — ditangani di **modul Pelayanan Penunjang (Lab/Radiologi)** saat data hasil benar-benar akan dikirim.
- **(v1.3) Tidak ada indikator/API 'kesiapan LOINC' terpisah.** **Kehadiran kode LOINC** pada pemeriksaan/komponen ITULAH sinyal kesiapan: bila terisi → modul Pelayanan **otomatis mengirim** Observation ke SATUSEHAT saat pemeriksaan; bila kosong → tidak dikirim (BR-007, BR-015, FR-017).
- **(v1.4)** Bentuk teknis kontrak akses read-only A14→Pelayanan Penunjang, dan perlakuan pengiriman parsial (header vs komponen), **dikeluarkan dari lingkup A14** (Out of Scope #14, #15).

**Konteks RS Tipe C & D [ASUMSI]:** layanan lab terbatas (hematologi, kimia klinik, urinalisis, imunoserologi dasar), SDM IT terbatas. Modul wajib menyediakan import/export massal agar setup awal tidak bergantung pada input manual satu per satu. Dataset terminologi SATUSEHAT (LOINC/Answer List) disiapkan via **seed manual** (NFR-006).

### Business Process (As-Is vs To-Be)

**As-Is (kondisi saat ini):**
1. Data pemeriksaan lab dicatat tidak terpusat (spreadsheet/konfigurasi per modul) → rawan beda antar modul. [ASUMSI]
2. Kode LOINC/Answer List belum dipetakan terstruktur; bila dibutuhkan SATUSEHAT, petugas mencari manual di browser LOINC publik (berisiko salah, tak terverifikasi).
3. Tidak ada ambang **Nilai Kritis** baku → hasil mengancam jiwa (mis. **HGB < 7.0**, **Kalium > 6.5**, **Gula Darah > 400**) tidak otomatis ditandai; notifikasi dokter mengandalkan kesadaran petugas → **delay penanganan** & risiko klinis tinggi.
4. Struktur data hasil mengasumsikan **semua hasil numerik** → hasil diskret (Positif/Negatif, Golongan Darah, Kultur) & narasi (Hapusan Darah Tepi) diinput bebas, tidak terstruktur, rawan salah, tanpa mapping ke LOINC Answer List.
5. Satuan diketik bebas per modul → tidak konsisten dengan UCUM.

**To-Be (kondisi diharapkan):**
1. Petugas Lab/Admin Master membuka **Dashboard Master Data Lab** → mencari/filter pemeriksaan.
2. **Tambah/Edit pemeriksaan**: isi kode LIS, nama, kategori (manual), spesimen (manual) → sistem **cek duplikasi by kode LIS** (gateway: *Kode LIS sudah ada?* → Ya: tolak; Tidak: lanjut).
3. **Pemetaan LOINC (opsional/kesiapan):** petugas boleh memetakan kode **LOINC** (header & komponen) dari daftar terverifikasi SATUSEHAT. **Tidak ada gateway wajib** — keputusan & validasi pengiriman di modul Pelayanan Penunjang.
4. **Tentukan Kategori Hasil** per komponen (gateway: *Numerik / Diskret / Narasi?*):
   - **Numerik** → pilih **satuan (UCUM) dari Master A22** (bila ada), isi rentang normal **1 baris** dengan jenis kelamin (L/P/Semua) **atau dikosongkan**, opsi **Nilai Kritis (batas bawah & atas, boleh negatif)**. Sistem menegakkan `min<=max` & `bawah<atas` (berlaku pada nilai negatif).
   - **Diskret** → definisikan **pilihan hasil (Answer List)** + mapping ke LOINC Answer List (opsional/kesiapan).
   - **Narasi** → set tipe input text area (tanpa Answer List/range/satuan/kritis).
5. **Simpan** → data jadi acuan tunggal seluruh modul terkait; perubahan dicatat di **log aktivitas**.
6. **Nonaktifkan** pemeriksaan → hilang dari dashboard & order penunjang, tetap tersimpan di history.
7. **Import/Export massal** (.xlsx/.csv) untuk setup awal & pembaruan bulk — kolom terminologi **cukup kode LOINC**.
8. **[Modul Pelayanan]** Saat pemeriksaan dilakukan & hasil siap dikirim, modul Pelayanan **memeriksa ada/tidaknya kode LOINC** (dari A14): ada → Observation OTOMATIS terkirim; kosong → tidak dikirim. Tidak ada flag kesiapan terpisah dari A14 (v1.3).
9. **[Phase 2]** Modul Hasil Lab membaca konfigurasi Nilai Kritis → hasil pasien melewati ambang → flag kritis + notifikasi real-time ke dokter + log read-back.

---

## 3. Goals & Metrics

**Goals:**
1. Menyediakan modul layanan laboratorium yang lengkap & terstruktur sebagai acuan modul terkait (single source of truth).
2. Menyediakan **kesiapan** pemetaan kode **LOINC & Answer List** (opsional) untuk integrasi SATUSEHAT (Observation) — modul Pelayanan tinggal membaca kode LOINC untuk **otomatis mengirim**.
3. Menyediakan pengaturan **Nilai Kritis (batas bawah & atas)** per pemeriksaan untuk keselamatan pasien (notifikasi dini ke dokter).
4. Menyediakan **Kategori Hasil** agar modul Hasil Lab dapat memilih tipe validasi input yang tepat.
5. Menyediakan **rentang normal per jenis kelamin** (L/P/Semua, 1 baris/komponen) sebagai acuan flag abnormal.
6. Menyediakan log aktivitas perubahan guna memastikan keakuratan data.

**Metrics:**

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan & pengelolaan data | Data pemeriksaan dapat ditambah, diubah, dinonaktifkan; >95% user lab menyatakan proses mudah & cepat. |
| 2 | Kecepatan pencarian | Waktu pencarian/filter pemeriksaan < **3 detik**. |
| 3 | Validitas pemetaan LOINC | **100%** pemeriksaan yang **dipetakan** LOINC menggunakan kode dari daftar **terverifikasi SATUSEHAT** (bukan kode bebas). |
| 4 | Single source of truth | Tidak ada perbedaan data layanan pemeriksaan antar modul SIMRS. |
| 5 | Notifikasi nilai kritis | **100%** hasil numerik yang melewati ambang kritis (item terkonfigurasi) ter-flag & memicu notifikasi ke dokter. *[Phase 2]* |
| 6 | Konsistensi kategori hasil | **100%** item diskret memiliki Answer List terdefinisi; modul Hasil Lab menampilkan input sesuai kategori. |
| 7 | Konsistensi satuan | **100%** komponen numerik (yang bersatuan) memakai satuan valid di Master A22 (UCUM). |
| 8 | Integritas rentang/kritis | **0** data tersimpan yang melanggar `nilai_normal_min<=max` / `critical_low<high` (termasuk pada nilai negatif). |

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| Dashboard & CRUD Pemeriksaan | Dashboard (search, sort, filter kategori, *last updated*), form tambah/edit pemeriksaan + komponen, toggle status aktif/nonaktif, halaman daftar nonaktif | Approval berjenjang perubahan master (mis. verifikasi Penanggung Jawab Lab sebelum aktif) via `status_approval`/`role_approver` |
| Pemetaan Terminologi | Lookup & simpan kode **LOINC & Answer List** (opsional, seed manual) sebagai kesiapan integrasi | — (keputusan kirim tetap di modul Pelayanan Penunjang) |
| Nilai Kritis & Kategori Hasil | Konfigurasi Nilai Kritis (bawah/atas, boleh negatif) + Kategori Hasil (Numerik/Diskret/Narasi) + Answer List | Ekspos ke Hasil Lab untuk flagging + notifikasi real-time & log read-back akreditasi |
| Rentang Normal & Satuan | Rentang normal 1 baris (L/P/Semua, boleh kosong), lookup satuan UCUM dari A22 | — |
| Import/Export & Audit | Import/Export .xlsx/.csv (mode tambah / tambah+update), log aktivitas (audit trail) | Import dengan alur approval sebelum commit [ASUMSI] |

**Out of Scope**:

| No | Scope yang TIDAK dikerjakan |
|----|------------------------------|
| 1 | Order pemeriksaan penunjang laboratorium (modul Order Penunjang). |
| 2 | Input & verifikasi **hasil** pemeriksaan laboratorium (modul Hasil Laboratorium). |
| 3 | Logika klinis tatalaksana/penanganan pasien atas hasil nilai kritis. |
| 4 | Pengelolaan alat/analyzer LIS & koneksi interface alat (di luar penyimpanan kode LIS). |
| 5 | Penetapan tarif pemeriksaan lab (mengacu master Tarif/Tindakan A10) — modul ini hanya mereferensikan. [ASUMSI] |
| 6 | **Pemetaan kode klaim KPTL / bridging BPJS / INA-CBG** — integrasi modul ini hanya ke SATUSEHAT (ditangani A10 bila dibutuhkan). |
| 7 | **Master Data Satuan & Kemasan + pengelolaan kode UCUM** — dikelola di modul **A22**; A14 hanya me-*lookup*. |
| 8 | **Master Kategori Pemeriksaan & Jenis Spesimen** — di versi ini **input manual**, bukan master tersendiri. |
| 9 | **Nilai Kritis multi-tingkat** (panic high/low, abnormal bertingkat) — versi ini **hanya satu pasang batas bawah & atas**. |
| 10 | **Sinkronisasi otomatis/berkala dataset terminologi** — versi ini **seed manual**. |
| 11 | **Penandaan/keputusan pengiriman ke SATUSEHAT & pemaksaan kelengkapan LOINC** — **DIPINDAH ke modul Pelayanan Penunjang**. A14 hanya menyimpan kode LOINC sebagai kesiapan (opsional); tidak membuat flag/indikator/API kesiapan terpisah (BR-015). |
| 12 | **Multi-baris rujukan normal / struktur per kombinasi gender+usia** — versi ini **cukup 1 baris per komponen**. |
| 13 | **Kolom non-terminologi tambahan & mapping Answer List di file Import/Export** — template terminologi **cukup kode LOINC**; mapping Answer List via form. |
| 14 | **(v1.4) Penetapan bentuk teknis kontrak akses read-only A14 → modul Pelayanan Penunjang** (tabel/view/service) — **keputusan arsitektur**, bukan requirement A14 (FR-017, NFR-011). |
| 15 | **(v1.4) Perlakuan pengiriman parsial Observation** saat header ber-LOINC tetapi sebagian komponen tidak (atau sebaliknya) — **logika modul Pelayanan Penunjang**. A14 hanya menyimpan kode LOINC per header & per komponen apa adanya (BR-017). |

---

## 5. Related Features

| No | Code | Module / Menu | Relasi Teknis/Bisnis |
|----|------|---------------|----------------------|
| 1 | A3 | Master Data > Unit | Field `unit` (unit pelaksana = Laboratorium) di-lookup dari master Unit. |
| 2 | A22 | Master Data / SATUSEHAT Terminology V2 > Satuan & Kemasan | **Sumber satuan (UCUM)** untuk komponen numerik. **Kode UCUM dikelola di A22**; A14 hanya me-*lookup*. (Confirmed) |
| 3 | A10 | Master Data / Integrasi BPJS V2 > Tindakan | Referensi tarif/tindakan lab untuk billing. **Pemetaan klaim KPTL bukan tanggung jawab A14** (out scope). |
| 4 | A11 / A13 | Master Data > Diagnosa / Procedure | Pola integrasi SATUSEHAT yang sama (mapping kode terminologi). |
| 5 | A32 | Master Data / SATUSEHAT V2 > Wilayah | Pola modul integrasi SATUSEHAT (referensi konsistensi). |
| 6 | A55 | Master Data > Jabatan | Otorisasi role pengelola master lab (RBAC). |
| 7 | — | **Modul Pelayanan Penunjang (Lab/Radiologi)** | **Pemilik keputusan & validasi pengiriman SATUSEHAT.** Menilai kesiapan **langsung dari ada/tidaknya kode LOINC** di A14; ada → Observation otomatis terkirim. Tidak menarik indikator kesiapan terpisah (v1.3, BR-015). **(v1.4)** Bentuk teknis kontrak akses & perlakuan pengiriman parsial = milik modul ini (Out Scope #14/#15). |
| 8 | — | Integrasi SATUSEHAT > Observation (LOINC, Answer List) | Konsumen kode terminologi (mapping disiapkan opsional di master). |
| 9 | — | Hasil Laboratorium | Konsumen Nilai Kritis (flagging & notifikasi) + Kategori Hasil (tipe input). |
| 10 | — | Administrasi, Rekam Medis, Billing | Sinkronisasi data pemeriksaan lab. |

**Konsistensi lintas-PRD:** field `unit`, `status_aktif`, `file_import`, `mode_import`, `keterangan` mengikuti definisi kanonik bersama; `satuan` mengacu definisi di **A22** (Satuan & Kemasan).

---

## 6. Business Process & User Stories

### State Machine Table

Objek utama = **Item Pemeriksaan Laboratorium**. Status master data (bukan status stok); efek dijelaskan pada visibilitas & konsumsi modul hilir.

| Status | Deskripsi | Efek (Data & Konsumsi) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Pemeriksaan aktif & valid | Tampil di dashboard, tersedia di Order Penunjang; kode LOINC (bila ada) dibaca Pelayanan untuk auto-kirim | → `NONAKTIF` (toggle) · Edit (tetap `AKTIF`) | → `NONAKTIF`; Edit dapat memerlukan `PENDING_APPROVAL` sebelum berlaku |
| `NONAKTIF` | Pemeriksaan dinonaktifkan | Disembunyikan dari dashboard & Order Penunjang; **tetap tersimpan di history** (tidak dihapus fisik) | → `AKTIF` (aktifkan kembali) | → `AKTIF` (dapat via approval) |
| `PENDING_APPROVAL` *(Phase 2)* | Perubahan menunggu persetujuan | Perubahan belum berlaku di modul hilir; versi berjalan tetap dipakai | — (tidak ada di Phase 1) | → `AKTIF` (disetujui) / kembali ke pengaju (ditolak) |

> **Catatan status (aturan template):** status **tidak** disediakan sebagai input di form Create; sistem selalu men-set item baru = `AKTIF`. Pengelolaan aktif/nonaktif dilakukan di **Dashboard** (toggle). Kolom `status_approval` & `role_approver` sudah disiapkan di skema data sejak Phase 1 (idle) agar siap Phase 2.

### User Stories Utama

- **US-001** — Sebagai Admin Master Data Lab, saya ingin **menambah & mengubah** data pemeriksaan beserta komponennya di satu tempat, agar seluruh modul SIMRS memakai data yang sama. *(To-Be langkah 2)*
- **US-002** — Sebagai Admin Master Data Lab, saya ingin sistem **menolak kode LIS duplikat**, agar tidak ada data pemeriksaan ganda. *(BR-001)*
- **US-003** — Sebagai Petugas Integrasi, saya ingin **memetakan LOINC & Answer List dari daftar terverifikasi SATUSEHAT** secara opsional, agar tersedia sebagai kesiapan integrasi Observation. *(BR-002, BR-007)*
- **US-004** — Sebagai Petugas Integrasi, saya ingin **cukup menyimpan kode LOINC tanpa indikator kesiapan tambahan**, agar modul Pelayanan otomatis mengirim Observation saat pemeriksaan bila kode LOINC ada. *(BR-007, BR-015)*
- **US-005** — Sebagai Admin Master Data Lab, saya ingin mengatur **Kategori Hasil (Numerik/Diskret/Narasi)** per komponen, agar modul Hasil Lab memakai tipe input yang tepat. *(To-Be langkah 4)*
- **US-006** — Sebagai Admin Master Data Lab, saya ingin mendefinisikan **pilihan hasil (Answer List)** untuk pemeriksaan diskret, agar input hasil terbatas & konsisten. *(BR-005)*
- **US-007** — Sebagai Admin Master Data Lab, saya ingin mengatur **ambang Nilai Kritis (bawah & atas, boleh negatif)** per item numerik dengan validasi `bawah<atas`, agar hasil mengancam jiwa ditandai otomatis tanpa salah konfigurasi. *(BR-004, BR-014)*
- **US-008** — Sebagai Dokter (DPJP), saya ingin mendapat **notifikasi real-time** saat hasil pasien melewati nilai kritis, agar dapat menangani cepat. *(Phase 2)*
- **US-009** — Sebagai Admin Master Data Lab, saya ingin **menonaktifkan** pemeriksaan tanpa menghapus history, agar data lama tetap tertelusur. *(BR-003)*
- **US-010** — Sebagai Admin Master Data Lab, saya ingin **import/export** data (.xlsx/.csv) dengan kolom terminologi cukup kode LOINC, agar setup & pembaruan massal cepat. *(BR-016)*
- **US-011** — Sebagai Admin/Manajemen, saya ingin **mencari & memfilter** pemeriksaan cepat (<3 detik) dan melihat *last updated*, agar pengelolaan efisien. *(Metrik 2)*
- **US-012** — Sebagai Auditor/QA, saya ingin **log aktivitas perubahan**, agar keakuratan data terjamin. *(BR-010)*
- **US-013** — Sebagai Admin Master Data Lab, saya ingin memilih **satuan (UCUM) dari Master A22**, agar satuan komponen konsisten & valid untuk Observation. *(BR-008)*
- **US-014** — Sebagai Admin Master Data Lab, saya ingin menetapkan **rentang normal 1 baris** dengan jenis kelamin (L/P/Semua) atau **mengosongkannya**, agar acuan flag abnormal sesuai & sederhana. *(BR-011, BR-014)*
- **US-015** — Sebagai Admin Master Data Lab, saya ingin **menyimpan komponen numerik tanpa rentang normal** & **dengan nilai negatif** tervalidasi `min<=max`, agar pemeriksaan kuantitatif tanpa rujukan baku tetap terakomodasi. *(BR-014)*
- **US-016** — Sebagai Admin Master Data Lab, saya ingin **menyimpan kode LOINC header & komponen independen (boleh sebagian)** tanpa dipaksa melengkapi semuanya, agar pemetaan bertahap; perlakuan parsial diserahkan ke Pelayanan. *(BR-017, Out Scope #15)*

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Dashboard & Pencarian Pemeriksaan (FR-001)**
* **User Story**: Sebagai Admin/Manajemen, saya ingin mencari & memfilter pemeriksaan dengan cepat dan melihat *last updated*, agar pengelolaan efisien.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Dashboard menampilkan kolom: kode LIS, nama, kategori, kategori hasil, status pemetaan LOINC (informasional), status, last updated.
    * **AC 2**: Tersedia **search** (kode LIS / nama), **sort** (nama A-Z default, last updated), dan **filter kategori & status**.
    * **AC 3**: Hasil pencarian/filter tampil **< 3 detik** untuk dataset hingga ribuan pemeriksaan.
    * **AC 4**: Kartu ringkasan menampilkan **Total Pemeriksaan Aktif**.

**Fitur: Tambah/Edit Pemeriksaan + Validasi Duplikasi (FR-002, FR-003, FR-006)**
* **User Story**: Sebagai Admin Master Data Lab, saya ingin menambah & mengubah data pemeriksaan beserta komponennya di satu tempat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Create/Edit memuat data umum + sub-form komponen (tambah/edit/hapus komponen).
    * **AC 2**: Saat simpan (form & import), sistem **menolak kode LIS duplikat** dan menampilkan peringatan; simpan diblok.
    * **AC 3**: Form Create **tidak** menyediakan input status; item baru otomatis `AKTIF`.
    * **AC 4**: Penyimpanan mencatat entri **log aktivitas** (user, waktu, aksi, before/after).
* **Validasi — Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode LIS | Text | Required, unik, max 30 | "Kode LIS wajib diisi & harus unik" | "Kode alat/LIS, mis. HB01" |
  | Nama Pemeriksaan | Text | Required, max 150 | "Nama pemeriksaan wajib diisi" | "Nama lengkap pemeriksaan" |
  | Kategori Pemeriksaan | Text | Required, max 100 | "Kategori wajib diisi" | "mis. Hematologi, Kimia Klinik" |
  | Jenis Spesimen | Text | Required, max 100 | "Jenis spesimen wajib diisi" | "mis. Darah, Urin, Feses" |
  | Unit/Poli | Dropdown (A3) | Required | "Unit pelaksana wajib dipilih" | "Pilih unit = Laboratorium" |

**Fitur: Pemetaan LOINC & Answer List (Kesiapan, Opsional) (FR-004, FR-008, FR-017, FR-018)**
* **User Story**: Sebagai Petugas Integrasi, saya ingin memetakan LOINC & Answer List dari daftar terverifikasi SATUSEHAT secara opsional, sebagai kesiapan integrasi Observation.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Lookup LOINC (header & komponen) & LOINC Answer List **hanya** dari dataset **terverifikasi SATUSEHAT** (seed manual, read-only source).
    * **AC 2**: Field LOINC **opsional** — kosong **tidak** memblok simpan.
    * **AC 3**: Kode LOINC header & komponen disimpan **independen** (boleh terisi sebagian).
    * **AC 4**: A14 **tidak** menampilkan/menyimpan indikator/flag "kesiapan LOINC" terpisah; kehadiran kode = satu-satunya sinyal auto-kirim yang dibaca modul Pelayanan.
* **Validasi — Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode LOINC (panel/komponen) | Lookup | Optional, harus dari dataset terverifikasi | "Kode LOINC tidak ditemukan di daftar terverifikasi" | "Opsional — kesiapan integrasi SATUSEHAT" |
  | LOINC Answer Code | Lookup | Optional, dari Answer List terverifikasi | "Kode Answer tidak valid" | "Opsional, mis. LA6576-8" |

**Fitur: Kategori Hasil & Answer List (FR-007, FR-008)**
* **User Story**: Sebagai Admin Master Data Lab, saya ingin mengatur Kategori Hasil per komponen & pilihan hasil untuk diskret, agar modul Hasil Lab memakai tipe input yang tepat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Kategori Hasil dipilih per komponen: **Numerik / Diskret / Narasi**; field yang muncul menyesuaikan (form adaptif).
    * **AC 2**: Komponen **Diskret** wajib memiliki **≥ 2 pilihan hasil** (Answer List); simpan diblok bila < 2.
    * **AC 3**: Komponen **Narasi** tidak boleh punya rentang normal, satuan numerik, maupun Nilai Kritis.
    * **AC 4**: Mapping pilihan diskret ke LOINC Answer List **opsional**, via form (bukan kolom import).

**Fitur: Nilai Kritis & Rentang Normal (FR-009, FR-015)**
* **User Story**: Sebagai Admin Master Data Lab, saya ingin mengatur Nilai Kritis (bawah & atas) & rentang normal per komponen numerik dengan validasi ketat, agar hasil mengancam jiwa ditandai otomatis tanpa salah konfigurasi.
* **Prioritas**: P0
* **Fase**: Phase 1 (konfigurasi) · Phase 2 (konsumsi flagging/notifikasi)
* **Acceptance Criteria**:
    * **AC 1**: Nilai Kritis **hanya** untuk komponen Numerik, **hanya satu pasang** (bawah & atas), keduanya opsional; **tidak ada** level bertingkat.
    * **AC 2**: Bila kedua ambang diisi, sistem menegakkan **`critical_low < critical_high`** sebagai perbandingan numerik biasa (mis. `-10 < -3` valid); nilai **boleh negatif**.
    * **AC 3**: Rentang normal **cukup 1 baris** dengan jenis kelamin (L/P/Semua); **boleh dikosongkan**. Bila diisi, `nilai_normal_min <= nilai_normal_max` (berlaku pada nilai negatif, mis. `-5 <= -2` valid; `-2 <= -5` ditolak).
    * **AC 4**: Pelanggaran validasi memblok simpan **baik di form maupun import**, dan ditegakkan di level layanan/DB (bukan hanya UI).
    * **AC 5**: Satuan komponen numerik **di-lookup dari Master A22 (UCUM)**; bila diisi harus valid di A22.
* **Validasi — Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Satuan (UCUM) | Lookup (A22) | Optional, valid di A22, hanya Numerik | "Satuan tidak valid di Master A22" | "Sumber UCUM dari Master Satuan & Kemasan" |
  | Rentang Normal Min/Max | Number | Optional, boleh negatif, `min<=max` | "Nilai min harus ≤ max" | "Boleh dikosongkan; boleh negatif" |
  | Nilai Kritis Bawah/Atas | Number | Kondisional, boleh negatif, `bawah<atas` | "Nilai kritis bawah harus < atas" | "Hanya satu pasang ambang" |

**Fitur: Status Aktif/Nonaktif & Daftar Nonaktif (FR-010, FR-013)**
* **User Story**: Sebagai Admin Master Data Lab, saya ingin menonaktifkan pemeriksaan tanpa menghapus history, agar data lama tetap tertelusur.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Toggle status di Dashboard; nonaktif **menyembunyikan** dari dashboard & Order Penunjang.
    * **AC 2**: Data nonaktif **tetap tersimpan** (tidak dihapus fisik) & muncul di **halaman Daftar Pemeriksaan Nonaktif**.
    * **AC 3**: Tersedia aksi **Aktifkan kembali**; transisi tercatat di log aktivitas.

**Fitur: Import/Export Massal (FR-011, FR-012)**
* **User Story**: Sebagai Admin Master Data Lab, saya ingin import/export data (.xlsx/.csv) dengan kolom terminologi cukup kode LOINC, agar setup & pembaruan massal cepat.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Export menghasilkan file sesuai **template baku** (kolom & urutan tetap; terminologi cukup kode LOINC header & komponen).
    * **AC 2**: Import mendukung **mode**: *tambah* (tolak LIS duplikat) / *tambah+update* (update LIS existing).
    * **AC 3**: Validasi per baris: kode LIS unik; kode LOINC valid bila diisi; satuan valid di A22 bila diisi; `min<=max` & `bawah<atas` bila diisi (termasuk nilai negatif).
    * **AC 4**: Sistem menampilkan **ringkasan sukses/gagal per baris** sebelum konfirmasi commit.
* **Validasi — Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | File Pemeriksaan | File | Required, .csv/.xlsx, max 10MB, sesuai template | "Format/ukuran file tidak sesuai" | "Unduh template terlebih dahulu" |
  | Mode | Dropdown | Required, enum tambah / tambah+update | "Pilih mode import" | "Tambah, atau Tambah+Update" |

**Fitur: Log Aktivitas / Audit Trail (FR-014)**
* **User Story**: Sebagai Auditor/QA, saya ingin log aktivitas perubahan, agar keakuratan data terjamin.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap perubahan (tambah/edit/nonaktif/import) mencatat user, waktu, aksi, before/after.
    * **AC 2**: Log **tidak dapat dihapus**; dapat difilter per user & aksi, sort terbaru.

**Fitur: Ekspos Konfigurasi ke Hasil Lab (FR-016) — Phase 2**
* **User Story**: Sebagai Dokter (DPJP), saya ingin notifikasi real-time saat hasil pasien melewati nilai kritis.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Konfigurasi Nilai Kritis & Kategori Hasil terekspos (API/internal read-only) ke modul Hasil Laboratorium.
    * **AC 2**: Hasil numerik yang melewati ambang ter-flag & memicu notifikasi ke dokter; pelaporan/read-back tercatat untuk akreditasi.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `lab_examination` (header pemeriksaan)
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `lis_code`: VARCHAR(30) (Unique, Not Null) — dasar validasi duplikasi (BR-001)
    * `examination_name`: VARCHAR(150) (Not Null)
    * `examination_category`: VARCHAR(100) (Not Null) — input manual
    * `specimen_type`: VARCHAR(100) (Not Null) — input manual
    * `unit_id`: UUID (FK → `unit.id`, A3)
    * `loinc_code_header`: VARCHAR(20) (Nullable) — kesiapan; independen dari komponen (BR-017)
    * `examination_method`: VARCHAR(100) (Nullable)
    * `remark`: VARCHAR(255) (Nullable)
    * `is_active`: Boolean (default true) — dikelola via toggle Dashboard
    * `status_approval`: VARCHAR(20) (default `'APPROVED'`) — *disiapkan untuk Phase 2*
    * `role_approver`: VARCHAR(50) (Nullable) — *disiapkan untuk Phase 2*
    * `created_at`, `updated_at`: TIMESTAMP

* **Table Name**: `lab_examination_component` (item/komponen)
* **Key Columns**:
    * `id`: UUID (PK) · `examination_id`: UUID (FK → `lab_examination.id`, ON DELETE CASCADE)
    * `component_name`: VARCHAR(100) (Not Null)
    * `loinc_code_component`: VARCHAR(20) (Nullable) — independen dari header (BR-017)
    * `result_category`: ENUM(`NUMERIC`,`DISCRETE`,`NARRATIVE`) (Not Null)
    * `unit_id`: UUID (Nullable, FK → `unit_of_measure.id`, A22 — UCUM) — hanya NUMERIC
    * `ref_gender`: ENUM(`MALE`,`FEMALE`,`ALL`) (default `ALL`)
    * `normal_min`: DECIMAL(12,4) (Nullable, boleh negatif) — hanya NUMERIC
    * `normal_max`: DECIMAL(12,4) (Nullable, boleh negatif) — CHECK `normal_min <= normal_max`
    * `critical_enabled`: Boolean (default false)
    * `critical_low`: DECIMAL(12,4) (Nullable, boleh negatif)
    * `critical_high`: DECIMAL(12,4) (Nullable, boleh negatif) — CHECK `critical_low < critical_high`

* **Table Name**: `lab_component_answer` (Answer List untuk komponen DISCRETE)
* **Key Columns**:
    * `id`: UUID (PK) · `component_id`: UUID (FK → `lab_examination_component.id`, ON DELETE CASCADE)
    * `answer_text`: VARCHAR(100) (Not Null) — min 2 baris per komponen (BR-005)
    * `loinc_answer_code`: VARCHAR(20) (Nullable) — kesiapan, via form
    * `display_order`: INT (Nullable, ≥1) · `is_default`: Boolean (default false) — maks 1 default

* **Table Name**: `lab_activity_log` (audit trail — append-only)
* **Key Columns**:
    * `id`: UUID (PK) · `examination_id`: UUID (FK) · `user_id`: UUID
    * `action`: ENUM(`CREATE`,`UPDATE`,`DEACTIVATE`,`ACTIVATE`,`IMPORT`)
    * `before_after`: JSONB · `created_at`: TIMESTAMP

* **Reference (seed manual, read-only)**: `terminology_loinc` (`loinc_code` PK, `display_name`, `version`), `terminology_loinc_answer` (`answer_code` PK, `display_name`) — sumber lookup terverifikasi SATUSEHAT (BR-002, BR-012).

> **Constraint**: `lis_code` unique di level DB (NFR-005). `normal_min<=normal_max` & `critical_low<critical_high` ditegakkan via CHECK constraint/trigger (berlaku pada nilai negatif) — bukan hanya UI.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lab-examinations` | List pemeriksaan (search, sort, filter kategori/status, pagination) |
| GET | `/api/v1/lab-examinations/{id}` | Detail pemeriksaan + komponen + answer list |
| POST | `/api/v1/lab-examinations` | Create pemeriksaan (status default AKTIF) |
| PUT | `/api/v1/lab-examinations/{id}` | Update pemeriksaan + komponen |
| PATCH | `/api/v1/lab-examinations/{id}/status` | Toggle Active/Inactive |
| GET | `/api/v1/lab-examinations/inactive` | List pemeriksaan nonaktif |
| POST | `/api/v1/lab-examinations/import` | Import massal (mode: tambah / tambah+update) + ringkasan validasi |
| GET | `/api/v1/lab-examinations/export` | Export .xlsx/.csv sesuai template baku |
| GET | `/api/v1/terminology/loinc?q=` | Lookup LOINC terverifikasi (seed) |
| GET | `/api/v1/terminology/loinc-answers?q=` | Lookup LOINC Answer List terverifikasi |
| GET | `/api/v1/units-of-measure?q=` | Lookup satuan UCUM dari Master A22 |
| GET | `/api/v1/lab-examinations/{id}/logs` | Log aktivitas per pemeriksaan |
| GET | `/api/v1/lab-examinations/{id}/config` | *(Phase 2)* Ekspos Nilai Kritis & Kategori Hasil (read-only) untuk Hasil Lab |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

**A. Data Umum Pemeriksaan** — *FR-002/003/004*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| kode_lis | Kode LIS | text | Ya | unik, max 30 | manual | dasar validasi duplikasi (BR-001) |
| nama_pemeriksaan | Nama Pemeriksaan | text | Ya | max 150 | manual | |
| kategori_pemeriksaan | Kategori Pemeriksaan | text | Ya | max 100 | manual (tanpa master) | mis. Hematologi; filter dashboard |
| jenis_spesimen | Jenis Spesimen | text | Ya | max 100 | manual (tanpa master) | mis. Darah/Urin/Feses |
| unit | Unit/Poli (pelaksana) | dropdown (lookup) | Ya | dari master Unit (A3) | lookup A3 | **field kanonik** = Laboratorium |
| kode_loinc_header | Kode LOINC (panel) | lookup | Tidak | dataset LOINC terverifikasi (seed) | integrasi SATUSEHAT | kesiapan; kosong tidak memblok simpan; ada = sinyal auto-kirim (BR-015); independen dari komponen (BR-017) |
| metode_pemeriksaan | Metode | text | Tidak | max 100 | manual | mis. Flowcytometry, ELISA [ASUMSI] |
| keterangan | Keterangan | text | Tidak | max 255 | manual | **field kanonik** |

> Status **tidak** disediakan di form Create (selalu `AKTIF`); toggle di Dashboard (BR-003). Field `kode_kptl` & `kirim_satusehat` **tidak ada** (out scope; pengiriman dibaca dari ada/tidaknya `kode_loinc_*`).

**B. Sub-form Item/Komponen Pemeriksaan** — *FR-006/007/009/015*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| nama_komponen | Nama Komponen | text | Ya | max 100 | manual | mis. HGB, WBC |
| kode_loinc_komponen | LOINC Komponen | lookup | Tidak | dataset terverifikasi (seed) | integrasi SATUSEHAT | kesiapan; independen dari header; boleh sebagian (BR-017) |
| kategori_hasil | Kategori Hasil | dropdown | Ya | enum Numerik/Diskret/Narasi | enum | menentukan field tampil (FR-007) |
| satuan | Satuan (UCUM) | lookup | Tidak | valid di A22; hanya Numerik | Master A22 | kode UCUM dikelola di A22 (BR-008) |
| ref_gender | Jenis Kelamin Rujukan | dropdown | Tidak | enum L / P / Semua | default Semua | atribut 1 baris rujukan (BR-011) |
| nilai_normal_min | Rentang Normal - Min | number | Tidak | numerik, boleh negatif | manual | hanya Numerik; boleh kosong (BR-014) |
| nilai_normal_max | Rentang Normal - Max | number | Tidak | `>= min` (termasuk negatif), boleh negatif | manual | hanya Numerik; boleh kosong (BR-014) |
| critical_aktif | Aktifkan Nilai Kritis | boolean | Tidak | default nonaktif | manual | hanya Numerik (BR-004) |
| critical_low | Nilai Kritis Bawah | number | Kondisional | wajib bila critical_aktif; boleh negatif | manual | mis. HGB 7.0 |
| critical_high | Nilai Kritis Atas | number | Kondisional | `critical_low < critical_high` (termasuk negatif); boleh negatif | manual | hanya pasangan bawah/atas, tanpa level bertingkat (BR-004) |

**C. Sub-form Answer List (komponen Diskret)** — *FR-008*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| pilihan_hasil | Pilihan Hasil | text | Ya | min 2 pilihan/komponen | manual | mis. Positif/Negatif (BR-005) |
| kode_answer_loinc | LOINC Answer Code | lookup | Tidak | dari Answer List terverifikasi (seed) | integrasi SATUSEHAT | kesiapan; via form, bukan kolom template (BR-016) |
| urutan | Urutan Tampil | number | Tidak | integer ≥1 | manual | urutan dropdown di Hasil Lab |
| is_default | Default | boolean | Tidak | maks 1 default | default false | |

**D. Form Import Massal** — *FR-012*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| file_import | File Pemeriksaan | file | Ya | .csv/.xlsx, sesuai template, max 10MB | manual upload | **field kanonik** |
| mode_import | Mode | dropdown | Ya | enum tambah / tambah+update | enum | **field kanonik** (BR-009) |

> **Kolom baku Template Import/Export (FINAL — BR-016):**
> `kode_lis | nama_pemeriksaan | kategori_pemeriksaan | jenis_spesimen | unit | kode_loinc_header | metode_pemeriksaan | keterangan | status_aktif | nama_komponen | kode_loinc_komponen | kategori_hasil | satuan | ref_gender | nilai_normal_min | nilai_normal_max | critical_aktif | critical_low | critical_high`
> Terminologi cukup kode LOINC (header & komponen). Tidak ada kolom `kirim_satusehat`/`kode_kptl`. Mapping LOINC Answer List via form.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

**E. Dashboard Master Data Lab** — *FR-001*

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Total Pemeriksaan Aktif | count where is_active | angka (kartu) | – | ringkasan |
| Kode LIS | lab_examination.lis_code | text | sort, filter | |
| Nama Pemeriksaan | lab_examination.examination_name | text | sort A-Z (default) | |
| Kategori | lab_examination.examination_category | text/badge | filter | |
| Kategori Hasil | component.result_category | badge (Numerik/Diskret/Narasi) | filter | agregasi bila multi-komponen |
| LOINC | loinc_code_header | badge (Terpetakan/Belum) | filter | informasional; Terpetakan → auto-kirim oleh Pelayanan (BR-015); tidak memblok |
| Status | is_active | badge (Aktif/Nonaktif) | filter | |
| Last Updated | log.updated_at | tanggal-waktu | sort terbaru | dari log aktivitas (FR-014) |

**F. Daftar Pemeriksaan Nonaktif** — *FR-013*

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kode LIS / Nama | where !is_active | text | sort | |
| Tgl Nonaktif | log aktivitas | tanggal | sort terbaru | |
| Dinonaktifkan oleh | log.user | text | – | audit |
| Aksi | – | tombol Aktifkan kembali | – | mempertahankan history (BR-003) |

**G. Log Aktivitas** — *FR-014*

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Waktu | log.created_at | tanggal-waktu | sort terbaru | |
| User | log.user | text | filter | |
| Aksi | log.action | badge (Tambah/Edit/Nonaktif/Import) | filter | |
| Objek | log.lis_code | text | – | pemeriksaan terdampak |
| Perubahan | log.before_after | teks ringkas | – | before/after |

#### Business Rules

| ID | Rule |
|----|------|
| BR-001 | Validasi **duplikasi** dievaluasi berdasarkan **kode LIS**; kode LIS wajib unik. |
| BR-002 | Pemetaan **LOINC & Answer List** WAJIB dari daftar **terverifikasi tim SATUSEHAT**, bukan browser LOINC publik. |
| BR-003 | Pemeriksaan **nonaktif** disembunyikan dari dashboard & order penunjang, tetapi **tetap tersimpan di history** (tidak dihapus fisik). |
| BR-004 | **Nilai Kritis** hanya untuk komponen **Numerik**, **hanya satu pasang** (bawah & atas), keduanya opsional; bila keduanya diisi `critical_low < critical_high` ditegakkan (perbandingan numerik biasa, berlaku pada nilai negatif). Nilai boleh negatif. Tidak ada level bertingkat. |
| BR-005 | Komponen **Diskret** WAJIB memiliki minimal 2 pilihan hasil (Answer List). Mapping ke LOINC Answer List opsional (kesiapan). |
| BR-006 | Komponen **Narasi** tidak boleh memiliki rentang normal, satuan numerik, maupun Nilai Kritis. |
| BR-007 | Pemetaan LOINC di master **OPSIONAL (kesiapan)**. Penentuan & pemaksaan kelengkapan LOINC sebelum kirim **di modul Pelayanan Penunjang** — A14 tidak memblok simpan karena LOINC kosong. |
| BR-008 | Satuan komponen numerik **bersumber dari Master A22** & mengacu **UCUM** (Observation.valueQuantity); kode UCUM dikelola di A22. |
| BR-009 | Pada **Import**, baris kode LIS duplikat ditolak (mode *tambah*) atau di-update (mode *tambah+update*) sesuai `mode_import`. [ASUMSI] |
| BR-010 | Setiap perubahan (tambah/edit/nonaktif/import) dicatat di **log aktivitas** (user, waktu, aksi, before/after). |
| BR-011 | Rentang normal **cukup 1 baris per komponen**, dengan jenis kelamin **L / P / Semua**. Tidak ada multi-baris & tidak ada granularitas usia. |
| BR-012 | Dataset terminologi disiapkan & diperbarui via **seed manual**; **tidak ada sinkronisasi otomatis/berkala**. |
| BR-013 | **Integrasi eksternal modul ini hanya ke SATUSEHAT.** Pemetaan klaim KPTL/BPJS/INA-CBG **di luar lingkup** A14. |
| BR-014 | Komponen numerik **boleh tanpa rentang normal**. Bila diisi, nilai rentang & kritis **boleh negatif**; `nilai_normal_min <= nilai_normal_max` ditegakkan sebagai perbandingan numerik biasa (mis. `-5 <= -2` valid; `-2 <= -5` ditolak). |
| BR-015 | **A14 TIDAK menyediakan indikator/flag/API 'kesiapan LOINC' terpisah.** Kehadiran kode LOINC = satu-satunya sinyal kesiapan: terisi → Pelayanan **otomatis mengirim** Observation; kosong → tidak dikirim. |
| BR-016 | Pada file **Import/Export**, terminologi **cukup kolom kode LOINC** (header & komponen). Tanpa kolom `kirim_satusehat`/`kode_kptl`; mapping Answer List via form. |
| BR-017 | **(v1.4)** A14 menyimpan kode LOINC **per header & per komponen independen, apa adanya** (boleh sebagian). Perlakuan pengiriman parsial **bukan lingkup A14** — ditentukan modul Pelayanan Penunjang. |
| BR-018 | **(v1.4)** Bentuk teknis kontrak akses kode LOINC/konfigurasi dari A14 ke konsumen (tabel/view/service) **bukan keputusan A14** melainkan arsitektur; kewajiban A14 = menyimpan & memelihara data referensi read-consistent. |

---

## 9. Workflow / BPMN Interpretation

> Modul ini **belum punya BPMN sendiri**; alur diturunkan dari pola master data (analogi: *g-admisi-onsite-registration* untuk duplicate detection & integrasi, *g-backoffice-inventory-penerimaan* untuk pola form simpan/validasi). Bagian turunan ditandai **[ASUMSI]**.

**Aktor:** Petugas Laboratorium / Admin Master Data (pengelola), Sistem (validasi & lookup terminologi), Modul Pelayanan Penunjang (pemilik keputusan kirim SATUSEHAT), Modul Hasil Laboratorium (konsumen, Phase 2).

**Alur inti (To-Be):**
1. **Buka Dashboard** → cari/filter pemeriksaan.
2. **Tambah Pemeriksaan** → isi data umum (kode LIS, nama, kategori, spesimen, unit) → **Gateway: Kode LIS sudah ada?** Ya → tolak & blok simpan; Tidak → lanjut.
3. **(Opsional) Pilih LOINC header** dari daftar terverifikasi (kesiapan; tanpa gateway wajib).
4. **Tambah komponen** → **Gateway: Kategori Hasil?**
   - **Numerik** → pilih satuan (UCUM/A22), rentang normal 1 baris (L/P/Semua, boleh kosong), Nilai Kritis (bawah/atas, boleh negatif) → **validasi `min<=max` & `bawah<atas`**.
   - **Diskret** → definisikan Answer List (≥2) + mapping LOINC Answer (opsional).
   - **Narasi** → set text area (tanpa range/answer/kritis/satuan).
5. **Simpan** → bila lolos validasi → tersimpan, **log aktivitas** tercatat, langsung berlaku di modul terkait.
6. **Nonaktifkan** → hilang dari dashboard & order; tetap di history (aktifkan kembali tersedia).
7. **Import/Export** massal (.xlsx/.csv) — mode tambah / tambah+update; validasi & ringkasan per baris → konfirmasi commit.
8. **[Modul Pelayanan]** Saat pemeriksaan dilakukan: **Gateway: kode LOINC ada?** Ada → Observation OTOMATIS dibentuk & dikirim ke SATUSEHAT; Kosong → tidak dikirim. *(v1.4: cara akses data & perlakuan LOINC parsial = ranah modul Pelayanan — Out Scope #14/#15.)*
9. **[Phase 2]** Modul Hasil Lab membaca konfigurasi Nilai Kritis → hasil melewati ambang → flag kritis + notifikasi real-time ke dokter + log read-back.

---

## Asumsi & Catatan

- [ASUMSI] Modul belum punya BPMN sendiri; alur As-Is/To-Be diturunkan dari pola master data & analogi *g-admisi-onsite-registration* (duplicate detection) serta *g-backoffice-inventory-penerimaan* (form simpan/validasi).
- [ASUMSI] RS Tipe C & D punya layanan lab terbatas; import/export massal & seed manual terminologi diperlukan agar setup tidak bergantung input manual per item.
- [ASUMSI] Field kanonik (unit, status_aktif, file_import, mode_import, keterangan) mengikuti definisi bersama lintas-PRD Control Panel; `satuan` mengikuti definisi Master A22.
- [ASUMSI] Notifikasi nilai kritis & log read-back adalah Phase 2; A14 hanya menyediakan konfigurasi/penyimpanan acuan.
- [ASUMSI] Tarif pemeriksaan dikelola di master Tindakan (A10); modul ini hanya mereferensikan untuk billing.
- [ASUMSI] Contoh kode LOINC Answer (LA6576-8/LA6577-6) ilustratif; nilai final mengikuti dataset terverifikasi SATUSEHAT.
- [CONFIRMED — refinement user v1.3] Tidak ada indikator/flag/API 'kesiapan LOINC' terpisah; kehadiran kode LOINC = sinyal kesiapan (BR-015).
- [CONFIRMED — refinement user v1.3] Validasi `nilai_normal_min <= nilai_normal_max` & `critical_low < critical_high` berlaku termasuk pada nilai negatif (BR-004/BR-014).
- [CONFIRMED — refinement user v1.3] Template Import/Export: terminologi cukup kode LOINC; tanpa kolom kirim_satusehat/KPTL; mapping Answer List via form (BR-016).
- [CONFIRMED — refinement user v1.4] Bentuk teknis kontrak akses read-only A14 → Pelayanan Penunjang BUKAN lingkup A14 (Out Scope #14, BR-018).
- [CONFIRMED — refinement user v1.4] Perlakuan pengiriman parsial Observation BUKAN lingkup A14; A14 menyimpan kode LOINC header & komponen independen/boleh parsial (Out Scope #15, BR-017).
- [CONFIRMED — refinement user] Rentang normal cukup 1 baris per komponen (L/P/Semua); komponen numerik boleh tanpa rentang normal & nilai boleh negatif.
- [CONFIRMED — refinement user] Satuan bersumber dari Master A22 (UCUM); kategori pemeriksaan & jenis spesimen input manual; integrasi hanya ke SATUSEHAT; Nilai Kritis satu pasang; dataset via seed manual.

**Open Questions:** — (dikosongkan; kedua open question v1.3 ditutup sebagai Out of Scope #14 & #15 pada v1.4)
