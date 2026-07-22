# PRD — Billing/Kasir: Verifikasi Penerimaan Kas

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — [PERLU KONFIRMASI: Kepala Keuangan RS & Manajemen]
* **Related Documents**:
  * Fitur ini bisa dikerjakan jika Fitur Tagihan Pasien (G2) sudah selesai dikerjakan.
  * List Fitur V2.xlsx (sheet MVP Fitur Operasional) — G1 Buka & Tutup Kasir, G2 Tagihan Pasien, G3 Pengelolaan Dana Deposito.
  * BPMN acuan (analogi): `g-service-discharge` (Settlement Billing), `g-admisi-onsite-registration` (penjaminan), `g-service-order-lab/radiology/tindakan-bhp` (charge ke billing).
* **Document Version**:
  | Tanggal | Versi | Deskripsi Perubahan |
  |---------|-------|---------------------|
  | 2026-07-08 | 1.0 | Draft awal |
  | 2026-07-08 | 2.0 | Restrukturisasi mengikuti template PRD standar: phasing (Phase 1 CRUD / Phase 2 Approval), State Machine, Acceptance Criteria, wording validasi, skema database (English), rekomendasi API, interpretasi BPMN. |
  | 2026-07-08 | 3.0 | Menyelaraskan dengan UI aktual "Verifikasi Setor Kas": 3 tab (Deposito, Tagihan Pasien, Penjualan Obat Bebas), filter Tanggal/Shift/Search Nama Pasien, verifikasi per transaksi (checkbox) + total tercentang. Tambah tabel `cash_receipt_transactions`, endpoint transaksi, dan revisi spesifikasi layar daftar. |
  | 2026-07-10 | 4.0 | **Menyelaraskan dengan wireframe aktual G4.** Mengganti model "3 tab per jenis + checkbox per transaksi" menjadi: **2 layar** (Daftar Setoran → Detail Verifikasi); **rekonsiliasi berjenjang** *Kategori metode bayar (Tunai/EDC/QRIS/Transfer) → Sub-kategori sumber (Deposito G3 / Resep Obat G2 / Tagihan Pasien G2 / Obat Bebas G2) → Transaksi*; verifikasi via **input kas fisik** (tunai) / **upload bukti settlement** (non-tunai) **per kategori** (bukan checkbox); 3 KPI **Kas Sistem / Fisik-Bukti / Selisih Total**; keputusan dengan **Kategori Selisih** + **Penanggung Jawab** + Keterangan. Revisi §2, §4, §6, §7, §8, §9. |
  | 2026-07-10 | 4.1 | **Berita Acara Verifikasi Kas ditetapkan Phase 1** (FR-006, sebelumnya berlabel Phase 2) + menambah **§8.4 Template baku Berita Acara** (format cetak + pemetaan field ke skema data). Merapikan label fase FR-007/008 & FR-009/010 (sebelumnya salah berprefix `[Phase 2]` padahal Fase = Phase 1). |

---

## 2. Overview & Background

### Overview / Brief Summary

**Verifikasi Penerimaan Kas** adalah modul dalam klaster *Core Integration → Billing/Kasir → Billing* yang memfasilitasi proses **pencocokan (rekonsiliasi) dan pengesahan** seluruh penerimaan kas yang dikumpulkan oleh kasir terhadap transaksi yang tercatat di SIMRS.

Pada RS Tipe C & D, penutupan kasir (shift/harian) menghasilkan **setoran kas fisik** dan **penerimaan non-tunai** (transfer, QRIS, EDC debit/kredit). Modul ini memastikan bahwa jumlah yang disetor kasir = jumlah yang tercatat sistem = jumlah yang diverifikasi bendahara/verifikator, sebelum dana diakui sah dan disetor ke bank / kas besar.

Nilai inti: **kontrol internal (segregation of duties)** antara kasir yang menerima dan verifikator yang mengesahkan, **verifikasi per transaksi**, deteksi **selisih** otomatis, penerbitan **Berita Acara Verifikasi Kas** bernomor, dan **jejak audit** penuh.

### Layar Modul — "Verifikasi Penerimaan Setor Kas"

Modul terdiri dari **2 layar**:

**1. Daftar Setoran** — antrian setoran kasir per tanggal/shift/unit. Verifikator memilih satu setoran (mis. `KS-0709-P-01`) untuk diverifikasi. Kolom: No. Setoran, Kasir, Shift, Tutup (jam), **Kas Sistem** (total tercatat), **Selisih**, **Status** (Menunggu / Terverifikasi / Perlu Koreksi). Filter: Tanggal, Shift, Unit, Search kasir.

**2. Detail Verifikasi** — layar rekonsiliasi satu setoran. Penerimaan disusun **berjenjang 3 level** agar mudah ditelusuri:

| Level | Isi | Contoh |
|-------|-----|--------|
| **Kategori — Metode Bayar** | Cash (Tunai) · Non-Tunai (EDC/Debit) · QRIS · Transfer | akar pohon; punya total Kas Sistem & kontrol input Fisik/Bukti |
| **Sub-kategori — Sumber** | Deposito Pasien (G3) · Resep Obat/Farmasi (G2) · Tagihan Pasien (G2) · Penjualan Obat Bebas (G2) | pengelompokan sumber penerimaan di bawah tiap metode |
| **Transaksi** | 1 baris per transaksi (kode, nama pasien, jam, nominal) | daun pohon |

Di header Detail tampil **3 KPI**: **Kas Tercatat Sistem** (total menurut sistem), **Fisik / Bukti Disetor** (total hasil hitung fisik tunai + bukti non-tunai yang diinput verifikator), dan **Selisih Total** (Fisik − Sistem; berwarna: Kurang=merah, Lebih=hijau/biru, Balance=hijau).

**Cara verifikasi (per kategori metode):**
- **Tunai** → verifikator **mengetik nominal kas fisik** hasil hitung uang pada kolom *Fisik/Bukti*.
- **Non-tunai (EDC/QRIS/Transfer)** → verifikator **mengunggah bukti settlement** (nominal diambil dari bukti) pada kolom *Fisik/Bukti*.

Sistem menghitung **Selisih per kategori & total** = Fisik/Bukti − Kas Sistem secara real-time (⚠ ditandai bila ≠ 0). Tersedia **Expand all / Collapse all**.

> [ASUMSI] Definisi "penerimaan kas" mengikuti hasil tutup kasir modul G1; modul ini adalah tahap kontrol setelah kasir menutup shift dan sebelum penyetoran ke bank/kas besar. Struktur berjenjang (metode bayar → sumber → transaksi) mengikuti tampilan aktual aplikasi.

### Business Process (As-Is vs To-Be)

**As-Is (kondisi saat ini) [ASUMSI]:**
1. Sepanjang shift, kasir menerima pembayaran tagihan pasien (tunai & non-tunai) dari berbagai layanan.
2. Di akhir shift, kasir **tutup kasir** dan menghitung uang fisik secara **manual**.
3. Kasir membuat rekap di kertas/Excel; struk EDC & bukti transfer dikumpulkan terpisah.
4. Bendahara mencocokkan rekap dengan **sebagian** struk — sering hanya total.
5. Bila ada selisih, penelusuran manual & lambat; kadang selisih kecil diabaikan.
6. Uang disetor ke bank **tanpa Berita Acara formal** per sesi.

