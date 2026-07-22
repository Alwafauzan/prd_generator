# PRD — Dashboard Gizi: Order Makanan Pasien

**Related Document:** Draft Business Process Dashboard Order Makanan Gizi; Referensi Neurovi v1 — Gizi > Order Makanan Pasien; Fitur Rekap Order Makanan (hard dependency); Modul Order Makanan dari Unit Pelayanan (event source)  
**Dokumen ID:** PRD-GIZI-OMP-v2.0 · **Versi:** 1.3 (Draft — Revisi pasca-feedback)  
**Tanggal Disusun:** 21 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]  
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Dashboard Gizi — Order Makanan Pasien merupakan fitur pada modul Gizi yang digunakan untuk menerima, meninjau, memfilter, mengonfirmasi, dan memperbarui order makanan pasien dari unit pelayanan. Pada Neurovi v1, order ditampilkan dalam dua tab, yaitu **Belum dikonfirmasi** dan **Telah dikonfirmasi**. Ahli Gizi membuka detail order, memeriksa informasi pasien dan komposisi makanan, kemudian melakukan konfirmasi agar order menjadi sumber Rekap Order Makanan.

Neurovi v2 mempertahankan alur utama tersebut dengan peningkatan visibilitas informasi diet, **Catatan Khusus** yang diinput oleh user pelayanan ketika membuat order gizi, dan makanan pendamping. Catatan Khusus ditampilkan langsung sebagai teks pada dashboard; apabila isinya melebihi ruang kolom, sistem menampilkan teks ringkas dengan ellipsis dan menyediakan isi lengkap melalui tooltip. Filter dashboard tersedia untuk periode, waktu makan, nama pasien, jenis diet, Catatan Khusus, dan makanan pendamping. **Menu tambahan tidak ditampilkan pada dashboard dan tidak menjadi filter pencarian; informasinya hanya tersedia ketika Ahli Gizi membuka form detail/konfirmasi/edit order.**

Order yang sudah dikonfirmasi tetap dapat dibuka dan diedit oleh Ahli Gizi. Setiap perubahan pada order terkonfirmasi harus disimpan tanpa mengubah statusnya dari **Telah dikonfirmasi** dan harus disinkronkan ke Rekap Order Makanan agar data kebutuhan produksi menggunakan data order terbaru.

Fase 1 mencakup dashboard order untuk **Ahli Gizi**, pemisahan status, filter, detail dan konfirmasi order, edit order terkonfirmasi, riwayat order per episode rawat inap, audit konfirmasi/perubahan, serta sinkronisasi asynchronous ke Rekap Order Makanan. User unit pelayanan tidak mengakses dashboard ini dan hanya memantau order dari modul pelayanan. Pembuatan order dari unit pelayanan dan proses pengolahan rekap produksi dijelaskan sebagai dependency dan tidak menjadi fokus implementasi pada PRD ini.

> Referensi: `draft.pdf`; screenshot Neurovi v1 halaman **Gizi > Order Makanan Pasien**; feedback stakeholder 21 Juli 2026.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Dashboard menampilkan order makanan pasien dalam tab **Belum dikonfirmasi** dan **Telah dikonfirmasi**.
- Filter yang terlihat pada v1 meliputi tanggal pemberian, waktu makan, pencarian pasien, serta refresh data.
- Data utama yang tampil meliputi tanggal pemberian, nama pasien, No. RM, tipe penjamin, unit/perawatan, waktu makan, dokter, petugas order, dan tanggal konfirmasi pada tab terkonfirmasi.
- Detail order dibuka melalui modal **Konfirmasi Order Gizi** yang menampilkan identitas pasien, informasi pasien, komposisi makanan, Catatan Khusus, dan tabel history order gizi.
- Catatan Khusus berasal dari field catatan yang diinput oleh unit pelayanan ketika membuat order gizi.
- Setelah konfirmasi berhasil, order berpindah ke tab **Telah dikonfirmasi** dan menjadi sumber Rekap Order Makanan.

**Masalah/pain point:**
- **Aspek bisnis proses:** Ahli Gizi membutuhkan informasi diet, Catatan Khusus, dan makanan pendamping sebelum produksi, tetapi informasi tersebut belum cukup mudah dipantau dari daftar order.
- **Aspek UX:** Isi Catatan Khusus perlu terlihat langsung pada dashboard tanpa membuat kolom menjadi terlalu lebar; teks panjang diringkas dengan ellipsis dan dapat dibaca lengkap melalui tooltip. Menu tambahan cukup tersedia pada form detail order dan tidak perlu memenuhi ruang daftar utama.
- **Aspek logic system:** Data Rekap Order Makanan harus konsisten dengan data order terbaru, termasuk setelah petugas mengedit order yang sudah dikonfirmasi.

**Dampak utama yang disasar v2:**
- Ahli Gizi lebih cepat mengidentifikasi kebutuhan makanan pasien.
- Catatan Khusus dari unit pelayanan tidak terlewat sebelum proses produksi.
- Data Rekap Order Makanan selalu mengikuti hasil konfirmasi dan perubahan terbaru pada order terkonfirmasi.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = mempertahankan flow v1; menyediakan dashboard khusus Ahli Gizi; menampilkan Catatan Khusus langsung dengan tooltip untuk teks panjang; menyediakan filter diet, Catatan Khusus, serta makanan pendamping; menyimpan menu tambahan pada form detail tanpa menampilkannya pada dashboard; serta mendukung edit order terkonfirmasi yang disinkronkan secara asynchronous ke rekap.
- Pengembangan lanjutan belum ditetapkan dan tidak diasumsikan pada dokumen ini.

> Dashboard harus tetap responsif untuk ratusan hingga ribuan order per hari.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Entry point Dashboard Order Makanan Pasien** — tersedia pada modul **Gizi > Order Makanan Pasien** mengikuti referensi v1.
2. **Daftar order berdasarkan status** — memisahkan order ke tab **Belum dikonfirmasi** dan **Telah dikonfirmasi**.
3. **Filter periode pemberian** — memfilter berdasarkan rentang tanggal pemberian.
4. **Filter waktu makan** — memfilter berdasarkan jadwal atau kategori waktu makan rumah sakit.
5. **Filter status konfirmasi** — diwujudkan melalui tab status atau kontrol setara.
6. **Pencarian pasien** — mencari order pasien dari daftar dashboard.
7. **Informasi diet pasien** — menampilkan jenis diet aktif dan status diet khusus.
8. **Filter jenis diet** — menyaring daftar berdasarkan jenis diet.
9. **Informasi Catatan Khusus** — menampilkan isi Catatan Khusus secara langsung pada dashboard. Teks yang melebihi ruang kolom ditampilkan secara ringkas dengan ellipsis dan isi lengkap tersedia melalui tooltip.
10. **Filter Catatan Khusus** — menyaring pasien berdasarkan ada atau tidaknya Catatan Khusus.
11. **Informasi makanan pendamping** — menampilkan status atau jenis makanan pendamping pasien.
12. **Filter makanan pendamping** — menyaring order berdasarkan kebutuhan makanan pendamping.
13. **Komponen menu tambahan pada form order** — tambahan lainnya dan/atau menu pilihan tetap tersedia pada form detail/konfirmasi/edit serta ikut disinkronkan ke Rekap Order Makanan, tetapi tidak ditampilkan pada dashboard dan tidak menjadi filter pencarian.
14. **Detail dan konfirmasi order** — menampilkan data pasien, komposisi makanan, Catatan Khusus, dan tombol konfirmasi.
15. **Edit order terkonfirmasi** — memungkinkan Ahli Gizi mengubah seluruh field order pada form yang telah dikonfirmasi; identitas dan demografi pasien tetap read-only.
16. **Riwayat order gizi pasien** — menampilkan history order gizi dalam episode rawat inap yang sama.
17. **Perpindahan status otomatis** — memindahkan order ke tab terkonfirmasi setelah proses konfirmasi berhasil.
18. **Audit konfirmasi dan perubahan** — menyimpan waktu serta petugas yang melakukan konfirmasi dan edit.
19. **Integrasi Rekap Order Makanan** — hanya order terkonfirmasi yang menjadi sumber rekap; konfirmasi dan perubahan order dikirim secara asynchronous dengan status sinkronisasi dan mekanisme retry.
20. **Akses dan monitoring** — sementara hanya Ahli Gizi yang dapat melihat dashboard, membuka detail, mengonfirmasi, mengedit order terkonfirmasi, dan melihat history. User unit pelayanan hanya memantau status order dari modul pelayanan.
21. **Aksi row v1** — seluruh ikon aksi v1 dipertahankan sesuai fungsi eksisting, kecuali aksi **Cetak Label Makanan** yang berada di luar scope.
22. **Pagination/penanganan volume data** — mempertahankan kemampuan navigasi daftar pada volume besar sebagaimana v1.

