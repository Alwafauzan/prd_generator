# PRD — Casemix: Pengelolaan Klaim Asuransi Swasta (Integrasi SATUSEHAT)

**Related Document:** Penerusan fitur Billing/Tagihan Pasien (G2); List Fitur V2.xlsx (sheet MVP Fitur Operasional) — G11–G14; acuan tampilan layar: `reff/casemix_list.png`, `casemix_tagihan.png`, `casemix_opsi.png`, `casemix_filter_lainnya.png`, `casemix_pilih_sebagian.png`
**Versi:** 1.4 - Seluruh fungsi menu Opsi penunjang masuk Phase 1
**Tanggal:** 2026-07-14

## 1. Metadata Dokumen

- **Approval:** [PERLU KONFIRMASI] — Nama Stakeholder, Jabatan, Tanggal (mis. Kepala Casemix / Manajer Keuangan RS)
- **Related Documents:**
  - Penerusan fitur **Billing/Tagihan Pasien (G2)**.
  - List Fitur V2.xlsx (sheet MVP Fitur Operasional) — G11–G14.
  - Acuan tampilan layar: `reff/casemix_list.png`, `casemix_tagihan.png`, `casemix_opsi.png`, `casemix_filter_lainnya.png`, `casemix_pilih_sebagian.png`.
  - [PERLU KONFIRMASI] Spesifikasi payload/endpoint SATUSEHAT untuk episode pasien asuransi swasta.
- **Document Version:**
  | Tanggal | Versi | Deskripsi Perubahan |
  |---------|-------|---------------------|
  | 2026-07-10 | 1.0 | Draft awal (pola E-klaim generik). |
  | 2026-07-10 | 1.1 | Penyesuaian khusus asuransi swasta (kirim ke SATUSEHAT, elemen BPJS dihilangkan). |
  | 2026-07-10 | 1.2 | Restrukturisasi ke format template: phasing, state machine, acceptance criteria, skema DB & API. |
  | 2026-07-14 | 1.3 | Penegasan perilaku menu Opsi penunjang sesuai V1, termasuk notifikasi data hasil yang tidak tersedia. |
  | 2026-07-14 | 1.4 | Seluruh fungsi menu Opsi penunjang ditetapkan masuk Phase 1 (bukan Phase 2). |

## 2. Overview & Background

### Overview / Brief Summary
Modul **Casemix — Pengelolaan Klaim Asuransi Swasta** (kode fitur **G13**, cluster *Core Integration* > Casemix) adalah **penerusan dari fitur Billing/Tagihan Pasien (G2)** yang dikhususkan untuk pasien berpenjamin **asuransi swasta (di luar BPJS)**. Layar utama modul ini adalah **list/worklist Casemix** tempat petugas Casemix meninjau episode pelayanan pasien asuransi, **melihat & mencetak dokumen tagihan**, serta **mengirim data pelayanan ke SATUSEHAT**.

Karakter layar: pencarian **Nama & No. RM**; kolom list No., Tgl Masuk/Keluar, Nama Pasien, Tipe Pelayanan, **Terakhir Dikirim (Satu Sehat)**, Total Tagihan, Lihat dan Cetak; aksi **Asesment / Invoice / Kwitansi / Unduh Dokumen** dan **Opsi (⋮)** untuk penunjang; pengiriman **Kirim Seluruhnya (default)** atau **Pilih Sebagian**.

### Business Process (As-Is vs To-Be)

**As-Is (kondisi saat ini):**
1. Data pasien asuransi swasta sudah ada di Billing/Tagihan (G2), namun **belum ada layar Casemix khusus** untuk meninjau dan mengirim datanya.
2. Peninjauan dokumen (Asesment/Invoice/Kwitansi) dan penunjang dilakukan berpindah-pindah layar.
3. Pengiriman data episode pasien asuransi ke **SATUSEHAT** belum terkelola dari satu tempat.

*Kendala:* proses manual/berpindah layar, rawan episode terlewat kirim ke Satu Sehat, verifikasi dokumen lambat.

