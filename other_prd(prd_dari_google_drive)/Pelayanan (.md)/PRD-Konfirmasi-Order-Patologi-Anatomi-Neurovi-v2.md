# PRD — Konfirmasi Order Patologi Anatomi

**Related Document:** PRD Dashboard Patologi Anatomi — *hard dependency dan entry point*; PRD Order Pemeriksaan Patologi Anatomi Neurovi v2; PRD Hasil Pemeriksaan Patologi Anatomi — *hard dependency*; Referensi form Permintaan Pemeriksaan Patologi Anatomi Neurovi v1  
**Dokumen ID:** PRD-LAB-PA-KONF-v2.3 · **Versi:** 1.3 (Draft — Revisi Hasil Konfirmasi Stakeholder)  
**Tanggal Disusun:** 21 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Product, System Analyst, UI/UX, Engineering, dan QA  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Konfirmasi Order Patologi Anatomi merupakan fitur yang digunakan petugas Laboratorium Patologi Anatomi untuk membuka, memeriksa, memperbaiki, dan mengonfirmasi order yang dipilih dari Dashboard Patologi Anatomi. PRD ini dimulai ketika pengguna memilih satu order pada Dashboard PA dan masuk ke detail order.

Seluruh fungsi Dashboard Patologi Anatomi—termasuk daftar order, pencarian, filter, sorting, pagination, tab status, statistik, dan bulk action—dijelaskan dalam PRD terpisah dan tidak termasuk dalam dokumen ini. Dashboard PA hanya menjadi **access point** menuju proses konfirmasi.

Sebelum order dikonfirmasi, petugas laboratorium yang memiliki hak akses dapat mengubah data order yang diizinkan langsung pada form detail. Apabila detail order diedit, aksi simpan akan menyimpan seluruh perubahan sekaligus otomatis mengonfirmasi order. Setelah proses simpan dan konfirmasi berhasil, data order dikunci dan menjadi read-only pada fitur ini.

Fitur juga mengatur perubahan status, pembatalan sebelum hasil tersedia, riwayat status, sinkronisasi data dan status ke unit pengirim tanpa indikator khusus bahwa order pernah diperbarui laboratorium, serta audit trail aktivitas. Audit pada layar tidak menampilkan rincian perubahan per field maupun nilai lama dan nilai baru.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Form Permintaan Pemeriksaan Patologi Anatomi menampilkan identitas pasien, jenis pemeriksaan, jaringan atau spesimen, diagnosis, keterangan klinis, sitologi, keganasan, Pap Smear, kontrasepsi, dan riwayat histopatologi.
- Belum terdapat batas proses yang jelas antara data yang masih dapat diperbaiki laboratorium dan data yang sudah diterima secara resmi.
- Audit aktivitas edit serta penguncian data setelah konfirmasi belum terdefinisi sebagai proses wajib.

**Masalah/pain point:**
- Petugas laboratorium membutuhkan kemampuan memperbaiki order sebelum diterima tanpa mengembalikan proses ke unit pengirim.
- Aktivitas perubahan sebelum konfirmasi harus dapat ditelusuri tanpa mewajibkan alasan perubahan atau tampilan rincian per field.
- Setelah order dikonfirmasi, data harus stabil agar proses pemeriksaan tidak menggunakan informasi yang berubah tanpa kontrol.
- Pembatalan dan perubahan status harus mengikuti kondisi order dan keberadaan hasil.

**Dampak yang disasar:**
- Mempercepat koreksi data sekaligus penerimaan order dalam satu aksi simpan.
- Mengunci data setelah order diterima laboratorium.
- Menjamin seluruh perubahan data dan status memiliki audit trail.
- Menjaga konsistensi data dan status antara Laboratorium PA dan unit pengirim.

## 3. In Scope

### Scope Definition

1. **Access point dari Dashboard PA** — pengguna memilih satu order untuk membuka proses konfirmasi.
2. **Menampilkan detail order** — data pasien, order, pemeriksaan, spesimen, diagnosis, dan informasi klinis.
3. **Edit sebelum konfirmasi** — petugas laboratorium berwenang dapat mengubah seluruh field detail order selama status `Menunggu Konfirmasi`, kecuali `Dokter Pengirim`. Data identitas pasien dan metadata sistem tetap read-only.
4. **Simpan perubahan sekaligus konfirmasi** — ketika petugas menyimpan detail yang telah diedit, sistem menyimpan perubahan dan otomatis mengubah status menjadi `Dikonfirmasi`.
5. **Konfirmasi tanpa perubahan** — apabila tidak ada perubahan detail, petugas dapat mengonfirmasi order secara langsung.
6. **Penguncian data** — seluruh field menjadi read-only setelah proses simpan dan konfirmasi berhasil.
7. **Perubahan status** — mengikuti state machine yang ditetapkan.
8. **Pembatalan** — hanya sebelum hasil tersedia dan sebelum status `Selesai`.
9. **Alasan pembatalan wajib**.
10. **Riwayat status dan audit trail** — audit menampilkan aktivitas edit dan konfirmasi secara ringkas tanpa rincian perubahan per field atau nilai lama-baru.
11. **RBAC** — untuk melihat, mengedit, mengonfirmasi, membatalkan, dan melihat audit.
12. **Sinkronisasi internal** — perubahan data dan status tersedia pada modul Order PA dan unit pengirim tanpa badge, flag, atau indikator khusus bahwa order pernah diperbarui laboratorium.
13. **Penanganan konflik data** — mencegah penimpaan perubahan terbaru.
14. **Unsaved changes warning** — mencegah kehilangan perubahan yang belum disimpan.

