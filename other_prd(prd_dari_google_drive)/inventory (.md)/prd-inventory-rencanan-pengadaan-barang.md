# PRD — Inventory: Rencana Pengadaan Barang (H10)

**Related Document:** Design Figma; Rencana Pengadaaan Gudang Farmasi.docx; PRD_Rencana_Pengadaan_Barang (2).docx; List Fitur V2.xlsx (sheet MVP); BPMN terkait: g-backoffice-inventory-pemesanan, -penerimaan, -stok-opname, -distribusi
**Versi:** 1.7 - **Dashboard = titik pembuatan pengadaan** (FR-001 & FR-002 v1.6 digabung; tidak ada form Buat Rencana terpisah). Di dashboard user mengatur **filter Gudang**, mengisi **Periode Pengadaan (hari)** & **Jangka Waktu Pengadaan (hari)**, **rentang analisis (start/end)**, & **Kategori Barang (opsional)** → list barang muncul sesuai parameter → **checklist** → **Create Pengadaan**. **Tanpa filter kategori gudang & tanpa filter status di dashboard.** Sebelumnya (v1.6): penyederhanaan Fase 1 (MVP) & restrukturisasi fase (Fase 2 Analisis Supplier, Fase 3 EOQ, Fase 4 Integrasi Keuangan); supplier via dropdown manual; 1 supplier = 1 SP.

## 1. Overview / Brief Summary

Modul **Rencana Pengadaan Barang** (code **H10**, cluster Backoffice) adalah tool **analisis & perencanaan** pengadaan terstandar untuk seluruh unit Gudang RS (Farmasi, Gizi, Rumah Tangga). Modul ini menjembatani **monitoring stok** (Informasi Stok — H4) dengan **eksekusi pemesanan** (Pemesanan Barang Farmasi H1, Rumah Tangga H12, Gizi H13).

> **Cakupan inti (penegasan):** Modul ini **murni penyedia analisis** kebutuhan pengadaan yang kemudian **diteruskan menjadi pesanan barang**. Modul ini **TIDAK memiliki proses approval/persetujuan**. Seluruh alur persetujuan pengadaan berada di **masing-masing modul Pemesanan Barang** (H1/H12/H13). Output H10 = **draft pesanan / usulan** yang masuk ke modul pemesanan, lalu di sanalah approval dilakukan.

Sistem menghitung **rekomendasi jumlah restok per barang** berdasarkan: pola konsumsi historis (jumlah barang keluar dari **Distribusi Barang H3**), sisa stok real-time, rata-rata pengeluaran harian, **buffer stock**, **lead time (waktu tunggu)**, dan **reorder point (ROP)**.

**Alur Fase 1 (MVP) ringkas:** dari **Dashboard Pengadaan**, user mengatur **filter Gudang**, mengisi **Periode Pengadaan (hari)** & **Jangka Waktu Pengadaan (hari)**, **rentang tanggal analisis (start–end)**, dan **Kategori Barang (opsional)** → dashboard menampilkan **list barang** sesuai parameter (diurut penggunaan tertinggi/fast moving + penanda **stok ≤ buffer**) → user **men-checklist barang** → klik **Create Pengadaan** → user **memilih supplier dari dropdown**, **mengisi jumlah restok** (default = rekomendasi sistem), lalu **memfinalisasi**. Hasil finalisasi menjadi **draft pemesanan per gudang**, dikelompokkan **per supplier — satu supplier = satu Surat Pesanan (SP)**; **nomor SP diterbitkan di modul Pemesanan** saat draft diterima.

> **Roadmap fase lanjutan (di luar MVP):**
> - **Fase 2 — Analisis & Rekomendasi Supplier**: analisis multi-supplier (lead time tercepat, harga termurah, diskon terbanyak, retur paling sedikit) + **perankingan** (bobot 25%/dimensi); supplier default = rekomendasi peringkat-1; **multi-supplier per barang** (qty dipecah, rekomendasi berperingkat). *(Di Fase 1, supplier hanya dipilih manual via dropdown.)*
> - **Fase 3 — Metode EOQ**: menambah metode kalkulasi **EOQ** sebagai alternatif Min-Max.
> - **Fase 4 — Integrasi Keuangan & Budgeting**: validasi budget terintegrasi modul Keuangan (cek pagu real-time, blocking).

Tujuan akhir: mengurangi **stockout** dan **overstock/kedaluwarsa**, menjaga kepatuhan formularium & regulasi pengadaan (Perpres 12/2021, E-Katalog LKPP, SNARS/STARKES), serta menyediakan **jejak audit** lengkap untuk akreditasi.

> [ASUMSI] RS Tipe C & D: SDM & infrastruktur terbatas → **Fase 1 (MVP) dibuat minimal**: pembuatan pengadaan langsung dari dashboard, input berbasis **hari**, **supplier dipilih manual via dropdown**, metode **Min-Max**, **tanpa approval**, **tanpa validasi budget**. Analisis & rekomendasi supplier (**Fase 2**), metode EOQ (**Fase 3**), dan integrasi Keuangan (**Fase 4**) menyusul.

## 2. Background

**Kondisi saat ini (masalah):** [Sebagian besar diturunkan dari Lampiran PRD_Rencana_Pengadaan_Barang (2).docx]

1. Perencanaan pengadaan dilakukan **manual & reaktif** — PR disusun saat stok hampir/sudah habis, bukan proaktif berbasis pola konsumsi. Akibat: sering stockout sekaligus overstock/kedaluwarsa.
2. Petugas menyusun PR berdasarkan permintaan ad-hoc unit **tanpa visibility stok real-time** dan tanpa data lead time/konsumsi historis.
3. **Tidak ada validasi budget** di tahap perencanaan → PO bisa over-budget dan baru ditolak Keuangan setelah dibuat (wasted effort). *(Validasi budget di-roadmap-kan ke Fase 4.)*
4. Untuk Farmasi, APJ tidak punya tool merencanakan pengadaan dengan mempertimbangkan **formularium (FORNAS), ED minimum, compliance NPP**.
5. **PR duplikat** antar unit/instalasi karena konsolidasi sulit.
6. Tidak ada **decision support** untuk metode kalkulasi kebutuhan (Min-Max, EOQ, forecast) maupun pemilihan supplier terbaik. *(Rekomendasi supplier = Fase 2; EOQ = Fase 3.)*
7. Kepatuhan regulasi pengadaan (RS BLU/BLUD, akreditasi) sulit dipenuhi tanpa tool perencanaan formal & jejak audit.

Khusus Gudang Farmasi [dari Lampiran Rencana Pengadaaan Gudang Farmasi.docx]: pengadaan obat/alkes sering **berlebihan dan akhirnya mubazir/tidak terjual** karena tidak mempertimbangkan waktu tunggu, jumlah barang keluar, sisa stok, dan rata-rata pengeluaran harian.

**Mengapa modul ini perlu:** menjadi **tool analisis & perencanaan pengadaan tunggal** yang terstandar lintas kategori (Farmasi/Gizi/Rumah Tangga) dan lintas gudang, terintegrasi dengan Informasi Stok (H4), Master Data Barang (A4/A5/A6), Distribusi (H3), Penerimaan (H2), Retur (H8), dan modul Pemesanan (H1/H12/H13).

> **Pemisahan tanggung jawab (penting):** H10 fokus pada **analisis kebutuhan → usulan pesanan**. Tahap **persetujuan/approval, negosiasi final, dan eksekusi PO** menjadi tanggung jawab modul Pemesanan (H1/H12/H13). Pemisahan ini menghindari approval ganda dan menjaga modul perencanaan tetap ringan dan cepat untuk RS Tipe C & D.

