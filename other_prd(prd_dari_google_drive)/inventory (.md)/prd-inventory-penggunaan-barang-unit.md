# PRD — Inventory: Penggunaan Barang Unit (Pemakaian Barang Unit)

**Related Document:** Design Figma; MindMap Fitur RS; Template Unduh Pemakaian Barang Unit; Pemakaian Barang Unit.docx (v 4 November 2025); BPMN terkait: g-backoffice-inventory-distribusi, -pemesanan, -penerimaan, -stok-opname, g-support-nutrition-usage
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

Fitur **Pemakaian Barang Unit** (code **H11**, cluster Backoffice > Inventory) digunakan untuk mencatat pengeluaran barang persediaan (Inventory/BHP) yang dipakai untuk keperluan **operasional unit itu sendiri**, dan **tidak dibebankan/ditagihkan kepada pasien**.

Karakteristik utama:
- Proses **memotong stok unit secara real-time dan direct (tanpa approval bertingkat)**, untuk mempercepat pencatatan pemakaian harian.
- Mendukung **pemilihan Batch / Expired Date** dari stok yang tersedia (mengikuti pola FEFO).
- Backend wajib **merekam harga satuan (HPP)** saat transaksi agar Keuangan bisa menarik laporan biaya operasional per unit, namun kolom harga **disembunyikan dari UI Admin Unit biasa**.

Fitur berlaku untuk unit/gudang barang Farmasi, Rumah Tangga, dan Gizi (sumber: Lampiran Pemakaian Barang Unit.docx).

## 2. Background

Rumah Sakit rutin menggunakan Bahan Habis Pakai (BHP) untuk operasional non-medis maupun medis umum (contoh: sabun cuci tangan, kertas HVS, disinfektan ruangan). Jika barang ini keluar dari stok namun **tidak dicatat** karena bukan transaksi pasien, maka:
- Terjadi **selisih stok** (stok opname tidak balance).
- Bagian **Keuangan tidak bisa melacak biaya operasional (expense)** masing-masing unit.

Untuk RS Tipe C & D dengan SDM dan anggaran terbatas, pencatatan harus cepat dan sederhana (tanpa approval bertingkat) namun tetap menjamin akurasi stok dan keterlacakan biaya. (Sumber: Lampiran Pemakaian Barang Unit.docx)

**As-Is [ASUMSI]:** pemakaian barang internal unit dicatat manual di buku/Excel atau tidak dicatat sama sekali, sehingga stok sistem tidak akurat dan menyulitkan stok opname (analogi dari g-backoffice-inventory-stok-opname yang menangani selisih fisik vs sistem).

## 3. In Scope

### Scope Definition
| No | Scope/Area |
|----|------------|
| 1 | Pencatatan barang yang dipakai oleh Unit (operasional internal, non-pasien). |
| 2 | Pemotongan stok unit secara **real-time dan direct (tanpa approval)**. |
| 3 | Pemilihan **Batch / Expired Date** dari stok yang tersedia. |
| 4 | Dashboard riwayat pemakaian barang per unit + filter, pencarian, pagination, unduh. |
| 5 | Perekaman **HPP/harga satuan** di sisi backend untuk laporan biaya operasional Keuangan. |
| 6 | Pencatatan log audit setiap perubahan stok akibat pemakaian. |

### Out Scope
| No | Scope |
|----|-------|
| 1 | Pencatatan obat/alkes yang **diresepkan ke pasien** (menggunakan modul E-Resep / Farmasi Penyerahan). |
| 2 | Barang **rusak / kadaluarsa** (menggunakan modul Pemusnahan / Write-off — H9). |
| 3 | Permintaan/distribusi antar unit (modul Distribusi — H3) dan penyesuaian via Stok Opname (H6). |
| 4 | Approval bertingkat atas pemakaian (sengaja ditiadakan).

## 4. Goals and Metrics

