# PRD — Order Permintaan Radiologi

**Related Document:** `Bisnis Proses Order Permintaan Radiologi.pdf`; `TEMPLATE-PRD-Generator-Neurovi-v2.md`; referensi UI v2 `Tambah Penunjang Radiologi`; Master Data Radiologi — hard dependency; PRD Riwayat Pemeriksaan Penunjang — dokumen terpisah dan menjadi upstream entry point; PRD Cetak Formulir Permintaan Radiologi — dokumen terpisah untuk keluaran cetak  
**Dokumen ID:** PRD-P-RAD-ORDER-v2.0  ·  **Versi:** 1.7 (Draft — Penyederhanaan validasi pemeriksaan dan jadwal)  
**Tanggal Disusun:** 20 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]`  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Order Permintaan Radiologi adalah fitur Neurovi v2 yang digunakan oleh Dokter, Perawat, dan Bidan untuk membuat permintaan pemeriksaan radiologi dalam konteks pasien dan episode pelayanan Rawat Jalan, Rawat Inap, IGD, IBS, atau VK. Entry point tetap melalui **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi → Form Order Permintaan Radiologi**. Scope PRD ini dimulai setelah jenis penunjang Radiologi dipilih dan konteks pasien diteruskan ke form. Seluruh ketentuan halaman Riwayat Pemeriksaan Penunjang dikelola pada tiket dan PRD terpisah.

Form Order Radiologi v2 mempertahankan tujuan bisnis v1 sekaligus memperbarui cara pemeriksaan disajikan dan dilengkapi. Pemeriksaan dikelompokkan berdasarkan modalitas radiologi; tersedia input Status Puasa dan Status Kehamilan; serta struktur hierarki pemeriksaan mengikuti konfigurasi Master Data Radiologi: **Modalitas → Kelompok Organ → Jenis Pemeriksaan → Detail Pemeriksaan**. Detail per item mencakup teknik pemindaian, posisi/proyeksi, sisi tubuh, penggunaan zat kontras, dan catatan klinis.

Lingkup Fase 1 mencakup pengisian dan validasi form, penyimpanan order, pembuatan nomor order, pengiriman ke Dashboard Radiologi, snapshot Master Data Radiologi, audit trail, serta kontrak status yang dipakai bersama oleh transaksi order dan dashboard. Status aktif adalah **Belum Terkonfirmasi**, **Jadwal Terkonfirmasi**, **Sedang Diproses**, **Menunggu Expertise**, **Selesai**, dan **Dibatalkan**. Aksi **Simpan** langsung menghasilkan status **Belum Terkonfirmasi**; status Draft tidak digunakan dalam lifecycle ini.

> Referensi: `Bisnis Proses Order Permintaan Radiologi.pdf`, referensi visual v2 `Tambah Penunjang Radiologi`, dan keputusan stakeholder pada revisi 1.1–1.7.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber bisnis proses dan keputusan stakeholder:
- Order radiologi dapat dibuat dalam konteks pelayanan Rawat Jalan, Rawat Inap, IGD, IBS, dan VK, lalu diteruskan ke unit Radiologi untuk proses selanjutnya.
- Role Dokter, Perawat, dan Bidan dapat membuat order sesuai kewenangan dan hak akses unit.
- Perbedaan utama form v1 dengan target form v2 telah ditetapkan: pemeriksaan pada v2 dikelompokkan berdasarkan modalitas; form memiliki input baru Status Puasa dan Status Kehamilan; serta struktur pemeriksaan mengikuti konfigurasi Master Data Radiologi berupa Modalitas → Kelompok Organ → Jenis Pemeriksaan → Detail Pemeriksaan.
- Detail pemeriksaan v2 mencakup teknik pemindaian, posisi/proyeksi, sisi tubuh, penggunaan zat kontras, dan catatan yang disimpan independen per item.
- Status order pada implementasi sebelumnya belum menggunakan nomenklatur dan trigger terbaru yang sama antara transaksi Order Radiologi dan Dashboard Radiologi.

**Masalah/pain point:**
- **Aspek bisnis proses:** informasi permintaan harus lengkap sejak awal agar Radiologi tidak perlu melakukan komunikasi ulang; satu pasien dapat memiliki beberapa order dan beberapa pemeriksaan dalam satu episode; jadwal pelaksanaan dapat berada pada episode berbeda; pembatalan harus terkontrol; dan status order harus konsisten antara transaksi order, Dashboard Radiologi, Radiografer, dan Dokter Radiologi.
- **Aspek UX:** daftar pemeriksaan perlu disusun berdasarkan modalitas, organ, dan nama pemeriksaan; pencarian harus cepat; atribut teknis harus dapat diisi langsung per item tanpa membuka halaman tambahan; serta pemilihan banyak item harus tetap ringkas.
- **Aspek logic system:** seluruh struktur transaksi harus mengacu pada Master Data Radiologi; atribut wajib bersifat kontekstual; histori tidak boleh berubah ketika master diperbarui; sistem harus mencegah konflik perubahan antar-user; serta setiap trigger operasional harus menghasilkan status dashboard yang deterministik.

**Dampak utama yang disasar v2:**
- Permintaan radiologi lebih cepat, lengkap, akurat, dan terdokumentasi.
- Dashboard Radiologi menerima data klinis dan teknis yang memadai untuk menyiapkan pemeriksaan.
- Status order dapat ditelusuri sejak disimpan, dikonfirmasi untuk hari ini atau tanggal mendatang, diproses, menunggu expertise, selesai, atau dibatalkan.
- Multiple order dan pelaksanaan lintas episode dapat ditelusuri tanpa saling menimpa data.

**Cakupan rilis Neurovi v2:**
- **Fase 1 (MVP)** = form Order Radiologi terintegrasi, validasi field wajib dan atribut teknis, penyimpanan order, pengiriman ke Dashboard Radiologi, sinkronisasi lifecycle status, snapshot master, audit trail, dan entry point cetak permintaan.

> Volume operasional yang diantisipasi adalah sekitar **150–200 pasien radiologi per hari**, dengan beberapa user dapat membuat atau memproses order secara bersamaan.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Entry point dan handoff dari upstream module** — user menavigasi melalui **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi**. Setelah Radiologi dipilih, form Order Radiologi menerima konteks pasien, registrasi, episode, unit pelayanan, dan user. Ketentuan halaman Riwayat Pemeriksaan Penunjang ditetapkan pada PRD terpisah.
2. **Kontrol akses** — Dokter, Perawat, dan Bidan dapat membuat order sesuai role, unit, dan kewenangan.
3. **Konteks pasien dan episode** — sistem membawa nomor rekam medis, identitas pasien, tanggal lahir/usia, jenis kelamin, unit pelayanan, penjamin, registrasi, dan episode aktif ke form.
4. **Shortcut pelayanan** — form menyediakan shortcut Assesmen, Input Tindakan, Buat Surat, dan Buat Resep; Buat Resep menampilkan E-Resep, CPO, dan Retur Obat sesuai hak akses.
5. **Detail permintaan** — user mengisi Jadwal Pemeriksaan, Dokter Pengirim, **Urgensi**, dan satu atau lebih Diagnosa Pengantar. Urgensi wajib diisi, memiliki default **Normal**, dan menggunakan pilihan `Normal`, `Cito Tanpa Expertise`, atau `Cito Dengan Expertise`. Diagnosa Pengantar wajib diisi minimal satu.
6. **Default Dokter Pengirim** — untuk Dokter, default adalah user login; untuk Perawat/Bidan, default adalah DPJP utama episode. Field tetap editable melalui dropdown Master Data Staff.
7. **Jadwal Pemeriksaan** — menyimpan tanggal saja, default tanggal order dibuat, dan dapat diedit dengan validasi terhadap tanggal registrasi.
8. **Informasi klinis pendukung** — Status Puasa dan Status Hamil memiliki default **Tidak**, dapat diubah user, dan disimpan pada header order.
9. **Pencarian pemeriksaan** — pencarian berdasarkan nama pemeriksaan disertai aksi Reset.
10. **Hierarki pemeriksaan berbasis master** — Modalitas → Kelompok Organ → Jenis Pemeriksaan → Detail Pemeriksaan.
11. **Pemilihan multi-item** — satu order dapat memuat satu atau lebih pemeriksaan, termasuk pemeriksaan dari modalitas berbeda.
12. **Multiple order** — satu pasien dapat memiliki lebih dari satu order radiologi dalam satu episode pelayanan tanpa saling menimpa.
13. **Detail teknis per item** — teknik pemindaian, posisi/proyeksi, laterality, penggunaan zat kontras, jenis kontras bila diperlukan, dan catatan klinis.
14. **Catatan klinis** — maksimum 500 karakter per item pemeriksaan dan dilengkapi penghitung karakter.
15. **Validasi sebelum simpan** — Dokter Pengirim, Urgensi, minimal satu Diagnosa Pengantar, minimal satu pemeriksaan, Jadwal Pemeriksaan terhadap tanggal registrasi, batas catatan, dan atribut wajib per item.
16. **Penyimpanan order final** — tombol **Simpan** membuat nomor order unik 10 digit `YYMMDDNNNN`, menyimpan header dan item secara atomik, serta menetapkan status awal **Belum Terkonfirmasi**.
17. **Pengiriman ke Dashboard Radiologi** — order yang tersimpan otomatis masuk ke Dashboard Radiologi sebagai antrean dengan status **Belum Terkonfirmasi**.
18. **Konfirmasi jadwal hari ini** — ketika Radiografer mengonfirmasi order dengan Jadwal Pemeriksaan sama dengan tanggal operasional hari ini, status berubah dari **Belum Terkonfirmasi** menjadi **Sedang Diproses**.
19. **Konfirmasi jadwal mendatang** — ketika Radiografer mengonfirmasi order dengan Jadwal Pemeriksaan bukan tanggal operasional hari ini, status berubah dari **Belum Terkonfirmasi** menjadi **Jadwal Terkonfirmasi**.
20. **Konfirmasi ulang pada hari pelaksanaan** — ketika tanggal yang telah dijadwalkan tiba dan Radiografer melakukan konfirmasi ulang, status berubah dari **Jadwal Terkonfirmasi** menjadi **Sedang Diproses**.
21. **Input foto/image** — setelah Radiografer berhasil menginput foto/image, status berubah dari **Sedang Diproses** menjadi **Menunggu Expertise**.
22. **Penyelesaian oleh Dokter Radiologi** — setelah Dokter Radiologi menyelesaikan pemeriksaan/expertise, status berubah dari **Menunggu Expertise** menjadi **Selesai**.
23. **Pembatalan** — order yang dibatalkan berubah menjadi **Dibatalkan** dan menyimpan aktor, waktu, alasan, status asal, serta versi data.
24. **Keterkaitan lintas episode** — bila pemeriksaan dilakukan pada episode lain, data pelaksanaan dan hasil dikaitkan ke episode pelaksanaan dengan referensi order asal tetap dipertahankan.
25. **Cetak permintaan** — tombol Print dapat memicu pencetakan order tersimpan; isi dan layout dokumen mengikuti PRD/tiket terpisah.
26. **Audit trail** — pembuatan order, konfirmasi, konfirmasi ulang, perubahan status, pembatalan, input foto/image, penyelesaian expertise, dan pencetakan tercatat.

### Out Scope

- Seluruh requirement, data, tampilan, filter, aksi, dan output pada halaman **Riwayat Pemeriksaan Penunjang**; seluruhnya dikelola pada tiket dan PRD terpisah.
- Form hasil pemeriksaan dan output print/download hasil Laboratorium, Radiologi, maupun Patologi Anatomi.
- Konfigurasi dan pemeliharaan Master Data Radiologi.
- Desain isi, template, penomoran dokumen, dan aturan keluaran cetak Formulir Permintaan Radiologi.
- Detail layout serta interaksi Dashboard Radiologi, layar konfirmasi Radiografer, layar input foto/image, dan layar expertise Dokter Radiologi; PRD ini hanya menetapkan kontrak trigger dan status yang harus dipakai bersama.
- Proses teknis akuisisi citra pada modality/PACS di luar event bahwa foto/image telah berhasil diinput.
- Isi expertise/hasil radiologi dan tampilan klinis hasil.
- Perhitungan tarif, posting billing, klaim, dan proses kasir.
- Implementasi teknis DiagnosticReport/ImagingStudy untuk SATUSEHAT.
- Detail proses di dalam Assesmen, Input Tindakan, Buat Surat, E-Resep, CPO, dan Retur Obat; PRD ini hanya menetapkan shortcut navigasi.

## 4. Goals and Metrics

### Tujuan

Menyediakan form Order Radiologi yang terintegrasi, cepat, lengkap, dan mudah digunakan pada seluruh unit pelayanan, dengan struktur pemeriksaan yang dapat dikonfigurasi terpusat serta status transaksi yang konsisten dengan Dashboard Radiologi.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu penyimpanan order | `< 1 detik` pada beban operasional yang disepakati | NFR-001; bisnis proses |
| Respons pencarian pemeriksaan | Responsif pada master berukuran besar | NFR-002; bisnis proses |
| Perpindahan antar-modalitas | Tidak mengalami lag yang mengganggu user | NFR-003; bisnis proses |
| Kapasitas operasional | Mendukung sekitar `150–200 pasien radiologi/hari` dan concurrent order | NFR-004; bisnis proses |
| Integritas nomor order | 100% unik untuk setiap order tersimpan | BR-006; FR-017 |
| Kelengkapan validasi wajib | 100% order tersimpan memenuhi Dokter Pengirim, Urgensi, minimal satu Diagnosa Pengantar, minimal satu pemeriksaan, Jadwal Pemeriksaan, batas catatan, dan atribut teknis wajib | BR-009–BR-025; FR-015 |
| Konsistensi status | 100% event status menghasilkan label yang sama pada data order dan Dashboard Radiologi | BR-026–BR-032; FR-019–FR-024; NFR-015 |
| Konflik update workflow | Tidak ada update workflow yang menimpa versi lebih baru tanpa deteksi konflik | BR-036; FR-018; FR-026; NFR-005 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Modul |
|-------|----------------------|
| **Dashboard Pelayanan RJ/RI/IGD/IBS/VK** | Menyediakan konteks pasien, registrasi, episode, unit, dan user untuk membuka alur Pemeriksaan Penunjang. |
| **Riwayat Pemeriksaan Penunjang** | Upstream entry point pada alur Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi; seluruh requirement halaman dikelola pada PRD terpisah. |
| **Registrasi & Episode** | Sumber konteks pasien, episode asal, DPJP utama, tanggal registrasi, penjamin, dan relasi episode pelaksanaan. |
| **Master Data Radiologi** | Sumber modalitas, kelompok organ, pemeriksaan, detail teknis, atribut wajib, status Active, dan sorting. |
| **Master Data Staff** | Sumber Dokter Pengirim, DPJP utama, Radiografer, dan Dokter Radiologi sesuai kebutuhan workflow. |
| **Master Diagnosa/EMR** | Sumber lookup multiple Diagnosa Pengantar dan konteks klinis pasien. |
| **Auth/RBAC Neurovi** | Menentukan role, unit, dan kewenangan create, confirm, input image, complete expertise, cancel, dan print. |
| **Dashboard Radiologi** | Menerima order berstatus Belum Terkonfirmasi dan menampilkan status workflow yang sama dengan transaksi order. |
| **Penjadwalan/Konfirmasi Radiologi** | Radiografer mengonfirmasi jadwal hari ini atau tanggal mendatang dan melakukan konfirmasi ulang pada hari pelaksanaan. |
| **Pelayanan Radiologi / Akuisisi Image** | Radiografer menginput foto/image dan memicu status Menunggu Expertise. |
| **Expertise/Hasil Radiologi** | Dokter Radiologi menyelesaikan pemeriksaan/expertise dan memicu status Selesai; isi hasil berada di luar scope. |
| **Audit Trail** | Menyimpan create, status transition, image input, expertise completion, cancel, dan print. |
| **Cetak Permintaan Radiologi** | Menghasilkan output cetak order tersimpan berdasarkan PRD terpisah. |
| **Billing/Kasir** | Membentuk komponen tagihan dari pemeriksaan yang dilakukan sesuai kebijakan rumah sakit. |
| **SATUSEHAT** | Mengirim DiagnosticReport/ImagingStudy bila digunakan. |
| **Assesmen/Tindakan/Surat/Resep** | Target shortcut navigasi wajib pada form Order Radiologi sesuai hak akses. |

Dependency lintas modul utama: **Riwayat Pemeriksaan Penunjang**, **Registrasi & Episode**, **Master Data Radiologi**, **Master Diagnosa**, **Master Staf**, **Auth/RBAC**, **Dashboard Radiologi**, **Akuisisi Image**, **Expertise Radiologi**, dan **Audit Trail**.

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| **Dokter Pelayanan** | Primary | Membuat order, menentukan informasi klinis, melakukan pembatalan sesuai hak akses, dan mencetak permintaan. |
| **Perawat** | Primary | Membuat order sesuai kewenangan dengan Dokter Pengirim default DPJP utama, lalu melengkapi informasi klinis dan teknis. |
| **Bidan** | Primary | Membuat order dari pelayanan VK atau unit yang diizinkan sesuai hak akses. |
| **Radiografer** | Secondary | Mengonfirmasi jadwal, memulai proses pemeriksaan, menginput foto/image, dan melakukan pembatalan sesuai kewenangan. |
| **Dokter Radiologi** | Secondary | Melakukan pemeriksaan/interpretasi dan menyelesaikan expertise sehingga order berstatus Selesai. |
| **Admin Master Radiologi** | Tersier | Mengelola struktur dan konfigurasi Master Data Radiologi di modul terpisah. |
| **Auditor/Manajemen** | Tersier | Meninjau riwayat status dan aktivitas order untuk audit serta monitoring operasional. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. User memulai dari **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi**. Ketentuan internal halaman Riwayat Pemeriksaan Penunjang tidak dibahas dalam PRD ini.
2. User mengisi informasi order dan memilih pemeriksaan radiologi.
3. Order yang berhasil disimpan diteruskan ke unit Radiologi untuk diproses.
4. Detail pengelompokan modalitas, Status Puasa, Status Kehamilan, dan hierarki detail teknis belum mengikuti struktur target v2.
5. Nomenklatur serta trigger status order dan dashboard belum mengikuti kontrak status terbaru.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. Setelah user menavigasi melalui **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi**, upstream module membuka form Order Radiologi dengan konteks pasien, registrasi, episode, unit pelayanan, penjamin, dan user.
2. Sistem memvalidasi role Dokter, Perawat, atau Bidan serta hak akses unit.
3. Sistem menampilkan ringkasan pasien/episode secara read-only dan menyediakan shortcut pelayanan sesuai hak akses.
4. Sistem mengisi Jadwal Pemeriksaan dengan tanggal order. Field menyimpan tanggal saja dan dapat diedit dengan validasi tidak boleh lebih kecil dari tanggal registrasi, kecuali kebijakan rumah sakit mengizinkan backdate.
5. Sistem mengisi Dokter Pengirim: default user login untuk Dokter; default DPJP utama episode untuk Perawat/Bidan. Field tetap editable melalui dropdown Master Data Staff.
6. Sistem mengisi Urgensi dengan default **Normal**. User dapat memilih `Normal`, `Cito Tanpa Expertise`, atau `Cito Dengan Expertise`, lalu wajib memilih minimal satu Diagnosa Pengantar.
7. Sistem menampilkan Status Puasa **Tidak** dan Status Hamil **Tidak** sebagai default; user dapat mengubah nilai sesuai kondisi pasien dan sistem menyimpan kedua nilai pada header order.
8. Sistem memuat daftar pemeriksaan Active dari Master Data Radiologi menurut sorting Modalitas → Kelompok Organ → Jenis Pemeriksaan.
9. User mencari atau membuka accordion modalitas, lalu memilih satu atau lebih pemeriksaan.
10. Ketika item dipilih, sistem menampilkan detail teknis inline sesuai konfigurasi master, termasuk atribut wajib yang relevan.
11. Sebelum simpan, sistem memvalidasi Dokter Pengirim, Urgensi, minimal satu Diagnosa Pengantar, minimal satu pemeriksaan, Jadwal Pemeriksaan terhadap tanggal registrasi, batas catatan, dan seluruh atribut teknis wajib per item.
12. Ketika user memilih **Simpan**, sistem membuat nomor order unik, menyimpan snapshot pemeriksaan, versi data, audit trail, dan item pemeriksaan secara atomik.
13. Sistem menetapkan status awal **Belum Terkonfirmasi** dan mengirim order ke Dashboard Radiologi.
14. Radiografer membuka order pada Dashboard Radiologi dan melakukan konfirmasi:
    - bila Jadwal Pemeriksaan sama dengan tanggal operasional hari ini, status menjadi **Sedang Diproses**;
    - bila Jadwal Pemeriksaan bukan tanggal operasional hari ini, status menjadi **Jadwal Terkonfirmasi**.
15. Untuk order berstatus Jadwal Terkonfirmasi, ketika tanggal jadwal tiba Radiografer melakukan konfirmasi ulang dan status menjadi **Sedang Diproses**.
16. Setelah Radiografer berhasil menginput foto/image, status menjadi **Menunggu Expertise**.
17. Setelah Dokter Radiologi menyelesaikan pemeriksaan/expertise, status menjadi **Selesai**.
18. Bila order dibatalkan sesuai kewenangan dan aturan proses, status menjadi **Dibatalkan** serta event pembatalan dicatat.
19. Bila jadwal pelaksanaan berada pada episode lain, data pelaksanaan dan hasil dikaitkan ke episode pelaksanaan tanpa menghilangkan referensi order asal.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Batas scope | Entry point dan layar pendukung dapat bercampur dengan pembahasan order | PRD ini hanya mendefinisikan form Order Radiologi dan kontrak workflow; halaman Riwayat dikelola pada PRD terpisah |
| Struktur daftar | Belum dikelompokkan sesuai struktur target v2 | Pemeriksaan dikelompokkan berdasarkan modalitas dan hierarki Master Data Radiologi |
| Hierarki pemeriksaan | Belum menggunakan struktur target lengkap | Modalitas → Kelompok Organ → Jenis Pemeriksaan → Detail Pemeriksaan |
| Status klinis pasien | Belum tersedia pada form order v1 | Input baru Status Puasa dan Status Kehamilan, default Tidak |
| Detail teknis | Belum disajikan dalam hierarki target v2 | Teknik pemindaian, posisi/proyeksi, sisi tubuh, kontras, dan catatan tampil inline per item |
| Pencarian | Belum menjadi fokus perubahan | Pencarian nama pemeriksaan dan Reset |
| Multi-order | Order pasien harus tetap dapat ditelusuri | Beberapa order per pasien/episode, masing-masing bernomor unik |
| Multi-item | Alur v1 belum dijelaskan rinci | Satu order dapat berisi satu atau lebih pemeriksaan dari satu atau beberapa modalitas |
| Detail permintaan | Belum dijelaskan rinci | Jadwal tanggal saja, Dokter Pengirim dengan default berbasis role, Urgensi default Normal, dan Diagnosa Pengantar wajib dengan multiple select |
| Master data | Belum ditegaskan sebagai sumber tunggal | Master Data Radiologi menjadi sumber struktur, pilihan, status aktif, atribut wajib, dan sorting |
| Lifecycle | Belum menggunakan trigger dan label dashboard terbaru | Belum Terkonfirmasi → Jadwal Terkonfirmasi/Sedang Diproses → Menunggu Expertise → Selesai, dengan cabang Dibatalkan |
| Draft | Tidak ditetapkan sebagai status aktif | Tidak digunakan; tombol Simpan langsung menghasilkan Belum Terkonfirmasi |
| Audit | Belum dijelaskan rinci | Pembuatan order, konfirmasi, konfirmasi ulang, transisi status, input image, expertise, pembatalan, dan pencetakan tercatat |

## 7. Main Flow / Mindmap

### Skenario 1 — Membuat order radiologi (alur normal)

1. User menavigasi melalui **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi**; upstream module kemudian membuka form Order Radiologi dalam konteks pasien dan episode aktif.
2. Sistem memvalidasi role serta hak akses unit.
3. Sistem menampilkan identitas pasien/episode, Jadwal Pemeriksaan default tanggal order, Dokter Pengirim sesuai default role, Urgensi default **Normal**, Status Puasa default Tidak, Status Hamil default Tidak, dan daftar pemeriksaan.
4. User memeriksa atau mengubah jadwal dan Dokter Pengirim, meninjau atau mengubah Urgensi, serta wajib memilih minimal satu Diagnosa Pengantar.
5. User mencari atau membuka modalitas, lalu memilih minimal satu pemeriksaan.
6. User melengkapi detail teknis yang tampil secara kontekstual; catatan setiap item dibatasi maksimum 500 karakter.
7. User meninjau dan mengubah Status Puasa atau Status Hamil bila kondisi pasien berbeda dari default.
8. User memilih **Simpan**.
9. Sistem memvalidasi seluruh data, membuat nomor order, menyimpan snapshot master serta audit trail, menetapkan status **Belum Terkonfirmasi**, dan mengirim order ke Dashboard Radiologi.

### Skenario 2 — Memilih beberapa pemeriksaan dan modalitas

1. User memilih pemeriksaan pertama; detail item muncul inline.
2. User membuka modalitas lain atau menggunakan pencarian.
3. User memilih pemeriksaan tambahan; setiap item menyimpan teknik, proyeksi, laterality, kontras, dan catatan secara independen.
4. Sistem memperbarui ringkasan jumlah pemeriksaan terpilih.
5. Sistem menyimpan seluruh item dalam satu nomor order setelah semua validasi terpenuhi.


### Skenario 3 — Validasi Jadwal Pemeriksaan terhadap tanggal registrasi

1. Bila Jadwal Pemeriksaan lebih awal dari tanggal registrasi dan backdate tidak diizinkan oleh kebijakan rumah sakit, sistem memblokir penyimpanan dan menampilkan error pada field Jadwal Pemeriksaan.

### Skenario 4 — Pelaksanaan pada episode berbeda

1. Order dibuat pada episode asal dan menyimpan referensi registrasi/episode asal.
2. Jadwal pemeriksaan berada pada tanggal yang membentuk atau menggunakan episode pelaksanaan berbeda.
3. Modul Radiologi mengaitkan data pelaksanaan dan hasil ke registrasi/episode pelaksanaan.
4. Sistem mempertahankan relasi ke order dan episode asal untuk audit serta penelusuran.

### Skenario 5 — Konfirmasi untuk jadwal hari ini

1. Order tersimpan tampil pada Dashboard Radiologi dengan status **Belum Terkonfirmasi**.
2. Radiografer memeriksa data order dan Jadwal Pemeriksaan.
3. Jadwal Pemeriksaan sama dengan tanggal operasional hari ini.
4. Radiografer melakukan konfirmasi bahwa pasien siap diperiksa hari ini.
5. Sistem mengubah status menjadi **Sedang Diproses** dan menyimpan aktor serta waktu konfirmasi.

### Skenario 6 — Konfirmasi untuk jadwal mendatang

1. Order tersimpan tampil pada Dashboard Radiologi dengan status **Belum Terkonfirmasi**.
2. Jadwal Pemeriksaan bukan tanggal operasional hari ini.
3. Radiografer melakukan konfirmasi jadwal.
4. Sistem mengubah status menjadi **Jadwal Terkonfirmasi** dan menyimpan aktor, waktu, serta tanggal jadwal.
5. Ketika tanggal jadwal tiba, Radiografer melakukan konfirmasi ulang.
6. Sistem mengubah status dari **Jadwal Terkonfirmasi** menjadi **Sedang Diproses**.

### Skenario 7 — Input foto/image dan penyelesaian expertise

1. Order berstatus **Sedang Diproses**.
2. Radiografer menginput foto/image dan proses simpan image berhasil.
3. Sistem mengubah status menjadi **Menunggu Expertise**.
4. Dokter Radiologi membuka pemeriksaan, melakukan pemeriksaan/interpretasi, dan menyelesaikan expertise.
5. Sistem mengubah status menjadi **Selesai**.

### Skenario 8 — Pembatalan order

1. Dokter atau Radiografer berwenang memilih aksi pembatalan pada order yang masih dapat dibatalkan sesuai kebijakan.
2. Sistem meminta alasan pembatalan bila diwajibkan.
3. Sistem memvalidasi versi serta status terkini.
4. Setelah pembatalan berhasil, sistem mengubah status menjadi **Dibatalkan** dan mencatat status asal, aktor, waktu, alasan, serta versi.

### Skenario 9 — Cetak order dan pencegahan konflik data

1. Print hanya dapat dipicu setelah order berhasil disimpan.
2. Isi dan layout dokumen cetak mengikuti PRD/tiket terpisah.
3. Setiap update workflow menggunakan `version_no`; bila versi data telah berubah, sistem menolak overwrite dan meminta user memuat data terbaru.

### Skenario 10 — Shortcut pelayanan pada form Order Radiologi

1. Sistem menampilkan shortcut Assesmen, Input Tindakan, Buat Surat, dan Buat Resep sesuai hak akses.
2. Buat Surat menampilkan daftar jenis surat.
3. Buat Resep menampilkan E-Resep, CPO, dan Retur Obat.
4. Pemilihan shortcut membuka modul target dengan konteks pasien/episode yang sama.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Entry point Order Radiologi adalah **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi → Form Order Permintaan Radiologi**. PRD ini hanya menetapkan handoff konteks pasien dan tidak menetapkan requirement halaman Riwayat Pemeriksaan Penunjang. | FR-001; US-001 |
| **BR-002** | Role yang dapat membuat order adalah Dokter, Perawat, dan Bidan sesuai hak akses unit. | FR-001; US-001–US-002 |
| **BR-003** | Setiap order harus terkait ke pasien, registrasi, episode asal, dan unit pelayanan aktif. | FR-002; US-001 |
| **BR-004** | Satu pasien dapat memiliki lebih dari satu order radiologi dalam satu episode pelayanan tanpa saling menimpa. | FR-017–FR-018; US-005; US-015 |
| **BR-005** | Satu order dapat berisi satu atau lebih pemeriksaan radiologi. | FR-012; US-005 |
| **BR-006** | Setiap order yang berhasil disimpan memiliki nomor unik 10 digit dengan pola `YYMMDDNNNN`, contoh `2607180001`. Aturan reset sequence harian `[PERLU KONFIRMASI]`. | FR-017; US-009 |
| **BR-007** | Jadwal Pemeriksaan menyimpan tanggal saja, default menggunakan tanggal order dibuat, dan dapat diedit. | FR-004; US-003 |
| **BR-008** | Jadwal Pemeriksaan tidak boleh lebih awal dari tanggal registrasi, kecuali kebijakan rumah sakit mengizinkan backdate. | FR-016; US-008 |
| **BR-009** | Dokter Pengirim wajib diisi sebelum order dapat disimpan. | FR-005; FR-015; US-003 |
| **BR-010** | Dokter Pengirim default adalah user login untuk role Dokter dan DPJP utama episode untuk role Perawat/Bidan. Nilai tetap editable melalui dropdown Master Data Staff. | FR-005; US-002–US-003 |
| **BR-011** | Field **Urgensi** wajib menggunakan salah satu nilai: `Normal`, `Cito Tanpa Expertise`, atau `Cito Dengan Expertise`. Nilai default adalah **Normal**. | FR-006; US-003 |
| **BR-012** | Setiap order hanya menyimpan satu nilai Urgensi. Urgensi ditampilkan sebagai satu field pada Detail Permintaan. | FR-006; US-003 |
| **BR-013** | Diagnosa Pengantar wajib diisi dan mendukung multiple select dari Master Diagnosa. | FR-007; FR-015; US-003 |
| **BR-014** | Minimal satu pemeriksaan harus dipilih sebelum penyimpanan. | FR-012; FR-015; US-005 |
| **BR-015** | Seluruh daftar pemeriksaan transaksi hanya berasal dari Master Data Radiologi dan hanya item berstatus Active yang dapat dipilih pada order baru. | FR-010–FR-011; US-004; US-016 |
| **BR-016** | Urutan modalitas, kelompok organ, dan pemeriksaan mengikuti konfigurasi sorting pada Master Data Radiologi. | FR-010–FR-011; US-004 |
| **BR-017** | Perubahan nama atau konfigurasi master hanya berlaku untuk transaksi baru dan tidak mengubah order yang telah tersimpan. | FR-018; US-016 |
| **BR-018** | Setiap item pemeriksaan menyimpan snapshot nama, modalitas, kelompok organ, dan konfigurasi teknis pada saat transaksi. | FR-018; US-009; US-016 |
| **BR-019** | Teknik, proyeksi, laterality, kontras, dan catatan disimpan independen untuk setiap item pemeriksaan. | FR-013–FR-014; US-006 |
| **BR-020** | Atribut wajib per item mengikuti konfigurasi Master Data Radiologi. | FR-013; FR-015; US-006 |
| **BR-021** | Penggunaan zat kontras hanya dapat dipilih pada pemeriksaan yang mendukung kontras; pemeriksaan yang membutuhkan kontras harus menampilkan pilihan jenis kontras. | FR-013; FR-015; US-006 |
| **BR-022** | Laterality dan proyeksi wajib diisi apabila dikonfigurasi wajib pada pemeriksaan. | FR-013; FR-015; US-006 |
| **BR-023** | Catatan klinis setiap item pemeriksaan dibatasi maksimum **500 karakter**. Sistem menolak atau mencegah input melebihi batas tersebut dan menampilkan penghitung karakter. | FR-014–FR-015; US-006 |
| **BR-024** | Status Puasa memiliki default **Tidak**, dapat diubah user, dan disimpan pada header order. | FR-008; US-007 |
| **BR-025** | Status Hamil memiliki default **Tidak**, dapat diubah user, dan disimpan pada header order. | FR-008; US-007 |
| **BR-026** | Aksi **Simpan** yang berhasil membuat nomor order, menyimpan transaksi final, menetapkan status **Belum Terkonfirmasi**, dan mengirim order ke Dashboard Radiologi. Status Draft tidak digunakan. | FR-017; FR-019; US-009 |
| **BR-027** | Status order yang digunakan adalah **Belum Terkonfirmasi**, **Jadwal Terkonfirmasi**, **Sedang Diproses**, **Menunggu Expertise**, **Selesai**, dan **Dibatalkan**. | FR-019–FR-024; US-009–US-014 |
| **BR-028** | Bila Radiografer mengonfirmasi order berstatus Belum Terkonfirmasi dan Jadwal Pemeriksaan sama dengan tanggal operasional hari ini, status menjadi **Sedang Diproses**. | FR-020; US-010 |
| **BR-029** | Bila Radiografer mengonfirmasi order berstatus Belum Terkonfirmasi dan Jadwal Pemeriksaan bukan tanggal operasional hari ini, status menjadi **Jadwal Terkonfirmasi**. | FR-020; US-010 |
| **BR-030** | Ketika tanggal jadwal tiba, Radiografer wajib melakukan konfirmasi ulang agar status berubah dari **Jadwal Terkonfirmasi** menjadi **Sedang Diproses**. | FR-021; US-011 |
| **BR-031** | Setelah Radiografer berhasil menginput foto/image pada order berstatus Sedang Diproses, status berubah menjadi **Menunggu Expertise**. | FR-022; US-012 |
| **BR-032** | Setelah Dokter Radiologi menyelesaikan pemeriksaan/expertise pada order berstatus Menunggu Expertise, status berubah menjadi **Selesai**. | FR-023; US-013 |
| **BR-033** | Pembatalan yang berhasil mengubah status order menjadi **Dibatalkan**. Pembatalan wajib menyimpan status asal, aktor, waktu, alasan, dan versi. Matriks status sumber yang masih dapat dibatalkan `[PERLU KONFIRMASI]`. | FR-024; US-014 |
| **BR-034** | Data pelaksanaan dan hasil yang berlangsung pada episode berbeda dikaitkan ke episode pelaksanaan, dengan relasi ke order dan episode asal tetap dipertahankan. | FR-025; US-015 |
| **BR-035** | Setiap update data atau status order oleh proses yang berwenang menggunakan `version_no`; update tidak boleh membentuk status di luar state machine pada Section 9. | FR-018; FR-026; US-016 |
| **BR-036** | Setiap update workflow order menggunakan optimistic locking/versioning untuk mencegah konflik antar-user. | FR-018; FR-026; NFR-005 |
| **BR-037** | Pembuatan order, konfirmasi jadwal, konfirmasi ulang, input foto/image, penyelesaian expertise, pembatalan, dan pencetakan wajib tercatat dalam audit trail. | FR-026; US-009–US-017 |
| **BR-038** | Fungsi Print hanya tersedia setelah order berhasil disimpan. Isi, layout, dan kebijakan print mengikuti PRD/tiket terpisah. | FR-027; US-017 |
| **BR-039** | Form Order Radiologi wajib menyediakan shortcut Assesmen, Input Tindakan, Buat Surat, dan Buat Resep sesuai hak akses; submenu Buat Resep mencakup E-Resep, CPO, dan Retur Obat. | FR-003; US-018 |
| **BR-040** | Status order pada transaksi, Dashboard Radiologi, dan modul downstream harus menggunakan nilai sumber yang sama; perubahan status tidak boleh hanya terjadi pada layer tampilan. | FR-019–FR-024; NFR-015 |
| **BR-041** | Perbandingan Jadwal Pemeriksaan dengan “hari ini” menggunakan tanggal operasional dan timezone rumah sakit yang sama pada seluruh modul. | FR-020–FR-021; NFR-015 |

## 9. State Machine

### 9.1 Definisi Status Order Radiologi

| Status | Deskripsi | Trigger Perubahan Status | Aktor |
|--------|-----------|--------------------------|-------|
| **Belum Terkonfirmasi** | Order telah dibuat dari pelayanan, berhasil disimpan, masuk ke Dashboard Radiologi, dan menunggu konfirmasi Radiografer. | User pelayanan memilih **Simpan** dan transaksi berhasil. | Dokter/Perawat/Bidan sesuai hak akses |
| **Jadwal Terkonfirmasi** | Jadwal order untuk tanggal selain hari ini telah dikonfirmasi oleh Radiografer dan menunggu hari pelaksanaan. | Radiografer mengonfirmasi order ketika Jadwal Pemeriksaan bukan hari ini. | Radiografer |
| **Sedang Diproses** | Order telah dikonfirmasi siap diperiksa hari ini dan berada dalam proses pelayanan Radiologi sebelum foto/image dinyatakan berhasil diinput. | (a) Radiografer mengonfirmasi order Belum Terkonfirmasi dengan jadwal hari ini; atau (b) Radiografer mengonfirmasi ulang order Jadwal Terkonfirmasi pada hari pelaksanaan. | Radiografer |
| **Menunggu Expertise** | Foto/image telah berhasil diinput oleh Radiografer dan pemeriksaan menunggu pemeriksaan/interpretasi Dokter Radiologi. | Radiografer berhasil menginput foto/image. | Radiografer |
| **Selesai** | Dokter Radiologi telah menyelesaikan pemeriksaan/expertise. | Dokter Radiologi menyelesaikan pemeriksaan/expertise. | Dokter Radiologi |
| **Dibatalkan** | Order tidak dilanjutkan karena pembatalan yang sah. | User berwenang menyelesaikan proses pembatalan. | Sesuai matriks hak akses pembatalan |

### 9.2 Trigger dan Transisi Status

| Dari | Kondisi / Trigger | Aktor | Menjadi | Efek Utama |
|------|-------------------|-------|---------|-------------|
| — | Order Radiologi dibuat dari pelayanan dan user memilih **Simpan** | Dokter/Perawat/Bidan sesuai hak akses | **Belum Terkonfirmasi** | Nomor order dibuat; transaksi dikirim ke Dashboard Radiologi; waktu dan aktor create dicatat. |
| **Belum Terkonfirmasi** | Radiografer melakukan konfirmasi dan `scheduled_date == tanggal operasional hari ini` | Radiografer | **Sedang Diproses** | Order ditandai siap diperiksa hari ini; waktu serta aktor konfirmasi dicatat. |
| **Belum Terkonfirmasi** | Radiografer melakukan konfirmasi dan `scheduled_date != tanggal operasional hari ini` | Radiografer | **Jadwal Terkonfirmasi** | Jadwal mendatang ditetapkan; waktu, aktor, dan tanggal konfirmasi dicatat. |
| **Jadwal Terkonfirmasi** | Tanggal jadwal telah tiba dan Radiografer melakukan konfirmasi ulang | Radiografer | **Sedang Diproses** | Order diaktifkan sebagai siap diperiksa hari ini; waktu serta aktor konfirmasi ulang dicatat. |
| **Sedang Diproses** | Radiografer berhasil menginput foto/image | Radiografer | **Menunggu Expertise** | Referensi/waktu input image dan aktor dicatat; order masuk worklist expertise. |
| **Menunggu Expertise** | Dokter Radiologi menyelesaikan pemeriksaan/expertise | Dokter Radiologi | **Selesai** | Waktu dan aktor penyelesaian expertise dicatat; status menjadi terminal selesai. |
| Status yang diizinkan `[PERLU KONFIRMASI]` | Pembatalan berhasil | User berwenang | **Dibatalkan** | Status asal, aktor, waktu, alasan, dan versi dicatat; proses lanjutan dihentikan. |

- **Alur jadwal hari ini:** `Belum Terkonfirmasi → Sedang Diproses → Menunggu Expertise → Selesai`.
- **Alur jadwal mendatang:** `Belum Terkonfirmasi → Jadwal Terkonfirmasi → Sedang Diproses → Menunggu Expertise → Selesai`.
- **Alur pembatalan:** `[status yang diizinkan] → Dibatalkan`.
- **Simpan Draft tidak digunakan.** Aksi Simpan selalu membuat order final berstatus Belum Terkonfirmasi.
- Perubahan jadwal tidak menggunakan status **Dijadwalkan Ulang**. Bila jadwal berubah, status dan kebutuhan konfirmasi mengikuti kondisi tanggal serta kebijakan workflow Radiologi; detail aksi reschedule `[PERLU KONFIRMASI]`.
- Label lama **Draft**, **Order**, **Terkonfirmasi**, **Dijadwalkan Ulang**, **Pemeriksaan Selesai**, **Terjadwal**, **Pemeriksaan**, **Hasil Tersedia**, dan **Cancelled** tidak digunakan sebagai status order aktif pada PRD ini.
- Update data atau status order oleh proses yang berwenang menggunakan versioning dan audit trail; update tidak menambah status di luar state machine.

## 10. Display & Interaction Rules

| Aspek | Aturan Tampilan / Interaksi | Sumber / Trace |
|-------|-----------------------------|----------------|
| Batas entry point | Alur navigasi tetap **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi**. Setelah handoff, form menerima konteks dari upstream module; komponen dan ketentuan halaman Riwayat tidak dispesifikasikan dalam PRD ini. | Out Scope; FR-001–FR-002 |
| Container form | Form Order Radiologi tampil sebagai modal besar/halaman sesuai design system Neurovi v2, memiliki header, area scroll, tombol tutup, dan footer aksi yang tetap terlihat. | Referensi UI v2; FR-001–FR-002 |
| Ringkasan pasien | No. RM, nama, status pasien bila tersedia, tanggal lahir/usia, jenis kelamin, unit, dan penjamin tampil read-only di bawah judul form. | Referensi UI v2; FR-002 |
| Shortcut pelayanan | Assesmen, Input Tindakan, Buat Surat, dan Buat Resep ditempatkan dekat header dan tampil sesuai hak akses user. | BR-039; FR-003 |
| Detail permintaan | Jadwal Pemeriksaan, Dokter Pengirim, Urgensi, dan Diagnosa Pengantar dikelompokkan dalam satu card. Urgensi menggunakan radio button dengan default Normal. Diagnosa Pengantar wajib dipilih minimal satu. | BR-007–BR-013; FR-004–FR-007 |
| Diagnosa | Wajib dipilih minimal satu, mendukung multiple select, dan menampilkan pilihan sebagai chip/tag atau representasi setara. | BR-013; FR-007 |
| Pencarian pemeriksaan | Search berada di atas daftar pemeriksaan; Reset mengembalikan filter/tampilan daftar tanpa menghapus data order yang telah diisi. | FR-009 |
| Status pasien | Status Puasa dan Status Hamil tampil sebelum daftar modalitas dengan default Tidak, lalu dapat diubah user. | BR-024–BR-025; FR-008 |
| Accordion modalitas | Setiap modalitas tampil sebagai accordion; urutan mengikuti master. Aturan single-open atau multi-open `[PERLU KONFIRMASI]`. | FR-010–FR-011 |
| Kelompok organ | Pemeriksaan di dalam modalitas dikelompokkan per organ dan dapat menggunakan layout beberapa kolom pada desktop. | Referensi UI v2; FR-010 |
| Pemilihan item | Checkbox memilih pemeriksaan. Item yang dipilih menampilkan panel detail teknis langsung di bawah/di dalam item. | FR-012–FR-013 |
| Field kondisional | Teknik, proyeksi, laterality, dan kontras hanya tampil bila dikonfigurasi untuk item tersebut; atribut wajib diberi indikator jelas. | BR-020–BR-022; FR-013 |
| Catatan per item | Textarea menampilkan penghitung karakter dan menggunakan `maxlength=500`; input ke-501 dan seterusnya tidak diterima. | BR-023; FR-014 |
| Feedback validasi | Error field wajib dan tanggal Jadwal Pemeriksaan yang tidak valid tampil dekat field serta disertai ringkasan atau scroll ke error pertama saat Simpan. | FR-015–FR-016 |
| Footer form | Tombol **Batal** dan **Simpan** selalu terlihat. Tombol Simpan Draft tidak ditampilkan. Print baru dapat digunakan setelah order berhasil disimpan. | BR-026; BR-038; FR-017; FR-027 |
| Status setelah simpan | Setelah penyimpanan berhasil, sistem menampilkan konfirmasi bahwa order dibuat dengan nomor order dan status **Belum Terkonfirmasi**. | BR-026; FR-017 |
| Label status downstream | Dashboard dan modul downstream menggunakan label persis: Belum Terkonfirmasi, Jadwal Terkonfirmasi, Sedang Diproses, Menunggu Expertise, Selesai, dan Dibatalkan. | BR-027; BR-040; FR-019–FR-024 |
| Unsaved changes | Menutup atau membatalkan form setelah ada perubahan sebaiknya meminta konfirmasi. | NFR-009 |

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Entry point, handoff, dan RBAC** — sistem menerima navigasi melalui **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi**, meneruskan konteks pasien/episode ke form Order Radiologi, serta memvalidasi role Dokter/Perawat/Bidan dan hak akses unit. Requirement halaman Riwayat Pemeriksaan Penunjang tidak menjadi bagian FR ini. | US-001–US-002; BR-001–BR-002 |
| **FR-002** | **Konteks pasien dan episode** — sistem membawa serta menampilkan data pasien, registrasi, episode asal, unit, penjamin, tanggal registrasi, dan DPJP utama yang diperlukan form. | US-001–US-003; BR-003; BR-010 |
| **FR-003** | **Shortcut pelayanan** — sistem menampilkan shortcut Assesmen, Input Tindakan, Buat Surat, dan Buat Resep sesuai hak akses; Buat Resep menampilkan E-Resep, CPO, dan Retur Obat. | US-018; BR-039 |
| **FR-004** | **Jadwal Pemeriksaan** — sistem mengisi default tanggal order, menyimpan tanggal saja, mengizinkan edit, dan menerapkan validasi tanggal registrasi/backdate. | US-003; US-008; BR-007–BR-008 |
| **FR-005** | **Dokter Pengirim** — sistem menerapkan default berdasarkan role dan menyediakan dropdown editable dari Master Data Staff; nilai wajib sebelum simpan. | US-002–US-003; BR-009–BR-010 |
| **FR-006** | **Urgensi** — sistem menyediakan satu field radio button dengan opsi Normal, Cito Tanpa Expertise, dan Cito Dengan Expertise. Field wajib diisi dan default yang dipilih adalah **Normal**. | US-003; BR-011–BR-012 |
| **FR-007** | **Diagnosa Pengantar** — sistem menyediakan multiple select Master Diagnosa dan mewajibkan minimal satu nilai. | US-003; BR-013 |
| **FR-008** | **Status Puasa dan Status Hamil** — sistem memberi default Tidak, mengizinkan user mengubah nilai, dan menyimpan keduanya pada header order. | US-007; BR-024–BR-025 |
| **FR-009** | **Pencarian dan Reset** — sistem mencari pemeriksaan berdasarkan nama dan menyediakan Reset yang tidak menghapus data order di luar filter daftar. | US-004; Display Rules |
| **FR-010** | **Hierarki pemeriksaan** — sistem menampilkan struktur Modalitas → Kelompok Organ → Jenis Pemeriksaan → Detail Pemeriksaan sesuai sorting master. | US-004; BR-015–BR-016 |
| **FR-011** | **Sinkronisasi Master Data Radiologi** — sistem hanya menampilkan pemeriksaan Active dan mengambil konfigurasi atribut, opsi, serta mandatory flag dari master. | US-004; US-016; BR-015–BR-018 |
| **FR-012** | **Pemilihan multi-item** — sistem mendukung satu atau lebih pemeriksaan dalam satu order, termasuk dari modalitas berbeda, serta mencegah kehilangan pilihan saat user berpindah kelompok. | US-005; BR-004–BR-005; BR-014 |
| **FR-013** | **Detail teknis per item** — sistem menampilkan dan menyimpan teknik, posisi/proyeksi, laterality, penggunaan/jenis kontras, serta atribut lain sesuai konfigurasi item. | US-006; BR-019–BR-022 |
| **FR-014** | **Catatan item** — sistem menyediakan catatan independen per item dengan maksimum 500 karakter dan character counter. | US-006; BR-023 |
| **FR-015** | **Validasi penyimpanan** — sistem memblokir simpan ketika Dokter Pengirim, Urgensi, minimal satu Diagnosa Pengantar, minimal satu pemeriksaan, Jadwal Pemeriksaan, batas catatan, atau atribut mandatory belum lengkap/valid; error ditampilkan pada field terkait. | US-003; US-005–US-006; BR-007–BR-025 |
| **FR-016** | **Validasi batas tanggal Jadwal Pemeriksaan** — sistem memblokir penyimpanan bila Jadwal Pemeriksaan lebih awal dari tanggal registrasi dan kebijakan rumah sakit tidak mengizinkan backdate. | US-008; BR-008 |
| **FR-017** | **Simpan order final** — sistem menyimpan header dan item secara atomik, membuat nomor `YYMMDDNNNN`, mencatat ordered_at/created_by, dan menetapkan status awal Belum Terkonfirmasi. Tidak ada aksi Simpan Draft. | US-009; BR-006; BR-026–BR-027 |
| **FR-018** | **Snapshot dan versioning** — sistem menyimpan snapshot Master Data Radiologi, version_no, dan optimistic locking agar perubahan master atau concurrent update tidak mengubah histori secara tidak terkendali. | US-016; BR-017–BR-018; BR-035–BR-036; NFR-005 |
| **FR-019** | **Dispatch dan sinkronisasi status awal** — setelah simpan berhasil, sistem mengirim order ke Dashboard Radiologi dengan status Belum Terkonfirmasi dan memastikan data order serta dashboard menggunakan status sumber yang sama. | US-009; BR-026; BR-040 |
| **FR-020** | **Konfirmasi Radiografer** — pada order Belum Terkonfirmasi, sistem membandingkan Jadwal Pemeriksaan dengan tanggal operasional hari ini: sama dengan hari ini menghasilkan Sedang Diproses; selain hari ini menghasilkan Jadwal Terkonfirmasi. | US-010; BR-028–BR-029; BR-041 |
| **FR-021** | **Konfirmasi ulang hari pelaksanaan** — sistem hanya mengubah Jadwal Terkonfirmasi menjadi Sedang Diproses setelah Radiografer melakukan konfirmasi ulang pada hari pelaksanaan. | US-011; BR-030; BR-041 |
| **FR-022** | **Input foto/image** — setelah input foto/image berhasil pada order Sedang Diproses, sistem mengubah status menjadi Menunggu Expertise dan mencatat referensi, aktor, serta waktu. | US-012; BR-031 |
| **FR-023** | **Penyelesaian expertise** — setelah Dokter Radiologi menyelesaikan pemeriksaan/expertise pada order Menunggu Expertise, sistem mengubah status menjadi Selesai dan mencatat aktor serta waktu. | US-013; BR-032 |
| **FR-024** | **Pembatalan** — sistem menyediakan perubahan ke Dibatalkan untuk user dan status sumber yang diizinkan, memvalidasi versi, serta menyimpan status asal, aktor, waktu, alasan, dan audit event. | US-014; BR-033 |
| **FR-025** | **Episode pelaksanaan** — sistem mempertahankan source registration/episode dan mendukung execution registration/episode yang berbeda sesuai tanggal pelaksanaan. | US-015; BR-034 |
| **FR-026** | **Audit trail dan kontrol concurrency** — sistem mencatat create, status transition, image input, expertise completion, cancel, dan print; setiap update workflow memvalidasi `version_no` untuk mencegah overwrite terhadap versi yang lebih baru. | US-016; BR-035–BR-037 |
| **FR-027** | **Print order** — sistem menyediakan entry point Print untuk order tersimpan dan meneruskan data ke fitur cetak terpisah. | US-017; BR-038 |

## 12. User Stories

> Format acceptance criteria menggunakan pola Given–When–Then.

| ID | User Story | Acceptance Criteria (Given–When–Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **Dokter/Perawat/Bidan**, saya ingin membuka form Order Radiologi melalui alur Pemeriksaan Penunjang dalam konteks pasien dan episode aktif, sehingga saya tidak perlu memasukkan ulang identitas pasien. | Given user menavigasi melalui Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → memilih Radiologi dan upstream module mengirim konteks yang valid, When form dibuka, Then identitas pasien/episode tampil read-only dan role/unit divalidasi. | FR-001–FR-002; BR-001–BR-003 |
| **US-002** | Sebagai **Perawat/Bidan**, saya ingin Dokter Pengirim otomatis terisi DPJP utama namun tetap dapat diubah, sehingga pengisian lebih cepat dan tetap fleksibel. | Given episode memiliki DPJP utama, When form dibuka oleh Perawat/Bidan, Then DPJP utama terpilih dan dropdown Master Staff tetap editable. | FR-005; BR-010 |
| **US-003** | Sebagai **user pelayanan**, saya ingin mengisi jadwal, Dokter Pengirim, Urgensi, dan Diagnosa Pengantar, sehingga unit Radiologi menerima detail permintaan yang lengkap. | Given form aktif, Then Urgensi default Normal. When user menyimpan, Then Dokter Pengirim, Urgensi, dan minimal satu Diagnosa Pengantar wajib terisi. | FR-004–FR-007; BR-007–BR-013 |
| **US-004** | Sebagai **user pelayanan**, saya ingin mencari dan menelusuri pemeriksaan berdasarkan modalitas serta kelompok organ, sehingga saya cepat menemukan pemeriksaan yang tepat. | Given master telah dimuat, When user mencari atau membuka accordion, Then hanya item Active tampil sesuai hierarki dan sorting master. | FR-009–FR-011; BR-015–BR-016 |
| **US-005** | Sebagai **user pelayanan**, saya ingin memilih beberapa pemeriksaan dalam satu order, sehingga permintaan terkait dapat dikirim dalam satu transaksi. | Given daftar pemeriksaan aktif, When user memilih beberapa item lintas modalitas, Then semua pilihan dipertahankan dan disimpan dalam satu order. | FR-012; BR-004–BR-005; BR-014 |
| **US-006** | Sebagai **user pelayanan**, saya ingin melengkapi detail teknis setiap pemeriksaan secara independen, sehingga Radiografer menerima instruksi yang akurat. | Given item dipilih, When konfigurasi mewajibkan teknik/proyeksi/laterality/kontras, Then field tampil dan harus lengkap; catatan tidak dapat melebihi 500 karakter. | FR-013–FR-015; BR-019–BR-023 |
| **US-007** | Sebagai **tenaga medis**, saya ingin mengisi Status Puasa dan Status Hamil, sehingga informasi klinis pendukung tersimpan bersama order. | Given form baru dibuka, Then kedua status default Tidak. When user mengubah salah satu nilai dan menyimpan order, Then nilai terbaru tersimpan pada header order. | FR-008; BR-024–BR-025 |
| **US-008** | Sebagai **user pelayanan**, saya ingin Jadwal Pemeriksaan divalidasi terhadap tanggal registrasi, sehingga order tidak tersimpan dengan tanggal yang melanggar kebijakan rumah sakit. | Given Jadwal Pemeriksaan lebih awal dari tanggal registrasi dan backdate tidak diizinkan, When user memilih Simpan, Then sistem memblokir penyimpanan dan menampilkan error pada field Jadwal Pemeriksaan. Given tanggal memenuhi ketentuan atau backdate diizinkan, When user memilih Simpan, Then validasi tanggal dinyatakan lolos. | FR-004; FR-016; BR-008 |
| **US-009** | Sebagai **user pelayanan**, saya ingin menyimpan order final dan langsung mengirimkannya ke Radiologi, sehingga order masuk antrean tanpa langkah tambahan. | Given seluruh data valid, When user memilih Simpan, Then nomor order dibuat, status menjadi Belum Terkonfirmasi, dan order tampil di Dashboard Radiologi. | FR-017; FR-019; BR-006; BR-026–BR-027 |
| **US-010** | Sebagai **Radiografer**, saya ingin konfirmasi menghasilkan status berbeda berdasarkan apakah jadwal hari ini atau mendatang, sehingga dashboard mencerminkan kesiapan pemeriksaan. | Given order Belum Terkonfirmasi, When saya konfirmasi, Then jadwal hari ini menjadi Sedang Diproses dan jadwal bukan hari ini menjadi Jadwal Terkonfirmasi. | FR-020; BR-028–BR-029 |
| **US-011** | Sebagai **Radiografer**, saya ingin mengonfirmasi ulang order terjadwal ketika hari pelaksanaan tiba, sehingga order masuk proses pemeriksaan pada waktu yang tepat. | Given order Jadwal Terkonfirmasi dan tanggal jadwal telah tiba, When saya konfirmasi ulang, Then status menjadi Sedang Diproses. | FR-021; BR-030 |
| **US-012** | Sebagai **Radiografer**, saya ingin status berubah setelah foto/image berhasil diinput, sehingga Dokter Radiologi mengetahui pemeriksaan menunggu expertise. | Given order Sedang Diproses, When input foto/image berhasil, Then status menjadi Menunggu Expertise dan event dicatat. | FR-022; BR-031 |
| **US-013** | Sebagai **Dokter Radiologi**, saya ingin menyelesaikan pemeriksaan/expertise, sehingga status order menjadi Selesai. | Given order Menunggu Expertise, When saya menyelesaikan expertise, Then status menjadi Selesai dan waktu/aktor dicatat. | FR-023; BR-032 |
| **US-014** | Sebagai **user berwenang**, saya ingin membatalkan order yang memenuhi aturan pembatalan, sehingga order tidak dilanjutkan secara keliru. | Given order masih dapat dibatalkan, When pembatalan berhasil, Then status menjadi Dibatalkan dan status asal/aktor/waktu/alasan tersimpan. | FR-024; BR-033 |
| **US-015** | Sebagai **tenaga medis**, saya ingin pelaksanaan pada episode lain tetap terhubung ke order asal, sehingga histori klinis tidak terputus. | Given episode pelaksanaan berbeda, When pemeriksaan diproses, Then execution episode tersimpan tanpa menghapus source episode. | FR-025; BR-034 |
| **US-016** | Sebagai **user dan auditor**, saya ingin snapshot master serta update workflow terlacak, sehingga histori tetap konsisten dan konflik data dapat dicegah. | Given order tersimpan, When master berubah atau workflow memperbarui order, Then snapshot transaksi tetap, `version_no` diperiksa, dan audit event dibuat. | FR-018; FR-026; BR-017–BR-018; BR-035–BR-037 |
| **US-017** | Sebagai **user pelayanan**, saya ingin mencetak order yang telah tersimpan, sehingga formulir permintaan dapat digunakan sesuai prosedur rumah sakit. | Given order tersimpan, When Print dipilih, Then sistem meneruskan data ke fitur cetak terpisah. | FR-027; BR-038 |
| **US-018** | Sebagai **user pelayanan**, saya ingin mengakses Assesmen, Tindakan, Surat, dan Resep dari form Order Radiologi, sehingga aktivitas terkait dapat dibuka tanpa kehilangan konteks pasien. | Given user memiliki hak akses, When shortcut dipilih, Then modul target terbuka dengan konteks pasien/episode yang sama. | FR-003; BR-039 |

## 13. Data Requirements (Spesifikasi Field)

> Field demografi, registrasi, episode, unit, dan penjamin **reuse definisi kanonik dari modul Registrasi/EMR Neurovi v2** — nama, tipe, format, dan validasi harus sama.

### A. Layar INPUT — Konteks Pasien pada Form Order (FR-002)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `medical_record_number` | No. RM | read-only text | Ya | Format RM kanonik | Registrasi/EMR | Ditampilkan di header form. |
| `patient_name` | Nama | read-only text | Ya | Nama kanonik | Registrasi/EMR | Ditampilkan di header form. |
| `date_of_birth` | Tanggal Lahir | read-only date | Ya | `DD/MM/YYYY` | Registrasi/EMR | Usia dihitung sistem. |
| `age_display` | Umur | read-only derived | Ya | Tahun/bulan/hari sesuai standar | Sistem | Referensi UI menampilkan tahun. |
| `sex_code` | Jenis Kelamin | hidden/read-only | Ya | Kode kanonik | Demografi | Dipakai validasi kehamilan. |
| `service_unit_id` | Unit Pelayanan | read-only reference | Ya | Unit aktif | Episode | RJ/RI/IGD/IBS/VK. |
| `payer_id` | Penjamin | read-only reference | Ya | Penjamin aktif | Episode | Ditampilkan di header. |


### B. Layar INPUT — Detail Permintaan (FR-004–FR-008)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `no_order_rad` | Nomor Order Radiologi | numerik | Ya | Generate nomor order 10 digit dan tidak duplikat | Generate siste, | Sesuai format 10 digit `YYMMDDNNNN`, contoh `2607180001`. |
| `scheduled_date` | Jadwal Pemeriksaan | date | Ya | Tanggal saja; `>= registration_date` kecuali kebijakan backdate | Tanggal order/sistem | Dipakai untuk menentukan status saat konfirmasi Radiografer. |
| `referring_doctor_id` | Dokter Pengirim | searchable dropdown | Ya | Staff aktif dan role/credential sesuai kebijakan | Dokter login atau DPJP utama | Editable; sumber Master Data Staff. |
| `urgency_code` | Urgensi | radio button | Ya | `NORMAL`, `CITO_WITHOUT_EXPERTISE`, `CITO_WITH_EXPERTISE` | `NORMAL` / Normal | Hanya satu nilai per order. |
| `diagnosis_ids` | Diagnosa Pengantar | multi-select lookup | Ya, minimal 1 | Minimal satu diagnosa aktif; nilai kosong memblokir Simpan | Master Diagnosa | Disimpan sebagai reference dan snapshot label/code. |
| `fasting_status` | Status Puasa | radio/boolean | Ya | Ya/Tidak | Tidak | Dapat diubah user. |
| `pregnancy_status` | Status Hamil | radio/boolean | Ya | Ya/Tidak | Tidak | Dapat diubah user. |

### C. Layar INPUT — Item Pemeriksaan (FR-009–FR-015)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `radiology_exam_master_id` | Pemeriksaan | checkbox/reference | Ya, min. 1/order | Hanya item Active | Master Data Radiologi | Tiap pilihan membentuk satu order item. |
| `modality_code` | Modalitas | read-only/snapshot | Ya | Master Radiologi | Master item | Contoh CT, MRI, USG. |
| `organ_group_id` | Kelompok Organ | read-only/snapshot | Ya | Master Radiologi | Master item | Menentukan pengelompokan tampilan. |
| `exam_name_snapshot` | Nama Pemeriksaan | read-only/snapshot | Ya | Teks saat transaksi | Master item saat simpan | Histori tidak berubah saat master berubah. |
| `scan_technique_id` | Teknik Pemindaian | dropdown | Kondisional | Opsi sesuai master | - | Ditampilkan bila dikonfigurasi. |
| `projection_id` | Posisi/Proyeksi | dropdown | Kondisional | Opsi sesuai master | - | Wajib bila flag master aktif. |
| `laterality_code` | Sisi Tubuh | radio/dropdown | Kondisional | Kiri/Kanan/Bilateral/dll. sesuai master | Tidak ada | Wajib bila flag master aktif. |
| `contrast_usage` | Penggunaan Kontras | dropdown/boolean | Kondisional | Hanya bila `supports_contrast = true` | Konfigurasi master | Contoh Non Kontras/Kontras. |
| `contrast_type_id` | Jenis Kontras | dropdown | Kondisional | Opsi master kontras | Tidak ada | Wajib untuk pemeriksaan yang membutuhkan kontras. |
| `item_note` | Catatan | textarea | Tidak atau kondisional | Maksimum **500 karakter**; counter `n/500`; karakter ke-501 ditolak | Manual | Disimpan independen per item. |
| `requires_fasting_snapshot` | Membutuhkan Puasa | hidden boolean | Ya | Boolean | Master saat simpan | Dipakai validasi dan histori. |
| `mandatory_attribute_snapshot` | Konfigurasi Atribut Wajib | hidden JSON/reference | Ya | Snapshot konfigurasi | Master saat simpan | Menjaga konsistensi histori. |

### D. Data DIBUAT/DIPERBARUI oleh Sistem dan Workflow Status (FR-017–FR-026)

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| `radiology_order_id` | ID Order | UUID/ID | Dibuat otomatis | Primary key transaksi. |
| `order_number` | No. Order Radiologi | string(10) | `YYMMDDNNNN` saat Simpan berhasil | Wajib dan unik. |
| `order_status` | Status Order | enum | `UNCONFIRMED`, `SCHEDULE_CONFIRMED`, `IN_PROGRESS`, `WAITING_EXPERTISE`, `COMPLETED`, `CANCELLED` | Label UI: Belum Terkonfirmasi, Jadwal Terkonfirmasi, Sedang Diproses, Menunggu Expertise, Selesai, Dibatalkan. Default `UNCONFIRMED`. |
| `ordered_at` | Waktu Permintaan | datetime | Server time saat Simpan berhasil | Waktu order final dibuat. |
| `created_at` | Waktu Record Dibuat | datetime | Server time | Sama dengan atau sebelum ordered_at sesuai implementasi transaksi. |
| `created_by` | Dibuat Oleh | user reference | User login | Dokter/Perawat/Bidan sesuai hak akses. |
| `radiology_dispatched_at` | Waktu Dikirim ke Dashboard | datetime nullable | Server time/event dispatch | Terisi ketika order tersedia di Dashboard Radiologi. |
| `radiology_dispatch_status` | Status Pengiriman | enum | Sistem internal | Retry/idempotency `[PERLU KONFIRMASI]`; bukan status klinis order. |
| `first_confirmation_at` | Waktu Konfirmasi Pertama | datetime nullable | Server time saat Radiografer konfirmasi dari Belum Terkonfirmasi | Berlaku untuk hasil Sedang Diproses atau Jadwal Terkonfirmasi. |
| `first_confirmation_by` | Konfirmasi Pertama Oleh | user reference nullable | Radiografer login | — |
| `schedule_confirmed_at` | Waktu Jadwal Terkonfirmasi | datetime nullable | Saat status menjadi Jadwal Terkonfirmasi | Untuk jadwal bukan hari ini. |
| `schedule_confirmed_by` | Jadwal Dikonfirmasi Oleh | user reference nullable | Radiografer login | — |
| `processing_started_at` | Waktu Mulai Diproses | datetime nullable | Saat status menjadi Sedang Diproses | Dari konfirmasi jadwal hari ini atau konfirmasi ulang. |
| `processing_started_by` | Diproses Oleh | user reference nullable | Radiografer login | Aktor trigger Sedang Diproses. |
| `reconfirmed_at` | Waktu Konfirmasi Ulang | datetime nullable | Saat Jadwal Terkonfirmasi menjadi Sedang Diproses | Diisi untuk order yang dijadwalkan mendatang. |
| `reconfirmed_by` | Konfirmasi Ulang Oleh | user reference nullable | Radiografer login | — |
| `image_input_at` | Waktu Input Foto/Image | datetime nullable | Saat input image berhasil | Trigger Menunggu Expertise. |
| `image_input_by` | Foto/Image Diinput Oleh | user reference nullable | Radiografer login | — |
| `image_reference` | Referensi Foto/Image | reference/array nullable | Modul akuisisi/PACS/internal `[PERLU KONFIRMASI]` | Detail payload dan sumber integrasi `[PERLU KONFIRMASI]`. |
| `waiting_expertise_at` | Waktu Menunggu Expertise | datetime nullable | Sama dengan transisi ke Menunggu Expertise | Menjadi dasar worklist Dokter Radiologi. |
| `expertise_completed_at` | Waktu Expertise Selesai | datetime nullable | Server time saat Dokter menyelesaikan pemeriksaan/expertise | Trigger Selesai. |
| `expertise_completed_by` | Expertise Diselesaikan Oleh | user reference nullable | Dokter Radiologi login | Aktor perubahan ke Selesai. |
| `cancelled_at` | Waktu Dibatalkan | datetime nullable | Server time saat pembatalan | — |
| `cancelled_by` | Dibatalkan Oleh | user reference nullable | User berwenang | Matriks role `[PERLU KONFIRMASI]`. |
| `cancellation_from_status` | Status Asal Pembatalan | enum nullable | Nilai status sebelum Dibatalkan | Wajib untuk audit. |
| `cancellation_reason` | Alasan Pembatalan | text nullable | Input user berwenang | Kewajiban dan batas karakter `[PERLU KONFIRMASI]`. |
| `status_history` | Riwayat Status | event/relational log | from-status, to-status, trigger, actor, timestamp, metadata | Menyimpan semua transisi dan kondisi perbandingan tanggal. |
| `source_registration_id` | Registrasi Asal | reference | Episode saat order dibuat | Tidak berubah. |
| `source_episode_id` | Episode Asal | reference | Episode saat order dibuat | Tidak berubah. |
| `execution_registration_id` | Registrasi Pelaksanaan | reference nullable | Diisi proses Radiologi | Dapat berbeda dari registrasi asal. |
| `execution_episode_id` | Episode Pelaksanaan | reference nullable | Diisi proses Radiologi | Dapat berbeda dari episode asal. |
| `updated_at` | Waktu Diubah | datetime | Server time | Audit/versioning. |
| `updated_by` | Diubah Oleh | user reference | User login | Audit/versioning. |
| `version_no` | Versi Order | integer | Mulai dari 1 | Optimistic locking. |
| `master_snapshot` | Snapshot Master | JSON/relational snapshot | Nilai master saat simpan | Tidak terpengaruh perubahan master. |
| `audit_event_id` | Referensi Audit | reference | Audit Trail | Untuk create/status/cancel/print. |

## 14. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Penyimpanan order radiologi selesai dalam `< 1 detik` pada beban operasional yang disepakati. Definisi percentile, network boundary, dan data volume uji. | Metrik; bisnis proses |
| **NFR-002** | Responsivitas | Pencarian tetap responsif ketika master pemeriksaan besar; implementasi dapat menggunakan indexing dan caching master. | Bisnis proses; FR-009 |
| **NFR-003** | Responsivitas UI | Membuka/menutup kelompok modalitas dan menampilkan detail item tidak menimbulkan lag yang mengganggu alur input. | Bisnis proses; FR-010–FR-013 |
| **NFR-004** | Skalabilitas | Sistem stabil untuk sekitar 150–200 pasien radiologi per hari serta concurrent order dan status update dari banyak unit/user. | Bisnis proses |
| **NFR-005** | Konsistensi/Concurrency | Update menggunakan optimistic locking/versioning; sistem tidak boleh menimpa perubahan versi yang lebih baru tanpa deteksi konflik. | BR-036; FR-018; FR-026 |
| **NFR-006** | Keamanan/RBAC | Akses create, confirm, reconfirm, input image, complete expertise, cancel, dan print dibatasi berdasarkan role, unit, pasien aktif, dan status order. | BR-002; BR-033; BR-039; FR-001; FR-020–FR-024; FR-027 |
| **NFR-007** | Auditabilitas | Semua create/confirm/reconfirm/image-input/expertise-complete/cancel/print menyimpan aktor, waktu, objek, versi, status asal/tujuan, trigger, dan metadata penting. Logging dapat asynchronous selama tidak kehilangan event. | BR-037; FR-026 |
| **NFR-008** | Integritas Data | Nomor order unik; header dan item disimpan atomik; snapshot master menjaga histori; multiple order tidak saling menimpa. | BR-004–BR-006; BR-017–BR-018; FR-017–FR-018 |
| **NFR-009** | Reliabilitas | Kegagalan simpan, pengiriman, atau pembaruan status tidak boleh menghasilkan order parsial, transaksi ganda akibat retry, atau perbedaan status permanen antara transaksi dan dashboard. | FR-017; FR-019–FR-024 |
| **NFR-010** | Konfigurabilitas | Perubahan daftar, atribut, status Active, dan sorting di Master Data Radiologi otomatis menjadi referensi transaksi baru tanpa deployment aplikasi pelayanan. | BR-015–BR-018; FR-011 |
| **NFR-011** | Usability/Ergonomi UI | Form harus ringkas, terstruktur, mendukung pencarian dan multi-select, menampilkan detail teknis inline, serta menempatkan informasi klinis pendukung dalam satu area. | Pain point UX; Display Rules |
| **NFR-012** | Aksesibilitas | `[ASUMSI: standar Neurovi v2]` Semua kontrol mempunyai label, state fokus keyboard, target klik memadai, serta error yang tidak hanya bergantung pada warna. |
| **NFR-013** | Kompatibilitas | Target browser, resolusi minimum, dan dukungan responsive belum ditetapkan. Desain mengutamakan desktop dan melakukan reflow pada layar lebih kecil. |
| **NFR-014** | Observability | Sistem menyediakan log dan metrik untuk latency simpan, pencarian, konflik versi, kegagalan dispatch, transisi status gagal, order terjadwal yang belum dikonfirmasi ulang, serta backlog Menunggu Expertise. | Performance expectation; Risk & Mitigation |
| **NFR-015** | Konsistensi Status | Nilai status pada order, Dashboard Radiologi, worklist Radiografer, dan worklist Dokter Radiologi harus bersumber dari state yang sama. | BR-040–BR-041; FR-019–FR-024 |

## 15. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Auth/RBAC Neurovi** | Identitas user, role, unit, dan hak aksi. | Internal — Hard | FR-001; NFR-006 |
| **Riwayat Pemeriksaan Penunjang / upstream entry point** | Menjadi bagian alur navigasi **Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih Radiologi**, lalu meneruskan konteks pasien dan membuka form Order Radiologi. Requirement halaman berada pada PRD terpisah. | Internal — Hard untuk entry point | FR-001–FR-002 |
| **Registrasi & Episode** | Konteks pasien, unit, penjamin, DPJP utama, tanggal registrasi, episode asal, dan episode pelaksanaan. | Internal — Hard | FR-002; FR-004–FR-005; FR-025 |
| **Master Staf/Dokter** | Lookup dan default Dokter Pengirim serta identitas aktor Radiologi. | Internal — Hard | FR-005; FR-020–FR-024 |
| **Master Diagnosa/EMR** | Lookup multiple Diagnosa Pengantar dan konteks klinis. | Internal — Hard | FR-007 |
| **Master Data Radiologi** | Struktur, pilihan, konfigurasi atribut, status Active, sorting, dan snapshot. | Internal — Hard | FR-010–FR-013; FR-018 |
| **Dashboard Radiologi** | Menerima order berstatus Belum Terkonfirmasi dan menampilkan status workflow yang sama dengan transaksi sumber. | Internal — Hard | FR-019–FR-021; NFR-015 |
| **Penjadwalan/Konfirmasi Radiologi** | Menjalankan konfirmasi hari ini, konfirmasi jadwal mendatang, dan konfirmasi ulang pada hari pelaksanaan. | Internal — Downstream | FR-020–FR-021 |
| **Pelayanan Radiologi / Akuisisi Image** | Menginput foto/image dan memicu status Menunggu Expertise. | Internal — Downstream | FR-022 |
| **Expertise/Hasil Radiologi** | Dokter menyelesaikan pemeriksaan/expertise dan memicu status Selesai; isi hasil berada di luar scope. | Internal — Downstream | FR-023 |
| **Audit Trail** | Menyimpan event create/status/image/expertise/cancel/print. | Internal — Hard | FR-026 |
| **Cetak Permintaan Radiologi** | Membuat output cetak order tersimpan. | Internal — PRD terpisah | FR-027 |
| **Billing/Kasir** | Membentuk komponen tagihan dari pemeriksaan yang dilakukan. | Internal — Downstream | Related Feature |
| **SATUSEHAT** | Mengirim DiagnosticReport/ImagingStudy bila digunakan. | Opsional | Related Feature |
| **Assesmen/Tindakan/Surat/Resep** | Target navigasi shortcut wajib dari form Order Radiologi. | Internal — Required | FR-003 |

### Dependency dan Dampak

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD/fitur Riwayat Pemeriksaan Penunjang | Hard untuk entry point | Alur Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih Radiologi belum dapat membuka form; requirement halaman tetap berada pada PRD terpisah. |
| Master Data Radiologi | Hard | Daftar pemeriksaan, detail teknis, validasi, dan sorting tidak dapat dibentuk. |
| Registrasi/Episode & Demografi | Hard | Form tidak memiliki konteks pasien/episode dan tidak dapat disimpan secara aman. |
| Auth/RBAC & Master Staf | Hard | Hak akses dan Dokter Pengirim tidak dapat divalidasi. |
| Master Diagnosa | Hard | Diagnosa Pengantar wajib tidak dapat dipilih. |
| Dashboard Radiologi | Hard untuk go-live end-to-end | Order Belum Terkonfirmasi tidak masuk antrean dan status tidak dapat diproses. |
| Konfirmasi/Penjadwalan Radiologi | Hard untuk workflow status | Transisi ke Jadwal Terkonfirmasi atau Sedang Diproses tidak dapat dilakukan. |
| Akuisisi Image/PACS/Internal Imaging | Hard untuk transisi Menunggu Expertise | Status tidak dapat berpindah dari Sedang Diproses ke Menunggu Expertise. |
| Expertise Radiologi | Hard untuk status Selesai | Status tidak dapat berpindah dari Menunggu Expertise ke Selesai. |
| Audit Trail | Hard | Kebutuhan audit pembuatan, transisi status, pembatalan, dan cetak tidak terpenuhi. |
| PRD/fitur Cetak Permintaan | Soft untuk create; hard untuk kapabilitas Print | Order tetap dapat dibuat, tetapi tombol Print tidak dapat menyelesaikan alur. |
| Modul shortcut pelayanan | Hard untuk acceptance UI | Shortcut wajib tidak dapat dinavigasikan sesuai hak akses. |
| Billing dan SATUSEHAT | Downstream | Tidak menghalangi create order, tetapi alur end-to-end terkait belum lengkap. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| **R1** | Pemeriksaan dilakukan pada episode berbeda dari episode order. | Kaitkan hasil dan data pelaksanaan ke episode pelaksanaan sambil mempertahankan referensi episode asal. |
| **R2** | Jadwal Pemeriksaan lebih awal dari tanggal registrasi. | Blokir penyimpanan apabila backdate tidak diizinkan; apabila rumah sakit mengizinkan backdate, validasi mengikuti konfigurasi kebijakan tersebut. |
| **R3** | Dua user mengubah order yang sama secara bersamaan. | Terapkan optimistic locking/versioning dan tampilkan konflik sebelum overwrite. |
| **R4** | Master pemeriksaan berubah setelah order dibuat. | Simpan snapshot informasi pemeriksaan dan konfigurasi pada transaksi. |
| **R5** | Volume order tinggi pada jam sibuk. | Optimalkan pencarian dan indexing database, cache master radiologi, serta asynchronous logging agar waktu simpan tetap memenuhi target. |

## 17. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 | 18 Juli 2026 | Team Product — Tamtech International | Dokumen awal berdasarkan template PRD Neurovi v2, bisnis proses Order Permintaan Radiologi, referensi visual form v2, dan catatan entry point/shortcut. |
| 1.1 | 18 Juli 2026 | Team Product — Tamtech International | Menetapkan nomenklatur Radiologi; menyatukan klasifikasi prioritas ke satu field; menetapkan default Dokter Pengirim, tanggal jadwal, aturan backdate, default Puasa/Hamil, shortcut Radiologi, status awal, dan trigger status hingga Selesai; menghapus roadmap lanjutan yang tidak berlaku. |
| 1.2 | 18 Juli 2026 | Team Product — Tamtech International | Menambahkan requirement halaman Riwayat Pemeriksaan Penunjang; memperjelas perbedaan v1/v2; menetapkan catatan item maksimum 500 karakter; serta menghapus aturan aksi per status. |
| 1.3 | 19 Juli 2026 | Team Product — Tamtech International | Mengganti lifecycle menjadi Draft, Order, Terkonfirmasi, Dijadwalkan Ulang, Pemeriksaan Selesai, dan Dibatalkan berdasarkan ketentuan saat itu. |
| 1.4 | 20 Juli 2026 | Team Product — Tamtech International | Mengubah status aktif menjadi Belum Terkonfirmasi, Jadwal Terkonfirmasi, Sedang Diproses, Menunggu Expertise, Selesai, dan Dibatalkan; menetapkan trigger berbasis tanggal jadwal, konfirmasi ulang, input foto/image, serta penyelesaian expertise; menghapus Draft dan status lifecycle versi 1.3. |
| 1.5 | 20 Juli 2026 | Team Product — Tamtech International | Menghapus seluruh ketentuan halaman Riwayat Pemeriksaan Penunjang dari PRD Order Radiologi dan menetapkannya pada tiket/PRD terpisah, dengan tetap mempertahankan entry point Dashboard Pelayanan → Pemeriksaan Penunjang → Riwayat Pemeriksaan Penunjang → Tambah Baru → pilih jenis penunjang Radiologi. |
| 1.6 | 20 Juli 2026 | Team Product — Tamtech International | Mengganti nama field prioritas sebelumnya menjadi Urgensi dengan default Normal; menegaskan Diagnosa Pengantar wajib minimal satu; dan menghapus tiga ketentuan validasi/edge case yang dinyatakan tidak berlaku. |
| 1.7 | 20 Juli 2026 | Team Product — Tamtech International | Menghapus validasi dan konfirmasi duplikasi pemeriksaan, menghapus peringatan karena Jadwal Pemeriksaan telah terlewat, serta mempertahankan validasi bahwa jadwal tidak boleh lebih awal dari tanggal registrasi kecuali kebijakan backdate rumah sakit mengizinkan. |
