# PRD — Dashboard Billing (G2c) — Phase 1 Quantity Dashboard

**Related Document:** PRD G2 — Billing: Tagihan Pasien (induk).  
**Versi:** 1.3 — Periode Phase 1 menggunakan date-range; user dapat memilih rentang tanggal hingga satu hari.  
**Tanggal:** 17 Juli 2026  
**Sumber penyesuaian:** Skema-Dashboard-Billing-SIMRS.xlsx, Sheet Plan 1.

## 1. Metadata Dokumen

Dashboard Billing (G2c) adalah PRD anak dari PRD Tagihan Pasien (G2). Secara UI, fitur menyatu pada halaman Tagihan Pasien bersama tab G2a Deposito Pasien dan G2b Penjualan Obat Bebas/OTC. G2c bersifat read-only dan tidak membuat menu top-level baru.

### Scope Lock Phase 1

Phase 1 hanya menampilkan **kuantitas tagihan**. Tidak ada nominal Rupiah, total payment amount, outstanding amount, average bill, aging nominal, collection rate, nilai casemix, refund amount, deposit amount, atau KPI finansial lainnya.

Enam kebutuhan Phase 1:

1. Total Kuantitas Tagihan.
2. Total Kuantitas Tagihan Lunas vs Belum Lunas.
3. Kuantitas Tagihan berdasarkan Status Tagihan.
4. Kuantitas Tagihan berdasarkan Tipe Penjamin.
5. Kuantitas Tagihan berdasarkan Tipe Pelayanan.
6. Kuantitas Tagihan berdasarkan Metode Pembayaran.

Semua kebutuhan analitik selain enam kebutuhan tersebut masuk Phase 2.

## 2. Overview & Background

### Tujuan

Memberikan ringkasan volume tagihan yang cepat, konsisten, dan dapat difilter oleh Kasir, Supervisor Billing, Keuangan, dan Manajemen tanpa membuka transaksi satu per satu.

### Masalah

Pengguna masih harus membuka worklist atau membuat rekap manual untuk mengetahui jumlah tagihan menurut status, status pembayaran, penjamin, tipe pelayanan, dan metode pembayaran. Perhitungan manual juga berisiko menghitung invoice merge parent-child lebih dari satu kali.

### Prinsip Data

* Unit analisis Phase 1 adalah invoice/tagihan unik: COUNT DISTINCT bill_id.
* Tagihan OTC tidak masuk G2c; bill_type PATIENT menjadi default scope.
* Merge child mengikuti reporting object yang ditetapkan G2; parent-child tidak dihitung ganda.
* Semua widget menggunakan date_from/date_to, date_basis, scope organisasi, dan filter yang sama. Rentang satu hari diperbolehkan.
* G2c hanya mengonsumsi data agregat kuantitas; frontend tidak menghitung ulang dari baris transaksi.
* Bila satu bill memiliki lebih dari satu metode pembayaran, API menggunakan primary_payment_method kanonik dari G2. Aturan final penentuan primary method perlu dikonfirmasi bersama pemilik G2.

## 3. Goals & Success Metrics

| No | Goal | Success Criteria |
|----|------|------------------|
| 1 | Kuantitas konsisten | Seluruh angka sama dengan COUNT DISTINCT bill_id pada G2 untuk filter identik. |
| 2 | Kelengkapan Phase 1 | Enam kebutuhan quantity-only tersedia: total, Lunas/Belum Lunas, status, penjamin, pelayanan, dan metode pembayaran. |
| 3 | Tanpa nominal | API dan UI Phase 1 tidak menampilkan atau mengirim field nominal finansial. |
| 4 | Filter seragam | Perubahan periode, status, penjamin, tipe pelayanan, atau metode pembayaran memperbarui seluruh widget. |
| 5 | Interaktif | Segmen chart dapat dipilih untuk menerapkan cross-filter kuantitas. |
| 6 | Performa dan keamanan | P95 ≤ 3 detik untuk rentang 31 hari pada scope normal; seluruh endpoint GET dan mengikuti RBAC A53. |

## 4. Scope Definition & Phasing