### Goals
- Menyediakan tampilan stok terkini per unit/gudang secara real-time setelah pemakaian.
- Menampilkan riwayat aliran stok pemakaian yang terintegrasi dengan aktivitas sistem lain (pengadaan, permintaan, mutasi, retur, penyesuaian).
- Menjamin konsistensi data stok antar unit dan modul.
- Memudahkan user menelusuri penyebab perubahan jumlah stok.
- Menyediakan dasar analisis biaya operasional per unit bagi Keuangan.

### Metrics
| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Akurasi data stok sistem | Stok sistem sesuai stok fisik saat opname |
| 2 | Waktu pencatatan transaksi stok | Setiap pemakaian tercatat & stok terpotong otomatis saat simpan |
| 3 | Frekuensi sinkronisasi data stok antar unit/gudang | Data tersinkron real-time |
| 4 | Kecepatan akses informasi stok | User dapat mencari informasi stok/pemakaian < 30 detik |

(Sumber metrik & goals: Lampiran Pemakaian Barang Unit.docx)

## 5. Related Feature

Fitur terkait dari List Fitur (cluster Backoffice > Inventory):

| Code | Menu | Relasi |
|------|------|--------|
| H4 | Informasi Stok | Pemakaian memotong stok yang ditampilkan di Informasi Stok |
| H5 | Mutasi Stok | Pemakaian = salah satu jenis pergerakan stok keluar |
| H6 | Stok Opname | Akurasi pemakaian mempengaruhi balance stok opname |
| H1 | Pemesanan Barang | Stok berkurang akibat pemakaian → memicu kebutuhan pengadaan |
| H2 | Penerimaan Barang | Sumber penambahan batch/stok yang lalu dipakai |
| H3 | Distribusi Barang | Sumber stok masuk ke unit penerima |
| H9 | Pemusnahan Barang | Barang rusak/ED dikeluarkan via modul ini, bukan Pemakaian (out scope) |

Referensi pola alur lain: **g-support-nutrition-usage** (Penggunaan Barang Gizi) — pola "buka menu penggunaan barang → tambah data bahan → simpan → stok berkurang & data terupdate" sangat mirip dengan H11. [ASUMSI] H11 adalah generalisasi pola tersebut untuk semua kategori (Farmasi/Rumah Tangga/Gizi).

## 6. Business Process (As-Is / To-Be)

### A. As-Is [ASUMSI]
1. Petugas unit mengambil BHP dari stok unit untuk keperluan operasional.
2. Pemakaian dicatat manual (buku/Excel) atau tidak dicatat.
3. Stok sistem tidak berkurang → selisih saat stok opname.
4. Keuangan tidak punya data biaya operasional per unit.

### B. To-Be (sumber: Lampiran .docx)
**1. Pencatatan Pemakaian**
- User (Admin Unit/Gudang) membuka menu **Inventaris → Pemakaian Barang Unit**.
- Klik **Tambah Pemakaian**, pilih barang dari stok unit, pilih **Batch/Expired Date**, isi jumlah & alasan.
- Simpan → sistem **langsung memotong stok unit (direct, tanpa approval)** dan merekam HPP.

**2. Tampilan Informasi Stok Detail**
- Sistem menampilkan daftar barang dengan informasi detail (stok terkini per batch).
- User dapat memfilter stok; data ditarik dari akumulasi aliran stok terbaru.

**3. Menelusuri Aliran Stok (Riwayat)**
- User memilih barang untuk melihat riwayat pergerakan stok.
- Riwayat dapat difilter berdasarkan rentang tanggal / jenis transaksi.

**4. Integrasi dengan Modul Lain**
- Setiap transaksi dari modul Pengadaan, Distribusi, Retur, dan Penyesuaian otomatis memperbarui aliran stok; sistem rekalkulasi stok terkini setiap ada transaksi baru.

**5. Audit & Validasi**
- Sistem menyimpan log audit stok, mencatat semua perubahan.

## 7. Main Flow / Mindmap

