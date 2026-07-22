# PRD — Inventory: Penerimaan Barang

**Related Document:** Template Unduh Excel Penerimaan Barang; PRD Pemesanan Barang [H1]; PRD Informasi Stok [H4]; BPMN g-backoffice-inventory-penerimaan.json; List Fitur V2 (sheet MVP, code H2)
**Versi:** 1.3 - Revisi konfirmasi stakeholder (default HPP & fase)

## 1. Overview / Brief Summary

Fitur **Penerimaan Barang** (Backoffice > Inventory, code **H2**) digunakan untuk mencatat dan memverifikasi seluruh barang yang diterima rumah sakit dari supplier berdasarkan **Surat Pemesanan Barang (SP)** yang telah dibuat sebelumnya pada modul Pemesanan Barang [H1].

Tujuan utama:
- Memastikan barang yang diterima sesuai dengan yang dipesan (jumlah, jenis, harga).
- Mendukung pencatatan terdokumentasi & audit trail untuk proses pengadaan.
- Menyiapkan data dasar bagi pembaruan stok (modul Informasi Stok [H4]) dan pencatatan jurnal/keuangan.

Fitur memungkinkan user (Gudang) menerima barang sesuai **kondisi penerimaan sesungguhnya** — bisa **Penuh** (full) maupun **Partial** (bertahap atas SP yang sama).

> **Pembaruan stok**: Fase 1 **sudah memperbarui stok riil** melalui modul Informasi Stok [H4] yang dokumennya telah selesai. Penerimaan barang yang difinalisasi langsung menambah stok gudang terkait.

## 2. Background

Sebelum adanya fitur penerimaan barang terintegrasi, verifikasi barang dilakukan manual menggunakan dokumen fisik (surat jalan & faktur) tanpa keterhubungan ke sistem pemesanan. Masalah yang timbul (sumber: Lampiran Dokumen):

1. Tidak ada sinkronisasi data antara pemesanan dan penerimaan barang.
2. Keterlambatan update stok karena pencatatan dilakukan beberapa hari setelah penerimaan.
3. Kesalahan data — barang diterima tidak sesuai pesanan namun tidak tercatat.
4. Kesulitan audit dan pelacakan dokumen penerimaan.

Dengan fitur ini, setiap penerimaan mengacu langsung pada SP di sistem; penerimaan memperbarui status pemesanan otomatis sehingga mengurangi risiko kesalahan dan mempercepat administrasi gudang.

**Konsentrasi sistem (satu kesatuan):**
- Penerimaan barang mengambil data Pemesanan Barang [H1].
- Total tagihan perlu disesuaikan bila terdapat **Down Payment (DP)** dari Keuangan.
- Membentuk **Jurnal Otomatis** (kebutuhan Keuangan) — *Fase 3*.
- Model perhitungan **HPP**: **Average** dan **FIFO**, dipilih pada menu Setting; **default = Average** (Moving Average) untuk RS tipe C & D.
- Status RS sebagai **PKP / Non-PKP** memengaruhi PPN → berdampak pada nilai HPP (diakses di menu Setting).
- **Biaya Tambahan** per transaksi pembelian dapat di-*include* ke HPP atau tidak — diatur melalui **konfigurasi di Pengaturan Inventory** (modul terpisah).
- **Pengaturan Pajak (PPN)** menjadi fitur tersendiri (nama pajak, objek, tarif).

> Konteks RS Tipe C & D: SDM IT terbatas, internet bisa tidak stabil. Form penerimaan harus sederhana, banyak field auto-fill dari SP, dan toleran terhadap penyimpanan **Draft**.

## 3. In Scope

### Scope Definition (Fase 1 — fokus PRD ini)
| No | Scope / Area | Fase |
|----|--------------|------|
| 1 | Akses Menu: Inventaris → Penerimaan Barang | Phase 1 |
| 2 | Dashboard / List Penerimaan Barang | Phase 1 |
| 3 | Input Penerimaan Barang dari Data Pemesanan Barang (SP) | Phase 1 |
| 4 | Update Data Penerimaan Barang | Phase 1 |
| 5 | Draft Penerimaan Barang | Phase 1 |
| 6 | Detail Penerimaan Barang | Phase 1 |
| 7 | Penerimaan Penuh & Partial (multi-penerimaan atas 1 SP) | Phase 1 |
| 8 | Update stok riil saat penerimaan difinalisasi (via Informasi Stok [H4]) | Phase 1 |

### Cakupan Fase berikutnya (dicatat, di luar fokus utama)
| No | Scope | Fase |
|----|-------|------|
| 1 | Void Penerimaan Barang | Phase 2 |
| 2 | Unduh/Ekspor Faktur Penerimaan Barang | Phase 2 |
| 3 | Jurnal Otomatis Penerimaan Barang | Phase 2 |
| 4 | Dashboard Visual Penerimaan Barang | Phase 2 |
| 5 | Riwayat Transaksi | Phase 3 |

