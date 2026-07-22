# PRD — Billing/Kasir — Pengelolaan Dana Wadiah / Deposit Pasien (G3)

**Related Document:** List Fitur V2.xlsx (sheet MVP, code G3); PRD G2 Tagihan Pasien (deposit dipotong ke tagihan); PRD G1 Buka & Tutup Kasir; PRD G4 Verifikasi Penerimaan Kas; PRD A38 Master Data Bank; PRD B2 Pendaftaran Rawat Inap
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-07-08

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|-----------------|----------------|---------|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-08 |
| Diperiksa oleh | [PERLU KONFIRMASI] Manajer Keuangan RS | – |
| Disetujui oleh | [PERLU KONFIRMASI] Direktur / Wadir Keuangan | – |

**Related Documents**

- List Fitur V2.xlsx — sheet MVP, code **G3** (Billing/Kasir > Billing > Pengelolaan dana wadiah/ Deposito Pasien).
- PRD **G2** — Tagihan Pasien (deposit dipotongkan sebagai metode pembayaran; `apply-deposit`).
- PRD **G1** — Buka & Tutup Kasir (setoran & pengembalian deposit dibukukan ke sesi kasir).
- PRD **G4** — Verifikasi Penerimaan Kas (penerimaan deposit menjadi objek verifikasi).
- PRD **A38** — Master Data Bank (referensi `bank_id` untuk setor/refund non-tunai).
- PRD **B2** — Pendaftaran Rawat Inap (titik awal permintaan deposit saat admisi RI).

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-08 | 1.0 - Draft awal | Draft awal PRD Pengelolaan Dana Wadiah / Deposit Pasien (G3): setor, saldo & mutasi, pemotongan ke tagihan (G2), dan pengembalian sisa. |

## 2. Overview & Background

**Overview / Brief Summary**

Modul **Pengelolaan Dana Wadiah / Deposit Pasien (G3)** mengelola **uang muka (deposit)** yang dititipkan pasien/keluarga ke rumah sakit — umumnya saat **admisi rawat inap (RI)** atau selama perawatan berjalan. Dana bersifat **titipan (wadiah)**: bukan pendapatan RS, melainkan **kewajiban/titipan (liability)** yang akan **dipotongkan ke tagihan (G2)** saat pelayanan selesai, dan **sisanya dikembalikan** ke pasien.

Fungsi inti: **setor deposit** (top-up, tunai/non-tunai), **pencatatan saldo & mutasi** per pasien/episode, **pemotongan deposit ke tagihan** (integrasi G2), dan **pengembalian sisa deposit** saat pelunasan/pulang. Setiap mutasi menghasilkan **bukti bernomor** dan dibukukan ke **sesi kasir aktif (G1)**.

**Business Process (As-Is vs To-Be)**

**As-Is (kondisi saat ini — RS Tipe C & D):** [ASUMSI]
- Uang muka pasien dicatat manual (buku/kertas/kuitansi manual) sehingga **saldo sulit dilacak** dan rawan selisih.
- Tidak ada keterkaitan otomatis antara deposit dan tagihan → saat pulang, perhitungan sisa dilakukan manual dan lambat.
- Pengembalian sisa deposit tidak selalu terdokumentasi (rawan sengketa/temuan audit).
- Tidak ada peringatan saat deposit menipis dibanding biaya perawatan yang berjalan.

