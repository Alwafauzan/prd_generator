# PRD — Master Data: Instansi Rekanan

**Related Document:** Design Figma; Template Impor Master Data Instansi Rekanan; Template Ekspor Master Data Instansi Rekanan; List Fitur V2 (A8); PRD terkait: A7 Supplier, A20 Tipe Penjamin, A3 Unit
**Versi:** 1.2 - Refinement (multi-kategori per instansi; PKS cukup nomor & periode)

## 1. Overview / Brief Summary

Modul **Master Data — Instansi Rekanan** (kode fitur **A8**, cluster **Control Panel**) berfungsi sebagai pusat pengelolaan data instansi/lembaga eksternal yang menjalin kerja sama dengan rumah sakit **di luar fungsi penjaminan biaya**.

Kategori instansi rekanan yang dikelola:
- **Faskes Rujukan** (puskesmas, klinik, RS perujuk/penerima rujukan).
- **Lab/Radiologi Rujukan** (pemeriksaan penunjang eksternal).
- **Perusahaan** (kerja sama layanan, Medical Check Up/MCU).
- **Pinjam Meminjam Barang** (instansi mitra peminjaman aset/barang).
- **Lainnya**.

> **Multi-kategori (refinement v1.2):** Satu instansi rekanan **boleh memiliki lebih dari satu kategori** sekaligus (mis. sebuah RS mitra dapat sekaligus menjadi **Faskes Rujukan** dan **Lab/Radiologi Rujukan**). Kategori dikelola sebagai **pilihan jamak (multi-select)** dengan minimal 1 kategori per instansi. Instansi akan muncul sebagai referensi pada **setiap** modul/proses yang sesuai dengan **salah satu** kategori yang dimilikinya.

Data instansi rekanan yang valid dan terstruktur menjadi dasar proses rujukan masuk/keluar, layanan kerja sama, dan pencatatan peminjaman barang. Modul ini menjadi **single source of truth** bagi seluruh data instansi rekanan non-penjamin di sistem Neurovi.

> Catatan pembatas: Data **penjamin biaya/asuransi** dikelola pada modul **Master Data Tipe Penjamin (A20) / Master Data Penjamin** tersendiri, **bukan** di modul ini.

## 2. Background

Sebelum modul ini dikembangkan, data instansi rekanan dikelola **terpisah di tiap unit** (Pendaftaran, Penunjang Medis, Pelayanan, IGD, Inventory). Akibatnya:

1. **Duplikasi & inkonsistensi data** instansi rekanan antar unit.
2. **Sulit menelusuri riwayat** rujukan maupun peminjaman barang per instansi.
3. **Tidak ada kontrol masa berlaku PKS** (Perjanjian Kerja Sama) dengan instansi rekanan.
4. **Integrasi antar modul rumit** karena tidak ada data instansi rekanan yang terstandar.
5. **Satu instansi sering berperan ganda** (mis. RS mitra yang sekaligus menerima rujukan pasien dan rujukan pemeriksaan lab), namun pencatatan terpisah memaksa instansi yang sama dibuat berkali-kali di unit berbeda.

Kondisi ini relevan khusus untuk RS Tipe C & D dengan SDM IT terbatas: pencatatan manual/semi-manual di tiap unit memperbesar risiko salah pilih instansi saat rujukan/peminjaman. Modul ini dikembangkan agar seluruh proses mengacu pada satu sumber data instansi rekanan yang terkontrol — **satu record instansi dapat melayani beberapa kategori kerja sama** — dengan setup mandiri oleh Admin RS tanpa bergantung pada tim teknis. [ASUMSI] Kondisi As-Is diturunkan dari uraian Background pada lampiran dokumen dan pola modul master data lain (A7 Supplier).

## 3. In Scope

### Scope Definition

| No | Fase | Scope/Area |
|----|------|------------|
| 1 | Phase 1 | Dashboard — Master Data Instansi Rekanan (list, cari, filter) |
| 2 | Phase 1 | Tambah Data Instansi Rekanan (kode instansi **auto-generate** format INSTANSI-<XXXX>) |
| 3 | Phase 1 | Update/Edit Data Instansi Rekanan |
| 4 | Phase 1 | Aktif/Nonaktifkan Instansi Rekanan |
| 5 | Phase 1 | Klasifikasi instansi berdasarkan Kategori Kerja Sama — **multi-kategori (satu instansi dapat memiliki >1 kategori, minimal 1)** |
| 6 | Phase 1 | Penanda (badge) masa berlaku PKS — **Aktif / Akan Berakhir / Expired** (tanpa mengubah status aktif) |
| 7 | Phase 1 | Pencatatan PKS **cukup nomor & periode** (No. PKS, Tanggal Mulai, Tanggal Selesai) — tanpa unggah dokumen |
| 8 | Phase 1 | Audit trail perubahan data (tambah/ubah/nonaktif) |
| 9 | Phase 2 | Import & Ekspor Data Instansi Rekanan (template) |

### Out Scope