**Kendala operasional As-Is:** rawan salah hitung & manipulasi; selisih non-tunai (QRIS/EDC/transfer) baru ketahuan akhir bulan; tidak ada jejak audit siapa memverifikasi, kapan, dan atas dasar apa; kebocoran pendapatan sulit dicegah karena tidak ada titik kontrol rekonsiliasi terpusat.

**To-Be (workflow digital yang diusulkan):**
1. Kasir **tutup kasir** (G1) → sistem membentuk **paket setoran** shift tsb dan menampilkannya di **Daftar Setoran** berstatus *Menunggu*. *(analogi: g-service-discharge → Cek status billing/Settlement)*
2. Verifikator memilih setoran (filter Tanggal/Shift/Unit) → buka **Detail Verifikasi**; penerimaan tersaji berjenjang **metode bayar → sumber → transaksi** beserta **Kas Sistem** per level.
3. Verifikator **memvalidasi penerimaan** per kategori metode: **ketik nominal kas fisik** (tunai) dan **unggah bukti settlement** (non-tunai) pada kolom *Fisik/Bukti*.
4. Sistem **hitung selisih otomatis** = Fisik/Bukti (aktual) − Kas Sistem, per kategori & total → status Balance / Lebih / Kurang.
5. **Gateway keputusan:** Balance/selisih dalam toleransi → **Setuju** (Sah); selisih di luar toleransi → wajib isi **Kategori Selisih (Lebih/Kurang)**, **Penanggung Jawab**, dan **Keterangan**, lalu **Setuju dengan catatan** atau **Tolak** (kembali ke kasir). Approval Kepala Keuangan bila > ambang (Phase 2).
6. Penerimaan **Sah** → generate **Berita Acara Verifikasi Kas** (bernomor) → ditandai **Siap Setor Bank** → data tersedia untuk kas besar/jurnal.
7. Semua aksi tercatat di **jejak audit** (immutable).

> Konsistensi: deskripsi To-Be di atas sejalan dengan State Machine (§6) dan Acceptance Criteria (§7).

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Rata-rata waktu verifikasi per sesi kasir | ≤ 10 menit/sesi [ASUMSI] |
| 2 | % sesi kasir terverifikasi di hari yang sama | ≥ 95% [ASUMSI] |
| 3 | % selisih kas yang teridentifikasi & ditindaklanjuti (bukan diabaikan) | 100% selisih tercatat + ada alasan |
| 4 | % penerimaan sah dengan BA bernomor + jejak audit | 100% |
| 5 | Nilai selisih kurang (shortage) per bulan | Tren menurun; [PERLU KONFIRMASI ambang toleransi Rp] |
| 6 | % penerimaan sah yang ditandai siap setor pada H+1 | ≥ 98% [ASUMSI] |

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD + Verifikasi Dasar) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|----------------------------------------|-----------------------------------------|
| **Daftar Setoran** | Antrian setoran kasir (No. Setoran, Kasir, Shift, Tutup, Kas Sistem, Selisih, Status) + filter Tanggal, Shift, Unit, Search kasir | Dashboard analitik tren selisih multi-hari |
| **Detail Verifikasi berjenjang** | Pohon **metode bayar → sumber → transaksi** + Kas Sistem per level + Expand/Collapse + 3 KPI (Kas Sistem / Fisik-Bukti / Selisih) | — |
| **Input Fisik/Bukti per kategori** | Tunai: input nominal kas fisik; Non-tunai: upload bukti settlement per kategori metode | Rekonsiliasi otomatis via API bank/EDC/QRIS |
| **Perhitungan Selisih** | Hitung otomatis (Fisik/Bukti − Kas Sistem) per kategori & total, penanda ⚠ bila di luar toleransi | — |
| **Keputusan Verifikasi** | Setuju / **Setuju dengan catatan** / Tolak + **Kategori Selisih (Lebih/Kurang)** + **Penanggung Jawab** + Keterangan (wajib bila selisih) | **Approval berjenjang Kepala Keuangan** saat selisih > ambang; eskalasi fraud |
| **Berita Acara Verifikasi Kas** | Generate BA bernomor otomatis + **template baku (§8.4)** + lihat/cetak/PDF | Penyesuaian layout BA ke format/regulasi khusus RS |
| **Siap Setor & Kunci Data** | Tandai siap setor; kunci read-only setelah Sah | Pembatalan sah oleh Kepala Keuangan + alasan |
| **Notifikasi & Jejak Audit** | Audit log immutable; notifikasi in-app saat ditolak | Notifikasi eskalasi ke Kepala Keuangan |
| **Verifikasi Multi-sesi** | — | Verifikasi beberapa sesi sekaligus (rekap harian) |
| **Rekonsiliasi Non-Tunai** | Input/upload bukti manual | Rekonsiliasi otomatis via API bank/EDC/QRIS |

> **Catatan phasing:** meski approval berjenjang baru diaktifkan di Phase 2, **arsitektur data sudah menyiapkan** kolom `approver_id`, `approved_at`, dan status `PENDING_APPROVAL` sejak Phase 1 (lihat §8.1) agar tidak perlu migrasi struktur.

**Out of Scope:**
- Proses **Buka & Tutup Kasir** itu sendiri (milik G1) — modul ini hanya **mengonsumsi** hasil tutup kasir.
- Pembuatan/penambahan **tagihan pasien** (G2) dan **deposito** (G3).
- **Pengajuan/penerimaan klaim BPJS & asuransi** (G5–G14) — hanya membaca nilai penerimaan yang sudah dibayar di kasir.
- **Jurnal akuntansi / buku besar (GL) penuh** — modul berhenti di "penerimaan sah & siap setor". [PERLU KONFIRMASI batas integrasi ke GL]
- **Rekonsiliasi bank otomatis** via API bank (Phase 2+). [ASUMSI] MVP: input mutasi manual/upload.

---

## 5. Related Features

Fitur terkait dalam klaster **Core Integration** (List Fitur, sheet MVP):

| Code | Menu | Relasi dengan modul ini |
|------|------|--------------------------|
| **G1** | Billing/Kasir > Buka & Tutup Kasir | **Sumber utama** — sesi kasir & rekap tutup shift jadi input verifikasi |
| **G2** | Billing/Kasir > Tagihan Pasien | Sumber transaksi pembayaran (nominal & metode bayar) |
| **G3** | Billing/Kasir > Pengelolaan dana Deposito Pasien | Penerimaan top-up deposito ikut direkonsiliasi; **refund sisa deposito Tunai dieksekusi G2**, tercatat sebagai kas keluar dan ditampilkan terpisah dari penerimaan saat rekonsiliasi |
| G5–G10 | Casemix > Klaim BPJS | Pembayaran porsi peserta (naik kelas/urun biaya) tercatat di kasir |
| G11–G14 | Casemix > Klaim Asuransi Swasta | Pembayaran umum/relasi asuransi yang dibayar di kasir |
| G18, G21, G22 | Facility Management > Paket tarif/Diskon/Harga obat | Menentukan nominal tagihan yang menghasilkan penerimaan kas |

---

## 6. Business Process & User Stories

### State Machine Table