**Skenario 1 — Catat Pemakaian Barang Unit (happy path)**
1. Admin Unit login (konteks unit otomatis dari user login).
2. Buka menu Inventaris → Pemakaian Barang Unit → tampil Dashboard. *(US-001)*
3. Klik **Tambah Pemakaian** → sistem menampilkan form. *(US-002)*
4. Pilih/scan barang (lookup stok unit) → sistem menampilkan stok tersedia & daftar batch.
5. Pilih **Batch/Expired Date** → kadaluarsa, satuan, kategori, HPP terisi otomatis. *(BR-003, BR-006)*
6. Input **Jumlah Pemakaian** + **Alasan/Keterangan**.
7. Gateway **Jumlah ≤ stok batch?**
   - Tidak → tampilkan error, blokir simpan. *(BR-002)*
   - Ya → lanjut.
8. Klik Simpan → sistem **potong stok batch real-time**, hitung Stok Awal/Akhir, rekam HPP, tulis log audit. *(BR-001, FR-005)*
9. Event akhir: "Pemakaian tersimpan, stok unit berkurang & data terupdate". (Analogi g-support-nutrition-usage)

**Skenario 2 — Pantau & Telusuri Riwayat**
1. Dashboard menampilkan tabel pemakaian (default sort Tanggal Pemakaian desc).
2. Filter daterange / kategori, cari nama barang, pagination 10/halaman. *(US-001)*
3. Klik barang → lihat riwayat aliran stok (opsional, integrasi H4/H5).
4. Klik **Unduh** → ekspor data sesuai filter. *(FR-006)*

**Catatan visibilitas:** Admin Unit hanya melihat unit-nya; Manajemen/Keuangan melihat seluruh unit. *(BR-004)*

## 8. Business Rules

| ID | Rule | Traceability |
|----|------|--------------|
| BR-001 | Pemakaian Barang Unit **memotong stok unit secara langsung tanpa approval** saat disimpan. | To-Be §1; Lampiran .docx |
| BR-002 | Jumlah pemakaian **tidak boleh melebihi stok tersedia pada batch terpilih**; bila melebihi, simpan ditolak. | Main Flow step 7 |
| BR-003 | Pemilihan **Batch/Expired Date wajib**; default disarankan **FEFO** (First Expired First Out). [ASUMSI] | In Scope #3 |
| BR-004 | **Visibilitas role**: Admin Unit hanya melihat histori unitnya sendiri; Manajemen/Keuangan melihat seluruh unit. | US AC1 |
| BR-005 | Sistem wajib **merekam HPP/harga satuan saat transaksi**; kolom harga **disembunyikan dari UI Admin Unit biasa**, hanya tampil untuk role Keuangan/Manajemen. | US AC3 |
| BR-006 | Field turunan (kadaluarsa, satuan, kategori, HPP) **autofill dari batch/master**, tidak diinput manual. | Data Req |
| BR-007 | Pemakaian untuk **resep pasien** dan **barang rusak/ED** tidak boleh dicatat di sini (gunakan E-Resep / Pemusnahan). | Out Scope |
| BR-008 | Setiap pemakaian menulis **log audit** (user, waktu, sebelum/sesudah stok). | To-Be §5 |
| BR-009 | Konteks **unit** transaksi otomatis dari unit user login, tidak dapat diubah Admin Unit. [ASUMSI] | US AC1 |

## 9. User Stories

**User Story Utama:** Sebagai Admin Unit/Gudang (Farmasi/Rumah Tangga/Gizi), saya dapat memantau Informasi Detail Stok dan History Stock unit/gudang terkait, agar stok lebih terorganisir. (Sumber: Lampiran .docx)