| No | Scope yang TIDAK dikerjakan |
|----|------------------------------|
| 1 | Pengelolaan data **Penjamin biaya/asuransi** (ditangani modul Master Data Tipe Penjamin A20 / Master Data Penjamin tersendiri) |
| 2 | Proses **transaksi** rujukan, layanan kerja sama, dan peminjaman/pengembalian barang (ditangani modul terkait masing-masing) |
| 3 | Pengelolaan **master data tarif & layanan** (ditangani modul Master Data Tarif) |
| 4 | **Manajemen dokumen/lampiran PKS** (unggah file kontrak, versi dokumen, dll) — **TERKONFIRMASI per instruksi user: cukup menyimpan No. PKS & periode (tanggal mulai–selesai)**. Penyimpanan berkas PKS tidak termasuk Phase 1. |
| 5 | **Auto-nonaktif** instansi saat PKS habis — saat PKS habis sistem **hanya menampilkan badge Expired**, status aktif tidak diubah otomatis (lihat BR-009) |

## 4. Goals and Metrics

### Goals
1. Menyediakan pusat pengelolaan data instansi rekanan terstandar untuk semua kategori kerja sama (Faskes Rujukan, Lab/Radiologi Rujukan, Perusahaan, Pinjam Meminjam Barang, Lainnya), termasuk instansi yang berperan pada **lebih dari satu kategori**.
2. Memastikan setiap proses rujukan, layanan kerja sama, dan peminjaman barang mengacu pada data instansi rekanan yang sama, tanpa duplikasi record untuk instansi multi-peran.
3. Mempermudah evaluasi, audit, dan pengendalian hubungan kerja sama dengan instansi rekanan.
4. Mengintegrasikan informasi instansi rekanan dengan modul terkait sesuai **setiap** kategori kerja sama yang dimilikinya.
5. Meningkatkan efisiensi dan akurasi pengelolaan kerja sama antar unit.

### Metrics

| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Konsistensi data antar modul | 100% modul memakai referensi data instansi rekanan yang sama |
| 2 | Kemandirian user non-teknis | 100% user Admin RS mampu setup tanpa bantuan tim teknis |
| 3 | Kecepatan update konfigurasi | 100% perubahan data terbaca real-time tanpa restart sistem |
| 4 | Pencarian & filter | Waktu pencarian data instansi rekanan < 3 detik |
| 5 | Keunikan kode instansi | 0 duplikasi `kode_instansi` (auto-generate format INSTANSI-<XXXX>) |
| 6 | Eliminasi duplikasi instansi multi-peran | 0 record ganda untuk instansi yang sama yang melayani >1 kategori (multi-kategori dalam 1 record) |

## 5. Related Feature

### Modul yang mengonsumsi data Instansi Rekanan

| No | Modul | Feature / Penggunaan |
|----|-------|----------------------|
| 1 | Pendaftaran | Rujukan Masuk, Rujukan Keluar (instansi yang **memiliki** kategori Faskes Rujukan) |
| 2 | Penunjang Medis | Rujukan Pemeriksaan Lab/Radiologi Eksternal (instansi yang **memiliki** kategori Lab/Radiologi Rujukan) |
| 3 | Inventory | Peminjaman & Pengembalian Barang (instansi yang **memiliki** kategori Pinjam Meminjam Barang) — lih. `g-backoffice-inventory-distribusi`, `g-backoffice-inventory-pemesanan` |
| 4 | Pelayanan / MCU | Layanan kerja sama Perusahaan (instansi yang **memiliki** kategori Perusahaan, mis. Paket MCU A44) |

> Karena instansi bersifat **multi-kategori**, satu record yang sama dapat muncul sebagai referensi pada beberapa modul sekaligus — tiap modul memfilter berdasarkan keanggotaan kategori (lihat BR-012, FR-009).

### Master data sejenis di cluster Control Panel (acuan pola & konsistensi)

| Code | Menu | Relevansi |
|------|------|-----------|
| A7 | Master Data > Supplier | Pola form & dashboard master mitra eksternal (acuan utama field kontak/alamat/NPWP) |
| A20 | Master Data > Tipe Penjamin | Pemisah tegas: penjamin biaya ≠ instansi rekanan |
| A3 | Master Data > Unit | Lookup `unit` saat menetapkan unit penanggung jawab kerja sama [ASUMSI] |
| A53 | Admin > RBAC | Pembatasan akses ubah data (role Admin RS / Configuration Manager) |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Background lampiran]
- Tiap unit (Pendaftaran, Penunjang, Inventory) mencatat instansi rekanan **sendiri-sendiri** di buku/spreadsheet/aplikasi unit.
- Saat rujukan keluar atau peminjaman barang, petugas mengetik ulang nama instansi → rawan typo & duplikasi.
- Instansi yang berperan ganda dicatat berulang di unit berbeda karena tidak ada konsep multi-kategori.
- Tidak ada kontrol masa berlaku PKS; instansi yang PKS-nya sudah habis tetap dipilih.
- Penelusuran riwayat per instansi sulit karena data tersebar.

### B. To-Be (kondisi diharapkan)

**1. Pengelolaan data terpusat**
- Admin RS / Configuration Manager mengakses menu *Control Panel > Master Data > Instansi Rekanan*.
- User dapat menambah, mengedit, atau menonaktifkan data instansi rekanan.
- Tiap instansi memiliki atribut dasar: kode (auto), nama, alamat, kontak, email, NPWP, margin (Rupiah), status, **No. PKS & periode PKS**, dll.
- **Kode instansi di-generate otomatis** oleh sistem dengan format **INSTANSI-<XXXX>** saat data disimpan (read-only, tidak diisi manual).