Status siklus hidup satu **paket verifikasi penerimaan kas** (satu sesi kasir):

| Status | Deskripsi | Efek pada Kas/Data | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------|--------------------|--------------------|
| `PENDING` (Menunggu Verifikasi) | Sesi kasir sudah Tutup (G1), paket penerimaan terbentuk, menunggu verifikasi | Belum diakui sah | → `APPROVED`, `REJECTED` | → `APPROVED`, `REJECTED`, `PENDING_APPROVAL` |
| `REJECTED` (Ditolak) | Verifikator menolak; dikembalikan ke kasir untuk koreksi | Belum sah; wajib alasan | → `PENDING` (setelah kasir koreksi) | → `PENDING` |
| `PENDING_APPROVAL` (Menunggu Approval) | Selisih > ambang eskalasi; menunggu keputusan Kepala Keuangan | Belum sah; terkunci sementara | *(tidak ada — Phase 2)* | → `APPROVED`, `REJECTED` |
| `APPROVED` (Sah) | Penerimaan disahkan; BA diterbitkan | Kas diakui sah; **data terkunci read-only** | → `READY_TO_DEPOSIT` | → `READY_TO_DEPOSIT`, `CANCELLED` |
| `READY_TO_DEPOSIT` (Siap Setor) | Ditandai siap disetor ke bank/kas besar | Data tersedia untuk penyetoran/jurnal | → `DEPOSITED` | → `DEPOSITED`, `CANCELLED` |
| `DEPOSITED` (Disetor) | Sudah disetor ke bank/kas besar | Final | *(terminal)* | *(terminal)* |
| `CANCELLED` (Dibatalkan) | Pembatalan sah oleh Kepala Keuangan + alasan | Membuka kunci untuk koreksi (jejak audit) | *(tidak ada — Phase 2)* | *(terminal, dari APPROVED/READY)* |

> **Status Behavior:** status **tidak** diinput manual di form. Paket verifikasi selalu lahir berstatus `PENDING` (diset sistem saat sesi kasir Tutup). Perpindahan status hanya melalui aksi terkontrol (Setuju/Tolak/Approve/Setor/Batal) dengan audit log.

### User Stories Utama

- **US-001** — Sebagai **Verifikator**, saya ingin membuka **Daftar Setoran** dan memfilter berdasarkan **Tanggal/Shift/Unit**, agar saya melihat setoran kasir mana yang berstatus *Menunggu* untuk diverifikasi. *(analogi g-service-discharge → Cek status billing)*
- **US-001b** — Sebagai **Verifikator**, saya ingin membuka **Detail Verifikasi** satu setoran dan menelusuri penerimaan **berjenjang (metode bayar → sumber → transaksi)**, agar saya paham komposisi penerimaan tunai vs non-tunai beserta sumbernya (Deposito/Resep Obat/Tagihan/Obat Bebas).
- **US-002** — Sebagai **Verifikator**, saya ingin melihat **Kas Tercatat Sistem** per kategori & total (read-only) beserta detail transaksi (kode, nama pasien, jam, nominal), agar punya angka pembanding terhadap fisik/bukti.
- **US-003** — Sebagai **Verifikator**, saya ingin **mengetik nominal kas fisik** (tunai) dan **mengunggah bukti settlement** (non-tunai) **per kategori metode**, agar sistem dapat membandingkannya dengan catatan sistem.
- **US-004** — Sebagai **Verifikator**, saya ingin sistem menghitung **Selisih (Fisik/Bukti − Sistem)** otomatis per kategori & total dengan penanda ⚠, agar saya tidak perlu hitung manual dan tidak salah.
- **US-005** — Sebagai **Verifikator**, saya ingin menyetujui penerimaan yang balance, atau bila ada selisih mengisi **Kategori Selisih, Penanggung Jawab & Keterangan** lalu **Setuju dengan catatan / Tolak**, agar hanya kas yang benar yang disahkan dan selisih terdokumentasi. *(analogi g-service-discharge → Settlement Billing)*
- **US-006** — Sebagai **Kasir**, saya ingin menerima notifikasi bila sesi saya ditolak dan alasannya, agar saya bisa koreksi cepat.
- **US-007** — Sebagai **Kepala Keuangan**, saya ingin menyetujui/menolak penerimaan yang selisihnya melampaui ambang, agar ada kontrol atas anomali. *(Phase 2)*
- **US-008** — Sebagai **Verifikator**, saya ingin mencetak Berita Acara Verifikasi Kas bernomor, agar ada dokumen sah untuk penyetoran & audit.
- **US-009** — Sebagai **Manajemen**, saya ingin dashboard ringkasan penerimaan & selisih harian, agar saya memantau kesehatan kas RS.
- **US-010** — Sebagai **Auditor/Manajemen**, saya ingin melihat jejak audit setiap verifikasi (siapa/kapan/aksi/alasan), agar proses dapat dipertanggungjawabkan.

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Daftar Setoran + Filter** *(FR-001, FR-011)*
* **User Story**: Sebagai Verifikator, saya ingin melihat & memfilter antrian setoran kasir, agar saya bisa memilih setoran yang harus diverifikasi.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Layar menampilkan tabel setoran dengan kolom: **No. Setoran, Kasir, Shift, Tutup (jam), Kas Sistem, Selisih, Status**.
  * **AC 2**: Tersedia filter **Tanggal** (date picker), **Shift** (Pagi/Siang/Malam/Semua), **Unit**, dan **Search kasir** (case-insensitive, partial).
  * **AC 3**: Kolom **Status** memakai badge: *Menunggu* (kuning), *Terverifikasi* (hijau), *Perlu Koreksi* (merah). Kolom **Selisih** menampilkan 0 (netral) atau nominal berwarna (Kurang=merah, Lebih=hijau).
  * **AC 4**: Mengklik baris berstatus *Menunggu* membuka layar **Detail Verifikasi** setoran tsb.

---

**Fitur: Detail Verifikasi Berjenjang (Metode → Sumber → Transaksi)** *(FR-002)*
* **User Story**: Sebagai Verifikator, saya ingin menelusuri penerimaan satu setoran secara berjenjang beserta Kas Sistem-nya, agar punya angka pembanding terstruktur.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Header Detail menampilkan identitas setoran (No. Setoran, Kasir, Shift, Tutup, Unit) + **status pill**, dan **3 KPI**: *Kas Tercatat Sistem*, *Fisik / Bukti Disetor*, *Selisih Total*.
  * **AC 2**: Penerimaan tersaji sebagai **pohon 3 level**: **Kategori (metode bayar)** *Cash (Tunai) / Non-Tunai (EDC/Debit) / QRIS / Transfer* → **Sub-kategori (sumber)** *Deposito Pasien (G3) / Resep Obat-Farmasi (G2) / Tagihan Pasien (G2) / Penjualan Obat Bebas (G2)* → **Transaksi** (kode, nama pasien, jam, nominal).
  * **AC 3**: Tiap node menampilkan **Kas Sistem** agregat (read-only); tersedia **Expand all / Collapse all** dan node dapat dibuka/tutup per klik.
  * **AC 4**: Transaksi dapat ditelusuri ke sumbernya (Deposito → G3; Tagihan/Resep/Obat Bebas → G2). Badge sumber (`G2`/`G3`) tampil di tiap sub-kategori.

