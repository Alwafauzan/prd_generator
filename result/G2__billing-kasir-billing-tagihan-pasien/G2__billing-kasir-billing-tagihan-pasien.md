# PRD — Billing/Kasir — Tagihan Pasien (G2)

**Related Document:** List Fitur V2.xlsx (sheet MVP, code G2); PRD A10 Master Data Tindakan/Tarif; PRD A43 Master Data Tarif Kamar; PRD A38 Master Data Bank; PRD G1 Buka & Tutup Kasir; PRD G3 Deposit Pasien; PRD G4 Verifikasi Penerimaan Kas; Modul Casemix (G5–G12) Klaim BPJS/Asuransi
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-07-07

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|-----------------|----------------|---------|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-07 |
| Diperiksa oleh | [PERLU KONFIRMASI] Manajer Keuangan RS | – |
| Disetujui oleh | [PERLU KONFIRMASI] Direktur / Wadir Keuangan | – |

**Related Documents**

- List Fitur V2.xlsx — sheet MVP, code **G2** (Billing/Kasir > Billing > Tagihan Pasien).
- PRD **A10** — Master Data Tindakan & Tarif (sumber tarif tindakan).
- PRD **A43** — Master Data Tarif Kamar (sumber tarif kamar/akomodasi).
- PRD **A38** — Master Data Bank (referensi `bank_id` untuk pembayaran non-tunai).
- PRD **G1** — Buka & Tutup Kasir (sesi kasir tempat pembayaran dibukukan).
- PRD **G3** — Deposit/Dana Wadiah Pasien (saldo yang dipotongkan ke tagihan).
- PRD **G4** — Verifikasi Penerimaan Kas (rekonsiliasi penerimaan hasil billing).
- Modul **Casemix (G5–G12)** — pengajuan klaim BPJS & asuransi swasta (penjamin).

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-07 | 1.0 - Draft awal | Draft awal PRD Tagihan Pasien (G2) berdasarkan List Fitur MVP dan arahan scope (refund, metode bayar, diskon, dan piutang termasuk di dalam G2). |

## 2. Overview & Background

**Overview / Brief Summary**

Modul **Tagihan Pasien (G2)** adalah inti proses billing SIMRS: mengumpulkan seluruh komponen biaya yang timbul dari satu episode pelayanan pasien (rawat jalan/RJ, rawat inap/RI, IGD) menjadi **satu tagihan (invoice)**, menghitung total, menerapkan penjaminan/diskon, lalu memproses **pembayaran** hingga status **Lunas**. Modul ini juga menampung fungsi turunan yang melekat pada satu tagihan: **pembayaran multi-metode & split payment**, **diskon/keringanan**, **refund/pembatalan**, dan **piutang pasien (AR)** untuk tagihan yang belum lunas.

Tagihan menarik komponen biaya dari sumber lain: tarif tindakan dari **A10**, tarif kamar/akomodasi dari **A43**, obat/BHP dari Farmasi, serta layanan penunjang (Lab/Radiologi). Untuk pasien penjamin **BPJS**, tagihan RS bersifat **tarif rumah sakit**; proses klaim INA-CBG dilakukan terpisah di modul **Casemix (G5–G12)** — G2 hanya menangani porsi yang menjadi tanggungan pasien (mis. iur biaya/selisih kelas) dan status penjaminan.

**Business Process (As-Is vs To-Be)**

**As-Is (kondisi saat ini — RS Tipe C & D):** [ASUMSI]
- Rekap biaya sering dikumpulkan manual dari beberapa unit (rekap tindakan dari poli/ruangan, obat dari apotek, akomodasi dari ranap) → rawan **komponen terlewat** dan selisih.
- Tarif diambil dari daftar terpisah (kertas/Excel) sehingga **tidak konsisten** dan tidak terkunci per versi.
- Diskon/keringanan diberikan lisan tanpa jejak audit; refund dicatat manual; piutang (pulang paksa/kurang bayar) tidak terpantau sistematis.
- Pembayaran non-tunai (transfer/QRIS) dicocokkan manual dengan mutasi bank di akhir hari.

