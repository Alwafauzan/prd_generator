# PRD — Inventory: Informasi Stok

**Related Document:** Design Figma - Informasi Stok; PRD Master Modul Inventory (induk); PRD Detail Penerimaan/Distribusi/Mutasi/Pemakaian/Retur/Stok Opname (sumber data pergerakan stok); PRD Modul Farmasi - Pelayanan/Order Resep (CPOE, dispensing); PRD Modul Farmasi - Retur Obat Pasien; PRD Master Data (Unit, Instalasi, Supplier, Barang Farmasi/RT/Gizi); PRD Master Batch & Expired Date Barang Farmasi (FEFO); PRD Role & Permission; PRD Audit Trail; PRD Pemusnahan Barang; PRD Modul Keuangan (consumer Nilai Persediaan); PRD Modul Pengadaan (consumer ROP & pola konsumsi); PRD EMR/Rekam Medis (order obat & rekonsiliasi); PSAK 14 - Persediaan
**Versi:** 1.7 - Relasi Phase 1: fitur Penyesuaian Nilai HPP (FIFO/Moving Average) berelasi erat dengan H4 — H4 read-only consumer HPP/Nilai Persediaan (§5.4, BR-011); lanjutan v1.6 - Konfirmasi stakeholder: privasi Kartu Stok untuk role non-klinis — hanya jenis pergerakan & nomor unik dokumen pergerakan; No. Resep & identitas pasien disembunyikan/tidak diekspor (BR-022); lanjutan v1.5 (retur batch/ED tak teridentifikasi pakai HPP terakhir, Nilai Persediaan cukup ke Modul Keuangan internal, roadmap ambang ED/status per kategori), v1.4 (multi-select filter, reservasi stok, mapping fitur/BPMN Farmasi) & v1.3 (lokasi setting metode nilai & ambang ED)

## 1. Overview / Brief Summary

Fitur **Informasi Stok** (code H4, cluster Backoffice) adalah modul **read-only** di Modul Inventory yang menyediakan visibilitas lengkap atas stok barang di seluruh rumah sakit (**RS Tipe C & D**). Berbeda dengan fitur transaksional yang **menggerakkan** stok (H1 Pemesanan, H2 Penerimaan, H3 Distribusi, H5 Mutasi, H6 Stok Opname, H8 Retur, H11 Penggunaan Barang Unit), serta **pergerakan dari Modul Farmasi** (penyerahan/dispensing atas **Order Resep** dan **Retur Obat Pasien**), Informasi Stok adalah **hasil agregasi** dari seluruh pergerakan tersebut — cermin akurat kondisi stok pada titik waktu tertentu, baik live maupun historis.

Fitur menyediakan **2 cara akses** yang saling melengkapi:

1. **Informasi Detail Stok** — view multi-dimensi posisi stok per barang pada waktu tertentu (*cut-off date*). Menampilkan stok per unit, agregasi RS-wide / per Kategori / per Gudang, status ketersediaan (Cukup / Kurang / Minimum / Habis), batch & expired date untuk Farmasi, dan **Total Nilai Persediaan** sesuai metode kalkulasi terkonfigurasi (FIFO atau Moving Average).
2. **Kartu Stok (History Pergerakan)** — view kronologis seluruh pergerakan stok untuk satu barang. Tiap baris menampilkan tanggal & jam, jenis pergerakan, no. dokumen referensi (termasuk **No. Resep / identitas pasien** untuk pergerakan farmasi klinis), kuantitas (masuk/keluar), saldo akhir (*running balance*), HPP per pergerakan, dan Nilai Persediaan setelah pergerakan. Mengikuti standar kartu stok manual sebelum digitalisasi.

**Highlight:**
- **Stok pada waktu tertentu (Cut-off Date)** — hitung posisi stok untuk tanggal apa pun (masa lalu s/d hari ini); berguna untuk audit, opname, dan rekonsiliasi tutup buku.
- **Kalkulasi berbasis pergerakan**: `stok(t) = Σ pergerakan masuk s/d t − Σ pergerakan keluar s/d t`.
- **Multi-level agregasi**: per Barang per Unit → per Unit → per Kategori → RS-wide, dengan drill-down.
- **Total Nilai Persediaan**: FIFO (per batch) atau Moving Average — **satu metode global** untuk semua kategori, diset Admin RS di **Control Panel → Pengaturan Inventory** (selaras PSAK 14).
- **Status ketersediaan seragam lintas kategori**: ambang Cukup/Kurang/Minimum/Habis dihitung dengan aturan yang **sama untuk semua kategori** (Farmasi/Rumah Tangga/Gizi) relatif terhadap stok minimum & ROP master barang.
- **Status In-Transit terpisah**: `total stok RS = Σ stok unit/gudang + Σ in-transit`. Selalu *reconcile*.
- **Batch & Expired Date (Farmasi)** dengan urutan FEFO + **alert mendekati ED default 60 hari** (seragam lintas kategori, configurable); batch *Reserved for QC* (dari workflow Retur) dan *Reserved for Dispensing* (alokasi atas Order Resep yang sedang disiapkan) ditandai khusus dan tidak dihitung sebagai Stok Available.
- **Jejak farmasi klinis**: pergerakan **KELUAR** akibat penyerahan resep dan pergerakan **MASUK bersyarat** akibat retur obat pasien tercatat di ledger dengan tautan batch→resep→pasien, mendukung *recall* dan audit.
- **Export** ke Excel/PDF untuk rekap bulanan, audit eksternal (SNARS/STARKES), dan handover ke Modul Keuangan.

Cakupan tipe RS difinalisasi: modul ini menyasar **RS Tipe C & D**; fungsionalitas inti tetap sama bila kelak diperluas ke tipe lain.

## 2. Background

Sebelum adanya Informasi Stok terintegrasi, visibilitas stok di RS sangat terbatas dan tidak konsisten:

- Petugas Gudang & Unit memakai **buku stok manual / spreadsheet** — tidak ada *single source of truth*; setiap pihak punya "versi" stoknya sendiri.
- Total stok RS harus dikumpulkan manual dari semua unit — berjam-jam dan rawan error.
- **Stok pada tanggal lampau** (audit/opname/tutup buku) hampir mustahil direkonstruksi karena buku manual sering tidak lengkap.
- **Nilai persediaan** dihitung manual oleh Keuangan dengan asumsi harga rata-rata — tidak konsisten dengan **PSAK 14**.
- Tidak ada **kartu stok per barang real-time** — investigasi diskrepansi lama.
- **Penyerahan obat atas resep** dan **retur obat pasien** dicatat terpisah di buku farmasi/depo, sering tidak ter-rekonsiliasi dengan stok gudang induk — selisih stok farmasi sulit dilacak ke resep/pasien sumber.
- **Obat retur dari pasien** (mis. terapi diganti, pasien pulang, dosis batal) sering langsung dikembalikan ke rak tanpa QC/penandaan batch yang jelas — risiko obat ED/rusak ikut beredar dan nilai persediaan tidak akurat.
- **Batch Farmasi mendekati ED** sering terlewat, baru ketahuan saat sudah expired — kerugian finansial. Tanpa ambang alert yang baku, tiap unit pakai patokan berbeda.
- **Pengadaan** tidak bisa menganalisis pola konsumsi akurat — reorder tidak optimal.
- **Audit eksternal & akreditasi (SNARS/STARKES)** sulit dipenuhi tanpa data stok yang dapat ditelusuri, termasuk telusur batch→pasien untuk *recall*.

Fitur ini menjadikan stok sebagai **fungsi deterministik dari pergerakan** sehingga konsisten lintas unit, dapat ditelusuri (audit trail), dan langsung dikonsumsi Keuangan & Pengadaan — termasuk pergerakan yang dipicu oleh pelayanan resep dan retur obat pasien. Untuk RS Tipe C & D, aturan status ketersediaan dan ambang alert ED dibuat **seragam lintas kategori** agar mudah dipahami staf non-IT dan tidak perlu konfigurasi rumit per kategori.

[ASUMSI] Untuk RS Tipe C & D dengan SDM IT & jaringan terbatas, query historis berat dijalankan asinkron/terjadwal bila perlu agar tidak membebani operasional jam sibuk.

## 3. In Scope

