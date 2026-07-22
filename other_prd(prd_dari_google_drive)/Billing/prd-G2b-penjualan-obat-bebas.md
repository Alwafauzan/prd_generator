# PRD — Penjualan Obat Bebas / OTC (G2b) — Tab Penjualan Obat Bebas pada Workspace Kasir (anak dari G2 Tagihan Pasien)

**Related Document:** Induk: G2 Billing — Tagihan Pasien (workspace Kasir; pola penagihan & endpoint pembayaran/Lock/void/print bersama). Turunan tab: G2a Deposito Pasien & G2b Penjualan Obat Bebas (dokumen ini). Sumber tagihan: Modul Farmasi — Penjualan Obat Bebas (F19). Master/hilir: A38 Kas dan Bank, A59 Pengaturan Harga, G22 Harga Jual Obat, G1 Buka/Tutup Kasir, G4 Verifikasi Penerimaan Kas. Akuntansi: Mapping COA (Phase 3).
**Versi:** 1.1 — Konfirmasi PO: (a) Batal Lunas membalik persis jurnal pembayaran (reversal Pendapatan OTC/Kas-Bank); (b) diskon OTC diizinkan penuh (Persentase/Nominal, per item & keseluruhan — FR-012/BR-016 induk); (c) identitas pembeli diambil dari input order Farmasi (read-only). + v1.0 (pemekaran tab OTC dari G2).
**Tanggal:** 17 Juli 2026

## 1. Metadata Dokumen

**Ringkasan Dokumen**

**Penjualan Obat Bebas / OTC (G2b)** adalah **PRD anak** yang dimekarkan dari **PRD G2 — Billing: Tagihan Pasien**. Secara **UI**, Penjualan Obat Bebas adalah **salah satu tab** pada satu halaman workspace Kasir (bersama tab **Tagihan Pasien** dan tab **Deposito Pasien**); namun secara **dokumentasi**, domain OTC dipisahkan menjadi PRD tersendiri. G2b mencakup **penagihan & pembayaran tagihan penjualan obat bebas** (`bill_type = OTC`) yang **terbentuk dari modul Farmasi**, dengan alur **serupa tab Tagihan Pasien** namun **tanpa** charge klinis/encounter pasien, **tanpa** penjamin/klaim, dan **tanpa** deposito.

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
* **PRD G2 — Billing: Tagihan Pasien (INDUK)** — workspace Kasir & **pola penagihan bersama**. Tab OTC memakai **pola & endpoint yang sama** (pembayaran A38, Lock/Unlock, Batal Lunas LIFO, cetak, jurnal). Traceability: **FR-024/BR-031** (OTC), **FR-019/BR-023** (tab), **FR-013/BR-017** (cetak), **FR-014/BR-018** (Batal Lunas), **FR-015/BR-019** (Lock), **FR-021/BR-025** (Unlock), **BR-020** (jurnal).
* **PRD G2a — Deposito Pasien** — PRD **anak sejawat** (tab Deposito). OTC **tidak** memakai deposito; disebut untuk kelengkapan pemisahan tab.
* **Modul Farmasi — Penjualan Obat Bebas (F19)** — **SUMBER tagihan OTC**: penjualan obat bebas membentuk **tagihan `bill_type=OTC`** beserta header (No. Nota, Tgl/Jam, Petugas Farmasi, Pembeli, Jenis Kelamin, Usia, Unit/Apotek, No. Antrian) & item (obat, qty, harga snapshot). Header & item **read-only** di G2b.
* **Master Data — Kas dan Bank (A38)** — sumber **metode pembayaran & bank tujuan** (Tunai→Kas; Non-Tunai→Bank; QRIS→Kode QR). OTC **tanpa** metode `DEPOSITO`.
* **Master Tarif & Harga — A59 Pengaturan Harga / G22 Harga Jual Obat** — sumber **harga snapshot** item OTC (dikunci Farmasi saat penjualan).
* **Billing/Kasir — G1 Buka & Tutup Kasir / G4 Verifikasi Penerimaan Kas** — sesi kasir & verifikasi penerimaan OTC.

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 17 Juli 2026 | 1.1 | **Konfirmasi PO atas pertanyaan terbuka.** (1) **Jurnal Batal Lunas = balik persis transaksi pembayaran** (reversal: Pendapatan Penjualan OTC Debit / Kas/Bank Kredit, akun & nominal identik dengan pembayaran asal) — FR-O05 AC-5/FR-O06 AC-4/BR-O05; sisa [PERLU KONFIRMASI] hanya kode akun COA. (2) **Diskon OTC diizinkan penuh** — Persentase/Nominal, per item & keseluruhan, mengikuti FR-012/BR-016 induk — FR-O02 AC-4/**BR-O09** + field diskon pada §8.1. (3) **Identitas pembeli diambil dari input order Penjualan Obat Bebas di modul Farmasi** (read-only di G2b) — FR-O01/FR-O02 AC-1/**BR-O10**. |
| 17 Juli 2026 | 1.0 | **Pembuatan awal — pemekaran dari G2.** Mengangkat domain **Penjualan Obat Bebas (OTC)** dari PRD G2 menjadi PRD anak mandiri (standalone): worklist tagihan `bill_type=OTC` (kolom + filter Jenis Kelamin/Usia/Apotek), Detail (header & item read-only dari Farmasi + pencarian), **pembayaran multi-metode A38** (Tunai/Non-Tunai, **tanpa Deposito**), **Lock → Unlock** (approval), **Lunas → Batal Lunas** (LIFO), **Jurnal** penerimaan (Kas/Bank D / Pendapatan Penjualan OTC K, Phase 3), **cetak nota/kwitansi** (kwitansi setelah pembayaran), refund = Phase 2. Traceability ke G2: FR-024/BR-031/FR-019/BR-023/FR-013/FR-014/FR-015/FR-021/BR-020. |

> **Konvensi ID**: requirement G2b memakai awalan **FR-O**/**NFR-O**/**BR-O**/**US-O** (O = OTC) untuk membedakan dari ID induk G2. Rujukan silang ke G2 memakai ID asli G2 (mis. BR-031).

## 2. Overview & Background

**Overview / Brief Summary**