### Out Scope

- Form pembuatan order makanan dari unit pelayanan.
- Akses Dashboard Order Makanan oleh user unit pelayanan; monitoring dilakukan dari modul pelayanan.
- Penentuan resep atau preskripsi diet klinis pasien.
- Pengelolaan master jenis diet, konsistensi, makanan pokok, waktu makan, tambahan makanan, dan makanan pendamping.
- Perhitungan detail jumlah porsi dan proses produksi pada Rekap Order Makanan.
- Pengelolaan bahan baku, stok dapur, costing makanan, dan distribusi makanan.
- Pembatalan atau penghapusan order setelah dikonfirmasi.
- Cetak label makanan.

## 4. Goals and Metrics

### Tujuan

Menyediakan dashboard yang membantu Ahli Gizi memproses order makanan pasien secara cepat dan aman, dengan Catatan Khusus yang langsung terbaca, filter yang relevan, serta data Rekap Order Makanan yang konsisten dengan data order terkonfirmasi terbaru melalui sinkronisasi asynchronous yang dapat dipantau.

### Metrik

| Metrik | Target | Sumber |
|---|---:|---|
| Initial load dashboard | < 2 detik | Draft business process; NFR-001 |
| Respons filter dan pencarian | < 1 detik | Draft business process; NFR-002 |
| Proses konfirmasi order | < 1 detik | Draft business process; NFR-003 |
| Perpindahan status setelah konfirmasi | Real-time setelah response sukses | Draft business process; NFR-004 |
| Sinkronisasi perubahan order terkonfirmasi ke rekap | Asynchronous dengan status `PENDING/SUCCESS/FAILED` dan retry | Feedback stakeholder; NFR-004; NFR-006 |
| Konsistensi sumber rekap | 100% data rekap berasal dari order terkonfirmasi dan menggunakan data terbaru | BR-007; BR-015; FR-014 |
| Kapasitas operasional | Tetap responsif pada ratusan hingga ribuan order per hari | Draft business process; NFR-005 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul / Fitur | Peran terhadap Dashboard Order Makanan |
|---|---|
| **Pelayanan Rawat Inap / Order Makanan** | Sumber order makanan pasien, Catatan Khusus, dokter, dan petugas order. |
| **Registrasi & Pelayanan Pasien** | Sumber status pasien masih dirawat, unit/perawatan aktif, identitas pasien, dan penjamin. |
| **Asesmen Gizi / Preskripsi Diet** | Sumber jenis diet aktif dan preskripsi diet awal pasien. |
| **Master Gizi** | Sumber pilihan konsistensi, waktu makan, makanan pokok, jenis diet, tambahan lainnya, serta makanan pendamping pasien. |
| **Master Unit** | Sumber unit, bangsal, kamar, kelas, atau lokasi perawatan pasien. |
| **Master Staf** | Sumber dokter, petugas order, Ahli Gizi yang mengonfirmasi, dan Ahli Gizi yang mengedit. |
| **Rekap Order Makanan** | Konsumen order terkonfirmasi dan perubahan terbaru order untuk perhitungan kebutuhan porsi produksi. |
| **Audit Trail** | Menyimpan aktivitas konfirmasi dan perubahan order terkonfirmasi. |

**Dependency lintas modul:** Registrasi Rawat Inap, Order Makanan dari Unit Pelayanan, Asesmen/Preskripsi Diet, Master Gizi, Master Unit, Master Staf, dan Rekap Order Makanan.

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---|---|---|
| **Ahli Gizi** | Primary | Melihat dashboard, membuka detail, mengonfirmasi, mengedit seluruh field order, melihat history per episode, dan menggunakan rekap sebagai dasar produksi. |
| **Dokter/Perawat/Petugas Pelayanan** | Secondary | Membuat order dan menginput Catatan Khusus dari unit pelayanan; hanya memantau status order dari modul pelayanan, bukan dari dashboard ini. |
| **Admin SIMRS** | Tersier | Mengelola master data. Akses operasional dashboard belum diberikan pada fase ini. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. User pada unit pelayanan membuat order makanan untuk pasien yang masih dirawat dan dapat menginput Catatan Khusus.
2. Order masuk ke dashboard **Gizi > Order Makanan Pasien** pada tab **Belum dikonfirmasi**.
3. Ahli Gizi memfilter daftar berdasarkan tanggal, waktu makan, atau pencarian pasien.
4. Ahli Gizi membuka order dan sistem menampilkan modal **Konfirmasi Order Gizi**.
5. Modal menampilkan identitas pasien, informasi pasien, komposisi makanan, Catatan Khusus, dan history order gizi.
6. Ahli Gizi melengkapi atau memeriksa data order lalu menekan **Konfirmasi Order Gizi**.
7. Sistem menyimpan waktu dan Ahli Gizi yang mengonfirmasi.
8. Order berpindah ke tab **Telah dikonfirmasi**.
9. Order terkonfirmasi menjadi sumber Rekap Order Makanan.
10. Ahli gizi menggunakan rekap untuk menentukan jumlah porsi pada setiap waktu makan.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. User pelayanan membuat order gizi dan menginput Catatan Khusus bila diperlukan.
2. Order masuk ke dashboard dengan status **Belum dikonfirmasi**.
3. Sistem memuat informasi pasien, unit, penjamin, waktu makan, dokter, petugas order, diet aktif, isi Catatan Khusus, dan makanan pendamping pada dashboard. Catatan yang panjang ditampilkan dengan ellipsis dan tooltip.
4. Ahli Gizi dapat memfilter berdasarkan periode, waktu makan, nama pasien, jenis diet, Catatan Khusus, dan makanan pendamping.
5. Menu tambahan tidak ditampilkan pada dashboard dan hanya dapat dilihat ketika petugas membuka form detail/konfirmasi/edit order.
6. Ahli Gizi membuka detail order untuk memeriksa komposisi makanan, Catatan Khusus, dan riwayat order gizi pasien.
7. Ahli Gizi melakukan konfirmasi order.
8. Sistem memvalidasi kelengkapan data wajib dan memastikan order belum pernah dikonfirmasi.
9. Sistem menyimpan status, waktu konfirmasi, dan identitas Ahli Gizi sebagai audit trail.
10. Sistem memindahkan order ke tab **Telah dikonfirmasi** secara real-time.
11. Sistem menyediakan order terkonfirmasi sebagai sumber Rekap Order Makanan.
12. Ahli Gizi dapat membuka kembali order pada tab **Telah dikonfirmasi**, mengubah data form, dan menyimpan perubahan.
13. Sistem mempertahankan status order sebagai **Telah dikonfirmasi**, menyimpan audit perubahan, dan menyinkronkan data terbaru ke Rekap Order Makanan.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|---|---|---|
| Alur bisnis utama | Order → konfirmasi → rekap. | Order → konfirmasi → rekap, dengan dukungan edit order terkonfirmasi. |
| Status dashboard | Belum dikonfirmasi dan Telah dikonfirmasi. | Tetap sama. |
| Informasi diet pada daftar | Tidak terlihat secara memadai pada daftar utama. | Jenis diet aktif dan status diet khusus terlihat langsung. |
| Catatan Khusus | Tersedia pada form dan berasal dari order unit pelayanan. | Isi catatan tampil langsung pada dashboard; teks panjang menggunakan ellipsis dan tooltip, serta dapat difilter berdasarkan ada/tidaknya catatan. |
| Makanan pendamping | Belum menjadi informasi/filter utama. | Ditampilkan dan dapat difilter. |
| Menu tambahan | Terlihat pada detail. | Tetap tersedia pada form detail/konfirmasi/edit, tetapi tidak ditampilkan pada dashboard dan tidak menjadi filter. |
| Edit setelah konfirmasi | Belum ditegaskan pada PRD awal. | Order terkonfirmasi dapat diedit tanpa mengubah status. |
| Rekap produksi | Berasal dari order terkonfirmasi. | Berasal dari order terkonfirmasi dan mengikuti perubahan terakhir melalui sinkronisasi asynchronous dengan status serta retry. |
| Performa | Pagination dan filter dasar tersedia. | Dioptimalkan untuk ratusan hingga ribuan order per hari. |

