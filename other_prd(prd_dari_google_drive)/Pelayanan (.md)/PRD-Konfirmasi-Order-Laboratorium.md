# PRD — Konfirmasi Order Laboratorium

**Related Document:** Bisnis Proses Konfirmasi Order Laboratorium; PRD Order Pemeriksaan Laboratorium (hard dependency); Dashboard Pelayanan Laboratorium; Referensi Form Konfirmasi Order Laboratorium V1  
**Dokumen ID:** PRD-P-LAB-KONF-v2.0 · **Versi:** 1.2 (Draft — Revisi pasca-feedback)  
**Tanggal Disusun:** 20 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]  
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Konfirmasi Order Laboratorium adalah fitur untuk petugas laboratorium melakukan verifikasi order sebelum pengambilan sampel dan pemeriksaan dimulai. Neurovi V1 telah menyediakan form satu layar yang menampilkan konteks pasien, jadwal, nomor laboratorium, unit asal, catatan klinik, diagnosa, dan daftar item pemeriksaan. Pada Neurovi V2, pola satu layar tersebut dipertahankan dan diperjelas melalui pemisahan field read-only dan editable, pengelolaan item internal atau rujukan, penambahan serta penghapusan item dengan minimal satu item wajib tersisa, klasifikasi worklist otomatis berdasarkan status dan jadwal, pembatalan dari tab **Belum Diproses**, pembentukan atau penggunaan registrasi aktif pada tanggal pemeriksaan yang terpisah dari registrasi unit pengirim, pembentukan billing berdasarkan item pemeriksaan final, concurrency control, dan audit trail.

Fitur ini menerima order yang telah disimpan dari modul Order Pemeriksaan Laboratorium. Saat petugas menyimpan konfirmasi, sistem memvalidasi kelengkapan setiap item dan larangan backdate, menggunakan atau membuat registrasi pelayanan laboratorium pada tanggal pemeriksaan, membentuk billing berdasarkan daftar item pemeriksaan final yang dipilih, mengubah status order, menentukan tab worklist yang sesuai, dan menyinkronkan perubahan secara real-time ke Dashboard Pelayanan Laboratorium. Billing direlasikan ke registrasi pelayanan laboratorium yang digunakan atau dibuat pada tanggal pemeriksaan. Tombol **Print** tetap ditampilkan sebagai affordance pada UI, namun implementasi pencetakan dikerjakan melalui tiket/PRD terpisah.

> Referensi: `Bisnis Proses Konfirmasi Order Laboratorium(1).pdf`; `Contoh Konfirmasi Order Lab v1.png`; `TEMPLATE-PRD-Generator-Neurovi-v2.md`.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi V1):**
- Petugas laboratorium membuka form konfirmasi yang menampilkan informasi pasien, jadwal pemeriksaan, nomor laboratorium, unit asal, catatan klinik, diagnosa, dan daftar pemeriksaan dalam satu layar.
- Setiap item dapat ditandai sebagai pemeriksaan rujukan, tetapi aturan kelengkapan, sumber data, hak edit, status worklist, dan perubahan registrasi aktif belum terdokumentasi secara eksplisit.
- Belum tersedia mekanisme pembatalan yang aman dari worklist **Belum Diproses**, sehingga order yang tidak jadi diperiksa sebelum konfirmasi dapat tetap dianggap aktif.
- Pemisahan worklist pemeriksaan hari ini dan pemeriksaan terjadwal belum memiliki aturan status yang konsisten.
- Trigger dan dasar pembentukan billing terhadap proses konfirmasi belum terdokumentasi secara tegas.

**Masalah/pain point:**
- **Aspek bisnis proses:** order dapat dibatalkan pasien sebelum dikonfirmasi; pemeriksaan dapat terdiri dari campuran item internal dan rujukan; tanggal pemeriksaan dapat berbeda dengan tanggal registrasi saat order dibuat; status order dan tab dashboard belum memiliki aturan turunan yang tegas.
- **Aspek UX:** petugas perlu melihat seluruh konteks pasien dan item tanpa berpindah halaman, memahami field yang dapat diubah, serta memperoleh validasi yang jelas ketika data rujukan belum lengkap.
- **Aspek logic system:** risiko dua petugas mengonfirmasi order yang sama, penyimpanan parsial, inkonsistensi dashboard, ketidaktepatan relasi registrasi, billing tidak sesuai item final, billing parsial/ganda, serta pembatalan setelah proses atau billing berjalan.

**Dampak utama yang disasar V2:**
- Worklist laboratorium konsisten dan otomatis mengikuti jadwal serta progres order.
- Konfirmasi dan pembatalan aman, auditable, dan tidak menghasilkan transaksi parsial.
- Data hasil, billing, audit, dan histori pelayanan terhubung ke registrasi pada tanggal pemeriksaan yang terpisah dari registrasi unit pengirim.
- Billing terbentuk saat konfirmasi berdasarkan item pemeriksaan final yang dipilih petugas.

**Strategi rilis Neurovi V2:**
- **Fase 1 (MVP):** konfirmasi order, klasifikasi worklist, pengelolaan item internal/rujukan, edit field yang diizinkan tanpa backdate, pembatalan dari Belum Diproses, penggunaan/pembuatan registrasi pelayanan laboratorium, pembentukan billing berdasarkan item pemeriksaan final, real-time sync, concurrency control, dan audit trail.
- **Fase 2 `[**]`:** fungsi pencetakan dokumen/tiket laboratorium melalui tiket terpisah.

> Volume operasional dapat mencapai 300–350 pasien per hari dari Rawat Jalan, IGD, dan Rawat Inap. Seorang pasien dapat memiliki lebih dari satu order dalam satu episode perawatan.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Worklist Konfirmasi Laboratorium** — menampilkan order dalam tab **Belum Diproses**, **Proses**, **Pending**, dan **Selesai** berdasarkan aturan turunan status dan jadwal.
2. **Detail konfirmasi full screen** — menampilkan konteks pasien, order, diagnosa, catatan klinik, serta seluruh item pemeriksaan dalam satu layar.
3. **Pemetaan sumber dan hak edit field** — membedakan field dari pendaftaran/data sosial, order laboratorium, unit asal, dan master data.
4. **Edit jadwal dan catatan klinik** — petugas dapat mengubah tanggal/waktu pemeriksaan dan catatan klinik sebelum menyimpan konfirmasi; tanggal pemeriksaan baru tidak boleh backdate.
5. **Pengelolaan item pemeriksaan** — mengubah nama pemeriksaan melalui dropdown, mengubah CITO, menambah item, dan menghapus item tanpa approval tambahan; minimal satu item wajib tersedia dan tombol hapus disabled ketika hanya tersisa satu item.
6. **Mode pemeriksaan per item** — item dapat dikerjakan internal atau ditandai **Dirujuk**.
7. **Rujukan laboratorium** — memilih laboratorium dari Master Data Instansi Rekanan Laboratorium dan mengisi tanggal estimasi selesai.
8. **Konfirmasi order** — menyimpan seluruh perubahan secara atomik, mengubah status, mencatat user/waktu, dan memperbarui dashboard.
9. **Registrasi pelayanan laboratorium** — saat konfirmasi, sistem menggunakan registrasi aktif pasien pada tanggal pemeriksaan; jika tidak ditemukan, sistem membuat registrasi baru pada tanggal pemeriksaan. Registrasi tersebut berdiri sebagai episode pelayanan laboratorium dan tidak digabungkan dengan registrasi unit pengirim.
10. **Pembentukan billing saat konfirmasi** — setelah registrasi pelayanan laboratorium berhasil ditentukan, sistem membuat billing berdasarkan seluruh item pemeriksaan final yang dipilih pada form konfirmasi dan mengaitkannya ke registrasi tersebut.
11. **Pembatalan order** — tombol batal hanya tersedia pada tab **Belum Diproses**; pembatalan diizinkan setelah seluruh prasyarat terpenuhi dan hanya ditampilkan kembali melalui Audit Trail.
12. **Concurrency control** — mencegah dua petugas mengonfirmasi order yang sama secara bersamaan.
13. **Audit trail** — mencatat konfirmasi, perubahan status, pembatalan, perubahan laboratorium rujukan, pembentukan billing, dan snapshot perubahan saat konfirmasi.
14. **Real-time synchronization** — perubahan status/order langsung tercermin pada Dashboard Pelayanan Laboratorium.
15. **Affordance Print** — tombol Print ditampilkan, dengan informasi bahwa implementasi fungsi print berada pada tiket terpisah.

