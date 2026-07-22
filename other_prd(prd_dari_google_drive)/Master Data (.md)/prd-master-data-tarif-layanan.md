# PRD — Master Data: Tarif Layanan (A10)

**Related Document:** Tipe Pelayanan (Rawat Inap/Rawat Jalan/Penunjang); Master Data Unit (tipe unit); Master Data Tipe Penjamin; Master Data Kelas (A58); Master Data Profesi (A57); Master Chart of Accounts (Modul Keuangan)
**Versi:** 3.14 - **Tipe Pelayanan → Unit & Komponen Tarif Dashboard** — Pada input Data Layanan/Tindakan, user wajib memilih **Tipe Pelayanan** secara multi-select terlebih dahulu (**RI**, **RJ**, **Penunjang**), lalu memilih **Unit** yang terfilter berdasarkan mapping: RI → Bangsal, RJ → Darurat dan Poli, Penunjang → Penunjang Tindakan/Pemeriksaan/Terapi. Aksi **Tambah Komponen Tarif** dipindahkan ke layer **Dashboard**; komponen yang ditambah menjadi default untuk input Data Layanan/Tindakan berikutnya.
**Tanggal:** 22 Juli 2026

## 1. Metadata Dokumen

**Approval**

Dokumen ini **tidak memerlukan approval formal** (sign-off) — disepakati langsung oleh PO/tim terkait. (Catatan: alur *Approval berjenjang perubahan tarif* di **Phase 2** adalah fitur produk, terpisah dari sign-off dokumen ini.)

**Related Documents**
* **Tipe Pelayanan** — enum tetap sistem **Rawat Inap (RI), Rawat Jalan (RJ), Penunjang** sebagai sumber filter awal **cakupan ketersediaan** layanan (`tipe_pelayanan_list`; BR-37).
* **Master Data Unit** — referensi tipe unit untuk pilihan **Unit** setelah Tipe Pelayanan dipilih. Mapping filter Unit: RI → Bangsal; RJ → Darurat dan Poli; Penunjang → Penunjang Tindakan/Penunjang Pemeriksaan/Penunjang Terapi.
* Master Data Tipe Penjamin — sumber varian `id_tipe_penjamin` (Umum/BPJS/Asuransi/Perusahaan).
* Master Data Kelas (A58) — sumber varian `id_kelas` (VIP/Kelas I/II/III/Tanpa Kelas); merujuk master, bukan enum tetap (BR-28).
* Master Data Profesi (A57) — sumber `id_profesi` untuk **Multi-Tagging** komponen tarif.
* Master Chart of Accounts (Modul Keuangan) — sumber `coa_id_pendapatan` (Phase 3).
* Master Data Barang Farmasi (A4) — sumber lookup **Barang Farmasi** (`id_barang_farmasi`) untuk komponen tarif bertipe **BHP** (BR-42).

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 22 Juli 2026 | 3.14 | Mengubah alur ketersediaan layanan: user memilih multi-select **Tipe Pelayanan** (RI/RJ/Penunjang) terlebih dahulu, lalu memilih **Unit** yang terfilter sesuai mapping tipe unit. Memindahkan aksi **Tambah Komponen Tarif** ke layer **Dashboard**; komponen baru menjadi default prospektif untuk input Data Layanan/Tindakan berikutnya. |
| 22 Juli 2026 | 3.13 | Menambahkan aturan mapping **Tipe Pelayanan → Tipe Unit** untuk menentukan unit-unit aktif tempat tindakan tersedia: Rawat Jalan → Poli, Rawat Inap → Bangsal, IGD → Darurat, Penunjang → Penunjang Pemeriksaan/Penunjang Terapi/Penunjang Tindakan. |
| 22 Juli 2026 | 3.12 | Cakupan ketersediaan layanan diubah dari **Unit** menjadi **Tipe Pelayanan** (`Rawat Jalan`, `Rawat Inap`, `IGD`, `Penunjang`). Field ketersediaan layanan diganti menjadi `tipe_pelayanan_list`/`service_tipe_pelayanan`; resolver memakai `tipe_pelayanan` hanya untuk cek ketersediaan, bukan penentu harga. |
| 21 Juli 2026 | 3.11 | Menambah enum **Kategori Tindakan** menjadi 17 opsi dengan tambahan **Patologi Anatomi** dan **Transfusi Darah** pada master `casemix_component` (BR-24/FR-07). |
| 6 Juli 2026 | 3.10 | **Data Seeder & finalisasi BR-26.** Ditambah **§8.4 Data Seeder** — skrip SQL idempotent (`seeds/`) untuk A10 + seluruh master referensi (A19/A33/A22/A57/A58/A20/A3/A4) serta tabel milik A10 (`casemix_component` 17 fixed, `tariff_component` default). **BR-26 difinalkan** — daftar komponen tarif default (Jasa Sarana, Jasa Pelayanan [operator default Dokter], BHP, Akomodasi) naik dari `[PERLU KONFIRMASI]` → `[DISETUJUI]`. Dicatat inkonsistensi tipe FK lintas-PRD (id penjamin bigint vs UUID; satuan kode vs UUID). |
| 6 Juli 2026 | 3.9 | **Tipe Komponen BHP.** Ditambah tipe komponen tarif ketiga **BHP** (Bahan Habis Pakai) di samping Jasa Medis & Non-Medis. Komponen BHP **tanpa operator & tanpa Mapping COA**; pada Data Tarif tiap **raw BHP** = **Barang Farmasi** (lookup Master Data Barang Farmasi **A4**) + **qty** + **harga satuan (manual)**, subtotal = `qty × harga`. Masuk total layanan (BR-36) & resolusi (BR-13), namun **bukan** basis persentase Non-Medis (BR-35). Skema: `tariff_component.tipe_komponen` +`BHP`; `service_tariff.id_barang_farmasi/qty` (BR-42). |
| 6 Juli 2026 | 3.8 | **Effective date masuk Phase 1.** `effective_date` (Tanggal Berlaku) kini diisi sejak Phase 1 — default hari ini, **forward-dating** untuk penjadwalan tarif; Phase 1 tetap **tanpa backdate** (BR-27); riwayat versi & approval tetap Phase 2. **Consolidated DDL (PostgreSQL) dihapus** dari §8.1 (skema cukup dideskripsikan per tabel). |
| 2 Juli 2026 | 2.0–2.6 | Evolusi konsep: model **Layanan + Data Tarif** berbasis **Komponen**; cakupan ketersediaan dan varian tarif dipisah di Data Layanan; varian tarif **auto-generate**; **Komponen multi-select**; field **`peran`** (profesi identik boleh >1 tarif); **Mapping COA** Phase 3; finalisasi seluruh open question (A58, tie-break nominal tertinggi, no-backdate). |
| 3 Juli 2026 | 3.0 | **Restrukturisasi dokumen** mengikuti **Template PRD** (9 section). Related Features dipisah (§5); Data & Technical Specifications (§8) memuat DB Schema Suggestion, API, Form Input & List View spec, Business Rules. Substansi tidak berubah. |
| 3 Juli 2026 | 3.1 | **Pemisahan Kategori Tindakan vs Komponen Tarif.** **Kategori Tindakan** (17, fixed) dipindah ke **header Data Layanan** sebagai **single-select** (1 per layanan) untuk pemetaan klaim (`service.id_casemix` → master `casemix_component`). **Komponen Tarif** (Data Tarif) kini **default sistem (non-casemix) + dapat ditambah**, bukan lagi multi-select dari 17 Kategori Tindakan. Multi-Tagging, varian auto-generate, dan Mapping COA (per komponen tarif) tidak berubah. |
| 3 Juli 2026 | 3.2 | **Tipe komponen tarif & tarif persentase.** Komponen Tarif bertipe **Jasa Medis** (wajib profesi A57, diwarisi baris) / **Non-Medis**; ditambah **inline** via **[+ Tambah Komponen Tarif]** (bukan modul master). Komponen **Non-Medis** dapat diisi **persentase (%)** dengan basis **total Jasa Medis** (BR-35). **Total Rupiah** layanan tampil **live di header** & kolom Dashboard (BR-36). Skema: `tariff_component.tipe_komponen/id_profesi`, `service_tariff.tipe_nominal/persen`. |
| 3 Juli 2026 | 3.3 | **Finalisasi keputusan.** Kategori Tindakan **wajib** (`id_casemix` NOT NULL) & daftar **17 fixed/read-only** (tak diubah admin) — BR-33/FR-07. Hasil **persentase dibulatkan ke atas (ceiling)** ke Rupiah bulat, basis **per varian** — BR-35. Daftar default Komponen Tarif masih menunggu data ([PERLU KONFIRMASI], BR-26). |
| 3 Juli 2026 | 3.4 | **Utilitas input tarif.** **Mode pengisian Seragam/Per-sel** — satu harga diterapkan ke seluruh sel matriks (Penjamin × Kelas) atau isi per-sel (BR-38, FR-02 AC7). **Copy tarif antar-komponen** — salin tarif dari komponen tarif yang sudah diisi ke komponen lain (BR-39, FR-02 AC8). Tanpa perubahan skema. |
| 4 Juli 2026 | 3.7 | **Raw / Multi-Tagging operator.** Tiap Komponen Tarif dapat berisi **≥1 raw (operator = profesi A57 + peran)** dengan tarif sendiri; **tarif komponen = akumulasi (Σ) raw** (BR-41). Komponen Medis: raw pertama = operator default (BR-34), dapat [+ Tambah Raw]. Mendukung **Laporan Jasa Medis** per operator & dikonsumsi fitur **Tindakan & BHP**. BR-13 diperbarui (subtotal komponen = Σ raw, bukan pilih satu). Tanpa perubahan skema (reuse `service_tariff.id_profesi/peran`). |
| 3 Juli 2026 | 3.6 | **Instalasi dihapus.** `service.id_instalasi` & pilihan Instalasi dihilangkan dari Data Layanan. `nama_layanan` kini **unik global** (BR-01, `UNIQUE`); cakupan ketersediaan layanan memakai **Tipe Pelayanan**. |
| 3 Juli 2026 | 3.5 | **Cakupan ketersediaan & Komponen Tarif default prospektif.** **Tipe Pelayanan** digunakan sebagai cakupan ketersediaan layanan, bukan pembentuk tarif; varian tarif = **Tipe Penjamin × Kelas** (BR-37). **Tambah Komponen Tarif** disimpan `is_default=true` → dimuat otomatis pada layanan **baru** (prospektif); **layanan lama tetap** (snapshot, histori dipertahankan) — BR-40. Opsi **Rupiah/% per sel** dipertegas (BR-35). |

## 2. Overview & Background

**Overview / Brief Summary**

Master Data **Tarif Layanan** adalah modul pada cluster **Control Panel** yang menjadi **sumber kebenaran tunggal** harga setiap layanan/tindakan rumah sakit. Modul menyimpan *apa layanannya* (**Data Layanan**) dan *berapa harganya* (**Data Tarif**) dalam satu form 2-section.

Modul membedakan dua konsep komponen:
* **Kategori Tindakan** — daftar **17 kategori tindakan** (fixed) untuk pemetaan klaim (BPJS/INA-CBG). Dipilih **single-select di header Data Layanan** (1 kategori tindakan per layanan) — menandai layanan ini setara kategori tindakan mana saat klaim (BR-24, BR-33).
* **Komponen Tarif** — komponen penguraian harga (mis. Jasa Sarana, Jasa Pelayanan, BHP). Sistem menyediakan **daftar default (non-casemix)**; komponen baru ditambah dari layer **Dashboard** via aksi **[+ Tambah Komponen Tarif]** dan **berlaku sebagai default untuk input Data Layanan/Tindakan berikutnya** (prospektif — layanan lama dan form yang sedang dibuka tidak berubah, BR-40). Tiap komponen tarif bertipe **Jasa Medis** (terikat 1 profesi dari Master Profesi A57), **Non-Medis**, atau **BHP** (Bahan Habis Pakai — tiap raw merujuk **Barang Farmasi** dari Master Data Barang Farmasi A4 + qty + harga satuan manual). Komponen Jasa Medis/Non-Medis dapat dipetakan ke akun COA (Phase 3); **komponen BHP tanpa Mapping COA**. Data Tarif diuraikan per komponen tarif ini (BR-26, BR-34, BR-42).