**To-Be (kondisi diharapkan):**
- Tagihan **terbentuk otomatis** dari agregasi charge item semua unit dalam satu episode pelayanan; setiap item tertaut ke sumber tarif (A10/A43/Farmasi) sehingga harga konsisten dan terkunci saat difinalisasi.
- Kasir memproses pembayaran multi-metode dalam satu transaksi, memotong **deposit (G3)** bila ada, dan mencetak kwitansi resmi.
- Diskon, refund, dan penghapusan piutang tercatat lengkap dengan alasan & pelaku (siap alur **approval berjenjang di Phase 2**).
- Setiap penerimaan dibukukan ke **sesi kasir aktif (G1)** dan menjadi bahan **verifikasi kas (G4)**.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan komponen tagihan | 100% charge item dari unit (tindakan/obat/BHP/kamar/penunjang) masuk ke tagihan tanpa input ulang manual. |
| 2 | Konsistensi tarif | 0 selisih antara harga di tagihan dan master tarif (A10/A43) pada saat finalisasi. |
| 3 | Kecepatan proses kasir | Waktu proses dari "finalisasi tagihan" → "lunas + kwitansi tercetak" < 3 menit per pasien. [ASUMSI target] |
| 4 | Akurasi rekonsiliasi | Selisih kas saat tutup kasir (G1) ≤ Rp0 untuk transaksi tunai; pembayaran non-tunai 100% ter-referensi nomor transaksi. |
| 5 | Jejak audit | 100% diskon, refund, dan void memiliki alasan + pelaku + timestamp yang tersimpan. |
| 6 | Pengendalian piutang | 100% tagihan belum lunas tercatat sebagai piutang (AR) dengan sisa tagihan dan penanggung jawab. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD & Transaksi Dasar) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|----------------------------------------|------------------------------------------|
| Pembuatan & pengelolaan tagihan | Bentuk tagihan per episode, tarik/tambah/hapus charge item, finalisasi (kunci tarif), hitung total. | Tagihan gabungan multi-episode; penyesuaian retroaktif dengan approval. |
| Pembayaran | Tunai, non-tunai (transfer/QRIS/kartu), **split payment**, potong **deposit (G3)**, cetak kwitansi, status Lunas otomatis. | Rekonsiliasi otomatis mutasi bank; cicilan terjadwal. |
| Diskon/keringanan | Diskon per item/total oleh kasir **dalam batas wewenang** (dengan alasan). | **Approval berjenjang** diskon > batas; skema keringanan/subsidi pasien tidak mampu. |
| Refund / pembatalan (void) | Refund/void dengan alasan wajib; kembalikan efek ke tagihan & penerimaan. | **Approval berjenjang** refund/void; refund ke rekening (non-tunai). |
| Piutang pasien (AR) | Catat sisa tagihan belum lunas sebagai piutang + pelunasan susulan. | **Penghapusan piutang (write-off)** dengan approval; aging & penagihan. |
| Penjaminan | Tandai penjamin (Umum/BPJS/Asuransi), hitung porsi pasien (iur/selisih). | Integrasi otomatis status klaim dari Casemix (G5–G12). |

**Out of Scope**
- Proses **klaim INA-CBG / e-Klaim BPJS** dan klaim asuransi swasta → modul **Casemix (G5–G12)**.
- **Buka & Tutup Kasir** serta saldo awal/akhir sesi → modul **G1** (G2 hanya membukukan penerimaan ke sesi aktif).
- **Verifikasi/rekonsiliasi setoran kas** ke keuangan → modul **G4**.
- **Rekap & laporan keuangan kasir lintas-shift/periode** → **fase berikutnya** (di luar G2 sesuai arahan).
- **Master tarif & layanan** (definisi harga tindakan/kamar) → **A10 / A43** (G2 hanya mengonsumsi).
- Akuntansi buku besar (GL/jurnal) dan pelaporan pajak → di luar cakupan MVP. [ASUMSI]

## 5. Related Features

