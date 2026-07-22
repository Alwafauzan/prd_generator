# PRD — Penjualan Obat Bebas (Non-Kunjungan) — Modul Farmasi — v1.0

> **Status:** Draft markdown (diiterasi di MD sampai stabil, baru generate docx).
> **Tanggal:** 13 Juli 2026
> **Modul induk:** Farmasi
> **Approver:** M. Sulthan Farras Nanz (CSGO)
> **Technical Reviewer:** Tim Pradev
> **Referensi klien:** RS PKU Muhammadiyah Wonosobo

**Legenda penanda**
| Penanda | Arti |
|---|---|
| `[**]` | Fase 2 |
| `[***]` | Fase 3 |
| `[****]` | Fase 4 |

**Label prioritas (dua sumbu)**
`Prioritas` = P0 (wajib jalan) / P1 (penting) / P2 (nice to have) · `Rilis Pertama` = Ya/Tidak · `Effort` = S/M/L

---

## 1. Overview

Modul **Penjualan Obat Bebas (Non-Kunjungan)** memungkinkan petugas Pelayanan Farmasi mencatat transaksi penjualan obat kepada pembeli yang **tidak melalui pelayanan medis di RS** — tidak ada pendaftaran poliklinik, tidak ada kunjungan, tidak ada e-Resep dari dokter internal.

Ada dua jalur transaksi:

| Jalur | Pemicu | Cakupan barang | Data pembeli |
|---|---|---|---|
| **A. Dengan Resep** | Pembeli membawa resep (umumnya dari dokter/faskes luar) | Semua barang berjenis **Obat** (semua golongan) | **Wajib** — pasien baru atau pasien terdaftar |
| **B. Tanpa Resep** | Pembeli menyebutkan obat yang dibutuhkan (swamedikasi) | Barang berjenis **Obat** dengan **Golongan = Obat Bebas** | **Opsional** untuk Umum · **Wajib** untuk Penjamin Karyawan |

Kedua jalur berakhir pada nota pembelian yang diteruskan ke Kasir, lalu obat diserahkan setelah pembayaran/piutang tercatat.

**Catatan penamaan:** istilah pada brief awal ("Penjualan Obat Bebas Resep" vs "Penjualan Obat Bebas Tanpa Resep") diganti menjadi **Dengan Resep** / **Tanpa Resep** karena "obat bebas resep" secara farmasi justru bermakna OTC dan berpotensi salah baca oleh tim dev/QA. (Lihat D-001.)

---

## 2. Background

Saat ini transaksi penjualan obat di RS selalu terikat pada kunjungan pasien. Padahal kondisi nyata di lapangan:

1. **Pembeli membawa resep dari luar.** Pasien dengan resep dari klinik/praktik dokter di luar RS datang ke apotek RS untuk menebus obat. Tidak ada kunjungan RS, sehingga tidak ada e-Resep yang bisa jadi pemicu.
2. **Pembeli swamedikasi.** Warga sekitar membeli obat bebas (parasetamol, vitamin, dsb.) langsung tanpa resep.
3. **Karyawan RS.** Karyawan membeli obat dengan hak harga khusus dan mekanisme piutang (bukan tunai).

Tanpa modul ini, transaksi tersebut dicatat manual/di luar sistem sehingga: stok tidak terpotong akurat, pendapatan apotek tidak terekam, dan piutang karyawan sulit direkonsiliasi.

---

## 3. Scope

### 3.1 In Scope

| # | Item | Tag |
|---|---|---|
| IS-01 | Pencarian pasien terdaftar + pendaftaran pembeli baru (ringkas, mendapat No. RM) | `[BANGUN]` |
| IS-02 | Pemilihan cara bayar: **Umum** dan **Penjamin Karyawan** (dengan pemilihan karyawan) | `[BANGUN]` |
| IS-03 | Input item obat **non-racik** (nama obat, jumlah, aturan pakai, dosis) | `[EMR]` |
| IS-04 | Input item obat **racik** (nama racikan, jumlah, komponen + dosis, aturan pakai) | `[EMR]` |
| IS-05 | Input penjualan tanpa resep (nama obat + jumlah, terbatas golongan Obat Bebas) | `[BANGUN]` |
| IS-06 | Penetapan harga otomatis berdasarkan cara bayar (Harga Umum / Harga Karyawan) | `[BANGUN]` |
| IS-07 | Simpan transaksi + potong stok depo | `[BANGUN]` |
| IS-08 | Cetak/ulang cetak nota pembelian | `[BANGUN]` |
| IS-09 | Pantau status pembayaran dari Kasir + tandai penyerahan obat | `[BANGUN]` |
| IS-10 | Batal transaksi + pengembalian stok | `[BANGUN]` |
| IS-11 | Dashboard/daftar transaksi penjualan bebas | `[BANGUN]` |

### 3.2 Out of Scope

| # | Item | Alasan |
|---|---|---|
| OS-01 | Proses pembayaran itu sendiri (kasir, metode bayar, kembalian, refund) | Domain modul Kasir |
| OS-02 | Rekapitulasi & pemotongan gaji atas piutang karyawan | Domain modul Keuangan/HR |
| OS-03 | Skrining resep oleh apoteker (kelengkapan/legalitas/klinis) | Diputuskan tidak dipakai — lihat D-009 |
| OS-04 | Penjualan alkes/BHP/barang non-obat | Cakupan dibatasi jenis barang = Obat (D-004) |
| OS-05 | Pengadaan, mutasi antar-depo, stok opname | Domain modul Logistik Farmasi |
| OS-06 | Klaim BPJS / penjamin asuransi pihak ketiga | Hanya Umum & Penjamin Karyawan di modul ini |
| OS-07 | Retur obat setelah diserahkan | Fase 2 `[**]` |

---

## 4. Goals & Metrics

| # | Tujuan | Metrik | Target |
|---|---|---|---|
| G-01 | Seluruh penjualan non-kunjungan tercatat di sistem | % transaksi apotek non-kunjungan yang tercatat di Neurovi | ≥ 95% dalam 1 bulan pasca go-live |
| G-02 | Stok farmasi akurat | Selisih stok fisik vs sistem pada item obat bebas | ≤ 2% saat stok opname |
| G-03 | Transaksi cepat di loket | Waktu input transaksi tanpa resep (3 item) | ≤ 60 detik |
| G-04 | Piutang karyawan terekam rapi | % transaksi Penjamin Karyawan yang punya identitas karyawan valid | 100% |
| G-05 | Tidak ada obat keras terjual tanpa resep | Jumlah item non-Obat Bebas yang lolos di jalur Tanpa Resep | 0 (dicegah sistem) |