**2. Klasifikasi berdasarkan kategori kerja sama (multi-kategori)**
- Saat membuat/mengedit instansi, user memilih **satu atau lebih Kategori Instansi** (multi-select): Faskes Rujukan / Lab-Radiologi Rujukan / Perusahaan / Pinjam Meminjam Barang / Lainnya — **minimal 1 kategori wajib**.
- Tiap kategori yang dipilih menentukan keterkaitan instansi dengan modul/proses tertentu; satu instansi dapat terhubung ke beberapa proses sekaligus.

**3. Integrasi dengan modul terkait**
- Data instansi rekanan dipakai sebagai referensi pada rujukan masuk/keluar, rujukan pemeriksaan eksternal, serta pencatatan peminjaman & pengembalian barang. Instansi muncul di setiap lookup modul yang kategorinya **dimiliki** instansi tersebut (validasi otomatis pemilihan instansi).

**4. Validasi & kontrol data**
- Sistem memvalidasi tidak ada duplikasi nama instansi atau email.
- Sistem mewajibkan minimal satu kategori dipilih.
- Status (Aktif/Nonaktif) memengaruhi ketersediaan instansi pada proses rujukan & peminjaman.
- **PKS dicatat cukup dengan No. PKS & periode (tanggal mulai–selesai)**; tidak ada unggah berkas dokumen PKS pada Phase 1.
- **Masa berlaku PKS** dikontrol secara informatif: saat PKS habis, sistem **menampilkan badge Expired** sebagai penanda evaluasi — **tidak** mengubah status Aktif/Nonaktif secara otomatis.

**5. Audit trail & keamanan**
- Setiap perubahan (tambah/ubah/nonaktif), termasuk perubahan daftar kategori, terekam di audit trail.
- Hanya role Admin RS / Configuration Manager yang dapat mengubah data.

## 7. Main Flow / Mindmap

**Aktor:** Admin RS / Configuration Manager (pengelola), Sistem Neurovi.

### Skenario 1 — Tambah Instansi Rekanan
1. Admin membuka *Control Panel > Master Data > Instansi Rekanan* → Sistem menampilkan dashboard/list.
2. Admin klik **Tambah** → Sistem menampilkan form Tambah Instansi Rekanan. Field **Kode Instansi** ditampilkan read-only/placeholder ('akan dibuat otomatis').
3. Admin memilih **satu atau lebih Kategori Instansi** (multi-select: Faskes Rujukan / Lab-Radiologi Rujukan / Perusahaan / Pinjam Meminjam Barang / Lainnya) — **minimal 1**.
4. Admin mengisi data dasar (nama, alamat, kontak, email, NPWP, margin (Rp), **No. PKS & periode PKS**, dll).
5. Admin klik **Simpan** → Sistem **validasi** duplikasi (nama & email), field wajib, dan **minimal 1 kategori terpilih**.
   - *Gateway: Data valid?* → **Tidak**: tampilkan pesan error, kembali ke form.
   - **Ya**: sistem **men-generate `kode_instansi`** dengan format INSTANSI-<XXXX> (nomor urut berikutnya), simpan data + relasi kategori, set status default **Aktif**, catat audit trail, tampilkan notifikasi sukses.
6. Data langsung tersedia (real-time) sebagai referensi di modul Pendaftaran, Penunjang Medis, Inventory — sesuai setiap kategori yang dipilih.

### Skenario 2 — Edit Instansi Rekanan
1. Admin memilih instansi dari list → klik **Edit**.
2. Sistem menampilkan form ter-prefill termasuk **daftar kategori** terpilih. **Kode Instansi tidak dapat diubah** (read-only).
3. Admin mengubah data / menambah-mengurangi kategori (tetap minimal 1) → **Simpan** → validasi (sama seperti tambah, abaikan diri sendiri pada cek duplikat) → catat audit trail (termasuk perubahan kategori).

### Skenario 3 — Aktif/Nonaktifkan Instansi
1. Admin klik toggle **Status** pada baris/detail instansi.
   - *Gateway: Nonaktifkan?* → konfirmasi.
   - Jika **Nonaktif**: instansi tidak lagi muncul sebagai pilihan di **seluruh** proses rujukan/peminjaman baru (untuk semua kategorinya); data historis tetap utuh.
2. Sistem catat audit trail.

### Skenario 4 — Penanda PKS Expired (otomatis, informatif)
1. Sistem membandingkan `pks_selesai` dengan tanggal hari ini pada saat data ditampilkan.
   - *Gateway: pks_selesai < hari ini?* → **Ya**: tampilkan **badge Expired** (merah) pada list & detail.
   - *pks_selesai dalam ≤ N hari ke depan?* → tampilkan badge **Akan Berakhir** (kuning). [ASUMSI N=30 hari — [PERLU KONFIRMASI]]
   - Selainnya: badge **Aktif** (hijau) / tanpa badge.
2. **Status aktif instansi tidak berubah** akibat badge ini (BR-009). Admin dapat menonaktifkan/memperbarui PKS secara manual bila perlu.