## 3. In Scope

### A. Scope Definition (yang dikerjakan)

**Fase 1 (MVP — prioritas RS Tipe C & D):**
1. **Dashboard Pengadaan Barang (titik pembuatan pengadaan)** — user mengatur **filter Gudang**, mengisi **Periode Pengadaan (hari)** & **Jangka Waktu Pengadaan (hari)**, **rentang tanggal analisis (start/end)**, dan **Kategori Barang (opsional)**. **Tanpa form Buat Rencana terpisah, tanpa filter kategori gudang, tanpa filter status.**
2. Sesuai parameter dashboard, sistem **menampilkan list barang** (diurut **penggunaan tertinggi/fast moving** + penanda **stok ≤ buffer** + pencarian); user **men-checklist** barang lalu klik **Create Pengadaan**.
3. **Kalkulasi rekomendasi jumlah restok** metode **Min-Max** + buffer stock (fast/slow moving) + mempertimbangkan **PO outstanding**.
4. **Penetapan per barang**: pilih **supplier via dropdown (manual)** + isi **jumlah restok** (default = rekomendasi sistem, dapat di-override).
5. **Finalisasi & teruskan rencana** menjadi **draft pemesanan per gudang**, dikelompokkan **per supplier (1 supplier = 1 SP)**; **nomor SP diterbitkan di modul Pemesanan** — **TANPA approval di modul ini**.
6. Output **Dokumen Rencana Pengadaan (PDF)** + handover ke modul Pemesanan.
7. **Audit Trail**, **Role & Permission**, **Snapshot Master Data** saat rencana dibuat.

**Fase 2 — Analisis & Rekomendasi Supplier:** Setelah barang dipilih, sistem menampilkan **analisis multi-supplier** per barang (lead time tercepat, harga termurah, diskon terbanyak, retur paling sedikit) + **perankingan supplier** (bobot **25% per dimensi**); **supplier default terisi = rekomendasi peringkat-1**; mendukung **multi-supplier per barang** (qty dipecah; bila supplier peringkat-1 dipakai, peringkat berikutnya direkomendasikan). *(Fase 1: supplier hanya dropdown manual, satu barang satu supplier.)*

**Fase 3 — Metode EOQ:** Menambah metode kalkulasi kebutuhan **EOQ (Economic Order Quantity)** sebagai alternatif Min-Max pada field Metode Kalkulasi.

**Fase 4 — Integrasi Keuangan & Budgeting:** Validasi budget **terintegrasi modul Keuangan** — cek **pagu/anggaran unit/gudang real-time**, opsi **blocking** bila estimasi over-budget — sebelum handover ke modul Pemesanan. *(Fase 1: tanpa validasi budget; estimasi nilai hanya informasi.)*

### B. Out Scope (yang TIDAK dikerjakan)

| No | Di luar lingkup | Ditangani oleh |
|----|-----------------|----------------|
| 1 | **Approval / persetujuan pengadaan** | **Modul Pemesanan Barang (H1/H12/H13)** — seluruh alur approval ada di sana, bukan di H10 |
| 2 | Eksekusi pembelian / pembuatan PO final ke supplier & **penerbitan nomor SP** | Modul Pemesanan Barang (H1/H12/H13) |
| 3 | Penerimaan barang & quality check | Penerimaan Barang (H2) |
| 4 | Pencatatan & monitoring stok real-time | Informasi Stok (H4) |
| 5 | Pengelolaan Master Data Barang & Supplier | Master Data Barang Gizi (A4), Rumah Tangga (A5), Farmasi (A6) |
| 6 | Pembayaran & pencatatan akuntansi | Modul Keuangan (integrasi validasi budget = Fase 4) |
| 7 | Penyusunan dokumen & alignment RBA | Modul RBA — **di luar lingkup** (tidak termasuk Fase 1–4) |
| 8 | Distribusi/mutasi antar unit | Distribusi Barang (H3), Mutasi Stok (H5) |
| 9 | Proses retur ke supplier | Retur Pembelian (H8) — modul ini hanya **membaca data retur** untuk analisis supplier (Fase 2) |

## 4. Goals and Metrics

### Goals
1. Menyediakan tool **analisis & perencanaan** pengadaan terstandar untuk seluruh unit Gudang lintas gudang/kategori.
2. Mengubah pola pengadaan dari **reaktif → proaktif** berbasis pola konsumsi, ROP, dan buffer stock.
3. Memastikan setiap rencana mengacu pada data stok & master barang yang sama (single reference).
4. Mengurangi stockout dan overstock/kedaluwarsa melalui kalkulasi kebutuhan yang akurat.
5. *(Fase 2)* Memberi **decision support pemilihan supplier** (cepat/murah/diskon/andal) — termasuk rekomendasi berperingkat & multi-supplier per barang.
6. **Meneruskan hasil analisis menjadi draft pesanan** secara mulus ke modul Pemesanan **per gudang & per supplier** tanpa double entry — approval & penerbitan SP di modul Pemesanan.
7. Memastikan kepatuhan pengadaan (formularium, ED, NPP, E-Katalog, Perpres 12/2021) terdokumentasi dengan jejak audit.

### Metrics & Success Criteria

| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Adopsi perencanaan proaktif | ≥ 80% pengadaan rutin dibuat via Rencana Pengadaan (bukan PR ad-hoc) |
| 2 | Pengurangan stockout | Penurunan stockout barang vital/A-class ≥ 50% dalam 6 bulan pertama (ukur via fill rate) |
| 3 | Pengurangan overstock/ED | Penurunan nilai barang expired/overstock ≥ 30% vs baseline |
| 4 | Kecepatan penyusunan rencana | 1 rencana kategori (≤ 200 item) selesai < 10 menit dengan auto-kalkulasi (tanpa hambatan approval) |
| 5 | Performa dashboard & pencarian | Load dashboard, list barang & pencarian < 3 detik |
| 6 | Kelengkapan jejak audit | 100% perubahan/override item & **handover ke pemesanan** tercatat di audit trail |
| 7 | Kelancaran handover | 100% rencana final berhasil diteruskan menjadi draft pesanan tanpa input ulang (zero double entry) |
| 8 | Ketepatan pengelompokan SP | 100% draft pemesanan dikelompokkan **per supplier** (1 supplier = 1 SP); nomor SP diterbitkan modul Pemesanan |
| 9 | *(Fase 2)* Efisiensi pemilihan supplier | ≥ 70% item rencana memakai supplier rekomendasi sistem [ASUMSI target] |

## 5. Related Feature

Fitur terkait (dari List Fitur V2 sheet MVP & draft user):