Kekuatan modul ada pada model tarifnya: alih-alih satu angka, setiap layanan diuraikan menjadi **Komponen Tarif**. Model tarif mendukung:
* **Multi-Tagging operator (Raw)** — satu komponen tarif dapat berisi beberapa **raw (baris operator)**, tiap raw = 1 **Operator** (profesi A57 + peran opsional) dengan **tarif tersendiri**. Tarif komponen = **akumulasi (Σ) seluruh raw** (mis. Jasa Medis: Dokter Bedah Rp10.000 + Asisten Rp8.000 = Rp18.000). Tiap operator dapat bertarif berbeda → dasar **Laporan Jasa Medis** per operator; setting raw ini dikonsumsi fitur **Tindakan & BHP** (BR-29, BR-41).
* **Varian auto-generate** — dimensi **Tipe Penjamin** dan **Kelas** dipilih **multi-select di Data Layanan**; sistem membentuk **matriks kombinasi varian** otomatis, petugas cukup mengisi nominal per kombinasi (BR-15). **Tipe Pelayanan BUKAN dimensi tarif** — user memilih Tipe Pelayanan lebih dulu (**RI/RJ/Penunjang**), lalu Unit terfilter sesuai tipe pelayanan: **RI → Bangsal; RJ → Darurat dan Poli; Penunjang → Penunjang Tindakan/Pemeriksaan/Terapi** (BR-37).
* **Nominal atau persentase** — komponen tarif **Non-Medis** dapat diisi **nominal Rupiah** *atau* **persentase (%)** dengan **basis = total komponen tarif Jasa Medis** pada varian/konteks yang sama (mis. Jasa Sarana = 40% jasa medis) — BR-35.
* **Komponen BHP (Bahan Habis Pakai)** — komponen bertipe **BHP** menguraikan biaya bahan: tiap **raw** = 1 **Barang Farmasi** (lookup Master Data Barang Farmasi A4) + **jumlah (qty)** + **harga satuan (input manual)**; subtotal raw = qty × harga satuan, subtotal komponen = Σ raw. **Tanpa operator & tanpa Mapping COA** (BR-42).
* **Total Rupiah layanan** — sistem menghitung & menampilkan **total Rupiah** layanan (per varian/konteks) secara **live di header form input** dan sebagai ringkasan di **Dashboard** (BR-36).
* **Mapping COA (Phase 3)** — tiap komponen tarif dipetakan ke akun **Chart of Accounts kategori Pendapatan** agar billing terposting ke jurnal otomatis (BR-30).

Modul menyediakan **Dashboard** dengan **ringkasan variasi tarif informatif** (jumlah varian, **total/rentang Rupiah**, penanda multi-profesi/kelas/penjamin) serta operasi **Tambah**, **Edit**, dan **Aktif/Nonaktifkan**.

**Business Process (As-Is vs To-Be)** [ASUMSI — diturunkan dari pola master data sejenis, modul belum ber-BPMN]

* **As-Is (manual / masalah saat ini)**:
    * Tarif dikelola di **spreadsheet (Excel) terpisah** per konteks pelayanan; rawan versi ganda & tidak sinkron dengan billing.
    * Perbedaan harga per penjamin (Umum vs BPJS vs Asuransi) & per kelas dicatat manual di kolom terpisah → **sulit ditelusuri**, sering salah pilih saat kasir menagih.
    * Jasa profesi (operator, anestesi, dll) ditulis ad-hoc, **tidak terstandar** antar layanan.
    * Menonaktifkan layanan lama = menghapus baris → **kehilangan histori** & memutus referensi transaksi lama.

* **To-Be (solusi digital yang diusulkan)**:
    * Satu form **Tambah Data Layanan** 2-section menjadikan pembuatan layanan + harga **satu proses atomik**.
    * Layanan dipetakan ke **1 Kategori Tindakan** (single-select header), **siap dipetakan ke klaim** BPJS/INA-CBG.
    * Harga diuraikan per **Komponen Tarif** (default sistem + dapat ditambah) — terstruktur & konsisten antar layanan.
    * **Multi-select Tipe Pelayanan** (cakupan ketersediaan) lalu **multi-select Unit terfilter**, ditambah **Penjamin/Kelas** (dimensi tarif) di Data Layanan + **matriks varian auto-generate** menggantikan kolom-kolom manual Excel dengan struktur data yang dapat di-query billing.
    * **Aktif/Nonaktif** (bukan hapus) menjaga histori & integritas referensi (BR-20).
    * **Dashboard informatif** memberi manajemen visibilitas kompleksitas tarif tiap layanan.
    * **Mapping COA (Phase 3)** menyiapkan posting jurnal pendapatan otomatis dari billing.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Sentralisasi tarif | 100% layanan aktif RS terinput di modul (tidak ada tarif transaksi dari Excel terpisah) dalam 1 bulan pasca go-live. |
| 2 | Kecepatan input | Petugas dapat menambah 1 layanan + tarif lengkap (≥1 komponen tarif) dalam **≤ 5 menit** via form 2-section. |
| 3 | Akurasi penagihan | Kesalahan harga akibat salah penjamin/kelas turun **≥ 80%** (vs proses Excel) karena tarif ditentukan sistem. |
| 4 | Kesiapan klaim (casemix) | **100%** layanan memetakan 1 Kategori Tindakan (wajib, BR-33); pemetaan **sesuai kategori** casemix (audit sampling ≥ 95% benar) untuk kesiapan klaim/INA-CBG. |
| 5 | Standarisasi komponen tarif | ≥ 90% layanan menguraikan harga ke **Komponen Tarif** (bukan angka gelondongan). |
| 6 | Visibilitas variasi | Manajemen melihat jumlah varian & rentang tarif tiap layanan langsung dari Dashboard (**0 klik** untuk ringkasan). |
| 7 | Integritas histori | 0 penghapusan fisik data yang pernah dipakai transaksi; seluruh penonaktifan tercatat (BR-20). |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) | Phase 3 (Accounting: Mapping COA) |
|-------------|---------------------|-----------------------------------------|-----------------------------------|
| Dashboard Layanan | List + search + filter + ringkasan variasi tarif informatif + **total/rentang Rupiah** (BR-36); toggle Aktif/Nonaktif | Kolom status approval; filter "menunggu persetujuan" | Badge status mapping COA (terpetakan/belum); filter "belum dipetakan COA" |
| Tambah Data Layanan | Form 2 section; **single-select Kategori Tindakan** (header); multi-select **Tipe Pelayanan** wajib dipilih lebih dulu (RI/RJ/Penunjang); multi-select **Unit** terfilter berdasarkan Tipe Pelayanan; multi-select **Penjamin/Kelas** (dimensi tarif); Komponen Tarif default sistem; matriks varian auto-generate (min 1 sel); **total Rupiah live di header** (BR-36) | Perubahan berstatus *Draft → Menunggu Approval → Aktif* | — (akun COA mengikuti komponen tarif, tak diinput di form layanan) |
| Data Tarif (Komponen Tarif) | Komponen Tarif default sistem + dapat ditambah; **≥1 raw/operator per komponen Medis, akumulasi Σ (BR-41)** + `peran`; nominal **Rupiah atau persentase (Non-Medis, basis total Jasa Medis — BR-35)** per sel varian; **mode pengisian seragam/per-sel (BR-38)** & **copy tarif antar-komponen (BR-39)**; **komponen BHP** = raw Barang Farmasi (A4) + qty + harga satuan manual (subtotal qty×harga, BR-42) | Approval berjenjang perubahan nominal; escalation SLA | Akun COA mengikuti komponen tarif (BR-30); ditampilkan saat resolusi tarif |
| Edit Layanan | Ubah Data Layanan & Data Tarif (tambah/ubah/nonaktif baris); **Tanggal Berlaku (`effective_date`)** — default hari ini, forward-dating; tanpa backdate (BR-27) | Riwayat versi tarif + audit trail | — |
| Aktif/Nonaktifkan | Toggle status layanan (tanpa hapus fisik) | Approval sebelum nonaktif untuk layanan terpakai | — |
| Master Kategori Tindakan | 17 kategori tindakan (**fixed/read-only**, tak diubah admin); **wajib** dipilih 1 per layanan di header (BR-24/BR-33) | — | — |
| Tambah Komponen Tarif (Dashboard) | Aksi **[+ Tambah Komponen Tarif]** di layer Dashboard (Nama, Tipe Medis/Non-Medis/BHP, Profesi bila Medis; Barang Farmasi+qty+harga bila BHP) — tidak tersedia saat input Data Layanan/Tindakan; disimpan **default prospektif** untuk input berikutnya, layanan lama tetap (BR-40) | — | Field Mapping COA per komponen tarif (`coa_id_pendapatan`) — **kecuali komponen BHP** (tanpa COA, BR-42) |
| Mapping COA | — | — | Pemetaan **per komponen tarif** → akun COA Pendapatan; acuan posting jurnal otomatis |

**Out of Scope**
* Kalkulasi klaim / grouping INA-CBG (grouping di modul Casemix/Klaim); modul ini hanya menyimpan **pemetaan** ke Kategori Tindakan.
* Transaksi billing/kasir (modul Billing yang mengonsumsi tarif).
* Tipe Pelayanan/Unit/Tipe Penjamin/Kelas/Profesi (hanya direferensikan; Tipe Pelayanan adalah enum tetap sistem, Unit dari Master Data Unit).
* **Master Chart of Accounts & mesin posting jurnal** — dikelola modul Keuangan; modul ini hanya mereferensikan (FK) & menyimpan pemetaan.
* Kategori Tindakan **Obat, Obat Kronis, Obat Kemoterapi, BMHP** (modul Farmasi/BHP; dikecualikan dari 17 Kategori Tindakan default — BR-24).
* Import massal tarif dari Excel (kandidat Phase 2).

## 5. Related Features

* **Master Data Profesi (A57)** — sumber daftar profesi untuk Multi-Tagging komponen tarif (`id_profesi`).
* **Master Data Kelas (A58)** — sumber varian Kelas (`id_kelas`/`kelas_list`); rujuk master, bukan enum (BR-28).
* **Tipe Pelayanan / Master Data Unit / Master Data Tipe Penjamin** — Tipe Pelayanan adalah enum tetap sistem untuk filter awal **cakupan ketersediaan** layanan (`tipe_pelayanan_list`), sedangkan Unit dipilih dari Master Data Unit yang terfilter berdasarkan Tipe Pelayanan; Tipe Penjamin adalah sumber dimensi varian tarif (`id_tipe_penjamin`).
* **Master Data Barang Farmasi (A4)** — sumber lookup **Barang Farmasi** (`id_barang_farmasi`) untuk komponen tarif bertipe **BHP**; tiap raw BHP = 1 barang + qty + harga satuan manual (BR-42).
* **Modul Billing & Casemix** (konsumen) — mengambil tarif via endpoint `resolve` berdasarkan konteks **Penjamin/Kelas** (dimensi tarif) transaksi (BR-13); **Tipe Pelayanan** dan **Unit** dipakai memeriksa ketersediaan layanan; membaca `id_casemix` layanan untuk klaim.
* **Modul Keuangan / Akuntansi** (Phase 3) — sumber **Master Chart of Accounts (COA)**; konsumen pemetaan COA untuk posting jurnal pendapatan otomatis.
* **Fitur Tindakan & BHP** (konsumen) — memakai **setting raw/operator** komponen tarif suatu layanan: saat transaksi tindakan, operator per komponen disediakan sesuai setting di modul ini (BR-41).
* **Laporan Jasa Medis** (konsumen) — memakai tarif **per operator (raw)** untuk merekap jasa tiap operator (BR-41).

