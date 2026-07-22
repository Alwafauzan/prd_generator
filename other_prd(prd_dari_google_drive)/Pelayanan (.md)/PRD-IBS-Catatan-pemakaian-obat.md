# Product Requirement Document (PRD)

# D31 — Catatan Pemakaian Obat dan Material Operasi

## 1. Metadata Dokumen

### Approval

| Stakeholder | Jabatan/Peran | Status | Tanggal |
|---|---|---|---|
| PIC | Arif Aminudin |  | — |

### Document Version

| Tanggal | Versi | Deskripsi Perubahan | Author |
|---|---:|---|---|
| 2026-07-21 | 0.1 | Draft awal PRD D31 berdasarkan ticket dan `template-new.md`. | Product/Engineering |
| 2026-07-22 | 0.2 | Menyatukan dua screenshot referensi menjadi satu form kontinu serta menyelaraskan input Obat dan Alat Kesehatan. | Product/Engineering |
| 2026-07-22 | 0.3 | Menambahkan transparansi actor/unit/timestamp per item dan dua lapis validasi duplikat saat Tambahkan ke List serta Simpan. | Product/Engineering |
| 2026-07-22 | 0.4 | Memperluas status operasi yang dapat dimutasi menjadi Terkonfirmasi, Sedang Berlangsung, dan Selesai; billing final tetap memerlukan adjustment. | Product/Engineering |

---

## 2. Overview & Background

### Overview / Brief Summary

D31 menyediakan satu form kontinu untuk mencatat obat dan alat kesehatan/material tambahan yang digunakan selama tindakan operasi di luar paket standar operasi. Bagian atas menampilkan No. RM dan Nama Pasien, diikuti input serta list Obat, kemudian input serta list Alat Kesehatan, dan diakhiri action Kembali/Simpan. User IBS dan Farmasi IBS dapat bekerja pada pasien serta jadwal operasi yang sama tanpa saling menimpa data.

Setiap item disimpan sebagai transaksi independen. Penyimpanan dianggap berhasil hanya jika catatan pemakaian, pengurangan stok Farmasi IBS, histori mutasi stok, dan komponen billing pasien berhasil diproses satu kali secara konsisten. Fitur juga menyediakan audit trail yang memperlihatkan user, unit asal, waktu input, waktu perubahan terakhir, dan user terakhir yang mengubah.

### Business Process — As-Is vs To-Be

#### As-Is

Alur bisnis V1 tetap digunakan, tetapi implementasi saat ini mempunyai kendala berikut:

1. User IBS dan Farmasi IBS dapat mengakses pasien yang sama, tetapi penyimpanan berbasis snapshot berisiko membuat perubahan user terakhir menimpa data user lain.
2. Alert ketika jadwal belum terkonfirmasi memakai konteks “Form Transfer Internal” dan tidak relevan dengan catatan pemakaian operasi.
3. Dokumentasi form sebelumnya dapat disalahartikan sebagai dua tampilan karena screenshot bagian atas dan bawah diambil terpisah, padahal keduanya merupakan satu form kontinu.
4. Asal pencatatan dan riwayat perubahan item belum cukup transparan bagi kedua unit.
5. Kegagalan stok atau billing berisiko menimbulkan data parsial, duplikasi posting, atau catatan yang tidak konsisten.
6. Item yang sama dapat dicatat lebih dari satu kali tanpa indikator yang membantu user memastikan duplikasi tersebut disengaja.

#### To-Be

1. User membuka Catatan Pemakaian dari jadwal operasi pasien.
2. Sistem memvalidasi status operasi. Aksi tambah, ubah, hapus, dan Simpan tersedia pada `CONFIRMED` (Terkonfirmasi), `IN_PROGRESS` (Sedang Berlangsung), dan `COMPLETED` (Selesai), selama billing belum final. Status lain menggunakan mode read-only.
3. Sistem menampilkan No. RM, Nama Pasien, dan judul form pada satu header.
4. Dalam tampilan yang sama, user mengisi blok **Masukkan Nama Obat**, menambahkan item ke **List Data Obat**, lalu melanjutkan ke blok **Masukkan Alat Kesehatan** dan **List Alat Kesehatan**.
5. Tombol **Tambahkan ke List** hanya memasukkan item ke daftar kerja pada form; posting bisnis dilakukan saat user menekan **Simpan**.
6. Pada ketiga status operasi yang dapat dimutasi, User IBS dan Farmasi IBS dapat memilih item dari gudang Farmasi IBS aktif. Satuan, Pabrikan, dan status Fornas berasal dari master item.
7. Saat Simpan, sistem memproses setiap item sebagai transaksi independen dengan `row_version` dan `idempotency_key` dalam satu unit kerja logis: catatan pemakaian tersimpan, stok berkurang, mutasi stok tercatat, dan billing bertambah.
8. Jika salah satu langkah gagal, item tidak boleh tampil sebagai transaksi berhasil dan seluruh dampak transaksi dibatalkan atau dikompensasi.
9. Perubahan item yang sama secara bersamaan dideteksi melalui optimistic locking. User menerima pesan konflik dan data terbaru dimuat ulang.
10. Penghapusan sebelum finalisasi mengembalikan stok dan menghapus komponen billing terkait secara idempotent.
11. Status operasi Selesai tetap dapat dimutasi selama billing belum final. Setelah billing difinalisasi, data menjadi read-only bagi user biasa dan pengguna berotorisasi khusus melakukan koreksi/adjustment dengan jejak audit lengkap.
12. Setiap baris pada List Data Obat dan List Alat Kesehatan menampilkan user yang menambahkan, unit asal, waktu input, waktu update terakhir, dan user terakhir yang mengubah.

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---:|---|---|
| 1 | Keutuhan data saat multi-user | 0 item hilang atau tertimpa pada pengujian concurrent create oleh minimal 2 user pada jadwal yang sama. |
| 2 | Konflik update item yang sama | 100% stale update ditolak dengan HTTP `409` dan data terbaru dapat dimuat ulang. |
| 3 | Konsistensi pemakaian–stok–billing | 100% transaksi yang berstatus berhasil memiliki tepat 1 mutasi stok dan tepat 1 komponen billing aktif. |
| 4 | Pencegahan proses ganda | 0 pengurangan stok atau billing ganda untuk kombinasi item transaksi dan jenis operasi yang sama. |
| 5 | Waktu buka form | p95 < 1 detik untuk data sampai dengan 300 item pada jaringan dan beban uji yang disepakati. |
| 6 | Waktu simpan item | p95 < 1 detik sampai respons commit diterima pada arsitektur deployment yang disepakati. |
| 7 | Sinkronisasi stok | p95 < 2 detik sejak request simpan diterima sampai mutasi stok berhasil. |
| 8 | Sinkronisasi billing | p95 < 2 detik sejak request simpan diterima sampai komponen billing berhasil. |
| 9 | Kapasitas daftar | Total 300 item Obat dan Alat Kesehatan per episode tetap dapat dimuat bertahap dalam form yang sama tanpa penurunan performa di luar target. |
| 10 | Transparansi audit | 100% tambah, ubah, hapus, koreksi, kegagalan, dan konflik memiliki audit/event log dengan actor dan timestamp. |
| 11 | Validasi status operasi | 100% aksi mutasi hanya diterima pada `CONFIRMED`, `IN_PROGRESS`, atau `COMPLETED` dan ditolak pada status lain atau ketika billing sudah final. |
| 12 | Keberhasilan rollback/kompensasi | 0 catatan berhasil yang hanya mempunyai salah satu dampak stok atau billing pada pengujian failure injection. |

Catatan pengukuran: baseline perangkat, jaringan, volume concurrent user, dan tool observability perlu disepakati pada test plan non-fungsional.

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — MVP | Phase 2 — Advanced Approval/Escalation |
|---|---|---|
| Form dan daftar catatan pemakaian | Satu form kontinu: identitas pasien, input/list Obat, input/list Alat Kesehatan, Kembali, dan Simpan. | Filter analitik dan export bila dibutuhkan. |
| CRUD item | Tambah, lihat, ubah, dan hapus sebelum finalisasi sesuai role. | Koreksi dengan approval berjenjang bila kebijakan RS mensyaratkan. |
| Multi-user collaboration | Item independen, optimistic locking, idempotency, dan auto-refresh/pemberitahuan perubahan. | Real-time push/websocket dan presence indicator bila dibutuhkan. |
| Stok Farmasi IBS | Validasi stok terbaru, pengurangan stok, mutasi, reversal ketika hapus, dan idempotensi. | Approval exception stok dan rekonsiliasi otomatis lanjutan. |
| Billing pasien | Tambah, update delta, hapus/reversal, validasi finalisasi, dan idempotensi. | Approval koreksi tagihan berjenjang. |
| Audit trail | Audit immutable untuk tambah, ubah, hapus, koreksi, konflik, dan kegagalan. | Dashboard investigasi/audit terpusat. |
| Duplikasi item | Validasi saat Tambahkan ke List dan saat Simpan; item sama dari actor yang sama ditotal, sedangkan actor/unit berbeda dapat menjadi baris terpisah setelah konfirmasi. | Rule rekomendasi duplikasi berbasis waktu/jenis tindakan. |
| Otorisasi pasca-finalisasi | Hanya role khusus yang dapat memulai adjustment; seluruh aktivitas diaudit. | Maker-checker/approval adjustment. |
| Layout form | Mengikuti gabungan `pemakaian-obat-form.png` dan `pemakaian-obat-form-bagian-bawah.png` sebagai satu tampilan, bukan dua layar/tab. | Personalisasi kolom atau saved filter. |