**Penjualan Obat Bebas / OTC (G2b)** menangani **penagihan & pembayaran** transaksi **obat bebas** (over-the-counter) yang dijual oleh **modul Farmasi** kepada **pembeli umum** (tanpa harus pasien terdaftar/encounter). Setiap penjualan obat bebas membentuk **tagihan `bill_type = OTC`** yang otomatis masuk ke **tab Penjualan Obat Bebas** di workspace Kasir. Meskipun tampil sebagai **satu tab** bersama Tagihan Pasien, domain ini didokumentasikan terpisah karena **konteksnya berbeda**: tanpa encounter klinis, tanpa penjamin/klaim, tanpa deposito, dan tanpa status-layanan klinis.

Prinsip arsitektur yang WAJIB dipegang:
* **G2b hanya menerima** tagihan OTC dari Farmasi (header & item **read-only**); tidak membuat/mengubah item obat (dispensing & stok = Farmasi).
* **Pola penagihan sama seperti Tagihan Pasien** (induk G2): **Lock sebagai gerbang pembayaran**, pembayaran multi-metode A38, Lunas/Batal Lunas (LIFO), cetak, jurnal — memakai **endpoint & entitas bersama** (`bill`/`bill_payment`/`journal`).
* **OTC dibayar penuh oleh pembeli** — tanpa penjamin/klaim, tanpa deposito.

**Business Process (As-Is vs To-Be)**

* **As-Is (masalah yang terjadi)**:
    * Penjualan obat bebas dicatat terpisah dari sistem billing → **penerimaan kas apotek tidak terekonsiliasi** dengan sesi kasir.
    * Metode/tujuan setoran tidak terstandar → rekonsiliasi kas/bank sulit.
    * Bukti transaksi (nota/kwitansi) manual → tidak seragam & sulit diarsipkan.
    * Pembatalan/koreksi pembayaran tidak terkontrol.

* **To-Be (solusi digital yang diusulkan)**:
    * **Tagihan OTC otomatis** — penjualan obat bebas dari Farmasi membentuk tagihan `bill_type=OTC` yang masuk worklist tab Penjualan Obat Bebas.
    * **Penagihan terstandar** — Lock → pembayaran multi-metode (A38) → Lunas; penerimaan tertaut **sesi kasir (G1)**.
    * **Batal Lunas (LIFO)** — pembatalan pembayaran terakhir yang terkontrol (wajib alasan + audit).
    * **Jurnal penerimaan (Phase 3)** — Kas/Bank (D) / **Pendapatan Penjualan OTC** (K); Batal Lunas → jurnal balik.
    * **Cetak nota/kwitansi** — nota penjualan & kwitansi (kwitansi hanya setelah ada pembayaran).

**Batas tanggung jawab (G2b ⟷ G2 ⟷ Farmasi ⟷ G1/G4)**
* **G2b (dokumen ini)** — **penagihan & pembayaran tagihan OTC** dalam workspace Kasir (worklist, Detail, pembayaran, Lock/Unlock, Lunas/Batal Lunas, jurnal, cetak).
* **G2 (induk)** — **UI workspace & pola/endpoint bersama** (`bill`, `bill_payment`, Lock, void, print, journal). OTC memakai pola ini dengan konteks berbeda.
* **Farmasi (F19)** — **sumber tagihan OTC** (pembentukan nota/tagihan, dispensing, stok, harga snapshot). Item OTC read-only di G2b.
* **G1/G4** — **sesi kasir & verifikasi kas**: penerimaan OTC masuk rekap sesi & verifikasi.

## 3. Goals & Metrics

**Goals:** memastikan **seluruh penjualan obat bebas tertagih & terbayar** melalui workspace Kasir dengan **metode & tujuan transaksi terstandar (A38)** dan **tertaut sesi kasir (G1)**; menjamin **jurnal penerimaan** OTC seimbang; menyediakan **cetak nota/kwitansi** yang seragam; serta **pembatalan pembayaran (Batal Lunas) terkontrol**.

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan penagihan OTC | **100%** tagihan OTC dari Farmasi muncul di worklist tab Penjualan Obat Bebas (0 nota terlewat). |
| 2 | Ketertelusuran penerimaan | **100%** pembayaran OTC tertaut **metode + tujuan (A38)** dan **sesi kasir (G1)**. |
| 3 | Gerbang pembayaran | **0%** pembayaran OTC diterima sebelum tagihan **di-Lock** (BR-O03/BR-019 induk). |
| 4 | Ketepatan jurnal | **100%** pembayaran OTC menghasilkan **jurnal seimbang** (Kas/Bank D / Pendapatan OTC K); Batal Lunas → jurnal balik (Phase 3). |
| 5 | Kontrol Batal Lunas | **100%** Batal Lunas hanya untuk **pembayaran terakhir** (LIFO), wajib alasan + audit. |
| 6 | Ketersediaan bukti | **100%** transaksi OTC dapat mencetak **nota**; **kwitansi** hanya bila sudah ada pembayaran. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP) | Phase 2 (Approval/Escalation) | Phase 3 (Accounting: Mapping COA) |
|-------------|---------------|-------------------------------|-----------------------------------|
| **Worklist OTC** | Daftar tagihan `bill_type=OTC` dari Farmasi + kolom (No. Nota, Tgl/Jam, Petugas, Pembeli, **Jenis Kelamin**, **Usia**, Apotek, Total/Sisa, Status) + filter (Apotek, status, rentang tanggal, Jenis Kelamin) + search | Ekspor/laporan | Badge status posting jurnal |
| **Detail Tagihan OTC** | Header (read-only Farmasi) + item obat (read-only) + pencarian item | — | — |
| **Pembayaran multi-metode (A38)** | Tunai (Kas) & Non-Tunai (QRIS/Debet/Transfer/VA/Kredit → Bank); **tanpa Deposito**; parsial/cicilan (deteksi otomatis) | — | Jurnal **Kas/Bank (D) / Pendapatan Penjualan OTC (K)** |
| **Lock → Unlock** | **Lock** = gerbang pembayaran (freeze nilai); **Unlock** ber-approval (Supervisor), hanya pasca Batal Lunas | Approval berjenjang Unlock | Reversal jurnal saat Unlock |
| **Lunas → Batal Lunas (LIFO)** | Lunas saat `outstanding=0`; **Batal Lunas** pembayaran terakhir (LIFO), wajib alasan + audit, tidak meng-unlock | — | Jurnal balik sisi kas |
| **Cetak Nota / Kwitansi** | **Nota penjualan** & **Kwitansi** (unduh PDF/print); **Kwitansi hanya setelah ada pembayaran** | Template kop/branding | Tautan dokumen ke arsip akuntansi |
| **Refund OTC** | — | **Refund ber-approval** (terkait retur stok Farmasi) | Reversal/penyesuaian jurnal |
| **Jurnal Penerimaan OTC** | — (disiapkan: `journal_id`, COA) | — | **Kas/Bank (D) / Pendapatan Penjualan OTC (K)**; Batal Lunas → jurnal balik |

