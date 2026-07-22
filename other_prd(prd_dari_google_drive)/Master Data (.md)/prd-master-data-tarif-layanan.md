# PRD — Master Data: Tarif Layanan (A10)

**Related Document:** Master Data Unit; Master Data Tipe Penjamin; Master Data Kelas (A58); Master Data Profesi (A57); Master Chart of Accounts (Modul Keuangan)
**Versi:** 3.7 - **Raw / Multi-Tagging operator per Komponen Tarif** — tiap komponen Medis dapat berisi ≥1 raw (operator: profesi A57 + peran) dengan tarif sendiri, **terakumulasi (Σ)** jadi tarif komponen (mis. Dokter Bedah 10rb + Asisten 8rb = 18rb); dasar **Laporan Jasa Medis** & dikonsumsi fitur **Tindakan & BHP** (BR-41). **Instalasi dihapus** dari data requirement — cukup **Unit** (nama layanan **unik global**, BR-01). Lanjutan v3.5 (Unit keluar dari dimensi tarif → cakupan ketersediaan; Komponen Tarif default prospektif; opsi Rupiah/% per sel), v3.4 (mode Seragam/Per-sel, Copy tarif), v3.3 (Casemix wajib & fixed), v3.2 (tipe Medis/Non-Medis, tarif %, total Rupiah), v3.1 (pemisahan Casemix vs Komponen Tarif).
**Tanggal:** 3 Juli 2026

## 1. Metadata Dokumen

**Approval**

Dokumen ini **tidak memerlukan approval formal** (sign-off) — disepakati langsung oleh PO/tim terkait. (Catatan: alur *Approval berjenjang perubahan tarif* di **Phase 2** adalah fitur produk, terpisah dari sign-off dokumen ini.)

**Related Documents**
* Master Data Unit — sumber **cakupan ketersediaan** `id_unit` (di unit mana layanan diberikan; bukan dimensi tarif — BR-37). *(Instalasi tidak dipakai — cukup Unit.)*
* Master Data Tipe Penjamin — sumber varian `id_tipe_penjamin` (Umum/BPJS/Asuransi/Perusahaan).
* Master Data Kelas (A58) — sumber varian `id_kelas` (VIP/Kelas I/II/III/Tanpa Kelas); merujuk master, bukan enum tetap (BR-28).
* Master Data Profesi (A57) — sumber `id_profesi` untuk **Multi-Tagging** komponen tarif.
* Master Chart of Accounts (Modul Keuangan) — sumber `coa_id_pendapatan` (Phase 3).

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2 Juli 2026 | 2.0–2.6 | Evolusi konsep: model **Layanan + Data Tarif** berbasis **Komponen**; multi-select cakupan varian (Unit/Tipe Penjamin/Kelas) di Data Layanan; varian tarif **auto-generate**; **Komponen multi-select**; field **`peran`** (profesi identik boleh >1 tarif); **Mapping COA** Phase 3; finalisasi seluruh open question (A58, tie-break nominal tertinggi, no-backdate). |
| 3 Juli 2026 | 3.0 | **Restrukturisasi dokumen** mengikuti **Template PRD** (9 section). Related Features dipisah (§5); Data & Technical Specifications (§8) memuat DB Schema Suggestion, API, Form Input & List View spec, Business Rules. Substansi tidak berubah. |
| 3 Juli 2026 | 3.1 | **Pemisahan Komponen Casemix vs Komponen Tarif.** **Komponen Casemix** (14, fixed) dipindah ke **header Data Layanan** sebagai **single-select** (1 per layanan) untuk pemetaan klaim (`service.id_casemix` → master `casemix_component`). **Komponen Tarif** (Data Tarif) kini **default sistem (non-casemix) + dapat ditambah**, bukan lagi multi-select dari 14 casemix. Multi-Tagging, varian auto-generate, dan Mapping COA (per komponen tarif) tidak berubah. |
| 3 Juli 2026 | 3.2 | **Tipe komponen tarif & tarif persentase.** Komponen Tarif bertipe **Jasa Medis** (wajib profesi A57, diwarisi baris) / **Non-Medis**; ditambah **inline** via **[+ Tambah Komponen Tarif]** (bukan modul master). Komponen **Non-Medis** dapat diisi **persentase (%)** dengan basis **total Jasa Medis** (BR-35). **Total Rupiah** layanan tampil **live di header** & kolom Dashboard (BR-36). **Unit** ditegaskan sebagai **dimensi pembentuk tarif** (BR-37). Skema: `tariff_component.tipe_komponen/id_profesi`, `service_tariff.tipe_nominal/persen`. |
| 3 Juli 2026 | 3.3 | **Finalisasi keputusan.** Komponen Casemix **wajib** (`id_casemix` NOT NULL) & daftar **14 fixed/read-only** (tak diubah admin) — BR-33/FR-07. Hasil **persentase dibulatkan ke atas (ceiling)** ke Rupiah bulat, basis **per varian** — BR-35. Daftar default Komponen Tarif masih menunggu data ([PERLU KONFIRMASI], BR-26). |
| 3 Juli 2026 | 3.4 | **Utilitas input tarif.** **Mode pengisian Seragam/Per-sel** — satu harga diterapkan ke seluruh sel matriks (Unit × Penjamin × Kelas) atau isi per-sel (BR-38, FR-02 AC7). **Copy tarif antar-komponen** — salin tarif dari komponen tarif yang sudah diisi ke komponen lain (BR-39, FR-02 AC8). Tanpa perubahan skema. |
| 4 Juli 2026 | 3.7 | **Raw / Multi-Tagging operator.** Tiap Komponen Tarif dapat berisi **≥1 raw (operator = profesi A57 + peran)** dengan tarif sendiri; **tarif komponen = akumulasi (Σ) raw** (BR-41). Komponen Medis: raw pertama = operator default (BR-34), dapat [+ Tambah Raw]. Mendukung **Laporan Jasa Medis** per operator & dikonsumsi fitur **Tindakan & BHP**. BR-13 diperbarui (subtotal komponen = Σ raw, bukan pilih satu). Tanpa perubahan skema (reuse `service_tariff.id_profesi/peran`). |
| 3 Juli 2026 | 3.6 | **Instalasi dihapus.** `service.id_instalasi` & pilihan Instalasi dihilangkan dari Data Layanan — cukup **Unit** (cakupan ketersediaan). `nama_layanan` kini **unik global** (BR-01, `UNIQUE`); kolom Dashboard Instalasi → **Unit**. |
| 3 Juli 2026 | 3.5 | **Unit keluar dari dimensi tarif & Komponen Tarif default prospektif.** **Unit** kini hanya **cakupan ketersediaan** (di unit mana layanan diberikan), bukan pembentuk tarif; varian tarif = **Tipe Penjamin × Kelas** (BR-37). `service_tariff.id_unit` dihapus dari matriks, keunikan (BR-11), & index. **Tambah Komponen Tarif** disimpan `is_default=true` → dimuat otomatis pada layanan **baru** (prospektif); **layanan lama tetap** (snapshot, histori dipertahankan) — BR-40. Opsi **Rupiah/% per sel** dipertegas (BR-35). |

## 2. Overview & Background

**Overview / Brief Summary**

Master Data **Tarif Layanan** adalah modul pada cluster **Control Panel** yang menjadi **sumber kebenaran tunggal** harga setiap layanan/tindakan rumah sakit. Modul menyimpan *apa layanannya* (**Data Layanan**) dan *berapa harganya* (**Data Tarif**) dalam satu form 2-section.

Modul membedakan dua konsep komponen:
* **Komponen Casemix** — daftar **14 komponen** (fixed) untuk pemetaan klaim (BPJS/INA-CBG). Dipilih **single-select di header Data Layanan** (1 komponen casemix per layanan) — menandai layanan ini setara komponen casemix mana saat klaim (BR-24, BR-33).
* **Komponen Tarif** — komponen penguraian harga (mis. Jasa Sarana, Jasa Pelayanan, BHP). Sistem menyediakan **daftar default (non-casemix)**; komponen baru ditambah **langsung dari Data Tarif** via aksi **[+ Tambah Komponen Tarif]** (bukan modul master terpisah) dan **berlaku sebagai default untuk layanan berikutnya** (prospektif — layanan lama tidak berubah, BR-40). Tiap komponen tarif bertipe **Jasa Medis** (terikat 1 profesi dari Master Profesi A57) atau **Non-Medis**, dan dapat dipetakan ke akun COA (Phase 3). Data Tarif diuraikan per komponen tarif ini (BR-26, BR-34).

