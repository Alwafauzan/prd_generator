# PRD — Input Hasil Pemeriksaan Radiologi

**Related Document:** Bispro Input Hasil Pemeriksaan Radiologi; PRD Order Radiologi Neurovi v2; **PRD Konfirmasi Order Radiologi Neurovi v2 (hard dependency nomor order turunan/suffix)**; Master Data Radiologi; Master Data LOINC; Referensi tampilan Neurovi v1  
**Dokumen ID:** PRD-RAD-HASIL-v2.0 · **Versi:** 1.3 (Draft — resolved requirement role, imaging manual, LOINC pasca-final, PACS accession number, dan nomor order turunan)  
**Tanggal Disusun:** 21 Juli 2026 · **Tanggal Revisi:** 22 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]  
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Fitur **Input Hasil Pemeriksaan Radiologi** merupakan halaman kerja per item pemeriksaan pada Dashboard Radiologi. Satu order yang memiliki beberapa item pemeriksaan akan dibentuk menjadi beberapa baris, sehingga imaging, kode LOINC, hasil, kesan, dokter radiologi, catatan, status, dan finalisasi dapat dikelola secara independen pada masing-masing item.

Form hanya menampilkan item yang dipilih dari dashboard dan tidak menyediakan tombol **Tambah Hasil Pemeriksaan**. Saat user membuka fitur dari suatu baris dashboard, sistem wajib membawa konteks `order_item_id` dari baris tersebut. Nama pemeriksaan kemudian terisi otomatis berdasarkan item pada baris yang dipilih, ditampilkan sebagai satu identitas read-only yang merupakan kombinasi **nama pemeriksaan + teknik pemindaian + posisi/proyeksi pemeriksaan + sisi tubuh (laterality) + penggunaan zat kontras**. User tidak dapat memilih atau mengganti pemeriksaan lain dari dalam form.

Pada bagian atas form terdapat **header pasien** yang menampilkan **Nama Pasien beserta Status Pasien, Jenis Kelamin, No. RM, Tanggal Lahir beserta Umur, dan Alamat**. Istilah **Status Pasien** pada dokumen ini berarti sapaan/gelar pasien seperti **Ny., Tn., Sdr., Nn., An., dan nilai lain yang tersedia pada data pasien**, bukan status aktif/nonaktif, status episode, atau status pelayanan. Seluruh informasi header bersifat read-only dan menggunakan data kanonik pasien yang terhubung dengan item pemeriksaan terpilih.

Hak akses pada form dibedakan berdasarkan role:

- **Radiografer** dapat mengubah kode LOINC termasuk setelah item **Selesai**, mengunggah/menghapus/mengganti imaging manual, menekan **Cek Hasil PACS**, dan menggunakan checkbox **Tandai Selesai**.
- **Dokter Radiologi** dapat mengisi atau mengubah Hasil Pemeriksaan dan Kesan, menekan **Cek Hasil PACS**, serta menggunakan checkbox **Tandai Selesai**.
- **User selain Dokter Radiologi dan Radiografer** hanya dapat melihat seluruh data secara read-only, tetapi tetap dapat menekan **Cek Hasil PACS**.

Field **Dokter Radiologi** bersumber dari dokter yang dipilih ketika konfirmasi item pemeriksaan dan selalu read-only. Field **Catatan Pemeriksaan** bersumber dari catatan pada item order pemeriksaan, disimpan sebagai tipe data **TEXT**, dan selalu read-only. Field **Kode LOINC** terdiri dari satu dropdown dengan format opsi **kode — deskripsi**, memiliki default berdasarkan mapping Master Data Radiologi, dapat diubah oleh Radiografer termasuk setelah item berstatus **Selesai**, dan mengambil pilihan dari Master Data LOINC. Field **Hasil Pemeriksaan** dan **Kesan** juga disimpan sebagai tipe data **TEXT**.

Status operasional item menggunakan **Sedang Diproses**, **Menunggu Expertise**, dan **Selesai**. Checkbox **Tandai Selesai** memiliki arti finalisasi yang sama ketika digunakan oleh Radiografer maupun Dokter Radiologi. Status dokumen hasil yang belum final tetap disimpan sebagai draft internal, tetapi tidak digunakan sebagai status utama dashboard. Finalisasi dan ketersediaan imaging harus diproses pada level item agar tidak memengaruhi item lain dalam order yang sama. Radiografer dapat mengunggah, menghapus, atau mengganti imaging manual berformat **JPG, PNG, atau BMP** dengan ukuran maksimum **10 MB per file**.

Nomor order yang digunakan pada baris hasil mengikuti **nomor order turunan** dari proses Konfirmasi Order Radiologi. Nomor turunan dibentuk menggunakan pola **NomorOrderInduk-Suffix** (contoh `202607220001-1`), berelasi ke nomor order induk melalui `parent_order_number`, dan setiap item hasil tetap dibuka menggunakan identifier detail/item yang spesifik. Pengecekan imaging ke Orthanc/PACS menggunakan **accession number** milik order turunan yang terkait.

> Referensi: Bispro Input Hasil Pemeriksaan Radiologi, PRD Konfirmasi Order Radiologi, tampilan Neurovi v1, dan hasil konfirmasi stakeholder tanggal 22 Juli 2026.

## 2. Background

### Kondisi saat ini (As-Is, Neurovi v1)

- Satu order dapat menampilkan beberapa pemeriksaan dalam satu halaman hasil.
- Nama item masih berbentuk dropdown dan item lain dapat ditambahkan melalui tombol **Tambah Hasil Pemeriksaan**.
- Kode terminologi ditampilkan dalam dua field terpisah, yaitu kode dan nama/deskripsi.
- Dokter radiologi dan catatan tampil bersama form, tetapi sumber data serta aturan edit belum ditegaskan.
- Hak edit antar-role belum dibedakan secara eksplisit.
- Upload imaging dilakukan secara manual dan belum tersedia mekanisme yang konsisten untuk melakukan pengecekan ulang ke PACS/Orthanc.
- Status hasil cenderung berorientasi pada Draft/Selesai, belum membedakan status operasional **Sedang Diproses** dan **Menunggu Expertise**.

### Masalah / pain point

- **Aspek bisnis proses:** kewenangan Radiografer, Dokter Radiologi, dan user lain belum terpisah secara tegas sehingga berisiko terjadi perubahan data di luar kewenangan.
- **Aspek UX:** dua field terminologi meningkatkan beban visual dan berpotensi menghasilkan kombinasi kode/deskripsi yang tidak konsisten.
- **Aspek logic system:** status hasil, status imaging, dan finalisasi dapat berubah pada waktu berbeda; sistem membutuhkan aturan transisi yang aman terhadap keterlambatan upload manual maupun Orthanc.
- **Aspek data:** nama pemeriksaan yang dapat dipilih ulang dari dropdown berisiko tidak lagi merepresentasikan item order yang sebenarnya. Identitas hasil juga harus konsisten dengan nomor order turunan yang dibentuk pada proses konfirmasi.
- **Aspek integrasi:** pencarian imaging ke Orthanc/PACS memerlukan identifier tunggal yang konsisten, yaitu accession number dari order turunan.
- **Aspek audit:** dokter dan catatan yang berasal dari proses sebelumnya harus dipertahankan sebagai data sumber read-only; perubahan LOINC dan imaging manual setelah finalisasi juga harus dapat ditelusuri.

### Dampak utama yang disasar v2

- Mencegah user mengubah field yang tidak menjadi kewenangannya.
- Memastikan kode LOINC tersimpan konsisten dari satu dropdown terkontrol.
- Memastikan identitas pemeriksaan tidak dapat diganti dari form hasil.
- Menyediakan mekanisme pengecekan PACS/Orthanc untuk seluruh user tanpa memberikan hak edit tambahan.
- Mengelola status berdasarkan aktivitas input, ketersediaan imaging, dan finalisasi secara independen per item.
- Menjaga traceability dari nomor order induk ke nomor order turunan/suffix dan item hasil.
- Mendukung koreksi LOINC serta pengelolaan imaging manual setelah finalisasi dengan audit yang lengkap.

### Strategi rilis Neurovi v2