| Code | Modul / Menu | Relasi Teknis / Bisnis dengan G2 |
|------|--------------|----------------------------------|
| A10 | Master Data Tindakan & Tarif | Sumber `unit_price` charge item tindakan (`total_tarif`, jasa sarana/pelayanan/medis). Tarif dikunci ke tagihan saat finalisasi. |
| A43 | Master Data Tarif Kamar | Sumber tarif akomodasi/kamar per `kelas_perawatan` untuk pasien RI. |
| A38 | Master Data Bank | Referensi `bank_id` untuk pembayaran non-tunai (transfer/QRIS/kartu) — konsisten dgn definisi kamus. |
| G1 | Buka & Tutup Kasir | Setiap pembayaran dibukukan ke `cashier_session_id` sesi kasir aktif; menjadi bahan rekap tutup kasir. |
| G3 | Deposit / Dana Wadiah Pasien | Saldo deposit pasien dipotongkan sebagai salah satu metode pembayaran tagihan; sisa dikembalikan saat pelunasan. |
| G4 | Verifikasi Penerimaan Kas | Penerimaan hasil pembayaran G2 menjadi objek verifikasi/rekonsiliasi ke keuangan. |
| G5–G12 | Casemix (Klaim BPJS/Asuransi) | Menentukan porsi dijamin vs porsi pasien; status klaim menjadi acuan penjaminan tagihan. |
| B1 / B2 | Pendaftaran RJ / RI | Sumber identitas pasien & `jenis_penjamin`, `kelas_perawatan`, `no_sep` yang mengalir ke tagihan. |

## 6. Business Process & User Stories

**State Machine — Status Tagihan (Invoice)**

| Status | Deskripsi | Efek Keuangan | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|---------------|--------------------|--------------------|
| DRAFT | Tagihan berjalan; charge item masih bertambah selama episode pelayanan aktif. | Belum ada kewajiban bayar final. | → FINAL (finalisasi) | idem |
| FINAL | Tagihan dikunci (tarif & item terkunci), siap dibayar. | Total tagihan tetap; menunggu pembayaran. | → PARTIAL, → PAID, → VOID | → VOID butuh approval |
| PARTIAL | Sebagian sudah dibayar (termasuk deposit), masih ada sisa. | `outstanding` > 0. | → PAID (pelunasan), → RECEIVABLE (pulang belum lunas) | idem |
| PAID | Lunas; `outstanding` = 0. | Penerimaan penuh. | → REFUNDED (refund) | → REFUNDED butuh approval |
| RECEIVABLE | Pasien pulang dengan sisa tagihan → menjadi piutang (AR). | `outstanding` tercatat sebagai piutang. | → PAID (pelunasan susulan) | → WRITTEN_OFF (hapus piutang, approval) |
| REFUNDED | Pembayaran dikembalikan sebagian/seluruhnya. | Penerimaan berkurang; jejak alasan. | (terminal) | idem |
| VOID | Tagihan dibatalkan (mis. salah buat). | Membatalkan seluruh kewajiban & penerimaan terkait. | (terminal) | idem |

> Catatan status behavior: kasir **tidak** menginput status secara langsung; status **PAID/PARTIAL dihitung sistem** dari akumulasi pembayaran vs `grand_total`. Status DRAFT diset otomatis saat tagihan dibuat.

**User Stories Utama**

- **US-G2-01** — Sebagai **Kasir**, saya ingin melihat seluruh komponen biaya pasien terkumpul otomatis dalam satu tagihan, agar tidak ada biaya yang terlewat saat menagih. *(traceability: agregasi charge item — FR-G2-01)*
- **US-G2-02** — Sebagai **Kasir**, saya ingin memproses pembayaran dengan beberapa metode sekaligus (tunai + transfer/QRIS + deposit), agar pelunasan fleksibel sesuai kondisi pasien. *(FR-G2-04)*
- **US-G2-03** — Sebagai **Kasir**, saya ingin memotong saldo deposit (G3) ke tagihan, agar sisa yang harus dibayar akurat. *(FR-G2-05)*
- **US-G2-04** — Sebagai **Kasir/Supervisor**, saya ingin memberi diskon dengan alasan dan batas wewenang, agar keringanan tercatat dan terkendali. *(FR-G2-06)*
- **US-G2-05** — Sebagai **Kasir/Supervisor**, saya ingin melakukan refund/void dengan alasan wajib, agar koreksi transaksi punya jejak audit. *(FR-G2-07)*
- **US-G2-06** — Sebagai **Petugas Keuangan**, saya ingin tagihan belum lunas tercatat sebagai piutang pasien, agar dapat ditagih kembali. *(FR-G2-08)*
- **US-G2-07** — Sebagai **Kasir**, saya ingin mencetak kwitansi/bukti bayar resmi, agar pasien punya bukti pembayaran sah. *(FR-G2-09)*
- **US-G2-08** — Sebagai **Manajemen**, saya ingin porsi tanggungan pasien terpisah dari porsi penjamin (BPJS/asuransi), agar penagihan sesuai hak penjaminan. *(FR-G2-03)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**FR-G2-01 — Agregasi & Pembuatan Tagihan**
- **User Story**: Sebagai Kasir, saya ingin tagihan terbentuk otomatis dari charge item semua unit, agar rekap biaya lengkap dan tanpa input ulang.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Saat episode pelayanan dibuka, sistem membuat 1 tagihan berstatus `DRAFT` tertaut ke `encounter_id` & `patient_id`.
  - **AC 2**: Setiap charge item dari unit (tindakan A10, obat/BHP Farmasi, kamar A43, penunjang) otomatis masuk sebagai baris tagihan dengan `unit_price` diambil dari master tarif terkait.
  - **AC 3**: `grand_total` = Σ(subtotal item) − `discount_total` (+ komponen lain bila ada), dihitung ulang setiap ada perubahan item.
  - **AC 4**: Kasir dapat menambah/menghapus item manual **hanya** selama status `DRAFT`.