| Fitur | Phase 1 — MVP Quantity Only | Phase 2 |
|-------|-----------------------------|---------|
| Shell dan filter | Shell G2; periode/tanggal acuan, scope/cabang, Status Tagihan, Tipe Penjamin, Tipe Pelayanan, Metode Pembayaran. | Dependent filter lebih kaya, saved filter, preset, share view. |
| Total Kuantitas Tagihan | KPI jumlah invoice unik saja. | Total bruto, diskon, net, payment, outstanding. |
| Lunas vs Belum Lunas | Donut/bar jumlah invoice per dua kelompok. | Nilai Lunas, outstanding, refund, overpayment, settlement. |
| Status Tagihan | Jumlah invoice per Open, Locked, Partially Paid, Paid, Canceled, Refunded sesuai status yang tersedia. | Nominal per status, histori status, transisi, aging. |
| Tipe Penjamin | Jumlah invoice per kategori/nama penjamin; dapat menjadi filter. | Nominal, klaim, piutang penjamin, coverage dan kontrak. |
| Tipe Pelayanan | Jumlah invoice per RJ, RI, IGD, VK, IBS, Penunjang, dan tipe lain. | Nominal, registrasi/episode, unit ranking, casemix. |
| Metode Pembayaran | Jumlah invoice berdasarkan primary payment method kanonik. | Jumlah transaksi, nominal, fee, settlement pending/failed, rekonsiliasi gateway/bank. |
| Visual finansial | Tidak masuk Phase 1. | Tren nominal, aging nominal, collection rate, average bill, deposit, refund, revenue/casemix, tagihan tertinggi. |
| Detail dan drill-down | Cross-filter agregat; detail invoice finansial tidak masuk preview Phase 1. | Tabel detail invoice/pasien/payment/claim/audit dan export sesuai RBAC. |

### Out of Scope Phase 1

1. Menampilkan nominal Rupiah atau field amount apa pun.
2. Membuat, mengubah, menghapus, menggabungkan, mengunci, membuka kunci, atau membayar tagihan.
3. Payment amount, outstanding amount, refund, deposit, collection rate, aging nominal, target, settlement, dan revenue.
4. Ranking tagihan tertinggi, casemix nominal, tren finansial, klaim finansial, dan tabel detail finansial.
5. Dashboard OTC sebagai domain baru; OTC mengikuti G2b.

## 5. Related Features

| Code | Modul | Relasi |
|------|-------|--------|
| G2 | Tagihan Pasien | Source of truth bill, status, merge, dan worklist tujuan. |
| G2a/G2b | Deposito Pasien dan OTC | Tab sejawat dalam shell; bukan sumber KPI Phase 1 G2c. |
| A20 | Tipe Penjamin | Master kategori/nama penjamin. |
| A3/Encounter | Unit dan konteks pelayanan | Sumber service_type dan service_unit asal item billing. |
| Payment/Cashier | Metode pembayaran | Sumber primary_payment_method atau metode pembayaran kanonik. |
| A53 | RBAC | Scope organisasi, unit, dan hak akses. |

## 6. Business Process & User Stories

### Alur

Pengguna membuka tab Dashboard Billing → sistem memuat date-range default bulan berjalan → pengguna dapat mengatur tanggal awal dan tanggal akhir, termasuk rentang satu hari → API memvalidasi RBAC dan scope → analytical layer mengembalikan agregasi kuantitas → UI menampilkan KPI dan chart → pengguna memilih segmen → filter terkait diterapkan ke semua widget. Tidak ada mutasi transaksi.

### User Stories

* **US-C01:** Sebagai Direksi/Keuangan/Billing, saya ingin melihat Total Kuantitas Tagihan pada periode dan filter aktif.
* **US-C02:** Sebagai Manajemen, saya ingin membandingkan jumlah Tagihan Lunas dan Belum Lunas.
* **US-C03:** Sebagai Keuangan/Billing, saya ingin melihat kuantitas tagihan berdasarkan Status Tagihan.
* **US-C04:** Sebagai Manajemen, saya ingin memfilter dan membandingkan kuantitas berdasarkan Tipe Penjamin.
* **US-C05:** Sebagai Manajemen Operasional, saya ingin memfilter dan membandingkan kuantitas berdasarkan Tipe Pelayanan.
* **US-C06:** Sebagai Kasir/Keuangan, saya ingin melihat kuantitas berdasarkan Metode Pembayaran.
* **US-C07:** Sebagai pengguna berizin, saya ingin memilih segmen chart dan mempertahankan filter yang sama pada seluruh widget.
* **US-C08:** Sebagai Keuangan/AR/Casemix, saya ingin mendapatkan analitik nominal dan finansial pada Phase 2.

## 7. Functional Requirements

