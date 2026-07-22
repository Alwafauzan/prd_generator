# Product Requirement Document (PRD)

# F21 — Farmasi: Management Rekonsiliasi Obat

## 1. Metadata Dokumen

- **Kode Fitur:** F21
- **Nama Fitur:** Management Rekonsiliasi Obat
- **Domain:** Farmasi
- **Status:** Draft revisi alur khusus Farmasi untuk review bisnis dan teknis
- **Owner:** Product Owner Farmasi

### Approval

| Stakeholder | Nama/Jabatan | Status | Tanggal |
|---|---|---|---|
| Product Owner Farmasi | TBD | Pending | TBD |
| Kepala Instalasi Farmasi | TBD | Pending | TBD |
| Komite Farmasi dan Terapi | TBD | Pending | TBD |
| Kepala Rawat Inap/IGD | TBD | Pending | TBD |
| Finance/Billing | TBD | Pending | TBD |
| IT/SIMRS | TBD | Pending | TBD |

### Document Version

| Tanggal | Versi | Deskripsi Perubahan |
|---|---:|---|
| 19 Juli 2026 | 1.0 | Draft awal F21 berdasarkan referensi dan template baru; termasuk UI wireframe |
| 19 Juli 2026 | 1.1 | Menyelaraskan dashboard list dan form input dengan referensi visual rekon terbaru |
| 19 Juli 2026 | 1.2 | Audit ulang referensi utama; lengkapi kolom input/list, sumber dispensing, dan traceability kebutuhan |
| 19 Juli 2026 | 1.3 | Mengubah UI wireframe Markdown menjadi preview HTML interaktif mengikuti pola G13 |
| 19 Juli 2026 | 1.4 | Menambahkan aksi inventory Gunakan, Kembalikan, Pindahkan, dan Musnahkan |
| 19 Juli 2026 | 1.5 | Menambahkan pemilihan checkbox dan bulk action pada inventory |
| 19 Juli 2026 | 1.6 | Mengaktifkan tab Review Ketidakcocokan/Riwayat Perhitungan dan menggunakan istilah Riwayat Stok Obat pada UI |
| 19 Juli 2026 | 1.7 | Memperjelas status perubahan resep dan menambahkan aksi Hitung Ulang Sekarang |
| 19 Juli 2026 | 1.8 | Menyeragamkan istilah pengguna ke bahasa umum dan membatasi istilah teknis pada spesifikasi teknis |
| 20 Juli 2026 | 1.9 | Mengubah F21 menjadi khusus Farmasi; menambah dashboard daftar pasien; mengubah Design 02 menjadi Konfirmasi Obat; menghapus input Perawat dan layar Inventory |
| 20 Juli 2026 | 1.10 | Membatasi Design 03 hanya untuk Rekomendasi Sumber; menghapus Review Ketidakcocokan dan Riwayat Perhitungan dari UI F21 |
| 20 Juli 2026 | 1.11 | Menyederhanakan Design 03 dengan menghapus ringkasan kebutuhan/inventory/billing serta Alasan Override dan Catatan |
| 20 Juli 2026 | 1.12 | Menambahkan tab Resep Aktif pada Design 03 beserta dokter pemberi resep dan detail obat dari resep terbaru |

## 2. Overview & Background

### Overview / Brief Summary

> **Keputusan scope v1.9 (normatif):** F21 hanya digunakan oleh Farmasi. F21 tidak menyediakan input Obat Rekonsiliasi oleh Perawat. Data obat diterima dari sumber rekonsiliasi terintegrasi untuk ditinjau dan dikonfirmasi oleh Farmasi. Ketentuan ini menggantikan uraian versi lama yang menyebut input Perawat, FAB tambah obat, dashboard Inventory terpisah, atau aksi operasional inventory pada F21.

Alur utama F21 adalah `Daftar Pasien → Design 01 Dashboard Pasien → Design 02 Konfirmasi Obat → Design 03 Rekomendasi Sumber`. Daftar Pasien hanya memuat pasien yang mempunyai minimal satu Obat Rekonsiliasi.

F21 mengubah rekonsiliasi obat dari dokumentasi pasif menjadi bagian operasional farmasi. Sistem mencatat obat pasien sendiri, sisa unit sebelumnya, hasil transfer antarbangsal, dan stok rumah sakit; memverifikasi kelayakannya; mencocokkannya dengan resep aktif; lalu merekomendasikan pembagian sumber pemenuhan dengan prioritas:

1. obat pasien sendiri (`PATIENT_OWNED`/BYOM);
2. sisa obat unit sebelumnya (`PREVIOUS_UNIT`);
3. stok operasional farmasi (`PHARMACY_STOCK`).

Hanya kuantitas dari stok operasional rumah sakit yang mengurangi stok dan membentuk tagihan. Seluruh penggunaan, perubahan rekomendasi secara manual, pemindahan, pengembalian, penyesuaian, dan pemusnahan dapat ditelusuri per pasien, episode, order, batch sumber, petugas, dan waktu.

### Business Process — As-Is

1. Rekonsiliasi terutama menjadi catatan obat yang dibawa pasien dan tidak membentuk inventory pasien.
2. Farmasis membandingkan obat dengan resep serta menghitung kebutuhan secara manual.
3. Seluruh kebutuhan berisiko diambil dari stok rumah sakit meskipun pasien memiliki sisa obat layak.
4. Sisa obat tidak selalu mengikuti pasien saat pindah unit.
5. Asal obat pada dispensing tidak konsisten sehingga stok dan billing sulit direkonsiliasi.
6. Perubahan resep tidak selalu memicu hitung ulang kebutuhan.
7. Riwayat perubahan jumlah, keputusan, dan sumber tidak tersedia secara utuh.

### Business Process — To-Be

1. Farmasis membuka episode pasien dan mencatat setiap obat beserta sumber, identitas, jumlah, lokasi, dan hasil pemeriksaan kelayakan.
2. Obat hanya dapat diverifikasi bila identitasnya cukup; hanya item `ELIGIBLE` dan `VERIFIED` menjadi inventory rekonsiliasi tersedia.
3. Sistem mencocokkan item dengan resep aktif menggunakan nama/item master, bentuk sediaan, strength, dan satuan yang identik.
4. Sistem menghitung kebutuhan terapi dan membuat rekomendasi alokasi sumber secara FEFO di dalam sumber yang sama, dengan urutan BYOM → sisa unit → stok farmasi.
5. Farmasis meninjau rekomendasi. Rekomendasi boleh diubah secara manual dengan alasan klinis/operasional dan dicatat dalam riwayat aktivitas.
6. Konfirmasi alokasi melakukan reservasi atomik. Dispensing mengurangi sumber yang benar-benar digunakan dan menghasilkan billing hanya untuk stok RS.
7. Perubahan dosis, frekuensi, durasi, jumlah, pembatalan, atau item resep menandai rekomendasi lama `TIDAK BERLAKU` (kode teknis: `STALE`), melepas reservasi yang belum diberikan, dan menghitung ulang.
8. Saat pasien pindah unit, sisa inventory rekonsiliasi layak ditransfer mengikuti pasien tanpa menjadi stok bersama unit.
9. Saat pasien pulang, inventory dikunci dari pemakaian baru dan diselesaikan melalui pengembalian kepada pasien atau pemusnahan sesuai kebijakan.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---:|---|---|
| 1 | Pemanfaatan inventory rekonsiliasi | ≥ 90% item eligible yang cocok dipertimbangkan sebelum stok RS |
| 2 | Akurasi sumber dispensing | 100% baris dispensing memiliki `source_type` dan referensi sumber |
| 3 | Akurasi billing | 0 tagihan untuk kuantitas BYOM/sisa unit; 100% kuantitas stok RS eligible ditagihkan tepat sekali |
| 4 | Konsistensi inventory | 0 saldo negatif dan 0 penggunaan lintas pasien |
| 5 | Perhitungan ulang | 100% perubahan resep relevan menandai hasil lama tidak berlaku dan memicu perhitungan ulang |
| 6 | Auditability | 100% aksi kritis mencatat actor, timestamp, before/after, reason, dan correlation ID |
| 7 | Dashboard | p95 waktu buka < 2 detik untuk episode dengan ≤ 50 item |
| 8 | Pencocokan dan perhitungan | p95 masing-masing < 1 detik untuk ≤ 50 item |
| 9 | Konfirmasi dan billing | p95 masing-masing < 1 detik, diukur terpisah |
| 10 | Transfer unit | 100% saldo eligible mengikuti episode pasien dan tetap terisolasi |