### In Scope Phase 1

1. Input Obat tambahan operasi melalui blok Masukkan Nama Obat dan List Data Obat.
2. Input Alat Kesehatan/material tambahan melalui blok Masukkan Alat Kesehatan dan List Alat Kesehatan pada form yang sama.
3. Pembacaan bersama pada jadwal/pasien yang sama.
4. Validasi status operasi yang dapat dimutasi: `CONFIRMED`, `IN_PROGRESS`, dan `COMPLETED`.
5. Pemilihan item hanya dari gudang Farmasi IBS aktif.
6. Integrasi stok, histori mutasi, dan billing pasien.
7. Tambah, edit, hapus/reversal, serta koreksi dengan otorisasi khusus.
8. Pencegahan overwrite dan double processing.
9. Deteksi item duplikat.
10. Audit trail immutable.
11. Satu tampilan form kontinu dan performa untuk total 300 item atau lebih.

### Out of Scope

1. Perubahan alur penjadwalan atau konfirmasi operasi.
2. Pengelolaan master obat, material, gudang, tarif, user, atau role.
3. Pengelolaan paket standar operasi; D31 hanya menangani item tambahan di luar paket.
4. Proses dispensing, peracikan, atau administrasi pemberian obat klinis.
5. Finalisasi billing pasien.
6. Stock opname, transfer stok antargudang, dan pembelian barang.
7. Approval berjenjang untuk adjustment pada Phase 1.
8. Offline mode.

---

## 5. Related Features

| Kode/Modul | Relasi Teknis/Bisnis |
|---|---|
| A39 — Master Data Ruang IBS | Sumber identitas unit/ruang IBS. |
| Master Data Barang Farmasi | Sumber item obat/material, satuan, status aktif, dan atribut barang. |
| Jadwal Operasi | Sumber pasien, episode, ruang, tindakan, dan status `CONFIRMED`/`IN_PROGRESS`/`COMPLETED`. |
| Inventory Farmasi | Sumber stok gudang Farmasi IBS serta tujuan mutasi pengurangan/reversal. |
| Billing Pasien | Tujuan komponen tagihan dan sumber status finalisasi billing. |
| RBAC/Audit | Sumber hak akses user biasa dan otorisasi khusus untuk adjustment. |
| E12 — Order Catatan Pemberian Obat | Dapat menjadi referensi obat yang diorder, tetapi transaksi pemakaian operasi D31 tetap entitas terpisah. |

---

## 6. Business Process & User Stories

### State Machine Table

Status adalah system-managed dan tidak menjadi field input pada form create.

| Status | Deskripsi | Efek Stok | Efek Billing | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|---|
| `PROCESSING` | Status internal sementara saat validasi dan unit kerja berlangsung. | Belum dianggap final. | Belum dianggap final. | `COMMITTED` atau transaksi dibatalkan. | Sama. |
| `COMMITTED` | Item berhasil disimpan bersama seluruh dampak stok dan billing. | Berkurang satu kali. | Komponen aktif satu kali. | `COMMITTED` melalui edit delta, `DELETED`, atau `ADJUSTED`. | Dapat menuju `CORRECTION_PENDING_APPROVAL`. |
| `DELETED` | Soft-deleted sebelum finalisasi setelah reversal berhasil. | Dikembalikan satu kali. | Komponen dibatalkan/dihapus satu kali. | Terminal; item tetap ada di audit. | Sama. |
| `ADJUSTED` | Koreksi setelah billing final oleh role khusus. | Mengikuti delta/kompensasi adjustment. | Mengikuti mekanisme koreksi billing. | Dapat dikoreksi lagi oleh role khusus sesuai kebijakan. | Dihasilkan setelah approval koreksi. |
| `CORRECTION_PENDING_APPROVAL` | Rancangan status untuk approval koreksi. | Belum berubah. | Belum berubah. | Tidak digunakan. | `ADJUSTED` atau `CORRECTION_REJECTED`. |
| `CORRECTION_REJECTED` | Pengajuan koreksi ditolak. | Tidak berubah. | Tidak berubah. | Tidak digunakan. | Terminal atau diajukan ulang. |

Catatan: kegagalan sebelum commit tidak menghasilkan item bisnis berstatus `FAILED`; detailnya masuk error log dan respons gagal. Hal ini mencegah data parsial tampak sebagai pemakaian yang sah.

### Role and Permission Matrix

| Aksi | User IBS | User Farmasi IBS | User dengan Otorisasi Khusus | System |
|---|:---:|:---:|:---:|:---:|
| Lihat daftar | Ya | Ya | Ya | — |
| Tambah saat status `CONFIRMED`/`IN_PROGRESS`/`COMPLETED` dan billing belum final | Ya | Ya | Ya | — |
| Edit item pada tiga status operasi dan billing belum final | Ya, sesuai kebijakan kepemilikan | Ya, sesuai kebijakan kepemilikan | Ya | — |
| Hapus item pada tiga status operasi dan billing belum final | Ya, sesuai kebijakan kepemilikan | Ya, sesuai kebijakan kepemilikan | Ya | — |
| Adjustment setelah selesai/final | Tidak | Tidak | Ya | — |
| Posting stok dan billing | Tidak | Tidak | Tidak | Ya |
| Ubah audit trail | Tidak | Tidak | Tidak | Tidak |

Kebijakan apakah user boleh mengubah item milik unit lain diberi tanda `[PERLU KONFIRMASI]`; ticket memastikan pembacaan bersama tetapi belum menetapkan ownership edit/delete.

### User Stories Utama

1. Sebagai User IBS, saya ingin menambahkan obat/material tambahan yang digunakan saat operasi agar pemakaian aktual terdokumentasi.
2. Sebagai User Farmasi IBS, saya ingin melihat dan menambahkan item pada pasien operasi yang sama agar kebutuhan operasi dapat dilayani secara kolaboratif.
3. Sebagai kedua user, saya ingin perubahan user lain tidak menimpa data saya agar tidak ada catatan yang hilang.
4. Sebagai petugas, saya ingin mengetahui siapa dan dari unit mana suatu item dicatat agar ketidaksesuaian mudah ditelusuri.
5. Sebagai petugas, saya ingin diberi indikator duplikasi agar penambahan item yang sama benar-benar disengaja.
6. Sebagai pengelola stok, saya ingin setiap pemakaian menghasilkan satu mutasi stok agar stok Farmasi IBS akurat.
7. Sebagai petugas billing, saya ingin setiap pemakaian menghasilkan satu komponen tagihan agar tidak ada kehilangan atau duplikasi tagihan.
8. Sebagai user berotorisasi khusus, saya ingin melakukan adjustment setelah billing final agar koreksi tetap dapat dilakukan secara terkendali dan terlacak.

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

#### Fitur FR-001 — Akses Form dan Validasi Status Operasi

- **User Story:** Sebagai petugas IBS/Farmasi IBS, saya ingin mengubah catatan pada status operasi yang diperbolehkan agar pemakaian dapat dicatat sejak terkonfirmasi sampai operasi selesai.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Ketika status operasi `CONFIRMED` (Terkonfirmasi), `IN_PROGRESS` (Sedang Berlangsung), atau `COMPLETED` (Selesai), user dengan izin dapat memakai aksi tambah, edit, hapus, dan Simpan selama billing belum final.
  - **AC 2:** Ketika status operasi di luar tiga status tersebut, form dapat dibuka read-only dan seluruh aksi mutasi dinonaktifkan.
  - **AC 3:** Sistem menampilkan pesan: “Catatan pemakaian obat dan material operasi hanya dapat diinput atau diubah saat status operasi Terkonfirmasi, Sedang Berlangsung, atau Selesai.”
  - **AC 4:** Backend mengulang validasi status operasi dan finalisasi billing pada setiap request mutasi; manipulasi frontend tidak dapat melewati validasi.
  - **AC 5:** Header form menampilkan No. RM, Nama Pasien, status operasi, dan indikator dapat diedit/read-only. ID jadwal/episode tetap dibawa sebagai konteks sistem.
  - **AC 6:** Status `COMPLETED` tidak otomatis mengunci form; penguncian normal terjadi jika billing `FINALIZED` atau permission user tidak memenuhi.

