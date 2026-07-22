# Product Requirement Document (PRD)

# BUKA & TUTUP KASIR — VERIFIKASI SETOR KAS

**Kode Fitur**: G1
**Modul**: Billing / Kasir
**Menu**: SIMRS › Keuangan › Billing › Verifikasi Setor Kas
**Cluster**: Core Integration

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — *[PERLU KONFIRMASI]*
* **PIC PRD**: [Nama PO/PIC] — *[PERLU KONFIRMASI]*
* **Related Documents**:
    * **PRD Tagihan Pasien (G2)** — `result/PRD Tagihan pasien/prd-tagihan-pasien.md` — **sumber data Tab Tagihan Pasien & Tab Penjualan Obat Bebas**; G2 mencantumkan G1 sebagai fitur hilir (setiap penerimaan tunai tertaut ke sesi kasir aktif, dasar rekap Tutup Kasir).
    * **PRD Deposito Pasien / Wadiah (G3)** — sumber data Tab Deposito Pasien — *[PERLU KONFIRMASI tautan]*
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 8 Juli 2026 | 1.0 — Draft awal | Draft awal Buka & Tutup Kasir (Verifikasi Setor Kas): Buka Kasir (input uang tersedia), verifikasi per-transaksi via checklist di 3 tab (Deposito Pasien, Tagihan Pasien, Penjualan Obat Bebas), koreksi tagihan (tambah/edit/hapus), Tutup Kasir (input kas fisik + selisih). |
| 8 Juli 2026 | 1.1 — Revisi hasil konfirmasi PO | Status Kuitansi = Lunas/Belum Lunas; select-all + Edit/Hapus dikonfirmasi ada; transaksi Lunas tidak boleh dihapus; Shift dari Master Shift; input uang tersedia cukup nominal total (denominasi tidak wajib) + modal awal fleksibel/carry-over; tutup kasir & setor hanya TUNAI (non-tunai diverifikasi saja); kolom Status Pasien dihapus (semua pasien discharged). |
| 8 Juli 2026 | 1.2 — Alur & sumber data | Alur diperjelas: Buka Kasir → layani pembayaran di **G2/G3** → verifikasi per tab → klik tombol Verifikasi (ceklist satu/all) → koreksi bila salah → Tutup Kasir hanya setelah semua terverifikasi. Pemetaan sumber data & referensi fitur G2/G3 ditambahkan. |
| 8 Juli 2026 | 1.3 — Koreksi sumber data | Tab **Penjualan Obat Bebas** menarik data dari **G3** (bukan G2). Pemetaan final: Deposito Pasien←**G3**, Tagihan Pasien←**G2**, Penjualan Obat Bebas←**G3**. |
| 8 Juli 2026 | 1.4 — Ralat & tautan G2 | Ralat: **Tab Tagihan Pasien & Tab Penjualan Obat Bebas** keduanya bersumber dari **G2 — PRD Tagihan Pasien** (`result/PRD Tagihan pasien/prd-tagihan-pasien.md`); ditautkan sebagai Related Document. **Deposito Pasien** tetap dari **G3**. Relasi G1↔G2 dikonfirmasi dua arah (G2 mencantumkan G1 sebagai fitur hilir). |
| 8 Juli 2026 | 1.5 — Model verifikasi & batal verifikasi | Verifikasi diubah jadi **pilih via ceklist (satu/semua) → tekan tombol Verifikasi** (ceklist ≠ verifikasi; hanya baris terceklist + klik tombol yang jadi `VERIFIED`). Ditambah fitur **Batal Verifikasi** (`VERIFIED`→`UNVERIFIED`) untuk koreksi human error, **selama kasir masih dibuka** (FR-G1-03B, BR-16). |
| 8 Juli 2026 | 1.6 — Batasan Tambah Transaksi | **Tambah** dibatasi: hanya menambah **billing/tindakan dari data pasien yang dikirim G2/G3**; **tidak bisa membuat transaksi/pasien baru**. Identitas pasien read-only via lookup G2/G3 (FR-G1-04, BR-17, Out of Scope #7). |
| 9 Juli 2026 | 1.7 — Kolom Metode Pembayaran, Dashboard & hapus Phase 2 | Ditambahkan **kolom Metode Pembayaran (Tunai/Non-Tunai)** pada tabel setiap tab (FR-G1-02). Ditambahkan **Ringkasan Setoran (dashboard)** pada layar Verifikasi yang memisahkan nominal **Tunai vs Non-Tunai** (FR-G1-11, US-08). **Phase 2 dihilangkan** dari PRD ini (Setor Kas, Laporan Setoran Kas, Approval Supervisor Keuangan → menjadi Out of Scope); state `DEPOSITED`/`APPROVED`/`REOPENED`, FR-G1-10, tabel `cashier_deposits`, dan endpoint terkait dihapus. Siklus PRD = **Buka → Verifikasi → Tutup**. |
| 16 Juli 2026 | 1.8 — Hapus koreksi/edit tagihan (verifikasi saja) | **Fitur koreksi tagihan (Tambah/Edit/Hapus) dihilangkan sepenuhnya.** G1 **tidak dapat mengedit/mengoreksi tagihan** — G1 **hanya memverifikasi** transaksi. Konsekuensi: FR-G1-04/05/06 (koreksi), status `CORRECTED`, US-03, BR-04/05/07/17 (koreksi/tambah), endpoint POST/PATCH/DELETE `verification-items`, tabel form CREATE/EDIT (§8.3.1), dan aksi Edit/Hapus/Tambah di List View dihapus. Bila ada tagihan salah, koreksi dilakukan di modul sumber (G2/G3), lalu diverifikasi ulang di G1. **Batal Verifikasi** (`VERIFIED`→`UNVERIFIED`) tetap ada untuk koreksi human-error verifikasi. |

---

## 2. Overview & Background

### Overview / Brief Summary

**Buka & Tutup Kasir** adalah modul di lingkup Billing/Kasir yang memfasilitasi kasir melakukan **verifikasi setor kas** pada akhir shift sebelum menyerahkan (menyetor) uang tunai ke keuangan. Melalui layar **Verifikasi Setor Kas**, kasir memeriksa dan mengoreksi seluruh transaksi keuangan yang terjadi dalam satu **tanggal + shift** tertentu, lalu **menandai (checklist) satu per satu** transaksi yang sudah benar. Fitur ini menekankan konsep **Cash-Basis** dimana shift kasir berfokus pada **"Berapa kas tunai/non-tunai pada saat shift kasir tertentu"**.

Transaksi dikelompokkan ke dalam **tiga tab**:

1. **Deposito Pasien** (titipan/uang muka pasien) — pembayaran uang yang dititipkan pasien di muka pada shift kasir saat itu.
2. **Tagihan Pasien** — pembayaran tagihan atas layanan/tindakan pasien pada shift kasir saat itu
3. **Penjualan Obat Bebas** — pembayaran tagihan atas penjualan obat OTC (tanpa resep/dengan resep dari luar) di kasir farmasi.

Fitur ini memungkinkan kasir untuk:

* Memfilter transaksi berdasarkan **Tanggal Transaksi** dan **Shift** (Pagi/Siang/Malam).
* Memeriksa tiap transaksi (nominal, tipe penjamin, status kuitansi) dan **memverifikasi via checklist** bila sudah benar (**verifikasi saja — tidak mengedit/mengoreksi tagihan**).
* Melihat **Total nominal** terverifikasi per tab dan jumlah transaksi yang sudah dicek sebagai dasar setoran kas.

> PRD ini mencakup siklus **Buka Kasir** (input uang tersedia/modal awal) → **Verifikasi** per-transaksi via checklist (**verifikasi saja — tanpa edit/koreksi tagihan**) → **Tutup Kasir** (input kas fisik akhir + hitung selisih). Pada layar Verifikasi, sistem menampilkan **Ringkasan Setoran (dashboard)** yang memisahkan nominal **Tunai vs Non-Tunai** sebagai dasar penyetoran. **G1 tidak dapat mengedit/mengoreksi tagihan**; bila ada tagihan salah, koreksi dilakukan di modul sumber (G2/G3) lalu diverifikasi ulang di G1.

### Business Process (As-Is vs To-Be)

* **As-Is**:
    * Pada akhir shift, kasir merekap transaksi (tagihan, deposito, penjualan obat bebas) secara **manual** (catatan/spreadsheet) untuk mencocokkan uang fisik dengan catatan sistem.
    * Tidak ada mekanisme **checklist per-transaksi** yang terekam: kesalahan billing (salah tarif, transaksi dobel, tindakan belum ter-charge) sering baru ketahuan setelah kas disetor.
    * Tidak ada **jejak audit** siapa memverifikasi transaksi apa dan kapan, sehingga akuntabilitas selisih kas sulit ditelusuri.

* **To-Be** (siklus penuh **Buka → Verifikasi → Tutup**):
    * **Buka Kasir** — di awal shift, kasir membuka sesi kasir untuk **Tanggal + Shift** dan **menginput uang tunai yang tersedia di laci kasir** (modal/saldo awal) sebagai titik mula perhitungan.
    * **Melayani Pembayaran** — sepanjang shift, kasir melayani transaksi pembayaran di modul **G2 (Tagihan Pasien)**. Transaksi-transaksi inilah yang kemudian ditarik ke layar **Verifikasi Setor Kas**.
    * **Verifikasi** — satu layar **Verifikasi Setor Kas** terfilter per **Tanggal + Shift**, menampilkan seluruh transaksi dalam 3 tab: **Tagihan Pasien** (data dari **G2**), **Penjualan Obat Bebas** (data dari **G2**). Kasir **memilih transaksi yang sudah benar via ceklist** — bisa **satu per satu** atau **ceklist semua** — lalu menekan tombol **Verifikasi**; hanya baris terceklist yang berpindah menjadi terverifikasi (ceklist ≠ verifikasi). **Verifikasi bersifat baca/validasi saja — kasir tidak dapat mengedit/mengoreksi tagihan di layar ini.** Bila ada human error verifikasi, kasir dapat **Batal Verifikasi** selama kasir masih dibuka. Sistem menampilkan **jumlah terverifikasi**, **Total nominal**, serta **Ringkasan Setoran (dashboard)** yang memisahkan nominal **Tunai vs Non-Tunai**. **Kasir baru dapat menutup kasir setelah seluruh transaksi terverifikasi.**
    * Bila ada transaksi yang salah, **koreksi tidak dilakukan di layar kasir** — perbaikan tagihan dilakukan di **modul sumber (G2/G3)**, lalu transaksi diverifikasi ulang di layar ini.
    * **Tutup Kasir** — di akhir shift, kasir menutup sesi dan **menginput uang tunai yang tersedia di laci kasir** (kas fisik akhir). Sistem menghitung **kas seharusnya** (saldo awal + total transaksi tunai terverifikasi) dan menampilkan **selisih** terhadap kas fisik.
    * Setiap aksi (buka, verifikasi, batal verifikasi, tutup) **tercatat** (user, waktu, nilai sebelum/sesudah) untuk audit.
    * **Catatan populasi pasien**: seluruh pasien yang muncul di layar kasir adalah pasien yang **sudah dipulangkan/diselesaikan** (discharged), sehingga tidak diperlukan pembedaan *Status Pasien* pada layar ini.

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kecepatan tutup kasir per shift | Rata-rata waktu penutupan kasir turun ≥ 40% dibanding proses manual *[ASUMSI target]* |
| 2 | Akurasi setoran kas | Selisih antara kas fisik dan nominal terverifikasi sistem ≤ Rp 0 (nihil) pada ≥ 95% penutupan shift |
| 3 | Cakupan verifikasi | 100% transaksi dalam shift terverifikasi (dicek) sebelum kasir ditutup (sistem memblokir Tutup Kasir bila masih ada yang belum dicek) |
| 4 | Deteksi kesalahan billing | ≥ 90% kesalahan tagihan (salah tarif/dobel/kurang charge) **terdeteksi** saat verifikasi (ditandai belum-verified) sebelum setor kas; koreksi ditindaklanjuti di modul sumber (G2/G3) |
| 5 | Jejak audit | 100% aksi verifikasi & batal verifikasi tercatat (user, waktu, before/after) |

---

## 4. Scope Definition

| Fitur/Modul | Cakupan (Buka–Verifikasi–Tutup) |
|-------------|---------------------------------|
| **Buka Kasir** | **Buka Kasir** formal: input uang tunai tersedia di laci (modal/saldo awal), waktu buka, kasir pembuka |
| **Filter transaksi** | Filter Tanggal Transaksi + Shift; refresh; search (nama/no. pendaftaran) |
| **Tab Deposito Pasien** | List deposito per shift; kolom **Metode Pembayaran**; verifikasi checklist per baris; total nominal |
| **Tab Tagihan Pasien** | List tagihan per shift; kolom **Metode Pembayaran**; verifikasi checklist per baris; total nominal |
| **Tab Penjualan Obat Bebas** | List penjualan OTC per shift; kolom **Metode Pembayaran**; verifikasi checklist per baris; total nominal |
| **Verifikasi (checklist)** | Ceklist per-transaksi; counter jumlah terverifikasi + Total; blokir tutup bila belum semua diverifikasi. **Verifikasi saja — tanpa edit/koreksi tagihan** |
| **Batal Verifikasi** | Kembalikan baris `VERIFIED` → `UNVERIFIED` untuk koreksi human-error verifikasi, selama kasir masih dibuka |
| **Ringkasan Setoran (dashboard)** | Ringkasan nominal **Tunai vs Non-Tunai** per tab & lintas-tab pada layar Verifikasi (dasar setoran) |
| **Tutup Kasir** | **Tutup Kasir** formal: input uang tunai tersedia di laci (kas fisik akhir), hitung kas seharusnya & **selisih**, waktu tutup |
| **Detail Tagihan** | List Tagihan dapat dilihat detail sesuai dengan data-data Tagihan Pasien di G2

**Out of Scope** (PRD ini):

1. **Setor Kas ke keuangan** (pencatatan penyerahan uang ke bendahara) — modul/proses terpisah, di luar cakupan PRD ini.
2. **Laporan Setoran Kas** otomatis dan cetak bukti setor — di luar cakupan PRD ini.
3. **Approval berjenjang** verifikasi setoran (Supervisor Keuangan) — di luar cakupan PRD ini.
4. **Edit / koreksi / hapus / tambah tagihan** dari layar kasir — **tidak didukung**. G1 hanya **memverifikasi** transaksi; koreksi tagihan dilakukan di **modul sumber (G2/G3)**, lalu diverifikasi ulang di G1.
5. Perubahan pada **mekanisme pembayaran/posting** transaksi (mengikuti PRD Billing yang berlaku) — verifikasi tidak mengubah cara pembayaran, hanya memvalidasi.
6. Rekonsiliasi ke **buku besar/akuntansi (GL)** — modul akuntansi terpisah.
7. Integrasi metode pembayaran non-tunai (EDC/QRIS) untuk rekonsiliasi otomatis — *[ASUMSI: roadmap]*.
8. **Membuat transaksi/pasien baru** dari layar kasir — **tidak didukung** (pendaftaran & transaksi pasien tetap di modul asal G2/G3).

---

## 5. Related Features

* **G2 — Tagihan Pasien** (`result/PRD Tagihan pasien/prd-tagihan-pasien.md`) — **sumber data Tab Tagihan Pasien dan Tab Penjualan Obat Bebas**. Kedua tab tersebut menarik transaksi pembayaran yang dilayani kasir di G2 (read-only di G1). **Koreksi tagihan yang salah dilakukan di G2**, bukan di layar kasir ini. Relasi dikonfirmasi dua arah: PRD G2 mencatat **G1 sebagai fitur hilir** (penerimaan tunai tertaut ke sesi kasir aktif; dasar rekap Tutup Kasir).
* **Manajemen Shift / Master Shift** — sumber nilai dropdown **Shift** (Pagi/Siang/Malam) diambil dari **Master Shift** (dikonfirmasi).

> **Pemetaan sumber data per tab:**
> | Tab | Sumber Data |
> |-----|-------------|
> | Deposito Pasien | **G2** — Tagihan Pasien |
> | Tagihan Pasien | **G2** — Tagihan Pasien |
> | Penjualan Obat Bebas | **G2** — Tagihan Pasien |

---

## 6. Business Process & User Stories

### 6.1 State Machine — Sesi Kasir (Buka → Verifikasi → Tutup)

> Kolom "Efek pada Setoran" menggantikan "Efek Stok" (template) karena domain ini adalah kas, bukan inventori.

| Status | Deskripsi | Efek pada Setoran | Transisi |
|--------|-----------|-------------------|----------|
| `OPEN` (Buka Kasir) | Sesi kasir dibuka untuk Tanggal + Shift; kasir **input uang tunai tersedia di laci** (modal/saldo awal); transaksi mulai terkumpul | Saldo awal tercatat | Buka kasir (input saldo awal) → `VERIFYING` |
| `VERIFYING` (Verifikasi) | Kasir memeriksa & menceklist transaksi (verifikasi saja, **tanpa koreksi tagihan**) | Total nominal terverifikasi berjalan (running) | → `CLOSED` bila semua transaksi terverifikasi |
| `CLOSED` (Tutup Kasir) | Sesi ditutup; kasir **input uang tunai tersedia di laci** (kas fisik akhir); sistem hitung kas seharusnya & **selisih** | Setoran final = kas seharusnya | Terminal |

### 6.2 State Machine — Status Verifikasi per Transaksi

> **Penting:** *ceklist* pada baris hanya **memilih** transaksi (transient, tidak dipersist). Perpindahan ke `VERIFIED` **hanya terjadi saat kasir menekan tombol Verifikasi** atas baris-baris yang terceklist.

| Status | Deskripsi | Transisi |
|--------|-----------|----------|
| `UNVERIFIED` (Belum Diverifikasi) | Transaksi belum diverifikasi (boleh sudah/belum terceklist) | ceklist baris → klik **Verifikasi** → `VERIFIED` |
| `VERIFIED` (Terverifikasi) | Kasir memilih baris lalu menekan tombol **Verifikasi**; dianggap benar | ceklist baris → klik **Batal Verifikasi** → `UNVERIFIED` (selama sesi belum `CLOSED`) |

> Status `CORRECTED` **dihapus** (v1.8): G1 tidak lagi mengedit/mengoreksi tagihan, sehingga hanya ada `UNVERIFIED` ⇄ `VERIFIED`.

### 6.3 User Stories Utama (Role–Task–Goal)

* **US-01** — Sebagai **Kasir**, saya ingin **memfilter transaksi berdasarkan tanggal & shift**, agar saya hanya memverifikasi transaksi shift saya.
* **US-02** — Sebagai **Kasir**, saya ingin **memilih transaksi yang sudah benar via ceklist (satu per satu atau semua) lalu menekan tombol Verifikasi**, agar hanya transaksi yang saya pilih & konfirmasi yang tercatat terverifikasi.
* **US-02B** — Sebagai **Kasir**, saya ingin **membatalkan verifikasi** transaksi yang telanjur salah diverifikasi **selama kasir masih dibuka**, agar human error verifikasi dapat dikoreksi sebelum tutup kasir.
* **US-04** — Sebagai **Kasir**, saya ingin **melihat total nominal & jumlah transaksi terverifikasi per tab**, agar saya punya dasar jumlah uang yang harus disetor.
* **US-05** — Sebagai **Kasir**, saya ingin **mencari transaksi berdasarkan nama/no. pendaftaran**, agar cepat menemukan transaksi yang ingin dicek.
* **US-06** — Sebagai **Kasir**, saya ingin **membuka kasir dan menginput uang tunai yang tersedia di laci (modal awal)** di awal shift, agar ada titik mula perhitungan kas yang jelas.
* **US-07** — Sebagai **Kasir**, saya ingin **menutup kasir dan menginput uang tunai yang tersedia di laci (kas fisik akhir)**, agar sistem menghitung selisih terhadap kas yang seharusnya.
* **US-08** — Sebagai **Kasir**, saya ingin **melihat Ringkasan Setoran (dashboard) yang memisahkan nominal Tunai vs Non-Tunai** pada layar Verifikasi, agar saya tahu jumlah uang tunai yang harus disetorkan.

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Filter Tanggal & Shift**

* **User Story**: Sebagai Kasir, saya ingin memfilter transaksi per Tanggal & Shift, agar hanya melihat transaksi yang relevan dengan sesi saya.
* **ID**: FR-G1-01
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1**: Terdapat input **Tanggal Transaksi** (date picker, default = tanggal hari ini) dan dropdown **Shift** (default = shift berjalan sesuai jam sistem).
    * **AC 2**: Mengubah Tanggal atau Shift memuat ulang seluruh tab dengan transaksi yang cocok.
    * **AC 3**: Tombol **Refresh** memuat ulang data untuk filter aktif tanpa mengganti filter.
    * **AC 4**: Subjudul menampilkan **jumlah transaksi belum diverifikasi**, contoh: "3 transaksi untuk diverifikasi." (bernilai "0" bila semua sudah dicek / tidak ada data).
    * **AC 5**: Bila tidak ada transaksi, tabel menampilkan **"No data available"** dan Total = **Rp 0,00**.

---

**Fitur: Daftar Transaksi per Tab (Deposito Pasien / Tagihan Pasien / Penjualan Obat Bebas)**

* **User Story**: Sebagai Kasir, saya ingin melihat transaksi dikelompokkan per kategori, agar verifikasi terstruktur.
* **ID**: FR-G1-02
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1**: Tersedia 3 tab: **Deposito Pasien**, **Tagihan Pasien**, **Penjualan Obat Bebas**; tab aktif ditandai (garis bawah biru).
    * **AC 2**: Setiap tab menampilkan tabel dengan kolom: **No., Tanggal Transaksi, No. Pendaftaran, Nama, Tipe Penjamin, Status Kuitansi, Metode Pembayaran, Nominal**. Kolom **Metode Pembayaran** menampilkan nilai `Tunai`/`Non-Tunai` (badge) dan tersedia di **ketiga tab**. Nilainya **diturunkan dari transaksi sumber G2/G3** (metode pembayaran yang dikirim modul asal, bukan diinput di layar kasir); hanya `Tunai` yang masuk hitungan kas laci saat Tutup Kasir.
    * **AC 3**: Baris terfilter sesuai Tanggal + Shift + kata kunci Search aktif.
    * **AC 4**: **Total** (footer) menjumlahkan **Nominal** seluruh baris pada tab aktif (format Rupiah, mis. `Rp 0,00`).
    * **AC 5**: Footer menampilkan **jumlah transaksi terverifikasi** dalam format `✓ [n]`.
    * **AC 6**: Pindah tab mempertahankan filter Tanggal/Shift/Search yang aktif.
    * **AC 7**: Tersedia paginasi **Rows per page** (default 10) dengan navigasi halaman sebelumnya/berikutnya.

---

**Fitur: Verifikasi Transaksi (Pilih via Checklist → Tombol Verifikasi)**

* **User Story**: Sebagai Kasir, saya ingin memilih transaksi yang sudah benar lalu menekan tombol Verifikasi, agar hanya transaksi yang saya pilih & konfirmasi yang tercatat terverifikasi.
* **ID**: FR-G1-03
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1 — Ceklist = pilih, bukan verifikasi**: Setiap baris memiliki **checklist** untuk **memilih** transaksi. Menceklist baris **hanya menandai pilihan** (transient/`SELECTED`) dan **belum** mengubah status menjadi `VERIFIED`.
    * **AC 2 — Pilih satu/semua**: Kasir dapat menceklist **satu per satu** atau **ceklist semua** (select-all) baris pada tab aktif; tersedia pula **batalkan pilihan** (unselect-all). Selama belum menekan tombol Verifikasi, status baris tetap `UNVERIFIED`.
    * **AC 3 — Tombol Verifikasi (commit)**: Terdapat tombol **Verifikasi**. Saat ditekan, **hanya baris yang sedang terceklist** yang berpindah status menjadi `VERIFIED`. Jika tidak ada baris terceklist, tombol nonaktif/menampilkan pesan "pilih transaksi terlebih dahulu".
    * **AC 4 — Efek commit**: Setelah verifikasi, counter `✓ [n]` di footer bertambah sejumlah baris yang baru diverifikasi dan angka "transaksi untuk diverifikasi" di subjudul berkurang; ceklist pilihan direset.
    * **AC 5 — Sumber data**: Data tiap tab ditarik dari modul sumbernya: **Deposito Pasien ← G3**, **Tagihan Pasien ← G2**, **Penjualan Obat Bebas ← G2**.
    * **AC 6 — Audit**: Setiap aksi verifikasi (baris mana, oleh siapa, kapan) **tercatat** untuk audit.
    * **AC 7 — Persist per shift+tanggal**: Status `VERIFIED` tersimpan per shift+tanggal — mengganti filter/tab tidak menghapus status yang sudah tersimpan.
    * **AC 8 — Gate tutup kasir**: **Kasir hanya dapat menutup kasir (Tutup Kasir) setelah SELURUH transaksi di ketiga tab berstatus `VERIFIED`** (lihat FR-G1-09 AC-1 & BR-08).

---

**Fitur: Ringkasan Setoran (Dashboard Tunai vs Non-Tunai)**

* **User Story**: Sebagai Kasir, saya ingin melihat ringkasan nominal Tunai vs Non-Tunai pada layar Verifikasi, agar saya tahu jumlah uang tunai yang harus disetorkan.
* **ID**: FR-G1-11
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1 — Panel ringkasan**: Layar Verifikasi Setor Kas menampilkan **panel ringkasan (dashboard)** berisi minimal: **Total Tunai**, **Total Non-Tunai**, dan **Total Keseluruhan** (Tunai + Non-Tunai), dalam format Rupiah.
    * **AC 2 — Cakupan hitungan**: Ringkasan menjumlahkan **seluruh transaksi** pada sesi (Tanggal + Shift) aktif; dapat ditampilkan **per tab** (Deposito Pasien / Tagihan Pasien / Penjualan Obat Bebas) dan **lintas-tab (total sesi)**.
    * **AC 3 — Basis verifikasi**: Ringkasan memisahkan **Terverifikasi vs Belum** untuk masing-masing Tunai/Non-Tunai (mis. "Tunai terverifikasi Rp x dari Rp y"), agar kasir tahu progres verifikasi & jumlah tunai siap setor.
    * **AC 4 — Konsistensi dengan Tutup Kasir**: Nilai **Total Tunai terverifikasi** pada ringkasan = basis **Kas Seharusnya** saat Tutup Kasir (lihat FR-G1-09 AC-4). Nilai **Non-Tunai** ditampilkan sebagai informasi dan **tidak** masuk hitungan kas fisik.
    * **AC 5 — Real-time**: Panel ter-update otomatis setiap ada aksi verifikasi / batal-verifikasi.
    * **AC 6 — Empty state**: Bila tidak ada transaksi, seluruh nilai ringkasan menampilkan **Rp 0,00**.

---

**Fitur: Batal Verifikasi (koreksi human error)**

* **User Story**: Sebagai Kasir, saya ingin membatalkan verifikasi transaksi yang telanjur salah diverifikasi, agar bisa dikoreksi selama kasir masih dibuka.
* **ID**: FR-G1-03B
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1 — Pilih & batalkan**: Kasir dapat memilih (ceklist) baris berstatus `VERIFIED` lalu menekan tombol **Batal Verifikasi**; status baris kembali menjadi `UNVERIFIED`.
    * **AC 2 — Syarat sesi**: Batal Verifikasi **hanya dapat dilakukan selama kasir masih dibuka** (sesi `OPEN`/`VERIFYING`, belum `CLOSED`). Setelah kasir ditutup, batal verifikasi tidak tersedia (lihat BR-16).
    * **AC 3 — Efek**: Setelah batal, counter `✓ [n]` berkurang dan transaksi kembali dihitung sebagai "belum diverifikasi"; kasir dapat memverifikasi ulang setelah tagihan diperbaiki **di modul sumber (G2/G3)** — koreksi tidak dilakukan di layar kasir.
    * **AC 4 — Audit**: Aksi batal verifikasi **wajib tercatat** (baris, user, waktu, opsional alasan) untuk audit.
    * **AC 5 — Konsistensi gate**: Karena baris menjadi `UNVERIFIED`, **kasir tidak dapat ditutup** sampai transaksi tersebut diverifikasi ulang (konsisten BR-08).


---

**Fitur: Search Transaksi**

* **User Story**: Sebagai Kasir, saya ingin mencari transaksi, agar cepat menemukan data yang ingin diverifikasi.
* **ID**: FR-G1-07
* **Prioritas**: P2
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1**: Kolom **Search** memfilter baris pada tab aktif berdasarkan **Nama** dan **No. Pendaftaran** (case-insensitive, partial match).
    * **AC 2**: Hasil kosong menampilkan **"No data available"**.
    * **AC 3**: Search berlaku di atas filter Tanggal + Shift aktif.

---

**Fitur: Buka Kasir — Input Uang Tersedia (Modal Awal)**

* **User Story**: Sebagai Kasir, saya ingin membuka kasir & menginput uang tunai tersedia di laci, agar ada titik mula perhitungan kas shift.
* **ID**: FR-G1-08
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1**: Di awal shift, kasir membuka sesi untuk **Tanggal + Shift**; bila sesi untuk kombinasi tsb sudah dibuka, sistem menolak buka ganda (satu sesi aktif per kasir per tanggal+shift).
    * **AC 2**: Kasir menginput **Uang Tersedia di Kasir (modal/saldo awal)** cukup sebagai **satu nominal total** Rupiah (≥ 0). Rincian pecahan (denominasi) **tidak diwajibkan**.
    * **AC 3**: Modal awal bersifat **fleksibel** — kasir dapat mengisi manual, dan **bila tersedia**, sistem dapat menyarankan nilai dari **sisa kas shift sebelumnya** (carry-over) yang tetap dapat diubah kasir. Carry-over tidak wajib.
    * **AC 4**: Sistem mencatat **waktu buka, kasir pembuka, dan saldo awal**; status sesi menjadi `OPEN`.
    * **AC 5**: Setelah buka, kasir dapat masuk ke layar **Verifikasi Setor Kas**; sebelum dibuka, verifikasi/tutup tidak dapat dilakukan.
    * **AC 6**: Aksi buka kasir tercatat di audit log.

---

**Fitur: Tutup Kasir — Input Uang Tersedia (Kas Fisik Akhir) & Selisih**

* **User Story**: Sebagai Kasir, saya ingin menutup kasir & menginput uang tunai tersedia di laci, agar sistem menghitung selisih terhadap kas seharusnya.
* **ID**: FR-G1-09
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1**: Tutup kasir hanya dapat dilakukan bila **seluruh transaksi sudah terverifikasi** (tidak ada `UNVERIFIED`) — mencakup transaksi tunai **dan non-tunai** (semua wajib diverifikasi kebenarannya); bila belum, sistem memblokir dan menampilkan jumlah yang belum dicek.
    * **AC 2**: Kasir menginput **Uang Tersedia di Kasir (kas fisik akhir)** cukup sebagai **satu nominal total** Rupiah (≥ 0); rincian pecahan **tidak diwajibkan**.
    * **AC 3**: Perhitungan kas laci **hanya memperhitungkan transaksi TUNAI** terverifikasi. Transaksi **non-tunai (EDC/QRIS/transfer)** cukup diverifikasi kebenarannya namun **tidak masuk** perhitungan uang fisik yang disetor.
    * **AC 4**: Sistem menghitung **Kas Seharusnya = Saldo Awal + Total Transaksi Tunai Terverifikasi** dan **Selisih = Kas Fisik − Kas Seharusnya** (lebih/kurang/nihil).
    * **AC 5**: Bila **Selisih ≠ 0**, kasir **wajib mengisi keterangan** selisih sebelum tutup dikonfirmasi.
    * **AC 6**: Sistem mencatat **waktu tutup, kas fisik, kas seharusnya, selisih**; status sesi menjadi `CLOSED`.
    * **AC 7**: Aksi tutup kasir tercatat di audit log.

---

**Fitur: Detail Tagihan - Menampilkan Detail Tagihan**

* **User Story**: Sebagai Kasir, saya ingin melihat detail dari Tagihan yang akan saya verifikasi agar tagihan tersebut sesuai dengan data tagihan aslinya
* **ID**: FR-G1-10
* **Prioritas**: P0
* **Fase**: —
* **Acceptance Criteria**:
    * **AC 1**: Dapat menampilkan Button untuk melihat Detail Tagihan Pasien (G2) pada tiap-tiap data yang akan diverifikasi.
    * **AC 2**: Menampilkan semua Data Tagihan sesuai dengan Tagihan Pasien (G2)
    * **AC 3**: Detail Tagihan tidak dapat diubah apapun, fungsi dari Detail Tagihan hanya untuk memverifikasi lebih detail data yang akan diverifikasi.
    * **AC 4**: Terdapat button untuk menutup kembali detail tagihan dan kembali ke halaman dashboard awal

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `cashier_sessions`** — sesi buka/tutup kasir per user, tanggal, shift.

* `id`: UUID (Primary Key)
* `cashier_user_id`: UUID (FK → users)
* `session_date`: Date
* `shift`: Enum (`PAGI`,`SIANG`,`MALAM`)
* `status`: Enum (`OPEN`,`VERIFYING`,`CLOSED`) — default `OPEN`
* `opening_balance`: Numeric(15,2) — uang tersedia saat buka (modal/saldo awal), default 0
* `physical_cash`: Numeric(15,2) — uang tersedia saat tutup (kas fisik akhir), nullable
* `system_total`: Numeric(15,2) — total transaksi tunai terverifikasi, default 0
* `variance`: Numeric(15,2) — selisih = physical_cash − (opening_balance + system_total), nullable
* `variance_note`: String(255) — keterangan selisih (wajib bila variance ≠ 0), nullable
* `opened_at`: Timestamp — waktu buka kasir, nullable
* `closed_at`: Timestamp — waktu tutup kasir, nullable
* `is_active`: Boolean (default true)
* `created_at` / `updated_at`: Timestamp
* **Unique**: (`cashier_user_id`, `session_date`, `shift`)

**Table: `cashier_verification_items`** — baris transaksi yang diverifikasi (menunjuk ke transaksi sumber, tidak menggandakan billing).

* `id`: UUID (Primary Key)
* `session_id`: UUID (FK → cashier_sessions)
* `category`: Enum (`DEPOSITO_PASIEN`,`TAGIHAN_PASIEN`,`OBAT_BEBAS`) — menentukan tab
* `source_module`: Enum (`G2`,`G3`) — `TAGIHAN_PASIEN` & `OBAT_BEBAS` → **G2**; `DEPOSITO_PASIEN` → **G2**
* `source_id`: UUID — id transaksi pada modul sumber (G2 tagihan/penjualan obat bebas, atau G2 deposito)
* `transaction_date`: Timestamp
* `registration_no`: String, nullable (untuk Obat Bebas bisa kosong)
* `patient_name`: String
* `guarantor_type`: Enum (`UMUM`,`BPJS`,`ASURANSI`,`PERUSAHAAN`)
* `receipt_status`: Enum (`LUNAS`,`BELUM_LUNAS`)
* `payment_method`: Enum (`TUNAI`,`NON_TUNAI`) — **diturunkan dari transaksi sumber G2** (bukan diinput di layar kasir); hanya `TUNAI` masuk hitungan kas laci saat tutup; `NON_TUNAI` (EDC/QRIS/transfer) tetap diverifikasi tapi tidak masuk uang fisik, default `TUNAI`
* `amount`: Numeric(15,2)
* `verification_status`: Enum (`UNVERIFIED`,`VERIFIED`) — default `UNVERIFIED` *(status `CORRECTED` dihapus v1.8 — G1 tidak mengoreksi tagihan)*
* `verified_by`: UUID, nullable (FK → users)
* `verified_at`: Timestamp, nullable
* `created_at` / `updated_at`: Timestamp

> **Catatan (v1.8)**: G1 **tidak** menulis/mengubah/menghapus baris transaksi (read-only dari G2/G3) — kolom soft-delete (`is_deleted`/`deleted_reason`) dihapus. Tabel ini hanya menyimpan **status verifikasi** atas transaksi sumber.

**Table: `cashier_verification_audit`** — jejak audit verifikasi (buka/verify/batal-verify/tutup).

* `id`: UUID (Primary Key)
* `item_id`: UUID (FK → cashier_verification_items), nullable (untuk aksi sesi OPEN/CLOSE)
* `session_id`: UUID (FK → cashier_sessions)
* `action`: Enum (`OPEN`,`VERIFY`,`UNVERIFY`,`CLOSE`) *(aksi `CREATE`/`EDIT`/`DELETE` dihapus v1.8 — G1 tidak mengoreksi tagihan)*
* `before_value`: JSONB, nullable
* `after_value`: JSONB, nullable
* `reason`: String(255), nullable
* `actor_user_id`: UUID (FK → users)
* `created_at`: Timestamp

> **Catatan**: input uang tersedia **cukup satu nominal total** (disimpan langsung di `cashier_sessions.opening_balance` & `physical_cash`), sehingga tabel rincian pecahan **tidak diperlukan**.

**Table: `cashier_cash_counts`** *(opsional / enhancement — di luar cakupan PRD ini)* — rincian uang tunai per-pecahan saat **buka** & **tutup** kasir, bila kelak fitur denominasi diaktifkan.

* `id`: UUID (Primary Key)
* `session_id`: UUID (FK → cashier_sessions)
* `count_type`: Enum (`OPENING`,`CLOSING`) — saat buka atau tutup
* `denomination`: Integer — nilai pecahan (mis. 100000, 50000, …)
* `quantity`: Integer — jumlah lembar/keping
* `subtotal`: Numeric(15,2) — `denomination × quantity`
* `total_amount`: Numeric(15,2) — total uang tersedia (harus = Σ subtotal bila rincian diisi)
* `created_at`: Timestamp

> Catatan mapping ke State Machine (§6.1): `opening_balance` diisi saat `OPEN` (uang tersedia saat buka), `physical_cash` diisi saat `CLOSED` (uang tersedia saat tutup), `system_total` = Σ transaksi **tunai** terverifikasi, `variance` = `physical_cash − (opening_balance + system_total)`.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cashier/sessions?date={date}&shift={shift}` | Ambil sesi kasir aktif untuk tanggal+shift (subjudul count) |
| POST | `/api/v1/cashier/sessions/open` | **Buka Kasir**: buat sesi + input uang tersedia (modal awal) `{date, shift, opening_balance}` |
| GET | `/api/v1/cashier/verification-items?date={date}&shift={shift}&category={cat}&q={search}&page={n}&size={n}` | List transaksi per kategori (tab) + filter/search/paginasi + Total |
| GET | `/api/v1/cashier/verification-items/summary?date={date}&shift={shift}` | **Ringkasan Setoran (dashboard)**: total & terverifikasi per metode pembayaran (Tunai/Non-Tunai) per tab & lintas-tab |
| POST | `/api/v1/cashier/verification-items/verify` | **Verifikasi** (commit) baris terpilih: `{ids:[...]}` → set `VERIFIED` (dipicu tombol Verifikasi, mendukung 1 atau banyak/semua id) |
| POST | `/api/v1/cashier/verification-items/unverify` | **Batal Verifikasi** baris terpilih: `{ids:[...]}` → set `UNVERIFIED` (hanya bila sesi belum `CLOSED`; tombol Batal Verifikasi) |
| POST | `/api/v1/cashier/sessions/{id}/close` | **Tutup Kasir**: input kas fisik `{physical_cash, variance_note}` → hitung selisih (tunai) |

### 8.3 Data & Business Rules

> **Catatan endpoint (v1.8)**: endpoint **POST/PATCH/DELETE `/api/v1/cashier/verification-items`** (tambah/edit/hapus baris) **dihapus** — G1 tidak mengoreksi tagihan. Data transaksi bersifat **read-only** dari G2/G3; koreksi tagihan dilakukan lewat endpoint modul sumber.

#### 8.3.1 Spesifikasi Data — Tampilan Daftar (List View — semua tab)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No. | Nomor urut baris | Integer | Sort by urutan | Nomor urut tampilan |
| Tanggal Transaksi | `transaction_date` | `dd/mm/yyyy HH:mm` | Sort desc default | — |
| No. Pendaftaran | `registration_no` | String | Search | Kosong utk Obat Bebas non-pasien |
| Nama | `patient_name` | String | Search, sort A–Z | — |
| Tipe Penjamin | `guarantor_type` | Badge/label | Filter | Umum/BPJS/Asuransi/Perusahaan |
| Status Kuitansi | `receipt_status` | Badge (warna) | Filter | Lunas/Belum Lunas |
| Metode Pembayaran | `payment_method` (dari G2) | Badge/label | Filter | Berasal dari transaksi sumber G2; Tunai / Non-Tunai — hanya Tunai masuk hitungan kas laci |
| Nominal | `amount` | `Rp #.###,##` | Sort | Dijumlah ke footer **Total** |
| *(kontrol)* Pilih | `selected` (transient) | Checkbox (pilih baris) + select-all | — | Ceklist = memilih, **belum** memverifikasi |
| *(status)* Verifikasi | `verification_status` | Badge `UNVERIFIED`/`VERIFIED` + `✓ [n]` | Filter (verified/unverified) | Counter di footer |
| *(aksi footer)* | — | Tombol **Verifikasi** / **Batal Verifikasi** | — | Verifikasi = commit baris terceklist; Batal = kembalikan `UNVERIFIED` (selama belum tutup) |

#### 8.3.2 Spesifikasi Data — Input Uang Tersedia (Buka & Tutup Kasir)

Dipakai pada layar **Buka Kasir** (`OPENING`) dan **Tutup Kasir** (`CLOSING`).

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| total_amount | Uang Tersedia di Kasir | Currency (integer) | Ya | ≥ 0, numeric | Input kasir | **Cukup satu nominal total.** Modal awal (buka) / kas fisik akhir (tutup) |
| variance_note | Keterangan Selisih | Textarea | Ya bila selisih ≠ 0 (hanya tutup) | Max 255 | Input | Wajib menjelaskan lebih/kurang kas |

> **Rincian pecahan (denominasi) TIDAK diwajibkan** — kasir cukup menginput satu nominal total uang tersedia. (Rincian per-pecahan dapat menjadi enhancement opsional di masa depan; bila kelak diaktifkan, Σ subtotal wajib = total_amount.)
> Saat **buka kasir**, nilai modal awal bersifat **fleksibel**: dapat diisi manual atau — bila tersedia — di-*prefill* dari sisa kas shift sebelumnya (carry-over) dan tetap dapat diubah.

**Business Rules**:

* **BR-01**: **Filter wajib** — data selalu dibatasi 1 **Tanggal + 1 Shift**; tanpa keduanya tabel tidak menampilkan data lintas-shift (mencegah tercampurnya setoran antar-shift).
* **BR-02**: **Ceklist = pilih, bukan verifikasi.** Perpindahan status ke `VERIFIED` **hanya** terjadi saat kasir menekan tombol **Verifikasi** atas baris terceklist. `Total` = Σ `amount` seluruh baris pada tab aktif; angka `✓ [n]` = jumlah baris berstatus `VERIFIED`.
* **BR-03**: Subjudul "**X transaksi untuk diverifikasi**" = jumlah baris `UNVERIFIED` pada tab aktif.
* **BR-04**: **Verifikasi saja (tanpa koreksi).** G1 **tidak** dapat mengedit/menambah/menghapus tagihan. Bila transaksi salah, kasir **tidak memverifikasinya** (biarkan `UNVERIFIED`); perbaikan tagihan dilakukan di **modul sumber (G2/G3)**, lalu transaksi ditarik ulang & diverifikasi di G1.
* **BR-06**: **Semua aksi** (open/verify/batal-verify/close) tercatat di `cashier_verification_audit` (before/after + actor + waktu).
* **BR-07**: **Idempotensi sumber** — G1 tidak menulis ke modul sumber; setiap transaksi sumber (G2/G3) tampil sekali (`source_id` unik per item) tanpa duplikasi.
* **BR-07a**: **Pemetaan sumber data per tab** — **Tagihan Pasien** dan **Penjualan Obat Bebas** menarik data dari **G2 (Tagihan Pasien)**; **Deposito Pasien** menarik data dari **G3 (Pengelolaan Dana Wadiah/Deposito Pasien)**. Data yang tampil = transaksi pada Tanggal + Shift sesi kasir aktif.
* **BR-08**: **Gate tutup kasir** — sesi tidak boleh berpindah ke `CLOSED` bila masih ada baris `UNVERIFIED` di ketiga tab.
* **BR-09**: **Buka kasir wajib** — verifikasi & tutup hanya bisa dilakukan setelah sesi `OPEN` (uang tersedia/modal awal terinput). Satu sesi aktif per kasir per Tanggal+Shift (unique).
* **BR-10**: **Kas seharusnya** = `opening_balance + Σ amount transaksi TUNAI terverifikasi`. **Selisih** = `physical_cash − kas seharusnya`; selisih ≠ 0 **wajib** diberi `variance_note` sebelum tutup.
* **BR-11**: **Transaksi non-tunai** (EDC/QRIS/transfer) **wajib tetap diverifikasi kebenarannya** pada tab-nya, namun **dikecualikan** dari perhitungan kas laci (kas seharusnya, kas fisik, dan setoran uang) — verifikasi jumlah uang saat tutup kasir & setor **hanya untuk TUNAI**.
* **BR-12**: **Input uang tersedia cukup nominal total** (buka & tutup); rincian pecahan tidak diwajibkan.
* **BR-14**: **Penjualan Obat Bebas** dapat bersifat non-pasien (tanpa No. Pendaftaran) — validasi field pendaftaran dilonggarkan untuk kategori ini `[PERLU KONFIRMASI]`.
* **BR-15**: **Status Pasien tidak diperlukan** — seluruh pasien di layar kasir sudah dipulangkan/diselesaikan (dikonfirmasi), sehingga tidak ada pembedaan status pasien.
* **BR-16**: **Batal Verifikasi** — kasir dapat mengembalikan baris `VERIFIED` → `UNVERIFIED` (via ceklist + tombol **Batal Verifikasi**) **selama sesi kasir masih dibuka** (`OPEN`/`VERIFYING`, belum `CLOSED`). Setelah `CLOSED`, batal verifikasi tidak diizinkan. Aksi wajib tercatat audit.
* **BR-17**: **Tidak ada koreksi tagihan di G1** *(menggantikan batasan Tambah v1.6)* — G1 **tidak menyediakan** aksi Tambah/Edit/Hapus tagihan. Seluruh data transaksi bersifat **read-only** dari modul sumber (G2 untuk Tagihan/Obat Bebas, G3 untuk Deposito). Koreksi, penambahan, atau pembatalan tagihan **hanya** dilakukan di modul sumber, lalu hasilnya diverifikasi ulang di G1.
* **BR-18**: **Metode Pembayaran = data sumber** — nilai **Metode Pembayaran (`payment_method`, Tunai/Non-Tunai)** **diturunkan dari transaksi sumber G2/G3** yang dikirim ke layar kasir; **tidak diinput/diubah** di layar Verifikasi Setor Kas (read-only). Klasifikasi ini yang menjadi dasar pemisahan Tunai vs Non-Tunai pada Ringkasan Setoran (FR-G1-11) dan hitungan kas laci saat Tutup Kasir (BR-10, BR-11).

---

## 9. Workflow / BPMN Interpretation

### 9.1 Alur Utama: Buka → Verifikasi → Tutup

**A. Buka Kasir**
1. Kasir login & memilih **Tanggal + Shift** berjalan, lalu menekan **Buka Kasir**.
2. Sistem mengecek belum ada sesi aktif untuk kasir+tanggal+shift (bila ada → tolak buka ganda).
3. Kasir **menginput Uang Tersedia di Kasir (modal/saldo awal)** — cukup nominal total.
4. Sistem menyimpan saldo awal, waktu buka, kasir pembuka → status sesi `OPEN`.

**B. Melayani Pembayaran (di modul lain, sepanjang shift)**
5. Kasir melayani transaksi pembayaran di **G2 — Tagihan Pasien** (tagihan pasien & penjualan obat bebas) dan **G3 — Deposito Pasien/Wadiah** (deposito). Transaksi ini menjadi sumber data yang ditarik ke layar verifikasi.

**C. Verifikasi Setor Kas** *(inti, mirip existing)*
6. Kasir membuka layar **Verifikasi Setor Kas**; sistem menarik & menampilkan transaksi shift di 3 tab: **Deposito Pasien (dari G3)**, **Tagihan Pasien (dari G2)**, **Penjualan Obat Bebas (dari G2)**. Subjudul menampilkan jumlah transaksi yang belum diverifikasi.
7. Kasir membuka tiap tab, memeriksa **Nominal, Tipe Penjamin, Status Kuitansi** tiap baris.
8. **Keputusan per baris**:
    * Bila **benar** → **ceklist** baris untuk **memilih** (bisa **satu per satu** atau **ceklist semua**) → tekan tombol **Verifikasi** → baris terpilih menjadi `VERIFIED`; counter `✓ [n]` bertambah. *(Ceklist saja belum memverifikasi — harus klik tombol Verifikasi.)*
    * Bila **salah** → transaksi **tidak diverifikasi** (dibiarkan `UNVERIFIED`); perbaikan tagihan dilakukan di **modul sumber (G2/G3)** — **bukan di layar kasir** — lalu transaksi ditarik ulang & diverifikasi di G1.
9. **Batal Verifikasi (bila human error verifikasi):** kasir memilih baris `VERIFIED` yang telanjur salah diverifikasi lalu menekan **Batal Verifikasi** → kembali `UNVERIFIED`. Bisa dilakukan **selama kasir masih dibuka** (belum `CLOSED`).
10. Sepanjang proses, **Ringkasan Setoran (dashboard)** menampilkan nominal **Tunai vs Non-Tunai** (total & terverifikasi, per tab & lintas-tab) secara real-time sebagai dasar jumlah uang tunai yang harus disetorkan.
11. Kasir memastikan seluruh baris di ketiga tab berstatus `VERIFIED`.

**D. Tutup Kasir**
12. Kasir menekan **Tutup Kasir**; sistem memvalidasi tidak ada transaksi `UNVERIFIED` (bila ada → blokir). **Tutup kasir baru bisa dilakukan bila semua terverifikasi.**
13. Kasir **menginput Uang Tersedia di Kasir (kas fisik akhir)** — cukup nominal total.
14. Sistem menghitung **Kas Seharusnya = Saldo Awal + Total Transaksi Tunai Terverifikasi** dan **Selisih = Kas Fisik − Kas Seharusnya** (transaksi non-tunai dikecualikan dari hitungan uang fisik).
15. Bila **Selisih ≠ 0**, kasir **wajib mengisi keterangan selisih**. Sistem menyimpan → status sesi `CLOSED`. **(Terminal)**

### 9.2 Diagram Alur (ringkas)

```
[Buka Kasir + input uang tersedia] → OPEN
        │
        ▼
[Layani pembayaran di G2 (Tagihan & Obat Bebas) & G3 (Deposito)]
        │
        ▼
[Verifikasi 3 tab — Deposito←G3, Tagihan←G2, Obat Bebas←G2]
[ceklist (pilih) satu/all → tombol VERIFIKASI → VERIFIED] → VERIFYING
[Ringkasan Setoran (dashboard): Total Tunai vs Non-Tunai — real-time]
[Batal Verifikasi (VERIFIED→UNVERIFIED) bila human error, selama belum CLOSED]
[tagihan salah → koreksi di modul sumber G2/G3 → tarik ulang & verifikasi (BUKAN di G1)]
        │  (semua VERIFIED?) ──tidak──► biarkan UNVERIFIED / perbaiki di G2/G3
        ▼ ya
[Tutup Kasir + input uang tersedia] → hitung Kas Seharusnya & Selisih (tunai) → CLOSED (terminal)
        │  (selisih ≠ 0 → wajib keterangan)
        ▼
     selesai
```

> Catatan: Belum tersedia file BPMN untuk G1. Interpretasi alur di atas diturunkan dari layar sistem existing (3 screenshot: Deposito Pasien, Tagihan Pasien, Penjualan Obat Bebas), pemetaan sumber data (**G2 Tagihan Pasien** & **G3 Deposito Pasien/Wadiah**), dan konsep buka/tutup kasir yang diberikan. PRD ini meng-deliver bagian **A (Buka), B (Layani), C (Verifikasi — verifikasi saja, tanpa koreksi tagihan), D (Tutup Kasir)**. Bila BPMN resmi tersedia, selaraskan langkah 1–15 dengan task/lane pada BPMN.

---

### Catatan Tinjauan (untuk PO/Stakeholder)

**Sudah dikonfirmasi (terintegrasi ke PRD):**
1. ✅ **Status Kuitansi** = **Lunas / Belum Lunas** (tanpa "Sebagian").
2. ✅ **Ceklist select-all** untuk verifikasi massal (FR-G1-03). **(v1.8)** Aksi **Edit/Hapus/Tambah tagihan dihapus** — G1 **verifikasi saja**; koreksi tagihan dilakukan di modul sumber G2/G3 (BR-04, BR-17, Out of Scope #4).
5. ✅ **Shift** bersumber dari **Master Shift**.
6. ✅ **Buka Kasir** → cukup **nominal total** (denominasi tidak wajib); modal awal **fleksibel** (manual atau carry-over sisa kas shift sebelumnya).
7. ✅ **Tutup Kasir** → verifikasi jumlah uang & setor **hanya TUNAI**; transaksi **non-tunai** tetap diverifikasi kebenarannya tapi dikecualikan dari hitungan kas (BR-10, BR-11).
9. ✅ **Seluruh pasien di kasir sudah dipulangkan** → kolom **Status Pasien dihapus** (BR-15).

**Masih perlu konfirmasi:**
4. Perilaku **Penjualan Obat Bebas** untuk pembeli **non-pasien** (No. Pendaftaran kosong) — apakah No. Pendaftaran & Nama benar-benar boleh kosong pada tampilan daftar? (mempengaruhi BR-14 & tampilan §8.3.1)
- **Tambahan (Tutup Kasir)**: apakah perlu **ambang batas selisih** yang memicu peringatan/otorisasi khusus? (saat ini: selisih ≠ 0 cukup wajib diberi keterangan, tanpa approval)