**FR-G2-02 — Finalisasi Tagihan (Kunci Tarif)**
- **User Story**: Sebagai Kasir, saya ingin mengunci tagihan sebelum bayar, agar tarif & item tidak berubah saat pembayaran.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Aksi "Finalisasi" mengubah status `DRAFT` → `FINAL` dan menyalin `unit_price` snapshot ke tiap item (tarif terkunci walau master berubah).
  - **AC 2**: Setelah `FINAL`, item tidak dapat ditambah/dihapus kecuali via void/koreksi.

**FR-G2-03 — Penentuan Porsi Penjamin vs Pasien**
- **User Story**: Sebagai Manajemen, saya ingin tanggungan pasien terpisah dari penjamin, agar penagihan sesuai hak.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: `jenis_penjamin` (Umum/BPJS/Asuransi) diwarisi dari pendaftaran (B1/B2); dapat ditinjau di layar tagihan.
  - **AC 2**: Untuk BPJS/Asuransi, sistem memisahkan **porsi dijamin** dan **porsi pasien** (iur biaya / selisih kelas). [PERLU KONFIRMASI aturan iur biaya per RS]
  - **AC 3**: Yang ditagih ke pasien di kasir hanya **porsi pasien**; porsi dijamin diteruskan ke Casemix (G5–G12).

**FR-G2-04 — Pembayaran Multi-Metode & Split Payment**
- **User Story**: Sebagai Kasir, saya ingin menerima beberapa metode bayar dalam satu transaksi, agar pelunasan fleksibel.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Kasir dapat menambah ≥1 baris pembayaran; total pembayaran boleh dari kombinasi tunai + non-tunai + deposit.
  - **AC 2**: Untuk metode non-tunai, `bank_id` (A38) dan `reference_no` wajib diisi.
  - **AC 3**: Bila Σ pembayaran ≥ `grand_total` → status `PAID`; bila 0 < Σ < grand_total → `PARTIAL`; sistem menghitung **kembalian** untuk kelebihan tunai.
  - **AC 4**: Setiap pembayaran dibukukan ke `cashier_session_id` sesi kasir aktif (G1); jika tidak ada sesi kasir terbuka → pembayaran ditolak. [PERLU KONFIRMASI]

**FR-G2-05 — Pemotongan Deposit (G3)**
- **User Story**: Sebagai Kasir, saya ingin memotong saldo deposit pasien ke tagihan, agar sisa bayar akurat.
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Sistem menampilkan saldo deposit pasien (dari G3); kasir dapat memakai sebagian/seluruh saldo sebagai metode pembayaran `deposit`.
  - **AC 2**: Nominal deposit yang dipakai ≤ saldo tersedia dan ≤ `outstanding`.
  - **AC 3**: Pemakaian deposit mengurangi saldo di G3 dan tercatat sebagai baris pembayaran pada tagihan.