- **Fase 1 (MVP):** single-item form, RBAC tiga kelompok user, LOINC dropdown termasuk koreksi setelah Selesai, upload/hapus/ganti imaging manual oleh Radiografer, hasil/kesan Dokter Radiologi, Cek Hasil PACS berbasis accession number untuk seluruh user, finalisasi per item, relasi nomor order induk–turunan, riwayat, print expertise, dan sinkronisasi internal.
- **Fase 2 `[**]`:** integrasi PACS/Orthanc penuh untuk auto-fetch, webhook/polling hasil imaging, retry, dan monitoring komunikasi.
- **Fase 3 `[**]`:** integrasi SATUSEHAT menggunakan ServiceRequest, ImagingStudy, Observation, dan DiagnosticReport.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. Entry point dari **Dashboard Radiologi → Hasil Pemeriksaan Radiologi** pada setiap baris item.
2. Satu order dengan beberapa item menghasilkan satu baris per item pemeriksaan.
3. Form hanya menampilkan satu item terpilih dan tidak menyediakan tombol **Tambah Hasil Pemeriksaan**.
4. Header pasien menampilkan **Nama Pasien + Status Pasien, Jenis Kelamin, No. RM, Tanggal Lahir + Umur, dan Alamat** secara read-only; Status Pasien berarti sapaan/gelar seperti Ny., Tn., Sdr., Nn., An., dan nilai lain pada data pasien.
5. Nama pemeriksaan terisi otomatis dari baris item yang dipilih menggunakan `order_item_id`, tanpa dropdown atau pilihan ulang.
6. Nama pemeriksaan tampil read-only sebagai kombinasi nama pemeriksaan, teknik pemindaian, posisi/proyeksi, laterality, dan penggunaan zat kontras.
7. Field Dokter Radiologi read-only, bersumber dari konfirmasi item pemeriksaan.
8. Field Catatan Pemeriksaan read-only, bersumber dari catatan pada item pemeriksaan.
9. Satu dropdown Kode LOINC dengan format **kode — deskripsi**.
10. Default LOINC berasal dari mapping Master Data Radiologi; opsi dropdown berasal dari Master Data LOINC.
11. Radiografer dapat mengubah LOINC, termasuk setelah item berstatus Selesai.
12. Radiografer dapat mengunggah, menghapus, dan mengganti imaging manual berformat JPG, PNG, atau BMP dengan ukuran maksimum 10 MB per file.
13. Dokter Radiologi dapat mengisi atau mengubah Hasil Pemeriksaan dan Kesan.
14. Radiografer dan Dokter Radiologi dapat menggunakan checkbox **Tandai Selesai** dengan arti finalisasi yang sama.
15. User lain hanya dapat melihat data secara read-only.
16. Tombol **Cek Hasil PACS** tersedia untuk seluruh user dan melakukan pencarian menggunakan accession number order turunan.
17. Preview imaging, thumbnail, fullscreen, informasi sumber imaging, serta aksi hapus/ganti khusus imaging manual untuk Radiografer.
18. Riwayat pemeriksaan sebelumnya pada pasien yang sama sebagai komparasi read-only.
19. Penyimpanan draft internal ketika hasil belum final.
20. Status operasional per item: **Sedang Diproses**, **Menunggu Expertise**, dan **Selesai**.
21. Sinkronisasi hasil final ke EMR, Riwayat Radiologi, dan Riwayat Pemeriksaan Penunjang.
22. Print expertise per item pemeriksaan.
23. Audit user, role, waktu, sumber imaging, perubahan LOINC, perubahan hasil/kesan, penghapusan/penggantian imaging manual, dan finalisasi.
24. Konsumsi nomor order turunan dari PRD Konfirmasi Order Radiologi dengan pola `NomorOrderInduk-Suffix`, relasi melalui `parent_order_number`, dan item hasil tetap terikat ke identifier detail/item.
25. Penyimpanan Hasil Pemeriksaan, Kesan, dan Catatan Pemeriksaan menggunakan tipe data TEXT.

### Out Scope

- Pembuatan, perubahan, atau pembatalan order radiologi.
- Perubahan dokter radiologi dari halaman input hasil.
- Perubahan catatan pemeriksaan dari halaman input hasil.
- Penambahan atau penggantian item pemeriksaan dari form hasil.
- Pengelolaan Master Data Radiologi, Master Data LOINC, dan mapping LOINC.
- Viewer DICOM diagnostik penuh seperti window/level, measurement, annotation, MPR, atau 3D reconstruction.
- Integrasi SATUSEHAT pada implementasi PRD ini.
- Konfigurasi server Orthanc/PACS dan mekanisme transport DICOM pada level infrastruktur.

## 4. Goals and Metrics

### Tujuan

Menyediakan workflow hasil radiologi yang aman, terstruktur, dan dapat diaudit per item pemeriksaan, dengan pemisahan kewenangan user, terminologi LOINC yang konsisten, identitas pemeriksaan yang tidak dapat diubah, serta transisi status yang tetap berjalan ketika imaging datang melalui upload manual maupun Orthanc.

### Metrik

| Metrik | Target | Sumber |
|---|---|---|
| Perubahan field di luar kewenangan role | 0 kejadian | BR-006 s.d. BR-010; NFR-005 |
| Pencampuran hasil antar-item | 0 kejadian | BR-001 s.d. BR-004 |
| Kode dan deskripsi LOINC tidak konsisten | 0 kejadian | BR-014 s.d. BR-017 |
| Waktu simpan data non-file | < 1 detik pada kondisi normal | NFR-001 |
| Perubahan status dashboard | Tampil tanpa refresh manual | NFR-002 |
| Draft tampil sebagai hasil final di EMR/riwayat | 0 kejadian | BR-031; NFR-006 |
| Tombol Cek Hasil PACS tersedia untuk role yang valid | 100% Radiografer, Dokter Radiologi, dan user read-only | BR-011 |
| Audit perubahan LOINC, hasil, kesan, imaging, dan finalisasi | 100% transaksi | NFR-007 |
| Waktu respons Cek Hasil PACS | [PERLU KONFIRMASI] | Pertanyaan Terbuka |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Fitur |
|---|---|
| Dashboard Radiologi | Entry point, sumber baris item aktif beserta `order_item_id`, dan penerima pembaruan status per item. |
| Order Radiologi | Sumber relasi pasien, nomor order induk, `order_item_id`, nama pemeriksaan, teknik, proyeksi, laterality, kontras, dan catatan. |
| Konfirmasi Order Radiologi | Hard dependency pembentukan nomor order turunan/suffix, relasi `parent_order_number`, accession number, grouping pemeriksaan, serta sumber Dokter Radiologi yang ditugaskan per item. |
| Master Data Radiologi | Sumber konfigurasi pemeriksaan dan default mapping LOINC. |
| Master Data LOINC | Sumber opsi dropdown kode — deskripsi. |
| Orthanc/PACS | Sumber imaging otomatis atau hasil pengecekan ulang menggunakan accession number order turunan. |
| Penyimpanan File Internal | Menyimpan imaging dari upload manual. |
| EMR | Menampilkan hasil final. |
| Riwayat Radiologi | Menampilkan hasil final dan riwayat pembanding. |
| Riwayat Pemeriksaan Penunjang | Menampilkan hasil final bersama penunjang lain. |
| Data Pasien/Registrasi/EMR | Sumber kanonik Nama Pasien, Status Pasien, Jenis Kelamin, No. RM, Tanggal Lahir, Umur, dan Alamat pada header. |
| Authentication & Authorization | Menentukan role dan permission per aksi. |
| Audit Trail | Menyimpan perubahan dan aktivitas finalisasi. |

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---|---|---|
| Radiografer | Primary | Mengelola LOINC, imaging manual, pengecekan PACS, dan finalisasi sesuai kewenangan. |
| Dokter Radiologi | Primary | Mengisi hasil, kesan, mengecek PACS, melihat riwayat, dan finalisasi expertise. |
| Dokter Pengirim/DPJP/Perawat/User Klinis Lain | Secondary | Melihat data secara read-only dan dapat mengecek hasil PACS. |
| Koordinator Radiologi | Secondary | Memantau status item dan audit sesuai permission. |
| Administrator Master Data | Tersier | Menjaga mapping pemeriksaan ke LOINC dan kelengkapan Master LOINC. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. User membuka satu order radiologi yang dapat memuat beberapa item.
2. Sistem menampilkan beberapa pemeriksaan dalam satu area hasil.
3. User memilih pemeriksaan melalui dropdown atau menambahkan hasil pemeriksaan baru.
4. Kode dan nama terminologi ditampilkan sebagai field terpisah.
5. Dokter dan catatan tampil pada form tanpa penegasan sumber dan kewenangan edit.
6. Imaging diunggah manual.
7. User mengisi hasil dan kesan, lalu menyimpan atau menyelesaikan pemeriksaan.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. Order Radiologi memiliki satu nomor order induk. Pada proses Konfirmasi Order Radiologi, sistem membentuk nomor order turunan permanen dengan pola `NomorOrderInduk-Suffix`, suffix berurutan mulai dari 1, dan menyimpan relasi melalui `parent_order_number`.
2. Dashboard membentuk satu baris untuk setiap item pemeriksaan yang telah terhubung ke nomor order turunan.
3. User membuka aksi **Hasil Pemeriksaan Radiologi** pada satu baris.
4. Sistem membawa `order_item_id`, `child_order_number`, dan accession number dari baris terpilih lalu memuat data hanya untuk item tersebut.
5. Sistem menampilkan header pasien read-only berupa Nama Pasien + Status Pasien (sapaan/gelar), Jenis Kelamin, No. RM, Tanggal Lahir + Umur, dan Alamat.
6. Sistem mengisi otomatis nama pemeriksaan berdasarkan baris item yang dipilih, lalu menampilkannya sebagai identitas kombinasi read-only.
7. Sistem mengambil Dokter Radiologi dari konfirmasi item dan Catatan Pemeriksaan dari item order, keduanya read-only.
8. Sistem menampilkan default LOINC hasil mapping Master Data Radiologi dalam satu dropdown kode — deskripsi.
9. Sistem menerapkan permission berdasarkan role:
   - Radiografer: LOINC termasuk koreksi pasca-Selesai, upload/hapus/ganti imaging manual, Cek Hasil PACS, Tandai Selesai.
   - Dokter Radiologi: hasil, kesan, Cek Hasil PACS, Tandai Selesai.
   - User lain: read-only, tetapi Cek Hasil PACS tetap aktif.