#### Fitur FR-002 — Form Tunggal dan Daftar Catatan Pemakaian

- **User Story:** Sebagai petugas, saya ingin mengisi obat dan alat kesehatan pada satu tampilan agar seluruh pemakaian operasi dapat diselesaikan tanpa berpindah layar.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** `pemakaian-obat-form.png` dan `pemakaian-obat-form-bagian-bawah.png` dirender sebagai satu form kontinu, bukan dua tab, modal bertahap, atau halaman terpisah.
  - **AC 2:** Urutan tampilan adalah Header Pasien → Masukkan Nama Obat → List Data Obat → Masukkan Alat Kesehatan → List Alat Kesehatan → Kembali/Simpan.
  - **AC 3:** Header menampilkan No. RM, Nama Pasien, dan judul “Catatan Pemakaian Obat dan Material Operasi”.
  - **AC 4:** List Data Obat dan List Alat Kesehatan masing-masing menampilkan kolom No., Nama, Pabrikan, Fornas, Jumlah, Unit, Informasi Input, dan aksi Edit/Hapus.
  - **AC 5:** Daftar kosong menampilkan `No data available` tanpa memisahkan user ke tampilan lain.
  - **AC 6:** Membuka form dengan total sampai 300 item memenuhi p95 < 1 detik pada test environment yang disepakati; pemuatan bertahap diperbolehkan selama tetap terasa sebagai satu form.

#### Fitur FR-003 — Tambah Obat dan Alat Kesehatan ke List

- **User Story:** Sebagai User IBS/Farmasi IBS, saya ingin menambahkan satu item pemakaian agar stok dan billing mengikuti pemakaian aktual.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Blok Obat memiliki input Nama Obat, Jumlah, Satuan, tombol Tambahkan ke List, serta ikon tambah/bersihkan sesuai referensi.
  - **AC 2:** Blok Alat Kesehatan memiliki input Nama Alat Kesehatan, Jumlah, Satuan, tombol Tambahkan ke List, serta ikon tambah/bersihkan sesuai referensi.
  - **AC 3:** User hanya dapat memilih item aktif yang tersedia pada gudang Farmasi IBS aktif dan sesuai kelompok input (`MEDICINE` untuk Obat; `MEDICAL_DEVICE/MATERIAL` untuk Alat Kesehatan).
  - **AC 4:** Jumlah wajib lebih besar dari 0 dan mengikuti presisi satuan barang; Satuan terisi otomatis dari master item dan tidak diketik bebas.
  - **AC 5:** Klik Tambahkan ke List memvalidasi input dan menambahkan item ke daftar kerja tanpa melakukan posting stok/billing.
  - **AC 6:** Pabrikan dan Fornas pada list berasal dari master/snapshot item dan bukan input manual.
  - **AC 7:** User dapat mengedit atau menghapus baris dari list sebelum menekan Simpan.
  - **AC 8:** Klik Simpan mengirim kedua list dalam satu request logis dengan `Idempotency-Key`; respons berhasil hanya diberikan setelah catatan, pengurangan stok, mutasi stok, dan komponen billing konsisten.
  - **AC 9:** Klik Simpan berulang dengan idempotency key sama mengembalikan hasil transaksi pertama tanpa posting ulang.
  - **AC 10:** Jika item yang dipilih sudah ada pada list yang sama, Tambahkan ke List memicu konfirmasi duplikat sesuai FR-007 dan tidak langsung mengubah jumlah.

#### Fitur FR-004 — Edit Item dan Perhitungan Delta

- **User Story:** Sebagai petugas berwenang, saya ingin memperbaiki item sebelum finalisasi agar jumlah pemakaian, stok, dan billing tetap selaras.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Request edit wajib membawa `row_version` terakhir.
  - **AC 2:** Perubahan kuantitas memproses delta stok dan delta billing, bukan mem-posting ulang nilai total.
  - **AC 3:** Perubahan item barang melakukan reversal terhadap item lama dan posting item baru dalam satu unit kerja logis.
  - **AC 4:** Jika stok terkini tidak cukup untuk delta tambahan, seluruh edit ditolak tanpa perubahan parsial.
  - **AC 5:** Edit yang berhasil menaikkan `row_version` satu tingkat dan memperbarui `updated_by` serta `updated_at`.
  - **AC 6:** Status jadwal dan finalisasi billing divalidasi ulang saat commit.

#### Fitur FR-005 — Hapus Item dan Reversal

- **User Story:** Sebagai petugas berwenang, saya ingin menghapus pencatatan yang keliru agar stok dan billing dikoreksi tanpa menghilangkan audit.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Sebelum finalisasi, hapus melakukan soft delete, pengembalian stok, pencatatan mutasi reversal, dan pembatalan komponen billing terkait.
  - **AC 2:** Semua dampak hapus berhasil bersama atau tidak ada perubahan yang dianggap berhasil.
  - **AC 3:** Request hapus ulang dengan idempotency key sama tidak menambah stok atau membatalkan billing lebih dari satu kali.
  - **AC 4:** Item terhapus tidak tampil pada daftar aktif, tetapi tetap tersedia pada audit trail.
  - **AC 5:** User wajib mengisi alasan penghapusan.

#### Fitur FR-006 — Multi-user Concurrency dan Conflict Handling

- **User Story:** Sebagai petugas, saya ingin bekerja bersamaan tanpa overwrite agar data kedua unit tetap utuh.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Dua user dapat menambah item berbeda pada jadwal yang sama dan kedua item tersimpan.
  - **AC 2:** Insert item anak tidak mengganti seluruh daftar/snapshot pemakaian.
  - **AC 3:** Jika dua user mengubah item yang sama dengan `row_version` sama, hanya request pertama yang commit.
  - **AC 4:** Request kedua menerima HTTP `409 Conflict`, pesan informatif, dan data versi terbaru.
  - **AC 5:** Frontend menawarkan aksi “Muat Data Terbaru”; data hasil perubahan user pertama tidak boleh ditimpa otomatis.
  - **AC 6:** Audit mencatat actor dan versi pada setiap perubahan serta konflik.

#### Fitur FR-007 — Deteksi Item Duplikat

- **User Story:** Sebagai petugas, saya ingin diperingatkan ketika item yang sama sudah tercatat agar penambahan ganda disengaja.
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Validasi duplikat dilakukan dua kali: saat **Tambahkan ke List** terhadap data yang sudah tampil dan saat **Simpan** terhadap data terbaru di server.
  - **AC 2:** Saat item yang sama sudah ada dari actor/user yang sama, form menampilkan konfirmasi **Item Sudah Ada** berisi Nama Item, Jumlah Sebelumnya, Jumlah Ditambahkan, dan Total Baru.
  - **AC 3:** Jika user memilih **Lanjutkan & Total**, sistem memperbarui jumlah pada baris actor yang sama menjadi `jumlah_sebelumnya + jumlah_baru`; jika Batal/tutup, list tidak berubah dan input tetap tersedia.
  - **AC 4:** Saat item yang sama sudah ada tetapi berasal dari user atau unit berbeda, form menampilkan actor, unit asal, waktu input/update, dan peringatan potensi miss komunikasi IBS/Farmasi.
  - **AC 5:** Jika user melanjutkan duplikat lintas user/unit, sistem membuat baris terpisah karena dianggap sebagai penggunaan yang berbeda; jumlah tidak digabung ke baris milik user lain.
  - **AC 6:** Jika user membatalkan duplikat lintas user/unit, tidak ada baris baru dan data existing tidak berubah.
  - **AC 7:** Saat Simpan, backend membaca ulang item aktif terbaru. Duplikat yang muncul setelah form dibuka wajib menghasilkan respons konflik/konfirmasi, bukan langsung di-commit tanpa sepengetahuan user.
  - **AC 8:** Setelah user mengonfirmasi hasil validasi Simpan, item actor yang sama dapat ditotal dengan delta dan `row_version`; item actor/unit berbeda tetap menjadi transaksi/baris independen.
  - **AC 9:** Keputusan total, tambah baris terpisah, atau batal dicatat pada audit trail saat data di-commit.
  - **AC 10:** Setiap `usage_item_id` hanya boleh diposting satu kali per jenis posting; baris terpisah wajib mempunyai ID dan idempotency key sendiri.

#### Fitur FR-008 — Integrasi Stok Farmasi IBS