## 7. Main Flow / Mindmap

### Skenario 1 — Membuka antrean order belum dikonfirmasi

1. User membuka **Gizi > Order Makanan Pasien**.
2. Sistem menampilkan periode default dan tab **Belum dikonfirmasi**.
3. Sistem memuat daftar order yang sesuai filter aktif.
4. Setiap baris menampilkan informasi utama pasien, order, diet, isi Catatan Khusus, dan makanan pendamping. Catatan panjang diringkas dengan ellipsis dan dapat dibaca lengkap melalui tooltip.
5. User dapat mengubah filter atau membuka detail order.

### Skenario 2 — Memfilter dan mencari order

1. Dashboard menggunakan tanggal hari ini sebagai periode default. User dapat mengubah rentang tanggal tanpa batas maksimal periode.
2. User dapat memilih waktu makan: **Makan Pagi, Snack Pagi, Makan Siang, Makan Sore,** atau **Snack Sore**, serta memfilter jenis diet, status Catatan Khusus, dan makanan pendamping.
3. User memasukkan kata kunci nama pasien.
4. Sistem memperbarui daftar tanpa mengubah status data.
5. Menu tambahan tidak ditampilkan pada dashboard dan tidak tersedia sebagai filter.
6. User dapat me-reset filter untuk kembali ke kondisi default.

### Skenario 3 — Mengonfirmasi order makanan

1. Ahli Gizi memilih order berstatus **Belum dikonfirmasi**.
2. Sistem membuka detail/konfirmasi order dan menampilkan identitas pasien, preskripsi diet awal, status operasi bila tersedia, komposisi makanan, Catatan Khusus dari unit pelayanan, serta history order gizi.
3. Ahli Gizi dapat mengubah seluruh field order pada form; field identitas/demografi pasien tetap read-only.
4. Sistem mengaktifkan tombol konfirmasi hanya apabila seluruh field wajib valid.
5. Petugas menekan **Konfirmasi Order Gizi**.
6. Sistem menyimpan data konfirmasi dan audit trail.
7. Sistem memindahkan order ke **Telah dikonfirmasi** dan memasukkannya ke sumber Rekap Order Makanan.

### Skenario 4 — Mengedit order yang telah dikonfirmasi

1. User membuka tab **Telah dikonfirmasi**.
2. User memilih order dan membuka detailnya.
3. Sistem menampilkan data order terbaru; seluruh field order dapat diedit oleh Ahli Gizi, sedangkan field identitas/demografi pasien tetap read-only.
4. User mengubah satu atau lebih field lalu memilih **Simpan Perubahan**.
5. Sistem memvalidasi data dengan aturan yang sama seperti form konfirmasi.
6. Bila valid, sistem menyimpan perubahan tanpa mengubah status **Telah dikonfirmasi**.
7. Sistem menyimpan waktu dan Ahli Gizi yang mengedit pada audit trail.
8. Sistem membuat proses sinkronisasi asynchronous ke Rekap Order Makanan dengan status `PENDING`, `SUCCESS`, atau `FAILED`.
9. Jika sinkronisasi gagal, sistem menjalankan retry terkontrol dan mencatat hasilnya pada audit trail. Dashboard langsung menampilkan data terbaru setelah penyimpanan order berhasil; rekap menampilkan data terbaru setelah status sinkronisasi `SUCCESS`.

### Skenario 5 — Order memiliki Catatan Khusus

1. User pelayanan mengisi Catatan Khusus ketika membuat order gizi.
2. Catatan tersimpan sebagai bagian dari data order.
3. Dashboard menampilkan isi Catatan Khusus secara langsung. Jika terlalu panjang, sistem menampilkan teks ringkas dengan ellipsis dan tooltip berisi catatan lengkap.
4. Ahli Gizi dapat menggunakan filter **Memiliki Catatan Khusus**.
5. Isi Catatan Khusus juga ditampilkan pada form detail/konfirmasi dan tetap tersedia ketika order telah dikonfirmasi.
6. Bila Catatan Khusus diubah pada order terkonfirmasi, perubahan disinkronkan ke Rekap Order Makanan.

### Skenario 6 — Kegagalan sinkronisasi perubahan