---

## 5. Related Feature

| Modul/Fitur terkait | Hubungan |
|---|---|
| **Master Data Pasien** | Sumber pencarian pasien & penerbitan No. RM |
| **Master Data Barang Farmasi** | Sumber nama obat, jenis barang, golongan obat, harga umum, harga karyawan |
| **Master Data Staf/Karyawan** | Sumber dropdown karyawan penjamin |
| **Master Data Penomoran** | Sumber format nomor transaksi/nota |
| **Komponen e-Resep v2 (racik & non-racik)** | Dipakai ulang untuk input item resep — `[EMR]` |
| **Modul Stok/Depo Farmasi** | Target pemotongan & pengembalian stok |
| **Modul Kasir** | Menerima tagihan, mengembalikan status Lunas / Piutang Karyawan |

---

## 6. Business Process

### 6.1 To-Be

**Jalur A — Dengan Resep**
1. Pembeli datang ke Pelayanan Farmasi membawa resep.
2. Petugas mencari data pasien; jika belum ada, mendaftarkan pembeli baru (form ringkas → dapat No. RM).
3. Petugas memilih cara bayar: **Umum** atau **Penjamin Karyawan** (jika karyawan, pilih nama karyawan dari dropdown).
4. Petugas menginput item resep sesuai yang tertulis — non-racik dan/atau racik.
5. Petugas klik **Simpan** → nomor transaksi terbit, **stok terpotong**, status menjadi *Menunggu Pembayaran*.
6. Petugas mencetak nota pembelian dan mengarahkan pembeli ke Kasir.
7. Kasir memproses → status berubah menjadi *Lunas* (Umum) atau *Piutang Karyawan* (Penjamin Karyawan).
8. Petugas Farmasi melihat status sudah selesai → menyerahkan obat → menandai *Diserahkan*.

**Jalur B — Tanpa Resep**
1. Pembeli datang menyebutkan obat yang dibutuhkan.
2. Petugas memilih cara bayar: **Umum** (identitas opsional) atau **Penjamin Karyawan** (identitas karyawan wajib).
3. Petugas menginput nama obat + jumlah. Dropdown obat **hanya menampilkan barang berjenis Obat dengan golongan Obat Bebas**.
4. Petugas klik **Simpan** → nomor transaksi terbit, **stok terpotong**, status *Menunggu Pembayaran*.
5. Cetak nota → arahkan ke Kasir.
6. Kasir memproses → status *Lunas* / *Piutang Karyawan*.
7. Petugas menyerahkan obat → tandai *Diserahkan*.

---

## 7. Main Flow (Skenario)

### Skenario 1 — Pembeli lama, dengan resep, cara bayar Umum
Cari pasien by NIK/No. RM/nama → ketemu → pilih Umum → input 2 item non-racik + 1 racikan → Simpan → stok terpotong → cetak nota → pembeli ke kasir → Lunas → obat diserahkan.

### Skenario 2 — Pembeli baru, dengan resep, cara bayar Umum
Cari pasien → tidak ketemu → klik **Daftarkan Pembeli Baru** → isi form ringkas (Nama, NIK, Tgl Lahir, JK, Alamat, No. HP) → No. RM terbit → lanjut input resep → Simpan → nota → kasir → Lunas → serah obat.

### Skenario 3 — Karyawan RS, dengan resep
Cari/daftarkan pasien → pilih **Penjamin Karyawan** → dropdown karyawan muncul → pilih karyawan → **harga otomatis berubah ke Harga Karyawan** → input resep → Simpan → nota bertanda *Piutang Karyawan* → kasir memposting piutang → status *Piutang Karyawan* → serah obat.

### Skenario 4 — Pembeli anonim, tanpa resep, Umum
Tidak isi identitas → pilih Umum → input "Paracetamol 500mg — 10" → Simpan → nota → kasir → Lunas → serah obat.

### Skenario 5 — Tanpa resep, cara bayar Penjamin Karyawan
Pilih Penjamin Karyawan → **sistem mewajibkan identitas pembeli** → pilih karyawan → input item (hanya golongan Obat Bebas tersedia) → Simpan → *Piutang Karyawan* → serah obat.

### Skenario 6 — Stok tidak cukup
Petugas menginput jumlah > sisa stok depo → sistem menolak Simpan dan menampilkan sisa stok tersedia per item.

### Skenario 7 — Transaksi dibatalkan sebelum bayar
Pembeli batal di kasir → petugas Farmasi klik **Batal Transaksi** → wajib isi alasan → **stok dikembalikan** → status *Dibatalkan* → nota tidak berlaku.

### Skenario 8 — Nota hilang
Petugas membuka transaksi dari dashboard → **Cetak Ulang Nota**. Setiap cetak ulang tercatat di audit trail.

---

## 8. Business Rules