**Out of Scope (dikerjakan modul lain — G2b hanya menerima/menautkan)**

| No | Scope | Penanggung jawab |
|----|-------|------------------|
| 1 | **Pembentukan nota/tagihan OTC, dispensing & pengurangan stok** obat bebas | **Modul Farmasi — Penjualan Obat Bebas (F19)** |
| 2 | **Penetapan harga jual obat** (snapshot) | **A59 Pengaturan Harga / G22 Harga Jual Obat** |
| 3 | **Master metode pembayaran & rekening bank** | **A38 — Kas dan Bank** |
| 4 | **UI workspace & pola/endpoint billing bersama** (`bill`/`bill_payment`/Lock/void/print/journal) | **PRD G2 — Tagihan Pasien (induk)** |
| 5 | **Tutup kasir & verifikasi penerimaan kas** | **G1 / G4** |
| 6 | **Master COA & posting jurnal final** | **Akuntansi/Keuangan (Phase 3)** |
| 7 | **Retur stok obat** (kaitan refund OTC) | **Farmasi/Inventory (Phase 2)** |

> **Catatan Phasing**: worklist, Detail, pembayaran multi-metode, Lock/Unlock, Lunas/Batal Lunas (LIFO), cetak = **Phase 1**. **Jurnal** = **Phase 3** (Mapping COA), field `akun_debit`/`akun_kredit` disiapkan sejak Phase 1. **Refund OTC** (retur obat) = **Phase 2** (approval). OTC **tanpa** penjamin/klaim, deposito, encounter, status-layanan klinis.

## 5. Related Features (Rekomendasi Relasi)

Penjualan Obat Bebas (G2b) berelasi dengan induk G2, modul Farmasi (sumber), dan kas/akuntansi. Arah relasi: **⇐ sumber**; **⇒ hilir**; **↔ referensi**.

**A. Induk & Pola Bersama**

| Code | Modul / Fitur | Relasi ke Penjualan Obat Bebas |
|------|---------------|-------------------------------|
| **G2** | Billing — Tagihan Pasien (INDUK, ↔) | **UI workspace + pola & endpoint bersama**: `bill`/`bill_payment`/Lock/Unlock/void/print/journal. OTC memakai pola ini dengan konteks berbeda (tanpa encounter/penjamin/deposito). |
| **G2a** | Deposito Pasien (sejawat) | Tab sejawat; OTC **tidak** memakai deposito. Disebut untuk kelengkapan pemisahan tab. |

**B. Sumber & Master (⇐/↔)**

| Code | Modul / Fitur | Relasi ke Penjualan Obat Bebas |
|------|---------------|-------------------------------|
| **F19 / Farmasi** | Penjualan Obat Bebas (⇐ SUMBER) | Membentuk **tagihan `bill_type=OTC`** + header (No. Nota, Tgl/Jam, Petugas Farmasi, Pembeli, Jenis Kelamin, Usia, Unit/Apotek, No. Antrian) & item (obat, qty, harga snapshot). Read-only di G2b. |
| **A38** | Master Data — Kas dan Bank (↔) | Sumber **metode pembayaran & bank tujuan**; QRIS → Kode QR. **Tanpa** metode Deposito. |
| **A59 / G22** | Pengaturan Harga / Harga Jual Obat (↔) | Sumber **harga snapshot** item OTC (dikunci Farmasi saat penjualan). |

**C. Hilir / Konsumen (⇒)**

| Code | Modul / Fitur | Relasi ke Penjualan Obat Bebas |
|------|---------------|-------------------------------|
| **G1** | Buka & Tutup Kasir | Penerimaan pembayaran OTC tertaut **sesi kasir aktif**; dasar rekap Tutup Kasir. |
| **G4** | Verifikasi Penerimaan Kas | Verifikasi setoran kas/bank hasil penjualan OTC. |
| Keuangan/Akuntansi | Jurnal Otomatis & COA | Posting jurnal penerimaan OTC (Phase 3). |
| **Farmasi/Inventory** | Retur Obat (Phase 2) | Refund OTC ber-approval terkait retur stok. |

> **Batas G2b ⟷ Farmasi**: **Farmasi (F19)** = pembentukan nota/tagihan OTC, dispensing, stok, harga. **G2b** = **penagihan & pembayaran** tagihan OTC di workspace Kasir. Item OTC **read-only** di G2b (G2b tidak menambah/mengubah item).

## 6. Business Process & User Stories

**State Machine — Tagihan OTC (`bill` dengan `bill_type=OTC`)**

Subset status dari induk G2 (tanpa `LUNAS_PENJAMIN` — OTC tanpa penjamin).

| Status | Deskripsi | Efek (Data/Kas) | Transisi (Phase 1) | Transisi (Phase 2/3) |
|--------|-----------|-----------------|--------------------|----------------------|
| **Berjalan/Menunggu Bayar** | Tagihan OTC terbentuk dari Farmasi; siap di-Lock lalu dibayar | Total final dari Farmasi; belum ada pembayaran | → **[Lock]** → Terkunci (baru bisa dibayar) | — |
| **Cicilan / Sebagian** | Sudah ada pembayaran parsial (pasca-Lock) | `outstanding` > 0; `is_locked=true` | → **Lunas** (outstanding=0) · → **Batal Lunas** terakhir (LIFO) | Phase 2: Unlock |
| **Lunas** | Terbayar penuh | `outstanding=0`; kwitansi terbit | → **Batal Lunas** pembayaran terakhir (LIFO; tidak meng-unlock) | Phase 3: jurnal Kas/Bank D / Pendapatan OTC K |
| **Batal (Void)** | Tagihan OTC dibatalkan | Item non-aktif; tidak menagih | — | Phase 2: approval pembatalan / refund retur |

**Atribut Penguncian — `is_locked`** (sama pola induk):
| Kondisi | Efek |
|---------|------|
| **Terbuka** (`is_locked=false`) | Belum bisa menerima pembayaran; menunggu Lock |
| **Terkunci** (`is_locked=true`) | Nilai final; **membuka pembayaran**; memicu jurnal (Phase 3); Batal Lunas boleh (tidak meng-unlock); **Unlock** ber-approval (pasca Batal Lunas) |