10. Ketika user mulai bekerja pada form dan imaging belum tersedia, status operasional berubah dari **Sedang Diproses** menjadi **Menunggu Expertise**.
11. Imaging dapat tersedia melalui upload manual Radiografer atau hasil pengecekan Orthanc/PACS menggunakan accession number.
12. Jika checkbox **Tandai Selesai** sudah ditetapkan tetapi imaging belum tersedia, sistem menyimpan finalisasi tertunda dan mempertahankan status **Menunggu Expertise**.
13. Ketika imaging kemudian tersedia dari upload manual atau Orthanc/PACS, sistem mengevaluasi ulang prasyarat. Jika finalisasi tertunda sudah aktif, status berubah menjadi **Selesai**.
14. Jika imaging sudah tersedia lebih dahulu, Radiografer atau Dokter Radiologi dapat mencentang **Tandai Selesai** dengan arti finalisasi yang sama dan menyimpan untuk mengubah status menjadi **Selesai**.
15. Hasil final disinkronkan ke EMR, Riwayat Radiologi, dan Riwayat Pemeriksaan Penunjang.
16. Perubahan hasil/kesan oleh Dokter Radiologi atau perubahan LOINC oleh Radiografer setelah selesai mempertahankan status **Selesai**, tercatat di audit, dan menyinkronkan versi terbaru ke konsumen internal yang relevan.
17. Radiografer dapat menghapus atau mengganti imaging manual; imaging dari Orthanc/PACS tidak dikelola melalui aksi hapus/ganti manual.
18. Item lain pada order yang sama tidak berubah.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|---|---|---|
| Granularitas | Beberapa item dalam satu halaman | Satu baris dan satu form per item |
| Header pasien | Informasi belum didefinisikan sebagai header kanonik | Nama + status/sapaan pasien (Ny., Tn., Sdr., dll.), jenis kelamin, No. RM, tanggal lahir + umur, dan alamat; read-only |
| Sumber pemeriksaan aktif | Dapat dipilih ulang melalui dropdown | Terikat otomatis pada `order_item_id` dari baris dashboard yang dipilih |
| Nama pemeriksaan | Dropdown | Kombinasi read-only dari atribut item |
| Penambahan item | Ada tombol tambah hasil | Tidak tersedia |
| LOINC | Kode dan nama terpisah | Satu dropdown kode — deskripsi |
| Dokter Radiologi | Aturan sumber belum tegas | Dari konfirmasi item, read-only |
| Catatan | Aturan sumber belum tegas | Dari catatan item, read-only |
| Radiografer | Hak edit belum eksplisit | LOINC termasuk pasca-Selesai, upload/hapus/ganti imaging manual, finalisasi |
| Dokter Radiologi | Hak edit belum eksplisit | Hasil, kesan, finalisasi |
| User lain | Belum tegas | Read-only |
| Cek PACS | Belum konsisten | Tersedia untuk seluruh user dan mencari berdasarkan accession number |
| Nomor order hasil | Belum ditegaskan sebagai child order | Menggunakan nomor order turunan `NomorOrderInduk-Suffix` dari proses konfirmasi |
| Status | Belum memisahkan proses dan expertise | Sedang Diproses → Menunggu Expertise → Selesai |

## 7. Main Flow / Mindmap

### Skenario 1 — Radiografer membuka item tanpa imaging

1. Radiografer membuka item berstatus **Sedang Diproses**.
2. Sistem memuat `order_item_id` dari baris terpilih, menampilkan header pasien, dan mengisi otomatis nama pemeriksaan dari item tersebut.
3. Nama pemeriksaan tidak dapat diganti dan tidak tersedia dropdown pemeriksaan.
4. Karena proses input sudah dimulai tetapi imaging belum tersedia, sistem mengubah status menjadi **Menunggu Expertise**.
5. Radiografer dapat mengubah LOINC, upload manual, mengecek PACS, atau menandai selesai.
6. Hasil dan Kesan tampil read-only.

### Skenario 2 — Radiografer upload imaging manual

1. Radiografer memilih file imaging berformat JPG, PNG, atau BMP dengan ukuran maksimum 10 MB per file.
2. Sistem memvalidasi format dan ukuran, mengunggah file, lalu mengikatkannya ke `order_item_id` dan nomor order turunan.
3. Sistem mencatat sumber imaging sebagai **Manual Upload**.
4. Sistem memperbarui preview, thumbnail, jumlah imaging, dan audit.
5. Jika finalisasi tertunda sudah aktif, status otomatis menjadi **Selesai**; jika belum, status tetap **Menunggu Expertise**.

### Skenario 3 — Seluruh user mengecek PACS

1. User menekan **Cek Hasil PACS**.
2. Sistem mengambil accession number yang terhubung ke nomor order turunan pada baris aktif dan menggunakannya untuk pencarian ke Orthanc/PACS.
3. Jika imaging ditemukan, sistem mengikat data imaging ke item aktif dan menandai sumber **Orthanc/PACS**.
4. Jika finalisasi tertunda sudah aktif, status otomatis menjadi **Selesai**.
5. Jika belum ditemukan, sistem menampilkan informasi bahwa imaging belum tersedia tanpa mengubah hak edit user.

### Skenario 4 — Dokter Radiologi mengisi expertise

1. Dokter Radiologi membuka item.
2. Kode LOINC, Dokter Radiologi, Catatan Pemeriksaan, dan identitas pemeriksaan read-only.
3. Dokter mengisi atau mengubah Hasil Pemeriksaan dan Kesan.
4. Dokter dapat melihat riwayat pemeriksaan sebelumnya.
5. Dokter menyimpan sebagai draft internal atau menandai selesai.

### Skenario 5 — Finalisasi saat imaging sudah tersedia

1. User berwenang mencentang **Tandai Selesai**.
2. Sistem memvalidasi imaging tersedia.
3. User menekan **Simpan**.
4. Sistem mengubah status menjadi **Selesai**.
5. Sistem menyimpan metadata finalisasi dan menyinkronkan data final ke modul internal.
6. Halaman tetap terbuka dan menampilkan status terbaru.

### Skenario 6 — Finalisasi saat imaging belum tersedia

1. User berwenang mencentang **Tandai Selesai**.
2. Imaging belum tersedia dari manual maupun Orthanc/PACS.
3. Sistem menyimpan flag finalisasi tertunda dan status tetap **Menunggu Expertise**.
4. Sistem menampilkan informasi **Menunggu imaging untuk menyelesaikan pemeriksaan**.
5. Ketika imaging tersedia, sistem mengevaluasi flag dan mengubah status menjadi **Selesai** secara otomatis.

### Skenario 7 — User selain Radiografer dan Dokter Radiologi

1. User membuka form hasil.
2. Seluruh field input, upload manual, checkbox finalisasi, dan tombol Simpan dinonaktifkan atau tidak ditampilkan.
3. User tetap dapat melihat imaging, riwayat, hasil, kesan, LOINC, dokter, dan catatan.
4. Tombol **Cek Hasil PACS** tetap aktif.

### Skenario 8 — Koreksi data setelah selesai

1. Dokter Radiologi membuka item berstatus **Selesai** dan dapat mengubah Hasil Pemeriksaan atau Kesan.
2. Radiografer membuka item berstatus **Selesai** dan dapat mengubah Kode LOINC atau menghapus/mengganti imaging manual sesuai permission.
3. Sistem menyimpan versi terbaru, mempertahankan status **Selesai** selama prasyarat imaging tetap terpenuhi, dan mencatat audit nilai sebelum/sesudah.
4. Sistem memperbarui EMR serta seluruh riwayat internal yang menggunakan data tersebut.

### Skenario 9 — Membuka hasil berdasarkan nomor order turunan