| ID | Aturan | Trace |
|---|---|---|
| BR-001 | Modul ini **tidak memerlukan kunjungan/pendaftaran pelayanan medis**. Transaksi berdiri sendiri. | FR-001 |
| BR-002 | Data pembeli disimpan di **master pasien yang sama** dengan pasien RS dan memperoleh **No. RM**. Tidak ada master identitas terpisah. | FR-002, D-002 |
| BR-003 | Pendaftaran pembeli baru memakai **form ringkas**, bukan form Pendaftaran RJ lengkap. Field minimum: Nama, NIK, Tanggal Lahir, Jenis Kelamin, Alamat, No. HP. | FR-002 |
| BR-004 | Jalur **Dengan Resep**: identitas pembeli **wajib**. | FR-002 |
| BR-005 | Jalur **Tanpa Resep** + cara bayar **Umum**: identitas pembeli **opsional**. Transaksi boleh anonim. | FR-002, D-003 |
| BR-006 | Cara bayar **Penjamin Karyawan** (jalur mana pun): identitas pembeli **wajib** dan **karyawan penjamin wajib dipilih**. | FR-003 |
| BR-007 | Cara bayar hanya dua: **Umum** dan **Penjamin Karyawan**. Tidak ada BPJS/asuransi di modul ini. | FR-003 |
| BR-008 | Dropdown karyawan bersumber dari **Master Data Staf** dengan status aktif. Karyawan non-aktif tidak muncul. | FR-003 |
| BR-009 | Cara bayar **Umum** → harga item memakai **Harga Umum**. Cara bayar **Penjamin Karyawan** → harga item memakai **Harga Karyawan**. Keduanya dari Master Data Barang Farmasi. | FR-003, FR-007, D-005 |
| BR-010 | Perubahan cara bayar **setelah item terinput** akan **menghitung ulang seluruh harga item**. Sistem menampilkan konfirmasi sebelum menghitung ulang. | FR-003 |
| BR-011 | Jalur **Dengan Resep**: dropdown obat menampilkan **seluruh barang berjenis Obat**, semua golongan. | FR-004, FR-005, D-004 |
| BR-012 | Jalur **Tanpa Resep**: dropdown obat **hanya** menampilkan barang berjenis **Obat** dengan **Golongan Obat = Obat Bebas**. Golongan lain tidak dapat dipilih dengan cara apa pun. | FR-006, D-004 |
| BR-013 | Jalur **Tanpa Resep** tidak memiliki field aturan pakai, dosis, dan tidak mendukung racikan. Hanya **nama obat + jumlah**. | FR-006 |
| BR-014 | Jalur **Dengan Resep** mendukung item **non-racik** dan **racik**. Komponen input racik/non-racik **dipakai ulang dari e-Resep v2**, tidak dibangun ulang. | FR-004, FR-005, D-008 |
| BR-015 | **Stok dipotong pada saat tombol Simpan diklik** oleh petugas Pelayanan Farmasi — bukan saat pembayaran, bukan saat penyerahan. | FR-008, D-006 |
| BR-016 | Sistem **menolak Simpan** apabila ada item dengan jumlah melebihi sisa stok depo asal. Pesan error menyebutkan item dan sisa stoknya. | FR-008 |
| BR-017 | Depo asal pemotongan stok mengikuti **depo yang terpasang pada user login**. | FR-008 |
| BR-018 | Setiap transaksi memperoleh **Nomor Transaksi** dari **Master Data Penomoran**. Nomor terbit saat Simpan, tidak berubah setelahnya. | FR-008 |
| BR-019 | Setelah Simpan, transaksi **tidak dapat diedit**. Koreksi dilakukan lewat **Batal Transaksi** lalu input ulang. | FR-010, D-007 |
| BR-020 | **Batal Transaksi** hanya boleh dilakukan selama status masih *Menunggu Pembayaran*. Batal **mengembalikan stok** ke depo asal dan **wajib disertai alasan**. | FR-010 |
| BR-021 | Transaksi yang sudah *Lunas* / *Piutang Karyawan* **tidak dapat dibatalkan** dari modul Farmasi. Pembatalan setelah bayar adalah domain Kasir. | FR-010 |
| BR-022 | Status pembayaran **dibaca langsung dari sistem**. Bukti bayar fisik hanya cadangan, bukan syarat teknis penyerahan. | FR-009, D-010 |
| BR-023 | Obat **tidak boleh ditandai Diserahkan** selama status transaksi belum *Lunas* atau *Piutang Karyawan*. Tombol Serahkan Obat nonaktif. | FR-009 |
| BR-024 | Transaksi **Penjamin Karyawan tetap melalui Kasir** untuk pencatatan piutang. Tidak ada pembayaran tunai; Kasir memposting sebagai piutang karyawan. `[ASUMSI]` | FR-009, D-011, OQ-01 |
| BR-025 | Nota pembelian memuat minimal: Nomor Transaksi, tanggal/jam, identitas pembeli (jika ada), cara bayar, rincian item + jumlah + harga satuan + subtotal, total, nama petugas. | FR-011 |
| BR-026 | **Cetak ulang nota** diperbolehkan tanpa batas dan **tercatat di audit trail** (siapa, kapan). | FR-011 |
| BR-027 | Seluruh aksi (Simpan, Batal, Serah Obat, Cetak Ulang) tercatat di **audit trail** dengan user, waktu, dan nilai sebelum/sesudah. | NFR-005 |
| BR-028 | Transaksi *Menunggu Pembayaran* yang belum diselesaikan hingga **akhir hari** akan **ditandai** di dashboard sebagai perlu ditindaklanjuti (stok masih tertahan). Tidak ada pembatalan otomatis. `[ASUMSI]` | FR-012, OQ-02 |
| BR-029 | Harga yang tersimpan pada transaksi adalah **snapshot harga saat Simpan**. Perubahan harga di master setelahnya tidak mengubah transaksi lama. | FR-008 |
| BR-030 | Jika barang tidak memiliki **Harga Karyawan** di master, sistem **menolak** pemakaian cara bayar Penjamin Karyawan untuk item tersebut dan menampilkan pesan jelas. | FR-003, FR-007 |

---

## 9. State Machine

### 9.1 Status Transaksi

```
[Draft] --Simpan--> [Menunggu Pembayaran] --Kasir: bayar--> [Lunas] --Serahkan Obat--> [Diserahkan]
                            |                     \
                            |                      --Kasir: posting piutang--> [Piutang Karyawan] --Serahkan Obat--> [Diserahkan]
                            |
                            --Batal Transaksi--> [Dibatalkan]
```

| Status | Arti | Stok | Aksi tersedia |
|---|---|---|---|
| **Draft** | Sedang diinput, belum disimpan | Belum terpotong | Simpan |
| **Menunggu Pembayaran** | Sudah disimpan, nota terbit | **Sudah terpotong** | Cetak nota, Cetak ulang, Batal Transaksi |
| **Lunas** | Kasir menerima pembayaran (Umum) | Sudah terpotong | Serahkan Obat, Cetak ulang |
| **Piutang Karyawan** | Kasir memposting piutang (Penjamin Karyawan) | Sudah terpotong | Serahkan Obat, Cetak ulang |
| **Diserahkan** | Obat sudah diterima pembeli | Sudah terpotong | Cetak ulang (read-only) |
| **Dibatalkan** | Dibatalkan sebelum bayar | **Dikembalikan** | Cetak ulang (read-only, bertanda BATAL) |