| Code | Menu | Relasi dengan H10 |
|------|------|-------------------|
| A4 | Master Data Barang Gizi | Sumber master item gizi (kategori, satuan, supplier) |
| A5 | Master Data Barang Rumah Tangga | Sumber master item rumah tangga |
| A6 | Master Data Barang Farmasi | Sumber master item farmasi (dosis, sediaan, FORNAS, pabrikan) |
| H1 | Pemesanan Barang Farmasi | **Tujuan handover** rencana farmasi → draft PR/PO; **menerbitkan SP & approval di sini** |
| H12 | Pemesanan Barang Rumah Tangga | **Tujuan handover** rencana rumah tangga → draft PR/PO; **menerbitkan SP & approval di sini** |
| H13 | Pemesanan Barang Gizi | **Tujuan handover** rencana gizi → draft PR/PO; **menerbitkan SP & approval di sini** |
| H4 | Informasi Stok | Sumber sisa stok real-time per gudang (C) |
| H3 | Distribusi Barang | **Sumber Jumlah Barang Keluar (B)** v1.0 = pengiriman gudang→unit; dasar urutan fast moving (BR-005) |
| H2 | Penerimaan Barang | Sumber tanggal terima (untuk lead time A & analisis supplier Fase 2), PO outstanding |
| H8 | Retur Pembelian | *(Fase 2)* Sumber data retur per supplier (analisis keandalan) |
| H5 | Mutasi Stok | Mutasi/penyesuaian stok antar lokasi (bukan sumber B v1.0) |
| H6 | Stok Opname | [ASUMSI] Acuan sisa stok tervalidasi sebelum perencanaan |
| H11 | Penggunaan Barang Unit | [ASUMSI] Sumber konsumsi aktual (next version: pemakaian ke pasien) |

> Cluster Backoffice lain (H7 Peminjaman, H9 Pemusnahan) tidak berelasi langsung.
> **Catatan alur:** approval & penerbitan SP bukan bagian H10 — lihat modul Pemesanan (H1/H12/H13).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Lampiran & analogi BPMN inventory]

1. Petugas gudang memantau stok manual (kartu stok / cek fisik) tanpa data konsumsi historis terstruktur.
2. Saat stok hampir habis, petugas menyusun daftar usulan pembelian secara reaktif (Excel/kertas).
3. Jumlah pesanan diperkirakan berdasarkan feeling/pengalaman, tanpa buffer stock & lead time terukur.
4. Pemilihan supplier manual berdasarkan kebiasaan, tanpa membandingkan harga/lead time/diskon/retur antar supplier.
5. Usulan disalin ulang menjadi pesanan di modul pemesanan (double entry) → rawan salah & duplikat. Persetujuan baru terjadi di tahap pemesanan secara manual (tanda tangan kertas).
6. Tidak ada validasi budget sampai PO jadi; jejak audit minim.

### B. To-Be (kondisi diharapkan — Fase 1/MVP) [turunan langsung dari draft user; pola alur dari BPMN g-backoffice-inventory-pemesanan & -penerimaan]

1. User Gudang membuka **menu Inventory → Rencana Pengadaan Barang** → **Dashboard Pengadaan**, yang sekaligus menjadi **titik pembuatan pengadaan** (tidak ada form/halaman *Buat Rencana* terpisah).
2. Di dashboard, user **memilih Gudang** (filter); kategori master (A4/A5/A6), sumber stok (H4), dan modul tujuan pemesanan ikut tertentukan dari gudang.
3. User mengisi **Periode Pengadaan (hari)** dan **Jangka Waktu Pengadaan (hari)** (keduanya default 30).
4. User mengisi **Tanggal Mulai & Tanggal Selesai** analisis tren penggunaan barang (default = sepanjang periode pengadaan ke belakang).
5. *(Opsional)* User memfilter **Kategori Barang** (mis. Obat/Alkes/BHP).
6. Sesuai parameter, sistem menarik data **H4/H2/H3/A4-6** dan **menampilkan list barang** di dashboard — **diurut penggunaan tertinggi (fast moving)** + menandai/memprioritaskan barang yang **stoknya ≤ buffer**, beserta **rekomendasi jumlah restok** (Min-Max).
7. User **men-checklist barang** yang akan diadakan, lalu klik **Create Pengadaan**.
8. Untuk tiap barang terpilih, user **memilih supplier dari dropdown (manual)** dan **mengisi jumlah restok** (default = rekomendasi sistem; bila diubah = override + alasan).
9. *(Informasi)* Sistem menampilkan **estimasi nilai total** (tanpa validasi budget di Fase 1).
10. User **memfinalisasi pengadaan** (status Draft → Final). **Tidak ada langkah approval di modul ini.**
11. Sistem **mengirim rencana menjadi draft pemesanan ke masing-masing gudang** (handover ke H1/H12/H13), **dikelompokkan per supplier** (satu supplier = satu SP). **Nomor SP diterbitkan oleh modul Pemesanan saat draft diterima.**
12. Sistem hasilkan **Dokumen Rencana Pengadaan (PDF)**; seluruh aktivitas (buat, override, finalisasi, handover) tercatat di **audit trail** & master data di-**snapshot**. **Persetujuan/approval pengadaan dilakukan di modul Pemesanan.**

> **Tambahan per fase:** **Fase 2** menambah langkah analisis & rekomendasi supplier (langkah 8 → supplier ter-default rekomendasi peringkat-1 + opsi multi-supplier per barang). **Fase 3** menambah pilihan metode **EOQ** pada langkah 6. **Fase 4** menambah **validasi budget terintegrasi Keuangan** pada langkah 9 (blocking bila over-budget).

## 7. Main Flow / Mindmap

### Skenario Utama (Fase 1) — Buat Pengadaan dari Dashboard → Draft Pemesanan per Gudang & SP per Supplier (tanpa approval)

1. **[Start]** User Gudang buka menu *Inventory → Rencana Pengadaan Barang* → **Dashboard Pengadaan** (langsung tempat membuat pengadaan; **tanpa form terpisah, tanpa filter kategori gudang/status**).
2. User **pilih Gudang** (filter). Kategori master, sumber stok, & modul tujuan pemesanan ikut tertentukan dari gudang.
3. User isi **Periode Pengadaan (hari)** — default 30.
4. User isi **Jangka Waktu Pengadaan (hari)** — default 30.
5. User isi **Tanggal Mulai & Tanggal Selesai** analisis tren penggunaan barang (default = sepanjang periode pengadaan ke belakang).
6. *(Opsional)* User memfilter **Kategori Barang** (BR-027).
7. Sesuai parameter, sistem tampilkan **list barang** di dashboard, diurut **penggunaan tertinggi (fast moving)** + menandai **stok ≤ buffer** + **rekomendasi restok** (BR-001/009).
8. user **checklist** barang yang dibutuhkan → klik **Create Pengadaan**.
9. Untuk tiap barang terpilih, user **pilih Supplier dari dropdown (manual)**.
10. User **isi Jumlah Restok** (default = rekomendasi sistem) → **[Gateway] Ubah jumlah?** *Ya* → wajib **alasan override** (BR-011).
11. *(Informasi)* Sistem tampilkan **estimasi nilai total** (tanpa validasi budget — Fase 1).
12. User klik **Finalisasi Pengadaan** → status **Draft → Final**. *(Tanpa approval di modul ini.)*
13. Sistem **kirim rencana menjadi draft pemesanan ke masing-masing gudang** (H1/H12/H13), **dikelompokkan per supplier**: **1 supplier = 1 SP** (BR-013); **nomor SP diterbitkan modul Pemesanan saat draft diterima** (BR-026); status rencana → **Diteruskan**.
14. Sistem hasilkan **Dokumen Rencana Pengadaan (PDF)** + catat **audit trail** + **snapshot master data**.
15. **[Event akhir]** "Pengadaan berhasil dibuat & diteruskan menjadi draft pemesanan per supplier di gudang terkait (menunggu penerbitan SP & approval di modul Pemesanan)."