Pengujian performa wajib mencantumkan ukuran data, concurrency, spesifikasi server/database, kondisi jaringan, serta p50/p95/p99.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — MVP/CRUD dan Workflow Dasar | Phase 2 — Advanced Approval/Escalation |
|---|---|---|
| Dashboard | List pasien/episode, filter, indikator pending | SLA, antrean prioritas, escalation |
| Pendataan | CRUD draft, verifikasi satu tingkat, kelayakan | Dual check untuk obat high-alert/narkotika |
| Inventory pasien | Saldo, lokasi, dan Riwayat Stok Obat yang tidak dapat ditimpa | Barcode/serial dan rekonsiliasi fisik terjadwal |
| Pencocokan obat | Pencocokan tepat empat atribut dan pengaitan manual | Normalisasi kandungan, tingkat keyakinan, dan dukungan keputusan klinis |
| Rekomendasi sumber | Prioritas sumber dan perhitungan otomatis | Kebijakan configurable dan persetujuan perubahan manual berisiko |
| Penyerahan obat | Reservasi, penggunaan, dan pembatalan terkontrol | Pengambilan per batch dan persetujuan pembatalan |
| Tagihan | Tagihan stok RS, pencegahan tagihan ganda, dan pembatalan | Rekonsiliasi otomatis dan penanganan kendala |
| Pemindahan unit | Pemindahan saldo layak mengikuti pasien | Serah terima, verifikasi bersama, dan eskalasi belum diterima |
| Penyelesaian pulang | Pengembalian kepada pasien atau pemusnahan | Persetujuan pemusnahan berjenjang |
| Riwayat aktivitas | Catatan aktivitas yang tidak dapat ditimpa dan dapat diekspor | Dashboard anomali dan masa simpan configurable |

### In Scope

1. Dashboard rekonsiliasi farmasi untuk episode aktif IGD/Rawat Inap dan unit relevan.
2. Pendataan sumber `PATIENT_OWNED`, `PREVIOUS_UNIT`, `UNIT_TRANSFER`, dan `HOSPITAL_STOCK`.
3. Verifikasi identitas dan kelayakan obat.
4. Inventory rekonsiliasi khusus pasien beserta Riwayat Stok Obat.
5. Pencocokan tepat terhadap resep, order farmasi, dan terapi aktif.
6. Perhitungan kebutuhan, rekomendasi sumber, perubahan rekomendasi beralasan, dan reservasi.
7. Integrasi penyerahan obat, stok operasional, dan tagihan.
8. Pemindahan inventory antarunit serta penyelesaian saat pulang.
9. Riwayat aktivitas dan riwayat penggunaan.

### Out of Scope

1. Perubahan keputusan klinis dokter atau substitusi terapi otomatis.
2. Penggunaan inventory rekonsiliasi untuk pasien lain.
3. Obat pulang dan kebutuhan operasi sebagai sumber dari sisa rekonsiliasi.
4. Procurement, forecasting, dan pengadaan stok farmasi.
5. Approval berjenjang pada Phase 1.
6. Pencocokan fuzzy otomatis yang menganggap obat berbeda sebagai ekuivalen.

## 5. Related Features

| Kode/Sistem | Related Feature | Relasi Teknis/Bisnis |
|---|---|---|
| Master Data Barang Farmasi | Item, bentuk, strength, satuan, batch | Sumber identitas baku dan atribut matching |
| Farmasi Rawat Jalan | Resep dan dispensing | Consumer hasil sumber; obat pulang dikecualikan dari pemakaian sisa |
| Farmasi IGD | Resep dan dispensing IGD | Sumber order aktif dan eksekusi dispensing |
| Farmasi Rawat Inap | Resep dan dispensing RI | Sumber order aktif, lokasi layanan, dan eksekusi dispensing |
| CPO | Terapi berjalan | Sumber dosis/frekuensi/durasi dan perubahan terapi |
| Form Rekonsiliasi Obat | Data klinis awal | Sumber/consumer dokumentasi obat pasien |
| Inventory Farmasi | Stok operasional | Reservasi dan pengurangan hanya untuk alokasi stok RS |
| Billing | Tagihan obat | Charge hanya dari alokasi stok RS; reversal idempotent |
| ADT/Pendaftaran | Episode dan transfer unit | Isolasi pasien/episode, status aktif, lokasi, pulang |
| Master Staf & Unit | Aktor dan organisasi | Otorisasi, petugas verifikasi, lokasi dan unit asal |

## 6. Business Process & User Stories

### Alur Status — Rekonsiliasi

| Status | Deskripsi | Efek Stok | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|
| `DRAFT` | Data belum diverifikasi | Tidak ada | VERIFIED/REJECTED/CANCELLED | SUBMITTED_FOR_REVIEW |
| `VERIFIED` | Identitas dan hasil kelayakan disahkan | Membuka inventory bila eligible | ACTIVE/REJECTED | APPROVAL_PENDING |
| `ACTIVE` | Dapat dipakai sebagai sumber | Dapat direservasi | EXHAUSTED/TRANSFERRED/CLOSED | SUSPENDED |
| `REJECTED` | Tidak layak/tidak teridentifikasi | Tidak dapat dipakai | DISPOSED/RETURNED | REVIEW_REQUESTED |
| `TRANSFERRED` | Saldo dipindah lokasi mengikuti pasien | Riwayat pemindahan dicatat, total pasien tetap | ACTIVE | RECEIPT_PENDING |
| `EXHAUSTED` | Saldo tersedia nol | Tidak dapat direservasi | CLOSED | CLOSED |
| `CLOSED` | Episode selesai | Pemakaian baru ditolak | RETURNED/DISPOSED | REOPEN_PENDING |
| `RETURNED`/`DISPOSED` | Penyelesaian akhir | Saldo menjadi nol dan tercatat dalam Riwayat Stok Obat | Terminal | Terminal |

### Alur Status — Rekomendasi dan Pembagian Sumber

| Status | Deskripsi | Efek Stok | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|
| `CALCULATED` | Kandidat alokasi dihitung | Belum ada | CONFIRMED/OVERRIDDEN/STALE | REVIEW_PENDING |
| `OVERRIDDEN` | Rekomendasi diubah dengan alasan | Belum ada | CONFIRMED/STALE | APPROVAL_PENDING |
| `CONFIRMED` | Alokasi dikunci | Reservasi per sumber | PARTIALLY_DISPENSED/DISPENSED/CANCELLED/STALE | APPROVED |
| `PARTIALLY_DISPENSED` | Sebagian sumber telah digunakan | Saldo dan stok berkurang sesuai sumber | DISPENSED/CANCELLED/STALE | EXCEPTION_REVIEW |
| `DISPENSED` | Seluruh alokasi selesai | Final posting dan billing | REVERSED | REVERSE_PENDING |
| `STALE` (`TIDAK BERLAKU`) | Resep berubah | Lepas reservasi belum terpakai | CALCULATED | REVIEW_PENDING |
| `CANCELLED` | Alokasi batal | Lepas reservasi belum terpakai | Terminal | Terminal |

### Actors and Access

| Aktor | Hak Utama |
|---|---|
| Farmasis | Melihat daftar pasien, membuka Dashboard pasien, melihat Detail/Riwayat Stok, mengonfirmasi obat, mereview ketidakcocokan, dan melihat riwayat perhitungan |
| Tenaga Teknis Kefarmasian | Akses baca atau konfirmasi sesuai delegasi dan kebijakan Farmasi; tidak mengesahkan kelayakan bila kebijakan melarang |
| Dokter | Tidak mengakses UI F21; data resep/terapi hanya menjadi sumber pembanding melalui integrasi |
| Perawat | Tidak mengakses UI F21 dan tidak menginput Obat Rekonsiliasi pada fitur ini |
| Auditor/Admin | Akses baca Audit Trail sesuai kewenangan; tidak mengubah data konfirmasi |

### User Stories Utama

1. Sebagai farmasis, saya ingin memverifikasi obat pasien agar hanya obat teridentifikasi dan layak yang dapat digunakan.
2. Sebagai farmasis, saya ingin melihat exact match dengan resep agar pembandingan tidak dilakukan manual.
3. Sebagai farmasis, saya ingin rekomendasi pembagian sumber agar stok RS hanya digunakan untuk kekurangan.
4. Sebagai petugas billing, saya ingin charge berasal dari alokasi stok RS agar pasien tidak ditagih dua kali.
5. Sebagai petugas unit, saya ingin sisa obat mengikuti pasien saat transfer agar terapi berkesinambungan.
6. Sebagai auditor, saya ingin histori yang tidak dapat ditimpa agar setiap perubahan dapat ditelusuri.

## 7. Functional Requirements

### 7.1A Current Feature Requirements v1.9

#### Fitur A - Dashboard Daftar Pasien Farmasi