**FR-G2-06 — Diskon / Keringanan**
- **User Story**: Sebagai Kasir/Supervisor, saya ingin memberi diskon dengan alasan & batas wewenang, agar keringanan terkendali.
- **Prioritas**: P1
- **Fase**: Phase 1 (dalam batas) / Phase 2 (approval > batas)
- **Acceptance Criteria**:
  - **AC 1 (P1)**: Diskon dapat berupa persen atau nominal, per item atau total, dengan **alasan wajib**.
  - **AC 2 (P1)**: Diskon dalam **batas wewenang** kasir langsung berlaku; nilai & pelaku tercatat.
  - **AC 3 (P2)**: Diskon melebihi batas berstatus `PENDING_APPROVAL` dan baru berlaku setelah disetujui approver. *(desain kolom `status_approval`/`approver_id` sudah disiapkan sejak Phase 1)*

**FR-G2-07 — Refund & Pembatalan (Void)**
- **User Story**: Sebagai Kasir/Supervisor, saya ingin refund/void dengan alasan wajib, agar koreksi punya jejak audit.
- **Prioritas**: P1
- **Fase**: Phase 1 (dengan alasan) / Phase 2 (approval)
- **Acceptance Criteria**:
  - **AC 1**: Refund mengembalikan sebagian/seluruh pembayaran; `outstanding` & status tagihan dihitung ulang; alasan wajib.
  - **AC 2**: Void membatalkan tagihan `FINAL` yang salah buat (bila belum ada pembayaran, atau setelah refund penuh) → status `VOID`.
  - **AC 3 (P2)**: Refund/void memerlukan approval berjenjang sebelum efektif.
  - **AC 4**: Refund tunai memengaruhi kas sesi kasir aktif (G1); refund non-tunai mencatat rekening tujuan. [PERLU KONFIRMASI mekanisme refund non-tunai]

**FR-G2-08 — Piutang Pasien (AR)**
- **User Story**: Sebagai Petugas Keuangan, saya ingin tagihan belum lunas tercatat sebagai piutang, agar bisa ditagih kembali.
- **Prioritas**: P1
- **Fase**: Phase 1 (catat & lunasi) / Phase 2 (write-off)
- **Acceptance Criteria**:
  - **AC 1**: Bila pasien pulang dengan `outstanding` > 0 (mis. pulang paksa/APS), sistem membuat record piutang tertaut ke tagihan & pasien.
  - **AC 2**: Pelunasan susulan mengurangi `outstanding`; saat 0 → status `PAID`.
  - **AC 3 (P2)**: Penghapusan piutang (write-off) memerlukan approval; tercatat pelaku & alasan.

**FR-G2-09 — Cetak Kwitansi / Bukti Bayar**
- **User Story**: Sebagai Kasir, saya ingin mencetak kwitansi resmi, agar pasien punya bukti sah.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Kwitansi memuat identitas RS, no. kwitansi unik, identitas pasien, rincian item, total, metode bayar, kembalian, nama kasir, tanggal/jam.
  - **AC 2**: Kwitansi dapat dicetak ulang (reprint) dengan penanda "SALINAN". [ASUMSI]

**Validasi — Wording (Frontend), layar Pembayaran**