Kekuatan modul ada pada model tarifnya: alih-alih satu angka, setiap layanan diuraikan menjadi **Komponen Tarif**. Model tarif mendukung:
* **Multi-Tagging operator (Raw)** — satu komponen tarif dapat berisi beberapa **raw (baris operator)**, tiap raw = 1 **Operator** (profesi A57 + peran opsional) dengan **tarif tersendiri**. Tarif komponen = **akumulasi (Σ) seluruh raw** (mis. Jasa Medis: Dokter Bedah Rp10.000 + Asisten Rp8.000 = Rp18.000). Tiap operator dapat bertarif berbeda → dasar **Laporan Jasa Medis** per operator; setting raw ini dikonsumsi fitur **Tindakan & BHP** (BR-29, BR-41).
* **Varian auto-generate** — dimensi **Tipe Penjamin** dan **Kelas** dipilih **multi-select di Data Layanan**; sistem membentuk **matriks kombinasi varian** otomatis, petugas cukup mengisi nominal per kombinasi (BR-15). **Unit BUKAN dimensi tarif** — Unit hanya menentukan **di unit mana layanan dapat diberikan** (cakupan ketersediaan, BR-37).
* **Nominal atau persentase** — komponen tarif **Non-Medis** dapat diisi **nominal Rupiah** *atau* **persentase (%)** dengan **basis = total komponen tarif Jasa Medis** pada varian/konteks yang sama (mis. Jasa Sarana = 40% jasa medis) — BR-35.
* **Total Rupiah layanan** — sistem menghitung & menampilkan **total Rupiah** layanan (per varian/konteks) secara **live di header form input** dan sebagai ringkasan di **Dashboard** (BR-36).
* **Mapping COA (Phase 3)** — tiap komponen tarif dipetakan ke akun **Chart of Accounts kategori Pendapatan** agar billing terposting ke jurnal otomatis (BR-30).

Modul menyediakan **Dashboard** dengan **ringkasan variasi tarif informatif** (jumlah varian, **total/rentang Rupiah**, penanda multi-profesi/kelas/penjamin) serta operasi **Tambah**, **Edit**, dan **Aktif/Nonaktifkan**.

**Business Process (As-Is vs To-Be)** [ASUMSI — diturunkan dari pola master data sejenis, modul belum ber-BPMN]

* **As-Is (manual / masalah saat ini)**:
    * Tarif dikelola di **spreadsheet (Excel) terpisah** per unit; rawan versi ganda & tidak sinkron dengan billing.
    * Perbedaan harga per penjamin (Umum vs BPJS vs Asuransi) & per kelas dicatat manual di kolom terpisah → **sulit ditelusuri**, sering salah pilih saat kasir menagih.
    * Jasa profesi (operator, anestesi, dll) ditulis ad-hoc, **tidak terstandar** antar layanan.
    * Menonaktifkan layanan lama = menghapus baris → **kehilangan histori** & memutus referensi transaksi lama.

* **To-Be (solusi digital yang diusulkan)**:
    * Satu form **Tambah Data Layanan** 2-section menjadikan pembuatan layanan + harga **satu proses atomik**.
    * Layanan dipetakan ke **1 Komponen Casemix** (single-select header), **siap dipetakan ke klaim** BPJS/INA-CBG.
    * Harga diuraikan per **Komponen Tarif** (default sistem + dapat ditambah) — terstruktur & konsisten antar layanan.
    * **Multi-select Penjamin/Kelas** (dimensi tarif) + **Unit** (cakupan ketersediaan) di Data Layanan + **matriks varian auto-generate** menggantikan kolom-kolom manual Excel dengan struktur data yang dapat di-query billing.
    * **Aktif/Nonaktif** (bukan hapus) menjaga histori & integritas referensi (BR-20).
    * **Dashboard informatif** memberi manajemen visibilitas kompleksitas tarif tiap layanan.
    * **Mapping COA (Phase 3)** menyiapkan posting jurnal pendapatan otomatis dari billing.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Sentralisasi tarif | 100% layanan aktif RS terinput di modul (tidak ada tarif transaksi dari Excel terpisah) dalam 1 bulan pasca go-live. |
| 2 | Kecepatan input | Petugas dapat menambah 1 layanan + tarif lengkap (≥1 komponen tarif) dalam **≤ 5 menit** via form 2-section. |
| 3 | Akurasi penagihan | Kesalahan harga akibat salah penjamin/kelas turun **≥ 80%** (vs proses Excel) karena tarif ditentukan sistem. |
| 4 | Kesiapan klaim (casemix) | **100%** layanan memetakan 1 Komponen Casemix (wajib, BR-33); pemetaan **sesuai kategori** casemix (audit sampling ≥ 95% benar) untuk kesiapan klaim/INA-CBG. |
| 5 | Standarisasi komponen tarif | ≥ 90% layanan menguraikan harga ke **Komponen Tarif** (bukan angka gelondongan). |
| 6 | Visibilitas variasi | Manajemen melihat jumlah varian & rentang tarif tiap layanan langsung dari Dashboard (**0 klik** untuk ringkasan). |
| 7 | Integritas histori | 0 penghapusan fisik data yang pernah dipakai transaksi; seluruh penonaktifan tercatat (BR-20). |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) | Phase 3 (Accounting: Mapping COA) |
|-------------|---------------------|-----------------------------------------|-----------------------------------|
| Dashboard Layanan | List + search + filter + ringkasan variasi tarif informatif + **total/rentang Rupiah** (BR-36); toggle Aktif/Nonaktif | Kolom status approval; filter "menunggu persetujuan" | Badge status mapping COA (terpetakan/belum); filter "belum dipetakan COA" |
| Tambah Data Layanan | Form 2 section; **single-select Komponen Casemix** (header); multi-select **Penjamin/Kelas** (dimensi tarif) + **Unit** (cakupan ketersediaan, BR-37); Komponen Tarif (default sistem + tambah); matriks varian auto-generate (min 1 sel); **total Rupiah live di header** (BR-36) | Perubahan berstatus *Draft → Menunggu Approval → Aktif* | — (akun COA mengikuti komponen tarif, tak diinput di form layanan) |
| Data Tarif (Komponen Tarif) | Komponen Tarif default sistem + dapat ditambah; **≥1 raw/operator per komponen Medis, akumulasi Σ (BR-41)** + `peran`; nominal **Rupiah atau persentase (Non-Medis, basis total Jasa Medis — BR-35)** per sel varian; **mode pengisian seragam/per-sel (BR-38)** & **copy tarif antar-komponen (BR-39)** | Approval berjenjang perubahan nominal; escalation SLA | Akun COA mengikuti komponen tarif (BR-30); ditampilkan saat resolusi tarif |
| Edit Layanan | Ubah Data Layanan & Data Tarif (tambah/ubah/nonaktif baris) | Riwayat versi tarif + **effective date** + audit trail | — |
| Aktif/Nonaktifkan | Toggle status layanan (tanpa hapus fisik) | Approval sebelum nonaktif untuk layanan terpakai | — |
| Master Komponen Casemix | 14 komponen casemix (**fixed/read-only**, tak diubah admin); **wajib** dipilih 1 per layanan di header (BR-24/BR-33) | — | — |
| Tambah Komponen Tarif (inline) | Aksi **[+ Tambah Komponen Tarif]** dari Data Tarif (Nama, Tipe Medis/Non-Medis, Profesi bila Medis) — bukan modul master terpisah; disimpan **default prospektif** untuk layanan berikutnya, layanan lama tetap (BR-40) | — | Field Mapping COA per komponen tarif (`coa_id_pendapatan`) |
| Mapping COA | — | — | Pemetaan **per komponen tarif** → akun COA Pendapatan; acuan posting jurnal otomatis |

**Out of Scope**
* Kalkulasi klaim / grouping INA-CBG (grouping di modul Casemix/Klaim); modul ini hanya menyimpan **pemetaan** ke Komponen Casemix.
* Transaksi billing/kasir (modul Billing yang mengonsumsi tarif).
* Master Unit/Tipe Penjamin/Kelas/Profesi (hanya direferensikan).
* **Master Chart of Accounts & mesin posting jurnal** — dikelola modul Keuangan; modul ini hanya mereferensikan (FK) & menyimpan pemetaan.
* Komponen casemix **Obat, Obat Kronis, Obat Kemoterapi, BMHP** (modul Farmasi/BHP; dikecualikan dari 14 Komponen Casemix default — BR-24).
* Import massal tarif dari Excel (kandidat Phase 2).