- **User Story:** Sebagai Farmasis, saya ingin melihat pasien yang memiliki Obat Rekonsiliasi agar pekerjaan konfirmasi dapat dimulai dari pasien yang relevan.
- **Prioritas:** P0
- **Acceptance Criteria:**
  - **AC-A1:** Daftar hanya menampilkan pasien dengan minimal satu Obat Rekonsiliasi.
  - **AC-A2:** Kolom wajib: No, Nama Pasien, No. RM, Jumlah Obat, Pelayanan, Jumlah Obat Layak, dan Aksi.
  - **AC-A3:** `Pelayanan` menunjukkan lokasi pasien sedang diperiksa/dirawat, misalnya IGD, Rawat Inap, atau Rawat Jalan beserta unit terkait.
  - **AC-A4:** Filter hanya satu pencarian yang menerima Nama Pasien atau No. RM; filter unit, asal obat, nama obat, status, dan filter lain tidak ditampilkan pada layar ini.
  - **AC-A5:** Aksi `Detail` membuka Design 01 Dashboard untuk pasien terpilih.
  - **AC-A6:** Dashboard dan seluruh aksi F21 hanya dapat diakses role Farmasi yang berwenang.

#### Fitur B - Design 01 Dashboard Pasien

- **User Story:** Sebagai Farmasis, saya ingin melihat seluruh Obat Rekonsiliasi seorang pasien agar dapat memilih obat yang perlu dikonfirmasi atau ditelusuri stoknya.
- **Prioritas:** P0
- **Acceptance Criteria:**
  - **AC-B1:** Header menampilkan identitas pasien, episode, dan pelayanan aktif.
  - **AC-B2:** Tabel mempertahankan informasi obat, dosis, sediaan, aturan pakai, jumlah, asal, kelayakan, keputusan, sumber, dan petugas.
  - **AC-B3:** Setiap baris mempunyai aksi `Detail` dan `Riwayat Stok`.
  - **AC-B4:** Aksi `Detail` membuka Design 02 Konfirmasi Obat untuk item dan pasien terpilih.
  - **AC-B5:** Aksi `Riwayat Stok` menampilkan histori perubahan stok item terkait tanpa membuka Dashboard Inventory terpisah.
  - **AC-B6:** Tidak ada FAB/tombol tambah obat dan tidak ada input Obat Rekonsiliasi oleh Perawat.

#### Fitur C - Design 02 Konfirmasi Obat oleh Farmasi

- **User Story:** Sebagai Farmasis, saya ingin memeriksa data obat dan mengonfirmasi hasil kelayakannya.
- **Prioritas:** P0
- **Acceptance Criteria:**
  - **AC-C1:** Design 02 berjudul `Konfirmasi Obat`, bukan `Input Obat`.
  - **AC-C2:** Identitas, asal, nama obat, sediaan, dosis, aturan pakai, jumlah, dan informasi sumber berasal dari data rekonsiliasi terintegrasi dan ditampilkan sebagai data tinjauan.
  - **AC-C3:** Farmasis dapat mengisi hasil pemeriksaan Farmasi seperti kondisi, status kelayakan, batch/ED, lokasi penyimpanan, dan catatan konfirmasi sesuai kewenangan.
  - **AC-C4:** Tombol `Konfirmasi Obat` menyimpan aktor Farmasi, waktu, hasil, catatan, dan audit before/after.
  - **AC-C5:** Backend menolak create/update/confirm oleh role Perawat.

#### Fitur D - Design 03 Rekomendasi Sumber

- **User Story:** Sebagai Farmasis, saya ingin melihat rekomendasi pembagian sumber agar kebutuhan obat dipenuhi dari sumber yang tepat.
- **Prioritas:** P0
- **Acceptance Criteria:**
  - **AC-D1:** Design 03 hanya menampilkan `Rekomendasi Sumber`.
  - **AC-D2:** Rekomendasi menampilkan identitas obat, sumber yang tersedia, jumlah yang direkomendasikan, dan keputusan Farmasis.
  - **AC-D3:** Design 03 tidak menampilkan kartu `Total kebutuhan`, `Inventory rekonsiliasi`, `Stok RS / Billing`, field `Alasan Override`, maupun field `Catatan`.
  - **AC-D4:** `Review Ketidakcocokan` dan `Riwayat Perhitungan` tidak ditampilkan pada UI F21.
  - **AC-D5:** Design 03 menyediakan tab `Rekomendasi Sumber` dan `Resep Aktif`.
  - **AC-D6:** Tab `Resep Aktif` hanya menampilkan versi resep terbaru yang berstatus aktif dan akan diberikan kepada pasien.
  - **AC-D7:** Header atau footer tab menampilkan nama dokter pemberi resep, nomor resep/order, versi terbaru, dan waktu resep.
  - **AC-D8:** Tabel Resep Aktif minimal menampilkan No, Nama Obat, Dosis, Satuan, dan Aturan Pakai.
  - **AC-D9:** Jika resep aktif berubah, tab menampilkan versi terbaru setelah refresh/sinkronisasi dan tidak mencampurkan item dari versi lama.

#### Fitur E - Penghapusan Design 04 Inventory

- **Acceptance Criteria:**
  - **AC-E1:** Navigasi dan halaman `04 Inventory` dihapus dari F21.
  - **AC-E2:** Riwayat stok hanya diakses dari aksi `Riwayat Stok` pada Design 01.
  - **AC-E3:** Operasi `Gunakan`, `Kembalikan`, `Pindahkan`, dan `Musnahkan` tidak disediakan sebagai dashboard F21.

### 7.1B Legacy Requirements (Superseded by v1.9)

Bagian legacy di bawah dipertahankan sementara untuk jejak perubahan dan tidak menjadi dasar implementasi apabila bertentangan dengan §7.1A.

#### Fitur 1 — Dashboard Rekonsiliasi

- **User Story:** Sebagai farmasis, saya ingin memfilter episode agar pekerjaan pending cepat ditemukan.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** List hanya menampilkan episode sesuai unit yang boleh diakses pengguna.
  - **AC 2:** Filter unit, status episode, status verifikasi, ketidakcocokan obat, dan pencarian RM/nama dapat dikombinasikan.
  - **AC 3:** Badge pending dihitung server-side dan hasil list dipaginasi.
  - **AC 4:** Episode lain tidak pernah tampil setelah pengguna mengganti konteks pasien.
  - **AC 5:** Header menampilkan No. RM, nama pasien, tanggal lahir/usia, dan judul “Rekonsiliasi Obat”.
  - **AC 6:** Dashboard menyediakan filter `Asal Obat` dan `Nama Obat`; keduanya dapat digunakan bersamaan.
  - **AC 7:** Tabel utama minimal menampilkan No, Nama Obat, Kekuatan/Dosis, Bentuk Sediaan, Aturan Pakai, Jumlah, Asal Obat, Status Kelayakan, Keputusan Lanjut/Henti, Informasi Sumber Obat, dan Nama Petugas. Pada viewport terbatas kolom boleh masuk ke expandable row, tetapi datanya tidak boleh dihilangkan.
  - **AC 8:** FAB `+` membuka `Input Data Obat`; tombol refresh memuat data terbaru dengan filter tetap aktif.
  - **AC 9:** Pagination menyediakan rows per page, rentang record, previous, dan next; nomor urut mengikuti sort aktif.

#### Fitur 2 — Pendataan dan Verifikasi Obat

- **User Story:** Sebagai farmasis, saya ingin mencatat dan memverifikasi obat agar kelayakan penggunaannya jelas.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Simpan ditolak jika sumber obat kosong, jumlah ≤ 0, atau satuan kosong.
  - **AC 2:** Verifikasi mewajibkan item master/nama, bentuk, strength, satuan, kondisi, keputusan kelayakan, dan petugas.
  - **AC 3:** `EXPIRED`, `DAMAGED`, atau `UNIDENTIFIED` otomatis menghasilkan `NOT_ELIGIBLE` dan tidak dapat diaktifkan.
  - **AC 4:** Pengguna tidak dapat mengedit item setelah dipakai; koreksi dilakukan melalui adjustment/revision beralasan.
  - **AC 5:** Sistem mencatat batch/ED bila tersedia dan memberi warning bila ED lebih dekat dari akhir terapi.
  - **AC 6:** Form utama mengikuti urutan Asal Obat, Nama Obat, Dosis, Aturan Pakai, Jumlah + Satuan, Dilanjutkan Saat di Bangsal, dan Informasi Sumber Obat.
  - **AC 7:** Kategori asal wajib mencakup obat dibawa pasien dari rumah, sisa unit/perawatan sebelumnya, transfer antarbangsal, dan obat operasional rumah sakit. Opsi visual `Dari Rumah`, `Puskesmas`, `Klinik Dokter`, `Poliklinik Dalam`, `Poliklinik Mata`, dan `Poliklinik Syaraf` menjadi detail sumber configurable di bawah kategori yang sesuai; nilai disimpan menggunakan kode master.
  - **AC 8:** Aturan Pakai terdiri dari nilai frekuensi, simbol `×`, nilai konsumsi, dan bentuk pemakaian. Baseline bentuk: `Bungkus`, `Hisap`, `Kapsul`, `Kumur`, `ml`, dan `mg`.
  - **AC 9:** Satuan jumlah baseline adalah `Tablet`, `Bungkus`, `Botol`, dan `Pcs`; daftar berasal dari master aktif.
  - **AC 10:** `Dilanjutkan Saat di Bangsal` wajib dipilih `Lanjut` atau `Henti`; pilihan `Henti` mewajibkan alasan pada tahap verifikasi.
  - **AC 11:** `Informasi Sumber Obat` menerima maksimal 1000 karakter dan tidak menggantikan Asal Obat yang wajib.