**User Stories Utama**
* **US-O01** — Sebagai **Kasir**, saya ingin melihat **daftar tagihan penjualan obat bebas (OTC)** dari Farmasi pada tab Penjualan Obat Bebas, agar dapat menagih transaksi obat bebas terpisah dari tagihan pasien. *(P1)*
* **US-O02** — Sebagai **Kasir**, saya ingin membuka **Detail tagihan OTC** (header & item read-only dari Farmasi), agar dapat memverifikasi transaksi sebelum menagih. *(P1)*
* **US-O03** — Sebagai **Kasir**, saya ingin **menerima pembayaran multi-metode** (Tunai/Non-Tunai A38) untuk tagihan OTC setelah **Lock**, agar penerimaan tercatat & terekonsiliasi. *(P1)*
* **US-O04** — Sebagai **Kasir**, saya ingin **Lock** tagihan OTC sebelum pembayaran dan **Unlock** (ber-approval, pasca Batal Lunas) untuk koreksi, agar nilai final terkendali. *(P1/P2)*
* **US-O05** — Sebagai **Kasir**, saya ingin **Batal Lunas** (LIFO) pembayaran OTC yang salah input, agar dapat dikoreksi tanpa merusak riwayat. *(P1)*
* **US-O06** — Sebagai **Kasir**, saya ingin **mencetak nota/kwitansi** OTC (kwitansi hanya setelah ada pembayaran), agar pembeli mendapat bukti resmi. *(P1)*
* **US-O07** — Sebagai **Manajemen/Keuangan**, saya ingin **Jurnal penerimaan OTC** (Kas/Bank D / Pendapatan Penjualan OTC K) dan **refund OTC ber-approval**, agar pengakuan pendapatan & pengembalian obat bebas terkontrol. *(P2, Phase 2/3)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Worklist Penjualan Obat Bebas (OTC) (FR-O01)**
* **User Story**: US-O01. · **Prioritas**: P1. · **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Daftar tagihan OTC**: menampilkan daftar tagihan `bill_type=OTC` dari Farmasi dengan kolom minimal: **No. Nota/No. Registrasi**, Tgl/Jam, **Petugas Farmasi**, Pembeli (identitas dari input order Farmasi), **Jenis Kelamin** (`buyer_gender`), **Usia** (`buyer_age`), Unit/Apotek, Jumlah Tagihan, Sisa, **Status Tagihan**, dan **Aksi**. **Jenis Kelamin & Usia** bersumber input Farmasi (read-only). *(Rujukan induk: FR-024 AC-1.)*
    * **AC 2 — Filter & search**: filter per **Unit/Apotek, status, rentang tanggal, Jenis Kelamin**; search per **No. Nota / Pembeli / Petugas Farmasi**. Tanpa kolom penjamin/DPJP/status-layanan klinis.
    * **AC 3 — Aksi per baris**: tiap baris menyediakan **Detail**, **Bayar** (bila Lock & sisa > 0), **Cetak** (Nota/Kwitansi — Kwitansi hanya bila ada pembayaran, FR-O07/BR-O06), dan **Jurnal** (bila Phase 3 aktif). Aksi tak berlaku dinonaktifkan sesuai status.

**Fitur: Detail Tagihan OTC (FR-O02)**
* **User Story**: US-O02. · **Prioritas**: P1. · **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Header read-only (Farmasi)**: menampilkan **No. Nota/No registrasi, Tgl/Jam, Petugas Farmasi, Pembeli (identitas pembeli), Jenis Kelamin, Usia, Unit/Apotek, No. Antrian** — **read-only dari input order Penjualan Obat Bebas di modul Farmasi** (G2b tidak menginput identitas pembeli). **Identitas pembeli (Pembeli/Jenis Kelamin/Usia) diambil dari data input order Farmasi** — bila diisi di Farmasi akan tampil; G2b hanya menampilkannya (BR-O01/BR-O10).
    * **AC 2 — Item read-only**: menampilkan **item granular** (kode/nama obat, qty, harga satuan snapshot A59/G22, subtotal) + **total**; item **read-only** (G2b tidak menambah/mengubah item OTC).
    * **AC 3 — Pencarian item**: tersedia pencarian item saat jumlah banyak (filter tampilan; total tetap atas seluruh item).
    * **AC 4 — Diskon (diizinkan penuh)** [DIKONFIRMASI PO]: tagihan OTC **mengizinkan seluruh metode diskon** — **jenis Persentase (%) atau Nominal (Rp)**, diterapkan **per item** dan/atau **keseluruhan tagihan** — konsisten dengan mekanisme diskon Tagihan Pasien (induk FR-012/BR-016): Persentase 0–100%, Nominal ≤ basis, hasil tidak boleh membuat total negatif, tercatat audit (BR-O09). Diskon menyesuaikan Total/Sisa sebelum pembayaran.

**Fitur: Pembayaran Multi-Metode OTC (A38) (FR-O03)**
* **User Story**: US-O03. · **Prioritas**: P1. · **Fase**: Phase 1 / Phase 3 (jurnal).
* **Acceptance Criteria**:
    * **AC 1 — Metode & tujuan**: menerima pembayaran **Tunai** (akun **Kas** A38) & **Non-Tunai** (QRIS/Debet/Transfer/Virtual Account/Kredit → akun **Bank** A38; QRIS tampil Kode QR) — **sama seperti tab Tagihan Pasien** (BR-008 induk). **Deposito tidak berlaku** untuk OTC (tanpa akun pasien).
    * **AC 2 — Prasyarat Lock**: pembayaran (termasuk parsial/cicilan) hanya setelah tagihan **di-Lock** (`is_locked=true`, konsisten BR-019 induk).
    * **AC 3 — Cicilan otomatis**: bila nominal < sisa, sistem menandai **cicilan** otomatis (tanpa flag manual); status **Cicilan** hingga `outstanding=0` → **Lunas** (BR-009 induk).
    * **AC 4 — Sesi kasir**: tiap pembayaran tertaut **sesi kasir aktif (G1)** & masuk rekap Tutup Kasir/G4 (BR-006 induk).
    * **AC 5 — Jurnal (Phase 3)**: memicu **Jurnal penerimaan** — **Kas/Bank (Debit sesuai metode/akun A38) / Pendapatan Penjualan OTC (Kredit)** (BR-O05).