### Out Scope

- Seluruh fungsi Dashboard Patologi Anatomi, meliputi daftar, pencarian, filter, sorting, pagination, grouping, tab status, statistik, summary, bulk action, dan pengaturan kolom.
- Pembuatan order baru.
- Pengaturan navigasi dan desain Dashboard PA selain bahwa order dipilih dari dashboard.
- Input, validasi, verifikasi, dan cetak hasil Patologi Anatomi.
- Cetak surat permintaan.
- Pengelolaan master pemeriksaan, spesimen, unit, staf, dan role.
- Perubahan order setelah status `Dikonfirmasi`.
- Aktivasi kembali order `Dibatalkan`.
- Integrasi pihak ketiga.

## 4. Goals and Metrics

### Tujuan

Menyediakan proses konfirmasi Order Patologi Anatomi yang terkontrol, memungkinkan seluruh data detail order—kecuali Dokter Pengirim—diperbaiki dan langsung dikonfirmasi saat disimpan, mengunci data setelah konfirmasi, serta memastikan setiap aktivitas perubahan memiliki jejak audit yang memadai.

### Metrik

| Metrik | Target | Sumber |
|---|---:|---|
| Membuka detail order setelah dipilih | ≤ 2 detik | NFR-001 |
| Menyimpan perubahan sekaligus mengonfirmasi order | ≤ 1 detik | NFR-002 |
| Konfirmasi order | ≤ 1 detik | NFR-002 |
| Pembatalan order | ≤ 1 detik | NFR-002 |
| Transaksi edit dan konfirmasi yang memiliki audit trail | 100% | BR-014 |
| Perubahan order setelah dikonfirmasi melalui fitur ini | 0 transaksi berhasil | BR-007 |
| Pembatalan setelah hasil tersedia | 0 transaksi berhasil | BR-011 |
| Transisi status tidak valid | 0 transaksi berhasil | BR-009 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran |
|---|---|
| **Dashboard Patologi Anatomi** | Entry point dan penyedia konteks order terpilih; seluruh fungsi dashboard diatur pada PRD terpisah. |
| **Order Pemeriksaan Patologi Anatomi** | Sumber definisi field, validasi, data klinis, pemeriksaan, dan spesimen. |
| **Hasil Pemeriksaan Patologi Anatomi** | Sumber indikator keberadaan hasil dan event status lanjutan. |
| **Dashboard/EMR Unit Pengirim** | Menampilkan data dan status terbaru kepada unit pengirim. |
| **Master Unit dan Master Staf** | Sumber unit, dokter pengirim, dan identitas petugas. |
| **Authentication & RBAC** | Mengatur hak akses setiap aksi. |
| **Audit Trail Internal** | Menyimpan aktivitas edit, konfirmasi, perubahan status, dan pembatalan terhadap order. |

### B. Persona

| Persona | Tipe | Peran |
|---|---|---|
| Petugas Laboratorium PA | Primary | Memeriksa order, mengedit detail sebelum konfirmasi, serta menyimpan perubahan yang sekaligus mengonfirmasi order. |
| Analis/Supervisor Laboratorium | Primary | Mengubah status dan membatalkan sesuai permission. |
| Dokter/Perawat/Bidan Unit Pengirim | Secondary | Melihat data dan status terbaru. |
| Administrator Rumah Sakit | Secondary | Mengelola permission. |
| Auditor/QA Internal | Tersier | Menelusuri aktivitas edit, konfirmasi, perubahan status, dan pembatalan. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is

1. Pengguna membuka form Permintaan Pemeriksaan Patologi Anatomi.
2. Sistem menampilkan data pasien dan order secara lengkap.
3. Batas edit sebelum dan sesudah penerimaan laboratorium belum terdefinisi tegas.
4. Audit aktivitas edit dan kontrol konflik belum menjadi bagian eksplisit proses.

### B. To-Be

1. Petugas membuka Dashboard Patologi Anatomi.
2. Petugas memilih satu order.
3. Dashboard meneruskan `order_id` ke fitur Konfirmasi Order PA.
4. Sistem memuat data terkini dan menentukan mode form berdasarkan status dan permission.
5. Bila status `Menunggu Konfirmasi`, field yang diizinkan dapat diedit.
6. Apabila petugas tidak mengubah detail, petugas dapat memilih `Konfirmasi Order` secara langsung.
7. Apabila petugas mengubah detail, petugas memilih `Simpan & Konfirmasi`.
8. Sistem memvalidasi data, status, versi data, dan permission.
9. Sistem menyimpan seluruh perubahan dan otomatis mengubah status menjadi `Dikonfirmasi` dalam satu transaksi. Audit mencatat aktivitas `Edit & Konfirmasi Order` secara ringkas tanpa menampilkan rincian per field atau nilai lama-baru.
10. Setelah transaksi berhasil, sistem mengunci form menjadi read-only.
11. Modul Hasil PA memicu status `Hasil Pemeriksaan Terbit` dan `Selesai` sesuai proses hasil.
12. Pengguna berwenang dapat membatalkan order selama belum terdapat hasil dan status belum `Selesai`.
13. Semua perubahan tersinkronisasi ke modul terkait dan dicatat pada audit trail.