### Scope Definition (yang dikerjakan)
- **Cakupan instalasi**: **RS Tipe C & D** (final).
- **Informasi Detail Stok**: posisi stok per barang pada *cut-off date* (live & historis), agregasi RS-wide / per Unit / per Kategori / per Gudang dengan drill-down.
- **Status ketersediaan** per barang: Cukup / Kurang / Minimum / Habis (relatif terhadap stok minimum & ROP master barang) dengan **aturan ambang seragam lintas kategori**.
- **Batch & Expired Date tracking (Farmasi)** dengan urutan FEFO; **alert mendekati ED default 60 hari (seragam lintas kategori, configurable)**; penandaan batch *Reserved for QC* dan *Reserved for Dispensing*.
- **Kartu Stok (history pergerakan)** per barang: kronologis, *running balance*, HPP per pergerakan, Nilai Persediaan setelah pergerakan, link ke dokumen referensi (termasuk No. Resep/pasien) & Audit Trail.
- **Menampilkan pergerakan farmasi klinis**: penyerahan/dispensing atas **Order Resep** (KELUAR) dan **Retur Obat Pasien** (MASUK bersyarat) sebagai jenis pergerakan tersendiri di ledger/Kartu Stok, dengan telusur batch→resep→pasien.
- **Total Nilai Persediaan** dengan metode **FIFO** atau **Moving Average** — **satu metode global** untuk semua kategori, diset di **Control Panel → Pengaturan Inventory** (oleh Admin RS).
- **Status In-Transit** (barang dalam perjalanan distribusi/mutasi belum dikonfirmasi) ditampilkan terpisah & masuk total RS.
- **Filter & pencarian**: per unit, kategori, gudang, rentang tanggal, kata kunci barang, status ketersediaan, status batch, jenis pergerakan (termasuk Dispensing Resep & Retur Obat Pasien).
- **Export** Excel & PDF (Detail Stok dan Kartu Stok).
- **Otorisasi** akses berbasis Role & Permission (lingkup unit/gudang/depo farmasi).

### Out Scope (yang TIDAK dikerjakan)
- **Tidak menggerakkan stok** — semua mutasi nilai/kuantitas dilakukan oleh modul transaksional (H1/H2/H3/H5/H6/H8/H9/H11) **dan Modul Farmasi** (pelayanan resep, retur obat pasien). Modul ini hanya membaca/menampilkan.
- **Tidak melakukan proses pelayanan resep / dispensing** (verifikasi resep, racik, serah obat) — itu di Modul Farmasi; Informasi Stok hanya menampilkan dampaknya pada stok.
- **Tidak melakukan proses retur obat pasien / keputusan QC** — itu di Modul Farmasi (Retur Obat Pasien); Informasi Stok hanya menampilkan hasil pergerakannya.
- **Tidak melakukan posting jurnal akuntansi** — hanya menyajikan Nilai Persediaan; jurnal di Modul Keuangan.
- **Tidak mengatur konfigurasi stok minimum / ROP** — itu di Master Data Barang.
- **Tidak menyediakan ambang status ketersediaan/ED yang berbeda-beda per kategori** — untuk saat ini aturannya **seragam lintas kategori** (perluasan per-kategori sudah dikonfirmasi dibutuhkan ke depan → kandidat fitur Pengaturan, di luar scope versi ini).
- **Tidak melakukan koreksi/adjustment stok** — adjustment via Stok Opname (H6).
- **Tidak mengelola proses Pemusnahan** (H9) — hanya menampilkan dampaknya pada stok (termasuk obat retur pasien yang gagal QC → dimusnahkan).
- **Setting metode FIFO/Moving Average** dilakukan di **Control Panel → Pengaturan Inventory** (satu metode global untuk semua kategori; modul ini hanya mengonsumsinya, tidak mengubah).

## 4. Goals and Metrics

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Single source of truth stok | % unit memakai Informasi Stok sebagai acuan (bukan buku manual) | ≥ 95% dalam 3 bulan |
| Rekonstruksi stok historis | Waktu menghasilkan posisi stok tanggal lampau | < 5 menit (vs berjam-jam manual) |
| Akurasi nilai persediaan (PSAK 14) | Selisih Nilai Persediaan sistem vs hasil opname | ≤ 1% per periode |
| Kecepatan query stok terkini | p95 waktu render Informasi Detail Stok | < 2 detik |
| Kecepatan query historis | p95 Kartu Stok untuk ~1 juta record pergerakan | < 5 detik |
| Reconcile total RS | `Σ unit + Σ in-transit == total RS` | 100% konsisten (selisih 0) |
| Rekonsiliasi farmasi klinis | % penyerahan resep & retur obat pasien yang ter-trace ke batch & pergerakan stok | 100% |
| Akurasi retur obat pasien | Selisih stok depo farmasi akibat retur tanpa pencatatan | turun ke ~0 |
| Telusur recall batch→pasien | Waktu mengidentifikasi pasien penerima 1 batch tertentu | < 5 menit |
| Pencegahan ED terlewat | % batch Farmasi expired tanpa terdeteksi sebelumnya | turun ke ~0 (alert FEFO, ambang 60 hari) |
| Konsistensi aturan status | % unit/kategori memakai ambang status ketersediaan & ED yang sama | 100% (seragam lintas kategori) |
| Dukungan audit/akreditasi | Waktu menyiapkan rekap stok untuk audit | < 1 hari (export sekali klik) |

[ASUMSI] Angka target di atas adalah baseline operasional; perlu kalibrasi terhadap volume transaksi nyata RS Tipe C & D. [PERLU KONFIRMASI] target SLA performa pada infrastruktur server RS aktual.

## 5. Related Feature

Informasi Stok = **konsumen agregasi** dari fitur transaksional Inventory **dan pergerakan farmasi klinis dari Modul Farmasi**. Setiap pergerakan dari fitur berikut menjadi baris di Kartu Stok dan memengaruhi posisi/nilai di Informasi Detail Stok.

### 5.1 Fitur Inventory (Backoffice)
| Code | Menu | Relasi terhadap H4 |
|------|------|--------------------|
| H1 | Inventory > Pemesanan Barang | Sumber rencana masuk (tidak menggerakkan stok sampai diterima) |
| H2 | Inventory > Penerimaan Barang | Pergerakan **MASUK** (+ batch/ED, HPP perolehan) |
| H3 | Inventory > Distribusi Barang | Pergerakan **KELUAR** unit asal & **MASUK** unit tujuan; sumber status **In-Transit** |
| H4 | Inventory > **Informasi Stok** | **Modul ini** (read-only agregasi) |
| H5 | Inventory > Mutasi Stok | Pergerakan antar lokasi/gudang; sumber In-Transit |
| H6 | Inventory > Stok Opname | **Adjustment** (selisih opname → koreksi stok & nilai) |
| H7 | Inventory > Peminjaman & Pengembalian | Pergerakan keluar/masuk sementara |
| H8 | Inventory > Retur Pembelian | Pergerakan **KELUAR** (ke supplier); sumber status batch *Reserved for QC* |
| H9 | Inventory > Pemusnahan Barang | Pergerakan **KELUAR** (barang dimusnahkan, termasuk obat retur pasien gagal QC) |
| H10 | Inventory > Rencana Pengadaan | **Consumer** data stok minimum/ROP/pola konsumsi dari H4 |
| H11 | Inventory > Penggunaan Barang Unit | Pergerakan **KELUAR** (pemakaian unit) |

### 5.2 Fitur Modul Farmasi (Pelayanan Penunjang) — relasi yang diperdalam
| Code | Menu | Relasi terhadap H4 |
|------|------|--------------------|
| **E2** (Order Resep, klinis); **F11/F13/F15** (Konfirmasi Order Resep); **F12/F14/F16** (Penyerahan Obat) | Farmasi > **Pelayanan / Order Resep (Dispensing)** | Saat **order resep dibuat** (E2) → stok **di-reserve** (status *Reserved for Dispensing*, keluar dari Stok Available). Saat **order dikonfirmasi & obat diserahkan ke pasien** (F11/F13/F15 → F12/F14/F16) → pergerakan **KELUAR** dari stok depo/instalasi farmasi (FEFO), **Stok Fisik benar-benar berkurang**, tercatat batch + No. Resep + identitas pasien. Bila resep dibatalkan → reservasi dilepas. |
| **F17** (Retur Obat); **F20** (Pengembalian Obat Ranap) | Farmasi > **Retur Obat Pasien** | Obat yang sudah didispensing namun dikembalikan (terapi diganti, pasien pulang, dosis batal, sisa floor stock) → pergerakan **MASUK bersyarat** ke stok HANYA bila lolos QC (kemasan utuh, batch & ED jelas, tidak rusak). Masuk dengan **batch & ED asli**. Bila gagal QC → tidak restock → jalur **Pemusnahan (H9)**. **BERBEDA** dari H8 Retur Pembelian. |
| **F13/F14** (Farmasi Rawat Inap/IGD); **F20** | Farmasi > Floor Stock / Depo Ranap-IGD | Sumber stok yang melayani resep ranap/IGD; pergerakan keluar/retur antar depo–unit. |