### Out Scope
| No | Scope |
|----|-------|
| 1 | Fitur Rencana Pengadaan Barang [H10] |
| 2 | Fitur Pemesanan Barang [H1] (hanya dikonsumsi datanya) |
| 3 | Update status di modul Keuangan saat transaksi penerimaan (Phase 2) |

## 4. Goals and Metrics

### Goals
1. Memastikan penerimaan barang dilakukan berdasarkan SP yang sudah terdaftar di sistem.
2. Menyediakan mekanisme verifikasi kesesuaian barang antara yang dipesan dan diterima.
3. Memperbarui status pemesanan (mis. "Sudah Diterima" / "Diterima Sebagian") secara otomatis.
4. Mengurangi waktu & kesalahan pencatatan manual.
5. Memungkinkan pencarian/filter penerimaan berdasarkan supplier, tanggal, status.
6. Menstandarkan proses penerimaan barang di seluruh gudang.
7. Memperbarui stok secara real-time setelah penerimaan difinalisasi (via Informasi Stok [H4]).

### Metrics
| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Akurasi data antar modul | 100% data Rencana–Pemesanan–Penerimaan konsisten & sinkron |
| 2 | Transparansi proses pengadaan | Semua transaksi punya audit trail lengkap (user, tanggal, aktivitas) |
| 3 | Otomatisasi input data | Data terisi otomatis dari relasi antar modul, kecuali yang wajib manual |
| 4 | Efisiensi pengelolaan supplier & stok | Sistem dapat menghasilkan laporan kebutuhan & realisasi pengadaan real-time |
| 5 | Integrasi data | Data penerimaan tersinkron dengan modul Keuangan & Persediaan (Fase 3+) |
| 6 | [ASUMSI] Waktu pencatatan penerimaan | < 5 menit per dokumen penerimaan (turun dari proses manual harian) |

## 5. Related Feature

Fitur terkait dalam cluster **Backoffice > Inventory** (List Fitur sheet MVP):

| Code | Menu | Relasi dengan H2 |
|------|------|------------------|
| H1 | Pemesanan Barang | **Sumber data** SP yang diterima (hulu) |
| **H2** | **Penerimaan Barang** | **Modul ini** |
| H3 | Distribusi Barang | Konsumen stok hasil penerimaan (hilir) |
| H4 | Informasi Stok | Penerima update stok hasil penerimaan (Phase 1) |
| H5 | Mutasi Stok | Terkait pergerakan stok lanjutan |
| H6 | Stok Opname | Rekonsiliasi stok |
| H8 | Retur Pembelian | Tindak lanjut barang tidak sesuai dari penerimaan |
| H10 | Rencana Pengadaan Barang | Hulu pengadaan (Out Scope) |
| H11 | Penggunaan Barang Unit | Konsumsi stok |

Keterkaitan lintas-cluster:
- **Master Supplier** (Form Tambah/Edit Supplier) — sumber data supplier pada penerimaan.
- **Master Barang / Barang Rumah Tangga** — sumber `kode_barang`, `nama_barang`, `satuan`, `kategori`.
- **Keuangan** — konsumen data penerimaan untuk DP / SPM (Surat Perintah Membayar) dan jurnal.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) — [ASUMSI] berdasarkan Background
1. Barang dikirim supplier disertai surat jalan & faktur fisik.
2. Petugas Gudang mencocokkan barang dengan dokumen fisik secara manual.
3. Pencatatan ke buku/ spreadsheet dilakukan terpisah, sering tertunda beberapa hari.
4. Tidak ada keterhubungan ke SP di sistem → status pemesanan tidak terupdate.
5. Selisih (kurang/lebih/tidak sesuai) sering tidak tercatat → sulit audit.

### B. To-Be (kondisi diharapkan) — turunan langsung BPMN
1. Petugas Gudang membuka menu **Inventory → Penerimaan Barang**.
2. Sistem menampilkan **list pemesanan barang (SP)** yang siap diterima pada dashboard.
3. Petugas membuka **detail** satu SP → sistem menampilkan **list item pemesanan**.
4. Bila **tidak ada perubahan data** → langsung mengisi form penerimaan.
5. Bila **ada perubahan data** → petugas dapat **Edit jumlah**, **Input item tambahan**, atau **Hapus item** sebelum menyimpan.
6. Petugas **Simpan data** penerimaan.
7. Sistem **memvalidasi** apakah penerimaan **Penuh** atau **Partial**:
   - **Penuh** → no. SP **tidak dapat** dipakai lagi untuk penerimaan berikutnya (SP closed).
   - **Partial** → no. SP **masih dapat** dipakai untuk penerimaan berikutnya (sisa item).