### Skenario 5 — Import & Ekspor (Phase 2)
1. Admin unduh template → isi → **Import** (mode tambah / tambah+update). Kolom kode dikosongkan untuk baris baru (auto-generate); diisi untuk update. Kolom kategori dapat berisi **beberapa kategori** (multi-value, dipisah pemisah baku — mis. `;`).
2. Sistem validasi per baris (termasuk minimal 1 kategori valid), tampilkan ringkasan sukses/gagal.
3. **Ekspor**: unduh seluruh/filter data ke file (kolom kategori multi-value). [ASUMSI] Pola import/export mengikuti master data lain (A7 Supplier).

## 8. Business Rules

| ID | Aturan | Sumber |
|----|--------|--------|
| BR-001 | **Nama instansi** harus unik (tidak boleh duplikat) | Lampiran: Validasi & Kontrol Data |
| BR-002 | **Email instansi** harus unik dan berformat email valid bila diisi | Lampiran: Validasi & Kontrol Data |
| BR-003 | Setiap instansi **wajib** memiliki **minimal 1 Kategori Instansi** dan **boleh memiliki lebih dari satu** kategori (multi-kategori) dari: Faskes Rujukan / Lab-Radiologi Rujukan / Perusahaan / Pinjam Meminjam Barang / Lainnya | Instruksi user (refinement) + Lampiran: Klasifikasi |
| BR-004 | Instansi berstatus **Nonaktif** tidak boleh dipilih pada proses rujukan/peminjaman **baru** (untuk semua kategorinya); data historis tetap utuh | Lampiran: Validasi & Kontrol Data |
| BR-005 | Hanya role **Admin RS** atau **Configuration Manager** yang boleh menambah/mengubah/menonaktifkan data instansi rekanan | Lampiran: Audit Trail & Keamanan |
| BR-006 | Setiap perubahan (tambah/ubah/nonaktif), **termasuk penambahan/penghapusan kategori**, **wajib** tercatat di audit trail (user, waktu, aksi, nilai sebelum→sesudah) | Lampiran: Audit Trail & Keamanan |
| BR-007 | Data penjamin biaya/asuransi **tidak dikelola** di modul ini (gunakan A20/Master Data Penjamin) | Lampiran: Out Scope |
| BR-008 | Perubahan data terbaca **real-time** oleh modul lain tanpa restart sistem | Lampiran: Metrics #3 |
| BR-009 | Bila **periode PKS habis** (`pks_selesai` < hari ini), sistem **hanya menampilkan badge Expired** pada list & detail instansi. Sistem **TIDAK** mengubah status Aktif/Nonaktif secara otomatis — penonaktifan tetap aksi manual Admin. Badge **Akan Berakhir** ditampilkan bila `pks_selesai` ≤ N hari ke depan [ASUMSI N=30 hari]. | Instruksi user (refinement) |
| BR-010 | **`kode_instansi` di-generate otomatis** oleh sistem dengan format **`INSTANSI-<XXXX>`** (XXXX = nomor urut 4 digit dengan leading zero, mis. INSTANSI-0001), bersifat **unik** dan **read-only** (tidak dapat diisi/diubah manual). | Instruksi user (refinement) |
| BR-011 | Field **`margin`** bersatuan **Rupiah (nominal)**, bukan persen; nilai harus ≥ 0 dan disimpan/ditampilkan dalam format mata uang Rupiah. | Instruksi user (refinement) |
| BR-012 | **Multi-kategori:** Satu record instansi yang memiliki beberapa kategori muncul sebagai referensi pada **setiap** modul/proses yang sesuai dengan **salah satu** kategorinya. Filter/lookup per modul menggunakan logika *keanggotaan* kategori (instansi cocok bila daftar kategorinya **mengandung** kategori yang diminta). | Instruksi user (refinement) |
| BR-013 | **PKS cukup nomor & periode:** Pencatatan PKS pada modul ini terbatas pada **No. PKS**, **Tanggal Mulai**, dan **Tanggal Selesai**. **Tidak ada unggah/penyimpanan berkas dokumen PKS** pada Phase 1. | Instruksi user (refinement) |

**Prioritas (referensi):** P0 Critical (MVP), P1 Must Have, P2 Should Have, P3 Low.

## 9. User Stories