### Catatan Fase Lanjutan (pada alur yang sama)
- **Fase 2 — Analisis & Rekomendasi Supplier**: pada langkah 9, sistem menampilkan **analisis multi-supplier + perankingan**; **supplier ter-default rekomendasi peringkat-1**; user dapat **memecah satu barang ke beberapa supplier** (rekomendasi berperingkat — BR-012/024/025).
- **Fase 3 — Metode EOQ**: pada langkah 7, user dapat memilih metode **EOQ** selain Min-Max (BR-009).
- **Fase 4 — Integrasi Keuangan**: pada langkah 11, sistem **memvalidasi estimasi vs anggaran** (warning/blocking konfigurable — BR-014).

### Skenario Alternatif (Fase 1)
- **Simpan Draft**: user dapat menyimpan pengadaan sebagai Draft tanpa langsung meneruskan; dapat dilanjutkan/diedit kemudian.

## 8. Business Rules

Traceability: BR mengacu ke step Main Flow (MF-n) & Lampiran (Farmasi.docx, PRD(2).docx, draft user v1.7).

- **BR-001 (Urutan & penyaringan list barang)** [MF-7]: List barang diambil dari master (A4/A5/A6) berstatus **aktif** pada **gudang terpilih**. **Urutan utama** = **penggunaan tertinggi (fast moving)** berdasarkan Jumlah Barang Keluar (B) pada rentang analisis; barang yang **stoknya ≤ buffer** — yaitu **0 < C ≤ Stok Buffer (E)** (BR-008) — **diprioritaskan/ditandai** di atas, dan **C = 0 (habis)** ditandai paling kritis. Pengurutan **A–Z** & pengelompokan per jenis sediaan (obat) tersedia sebagai **sort sekunder/alternatif**. [Lampiran Farmasi.docx + draft user]
- **BR-002 (Format nama barang farmasi)** [MF-7]:
  - Obat FORNAS: `Nama Dosis SatuanDosis JenisSediaan (Pabrikan) (FORNAS)` — cth `Aminophylin 10 ml 24mg/ml Injeksi (ETHICA) (FORNAS)`.
  - Obat non-FORNAS: `Nama Dosis SatuanDosis JenisSediaan (Pabrikan)` — cth `Asam Valproat 500 mg Enteric coated tablet (DEXA MEDICA)`.
  - Non-obat: `Nama (Pabrikan)` — cth `Kasa Hydrofil 36 x 80 1Pcs (DRC)`.
- **BR-003 (Default rentang analisis tren)** [MF-5]: Rentang tanggal analisis penggunaan barang **default = sepanjang Periode Pengadaan (hari) ke belakang** (mis. periode 30 → start = today−30, end = today). User dapat mengubah Tgl Mulai/Selesai secara manual. Rentang ini dipakai menghitung B & D. [draft user]
- **BR-004 (Waktu Tunggu / Lead time A)** [MF-7]: Gap hari antara tanggal barang **dipesan** ke supplier s/d tanggal **diterima** (dari H2). Satuan hari. Dipakai untuk perhitungan ROP dan **analisis supplier (Fase 2)**. Bila multi-historis → [ASUMSI] gunakan rata-rata lead time per barang/supplier.
- **BR-005 (Jumlah Barang Keluar B)** [MF-7]: **v1.0** = total pengiriman barang dari gudang ke unit per rentang analisis — **sumber: Distribusi Barang (H3)** [terkonfirmasi]. Penarikan barang dari unit → gudang **tidak** mengurangi B. B juga menjadi dasar **urutan fast moving** (BR-001). [Lampiran Farmasi.docx]
- **BR-006 (Sisa Stok C)** [MF-7]: Sisa stok **real-time** barang di **gudang terpilih** saat ini (dari H4). Dibandingkan terhadap **Stok Buffer (E)**: ditandai prioritas bila **0 < C ≤ E**, dan **Habis** bila C = 0 (BR-001).
- **BR-007 (Rata-rata pengeluaran/hari D)** [MF-7]: **v1.0** = rata-rata pengiriman gudang→unit per rentang analisis (penarikan tidak dihitung). D = B / jumlah hari rentang analisis. **Next version** = rata-rata penjualan ke pasien.
- **BR-008 (Stok Buffer E)** [MF-7]: Stok pengaman dihitung dari **jumlah yang direstok**: **Fast moving = 20%**, **Slow moving = 10%**. Klasifikasi: *Fast moving* = barang yang diorder gudang→supplier dalam **≤ 1 minggu** terakhir; *Slow moving* = tidak pernah diorder / order terakhir > 1 minggu. Threshold **≤ 1 minggu berlaku untuk semua kategori** (termasuk Gizi segar) [terkonfirmasi]. [Lampiran Farmasi.docx]
- **BR-009 (Rekomendasi Restok)** [MF-7/10]: [rumus **terkonfirmasi** user] `Kebutuhan = (D × Jangka Waktu Pengadaan F) + Buffer E − Sisa Stok C − PO Outstanding`. Jika hasil ≤ 0 → tidak direkomendasikan restok. Nilai ini menjadi **default Jumlah Restok**. Metode default **Min-Max** (Fase 1); metode **EOQ ditambahkan di Fase 3**.
- **BR-010 (PO Outstanding)** [MF-7]: Barang yang sudah dipesan namun belum diterima (status PO open dari H1/H12/H13 & H2) **mengurangi** kebutuhan restok agar tidak dobel order.
- **BR-011 (Override jumlah)** [MF-10]: User boleh mengubah jumlah restok dari rekomendasi, **wajib mengisi alasan**; nilai asli & nilai override tersimpan di audit trail.
- **BR-012 (Analisis & rekomendasi supplier — 4 dimensi)** *(Fase 2)*: Per barang sistem menandai supplier terbaik untuk 4 dimensi: **lead time tercepat** (min A), **harga termurah** (min harga), **diskon terbanyak** (max diskon), **retur paling sedikit** (min jumlah retur dari H8), serta **peringkat gabungan** (bobot **25%/dimensi**). Supplier default = rekomendasi peringkat-1. **Di Fase 1, supplier dipilih manual via dropdown** (tanpa analisis/rekomendasi).
- **BR-013 (Pengelompokan Surat Pesanan per supplier)** [MF-13]: Draft pemesanan **dikelompokkan per supplier** — **satu supplier = satu Surat Pesanan (SP)**, **supplier berbeda = SP berbeda**. Tidak ada 1 SP lintas-supplier. [draft user]
- **BR-014 (Validasi budget)** *(Fase 4)*: **Fase 1 tidak memvalidasi budget** (estimasi nilai hanya informasi). **Fase 4 = validasi terintegrasi modul Keuangan** (cek pagu/anggaran real-time, warning/blocking konfigurable).
- **BR-015 (Tanpa approval — finalisasi)** [MF-12]: **Modul H10 TIDAK memiliki proses approval/persetujuan.** Setelah user memfinalisasi pengadaan (Draft → Final), rencana langsung diteruskan menjadi draft pesanan. **Seluruh persetujuan/approval pengadaan dilakukan di modul Pemesanan (H1/H12/H13)** sesuai alur masing-masing. Tidak ada peran "approver" maupun status "Menunggu Persetujuan/Disetujui/Ditolak" di modul ini.
- **BR-016 (Handover pesanan per gudang)** [MF-13]: Hanya rencana berstatus **Final** yang dapat diteruskan jadi draft PR/PO ke H1/H12/H13. Draft pemesanan dikirim **ke masing-masing gudang** sesuai gudang asal rencana (BR-022). Satu item rencana yang sudah jadi pesanan tidak dapat di-handover ulang (anti-duplikat). **Handover bersifat satu arah**: H10 **tidak menerima/menampilkan status balik** (disetujui/ditolak) dan **tidak menangani revisi** pasca-handover — penolakan/perubahan ditangani sepenuhnya di modul Pemesanan [terkonfirmasi].
- **BR-017 (Snapshot master data)** [MF-14]: Saat rencana dibuat/difinalisasi, harga/supplier/satuan di-**snapshot** agar nilai rencana tidak berubah meski master di-update kemudian.
- **BR-018 (Periode & jangka waktu pengadaan — hari)** [MF-3/4]: **Periode Pengadaan** dan **Jangka Waktu Pengadaan** keduanya diisi **dalam satuan hari** (integer > 0), **default 30**. *Periode Pengadaan* = panjang siklus/jendela pengadaan (juga jadi default rentang analisis, BR-003); *Jangka Waktu Pengadaan* = horizon proyeksi kebutuhan (faktor **F** di BR-009). *(Pilihan periode 6-tingkat Harian–Tahunan tidak digunakan.)*
- **BR-019 (Pencarian)** [MF-7]: Pencarian berdasarkan nama barang; untuk obat dapat dicari hingga **dosis & jenis sediaan**.
- **BR-020 (Audit trail)** [MF-14]: Semua aksi (buat, kalkulasi ulang, override, finalisasi, handover) tercatat dengan user, waktu, nilai sebelum/sesudah. *(Tidak ada aksi setujui/tolak karena approval bukan lingkup modul ini.)*
- **BR-021 (Status rencana)** [MF-12/13]: Status rencana di modul ini terbatas pada: **Draft**, **Final** (siap diteruskan), **Diteruskan** (sudah jadi draft pesanan), dan **Sebagian Diteruskan** (bila item dikirim bertahap). Status approval (disetujui/ditolak) dimiliki & ditampilkan oleh modul Pemesanan. [ASUMSI label status]
- **BR-022 (Pilih gudang)** [MF-2]: User memilih **gudang spesifik** (filter di dashboard); gudang menentukan **kategori master** (A4/A5/A6), **sumber stok** (H4), dan **modul tujuan pemesanan** (Farmasi→H1, Rumah Tangga→H12, Gizi→H13). Draft pemesanan hasil finalisasi dikirim **ke masing-masing gudang** sesuai asalnya (BR-016).
- **BR-023 (Alur Fase 1)** [MF-7/8/9/10]: Pembuatan pengadaan terjadi **langsung dari dashboard** (tanpa form terpisah). Setelah men-*checklist* barang dan menekan **Create Pengadaan**, user menetapkan **supplier (dropdown manual)** dan **jumlah restok** per barang, lalu **finalisasi**. *(Penetapan supplier berbasis analisis/rekomendasi = Fase 2; lihat BR-012.)*
- **BR-024 (Default supplier & jumlah restok)** [MF-9/10]: **Jumlah Restok** terisi default = rekomendasi sistem (BR-009) di semua fase. **Supplier**: di **Fase 1 dipilih manual via dropdown** (tanpa default rekomendasi); di **Fase 2** ter-default = supplier rekomendasi peringkat-1 (BR-012).
- **BR-025 (Multi-supplier per barang & rekomendasi berperingkat)** *(Fase 2)*: Satu jenis barang boleh **dipasok lebih dari satu supplier** (qty dipecah **manual** oleh user). Sistem merekomendasikan supplier **berdasarkan perankingan** (gabungan 4 dimensi BR-012, bobot 25%/dimensi); bila supplier **peringkat-1 sudah dipakai**, peringkat berikutnya direkomendasikan untuk sisa qty. Total qty seluruh pecahan = jumlah restok barang. **Di Fase 1, satu barang = satu supplier (dropdown).**
- **BR-026 (Penomoran SP)** [MF-13]: **Nomor Surat Pesanan diterbitkan di modul Pemesanan (H1/H12/H13) saat draft diterima**, bukan di H10 [terkonfirmasi]. Tugas H10 hanya **mengelompokkan draft per supplier** (1 supplier = 1 SP — BR-013) sehingga modul Pemesanan menerbitkan tepat **satu SP per supplier**. Format penomoran SP mengikuti aturan modul Pemesanan.
- **BR-027 (Filter Kategori Barang)** [MF-6]: **Filter Kategori Barang** (multi-select, **opsional**) ada di **Dashboard Pengadaan** untuk menyaring **list barang** yang ditampilkan — hanya barang berkategori terpilih yang muncul untuk dipilih. Sumber nilai = `master.kategori` dari A4/A5/A6 sesuai gudang. Filter bersifat **non-destruktif**. **Dashboard tidak memiliki filter kategori gudang maupun filter status.** [draft user]