| ID | Sebagai | Saya ingin | Agar | Prioritas | Sumber |
|----|---------|-----------|------|-----------|--------|
| US-001 | Admin Unit (Farmasi/RT/Gizi) | melihat **Dashboard Pemakaian Barang Unit** (tabel, filter daterange & kategori, cari nama barang, pagination 10, tombol unduh) | semua pemakaian barang unit terpantau | P0 | Lampiran .docx |
| US-002 | Admin Unit | **menambah pemakaian barang** (pilih barang, batch/ED, jumlah, alasan) dan stok terpotong otomatis | pencatatan harian cepat tanpa approval | P0 | Lampiran .docx |
| US-003 | Keuangan/Manajemen | melihat **histori pemakaian seluruh unit** beserta nilai HPP/total rupiah | menarik laporan biaya operasional per unit | P0 | US AC1/AC3 |
| US-004 | Admin Unit | **menelusuri riwayat aliran stok** suatu barang (filter tanggal/jenis transaksi) | mengetahui penyebab perubahan stok | P1 | To-Be §3 |
| US-005 | Admin Unit | **mengunduh** data pemakaian sesuai filter | pelaporan & arsip | P1 | Lampiran .docx |
| US-006 | Sistem | menulis **log audit** tiap perubahan stok | keterlacakan & validasi | P1 | To-Be §5 |

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-001 | Sistem menyediakan menu **Inventaris → Pemakaian Barang Unit** menampilkan dashboard tabel pemakaian dengan kolom: Tanggal Pemakaian, Nama Barang, Kadaluarsa, Batch, Stok Awal, Jumlah Pemakaian, Stok Akhir, Kemasan, Kategori Barang, User. | US-001 |
| FR-002 | Dashboard default **sort Tanggal Pemakaian descending**, filter **Daterange** (default = hari ini) & **Kategori**, pencarian by **Nama Barang**, pagination **10/halaman**. | US-001 |
| FR-003 | Dashboard hanya menampilkan data **unit user login** untuk Admin Unit; role Keuangan/Manajemen melihat semua unit. | BR-004 |
| FR-004 | Form **Tambah Pemakaian**: lookup barang dari stok unit, pilih **Batch/ED**, autofill kadaluarsa/satuan/kategori/HPP, input jumlah & alasan. | US-002 |
| FR-005 | Saat simpan, sistem **validasi jumlah ≤ stok batch**, **potong stok real-time**, hitung Stok Awal/Akhir, **rekam HPP**, dan tulis log audit. | BR-001, BR-002, BR-005, BR-008 |
| FR-006 | Sistem menyediakan tombol **Unduh** untuk ekspor data sesuai filter aktif (CSV/XLSX). | US-005 |
| FR-007 | Setiap transaksi pemakaian otomatis memperbarui **Informasi Stok (H4)** dan tercatat sebagai pergerakan di **Mutasi/Aliran Stok (H5)**. | To-Be §4 |
| FR-008 | Sistem menampilkan **riwayat aliran stok** per barang dengan filter rentang tanggal & jenis transaksi. | US-004 |
| FR-009 | Kolom **HPP/harga** disembunyikan dari UI Admin Unit; hanya tampil untuk role Keuangan/Manajemen. | BR-005 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Tambah Pemakaian Barang Unit (FR-004)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_pemakaian | Nomor Pemakaian | text | Ya | unik, auto, pola `PMK-<unit>-<YYYYMMDD>-<seq>` [PERLU KONFIRMASI] | auto-generate | identitas transaksi |
| tanggal_pemakaian | Tanggal Pemakaian | date | Ya | ≤ hari ini | default hari ini | |
| unit | Unit/Poli | dropdown(lookup) | Ya | dari master Unit (A3) | autofill unit user login | tidak diubah Admin Unit (BR-009) |
| kode_barang | Kode Barang | lookup | Ya | unik; pola `RT-#####` [PERLU KONFIRMASI] | lookup stok unit | konsisten lintas-PRD |
| nama_barang | Nama Barang | lookup | Ya | maks 150 char | autofill dari master item | konsisten lintas-PRD |
| batch | Batch / No. Batch | dropdown | Ya | dari batch tersedia di stok unit | lookup stok | sarankan FEFO (BR-003) |
| kadaluarsa | Kadaluarsa (Expired Date) | date | Ya | tampil otomatis | autofill dari batch | tidak diinput manual |
| satuan | Satuan | text | Ya | dari master item | autofill | konsisten lintas-PRD |
| kemasan | Kemasan | text | Tidak | dari master item | autofill | |
| kategori_barang | Kategori Barang | dropdown(lookup) | Ya | Farmasi/Rumah Tangga/Gizi/dll | autofill dari master item | |
| stok_tersedia | Stok Tersedia (batch) | number | – | read-only | autofill (akumulasi aliran stok) | acuan validasi BR-002 |
| jumlah_pemakaian | Jumlah Pemakaian | number | Ya | > 0 dan ≤ stok_tersedia batch | manual | |
| alasan_pemakaian | Alasan/Keterangan Pemakaian | text | Ya | maks 255 char | manual | reuse field kanonik `keterangan` |
| hpp | Harga Satuan (HPP) | number | Ya (backend) | mata uang Rp | autofill master harga saat transaksi | **disembunyikan dari UI Admin Unit** (BR-005) |
| user | User Pencatat | lookup | Ya | autofill | user login | reuse `nama` (autofill dari Staff) |
| status_aktif | Status | boolean | Ya | aktif/batal [PERLU KONFIRMASI] | default aktif | reuse field kanonik |