### 5.3 Lintas modul (referensi BPMN terkait)
`g-backoffice-inventory-penerimaan`, `g-backoffice-inventory-distribusi`, `g-backoffice-inventory-pemesanan`, `g-backoffice-inventory-stok-opname` (sumber pola pergerakan), `g-service-order-resep` (order resep klinis — E2), `g-support-pharmacy-rj` / `g-support-pharmacy-ri-igd` / `g-support-pharmacy-ibs` (konfirmasi & penyerahan obat — pergerakan KELUAR dispensing, F11–F16), `g-support-pharmacy-retur` & `g-support-pharmacy-return-ri` (retur/pengembalian obat pasien — F17/F20), `g-support-nutrition-usage` (pemakaian barang Gizi), `g-emr-inpatient` (order obat / CPOE & rekonsiliasi obat pasien → memicu dispensing & retur). Modul **Keuangan** (consumer Nilai Persediaan) dan **Pengadaan** (consumer ROP).

### 5.4 Penyesuaian Nilai HPP (Phase 1 — fitur terkait erat)
Fitur **Penyesuaian Nilai HPP sesuai metode persediaan (FIFO / Moving Average)** termasuk **Phase 1** dan **berelasi langsung dengan H4 Informasi Stok**. Fitur tersebut yang **menghitung & menyesuaikan nilai HPP** tiap pergerakan/batch sesuai metode global terkonfigurasi (BR-005); **H4 bersifat read-only consumer** — menampilkan HPP per pergerakan (Kartu Stok) dan Nilai Persediaan (Detail Stok) hasil penyesuaian tersebut, **tanpa menghitung/menyesuaikan sendiri** (BR-001, BR-011). Penyesuaian HPP terjadi mis. saat penerimaan dengan harga berbeda (Moving Average), pengeluaran batch tertentu (FIFO per batch), retur obat pasien dengan HPP batch asal / HPP terakhir bila batch tak teridentifikasi (BR-019), dan koreksi hasil Stok Opname (H6). [PERLU KONFIRMASI] kode fitur final 'Penyesuaian Nilai HPP' pada List Fitur (belum terpetakan ke H-code di data fitur saat ini).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Background & analogi BPMN inventory/farmasi]
1. Petugas Unit/Gudang/Depo Farmasi mencatat stok di **buku manual / spreadsheet** masing-masing.
2. Saat butuh **total stok RS**, Admin meminta data ke tiap unit → kompilasi manual berjam-jam.
3. **Stok tanggal lampau** direkonstruksi seadanya dari buku (sering tidak lengkap).
4. **Nilai persediaan** dihitung Keuangan dengan harga rata-rata asumtif (tidak konsisten PSAK 14).
5. **Penyerahan obat atas resep** dicatat di buku depo, terpisah dari stok induk; selisih sulit dilacak ke resep/pasien.
6. **Obat retur pasien** sering dikembalikan ke rak tanpa QC & tanpa penandaan batch → stok & nilai tidak akurat, risiko obat ED beredar.
7. Investigasi diskrepansi: telusuri nota fisik & buku resep satu per satu — lambat & sering buntu.
8. Batch Farmasi mendekati ED dicek manual dengan patokan hari yang berbeda-beda antar petugas; sering terlewat.

### B. To-Be (kondisi diharapkan) [turunan dari pola BPMN inventory + pelayanan resep/retur obat pasien]
1. Semua pergerakan dari H2/H3/H5/H6/H8/H9/H11 **dan Modul Farmasi (dispensing resep, retur obat pasien)** tersimpan sebagai **ledger pergerakan stok** terpusat (Sistem menyimpan & menambah/mengurangi stok lokasi).
2. **Order Resep** → saat resep disiapkan, sistem **me-reserve** stok (status *Reserved for Dispensing*); saat diserahkan ke pasien, sistem mencatat pergerakan **KELUAR** (FEFO) dengan tautan batch + No. Resep + pasien. Bila resep batal, reservasi dilepas.
3. **Retur Obat Pasien** → petugas farmasi menilai QC; bila **lolos** → pergerakan **MASUK** ke stok depo dengan batch & ED **asli** (FEFO tetap berlaku); bila **gagal** → tidak restock, ditandai untuk **Pemusnahan (H9)**.
4. Admin/Unit/Apoteker buka **Inventory → Informasi Stok**; sistem menampilkan **summary cards** dan tabel posisi stok; pergerakan dispensing & retur pasien tampil di Kartu Stok sebagai jenis pergerakan tersendiri.
5. User memilih **cut-off date** → sistem menghitung `stok(t)` dari ledger; menampilkan live atau historis.
6. **Drill-down**: RS-wide → Kategori → Gudang/Depo/Unit → Barang → Batch (FEFO untuk Farmasi).
7. Sistem menghitung **Nilai Persediaan** per metode terkonfigurasi global (FIFO/Moving Average, seragam semua kategori), dan menentukan **status ketersediaan** dengan aturan ambang **seragam lintas kategori**.
8. Sistem menandai batch Farmasi yang **mendekati ED ≤ 60 hari (default)** dengan badge & daftar tindak lanjut, memakai ambang yang sama untuk semua kategori.
9. Untuk investigasi/recall, user buka **Kartu Stok** satu barang → kronologi pergerakan + running balance + HPP + tautan No. Resep/pasien; klik link **Audit Trail** untuk telusuri transaksi sumber.
10. **Export** Excel/PDF → handover ke Keuangan / audit.
11. **In-Transit** & **Reserved (QC / Dispensing)** ditampilkan terpisah; saat dikonfirmasi/dilepas, otomatis menyesuaikan Stok Available.

## 7. Main Flow / Mindmap

### Skenario A — Informasi Detail Stok (cut-off bulanan)
1. Admin Inventaris buka **Inventory → Informasi Stok → Informasi Detail Stok**.
2. Pilih **cut-off date** = 30 Juni 2026 23:59.
3. Sistem render **summary cards**: Total Item Aktif (mis. 1.247 SKU), Total Stok RS (mis. 84.523 unit), Total Nilai Persediaan (mis. Rp 2,4 M).
4. **Drill-down per Kategori**: Farmasi (Rp 1,8 M), Rumah Tangga (Rp 380 jt), Gizi (Rp 220 jt).
5. Klik **Farmasi** → lihat per **Gudang/Depo** → klik **Depo Farmasi Rawat Jalan** → lihat **per Barang** dengan stok per **batch (FEFO)**.
6. Klik **Export Excel** untuk handover ke Keuangan.

### Skenario B — Kartu Stok (investigasi diskrepansi)
1. Apoteker menerima laporan stok **Paracetamol 500mg** janggal di unit Rawat Inap.
2. Buka **Kartu Stok** barang tsb; filter **unit = Rawat Inap**, **daterange = 1–15 Juni 2026**.
3. Sistem tampilkan **47 baris** pergerakan kronologis (penerimaan, dispensing resep, retur pasien, pemakaian, 1 adjustment opname), **running balance** & **HPP** per baris.
4. Temukan 1 baris saldo akhir tidak match → terungkap obat retur pasien tidak ter-restock di buku manual.
5. Klik **link Audit Trail / No. Resep** baris tsb untuk investigasi lanjut & eskalasi koreksi via Stok Opname (H6).

### Skenario C — Cek ketersediaan & FEFO harian
1. Petugas Gudang/Depo buka Informasi Detail Stok (live, cut-off = sekarang).
2. Filter **status = Minimum/Habis** → daftar barang perlu reorder (feed ke H10 Pengadaan).
3. Filter Farmasi **ED ≤ 60 hari (ambang default)** → daftar batch mendekati expired untuk tindak lanjut (retur/pemusnahan). Ambang 60 hari berlaku **seragam untuk semua kategori**.

