# PRD — Pengaturan Harga (A59)

> **Kode Fitur:** A59 · **Cluster:** Control Panel · **Menu:** Pengaturan · **Fitur:** Pengaturan Harga
> SIMRS RS Tipe C & D · Persona: System Analyst senior SIMRS

---

## 1. Metadata Dokumen

* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer, Tamtech International (Signature, Date)
* **PIC PRD**: Arif Aminudin
* **Related Documents**:
    * PRD Master Data Kategori Barang (A33) — sumber daftar **kategori** & **Kelompok Barang** (Farmasi/Gizi/Rumah Tangga) untuk penetapan harga level **group**
    * PRD Master Data Menu Makanan (A9) — sumber daftar **item Menu Makanan** (level Item) & **kategori menu** (7 nilai **enum internal A9**: Makanan Pokok, Lauk Hewani, Lauk Nabati, Sayur, Buah, Snack, Minuman) untuk penetapan harga level **group** kelompok **Menu Makanan**; **kategori Menu Makanan tidak bersumber A33**
    * PRD Master Data Barang Farmasi (A4), Barang Rumah Tangga (A5), Barang Gizi (A6) — sumber daftar **item barang** untuk penetapan harga level **item**
    * PRD Master Data Tipe Penjamin (A20) — **dimensi tarif** (Umum/BPJS/Asuransi) untuk **multi-tarif per penjamin** (Phase 1)
    * PRD Master Data Kelas (A58) — **dimensi tarif** (**Kelas induk** perawatan: I/II/III/VIP — **bukan Sub Kelas**) untuk **multi-tarif per kelas** (Phase 1)
    * **Tipe Pelayanan** (Rawat Jalan / Rawat Inap / IGD / Penunjang) — **konteks tarif** untuk **multi-tarif per tipe pelayanan** (Phase 1); **enum tetap sistem** (bukan master ber-CRUD)
    * PRD Master Data Staff (A2) — sumber **flag pasien-staf** untuk **Harga Staf**: saat pendaftaran, **NIK pasien dicocokkan ke Master Data Staff (A2)** (NIK wajib & unik 16 digit) — cocok dengan staf aktif → pasien = staf (harga staf hanya berlaku bila penjamin **Umum**)
    * PRD Pengaturan Farmasi (A42) — fitur serumpun di **Menu Pengaturan** (routing resep)
    * Modul **Inventori / Pengadaan (A42 & H-series: H1 Pemesanan, H2 Penerimaan)** — sumber nilai **HPP** (harga perolehan, mengikuti metode persediaan FIFO/Average)
    * Modul **Pelayanan Farmasi / Kasir / Billing** — **konsumen** harga jual efektif hasil pengaturan ini
    * PRD RBAC (A53) — kontrol hak akses set/ubah harga (pemegang hak = **Bagian Keuangan**)
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-06 | 1.0 - Draft | Draft awal Pengaturan Harga: penetapan harga jual barang (Farmasi/Rumah Tangga/Gizi) berbasis HPP dengan metode **Nominal (Rp)** & **Persentase (%)**, pada level **Kategori (group)** maupun **Item (detail)**. |
| 2026-07-06 | 1.1 - Draft | Finalisasi keputusan bisnis: **(1)** Metode **Nominal = harga jual final** (mengabaikan HPP); **(2)** Pembulatan **ke atas**; **(3)** Jual rugi = **warning non-blocking**; **(4)** Persentase **tanpa batas atas**; **(5)** **Multi-tarif per Tipe Penjamin (A20) masuk Phase 1**; **(6)** hak akses = **Bagian Keuangan**; **(7)** **HPP mengikuti konfigurasi metode persediaan (FIFO/Average)**, nilai dasar = HPP satuan. |
| 2026-07-06 | 1.2 - Draft | Menambah **dimensi Kelas (A58)** pada multi-tarif **Phase 1** — harga dapat dibedakan per **Tipe Penjamin × Kelas** (mis. BPJS Kelas III ≠ Umum VIP). Precedence resolver diperluas menjadi 8 tingkat, keunikan aturan aktif per **(target × penjamin × kelas)**, form/list/API menambah field Kelas. |
| 2026-07-06 | 1.3 - Draft | Penetapan harga per target diformulasikan sebagai **Matriks Harga: Tipe Penjamin (baris) × Kelas (kolom)** — tiap **sel** memuat aturan (metode + nilai) tersendiri. Baris "Semua Penjamin" & kolom "Semua Kelas" = default yang diwarisi sel kosong. Menghapus ambiguitas prioritas antar-dimensi (tak lagi "penjamin > kelas"); resolusi = **sel eksak → baris-default → kolom-default → default matriks**, matriks Item override matriks Kategori. UI Tambah/Ubah menjadi **editor matriks**. |
| 2026-07-08 | 1.4 - Draft | Menambah **dua konsep pada Matriks Harga Phase 1**: **(1) Tipe Pelayanan** (Rawat Jalan/Rawat Inap/IGD/Penunjang; null = Semua Pelayanan) sebagai **konteks matriks** — satu Matriks Penjamin × Kelas per tipe pelayanan (matriks pelayanan kosong mewarisi **Semua Pelayanan**); **(2) Harga Staf** — **segmen pembeli "Staf"** pada baris penjamin **Umum** yang **hanya berlaku bila Tipe Penjamin = Umum** (diabaikan total untuk BPJS/Asuransi; tanpa aturan Staf → jatuh ke harga Umum reguler). Resolver, keunikan aturan, form/list/API diperluas dengan `tipe_pelayanan` & `segmen_pembeli` (BR-014, BR-015). **Sumber dikonfirmasi**: Tipe Pelayanan = **enum tetap** (bukan master ber-CRUD); flag pasien-staf = **pencocokan NIK pasien ke Master Data Staff (A2)** saat pendaftaran (NIK unik & wajib). |
| 2026-07-08 | 1.5 - Draft | Menambah **default margin global 35% (Persentase)**: bila suatu barang tak memiliki aturan pada level **Item maupun Kategori** & konteksnya, sistem menerapkan markup **35%** atas HPP sebagai harga jual (BR-016), berlaku **seragam untuk semua kelompok barang**; baseline default matriks memakai **+35%** (menggantikan contoh 25%); konfigurabel oleh Bagian Keuangan. |
| 2026-07-08 | 1.6 - Draft | **Restrukturisasi domain harga**: **(1)** **Harga Staf dipisah** menjadi **section aturan tersendiri** (`staff_price_rules`) — bukan lagi sub-baris pada Matriks Penjamin×Kelas — karena segmentasi staf/non-staf adalah domain pengaturan berbeda (tetap khusus penjamin **Umum**, flag via **NIK ke A2**). **(2)** Menambah **Margin per Nilai HPP** (`hpp_margin_tiers`): aturan margin berbasis **bracket nilai HPP** (mis. HPP ≤ Rp1.000 → 15%, ≤ Rp2.000 → 12%). **(3)** **Urutan level harga (spesifik → umum)** ditetapkan: **Item > Kategori > Tier HPP > Default 35%**; Harga Staf = overlay terpisah untuk transaksi Umum. Field `segmen_pembeli` dihapus dari `item_price_rules` (BR-006/014/016/017/018). |
| 2026-07-08 | 1.7 - Draft | **Klarifikasi/penajaman**: **(1)** **Tier HPP berbasis HPP satuan item** — aturan bracket dievaluasi memakai HPP satuan barang, sehingga efektif berlaku di **level Item** (di antara Kategori & Default). **(2)** **Aturan Harga Staf kini berdimensi Tipe Pelayanan × Kelas** (Tipe Penjamin **tetap Umum saja**); `staff_price_rules` menambah `tipe_pelayanan` & `kelas_id`. **(3)** **Harga jual disimpan sebagai snapshot** (`harga_jual_terakhir`) & **dihitung ulang saat HPP berubah** — bracket Tier ikut **re-evaluasi** (mis. HPP Rp999 → 10%, setelah update Rp1.002 → 15%). Menutup 4 pertanyaan terbuka (snapshot; dimensi staf; cakupan tier; **urutan prioritas dimensi = pelayanan > penjamin > kelas**, terbesar→terkecil). |
| 2026-07-08 | 1.8 - Draft | **Konfirmasi 4 keputusan terakhir** (menutup seluruh pertanyaan terbuka): **(1)** Dimensi **Kelas = level Kelas induk saja** (I/II/III/VIP), **bukan Sub Kelas** — `kelas_id` merujuk kelas induk. **(2)** Item **"belum berharga"** di titik jual → **warning non-blocking** (tidak memblokir transaksi; petugas dapat lanjut/input manual). **(3)** **Tidak ada default kelipatan pembulatan** yang dipaksakan; **Tier HPP & Default margin tanpa kelipatan** (pembulatan ke atas ke rupiah); kelipatan opsional hanya pada aturan matriks. **(4)** **"Semua Penjamin" tidak wajib** dibuat lebih dulu sebagai baseline — celah tertutup inheritance → Tier/Default 35%. |
| 2026-07-09 | 1.9 - Draft | Menambah **kelompok barang keempat: Menu Makanan (A9)** pada cakupan Pengaturan Harga. **(1)** `kelompok_barang` menambah enum **`MENU_MAKANAN`**; item level-Item bersumber **Master Data Menu Makanan (A9)** (bukan A4/A5/A6). **(2)** **Kategori Menu Makanan** memakai **7 nilai enum internal A9** (Makanan Pokok, Lauk Hewani, Lauk Nabati, Sayur, Buah, Snack, Minuman) — **bukan** kategori A33; aturan level Kategori memakai enum ini. **(3)** Seluruh mekanisme harga (Matriks Penjamin×Kelas×Pelayanan, Tier HPP, Default 35%, Harga Staf, resolver) berlaku sama untuk Menu Makanan. **HPP Menu Makanan (dikonfirmasi)** = **agregasi biaya bahan komposisi resep** (Σ BDD×harga bahan Barang Gizi A6, mengikuti metode persediaan FIFO/Average) — bukan input manual; perubahan HPP bahan memicu recompute harga menu (Persentase/Tier). |
| 2026-07-09 | 2.0 - Draft | **Dua penajaman**: **(1) HPP Menu Makanan (A9) dikonfirmasi** = **agregasi biaya bahan komposisi** menu (Σ BDD×harga bahan Barang Gizi A6, mengikuti metode persediaan FIFO/Average) — **bukan** input manual; perubahan HPP bahan memicu recompute harga menu (Persentase/Tier). **(2) Margin per Nilai HPP (Tier) diubah scope-nya**: aturan **dibuat per (Kelompok Barang × Kategori)** — **tidak dapat dibuat per item**; bracket dipilih memakai HPP satuan tiap item dalam kategori. **Bila suatu kategori tidak memiliki aturan Tier → kembali ke Default Sistem 35%** (BR-016). `hpp_margin_tiers` menambah kolom `kelompok_barang` & `kategori_id`; non-overlap divalidasi per kategori (BR-018). |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  **Pengaturan Harga** (kode **A59**) adalah fitur pada **Menu Pengaturan** yang mengelola **penetapan harga jual** barang secara terpusat untuk empat kelompok barang: **Barang Farmasi (A4)**, **Barang Rumah Tangga (A5)**, **Barang Gizi (A6)**, dan **Menu Makanan (A9)**.

  Harga jual ditetapkan dengan **dua metode**:
    * **Persentase (%)** — markup dinyatakan sebagai persentase dari nilai **HPP**. `harga_jual = pembulatan_ke_atas( HPP × (1 + nilai/100) )`. Karena bergantung HPP, harga jual **dihitung ulang otomatis** saat HPP berubah (menjaga margin). Persentase **tidak dibatasi** (boleh > 100%).
    * **Nominal (Rp)** — nilai rupiah yang menjadi **harga jual final** barang. `harga_jual = pembulatan_ke_atas( nilai )`. **HPP diabaikan** — harga jual **tidak** berubah saat HPP berubah. (HPP tetap ditampilkan sebagai pembanding & memicu peringatan bila harga < HPP.)

  Harga ditentukan melalui **Matriks Harga** — **Tipe Penjamin (A20)** sebagai **baris** × **Kelas perawatan (A58)** sebagai **kolom** — yang dievaluasi dalam **konteks Tipe Pelayanan** (**Rawat Jalan / Rawat Inap / IGD / Penunjang**, atau **Semua Pelayanan** sebagai default): **tiap tipe pelayanan memiliki matriksnya sendiri**, dan matriks pelayanan yang kosong **mewarisi** matriks **Semua Pelayanan**. Setiap **sel** matriks (mis. **BPJS × Kelas III**) memuat aturan harga tersendiri (metode + nilai). Baris **"Semua Penjamin"** dan kolom **"Semua Kelas"** berperan sebagai **default** yang **diwarisi** oleh sel yang dikosongkan. Karena penetapan bersifat **eksplisit per sel** — bukan menggabungkan dua aturan terpisah — **tidak ada ambiguitas prioritas antar-dimensi**.

  Ilustrasi matriks Penjamin × Kelas (untuk satu target, pada konteks **satu Tipe Pelayanan**):

  | Penjamin \ Kelas | Semua Kelas | Kelas III | VIP |
  |---|---|---|---|
  | **Semua Penjamin** | +35% (default) | — | — |
  | **Umum** | — | — | +40% |
  | **BPJS** | +10% | Rp 12.000 | — |

  > Sel kosong mewarisi default: mis. **Umum × Kelas III** (kosong) → warisi **Umum × Semua Kelas** (kosong) → warisi **Semua Penjamin × Semua Kelas** = +35% (baseline default).

  **Urutan level penetapan harga** (dari paling umum/fallback ke paling spesifik/override; **yang lebih spesifik menang**):
    1. **Default Sistem** — margin global **35%** (Persentase atas HPP), berlaku bila tak ada aturan lain (BR-016).
    2. **Margin per Nilai HPP (Tier)** — aturan margin berbasis **bracket nilai HPP** yang **dibuat per (Kelompok Barang × Kategori)** — **tidak dapat dibuat per item**. Untuk tiap item dalam kategori tsb, bracket dipilih memakai **HPP satuan item** (mis. HPP ≤ Rp1.000 → 15%, ≤ Rp2.000 → 12%). Bila kategori barang **tidak memiliki** aturan Tier → **kembali ke Default Sistem 35%** (BR-018).
    3. **Level Kategori (group)** — aturan (Matriks Penjamin×Kelas per Tipe Pelayanan) untuk **seluruh item** dalam satu **kategori** (A33); override Tier HPP.
    4. **Level Item (detail)** — aturan (Matriks) spesifik untuk **satu item**; override Kategori.

  Resolusi harga = **Item → Kategori → Tier HPP → Default 35%**. Barang dengan HPP tersedia **selalu** berharga (min. margin sesuai Tier / Default). Baseline default matriks juga di-preset **+35%**.

  **Aturan Harga Staf — domain terpisah.** Segmentasi **staf / non-staf** dikelola pada **section pengaturan tersendiri** (bukan bagian dari Matriks Penjamin×Kelas) karena merupakan domain yang berbeda. Aturan Harga Staf **hanya berlaku pada transaksi berpenjamin Umum** (Tipe Penjamin **selalu Umum**) untuk pasien yang ditandai **staf** (via pencocokan **NIK ke Master Data Staff A2**), namun **tetap dapat dibedakan per Tipe Pelayanan × Kelas** (mis. staf Rawat Inap Kelas I ≠ staf Rawat Jalan). Bila ada aturan staf untuk item/kategori tsb → dipakai; bila tidak → pasien-staf mengikuti **harga Umum normal** (Item→Kategori→Tier→Default). Untuk **BPJS/Asuransi**, aturan staf **diabaikan total** (BR-014).

  Modul ini menjadi **sumber kebenaran tunggal** aturan harga jual yang dikonsumsi runtime oleh **Pelayanan Farmasi, Kasir, dan Billing** (dengan konteks **Tipe Pelayanan, Tipe Penjamin (termasuk flag staf), dan Kelas** transaksi). Modul ini **bukan** master barang (A4/A5/A6/A9) dan **bukan** modul stok/HPP (HPP berasal dari Inventori/Pengadaan) — A59 hanya **memetakan aturan pembentuk harga jual**.

  > `[ASUMSI]` **HPP** = harga perolehan satuan barang yang dihitung modul Inventori/Pengadaan **sesuai konfigurasi metode persediaan** (FIFO atau Average). Nilai dasar yang dibaca A59 = **HPP satuan terkini** dari modul persediaan (untuk FIFO = HPP satuan lapisan berjalan; untuk Average = HPP rata-rata tertimbang).