**To-Be (kondisi diharapkan):**
- Setiap setoran deposit tercatat dalam **buku mutasi (ledger)** per pasien/episode dengan **saldo berjalan** yang akurat dan bukti setor bernomor.
- Deposit **otomatis dapat dipotongkan** ke tagihan (G2) saat pembayaran; sisa dihitung sistem.
- **Pengembalian sisa** terdokumentasi lengkap (nominal, metode, penerima, alasan) dan dibukukan ke kas (G1) untuk verifikasi (G4).
- Dana wadiah tercatat terpisah sebagai **titipan**, bukan pendapatan, hingga benar-benar dipakai.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Akurasi saldo deposit | Saldo sistem = Σ(setor) − Σ(pakai) − Σ(refund) untuk setiap pasien, 0 selisih. |
| 2 | Kelengkapan bukti | 100% mutasi deposit (setor/pakai/refund) memiliki bukti bernomor + pelaku + timestamp. |
| 3 | Kecepatan pengembalian | Waktu hitung & proses pengembalian sisa deposit saat pulang < 5 menit. [ASUMSI target] |
| 4 | Ketertautan ke tagihan | 100% pemakaian deposit tertaut ke tagihan (G2) yang bersangkutan. |
| 5 | Akuntabilitas kas | 100% setoran & pengembalian deposit terbukukan ke sesi kasir aktif (G1) untuk verifikasi (G4). |
| 6 | Transparansi | Saldo & riwayat mutasi deposit dapat ditampilkan kapan saja untuk pasien/keluarga. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD & Transaksi Dasar) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|----------------------------------------|------------------------------------------|
| Setor deposit (top-up) | Setor tunai & non-tunai (transfer/QRIS/kartu), bukti setor bernomor, dibukukan ke sesi kasir (G1). | Setor via kanal online/host-to-host; auto-rekonsiliasi mutasi bank. |
| Saldo & mutasi (ledger) | Saldo berjalan per pasien/episode + riwayat mutasi (setor/pakai/refund). | Estimasi biaya vs deposit + **alert saldo menipis** + rekomendasi minimal deposit. |
| Pemotongan ke tagihan | Potong deposit ke tagihan (G2) saat pembayaran; kurangi saldo & outstanding. | Auto-apply deposit saat finalisasi (aturan konfigurasi). |
| Pengembalian sisa (refund) | Kembalikan sisa saat lunas/pulang (tunai/non-tunai) dengan alasan & bukti. | **Approval berjenjang** refund > batas; refund ke rekening (transfer). |
| Penyesuaian (adjustment) | – | Koreksi saldo (adjustment) dengan approval & alasan. |

**Out of Scope**
- **Perhitungan & pembayaran tagihan** (item biaya, metode bayar, diskon, piutang) → modul **G2**.
- **Buka/Tutup kasir & saldo sesi** → modul **G1**.
- **Verifikasi/rekonsiliasi setoran ke keuangan** → modul **G4**.
- **Klaim penjamin BPJS/asuransi** → modul **Casemix (G5–G12)**.
- **Jurnal akuntansi titipan (GL)** & pelaporan pajak → di luar cakupan MVP. [ASUMSI]
- **Rekap/laporan deposit lintas-periode** → fase berikutnya (konsisten dengan penundaan rekap di G2).

## 5. Related Features

| Code | Modul / Menu | Relasi Teknis / Bisnis dengan G3 |
|------|--------------|----------------------------------|
| G2 | Tagihan Pasien | Deposit dipotongkan sebagai metode pembayaran `deposit` (FR-G2-05 / `apply-deposit`); pemakaian mengurangi saldo G3 & `outstanding` tagihan. |
| G1 | Buka & Tutup Kasir | Setoran & pengembalian deposit dibukukan ke `cashier_session_id` sesi kasir aktif. |
| G4 | Verifikasi Penerimaan Kas | Penerimaan deposit & pengembalian menjadi objek verifikasi/rekonsiliasi. |
| A38 | Master Data Bank | Referensi `bank_id` untuk setor/refund non-tunai — konsisten kamus lintas-PRD. |
| B2 | Pendaftaran Rawat Inap | Titik awal permintaan deposit saat admisi RI; sumber identitas pasien (`no_rm`) & episode. |

## 6. Business Process & User Stories

**State Machine — Akun Deposit (per episode/encounter)**

| Status | Deskripsi | Efek Saldo | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------|--------------------|--------------------|
| OPEN | Akun deposit aktif; dapat setor & pakai selama perawatan. | `balance` berjalan ≥ 0. | → CLOSED (pulang & sisa 0/dikembalikan) | idem |
| CLOSED | Perawatan selesai; saldo sudah 0 (dipakai/dikembalikan). | `balance` = 0. | (terminal) | → OPEN kembali (koreksi, approval) |

**State — Transaksi Deposit (per mutasi)**

| Status | Deskripsi | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------|--------------------|
| POSTED | Mutasi sah (setor/pakai/refund) tercatat & memengaruhi saldo. | → VOID (koreksi salah input) | → VOID butuh approval |
| PENDING_APPROVAL | Refund/adjustment menunggu persetujuan. | – | → POSTED / REJECTED |
| VOID | Mutasi dibatalkan (salah input), efek saldo dibalik. | (terminal) | idem |

> Catatan: kasir **tidak** menyetel saldo langsung; `balance` selalu **dihitung sistem** dari akumulasi mutasi POSTED. Saldo tidak boleh negatif.

**User Stories Utama**