8. Keuangan **menerima data penerimaan** untuk pemrosesan **DP atau SPM**.
9. Selesai — penerimaan tercatat, status SP terupdate, **stok bertambah otomatis** via Informasi Stok [H4]. [Fase berikut: jurnal otomatis ke Keuangan.]

## 7. Main Flow / Mindmap

Narasi alur (urut dari start, sesuai BPMN `g-backoffice-inventory-penerimaan.json`):

**Skenario A — Penerimaan tanpa perubahan data**
1. `Mulai` → Buka menu **Inventory - Penerimaan Barang**.
2. Sistem menampilkan **list pemesanan barang (SP)** pada dashboard.
3. Petugas **lihat detail** salah satu SP → sistem menampilkan **list item pemesanan**.
4. Gateway **"ada perubahan data?"** → **tidak** → **Mengisi form penerimaan pemesanan**.
5. **Simpan data**.
6. Sistem **memvalidasi penuh / partial** → petugas **memilih jenis penerimaan**.
7. Gateway jenis penerimaan:
   - **Penerimaan Penuh** → no. SP tidak dapat dipakai lagi → **Keuangan menerima data untuk DP/SPM** → `Selesai`.
   - **Penerimaan Partial** → no. SP dapat dipakai lagi → **Keuangan menerima data untuk DP/SPM** (SP tetap terbuka untuk sisa).

**Skenario B — Penerimaan dengan perubahan data**
1. Langkah 1–3 sama seperti Skenario A.
2. Gateway **"ada perubahan data?"** → **ya** → masuk gateway aksi edit:
   - **Edit jumlah** item.
   - **Input item tambahan**.
   - **Hapus item**.
3. Setelah perubahan → **Simpan data** → lanjut validasi penuh/partial (sama langkah 6–7 Skenario A).

```
[Mulai]
  → Buka menu Penerimaan Barang
  → List SP (dashboard)
  → Detail SP → List item pemesanan
  → {ada perubahan data?}
       ├─ Tidak → Isi form penerimaan ──┐
       └─ Ya → (Edit jumlah / Input item tambahan / Hapus item) ──┐
                                                                   ▼
                                                            [Simpan data]
  → {Validasi: Penuh / Partial?}
       ├─ Penuh   → SP ditutup (no. SP tidak bisa dipakai lagi)
       └─ Partial → SP tetap terbuka (no. SP bisa dipakai lagi)
  → Keuangan terima data (DP / SPM)
  → [Selesai]
```

## 8. Business Rules

| ID | Aturan | Sumber (task BPMN / dokumen) |
|----|--------|------------------------------|
| BR-001 | Penerimaan barang **harus** mengacu pada SP yang sudah terdaftar & berstatus dapat diterima. | "Sistem menampilkan list pemesanan barang" |
| BR-002 | Jika **Penerimaan Penuh**, no. SP **tidak dapat** digunakan untuk penerimaan berikutnya (SP berstatus selesai/closed). | Gateway #4 "Penerimaan Penuh" |
| BR-003 | Jika **Penerimaan Partial**, no. SP **dapat** digunakan untuk penerimaan berikutnya hingga seluruh item terpenuhi. | Gateway #4 "Penerimaan Partial" |
| BR-004 | Jumlah diterima per item **harus sesuai faktur** yang diberikan supplier. **Over-receipt diperbolehkan** (jumlah diterima boleh melebihi jumlah dipesan pada SP) selama sesuai faktur, tanpa perlu approval khusus. | "Edit jumlah" + faktur supplier |
| BR-005 | Petugas dapat menambah item di luar SP (**Input item tambahan**) bila barang fisik diterima lebih banyak/berbeda — **tanpa perlu persetujuan** atasan/Keuangan. | "Input item tambahan" |
| BR-006 | Petugas dapat **menghapus item** dari daftar penerimaan bila item tidak jadi diterima. | "Hapus item" |
| BR-007 | Penerimaan dapat disimpan sebagai **Draft** sebelum difinalisasi. | Scope "Draft Penerimaan Barang" |
| BR-008 | Penerimaan final **mengubah status SP** otomatis sesuai enum kanonik **Belum Diterima → Diterima Sebagian → Diterima Penuh** (lihat §8.1). Enum & transisi **wajib selaras dengan modul Pemesanan Barang [H1]** sebagai sumber kebenaran status SP. | "Sistem memvalidasi penuh/partial" + H1 |
| BR-009 | Setiap transaksi penerimaan wajib mencatat **audit trail** (user, tanggal/jam, aktivitas). | Metrik #2 Transparansi |
| BR-010 | Jika terdapat **DP** pada SP, total tagihan penerimaan disesuaikan (dikurangi DP). | Background — penyesuaian DP |
| BR-011 | Perhitungan **HPP** mengikuti model yang dipilih di Setting (**Average / FIFO**, **default = Average**); status **PKP/Non-PKP** memengaruhi nilai HPP. **Biaya Tambahan** di-*include* ke HPP atau tidak sesuai **konfigurasi di Pengaturan Inventory** (modul terpisah). *(Fase berikut, dependensi Setting)* | Background — HPP/PKP |
| BR-012 | Penerimaan yang difinalisasi **memperbarui stok riil** melalui modul Informasi Stok [H4] (dokumen H4 telah selesai). | Lampiran Dokumen + Informasi Stok [H4] |
| BR-013 | **No. Batch wajib** diisi untuk **semua barang**. **Tanggal Kedaluwarsa wajib** hanya untuk **barang farmasi**, opsional untuk barang lain. | Konfirmasi stakeholder |
| BR-014 | **No. Faktur wajib** diisi untuk **semua penerimaan**, tanpa memandang status RS (PKP maupun Non-PKP); penerimaan harus sesuai faktur supplier. | Konfirmasi stakeholder |
| BR-015 | Sistem **menandai (flag) perbedaan** antara SP dan penerimaannya (item tambahan di luar SP, qty berbeda / over-receipt) pada dokumen penerimaan & detailnya untuk transparansi — **tanpa memblokir** proses & **tanpa approval**. | Konfirmasi stakeholder (BR-004/BR-005) |