### FR-C01 — Shell dan Filter Global Phase 1

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Dashboard menyatu di shell halaman Tagihan Pasien dan memiliki penanda PHASE 1 — QUANTITY ONLY.
2. Filter minimal: date_from/date_to, date_basis, hospital_id/scope, invoice_status, payer_category/payer_id, service_type/service_unit_id, dan payment_method.
3. Default date-range adalah hari pertama sampai hari terakhir bulan berjalan dengan timezone organisasi Asia/Jakarta; date_from boleh sama dengan date_to untuk analisis harian.
4. Apply, Reset, loading, empty, error, dan stale state tersedia.
5. Semua widget menggunakan filter yang sama dan menampilkan data_as_of.
6. Filter tidak boleh mengubah data transaksi.

### FR-C02 — Total Kuantitas Tagihan

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. KPI menampilkan label **Total Kuantitas Tagihan** dan bilangan invoice unik.
2. Rumus: COUNT DISTINCT bill_id setelah scope, date_from/date_to inklusif, date_basis, status, penjamin, pelayanan, dan metode pembayaran diterapkan.
3. bill_type OTC, merged child, dan objek yang dikecualikan G2 tidak dihitung.
4. Tidak ada nominal, simbol Rupiah, payment amount, outstanding, atau sub-metrik finansial.

### FR-C03 — Lunas vs Belum Lunas

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Chart menampilkan jumlah invoice kategori Lunas dan Belum Lunas.
2. Lunas mengikuti status G2 LUNAS/LUNAS_PENJAMIN atau payment_status kanonik PAID.
3. Belum Lunas mencakup invoice aktif yang belum berstatus Lunas, termasuk Open, Locked, Partially Paid, Berjalan, Menunggu Bayar, dan Cicilan sesuai mapping G2.
4. Canceled tidak masuk kelompok Lunas maupun Belum Lunas aktif kecuali konfigurasi reporting G2 menyatakan sebaliknya.
5. Klik segmen menerapkan filter status ke widget lain; hanya kuantitas yang ditampilkan.

### FR-C04 — Kuantitas berdasarkan Status Tagihan

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Chart menampilkan jumlah invoice per status Open, Locked, Partially Paid, Paid, Canceled, dan Refunded.
2. Mapping system_status ke display_status ditetapkan oleh G2 dan dikembalikan bersama metadata.
3. Total antar status tidak boleh menghitung satu bill lebih dari sekali.
4. Tooltip berisi status, kuantitas, persentase kuantitas, periode, dan data_as_of; tidak berisi nominal.

### FR-C05 — Kuantitas berdasarkan Tipe Penjamin

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Chart menampilkan COUNT DISTINCT bill_id per payer_category/payer_id.
2. Minimal mendukung Umum, BPJS, Asuransi, Pribadi, Perusahaan, dan label historis yang masih dipakai.
3. Pengguna dapat memilih satu segmen sebagai filter penjamin untuk seluruh widget.
4. Jika satu bill mempunyai lebih dari satu snapshot penjamin, API mengikuti payer snapshot kanonik G2 dan tidak menggandakan count.

### FR-C06 — Kuantitas berdasarkan Tipe Pelayanan

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Chart menampilkan COUNT DISTINCT bill_id per service_type/service_unit_id.
2. Minimal mendukung RJ, RI, IGD, Penunjang.
3. Unit yang tidak terpetakan ditampilkan sebagai Tidak Terpetakan, bukan dihilangkan diam-diam.
4. Dimensi berasal dari konteks pelayanan/item billing, bukan hanya unit registrasi.

### FR-C07 — Kuantitas berdasarkan Metode Pembayaran

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Chart menampilkan COUNT DISTINCT bill_id per primary_payment_method kanonik.
2. Minimal mendukung Tunai, Transfer, QRIS, Debit, Kredit, Deposit, Piutang, dan metode gateway yang tersedia.
3. Bila bill memiliki beberapa metode, API menggunakan primary method dari G2. Aturan fallback dan kasus tanpa payment wajib ditampilkan pada metadata.
4. Label chart menyatakan bahwa metrik adalah kuantitas tagihan, bukan kuantitas Rupiah atau jumlah transaksi payment.

### FR-C08 — Interaksi dan Read-only

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Chart memiliki tooltip, legenda, keyboard focus, dan alternatif ringkasan tabel kuantitas.
2. Klik segmen menerapkan cross-filter dan memperbarui KPI/chart lain.
3. Drill-down detail finansial dan aksi transaksi tidak tersedia di Phase 1.
4. Semua endpoint G2c Phase 1 adalah GET; tidak ada POST/PUT/PATCH/DELETE.

### FR-C09 — RBAC, Scope, dan Konsistensi

**Prioritas:** P0. **Fase:** Phase 1.

Acceptance criteria:

1. Server memvalidasi A53 row-level scope; menyembunyikan opsi filter di UI saja tidak cukup.
2. Satu response memiliki period, date_basis, scope, data_as_of, dan formula_version yang sama untuk semua widget.
3. Aggregator memakai distinct bill dan aturan merge G2.
4. Response Phase 1 tidak menyertakan amount, gross_amount, discount_amount, net_amount, payment_amount, outstanding_amount, refund_amount, deposit_amount, atau field nominal lain.

## 8. Data & Technical Specifications

### 8.1 Minimum Data Requirement Phase 1

| Domain | Field minimum | Kegunaan |
|--------|---------------|----------|
| Calendar | date_key, date_from, date_to, timezone | Rentang tanggal inklusif, termasuk satu hari, dan tanggal acuan. |
| Scope | hospital_id, organization_id, service_unit_id | RBAC dan filter scope. |
| Bill identity | bill_id, bill_type, parent_bill_id, is_merge_parent, is_merge_child | Distinct count dan deduplikasi merge. |
| Bill date | service_at, registration_at, invoice_at, locked_at | date_basis. |
| Bill status | system_status, display_status, status_changed_at | Status chart dan Lunas/Belum Lunas. |
| Payment status | payment_status, paid_at, primary_payment_method | Lunas/Belum Lunas dan metode pembayaran. |
| Payer | payer_category, payer_id, payer_label | Breakdown/filter Tipe Penjamin. |
| Service | service_type, service_unit_id, service_unit_label | Breakdown/filter Tipe Pelayanan. |
| Audit metadata | data_as_of, generated_at, formula_version, filter_signature | Freshness, traceability, dan konsistensi. |

### 8.2 Data yang Tidak Dibutuhkan Phase 1

Phase 1 tidak perlu mengirim gross_amount, discount_amount, net_amount, payment_amount, allocated_amount, outstanding_amount, refund_amount, deposit_balance, tariff_amount, claim_amount, admin_fee, settlement_amount, average_bill, atau field finansial lain ke browser. Field tersebut menjadi dependency Phase 2.

### 8.3 Quantity Contract

Endpoint agregasi wajib mengembalikan struktur berikut tanpa nominal:

    {
      "date_range": {"from": "2026-07-01", "to": "2026-07-31", "date_basis": "SERVICE_DATE", "inclusive": true},
      "scope": {"hospital_id": "RS-UTAMA"},
      "data_as_of": "2026-07-17T14:30:00+07:00",
      "formula_version": "quantity-v1",
      "summary": {"total_bill_count": 1248},
      "paid_unpaid": [
        {"key": "PAID", "label": "Lunas", "bill_count": 872},
        {"key": "UNPAID", "label": "Belum Lunas", "bill_count": 376}
      ],
      "bill_status": [
        {"key": "OPEN", "label": "Open", "bill_count": 146},
        {"key": "LOCKED", "label": "Locked", "bill_count": 186},
        {"key": "PARTIALLY_PAID", "label": "Partially Paid", "bill_count": 94},
        {"key": "PAID", "label": "Paid", "bill_count": 786},
        {"key": "CANCELED", "label": "Canceled", "bill_count": 29},
        {"key": "REFUNDED", "label": "Refunded", "bill_count": 7}
      ],
      "payer_type": [{"key": "BPJS", "label": "BPJS", "bill_count": 515}],
      "service_type": [{"key": "RJ", "label": "RJ", "bill_count": 554}],
      "payment_method": [{"key": "TRANSFER", "label": "Transfer", "bill_count": 268}]
    }

Response di atas adalah contoh kontrak UI, bukan angka produksi. Tidak boleh ada field amount di response Phase 1.

### 8.4 API Minimum

* GET /api/v1/billing/dashboard/quantity — response gabungan seluruh widget.
* GET /api/v1/billing/dashboard/quantity/metadata — opsi filter, mapping status, primary method rule, data_as_of, formula_version.
* GET /api/v1/billing/dashboard/quantity/drilldown — kandidat Phase 2; pada Phase 1 hanya boleh mengembalikan referensi filter tanpa detail finansial.

## 9. Non-Functional Requirements

* **NFR-C01 Performance:** P95 ≤ 3 detik untuk rentang 31 hari dan scope normal.
* **NFR-C02 Freshness:** response memiliki data_as_of, generated_at, is_stale, dan formula_version.
* **NFR-C03 Integrity:** COUNT DISTINCT bill_id, deduplikasi merge parent-child, dan rekonsiliasi jumlah antar widget.
* **NFR-C04 Security:** RBAC/server-side scope; data pasien tidak diperlukan untuk agregasi Phase 1.
* **NFR-C05 Accessibility:** chart memiliki ringkasan tabel/teks, bukan warna saja; mendukung keyboard dan screen reader.
* **NFR-C06 Responsive:** dapat digunakan pada resolusi desktop Kasir dan tablet.
* **NFR-C07 Read-only:** tidak ada aksi mutasi dari UI maupun endpoint Phase 1.