#### Fitur 3 — Inventory Rekonsiliasi Pasien

- **User Story:** Sebagai farmasis, saya ingin melihat saldo per item dan lokasi agar pemakaian terkendali.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** `available_qty = initial_qty + inbound_qty - reserved_qty - used_qty - returned_qty - disposed_qty` dan tidak boleh negatif.
  - **AC 2:** Semua perubahan stok menghasilkan catatan `Riwayat Stok Obat` yang hanya dapat ditambah dan tidak dapat ditimpa, berisi pasien, episode, lot sumber, lokasi, petugas, dan ID penelusuran transaksi.
  - **AC 3:** Query atau transaksi yang menggunakan inventory pasien lain ditolak `403/409` dan diaudit.
  - **AC 4:** Concurrent reservation pada saldo terakhir hanya mengizinkan satu transaksi sukses.
  - **AC 5:** Setiap baris inventory aktif menyediakan aksi `Gunakan`, `Kembalikan`, `Pindahkan`, dan `Musnahkan` sesuai hak akses dan status item.
  - **AC 6:** `Gunakan` mewajibkan jumlah dan referensi order/terapi; jumlah tidak boleh melebihi saldo tersedia atau reservasi terkait.
  - **AC 7:** `Kembalikan` mewajibkan jumlah, tujuan/penerima, dan alasan; sistem membuat catatan Riwayat Stok `RETURNED` tanpa menghapus histori.
  - **AC 8:** `Pindahkan` mewajibkan jumlah dan lokasi/unit tujuan; patient dan encounter tetap sama serta mutasi keluar/masuk memakai correlation ID yang sama.
  - **AC 9:** `Musnahkan` mewajibkan jumlah, alasan, metode, dan petugas; hanya saldo tidak reserved yang dapat dimusnahkan dan sistem membuat catatan Riwayat Stok `DISPOSED`.
  - **AC 10:** Semua aksi menampilkan dampak saldo sebelum konfirmasi, menggunakan idempotency key, dan tidak boleh menghasilkan saldo negatif.
  - **AC 11:** Setiap row inventory yang eligible untuk aksi memiliki checkbox; checkbox header memilih atau membatalkan seluruh row eligible pada halaman aktif.
  - **AC 12:** Bulk action bar tersembunyi saat tidak ada pilihan dan muncul tepat di bawah tabel saat minimal satu item dipilih, disertai jumlah item terpilih.
  - **AC 13:** Bulk action bar menyediakan `Gunakan`, `Kembalikan`, `Pindahkan`, dan `Musnahkan`, serta aksi membatalkan pilihan.
  - **AC 14:** Sistem memvalidasi role, state, kelayakan, saldo, reserved quantity, dan field wajib secara terpisah untuk setiap lot sebelum bulk commit.
  - **AC 15:** Jika salah satu row gagal validasi, sistem menampilkan hasil per row dan tidak melakukan partial commit kecuali kebijakan bulk secara eksplisit menggunakan mode partial dengan konfirmasi pengguna.
  - **AC 16:** Setelah bulk commit berhasil, setiap lot menghasilkan catatan Riwayat Stok sendiri dan seluruh catatan berbagi satu bulk correlation ID.
  - **AC 17:** Label yang tampil kepada pengguna adalah `Riwayat Stok Obat`; istilah teknis `ledger` hanya boleh muncul pada nama tabel database dan dokumentasi teknis, disertai penjelasan bahasa umum.

#### Fitur 4 — Matching Resep

- **User Story:** Sebagai farmasis, saya ingin sistem mencocokkan obat dengan resep aktif agar kandidat sumber terlihat.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** `EXACT_MATCH` hanya bila item/nama ternormalisasi, dosage form, strength, dan unit identik.
  - **AC 2:** Perbedaan satu atribut menghasilkan `REVIEW_REQUIRED`; sistem tidak mengalokasikan otomatis.
  - **AC 3:** Item tidak ditemukan menghasilkan `NO_MATCH` tanpa mengubah inventory.
  - **AC 4:** Hasil menyimpan versi order dan timestamp perhitungan.
  - **AC 5:** Perhitungan membandingkan item rekonsiliasi terhadap resep aktif dokter, order farmasi, dan terapi yang sedang berjalan pada episode yang sama.
  - **AC 6:** Detail hasil memperlihatkan kesamaan/perbedaan nama obat, bentuk sediaan, strength, satuan, dosis, dan aturan pakai serta jumlah kebutuhan terapi.
  - **AC 7:** Tab `Review Ketidakcocokan` menampilkan pasangan resep dan inventory yang tidak exact match, atribut yang berbeda, status review, serta aksi Perbaiki Data/Mapping, Tandai Tidak Cocok, atau Minta Klarifikasi.
  - **AC 8:** Review Ketidakcocokan tidak boleh menyatakan obat ekuivalen atau mengalokasikan inventory secara otomatis.
  - **AC 9:** Badge pada tab menunjukkan jumlah ketidakcocokan yang belum diselesaikan untuk episode aktif.
  - **AC 10:** Tab `Riwayat Perhitungan` menampilkan setiap versi perhitungan dengan waktu, penyebab perubahan, kebutuhan, pembagian per sumber, jumlah yang ditagihkan, status versi, dan petugas/sistem.
  - **AC 11:** Versi perhitungan lama tidak dapat diedit atau dihapus; label pengguna adalah `Terkini`, `Tidak Berlaku`, `Digantikan`, atau `Dibatalkan` (kode teknis: `CURRENT`, `STALE`, `SUPERSEDED`, `CANCELLED`).
  - **AC 12:** Klik setiap tab mengganti konten tanpa reload halaman dan mempertahankan konteks patient, encounter, serta order aktif.

#### Fitur 5 — Perhitungan dan Rekomendasi Sumber

- **User Story:** Sebagai farmasis, saya ingin jumlah kebutuhan dibagi otomatis agar dispensing dan billing akurat.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** `required_qty` dihitung dari jumlah order yang belum dipenuhi; sistem tidak menggunakan nilai negatif.
  - **AC 2:** Untuk exact match eligible, sistem mengalokasikan BYOM lalu sisa unit lalu stok farmasi sampai kebutuhan terpenuhi.
  - **AC 3:** Contoh kebutuhan 3 tablet dan saldo BYOM 2 menghasilkan BYOM 2 + stok RS 1 + billable 1.
  - **AC 4:** Di dalam sumber yang sama, batch dengan ED terdekat yang masih valid dipilih lebih dahulu.
  - **AC 5:** Obat pulang dan order ber-flag operasi tidak menggunakan inventory rekonsiliasi.
  - **AC 6:** Perubahan rekomendasi secara manual mewajibkan kode alasan dan catatan; jumlah total harus tetap sama dengan kebutuhan yang dapat dipenuhi.

#### Fitur 6 — Konfirmasi, Reservasi, dan Dispensing

- **User Story:** Sebagai farmasis, saya ingin mengonfirmasi sumber secara atomik agar tidak terjadi pemakaian ganda.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Konfirmasi memakai optimistic locking/order version dan gagal `409` bila data telah berubah.
  - **AC 2:** Reservasi rekonsiliasi tidak mengurangi stok operasional; reservasi stok RS mengikuti layanan inventory farmasi.
  - **AC 3:** Dispensing mengurangi tepat sumber yang dikonfirmasi dan menyimpan `source_type` per line.
  - **AC 4:** Retry dengan idempotency key yang sama tidak membentuk mutasi atau billing ganda.
  - **AC 5:** Jumlah dispense melebihi saldo/reservasi ditolak tanpa partial side effect.
  - **AC 6:** Setiap dispensing menyimpan sumber aktual `PATIENT_INVENTORY`, `PREVIOUS_UNIT`, `PHARMACY_STOCK`, atau `PHARMACY_WAREHOUSE`; sumber tidak boleh kosong.

#### Fitur 7 — Sinkronisasi Perubahan Resep