**To-Be (workflow digital yang diusulkan):**
1. Petugas Casemix membuka **layar Casemix Asuransi Swasta** → sistem menampilkan **list episode** pasien penjamin asuransi (dari G2) sesuai Periode & filter default.
2. Petugas **mencari** (Nama / No. RM) dan/atau **memfilter** (Periode, Tanggal Awal/Akhir, Tipe Layanan, Unit; Lainnya: Status Pulang, Cara Pulang).
3. Petugas **Lihat & Cetak** (Asesment/Invoice/Kwitansi) atau **Unduh Dokumen** (Invoice + Kwitansi); membuka penunjang via **Opsi (⋮)** dengan perilaku **sama dengan V1**: E-Resep mengambil transaksi e-resep, sedangkan Laboratorium, Radiologi, dan Patologi Anatomi mengambil hasil kunjungan pasien terkait.
4. Petugas menentukan cakupan kirim: **Seluruhnya (default)** atau **Pilih Sebagian** (tandai baris → akumulasi Total Kirim Data).
5. Klik **Kirim Data** → data dikirim ke **SATUSEHAT**; bila berhasil → **Terakhir Dikirim (Satu Sehat)** diperbarui; bila gagal → **Gagal Kirim** → dapat **kirim ulang**.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | % episode pasien asuransi swasta yang terkirim ke Satu Sehat | ≥ 95% |
| 2 | Rata-rata waktu review + kirim per pasien | turun ≥ 40% vs proses manual |
| 3 | % dokumen (Asesment/Invoice/Kwitansi) dapat dilihat/cetak dari 1 layar | 100% |
| 4 | % data terkirim sukses setelah kirim ulang (keandalan koneksi RS C/D) | ≥ 99% |
| 5 | Ketersediaan mode Kirim Seluruhnya & Pilih Sebagian | Tersedia & lulus UAT |

> [PERLU KONFIRMASI] Angka target final bersama manajemen Casemix; baseline dari operasional sebelum go-live.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP) | Phase 2 (Advanced) |
|-------------|---------------|--------------------|
| **List & Worklist Casemix Asuransi Swasta** | Tampilkan list episode `insurance` -> Tipe Penjamin, pencarian (Nama/No. RM), filter (Periode, Tgl, Tipe Layanan, Unit, Status/Cara Pulang), paginasi | — |
| **Lihat & Cetak Dokumen** | Asesment, Invoice, Kwitansi, Unduh Dokumen (Invoice + Kwitansi) | — |
| **Opsi Penunjang (⋮)** | Seluruh fungsi masuk **Phase 1 (phase ini)** dengan perilaku **sama dengan V1**: E-Resep mengambil transaksi e-resep; Laboratorium, Radiologi, dan Patologi Anatomi mengambil hasil berdasarkan kunjungan pasien. Sistem memberi notifikasi/alert bila hasil tidak tersedia. | — |
| **Kirim Data ke SATUSEHAT** | Kirim Seluruhnya / Pilih Sebagian, Total Kirim Data, status Terakhir Dikirim, Gagal Kirim & kirim ulang | Penjadwalan/otomasi kirim, penerimaan status via webhook/polling [ASUMSI] |
| **Klaim/Settlement TPA Asuransi** | — | (opsional) pengajuan nilai, verifikasi, resubmit, rekonsiliasi pembayaran [PERLU KONFIRMASI] |

**Out of Scope:**
- Coding/grouping BPJS INA-CBG & E-klaim Kemenkes → G5–G10.
- Pengajuan/penerimaan klaim manual → G11.
- Pembangunan konektor teknis pihak ketiga → G12.
- Manajemen/repositori dokumen medis → G14.
- Proses akuntansi/jurnal keuangan penuh → modul Keuangan/Backoffice.

## 5. Related Features