---

**Fitur: Input Kas Fisik / Bukti Settlement per Kategori** *(FR-003)*
* **User Story**: Sebagai Verifikator, saya ingin mengisi nominal kas fisik (tunai) dan mengunggah bukti settlement (non-tunai) per kategori metode, agar sistem dapat membandingkannya dengan catatan sistem.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Untuk kategori **Tunai**, kolom *Fisik/Bukti* adalah **input nominal** (angka Rupiah) hasil hitung uang fisik; mengubahnya memutakhirkan Selisih & KPI real-time.
  * **AC 2**: Untuk kategori **Non-tunai** (EDC/QRIS/Transfer), kolom *Fisik/Bukti* adalah tombol **⭱ Bukti** untuk mengunggah bukti settlement; nominal aktual diambil dari bukti.
  * **AC 3**: Untuk non-tunai, **wajib** melampirkan minimal 1 bukti (No. referensi/settlement + file) sebelum kategori dianggap tervalidasi. [PERLU KONFIRMASI]
  * **AC 4**: File bukti hanya menerima pdf/jpg/png ≤ 5MB; file lain/ukuran lebih ditolak dengan pesan error.
  * **AC 5**: Nilai Fisik/Bukti dan Kas Sistem memakai tipe uang presisi (tanpa error pembulatan float).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|-----------|-------|---------------|-------------|
  | Search (kasir) | Text | Optional, partial, case-insensitive | — | "Cari setoran berdasarkan nama kasir" |
  | Kas Fisik (tunai) | Angka (Rp) | Required per kategori tunai, ≥ 0 | "Isi nominal kas fisik hasil hitung" | "Total uang fisik yang dihitung untuk kategori ini" |
  | No. Referensi/Settlement | Text | Required (non-tunai), Max 50 | "No. referensi wajib untuk pembayaran non-tunai" | "No. batch EDC / ID QRIS / no. mutasi" |
  | Bank/Channel | Dropdown | Required (non-tunai) | "Pilih bank/channel" | — |
  | File Bukti | File | Required (non-tunai), pdf/jpg/png, ≤ 5MB | "Unggah bukti (pdf/jpg/png, maks 5MB)" | "Foto struk settlement / screenshot mutasi" |

---

**Fitur: Perhitungan Selisih Otomatis** *(FR-004)*
* **User Story**: Sebagai Verifikator, saya ingin selisih dihitung otomatis per kategori metode & total, agar tidak perlu hitung manual.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: `selisih = fisik_bukti (aktual) − kas_sistem` dihitung **per kategori metode** dan **total**, real-time saat input Fisik/Bukti berubah; nilai muncul di kolom Selisih pohon & KPI *Selisih Total*.
  * **AC 2**: Status selisih diturunkan otomatis: `= 0` → Balance; `> 0` → Lebih; `< 0` → Kurang, ditampilkan dengan warna (hijau/biru/merah) dan penanda **⚠** pada kategori berselisih.
  * **AC 3**: Footer menampilkan **callout**: hijau "kas fisik & bukti cocok — siap disetujui" bila total Balance, atau kuning menyebut **kategori** yang berselisih bila tidak.
  * **AC 4**: Perhitungan menggunakan tipe uang presisi (tanpa error pembulatan float).

---

**Fitur: Keputusan Verifikasi (Setuju / Setuju dengan Catatan / Tolak)** *(FR-005)*
* **User Story**: Sebagai Verifikator, saya ingin menyetujui penerimaan yang balance, atau bila ada selisih mengisi Kategori Selisih, Penanggung Jawab & Keterangan sebelum Setuju dengan catatan / Tolak, agar hanya kas yang benar disahkan dan selisih terdokumentasi.
* **Prioritas**: P0
* **Fase**: Phase 1 (Setuju/Setuju dengan catatan/Tolak) · Phase 2 (approval berjenjang)
* **Acceptance Criteria**:
  * **AC 1 (P1)**: Bila total **Balance**, panel keputusan **tersembunyi** dan setoran dapat langsung **Setuju & Sahkan**.
  * **AC 2 (P1)**: Bila selisih ≠ 0, muncul **panel Keputusan Verifikasi** dengan field **wajib**: **Kategori Selisih** (Lebih/Kurang), **Penanggung Jawab** (dropdown: Kasir penyetor / Supervisor Kasir / Kas kecil-selisih lain-lain), dan **Keterangan**; aksi **Setuju dengan catatan** atau **Tolak**.
  * **AC 3 (P1)**: Verifikator (`verifier_id`) **tidak boleh** sama dengan kasir sesi (`cashier_id`) — segregation of duties (BR-002).
  * **AC 4 (P1)**: Aksi **Simpan & Sahkan** mengubah status setoran → *Terverifikasi*, memicu generate **Berita Acara** dan penandaan siap setor.
  * **AC 5 (P2)**: Bila |selisih| > ambang eskalasi, status berubah ke `PENDING_APPROVAL` dan aksi final memerlukan **approval Kepala Keuangan** (`approver_id`).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|-----------|-------|---------------|-------------|
  | Kategori Selisih | Segmented (Lebih/Kurang) | Required bila selisih ≠ 0 | "Pilih kategori selisih" | otomatis sesuai tanda selisih |
  | Penanggung Jawab | Dropdown | Required bila selisih ≠ 0 | "Pilih penanggung jawab selisih" | "Pihak yang bertanggung jawab atas selisih" |
  | Keterangan | Text | Required bila selisih ≠ 0, Max 255 | "Keterangan wajib diisi untuk selisih di luar toleransi" | "Jelaskan penyebab selisih / alasan penolakan" |
  | Keputusan | Segmented (Setuju dgn catatan/Tolak) | Required bila selisih ≠ 0 | "Pilih keputusan verifikasi" | — |
  | Verifikator | (auto session) | ≠ Kasir sesi | "Anda adalah kasir sesi ini dan tidak dapat memverifikasi sendiri" | — |

---

**Fitur: Berita Acara Verifikasi Kas** *(FR-006)*
* **User Story**: Sebagai Verifikator, saya ingin mencetak Berita Acara bernomor untuk penerimaan yang sah, agar ada dokumen resmi untuk setor & audit.
* **Prioritas**: P0
* **Fase**: **Phase 1**
* **Acceptance Criteria**:
  * **AC 1**: BA hanya dapat diterbitkan untuk penerimaan berstatus `APPROVED`; **otomatis di-generate** saat aksi *Simpan & Sahkan* berhasil (FR-005 AC-4).
  * **AC 2**: Nomor BA di-generate **unik otomatis** (tidak boleh duplikat) dan tidak dapat diubah.
  * **AC 3**: BA dapat **dilihat, diunduh (PDF), dan dicetak** mengikuti **template baku** pada **§8.4**, memuat: nomor BA, identitas setoran (No. Setoran/kasir/shift/unit/tanggal-jam tutup), rincian **per kategori metode** (Kas Sistem/Fisik-Bukti/Selisih), ringkasan total & status selisih, keputusan + Kategori Selisih/Penanggung Jawab/Keterangan (bila ada), serta blok tanda tangan (Kasir, Verifikator, dan Kepala Keuangan bila approval Phase 2).
  * **AC 4**: Isi BA diambil **otomatis** dari data verifikasi (tanpa input ulang manual); field yang belum tersedia ditandai jelas (mis. "—").

