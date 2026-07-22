# PRD — Order Permintaan Transfusi Darah

**Related Document:** PRD Pelayanan Rawat Jalan Neurovi v2; PRD Pelayanan Rawat Inap Neurovi v2; PRD Pelayanan IGD Neurovi v2; PRD Pelayanan/Konfirmasi Permintaan Darah UTSD `[Hard Dependency — dokumen terpisah]`; PRD Riwayat Pemeriksaan Penunjang `[dokumen terpisah]`; Referensi UI Order Transfusi Darah Neurovi v1  
**Dokumen ID:** `[PERLU KONFIRMASI]` · **Versi:** 1.1 (Draft — Revisi pasca-konfirmasi)  
**Tanggal Disusun:** 21 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]`  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Order Permintaan Transfusi Darah merupakan fitur pada pelayanan Rawat Jalan, Rawat Inap, dan IGD yang digunakan oleh user pelayanan yang memiliki hak akses untuk membuat permintaan satu atau lebih komponen darah bagi pasien dalam episode pelayanan aktif. Entry point tersedia pada masing-masing pelayanan melalui **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**.

Neurovi v1 telah mengakomodasi pembuatan order dari Rawat Jalan, Rawat Inap, dan IGD, pengisian data klinis, serta penambahan beberapa komponen darah dalam satu order. Neurovi v2 mempertahankan cakupan tersebut dengan penyelarasan struktur data, validasi tanggal dan waktu rencana, default dokter pemohon, sumber diagnosis gabungan, pilihan **Belum Tahu** untuk golongan darah dan rhesus, serta penyimpanan order yang konsisten.

Lingkup PRD ini hanya mencakup proses **membuat order baru sampai order tersedia untuk ditindaklanjuti oleh UTSD**. User dari unit pengirim tidak dapat mengedit atau membatalkan order setelah berhasil disimpan. Pembatalan order serta pembaruan golongan darah dan rhesus oleh petugas UTSD berada pada PRD pelayanan/konfirmasi UTSD yang terpisah. Riwayat order, pemantauan progres, perubahan status lanjutan, dan pencetakan juga tidak termasuk dalam PRD ini.

> Referensi: brief bisnis proses user dan lampiran UI Order Transfusi Darah Neurovi v1.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — berdasarkan konfirmasi dan lampiran tampilan:
- Order permintaan transfusi darah telah tersedia dari konteks pelayanan Rawat Jalan, Rawat Inap, dan IGD.
- Form menampilkan identitas pasien, nomor order, tanggal permintaan, tanggal dan waktu rencana transfusi, dokter pemohon, diagnosis, golongan darah, rhesus, jenis komponen darah, serta jumlah kantong.
- User dapat menambahkan beberapa jenis komponen darah ke dalam daftar sebelum menyimpan order.
- Setelah order tersimpan, proses lanjutan dilaksanakan oleh unit penerima permintaan darah.

**Masalah/pain point:**
- Aspek bisnis proses: perilaku form dan validasi perlu dibuat konsisten pada Rawat Jalan, Rawat Inap, dan IGD serta tetap terikat pada episode pelayanan tempat order dibuat.
- Aspek UX: user membutuhkan default dokter yang relevan, diagnosis yang dapat dicari dari konteks episode maupun Master ICD-10, serta daftar komponen yang mudah diperiksa sebelum simpan.
- Aspek logic system: nomor order perlu dapat ditampilkan pada form tetapi baru dipersistenkan setelah penyimpanan berhasil; tanggal dan waktu rencana harus berada setelah waktu permintaan; header dan detail order tidak boleh tersimpan parsial.

**Dampak utama yang disasar v2:**
- Pembuatan permintaan transfusi darah lebih konsisten pada seluruh pelayanan sumber.
- Data klinis dan komponen darah tersimpan lengkap, valid, dan dapat diteruskan ke UTSD tanpa pencatatan ulang.
- Batas tanggung jawab unit pengirim dan UTSD menjadi jelas setelah order disimpan.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = pembuatan order permintaan transfusi darah dari Rawat Jalan, Rawat Inap, dan IGD sampai tersedia sebagai order baru pada UTSD.

> Rumah sakit dapat memproses puluhan hingga ratusan permintaan transfusi darah per hari. Seorang pasien dapat memiliki lebih dari satu order pada episode pelayanan yang sama.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Entry point lintas pelayanan** — order diakses dari masing-masing pelayanan Rawat Jalan, Rawat Inap, dan IGD melalui **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**.
2. **Akses user pelayanan** — order dapat dibuat oleh dokter maupun petugas pelayanan lain yang memiliki hak akses; tidak dibatasi hanya untuk dokter.
3. **Konteks pasien otomatis** — sistem menampilkan No. RM, nama pasien, tanggal lahir, usia, jenis pelayanan, unit asal, serta identitas episode/registrasi secara otomatis.
4. **Identitas order** — nomor order ditampilkan pada form sebagai nomor order yang akan digunakan, tetapi record dan nomor tersebut baru dipersistenkan ketika proses simpan berhasil.
5. **Tanggal dan waktu permintaan** — sistem menampilkan serta mencatat tanggal dan waktu permintaan secara otomatis.
6. **Rencana transfusi** — user wajib mengisi tanggal dan waktu rencana transfusi tanpa nilai default.
7. **Dokter pemohon** — sistem memberikan default dokter berdasarkan konteks pelayanan dan tetap menyediakan lookup dokter untuk penyesuaian sebelum simpan.
8. **Diagnosis** — user memilih satu atau lebih diagnosis dari kombinasi diagnosis episode/EMR dan Master ICD-10.
9. **Golongan darah dan rhesus** — user dapat memilih nilai yang diketahui atau memilih **Belum Tahu** pada masing-masing field.
10. **Detail komponen darah** — user memilih jenis komponen darah dan mengisi jumlah kantong.
11. **Multi-item order** — satu order dapat berisi beberapa jenis komponen darah.
12. **Pengelolaan item sebelum simpan** — user dapat menambahkan, memperbarui jumlah untuk jenis yang sama, dan menghapus item selama order belum disimpan.
13. **Validasi order** — sistem memvalidasi episode aktif, kelengkapan field wajib, tanggal/waktu rencana, jumlah kantong, duplikasi jenis komponen dalam satu order, serta potensi order aktif dengan komponen yang sama.
14. **Penyimpanan order** — sistem menyimpan header dan seluruh detail komponen darah dalam satu transaksi database.
15. **Penerusan order** — order yang berhasil disimpan dibuat tersedia bagi UTSD dengan status awal **Menunggu Konfirmasi**.
16. **Audit penciptaan order** — sistem menyimpan waktu dan user pembuat order.

### Out Scope

- Riwayat seluruh order transfusi darah pasien atau episode pelayanan.
- Dashboard atau daftar pemantauan permintaan darah.
- Tampilan progres dan status order sebelumnya pada form order.
- Konfirmasi, pemrosesan, penyelesaian, dan perubahan status lanjutan oleh UTSD.
- Edit order oleh user unit pengirim setelah order berhasil disimpan.
- Pembatalan order oleh user unit pengirim.
- Pembatalan order oleh petugas UTSD serta pembaruan golongan darah dan rhesus oleh petugas UTSD; diatur pada PRD pelayanan/konfirmasi UTSD.
- Pencetakan form permintaan transfusi darah; dibuat melalui tiket dan PRD terpisah.
- Mekanisme teknis penanganan kegagalan handoff setelah penyimpanan database berhasil `[PERLU KONFIRMASI]`.

## 4. Goals and Metrics

### Tujuan

Menyediakan proses order permintaan transfusi darah yang terstruktur, konsisten, dan dapat digunakan dari pelayanan Rawat Jalan, Rawat Inap, serta IGD. Setiap order harus memiliki konteks pasien dan episode yang jelas, dokter pemohon, diagnosis, rencana transfusi yang valid, serta minimal satu komponen darah sebelum diteruskan ke UTSD.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu membuka form order | < 1 detik pada kondisi operasional normal | NFR-001 |
| Waktu menambahkan atau menghapus item | < 1 detik | NFR-002 |
| Waktu menyimpan order | < 1 detik pada kondisi layanan internal normal | NFR-003 |
| Kelengkapan detail order | 100% order tersimpan memiliki dokter, minimal 1 diagnosis, tanggal/waktu rencana, dan minimal 1 item | BR-008 s.d. BR-012 |
| Validitas rencana transfusi | 100% order tersimpan memiliki waktu rencana lebih besar dari waktu permintaan | BR-007 |
| Integritas transaksi database | Tidak ada header order tersimpan tanpa detail item, dan sebaliknya | BR-020; NFR-006 |
| Keunikan nomor order | 100% nomor order yang tersimpan bersifat unik | BR-005 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul / Master Data | Peran terhadap Modul |
|---------------------|-----------------------|
| Pelayanan Rawat Jalan | Menyediakan konteks pasien, episode, unit asal, dan entry point order. |
| Pelayanan Rawat Inap | Menyediakan konteks pasien, episode, unit asal, dan entry point order. |
| Pelayanan IGD | Menyediakan konteks pasien, episode, unit asal, dan entry point order. |
| Riwayat Pemeriksaan Penunjang | Menjadi halaman sebelum user memilih **Tambah Baru**; pengelolaan riwayat diatur pada PRD terpisah. |
| Master Pasien | Sumber No. RM, nama, tanggal lahir, usia, serta data golongan darah/rhesus apabila tersedia. |
| Master Staf/Dokter | Sumber default dan pilihan dokter pemohon. |
| EMR/Diagnosis Episode | Sumber diagnosis yang sudah tercatat pada episode pelayanan pasien. |
| Master ICD-10 | Sumber diagnosis tambahan yang dapat dicari dan dipilih. |
| Master Komponen Darah | Sumber jenis komponen darah aktif yang dapat diminta. |
| UTSD | Penerima order baru serta pemilik proses konfirmasi, pembatalan, pembaruan golongan darah/rhesus, dan status lanjutan. |
| PRD Pelayanan/Konfirmasi Permintaan Darah UTSD | Mengatur proses setelah order diterima UTSD. |
| PRD Output Print Permintaan Darah | Mengatur pencetakan form pada tiket terpisah. |

**Dependency lintas modul:** Pelayanan Rawat Jalan, Rawat Inap, IGD, Master Pasien, Master Staf/Dokter, EMR/Diagnosis Episode, Master ICD-10, Master Komponen Darah, dan penerimaan order pada UTSD.

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter | Primary | Membuat order dan menjadi dokter pemohon sesuai kebutuhan klinis. |
| Perawat/bidan/petugas pelayanan lain yang memiliki akses | Primary | Membuat order dari konteks pelayanan dan memilih dokter pemohon yang bertanggung jawab. |
| Petugas UTSD | Secondary | Menerima order, melakukan proses konfirmasi, dapat membatalkan order, serta dapat memperbarui golongan darah dan rhesus pada proses terpisah. |
| Administrator master data | Tersier | Memastikan data dokter, diagnosis, dan komponen darah tersedia serta aktif. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. User memilih pasien dari pelayanan Rawat Jalan, Rawat Inap, atau IGD.
2. User membuka **Penunjang Medis**, memilih **Tambah Baru**, memilih penunjang, lalu memilih **Permintaan Darah**.
3. Sistem membuka form dan menampilkan identitas pasien, nomor order, serta tanggal permintaan.
4. User mengisi tanggal dan waktu rencana transfusi serta memilih dokter pemohon.
5. User memilih diagnosis, golongan darah, rhesus, jenis komponen darah, dan jumlah kantong.
6. User menekan **Tambahkan ke Daftar** untuk memasukkan komponen darah ke tabel.
7. User dapat menambahkan lebih dari satu komponen dan menghapus item sebelum simpan.
8. User menekan **Simpan** untuk membuat permintaan.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. User memilih pasien dengan episode Rawat Jalan, Rawat Inap, atau IGD yang masih aktif.
2. User membuka **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**.
3. Sistem memuat identitas pasien, konteks episode, nomor order yang akan digunakan, serta tanggal/waktu permintaan secara read-only.
4. Nomor order yang ditampilkan belum menjadi record tersimpan sampai proses simpan berhasil.
5. Sistem mengisi default dokter pemohon berdasarkan konteks pelayanan: dokter login apabila user merupakan dokter, atau DPJP episode apabila order dibuat oleh user non-dokter. User tetap dapat mengganti dokter melalui lookup sebelum simpan.
6. User memilih minimal satu diagnosis dari diagnosis episode/EMR dan/atau Master ICD-10.
7. User mengisi tanggal dan waktu rencana transfusi. Kedua field tidak memiliki default dan gabungan nilainya wajib lebih besar dari tanggal/waktu permintaan.
8. User memilih golongan darah dan rhesus. Masing-masing field menyediakan pilihan **Belum Tahu**.
9. User memilih jenis komponen darah dan mengisi jumlah kantong berupa bilangan bulat positif.
10. User menambahkan komponen ke daftar dan dapat mengulang langkah tersebut untuk jenis komponen lain.
11. Jika jenis komponen yang sama dipilih kembali, sistem tidak membuat baris duplikat dan menawarkan pembaruan jumlah kantong pada item yang sudah ada.
12. Sebelum simpan, user dapat menghapus item dari daftar.
13. Ketika user menekan **Simpan**, sistem menjalankan validasi form dan memeriksa potensi order aktif dengan komponen yang sama.
14. Jika ditemukan potensi order ganda, sistem menampilkan peringatan dan meminta konfirmasi eksplisit sebelum melanjutkan.
15. Sistem menyimpan header dan seluruh detail item dalam satu transaksi database, mempersistenkan nomor order yang ditampilkan, memberikan status awal **Menunggu Konfirmasi**, mencatat audit penciptaan, dan membuat order tersedia bagi UTSD.
16. Setelah berhasil disimpan, form order tidak menyediakan aksi edit atau pembatalan bagi user unit pengirim.
17. Petugas UTSD dapat membatalkan order serta memperbarui golongan darah dan rhesus melalui proses UTSD yang diatur pada PRD terpisah.
18. Sistem menampilkan notifikasi berhasil atau pesan kegagalan yang dapat dipahami. Form ini tidak menampilkan riwayat order.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Entry point | Tersedia dari pelayanan Rawat Jalan, Rawat Inap, dan IGD. | Dipertahankan dan distandardisasi: **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**. |
| User pembuat | Tidak ditegaskan pada dokumen awal. | Tidak dibatasi hanya dokter; seluruh petugas pelayanan yang memiliki hak akses dapat membuat order. |
| Dokter pemohon | Dipilih pada form. | Memiliki default dari dokter login atau DPJP episode sesuai konteks, tetap dapat diubah sebelum simpan. |
| Diagnosis | Dipilih pada form. | Bersumber dari kombinasi diagnosis episode/EMR dan Master ICD-10. |
| Nomor order | Ditampilkan saat form dibuka. | Tetap ditampilkan pada form, tetapi baru dipersistenkan ketika simpan berhasil. |
| Rencana transfusi | Contoh UI menampilkan nilai saat form dibuka. | Tidak memiliki default; user wajib mengisi tanggal dan waktu yang lebih besar dari waktu permintaan. |
| Golongan darah/rhesus | Pilihan golongan darah serta rhesus positif/negatif. | Golongan darah dan rhesus masing-masing memiliki pilihan **Belum Tahu**. |
| Perbandingan dengan Master Pasien | Belum ditegaskan. | Perbedaan nilai tidak memblokir simpan dan tidak memerlukan warning/konfirmasi khusus. |
| Batas jumlah kantong | Belum ditegaskan. | Tidak ada batas maksimum bisnis pada fase ini; nilai harus bilangan bulat positif. |
| Aksi setelah simpan | Belum ditegaskan. | User unit pengirim tidak dapat edit atau batal; pembatalan dan pembaruan golongan darah/rhesus dilakukan petugas UTSD. |
| Riwayat dan print | Berpotensi berada dekat form existing. | Dikeluarkan dari scope dan dibuat melalui PRD/tiket terpisah. |

## 7. Main Flow / Mindmap

### Skenario 1 — Membuat order dengan satu komponen darah

1. User memilih pasien pada pelayanan Rawat Jalan, Rawat Inap, atau IGD yang masih aktif.
2. User membuka **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**.
3. Sistem menampilkan identitas pasien, episode pelayanan, nomor order yang akan digunakan, dan tanggal/waktu permintaan.
4. Sistem mengisi default dokter pemohon sesuai konteks pelayanan.
5. User memilih diagnosis, mengisi tanggal dan waktu rencana, memilih golongan darah/rhesus, jenis komponen, serta jumlah kantong.
6. User menambahkan komponen ke daftar.
7. User menekan **Simpan**.
8. Sistem memvalidasi data, menyimpan order secara atomik, mempersistenkan nomor order, memberikan status **Menunggu Konfirmasi**, dan membuat order tersedia bagi UTSD.

### Skenario 2 — Order dibuat oleh user non-dokter

1. Perawat, bidan, atau petugas pelayanan lain yang memiliki akses membuka form order.
2. Sistem mengisi default Dokter Pemohon menggunakan DPJP episode.
3. User dapat mengganti dokter pemohon melalui lookup Master Staf/Dokter apabila diperlukan.
4. Identitas user pembuat dan dokter pemohon disimpan sebagai dua data yang berbeda.

### Skenario 3 — Memilih diagnosis dari dua sumber

1. Sistem menampilkan diagnosis yang telah tercatat pada episode/EMR pasien.
2. User dapat memilih diagnosis tersebut atau mencari diagnosis lain dari Master ICD-10.
3. User dapat memilih lebih dari satu diagnosis.
4. Sistem menghindari penyimpanan diagnosis yang sama secara duplikat apabila ditemukan dari kedua sumber.

### Skenario 4 — Membuat order dengan beberapa komponen darah

1. User mengisi data header order.
2. User memilih komponen pertama dan jumlah kantong, lalu menambahkannya ke daftar.
3. User memilih komponen kedua dan jumlah kantong, lalu menambahkannya ke daftar.
4. Sistem menampilkan setiap jenis komponen sebagai baris berbeda.
5. User dapat menghapus item yang salah sebelum simpan.
6. Sistem menyimpan semua item dalam satu order ketika seluruh validasi berhasil.

### Skenario 5 — Golongan darah atau rhesus belum diketahui

1. User memilih **Belum Tahu** pada Golongan Darah, Rhesus, atau keduanya.
2. Sistem tetap mengizinkan penambahan komponen dan penyimpanan order apabila validasi lain terpenuhi.
3. Nilai **Belum Tahu** disimpan pada order agar dapat ditindaklanjuti oleh UTSD.
4. Petugas UTSD dapat memperbarui golongan darah dan rhesus melalui proses UTSD yang terpisah.

### Skenario 6 — Nilai berbeda dengan Master Pasien

1. Data golongan darah atau rhesus pada Master Pasien tersedia sebagai informasi/default apabila diterapkan pada UI.
2. User memilih nilai yang berbeda atau memilih **Belum Tahu**.
3. Sistem tidak memblokir penyimpanan dan tidak meminta konfirmasi khusus hanya karena terdapat perbedaan dengan Master Pasien.
4. Sistem menyimpan nilai yang dipilih pada order sebagai snapshot permintaan.

### Skenario 7 — Jenis komponen yang sama dipilih kembali

1. User telah menambahkan suatu jenis komponen ke daftar.
2. User memilih kembali jenis komponen yang sama dan mengisi jumlah baru.
3. Sistem mendeteksi duplikasi item dalam order.
4. Sistem menawarkan pilihan memperbarui jumlah kantong pada item yang sudah ada atau membatalkan perubahan.
5. Sistem tidak membuat baris duplikat untuk jenis komponen yang sama.

### Skenario 8 — Ditemukan order aktif dengan komponen yang sama

1. User menekan **Simpan** pada order yang valid.
2. Sistem menemukan order aktif pasien pada episode yang sama dengan jenis komponen darah yang sama.
3. Sistem menampilkan ringkasan potensi order ganda dan meminta konfirmasi.
4. User memilih **Lanjutkan** atau **Kembali Periksa**.
5. Jika user melanjutkan, sistem menyimpan order baru sebagai order terpisah dan tidak menimpa order sebelumnya.

### Skenario 9 — Validasi tanggal dan waktu rencana gagal

1. User mengisi tanggal/waktu rencana yang sama dengan atau lebih kecil dari tanggal/waktu permintaan.
2. Sistem menolak penyimpanan.
3. Sistem menandai field rencana transfusi dan menampilkan informasi bahwa waktu rencana harus lebih besar dari waktu permintaan.

### Skenario 10 — Order sudah berhasil disimpan

1. Sistem menampilkan notifikasi bahwa order berhasil dibuat.
2. User unit pengirim tidak dapat mengedit atau membatalkan order tersebut dari fitur order.
3. Order tersedia untuk proses berikutnya pada UTSD.
4. Pembatalan serta pembaruan golongan darah/rhesus dilakukan oleh petugas UTSD melalui fitur terpisah.

### Skenario 11 — Penyimpanan database atau handoff gagal

1. Jika penyimpanan header atau detail database gagal, sistem membatalkan seluruh transaksi dan tidak mempersistenkan order parsial.
2. User menerima pesan kegagalan dan dapat mencoba menyimpan kembali.
3. Jika database berhasil tetapi handoff atau ketersediaan order pada UTSD gagal, perilaku status, retry, dan rollback mengikuti keputusan teknis yang masih `[PERLU KONFIRMASI]`.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Order dapat dibuat dari episode pelayanan Rawat Jalan, Rawat Inap, atau IGD yang masih aktif. | Konfirmasi user; FR-001; FR-002 |
| **BR-002** | Entry point order adalah **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah** pada masing-masing pelayanan. | Konfirmasi user; FR-001 |
| **BR-003** | Pembuatan order tidak dibatasi hanya untuk dokter; user pelayanan yang memiliki hak akses dapat membuat order. | Konfirmasi user; FR-003 |
| **BR-004** | Setiap order wajib terikat pada satu pasien dan satu episode/registrasi tempat order dibuat. | Logic system; FR-002; FR-004 |
| **BR-005** | Nomor order ditampilkan pada form, bersifat unik, tidak dapat diubah user, dan baru dipersistenkan ketika proses simpan berhasil. | Konfirmasi user; FR-005 |
| **BR-006** | Tanggal dan waktu permintaan ditentukan sistem dan dipersistenkan saat order berhasil disimpan. | Scope data; FR-005 |
| **BR-007** | Tanggal dan waktu rencana tidak memiliki default dan nilai gabungannya wajib lebih besar dari tanggal dan waktu permintaan. | Konfirmasi user; FR-006 |
| **BR-008** | Dokter pemohon wajib tersedia sebelum simpan. Sistem memberikan default dari dokter login untuk user dokter atau DPJP episode untuk user non-dokter, dan nilai dapat diubah sebelum simpan. | Konfirmasi user; FR-007 |
| **BR-009** | Minimal satu diagnosis wajib dipilih dari diagnosis episode/EMR dan/atau Master ICD-10. | Konfirmasi user; FR-008 |
| **BR-010** | Diagnosis yang sama tidak boleh tersimpan duplikat walaupun berasal dari dua sumber berbeda. | Integritas data; FR-008 |
| **BR-011** | Minimal satu item komponen darah wajib terdapat pada daftar sebelum order disimpan. | Draft user; FR-010; FR-011 |
| **BR-012** | Jumlah kantong wajib berupa bilangan bulat positif dan lebih dari 0. | Validasi user; FR-010 |
| **BR-013** | Tidak terdapat batas maksimum jumlah kantong per komponen maupun per order pada fase ini. | Konfirmasi user; FR-010 |
| **BR-014** | Satu order dapat terdiri dari beberapa jenis komponen darah. | Feature capability; FR-011 |
| **BR-015** | Jenis komponen darah yang sama tidak boleh tersimpan sebagai dua baris terpisah; sistem menawarkan pembaruan jumlah pada item yang sudah ada. | Validasi user; FR-012 |
| **BR-016** | Golongan darah dan rhesus masing-masing menyediakan pilihan **Belum Tahu**. | Konfirmasi user; FR-009 |
| **BR-017** | Nilai **Belum Tahu** pada golongan darah dan/atau rhesus tidak menghalangi penyimpanan order yang memenuhi validasi lain. | Konfirmasi user; FR-009 |
| **BR-018** | Perbedaan golongan darah/rhesus yang dipilih dengan data Master Pasien tidak memblokir simpan dan tidak memerlukan warning atau konfirmasi khusus. | Konfirmasi user; FR-009 |
| **BR-019** | Jika terdapat order aktif dengan jenis komponen yang sama pada episode pasien, sistem menampilkan peringatan dan meminta konfirmasi eksplisit sebelum membuat order baru. | Validasi user; FR-013 |
| **BR-020** | Header order dan seluruh detail komponen darah harus disimpan dalam satu transaksi database atomik; kegagalan salah satu bagian membatalkan seluruh penyimpanan database. | Logic system; FR-015; NFR-006 |
| **BR-021** | Order yang berhasil dibuat memiliki status awal **Menunggu Konfirmasi** dan tersedia untuk diproses oleh UTSD. | Draft user; FR-016 |
| **BR-022** | User unit pengirim tidak dapat mengubah, menghapus, atau membatalkan order setelah order berhasil disimpan. | Konfirmasi user; FR-017 |
| **BR-023** | Petugas UTSD dapat membatalkan order serta memperbarui golongan darah dan rhesus melalui fitur pelayanan UTSD yang diatur pada PRD terpisah. | Konfirmasi user; Out Scope |
| **BR-024** | Seorang pasien dapat memiliki lebih dari satu order pada episode yang sama; setiap order tersimpan sebagai record terpisah dan tidak menimpa order sebelumnya. | Draft user; FR-015 |
| **BR-025** | Sistem mencatat user pembuat dan waktu pembuatan order sebagai audit trail minimum. | Draft user; FR-018 |
| **BR-026** | Riwayat, progres, dan pencetakan tidak ditampilkan atau diproses pada fitur ini. | Konfirmasi user; FR-019 |
| **BR-027** | Item dapat ditambahkan, diperbarui, dan dihapus hanya selama order belum disimpan. | Feature capability; FR-011; FR-012 |
| **BR-028** | Penanganan kondisi ketika database berhasil tetapi handoff ke UTSD gagal belum ditetapkan dan tidak boleh diasumsikan sebagai rollback, retry, atau status khusus tanpa keputusan lanjutan. | Konfirmasi user; Pertanyaan Terbuka |

## 9. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Entry point lintas pelayanan** — fitur tersedia pada Rawat Jalan, Rawat Inap, dan IGD melalui **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**. | US-001; BR-001; BR-002 |
| **FR-002** | **Validasi episode aktif** — sistem memeriksa bahwa episode/registrasi asal masih aktif saat form dibuka dan sebelum order disimpan. | US-001; BR-001; BR-004 |
| **FR-003** | **Hak akses pembuat order** — sistem mengizinkan dokter dan petugas pelayanan lain yang memiliki akses untuk membuka dan menyimpan order. | US-001; BR-003; NFR-009 |
| **FR-004** | **Konteks pasien otomatis** — sistem menampilkan identitas pasien, jenis pelayanan, unit asal, dan referensi episode secara read-only. | US-001; BR-004 |
| **FR-005** | **Identitas order dan waktu permintaan** — sistem menampilkan nomor order pada form, mencatat tanggal/waktu permintaan, dan baru mempersistenkan nomor serta record order ketika simpan berhasil. | US-002; BR-005; BR-006 |
| **FR-006** | **Rencana transfusi tanpa default** — sistem menyediakan input tanggal dan waktu tanpa nilai default serta memvalidasi gabungan nilainya harus lebih besar dari waktu permintaan. | US-002; BR-007 |
| **FR-007** | **Default dan lookup dokter pemohon** — sistem mengisi default dokter dari konteks login/DPJP dan mengizinkan user menggantinya melalui lookup sebelum simpan. | US-002; US-003; BR-008 |
| **FR-008** | **Diagnosis gabungan** — sistem menyediakan multi-select diagnosis dari diagnosis episode/EMR dan Master ICD-10, serta mencegah diagnosis duplikat. | US-002; US-004; BR-009; BR-010 |
| **FR-009** | **Golongan darah dan rhesus** — sistem menyediakan pilihan A/B/AB/O/Belum Tahu serta Positif/Negatif/Belum Tahu; perbedaan dengan Master Pasien tidak memblokir atau memicu konfirmasi khusus. | US-005; BR-016; BR-017; BR-018 |
| **FR-010** | **Input komponen darah** — sistem menyediakan pemilihan jenis komponen dan jumlah kantong bilangan bulat positif tanpa batas maksimum bisnis pada fase ini. | US-006; BR-011; BR-012; BR-013 |
| **FR-011** | **Daftar multi-item** — user dapat menambahkan beberapa jenis komponen, melihat nomor urut, jenis, jumlah kantong, dan menghapus item sebelum simpan. | US-006; BR-014; BR-027 |
| **FR-012** | **Penanganan item duplikat** — sistem mendeteksi jenis komponen yang sudah terdapat pada daftar dan menawarkan pembaruan jumlah tanpa membuat baris duplikat. | US-006; BR-015 |
| **FR-013** | **Peringatan potensi order ganda** — sistem memeriksa order aktif dengan komponen sama pada episode dan meminta konfirmasi eksplisit apabila ditemukan. | US-007; BR-019 |
| **FR-014** | **Validasi form** — sistem menjalankan seluruh validasi field wajib dan menampilkan pesan pada field atau bagian yang bermasalah. | US-008; BR-007 s.d. BR-012 |
| **FR-015** | **Penyimpanan atomik** — sistem menyimpan header dan semua detail item sebagai satu order baru, mempersistenkan nomor order, dan tidak menimpa order sebelumnya. | US-008; BR-020; BR-024 |
| **FR-016** | **Penerusan ke UTSD** — setelah penyimpanan berhasil, sistem menetapkan status awal **Menunggu Konfirmasi** dan membuat order tersedia bagi UTSD. | US-008; BR-021; BR-028 |
| **FR-017** | **Read-only setelah simpan bagi unit pengirim** — sistem tidak menyediakan aksi edit, hapus, atau batal kepada user unit pengirim setelah order berhasil disimpan. | US-009; BR-022 |
| **FR-018** | **Audit penciptaan** — sistem mencatat created_at, created_by, episode, unit asal, serta dokter pemohon. | US-010; BR-025 |
| **FR-019** | **Pembatasan lingkup tampilan** — form order tidak menampilkan riwayat, progres, atau fitur print. | US-011; BR-026 |
| **FR-020** | **Feedback proses** — sistem menampilkan notifikasi berhasil atau pesan gagal yang menjelaskan tindakan koreksi yang diperlukan. | US-008; NFR-007 |

## 10. User Stories

> Format acceptance criteria menggunakan pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **user pelayanan**, saya ingin membuka Permintaan Darah dari pasien Rawat Jalan, Rawat Inap, atau IGD, sehingga order terikat pada konteks pelayanan yang benar. | 1) Given pasien memiliki episode aktif, When user membuka **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**, Then form terbuka dengan identitas pasien dan episode yang sesuai. 2) Given user bukan dokter tetapi memiliki hak akses, When membuka fitur, Then user tetap dapat membuat order. | FR-001 s.d. FR-004; BR-001 s.d. BR-004 |
| **US-002** | Sebagai **user pelayanan**, saya ingin nomor order, waktu permintaan, rencana transfusi, dan dokter pemohon dikelola dengan benar, sehingga data order akurat. | 1) Given form dibuka, When data dimuat, Then nomor order ditampilkan tetapi belum menjadi record tersimpan. 2) Given user mengisi rencana, When nilai sama dengan atau lebih kecil dari waktu permintaan, Then simpan ditolak. 3) Given form dibuka, Then tanggal dan waktu rencana kosong tanpa default. | FR-005 s.d. FR-007; BR-005 s.d. BR-008 |
| **US-003** | Sebagai **petugas pelayanan non-dokter**, saya ingin Dokter Pemohon terisi dari DPJP episode tetapi tetap dapat diubah, sehingga order mencatat dokter yang bertanggung jawab. | Given user non-dokter membuka form, When DPJP episode tersedia, Then Dokter Pemohon terisi DPJP dan dapat diganti melalui lookup sebelum simpan. | FR-007; BR-008 |
| **US-004** | Sebagai **user pelayanan**, saya ingin memilih diagnosis dari episode/EMR maupun ICD-10, sehingga indikasi transfusi dapat dicatat secara lengkap. | 1) Given diagnosis episode tersedia, When lookup dibuka, Then diagnosis episode dapat dipilih. 2) Given diagnosis tidak tersedia pada episode, When user mencari ICD-10, Then diagnosis master dapat dipilih. 3) Given diagnosis yang sama berasal dari dua sumber, Then sistem menyimpannya satu kali. | FR-008; BR-009; BR-010 |
| **US-005** | Sebagai **user pelayanan**, saya ingin memilih Belum Tahu untuk golongan darah atau rhesus, sehingga order tetap dapat dibuat ketika data belum tersedia. | 1) Given golongan darah atau rhesus belum diketahui, When user memilih **Belum Tahu**, Then order tetap dapat disimpan apabila validasi lain terpenuhi. 2) Given nilai berbeda dengan Master Pasien, When user menyimpan, Then sistem tidak memblokir dan tidak meminta konfirmasi khusus. | FR-009; BR-016 s.d. BR-018 |
| **US-006** | Sebagai **user pelayanan**, saya ingin menambahkan beberapa komponen darah dengan jumlah kantong masing-masing, sehingga kebutuhan transfusi dapat dicatat dalam satu order. | 1) Given komponen dan jumlah valid, When **Tambahkan ke Daftar** dipilih, Then item tampil pada daftar. 2) Given komponen yang sama sudah ada, When ditambahkan kembali, Then sistem menawarkan pembaruan jumlah dan tidak membuat baris baru. 3) Given jumlah > 0, Then sistem menerima tanpa batas maksimum bisnis pada fase ini. | FR-010 s.d. FR-012; BR-011 s.d. BR-015 |
| **US-007** | Sebagai **user pelayanan**, saya ingin diperingatkan ketika ada order aktif dengan komponen yang sama, sehingga saya dapat memeriksa potensi permintaan ganda. | Given order aktif dengan komponen sama ditemukan, When user menyimpan order baru, Then sistem menampilkan ringkasan peringatan dan meminta pilihan Lanjutkan atau Kembali Periksa. | FR-013; BR-019 |
| **US-008** | Sebagai **user pelayanan**, saya ingin order disimpan secara utuh dan diteruskan ke UTSD, sehingga tidak ada data header atau detail yang hilang. | 1) Given seluruh data valid, When Simpan dipilih, Then header dan detail tersimpan dalam satu transaksi, nomor order dipersistenkan, dan status awal menjadi **Menunggu Konfirmasi**. 2) Given penyimpanan database gagal, Then tidak ada order parsial dan sistem menampilkan pesan gagal. 3) Given database berhasil tetapi handoff UTSD gagal, Then perilaku mengikuti keputusan teknis yang masih perlu dikonfirmasi. | FR-014 s.d. FR-016; FR-020; BR-020; BR-021; BR-028 |
| **US-009** | Sebagai **user unit pengirim**, saya ingin mengetahui bahwa order yang sudah disimpan tidak dapat diedit atau dibatalkan dari fitur ini, sehingga perubahan pasca-order tetap dikendalikan UTSD. | Given order berhasil disimpan, When user unit pengirim membuka detail order melalui fitur terkait, Then tidak tersedia aksi edit, hapus, atau batal. | FR-017; BR-022; BR-023 |
| **US-010** | Sebagai **auditor/administrator**, saya ingin mengetahui siapa yang membuat order dan dokter pemohonnya, sehingga penciptaan order dapat ditelusuri. | Given order berhasil dibuat, When data order diperiksa, Then created_by, created_at, episode, unit asal, dan dokter pemohon tersedia. | FR-018; BR-025 |
| **US-011** | Sebagai **product owner**, saya ingin fitur ini fokus pada pembuatan order, sehingga riwayat, progres, dan print tidak tumpang tindih dengan PRD lain. | Given form order dibuka, When halaman tampil, Then tidak terdapat tabel riwayat, pemantauan progres, atau aksi print. | FR-019; BR-026 |

## 11. Data Requirements (Spesifikasi Field)

> Field demografi dan konteks pelayanan **reuse definisi kanonik dari modul Pelayanan Rawat Jalan, Rawat Inap, IGD, dan Master Pasien** — nama, tipe, format, serta validasi harus sama. Data penjamin tidak termasuk kebutuhan field pada PRD ini.

### A. Layar INPUT — Konteks Pasien dan Order

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `patient_id` | ID Pasien | hidden/reference | Ya | Referensi pasien valid | Konteks pelayanan | Tidak dapat diubah user. |
| `medical_record_number` | No. RM | text read-only | Ya | Format No. RM kanonik | Master Pasien | Ditampilkan pada header pasien. |
| `patient_name` | Nama | text read-only | Ya | Nama pasien kanonik | Master Pasien | Ditampilkan pada header pasien. |
| `birth_date` | Tanggal Lahir | date read-only | Ya | `DD/MM/YYYY` | Master Pasien | Ditampilkan pada header pasien. |
| `patient_age` | Usia | calculated read-only | Ya | Tahun/bulan/hari sesuai aturan kanonik | Perhitungan sistem | Mengikuti waktu form dibuka. |
| `encounter_id` | ID Episode/Registrasi | hidden/reference | Ya | Episode harus aktif | Modul pelayanan asal | Kunci pengikat order. |
| `service_type` | Jenis Pelayanan | enum read-only | Ya | Rawat Jalan / Rawat Inap / IGD | Modul pelayanan asal | Tidak dapat diubah user. |
| `origin_unit_id` | Unit Asal | lookup read-only | Ya | Unit valid dan aktif | Episode pelayanan | Disimpan sebagai referensi dan snapshot. |
| `transfusion_order_number_preview` | No. Order Transfusi | text read-only | Ya | Unik; format `[PERLU KONFIRMASI]` | Generator nomor order | Ditampilkan pada form; belum dipersistenkan sebagai order sebelum simpan berhasil. |
| `request_datetime_preview` | Tanggal Permintaan | datetime read-only | Ya | `DD-MM-YYYY HH:mm:ss` | Waktu sistem | Nilai final dipersistenkan ketika simpan berhasil. |
| `planned_transfusion_date` | Tanggal Rencana Transfusi | date picker | Ya | Gabungan tanggal/waktu harus > waktu permintaan | Manual; tanpa default | Tidak boleh kosong. |
| `planned_transfusion_time` | Waktu Rencana Transfusi | time picker/input | Ya | `HH:mm`; gabungan tanggal/waktu harus > waktu permintaan | Manual; tanpa default | Tidak boleh kosong. |
| `requesting_doctor_id` | Dokter Pemohon | searchable lookup | Ya | Satu dokter valid dan aktif | Dokter login atau DPJP episode sesuai konteks | Editable sebelum simpan. |
| `diagnosis_ids` | Diagnosis | multi-select searchable lookup | Ya | Minimal 1; tidak boleh duplikat | Diagnosis episode/EMR + Master ICD-10 | Menyimpan referensi, kode, nama, dan sumber diagnosis. |
| `blood_group` | Golongan Darah | dropdown | Tidak | A / B / AB / O / Belum Tahu | Manual; dapat memanfaatkan data Master Pasien | Perbedaan dengan master tidak memblokir atau memicu konfirmasi khusus. |
| `rhesus` | Rhesus | dropdown/radio | Tidak | Positif / Negatif / Belum Tahu | Manual; dapat memanfaatkan data Master Pasien | Dapat dipilih independen dari Golongan Darah. |

### B. Layar INPUT — Penambahan Komponen Darah

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `blood_component_id` | Jenis Komponen Darah | searchable dropdown | Ya untuk menambah item | Komponen aktif; tidak boleh menjadi baris duplikat | Master Komponen Darah | Contoh v1: Whole Blood dan PRC; daftar final mengikuti master. |
| `bag_quantity` | Jumlah Kantong | number input | Ya untuk menambah item | Bilangan bulat positif, > 0; tidak ada batas maksimum bisnis | Manual | Satuan **kantong**. Validasi batas teknis tipe data mengikuti standar engineering. |
| `add_item_action` | Tambahkan ke Daftar | button | — | Aktif bila komponen dan jumlah valid | Aksi user | Menambahkan item tanpa menyimpan order. |

### C. Layar TAMPIL — Daftar Komponen Sebelum Simpan

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. | Urutan item form | Angka | Urutan penambahan | Nomor tampilan sementara. |
| Jenis Komponen Darah | Snapshot sementara nama komponen | Text | Tidak ada | Satu baris per jenis komponen. |
| Jumlah Kantong | `bag_quantity` | `{n} kantong` | Tidak ada | Harus > 0. |
| Aksi | Item form | Ikon/tombol Hapus | Tidak ada | Hanya aktif sebelum order disimpan. |

### D. Data yang Dibuat Otomatis saat Simpan

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| `transfusion_order_id` | ID Order | UUID/bigint | Dibuat otomatis dengan format YYMMDDXXXX| Primary identifier internal. |
| `transfusion_order_number` | No. Order Transfusi | text | Nomor yang telah ditampilkan pada form dan dikomit saat simpan | Harus unik; BR-005. |
| `request_datetime` | Tanggal/Waktu Permintaan | datetime | Waktu server saat transaksi berhasil | Menjadi acuan validasi rencana. |
| `initial_status` | Status Awal | enum | `MENUNGGU_KONFIRMASI` | Status lanjutan dikelola UTSD. |
| `patient_snapshot` | Snapshot Pasien | object/json/reference snapshot | Dari Master Pasien saat simpan | Minimal No. RM, nama, dan tanggal lahir. |
| `encounter_snapshot` | Snapshot Episode | object/json/reference snapshot | Dari episode pelayanan saat simpan | Minimal jenis pelayanan dan unit asal. |
| `requesting_doctor_snapshot` | Snapshot Dokter Pemohon | object/json/reference snapshot | Dari Master Staf/Dokter | Berbeda dari user pembuat apabila order dibuat user non-dokter. |
| `diagnosis_snapshot` | Snapshot Diagnosis | array/object | Dari diagnosis terpilih | Menyimpan kode, nama, dan sumber diagnosis. |
| `blood_group_snapshot` | Golongan Darah Order | enum | Nilai terpilih | Termasuk nilai Belum Tahu. |
| `rhesus_snapshot` | Rhesus Order | enum | Nilai terpilih | Termasuk nilai Belum Tahu. |
| `order_item_id` | ID Detail Order | UUID/bigint | Dibuat otomatis per item | Satu ID per komponen darah. |
| `blood_component_snapshot` | Snapshot Komponen Darah | object | Dari Master Komponen Darah | Menyimpan kode/nama komponen saat order. |
| `created_at` | Waktu Dibuat | datetime | Waktu server | Audit trail minimum. |
| `created_by` | Dibuat Oleh | user reference | User login | Dapat berupa dokter atau petugas pelayanan lain. |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Form order harus terbuka dalam waktu < 1 detik pada kondisi operasional normal. | Performance Expectation user; Metrik |
| **NFR-002** | Responsivitas | Penambahan, pembaruan, atau penghapusan item pada daftar harus memberikan respons < 1 detik. | Performance Expectation user; FR-011; FR-012 |
| **NFR-003** | Performa | Penyimpanan order harus selesai < 1 detik pada kondisi layanan internal normal. | Performance Expectation user; FR-015 |
| **NFR-004** | Skalabilitas | Sistem harus mendukung puluhan hingga ratusan order transfusi darah per hari dari berbagai unit pelayanan tanpa penurunan fungsi. | Behavior user |
| **NFR-005** | Konsistensi | Entry point, field, dan validasi harus konsisten pada Rawat Jalan, Rawat Inap, dan IGD, kecuali konteks episode dan unit asal. | BR-001; BR-002; FR-001 |
| **NFR-006** | Reliabilitas | Penyimpanan header dan detail pada database wajib atomik serta tidak menghasilkan order parsial. Penanganan kegagalan handoff ke UTSD setelah database berhasil masih perlu dikonfirmasi. | BR-020; BR-028; FR-015; FR-016 |
| **NFR-007** | Usability | Pesan validasi dan kegagalan harus spesifik, menggunakan bahasa yang dipahami user, dan menunjukkan field atau tindakan koreksi. | FR-014; FR-020 |
| **NFR-008** | Auditabilitas | Sistem wajib menyimpan created_at, created_by, episode, unit asal, dan dokter pemohon untuk setiap order. | BR-025; FR-018 |
| **NFR-009** | Keamanan/RBAC | Hanya user pelayanan yang memiliki hak akses Order Permintaan Darah pada pelayanan terkait yang dapat membuka dan menyimpan order; akses tidak dibatasi hanya pada dokter. | BR-003; FR-003 |
| **NFR-010** | Integritas Data | Referensi pasien, episode, dokter, diagnosis, dan komponen darah harus tervalidasi sebelum transaksi disimpan. | BR-004; BR-008 s.d. BR-012 |
| **NFR-011** | Ergonomi UI | Data pasien dan header order dipisahkan secara visual dari area penambahan komponen; daftar item harus mudah dibaca ketika berisi beberapa komponen. | Aspek UX user |
| **NFR-012** | Real-Time | Order yang berhasil disimpan harus ditargetkan tersedia bagi UTSD tanpa input ulang manual; strategi kegagalan handoff masih `[PERLU KONFIRMASI]`. | Main Goals; FR-016; BR-028 |
| **NFR-013** | Keunikan | Nomor order yang dipersistenkan harus tetap unik pada kondisi concurrent save. | BR-005; FR-005; FR-015 |

## 13. Integrasi Internal & Dependency

> Fitur tidak memiliki integrasi eksternal yang disebutkan pada sumber. Seluruh dependency merupakan modul dan master data internal SIMRS Neurovi v2.

| Integrasi / Dependency | Fungsi di Modul Ini | Status | Trace |
|------------------------|----------------------|--------|-------|
| Pelayanan Rawat Jalan | Menyediakan pasien, encounter, unit asal, validasi aktif, dan entry point. | Internal | FR-001; FR-002; FR-004 |
| Pelayanan Rawat Inap | Menyediakan pasien, encounter, unit asal, validasi aktif, dan entry point. | Internal | FR-001; FR-002; FR-004 |
| Pelayanan IGD | Menyediakan pasien, encounter, unit asal, validasi aktif, dan entry point. | Internal | FR-001; FR-002; FR-004 |
| Master Pasien | Menyediakan demografi dan data golongan darah/rhesus apabila tersedia. | Internal | FR-004; FR-009 |
| Master Staf/Dokter | Menyediakan default dan lookup dokter pemohon. | Internal | FR-007 |
| EMR/Diagnosis Episode | Menyediakan diagnosis yang telah tercatat pada episode. | Internal | FR-008 |
| Master ICD-10 | Menyediakan pencarian diagnosis tambahan. | Internal | FR-008 |
| Master Komponen Darah | Menyediakan daftar jenis komponen aktif. | Internal | FR-010 |
| UTSD | Menerima order berstatus Menunggu Konfirmasi serta menjalankan proses lanjutan. | Internal; mekanisme kegagalan handoff `[PERLU KONFIRMASI]` | FR-016; BR-028 |
| PRD Pelayanan/Konfirmasi Permintaan Darah UTSD | Mengatur pembatalan order, pembaruan golongan darah/rhesus, dan status lanjutan. | Hard dependency untuk proses pasca-order | BR-023 |
| PRD Riwayat Pemeriksaan Penunjang | Mengatur riwayat order dan akses detail. | Dokumen terpisah | BR-026 |
| PRD Output Print Permintaan Darah | Mengatur output print. | Dokumen/tiket terpisah | BR-026 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Validasi episode aktif pada RJ/RI/IGD | Hard | Order tidak dapat dipastikan terikat ke episode yang valid. |
| Master Staf/Dokter | Hard | Dokter pemohon tidak dapat diberikan default atau dipilih. |
| EMR/Diagnosis Episode dan Master ICD-10 | Hard | Validasi minimal satu diagnosis tidak dapat dipenuhi secara lengkap. |
| Master Komponen Darah | Hard | User tidak dapat menambahkan detail permintaan. |
| Penerimaan order UTSD | Hard | Order tidak dapat ditindaklanjuti oleh unit penerima. |
| Master Golongan Darah/Rhesus pasien | Soft | Order tetap dapat dibuat menggunakan input manual atau Belum Tahu. |
| PRD Riwayat dan Output Print | Soft untuk pembuatan order | Pembuatan order tetap berjalan tanpa riwayat dan print pada fitur ini. |

## 14. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| **D-001** | Entry point | Pada Rawat Jalan, Rawat Inap, dan IGD: **Penunjang Medis → Tambah Baru → Pilih Penunjang → Permintaan Darah**. |
| **D-002** | User pembuat | Order tidak hanya dibuat dokter; petugas pelayanan lain yang memiliki hak akses dapat membuat order. |
| **D-003** | Default dokter | Dokter Pemohon memiliki default dari dokter login atau DPJP episode sesuai konteks dan dapat disesuaikan sebelum simpan. |
| **D-004** | Sumber diagnosis | Diagnosis merupakan kombinasi diagnosis episode/EMR dan Master ICD-10. |
| **D-005** | Nomor order | Ditampilkan pada form, tetapi baru dipersistenkan saat simpan berhasil. |
| **D-006** | Default rencana | Tanggal dan waktu rencana tidak memiliki nilai default. |
| **D-007** | Validasi rencana | Gabungan tanggal dan waktu rencana harus lebih besar dari tanggal dan waktu permintaan. |
| **D-008** | Golongan darah/rhesus | Keduanya memiliki pilihan **Belum Tahu**. |
| **D-009** | Perbedaan dengan Master Pasien | Tidak memblokir simpan dan tidak memerlukan warning/konfirmasi khusus. |
| **D-010** | Jumlah kantong | Belum ada batas maksimum bisnis per komponen atau per order. |
| **D-011** | Aksi setelah simpan | User unit pengirim tidak dapat edit atau batal; petugas UTSD dapat membatalkan dan memperbarui golongan darah/rhesus pada proses terpisah. |
| **D-012** | Pencetakan | Dibuat melalui tiket dan PRD terpisah. |
| **D-013** | Nomenklatur unit penerima | Menggunakan istilah **UTSD**. |
| **D-014** | Riwayat | Seluruh fungsi riwayat dan pemantauan dikeluarkan dari PRD ini. |

## 15. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| **R1** | User membuat order ganda untuk komponen yang sama karena riwayat tidak ditampilkan pada form. | Sistem memeriksa order aktif dan menampilkan peringatan serta konfirmasi eksplisit sebelum simpan. |
| **R2** | Golongan darah atau rhesus pasien belum tersedia saat order dibuat. | Sediakan pilihan **Belum Tahu** pada kedua field dan izinkan petugas UTSD memperbaruinya pada proses lanjutan. |
| **R3** | Data header tersimpan tanpa detail atau sebaliknya. | Gunakan transaksi database atomik dan rollback seluruh transaksi database apabila salah satu bagian gagal. |
| **R4** | User non-dokter membuat order tanpa dokter pemohon yang benar. | Isi default DPJP episode, sediakan lookup dokter, dan wajibkan dokter terpilih sebelum simpan. |
| **R5** | Nomor order yang ditampilkan bentrok ketika beberapa user menyimpan secara bersamaan. | Generator dan proses commit nomor harus menjamin keunikan pada saat transaksi simpan. |
| **R6** | Order berhasil tersimpan di database tetapi tidak tersedia bagi UTSD. | Mekanisme status, retry, rollback, dan notifikasi perlu diputuskan bersama tim teknis `[PERLU KONFIRMASI]`. |
| **R7** | Jumlah kantong sangat besar karena tidak terdapat batas maksimum bisnis. | Tetap gunakan validasi bilangan bulat positif dan batas teknis tipe data; batas bisnis dapat ditambahkan melalui perubahan requirement bila diperlukan. |

## 16. Asumsi

- `[ASUMSI]` Definisi episode pelayanan aktif mengikuti aturan status pada masing-masing modul Rawat Jalan, Rawat Inap, dan IGD.
- `[ASUMSI]` Untuk user dokter, default Dokter Pemohon menggunakan dokter login; untuk user non-dokter, default menggunakan DPJP episode. Jika default tidak tersedia, user wajib memilih dokter secara manual.
- `[ASUMSI]` Dokter Pemohon tetap dapat diubah sebelum order disimpan karena form v1 menyediakan lookup dokter.
- `[ASUMSI]` Data golongan darah dan rhesus Master Pasien dapat digunakan sebagai informasi atau nilai awal, tetapi nilai pada order tetap mengikuti pilihan user dan perbedaan tidak memicu blocking/warning khusus.
- `[ASUMSI]` Master Komponen Darah menyimpan daftar komponen aktif yang berlaku pada seluruh konteks pelayanan.
- `[ASUMSI]` Peringatan order aktif dengan komponen sama tidak memblokir mutlak karena pasien dapat memerlukan lebih dari satu order pada episode yang sama; user dapat melanjutkan setelah konfirmasi eksplisit.
- `[ASUMSI]` Form order tidak menampilkan riwayat, tetapi pemeriksaan duplikasi order aktif tetap dapat dilakukan oleh backend.

## 17. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 (Draft) | 21 Juli 2026 | Team Product | Membuat PRD Order Permintaan Transfusi Darah Neurovi v2 berdasarkan brief bisnis dan referensi UI v1; mengeluarkan seluruh fungsi riwayat dan monitoring ke PRD terpisah. |
| 1.1 (Draft) | 21 Juli 2026 | Team Product | Menetapkan entry point RJ/RI/IGD, akses tidak hanya dokter, default dokter pemohon, sumber diagnosis gabungan, mekanisme nomor order, rencana tanpa default, validasi waktu rencana, pilihan Belum Tahu pada golongan darah/rhesus, tidak ada blocking mismatch master, tidak ada batas maksimum kantong, larangan edit/batal oleh unit pengirim, kewenangan UTSD, serta pemisahan print ke tiket terpisah. |