* **Business Process (As-Is vs To-Be)**:

    * **As-Is** (kondisi saat ini) `[ASUMSI]`:
        1. Harga jual tiap barang ditetapkan manual (spreadsheet) atau diketik langsung per item di modul penjualan/billing.
        2. Tidak ada aturan markup terstandar → margin tidak konsisten antar barang/kategori; rawan salah ketik & jual rugi (harga < HPP).
        3. Perbedaan harga Umum vs BPJS vs Asuransi dikelola manual/terpisah → rawan tidak sinkron.
        4. Saat HPP naik (harga beli baru), harga jual berbasis markup tidak otomatis menyesuaikan → margin tergerus tanpa terdeteksi.
        5. Pengaturan harga massal (mis. seluruh kategori "BMHP" naik 5%) harus diubah satu per satu.
        6. Perbedaan harga per **tipe pelayanan** (Rawat Jalan/Rawat Inap/IGD/Penunjang) & **harga khusus staf** (pegawai bayar sendiri) dikelola manual/kesepakatan lisan → tidak terstandar & rawan bocor (harga staf ikut terpakai pada transaksi BPJS/Asuransi).

    * **To-Be** (workflow digital baru):
        1. **Bagian Keuangan** membuka **Pengaturan > Pengaturan Harga** — memuat **3 section**: **Matriks Harga**, **Margin per Nilai HPP**, & **Aturan Harga Staf**.
        2. Sistem menampilkan daftar aturan (Matriks) harga, dapat difilter per **Kelompok Barang** (Farmasi/Gizi/Rumah Tangga/Menu Makanan), **tingkat** (Kategori/Item), **Tipe Pelayanan**, **Tipe Penjamin**, dan **Kelas**.
        3. Petugas menetapkan aturan **level Kategori**: pilih kategori (A33) → **Tipe Pelayanan** (Rawat Jalan/Rawat Inap/IGD/Penunjang atau **Semua Pelayanan**) → pada matriks pilih **Tipe Penjamin** & **Kelas** (masing-masing bisa "Semua") → **metode** (Nominal/Persentase) → **nilai** → sistem menampilkan **preview harga jual** sampel item.
        4. Bila perlu, ditetapkan aturan **level Item** sebagai **override** kategori.
        5. Pada section **Margin per Nilai HPP**, petugas memilih **Kelompok Barang → Kategori**, lalu menyusun **bracket HPP → margin %** (mis. HPP ≤ Rp1.000 = 15%, ≤ Rp2.000 = 12%) untuk kategori tsb (**tidak per item**) sebagai fallback di atas Default 35%; kategori tanpa aturan Tier jatuh ke Default 35% (BR-018).
        6. Pada section **Aturan Harga Staf** (domain terpisah), petugas menetapkan harga khusus **staf** per kategori/item — berlaku **hanya** untuk transaksi **Umum** (pasien-staf via NIK↔A2) (BR-014).
        7. Sistem menghitung `harga_jual` mengikuti urutan level **Item → Kategori → Tier HPP → Default 35%** (dengan overlay **Staf** bila transaksi Umum & pasien staf), **dibulatkan ke atas**, dan mem-publish ke modul konsumen (Pelayanan Farmasi/Kasir/Billing) sesuai konteks **tipe pelayanan, penjamin (+flag staf), dan kelas** transaksi.
        8. Untuk metode **Persentase** (termasuk Tier HPP & Default), saat HPP berubah harga jual **dihitung ulang otomatis** — menjaga margin. Metode **Nominal** tetap.
        9. Bila `harga_jual < HPP`, sistem memberi **peringatan (non-blocking)** — tetap boleh disimpan/dijual.
        10. Perubahan harga terekam (audit) tanpa hapus permanen (soft nonaktif).

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Standarisasi harga | 100% barang aktif (Farmasi/RT/Gizi/Menu Makanan) berharga — via aturan Item/Kategori atau default margin 35% — untuk minimal penjamin "Umum/Semua" |
| 2 | Efisiensi pengaturan massal | Menetapkan harga 1 kategori (mencakup N item) selesai < 1 menit tanpa mengubah item satu per satu |
| 3 | Multi-tarif konsisten | Harga per Tipe Penjamin (Umum/BPJS/Asuransi) terkelola dari satu tempat; 0 perbedaan harga yang dikelola manual di luar A59 |
| 4 | Deteksi jual rugi | 100% kasus `harga_jual < HPP` memunculkan peringatan ke petugas saat penetapan |
| 5 | Konsistensi lintas modul | 100% harga di Pelayanan Farmasi/Kasir/Billing bersumber dari resolver A59 (bukan input manual di titik jual) |
| 6 | Margin terjaga saat HPP berubah | Harga jual metode Persentase ter-refresh mengikuti HPP terkini (selisih margin aktual vs target = 0%) |
| 7 | Auditability | 100% perubahan aturan harga tercatat (siapa, kapan, dari→ke) |
| 8 | Harga per tipe pelayanan | Harga dapat dibedakan per Rawat Jalan/Rawat Inap/IGD/Penunjang dari satu tempat; 0 pengelolaan manual di luar A59 |
| 9 | Harga staf terkendali | Harga staf **hanya** berlaku pada transaksi berpenjamin Umum; 100% transaksi BPJS/Asuransi mengabaikan harga staf (0 kebocoran) |
| 10 | Default margin | **Default margin 35%** (seragam semua kelompok barang) menjamin 0 barang ber-HPP tanpa harga |
| 11 | Margin adaptif per HPP | Margin dapat berjenjang mengikuti **nilai HPP (tier)** per **Kelompok Barang × Kategori** — barang HPP rendah → margin lebih tinggi, HPP tinggi → margin lebih rendah — cukup diatur di level kategori, tanpa mengatur per item |
| 12 | Harga staf domain terpisah | Aturan harga staf dikelola di **section tersendiri**; 100% hanya berlaku pada transaksi Umum-staf (0 kebocoran ke BPJS/Asuransi) |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD + Kalkulasi + Multi-tarif) | Phase 2 (Approval / Jadwal) | Phase 3 (Accounting: Mapping COA) |
|-------------|-----------------------------------------------|-----------------------------|-----------------------------------|
| Aturan Harga per Kategori (group) | Set metode (Nominal/Persentase) + nilai per kategori (A33) × Tipe Penjamin × Kelas | Approval berjenjang perubahan harga (`approval_status`/`approver_role`) | Pemetaan `coa_pendapatan`/`coa_persediaan` per kategori |
| Aturan Harga per Item (detail/override) | Set metode + nilai per item × Tipe Penjamin × Kelas; override aturan kategori | Approval perubahan harga item | Mapping COA per item bila beda dari kategori |
| **Matriks Harga (Tipe Penjamin × Kelas)** | **Harga per target ditetapkan lewat matriks: baris Tipe Penjamin (A20) × kolom Kelas (A58); tiap sel = aturan tersendiri; baris/kolom "Semua" = default yang diwarisi** | — | — |
| **Dimensi Tipe Pelayanan** | **Konteks matriks per Rawat Jalan/Rawat Inap/IGD/Penunjang (`tipe_pelayanan`=null → Semua Pelayanan = default warisan); satu Matriks Penjamin × Kelas per tipe pelayanan** | — | — |
| **Aturan Harga Staf (section terpisah)** | **Section pengaturan tersendiri (domain berbeda): harga khusus staf per kategori/item, **berdimensi Tipe Pelayanan × Kelas** (Tipe Penjamin selalu Umum); hanya berlaku transaksi Umum-staf (pasien via NIK↔A2); diabaikan total untuk BPJS/Asuransi (BR-014)** | Approval perubahan harga staf | — |
| **Margin per Nilai HPP (Tier)** | **Aturan margin berbasis bracket nilai HPP, dibuat per **Kelompok Barang × Kategori** (bukan per item); bracket dipilih via HPP satuan item; kategori tanpa aturan Tier → Default 35% (BR-018)** | — | — |
| **Default Margin Global 35%** | **Bila tak ada aturan Item/Kategori/Tier HPP (utk konteks transaksi) → markup default 35% (Persentase) atas HPP (BR-016); berlaku semua kelompok; konfigurabel** | — | — |
| Kalkulasi & Preview Harga Jual | Persentase = `↑(HPP × (1+%))`; Nominal = `↑(nilai)`; pembulatan **ke atas**; preview sebelum simpan | — | — |
| Sinkronisasi HPP → Harga | Recompute otomatis **hanya metode Persentase** saat HPP berubah; Nominal tetap | — | — |
| Peringatan Jual Rugi | Warning **non-blocking** bila `harga_jual < HPP` | — | — |
| Status Aktif/Nonaktif | Toggle aktif/nonaktif aturan (soft delete); histori utuh | — | — |
| Pencarian & Filter | Filter kelompok barang, tingkat, Tipe Pelayanan, Tipe Penjamin, Kelas, metode, status; search | — | — |
| Konsumsi oleh modul jual | Resolver harga efektif (Item→Kategori→Tier HPP→Default 35% × pelayanan/penjamin/kelas; overlay Staf bila Umum+staf) untuk Pelayanan Farmasi/Kasir/Billing | — | Nilai jual & HPP diteruskan ke jurnal |
| Harga berjadwal (effective date) | — | Aturan harga berlaku mulai tanggal tertentu | — |