## 6. Business Process & User Stories

**State Machine Table**

Status berlaku pada dua entitas: **Layanan** dan **Baris Tarif**. Efek "Data" = ketersediaan untuk transaksi (billing).

| Status | Deskripsi | Efek (Data) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-------------|--------------------|--------------------|
| Aktif (Layanan) | Layanan siap dipakai; ≥1 baris tarif aktif | Muncul & dapat ditagih di Billing | → Nonaktif (toggle) | → Menunggu Approval (bila ubah tarif) |
| Nonaktif (Layanan) | Disembunyikan dari transaksi baru; data & histori tetap ada | Tidak dapat dipilih transaksi baru; transaksi lama tetap valid | → Aktif (toggle) | → Aktif (perlu approval bila pernah dipakai) |
| Aktif (Baris Tarif) | Nominal komponen tarif berlaku pada varian tertentu | Ikut menghitung total tarif konteks terkait | → Nonaktif | → Menunggu Approval |
| Nonaktif (Baris Tarif) | Varian tarif dihentikan | Diabaikan saat resolusi tarif | → Aktif | → Aktif (approved) |
| *(Phase 2)* Draft / Menunggu Approval / Approved / Ditolak | Alur persetujuan perubahan tarif | Tidak berlaku sampai Approved | — | Draft→Menunggu→Approved/Ditolak |

> Catatan Phasing: Status **Draft/Menunggu Approval/Approved/Ditolak** & `role_approver` **belum aktif di Phase 1** (perubahan langsung berlaku); kolom `status_approval`, `role_approver` **sudah disiapkan** di skema agar siap Phase 2; **`effective_date` aktif sejak Phase 1** (Tanggal Berlaku, default hari ini, forward-dating). Phase 1 **tanpa backdate** (BR-27).

**User Stories Utama**
* **US-01** — Sebagai **Petugas Casemix**, saya ingin menambah layanan sekaligus menguraikan tarifnya ke komponen tarif dalam satu form, agar tidak perlu input di dua tempat.
* **US-02** — Sebagai **Petugas Casemix**, saya ingin menambah beberapa **raw/operator** (mis. Dokter Bedah, Asisten) pada satu komponen tarif dengan tarif masing-masing yang **terakumulasi**, agar jasa tiap operator terstandar (BR-41).
* **US-09** — Sebagai **Keuangan/Manajemen**, saya ingin tarif tersimpan **per operator (raw)**, agar **Laporan Jasa Medis** dan fitur **Tindakan & BHP** memakai tarif operator yang benar (BR-41).
* **US-10** — Sebagai **Petugas Casemix**, saya ingin menambah komponen tarif **BHP** berisi daftar **Barang Farmasi** (Master A4) beserta **qty** & **harga satuan**, agar biaya bahan habis pakai suatu tindakan teruraikan & terhitung otomatis (BR-42).
* **US-03** — Sebagai **Petugas Casemix**, saya ingin memilih Tipe Pelayanan terlebih dahulu lalu memilih Unit dari daftar yang sudah terfilter, serta memilih Tipe Penjamin/Kelas sebagai cakupan varian tarif di Data Layanan, agar cakupan layanan dan harga BPJS vs Umum vs Asuransi otomatis benar tanpa input berulang.
* **US-04** — Sebagai **Manajemen**, saya ingin melihat ringkasan variasi & rentang tarif tiap layanan dari dashboard, agar cepat menilai kompleksitas & konsistensi harga.
* **US-05** — Sebagai **Petugas**, saya ingin menonaktifkan layanan lama tanpa menghapusnya, agar histori transaksi tetap utuh.
* **US-06** — Sebagai **Kasir/Billing (konsumen)**, saya ingin sistem menentukan tarif otomatis dari konteks transaksi, agar tidak salah pilih harga.
* **US-07** *(Phase 3)* — Sebagai **Staf Keuangan/Akuntansi**, saya ingin tiap komponen tarif dipetakan ke akun **COA Pendapatan** yang benar, agar pendapatan billing otomatis terposting ke jurnal yang tepat.
* **US-08** — Sebagai **Petugas Casemix**, saya ingin memetakan tiap layanan ke **1 Kategori Tindakan** (dari 17) di header Data Layanan, agar layanan siap diklaim ke BPJS/INA-CBG.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard Tarif Layanan (FR-01)**
* **User Story**: US-04.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Dashboard menampilkan semua layanan (default urut nama) dengan kolom pada §8.3.2; rentang total & jumlah varian dihitung dari baris tarif **aktif**.
    * **AC 2**: Badge Variasi hanya tampil untuk dimensi yang benar-benar bervariasi (distinct > 1, BR-25).
    * **AC 3**: Baris dapat **di-expand** menampilkan matriks Komponen Tarif × varian tanpa navigasi halaman.
    * **AC 4**: Filter & search bekerja kombinatif; hasil ter-update tanpa reload penuh.
    * **AC 5 — Total Rupiah**: Dashboard menampilkan **total Rupiah** layanan (kolom Total/Rentang, §8.3.2). Total per konteks = Σ komponen Jasa Medis + komponen Non-Medis (nominal & hasil **persentase**, BR-35); antar-varian ditampilkan sebagai **rentang** (min–max). Dihitung dari baris tarif **aktif** (BR-36).
    * **AC 6 — Aksi Tambah Komponen Tarif**: Dashboard menyediakan tombol **[+ Tambah Komponen Tarif]** untuk membuka modal FR-05. Tombol ini tidak ditampilkan pada form input Data Layanan/Tindakan.

**Fitur: Tambah Data Layanan (FR-02) — form 2 section**
* **User Story**: US-01, US-02, US-03, US-08.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Section A (Data Layanan)**: Form berisi Nama Layanan, Kode (auto/manual), Kelompok Layanan, **Kategori Tindakan** (single-select 1 dari 17 — **wajib**, untuk pemetaan klaim, BR-33), Kode Casemix/INA-CBG (opsional), Deskripsi, **multi-select Tipe Pelayanan** sebagai cakupan **ketersediaan** (**RI/Rawat Inap**, **RJ/Rawat Jalan**, **Penunjang**; bukan dimensi tarif, BR-37), lalu **multi-select Unit** yang baru aktif setelah Tipe Pelayanan dipilih. Unit terfilter otomatis sesuai mapping: RI → unit bertipe **Bangsal**; RJ → unit bertipe **Darurat** dan **Poli**; Penunjang → unit bertipe **Penunjang Tindakan**, **Penunjang Pemeriksaan**, dan **Penunjang Terapi**. Setelah itu user memilih variabel variasi tarif **Tipe Penjamin** dan **Kelas** (pilih ≥0 nilai; kosong = dimensi berlaku umum) yang menetapkan **cakupan variasi** (BR-15). Status TIDAK diinput (sistem set **Aktif**). Nama wajib **unik global** (BR-01).
    * **AC 2 — Section B (Data Tarif)**: Pengguna menguraikan harga per **Komponen Tarif**. Sistem **memuat otomatis** daftar komponen tarif **default** (`is_default & aktif`, termasuk komponen yang pernah ditambah dari Dashboard sebelumnya — BR-40). Form Data Tarif **tidak menyediakan aksi Tambah Komponen Tarif baru**; penambahan komponen dilakukan dari layer Dashboard (FR-05). Wajib **≥ 1 komponen tarif** dengan tarif aktif (BR-23). Komponen Tarif **tidak** dipilih dari 17 Kategori Tindakan — casemix dipetakan sekali di header (Section A).
    * **AC 3 — Raw / Multi-Tagging Operator**: Tiap komponen tarif **Jasa Medis** dapat memiliki **≥1 raw (baris operator)**; tiap raw = 1 **Operator** (profesi dropdown Master Profesi A57 + **Peran** opsional, mis. Operator/Asisten — BR-29) dengan **tarif tersendiri** per varian. Raw pertama memakai **operator default** komponen (BR-34, terisi otomatis/wajib); penambahan raw operator **opsional** via **[+ Tambah Raw/Operator]**. **Tarif komponen (per varian) = akumulasi (Σ) seluruh raw aktif** — mis. Dokter Bedah Rp10.000 + Asisten Rp8.000 = Rp18.000 (BR-41). Komponen **Non-Medis** = 1 raw tanpa operator (BR-10). **Komponen BHP** = ≥1 raw; tiap raw **tanpa operator**, memilih **Barang Farmasi** (lookup Master A4) + **qty** + **harga satuan (manual)** — subtotal raw = qty × harga, subtotal komponen = Σ raw (BR-42).
    * **AC 4 — Varian auto-generate**: Data Tarif **tidak menyediakan input** Tipe Penjamin/Kelas. Sistem membentuk **matriks kombinasi varian** (Tipe Penjamin × Kelas) dari multi-select Section A; petugas mengisi **nominal** per sel — sehingga tarif dapat **berbeda per Penjamin/Kelas**. **Tipe Pelayanan tidak** membentuk varian tarif (BR-37). **Minimal 1 sel wajib terisi** per layanan (BR-23); sel kosong = varian tak bertarif.
    * **AC 5 — Nominal atau persentase (Non-Medis)**: Untuk komponen tarif **Non-Medis**, tiap sel punya **toggle Rupiah/%** — dapat diisi **nominal Rupiah** *atau* **persentase (%)**, dan dapat berpindah kapan saja. Bila **%**, nilai efektif = `persen% × Σ nominal komponen Jasa Medis` pada varian/konteks yang sama, **dibulatkan ke atas** ke Rupiah bulat (BR-35). Komponen **Jasa Medis** hanya menerima nominal Rupiah. Komponen **BHP** hanya menerima **nominal Rupiah** (harga satuan manual); persentase tidak berlaku (BR-42).
    * **AC 6 — Total Rupiah live**: Header form menampilkan **total Rupiah** layanan yang terhitung otomatis dari komponen terisi (nominal + hasil %); bila tarif bervariasi antar-varian, ditampilkan **rentang/total per varian** (BR-36).
    * **AC 7 — Mode pengisian nominal (seragam / per-sel)**: Untuk tiap komponen tarif, pengguna memilih **(a) Seragam** — satu nilai (nominal Rupiah atau %) langsung diterapkan ke **seluruh sel** matriks varian (Tipe Penjamin × Kelas); atau **(b) Per-sel** — isi nilai tiap sel secara berbeda. Setelah "Seragam", nilai tiap sel tetap dapat **disesuaikan/override** (BR-38).
    * **AC 8 — Copy tarif antar-komponen**: Dari komponen tarif yang **sudah diisi harganya**, pengguna dapat **menyalin (copy) tarif** ke komponen tarif lain pada layanan yang sama; nilai tersalin mengikuti sel varian dan **dapat diubah** setelah disalin (BR-39).
    * **AC 9 — Validasi simpan**: Tipe Pelayanan wajib minimal 1; Unit wajib minimal 1 dan harus sesuai mapping Tipe Pelayanan (BR-37); Nominal (bila diisi) ≥ 0 & bilangan bulat; persen 0–100 & hanya untuk komponen Non-Medis (BR-35); kombinasi (Komponen Tarif + Profesi + Peran + Penjamin + Kelas) **unik** per layanan (BR-11); layanan wajib punya **≥ 1 baris tarif aktif** (BR-23).
    * **AC 10 — Atomik**: Simpan menulis Data Layanan + seluruh baris tarif dalam satu transaksi; bila gagal, tidak ada yang tersimpan sebagian.