## 5. Related Features

* **Master Data Profesi (A57)** — sumber daftar profesi untuk Multi-Tagging komponen tarif (`id_profesi`).
* **Master Data Kelas (A58)** — sumber varian Kelas (`id_kelas`/`kelas_list`); rujuk master, bukan enum (BR-28).
* **Master Data Unit / Tipe Penjamin** — sumber **cakupan unit** (`id_unit`, ketersediaan) & dimensi varian tarif (`id_tipe_penjamin`). *(Instalasi tidak dipakai.)*
* **Modul Billing & Casemix** (konsumen) — mengambil tarif via endpoint `resolve` berdasarkan konteks **Penjamin/Kelas** (dimensi tarif) transaksi (BR-13); **Unit** dipakai memeriksa ketersediaan layanan; membaca `id_casemix` layanan untuk klaim.
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

> Catatan Phasing: Status **Draft/Menunggu Approval/Approved/Ditolak** & `role_approver` **belum aktif di Phase 1** (perubahan langsung berlaku); kolom `status_approval`, `role_approver`, `effective_date` **sudah disiapkan** di skema sejak Phase 1 agar siap Phase 2. Phase 1 **tanpa backdate** (BR-27).

**User Stories Utama**
* **US-01** — Sebagai **Petugas Casemix**, saya ingin menambah layanan sekaligus menguraikan tarifnya ke komponen tarif dalam satu form, agar tidak perlu input di dua tempat.
* **US-02** — Sebagai **Petugas Casemix**, saya ingin menambah beberapa **raw/operator** (mis. Dokter Bedah, Asisten) pada satu komponen tarif dengan tarif masing-masing yang **terakumulasi**, agar jasa tiap operator terstandar (BR-41).
* **US-09** — Sebagai **Keuangan/Manajemen**, saya ingin tarif tersimpan **per operator (raw)**, agar **Laporan Jasa Medis** dan fitur **Tindakan & BHP** memakai tarif operator yang benar (BR-41).
* **US-03** — Sebagai **Petugas Casemix**, saya ingin cukup memilih Tipe Penjamin/Kelas (dan Unit ketersediaan) di Data Layanan lalu mengisi nominal pada matriks varian yang dibentuk sistem, agar harga BPJS vs Umum vs Asuransi otomatis benar tanpa input berulang.
* **US-04** — Sebagai **Manajemen**, saya ingin melihat ringkasan variasi & rentang tarif tiap layanan dari dashboard, agar cepat menilai kompleksitas & konsistensi harga.
* **US-05** — Sebagai **Petugas**, saya ingin menonaktifkan layanan lama tanpa menghapusnya, agar histori transaksi tetap utuh.
* **US-06** — Sebagai **Kasir/Billing (konsumen)**, saya ingin sistem menentukan tarif otomatis dari konteks transaksi, agar tidak salah pilih harga.
* **US-07** *(Phase 3)* — Sebagai **Staf Keuangan/Akuntansi**, saya ingin tiap komponen tarif dipetakan ke akun **COA Pendapatan** yang benar, agar pendapatan billing otomatis terposting ke jurnal yang tepat.
* **US-08** — Sebagai **Petugas Casemix**, saya ingin memetakan tiap layanan ke **1 Komponen Casemix** (dari 14) di header Data Layanan, agar layanan siap diklaim ke BPJS/INA-CBG.

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

**Fitur: Tambah Data Layanan (FR-02) — form 2 section**
* **User Story**: US-01, US-02, US-03, US-08.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Section A (Data Layanan)**: Form berisi Nama Layanan, Kode (auto/manual), Kelompok Layanan, **Komponen Casemix** (single-select 1 dari 14 — **wajib**, untuk pemetaan klaim, BR-33), Kode Casemix/INA-CBG (opsional), Deskripsi, **multi-select Unit** (cakupan **ketersediaan** — di unit mana layanan dapat diberikan; **bukan** dimensi tarif, BR-37), serta **multi-select** variabel variasi tarif **Tipe Penjamin**, **Kelas** (pilih ≥0 nilai; kosong = dimensi berlaku umum) yang menetapkan **cakupan variasi** (BR-15). **Instalasi tidak diinput** (cukup Unit). Status TIDAK diinput (sistem set **Aktif**). Nama wajib **unik global** (BR-01).
    * **AC 2 — Section B (Data Tarif)**: Pengguna menguraikan harga per **Komponen Tarif**. Sistem **memuat otomatis** daftar komponen tarif **default** (`is_default & aktif`, termasuk komponen yang pernah ditambah sebelumnya — BR-40); pengguna dapat **menambah** komponen tarif baru bila perlu (BR-26). Wajib **≥ 1 komponen tarif** dengan tarif aktif (BR-23). Komponen Tarif **tidak** dipilih dari 14 casemix — casemix dipetakan sekali di header (Section A).
    * **AC 3 — Raw / Multi-Tagging Operator**: Tiap komponen tarif **Jasa Medis** dapat memiliki **≥1 raw (baris operator)**; tiap raw = 1 **Operator** (profesi dropdown Master Profesi A57 + **Peran** opsional, mis. Operator/Asisten — BR-29) dengan **tarif tersendiri** per varian. Raw pertama memakai **operator default** komponen (BR-34, terisi otomatis/wajib); penambahan raw operator **opsional** via **[+ Tambah Raw/Operator]**. **Tarif komponen (per varian) = akumulasi (Σ) seluruh raw aktif** — mis. Dokter Bedah Rp10.000 + Asisten Rp8.000 = Rp18.000 (BR-41). Komponen **Non-Medis** = 1 raw tanpa operator (BR-10).
    * **AC 4 — Varian auto-generate**: Data Tarif **tidak menyediakan input** Tipe Penjamin/Kelas. Sistem membentuk **matriks kombinasi varian** (Tipe Penjamin × Kelas) dari multi-select Section A; petugas mengisi **nominal** per sel — sehingga tarif dapat **berbeda per Penjamin/Kelas**. **Unit tidak** membentuk varian tarif (BR-37). **Minimal 1 sel wajib terisi** per layanan (BR-23); sel kosong = varian tak bertarif.
    * **AC 5 — Nominal atau persentase (Non-Medis)**: Untuk komponen tarif **Non-Medis**, tiap sel punya **toggle Rupiah/%** — dapat diisi **nominal Rupiah** *atau* **persentase (%)**, dan dapat berpindah kapan saja. Bila **%**, nilai efektif = `persen% × Σ nominal komponen Jasa Medis` pada varian/konteks yang sama, **dibulatkan ke atas** ke Rupiah bulat (BR-35). Komponen **Jasa Medis** hanya menerima nominal Rupiah.
    * **AC 6 — Total Rupiah live**: Header form menampilkan **total Rupiah** layanan yang terhitung otomatis dari komponen terisi (nominal + hasil %); bila tarif bervariasi antar-varian, ditampilkan **rentang/total per varian** (BR-36).
    * **AC 7 — Mode pengisian nominal (seragam / per-sel)**: Untuk tiap komponen tarif, pengguna memilih **(a) Seragam** — satu nilai (nominal Rupiah atau %) langsung diterapkan ke **seluruh sel** matriks varian (Tipe Penjamin × Kelas); atau **(b) Per-sel** — isi nilai tiap sel secara berbeda. Setelah "Seragam", nilai tiap sel tetap dapat **disesuaikan/override** (BR-38).
    * **AC 8 — Copy tarif antar-komponen**: Dari komponen tarif yang **sudah diisi harganya**, pengguna dapat **menyalin (copy) tarif** ke komponen tarif lain pada layanan yang sama; nilai tersalin mengikuti sel varian dan **dapat diubah** setelah disalin (BR-39).
    * **AC 9 — Validasi simpan**: Nominal (bila diisi) ≥ 0 & bilangan bulat; persen 0–100 & hanya untuk komponen Non-Medis (BR-35); kombinasi (Komponen Tarif + Profesi + Peran + Penjamin + Kelas) **unik** per layanan (BR-11); layanan wajib punya **≥ 1 baris tarif aktif** (BR-23).
    * **AC 10 — Atomik**: Simpan menulis Data Layanan + seluruh baris tarif dalam satu transaksi; bila gagal, tidak ada yang tersimpan sebagian.