## 7. Main Flow / Mindmap

### Skenario 1 — Membuka Order dari Dashboard PA

1. Pengguna memilih satu order pada Dashboard PA.
2. Sistem membuka form berdasarkan `order_id`.
3. Sistem mengambil data terbaru.
4. Sistem menampilkan detail order dan status.
5. Mode form ditentukan sebagai:
   - `Editable` bila status `Menunggu Konfirmasi` dan permission edit tersedia.
   - `Read-only` untuk kondisi lainnya.

### Skenario 2 — Edit, Simpan, dan Otomatis Konfirmasi

1. Order berstatus `Menunggu Konfirmasi`.
2. Petugas mengubah field yang diizinkan.
3. Aksi utama ditampilkan sebagai `Simpan & Konfirmasi`.
4. Petugas memilih `Simpan & Konfirmasi`.
5. Sistem memvalidasi field, status, versi data, dan permission.
6. Jika valid, sistem menyimpan seluruh perubahan dan otomatis mengubah status menjadi `Dikonfirmasi` dalam satu transaksi.
7. Audit trail mencatat aktivitas `Edit & Konfirmasi Order`, status sebelum, status sesudah, pengguna, role, unit, dan waktu tanpa rincian perubahan per field.
8. Form menjadi read-only setelah transaksi berhasil.
9. Data dan status terbaru disinkronkan ke modul Order PA dan unit pengirim.

### Skenario 3 — Konfirmasi Tanpa Perubahan

1. Order masih `Menunggu Konfirmasi` dan tidak terdapat perubahan detail.
2. Petugas memilih `Konfirmasi Order`.
3. Sistem memvalidasi kelengkapan, status terkini, dan permission.
4. Status berubah menjadi `Dikonfirmasi`.
5. Form menjadi read-only.
6. Audit dan sinkronisasi dijalankan.

### Skenario 4 — Kegagalan Simpan dan Konfirmasi

1. Petugas telah mengubah detail order dan memilih `Simpan & Konfirmasi`.
2. Sistem memproses perubahan data dan perubahan status dalam satu transaksi.
3. Jika validasi atau salah satu proses gagal, perubahan data dan status tidak boleh tersimpan sebagian.
4. Status tetap `Menunggu Konfirmasi` dan form tetap editable.
5. Sistem menampilkan penyebab kegagalan agar petugas dapat memperbaiki data dan mencoba kembali.

### Skenario 5 — Perubahan Belum Disimpan

1. Pengguna mengubah data tetapi belum menyimpan.
2. Pengguna menutup atau meninggalkan form.
3. Sistem menampilkan peringatan perubahan belum disimpan.
4. Pengguna dapat kembali ke form atau membuang perubahan. Apabila pengguna memilih menyimpan, sistem menjalankan `Simpan & Konfirmasi` sehingga order otomatis menjadi `Dikonfirmasi`.

### Skenario 6 — Konflik Data

1. Order diubah atau dikonfirmasi oleh pengguna lain setelah form dibuka.
2. Pengguna pertama mencoba menyimpan atau mengonfirmasi.
3. Sistem mendeteksi versi data berbeda.
4. Transaksi ditolak dan data terbaru dimuat.
5. Perubahan lokal tidak boleh langsung menimpa data terbaru.

### Skenario 7 — Pembatalan

1. Pengguna memilih `Batalkan Order`.
2. Sistem menampilkan preview order dan input alasan.
3. Sistem memvalidasi permission, status, dan keberadaan hasil.
4. Jika valid, status berubah menjadi `Dibatalkan`.
5. Alasan dan aktivitas dicatat pada audit trail.
6. Order tidak dapat diaktifkan kembali.

## 8. Business Rules