**Catatan penting:** karena stok terpotong sejak *Menunggu Pembayaran*, transaksi yang menggantung menahan stok. Karena itu BR-028 mewajibkan penandaan di dashboard.

---

## 10. Functional Requirements

### F-01 · Pencarian & Pendaftaran Pembeli
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** M · `[BANGUN]`

**User Story (US-001)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **mencari pasien terdaftar atau mendaftarkan pembeli baru dengan cepat**, agar **transaksi bisa dilanjutkan tanpa harus membuka modul pendaftaran**.

**Alur**
1. Petugas membuka Penjualan Obat Bebas → pilih jalur (Dengan Resep / Tanpa Resep).
2. Pada panel Data Pembeli, petugas mencari dengan **No. RM / NIK / Nama / No. HP**.
3. Jika ditemukan → pilih → data terisi otomatis (read-only).
4. Jika tidak ditemukan → klik **Daftarkan Pembeli Baru** → form ringkas muncul → isi → Simpan → **No. RM terbit**.
5. Pada jalur Tanpa Resep + Umum, panel ini bisa dilewati (BR-005).

**Aturan** — BR-002, BR-003, BR-004, BR-005, BR-006

**Konteks Operasional**
Antrean apotek panjang di jam sibuk dan turnover petugas tinggi. Form pendaftaran harus ringkas dan tidak menuntut data yang tidak dimiliki pembeli walk-in.

**Acceptance Criteria (FR-001, FR-002)**
- [ ] Pencarian dapat dilakukan minimal dengan No. RM, NIK, Nama, dan No. HP.
- [ ] Hasil pencarian menampilkan Nama, No. RM, NIK, Tgl Lahir, Alamat.
- [ ] Tombol **Daftarkan Pembeli Baru** tersedia dan membuka form ringkas (Nama, NIK, Tgl Lahir, JK, Alamat, No. HP).
- [ ] Pembeli baru mendapat No. RM dari penomoran master pasien.
- [ ] Pada jalur Dengan Resep, Simpan diblokir jika Data Pembeli kosong.
- [ ] Pada jalur Tanpa Resep + Umum, Simpan tetap berhasil meski Data Pembeli kosong.
- [ ] Pada cara bayar Penjamin Karyawan, Simpan diblokir jika Data Pembeli kosong.

---

### F-02 · Pemilihan Cara Bayar (Umum / Penjamin Karyawan)
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** M · `[BANGUN]`

**User Story (US-002)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **memilih cara bayar Umum atau Penjamin Karyawan**, agar **harga yang tampil dan mekanisme penagihannya sesuai hak pembeli**.

**Alur**
1. Petugas memilih **Cara Bayar**: Umum / Penjamin Karyawan.
2. Jika **Penjamin Karyawan** → muncul dropdown **Karyawan** (dari Master Data Staf aktif) → petugas memilih nama karyawan.
3. Sistem mengunci basis harga: Umum → Harga Umum; Penjamin Karyawan → Harga Karyawan.
4. Jika cara bayar diubah setelah ada item → sistem menampilkan konfirmasi lalu menghitung ulang seluruh harga.

**Aturan** — BR-006, BR-007, BR-008, BR-009, BR-010, BR-030

**Konteks Operasional**
Penjamin Karyawan adalah **penanda ganda**: (a) transaksi dicatat sebagai **piutang** (bukan tunai), dan (b) harga item memakai **harga khusus karyawan**. Keduanya berlaku bersamaan, tidak bisa dipisah.

**Acceptance Criteria (FR-003)**
- [ ] Cara bayar hanya menyediakan dua opsi: Umum, Penjamin Karyawan.
- [ ] Dropdown Karyawan hanya muncul saat Penjamin Karyawan dipilih.
- [ ] Dropdown Karyawan hanya berisi staf berstatus aktif, dapat dicari dengan ketik nama/NIP.
- [ ] Memilih Penjamin Karyawan tanpa memilih nama karyawan → Simpan diblokir.
- [ ] Harga item berubah otomatis mengikuti cara bayar.
- [ ] Mengubah cara bayar saat item sudah terinput → muncul konfirmasi, lalu semua harga dihitung ulang.
- [ ] Jika ada item tanpa Harga Karyawan di master → pesan error jelas menyebut nama item, Simpan diblokir.

---

### F-03 · Input Item Resep — Non Racik
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** M · `[EMR]`

**User Story (US-003)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **menginput obat non-racik sesuai resep yang dibawa pembeli**, agar **transaksi sesuai dengan resep tertulis**.

**Alur**
1. Pada tab Non Racik, petugas klik **Tambah Item**.
2. Pilih **Nama Obat** (dropdown, cari-ketik, menampilkan sisa stok).
3. Isi **Jumlah**, **Aturan Pakai** (signa), **Dosis**.
4. Sistem menampilkan harga satuan dan subtotal sesuai cara bayar.
5. Ulangi untuk item berikutnya.

**Aturan** — BR-011, BR-014, BR-016, BR-029

**Konteks Operasional**
Komponen ini **dipakai ulang** dari e-Resep v2 yang sudah ada. Yang berbeda hanya sumber pemicunya (resep luar, bukan e-Resep dokter internal).

**Acceptance Criteria (FR-004)**
- [ ] Dropdown obat menampilkan seluruh barang berjenis **Obat** (semua golongan).
- [ ] Setiap baris obat menampilkan **sisa stok** di depo user.
- [ ] Field Jumlah, Aturan Pakai, Dosis tersedia dan wajib diisi.
- [ ] Jumlah > sisa stok → baris ditandai merah, Simpan diblokir.
- [ ] Harga satuan & subtotal tampil dan mengikuti cara bayar.
- [ ] Item dapat dihapus selama status masih Draft.

---

### F-04 · Input Item Resep — Racik
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** M · `[EMR]`

**User Story (US-004)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **menginput obat racikan beserta komponennya**, agar **resep racikan dari luar bisa ditebus di apotek RS**.

**Alur**
1. Pada tab Racik, petugas klik **Tambah Racikan**.
2. Isi **Nama Racikan**, **Jumlah Racikan**, **Aturan Pakai**.
3. Tambahkan **komponen obat**: nama obat + jumlah/dosis per komponen.
4. Sistem menghitung total kebutuhan tiap komponen (jumlah per racikan × jumlah racikan) dan menampilkan subtotal.