> **Catatan Phasing:** Phase 1 mencakup CRUD aturan + kalkulasi + **multi-tarif per Tipe Penjamin**. Skema data menyediakan kolom `approval_status`/`approver_role` (Phase 2) dan `coa_pendapatan_id`/`coa_persediaan_id` (Phase 3) sejak awal agar tidak perlu migrasi (lihat §8.1). **Pengaturan Harga berdampak keuangan** (membentuk pendapatan penjualan barang & beban pokok) sehingga **Phase 3 Mapping COA relevan** (tidak N/A).

**Out of Scope**:

| No | Scope |
|----|-------|
| 1 | **Definisi/CRUD barang & menu** (nama, satuan, kode, atribut klinis, komposisi menu) — dikelola A4/A5/A6/A9. |
| 2 | **Perhitungan HPP / stok / batch / harga beli & konfigurasi metode persediaan (FIFO/Average)** — dikelola Inventori & Pengadaan. A59 hanya **membaca** HPP satuan. |
| 3 | **CRUD kategori barang, kelompok barang, kategori/menu makanan, Tipe Penjamin & Kelas** — dikelola A33/A20/A58/**A9** (kategori Menu Makanan = enum A9). A59 hanya **merujuk** (lookup). |
| 4 | **Diskon transaksional / promo / potongan per resep** di titik jual — domain Kasir/Billing. |
| 5 | **Tarif tindakan/pelayanan/kamar** (bukan barang) — dikelola master tarif masing-masing (mis. A43 Tarif Kamar). |
| 6 | **Harga berjadwal (effective date)** & **approval berjenjang** — Phase 2. |
| 7 | **CRUD master/daftar Tipe Pelayanan** & **penentuan flag pasien-staf** (data kepegawaian/pendaftaran) — A59 hanya **merujuk** nilainya sebagai dimensi/konteks harga. |
| 8 | **Verifikasi kepesertaan/eligibilitas staf** (siapa berhak harga staf) — domain Kepegawaian/Pendaftaran; A59 hanya menerima flag staf pada konteks transaksi. |

## 5. Related Features

| Code | Menu | Deskripsi Relasi (Teknis / Bisnis) |
|------|------|-------------------------------------|
| **A59** | Pengaturan > Pengaturan Harga | **Modul ini** |
| A33 | Master Data > Kategori Barang | **Lookup wajib** — sumber `kategori_id` & `kelompok_barang` (Farmasi/Gizi/Rumah Tangga) untuk aturan level Kategori (**kelompok Menu Makanan memakai enum kategori A9, bukan A33**). |
| A4 | Master Data > Barang Farmasi | Sumber `item_id` (Kelompok Farmasi) untuk aturan level Item; konsumen harga saat peresepan/penjualan. |
| A5 | Master Data > Barang Rumah Tangga | Sumber `item_id` (Kelompok Rumah Tangga) untuk aturan level Item. |
| A6 | Master Data > Barang Gizi | Sumber `item_id` (Kelompok Gizi) untuk aturan level Item. |
| **A9** | Master Data > Menu Makanan | **Lookup (kelompok Menu Makanan)** — sumber `item_id` menu (level Item) & **kategori menu** (7 nilai **enum internal A9**: Makanan Pokok, Lauk Hewani, Lauk Nabati, Sayur, Buah, Snack, Minuman) untuk aturan level Kategori. **Kategori Menu Makanan berasal dari enum A9, bukan A33.** |
| **A20** | Master Data > Tipe Penjamin | **Lookup wajib (Phase 1)** — dimensi `tipe_penjamin_id` (Umum/BPJS/Asuransi) untuk multi-tarif; nilai khusus "Semua Penjamin" (null) = default. |
| **A58** | Master Data > Kelas | **Lookup wajib (Phase 1)** — dimensi `kelas_id` (**Kelas induk saja**: I/II/III/VIP, **bukan Sub Kelas**) untuk multi-tarif; nilai khusus "Semua Kelas" (null) = default. |
| (enum) | Enum Tipe Pelayanan | **Konteks tarif (Phase 1)** — **enum tetap sistem** (bukan master ber-CRUD): `tipe_pelayanan` (Rawat Jalan/Rawat Inap/IGD/Penunjang); nilai khusus "Semua Pelayanan" (null) = default. |
| **A2** | Master Data > Staff | **Sumber flag pasien = staf** untuk **Harga Staf** (BR-014): saat pendaftaran, **NIK pasien dicocokkan ke Master Data Staff (A2)** (NIK unik & wajib 16 digit) — cocok dengan staf aktif = pasien staf. |
| A42 | Pengaturan > Pengaturan Farmasi | Fitur serumpun di Menu Pengaturan; **dan** domain HPP (Inventori & Gudang Farmasi). |
| H1/H2 | Inventory > Pemesanan / Penerimaan Barang | **Sumber HPP** (harga perolehan satuan sesuai metode persediaan FIFO/Average). |
| A53 | Admin > RBAC | Hak set/ubah/nonaktifkan aturan harga = **Bagian Keuangan**. |
| Keuangan (COA) | Backoffice > Keuangan | Konsumen Phase 3 — pemetaan akun pendapatan penjualan & beban pokok. |

## 6. Business Process & User Stories

### 6.1 State Machine — Status Aturan Harga (`is_active`)

| Status | Deskripsi | Efek pada Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------------|--------------------|--------------------|
| **Aktif** | Aturan harga berlaku sebagai pembentuk harga jual | Dipakai resolver harga di Pelayanan Farmasi/Kasir/Billing (per penjamin); **tampil di daftar** | Create → Aktif (default); Aktif → Nonaktif (toggle) | Draft → Menunggu Approval → Aktif (setelah disetujui) |
| **Nonaktif** | Aturan tidak berlaku | **Tidak** dipakai resolver (item jatuh ke aturan kategori/penjamin default/atau belum berharga); **tetap tampil** (soft delete, histori utuh) | Nonaktif → Aktif (toggle) | Sama (dengan approval bila diaktifkan) |
| **(Phase 2) Menunggu Approval** | Perubahan harga diajukan, menunggu persetujuan | Belum dipakai (harga lama masih berlaku) | — | Ajukan → Setujui (Aktif) / Tolak (kembali Draft) |

> Aturan harga tidak memiliki stok; kolom "Efek Stok" pada template diadaptasi menjadi **Efek pada Modul Konsumen**. **Tidak ada hard-delete** — aturan hanya dinonaktifkan (soft delete via `is_active`) agar histori & audit harga tetap utuh (**BR-008**).

### 6.2 User Stories Utama

Prioritas: **P0** Critical/MVP · **P1** Must Have · **P2** Should Have · **P3** Low · **P4** Enhancement.

* **US-001** — Sebagai **Bagian Keuangan**, saya ingin menetapkan harga jual **satu kategori barang** sekaligus (metode Nominal/Persentase), agar seluruh item dalam kategori berharga konsisten tanpa mengatur satu per satu. *(P0)*
* **US-002** — Sebagai **Bagian Keuangan**, saya ingin menetapkan harga jual **item barang tertentu** sebagai override, agar barang khusus bisa berbeda dari aturan kategorinya. *(P0)*
* **US-003** — Sebagai **Bagian Keuangan**, saya ingin memilih **metode Persentase (%)** (markup dari HPP) atau **Nominal (Rp)** (harga final), agar penetapan harga fleksibel. *(P0)*
* **US-004** — Sebagai **Bagian Keuangan**, saya ingin menetapkan **harga berbeda per Tipe Penjamin** (Umum/BPJS/Asuransi) **dan/atau Kelas** (I/II/III/VIP), atau satu harga untuk "Semua" pada dimensi tsb, agar tarif per jalur pembayaran & kelas perawatan terkelola terpusat. *(P0)*
* **US-005** — Sebagai **Bagian Keuangan**, saya ingin melihat **preview harga jual** (hasil kalkulasi + pembulatan ke atas) sebelum menyimpan. *(P0)*
* **US-006** — Sebagai **Bagian Keuangan**, saya ingin **diperingatkan bila harga jual < HPP** (jual rugi) namun tetap dapat menyimpan, agar keputusan tetap di tangan saya. *(P1)*
* **US-007** — Sebagai **Bagian Keuangan**, saya ingin **mengubah / menonaktifkan** aturan harga tanpa menghapus permanen. *(P0)*
* **US-008** — Sebagai **Manajemen/Keuangan**, saya ingin harga jual **metode Persentase menyesuaikan otomatis saat HPP berubah**, agar margin tetap terjaga. *(P1)*
* **US-009** — Sebagai **Kasir/Apoteker (konsumen)**, saya ingin harga jual barang **terisi otomatis** sesuai **Tipe Pelayanan, Tipe Penjamin (termasuk flag staf), & Kelas** transaksi, agar konsisten & tidak mengetik manual. *(P1)*
* **US-010** — Sebagai **Bagian Keuangan**, saya ingin menetapkan **harga berbeda per Tipe Pelayanan** (Rawat Jalan/Rawat Inap/IGD/Penunjang) atau satu harga untuk "Semua Pelayanan", agar tarif obat sesuai konteks layanan (mis. IGD ≠ Rawat Jalan). *(P1)*
* **US-011** — Sebagai **Bagian Keuangan**, saya ingin menetapkan **Harga Staf** khusus pegawai RS pada **section pengaturan tersendiri** yang **hanya berlaku saat penjamin Umum**, agar benefit harga staf terkelola terpisah tanpa mencampuri Matriks Penjamin×Kelas maupun tarif BPJS/Asuransi. *(P1)*
* **US-012** — Sebagai **Manajemen/Keuangan**, saya ingin ada **default margin 35%** yang otomatis berlaku (seragam untuk semua kelompok barang) bila belum ada aturan, agar tidak ada barang ber-HPP yang "belum berharga" & margin minimum terjaga. *(P1)*
* **US-013** — Sebagai **Bagian Keuangan**, saya ingin menetapkan **margin berjenjang berdasarkan nilai HPP** **per Kelompok Barang & Kategori** (mis. HPP ≤ Rp1.000 → 15%, ≤ Rp2.000 → 12%) — **tanpa** mengatur tiap item, agar margin otomatis menyesuaikan besaran HPP di level kategori. *(P1)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Dashboard / Daftar Aturan Harga**
* **User Story**: Sebagai Bagian Keuangan, saya ingin melihat daftar aturan harga (kategori & item) beserta Tipe Penjamin, metode, nilai, HPP acuan, harga jual hasil kalkulasi, dan status. *(US-001, US-007)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Halaman menampilkan daftar aturan (Matriks) dengan kolom **Kelompok Barang**, **Tingkat** (Kategori/Item), **Target** (nama kategori/item), **Tipe Pelayanan** (atau "Semua"), **Tipe Penjamin** (atau "Semua"), **Kelas** (atau "Semua"), **Metode**, **Nilai**, **HPP Acuan**, **Harga Jual (kalkulasi)**, dan **Aksi**. (Aturan **Harga Staf** & **Margin per HPP** berada di section/tab tersendiri.)
    * **AC 2**: Tersedia **filter**: Kelompok Barang, Tingkat, **Tipe Pelayanan**, **Tipe Penjamin**, **Kelas**, Metode, Status; **pencarian** by nama kategori/item; **sorting** & **pagination**.
    * **AC 3**: Kolom **Aksi** memuat **toggle Aktif/Nonaktif** dan **Edit** per baris.
    * **AC 4**: Daftar menampilkan entri **aktif maupun nonaktif** (nonaktif ditandai badge/warna berbeda).
    * **AC 5**: Aturan level Item yang **meng-override** aturan kategori ditandai indikator "Override"; aturan penjamin spesifik yang meng-override "Semua Penjamin" ditandai pula.

---

**Fitur: Set Harga per Kategori (Group) — Editor Matriks**
* **User Story**: Sebagai Bagian Keuangan, saya ingin menetapkan harga satu kategori barang lewat matriks Penjamin × Kelas, agar semua item kategori itu berharga konsisten per jalur & kelas. *(US-001, US-003, US-004)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memilih **Kelompok Barang** → **Kategori** (dropdown A33, kategori aktif sesuai kelompok) → **Tipe Pelayanan** (selektor konteks: Rawat Jalan/Rawat Inap/IGD/Penunjang/**Semua Pelayanan**) → **Metode** (Persentase/Nominal, berlaku untuk matriks) & **Pembulatan**.
    * **AC 2**: Sistem menampilkan **Matriks Harga** untuk **Tipe Pelayanan terpilih**: **baris = Tipe Penjamin** (A20, termasuk "Semua Penjamin") × **kolom = Kelas** (A58, termasuk "Semua Kelas"). Tiap **sel** dapat diisi **nilai** (kosong = warisi default). Mengganti selektor Tipe Pelayanan menampilkan matriks pelayanan tsb (sel kosong mewarisi matriks **Semua Pelayanan**). *(Segmentasi staf diatur di section **Aturan Harga Staf** terpisah.)*
    * **AC 3**: **Nilai** per sel: Persentase **tanpa batas atas** (boleh > 100%); Nominal = harga final (Rp).
    * **AC 4**: Tiap sel menampilkan **harga jual** hasil kalkulasi: Persentase = `↑(HPP × (1+nilai/100))`; Nominal = `↑(nilai)`; pembulatan **ke atas** (BR-002/003/009). Sel kosong menampilkan **nilai warisan** (BR-001) secara samar.
    * **AC 5**: Menyimpan matriks meng-**upsert satu aturan aktif per sel terisi** untuk kombinasi (kategori, penjamin, kelas); sel yang dikosongkan menghapus aturannya. Tidak ada duplikasi sel (BR-006).
    * **AC 6**: Aturan tersimpan **AKTIF**; berlaku ke item kategori kecuali di-override matriks Item (BR-001).
    * **AC 7**: Bila `harga_jual < HPP` pada sel/sampel item, sistem menampilkan **peringatan jual rugi (non-blocking)** — tetap dapat disimpan (BR-005).
* **Validasi — Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kelompok Barang | Dropdown | Required; Farmasi/Gizi/Rumah Tangga/Menu Makanan | "Kelompok Barang wajib dipilih." | "Menentukan daftar kategori/item yang tampil" |
  | Kategori | Dropdown (A33) | Required; kategori aktif sesuai kelompok | "Kategori wajib dipilih." | "Hanya kategori aktif pada kelompok terpilih" |
  | Tipe Pelayanan | Selektor/Tab | Required (boleh "Semua Pelayanan"); Rawat Jalan/Rawat Inap/IGD/Penunjang | "Pilih tipe pelayanan atau Semua Pelayanan." | "Konteks matriks; Semua Pelayanan = default yang diwarisi" |
  | Metode | Radio | Required; NOMINAL / PERSENTASE (berlaku matriks) | "Pilih metode penetapan harga." | "Persentase = markup % dari HPP; Nominal = harga jual final (Rp)" |
  | Sel Matriks (nilai) | Number per sel | ≥ 0; tanpa batas atas; kosong = warisi default; **≥ 1 sel wajib terisi** | "Isi minimal satu sel (mis. Semua Penjamin × Semua Kelas)." / "Nilai tidak boleh negatif." | "Persentase dalam %, Nominal = Rupiah; sel kosong mewarisi baris/kolom default" |
  | Baris/Kolom "Semua" | Header matriks | Baris "Semua Penjamin" & kolom "Semua Kelas" = default/fallback; **tidak wajib diisi lebih dulu** | — | "Boleh langsung isi sel spesifik; celah tertutup Tier/Default 35%" |

---

**Fitur: Set Harga per Item (Detail / Override) — Editor Matriks**
* **User Story**: Sebagai Bagian Keuangan, saya ingin menetapkan matriks harga item tertentu sebagai override, agar barang khusus berbeda dari matriks kategorinya. *(US-002, US-003, US-004)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memilih **Kelompok Barang** → **Item Barang** (dropdown/pencarian A4/A5/A6/A9, item aktif) → **Tipe Pelayanan** (selektor konteks, termasuk Semua Pelayanan) → **Metode** & **Pembulatan**, lalu tampil **Matriks Harga** (Penjamin × Kelas) untuk item pada pelayanan tsb.
    * **AC 2**: Menampilkan **HPP satuan terkini** item; tiap sel matriks menghitung harga dari HPP tsb (Persentase) atau harga final (Nominal), dibulatkan ke atas.
    * **AC 3**: Sel matriks **Item** yang terisi **meng-override** matriks **Kategori** (lalu Tier HPP → Default) untuk item tersebut pada kombinasi (tipe pelayanan, penjamin, kelas) — BR-001.
    * **AC 4**: Menyimpan meng-upsert satu aturan aktif per sel terisi; sel kosong menghapus aturan sel itu (BR-006).
    * **AC 5**: Peringatan jual rugi **non-blocking** bila `harga_jual < HPP` pada sel mana pun (BR-005).

---

**Fitur: Preview & Kalkulasi Harga Jual**
* **User Story**: Sebagai Bagian Keuangan, saya ingin melihat harga jual hasil kalkulasi sebelum menyimpan. *(US-005, US-006)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Metode **Persentase**: `harga_jual = pembulatan_ke_atas( HPP × (1 + nilai/100) )` (BR-002).
    * **AC 2**: Metode **Nominal**: `harga_jual = pembulatan_ke_atas( nilai )` — nilai = harga jual final, **HPP tidak dipakai** dalam rumus (BR-003).
    * **AC 3**: **Pembulatan selalu ke atas**; kelipatan **opsional** (default TANPA → ke rupiah terdekat) hanya pada aturan matriks; Tier HPP & Default margin **tanpa kelipatan** — BR-009.
    * **AC 4**: Preview menampilkan **HPP acuan**, **margin (Rp & %)** hasil (harga_jual − HPP), dan **harga jual akhir**; untuk level kategori tampilkan agregat (jumlah item, contoh 3–5 item).
    * **AC 5**: Bila **HPP item = 0 / belum tersedia**: untuk **Persentase** item ditandai "HPP belum tersedia" (tak menghasilkan harga); untuk **Nominal** harga tetap terbentuk (tak bergantung HPP) namun peringatan margin ditiadakan (BR-004).

---

**Fitur: Kelola Status (Toggle) & Ubah Aturan Harga**
* **User Story**: Sebagai Bagian Keuangan, saya ingin mengubah atau menonaktifkan aturan harga tanpa hapus permanen. *(US-007)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Edit menampilkan form terisi (Tipe Penjamin, metode, nilai) dengan preview kalkulasi ulang.
    * **AC 2**: Toggle **Aktif/Nonaktif** memperbarui `is_active` tanpa menghapus data (soft delete) — BR-008.
    * **AC 3**: Menonaktifkan aturan **Kategori** → item yang mengikuti kategori itu (untuk penjamin tsb) jatuh ke aturan yang lebih umum (penjamin "Semua") atau menjadi "belum berharga" — resolver mengikuti BR-001.
    * **AC 4**: Menonaktifkan aturan **Item** (override) → item kembali mengikuti aturan **Kategori** yang berlaku (bila ada) — BR-001.
    * **AC 5**: **Tidak ada** aksi hapus permanen di UI.
    * **AC 6**: Setiap perubahan tercatat pada **log audit** (nilai lama → baru, aktor, waktu) — BR-012.

---

**Fitur: Margin per Nilai HPP (Tier Bracket)**
* **User Story**: Sebagai Bagian Keuangan, saya ingin menyusun margin berjenjang berdasarkan nilai HPP **per Kelompok Barang & Kategori** (bukan per item). *(US-013, US-003)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Section/tab terpisah. Petugas **memilih Kelompok Barang → Kategori** lebih dulu (**tidak ada pilihan Item**), lalu menyusun **tabel bracket** untuk kategori tsb: kolom **HPP Dari**, **HPP Sampai** (kosong = tak terbatas), **Margin (%)**, **Urutan**, **Status**, **Aksi**. Petugas dapat tambah/ubah/urutkan/nonaktifkan bracket. Tiap (Kelompok × Kategori) memiliki tabel bracket sendiri.
    * **AC 2**: Dalam satu **(Kelompok × Kategori)**, bracket **tidak boleh tumpang-tindih**; sistem memvalidasi rentang berurutan (mis. 0–1.000, 1.001–2.000, 2.001–∞).
    * **AC 3**: Untuk barang tanpa aturan Item/Kategori, sistem mengambil **tabel Tier milik (Kelompok × Kategori) barang** lalu memilih bracket yang memuat **HPP satuan item** → `harga_jual = ↑(HPP × (1 + margin/100))` (BR-018). Bracket dipilih memakai HPP satuan **tiap item** (aturan tetap di level kategori, bukan per item).
    * **AC 4**: Bila **kategori barang tidak memiliki aturan Tier** (tak diatur), atau tak ada bracket cocok → **kembali ke Default Sistem 35%** (BR-016).
    * **AC 5**: Preview menampilkan contoh beberapa **HPP satuan** sampel → margin & harga jual hasil bracket.
    * **AC 6**: Karena berbasis HPP satuan, saat **HPP item berubah** (mis. rekalkulasi Average) item dapat **pindah bracket** — mis. HPP Rp999 → 15%, setelah update Rp1.002 → 12% — dan harga jual (snapshot) **dihitung ulang** otomatis (BR-004/018).
---

**Fitur: Aturan Harga Staf (Section Terpisah)**
* **User Story**: Sebagai Bagian Keuangan, saya ingin menetapkan harga khusus staf pada section tersendiri yang hanya berlaku untuk transaksi Umum. *(US-011)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Section **terpisah** dari Matriks Harga (domain berbeda). Daftar aturan staf menampilkan **Tingkat** (Kategori/Item), **Target**, **Tipe Pelayanan**, **Kelas**, **Metode**, **Nilai**, **HPP Acuan**, **Harga Staf (kalkulasi)**, **Status**, **Aksi**.
    * **AC 2**: Form Tambah: pilih **Tingkat** (Kategori/Item) → **Kelompok** → **Kategori**/**Item** → **Tipe Pelayanan** (atau Semua Pelayanan) → **Metode** → lalu **matriks Kelas** (kolom Kelas termasuk "Semua Kelas") untuk mengisi **Nilai** per kelas. **Tipe Penjamin tidak dipilih** — implisit **selalu Umum**.
    * **AC 3**: Sel kosong mewarisi: **kelas spesifik → Semua Kelas**, lalu **pelayanan spesifik → Semua Pelayanan** (analog Matriks Harga, tanpa dimensi penjamin).
    * **AC 4**: Aturan **Staf-Item** meng-override **Staf-Kategori** untuk item tsb.
    * **AC 5**: Aturan staf **hanya di-resolve** untuk transaksi berpenjamin **Umum** dengan pasien ditandai **staf** (NIK↔A2); untuk BPJS/Asuransi **diabaikan total** (BR-014).
    * **AC 6**: Bila tak ada aturan staf untuk barang tsb → pasien-staf mengikuti **harga Umum normal** (Item→Kategori→Tier HPP→Default 35%).
    * **AC 7**: Peringatan jual rugi **non-blocking** bila harga staf < HPP (BR-005); toggle Aktif/Nonaktif (soft delete); tercatat audit (BR-012).