| Code | Menu / Sub-fitur | Relasi Teknis/Bisnis dengan G13 |
|------|------------------|---------------------------------|
| **G2** | Billing/Kasir > Tagihan Pasien | **Fitur induk** — sumber list, total tagihan, item tagihan, Invoice & Kwitansi |
| **G3** | Billing/Kasir > Deposito/Dana Pasien | Perhitungan tanggungan/limit asuransi vs pasien [ASUMSI] |
| **G11** | Klaim Asuransi Swasta > Pengajuan & penerimaan klaim | Alur klaim manual ke asuransi (di luar phase ini) |
| **G12** | Klaim Asuransi Swasta > Integrasi third party | Konektor API klaim swasta (di luar phase ini) |
| **G14** | Klaim Asuransi Swasta > Manajemen Dokumen & Data Medis | Sumber dokumen medis pendukung |
| **SATUSEHAT Integration** (G23–G27) | Integrasi Kemenkes | **Tujuan kirim data** episode pasien asuransi swasta |
| **Modul Pelayanan** (E-Resep, Lab, Radiologi, PA) | Modul penunjang | Data kunjungan diambil melalui **Opsi (⋮)** dengan perilaku **sama dengan V1** |

## 6. Business Process & User Stories

### State Machine Table — Status Kirim SATUSEHAT (per episode)

| Status | Deskripsi | Efek | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------|--------------------|--------------------|
| `BELUM_DIKIRIM` | Episode siap namun belum dikirim ke Satu Sehat | Muncul di worklist; kolom Terakhir Dikirim = "—" | → `TERKIRIM` (aksi Kirim Data) | → `TERKIRIM` (kirim manual / terjadwal) |
| `TERKIRIM` | Data berhasil dikirim ke SATUSEHAT | Terakhir Dikirim = timestamp; masih bisa kirim ulang | → `TERKIRIM` (kirim ulang) | idem + pembaruan status via webhook/polling |
| `GAGAL_KIRIM` | Pengiriman gagal (koneksi/validasi payload) | Ditandai (badge merah); masuk antrean kirim ulang | → `TERKIRIM` (kirim ulang berhasil) / tetap `GAGAL_KIRIM` | idem + retry otomatis terjadwal [ASUMSI] |

> Tidak ada approval berjenjang pada modul ini. Kolom `satusehat_send_status` & `sent_at` disiapkan sejak Phase 1 agar Phase 2 (penjadwalan/webhook) tidak mengubah skema.

### User Stories Utama

- **US-001** — Sebagai **Petugas Casemix**, saya ingin melihat **list pasien penjamin asuransi swasta** beserta tagihannya dalam satu layar, agar mudah meninjau & mengirim data.
- **US-002** — Sebagai **Petugas Casemix**, saya ingin **mencari (Nama/No. RM)** & **memfilter** episode, agar cepat menemukan data yang dituju.
- **US-003** — Sebagai **Petugas Casemix**, saya ingin **melihat & mencetak Asesment, Invoice, Kwitansi**, agar verifikasi dokumen tidak berpindah layar.
- **US-004** — Sebagai **Petugas Casemix**, saya ingin **Unduh Dokumen** (Invoice + Kwitansi) sekaligus, agar praktis mengarsipkan berkas.
- **US-005** — Sebagai **Petugas Casemix**, saya ingin membuka data penunjang via **Opsi** dengan perilaku yang sama dengan V1, agar dapat meninjau transaksi e-resep atau hasil pemeriksaan dari kunjungan pasien terkait.
- **US-006** — Sebagai **Petugas Casemix**, saya ingin **mengirim data ke Satu Sehat** (seluruhnya / pilih sebagian), agar fleksibel sesuai kebutuhan.
- **US-007** — Sebagai **Petugas Casemix**, saya ingin melihat **kapan terakhir dikirim** & **kirim ulang bila gagal**, agar tidak ada episode terlewat.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: List Casemix Asuransi Swasta**
- **User Story:** Sebagai Petugas Casemix, saya ingin melihat list pasien penjamin asuransi swasta beserta tagihannya, agar mudah meninjau & mengirim data.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** List **hanya** menampilkan episode dengan `insurance` (swasta) -> Master Data Tipe Penjamin (A20); pasien BPJS & Umum tidak muncul.
  - **AC 2:** Kolom tampil berurutan: No., Tgl Masuk/Keluar, Nama Pasien (+No. RM), Tipe Pelayanan, Terakhir Dikirim (Satu Sehat), Total Tagihan, Lihat dan Cetak.
  - **AC 3:** Data default dimuat sesuai Periode & rentang tanggal default; mendukung **paginasi** & **Pasien Per Halaman** (10/25/50).
  - **AC 4:** Kolom Terakhir Dikirim menampilkan `Satu Sehat : <dd-mm-yyyy>` bila sudah dikirim, atau `—` bila belum.

