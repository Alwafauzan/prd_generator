# PRD — Iter Obat

**Related Document:** `Bispro Iter.pdf`; `TEMPLATE-PRD-Generator-Neurovi-v2.md`; Referensi UI Iter Obat Neurovi v1; PRD Pelayanan — Resep; PRD Farmasi — Permintaan dan Konfirmasi Obat; PRD Farmasi — Pembuatan Obat; PRD Farmasi — Penyerahan Obat  
**Dokumen ID:** PRD-P-FRM-ITER-OBAT-v2.0 · **Versi:** 2.3 (Draft — Penambahan Tanggal Konfirmasi Obat)  
**Tanggal Disusun:** 19 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Farmasi, Pelayanan, Backend, Frontend, QA, dan UI/UX  
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Iter Obat adalah fitur untuk mengelola pengambilan ulang obat kronis pasien BPJS berdasarkan jumlah iterasi yang ditentukan dokter pada e-Resep. Fitur digunakan oleh petugas farmasi melalui entry point **Modul Farmasi → menu Iter Obat**, kemudian sistem menampilkan Dashboard Iter Obat.

Data iter dibentuk ketika e-Resep dari pelayanan telah masuk ke Farmasi dan petugas berhasil melakukan **Konfirmasi Obat**. Setiap resep utama hanya membentuk **satu row** pada Dashboard Iter, baik jumlah iter yang diberikan adalah Iter 1x maupun Iter 2x. Jumlah hak iter ditampilkan sebagai progres, misalnya `0/1`, `0/2`, `1/2`, dan `2/2`.

Neurovi v2 mengelola lifecycle iter mulai dari pembentukan row, penyaringan item obat kronis, perhitungan tanggal dapat ditebus H+24 hari kalender, penebusan dari halaman detail, pembuatan order otomatis ke Permintaan Obat, pembaruan status berdasarkan proses farmasi, rollback ketika order iter dibatalkan, sampai iterasi selesai.

Dashboard hanya memuat resep dengan **Iter 1x** atau **Iter 2x** dan hanya membawa item obat yang ditandai **Kronis**. Dashboard juga menampilkan **Tanggal Konfirmasi Obat** sebagai informasi waktu terbentuknya row. Filter tanggal tetap menggunakan **Tanggal Bisa Ditebus**, secara default tanggal hari ini, dan hasil diurutkan berdasarkan Tanggal Bisa Ditebus paling awal.

Data iter memiliki masa berlaku 120 hari kalender sejak row Dashboard Iter dibentuk. Apabila umur data iter telah melewati 120 hari, data dianggap kedaluwarsa, tombol **Tebus Obat** tidak ditampilkan, dan halaman detail menampilkan informasi bahwa batas waktu penebusan telah terlewati.

> Referensi utama: Bisnis proses Iter Obat, catatan kebutuhan tambahan, dan tampilan Neurovi v1.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Farmasi telah memiliki halaman daftar Iter Obat dan halaman detail resep iter.
- Monitoring hak iter belum membentuk lifecycle yang konsisten lintas Konfirmasi Obat, Permintaan Obat, Pembuatan Obat, dan Penyerahan Obat.
- Belum terdapat aturan UI yang konsisten untuk penebusan H+24 hari kalender.
- Belum terdapat penanganan data iter yang telah melewati masa berlaku 120 hari.
- Farmasi kesulitan membedakan resep yang siap ditebus, sedang diproses, menunggu iterasi berikutnya, selesai, atau tidak dapat ditebus karena penjamin berubah.
- Pembatalan order iter belum memiliki mekanisme rollback status yang terdefinisi.

**Masalah/pain point:**
- **Aspek bisnis proses:** pembentukan data, pembuatan order ulang, rollback pembatalan, dan monitoring sisa iter berpotensi tidak tersambung sebagai satu siklus.
- **Aspek UX:** daftar antrean belum cukup menjelaskan kapan obat dapat ditebus, kondisi kedaluwarsa, dan alasan aksi tidak tersedia.
- **Aspek logic system:** filtering kronis, satu-row-per-resep, status iter, tanggal tebus, masa berlaku, perubahan penjamin, dan hasil aktual penyerahan perlu dikelola sebagai data terstruktur.

**Dampak utama yang disasar v2:**
- Farmasi dapat membuka Dashboard Iter melalui entry point yang jelas.
- Row iter terbentuk otomatis saat Konfirmasi Obat berhasil.
- Satu resep utama hanya memiliki satu row lifecycle.
- Penebusan hanya dilakukan pada waktu dan kondisi yang valid.
- Data kedaluwarsa tidak dapat ditebus.
- Pembatalan order mengembalikan status agar dapat diproses ulang.
- Hanya item obat kronis yang diteruskan ke iter berikutnya.
- Resep awal dan obat yang benar-benar diserahkan dapat dibandingkan.

**Strategi rilis Neurovi v2:**
- **Current Development Phase (P0):** entry point Farmasi, pembentukan row saat Konfirmasi Obat, intelligent drug filtering, lifecycle status, H+24 hari kalender, masa berlaku 120 hari, penebusan otomatis ke Permintaan Obat, rollback pembatalan, detail iter, filter status, serta penjagaan perubahan penjamin.

## 3. In Scope

### Scope Definition (Current Development Phase — P0)

1. **Entry point Iter Obat**
   - Pengguna membuka **Modul Farmasi**.
   - Pengguna memilih menu **Iter Obat**.
   - Sistem menampilkan Dashboard Iter Obat.

2. **Pengaturan iter pada e-Resep**
   - Program resep harus **Penyakit Kronis**.
   - Pilihan iter: **Tanpa Iter**, **Iter 1x**, dan **Iter 2x**.
   - Resep dengan **Tanpa Iter** tidak masuk Dashboard Iter.

3. **Pembentukan row Dashboard Iter**
   - e-Resep dibuat pada pelayanan dan masuk ke Farmasi.
   - Row Dashboard Iter dibentuk ketika petugas Farmasi berhasil melakukan **Konfirmasi Obat**.
   - Satu resep utama menghasilkan satu row, termasuk ketika jumlah iter adalah 2x.
   - Progres awal ditampilkan sebagai `0/1` atau `0/2`.

4. **Intelligent Drug Filtering**
   - Hanya item dengan flag/kategori **Kronis** yang masuk ke resep iter.
   - Obat akut, obat tambahan, dan item non kronis tidak disalin ke order iter.
   - Apabila resep awal memiliki obat racik non kronis, UI menampilkan tooltip: **“Obat Non Kronis tidak masuk ke dalam program iterasi.”**