---

**Fitur: Penandaan Siap Setor & Penguncian Data** *(FR-007, FR-008)*
* **User Story**: Sebagai Verifikator/Kepala Keuangan, saya ingin menandai penerimaan sah sebagai siap setor dan menguncinya, agar tidak diubah sembarangan.
* **Prioritas**: P0 (kunci) · P1 (siap setor)
* **Fase**: Phase 1 (kunci + siap setor) · Phase 2 (pembatalan)
* **Acceptance Criteria**:
  * **AC 1**: Setelah `APPROVED`, seluruh field penerimaan menjadi **read-only** (tidak dapat diedit).
  * **AC 2**: Penerimaan sah dapat ditandai `READY_TO_DEPOSIT`; datanya tersedia untuk modul kas besar/jurnal (antarmuka data).
  * **AC 3 (P2)**: Hanya **Kepala Keuangan** dapat membatalkan (`CANCELLED`) penerimaan sah, wajib alasan, dan tercatat di audit log.

---

**Fitur: Notifikasi & Jejak Audit** *(FR-009, FR-010)*
* **User Story**: Sebagai Kasir saya ingin diberi tahu bila sesi ditolak; sebagai Auditor saya ingin melihat semua jejak aksi.
* **Prioritas**: P0 (audit) · P1 (notifikasi)
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Setiap perubahan status/keputusan tercatat di audit log immutable (user, timestamp, aksi, status lama→baru, alasan).
  * **AC 2**: Saat sesi ditolak, kasir menerima notifikasi in-app berisi alasan penolakan.
  * **AC 3**: Detail verifikasi menampilkan timeline riwayat aksi yang tersortir waktu.

---

**[Phase 2]** **Fitur: Verifikasi Multi-Sesi (Rekap Harian)** *(FR-012)*
* **User Story**: Sebagai Verifikator, saya ingin memverifikasi beberapa sesi sekaligus, agar rekap harian lebih cepat.
* **Prioritas**: P3
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Verifikator dapat memilih beberapa sesi tertutup dan memprosesnya dalam satu tampilan rekap harian.
  * **AC 2**: Keputusan tetap tercatat per sesi (bukan gabungan) untuk menjaga traceability.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

> Semua tabel memakai `id` UUID (PK), `is_active` boolean (default true), `created_at`/`updated_at` timestamp. Kolom nominal memakai `NUMERIC(18,2)` (tipe uang presisi, bukan float). Kolom `approver_id`/`approved_at`/status `PENDING_APPROVAL` disiapkan sejak Phase 1 untuk approval Phase 2.

* **Table Name**: `cash_receipt_verifications` *(header — 1 baris per sesi kasir)*
    * `id`: UUID (Primary Key)
    * `verification_number`: VARCHAR unique (nomor verifikasi otomatis)
    * `cashier_session_id`: UUID (FK → cashier_sessions / G1)
    * `cashier_id`: UUID (FK → staff)
    * `session_date`: DATE
    * `shift`: VARCHAR (Pagi/Siang/Malam)
    * `total_system_amount`: NUMERIC(18,2)
    * `total_actual_amount`: NUMERIC(18,2)
    * `total_variance`: NUMERIC(18,2)  — total_actual − total_system
    * `variance_status`: VARCHAR (BALANCE/OVER/SHORT)
    * `status`: VARCHAR (PENDING/REJECTED/PENDING_APPROVAL/APPROVED/READY_TO_DEPOSIT/DEPOSITED/CANCELLED) — default `PENDING`
    * `decision`: VARCHAR (APPROVE/APPROVE_WITH_NOTE/REJECT), nullable
    * `variance_category`: VARCHAR (OVER/SHORT — Kategori Selisih Lebih/Kurang), nullable
    * `responsible_party`: VARCHAR (CASHIER/SUPERVISOR/PETTY_CASH — Penanggung Jawab selisih), nullable
    * `reason`: VARCHAR(255), nullable  (Keterangan selisih/penolakan)
    * `note`: VARCHAR(255), nullable
    * `verifier_id`: UUID (FK → staff), nullable
    * `approver_id`: UUID (FK → staff), nullable  *(Phase 2, disiapkan sejak awal)*
    * `verified_at`: TIMESTAMP, nullable
    * `approved_at`: TIMESTAMP, nullable
    * `ba_number`: VARCHAR unique, nullable  (nomor Berita Acara)
    * `deposit_status`: VARCHAR (NONE/READY/DEPOSITED) — default NONE
    * `is_locked`: BOOLEAN (default false)
    * `is_active`: BOOLEAN (default true)
    * `created_at`, `updated_at`: TIMESTAMP

* **Table Name**: `cash_receipt_transactions` *(baris transaksi — daun pohon Detail Verifikasi)*
    * `id`: UUID (PK)
    * `verification_id`: UUID (FK → cash_receipt_verifications)
    * `payment_method`: VARCHAR (CASH/EDC_DEBIT/EDC_CREDIT/QRIS/TRANSFER) — menentukan **kategori (level-1 pohon)**
    * `source_category`: VARCHAR (DEPOSITO / DRUG_PRESCRIPTION / PATIENT_BILL / OTC_SALE) — menentukan **sub-kategori/sumber (level-2 pohon)**
    * `transaction_at`: TIMESTAMP (Tanggal Transaksi, tampil dgn jam WIB)
    * `registration_number`: VARCHAR (No. Pendaftaran, mis. KWI020726-0013.01)
    * `patient_name`: VARCHAR (Nama)
    * `guarantor_type`: VARCHAR (UMUM / BPJS_NON_PBI / BPJS_PBI / INSURANCE), nullable (OTC bisa null)
    * `guarantor_label`: VARCHAR (label tampil, mis. "BPJS NON PBI (Kls.I)")
    * `patient_status`: VARCHAR (mis. REGISTERED — "Pasien Terdaftar")
    * `receipt_status`: VARCHAR (PAID / UNPAID — "Lunas"/"Belum Lunas")
    * `amount`: NUMERIC(18,2) (Nominal — masuk Kas Sistem)
    * `source_ref`: VARCHAR — referensi ke tagihan (G2)/deposit (G3)/penjualan OTC

* **Table Name**: `cash_receipt_verification_lines` *(rekap **per kategori metode bayar** — tempat input Fisik/Bukti & selisih)*
    * `id`: UUID (PK)
    * `verification_id`: UUID (FK → cash_receipt_verifications)
    * `payment_method`: VARCHAR (CASH/EDC_DEBIT/EDC_CREDIT/QRIS/TRANSFER) — **kategori (level-1 pohon)**
    * `payment_kind`: VARCHAR (CASH/NON_CASH) — menentukan kontrol input (tunai=angka fisik, non-tunai=upload bukti)
    * `system_amount`: NUMERIC(18,2)  — Σ amount transaksi kategori (Kas Sistem)
    * `actual_amount`: NUMERIC(18,2)  — kas fisik terhitung (tunai) / total bukti (non-tunai)
    * `variance`: NUMERIC(18,2)  — actual − system
    * `variance_status`: VARCHAR (BALANCE/OVER/SHORT)
    * `transaction_count`: INTEGER

