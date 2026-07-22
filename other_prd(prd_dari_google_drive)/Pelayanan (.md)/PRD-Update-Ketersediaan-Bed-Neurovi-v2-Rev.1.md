# PRD — Update Ketersediaan Bed

**Related Document:** PRD TPPRI ; PRD Bed Management ; PRD Admission Rawat Inap; PRD Informasi Ketersediaan Bed; PRD Master Data Bed — hard dependency; Referensi UI Neurovi v1 — `image(15).png`, `image(16).png`, dan lampiran validasi status bed  
**Dokumen ID:** PRD-P-UPDATE-BED-v2.0 · **Versi:** 1.4 (Draft — Revisi otomatisasi status bed pasca-okupansi)  
**Tanggal Disusun:** 20 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]`  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Fitur **Update Ketersediaan Bed** digunakan oleh petugas yang berwenang untuk memantau layout bed berdasarkan bangsal dan ruang, memperbarui kondisi operasional satu atau beberapa bed sekaligus, serta mengalokasikan Bed Extra yang telah dibuat pada **Master Data Bed** ke bangsal dan ruang tertentu. Fitur ini tidak membuat nomor Bed Extra baru. Pengembalian, perpindahan master, penonaktifan, dan penghapusan Bed Extra dilakukan melalui **Master Data Bed**. Informasi pada fitur ini menjadi salah satu sumber utama bagi proses admission rawat inap, TPPRI, Bed Management, perpindahan pasien, dan tampilan Informasi Ketersediaan Bed.

Pada Neurovi v1, pengguna memilih bangsal, menampilkan daftar ruang dan bed, memilih bed yang akan diperbarui, memilih aksi **Tersedia**, **Dibersihkan**, atau **Rusak**, kemudian menyimpan perubahan. Pengguna dapat menambahkan Bed Extra dari halaman Update Informasi Bed, sedangkan pengembalian dan penghapusan Bed Extra dilakukan melalui fitur Master Data Bed. Sistem juga menampilkan sisa Bed Extra yang tersedia. Setiap kondisi bed dibedakan melalui indikator warna.

Neurovi v2 mempertahankan proses bisnis dan aturan utama V1 untuk update status operasional. Khusus Bed Extra, pembuatan nomor dan pengelolaan master dilakukan pada **Master Data Bed**, sedangkan fitur ini hanya memilih Bed Extra dengan status master **Tersedia** dan mengalokasikannya ke bangsal serta ruang tertentu. Setelah pasien selesai menempati bed karena pulang atau pindah bed, sistem otomatis mengubah bed menjadi **Dibersihkan** selama 30 menit dan kemudian menjadi **Tersedia** kembali. Mekanisme ini berlaku untuk bed reguler maupun Bed Extra. Fokus peningkatan lainnya adalah mendukung pemilihan banyak bed untuk satu aksi perubahan status operasional serta menampilkan **Nomor Rekam Medis (No. RM)** dan **nama pasien** secara langsung pada visualisasi bed yang sedang ditempati maupun telah dibooking. Data historis pasien yang pernah menempati Bed Extra harus tetap mempertahankan nomor bed, bangsal, dan ruang pada saat pelayanan, meskipun Bed Extra kemudian dipindahkan atau dinonaktifkan pada master.

> Referensi: Main Goals, Feature Capabilities, Performance Expectation, Scope, Expected Improvement From V1, serta lampiran UI Neurovi v1 yang diberikan oleh user.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — berdasarkan lampiran UI V1:
- Pengguna membuka menu **Pendaftaran > Update Informasi Bed**.
- Pengguna memilih nama bangsal dan menjalankan pencarian.
- Sistem menampilkan layout bed yang dikelompokkan berdasarkan ruang.
- Pengguna dapat memilih aksi **Tersedia**, **Dibersihkan**, atau **Rusak**, lalu menyimpan perubahan.
- Pengguna dapat menambahkan Bed Extra pada masing-masing ruang.
- Sistem menampilkan total sisa Bed Extra.
- Sistem membedakan kondisi bed melalui indikator warna: Bed Tersedia, Bed Laki-laki, Bed Perempuan, Bed Rusak, Extra Bed, Dibersihkan, dan Dipesan.
- Informasi identitas pasien yang menempati atau membooking bed belum ditampilkan secara lengkap langsung pada visualisasi bed.

**Masalah/pain point:**
- **Aspek bisnis proses:** petugas masih perlu membuka transaksi atau sumber informasi lain untuk memastikan pasien yang menempati atau membooking suatu bed.
- **Aspek UX:** indikator warna belum cukup untuk menjelaskan identitas pasien pada bed yang ditempati maupun dipesan.
- **Aspek logic system:** status bed harus tetap konsisten dengan transaksi terbaru dari TPPRI, Bed Management, dan Rawat Inap agar tidak terjadi penempatan pasien pada bed yang keliru.

**Dampak utama yang disasar v2:**
- Meningkatkan akurasi dan kecepatan pengambilan keputusan penempatan pasien.
- Mengurangi pengecekan manual dan potensi miskomunikasi antara TPPRI, petugas admission, perawat bangsal, dan pengelola bed.
- Menjaga konsistensi ketersediaan bed pada seluruh modul konsumen.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = mempertahankan kapabilitas V1, mendukung multiple select dengan mekanisme penyimpanan batch atomik, menampilkan identitas pasien pada bed terisi dan bed booking, menjalankan transisi otomatis **Terisi → Dibersihkan selama 30 menit → Tersedia** setelah okupansi pasien berakhir, mengalokasikan satu Bed Extra berstatus **Tersedia** dari Master Data Bed per aksi, menerima sinkronisasi perpindahan/penonaktifan/penghapusan Bed Extra dari Master Data Bed, menjaga histori okupansi Bed Extra, serta memastikan sinkronisasi status antarmodul.
- Pengembangan fase lanjutan belum ditetapkan. 

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Pemilihan bangsal/unit rawat inap** — pengguna memilih bangsal yang bersumber dari **Master Unit** untuk menampilkan layout ruang dan bed.
2. **Visualisasi layout bed** — sistem menampilkan bed yang dikelompokkan berdasarkan ruang pada bangsal/unit terpilih.
3. **Monitoring status bed** — sistem menampilkan kondisi terkini setiap bed beserta indikator visualnya.
4. **Pemilihan banyak bed** — pengguna dapat memilih satu atau beberapa bed sekaligus untuk menerima aksi perubahan status operasional yang sama.
5. **Perubahan status operasional bed** — pengguna dapat memperbarui status bed menjadi **Tersedia**, **Dibersihkan**, atau **Rusak** sesuai matriks transisi dan validasi V1.
6. **Penyimpanan perubahan status** — sistem memvalidasi seluruh bed terpilih sebelum menyimpan perubahan.
7. **Alokasi Bed Extra** — pengguna dapat mengalokasikan **satu Bed Extra per aksi** ke bangsal dan ruang tertentu dengan memilih nomor Bed Extra yang telah dibuat pada **Master Data Bed** dan masih berstatus **Tersedia**.
8. **Sinkronisasi lifecycle Bed Extra** — sistem menerima dan menampilkan hasil perpindahan, pengembalian, penonaktifan, atau penghapusan Bed Extra yang dilakukan melalui fitur **Master Data Bed**.
9. **Monitoring Bed Extra tersedia** — sistem menampilkan jumlah Bed Extra berstatus **Tersedia** pada Master Data Bed yang masih dapat dialokasikan dan memperbaruinya setelah alokasi pada fitur ini maupun perubahan dari Master Data Bed.
10. **Informasi pasien pada bed terisi** — sistem menampilkan No. RM dan nama pasien yang sedang menempati bed.
11. **Informasi pasien pada bed booking** — sistem menampilkan No. RM, nama pasien, dan indikator **Booking/Dipesan**.
12. **Display Bed Extra terisi** — apabila Bed Extra ditempati pasien, indikator utama/legend mengikuti jenis kelamin pasien, sedangkan identitasnya sebagai **Bed Extra** tetap ditampilkan melalui badge/label.
13. **Integrasi internal** — perubahan status dan transaksi penggunaan bed disinkronkan dengan TPPRI, Bed Management, Rawat Inap, Master Data Bed, dan Informasi Ketersediaan Bed.
14. **Audit perubahan** — sistem mencatat pengguna dan waktu perubahan status serta alokasi Bed Extra yang dilakukan pada fitur ini.
15. **Integritas histori Bed Extra** — sistem mempertahankan snapshot nomor Bed Extra, bangsal, dan ruang pada transaksi pasien saat bed ditempati; perubahan lokasi atau status aktif Bed Extra pada Master Data Bed tidak boleh mengubah data historis pelayanan sebelumnya.
16. **Otomatisasi status bed pasca-okupansi** — ketika pasien pulang atau pindah dari suatu bed, sistem otomatis mengubah bed tersebut menjadi **Dibersihkan** selama 30 menit. Setelah periode berakhir, sistem otomatis mengubahnya menjadi **Tersedia** apabila tidak terdapat kondisi baru yang membuat bed tetap tidak dapat digunakan.

### Out Scope

- Pengelolaan data bangsal sebagai master terpisah; data bangsal tersedia pada **Master Unit**.
- Master Data Ruang.
- Pembuatan nomor dan pengelolaan master bed permanen maupun Bed Extra, termasuk perubahan atribut, perpindahan, penonaktifan, pengembalian, dan penghapusan; seluruh proses tersebut dilakukan melalui fitur **Master Data Bed**. Fitur ini hanya menggunakan lookup Bed Extra berstatus **Tersedia** untuk kebutuhan alokasi.
- Proses admission Rawat Inap.
- Proses booking bed.
- Proses ganti atau pindah bed pasien; proses transaksinya berada di modul sumber, sedangkan event penutupan okupansinya dikonsumsi untuk memulai timer pembersihan.
- Proses pemulangan pasien; proses transaksinya berada di modul sumber, sedangkan event penutupan okupansinya dikonsumsi untuk memulai timer pembersihan.
- Pembatalan booking bed.
- Billing Rawat Inap.

## 4. Goals and Metrics

### Tujuan

Menyediakan informasi kondisi bed yang akurat dan mudah dipahami secara real-time, sehingga petugas dapat mengelola operasional bed, mengetahui pasien yang menempati atau membooking bed, serta memastikan bed yang baru selesai digunakan menjalani periode pembersihan 30 menit sebelum tersedia kembali untuk penempatan pasien berikutnya.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Konsistensi status bed antarmodul | 100% perubahan yang berhasil disimpan menampilkan status yang sama pada modul konsumen | Goal user; NFR-004 |
| Akurasi identitas pasien pada bed terisi/booking | 100% sesuai transaksi aktif terbaru | Expected Improvement From V1; NFR-005 |
| Perubahan tanpa umpan balik | 0 perubahan gagal yang tidak disertai pesan kesalahan | Performance Expectation; NFR-006 |
| Waktu respons penyimpanan status | `[PERLU KONFIRMASI target p95]` | NFR-001 |
| Latensi propagasi perubahan status | `[PERLU KONFIRMASI target real-time dalam detik]` | Performance Expectation; NFR-002 |
| Waktu muat layout per bangsal | `[PERLU KONFIRMASI target p95 dan volume maksimum bed]` | NFR-003 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Modul |
|-------|-----------------------|
| **Master Unit** | Menyediakan data bangsal/unit rawat inap pada fitur ini. |
| **Master Data Bed** | Membuat dan memelihara nomor Bed Extra, status master **Tersedia/Nonaktif**, serta proses perpindahan, pengembalian, penonaktifan, dan penghapusan. Fitur ini menggunakan daftar Bed Extra berstatus **Tersedia** sebagai sumber alokasi. |
| **TPPRI** | Konsumen informasi ketersediaan bed dan sumber transaksi penempatan/booking sesuai proses admission. |
| **Bed Management** | Sumber atau pengelola transaksi booking dan monitoring okupansi bed. |
| **Rawat Inap** | Sumber kondisi pasien yang sedang menempati bed, event perpindahan/pemulangan yang memicu proses pembersihan otomatis selama 30 menit, serta penyimpan snapshot Bed Extra, bangsal, dan ruang pada histori pelayanan pasien. |
| **Informasi Ketersediaan Bed** | Konsumen status terkini bed untuk kebutuhan monitoring/display. |
| **Manajemen Pengguna & Hak Akses** | Menentukan pengguna yang boleh melihat dan mengubah status bed. |
| **Audit Trail** | Menyimpan riwayat perubahan status dan alokasi Bed Extra yang dilakukan pada fitur ini, termasuk nilai sumber dan tujuan alokasi. |

Dependency lintas modul: **Master Unit**, **Master Data Bed**, **TPPRI**, **Bed Management**, **Rawat Inap**, **Informasi Ketersediaan Bed**, dan **Manajemen Hak Akses**.

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Petugas TPPRI/Admission | Primary | Memantau ketersediaan dan memastikan bed siap digunakan untuk proses admission. |
| Perawat/Petugas Bangsal | Primary | Memperbarui kondisi operasional satu atau beberapa bed sesuai kondisi di ruang perawatan. |
| Petugas Bed Management | Primary | Memantau okupansi, booking, distribusi bed, dan mengalokasikan Bed Extra berstatus Tersedia dari Master Data Bed ke bangsal/ruang sesuai kewenangan. |
| Koordinator Pelayanan/Manajemen | Secondary | Memantau kondisi bed dan okupansi untuk koordinasi operasional. |
| Administrator Sistem | Tersier | Mengelola hak akses dan menelusuri audit perubahan. |

> Daftar role final dan matriks kewenangan perlu diselaraskan dengan konfigurasi rumah sakit. `[PERLU KONFIRMASI]`

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. Pengguna membuka menu **Pendaftaran > Update Informasi Bed**.
2. Pengguna memilih nama bangsal.
3. Pengguna menekan tombol **Cari**.
4. Sistem menampilkan ruang beserta daftar bed pada bangsal terpilih.
5. Sistem menampilkan kondisi bed dengan indikator warna.
6. Pengguna memilih satu atau beberapa bed yang akan diperbarui.
7. Pengguna memilih aksi **Tersedia**, **Dibersihkan**, atau **Rusak**.
8. Pengguna menekan tombol **Simpan**.
9. Sistem memvalidasi transisi status. Perubahan yang tidak sesuai aturan V1 ditolak dan sistem menampilkan pesan validasi.
10. Apabila valid, sistem menyimpan perubahan dan memperbarui tampilan.
11. Apabila membutuhkan bed tambahan, pengguna menekan **Tambah Bed Extra** pada ruang terkait; satu klik menambahkan satu Bed Extra mengikuti mekanisme V1.
12. Pengembalian dan penghapusan Bed Extra dilakukan melalui fitur **Master Data Bed** sesuai mekanisme V1.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. Pengguna membuka fitur **Update Ketersediaan Bed**.
2. Pengguna memilih bangsal/unit rawat inap yang datanya bersumber dari **Master Unit**, kemudian menjalankan pencarian.
3. Sistem mengambil struktur ruang dan bed serta kondisi penggunaan bed dari transaksi terbaru.
4. Sistem menampilkan layout bed per ruang, indikator status, legenda, dan jumlah Bed Extra berstatus **Tersedia** yang dapat dialokasikan.
5. Untuk bed yang sedang ditempati, sistem menampilkan No. RM dan nama pasien langsung pada kartu/visualisasi bed.
6. Untuk bed yang telah dibooking tetapi pasien belum masuk rawat inap, sistem menampilkan No. RM, nama pasien, dan indikator **Booking/Dipesan**.
7. Pengguna memilih satu atau beberapa bed yang akan menerima perubahan status operasional yang sama.
8. Pengguna memilih aksi **Tersedia**, **Dibersihkan**, atau **Rusak**, kemudian menekan **Simpan**.
9. Sistem memvalidasi seluruh bed terpilih terhadap status terkini dan matriks transisi V1 sebagai satu batch atomik.
10. Sistem menolak perubahan apabila:
    - bed sedang ditempati dan akan diubah menjadi **Tersedia**;
    - bed sedang ditempati dan akan diubah menjadi **Dibersihkan**;
    - bed sedang ditempati dan akan diubah menjadi **Rusak**; atau
    - bed berstatus **Rusak** dan akan diubah menjadi **Dibersihkan**.
11. Jika seluruh bed valid, sistem menyimpan seluruh perubahan dalam satu transaksi, mencatat audit trail, dan memperbarui seluruh modul konsumen.
12. Jika minimal satu bed tidak valid, sistem menolak **seluruh batch**; tidak ada status bed terpilih yang berubah.
13. Pengguna menekan **Tambah Bed Extra** pada bangsal dan ruang tujuan.
14. Sistem mengambil daftar nomor Bed Extra dari Master Data Bed dengan jenis **Extra Bed** dan status master **Tersedia**.
15. Pengguna memilih satu nomor Bed Extra; sistem memvalidasi ulang statusnya saat penyimpanan dan mengalokasikannya ke bangsal serta ruang tujuan tanpa membuat data master baru.
16. Perpindahan, pengembalian, penonaktifan, dan penghapusan Bed Extra dilakukan melalui fitur **Master Data Bed**; fitur Update Ketersediaan Bed menerima hasil perubahan dan memperbarui layout serta jumlah Bed Extra yang masih tersedia.
17. Apabila Bed Extra sedang ditempati, tampilan utama mengikuti gender pasien dan tetap menampilkan penanda **Bed Extra**.
18. Ketika Bed Extra dipindahkan ke ruang lain atau dinonaktifkan, sistem hanya mengubah kondisi aktif/terkini. Snapshot nomor Bed Extra, bangsal, dan ruang pada histori pasien yang pernah menempatinya tidak berubah.
19. Ketika okupansi pasien pada bed berakhir karena pasien pulang atau pindah bed, sistem otomatis mengubah bed lama menjadi **Dibersihkan** dan mencatat waktu mulai serta waktu selesai pembersihan.
20. Bed tetap berstatus **Dibersihkan** selama 30 menit dan tidak dianggap tersedia untuk penempatan pasien baru.
21. Setelah 30 menit, sistem otomatis mengubah status menjadi **Tersedia** apabila bed masih berstatus Dibersihkan, tidak sedang ditempati, dan tidak berubah menjadi Rusak atau kondisi lain yang lebih baru.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Sumber data bangsal | Mengikuti implementasi V1 | Bersumber dari **Master Unit** |
| Pemilihan bed | Mendukung pemilihan bed pada layout | Ditegaskan mendukung **multiple select bed** untuk satu aksi status |
| Penyimpanan multiple select | Mengikuti validasi V1 | Bersifat atomik: apabila satu bed tidak valid, seluruh batch ditolak |
| Proses perubahan status | Pilih bed, pilih aksi, simpan | Tetap mengikuti V1 dengan matriks validasi yang ditegaskan |
| Informasi bed terisi | Status dibedakan melalui indikator bed laki-laki/perempuan | Menampilkan indikator status, No. RM, dan nama pasien |
| Informasi bed booking | Menampilkan indikator dipesan | Menampilkan indikator Booking/Dipesan, No. RM, dan nama pasien |
| Bed Extra terisi | Mengikuti V1 | Legend/warna utama mengikuti gender pasien; badge Bed Extra tetap terlihat |
| Lifecycle Bed Extra | Tambah Bed Extra pada Update Informasi Bed; pengembalian/penghapusan melalui Master Data Bed | Pembuatan nomor dan lifecycle master dilakukan di Master Data Bed; fitur ini hanya mengalokasikan satu Bed Extra berstatus Tersedia per aksi ke bangsal/ruang |
| Konsistensi data | Mengikuti mekanisme V1 | Menggunakan transaksi terbaru dan validasi konflik sebelum menyimpan |
| Histori Bed Extra | Mengikuti data transaksi V1 | Snapshot nomor bed, bangsal, dan ruang pada saat okupansi tidak berubah akibat perpindahan atau penonaktifan master di kemudian hari |
| Status setelah pasien selesai menggunakan bed | Mengikuti proses operasional yang berjalan | Sistem otomatis mengubah **Terisi → Dibersihkan selama 30 menit → Tersedia**, berlaku untuk bed reguler dan Bed Extra |

## 7. Main Flow / Mindmap

### Skenario 1 — Menampilkan layout dan status bed

1. Pengguna membuka fitur **Update Ketersediaan Bed**.
2. Sistem menampilkan field **Pilih Bangsal/Unit Rawat Inap** yang bersumber dari Master Unit.
3. Pengguna memilih unit dan menekan **Cari**.
4. Sistem menampilkan nama unit/bangsal, daftar ruang, daftar bed per ruang, jumlah Bed Extra berstatus **Tersedia**, dan legenda status.
5. Setiap bed menampilkan nomor bed serta indikator kondisi terbaru.
6. Bed yang terisi atau dibooking juga menampilkan identitas pasien sesuai aturan display.

### Skenario 2 — Mengubah status operasional beberapa bed sekaligus

1. Pengguna memilih satu atau beberapa bed pada layout.
2. Sistem menandai seluruh bed yang dipilih.
3. Pengguna memilih satu aksi status operasional: **Tersedia**, **Dibersihkan**, atau **Rusak**.
4. Pengguna menekan **Simpan**.
5. Sistem mengambil ulang kondisi terbaru setiap bed terpilih dan memvalidasi matriks transisinya.
6. Jika seluruh perubahan valid, sistem menyimpan seluruh perubahan dalam satu transaksi dan memperbarui tampilan serta modul konsumen.
7. Jika minimal satu bed tidak valid, sistem menolak **seluruh batch**; tidak ada bed terpilih yang diperbarui.
8. Sistem menampilkan alasan penolakan, termasuk nomor bed yang tidak valid dan status tujuan yang ditolak.

### Skenario 3 — Validasi bed sedang ditempati

1. Pengguna memilih bed yang sedang ditempati pasien.
2. Pengguna memilih status tujuan **Tersedia**, **Dibersihkan**, atau **Rusak**.
3. Pengguna menekan **Simpan**.
4. Sistem menolak perubahan.
5. Sistem menampilkan pesan sesuai status tujuan:
   - **Tersedia:** “Bed yang sedang ditempati tidak bisa diubah menjadi Bed Tersedia.”
   - **Dibersihkan:** “Bed yang sedang ditempati tidak bisa diubah menjadi Bed Dibersihkan.”
   - **Rusak:** “Bed yang sedang ditempati tidak bisa diubah menjadi Bed Rusak.”
6. Status bed dan transaksi pasien tidak berubah.
7. Jika bed yang sedang ditempati merupakan bagian dari multiple select, seluruh batch ditolak.

### Skenario 4 — Validasi Bed Rusak menjadi Dibersihkan

1. Pengguna memilih bed dengan status **Rusak**.
2. Pengguna memilih status tujuan **Dibersihkan**.
3. Pengguna menekan **Simpan**.
4. Sistem menolak perubahan dan menampilkan modal peringatan dengan pesan: **“Bed Yang Sedang Rusak Tidak Bisa Diubah Menjadi Bed Dibersihkan”**.
5. Modal menyediakan tombol **OK** untuk menutup pesan.
6. Status bed tetap **Rusak** dan tidak ada perubahan data yang disimpan.
7. Apabila bed Rusak tersebut merupakan bagian dari multiple select, sistem menolak seluruh batch.

### Skenario 5 — Mengalokasikan Bed Extra dari Master Data Bed

1. Pengguna melihat jumlah Bed Extra yang masih berstatus **Tersedia** pada Master Data Bed.
2. Pengguna menekan tombol **Tambah Bed Extra** pada bangsal dan ruang yang membutuhkan bed tambahan.
3. Sistem mengambil dan menampilkan daftar nomor Bed Extra dari Master Data Bed dengan jenis **Extra Bed** dan status **Tersedia**.
4. Pengguna memilih satu nomor Bed Extra; satu aksi hanya mengalokasikan satu Bed Extra dan tidak menyediakan input jumlah.
5. Saat pengguna menyimpan, sistem memvalidasi ulang bahwa Bed Extra masih berstatus **Tersedia** dan belum dialokasikan oleh proses lain.
6. Jika valid, sistem menghubungkan Bed Extra tersebut ke bangsal dan ruang tujuan tanpa membuat nomor atau data master baru.
7. Sistem menampilkan nomor Bed Extra yang berasal dari Master Data Bed pada layout dan mengurangi jumlah Bed Extra tersedia sebanyak satu.
8. Sistem mencatat Bed Extra, bangsal, ruang, pengguna, dan waktu alokasi.
9. Jika status Bed Extra tidak lagi **Tersedia**, sistem menolak alokasi dan meminta pengguna memuat ulang daftar.

### Skenario 6 — Memindahkan, menonaktifkan, mengembalikan, atau menghapus Bed Extra melalui Master Data Bed

> Pengelolaan lifecycle master Bed Extra berada di luar fitur Update Ketersediaan Bed.

1. Pengguna membuka fitur **Master Data Bed**.
2. Pengguna memilih Bed Extra yang akan dipindahkan, dinonaktifkan, dikembalikan, atau dihapus.
3. Master Data Bed menjalankan validasi dan mekanisme sesuai aturan fitur tersebut.
4. Jika valid, Master Data Bed memperbarui status master dan/atau alokasi aktif Bed Extra.
5. Fitur Update Ketersediaan Bed menerima perubahan tersebut dan memperbarui layout serta jumlah Bed Extra berstatus Tersedia.
6. Perubahan tersebut hanya berlaku untuk kondisi aktif/terkini; data historis pasien yang pernah menempati Bed Extra tetap menyimpan nomor bed, bangsal, dan ruang pada saat pelayanan.
7. Jika tidak valid, Master Data Bed menolak proses dan menampilkan pesan sesuai aturan pada fitur tersebut.

### Skenario 7 — Menampilkan pasien yang menempati bed reguler atau Bed Extra

1. Modul Rawat Inap atau TPPRI memiliki transaksi pasien aktif pada suatu bed.
2. Sistem menandai bed sebagai terisi.
3. Sistem menampilkan No. RM dan nama pasien pada visualisasi bed.
4. Indikator visual utama mengikuti jenis kelamin pasien: biru untuk laki-laki dan merah muda untuk perempuan.
5. Jika bed tersebut merupakan Bed Extra, badge/label **Bed Extra** tetap ditampilkan walaupun legend/warna utama mengikuti gender pasien.
6. Informasi berubah otomatis ketika terjadi perpindahan bed atau pemulangan pasien melalui proses sumber.

### Skenario 8 — Menampilkan pasien yang membooking bed

1. Bed Management atau TPPRI memiliki transaksi booking aktif pada suatu bed.
2. Sistem menandai bed sebagai **Booking/Dipesan**.
3. Sistem menampilkan No. RM dan nama pasien yang melakukan booking.
4. Ketika booking dikonversi menjadi admission, dibatalkan, atau dipindahkan melalui modul sumber, tampilan bed mengikuti transaksi terbaru.

### Skenario 9 — Konflik perubahan secara bersamaan

1. Pengguna A membuka layout bed.
2. Sebelum Pengguna A menyimpan, status bed berubah melalui Pengguna B atau modul transaksi lain.
3. Pengguna A menekan **Simpan**.
4. Sistem mendeteksi bahwa kondisi bed sudah berubah.
5. Sistem menolak perubahan yang berpotensi menimpa data terbaru, menampilkan pesan konflik, dan meminta pengguna memuat ulang data.
6. Jika konflik terjadi pada salah satu bed dalam multiple select, seluruh batch ditolak.

### Skenario 10 — Menjaga histori pasien pada Bed Extra

1. Seorang pasien menempati Bed Extra pada bangsal dan ruang tertentu.
2. Sistem menyimpan snapshot minimal berupa ID Bed Extra, nomor Bed Extra, bangsal/unit, ruang, serta periode pasien menempati bed tersebut.
3. Setelah pelayanan selesai, Bed Extra dapat dipindahkan ke ruang lain atau dinonaktifkan melalui Master Data Bed.
4. Layout aktif mengikuti lokasi dan status master terbaru.
5. Riwayat pasien sebelumnya tetap menampilkan nomor Bed Extra, bangsal, dan ruang pada saat pasien dirawat.
6. Sistem tidak melakukan pembaruan retroaktif terhadap snapshot histori akibat perubahan master di kemudian hari.

### Skenario 11 — Otomatisasi status bed setelah pasien pulang atau pindah bed

1. Pasien yang sedang menempati bed dinyatakan pulang atau dipindahkan ke bed lain melalui proses Rawat Inap.
2. Sistem menutup okupansi pasien pada bed lama dan mencatat waktu berakhirnya okupansi.
3. Sistem otomatis mengubah status bed lama dari **Terisi** menjadi **Dibersihkan**.
4. Sistem menetapkan periode pembersihan selama 30 menit sejak waktu okupansi berakhir.
5. Selama periode tersebut, bed ditampilkan dengan status **Dibersihkan** dan tidak tersedia untuk penempatan pasien baru.
6. Setelah 30 menit, sistem memvalidasi kondisi terkini bed.
7. Jika bed masih berstatus **Dibersihkan**, tidak memiliki okupansi aktif, dan tidak berubah menjadi **Rusak** atau kondisi lain yang lebih baru, sistem otomatis mengubah status menjadi **Tersedia**.
8. Jika status bed telah berubah sebelum 30 menit berakhir, sistem tidak menimpa status terbaru dan membatalkan transisi otomatis menjadi Tersedia.
9. Seluruh transisi otomatis dicatat pada audit trail dengan sumber perubahan **Sistem**.
10. Mekanisme ini berlaku untuk bed reguler maupun Bed Extra.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Pengguna harus memilih bangsal/unit rawat inap sebelum sistem menampilkan layout bed. Data pilihan tersebut bersumber dari **Master Unit**. | UI V1; FR-002; US-001 |
| **BR-002** | Sistem menampilkan bed yang dikelompokkan berdasarkan ruang pada unit/bangsal terpilih. | Feature Capabilities; FR-003; US-001 |
| **BR-003** | Status operasional yang dapat dipilih manual pada fitur ini adalah **Tersedia**, **Dibersihkan**, dan **Rusak**. | Feature Capabilities; UI V1; FR-006 |
| **BR-004** | Pengguna dapat memilih satu atau beberapa bed sekaligus dan menerapkan satu status operasional yang sama pada seluruh bed terpilih. | Feedback user; FR-005; US-002 |
| **BR-005** | Status bed terisi dan booking berasal dari transaksi pelayanan terbaru, bukan diinput manual melalui daftar aksi status operasional. | Expected Improvement From V1; FR-010; FR-012 |
| **BR-006** | Bed yang sedang ditempati harus menampilkan No. RM dan nama pasien. | Expected Improvement From V1; FR-010; US-006 |
| **BR-007** | Bed yang memiliki booking aktif harus menampilkan No. RM, nama pasien, dan indikator **Booking/Dipesan**. | Expected Improvement From V1; FR-012; US-007 |
| **BR-008** | Sistem hanya boleh menampilkan satu kondisi penggunaan aktif yang berlaku untuk sebuah bed pada satu waktu. | Performance Expectation; FR-010; FR-012; FR-013 |
| **BR-009** | Perubahan status berhasil hanya setelah pengguna menekan **Simpan** dan seluruh validasi terpenuhi. | UI V1; FR-007; US-002 |
| **BR-010** | Sistem harus memvalidasi kondisi terbaru seluruh bed terpilih sebelum menyimpan untuk mencegah perubahan menimpa transaksi yang lebih baru. | Performance Expectation; FR-007; NFR-007 |
| **BR-011** | Bed yang sedang ditempati tidak dapat diubah manual menjadi **Tersedia**. Sistem menolak perubahan dan menampilkan pesan validasi. | Lampiran validasi V1; FR-007; US-003 |
| **BR-012** | Bed yang sedang ditempati tidak dapat diubah manual menjadi **Dibersihkan**. Sistem menolak perubahan dan menampilkan pesan validasi. | Lampiran validasi V1; FR-007; US-003 |
| **BR-013** | Bed yang sedang ditempati tidak dapat diubah manual menjadi **Rusak**. Sistem menolak perubahan dan menampilkan pesan validasi. | Lampiran validasi V1; FR-007; US-003 |
| **BR-014** | Bed berstatus **Rusak** tidak dapat diubah langsung menjadi **Dibersihkan**. Sistem menolak perubahan, mempertahankan status **Rusak**, dan menampilkan modal **“Bed Yang Sedang Rusak Tidak Bisa Diubah Menjadi Bed Dibersihkan”** dengan tombol **OK**. | Lampiran validasi V1; FR-007; US-003 |
| **BR-015** | Transisi operasional yang diperbolehkan adalah **Tersedia → Dibersihkan/Rusak**, **Dibersihkan → Tersedia/Rusak**, dan **Rusak → Tersedia**, sepanjang bed tidak sedang ditempati dan tidak terdapat konflik transaksi terbaru. | UI/validasi V1; FR-007 |
| **BR-016** | Bed Extra yang dapat dipilih pada fitur ini harus telah dibuat pada **Master Data Bed**, berjenis **Extra Bed**, dan memiliki status master **Tersedia**. | Feedback user; FR-008; US-004 |
| **BR-017** | Setiap aksi **Tambah Bed Extra** hanya mengalokasikan satu nomor Bed Extra yang dipilih dari Master Data Bed, tanpa field jumlah. Fitur ini tidak membuat nomor atau data master Bed Extra baru. | Feedback user; FR-008; US-004 |
| **BR-018** | Bed Extra yang dipilih harus dialokasikan ke satu bangsal/unit dan satu ruang tujuan. | Feature Capabilities; FR-008 |
| **BR-019** | Nomor dan identitas Bed Extra wajib menggunakan data dari Master Data Bed dan tidak boleh dibuat ulang atau diubah pada fitur Update Ketersediaan Bed. | Feedback user; FR-008 |
| **BR-020** | Perpindahan, pengembalian, penonaktifan, dan penghapusan Bed Extra hanya dilakukan melalui fitur **Master Data Bed**. Fitur Update Ketersediaan Bed tidak menyediakan aksi tersebut dan hanya menampilkan hasil sinkronisasinya. | Feedback user; FR-009 |
| **BR-021** | Bed Extra yang sedang ditempati menampilkan legend/warna utama berdasarkan jenis kelamin pasien, sementara badge/label **Bed Extra** tetap terlihat. | Feedback user; FR-011 |
| **BR-022** | Seluruh perubahan status dan alokasi Bed Extra harus dicatat pada audit trail, termasuk transisi otomatis pasca-okupansi. Audit minimal mencakup bed, bangsal, ruang, data sebelum, data sesudah, sumber perubahan (User/Sistem/Modul), aktor jika ada, dan waktu server. Audit perubahan master menjadi tanggung jawab Master Data Bed. | Kebutuhan operasional; FR-015; NFR-008 |
| **BR-023** | Perubahan kondisi bed yang berhasil harus diperbarui pada TPPRI dan Informasi Ketersediaan Bed. | Performance Expectation; FR-013 |
| **BR-024** | Informasi pasien pada visualisasi bed bersifat read-only dan mengikuti transaksi sumber. | Scope; FR-010; FR-012 |
| **BR-025** | Pengguna tanpa hak akses perubahan hanya dapat melihat layout dan status bed. | Scope monitoring; FR-016; NFR-009 |
| **BR-026** | Indikator warna harus disertai label, ikon, badge, atau teks agar kondisi bed tidak hanya bergantung pada warna. | Usability; FR-004; NFR-010 |
| **BR-027** | Apabila data gagal dimuat atau disimpan, sistem harus menampilkan pesan kesalahan yang jelas dan tidak menampilkan perubahan seolah-olah telah berhasil. | Performance Expectation; FR-014; NFR-006 |
| **BR-028** | Penyimpanan multiple select bersifat **all-or-nothing**. Jika minimal satu bed tidak memenuhi validasi, seluruh batch ditolak dan tidak ada bed terpilih yang diperbarui. | Feedback user; FR-007; US-002; NFR-014 |
| **BR-029** | Saat alokasi disimpan, sistem harus memvalidasi ulang bahwa Bed Extra masih berstatus **Tersedia** pada Master Data Bed. Jika status berubah atau telah dialokasikan oleh proses lain, alokasi ditolak. | Feedback user; FR-008; NFR-007 |
| **BR-030** | Data historis pasien yang pernah menempati Bed Extra harus mempertahankan snapshot nomor Bed Extra, bangsal/unit, dan ruang pada saat okupansi. Perpindahan, perubahan lokasi, penonaktifan, atau penghapusan Bed Extra pada Master Data Bed tidak boleh mengubah maupun menghilangkan histori tersebut. | Feedback user; FR-018; US-012; NFR-015 |
| **BR-031** | Ketika okupansi pasien berakhir karena pasien pulang atau pindah bed, sistem otomatis mengubah bed lama dari **Terisi** menjadi **Dibersihkan**. Transisi ini dilakukan oleh sistem dan bukan melalui aksi manual pengguna. | Feedback user; FR-019; US-013 |
| **BR-032** | Status **Dibersihkan** pasca-okupansi berlangsung selama 30 menit, dihitung menggunakan waktu server sejak okupansi pasien pada bed berakhir. | Feedback user; FR-019; NFR-016 |
| **BR-033** | Selama periode pembersihan 30 menit, bed tidak berstatus Tersedia dan tidak dapat digunakan untuk penempatan pasien baru. | Feedback user; FR-019; US-013 |
| **BR-034** | Setelah 30 menit, sistem otomatis mengubah bed menjadi **Tersedia** hanya apabila bed masih berstatus **Dibersihkan**, tidak memiliki okupansi aktif, dan tidak memiliki perubahan status yang lebih baru. | Feedback user; FR-019; NFR-016 |
| **BR-035** | Jika selama periode pembersihan bed diubah menjadi **Rusak** atau menerima kondisi baru yang valid, proses otomatis tidak boleh menimpa status terbaru menjadi Tersedia. | Integritas status; FR-019; NFR-016 |
| **BR-036** | Untuk status **Dibersihkan** yang berasal dari proses pasca-okupansi, perubahan manual menjadi **Tersedia** sebelum 30 menit berakhir tidak diperbolehkan. | Feedback user; FR-007; FR-019 |
| **BR-037** | Transisi otomatis pasca-okupansi berlaku sama untuk bed reguler dan Bed Extra serta harus dicatat pada audit trail dengan sumber perubahan **Sistem**. | Feedback user; FR-015; FR-019; NFR-008 |

## 9. State Machine & Display Rules

### 9.1 Kategori Kondisi Bed

Fitur membedakan **kondisi operasional**, **kondisi penggunaan**, dan **jenis/alokasi bed**. Kondisi penggunaan dari transaksi pasien memiliki prioritas terhadap perubahan manual status operasional.

| Kategori | State | Sumber Perubahan | Dapat Diubah di Fitur Ini | Makna |
|----------|-------|------------------|----------------------------|-------|
| Operasional | Tersedia | Aksi pengguna / proses sumber | Ya | Bed siap digunakan dan tidak memiliki okupansi aktif. |
| Operasional | Dibersihkan | Aksi pengguna / proses otomatis pasca-okupansi | Ya, dengan batasan timer pasca-okupansi | Bed belum siap digunakan karena sedang dalam proses pembersihan. Jika berasal dari okupansi yang berakhir, status berlangsung otomatis selama 30 menit. |
| Operasional | Rusak | Aksi pengguna | Ya | Bed tidak dapat digunakan karena kondisi rusak. |
| Penggunaan | Terisi | Admission/Rawat Inap | Tidak | Bed sedang ditempati pasien aktif dan status operasionalnya tidak dapat diubah melalui fitur ini. |
| Penggunaan | Booking/Dipesan | TPPRI/Bed Management | Tidak | Bed telah dipesan untuk pasien yang belum menempati bed. |
| Jenis/Alokasi | Bed Extra | Master Data Bed / alokasi pada fitur ini | Alokasi: Ya; Kelola master: Tidak | Nomor dibuat dan dikelola pada Master Data Bed. Fitur ini hanya memilih Bed Extra berstatus Tersedia dan mengalokasikannya ke bangsal/ruang. |

### 9.2 Encoding Visual Mengikuti Referensi V1

| Kondisi | Encoding Visual | Informasi Tambahan V2 |
|---------|-----------------|-----------------------|
| Bed Tersedia | Hijau | Nomor bed dan label **Tersedia**. |
| Bed terisi pasien laki-laki | Biru | Nomor bed, No. RM, dan nama pasien. |
| Bed terisi pasien perempuan | Merah muda | Nomor bed, No. RM, dan nama pasien. |
| Bed Rusak | Hitam | Nomor bed dan label **Rusak**. |
| Bed Extra tidak ditempati | Oranye | Nomor bed dan badge/label **Bed Extra**. |
| Bed Extra ditempati pasien laki-laki | Biru | No. RM, nama pasien, serta badge/label **Bed Extra**. |
| Bed Extra ditempati pasien perempuan | Merah muda | No. RM, nama pasien, serta badge/label **Bed Extra**. |
| Dibersihkan | Biru muda | Nomor bed dan label **Dibersihkan**. |
| Dipesan | Ungu | Nomor bed, badge **Booking/Dipesan**, No. RM, dan nama pasien. |

> Warna final mengikuti design system Neurovi v2. Untuk Bed Extra yang ditempati, legend utama mengikuti gender pasien, sedangkan jenis bed tetap dikenali melalui badge/label **Bed Extra**.

### 9.3 Prioritas Tampilan

1. Transaksi pasien aktif menentukan bahwa bed **Terisi** dan warna/legend utama mengikuti gender pasien.
2. Jika bed terisi merupakan Bed Extra, sistem tetap menampilkan badge/label **Bed Extra**.
3. Jika tidak terisi tetapi terdapat booking aktif, bed ditampilkan sebagai **Booking/Dipesan**.
4. Jika tidak ada transaksi penggunaan, sistem menampilkan kondisi operasional terakhir.
5. Bed Extra yang tidak ditempati ditampilkan dengan legend **Extra Bed**.
6. Nomor Bed Extra selalu menggunakan nomor dari Master Data Bed.
7. Perubahan lokasi/status master hanya memengaruhi tampilan aktif dan tidak mengubah histori okupansi pasien.
8. Setelah okupansi berakhir, status **Dibersihkan** memiliki prioritas tampilan selama periode 30 menit sebelum bed kembali menjadi **Tersedia**.

### 9.4 Matriks Transisi Status Operasional

| Status/Kondisi Saat Ini | Status Tujuan: Tersedia | Status Tujuan: Dibersihkan | Status Tujuan: Rusak | Hasil |
|-------------------------|--------------------------|------------------------------|----------------------|-------|
| **Tersedia** | Tidak ada perubahan | Diizinkan | Diizinkan | Simpan jika validasi terbaru terpenuhi. |
| **Dibersihkan — manual** | Diizinkan | Tidak ada perubahan | Diizinkan | Simpan jika validasi terbaru terpenuhi. |
| **Dibersihkan — otomatis pasca-okupansi, belum 30 menit** | **Ditolak** | Tidak ada perubahan | Diizinkan | Tidak dapat dibuat Tersedia sebelum timer 30 menit selesai; dapat diubah menjadi Rusak bila diperlukan. |
| **Dibersihkan — otomatis pasca-okupansi, timer 30 menit selesai** | Otomatis oleh sistem | Tidak ada perubahan | Mengikuti kondisi terbaru | Sistem mengubah menjadi Tersedia hanya jika status masih Dibersihkan dan tidak ada kondisi baru. |
| **Rusak** | Diizinkan | **Ditolak** | Tidak ada perubahan | Rusak → Dibersihkan tidak diperbolehkan. |
| **Sedang ditempati — aksi manual** | **Ditolak** | **Ditolak** | **Ditolak** | Status operasional tidak dapat diubah manual selama masih ditempati. |
| **Okupansi berakhir karena pulang/pindah** | Tidak langsung | Otomatis oleh sistem | Tidak langsung | Terisi → Dibersihkan selama 30 menit → Tersedia. |

> Status **Booking/Dipesan** bersumber dari modul transaksi dan tidak dapat diubah manual melalui pilihan status operasional. Aturan konflik booking terhadap status operasional mengikuti transaksi terbaru dan validasi sistem.

### 9.5 Pesan Validasi

| Kondisi | Status Tujuan | Pesan |
|---------|---------------|-------|
| Bed sedang ditempati | Tersedia | **Bed yang sedang ditempati tidak bisa diubah menjadi Bed Tersedia.** |
| Bed sedang ditempati | Dibersihkan | **Bed yang sedang ditempati tidak bisa diubah menjadi Bed Dibersihkan.** |
| Bed sedang ditempati | Rusak | **Bed yang sedang ditempati tidak bisa diubah menjadi Bed Rusak.** |
| Bed berstatus Rusak | Dibersihkan | **Bed Yang Sedang Rusak Tidak Bisa Diubah Menjadi Bed Dibersihkan** — ditampilkan dalam modal peringatan dengan tombol **OK**. |
| Bed berstatus Dibersihkan otomatis dan timer belum 30 menit | Tersedia | **Bed masih dalam proses pembersihan selama 30 menit dan belum dapat diubah menjadi Bed Tersedia.** |

### 9.6 Validasi Multiple Select

1. Sistem memvalidasi setiap bed terpilih menggunakan matriks transisi yang sama.
2. Sistem harus mengidentifikasi bed yang tidak valid dan alasan penolakannya.
3. Penyimpanan bersifat **all-or-nothing**: jika minimal satu bed tidak valid, seluruh batch ditolak.
4. Sistem tidak boleh menyimpan perubahan pada bed valid maupun bed tidak valid dalam batch yang ditolak.
5. Setelah batch ditolak, seluruh status bed tetap menggunakan nilai sebelum proses simpan.
6. Pesan validasi harus menjelaskan bed yang menyebabkan penolakan; untuk kondisi **Rusak → Dibersihkan**, gunakan modal dan pesan sesuai Section 9.5.

### 9.7 Transisi Otomatis Pasca-Okupansi

- **Pemicu:** event pasien pulang atau pindah bed yang menutup okupansi aktif pada bed lama.
- **Transisi awal:** **Terisi → Dibersihkan** secara otomatis.
- **Durasi:** 30 menit sejak `occupancy_ended_at` berdasarkan waktu server.
- **Transisi akhir:** **Dibersihkan → Tersedia** secara otomatis setelah 30 menit.
- **Validasi akhir:** transisi hanya dilakukan jika status terkini masih Dibersihkan, tidak terdapat okupansi aktif, dan tidak terdapat status yang lebih baru seperti Rusak.
- **Pembatalan timer:** jika status bed berubah secara valid sebelum timer selesai, sistem membatalkan transisi otomatis menjadi Tersedia.
- **Cakupan:** berlaku untuk bed reguler dan Bed Extra.
- **Audit:** kedua transisi dicatat dengan sumber perubahan **Sistem**.

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Akses fitur** — sistem menyediakan fitur Update Ketersediaan Bed bagi pengguna sesuai hak akses. | US-001; BR-025; NFR-009 |
| **FR-002** | **Pemilihan bangsal/unit** — sistem menyediakan lookup/dropdown bangsal/unit rawat inap yang bersumber dari Master Unit dan tombol pencarian untuk menampilkan data terpilih. | US-001; BR-001 |
| **FR-003** | **Layout per ruang** — sistem menampilkan nama unit/bangsal, ruang, kelas ruang apabila tersedia, serta daftar bed yang dikelompokkan per ruang. | US-001; BR-002 |
| **FR-004** | **Indikator status dan legenda** — sistem menampilkan status setiap bed menggunakan warna beserta label/ikon/badge dan menyediakan legenda status. | US-001; BR-026; NFR-010 |
| **FR-005** | **Multiple select bed** — sistem memungkinkan pengguna memilih satu atau beberapa bed pada layout untuk menerima satu aksi status operasional yang sama. | US-002; BR-004 |
| **FR-006** | **Pilihan aksi operasional** — sistem menyediakan aksi **Tersedia**, **Dibersihkan**, dan **Rusak**. | US-002; BR-003 |
| **FR-007** | **Validasi dan simpan status atomik** — saat pengguna menekan Simpan, sistem memvalidasi hak akses, status terbaru, konflik transaksi, dan matriks transisi untuk setiap bed terpilih. Sistem hanya menyimpan apabila seluruh bed valid; jika satu bed tidak valid, seluruh batch ditolak. | US-002; US-003; BR-009–BR-015; BR-028; NFR-014 |
| **FR-008** | **Alokasi Bed Extra** — sistem menyediakan aksi Tambah Bed Extra per bangsal/ruang dengan daftar nomor Bed Extra yang bersumber dari Master Data Bed dan difilter pada jenis **Extra Bed** serta status **Tersedia**. Satu aksi mengalokasikan satu Bed Extra tanpa membuat nomor master baru. Sistem memvalidasi ulang status saat commit, memperbarui layout, dan mengurangi jumlah Bed Extra tersedia sebanyak satu. | US-004; BR-016–BR-019; BR-029 |
| **FR-009** | **Sinkronisasi perubahan Bed Extra dari Master Data Bed** — sistem tidak menyediakan aksi perpindahan, pengembalian, penonaktifan, atau penghapusan. Setelah proses tersebut berhasil di Master Data Bed, sistem memperbarui layout dan jumlah Bed Extra tersedia berdasarkan data terbaru tanpa mengubah histori okupansi pasien. | US-005; BR-020; BR-030 |
| **FR-010** | **Informasi pasien terisi** — sistem menampilkan No. RM dan nama pasien pada bed dengan okupansi aktif. | US-006; BR-005; BR-006; BR-024 |
| **FR-011** | **Display Bed Extra terisi** — apabila Bed Extra ditempati, sistem menggunakan legend/warna berdasarkan gender pasien dan tetap menampilkan badge/label Bed Extra. | US-006; BR-021 |
| **FR-012** | **Informasi pasien booking** — sistem menampilkan No. RM, nama pasien, dan indikator Booking/Dipesan pada bed dengan booking aktif. | US-007; BR-005; BR-007; BR-024 |
| **FR-013** | **Sinkronisasi status** — sistem menerima dan memublikasikan perubahan status/penggunaan bed kepada modul TPPRI, Bed Management, Rawat Inap, Master Data Bed, dan Informasi Ketersediaan Bed. | US-008; BR-008; BR-023; NFR-002; NFR-004 |
| **FR-014** | **Penanganan kegagalan** — sistem menampilkan loading, empty state, pesan validasi, pesan konflik, dan pesan kegagalan yang dapat ditindaklanjuti. | US-009; BR-027; NFR-006 |
| **FR-015** | **Audit trail** — sistem mencatat riwayat perubahan status dan alokasi Bed Extra, termasuk transisi otomatis **Terisi → Dibersihkan → Tersedia**, beserta sumber perubahan User/Sistem/Modul. | US-010; BR-022; BR-037; NFR-008 |
| **FR-016** | **Kontrol akses** — sistem membedakan hak melihat, mengubah status, dan mengalokasikan Bed Extra. Hak pembuatan, perpindahan, penonaktifan, pengembalian, dan penghapusan dikelola pada Master Data Bed. | US-011; BR-025; NFR-009 |
| **FR-017** | **Refresh data terkini** — sistem menyediakan pemuatan ulang data atau mekanisme pembaruan otomatis agar pengguna dapat melihat kondisi terbaru setelah terjadi perubahan. | US-008; BR-010; NFR-002; NFR-007 |
| **FR-018** | **Preservasi histori Bed Extra** — sistem menyimpan dan mempertahankan snapshot nomor Bed Extra, bangsal/unit, ruang, serta periode okupansi pada histori pasien. Perubahan lokasi atau status aktif Bed Extra di Master Data Bed tidak boleh memperbarui data historis secara retroaktif. | US-012; BR-030; NFR-015 |
| **FR-019** | **Otomatisasi status pasca-okupansi** — ketika event pasien pulang atau pindah bed menutup okupansi aktif, sistem otomatis mengubah bed lama menjadi **Dibersihkan**, mempertahankan status tersebut selama 30 menit, lalu mengubahnya menjadi **Tersedia** setelah memvalidasi bahwa tidak ada okupansi atau perubahan status yang lebih baru. Mekanisme berlaku untuk bed reguler dan Bed Extra serta dicatat pada audit trail. | US-013; BR-031–BR-037; NFR-016 |

## 11. User Stories

> Acceptance Criteria menggunakan pola Given–When–Then.

| ID | User Story | Acceptance Criteria (Given–When–Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas admission/bed management**, saya ingin memilih bangsal/unit dan melihat layout bed per ruang, sehingga saya dapat mengetahui kondisi bed tanpa mengecek langsung ke bangsal. | 1) **Given** pengguna memiliki hak akses, **When** memilih unit dari Master Unit dan menekan Cari, **Then** sistem menampilkan ruang dan bed pada unit tersebut. 2) **Then** setiap bed menampilkan nomor dan statusnya. | FR-001; FR-002; FR-003; FR-004; BR-001; BR-002 |
| **US-002** | Sebagai **petugas bangsal**, saya ingin memilih beberapa bed sekaligus dan menerapkan satu status operasional, sehingga pembaruan kondisi banyak bed dapat dilakukan lebih efisien dan konsisten. | 1) **Given** layout telah ditampilkan, **When** pengguna memilih satu atau beberapa bed, **Then** seluruh pilihan ditandai dengan jelas. 2) **Given** seluruh bed valid, **When** pengguna menekan Simpan, **Then** seluruh perubahan disimpan. 3) **Given** minimal satu bed tidak valid, **When** pengguna menekan Simpan, **Then** seluruh batch ditolak dan tidak ada bed yang berubah. | FR-005; FR-006; FR-007; BR-004; BR-009; BR-010; BR-028 |
| **US-003** | Sebagai **petugas bangsal**, saya ingin sistem menolak transisi status yang tidak diperbolehkan, sehingga status operasional tidak bertentangan dengan okupansi dan aturan V1. | 1) **Given** bed sedang ditempati, **When** diubah menjadi Tersedia, Dibersihkan, atau Rusak, **Then** sistem menolak dan menampilkan pesan sesuai status tujuan. 2) **Given** bed berstatus Rusak, **When** diubah menjadi Dibersihkan, **Then** sistem menolak, mempertahankan status Rusak, dan menampilkan modal **“Bed Yang Sedang Rusak Tidak Bisa Diubah Menjadi Bed Dibersihkan”** dengan tombol OK. 3) **Given** bed tersebut berada dalam batch, **Then** seluruh batch ditolak. | FR-007; BR-011–BR-015; BR-028 |
| **US-004** | Sebagai **petugas bed management**, saya ingin memilih Bed Extra yang tersedia dari Master Data Bed dan mengalokasikannya ke bangsal/ruang tertentu, sehingga kapasitas sementara dapat ditambah tanpa membuat nomor bed baru. | 1) **Given** terdapat Bed Extra berjenis Extra Bed dan berstatus Tersedia pada Master Data Bed, **When** pengguna membuka Tambah Bed Extra, **Then** sistem menampilkan nomor-nomor tersebut. 2) **When** pengguna memilih satu nomor dan menyimpan, **Then** sistem mengalokasikannya ke bangsal/ruang tujuan dan jumlah tersedia berkurang satu. 3) **Given** status nomor tersebut berubah sebelum disimpan, **Then** sistem menolak alokasi dan meminta refresh. 4) Sistem tidak menyediakan field jumlah dan tidak membuat data master baru. | FR-008; BR-016–BR-019; BR-029 |
| **US-005** | Sebagai **petugas bed management**, saya ingin perubahan perpindahan, pengembalian, penonaktifan, atau penghapusan Bed Extra dari Master Data Bed tercermin pada layout, sehingga data aktif tetap akurat tanpa mengubah histori pasien. | **Given** perubahan lifecycle berhasil dilakukan melalui Master Data Bed, **When** data Update Ketersediaan Bed diperbarui, **Then** alokasi aktif dan jumlah Bed Extra tersedia menampilkan kondisi terbaru, sedangkan histori pasien sebelumnya tetap menampilkan lokasi saat pelayanan. | FR-009; BR-020; BR-030; FR-013 |
| **US-006** | Sebagai **petugas admission**, saya ingin melihat identitas pasien yang menempati bed reguler maupun Bed Extra, sehingga saya dapat membedakan bed terisi tanpa membuka transaksi lain. | 1) **Given** suatu bed memiliki okupansi aktif, **When** layout ditampilkan, **Then** sistem menampilkan No. RM dan nama pasien. 2) **Given** bed tersebut merupakan Bed Extra, **Then** warna utama mengikuti gender pasien dan badge Bed Extra tetap terlihat. | FR-010; FR-011; BR-006; BR-021; BR-024 |
| **US-007** | Sebagai **petugas admission**, saya ingin melihat identitas pasien yang membooking bed, sehingga saya tidak menempatkan pasien lain pada bed yang telah dipesan. | **Given** suatu bed memiliki booking aktif, **When** layout ditampilkan, **Then** sistem menampilkan No. RM, nama pasien, dan indikator Booking/Dipesan. | FR-012; BR-007; BR-024 |
| **US-008** | Sebagai **petugas operasional**, saya ingin status bed mengikuti transaksi terbaru dari modul terkait, sehingga seluruh unit melihat informasi yang konsisten. | **Given** terjadi admission, booking, perpindahan, pemulangan, atau perubahan status yang berhasil, **When** data diproses, **Then** kondisi terbaru tersedia pada Update Ketersediaan Bed dan modul konsumen. | FR-013; FR-017; BR-023; NFR-002; NFR-004 |
| **US-009** | Sebagai **pengguna**, saya ingin memperoleh pesan yang jelas ketika data gagal dimuat atau disimpan, sehingga saya mengetahui tindakan berikutnya. | **Given** terjadi validasi gagal, konflik, atau gangguan sistem, **When** proses tidak berhasil, **Then** sistem menampilkan alasan dan tidak menampilkan perubahan sebagai sukses. | FR-014; BR-027; NFR-006 |
| **US-010** | Sebagai **administrator/auditor**, saya ingin menelusuri perubahan status dan alokasi Bed Extra, termasuk perubahan otomatis pasca-okupansi, sehingga perubahan operasional dapat dipertanggungjawabkan. | **Given** perubahan manual atau otomatis terjadi, **When** audit ditelusuri, **Then** tersedia data sebelum, sesudah, bangsal/ruang, sumber perubahan, aktor jika ada, waktu server, dan jenis aksi. | FR-015; BR-022; BR-037; NFR-008 |
| **US-011** | Sebagai **administrator**, saya ingin membatasi tindakan berdasarkan role, sehingga hanya petugas berwenang yang dapat mengubah status atau mengalokasikan Bed Extra. | **Given** pengguna hanya memiliki hak lihat, **When** membuka fitur, **Then** aksi perubahan status dan Tambah Bed Extra tidak tersedia atau disabled. | FR-016; BR-025; NFR-009 |
| **US-012** | Sebagai **petugas pelayanan/auditor**, saya ingin histori pasien tetap menampilkan Bed Extra, bangsal, dan ruang pada saat pelayanan, sehingga riwayat tidak berubah ketika master Bed Extra dipindahkan atau dinonaktifkan. | **Given** pasien pernah menempati Bed Extra, **When** Bed Extra tersebut kemudian dipindahkan atau dinonaktifkan pada Master Data Bed, **Then** histori pasien tetap menampilkan nomor bed dan lokasi yang berlaku pada periode okupansi tersebut. | FR-018; BR-030; NFR-015 |
| **US-013** | Sebagai **petugas admission/bangsal**, saya ingin bed otomatis masuk proses pembersihan setelah pasien selesai menggunakannya dan tersedia kembali setelah 30 menit, sehingga bed tidak digunakan sebelum periode pembersihan selesai. | 1) **Given** pasien pulang atau pindah dari bed, **When** okupansi ditutup, **Then** sistem otomatis mengubah bed menjadi Dibersihkan. 2) **Given** belum lewat 30 menit, **Then** bed tidak dapat digunakan untuk penempatan pasien baru dan tidak dapat diubah manual menjadi Tersedia. 3) **Given** 30 menit telah lewat dan status tidak berubah, **Then** sistem otomatis mengubah bed menjadi Tersedia. 4) **Given** bed berubah menjadi Rusak sebelum timer selesai, **Then** sistem tidak mengubahnya menjadi Tersedia. | FR-019; BR-031–BR-037; NFR-016 |

## 12. Data Requirements (Spesifikasi Field)

> Identitas pasien **reuse definisi kanonik dari Master Pasien/Pendaftaran** — nama field, tipe, format, dan aturan penampilan harus sama. Data pasien pada fitur ini bersifat read-only dan berasal dari transaksi okupansi atau booking aktif. Data bangsal/unit rawat inap bersumber dari **Master Unit**.

### A. Layar TAMPIL — Layout Update Ketersediaan Bed

| Kolom/Elemen | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|--------------|-------------|-----------------|-------------|---------|
| Bangsal/Unit Rawat Inap | Master Unit | Teks | Filter unit | Unit yang dikonfigurasi sebagai bangsal/unit rawat inap. |
| Nama Ruang | Master Ruang | Teks per section/group | Urutan master `[PERLU KONFIRMASI]` | Contoh V1: Ruang 1 Kelas I. |
| Kelas Ruang | Master Ruang/Kelas | Teks | Mengikuti ruang | Ditampilkan bila tersedia. |
| Nomor Bed | Master Data Bed | Teks pada kartu bed | Urutan nomor bed | Untuk Bed Extra, nomor berasal langsung dari Master Data Bed dan tidak dibuat oleh fitur ini. |
| Jenis Bed | Master/Alokasi | Badge: Reguler/Extra Bed | Filter tidak diperlukan | Penanda Bed Extra tetap terlihat ketika bed ditempati. |
| Status Operasional | Status Bed | Label + ikon/warna | Dapat digunakan untuk filter `[PERLU KONFIRMASI]` | Tersedia, Dibersihkan, Rusak. |
| Waktu Mulai Pembersihan | Status/transaksi bed | Datetime | Tidak ada | Dibuat otomatis ketika okupansi berakhir; digunakan sebagai awal timer 30 menit. |
| Tersedia Kembali Pada | Status/transaksi bed | Datetime | Tidak ada | `waktu_mulai_pembersihan + 30 menit`; hanya berlaku untuk pembersihan otomatis pasca-okupansi. |
| Status Penggunaan | TPPRI/Rawat Inap/Bed Management | Label + ikon/warna | Dapat digunakan untuk filter `[PERLU KONFIRMASI]` | Terisi atau Booking/Dipesan. |
| Status Seleksi | Interaksi UI | Outline/checkmark pada kartu | Tidak ada | Menunjukkan satu atau beberapa bed yang sedang dipilih. |
| No. RM | Transaksi pasien aktif/booking | Teks | Tidak ada | Read-only; tampil hanya jika terisi/booking. |
| Nama Pasien | Master Pasien melalui transaksi | Teks | Tidak ada | Read-only; tampil langsung pada visualisasi bed. |
| Indikator Booking | Transaksi booking aktif | Badge **Booking/Dipesan** | Tidak ada | Wajib membedakan booking dan okupansi. |
| Jenis Kelamin Pasien | Master Pasien/Pendaftaran | Ikon/warna mengikuti V1 | Tidak ada | Menentukan legend bed terisi, termasuk Bed Extra terisi. |
| Indikator Bed Extra | Data alokasi Bed Extra | Badge/label **Bed Extra** | Tidak ada | Tetap tampil ketika legend utama mengikuti gender pasien. |
| Total Bed Extra Tersedia | Master Data Bed | Angka bulat | Tidak ada | Menghitung Bed Extra berjenis Extra Bed dengan status master Tersedia yang belum dialokasikan; diperbarui setelah alokasi atau perubahan lifecycle master. |
| Legenda Status | Konfigurasi UI | Warna + label + ikon | Tidak ada | Tidak boleh hanya menampilkan warna. |
| Terakhir Diperbarui | Metadata status | Datetime relatif/absolut | Tidak ada | `[PERLU KONFIRMASI apakah perlu ditampilkan pada UI]`. |

### B. Layar INPUT — Alokasi Bed Extra

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| target_unit_id | Bangsal/Unit Tujuan | Lookup/reference | Ya | Unit rawat inap aktif | Konteks bangsal yang sedang dibuka | Bersumber dari Master Unit. |
| target_room_id | Ruang Tujuan | Lookup/reference | Ya | Harus berada pada unit tujuan | Ruang yang dipilih pengguna | Lokasi aktif alokasi Bed Extra. |
| extra_bed_id | Nomor Bed Extra | Lookup/single select | Ya | Jenis = Extra Bed; status master = Tersedia | Master Data Bed | Hanya menampilkan nomor yang memenuhi filter pada saat daftar dibuka. |
| extra_bed_master_version | Versi Data Bed Extra | Hidden/version | Ya | Harus sama dengan versi terbaru saat commit | Sistem | Mencegah satu Bed Extra dialokasikan oleh dua proses secara bersamaan. |

### C. Layar INPUT — Perubahan Status Operasional

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| selected_bed_ids | Bed Terpilih | Multi-select | Ya | Minimal 1 bed | Pilihan pengguna pada layout | Dapat berisi satu atau beberapa bed. |
| target_operational_status | Pilih Aksi | Dropdown/single select | Ya | Tersedia, Dibersihkan, atau Rusak | Manual | Satu status tujuan diterapkan pada seluruh bed terpilih. |
| current_status_version | Versi Status Terakhir | Hidden/version | Ya | Harus sesuai data terbaru saat simpan | Sistem | Digunakan untuk validasi concurrency. |

### D. Data Dibuat Otomatis saat Simpan

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| changed_by | Diubah Oleh | Identifier/nullable | Pengguna login atau aktor sistem | Untuk transisi otomatis, gunakan identitas aktor sistem atau null dengan `status_change_source = System`. |
| changed_at | Waktu Perubahan | Datetime | Waktu server | Audit perubahan. |
| previous_status | Status Sebelum | Enum | Status terakhir tersimpan | Dicatat per bed. |
| new_status | Status Sesudah | Enum | Status tujuan | Dicatat per bed yang berhasil diproses. |
| action_type | Jenis Aksi | Enum | Update Status/Alokasi Extra Bed/Auto Cleaning Start/Auto Available | Audit aksi manual maupun otomatis. |
| allocated_unit_id | Unit Alokasi | Identifier | Master Unit | Diisi untuk aksi Alokasi Extra Bed. |
| allocated_room_id | Ruang Alokasi | Identifier | Master Data Bed/Ruang | Diisi untuk aksi Alokasi Extra Bed. |
| occupancy_ended_at | Waktu Okupansi Berakhir | Datetime | Event Rawat Inap/waktu server | Pemicu transisi otomatis menjadi Dibersihkan. |
| cleaning_started_at | Waktu Mulai Dibersihkan | Datetime | Waktu server | Sama dengan waktu transisi otomatis pasca-okupansi. |
| cleaning_available_at | Tersedia Kembali Pada | Datetime | `cleaning_started_at + 30 menit` | Waktu target transisi otomatis menjadi Tersedia. |
| cleaning_source | Sumber Pembersihan | Enum | Manual/Post-Occupancy | Membedakan status Dibersihkan manual dan otomatis pasca-okupansi. |
| status_change_source | Sumber Perubahan Status | Enum | User/System/Module | Transisi timer dicatat sebagai System. |

### E. Snapshot Histori Okupansi Bed Extra

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| extra_bed_id | ID Bed Extra | Identifier | Referensi stabil Master Data Bed | Dipertahankan untuk keterlacakan meskipun master dinonaktifkan. |
| extra_bed_number_snapshot | Nomor Bed Extra Saat Pelayanan | Text | Snapshot dari Master Data Bed | Tidak berubah jika nomor/lokasi master berubah kemudian. |
| unit_id_snapshot | Unit/Bangsal Saat Pelayanan | Identifier | Snapshot transaksi okupansi | Tidak mengikuti unit aktif terbaru dari master. |
| unit_name_snapshot | Nama Unit/Bangsal Saat Pelayanan | Text | Snapshot transaksi okupansi | Ditampilkan pada histori pasien. |
| room_id_snapshot | Ruang Saat Pelayanan | Identifier | Snapshot transaksi okupansi | Tidak mengikuti ruang aktif terbaru dari master. |
| room_name_snapshot | Nama Ruang Saat Pelayanan | Text | Snapshot transaksi okupansi | Ditampilkan pada histori pasien. |
| occupied_from | Mulai Menempati | Datetime | Waktu transaksi | Awal periode okupansi. |
| occupied_until | Selesai Menempati | Datetime/nullable | Waktu transaksi | Akhir periode okupansi. |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Proses penyimpanan perubahan status untuk satu atau beberapa bed harus memberikan respons dalam SLA p95 yang disepakati. | Goals and Metrics; FR-007 |
| **NFR-002** | Real-Time | Perubahan status, okupansi, booking, alokasi Bed Extra, serta perpindahan/pengembalian/penonaktifan/penghapusan dari Master Data Bed harus dipropagasikan ke modul konsumen tanpa refresh manual yang tidak perlu. Target latensi perlu ditetapkan. `[PERLU KONFIRMASI]` | Performance Expectation; FR-009; FR-013; FR-017 |
| **NFR-003** | Performa/Skalabilitas | Layout harus tetap dapat dimuat dan digunakan pada unit dengan jumlah ruang dan bed maksimum yang didukung rumah sakit. | FR-003 |
| **NFR-004** | Konsistensi | Satu bed tidak boleh menampilkan kondisi yang saling bertentangan pada modul Update Ketersediaan Bed, TPPRI, Bed Management, Rawat Inap, dan Informasi Ketersediaan Bed. | Performance Expectation; FR-013 |
| **NFR-005** | Integritas Data | No. RM dan nama pasien harus berasal dari transaksi pasien aktif terbaru dan tidak boleh diedit pada fitur ini. | Expected Improvement From V1; FR-010; FR-012 |
| **NFR-006** | Reliabilitas/Usability | Setiap kegagalan load, validasi, atau save harus menampilkan pesan yang jelas; sistem tidak boleh memberikan indikator sukses sebelum perubahan benar-benar tersimpan. | FR-014; BR-027 |
| **NFR-007** | Concurrency | Sistem harus menggunakan validasi versi/timestamp atau mekanisme setara untuk mencegah lost update saat status beberapa bed berubah secara bersamaan. | FR-007; FR-017; BR-010 |
| **NFR-008** | Auditabilitas | Riwayat perubahan menyimpan nilai sebelum/sesudah, jenis aksi, sumber perubahan User/Sistem/Modul, aktor jika ada, dan waktu server. | FR-015; BR-022; BR-037 |
| **NFR-009** | Keamanan/RBAC | Pada fitur ini, akses lihat, ubah status, dan alokasi Bed Extra harus dikontrol berdasarkan role/permission. Hak pembuatan, perpindahan, penonaktifan, pengembalian, dan penghapusan Bed Extra dikontrol pada Master Data Bed. | FR-001; FR-016; BR-025 |
| **NFR-010** | Aksesibilitas | Status tidak boleh dibedakan hanya melalui warna; harus tersedia label, ikon, badge, atau teks yang dapat dibaca. | FR-004; BR-026 |
| **NFR-011** | Privasi | Identitas pasien hanya ditampilkan kepada pengguna yang memiliki hak akses operasional terkait dan tidak boleh terekspos pada layar publik. | FR-016; Data Requirements |
| **NFR-012** | Responsivitas | Layout harus tetap dapat digunakan pada resolusi desktop operasional rumah sakit; perilaku pada tablet/mobile. | Referensi UI V1 |
| **NFR-013** | Observabilitas | Kegagalan sinkronisasi, konflik status, validasi transisi, alokasi Bed Extra, dan sinkronisasi perubahan dari Master Data Bed harus dapat ditelusuri melalui log teknis dengan correlation identifier. | FR-009; FR-013; FR-014 |
| **NFR-014** | Integritas Transaksi | Penyimpanan update status multiple select harus atomik: seluruh perubahan berhasil bersama-sama atau seluruhnya dibatalkan. Partial success tidak diperbolehkan. | FR-007; BR-028 |
| **NFR-015** | Integritas Historis | Histori okupansi Bed Extra harus bersifat immutable terhadap perubahan master berikutnya. Perpindahan ruang, perubahan unit, penonaktifan, atau penghapusan Bed Extra tidak boleh mengubah maupun menghilangkan snapshot lokasi pada transaksi pasien yang telah terjadi. | FR-018; BR-030; US-012 |
| **NFR-016** | Reliabilitas Otomatisasi | Timer 30 menit dan transisi otomatis pasca-okupansi harus menggunakan waktu server, bersifat idempotent, tahan terhadap retry, dan selalu memvalidasi status terkini sebelum mengubah bed menjadi Tersedia agar tidak menimpa perubahan yang lebih baru. | FR-019; BR-032–BR-035; US-013 |

## 14. Integrasi Internal & Dependency

Tidak terdapat integrasi eksternal yang disebutkan pada scope ini. Seluruh integrasi yang dibutuhkan merupakan integrasi internal antarmodul Neurovi v2.

| Integrasi | Fungsi di Modul Ini | Status | Trace |
|-----------|----------------------|--------|-------|
| **Master Unit** | Menyediakan data unit yang digunakan sebagai bangsal/unit rawat inap. | Internal — Hard Dependency | FR-002; FR-003 |
| **Master Data Bed** | Menyediakan struktur layout, nomor dan identitas Bed Extra, status master Tersedia/Nonaktif, serta fitur pembuatan, perpindahan, pengembalian, penonaktifan, dan penghapusan Bed Extra. | Internal — Hard Dependency | FR-003; FR-008; FR-009 |
| **TPPRI** | Menggunakan status ketersediaan dan menyediakan konteks booking/admission sesuai proses rumah sakit. | Internal — Hard Dependency | FR-010; FR-012; FR-013 |
| **Bed Management** | Menyediakan transaksi booking dan monitoring penggunaan bed. | Internal — Hard Dependency | FR-012; FR-013 |
| **Rawat Inap** | Menyediakan transaksi okupansi serta event perpindahan/pemulangan yang menutup okupansi dan memicu status Dibersihkan selama 30 menit; juga menyimpan snapshot Bed Extra dan lokasi saat pasien menempati bed. | Internal — Hard Dependency | FR-010; FR-011; FR-013; FR-018; FR-019 |
| **Informasi Ketersediaan Bed** | Menampilkan status bed terkini kepada konsumen internal atau display informasi. | Internal — Hard Dependency | FR-013 |
| **Manajemen Pengguna/RBAC** | Memvalidasi akses lihat dan perubahan. | Internal — Hard Dependency | FR-001; FR-016 |
| **Audit Trail** | Menyimpan riwayat perubahan status manual maupun otomatis serta alokasi Bed Extra. Audit perubahan master disimpan oleh Master Data Bed. | Internal — Hard Dependency | FR-015; FR-019 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Konfigurasi unit rawat inap pada Master Unit | Hard | Pilihan bangsal/unit dan layout terkait tidak dapat ditampilkan dengan benar. |
| Kontrak status bed kanonik lintas modul | Hard | Status dapat berbeda antara Update Bed, TPPRI, Rawat Inap, dan display. |
| Kontrak event/API transaksi booking dan okupansi | Hard | Identitas pasien dan status penggunaan tidak dapat diperbarui secara akurat. |
| Master Data Bed V2 | Hard | Struktur ruang/bed, nomor Bed Extra, dan status Tersedia tidak dapat ditampilkan atau digunakan untuk alokasi. |
| Kontrak daftar Bed Extra tersedia dan alokasi | Hard | Fitur tidak dapat menampilkan nomor yang dapat dipilih, mencegah double allocation, atau memperbarui jumlah Bed Extra tersedia secara konsisten. |
| Skema snapshot histori okupansi | Hard | Perubahan lokasi/status master berisiko mengubah atau menghilangkan konteks Bed Extra pada histori pasien. |
| Event penutupan okupansi dan scheduler/timer status bed | Hard | Bed tidak dapat otomatis berubah menjadi Dibersihkan dan tersedia kembali setelah 30 menit secara konsisten. |
| Konfigurasi permission | Hard | Aksi perubahan tidak dapat diamankan sesuai role. |
| Design system status bed | Soft | Fitur dapat berjalan, tetapi visual status berisiko tidak konsisten dengan modul lain. |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| **D-001** | Perubahan bisnis proses V1 ke V2 | Proses bisnis utama tetap memakai V1 sebagai baseline. |
| **D-002** | Sumber data bangsal | Data bangsal/unit rawat inap tersedia pada **Master Unit**. |
| **D-003** | Pemilihan bed untuk update status | Pengguna dapat memilih satu atau beberapa bed sekaligus dan menerapkan satu status operasional yang sama. |
| **D-004** | Informasi pasien pada bed terisi | No. RM dan nama pasien ditampilkan langsung pada visualisasi bed. |
| **D-005** | Informasi pasien pada bed booking | No. RM, nama pasien, dan indikator Booking/Dipesan ditampilkan langsung pada visualisasi bed. |
| **D-006** | Status operasional yang dapat diubah manual | Tersedia, Dibersihkan, dan Rusak dengan matriks validasi mengikuti V1. |
| **D-007** | Bed Extra terisi | Legend/warna utama mengikuti gender pasien dan badge/label Bed Extra tetap ditampilkan. |
| **D-008** | Lifecycle Bed Extra | Pembuatan nomor serta perpindahan, pengembalian, penonaktifan, dan penghapusan dilakukan pada Master Data Bed. Update Ketersediaan Bed hanya mengalokasikan Bed Extra berstatus Tersedia ke bangsal/ruang. |
| **D-009** | Modul yang menerima dampak perubahan | TPPRI dan Informasi Ketersediaan Bed mengikuti perubahan status; data penggunaan terhubung dengan Bed Management dan Rawat Inap; lifecycle Bed Extra tersinkron dengan Master Data Bed. |
| **D-010** | Penyimpanan multiple select | Seluruh batch ditolak apabila minimal satu bed tidak valid; partial success tidak diperbolehkan. |
| **D-011** | Kuantitas Tambah Bed Extra | Setiap aksi Tambah Bed Extra mengalokasikan tepat satu nomor Bed Extra dari Master Data Bed dan tidak menyediakan input jumlah. |
| **D-012** | Validasi Rusak → Dibersihkan | Transisi ditolak dengan modal **“Bed Yang Sedang Rusak Tidak Bisa Diubah Menjadi Bed Dibersihkan”** dan tombol **OK**. |
| **D-013** | Sumber nomor Bed Extra | Nomor Bed Extra dibuat dan dikelola pada Master Data Bed; fitur ini hanya menampilkan Bed Extra berstatus Tersedia untuk dipilih. |
| **D-014** | Histori Bed Extra | Histori pasien menggunakan snapshot nomor Bed Extra, bangsal, dan ruang saat pelayanan dan tidak ikut berubah ketika master dipindahkan atau dinonaktifkan. |
| **D-015** | Status bed setelah digunakan pasien | Setelah pasien pulang atau pindah bed, bed lama otomatis menjadi **Dibersihkan** selama 30 menit, kemudian otomatis menjadi **Tersedia** jika tidak ada kondisi yang lebih baru. Mekanisme berlaku untuk bed reguler dan Bed Extra. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| **R1** | Status bed terlambat atau berbeda antarmodul sehingga terjadi double allocation. | Gunakan satu kontrak status kanonik, event/API terverifikasi, validasi konflik sebelum save, dan monitoring sinkronisasi. |
| **R2** | Pengguna menimpa status yang berubah setelah layar dimuat. | Gunakan optimistic locking/versioning dan tampilkan pesan konflik beserta aksi refresh. |
| **R3** | Proses multiple select menghasilkan kombinasi bed valid dan tidak valid. | Terapkan transaksi atomik: jika satu bed gagal validasi, rollback/tolak seluruh batch dan tampilkan bed penyebab penolakan. |
| **R4** | Warna status sulit dibedakan atau menimbulkan interpretasi berbeda. | Sertakan label, badge, ikon, legenda, dan ikuti design system Neurovi v2. |
| **R5** | Identitas pasien terlihat oleh pengguna yang tidak berwenang. | Terapkan RBAC dan batasi fitur pada layar operasional internal. |
| **R6** | Status Bed Extra berubah atau nomor yang sama dialokasikan oleh dua pengguna secara bersamaan. | Validasi status Tersedia dan versi master saat commit, gunakan transaksi atomik/locking, lalu minta refresh jika konflik. |
| **R7** | Bed Extra terisi tidak terbaca sebagai Bed Extra karena warna mengikuti gender. | Pertahankan badge/label Bed Extra terpisah dari legend/warna utama. |
| **R8** | Pengguna mencari aksi pembuatan, perpindahan, penonaktifan, pengembalian, atau penghapusan Bed Extra pada halaman Update Ketersediaan Bed. | Tegaskan batas fitur pada UI/brief; proses master tersedia pada Master Data Bed, sedangkan halaman ini hanya mengalokasikan bed tersedia dan menampilkan hasil sinkronisasi. |
| **R9** | Histori pasien berubah ketika Bed Extra dipindahkan ke ruang lain atau dinonaktifkan. | Simpan snapshot lokasi dan nomor bed pada transaksi okupansi, larang update retroaktif, serta uji regresi histori setelah perubahan master. |
| **R10** | Timer pembersihan gagal atau menimpa status terbaru sehingga bed tersedia terlalu cepat atau status Rusak berubah kembali menjadi Tersedia. | Gunakan waktu server, job idempotent, validasi status/version sebelum transisi, retry terkontrol, serta monitoring job yang gagal atau terlambat. |

## 17. Asumsi

- `[ASUMSI]` Entry point V2 tetap berada pada area Pendaftaran/Bed Management, mengikuti pola menu V1, sampai struktur navigasi final ditetapkan.
- `[ASUMSI]` Data No. RM dan nama pasien diambil dari transaksi okupansi atau booking aktif, bukan disalin manual ke status bed.
- `[ASUMSI]` Perubahan status bed dipropagasikan melalui kontrak layanan/event internal Neurovi v2.
- `[ASUMSI]` Master Data Bed menyediakan nomor Bed Extra yang unik, jenis bed, status master **Tersedia/Nonaktif**, dan versi data untuk kebutuhan validasi alokasi.
- `[ASUMSI]` Master Data Bed memublikasikan atau menyediakan data terbaru setelah pembuatan, perpindahan, pengembalian, penonaktifan, atau penghapusan Bed Extra agar layout dan jumlah tersedia pada fitur ini dapat disinkronkan.
- `[ASUMSI]` Warna pada referensi V1 merupakan baseline makna status, sedangkan kode warna final mengikuti design system Neurovi v2.

## 18. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 (Draft) | 19 Juli 2026 | Team Product — Tamtech International | Penyusunan awal PRD Update Ketersediaan Bed Neurovi v2 berdasarkan kebutuhan user, baseline UI Neurovi v1, dan peningkatan informasi pasien pada bed terisi/booking. |
| 1.1 (Draft) | 19 Juli 2026 | Team Product — Tamtech International | Menetapkan Master Unit sebagai sumber data bangsal, multiple select bed, lifecycle Bed Extra mengikuti V1, display Bed Extra terisi mengikuti gender, serta matriks transisi dan pesan validasi status operasional berdasarkan referensi V1. |
| 1.2 (Draft) | 19 Juli 2026 | Team Product — Tamtech International | Menetapkan penyimpanan multiple select sebagai all-or-nothing, menambahkan validasi Rusak → Dibersihkan sesuai lampiran, memindahkan pengembalian/penghapusan Bed Extra ke Master Data Bed, dan menetapkan satu Bed Extra per klik. |
| 1.3 (Draft) | 20 Juli 2026 | Team Product — Tamtech International | Menetapkan pembuatan nomor Bed Extra pada Master Data Bed, membatasi fitur ini pada alokasi Bed Extra berstatus Tersedia ke bangsal/ruang, menambahkan validasi ulang status saat alokasi, serta menjaga snapshot histori pasien ketika Bed Extra dipindahkan atau dinonaktifkan. |
| 1.4 (Draft) | 20 Juli 2026 | Team Product — Tamtech International | Menambahkan transisi otomatis setelah okupansi pasien berakhir: bed menjadi Dibersihkan selama 30 menit lalu kembali Tersedia, termasuk aturan timer, validasi status terbaru, audit sistem, serta penerapan pada bed reguler dan Bed Extra. |