### Skenario D — Dampak Penyerahan Resep (Dispensing) di Stok
1. Resep pasien rawat jalan **di-order** (E2) → sistem **me-reserve** 10 tablet **Amoxicillin 500mg** dari batch ED terdekat (status *Reserved for Dispensing*); Stok Fisik belum berubah.
2. Apoteker buka Informasi Detail Stok → barang tampil dengan **Stok Available berkurang 10** (reserved), Stok Fisik belum berubah.
3. Order dikonfirmasi & obat diserahkan ke pasien (F11/F13/F15 → F12/F14/F16) → Modul Farmasi mencatat pergerakan **KELUAR**, **Stok Fisik benar-benar berkurang** → di **Kartu Stok** muncul baris: jenis = *Penyerahan Resep*, No. Dokumen = No. Resep, ref pasien, batch/ED, qty keluar 10, saldo akhir berkurang, HPP per metode.
4. (Alternatif) Resep dibatalkan sebelum serah → reservasi dilepas, Stok Available kembali 10.

### Skenario E — Retur Obat Pasien (restock bersyarat)
1. Pasien rawat inap dipulangkan; tersisa 6 tablet obat yang sudah didispensing tapi tidak terpakai → diretur ke Depo Farmasi.
2. Petugas farmasi melakukan **QC**: kemasan utuh, batch & ED terbaca, tidak rusak → **lolos**.
3. Modul Farmasi mencatat **Retur Obat Pasien (MASUK)** dengan batch & ED **asli** → di **Kartu Stok** muncul baris: jenis = *Retur Obat Pasien*, ref No. Resep/pasien asal, qty masuk 6, saldo akhir bertambah, masuk antrean FEFO.
4. (Alternatif gagal QC) Kemasan rusak / obat suhu-sensitif tak terjamin → **tidak** restock → ditandai untuk **Pemusnahan (H9)**; di Kartu Stok tidak ada baris MASUK, melainkan tercatat sebagai kandidat pemusnahan.
5. Apoteker memverifikasi di Informasi Detail Stok bahwa Stok Available bertambah hanya untuk obat yang lolos QC.

## 8. Business Rules

- **BR-001 (Read-only)**: Modul Informasi Stok TIDAK mengubah kuantitas/nilai stok. Semua mutasi hanya dari fitur transaksional H2/H3/H5/H6/H8/H9/H11 **dan Modul Farmasi (penyerahan resep, retur obat pasien)**.
- **BR-002 (Formula stok)**: `Stok(barang, lokasi, t) = Σ qty_masuk(≤ t) − Σ qty_keluar(≤ t)` dari ledger pergerakan.
- **BR-003 (Reconcile RS)**: `Total Stok RS = Σ stok semua unit/gudang/depo + Σ In-Transit`. Selisih harus = 0; bila ≠ 0 sistem tandai anomali. (Analogi `g-backoffice-inventory-distribusi`.)
- **BR-004 (In-Transit)**: Barang yang sudah dikeluarkan unit asal namun belum dikonfirmasi unit tujuan berstatus **In-Transit**, tidak dihitung di stok unit mana pun tetapi masuk Total RS. Saat dikonfirmasi → pindah ke stok unit tujuan.
- **BR-005 (Metode nilai persediaan)**: **Satu metode nilai persediaan berlaku seragam untuk semua kategori** (Farmasi/Rumah Tangga/Gizi) — **FIFO (per batch)** atau **Moving Average** — dipilih Admin RS di **Control Panel → Pengaturan Inventory**. Tidak ada metode berbeda per kategori pada versi ini. Pengeluaran fisik Farmasi tetap mengikuti **FEFO** (BR-006) terlepas dari metode valuasi. Konsisten **PSAK 14**.
- **BR-006 (FEFO Farmasi)**: Stok Farmasi diurutkan & disarankan keluar berdasarkan **Expired Date terdekat (First-Expired-First-Out)** — termasuk saat dispensing resep.
- **BR-007 (Reserved for QC)**: Batch berstatus *Reserved for QC* (dari workflow Retur Pembelian H8) ditandai khusus dan **TIDAK** dihitung sebagai **Stok Available**.
- **BR-008 (Status ketersediaan — seragam lintas kategori)**: `Habis` jika stok = 0; `Minimum` jika stok ≤ stok minimum; `Kurang` jika stok minimum < stok < ROP; `Cukup` jika stok ≥ ROP. Aturan ambang ini **sama untuk semua kategori** (Farmasi/Rumah Tangga/Gizi); nilai stok minimum & ROP tetap diambil per barang dari Master Data. Dihitung atas **Stok Available** (BR-020).
- **BR-009 (Cut-off historis)**: Cut-off date boleh masa lalu s/d hari ini; **tidak boleh** masa depan.
- **BR-010 (Otorisasi)**: User hanya melihat unit/gudang/depo sesuai Role & Permission. Admin/Manajemen melihat RS-wide.
- **BR-011 (Konsistensi HPP)**: HPP per pergerakan keluar mengikuti metode terkonfigurasi (FIFO: harga batch yang keluar; Moving Average: harga rata bergerak saat transaksi). Perhitungan & **penyesuaian nilai HPP** ini dilakukan oleh fitur **Penyesuaian Nilai HPP (Phase 1)** sesuai metode persediaan; **H4 hanya menampilkan hasilnya** (read-only, BR-001) — lihat §5.4.
- **BR-012 (Pemusnahan)**: Barang yang dimusnahkan (H9) dikeluarkan dari stok dan tampil sebagai pergerakan KELUAR di Kartu Stok — termasuk obat retur pasien yang gagal QC.
- **BR-013 (Audit trail)**: Setiap baris Kartu Stok harus dapat ditautkan ke dokumen sumber & entri Audit Trail.
- **BR-014 (Dispensing Resep = KELUAR)**: Penyerahan obat atas **Order Resep** (rawat jalan/IGD/rawat inap) menghasilkan pergerakan **KELUAR** dari stok depo/instalasi farmasi, mengikuti **FEFO**, tercatat **batch, No. Resep, dan identitas pasien**. Tampil di Kartu Stok sebagai jenis *Penyerahan Resep*.
- **BR-015 (Reservasi resep / Reserved for Dispensing)**: Mekanisme reservasi **diterapkan**. Saat **order resep dibuat** (E2), stok **di-reserve** → mengurangi **Stok Available** tanpa mengubah **Stok Fisik**. Saat **order dikonfirmasi/obat diserahkan** (Konfirmasi Order Resep F11/F13/F15 → Penyerahan Obat F12/F14/F16), reservasi dikonversi jadi **KELUAR** dan **Stok Fisik benar-benar berkurang**. Bila resep dibatalkan/kedaluwarsa → reservasi **dilepas** dan Stok Available kembali.
- **BR-016 (Retur Obat Pasien = MASUK bersyarat)**: Obat yang sudah didispensing lalu dikembalikan menghasilkan pergerakan **MASUK** ke stok **hanya bila lolos QC** (kemasan utuh, batch & ED teridentifikasi, bukan obat rusak/suhu-sensitif yang tak terjamin). Bila **gagal QC** → **tidak** restock → masuk jalur **Pemusnahan (H9)**.
- **BR-017 (Pemisahan jenis Retur)**: **Retur Obat Pasien** (MASUK, dari pasien/unit ke farmasi) **BERBEDA** dari **Retur Pembelian H8** (KELUAR, ke supplier). Keduanya tampil sebagai jenis pergerakan **terpisah** di Kartu Stok dan filter jenis pergerakan.
- **BR-018 (Traceability batch resep→pasien)**: Setiap pergerakan dispensing & retur obat pasien wajib menautkan **batch/ED + No. Resep/identitas pasien** untuk mendukung **recall** dan audit.
- **BR-019 (Retur masuk dengan batch & ED asli)**: Obat retur pasien yang lolos QC masuk kembali dengan **batch & ED asli** (bukan ED baru), tetap diurutkan **FEFO**; bila ED dekat ambang (≤ 60 hari) ditandai (badge ED). Nilai persediaan retur memakai HPP batch asalnya; **bila batch/ED asal tidak teridentifikasi, gunakan HPP terakhir** barang tersebut.
- **BR-020 (Stok Available vs Stok Fisik)**: `Stok Available = Stok Fisik − Reserved for QC − Reserved for Dispensing`. Total RS & reconcile (BR-003) memakai Stok Fisik; status ketersediaan (BR-008) dihitung atas **Stok Available**.
- **BR-021 (Ambang alert mendekati ED — default 60 hari, seragam lintas kategori)**: Batch Farmasi dengan `sisa_hari_ED = ED − cut-off date ≤ 60 hari` (dan > 0) ditandai **Mendekati ED** (badge) dan masuk daftar tindak lanjut (retur/pemusnahan). Batch dengan `sisa_hari_ED ≤ 0` ditandai **Expired** (tidak boleh masuk Stok Available). Ambang **60 hari berlaku sama untuk semua kategori** dan bersifat *configurable* di **Control Panel → Pengaturan Expired Date** dengan **hak ubah Admin RS** (default = 60). Ke depan, ambang berbeda per kategori/jenis sediaan (mis. vaksin, obat suhu-sensitif) **dibutuhkan** dan direncanakan masuk fitur Pengaturan (roadmap, di luar scope versi ini).
- **BR-022 (Privasi Kartu Stok untuk role non-klinis)**: Pada Kartu Stok & export-nya, **role tanpa kewenangan klinis** hanya boleh melihat **jenis pergerakan** dan **nomor unik dokumen pergerakan (No. Dokumen Ref)**. **No. Resep dan identitas pasien (No. RM/nama)** untuk pergerakan farmasi klinis **disembunyikan sepenuhnya** (tidak ditampilkan & tidak ikut diekspor) — bukan sekadar di-mask sebagian. Hanya **role dengan kewenangan klinis** (mis. Apoteker/Petugas Farmasi/role berwenang RME) yang dapat melihat & mengekspor No. Resep + identitas pasien. Konsisten kerahasiaan RME (NFR-005, FR-012, FR-013).