### 8.1 Enum & Transisi Status SP (selaras dengan Pemesanan [H1])
Status SP pasca-penerimaan memakai enum kanonik berikut — **sumber kebenaran = modul Pemesanan Barang [H1]**; H2 hanya mengubah status sesuai hasil penerimaan:

| Nilai Status | Makna | Pemicu |
|--------------|-------|--------|
| `Belum Diterima` | SP terbit, belum ada penerimaan | default saat SP dibuat (H1) |
| `Diterima Sebagian` | Sebagian item/qty sudah diterima, masih ada sisa | penerimaan **Partial** (BR-003) |
| `Diterima Penuh` | Seluruh item/qty SP terpenuhi | penerimaan **Penuh** / sisa = 0 (BR-002) |

Transisi maju: `Belum Diterima → Diterima Sebagian → Diterima Penuh` (tidak mundur kecuali Void — Fase 2). [PERLU KONFIRMASI: nama enum final agar identik dengan implementasi H1 saat PRD H1 dibuat.]

## 9. User Stories

| ID | User Story | Traceability (task BPMN) |
|----|-----------|--------------------------|
| US-001 | Sebagai **Petugas Gudang**, saya ingin melihat daftar SP yang siap diterima di dashboard, agar saya tahu pesanan mana yang perlu diproses. | "Sistem menampilkan list pemesanan barang pada dashboard" |
| US-002 | Sebagai **Petugas Gudang**, saya ingin membuka detail SP dan melihat list item pemesanan, agar saya dapat mencocokkan dengan barang fisik. | "Lihat detail" + "Sistem menampilkan list item pemesanan" |
| US-003 | Sebagai **Petugas Gudang**, saya ingin mengisi form penerimaan ketika barang sesuai pesanan, agar penerimaan cepat tercatat. | "Mengisi form penerimaan pemesanan" |
| US-004 | Sebagai **Petugas Gudang**, saya ingin mengedit jumlah item bila barang yang datang berbeda, agar data penerimaan akurat. | "Edit jumlah" |
| US-005 | Sebagai **Petugas Gudang**, saya ingin menambah item di luar SP, agar barang tambahan yang diterima tetap tercatat. | "Input item tambahan" |
| US-006 | Sebagai **Petugas Gudang**, saya ingin menghapus item yang tidak jadi diterima, agar dokumen penerimaan mencerminkan kondisi nyata. | "Hapus item" |
| US-007 | Sebagai **Petugas Gudang**, saya ingin menyimpan penerimaan sebagai Draft, agar bisa melanjutkan pengisian nanti. | Scope "Draft" |
| US-008 | Sebagai **Petugas Gudang**, saya ingin sistem memvalidasi penerimaan penuh/partial, agar status SP terkelola otomatis. | "Sistem memvalidasi penuh/partial" |
| US-009 | Sebagai **Petugas Gudang**, saya ingin melakukan penerimaan partial atas SP yang sama, agar pengiriman bertahap dari supplier bisa diakomodasi. | Gateway "Penerimaan Partial" |
| US-010 | Sebagai **Staf Keuangan**, saya ingin menerima data penerimaan untuk DP/SPM, agar pembayaran ke supplier dapat diproses. | "Menerima data penerimaan untuk DP atau SPM" |
| US-011 | Sebagai **Manajemen**, saya ingin melihat riwayat & audit trail penerimaan, agar proses pengadaan transparan dan dapat diaudit. | Metrik #2 |

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-001 | Sistem menampilkan **dashboard/list SP** yang dapat diterima, dengan pencarian (No Faktur dan No SP) & filter (supplier, tanggal, status). | US-001, BR-001 |
| FR-002 | Sistem menampilkan **detail SP** beserta **list item** (kode barang, nama, jumlah dipesan, sisa, satuan, harga). | US-002 |
| FR-003 | Sistem menyediakan **form penerimaan** dengan field auto-fill dari SP (lihat Data Requirements). | US-003 |
| FR-004 | Sistem mengizinkan **edit jumlah diterima** per item sesuai faktur supplier; **over-receipt diperbolehkan** (BR-004). | US-004, BR-004 |
| FR-005 | Sistem mengizinkan **penambahan item** di luar SP **tanpa approval**, dan **menandai perbedaan** item/jumlah penerimaan vs SP (BR-015). | US-005, BR-005, BR-015 |
| FR-006 | Sistem mengizinkan **penghapusan item** dari daftar penerimaan. | US-006, BR-006 |
| FR-007 | Sistem mendukung **simpan Draft** dan **simpan final** penerimaan. | US-007, BR-007 |
| FR-008 | Saat simpan final, sistem **memvalidasi penuh/partial** dan **memperbarui status SP** otomatis. | US-008, BR-002, BR-003, BR-008 |
| FR-009 | Untuk **partial**, sistem mempertahankan no. SP agar dapat menerima sisa item pada penerimaan berikutnya. | US-009, BR-003 |
| FR-010 | Sistem **menyediakan data penerimaan ke Keuangan** untuk DP/SPM (penyesuaian DP pada total tagihan). | US-010, BR-010 |
| FR-011 | Sistem mencatat **audit trail** setiap aksi penerimaan (buat, edit, hapus, finalisasi). | US-011, BR-009 |
| FR-012 | Sistem menampilkan **detail penerimaan** yang telah dibuat (read-only) untuk verifikasi. | Scope "Detail Penerimaan" |
| FR-013 | [Fase berikut] Sistem menghitung **HPP (Average/FIFO)** dengan mempertimbangkan PKP/Non-PKP & konfigurasi Biaya Tambahan (Pengaturan Inventory). | BR-011 |
| FR-014 | Sistem memicu **update stok** ke Informasi Stok [H4] saat penerimaan difinalisasi. | BR-012 |
| FR-015 | [Phase 2] Sistem memicu **jurnal otomatis** ke Keuangan. | BR-011 |
| FR-016 | Sistem mendukung **input & simpan penerimaan secara offline** (data tersimpan lokal saat tanpa koneksi) dan **sinkronisasi otomatis ke server saat online** — termasuk update stok [H4] & data Keuangan — dengan penanganan konflik/duplikasi (nomor penerimaan idempoten, antrian sync, deteksi bentrok). | NFR-003 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar TAMPIL — Dashboard / List Penerimaan & List SP (FR-001)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. SP | pemesanan.no_sp | text | sort, cari | dari modul Pemesanan [H1] |
| No. Faktur | penerimaan.no_faktur | text | **cari** | hanya pada list penerimaan (kosong utk SP belum diterima); searchable sesuai FR-001 (BR-014) |
| Tanggal SP | pemesanan.tgl_sp | tanggal (dd-mm-yyyy) | sort (default terbaru) | |
| Supplier | master_supplier.nama_supplier | text | filter | lookup master supplier |
| Total Item | count item SP | angka | – | |
| Status SP | pemesanan.status | badge (Belum Diterima / Diterima Sebagian / Diterima Penuh) | filter | warna berbeda per status |
| Jenis Penerimaan | penerimaan.jenis | badge (Penuh / Partial) | filter | hanya pada list penerimaan |
| Aksi | – | tombol (Lihat detail / Terima) | – | |

