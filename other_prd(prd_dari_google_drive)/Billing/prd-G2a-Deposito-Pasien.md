# PRD — Deposito Pasien (G2a) — Tab Deposito (Tampilan Read-Only) pada Workspace Kasir (anak dari G2 Tagihan Pasien)

**Related Document:** Induk: G2 Billing — Tagihan Pasien (workspace Kasir; PEMILIK seluruh transaksi deposito: Top Up, pemakaian metode DEPOSITO, refund sisa). Turunan tab: G2a Deposito Pasien (dokumen ini — TAMPILAN read-only) & G2b Penjualan Obat Bebas. Sumber saldo: G3 Pengelolaan Dana Wadiah/Deposito Pasien. Konteks: A20 Tipe Penjamin, G1 Buka/Tutup Kasir.
**Versi:** 2.3 — Spesifikasi Data minimum layar Deposito Pasien ditetapkan: No. Registrasi, Nama, No. RM, Tipe Penjamin, Unit, Saldo Deposito, Status Tagihan, dan Status Pelayanan. Kolom tambahan versi sebelumnya menjadi informasi tambahan/Phase 2 bila diperlukan.
**Tanggal:** 17 Juli 2026

## 1. Metadata Dokumen

**Ringkasan Dokumen**

**Deposito Pasien (G2a)** adalah **PRD anak** yang dimekarkan dari **PRD G2 — Billing: Tagihan Pasien**. Secara **UI**, Deposito Pasien adalah **salah satu tab** pada satu halaman workspace Kasir (bersama tab **Tagihan Pasien** dan tab **Penjualan Obat Bebas/OTC**).

**[PENTING — Cakupan]** Tab Deposito Pasien bersifat **TAMPILAN (read-only) semata**: hanya **menampilkan data tagihan pasien yang memiliki nominal saldo deposito** beserta **daftar pasien bersaldo deposito**. **Tab ini TIDAK memiliki aksi transaksi.** Seluruh **transaksi deposito** — **Top Up saldo**, **pemakaian saldo (metode `DEPOSITO`) untuk membayar tagihan**, dan **Refund sisa deposito** — **dinyatakan OUT-OF-SCOPE bagi G2a** dan menjadi **cakupan PRD Tagihan Pasien (G2)** (diakses dari tab Tagihan Pasien).

**Approval**

| PRD Approved By | Nama / Jabatan | Signature, Date |
|-----------------|----------------|-----------------|
| [1] | [PERLU KONFIRMASI] — Chief/Owner Produk | - |

**PIC**

| Nama | Role |
|------|------|
| [PERLU KONFIRMASI] | Product Owner |
| [PERLU KONFIRMASI] | System Analyst |