## 10. Business Rules

* **BR-C01:** seluruh KPI dan chart Phase 1 memakai COUNT DISTINCT bill_id.
* **BR-C02:** date-range default adalah bulan berjalan; date_basis default SERVICE_DATE; date_from boleh sama dengan date_to untuk agregasi harian.
* **BR-C03:** filter aktif berlaku pada semua widget.
* **BR-C04:** OTC, merged child, dan bill yang dikecualikan G2 tidak dihitung.
* **BR-C05:** mapping PAID/UNPAID berasal dari status/payment mapping kanonik G2.
* **BR-C06:** status chart tidak boleh menjumlahkan satu bill dua kali dalam satu dimensi.
* **BR-C07:** payer snapshot dan service context mengikuti source of truth G2.
* **BR-C08:** payment method memakai primary_payment_method kanonik; bill tanpa payment masuk bucket Belum Ada Metode bila aturan G2 mengaktifkannya.
* **BR-C09:** Phase 1 tidak menghitung atau menampilkan nominal, termasuk pada tooltip, export, API, dan drill-down.
* **BR-C10:** semua angka menampilkan periode, scope, data_as_of, dan formula_version.

## 11. Phase 2 Backlog

Seluruh item berikut secara eksplisit ditunda ke Phase 2:

1. Total nominal tagihan, Total Pembayaran, Outstanding, Locked amount, Canceled amount, Refund, Piutang Penjamin, Deposit, Collection Rate, Average Bill, dan jumlah pasien dengan metrik nilai.
2. Tren nilai invoice/payment/outstanding/canceled/refund.
3. Komposisi pendapatan kelompok layanan/casemix.
4. Aging piutang dan due-date analysis.
5. Payment amount, admin fee, settlement pending/failed, gateway/bank reconciliation.
6. Tren pasien/episode, ranking tagihan tertinggi, dokter/kasir, tabel detail finansial, claim amount, audit detail, export, saved filter, dan target.

## 12. UI Preview & Contoh Data

Preview Phase 1 tersedia di preview.html dan sengaja dibuat berbeda dari preview analitik sebelumnya:

* Header memakai badge **PHASE 1 — QUANTITY ONLY**.
* Hanya ada kartu Total Kuantitas Tagihan, Lunas, dan Belum Lunas.
* Visual utama adalah Status Tagihan, Tipe Penjamin, Tipe Pelayanan, dan Metode Pembayaran berbasis jumlah.
* Tidak ada simbol Rupiah atau field nominal.
* Contoh data embedded menggunakan date-range 1–31 Juli 2026; user dapat mengubahnya menjadi rentang harian.
* Interaksi filter dan klik segmen hanya mengubah jumlah serta label filter aktif.

## 13. Open Questions & Assumptions

* [PERLU KONFIRMASI] Definisi primary_payment_method jika satu bill menggunakan beberapa metode pembayaran.
* [PERLU KONFIRMASI] Apakah bill tanpa payment masuk kategori UNPAID dan/atau bucket Belum Ada Metode.
* [PERLU KONFIRMASI] Mapping final status sistem G2 ke Open, Locked, Partially Paid, Paid, Canceled, dan Refunded.
* Timezone default organisasi adalah Asia/Jakarta.
* Scope default hanya bill_type PATIENT dan mengikuti A53.

## 14. Document Version

| Tanggal | Versi | Perubahan |
|---------|--------|-----------|
| 17 Juli 2026 | 1.3 | Periode Phase 1 diubah menjadi date-range; date_from/date_to dapat diatur user hingga satu hari, termasuk pada filter dan kontrak API. |
| 17 Juli 2026 | 1.2 | Phase 1 ditetapkan quantity-only; enam kebutuhan kuantitas menjadi MVP, seluruh analitik finansial dipindahkan ke Phase 2, dan UI Preview dibuat ulang. |
| 17 Juli 2026 | 1.1 | Penyesuaian awal berdasarkan Sheet Plan 1 dan penambahan data contract analytical layer. |
| 17 Juli 2026 | 1.0 | Pembuatan PRD Dashboard Billing (G2c) sebagai anak PRD G2. |