- **User Story:** Sebagai farmasis, saya ingin perubahan resep menghitung ulang alokasi agar sumber tetap benar.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Perubahan item, dosis, frekuensi, durasi, atau jumlah memicu proses perhitungan ulang.
  - **AC 2:** Rekomendasi/pembagian sumber yang belum diberikan menjadi `TIDAK BERLAKU` (kode teknis: `STALE`); reservasi yang belum digunakan dilepas sebagai satu transaksi utuh.
  - **AC 3:** Bagian yang sudah didispensing tidak dihapus dan tetap memiliki histori sumber/billing.
  - **AC 4:** UI menolak konfirmasi hasil dari order version lama.
  - **AC 5:** Jika versi resep aktif lebih baru daripada versi rekomendasi, UI menampilkan banner `Resep Telah Berubah — Perlu Hitung Ulang` beserta versi lama dan versi baru.
  - **AC 6:** Status rekomendasi lama menjadi `TIDAK BERLAKU` (kode teknis: `STALE`); “dikunci” berarti rekomendasi hanya dapat dilihat pada Riwayat Perhitungan dan tidak dapat diedit, dikonfirmasi, atau digunakan untuk penyerahan obat.
  - **AC 7:** Reservasi yang belum digunakan dilepas secara atomik menjadi saldo tersedia. Sistem mencatat jumlah, lot, waktu, alasan `ORDER_CHANGED`, dan correlation ID pada Riwayat Stok Obat serta audit trail.
  - **AC 8:** Kuantitas yang sudah didispensing atau digunakan tidak dilepas dan tidak dikembalikan otomatis; histori sumber, stok, serta billing tetap dipertahankan.
  - **AC 9:** Pemberitahuan menyediakan tombol `Hitung Ulang Sekarang`; klik tombol mengambil resep aktif terbaru dan membuat versi perhitungan baru tanpa menimpa versi sebelumnya.
  - **AC 10:** Selama hitung ulang berjalan, tombol menampilkan loading dan tidak dapat diklik ulang. Jika berhasil, UI membuka Rekomendasi Sumber terbaru; jika gagal, UI menampilkan pesan dan correlation ID tanpa mengaktifkan hasil lama.
  - **AC 11:** Pengulangan proses untuk perubahan resep yang sama tidak boleh melepas saldo dua kali atau membuat versi perhitungan ganda.

#### Fitur 8 — Billing Berdasarkan Sumber

- **User Story:** Sebagai billing officer, saya ingin hanya stok RS ditagihkan agar charge akurat.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Hanya line `PHARMACY_STOCK`/`HOSPITAL_STOCK` menghasilkan billing charge.
  - **AC 2:** BYOM, sisa unit, dan transfer unit selalu memiliki `billable_qty = 0`.
  - **AC 3:** Charge menyimpan allocation line dan dispensing line sebagai referensi unik.
  - **AC 4:** Reversal dispensing menghasilkan reversal billing, bukan penghapusan charge.
  - **AC 5:** Kegagalan billing tampil sebagai exception yang dapat di-retry idempotent tanpa membatalkan histori dispensing.

#### Fitur 9 — Transfer Antarunit

- **User Story:** Sebagai farmasis/unit penerima, saya ingin inventory mengikuti pasien agar tidak mengambil ulang stok RS.
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Event transfer episode membuat mutasi keluar/masuk dengan kuantitas sama dan correlation ID sama.
  - **AC 2:** Hanya saldo `ACTIVE`, eligible, tidak kedaluwarsa, dan tidak sedang reserved yang dipindahkan otomatis.
  - **AC 3:** Reserved quantity tetap terkait order; sistem meminta penyelesaian/re-alokasi sebelum transfer.
  - **AC 4:** Patient dan episode tidak berubah; location/unit berubah ke tujuan.

#### Fitur 10 — Penyelesaian Saat Pulang

- **User Story:** Sebagai farmasis, saya ingin menyelesaikan saldo saat pasien pulang agar tidak dipakai setelah episode berakhir.
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Status pulang menutup inventory dari reservasi baru.
  - **AC 2:** Setiap saldo wajib diselesaikan sebagai `RETURNED_TO_PATIENT` atau `DISPOSED` dengan alasan dan petugas.
  - **AC 3:** Total penyelesaian tidak boleh melebihi saldo tersedia.
  - **AC 4:** Obat tidak dapat diaktifkan kembali tanpa workflow Phase 2.

#### Fitur 11 — Audit Trail

- **User Story:** Sebagai auditor, saya ingin melihat before/after setiap aksi kritis agar dapat ditelusuri.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Pembuatan, verifikasi, penolakan, pencocokan, perhitungan, perubahan rekomendasi, reservasi, penyerahan, pembatalan, pemindahan, pengembalian, pemusnahan, dan kegagalan integrasi dicatat.
  - **AC 2:** Audit menyimpan actor, role, timestamp server, patient/episode, entity, action, before/after, reason, IP/device bila tersedia, dan correlation ID.
  - **AC 3:** Audit tidak dapat diedit/dihapus melalui API aplikasi.
  - **AC 4:** Ekspor mengikuti filter dan akses pengguna serta mencatat event ekspor.

### 7.2 Validasi — Wording Frontend

| Field/Aksi | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Kategori Asal Obat | Select | Required | “Asal obat wajib dipilih.” | “Pilih obat pasien, unit sebelumnya, transfer antarbangsal, atau obat operasional RS.” |
| Detail Asal Obat | Select | Required sesuai kategori | “Detail asal obat wajib dipilih.” | “Contoh: Dari Rumah, Puskesmas, Klinik Dokter, atau poliklinik terkait.” |
| Obat | Autocomplete | Required saat verifikasi | “Obat wajib dipilih atau diidentifikasi.” | “Cari berdasarkan nama/kode master.” |
| Strength | Number + unit | > 0 | “Kekuatan obat harus lebih dari 0.” | “Contoh: 500 mg.” |
| Aturan Pakai | 2 number + select | Kedua angka > 0; bentuk wajib | “Aturan pakai belum lengkap.” | “Contoh: 1 × 1 Bungkus.” |
| Jumlah Awal | Decimal | > 0; sesuai precision unit | “Jumlah obat harus lebih dari 0.” | “Gunakan satuan terkecil yang dapat dikelola.” |
| Satuan Jumlah | Select | Required; master aktif | “Satuan jumlah wajib dipilih.” | “Contoh: Tablet, Bungkus, Botol, atau Pcs.” |
| Dilanjutkan Saat di Bangsal | Segmented control | Required: CONTINUE/STOP | “Pilih Lanjut atau Henti.” | “Keputusan ditinjau pada verifikasi farmasi.” |
| Informasi Sumber Obat | Textarea | Max 1000 | “Informasi sumber obat maksimal 1000 karakter.” | “Tambahkan lokasi, pemberi, kondisi kemasan, atau informasi relevan.” |
| Kondisi | Select | Required | “Kondisi obat wajib dinilai.” | “Rusak, kedaluwarsa, atau tanpa identitas tidak dapat digunakan.” |
| Keputusan Kelayakan | Radio | Required | “Keputusan kelayakan wajib dipilih.” | “Hanya obat layak yang dapat menjadi sumber terapi.” |
| Alasan Perubahan Rekomendasi | Select + textarea | Wajib saat rekomendasi diubah | “Alasan perubahan sumber wajib diisi.” | “Jelaskan pertimbangan klinis atau operasional.” |
| Konfirmasi | Action | latest order version | “Resep telah berubah. Muat ulang dan hitung kembali.” | “Konfirmasi akan mereservasi sumber.” |
| Transfer | Select destination | destination ≠ origin | “Unit tujuan harus berbeda dari unit asal.” | “Sisa obat tetap milik pasien yang sama.” |
| Penyelesaian | Radio + quantity | quantity ≤ available | “Jumlah penyelesaian melebihi saldo tersedia.” | “Pilih dikembalikan atau dimusnahkan.” |
| Gunakan Inventory | Quantity + order reference | > 0; ≤ available/reserved | “Jumlah penggunaan melebihi saldo yang dapat digunakan.” | “Pilih order atau terapi yang akan dipenuhi.” |
| Kembalikan Inventory | Quantity + destination + reason | > 0; ≤ available | “Jumlah pengembalian melebihi saldo tersedia.” | “Catat tujuan/penerima dan alasan pengembalian.” |
| Pindahkan Inventory | Quantity + destination | > 0; destination ≠ origin | “Lokasi tujuan harus berbeda dari lokasi asal.” | “Inventory tetap khusus untuk pasien yang sama.” |
| Musnahkan Inventory | Quantity + reason + method | > 0; ≤ unreserved available | “Jumlah pemusnahan melebihi saldo yang tidak direservasi.” | “Catat alasan, metode, dan petugas pemusnahan.” |

## 8. Data & Technical Specifications

### 8.1 Data & Business Rules

#### 8.1.0 Data Kontrak Alur v1.9

##### Dashboard Daftar Pasien

| Field | Label | Sumber | Aturan |
|---|---|---|---|
| `patient_id` | ID Pasien | Master Pasien | Hidden; partition key |
| `patient_name` | Nama Pasien | Master Pasien | Wajib; searchable |
| `medical_record_number` | No. RM | Master Pasien | Wajib; searchable |
| `medication_count` | Jumlah Obat | Rekonsiliasi Obat | Count item pasien |
| `service_name` | Pelayanan | ADT/Pendaftaran | Lokasi pemeriksaan/perawatan aktif |
| `eligible_medication_count` | Jumlah Obat Layak | Hasil konfirmasi Farmasi | Count status layak |
| `detail_action` | Aksi | Sistem | Membuka Design 01 dalam konteks pasien |