1. User menyimpan perubahan pada order terkonfirmasi.
2. Sistem memproses penyimpanan order dan sinkronisasi Rekap Order Makanan.
3. Bila proses gagal, sistem menampilkan pesan kegagalan yang dapat ditindaklanjuti.
4. Sistem menetapkan status sinkronisasi `FAILED`, menampilkan informasi kegagalan pada detail/audit, dan menjalankan retry terkontrol.
5. Order tetap berstatus **Telah dikonfirmasi**; proses sinkronisasi bersifat asynchronous dan idempotent.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|---|---|---|
| **BR-001** | Order makanan hanya dapat dibuat untuk pasien dengan status masih dirawat. | Draft business process; FR-001 |
| **BR-002** | Satu pasien hanya boleh memiliki satu order aktif untuk kombinasi tanggal pemberian dan waktu makan yang sama. | Draft business process; FR-012 |
| **BR-003** | Pilihan waktu makan terdiri dari **Makan Pagi, Snack Pagi, Makan Siang, Makan Sore,** dan **Snack Sore**. | Feedback stakeholder; FR-004; FR-010 |
| **BR-004** | Dashboard memisahkan order menjadi status **Belum dikonfirmasi** dan **Telah dikonfirmasi**. | Draft business process; FR-002 |
| **BR-005** | Sementara hanya role **Ahli Gizi** yang dapat melihat dashboard, membuka detail, mengonfirmasi, mengedit order terkonfirmasi, dan melihat history. | Feedback stakeholder; FR-001; FR-012; FR-016; FR-020 |
| **BR-006** | Order yang berhasil dikonfirmasi harus berpindah otomatis ke tab **Telah dikonfirmasi**. | Draft business process; FR-013 |
| **BR-007** | Rekap Order Makanan hanya boleh mengambil data dari order berstatus **Telah dikonfirmasi**. | Draft business process; FR-014 |
| **BR-008** | Waktu dan identitas petugas yang melakukan konfirmasi atau edit wajib disimpan sebagai audit trail. | Draft business process; FR-015 |
| **BR-009** | Jenis diet yang ditampilkan berasal dari data diet aktif pasien/order sesuai sumber yang berlaku. | Draft business process; FR-006 |
| **BR-010** | Dashboard harus menampilkan informasi diet terbaru sesuai data order yang berlaku. | Draft business process; FR-006 |
| **BR-011** | Catatan Khusus merupakan field pada order gizi yang diinput oleh user pelayanan ketika membuat order. | Feedback stakeholder; FR-007; FR-010 |
| **BR-012** | Isi Catatan Khusus harus tampil langsung pada dashboard dan form detail/konfirmasi. Jika melebihi ruang kolom, dashboard menampilkan ellipsis dan tooltip berisi teks lengkap. | Feedback stakeholder; FR-007; FR-010 |
| **BR-013** | Makanan pendamping pasien adalah makanan yang diorder untuk pendamping/penunggu pasien dan hanya tersedia untuk layanan kelas VIP ke atas. | Feedback stakeholder; FR-008; FR-010 |
| **BR-014** | Makanan pendamping dan tambahan menu yang terdapat pada order terkonfirmasi harus ikut diperhitungkan pada kebutuhan produksi. | Draft business process; FR-014 |
| **BR-015** | Setiap perubahan yang berhasil disimpan pada order terkonfirmasi harus disinkronkan ke Rekap Order Makanan. | Feedback stakeholder; FR-014; FR-020 |
| **BR-016** | Field wajib pada form adalah **Konsistensi, Waktu Makan, Makanan Pokok,** dan **Waktu Pemberian**. Jenis Diet tidak wajib. Seluruh field wajib harus valid sebelum aksi konfirmasi atau simpan perubahan dapat digunakan. | Feedback stakeholder; FR-011 |
| **BR-017** | Jenis Diet bersifat opsional dan tetap mendukung lebih dari satu pilihan apabila pasien memiliki kombinasi diet. | Feedback stakeholder; FR-010 |
| **BR-018** | Catatan Khusus dibatasi maksimal 500 karakter mengikuti perilaku v1. | Referensi v1; FR-010 |
| **BR-019** | Order yang sudah terkonfirmasi tidak boleh dikonfirmasi ulang melalui alur normal, tetapi tetap dapat diedit. | Feedback stakeholder; FR-012; FR-020 |
| **BR-020** | Edit order terkonfirmasi tidak mengubah status order; status tetap **Telah dikonfirmasi**. | Feedback stakeholder; State Machine; FR-020 |
| **BR-021** | Menu tambahan tidak ditampilkan pada dashboard dan tidak disediakan sebagai filter. Menu tambahan tetap tersedia pada form detail/konfirmasi/edit serta tetap diproses dalam sinkronisasi Rekap Order Makanan apabila terdapat pada order. | Feedback stakeholder; FR-005; FR-010; FR-014 |
| **BR-022** | Dashboard dan Rekap Order Makanan harus menampilkan data terbaru setelah perubahan order terkonfirmasi berhasil disimpan. | Feedback stakeholder; FR-014; FR-020 |
| **BR-023** | Tidak ada perubahan alur bisnis utama dibanding v1; perubahan v2 berfokus pada visibilitas informasi, filter yang relevan, dan sinkronisasi edit order terkonfirmasi. | Draft business process; seluruh FR |
| **BR-024** | Seluruh field order pada form dapat diedit oleh Ahli Gizi sebelum maupun setelah konfirmasi. Field identitas/demografi pasien pada header tetap read-only. | Feedback stakeholder; FR-010; FR-020 |
| **BR-025** | Waktu Pemberian tidak boleh backdate; tanggal minimal adalah tanggal hari ini. | Feedback stakeholder; FR-011 |
| **BR-026** | Pencarian dashboard hanya menggunakan Nama Pasien. | Feedback stakeholder; FR-004 |
| **BR-027** | Periode default dashboard adalah hari ini dan tidak ada batas maksimal rentang tanggal. | Feedback stakeholder; FR-003 |
| **BR-028** | History Order Gizi hanya menampilkan data dalam episode rawat inap yang sama. | Feedback stakeholder; FR-016 |
| **BR-029** | Sinkronisasi order terkonfirmasi ke Rekap Order Makanan boleh berjalan asynchronous dengan status `PENDING/SUCCESS/FAILED`, mekanisme retry, dan proses yang idempotent. | Feedback stakeholder; FR-014; NFR-006 |
| **BR-030** | Informasi “Terakhir Diedit” tidak ditampilkan sebagai kolom/indikator dashboard dan hanya tersedia pada detail atau audit trail. | Feedback stakeholder; FR-015 |
| **BR-031** | User unit pelayanan tidak mengakses dashboard ini; monitoring status order dilakukan dari modul pelayanan. | Feedback stakeholder; FR-021 |
| **BR-032** | Seluruh ikon aksi row v1 dipertahankan sesuai fungsi eksisting, kecuali **Cetak Label Makanan** yang berada di luar scope. | Feedback stakeholder; FR-022 |


## 9. State Machine

### 9.1 Status Order Makanan

| State | Encoding Visual | Makna | Masuk Rekap Produksi |
|---|---|---|---|
| **Belum dikonfirmasi** | Tab/status belum dikonfirmasi | Order telah dibuat oleh unit pelayanan dan menunggu pemeriksaan Ahli Gizi. | Tidak |
| **Telah dikonfirmasi** | Tab/status telah dikonfirmasi | Order telah diperiksa dan dikonfirmasi Ahli Gizi; order dapat diedit dan perubahan terbarunya digunakan oleh rekap. | Ya |

**Transisi utama:** `Belum dikonfirmasi → Telah dikonfirmasi` melalui aksi **Konfirmasi Order Gizi** oleh Ahli Gizi.

**Transisi edit:** `Telah dikonfirmasi → Telah dikonfirmasi` melalui aksi **Simpan Perubahan**. Aksi ini memperbarui data dan audit trail tanpa mengubah status order.

### 9.2 Guard Konfirmasi

- Order masih berstatus **Belum dikonfirmasi**.
- User memiliki role Ahli Gizi.
- Seluruh field wajib valid.
- Order tidak terdeteksi sebagai order aktif duplikat untuk pasien, tanggal, dan waktu makan yang sama.
- Penyimpanan data order dan audit konfirmasi berhasil.
- Data terkonfirmasi tersedia untuk Rekap Order Makanan.

### 9.3 Guard Edit Order Terkonfirmasi

- Order berstatus **Telah dikonfirmasi**.
- User memiliki role Ahli Gizi.
- Seluruh data yang diubah memenuhi validasi form.
- Penyimpanan perubahan dan pencatatan audit berhasil.
- Perubahan disinkronkan ke Rekap Order Makanan.
- Status order tetap **Telah dikonfirmasi**.

### 9.4 Status Akhir dalam Scope