---

**Fitur: Resolver Harga untuk Modul Konsumen (per Pelayanan × Penjamin × Kelas)**
* **User Story**: Sebagai Kasir/Apoteker, saya ingin harga jual terisi otomatis sesuai Tipe Pelayanan, Tipe Penjamin (termasuk flag staf), & Kelas transaksi. *(US-009)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Modul konsumen meminta harga untuk **(item, Tipe Pelayanan, Tipe Penjamin, Kelas, flag staf)**. **Overlay Staf** (BR-014): bila penjamin = **Umum** & pasien = **staf**, resolver cek **Aturan Harga Staf** dulu (**Staf-Item → Staf-Kategori**); bila ada → pakai. Bila tidak (atau bukan Umum-staf) → **resolusi normal** dengan urutan level **Matriks Item → Matriks Kategori → Tier HPP → Default 35%**. Pada tiap Matriks (Item/Kategori): **konteks Tipe Pelayanan** dievaluasi dulu (**pelayanan spesifik → Semua Pelayanan**), lalu inheritance sel **eksak (penjamin, kelas) → baris-default (penjamin, Semua Kelas) → kolom-default (Semua Penjamin, kelas) → default matriks (Semua, Semua)**. Bila Item & Kategori kosong → **Tier HPP** (tabel bracket milik **Kelompok × Kategori** item, dipilih via HPP satuan, BR-018); bila kategori tak punya Tier atau tak ada bracket cocok → **Default 35%** (BR-016). **"Belum berharga"** hanya bila aturan efektif Persentase/Tier/Default **dan HPP belum tersedia** (BR-001/004/014/015/016/018).
    * **AC 2**: Harga yang dikembalikan: Persentase dihitung dari **HPP terkini** lalu dibulatkan ke atas; Nominal = nilai final (dibulatkan ke atas). Bila jatuh ke **default margin 35%**: `↑(HPP × 1,35)`.
    * **AC 3**: Bila resolver mengembalikan "belum berharga" (HPP tak tersedia untuk Persentase/Tier/Default), modul konsumen menampilkan **peringatan (warning) non-blocking** — **transaksi tidak diblokir**; petugas dapat tetap melanjutkan / mengisi harga manual (analog BR-005).