### Out Scope

- Pembuatan awal order laboratorium dan penyimpanan status Draft/Ordered; didefinisikan pada PRD Order Pemeriksaan Laboratorium.
- Pengambilan sampel, input hasil, validasi hasil, koreksi hasil, dan cetak hasil pemeriksaan.
- Proses pembayaran, pelunasan, koreksi, pembatalan, atau void billing setelah billing terbentuk.
- Pembatalan order dari tab **Proses**, **Pending**, atau **Selesai**; tombol batal hanya tersedia pada **Belum Diproses**.
- CRUD Master Data Instansi Rekanan Laboratorium.
- **Print dokumen/tiket laboratorium `[**]`** — tiket pengembangan terpisah.

## 4. Goals and Metrics

### Tujuan

Menyediakan proses konfirmasi order laboratorium yang cepat, konsisten, aman, dan mudah digunakan sehingga setiap order tervalidasi sebelum diproses, terklasifikasi pada worklist yang benar, mendukung pemeriksaan rujukan, serta dapat dibatalkan secara terkendali sebelum proses pemeriksaan berjalan.

### Metrik

| Metrik | Target | Sumber |
|--------|--------|--------|
| Membuka Dashboard Konfirmasi Laboratorium | ≤ 2 detik | NFR-001 |
| Menampilkan daftar worklist | ≤ 2 detik | NFR-002 |
| Pencarian pasien/order | ≤ 1 detik | NFR-003 |
| Menyimpan konfirmasi order | ≤ 1 detik | NFR-004 |
| Membatalkan order | ≤ 1 detik | NFR-005 |
| Perubahan status terlihat di dashboard | Real-time setelah transaksi berhasil | NFR-006 |
| Penyimpanan parsial saat konfirmasi | 0 transaksi parsial | NFR-009 |
| Konfirmasi ganda pada order yang sama | 0 konfirmasi ganda | NFR-008 |
| Konfirmasi berhasil tanpa billing terkait | 0 kejadian | BR-033; BR-035 |
| Billing ganda untuk order/konfirmasi yang sama | 0 kejadian | BR-036; NFR-016 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Order Pemeriksaan Laboratorium | Sumber order, jadwal, catatan klinik, diagnosa, item pemeriksaan, dan CITO. Hard dependency. |
| Dashboard Pelayanan Laboratorium | Entry point worklist dan konsumen perubahan tab/status secara real-time. |
| Pendaftaran / Data Sosial Pasien | Sumber No. RM, nama pasien, status pasien, tanggal lahir, jenis kelamin, tipe penjamin, pencarian registrasi aktif, dan pembuatan registrasi pelayanan laboratorium bila diperlukan. |
| EMR Rawat Jalan / IGD / Rawat Inap | Sumber unit asal, dokter pengirim, diagnosa pengantar, dan konteks episode pelayanan. |
| Master Data Instansi Rekanan Laboratorium | Sumber pilihan laboratorium rujukan aktif. |
| Hasil Pemeriksaan Laboratorium | Sumber validasi apakah pemeriksaan telah memiliki hasil atau telah tervalidasi. |
| Proses Sampel Laboratorium | Sumber validasi apakah pengambilan sampel/proses pemeriksaan telah dimulai. |
| Billing/Kasir | Membentuk billing saat konfirmasi berdasarkan item pemeriksaan final, mengaitkannya ke registrasi pelayanan laboratorium, serta menyediakan status billing/pembayaran untuk validasi terkait. |
| Audit Trail | Penyimpanan histori konfirmasi, perubahan status, perubahan rujukan, pembentukan billing, dan pembatalan. |
| Master Data Tarif Layanan | Sumber tarif layanan untuk kategori item laboratorium. |

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Petugas Laboratorium | Primary | Membuka worklist, memeriksa detail, mengubah field yang diizinkan, menentukan rujukan, dan menyimpan konfirmasi. |
| Penanggung Jawab Laboratorium | Secondary | Mengawasi progres, audit trail, dan penanganan order bermasalah. |
| Dokter/Unit Pengirim | Secondary | Membuat order dan menjadi sumber diagnosa, catatan klinik, serta item awal. |
| Petugas Billing/Kasir | Tersier | Menjadi sumber status pembayaran yang memengaruhi kelayakan pembatalan. |
| Administrator Master Data | Tersier | Menjaga daftar instansi rekanan laboratorium yang dapat dipilih. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi V1)

1. Dokter/unit pelayanan membuat order laboratorium.
2. Petugas laboratorium membuka form konfirmasi yang menampilkan data pasien dan item pemeriksaan.
3. Petugas dapat mengubah beberapa informasi dan menandai item sebagai rujukan.
4. Petugas menyimpan order untuk diproses.
5. Belum terdapat aturan terdokumentasi yang lengkap terkait pembatalan dari worklist Belum Diproses, klasifikasi worklist berdasarkan tanggal, relasi registrasi aktif, concurrency, dan audit trail.

### B. To-Be (Neurovi V2 — Fase 1 MVP)

1. Modul Order Pemeriksaan Laboratorium menyimpan order dan membuat **Nomor Order** otomatis; status menjadi **Ordered**.
2. Dashboard menghitung tab worklist secara otomatis:
   - jadwal hari ini dan belum dikonfirmasi → **Belum Diproses**;
   - jadwal hari ini dan sudah dikonfirmasi → **Proses**;
   - tanggal pemeriksaan tidak sama dengan hari ini atau order bertipe booking → **Pending**;
   - order yang telah diselesaikan → **Selesai**.
3. Petugas membuka detail order dari worklist. Sistem menampilkan seluruh data pasien, order, diagnosa, dan item dalam tampilan full screen.
4. Sistem membedakan field read-only dan editable sesuai sumber data.
5. Petugas dapat mengubah jadwal tanpa memilih tanggal lampau, mengubah catatan klinik, nama pemeriksaan, CITO, menambah/menghapus item, serta menentukan item internal atau rujukan. Minimal satu item wajib tersisa; tombol hapus disabled ketika hanya ada satu item dan menjadi enabled setelah item baru ditambahkan.
6. Untuk item rujukan, petugas wajib memilih laboratorium rujukan aktif dan tanggal estimasi selesai.
7. Ketika petugas memilih **Simpan**, sistem melakukan validasi kelengkapan dan concurrency.
8. Saat konfirmasi, sistem mencari registrasi aktif pasien pada tanggal pemeriksaan. Jika tersedia, registrasi tersebut digunakan; jika tidak tersedia, sistem membuat registrasi pelayanan laboratorium baru pada tanggal pemeriksaan. Registrasi ini tidak digabungkan atau diikat sebagai satu episode dengan registrasi unit pengirim, misalnya registrasi Klinik Penyakit Dalam yang menjadi sumber order.
9. Sistem membentuk billing berdasarkan seluruh item pemeriksaan final yang dipilih setelah perubahan, penambahan, atau penghapusan item pada form konfirmasi. Billing direlasikan ke registrasi pelayanan laboratorium yang digunakan/dibuat pada tanggal pemeriksaan.
10. Sistem menyimpan perubahan order, item, relasi registrasi, pembentukan billing, status **Dikonfirmasi**, dan audit trail dalam satu transaksi atomik, lalu memperbarui dashboard.
11. Proses sampel, input hasil, dan validasi hasil berjalan pada modul terkait. Setelah seluruh item selesai dan hasil tervalidasi, status order menjadi **Selesai** dan order masuk tab **Selesai**.
12. Tombol batal hanya tersedia pada tab **Belum Diproses** untuk order berstatus **Ordered**. Sistem tetap memvalidasi bahwa belum ada hasil, validasi hasil, proses sampel/pemeriksaan, dan billing berbayar sesuai kebijakan rumah sakit.
13. Pembatalan menyimpan alasan, waktu, user, dan perubahan status **Batal** pada Audit Trail. Order batal tidak memiliki tab atau halaman riwayat khusus pada dashboard aktif.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Worklist | Belum memiliki klasifikasi terdokumentasi yang konsisten. | Tab ditentukan otomatis dari status, tanggal pemeriksaan, dan booking. |
| Hak edit | Belum dibedakan secara tegas. | Setiap field memiliki sumber, status read-only/editable, dan validasi. |
| Item pemeriksaan | Form menampilkan item dan rujukan. | Item dapat diedit melalui dropdown, ditambah/dihapus tanpa approval, diubah CITO, dan diatur internal/rujukan; minimal satu item selalu dipertahankan. |
| Rujukan | Toggle rujukan tersedia. | Lab rujukan dan tanggal selesai wajib saat toggle aktif. |
| Pembatalan | Tidak tersedia atau belum aman. | Tombol batal tersedia hanya pada tab Belum Diproses; order batal tidak tampil pada tab aktif dan hanya dapat ditelusuri melalui Audit Trail. |
| Registrasi aktif | Aktivitas berisiko menempel pada registrasi saat order dibuat. | Sistem memakai registrasi aktif pada tanggal pemeriksaan atau membuat registrasi laboratorium baru jika belum ada; registrasi tidak digabungkan dengan episode unit pengirim. |
| Pembentukan billing | Hubungan waktu pembentukan billing terhadap konfirmasi belum terdokumentasi secara tegas. | Billing dibuat saat konfirmasi berdasarkan item pemeriksaan final dan direlasikan ke registrasi pelayanan laboratorium pada tanggal pemeriksaan. |
| Konfirmasi ganda | Risiko dua petugas menyimpan order yang sama. | Dibatasi dengan optimistic/pessimistic locking. |
| Konsistensi data | Berisiko terjadi update parsial. | Seluruh perubahan disimpan secara atomik. |
| Print | Tersedia sebagai tombol pada referensi V1. | Tombol tetap ditampilkan; fungsinya dikerjakan pada tiket terpisah. |