* **Table Name**: `cash_receipt_evidences` *(bukti non-tunai — per kategori metode)*
    * `id`: UUID (PK)
    * `verification_line_id`: UUID (FK → cash_receipt_verification_lines)
    * `reference_number`: VARCHAR(50)
    * `bank_channel`: VARCHAR
    * `evidence_amount`: NUMERIC(18,2)
    * `file_url`: VARCHAR
    * `created_at`: TIMESTAMP

* **Table Name**: `cash_denomination_details` *(rincian pecahan tunai — opsional)*
    * `id`: UUID (PK)
    * `verification_line_id`: UUID (FK)
    * `denomination`: INTEGER (mis. 100000, 50000, …)
    * `quantity`: INTEGER
    * `subtotal`: NUMERIC(18,2)

* **Table Name**: `cash_verification_audit_logs` *(jejak audit immutable)*
    * `id`: UUID (PK)
    * `verification_id`: UUID (FK)
    * `user_id`: UUID
    * `action`: VARCHAR (CREATE/SUBMIT/APPROVE/REJECT/ESCALATE/APPROVAL_DECISION/GENERATE_BA/MARK_READY/DEPOSIT/CANCEL)
    * `from_status`: VARCHAR, nullable
    * `to_status`: VARCHAR, nullable
    * `reason`: VARCHAR(255), nullable
    * `created_at`: TIMESTAMP

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cash-verifications` | List antrian verifikasi (filter: cashier_id, date, status, payment_method) |
| GET | `/api/v1/cash-verifications/dashboard` | Ringkasan kartu (jumlah menunggu, total penerimaan, total selisih kurang) |
| GET | `/api/v1/cash-verifications/{id}` | Detail satu verifikasi (header + lines + evidences) |
| GET | `/api/v1/cashier-sessions?status=CLOSED&unverified=true` | Sesi kasir tertutup yang belum diverifikasi (dari G1) |
| GET | `/api/v1/cash-verifications/{id}/tree?q=` | Pohon Detail Verifikasi (kategori metode → sumber → transaksi) + Kas Sistem per node; `q`=filter transaksi |
| POST | `/api/v1/cash-verifications` | Buat paket verifikasi (setoran) dari sesi kasir (tarik transaksi sistem) |
| PATCH | `/api/v1/cash-verifications/{id}/lines/{lineId}` | Set **Fisik/Bukti** kategori: `actual_amount` (tunai) atau total bukti (non-tunai) → hitung ulang selisih |
| POST | `/api/v1/cash-verifications/{id}/lines/{lineId}/evidences` | Upload bukti settlement non-tunai per kategori (multipart) |
| POST | `/api/v1/cash-verifications/{id}/approve` | Setuju/Setuju dengan catatan (Sah) — validasi verifier ≠ cashier; bila selisih ≠ 0 wajib `variance_category`+`responsible_party`+`reason` |
| POST | `/api/v1/cash-verifications/{id}/reject` | Tolak — keterangan wajib |
| POST | `/api/v1/cash-verifications/{id}/escalate` | Ajukan ke Kepala Keuangan (Phase 2) |
| POST | `/api/v1/cash-verifications/{id}/approval-decision` | Keputusan Kepala Keuangan: approve/reject (Phase 2) |
| POST | `/api/v1/cash-verifications/{id}/berita-acara` | Generate Berita Acara (PDF, nomor unik) |
| PATCH | `/api/v1/cash-verifications/{id}/mark-ready` | Tandai siap setor bank |
| PATCH | `/api/v1/cash-verifications/{id}/deposit` | Tandai sudah disetor |
| POST | `/api/v1/cash-verifications/{id}/cancel` | Batalkan penerimaan sah (Kepala Keuangan, alasan) — Phase 2 |
| GET | `/api/v1/cash-verifications/{id}/audit-logs` | Timeline jejak audit |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Layar 1: "Daftar Setoran"

**Kontrol Filter (header):**
| Kontrol | Tipe | Nilai/Default | Catatan |
|---------|------|---------------|---------|
| Tanggal | date picker | default hari ini | memuat ulang daftar |
| Shift | dropdown | Semua/Pagi/Siang/Malam | memuat ulang daftar |
| Unit | dropdown | Semua | mis. Kasir Rawat Jalan |
| Search | text (icon 🔍) | kosong | **cari by Nama Kasir**, partial, case-insensitive |

**Kolom tabel:**
| Kolom | Sumber Data | Format | Catatan |
|-------|-------------|--------|---------|
| No. Setoran | `verification_number` | text mono | mis. KS-0709-P-01 |
| Kasir | `cashier_id` → nama | text | penyetor |
| Shift | `shift` | text | Pagi/Siang/Malam |
| Tutup | `cashier_sessions.closed_at` | `HH:mm` | jam tutup kasir |
| Kas Sistem | `total_system_amount` | Rp | total tercatat sistem |
| Selisih | `total_variance` | Rp berwarna | 0 (netral) · −x (Kurang, merah) · +x (Lebih, hijau) |
| Status | `status` | badge | Menunggu (kuning) / Terverifikasi (hijau) / Perlu Koreksi (merah) |

> Klik baris *Menunggu* → buka **Layar 2: Detail Verifikasi**.

#### 8.3.1b Spesifikasi Data — Layar 2: "Detail Verifikasi"

**Header setoran:** No. Setoran, Kasir, Shift, Tutup (tanggal+jam), Unit + **status pill**.

**KPI (3 tile):**
| Tile | Nilai | Catatan |
|------|-------|---------|
| Kas Tercatat Sistem | `total_system_amount` | Σ seluruh transaksi (read-only) |
| Fisik / Bukti Disetor | `total_actual_amount` | Σ input fisik tunai + bukti non-tunai |
| Selisih Total | `total_variance` | Fisik − Sistem; warna Kurang/Lebih/Balance |

**Pohon rekonsiliasi (3 level):**
| Level | Kolom tampil | Kontrol |
|-------|--------------|---------|
| **L1 — Kategori (metode bayar)** | Ikon + nama (Cash/EDC/QRIS/Transfer) + `(n trx)` · Kas Sistem · **Fisik/Bukti** · Selisih (⚠ bila ≠ 0) | Tunai: **input nominal**; Non-tunai: tombol **⭱ Bukti** |
| **L2 — Sub-kategori (sumber)** | Nama sumber + badge `G2`/`G3` + `(n trx)` · Kas Sistem | expand/collapse |
| **L3 — Transaksi** | Kode transaksi · nama pasien · jam · Nominal | – |

Kontrol tambahan: **Expand all / Collapse all**. Perhitungan `Selisih = Fisik/Bukti − Kas Sistem` per L1 & total, real-time.

**Footer (callout):** Balance → hijau "Kas fisik & bukti cocok — siap disetujui"; tidak balance → kuning "Selisih ±x (Lebih/Kurang) terdeteksi pada: [kategori]. Wajib isi keterangan sebelum keputusan."

**Panel Keputusan Verifikasi** (tampil bila Selisih ≠ 0):
| Field | Tipe | Opsi/Nilai |
|-------|------|-----------|
| Kategori Selisih | segmented | Lebih / Kurang |
| Penanggung Jawab | dropdown | Kasir (penyetor) / Supervisor Kasir / Kas kecil–selisih lain-lain |
| Keterangan | text | wajib |
| Keputusan | segmented | Setuju dengan catatan / Tolak |
| Aksi | tombol | Batal · **Simpan & Sahkan** |

**Business Rules:**

| ID | Aturan | Traceability |
|----|--------|--------------|
| **BR-001** | Hanya sesi kasir berstatus *Closed* (G1) dapat diverifikasi; sesi *Open* tidak muncul di antrian. | FR-001, AC-1 |
| **BR-002** | Segregation of duties: `verifier_id` ≠ `cashier_id` (kasir tak boleh memverifikasi sesinya sendiri). [PERLU KONFIRMASI kebijakan RS] | FR-005 |
| **BR-003** | `variance = actual_amount (Fisik/Bukti) − system_amount (Kas Sistem)`, dihitung **per kategori metode bayar** & total. Positif=Lebih, negatif=Kurang, nol=Balance. | FR-004 |
| **BR-004** | Jika \|variance\| > **toleransi**, penerimaan tidak boleh disahkan tanpa mengisi **Kategori Selisih (Lebih/Kurang)**, **Penanggung Jawab**, dan **Keterangan**. [PERLU KONFIRMASI nilai toleransi] | FR-005 |
| **BR-005** | "Setuju dengan catatan" saat variance > **ambang eskalasi** wajib approval Kepala Keuangan (`approver_id`). [PERLU KONFIRMASI ambang] (Phase 2) | FR-005 |
| **BR-006** | Kategori **non-tunai** (EDC/QRIS/Transfer) wajib lampiran **bukti settlement** sebelum disahkan; kategori **tunai** wajib input **kas fisik**. | FR-003 |
| **BR-012** | `actual_amount` per kategori = **input kas fisik** (tunai) atau **total bukti settlement** (non-tunai); bukan agregat centang transaksi. | FR-003, FR-004 |
| **BR-007** | Setelah `APPROVED`, data terkunci read-only (`is_locked=true`); koreksi hanya via pembatalan oleh Kepala Keuangan + alasan. | FR-008 |
| **BR-008** | BA hanya terbit untuk status `APPROVED`, dengan `ba_number` unik otomatis (tak boleh duplikat). | FR-006 |
| **BR-009** | Setiap perubahan status wajib mencatat user, waktu, aksi, status lama→baru, dan alasan (jika Tolak/selisih). | FR-010 |
| **BR-010** | Verifikasi harus mencakup **semua metode & penjaminan** sesi; tidak boleh menutup sesi dengan sebagian metode saja. | Konsistensi |
| **BR-011** | Penerimaan top-up deposito (G3) dan pelunasan tagihan (G2) dibedakan dalam rekap namun keduanya masuk rekonsiliasi kas sesi. **Refund sisa deposito Tunai dari G2 dicatat sebagai kas keluar terpisah (pengurang kas bersih), tidak boleh dijumlahkan sebagai penerimaan.** | Related G2/G3 |

### 8.4 Template Berita Acara Verifikasi Kas (Phase 1)

> Dokumen resmi hasil verifikasi setoran kas, di-generate **otomatis** saat setoran berstatus `APPROVED`. Format baku di bawah; nilai `{{...}}` diisi sistem dari data verifikasi. Layout final (kop, font, logo) mengikuti standar RS. [PERLU KONFIRMASI format resmi RS/regulasi]

```text
════════════════════════════════════════════════════════════════════════
                    [KOP / LOGO RUMAH SAKIT]
              {{nama_rumah_sakit}} — {{alamat_rumah_sakit}}

                   BERITA ACARA VERIFIKASI KAS
                     Nomor: {{ba_number}}