##### Konfirmasi Obat Farmasi

| Field | Label | Sumber/Aktor | Aturan |
|---|---|---|---|
| `reconciliation_item_id` | Item Rekonsiliasi | Integrasi Rekonsiliasi | Milik pasien terpilih; read-only |
| `condition_status` | Kondisi | Farmasis | Wajib saat konfirmasi |
| `eligibility_status` | Kelayakan | Farmasis/Sistem | Wajib saat konfirmasi |
| `batch_number` | Batch | Farmasis | Opsional sesuai ketersediaan |
| `expiry_date` | Kedaluwarsa | Farmasis | Validasi tidak lampau untuk status layak |
| `storage_location` | Lokasi Penyimpanan | Farmasis/Master Lokasi | Wajib jika layak |
| `confirmation_note` | Catatan Konfirmasi | Farmasis | Wajib jika tidak layak |
| `confirmed_by` | Dikonfirmasi Oleh | Session Farmasi | Wajib; audit |
| `confirmed_at` | Waktu Konfirmasi | Server | Wajib; audit |

##### Resep Aktif pada Design 03

| Field | Label | Sumber | Aturan |
|---|---|---|---|
| `prescription_id` | No. Resep/Order | Resep/Farmasi | Wajib; episode pasien aktif |
| `prescription_version` | Versi | Resep/Farmasi | Hanya versi aktif terbaru |
| `prescribed_at` | Waktu Resep | Resep/Farmasi | Tanggal dan waktu lokal |
| `prescriber_id` | Dokter Pemberi Resep | Master Staf/Resep | Dokter aktif; tampil nama dan gelar |
| `items[].sequence` | No | Sistem | Urutan item resep |
| `items[].medication_name` | Nama Obat | Master Farmasi/Resep | Wajib |
| `items[].dose_value` | Dosis | Resep | Wajib |
| `items[].dose_unit` | Satuan | Master Satuan/Resep | Wajib |
| `items[].administration_instruction` | Aturan Pakai | Resep | Wajib |

Aturan normatif v1.9: F21 tidak mempunyai endpoint create item untuk Perawat. Endpoint mutasi wajib memvalidasi role Farmasi di backend. Dashboard daftar pasien hanya menerima parameter `search` untuk Nama Pasien/No. RM selain pagination dan sorting teknis. Design 04 Inventory tidak termasuk kontrak UI F21.

#### 8.1.1 Spesifikasi Data — Form Input/Create/Edit

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `patient_id` | Pasien | UUID/read-only | Ya | Pasien valid | ADT | Tidak dapat diganti |
| `encounter_id` | Episode | UUID/read-only | Ya | Episode aktif saat create | ADT | Boundary utama |
| `source_type` | Asal Obat | Enum | Ya | Allowed enum | User/system | Tidak boleh kosong |
| `source_detail_code` | Detail Asal Obat | Master code | Kondisional | Aktif dan sesuai kategori | Master Sumber Obat | Memuat opsi visual seperti Puskesmas/Poliklinik |
| `source_unit_id` | Unit Asal | UUID | Kondisional | Wajib untuk previous/transfer | Master Unit | Nullable untuk BYOM |
| `medication_item_id` | Nama Obat | UUID | Kondisional | Master aktif | Master Farmasi | Wajib saat verified |
| `reported_name` | Nama pada Kemasan | Text(200) | Ya | Trim, max 200 | User | Bukti identifikasi |
| `dosage_form_id` | Bentuk Sediaan | UUID | Ya saat verify | Master aktif | Master Farmasi | Atribut matching |
| `strength_value` | Kekuatan | Decimal | Ya saat verify | > 0 | User/master | Atribut matching |
| `strength_unit_id` | Satuan Kekuatan | UUID | Ya saat verify | Master aktif | Master Farmasi | Atribut matching |
| `quantity` | Jumlah Awal | Decimal(18,4) | Ya | > 0 | User | Sesuai unit stok |
| `quantity_unit_id` | Satuan Jumlah | UUID | Ya | Master aktif | Master Farmasi | Tidak dikonversi implisit |
| `usage_instruction` | Aturan Pakai | Text(500) | Tidak | Max 500 | Patient/order | Untuk review |
| `usage_frequency` | Frekuensi | Decimal(8,2) | Ya | > 0 | User | Angka pertama pola aturan pakai |
| `usage_quantity` | Jumlah per Konsumsi | Decimal(8,2) | Ya | > 0 | User | Angka kedua pola aturan pakai |
| `usage_form_code` | Bentuk Pemakaian | Enum/master | Ya | Master aktif | Master Farmasi | Bungkus/Hisap/Kapsul/Kumur/ml/mg |
| `continue_in_ward` | Dilanjutkan Saat di Bangsal | Boolean | Ya | True/false eksplisit | User | Label UI Lanjut/Henti |
| `source_information` | Informasi Sumber Obat | Text(1000) | Tidak | Trim, max 1000 | User | Bukan pengganti source type |
| `batch_number` | Batch | Text(100) | Tidak | Max 100 | Kemasan | Disarankan bila tersedia |
| `expiry_date` | Kedaluwarsa | Date | Tidak | Tidak lampau untuk eligible | Kemasan | Warning terhadap akhir terapi |
| `condition_status` | Kondisi | Enum | Ya | GOOD/EXPIRED/DAMAGED/UNIDENTIFIED | Farmasis | Mengendalikan eligibility |
| `eligibility_status` | Kelayakan | Enum | Ya saat verify | ELIGIBLE/NOT_ELIGIBLE | Farmasis/system | Bukan input bebas |
| `clinical_decision` | Keputusan | Enum | Ya saat verify | CONTINUE/STOP/REVIEW | Farmasis/dokter | Tidak mengganti order dokter |
| `storage_location_id` | Lokasi Simpan | UUID | Ya saat active | Lokasi valid | Master Lokasi | Lokasi fisik |
| `verification_note` | Catatan | Text(1000) | Kondisional | Wajib jika not eligible | Farmasis | Diaudit |
| `recorded_by` / `verified_by` | Petugas | UUID/read-only | Ya | User aktif dan berwenang | Session/RBAC | Diisi sistem; nama ditampilkan pada list |

#### 8.1.2 Spesifikasi Data — Tampilan Daftar

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|---|---|---|---|---|
| Pasien/RM | ADT | RM — Nama | Cari | Masking sesuai akses |
| Episode/Unit | Encounter | Kode — Unit | Filter unit/status | Sticky context |
| Nama Obat | Reconciliation item | Nama generik/dagang | Cari/sort | Tampilkan reported name bila belum map |
| Kekuatan/Dosis | Reconciliation item | Value + unit | Sort | Contoh 500 mg |
| Bentuk Sediaan | `dosage_form_id` | Label master | Filter/sort | Contoh tablet/kapsul/sirup |
| Aturan Pakai | Usage fields | `frequency × quantity form` | — | Contoh `1 × 1 Bungkus` |
| Asal | `source_type` | Badge + unit | Filter | Warna bukan satu-satunya indikator |
| Informasi Sumber Obat | `source_information` | Text/ellipsis | — | Detail melalui tooltip/detail |
| Keputusan Lanjut/Henti | `clinical_decision` | Lanjut/Henti/Perlu Review | Filter | Keputusan klinis rekonsiliasi |
| Nama Petugas | Verification/audit actor | Nama tampilan | — | Pencatat/verifikator sesuai status |
| Kelayakan | eligibility | Badge teks | Filter | Alasan tersedia di detail |
| Jumlah | inventory balance | Awal/Reserved/Terpakai/Tersisa | Sort tersisa | Precision sesuai satuan |
| Match | match result | Exact/Review/No match | Filter | Menampilkan order terkait |
| Rekomendasi | allocation | BYOM + unit + RS | — | Total harus sama kebutuhan |
| Status | Status proses | Badge teks | Filter | Jangan gabungkan status klinis dan inventory |
| Aksi | Hak akses | Detail/Verifikasi/Hitung/Konfirmasi | — | Berdasarkan role dan status |

### 8.2 Business Rules