* **Validasi**:

  **A. Wording Validasi (Frontend)**

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|-----------|-------|---------------|-------------|
  | Nama Layanan | Text | Required, Max 120, unik global | "Nama layanan wajib diisi & unik." | "Contoh: Operasi Appendektomi." |
  | Komponen Casemix *(Section A/header)* | Dropdown (single-select) | **Required** | "Pilih 1 Komponen Casemix." | "Pilih 1 dari 14 Komponen Casemix (fixed) untuk pemetaan klaim (BR-33)." |
  | Unit *(Section A — ketersediaan)* | Multi-select | Optional | — | "Pilih unit tempat layanan dapat diberikan (bukan dimensi tarif, BR-37). Kosong = semua unit." |
  | Tipe Penjamin *(Section A)* | Multi-select | Optional | — | "Pilih penjamin yang berlaku. Kosong = semua penjamin." |
  | Kelas *(Section A)* | Multi-select | Optional | — | "Pilih kelas yang berlaku (sumber A58). Kosong = semua kelas." |
  | Komponen Tarif *(Section B)* | List + [+ Tambah Komponen Tarif] | Required (≥ 1 komponen tarif) | "Tambahkan minimal 1 komponen tarif." | "Default sistem tersedia; komponen baru ditambah inline via [+ Tambah Komponen Tarif] (BR-26, BR-34)." |
  | Raw / Operator *(per komponen Medis)* | List + [+ Tambah Raw] | ≥ 1 raw untuk komponen Medis | "Tambah minimal 1 operator." | "Tiap raw = 1 operator; tarif komponen = Σ raw (BR-41)." |
  | Operator (Profesi) | Dropdown (A57) | Required per raw (komponen Medis) | "Pilih operator/profesi raw." | "Sumber Master Profesi A57; raw pertama = operator default komponen (BR-34)." |
  | Peran | Text | Optional (wajib bila profesi & varian sama berulang) | "Peran wajib berbeda bila profesi & varian sama." | "Pembeda mis. Operator/Asisten (BR-29)." |
  | Varian (Penjamin/Kelas) *(Section B)* | — (label, non-input) | — | — | "Kombinasi otomatis dari multi-select Penjamin/Kelas Section A; Unit tidak membentuk varian (BR-15/BR-37)." |
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
    * **AC 1**: Form Edit memuat ulang Data Layanan + seluruh baris tarif (2 section, prefilled). Mengubah multi-select Section A menyusun ulang matriks varian (BR-15); Komponen Casemix dapat diubah (tetap single-select).
    * **AC 2**: Pengguna dapat menambah, mengubah nominal, atau **menonaktifkan** baris tarif (bukan hapus fisik bila pernah dipakai — BR-20).
    * **AC 3**: Validasi keunikan (BR-11) & minimal 1 tarif aktif (BR-23) tetap berlaku.
    * **AC 4**: Perubahan tercatat `updated_at`/`updated_by`; Phase 1 **tanpa backdate** (BR-27); (Phase 2: alur approval & effective date).

**Fitur: Aktif/Nonaktifkan Layanan (FR-04)**
* **User Story**: US-05.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Toggle status di Dashboard mengubah `status_aktif` tanpa menghapus data (BR-20).
    * **AC 2**: Menonaktifkan menampilkan konfirmasi; layanan Nonaktif tidak muncul untuk transaksi **baru**, transaksi lama tetap valid.
    * **AC 3**: Menonaktifkan Layanan **tidak** menonaktifkan/menghapus baris tarifnya; saat diaktifkan kembali, tarif pulih seperti semula (keputusan final, BR-20).

**Fitur: Tambah Komponen Tarif (FR-05) — inline pada Data Tarif**
* **User Story**: US-02.
* **Prioritas**: P1.
* **Fase**: Phase 1.
* **Catatan**: **Bukan modul master terpisah** — komponen tarif ditambah **langsung dari form Data Tarif** via aksi **[+ Tambah Komponen Tarif]**. Komponen yang ditambah tersimpan & dapat dipakai ulang oleh layanan lain.
* **Acceptance Criteria**:
    * **AC 1 — Default**: Data Tarif menyediakan **daftar komponen tarif default (non-casemix)** sebagai pilihan awal (seed, BR-26). [PERLU KONFIRMASI daftar default final].
    * **AC 2 — Aksi [+ Tambah Komponen Tarif] (inline/modal)**: Dari Data Tarif, pengguna menambah komponen tarif baru via form ringkas: **Nama Komponen** (wajib, unik), **Tipe Komponen** (wajib; *Jasa Medis* / *Non-Medis*), **Operator default (Profesi)** (dropdown Master Profesi A57 — **wajib bila Jasa Medis**; jadi operator **raw pertama** saat komponen dipakai, BR-41; kosong bila Non-Medis), dan **Mapping COA** (`coa_id_pendapatan`, akun Pendapatan — **Phase 3**, opsional/non-blocking). Lihat §8.3.1 (Section C).
    * **AC 3 — Simpan sebagai default (prospektif)**: Komponen tarif yang ditambah **disimpan sebagai default** (`is_default=true`) ke `tariff_component` sehingga **otomatis dimuat** pada form **Tambah Data Layanan berikutnya**. Penerapan bersifat **prospektif** — **layanan yang sudah ada TIDAK berubah** (baris tarifnya = snapshot; histori dipertahankan seperti semula). Perubahan pada layanan lama hanya terjadi bila layanan tsb di-Edit manual (BR-40).
    * **AC 4 — Validasi**: Nama unik; Jasa Medis ⇒ Profesi wajib; Non-Medis ⇒ Profesi tidak diisi. Mapping COA divalidasi hanya bila diisi (BR-31). Komponen yang sudah dipakai baris tarif tidak dapat dihapus fisik (hanya dinonaktifkan — BR-20).

**Fitur: Master Komponen Casemix (FR-07)**
* **User Story**: US-08.
* **Prioritas**: P1.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan **14 Komponen Casemix** (fixed/seed) sesuai BR-24; menjadi opsi single-select di header Data Layanan.
    * **AC 2**: Daftar 14 bersifat **fixed/read-only** — admin **tidak dapat** menambah/mengubah/menonaktifkan (mengikuti standar casemix).
    * **AC 3**: Satu layanan **wajib** memetakan **tepat 1** Komponen Casemix (BR-33).

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

Master eksternal (`unit`, `tipe_penjamin`, `kelas` [A58], `profesi` [A57], `coa_account` [Keuangan]) **hanya direferensikan** (FK) — didefinisikan di modulnya masing-masing. *(Instalasi tidak dipakai.)*

* **Table Name**: `casemix_component` (Master Komponen Casemix — 14 fixed, BR-24)
    * `id`: UUID (Primary Key)
    * `nama_komponen`: VARCHAR (unik) — seed 14 casemix
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

* **Table Name**: `service_unit` (junction **cakupan ketersediaan** — di unit mana layanan diberikan; **bukan** dimensi tarif, BR-37), `service_tipe_penjamin`, `service_kelas` (junction **cakupan varian tarif** — BR-15)
    * `id_layanan`: UUID (FK → service, ON DELETE CASCADE)
    * `id_unit` / `id_tipe_penjamin` / `id_kelas`: UUID (FK ke master terkait; `id_kelas` → A58)
    * Primary Key komposit (`id_layanan`, `id_<dimensi>`)

* **Table Name**: `tariff_component` (Komponen Tarif — default sistem + ditambah inline via FR-05, BR-26/BR-34)
    * `id`: UUID (Primary Key)
    * `nama_komponen`: VARCHAR (unik) — seed default non-casemix; dapat ditambah/ubah/nonaktif
    * `is_default`: Boolean (default true) — komponen dimuat otomatis pada Data Layanan baru; prospektif (BR-40)
    * `tipe_komponen`: VARCHAR/ENUM (`MEDIS` | `NON_MEDIS`) NOT NULL — BR-34
    * `id_profesi`: UUID (FK → profesi, A57) — **wajib bila `MEDIS`**, NULL bila `NON_MEDIS` (BR-34)
    * `coa_id_pendapatan`: UUID (FK → coa_account) — *Phase 3* (BR-30/31)
    * `status_aktif`: Boolean (default true)