## 7. Main Flow / Mindmap

### Skenario 1 — Konfirmasi pemeriksaan internal pada hari ini

1. Petugas membuka tab **Belum Diproses**.
2. Petugas memilih order berstatus **Ordered** dengan jadwal hari ini.
3. Sistem membuka detail full screen dan menampilkan data pasien/order.
4. Petugas memeriksa atau mengubah jadwal, catatan klinik, nama pemeriksaan, dan CITO. Saat mengubah jadwal, tanggal baru tidak boleh lebih kecil dari tanggal operasional hari ini.
5. Semua toggle **Dirujuk** tidak aktif sehingga Lab Rujukan dan Tanggal Selesai disabled.
6. Petugas memilih **Simpan**.
7. Sistem memvalidasi order dan melakukan concurrency check.
8. Sistem menentukan registrasi pelayanan laboratorium, membentuk billing berdasarkan seluruh item final yang dipilih, lalu menyimpan konfirmasi, billing, status **Dikonfirmasi**, dan audit trail secara atomik.
9. Order berpindah ke tab **Proses** setelah seluruh transaksi berhasil.

### Skenario 2 — Konfirmasi order campuran internal dan rujukan

1. Petugas membuka order dari worklist.
2. Sebagian item tetap internal, sebagian item diaktifkan sebagai **Dirujuk**.
3. Sistem mengaktifkan dropdown **Lab Rujukan** dan datepicker **Tanggal Selesai** hanya pada item rujukan.
4. Petugas memilih laboratorium rekanan dan tanggal estimasi selesai untuk setiap item rujukan.
5. Sistem menolak penyimpanan bila salah satu item rujukan belum lengkap.
6. Setelah valid, sistem membentuk billing berdasarkan seluruh item final, termasuk konfigurasi internal/rujukan yang tersimpan pada order, lalu menyimpan konfigurasi item, billing, dan snapshot perubahan dalam satu transaksi atomik.
7. Status order dihitung berdasarkan progres seluruh item; item internal dan rujukan boleh memiliki progres berbeda.

### Skenario 3 — Order terjadwal/booking masuk Pending

1. Order memiliki tanggal pemeriksaan yang tidak sama dengan tanggal operasional hari ini. Kondisi **booking** diturunkan dari tanggal pemeriksaan yang dipilih pada Form Order Laboratorium; bukan input atau flag manual terpisah.
2. Sistem menampilkan order pada tab **Pending**, termasuk order bertanggal mendatang dan order bertanggal lampau yang belum selesai, baik sebelum maupun setelah dikonfirmasi.
3. Ketika tanggal pemeriksaan menjadi hari ini dan order belum dikonfirmasi, order otomatis tampil pada **Belum Diproses**.
4. Ketika tanggal pemeriksaan menjadi hari ini dan order sudah dikonfirmasi, order otomatis tampil pada **Proses**.
5. Jika order telah berstatus **Selesai**, tab **Selesai** memiliki prioritas terhadap aturan tanggal.

### Skenario 4 — Perubahan tanggal dan relasi registrasi aktif

1. Petugas mengubah jadwal pemeriksaan ke hari ini atau tanggal mendatang; sistem menolak tanggal lampau sebagai nilai baru.
2. Saat konfirmasi, sistem mencari registrasi aktif pasien pada tanggal pemeriksaan.
3. Jika ditemukan, hasil laboratorium, billing, audit, dan histori pelayanan direlasikan ke registrasi aktif tersebut.
4. Jika tidak ditemukan, sistem membuat registrasi pelayanan laboratorium baru pada tanggal pemeriksaan.
5. Registrasi aktif/baru tersebut berdiri terpisah dari registrasi unit pengirim dan tidak dijadikan satu episode dengan registrasi asal.
6. Pemilihan atau pembuatan registrasi serta relasi sebelum/sesudah dicatat pada audit trail.

### Skenario 5 — Pembentukan billing saat konfirmasi

1. Setelah validasi form dan concurrency berhasil, sistem menggunakan daftar item pemeriksaan final pada form konfirmasi sebagai dasar billing.
2. Sistem memastikan registrasi pelayanan laboratorium pada tanggal pemeriksaan telah tersedia.
3. Sistem membuat transaksi billing dan detail billing untuk setiap item pemeriksaan final yang dipilih.
4. Billing direlasikan ke `active_registration_id`, order laboratorium, serta item pemeriksaan terkait agar dapat ditelusuri.
5. Konfirmasi order, perubahan item, relasi registrasi, pembentukan billing, perubahan status, dan audit trail disimpan dalam satu transaksi atomik.
6. Jika pembentukan billing gagal, seluruh proses konfirmasi di-rollback; status order tetap **Ordered** dan tidak ada billing parsial.
7. Retry atau penyimpanan ulang tidak boleh membuat billing ganda untuk order/konfirmasi yang sama.

### Skenario 6 — Pembatalan order

1. Pada tab **Belum Diproses**, petugas memilih tombol batal pada order berstatus **Ordered**.
2. Sistem memeriksa hasil, validasi hasil, proses sampel/pemeriksaan, dan status billing.
3. Jika seluruh prasyarat terpenuhi, sistem meminta alasan pembatalan.
4. Sistem mengubah status menjadi **Batal**, menyimpan waktu dan user, lalu mengeluarkan order dari worklist aktif. Data pembatalan hanya tersedia melalui Audit Trail.
5. Jika salah satu prasyarat tidak terpenuhi, sistem menolak pembatalan dan menampilkan alasan spesifik.

### Skenario 7 — Dua petugas mengonfirmasi order yang sama

