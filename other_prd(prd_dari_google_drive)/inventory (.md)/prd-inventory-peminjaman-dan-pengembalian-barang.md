# PRD — Inventory: Peminjaman dan Pengembalian Barang

**Related Document:** Design Figma (https://www.figma.com/board/IUfyeM5qoU3I1XLxfW6wok/Peminjaman-dan-Pengembalian-Barang-V2); BPMN Lucidchart (https://lucid.app/lucidchart/f2259e84-5322-470d-85a4-ead9a31300e5); Master Barang Farmasi; Master Instansi Rekanan; Pengaturan & Persetujuan Peminjaman Barang; Daftar Jurnal (Keuangan)
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

Modul **Peminjaman & Pengembalian Barang** (code **H7**, cluster **Backoffice / Inventory**) mengelola transaksi pinjam-meminjam barang farmasi (obat, alkes, BHP) antar instansi/rumah sakit untuk RS Tipe C & D.

Peminjaman dibedakan menjadi dua kategori:
- **Pinjaman Masuk** — RS **meminjam** barang dari instansi lain → menimbulkan **Hutang** (utang barang). Saat dieksekusi, **stok bertambah**.
- **Pinjaman Keluar** — RS **meminjamkan** barang ke instansi lain → menimbulkan **Piutang**. Saat dieksekusi, **stok berkurang**.

Alur: **Pengajuan Peminjaman → (Konfirmasi/Persetujuan) → Eksekusi & Update Stok → Pengembalian (Barang atau Uang)**. Saat disetujui/dieksekusi, sistem memperbarui stok dan (Phase 3) menghasilkan **jurnal otomatis** (persediaan, hutang/piutang, pergerakan HPP). Pengembalian dapat berupa **barang fisik** atau **uang** yang diselesaikan hingga status **Lunas/Dibayar/Diterima**.

Barang merujuk pada **Master Barang Farmasi**, instansi merujuk pada **Master Instansi Rekanan**, dan nilai transaksi terhubung ke modul **Akuntansi/Billing**. Status Hutang/Piutang **per barang** menjadi acuan proses pengembalian dan rekonsiliasi antar instansi.

> Sumber utama: Lampiran `PRD_Peminjaman_Pengembalian_Barang (1).docx`.

## 2. Background

Pinjam-meminjam barang antar rumah sakit umum terjadi (stok kosong, kebutuhan mendesak), namun pencatatannya sering **manual**. Akibatnya:

1. Transaksi peminjaman **sulit dilacak** dan tidak ada catatan hutang/piutang barang yang jelas.
2. **Tidak ada alur persetujuan** sehingga peminjaman tidak terkontrol.
3. Nilai peminjaman **tidak terbukukan ke jurnal** sehingga laporan keuangan tidak akurat.
4. Pengembalian (barang maupun uang) **tidak terdokumentasi** dan sulit direkonsiliasi.

Modul ini memusatkan pencatatan peminjaman beserta persetujuan, jurnal otomatis, status hutang/piutang, dan pengembalian antar instansi sehingga seluruh transaksi terlacak dan dapat direkonsiliasi.

**Konteks RS Tipe C & D:** SDM dan anggaran terbatas; modul harus sederhana dan realistis. Pada **Phase 1**, persetujuan di-set **auto-approve** dan update stok dilakukan **saat pengajuan diajukan** agar tidak menyandera operasional gudang yang minim staf. [ASUMSI]

## 3. In Scope

### Scope Definition (per Phase)

| Phase | Scope / Area |
|-------|--------------|
| **Phase 1** | Daftar Barang Transaksi (status Hutang/Piutang per barang) |
| **Phase 1** | Pengajuan Peminjaman (Tambah Transaksi) + generate **No Peminjaman** |
| **Phase 1** | Transaksi Peminjaman — **Pinjaman Masuk** & **Pinjaman Keluar** |
| **Phase 1** | Proses Pengembalian berupa **Barang** (update stok + status) |
| **Phase 1** | Pencarian, filter & detail transaksi |
| **Phase 2** | Pengembalian berupa **Uang** (alur ke Keuangan, status Lunas) |
| **Phase 2** | **Approval kepala gudang** |
| **Phase 2** | Integrasi dengan pengaturan & fitur persetujuan peminjaman barang |
| **Phase 3** | Created **bukti transaksi** |
| **Phase 3** | Integrasi dengan Keuangan dan **jurnal otomatis** (persediaan, hutang/piutang, HPP) |

### Out Scope

| No | Scope | Keterangan |
|----|-------|------------|
| 1 | **Persetujuan peminjaman barang** | Ada di fitur *Persetujuan Peminjaman Barang* (modul terpisah) |
| 2 | **Pengaturan persetujuan peminjaman barang** | Ada di fitur *Pengaturan* (modul terpisah) |
| 3 | Master Barang Farmasi & Master Instansi Rekanan | Dikelola di modul Master Data (modul ini hanya konsumen/lookup) |
| 4 | Pemrosesan pembayaran/penerimaan kas riil | Dieksekusi di modul Keuangan (modul ini hanya mengajukan & menerima status) |

## 4. Goals and Metrics

### Goals
1. Menyediakan pencatatan peminjaman & pengembalian barang antar instansi yang **terlacak dan terkontrol**.
2. Memastikan **status hutang/piutang per barang dan per instansi akurat**.
3. Mempermudah penyelesaian pengembalian baik berupa **barang** maupun **uang**.

### Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Keterlacakan transaksi | **100%** peminjaman & pengembalian tercatat dengan **nomor transaksi (No Peminjaman)** |
| 2 | Akurasi hutang/piutang | Status hutang/piutang **sesuai sisa barang** yang belum dikembalikan |
| 3 | Pencarian transaksi | Waktu pencarian data transaksi **< 3 detik** |
| 4 | Konsistensi stok | Setiap eksekusi/pengembalian menghasilkan pergerakan stok yang **terekonsiliasi** dengan Informasi Stok (H4) [ASUMSI] |

## 5. Related Feature

| No | Module | Feature | Code | Catatan |
|----|--------|---------|------|---------|
| 1 | Master Data | Master Barang Farmasi | [PERLU KONFIRMASI] | Sumber lookup `kode_barang`, `nama_barang`, `satuan` |
| 2 | Master Data | Master Instansi Rekanan | [PERLU KONFIRMASI] | Sumber lookup instansi peminjam/pemberi pinjaman |
| 3 | Inventory | Informasi Stok | **H4** | Validasi & pergerakan stok |
| 4 | Inventory | Mutasi Stok | **H5** | Mutasi akibat eksekusi & pengembalian [ASUMSI] |
| 5 | Pengaturan **[Phase 2]** | Pengaturan Peminjaman Barang | [PERLU KONFIRMASI] | Konfigurasi alur persetujuan (Out Scope modul ini) |
| 6 | Persetujuan **[Phase 2]** | Persetujuan Peminjaman Barang | [PERLU KONFIRMASI] | Eksekusi approval (Out Scope modul ini) |
| 7 | Keuangan **[Phase 3]** | Daftar Jurnal (Jurnal Otomatis) | [PERLU KONFIRMASI] | Posting persediaan/hutang/piutang/HPP |

**Fitur se-cluster (Backoffice/Inventory):** H1 Pemesanan, H2 Penerimaan, H3 Distribusi, H4 Informasi Stok, H5 Mutasi Stok, H6 Stok Opname, H8 Retur Pembelian, H9 Pemusnahan, H10 Rencana Pengadaan, H11 Penggunaan Barang Unit.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Background]
- Permintaan pinjam barang antar RS dicatat **manual** (buku/WhatsApp/kertas).
- Tidak ada nomor transaksi, tidak ada catatan hutang/piutang per barang.
- Stok tidak otomatis berubah; petugas menyesuaikan kartu stok manual → rawan selisih.
- Pengembalian tidak terdokumentasi; rekonsiliasi antar instansi sulit dan nilai tidak masuk jurnal.