## 9. User Stories

- **US-001** — Sebagai **Admin Inventaris**, saya ingin melihat **Total Stok RS & Total Nilai Persediaan** pada cut-off date tertentu, agar bisa rekap bulanan & handover ke Keuangan. *(source: skenario A)*
- **US-002** — Sebagai **Admin Inventaris**, saya ingin **drill-down** RS-wide → Kategori → Gudang/Depo → Barang → Batch, agar bisa menelusuri komposisi stok & nilai.
- **US-003** — Sebagai **Apoteker**, saya ingin membuka **Kartu Stok** satu barang dengan running balance & HPP, agar bisa investigasi diskrepansi stok. *(source: skenario B)*
- **US-004** — Sebagai **Apoteker/Petugas Gudang**, saya ingin melihat **batch Farmasi terurut FEFO & alert mendekati ED (default ≤ 60 hari, seragam lintas kategori)**, agar tidak ada obat expired terlewat. *(BR-021)*
- **US-005** — Sebagai **Petugas Unit**, saya ingin melihat **status ketersediaan (Cukup/Kurang/Minimum/Habis)** barang di unit saya dengan aturan ambang yang seragam, agar bisa mengajukan permintaan/pemesanan tepat waktu. *(BR-008)*
- **US-006** — Sebagai **Bagian Keuangan**, saya ingin **export Nilai Persediaan** per metode (FIFO/Moving Average) ke Excel/PDF, agar konsisten dengan PSAK 14 untuk jurnal & laporan.
- **US-007** — Sebagai **Bagian Pengadaan**, saya ingin melihat **stok minimum, ROP & pola konsumsi** dari Informasi Stok, agar reorder optimal. *(feed ke H10)*
- **US-008** — Sebagai **Manajemen**, saya ingin melihat **summary cards & nilai persediaan RS-wide**, agar punya gambaran aset persediaan cepat.
- **US-009** — Sebagai **Auditor/Tim Akreditasi**, saya ingin **merekonstruksi posisi stok tanggal lampau** beserta jejaknya, agar memenuhi audit eksternal (SNARS/STARKES).
- **US-010** — Sebagai **Admin**, saya ingin melihat **status In-Transit terpisah** dan reconcile total RS, agar tidak ada stok hilang/dobel saat distribusi/mutasi. *(source: BR-003/BR-004)*
- **US-011** — Sebagai **User**, saya ingin **filter & cari** (unit, kategori, gudang, tanggal, status, kata kunci, jenis pergerakan), agar cepat menemukan barang yang dicari.
- **US-012** — Sebagai **Apoteker**, saya ingin melihat **dampak penyerahan resep (dispensing)** pada Kartu Stok lengkap dengan batch, No. Resep, dan pasien, agar pengeluaran obat ter-rekonsiliasi dengan stok. *(source: skenario D; BR-014)*
- **US-013** — Sebagai **Apoteker**, saya ingin melihat **stok yang sedang di-reserve untuk dispensing** terpisah dari Stok Available, agar tidak salah hitung ketersediaan saat resep sedang disiapkan. *(BR-015, BR-020)*
- **US-014** — Sebagai **Apoteker/Kepala Instalasi Farmasi**, saya ingin melihat pergerakan **Retur Obat Pasien (MASUK)** yang lolos QC dengan batch & ED asli, agar stok depo akurat dan obat retur yang gagal QC tidak ikut beredar. *(source: skenario E; BR-016, BR-019)*
- **US-015** — Sebagai **Apoteker/Petugas Farmasi**, saya ingin membedakan **Retur Obat Pasien** dari **Retur Pembelian** di Kartu Stok & filter, agar tidak tertukar arah pergerakan. *(BR-017)*
- **US-016** — Sebagai **Apoteker/Tim Mutu**, saya ingin **menelusuri satu batch ke seluruh resep & pasien penerimanya** (recall), agar bisa menarik obat bermasalah dengan cepat. *(BR-018)*
- **US-017** — Sebagai **Admin/Apoteker Penanggung Jawab**, saya ingin **ambang alert mendekati ED yang baku (default 60 hari, configurable) dan sama untuk semua kategori**, agar tindak lanjut ED konsisten dan tidak bergantung patokan pribadi tiap petugas. *(BR-021)*

## 10. Functional Requirements

**Informasi Detail Stok**
- **FR-001** Sistem menampilkan **summary cards**: Total Item Aktif (SKU), Total Stok RS (unit), Total Nilai Persediaan (Rp). *(US-001)*
- **FR-002** Sistem menyediakan input **cut-off date/time**; menghitung posisi stok via BR-002 untuk tanggal tsb (default = sekarang/live). *(US-001, US-009; BR-009)*
- **FR-003** Sistem menyediakan **drill-down** RS-wide → Kategori → Gudang/Depo/Unit → Barang → Batch. *(US-002)*
- **FR-004** Sistem menampilkan **status ketersediaan** per barang sesuai BR-008 (aturan ambang **seragam lintas kategori**) atas **Stok Available** (BR-020) dengan indikator warna. *(US-005)*
- **FR-005** Untuk Farmasi, sistem menampilkan **batch & expired date** terurut FEFO, menandai batch **Mendekati ED (≤ 60 hari default, BR-021)**, *Reserved for QC*, dan *Reserved for Dispensing* (dikeluarkan dari Stok Available). *(US-004, US-013, US-017; BR-006, BR-007, BR-015, BR-020, BR-021)*
- **FR-006** Sistem menghitung & menampilkan **Nilai Persediaan** per metode terkonfigurasi global (FIFO/Moving Average, seragam semua kategori; diset di Control Panel → Pengaturan Inventory). *(US-006; BR-005, BR-011)*
- **FR-007** Sistem menampilkan **In-Transit** dan **Reserved (QC/Dispensing)** terpisah serta memastikan reconcile Total RS (BR-003/BR-004/BR-020). *(US-010, US-013)*

**Kartu Stok (History Pergerakan)**
- **FR-008** Sistem menampilkan **kronologi pergerakan** satu barang: tanggal/jam, jenis pergerakan, no. dokumen, qty masuk/keluar, saldo akhir (running balance), HPP, Nilai Persediaan setelah pergerakan. *(US-003)*
- **FR-009** Sistem menyediakan **filter** unit, daterange, jenis pergerakan (termasuk *Penyerahan Resep* & *Retur Obat Pasien*) pada Kartu Stok; **filter Unit dan Jenis Pergerakan mendukung multi-select**. *(US-003, US-011, US-015)*
- **FR-010** Tiap baris menyediakan **link ke dokumen referensi & Audit Trail**; untuk pergerakan farmasi klinis, tautan mencakup **No. Resep & identitas pasien**. *(US-003, US-012; BR-013, BR-018)*