Status **Telah dikonfirmasi** merupakan status aktif terakhir dalam PRD ini, tetapi bukan kondisi read-only. Order tetap dapat diperbarui melalui aksi edit. Pembatalan, penghapusan, atau pembukaan kembali ke status **Belum dikonfirmasi** berada di luar scope.

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|---|---|---|
| **FR-001** | **Akses dashboard** — Sistem menyediakan halaman **Gizi > Order Makanan Pasien** dan hanya menampilkan order pasien yang memenuhi konteks pelayanan aktif. | US-001; BR-001 |
| **FR-002** | **Tab status** — Sistem menampilkan tab **Belum dikonfirmasi** dan **Telah dikonfirmasi** beserta data sesuai statusnya. | US-001; BR-004 |
| **FR-003** | **Filter periode** — Dashboard default menampilkan tanggal hari ini. User dapat memilih rentang tanggal pemberian tanpa batas maksimal periode. | US-002; BR-027 |
| **FR-004** | **Filter operasional dasar** — User dapat memfilter status konfirmasi dan waktu makan dengan pilihan Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore. Pencarian pasien hanya berdasarkan Nama Pasien. | US-002; BR-003; BR-026 |
| **FR-005** | **Filter kebutuhan order** — User dapat memfilter jenis diet, ada/tidaknya Catatan Khusus, dan makanan pendamping. Sistem tidak menampilkan maupun menyediakan filter menu tambahan pada dashboard. | US-003; BR-009–BR-013; BR-021 |
| **FR-006** | **Tampilan jenis diet** — Dashboard menampilkan jenis diet aktif pasien secara langsung pada daftar atau melalui representasi ringkas yang mudah dipahami. | US-003; BR-009; BR-010 |
| **FR-007** | **Informasi Catatan Khusus** — Dashboard menampilkan isi Catatan Khusus yang berasal dari order unit pelayanan secara langsung. Teks panjang dipotong secara visual dengan ellipsis dan isi lengkap ditampilkan melalui tooltip. | US-003; BR-011; BR-012 |
| **FR-008** | **Informasi makanan pendamping** — Dashboard menampilkan apakah terdapat makanan yang diorder untuk pendamping/penunggu pasien. Fitur ini hanya tersedia untuk layanan kelas VIP ke atas. Menu tambahan lain tidak ditampilkan pada dashboard dan hanya tersedia pada form detail/konfirmasi/edit order. | US-003; BR-013; BR-021 |
| **FR-009** | **Informasi order utama** — Dashboard menampilkan tanggal pemberian, pasien, No. RM, penjamin, unit/perawatan, waktu makan, dokter, petugas order, serta tanggal konfirmasi pada tab terkonfirmasi. | US-001 |
| **FR-010** | **Form detail/konfirmasi/edit** — Sistem menampilkan identitas pasien, preskripsi diet awal, status operasi bila tersedia, konsistensi, waktu makan, makanan pokok, jenis diet, tambahan lainnya, makanan pendamping pasien, waktu pemberian, Catatan Khusus, dan history order gizi. Seluruh field order dapat diedit oleh Ahli Gizi sebelum maupun setelah konfirmasi; field identitas/demografi pasien tetap read-only. | US-004; US-008; BR-003; BR-011; BR-017; BR-018; BR-024 |
| **FR-011** | **Validasi form** — Sistem mewajibkan Konsistensi, Waktu Makan, Makanan Pokok, dan Waktu Pemberian; Jenis Diet bersifat opsional. Sistem memvalidasi referensi master aktif, panjang Catatan Khusus, dan menolak Waktu Pemberian yang backdate. | US-004; US-008; BR-016; BR-018; BR-025 |
| **FR-012** | **Aksi konfirmasi** — Hanya Ahli Gizi yang dapat mengonfirmasi order belum dikonfirmasi; sistem mencegah konfirmasi ulang dan duplikasi order aktif. | US-004; BR-002; BR-005; BR-019 |
| **FR-013** | **Perpindahan status real-time** — Setelah konfirmasi berhasil, sistem memperbarui status dan memindahkan order ke tab **Telah dikonfirmasi** tanpa memerlukan reload manual. | US-004; BR-006 |
| **FR-014** | **Integrasi dan sinkronisasi rekap** — Sistem memastikan order terkonfirmasi tersedia sebagai sumber Rekap Order Makanan. Konfirmasi dan setiap perubahan order dikirim secara asynchronous dengan status `PENDING/SUCCESS/FAILED`, retry terkontrol, dan proses idempotent. | US-006; US-008; BR-007; BR-014; BR-015; BR-022; BR-029 |
| **FR-015** | **Audit konfirmasi dan edit** — Sistem menyimpan `confirmed_at`, `confirmed_by`, `last_edited_at`, `last_edited_by`, serta perubahan status/data order sebagai audit trail. Informasi terakhir diedit hanya ditampilkan pada detail/audit trail, bukan dashboard. | US-007; BR-008; BR-030 |
| **FR-016** | **History order gizi** — Sistem menampilkan history order hanya dalam episode rawat inap yang sama, mencakup tanggal, konsistensi, waktu makan, makanan pokok, jenis diet, tambahan lain, makanan pendamping pasien, Catatan Khusus, dan Ahli Gizi. | US-005; BR-028; Referensi v1 |
| **FR-017** | **Refresh data** — User dapat memuat ulang data secara manual, dan sistem tetap memperbarui perubahan status maupun data order secara real-time setelah aksi berhasil. | US-001; NFR-004 |
| **FR-018** | **Pagination dan empty state** — Sistem menyediakan pagination atau mekanisme pemuatan bertahap, indikator loading, empty state, dan error state yang jelas. | US-001; NFR-005; NFR-007 |
| **FR-019** | **Kegagalan penyimpanan** — Bila konfirmasi atau edit gagal, sistem tidak boleh menerapkan status/data parsial dan harus menampilkan pesan yang dapat ditindaklanjuti tanpa kehilangan input user. | US-004; US-008; NFR-006 |
| **FR-020** | **Edit order terkonfirmasi** — Ahli Gizi dapat mengubah seluruh field order pada order berstatus **Telah dikonfirmasi**. Setelah penyimpanan berhasil, status tetap **Telah dikonfirmasi**, audit diperbarui, dan perubahan masuk antrean sinkronisasi rekap. Field identitas/demografi pasien tetap read-only. | US-008; BR-005; BR-015; BR-019; BR-020; BR-022; BR-024 |
| **FR-021** | **Monitoring dari pelayanan** — User unit pelayanan tidak dapat mengakses Dashboard Order Makanan Pasien dan memantau status order melalui modul pelayanan. | BR-031 |
| **FR-022** | **Aksi row v1** — Sistem mempertahankan seluruh ikon aksi row v1 sesuai fungsi eksisting, kecuali aksi Cetak Label Makanan. | BR-032 |
| **FR-023** | **Status sinkronisasi** — Sistem menyimpan dan menampilkan status sinkronisasi rekap pada detail/audit, menjalankan retry saat gagal, dan mencegah duplikasi pemrosesan event. | BR-029; NFR-006 |