* **Table Name**: `service_tariff` (Data Tarif / Baris Tarif)
    * `id`: UUID (Primary Key)
    * `id_layanan`: UUID (FK → service, ON DELETE CASCADE)
    * `id_komponen`: UUID (FK → tariff_component) — komponen tarif
    * `id_profesi`: UUID (FK → profesi, A57) — **operator** per **raw** (input; raw pertama = operator default komponen) — BR-41
    * `peran`: VARCHAR(60) — pembeda operator identik (mis. Operator/Asisten) — BR-29
    * `id_tipe_penjamin`, `id_kelas`: UUID (FK) — varian tarif, **system-set** (BR-15). *(Unit dikeluarkan — bukan dimensi tarif, BR-37)*
    * `tipe_nominal`: VARCHAR/ENUM (`NOMINAL` | `PERSEN`) NOT NULL default `NOMINAL` — `PERSEN` hanya komponen Non-Medis (BR-35)
    * `nominal`: Integer (Rp, ≥ 0) — dipakai bila `NOMINAL` (nullable bila `PERSEN`)
    * `persen`: NUMERIC(5,2) (0–100) — dipakai bila `PERSEN`; nilai efektif = `persen% × Σ nominal Jasa Medis` konteks (BR-35)
    * `status_aktif`: Boolean (default true)
    * `status_approval`: VARCHAR (default `APPROVED`) — *Phase 2*
    * `effective_date`: Date — *Phase 2* (Phase 1 tanpa backdate — BR-27)
    * **Unique** (`id_layanan`,`id_komponen`,`id_profesi`,`peran`,`id_tipe_penjamin`,`id_kelas`) — BR-11

**Consolidated DDL (PostgreSQL)**

```sql
CREATE TABLE casemix_component (           -- 14 fixed (BR-24)
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_komponen VARCHAR NOT NULL UNIQUE,
  status_aktif  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE service (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_layanan     VARCHAR NOT NULL UNIQUE,
  nama_layanan     VARCHAR(120) NOT NULL UNIQUE,          -- unik global (BR-01)
  id_casemix       UUID NOT NULL REFERENCES casemix_component(id),  -- single-select header, wajib (BR-33)
  kelompok_layanan VARCHAR,
  kode_casemix     VARCHAR,                                -- kode INA-CBG bebas (opsional)
  deskripsi        VARCHAR(500),
  status_aktif     BOOLEAN NOT NULL DEFAULT TRUE,
  status_approval  VARCHAR NOT NULL DEFAULT 'APPROVED',   -- Phase 2
  role_approver    VARCHAR,                               -- Phase 2
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       VARCHAR NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by       VARCHAR NOT NULL
);

CREATE TABLE service_unit (
  id_layanan UUID NOT NULL REFERENCES service(id) ON DELETE CASCADE,
  id_unit    UUID NOT NULL REFERENCES unit(id),
  PRIMARY KEY (id_layanan, id_unit)
);
CREATE TABLE service_tipe_penjamin (
  id_layanan       UUID NOT NULL REFERENCES service(id) ON DELETE CASCADE,
  id_tipe_penjamin UUID NOT NULL REFERENCES tipe_penjamin(id),
  PRIMARY KEY (id_layanan, id_tipe_penjamin)
);
CREATE TABLE service_kelas (
  id_layanan UUID NOT NULL REFERENCES service(id) ON DELETE CASCADE,
  id_kelas   UUID NOT NULL REFERENCES kelas(id),          -- A58 (BR-28)
  PRIMARY KEY (id_layanan, id_kelas)
);

CREATE TABLE tariff_component (            -- default sistem + addable (BR-26/BR-34/BR-40)
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_komponen     VARCHAR NOT NULL UNIQUE,
  is_default        BOOLEAN NOT NULL DEFAULT TRUE,        -- dimuat otomatis di Data Layanan baru, prospektif (BR-40)
  tipe_komponen     VARCHAR NOT NULL CHECK (tipe_komponen IN ('MEDIS','NON_MEDIS')),  -- BR-34
  id_profesi        UUID REFERENCES profesi(id),          -- A57; wajib bila MEDIS (BR-34)
  coa_id_pendapatan UUID REFERENCES coa_account(id),      -- Phase 3 (BR-30/31)
  status_aktif      BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_komponen_medis_profesi CHECK (            -- BR-34
    (tipe_komponen = 'MEDIS'     AND id_profesi IS NOT NULL) OR
    (tipe_komponen = 'NON_MEDIS' AND id_profesi IS NULL)
  )
);

CREATE TABLE service_tariff (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_layanan       UUID NOT NULL REFERENCES service(id) ON DELETE CASCADE,
  id_komponen      UUID NOT NULL REFERENCES tariff_component(id),
  id_profesi       UUID REFERENCES profesi(id),           -- A57; diwarisi dari komponen tarif MEDIS (BR-10/BR-34)
  peran            VARCHAR(60),                           -- profesi identik (BR-29)
  id_tipe_penjamin UUID REFERENCES tipe_penjamin(id),     -- varian tarif (BR-15); Unit BUKAN dimensi tarif (BR-37)
  id_kelas         UUID REFERENCES kelas(id),             -- A58
  tipe_nominal     VARCHAR NOT NULL DEFAULT 'NOMINAL' CHECK (tipe_nominal IN ('NOMINAL','PERSEN')),  -- BR-35
  nominal          INTEGER CHECK (nominal >= 0),
  persen           NUMERIC(5,2) CHECK (persen >= 0 AND persen <= 100),
  status_aktif     BOOLEAN NOT NULL DEFAULT TRUE,
  status_approval  VARCHAR NOT NULL DEFAULT 'APPROVED',   -- Phase 2
  effective_date   DATE,                                  -- Phase 2 (no backdate P1, BR-27)
  CONSTRAINT ck_tarif_mode CHECK (                        -- BR-35
    (tipe_nominal = 'NOMINAL' AND nominal IS NOT NULL AND persen IS NULL) OR
    (tipe_nominal = 'PERSEN'  AND persen  IS NOT NULL)
  ),
  CONSTRAINT uq_tariff UNIQUE NULLS NOT DISTINCT
    (id_layanan, id_komponen, id_profesi, peran, id_tipe_penjamin, id_kelas)   -- BR-11
);

CREATE INDEX ix_tariff_resolve
  ON service_tariff (id_layanan, id_komponen, id_tipe_penjamin, id_kelas)
  WHERE status_aktif;   -- BR-13
```