| ID | Rule | Trace |
|---|---|---|
| **BR-001** | Fitur konfirmasi dibuka dari order yang dipilih pada Dashboard PA. | FR-001 |
| **BR-002** | Seluruh fungsi dashboard berada pada PRD Dashboard PA dan tidak termasuk dalam PRD ini. | FR-023 |
| **BR-003** | Seluruh field detail order dapat diedit saat status `Menunggu Konfirmasi`, kecuali `Dokter Pengirim`. Identitas pasien, Nomor Order, status, versi data, dan metadata sistem tetap read-only. | FR-004; FR-005 |
| **BR-004** | Edit hanya tersedia bagi pengguna laboratorium dengan permission yang sesuai. | FR-018 |
| **BR-005** | Penyimpanan detail order yang telah diedit wajib sekaligus mengubah status order menjadi `Dikonfirmasi`. Tidak tersedia penyimpanan perubahan yang mempertahankan status `Menunggu Konfirmasi`. | FR-006; FR-009 |
| **BR-006** | Pengguna tidak diwajibkan mengisi alasan perubahan ketika mengedit field detail order. Alasan tetap wajib khusus untuk pembatalan order. | FR-006; FR-012 |
| **BR-007** | Setelah `Dikonfirmasi`, seluruh field menjadi read-only pada fitur ini. | FR-009 |
| **BR-008** | Tidak tersedia proses koreksi order melalui fitur ini setelah order dikonfirmasi. | FR-022 |
| **BR-009** | Perubahan status harus mengikuti state machine. | FR-011 |
| **BR-010** | `Hasil Pemeriksaan Terbit` berarti hasil sudah diinput dan belum menjadi status akhir. | FR-011 |
| **BR-011** | Pembatalan hanya dapat dilakukan bila belum ada hasil dan status belum `Selesai`. | FR-013 |
| **BR-012** | Alasan pembatalan wajib diisi, tidak boleh hanya berisi spasi, dan dibatasi maksimal 250 karakter. | FR-012 |
| **BR-013** | Order `Dibatalkan` tidak dapat diproses atau diaktifkan kembali. | FR-014 |
| **BR-014** | Edit yang disimpan sekaligus terkonfirmasi, konfirmasi tanpa perubahan, perubahan status, dan pembatalan wajib menghasilkan audit trail. | FR-015 |
| **BR-015** | Audit trail pada layar menampilkan aktivitas secara ringkas dan tidak menampilkan rincian perubahan per field maupun nilai lama-baru. Audit minimal menyimpan waktu, pengguna, role, unit, jenis aktivitas, status sebelum-sesudah, dan alasan apabila ada. | FR-007; FR-015 |
| **BR-016** | `Dokter Pengirim` tidak dapat diubah oleh petugas Laboratorium PA. | FR-003; FR-004 |
| **BR-017** | Definisi dan validasi seluruh field detail order mengikuti PRD Order Pemeriksaan Patologi Anatomi. | FR-005 |
| **BR-018** | Status dan versi data harus divalidasi ulang pada server sebelum simpan atau konfirmasi. | FR-008 |
| **BR-019** | Penyimpanan detail yang diedit dan perubahan status menjadi `Dikonfirmasi` harus diproses secara atomik dalam satu transaksi. | FR-010 |
| **BR-020** | Data dan status yang berhasil diubah harus tersinkronisasi ke modul terkait, tetapi unit pengirim tidak memperoleh badge, flag, atau indikator khusus bahwa order pernah diperbarui laboratorium. | FR-016 |
| **BR-021** | Aksi ditampilkan atau diaktifkan berdasarkan status, hasil, dirty state, dan permission. | FR-019 |
| **BR-022** | Pengguna harus diperingatkan sebelum meninggalkan perubahan belum disimpan; apabila memilih simpan, sistem wajib menyimpan perubahan sekaligus mengonfirmasi order. | FR-021 |
| **BR-023** | `Selesai` dan `Dibatalkan` merupakan status terminal. | State Machine |
| **BR-024** | Audit trail tidak dapat diubah melalui fitur ini. | FR-015 |
| **BR-025** | Role default untuk edit, konfirmasi, pembatalan, dan melihat audit belum ditetapkan; implementasi menggunakan permission yang dapat dikonfigurasi sampai keputusan role final tersedia. | FR-018; Pertanyaan Terbuka |

## 9. State Machine

### 9.1 Definisi Status

| Status | Makna | Mode Form | Jenis |
|---|---|---|---|
| **Menunggu Konfirmasi** | Order belum diterima laboratorium. | Editable sesuai permission | Aktif |
| **Dikonfirmasi** | Order telah diterima laboratorium. | Read-only | Aktif |
| **Hasil Pemeriksaan Terbit** | Hasil telah diinput dan menunggu finalisasi/verifikasi bila berlaku. | Read-only | Aktif |
| **Selesai** | Pemeriksaan selesai dan hasil tersedia. | Read-only | Terminal |
| **Dibatalkan** | Order dibatalkan sebelum hasil diinput. | Read-only | Terminal |

### 9.2 Transisi

| Status Awal | Aksi/Event | Status Tujuan | Kondisi |
|---|---|---|---|
| Menunggu Konfirmasi | Simpan detail yang diedit | Dikonfirmasi | Data valid, versi belum berubah, dan permission edit/konfirmasi tersedia |
| Menunggu Konfirmasi | Konfirmasi tanpa perubahan | Dikonfirmasi | Data lengkap dan permission konfirmasi tersedia |
| Menunggu Konfirmasi | Batal | Dibatalkan | Belum ada hasil dan alasan diisi |
| Dikonfirmasi | Hasil diinput | Hasil Pemeriksaan Terbit | Event Modul Hasil PA |
| Dikonfirmasi | Batal | Dibatalkan | Belum ada hasil dan permission tersedia |
| Hasil Pemeriksaan Terbit | Hasil final | Selesai | Event Modul Hasil PA |

### 9.3 Aksi per Status

| Status | Edit | Simpan | Konfirmasi | Batalkan |
|---|---|---|---|---|
| Menunggu Konfirmasi | Sesuai permission | `Simpan & Konfirmasi` bila ada perubahan valid | `Konfirmasi Order` bila tidak ada perubahan | Bila belum ada hasil |
| Dikonfirmasi | Tidak | Tidak | Tidak | Bila belum ada hasil |
| Hasil Pemeriksaan Terbit | Tidak | Tidak | Tidak | Tidak |
| Selesai | Tidak | Tidak | Tidak | Tidak |
| Dibatalkan | Tidak | Tidak | Tidak | Tidak |

## 10. User Stories