## 11. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|---|---|---|---|
| **US-001** | Sebagai **Ahli Gizi**, saya ingin melihat antrean order berdasarkan status, sehingga saya dapat memprioritaskan order yang belum diproses. | 1) Given order belum dikonfirmasi, When dashboard dibuka, Then order tampil pada tab **Belum dikonfirmasi**. 2) Given order sudah dikonfirmasi, Then order tampil pada tab **Telah dikonfirmasi** dan memuat tanggal konfirmasi. | FR-001; FR-002; FR-009 |
| **US-002** | Sebagai **Ahli Gizi**, saya ingin memfilter dan mencari order, sehingga saya dapat menemukan pasien atau jadwal makan secara cepat. | 1) Given dashboard dibuka, Then periode default adalah hari ini. 2) When rentang tanggal atau waktu makan diubah, Then daftar menampilkan data yang sesuai. 3) When nama pasien diketik, Then pencarian hanya mencocokkan Nama Pasien. | FR-003; FR-004 |
| **US-003** | Sebagai **Ahli Gizi**, saya ingin melihat diet, Catatan Khusus, dan makanan pendamping langsung dari dashboard, sehingga kebutuhan pasien dapat dikenali lebih cepat tanpa membebani tampilan dengan detail menu tambahan. | 1) Given pasien memiliki diet aktif, Then jenis diet tampil. 2) Given order memiliki Catatan Khusus, Then isi catatan tampil langsung; catatan panjang menggunakan ellipsis dan tooltip. 3) Given order memiliki makanan pendamping, Then informasinya tampil dan dapat difilter. 4) Given order memiliki menu tambahan lain, Then menu tersebut hanya tampil ketika form detail/konfirmasi/edit dibuka. | FR-005–FR-008; FR-010 |
| **US-004** | Sebagai **Ahli Gizi**, saya ingin memeriksa dan mengonfirmasi order, sehingga order siap digunakan untuk produksi. | 1) Given order belum dikonfirmasi, When detail dibuka, Then sistem menampilkan data pasien, komposisi order, dan Catatan Khusus dari pelayanan. 2) Given field wajib valid, When konfirmasi dipilih, Then status berubah menjadi **Telah dikonfirmasi**. 3) Given penyimpanan gagal, Then status tidak berubah dan input tetap tersedia. | FR-010–FR-013; FR-019 |
| **US-005** | Sebagai **Ahli Gizi**, saya ingin melihat history order pasien pada episode rawat inap yang sama, sehingga saya dapat memahami pola makanan dan diet selama episode berjalan. | Given pasien memiliki order sebelumnya pada episode yang sama, When detail dibuka, Then history episode tersebut tampil lengkap dan terurut berdasarkan tanggal. | FR-016; BR-028 |
| **US-006** | Sebagai **Ahli Gizi**, saya ingin hanya order terkonfirmasi masuk ke rekap dan selalu menggunakan data terbaru, sehingga jumlah porsi produksi dihitung dari data yang sudah diverifikasi. | 1) Given order belum dikonfirmasi, Then order tidak masuk rekap. 2) Given order dikonfirmasi, Then order tersedia pada rekap. 3) Given order terkonfirmasi diedit, Then rekap menampilkan data terbaru setelah penyimpanan berhasil. | FR-014; FR-020; BR-007; BR-015 |
| **US-007** | Sebagai **Ahli Gizi**, saya ingin mengetahui siapa dan kapan order dikonfirmasi atau diedit, sehingga proses dapat diaudit. | Given konfirmasi atau edit berhasil, Then sistem menyimpan petugas, waktu, aksi, dan perubahan yang dilakukan. | FR-015; BR-008 |
| **US-008** | Sebagai **Ahli Gizi**, saya ingin mengedit order yang sudah dikonfirmasi, sehingga perubahan kebutuhan makanan dapat digunakan pada Rekap Order Makanan. | 1) Given order berstatus **Telah dikonfirmasi**, When detail dibuka, Then seluruh field order dapat diedit dan identitas pasien tetap read-only. 2) Given perubahan valid, When disimpan, Then status tetap **Telah dikonfirmasi**. 3) Then perubahan tercatat pada audit trail dan masuk antrean sinkronisasi asynchronous ke rekap. | FR-010; FR-011; FR-014; FR-015; FR-019; FR-020 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi dan penjamin **reuse definisi kanonik dari Master Pasien, Registrasi, dan Modul Pelayanan** — nama, tipe, format, serta validasi harus sama.

### A. Layar INPUT — Filter Dashboard (FR-003–FR-005)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `date_start` | Tanggal Mulai | date | Ya | `DD/MM/YYYY`; tidak boleh setelah `date_end` | Hari ini | Bagian dari rentang tanggal pemberian; tidak ada batas maksimal periode. |
| `date_end` | Tanggal Selesai | date | Ya | `DD/MM/YYYY`; tidak boleh sebelum `date_start` | Hari ini | Tidak ada batas maksimal rentang tanggal. |
| `confirmation_status` | Status Konfirmasi | tab/enum | Ya | `UNCONFIRMED`, `CONFIRMED` | `UNCONFIRMED` | Dapat diwujudkan melalui tab. |
| `meal_time_id` | Waktu Makan | dropdown | Tidak | `Makan Pagi`, `Snack Pagi`, `Makan Siang`, `Makan Sore`, `Snack Sore` | Semua | Pilihan final waktu makan dashboard. |
| `patient_keyword` | Cari Nama Pasien | search text | Tidak | Trim spasi; pencocokan hanya terhadap Nama Pasien | Kosong | Tidak mencari berdasarkan No. RM, No. Registrasi, atau unit. |
| `diet_type_id` | Jenis Diet | lookup/dropdown | Tidak | Hanya master aktif | Semua | Filter diet aktif pasien. |
| `has_special_note` | Catatan Khusus | tri-state/boolean | Tidak | Semua/Ya/Tidak | Semua | Berdasarkan field Catatan Khusus pada order gizi dari unit pelayanan. |
| `has_companion_food` | Makanan Pendamping | tri-state/boolean | Tidak | Semua/Ya/Tidak | Semua | Berdasarkan kriteria rumah sakit. |

> **Display rule:** Menu tambahan tidak ditampilkan pada dashboard dan tidak disediakan sebagai field filter. Data tersebut hanya ditampilkan pada form detail/konfirmasi/edit order.

### B. Layar INPUT — Konfirmasi/Edit Order Gizi (FR-010–FR-012; FR-020)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `consistency_id` | Konsistensi | lookup/dropdown | Ya | Master aktif | Data order/preskripsi aktif | Contoh v1: Biasa, Saring; dapat diedit sebelum dan setelah konfirmasi. |
| `meal_time_id` | Waktu Makan | dropdown | Ya | `Makan Pagi`, `Snack Pagi`, `Makan Siang`, `Makan Sore`, `Snack Sore` | Data order | Dapat diedit sebelum dan setelah konfirmasi. |
| `staple_food_id` | Makanan Pokok | lookup/dropdown | Ya | Master aktif | Data order/preskripsi | Contoh v1: Nasi, Tim, Bubur Kasar; dapat diedit sebelum dan setelah konfirmasi. |
| `diet_type_ids` | Jenis Diet | multi-select lookup | Tidak | Bila diisi, hanya master aktif | Diet aktif pasien/order | Opsional dan mendukung kombinasi diet; dapat diedit sebelum dan setelah konfirmasi. |
| `additional_item_ids` | Tambahan Lainnya | multi-select lookup | Tidak | Master aktif | Data order | Contoh v1: Air Es, Extra Buah, Extra Jus Jambu; dapat diedit sebelum dan setelah konfirmasi. |
| `companion_food_menu_id` | Makanan Pendamping Pasien | lookup/dropdown | Tidak | Hanya tersedia untuk layanan kelas VIP ke atas; master aktif | Data order | Makanan yang diorder untuk pendamping/penunggu pasien; dapat diedit sebelum dan setelah konfirmasi. |
| `administration_date` | Waktu Pemberian | date | Ya | `DD/MM/YYYY`; tanggal minimal hari ini | Tanggal order/pemberian atau hari ini | Backdate ditolak; dapat diedit sebelum dan setelah konfirmasi. |
| `special_note` | Catatan Khusus | textarea | Tidak | Maks. 500 karakter | Data order dari unit pelayanan | Diinput ketika membuat order gizi di pelayanan; ditampilkan pada form konfirmasi dan dapat diedit oleh Ahli Gizi sebelum maupun setelah konfirmasi. |

### C. Data TAMPIL — Header dan Informasi Pasien pada Detail (FR-010)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| No. RM | Master Pasien | Text | — | Read-only. |
| Nama Pasien | Master Pasien | Nama + sapaan | — | Read-only. |
| Jenis Kelamin | Master Pasien | L/P atau label | — | Dapat digabung pada nama/header. |
| Tanggal Lahir & Umur | Master Pasien | `DD/MM/YYYY (xx Tahun)` | — | Umur dihitung pada tanggal layanan. |
| Unit/Perawatan | Registrasi Rawat Inap | Unit–kamar–bed–kelas | — | Read-only dan menggunakan lokasi aktif/order snapshot sesuai keputusan desain. |
| Tipe Penjamin | Registrasi/Penjamin | Text | — | Read-only. |
| Preskripsi Diet Awal | Asesmen/Preskripsi Diet | Text/list | — | Menampilkan “Tidak ada Preskripsi” bila kosong. |
| Status Operasi | Pelayanan/EMR | Badge/text | — | Referensi v1 menampilkan “Pasien tidak operasi”. Sumber final [PERLU KONFIRMASI]. |
| Catatan Khusus | Order Makanan Unit Pelayanan | Teks lengkap | — | Nilai yang diinput ketika user pelayanan membuat order gizi dan dapat diedit oleh Ahli Gizi. |