> **Catatan implementasi**: (a) Keunikan NULL BR-11 → `UNIQUE NULLS NOT DISTINCT` (PG ≥15) atau unique index atas `COALESCE(col, sentinel)`. (b) Subset varian BR-15 (`service_tariff.id_* ∈ service_*`) ditegakkan via **trigger**/aplikasi, bukan FK biasa. (c) Kolom Phase 2/3 disiapkan namun belum aktif. (d) Soft-inactivate BR-20: hapus fisik dilarang untuk data terpakai transaksi. (e) `service.id_casemix` **NOT NULL** — tiap layanan wajib memetakan 1 Komponen Casemix (BR-33); daftar 14 casemix **fixed/read-only** (tak diubah admin). (f) `tipe_nominal='PERSEN'` hanya sah untuk komponen Non-Medis — ditegakkan trigger/aplikasi (butuh join `tariff_component.tipe_komponen`); nilai efektif % dihitung saat resolusi & dibulatkan **ke atas (ceiling)** ke Rupiah bulat (BR-35/BR-36).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/services` | List layanan + ringkasan variasi (dashboard). |
| GET | `/api/v1/services/{id}` | Detail layanan + Komponen Casemix + seluruh baris tarif. |
| POST | `/api/v1/services` | Create layanan (termasuk `id_casemix`) + baris tarif (atomik, 2 section). |
| PUT | `/api/v1/services/{id}` | Update Data Layanan + baris tarif. |
| PATCH | `/api/v1/services/{id}/status` | Toggle Aktif/Nonaktif. |
| GET | `/api/v1/services/{id}/resolve?penjamin=&kelas=&unit=` | Resolusi tarif per konteks **Penjamin/Kelas** (Billing, BR-13): hitung komponen Jasa Medis dahulu, lalu komponen Non-Medis (nominal & **%** atas basis Jasa Medis, BR-35), kembalikan **total Rupiah** (BR-36). Param `unit` **hanya** untuk cek ketersediaan layanan (BR-37), tidak memengaruhi harga; **[Phase 3]** menyertakan `coa_id_pendapatan` per komponen tarif. |
| GET | `/api/v1/casemix-components` | List 14 Komponen Casemix (opsi single-select header). |
| GET | `/api/v1/tariff-components?default=true&active=true` | List master komponen tarif; form Data Layanan **baru** memuat `is_default=true & aktif` (BR-40). |
| POST/PATCH | `/api/v1/tariff-components` | Kelola master komponen tarif (FR-05): body `nama_komponen`, `tipe_komponen` (MEDIS/NON_MEDIS), `id_profesi` (wajib bila MEDIS); **[Phase 3]** set `coa_id_pendapatan`. |
| GET | `/api/v1/profesi?active=true` | Lookup Master Profesi (A57) untuk dropdown Profesi komponen tarif Medis. |
| GET | `/api/v1/coa-accounts?category=pendapatan&active=true` | **[Phase 3]** Lookup akun COA Pendapatan (Master COA) untuk dropdown mapping. |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

*Section A — Data Layanan (`service`)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| kode_layanan | Kode Layanan | String | Ya | Unik global | auto | Kode ringkas. |
| nama_layanan | Nama Layanan | String | Ya | Max 120; **unik global** | input | BR-01. |
| id_casemix | Komponen Casemix | UUID (FK) | **Ya** | exists; **single-select** | `casemix_component` (14, fixed) | Pemetaan klaim; wajib 1 per layanan (BR-33). |
| kelompok_layanan | Kelompok Layanan | String/Enum | Tidak | — | input | Mis. Tindakan/Konsultasi/Penunjang. |
| kode_casemix | Kode Casemix (INA-CBG) | String | Tidak | — | input | Kode INA-CBG bebas (opsional). |
| deskripsi | Deskripsi | Text | Tidak | Max 500 | input | — |
| unit_ids | Unit (cakupan ketersediaan) | Array<UUID FK> | Tidak | tiap exists | Master Unit (**multi-select**) | Junction `service_unit`. **Bukan dimensi tarif** (BR-37); menentukan di unit mana layanan diberikan. Kosong = semua unit. |
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
| id_tipe_penjamin | Penjamin (varian) | UUID (FK) | Tidak | ∈ `service.tipe_penjamin_ids` | **sistem** (auto-expand) | Tidak dipilih di Data Tarif. Unit tidak jadi varian (BR-37). |
| id_kelas | Kelas (varian) | UUID (FK) | Tidak | ∈ `service.kelas_list` (BR-28) | **sistem** (auto-expand) | Tidak dipilih di Data Tarif. |
| tipe_nominal | Tipe Nominal | Enum | Ya | `NOMINAL`/`PERSEN`; `PERSEN` hanya komponen Non-Medis | pilih (default NOMINAL) | BR-35. |
| nominal | Nominal | Integer (Rp) | Ya bila `NOMINAL` (min 1 sel/layanan) | ≥ 0 | input per sel varian | Min 1 sel terisi (BR-23). |
| persen | Persentase (%) | Numeric(5,2) | Ya bila `PERSEN` | 0–100 | input per sel varian | Basis = Σ Jasa Medis konteks (BR-35). |
| status_aktif | — | Boolean | Ya (sistem) | default `true` | sistem | Nonaktif diabaikan saat resolusi (BR-14). |
| effective_date | — | Date | Tidak | — | sistem | Disiapkan Phase 2; Phase 1 tanpa backdate (BR-27). |

*Section C — Form [+ Tambah Komponen Tarif] (`tariff_component`)* — aksi inline pada Data Tarif (FR-05), bukan modul master terpisah; default sistem + dapat ditambah (BR-26/BR-34)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| nama_komponen | Nama Komponen | String | Ya | Unik | input | Mis. Jasa Operator, Jasa Sarana. |
| tipe_komponen | Tipe Komponen | Enum | Ya | `Jasa Medis` / `Non-Medis` | pilih | Menentukan perlu-tidaknya profesi (BR-34). |
| id_profesi | Operator default (Profesi) | UUID (FK) | **Ya bila Medis** | exists; wajib bila `Jasa Medis`, kosong bila Non-Medis | Master Profesi A57 | Operator raw pertama komponen ini; operator lain = raw (BR-34/BR-41). |
| coa_id_pendapatan | Mapping COA | UUID (FK) | Tidak (Phase 3) | akun exists, aktif, kategori Pendapatan (bila diisi) | Master COA | Phase 3; non-blocking (BR-30/31). |
| status_aktif | Status | Boolean | Ya (sistem) | default `true` | sistem | Nonaktif = tak muncul saat pilih komponen tarif. |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View / Dashboard)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kode | `kode_layanan` | teks | sort | — |
| Nama Layanan | `nama_layanan` | teks | search, sort | — |
| Unit (ketersediaan) | daftar unit (join `service_unit`) | teks/chips | filter | Di unit mana layanan tersedia (BR-37). |
| Komponen Casemix | `id_casemix` (join nama) | teks/badge | filter | Wajib 1 per layanan (BR-33). |
| Komponen Tarif | count komponen tarif dipakai | angka (mis. "3 komponen") | — | Dari baris tarif aktif. |
| Varian Tarif | count baris tarif aktif | angka (mis. "12 varian") | sort | Dihitung dari baris **aktif** (BR-14). |
| Total Rupiah (Rentang) | total per konteks (Σ Jasa Medis + Non-Medis nominal & %), min–max antar-varian | "Rp150.000 – Rp450.000" | sort | Termasuk hasil % (BR-35); resolusi BR-13/BR-36. |
| Variasi | distinct dimensi | badge 🏷Operator 💳Penjamin 🛏Kelas | filter | 🏷Operator = multi raw (BR-41). Hanya bila distinct > 1 (BR-25). Unit = ketersediaan, bukan varian (BR-37). |
| Status COA | kelengkapan `coa_id_pendapatan` | badge terpetakan/belum | filter | **[Phase 3]** (FR-06 AC4). |
| Status | `status_aktif` | toggle | filter | Aktif/Nonaktif (FR-04). |
| Aksi | — | Detail/Edit · (⋯) | — | — |

**Business Rules**
* **BR-01**: `nama_layanan` **unik global**; duplikat ditolak. *(Instalasi tidak dipakai — cukup Unit sebagai cakupan ketersediaan, BR-37.)*
* **BR-10**: `service_tariff.id_profesi` = **operator** yang diinput **per raw** untuk komponen `MEDIS` (dari Master Profesi A57); komponen `NON_MEDIS` tanpa operator (`id_profesi` NULL). Lihat raw & akumulasi di BR-41.
* **BR-11**: Kombinasi (`id_layanan`,`id_komponen`,`id_profesi`,`peran`,`id_tipe_penjamin`,`id_kelas`) **UNIK**. NULL dihitung sebagai nilai "umum". `peran` memungkinkan >1 tarif untuk profesi identik pada varian sama (BR-29). *(Unit tidak masuk keunikan — bukan dimensi tarif, BR-37.)*
* **BR-12**: Field syarat (`id_tipe_penjamin`,`id_kelas`) yang kosong berarti **berlaku umum** (wildcard).
* **BR-13 (Resolusi tarif — presedens) [DISETUJUI]**: Untuk tiap **raw (operator)** dalam sebuah komponen, sistem memilih varian **paling spesifik** yang cocok — syarat eksplisit didahulukan atas wildcard/umum; bila seri, **tie-break = nominal tertinggi**. **Subtotal komponen = akumulasi (Σ) seluruh raw operator aktif** komponen tsb (BR-41) — bukan pilih salah satu. **Urutan hitung total konteks**: (1) jumlahkan seluruh komponen **Jasa Medis** (Σ raw per komponen) → basis; (2) tambahkan komponen **Non-Medis** — nominal Rupiah apa adanya, sedangkan komponen ber-**`PERSEN`** = `persen% × basis` (BR-35).
* **BR-14**: Baris tarif `status_aktif=false` diabaikan saat resolusi & tidak dihitung pada rentang Dashboard.
* **BR-15 (Varian auto-generate)**: Dimensi tarif **Tipe Penjamin & Kelas** ditetapkan multi-select di Data Layanan (`tipe_penjamin_ids`/`kelas_list`). Data Tarif tidak menyediakan input dimensi ini; sistem membentuk kombinasi (kartesian; dimensi kosong = wildcard). `id_tipe_penjamin`/`id_kelas` baris tarif di-set sistem, selalu ∈ multi-select Section A. **Unit tidak** membentuk varian tarif (BR-37).
* **BR-20 (Soft-inactivate)**: Layanan/komponen tarif/baris tarif yang pernah dipakai transaksi tidak boleh dihapus fisik — hanya dinonaktifkan. Menonaktifkan Layanan **tidak** menyentuh baris tarifnya (tetap tersimpan; pulih saat diaktifkan).
* **BR-23**: Layanan wajib memiliki **≥ 1 baris tarif aktif** untuk berstatus Aktif; pada matriks varian minimal **1 sel** wajib diisi nominal (sel kosong tidak membuat baris).
* **BR-24 (Master Komponen Casemix — 14 fixed)**: Master Komponen Casemix berisi **14 komponen casemix** — diturunkan dari 18 komponen casemix, kecuali Obat, Obat Kronis, Obat Kemoterapi, BMHP. Dipakai sebagai opsi **single-select** di header Data Layanan (`service.id_casemix`) untuk pemetaan klaim. Daftar 14 Komponen Casemix:
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
* **BR-25 (Informatif Dashboard)**: Penanda variasi dihitung dari nilai distinct baris tarif aktif; badge hanya tampil bila distinct > 1.
* **BR-26 (Komponen Tarif — default sistem + dapat ditambah)**: Data Tarif diuraikan per **Komponen Tarif** (master `tariff_component`). Sistem menyediakan **daftar default (non-casemix)**; pengguna dapat menambah/ubah/nonaktif (form: Nama, Tipe, Profesi bila Medis, Mapping COA — BR-34). Layanan wajib memiliki **≥ 1 komponen tarif** dengan tarif aktif. Komponen Tarif **terpisah** dari 14 Komponen Casemix (yang dipetakan sekali di header). Daftar default (seed) [PERLU KONFIRMASI]:
    1. Jasa Sarana — Non-Medis
    2. Jasa Pelayanan — Medis (profesi [PERLU KONFIRMASI])
    3. Bahan Habis Pakai (BHP) — Non-Medis
    4. Akomodasi — Non-Medis
* **BR-27 (Tanpa backdate Phase 1)**: Perubahan tarif berlaku sejak disimpan; `effective_date` & riwayat versi baru aktif di Phase 2.
* **BR-28 (Sumber Kelas = A58)**: `id_kelas`/`kelas_list` merujuk **Master Data Kelas (A58)** (FK/lookup), bukan enum tetap.
* **BR-29 (Peran pembeda profesi identik)**: Satu komponen tarif boleh >1 baris tarif untuk profesi sama pada varian sama, dibedakan `peran`; dua baris profesi+varian sama wajib beda `peran`.
* **BR-30 (Mapping COA per komponen tarif) [Phase 3]**: Akun pendapatan ditentukan per komponen tarif (`tariff_component.coa_id_pendapatan`); semua baris tarif komponen tarif sama memakai akun sama. Komponen tarif tanpa mapping ditandai di Dashboard.
* **BR-31 (Validasi akun COA) [Phase 3]**: `coa_id_pendapatan` wajib akun exists, aktif, kategori **Pendapatan** di Master COA; kategori lain/nonaktif ditolak.
* **BR-32 (Konsumsi posting jurnal) [Phase 3]**: Modul menyediakan pemetaan COA; posting jurnal dilakukan modul Keuangan/Billing. `resolve` mengembalikan `coa_id_pendapatan` per komponen tarif.
* **BR-33 (Komponen Casemix single-select per layanan)**: Tiap layanan **wajib** memetakan **tepat 1** Komponen Casemix (`service.id_casemix`, NOT NULL) via single-select di header Data Layanan, untuk kesiapan klaim BPJS/INA-CBG. Daftar **14 Komponen Casemix bersifat fixed/read-only** — admin **tidak dapat** menambah/mengubah/menonaktifkan (mengikuti standar casemix).
* **BR-34 (Tipe Komponen Tarif — Medis/Non-Medis)**: Tiap komponen tarif (`tariff_component`) wajib bertipe **`MEDIS`** atau **`NON_MEDIS`**. Komponen `MEDIS` menetapkan **operator default** (`id_profesi`, Master Profesi A57) — dipakai memprefill **raw pertama** saat komponen dipakai layanan; komponen `NON_MEDIS` tidak memiliki operator (`id_profesi` NULL). Operator tambahan ditambahkan sebagai **raw** per layanan (BR-41); pembedaan operator identik via `peran` (BR-29). Field **Mapping COA** (`coa_id_pendapatan`, Phase 3) diisi per komponen tarif — opsional & non-blocking (BR-30/31).
* **BR-35 (Tarif persentase untuk komponen Non-Medis)**: Baris tarif komponen **Non-Medis** dapat bertipe **`NOMINAL`** (Rupiah) atau **`PERSEN`**. Bila `PERSEN`, nilai efektif = `persen% × Σ nominal komponen Jasa Medis` pada **varian/konteks yang sama** (mis. Jasa Sarana = 40% jasa medis), **dibulatkan ke atas (ceiling)** ke **Rupiah bulat (tanpa desimal)**. `persen` ∈ 0–100. Komponen **Jasa Medis** hanya menerima `NOMINAL`. Bila basis Jasa Medis = 0 (tidak ada komponen medis pada konteks), komponen `PERSEN` = Rp0. Pilihan **Rupiah/%** disediakan sebagai **toggle di titik input** (per sel) — pengguna bebas mengisi sel Non-Medis sebagai **nominal Rupiah** *atau* **persentase**, dan dapat berpindah kapan saja (nilai efektif disimpan konsisten dengan `tipe_nominal` baris).
* **BR-36 (Total Rupiah layanan)**: Sistem menghitung **total Rupiah** layanan per varian/konteks = Σ Jasa Medis + Σ Non-Medis (nominal & hasil %, BR-35), dari baris tarif **aktif** (BR-14). Total ditampilkan **live di header form input** saat entri/edit dan sebagai **kolom Total/Rentang di Dashboard** (min–max antar-varian).
* **BR-37 (Unit = cakupan ketersediaan, BUKAN dimensi tarif)**: **Unit** yang dipilih multi-select di header (Section A, `unit_ids` → `service_unit`) hanya menetapkan **di unit mana layanan dapat diberikan** (ketersediaan/scope). Unit **tidak** membentuk varian tarif, **tidak** masuk matriks Data Tarif, dan **tidak** masuk keunikan baris (BR-11). Tarif **tidak berbeda** berdasarkan unit. Unit kosong = layanan tersedia di semua unit. Billing memakai Unit untuk memeriksa ketersediaan, bukan menentukan harga.
* **BR-38 (Mode pengisian nominal — seragam / per-sel)**: Saat mengisi tarif suatu komponen, pengguna memilih mode **Seragam** (satu nilai — nominal Rupiah atau persen — diterapkan ke **seluruh sel** matriks varian Tipe Penjamin × Kelas) atau **Per-sel** (nilai tiap sel diisi berbeda). Mode Seragam hanya mempercepat pengisian; nilai per sel tetap dapat di-**override** setelahnya. Konsistensi tipe (nominal/persen, BR-35) & keunikan (BR-11) tetap berlaku.
* **BR-39 (Copy tarif antar-komponen)**: Nilai tarif dari komponen tarif yang **sudah diisi** dapat **disalin** ke komponen tarif lain pada **layanan yang sama** (utilitas produktivitas). Penyalinan mengikuti sel varian yang bersesuaian; hasil salinan **dapat diubah**. Bila tipe komponen tujuan berbeda (mis. Non-Medis %), nilai tersalin sebagai nominal awal dan pengguna menyesuaikan tipe/nilai (BR-35).
* **BR-41 (Raw / Multi-Tagging operator & akumulasi)**: Tiap **Komponen Tarif** pada suatu layanan dapat memiliki **≥1 raw (baris operator)**. Tiap raw = **1 Operator** (`id_profesi` A57 + `peran` opsional) dengan **tarif tersendiri** per varian (Penjamin × Kelas). Komponen `MEDIS` **wajib ≥1 raw** — **raw pertama = operator default** komponen (BR-34, terisi otomatis); **penambahan raw operator bersifat OPSIONAL** ([+ Tambah Raw/Operator]). Komponen `NON_MEDIS` = 1 raw tanpa operator. **Tarif/subtotal komponen (per varian) = akumulasi (Σ) seluruh raw aktif** — contoh: Jasa Medis dengan raw Dokter Bedah Rp10.000 + Asisten Dokter Bedah Rp8.000 = **Rp18.000**. Tiap operator boleh bertarif berbeda → dasar **Laporan Jasa Medis** per operator. **Setting raw ini disediakan/dikonsumsi fitur Tindakan & BHP** (operator per komponen mengikuti setting di modul ini). Keunikan raw = (`id_layanan`,`id_komponen`,`id_profesi`,`peran`,`id_tipe_penjamin`,`id_kelas`) — BR-11.
* **BR-40 (Komponen Tarif default & prospektif)**: Komponen tarif yang **ditambah** via [+ Tambah Komponen Tarif] disimpan `is_default=true` → **otomatis dimuat** pada form **Tambah Data Layanan berikutnya** (komponen `is_default & status_aktif`). Perubahan daftar default berlaku **prospektif** — **hanya untuk layanan baru**. **Layanan existing tidak berubah**: baris tarif (`service_tariff`) adalah **snapshot** komponen yang dipilih saat itu; histori tetap dipertahankan. Layanan lama hanya berubah bila **di-Edit manual** (menambah/ubah komponen). Admin dapat menandai komponen non-default (`is_default=false`) agar tidak muncul otomatis (tetap dapat ditambah manual).

## 9. Workflow / BPMN Interpretation

Modul **belum memiliki BPMN sendiri** (cluster Control Panel / master data). Alur berikut **diturunkan [ASUMSI]** dari pola master data sejenis.

**Alur To-Be — Tambah Data Layanan (Phase 1)**
1. **Aktor: Petugas Casemix** membuka Dashboard → klik **[+ Tambah Data Layanan]**.
2. **Section A — Data Layanan**: isi Nama, Kode, **Komponen Casemix (single-select, 1 dari 14 — BR-33)**, Kelompok, (Kode Casemix/INA-CBG), Deskripsi, **multi-select Unit** (cakupan ketersediaan — BR-37), serta **multi-select** cakupan varian tarif Tipe Penjamin/Kelas (opsional; kosong = umum) — BR-15. *(Instalasi tidak diinput.)* Sistem set `status_aktif=true`, `status_approval=APPROVED`.
3. **Section B — Data Tarif**: petugas menguraikan harga per **Komponen Tarif** dari master komponen tarif (default sistem + dapat ditambah — BR-26; wajib ≥1). Komponen tarif baru dapat dibuat **inline** via aksi **[+ Tambah Komponen Tarif]** (Nama, Tipe Medis/Non-Medis, Profesi bila Medis, Mapping COA — BR-34); komponen ini menjadi **default untuk layanan berikutnya** (prospektif; layanan lama tetap — BR-40). Untuk tiap komponen tarif, sistem **membentuk matriks kombinasi varian** dari multi-select Section A. Untuk komponen Medis, petugas menambah **raw/operator** ([+ Tambah Raw]) — tiap raw = 1 Operator (profesi A57 + Peran opsional, BR-29) dengan **tarif sendiri**; raw pertama = operator default (BR-34). **Subtotal komponen = Σ raw** (akumulasi, BR-41). Lalu **isi Nominal** per sel varian (Penjamin × Kelas; Unit tidak jadi varian — BR-37). Untuk komponen **Non-Medis**, nominal dapat diisi **Rupiah** atau **persentase (%)** dari total Jasa Medis (BR-35). Pengisian dapat **Seragam** (1 nilai untuk semua sel) atau **Per-sel** (BR-38), dan tarif dapat **disalin (copy)** dari komponen lain yang sudah diisi (BR-39). Header menampilkan **total Rupiah live** per varian (BR-36).
4. **Gateway validasi**: unik BR-11? ≥1 sel/tarif aktif BR-23? nominal ≥0 / persen 0–100 (dan % hanya Non-Medis, BR-35)? → bila gagal, error inline (§7.1 wording).
5. **Simpan (atomik)**: Data Layanan (termasuk `id_casemix`) + seluruh baris tarif ditulis dalam satu transaksi → kembali ke Dashboard; ringkasan variasi & **total Rupiah** otomatis ter-hitung.

**Alur Edit / Aktif-Nonaktif**
* **Edit**: buka layanan → ubah section A/B (mengubah multi-select menyusun ulang matriks varian; Komponen Casemix dapat diubah) → simpan (validasi sama; tanpa backdate BR-27).
* **Toggle Status**: Dashboard → toggle → konfirmasi → `status_aktif` berubah (BR-20; tarif tidak disentuh).

**Alur Konsumsi (Billing — di luar scope, referensi)**
* Saat transaksi, Billing memanggil `resolve` dengan konteks (unit, penjamin, kelas); sistem menerapkan **BR-13** (paling spesifik menang; tie-break nominal tertinggi) memilih baris per komponen tarif & menjumlahkan → total tarif. Klaim BPJS memakai `id_casemix` layanan sebagai acuan komponen casemix.

**Alur Mapping COA (Phase 3) [ASUMSI]**
1. **Staf Keuangan** melengkapi **Mapping COA per komponen tarif** (`coa_id_pendapatan`) — via field pada form komponen tarif atau daftar komponen tarif (Phase 3), bukan modul master terpisah — BR-30.
2. Sistem memvalidasi akun (exists, aktif, kategori Pendapatan) — BR-31; komponen tarif belum dipetakan ditandai (FR-06 AC4).
3. Saat transaksi, `resolve` menyertakan `coa_id_pendapatan` per komponen tarif → **modul Keuangan menyusun & posting jurnal pendapatan otomatis** (BR-32).

## Asumsi
- [ASUMSI] Modul belum memiliki BPMN sendiri (cluster Control Panel). Alur As-Is/To-Be & workflow diturunkan dari pola master data sejenis — ditandai [ASUMSI] pada §9.
- [ASUMSI] Master Data Unit, Tipe Penjamin, Kelas (A58), dan Profesi (A57) sudah tersedia sebagai referensi dropdown; Tarif Layanan hanya mereferensikan (FK). *(Instalasi tidak dipakai.)*
- [ASUMSI] Nominal tarif disimpan sebagai bilangan bulat Rupiah (tanpa desimal sen).
- [ASUMSI] 14 Komponen Casemix diturunkan dari 18 komponen casemix, mengecualikan Obat, Obat Kronis, Obat Kemoterapi, dan BMHP.
- [PERLU KONFIRMASI] Daftar **default Komponen Tarif** (seed non-casemix) + tipe & profesi-nya — usulan awal: Jasa Sarana (Non-Medis), Jasa Pelayanan (Medis — profesi?), BHP (Non-Medis), Akomodasi (Non-Medis) (BR-26/BR-34).
- [KEPUTUSAN] Komponen Tarif bertipe **Jasa Medis** (operator default 1 profesi A57) atau **Non-Medis** (tanpa operator); Mapping COA per komponen tarif (Phase 3) — BR-34.
- [KEPUTUSAN] Tiap komponen (Medis): **raw pertama = default** (operator default komponen, wajib/otomatis); **penambahan raw operator opsional**. Tarif komponen = **akumulasi (Σ) raw** (Dokter Bedah + Asisten dst); dasar **Laporan Jasa Medis** & dikonsumsi fitur **Tindakan & BHP** — BR-41.
- [KEPUTUSAN] Komponen **Non-Medis** dapat diisi **persentase (%)** dengan basis **total Jasa Medis** (BR-35); **total Rupiah** layanan tampil di header form (live) & Dashboard (BR-36).
- [KEPUTUSAN] **Unit dikeluarkan dari dimensi tarif** — Unit hanya = cakupan ketersediaan (di unit mana layanan diberikan); varian tarif = **Tipe Penjamin × Kelas** saja (BR-37).
- [KEPUTUSAN] **Tambah Komponen Tarif** disimpan sebagai **default prospektif** (`is_default`) — otomatis dimuat pada layanan baru; **layanan existing tetap** (snapshot, histori dipertahankan), berubah hanya bila di-Edit manual (BR-40).
- [KEPUTUSAN] Hasil **persentase dibulatkan ke atas (ceiling)** ke Rupiah bulat (tanpa desimal); basis % dihitung **per varian/konteks** (BR-35).
- [KEPUTUSAN] **Komponen Casemix wajib** (tepat 1 per layanan, `id_casemix` NOT NULL) dan daftar **14 casemix fixed/read-only** (admin tak dapat ubah) — BR-33, FR-07.
- [KEPUTUSAN] Komponen Casemix (14, fixed) dipilih **single-select di header** (1 per layanan); Komponen Tarif (default sistem + dapat ditambah) menguraikan harga di Data Tarif (BR-24, BR-26, BR-33).
- [KEPUTUSAN] Mapping COA (Phase 3) per komponen tarif & hanya akun kategori Pendapatan; Master COA & posting jurnal di modul Keuangan.
- [KEPUTUSAN] Phase 1 tidak mendukung backdate tarif (BR-27); menonaktifkan Layanan tidak menyentuh baris tarifnya (BR-20).
- [KEPUTUSAN] Kelas merujuk Master Data Kelas (A58) (BR-28); presedens tarif spesifik menang, tie-break nominal tertinggi (BR-13); field `peran` agar profesi identik boleh >1 tarif (BR-29).