1. Petugas A dan B membuka order yang sama.
2. Petugas A menyimpan terlebih dahulu.
3. Ketika petugas B menyimpan, sistem mendeteksi perubahan version/status.
4. Penyimpanan petugas B ditolak; sistem menampilkan bahwa order telah diperbarui oleh petugas lain dan meminta reload.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Nomor Order dibuat otomatis saat order laboratorium disimpan dan tidak dapat diedit pada form konfirmasi. | FR-004; Data Order Lab |
| **BR-002** | Status **Draft** berada pada modul Order Laboratorium dan tidak ditampilkan pada worklist konfirmasi. | State Machine; PRD Order Lab |
| **BR-003** | Hanya order berstatus **Ordered** yang dapat dikonfirmasi. | US-001; FR-001 |
| **BR-004** | Satu order hanya dapat dikonfirmasi satu kali; penyimpanan ulang harus ditolak bila status/version telah berubah. | US-009; FR-016 |
| **BR-005** | Sistem menggunakan locking atau version check untuk mencegah konfirmasi ganda. | NFR-008; R1 |
| **BR-006** | Status persisten order terdiri dari **Draft**, **Ordered**, **Dikonfirmasi**, **Selesai**, dan **Batal**. | State Machine |
| **BR-007** | **Belum Diproses**, **Proses**, **Pending**, dan **Selesai** merupakan klasifikasi tab worklist; tab tidak selalu sama dengan status persisten. | D-001; State Machine |
| **BR-008** | Order dengan tanggal pemeriksaan tidak sama dengan tanggal operasional hari ini masuk tab **Pending**, kecuali statusnya **Selesai** atau **Batal**. Kondisi `is_booking` merupakan nilai turunan dari tanggal pemeriksaan pada Form Order Laboratorium dan dihitung ulang terhadap tanggal operasional; bukan input manual terpisah. | Catatan user; FR-002 |
| **BR-009** | Order dengan jadwal hari ini dan status **Ordered** masuk tab **Belum Diproses**. | Catatan user; FR-002 |
| **BR-010** | Order dengan jadwal hari ini dan status **Dikonfirmasi** masuk tab **Proses**. | Catatan user; FR-002 |
| **BR-011** | Order berstatus **Selesai** masuk tab **Selesai** setelah seluruh item selesai dan hasil tervalidasi. | FR-018; Hasil Lab |
| **BR-012** | Tombol batal hanya tersedia pada tab **Belum Diproses** untuk order berstatus **Ordered**. Setelah dibatalkan, order tidak ditampilkan pada tab aktif maupun tab riwayat khusus; informasi pembatalan hanya tersedia melalui Audit Trail. | FR-014; FR-015; D-011 |
| **BR-013** | Header pasien mengambil No. RM, nama pasien, status pasien, tanggal lahir, dan jenis kelamin dari Pendaftaran/Data Sosial dan bersifat read-only. | FR-003; Data Requirements |
| **BR-014** | Unit Pelayanan, Tipe Penjamin, Dokter Pengirim, Nomor Order, dan Diagnosa bersifat read-only pada form konfirmasi. | FR-004; Catatan user |
| **BR-015** | Jadwal Pemeriksaan dan Catatan Klinik dapat diedit sebelum konfirmasi disimpan. Nilai baru tanggal pemeriksaan wajib sama dengan atau lebih besar dari tanggal operasional hari ini; sistem menolak backdate. | FR-005; Catatan user |
| **BR-016** | Nama Pemeriksaan dipilih dari dropdown dan Status CITO dapat diubah per item. | FR-006; Catatan user |
| **BR-017** | Petugas dapat menambah dan menghapus item pemeriksaan sebelum menyimpan konfirmasi tanpa approval tambahan. | FR-007; D-013 |
| **BR-018** | Setiap item memiliki mode **internal** atau **Dirujuk**; campuran mode dalam satu order diperbolehkan. | FR-008; Edge case PDF |
| **BR-019** | Ketika toggle **Dirujuk** aktif, field Lab Rujukan dan Tanggal Selesai menjadi enabled dan wajib diisi. | FR-009; US-004 |
| **BR-020** | Lab Rujukan hanya dapat dipilih dari Master Data Instansi Rekanan Laboratorium yang aktif untuk transaksi baru. | FR-010; Master Data |
| **BR-021** | Instansi rekanan yang kemudian dinonaktifkan tetap disimpan pada transaksi lama, tetapi tidak dapat dipilih untuk transaksi baru. | R4; PDF |
| **BR-022** | Ketika toggle **Dirujuk** dinonaktifkan, field Lab Rujukan dan Tanggal Selesai menjadi disabled, tetapi nilai yang sebelumnya dipilih tetap dipertahankan/tersimpan dan ditampilkan kembali jika toggle diaktifkan lagi. Nilai tersebut tidak digunakan sebagai rujukan aktif selama `is_referred=false`. | FR-009; D-008 |
| **BR-023** | Setiap order selalu memiliki minimal satu item pemeriksaan. Ketika hanya terdapat satu item, tombol hapus disabled. Setelah user menambah item baru, tombol hapus pada daftar item menjadi enabled selama penghapusan tidak menyebabkan jumlah item menjadi nol. | FR-007; US-005; D-009 |
| **BR-024** | Saat konfirmasi, sistem menggunakan registrasi aktif pasien pada tanggal pemeriksaan. Jika tidak ditemukan, sistem membuat registrasi pelayanan laboratorium baru pada tanggal tersebut. Registrasi yang digunakan/dibuat tidak digabungkan dengan registrasi unit pengirim dan menjadi relasi untuk hasil, billing, audit, serta histori laboratorium. | FR-013; US-006; D-007 |
| **BR-025** | Pembatalan hanya dapat dimulai dari tab **Belum Diproses** pada order berstatus **Ordered**, serta hanya jika belum ada hasil pemeriksaan, validasi hasil, dan proses pengambilan sampel/pemeriksaan. | FR-014; US-007 |
| **BR-026** | Order tidak dapat dibatalkan jika billing terkait telah dibayar, mengikuti kebijakan rumah sakit. | FR-014; Billing |
| **BR-027** | Pembatalan wajib mencatat alasan, waktu, dan user yang melakukan pembatalan. | FR-015; NFR-011 |
| **BR-028** | Seluruh perubahan status dan perubahan laboratorium rujukan dicatat pada audit trail. | FR-017; NFR-011 |
| **BR-029** | Konfirmasi dan pembatalan harus disimpan sebagai transaksi database atomik; kegagalan salah satu langkah membatalkan seluruh perubahan. | NFR-009; R5 |
| **BR-030** | Tombol **Print** ditampilkan, namun fungsi pencetakan berada di luar scope PRD ini dan dikerjakan pada tiket terpisah. | D-003; Out Scope |
| **BR-031** | Badge CITO pada dashboard aktif apabila minimal satu item dalam order memiliki `is_cito=true`; jika seluruh item `false`, badge menampilkan Non CITO. | FR-023; D-010 |
| **BR-032** | Perubahan, penambahan, atau penghapusan item pada saat konfirmasi tidak memerlukan approval tambahan. | FR-007; D-013 |
| **BR-033** | Saat konfirmasi disimpan, sistem wajib membentuk billing berdasarkan daftar item pemeriksaan final yang aktif pada form setelah seluruh perubahan, penambahan, atau penghapusan item dilakukan. | FR-024; US-012; D-015 |
| **BR-034** | Billing wajib direlasikan ke registrasi pelayanan laboratorium pada tanggal pemeriksaan, Nomor Order, dan item pemeriksaan sumbernya. | FR-013; FR-024 |
| **BR-035** | Penyimpanan konfirmasi, perubahan item, relasi registrasi, pembentukan billing, perubahan status, dan audit trail merupakan satu transaksi atomik. Jika pembentukan billing gagal, seluruh konfirmasi harus di-rollback dan tidak boleh ada billing parsial. | FR-012; FR-024; NFR-009 |
| **BR-036** | Sistem harus bersifat idempotent terhadap proses konfirmasi agar satu order/konfirmasi tidak menghasilkan billing ganda. | FR-016; FR-024; NFR-008 |

## 9. State Machine

### 9.1 Status Persisten Order Laboratorium

| State | Pemicu Masuk | Aksi yang Diizinkan | Pemicu Keluar |
|-------|--------------|---------------------|---------------|
| **Draft** | User mulai mengisi form order tetapi belum menyimpan. | Melanjutkan/edit order pada modul Order Lab. | Simpan order → **Ordered**. |
| **Ordered** | Order berhasil disimpan dan Nomor Order dibuat. | Buka detail dan konfirmasi; aksi batal hanya tersedia ketika order berada pada tab Belum Diproses. | Simpan konfirmasi → **Dikonfirmasi**; batal dari Belum Diproses → **Batal**. |
| **Dikonfirmasi** | Konfirmasi, relasi registrasi, dan billing berdasarkan item final berhasil disimpan oleh satu petugas. | Diproses pada layanan laboratorium; pembatalan tidak tersedia dari tab Proses/Pending. | Seluruh item selesai dan hasil tervalidasi → **Selesai**. |
| **Selesai** | Seluruh item pemeriksaan selesai dan hasil tervalidasi. | Read-only; koreksi mengikuti mekanisme hasil laboratorium. | Terminal. |
| **Batal** | Pembatalan berhasil dan alasan tercatat. | Read-only/audit. | Terminal. |

**Transisi utama:** `Draft → Ordered → Dikonfirmasi → Selesai`  
**Transisi pembatalan:** `Ordered → Batal` hanya melalui tombol batal pada tab **Belum Diproses** dan setelah BR-025 serta BR-026 terpenuhi.

### 9.2 Klasifikasi Tab Worklist

> **Keputusan terbaru:** **Pending** adalah klasifikasi worklist berbasis tanggal pemeriksaan/booking, bukan status persisten dan bukan otomatis karena item dirujuk atau menunggu hasil.