## 9. User Stories

Format: *Sebagai <role>, saya ingin <aksi>, agar <manfaat>.* (sumber = Lampiran & draft)

- **US-001** — Sebagai **User Gudang Farmasi**, saya ingin **memproyeksikan kebutuhan pengadaan untuk N hari** dengan menginput jangka waktu pengadaan (hari), agar **pengadaan tidak berlebihan/mubazir maupun kurang**. (source: Lampiran Farmasi)
- **US-002** — Sebagai **User Gudang**, saya ingin **sistem mengkalkulasi rekomendasi jumlah restok per barang otomatis** (dari B, C, D, E, ROP), agar **tidak perlu menghitung manual & lebih akurat**.
- **US-003** — Sebagai **User Gudang**, saya ingin **dari dashboard mengatur parameter lalu melihat list barang (diurut penggunaan tertinggi & stok ≤ buffer) dan men-checklist barang**, agar **pengadaan dibuat cepat tanpa form terpisah dan fokus ke barang fast moving/kritis**.
- **US-004** — *(Fase 2)* Sebagai **User Gudang**, saya ingin **melihat rekomendasi supplier (tercepat, termurah, diskon terbanyak, retur paling sedikit) setelah memilih barang**, agar **bisa memilih supplier paling menguntungkan**.
- **US-005** — Sebagai **User Gudang**, saya ingin **rencana final otomatis dikelompokkan menjadi draft pemesanan per supplier (1 supplier = 1 SP)**, agar **tiap supplier punya satu SP yang rapi & tidak tercampur**.
- **US-006** — Sebagai **User Gudang**, saya ingin **mengubah (override) jumlah restok dengan alasan**, agar **bisa menyesuaikan dengan kondisi nyata lapangan**.
- **US-007** — Sebagai **User Gudang**, saya ingin **mencari/memfilter barang sampai dosis & jenis sediaan dan per kategori barang**, agar **menemukan item dengan cepat & tepat**.
- **US-008** — Sebagai **User Gudang**, saya ingin **rencana final otomatis menjadi draft pemesanan ke modul Pemesanan (H1/H12/H13) tanpa approval di modul perencanaan**, agar **tidak input ulang (double entry), bebas duplikat, dan approval cukup dilakukan sekali di modul Pemesanan**.
- **US-009** — Sebagai **Manajer Logistik / APJ**, saya ingin **memantau ringkasan rencana & estimasi nilai sebelum diteruskan** (monitoring), agar **memiliki visibilitas pengadaan**; persetujuan formal saya lakukan di modul Pemesanan.
- **US-010** — Sebagai **User Gudang**, saya ingin **memilih supplier dari dropdown & mengisi jumlah restok saat finalisasi**, agar **pengadaan Fase 1 cepat tanpa menunggu analisis supplier**.
- **US-011** — Sebagai **Petugas Pengadaan**, saya ingin **mengunduh Dokumen Rencana Pengadaan (PDF)**, agar **ada dokumen formal untuk arsip & akreditasi**.
- **US-012** — Sebagai **Auditor/Manajemen**, saya ingin **melihat jejak audit perubahan & handover rencana**, agar **memenuhi kebutuhan akreditasi (SNARS/STARKES) & transparansi**.
- **US-013** — Sebagai **User Gudang**, saya ingin **mengisi periode & jangka waktu pengadaan dalam hari serta rentang tanggal analisis di dashboard**, agar **proyeksi kebutuhan sesuai siklus pengadaan gudang saya**.
- **US-014** — Sebagai **User Gudang**, saya ingin **memilih gudang lalu rencana final otomatis menjadi draft pemesanan di gudang tersebut**, agar **tiap gudang menerima pesanannya sendiri tanpa tercampur**.
- **US-015** — Sebagai **Petugas Pengadaan**, saya ingin **draft dikelompokkan per supplier (1 supplier = 1 SP) sehingga modul Pemesanan menerbitkan satu SP per supplier**, agar **dokumen pesanan tiap supplier rapi & mudah ditelusuri**.
- **US-016** — *(Fase 2)* Sebagai **User Gudang**, saya ingin **satu jenis barang bisa dipasok beberapa supplier dengan rekomendasi berperingkat**, agar **kebutuhan tetap terpenuhi saat satu supplier tak mencukupi/lebih mahal**.
- **US-017** — Sebagai **User Gudang / Manajer Logistik**, saya ingin **memfilter list barang berdasarkan kategori barang (opsional) di dashboard**, agar **lebih mudah & cepat memilih barang** (mis. hanya Obat atau Alkes).