**Fitur: Lock → Unlock Tagihan OTC (FR-O04)**
* **User Story**: US-O04. · **Prioritas**: P1 (Lock) / P2 (Unlock). · **Fase**: Phase 1 / Phase 2 (approval Unlock).
* **Acceptance Criteria**:
    * **AC 1 — Lock (gerbang pembayaran)**: tagihan OTC dapat **di-Lock** (freeze nilai); **pembayaran hanya pasca-Lock** (konsisten BR-019 induk). Lock memicu jurnal penerimaan bila diperlukan (Phase 3).
    * **AC 2 — Unlock (approval)**: **Unlock** membuka kembali untuk koreksi, **memerlukan approval** (Supervisor/Phase 2) & **hanya setelah Batal Lunas** menihilkan pembayaran (konsisten FR-021/BR-025 induk); memicu reversal jurnal (Phase 3).
    * **AC 3 — Audit**: `locked_at`/`locked_by`/`unlocked_at`/`unlocked_by`/`unlock_reason` + jejak approval tercatat.

**Fitur: Lunas → Batal Lunas OTC (LIFO) (FR-O05)**
* **User Story**: US-O05. · **Prioritas**: P1. · **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Lunas**: tagihan menjadi **Lunas** saat `outstanding=0`.
    * **AC 2 — Batal Lunas (LIFO)**: **Batal Lunas** membatalkan **pembayaran terakhir** yang masih `success` (urutan **LIFO**); pembayaran di-set `void` (baris tidak dihapus), `total_paid`/`outstanding` dihitung ulang, status diturunkan; **tidak meng-unlock** (`is_locked` tetap). *(Konsisten FR-014/BR-018 induk.)*
    * **AC 3 — Alasan & audit**: wajib **alasan** + audit trail (transaksi, nominal, alasan, user, sesi, waktu, before/after); **tanpa approval** (Phase 1).
    * **AC 4 — Koreksi sesi kasir**: pembatalan mengoreksi **rekap penerimaan sesi kasir (G1)** → tercermin di Tutup Kasir/G4.
    * **AC 5 — Jurnal balik (Phase 3)** [DIKONFIRMASI PO]: Batal Lunas **membalik persis jurnal transaksi pembayaran** yang dibatalkan (reversal) — yakni **kebalikan** dari entri pembayaran: **Pendapatan Penjualan OTC (Debit) / Kas/Bank (Kredit)** senilai nominal yang di-void (akun & nilai sama dengan pembayaran asal, sisi debit-kredit dibalik). Σ Debit = Σ Kredit (BR-O05).

**Fitur: Jurnal Penerimaan OTC (FR-O06) — Phase 3**
* **User Story**: US-O07. · **Prioritas**: P2. · **Fase**: Phase 3.
* **Acceptance Criteria**:
    * **AC 1 — Pembentukan**: setiap pembayaran OTC memposting **Kas/Bank (Debit) / Pendapatan Penjualan OTC (Kredit)** sesuai metode/akun A38.
    * **AC 2 — Batal Lunas → balik**: Batal Lunas memposting jurnal balik; Σ Debit = Σ Kredit tiap entri.
    * **AC 3 — Tampil per tagihan**: jurnal OTC **ditampilkan per tagihan** (akun/debit/kredit/keterangan) di dashboard; read-only di Billing (koreksi via Akuntansi). *(Konsisten FR-016/BR-020 induk.)*
    * **AC 4 — Akun & reversal** [DIKONFIRMASI PO]: pembayaran memakai akun **Pendapatan Penjualan OTC** (Kredit) lawan Kas/Bank (Debit); **Batal Lunas membalik persis entri pembayaran tsb** (reversal — Pendapatan OTC Debit / Kas/Bank Kredit, akun & nilai identik dengan pembayaran asal). [PERLU KONFIRMASI hanya **kode akun** COA "Pendapatan Penjualan OTC" pada bagan akun RS.]

**Fitur: Cetak Nota / Kwitansi OTC (FR-O07)**
* **User Story**: US-O06. · **Prioritas**: P1. · **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Titik akses**: cetak diakses dari **Detail** maupun **baris worklist** (konsisten FR-013 induk).
    * **AC 2 — Dokumen**: **Nota penjualan OTC** (item, qty, harga, subtotal, total) & **Kwitansi** (bukti bayar: metode, nominal, sisa, kasir, tgl/jam). Memuat kop/identitas RS/Apotek.
    * **AC 3 — Kwitansi bergantung pembayaran**: **Kwitansi hanya dapat dicetak bila tagihan sudah memiliki pembayaran/penyelesaian** (Lunas/Cicilan); tagihan tanpa pembayaran → Kwitansi dinonaktifkan (Nota tetap bisa). *(Konsisten BR-017 induk.)*
    * **AC 4 — Output**: dokumen dapat **diunduh (.pdf)** atau **dicetak** langsung.

### 7.2 Non-Functional Requirements (ringkas)
* **NFR-O01 (Integritas)**: total Detail = total pembayaran + outstanding; tidak boleh imbalance.
* **NFR-O02 (Audit trail)**: pembayaran, Batal Lunas, Lock/Unlock OTC tercatat append-only & immutable (user/waktu/sesi/alasan/before-after). Konsisten BR-015 induk.
* **NFR-O03 (Atomic Transaction/ACID)**: pembayaran & Batal Lunas OTC atomik; gagal → rollback; idempotency key anti-duplikat. Konsisten NFR-005/BR-036 induk.
* **NFR-O04 (RBAC)**: hanya role **Kasir** yang menagih OTC; **Supervisor** untuk approval (Unlock/refund, Phase 2) — mengacu A53.
* **NFR-O05 (Isolasi konteks)**: tab OTC berbagi **sesi kasir (G1)** namun **konteks & aksi terisolasi** dari tab lain (BR-023 induk).

## 8. Data & Technical Specifications

> Tagihan OTC memakai **entitas billing bersama** (`bill`/`bill_payment`/`journal`) dari induk G2 dengan `bill_type=OTC`. Header & item **read-only dari Farmasi**. Nama tabel/kolom English; struktur final menyesuaikan tim dev.

### 8.1 Database Schema Suggestion