5. **Dashboard Iter Obat**
   - Menyediakan filter range **Tanggal Bisa Ditebus**.
   - Default tanggal awal dan akhir adalah **hari ini**.
   - Menyediakan filter berdasarkan status.
   - Menyediakan pencarian berdasarkan nama pasien atau nomor RM.
   - Menampilkan kolom: No Resep, No SEP, No RM, Nama, Dokter, Tanggal Konfirmasi Obat, Iterasi, Tanggal Bisa Ditebus, Status, dan aksi Detail.
   - Tanggal Konfirmasi Obat hanya menjadi informasi pada dashboard dan tidak menjadi dasar filter tanggal.
   - Data diurutkan berdasarkan Tanggal Bisa Ditebus secara ascending.

6. **Perhitungan tanggal dapat ditebus**
   - Penebusan paling cepat dilakukan pada H+24 hari kalender dari penyerahan/penebusan terakhir.
   - Tidak terdapat pengecualian hari libur nasional, hari Minggu, maupun hari operasional Farmasi.
   - Tombol **Tebus Obat** disabled apabila hari ini masih sebelum tanggal dapat ditebus.
   - Tombol enabled apabila hari ini sama dengan atau setelah tanggal dapat ditebus serta kondisi lain mengizinkan.

7. **Masa berlaku Iter Obat**
   - Masa berlaku dihitung 120 hari kalender sejak Tanggal Konfirmasi Obat berhasil.
   - Jika umur row telah melewati 120 hari, data iter dianggap kedaluwarsa.
   - Pada data kedaluwarsa, tombol Tebus Obat di-hide.
   - Detail menampilkan informasi bahwa data iter telah melewati 120 hari dan tidak dapat ditebus.

8. **Penebusan dari Dashboard Iter**
   - Aksi Tebus Obat tersedia pada halaman detail iter.
   - Sistem menampilkan popup konfirmasi sebelum melanjutkan proses.
   - Setelah dikonfirmasi, sistem menyalin resep kronis yang sama ke Permintaan Obat.
   - Sistem memperbarui nomor resep iter, sisa iter, iterasi berjalan, dan status.

9. **Lifecycle status**
   - Status: **Belum Ditebus**, **Iterasi 1 Diproses**, **Menunggu Iterasi 2**, **Iterasi 2 Diproses**, **Iterasi Selesai**, dan **Penjamin Berubah**.
   - Status diperbarui berdasarkan event dari Permintaan Obat dan Penyerahan Obat.
   - Jika order iter yang sudah masuk Permintaan Obat dibatalkan, status di-roll back menjadi **Belum Ditebus**.

10. **Penjagaan perubahan penjamin**
    - Sistem membandingkan penjamin pada resep/registrasi asal dengan penjamin terkini pada pelayanan atau billing.
    - Apabila berubah, status menjadi **Penjamin Berubah** dan penebusan tidak dapat dilakukan.

11. **Detail Iter Obat**
    - Menampilkan header pasien: no registrasi, no RM, no resep utama, nama, dokter, dan progres iterasi.
    - Menampilkan informasi Iterasi 1 dan Iterasi 2 sesuai jumlah iter.
    - Menampilkan nomor resep iter.
    - Menampilkan section **Resep Awal** dan **Obat yang Diberikan**.
    - Data item: tipe item, nama obat, jenis sediaan, dosis, jumlah, aturan pakai, aturan umum, dan aturan lainnya.
    - Menampilkan informasi kedaluwarsa jika umur data iter telah melewati 120 hari.

### Out Scope

- Perubahan klinis isi resep oleh petugas farmasi pada Dashboard Iter.
- Pembuatan resep baru oleh dokter dari Dashboard Iter.
- Proses detail konfirmasi, pembuatan, dan penyerahan obat; proses mengikuti PRD modul farmasi terkait.
- Penggantian penjamin atau pemulihan status **Penjamin Berubah** dari Dashboard Iter.
- Pengecualian hari libur pada H+24; perhitungan selalu menggunakan hari kalender.
- Print/cetak Dashboard Iter maupun Detail Iter tidak tersedia.
- Pengaturan masa berlaku selain 120 hari tidak tersedia pada fase ini.

## 4. Goals and Metrics

### Tujuan

Menyediakan pengelolaan resep iter BPJS yang otomatis, aman, mudah dipantau, dan terhubung dengan proses farmasi sehingga pasien kronis dapat mengambil obat ulang sesuai jadwal tanpa pembuatan resep baru pada setiap pengambilan.

### Metrik

| Metrik | Target | Sumber |
|---|---|---|
| Pembentukan row setelah Konfirmasi Obat | < 2 detik | NFR-001 |
| Jumlah row per resep utama | Tepat 1 row | BR-005 |
| Waktu pembukaan Dashboard Iter | < 3 detik | NFR-002 |
| Proses Tebus Obat sampai order diterima Permintaan Obat | < 3 detik | NFR-003 |
| Akurasi filtering obat kronis | 100%; tidak ada obat non kronis pada order iter | BR-007 |
| Akurasi tanggal dapat ditebus | 100% sesuai penyerahan terakhir + 24 hari kalender | BR-011 |
| Akurasi deteksi kedaluwarsa | 100% sesuai waktu pembentukan row + 120 hari kalender | BR-016 |
| Duplikasi order akibat klik berulang | 0 order duplikat | NFR-008 |
| Penebusan data kedaluwarsa | 0 transaksi | BR-016–BR-017 |
| Penebusan saat penjamin berubah | 0 transaksi | BR-027–BR-028 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Iter Obat |
|---|---|
| **Pelayanan — Resep / e-Resep** | Sumber program resep, flag kronis per item, jumlah iter, dokter, pasien, dan penjamin asal. |
| **Farmasi — Permintaan dan Konfirmasi Obat** | Trigger pembentukan row saat Konfirmasi Obat dan tujuan order ketika petugas menebus iter. |
| **Farmasi — Pembuatan Obat** | Menjalankan proses penyiapan order iter setelah masuk Permintaan Obat. |
| **Farmasi — Penyerahan Obat** | Trigger perubahan status setelah obat diserahkan serta sumber section Obat yang Diberikan. |
| **Pelayanan / Billing** | Sumber penjamin terkini untuk mendeteksi perubahan penjamin. |
| **Master Data Obat** | Sumber flag/kategori Kronis dan data sediaan obat. |
| **Master Staf** | Sumber data dokter. |

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---|---|---|
| **Petugas Farmasi** | Primary | Membuka dashboard, mencari pasien, memfilter daftar, melihat detail, menebus obat iter, dan memonitor status. |
| **Dokter** | Secondary | Menentukan program kronis dan jumlah iter pada e-Resep. |
| **Petugas Pelayanan/Billing** | Secondary | Perubahan penjamin menjadi input penjagaan status iter. |
| **Apoteker/Penanggung Jawab Farmasi** | Secondary | Melakukan monitoring dan audit kesesuaian resep serta obat yang diberikan. |
| **QA/Auditor Internal** | Tersier | Menelusuri pembentukan row, perubahan status, pembatalan, dan event lifecycle. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. Dokter membuat resep dengan jumlah iter.
2. Farmasi memproses resep utama.
3. Data pasien muncul pada daftar Iter Obat.
4. Petugas membuka Detail Obat untuk melihat Iterasi 1/2, resep awal, dan obat yang diberikan.
5. Monitoring pembentukan row, masa berlaku, pembatalan order, dan keterhubungan status lintas proses masih terbatas.