| ID | User Story | Prioritas |
|----|------------|-----------|
| US-001 | Sebagai **Admin RS**, saya ingin menambah data instansi rekanan beserta kategorinya, agar seluruh unit memakai data instansi yang sama. | P0 |
| US-002 | Sebagai **Admin RS**, saya ingin mengedit data instansi rekanan, agar informasi kontak/PKS selalu mutakhir. | P0 |
| US-003 | Sebagai **Admin RS**, saya ingin menonaktifkan instansi rekanan, agar instansi yang tidak aktif tidak lagi bisa dipilih pada rujukan/peminjaman baru. | P0 |
| US-004 | Sebagai **Admin RS**, saya ingin sistem mencegah duplikasi nama/email instansi, agar data tetap bersih dan konsisten. | P0 |
| US-005 | Sebagai **Configuration Manager**, saya ingin mencari & memfilter instansi berdasarkan kategori/status, agar cepat menemukan data (< 3 detik). | P1 |
| US-006 | Sebagai **Petugas Pendaftaran**, saya ingin memilih Faskes Rujukan dari daftar terstandar saat rujukan keluar, agar tidak salah ketik instansi. | P1 |
| US-007 | Sebagai **Petugas Inventory**, saya ingin memilih instansi mitra dari master saat mencatat peminjaman barang, agar pencatatan terkontrol. | P1 |
| US-008 | Sebagai **Auditor/Manajemen**, saya ingin melihat audit trail perubahan data instansi (termasuk perubahan kategori), agar setiap perubahan dapat ditelusuri. | P1 |
| US-009 | Sebagai **Admin RS**, saya ingin sistem membuatkan kode instansi otomatis (INSTANSI-XXXX), agar penomoran konsisten dan tidak duplikat tanpa input manual. | P0 |
| US-010 | Sebagai **Admin RS**, saya ingin melihat badge masa PKS (Aktif/Akan Berakhir/Expired) pada daftar instansi, agar dapat mengevaluasi kerja sama tepat waktu tanpa instansi otomatis dinonaktifkan. | P1 |
| US-011 | Sebagai **Admin RS**, saya ingin meng-import & meng-export data instansi rekanan via template, agar setup massal lebih cepat. | P2 (Phase 2) |
| US-012 | Sebagai **Admin RS**, saya ingin menetapkan **lebih dari satu kategori** pada satu instansi (mis. RS mitra yang sekaligus Faskes Rujukan dan Lab/Radiologi Rujukan), agar tidak perlu membuat record ganda dan instansi muncul di semua proses yang relevan. | P0 |
| US-013 | Sebagai **Admin RS**, saya ingin mencatat kerja sama cukup dengan **No. PKS dan periode (mulai–selesai)** tanpa harus mengunggah dokumen, agar pencatatan ringkas dan sesuai kebutuhan operasional. | P1 |

## 10. Functional Requirements

| ID | Functional Requirement | Story | Prioritas |
|----|------------------------|-------|-----------|
| FR-001 | Sistem menyediakan menu *Control Panel > Master Data > Instansi Rekanan* dengan dashboard berisi list, pencarian, dan filter (kategori, status, status PKS). Filter kategori menggunakan logika keanggotaan (instansi cocok bila memiliki kategori terpilih). | US-001, US-005 | P0 |
| FR-002 | Sistem menyediakan form **Tambah** instansi rekanan dengan field sesuai §11. | US-001 | P0 |
| FR-003 | Sistem menyediakan form **Edit** ter-prefill untuk instansi terpilih (termasuk daftar kategori); `kode_instansi` read-only. | US-002 | P0 |
| FR-004 | Sistem memvalidasi **duplikasi nama & email** sebelum simpan (BR-001, BR-002). | US-004 | P0 |
| FR-005 | Sistem menyediakan input **Kategori Instansi sebagai pilihan jamak (multi-select)** dan mewajibkan **minimal 1 kategori** terpilih (BR-003). | US-001, US-012 | P0 |
| FR-006 | Sistem menyediakan toggle **Aktif/Nonaktif** dengan konfirmasi; instansi nonaktif tidak muncul di pilihan proses baru pada semua kategorinya (BR-004). | US-003 | P0 |
| FR-007 | Sistem mencatat **audit trail** setiap aksi tambah/ubah/nonaktif, termasuk perubahan daftar kategori (BR-006). | US-008 | P1 |
| FR-008 | Sistem membatasi aksi tulis hanya untuk role Admin RS / Configuration Manager (BR-005); role lain read-only/konsumsi data. | US-001 | P0 |
| FR-009 | Sistem mengekspos data instansi aktif sebagai **lookup real-time** ke modul Pendaftaran, Penunjang Medis, Inventory, **difilter per kategori berdasarkan keanggotaan** — satu instansi multi-kategori muncul di semua lookup yang relevan (BR-008, BR-012). | US-006, US-007, US-012 | P1 |
| FR-010 | Sistem menyediakan pencarian dengan respons < 3 detik dan paginasi pada list. | US-005 | P1 |
| FR-011 | Sistem **men-generate `kode_instansi` otomatis** dengan format `INSTANSI-<XXXX>` (urut 4 digit, leading zero) saat simpan; menjamin keunikan dan menolak input manual (BR-010). | US-009 | P0 |
| FR-012 | Sistem menampilkan **badge status PKS** (Aktif / Akan Berakhir / **Expired**) berdasarkan `pks_selesai` vs tanggal hari ini, **tanpa** mengubah status aktif instansi (BR-009). | US-010 | P1 |
| FR-013 | Field **`margin`** divalidasi dan ditampilkan sebagai **nominal Rupiah** (≥ 0, format mata uang Rp), bukan persen (BR-011). | US-001 | P1 |
| FR-014 | Sistem menyediakan **Import** (mode: tambah / tambah+update) & **Ekspor** via template, dengan ringkasan validasi per baris; kolom kode kosong → auto-generate; kolom kategori mendukung **multi-value** (BR-012). | US-011 | P2 (Phase 2) |
| FR-015 | Sistem mencatat data PKS **hanya** berupa `no_pks`, `pks_mulai`, `pks_selesai` (No. PKS & periode) — **tidak menyediakan** unggah/penyimpanan berkas dokumen PKS pada Phase 1 (BR-013). | US-013 | P1 |

## 11. Data Requirements (Spesifikasi Field)