| Prioritas | Kondisi | Tab Worklist | Contoh |
|-----------|---------|--------------|--------|
| 1 | `order_status = Batal` | Tidak masuk worklist aktif | Order dibatalkan; detail pembatalan hanya tersedia pada Audit Trail. |
| 2 | `order_status = Selesai` | **Selesai** | Semua item selesai dan hasil tervalidasi. |
| 3 | `tanggal_pemeriksaan != hari_ini` | **Pending** | Order mendatang/booking serta order tanggal lampau yang belum selesai. `is_booking` diturunkan dari kondisi tanggal ini. |
| 4 | `tanggal_pemeriksaan = hari_ini` dan `order_status = Ordered` | **Belum Diproses** | Order hari ini belum dikonfirmasi. |
| 5 | `tanggal_pemeriksaan = hari_ini` dan `order_status = Dikonfirmasi` | **Proses** | Order hari ini sudah dikonfirmasi dan belum selesai. |

Klasifikasi tab dihitung ulang pada saat dashboard dimuat, jadwal/status berubah, dan pergantian tanggal operasional rumah sakit.

### 9.3 Status Per Item

| Mode Item | Makna | Field Kondisional |
|-----------|-------|-------------------|
| **Internal** | Pemeriksaan dikerjakan oleh laboratorium rumah sakit. | Lab Rujukan dan Tanggal Selesai disabled. |
| **Dirujuk** | Pemeriksaan dikirim ke laboratorium rekanan. | Lab Rujukan dan Tanggal Selesai enabled serta wajib. |

Status akhir order dihitung berdasarkan progres seluruh item. Item internal dan rujukan boleh memiliki progres yang berbeda, tetapi order hanya menjadi **Selesai** setelah seluruh item memenuhi kondisi selesai dan hasil tervalidasi.

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Membuka worklist konfirmasi** — sistem menampilkan order laboratorium yang dapat dikelola petugas sesuai hak akses. | US-001; BR-003 |
| **FR-002** | **Klasifikasi tab otomatis** — sistem menghitung tab Belum Diproses, Proses, Pending, dan Selesai mengikuti matriks prioritas pada State Machine. Pending mencakup jadwal mendatang/booking dan jadwal lampau yang belum selesai. | US-002; BR-007–BR-012 |
| **FR-003** | **Menampilkan header pasien** — menampilkan No. RM, nama pasien, status pasien, tanggal lahir, dan jenis kelamin dari Pendaftaran/Data Sosial secara read-only. | US-003; BR-013 |
| **FR-004** | **Menampilkan konteks order read-only** — menampilkan Nomor Order, Unit Pelayanan, Tipe Penjamin, Dokter Pengirim, dan Diagnosa. | US-003; BR-001; BR-014 |
| **FR-005** | **Mengubah informasi order yang diizinkan** — petugas dapat mengubah tanggal/waktu Jadwal Pemeriksaan dan Catatan Klinik. Datepicker menolak tanggal baru yang lebih kecil dari tanggal operasional hari ini. | US-003; BR-015 |
| **FR-006** | **Mengubah detail item** — petugas dapat memilih Nama Pemeriksaan melalui dropdown dan mengubah checkbox CITO per item. | US-003; BR-016 |
| **FR-007** | **Menambah dan menghapus item** — petugas dapat menambah atau menghapus item tanpa approval tambahan. Sistem selalu menjaga minimal satu item; tombol hapus disabled saat jumlah item satu dan enabled setelah terdapat lebih dari satu item. | US-005; BR-017; BR-023; BR-032 |
| **FR-008** | **Mengatur tipe pemeriksaan** — setiap item menyediakan toggle internal/Dirujuk dan mendukung kombinasi mode dalam satu order. | US-004; BR-018 |
| **FR-009** | **Field kondisional rujukan** — ketika Dirujuk aktif, Lab Rujukan dan Tanggal Selesai enabled serta wajib; ketika tidak aktif, keduanya disabled tetapi nilai sebelumnya tetap dipertahankan dan tidak dipakai sebagai rujukan aktif. | US-004; BR-019; BR-022 |
| **FR-010** | **Lookup laboratorium rekanan** — dropdown mengambil instansi rekanan laboratorium aktif dari master data dan mempertahankan snapshot transaksi lama. | US-004; BR-020; BR-021 |
| **FR-011** | **Validasi form sebelum simpan** — sistem memvalidasi minimal satu item, kelengkapan rujukan, format tanggal/waktu, larangan backdate, dan eligibility status order. | US-001; US-004; BR-003; BR-015; BR-019; BR-023 |
| **FR-012** | **Simpan konfirmasi** — sistem menyimpan perubahan order/item, relasi registrasi, billing berdasarkan item final, petugas konfirmasi, waktu konfirmasi, status Dikonfirmasi, version, dan audit trail dalam satu transaksi atomik. | US-001; BR-029; BR-035 |
| **FR-013** | **Resolve registrasi pelayanan laboratorium** — saat konfirmasi, sistem menggunakan registrasi aktif pasien pada tanggal pemeriksaan atau membuat registrasi baru jika tidak ditemukan. Registrasi tersebut terpisah dari registrasi unit pengirim dan menjadi relasi hasil, billing, audit, serta histori laboratorium. | US-006; BR-024 |
| **FR-014** | **Validasi kelayakan pembatalan** — tombol batal hanya ditampilkan pada tab Belum Diproses untuk order Ordered. Saat dipilih, sistem memeriksa hasil, validasi hasil, proses sampel/pemeriksaan, dan billing berbayar sebelum mengizinkan pembatalan. | US-007; BR-012; BR-025; BR-026 |
| **FR-015** | **Menyimpan pembatalan** — sistem mewajibkan alasan dan menyimpan status Batal, user, waktu, serta Audit Trail. Order batal dikeluarkan dari worklist dan tidak ditampilkan pada tab atau riwayat khusus. | US-007; BR-012; BR-027 |
| **FR-016** | **Concurrency validation** — sistem menolak konfirmasi ketika order telah dikonfirmasi atau diubah oleh user lain sejak halaman dimuat. | US-009; BR-004; BR-005 |
| **FR-017** | **Audit trail** — sistem mencatat konfirmasi, perubahan status, perubahan laboratorium rujukan, perubahan relasi registrasi, pembentukan billing, dan pembatalan. | US-008; BR-028; BR-035 |
| **FR-018** | **Penyelesaian order** — sistem menerima event/progres dari modul hasil dan mengubah status menjadi Selesai setelah seluruh item selesai dan hasil tervalidasi. | US-010; BR-011 |
| **FR-019** | **Real-time dashboard sync** — perubahan status, jadwal, pembatalan, dan penyelesaian langsung memperbarui tab serta daftar worklist. | US-002; NFR-006 |
| **FR-020** | **Full-screen form** — detail konfirmasi dapat ditampilkan full screen dan tetap mempertahankan tombol Kembali, Simpan, dan Print. | US-003; NFR-007 |
| **FR-021** | **Affordance Print** — saat Print dipilih sebelum tiket print tersedia, sistem menampilkan informasi bahwa fungsi tersebut berada pada pengembangan terpisah. | BR-030; D-003 |
| **FR-022** | **Pencarian worklist** — petugas dapat mencari berdasarkan Nomor Order, No. RM, atau Nama Pasien. | US-011; NFR-003 |
| **FR-023** | **Agregasi CITO dashboard** — sistem menampilkan badge CITO jika minimal satu item order memiliki `is_cito=true`, selain itu menampilkan Non CITO. | BR-031; D-010 |
| **FR-024** | **Membentuk billing saat konfirmasi** — setelah validasi form, concurrency, dan resolve registrasi berhasil, sistem membuat header serta detail billing berdasarkan seluruh item pemeriksaan final yang dipilih. Billing direlasikan ke registrasi pelayanan laboratorium, order, dan item sumber; proses ini atomik dan idempotent. | US-012; BR-033–BR-036 |