1. Konfirmasi Order Radiologi telah membentuk child order `202607220001-1` yang berelasi ke parent order `202607220001`.
2. Dashboard menampilkan satu atau lebih row item yang berada pada child order tersebut.
3. User memilih row Thorax pada child order `202607220001-1`.
4. Form membawa `order_item_id` row Thorax, menampilkan nomor order turunan `202607220001-1`, dan menggunakan accession number child order untuk Cek Hasil PACS.
5. Form hanya memuat hasil item Thorax; item lain yang berada pada parent atau child order yang sama tidak ikut terbuka.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|---|---|---|
| **BR-001** | Unit pengelolaan hasil adalah item pemeriksaan, bukan order secara keseluruhan. | Konfirmasi user; FR-001 |
| **BR-002** | Satu order dengan `n` item menghasilkan `n` baris dashboard. | Konfirmasi user; FR-001 |
| **BR-003** | Form hanya menampilkan satu item yang dipilih. | Konfirmasi user; FR-003 |
| **BR-004** | Form tidak memiliki tombol Tambah Hasil Pemeriksaan. | Konfirmasi user; FR-003 |
| **BR-005** | Seluruh imaging, LOINC, hasil, kesan, status, dan audit terikat ke `order_item_id`. | NFR-004 |
| **BR-006** | Radiografer hanya dapat mengubah LOINC termasuk setelah Selesai, mengunggah/menghapus/mengganti imaging manual, mengecek PACS, dan menggunakan Tandai Selesai. | Konfirmasi user; FR-010; FR-028; FR-029 |
| **BR-007** | Dokter Radiologi hanya dapat mengubah Hasil Pemeriksaan dan Kesan serta menggunakan Tandai Selesai; Cek Hasil PACS tetap aktif. | Konfirmasi user; FR-011 |
| **BR-008** | User selain Radiografer dan Dokter Radiologi hanya read-only. | Konfirmasi user; FR-012 |
| **BR-009** | Hak edit harus diterapkan pada UI dan API/server-side. | NFR-005 |
| **BR-010** | Hak akses satu field tidak memberikan hak mengubah field lain. | NFR-005 |
| **BR-011** | Tombol Cek Hasil PACS tersedia untuk seluruh user yang dapat membuka form. | Konfirmasi user; FR-008 |
| **BR-012** | Field Dokter Radiologi bersumber dari konfirmasi item dan read-only untuk seluruh role. | Konfirmasi user; FR-005 |
| **BR-013** | Field Catatan Pemeriksaan bersumber dari catatan item order dan read-only untuk seluruh role. | Konfirmasi user; FR-006 |
| **BR-014** | Kode LOINC ditampilkan dalam satu field dropdown dengan format kode — deskripsi. | Konfirmasi user; FR-007 |
| **BR-015** | Default LOINC berasal dari mapping Master Data Radiologi. | Konfirmasi user; FR-007 |
| **BR-016** | Daftar opsi LOINC berasal dari Master Data LOINC aktif. | Konfirmasi user; FR-007 |
| **BR-017** | Hanya Radiografer yang dapat mengganti LOINC. | Konfirmasi user; FR-010 |
| **BR-018** | Nilai LOINC yang dipilih menyimpan identifier master, kode, dan deskripsi snapshot. | Data requirement |
| **BR-019** | Nama pemeriksaan bukan dropdown dan tidak dapat diubah dari form hasil. | Konfirmasi user; FR-004 |
| **BR-020** | Nama pemeriksaan merupakan kombinasi nama + teknik + proyeksi + laterality + kontras. | Konfirmasi user; FR-004 |
| **BR-021** | Komponen kombinasi yang kosong tidak boleh menghasilkan separator kosong/berulang. | Display rule |
| **BR-022** | Upload manual hanya tersedia untuk Radiografer. | Konfirmasi user; FR-009 |
| **BR-023** | Sumber imaging harus dicatat sebagai Manual Upload atau Orthanc/PACS. | Audit; FR-009 |
| **BR-024** | Cek Hasil PACS tidak mengubah permission field lain. | FR-008 |
| **BR-025** | Ketika form mulai dikerjakan dan imaging belum tersedia, status berubah Sedang Diproses → Menunggu Expertise. | Konfirmasi user poin 10; State Machine |
| **BR-026** | Menunggu Expertise menyatakan item belum memenuhi seluruh prasyarat Selesai. | State Machine |
| **BR-027** | Selesai memerlukan Tandai Selesai aktif dan imaging tersedia dari manual atau Orthanc/PACS. | Konfirmasi user poin 1, 2, 9; State Machine |
| **BR-028** | Jika Tandai Selesai sudah aktif tetapi imaging belum tersedia, sistem menyimpan finalisasi tertunda dan mempertahankan Menunggu Expertise. | Reconciliation status; FR-014 |
| **BR-029** | Kedatangan imaging manual/Orthanc memicu evaluasi status; jika finalisasi tertunda aktif, Menunggu Expertise → Selesai. | Konfirmasi user poin 9; FR-015 |
| **BR-030** | Jika imaging sudah tersedia lebih dahulu, Simpan dengan Tandai Selesai mengubah status menjadi Selesai. | FR-014 |
| **BR-031** | Data hasil yang belum final disimpan sebagai draft internal dan tidak ditampilkan sebagai hasil final di EMR/riwayat. | Requirement sebelumnya; FR-013 |
| **BR-032** | Status draft internal bukan status utama dashboard. Dashboard menggunakan status operasional. | Keputusan desain D-05 |
| **BR-033** | Perubahan hasil/kesan pada item Selesai oleh Dokter Radiologi mempertahankan status Selesai dan menyinkronkan versi terbaru. | Requirement sebelumnya; FR-017 |
| **BR-034** | Finalisasi satu item tidak mengubah item lain dalam order yang sama. | BR-001; NFR-004 |
| **BR-035** | Riwayat pemeriksaan sebelumnya bersifat read-only. | FR-018 |
| **BR-036** | Print expertise dibuat per item pemeriksaan. | FR-019 |
| **BR-037** | Setiap perubahan LOINC, upload, hasil, kesan, PACS check, dan finalisasi harus memiliki audit user, role, waktu, serta nilai sebelum/sesudah bila relevan. | NFR-007 |
| **BR-038** | Header form wajib menampilkan Nama Pasien + Status Pasien, Jenis Kelamin, No. RM, Tanggal Lahir + Umur, dan Alamat. | Konfirmasi user; FR-023 |
| **BR-039** | Seluruh data header pasien bersifat read-only dan diambil dari data pasien/episode yang terhubung dengan item pemeriksaan terpilih. | Konfirmasi user; FR-023 |
| **BR-040** | Nama pemeriksaan wajib terisi otomatis berdasarkan `order_item_id` dari baris dashboard yang dipilih. | Konfirmasi user; FR-004; FR-024 |
| **BR-041** | User tidak dapat memilih, mengganti, atau memuat jenis pemeriksaan dari baris lain melalui form input hasil. | Konfirmasi user; FR-003; FR-024 |
| **BR-042** | Contoh: ketika user membuka baris nomor order turunan `202607220001-1` dengan jenis pemeriksaan Thorax, form wajib menampilkan identitas pemeriksaan Thorax beserta atribut kombinasinya. | Konfirmasi user; BR-040 |
| **BR-043** | Status Pasien pada header adalah sapaan/gelar pasien seperti Ny., Tn., Sdr., Nn., An., dan nilai lain pada data pasien; bukan status workflow atau keaktifan pasien. | Konfirmasi user; FR-023 |
| **BR-044** | Checkbox Tandai Selesai memiliki arti finalisasi yang sama untuk Radiografer dan Dokter Radiologi. | Konfirmasi user; FR-014 |
| **BR-045** | Radiografer dapat mengubah Kode LOINC setelah item berstatus Selesai; perubahan tidak membuka kembali status, wajib diaudit, dan menyinkronkan data terbaru ke konsumen internal yang relevan. | Konfirmasi user; FR-029 |
| **BR-046** | Radiografer dapat menghapus atau mengganti imaging yang berasal dari upload manual. Aksi ini tidak berlaku untuk imaging dari Orthanc/PACS. | Konfirmasi user; FR-028 |
| **BR-047** | Imaging manual hanya menerima format JPG, PNG, atau BMP dengan ukuran maksimum 10 MB per file. | Konfirmasi user; FR-009; FR-028 |
| **BR-048** | Cek Hasil PACS wajib menggunakan accession number yang terhubung ke nomor order turunan/item aktif. | Konfirmasi user; FR-027 |
| **BR-049** | Hasil Pemeriksaan, Kesan, dan Catatan Pemeriksaan disimpan menggunakan tipe data TEXT. | Konfirmasi user; FR-030 |
| **BR-050** | Nomor order turunan dibentuk pada proses Konfirmasi Order Radiologi dengan format `NomorOrderInduk-Suffix`; suffix berurutan mulai dari 1, permanen, tidak diubah, dan tidak digunakan ulang. | PRD Konfirmasi Order Radiologi; FR-026 |
| **BR-051** | Detail/order turunan menyimpan relasi ke order induk menggunakan `parent_order_number`; tidak menggunakan `parent_order_id` sebagai relasi data pada requirement ini. | PRD Konfirmasi Order Radiologi; FR-026 |
| **BR-052** | Form hasil tetap granular per item: `order_item_id` menjadi kunci item aktif, sedangkan `child_order_number` menjadi identitas order turunan yang menaungi item tersebut. | Konfirmasi user; FR-002; FR-026 |
| **BR-053** | Reschedule sebelum child order terbentuk tidak membuat suffix baru. Form hasil hanya menggunakan child order yang sudah terbentuk pada proses konfirmasi/pelaksanaan. | PRD Konfirmasi Order Radiologi; Dependency |