## 10. Functional Requirements

Traceability ke User Story (US-) & step Main Flow (MF-). Penanda *(Fase n)* = requirement di luar Fase 1.

| ID | Requirement | Trace |
|----|-------------|-------|
| **FR-001** | Sistem menyediakan **Dashboard Pengadaan Barang** sebagai **titik pembuatan pengadaan**: user mengatur **filter Gudang**, mengisi **Periode Pengadaan (hari)** & **Jangka Waktu Pengadaan (hari)**, **rentang tanggal analisis (start/end)**, dan **Kategori Barang (opsional)**. **Tidak ada form Buat Rencana terpisah, tidak ada filter kategori gudang & status.** | US-001/013/014/017, MF-1/2/3/4/5/6; BR-003, BR-018, BR-022, BR-027 |
| **FR-002** | Sistem **mengkalkulasi otomatis** per barang: Jumlah Barang Keluar (B), Sisa Stok (C), Rata-rata/hari (D), Stok Buffer (E), ROP, dan **rekomendasi restok** (Min-Max). | US-002, MF-7; BR-004…010 |
| **FR-003** | Sesuai parameter dashboard, sistem **menampilkan list barang** **diurut penggunaan tertinggi (fast moving)** + **menandai stok ≤ buffer** + **filter Kategori Barang** + **pencarian** (s/d dosis/sediaan); mendukung sort sekunder A–Z & grouping sediaan. | US-003/007/017, MF-7; BR-001, BR-002, BR-019, BR-027 |
| **FR-004** | User **men-checklist** barang lalu klik **Create Pengadaan**; barang terpilih dibawa ke penetapan pengadaan. | US-003, MF-8; BR-023 |
| **FR-005** | Pada penetapan pengadaan, user **memilih supplier dari dropdown (manual)** per barang & **mengisi jumlah restok** (default = rekomendasi); **override** wajib alasan. | US-006, US-010, MF-9/10; BR-011, BR-023, BR-024 |
| **FR-006** | Sistem menampilkan **estimasi nilai total** (informasi; **tanpa validasi budget di Fase 1**). | US-009, MF-11; BR-014 |
| **FR-007** | User dapat **menyimpan Draft** & **memfinalisasi** pengadaan; status berubah Draft → Final. **Tidak ada langkah/kolom approval di modul ini.** | US-008, MF-12; BR-015, BR-021 |
| **FR-008** | Setelah difinalisasi, sistem **membuat draft pemesanan (PR/PO)** & **handover ke masing-masing gudang** (H1/H12/H13); anti-duplikat; status rencana → Diteruskan. | US-008, US-014, MF-13; BR-016, BR-022 |
| **FR-009** | Sistem **mengelompokkan draft pemesanan per supplier** (1 supplier = 1 SP, beda supplier = beda SP); **penomoran SP dilakukan modul Pemesanan saat draft diterima**. | US-015, MF-13; BR-013, BR-026 |
| **FR-010** | Sistem **generate Dokumen Rencana Pengadaan (PDF)** untuk arsip. | US-011, MF-14 |
| **FR-011** | Sistem mencatat **audit trail** semua aksi (buat, override, finalisasi, handover) + **snapshot master data**. Tidak ada event approve/reject di modul ini. | US-012, MF-14; BR-017, BR-020 |
| **FR-012** | Sistem menyediakan **monitoring read-only** ringkasan rencana & estimasi nilai bagi Manajer Logistik/APJ (tanpa aksi approval). | US-009, MF-11 |
| **FR-013** | Sistem menerapkan **Role & Permission** per gudang/kategori (membuat/mengedit/memfinalisasi/meneruskan rencana). **Tanpa peran approver**. | US-009; BR-015, BR-022 |
| **FR-014** | *(Fase 2)* Sistem menampilkan **analisis & rekomendasi supplier** per barang (4 dimensi + perankingan 25%/dimensi); supplier default = peringkat-1; mendukung **multi-supplier per barang** berperingkat. | US-004, US-016; BR-012, BR-025 |
| **FR-015** | *(Fase 3)* Sistem menambah **metode EOQ** pada field Metode Kalkulasi sebagai alternatif Min-Max. | US-002; BR-009 |
| **FR-016** | *(Fase 4)* Sistem **mengintegrasikan validasi budget dengan modul Keuangan** (cek pagu real-time, warning/blocking konfigurable). | US-009; BR-014 |

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Layar INPUT — Parameter Dashboard Pengadaan (FR-001)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| gudang_id | Gudang (filter) | dropdown/lookup | Ya | dari master gudang | manual | menentukan kategori master, stok (H4) & modul tujuan; kategori gudang diturunkan internal (tidak ditampilkan sebagai filter); BR-022 |
| periode_pengadaan | Periode Pengadaan (hari) | number | Ya | > 0, integer, satuan hari | **default 30** | siklus/jendela pengadaan; jadi default rentang analisis (BR-003/018) |
| jangka_waktu_pengadaan | Jangka Waktu Pengadaan (hari) | number | Ya | > 0, integer, satuan hari | **default 30** | horizon proyeksi kebutuhan (faktor F di BR-009); BR-018 |
| tgl_analisis_start | Tgl Mulai Analisis | date | Ya | ≤ tgl_analisis_end | default = today − periode | rentang tren penggunaan (BR-003) |
| tgl_analisis_end | Tgl Selesai Analisis | date | Ya | ≤ hari ini | default = hari ini | BR-003 |
| kategori_barang | Kategori Barang (filter) | multi-select | **Tidak (opsional)** | dari master.kategori (A4/A5/A6) | manual | menyaring list barang (BR-027) |
| metode_kalkulasi | Metode Kalkulasi | dropdown | Tidak | Min-Max (Fase 1) / EOQ (Fase 3) | default Min-Max | BR-009; FR-015 |
| nomor_rencana | No. Rencana | text | – (auto) | unik, auto | auto-generate saat Create/Simpan | mis. RP-FAR-2026-06-001 |
| catatan | Catatan | text | Tidak | maks 500 char | manual | |