- **US-G3-01** — Sebagai **Kasir**, saya ingin menerima setoran deposit atas nama pasien dan mencetak bukti setor, agar uang muka tercatat sah. *(FR-G3-01)*
- **US-G3-02** — Sebagai **Kasir/Keluarga Pasien**, saya ingin melihat saldo dan riwayat mutasi deposit, agar transparan berapa yang tersisa. *(FR-G3-02)*
- **US-G3-03** — Sebagai **Kasir**, saya ingin memotong saldo deposit ke tagihan (G2), agar pelunasan memakai uang muka yang sudah disetor. *(FR-G3-03)*
- **US-G3-04** — Sebagai **Kasir**, saya ingin mengembalikan sisa deposit saat pasien pulang, agar hak pasien dikembalikan dengan bukti. *(FR-G3-04)*
- **US-G3-05** — Sebagai **Kasir/Perawat**, saya ingin diberi peringatan saat deposit menipis dibanding biaya berjalan, agar bisa meminta tambahan deposit. *(FR-G3-05, Phase 2)*
- **US-G3-06** — Sebagai **Manajemen/Keuangan**, saya ingin dana wadiah tercatat sebagai titipan (bukan pendapatan) sampai dipakai, agar sesuai kaidah keuangan. *(BR-G3-08)*
- **US-G3-07** — Sebagai **Supervisor**, saya ingin membatalkan/mengoreksi mutasi salah input dengan alasan, agar saldo tetap akurat. *(FR-G3-06)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**FR-G3-01 — Setor Deposit (Top-Up)**
- **User Story**: Sebagai Kasir, saya ingin menerima setoran deposit atas nama pasien, agar uang muka tercatat sah.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Kasir memilih pasien (`no_rm`) & episode; bila belum ada akun deposit untuk episode itu, sistem membuat akun berstatus `OPEN`.
  - **AC 2**: Setoran menerima metode tunai & non-tunai; untuk non-tunai wajib `bank_id` (A38) + `reference_no`.
  - **AC 3**: Setoran menambah `balance` dan mencatat mutasi `topup` (POSTED) dengan bukti bernomor unik.
  - **AC 4**: Setoran dibukukan ke `cashier_session_id` sesi kasir aktif (G1); ditolak bila tidak ada sesi terbuka. [PERLU KONFIRMASI]
  - **AC 5**: `amount` harus > 0.

**FR-G3-02 — Saldo & Riwayat Mutasi (Ledger)**
- **User Story**: Sebagai Kasir/keluarga pasien, saya ingin melihat saldo & riwayat deposit, agar transparan.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Layar menampilkan `balance` terkini + daftar mutasi (tanggal, jenis, nominal, saldo berjalan, metode, kasir, ref tagihan bila pakai).
  - **AC 2**: `balance` = Σ(topup) − Σ(usage) − Σ(refund) untuk mutasi POSTED; dihitung sistem, tidak diinput manual.
  - **AC 3**: Riwayat dapat difilter per episode & rentang tanggal.

**FR-G3-03 — Pemotongan Deposit ke Tagihan (Integrasi G2)**
- **User Story**: Sebagai Kasir, saya ingin memotong deposit ke tagihan, agar uang muka dipakai untuk melunasi.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Dipicu dari pembayaran tagihan G2 (`apply-deposit`); nominal dipakai ≤ `balance` dan ≤ `outstanding` tagihan.
  - **AC 2**: Pemakaian mencatat mutasi `usage` (POSTED) tertaut `invoice_id`, mengurangi `balance` secara **atomik** (anti dobel-pakai).
  - **AC 3**: Bila tagihan yang memakai deposit di-void/refund (G2), sistem mengembalikan nominal ke saldo deposit (mutasi balik). [PERLU KONFIRMASI perilaku]

**FR-G3-04 — Pengembalian Sisa Deposit (Refund)**
- **User Story**: Sebagai Kasir, saya ingin mengembalikan sisa deposit saat pasien pulang, agar hak pasien dikembalikan dengan bukti.
- **Prioritas**: P0
- **Fase**: Phase 1 (dengan alasan/bukti) / Phase 2 (approval > batas)
- **Acceptance Criteria**:
  - **AC 1**: Pengembalian ≤ `balance`; menghasilkan mutasi `refund` (POSTED) + bukti pengembalian bernomor.
  - **AC 2**: Refund tunai mengurangi kas sesi kasir aktif (G1); refund non-tunai mencatat rekening tujuan (`bank_id`, `no_rekening`, atas nama). [PERLU KONFIRMASI mekanisme]
  - **AC 3**: Data penerima (nama & hubungan dengan pasien) wajib dicatat.
  - **AC 4**: Setelah sisa = 0 dan perawatan selesai, akun dapat berstatus `CLOSED`.
  - **AC 5 (P2)**: Refund melebihi batas wewenang berstatus `PENDING_APPROVAL` hingga disetujui. *(kolom `status_approval`/`approver_id` disiapkan sejak Phase 1)*