* **Validasi**:

  **A. Wording Validasi (Frontend)**

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|-----------|-------|---------------|-------------|
  | Nama Layanan | Text | Required, Max 120, unik global | "Nama layanan wajib diisi & unik." | "Contoh: Operasi Appendektomi." |
  | Kategori Tindakan *(Section A/header)* | Dropdown (single-select) | **Required** | "Pilih 1 Kategori Tindakan." | "Pilih 1 dari 17 Kategori Tindakan (fixed) untuk pemetaan klaim (BR-33)." |
  | Tipe Pelayanan *(Section A — ketersediaan)* | Multi-select enum | **Required** | "Pilih minimal 1 Tipe Pelayanan." | "Pilih Tipe Pelayanan lebih dulu: RI, RJ, atau Penunjang. Pilihan ini memfilter Unit yang dapat dipilih (BR-37)." |
  | Unit *(Section A — ketersediaan)* | Multi-select lookup | **Required** setelah Tipe Pelayanan dipilih | "Pilih minimal 1 Unit." / "Unit tidak sesuai Tipe Pelayanan yang dipilih." | "Unit difilter dari Master Data Unit: RI → Bangsal; RJ → Darurat/Poli; Penunjang → Penunjang Tindakan/Pemeriksaan/Terapi. Jika Tipe Pelayanan berubah, unit yang tidak sesuai otomatis dibersihkan." |
  | Tipe Penjamin *(Section A)* | Multi-select | Optional | — | "Pilih penjamin yang berlaku. Kosong = semua penjamin." |
  | Kelas *(Section A)* | Multi-select | Optional | — | "Pilih kelas yang berlaku (sumber A58). Kosong = semua kelas." |
  | Komponen Tarif *(Section B)* | List default | Required (≥ 1 komponen tarif) | "Tambahkan minimal 1 komponen tarif." | "Default sistem tersedia dari master `tariff_component`. Komponen baru ditambah dari Dashboard, bukan dari form input Data Layanan/Tindakan (FR-05, BR-26, BR-40)." |
  | Raw / Operator *(per komponen Medis)* | List + [+ Tambah Raw] | ≥ 1 raw untuk komponen Medis | "Tambah minimal 1 operator." | "Tiap raw = 1 operator; tarif komponen = Σ raw (BR-41)." |
  | Operator (Profesi) | Dropdown (A57) | Required per raw (komponen Medis) | "Pilih operator/profesi raw." | "Sumber Master Profesi A57; raw pertama = operator default komponen (BR-34)." |
  | Peran | Text | Optional (wajib bila profesi & varian sama berulang) | "Peran wajib berbeda bila profesi & varian sama." | "Pembeda mis. Operator/Asisten (BR-29)." |
  | Barang Farmasi *(raw komponen BHP)* | Lookup (A4) | Required per raw BHP | "Pilih barang farmasi." | "Sumber Master Data Barang Farmasi A4; tiap raw BHP = 1 barang (BR-42)." |
  | Qty (Jumlah) *(raw komponen BHP)* | Number | Required per raw BHP; ≥ 1, integer | "Isi jumlah (qty) ≥ 1." | "Subtotal raw = qty × harga satuan (BR-42)." |
  | Varian (Penjamin/Kelas) *(Section B)* | — (label, non-input) | — | — | "Kombinasi otomatis dari multi-select Penjamin/Kelas Section A; Tipe Pelayanan dan Unit tidak membentuk varian (BR-15/BR-37)." |
  | Tipe Nominal *(komponen Non-Medis)* | Toggle (Rupiah / %) | Default Rupiah; **%** hanya untuk komponen Non-Medis | "Persentase hanya untuk komponen Non-Medis." | "Pilih Rupiah atau % dari total Jasa Medis (BR-35)." |
  | Nominal | Currency | Wajib bila Tipe = Rupiah; ≥ 0, integer; min. 1 sel/layanan | "Isi minimal 1 tarif. Nominal wajib angka ≥ 0." | "Dalam Rupiah, tanpa desimal. Sel kosong = varian tak bertarif (BR-23)." |
  | Persentase (%) | Number | Wajib bila Tipe = %; 0–100 | "Persentase 0–100." | "Basis = total komponen Jasa Medis pada varian sama (BR-35)." |
  | Total Rupiah *(header)* | — (kalkulasi, non-input) | — | — | "Total otomatis = Σ Jasa Medis + Non-Medis (nominal & hasil %); per varian (BR-36)." |
  | Mode Pengisian *(per komponen)* | Toggle (Seragam / Per-sel) | — | — | "Seragam: 1 nilai untuk semua sel varian; Per-sel: isi tiap sel (BR-38)." |
  | Copy Tarif | Aksi (tombol) | Sumber komponen sudah terisi | "Pilih komponen sumber yang sudah diisi." | "Salin tarif dari komponen tarif lain; nilai dapat diubah setelah disalin (BR-39)." |

**Fitur: Edit Layanan (FR-03)**
* **User Story**: US-01, US-05.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Form Edit memuat ulang Data Layanan + seluruh baris tarif (2 section, prefilled). Mengubah multi-select Section A menyusun ulang matriks varian (BR-15); Kategori Tindakan dapat diubah (tetap single-select).
    * **AC 2**: Pengguna dapat menambah, mengubah nominal, atau **menonaktifkan** baris tarif (bukan hapus fisik bila pernah dipakai — BR-20).
    * **AC 3**: Validasi keunikan (BR-11) & minimal 1 tarif aktif (BR-23) tetap berlaku.
    * **AC 4**: Perubahan tercatat `updated_at`/`updated_by` + **`effective_date` (Tanggal Berlaku) diisi sejak Phase 1** (default hari ini, forward-dating); Phase 1 **tanpa backdate** (BR-27); (Phase 2: alur approval & riwayat versi tarif).

**Fitur: Aktif/Nonaktifkan Layanan (FR-04)**
* **User Story**: US-05.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Toggle status di Dashboard mengubah `status_aktif` tanpa menghapus data (BR-20).
    * **AC 2**: Menonaktifkan menampilkan konfirmasi; layanan Nonaktif tidak muncul untuk transaksi **baru**, transaksi lama tetap valid.
    * **AC 3**: Menonaktifkan Layanan **tidak** menonaktifkan/menghapus baris tarifnya; saat diaktifkan kembali, tarif pulih seperti semula (keputusan final, BR-20).

**Fitur: Tambah Komponen Tarif (FR-05) — layer Dashboard**
* **User Story**: US-02.
* **Prioritas**: P1.
* **Fase**: Phase 1.
* **Catatan**: Aksi **[+ Tambah Komponen Tarif]** diakses dari layer **Dashboard Tarif Layanan**, bukan dari form input Data Layanan/Tindakan. Komponen yang ditambah tersimpan sebagai default dan dimuat otomatis pada input Data Layanan/Tindakan berikutnya.
* **Acceptance Criteria**:
    * **AC 1 — Default**: Data Tarif menyediakan **daftar komponen tarif default (non-casemix)** sebagai pilihan awal (seed, BR-26). [PERLU KONFIRMASI daftar default final].
    * **AC 2 — Aksi [+ Tambah Komponen Tarif] (modal Dashboard)**: Dari Dashboard, pengguna menambah komponen tarif baru via form ringkas: **Nama Komponen** (wajib, unik), **Tipe Komponen** (wajib; *Jasa Medis* / *Non-Medis* / *BHP*), **Operator default (Profesi)** (dropdown Master Profesi A57 — **wajib bila Jasa Medis**; jadi operator **raw pertama** saat komponen dipakai, BR-41; kosong bila Non-Medis atau **BHP**), dan **Mapping COA** (`coa_id_pendapatan`, akun Pendapatan — **Phase 3**, opsional/non-blocking; **tidak berlaku untuk komponen BHP** — BR-42). Untuk komponen **BHP**, isian barang (Barang Farmasi + qty + harga satuan) dilakukan **saat mengisi Data Tarif** (raw per barang), bukan di form komponen. Lihat §8.3.1 (Section C).
    * **AC 3 — Simpan sebagai default (prospektif)**: Komponen tarif yang ditambah **disimpan sebagai default** (`is_default=true`) ke `tariff_component` sehingga **otomatis dimuat** pada form **Tambah Data Layanan/Tindakan berikutnya**. Penerapan bersifat **prospektif** — **layanan yang sudah ada dan form input yang sedang dibuka TIDAK berubah** (baris tarifnya = snapshot; histori dipertahankan seperti semula). Perubahan pada layanan lama hanya terjadi bila layanan tsb di-Edit manual setelah komponen tersedia (BR-40).
    * **AC 4 — Validasi**: Nama unik; Jasa Medis ⇒ Profesi wajib; Non-Medis ⇒ Profesi tidak diisi; **BHP ⇒ Profesi & Mapping COA tidak diisi** (BR-42). Mapping COA divalidasi hanya bila diisi (BR-31). Komponen yang sudah dipakai baris tarif tidak dapat dihapus fisik (hanya dinonaktifkan — BR-20).

**Fitur: Master Kategori Tindakan (FR-07)**
* **User Story**: US-08.
* **Prioritas**: P1.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan **17 Kategori Tindakan** (fixed/seed) sesuai BR-24; menjadi opsi single-select di header Data Layanan.
    * **AC 2**: Daftar 17 bersifat **fixed/read-only** — admin **tidak dapat** menambah/mengubah/menonaktifkan (mengikuti standar casemix).
    * **AC 3**: Satu layanan **wajib** memetakan **tepat 1** Kategori Tindakan (BR-33).

**Fitur: Mapping COA (FR-06) — Phase 3**
* **User Story**: US-07.
* **Prioritas**: P2.
* **Fase**: Phase 3.
* **Acceptance Criteria**:
    * **AC 1 — Mapping per komponen tarif**: Staf Keuangan memetakan tiap komponen tarif ke satu **akun COA** (`coa_id_pendapatan`) via lookup Master COA. Satu mapping per komponen tarif berlaku untuk semua layanan yang memakainya (BR-30).
    * **AC 2 — Kategori akun**: Dropdown hanya menampilkan akun **Pendapatan** aktif; kategori lain ditolak (BR-31).
    * **AC 3 — Validasi**: `coa_id_pendapatan` wajib akun **exists & aktif** di Master COA (BR-31).
    * **AC 4 — Visibilitas**: Dashboard menandai komponen tarif/layanan yang **belum dipetakan** COA (badge/filter).
    * **AC 5 — Konsumsi**: Endpoint `resolve` mengembalikan `coa_id_pendapatan` per komponen tarif untuk jurnal otomatis (BR-32).
    * **AC 6 — Non-blocking**: Ketidaklengkapan mapping COA **tidak** menghalangi CRUD tarif (Phase 1) maupun approval (Phase 2).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

Master eksternal (`unit` [tipe unit], `tipe_penjamin`, `kelas` [A58], `profesi` [A57], `coa_account` [Keuangan]) **hanya direferensikan** (FK) — didefinisikan di modulnya masing-masing. **Tipe Pelayanan** adalah enum tetap sistem (`RAWAT_INAP`, `RAWAT_JALAN`, `PENUNJANG`) untuk filter awal cakupan ketersediaan layanan; pilihan **Unit** disimpan eksplisit setelah difilter berdasarkan tipe unit yang sesuai (BR-37).

* **Table Name**: `casemix_component` (Master Kategori Tindakan — 17 fixed, BR-24)
    * `id`: UUID (Primary Key)
    * `nama_komponen`: VARCHAR (unik) — seed 17 kategori tindakan
    * `status_aktif`: Boolean (default true)

* **Table Name**: `service` (Data Layanan)
    * `id`: UUID (Primary Key)
    * `kode_layanan`: VARCHAR (unik global)
    * `nama_layanan`: VARCHAR(120) (**unik global** — BR-01)
    * `id_casemix`: UUID (FK → casemix_component) — **single-select header**, **NOT NULL / wajib** (BR-33)
    * `kelompok_layanan`, `kode_casemix`, `deskripsi`: VARCHAR/TEXT (opsional) — `kode_casemix` = kode INA-CBG bebas (opsional)
    * `status_aktif`: Boolean (default true)
    * `status_approval`: VARCHAR (default `APPROVED`) — *Phase 2*
    * `role_approver`: VARCHAR — *Phase 2*
    * `created_at/by`, `updated_at/by`: audit