### A. Form Tambah/Edit Instansi Rekanan (layar INPUT) — FR-002, FR-003, FR-005, FR-011, FR-013, FR-015

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_instansi | Kode Instansi | text | Tidak (read-only) | **auto-generate**, format `INSTANSI-<XXXX>` (XXXX = 4 digit urut, leading zero, mis. INSTANSI-0001), unik | auto-generate sistem saat simpan | BR-010, FR-011. Tidak dapat diisi/diubah manual; placeholder 'akan dibuat otomatis' di form Tambah |
| nama | Nama Instansi | text | Ya | unik, maks 100 char | manual | BR-001. Konsisten dgn kanonik `nama` (maks 100) |
| kategori_instansi | Kategori Instansi | **multi-select / array enum** | Ya | **minimal 1 nilai**, nilai dari: Faskes Rujukan / Lab-Radiologi Rujukan / Perusahaan / Pinjam Meminjam Barang / Lainnya; tidak boleh duplikat dalam satu instansi | enum (relasi banyak) | **BR-003, BR-012, FR-005.** Disimpan sebagai relasi banyak (mis. tabel `instansi_kategori`), bukan satu kolom tunggal |
| alamat | Alamat | text | Tidak | maks 255 char | manual | konsisten kanonik `alamat` |
| wilayah_id | Wilayah (Prov/Kab/Kec/Kel) | lookup | Tidak | dari master Wilayah (A32) | lookup A32 | [ASUMSI] |
| no_telp | No. Telepon | text | Tidak | 7–15 digit | manual | telepon kantor instansi |
| no_hp | No. HP / Kontak | text | Tidak | 10–15 digit | manual | konsisten kanonik `no_hp` |
| nama_pic | Nama PIC/Contact Person | text | Tidak | maks 100 char | manual | |
| email | Email | text | Tidak | format email, unik | manual | BR-002, konsisten kanonik `email` |
| npwp | NPWP | text | Tidak | 15–16 digit (format NPWP) | manual | dari lampiran (atribut NPWP) |
| margin | Margin (Rp) | number (currency) | Tidak | **nominal Rupiah, ≥ 0** (bukan persen); maks sesuai kebijakan RS | manual | **BR-011, FR-013.** Satuan **Rupiah**; disimpan sebagai angka, ditampilkan format `Rp x.xxx.xxx` |
| no_pks | No. PKS | text | Tidak | maks 50 char | manual | **BR-013, FR-015.** Nomor Perjanjian Kerja Sama (tanpa unggah dokumen) |
| pks_mulai | Tanggal Mulai PKS | date | Tidak | <= pks_selesai | manual | periode PKS (mulai) |
| pks_selesai | Tanggal Selesai PKS | date | Tidak | >= pks_mulai | manual | dasar penentuan badge PKS (BR-009) |
| unit_id | Unit Penanggung Jawab | dropdown/lookup | Tidak | dari master Unit (A3) | lookup A3 | konsisten kanonik `unit` [ASUMSI] |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | konsisten kanonik `keterangan` |
| status_aktif | Status Aktif | boolean | Ya | aktif / nonaktif | default **aktif** | konsisten kanonik `status_aktif`; BR-004. **Tidak** diubah otomatis oleh badge PKS Expired (BR-009) |

> Catatan 1: **status PKS** (Aktif/Akan Berakhir/Expired) adalah nilai **turunan** yang dihitung dari `pks_selesai` saat tampil — **bukan** field input dan **tidak disimpan** sebagai kolom terpisah.
> Catatan 2: **Tidak ada field unggah berkas PKS** pada Phase 1 (BR-013) — pencatatan kerja sama cukup `no_pks` + `pks_mulai` + `pks_selesai`.
> Catatan 3: **`kategori_instansi` bersifat multi-value.** Secara data dimodelkan sebagai relasi banyak (mis. tabel jembatan `instansi_kategori(instansi_id, kategori)`), sehingga satu instansi dapat tercatat pada beberapa kategori tanpa duplikasi record.

### B. Form Import (layar INPUT) — FR-014 (Phase 2)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Instansi Rekanan | file | Ya | .csv/.xlsx, sesuai template | manual upload | konsisten kanonik `file_import` |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | konsisten kanonik `mode_import` |

> Pada template import: kolom `kode_instansi` **dikosongkan untuk baris baru** (auto-generate INSTANSI-<XXXX>); diisi hanya untuk **update**. Kolom `kategori_instansi` mendukung **beberapa nilai** dalam satu sel (multi-value, dipisah `;` — mis. `Faskes Rujukan;Lab-Radiologi Rujukan`), minimal 1 nilai valid. Kolom `margin` diisi **nominal Rupiah**. Tidak ada kolom unggah dokumen PKS (BR-013).