## 11. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas laboratorium**, saya ingin mengonfirmasi order yang belum diproses, sehingga order siap dikerjakan dan tidak dikonfirmasi dua kali. | 1) Given order berstatus Ordered dan jadwal hari ini, When petugas menyimpan form valid, Then billing terbentuk berdasarkan item final, status menjadi Dikonfirmasi, dan tab menjadi Proses. 2) Given order telah dikonfirmasi user lain, When disimpan, Then sistem menolak dan meminta reload. | FR-001; FR-011; FR-012; FR-016 |
| **US-002** | Sebagai **petugas laboratorium**, saya ingin worklist terpisah otomatis, sehingga saya dapat fokus pada order yang relevan dengan tanggal dan progres saat ini. | 1) Given order hari ini belum dikonfirmasi, Then tampil pada Belum Diproses. 2) Given order sudah dikonfirmasi hari ini, Then tampil pada Proses. 3) Given tanggal pemeriksaan mendatang atau lampau dan order belum selesai, Then tampil pada Pending. 4) Given status Selesai, Then tampil pada Selesai. | FR-002; FR-019 |
| **US-003** | Sebagai **petugas laboratorium**, saya ingin melihat konteks pasien dan order dalam satu layar serta hanya mengubah field yang diperbolehkan, sehingga verifikasi lebih cepat dan aman. | 1) Given detail dibuka, Then header pasien dan data read-only tampil lengkap. 2) Jadwal dan Catatan Klinik editable. 3) Given petugas mengubah tanggal, When tanggal lebih kecil dari hari ini, Then nilai ditolak. 4) Nama Pemeriksaan dan CITO editable per item. | FR-003–FR-006; FR-020 |
| **US-004** | Sebagai **petugas laboratorium**, saya ingin menandai item sebagai rujukan dan mengisi instansi serta estimasi selesai, sehingga pemeriksaan eksternal dapat ditindaklanjuti. | Given toggle Dirujuk aktif, When Lab Rujukan atau Tanggal Selesai kosong, Then simpan ditolak pada item terkait. Given data lengkap, Then simpan diterima. | FR-008–FR-011 |
| **US-005** | Sebagai **petugas laboratorium**, saya ingin menambah atau menghapus item pemeriksaan sebelum konfirmasi, sehingga daftar pemeriksaan sesuai kebutuhan aktual. | 1) Given hanya ada satu item, Then tombol hapus disabled. 2) Given user menambah item, Then tombol hapus enabled. 3) When item dihapus, Then sistem tidak pernah mengizinkan jumlah item menjadi nol. 4) Perubahan item dapat disimpan tanpa approval tambahan. | FR-007; BR-023; BR-032 |
| **US-006** | Sebagai **petugas laboratorium**, saya ingin aktivitas order menggunakan registrasi pada tanggal pemeriksaan yang terpisah dari registrasi unit pengirim, sehingga hasil, billing, dan histori berada pada episode yang benar. | 1) Given registrasi aktif pada tanggal pemeriksaan ditemukan, When konfirmasi disimpan, Then registrasi tersebut digunakan. 2) Given registrasi aktif tidak ditemukan, Then sistem membuat registrasi pelayanan laboratorium baru pada tanggal pemeriksaan. 3) Registrasi tersebut tidak digabungkan dengan registrasi asal dan seluruh perubahan dicatat pada audit. | FR-013; FR-017 |
| **US-007** | Sebagai **petugas berwenang**, saya ingin membatalkan order dari tab Belum Diproses, sehingga order yang tidak jadi dilakukan tidak tetap aktif. | 1) Given order Ordered berada pada Belum Diproses dan belum ada hasil, validasi, proses sampel, serta billing berbayar, When alasan diisi, Then order menjadi Batal. 2) Given order berada pada tab selain Belum Diproses, Then tombol batal tidak ditampilkan. 3) Given pembatalan berhasil, Then detailnya hanya tersedia pada Audit Trail. | FR-014; FR-015 |
| **US-008** | Sebagai **penanggung jawab laboratorium**, saya ingin melihat histori perubahan, sehingga setiap konfirmasi, perubahan status, rujukan, relasi registrasi, dan pembatalan dapat diaudit. | Given aktivitas terjadi, When audit trail dibuka, Then user, waktu, aksi, nilai sebelum/sesudah, dan referensi order tersedia. | FR-017; NFR-011 |
| **US-009** | Sebagai **petugas laboratorium**, saya ingin mendapat peringatan ketika order telah diperbarui petugas lain, sehingga perubahan saya tidak menimpa data terbaru. | Given version halaman berbeda dari version server, When simpan, Then transaksi ditolak tanpa perubahan parsial dan tombol reload tersedia. | FR-016; NFR-008; NFR-009 |
| **US-010** | Sebagai **petugas laboratorium**, saya ingin order otomatis masuk Selesai setelah seluruh hasil tervalidasi, sehingga worklist tidak memerlukan pemindahan manual. | Given seluruh item selesai dan hasil tervalidasi, When event hasil diterima, Then status menjadi Selesai dan tab diperbarui real-time. | FR-018; FR-019 |
| **US-011** | Sebagai **petugas laboratorium**, saya ingin mencari order berdasarkan nomor atau pasien, sehingga order dapat ditemukan dengan cepat. | Given daftar worklist tersedia, When kata kunci Nomor Order, No. RM, atau Nama Pasien dimasukkan, Then hasil relevan tampil ≤ 1 detik. | FR-022; NFR-003 |
| **US-012** | Sebagai **petugas laboratorium**, saya ingin billing otomatis terbentuk dari item pemeriksaan yang saya konfirmasi, sehingga tagihan sesuai dengan layanan laboratorium yang akan dilakukan. | 1) Given form valid dan registrasi pelayanan tersedia, When konfirmasi disimpan, Then sistem membuat billing berdasarkan seluruh item final. 2) Given item ditambah/dihapus/diubah sebelum simpan, Then billing mengikuti daftar item terbaru. 3) Given pembentukan billing gagal, Then seluruh konfirmasi di-rollback tanpa billing parsial. 4) Given request konfirmasi yang sama diproses ulang, Then tidak terbentuk billing ganda. | FR-012; FR-013; FR-024 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi dan penjamin **reuse definisi kanonik dari Pendaftaran/Data Sosial Pasien** — nama, tipe, format, validasi, dan kode referensi harus sama. Data unit, dokter, diagnosa, dan registrasi reuse kontrak dari EMR/Order Laboratorium.

### A. Layar TAMPIL — Header Pasien dan Konteks Order

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. RM | Pendaftaran/Data Sosial | Text | - | Read-only. |
| Nama Pasien | Pendaftaran/Data Sosial | Text | - | Read-only. |
| Status Pasien | Pendaftaran/Data Sosial | Badge/text | - | Definisi nilai `[PERLU KONFIRMASI]`. |
| Tanggal Lahir | Pendaftaran/Data Sosial | `DD MMMM YYYY` | - | Read-only. |
| Jenis Kelamin | Pendaftaran/Data Sosial | Text/kode kanonik | - | Read-only. |
| Nomor Order | Order Laboratorium | Text | - | Dibuat otomatis saat order disimpan; read-only. |
| Unit Pelayanan | Registrasi/unit asal | Text | - | Read-only. |
| Tipe Penjamin | Pendaftaran | Text/badge | - | Read-only. |
| Dokter Pengirim | Order/EMR | Text | - | Read-only; posisi pada UI mengikuti desain final. |
| Diagnosa | Order Laboratorium | Chip `kode - deskripsi` | - | Read-only. |

### B. Layar INPUT — Informasi Order

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `scheduled_date` | Jadwal Pemeriksaan — Tanggal | datepicker | Ya | Tanggal valid; nilai baru `>= tanggal_operasional_hari_ini` | Order Laboratorium | Editable; tidak boleh backdate. Order overdue yang sudah tersimpan tetap diklasifikasikan Pending. |
| `scheduled_time` | Jadwal Pemeriksaan — Waktu | time | Ya | `HH:mm` | Order Laboratorium | Editable. |
| `clinical_note` | Catatan Klinik | textarea | Tidak | Panjang maksimum `[PERLU KONFIRMASI]` | Order Laboratorium | Editable. Label mengikuti catatan terbaru. |
| `order_version` | Version | hidden/integer | Ya | Harus sama dengan server saat simpan | Sistem | Untuk optimistic locking. |