| ID | User Story | Acceptance Criteria | Trace |
|---|---|---|---|
| **US-001** | Sebagai petugas laboratorium, saya ingin membuka order dari Dashboard PA agar dapat memulai proses konfirmasi. | Given order dipilih, When detail dibuka, Then sistem memuat order yang sesuai dan menentukan mode form. | FR-001; FR-002 |
| **US-002** | Sebagai petugas laboratorium, saya ingin memeriksa detail order agar dapat memastikan datanya benar. | Detail pasien, pemeriksaan, spesimen, diagnosis, dan informasi klinis ditampilkan. | FR-003 |
| **US-003** | Sebagai petugas laboratorium berwenang, saya ingin mengubah seluruh detail order selain Dokter Pengirim sebelum konfirmasi agar kekurangan data dapat diperbaiki langsung. | Given status `Menunggu Konfirmasi`, When permission edit tersedia, Then seluruh field detail order dapat diedit kecuali Dokter Pengirim dan metadata read-only. | FR-004; BR-003; BR-016 |
| **US-004** | Sebagai petugas laboratorium, saya ingin perubahan detail yang saya simpan langsung mengonfirmasi order agar koreksi dan penerimaan order selesai dalam satu proses. | Given detail telah diubah, When petugas memilih `Simpan & Konfirmasi`, Then perubahan tersimpan, status menjadi `Dikonfirmasi`, aktivitas audit tercatat, dan form menjadi read-only. | FR-006; FR-007; FR-009 |
| **US-005** | Sebagai petugas laboratorium berwenang, saya ingin mengonfirmasi order tanpa perubahan agar order resmi diterima Lab PA. | Status menjadi `Dikonfirmasi`, form terkunci, dan audit tercatat. | FR-009 |
| **US-006** | Sebagai petugas laboratorium, saya ingin sistem mencegah lost update agar perubahan terbaru tidak tertimpa. | Versi data berbeda menyebabkan transaksi ditolak dan data terbaru dimuat. | FR-008; FR-020 |
| **US-007** | Sebagai pengguna berwenang, saya ingin membatalkan order yang belum memiliki hasil agar order tidak berlaku tidak diproses. | Alasan 1–250 karakter wajib, status menjadi `Dibatalkan`, dan order tidak dapat diaktifkan kembali. | FR-012; FR-013 |
| **US-008** | Sebagai auditor, saya ingin melihat aktivitas edit dan perubahan status agar tindakan terhadap order dapat ditelusuri. | Audit menampilkan waktu, pengguna, role, unit, jenis aktivitas, status sebelum-sesudah, dan alasan bila ada, tanpa rincian per field atau nilai lama-baru. | FR-015 |
| **US-009** | Sebagai pengguna, saya ingin mendapat peringatan sebelum meninggalkan perubahan agar data tidak hilang. | Given terdapat perubahan belum disimpan, When pengguna meninggalkan form, Then sistem menampilkan pilihan kembali, membuang perubahan, atau menjalankan `Simpan & Konfirmasi`. | FR-021 |
| **US-010** | Sebagai pengguna unit pengirim, saya ingin melihat data dan status terbaru tanpa indikator tambahan agar tampilan tetap sederhana. | Setelah transaksi berhasil, data dan status terbaru tersedia tanpa badge atau flag bahwa order pernah diedit laboratorium. | FR-016; BR-020 |

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|---|---|---|
| **FR-001** | Menerima `order_id` dari order yang dipilih pada Dashboard PA. | US-001; BR-001 |
| **FR-002** | Memuat data order terbaru serta menampilkan loading, error, atau not found. | US-001 |
| **FR-003** | Menampilkan identitas pasien, order, Dokter Pengirim, pemeriksaan, spesimen, diagnosis, dan data klinis. Identitas pasien, metadata sistem, dan Dokter Pengirim ditampilkan read-only. | US-002; BR-003; BR-016 |
| **FR-004** | Mengaktifkan seluruh field detail order selain Dokter Pengirim saat status `Menunggu Konfirmasi` dan permission edit tersedia. | US-003; BR-003; BR-004 |
| **FR-005** | Menggunakan definisi dan validasi field dari PRD Order PA. | BR-017 |
| **FR-006** | Menyediakan aksi `Simpan & Konfirmasi` untuk menyimpan detail yang diedit sekaligus otomatis mengubah status menjadi `Dikonfirmasi`. Sistem tidak meminta alasan perubahan. | US-004; BR-005; BR-006 |
| **FR-007** | Mencatat satu aktivitas audit ringkas `Edit & Konfirmasi Order` untuk transaksi perubahan tanpa menampilkan rincian per field atau nilai lama-baru. | US-004; BR-014; BR-015 |
| **FR-008** | Menggunakan versi data atau timestamp untuk mendeteksi konflik. | US-006; BR-018 |
| **FR-009** | Mengubah status menjadi `Dikonfirmasi` dan mengunci form setelah konfirmasi. | US-004; US-005; BR-007 |
| **FR-010** | Memproses penyimpanan seluruh perubahan detail, pencatatan audit, dan perubahan status menjadi `Dikonfirmasi` secara atomik. | BR-019 |
| **FR-011** | Memvalidasi setiap transisi terhadap state machine. | BR-009 |
| **FR-012** | Menampilkan modal pembatalan dengan preview order dan alasan wajib maksimal 250 karakter. | US-007; BR-012 |
| **FR-013** | Memvalidasi permission, status, dan keberadaan hasil sebelum pembatalan. | US-007; BR-011 |
| **FR-014** | Mencegah perubahan pada status terminal. | BR-013; BR-023 |
| **FR-015** | Menampilkan riwayat status dan audit trail aktivitas secara read-only sesuai permission, tanpa rincian perubahan per field dan tanpa nilai lama-baru. | US-008; BR-014; BR-015 |
| **FR-016** | Menyinkronkan perubahan data dan status ke Modul Order PA serta unit pengirim tanpa menampilkan indikator khusus bahwa order pernah diperbarui laboratorium. | US-010; BR-020 |
| **FR-017** | Menampilkan feedback loading, saving, success, validation, error, dan retry. | NFR-009 |
| **FR-018** | Memvalidasi permission pada server untuk setiap aksi. Role default belum ditentukan dan mengikuti konfigurasi permission rumah sakit. | BR-004; BR-025 |
| **FR-019** | Mengatur aksi berdasarkan kondisi form: `Konfirmasi Order` ketika tidak ada perubahan, `Simpan & Konfirmasi` ketika terdapat perubahan, serta aksi pembatalan dan riwayat sesuai status dan permission. | BR-021 |
| **FR-020** | Menolak transaksi saat terjadi konflik dan memuat data terbaru. | US-006 |
| **FR-021** | Menampilkan unsaved changes warning sebelum pengguna meninggalkan form; pilihan simpan harus menjalankan `Simpan & Konfirmasi`, bukan menyimpan sebagai perubahan sementara. | US-009; BR-022 |
| **FR-022** | Menampilkan detail secara read-only setelah konfirmasi dan tidak menyediakan proses koreksi order setelah dikonfirmasi. | BR-007; BR-008 |
| **FR-023** | Tidak mengimplementasikan fungsi daftar, filter, pencarian, sorting, pagination, tab, statistik, atau fungsi dashboard lainnya. | BR-002 |