| Field | Tipe Input | Rules | Error Message | Helper Text |
|-------|------------|-------|---------------|-------------|
| Metode Bayar | Dropdown | Required | "Metode pembayaran wajib dipilih" | "Pilih tunai/transfer/QRIS/kartu/deposit" |
| Nominal Bayar | Number | Required, > 0 | "Nominal harus lebih dari 0" | "Masukkan jumlah yang dibayar" |
| Bank | Lookup (A38) | Required jika non-tunai | "Bank wajib dipilih untuk pembayaran non-tunai" | "Pilih bank tujuan/mesin EDC" |
| No. Referensi | Text | Required jika non-tunai, maks 40 | "Nomor referensi wajib diisi" | "No. transaksi transfer/QRIS/approval EDC" |
| Nominal Deposit Dipakai | Number | ≤ saldo deposit & ≤ sisa tagihan | "Melebihi saldo deposit / sisa tagihan" | "Sisa saldo: Rp{saldo}" |
| Alasan Diskon | Text | Required jika diskon > 0, maks 200 | "Alasan diskon wajib diisi" | "Contoh: pasien tidak mampu, kebijakan RS" |
| Alasan Refund/Void | Text | Required, maks 200 | "Alasan wajib diisi" | "Jelaskan alasan koreksi transaksi" |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `billing_invoices`** (header tagihan)
- `id`: UUID (Primary Key)
- `invoice_no`: String (unik, auto-generate)
- `encounter_id`: UUID (FK episode pelayanan)
- `patient_id`: UUID (FK pasien)
- `visit_type`: Enum (RJ / RI / IGD)
- `payer_type`: Enum (umum / bpjs / asuransi)  ← selaras `jenis_penjamin`
- `payer_ref`: String (no_sep / no_polis, nullable)
- `class_right`: Enum (VIP/1/2/3, nullable)  ← selaras `kelas_perawatan`
- `subtotal`: Decimal
- `discount_total`: Decimal (default 0)
- `patient_portion`: Decimal (porsi pasien)
- `payer_portion`: Decimal (porsi dijamin)
- `grand_total`: Decimal
- `paid_total`: Decimal (default 0)
- `outstanding`: Decimal (grand_total − paid_total)
- `status`: Enum (DRAFT/FINAL/PARTIAL/PAID/RECEIVABLE/REFUNDED/VOID)
- `is_active`: Boolean (default true)
- `created_by`, `created_at`, `updated_at`

**Table: `billing_invoice_items`**
- `id`: UUID (PK) · `invoice_id`: UUID (FK)
- `source_type`: Enum (tindakan/obat/bhp/kamar/penunjang/administrasi)
- `source_ref_id`: UUID (id tindakan A10 / tarif kamar A43 / item farmasi / order penunjang)
- `description`: String · `qty`: Decimal · `unit_price`: Decimal (snapshot saat finalisasi)
- `discount_amount`: Decimal (default 0) · `subtotal`: Decimal

**Table: `billing_payments`**
- `id`: UUID (PK) · `invoice_id`: UUID (FK)
- `method`: Enum (cash/transfer/qris/card/deposit/penjamin)
- `amount`: Decimal · `bank_id`: UUID (FK master Bank A38, nullable) · `reference_no`: String (nullable)
- `cashier_session_id`: UUID (FK sesi kasir G1) · `cashier_id`: UUID
- `status`: Enum (posted/refunded) · `paid_at`: Timestamp

**Table: `billing_discounts`**  (siap Phase 2)
- `id`, `invoice_id`/`item_id`, `disc_type` (percent/nominal), `value`, `reason`
- `status_approval`: Enum (none/pending/approved/rejected)  ← **disiapkan sejak Phase 1**
- `approver_id`: UUID (nullable), `created_by`, `created_at`

**Table: `billing_refunds`**  (siap Phase 2)
- `id`, `invoice_id`, `payment_id`, `amount`, `reason`, `refund_method`
- `status_approval`: Enum (none/pending/approved/rejected), `approver_id` (nullable), `refunded_by`, `created_at`