**Pergerakan Farmasi Klinis (Order Resep & Retur Obat Pasien)**
- **FR-016** Sistem menampilkan pergerakan **KELUAR akibat penyerahan resep (dispensing)** sebagai jenis *Penyerahan Resep* di Kartu Stok, lengkap batch/ED (FEFO), No. Resep, dan pasien. *(US-012; BR-014, BR-006)*
- **FR-017** Sistem menampilkan stok yang **di-reserve untuk dispensing** (status *Reserved for Dispensing*) terpisah dari Stok Available; bila resep dibatalkan/kedaluwarsa, reservasi yang dilepas tercermin pada Stok Available. *(US-013; BR-015, BR-020)*
- **FR-018** Sistem menampilkan pergerakan **MASUK akibat Retur Obat Pasien** yang lolos QC sebagai jenis *Retur Obat Pasien*, dengan **batch & ED asli** dan tetap mengikuti antrean FEFO; retur yang gagal QC **tidak** muncul sebagai MASUK melainkan tercermin sebagai kandidat/efek **Pemusnahan (H9)**. *(US-014; BR-016, BR-019, BR-012)*
- **FR-019** Sistem **membedakan** jenis pergerakan *Retur Obat Pasien* (MASUK) dari *Retur Pembelian* (KELUAR) pada tampilan, filter, dan export. *(US-015; BR-017)*
- **FR-020** Sistem menyediakan **telusur batch→resep→pasien** (recall): dari satu batch, tampilkan seluruh pergerakan dispensing & retur beserta No. Resep/pasien terkait. *(US-016; BR-018)*

**Umum**
- **FR-011** Sistem menyediakan **pencarian & filter** global (unit, kategori, gudang/depo, tanggal, status, status batch, jenis pergerakan, kata kunci). *(US-011)*
- **FR-012** Sistem menyediakan **Export Excel & PDF** untuk Detail Stok dan Kartu Stok. Kolom **No. Resep & identitas pasien hanya ikut diekspor untuk role dengan kewenangan klinis (BR-022)**; untuk **role non-klinis**, export Kartu Stok hanya memuat **jenis pergerakan & nomor unik dokumen pergerakan** (No. Resep/identitas pasien disembunyikan). *(US-006, US-009; BR-022)*
- **FR-013** Sistem menerapkan **otorisasi lingkup unit/gudang/depo** berbasis Role & Permission; **No. Resep & identitas pasien** pada Kartu Stok hanya untuk role berwenang/klinis (privasi RME, **BR-022**). **Role non-klinis** hanya melihat **jenis pergerakan & nomor unik dokumen pergerakan**. *(US-005; BR-010, BR-022)*
- **FR-014** Sistem **bersifat read-only**: tidak menyediakan aksi yang mengubah kuantitas/nilai stok. *(BR-001)*
- **FR-015** Sistem menyediakan **alert/daftar** barang berstatus Minimum/Habis dan **batch Farmasi mendekati ED dengan ambang default 60 hari (seragam lintas kategori, configurable — BR-021)** sebagai feed ke Pengadaan (H10) & tindak lanjut Retur/Pemusnahan. *(US-004, US-017)*
- **FR-021** Sistem menyediakan **konfigurasi ambang alert mendekati ED** (default 60 hari) di **Control Panel → Pengaturan Expired Date** dengan **hak ubah dibatasi ke Admin RS**; perubahan nilai berlaku ke seluruh kategori (tidak per-kategori untuk saat ini). *(US-017; BR-021)*

## 11. Data Requirements (Spesifikasi Field)

Modul ini read-only; "input" hanya berupa **parameter filter/query**. Layar utama bersifat **tampil data**.

### 11.1 Layar INPUT — Panel Filter Informasi Detail Stok (FR-002, FR-003, FR-011)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| cutoff_datetime | Cut-off Tanggal & Jam | date(+time) | Ya | ≤ sekarang; tidak boleh masa depan (BR-009) | default = sekarang | inti perhitungan stok(t) |
| kategori | Kategori Barang | dropdown | Tidak | enum: Farmasi / Rumah Tangga / Gizi | master kategori | filter & agregasi |
| gudang | Gudang/Depo/Instalasi | dropdown | Tidak | dari master gudang/depo sesuai hak akses | lookup | dibatasi Role (BR-010) |
| unit | Unit/Poli | dropdown | Tidak | dari master unit | lookup | |
| status_ketersediaan | Status | dropdown | Tidak | Cukup/Kurang/Minimum/Habis | enum (BR-008) | atas Stok Available; ambang seragam lintas kategori |
| status_batch | Status Batch | dropdown | Tidak | Available / Reserved for QC / **Reserved for Dispensing** / **Mendekati ED (≤60 hari)** / Expired | enum (BR-021) | khusus Farmasi (BR-015) |
| ed_threshold_days | Ambang Mendekati ED (hari) | number | Tidak | integer > 0 | **default = 60** (configurable, BR-021) | seragam lintas kategori; read-only bila terkunci config |
| keyword | Cari Barang | text | Tidak | maks 100 char; cocokkan nama/kode SKU | manual | |
| metode_nilai | Metode Nilai Persediaan | dropdown | Tidak | FIFO / Moving Average | default = config global (Pengaturan Inventory) | read-only display; satu metode global semua kategori (BR-005) |

### 11.2 Layar INPUT — Panel Filter Kartu Stok (FR-009)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| barang_id | Barang | lookup | Ya | harus barang valid di master | master barang | satu barang per Kartu Stok |
| unit | Unit/Depo | dropdown (multi) | Tidak | sesuai hak akses | lookup | multi-select unit |
| date_from | Tanggal Mulai | date | Ya | ≤ date_to | default awal bulan | |
| date_to | Tanggal Selesai | date | Ya | ≥ date_from; ≤ hari ini | default hari ini | |
| jenis_pergerakan | Jenis Pergerakan | dropdown (multi) | Tidak | Penerimaan / Distribusi / Mutasi / Pemakaian / **Penyerahan Resep** / **Retur Obat Pasien** / Retur Pembelian / Opname / Pemusnahan / Peminjaman | enum (BR-014, BR-016, BR-017) | multi-select (diperlukan) |
| no_resep | No. Resep | text | Tidak | format no resep | manual | filter pergerakan farmasi klinis; **field hanya untuk role klinis berwenang** (disembunyikan utk non-klinis — BR-022) |
| pasien_ref | Pasien (No. RM) | lookup | Tidak | valid di RME; hanya role berwenang | lookup RME | privasi (FR-013, **BR-022**); **field hanya untuk role klinis berwenang** |
| batch_no | No. Batch | lookup | Tidak | batch valid barang | master batch | untuk telusur recall (FR-020) |

### 11.3 Layar INPUT — Panel Telusur Batch (Recall) (FR-020)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| barang_id | Barang | lookup | Ya | valid master | master barang | |
| batch_no | No. Batch | lookup | Ya | batch valid barang terpilih | master batch | kunci recall |
| periode | Rentang Tanggal | daterange | Tidak | ≤ hari ini | default 6 bln terakhir | lingkup penelusuran |

### 11.4 Layar TAMPIL — Summary Cards Informasi Detail Stok (FR-001)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Item Aktif | count(SKU aktif) sesuai filter | angka besar | – | kartu ringkasan |
| Total Stok RS | Σ stok fisik unit/gudang/depo + Σ in-transit (BR-003) | angka + satuan | – | reconcile wajib |
| Total Nilai Persediaan | Σ nilai per metode (BR-005) | Rupiah (Rp) | – | per cut-off |
| Total In-Transit | Σ qty/nilai status in-transit | angka + Rp | – | ditampilkan terpisah (BR-004) |
| Total Reserved | Σ qty Reserved for QC + Reserved for Dispensing | angka + Rp | – | terpisah dari Available (BR-020) |
| Batch Mendekati ED | count batch Farmasi sisa_hari_ED ≤ 60 (BR-021) | angka + badge | – | feed tindak lanjut; ambang seragam |

### 11.5 Layar TAMPIL — Tabel Posisi Stok per Barang (FR-003, FR-004, FR-005, FR-006)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Kode SKU | master_barang.kode | text | sort | |
| Nama Barang | master_barang.nama | text | sort A-Z, search | |
| Kategori | master_barang.kategori | text | filter | |
| Gudang/Depo/Unit | master_lokasi | text | filter | |
| Stok Fisik | ledger stok(t) (BR-002) | angka + satuan | sort | dasar reconcile |
| Reserved (QC/Dispensing) | Σ reserved (BR-007, BR-015) | angka (rincian per jenis) | filter | exclude dari Available |
| Stok Available | Stok Fisik − Reserved (BR-020) | angka + satuan | sort | acuan status ketersediaan |
| Stok Minimum | master_barang.stok_min | angka | – | acuan status |
| ROP | master_barang.rop | angka | – | acuan status |
| Status Ketersediaan | turunan BR-008 atas Available (ambang seragam lintas kategori) | badge warna (Cukup/Kurang/Minimum/Habis) | filter | |
| Batch / ED (Farmasi) | master_batch + ledger | list batch terurut FEFO; badge **Mendekati ED ≤ 60 hari (BR-021)**, Expired, Reserved for QC, Reserved for Dispensing | sort by ED | hanya Farmasi (BR-006) |
| HPP Satuan | ledger / metode nilai | Rupiah | – | per metode |
| Nilai Persediaan | Stok × HPP (per metode, BR-005) | Rupiah | sort | |