1. Inventory rekonsiliasi selalu terikat satu `patient_id` dan `encounter_id`; tidak boleh dipakai lintas pasien.
2. Hanya item `VERIFIED + ELIGIBLE + ACTIVE` yang dapat dialokasikan.
3. Identitas tidak pasti, rusak, atau kedaluwarsa selalu `NOT_ELIGIBLE`.
4. Exact match memerlukan item/nama, bentuk, strength, dan satuan identik; selain itu wajib review manual.
5. Prioritas sumber default: BYOM → previous/unit transfer → pharmacy stock.
6. FEFO berlaku di dalam sumber yang setara dan tidak boleh memilih batch kedaluwarsa.
7. `used_qty` tidak boleh melebihi saldo/reservasi dan semua update quantity dilakukan dalam transaksi database.
8. Perubahan resep membuat hasil lama tidak berlaku dan memicu perhitungan ulang.
9. Inventory rekonsiliasi tidak mengurangi stok operasional dan tidak menghasilkan billing.
10. Billing hanya untuk kuantitas yang benar-benar didispensing dari stok RS.
11. Order obat pulang dan kebutuhan operasi dikecualikan dari pemakaian sisa rekonsiliasi.
12. Status tidak dipilih saat create; sistem menetapkan `DRAFT`. Status aktif/tidak aktif mengikuti aksi workflow, bukan input form.
13. Riwayat Stok Obat dan riwayat aktivitas hanya dapat ditambah, tidak dapat ditimpa; pembatalan dilakukan dengan transaksi koreksi yang tetap tercatat.
14. Asal Obat, bentuk pemakaian, dan satuan jumlah berasal dari master configurable; opsi referensi menjadi baseline awal.
15. `Lanjut/Henti` adalah keputusan rekonsiliasi saat di bangsal dan tidak boleh secara implisit mengubah resep dokter.
16. `Asal Obat` (provenance saat pendataan) berbeda dari `Sumber Pemenuhan` (sumber aktual allocation/dispensing). Keduanya wajib disimpan dan dapat ditelusuri.
17. Sumber dispensing wajib membedakan inventory pasien, sisa unit sebelumnya, farmasi, dan gudang farmasi. Hanya sumber stok operasional rumah sakit yang mengurangi stok dan dapat ditagihkan.
18. Terminologi UI: gunakan `Riwayat Stok Obat` untuk histori perubahan jumlah/lokasi inventory. `Ledger` adalah istilah teknis untuk tabel catatan mutasi yang hanya dapat ditambah dan tidak digunakan sebagai label pengguna.
19. Terminologi UI: gunakan `Resep Telah Berubah — Perlu Hitung Ulang`, bukan `State — Resep Berubah`. Istilah `dikunci` berarti hasil lama hanya dapat dilihat dan tidak dapat digunakan untuk transaksi baru.
20. Terminologi UI: gunakan `Review Ketidakcocokan`, bukan `Review Mismatch`; gunakan `Riwayat Perhitungan`, bukan `Riwayat Kalkulasi`.

#### 8.2.1 Kamus Istilah untuk Pengguna

| Istilah yang Ditampilkan | Arti Sederhana | Istilah Teknis yang Tidak Ditampilkan sebagai Label Utama |
|---|---|---|
| Riwayat Stok Obat | Daftar kronologis setiap penambahan, penggunaan, pengembalian, pemindahan, dan pemusnahan stok obat pasien | Ledger, append-only ledger |
| Review Ketidakcocokan | Pemeriksaan obat rekonsiliasi yang identitasnya berbeda dari resep aktif | Mismatch review |
| Riwayat Perhitungan | Riwayat perubahan kebutuhan obat dan pembagian sumber pada setiap versi resep | Calculation history, calculation version |
| Tidak Berlaku | Hasil perhitungan lama yang hanya dapat dilihat karena resep telah berubah | STALE |
| Resep Telah Berubah — Perlu Hitung Ulang | Pemberitahuan bahwa rekomendasi lama tidak dapat digunakan dan sistem harus menghitung berdasarkan resep terbaru | Order changed state |
| Pencocokan Obat | Perbandingan nama/item, bentuk sediaan, kekuatan, dan satuan antara resep dan inventory | Matching |
| Perubahan Rekomendasi | Farmasis mengganti pembagian sumber yang disarankan sistem dengan alasan wajib | Override |
| ID Penelusuran Transaksi | Nomor untuk mencari seluruh catatan yang berasal dari proses yang sama | Correlation ID |

### 8.3 Database Schema Recommendation

| Table | Key Columns | Purpose / Constraints |
|---|---|---|
| `medication_reconciliations` | `id`, `patient_id`, `encounter_id`, `status`, `version`, `created_by` | Header per episode; unique active header per encounter |
| `medication_reconciliation_items` | `id`, `reconciliation_id`, `medication_item_id`, `source_type`, `source_unit_id`, `dosage_form_id`, `strength_value`, `strength_unit_id`, `condition_status`, `eligibility_status`, `verified_by`, `verified_at` | Detail obat; source required; check quantity/strength positive |
| `reconciliation_inventory_lots` | `id`, `item_id`, `patient_id`, `encounter_id`, `batch_number`, `expiry_date`, `location_id`, `initial_qty`, `reserved_qty`, `used_qty`, `returned_qty`, `disposed_qty`, `version` | Patient-specific balance; nonnegative checks and optimistic lock |
| `reconciliation_inventory_ledger` | `id`, `lot_id`, `transaction_type`, `quantity`, `from_location_id`, `to_location_id`, `reference_type`, `reference_id`, `actor_id`, `correlation_id`, `created_at` | Tabel teknis Riwayat Stok Obat; catatan mutasi hanya dapat ditambah; referensi/idempotency unik |
| `medication_match_results` | `id`, `order_line_id`, `order_version`, `reconciliation_item_id`, `match_status`, `mismatch_fields`, `calculated_at` | Snapshot hasil pencocokan; `mismatch_fields` menyimpan atribut yang tidak cocok |
| `medication_source_allocations` | `id`, `order_line_id`, `order_version`, `required_qty`, `status`, `is_override`, `override_reason_code`, `version` | Header perhitungan, pembagian sumber, dan status teknis |
| `medication_source_allocation_lines` | `id`, `allocation_id`, `source_type`, `inventory_lot_id`, `pharmacy_stock_lot_id`, `warehouse_stock_lot_id`, `allocated_qty`, `dispensed_qty`, `billable_qty` | Sumber: patient inventory/previous unit/pharmacy/warehouse; qty nonnegative |
| `reconciliation_transfers` | `id`, `encounter_id`, `from_unit_id`, `to_unit_id`, `status`, `transferred_at`, `received_at`, `correlation_id` | Header transfer antarunit |
| `medication_billing_links` | `id`, `allocation_line_id`, `dispensing_line_id`, `billing_charge_id`, `billable_qty`, `status`, `idempotency_key` | Unique billing link dan reversal |
| `medication_reconciliation_audits` | `id`, `entity_type`, `entity_id`, `action`, `before_json`, `after_json`, `reason`, `actor_id`, `actor_role`, `correlation_id`, `created_at` | Riwayat aktivitas yang hanya dapat ditambah |

Index minimum: `(patient_id, encounter_id)`, `(encounter_id, status)`, `(order_line_id, order_version)`, `(item_id, location_id)`, `(lot_id, created_at)`, serta unique `idempotency_key`. Foreign key dan tenant/facility boundary wajib ditegakkan di database dan service.

### 8.4 API Endpoint Recommendations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/medication-reconciliations?encounter_id=` | Read header, summary, and dashboard list |
| POST | `/api/v1/medication-reconciliations` | Create draft header |
| POST | `/api/v1/medication-reconciliations/{id}/items` | Add source item |
| PATCH | `/api/v1/medication-reconciliation-items/{itemId}` | Edit unused draft item with version |
| POST | `/api/v1/medication-reconciliation-items/{itemId}/verify` | Verify identity and eligibility |
| GET | `/api/v1/medication-reconciliations/{id}/inventory` | Get patient inventory balances and stock movement history summary |
| POST | `/api/v1/medication-orders/{orderId}/reconciliation-match` | Calculate exact match for current order version |
| POST | `/api/v1/medication-orders/{orderId}/source-recommendations` | Calculate source allocation |
| POST | `/api/v1/medication-source-allocations/{id}/override` | Override with reason |
| POST | `/api/v1/medication-source-allocations/{id}/confirm` | Atomically reserve sources |
| POST | `/api/v1/medication-source-allocations/{id}/dispense` | Post source usage and billing request |
| POST | `/api/v1/medication-dispensings/{id}/reverse` | Compensating stock/inventory and billing reversal |
| POST | `/api/v1/medication-reconciliations/{id}/transfers` | Transfer eligible balances with patient |
| POST | `/api/v1/medication-reconciliations/{id}/close` | Lock at discharge and start settlement |
| POST | `/api/v1/reconciliation-inventory-lots/{id}/settlements` | Return or dispose remaining quantity |
| GET | `/api/v1/medication-reconciliations/{id}/audit-events` | Paginated audit timeline |

Semua mutation menerima `Idempotency-Key`, `X-Correlation-ID`, dan `expected_version`. Error minimum: `400` validation, `403` unauthorized/patient boundary, `404`, `409` stale/insufficient balance, `422` business rule, dan `503` downstream unavailable.