**Aturan** — BR-011, BR-014, BR-016, BR-029

**Konteks Operasional**
Struktur data dan komponen UI mengikuti implementasi racikan yang sudah ada di e-Resep v2 agar tidak ada dua sumber kebenaran untuk perhitungan racikan.

**Acceptance Criteria (FR-005)**
- [ ] Satu transaksi dapat memuat lebih dari satu racikan.
- [ ] Satu racikan dapat memuat banyak komponen obat.
- [ ] Kebutuhan stok tiap komponen = jumlah per racikan × jumlah racikan.
- [ ] Validasi stok berlaku pada level komponen, bukan level racikan.
- [ ] Total kebutuhan komponen melebihi stok → Simpan diblokir dengan pesan menyebut komponen tersebut.
- [ ] Racikan dan komponennya dapat dihapus selama status Draft.

---

### F-05 · Input Penjualan Tanpa Resep
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** S · `[BANGUN]`

**User Story (US-005)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **menginput obat bebas hanya dengan nama dan jumlah**, agar **penjualan swamedikasi cepat dan tidak mungkin salah menjual obat keras**.

**Alur**
1. Petugas memilih jalur **Tanpa Resep**.
2. Klik **Tambah Item** → pilih **Nama Obat** → isi **Jumlah**.
3. Sistem menampilkan harga satuan dan subtotal.

**Aturan** — BR-012, BR-013, BR-016, BR-029

**Konteks Operasional**
Pembatasan golongan obat adalah **pengaman utama** modul ini. Petugas apotek dengan turnover tinggi tidak boleh bergantung pada hafalan golongan obat — sistem yang harus mencegah.

**Acceptance Criteria (FR-006)**
- [ ] Dropdown obat **hanya** memuat barang berjenis Obat **dan** golongan **Obat Bebas**.
- [ ] Obat golongan lain (keras/psikotropika/narkotika/bebas terbatas) **tidak muncul** dan tidak dapat dipilih lewat cara apa pun (termasuk pencarian manual).
- [ ] Form tidak memiliki field Aturan Pakai dan Dosis.
- [ ] Tab/opsi Racik tidak tersedia pada jalur ini.
- [ ] Sisa stok tampil per baris; jumlah > stok → Simpan diblokir.

---

### F-06 · Penetapan Harga Otomatis
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** S · `[BANGUN]`

**User Story (US-006)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **harga terisi otomatis sesuai cara bayar**, agar **tidak ada salah hitung harga karyawan secara manual**.

**Aturan** — BR-009, BR-029, BR-030

**Acceptance Criteria (FR-007)**
- [ ] Harga satuan diambil dari Master Data Barang Farmasi sesuai cara bayar.
- [ ] Harga satuan **tidak dapat diedit manual** oleh petugas.
- [ ] Total transaksi = jumlah seluruh subtotal item (termasuk komponen racikan).
- [ ] Harga yang tersimpan adalah snapshot saat Simpan.

---

### F-07 · Simpan Transaksi & Potong Stok
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** L · `[BANGUN]`

**User Story (US-007)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **menyimpan transaksi dan stok langsung terpotong**, agar **catatan stok selalu mencerminkan obat yang sudah disisihkan untuk pembeli**.

**Alur**
1. Petugas klik **Simpan**.
2. Sistem memvalidasi: identitas (sesuai jalur & cara bayar), karyawan penjamin, minimal 1 item, ketersediaan stok, ketersediaan harga.
3. Bila lolos → **Nomor Transaksi terbit**, **stok dipotong dari depo user**, status → *Menunggu Pembayaran*, tagihan dikirim ke Kasir.
4. Bila gagal → error ditampilkan per field/per item; tidak ada stok yang terpotong.

**Aturan** — BR-015, BR-016, BR-017, BR-018, BR-019, BR-029, BR-030

**Konteks Operasional**
Pemotongan stok di titik Simpan (bukan penyerahan) berarti obat dianggap "sudah disisihkan". Konsekuensinya: transaksi menggantung menahan stok → ditangani lewat F-09 (Batal) dan penandaan dashboard (F-10).

**Acceptance Criteria (FR-008)**
- [ ] Simpan gagal jika tidak ada item.
- [ ] Simpan gagal jika stok tidak mencukupi; **tidak ada pemotongan parsial**.
- [ ] Pemotongan stok bersifat **atomik** — semua item terpotong atau tidak sama sekali.
- [ ] Nomor Transaksi mengikuti Master Data Penomoran dan unik.
- [ ] Setelah Simpan, seluruh field menjadi read-only.
- [ ] Tagihan otomatis muncul di antrean Kasir.

---

### F-08 · Pantau Status Pembayaran & Penyerahan Obat
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** M · `[BANGUN]`

**User Story (US-008)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **melihat status pembayaran langsung di sistem**, agar **saya tidak perlu bergantung pada bukti bayar fisik untuk menyerahkan obat**.

**Alur**
1. Petugas membuka transaksi dari dashboard.
2. Status pembayaran tampil real-time: *Menunggu Pembayaran* → *Lunas* / *Piutang Karyawan*.
3. Setelah status selesai, tombol **Serahkan Obat** aktif.
4. Petugas menyerahkan obat → klik **Serahkan Obat** → status *Diserahkan*, tercatat waktu & nama petugas.

**Aturan** — BR-022, BR-023, BR-024

**Konteks Operasional**
Alur asli menyebut pembeli menyerahkan bukti bayar fisik. Karena status sudah terbaca sistem, bukti fisik menjadi cadangan (mis. saat jaringan bermasalah), bukan syarat teknis.

**Acceptance Criteria (FR-009)**
- [ ] Status pembayaran diperbarui otomatis tanpa perlu refresh manual.
- [ ] Tombol **Serahkan Obat** nonaktif selama status *Menunggu Pembayaran*.
- [ ] Tombol aktif pada status *Lunas* dan *Piutang Karyawan*.
- [ ] Penyerahan mencatat waktu dan nama petugas penyerah.
- [ ] Setelah *Diserahkan*, transaksi read-only.

---