> **Catatan:** Dashboard ini **tidak** memiliki filter **kategori gudang** maupun filter **status** — keduanya dikecualikan sesuai desain (gudang sudah menentukan kategori; pembuatan pengadaan bukan layar daftar status).

### 11.2 Layar TAMPIL/INPUT — List Barang di Dashboard (ter-checklist) (FR-003/004)

| Kolom/Field | Sumber Data | Format/Tipe | Filter/Sort | Catatan |
|-------------|-------------|-------------|-------------|---------|
| Nama Barang | master A4/A5/A6 | text (format BR-002) | search s/d dosis/sediaan; sort sekunder A–Z | grouping per sediaan |
| Kategori Barang | master.kategori (A4/A5/A6) | badge | **filter (multi-select, opsional)** | mis. Obat/Alkes/BHP (BR-027) |
| Penggunaan (B) | Distribusi Barang (H3) per rentang | angka | **sort default desc (fast moving)** | BR-001/005 |
| Sisa Stok (C) | H4 real-time | angka | sort | BR-006 |
| Stok Buffer (E) | 20%/10% × restok | angka | – | BR-008 |
| Status Stok vs Buffer | hitung C vs Buffer E | badge (Aman C>E / ≤Buffer 0<C≤E / Habis C=0) | filter, **prioritas atas** | BR-001/006 |
| Rekomendasi Restok | rumus BR-009 | angka (highlight) | sort | jadi default jumlah restok |
| Pilih | checklist | boolean (checkbox) | – | hanya yang true dibawa ke penetapan via **Create Pengadaan** |

### 11.3 Layar INPUT — Penetapan Pengadaan per Barang (FR-005)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| barang_id | Barang | lookup | Ya (read-only) | dari pemilihan barang | terbawa | nama diformat BR-002 |
| supplier_id | Supplier | **dropdown (manual)** | Ya | dari master supplier barang | **dipilih manual** (Fase 1) | Fase 2 → default = supplier rekomendasi peringkat-1 (BR-012/024) |
| qty_rekomendasi | Jml Rekomendasi | number | – (read-only) | ≥ 0, integer | auto (BR-009) | hasil kalkulasi |
| qty_restok | Jml Restok | number | Ya | ≥ 0, integer | **default = qty_rekomendasi** | bila ≠ rekomendasi → override |
| alasan_override | Alasan Override | text | Ya bila qty_restok ≠ qty_rekomendasi | maks 255 char | manual | BR-011 |
| satuan | Satuan | text | Ya (read-only) | dari master | master | snapshot |
| harga_satuan | Harga Satuan | number | Ya (read-only) | ≥ 0, Rp | snapshot master supplier | BR-017 |

> *(Fase 2)* **Multi-supplier:** satu barang dapat dipecah ke > 1 baris supplier (qty manual); total qty seluruh baris = jumlah restok barang (BR-025). **Di Fase 1, satu barang = satu supplier.**

### 11.4 Layar INPUT — Finalisasi & Pengelompokan SP (FR-007/008/009)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| sp_grouping | Pengelompokan SP | auto (read-only) | Ya | Per supplier | sistem | 1 supplier = 1 SP, beda supplier = beda SP (BR-013) |
| nomor_sp | No. Surat Pesanan | text | – (read-only) | unik per supplier | **diterbitkan modul Pemesanan saat draft diterima** | belum terisi di H10; BR-026 |
| target_modul | Tujuan Pemesanan | auto (read-only) | Ya | H1/H12/H13 | derive dari gudang | Farmasi→H1, RT→H12, Gizi→H13; draft dikirim ke gudang asal (BR-016/022) |
| estimasi_nilai | Estimasi Nilai | number | – (read-only) | Rp | sum(qty_restok×harga) | informasi; validasi budget = Fase 4 (BR-014) |
| aksi_finalisasi | Aksi | button | Ya | Simpan Draft / Finalisasi Pengadaan | manual | Finalisasi → Draft→Final→Diteruskan; **tanpa approval** (BR-015) |

> **Catatan:** Modul ini **tidak memiliki layar/aksi approval**. Layar persetujuan (Setujui/Tolak) & **penerbitan nomor SP** berada di modul Pemesanan (H1/H12/H13).

### 11.5 *(Fase 2)* Layar TAMPIL — Analisis & Rekomendasi Supplier per Barang (FR-014)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Supplier | master supplier | text | filter | |
| Lead Time | rata-rata gap H2 | hari | sort asc | rekomendasi = terkecil |
| Harga Satuan | master supplier (snapshot) | Rp | sort asc | |
| Diskon | master supplier (snapshot) | % | sort desc | |
| Jumlah Retur | agregasi H8 per supplier | angka | sort asc | keandalan |
| Peringkat | gabungan 4 dimensi (25%/dimensi) | angka (1=terbaik) | sort asc | BR-012/025 |
| Rekomendasi | flag sistem | badge per dimensi | – | bisa >1 dimensi; default = peringkat-1 |

> *(Fase 2)* Layar ini muncul setelah pemilihan barang untuk membantu user memilih supplier terbaik & memecah ke beberapa supplier. **Di Fase 1 layar ini tidak ada** — supplier dipilih manual via dropdown (11.3).

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| **NFR-001** | Performa | Load dashboard, list barang & pencarian < 3 detik; auto-kalkulasi rekomendasi restok 1 rencana ≤ 200 item < 5 detik. |
| **NFR-002** | Skalabilitas | Mendukung katalog ≥ beberapa ribu item per gudang/kategori tanpa degradasi signifikan. [ASUMSI skala RS Tipe C/D] |
| **NFR-003** | Keandalan/Konsistensi | Kalkulasi memakai data stok & master konsisten (single reference H4 + A4/A5/A6 + H3); snapshot mencegah perubahan nilai pasca-master update. |
| **NFR-004** | Ketersediaan | **Tidak ada dukungan offline/sinkronisasi** [terkonfirmasi]. Penyusunan rencana & handover **memerlukan koneksi online**; data tersimpan di server (bukan lokal). |
| **NFR-005** | Keamanan & Akses | Role-based access (pembuat/editor/monitoring/auditor) per gudang/kategori; data harga hanya untuk role berwenang. **Tidak ada peran approver** (approval di modul Pemesanan). |
| **NFR-006** | Auditability | Semua aksi (buat/override/finalisasi/handover) tercatat immutable (user, waktu, before/after) untuk akreditasi SNARS/STARKES. |
| **NFR-007** | Usability | Pembuatan pengadaan **langsung dari dashboard** (tanpa form terpisah) — minim klik; list barang diurut fast-moving & menandai stok kritis; pencarian obat hingga dosis/sediaan; bahasa Indonesia; alur tanpa hambatan approval. |
| **NFR-008** | Kompatibilitas | Berjalan di browser standar; responsif untuk perangkat gudang. |
| **NFR-009** | Kepatuhan | Mendukung kepatuhan Perpres 12/2021, E-Katalog LKPP, Permenkes SIMRS, formularium/FORNAS; dokumen PDF arsip. |
| **NFR-010** | Integrabilitas | API/handover ke H1/H12/H13 idempoten (anti-duplikat), membawa **pengelompokan per supplier & gudang tujuan** (nomor SP diterbitkan modul Pemesanan); pembacaan **H2/H3/H4** efisien (batch). Handover membawa data lengkap agar approval di modul Pemesanan tidak perlu input ulang. |