### C. Layar INPUT — Item Pemeriksaan

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `order_item_id` | ID Item | hidden/UUID | Kondisional | UUID | Order/Sistem | Item baru dibuat saat simpan. |
| `examination_id` | Nama Pemeriksaan | searchable dropdown | Ya | Harus berasal dari master pemeriksaan aktif | Order Laboratorium | Editable per item. |
| `is_cito` | Status CITO | checkbox/boolean | Ya | `true/false` | Order Laboratorium | Editable per item. |
| `is_referred` | Tipe Pemeriksaan — Dirujuk | toggle/boolean | Ya | `true/false` | Default dari order / false | `false` = internal; `true` = rujukan. |
| `referral_lab_id` | Lab Rujukan | searchable dropdown | Kondisional | Wajib jika `is_referred=true` | Master Instansi Rekanan Laboratorium | Enabled saat Dirujuk aktif; nilai lama tetap disimpan ketika toggle nonaktif. |
| `estimated_completion_date` | Tanggal Selesai | datepicker | Kondisional | Wajib jika `is_referred=true`; batas minimum `[PERLU KONFIRMASI]` | Manual | Estimasi penyelesaian pemeriksaan rujukan; nilai lama tetap disimpan ketika toggle nonaktif. |
| `item_action_add` | Tambah Pemeriksaan | button | Tidak | - | UI | Menambahkan baris baru. |
| `item_action_delete` | Hapus Item | icon button | Tidak | Disabled jika jumlah item = 1; enabled jika jumlah item > 1 | UI | Penghapusan tidak boleh menyebabkan jumlah item menjadi 0. |

### D. Data yang Dibuat/Diperbarui saat Simpan Konfirmasi

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| `confirmation_id` | ID Konfirmasi | UUID | Dibuat otomatis | Referensi transaksi konfirmasi. |
| `confirmed_by` | Dikonfirmasi Oleh | User ID | User login | Audit dan histori. |
| `confirmed_at` | Waktu Konfirmasi | Timestamp | Waktu server | Menggunakan timezone rumah sakit. |
| `order_status` | Status Order | Enum | `Dikonfirmasi` | Setelah simpan berhasil. |
| `worklist_tab` | Tab Worklist | Derived enum | Matriks State Machine | Dihitung, tidak harus disimpan permanen. |
| `active_registration_id` | Registrasi Pelayanan Laboratorium | UUID | Lookup berdasarkan pasien dan tanggal pemeriksaan; dibuat otomatis jika tidak ditemukan | Terpisah dari registrasi unit pengirim dan menjadi relasi transaksi laboratorium. |
| `registration_resolution` | Resolusi Registrasi | Enum | `existing_active` / `created_new` | Menandai apakah sistem memakai registrasi aktif atau membuat registrasi baru. |
| `is_booking` | Booking | Derived boolean | `scheduled_date != tanggal_operasional_hari_ini` | Dihitung ulang; bukan input manual terpisah. |
| `order_version` | Version Baru | Integer | Increment otomatis | Untuk concurrency berikutnya. |
| `referral_lab_snapshot` | Snapshot Lab Rujukan | JSON/object | ID + nama/kode saat transaksi | Menjaga histori bila master dinonaktifkan. |
| `audit_event` | Audit Trail | Event/JSON | before/after + user + waktu | Mencakup perubahan yang disimpan. |
| `billing_id` | ID Billing | UUID/reference | Dibuat oleh modul Billing saat konfirmasi | Direlasikan ke registrasi pelayanan laboratorium dan Nomor Order. |
| `billing_items` | Detail Item Billing | List/object | Dibuat dari seluruh item pemeriksaan final | Setiap detail menyimpan referensi `order_item_id`/`examination_id` sesuai kontrak Billing. |
| `billing_created_at` | Waktu Pembentukan Billing | Timestamp | Waktu server | Terbentuk dalam transaksi konfirmasi. |
| `cancellation_reason` | Alasan Pembatalan | Text | Manual | Hanya saat batal. |
| `canceled_by` | Dibatalkan Oleh | User ID | User login | Hanya saat batal. |
| `canceled_at` | Waktu Pembatalan | Timestamp | Waktu server | Hanya saat batal. |

### E. Layar TAMPIL — Dashboard Worklist Laboratorium

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tab Worklist | Derived | Belum Diproses / Proses / Pending / Selesai | Filter utama | Mengikuti prioritas State Machine. |
| Nomor Order | Order Laboratorium | Text | Search/sort | Searchable. |
| No. RM | Pendaftaran | Text | Search | Searchable. |
| Nama Pasien | Pendaftaran | Text | Search/sort | Searchable. |
| Dokter Pengirim | Order/EMR | Text | Filter `[PERLU KONFIRMASI]` | Informasi order dari PDF. |
| Unit Pelayanan | Registrasi | Text | Filter `[PERLU KONFIRMASI]` | Unit asal. |
| Tipe Penjamin | Pendaftaran | Badge/text | Filter `[PERLU KONFIRMASI]` | Read-only. |
| Status CITO | Agregasi item | Badge/ikon | Filter `[PERLU KONFIRMASI]` | **CITO** bila minimal satu item `is_cito=true`; selain itu **Non CITO**. |
| Jadwal Pemeriksaan | Order | `DD MMM YYYY, HH:mm` | Sort tanggal/waktu | Dasar Pending dan urutan antrean. |
| Status Order | Order | Badge | Filter/tab | Status persisten. |
| Aksi | Sistem | Lihat/Konfirmasi/Batalkan | - | Tombol batal hanya pada tab Belum Diproses; tab lain tidak menampilkan aksi batal. |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Dashboard Konfirmasi Laboratorium terbuka ≤ 2 detik pada beban normal. | Metrik PDF |
| **NFR-002** | Performa | Daftar worklist tampil ≤ 2 detik. | Metrik PDF |
| **NFR-003** | Performa | Pencarian Nomor Order/No. RM/Nama Pasien memberikan hasil ≤ 1 detik. | Metrik PDF |
| **NFR-004** | Performa | Penyimpanan konfirmasi selesai ≤ 1 detik di luar latensi dependency yang tidak terkontrol. | Metrik PDF |
| **NFR-005** | Performa | Pembatalan order selesai ≤ 1 detik. | Metrik PDF |
| **NFR-006** | Real-Time | Status dan tab worklist diperbarui segera setelah transaksi berhasil melalui push/event atau invalidasi cache yang konsisten. | Expected Improvement |
| **NFR-007** | Ergonomi UI | Form dapat dimaksimalkan/full screen, menampilkan konteks pasien dan item tanpa perpindahan halaman, serta mendukung daftar item panjang dengan area scroll yang jelas. | UX PDF |
| **NFR-008** | Konsistensi/Concurrency | Sistem mencegah lost update dan konfirmasi ganda menggunakan optimistic atau pessimistic locking. | Edge case PDF |
| **NFR-009** | Reliabilitas | Konfirmasi, perubahan item, perubahan relasi registrasi, pembentukan billing, perubahan status, pembatalan, dan audit disimpan dalam transaksi atomik; tidak ada penyimpanan parsial. | Edge case PDF; BR-035 |
| **NFR-010** | Skalabilitas | Worklist mendukung 300–350 pasien per hari, multi-order per pasien, dan akses multi-user simultan. | Performance Expectation PDF |
| **NFR-011** | Auditabilitas | Audit menyimpan user, waktu, aksi, referensi order, dan nilai sebelum/sesudah untuk aktivitas yang diwajibkan. | Expected Improvement |
| **NFR-012** | Keamanan/RBAC | Hanya user dengan hak akses laboratorium yang dapat mengonfirmasi; hak pembatalan dapat dibatasi terpisah `[PERLU KONFIRMASI]`. | Domain/FR-014 |
| **NFR-013** | Usability | Validasi ditampilkan pada field/baris yang bermasalah dan menjelaskan tindakan perbaikan. | UX |
| **NFR-014** | Konsistensi Waktu | Penentuan “hari ini”, timestamp, dan perubahan tab menggunakan timezone rumah sakit yang sama. | State Machine |
| **NFR-015** | Observability | Kegagalan konfirmasi, konflik concurrency, kegagalan pembentukan billing, kegagalan event sync, dan kegagalan relasi registrasi dicatat dengan correlation/reference ID. | Mitigasi risiko |
| **NFR-016** | Idempotensi | Proses konfirmasi memiliki idempotency key/referensi unik agar retry tidak membentuk billing ganda untuk order yang sama. | BR-036; R11 |

## 14. Integrasi Internal & Dependency