════════════════════════════════════════════════════════════════════════

Pada hari ini {{hari}}, tanggal {{tanggal_terbilang}}, telah dilaksanakan
verifikasi dan rekonsiliasi penerimaan setoran kas dengan rincian sebagai
berikut:

A. IDENTITAS SETORAN
   No. Setoran        : {{verification_number}}
   Kasir (Penyetor)   : {{cashier_name}}
   Shift              : {{shift}}
   Unit               : {{unit_name}}
   Tutup Kasir        : {{session_closed_at}}   (tanggal & jam)
   Tanggal Verifikasi : {{verified_at}}

B. RINCIAN PENERIMAAN PER KATEGORI METODE BAYAR
   ┌────────────────────────┬───────────────┬───────────────┬──────────────┐
   │ Kategori (Metode)      │ Kas Sistem    │ Fisik / Bukti │ Selisih      │
   ├────────────────────────┼───────────────┼───────────────┼──────────────┤
   │ Cash (Tunai)           │ {{sys_cash}}  │ {{act_cash}}  │ {{var_cash}} │
   │ Non-Tunai (EDC/Debit)  │ {{sys_edc}}   │ {{act_edc}}   │ {{var_edc}}  │
   │ QRIS                   │ {{sys_qris}}  │ {{act_qris}}  │ {{var_qris}} │
   │ Transfer               │ {{sys_trf}}   │ {{act_trf}}   │ {{var_trf}}  │
   ├────────────────────────┼───────────────┼───────────────┼──────────────┤
   │ T O T A L              │ {{sys_total}} │ {{act_total}} │ {{var_total}}│
   └────────────────────────┴───────────────┴───────────────┴──────────────┘

C. RINGKASAN
   Total Kas Tercatat Sistem : Rp {{sys_total}}
   Total Fisik / Bukti Setor : Rp {{act_total}}
   Selisih Total             : Rp {{var_total}}  ({{variance_status}})
                               (Balance / Lebih / Kurang)

D. CATATAN SELISIH  (diisi bila Selisih ≠ 0)
   Kategori Selisih   : {{variance_category}}    (Lebih / Kurang)
   Penanggung Jawab   : {{responsible_party}}
   Keterangan         : {{reason}}

E. KEPUTUSAN VERIFIKASI
   Keputusan          : {{decision}}   (Setuju / Setuju dengan Catatan / Tolak)
   Status Dokumen     : {{status}}     → Siap Setor Bank

────────────────────────────────────────────────────────────────────────
                          TANDA TANGAN
   Kasir (Penyetor)          Verifikator            Mengetahui,
                                                    Kepala Keuangan*

   (..................)      (..................)   (..................)
   {{cashier_name}}          {{verifier_name}}      {{approver_name}}

   * Kolom Kepala Keuangan diisi bila memerlukan approval (Phase 2);
     bila tidak, cukup ditandai "—".