---

**Fitur: Sinkronisasi HPP → Harga Jual (Persentase)**
* **User Story**: Sebagai Manajemen/Keuangan, saya ingin harga jual metode Persentase menyesuaikan otomatis saat HPP berubah. *(US-008)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Saat HPP item berubah (event dari Inventori/Pengadaan sesuai metode persediaan FIFO/Average), harga jual aturan **Persentase** dihitung ulang otomatis (BR-004). Aturan **Nominal tidak** terpengaruh.
    * **AC 2**: Harga jual **disimpan sebagai snapshot** (`harga_jual_terakhir`) & **dihitung ulang saat HPP berubah** (mode snapshot dipilih). Untuk aturan **Persentase maupun Tier HPP**, perubahan HPP memicu recompute → item dapat **pindah bracket Tier** (mis. HPP Rp999→10% menjadi Rp1.002→15%) sehingga margin berubah (BR-018).
    * **AC 3**: Perubahan harga akibat sinkronisasi HPP tercatat di log audit (BR-012).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `item_price_rules` (aturan harga)
* **Key Columns**:

| Field | Tipe | Wajib | Sumber Data/Logika | Validasi | Keterangan |
|-------|------|-------|--------------------|----------|------------|
| `id` | UUID | Ya | auto | PK | |
| `scope_type` | enum | Ya | pilihan user | `KATEGORI` / `ITEM` | tingkat aturan (group vs detail) |
| `kelompok_barang` | enum | Ya | A33 / A9 / pilihan | `FARMASI` / `GIZI` / `RUMAH_TANGGA` / `MENU_MAKANAN` | filter & konsistensi kelompok; **`MENU_MAKANAN` → item & kategori dari A9** |
| `kategori_id` | UUID (FK A33) / kode enum A9 | Kondisional | lookup A33 (Farmasi/RT/Gizi) **atau** enum kategori A9 (Menu Makanan) | wajib bila `scope_type=KATEGORI`; opsional (info) bila ITEM | kategori target; utk `MENU_MAKANAN` = **kode kategori enum A9** (Makanan Pokok/Lauk Hewani/Lauk Nabati/Sayur/Buah/Snack/Minuman), bukan FK A33 |
| `item_type` | enum | Kondisional | — | `FARMASI`/`RUMAH_TANGGA`/`GIZI`/`MENU_MAKANAN`; wajib bila ITEM | menentukan master item (A4/A5/A6/A9); `MENU_MAKANAN` → A9 |
| `item_id` | UUID | Kondisional | lookup A4/A5/A6/A9 | wajib bila `scope_type=ITEM` | item target (polymorphic by `item_type`; `MENU_MAKANAN` → menu A9) |
| `tipe_penjamin_id` | UUID (FK A20) | Tidak | lookup A20 | null = **Semua Penjamin** (baris default) | **baris Matriks Harga (Phase 1)** |
| `kelas_id` | UUID (FK A58) | Tidak | lookup A58 (**Kelas induk saja**) | null = **Semua Kelas** (kolom default) | **kolom Matriks Harga (Phase 1)**; hanya **Kelas induk** (I/II/III/VIP), bukan Sub Kelas |
| `tipe_pelayanan` | enum | Tidak | pilihan user | `RAWAT_JALAN`/`RAWAT_INAP`/`IGD`/`PENUNJANG`; null = **Semua Pelayanan** | **konteks Matriks Harga (Phase 1)**; null = default warisan |
| `metode` | enum | Ya | pilihan user | `NOMINAL` / `PERSENTASE` | metode penetapan |
| `nilai` | decimal(15,2) | Ya | manual | ≥ 0; **tanpa batas atas** | Nominal = harga jual final (Rp); Persentase = % markup HPP |
| `pembulatan_kelipatan` | enum | Tidak | konfigurasi | `TANPA`/`100`/`500`/`1000` | default `TANPA` (**tak ada kelipatan default dipaksakan**); opsional per aturan matriks. Tier HPP & Default margin **tanpa kelipatan** |
| `pembulatan_arah` | enum | Ya | fixed | `KE_ATAS` | selalu ke atas (keputusan bisnis) |
| `hpp_acuan_terakhir` | decimal(15,2) | Tidak | Inventori/Pengadaan | ≥ 0 | snapshot HPP satuan saat kalkulasi terakhir (info/audit) |
| `harga_jual_terakhir` | decimal(15,2) | Tidak | rumus | ≥ 0 | snapshot hasil kalkulasi (bila mode snapshot) |
| `is_active` | boolean | Ya | default `true` | aktif/nonaktif | soft delete |
| `approval_status` | enum | Tidak | — | `draft`/`waiting`/`approved`/`rejected` | **[Phase 2]** approval berjenjang |
| `approver_role` | varchar | Tidak | — | — | **[Phase 2]** |
| `berlaku_mulai` | date | Tidak | manual | ≥ hari ini | **[Phase 2]** harga berjadwal |
| `coa_pendapatan_id` | UUID (FK COA) | Tidak | lookup master COA | akun valid | **[Phase 3]** akun pendapatan penjualan barang |
| `coa_persediaan_id` | UUID (FK COA) | Tidak | lookup master COA | akun valid | **[Phase 3]** akun persediaan/beban pokok |
| `created_by`, `updated_by` | UUID (FK users) | Ya | auth | — | audit |
| `created_at`, `updated_at` | timestamp | Ya | auto | — | audit |
| `deleted_at` | timestamp | Tidak | — | nullable | hanya soft delete |