### D. Data DIBUAT OTOMATIS saat Konfirmasi dan Edit (FR-012–FR-015; FR-020)

| Field | Label | Tipe | Format/Sumber | Catatan |
|---|---|---|---|---|
| `order_status` | Status Order | enum | Diubah menjadi `CONFIRMED` saat konfirmasi | Saat edit, status tetap `CONFIRMED`. |
| `confirmed_at` | Tanggal Konfirmasi | datetime | Waktu server | Diisi pada konfirmasi pertama dan tidak diganti saat edit. |
| `confirmed_by` | Petugas Konfirmasi | UUID/ID staf | User login | Diisi pada konfirmasi pertama. |
| `last_edited_at` | Terakhir Diedit | datetime | Waktu server | Diisi setiap penyimpanan perubahan pada order terkonfirmasi. |
| `last_edited_by` | Petugas Edit | UUID/ID staf | User login | Petugas terakhir yang mengubah order terkonfirmasi. |
| `confirmation_payload` | Data Konfirmasi Terakhir | object/snapshot | Data form yang berhasil disimpan | Diperbarui ketika edit berhasil agar data aktif mencerminkan nilai terbaru. |
| `audit_event` | Audit Konfirmasi/Edit | event/log | Sistem | Memuat order, user, waktu, aksi, hasil, serta data sebelum/sesudah sesuai kemampuan audit. |
| `recap_eligibility` | Status Masuk Rekap | boolean/event | `true` setelah konfirmasi berhasil | Tetap `true` selama status order confirmed. |
| `recap_sync_status` | Status Sinkronisasi Rekap | enum | `PENDING`, `SUCCESS`, `FAILED` | Wajib digunakan karena sinkronisasi rekap bersifat asynchronous. |
| `recap_retry_count` | Jumlah Retry | integer | Sistem | Bertambah setiap percobaan ulang sinkronisasi. |
| `recap_last_error` | Error Sinkronisasi Terakhir | text | Sistem | Disimpan saat status `FAILED` untuk kebutuhan audit dan troubleshooting. |

| `recap_synced_at` | Waktu Sinkron Rekap | datetime | Waktu server | Waktu sinkronisasi terakhir berhasil. |
| `updated_at` | Waktu Perubahan | datetime | Waktu server | Untuk pembaruan dashboard dan versioning event sinkronisasi. |

### E. Layar TAMPIL — Dashboard Order Makanan (FR-006–FR-009)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| No. | Hasil query | Nomor urut | — | Mengikuti halaman aktif. |
| Tanggal Pemberian | Order | `DD/MM/YYYY` | Filter & sort | Kolom utama. |
| Tanggal Order | Order | `DD/MM/YYYY HH:mm` | Sort | Ditampilkan pada row detail/expanded row mengikuti v1. |
| Nama Pasien | Master Pasien | Nama; dapat disertai gender/umur | Search | Satu-satunya kolom yang digunakan untuk pencarian pasien. |
| No. RM | Master Pasien | Text | — | Read-only dan tidak termasuk cakupan pencarian. |
| Tipe Penjamin | Registrasi | Text | - | Read-only. |
| Unit/Perawatan | Registrasi/Order | Text ringkas + tooltip | - (read only) | Jangan kehilangan informasi kamar/kelas penting. |
| Waktu Makan | Order/Master Gizi | Badge | Filter & sort | Warna badge konsisten per master/design system. |
| Dokter | Order snapshot/Master Staf | Nama staf | - | Dokter yang terkait order. |
| Petugas Order | Order snapshot/Master Staf | Nama staf | - | User pembuat order. |
| Tanggal Konfirmasi | Order | `DD/MM/YYYY HH:mm` | Sort | Hanya pada tab terkonfirmasi. |
| Petugas Konfirmasi | Order/Audit | Nama staf | - | Dapat ditampilkan langsung atau pada expanded row. |
| Jenis Diet | Diet aktif/order | Badge/list ringkas | Filter | Multiple diet diringkas tanpa menghilangkan detail. |
| Catatan Khusus | Order Makanan Unit Pelayanan | Teks langsung; ellipsis + tooltip jika panjang | Filter ada/tidak | Isi catatan tampil pada dashboard. Tooltip menampilkan teks lengkap tanpa perlu membuka detail. |
| Makanan Pendamping Pasien | Order | Badge Ya/Tidak atau nama menu | Filter | Makanan untuk pendamping/penunggu pasien; hanya tersedia untuk layanan kelas VIP ke atas dan ikut rekap bila dikonfirmasi. |
| Aksi | Hak akses/status | Ikon/menu | — | Seluruh ikon aksi v1 dipertahankan sesuai fungsi eksisting, kecuali Cetak Label Makanan. Order belum dikonfirmasi mendukung detail/konfirmasi; order terkonfirmasi mendukung detail/edit. |

### F. Layar TAMPIL — History Order Gizi (FR-016)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Tanggal | History order | `DD/MM/YYYY HH:mm` | Sort terbaru | Tanggal order/konfirmasi perlu dipastikan. |
| Konsistensi | History order | Text | — | Snapshot order sebelumnya. |
| Waktu Makan | History order | Badge | — | Mengikuti master. |
| Makanan Pokok | History order | Text | — | — |
| Jenis Diet | History order | List/ringkasan | — | Mendukung lebih dari satu diet. |
| Tambahan Lain | History order | List/ringkasan | — | Tanda “-” bila kosong. |
| Makanan Pendamping Pasien | History order | Text | — | Tanda “-” bila kosong; history dibatasi pada episode rawat inap yang sama. |
| Catatan Khusus | History order | Text | — | Tanda “-” bila kosong. |
| Ahli Gizi | Audit/order | Nama staf | — | Menampilkan Ahli Gizi yang mengonfirmasi atau terakhir mengubah order. |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|---|---|---|---|
| **NFR-001** | Performa | Initial load dashboard harus selesai dalam < 2 detik pada kondisi operasional normal. | Draft business process; Metrik |
| **NFR-002** | Performa | Filter dan pencarian harus merespons dalam < 1 detik. | Draft business process; Metrik |
| **NFR-003** | Performa | Proses konfirmasi atau penyimpanan edit harus memberikan response dalam < 1 detik pada kondisi normal. | Draft business process; Metrik |
| **NFR-004** | Real-Time / Eventual Consistency | Perpindahan status dan pembaruan dashboard harus real-time setelah penyimpanan order berhasil. Sinkronisasi ke rekap boleh asynchronous dan dianggap selesai saat status `SUCCESS`. | Draft business process; Feedback stakeholder; FR-013; FR-014; FR-020 |
| **NFR-005** | Skalabilitas | Dashboard harus tetap responsif untuk ratusan hingga ribuan order per hari dengan pagination atau pemuatan bertahap. | Draft business process; FR-018 |
| **NFR-006** | Reliabilitas | Sinkronisasi rekap harus asynchronous, idempotent, memiliki status `PENDING/SUCCESS/FAILED`, retry terkontrol, dan error yang dapat ditelusuri tanpa menduplikasi data rekap. | BR-007; BR-008; BR-015; BR-029; FR-019; FR-023 |
| **NFR-007** | Usability | Loading, empty state, no-result state, dan error state harus jelas serta tidak membuat user salah mengira data kosong. | FR-018 |
| **NFR-008** | Ergonomi UI | Catatan Khusus harus tampil langsung sebagai teks pada dashboard. Catatan panjang menggunakan ellipsis dan tooltip yang mudah dibaca; menu tambahan lain hanya ditampilkan pada form detail/konfirmasi/edit. | Goal user; FR-006–FR-008; FR-010 |
| **NFR-009** | Keamanan/RBAC | Sementara seluruh akses operasional dashboard—lihat, detail, konfirmasi, edit order terkonfirmasi, dan history—hanya tersedia bagi role Ahli Gizi. | BR-005 |
| **NFR-010** | Auditabilitas | Seluruh konfirmasi dan edit harus dapat ditelusuri berdasarkan order, user, waktu, aksi, dan hasil transaksi. | BR-008; FR-015 |
| **NFR-011** | Konsistensi | Label status, badge waktu makan, diet, Catatan Khusus, dan makanan pendamping harus menggunakan design system Neurovi v2 secara konsisten. | Referensi v1; UX v2 |
| **NFR-012** | Aksesibilitas | Informasi penting tidak boleh hanya dibedakan melalui warna; badge/ikon harus memiliki label atau tooltip yang dapat dipahami. | UX v2 |
| **NFR-013** | Konfigurabilitas | Jenis diet, konsistensi, makanan pokok, tambahan, dan makanan pendamping harus mengambil master aktif rumah sakit, bukan hard-code; daftar waktu makan mengikuti BR-003. | BR-003; Related Feature |

