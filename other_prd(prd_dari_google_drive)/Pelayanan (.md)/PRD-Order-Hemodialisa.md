# PRD — Order Hemodialisa

**Related Document:** PRD/Modul Dashboard Pelayanan Hemodialisa — existing (hard dependency); PRD Rawat Inap; PRD IGD; Visualisasi UI `PRD-Order-Hemodialisa-UI-v2.2-SIMRS.html` — approved; Referensi V1 Order Hemodialisa `[PERLU KONFIRMASI]`  
**Dokumen ID:** `[PERLU KONFIRMASI]` · **Versi:** 2.2 (Draft — Sinkronisasi UI Approved)  
**Tanggal Disusun/Revisi:** 15 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]`  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Order Hemodialisa adalah fitur untuk mengirim pasien dari episode pelayanan Rawat Inap atau IGD ke Dashboard Pelayanan Hemodialisa. Pembuatan order tidak menggunakan form. Pengguna menjalankan aksi **Rujuk ke Hemodialisa** dari menu **three dots** pada Dashboard Pelayanan Rawat Inap atau Dashboard Pelayanan IGD, kemudian sistem langsung membuat order dan menampilkan pasien pada Dashboard Pelayanan Hemodialisa dengan status awal **Menunggu Konfirmasi**.

Pada Neurovi v1, entry point dari Dashboard Pelayanan Rawat Inap sudah tersedia, sedangkan entry point dari Dashboard Pelayanan IGD belum tersedia. Pada Neurovi v2, kedua entry point menggunakan pola interaksi yang sama. Dashboard Pelayanan Hemodialisa menyediakan satu fitur baru bernama **Order & Riwayat Hemodialisa** pada toolbar aksi pasien. Ketika dibuka, fitur menampilkan modal dengan dua tab, yaitu **Order** dan **Riwayat**. Tab Order menjadi tab default untuk menampilkan status serta detail order dan aksi **Konfirmasi Order**, **Batalkan Order** sesuai status. Tab Riwayat menampilkan seluruh order Hemodialisa dalam episode pelayanan yang sama secara kronologis.

Selama order belum dikonfirmasi, pengguna tidak dapat mengisi asesmen, monitoring, tindakan, laboratorium, atau fitur pelayanan Hemodialisa lainnya. Apabila pengguna memilih salah satu fitur tersebut, sistem menampilkan pop-up **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”**. Pop-up juga mengarahkan pengguna untuk melakukan konfirmasi melalui fitur **Order & Riwayat Hemodialisa**. Setelah order dikonfirmasi, fitur pelayanan Hemodialisa dapat digunakan sesuai hak akses pengguna.

Fitur tetap mempertahankan aturan satu order Hemodialisa aktif dalam satu waktu pada episode pelayanan yang sama, mendukung riwayat lebih dari satu pelayanan Hemodialisa dalam satu episode setelah order sebelumnya selesai atau dibatalkan, dan mencatat seluruh aktivitas pada Audit Trail.

> Referensi: PRD Dashboard Pelayanan Hemodialisa; PRD Rawat Inap; PRD IGD; Referensi V1 Order Hemodialisa `[PERLU KONFIRMASI]`.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Dashboard Pelayanan Rawat Inap telah memiliki entry point **three dots → Rujuk ke Hemodialisa**.
- Dashboard Pelayanan IGD belum memiliki entry point **Rujuk ke Hemodialisa**.
- Ketika order dibuat, pasien masuk ke Dashboard Pelayanan Hemodialisa untuk diproses lebih lanjut.
- Pasien Rawat Inap dapat memperoleh lebih dari satu pelayanan Hemodialisa dalam satu episode rawat inap sesuai indikasi medis, dengan ketentuan hanya satu order yang aktif pada satu waktu.
- Belum terdapat proses konfirmasi order yang menjadi prasyarat sebelum pengisian pelayanan Hemodialisa.
- Belum terdapat tampilan tombol konfirmasi dan pembatalan order yang jelas pada visualisasi Dashboard Pelayanan Hemodialisa.
- Mekanisme pembatalan order belum tergambar secara konsisten berdasarkan status order dan pengisian asesmen/tindakan.

**Masalah/pain point:**
- Aspek bisnis proses: Order yang masuk belum memiliki checkpoint penerimaan oleh petugas Hemodialisa sebelum pelayanan mulai diisi.
- Aspek UX: Entry point IGD belum tersedia dan visualisasi sebelumnya belum memperlihatkan tombol **Konfirmasi Order** dan **Batalkan Order** secara jelas.
- Aspek logic system: Fitur pelayanan Hemodialisa masih berpotensi dapat diakses sebelum order diterima atau dikonfirmasi oleh unit Hemodialisa.
- Aspek konsistensi: Pola pembuatan order dari Rawat Inap dan IGD perlu diseragamkan sebagai aksi langsung tanpa form.

**Dampak utama yang disasar v2:**
- Menyeragamkan entry point order dari Rawat Inap dan IGD.
- Memastikan order diterima oleh unit Hemodialisa sebelum dokumentasi pelayanan dapat diisi.
- Mencegah pengisian asesmen atau tindakan pada order yang belum dikonfirmasi.
- Memberikan aksi konfirmasi dan pembatalan yang mudah ditemukan pada Dashboard Pelayanan Hemodialisa.
- Menghindari duplikasi order aktif dan menjaga riwayat pelayanan tetap tertelusuri.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = entry point Rawat Inap dan IGD, pembuatan order langsung tanpa form, validasi satu order aktif, status Menunggu Konfirmasi, gate seluruh fitur pelayanan, konfirmasi, pembatalan, penyelesaian order, riwayat, EMR, dan Audit Trail.
- Tidak ada Fase 2/3 dalam PRD Order Hemodialisa ini. Billing dan detail input pelayanan Hemodialisa ditangani pada PRD terpisah.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Entry point dari Rawat Inap** — tersedia pada Dashboard Pelayanan Rawat Inap melalui **three dots → Rujuk ke Hemodialisa**; kapabilitas ini sudah ada pada v1 dan dipertahankan pada v2.
2. **Entry point dari IGD** — ditambahkan pada Dashboard Pelayanan IGD melalui **three dots → Rujuk ke Hemodialisa**; kapabilitas ini belum ada pada v1.
3. **Pembuatan order tanpa form** — ketika aksi **Rujuk ke Hemodialisa** dipilih, sistem langsung membuat data order dan menampilkan pasien pada Dashboard Pelayanan Hemodialisa tanpa input form tambahan.
4. **Validasi order aktif** — hanya satu order Hemodialisa berstatus aktif yang diperbolehkan dalam satu waktu pada episode pelayanan yang sama.
5. **Fitur Order & Riwayat Hemodialisa** — satu fitur pada toolbar aksi pasien di Dashboard Pelayanan Hemodialisa, ditampilkan dalam bentuk ikon yang dapat dibuka tanpa menambahkan kolom baru pada tabel utama.
6. **Tab Order** — tab default yang menampilkan status order, unit asal order, nomor episode, petugas pembuat, waktu order, waktu konfirmasi, dan aksi sesuai status.
7. **Tab Riwayat** — menampilkan seluruh order Hemodialisa dalam episode pelayanan yang sama secara kronologis.
8. **Status order** — Menunggu Konfirmasi, Sedang Dilayani, Selesai, dan Dibatalkan.
9. **Konfirmasi order** — tombol **Konfirmasi Order** tersedia pada tab Order untuk mengubah status Menunggu Konfirmasi menjadi Sedang Dilayani.
10. **Gate fitur pelayanan** — seluruh fitur pelayanan Hemodialisa tidak dapat digunakan sebelum order dikonfirmasi.
11. **Pop-up order belum dikonfirmasi** — klik pada fitur pelayanan saat status Menunggu Konfirmasi menampilkan pesan **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”** dan arahan konfirmasi melalui fitur Order & Riwayat Hemodialisa.
12. **Pembatalan order** — tombol **Batalkan Order** tersedia pada tab Order dan mengikuti aturan status serta hak akses.
13. **Penyelesaian order** — tombol **Pulangkan Pasien** tersedia pada dashboard pelayanan HD setelah semua pemeriksaan selesai dan mengubah status Sedang Dilayani menjadi Selesai.
14. **Integrasi EMR dan Audit Trail** — order dan perubahan status tercatat sebagai bagian rekam medis dan log aktivitas sistem.

### Out Scope
- Form indikasi klinis atau catatan order saat memilih **Rujuk ke Hemodialisa**.
- Penambahan kolom khusus status/order Hemodialisa pada tabel utama Dashboard Pelayanan Hemodialisa; status dan detail order ditampilkan di dalam fitur **Order & Riwayat Hemodialisa**.
- Order Hemodialisa dari Rawat Jalan.
- Detail pelaksanaan tindakan, asesmen, Monitoring HD, dan hasil pelayanan; kebutuhan field pada fitur-fitur tersebut ditangani oleh PRD terkait.
- Billing Hemodialisa.
- Master Data Mesin Hemodialisa.
- Penjadwalan petugas Hemodialisa.

## 4. Goals and Metrics

### Tujuan
Menyediakan alur order Hemodialisa yang cepat tanpa form tambahan, konsisten antara Rawat Inap dan IGD, memiliki checkpoint konfirmasi oleh unit Hemodialisa, serta mencegah dokumentasi pelayanan dilakukan sebelum order diterima.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Duplikasi order Hemodialisa aktif dalam satu episode | 0 order duplikat | BR-003; FR-003 |
| Akses fitur pelayanan sebelum order dikonfirmasi | 0 pengisian berhasil | BR-006; FR-006 |
| Kelengkapan Audit Trail untuk pembuatan dan perubahan status order | 100% aktivitas tercatat | BR-013; NFR-001 |
| Konsistensi entry point Rawat Inap dan IGD | 100% menggunakan pola three dots dan aksi langsung tanpa form | BR-001; BR-002 |
| Waktu order tampil pada Dashboard Pelayanan Hemodialisa | `[PERLU KONFIRMASI]` | NFR-002 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Dashboard Pelayanan Rawat Inap | Sumber order existing melalui **three dots → Rujuk ke Hemodialisa**. |
| Dashboard Pelayanan IGD | Sumber order baru melalui **three dots → Rujuk ke Hemodialisa**. |
| Dashboard Pelayanan Hemodialisa | Tujuan order dan lokasi fitur **Order & Riwayat Hemodialisa** pada toolbar aksi pasien; modal dua tab menjadi lokasi status, detail, konfirmasi, pembatalan, riwayat, dan penyelesaian order. |
| Modul Asesmen Dokter Hemodialisa | Fitur pelayanan yang terkunci sebelum order dikonfirmasi. |
| Modul Asesmen Perawat Hemodialisa | Fitur pelayanan yang terkunci sebelum order dikonfirmasi. |
| Monitoring HD / Tindakan / Laboratorium | Fitur pelayanan yang terkunci sebelum order dikonfirmasi. |
| Electronic Medical Record (EMR) | Menyimpan order dan perubahan status sebagai bagian rekam medis pasien. |
| Audit Trail | Menyimpan aktivitas pembuatan, konfirmasi, pembatalan, dan penyelesaian order. |

Dependency lintas modul: **Dashboard Pelayanan Hemodialisa** (hard), **Dashboard Pelayanan Rawat Inap** (hard), **Dashboard Pelayanan IGD** (hard untuk entry point IGD), **Modul Asesmen/Tindakan Hemodialisa** (hard untuk gate dan validasi pembatalan).

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Perawat/Petugas Rawat Inap | Primary | Mengirim pasien ke Hemodialisa melalui menu three dots pada dashboard RI. |
| Perawat/Petugas IGD | Primary | Mengirim pasien ke Hemodialisa melalui menu three dots pada dashboard IGD. |
| Petugas Hemodialisa | Primary | Mengonfirmasi atau membatalkan order, mengisi pelayanan setelah konfirmasi, dan menyelesaikan pelayanan. |
| Perawat bangsal | Secondary | Membatalkan order sebelum dikonfirmasi apabila memiliki akses sesuai RBAC existing. |
| Auditor / Manajemen | Secondary | Meninjau Audit Trail aktivitas order. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Pengguna Rawat Inap dapat memilih **three dots → Rujuk ke Hemodialisa** pada Dashboard Pelayanan Rawat Inap.
2. Entry point yang sama belum tersedia pada Dashboard Pelayanan IGD.
3. Pasien yang dirujuk masuk ke Dashboard Pelayanan Hemodialisa.
4. Sistem mempertahankan validasi satu order aktif pada satu waktu untuk episode pelayanan yang sama.
5. Dashboard Hemodialisa belum memiliki checkpoint konfirmasi yang mengunci fitur pelayanan sebelum order diterima.
6. Tombol konfirmasi dan pembatalan order belum tergambar secara jelas pada visualisasi UI sebelumnya.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Pengguna membuka Dashboard Pelayanan Rawat Inap atau Dashboard Pelayanan IGD.
2. Pengguna membuka menu **three dots** pada pasien dan memilih **Rujuk ke Hemodialisa**.
3. Sistem memvalidasi apakah episode pasien sudah memiliki order Hemodialisa aktif.
4. Apabila tidak ada order aktif, sistem langsung membuat order tanpa membuka form.
5. Order langsung tampil sebagai pasien pada Dashboard Pelayanan Hemodialisa dengan status **Menunggu Konfirmasi**, beserta unit asal, episode sumber, petugas pembuat, dan waktu order.
6. Pada toolbar aksi pasien tersedia satu ikon fitur **Order & Riwayat Hemodialisa**. Sistem tidak menambahkan kolom order baru pada tabel utama.
7. Ketika ikon dibuka, sistem menampilkan modal dengan tab **Order** sebagai tab default dan tab **Riwayat** sebagai tab kedua.
8. Tab Order menampilkan status serta detail order. Pada status Menunggu Konfirmasi, tab ini menampilkan tombol **Batalkan Order** dan **Konfirmasi Order**.
9. Selama status masih Menunggu Konfirmasi, seluruh fitur pelayanan Hemodialisa tetap terkunci.
10. Apabila pengguna memilih fitur pelayanan yang lain, sistem menampilkan pop-up **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”**, mengarahkan pengguna ke fitur Order & Riwayat Hemodialisa, dan tidak membuka layar input.
11. Petugas Hemodialisa memilih **Konfirmasi Order** pada tab Order; status berubah menjadi **Sedang Dilayani**, waktu konfirmasi dicatat, dan fitur pelayanan terbuka sesuai RBAC.
12. Setelah order dikonfirmasi, tab Order menampilkan tombol **Batalkan Order** apabila syarat pembatalan masih terpenuhi dan tombol **Pulangkan Pasien** untuk penyelesaian pelayanan.
13. Tab Riwayat menampilkan order aktif dan order terdahulu dalam episode yang sama secara kronologis beserta unit asal, petugas, status, dan keterangan perubahan status.
14. Setelah pelayanan selesai, petugas Hemodialisa memilih **Pulangkan Pasien**; status berubah menjadi **Selesai**.
15. Setelah order berstatus Selesai atau Dibatalkan, order baru dapat dibuat dalam episode yang sama apabila masih diperlukan.
16. Seluruh aktivitas tercatat pada EMR dan Audit Trail.
### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Entry point Rawat Inap | Sudah ada melalui three dots | Dipertahankan dengan perilaku direct create tanpa form |
| Entry point IGD | Belum ada | Ditambahkan melalui three dots dengan pola yang sama |
| Form order | Tidak ditegaskan | Tidak ada form; klik aksi langsung membuat order |
| Status awal | Pasien langsung masuk dashboard | Menunggu Konfirmasi |
| Akses fitur sebelum konfirmasi | Belum memiliki gate yang tegas | Seluruh fitur pelayanan terkunci |
| Feedback saat fitur terkunci | Belum tersedia | Pop-up pesan order belum dikonfirmasi dan arahan ke fitur Order & Riwayat Hemodialisa |
| Akses order dan riwayat | Belum tersedia sebagai fitur gabungan | Satu ikon **Order & Riwayat Hemodialisa** pada toolbar aksi pasien |
| Struktur tampilan | Belum tersedia | Modal dengan dua tab: Order dan Riwayat; tidak menambah kolom order pada tabel utama |
| Konfirmasi order | Belum ada | Tombol Konfirmasi Order pada tab Order |
| Pembatalan order | Belum terstruktur/kurang terlihat | Tombol Batalkan Order pada tab Order dengan aturan status dan RBAC |
| Penyelesaian order | Belum terintegrasi dengan detail order | Tombol Pulangkan Pasien pada tab Order setelah konfirmasi |
| Riwayat/status order | Belum lengkap | Status/detail pada tab Order dan daftar kronologis pada tab Riwayat |
## 7. Main Flow / Mindmap

### Skenario 1 — Rujuk ke Hemodialisa dari Rawat Inap
1. Pengguna membuka Dashboard Pelayanan Rawat Inap.
2. Pengguna memilih menu **three dots** pada pasien.
3. Pengguna memilih **Rujuk ke Hemodialisa**.
4. Sistem memvalidasi tidak ada order Hemodialisa aktif pada episode yang sama.
5. Sistem langsung membuat order tanpa form.
6. Pasien tampil pada Dashboard Pelayanan Hemodialisa dengan status Menunggu Konfirmasi.

### Skenario 2 — Rujuk ke Hemodialisa dari IGD
1. Pengguna membuka Dashboard Pelayanan IGD.
2. Pengguna memilih menu **three dots** pada pasien.
3. Pengguna memilih **Rujuk ke Hemodialisa**.
4. Sistem menjalankan validasi dan proses direct create yang sama dengan Rawat Inap.
5. Pasien tampil pada Dashboard Pelayanan Hemodialisa dengan status Menunggu Konfirmasi.

### Skenario 3 — Percobaan order baru saat masih ada order aktif
1. Pengguna memilih **Rujuk ke Hemodialisa** untuk episode yang memiliki order Menunggu Konfirmasi atau Sedang Dilayani.
2. Sistem menolak pembuatan order baru.
3. Sistem menampilkan informasi bahwa pasien masih memiliki order Hemodialisa aktif. Redaksi pesan `[PERLU KONFIRMASI]`.
4. Order baru hanya dapat dibuat setelah order sebelumnya Selesai atau Dibatalkan.

### Skenario 4 — Membuka fitur Order & Riwayat Hemodialisa
1. Pengguna memilih ikon **Order & Riwayat Hemodialisa** pada toolbar aksi pasien.
2. Sistem membuka modal dan mengaktifkan tab **Order** secara default.
3. Tab Order menampilkan status order, unit asal order, nomor episode, petugas pembuat, waktu order, waktu konfirmasi.
4. Pengguna dapat berpindah ke tab **Riwayat** untuk melihat seluruh order pada episode yang sama.
5. Menutup modal mengembalikan pengguna ke Dashboard Pelayanan Hemodialisa tanpa mengubah data.

### Skenario 5 — Pengguna membuka fitur pelayanan sebelum order dikonfirmasi
1. Order berstatus Menunggu Konfirmasi.
2. Pengguna memilih Asesmen Dokter, Asesmen Perawat, Monitoring HD, Tindakan, Lab, atau fitur pelayanan Hemodialisa lainnya.
3. Sistem tidak membuka fitur yang dipilih.
4. Sistem menampilkan pop-up **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”** dan arahan **“Konfirmasi order terlebih dahulu melalui fitur Order & Riwayat Hemodialisa.”**
5. Pengguna menutup pop-up dan kembali ke Dashboard Pelayanan Hemodialisa.

### Skenario 6 — Konfirmasi order melalui tab Order
1. Petugas Hemodialisa membuka fitur **Order & Riwayat Hemodialisa**.
2. Tab Order aktif secara default dan menampilkan status Menunggu Konfirmasi.
3. Petugas memilih tombol **Konfirmasi Order**.
4. Sistem mengubah status menjadi Sedang Dilayani dan mencatat user serta waktu konfirmasi.
5. Sistem membuka akses fitur pelayanan sesuai RBAC.
6. Tab Order mengganti tombol Konfirmasi Order dengan tombol Batalkan Order tetap tersedia apabila syarat pembatalan terpenuhi.

### Skenario 7 — Pembatalan order melalui tab Order
- **Menunggu Konfirmasi:** tombol **Batalkan Order** tersedia bagi pengguna berwenang; order berubah menjadi Dibatalkan.
- **Sedang Dilayani dan belum ada asesmen/tindakan:** petugas Hemodialisa dapat membatalkan order.
- **Sedang Dilayani dan asesmen/tindakan sudah diisi:** pembatalan ditolak atau tombol dinonaktifkan.
- **Selesai/Dibatalkan:** status terminal; tab Order bersifat read-only dan tidak menyediakan aksi perubahan status.
- Perubahan status langsung tercermin pada baris order aktif di tab Riwayat.

### Skenario 8 — Melihat riwayat order
1. Pengguna membuka tab **Riwayat**.
2. Sistem menampilkan seluruh order pada episode pelayanan pasien secara kronologis.
3. Setiap baris minimal menampilkan tanggal/waktu order, unit asal, petugas, status, dan keterangan.
4. Order aktif saat ini ditampilkan bersama order terdahulu yang Selesai atau Dibatalkan.

### Skenario 9 — Penyelesaian order
1. Order berstatus Sedang Dilayani dan pelayanan telah selesai.
2. Petugas Hemodialisa membuka three dots pada dashboard pelayanan HD lalu memilih **Pulangkan Pasien**.
3. Sistem mengubah status order menjadi Selesai dan mencatat waktu selesai.
4. Status terbaru tercermin pada tab Riwayat.
5. Episode dapat menerima order Hemodialisa berikutnya bila diperlukan.
## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Entry point order dari Rawat Inap berada pada Dashboard Pelayanan Rawat Inap melalui **three dots → Rujuk ke Hemodialisa**. | Draft user; US-001; FR-001 |
| **BR-002** | Entry point order dari IGD berada pada Dashboard Pelayanan IGD melalui **three dots → Rujuk ke Hemodialisa**. | Draft user; US-002; FR-002 |
| **BR-003** | Sistem hanya mengizinkan satu order Hemodialisa aktif, yaitu Menunggu Konfirmasi atau Sedang Dilayani, dalam satu waktu pada satu episode pelayanan. | US-003; FR-003 |
| **BR-004** | Pemilihan **Rujuk ke Hemodialisa** langsung membuat order tanpa membuka atau meminta pengisian form. | Draft user; US-001; US-002; FR-004 |
| **BR-005** | Order yang berhasil dibuat langsung tampil pada Dashboard Pelayanan Hemodialisa dengan status awal Menunggu Konfirmasi. | Draft user; FR-004; FR-005 |
| **BR-006** | Selama order berstatus Menunggu Konfirmasi, seluruh fitur pelayanan Hemodialisa tidak dapat dibuka atau diisi. | Draft user; US-005; FR-006 |
| **BR-007** | Klik pada fitur pelayanan saat order belum dikonfirmasi wajib menampilkan pop-up **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”** dan tidak mengubah data pelayanan. | Draft user; US-005; FR-007 |
| **BR-008** | Order wajib dikonfirmasi melalui tombol **Konfirmasi Order** pada Dashboard Pelayanan Hemodialisa sebelum fitur pelayanan dapat digunakan. | Draft user; US-006; FR-008 |
| **BR-009** | Konfirmasi order mengubah status Menunggu Konfirmasi menjadi Sedang Dilayani, mencatat user dan waktu konfirmasi, serta membuka fitur pelayanan sesuai RBAC. | US-006; FR-008 |
| **BR-010** | Tombol **Batalkan Order** ditampilkan pada Dashboard Pelayanan Hemodialisa untuk pengguna berwenang sesuai status order. | Draft user; US-007; FR-009 |
| **BR-011** | Order Menunggu Konfirmasi dapat dibatalkan oleh pengguna berwenang; order Sedang Dilayani hanya dapat dibatalkan petugas Hemodialisa apabila belum ada asesmen/tindakan. | PRD v2 sebelumnya; US-007; FR-009 |
| **BR-012** | Order Sedang Dilayani yang sudah memiliki asesmen/tindakan dan order Selesai tidak dapat dibatalkan. | PRD v2 sebelumnya; US-007; FR-009 |
| **BR-013** | Seluruh aktivitas pembuatan, konfirmasi, pembatalan, dan penyelesaian order dicatat pada Audit Trail minimal mencakup user, role, waktu, episode, order, aksi, serta hasil aksi. | FR-012; NFR-001 |
| **BR-014** | Order berikutnya dalam episode yang sama hanya dapat dibuat setelah order sebelumnya Selesai atau Dibatalkan. | US-003; FR-003 |
| **BR-015** | Aksi **Pulangkan Pasien** pada order Sedang Dilayani mengubah status menjadi Selesai dan mencatat waktu selesai. | US-010; FR-011 |
| **BR-016** | Dashboard Pelayanan Hemodialisa menyediakan satu fitur **Order & Riwayat Hemodialisa** pada toolbar aksi per pasien; fitur dibuka melalui satu ikon dan tidak menggunakan kolom tambahan pada tabel utama. | UI approved; US-011; FR-013 |
| **BR-017** | Fitur Order & Riwayat Hemodialisa dibuka sebagai modal dengan dua tab: **Order** dan **Riwayat**; tab Order aktif secara default setiap kali modal dibuka. | UI approved; US-011; FR-013 |
| **BR-018** | Tab Order menampilkan status order, sumber order, nomor episode, petugas pembuat, waktu order, waktu konfirmasi, catatan, serta aksi yang tersedia berdasarkan status dan RBAC. | UI approved; FR-008; FR-009; FR-011; FR-013 |
| **BR-019** | Tab Riwayat menampilkan seluruh order Hemodialisa pada episode pelayanan yang sama secara kronologis, minimal mencakup tanggal/waktu order, unit asal, petugas, status, dan keterangan perubahan status. | UI approved; US-008; FR-010; FR-013 |
| **BR-020** | Perubahan status pada tab Order harus langsung tercermin pada order aktif di tab Riwayat tanpa membuat pengguna kehilangan konteks pasien. | UI approved; FR-010; FR-013 |

## 9. State Machine

### 9.1 Status Order Hemodialisa
| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Menunggu Konfirmasi | Badge kuning/amber | Order telah dibuat dari RI/IGD dan menunggu penerimaan petugas Hemodialisa; fitur pelayanan terkunci. |
| Sedang Dilayani | Badge biru/teal | Order telah dikonfirmasi; fitur pelayanan dapat digunakan sesuai RBAC. |
| Selesai | Badge hijau | Pelayanan selesai dan pasien telah dipulangkan dari pelayanan Hemodialisa. |
| Dibatalkan | Badge merah/abu-abu | Order dibatalkan sesuai aturan status dan hak akses. |

**Transisi:**
- Tidak ada order aktif → Menunggu Konfirmasi: aksi **Rujuk ke Hemodialisa** dari RI/IGD.
- Menunggu Konfirmasi → Sedang Dilayani: aksi **Konfirmasi Order**.
- Menunggu Konfirmasi → Dibatalkan: aksi **Batalkan Order** oleh pengguna berwenang.
- Sedang Dilayani → Dibatalkan: aksi **Batalkan Order** oleh petugas Hemodialisa sebelum ada asesmen/tindakan.
- Sedang Dilayani → Selesai: aksi **Pulangkan Pasien**.

### 9.2 Tabel Trigger Perubahan Status
| # | Trigger | Dilakukan Oleh | Lokasi Aksi | Status Sebelum | Status Sesudah |
|---|---------|----------------|-------------|----------------|----------------|
| 1 | Rujuk ke Hemodialisa | Petugas RI/IGD | Three dots Dashboard Pelayanan RI/IGD | Tidak ada order aktif | Menunggu Konfirmasi |
| 2 | Konfirmasi Order | Petugas Hemodialisa | Tab Order pada fitur Order & Riwayat Hemodialisa | Menunggu Konfirmasi | Sedang Dilayani |
| 3 | Batalkan Order | Pengguna berwenang | Tab Order pada fitur Order & Riwayat Hemodialisa | Menunggu Konfirmasi / Sedang Dilayani tanpa asesmen | Dibatalkan |
| 4 | Pulangkan Pasien | Petugas Hemodialisa | Three dots pada dashboard pelayanan HD | Sedang Dilayani | Selesai |

### 9.3 Status Terminal
- Selesai dan Dibatalkan merupakan status terminal.
- Status terminal tidak dapat dikembalikan ke status sebelumnya.
- Episode pelayanan dapat menerima order baru setelah order sebelumnya berada pada status terminal.

## 10. Display & Interaction Rules

### 10.1 Entry Point Dashboard Sumber
| Aspek | Rawat Inap | IGD |
|-------|-------------|-----|
| Lokasi | Dashboard Pelayanan RI | Dashboard Pelayanan IGD |
| Akses | Menu three dots per pasien | Menu three dots per pasien |
| Label aksi | Rujuk ke Hemodialisa | Rujuk ke Hemodialisa |
| Perilaku | Direct create tanpa form | Direct create tanpa form |
| Kondisi tersedia | Episode aktif dan tidak memiliki order HD aktif | Episode aktif dan tidak memiliki order HD aktif |
| Baseline | Sudah ada di v1 | Baru di v2 |

### 10.2 Fitur Order & Riwayat Hemodialisa
- Fitur ditampilkan sebagai **satu ikon** pada toolbar aksi pasien di Dashboard Pelayanan Hemodialisa.
- Ikon menggunakan tooltip/accessible label **“Order dan Riwayat Hemodialisa”**.
- Fitur tidak menambah kolom baru pada tabel utama Dashboard Pelayanan Hemodialisa.
- Ketika ikon dipilih, sistem membuka modal dengan judul **Order & Riwayat Hemodialisa**, identitas pasien, nomor rekam medis, dan nomor antrean.
- Modal selalu membuka tab **Order** sebagai tab default; pengguna dapat berpindah ke tab **Riwayat** tanpa menutup modal.

### 10.3 Tab Order
| Kondisi Order | Informasi yang Ditampilkan | Aksi yang Ditampilkan |
|---------------|-----------------------------|-----------------------|
| Menunggu Konfirmasi | Badge Menunggu Konfirmasi, sumber order, nomor episode, petugas pembuat, waktu order, waktu konfirmasi kosong, dan catatan | **Batalkan Order** dan **Konfirmasi Order** |
| Sedang Dilayani | Badge Sedang Dilayani, detail order, serta waktu konfirmasi | **Batalkan Order** apabila masih memenuhi syarat dan **Pulangkan Pasien** |
| Selesai | Badge Selesai dan detail order termasuk waktu selesai | Tidak ada aksi perubahan status; read-only |
| Dibatalkan | Badge Dibatalkan dan detail pembatalan | Tidak ada aksi perubahan status; tombol/status disabled dapat ditampilkan |

Aturan tambahan:
- Status ditampilkan di dalam tab Order, bukan sebagai kolom baru pada tabel utama.
- Tombol menggunakan label teks yang jelas; aksi klinis tidak hanya direpresentasikan oleh ikon tanpa label.
- Setelah konfirmasi berhasil, tombol **Konfirmasi Order** tidak ditampilkan lagi.
- Ketika pembatalan tidak memenuhi syarat, tombol **Batalkan Order** dinonaktifkan atau aksi ditolak dengan alasan yang jelas.

### 10.4 Tab Riwayat
| Kolom | Format Tampilan | Catatan |
|-------|-----------------|---------|
| Tanggal/Waktu Order | dd/mm/yyyy HH:mm | Waktu pembuatan setiap order |
| Unit Asal | Jenis pelayanan dan nama unit | Contoh: Rawat Inap — Ruang Melati |
| Petugas | Nama petugas pembuat order | Reuse identitas user kanonik |
| Status | Badge Menunggu Konfirmasi / Sedang Dilayani / Selesai / Dibatalkan | Mengikuti State Machine §9 |
| Keterangan | Text | Contoh: Order aktif saat ini, waktu konfirmasi, waktu selesai, atau pembatalan sebelum konfirmasi |

- Riwayat mencakup order aktif saat ini dan seluruh order sebelumnya dalam episode yang sama.
- Urutan riwayat bersifat kronologis dengan order terbaru ditampilkan lebih dahulu.
- Perubahan status pada tab Order harus langsung memperbarui baris order aktif di tab Riwayat.

### 10.5 Gate Fitur pada Dashboard Pelayanan Hemodialisa
| Kondisi Order | Tampilan Fitur Pelayanan | Behavior saat Diklik | Arah Tindak Lanjut |
|---------------|--------------------------|----------------------|----------------------|
| Menunggu Konfirmasi | Terlihat tetapi berstatus terkunci/disabled secara visual | Pop-up **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”**; layar input tidak dibuka | **Konfirmasi order terlebih dahulu melalui fitur Order & Riwayat Hemodialisa.** |
| Sedang Dilayani | Aktif sesuai RBAC | Membuka fitur yang dipilih | Pelayanan dapat diisi |
| Selesai | Read-only/riwayat | Tidak dapat membuat input baru pada order selesai | Lihat detail/riwayat |
| Dibatalkan | Read-only/riwayat | Tidak dapat membuat input | Lihat detail/riwayat |
## 11. User Stories

> Format “Sebagai … ingin … sehingga …”. Acceptance Criteria menggunakan pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas Rawat Inap**, saya ingin **merujuk pasien ke Hemodialisa dari menu three dots**, sehingga **order dapat dibuat tanpa berpindah ke form lain**. | Given episode RI aktif dan tidak memiliki order HD aktif, When pengguna memilih **Rujuk ke Hemodialisa**, Then sistem langsung membuat order tanpa form dan menampilkannya pada Dashboard Hemodialisa dengan status Menunggu Konfirmasi. | BR-001; BR-004; FR-001; FR-004 |
| **US-002** | Sebagai **petugas IGD**, saya ingin **merujuk pasien ke Hemodialisa dari menu three dots**, sehingga **pasien IGD dapat dikirim dengan pola yang sama seperti Rawat Inap**. | Given episode IGD aktif dan tidak memiliki order HD aktif, When pengguna memilih **Rujuk ke Hemodialisa**, Then sistem langsung membuat order tanpa form dan menampilkannya pada Dashboard Hemodialisa. | BR-002; BR-004; FR-002; FR-004 |
| **US-003** | Sebagai **petugas RI/IGD**, saya ingin **dicegah membuat order duplikat**, sehingga **hanya ada satu order Hemodialisa aktif dalam satu episode**. | Given episode memiliki order Menunggu Konfirmasi atau Sedang Dilayani, When pengguna memilih Rujuk ke Hemodialisa, Then sistem menolak order baru dan menampilkan informasi order aktif. | BR-003; BR-014; FR-003 |
| **US-004** | Sebagai **petugas Hemodialisa**, saya ingin **melihat pasien yang memiliki order baru dan membuka detailnya dari toolbar aksi**, sehingga **saya dapat mengetahui order yang perlu dikonfirmasi tanpa menambah kepadatan tabel utama**. | Given order berhasil dibuat, When Dashboard Hemodialisa dimuat, Then pasien tampil pada dashboard dan ikon Order & Riwayat tersedia pada toolbar aksi. When ikon dibuka, Then tab Order menampilkan status Menunggu Konfirmasi, unit asal, episode, petugas pembuat, dan waktu order. | BR-005; BR-016–BR-018; FR-005; FR-013 |
| **US-005** | Sebagai **pengguna Dashboard Hemodialisa**, saya ingin **mendapat pemberitahuan saat mencoba mengisi pelayanan sebelum konfirmasi**, sehingga **saya memahami alasan fitur belum dapat digunakan**. | Given order Menunggu Konfirmasi, When pengguna memilih salah satu fitur pelayanan, Then fitur tidak terbuka dan pop-up **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”** ditampilkan. | BR-006; BR-007; FR-006; FR-007 |
| **US-006** | Sebagai **petugas Hemodialisa**, saya ingin **mengonfirmasi order dari tab Order**, sehingga **pelayanan dapat mulai didokumentasikan**. | Given modal Order & Riwayat terbuka pada tab Order dan status Menunggu Konfirmasi, When petugas memilih Konfirmasi Order, Then status menjadi Sedang Dilayani, user/waktu konfirmasi tercatat, fitur pelayanan terbuka sesuai RBAC, dan riwayat aktif diperbarui. | BR-008; BR-009; BR-017–BR-020; FR-008; FR-013 |
| **US-007** | Sebagai **pengguna berwenang**, saya ingin **membatalkan order Hemodialisa dari tab Order**, sehingga **order yang tidak lagi diperlukan dapat dihentikan secara tertelusur**. | Given order memenuhi syarat pembatalan, When pengguna memilih Batalkan Order pada tab Order, Then status menjadi Dibatalkan, Audit Trail tercatat, dan baris order aktif pada tab Riwayat diperbarui. Given asesmen/tindakan sudah ada atau order Selesai, When pembatalan dilakukan, Then sistem menolak aksi atau menonaktifkan tombol. | BR-010; BR-011; BR-012; BR-018; BR-020; FR-009; FR-013 |
| **US-008** | Sebagai **petugas Hemodialisa**, saya ingin **melihat riwayat order melalui tab Riwayat**, sehingga **saya dapat memahami urutan pelayanan pasien dalam satu episode**. | Given episode memiliki satu atau lebih order, When pengguna membuka tab Riwayat, Then seluruh order ditampilkan kronologis dengan tanggal/waktu order, unit asal, petugas, status, dan keterangan perubahan status. | BR-019; BR-020; FR-010; FR-013 |
| **US-009** | Sebagai **tenaga kesehatan**, saya ingin **order dan perubahan status tercatat pada EMR**, sehingga **rekam medis pasien tetap lengkap**. | Given order dibuat atau berubah status, When transaksi disimpan, Then data terkait tersinkron ke EMR pasien. | FR-012 |
| **US-010** | Sebagai **petugas Hemodialisa**, saya ingin **memulangkan pasien dari tab Order setelah pelayanan selesai**, sehingga **order menjadi Selesai dan episode dapat menerima order berikutnya**. | Given tab Order menampilkan status Sedang Dilayani, When petugas memilih Pulangkan Pasien, Then status menjadi Selesai, waktu selesai tercatat, dan tab Riwayat menampilkan status terbaru. | BR-015; BR-018; BR-020; FR-011; FR-013 |
| **US-011** | Sebagai **pengguna Dashboard Hemodialisa**, saya ingin **mengakses detail order dan riwayat dari satu fitur dengan dua tab**, sehingga **saya tidak perlu membuka halaman atau fitur terpisah**. | Given pengguna berada pada baris pasien, When ikon Order & Riwayat Hemodialisa dipilih, Then modal terbuka pada tab Order secara default dan tab Riwayat dapat dipilih tanpa menutup modal. | BR-016–BR-019; FR-013 |

## 12. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Entry Point Rawat Inap** — menyediakan aksi **Rujuk ke Hemodialisa** pada menu three dots Dashboard Pelayanan Rawat Inap. | US-001; BR-001 |
| **FR-002** | **Entry Point IGD** — menyediakan aksi **Rujuk ke Hemodialisa** pada menu three dots Dashboard Pelayanan IGD. | US-002; BR-002 |
| **FR-003** | **Validasi Order Aktif** — mencegah direct create apabila episode memiliki order Menunggu Konfirmasi atau Sedang Dilayani. | US-003; BR-003; BR-014 |
| **FR-004** | **Direct Create Order** — membuat order otomatis tanpa form ketika aksi Rujuk ke Hemodialisa dipilih, serta mencatat sumber, episode, user, dan waktu. | US-001; US-002; BR-004 |
| **FR-005** | **Menampilkan Pasien Berorder pada Dashboard Hemodialisa** — menampilkan pasien yang dirujuk pada dashboard dan menyediakan akses ke detail order melalui ikon Order & Riwayat pada toolbar aksi pasien. | US-004; BR-005; BR-016 |
| **FR-006** | **Gate Fitur Pelayanan** — mencegah pembukaan dan penyimpanan seluruh fitur pelayanan ketika status Menunggu Konfirmasi. | US-005; BR-006 |
| **FR-007** | **Pop-up Belum Dikonfirmasi** — menampilkan pesan persis **“Order Hemodialisa belum dikonfirmasi, Asesmen Belum Dapat Diisi”** ketika fitur pelayanan dipilih sebelum konfirmasi. | US-005; BR-007 |
| **FR-008** | **Konfirmasi Order** — menyediakan tombol Konfirmasi Order pada tab Order, mengubah status menjadi Sedang Dilayani, mencatat user/waktu, membuka fitur pelayanan sesuai RBAC, dan memperbarui status pada tab Riwayat. | US-006; BR-008; BR-009; BR-018; BR-020 |
| **FR-009** | **Pembatalan Order** — menyediakan tombol Batalkan Order pada tab Order, menjalankan validasi status, RBAC, serta keberadaan asesmen/tindakan, lalu memperbarui tab Riwayat apabila pembatalan berhasil. | US-007; BR-010; BR-011; BR-012; BR-018; BR-020 |
| **FR-010** | **Riwayat Order** — menampilkan tab Riwayat yang memuat seluruh order dalam episode secara kronologis, minimal meliputi tanggal/waktu order, unit asal, petugas, status, dan keterangan perubahan status. | US-008; BR-019; BR-020 |
| **FR-011** | **Penyelesaian Order** — menyediakan tombol Pulangkan Pasien pada tab Order setelah konfirmasi, mengubah status menjadi Selesai, mencatat waktu selesai, dan memperbarui tab Riwayat. | US-010; BR-015; BR-018; BR-020 |
| **FR-012** | **EMR dan Audit Trail** — mencatat order, perubahan status, percobaan akses saat terkunci, dan hasil validasi aksi. | US-009; BR-013 |
| **FR-013** | **Fitur Gabungan Order & Riwayat** — menyediakan satu ikon pada toolbar aksi pasien yang membuka modal dua tab; tab Order aktif secara default dan tab Riwayat dapat diakses tanpa berpindah halaman. | US-004; US-006–US-008; US-010; US-011; BR-016–BR-020 |

## 13. Data Requirements (Spesifikasi Field)

> Field demografi dan penjamin **reuse definisi kanonik dari modul sumber episode pelayanan Rawat Inap/IGD** — nama, tipe, format, dan validasi harus sama.

### A. Layar TAMPIL — Entry Point Dashboard Rawat Inap/IGD (FR-001, FR-002)
| Kolom/Elemen | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|--------------|-------------|-----------------|-------------|---------|
| Menu Aksi | konteks baris pasien | ikon three dots | — | Existing pada dashboard sumber |
| Rujuk ke Hemodialisa | permission + episode aktif | item menu berlabel | — | Direct create tanpa form |
| Status ketersediaan aksi | order HD aktif pada episode | aktif / disabled / tidak ditampilkan `[PERLU KONFIRMASI]` | — | Harus mencegah order aktif kedua |
| Feedback berhasil | hasil create order | toast/notifikasi `[PERLU KONFIRMASI]` | — | Tidak membuka form |
| Feedback gagal duplikasi | data order aktif | pop-up/toast `[PERLU KONFIRMASI]` | — | Menampilkan informasi order aktif |

### B. Data yang Dibuat Otomatis saat Order Dibuat (FR-004)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| id_order_hd | ID Order Hemodialisa | UUID/text | dibuat otomatis oleh sistem | Identifier unik |
| patient_id | ID Pasien | UUID/text | konteks pasien pada dashboard sumber | Reuse kanonik |
| source_episode_id | ID Episode Sumber | UUID/text | episode RI/IGD aktif | Reuse kanonik |
| source_module | Modul Sumber | enum | RAWAT_INAP / IGD | BR-001; BR-002 |
| source_unit_id | Unit Asal | UUID/text | unit pada episode sumber | Ditampilkan di Dashboard HD |
| created_by | Petugas Pembuat | UUID/text | user login | Audit Trail |
| created_at | Waktu Order | datetime | timestamp server | Audit Trail |
| status_order | Status Order | enum | default MENUNGGU_KONFIRMASI | BR-005 |
| confirmed_by | Petugas Konfirmasi | UUID/text nullable | user yang menekan Konfirmasi Order | Diisi saat konfirmasi |
| confirmed_at | Waktu Konfirmasi | datetime nullable | timestamp server | Diisi saat konfirmasi |
| canceled_by | Petugas Pembatalan | UUID/text nullable | user yang membatalkan | Diisi saat pembatalan |
| canceled_at | Waktu Pembatalan | datetime nullable | timestamp server | Diisi saat pembatalan |
| completed_by | Petugas Penyelesaian | UUID/text nullable | user yang memulangkan pasien | Diisi saat selesai |
| completed_at | Waktu Selesai | datetime nullable | timestamp server | Diisi saat selesai |

### C. Layar TAMPIL — Toolbar Aksi Dashboard Pelayanan Hemodialisa (FR-005, FR-013)
| Kolom/Elemen | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|--------------|-------------|-----------------|-------------|---------|
| Order & Riwayat Hemodialisa | konteks pasien + permission | satu ikon pada toolbar aksi | — | Tooltip/aria-label “Order dan Riwayat Hemodialisa” |
| Status visual fitur klinis | order.status_order | ikon aktif atau terkunci | — | Terkunci saat Menunggu Konfirmasi |
| Menu lainnya | dashboard existing | ikon three dots | — | Tetap mengikuti dashboard existing |

### D. Layar TAMPIL — Modal Tab Order (FR-008, FR-009, FR-011, FR-013)
| Kolom/Elemen | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|--------------|-------------|-----------------|-------------|---------|
| Identitas Pasien | patient canonical | Nama, No. RM, No. Antrian | — | Ditampilkan pada header modal |
| Status Order Hemodialisa | order.status_order | badge | — | Menunggu Konfirmasi/Sedang Dilayani/Selesai/Dibatalkan |
| Sumber Order | order.source_module + source_unit_id | text | — | Contoh: Rawat Inap — Ruang Melati |
| No. Episode | order.source_episode_id | text | — | Reuse nomor episode kanonik |
| Petugas Pembuat | order.created_by | text | — | Nama user |
| Waktu Order | order.created_at | dd/mm/yyyy HH:mm WIB | — | Timestamp server |
| Waktu Konfirmasi | order.confirmed_at | dd/mm/yyyy HH:mm WIB atau “—” | — | Kosong sebelum konfirmasi |
| Catatan | system note | text | — | Menjelaskan order dibuat tanpa form |
| Batalkan Order | permission + status + assessment flag | tombol danger/disabled | — | Mengikuti BR-010–BR-012 |
| Konfirmasi Order | permission + status | tombol primary | — | Hanya saat Menunggu Konfirmasi |
| Pulangkan Pasien | permission + status | tombol success | — | Hanya saat Sedang Dilayani |

### E. Layar TAMPIL — Modal Tab Riwayat (FR-010, FR-013)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal/Waktu Order | order.created_at | dd/mm/yyyy HH:mm | terbaru lebih dahulu | — |
| Unit Asal | order.source_module + source_unit_id | text | — | Jenis pelayanan dan nama unit |
| Petugas | order.created_by | text | — | Nama petugas pembuat order |
| Status | order.status_order | badge | — | Mengikuti State Machine §9 |
| Keterangan | derived status timestamps | text | — | Order aktif, waktu konfirmasi, selesai, atau pembatalan |

### F. Data Gate Fitur Pelayanan (FR-006, FR-007, FR-009)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| is_order_confirmed | Order Terkonfirmasi | boolean | status_order = SEDANG_DILAYANI/SELESAI | Menentukan akses fitur |
| has_hd_assessment_or_action | Sudah Ada Asesmen/Tindakan | boolean | agregasi modul pelayanan HD | Menentukan pembatalan setelah konfirmasi |
| blocked_feature | Fitur yang Diklik | enum/text | kode fitur dashboard | Dicatat untuk Audit Trail |
| blocked_reason | Alasan Diblokir | text | ORDER_NOT_CONFIRMED | Menentukan pesan pop-up |

## 14. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Auditabilitas | Seluruh create, konfirmasi, pembatalan, penyelesaian, dan percobaan akses fitur saat terkunci wajib tercatat pada Audit Trail. | BR-013; FR-012 |
| **NFR-002** | Real-Time | Order yang dibuat dari RI/IGD harus tampil pada Dashboard Hemodialisa tanpa refresh manual atau dalam batas waktu `[PERLU KONFIRMASI]`. | FR-004; FR-005 |
| **NFR-003** | Konsistensi | Validasi satu order aktif harus aman terhadap permintaan bersamaan dari lebih dari satu pengguna. | BR-003; FR-003 |
| **NFR-004** | Keamanan/RBAC | Aksi rujuk, konfirmasi, pembatalan, pemulangan, dan akses fitur pelayanan dibatasi berdasarkan role dan permission existing. | FR-001; FR-002; FR-008; FR-009 |
| **NFR-005** | Usability | Fitur Order & Riwayat harus dapat dikenali sebagai satu ikon pada toolbar aksi, memiliki tooltip/accessible label, dan membuka tab Order sebagai default. | UI approved; BR-016; BR-017; FR-013 |
| **NFR-006** | Usability | Pop-up gate harus tampil konsisten pada semua fitur pelayanan yang diblokir, tidak menghilangkan konteks pasien, dan mengarahkan pengguna ke fitur Order & Riwayat Hemodialisa. | BR-007; FR-007 |
| **NFR-007** | Reliabilitas | Direct create harus bersifat atomic: order tidak boleh tercipta sebagian atau menghasilkan lebih dari satu order aktif. | BR-003; BR-004 |
| **NFR-008** | Konsistensi UI | Perubahan status dari tab Order harus langsung tercermin pada tab Riwayat dalam modal yang sama tanpa refresh halaman penuh. | BR-020; FR-010; FR-013 |
| **NFR-009** | Responsivitas | Modal dua tab harus tetap dapat digunakan pada resolusi desktop yang didukung dan tidak menutupi akses tombol aksi utama. Target breakpoint `[PERLU KONFIRMASI]`. | UI approved; FR-013 |

## 15. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Dashboard Pelayanan Rawat Inap** | Menyediakan entry point direct create existing. | Internal | FR-001 |
| **Dashboard Pelayanan IGD** | Menyediakan entry point direct create baru. | Internal | FR-002 |
| **Dashboard Pelayanan Hemodialisa** | Menampilkan pasien, toolbar aksi, fitur gabungan Order & Riwayat, gate fitur klinis, modal dua tab, konfirmasi, pembatalan, riwayat, dan penyelesaian. | Internal — hard dependency | FR-005–FR-013 |
| **Modul Asesmen/Tindakan HD** | Menyediakan fitur yang digate dan flag keberadaan asesmen/tindakan untuk pembatalan. | Internal — hard dependency | FR-006; FR-009 |
| **Electronic Medical Record** | Menyimpan order dan status sebagai bagian rekam medis. | Internal | FR-012 |
| **Audit Trail** | Menyimpan seluruh aktivitas dan hasil validasi. | Internal | FR-012 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Entry point Dashboard IGD | Hard untuk cakupan IGD | Pengguna IGD tidak dapat membuat order Hemodialisa dari dashboard IGD. |
| Status order pada Dashboard Hemodialisa | Hard | Gate fitur, konfirmasi, dan pembatalan tidak dapat berjalan konsisten. |
| Permission/RBAC | Hard | Aksi dapat terlihat atau dijalankan oleh role yang tidak sesuai. |
| Flag asesmen/tindakan | Hard untuk pembatalan pasca-konfirmasi | Sistem tidak dapat menentukan apakah order Sedang Dilayani masih dapat dibatalkan. |
| Audit Trail | Hard | Aktivitas klinis dan perubahan status tidak tertelusuri. |

## 16. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| **D-01** | Akses detail order dan riwayat | Digabung menjadi satu fitur **Order & Riwayat Hemodialisa** pada toolbar aksi pasien. |
| **D-02** | Struktur modal | Modal memiliki dua tab: **Order** dan **Riwayat**; tab Order aktif secara default. |
| **D-03** | Penempatan status dan aksi order | Status, detail, Konfirmasi Order, Batalkan Order, dan Pulangkan Pasien ditempatkan pada tab Order, bukan sebagai kolom baru pada tabel utama. |
| **D-04** | Tampilan riwayat | Tab Riwayat menggunakan tabel kronologis dengan kolom Tanggal/Waktu Order, Unit Asal, Petugas, Status, dan Keterangan. |
| **D-05** | Gate fitur klinis | Ikon fitur klinis tetap terlihat tetapi terkunci sebelum konfirmasi; klik menampilkan pop-up dan arahan ke fitur Order & Riwayat Hemodialisa. |

## 19. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 2.0 | `[PERLU KONFIRMASI]` | Team Product | Draft awal Order Hemodialisa v2. |
| 2.1 | 15 Juli 2026 | Team Product | Menambahkan entry point RI/IGD melalui three dots; menghapus form order; menambahkan direct create, status gate sebelum konfirmasi, pop-up blocker, serta penegasan tombol Konfirmasi Order dan Batalkan Order pada Dashboard Hemodialisa. |
| 2.2 | 15 Juli 2026 | Team Product | Menyelaraskan PRD dengan visualisasi UI approved: satu fitur Order & Riwayat pada toolbar aksi pasien, modal dua tab, penempatan status dan aksi pada tab Order, tabel kronologis pada tab Riwayat, serta penghapusan kebutuhan kolom order baru pada tabel utama. |