### B. To-Be (Neurovi v2 — P0)

1. Dokter membuat e-Resep dengan Program **Penyakit Kronis** dan menetapkan Iter 1x atau Iter 2x.
2. e-Resep masuk ke Farmasi.
3. Petugas Farmasi melakukan Konfirmasi Obat.
4. Setelah Konfirmasi Obat berhasil, sistem mencatat Tanggal Konfirmasi Obat dan membentuk satu row Dashboard Iter untuk resep utama tersebut.
5. Sistem hanya membawa item obat kronis dan menetapkan progres awal `0/1` atau `0/2`.
6. Sistem menggunakan Tanggal Konfirmasi Obat sebagai dasar masa berlaku 120 hari.
7. Petugas membuka **Farmasi → Iter Obat**.
8. Dashboard secara default memfilter Tanggal Bisa Ditebus = hari ini, menampilkan filter status, dan mengurutkan data secara ascending.
9. Petugas dapat mengubah range tanggal, status, atau mencari menggunakan nama/no RM.
10. Sistem menghitung Tanggal Bisa Ditebus berdasarkan penyerahan terakhir + 24 hari kalender tanpa pengecualian hari libur.
11. Sebelum tanggal tebus, tombol Tebus Obat disabled.
12. Pada atau setelah tanggal tebus, tombol enabled apabila status, penjamin, dan masa berlaku mengizinkan.
13. Jika umur row >120 hari, tombol Tebus Obat di-hide dan detail menampilkan informasi kedaluwarsa.
14. Petugas memilih Tebus Obat dan mengonfirmasi popup.
15. Sistem membuat order resep iter ke Permintaan Obat dan mengubah status menjadi **Iterasi 1 Diproses** atau **Iterasi 2 Diproses**.
16. Jika order iter dibatalkan dari Permintaan Obat, sistem mengembalikan status menjadi **Belum Ditebus** tanpa mengubah progres iter yang telah selesai.
17. Setelah Penyerahan Obat:
    - Iter 1x → **Iterasi Selesai**.
    - Iter 2x setelah Iterasi 1 → **Menunggu Iterasi 2** dan sistem menghitung tanggal berikutnya.
    - Iter 2x setelah Iterasi 2 → **Iterasi Selesai**.
18. Apabila penjamin berubah sebelum iter selesai, status menjadi **Penjamin Berubah** dan penebusan diblokir.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|---|---|---|
| Entry point | Menu Iter tersedia, alur belum ditegaskan | Farmasi → Iter Obat → Dashboard Iter |
| Pembentukan data | Trigger belum terdefinisi lengkap | Dibentuk saat Konfirmasi Obat berhasil |
| Jumlah row | Belum ditegaskan | Satu resep utama = satu row |
| Informasi konfirmasi | Belum ditampilkan sebagai kolom | Dashboard menampilkan Tanggal Konfirmasi Obat |
| Filter default | Belum terdefinisi | Tanggal Bisa Ditebus = hari ini; bukan Tanggal Konfirmasi Obat |
| Sorting | Belum terdefinisi | Tanggal Bisa Ditebus ascending |
| Filter status | Belum tersedia/terdefinisi | Tersedia pada dashboard |
| Tanggal tebus | Belum konsisten | H+24 hari kalender tanpa pengecualian |
| Masa berlaku | Belum tersedia | Kedaluwarsa setelah >120 hari |
| Pembatalan order | Belum terdefinisi | Rollback ke Belum Ditebus |
| Petugas pada tabel | Tampil pada referensi v1 | Tidak ditampilkan pada Dashboard v2 |
| Print | Belum ditegaskan | Tidak tersedia |

## 7. Main Flow / Mindmap

### Skenario 1 — Entry Point Dashboard Iter

1. Petugas membuka Modul Farmasi.
2. Petugas memilih menu **Iter Obat**.
3. Sistem menampilkan Dashboard Iter Obat.
4. Filter tanggal awal dan akhir otomatis terisi tanggal hari ini.
5. Filter status default adalah **Semua Status**.
6. Sistem menampilkan data yang sesuai dan mengurutkan Tanggal Bisa Ditebus secara ascending.

### Skenario 2 — Pembentukan Satu Row Iter

1. Dokter membuat e-Resep Program Penyakit Kronis dengan Iter 1x atau Iter 2x.
2. e-Resep masuk ke Farmasi.
3. Petugas melakukan Konfirmasi Obat.
4. Setelah konfirmasi berhasil, sistem membuat satu row lifecycle.
5. Jika Iter 1x, progres awal `0/1`.
6. Jika Iter 2x, progres awal `0/2`; sistem tidak membuat dua row.
7. Sistem menyimpan hanya item obat kronis.

### Skenario 3 — Pencarian, Filter, dan Sorting

1. Petugas dapat mengubah range Tanggal Bisa Ditebus.
2. Petugas dapat memilih satu status atau Semua Status.
3. Petugas dapat mencari berdasarkan nama pasien atau nomor RM.
4. Sistem menerapkan seluruh kriteria secara bersamaan.
5. Hasil menampilkan Tanggal Konfirmasi Obat sebagai informasi dan tetap diurutkan berdasarkan Tanggal Bisa Ditebus paling awal.

### Skenario 4 — Tebus Iterasi 1

1. Petugas membuka Detail.
2. Sistem mengevaluasi tanggal hari ini, status, penjamin, dan umur row.
3. Jika hari ini sebelum tanggal tebus, tombol disabled.
4. Jika umur row >120 hari, tombol tidak ditampilkan dan detail menampilkan informasi kedaluwarsa.
5. Jika seluruh kondisi valid, tombol Tebus Obat enabled.
6. Petugas memilih Tebus Obat dan mengonfirmasi popup.
7. Sistem membuat order dan nomor resep iter.
8. Status berubah menjadi **Iterasi 1 Diproses**.

### Skenario 5 — Penyerahan Iterasi 1

1. Farmasi menyelesaikan pembuatan dan penyerahan obat.
2. Penyerahan Obat mengirim event hasil aktual.
3. Sistem mengisi section **Obat yang Diberikan**.
4. Jika total iter 1x, status menjadi **Iterasi Selesai**.
5. Jika total iter 2x, status menjadi **Menunggu Iterasi 2** dan tanggal berikutnya = tanggal penyerahan Iterasi 1 + 24 hari kalender.

### Skenario 6 — Tebus dan Selesaikan Iterasi 2