**FR-G3-05 — Peringatan Saldo Menipis / Minimal Deposit** *(Phase 2)*
- **User Story**: Sebagai Kasir/Perawat, saya ingin diperingatkan saat deposit menipis dibanding biaya berjalan, agar bisa meminta tambahan.
- **Prioritas**: P2
- **Fase**: Phase 2
- **Acceptance Criteria**:
  - **AC 1**: Sistem membandingkan `balance` vs estimasi/akrual biaya berjalan (dari G2) dan menampilkan peringatan bila di bawah ambang. [PERLU KONFIRMASI ambang & sumber estimasi]
  - **AC 2**: Rekomendasi minimal deposit dapat dikonfigurasi per kelas/lama rawat.

**FR-G3-06 — Pembatalan / Koreksi Mutasi (Void/Adjustment)**
- **User Story**: Sebagai Supervisor, saya ingin membatalkan mutasi salah input dengan alasan, agar saldo tetap akurat.
- **Prioritas**: P1
- **Fase**: Phase 1 (void dengan alasan) / Phase 2 (adjustment dengan approval)
- **Acceptance Criteria**:
  - **AC 1**: Void mutasi salah input membalik efek saldo; alasan wajib; jejak pelaku & timestamp tersimpan.
  - **AC 2 (P2)**: Adjustment saldo (koreksi selisih) memerlukan approval.

**Validasi — Wording (Frontend), layar Setor/Refund Deposit**

| Field | Tipe Input | Rules | Error Message | Helper Text |
|-------|------------|-------|---------------|-------------|
| Pasien (No. RM) | Lookup | Required | "Pasien wajib dipilih" | "Cari berdasarkan No. RM / nama" |
| Jenis Transaksi | Dropdown | Required | "Jenis transaksi wajib dipilih" | "Setor / Pengembalian" |
| Nominal | Number | Required, > 0; refund ≤ saldo | "Nominal harus > 0 dan ≤ saldo" | "Saldo saat ini: Rp{saldo}" |
| Metode | Dropdown | Required | "Metode wajib dipilih" | "Tunai / Transfer / QRIS / Kartu" |
| Bank | Lookup (A38) | Required jika non-tunai | "Bank wajib dipilih untuk non-tunai" | "Pilih bank/mesin EDC" |
| No. Referensi | Text | Required jika non-tunai, maks 40 | "No. referensi wajib diisi" | "No. transaksi transfer/QRIS/EDC" |
| Penerima (refund) | Text | Required saat refund, maks 100 | "Nama penerima wajib diisi" | "Nama & hubungan dgn pasien" |
| Alasan (void/refund) | Text | Required, maks 200 | "Alasan wajib diisi" | "Jelaskan alasan transaksi" |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `deposit_accounts`** (akun deposit per episode)
- `id`: UUID (Primary Key)
- `patient_id`: UUID (FK pasien)
- `encounter_id`: UUID (FK episode pelayanan; RI/RJ)
- `balance`: Decimal (default 0)  ← dihitung dari mutasi, tidak diinput manual
- `status`: Enum (OPEN / CLOSED)
- `is_active`: Boolean (default true)
- `created_by`, `created_at`, `updated_at`

**Table: `deposit_transactions`** (buku mutasi / ledger)
- `id`: UUID (PK) · `account_id`: UUID (FK)
- `txn_type`: Enum (topup / usage / refund / adjustment)
- `amount`: Decimal (> 0; efek ke saldo ditentukan `txn_type`)
- `running_balance`: Decimal (saldo setelah mutasi — snapshot)
- `method`: Enum (cash / transfer / qris / card, nullable untuk usage)
- `bank_id`: UUID (FK master Bank A38, nullable) · `reference_no`: String (nullable)
- `invoice_id`: UUID (FK tagihan G2, nullable — diisi untuk `usage`)
- `recipient_name`: String (nullable — diisi untuk `refund`)
- `cashier_session_id`: UUID (FK sesi kasir G1) · `cashier_id`: UUID
- `reason`: String (nullable — wajib untuk void/refund)
- `status`: Enum (posted / pending_approval / void)
- `status_approval`: Enum (none / pending / approved / rejected)  ← **disiapkan sejak Phase 1**
- `approver_id`: UUID (nullable) · `document_no`: String (bukti bernomor unik) · `created_at`