### F-09 · Batal Transaksi & Pengembalian Stok
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** M · `[BANGUN]`

**User Story (US-009)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **membatalkan transaksi yang belum dibayar dan stoknya kembali**, agar **stok tidak tertahan oleh transaksi yang batal atau salah input**.

**Alur**
1. Petugas membuka transaksi berstatus *Menunggu Pembayaran*.
2. Klik **Batal Transaksi** → modal alasan pembatalan (wajib).
3. Konfirmasi → **stok dikembalikan ke depo asal** → status *Dibatalkan* → tagihan di Kasir dibatalkan.

**Aturan** — BR-019, BR-020, BR-021, BR-027

**Konteks Operasional**
Karena transaksi tidak bisa diedit (BR-019), Batal Transaksi adalah satu-satunya jalur koreksi. Ini akan sering dipakai — UX-nya tidak boleh berbelit.

**Acceptance Criteria (FR-010)**
- [ ] Tombol Batal hanya muncul pada status *Menunggu Pembayaran*.
- [ ] Alasan pembatalan wajib diisi.
- [ ] Stok dikembalikan tepat sejumlah yang dipotong, ke depo yang sama.
- [ ] Transaksi *Lunas* / *Piutang Karyawan* / *Diserahkan* tidak menampilkan tombol Batal.
- [ ] Pembatalan tercatat di audit trail (user, waktu, alasan).
- [ ] Nota transaksi batal dapat dicetak ulang dengan tanda **BATAL**.

---

### F-10 · Nota Pembelian
**Owner:** Pelayanan Farmasi · **Prioritas:** P0 · **Rilis Pertama:** Ya · **Effort:** S · `[BANGUN]`

**User Story (US-010)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **mencetak nota pembelian**, agar **pembeli punya rincian tagihan saat menuju kasir**.

**Aturan** — BR-025, BR-026

**Acceptance Criteria (FR-011)**
- [ ] Nota tercetak otomatis setelah Simpan berhasil.
- [ ] Nota memuat: Nomor Transaksi, tanggal/jam, identitas pembeli (jika ada), cara bayar, nama karyawan penjamin (jika ada), rincian item + jumlah + harga satuan + subtotal, total, nama petugas.
- [ ] Nota Penjamin Karyawan bertanda **PIUTANG KARYAWAN**.
- [ ] Tersedia **Cetak Ulang** dari dashboard; setiap cetak ulang tercatat di audit trail.

---

### F-11 · Dashboard Transaksi Penjualan Bebas
**Owner:** Pelayanan Farmasi · **Prioritas:** P1 · **Rilis Pertama:** Ya · **Effort:** M · `[BANGUN]`

**User Story (US-011)**
Sebagai **petugas Pelayanan Farmasi**, saya ingin **melihat daftar transaksi hari ini beserta statusnya**, agar **saya tahu mana yang masih menunggu pembayaran dan mana yang siap diserahkan**.

**Aturan** — BR-028

**Acceptance Criteria (FR-012)**
- [ ] Daftar menampilkan: No. Transaksi, waktu, nama pembeli, jalur (Dengan/Tanpa Resep), cara bayar, total, status.
- [ ] Filter: tanggal, status, cara bayar, jalur.
- [ ] Pencarian: No. Transaksi, nama pembeli, No. RM.
- [ ] Transaksi *Menunggu Pembayaran* yang melewati akhir hari **ditandai** secara visual.
- [ ] Aksi cepat per baris: Lihat, Cetak Ulang, Serahkan Obat, Batal.

---

## 11. Data Requirements

### 11.1 Layar INPUT — Panel Data Pembeli

| Field | Tipe | Wajib | Sumber | Default | Validasi | Catatan |
|---|---|---|---|---|---|---|
| Pencarian Pasien | Text (search) | – | Master Pasien | Kosong | Min. 3 karakter | Cari by RM/NIK/Nama/No. HP |
| No. RM | Text | Auto | Master Pasien | Auto | Read-only | Terbit saat pendaftaran baru |
| Nama Lengkap | Text | Ya* | Input/Master | – | Maks 100 kar. | *Wajib: Dengan Resep, atau Penjamin Karyawan |
| NIK | Text | Ya* | Input/Master | – | 16 digit numerik | *Sama seperti di atas |
| Tanggal Lahir | Date | Ya* | Input/Master | – | ≤ hari ini | |
| Jenis Kelamin | Dropdown | Ya* | Input/Master | – | L / P | |
| Alamat | Textarea | Ya* | Input/Master | – | Maks 255 kar. | |
| No. HP | Text | Tidak | Input/Master | – | Numerik | |

### 11.2 Layar INPUT — Panel Cara Bayar

| Field | Tipe | Wajib | Sumber | Default | Validasi | Catatan |
|---|---|---|---|---|---|---|
| Cara Bayar | Radio | Ya | – | Umum | Umum / Penjamin Karyawan | |
| Karyawan Penjamin | Dropdown (search) | Ya jika Penjamin Karyawan | Master Data Staf (aktif) | – | Harus dipilih | Tampil hanya jika Penjamin Karyawan |

### 11.3 Layar INPUT — Item Non Racik (Jalur Dengan Resep)

| Field | Tipe | Wajib | Sumber | Default | Validasi | Catatan |
|---|---|---|---|---|---|---|
| Nama Obat | Dropdown (search) | Ya | Master Barang Farmasi (jenis = Obat) | – | Harus dari master | Menampilkan sisa stok |
| Jumlah | Number | Ya | Input | – | > 0 dan ≤ sisa stok | |
| Aturan Pakai | Text | Ya | Input | – | Maks 100 kar. | Signa |
| Dosis | Text | Ya | Input | – | Maks 50 kar. | |
| Harga Satuan | Currency | Auto | Master Barang | Auto | Read-only | Sesuai cara bayar |
| Subtotal | Currency | Auto | Sistem | Auto | Read-only | Jumlah × Harga Satuan |

### 11.4 Layar INPUT — Item Racik (Jalur Dengan Resep)