1. Pada/ setelah tanggal tebus kedua, petugas membuka detail.
2. Sistem mengevaluasi status, penjamin, dan masa berlaku.
3. Jika valid, petugas menebus Iterasi 2.
4. Status menjadi **Iterasi 2 Diproses**.
5. Setelah obat diserahkan, status menjadi **Iterasi Selesai**.

### Skenario 7 — Pembatalan Order Iter

1. Order Iterasi 1 atau Iterasi 2 sudah masuk ke Permintaan Obat.
2. Order dibatalkan melalui proses Permintaan Obat.
3. Modul Permintaan Obat mengirim event pembatalan.
4. Sistem mengembalikan status row menjadi **Belum Ditebus**.
5. Progres iterasi yang telah diserahkan tidak berubah.
6. Nomor order/resep iter yang dibatalkan tetap tersimpan pada audit trail.
7. Petugas dapat menebus ulang apabila tanggal, penjamin, dan masa berlaku masih valid.

### Skenario 8 — Penjamin Berubah

1. Sistem mendeteksi penjamin terkini berbeda dari penjamin resep/registrasi asal.
2. Status menjadi **Penjamin Berubah**.
3. Tombol Tebus Obat disabled walaupun tanggal memenuhi.
4. Detail menampilkan alasan penebusan tidak dapat dilanjutkan.

### Skenario 9 — Obat Racik Non Kronis

1. Resep awal memuat racikan atau item non kronis.
2. Sistem tidak memasukkan item tersebut ke order iter.
3. Detail menampilkan indikator informasi.
4. Saat hover/focus, tooltip menampilkan: **“Obat Non Kronis tidak masuk ke dalam program iterasi.”**

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|---|---|---|
| **BR-001** | Iter hanya dapat dipilih ketika Program Resep = **Penyakit Kronis**. | FR-001 |
| **BR-002** | Nilai jumlah iter hanya Tanpa Iter, Iter 1x, atau Iter 2x. | FR-001 |
| **BR-003** | Resep dengan Tanpa Iter tidak membentuk row Dashboard Iter. | FR-003 |
| **BR-004** | Row Dashboard Iter dibentuk hanya setelah Konfirmasi Obat berhasil, dan waktu keberhasilan tersebut disimpan sebagai Tanggal Konfirmasi Obat. | FR-003 |
| **BR-005** | Satu resep utama hanya dapat memiliki satu row Dashboard Iter, termasuk untuk Iter 2x. | FR-003 |
| **BR-006** | Dashboard hanya menampilkan resep dengan Iter 1x atau Iter 2x. | FR-004 |
| **BR-007** | Hanya item obat dengan flag/kategori Kronis yang disimpan dan disalin ke order iter. | FR-004 |
| **BR-008** | Obat akut, obat tambahan, atau item non kronis tidak boleh masuk ke order iter. | FR-004 |
| **BR-009** | Item/racikan non kronis yang tidak dibawa ke iter menampilkan tooltip informasi. | FR-016 |
| **BR-010** | Status awal adalah **Belum Ditebus** dengan progres `0/1` atau `0/2`. | FR-006 |
| **BR-011** | Tanggal Bisa Ditebus = tanggal penyerahan terakhir + 24 hari kalender. | FR-008 |
| **BR-012** | Tidak terdapat pengecualian hari libur, hari Minggu, atau hari operasional pada H+24. | FR-008 |
| **BR-013** | Tanggal Iterasi 1 dihitung dari penyerahan resep utama. | FR-008 |
| **BR-014** | Tanggal Iterasi 2 dihitung dari penyerahan Iterasi 1. | FR-008 |
| **BR-015** | Jika Hari Ini < Tanggal Bisa Ditebus, tombol Tebus Obat disabled/abu-abu. | FR-009 |
| **BR-016** | Data iter kedaluwarsa apabila Hari Ini > waktu pembentukan row + 120 hari kalender. | FR-009 |
| **BR-017** | Pada data kedaluwarsa, tombol Tebus Obat di-hide dan detail menampilkan informasi telah melewati 120 hari. | FR-009 |
| **BR-018** | Jika tidak kedaluwarsa dan Hari Ini >= Tanggal Bisa Ditebus, tombol dapat enabled hanya jika status dan penjamin valid. | FR-009 |
| **BR-019** | Aksi Tebus Obat hanya berlaku pada status **Belum Ditebus** atau **Menunggu Iterasi 2**. | FR-009 |
| **BR-020** | Klik Tebus Obat wajib menampilkan popup konfirmasi. | FR-010 |
| **BR-021** | Setelah konfirmasi, sistem memasukkan order resep berisi item kronis ke Permintaan Obat. | FR-011 |
| **BR-022** | Setelah order Iterasi 1 berhasil dibuat, status menjadi **Iterasi 1 Diproses**. | FR-012 |
| **BR-023** | Setelah Iterasi 1 diserahkan dan total iter = 1, status menjadi **Iterasi Selesai**. | FR-013 |
| **BR-024** | Setelah Iterasi 1 diserahkan dan total iter = 2, status menjadi **Menunggu Iterasi 2**. | FR-013 |
| **BR-025** | Setelah order Iterasi 2 berhasil dibuat, status menjadi **Iterasi 2 Diproses**. | FR-012 |
| **BR-026** | Setelah Iterasi 2 diserahkan, status menjadi **Iterasi Selesai**. | FR-013 |
| **BR-027** | Section Obat yang Diberikan bersumber dari data aktual Penyerahan Obat. | FR-007; FR-013 |
| **BR-028** | Jika penjamin terkini berbeda dari penjamin resep/registrasi asal, status menjadi **Penjamin Berubah**. | FR-014 |
| **BR-029** | Status Penjamin Berubah memblokir Tebus Obat. | FR-014 |
| **BR-030** | Pencarian menerima nama pasien atau nomor RM. | FR-005 |
| **BR-031** | Filter tanggal menggunakan Tanggal Bisa Ditebus, bukan Tanggal Konfirmasi Obat. | FR-005 |
| **BR-032** | Default tanggal awal dan akhir adalah tanggal hari ini. | FR-005 |
| **BR-033** | Dashboard menyediakan filter Semua Status atau satu status tertentu. | FR-005 |
| **BR-034** | Hasil dashboard diurutkan berdasarkan Tanggal Bisa Ditebus secara ascending. | FR-005 |
| **BR-035** | Dashboard menampilkan Tanggal Konfirmasi Obat sebagai informasi read-only. | FR-005 |
| **BR-036** | Setiap iterasi menyimpan nomor resep iter, Resep Awal, dan Obat yang Diberikan. | FR-007 |
| **BR-037** | Jika order iter dibatalkan, status di-roll back menjadi **Belum Ditebus** tanpa mengurangi progres yang telah diserahkan. | FR-015 |
| **BR-038** | Dashboard dan Detail Iter tidak menyediakan aksi print/cetak. | Out Scope |
| **BR-039** | Proses Tebus Obat harus idempotent agar retry/double click tidak membuat order ganda. | NFR-008 |
| **BR-040** | Perubahan status hanya dilakukan setelah event proses berhasil; kegagalan membuat order tidak boleh mengubah status menjadi Diproses. | NFR-007 |