* **Table Name**: `service_tipe_pelayanan` (junction **filter awal cakupan ketersediaan** — tipe pelayanan tempat layanan tersedia; **bukan** dimensi tarif, BR-37), `service_unit` (junction **unit aktif layanan**), `service_tipe_penjamin`, `service_kelas` (junction **cakupan varian tarif** — BR-15)
    * `id_layanan`: UUID (FK → service, ON DELETE CASCADE)
    * `tipe_pelayanan` (enum `RAWAT_INAP`/`RAWAT_JALAN`/`PENUNJANG`) / `id_unit` / `id_tipe_penjamin` / `id_kelas`: nilai cakupan terkait; `id_unit` FK ke Master Data Unit; `id_tipe_penjamin` dan `id_kelas` FK ke master terkait (`id_kelas` → A58)
    * Primary Key komposit: `service_tipe_pelayanan` = (`id_layanan`, `tipe_pelayanan`); `service_unit` = (`id_layanan`, `id_unit`); `service_tipe_penjamin`/`service_kelas` = (`id_layanan`, `id_<dimensi>`)
    * Validasi `service_unit.id_unit`: tipe unit harus sesuai minimal salah satu `tipe_pelayanan` layanan berdasarkan mapping BR-37.

* **Table Name**: `tariff_component` (Komponen Tarif — default sistem + ditambah dari Dashboard via FR-05, BR-26/BR-34)
    * `id`: UUID (Primary Key)
    * `nama_komponen`: VARCHAR (unik) — seed default non-casemix; dapat ditambah/ubah/nonaktif
    * `is_default`: Boolean (default true) — komponen dimuat otomatis pada Data Layanan baru; prospektif (BR-40)
    * `tipe_komponen`: VARCHAR/ENUM (`MEDIS` | `NON_MEDIS` | `BHP`) NOT NULL — BR-34/BR-42
    * `id_profesi`: UUID (FK → profesi, A57) — **wajib bila `MEDIS`**, NULL bila `NON_MEDIS`/`BHP` (BR-34)
    * `coa_id_pendapatan`: UUID (FK → coa_account) — *Phase 3* (BR-30/31); **N/A untuk `BHP`** (BR-42)
    * `status_aktif`: Boolean (default true)

* **Table Name**: `service_tariff` (Data Tarif / Baris Tarif)
    * `id`: UUID (Primary Key)
    * `id_layanan`: UUID (FK → service, ON DELETE CASCADE)
    * `id_komponen`: UUID (FK → tariff_component) — komponen tarif
    * `id_profesi`: UUID (FK → profesi, A57) — **operator** per **raw** (input; raw pertama = operator default komponen) — BR-41
    * `peran`: VARCHAR(60) — pembeda operator identik (mis. Operator/Asisten) — BR-29
    * `id_barang_farmasi`: UUID (FK → barang_farmasi, A4) — **wajib bila komponen `BHP`**, NULL selain BHP (BR-42)
    * `qty`: Integer (≥ 1) — jumlah barang, **wajib bila komponen `BHP`**; subtotal raw BHP = `qty × nominal` (harga satuan) — BR-42
    * `id_tipe_penjamin`, `id_kelas`: UUID (FK) — varian tarif, **system-set** (BR-15). *(Tipe Pelayanan dan Unit dikeluarkan — bukan dimensi tarif, BR-37)*
    * `tipe_nominal`: VARCHAR/ENUM (`NOMINAL` | `PERSEN`) NOT NULL default `NOMINAL` — `PERSEN` hanya komponen Non-Medis (BR-35)
    * `nominal`: Integer (Rp, ≥ 0) — dipakai bila `NOMINAL` (nullable bila `PERSEN`); untuk komponen **`BHP`** = **harga satuan** (manual), subtotal = `qty × nominal` (BR-42)
    * `persen`: NUMERIC(5,2) (0–100) — dipakai bila `PERSEN`; nilai efektif = `persen% × Σ nominal Jasa Medis` konteks (BR-35)
    * `status_aktif`: Boolean (default true)
    * `status_approval`: VARCHAR (default `APPROVED`) — *Phase 2*
    * `effective_date`: Date — **Phase 1** (Tanggal Berlaku; default hari ini; forward-dating; tanpa backdate — BR-27)
    * **Unique** (`id_layanan`,`id_komponen`,`id_profesi`,`peran`,`id_barang_farmasi`,`id_tipe_penjamin`,`id_kelas`) — BR-11/BR-42