* **Table `bill` (dengan `bill_type=OTC`)** — memakai entitas `bill` induk G2
    * `id`: UUID (PK) · `bill_number`: VARCHAR unik · `bill_type`: ENUM `PATIENT`/`OTC` = **`OTC`**
    * `otc_note_no`: VARCHAR — **No. Nota** dari Farmasi
    * `patient_id`, `registration_id`, `encounter_id`: **null** (OTC tanpa encounter pasien)
    * `penjamin_type_id`, `class_id`: **null** (tanpa penjamin/kelas)
    * `bill_status`: ENUM subset OTC — `BERJALAN`/`MENUNGGU_BAYAR`/`CICILAN`/`LUNAS`/`BATAL` (**tanpa** `LUNAS_PENJAMIN`)
    * `total_amount`, `total_paid`, `outstanding_balance`: DECIMAL
    * `is_locked`: BOOLEAN — Lock (gerbang pembayaran); `locked_at`/`locked_by`, `unlocked_at`/`unlocked_by`/`unlock_reason`
    * `journal_id`: VARCHAR/FK — **[Phase 3]** jurnal penerimaan OTC
    * `pharmacist_name`, `buyer_name`, `buyer_gender` (ENUM L/P), `buyer_age`, `pharmacy_unit`, `queue_no`, `sale_datetime`: **read-only dari input order Farmasi** (identitas pembeli bersumber Farmasi — BR-O10)
    * `bill_discount_type` (ENUM `PERSENTASE`/`NOMINAL`/`NONE`), `bill_discount_value`, `total_discount`: **diskon keseluruhan** tagihan OTC (BR-O09); diskon **per item** disimpan pada `bill_item` (`discount_type`/`discount_value`/`discount_amount`/`subtotal_net`) — mengikuti FR-012/BR-016 induk
    * `created_at/by`, `updated_at/by`: audit

* **Table `bill_item` (OTC)** — item obat read-only dari Farmasi
    * `id`: UUID (PK) · `bill_id`: FK · `source_module`: `FARMASI_OTC`
    * `item_code`, `item_name`: kode/nama obat · `qty`: DECIMAL · `unit_price`: DECIMAL (snapshot A59/G22) · `subtotal`: DECIMAL
    * read-only (G2b tidak menambah/mengubah item OTC — BR-O01)

* **Table `bill_payment` (OTC)** — memakai entitas pembayaran induk G2
    * `payment_method`: ENUM `TUNAI`/`QRIS`/`DEBET`/`TRANSFER`/`VIRTUAL_ACCOUNT`/`KREDIT` — **tanpa** `DEPOSITO`
    * `cash_bank_account_id`: FK → **A38** (Tunai→Kas; Non-tunai→Bank) · `amount`, `change_amount`
    * `is_installment`: BOOLEAN (diturunkan otomatis) · `external_ref`: No. approval EDC/ID QRIS/VA
    * `cashier_session_id`: FK → G1 · `received_by`: FK User · `akun_debit`/`akun_kredit`: **[Phase 3]** (Kas/Bank D / Pendapatan OTC K)
    * `status`: ENUM `success`/`void` — Batal Lunas → `void` (LIFO); `void_reason`/`voided_at`/`voided_by`