### B. To-Be (kondisi diharapkan) — sumber: Lampiran (To-Be)

**1) Pengajuan Peminjaman**
- Petugas menyiapkan **list barang** untuk peminjaman dan memilih **Kategori Peminjaman (Masuk/Keluar)**, lalu **Simpan**.
- Sistem menyimpan data dan **generate No Peminjaman**.

**2) Konfirmasi / Persetujuan** — *[Phase 1: auto-approve]; [Phase 2: ke fitur Persetujuan]*
- User bisa **menyetujui** atau **menolak**. Jika menolak, **wajib alasan penolakan**.
- Jika **Ditolak** → Status Peminjaman = **Ditolak** (tidak memengaruhi stok).
- Jika **Disetujui** → Status Peminjaman = **Disetujui** (memengaruhi stok).

**3) Eksekusi Peminjaman & Update Stok** — *[Phase 1: update stok saat diajukan]*
- **Pinjam Keluar** (RS meminjamkan): stok **berkurang**, berpengaruh ke pergerakan **HPP**.
- **Pinjam Masuk** (RS meminjam): stok **bertambah**, berpengaruh ke pergerakan **HPP**.

**4) Pengembalian berupa Barang**
- User menyiapkan list barang yang dikembalikan dan input pengembalian.
- **Pinjam Masuk (utang)**: pengembalian → stok **berkurang** → status update **Dibayar**.
- **Pinjam Keluar (piutang)**: pengembalian → stok **bertambah** → status update **Diterima**.