### 11.6 Layar TAMPIL — Kartu Stok / History Pergerakan (FR-008, FR-010, FR-016, FR-018, FR-019)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal & Jam | ledger.timestamp | dd-mm-yyyy HH:mm | sort kronologis (default asc) | |
| Jenis Pergerakan | ledger.jenis | badge (Masuk/Keluar/Adjustment) + sub-jenis (Penerimaan/Distribusi/Penyerahan Resep/Retur Obat Pasien/Retur Pembelian/Pemakaian/Opname/Pemusnahan) | filter | pisahkan Retur Pasien vs Retur Pembelian (BR-017) |
| No. Dokumen Ref | ledger.doc_no | link | – | tautan ke dokumen sumber (FR-010) |
| No. Resep / Pasien | ledger.resep_no, ledger.pasien_ref | text/link **hanya untuk role klinis berwenang**; **disembunyikan** untuk role non-klinis (kolom tidak tampil/ekspor) | filter (hanya role berwenang) | hanya pergerakan farmasi klinis; role non-klinis cukup lihat Jenis Pergerakan + No. Dokumen Ref (privasi RME — FR-013, BR-018, **BR-022**) |
| Qty Masuk | ledger.qty_in | angka | – | retur pasien lolos QC = MASUK (BR-016) |
| Qty Keluar | ledger.qty_out | angka | – | dispensing resep = KELUAR (BR-014) |
| Saldo Akhir (Running Balance) | akumulasi BR-002 | angka | – | per baris |
| Batch / ED | ledger.batch | text + badge Mendekati ED (≤60 hari) | – | Farmasi; retur masuk pakai batch/ED asli (BR-019, BR-021) |
| HPP per Pergerakan | ledger.hpp (per metode) | Rupiah | – | BR-011 |
| Nilai Persediaan setelah Pergerakan | saldo × HPP | Rupiah | – | |
| Audit Trail | link audit | ikon link | – | investigasi (BR-013) |

### 11.7 Layar TAMPIL — Hasil Telusur Batch (Recall) (FR-020)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal Serah | ledger.timestamp (jenis Penyerahan Resep) | dd-mm-yyyy HH:mm | sort | |
| No. Resep | ledger.resep_no | link | – | |
| Pasien (No. RM/Nama) | RME — **hanya role klinis berwenang**; disembunyikan untuk role non-klinis | text | filter (hanya role berwenang) | privasi RME (FR-013, **BR-022**); recall = fungsi klinis |
| Qty Diserahkan | ledger.qty_out | angka | – | |
| Qty Diretur | ledger.qty_in (Retur Obat Pasien batch sama) | angka | – | bila ada retur (BR-016) |
| Status | turunan | badge (Diserahkan / Sebagian Diretur / Diretur Penuh) | filter | dukung recall |

### 11.8 Layar TAMPIL/CONFIG — Parameter Ambang (Admin, FR-021)
| Field/Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| ed_threshold_days | config.global (Pengaturan Expired Date) | number (default 60) | – | ambang Mendekati ED; **berlaku seragam semua kategori**; hak ubah Admin RS (BR-021) |
| status_rule | config.global | teks aturan BR-008 (read-only) | – | ambang status ketersediaan seragam lintas kategori |
| metode_nilai_global | config.global (Pengaturan Inventory) | dropdown FIFO / Moving Average | – | satu metode global semua kategori; hak ubah Admin RS (BR-005) |

Parameter ambang ED disimpan & diubah di **Control Panel → Pengaturan Expired Date** (hak ubah Admin RS); metode nilai persediaan di **Control Panel → Pengaturan Inventory** (BR-005). Ambang ED alert **default 60 hari, seragam lintas kategori** (BR-021). [PERLU KONFIRMASI] nama teknis tabel ledger/master; format No. Resep & sumber identitas pasien (RME/CPOE) yang ditautkan ke ledger.

## 12. Non-Functional Requirements

- **NFR-001 (Performa — query terkini)**: p95 render Informasi Detail Stok (live) **< 2 detik**. *(Goals)*
- **NFR-002 (Performa — query historis)**: p95 Kartu Stok untuk **~1 juta record** pergerakan **< 5 detik**; pertimbangkan **snapshot/precompute periodik** & indeks (barang, lokasi, tanggal, **batch, no_resep**). [ASUMSI] precompute harian untuk cut-off bulan berjalan.
- **NFR-003 (Akurasi/Integritas)**: Hasil agregasi harus **deterministik & reconcile** (BR-003, BR-020). Selisih reconcile = 0; Stok Available = Stok Fisik − Reserved.
- **NFR-004 (Konsistensi data)**: Stok hanya berubah lewat ledger transaksional (termasuk dispensing & retur obat pasien dari Modul Farmasi); Informasi Stok tidak boleh punya state tersendiri (no write).
- **NFR-005 (Keamanan & otorisasi)**: Akses berbasis Role & Permission; data lintas unit hanya untuk role berwenang (Admin/Manajemen/Keuangan). **Data identitas pasien & No. Resep** pada Kartu Stok dilindungi sesuai kerahasiaan RME: untuk **role tanpa kewenangan klinis**, baris pergerakan hanya menampilkan **jenis pergerakan & nomor unik dokumen pergerakan (No. Dokumen Ref)**, sedangkan **No. Resep & identitas pasien disembunyikan** (tidak ditampilkan maupun diekspor) — bukan sekadar di-mask sebagian (BR-022).
- **NFR-006 (Auditability)**: Setiap nilai dapat ditelusuri ke pergerakan & Audit Trail; telusur **batch→resep→pasien** tersedia untuk recall (FR-020).
- **NFR-007 (Ketersediaan/Offline)** [ASUMSI — kendala RS Tipe C&D]: bila jaringan tidak stabil, sediakan mode read-only cache/last-synced dengan penanda waktu sinkron terakhir; export tetap berfungsi.
- **NFR-008 (Skalabilitas)**: Mendukung ribuan SKU & jutaan baris pergerakan (termasuk volume tinggi penyerahan resep harian) tanpa degradasi signifikan, pada profil beban RS Tipe C & D.
- **NFR-009 (Kompatibilitas Export)**: Export Excel (.xlsx) & PDF; format angka Rupiah & tanggal lokal Indonesia.
- **NFR-010 (Usability)**: Drill-down & filter intuitif; konsisten dengan kartu stok manual agar mudah diadopsi staf non-IT; pembedaan visual jelas antara Retur Obat Pasien (MASUK) vs Retur Pembelian (KELUAR). Aturan status ketersediaan & ambang ED yang **seragam lintas kategori** mengurangi beban kognitif & konfigurasi bagi staf RS Tipe C & D.
- **NFR-011 (Kepatuhan)**: Perhitungan Nilai Persediaan mengikuti **PSAK 14**; siap untuk audit SNARS/STARKES termasuk dukungan recall obat per batch.
- **NFR-012 (Konfigurabilitas terkendali)**: Parameter ambang (mendekati ED default 60 hari) bersifat *configurable* terpusat & **berlaku seragam ke semua kategori**; perubahan tercatat di Audit Trail. Tidak menyediakan ambang berbeda per kategori untuk versi ini (penyederhanaan operasional Tipe C & D).

## 13. Integrasi Eksternal

Informasi Stok bersifat **read-only & internal-agregasi**; integrasi utamanya **antar-modul internal**, bukan API eksternal.