**Catatan konsistensi**: satu `usage` = satu baris pembayaran metode `deposit` di `billing_payments` (G2); keduanya harus sinkron (`invoice_id` ⇄ `account_id`).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/deposits` | List akun deposit (filter pasien/status/episode) |
| GET | `/api/v1/deposits/{accountId}` | Detail akun + saldo + mutasi |
| POST | `/api/v1/deposits` | Buat akun deposit (bila belum ada untuk episode) |
| POST | `/api/v1/deposits/{accountId}/topup` | Setor deposit (tunai/non-tunai) |
| POST | `/api/v1/deposits/{accountId}/usage` | Potong deposit ke tagihan (dipicu G2 apply-deposit) |
| POST | `/api/v1/deposits/{accountId}/refund` | Kembalikan sisa deposit |
| PATCH | `/api/v1/deposits/{accountId}/transactions/{txnId}/void` | Batalkan mutasi (koreksi) |
| GET | `/api/v1/deposits/{accountId}/receipt/{txnId}` | Cetak bukti setor/pengembalian |
| PATCH | `/api/v1/deposits/{accountId}/close` | Tutup akun (sisa 0) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Setor / Pengembalian Deposit (Layar CREATE Transaksi)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| no_rm | Pasien (No. RM) | lookup | Ya | pasien terdaftar | lookup pasien (B1/B2) | `no_rm` konsisten kamus |
| encounter_id | Episode | lookup | Ya | episode aktif | konteks/lookup | RI/RJ/IGD |
| txn_type | Jenis Transaksi | dropdown | Ya | topup / refund | enum | usage dipicu dari G2 |
| amount | Nominal | number | Ya | > 0; refund ≤ saldo | manual | format Rp |
| method | Metode | dropdown | Ya | cash/transfer/qris/card | enum | – |
| bank_id | Bank | lookup | Ya bila non-tunai | dari master Bank (A38) | lookup A38 | konsisten kamus |
| reference_no | No. Referensi | text | Ya bila non-tunai | maks 40 char | manual | no. transfer/QRIS/EDC |
| recipient_name | Penerima | text | Ya bila refund | maks 100 char | manual | nama & hubungan dgn pasien |
| reason | Alasan | text | Ya bila refund/void | maks 200 char | manual | jejak audit |
| cashier_session_id | Sesi Kasir | lookup | Ya | sesi kasir aktif (G1) | sistem | ditolak bila tak ada sesi |

#### 8.3.2 Spesifikasi Data — Tampilan Saldo & Mutasi Deposit (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Saldo Deposit | deposit_accounts.balance | Rp (angka besar) | – | kartu ringkasan; merah bila 0 |
| No. Bukti | deposit_transactions.document_no | text | sort terbaru | – |
| Tanggal | deposit_transactions.created_at | dd-MM-yyyy HH:mm | sort (default desc) | – |
| Jenis | deposit_transactions.txn_type | badge | filter | Setor/Pakai/Refund |
| Nominal | deposit_transactions.amount | Rp (+/− by jenis) | – | hijau setor, merah pakai/refund |
| Saldo Berjalan | deposit_transactions.running_balance | Rp | – | saldo setelah mutasi |
| Ref. Tagihan | deposit_transactions.invoice_id | link | filter | untuk mutasi `usage` |
| Metode | deposit_transactions.method | text | filter | – |
| Kasir | deposit_transactions.cashier_id | text | filter | – |

**Business Rules**
- **BR-G3-01**: `balance` = Σ(topup) − Σ(usage) − Σ(refund) atas mutasi POSTED; dihitung sistem, tidak boleh negatif.
- **BR-G3-02**: Setoran (`topup`) menambah saldo; `amount` > 0; menghasilkan bukti bernomor unik.
- **BR-G3-03**: Pemakaian (`usage`) ≤ `balance` dan ≤ `outstanding` tagihan (G2); dilakukan atomik untuk mencegah dobel-pakai.
- **BR-G3-04**: Pengembalian (`refund`) ≤ `balance`; wajib `reason` + `recipient_name`; refund tunai memengaruhi kas sesi kasir (G1).
- **BR-G3-05**: Setiap mutasi terikat ke `cashier_session_id` sesi kasir aktif (G1); ditolak bila tidak ada sesi terbuka. [PERLU KONFIRMASI kebijakan]
- **BR-G3-06**: Bila tagihan yang memakai deposit di-void/refund (G2), nominal `usage` dikembalikan ke saldo via mutasi balik. [PERLU KONFIRMASI]
- **BR-G3-07**: Akun dapat `CLOSED` hanya saat perawatan selesai dan `balance` = 0.
- **BR-G3-08**: Dana wadiah dicatat sebagai **titipan (liability)**, bukan pendapatan RS, hingga di-`usage` ke tagihan. [ASUMSI perlakuan akuntansi — konfirmasi bagian keuangan]
- **BR-G3-09**: Void hanya membalik mutasi yang salah input; tidak menghapus jejak (audit trail dipertahankan).

## 9. Workflow / BPMN Interpretation

> Modul G3 **belum memiliki BPMN sendiri** pada data List Fitur. Alur berikut diturunkan dari pola deposit/uang muka RS Tipe C & D dan keterkaitan modul (G1/G2/G4, A38, B2). Ditandai [ASUMSI] pada bagian turunan.

**Alur Utama — Siklus Deposit (happy path):**
1. Pasien masuk rawat inap (admisi RI di B2) → petugas meminta uang muka/deposit. *(trigger)* [ASUMSI]
2. Kasir membuat/menemukan akun deposit episode, menerima **setoran** (tunai/non-tunai) → saldo bertambah, **bukti setor** dicetak, dibukukan ke sesi kasir (G1).
3. Selama perawatan, pasien dapat **menambah deposit** (top-up) bila diminta; saldo & mutasi selalu terlihat.
4. Saat pelayanan selesai, tagihan (G2) difinalisasi; kasir **memotong deposit** (`usage`) ke tagihan → saldo & outstanding berkurang.
5. Jika **saldo > tagihan** → **kembalikan sisa** (refund) ke pasien dengan bukti; jika **saldo < tagihan** → sisa tagihan dibayar dengan metode lain / menjadi piutang (di G2).
6. Setelah sisa 0 dan pasien pulang → akun deposit **CLOSED**.
7. Seluruh penerimaan & pengembalian menjadi bahan **verifikasi kas (G4)** dan rekap **tutup kasir (G1)**.

**Cabang / skenario alternatif:**
- **Saldo menipis** *(Phase 2)*: biaya berjalan mendekati/melebihi saldo → sistem memberi **peringatan** untuk minta tambahan deposit.
- **Salah input** *(void)*: mutasi salah dibatalkan (alasan wajib), efek saldo dibalik, jejak dipertahankan.
- **Tagihan pemakai deposit dibatalkan (G2)**: nominal `usage` dikembalikan ke saldo deposit. [PERLU KONFIRMASI]
- **Refund > batas wewenang** *(Phase 2)*: `PENDING_APPROVAL` → efektif setelah disetujui approver.

## Asumsi
- [ASUMSI] Deposit umumnya diminta saat admisi rawat inap (B2); RS Tipe C & D dapat menerapkan kebijakan berbeda untuk RJ/IGD.
- [ASUMSI] Dana wadiah diperlakukan sebagai titipan (liability), bukan pendapatan, hingga dipotong ke tagihan — perlu konfirmasi bagian keuangan.
- [ASUMSI] Target waktu proses pengembalian sisa < 5 menit adalah usulan, menunggu konfirmasi.
- [ASUMSI] Alur diturunkan dari pola deposit SIMRS RS Tipe C & D karena G3 belum memiliki BPMN sendiri.

## Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah setiap mutasi deposit wajib terikat sesi kasir terbuka (G1), atau ada penerimaan deposit di luar kasir (mis. transfer langsung ke rekening RS)?
- [PERLU KONFIRMASI] Mekanisme refund deposit non-tunai (transfer ke rekening pasien) — proses bendahara manual atau instruksi refund tercatat sistem?
- [PERLU KONFIRMASI] Perilaku saat tagihan yang memakai deposit di-void/refund di G2 — apakah nominal otomatis kembali ke saldo deposit?
- [PERLU KONFIRMASI] Apakah deposit bersifat per-episode (encounter) atau per-pasien (dapat dipakai lintas kunjungan)?
- [PERLU KONFIRMASI] Batas wewenang refund per role & jenjang approval Phase 2.
- [PERLU KONFIRMASI] Kebijakan minimal/rekomendasi deposit (per kelas/lama rawat) dan ambang peringatan saldo menipis.
- [PERLU KONFIRMASI] Format nomor bukti setor & bukti pengembalian (pola, reset periode).