### B. Layar TAMPIL — Detail SP / List Item Pemesanan (FR-002)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Kode Barang | master_barang.kode_barang | text | sort | |
| Nama Barang | master_barang.nama_barang | text | sort A-Z | |
| Kategori | kategori | text | filter | field kanonik `kategori` |
| Jumlah Dipesan | item_sp.qty_pesan | number | – | |
| Jumlah Sudah Diterima | agregasi penerimaan | number | – | akumulasi penerimaan partial |
| Sisa | qty_pesan − sudah diterima | number | – | info sisa; over-receipt diperbolehkan (BR-004) |
| Satuan | satuan | text | – | field kanonik `satuan` (autofill) |
| Harga Satuan | item_sp.harga | mata uang (Rp) | – | |

### C. Layar INPUT — Form Header Penerimaan (FR-003)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_penerimaan | No. Penerimaan | text | Ya | unik, auto-generate | auto | nomor dokumen penerimaan |
| no_sp | No. SP | lookup | Ya | harus SP valid & dapat diterima | auto dari pilihan SP | BR-001 |
| supplier | Supplier | lookup | Ya | dari master supplier | autofill dari SP | field entitas Supplier |
| tgl_penerimaan | Tanggal Penerimaan | date | Ya | <= hari ini | default hari ini | |
| no_surat_jalan | No. Surat Jalan | text | Tidak | maks 50 char | manual | dokumen fisik supplier |
| no_faktur | No. Faktur | text | **Ya** | maks 50 char | manual | wajib untuk semua penerimaan, semua status RS (BR-014) |
| jenis_penerimaan | Jenis Penerimaan | dropdown | Ya | Penuh / Partial | enum (default dihitung sistem) | BR-002/BR-003 |
| nilai_dp | Nilai DP | number | Tidak | >= 0, mata uang (Rp) | dari Keuangan/SP | BR-010, penyesuaian tagihan |
| biaya_tambahan | Biaya Tambahan | number | Tidak | >= 0, mata uang (Rp) | manual | include ke HPP sesuai konfigurasi Pengaturan Inventory (BR-011) |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | **field kanonik** `keterangan` |
| status_dokumen | Status | dropdown | Ya | Draft / Final | default Draft | BR-007 |
| nama_penerima | Penerima | lookup | Ya | dari master Staff | autofill dari user login | **field kanonik** `nama`/`nip` (Staff) |