## 12. Data Requirements

> Seluruh field mengikuti definisi kanonik pada PRD Order Pemeriksaan Patologi Anatomi.

### A. Konteks dari Dashboard PA

| Field | Tipe | Wajib | Sumber | Catatan |
|---|---|---|---|---|
| `order_id` | ID/UUID | Ya | Dashboard PA | Identitas order terpilih |
| `source_context` | Text/Enum | Tidak | Dashboard PA | Penanda akses dari dashboard |
| `return_context` | Object/URL internal | Tidak | Dashboard PA | Untuk kembali ke konteks sebelumnya |

### B. Field Read-Only

| Field | Label | Sumber | Catatan |
|---|---|---|---|
| `order_number` | Nomor Order PA | Order PA | Tidak dapat diubah |
| `patient_id` | Pasien | Data Pasien | Tidak dapat diubah |
| `medical_record_number` | Nomor RM | Data Pasien | Tidak dapat diubah |
| `patient_name` | Nama Pasien | Data Pasien | Tidak dapat diubah |
| `birth_date_age` | Tanggal Lahir/Umur | Data Pasien | Tidak dapat diubah |
| `sex` | Jenis Kelamin | Data Pasien | Tidak dapat diubah |
| `sender_doctor_id` | Dokter Pengirim | Order PA/Master Staf | Tidak dapat diubah oleh petugas Laboratorium PA |
| `sender_unit_id` | Unit Pengirim/Bangsal | Order PA | Metadata asal order; tidak dapat diubah melalui fitur ini |
| `ordered_at` | Tanggal/Waktu Order | Order PA | Metadata sistem; tidak dapat diubah |
| `order_status` | Status Order | Sistem | Menentukan mode form |
| `record_version` | Versi Data | Sistem | Untuk kontrol konflik |

### C. Field Detail Order yang Editable Sebelum Konfirmasi

> Seluruh field detail order pada form Order PA dapat diedit kecuali `Dokter Pengirim`. Field identitas pasien dan metadata sistem pada bagian B tetap read-only.

| Field | Label | Tipe | Validasi/Sumber | Catatan |
|---|---|---|---|---|
| `examination_date` | Tanggal Pemeriksaan | Date/Datetime | PRD Order PA | Editable sebelum konfirmasi |
| `examination_type_ids` | Jenis Pemeriksaan | Multi-select/Lookup | PRD Order PA | Editable sebelum konfirmasi |
| `tissue_acquisition_method` | Jaringan Tubuh yang Diperoleh | Select | PRD Order PA | Biopsi, Extirpasi, Operasi, Kerokan, Pungsi sesuai sumber |
| `puncture_description` | Keterangan Pungsi | Text | Kondisional | Ditampilkan bila relevan |
| `localization` | Lokalisasi | Text | PRD Order PA | Editable sebelum konfirmasi |
| `clinical_diagnosis_id` | Diagnosis Klinik | Lookup/Text | PRD Order PA | Editable sebelum konfirmasi |
| `clinical_notes` | Keterangan Klinik | Textarea | PRD Order PA | Editable sebelum konfirmasi |
| `cytology_specimens` | Sitologi Sediaan | Multi-select | PRD Order PA | Kondisional |
| `malignancy_xray` | X Ray | Enum | PRD Order PA | Kondisional |
| `malignancy_endoscopy` | Endoskopi | Enum | PRD Order PA | Kondisional |
| `malignancy_clinical_evaluation` | Evaluasi Klinik | Enum | PRD Order PA | Kondisional |
| `last_menstruation_date` | Menstruasi Terakhir | Date | PRD Order PA | Bagian Pap Smear |
| `pregnancy_status` | Hamil | Boolean/Enum | PRD Order PA | Bagian Pap Smear |
| `pap_smear_clinical_conditions` | Kondisi Klinis Pap Smear | Multi-select | PRD Order PA | Kondisional |
| `hormone_therapy` | Terapi Hormon | Text | PRD Order PA | Kondisional |
| `oral_contraception` | Kontrasepsi Oral | Text | PRD Order PA | Kondisional |
| `iud_contraception` | Kontrasepsi IUD | Text | PRD Order PA | Kondisional |
| `surgery_description` | Operasi | Text | PRD Order PA | Kondisional |
| `surgery_date` | Tanggal Operasi | Date | PRD Order PA | Kondisional |
| `radiation_description` | Radiasi | Text | PRD Order PA | Kondisional |
| `radiation_date` | Tanggal Radiasi | Date | PRD Order PA | Kondisional |
| `previous_histopathology_location` | Histopatologi Sebelumnya — Di | Text | PRD Order PA | Opsional |
| `previous_histopathology_date` | Tanggal Pemeriksaan Sebelumnya | Date | PRD Order PA | Opsional |
| `previous_pa_number` | Nomor PA Sebelumnya | Text | PRD Order PA | Opsional |