**5) Pengembalian berupa Uang** — *[Phase 2]*
- **Jika utang**: input pengembalian uang → status **Menunggu Pembayaran** → masuk Keuangan untuk dibayar → Keuangan membayar → status **Dibayar**.
- **Jika piutang**: input pengembalian uang → status **Menunggu Pembayaran** → masuk Keuangan untuk konfirmasi penerimaan → status **Diterima**.

> Pola alur (dashboard list, buka menu, input item, simpan, sistem update & kurangi/tambah stok) selaras dengan BPMN `g-backoffice-inventory-distribusi`, `g-backoffice-inventory-penerimaan`, dan pola pengembalian `g-support-pharmacy-return-ri`. [ASUMSI]

## 7. Main Flow / Mindmap

**Alur utama (Phase 1):**

```
[Petugas Gudang] Buka menu Inventory - Peminjaman & Pengembalian Barang
   → Sistem menampilkan list transaksi pada dashboard
   → Klik "Tambah Transaksi"
   → Pilih Kategori (Pinjaman Masuk / Pinjaman Keluar)
   → Pilih Instansi Rekanan
   → Tambah item barang (kode_barang, jumlah, satuan) [bisa >1]
   → Simpan Pengajuan
[Sistem] Simpan data + Generate No Peminjaman
   → (Phase 1) AUTO-APPROVE → Status = Disetujui
   → (Phase 2) Kirim ke fitur Persetujuan:
        ├─ Ditolak? (wajib alasan) → Status = Ditolak → SELESAI (stok tidak berubah)
        └─ Disetujui? → lanjut
[Sistem] Eksekusi & Update Stok:
        ├─ Pinjam Keluar → stok BERKURANG + pergerakan HPP → Status Hutang/Piutang = Piutang
        └─ Pinjam Masuk  → stok BERTAMBAH + pergerakan HPP → Status Hutang/Piutang = Hutang
```

**Alur pengembalian:**

```
[Petugas] Buka detail transaksi → "Proses Pengembalian"
   → Pilih jenis pengembalian: BARANG (Phase 1) / UANG (Phase 2)
   ── BARANG ──
     → Input list barang dikembalikan (jumlah)
       ├─ Utang (Pinjam Masuk): stok BERKURANG → status barang = Dibayar
       └─ Piutang (Pinjam Keluar): stok BERTAMBAH → status barang = Diterima
     → Jika semua barang kembali → Status Transaksi = Lunas
   ── UANG (Phase 2) ──
     → Input nilai pengembalian → Status = Menunggu Pembayaran
       ├─ Utang  → Keuangan proses bayar → Status = Dibayar
       └─ Piutang→ Keuangan konfirmasi terima → Status = Diterima
     → Status Transaksi = Lunas
```

**Trigger awal:** kebutuhan pinjam barang (stok kosong/mendesak).
**Hasil akhir:** transaksi tercatat dengan No Peminjaman, stok terupdate, status hutang/piutang per barang terlacak, (Phase 3) jurnal terbentuk.

## 8. Business Rules