## 13. Integrasi Eksternal

Integrasi **internal SIMRS** (utama untuk MVP) dan **eksternal** (di luar lingkup MVP).

### Integrasi Internal (modul SIMRS)
| Sumber/Tujuan | Code | Arah | Data | Catatan |
|---------------|------|------|------|---------|
| Master Data Barang Farmasi | A6 | baca | item, dosis, sediaan, FORNAS, pabrikan, satuan, supplier, harga | format nama BR-002 |
| Master Data Barang Gizi | A4 | baca | item gizi, satuan, supplier | |
| Master Data Barang Rumah Tangga | A5 | baca | item RT, satuan, supplier | |
| Informasi Stok | H4 | baca | sisa stok real-time per gudang (C) | BR-006 |
| Distribusi Barang | H3 | baca | barang keluar gudang→unit (B) — dasar fast moving | BR-005 [terkonfirmasi] |
| Penerimaan Barang | H2 | baca | tanggal pesan→terima (lead time A), PO outstanding | BR-004, BR-010 |
| Retur Pembelian | H8 | baca | *(Fase 2)* jumlah retur per supplier | BR-012 (keandalan) |
| Pemesanan Farmasi | H1 | tulis (handover) | draft PR/PO farmasi dikelompokkan per supplier | BR-016/026; **menerbitkan nomor SP & approval di H1** |
| Pemesanan Rumah Tangga | H12 | tulis (handover) | draft PR/PO RT dikelompokkan per supplier | BR-016/026; **menerbitkan SP & approval di H12** |
| Pemesanan Gizi | H13 | tulis (handover) | draft PR/PO gizi dikelompokkan per supplier | BR-016/026; **menerbitkan SP & approval di H13** |
| Modul Keuangan | — | *(Fase 4)* baca/validasi | budget/anggaran unit/gudang | validasi terintegrasi (cek pagu real-time, blocking) (BR-014) |

### Integrasi Eksternal
| Sistem | Arah | Data | Status |
|--------|------|------|--------|
| **SATUSEHAT** | — | [ASUMSI] modul perencanaan tidak langsung kirim ke SATUSEHAT; data transaksi obat dilaporkan oleh modul Pemesanan/Penerimaan | n/a (di luar lingkup) |

> Catatan: **Integrasi E-Katalog LKPP** (baca harga/katalog resmi) **di luar lingkup Fase 1–4**; E-Katalog tetap menjadi acuan **kepatuhan** (NFR-009), bukan integrasi sistem. **BPJS/VClaim** muncul pada BPMN penerimaan (konteks resep pasien) namun **tidak relevan langsung** untuk perencanaan pengadaan H10. [ASUMSI]
> **Penegasan alur:** Karena approval & penomoran SP ditangani modul Pemesanan, kontrak data handover H10→H1/H12/H13 harus membawa **gudang tujuan, pengelompokan per supplier**, identitas item, qty restok, supplier terpilih, harga snapshot, dan referensi nomor rencana. **Handover satu arah** (tanpa status balik ke H10).

## Asumsi
- [ASUMSI] Modul belum punya BPMN sendiri; alur As-Is/To-Be & FR diturunkan dari pola BPMN g-backoffice-inventory-pemesanan, -penerimaan, -stok-opname, -distribusi serta Lampiran dokumen & draft user v1.7.
- [PENEGASAN] Modul H10 TIDAK memiliki proses approval; seluruh approval & **penerbitan nomor SP** dilakukan di masing-masing modul Pemesanan (H1/H12/H13). Status di H10 terbatas pada Draft/Final/Diteruskan/Sebagian Diteruskan.
- [ASUMSI] **Pembuatan pengadaan dilakukan langsung dari Dashboard Pengadaan** (tidak ada form Buat Rencana terpisah). Dashboard **tidak** memiliki filter kategori gudang maupun filter status (BR-022/027).
- [ASUMSI] **Fase 1 (MVP) minimal**: input berbasis hari, supplier via **dropdown manual**, metode Min-Max, tanpa validasi budget, tanpa analisis/rekomendasi supplier, tanpa multi-supplier per barang, tanpa jenis rencana Emergency/Cito, tanpa pilihan periode 6-tingkat.
- [ASUMSI] Roadmap fase: **Fase 2 = Analisis & Rekomendasi Supplier** (4 dimensi + perankingan 25%/dimensi + multi-supplier per barang); **Fase 3 = Metode EOQ**; **Fase 4 = Integrasi Keuangan & Budgeting**.
- [ASUMSI] 'Gudang' = entitas spesifik (mis. Gudang Farmasi) yang menentukan kategori master, sumber stok, & modul tujuan pemesanan; draft pemesanan dikirim ke gudang asal (BR-022).
- [ASUMSI] **Periode Pengadaan (hari)** = siklus/jendela pengadaan (juga default rentang analisis); **Jangka Waktu Pengadaan (hari)** = horizon proyeksi kebutuhan (faktor F, BR-009). Keduanya default 30.
- [TERKONFIRMASI] Sumber Jumlah Barang Keluar (B) v1.0 = **Distribusi Barang (H3)** (BR-005).
- [TERKONFIRMASI] Ambang prioritas stok di list = **0 < C ≤ Stok Buffer (E)**; C = 0 = habis (BR-001/006). Threshold fast/slow **≤ 1 minggu berlaku semua kategori** (BR-008).
- [TERKONFIRMASI] Rumus rekomendasi restok = (D × F) + Buffer − C − PO Outstanding (BR-009).
- [TERKONFIRMASI] Draft dikelompokkan per supplier (1 supplier = 1 SP); **nomor SP diterbitkan di modul Pemesanan saat draft diterima**, bukan di H10 (BR-013/026).
- [TERKONFIRMASI] **Tanpa dukungan offline**; penyusunan & handover butuh online (NFR-004).
- [TERKONFIRMASI] **Handover satu arah**: H10 tidak menerima status balik & tidak menangani revisi pasca-handover (BR-016).
- [TERKONFIRMASI] *(Fase 2)* Bobot perankingan supplier 25%/dimensi; pembagian qty multi-supplier manual (BR-012/025).
- [ASUMSI] Snapshot master data dilakukan saat rencana dibuat/difinalisasi agar nilai estimasi konsisten meski master berubah.
- [ASUMSI] Role di modul ini terbatas pada pembuat/editor, monitoring (Manajer Logistik/APJ — read-only), dan auditor; tidak ada role approver.

## Pertanyaan Terbuka
- Default rentang analisis kini mengikuti **Periode Pengadaan (hari)** ke belakang (BR-003) — apakah cukup, atau perlu opsi cepat lain?
- Field handover apa saja yang wajib dikirim ke H1/H12/H13 agar penerbitan SP & approval di sana lengkap tanpa input ulang (kontrak data handover)?
- Karena dashboard kini fokus pembuatan pengadaan (tanpa list status), **di mana user melihat/melanjutkan rencana berstatus Draft/Diteruskan** — perlukah layar Monitoring/Daftar Rencana terpisah (FR-012) dengan filter status?
- *(Fase 2)* Apakah ada **batas jumlah supplier per barang** saat pemecahan qty multi-supplier (BR-025)?
- Perbedaan praktis **Periode Pengadaan (hari)** vs **Jangka Waktu Pengadaan (hari)**: apakah keduanya memang diisi terpisah oleh user, atau salah satu diturunkan otomatis dari yang lain?