- **User Story:** Sebagai pengelola stok, saya ingin pemakaian mengurangi stok gudang yang tepat agar stok operasional akurat.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Backend memvalidasi gudang Farmasi IBS aktif dan saldo stok terkini tepat sebelum commit.
  - **AC 2:** Create menghasilkan tepat satu mutasi keluar dengan referensi `usage_item_id`.
  - **AC 3:** Edit menghasilkan mutasi delta atau reversal-plus-repost yang dapat ditelusuri ke item asal.
  - **AC 4:** Hapus menghasilkan tepat satu mutasi masuk/reversal.
  - **AC 5:** Unique constraint mencegah kombinasi `usage_item_id`, `posting_type`, dan `posting_sequence` diproses dua kali.
  - **AC 6:** Jika posting stok gagal, catatan tidak boleh dinyatakan `COMMITTED` dan billing tidak boleh tersisa aktif.

#### Fitur FR-009 — Integrasi Billing Pasien

- **User Story:** Sebagai petugas billing, saya ingin pemakaian otomatis menjadi tagihan agar semua item tertagih tanpa duplikasi.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Create menghasilkan tepat satu komponen billing aktif yang mereferensikan `usage_item_id`.
  - **AC 2:** Edit memperbarui nilai/kuantitas billing sesuai delta dan tidak membuat komponen aktif ganda.
  - **AC 3:** Hapus sebelum finalisasi membatalkan komponen billing terkait secara idempotent.
  - **AC 4:** Backend memvalidasi status finalisasi billing pada setiap edit dan hapus.
  - **AC 5:** Jika posting billing gagal, catatan tidak dinyatakan `COMMITTED` dan dampak stok dibatalkan atau dikompensasi.
  - **AC 6:** Harga/tarif tersimpan sebagai snapshot transaksi sesuai sumber tarif yang berlaku `[PERLU KONFIRMASI]`.

#### Fitur FR-010 — Read-only dan Adjustment Setelah Billing Final

- **User Story:** Sebagai user berotorisasi khusus, saya ingin mengoreksi data setelah billing final agar koreksi terkendali tanpa mengunci form hanya karena operasi berstatus Selesai.
- **Prioritas:** P0
- **Fase:** Phase 1 untuk otorisasi khusus; Phase 2 untuk approval berjenjang.
- **Acceptance Criteria:**
  - **AC 1:** Ketika operasi `COMPLETED` dan billing belum final, user biasa dengan izin tetap dapat tambah/edit/hapus.
  - **AC 2:** Ketika billing `FINALIZED`, user biasa hanya dapat membaca data pada status operasi apa pun.
  - **AC 3:** User tanpa permission khusus menerima HTTP `403` bila mencoba mutasi setelah billing final melalui API.
  - **AC 4:** User khusus wajib memilih jenis koreksi dan mengisi alasan.
  - **AC 5:** Koreksi tidak mengubah audit lama; sistem membuat adjustment dan posting kompensasi baru.
  - **AC 6:** Semua adjustment mereferensikan item asal, actor, alasan, waktu, dan dampak stok/billing.
  - **AC 7:** Kolom approval disiapkan nullable untuk Phase 2 tetapi tidak menghambat adjustment Phase 1.

#### Fitur FR-011 — Audit Trail Transparan dan Immutable

- **User Story:** Sebagai petugas/auditor, saya ingin melihat asal dan perubahan item agar penyimpangan dapat ditelusuri.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Setiap baris aktif menampilkan added by, unit asal, input time, last updated time, dan last updated by.
  - **AC 2:** Detail audit menampilkan aksi tambah, edit, hapus, adjustment, konflik, kegagalan integrasi, serta nilai before/after bila relevan.
  - **AC 3:** Audit tidak dapat diedit atau dihapus melalui endpoint aplikasi.
  - **AC 4:** Timestamp disimpan dalam UTC dan ditampilkan sesuai zona waktu fasilitas.
  - **AC 5:** Data sensitif yang tidak diperlukan tidak disalin ke audit payload.

#### Fitur FR-012 — Atomicity, Idempotency, dan Retry Aman

- **User Story:** Sebagai pemilik proses, saya ingin kegagalan tidak membuat data parsial agar stok, billing, dan catatan konsisten.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Untuk dependency dalam database yang sama, seluruh write dilakukan dalam satu database transaction.
  - **AC 2:** Untuk service terpisah, orchestrator menggunakan reservation/commit atau kompensasi yang menjamin item tidak ditampilkan sebagai `COMMITTED` sebelum semua langkah berhasil.
  - **AC 3:** Retry request dengan idempotency key sama mengembalikan hasil yang sama dan tidak menggandakan efek.
  - **AC 4:** Timeout atau user menutup browser tidak mengubah hasil commit server; setelah dibuka kembali hanya data committed yang tampil.
  - **AC 5:** Failure injection pada penyimpanan, stok, mutasi, dan billing membuktikan tidak ada state berhasil parsial.
  - **AC 6:** Error log memiliki correlation ID untuk penelusuran lintas modul/service.

#### Fitur FR-013 — Performance dan Large Dataset

- **User Story:** Sebagai petugas, saya ingin form tunggal tetap responsif pada operasi dengan banyak item agar pencatatan tidak terhambat.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Endpoint dapat memakai pagination/cursor atau incremental loading di belakang layar, tetapi frontend tetap menampilkan List Data Obat dan List Alat Kesehatan pada satu form kontinu.
  - **AC 2:** Query list memiliki indeks untuk episode operasi, tipe item, status aktif, dan waktu input.
  - **AC 3:** Pengujian minimal mencakup 300 item per episode operasi dan concurrent create oleh User IBS serta Farmasi IBS.
  - **AC 4:** p95 buka form, simpan, stok, dan billing memenuhi target pada Bagian 3.
  - **AC 5:** Tombol Simpan menampilkan loading state dan tidak dapat memicu request baru dengan key berbeda selama request yang sama masih berjalan.

### 7.2 Validasi — Wording Frontend

| Kondisi/Field | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Status operasi | System validation | Mutasi diizinkan pada `CONFIRMED`, `IN_PROGRESS`, atau `COMPLETED` selama billing belum final | “Catatan pemakaian obat dan material operasi hanya dapat diinput atau diubah saat status operasi Terkonfirmasi, Sedang Berlangsung, atau Selesai.” | “Status lain tetap dapat dilihat dalam mode read-only.” |
| Gudang Farmasi IBS | Select/read-only | Harus aktif | “Gudang Farmasi IBS tidak aktif. Pilih gudang aktif atau hubungi administrator.” | “Item tambahan hanya dapat diambil dari gudang Farmasi IBS aktif.” |
| Nama Obat | Search select | Wajib saat Tambahkan ke List Obat; item aktif dan tersedia di gudang | “Nama Obat wajib dipilih.” | “Pilih obat dari master Farmasi IBS.” |
| Jumlah Obat | Decimal | Wajib, > 0, presisi sesuai satuan | “Jumlah Obat harus lebih besar dari 0.” | “Gunakan Satuan yang tampil otomatis.” |
| Nama Alat Kesehatan | Search select | Wajib saat Tambahkan ke List Alat Kesehatan; item aktif dan tersedia di gudang | “Nama Alat Kesehatan wajib dipilih.” | “Pilih alat kesehatan dari master Farmasi IBS.” |
| Jumlah Alat Kesehatan | Decimal | Wajib, > 0, presisi sesuai satuan | “Jumlah Alat Kesehatan harus lebih besar dari 0.” | “Gunakan Satuan yang tampil otomatis.” |
| Satuan | Read-only | Sesuai item terpilih | “Satuan item tidak ditemukan. Periksa master barang.” | “Terisi otomatis dan tidak dapat diketik bebas.” |
| List Obat/Alat Kesehatan | Staged list | Minimal satu item pada salah satu list sebelum Simpan | “Tambahkan minimal satu Obat atau Alat Kesehatan.” | “Tambahkan item ke list sebelum menyimpan form.” |
| Stok | System validation | Stok terkini >= kebutuhan/delta | “Stok Farmasi IBS tidak mencukupi. Stok tersedia: {available_stock} {unit}.” | “Stok divalidasi kembali saat disimpan.” |
| Item sama — user/unit sama | Confirmation | Wajib pilih Lanjutkan & Total atau Batal | “Item sudah ada di list oleh user yang sama. Jika dilanjutkan, jumlah baru akan ditambahkan ke jumlah sebelumnya.” | “Jumlah sebelumnya: {old_qty}; ditambahkan: {added_qty}; total baru: {total_qty} {unit}.” |
| Item sama — user/unit berbeda | Confirmation | Wajib pilih Tambahkan Baris Baru atau Batal | “Item yang sama sudah diinput oleh {user} dari {unit}. Periksa kemungkinan miss komunikasi. Jika dilanjutkan, item dibuat sebagai baris terpisah.” | “Input: {created_at}; update terakhir: {updated_at} oleh {updated_by}.” |
| Duplikat terdeteksi saat Simpan | Server validation | Gunakan snapshot/versi terbaru; tidak boleh commit diam-diam | “Item {item_name} baru saja ditambahkan oleh {user} dari {unit}. Tinjau data terbaru sebelum melanjutkan penyimpanan.” | “Pilih total pada baris sendiri atau pertahankan sebagai penggunaan terpisah sesuai sumber input.” |
| Row version | Hidden/system | Harus versi terbaru | “Data telah diubah oleh pengguna lain. Muat data terbaru sebelum menyimpan ulang.” | “Perubahan Anda belum disimpan.” |
| Alasan hapus | Textarea | Wajib, 5–500 karakter | “Alasan penghapusan wajib diisi minimal 5 karakter.” | “Alasan akan tersimpan pada audit trail.” |
| Alasan adjustment | Textarea | Wajib, 5–500 karakter | “Alasan koreksi wajib diisi minimal 5 karakter.” | “Koreksi akan membuat transaksi adjustment baru.” |
| Billing final | System validation | Mutasi biasa dilarang | “Billing pasien telah difinalisasi. Perubahan hanya dapat dilakukan melalui proses koreksi oleh pengguna berwenang.” | — |
| Konflik concurrent | System response | HTTP `409` | “Data telah diperbarui oleh {user} pada {time}. Muat data terbaru sebelum mencoba kembali.” | — |
| Simpan gagal | System response | Tidak boleh parsial | “Catatan belum berhasil disimpan. Tidak ada perubahan stok atau billing yang diterapkan. Kode referensi: {correlation_id}.” | “Silakan coba kembali.” |