## 9. Access & Permission Matrix

| Aksi / Field | Radiografer | Dokter Radiologi | User Lain |
|---|:---:|:---:|:---:|
| Melihat header pasien (Nama + Status, Jenis Kelamin, No. RM, Tanggal Lahir + Umur, Alamat) dan order | ✓ read-only | ✓ read-only | ✓ read-only |
| Melihat identitas pemeriksaan | ✓ read-only | ✓ read-only | ✓ read-only |
| Melihat Dokter Radiologi | ✓ read-only | ✓ read-only | ✓ read-only |
| Melihat Catatan Pemeriksaan | ✓ read-only | ✓ read-only | ✓ read-only |
| Mengubah Kode LOINC | ✓, termasuk setelah Selesai | — | — |
| Melihat Kode LOINC | ✓ | ✓ read-only | ✓ read-only |
| Upload Imaging Manual | ✓ | — | — |
| Hapus/Ganti Imaging Manual | ✓ | — | — |
| Cek Hasil PACS | ✓ | ✓ | ✓ |
| Melihat imaging dan fullscreen | ✓ | ✓ | ✓ |
| Melihat riwayat sebelumnya | ✓ | ✓ | ✓ |
| Mengisi Hasil Pemeriksaan | — | ✓ | — |
| Mengisi Kesan | — | ✓ | — |
| Tandai Selesai | ✓ | ✓ | — |
| Simpan perubahan | ✓ | ✓ | — |
| Print Expertise | Sesuai permission print | Sesuai permission print | Sesuai permission print/read |

> Tanda “—” berarti tidak memiliki permission edit. Field tetap dapat ditampilkan secara read-only bila user memiliki permission melihat form.

## 10. State Machine — Status Operasional per Item

### 10.1 Status

| Status | Makna | Indikator Minimum |
|---|---|---|
| **Sedang Diproses** | Pemeriksaan sedang dikerjakan dan proses input hasil belum dimulai. | Badge biru/abu; belum ada finalisasi. |
| **Menunggu Expertise** | Form hasil sudah mulai dikerjakan atau salah satu prasyarat selesai belum terpenuhi. Dapat terjadi ketika imaging belum tersedia, hasil masih draft, atau finalisasi belum lengkap. | Badge kuning; helper menyebut prasyarat yang belum terpenuhi. |
| **Selesai** | Tandai Selesai aktif dan imaging tersedia; item final untuk sinkronisasi internal. | Badge hijau; metadata finalisasi dan status sinkronisasi. |

### 10.2 Transisi

| Dari | Event / Kondisi | Ke | Catatan |
|---|---|---|---|
| Sedang Diproses | User membuka/memulai input hasil ketika imaging belum tersedia | Menunggu Expertise | BR-025 |
| Sedang Diproses | Imaging ditemukan lebih dahulu dari Orthanc/PACS atau upload manual | Menunggu Expertise | Menunggu finalisasi/hasil sesuai role. |
| Menunggu Expertise | Tandai Selesai aktif, imaging belum tersedia | Menunggu Expertise | `pending_finalization = true`. |
| Menunggu Expertise | Imaging tersedia dan `pending_finalization = true` | Selesai | Upload manual atau Orthanc menjadi event penyelesai. |
| Menunggu Expertise | Imaging sudah tersedia, lalu Tandai Selesai disimpan | Selesai | Finalisasi melalui tombol Simpan. |
| Selesai | Dokter Radiologi menyimpan koreksi hasil/kesan | Selesai | Sinkronisasi ulang; audit versi. |
| Selesai | Radiografer mengubah LOINC | Selesai | Audit nilai sebelum/sesudah dan sinkronisasi ulang data terminologi. |
| Selesai | Radiografer mengganti imaging manual dan minimal satu imaging valid tetap tersedia | Selesai | Audit file lama dan file pengganti. |

### 10.3 Status Dokumen Internal

Status dokumen hasil disimpan terpisah dari status operasional:

| Status Dokumen | Makna |
|---|---|
| `draft` | Hasil/kesan atau perubahan lain sudah disimpan tetapi belum memenuhi finalisasi. |
| `final` | Item sudah berstatus Selesai dan dapat dipublikasikan ke konsumen internal. |

### 10.4 Validasi Transisi

- Status Selesai tidak boleh terbentuk tanpa imaging yang terikat pada item.
- Flag finalisasi dapat disimpan lebih dahulu ketika imaging belum tersedia.
- Arrival event dari manual upload maupun Orthanc/PACS harus idempotent.
- Event imaging yang sama tidak boleh membuat duplikasi file atau transisi status berulang.
- Tandai Selesai memiliki arti finalisasi yang sama untuk Radiografer dan Dokter Radiologi.
- Perubahan LOINC setelah Selesai tidak mengubah status operasional.
- Hasil Pemeriksaan dan Kesan opsional terisi sebelum finalisasi, termasuk ketika finalisasi dilakukan oleh Radiografer.

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|---|---|---|
| **FR-001** | **Dashboard per item** — sistem menampilkan satu baris untuk setiap item pemeriksaan. | BR-001; BR-002 |
| **FR-002** | **Entry point** — aksi Hasil Pemeriksaan Radiologi membuka `order_item_id` terpilih. | BR-003 |
| **FR-003** | **Single-item form** — form hanya memuat item aktif dan tidak memiliki tombol tambah. | BR-003; BR-004 |
| **FR-004** | **Identitas pemeriksaan kombinasi** — sistem mengambil pemeriksaan dari `order_item_id` baris dashboard terpilih dan membentuk label read-only dari nama, teknik, proyeksi, laterality, dan kontras. | BR-019 s.d. BR-021; BR-040; BR-041 |
| **FR-005** | **Dokter Radiologi read-only** — sistem menampilkan dokter hasil konfirmasi item. | BR-012 |
| **FR-006** | **Catatan read-only** — sistem menampilkan catatan item order. | BR-013 |
| **FR-007** | **LOINC dropdown tunggal** — sistem menampilkan default mapping dan opsi Master LOINC dalam format kode — deskripsi. | BR-014 s.d. BR-018 |
| **FR-008** | **Cek Hasil PACS** — tombol tersedia untuk seluruh user, melakukan pengecekan Orthanc/PACS menggunakan accession number order turunan, dan menampilkan hasil pengecekan. | BR-011; BR-024; BR-048 |
| **FR-009** | **Upload manual** — Radiografer dapat mengunggah imaging JPG/PNG/BMP maksimum 10 MB per file, melihat progres/validasi, dan sumber file tercatat. | BR-022; BR-023; BR-047 |
| **FR-010** | **Permission Radiografer** — hanya LOINC termasuk koreksi pasca-Selesai, upload/hapus/ganti imaging manual, PACS check, dan finalisasi yang editable/actionable. | BR-006; Matrix |
| **FR-011** | **Permission Dokter Radiologi** — hasil, kesan, PACS check, dan finalisasi actionable; field lain read-only. | BR-007; Matrix |
| **FR-012** | **Read-only user lain** — seluruh field edit, upload, finalisasi, dan simpan dinonaktifkan; PACS check tetap aktif. | BR-008; BR-011 |
| **FR-013** | **Draft internal** — sistem menyimpan perubahan non-final tanpa mempublikasikannya ke EMR/riwayat. | BR-031; BR-032 |
| **FR-014** | **Finalisasi** — sistem menyimpan Tandai Selesai, memvalidasi imaging, dan menyelesaikan item bila prasyarat terpenuhi. | BR-027; BR-028; BR-030 |
| **FR-015** | **Event imaging** — arrival imaging manual/Orthanc mengevaluasi ulang status dan menyelesaikan pending finalization. | BR-029 |
| **FR-016** | **Status realtime** — form dan dashboard memperbarui status tanpa refresh manual. | NFR-002 |
| **FR-017** | **Koreksi final hasil** — Dokter Radiologi dapat mengoreksi hasil/kesan Selesai dengan status tetap dan sinkronisasi ulang. | BR-033 |
| **FR-018** | **Riwayat pemeriksaan** — sistem menampilkan hasil sebelumnya read-only dan mendukung komparasi. | BR-035 |
| **FR-019** | **Print expertise** — output dibentuk per item sesuai permission. | BR-036 |
| **FR-020** | **Audit trail** — sistem mencatat PACS check, upload, LOINC, hasil, kesan, status, dan finalisasi. | BR-037 |
| **FR-021 `[**]`** | **Orthanc/PACS integration** — polling/webhook, retrieval metadata, retry, dan deduplikasi imaging. | Roadmap |
| **FR-022 `[**]`** | **SATUSEHAT** — mapping hasil ke Observation dan kesan ke DiagnosticReport. | Roadmap |
| **FR-023** | **Header pasien** — sistem menampilkan Nama Pasien + Status Pasien berupa sapaan/gelar (Ny., Tn., Sdr., Nn., An., dll.), Jenis Kelamin, No. RM, Tanggal Lahir + Umur, dan Alamat secara read-only dari sumber data kanonik. | BR-038; BR-039; BR-043 |
| **FR-024** | **Autofill pemeriksaan dari baris terpilih** — ketika form dibuka, sistem memuat nama dan atribut pemeriksaan berdasarkan `order_item_id` yang dikirim oleh baris dashboard; tidak tersedia dropdown untuk mengganti pemeriksaan. | BR-003; BR-040 s.d. BR-042 |
| **FR-025** | **Makna finalisasi lintas role** — Tandai Selesai harus menghasilkan arti dan evaluasi status yang sama saat digunakan Radiografer maupun Dokter Radiologi. | BR-044 |
| **FR-026** | **Konteks nomor order turunan** — sistem menerima dan menampilkan `child_order_number` dengan format `parent_order_number-suffix`, menyimpan referensi `parent_order_number`, dan tetap menggunakan `order_item_id` untuk membuka satu item hasil. | BR-050 s.d. BR-053 |
| **FR-027** | **Pencarian PACS berbasis accession number** — sistem mengambil accession number dari child order/item aktif dan menggunakannya sebagai identifier Cek Hasil PACS. | BR-048 |
| **FR-028** | **Kelola imaging manual** — Radiografer dapat menghapus atau mengganti imaging manual dengan validasi format/ukuran dan audit; imaging Orthanc/PACS tidak dapat dihapus melalui aksi manual. | BR-046; BR-047 |
| **FR-029** | **Koreksi LOINC pasca-final** — Radiografer dapat mengubah LOINC pada item Selesai tanpa mengubah status, dengan audit dan sinkronisasi ulang data relevan. | BR-045 |
| **FR-030** | **Penyimpanan teks klinis** — Hasil Pemeriksaan, Kesan, dan Catatan Pemeriksaan disimpan sebagai tipe data TEXT. | BR-049 |