### 8.5 Integrations

| Sistem | Arah | Data | Failure Handling |
|---|---|---|---|
| ADT/Pendaftaran | Inbound | patient, encounter, unit, transfer, discharge | Event retry + reconciliation job |
| CPO/Order Dokter | Inbound | active order and version changes | Mark stale, release unused reservation, recalculate |
| Master Farmasi | Inbound | identity, form, strength, unit | Cache + reject verification if master invalid |
| Inventory Farmasi | Two-way | availability, reserve, issue, reverse | Idempotent command; exception queue |
| Dispensing | Two-way | allocation and actual issued qty | Source recorded per line |
| Billing | Outbound/status | billable hospital-stock qty, charge/reversal | Outbox + retry; no duplicate charge |

Gunakan transactional outbox untuk event lintas sistem. Konsistensi lokal inventory dan Riwayat Stok Obat harus menjadi satu transaksi utuh; integrasi eksternal dapat tersinkronisasi bertahap dengan status kendala yang terlihat pengguna.

### 8.6 Non-Functional Requirements

1. Otorisasi RBAC dan pembatasan unit/facility diterapkan di backend.
2. Data klinis dan identitas dienkripsi in transit dan at rest sesuai kebijakan rumah sakit.
3. Audit menggunakan waktu server tersinkronisasi dan tidak dapat dimutasi dari API aplikasi.
4. UI mendukung keyboard, focus state, label eksplisit, kontras memadai, dan tidak bergantung pada warna.
5. Dashboard ≤ 2 detik; pencocokan, perhitungan, konfirmasi, dan pembuatan tagihan masing-masing p95 < 1 detik pada dataset acceptance.
6. Sistem mendukung > 50 item rekonsiliasi per pasien dengan pagination/virtualization tanpa degradasi signifikan.
7. Observability mencakup latency, error rate, stale allocation, negative-balance prevention, billing exception, dan correlation ID.
8. Backup, retention, RPO/RTO, serta masa simpan audit mengikuti kebijakan rumah sakit dan regulasi yang berlaku.

### 8.7 Audit Events

`RECONCILIATION_CREATED`, `ITEM_ADDED`, `ITEM_UPDATED`, `ITEM_VERIFIED`, `ITEM_REJECTED`, `MATCH_CALCULATED`, `SOURCE_RECOMMENDED`, `SOURCE_OVERRIDDEN`, `ALLOCATION_CONFIRMED`, `RESERVATION_RELEASED`, `DISPENSED`, `DISPENSING_REVERSED`, `ORDER_CHANGED`, `ALLOCATION_STALE`, `INVENTORY_TRANSFERRED`, `INVENTORY_RETURNED`, `INVENTORY_DISPOSED`, `BILLING_REQUESTED`, `BILLING_SUCCEEDED`, `BILLING_FAILED`, dan `AUDIT_EXPORTED`.

### 8.8 Open Decisions

1. Apakah obat high-alert, narkotika, dan psikotropika diizinkan sebagai BYOM; bila ya, kontrol tambahan apa yang wajib?
2. Siapa yang berwenang memutuskan `CONTINUE/STOP` bila hasil farmasis berbeda dari order dokter?
3. Apakah partial unit/tablet dapat dikelola dan bagaimana aturan pembulatan per sediaan?
4. Batas waktu dan SLA penerimaan transfer inventory oleh unit tujuan.
5. Kebijakan penyimpanan foto kemasan dan masa retensinya.
6. Batas perubahan rekomendasi manual yang memerlukan persetujuan Phase 2.

### 8.9 Traceability terhadap `reff/manajemen-rekonsiliasi-obat.md`

| Kebutuhan Referensi Utama | Cakupan F21 | Lokasi Bukti |
|---|---|---|
| Pendataan nama, strength/dosis, bentuk, jumlah, aturan, asal, kelayakan, keputusan, petugas | Terpenuhi | Fitur 2; §8.1.1; kolom list §8.1.2 |
| Asal: pasien/rumah, sisa unit sebelumnya, transfer bangsal, obat operasional RS | Terpenuhi | Fitur 2 AC 7; Business Rule 16 |
| Mapping dengan resep aktif, order farmasi, dan terapi berjalan | Terpenuhi | Fitur 4 AC 1–6 |
| Exact match nama/item, bentuk, strength, dan satuan | Terpenuhi | Fitur 4; Business Rule 4 |
| Menampilkan perbandingan dosis, aturan pakai, dan jumlah kebutuhan | Terpenuhi | Fitur 4 AC 6; layar Matching pada wireframe |
| Prioritas BYOM → sisa unit → stok farmasi | Terpenuhi | Fitur 5 AC 2–4; Business Rule 5–6 |
| Perubahan rekomendasi dengan alasan klinis | Terpenuhi | Fitur 5 AC 6; riwayat aktivitas `SOURCE_OVERRIDDEN` |
| Rumus kebutuhan dikurangi sisa rekonsiliasi | Terpenuhi | Fitur 5 AC 1–3 |
| Sumber dispensing: pasien, bangsal sebelumnya, farmasi, gudang farmasi | Terpenuhi | Fitur 6 AC 6; allocation schema; Business Rule 17 |
| Inventory khusus: awal, digunakan, tersisa, aktif, lokasi, unit asal | Terpenuhi | Fitur 3; §8.1.1–8.1.2; saldo dan Riwayat Stok Obat |
| Transfer sisa eligible mengikuti pasien | Terpenuhi | Fitur 9; workflow §9.5 |
| Billing hanya stok operasional RS | Terpenuhi | Fitur 8; Business Rule 9–10 dan 17 |
| Audit petugas, waktu, keputusan, jumlah, asal, alasan | Terpenuhi | Fitur 11; §8.7 |
| Perhitungan ulang saat dosis/frekuensi/durasi/jumlah berubah | Terpenuhi | Fitur 7 |
| Larangan saldo negatif dan penggunaan lintas pasien | Terpenuhi | Fitur 3; Business Rule 1 dan 7 |
| Lock setelah pasien pulang; return/disposal | Terpenuhi | Fitur 10 |
| Pengecualian obat pulang dan pasien operasi | Terpenuhi | Fitur 5 AC 5; Business Rule 11 |
| Target performa dan >50 item | Terpenuhi | Goals & Metrics; §8.6 |

## 9. Workflow / BPMN Interpretation

### 9.1 Rekonsiliasi Awal

Farmasis memilih episode → mencatat obat dan asal → sistem memvalidasi → farmasis memeriksa identitas/kondisi → item tidak layak ditolak dan diarahkan ke penyelesaian → item layak diverifikasi → inventory pasien aktif dan catatan saldo awal dibuat pada Riwayat Stok Obat.

### 9.2 Matching dan Alokasi

Resep aktif diterima → pencocokan tepat empat atribut → ketidakcocokan diarahkan ke Review Ketidakcocokan oleh farmasis → item yang cocok dihitung kebutuhan tersisanya → pembagian BYOM → sisa unit → stok RS → farmasis meninjau → konfirmasi melakukan reservasi sebagai satu transaksi utuh.

### 9.3 Dispensing dan Billing

Farmasi mengambil obat sesuai allocation line → sistem mem-post penggunaan tiap sumber → inventory pasien berkurang hanya untuk sumber rekonsiliasi → stok RS berkurang hanya untuk sumber RS → billing dibuat hanya sebesar actual dispensed dari stok RS → seluruh hasil dicatat dengan correlation ID.

### 9.4 Perubahan Resep

Perubahan resep diterima → bandingkan versi resep → tandai pembagian lama Tidak Berlaku → lepaskan reservasi yang belum terpakai → pertahankan histori obat yang sudah diberikan → hitung ulang → tampilkan hasil baru untuk konfirmasi.

### 9.5 Transfer dan Pulang

Perpindahan unit → validasi saldo dan reservasi → perubahan lokasi mengikuti pasien → unit tujuan melihat inventory yang sama. Saat pasien pulang → tutup inventory dari pemakaian baru → farmasis memilih pengembalian atau pemusnahan untuk setiap saldo → Riwayat Stok Obat dan riwayat aktivitas diperbarui.

### 9.6 Definition of Done

1. Seluruh AC P0/P1 Phase 1 lulus unit, integration, security, concurrency, dan UAT test.
2. Uji membuktikan tidak ada saldo negatif, pemakaian lintas pasien, stok RS berkurang untuk BYOM, atau duplicate billing.
3. Contract test ADT, order/CPO, inventory, dispensing, dan billing lulus termasuk retry/out-of-order event.
4. Performance target lulus dengan laporan p50/p95/p99.
5. Hak akses berbasis peran, riwayat yang tidak dapat ditimpa, pencegahan transaksi ganda, pencegahan perubahan data bersamaan, dan pemantauan sistem diverifikasi.
6. Wireframe pada `ui-preview.html` disetujui Product, Farmasi, dan perwakilan pengguna.