> **Catatan implementasi**: (a) Keunikan NULL BR-11 → `UNIQUE NULLS NOT DISTINCT` (PG ≥15) atau unique index atas `COALESCE(col, sentinel)`. (b) Subset varian BR-15 (`service_tariff.id_* ∈ service_*`) ditegakkan via **trigger**/aplikasi, bukan FK biasa. (c) Kolom Phase 2/3 disiapkan namun belum aktif. (d) Soft-inactivate BR-20: hapus fisik dilarang untuk data terpakai transaksi. (e) `service.id_casemix` **NOT NULL** — tiap layanan wajib memetakan 1 Kategori Tindakan (BR-33); daftar 17 Kategori Tindakan **fixed/read-only** (tak diubah admin). (f) `tipe_nominal='PERSEN'` hanya sah untuk komponen Non-Medis — ditegakkan trigger/aplikasi (butuh join `tariff_component.tipe_komponen`); nilai efektif % dihitung saat resolusi & dibulatkan **ke atas (ceiling)** ke Rupiah bulat (BR-35/BR-36). (g) Komponen **`BHP`**: `id_profesi` & `coa_id_pendapatan` NULL/N-A; `id_barang_farmasi`+`qty` wajib; `tipe_nominal=NOMINAL` (harga satuan manual); subtotal raw = `qty × nominal` (BR-42).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/services` | List layanan + ringkasan variasi (dashboard). |
| GET | `/api/v1/services/{id}` | Detail layanan + Kategori Tindakan + seluruh baris tarif. |
| POST | `/api/v1/services` | Create layanan (termasuk `id_casemix`) + baris tarif (atomik, 2 section). |
| PUT | `/api/v1/services/{id}` | Update Data Layanan + baris tarif. |
| PATCH | `/api/v1/services/{id}/status` | Toggle Aktif/Nonaktif. |
| GET | `/api/v1/services/{id}/resolve?penjamin=&kelas=&tipe_pelayanan=&unit_id=` | Resolusi tarif per konteks **Penjamin/Kelas** (Billing, BR-13): hitung komponen Jasa Medis dahulu, lalu komponen Non-Medis (nominal & **%** atas basis Jasa Medis, BR-35), kembalikan **total Rupiah** (BR-36) — termasuk Σ komponen **BHP** (`qty × harga satuan`, BR-42). Param `tipe_pelayanan` dan `unit_id` **hanya** untuk cek ketersediaan layanan (BR-37), tidak memengaruhi harga; **[Phase 3]** menyertakan `coa_id_pendapatan` per komponen tarif. |
| GET | `/api/v1/casemix-components` | List 17 Kategori Tindakan (opsi single-select header). |
| GET | `/api/v1/units?tipe_pelayanan=` | List Unit aktif yang terfilter berdasarkan Tipe Pelayanan terpilih (BR-37): RI → Bangsal; RJ → Darurat/Poli; Penunjang → Penunjang Tindakan/Pemeriksaan/Terapi. Mendukung multi-value untuk multi-select. |
| GET | `/api/v1/tariff-components?default=true&active=true` | List master komponen tarif; form Data Layanan **baru** memuat `is_default=true & aktif` (BR-40). |
| POST/PATCH | `/api/v1/tariff-components` | Kelola komponen tarif dari layer Dashboard (FR-05): body `nama_komponen`, `tipe_komponen` (MEDIS/NON_MEDIS/BHP), `id_profesi` (wajib bila MEDIS); **[Phase 3]** set `coa_id_pendapatan` (**N/A bila BHP**, BR-42). Komponen baru disimpan `is_default=true` dan muncul pada input Data Layanan/Tindakan berikutnya. |
| GET | `/api/v1/profesi?active=true` | Lookup Master Profesi (A57) untuk dropdown Profesi komponen tarif Medis. |
| GET | `/api/v1/barang-farmasi?active=true` | Lookup **Master Data Barang Farmasi (A4)** untuk dropdown raw komponen **BHP** (`id_barang_farmasi`, BR-42). |
| GET | `/api/v1/coa-accounts?category=pendapatan&active=true` | **[Phase 3]** Lookup akun COA Pendapatan (Master COA) untuk dropdown mapping. |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

*Section A — Data Layanan (`service`)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| kode_layanan | Kode Layanan | String | Ya | Unik global | auto | Kode ringkas. |
| nama_layanan | Nama Layanan | String | Ya | Max 120; **unik global** | input | BR-01. |
| id_casemix | Kategori Tindakan | UUID (FK) | **Ya** | exists; **single-select** | `casemix_component` (17, fixed) | Pemetaan klaim; wajib 1 per layanan (BR-33). |
| kelompok_layanan | Kelompok Layanan | String/Enum | Tidak | — | input | Mis. Tindakan/Konsultasi/Penunjang. |
| kode_casemix | Kode Casemix (INA-CBG) | String | Tidak | — | input | Kode INA-CBG bebas (opsional). |
| deskripsi | Deskripsi | Text | Tidak | Max 500 | input | — |
| tipe_pelayanan_list | Tipe Pelayanan (cakupan ketersediaan) | Array<Enum> | **Ya** | nilai ∈ `RAWAT_INAP`/`RAWAT_JALAN`/`PENUNJANG`; minimal 1 | Enum sistem (**multi-select**) | Junction `service_tipe_pelayanan`. **Bukan dimensi tarif** (BR-37); wajib dipilih sebelum Unit. |
| unit_ids | Unit | Array<UUID FK> | **Ya** | tiap exists, aktif, dan tipe unit sesuai mapping Tipe Pelayanan terpilih | Master Data Unit (**multi-select terfilter**) | Junction `service_unit`. Field Unit disabled/kosong sampai Tipe Pelayanan dipilih. |
| tipe_penjamin_ids | Tipe Penjamin (cakupan) | Array<UUID FK> | Tidak | tiap exists | Master Tipe Penjamin (**multi-select**) | Junction `service_tipe_penjamin`. Kosong = semua penjamin. |
| kelas_list | Kelas (cakupan) | Array<UUID FK> | Tidak | tiap exists | Master Data Kelas A58 (**multi-select**) | Junction `service_kelas` (BR-28). Kosong = semua kelas. |
| status_aktif | — | Boolean | Ya (sistem) | default `true` | sistem | Tidak diinput; toggle di Dashboard (FR-04). |
| status_approval | — | Enum | Ya (sistem) | default `APPROVED` | sistem | Disiapkan Phase 2. |
| role_approver | — | String | Tidak | — | sistem | Disiapkan Phase 2. |

*Section B — Data Tarif / Baris Tarif (`service_tariff`)* — 1 baris = **1 raw (operator × varian)**; tiap komponen Medis ≥1 raw operator (BR-41); varian **auto-generate** (BR-15); tarif komponen = Σ raw

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| id_komponen | Komponen Tarif | UUID (FK) | Ya | exists | `tariff_component` (default + tambah, BR-26) | Bukan casemix. |
| id_profesi | Operator (Profesi) | UUID (FK) | Ya per raw (komponen Medis) | exists di A57 | **input per raw** (Master Profesi A57) | Multi-Tagging operator; raw pertama = operator default komponen (BR-34/BR-41). |
| peran | Peran | String | Tidak | Max 60; wajib beda bila profesi & varian sama | input | Pembeda profesi identik (BR-29). |
| id_barang_farmasi | Barang Farmasi | UUID (FK) | Ya per raw (komponen BHP) | exists di A4 | Master Data Barang Farmasi A4 (lookup) | Hanya komponen BHP; tiap raw = 1 barang (BR-42). |
| qty | Qty (Jumlah) | Integer | Ya per raw (komponen BHP) | ≥ 1 | input per raw BHP | Subtotal raw = qty × harga satuan (BR-42). |
| id_tipe_penjamin | Penjamin (varian) | UUID (FK) | Tidak | ∈ `service.tipe_penjamin_ids` | **sistem** (auto-expand) | Tidak dipilih di Data Tarif. Tipe Pelayanan dan Unit tidak jadi varian (BR-37). |
| id_kelas | Kelas (varian) | UUID (FK) | Tidak | ∈ `service.kelas_list` (BR-28) | **sistem** (auto-expand) | Tidak dipilih di Data Tarif. |
| tipe_nominal | Tipe Nominal | Enum | Ya | `NOMINAL`/`PERSEN`; `PERSEN` hanya komponen Non-Medis (BHP: NOMINAL saja) | pilih (default NOMINAL) | BR-35/BR-42. |
| nominal | Nominal / Harga Satuan | Integer (Rp) | Ya bila `NOMINAL` (min 1 sel/layanan) | ≥ 0 | input per sel varian | Min 1 sel terisi (BR-23). Komponen **BHP**: = **harga satuan** manual, subtotal = qty × nominal (BR-42). |
| persen | Persentase (%) | Numeric(5,2) | Ya bila `PERSEN` | 0–100 | input per sel varian | Basis = Σ Jasa Medis konteks (BR-35). |
| status_aktif | — | Boolean | Ya (sistem) | default `true` | sistem | Nonaktif diabaikan saat resolusi (BR-14). |
| effective_date | Tanggal Berlaku | Date | Tidak | ≥ hari ini (tanpa backdate) | input (default hari ini) | Phase 1; forward-dating untuk penjadwalan tarif (BR-27). |

*Section C — Form [+ Tambah Komponen Tarif] (`tariff_component`)* — aksi dari layer Dashboard (FR-05); tidak muncul di form input Data Layanan/Tindakan; default sistem + dapat ditambah (BR-26/BR-34)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| nama_komponen | Nama Komponen | String | Ya | Unik | input | Mis. Jasa Operator, Jasa Sarana. |
| tipe_komponen | Tipe Komponen | Enum | Ya | `Jasa Medis` / `Non-Medis` / `BHP` | pilih | Menentukan perlu-tidaknya profesi & COA; BHP pakai Barang Farmasi (BR-34/BR-42). |
| id_profesi | Operator default (Profesi) | UUID (FK) | **Ya bila Medis** | exists; wajib bila `Jasa Medis`, kosong bila Non-Medis/BHP | Master Profesi A57 | Operator raw pertama komponen ini; operator lain = raw (BR-34/BR-41). |
| coa_id_pendapatan | Mapping COA | UUID (FK) | Tidak (Phase 3; **N/A bila BHP**) | akun exists, aktif, kategori Pendapatan (bila diisi) | Master COA | Phase 3; non-blocking (BR-30/31). BHP tanpa COA (BR-42). |
| status_aktif | Status | Boolean | Ya (sistem) | default `true` | sistem | Nonaktif = tak muncul saat pilih komponen tarif. |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View / Dashboard)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kode | `kode_layanan` | teks | sort | — |
| Nama Layanan | `nama_layanan` | teks | search, sort | — |
| Tipe Pelayanan (ketersediaan) | daftar tipe pelayanan (join `service_tipe_pelayanan`) | teks/chips | filter | RI/RJ/Penunjang tempat layanan tersedia (BR-37). |
| Unit | daftar unit (join `service_unit`) | teks/chips/ringkasan jumlah | filter | Unit aktif yang dipilih setelah terfilter oleh Tipe Pelayanan. |
| Kategori Tindakan | `id_casemix` (join nama) | teks/badge | filter | Wajib 1 per layanan (BR-33). |
| Komponen Tarif | count komponen tarif dipakai | angka (mis. "3 komponen") | — | Dari baris tarif aktif. |
| Varian Tarif | count baris tarif aktif | angka (mis. "12 varian") | sort | Dihitung dari baris **aktif** (BR-14). |
| Total Rupiah (Rentang) | total per konteks (Σ Jasa Medis + Non-Medis nominal & %), min–max antar-varian | "Rp150.000 – Rp450.000" | sort | Termasuk hasil % (BR-35); resolusi BR-13/BR-36. |
| Variasi | distinct dimensi | badge 🏷Operator 💳Penjamin 🛏Kelas | filter | 🏷Operator = multi raw (BR-41). Hanya bila distinct > 1 (BR-25). Tipe Pelayanan dan Unit = ketersediaan, bukan varian (BR-37). |
| Status COA | kelengkapan `coa_id_pendapatan` | badge terpetakan/belum | filter | **[Phase 3]** (FR-06 AC4). |
| Status | `status_aktif` | toggle | filter | Aktif/Nonaktif (FR-04). |
| Aksi | — | Detail/Edit · (⋯) | — | — |

**Business Rules**
* **BR-01**: `nama_layanan` **unik global**; duplikat ditolak. Cakupan ketersediaan layanan memakai **Tipe Pelayanan + Unit** (BR-37), bukan pemisahan nama per lokasi.
* **BR-10**: `service_tariff.id_profesi` = **operator** yang diinput **per raw** untuk komponen `MEDIS` (dari Master Profesi A57); komponen `NON_MEDIS` tanpa operator (`id_profesi` NULL). Lihat raw & akumulasi di BR-41.
* **BR-11**: Kombinasi (`id_layanan`,`id_komponen`,`id_profesi`,`peran`,`id_barang_farmasi`,`id_tipe_penjamin`,`id_kelas`) **UNIK**. NULL dihitung sebagai nilai "umum". `peran` memungkinkan >1 tarif untuk profesi identik pada varian sama (BR-29). *(Tipe Pelayanan dan Unit tidak masuk keunikan baris tarif — bukan dimensi tarif, BR-37.)*
* **BR-12**: Field syarat (`id_tipe_penjamin`,`id_kelas`) yang kosong berarti **berlaku umum** (wildcard).
* **BR-13 (Resolusi tarif — presedens) [DISETUJUI]**: Untuk tiap **raw (operator)** dalam sebuah komponen, sistem memilih varian **paling spesifik** yang cocok — syarat eksplisit didahulukan atas wildcard/umum; bila seri, **tie-break = nominal tertinggi**. **Subtotal komponen = akumulasi (Σ) seluruh raw operator aktif** komponen tsb (BR-41) — bukan pilih salah satu. **Urutan hitung total konteks**: (1) jumlahkan seluruh komponen **Jasa Medis** (Σ raw per komponen) → basis; (2) tambahkan komponen **Non-Medis** — nominal Rupiah apa adanya, sedangkan komponen ber-**`PERSEN`** = `persen% × basis` (BR-35); (3) tambahkan komponen **BHP** — Σ per raw `qty × harga satuan` (BR-42). Hanya baris dengan **`effective_date` ≤ tanggal transaksi** yang dipertimbangkan; baris ber-tanggal-maju belum berlaku (BR-27).
* **BR-14**: Baris tarif `status_aktif=false` diabaikan saat resolusi & tidak dihitung pada rentang Dashboard.
* **BR-15 (Varian auto-generate)**: Dimensi tarif **Tipe Penjamin & Kelas** ditetapkan multi-select di Data Layanan (`tipe_penjamin_ids`/`kelas_list`). Data Tarif tidak menyediakan input dimensi ini; sistem membentuk kombinasi (kartesian; dimensi kosong = wildcard). `id_tipe_penjamin`/`id_kelas` baris tarif di-set sistem, selalu ∈ multi-select Section A. **Tipe Pelayanan dan Unit tidak** membentuk varian tarif (BR-37).
* **BR-20 (Soft-inactivate)**: Layanan/komponen tarif/baris tarif yang pernah dipakai transaksi tidak boleh dihapus fisik — hanya dinonaktifkan. Menonaktifkan Layanan **tidak** menyentuh baris tarifnya (tetap tersimpan; pulih saat diaktifkan).
* **BR-23**: Layanan wajib memiliki **≥ 1 baris tarif aktif** untuk berstatus Aktif; pada matriks varian minimal **1 sel** wajib diisi nominal (sel kosong tidak membuat baris).
* **BR-24 (Master Kategori Tindakan — 17 fixed)**: Master Kategori Tindakan berisi **17 kategori tindakan** — diturunkan dari daftar Kategori Tindakan yang berlaku, kecuali Obat, Obat Kronis, Obat Kemoterapi, BMHP, serta ditambah kategori tindakan Gizi, Patologi Anatomi, dan Transfusi Darah. Dipakai sebagai opsi **single-select** di header Data Layanan (`service.id_casemix`) untuk pemetaan klaim. Daftar 17 Kategori Tindakan:
    1. Prosedur Non-Bedah
    2. Prosedur Bedah
    3. Konsultasi
    4. Tenaga Ahli
    5. Keperawatan
    6. Penunjang
    7. Radiologi
    8. Laboratorium
    9. Pelayanan Darah
    10. Rehabilitasi Medik
    11. Kamar Akomodasi
    12. Rawat Intensif
    13. Alat Kesehatan
    14. Sewa Alat
    15. Gizi
    16. Patologi Anatomi
    17. Transfusi Darah
* **BR-25 (Informatif Dashboard)**: Penanda variasi dihitung dari nilai distinct baris tarif aktif; badge hanya tampil bila distinct > 1.
* **BR-26 (Komponen Tarif — default sistem + dapat ditambah dari Dashboard)**: Data Tarif diuraikan per **Komponen Tarif** (master `tariff_component`). Sistem menyediakan **daftar default (non-casemix)**; pengguna dapat menambah/ubah/nonaktif komponen dari layer **Dashboard** (form: Nama, Tipe, Profesi bila Medis, Mapping COA — BR-34), bukan dari form input Data Layanan/Tindakan. Layanan wajib memiliki **≥ 1 komponen tarif** dengan tarif aktif. Komponen Tarif **terpisah** dari 17 Kategori Tindakan (yang dipetakan sekali di header). Daftar default (seed) **[DISETUJUI]** — di-seed via `seeds/10_a10_tariff_component.sql` (§8.4):
    1. Jasa Sarana — Non-Medis
    2. Jasa Pelayanan — Medis (operator default: **Dokter** — dapat disesuaikan per RS)
    3. Bahan Habis Pakai (BHP) — **BHP** (raw = Barang Farmasi A4 + qty + harga satuan manual, BR-42)
    4. Akomodasi — Non-Medis
* **BR-27 (Effective date Phase 1 — tanpa backdate)**: Tiap baris tarif memiliki **`effective_date` (Tanggal Berlaku)** yang diisi sejak **Phase 1** — default = tanggal simpan; dapat **dijadwalkan maju (forward-dating, ≥ hari ini)** untuk perubahan tarif terjadwal. **Backdate (tanggal lampau) tidak diperbolehkan** di Phase 1. Resolusi Billing hanya memakai baris dengan `effective_date` ≤ tanggal transaksi (BR-13). **Riwayat versi tarif & approval** tetap **Phase 2**.
* **BR-28 (Sumber Kelas = A58)**: `id_kelas`/`kelas_list` merujuk **Master Data Kelas (A58)** (FK/lookup), bukan enum tetap.
* **BR-29 (Peran pembeda profesi identik)**: Satu komponen tarif boleh >1 baris tarif untuk profesi sama pada varian sama, dibedakan `peran`; dua baris profesi+varian sama wajib beda `peran`.
* **BR-30 (Mapping COA per komponen tarif) [Phase 3]**: Akun pendapatan ditentukan per komponen tarif (`tariff_component.coa_id_pendapatan`); semua baris tarif komponen tarif sama memakai akun sama. Komponen tarif tanpa mapping ditandai di Dashboard. Komponen bertipe **BHP** **tidak** memiliki mapping COA (dikecualikan — BR-42).
* **BR-31 (Validasi akun COA) [Phase 3]**: `coa_id_pendapatan` wajib akun exists, aktif, kategori **Pendapatan** di Master COA; kategori lain/nonaktif ditolak.
* **BR-32 (Konsumsi posting jurnal) [Phase 3]**: Modul menyediakan pemetaan COA; posting jurnal dilakukan modul Keuangan/Billing. `resolve` mengembalikan `coa_id_pendapatan` per komponen tarif.
* **BR-33 (Kategori Tindakan single-select per layanan)**: Tiap layanan **wajib** memetakan **tepat 1** Kategori Tindakan (`service.id_casemix`, NOT NULL) via single-select di header Data Layanan, untuk kesiapan klaim BPJS/INA-CBG. Daftar **17 Kategori Tindakan bersifat fixed/read-only** — admin **tidak dapat** menambah/mengubah/menonaktifkan (mengikuti standar casemix).
* **BR-34 (Tipe Komponen Tarif — Medis/Non-Medis)**: Tiap komponen tarif (`tariff_component`) wajib bertipe **`MEDIS`**, **`NON_MEDIS`**, atau **`BHP`** (Bahan Habis Pakai — tanpa operator & tanpa COA; raw = Barang Farmasi A4 + qty + harga satuan manual, BR-42). Komponen `MEDIS` menetapkan **operator default** (`id_profesi`, Master Profesi A57) — dipakai memprefill **raw pertama** saat komponen dipakai layanan; komponen `NON_MEDIS` tidak memiliki operator (`id_profesi` NULL). Operator tambahan ditambahkan sebagai **raw** per layanan (BR-41); pembedaan operator identik via `peran` (BR-29). Field **Mapping COA** (`coa_id_pendapatan`, Phase 3) diisi per komponen tarif — opsional & non-blocking (BR-30/31).
* **BR-35 (Tarif persentase untuk komponen Non-Medis)**: Baris tarif komponen **Non-Medis** dapat bertipe **`NOMINAL`** (Rupiah) atau **`PERSEN`**. Bila `PERSEN`, nilai efektif = `persen% × Σ nominal komponen Jasa Medis` pada **varian/konteks yang sama** (mis. Jasa Sarana = 40% jasa medis), **dibulatkan ke atas (ceiling)** ke **Rupiah bulat (tanpa desimal)**. `persen` ∈ 0–100. Komponen **Jasa Medis** hanya menerima `NOMINAL`. Komponen **BHP** juga hanya `NOMINAL` (harga satuan manual) dan **tidak** menjadi basis persentase (basis = Jasa Medis saja) — BR-42. Bila basis Jasa Medis = 0 (tidak ada komponen medis pada konteks), komponen `PERSEN` = Rp0. Pilihan **Rupiah/%** disediakan sebagai **toggle di titik input** (per sel) — pengguna bebas mengisi sel Non-Medis sebagai **nominal Rupiah** *atau* **persentase**, dan dapat berpindah kapan saja (nilai efektif disimpan konsisten dengan `tipe_nominal` baris).
* **BR-36 (Total Rupiah layanan)**: Sistem menghitung **total Rupiah** layanan per varian/konteks = Σ Jasa Medis + Σ Non-Medis (nominal & hasil %, BR-35) + Σ BHP (`qty × harga satuan`, BR-42), dari baris tarif **aktif** (BR-14). Total ditampilkan **live di header form input** saat entri/edit dan sebagai **kolom Total/Rentang di Dashboard** (min–max antar-varian).
* **BR-37 (Tipe Pelayanan → Unit = cakupan ketersediaan, BUKAN dimensi tarif)**: **Tipe Pelayanan** yang dipilih multi-select di header (Section A, `tipe_pelayanan_list` → `service_tipe_pelayanan`) wajib dipilih **sebelum** field Unit. Nilai yang tersedia adalah **RI/Rawat Inap**, **RJ/Rawat Jalan**, dan **Penunjang**. Setelah Tipe Pelayanan dipilih, field **Unit** (`unit_ids` → `service_unit`) menampilkan hanya unit aktif yang tipe unitnya sesuai mapping berikut:
    * `RAWAT_INAP` / RI → unit bertipe **Bangsal**.
    * `RAWAT_JALAN` / RJ → unit bertipe **Darurat** dan **Poli**.
    * `PENUNJANG` / Penunjang → unit bertipe **Penunjang Tindakan**, **Penunjang Pemeriksaan**, dan/atau **Penunjang Terapi**.
  Dengan mapping ini, tindakan dianggap aktif hanya pada Unit yang dipilih user dari hasil filter tersebut. Tipe Pelayanan dan Unit **tidak** membentuk varian tarif, **tidak** masuk matriks Data Tarif, dan **tidak** masuk keunikan baris tarif (BR-11). Tarif **tidak berbeda** berdasarkan Tipe Pelayanan maupun Unit. Jika Tipe Pelayanan berubah, sistem harus membersihkan pilihan Unit yang tidak lagi sesuai. Billing memakai Tipe Pelayanan + Unit untuk memeriksa ketersediaan, bukan menentukan harga.
* **BR-38 (Mode pengisian nominal — seragam / per-sel)**: Saat mengisi tarif suatu komponen, pengguna memilih mode **Seragam** (satu nilai — nominal Rupiah atau persen — diterapkan ke **seluruh sel** matriks varian Tipe Penjamin × Kelas) atau **Per-sel** (nilai tiap sel diisi berbeda). Mode Seragam hanya mempercepat pengisian; nilai per sel tetap dapat di-**override** setelahnya. Konsistensi tipe (nominal/persen, BR-35) & keunikan (BR-11) tetap berlaku.
* **BR-39 (Copy tarif antar-komponen)**: Nilai tarif dari komponen tarif yang **sudah diisi** dapat **disalin** ke komponen tarif lain pada **layanan yang sama** (utilitas produktivitas). Penyalinan mengikuti sel varian yang bersesuaian; hasil salinan **dapat diubah**. Bila tipe komponen tujuan berbeda (mis. Non-Medis %), nilai tersalin sebagai nominal awal dan pengguna menyesuaikan tipe/nilai (BR-35).
* **BR-41 (Raw / Multi-Tagging operator & akumulasi)**: Tiap **Komponen Tarif** pada suatu layanan dapat memiliki **≥1 raw (baris operator)**. Tiap raw = **1 Operator** (`id_profesi` A57 + `peran` opsional) dengan **tarif tersendiri** per varian (Penjamin × Kelas). Komponen `MEDIS` **wajib ≥1 raw** — **raw pertama = operator default** komponen (BR-34, terisi otomatis); **penambahan raw operator bersifat OPSIONAL** ([+ Tambah Raw/Operator]). Komponen `NON_MEDIS` = 1 raw tanpa operator. **Tarif/subtotal komponen (per varian) = akumulasi (Σ) seluruh raw aktif** — contoh: Jasa Medis dengan raw Dokter Bedah Rp10.000 + Asisten Dokter Bedah Rp8.000 = **Rp18.000**. Tiap operator boleh bertarif berbeda → dasar **Laporan Jasa Medis** per operator. **Setting raw ini disediakan/dikonsumsi fitur Tindakan & BHP** (operator per komponen mengikuti setting di modul ini). Keunikan raw = (`id_layanan`,`id_komponen`,`id_profesi`,`peran`,`id_barang_farmasi`,`id_tipe_penjamin`,`id_kelas`) — BR-11.
* **BR-40 (Komponen Tarif default & prospektif)**: Komponen tarif yang **ditambah** via tombol **[+ Tambah Komponen Tarif]** pada layer Dashboard disimpan `is_default=true` → **otomatis dimuat** pada form **Tambah Data Layanan/Tindakan berikutnya** (komponen `is_default & status_aktif`). Tombol ini **tidak tersedia** di dalam form input Data Layanan/Tindakan. Perubahan daftar default berlaku **prospektif** — **hanya untuk form baru setelah komponen dibuat**. **Layanan existing dan form yang sedang dibuka tidak berubah**: baris tarif (`service_tariff`) adalah **snapshot** komponen yang dipilih saat itu; histori tetap dipertahankan. Layanan lama hanya berubah bila **di-Edit manual** setelah komponen tersedia.
* **BR-42 (Komponen Tarif BHP — Bahan Habis Pakai)**: Komponen tarif dapat bertipe **`BHP`** (selain `MEDIS`/`NON_MEDIS`). Komponen `BHP` **tanpa operator/profesi** (`id_profesi` NULL) dan **tanpa Mapping COA** (`coa_id_pendapatan` **N/A** — biaya bahan ditelusuri via master Barang Farmasi, bukan akun pendapatan). Pada Data Tarif, komponen `BHP` memiliki **≥1 raw**; tiap raw = **1 Barang Farmasi** (`id_barang_farmasi`, lookup **Master Data Barang Farmasi A4**) + **jumlah `qty`** (≥1, integer) + **harga satuan** (`nominal`, **input manual**, `tipe_nominal=NOMINAL`; **`PERSEN` tidak berlaku**). **Subtotal raw = `qty × nominal`**; **subtotal komponen BHP = Σ raw** per varian (BR-41). Total layanan (BR-36) & resolusi (BR-13) menambahkan Σ komponen BHP **setelah** Jasa Medis & Non-Medis; **BHP bukan** basis persentase Non-Medis (BR-35). Keunikan raw BHP dibedakan `id_barang_farmasi` (BR-11). Master Barang Farmasi hanya direferensikan (FK) — dikelola di modul A4.

### 8.4 Data Seeder (Seed Data)

Seed data disediakan sebagai **skrip SQL PostgreSQL idempotent** di folder `seeds/` (repo) — mencakup A10 beserta **seluruh master data yang direferensikannya**. Skema tiap file diturunkan dari §8.1 PRD masing-masing; urutan eksekusi mengikuti dependensi FK.

**Urutan & cakupan**

| # | File | Modul | Tabel | Peran |
|---|------|-------|-------|-------|
| 01 | `02_prasyarat_a33_kategori_barang.sql` | A33 | `item_categories` | Prasyarat FK barang farmasi (grup FARMASI) |
| 02 | `03_prasyarat_a22_satuan.sql` | A22 | `master_satuan` | Prasyarat FK satuan barang farmasi |
| 03 | `04_a57_profesi.sql` | A57 | `professions` | Operator komponen tarif Medis |
| 04 | `05_a58_kelas.sql` | A58 | `service_classes` | Dimensi varian tarif (Kelas) |
| 05 | `06_a20_tipe_penjamin.sql` | A20 | `tipe_penjamin` | Dimensi varian tarif (Penjamin) |
| 06 | `08_a4_barang_farmasi.sql` | A4 | `master_pharmacy_item` | Raw komponen BHP (BR-42) |
| 07 | `09_a10_casemix_component.sql` | **A10** | `casemix_component` | **17 kategori tindakan fixed (BR-24)** |
| 08 | `10_a10_tariff_component.sql` | **A10** | `tariff_component` | Komponen tarif default (BR-26) |
| 09 | `11_a10_sample_service_tariff.sql` | **A10** | `service` + junction + `service_tariff` | Sample demo (dev/staging saja) |

Runner: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seeds/run_all.sql` (PostgreSQL 13+, butuh `gen_random_uuid()`).