## 9. State Machine

### 9.1 Definisi Status

| Status | Encoding Visual | Makna | Tebus Obat |
|---|---|---|---|
| **Belum Ditebus** | Badge netral/abu-abu | Iterasi berikutnya belum masuk Permintaan Obat; dapat memiliki progres `0/x` atau `1/2` setelah rollback. | Enabled/disabled sesuai tanggal, penjamin, dan masa berlaku |
| **Iterasi 1 Diproses** | Badge biru | Order Iterasi 1 sudah masuk Permintaan Obat dan belum selesai diserahkan. | Disabled |
| **Menunggu Iterasi 2** | Badge kuning/amber | Iterasi 1 telah diserahkan dan menunggu tanggal Iterasi 2. | Enabled/disabled sesuai tanggal, penjamin, dan masa berlaku |
| **Iterasi 2 Diproses** | Badge biru tua | Order Iterasi 2 sudah masuk proses farmasi. | Disabled |
| **Iterasi Selesai** | Badge hijau | Seluruh hak iter telah diserahkan. | Disabled; terminal |
| **Penjamin Berubah** | Badge merah | Penjamin terkini berbeda dari penjamin resep/registrasi asal. | Disabled; blocking |

### 9.2 Transisi Normal

```text
Iter 1x:
Belum Ditebus
  -> konfirmasi Tebus Iterasi 1
Iterasi 1 Diproses
  -> Penyerahan Obat berhasil
Iterasi Selesai

Iter 2x:
Belum Ditebus
  -> konfirmasi Tebus Iterasi 1
Iterasi 1 Diproses
  -> Penyerahan Obat Iterasi 1 berhasil
Menunggu Iterasi 2
  -> konfirmasi Tebus Iterasi 2
Iterasi 2 Diproses
  -> Penyerahan Obat Iterasi 2 berhasil
Iterasi Selesai
```

### 9.3 Transisi Pembatalan

```text
Iterasi 1 Diproses
  -> order Iterasi 1 dibatalkan
Belum Ditebus (progres tetap 0/1 atau 0/2)

Iterasi 2 Diproses
  -> order Iterasi 2 dibatalkan
Belum Ditebus (progres tetap 1/2)
```

### 9.4 Kondisi Turunan Kedaluwarsa

Kedaluwarsa bukan status lifecycle baru. Kondisi dihitung dari `Hari Ini > iteration_created_at + 120 hari kalender`.

- Status lifecycle tetap ditampilkan.
- Detail menampilkan banner kedaluwarsa.
- Tombol Tebus Obat tidak dirender/di-hide.
- Data tetap tersedia untuk kebutuhan riwayat dan audit.

### 9.5 Perubahan Progres Iterasi

| Event | Iter 1x | Iter 2x |
|---|---|---|
| Row terbentuk saat Konfirmasi Obat | 0/1 | 0/2 |
| Order Iterasi 1 dibatalkan | 0/1 | 0/2 |
| Iterasi 1 diserahkan | 1/1 | 1/2 |
| Order Iterasi 2 dibatalkan | — | 1/2 |
| Iterasi 2 diserahkan | — | 2/2 |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|---|---|---|
| **FR-001** | **Konfigurasi Iter pada e-Resep** — Sistem menyediakan Tanpa Iter, Iter 1x, dan Iter 2x ketika Program Resep = Penyakit Kronis. | US-001; BR-001–BR-003 |
| **FR-002** | **Entry Point Iter Obat** — Sistem menyediakan menu Iter Obat pada Modul Farmasi yang membuka Dashboard Iter Obat. | US-002 |
| **FR-003** | **Pembentukan Satu Row Lifecycle** — Sistem membentuk satu row per resep utama setelah Konfirmasi Obat berhasil, dengan progres awal sesuai total iter. | US-003; BR-004–BR-005; BR-010 |
| **FR-004** | **Filtering Obat Kronis** — Sistem hanya menyimpan dan menyalin item kronis ke setiap order iter. | US-003; BR-006–BR-009 |
| **FR-005** | **Dashboard, Filter, Search, dan Sorting** — Sistem menampilkan Tanggal Konfirmasi Obat, default filter Tanggal Bisa Ditebus = hari ini, filter status, pencarian nama/no RM, dan sorting Tanggal Bisa Ditebus ascending. | US-004; BR-030–BR-035 |
| **FR-006** | **Status dan Progres Iter** — Sistem menampilkan badge status dan progres `x/y` pada satu row lifecycle. | US-004; BR-010; State Machine |
| **FR-007** | **Detail Iter** — Sistem menampilkan header, informasi tiap iterasi, Resep Awal, Obat yang Diberikan, dan informasi kedaluwarsa. | US-005; BR-017; BR-027; BR-036 |
| **FR-008** | **Perhitungan Tanggal Tebus** — Sistem menghitung tanggal dari penyerahan terakhir + 24 hari kalender tanpa pengecualian hari libur. | US-006; BR-011–BR-014 |
| **FR-009** | **Kontrol Tebus dan Kedaluwarsa** — Sistem mengatur disabled/enabled/hide berdasarkan tanggal, status, penjamin, dan umur row 120 hari. | US-006; BR-015–BR-019; BR-029 |
| **FR-010** | **Konfirmasi Penebusan** — Sistem menampilkan popup konfirmasi sebelum membuat order. | US-007; BR-020 |
| **FR-011** | **Pembuatan Order Iter** — Sistem menyalin item kronis ke Permintaan Obat secara atomik dan idempotent. | US-007; BR-021; BR-039–BR-040 |
| **FR-012** | **Update Status saat Order Dibuat** — Status menjadi Iterasi 1 Diproses atau Iterasi 2 Diproses setelah order berhasil. | US-007; BR-022; BR-025 |
| **FR-013** | **Update dari Penyerahan Obat** — Sistem memperbarui progres, status, tanggal berikutnya, dan Obat yang Diberikan. | US-008; BR-023–BR-027 |
| **FR-014** | **Deteksi Penjamin Berubah** — Sistem membandingkan penjamin asal dengan penjamin terkini dan memblokir penebusan bila berbeda. | US-009; BR-028–BR-029 |
| **FR-015** | **Rollback Pembatalan Order** — Sistem mengembalikan status menjadi **Belum Ditebus** ketika order iter dibatalkan tanpa mengubah progres yang telah selesai. | US-010; BR-037 |
| **FR-016** | **Tooltip Item Non Kronis** — UI menampilkan tooltip pada item/racikan non kronis yang tidak masuk program iter. | US-011; BR-009 |
| **FR-017** | **Audit Trail Lifecycle** — Sistem merekam pembentukan row, penebusan, pembatalan, penyerahan, perubahan status, perubahan penjamin, dan kegagalan integrasi. | US-012; NFR-006 |