### D. Layar INPUT — Baris Item Penerimaan (FR-004/005/006)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_barang | Kode Barang | lookup | Ya | dari master barang | autofill dari SP / pilih utk item tambahan | FR-005 |
| nama_barang | Nama Barang | text | Ya | – | autofill | |
| qty_pesan | Jumlah Dipesan | number | – | read-only | dari SP | |
| qty_terima | Jumlah Diterima | number | Ya | > 0; sesuai faktur supplier, boleh > sisa pesan (BR-004) | manual | FR-004 |
| satuan | Satuan | text | Ya | dari master item | autofill | **field kanonik** `satuan` |
| harga_satuan | Harga Satuan | number | Ya | >= 0, mata uang (Rp) | autofill dari SP / manual | |
| no_batch | No. Batch | text | **Ya** | maks 50 char | manual | wajib untuk semua barang (BR-013) |
| tgl_kedaluwarsa | Tanggal Kedaluwarsa | date | Bersyarat | > hari ini | manual | **wajib untuk barang farmasi**, opsional untuk barang lain (BR-013) |
| subtotal | Subtotal | number | – | qty_terima × harga_satuan | auto-hitung | mata uang (Rp) |
| flag_perbedaan | Tanda Perbedaan | badge | – | sistem-generate bila item di luar SP / qty_terima ≠ qty_pesan | auto | BR-015 (item tambahan / over-receipt) |
| aksi_item | Aksi | button | – | Edit / Hapus | – | FR-004, FR-006 |

### E. Layar TAMPIL — Detail Penerimaan (read-only, FR-012)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Header penerimaan | penerimaan.* | label data | – | semua field header bagian C |
| List item diterima | item_penerimaan.* | tabel | sort kode barang | qty, harga, subtotal |
| Total Tagihan | sum(subtotal) − nilai_dp + biaya_tambahan | mata uang (Rp) | – | biaya tambahan include ke HPP sesuai konfigurasi Pengaturan Inventory (BR-011) |
| Indikator Perbedaan SP | flag_perbedaan per item | badge (Item Tambahan / Over-receipt / Qty Berbeda) | filter | BR-015 |
| Audit Trail | log aktivitas | list (user, tgl, aksi) | sort waktu | BR-009 |