### C. Dashboard / List Instansi Rekanan (layar TAMPIL) — FR-001, FR-010, FR-012, FR-013

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Instansi Aktif | count instansi where status_aktif=aktif | angka besar (kartu) | – | ringkasan |
| Total PKS Expired | count instansi where pks_selesai < hari ini | angka (kartu) | – | indikator evaluasi (BR-009) |
| Kode | instansi.kode_instansi | text (INSTANSI-XXXX) | sort | BR-010 |
| Nama Instansi | instansi.nama | text | sort A-Z, search | |
| Kategori | instansi_kategori (daftar kategori) | **multi-badge** (beberapa badge per baris) | filter (keanggotaan) | BR-012; warna per kategori; instansi muncul saat filter kategori cocok salah satu badge |
| Kontak (Telp/HP) | instansi.no_telp / no_hp | text | – | |
| PIC | instansi.nama_pic | text | – | |
| Margin | instansi.margin | **Rp x.xxx.xxx** (mata uang) | sort | BR-011; nominal Rupiah |
| Periode PKS | pks_mulai – pks_selesai | tanggal (dd/mm/yyyy) | sort by pks_selesai | No. PKS dapat ditampilkan pada detail (BR-013) |
| Status PKS | derivasi dari pks_selesai vs hari ini | **badge**: hijau **Aktif** / kuning **Akan Berakhir** / merah **Expired** | filter | BR-009/FR-012; badge informatif, tidak mengubah status aktif |
| Status | instansi.status_aktif | badge (Aktif/Nonaktif) | filter | hijau/abu |
| Aksi | – | tombol Edit / Toggle Status | – | sesuai role (FR-008) |