| Field | Tipe | Wajib | Sumber | Default | Validasi | Catatan |
|---|---|---|---|---|---|---|
| Nama Racikan | Text | Ya | Input | – | Maks 100 kar. | |
| Jumlah Racikan | Number | Ya | Input | – | > 0 | |
| Aturan Pakai | Text | Ya | Input | – | Maks 100 kar. | |
| Komponen — Nama Obat | Dropdown (search) | Ya | Master Barang Farmasi (jenis = Obat) | – | Harus dari master | Minimal 1 komponen |
| Komponen — Jumlah/Dosis | Number | Ya | Input | – | > 0 | Per satu racikan |
| Komponen — Total Kebutuhan | Number | Auto | Sistem | Auto | ≤ sisa stok | Jumlah komponen × Jumlah Racikan |

### 11.5 Layar INPUT — Item Tanpa Resep

| Field | Tipe | Wajib | Sumber | Default | Validasi | Catatan |
|---|---|---|---|---|---|---|
| Nama Obat | Dropdown (search) | Ya | Master Barang Farmasi (**jenis = Obat DAN golongan = Obat Bebas**) | – | Harus dari master terfilter | Golongan lain tidak muncul |
| Jumlah | Number | Ya | Input | – | > 0 dan ≤ sisa stok | |
| Harga Satuan | Currency | Auto | Master Barang | Auto | Read-only | |
| Subtotal | Currency | Auto | Sistem | Auto | Read-only | |

### 11.6 Data TER-GENERATE saat Simpan

| Field | Sumber | Catatan |
|---|---|---|
| Nomor Transaksi | Master Data Penomoran | Unik, tidak berubah |
| Tanggal & Jam Transaksi | Sistem | Waktu server |
| Jalur Transaksi | Konteks | Dengan Resep / Tanpa Resep |
| Depo Asal | User login | Target pemotongan stok |
| Petugas Input | User login | |
| Status | Sistem | Default: Menunggu Pembayaran |
| Snapshot Harga per Item | Master Barang | Sesuai cara bayar saat Simpan |
| Total Transaksi | Sistem | Jumlah seluruh subtotal |
| Mutasi Stok (keluar) | Sistem | Per item/komponen, ke modul Stok |
| Tagihan ke Kasir | Sistem | Otomatis terkirim |

### 11.7 Layar TAMPIL — Dashboard

| Kolom | Sumber | Catatan |
|---|---|---|
| No. Transaksi | Transaksi | |
| Waktu | Transaksi | |
| Nama Pembeli | Master Pasien | "—" jika anonim |
| Jalur | Transaksi | Dengan Resep / Tanpa Resep |
| Cara Bayar | Transaksi | Umum / Penjamin Karyawan (+ nama karyawan) |
| Total | Transaksi | |
| Status | Transaksi | Badge berwarna |
| Penanda Menggantung | Sistem | Muncul jika *Menunggu Pembayaran* lewat akhir hari (BR-028) |

### 11.8 Dependensi Master Data

| Master | Field yang dibutuhkan | Status |
|---|---|---|
| Master Barang Farmasi | Jenis Barang, **Golongan Obat**, **Harga Umum**, **Harga Karyawan**, Satuan | Golongan Obat **sudah ada** (dikonfirmasi). Harga Karyawan → `[PERLU KONFIRMASI]` apakah sudah tersedia |
| Master Data Staf | Nama, NIP, Status Aktif | Diasumsikan tersedia |
| Master Data Penomoran | Format nomor transaksi penjualan bebas | Perlu penambahan jenis penomoran baru |
| Master Pasien | Seluruh field identitas ringkas | Tersedia |

---

## 12. Non-Functional Requirements

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-001 | Waktu muat halaman input | ≤ 2 detik pada koneksi RS |
| NFR-002 | Waktu respons pencarian obat (dropdown) | ≤ 1 detik untuk 5.000+ item master |
| NFR-003 | Pemotongan stok bersifat **atomik & anti-race-condition** — dua petugas menyimpan item yang sama bersamaan tidak boleh membuat stok negatif | Wajib (locking di level stok) |
| NFR-004 | Status pembayaran dari Kasir tampil di Farmasi | ≤ 3 detik setelah Kasir memproses |
| NFR-005 | Audit trail lengkap untuk Simpan, Batal, Serah Obat, Cetak Ulang | Wajib, immutable |
| NFR-006 | Infrastruktur RS tidak stabil — form harus mempertahankan input saat koneksi terputus sementara dan menampilkan status koneksi | Wajib |
| NFR-007 | Nota tercetak dalam ≤ 5 detik setelah Simpan | |
| NFR-008 | RBAC: hanya role **Petugas Farmasi / Apoteker / TTK** yang dapat mengakses modul ini | Wajib |
| NFR-009 | Data identitas pembeli tunduk pada UU PDP 27/2022 — hanya diakses oleh role berwenang | Wajib |

---

## 13. Integrasi

| Sistem | Arah | Isi | Fase |
|---|---|---|---|
| **Modul Stok/Depo Farmasi** | Keluar | Mutasi stok keluar (Simpan) & masuk (Batal) | 1 |
| **Modul Kasir** | Keluar | Tagihan baru, pembatalan tagihan | 1 |
| **Modul Kasir** | Masuk | Status Lunas / Piutang Karyawan | 1 |
| **Modul Keuangan/HR** | Keluar | Rekap piutang karyawan untuk potong gaji | `[**]` Fase 2 |
| **SATUSEHAT** | Keluar | Pengiriman data dispensing (jika diwajibkan untuk penjualan non-kunjungan) | `[**]` Fase 2 — `[PERLU KONFIRMASI]` |

---

## 14. Keputusan Desain