## 12. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|---|---|---|---|
| **US-001** | Sebagai **Radiografer**, saya ingin mengubah LOINC dari satu dropdown terkontrol, sehingga terminologi item sesuai Master LOINC. | Given form item terbuka, When Radiografer memilih opsi kode — deskripsi, Then identifier, kode, dan deskripsi tersimpan pada item serta audit tercatat. | FR-007; FR-010 |
| **US-002** | Sebagai **Radiografer**, saya ingin upload imaging manual, sehingga proses tetap berjalan ketika imaging belum tersedia di PACS. | Given file JPG/PNG/BMP berukuran maksimum 10 MB, When upload berhasil, Then preview, thumbnail, sumber Manual Upload, dan status item diperbarui. | FR-009; FR-015 |
| **US-003** | Sebagai **Dokter Radiologi**, saya ingin mengisi Hasil dan Kesan, sehingga expertise tersimpan terstruktur. | Given saya memiliki permission, When saya menyimpan, Then hasil dan kesan tersimpan per item tanpa dapat mengubah LOINC, dokter, catatan, atau identitas pemeriksaan. | FR-011; FR-013 |
| **US-004** | Sebagai **Radiografer atau Dokter Radiologi**, saya ingin menandai selesai, sehingga item dapat difinalisasi ketika imaging tersedia. | Given Tandai Selesai aktif, When imaging tersedia, Then status menjadi Selesai; When imaging belum tersedia, Then finalisasi disimpan tertunda dan status Menunggu Expertise. | FR-014; FR-015 |
| **US-005** | Sebagai **user yang memiliki akses lihat**, saya ingin mengecek PACS, sehingga saya dapat mengetahui apakah imaging sudah tersedia tanpa memperoleh hak edit lain. | When Cek Hasil PACS ditekan, Then sistem mengecek Orthanc/PACS dan menampilkan hasil; permission field lain tidak berubah. | FR-008; FR-012 |
| **US-006** | Sebagai **user selain Radiografer dan Dokter Radiologi**, saya ingin melihat hasil secara read-only, sehingga saya dapat memperoleh informasi tanpa risiko perubahan data. | Given form terbuka, Then seluruh input, upload, finalisasi, dan simpan nonaktif, tetapi viewer, riwayat, dan PACS check tetap dapat digunakan. | FR-012 |
| **US-007** | Sebagai **Dokter Radiologi**, saya ingin melihat riwayat pemeriksaan sebelumnya, sehingga saya dapat melakukan komparasi klinis. | When Riwayat Sebelumnya dibuka, Then data historis tampil read-only dan tidak menimpa hasil aktif. | FR-018 |
| **US-008** | Sebagai **Dokter Radiologi**, saya ingin mengoreksi hasil final, sehingga versi terbaru tersinkron tanpa mengembalikan status menjadi draft. | Given item Selesai, When hasil/kesan diubah dan disimpan, Then status tetap Selesai, audit versi tercatat, dan konsumen internal diperbarui. | FR-017 |
| **US-009** | Sebagai **user yang membuka hasil radiologi**, saya ingin melihat identitas pasien secara lengkap pada header, sehingga saya dapat memastikan hasil diinput pada pasien yang benar. | Given form dibuka dari suatu item, Then header menampilkan Nama + Status Pasien berupa sapaan/gelar, Jenis Kelamin, No. RM, Tanggal Lahir + Umur, dan Alamat secara read-only. | FR-023; BR-038; BR-039; BR-043 |
| **US-010** | Sebagai **user yang memilih baris pemeriksaan**, saya ingin nama pemeriksaan terisi otomatis dari baris tersebut, sehingga hasil tidak tertukar dengan item lain dalam order yang sama. | Given child order `202607220001-1` memiliki row Thorax, When row tersebut dibuka, Then identitas Thorax tampil otomatis dan tidak tersedia kontrol untuk memilih pemeriksaan lain. | FR-004; FR-024; BR-040 s.d. BR-042 |
| **US-011** | Sebagai **Radiografer**, saya ingin mengoreksi LOINC pada item yang sudah Selesai, sehingga terminologi dapat diperbaiki tanpa membuka ulang hasil. | Given item Selesai, When LOINC diubah dan disimpan, Then status tetap Selesai, audit tercatat, dan data terminologi terbaru disinkronkan. | FR-029; BR-045 |
| **US-012** | Sebagai **Radiografer**, saya ingin menghapus atau mengganti imaging manual, sehingga file yang salah dapat diperbaiki. | Given imaging bersumber dari Manual Upload, When saya memilih hapus atau ganti, Then sistem memvalidasi permission, format JPG/PNG/BMP, ukuran maksimum 10 MB per file, dan mencatat audit. | FR-028; BR-046; BR-047 |
| **US-013** | Sebagai **user yang mengecek PACS**, saya ingin pencarian menggunakan accession number dari order turunan, sehingga imaging yang ditampilkan sesuai child order aktif. | Given child order memiliki accession number, When Cek Hasil PACS ditekan, Then sistem mencari menggunakan accession number tersebut dan mengikat hasil hanya ke item/order terkait. | FR-027; BR-048 |
| **US-014** | Sebagai **user**, saya ingin melihat nomor order turunan pada form hasil, sehingga saya dapat menelusuri item kembali ke order induknya. | Given child order `202607220001-1` berasal dari parent `202607220001`, When form dibuka, Then child order tampil read-only dan relasi parent tersimpan untuk traceability. | FR-026; BR-050 s.d. BR-052 |

## 13. Data Requirements (Spesifikasi Field)

> Field demografi pasien reuse definisi kanonik dari modul Pendaftaran/EMR. Nama, tipe, format, dan validasi harus sama. Seluruh data pada form wajib diambil menggunakan `order_item_id`.

### A. Layar TAMPIL — Dashboard Radiologi

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| No. Order Turunan | Detail/Konfirmasi Order Radiologi | Text/link `NomorOrderInduk-Suffix` | Search | Nomor child order dapat muncul pada beberapa row item jika satu child order berisi lebih dari satu item. |
| No. Order Induk | Order Radiologi | Text read-only/tooltip | Search | Disimpan sebagai `parent_order_number` untuk traceability. |
| Accession Number | Konfirmasi/Worklist Radiologi | Text read-only | Search opsional | Identifier Cek Hasil PACS. |
| Jadwal Pemeriksaan | Item order | DD/MM/YYYY HH:mm | Filter tanggal; sort | Per item. |
| Pasien | Data pasien | No. RM + Nama | Search | Data kanonik. |
| Asal Unit | Registrasi/order | Text | Filter unit | Snapshot sesuai order. |
| Dokter Pengirim | Order | Text | - | Read-only. |
| Pemeriksaan | Kombinasi atribut item | Multiline text | Search | BR-020. |
| Dokter Radiologi | Konfirmasi item | Text | Filter opsional | Read-only. |
| Imaging | File/Orthanc link | Badge jumlah + sumber | Filter tersedia/belum | Per item. |
| Status | Workflow item | Badge | Filter status | Sedang Diproses/Menunggu Expertise/Selesai. |
| Aksi | Permission + item | Button | - | Input Hasil atau Lihat Hasil sesuai role. |