### B. Layar TAMPIL — Dashboard Pemakaian Barang Unit (FR-001/FR-002)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal Pemakaian | transaksi_pemakaian.tanggal | tanggal (DD-MM-YYYY) | **sort desc (default)**, filter daterange (default hari ini) | |
| Nomor Pemakaian | transaksi_pemakaian.no_pemakaian | text | sort | (AC2) |
| Nama Barang | master_item.nama_barang | text | **pencarian** | |
| Kadaluarsa | batch.kadaluarsa | tanggal | – | badge merah jika dekat ED [ASUMSI] |
| Batch | batch.no_batch | text | – | |
| Stok Awal | hitung sebelum potong | number | – | |
| Jumlah Pemakaian | transaksi_pemakaian.jumlah | number | – | |
| Stok Akhir | hitung setelah potong | number | – | |
| Kemasan | master_item.kemasan | text | – | |
| Kategori Barang | master_item.kategori | text | **filter kategori** | |
| User | staff.nama | text | – | |
| (Harga/Total Rp) | transaksi_pemakaian.hpp × jumlah | mata uang Rp | – | **hanya role Keuangan/Manajemen** (BR-005) |

Pagination 10 data/halaman; tombol **Unduh** (ekspor sesuai filter); Admin Unit hanya data unitnya (BR-004).

### C. Layar TAMPIL — Riwayat Aliran Stok per Barang (FR-008)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal | aliran_stok.tanggal | tanggal | filter daterange, sort desc | |
| Jenis Transaksi | aliran_stok.jenis | badge (Penerimaan/Distribusi/Pemakaian/Retur/Penyesuaian) | **filter jenis** | |
| Referensi | aliran_stok.ref_no | text | – | no dokumen sumber |
| Masuk/Keluar | aliran_stok.qty | number (+/-) | – | |
| Stok Setelah | aliran_stok.saldo | number | – | hasil rekalkulasi (FR-007) |

## 12. Non-Functional Requirements