**Tiga tingkat data**
* **WAJIB (reference)** — file 07 (17 kategori tindakan). App tak jalan tanpa ini (`service.id_casemix` NOT NULL, fixed/read-only — BR-24/BR-33). Jalankan di **semua** environment termasuk produksi.
* **DEFAULT (konfigurasi)** — file 08 (komponen tarif default, BR-26). Karena penerapan default bersifat prospektif (BR-40), seed yang benar sejak awal menghindari koreksi massal. Umumnya dipakai di produksi.
* **SAMPLE (demo)** — file 09 + baris contoh pada 01–06. **JANGAN di produksi**; untuk uji end-to-end (Σ operator BR-41, % Non-Medis BR-35, BHP BR-42, resolusi BR-13).

**Idempotency** — pola *insert-if-missing* (`WHERE NOT EXISTS` / guard `DO`), bukan `ON CONFLICT` — aman dijalankan ulang, tak bergantung nama constraint, dan menghormati partial-unique (`WHERE deleted_at IS NULL`) di A57/A58. Re-run hanya menambah baris yang belum ada (tidak meng-update baris eksisting).

**Inkonsistensi tipe FK lintas-PRD (perlu dibereskan saat implementasi DB)** — seeder tetap jalan karena memakai subselect natural-key:
1. `tipe_penjamin.id`: A20 mendefinisikan **bigint auto-increment**, sedangkan A10 (`service_tariff.id_tipe_penjamin`) mengharap **UUID FK** → samakan tipe PK penjamin.
2. `master_satuan` PK: A22 memakai **`kode` VARCHAR (`SAT###`)**, sedangkan A4 (`dosage_unit_id`/`smallest_unit_id`) mendeklarasikan **UUID FK** → file 08 me-resolve ke `kode`; ganti ke `id` bila A22 diberi PK UUID.