## 11. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|---|---|---|---|
| **US-001** | Sebagai **dokter**, saya ingin menentukan jumlah iter pada resep kronis, sehingga pasien dapat mengambil obat ulang sesuai hak iter. | Given Program Penyakit Kronis, When form dibuka, Then pilihan Tanpa Iter/1x/2x tersedia. | FR-001 |
| **US-002** | Sebagai **petugas farmasi**, saya ingin membuka Dashboard Iter dari Modul Farmasi, sehingga fitur mudah ditemukan. | Given user berada pada Modul Farmasi, When menu Iter Obat dipilih, Then Dashboard Iter ditampilkan. | FR-002 |
| **US-003** | Sebagai **petugas farmasi**, saya ingin row iter terbentuk saat Konfirmasi Obat dan hanya membawa obat kronis, sehingga lifecycle tidak perlu dibuat manual. | Given resep Iter 2x dikonfirmasi, When konfirmasi berhasil, Then satu row `0/2` terbentuk dan hanya item kronis tersimpan. | FR-003–FR-004 |
| **US-004** | Sebagai **petugas farmasi**, saya ingin melihat Tanggal Konfirmasi Obat serta memfilter dan mencari daftar berdasarkan Tanggal Bisa Ditebus, sehingga pasien dapat ditemukan dan riwayat pembentukan row dapat dipahami. | Given dashboard dibuka, Then Tanggal Konfirmasi Obat tampil dan filter Tanggal Bisa Ditebus default hari ini; When status/range/search diterapkan, Then hasil sesuai dan terurut ascending. | FR-005–FR-006 |
| **US-005** | Sebagai **petugas farmasi**, saya ingin melihat detail resep dan informasi kedaluwarsa, sehingga saya memahami kondisi hak iter. | Given row dipilih, When Detail dibuka, Then header, progres, resep awal, obat diberikan, dan banner kedaluwarsa bila relevan ditampilkan. | FR-007 |
| **US-006** | Sebagai **petugas farmasi**, saya ingin aksi tebus mengikuti H+24 dan masa berlaku, sehingga obat tidak ditebus terlalu cepat atau setelah kedaluwarsa. | Given sebelum H+24, Then tombol disabled; Given umur row >120 hari, Then tombol tidak tampil; Given valid, Then tombol enabled. | FR-008–FR-009 |
| **US-007** | Sebagai **petugas farmasi**, saya ingin menebus iter dari detail, sehingga order otomatis masuk ke Permintaan Obat. | Given tombol enabled, When konfirmasi disetujui, Then satu order kronis dibuat dan status menjadi Diproses. | FR-010–FR-012 |
| **US-008** | Sebagai **petugas farmasi**, saya ingin status dan obat aktual diperbarui setelah penyerahan, sehingga lifecycle tetap akurat. | Given order diserahkan, When event diterima, Then progres/status/tanggal berikutnya dan Obat yang Diberikan diperbarui. | FR-013 |
| **US-009** | Sebagai **petugas farmasi**, saya ingin sistem memblokir iter ketika penjamin berubah, sehingga transaksi tidak dilanjutkan dengan penjamin yang tidak sesuai. | Given penjamin asal berbeda dari penjamin terkini, Then status Penjamin Berubah dan tombol disabled. | FR-014 |
| **US-010** | Sebagai **petugas farmasi**, saya ingin status kembali Belum Ditebus setelah order dibatalkan, sehingga iter dapat diproses ulang. | Given order iter berstatus Diproses, When order dibatalkan, Then status kembali Belum Ditebus dan progres selesai tidak berubah. | FR-015 |
| **US-011** | Sebagai **petugas farmasi**, saya ingin mengetahui item non kronis yang tidak ikut iter, sehingga tidak terjadi salah persepsi. | Given terdapat item non kronis, When ikon info di-hover/focus, Then tooltip informasi tampil. | FR-016 |
| **US-012** | Sebagai **QA/auditor**, saya ingin melihat jejak lifecycle, sehingga pembentukan, pembatalan, dan perubahan status dapat ditelusuri. | Given terjadi event lifecycle, When audit diperiksa, Then actor, waktu, before/after, result, dan correlation ID tersedia. | FR-017; NFR-006 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi pasien, registrasi, penjamin, dokter, resep, dan obat **reuse definisi kanonik dari modul sumber** — nama, tipe, format, dan validasi harus sama.

### 12.1 Data Dibuat Otomatis — Lifecycle Iter (FR-003, FR-008, FR-011)

| Field | Label | Tipe | Format/Sumber | Catatan |
|---|---|---|---|---|
| `iteration_id` | ID Iter | UUID | Dibuat sistem | Primary identifier |
| `main_prescription_id` | ID Resep Utama | UUID | Resep Pelayanan/Farmasi | Unique: satu resep utama satu row |
| `main_prescription_number` | No Resep | string | Nomor resep utama | Kolom dashboard |
| `sep_number` | No SEP | string | Registrasi BPJS | Kolom dashboard |
| `registration_id` | No Registrasi | string | Registrasi | Header detail |
| `medical_record_number` | No RM | string | Master Pasien | Search dan dashboard |
| `patient_name` | Nama | string | Master Pasien | Dashboard/detail |
| `doctor_id` | Dokter | UUID | Resep utama | Referensi dokter |
| `total_iteration` | Total Iter | integer | 1 atau 2 | Denominator progres |
| `completed_iteration` | Iter Selesai | integer | Default 0 | Numerator progres |
| `current_iteration` | Iterasi Berikutnya/Berjalan | integer | 1 atau 2 | Ditentukan dari progres |
| `medicine_confirmation_at` | Tanggal Konfirmasi Obat | datetime | Waktu Konfirmasi Obat berhasil | Ditampilkan di dashboard dan menjadi dasar masa berlaku 120 hari |
| `redeem_expired_at` | Batas Masa Tebus | datetime/date | `medicine_confirmation_at + 120 hari` | Tepat 120 hari belum kedaluwarsa; >120 hari kedaluwarsa |
| `is_expired` | Kedaluwarsa | boolean/derived | `Hari Ini > redeem_expired_at` | Mengontrol hide tombol |
| `last_dispensed_at` | Terakhir Diserahkan | datetime | Event Penyerahan Obat | Basis H+24 |
| `eligible_redeem_date` | Tanggal Bisa Ditebus | date | `last_dispensed_at + 24 hari kalender` | Dasar filter, sort, dan tombol |
| `iteration_status` | Status | enum | State Machine | Status dashboard |
| `iteration_prescription_number` | No Resep Iterasi | string nullable | Dibuat ketika Tebus Obat | Disimpan per iterasi |
| `created_at` | Dibuat Pada | datetime | Sistem | Audit teknis |
| `updated_at` | Diperbarui Pada | datetime | Sistem | Audit teknis |
| `version` | Versi Data | integer | Optimistic locking | Mencegah overwrite/duplikasi |
| `correlation_id` | Correlation ID | string | Setiap proses tebus/event | Trace lintas modul |