**Related Documents**
* **PRD G2 — Billing: Tagihan Pasien (INDUK — PEMILIK transaksi deposito)** — workspace Kasir & **pemilik seluruh transaksi deposito**: **Top Up Saldo Deposito** (metode & tujuan A38 + jurnal — FR-011 AC-1a/1b/1c), **pemakaian saldo** metode `DEPOSITO` untuk membayar tagihan (FR-011 AC-2..4/BR-013), dan **Refund Sisa Deposito** Tunai (FR-011 AC-5..7/BR-029). G2a **hanya menampilkan** data saldo/tagihan terkait (read-only). Traceability tampilan: **FR-019 AC-6/BR-023**.
* **PRD G2b — Penjualan Obat Bebas (OTC)** — PRD **anak sejawat** (tab OTC). Disebut untuk kelengkapan pemisahan tab.
* **G3 — Pengelolaan Dana Wadiah / Deposito Pasien** — **master saldo deposito (hulu)**. Saldo yang ditampilkan G2a bersumber dari data saldo yang dikelola melalui G2 (transaksi) & G3 (master).
* **Billing/Kasir — G1 Buka & Tutup Kasir** — sesi kasir; relevan bagi transaksi deposito **di G2** (bukan G2a).
* **Master Data — Tipe Penjamin (A20)** — konteks pasien pada tampilan.

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 17 Juli 2026 | 2.3 | Menambahkan **Spesifikasi Data Minimum** untuk layar Deposito Pasien: No. Registrasi, Nama, No. RM, Tipe Penjamin, Unit, Saldo Deposito, Status Tagihan, dan Status Pelayanan. Sumber field, format, dan aturan read-only didokumentasikan pada §8.1. |
| 17 Juli 2026 | 2.2 | **Spesifikasi data layar tab Deposito Pasien dilengkapi (permintaan PO).** Kolom **'Tagihan Terkait Saldo Deposito'** ditambah **(a) Sisa Tagihan** — merujuk data di **G2** (`outstanding_balance` = `total_amount_rounded − total_paid`; nilai & perhitungan milik G2, G2a hanya menampilkan — **BR-D08**) — dan **(b) Status Layanan** — indikator progres **per alur** (Pelayanan/Lab/Radiologi/Farmasi, Berjalan/Selesai) dengan **mekanisme identik `Status Layanan` di G2 (BR-026)** — **BR-D09**. **Kolom & urutan final** menjadi: No. Registrasi, Nama Pasien, No. RM, Tipe Penjamin, Kelas (+pindah kelas), Unit, Saldo Deposito, **Sisa Tagihan**, Riwayat Pemakaian Deposito, **Status Layanan**, Status Tagihan. Diselaraskan: FR-D02 AC-1, §8.1 (kolom baca), §8.2 (API related-bills), Business Rules (+BR-D08/BR-D09). |
| 17 Juli 2026 | 2.1 | **Konfirmasi PO atas pertanyaan terbuka.** (1) **Akses tab = SEMUA role** (read-only, informasional; FR-D03 AC-2/BR-D05). (2) **Kolom & urutan final 'Tagihan Terkait Saldo Deposito'**: No. Registrasi, Nama Pasien, No. RM, Tipe Penjamin, Kelas (termasuk indikator **pindah kelas** — konsisten FR-002 AC-5b/BR-033 induk), Unit, Saldo Deposito, **Riwayat Pemakaian Deposito**, Status Pelayanan, Status Tagihan (FR-D02 AC-1/BR-D07; §8.1 kolom baca & API related-bills diselaraskan). (3) **Refresh otomatis tiap 1 menit** selama berada di halaman tab Deposito (polling 60 detik, berhenti saat meninggalkan tab; FR-D01 AC-4/BR-D06). |
| 17 Juli 2026 | 2.0 | **Penyempitan cakupan (permintaan PO).** Tab **Deposito Pasien (G2a) = HANYA TAMPILAN read-only** — menampilkan **daftar pasien bersaldo deposito + data tagihan pasien yang memiliki nominal saldo deposito**. Fitur **Top Up saldo deposito**, **pemakaian saldo deposito untuk membayar tagihan**, dan **Refund Sisa Deposito** **dinyatakan OUT-OF-SCOPE G2a** dan **dipindahkan ke scope PRD Tagihan Pasien (G2)**. Requirement transaksi (FR-D01 Top Up, FR-D02 Pemakaian, FR-D03 Refund pada v1.0) **dihapus dari G2a**; disisakan requirement **tampilan** (daftar pasien bersaldo, tagihan terkait, pencarian, read-only) + audit baca. |
| 17 Juli 2026 | 1.0 | Pembuatan awal — pemekaran dari G2 (saat itu G2a mencakup seluruh domain deposito termasuk Top Up/pemakaian/refund). **Digantikan oleh v2.0** yang menyempitkan G2a menjadi tampilan read-only. |