**Fitur: Pencarian & Filter**
- **User Story:** Sebagai Petugas Casemix, saya ingin mencari by Nama/No. RM & memfilter episode, agar cepat menemukan data yang dituju.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Pencarian mencocokkan **Nama Pasien** atau **No. RM** (partial, case-insensitive); menekan **Cari** memuat hasil.
  - **AC 2:** Tersedia filter: Periode, Tanggal Awal, Tanggal Akhir, Tipe Layanan, Unit.
  - **AC 3:** Popover **Lainnya** menampilkan **Status Pulang** & **Cara Pulang**, dengan badge jumlah filter aktif.
  - **AC 4:** Bila hasil kosong → tampilkan pesan "tidak ada data".
- **Validasi:**

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Pencarian | Text | Optional, max 100 | — | "Cari nama pasien atau nomor RM" |
  | Periode | Dropdown | Required | "Periode wajib dipilih" | "Waktu Masuk / Waktu Pulang (default: Waktu Pulang)" |
  | Tanggal Awal | Date | Required, ≤ Tanggal Akhir | "Tanggal awal tidak boleh melebihi tanggal akhir" | "Pilih tanggal awal periode" |
  | Tanggal Akhir | Date | Required, ≥ Tanggal Awal | "Tanggal akhir tidak boleh sebelum tanggal awal" | "Pilih tanggal akhir periode" |
  | Tipe Layanan | Dropdown | Optional (default Semua) | — | "Semua / Rawat Inap / Rawat Jalan" |
  | Unit | Dropdown | Optional | — | "Pilih dari Master Data Unit" |
  | Status Pulang | Dropdown | Optional (default Semua) | — | "Semua / Dipulangkan / Belum Dipulangkan" |
  | Cara Pulang | Dropdown | Optional (default Semua) | — | "Semua / Atas Persetujuan Dokter / Atas Persetujuan Pribadi / Dirujuk / Meninggal / Lain-Lain" |

**Fitur: Lihat & Cetak Dokumen**
- **User Story:** Sebagai Petugas Casemix, saya ingin melihat & mencetak Asesment, Invoice, Kwitansi, agar verifikasi dokumen tidak berpindah layar.
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Setiap baris menyediakan aksi **Asesment**, **Invoice**, **Kwitansi**.
  - **AC 2:** Invoice/Kwitansi menampilkan **Data Pasien**, **Ringkasan Tagihan**, dan **Detail Tagihan per unit** (acuan `reff/casemix_tagihan.png`).
  - **AC 3:** Dokumen dapat **dicetak** dan isinya sesuai episode terkait.

**Fitur: Unduh Dokumen**
- **User Story:** Sebagai Petugas Casemix, saya ingin mengunduh Invoice + Kwitansi sekaligus, agar praktis mengarsipkan berkas.
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Aksi **Unduh Dokumen** per baris mengunduh **Invoice + Kwitansi** dalam satu proses (mis. gabung PDF / zip).
  - **AC 2:** Tombol **Unduh Dokumen (bulk)** pada header mengunduh dokumen untuk data terpilih/terfilter.

**Fitur: Menu Opsi Penunjang (⋮)**
- **User Story:** Sebagai Petugas Casemix, saya ingin membuka data penunjang melalui menu Opsi dengan perilaku yang sama dengan V1, agar dapat meninjau data berdasarkan kunjungan pasien terkait.
- **Prioritas:** P1
- **Fase:** Phase 1
- **Keterangan:** Seluruh menu beserta fungsi pengambilan datanya masuk **Phase 1 (phase ini), bukan Phase 2**, dengan perilaku **masih sama dengan V1**.
- **Acceptance Criteria:**
  - **AC 1:** Menu Opsi menampilkan pilihan **E-Resep, Laboratorium, Radiologi, dan Patologi Anatomi**.
  - **AC 2:** Memilih **E-Resep** mengambil dan menampilkan transaksi e-resep pada kunjungan pasien terkait.
  - **AC 3:** Memilih **Laboratorium** mengambil dan menampilkan hasil laboratorium pada kunjungan pasien terkait. Bila tidak ada hasil, sistem menampilkan notifikasi **"Tidak ada Hasil Lab"**.
  - **AC 4:** Memilih **Radiologi** mengambil dan menampilkan hasil radiologi pada kunjungan pasien terkait. Bila tidak ada hasil, sistem menampilkan notifikasi/alert bahwa hasil radiologi tidak tersedia.
  - **AC 5:** Memilih **Patologi Anatomi** mengambil dan menampilkan hasil patologi anatomi pada kunjungan pasien terkait. Bila tidak ada hasil, sistem menampilkan notifikasi/alert bahwa hasil patologi anatomi tidak tersedia.
  - **AC 6:** Setiap opsi hanya mengambil data yang terhubung dengan `encounter_id`/kunjungan dari baris Casemix yang dipilih.