---

## 8. Data & Technical Specifications

### 8.1 Data & Business Rules

#### 8.1.1 Spesifikasi Data — Form Input CREATE/EDIT

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|:---:|---|---|---|
| `surgery_schedule_id` | Jadwal Operasi | UUID/read-only | Ya | Jadwal valid | Modul Jadwal Operasi | Context key. |
| `operation_status` | Status Operasi | Enum/read-only | Ya | `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, atau status lain dari Jadwal Operasi | Modul Jadwal Operasi | Tampil pada header; tiga status pertama editable bila billing belum final. |
| `patient_id` | Pasien | UUID/read-only | Ya | Sesuai jadwal | Pendaftaran/Jadwal | Tidak dapat diubah. |
| `encounter_id` | Episode Perawatan | UUID/read-only | Ya | Aktif/valid | Pendaftaran | Untuk billing. |
| `medical_record_number` | No. RM | Text/read-only | Ya | Sesuai pasien pada jadwal | Master Pasien | Tampil pada header form. |
| `patient_name` | Nama Pasien | Text/read-only | Ya | Sesuai pasien pada jadwal | Master Pasien | Tampil pada header form. |
| `warehouse_id` | Gudang Farmasi IBS | UUID/system | Ya | Tipe IBS dan aktif | Konfigurasi ruang/Inventory | Tidak perlu menjadi input visual pada form referensi. |
| `medicine_item_id` | Nama Obat | Search select | Kondisional | Item aktif, tersedia, tipe `MEDICINE` | Master Barang | Input pada blok Masukkan Nama Obat. Wajib saat menambah baris Obat. |
| `medicine_quantity` | Jumlah Obat | Decimal | Kondisional | > 0; scale sesuai satuan | Manual | Wajib saat menambah baris Obat. |
| `medicine_unit_id` | Satuan Obat | Read-only | Kondisional | Sesuai item terpilih | Master Barang | Autofill; tidak diketik bebas. |
| `medical_device_item_id` | Nama Alat Kesehatan | Search select | Kondisional | Item aktif, tersedia, tipe `MEDICAL_DEVICE/MATERIAL` | Master Barang | Input pada blok Masukkan Alat Kesehatan. Wajib saat menambah baris Alat Kesehatan. |
| `medical_device_quantity` | Jumlah Alat Kesehatan | Decimal | Kondisional | > 0; scale sesuai satuan | Manual | Wajib saat menambah baris Alat Kesehatan. |
| `medical_device_unit_id` | Satuan Alat Kesehatan | Read-only | Kondisional | Sesuai item terpilih | Master Barang | Autofill; tidak diketik bebas. |
| `medicine_items[]` | List Data Obat | Staged array | Kondisional | Quantity > 0; actor sama dapat ditotal; actor/unit berbeda boleh menjadi baris terpisah setelah konfirmasi | Form state | Dikirim saat Simpan; minimal salah satu dari dua list berisi item. |
| `medical_device_items[]` | List Alat Kesehatan | Staged array | Kondisional | Quantity > 0; actor sama dapat ditotal; actor/unit berbeda boleh menjadi baris terpisah setelah konfirmasi | Form state | Dikirim saat Simpan; minimal salah satu dari dua list berisi item. |
| `manufacturer_snapshot` | Pabrikan | Text/read-only | Tidak | Sesuai master saat item ditambahkan | Master Barang | Tampil pada list; bukan input manual. |
| `fornas_status_snapshot` | Fornas | Enum/read-only | Tidak | `FORNAS`, `NON-FORNAS`, atau `N/A` | Master Barang | Tampil pada list; bukan input manual. |
| `row_version` | Versi Data | Hidden integer | Saat edit/hapus | Sama dengan versi server | System | Optimistic locking. |
| `reason` | Alasan Perubahan | Textarea | Saat hapus/adjustment | 5–500 karakter | Manual | Masuk audit. |
| `idempotency_key` | Idempotency Key | Hidden UUID | Ya | Unik per logical request | Client/system | Dikirim melalui header API. |

Tombol **Tambahkan ke List** hanya mengubah staged array di frontend dan belum memengaruhi stok/billing. Tombol **Simpan** mengirim kedua list sebagai satu request logis. Item yang berhasil di-commit dianggap sebagai pemakaian aktual dan langsung memengaruhi stok serta billing. Makna input “disiapkan” oleh Farmasi IBS tanpa pemakaian aktual masih `[PERLU KONFIRMASI]`.

#### 8.1.2 Spesifikasi Data — Tampilan Daftar

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|---|---|---|---|---|
| No. | Urutan staged list | Integer | — | Dimulai dari 1 dan dihitung ulang setelah hapus. |
| Nama | `item_name_snapshot` | Text | — | List Obat hanya Obat; List Alat Kesehatan hanya Alat Kesehatan/material. |
| Pabrikan | `manufacturer_snapshot` | Text | — | `-` bila tidak tersedia pada master. |
| Fornas | `fornas_status_snapshot` | Text | — | `FORNAS`, `NON-FORNAS`, atau `-`/`N/A`. |
| Jumlah | `quantity` | Decimal | — | Mengikuti presisi satuan. |
| Unit | `unit_name_snapshot` | Text | — | Snapshot satuan item saat disimpan. |
| Informasi Input | Actor + origin + timestamp | Metadata | — | Menampilkan Ditambahkan Oleh, Unit Asal, Waktu Input, Waktu Update Terakhir, dan Diubah Oleh. |
| Aksi | Permission + state | Ikon | — | Edit dan Hapus pada baris list. |

Informasi Input wajib terlihat transparan pada setiap baris. Status posting, versi teknis, correlation ID, serta audit before/after tetap tersedia pada detail audit dan tidak harus menjadi kolom utama.

#### 8.1.3 Data — System Managed

| Field | Aturan |
|---|---|
| `status` | Default internal `PROCESSING`, menjadi `COMMITTED` hanya setelah unit kerja berhasil. Bukan input user. |
| `row_version` | Default 1 dan bertambah pada setiap perubahan yang berhasil. |
| `created_by`, `updated_by` | Diambil dari authenticated principal, bukan request body bebas. |
| `origin_unit_id` | Diambil dari active user context/assignment. |
| `inventory_posting_id` | Referensi hasil posting inventory. |
| `billing_line_id` | Referensi komponen billing. |
| `correlation_id` | Dibuat per request untuk observability lintas modul. |
| `price_snapshot` | Harga yang digunakan saat billing, tidak dihitung ulang saat hanya membaca histori. |
| `usage_time` | Diisi sistem saat Simpan/commit karena tidak menjadi input pada form referensi. |
| `deleted_at`, `deleted_by` | Diisi ketika soft delete berhasil bersama reversal. |

#### 8.1.4 Business Rules

1. Satu header catatan mewakili satu jadwal/episode operasi; item di bawahnya disimpan independen.
2. Insert item tidak boleh mengganti koleksi item secara keseluruhan.
3. User biasa hanya boleh memutasi data ketika status operasi `CONFIRMED`, `IN_PROGRESS`, atau `COMPLETED` dan billing belum final. `COMPLETED` tidak menjadi lock tersendiri.
4. Item tambahan hanya berasal dari gudang Farmasi IBS aktif.
5. Setiap item `COMMITTED` wajib mempunyai posting stok keluar, mutasi stok, dan komponen billing aktif yang unik.
6. Create, edit, delete, dan adjustment wajib idempotent.
7. Edit kuantitas menggunakan delta. Ganti item menggunakan reversal dan posting baru.
8. Hapus sebelum finalisasi adalah soft delete setelah stok serta billing dibalik.
9. Setelah finalisasi, koreksi membuat adjustment; histori asli tidak boleh ditimpa.
10. Item yang sama dari actor yang sama pada staged list wajib meminta konfirmasi dan dapat ditotal dengan formula `total_quantity = existing_quantity + added_quantity`.
11. Item yang sama dari actor/user atau unit berbeda wajib menampilkan informasi asal pencatatan dan, bila dilanjutkan, disimpan sebagai baris independen karena dapat merepresentasikan penggunaan berbeda.
12. Seluruh validasi penting dilakukan di backend pada saat commit.
13. Audit trail bersifat append-only.
14. Hasil response timeout boleh direkonsiliasi memakai idempotency key; user tidak boleh membuat request logis baru hanya karena respons pertama tidak diterima.
15. Pemilihan lot/expired date mengikuti aturan inventory Farmasi IBS yang berlaku; apakah FEFO otomatis atau lot manual masih `[PERLU KONFIRMASI]`.
16. Harga billing, pembulatan, pajak, dan kelas tarif mengikuti modul Billing dan perlu dipastikan sebagai kontrak integrasi.
17. Dua screenshot referensi adalah satu form kontinu; implementasi tidak boleh memecah Obat dan Alat Kesehatan menjadi tab/halaman terpisah.
18. Tambahkan ke List hanya mengubah staged list dan tidak mem-posting stok/billing.
19. Satuan, Pabrikan, dan Fornas diturunkan dari master item serta disimpan sebagai snapshot; user tidak menginput nilai tersebut secara bebas.
20. Simpan memproses staged List Data Obat dan List Alat Kesehatan dalam satu request logis, dengan idempotensi dan konsistensi per item tetap berlaku.
21. Simpan wajib mengulang validasi duplikat menggunakan state server terbaru untuk menangkap input bersamaan/miss komunikasi IBS dan Farmasi IBS.
22. Duplikat yang baru ditemukan saat Simpan tidak boleh otomatis digabung atau dibuat baris baru tanpa konfirmasi user; respons wajib membawa actor, unit, timestamp, dan versi terbaru.

### 8.2 Recommended Database Structure — English

#### `surgical_usage_records`

| Column | Type | Constraint/Index | Description |
|---|---|---|---|
| `id` | UUID | PK | Usage header ID. |
| `surgery_schedule_id` | UUID | UNIQUE, NOT NULL | One record per surgery schedule. |
| `patient_id` | UUID | INDEX, NOT NULL | Patient reference. |
| `encounter_id` | UUID | INDEX, NOT NULL | Encounter/billing reference. |
| `room_id` | UUID | NULL | IBS room snapshot reference. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Header creation time. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Header update time. |

#### `surgical_usage_items`

| Column | Type | Constraint/Index | Description |
|---|---|---|---|
| `id` | UUID | PK | Independent usage item ID. |
| `usage_record_id` | UUID | FK, INDEX, NOT NULL | Parent header. |
| `warehouse_id` | UUID | INDEX, NOT NULL | Active IBS Pharmacy warehouse. |
| `item_id` | UUID | INDEX, NOT NULL | Pharmacy item reference. |
| `item_code_snapshot` | VARCHAR(100) | NOT NULL | Item code at transaction time. |
| `item_name_snapshot` | VARCHAR(255) | NOT NULL | Item name at transaction time. |
| `item_type` | VARCHAR(20) | CHECK, NOT NULL | `MEDICINE` or `MATERIAL`. |
| `manufacturer_snapshot` | VARCHAR(255) | NULL | Manufacturer label shown in the staged/saved list. |
| `fornas_status_snapshot` | VARCHAR(20) | NULL | `FORNAS`, `NON-FORNAS`, or `N/A`. |
| `quantity` | DECIMAL(18,4) | CHECK > 0, NOT NULL | Used quantity. |
| `unit_id` | UUID | NOT NULL | Unit reference. |
| `unit_name_snapshot` | VARCHAR(50) | NOT NULL | Unit label snapshot. |
| `usage_time` | TIMESTAMPTZ | INDEX, NOT NULL | Actual usage time. |
| `price_snapshot` | DECIMAL(18,2) | NULL | Billing price snapshot. |
| `status` | VARCHAR(30) | INDEX, NOT NULL | System-managed state. |
| `row_version` | BIGINT | NOT NULL DEFAULT 1 | Optimistic locking version. |
| `notes` | VARCHAR(500) | NULL | User notes. |
| `origin_unit_id` | UUID | INDEX, NOT NULL | IBS/Pharmacy IBS origin. |
| `created_by` | UUID | INDEX, NOT NULL | Creator. |
| `created_at` | TIMESTAMPTZ | INDEX, NOT NULL | Creation time. |
| `updated_by` | UUID | NOT NULL | Last updater. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update time. |
| `deleted_by` | UUID | NULL | Soft-delete actor. |
| `deleted_at` | TIMESTAMPTZ | NULL | Soft-delete time. |

Recommended indexes:

- `(usage_record_id, status, created_at DESC)` for list queries.
- `(usage_record_id, item_id, status)` for duplicate checks.
- `(warehouse_id, item_id)` for integration lookups.

#### `surgical_usage_postings`

| Column | Type | Constraint/Index | Description |
|---|---|---|---|
| `id` | UUID | PK | Posting orchestration row. |
| `usage_item_id` | UUID | FK, INDEX, NOT NULL | Usage item reference. |
| `posting_domain` | VARCHAR(20) | NOT NULL | `INVENTORY` or `BILLING`. |
| `posting_type` | VARCHAR(30) | NOT NULL | `CREATE`, `DELTA`, `REVERSAL`, `ADJUSTMENT`. |
| `posting_sequence` | INT | NOT NULL | Sequence per item/domain. |
| `external_reference_id` | VARCHAR(100) | NULL | Inventory/billing reference. |
| `status` | VARCHAR(20) | INDEX, NOT NULL | `PENDING`, `COMMITTED`, `COMPENSATED`, `FAILED`. |
| `request_payload_hash` | VARCHAR(64) | NOT NULL | Detects key reuse with different payload. |
| `correlation_id` | UUID | INDEX, NOT NULL | Trace ID. |
| `error_code` | VARCHAR(100) | NULL | Last error code. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update time. |

Unique constraint: `(usage_item_id, posting_domain, posting_type, posting_sequence)`.

#### `surgical_usage_idempotency_keys`

| Column | Type | Constraint/Index | Description |
|---|---|---|---|
| `idempotency_key` | UUID | PK | Client logical request key. |
| `actor_id` | UUID | INDEX, NOT NULL | Requesting user. |
| `operation` | VARCHAR(30) | NOT NULL | Create/update/delete/adjust. |
| `request_hash` | VARCHAR(64) | NOT NULL | Prevents key reuse with different payload. |
| `resource_id` | UUID | NULL | Result item ID. |
| `response_code` | INT | NULL | Stored response code. |
| `response_body` | JSONB | NULL | Minimal replay response. |
| `expires_at` | TIMESTAMPTZ | INDEX, NOT NULL | Retention boundary. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time. |

#### `surgical_usage_adjustments`

| Column | Type | Constraint/Index | Description |
|---|---|---|---|
| `id` | UUID | PK | Adjustment ID. |
| `usage_item_id` | UUID | FK, INDEX, NOT NULL | Original item. |
| `adjustment_type` | VARCHAR(30) | NOT NULL | Quantity/item/cancel correction. |
| `before_payload` | JSONB | NOT NULL | Original values. |
| `after_payload` | JSONB | NOT NULL | Corrected values. |
| `reason` | VARCHAR(500) | NOT NULL | Correction reason. |
| `approval_status` | VARCHAR(30) | NULL | Phase 2 readiness. |
| `role_approver` | VARCHAR(100) | NULL | Phase 2 readiness. |
| `approved_by` | UUID | NULL | Phase 2 approver. |
| `approved_at` | TIMESTAMPTZ | NULL | Phase 2 approval time. |
| `created_by` | UUID | NOT NULL | Adjustment actor/requester. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time. |

#### `surgical_usage_audit_logs`

| Column | Type | Constraint/Index | Description |
|---|---|---|---|
| `id` | UUID | PK | Audit ID. |
| `usage_record_id` | UUID | INDEX, NOT NULL | Header reference. |
| `usage_item_id` | UUID | INDEX, NULL | Item reference. |
| `action` | VARCHAR(50) | INDEX, NOT NULL | Create/update/delete/adjust/conflict/error/view. |
| `actor_id` | UUID | INDEX, NULL | Null only for system jobs. |
| `origin_unit_id` | UUID | NULL | Actor unit. |
| `before_payload` | JSONB | NULL | Sanitized before values. |
| `after_payload` | JSONB | NULL | Sanitized after values. |
| `reason` | VARCHAR(500) | NULL | Delete/adjust reason. |
| `correlation_id` | UUID | INDEX, NOT NULL | Cross-service trace. |
| `created_at` | TIMESTAMPTZ | INDEX, NOT NULL | Immutable event time. |

### 8.3 Recommended API Endpoints — English

| Method | Endpoint | Purpose | Important Behavior |
|---|---|---|---|
| `GET` | `/api/v1/surgery-schedules/{scheduleId}/usage-record` | Load header, permission, schedule state, and grouped Obat/Alat Kesehatan lists. | p95 < 1 second; may return cursors for incremental loading. |
| `GET` | `/api/v1/surgery-usage-records/{recordId}/items` | Load item list by type. | Supports `type=MEDICINE/MATERIAL` and cursor/page while UI remains one form. |
| `GET` | `/api/v1/surgery-usage-records/{recordId}/available-items` | Search active Obat or Alat Kesehatan in active IBS Pharmacy warehouse. | Returns type, unit, manufacturer, Fornas, and current stock. |
| `POST` | `/api/v1/surgery-usage-records/{recordId}/items/batch` | Save staged `medicine_items` and `medical_device_items` from the single form. | Requires one `Idempotency-Key`; validates and commits each item consistently. |
| `PATCH` | `/api/v1/surgery-usage-items/{itemId}` | Update item/delta. | Requires `If-Match` or `row_version`; `409` on stale data. |
| `DELETE` | `/api/v1/surgery-usage-items/{itemId}` | Soft delete and reverse effects. | Requires reason, version, and idempotency key. |
| `POST` | `/api/v1/surgery-usage-items/{itemId}/adjustments` | Authorized post-finalization correction. | Permission and reason required. |
| `GET` | `/api/v1/surgery-usage-items/{itemId}/audit-logs` | Load immutable audit history. | Paginated. |
| `POST` | `/api/v1/surgery-usage-records/{recordId}/duplicate-check` | Check existing active item. | Advisory; backend repeats check at commit. |

Recommended headers:

- `Idempotency-Key: <uuid>` for every mutating request.
- `If-Match: "<row_version>"` for update/delete.
- `X-Correlation-ID: <uuid>` generated by gateway/backend if absent.

Recommended response semantics:

| HTTP | Meaning |
|---:|---|
| `200/201` | Atomic logical operation committed or replayed successfully. |
| `400` | Invalid field/value. |
| `403` | User lacks permission or special adjustment authority. |
| `409` | Row-version conflict, duplicate confirmation required, or idempotency key reused with different payload. |
| `422` | Schedule state, stock, warehouse, or billing state prevents operation. |
| `503` | Dependency failure; operation is not committed. Correlation ID returned. |

### 8.4 Atomic Transaction and Integration Design

Logical write flow:

1. Authenticate user and resolve active role/unit.
2. Lock/read idempotency key. If completed, replay stored result.
3. Validate payload, schedule, operation state, billing finalization, warehouse, item, and latest stock.
4. Detect duplicate and validate user decision.
5. Create/update item in `PROCESSING` state using row version where applicable.
6. Post inventory mutation and stock history with `usage_item_id` as business reference.
7. Post/update/cancel billing line with the same business reference.
8. Mark posting records and item `COMMITTED` only when all mandatory effects succeed.
9. Commit response under idempotency key and append audit.
10. Publish a refresh event after commit; clients may refetch the changed page.

Architecture constraint:

- If Inventory, Billing, and D31 share one transactional database boundary, use one ACID transaction.
- If they are separate services/databases, a literal cross-database rollback is not guaranteed. Use synchronous reservation/confirm, transactional outbox, and deterministic compensation. The item must not be exposed as `COMMITTED` until the workflow reaches a consistent state.
- Pemilihan pola final bergantung pada service boundary aktual dan ditandai `[PERLU KONFIRMASI TEKNIS]`.

### 8.5 Concurrency Strategy

1. Collection-level concurrency: every item is an independent row; insert does not replace the parent collection.
2. Item-level concurrency: `UPDATE ... WHERE id = :id AND row_version = :expected_version`.
3. Stock concurrency: inventory must lock or atomically decrement the relevant stock balance after checking sufficient quantity.
4. Duplicate decision is advisory; unique transaction IDs and idempotency prevent double posting while allowing intentionally separate rows.
5. Frontend polling/SSE/websocket choice `[PERLU KONFIRMASI]`; Phase 1 minimally provides manual/interval refresh without clearing local unsaved form fields.

### 8.6 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | p95 open < 1s, save < 1s, stock < 2s, billing < 2s under agreed workload. |
| Capacity | At least 300 item rows per surgery episode. |
| Concurrency | At least User IBS and Farmasi IBS can submit concurrently without lost updates. |
| Consistency | No successful partial state across usage, stock, mutation history, and billing. |
| Availability | Dependency failure returns explicit non-success and correlation ID; no misleading success. |
| Security | RBAC on every endpoint; actor/unit derived from authenticated context. |
| Auditability | Append-only audit with before/after values, actor, unit, timestamp, reason, and correlation ID. |
| Privacy | Only minimum patient context shown; audit payload sanitized. |
| Observability | Metrics for latency, conflict, rollback/compensation, duplicate warning, and dependency errors. |
| Accessibility | Keyboard operable form/table, visible focus, semantic labels, and non-color-only status indicators. |
| Time | Database timestamps stored in UTC and rendered in facility timezone. |

### 8.7 Integrasi Eksternal dan Internal

| Sistem | Data Keluar dari D31 | Data Masuk ke D31 | Failure Behavior |
|---|---|---|---|
| Jadwal Operasi | Schedule ID | Patient, encounter, procedure, room, schedule/operation status | Mutation rejected; read-only/error state. |
| Master Barang Farmasi | Item query/filter | Item code/name/type/unit/status | Item cannot be selected if unavailable. |
| Inventory Farmasi IBS | Usage item ID, warehouse, item, quantity, operation type | Current stock, posting/mutation ID, result | Logical transaction cancelled/compensated. |
| Billing Pasien | Usage item ID, encounter, item, quantity, price context, operation type | Billing line ID, finalization state, result | Logical transaction cancelled/compensated. |
| IAM/RBAC | — | User, role, unit, permissions | Access denied by default. |
| Audit/Observability | Sanitized event and correlation ID | Trace/acknowledgement | Business commit must retain local audit/outbox if external sink unavailable. |

### 8.8 Risks, Assumptions, Open Questions, and Definition of Done

#### Risks & Mitigation

| Risiko/Edge Case | Mitigasi |
|---|---|
| User IBS dan Farmasi menyimpan bersamaan | Independent item rows, idempotency, optimistic locking, and refresh. |
| Dua user mengubah item sama | Conditional update by row version; one wins, one receives `409`. |
| Gangguan jaringan setelah server commit | Replay result using same idempotency key. |
| Catatan tersimpan tetapi stok gagal | Do not expose as committed; rollback or compensate and log correlation ID. |
| Stok berhasil tetapi billing gagal | Reverse/compensate stock; do not return success. |
| Browser ditutup saat simpan | Server transaction continues deterministically; reopening shows only committed records. |
| Item sama ditambahkan kembali oleh user sama | Tampilkan jumlah lama, tambahan, dan total baru; Lanjutkan & Total memperbarui baris actor tersebut. |
| Item sama diinput user/unit berbeda | Tampilkan actor, unit, waktu input/update, dan warning miss komunikasi; bila dilanjutkan buat baris independen. Validasi diulang saat Simpan. |
| Stok berubah sebelum commit | Atomic stock check/decrement at commit. |
| Billing telah final | Read-only for normal users; special adjustment flow. |
| Retry menggandakan efek | Unique business reference plus idempotency and posting constraints. |
| Lebih dari 300 item | Incremental loading/pagination internal, indexed query, compact list, dan performance test tanpa memecah form menjadi layar lain. |
| Distributed transaction tidak mendukung rollback literal | Reservation/confirm or compensation with pending state hidden from business list. |

#### Assumptions

1. Jadwal Operasi menyediakan ID unik, patient/encounter, status, ruang, dan waktu operasi.
2. Inventory menyediakan gudang Farmasi IBS, saldo terkini, mutation API/transaction, dan business reference unik.
3. Billing menyediakan status finalisasi, posting/cancel/adjust API, dan business reference unik.
4. Role IBS, Farmasi IBS, serta otorisasi khusus dikelola oleh RBAC di luar D31.
5. Satu item berhasil simpan pada Phase 1 berarti item digunakan, bukan hanya disiapkan.
6. Paket operasi standar tidak dibuat ulang sebagai item tambahan oleh D31.

#### Open Questions

1. Apakah item yang hanya “disiapkan” oleh Farmasi IBS boleh disimpan tanpa langsung mengurangi stok dan menambah billing? Jika ya, diperlukan status `PREPARED` dan transisi eksplisit ke `USED`.
2. Apakah User IBS boleh edit/hapus item yang dibuat Farmasi IBS dan sebaliknya, atau hanya boleh mengubah item dari unitnya sendiri?
3. Role/permission apa yang termasuk “otorisasi khusus” setelah billing final?
4. Apa sumber harga billing, rule kelas/tarif, pajak, pembulatan, dan snapshot price?
5. Apakah pemilihan lot dilakukan otomatis dengan FEFO atau manual oleh Farmasi IBS?
6. Apakah multi-UOM dan konversi satuan diperlukan pada Phase 1?
7. Keputusan final: status operasi `COMPLETED` tetap editable; billing `FINALIZED` menjadi lock yang mewajibkan adjustment. Apakah terdapat lock tambahan dari penutupan episode perawatan? `[PERLU KONFIRMASI]`
8. Untuk billing final, apakah adjustment mengubah invoice yang sama, membuat debit/credit note, atau mengikuti mekanisme koreksi lain?
9. Apakah notifikasi perubahan concurrent cukup dengan polling/refresh, atau wajib real-time SSE/websocket?
10. Apakah Inventory dan Billing berada dalam database/service boundary yang sama dengan D31? Jawaban menentukan implementasi atomicity.
11. Berapa retention period idempotency record, audit log, dan error log?
12. Apakah penggunaan item di masa depan atau setelah waktu operasi diperbolehkan dan berapa toleransi waktunya?

#### Definition of Done

1. Seluruh FR P0 dan acceptance criteria Phase 1 lulus UAT.
2. Test concurrent create membuktikan tidak ada lost update.
3. Test concurrent update membuktikan stale write menerima `409`.
4. Failure injection pada penyimpanan, stok, mutasi, dan billing tidak menghasilkan state berhasil parsial.
5. Idempotency test membuktikan retry tidak menggandakan stok atau billing.
6. Create, edit delta, delete reversal, dan authorized adjustment dapat direkonsiliasi end-to-end.
7. Performance test 300 item memenuhi target yang disepakati.
8. RBAC dan read-only state lulus security/negative test.
9. Audit trail lengkap, immutable dari aplikasi, dan dapat ditelusuri dengan correlation ID.
10. Open question yang mengubah kontrak stok, billing, dan otorisasi telah diputuskan sebelum production release.

### 8.9 Ticket Traceability Matrix

| Requirement Ticket | Implementasi PRD |
|---|---|
| Input oleh IBS dan Farmasi IBS | FR-003, role matrix |
| Multi-user tanpa overwrite | FR-006, Bagian 8.5 |
| Stok dan mutasi real-time | FR-008, Bagian 8.4 |
| Billing tanpa duplikasi/kehilangan | FR-009, FR-012 |
| Audit user/unit/waktu | FR-011 |
| Editable pada Terkonfirmasi, Sedang Berlangsung, dan Selesai | FR-001 |
| Alert kontekstual | Bagian 7.2 |
| Form < 1 detik | Goals, FR-002, FR-013 |
| Simpan < 1 detik; stok/billing < 2 detik | Goals, FR-013, NFR |
| Lebih dari 300 item | FR-002, FR-013 |
| Item dari gudang aktif | FR-003, FR-008 |
| Hapus mengembalikan stok/billing | FR-005 |
| Pasca finalisasi perlu otorisasi khusus | FR-010 |
| Duplikat user sama ditotal; duplikat lintas user/unit menjadi baris terpisah setelah konfirmasi | FR-007 |
| Idempotent processing | FR-012 |
| Atomic rollback | FR-012, Bagian 8.4 |

---

## 9. Workflow / BPMN Interpretation

### 9.1 Membuka Catatan Pemakaian

1. User memilih pasien dari daftar jadwal operasi.
2. Sistem mengambil identitas pasien, encounter, jadwal, ruang, status operasi, status billing, dan permission user.
3. Sistem membuka satu form kontinu berisi header pasien, input/list Obat, input/list Alat Kesehatan, dan action Kembali/Simpan.
4. Jika status operasi bukan `CONFIRMED`, `IN_PROGRESS`, atau `COMPLETED`, form berada dalam mode read-only dan menampilkan wording kontekstual.
5. Pada ketiga status tersebut form dapat diedit selama billing belum final. Jika billing final, user biasa read-only dan user khusus mendapat aksi adjustment.

### 9.2 Menambah Item — Happy Path

1. User memilih Nama Obat, mengisi Jumlah, melihat Satuan terisi otomatis, lalu klik Tambahkan ke List.
2. Sistem menambahkan item ke List Data Obat dan menampilkan Nama, Pabrikan, Fornas, Jumlah, Unit, user, unit asal, waktu input/update, dan updater.
3. Pada form yang sama, user memilih Nama Alat Kesehatan, mengisi Jumlah, melihat Satuan terisi otomatis, lalu klik Tambahkan ke List.
4. Sistem menambahkan item ke List Alat Kesehatan. User dapat Edit/Hapus baris pada kedua list sebelum Simpan.
5. Sistem mengecek duplikasi saat Tambahkan ke List.
6. Jika item sama berasal dari actor yang sama, form menampilkan jumlah lama, tambahan, dan total; Lanjutkan & Total memperbarui baris actor tersebut.
7. Jika item sama berasal dari user/unit berbeda, form menampilkan sumber pencatatan dan warning miss komunikasi; bila dilanjutkan dibuat baris terpisah.
8. User klik Simpan; client mengirim kedua staged list dengan satu idempotency key request logis.
9. Backend membaca state terbaru dan mengulang validasi duplikat, status jadwal, billing, gudang, item, stok, permission, dan versi data.
10. Duplikat baru akibat input bersamaan menghasilkan respons konfirmasi/konflik beserta actor, unit, timestamp, dan versi terbaru; tidak di-commit diam-diam.
11. Setelah hasil duplikat ditinjau user, backend menyimpan setiap item dan melakukan posting stok, mutasi, serta billing sebagai unit kerja logis.
12. Semua berhasil: item menjadi `COMMITTED`, audit dicatat, dan response dikembalikan.
13. Form menampilkan konfirmasi berhasil tanpa mengganti data item milik user lain.

### 9.3 Menambah Item — Dependency Gagal

1. Salah satu proses penyimpanan, inventory, mutasi, atau billing gagal.
2. Sistem melakukan rollback dalam satu transaction boundary atau kompensasi deterministik bila lintas service.
3. Item tidak tampil sebagai `COMMITTED`.
4. User menerima pesan gagal dengan correlation ID.
5. Retry memakai idempotency key yang sama sehingga tidak menggandakan efek yang mungkin sudah sempat diproses.

### 9.4 Concurrent Create

1. User IBS dan Farmasi IBS membuka episode operasi yang sama.
2. Keduanya menambah item secara bersamaan dengan idempotency key berbeda.
3. Backend membuat baris item independen; tidak ada replace atas koleksi.
4. Kedua transaksi yang valid commit secara independen.
5. Client melakukan refresh ringan dan menampilkan kedua item beserta asal user/unit.

### 9.5 Concurrent Update pada Item Sama

1. Dua user membuka item dengan `row_version = 3`.
2. User pertama menyimpan; backend mengubah data dan menaikkan versi menjadi 4.
3. User kedua mengirim versi 3; conditional update tidak menemukan baris yang cocok.
4. Backend mengembalikan `409 Conflict` dan versi terbaru.
5. Frontend tidak menimpa data, menampilkan pesan konflik, dan menawarkan muat ulang.

### 9.6 Hapus sebelum Finalisasi

1. User memilih hapus dan mengisi alasan.
2. Sistem memvalidasi permission, row version, jadwal, operasi, dan billing.
3. Sistem mengembalikan stok, mencatat mutasi reversal, dan membatalkan komponen billing.
4. Jika semua berhasil, item menjadi `DELETED` dan audit dicatat.
5. Jika salah satu gagal, semua dampak dibatalkan/dikompensasi dan item tetap `COMMITTED`.

### 9.7 Adjustment setelah Billing Final

1. User biasa hanya dapat melihat data.
2. User dengan otorisasi khusus memilih adjustment dan mengisi jenis serta alasan koreksi.
3. Sistem membuat record adjustment, bukan menimpa histori item lama.
4. Sistem memproses dampak kompensasi stok dan mekanisme koreksi billing.
5. Setelah berhasil, status item/adjustment dan audit diperbarui.
6. Pada Phase 2, adjustment dapat melewati maker-checker sebelum dampak diterapkan.