> Field bertanda **field kanonik** mengikuti definisi bersama lintas-PRD (`keterangan`, `satuan`, `nama`, `nip`, `kategori`, `status_aktif`). Entitas `Supplier` & `Barang` mengikuti master di cluster Backoffice.

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-001 | Performa | List SP & list item tampil < 3 detik untuk hingga ~500 baris. [ASUMSI sesuai skala RS C&D] |
| NFR-002 | Usability | Form penerimaan maksimal auto-fill dari SP; minim input manual (Metrik #3). Cocok untuk SDM IT terbatas. |
| NFR-003 | Reliabilitas / Offline | **Wajib mendukung mode offline penuh**: penerimaan barang dapat diinput & disimpan lokal tanpa koneksi, lalu **tersinkronisasi otomatis ke sistem saat online** (termasuk update stok [H4] & data Keuangan). Konflik/duplikasi data saat sync wajib ditangani (lihat FR-016). Mendukung pula **simpan Draft**. |
| NFR-004 | Audit & Keamanan | Semua aksi tercatat audit trail; akses dibatasi role (Gudang, Keuangan, Manajemen). |
| NFR-005 | Integritas Data | Qty terima mengikuti faktur supplier (over-receipt diperbolehkan); status SP konsisten 100% antar penerimaan partial (Metrik #1). |
| NFR-006 | Konsistensi | Penamaan field & format mengikuti kamus lintas-PRD (Rp, tanggal dd-mm-yyyy, enum status). |
| NFR-007 | Skalabilitas | Mendukung multi-penerimaan (partial) atas satu SP tanpa duplikasi data. |
| NFR-008 | Auditability dokumen | Nomor penerimaan unik & dapat ditelusuri ke SP dan dokumen Keuangan (DP/SPM). |

## 13. Integrasi Eksternal

Modul ini bersifat **internal SIMRS** (backoffice) — tidak ada integrasi langsung BPJS/SATUSEHAT/Disdukcapil pada fitur penerimaan barang.

### Integrasi internal antar modul
| Modul | Arah | Data | Fase |
|-------|------|------|------|
| Pemesanan Barang [H1] | Konsumsi (in) | No. SP, supplier, item, qty pesan, harga | Phase 1 |
| Master Supplier | Konsumsi (in) | Data supplier (`kode_supplier`, `nama_supplier`, `npwp`, `status_pkp`, dll) | Phase 1 |
| Master Barang / Barang Rumah Tangga | Konsumsi (in) | `kode_barang`, `nama_barang`, `satuan`, `kategori` | Phase 1 |
| Keuangan | Produksi (out) | Data penerimaan untuk **DP / SPM**, penyesuaian total tagihan | Phase 1 (data) / Phase 2 (jurnal) |
| Pengaturan Inventory / Setting Pajak & HPP | Konsumsi (in) | Model HPP (Average/FIFO, **default Average**), status PKP/Non-PKP, tarif PPN, **konfigurasi include Biaya Tambahan ke HPP** | Phase berikut |
| Informasi Stok [H4] | Produksi (out) | Update stok hasil penerimaan | Phase 1 (BR-012) |
| Jurnal Otomatis (Keuangan) | Produksi (out) | Jurnal penerimaan barang | Phase 2 |

> [PERLU KONFIRMASI] Mekanisme teknis pertukaran data ke Keuangan (event/API internal vs shared DB) belum ditentukan.

## 14. Lampiran — Model & Simulasi Perhitungan HPP (Average vs FIFO)

> **Konteks**: HPP (Harga Pokok Perolehan/Penjualan) dihitung dari nilai penerimaan barang. Modul ini menyiapkan datanya; perhitungan & pemilihan metode final berada di **Pengaturan Inventory** (Fase berikut, BR-011). Lampiran ini menyajikan **model & simulasi** sebagai acuan keputusan default.

### 14.1 Definisi Metode
- **Average (Moving/Weighted Average)** — **metode default**: nilai stok dirata-rata tertimbang. Setiap penerimaan memperbarui harga rata-rata = total nilai stok ÷ total qty. HPP pengeluaran = qty keluar × harga rata-rata terkini.
- **FIFO (First In First Out)**: barang yang masuk lebih dulu dikeluarkan lebih dulu. HPP pengeluaran mengambil harga dari **lapisan (layer) tertua** hingga qty keluar terpenuhi.

### 14.2 Data Simulasi (contoh: Paracetamol 500 mg, satuan tablet)
Penerimaan barang:

| Penerimaan | Tanggal | Qty (tablet) | Harga/unit (Rp) | Nilai (Rp) |
|-----------|---------|--------------|-----------------|------------|
| P1 | 01-06-2026 | 100 | 1.000 | 100.000 |
| P2 | 10-06-2026 | 50 | 1.200 | 60.000 |
| P3 | 20-06-2026 | 100 | 1.100 | 110.000 |
| **Total masuk** | | **250** | | **270.000** |

Pengeluaran (distribusi/penggunaan) 25-06-2026: **120 tablet**.

### 14.3 Skenario A — Agregat (satu pool stok untuk seluruh RS)
Seluruh penerimaan dihimpun dalam **satu pool**; satu nilai HPP per barang untuk semua unit.

**Average** — harga rata-rata = 270.000 ÷ 250 = **Rp 1.080/tablet**
- HPP pengeluaran 120 tablet = 120 × 1.080 = **Rp 129.600**
- Nilai stok akhir 130 tablet = 130 × 1.080 = **Rp 140.400**

**FIFO** — keluar dari lapisan tertua:
- 100 tablet dari P1 @1.000 = 100.000
- 20 tablet dari P2 @1.200 = 24.000
- HPP pengeluaran 120 tablet = **Rp 124.000**
- Nilai stok akhir 130 tablet = 30 (P2 @1.200 = 36.000) + 100 (P3 @1.100 = 110.000) = **Rp 146.000**

| Metode | HPP Pengeluaran (120) | Nilai Stok Akhir (130) | Total |
|--------|----------------------:|-----------------------:|------:|
| Average | 129.600 | 140.400 | 270.000 |
| FIFO | 124.000 | 146.000 | 270.000 |

> Selisih HPP pengeluaran Average vs FIFO = Rp 5.600. Saat harga beli **naik**, FIFO menghasilkan HPP lebih **rendah** & nilai stok akhir lebih **tinggi** dibanding Average.

### 14.4 Skenario B — Multi-unit (pool stok per unit/gudang)
Penerimaan masuk ke unit berbeda; **setiap unit punya pool & HPP sendiri** → barang sama bisa beda HPP antar unit.

Alokasi penerimaan:

| Unit | Penerimaan | Qty | Nilai (Rp) |
|------|-----------|-----|-----------|
| Farmasi Rawat Jalan (RJ) | P1 (100@1.000) + P3 (100@1.100) | 200 | 210.000 |
| Farmasi Rawat Inap (RI) | P2 (50@1.200) | 50 | 60.000 |

Pengeluaran 120 tablet terjadi di **Unit RJ**:

**Average (Unit RJ)** — harga rata-rata RJ = 210.000 ÷ 200 = **Rp 1.050/tablet**
- HPP pengeluaran 120 = 120 × 1.050 = **Rp 126.000**; sisa 80 × 1.050 = Rp 84.000

**FIFO (Unit RJ)** — lapisan RJ (P1 lalu P3):
- 100 dari P1 @1.000 = 100.000 + 20 dari P3 @1.100 = 22.000 = **Rp 122.000**; sisa 80 dari P3 @1.100 = Rp 88.000

Unit RI tanpa pengeluaran → stok 50 tablet senilai Rp 60.000 (Average @1.200 / FIFO lapisan P2).

### 14.5 Perbandingan Agregat vs Multi-unit (pengeluaran 120 tablet yang sama)
| Konteks | HPP Average | HPP FIFO |
|---------|------------:|---------:|
| Agregat (pool tunggal) | 129.600 | 124.000 |
| Multi-unit (Unit RJ) | 126.000 | 122.000 |

> **Insight**: nilai HPP berbeda antar konteks karena **komposisi lapisan harga** di tiap unit berbeda. Pilihan **cakupan perhitungan** (agregat vs multi-unit) **dan** metode (Average vs FIFO) keduanya memengaruhi nilai HPP, biaya distribusi antar-unit, serta laporan persediaan.

### 14.6 Keputusan Default
- **Metode default = Average (Moving Average)** untuk RS tipe **C & D** — lebih praktis (tak perlu melacak lapisan per batch untuk valuasi), sesuai keterbatasan SDM IT. *(ditetapkan stakeholder)*
- **FIFO** tetap tersedia sebagai opsi di Pengaturan Inventory (lebih akurat untuk telusur batch/kedaluwarsa, namun lebih kompleks).
- [ASUMSI] Cakupan perhitungan **multi-unit** (HPP per unit/gudang) dianjurkan; cakupan & metode tetap dapat diubah di **Pengaturan Inventory**. Konfigurasi include **Biaya Tambahan** ke HPP (BR-011) berlaku pada kedua metode.

## Asumsi
- [ASUMSI] Aktor utama penginput penerimaan adalah Petugas Gudang; Keuangan hanya mengonsumsi data untuk DP/SPM.
- [ASUMSI] Kondisi As-Is (dokumen fisik manual, update stok tertunda) diturunkan dari bagian Background dokumen lampiran.
- [ASUMSI] Skala data RS tipe C&D relatif kecil (ratusan SP), sehingga target performa < 3 detik realistis.
- [ASUMSI] Jurnal otomatis, void, ekspor faktur, dan dashboard visual berada di luar fokus Fase 1 dan dicatat sebagai dependensi fase berikutnya.

## Pertanyaan Terbuka
- Penamaan enum status SP final agar identik dengan implementasi modul Pemesanan [H1] (PRD H1 belum dibuat — §8.1 menjadi acuan sementara).
- Mekanisme teknis integrasi ke modul Keuangan (event/API internal vs shared database)?