**Integrasi internal (sumber & konsumen data):**
| Pihak | Arah | Data | Catatan |
|-------|------|------|---------|
| Modul Transaksional Inventory (H2/H3/H5/H6/H8/H9/H11) | **IN** | Ledger pergerakan stok (qty, batch, HPP, dokumen) | sumber utama perhitungan |
| **Modul Farmasi — Pelayanan/Order Resep (Dispensing)** | **IN** | Pergerakan **KELUAR** penyerahan resep + reservasi (*Reserved for Dispensing*) + No. Resep + pasien + batch/ED | dispensing FEFO (BR-014, BR-015); resep batal → lepas reservasi |
| **Modul Farmasi — Retur Obat Pasien** | **IN** | Pergerakan **MASUK bersyarat** hasil QC + batch/ED asli + ref resep/pasien; flag gagal QC → Pemusnahan | restock bersyarat (BR-016, BR-019); beda dari Retur Pembelian (BR-017) |
| **Modul EMR/RME (order obat / CPOE)** | **IN** | Identitas pasien & order yang memicu resep/retur | privasi RME (NFR-005); referensi telusur |
| Master Data (Unit, Instalasi, Supplier, Barang Farmasi/RT/Gizi) | **IN** | Atribut barang, stok min, ROP, kategori | referensi; status ketersediaan dihitung seragam lintas kategori |
| Master Batch & Expired Date (Farmasi) | **IN** | Batch, ED, nilai per batch | FEFO & FIFO per batch; sumber alert mendekati ED 60 hari |
| Control Panel/Admin (Parameter) | **IN** | Ambang mendekati ED (default 60 hari, **Pengaturan Expired Date**, hak ubah Admin RS) & metode nilai global (**Pengaturan Inventory**) | config terpusat (FR-021, BR-021, BR-005) |
| Modul Role & Permission | **IN** | Hak akses unit/gudang/depo & data pasien | otorisasi (BR-010, FR-013) |
| Modul Audit Trail | **IN/OUT** | Link entri aktivitas per pergerakan & perubahan parameter ambang | investigasi & recall (BR-013, BR-018, NFR-012) |
| Modul Keuangan | **OUT** | Total Nilai Persediaan (FIFO/Moving Average) | consumer untuk jurnal/laporan (PSAK 14) |
| Modul Pengadaan (H10) | **OUT** | Stok minimum, ROP, pola konsumsi, status Minimum/Habis, daftar batch mendekati ED | consumer untuk rencana pengadaan & tindak lanjut ED |

**Integrasi eksternal:**
- **Tidak ada integrasi eksternal langsung** (BPJS/SATUSEHAT/Disdukcapil) pada modul Informasi Stok. *(Catatan: resep pasien BPJS/penjaminan ditangani di Modul Farmasi/Penerimaan; data klaim/obat tidak mengubah logika stok di H4 selain memicu pergerakan dispensing/retur.)* [ASUMSI]
- Nilai Persediaan **cukup dikonsumsi Modul Keuangan internal**; **tidak ada pengiriman ke ERP/akuntansi eksternal** RS pada versi ini.
- [ASUMSI] SATUSEHAT terkait kode obat/barang & dispensing/pengembalian obat (FHIR MedicationDispense/MedicationReturn) ditangani di Modul Farmasi/RME, bukan di modul ini. [PERLU KONFIRMASI] apakah pelaporan dispensing ke SATUSEHAT relevan & di modul mana.

## Asumsi
- [KEPUTUSAN] Cakupan tipe RS difinalisasi ke RS Tipe C & D (sebelumnya lampiran menyebut 'Tipe B dan C'). Fungsionalitas inti tetap sama bila kelak diperluas.
- [KEPUTUSAN] Aturan status ketersediaan (Cukup/Kurang/Minimum/Habis, BR-008) dan ambang alert mendekati ED bersifat SERAGAM LINTAS KATEGORI untuk versi ini; nilai stok minimum & ROP tetap per barang dari Master Data.
- [KEPUTUSAN] Ambang alert mendekati ED default = 60 hari (BR-021), dikonfigurasi di Control Panel → Pengaturan Expired Date (hak ubah Admin RS), berlaku sama untuk semua kategori; perubahan tercatat di Audit Trail.
- [KEPUTUSAN] Metode nilai persediaan = satu metode global (FIFO atau Moving Average) untuk semua kategori, dikonfigurasi di Control Panel → Pengaturan Inventory oleh Admin RS (BR-005); tidak ada metode berbeda per kategori pada versi ini.
- [ASUMSI] As-Is & alur To-Be sebagian diturunkan dari pola BPMN inventory (penerimaan/distribusi/opname/pemakaian) & pelayanan farmasi karena modul ini belum punya BPMN sendiri.
- [ASUMSI] Target performa (<2s terkini, <5s historis ~1jt record) memerlukan indeks (termasuk batch & no_resep) dan kemungkinan precompute harian.
- [ASUMSI] Mode read-only cache/last-synced disediakan untuk antisipasi jaringan tidak stabil di RS Tipe C & D.
- [ASUMSI] Status ketersediaan dihitung atas Stok Available (Stok Fisik − Reserved).
- [KEPUTUSAN] Mekanisme reservasi stok diterapkan: order resep (E2) men-reserve stok (Reserved for Dispensing) → mengurangi Stok Available tanpa mengubah Stok Fisik; saat dikonfirmasi/diserahkan (F11/F13/F15 → F12/F14/F16) Stok Fisik benar-benar berkurang (KELUAR) dengan tautan batch+No.Resep+pasien. Resep batal → reservasi dilepas (BR-015).
- [KEPUTUSAN] Filter Kartu Stok mendukung multi-select pada Unit dan Jenis Pergerakan (FR-009).
- [KEPUTUSAN] Code fitur Modul Farmasi final dipetakan ke List Fitur: Order/Dispensing = E2 (Order Resep) + F11/F13/F15 (Konfirmasi Order Resep) + F12/F14/F16 (Penyerahan Obat); Retur Obat Pasien = F17 (Retur Obat) + F20 (Pengembalian Obat Ranap). BPMN: g-service-order-resep, g-support-pharmacy-rj/ri-igd/ibs, g-support-pharmacy-retur, g-support-pharmacy-return-ri.
- [ASUMSI] Retur Obat Pasien hanya menambah stok (MASUK) bila lolos QC dengan batch & ED asli; gagal QC → Pemusnahan (H9). Retur Obat Pasien berbeda arah dari Retur Pembelian (H8).
- [KEPUTUSAN] Privasi Kartu Stok (konfirmasi stakeholder): untuk role non-klinis, Kartu Stok & export-nya hanya menampilkan JENIS PERGERAKAN dan NOMOR UNIK DOKUMEN PERGERAKAN (No. Dokumen Ref). No. Resep & identitas pasien (No. RM/nama) disembunyikan sepenuhnya (tidak ditampilkan/diekspor), bukan sekadar di-mask. Hanya role dengan kewenangan klinis yang dapat melihat & mengekspor No. Resep + identitas pasien (BR-022, NFR-005, FR-012, FR-013).
- [KEPUTUSAN] Obat retur pasien dengan batch/ED asal tidak teridentifikasi dinilai memakai HPP terakhir barang tsb (BR-019).
- [KEPUTUSAN] Penyesuaian Nilai HPP sesuai metode persediaan (FIFO/Moving Average) termasuk Phase 1 dan berelasi erat dengan H4 Informasi Stok: fitur tsb menghitung/menyesuaikan HPP per metode global (BR-005, BR-011), sedangkan H4 read-only menampilkan HPP per pergerakan & Nilai Persediaan hasil penyesuaian (BR-001, §5.4). [PERLU KONFIRMASI] kode fitur final 'Penyesuaian Nilai HPP' pada List Fitur.
- [KEPUTUSAN] Nilai Persediaan cukup dikonsumsi Modul Keuangan internal; tidak ada pengiriman ke ERP/akuntansi eksternal pada versi ini.
- [ROADMAP] Ambang ED/status ketersediaan per kategori/jenis sediaan (vaksin, obat suhu-sensitif) dibutuhkan ke depan; direncanakan masuk fitur Pengaturan, di luar scope versi ini (BR-021).
- [ASUMSI] Tidak ada integrasi eksternal langsung (BPJS/SATUSEHAT/Disdukcapil) pada modul Informasi Stok; pelaporan dispensing/retur ke SATUSEHAT (bila ada) ditangani Modul Farmasi/RME.
- [ASUMSI] Nama teknis tabel ledger pergerakan & master mengikuti konvensi modul Inventory induk; perlu disesuaikan dengan skema final.

## Pertanyaan Terbuka
- Apakah perlu snapshot/precompute terjadwal untuk memenuhi SLA query historis pada infrastruktur RS Tipe C & D?
- Format & template export Excel/PDF baku untuk handover Keuangan dan audit SNARS/STARKES?
- Kriteria QC baku penerimaan Retur Obat Pasien (jenis sediaan yang boleh/tidak boleh diretur, mis. suhu-sensitif, obat racikan, narkotika/psikotropika)?
- Apakah obat retur pasien yang gagal QC perlu jalur penanganan khusus untuk narkotika/psikotropika (berita acara) selain Pemusnahan H9?