### D. Modal Pembatalan

| Field | Label | Tipe | Wajib | Catatan |
|---|---|---|---|---|
| `order_id` | Nomor Order | Read-only | Ya | Preview |
| `patient_summary` | Pasien | Read-only | Ya | Nomor RM dan nama |
| `current_status` | Status Saat Ini | Read-only | Ya | Divalidasi ulang |
| `cancellation_reason` | Alasan Pembatalan | Textarea | Ya | Wajib 1–250 karakter dan tidak boleh hanya berisi spasi |

### E. Audit Trail

| Field | Tipe | Sumber | Catatan |
|---|---|---|---|
| `audit_id` | ID/UUID | Sistem | Identitas aktivitas |
| `order_id` | ID | Order PA | Relasi order |
| `activity_at` | Datetime | Server | Waktu aktivitas |
| `user_id`, `user_name` | ID/Text | User login | Pelaku aktivitas |
| `user_role` | Text | RBAC | Snapshot role |
| `work_unit_id`, `work_unit_name` | ID/Text | Master Unit | Snapshot unit |
| `activity_type` | Enum/Text | Sistem | `Edit & Konfirmasi Order`, `Konfirmasi Order`, `Perubahan Status`, atau `Pembatalan Order` |
| `previous_status` | Enum | Sistem | Status sebelum aktivitas |
| `new_status` | Enum | Sistem | Status setelah aktivitas |
| `reason` | Text | User/Sistem | Wajib untuk pembatalan; tidak diwajibkan untuk edit detail order |
| `record_version` | Number/Text | Sistem | Versi setelah transaksi |

> Audit trail pada UI tidak menampilkan daftar field yang berubah maupun nilai lama dan nilai baru. Aktivitas edit ditampilkan sebagai satu aktivitas ringkas `Edit & Konfirmasi Order`.

## 13. Non-Functional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| **NFR-001** | Performa | Detail order dimuat ≤ 2 detik pada kondisi uji yang disepakati. |
| **NFR-002** | Performa | Simpan & konfirmasi, konfirmasi tanpa perubahan, perubahan status, dan pembatalan menerima response ≤ 1 detik. |
| **NFR-003** | Konsistensi | Data, status, dan audit harus tersimpan konsisten tanpa perubahan parsial. |
| **NFR-004** | Concurrency | Sistem harus mendeteksi versi data berbeda dan mencegah lost update. |
| **NFR-005** | Keamanan/RBAC | Permission divalidasi pada server untuk setiap aksi. |
| **NFR-006** | Auditabilitas | Seluruh transaksi edit dan perubahan status memiliki audit trail aktivitas, tanpa kewajiban menampilkan rincian per field atau nilai lama-baru pada UI. |
| **NFR-007** | Sinkronisasi | Data dan status terbaru tersedia pada modul internal terkait setelah transaksi berhasil. |
| **NFR-008** | Usability | Mode editable dan read-only dapat dibedakan dengan jelas. |
| **NFR-009** | Responsivitas | Form memberikan feedback loading, saving, success, error, validation, dan conflict. |
| **NFR-010** | Aksesibilitas | Status dan feedback tidak hanya mengandalkan warna. |
| **NFR-011** | Keamanan Data | Audit trail hanya dapat dilihat oleh pengguna berwenang dan tidak menampilkan rincian nilai lama-baru pada UI. |
| **NFR-012** | Observability | Kegagalan simpan, konfirmasi, pembatalan, sinkronisasi, dan konflik dicatat pada log teknis. |
| **NFR-013** | Pengujian Performa | Target performa harus diuji menggunakan volume order yang tinggi dan merepresentasikan kondisi banyak data. Jumlah record dan concurrent user final belum ditetapkan. |

## 14. Integrasi Internal & Dependency

| Dependency | Tipe | Fungsi | Dampak Jika Belum Siap |
|---|---|---|---|
| Dashboard Patologi Anatomi | Hard | Entry point dan konteks order terpilih | Proses tidak dapat dibuka dari alur utama |
| Order Pemeriksaan Patologi Anatomi | Hard | Data dan validasi field | Edit dan validasi tidak konsisten |
| Hasil Pemeriksaan Patologi Anatomi | Hard | Indikator hasil dan status lanjutan | Validasi pembatalan tidak akurat |
| Authentication & RBAC | Hard | Permission aksi | Aksi sensitif tidak aman |
| Audit Trail Internal | Hard | Pencatatan aktivitas | Kebutuhan audit tidak terpenuhi |
| Master Unit dan Master Staf | Hard | Referensi unit, dokter, dan pengguna | Data referensi tidak konsisten |
| EMR/Modul Unit Pengirim | Hard | Konsumen data dan status terbaru | Perubahan tidak terlihat lintas unit |