**Fitur: Pilih Sebagian & Kirim Data ke SATUSEHAT**
- **User Story:** Sebagai Petugas Casemix, saya ingin mengirim data ke Satu Sehat (seluruhnya / pilih sebagian), agar fleksibel sesuai kebutuhan.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Default (toggle **off**) → cakupan kirim = **seluruh data** sesuai filter; **Total Kirim Data** = jumlah data terfilter.
  - **AC 2:** Toggle **Pilih Sebagian on** → tiap baris menampilkan tombol **+**; menandai baris menambah **Total Kirim Data**; hanya baris ditandai yang dikirim.
  - **AC 3:** Klik **Kirim Data** mengirim data ke **SATUSEHAT** dan menampilkan ringkasan hasil (jumlah sukses/gagal).
  - **AC 4:** Bila Pilih Sebagian aktif namun belum ada baris ditandai → tombol **Kirim Data** nonaktif + pesan validasi.
- **Validasi:**

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Pilih Sebagian | Toggle | Optional (default off) | — | "Aktifkan untuk memilih data tertentu" |
  | Baris terpilih | Checkbox/＋ | Bila Pilih Sebagian on: min 1 baris | "Pilih minimal satu data untuk dikirim" | — |
  | Kanal (Satu Sehat) | Checkbox | Min 1 kanal aktif | "Pilih kanal pengiriman" | "Satu Sehat" |
  | Pasien Per Halaman | Dropdown | Optional (default 10) | — | "10 / 25 / 50" |

**Fitur: Status Terakhir Dikirim & Kirim Ulang**
- **User Story:** Sebagai Petugas Casemix, saya ingin melihat kapan terakhir dikirim & kirim ulang bila gagal, agar tidak ada episode terlewat.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Setelah kirim sukses, kolom **Terakhir Dikirim (Satu Sehat)** diperbarui dengan timestamp.
  - **AC 2:** Bila gagal, status episode = **Gagal Kirim** dan tersedia aksi **kirim ulang**.
  - **AC 3:** Setiap pengiriman tercatat pada riwayat (waktu, aktor, hasil) dan **tidak dapat dihapus** (audit).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

> Data list & dokumen bersumber dari Billing/Tagihan (G2). Modul ini menambah **read-model worklist** dan **log pengiriman SATUSEHAT**. Tidak ada form CREATE/EDIT master di modul ini.

**Table Name:** `insurance_casemix_worklist` *(read-model episode asuransi swasta yang siap Casemix)*
- **Key Columns:**
  - `id`: UUID (Primary Key)
  - `encounter_id`: UUID (FK → `encounters`)
  - `patient_id`: UUID (FK → `patients`)
  - `medical_record_no`: VARCHAR
  - `patient_name`: VARCHAR
  - `admission_date`: TIMESTAMP
  - `discharge_date`: TIMESTAMP
  - `service_type`: ENUM(`outpatient`,`inpatient`) — Rawat Jalan / Rawat Inap
  - `unit_id`: UUID (FK → `units`)
  - `insurance_id`: UUID (FK → `master_insurance`)
  - `total_billing_amount`: NUMERIC(15,2)
  - `discharge_status`: VARCHAR — untuk filter Status Pulang
  - `discharge_method`: VARCHAR — untuk filter Cara Pulang
  - `is_active`: Boolean (default true)
  - `created_at` / `updated_at`: TIMESTAMP