| Integrasi | Fungsi di Modul Ini | Status | Trace |
|-----------|---------------------|--------|-------|
| Pendaftaran/Data Sosial | Demografi pasien, tipe penjamin, status pasien, pencarian registrasi aktif, dan pembuatan registrasi pelayanan laboratorium. | Internal / Hard dependency | FR-003; FR-013 |
| Order Pemeriksaan Laboratorium | Sumber order, jadwal, diagnosa, catatan, dan item. | Internal / Hard dependency | FR-001–FR-006 |
| Master Pemeriksaan Laboratorium | Lookup Nama Pemeriksaan. | Internal / Hard dependency | FR-006 |
| Master Instansi Rekanan Laboratorium | Lookup Lab Rujukan aktif. | Internal / Hard dependency | FR-010 |
| Proses Sampel & Hasil Laboratorium | Validasi pembatalan dan event penyelesaian order. | Internal / Hard dependency | FR-014; FR-018 |
| Billing/Kasir | Membentuk header dan detail billing berdasarkan item pemeriksaan final saat konfirmasi, mengaitkannya ke registrasi pelayanan laboratorium, serta menyediakan status pembayaran untuk validasi terkait. | Internal / Hard dependency | FR-014; FR-024 |
| Audit Trail | Menyimpan histori perubahan. | Internal / Hard dependency | FR-017 |
| Event/Real-time Channel | Menyinkronkan perubahan ke Dashboard Pelayanan Laboratorium. | Internal | FR-019 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD Order Pemeriksaan Laboratorium | Hard | Struktur status Draft/Ordered, nomor order, dan payload item tidak konsisten. |
| Registrasi Aktif/Pembuatan Registrasi per Tanggal | Hard | Sistem tidak dapat memastikan transaksi laboratorium berada pada episode tanggal pemeriksaan yang terpisah dari unit pengirim. |
| Master Instansi Rekanan | Hard untuk item rujukan | Item rujukan tidak dapat dikonfirmasi. |
| Proses Sampel/Hasil | Hard untuk validasi batal dan selesai | Sistem tidak dapat menentukan eligibility pembatalan/penyelesaian dengan akurat. |
| Billing/Kasir | Hard untuk konfirmasi dan kebijakan batal | Konfirmasi tidak dapat diselesaikan secara konsisten atau berisiko menghasilkan layanan tanpa billing; validasi pembatalan juga tidak dapat dilakukan akurat. |
| Fitur Print `[**]` | Soft | Tombol hanya menampilkan informasi pengembangan terpisah. |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| **D-001** | Definisi tab Pending | Pending ditentukan ketika tanggal pemeriksaan tidak sama dengan tanggal operasional hari ini. Kondisi booking merupakan nilai turunan dari tanggal tersebut; item rujukan/menunggu hasil tidak otomatis menjadikan order Pending. |
| **D-002** | Status vs tab Proses | Status persisten setelah konfirmasi adalah **Dikonfirmasi**; **Proses** merupakan klasifikasi tab untuk order Dikonfirmasi dengan jadwal hari ini. |
| **D-003** | Print | Tombol Print tetap ditampilkan pada form, tetapi fungsi pencetakan dikerjakan pada tiket terpisah. |
| **D-004** | Label catatan | UI menggunakan label **Catatan Klinik**, bersumber dari input order dan editable saat konfirmasi. |
| **D-005** | Pola UI | Form konfirmasi mempertahankan pola satu layar/full screen dari V1 dengan pemetaan field dan item yang diperjelas. |
| **D-006** | Hak edit | Jadwal, Catatan Klinik, Nama Pemeriksaan, CITO, Tipe Pemeriksaan, Lab Rujukan, Tanggal Selesai, serta tambah/hapus item dapat diedit; field lainnya read-only. |
| **D-007** | Registrasi pada tanggal pemeriksaan | Gunakan registrasi aktif pada tanggal pemeriksaan; jika tidak tersedia, buat registrasi pelayanan laboratorium baru. Registrasi ini tidak digabungkan dengan registrasi unit pengirim. |
| **D-008** | Nilai rujukan saat toggle nonaktif | Nilai Lab Rujukan dan Tanggal Selesai tetap dipertahankan/tersimpan, tetapi tidak menjadi data rujukan aktif selama `is_referred=false`. |
| **D-009** | Minimal item dan tombol hapus | Minimal satu item selalu tersedia; tombol hapus disabled saat item hanya satu dan enabled setelah terdapat lebih dari satu item. |
| **D-010** | Badge CITO | Badge dashboard menjadi CITO ketika minimal satu item memiliki `is_cito=true`. |
| **D-011** | Pembatalan | Tombol batal hanya pada tab Belum Diproses. Order batal tidak memiliki tab/riwayat khusus dan hanya dapat ditelusuri melalui Audit Trail. |
| **D-012** | Definisi booking | `is_booking` merupakan nilai turunan dari tanggal pemeriksaan yang tidak sama dengan tanggal operasional hari ini dan berasal dari input jadwal pada Form Order Laboratorium. |
| **D-013** | Approval perubahan item | Perubahan, penambahan, atau penghapusan item saat konfirmasi tidak memerlukan approval tambahan. |
| **D-014** | Larangan backdate | Jadwal dapat diedit, tetapi tanggal baru tidak boleh lebih kecil dari tanggal operasional hari ini. |
| **D-015** | Waktu dan dasar pembentukan billing | Billing dibuat ketika konfirmasi berhasil berdasarkan daftar item pemeriksaan final setelah seluruh perubahan pada form, lalu direlasikan ke registrasi pelayanan laboratorium pada tanggal pemeriksaan. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| **R1** | Dua petugas membuka dan menyimpan order yang sama. | Gunakan version check/locking; tolak save kedua dan minta reload. |
| **R2** | Pasien membatalkan pemeriksaan saat order masih Belum Diproses tetapi order tetap muncul aktif. | Sediakan tombol batal hanya pada tab Belum Diproses, lakukan pre-check, ubah status menjadi Batal, dan simpan detailnya pada Audit Trail. |
| **R3** | Sebagian item internal dan sebagian dirujuk. | Simpan mode dan progres per item; hitung status order dari seluruh item. |
| **R4** | Master lab rujukan dinonaktifkan setelah dipilih. | Simpan snapshot pada transaksi lama; keluarkan dari pilihan transaksi baru. |
| **R5** | Kegagalan penyimpanan di tengah konfirmasi. | Gunakan satu transaksi database atomik dan rollback seluruh perubahan. |
| **R6** | Dashboard tidak terbarui setelah konfirmasi. | Publish event setelah commit; sediakan retry/idempotency dan invalidasi cache. |
| **R7** | Tanggal pemeriksaan berubah dan relasi registrasi menjadi salah atau tetap terikat ke unit pengirim. | Resolve registrasi aktif pada tanggal pemeriksaan atau buat registrasi laboratorium baru; pastikan relasi terpisah dari unit pengirim dan catat sebelum/sesudah pada audit. |
| **R8** | Order memiliki hasil sebagian atau billing terkait. | Jalankan pre-check terpusat sebelum pembatalan dan tampilkan blocker spesifik. |
| **R9** | Pergantian tanggal menyebabkan tab tidak sesuai. | Hitung ulang klasifikasi berdasarkan timezone rumah sakit saat load, perubahan data, dan pergantian tanggal. |
| **R10** | Item rujukan tersimpan tanpa data wajib. | Validasi per baris dan blokir save hingga Lab Rujukan serta Tanggal Selesai lengkap. |
| **R11** | Billing gagal terbentuk, terbentuk parsial, atau terbentuk ganda saat konfirmasi/retry. | Simpan konfirmasi dan billing secara atomik, gunakan idempotency key/referensi unik order-konfirmasi, rollback seluruh transaksi bila billing gagal, dan log kegagalan dengan correlation ID. |


## 17. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 | 17 Juli 2026 | Team Product | Penyusunan PRD dari bisnis proses, catatan status worklist terbaru, dan referensi UI Konfirmasi Order Laboratorium V1. |
| 1.1 | 18 Juli 2026 | Team Product | Menambahkan larangan backdate, pembuatan registrasi laboratorium baru bila registrasi aktif tidak ditemukan, penyimpanan nilai rujukan lama, aturan minimal satu item dan tombol hapus, agregasi CITO, pembatalan hanya dari Belum Diproses dan hanya melalui Audit Trail, definisi booking, serta keputusan tanpa approval untuk perubahan item. |
| 1.2 | 20 Juli 2026 | Team Product | Menambahkan flow pembentukan billing saat konfirmasi berdasarkan item pemeriksaan final, relasi billing ke registrasi pelayanan laboratorium, penyimpanan atomik, idempotensi, data requirement billing, dependency Billing/Kasir, dan mitigasi billing parsial/ganda. |