* **Constraints**:
    * `UNIQUE(kategori_id, COALESCE(tipe_pelayanan,'ALL'), COALESCE(tipe_penjamin_id,'ALL'), COALESCE(kelas_id,'ALL')) WHERE scope_type='KATEGORI' AND is_active=true` — maksimal **satu aturan Kategori aktif** per (kategori × pelayanan × penjamin × kelas) (BR-006). *(catatan: gunakan COALESCE/sentinel karena NULL tidak dianggap sama di index unik).*
    * `UNIQUE(item_type, item_id, COALESCE(tipe_pelayanan,'ALL'), COALESCE(tipe_penjamin_id,'ALL'), COALESCE(kelas_id,'ALL')) WHERE scope_type='ITEM' AND is_active=true` — maksimal **satu aturan Item aktif** per (item × pelayanan × penjamin × kelas) (BR-006).
    * `CHECK (nilai >= 0)`.
    * `CHECK (scope_type='KATEGORI' AND kategori_id IS NOT NULL) OR (scope_type='ITEM' AND item_id IS NOT NULL AND item_type IS NOT NULL)`.

> **Konfigurasi global** (mis. tabel `pricing_config`): `default_margin_persen` = **35** (`[ASUMSI]`, konfigurabel, berlaku seragam semua kelompok barang) — dipakai resolver sebagai fallback terakhir (BR-016).