| ID | Requirement | Catatan |
|----|-------------|---------|
| NFR-001 | **Performa**: pencarian informasi stok/pemakaian < 30 detik (target metrik #4). | |
| NFR-002 | **Konsistensi data**: pemotongan stok dilakukan transaksional (atomic) agar Stok Awal/Akhir & saldo batch tidak race-condition saat akses bersamaan. | penting karena tanpa approval |
| NFR-003 | **Real-time sync**: stok unit terupdate seketika setelah simpan dan tercermin di Informasi Stok (H4). | metrik #3 |
| NFR-004 | **Keamanan & otorisasi**: role-based access — Admin Unit (unit sendiri, tanpa harga), Keuangan/Manajemen (semua unit + harga). | BR-004, BR-005 |
| NFR-005 | **Auditability**: log audit immutable (user, timestamp, nilai sebelum/sesudah) tersimpan untuk setiap pemakaian. | BR-008 |
| NFR-006 | **Ketahanan koneksi** [ASUMSI]: untuk RS Tipe C/D dengan internet tidak stabil, simpan harus konsisten; pertimbangkan antrian/retry bila integrasi modul lain gagal sementara. | [PERLU KONFIRMASI] apakah perlu mode offline |
| NFR-007 | **Usability**: form pemakaian harian sederhana, minim klik (default tanggal hari ini, autofill field turunan). | |

## 13. Integrasi Eksternal

Modul ini bersifat **internal Inventory** dan tidak memerlukan integrasi pihak ketiga (BPJS/SATUSEHAT/Disdukcapil) secara langsung. [ASUMSI]

**Integrasi internal antar-modul (wajib):**
| Modul | Arah | Tujuan |
|-------|------|--------|
| H4 Informasi Stok | tulis/baca | Sumber stok tersedia & batch; pemakaian memperbarui stok terkini. |
| H5 Mutasi/Aliran Stok | tulis | Pemakaian tercatat sebagai pergerakan stok keluar; mendukung riwayat (FR-008). |
| H6 Stok Opname | baca | Akurasi pemakaian menjaga balance fisik vs sistem. |
| Modul Keuangan / COA Persediaan | tulis (nilai HPP) | Rekam biaya operasional per unit; analog penyesuaian nilai COA pada g-backoffice-inventory-stok-opname. [ASUMSI] |
| Master Item & Master Unit (Control Panel) | baca | Sumber kode_barang, nama_barang, satuan, kemasan, kategori, unit. |
| Master Staff/User | baca | Identitas user pencatat & konteks unit login. |

**Catatan SATUSEHAT [ASUMSI]:** pemakaian BHP operasional internal umumnya tidak dilaporkan ke SATUSEHAT (bukan pelayanan pasien). [PERLU KONFIRMASI] bila ada kebutuhan pelaporan logistik tertentu.

## Asumsi
- [ASUMSI] As-Is: pemakaian internal sebelumnya dicatat manual/tidak tercatat, menyebabkan selisih stok (analogi g-backoffice-inventory-stok-opname).
- [ASUMSI] Pola alur 'tambah data → simpan → stok berkurang & terupdate' diturunkan dari g-support-nutrition-usage (Penggunaan Barang Gizi).
- [ASUMSI] Pemilihan batch mengikuti prinsip FEFO sebagai default yang disarankan.
- [ASUMSI] Konteks unit transaksi otomatis dari unit user login dan tidak dapat diubah oleh Admin Unit.
- [ASUMSI] Nilai HPP pemakaian dijurnal ke COA Persediaan/biaya operasional, analog penyesuaian nilai COA pada proses stok opname.
- [ASUMSI] Modul tidak melaporkan ke SATUSEHAT/BPJS karena bukan transaksi pelayanan pasien.
- Field keterangan, status_aktif, satuan, kode_barang, nama_barang, unit, nama (user) mengikuti definisi kanonik lintas-PRD.

## Pertanyaan Terbuka
- Format & pola Nomor Pemakaian (PMK-...)? Apakah auto-generate per unit per tanggal?
- Apakah kode_barang memakai pola seragam `RT-#####` untuk semua kategori (Farmasi/Gizi) atau berbeda per kategori? (konflik dengan field kanonik yang ditandai [PERLU KONFIRMASI])
- Apakah pemakaian yang sudah tersimpan dapat dibatalkan/dikoreksi (reversal stok) dan siapa yang berwenang?
- Default pemilihan batch — apakah sistem otomatis FEFO atau murni manual pilih user?
- Apakah dibutuhkan mode offline/sinkronisasi untuk RS dengan internet tidak stabil?
- Apakah laporan biaya operasional per unit (HPP) menjadi bagian modul ini atau modul Keuangan terpisah?
- Format file unduh: CSV atau XLSX, dan apakah mengikuti 'Template Unduh Pemakaian Barang Unit'?