| ID | Keputusan | Alasan |
|---|---|---|
| D-001 | Nama modul: **Penjualan Obat Bebas (Non-Kunjungan)**; sub-jalur **Dengan Resep** dan **Tanpa Resep** | Istilah "obat bebas resep" ambigu (bermakna OTC), berisiko salah baca oleh dev/QA |
| D-002 | Identitas pembeli memakai **master pasien + No. RM** yang sama, bukan master identitas terpisah | Menghindari dua sumber kebenaran identitas; riwayat obat tetap terbaca |
| D-003 | Jalur Tanpa Resep + Umum boleh **anonim** | Realitas loket: pembeli swamedikasi tidak selalu mau/perlu menyerahkan identitas |
| D-004 | Cakupan barang: **Dengan Resep** → semua barang jenis Obat; **Tanpa Resep** → jenis Obat + golongan **Obat Bebas** | Ditetapkan pemilik produk; pembatasan golongan adalah pengaman utama |
| D-005 | Penjamin Karyawan = **penanda ganda**: piutang + harga khusus karyawan | Ditetapkan pemilik produk |
| D-006 | **Stok dipotong saat Simpan**, bukan saat bayar/serah | Ditetapkan pemilik produk. Konsekuensi: butuh Batal Transaksi dengan pengembalian stok (F-09) dan penandaan transaksi menggantung (BR-028) |
| D-007 | Transaksi **tidak dapat diedit** setelah Simpan; koreksi lewat Batal + input ulang | Konsekuensi langsung dari D-006 — edit setelah stok terpotong membuat rekonsiliasi stok rumit dan rawan salah |
| D-008 | Komponen racik & non-racik **dipakai ulang dari e-Resep v2**, tidak dibangun ulang | Sudah tersedia di v2; hemat effort dan menjaga konsistensi perhitungan racikan |
| D-009 | **Tidak ada skrining apoteker** sebagai langkah wajib di Fase 1 | Ditetapkan pemilik produk |
| D-010 | Status pembayaran **dibaca dari sistem**, bukan dari bukti bayar fisik | Menghapus langkah manual; bukti fisik jadi cadangan |
| D-011 | Transaksi Penjamin Karyawan **tetap melewati Kasir** untuk pencatatan piutang `[ASUMSI]` | Menjaga satu pintu pencatatan keuangan. Perlu konfirmasi — lihat OQ-01 |

---

## 15. Roadmap

| Fase | Isi |
|---|---|
| **Fase 1 (Rilis Pertama)** | F-01 s.d. F-11 — seluruh alur Dengan Resep & Tanpa Resep, cara bayar Umum & Penjamin Karyawan, potong/kembalikan stok, nota, dashboard |
| **Fase 2** `[**]` | Retur obat setelah diserahkan · Rekap piutang karyawan otomatis ke HR/Keuangan · Plafon & kuota penjamin karyawan · Perluasan cakupan ke alkes/BHP · Pengiriman dispensing ke SATUSEHAT · Riwayat pembelian per pembeli |

---

## 16. Risiko

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-01 | Stok tertahan oleh transaksi *Menunggu Pembayaran* yang tidak pernah diselesaikan | Stok sistem lebih kecil dari fisik → obat tampak habis padahal ada | BR-028 (penandaan dashboard) + F-09 (Batal mudah diakses) + SOP pengecekan akhir shift |
| R-02 | **Harga Karyawan belum ada** di Master Barang Farmasi | Cara bayar Penjamin Karyawan tidak bisa dipakai | Verifikasi master sebelum development (OQ-03); BR-030 memberi pesan error jelas |
| R-03 | Petugas salah memilih jalur (Tanpa Resep untuk obat keras) | Obat keras terjual tanpa resep — risiko regulasi | BR-012: sistem yang membatasi, bukan petugas |
| R-04 | Turnover petugas tinggi → salah input berulang | Banyak transaksi batal, stok bolak-balik | UI sederhana; Batal Transaksi mudah; audit trail untuk penelusuran |
| R-05 | Koneksi terputus saat Simpan → stok terpotong tapi transaksi tidak terbentuk | Stok hilang tanpa transaksi | NFR-003: pemotongan atomik dalam satu transaksi database |
| R-06 | Kebijakan piutang karyawan berbeda dari asumsi | Alur harus dirombak | OQ-01 diselesaikan sebelum development dimulai |

---

## 17. Asumsi

| ID | Asumsi |
|---|---|
| A-01 | Master Data Staf sudah memuat status aktif/non-aktif karyawan. |
| A-02 | Depo farmasi sudah ter-assign ke user login (satu user = satu depo aktif). |
| A-03 | Modul Kasir mampu menerima tagihan dari sumber non-kunjungan. |
| A-04 | Modul Kasir mampu memposting **piutang karyawan** sebagai jenis penyelesaian, bukan hanya pembayaran tunai. |
| A-05 | Penjualan non-kunjungan **tidak wajib** dikirim ke SATUSEHAT di Fase 1. |
| A-06 | Keluarga karyawan **tidak** berhak atas harga/piutang karyawan (hanya karyawan sendiri). |

---

## 18. Pertanyaan Terbuka

| ID | Pertanyaan | Ke siapa | Blocking? |
|---|---|---|---|
| OQ-01 | Apakah pembeli dengan Penjamin Karyawan **tetap harus ke Kasir**, atau obat langsung diserahkan dan piutang tercatat otomatis? | Keuangan RS | **Ya** — memengaruhi state machine |
| OQ-02 | Apa yang dilakukan pada transaksi *Menunggu Pembayaran* yang menggantung hingga tutup shift? Batal manual, atau ada mekanisme lain? | Farmasi RS | Tidak (BR-028 sebagai default) |
| OQ-03 | Apakah field **Harga Karyawan** sudah ada di Master Data Barang Farmasi? Jika belum, apakah dihitung dari diskon % atau harga tetap? | Tim Product / Farmasi RS | **Ya** — memengaruhi Master Data |
| OQ-04 | Untuk jalur Dengan Resep, apakah perlu mencatat **Dokter Penulis Resep** dan **Asal Faskes**? (tidak ada di brief, tapi lazim untuk arsip resep luar) | Farmasi RS | Tidak |
| OQ-05 | Apakah **keluarga karyawan** berhak atas harga karyawan? Jika ya, perlu master relasi keluarga. | HR RS | Tidak (A-06 sebagai default) |
| OQ-06 | Apakah ada **plafon/limit** nominal piutang karyawan per bulan? | Keuangan RS | Tidak (Fase 2) |
| OQ-07 | Apakah nota pembelian punya format/kop resmi yang harus diikuti? | Farmasi RS | Tidak |

---

## 19. Change Log

| Versi | Tanggal | Perubahan | Penulis |
|---|---|---|---|
| v1.0 | 13 Juli 2026 | Draft awal. Menetapkan D-001 s.d. D-011 dari hasil diskusi keputusan awal. Struktur 2 jalur (Dengan Resep / Tanpa Resep), 11 fitur, BR-001–BR-030, FR-001–FR-012, US-001–US-011, NFR-001–NFR-009. | Tim Product |