### B. Layar INPUT — Form Hasil Pemeriksaan Radiologi

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `order_item_id` | ID Item | hidden/UUID | Ya | Valid item aktif | Dashboard | Kunci relasi. |
| `parent_order_number` | Nomor Order Induk | hidden/text read-only | Ya | Nomor order induk | Order Radiologi | Relasi data child order menggunakan nomor ini, bukan `parent_order_id`. |
| `child_order_number` | Nomor Order Turunan | text read-only | Ya | `NomorOrderInduk-Suffix`; suffix mulai 1 | Konfirmasi Order Radiologi | Contoh `202607220001-1`; permanen dan tidak digunakan ulang. |
| `accession_number` | Accession Number | hidden/text read-only | Ya untuk Cek PACS | Identifier valid | Konfirmasi/Worklist Radiologi | Digunakan sebagai kunci pencarian Orthanc/PACS. |
| `patient_name` | Nama Pasien | text read-only | Ya | Mengikuti format kanonik | Data Pasien | Ditampilkan satu area dengan Status Pasien. |
| `patient_salutation` | Status Pasien | text read-only | Tidak | Sapaan/gelar seperti Ny., Tn., Sdr., Nn., An., dll. | Data Pasien | Bukan status aktif/nonaktif, episode, atau pelayanan. |
| `sex` | Jenis Kelamin | text read-only | Ya | Mengikuti format kanonik | Data Pasien | Header pasien. |
| `medical_record_number` | No. RM | text read-only | Ya | Nomor RM kanonik | Data Pasien | Header pasien. |
| `birth_date` | Tanggal Lahir | date read-only | Ya | DD/MM/YYYY | Data Pasien | Ditampilkan bersama Umur. |
| `age_display` | Umur | text generated read-only | Ya | Dihitung terhadap tanggal pemeriksaan/form | Sistem dari Tanggal Lahir | Format umur mengikuti standar EMR. |
| `address` | Alamat | text read-only | Tidak | Mengikuti format kanonik | Data Pasien | Dapat multiline/ellipsis + tooltip jika panjang. |
| `exam_display_name` | Pemeriksaan | text read-only | Ya | Kombinasi atribut | Item pada baris dashboard terpilih (`order_item_id`) | Terisi otomatis saat form dibuka; bukan dropdown dan tidak dapat diganti. |
| `radiologist_id` | Dokter Radiologi | lookup read-only | Ya | Staff aktif saat konfirmasi | Konfirmasi item | Tidak dapat diubah. |
| `item_note` | Catatan Pemeriksaan | textarea read-only | Tidak | Tipe data TEXT | Item order | Tidak dapat diubah. |
| `loinc_master_id` | Kode LOINC | dropdown | [PERLU KONFIRMASI] | `kode — deskripsi`; opsi aktif | Mapping Master Radiologi | Editable hanya Radiografer. |
| `loinc_code_snapshot` | Kode LOINC Snapshot | text generated | Ya jika LOINC dipilih | Kode master | Opsi terpilih | Untuk konsistensi historis. |
| `loinc_description_snapshot` | Deskripsi LOINC Snapshot | text generated | Ya jika LOINC dipilih | Deskripsi master | Opsi terpilih | Disimpan bersama kode. |
| `result_text` | Hasil Pemeriksaan | textarea | [PERLU KONFIRMASI] | Tipe data TEXT | Manual/Draft | Editable hanya Dokter Radiologi. |
| `impression_text` | Kesan | textarea | [PERLU KONFIRMASI] | Tipe data TEXT | Manual/Draft | Editable hanya Dokter Radiologi. |
| `imaging_files` | Imaging | upload/viewer | Minimal 1 untuk Selesai | JPG/PNG/BMP; maksimum 10 MB per file | Manual/Orthanc | Upload, hapus, dan ganti imaging manual hanya Radiografer; jumlah maksimum file `[PERLU KONFIRMASI]`. |
| `pacs_check` | Cek Hasil PACS | action button | Tidak | Idempotent; query by accession number | Orthanc/PACS | Aktif untuk seluruh role. |
| `complete_flag` | Tandai Selesai | checkbox | Tidak | Boolean | Default false/current | Editable Radiografer & Dokter Radiologi. |
| `pending_finalization` | Finalisasi Tertunda | boolean generated | Ya | Sistem | Dari complete_flag + imaging | Tidak tampil sebagai input. |
| `workflow_status` | Status | badge read-only | Ya | Enum | Sistem | Sedang Diproses/Menunggu Expertise/Selesai. |
| `document_status` | Status Dokumen | generated | Ya | draft/final | Sistem | Status internal. |

### C. Aturan Tampilan Header Pasien

- Header pasien selalu tampil pada bagian atas form sebelum area imaging dan detail hasil.
- Susunan informasi minimal: **Nama Pasien + Status Pasien** · **Jenis Kelamin** · **No. RM** · **Tanggal Lahir + Umur** · **Alamat**. Status Pasien adalah sapaan/gelar seperti Ny., Tn., Sdr., Nn., An., dan nilai lain yang tersedia pada data pasien.
- Seluruh data bersifat read-only dan harus merepresentasikan pasien yang terhubung dengan `order_item_id` terpilih.
- Nilai umur dihitung oleh sistem berdasarkan tanggal lahir dan tanggal pemeriksaan/form sesuai standar kanonik EMR.
- Alamat yang panjang dapat dipotong secara visual menggunakan ellipsis, tetapi nilai lengkap harus dapat dilihat melalui tooltip atau detail.

### D. Data TER-GENERATE saat Simpan/Event

| Field | Label | Tipe | Format/Sumber | Catatan |
|---|---|---|---|---|
| `parent_order_number` | Nomor Order Induk | text | Order Radiologi | Referensi traceability child order. |
| `child_order_number` | Nomor Order Turunan | text | Konfirmasi Order Radiologi | Format parent-suffix; permanen. |
| `accession_number` | Accession Number | text | Konfirmasi/Worklist Radiologi | Identifier Cek Hasil PACS. |
| `exam_display_name` | Nama Pemeriksaan Kombinasi | text | Formatter dari atribut item | Snapshot untuk tampilan/audit. |
| `imaging_source` | Sumber Imaging | enum | MANUAL/ORTHANC_PACS | Per file/study. |
| `last_pacs_checked_at` | Terakhir Cek PACS | datetime | Waktu server | Audit. |
| `last_pacs_checked_by` | User Cek PACS | user ID | Session user | Audit. |
| `finalized_at` | Waktu Finalisasi | datetime | Waktu server | Terisi saat Selesai. |
| `finalized_by` | Finalizer | user ID | Session user | Menyimpan role finalizer. |
| `status_changed_at` | Waktu Perubahan Status | datetime | Waktu server | Per transisi. |
| `version_no` | Versi Hasil | integer | Auto increment | Bertambah saat koreksi final. |
| `sync_status` | Status Sinkronisasi Internal | enum | pending/success/failed | EMR dan riwayat. |
| `manual_imaging_action` | Aksi Imaging Manual | enum | upload/delete/replace | Dibuat per aksi Radiografer dan dicatat pada audit. |

### E. Pembentukan Nama Pemeriksaan

Urutan komponen:

1. Nama Pemeriksaan
2. Teknik Pemindaian
3. Posisi/Proyeksi Pemeriksaan
4. Sisi Tubuh/Laterality
5. Penggunaan Zat Kontras

Contoh:

`Thorax · Digital Radiography · Erect AP · Bilateral · Tanpa Kontras`

Komponen kosong diabaikan. Format separator final menggunakan ` · ` dan tidak boleh menghasilkan separator ganda. Nilai seluruh komponen diambil hanya dari item pada baris dashboard yang dipilih.

Contoh konteks pemilihan:

- Baris dashboard: nomor order turunan `202607220001-1`, berasal dari nomor order induk `202607220001`
- Jenis pemeriksaan pada baris: `Thorax`
- Saat fitur **Hasil Pemeriksaan Radiologi** dibuka, field Pemeriksaan otomatis menampilkan identitas Thorax beserta teknik, proyeksi, laterality, dan kontras dari item tersebut.
- Form tidak menyediakan dropdown atau aksi untuk mengganti ke Cranium, CT Scan, atau item lain dalam order yang sama.