**Table: `billing_receivables`** (piutang / AR)
- `id`, `invoice_id`, `patient_id`, `outstanding`, `due_date` (nullable)
- `status`: Enum (open/paid/written_off), `write_off_reason` (nullable), `write_off_by` (nullable)

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/billing/invoices` | List tagihan (filter status/tanggal/pasien/penjamin) |
| POST | `/api/v1/billing/invoices` | Buat tagihan (biasanya otomatis dari encounter) |
| GET | `/api/v1/billing/invoices/{id}` | Detail tagihan + item + pembayaran |
| POST | `/api/v1/billing/invoices/{id}/items` | Tambah charge item (status DRAFT) |
| DELETE | `/api/v1/billing/invoices/{id}/items/{itemId}` | Hapus item (status DRAFT) |
| POST | `/api/v1/billing/invoices/{id}/finalize` | Finalisasi (kunci tarif) DRAFT→FINAL |
| POST | `/api/v1/billing/invoices/{id}/payments` | Tambah pembayaran (multi/split) |
| POST | `/api/v1/billing/invoices/{id}/apply-deposit` | Potong saldo deposit (G3) |
| POST | `/api/v1/billing/invoices/{id}/discounts` | Ajukan/terapkan diskon |
| POST | `/api/v1/billing/invoices/{id}/refunds` | Refund pembayaran |
| PATCH | `/api/v1/billing/invoices/{id}/void` | Batalkan tagihan (VOID) |
| GET | `/api/v1/billing/invoices/{id}/receipt` | Cetak/preview kwitansi |
| GET | `/api/v1/billing/receivables` | List piutang pasien (AR) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Pembayaran (Layar CREATE Payment)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| invoice_id | Tagihan | lookup | Ya | tagihan status FINAL/PARTIAL | konteks tagihan | read-only |
| jenis_penjamin | Penjamin | dropdown | Ya | enum: Umum/BPJS/Asuransi | autofill dari B1/B2 | konsisten kamus lintas-PRD |
| method | Metode Bayar | dropdown | Ya | cash/transfer/qris/card/deposit | enum | – |
| amount | Nominal Bayar | number | Ya | > 0, ≤ sisa (kecuali tunai boleh lebih→kembalian) | manual | format Rp |
| bank_id | Bank | lookup | Ya bila non-tunai | dari master Bank (A38) | lookup A38 | konsisten kamus |
| reference_no | No. Referensi | text | Ya bila non-tunai | maks 40 char | manual | no. transfer/QRIS/approval EDC |
| deposit_amount | Deposit Dipakai | number | Tidak | ≤ saldo deposit (G3) & ≤ sisa | lookup G3 | mengurangi saldo deposit |
| discount_value | Diskon | number | Tidak | ≥ 0; > batas → approval (P2) | manual | butuh `reason` |
| discount_reason | Alasan Diskon | text | Ya bila diskon>0 | maks 200 char | manual | jejak audit |
| cashier_session_id | Sesi Kasir | lookup | Ya | sesi kasir aktif (G1) | sistem | pembayaran ditolak bila tak ada sesi |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar Tagihan (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No. Tagihan | billing_invoices.invoice_no | text | sort terbaru | – |
| No. RM / Nama | pasien (via patient_id) | text | filter cari | `no_rm` konsisten kamus |
| Penjamin | billing_invoices.payer_type | badge | filter | Umum/BPJS/Asuransi |
| Grand Total | billing_invoices.grand_total | Rp | sort | – |
| Terbayar | billing_invoices.paid_total | Rp | – | – |
| Sisa (Outstanding) | billing_invoices.outstanding | Rp | sort | merah bila > 0 |
| Status | billing_invoices.status | badge | filter | DRAFT/FINAL/PARTIAL/PAID/RECEIVABLE/REFUNDED/VOID |
| Tanggal | billing_invoices.created_at | dd-MM-yyyy HH:mm | sort (default desc) | – |

**Business Rules**
- **BR-G2-01**: `grand_total` = Σ(item.subtotal) − `discount_total`; `outstanding` = `grand_total` − `paid_total`. Selalu dihitung sistem, tidak diinput manual.
- **BR-G2-02**: Item hanya dapat diubah saat status `DRAFT`. Setelah `FINAL`, `unit_price` di-snapshot dan terkunci meski master tarif (A10/A43) berubah.
- **BR-G2-03**: Status `PAID` diset otomatis saat `paid_total` ≥ `grand_total`; `PARTIAL` saat 0 < `paid_total` < `grand_total`. Kasir tidak menyetel status manual.
- **BR-G2-04**: Pembayaran non-tunai wajib `bank_id` (A38) + `reference_no`. Pembayaran tunai menghasilkan kembalian bila `amount` > sisa.
- **BR-G2-05**: Pemakaian deposit ≤ saldo G3 dan ≤ `outstanding`; mengurangi saldo deposit pasien secara atomik.
- **BR-G2-06**: Diskon dalam batas wewenang kasir langsung efektif; di atas batas → `status_approval = pending` (Phase 2). Semua diskon wajib `reason`.
- **BR-G2-07**: Refund/void wajib `reason`; refund tunai memengaruhi kas sesi kasir aktif (G1). Void hanya untuk tagihan tanpa pembayaran aktif (atau setelah refund penuh).
- **BR-G2-08**: Tagihan dengan `outstanding` > 0 saat pasien keluar → otomatis menjadi piutang (`billing_receivables.status = open`).
- **BR-G2-09**: Setiap pembayaran wajib terikat ke `cashier_session_id` yang berstatus terbuka (G1); bila tidak ada sesi terbuka, transaksi ditolak. [PERLU KONFIRMASI kebijakan RS]
- **BR-G2-10**: Porsi pasien vs porsi penjamin dihitung berdasarkan `payer_type` dan hak kelas; selisih naik kelas & iur biaya menjadi tanggungan pasien. [PERLU KONFIRMASI formula per RS]

## 9. Workflow / BPMN Interpretation

> Modul G2 **belum memiliki BPMN sendiri** pada data List Fitur. Alur berikut diturunkan dari pola proses billing SIMRS RS Tipe C & D dan keterkaitan modul (G1/G3/G4, A10/A43, Casemix). Ditandai [ASUMSI] pada bagian turunan.

**Alur Utama — Pembayaran Tagihan (happy path):**
1. Pasien menyelesaikan pelayanan (RJ selesai / RI pulang) → episode pelayanan ditutup. *(trigger)*
2. Sistem sudah mengakumulasi charge item ke tagihan berstatus `DRAFT` (tindakan A10, obat/BHP, kamar A43, penunjang). [ASUMSI agregasi otomatis]
3. Kasir membuka tagihan, meninjau rincian & penjamin (`jenis_penjamin`), lalu **Finalisasi** → `FINAL` (tarif terkunci).
4. Untuk BPJS/Asuransi: sistem memisahkan porsi dijamin (→ Casemix) dan porsi pasien; hanya porsi pasien ditagih di kasir.
5. Kasir menerapkan diskon (bila ada, dengan alasan) dan memotong **deposit (G3)** bila tersedia.
6. Kasir menerima pembayaran (tunai/non-tunai/split), dibukukan ke **sesi kasir aktif (G1)**.
7. Bila `paid_total` ≥ `grand_total` → status `PAID`; sistem menghitung kembalian → **cetak kwitansi**.
8. Penerimaan menjadi bahan **verifikasi kas (G4)** dan rekap **tutup kasir (G1)**.

**Cabang / skenario alternatif:**
- **Kurang bayar / pulang paksa (APS)**: pembayaran < grand_total → status `PARTIAL`; saat pasien keluar → dibuat **piutang (AR)**; pelunasan susulan mengurangi outstanding hingga `PAID`.
- **Refund**: pembayaran dikembalikan (alasan wajib) → outstanding/status dihitung ulang; refund tunai memengaruhi kas G1. *(Phase 2: butuh approval)*
- **Void**: tagihan salah buat & belum dibayar → `VOID`. *(Phase 2: butuh approval)*
- **Diskon di atas batas** *(Phase 2)*: `PENDING_APPROVAL` → efektif setelah approver menyetujui.

## Asumsi
- [ASUMSI] Charge item dari unit (tindakan/obat/BHP/kamar/penunjang) sudah dialirkan otomatis ke tagihan oleh modul pelayanan/farmasi; G2 mengagregasi, bukan menginput ulang.
- [ASUMSI] Target waktu proses kasir < 3 menit/pasien dan reprint kwitansi berlabel 'SALINAN' — angka & kebijakan menunggu konfirmasi RS.
- [ASUMSI] Akuntansi buku besar (GL/jurnal) & pelaporan pajak di luar cakupan MVP G2.
- [ASUMSI] Alur diturunkan dari pola billing SIMRS RS Tipe C & D karena G2 belum memiliki BPMN sendiri.

## Pertanyaan Terbuka
- [PERLU KONFIRMASI] Formula porsi pasien vs penjamin (iur biaya, selisih naik kelas) untuk pasien BPJS/asuransi — apakah mengikuti aturan nasional atau kebijakan tarif RS?
- [PERLU KONFIRMASI] Apakah pembayaran wajib selalu terikat sesi kasir terbuka (G1), atau ada mode pembayaran di luar sesi (mis. bendahara)?
- [PERLU KONFIRMASI] Mekanisme refund non-tunai (ke rekening pasien) — manual transfer bendahara atau tercatat sebagai instruksi refund?
- [PERLU KONFIRMASI] Batas wewenang diskon per role (kasir vs supervisor) dan jenjang approval Phase 2.
- [PERLU KONFIRMASI] Kebijakan penghapusan piutang (write-off): syarat, approver, dan aging.
- [PERLU KONFIRMASI] Format nomor tagihan & nomor kwitansi (pola, reset periode).