| ID | Rule | Sumber |
|----|------|--------|
| **BR-001** | Setiap pengajuan peminjaman yang disimpan **wajib menghasilkan No Peminjaman unik** (auto-generate). | Lampiran (Scope Phase 1) |
| **BR-002** | **Kategori Peminjaman** wajib salah satu: `Pinjaman Masuk` atau `Pinjaman Keluar`. | Lampiran (To-Be) |
| **BR-003** | **Pinjaman Masuk** → menimbulkan **Hutang**, saat eksekusi **stok bertambah**. **Pinjaman Keluar** → menimbulkan **Piutang**, saat eksekusi **stok berkurang**. | Lampiran |
| **BR-004** | Jika peminjaman **Ditolak** → Status = Ditolak dan **tidak memengaruhi stok** maupun HPP. | Lampiran |
| **BR-005** | Penolakan **wajib menyertakan alasan** (field `alasan_penolakan` tidak boleh kosong). | Lampiran |
| **BR-006** | **Phase 1:** persetujuan **auto-approve** dan update stok dilakukan **saat pengajuan diajukan**. **Phase 2:** persetujuan mengikuti fitur Persetujuan + Pengaturan. | Lampiran (anotasi Phase) |
| **BR-007** | **Pinjam Keluar** hanya boleh diajukan bila **stok tersedia mencukupi** untuk item yang dipinjamkan. [PERLU KONFIRMASI — apakah boleh stok minus] | [ASUMSI] |
| **BR-008** | Pengembalian **Barang**: Utang → stok berkurang & status barang **Dibayar**; Piutang → stok bertambah & status barang **Diterima**. | Lampiran |
| **BR-009** | Status hutang/piutang dihitung **per barang**; transaksi berstatus **Lunas** hanya jika seluruh barang/nilai telah dikembalikan/diselesaikan. | Lampiran (Metrics #2) |
| **BR-010** | Pengembalian **Uang** (Phase 2): status `Menunggu Pembayaran` → diselesaikan Keuangan menjadi `Dibayar` (utang) / `Diterima` (piutang). | Lampiran |
| **BR-011** | Setiap eksekusi & pengembalian memengaruhi **pergerakan HPP** dan (Phase 3) menghasilkan **jurnal otomatis**. | Lampiran |
| **BR-012** | Jumlah pengembalian **tidak boleh melebihi** jumlah barang yang masih berstatus hutang/piutang pada transaksi tsb. | [ASUMSI] |

## 9. User Stories

| ID | User Story | Trace |
|----|------------|-------|
| **US-001** | Sebagai **Petugas Gudang**, saya ingin **membuat pengajuan peminjaman** dengan memilih kategori (Masuk/Keluar) dan menambah item barang, agar transaksi pinjam-meminjam tercatat resmi. | BPMN analogi: "Klik tombol tambah" / "Input item tambah" (g-backoffice-inventory-distribusi) |
| **US-002** | Sebagai **Petugas Gudang**, saya ingin sistem **meng-generate No Peminjaman otomatis** saat simpan, agar setiap transaksi punya identitas unik dan mudah dilacak. | BR-001 |
| **US-003** | Sebagai **Kepala Gudang** *(Phase 2)*, saya ingin **menyetujui/menolak** pengajuan dengan alasan, agar peminjaman terkontrol. | BR-004, BR-005 |
| **US-004** | Sebagai **Sistem**, saya ingin **mengurangi/menambah stok** sesuai kategori saat eksekusi, agar Informasi Stok selalu akurat. | BR-003 |
| **US-005** | Sebagai **Petugas Gudang**, saya ingin **memproses pengembalian berupa barang** dan melihat status berubah, agar hutang/piutang barang berkurang. | BR-008 |
| **US-006** | Sebagai **Petugas Gudang/Keuangan** *(Phase 2)*, saya ingin **memproses pengembalian berupa uang** hingga status Lunas, agar transaksi tanpa barang bisa diselesaikan. | BR-010 |
| **US-007** | Sebagai **Petugas Gudang**, saya ingin **mencari & memfilter transaksi** (no, instansi, kategori, status, tanggal) dan melihat detail, agar cepat menemukan data (<3 detik). | Metrics #3 |
| **US-008** | Sebagai **Manajemen/Keuangan**, saya ingin melihat **daftar barang transaksi beserta status hutang/piutang per barang**, agar bisa rekonsiliasi antar instansi. | BR-009 |
| **US-009** | Sebagai **Akuntansi** *(Phase 3)*, saya ingin setiap transaksi menghasilkan **jurnal otomatis** (persediaan, hutang/piutang, HPP), agar laporan keuangan akurat. | BR-011 |

## 10. Functional Requirements

| ID | Requirement | Phase | Trace |
|----|-------------|-------|-------|
| **FR-001** | Sistem menampilkan **dashboard/list transaksi peminjaman** dengan kolom No Peminjaman, tanggal, instansi, kategori, status, status hutang/piutang. | 1 | US-007 |
| **FR-002** | Sistem menyediakan **form Tambah Transaksi**: pilih kategori, instansi rekanan, dan **tambah/edit/hapus item barang** (multi-item). | 1 | US-001 |
| **FR-003** | Saat simpan, sistem **generate No Peminjaman unik** dan menyimpan transaksi (header + detail item). | 1 | BR-001 |
| **FR-004** | Sistem **memvalidasi ketersediaan stok** untuk kategori Pinjam Keluar sebelum eksekusi. [PERLU KONFIRMASI batas minus] | 1 | BR-007 |
| **FR-005** | Sistem **mengeksekusi update stok** sesuai kategori (Masuk +, Keluar −) dan mencatat **pergerakan HPP**. Phase 1: dieksekusi saat pengajuan. | 1 | BR-003, BR-006 |
| **FR-006** | Sistem menyediakan aksi **Setuju/Tolak** (Phase 2 via fitur Persetujuan); penolakan **wajib alasan** dan tidak mengubah stok. | 2 | BR-004, BR-005 |
| **FR-007** | Sistem menyediakan **proses Pengembalian Barang**: input jumlah dikembalikan per item → update stok & status barang (Dibayar/Diterima). | 1 | BR-008 |
| **FR-008** | Sistem menghitung dan menampilkan **status hutang/piutang per barang** serta status transaksi (Lunas bila seluruh item selesai). | 1 | BR-009 |
| **FR-009** | Sistem menyediakan **proses Pengembalian Uang**: input nilai → status Menunggu Pembayaran → diselesaikan Keuangan (Dibayar/Diterima). | 2 | BR-010 |
| **FR-010** | Sistem menyediakan **pencarian & filter** (No Peminjaman, instansi, kategori, status, rentang tanggal) dengan respons < 3 detik. | 1 | US-007 |
| **FR-011** | Sistem menampilkan **halaman Detail Transaksi** lengkap dengan item, riwayat eksekusi & pengembalian. | 1 | US-007 |
| **FR-012** | Sistem **membuat bukti transaksi** (cetak/PDF) per peminjaman/pengembalian. | 3 | Scope Phase 3 |
| **FR-013** | Sistem **membentuk jurnal otomatis** (persediaan, hutang/piutang, HPP) saat eksekusi & penyelesaian. | 3 | BR-011 |

## 11. Data Requirements (Spesifikasi Field)

### 11.1. Form Tambah/Edit Transaksi Peminjaman — Header (INPUT) — *FR-002, FR-003*

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_peminjaman | No Peminjaman | text | Ya | unik, auto, pola `PJM-YYYYMM-#####` [PERLU KONFIRMASI] | auto-generate | read-only; terisi saat simpan (BR-001) |
| kategori_peminjaman | Kategori Peminjaman | dropdown | Ya | enum: `Pinjaman Masuk` / `Pinjaman Keluar` | enum | menentukan hutang/piutang (BR-002) |
| instansi_id | Instansi Rekanan | lookup | Ya | dari Master Instansi Rekanan | lookup master | instansi peminjam/pemberi pinjaman |
| tgl_peminjaman | Tanggal Peminjaman | date | Ya | <= hari ini | default hari ini | |
| unit | Unit/Instalasi | dropdown(lookup) | Ya | dari master Unit (A3) | lookup A3 | konsisten field kanonik `unit` |
| estimasi_tgl_kembali | Estimasi Tgl Kembali | date | Tidak | >= tgl_peminjaman | manual | [ASUMSI] |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik `keterangan` |
| status_peminjaman | Status Peminjaman | dropdown | Ya | enum: Draft/Diajukan/Disetujui/Ditolak/Lunas | default sesuai alur | Phase 1 auto = Disetujui (BR-006) |

### 11.2. Detail Item Barang Transaksi (INPUT, multi-row) — *FR-002*

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_barang | Kode Barang | lookup | Ya | dari Master Barang Farmasi; pola `RT-#####` [PERLU KONFIRMASI] | lookup master | field kanonik `kode_barang` |
| nama_barang | Nama Barang | text | Ya | maks 150 char | autofill dari master | field kanonik `nama_barang` (read-only) |
| satuan | Satuan | text | Ya | dari master item | autofill | field kanonik `satuan` (read-only) |
| jumlah | Jumlah Pinjam | number | Ya | > 0; ≤ stok (jika Pinjam Keluar) | manual | BR-007 |
| harga_satuan | Harga Satuan (HPP) | number | Tidak | ≥ 0, format Rp | autofill master/HPP | dasar nilai jurnal (Phase 3) |
| status_hutang_piutang | Status (per barang) | dropdown | Ya | enum: Hutang/Piutang/Dibayar/Diterima | auto by kategori | BR-003, BR-009 (read-only) |

### 11.3. Form Pengembalian Barang (INPUT) — *FR-007*

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_peminjaman_ref | No Peminjaman | lookup | Ya | transaksi berstatus belum Lunas | lookup transaksi | referensi induk |
| kode_barang | Barang Dikembalikan | lookup | Ya | hanya item pada transaksi tsb | dari detail transaksi | |
| jumlah_kembali | Jumlah Dikembalikan | number | Ya | > 0; ≤ sisa hutang/piutang barang | manual | BR-012 |
| tgl_pengembalian | Tanggal Pengembalian | date | Ya | <= hari ini | default hari ini | |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik `keterangan` |

### 11.4. Form Pengembalian Uang (INPUT) — *FR-009 (Phase 2)*

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_peminjaman_ref | No Peminjaman | lookup | Ya | transaksi belum Lunas | lookup transaksi | |
| nilai_pengembalian | Nilai Pengembalian | number | Ya | > 0, format Rp; ≤ sisa nilai | manual | |
| metode | Metode | dropdown | Tidak | enum: Transfer/Tunai [PERLU KONFIRMASI] | enum | |
| status_pembayaran | Status Pembayaran | dropdown | Ya | enum: Menunggu Pembayaran/Dibayar/Diterima | default Menunggu Pembayaran | diselesaikan Keuangan (BR-010) |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | |

### 11.5. Form Persetujuan (INPUT) — *FR-006 (Phase 2)*

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keputusan | Keputusan | dropdown | Ya | enum: Setuju/Tolak | enum | field kanonik `keputusan` |
| alasan_penolakan | Alasan Penolakan | text | Ya jika Tolak | maks 255 char | manual | wajib bila Tolak (BR-005) |

### 11.6. Dashboard / List Transaksi (TAMPIL DATA) — *FR-001, FR-010*

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No Peminjaman | transaksi.no_peminjaman | text | sort, search | klik → detail |
| Tgl Peminjaman | transaksi.tgl_peminjaman | dd-mm-yyyy | sort, filter rentang | default sort terbaru |
| Instansi Rekanan | master_instansi.nama | text | filter | |
| Kategori | transaksi.kategori_peminjaman | badge (Masuk/Keluar) | filter | |
| Status Peminjaman | transaksi.status_peminjaman | badge berwarna | filter | Ditolak=merah, Lunas=hijau |
| Status Hutang/Piutang | agregasi item | badge (Hutang/Piutang/Lunas) | filter | per transaksi |
| Total Nilai | sum(item.jumlah×harga_satuan) | Rp | sort | |

### 11.7. Daftar Barang Transaksi / Status Hutang-Piutang (TAMPIL DATA) — *FR-008*

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Barang | item.nama_barang | text | sort A-Z, search | |
| Instansi | master_instansi.nama | text | filter | rekonsiliasi per instansi |
| Jumlah Pinjam | item.jumlah | number | sort | |
| Sisa Hutang/Piutang | jumlah − Σ dikembalikan | number | filter (>0) | acuan pengembalian |
| Status | item.status_hutang_piutang | badge | filter | Hutang/Piutang/Dibayar/Diterima |
| Nilai | item.jumlah×harga_satuan | Rp | sort | |

## 12. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| **NFR-001** | **Performa pencarian** transaksi | Hasil < **3 detik** (Metrics #3) |
| **NFR-002** | **Integritas stok** | Update stok bersifat **atomik/transaksional** dengan pembentukan transaksi; tidak boleh terjadi update parsial saat gagal |
| **NFR-003** | **Audit trail** | Setiap perubahan status (diajukan/disetujui/ditolak/pengembalian/lunas) tercatat dengan user & timestamp |
| **NFR-004** | **Hak akses (RBAC)** | Pengajuan oleh Petugas Gudang; persetujuan oleh Kepala Gudang (Phase 2); penyelesaian uang oleh Keuangan [ASUMSI] |
| **NFR-005** | **Akurasi nilai** | Nilai transaksi & jurnal konsisten dengan HPP master barang (Phase 3) |
| **NFR-006** | **Ketersediaan** | Mengingat internet RS tipe C&D tidak stabil, operasi tulis harus tahan retry/idempoten [ASUMSI; PERLU KONFIRMASI kebutuhan offline] |
| **NFR-007** | **Usability** | Form multi-item mudah (tambah/edit/hapus baris) sesuai pola Inventory lain |

## 13. Integrasi Eksternal

Modul ini **tidak** berintegrasi langsung dengan layanan eksternal nasional (BPJS/SATUSEHAT/Disdukcapil) — transaksi bersifat internal antar-instansi. Integrasi bersifat **internal SIMRS**:

| No | Integrasi | Arah | Phase | Keterangan |
|----|-----------|------|-------|------------|
| 1 | **Master Barang Farmasi** | Konsumsi (lookup) | 1 | Sumber `kode_barang`, `nama_barang`, `satuan`, HPP |
| 2 | **Master Instansi Rekanan** | Konsumsi (lookup) | 1 | Sumber instansi peminjam/pemberi pinjaman |
| 3 | **Informasi Stok (H4) / Mutasi Stok (H5)** | Tulis (+/−) | 1 | Eksekusi & pengembalian memperbarui stok + pergerakan HPP |
| 4 | **Pengaturan & Persetujuan Peminjaman Barang** | Konsumsi alur | 2 | Out Scope modul ini; modul memanggil/menerima status approval |
| 5 | **Keuangan — Daftar Jurnal (Jurnal Otomatis)** | Tulis (posting) | 3 | Posting persediaan, hutang/piutang, HPP |
| 6 | **Keuangan — Pembayaran/Penerimaan** | Dua arah (ajukan/terima status) | 2 | Pengembalian uang → status Dibayar/Diterima |
| 7 | **Akuntansi/Billing** | Konsumsi nilai | 3 | Nilai transaksi terhubung untuk rekonsiliasi |

> Catatan SATUSEHAT/BPJS: tidak relevan untuk transaksi pinjam-meminjam barang internal. [ASUMSI]

## Asumsi
- [ASUMSI] Modul belum punya BPMN sendiri; alur As-Is/To-Be diturunkan dari Lampiran PRD + analogi BPMN Inventory (distribusi, penerimaan) dan pengembalian farmasi (g-support-pharmacy-return-ri).
- [ASUMSI] Phase 1: persetujuan auto-approve dan update stok dilakukan saat pengajuan, agar realistis untuk RS tipe C&D dengan SDM terbatas.
- [ASUMSI] Aktor utama = Petugas Gudang (pengajuan & pengembalian barang); Kepala Gudang (approval Phase 2); Keuangan (penyelesaian uang & jurnal Phase 2-3).
- [ASUMSI] Field kanonik lintas-PRD (keterangan, unit, satuan, kode_barang, nama_barang, keputusan) dipakai dengan definisi yang sama; perbedaan pola kode_barang ditandai [PERLU KONFIRMASI].
- [ASUMSI] Status transaksi menjadi 'Lunas' hanya bila seluruh item/nilai telah dikembalikan/diselesaikan.
- [ASUMSI] Tidak ada integrasi eksternal nasional (BPJS/SATUSEHAT/Disdukcapil); integrasi bersifat internal SIMRS.

## Pertanyaan Terbuka
- Pola No Peminjaman yang diinginkan? (mis. PJM-YYYYMM-##### atau lainnya) [PERLU KONFIRMASI]
- Apakah stok boleh menjadi minus saat Pinjam Keluar bila stok tidak mencukupi, atau pengajuan diblokir? (BR-007/FR-004)
- Siapa aktor approval Phase 2 — hanya Kepala Gudang atau berjenjang sesuai Pengaturan?
- Apakah pengembalian campuran (sebagian barang + sebagian uang) untuk satu transaksi diperbolehkan?
- Metode pengembalian uang (Transfer/Tunai) dan apakah perlu mencatat nomor referensi pembayaran?
- Format & isi bukti transaksi (Phase 3) — apakah perlu tanda tangan/stempel dua instansi?
- Akun COA pasti untuk jurnal otomatis persediaan/hutang/piutang/HPP (koordinasi modul Keuangan).