* **Table `journal`/`journal_line` (OTC)** — **[Phase 3]** memakai entitas jurnal induk
    * Pembayaran OTC: **Kas/Bank (D) / Pendapatan Penjualan OTC (K)**; Batal Lunas: jurnal balik. Σ Debit = Σ Kredit.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bills?bill_type=OTC` | **Worklist OTC** — daftar tagihan `bill_type=OTC` + filter (Unit/Apotek, status, rentang tanggal, Jenis Kelamin) + search (No. Nota/Pembeli/Petugas). *(FR-O01.)* |
| POST | `/api/v1/bills/otc` *(internal)* | **Pembentukan tagihan OTC** dari Farmasi (Penjualan Obat Bebas) — body: header (No. Nota, Tgl/Jam, Petugas, Pembeli, Jenis Kelamin, Usia, Unit/Apotek, No. Antrian) + item (obat, qty, harga snapshot). Membentuk `bill` `bill_type=OTC`; item read-only di G2b (BR-O01). |
| GET | `/api/v1/bills/{id}` | Detail tagihan OTC (header + item read-only). |
| GET | `/api/v1/bills/{id}/items?q={keyword}` | Item OTC + pencarian (filter tampilan). |
| POST | `/api/v1/bills/{id}/payments` | Pembayaran OTC (Tunai/Non-Tunai A38; **tanpa** `DEPOSITO`) — **ditolak bila `is_locked=false`** (BR-019 induk). *(Endpoint bersama G2.)* |
| POST | `/api/v1/bills/{id}/lock` | **Lock** tagihan OTC (gerbang pembayaran). *(Endpoint bersama G2.)* |
| POST | `/api/v1/bills/{id}/unlock` | **Unlock** (approval, pasca Batal Lunas) — reversal jurnal (Phase 3). *(Endpoint bersama G2.)* |
| POST | `/api/v1/bills/{id}/payments/{paymentId}/void` | **Batal Lunas** (LIFO) pembayaran terakhir; wajib alasan; tidak meng-unlock. *(Endpoint bersama G2.)* |
| GET | `/api/v1/bills/{id}/journal` | **[Phase 3]** Jurnal penerimaan OTC (Kas/Bank D / Pendapatan OTC K). |
| GET | `/api/v1/bills/{id}/print?doc={nota\|kwitansi}&format=pdf` | **Cetak Nota / Kwitansi** OTC; **Kwitansi hanya bila ada pembayaran** (BR-O06). |
| GET | `/api/v1/cash-bank-accounts?active=true&method={m}` | Lookup **akun/bank tujuan** (A38) sesuai metode. |

**Business Rules (G2b)**
* **BR-O01 (Sumber OTC read-only dari Farmasi)**: tagihan `bill_type=OTC` dibentuk **modul Farmasi**; header & item **read-only** di G2b (tidak menambah/mengubah item). Provenance (No. Nota/sumber) dipertahankan. *(Konsisten BR-001/BR-031 induk.)*
* **BR-O02 (Pembayaran multi-metode A38, tanpa Deposito)**: metode & bank tujuan dari **A38** (Tunai→Kas; Non-Tunai→Bank; QRIS→Kode QR). **Deposito tidak berlaku** untuk OTC. Non-tunai dicatat manual & diverifikasi G4 (konsisten BR-008 induk).
* **BR-O03 (Lock = gerbang pembayaran)**: pembayaran OTC hanya setelah **Lock** (`is_locked=true`); Unlock ber-approval & hanya pasca Batal Lunas (konsisten BR-019/BR-025 induk).
* **BR-O04 (Batal Lunas LIFO)**: hanya **pembayaran terakhir** (LIFO) yang dapat di-void; wajib alasan + audit; tidak meng-unlock (`is_locked` tetap); koreksi rekap sesi kasir (konsisten BR-018 induk).
* **BR-O05 (Jurnal penerimaan OTC & reversal — Phase 3)** [DIKONFIRMASI PO]: pembayaran → **Kas/Bank (Debit, akun A38 sesuai metode) / Pendapatan Penjualan OTC (Kredit)**. **Batal Lunas = membalik persis jurnal pembayaran** (reversal): **Pendapatan Penjualan OTC (Debit) / Kas/Bank (Kredit)** dengan **akun & nominal identik** dengan pembayaran asal (hanya sisi debit-kredit dibalik) — tidak memakai akun/kebijakan lain. Σ Debit = Σ Kredit; ditampilkan per tagihan; read-only di Billing (konsisten BR-020 induk). [PERLU KONFIRMASI hanya kode akun COA "Pendapatan Penjualan OTC".]
* **BR-O06 (Cetak — Kwitansi setelah pembayaran)**: **Nota** dapat dicetak kapan saja; **Kwitansi hanya bila tagihan sudah memiliki pembayaran/penyelesaian** (konsisten BR-017 induk). Cetak read-only (tidak mengubah data).
* **BR-O07 (OTC tanpa penjamin/klaim/deposito/encounter)**: tagihan OTC dibayar penuh oleh pembeli; **tanpa** penjamin/klaim, deposito, encounter pasien, atau status-layanan klinis. Field pasien/penjamin/kelas = null (BR-031 induk).
* **BR-O08 (Isolasi & sesi bersama)**: tab OTC berbagi **sesi kasir (G1)** namun **konteks & aksi terisolasi** dari tab lain (BR-023 induk).
* **BR-O09 (Diskon OTC — diizinkan penuh)** [DIKONFIRMASI PO]: tagihan OTC mengizinkan **seluruh metode diskon** — **Persentase (%) atau Nominal (Rp)**, **per item** dan/atau **keseluruhan tagihan** — mengikuti mekanisme diskon Tagihan Pasien (induk **FR-012/BR-016**): Persentase 0–100%, Nominal ≤ basis, hasil tidak boleh negatif, Phase 1 tanpa approval, tercatat **audit**. Diskon memengaruhi Total/Sisa sebelum pembayaran & tercermin pada nota/kwitansi.
* **BR-O10 (Identitas pembeli dari Farmasi)** [DIKONFIRMASI PO]: **identitas pembeli** (Pembeli/Jenis Kelamin/Usia) **diambil dari data input order Penjualan Obat Bebas di modul Farmasi** (read-only di G2b). G2b **tidak** menginput/mengubah identitas pembeli; bila tersedia di Farmasi akan ditampilkan pada worklist & Detail (BR-O01).

**Case & Mitigasi**

| No | Case | Dampak | Mitigasi |
|----|------|--------|----------|
| 1 | Pembayaran OTC diterima sebelum Lock | Bayar atas nilai belum final | Tolak pembayaran hingga `is_locked=true` (BR-O03). |
| 2 | Non-tunai OTC → akun Kas | Rekonsiliasi bank salah | Validasi metode↔kategori akun A38 (BR-O02). |
| 3 | Batal Lunas angsuran tengah (bukan terakhir) | Riwayat berlubang | Batasi ke pembayaran terakhir (LIFO); nonaktifkan void non-terakhir (BR-O04). |
| 4 | Kwitansi dicetak tanpa pembayaran | Bukti bayar palsu | Kwitansi hanya bila ada pembayaran; Nota tetap bisa (BR-O06). |
| 5 | Item OTC diubah di Billing | Beda dengan Farmasi/stok | Item read-only dari Farmasi (BR-O01). |
| 6 | Deposito dipakai untuk OTC | Salah konteks akun | OTC tanpa metode Deposito (BR-O02/BR-O07). |
| 7 | Penerimaan OTC tak masuk sesi kasir | Rekonsiliasi kas salah | Wajib sesi G1 OPEN; masuk Tutup Kasir & G4 (BR-006 induk). |

## 9. Workflow / BPMN Interpretation

> Tidak ada BPMN khusus G2b; alur diturunkan dari pola penagihan Tagihan Pasien G2 & praktik penjualan obat bebas apotek. Bagian turunan ditandai [ASUMSI].

**Alur A — Pembentukan & Penagihan OTC**
1. **Farmasi** menyelesaikan **penjualan obat bebas** → membentuk **tagihan `bill_type=OTC`** (header + item + harga snapshot) → masuk **worklist tab Penjualan Obat Bebas** (G2b).
2. Kasir membuka **Detail OTC** (header & item read-only) → verifikasi.
3. Kasir **Lock** tagihan OTC (gerbang pembayaran) → nilai final; jurnal disiapkan (Phase 3).

**Alur B — Pembayaran & Pelunasan**
1. Pada layar **Pembayaran** (pasca-Lock), Kasir memilih **metode** (Tunai → Kas; Non-Tunai → Bank A38; QRIS → Kode QR) & nominal. **Deposito tidak berlaku**.
2. Konfirmasi → (atomik): catat `bill_payment`, `outstanding -= applied`, penerimaan **sesi kasir (G1)**, dan **Jurnal Kas/Bank (D) / Pendapatan Penjualan OTC (K)** (Phase 3).
3. Bila `outstanding=0` → **Lunas**; **Kwitansi** dapat dicetak (bergantung pembayaran, BR-O06). Bila parsial → **Cicilan** (deteksi otomatis).

**Alur C — Batal Lunas (LIFO) & Unlock**
1. **Batal Lunas**: Kasir membatalkan **pembayaran terakhir** (LIFO) → `void` + alasan wajib + audit; `outstanding` naik; koreksi rekap sesi kasir; **tidak meng-unlock**. Jurnal balik (Phase 3).
2. **Unlock** (bila perlu koreksi nilai): hanya **setelah seluruh pembayaran di-Batal Lunas** (`total_paid=0`) & **approval Supervisor** (Phase 2) → `is_locked=false`, reversal jurnal.

**Alur D — Cetak**
1. Kasir mencetak **Nota** (kapan saja) atau **Kwitansi** (hanya bila ada pembayaran) — unduh PDF/print, dari Detail maupun baris worklist.

**Catatan anti-fraud**: pembayaran **hanya pasca-Lock**; **Batal Lunas** dibatasi **LIFO** + alasan + audit; **Kwitansi** hanya setelah pembayaran; **item read-only** dari Farmasi; **Deposito tidak berlaku** untuk OTC; penerimaan **terlihat di Tutup Kasir (G1) & Verifikasi (G4)**.

## 10. Spesifikasi Data 
### Layar Worklist
#### Spesifikasi Data — Tagihan Penjualan Obat Bebas (OTC)

> Tagihan `bill_type=OTC` dibentuk modul **Farmasi** (Penjualan Obat Bebas) dan ditagih pada tab **Penjualan Obat Bebas** (FR-024/BR-031). Header & item **read-only dari Farmasi**; pembayaran/Lock/Lunas/Batal Lunas/Jurnal mengikuti pola tab Tagihan Pasien. **Tanpa** penjamin/klaim, deposito, encounter, atau status-layanan klinis.

| Field/Kolom | Sumber | Format | Keterangan |
|-------------|--------|--------|------------|
| No. Registrasi / No. Tagihan OTC | Farmasi (`otc_note_no`) + `bill_number` | teks | search |
| Tgl / Jam | Farmasi | datetime | filter rentang tanggal, sort |
| Petugas Farmasi | Farmasi (`pharmacist_name`) | teks | search |
| Pembeli | Farmasi (`buyer_name`, opsional) | teks | search |
| **Jenis Kelamin** | Farmasi (`buyer_gender`) | enum L/P | filter |
| **Usia** | Farmasi (`buyer_age`) | numerik/teks (thn) | tampil/sort |
| Unit / Apotek | Farmasi (`pharmacy_unit`) | teks | filter |
| Total / Sisa | `total_amount` / `outstanding_balance` | Rp | sort |
| Status Tagihan | `bill_status` (subset OTC) | badge | filter |

> **Field `bill` untuk OTC**: `bill_type=OTC`; `patient_id`/`encounter_id`/`penjamin_type_id`/`class_id` = **null**; pembayaran memakai `bill_payment` yang sama (metode Tunai/Non-Tunai A38, **bukan** DEPOSITO); Lock/Unlock/Lunas/Batal Lunas & audit mengikuti field bill yang sama (`is_locked`, `total_paid`, `void_*`, dst.). Jurnal OTC memakai `journal`/`journal_line` dengan akun **Pendapatan Penjualan OTC** (Phase 3, mapping COA [PERLU KONFIRMASI]).

## Asumsi
- [ASUMSI] Tidak ada BPMN khusus G2b; alur diturunkan dari pola penagihan G2 & praktik penjualan obat bebas apotek. Bagian turunan ditandai [ASUMSI].
- [KEPUTUSAN] **G2b = PRD anak dari G2** untuk **tab Penjualan Obat Bebas (OTC)**. Secara UI satu halaman dengan Tagihan Pasien & Deposito, namun didokumentasikan terpisah (standalone).
- [KEPUTUSAN] Tagihan OTC = **`bill_type=OTC`** dari Farmasi; header & item **read-only**; memakai **entitas & endpoint billing bersama** (`bill`/`bill_payment`/`journal`) induk G2 (BR-O01).
- [KEPUTUSAN] **Pembayaran multi-metode A38** (Tunai/Non-Tunai; **tanpa Deposito**); **Lock = gerbang pembayaran**; **Batal Lunas LIFO** tanpa approval; **Unlock** ber-approval pasca Batal Lunas (FR-O03/FR-O04/FR-O05, rujuk BR-008/BR-018/BR-019/BR-025 induk).
- [KEPUTUSAN] **Jurnal penerimaan OTC** = **Kas/Bank (D) / Pendapatan Penjualan OTC (K)** (Phase 3); Batal Lunas → jurnal balik (FR-O06/BR-O05, rujuk BR-020 induk).
- [KEPUTUSAN] **Cetak**: Nota kapan saja; **Kwitansi hanya setelah ada pembayaran** (FR-O07/BR-O06, rujuk FR-013/BR-017 induk).
- [KEPUTUSAN] **OTC tanpa** penjamin/klaim, deposito, encounter pasien, atau status-layanan klinis; dibayar penuh oleh pembeli (BR-O07, rujuk BR-031 induk).
- [ASUMSI] Penerimaan pembayaran OTC tertaut **sesi kasir aktif (G1)** sebagai dasar rekap Tutup Kasir & Verifikasi Penerimaan Kas (G4).
- [DIKONFIRMASI PO] Konfirmasi OTC: (a) **Batal Lunas membalik persis jurnal pembayaran** (Pendapatan OTC D / Kas/Bank K, akun & nilai identik) — BR-O05; (b) **diskon diizinkan penuh** (Persentase/Nominal, per item & keseluruhan; FR-012/BR-016 induk) — BR-O09; (c) **identitas pembeli dari input order Farmasi** (read-only) — BR-O10.

## Pertanyaan Terbuka
- [DIKONFIRMASI PO] **Jurnal OTC**: pembayaran → Kas/Bank (D) / Pendapatan Penjualan OTC (K); **Batal Lunas = balik persis transaksi pembayaran** (reversal: Pendapatan OTC D / Kas/Bank K, akun & nilai identik). Hanya **kode akun** COA "Pendapatan Penjualan OTC" yang perlu ditetapkan Akuntansi (BR-O05).
- [DIKONFIRMASI PO] **Diskon OTC diizinkan penuh** — Persentase/Nominal, per item & keseluruhan, mengikuti FR-012/BR-016 induk (FR-O02 AC-4/BR-O09).
- [PERLU KONFIRMASI] Kebijakan & syarat **refund OTC** (retur obat) — kaitannya dengan retur stok Farmasi (Phase 2).
- [DIKONFIRMASI PO] **Identitas pembeli OTC diambil dari input order Penjualan Obat Bebas di modul Farmasi** (read-only di G2b); tidak diinput ulang di Billing (BR-O10).
- [DIKONFIRMASI — dari G2] Tab OTC = **in-scope Billing** dengan pola serupa Tagihan Pasien (pembayaran A38, Lock/Unlock, Batal Lunas LIFO, jurnal, cetak), **tanpa** penjamin/klaim/deposito/encounter (FR-024/BR-031 induk).