────────────────────────────────────────────────────────────────────────
Dokumen ini diterbitkan otomatis oleh SIMRS.
No. BA {{ba_number}} · Dicetak: {{printed_at}} · Halaman 1/1
════════════════════════════════════════════════════════════════════════
```

**Pemetaan field → sumber data (§8.1):**
| Placeholder | Sumber |
|-------------|--------|
| `{{ba_number}}` | `cash_receipt_verifications.ba_number` |
| `{{verification_number}}` | `.verification_number` |
| `{{cashier_name}}` | `.cashier_id` → staff |
| `{{shift}}` / `{{unit_name}}` | `.shift` / unit sesi kasir (G1) |
| `{{session_closed_at}}` / `{{verified_at}}` | sesi G1 / `.verified_at` |
| `{{sys_*}}` / `{{act_*}}` / `{{var_*}}` | `cash_receipt_verification_lines` per `payment_method` |
| `{{sys_total}}` / `{{act_total}}` / `{{var_total}}` | `.total_system_amount` / `.total_actual_amount` / `.total_variance` |
| `{{variance_status}}` | `.variance_status` (BALANCE/OVER/SHORT) |
| `{{variance_category}}` / `{{responsible_party}}` / `{{reason}}` | `.variance_category` / `.responsible_party` / `.reason` |
| `{{decision}}` / `{{status}}` | `.decision` / `.status` |
| `{{verifier_name}}` / `{{approver_name}}` | `.verifier_id` / `.approver_id` → staff |
| `{{printed_at}}` | timestamp cetak |

> **Aturan:** BA dibuat sekali per setoran `APPROVED` (BR-008, `ba_number` unik & immutable). Setiap cetak ulang memakai nomor & isi yang sama (read-only, BR-007).

---

## 9. Workflow / BPMN Interpretation

> Modul belum punya BPMN sendiri; alur di bawah diturunkan (analogi) dari `g-service-discharge`, `g-service-order-*`, dan `g-admisi-onsite-registration`. [ASUMSI]

**Alur utama — Verifikasi Penerimaan Kas per Sesi Kasir:**

1. **[Start]** Kasir menutup kasir/shift (G1) → sistem membentuk **paket setoran** berstatus `PENDING`, muncul di **Daftar Setoran**. *(analogi g-service-discharge → Cek status billing)*
2. Verifikator buka **Daftar Setoran** → filter **Tanggal/Shift/Unit** → pilih setoran *Menunggu* → buka **Detail Verifikasi**.
3. Verifikator telusuri pohon **kategori metode bayar → sumber → transaksi** (Expand/Collapse). Sistem tampilkan **Kas Sistem** per node.
4. Verifikator isi **Fisik/Bukti** per kategori: **ketik kas fisik** (tunai) & **unggah bukti settlement** (non-tunai).
5. Sistem **hitung selisih** = Fisik/Bukti (aktual) − Kas Sistem, per kategori & total (real-time), tandai ⚠ pada kategori berselisih.
6. **[Gateway] Selisih dalam toleransi?**
   - **Ya (Balance / ≤ toleransi)** → panel keputusan tersembunyi → langkah 7.
   - **Tidak (Lebih/Kurang > toleransi)** → wajib isi **Kategori Selisih + Penanggung Jawab + Keterangan**; pilih:
     - **Setuju dengan catatan** (Phase 2: butuh approval Kepala Keuangan bila > ambang → status `PENDING_APPROVAL`) → langkah 7.
     - **Tolak** → status `REJECTED`, notifikasi ke kasir → kasir koreksi → kembali ke langkah 4.
7. Verifikator klik **Simpan & Sahkan** → status `APPROVED`, data **terkunci**. *(analogi g-service-discharge → Settlement Billing)*
8. Sistem **generate Berita Acara** (nomor unik) → tandai `READY_TO_DEPOSIT`.
9. **[End]** Penerimaan sah + jejak audit tersimpan; data tersedia untuk penyetoran/jurnal → `DEPOSITED`.

**Skenario alternatif:**
- **A1 — Sesi ditolak:** verifikator Tolak → notifikasi kasir → koreksi → submit ulang.
- **A2 — Selisih besar (fraud/kehilangan):** eskalasi Kepala Keuangan → keputusan + catatan investigasi (Phase 2). [PERLU KONFIRMASI ambang eskalasi]
- **A3 — Verifikasi gabungan:** verifikasi beberapa sesi sekaligus untuk rekap harian (Phase 2).

---

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| **NFR-001** | Auditability | Semua perubahan status & keputusan tercatat immutable (user, timestamp, aksi, alasan); retensi sesuai kebijakan RS. [PERLU KONFIRMASI masa retensi] |
| **NFR-002** | Keamanan & Otorisasi | Role-based access: Kasir (input), Verifikator (verifikasi), Kepala Keuangan (approve/batal). Segregation of duties (BR-002). |
| **NFR-003** | Integritas Data | Nominal disimpan tipe uang presisi NUMERIC(18,2); nomor BA unik & tak dapat diubah. |
| **NFR-004** | Ketersediaan/Offline | Input verifikasi dapat atas data lokal sesi; sinkronisasi bukti non-tunai bila koneksi tersedia. [ASUMSI internet RS C&D tidak stabil] |
| **NFR-005** | Kinerja | Rekap sistem per sesi tampil ≤ 3 detik untuk ≤ ~2000 transaksi. [ASUMSI skala RS C&D] |
| **NFR-006** | Usability | Alur verifikasi ≤ 3 klik dari dashboard ke Setuju; UI sederhana untuk SDM keuangan terbatas. |
| **NFR-007** | Traceability Finansial | Setiap penerimaan sah dapat ditelusuri ke transaksi tagihan (G2) & sesi kasir (G1). |
| **NFR-008** | Backup | Data penerimaan & BA ter-backup harian. [PERLU KONFIRMASI mekanisme backup RS] |

---

## Asumsi

- [ASUMSI] Modul ini menjadi tahap kontrol setelah Tutup Kasir (G1) dan sebelum penyetoran ke bank/kas besar.
- [ASUMSI] Alur As-Is & pemetaan aktor diturunkan dari analogi BPMN g-service-discharge dan g-service-* (charge ke Billing/Kasir), karena modul belum punya BPMN sendiri.
- [ASUMSI] Metode bayar yang didukung: Tunai, Transfer, QRIS, EDC Debit, EDC Kredit — dapat disesuaikan master data RS.
- [ASUMSI] MVP (Phase 1) input/upload bukti non-tunai manual; rekonsiliasi otomatis via API bank/EDC = Phase 2.
- [ASUMSI] Target metrik bersifat indikatif untuk RS Tipe C & D dan perlu divalidasi manajemen.
- [ASUMSI] Penerimaan kas tidak dikirim ke SATUSEHAT (data finansial internal).
- [ASUMSI] Field kanonik (keterangan, alasan, keputusan, approver_id, jenis_pelayanan) mengikuti definisi bersama lintas-PRD; nominal kas memakai tipe uang presisi.

## Pertanyaan Terbuka

- Berapa nilai toleransi selisih kas (tunai vs non-tunai) sebelum wajib alasan/eskalasi? [PERLU KONFIRMASI]
- Berapa ambang nominal selisih yang memicu approval Kepala Keuangan (Phase 2)? [PERLU KONFIRMASI]
- Apakah kebijakan segregation of duties (kasir tak boleh memverifikasi sesinya sendiri) diberlakukan?
- Sampai mana batas integrasi ke jurnal/GL — hanya menandai 'siap setor' atau ikut posting?
- Format & penomoran resmi Berita Acara Verifikasi Kas (mengikuti template RS/regulasi tertentu?).
- Apakah EDC/QRIS RS menyediakan API settlement, atau rekonsiliasi non-tunai murni manual/upload di MVP?
- Masa retensi jejak audit & mekanisme backup data penerimaan kas?
- Daftar bank/channel pembayaran resmi yang perlu jadi master data.