## 14. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|---|---|---|---|
| **NFR-001** | Performa | Simpan data non-file selesai < 1 detik pada kondisi normal. | Bispro |
| **NFR-002** | Real-Time | Status pada form dan dashboard berubah tanpa refresh manual. | Requirement status |
| **NFR-003** | Performa | Cek Hasil PACS memiliki timeout, progress, dan target p95 `[PERLU KONFIRMASI]`. | FR-008 |
| **NFR-004** | Konsistensi Data | Semua operasi hasil menggunakan `order_item_id`, terikat ke `child_order_number` dan `parent_order_number`; item lain tidak boleh terpengaruh. | BR-005; BR-050 s.d. BR-052 |
| **NFR-005** | Keamanan/RBAC | Permission wajib diterapkan server-side dan tidak hanya melalui disabled field UI. | BR-009 |
| **NFR-006** | Privasi/Klinis | Draft internal tidak boleh dipublikasikan sebagai hasil final. | BR-031 |
| **NFR-007** | Auditabilitas | Audit mencakup user, role, waktu, aksi, nilai sebelum/sesudah, sumber imaging, upload/hapus/ganti imaging manual, koreksi LOINC pasca-final, accession number yang digunakan, dan transisi status. | BR-037; BR-045 s.d. BR-048 |
| **NFR-008** | Reliabilitas | Event imaging manual/Orthanc dan transisi status harus idempotent. | State Machine |
| **NFR-009** | Reliabilitas | Kegagalan Orthanc/PACS tidak menghilangkan file manual atau data hasil. | Risk R2 |
| **NFR-010** | Ergonomi UI | Field read-only dibedakan secara visual, tetapi tetap terbaca dan dapat disalin. | UI visualization |
| **NFR-011** | Aksesibilitas | Kontrol memiliki label, dapat digunakan dengan keyboard, dan status tidak hanya mengandalkan warna. | Best practice |
| **NFR-012** | Responsivitas | Optimal pada desktop 1366×768; panel memiliki scroll independen pada viewport lebih kecil. | Referensi v1 |
| **NFR-013** | Observability | Integrasi PACS/Orthanc mencatat request ID, waktu respons, hasil, error, dan retry. | FR-021 |
| **NFR-014** | Usability | Halaman tetap terbuka setelah Simpan dan menampilkan notifikasi hasil aksi. | Bispro |

## 15. Integrasi Eksternal & Dependency

### A. Integrasi Internal

| Integrasi | Fungsi | Status | Trace |
|---|---|---|---|
| Dashboard Radiologi | Entry point dan pembaruan status | In Scope | FR-001; FR-016 |
| Order Radiologi | Relasi pasien, nomor order induk, konteks baris item, nama dan atribut pemeriksaan, serta catatan | Hard Dependency | FR-002; FR-004; FR-006; FR-024; FR-026 |
| Data Pasien/Registrasi/EMR | Header pasien kanonik | Hard Dependency | FR-023 |
| Konfirmasi Radiologi | Pembentukan child order/suffix, relasi `parent_order_number`, accession number, grouping, dan penugasan Dokter Radiologi | Hard Dependency | FR-005; FR-026; FR-027 |
| Master Data Radiologi | Default mapping LOINC | Hard Dependency | FR-007 |
| Master Data LOINC | Opsi kode — deskripsi | Hard Dependency | FR-007 |
| EMR | Konsumen hasil final | In Scope | FR-014; FR-017 |
| Riwayat Radiologi | Konsumen hasil final dan sumber riwayat | In Scope | FR-018 |
| Riwayat Penunjang | Konsumen hasil final | In Scope | FR-014 |
| Audit Trail | Rekam aktivitas | Hard Dependency | FR-020 |

### B. Integrasi Orthanc/PACS

| Integrasi | Fungsi | Status | Trace |
|---|---|---|---|
| Orthanc/PACS | Cek ketersediaan dan mengambil metadata/imaging berdasarkan accession number | Tombol dan kontrak fungsi In Scope; detail transport `[PERLU KONFIRMASI]` | FR-008; FR-021; FR-027 |

### C. Dependency dan Dampak

| Dependency | Tipe | Dampak Jika Belum Siap |
|---|---|---|
| Mapping Master Radiologi → LOINC | Hard | Default LOINC kosong; Radiografer harus memilih manual. |
| Master LOINC | Hard | Dropdown tidak dapat digunakan. |
| Data pasien/episode | Hard | Header pasien tidak lengkap atau tidak sesuai dengan item pemeriksaan. |
| Konteks `order_item_id`, `child_order_number`, dan `parent_order_number` dari Dashboard/Konfirmasi Radiologi | Hard | Sistem berisiko memuat pemeriksaan atau child order yang salah; form tidak boleh dibuka tanpa relasi valid. |
| Accession number dari child order/worklist | Hard untuk Cek PACS | Cek Hasil PACS tidak dapat dijalankan tanpa identifier ini. |
| Penugasan dokter saat konfirmasi | Hard | Dokter Radiologi pada form kosong/tidak valid. |
| Orthanc/PACS | Soft untuk manual workflow | Cek PACS gagal, tetapi Radiografer tetap dapat upload manual. |
| Sinkronisasi EMR/Riwayat | Hard untuk publikasi final | Item dapat final secara klinis tetapi memerlukan retry sinkronisasi. |

## 16. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|---|---|---|
| **D-01** | Granularitas | Satu form dan satu status per item pemeriksaan. |
| **D-02** | Identitas pemeriksaan | Read-only, dibentuk dari lima komponen item. |
| **D-03** | Dokter Radiologi | Dari konfirmasi item dan read-only. |
| **D-04** | Catatan | Dari catatan item dan read-only. |
| **D-05** | Status dashboard | Menggunakan status operasional; draft tetap status dokumen internal. |
| **D-06** | LOINC | Satu dropdown kode — deskripsi; default mapping, editable Radiografer. |
| **D-07** | PACS check | Tersedia untuk seluruh role yang memiliki akses lihat. |
| **D-08** | Finalisasi tertunda | Checkbox dapat disimpan sebelum imaging tersedia; imaging arrival menjadi trigger evaluasi penyelesaian. |
| **D-09** | Header pasien | Menampilkan Nama + Status Pasien berupa sapaan/gelar (Ny., Tn., Sdr., dll.), Jenis Kelamin, No. RM, Tanggal Lahir + Umur, dan Alamat secara read-only. |
| **D-10** | Sumber pemeriksaan aktif | Pemeriksaan di-autofill dari `order_item_id` baris dashboard terpilih dan tidak dapat dipilih ulang di form. |
| **D-11** | Makna Tandai Selesai | Sama untuk Radiografer dan Dokter Radiologi: finalisasi item pemeriksaan. |
| **D-12** | LOINC pasca-final | Dapat diubah Radiografer setelah Selesai tanpa membuka kembali status. |
| **D-13** | Imaging manual | Radiografer dapat upload, hapus, dan ganti file JPG/PNG/BMP maksimum 10 MB per file. |
| **D-14** | Identifier PACS | Cek Hasil PACS menggunakan accession number. |
| **D-15** | Penyimpanan teks | Hasil, Kesan, dan Catatan menggunakan tipe data TEXT. |
| **D-16** | Nomor order hasil | Menggunakan child order `NomorOrderInduk-Suffix` dari PRD Konfirmasi Order Radiologi; relasi ke parent melalui nomor order induk. |

## 17. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|---|---|---|---|
| 1.0 | 21 Juli 2026 | Team Product — Tamtech International | Penyusunan awal per item, draft/final, riwayat, dan sinkronisasi internal. |
| 1.1 | 22 Juli 2026 | Team Product — Tamtech International | Menambahkan RBAC Radiografer/Dokter Radiologi/user lain, Cek Hasil PACS untuk semua user, field dokter dan catatan read-only, LOINC dropdown tunggal, nama pemeriksaan kombinasi read-only, serta status Sedang Diproses → Menunggu Expertise → Selesai dengan event imaging manual/Orthanc. |
| 1.2 | 22 Juli 2026 | Team Product — Tamtech International | Menambahkan header pasien berisi Nama + Status Pasien, Jenis Kelamin, No. RM, Tanggal Lahir + Umur, dan Alamat; mempertegas autofill pemeriksaan berdasarkan `order_item_id` dari baris dashboard terpilih tanpa dropdown. |
| 1.3 | 22 Juli 2026 | Team Product — Tamtech International | Menetapkan Status Pasien sebagai sapaan/gelar; menyamakan arti Tandai Selesai untuk Radiografer dan Dokter Radiologi; mengizinkan koreksi LOINC pasca-Selesai serta hapus/ganti imaging manual; menetapkan format JPG/PNG/BMP maksimum 10 MB per file; menetapkan accession number untuk Cek PACS; menetapkan tipe data TEXT; dan menyelaraskan nomor order turunan/suffix dengan PRD Konfirmasi Order Radiologi. |