### D. Audit Trail (layar TAMPIL) — FR-007

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit.timestamp | datetime | sort desc | |
| User | audit.user (nama/jabatan) | text | filter | |
| Aksi | audit.action | badge (Tambah/Ubah/Nonaktif) | filter | |
| Instansi | audit.kode_instansi + nama_instansi | text | search | tampilkan kode INSTANSI-XXXX |
| Perubahan | audit.before → after | teks ringkas | – | nilai sebelum→sesudah (margin format Rp; perubahan kategori ditampilkan sebagai daftar kategori sebelum→sesudah) |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-001 | Performa | Pencarian & filter data instansi rekanan tampil < 3 detik (Metrics #4); list mendukung paginasi. Filter kategori multi-value tetap memenuhi target waktu (index pada relasi `instansi_kategori`). |
| NFR-002 | Konsistensi/Real-time | Perubahan data terbaca real-time oleh modul lain tanpa restart sistem (BR-008, Metrics #3). |
| NFR-003 | Keamanan/Akses | Aksi tulis hanya untuk role Admin RS / Configuration Manager (RBAC A53); audit trail tidak dapat diubah/dihapus user biasa. |
| NFR-004 | Usability | Form dapat diselesaikan mandiri oleh user non-teknis (Metrics #2); label berbahasa Indonesia, validasi inline; input kategori multi-select intuitif (chip/checkbox); field margin menampilkan pemisah ribuan & prefix Rp. |
| NFR-005 | Auditability | Semua perubahan tercatat lengkap (user, waktu, aksi, before→after), termasuk perubahan keanggotaan kategori, dan dapat dilacak. |
| NFR-006 | Integritas Data | Data historis (instansi yang sudah dipakai pada transaksi) tidak boleh terhapus; nonaktif = soft-disable, bukan hard-delete. Penghapusan satu kategori dari instansi yang masih dirujuk transaksi historis tidak mengubah data transaksi lama. |
| NFR-007 | Ketersediaan (Tipe C&D) | Modul tetap dapat diakses pada infrastruktur sederhana; [ASUMSI] tidak memerlukan koneksi eksternal untuk operasi dasar CRUD. |
| NFR-008 | Kompatibilitas Import | Template import .csv/.xlsx dengan validasi per baris (termасuk kategori multi-value & minimal 1) dan ringkasan sukses/gagal (Phase 2). |
| NFR-009 | Integritas Penomoran | Generator `kode_instansi` harus **atomic/concurrency-safe** agar tidak menghasilkan nomor duplikat saat tambah data bersamaan (BR-010). [ASUMSI] gunakan sequence/transaksi DB. |

## 13. Integrasi Eksternal

Modul ini adalah **master data internal** dan **tidak melakukan integrasi langsung ke pihak eksternal** (BPJS/SATUSEHAT/Disdukcapil) pada Phase 1. Integrasi yang relevan bersifat **internal antar-modul** (data disuplai sebagai lookup). Karena instansi bersifat **multi-kategori**, satu record dapat disuplai ke beberapa modul konsumen sekaligus (filter per kategori berbasis keanggotaan — BR-012, FR-009):

| Tujuan | Arah | Data | Modul |
|--------|------|------|-------|
| Rujukan Masuk/Keluar | Master → konsumen | Instansi yang **memiliki** kategori **Faskes Rujukan** (lookup aktif) | Pendaftaran (FR-009) |
| Rujukan Pemeriksaan Eksternal | Master → konsumen | Instansi yang **memiliki** kategori **Lab/Radiologi Rujukan** | Penunjang Medis — lih. `g-service-pathology-order` (rujukan PA eksternal) |
| Peminjaman/Pengembalian Barang | Master → konsumen | Instansi yang **memiliki** kategori **Pinjam Meminjam Barang** | Inventory — lih. `g-backoffice-inventory-distribusi` |
| Layanan Kerja Sama / MCU | Master → konsumen | Instansi yang **memiliki** kategori **Perusahaan** | Pelayanan / Paket MCU (A44) |
| Lookup Wilayah | konsumen ← master | Provinsi/Kab/Kec/Kel | Master Wilayah (A32) [ASUMSI] |
| Lookup Unit | konsumen ← master | Unit penanggung jawab | Master Unit (A3) [ASUMSI] |

> Contoh multi-kategori: sebuah RS mitra yang memiliki kategori **Faskes Rujukan** **dan** **Lab/Radiologi Rujukan** akan muncul sebagai pilihan baik di proses Rujukan (Pendaftaran) maupun Rujukan Pemeriksaan Eksternal (Penunjang Medis) — dari **satu record yang sama**.

> [PERLU KONFIRMASI] Apakah Faskes Rujukan perlu disinkronkan dengan **kode Faskes BPJS/Aplicares** atau **kode fasyankes SATUSEHAT** untuk interoperabilitas rujukan? Bila ya, perlu field `kode_faskes` tambahan dan integrasi terkait (kemungkinan fase lanjutan). Catatan: field ini berbeda dari `kode_instansi` internal (INSTANSI-XXXX) yang murni penomoran internal.

## Asumsi
- [KONFIRMASI USER] Satu instansi **boleh memiliki lebih dari satu kategori** (multi-kategori, minimal 1). Kategori dimodelkan sebagai relasi banyak (tabel `instansi_kategori`); filter/lookup per modul berbasis keanggotaan kategori (BR-003, BR-012, FR-005, FR-009).
- [KONFIRMASI USER] Pencatatan PKS **cukup No. PKS & periode** (pks_mulai, pks_selesai); **tidak ada unggah/penyimpanan berkas dokumen PKS** pada Phase 1 (BR-013, FR-015).
- [KONFIRMASI USER] Field `margin` bersatuan **Rupiah (nominal, ≥ 0)**, bukan persen (BR-011, FR-013).
- [KONFIRMASI USER] `kode_instansi` **auto-generate** dengan format **INSTANSI-<XXXX>** (4 digit urut, leading zero), read-only, unik (BR-010, FR-011).
- [KONFIRMASI USER] Saat masa PKS habis sistem **hanya menampilkan badge Expired** dan **tidak** menonaktifkan instansi secara otomatis (BR-009, FR-012).
- [ASUMSI] Modul ini tidak memiliki BPMN sendiri; alur As-Is/To-Be diturunkan dari lampiran dokumen PRD dan pola master data sejenis (A7 Supplier) serta proses inventory (g-backoffice-inventory-*).
- [ASUMSI] Field kontak/alamat/NPWP mengikuti pola Master Data Supplier (A7) dan definisi kanonik lintas-PRD (alamat maks 255, email format email, no_hp 10–15 digit, keterangan maks 255, status_aktif boolean default aktif).
- [ASUMSI] Satu set No. PKS & periode berlaku untuk seluruh kategori dalam satu instansi (tidak per kategori) — lihat open question.
- [ASUMSI] Nonaktifkan instansi = soft-disable (data historis dipertahankan), bukan penghapusan permanen.
- [ASUMSI] Status PKS (Aktif/Akan Berakhir/Expired) adalah nilai turunan dari `pks_selesai`, dihitung saat tampil dan tidak disimpan sebagai kolom tersendiri.
- [ASUMSI] Ambang badge 'Akan Berakhir' = 30 hari sebelum `pks_selesai`.
- [ASUMSI] Lookup Wilayah (A32) dan Unit (A3) tersedia dan dipakai sebagai relasi; bila tidak diperlukan, field terkait dapat dihilangkan.
- [ASUMSI] Import/Ekspor (Phase 2) mengikuti mekanisme template master data lain (mode tambah / tambah+update, validasi per baris); kolom kode dikosongkan untuk baris baru; kolom kategori mendukung multi-value (dipisah `;`).
- [ASUMSI] Generator kode_instansi menggunakan sekuens/transaksi DB agar concurrency-safe (NFR-009).
- [ASUMSI] Pada RS Tipe C & D, operasi CRUD dasar tidak bergantung pada koneksi eksternal sehingga tetap berjalan pada infrastruktur sederhana.

## Pertanyaan Terbuka
- Tindak lanjut badge PKS: berapa hari ambang badge 'Akan Berakhir' sebelum pks_selesai? [ASUMSI 30 hari].
- Apakah Faskes Rujukan perlu dipetakan ke kode Faskes BPJS (Aplicares) atau kode fasyankes SATUSEHAT untuk interoperabilitas rujukan?
- Apakah 'Configuration Manager' adalah role terpisah dari 'Admin RS' di RBAC (A53), dan bagaimana pembagian haknya?
- Untuk format `kode_instansi` INSTANSI-<XXXX>: apa yang terjadi bila nomor urut melewati 9999 (XXXX 4 digit)? Apakah lebar digit otomatis bertambah (INSTANSI-10000) atau ada penanganan khusus? [ASUMSI lebar mengembang].
- Apakah nomor urut `kode_instansi` bersifat global (lintas kategori) atau di-reset per kategori instansi? [ASUMSI global, satu sekuens].
- Multi-kategori: apakah perlu atribut/PKS berbeda per kategori dalam satu instansi (mis. periode PKS Faskes Rujukan beda dengan PKS Lab), atau cukup satu set No.PKS & periode berlaku untuk seluruh kategori instansi? [ASUMSI satu set PKS per instansi — PERLU KONFIRMASI].
- Multi-kategori: bila kategori dihapus dari instansi yang masih memiliki transaksi historis di modul terkait, apakah perlu peringatan/pencegahan (soft-block)? [ASUMSI hanya peringatan, data historis tetap utuh].