> **Konvensi ID**: requirement G2a memakai awalan **FR-D**/**NFR-D**/**BR-D**/**US-D** (D = Deposito). Rujukan silang ke G2 memakai ID asli G2 (mis. FR-011, BR-013, BR-029).

## 2. Overview & Background

**Overview / Brief Summary**

**Deposito Pasien (G2a)** adalah **tab tampilan (read-only)** pada workspace Kasir yang memberi Kasir/Manajemen **visibilitas** atas **saldo titipan (deposito/wadiah) pasien** dan **tagihan pasien yang terkait saldo deposito**. Tujuannya **informasional**: memudahkan Kasir mengetahui pasien mana yang memiliki saldo dan tagihan mana yang berkaitan dengan saldo tersebut — **tanpa** melakukan aksi transaksi pada tab ini.

**[Batas cakupan yang tegas]** Seluruh **transaksi** yang mengubah saldo deposito **bukan** milik G2a:
* **Top Up Saldo Deposito** (setoran + metode/tujuan A38 + jurnal) → **G2** (FR-011 AC-1a/1b/1c).
* **Pemakaian saldo** (metode `DEPOSITO`) untuk membayar tagihan → **G2** (FR-011 AC-2..4/BR-013).
* **Refund Sisa Deposito** (Tunai, pasca tagihan Lunas) → **G2** (FR-011 AC-5..7/BR-029).

G2a **hanya membaca & menampilkan** hasil/keadaan saldo tersebut.

**Business Process (As-Is vs To-Be)**

* **As-Is (masalah yang terjadi)**:
    * Kasir sulit mengetahui **pasien mana yang memiliki saldo deposito** dan **berapa** tanpa membuka berkas/menu terpisah.
    * Keterkaitan antara **saldo deposito** dan **tagihan pasien** tidak terlihat dalam satu tampilan → verifikasi lambat.

* **To-Be (solusi digital yang diusulkan)**:
    * **Tab Deposito Pasien (read-only)** menampilkan **(i)** daftar **pasien bersaldo deposito** + nominal saldo (dan total), dan **(ii)** **data tagihan pasien yang memiliki nominal saldo deposito** (tagihan yang memakai/terkait metode Deposito atau milik pasien bersaldo) — sebagai **informasi**, tanpa aksi transaksi.
    * **Pencarian** cepat per No. RM / Nama untuk menemukan pasien/tagihan bersaldo.
    * **Konsistensi**: nilai yang ditampilkan **real-time** mengikuti hasil transaksi yang dilakukan di **tab Tagihan Pasien (G2)**.

**Batas tanggung jawab (G2a ⟷ G2 ⟷ G3)**
* **G2a (dokumen ini)** — **tampilan read-only** tab Deposito Pasien (daftar pasien bersaldo + tagihan terkait; pencarian; tanpa aksi).
* **G2 (induk)** — **PEMILIK seluruh transaksi deposito** (Top Up, pemakaian `DEPOSITO`, refund sisa) yang **mengubah** saldo; diakses dari tab Tagihan Pasien.
* **G3** — **master pengelolaan dana wadiah/deposito** (definisi/kepemilikan saldo hulu).

## 3. Goals & Metrics

**Goals:** memberi Kasir/Manajemen **visibilitas read-only** yang akurat & real-time atas **pasien bersaldo deposito** dan **tagihan pasien yang terkait saldo deposito**, tanpa risiko salah-aksi (tidak ada tombol transaksi pada tab ini). Seluruh transaksi deposito tetap di G2.

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan tampilan pasien bersaldo | **100%** pasien dengan `balance > 0` tampil pada daftar pasien bersaldo (0 terlewat). |
| 2 | Kelengkapan tagihan terkait | **100%** tagihan pasien yang **memiliki nominal saldo deposito** (memakai/terkait metode Deposito atau milik pasien bersaldo) tampil pada daftar tagihan terkait. |
| 3 | Akurasi real-time | **100%** nilai saldo/keterkaitan yang ditampilkan **sinkron** dengan hasil transaksi di tab Tagihan Pasien (G2) (≤ interval refresh yang disepakati). |
| 4 | Keamanan read-only | **0** aksi transaksi (Top Up/pembayaran/refund) dapat dilakukan dari tab Deposito Pasien. |
| 5 | Kecepatan pencarian | Pencarian per No. RM/Nama menampilkan hasil **< 2 detik** [ASUMSI]. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP) | Phase 2 | Phase 3 |
|-------------|---------------|---------|---------|
| **Tab Deposito Pasien — Daftar Pasien Bersaldo (read-only)** | Menampilkan **pasien bersaldo deposito** (No. RM, Nama, update terakhir, **nominal saldo**) + **total saldo**; pencarian | Kolom/laporan tambahan | — |
| **Tab Deposito Pasien — Tagihan Terkait Saldo (read-only)** | Menampilkan **data tagihan pasien yang memiliki nominal saldo deposito** (No. Tagihan, Nama/No. RM, Total, Sisa, saldo terkait, status) — informasi | Filter lanjutan/ekspor | — |
| **Read-only enforcement & audit baca** | Tidak ada aksi transaksi; akses mengikuti RBAC; audit akses (opsional) | — | — |

**Kolom minimum/final layar Deposito Pasien Phase 1:** No. Registrasi, Nama, No. RM, Tipe Penjamin, Unit, Saldo Deposito, Status Tagihan, dan Status Pelayanan. Kolom tambahan seperti Kelas, Sisa Tagihan, dan Riwayat Pemakaian Deposito hanya ditampilkan bila disepakati sebagai informasi tambahan/Phase 2.

**Out of Scope (menjadi cakupan PRD lain)** *(perubahan utama v2.0)*

| No | Scope | Penanggung jawab |
|----|-------|------------------|
| 1 | **Top Up Saldo Deposito** (setoran + metode/tujuan A38 + jurnal) | **PRD G2 — Tagihan Pasien** (FR-011 AC-1a/1b/1c) |
| 2 | **Pemakaian saldo deposito** (metode `DEPOSITO`) untuk **membayar tagihan** | **PRD G2 — Tagihan Pasien** (FR-011 AC-2..4/BR-013) |
| 3 | **Refund Sisa Deposito** (Tunai, pasca tagihan Lunas) | **PRD G2 — Tagihan Pasien** (FR-011 AC-5..7/BR-029) |
| 4 | **Jurnal akuntansi mutasi deposito** (Top Up/pakai/refund) | **PRD G2 — Tagihan Pasien** (BR-020, Phase 3) |
| 5 | **Master pengelolaan dana wadiah/deposito** (saldo hulu) | **G3 — Pengelolaan Dana Wadiah/Deposito** |
| 6 | **UI workspace & worklist Kasir** (titik akses aksi) | **PRD G2 — Tagihan Pasien (induk)** |
| 7 | **Sesi kasir & verifikasi kas** | **G1 / G4** |

> **Catatan Phasing**: G2a adalah **tampilan read-only** (Phase 1). Tidak ada jurnal/transaksi di G2a — seluruhnya dipicu & dijurnal di **G2**. Nilai yang ditampilkan G2a **mengikuti** keadaan saldo/tagihan hasil transaksi G2.

## 5. Related Features (Rekomendasi Relasi)

Deposito Pasien (G2a) adalah **konsumen tampilan** atas data saldo/tagihan yang **ditransaksikan di G2** dan bersumber master **G3**. Arah relasi: **⇐ sumber** memberi data ke tampilan; **↔ referensi**.

**A. Induk & Sumber Transaksi**

| Code | Modul / Fitur | Relasi ke Deposito Pasien |
|------|---------------|---------------------------|
| **G2** | Billing — Tagihan Pasien (INDUK, ⇐) | **Pemilik seluruh transaksi deposito** (Top Up/pakai/refund) yang **mengubah saldo & membentuk keterkaitan tagihan**. G2a **membaca & menampilkan** keadaan hasil transaksi tersebut (read-only). |
| **G2b** | Penjualan Obat Bebas (OTC) (sejawat) | Tab sejawat; tidak terkait deposito. |

**B. Master / Referensi (↔)**

| Code | Modul / Fitur | Relasi ke Deposito Pasien |
|------|---------------|---------------------------|
| **G3** | Pengelolaan Dana Wadiah/Deposito | **Master saldo (hulu)** — sumber kebenaran saldo yang (melalui transaksi G2) ditampilkan G2a. |
| **A20** | Master Data — Tipe Penjamin | Konteks pasien pada tampilan. |

> **Batas G2a ⟷ G2 ⟷ G3**: **G3** = master saldo (hulu). **G2** = **transaksi** deposito (Top Up/pakai/refund) yang mengubah saldo & jurnal. **G2a** = **tampilan read-only** atas keadaan saldo & tagihan terkait. Ketiganya berbagi **satu sumber saldo** (`patient_deposit`).

## 6. Business Process & User Stories

**Konteks Tampilan (read-only) — bukan state machine transaksi**

Tab Deposito Pasien **tidak mengubah** keadaan apa pun; ia **menampilkan** dua kelompok data:

| Kelompok Tampilan | Isi | Sumber (read-only) |
|-------------------|-----|--------------------|
| **Pasien Bersaldo Deposito** | Daftar pasien dengan `balance > 0` + nominal saldo + total | `patient_deposit` (hasil transaksi G2 / master G3) |
| **Tagihan Terkait Saldo Deposito** | Tagihan pasien yang **memiliki nominal saldo deposito** (memakai/terkait metode Deposito atau milik pasien bersaldo): No. Tagihan, Nama/No. RM, Total, Sisa, saldo terkait, status | `bill` + `bill_payment` (metode `DEPOSITO`) milik G2 |

> Perubahan nilai (saldo bertambah/berkurang, tagihan terbayar) **berasal dari transaksi di tab Tagihan Pasien (G2)**; G2a hanya merefleksikannya.

**User Stories Utama**
* **US-D01** — Sebagai **Kasir**, saya ingin melihat **daftar pasien yang memiliki saldo deposito** beserta **nominal saldo**-nya pada tab Deposito Pasien, agar cepat mengetahui pasien mana yang punya titipan. *(P1, Phase 1)*
* **US-D02** — Sebagai **Kasir**, saya ingin melihat **data tagihan pasien yang memiliki nominal saldo deposito** (tagihan terkait), agar dapat memverifikasi keterkaitan saldo dengan tagihan sebelum menindaklanjuti di tab Tagihan Pasien. *(P1, Phase 1)*
* **US-D03** — Sebagai **Kasir**, saya ingin **mencari** pasien/tagihan bersaldo per No. RM/Nama, agar cepat menemukan data saat jumlahnya banyak. *(P1, Phase 1)*
* **US-D04** — Sebagai **Manajemen/Auditor**, saya ingin tab ini **read-only** (tanpa aksi transaksi), agar tidak ada risiko salah-aksi; seluruh transaksi deposito dilakukan & teraudit di **G2**. *(P1, Phase 1)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

> **Catatan cakupan (v2.0)**: G2a **hanya** memuat requirement **tampilan (read-only)**. Requirement **transaksi** deposito (Top Up, pemakaian `DEPOSITO`, refund sisa) **berada di PRD G2** (FR-011/BR-013/BR-029) dan **tidak** diulang sebagai requirement G2a.

**Fitur: Tab Deposito Pasien — Daftar Pasien Bersaldo (read-only) (FR-D01)**
* **User Story**: US-D01/US-D03. · **Prioritas**: P1. · **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Daftar pasien bersaldo**: tab **Deposito Pasien** menampilkan **daftar pasien yang memiliki saldo deposito** (`balance > 0`) dengan kolom minimal: **No. RM, Nama Pasien, Update Terakhir, Nominal Saldo Deposito**, serta **Total Saldo Deposito** (agregat).
    * **AC 2 — Read-only**: **tidak ada** tombol/aksi transaksi (Top Up/pembayaran/refund) pada tab ini. Seluruh transaksi dilakukan di **tab Tagihan Pasien (G2)** (BR-D01, rujuk FR-019/BR-023 induk).
    * **AC 3 — Pencarian**: tersedia pencarian per **No. RM / Nama**; bersifat **filter tampilan** (tidak mengubah data). Menghapus kata kunci mengembalikan seluruh daftar.
    * **AC 4 — Refresh berkala (siklus 1 menit)** [DIKONFIRMASI PO]: nilai saldo & daftar **di-refresh otomatis setiap 1 menit** **selama pengguna berada di halaman tab Deposito Pasien** (polling per 60 detik saat tab aktif); refresh berhenti saat meninggalkan tab dan dijalankan ulang saat kembali. Tersedia juga refresh manual. Nilai mengikuti hasil transaksi di tab Tagihan Pasien (G2) — BR-D06.

**Fitur: Tab Deposito Pasien — Tagihan Terkait Saldo Deposito (read-only) (FR-D02)**
> **Klarifikasi v2.3:** kolom minimum yang wajib tersedia pada layar adalah **No. Registrasi, Nama, No. RM, Tipe Penjamin, Unit, Saldo Deposito, Status Tagihan, dan Status Pelayanan**. Daftar kolom tambahan pada requirement historis bersifat opsional/informasi tambahan dan tidak menggantikan delapan kolom minimum ini.
* **User Story**: US-D02/US-D03. · **Prioritas**: P1. · **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Daftar tagihan terkait (kolom final)** [DIKONFIRMASI PO]: menampilkan **data tagihan pasien yang memiliki nominal saldo deposito** — yakni tagihan yang **memakai/terkait metode `DEPOSITO`** atau **milik pasien bersaldo deposito** — dengan **kolom & urutan final**: **(1) No. Registrasi**, **(2) Nama Pasien**, **(3) No. RM**, **(4) Tipe Penjamin** (A20), **(5) Kelas** (termasuk indikator **perubahan/pindah kelas** `Kelas Sebelumnya → Setelah` bila ada — konsisten induk FR-002 AC-5b/BR-033), **(6) Unit**, **(7) Saldo Deposito**, **(8) Sisa Tagihan** (sisa tagihan yang belum terbayar — **refer G2 `outstanding_balance`**; nilai & perhitungan milik G2, G2a hanya menampilkan — BR-D08), **(9) Riwayat Pemakaian Deposito** (daftar pemakaian metode `DEPOSITO` pada tagihan: tanggal, nominal, no. pembayaran — read-only), **(10) Status Layanan** (indikator progres **per alur** — Pelayanan/Lab/Radiologi/Farmasi, **Berjalan/Selesai** — **mekanisme mengikuti G2 BR-026**, read-only dari modul asal), **(11) Status Tagihan** (`bill_status`). Seluruh kolom **read-only** (sumber: G2/Pendaftaran/patient_deposit). *(Rujukan induk: FR-019 AC-6, BR-026, `outstanding_balance`.)*
    * **AC 2 — Read-only & informasional**: daftar bersifat **informasi**; **tidak** ada aksi transaksi. Untuk menindaklanjuti (Top Up/bayar via Deposito/refund), Kasir berpindah ke **tab Tagihan Pasien (G2)**.
    * **AC 3 — Penanda**: tagihan yang **memakai metode Deposito** dapat diberi penanda (badge) agar mudah dibedakan dari yang sekadar milik pasien bersaldo.
    * **AC 4 — Pencarian**: tersedia pencarian per **No. Tagihan / No. RM / Nama** (filter tampilan).

**Fitur: Read-only Enforcement & Akses (FR-D03)**
* **User Story**: US-D04. · **Prioritas**: P1. · **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Tanpa endpoint mutasi**: tab Deposito Pasien **hanya** memakai endpoint **baca** (GET). Tidak ada endpoint POST/PUT/DELETE yang mengubah saldo/tagihan yang dipicu dari tab ini.
    * **AC 2 — RBAC (semua role)** [DIKONFIRMASI PO]: tab Deposito Pasien (read-only) dapat **dilihat oleh SEMUA role** yang memiliki akses ke workspace Kasir/Billing (tidak dibatasi role tertentu) — karena bersifat informasional & tanpa aksi transaksi. Tidak ada eskalasi hak dari tab ini (BR-D05).
    * **AC 3 — Isolasi konteks**: tab berbagi **sesi kasir (G1)** yang sama dengan tab lain namun **konteks terisolasi** (BR-023 induk); berpindah tab tidak mencampur data.

### 7.2 Non-Functional Requirements (ringkas)
* **NFR-D01 (Read-only)**: tab Deposito Pasien tidak mengeksekusi mutasi apa pun; hanya membaca (GET). Integritas transaksi dijaga di **G2**.
* **NFR-D02 (Konsistensi/real-time)**: nilai yang ditampilkan konsisten dengan sumber saldo (`patient_deposit`) & tagihan (G2), ≤ interval refresh yang disepakati.
* **NFR-D03 (RBAC)**: tampilan mengikuti hak akses role; tidak ada eskalasi hak dari tab ini.
* **NFR-D04 (Kinerja)**: pemuatan daftar & pencarian responsif untuk volume pasien bersaldo yang wajar [ASUMSI].

## 8. Data & Technical Specifications

> G2a **hanya membaca** data saldo (`patient_deposit`) dan tagihan terkait (`bill`/`bill_payment` milik G2). **Tidak** mendefinisikan tabel transaksi deposito (Top Up/refund) — tabel & endpoint transaksi berada di **PRD G2**. Nama tabel/kolom English; struktur final menyesuaikan tim dev.

### 8.1 Data yang Dibaca (read-only)

#### 8.1.1 Spesifikasi Data Minimum Layar Deposito Pasien

| No | Kolom UI | Field/data source minimum | Format/aturan tampil |
|----|----------|---------------------------|----------------------|
| 1 | No. Registrasi | registration_id, registration_no dari G2/Pendaftaran | Teks; gunakan nomor registrasi yang terkait dengan tagihan/episode pasien. |
| 2 | Nama | patient_id, patient_name dari master pasien | Teks; mengikuti masking/RBAC bila berlaku. |
| 3 | No. RM | medical_record_number | Teks; identitas pasien read-only. |
| 4 | Tipe Penjamin | payer_id, payer_type/payer_label dari A20/G2 | Badge/teks; tampilkan label penjamin aktif pada episode. |
| 5 | Unit | service_unit_id, service_unit_name dari encounter/item billing | Teks; gunakan unit asal pelayanan, bukan hanya unit registrasi. |
| 6 | Saldo Deposito | patient_deposit.available_balance | Rupiah; sumber saldo read-only, tidak dihitung ulang di frontend. |
| 7 | Status Tagihan | bill.system_status/display_status | Badge; mapping status mengikuti G2, minimal Open, Locked, Partially Paid, Paid, Canceled/Refunded bila tersedia. |
| 8 | Status Pelayanan | bill_item.service_flow dan service_status dari modul pelayanan | Badge/chip per alur; minimal Berjalan/Selesai, mekanisme mengikuti G2 BR-026. |

**Kontrak minimal row UI:** satu row mewakili kombinasi registrasi/tagihan yang ditampilkan pada konteks saldo deposito. Tidak ada aksi edit, pembayaran, Top Up, Refund, atau perubahan status dari row ini. Kolom Saldo Deposito adalah satu-satunya nilai nominal pada daftar minimum dan harus menampilkan data_as_of/last_updated_at pada metadata layar.

* **`patient_deposit`** (saldo deposito — sumber kebenaran; ditransaksikan di G2, master di G3)
    * `patient_id`, `registration_id`: pemilik saldo · `balance`: DECIMAL (≥ 0) · `updated_at`, `updated_by`
    * G2a membaca `balance > 0` untuk **Daftar Pasien Bersaldo** (FR-D01).
* **`bill` + `bill_payment`** (milik G2) — untuk **Tagihan Terkait Saldo Deposito** (FR-D02)
    * Kriteria tampil: tagihan yang **milik pasien bersaldo** (`patient_deposit.balance > 0`) **atau** memiliki `bill_payment` bermetode `DEPOSITO` (aktif/void ter-tandai).
    * **Kolom baca (final, FR-D02 AC-1)**: **No. Registrasi** (`registration_no`), **Nama Pasien** (`patient_name`), **No. RM** (`medical_record_no`), **Tipe Penjamin** (`penjamin_type` A20), **Kelas** (`class` + indikator perubahan kelas `encounter_class_change`/BR-033 bila ada), **Unit** (`unit_room`), **Saldo Deposito** (join `patient_deposit.balance`), **Sisa Tagihan** (`outstanding_balance` — **milik G2**; sisa yang belum terbayar, dihitung di G2 `total_amount_rounded − total_paid`, G2a hanya membaca — BR-D08), **Riwayat Pemakaian Deposito** (`bill_payment` metode `DEPOSITO`: `paid_at`, `amount`, `payment_number`, status), **Status Layanan** (agregasi `bill_item.service_status` per alur Pelayanan/Lab/Radiologi/Farmasi — Berjalan/Selesai, **mekanisme G2 BR-026**), **Status Tagihan** (`bill_status`). Seluruhnya read-only (sumber G2/Pendaftaran/`patient_deposit`).

> **Tabel transaksi deposito (`deposit_topup`, `deposit_refund`, `deposit_ledger`) & pemakaian `bill_payment` metode `DEPOSITO` didefinisikan di PRD G2** (pemilik transaksi). G2a tidak menulis ke tabel-tabel tersebut.

### 8.2 API Endpoint Recommendations (hanya baca)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/deposits` | **Daftar Pasien Bersaldo** — pasien dengan `patient_deposit.balance > 0` (No. RM, Nama, update, saldo) + total + search (read-only, FR-D01). |
| GET | `/api/v1/deposits/related-bills` | **Tagihan Terkait Saldo Deposito** — tagihan yang memakai metode `DEPOSITO` / milik pasien bersaldo; mengembalikan kolom final: **No. Registrasi, Nama Pasien, No. RM, Tipe Penjamin, Kelas (+ perubahan kelas), Unit, Saldo Deposito, Sisa Tagihan (`outstanding_balance` refer G2), Riwayat Pemakaian Deposito, Status Layanan (per alur, BR-026), Status Tagihan** — read-only (FR-D02 AC-1). |
| GET | `/api/v1/patients/{patientId}/deposit-balance` | Baca **saldo deposito** pasien (read-only) untuk detail tampilan. |

> **Endpoint transaksi** (`POST /patients/{id}/deposit-topups`, `POST /bills/{id}/deposit-refunds`, pembayaran metode `DEPOSITO`) **berada di PRD G2** (di luar cakupan G2a).

**Business Rules (G2a)**
* **BR-D01 (Tab Deposito = read-only)**: tab Deposito Pasien **tidak** menyediakan aksi transaksi (Top Up/pembayaran/refund). Seluruh transaksi deposito diakses & dieksekusi di **tab Tagihan Pasien (G2)** (rujuk FR-019/BR-023 induk). G2a **hanya menampilkan** data.
* **BR-D02 (Kriteria "tagihan memiliki nominal saldo deposito")**: sebuah tagihan **ditampilkan** pada Tagihan Terkait bila **pemiliknya memiliki saldo deposito (`balance > 0`)** **atau** tagihan memiliki **pembayaran bermetode `DEPOSITO`**. Kriteria ini **hanya untuk penyaringan tampilan**, tidak mengubah data.
* **BR-D03 (Konsistensi sumber)**: nilai saldo bersumber **satu `patient_deposit`** (ditransaksikan di G2, master di G3); G2a tidak menyimpan salinan saldo terpisah.
* **BR-D04 (Tanpa mutasi)**: G2a **tidak** mengeksekusi endpoint mutasi; hanya GET. Integritas & audit transaksi berada di **G2** (BR-013/BR-029/BR-020 induk).
* **BR-D05 (RBAC — semua role)** [DIKONFIRMASI PO]: tab Deposito Pasien (read-only) dapat **dilihat oleh semua role** yang mengakses workspace Kasir/Billing; tidak dibatasi role tertentu & tanpa eskalasi hak (tab tanpa aksi transaksi). *(FR-D03 AC-2.)*
* **BR-D06 (Refresh berkala 1 menit saat di tab)** [DIKONFIRMASI PO]: selama pengguna berada di halaman tab Deposito Pasien, daftar & saldo **di-refresh otomatis tiap 60 detik** (polling), plus refresh manual; refresh berhenti saat meninggalkan tab. Tampilan mengikuti sumber saldo (`patient_deposit`) & tagihan (G2). *(FR-D01 AC-4/FR-D02.)*
* **BR-D07 (Riwayat Pemakaian Deposito — read-only)**: kolom Riwayat Pemakaian Deposito menampilkan daftar `bill_payment` bermetode `DEPOSITO` pada tagihan (tanggal, nominal, no. pembayaran, status) — bersumber data G2; G2a hanya membaca (tidak membentuk/mengubah pembayaran).
* **BR-D08 (Sisa Tagihan — refer G2, read-only)**: kolom **Sisa Tagihan** menampilkan `outstanding_balance` milik **G2** (sisa tagihan belum terbayar = `total_amount_rounded − total_paid`, dikelola & dihitung di G2). G2a **hanya membaca** nilai tersebut apa adanya; **tidak** menghitung ulang atau menyimpan salinan. Nilai mengikuti hasil transaksi di tab Tagihan Pasien (G2) sesuai siklus refresh (BR-D06).
* **BR-D09 (Status Layanan — mekanisme mengikuti G2 BR-026, read-only)**: kolom **Status Layanan** menampilkan indikator progres **per alur** (Pelayanan/Lab/Radiologi/Farmasi) masing-masing **Berjalan/Selesai**, dengan **mekanisme identik `Status Layanan` di G2 (BR-026)** — agregasi `bill_item.service_status` read-only dari modul asal (Pelayanan/Penunjang/Farmasi); alur tanpa order tidak ditampilkan. G2a tidak mengubah status apa pun.

**Case & Mitigasi**

| No | Case | Dampak | Mitigasi |
|----|------|--------|----------|
| 1 | Kasir mencoba bertransaksi dari tab Deposito | Salah konteks / mutasi tak teraudit di tempat | Tab read-only tanpa aksi; transaksi hanya di tab Tagihan Pasien (BR-D01). |
| 2 | Saldo tampil tidak sinkron dengan transaksi terbaru | Kasir salah menilai saldo | Tampilan mengikuti sumber `patient_deposit` real-time (NFR-D02). |
| 3 | Tagihan bersaldo tidak muncul di daftar terkait | Verifikasi tidak lengkap | Kriteria BR-D02 (pasien bersaldo ATAU pembayaran Deposito) mencakup keduanya. |
| 4 | Saldo tampil beda dengan master G3 | Data tidak konsisten | Satu sumber `patient_deposit` (BR-D03). |
| 5 | Sisa Tagihan di G2a beda dgn nilai di tab Tagihan Pasien (G2) | Kasir salah menilai sisa | G2a **hanya membaca** `outstanding_balance` milik G2 (tanpa hitung ulang); mengikuti refresh 1 menit (BR-D08/BR-D06). |
| 6 | Status Layanan tampil beda dgn indikator di G2 | Kasir salah menilai kesiapan tagihan | Mekanisme & sumber **sama dengan G2 BR-026** (agregasi `service_status` per alur, read-only) — satu logika (BR-D09). |

## 9. Workflow / BPMN Interpretation

> Tidak ada BPMN khusus G2a; G2a adalah **tampilan read-only**. Alur transaksi (Top Up/pakai/refund) berada di **PRD G2**. Bagian turunan ditandai [ASUMSI].

**Alur A — Melihat Pasien Bersaldo Deposito (read-only)**
1. Kasir membuka **tab Deposito Pasien** → sistem menampilkan **daftar pasien bersaldo** (No. RM, Nama, update, nominal saldo) + **total saldo**.
2. Kasir dapat **mencari** per No. RM/Nama (filter tampilan). Tidak ada aksi transaksi.

**Alur B — Melihat Tagihan Terkait Saldo Deposito (read-only)**
1. Pada tab yang sama, sistem menampilkan **data tagihan pasien yang memiliki nominal saldo deposito** (No. Tagihan, Nama/No. RM, Total, Sisa, saldo terkait, status), dengan penanda tagihan bermetode Deposito.
2. Untuk **menindaklanjuti** (Top Up / bayar via Deposito / refund sisa), Kasir **berpindah ke tab Tagihan Pasien (G2)** — di mana seluruh transaksi & jurnal dieksekusi.

**Catatan**: G2a **tidak** mengubah state apa pun. Perubahan saldo/tagihan berasal dari **transaksi di G2** (Top Up FR-011 AC-1a/1b/1c, pemakaian `DEPOSITO` BR-013, refund BR-029) yang **direfleksikan** pada tampilan G2a.

## Asumsi
- [ASUMSI] Tidak ada BPMN khusus G2a; G2a adalah tampilan read-only. Bagian turunan ditandai [ASUMSI].
- [KEPUTUSAN — permintaan PO] **Cakupan G2a dipersempit menjadi TAMPILAN read-only**: tab Deposito Pasien hanya menampilkan **daftar pasien bersaldo deposito** dan **data tagihan pasien yang memiliki nominal saldo deposito**. **Tanpa aksi transaksi.**
- [KEPUTUSAN — permintaan PO] **Top Up saldo deposito, pemakaian saldo deposito untuk membayar tagihan, dan Refund Sisa Deposito = OUT-OF-SCOPE G2a** dan menjadi **scope PRD Tagihan Pasien (G2)** (FR-011 AC-1a/1b/1c, BR-013, BR-029).
- [KEPUTUSAN] **Jurnal akuntansi** mutasi deposito (Top Up/pakai/refund) juga berada di **G2** (BR-020, Phase 3); G2a tidak membentuk jurnal.
- [KEPUTUSAN] **Kriteria tampil tagihan terkait**: pasien bersaldo (`balance > 0`) ATAU tagihan memiliki pembayaran metode `DEPOSITO` (BR-D02) — filter tampilan saja.
- [KEPUTUSAN] **Satu sumber saldo** `patient_deposit` (ditransaksikan di G2, master di G3); G2a tidak menyimpan salinan saldo (BR-D03).
- [ASUMSI] Tampilan G2a mengikuti keadaan saldo/tagihan real-time hasil transaksi di tab Tagihan Pasien (G2).
- [DIKONFIRMASI PO] **Tab Deposito Pasien**: (a) dapat dilihat **semua role** (read-only); (b) daftar 'Tagihan Terkait' berkolom **No. Registrasi, Nama Pasien, No. RM, Tipe Penjamin, Kelas (+ pindah kelas), Unit, Saldo Deposito, Sisa Tagihan (refer G2), Riwayat Pemakaian Deposito, Status Layanan (per alur, G2 BR-026), Status Tagihan**; (c) **refresh otomatis tiap 1 menit** selama di tab (BR-D05/BR-D06/BR-D07/BR-D08/BR-D09, FR-D01/FR-D02/FR-D03).

## Pertanyaan Terbuka
- [DIKONFIRMASI PO] **Cakupan role tab Deposito Pasien = SEMUA role** yang mengakses workspace Kasir/Billing (read-only, informasional) — tidak dibatasi role tertentu (FR-D03 AC-2/BR-D05).
- [DIKONFIRMASI PO] **Kolom & urutan final 'Tagihan Terkait Saldo Deposito'**: No. Registrasi, Nama Pasien, No. RM, Tipe Penjamin, Kelas (termasuk bila pindah kelas), Unit, Saldo Deposito, **Sisa Tagihan** (refer G2 `outstanding_balance`, BR-D08), **Riwayat Pemakaian Deposito**, **Status Layanan** (per alur, mekanisme G2 BR-026, BR-D09), Status Tagihan (FR-D02 AC-1/BR-D07/BR-D08/BR-D09).
- [DIKONFIRMASI PO] **Refresh tampilan = siklus tiap 1 menit** (polling 60 detik) **selama berada di halaman tab Deposito Pasien** (berhenti saat meninggalkan tab); tersedia refresh manual (FR-D01 AC-4/FR-D02/BR-D06).
- [DIKONFIRMASI — permintaan PO] Tab Deposito Pasien (G2a) = **HANYA TAMPILAN read-only**; **Top Up, pemakaian saldo untuk membayar tagihan, dan Refund sisa deposito = OUT-OF-SCOPE G2a → scope PRD Tagihan Pasien (G2)**.