## 15. Risk & Mitigation

| ID | Risiko | Mitigasi |
|---|---|---|
| R1 | Petugas mencoba mengubah Dokter Pengirim atau metadata read-only. | Terapkan read-only pada UI dan validasi server; seluruh field detail order lain mengikuti definisi PRD Order PA. |
| R2 | Penyimpanan perubahan berhasil tetapi status gagal terkonfirmasi, atau sebaliknya. | Proses penyimpanan perubahan, audit, dan perubahan status dalam satu transaksi atomik serta rollback seluruh proses jika salah satu tahap gagal. |
| R3 | Dua pengguna mengubah order yang sama. | Optimistic locking/version checking. |
| R4 | Status berubah tetapi audit gagal. | Gunakan transaksi konsisten dan rollback bila audit gagal. |
| R5 | Request manipulatif mengubah order setelah konfirmasi. | Validasi status dan permission di server. |
| R6 | Perubahan tidak terlihat oleh unit pengirim. | Gunakan satu sumber data dan sinkronisasi setelah commit. |
| R7 | Audit trail diakses oleh pengguna yang tidak berwenang. | Terapkan permission audit; UI hanya menampilkan aktivitas ringkas tanpa rincian nilai field. |
| R8 | Perubahan hilang saat form ditutup. | Dirty-state detection dan unsaved changes warning. |

## 16. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|---|---|---|
| **D-001** | Field editable sebelum konfirmasi | Seluruh field detail order boleh diedit petugas laboratorium selama status `Menunggu Konfirmasi`, kecuali `Dokter Pengirim`. Identitas pasien dan metadata sistem tetap read-only. |
| **D-002** | Dokter Pengirim | Dokter Pengirim tidak boleh diubah oleh petugas Laboratorium PA. |
| **D-003** | Indikator perubahan untuk unit pengirim | Unit pengirim tidak memerlukan badge, flag, atau indikator bahwa order pernah diperbarui laboratorium. Data dan status terbaru tetap disinkronkan. |
| **D-004** | Alasan perubahan detail | Perubahan detail order tidak memerlukan alasan. Alasan hanya diwajibkan untuk pembatalan. |
| **D-005** | Tampilan audit perubahan | Audit tidak menampilkan rincian per field atau nilai lama-baru. Aktivitas edit dicatat dan ditampilkan secara ringkas sebagai `Edit & Konfirmasi Order`. |
| **D-006** | Koreksi setelah konfirmasi | Tidak ada proses koreksi order melalui fitur ini setelah order dikonfirmasi. |
| **D-007** | Batas alasan pembatalan | Alasan pembatalan dibatasi maksimal 250 karakter agar cukup informatif tetapi tidak terlalu panjang. |
| **D-008** | Pengujian performa | Pengujian menggunakan volume order yang tinggi atau banyak; jumlah record dan concurrent user final belum ditetapkan. |

## 17. Asumsi

- **[ASUMSI-001]** Dashboard PA meneruskan `order_id` ketika pengguna memilih satu order.
- **[ASUMSI-002]** Fitur selalu mengambil data terbaru berdasarkan `order_id`, bukan menggunakan salinan data dashboard sebagai sumber utama.
- **[ASUMSI-003]** Identitas pasien, Nomor Order, status, versi data, dan metadata sistem tetap read-only karena bukan bagian dari detail order yang dapat dikoreksi.
- **[ASUMSI-004]** Aksi utama mengikuti kondisi form: `Konfirmasi Order` apabila tidak terdapat perubahan dan `Simpan & Konfirmasi` apabila detail telah diedit.
- **[ASUMSI-005]** Setelah proses simpan atau konfirmasi berhasil, order tidak dapat diedit melalui fitur ini.
- **[ASUMSI-006]** Status hasil dipicu oleh Modul Hasil PA.
- **[ASUMSI-007]** Unit pengirim melihat data dan status terbaru tanpa indikator khusus perubahan dari laboratorium.

## 18. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|---|---|---|---|
| 1.0 Draft | 20 Juli 2026 | Team Product | Penyusunan awal PRD. |
| 1.1 Draft | 21 Juli 2026 | Team Product | Menghapus seluruh fungsi Dashboard PA dari scope; menetapkan dashboard hanya sebagai access point; menambahkan edit detail sebelum konfirmasi, penguncian setelah konfirmasi, audit perubahan field, kontrol versi, dan unsaved changes warning. |
| 1.2 Draft | 21 Juli 2026 | Team Product | Mengubah mekanisme penyimpanan: setiap detail order yang diedit dan disimpan otomatis terkonfirmasi; menghapus skenario simpan perubahan tanpa konfirmasi; menambahkan aksi `Simpan & Konfirmasi` dan transaksi atomik data-status-audit. |
| 1.3 Draft | 21 Juli 2026 | Team Product | Menetapkan seluruh field detail order editable kecuali Dokter Pengirim; menghapus kebutuhan indikator perubahan di unit pengirim dan alasan perubahan; menyederhanakan audit tanpa detail per field; menegaskan tidak ada koreksi setelah konfirmasi; menetapkan alasan pembatalan maksimal 250 karakter; serta mempertahankan role default dan angka volume uji sebagai pertanyaan terbuka. |