**Table Name:** `satusehat_submissions` *(log kirim ke SATUSEHAT)*
- **Key Columns:**
  - `id`: UUID (Primary Key)
  - `encounter_id`: UUID (FK → `encounters`)
  - `channel`: VARCHAR (default `satusehat`)
  - `status`: ENUM(`not_sent`,`sent`,`failed`) (default `not_sent`)
  - `sent_at`: TIMESTAMP (nullable) — sumber kolom "Terakhir Dikirim"
  - `error_message`: TEXT (nullable)
  - `retry_count`: INT (default 0)
  - `batch_id`: UUID (nullable, FK → `satusehat_send_batches`)
  - `submitted_by`: UUID (FK → `users`)
  - `is_active`: Boolean (default true)
  - `created_at` / `updated_at`: TIMESTAMP

**Table Name:** `satusehat_send_batches` *(rekam satu aksi "Kirim Data")*
- **Key Columns:**
  - `id`: UUID (Primary Key)
  - `scope_type`: ENUM(`all_filtered`,`partial`)
  - `filter_snapshot`: JSONB — periode, rentang tanggal, tipe layanan, unit, status/cara pulang, kata kunci
  - `total_count` / `success_count` / `failed_count`: INT
  - `created_by`: UUID (FK → `users`)
  - `created_at`: TIMESTAMP

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/casemix/insurance/encounters` | List worklist (query: `period`, `start_date`, `end_date`, `service_type`, `unit_id`, `discharge_status`, `discharge_method`, `q`, `page`, `per_page`) |
| GET | `/api/v1/casemix/insurance/encounters/{id}/billing` | Detail Tagihan (Invoice/Kwitansi) |
| GET | `/api/v1/casemix/insurance/encounters/{id}/assessment` | Dokumen Asesment |
| GET | `/api/v1/casemix/insurance/encounters/{id}/documents/download` | Unduh Invoice + Kwitansi (gabung PDF/zip) |
| GET | `/api/v1/casemix/insurance/documents/download` | Unduh dokumen bulk (query filter / `encounter_ids`) |
| GET | `/api/v1/casemix/insurance/encounters/{id}/ancillary/{type}` | Penunjang **sama dengan V1** berdasarkan kunjungan: `e-prescription`/`lab`/`radiology`/`pathology`; respons kosong untuk Lab/Radiologi/Patologi Anatomi memicu notifikasi/alert di UI |
| POST | `/api/v1/casemix/insurance/satusehat/submissions` | Kirim data (body: `mode=all\|partial`, `encounter_ids[]`, `filter`) |
| POST | `/api/v1/casemix/insurance/satusehat/submissions/{id}/retry` | Kirim ulang (Gagal Kirim) |
| GET | `/api/v1/casemix/insurance/satusehat/submissions` | Riwayat & status pengiriman |
| GET | `/api/v1/master/insurance-payers` | Lookup payer asuransi |
| GET | `/api/v1/master/units` | Lookup unit/poli |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Filter & Konfigurasi Kirim)
> Modul ini tidak memiliki layar CREATE/EDIT master. "Input" pengguna = **Pencarian & Filter** dan **Konfigurasi Kirim**.

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| q | Pencarian | text | Tidak | max 100 | input | cocokkan Nama Pasien / No. RM |
| period | Periode | dropdown | Ya | Waktu Masuk / Waktu Pulang | enum | default Waktu Pulang |
| start_date | Tanggal Awal | date | Ya | ≤ end_date | input | |
| end_date | Tanggal Akhir | date | Ya | ≥ start_date | input | |
| service_type | Tipe Layanan | dropdown | Tidak | Semua / Rawat Inap / Rawat Jalan | enum | default Semua |
| unit_id | Unit | lookup | Tidak | dari Master Data Unit | `units` | default "Pilih Unit" |
| discharge_status | Status Pulang | dropdown | Tidak | Semua / Dipulangkan / Belum Dipulangkan | enum | popover Lainnya |
| discharge_method | Cara Pulang | dropdown | Tidak | Semua / Atas Persetujuan Dokter / Atas Persetujuan Pribadi / Dirujuk / Meninggal / Lain-Lain | enum | popover Lainnya; "Lain-Lain" = salah satu opsi |
| partial_mode | Pilih Sebagian | toggle | Tidak | on/off | input | on → tombol ＋ per baris |
| channel_satusehat | Kanal Satu Sehat | checkbox | Ya (min 1 kanal) | boolean | input | default tercentang |

**Opsi nilai filter (enumerasi):**
- **Periode:** Waktu Masuk, Waktu Pulang — *default: Waktu Pulang*.
- **Tipe Layanan:** Semua, Rawat Inap, Rawat Jalan — *default: Semua*.
- **Unit:** daftar dinamis dari **Master Data Unit** (lookup) — *default: "Pilih Unit"*.
- **Status Pulang** (popover Lainnya): Semua, Dipulangkan, Belum Dipulangkan — *default: Semua*.
- **Cara Pulang** (popover Lainnya): Semua, Atas Persetujuan Dokter, Atas Persetujuan Pribadi, Dirujuk, Meninggal, Lain-Lain — *default: Semua*. Catatan: **"Lain-Lain" adalah salah satu opsi eksplisit** pada dropdown, bukan penanda "dan lain-lain".

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No. | urut baris | angka | – | |
| Tgl Masuk / Keluar | `admission_date` / `discharge_date` | 2 baris `dd-mm-yyyy` | sort tanggal | |
| Nama Pasien | `patient_name` (+`medical_record_no`) | Nama + `No RM: xxxx` | cari (Nama/No RM) | |
| Tipe Pelayanan | `service_type` (+unit) | teks | filter Tipe Layanan/Unit | |
| Terakhir Dikirim | `satusehat_submissions.sent_at` | `Satu Sehat : <tgl/->` | – | kanal Satu Sehat |
| Total Tagihan | `total_billing_amount` | Rp | sort | |
| Lihat dan Cetak | aksi | ikon: Asesment, Invoice, Kwitansi, Unduh Dokumen, Opsi (⋮) | – | |
| Tambah (kirim) | aksi | tombol ＋ hijau → tandai baris | – | muncul saat Pilih Sebagian aktif |

**Detail Tagihan (Invoice/Kwitansi, acuan `reff/casemix_tagihan.png`):**
- **Data Pasien:** No RM, Nama, Unit, Tanggal Masuk/Keluar, Status Kelas, DPJP, No Kartu, Tanggal Lahir (+umur), No Pendaftaran, **Tipe Penjamin**.
- **Ringkasan Tagihan:** Tagihan RS, Dana Kebajikan/Diskon, Hak Kelas/Limit (plafon), Tagihan Pasien, status Lunas/Belum, tombol Lainnya. *(istilah plafon/limit untuk swasta [PERLU KONFIRMASI].)*
- **Detail per unit:** No, Tanggal, Item Pelayanan (+kategori), Operator, Jumlah, Satuan, Harga, Sub Total; subtotal per grup.

#### Business Rules
- **BR-01** — List **hanya** menampilkan episode `insurance` (asuransi swasta) -> Master Data Tipe Penjamin (A20); BPJS & Umum tidak ditampilkan.
- **BR-02** — Pencarian berdasarkan **Nama Pasien** dan **No. RM**.
- **BR-03** — Kolom **Terakhir Dikirim** menampilkan kanal **Satu Sehat** beserta tanggal kirim terakhir.
- **BR-04** — Default cakupan **Kirim Data = seluruh data** sesuai filter aktif; bila **Pilih Sebagian** aktif, hanya baris **bertanda** yang dikirim; **Total Kirim Data** = jumlah baris terpilih.
- **BR-05** — **Kirim Data** mengirim data episode ke **SATUSEHAT**.
- **BR-06** — **Unduh Dokumen** mengunduh **Invoice + Kwitansi** sekaligus.
- **BR-07** — Menu **Opsi (⋮)** tetap **sama dengan V1**: E-Resep mengambil transaksi e-resep, sedangkan Laboratorium, Radiologi, dan Patologi Anatomi mengambil hasil dari kunjungan pasien terkait.
- **BR-08** — Bila hasil Laboratorium tidak tersedia, sistem menampilkan notifikasi **"Tidak ada Hasil Lab"**; bila hasil Radiologi atau Patologi Anatomi tidak tersedia, sistem menampilkan notifikasi/alert bahwa hasil tidak tersedia.
- **BR-09** — Data penunjang hanya boleh diambil untuk `encounter_id` pada baris Casemix yang dipilih.
- **BR-10** — Bila pengiriman ke SATUSEHAT **gagal**, episode ditandai **Gagal Kirim** dan dapat **kirim ulang**.
- **BR-11** — Filter **Lainnya** berisi **Status Pulang** dan **Cara Pulang**.
- **BR-12** — Setiap pengiriman mencatat **waktu kirim, aktor, hasil** (audit); riwayat tidak dapat dihapus.

## 9. Workflow / BPMN Interpretation

Modul belum memiliki BPMN khusus; alur diinterpretasikan dari acuan tampilan layar (`reff/*.png`) dan fitur induk G2.

**Alur utama (happy path):**
1. Petugas Casemix membuka layar → sistem memuat **list** episode `insurance` sesuai Periode & filter default.
2. Petugas **Cari/Filter** → sistem memuat ulang list.
3. (Opsional) **Lihat & Cetak** (Asesment/Invoice/Kwitansi) / **Unduh Dokumen** / buka **Opsi (⋮)** penunjang dengan perilaku **sama dengan V1** untuk mengambil data berdasarkan kunjungan pasien.
4. **Gateway — Pilih Sebagian aktif?**
   - Tidak → cakupan = seluruh data terfilter.
   - Ya → petugas menandai baris (＋) → Total Kirim Data = jumlah terpilih.
5. Petugas klik **Kirim Data** → sistem mengirim ke **SATUSEHAT**.
6. **Gateway — Kirim berhasil?**
   - Ya → status `TERKIRIM`, perbarui **Terakhir Dikirim (Satu Sehat)**.
   - Tidak → status `GAGAL_KIRIM` → petugas **kirim ulang** (kembali ke langkah 5).
7. Selesai; riwayat pengiriman tercatat (audit).

**Skenario alternatif:**
- **A1 — Filter tanpa hasil:** tampilkan "tidak ada data".
- **A2 — Internet down saat kirim:** episode `GAGAL_KIRIM`/antre, dikirim ulang saat koneksi pulih.
- **A3 — Data penunjang tidak tersedia:** untuk Laboratorium tampilkan notifikasi **"Tidak ada Hasil Lab"**; untuk Radiologi atau Patologi Anatomi tampilkan notifikasi/alert bahwa hasil tidak tersedia.

---

## Asumsi
- [ASUMSI] Sumber list & dokumen (Invoice/Kwitansi) berasal dari fitur induk Billing/Tagihan Pasien (G2).
- [ASUMSI] Penanda episode yang masuk list = `insurance` (asuransi swasta, di luar BPJS).
- [ASUMSI] Kanal kirim pada phase ini = Satu Sehat.
- [ASUMSI] RS tipe C & D memiliki koneksi internet tidak stabil → perlu penanganan gagal-kirim & kirim ulang.
- Perilaku Opsi penunjang (E-Resep/Lab/Radiologi/PA) tetap sama dengan V1 dan mengambil data berdasarkan kunjungan pasien terkait.
- [ASUMSI] Skema DB & endpoint API bersifat rekomendasi awal, menyesuaikan arsitektur backend existing.

## Pertanyaan Terbuka
- Daftar opsi **Periode**, **Status Pulang**, dan **Cara Pulang** untuk pasien asuransi swasta?
- Istilah **Ringkasan Tagihan** (Dana Kebajikan, Hak Kelas/Limit) untuk swasta — diganti menjadi plafon/limit payer? Pemetaannya?
- Field/atribut apa saja yang wajib dikirim ke **SATUSEHAT** untuk episode pasien asuransi swasta?
- Apakah **Kirim Data** per-episode atau batch besar (seluruh halaman/filter)? Batas jumlah per pengiriman?
- Apakah diperlukan **hak akses/role** khusus untuk Kirim Data & Unduh Dokumen?
- Apakah format notifikasi/alert kosong untuk Radiologi dan Patologi Anatomi perlu menggunakan wording khusus yang sama seperti pada V1?
- Siapa **approver** dokumen PRD ini (nama, jabatan, tanggal)?