### 12.2 Layar TAMPIL — Dashboard Iter Obat (FR-005–FR-006)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| No Resep | `main_prescription_number` | Text/monospace | — | Resep utama |
| No SEP | `sep_number` | Text/monospace | — | BPJS |
| No RM | `medical_record_number` | Text/monospace | Search | Kriteria pencarian |
| Nama | `patient_name` | Text tebal | Search | Kriteria pencarian |
| Dokter | Relasi `doctor_id` | Text | — | Dokter peresep |
| Tanggal Konfirmasi Obat | `medicine_confirmation_at` | `dd MMM yyyy HH:mm` | Tidak difilter | Informasi waktu pembentukan row |
| Iterasi | `completed_iteration / total_iteration` | `0/1`, `0/2`, `1/2`, dst. | — | Satu row lifecycle |
| Tanggal Bisa Ditebus | `eligible_redeem_date` | `dd MMM yyyy` | Filter range; sort ASC | Default filter hari ini |
| Status | `iteration_status` | Badge | Filter status | Enam status |
| Aksi | `iteration_id` | Button Detail | — | Tidak ada aksi print |

**Filter:**

| Field | Label | Tipe | Wajib | Validasi/Format | Default | Catatan |
|---|---|---|---|---|---|---|
| `date_from` | Dari Tanggal Bisa Ditebus | date | Ya | `<= date_to` | Hari ini | Dasar filter |
| `date_to` | Sampai Tanggal Bisa Ditebus | date | Ya | `>= date_from` | Hari ini | Dasar filter |
| `status` | Status | dropdown | Tidak | Semua Status atau satu status | Semua Status | Dapat dikombinasikan dengan filter lain |
| `keyword` | Cari Nama atau No RM | search text | Tidak | Trim; case-insensitive | Kosong | Search nama/no RM |

**Default query dan sorting:**
- Filter tanggal tetap menggunakan `eligible_redeem_date`, bukan `medicine_confirmation_at`.
- `eligible_redeem_date = Hari Ini`
- `ORDER BY eligible_redeem_date ASC`
- Jika tanggal sama, secondary sort menggunakan No Resep ascending untuk hasil yang konsisten.

### 12.3 Layar TAMPIL — Detail Iter (FR-007)

#### A. Header Pasien

| Field | Sumber | Format | Catatan |
|---|---|---|---|
| No Registrasi | Registrasi | Text | Referensi kunjungan utama |
| No RM | Pasien | Text | — |
| No Resep Utama | Resep utama | Text | — |
| Nama | Pasien | Text tebal | — |
| Dokter | Resep utama | Text | — |
| Iterasi | Lifecycle | `x/y` | Progres |
| Penjamin | Resep/registrasi asal dan data terkini | Text/badge | Tampilkan perubahan bila berbeda |
| Status | Lifecycle | Badge | State aktif |
| Tanggal Bisa Ditebus | Lifecycle | `dd MMM yyyy` | Dasar tombol |
| Tanggal Konfirmasi Obat | Lifecycle | `dd MMM yyyy HH:mm` | Waktu row terbentuk |
| Masa Berlaku | Lifecycle | Tanggal batas/label Kedaluwarsa | Berdasarkan 120 hari |
| Tebus Obat | Derived | Primary/disabled/hidden | Hidden jika kedaluwarsa |

#### B. Informasi per Iterasi

| Field | Sumber | Format | Catatan |
|---|---|---|---|
| Nomor Iterasi | Lifecycle | Iterasi 1 / Iterasi 2 | Hanya sesuai total iter |
| No Resep Iterasi | Order iter | Text atau `-` | Dibuat saat tebus |
| Status Iterasi | Lifecycle | Badge | Status per tahap |
| Tanggal Ditebus | Event tebus | `dd MMM yyyy HH:mm` | Waktu order dibuat |
| Tanggal Diserahkan | Penyerahan Obat | `dd MMM yyyy HH:mm` | Jika sudah diserahkan |
| Informasi hasil | Lifecycle | Success/info/warning banner | Termasuk informasi >120 hari |

#### C. Section Resep Awal dan Obat yang Diberikan

| Kolom | Sumber Data | Format Tampilan | Catatan |
|---|---|---|---|
| Tipe Item | Resep/penyerahan | Badge Non Racik/Racik | — |
| Nama Obat | Master/snapshot item | Text + badge Kronis | Item non kronis tidak disalin |
| Jenis Sediaan | Master/snapshot | Text | — |
| Dosis | Resep/penyerahan | Text | — |
| Jumlah | Resep/penyerahan | Angka + satuan | Resep awal dapat berbeda dari aktual |
| Aturan Pakai | Resep/penyerahan | Text | — |
| Aturan Umum | Resep/penyerahan | Text/`-` | — |
| Aturan Lainnya | Resep/penyerahan | Text/`-` | — |

### 12.4 Audit Trail (FR-017)