## 14. Integrasi Internal & Dependency

Tidak terdapat integrasi eksternal pada scope ini. Seluruh integrasi merupakan komunikasi antar-modul internal Neurovi SIMRS.

| Integrasi | Fungsi di Modul Ini | Status | Trace |
|---|---|---|---|
| **Registrasi Rawat Inap** | Menentukan pasien masih dirawat, lokasi aktif, unit, kelas, dan penjamin. | Internal | BR-001; FR-001 |
| **Order Makanan Unit Pelayanan** | Menyediakan order baru, Catatan Khusus, dokter, petugas order, tanggal, dan waktu makan. | Internal — Hard dependency | BR-011; FR-001; FR-007; FR-009 |
| **Asesmen/Preskripsi Diet** | Menyediakan diet aktif dan preskripsi diet awal. | Internal — Hard dependency | BR-009; FR-006; FR-010 |
| **Master Gizi** | Menyediakan nilai lookup seluruh komponen makanan. | Internal — Hard dependency | FR-010; NFR-013 |
| **Rekap Order Makanan** | Menerima order terkonfirmasi dan setiap perubahan terbarunya melalui proses asynchronous dengan status dan retry sebagai sumber perhitungan produksi. | Internal — Hard dependency | BR-007; BR-015; BR-022; BR-029; FR-014; FR-020; FR-023 |
| **Audit Trail** | Menyimpan aktivitas dan hasil konfirmasi maupun edit. | Internal | BR-008; FR-015 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|---|---|---|
| Order Makanan dari Unit Pelayanan | Hard | Dashboard tidak memiliki sumber order dan Catatan Khusus. |
| Registrasi Rawat Inap | Hard | Sistem tidak dapat memastikan status dirawat dan unit pasien. |
| Master Gizi | Hard | Form konfirmasi/edit tidak dapat memuat pilihan yang valid. |
| Rekap Order Makanan | Hard | Order dapat dikonfirmasi, tetapi event sinkronisasi akan berstatus gagal/pending dan data produksi belum diperbarui sampai retry berhasil. |
| Data Diet Aktif | Hard untuk peningkatan v2 | Jenis diet dan filter diet tidak dapat ditampilkan secara akurat. |

## 15. Risk & Mitigation

| ID | Risiko | Mitigasi |
|---|---|---|
| **R1** | Perubahan order terkonfirmasi berhasil pada dashboard tetapi belum tercermin pada rekap karena proses asynchronous. | Gunakan event idempotent, status `PENDING/SUCCESS/FAILED`, retry terkontrol, error detail, dan audit yang dapat dipantau. |
| **R2** | Order duplikat untuk pasien, tanggal, dan waktu makan yang sama menyebabkan kelebihan produksi. | Terapkan validasi unik bisnis sesuai BR-002 pada sisi backend dan tangani konflik secara atomik. |
| **R3** | Catatan Khusus dari pelayanan tidak ikut terbawa atau tertimpa saat konfirmasi/edit. | Gunakan satu field kanonik pada data order, pertahankan nilai saat form dibuka, dan catat perubahan pada audit trail. |
| **R4** | User mengedit order terkonfirmasi secara bersamaan sehingga perubahan saling menimpa. | Terapkan optimistic locking/versioning dan tampilkan informasi konflik perubahan. |
| **R5** | Catatan Khusus yang panjang membuat dashboard terlalu lebar atau sulit dibaca. | Batasi lebar kolom, gunakan ellipsis, dan tampilkan teks lengkap melalui tooltip yang tetap dapat diakses menggunakan keyboard. |
| **R6** | Volume ribuan order memperlambat filter dan pencarian. | Terapkan query terindeks, pagination server-side, debounce pencarian, dan batas periode yang dikonfigurasi. |
| **R7** | Master makanan tidak aktif tetapi masih direferensikan order lama. | Simpan snapshot label pada order/history dan bedakan data historis dari pilihan master aktif. |

## 16. Asumsi

- **[ASUMSI]** Entry point v2 tetap menggunakan nomenklatur **Gizi > Order Makanan Pasien**, berdasarkan referensi v1.
- **[ASUMSI]** Tab default saat dashboard dibuka adalah **Belum dikonfirmasi**.
- **[ASUMSI]** Form konfirmasi/edit v2 mempertahankan field utama dan history order gizi yang terlihat pada v1 karena draft menyatakan tidak ada perubahan logic sistem.
- **[ASUMSI]** Data historis menyimpan label/snapshot komponen makanan agar tidak berubah ketika master diubah atau dinonaktifkan.
- **[ASUMSI]** Catatan Khusus menggunakan satu field kanonik dari order gizi unit pelayanan dan tidak mengambil data dari asesmen atau instruksi klinis lain.
- **[ASUMSI]** Edit order terkonfirmasi memperbarui data aktif order dan rekap, sedangkan identitas serta waktu konfirmasi pertama tetap dipertahankan.
- **[ASUMSI]** Fungsi teknis setiap ikon aksi row mengikuti perilaku eksisting v1; dokumen ini hanya menetapkan seluruh ikon dipertahankan kecuali Cetak Label Makanan.

## 17. Pertanyaan Terbuka

- **[PERLU KONFIRMASI]** Reviewer teknis, target release, dan nomenklatur Dokumen ID final belum ditentukan.

## 18. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|---|---|---|---|
| 1.0 | 21 Juli 2026 | Team Product | Dokumen awal berdasarkan draft business process dan referensi fitur Neurovi v1. |
| 1.1 | 21 Juli 2026 | Team Product | Menetapkan Catatan Khusus sebagai data order dari pelayanan; menghapus menu tambahan dari filter; menambahkan edit order terkonfirmasi dan sinkronisasi perubahan ke Rekap Order Makanan. |
| 1.2 | 21 Juli 2026 | Team Product | Menghapus menu tambahan dari tampilan dashboard. Menu tambahan tetap tersedia pada form detail/konfirmasi/edit dan tetap tersinkron ke Rekap Order Makanan. |
| 1.3 | 21 Juli 2026 | Team Product | Menampilkan Catatan Khusus langsung pada dashboard dengan ellipsis/tooltip; menetapkan akses sementara hanya untuk Ahli Gizi; pencarian berdasarkan nama; default periode hari ini tanpa batas maksimal; menetapkan daftar waktu makan; menjadikan Jenis Diet opsional; seluruh field order editable; mendefinisikan makanan pendamping kelas VIP ke atas; melarang backdate; menetapkan history per episode; sinkronisasi rekap asynchronous; menghapus indikator Terakhir Diedit dari dashboard; dan menetapkan Cetak Label sebagai out of scope. |