**Catatan asumsi** — nama/kode Instalasi, item BHP + harga (`hna`), satuan tambahan, dan VVIP bersifat `[ASUMSI]` (tak ditetapkan PRD sumbernya); ganti dengan data RS asli sebelum produksi. Detail lengkap: `seeds/README.md`.

## 9. Workflow / BPMN Interpretation

Modul **belum memiliki BPMN sendiri** (cluster Control Panel / master data). Alur berikut **diturunkan [ASUMSI]** dari pola master data sejenis.

**Alur To-Be — Tambah Data Layanan (Phase 1)**
1. **Aktor: Petugas Casemix** membuka Dashboard → klik **[+ Tambah Data Layanan]**.
2. **Section A — Data Layanan**: isi Nama, Kode, **Kategori Tindakan (single-select, 1 dari 17 — BR-33)**, Kelompok, (Kode Casemix/INA-CBG), Deskripsi, pilih **multi-select Tipe Pelayanan** terlebih dahulu (RI/RJ/Penunjang — BR-37), lalu pilih **multi-select Unit** dari daftar yang terfilter sesuai mapping Tipe Pelayanan. Setelah itu pilih **multi-select** cakupan varian tarif Tipe Penjamin/Kelas (opsional; kosong = umum) — BR-15. Sistem set `status_aktif=true`, `status_approval=APPROVED`.
3. **Section B — Data Tarif**: petugas menguraikan harga per **Komponen Tarif** dari master komponen tarif default (`is_default & aktif`) yang sudah tersedia dari Dashboard (BR-26/BR-40; wajib ≥1). Form input Data Layanan/Tindakan tidak menyediakan tombol **[+ Tambah Komponen Tarif]**; bila perlu komponen baru, user membuatnya dari Dashboard dan komponen tersebut menjadi default untuk input berikutnya. Untuk tiap komponen tarif, sistem **membentuk matriks kombinasi varian** dari multi-select Section A. Untuk komponen Medis, petugas menambah **raw/operator** ([+ Tambah Raw]) — tiap raw = 1 Operator (profesi A57 + Peran opsional, BR-29) dengan **tarif sendiri**; raw pertama = operator default (BR-34). **Subtotal komponen = Σ raw** (akumulasi, BR-41). Lalu **isi Nominal** per sel varian (Penjamin × Kelas; Tipe Pelayanan dan Unit tidak jadi varian — BR-37). Untuk komponen **Non-Medis**, nominal dapat diisi **Rupiah** atau **persentase (%)** dari total Jasa Medis (BR-35). Untuk komponen **BHP**, tiap raw memilih **Barang Farmasi** (Master A4) lalu isi **qty** & **harga satuan** manual; subtotal raw = qty × harga, subtotal komponen = Σ raw (BR-42). Pengisian dapat **Seragam** (1 nilai untuk semua sel) atau **Per-sel** (BR-38), dan tarif dapat **disalin (copy)** dari komponen lain yang sudah diisi (BR-39). Header menampilkan **total Rupiah live** per varian (BR-36).
4. **Gateway validasi**: Tipe Pelayanan minimal 1? Unit minimal 1 dan sesuai mapping BR-37? unik BR-11? ≥1 sel/tarif aktif BR-23? nominal ≥0 / persen 0–100 (dan % hanya Non-Medis, BR-35)? → bila gagal, error inline (§7.1 wording).
5. **Simpan (atomik)**: Data Layanan (termasuk `id_casemix`) + seluruh baris tarif ditulis dalam satu transaksi → kembali ke Dashboard; ringkasan variasi & **total Rupiah** otomatis ter-hitung.

**Alur Edit / Aktif-Nonaktif**
* **Edit**: buka layanan → ubah section A/B (mengubah multi-select menyusun ulang matriks varian; Kategori Tindakan dapat diubah) → simpan (validasi sama; tanpa backdate BR-27).
* **Toggle Status**: Dashboard → toggle → konfirmasi → `status_aktif` berubah (BR-20; tarif tidak disentuh).

**Alur Tambah Komponen Tarif**
1. Dari Dashboard Tarif Layanan, user klik **[+ Tambah Komponen Tarif]**.
2. Sistem membuka modal FR-05 untuk input Nama Komponen, Tipe Komponen, Profesi default bila Medis, dan Mapping COA bila tersedia.
3. Saat disimpan, komponen masuk ke `tariff_component` dengan `is_default=true` dan `status_aktif=true`.
4. Komponen baru otomatis muncul sebagai default pada form input Data Layanan/Tindakan berikutnya. Form yang sedang dibuka dan layanan existing tidak berubah sampai user membuka form baru atau melakukan edit manual.

**Alur Konsumsi (Billing — di luar scope, referensi)**
* Saat transaksi, Billing memanggil `resolve` dengan konteks (tipe pelayanan, unit, penjamin, kelas); sistem memeriksa ketersediaan berdasarkan Tipe Pelayanan + Unit lalu menerapkan **BR-13** (paling spesifik menang; tie-break nominal tertinggi) untuk memilih baris per komponen tarif & menjumlahkan total tarif. Klaim BPJS memakai `id_casemix` layanan sebagai acuan kategori tindakan.

**Alur Mapping COA (Phase 3) [ASUMSI]**
1. **Staf Keuangan** melengkapi **Mapping COA per komponen tarif** (`coa_id_pendapatan`) — via field pada form komponen tarif atau daftar komponen tarif (Phase 3), bukan modul master terpisah — BR-30.
2. Sistem memvalidasi akun (exists, aktif, kategori Pendapatan) — BR-31; komponen tarif belum dipetakan ditandai (FR-06 AC4).
3. Saat transaksi, `resolve` menyertakan `coa_id_pendapatan` per komponen tarif → **modul Keuangan menyusun & posting jurnal pendapatan otomatis** (BR-32).

## Asumsi
- [ASUMSI] Modul belum memiliki BPMN sendiri (cluster Control Panel). Alur As-Is/To-Be & workflow diturunkan dari pola master data sejenis — ditandai [ASUMSI] pada §9.
- [ASUMSI] Tipe Pelayanan (RI/Rawat Inap, RJ/Rawat Jalan, Penunjang), tipe unit pada Master Data Unit, Tipe Penjamin, Kelas (A58), dan Profesi (A57) tersedia sebagai referensi dropdown; Tarif Layanan hanya mereferensikan nilai tersebut. Tipe Pelayanan adalah enum tetap sistem.
- [ASUMSI] Nominal tarif disimpan sebagai bilangan bulat Rupiah (tanpa desimal sen).
- [ASUMSI] 17 Kategori Tindakan diturunkan dari daftar Kategori Tindakan yang berlaku, mengecualikan Obat, Obat Kronis, Obat Kemoterapi, dan BMHP, serta menambahkan Gizi, Patologi Anatomi, dan Transfusi Darah.
- [KEPUTUSAN] Komponen Tarif bertipe **Jasa Medis** (operator default 1 profesi A57) atau **Non-Medis** (tanpa operator); Mapping COA per komponen tarif (Phase 3) — BR-34.
- [KEPUTUSAN] Tiap komponen (Medis): **raw pertama = default** (operator default komponen, wajib/otomatis); **penambahan raw operator opsional**. Tarif komponen = **akumulasi (Σ) raw** (Dokter Bedah + Asisten dst); dasar **Laporan Jasa Medis** & dikonsumsi fitur **Tindakan & BHP** — BR-41.
- [KEPUTUSAN] Komponen **Non-Medis** dapat diisi **persentase (%)** dengan basis **total Jasa Medis** (BR-35); **total Rupiah** layanan tampil di header form (live) & Dashboard (BR-36).
- [KEPUTUSAN] **Tipe Pelayanan digunakan sebagai filter awal cakupan ketersediaan layanan** — nilai enum: RI/Rawat Inap, RJ/Rawat Jalan, Penunjang. User wajib memilih Tipe Pelayanan terlebih dahulu, lalu memilih Unit yang terfilter. Mapping unit: RI → Bangsal; RJ → Darurat dan Poli; Penunjang → Penunjang Tindakan/Pemeriksaan/Terapi. Tipe Pelayanan dan Unit **bukan** dimensi tarif; varian tarif tetap **Tipe Penjamin × Kelas** saja (BR-37).
- [KEPUTUSAN] **Tambah Komponen Tarif** diakses dari layer **Dashboard**, bukan saat input Data Layanan/Tindakan. Komponen disimpan sebagai **default prospektif** (`is_default`) dan otomatis dimuat pada input berikutnya; **layanan existing dan form yang sedang dibuka tetap** (snapshot, histori dipertahankan), berubah hanya bila di-Edit manual setelah komponen tersedia (BR-40).
- [KEPUTUSAN] Hasil **persentase dibulatkan ke atas (ceiling)** ke Rupiah bulat (tanpa desimal); basis % dihitung **per varian/konteks** (BR-35).
- [KEPUTUSAN] **Kategori Tindakan wajib** (tepat 1 per layanan, `id_casemix` NOT NULL) dan daftar **17 Kategori Tindakan fixed/read-only** (admin tak dapat ubah) — BR-33, FR-07.
- [KEPUTUSAN] Kategori Tindakan (17, fixed) dipilih **single-select di header** (1 per layanan); Komponen Tarif (default sistem + dapat ditambah) menguraikan harga di Data Tarif (BR-24, BR-26, BR-33).
- [KEPUTUSAN] Mapping COA (Phase 3) per komponen tarif & hanya akun kategori Pendapatan; Master COA & posting jurnal di modul Keuangan.
- [KEPUTUSAN] **Effective date (Tanggal Berlaku) masuk Phase 1** — default hari ini, forward-dating untuk penjadwalan; Phase 1 tetap **tanpa backdate** (BR-27); menonaktifkan Layanan tidak menyentuh baris tarifnya (BR-20).
- [KEPUTUSAN] Kelas merujuk Master Data Kelas (A58) (BR-28); presedens tarif spesifik menang, tie-break nominal tertinggi (BR-13); field `peran` agar profesi identik boleh >1 tarif (BR-29).
- [KEPUTUSAN] Ditambah **Tipe Komponen BHP** (Bahan Habis Pakai) — komponen tarif tanpa operator & **tanpa Mapping COA**; pada Data Tarif tiap **raw** = **Barang Farmasi** (lookup Master Data Barang Farmasi A4) + **qty** + **harga satuan (input manual)**, subtotal raw = qty × harga satuan, subtotal komponen = Σ raw. BHP masuk total layanan (BR-36) & resolusi (BR-13) tetapi **bukan** basis persentase Non-Medis (basis = Jasa Medis saja); skema `service_tariff.id_barang_farmasi`/`qty` (BR-42).