| Field | Tipe | Sumber | Catatan |
|---|---|---|---|
| `event_type` | enum/string | Sistem | ROW_CREATED, REDEEM_REQUESTED, ORDER_CREATED, ORDER_CANCELLED, DISPENSED, STATUS_CHANGED, GUARANTOR_CHANGED |
| `iteration_id` | UUID | Lifecycle | — |
| `iteration_no` | integer nullable | Lifecycle | 1/2 |
| `actor_id` | UUID/system | Auth/service | Audit internal; tidak ditampilkan pada dashboard |
| `actor_role` | string | Auth | — |
| `occurred_at` | datetime | Sistem | — |
| `before_data` | JSON | Sistem | Snapshot sebelum |
| `after_data` | JSON | Sistem | Snapshot sesudah |
| `correlation_id` | string | Request/event | Trace lintas modul |
| `source_module` | string | Sistem | Resep/Konfirmasi/Permintaan/Penyerahan/Billing |
| `result` | enum | Sistem | SUCCESS/FAILED |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|---|---|---|---|
| **NFR-001** | Performa | Row Dashboard Iter beserta Tanggal Konfirmasi Obat terbentuk < 2 detik setelah Konfirmasi Obat berhasil. | Metrik |
| **NFR-002** | Performa | Dashboard tampil < 3 detik untuk page awal pada volume operasional rumah sakit. | Metrik |
| **NFR-003** | Performa | Tebus Obat sampai respons order diterima < 3 detik. | Metrik |
| **NFR-004** | Akurasi | Filtering obat kronis, H+24, dan masa berlaku 120 hari harus 100% sesuai rule. | BR-007; BR-011; BR-016 |
| **NFR-005** | Real-Time | Perubahan status dari Permintaan/Penyerahan Obat tampil tanpa refresh manual atau paling lambat [PERLU KONFIRMASI] detik. | Bispro Iter |
| **NFR-006** | Auditabilitas | Pembentukan row, penebusan, pembatalan, penyerahan, penjamin, dan perubahan status memiliki audit trail lengkap. | FR-017 |
| **NFR-007** | Konsistensi | Pembuatan order, rollback pembatalan, dan perubahan status dilakukan atomik tanpa menghasilkan state parsial. | BR-037; BR-040 |
| **NFR-008** | Reliabilitas | Endpoint Tebus Obat idempotent; double click, retry, atau timeout tidak membuat order ganda. | BR-039 |
| **NFR-009** | Keamanan/RBAC | Hanya role Farmasi berwenang yang dapat mengeksekusi Tebus Obat. | Persona |
| **NFR-010** | Usability | Tombol disabled memiliki alasan yang dapat dibaca; tombol kedaluwarsa di-hide dan diganti informasi pada detail. | FR-009 |
| **NFR-011** | Aksesibilitas | Badge tidak hanya dibedakan dengan warna; tooltip mendukung keyboard/focus. | UI requirement |
| **NFR-012** | Responsivitas | Dashboard dan detail dapat digunakan pada desktop minimal 1280 px dan menyediakan horizontal scroll pada viewport kecil. | Referensi UI |
| **NFR-013** | Observabilitas | Kegagalan Konfirmasi Obat, Permintaan Obat, Penyerahan Obat, atau pengecekan penjamin dicatat dengan correlation ID. | Dependency |
| **NFR-014** | Privasi | Data pasien hanya ditampilkan kepada pengguna terautentikasi sesuai hak akses dan kebijakan rumah sakit. | Domain SIMRS |

## 14. Integrasi Eksternal & Dependency

### A. Integrasi Internal

| Integrasi | Fungsi di modul ini | Status | Trace |
|---|---|---|---|
| **Pelayanan — Resep** | Sumber resep utama, program kronis, jumlah iter, item, dokter, pasien, dan penjamin asal. | Internal | FR-001; FR-003–FR-004 |
| **Farmasi — Konfirmasi Obat** | Trigger pembentukan satu row lifecycle setelah konfirmasi berhasil. | Internal — Hard | FR-003 |
| **Farmasi — Permintaan Obat** | Tujuan order iter dan sumber event pembatalan order. | Internal — Hard | FR-011; FR-015 |
| **Farmasi — Penyerahan Obat** | Sumber event penyerahan dan data aktual obat diberikan. | Internal — Hard | FR-013 |
| **Pelayanan/Billing** | Sumber penjamin terkini. | Internal — Hard | FR-014 |
| **Master Data Obat** | Sumber flag Kronis, sediaan, dan identitas obat. | Internal — Hard | FR-004 |

### B. Dependency dan Dampak

| Dependency | Tipe | Dampak Jika Belum Siap |
|---|---|---|
| Event Konfirmasi Obat berhasil | Hard | Row Dashboard Iter tidak dapat dibentuk pada waktu yang benar. |
| Unique constraint resep utama | Hard | Risiko terbentuk lebih dari satu row untuk resep yang sama. |
| Kontrak Permintaan Obat | Hard | Tebus Obat dan rollback pembatalan tidak dapat berjalan. |
| Kontrak Penyerahan Obat | Hard | Progres, status selesai, tanggal berikutnya, dan Obat yang Diberikan tidak terbarui. |
| Flag Kronis Master Data Obat | Hard | Risiko obat non kronis ikut iter. |
| Data penjamin pelayanan/billing | Hard | Status Penjamin Berubah tidak dapat ditentukan. |
| Sinkronisasi waktu/timezone rumah sakit | Hard | Risiko perbedaan H+24 dan masa berlaku 120 hari. |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|---|---|---|
| **D-01** | Entry point | Modul Farmasi → Iter Obat → Dashboard Iter Obat. |
| **D-02** | Trigger pembentukan row | Saat Konfirmasi Obat berhasil; waktu keberhasilan disimpan sebagai Tanggal Konfirmasi Obat. |
| **D-03** | Jumlah row | Satu resep utama hanya membentuk satu row, termasuk Iter 2x. |
| **D-04** | Kolom petugas | Data petugas tidak ditampilkan dan tidak menjadi atribut lifecycle Dashboard Iter. |
| **D-05** | Pembandingan penjamin | Menggunakan penjamin resep/registrasi asal dan penjamin terkini tanpa membuat atribut snapshot penjamin pada lifecycle Iter. |
| **D-06** | Filter default | Tanggal Bisa Ditebus dari dan sampai = hari ini; Tanggal Konfirmasi Obat hanya informasi. |
| **D-07** | Filter tambahan | Dashboard menyediakan filter status. |
| **D-08** | Sorting | Tanggal Bisa Ditebus ascending. |
| **D-09** | H+24 | Menggunakan 24 hari kalender tanpa pengecualian hari libur. |
| **D-10** | Kedaluwarsa | Umur row >120 hari: tombol Tebus di-hide dan detail menampilkan informasi. |
| **D-11** | Pembatalan order | Order iter yang dibatalkan di Permintaan Obat me-roll back status menjadi **Belum Ditebus** tanpa mengubah progres yang sudah diserahkan. |
| **D-12** | Print | Dashboard dan Detail Iter tidak menyediakan print/cetak. |


## 16. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|---|---|---|---|
| 2.3 Draft | 19 Juli 2026 | Team Product — Tamtech International | Menambahkan kolom Tanggal Konfirmasi Obat pada dashboard dan menegaskan filter tanggal tetap berdasarkan Tanggal Bisa Ditebus dengan default hari ini; pembatalan order tetap rollback ke Belum Ditebus. |
| 2.2 Draft | 19 Juli 2026 | Team Product — Tamtech International | Menambahkan entry point, trigger row saat Konfirmasi Obat, satu row per resep, masa berlaku 120 hari, filter status, default tanggal hari ini, sorting ascending, rollback pembatalan, penghapusan kolom Petugas/field penjamin snapshot, serta menegaskan tidak tersedianya print/cetak. |
| 2.1 Draft | 19 Juli 2026 | Team Product — Tamtech International | Menghapus bagian penyesuaian aturan pakai beserta seluruh requirement, integrasi, data, risiko, dan visualisasi terkait. |
| 2.0 Draft | 19 Juli 2026 | Team Product — Tamtech International | Penyusunan awal PRD Iter Obat Neurovi v2 berdasarkan bisnis proses, catatan tambahan, dan referensi UI v1. |