> **Model Matriks**: seluruh baris `item_price_rules` dengan **(scope, target, `tipe_pelayanan`) sama** membentuk **satu Matriks Harga** untuk satu **konteks pelayanan** — tiap baris = satu **sel** `(tipe_penjamin_id, kelas_id)`. Editor menyimpan matriks sebagai kumpulan sel (upsert per sel terisi; hapus sel yang dikosongkan). Uniqueness di atas menjamin **satu sel = satu aturan aktif**.
>
> **Tabel `hpp_margin_tiers`** (Margin per Nilai HPP — BR-018): `id`, **`kelompok_barang`** (enum, wajib), **`kategori_id`** (FK A33 / kode enum A9 utk Menu Makanan, wajib — **scope aturan Tier**), `hpp_min` (decimal ≥0), `hpp_max` (decimal, nullable = ∞), `margin_persen` (decimal ≥0), `urutan` (int), `is_active` (bool), audit. **Aturan Tier dibuat per (`kelompok_barang`, `kategori_id`) — tidak ada Tier per item.** Bracket **tidak boleh tumpang-tindih dalam satu (kelompok × kategori)**; resolver mengambil tabel Tier pada scope kategori item lalu memilih baris yang `hpp_min ≤ HPP_satuan_item ≤ COALESCE(hpp_max, ∞)` — bracket dipilih memakai **HPP satuan item**. **Bila kategori item tak punya aturan Tier → Default 35%** (BR-016). Harga hasil disimpan **snapshot** & di-recompute saat HPP berubah (item dapat pindah bracket). **Tanpa kolom kelipatan pembulatan** — harga dibulatkan **ke atas ke rupiah** (BR-009). Non-overlap dijaga per (`kelompok_barang`, `kategori_id`, rentang HPP) saat `is_active=true`.
>
> **Tabel `staff_price_rules`** (Aturan Harga Staf — domain terpisah, BR-014): `id`, `scope_type` (`KATEGORI`/`ITEM`), `kelompok_barang`, `kategori_id` / (`item_type`+`item_id`), **`tipe_pelayanan`** (nullable = Semua Pelayanan), **`kelas_id`** (FK A58, nullable = Semua Kelas), `metode` (`NOMINAL`/`PERSENTASE`), `nilai` (decimal ≥0), `pembulatan_kelipatan`, `harga_jual_terakhir`, `is_active`, audit. **Tanpa kolom penjamin** — implisit **Umum**. `UNIQUE(scope_type, COALESCE(kategori_id, item_id), COALESCE(tipe_pelayanan,'ALL'), COALESCE(kelas_id,'ALL')) WHERE is_active=true`. Resolusi: **Staf-Item → Staf-Kategori**, tiap level **pelayanan spesifik → Semua Pelayanan** & **kelas spesifik → Semua Kelas**. Hanya di-resolve untuk transaksi **Umum + pasien staf**.
>
> **Tabel pendukung** `item_price_rule_audit`: `id`, `rule_id`, `field`, `nilai_lama`, `nilai_baru`, `alasan`, `changed_by`, `changed_at` — untuk BR-012.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/price-rules` | List aturan Matriks (filter: `scope_type`, `kelompok_barang`, `tipe_pelayanan`, `tipe_penjamin_id`, `kelas_id`, `metode`, `is_active`, `search`, `sort`, `page`) |
| POST | `/api/v1/price-rules` | Create aturan (Kategori/Item × penjamin); status AKTIF |
| GET | `/api/v1/price-rules/{id}` | Detail aturan |
| PUT | `/api/v1/price-rules/{id}` | Update metode/nilai/pembulatan/penjamin |
| PATCH | `/api/v1/price-rules/{id}/status` | Toggle Aktif/Nonaktif |
| POST | `/api/v1/price-rules/preview` | Hitung preview harga dari `{scope, target, tipe_pelayanan, tipe_penjamin_id, kelas_id, metode, nilai}` × HPP terkini (tanpa simpan) |
| GET/POST/PUT/PATCH | `/api/v1/hpp-tiers` | CRUD **bracket Margin per Nilai HPP** per (`kelompok_barang`, `kategori_id`) (`{kelompok_barang, kategori_id, hpp_min, hpp_max, margin_persen, urutan, is_active}`); validasi non-overlap per kategori (BR-018) |
| GET/POST/PUT/PATCH | `/api/v1/staff-price-rules` | CRUD **Aturan Harga Staf** (section terpisah: `{scope_type, kelompok_barang, target, tipe_pelayanan, kelas_id, metode, nilai}`); penjamin implisit Umum (BR-014) |
| GET | `/api/v1/price-rules/resolve?item_type=&item_id=&tipe_pelayanan=&tipe_penjamin_id=&kelas_id=&is_staf=` | **Resolver** harga efektif: overlay **Staf** bila Umum+staf → normal **Item → Kategori → Tier HPP → Default 35%**; pelayanan spesifik → Semua Pelayanan; inheritance sel eksak → baris → kolom → default — BR-001/014/015/016/018 |
| GET | `/api/v1/price-rules/matrix?scope=&target=&tipe_pelayanan=` | **Matriks Harga** satu target pada satu konteks pelayanan (grid Penjamin × Kelas + sub-baris Umum-Staf, berisi sel aktif + harga terkalkulasi) untuk editor & tampilan |
| GET | `/api/v1/price-rules/{id}/audit` | Riwayat perubahan (BR-012) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| scope_type | Tingkat Aturan | Radio/Tab | Ya | KATEGORI / ITEM | pilihan | menentukan form (group vs detail) |
| kelompok_barang | Kelompok Barang | Dropdown | Ya | Farmasi/Gizi/Rumah Tangga/Menu Makanan | A33/A9 | memfilter daftar kategori/item; Menu Makanan → A9 |
| kategori_id | Kategori | Dropdown | Ya (bila KATEGORI) | kategori aktif sesuai kelompok | lookup A33 (Farmasi/RT/Gizi) / enum A9 (Menu Makanan) | target group |
| item_id | Item Barang | Dropdown/Search | Ya (bila ITEM) | item aktif sesuai kelompok | lookup A4/A5/A6/A9 | target detail (override) |
| tipe_penjamin_id | Tipe Penjamin | Dropdown | Ya (boleh "Semua") | penjamin aktif | lookup A20 | dimensi multi-tarif; "Semua" = default |
| kelas_id | Kelas | Dropdown | Ya (boleh "Semua") | **Kelas induk** aktif | lookup A58 (induk saja) | dimensi multi-tarif; "Semua" = default; bukan Sub Kelas |
| tipe_pelayanan | Tipe Pelayanan | Selektor/Tab | Ya (boleh "Semua") | Rawat Jalan/Rawat Inap/IGD/Penunjang | enum | konteks matriks; "Semua Pelayanan" = default warisan |
| metode | Metode | Radio | Ya | NOMINAL / PERSENTASE | manual | Persentase = % markup HPP; Nominal = harga final Rp |
| nilai | Nilai | Number | Ya | ≥ 0; tanpa batas atas | manual | satuan mengikuti metode |
| pembulatan_kelipatan | Pembulatan | Dropdown | Tidak | TANPA/100/500/1000 | konfigurasi | default **TANPA** (tak dipaksakan); arah selalu **ke atas** |
| (info) HPP | HPP Acuan | Display | — | read-only | Inventori/Pengadaan | ditampilkan untuk preview/pembanding |
| (info) harga_jual | Harga Jual (preview) | Display | — | read-only | rumus | hasil kalkulasi real-time |

> **Catatan status behavior**: Tidak ada input Status di form **create** — status di-set **AKTIF** oleh sistem; pengelolaan Aktif/Nonaktif via **toggle di daftar**.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kelompok Barang | `kelompok_barang` | badge | Filter | Farmasi/Gizi/Rumah Tangga/Menu Makanan |
| Tingkat | `scope_type` | badge | Filter | Kategori / Item |
| Target | `kategori.nama` / `item.nama_barang` | text | Search | nama kategori atau item |
| Tipe Pelayanan | `tipe_pelayanan` / "Semua" | badge | Filter | Rawat Jalan/Rawat Inap/IGD/Penunjang |
| Tipe Penjamin | `tipe_penjamin.nama` / "Semua" | badge | Filter | dimensi multi-tarif |
| Kelas | `kelas.nama` / "Semua" | badge | Filter | dimensi multi-tarif |
| Metode | `metode` | text | Filter | Nominal / Persentase |
| Nilai | `nilai` | `Rp x` (Nominal) / `x%` (Persentase) | Sort | satuan sesuai metode |
| HPP Acuan | `hpp_acuan_terakhir` | Rp | — | dari Inventori; "-" bila belum ada |
| Harga Jual | hasil kalkulasi | Rp | Sort | fallback **default margin 35%** bila tak ada aturan; "belum berharga" hanya bila Persentase/default & HPP kosong |
| Status | `is_active` | Toggle + Edit | Filter | nonaktif tetap tampil (badge abu) |

#### 8.3.3 Business Rules

* **BR-001 (Resolusi Harga)** — Untuk (item, **tipe pelayanan**, penjamin, kelas, **flag staf**): **Overlay Staf** — bila penjamin = **Umum** & pasien = **staf**, cek **Aturan Harga Staf** (section terpisah) dulu: **Staf-Item → Staf-Kategori**; bila ada, pakai (BR-014). Bila tidak (atau bukan Umum-staf) → **resolusi normal berlapis**: **(A) Level** — **Matriks Item → Matriks Kategori → Tier HPP (BR-018) → Default 35% (BR-016)** (yang lebih spesifik menang). **(B) Konteks pelayanan** pada tiap Matriks — **pelayanan spesifik → Semua Pelayanan** (BR-015). **(C) Inheritance sel dalam satu matriks** (urut): **(1)** sel eksak (penjamin, kelas) → **(2)** baris-default (penjamin, **Semua Kelas**) → **(3)** kolom-default (**Semua Penjamin**, kelas) → **(4)** default matriks (**Semua Penjamin**, **Semua Kelas**). Bila Item & Kategori kosong pada semua konteks pelayanan → **Tier HPP** (tabel bracket milik Kelompok × Kategori item, dipilih via HPP satuan); bila kategori tak punya Tier atau tak ada bracket cocok → **Default 35%**. **"Belum berharga"** hanya bila aturan efektif Persentase/Tier/Default **dan HPP tak tersedia**. **Prioritas dimensi sel kosong (dikonfirmasi)**: **pelayanan → penjamin → kelas** (terbesar → terkecil) — dimensi terkecil (**kelas**) di-generalisasi lebih dulu, dimensi terbesar (**pelayanan**) dipertahankan paling lama; konsekuensinya **baris-default (penjamin) sebelum kolom-default (kelas)**.
* **BR-002 (Rumus Persentase)** — `harga_jual = pembulatan_ke_atas( HPP × (1 + nilai/100) )`. Persentase = markup atas HPP, **tanpa batas atas**.
* **BR-003 (Rumus Nominal)** — `harga_jual = pembulatan_ke_atas( nilai )`. **`nilai` adalah harga jual final**; **HPP tidak dipakai** dalam rumus (hanya sebagai pembanding untuk peringatan jual rugi).
* **BR-004 (Sumber & sinkronisasi HPP)** — HPP satuan dibaca dari **modul Inventori/Pengadaan sesuai konfigurasi metode persediaan (FIFO / Average)**: FIFO → HPP satuan lapisan berjalan; Average → HPP rata-rata tertimbang. Untuk metode **Persentase**, perubahan HPP **memicu perhitungan ulang** harga jual (menjaga margin). Untuk metode **Nominal**, harga jual **tidak** terpengaruh HPP. Bila HPP belum tersedia (=0/null): aturan Persentase **maupun default margin 35%** → item "belum berharga"; aturan Nominal → tetap berharga. **Harga jual disimpan sebagai snapshot** (`harga_jual_terakhir`); perubahan HPP memicu **recompute** untuk aturan **Persentase, Tier HPP, & Default** — termasuk **re-evaluasi bracket Tier** (item dapat pindah bracket, mis. HPP Rp999 → Rp1.002).
* **BR-005 (Peringatan jual rugi — non-blocking)** — Bila `harga_jual < HPP`, sistem menampilkan **peringatan** kepada petugas namun **tidak memblokir** penyimpanan/penjualan (keputusan tetap di tangan Bagian Keuangan).
* **BR-006 (Keunikan aturan aktif)** — Maksimal **satu aturan aktif** per kombinasi: **(Kategori × Tipe Pelayanan × Tipe Penjamin × Kelas)** dan **(Item × Tipe Pelayanan × Tipe Penjamin × Kelas)** ("Semua"/null pada tiap dimensi dihitung sebagai satu nilai). Untuk **Aturan Harga Staf**: satu aturan aktif per **(scope × target)**; untuk **Tier HPP**: bracket tidak tumpang-tindih (BR-018). Membuat aturan baru untuk kombinasi yang sudah punya aturan aktif ditolak (arahkan edit).
* **BR-007 (Konsistensi kelompok & lookup)** — Aturan Kategori hanya untuk kategori pada kelompok yang benar (A33); aturan Item hanya untuk item dari master yang sesuai kelompoknya (Farmasi→A4, Rumah Tangga→A5, Gizi→A6, Menu Makanan→A9). Tipe Penjamin (A20) & Kelas (A58) diambil dari master aktif.
* **BR-008 (Tanpa hapus permanen)** — Aturan hanya dinonaktifkan (soft delete via `is_active`); histori & audit tetap utuh.
* **BR-009 (Pembulatan ke atas)** — Arah pembulatan **selalu ke atas**. **Kelipatan** (`pembulatan_kelipatan`) bersifat **opsional** & hanya pada **aturan matriks** (Kategori/Item); **tidak ada kelipatan default yang dipaksakan** (default `TANPA` → dibulatkan ke atas ke **rupiah terdekat**). **Tier HPP & Default margin 35% tidak memakai kelipatan** (`↑` ke rupiah) — granularitas harga sudah dicover oleh margin default sistem. Bila kelipatan diisi (mis. 100): 12.340 → 12.400.
* **BR-010 (RBAC — Bagian Keuangan)** — Hanya role **Bagian Keuangan** (via RBAC A53) yang boleh create/edit/toggle aturan harga. (Pemisahan penetap vs peninjau menuju approval Phase 2.)
* **BR-011 (Konsumsi runtime)** — Modul Pelayanan Farmasi/Kasir/Billing **wajib** mengambil harga via resolver A59 dengan konteks **Tipe Pelayanan, Tipe Penjamin (+ flag staf bila Umum), & Kelas transaksi** (BR-001), bukan input manual — kecuali override transaksional di luar scope A59.
* **BR-012 (Audit)** — Setiap perubahan aturan (create/edit/toggle) & perubahan harga akibat sinkronisasi HPP dicatat (nilai lama→baru, aktor, waktu, alasan bila ada).
* **BR-013 (Phase 3 — COA)** — Nilai jual (pendapatan) & HPP (beban pokok) diteruskan ke jurnal via pemetaan `coa_pendapatan_id`/`coa_persediaan_id`; hanya aktif Phase 3.
* **BR-014 (Aturan Harga Staf — domain terpisah, hanya Umum)** — Harga staf dikelola pada **section/tabel tersendiri** (`staff_price_rules`), **bukan** bagian dari Matriks Penjamin×Kelas. Aturan staf **hanya valid & hanya di-resolve** untuk transaksi berpenjamin **Umum** dengan pasien ditandai **staf**. Aturan staf **berdimensi Tipe Pelayanan × Kelas** (Tipe Penjamin **selalu Umum**, tanpa dimensi penjamin). Resolusi staf: **Staf-Item → Staf-Kategori**, tiap level dengan **pelayanan spesifik → Semua Pelayanan** & **kelas spesifik → Semua Kelas**; bila tak ada → pasien-staf mengikuti **harga Umum normal** (Item→Kategori→Tier HPP→Default 35%). Untuk **BPJS/Asuransi**, aturan staf **diabaikan total**. **Penentuan status staf**: saat **pendaftaran pasien**, **NIK pasien dicocokkan ke Master Data Staff (A2)** (NIK wajib & unik 16 digit); cocok dengan **staf aktif** → pasien = **staf**. Karena berbasis **NIK pasien**, hanya **individu staf** yang berhak; keluarga/tanggungan dengan NIK berbeda **tidak** otomatis mendapat harga staf.
* **BR-015 (Dimensi Tipe Pelayanan)** — Harga dapat dibedakan per **Tipe Pelayanan** (`RAWAT_JALAN`/`RAWAT_INAP`/`IGD`/`PENUNJANG`). `tipe_pelayanan` = null berarti **Semua Pelayanan** — **default** yang diwarisi bila tak ada aturan spesifik pelayanan. Resolver mengevaluasi **pelayanan spesifik → Semua Pelayanan** (pada tiap level Item/Kategori) sebelum menyimpulkan "belum berharga". `tipe_pelayanan` = **enum tetap sistem** (bukan master ber-CRUD).
* **BR-016 (Default Margin Global 35%)** — Bila untuk suatu barang tidak ada aturan yang berlaku pada level **Item, Kategori, maupun Tier HPP** & konteksnya, sistem menerapkan **markup default 35% (Persentase atas HPP)** sebagai harga jual: `harga_jual = ↑(HPP × 1,35)`, **berlaku seragam untuk semua kelompok barang** (Farmasi/Rumah Tangga/Gizi/Menu Makanan). Nilai default = konfigurasi global `default_margin_persen` (`[ASUMSI]` **35**, dapat diubah **Bagian Keuangan**). Konsekuensi: barang dengan **HPP tersedia selalu berharga**; **"belum berharga"** hanya bila HPP belum tersedia (untuk Persentase/Tier/Default) & tak ada aturan Nominal. Baseline default matriks (Semua Pelayanan × Semua Penjamin × Semua Kelas) juga di-preset **+35%**. **Precedence: Item > Kategori > Tier HPP > Default 35%**.
* **BR-017 (Aturan Harga Staf = section terpisah)** — Segmentasi staf/non-staf adalah **domain pengaturan berbeda** dan dikelola pada **section tersendiri** (`staff_price_rules`), terpisah dari Matriks Penjamin×Kelas; perubahan pada satu section tidak memengaruhi yang lain. (Resolusi & batasan Umum-only: BR-014.)
* **BR-018 (Margin per Nilai HPP — Tier)** — RS dapat menyusun **bracket margin** (`hpp_margin_tiers`) yang **dibuat per (`kelompok_barang`, `kategori_id`)** — **tidak dapat dibuat per item**. Tiap bracket = rentang HPP → `margin_persen`. Bila item tak punya aturan Item/Kategori untuk konteksnya, resolver mengambil **tabel Tier milik (Kelompok × Kategori) item** lalu memilih bracket yang memuat **HPP satuan item** → `harga_jual = ↑(HPP × (1 + margin/100))`. Bracket **tidak boleh tumpang-tindih dalam satu kategori**; **bila kategori item tidak memiliki aturan Tier (tak diatur) atau tak ada bracket cocok → kembali ke Default 35% (aturan sistem)** (BR-016). Urutan level: **Item > Kategori > Tier HPP > Default**. Bracket dipilih via HPP satuan item, sehingga **harga disimpan snapshot & di-recompute saat HPP berubah** — item dapat **pindah bracket** (mis. HPP **Rp999 → 15%** [0–1.000], setelah update **Rp1.002 → 12%** [1.001–2.000]). Contoh (untuk satu kategori): HPP 0–1.000 → 15%, 1.001–2.000 → 12%, > 2.000 → 10%.

## 9. Workflow / BPMN Interpretation

> Modul A59 **belum punya BPMN sendiri**. Alur diturunkan dari pola pengaturan (A33/A42) + logika penetapan harga berbasis HPP + multi-tarif penjamin. Bagian turunan ditandai `[ASUMSI]`.

**Skenario 1 — Set Harga per Kategori (Editor Matriks)**
1. Bagian Keuangan buka **Pengaturan > Pengaturan Harga** → tingkat **Kategori** → **Tambah**.
2. Pilih **Kelompok Barang** (mis. Farmasi) → **Kategori** (mis. "Obat Generik") → **Tipe Pelayanan** (mis. Rawat Jalan atau **Semua Pelayanan**) → **Metode** (mis. Persentase) & **Pembulatan**.
3. Sistem menampilkan **Matriks Harga** untuk pelayanan terpilih (baris Tipe Penjamin × kolom Kelas). Petugas mengisi sel yang diperlukan (mis. **Semua × Semua = 35%** (default), **BPJS × Kelas III = 10%**); sel kosong menampilkan **nilai warisan** (BR-001).
4. Sistem menghitung **harga jual per sel** dari **HPP terkini** item (FIFO/Average) + pembulatan ke atas.
   * **Gateway — Ada harga_jual < HPP?** Ya → tampilkan **peringatan jual rugi (non-blocking)** (BR-005); Tidak → lanjut.
5. **SIMPAN** → upsert **satu aturan aktif per sel terisi** (BR-006); berlaku ke item kategori kecuali di-override matriks Item (BR-001).

**Skenario 2 — Set Harga per Item (Override, Editor Matriks)**
1. Bagian Keuangan pilih tingkat **Item** → **Tambah** → pilih Kelompok & **Item** (mis. obat X) → **Metode** & **Pembulatan**.
2. Sistem menampilkan **HPP satuan terkini** item + **Matriks Harga** item.
3. Petugas memilih **Tipe Pelayanan** lalu mengisi sel (mis. **Umum × VIP = Nominal Rp 25.000**) → tiap sel menampilkan preview (BR-002/003, pembulatan ke atas).
4. **SIMPAN** → sel matriks Item **override** matriks Kategori pada kombinasi (pelayanan × penjamin × kelas) tsb (BR-001).

**Skenario 3 — HPP berubah (sinkronisasi & snapshot)**
1. Inventori/Pengadaan memperbarui HPP satuan item (sesuai metode persediaan FIFO/Average).
2. Sistem menerima event → **hitung ulang** harga jual (snapshot `harga_jual_terakhir`) untuk aturan **Persentase, Tier HPP, & Default** yang menaungi item (BR-004). **Tier di-re-evaluasi**: item dapat **pindah bracket** (mis. HPP Rp999 → 15%, setelah update Rp1.002 → 12%). Aturan **Nominal tidak** diproses.
3. Catat perubahan di audit (BR-012); snapshot baru dipakai resolver berikutnya.

**Skenario 4 — Konsumsi oleh modul jual (per penjamin)**
1. Kasir/Apoteker menambah barang → modul konsumen memanggil **resolver** `/price-rules/resolve` dengan **item + Tipe Pelayanan + Tipe Penjamin + Kelas + flag staf** transaksi.
2. **Overlay Staf**: bila **Umum + pasien staf**, resolver cek **Aturan Harga Staf** dulu (Staf-Item → Staf-Kategori); bila ada → pakai (BR-014).
3. Bila tidak, **resolusi normal**: **Matriks Item → Kategori** (per konteks **pelayanan spesifik → Semua Pelayanan**; inheritance sel eksak → baris → kolom → default) → **Tier HPP** (tabel bracket milik Kelompok × Kategori item, dipilih via HPP satuan; kategori tanpa Tier → skip, BR-018) → **Default 35%** (BR-016); kembalikan harga (dibulatkan ke atas).
   * **Gateway — HPP tersedia?** Tidak (untuk Persentase/Tier/Default) → kembalikan "belum berharga" → modul konsumen menampilkan **peringatan non-blocking** (transaksi tidak diblokir; petugas dapat lanjut / input harga manual).

**Skenario 5 — Nonaktifkan aturan**
1. Bagian Keuangan geser toggle Nonaktif pada sebuah aturan.
2. **Aturan Item** dinonaktifkan → item kembali mengikuti aturan yang lebih umum (Kategori / penjamin Semua / kelas Semua) sesuai precedence — BR-001.
3. **Aturan Kategori** dinonaktifkan → item kategori (pada penjamin × kelas tsb) jatuh ke aturan yang lebih umum atau menjadi "belum berharga".
4. Data tetap tersimpan (soft delete), tercatat di audit (BR-008/BR-012).

**Skenario 6 — Susun Margin per Nilai HPP (Tier)**
1. Bagian Keuangan buka section **Margin per Nilai HPP**.
2. Pilih **Kelompok Barang → Kategori**, lalu tambah bracket berurutan berbasis **HPP satuan** untuk kategori tsb: mis. **0–1.000 → 15%**, **1.001–2.000 → 12%**, **> 2.000 → 10%** (**tidak per item**).
3. Sistem memvalidasi **tidak tumpang-tindih**; preview HPP satuan sampel menampilkan margin & harga hasil.
4. **SIMPAN** → bracket berlaku untuk **seluruh item pada (Kelompok × Kategori)** tsb; resolver memilih bracket via HPP satuan tiap item; kategori tanpa Tier → Default 35% (BR-018).

**Skenario 7 — Set Aturan Harga Staf (Section Terpisah)**
1. Bagian Keuangan buka section **Aturan Harga Staf**.
2. Tambah aturan: **Tingkat** (Kategori/Item) → **Kelompok** → **Target** → **Tipe Pelayanan** (atau Semua Pelayanan) → **Metode** → isi **Nilai per Kelas** (matriks Kelas; Tipe Penjamin **tidak dipilih**, implisit Umum) — mis. Obat Generik, Rawat Inap, Kelas I = Persentase 5%.
3. **SIMPAN** → aturan hanya berlaku untuk transaksi **Umum + pasien staf** (NIK↔A2), sesuai pelayanan × kelas transaksi; BPJS/Asuransi diabaikan (BR-014).

---

## Lampiran — Asumsi & Pertanyaan Terbuka

**Asumsi & Keputusan Desain**
* `[ASUMSI]` Modul A59 belum punya BPMN sendiri; alur diturunkan dari pola pengaturan (A33/A42) + logika penetapan harga berbasis HPP & multi-tarif penjamin.
* **Metode Nominal = harga jual final** (mengabaikan HPP); Metode **Persentase = markup dari HPP** (tanpa batas atas).
* **Pembulatan selalu ke atas**; **tidak ada kelipatan default dipaksakan** (default Tanpa → ke rupiah); kelipatan opsional hanya pada aturan matriks; **Tier HPP & Default margin tanpa kelipatan**.
* **Jual rugi** (`harga_jual < HPP`) → **peringatan non-blocking**, tetap dapat disimpan/dijual.
* **Matriks Harga — Tipe Penjamin (A20, baris) × Kelas (A58, kolom)** aktif di **Phase 1**; tiap sel = aturan tersendiri. Baris "Semua Penjamin" & kolom "Semua Kelas" = default yang diwarisi sel kosong. Matriks **Item** override matriks **Kategori**. `[ASUMSI]` inheritance sel kosong: baris-default (penjamin) diprioritaskan sebelum kolom-default (kelas).
* **Tipe Pelayanan (Rawat Jalan/Rawat Inap/IGD/Penunjang)** = **konteks matriks** Phase 1; satu Matriks Penjamin × Kelas per pelayanan; `tipe_pelayanan`=null (**Semua Pelayanan**) = default yang diwarisi (BR-015). Nilainya = **enum tetap sistem** (bukan master ber-CRUD).
* **Aturan Harga Staf = section terpisah** (`staff_price_rules`), domain berbeda dari Matriks Penjamin×Kelas. **Tipe Penjamin selalu Umum**, namun **berdimensi Tipe Pelayanan × Kelas**; overlay Staf-Item → Staf-Kategori (pelayanan spesifik → Semua Pelayanan, kelas spesifik → Semua Kelas); bila tak ada → harga Umum normal; diabaikan total untuk BPJS/Asuransi (BR-014/017). Flag pasien-staf ditentukan saat **pendaftaran** via **pencocokan NIK pasien ke Master Data Staff (A2)** (NIK unik & wajib 16 digit); hanya individu staf ybs (bukan keluarga/tanggungan) yang berhak.
* **Margin per Nilai HPP (Tier)** — aturan **dibuat per (Kelompok Barang × Kategori)**, **bukan per item**; bracket dipilih via **HPP satuan item**; fallback di atas Default 35%, di bawah Kategori (BR-018). **Kategori tanpa aturan Tier → kembali ke Default Sistem 35%** (dikonfirmasi). Contoh (per kategori): 0–1.000 → 15%, 1.001–2.000 → 12%, > 2.000 → 10%.
* **Prioritas dimensi** (untuk sel/aturan kosong, **dikonfirmasi**): **pelayanan → penjamin → kelas** (terbesar → terkecil; kelas di-generalisasi lebih dulu, pelayanan dipertahankan paling lama).
* **Dimensi Kelas = Kelas induk saja** (I/II/III/VIP), **bukan Sub Kelas** (dikonfirmasi).
* **Item "belum berharga" di titik jual** → **warning non-blocking**; transaksi **tidak diblokir**, petugas dapat lanjut / input harga manual (dikonfirmasi).
* **"Semua Penjamin" tidak wajib** dibuat lebih dulu sebagai baseline — sel/aturan boleh langsung spesifik; celah tertutup inheritance → Tier/Default 35% (dikonfirmasi).
* **Hak akses = Bagian Keuangan** (via RBAC A53).
* **HPP** mengikuti **konfigurasi metode persediaan (FIFO/Average)** di Inventori; A59 membaca **HPP satuan terkini**. **Harga jual = snapshot** (`harga_jual_terakhir`), di-recompute saat HPP berubah (Persentase, Tier HPP, & Default — termasuk re-evaluasi bracket Tier); Nominal → tetap.
* **HPP Menu Makanan (A9) — dikonfirmasi**: HPP menu = **agregasi biaya bahan komposisinya** (Σ BDD×harga bahan Barang Gizi A6, sesuai metode persediaan FIFO/Average), **bukan** input manual; perubahan HPP bahan → recompute harga menu (Persentase/Tier).
* Cakupan barang: **Farmasi (A4), Rumah Tangga (A5), Gizi (A6), Menu Makanan (A9)** via Kelompok Barang. **Kategori Menu Makanan** memakai **7 nilai enum internal A9** (Makanan Pokok, Lauk Hewani, Lauk Nabati, Sayur, Buah, Snack, Minuman), bukan kategori A33. **HPP Menu Makanan (dikonfirmasi)** = **agregasi biaya bahan komposisi** menu (Σ BDD×harga Barang Gizi A6, sesuai metode persediaan); recompute otomatis saat HPP bahan berubah.
* **Default margin global = 35% (Persentase)** — fallback bila tak ada aturan Item/Kategori/Tier HPP (BR-016); berlaku **seragam semua kelompok barang**; konfigurabel oleh Bagian Keuangan.
* **Precedence level**: **Item > Kategori > Tier HPP > Default 35%** (overlay **Staf** untuk transaksi Umum-staf); di dalam matriks: pelayanan spesifik > Semua Pelayanan, penjamin spesifik > Semua, kelas spesifik > Semua; tanpa HPP (Persentase/Tier/Default) → "belum berharga".
* Soft delete (nonaktif) agar histori harga & referensi konsumen tetap utuh.

**Pertanyaan Terbuka**
* **[PERLU KONFIRMASI]** Apakah **kategori Menu Makanan** cukup memakai **7 enum A9** apa adanya untuk penetapan harga level group, atau perlu granularitas berbeda (mis. per Bentuk Makanan/Jenis Diet). *(ditambahkan v1.9)*
