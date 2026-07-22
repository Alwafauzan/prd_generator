# PRD — Order Pemeriksaan Patologi Anatomi

**Related Document:** Template PRD Generator Neurovi v2; Referensi visual form Permintaan Pemeriksaan Patologi Anatomi Neurovi v1; PRD Dashboard/Konfirmasi Laboratorium Patologi Anatomi (hard dependency); PRD Riwayat Pemeriksaan Penunjang (dokumen terpisah)  
**Dokumen ID:** PRD-P-ORDER-PA-v2.0 · **Versi:** 1.2 (Draft — Pemisahan fitur riwayat pemeriksaan)  
**Tanggal Disusun:** 20 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]`  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Order Pemeriksaan Patologi Anatomi adalah fitur Neurovi v2 yang digunakan dokter untuk membuat permintaan pemeriksaan spesimen Patologi Anatomi bagi pasien Rawat Jalan, Rawat Inap, dan IGD. Entry point fitur berada pada **menu Order Penunjang Medis** di konteks pelayanan pasien, kemudian pengguna memilih layanan **Patologi Anatomi**.

Fitur berfokus pada pengisian data order, pemilihan pemeriksaan, pencatatan cara jaringan tubuh diperoleh, pengambilan Diagnosis Klinik dari asesmen pasien, pengisian informasi klinis pendukung, validasi data, serta penyimpanan order agar langsung tersedia pada Dashboard Laboratorium Patologi Anatomi. Fitur tidak menyediakan Simpan Draft.

Dibandingkan Neurovi v1, Neurovi v2 menjadikan Keterangan Pungsi dan Lokalisasi sebagai field opsional, mendukung pencarian dan multiple selection Jenis Pemeriksaan, mengisi default tanggal dan dokter pengirim, mengambil diagnosis dari asesmen episode aktif, serta memberikan peringatan non-blocking apabila ditemukan pemeriksaan yang sama pada order aktif di episode pelayanan yang sama.

Fitur untuk melihat riwayat pemeriksaan tidak menjadi bagian dari halaman Order Pemeriksaan PA. Riwayat pemeriksaan PA akan digabung dengan pemeriksaan penunjang lain—Laboratorium Klinik, Radiologi, dan Transfusi Darah—melalui PRD Riwayat Pemeriksaan Penunjang yang terpisah.

> Referensi: kebutuhan user, hasil konfirmasi 20 Juli 2026, revisi pemisahan fitur riwayat, dan lampiran visual form Permintaan Pemeriksaan Patologi Anatomi Neurovi v1.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Dokter mengisi permintaan melalui satu modal panjang dengan scroll vertikal.
- Header menampilkan data pasien, sedangkan form memuat tanggal pemeriksaan, dokter pengirim, jenis pemeriksaan, jaringan tubuh, diagnosis, sitologi, keganasan, serta informasi klinis pendukung.
- Keterangan Pungsi dan Lokalisasi selalu ditandai wajib meskipun tidak relevan pada seluruh kasus.
- Pemilihan Jenis Pemeriksaan belum mendukung pencarian dan multiple selection yang terstruktur.
- Belum terdapat validasi otomatis terhadap pemeriksaan yang sama pada order aktif di episode pelayanan yang sama.
- Setelah order disimpan, data perlu tersedia pada Dashboard Laboratorium PA agar dapat diproses oleh petugas laboratorium.

**Masalah/pain point:**
- **Bisnis proses:** proses order perlu memastikan data klinis lengkap dan langsung diteruskan ke Dashboard Laboratorium PA tanpa input ulang.
- **User experience:** form panjang memuat field yang tidak selalu relevan dan belum mengoptimalkan default data dari konteks pelayanan.
- **Logic system:** field opsional diperlakukan sebagai mandatory, diagnosis belum terhubung secara pasti ke asesmen episode aktif, dan belum ada validasi duplikasi order aktif.

**Dampak utama yang disasar v2:**
- Mempercepat pembuatan order tanpa mengurangi informasi klinis yang diperlukan Laboratorium PA.
- Mengurangi input ulang dan memastikan order langsung tersedia pada Dashboard Laboratorium PA.
- Mengurangi potensi duplikasi pemeriksaan pada episode pelayanan yang sama.
- Memisahkan tanggung jawab halaman order dari fitur riwayat pemeriksaan penunjang.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = pembuatan order tanpa Draft, multiple selection pemeriksaan, data klinis pendukung, validasi duplikasi pada episode aktif, pembuatan Nomor Order PA, penyimpanan snapshot, publikasi ke Dashboard Laboratorium PA, dan audit aktivitas pembuatan order.

> Target volume harian dan concurrent user belum dapat dipastikan dan perlu ditetapkan sebelum performance test.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Entry point Order Penunjang Medis** pada pelayanan Rawat Jalan, Rawat Inap, dan IGD.
2. **Header pasien otomatis** dari konteks registrasi dan rekam medis.
3. **Pembuatan Order PA tanpa Draft**; tombol Simpan langsung meneruskan order ke Dashboard Laboratorium PA.
4. **Nomor Order PA otomatis** dengan format `YYMMDDXXXX`.
5. **Tanggal Pemeriksaan** default hari ini, tidak boleh backdate, dan boleh memilih tanggal mendatang.
6. **Dokter Pengirim** default DPJP atau dokter login dan dapat diganti dari Master Staf/Dokter aktif.
7. **Multiple selection Jenis Pemeriksaan** dari Master Pemeriksaan Patologi Anatomi.
8. **Single-select Jaringan Tubuh yang Diperoleh** dari daftar statis baseline v1.
9. **Keterangan Pungsi dan Lokalisasi opsional.**
10. **Diagnosis Klinik otomatis** dari asesmen pasien pada episode pelayanan.
11. **Informasi klinis pendukung** menggunakan daftar dan terminologi statis baseline v1.
12. **Tidak ada field klinis tambahan yang menjadi mandatory berdasarkan Jenis Pemeriksaan.**
13. **Deteksi duplikasi non-blocking** terhadap pemeriksaan sama pada order aktif di episode pelayanan yang sama.
14. **Alasan override duplikasi opsional.**
15. **Snapshot data master, demografi, episode, pemeriksaan, diagnosis, dan informasi klinis** saat order disimpan.
16. **Publikasi order ke Dashboard Laboratorium PA** dengan status awal Menunggu Konfirmasi Laboratorium.
17. **Audit trail** untuk pembuatan order dan override duplikasi.

### Out Scope

- Melihat daftar atau riwayat pemeriksaan Patologi Anatomi pada halaman order.
- Melihat detail order lama, Status Order, Status Hasil, atau Nomor PA dari halaman order.
- Fitur riwayat pemeriksaan penunjang gabungan untuk Laboratorium Klinik, Patologi Anatomi, Radiologi, dan Transfusi Darah; dibahas dalam PRD terpisah.
- Simpan Draft.
- Edit order pada proses konfirmasi, konfirmasi order, penerimaan spesimen, pembatalan order, dan seluruh lifecycle status setelah order masuk Dashboard Laboratorium PA; dibahas dalam PRD Dashboard/Konfirmasi Laboratorium PA.
- Pencetakan dan pemasangan label spesimen.
- Proses serah terima, penerimaan, penolakan, preparasi, pemeriksaan makroskopis/mikroskopis, dan workflow detail Dokter Spesialis PA.
- Entri, validasi, amendment, lihat hasil, download, dan cetak hasil pemeriksaan.
- Posting billing, tarif, klaim penjamin, dan pembentukan biaya. Order PA **tidak menimbulkan posting billing**.
- Pengelolaan Master Pemeriksaan Patologi Anatomi.

## 4. Goals and Metrics

### Tujuan

Menyediakan proses Order Patologi Anatomi yang lengkap, terstandarisasi, cepat, dan langsung terhubung ke Dashboard Laboratorium PA tanpa mencampurkan fungsi order dengan riwayat pemeriksaan penunjang.

### Metrik

| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu membuka form order | < 1 detik | NFR-001 |
| Waktu pencarian pemeriksaan | < 1 detik | NFR-002 |
| Waktu penyimpanan order | < 1 detik | NFR-003 |
| Order tersedia pada Dashboard PA | < 1 detik setelah simpan berhasil | NFR-004 |
| Kelengkapan field wajib | 100% order tersimpan lolos validasi mandatory | BR-007; BR-008; BR-010; BR-012 |
| Deteksi duplikasi | 100% order yang memenuhi kriteria menampilkan peringatan | BR-019–BR-023 |
| Audit aktivitas kritis | 100% aksi simpan dan override duplikasi tercatat | BR-026; NFR-009 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul / Domain | Peran terhadap Order Patologi Anatomi |
|----------------|----------------------------------------|
| Pelayanan Rawat Jalan | Menyediakan konteks pasien dan entry point **Order Penunjang Medis**. |
| Pelayanan Rawat Inap | Menyediakan konteks pasien, unit/bangsal, dan entry point **Order Penunjang Medis**. |
| Pelayanan IGD | Menyediakan konteks pasien dan entry point **Order Penunjang Medis**. |
| Asesmen Pasien / EMR | Sumber Diagnosis Klinik pada episode pelayanan aktif. |
| Master Pemeriksaan Patologi Anatomi | Sumber Jenis Pemeriksaan aktif yang dapat dicari dan dipilih lebih dari satu. |
| Master Staf / Dokter | Sumber DPJP/dokter login dan pilihan Dokter Pengirim pengganti. |
| Registrasi / Master Unit | Sumber episode, jenis pelayanan, unit, bangsal, dan penjamin. |
| Dashboard Laboratorium Patologi Anatomi | Menerima order yang berhasil disimpan dan melanjutkan proses konfirmasi serta lifecycle laboratorium. |
| Riwayat Pemeriksaan Penunjang | Menyediakan riwayat pemeriksaan gabungan melalui PRD terpisah; bukan bagian dari halaman Order PA. |
| Audit Trail | Menyimpan jejak pembuatan order dan override duplikasi. |

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter Pengirim | Primary | Membuat order, memilih pemeriksaan, mengisi data klinis, dan memutuskan melanjutkan order saat terdapat peringatan duplikasi. |
| Petugas Laboratorium PA | Konsumen proses | Menerima order pada Dashboard Laboratorium PA; seluruh aksi lanjutan berada pada PRD dashboard/konfirmasi. |
| Dokter Spesialis PA | Konsumen data | Menggunakan informasi klinis order pada proses pemeriksaan dan hasil yang dibahas dalam PRD terpisah. |
| Administrator | Tersier | Mengelola master dan permission; tidak melakukan aksi klinis tanpa role tambahan. |
| Auditor / Supervisor | Tersier | Meninjau audit trail sesuai kewenangan. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. Dokter membuka form Permintaan Pemeriksaan Patologi Anatomi dari konteks pasien.
2. Sistem menampilkan modal panjang dengan header pasien dan seluruh field klinis.
3. Dokter memilih Jenis Pemeriksaan dan satu Jaringan Tubuh yang Diperoleh.
4. Keterangan Pungsi dan Lokalisasi diwajibkan.
5. Dokter mengisi diagnosis, keterangan klinik, sitologi, keganasan, Pap Smear, kontrasepsi, radiasi, dan informasi pemeriksaan histopatologik sebelumnya.
6. Dokter menekan Simpan.
7. Data order diteruskan untuk diproses oleh Laboratorium PA.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. Dokter membuka pasien pada Rawat Jalan, Rawat Inap, atau IGD.
2. Dokter memilih **Order Penunjang Medis → Patologi Anatomi**.
3. Sistem langsung menampilkan form Order Pemeriksaan Patologi Anatomi dan header pasien dari episode pelayanan aktif.
4. Sistem mengisi otomatis Tanggal Pemeriksaan dengan tanggal hari ini, Dokter Pengirim dengan DPJP/dokter login, dan Diagnosis Klinik dari asesmen episode aktif.
5. Dokter dapat memilih tanggal mendatang, mengganti Dokter Pengirim, memilih satu atau lebih Jenis Pemeriksaan, serta memilih satu Jaringan Tubuh yang Diperoleh.
6. Dokter mengisi informasi klinis yang relevan. Keterangan Pungsi, Lokalisasi, dan informasi klinis pendukung tidak menjadi mandatory berdasarkan Jenis Pemeriksaan.
7. Dokter menekan **Simpan**.
8. Sistem memvalidasi field wajib dan memeriksa pemeriksaan sama pada order aktif di episode pelayanan yang sama.
9. Jika ditemukan duplikasi, sistem menampilkan peringatan. Dokter dapat kembali ke form atau tetap melanjutkan; alasan override bersifat opsional.
10. Setelah berhasil, sistem membuat Nomor Order PA `YYMMDDXXXX`, menyimpan snapshot order, menetapkan status awal **Menunggu Konfirmasi Laboratorium**, dan menampilkan order pada Dashboard Laboratorium PA.
11. Proses berikutnya—edit saat konfirmasi, konfirmasi, pembatalan, penerimaan spesimen, pemeriksaan, dan hasil—dilanjutkan pada modul/PRD Laboratorium PA terkait.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Entry point | Belum distandarkan dalam kebutuhan. | Order Penunjang Medis → Patologi Anatomi pada RJ, RI, dan IGD. |
| Halaman awal | Form order. | Langsung form order; tidak menampilkan riwayat pemeriksaan. |
| Keterangan Pungsi | Wajib. | Opsional. |
| Lokalisasi | Wajib. | Opsional. |
| Tanggal Pemeriksaan | Mengikuti input v1. | Default hari ini; tidak bisa backdate; future date diperbolehkan. |
| Dokter Pengirim | Input dokter. | Default DPJP/dokter login dan dapat diganti. |
| Jenis pemeriksaan | Pilihan belum terstruktur sebagai multiple selection. | Searchable multiple selection dari master aktif. |
| Jaringan tubuh | Single-select. | Tetap single-select dari daftar statis. |
| Diagnosis | Dipilih pada form. | Autofill dari asesmen pasien pada episode aktif. |
| Daftar klinis | Baseline v1. | Tetap statis dengan terminologi v1 yang telah dikonfirmasi. |
| Draft | Belum ditegaskan. | Tidak tersedia; Simpan langsung masuk Dashboard PA. |
| Duplikasi | Tidak ada validasi otomatis. | Diperiksa pada episode yang sama dan bersifat non-blocking. |
| Proses lanjutan | Tidak menjadi fokus form order. | Dikelola pada Dashboard/Konfirmasi Laboratorium PA. |
| Billing | Tidak dijelaskan. | Tidak ada posting billing dari Order PA. |

## 7. Main Flow / Mindmap

### Skenario 1 — Membuat Order Pemeriksaan Patologi Anatomi

1. Dokter membuka pasien pada pelayanan RJ, RI, atau IGD.
2. Dokter memilih **Order Penunjang Medis → Patologi Anatomi**.
3. Sistem menampilkan form order dan header pasien dari episode aktif.
4. Sistem mengisi default tanggal hari ini, DPJP/dokter login, dan Diagnosis Klinik dari asesmen episode aktif.
5. Dokter melengkapi field wajib dan informasi klinis yang relevan.
6. Dokter menekan **Simpan**.
7. Sistem menjalankan validasi form dan pemeriksaan duplikasi.
8. Sistem membuat Nomor Order PA, menyimpan snapshot, menetapkan status awal Menunggu Konfirmasi Laboratorium, dan meneruskan data ke Dashboard Laboratorium PA.
9. Sistem menampilkan notifikasi bahwa order berhasil disimpan dan dikirim ke Dashboard Laboratorium PA.

### Skenario 2 — Memilih Beberapa Jenis Pemeriksaan

1. Dokter membuka field Jenis Pemeriksaan.
2. Dokter mencari pemeriksaan berdasarkan nama atau kata kunci.
3. Sistem menampilkan item aktif dari Master Pemeriksaan PA.
4. Dokter memilih satu atau lebih item; setiap pilihan ditampilkan sebagai item/chip.
5. Sistem mencegah item yang sama dipilih dua kali.
6. Dokter dapat menghapus satu item atau mereset seluruh pilihan.
7. Sistem menolak penyimpanan apabila tidak terdapat minimal satu Jenis Pemeriksaan.

### Skenario 3 — Memilih Jaringan dan Mengisi Informasi Klinis

1. Dokter memilih tepat satu Jaringan Tubuh yang Diperoleh: Biopsi, Extirpasi, Operasi, Kerokan, atau Pungsi.
2. Dokter dapat mengosongkan Keterangan Pungsi dan Lokalisasi.
3. Sistem menampilkan Diagnosis Klinik dari asesmen episode aktif.
4. Dokter mengisi Keterangan Klinik, Sitologi Sediaan, Keganasan, Pap Smear, terapi, kontrasepsi, radiasi, atau informasi pemeriksaan histopatologik sebelumnya sesuai kondisi pasien.
5. Tidak ada field klinis yang menjadi mandatory hanya karena Jenis Pemeriksaan tertentu dipilih.
6. X-Ray, Endoskopi, dan Evaluasi Klinis memiliki default **Tidak Dilakukan**.

### Skenario 4 — Ditemukan Potensi Order Duplikat

1. Dokter menyimpan order yang memiliki minimal satu pemeriksaan sama dengan order aktif pada episode yang sama.
2. Sistem menampilkan informasi ringkas order referensi: Nomor Order, tanggal, pemeriksaan yang sama, dokter pengirim, unit/bangsal, dan status order.
3. Dokter memilih:
   - **Kembali/Ubah Order** — peringatan ditutup dan data form tetap dipertahankan.
   - **Tetap Lanjutkan** — order baru tetap dibuat; alasan dapat diisi tetapi tidak wajib.
4. Sistem mencatat order referensi, aktor, waktu, keputusan, dan alasan apabila diisi.
5. Informasi pada peringatan duplikasi tidak menjadi halaman riwayat dan tidak menyediakan navigasi untuk melihat seluruh pemeriksaan pasien.

### Skenario 5 — Penyimpanan atau Publikasi Gagal

1. Sistem gagal memvalidasi atau menyimpan order.
2. Sistem menampilkan pesan kesalahan yang spesifik dan mempertahankan seluruh input pengguna.
3. Nomor Order PA tidak dibuat apabila penyimpanan belum berhasil.
4. Sistem mencegah terbentuknya order ganda akibat pengguna melakukan retry.
5. Order dinyatakan berhasil setelah data tersimpan dan dapat diteruskan secara idempotent ke Dashboard Laboratorium PA.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Order PA hanya dapat dibuat dari episode pelayanan Rawat Jalan, Rawat Inap, atau IGD melalui menu **Order Penunjang Medis**. | FR-001 |
| **BR-002** | Saat fitur dibuka, sistem langsung menampilkan form order tanpa menampilkan daftar atau riwayat pemeriksaan pasien. | FR-001; FR-002 |
| **BR-003** | Sistem menampilkan data pasien, episode, unit, bangsal jika tersedia, dan penjamin dari konteks pelayanan; pengguna tidak menginput ulang data tersebut. | FR-002 |
| **BR-004** | Fitur tidak mendukung Simpan Draft. Aksi **Simpan** langsung meneruskan order ke Dashboard Laboratorium PA. | FR-009 |
| **BR-005** | Nomor Order PA dibuat setelah penyimpanan berhasil dengan format `YYMMDDXXXX`; `XXXX` adalah counter empat digit pada tanggal pembuatan order. | FR-003 |
| **BR-006** | Tanggal Pemeriksaan default hari ini, tidak boleh lebih kecil dari tanggal hari ini, dan boleh memilih tanggal mendatang. | FR-004 |
| **BR-007** | Dokter Pengirim wajib tersedia. Default adalah DPJP pada konteks pelayanan; apabila tidak tersedia, gunakan dokter login. Nilai dapat diganti dengan dokter aktif dari Master Staf sesuai hak akses. | FR-004 |
| **BR-008** | Minimal satu Jenis Pemeriksaan wajib dipilih dari Master Pemeriksaan PA yang aktif. | FR-005 |
| **BR-009** | Satu order dapat memuat lebih dari satu Jenis Pemeriksaan dan item yang sama tidak boleh dipilih dua kali. | FR-005 |
| **BR-010** | Jaringan Tubuh yang Diperoleh wajib dipilih tepat satu dari daftar statis: Biopsi, Extirpasi, Operasi, Kerokan, atau Pungsi. | FR-006 |
| **BR-011** | Keterangan Pungsi dan Lokalisasi bersifat opsional dan tidak menghalangi penyimpanan. | FR-006 |
| **BR-012** | Diagnosis Klinik wajib tersedia dan diisi otomatis dari asesmen pasien pada episode pelayanan yang sedang digunakan untuk membuat order. | FR-007 |
| **BR-013** | Apabila Diagnosis Klinik belum tersedia pada asesmen episode aktif, order tidak dapat disimpan dan sistem meminta pengguna melengkapi asesmen terlebih dahulu. | BR-012; FR-010 |
| **BR-014** | Keterangan Klinik dan seluruh informasi klinis pendukung tidak menjadi mandatory berdasarkan Jenis Pemeriksaan yang dipilih. | FR-008 |
| **BR-015** | Daftar Jaringan Tubuh, Sitologi Sediaan, status Keganasan, dan gejala Klinis bersifat statis pada aplikasi. | FR-006; FR-008 |
| **BR-016** | Terminologi baseline yang digunakan adalah Extirpasi, RPG/APG, Fornix Post Servix, Dinding, Vagina Liat, Flour, dan label “Operasi Tanggal”. | Data Requirements C |
| **BR-017** | X-Ray, Endoskopi, dan Evaluasi Klinis memiliki default **Tidak Dilakukan**. | FR-008 |
| **BR-018** | Tidak terdapat batas maksimum karakter pada level aturan bisnis untuk Keterangan Pungsi, Lokalisasi, Keterangan Klinik, terapi, kontrasepsi, informasi pemeriksaan sebelumnya, dan Informasi Klinis Lainnya. | Data Requirements B |
| **BR-019** | Pemeriksaan duplikasi hanya dilakukan terhadap order pada episode pelayanan yang sama dengan order baru. | FR-011 |
| **BR-020** | Status aktif untuk validasi duplikasi adalah Menunggu Konfirmasi Laboratorium, Dikonfirmasi, Spesimen Diterima, dan Sedang Diperiksa. | FR-011 |
| **BR-021** | Hasil Selesai dan Dibatalkan tidak memicu peringatan duplikasi aktif. | FR-011 |
| **BR-022** | Peringatan duplikasi bersifat non-blocking; dokter dapat tetap melanjutkan order. | FR-012 |
| **BR-023** | Alasan ketika memilih Tetap Lanjutkan bersifat opsional, tetapi keputusan override tetap dicatat. | FR-012 |
| **BR-024** | Setelah simpan berhasil, Status Order awal adalah **Menunggu Konfirmasi Laboratorium**. Lifecycle status setelahnya dikelola pada Dashboard/Konfirmasi Laboratorium PA. | FR-009; FR-013 |
| **BR-025** | Sistem menyimpan snapshot demografi, episode, unit/bangsal, penjamin, dokter, pemeriksaan, diagnosis, dan informasi klinis saat order dibuat agar data yang diterima Dashboard Laboratorium PA konsisten. | FR-014 |
| **BR-026** | Sistem mencatat audit untuk pembuatan order dan override duplikasi, meliputi aktor, waktu, order referensi, keputusan, dan alasan apabila tersedia. | FR-014 |
| **BR-027** | Order PA tidak menimbulkan posting billing pada saat disimpan. | Out Scope |
| **BR-028** | Fitur riwayat pemeriksaan PA, termasuk daftar pemeriksaan, detail order lama, Status Order, Status Hasil, Nomor PA, lihat hasil, dan download/cetak, berada pada PRD Riwayat Pemeriksaan Penunjang terpisah. | Out Scope |
| **BR-029** | Sistem mempertahankan seluruh input saat validasi gagal atau pengguna kembali dari peringatan duplikasi. | FR-010; FR-012 |
| **BR-030** | Hanya Dokter Pengirim atau user dengan permission klinis yang setara dapat membuat Order PA. Petugas Laboratorium PA menerima order melalui dashboard, bukan melalui form pelayanan. | FR-015 |

## 9. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Entry Point** — sistem menyediakan Order PA melalui **Order Penunjang Medis → Patologi Anatomi** pada pelayanan RJ, RI, dan IGD serta langsung membuka form order. | BR-001; BR-002 |
| **FR-002** | **Header Pasien** — sistem menampilkan Nomor RM, nama, tanggal lahir/umur, unit, bangsal bila tersedia, dan penjamin secara read-only. | BR-003 |
| **FR-003** | **Nomor Order** — sistem membuat Nomor Order PA unik dengan format `YYMMDDXXXX` setelah simpan berhasil. | BR-005 |
| **FR-004** | **Tanggal dan Dokter Pengirim** — sistem mengisi default tanggal hari ini dan DPJP/dokter login; tanggal tidak boleh backdate dan dokter dapat diganti dari master aktif. | BR-006; BR-007 |
| **FR-005** | **Jenis Pemeriksaan** — sistem mendukung search, multiple selection, hapus per item, reset, dan pencegahan item ganda dari Master Pemeriksaan PA aktif. | BR-008; BR-009 |
| **FR-006** | **Jaringan/Spesimen** — sistem menyediakan single-select Jaringan Tubuh statis serta Keterangan Pungsi dan Lokalisasi opsional. | BR-010; BR-011; BR-015 |
| **FR-007** | **Diagnosis Klinik** — sistem mengisi Diagnosis Klinik dari asesmen episode aktif dan mencegah penyimpanan apabila diagnosis belum tersedia. | BR-012; BR-013 |
| **FR-008** | **Informasi Klinis Pendukung** — sistem menyediakan Keterangan Klinik, Sitologi, Keganasan, Pap Smear, terapi, kontrasepsi, operasi, radiasi, informasi pemeriksaan histopatologik sebelumnya, dan informasi klinis lainnya menggunakan daftar statis baseline. | BR-014–BR-018 |
| **FR-009** | **Simpan Langsung** — sistem tidak menyediakan Draft; Simpan membuat order, menetapkan status awal Menunggu Konfirmasi Laboratorium, dan meneruskannya ke Dashboard Laboratorium PA. | BR-004; BR-024 |
| **FR-010** | **Validasi Form** — sistem memvalidasi field wajib, tanggal, referensi master, serta mempertahankan input saat validasi gagal. | BR-006; BR-008; BR-010; BR-012; BR-029 |
| **FR-011** | **Deteksi Duplikasi** — sistem membandingkan pemeriksaan order baru dengan order berstatus aktif pada episode pelayanan yang sama. | BR-019–BR-021 |
| **FR-012** | **Peringatan dan Override** — sistem menampilkan informasi ringkas order referensi, menyediakan Kembali/Ubah dan Tetap Lanjutkan, menyediakan alasan opsional, serta mencatat override tanpa membuka fitur riwayat. | BR-022; BR-023; BR-026 |
| **FR-013** | **Publikasi Dashboard** — order yang berhasil disimpan tampil pada Dashboard Laboratorium PA tanpa input ulang dan dapat diproses oleh petugas laboratorium. | BR-024 |
| **FR-014** | **Snapshot dan Audit** — sistem menyimpan snapshot order dan audit pembuatan/override untuk menjaga konsistensi data yang dikirimkan. | BR-025; BR-026 |
| **FR-015** | **Kontrol Akses** — sistem membatasi pembuatan order kepada Dokter Pengirim atau user dengan permission klinis yang setara. | BR-030 |
| **FR-016** | **Error Handling dan Idempotency** — sistem menampilkan pesan yang jelas, mempertahankan input, dan mencegah duplikasi akibat retry apabila validasi, penyimpanan, atau publikasi Dashboard PA gagal. | BR-029; NFR-005; NFR-006 |

## 10. User Stories

| ID | User Story | Acceptance Criteria (Given–When–Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **dokter pengirim**, saya ingin membuka form Order PA dari menu Order Penunjang Medis, sehingga saya dapat langsung membuat permintaan dari konteks pasien yang sedang dilayani. | Given pasien memiliki episode RJ/RI/IGD, When dokter memilih Order Penunjang Medis → Patologi Anatomi, Then form order dan header pasien tampil tanpa halaman riwayat. | FR-001; FR-002 |
| **US-002** | Sebagai **dokter pengirim**, saya ingin memperoleh default tanggal, dokter, dan diagnosis, sehingga pengisian order lebih cepat dan konsisten. | Given form baru dibuka, Then tanggal hari ini, DPJP/dokter login, dan diagnosis asesmen tampil. Given tanggal lampau dipilih, When disimpan, Then sistem menolak. Given tanggal mendatang dipilih, Then sistem menerima. | FR-004; FR-007; FR-010 |
| **US-003** | Sebagai **dokter pengirim**, saya ingin memilih beberapa pemeriksaan tetapi hanya satu cara perolehan jaringan, sehingga order sesuai kebutuhan klinis dan struktur spesimen. | Given master aktif tersedia, When dokter memilih beberapa pemeriksaan, Then seluruh pilihan tersimpan tanpa duplikasi. Given lebih dari satu Jaringan Tubuh dicoba, Then hanya satu nilai yang aktif. | FR-005; FR-006 |
| **US-004** | Sebagai **dokter pengirim**, saya ingin mengisi informasi klinis yang relevan tanpa mandatory kondisional berdasarkan pemeriksaan, sehingga form tidak menghambat pelayanan. | Given Keterangan Pungsi, Lokalisasi, atau informasi klinis pendukung kosong, When field wajib umum lengkap, Then order tetap dapat disimpan. | FR-006; FR-008 |
| **US-005** | Sebagai **dokter pengirim**, saya ingin diperingatkan tentang order aktif pada episode yang sama, sehingga saya dapat mencegah duplikasi tetapi tetap melanjutkan bila diperlukan. | Given pemeriksaan sama terdapat pada status aktif di episode yang sama, When Simpan dipilih, Then peringatan ringkas tampil. When Tetap Lanjutkan dipilih tanpa alasan, Then order tetap tersimpan dan override tercatat. | FR-011; FR-012 |
| **US-006** | Sebagai **petugas Laboratorium PA**, saya ingin order langsung tampil pada dashboard, sehingga tidak perlu input ulang. | Given order lolos validasi, When penyimpanan berhasil, Then Nomor Order dibuat, status Menunggu Konfirmasi ditetapkan, dan order tampil di Dashboard Laboratorium PA. | FR-003; FR-009; FR-013 |
| **US-007** | Sebagai **dokter pengirim**, saya ingin input tetap tersedia ketika penyimpanan gagal, sehingga saya tidak perlu mengisi ulang seluruh form. | Given penyimpanan atau publikasi gagal, When sistem menampilkan error, Then seluruh input tetap dipertahankan dan retry tidak membuat order ganda. | FR-016 |
| **US-008** | Sebagai **pengelola sistem**, saya ingin fitur order tidak menampilkan riwayat pemeriksaan, sehingga riwayat seluruh pemeriksaan penunjang dikelola konsisten melalui fitur terpisah. | Given dokter membuka Order PA, Then sistem hanya menampilkan form order dan tidak menampilkan daftar pemeriksaan lama, detail lama, status hasil, atau Nomor PA. | FR-001; BR-028 |

## 11. Data Requirements (Spesifikasi Field)

> Field demografi dan penjamin **reuse definisi kanonik dari Registrasi/Pelayanan dan Rekam Medis Neurovi v2**. Sistem menyimpan snapshot yang diperlukan agar data order yang diterima Dashboard Laboratorium PA tetap konsisten.

### A. Layar TAMPIL — Header Pasien

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nomor RM | Rekam Medis | Text | — | Read-only. |
| Nama Pasien | Rekam Medis | Nama lengkap + status pasien bila tersedia | — | Read-only. |
| Tanggal Lahir / Umur | Rekam Medis | Format standar header pasien | — | Read-only. |
| Unit Perawatan | Episode pelayanan | Nama unit | — | Read-only. |
| Bangsal | Episode Rawat Inap | Nama bangsal | — | Tampil jika tersedia; kosong untuk RJ/IGD. |
| Penjamin | Episode pelayanan | Nama penjamin | — | Read-only. |

### B. Layar INPUT — Form Order Pemeriksaan Patologi Anatomi

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| order_number | Nomor Order PA | text read-only | Dibuat sistem | `YYMMDDXXXX` | Sistem saat simpan berhasil | Sebelum simpan menampilkan placeholder “Dibuat otomatis”. |
| examination_date | Tanggal Pemeriksaan | date | Ya | Minimum hari ini; future date diperbolehkan | Default hari ini | Tidak boleh backdate. |
| referring_doctor_id | Dokter Pengirim | searchable lookup | Ya | Dokter aktif | Default DPJP; fallback dokter login | Dapat diganti sesuai permission. |
| examination_ids | Jenis Pemeriksaan | searchable multi-select | Ya | Minimal 1; tidak boleh duplikat | Master Pemeriksaan PA aktif | Mendukung search, hapus per item, dan reset. |
| tissue_acquisition_type | Jaringan Tubuh yang Diperoleh | single-select | Ya | Tepat satu nilai statis | — | Biopsi; Extirpasi; Operasi; Kerokan; Pungsi. |
| puncture_description | Keterangan Pungsi | text/textarea | Tidak | Tidak ada batas karakter bisnis | Manual | Opsional. |
| localization | Lokalisasi | text/textarea | Tidak | Tidak ada batas karakter bisnis | Manual | Opsional. |
| clinical_diagnosis | Diagnosis Klinik | read-only/autofill | Ya | Harus tersedia dari asesmen episode aktif | Asesmen pasien | Simpan kode dan snapshot deskripsi diagnosis. |
| clinical_notes | Keterangan Klinik | textarea | Tidak | Tidak ada batas karakter bisnis | Manual | Opsional. |
| cytology_specimen_types | Sitologi Sediaan | multi-checkbox | Tidak | Multi-pilih dari daftar statis | Tidak ada default | Nilai pada tabel C. |
| cytology_other_note | Keterangan Sitologi Lainnya | text/textarea | Kondisional | Diisi apabila Lainnya dipilih; tidak ada batas karakter bisnis | Manual | — |
| xray_status | X-Ray | radio | Tidak | Satu nilai statis | Default Tidak Dilakukan | — |
| endoscopy_status | Endoskopi | radio | Tidak | Satu nilai statis | Default Tidak Dilakukan | — |
| clinical_evaluation_status | Evaluasi Klinis | radio | Tidak | Satu nilai statis | Default Tidak Dilakukan | — |
| last_menstrual_period_date | Menstruasi Terakhir | date | Tidak | Tanggal valid | Manual | — |
| parity | Paritas (Pilih 1–10) | integer/select | Tidak | 1–10 | Manual | — |
| pregnancy_status | Hamil | segmented/radio | Tidak | Ya / Tidak | Manual | — |
| clinical_symptoms | Klinis | multi-checkbox | Tidak | Multi-pilih dari daftar statis | Manual | Nilai pada tabel C. |
| hormone_therapy | Terapi Hormon | text/textarea | Tidak | Tidak ada batas karakter bisnis | Manual | — |
| oral_contraception | Kontrasepsi Oral | text/textarea | Tidak | Tidak ada batas karakter bisnis | Manual | — |
| iud_contraception | Kontrasepsi IUD | text/textarea | Tidak | Tidak ada batas karakter bisnis | Manual | — |
| surgery_date | Operasi Tanggal | date | Tidak | Tanggal valid | Manual | Terminologi mengikuti baseline v1. |
| radiation_history | Radiasi | text/textarea | Tidak | Tidak ada batas karakter bisnis | Manual | — |
| radiation_date | Tanggal | date | Tidak | Tanggal valid | Manual | Tanggal radiasi. |
| previous_histopathology_flag | Penderita Pernah Dilakukan Pemeriksaan Histopatologik | boolean | Tidak | Ya / Tidak | Manual | Data klinis pendukung, bukan fitur riwayat pemeriksaan. |
| previous_histopathology_date | Tanggal Pemeriksaan Histopatologik | date | Kondisional | Tanggal valid | Manual | Diaktifkan apabila pernah. |
| previous_pa_number | No. PA Sebelumnya | text | Kondisional | Format mengikuti sumber nomor | Manual | Dapat diisi untuk referensi klinis pemeriksaan sebelumnya. |
| other_clinical_information | Informasi Klinis Lainnya | textarea | Tidak | Tidak ada batas karakter bisnis | Manual | — |

### C. Daftar Statis Baseline

| Kelompok | Nilai |
|----------|-------|
| Jaringan Tubuh yang Diperoleh | Biopsi; Extirpasi; Operasi; Kerokan; Pungsi |
| Sitologi Sediaan | LCS; Rongga Mulut; RPG/APG; Nasopharynx; Sputum; Cairan Pleura; Ascites; Urine; Fornix Post Servix; Dinding; Vagina Liat; Lainnya |
| X-Ray | Tidak Dilakukan; Positif; Negatif |
| Endoskopi | Tidak Dilakukan; Positif; Negatif; Inkonklusif |
| Evaluasi Klinis | Tidak Dilakukan; Positif; Negatif; Ganas |
| Klinis Pap Smear | Nyeri; Flour; Fluxus; Erosio; Suspect Ganas |

### D. Data yang Dibuat Otomatis saat Simpan

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| order_id | ID Order | UUID/internal ID | Sistem | Primary identifier internal. |
| order_number | Nomor Order PA | string | `YYMMDDXXXX` | Counter empat digit berdasarkan tanggal order. |
| patient_id | ID Pasien | reference | Konteks pasien | — |
| registration_id | ID Episode | reference | Episode aktif | Digunakan untuk validasi duplikasi. |
| service_type | Jenis Pelayanan | enum | RJ / RI / IGD | Snapshot. |
| patient_snapshot | Snapshot Demografi | object | Rekam Medis saat simpan | Minimal Nomor RM, nama, tanggal lahir, dan data demografi yang diperlukan. |
| episode_snapshot | Snapshot Episode | object | Registrasi saat simpan | Unit, bangsal, penjamin, dan informasi episode. |
| referring_doctor_snapshot | Snapshot Dokter Pengirim | object | Master Staf saat simpan | ID, nama, dan atribut identifikasi yang diperlukan. |
| examination_snapshots | Snapshot Jenis Pemeriksaan | array/object | Master Pemeriksaan saat simpan | Menjaga nama/kode order. |
| clinical_diagnosis_snapshot | Snapshot Diagnosis | object | Asesmen saat simpan | Kode dan deskripsi. |
| clinical_information_snapshot | Snapshot Informasi Klinis | object | Form order | Seluruh data klinis order. |
| order_status | Status Order Awal | enum | Menunggu Konfirmasi Laboratorium | Status setelah Simpan. |
| duplicate_detected | Duplikasi Terdeteksi | boolean | Hasil validasi | — |
| duplicate_reference_order_ids | Referensi Order Duplikat | array nullable | Hasil validasi | Hanya order pada episode yang sama. |
| duplicate_override | Override Duplikasi | boolean | Aksi dokter | — |
| duplicate_override_reason | Alasan Override | text nullable | Input opsional | Tidak wajib. |
| duplicate_override_by | Pelaku Override | user reference nullable | User login | Audit. |
| duplicate_override_at | Waktu Override | datetime nullable | Waktu server | Audit. |
| created_by | Dibuat Oleh | user reference | User login | Audit. |
| created_at | Dibuat Pada | datetime | Waktu server | Menjadi Tanggal Order. |
| dashboard_publication_status | Status Publikasi Dashboard | enum/internal | Sistem | Digunakan untuk retry dan monitoring teknis; tidak tampil pada form klinis. |

### E. Data Peringatan Duplikasi

| Field Tampilan | Sumber | Catatan |
|----------------|--------|---------|
| Nomor Order PA | Order aktif pada episode sama | Wajib tampil. |
| Tanggal Order/Pemeriksaan | Order referensi | Wajib tampil. |
| Pemeriksaan yang sama | Irisan examination IDs | Item yang sama disorot. |
| Dokter Pengirim | Snapshot order referensi | — |
| Unit/Bangsal | Snapshot episode | — |
| Status Order | Status terkini | Harus termasuk status aktif. |
| Alasan Tetap Lanjutkan | Input pengguna | Opsional. |
| Aksi | Kembali/Ubah; Tetap Lanjutkan | Peringatan non-blocking. |

> Informasi peringatan duplikasi hanya mendukung keputusan saat membuat order dan tidak menggantikan fitur Riwayat Pemeriksaan Penunjang.

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Form Order PA terbuka < 1 detik pada kondisi layanan normal. | Metrik |
| **NFR-002** | Performa | Pencarian Master Pemeriksaan memberi hasil < 1 detik. | Metrik |
| **NFR-003** | Performa | Penyimpanan order selesai < 1 detik pada kondisi layanan normal. | Metrik |
| **NFR-004** | Real-Time | Order tampil pada Dashboard Laboratorium PA < 1 detik setelah simpan berhasil. | Metrik; FR-013 |
| **NFR-005** | Reliabilitas | Penyimpanan order dan publikasi Dashboard PA tidak boleh menghasilkan duplikasi akibat retry; proses harus idempotent berdasarkan order_id. | FR-016 |
| **NFR-006** | Reliabilitas | Kegagalan data pasien, asesmen, master, simpan, atau publikasi harus menghasilkan pesan yang jelas dan tidak menghilangkan input pengguna. | FR-016 |
| **NFR-007** | Keamanan/RBAC | Pembuatan order hanya tersedia untuk role/permission klinis yang ditetapkan dan seluruh akses data mengikuti konteks pelayanan pasien. | FR-015 |
| **NFR-008** | Privasi | Data klinis tidak boleh dicatat berlebihan pada application log dan hanya dapat diakses oleh user berwenang. | Domain klinis |
| **NFR-009** | Auditabilitas | Pembuatan order dan override duplikasi mencatat aktor, waktu, serta data referensi yang relevan. | FR-014 |
| **NFR-010** | Konsistensi | Data yang dikirim ke Dashboard Laboratorium PA menggunakan snapshot order sehingga perubahan master tidak mengubah isi order yang telah dibuat. | BR-025 |
| **NFR-011** | Usability | Form panjang dikelompokkan menggunakan section/step/tab/accordion dengan error summary dan posisi field error yang jelas. | Pain point UX |
| **NFR-012** | Aksesibilitas | Status pilihan dan error tidak hanya dibedakan berdasarkan warna; kontrol mendukung keyboard dan focus state. | Standar UI Neurovi v2 |
| **NFR-013** | Data | Field teks tanpa batas karakter bisnis menggunakan tipe penyimpanan yang mendukung teks panjang tanpa memotong data. | BR-018 |
| **NFR-014** | Skalabilitas | Angka beban uji akan ditetapkan setelah volume harian dan concurrent user tersedia. | Pertanyaan Terbuka |
| **NFR-015** | Separation of Concern | Form Order PA tidak memuat daftar riwayat, detail order lama, status hasil, atau aksi hasil; seluruh kapabilitas tersebut berada pada fitur terpisah. | BR-028 |

## 13. Integrasi Internal & Dependency

| Integrasi | Fungsi | Status | Trace |
|-----------|--------|--------|-------|
| **Order Penunjang Medis RJ/RI/IGD** | Entry point dan konteks episode pasien. | Internal | FR-001 |
| **Registrasi/Pelayanan** | Menyediakan pasien, episode, unit, bangsal, dan penjamin. | Internal | FR-002 |
| **Master Staf/Dokter** | Menyediakan default dan pilihan Dokter Pengirim. | Internal | FR-004 |
| **Master Pemeriksaan PA** | Menyediakan Jenis Pemeriksaan aktif. | Internal | FR-005 |
| **Asesmen/EMR** | Menyediakan Diagnosis Klinik episode aktif. | Internal | FR-007 |
| **Dashboard Laboratorium PA** | Menerima order yang berhasil disimpan dan melanjutkan proses konfirmasi/lifecycle laboratorium. | Internal / hard dependency | FR-009; FR-013 |
| **Order/Status PA Service** | Menyediakan data order aktif pada episode yang sama untuk validasi duplikasi. | Internal | FR-011 |
| **Riwayat Pemeriksaan Penunjang** | Menyediakan riwayat gabungan Laboratorium Klinik, PA, Radiologi, dan Transfusi Darah melalui PRD terpisah. | Internal / di luar scope | BR-028 |
| **Audit Trail** | Menyimpan aktivitas pembuatan order dan override duplikasi. | Internal / hard dependency | FR-014 |
| **Billing** | Tidak menerima posting biaya dari Order PA. | Tidak ada integrasi posting | BR-027 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Registrasi/Pelayanan RJ, RI, IGD | Hard | Order tidak memiliki konteks pasien dan episode. |
| Asesmen Pasien | Hard | Diagnosis Klinik tidak tersedia dan order tidak dapat disimpan. |
| Master Pemeriksaan PA | Hard | Jenis Pemeriksaan tidak dapat dipilih. |
| Master Staf/Dokter | Hard | Dokter Pengirim tidak dapat divalidasi/diganti. |
| Dashboard Laboratorium PA | Hard | Order tidak dapat diteruskan untuk proses laboratorium. |
| Sumber Status Order Aktif | Hard untuk validasi duplikasi | Sistem tidak dapat menentukan pemeriksaan aktif pada episode yang sama. |
| Audit Trail | Hard | Aktivitas simpan dan override tidak dapat ditelusuri secara memadai. |
| PRD Riwayat Pemeriksaan Penunjang | Tidak memblokir order | Tidak memengaruhi pembuatan Order PA; hanya memengaruhi akses riwayat pemeriksaan pada fitur terpisah. |

## 14. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Dokter mengabaikan peringatan duplikasi dan membuat order yang tidak diperlukan. | Tampilkan informasi order aktif secara ringkas dan catat keputusan override. |
| R2 | Edit terminologi daftar statis membutuhkan perubahan aplikasi. | Validasi daftar bersama stakeholder klinis dan perlakukan perubahan sebagai perubahan requirement/release. |
| R3 | Counter empat digit melebihi kapasitas apabila order harian > 9.999. | Tetapkan monitoring kapasitas dan evaluasi format setelah volume aktual tersedia. |
| R4 | Field tanpa batas karakter menghasilkan payload sangat besar. | Gunakan tipe text, validasi keamanan input, dan monitoring ukuran payload tanpa memotong data bisnis. |
| R5 | Order tersimpan tetapi gagal tampil pada Dashboard PA. | Gunakan transaksi/outbox, retry idempotent, dan status publikasi yang dapat dipantau secara teknis. |
| R6 | Default dokter salah karena DPJP tidak tersedia atau tidak sesuai. | Gunakan fallback dokter login dan izinkan penggantian dari master aktif. |
| R7 | User mencari riwayat pemeriksaan pada halaman order setelah fitur dipisahkan. | Tampilkan entry point/shortcut riwayat hanya pada fitur Pemeriksaan Penunjang sesuai PRD terpisah, bukan pada form Order PA. |
| R8 | Validasi duplikasi bergantung pada status dari proses laboratorium yang belum sinkron. | Tetapkan source of truth status order dan gunakan query/event yang konsisten serta idempotent. |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-001 | Entry point | Menu **Order Penunjang Medis** pada RJ, RI, dan IGD. |
| D-002 | Fokus halaman | Halaman langsung menampilkan form Order PA dan tidak menampilkan riwayat pemeriksaan. |
| D-003 | Draft | Tidak ada Draft; Simpan langsung masuk Dashboard Laboratorium PA. |
| D-004 | Nomor Order | `YYMMDDXXXX`, dengan `XXXX` sebagai counter empat digit. |
| D-005 | Tanggal Pemeriksaan | Default hari ini; tidak bisa backdate; future date diperbolehkan. |
| D-006 | Dokter Pengirim | Default DPJP/dokter login dan dapat diganti. |
| D-007 | Jaringan Tubuh | Single-select. |
| D-008 | Daftar klinis | Jaringan, Sitologi, Keganasan, dan gejala Klinis bersifat statis. |
| D-009 | Terminologi v1 | Extirpasi, RPG/APG, Fornix Post Servix, Dinding, Vagina Liat, Flour, dan “Operasi Tanggal” dinyatakan benar. |
| D-010 | Batas karakter | Tidak ada batas maksimum karakter pada aturan bisnis. |
| D-011 | Diagnosis Klinik | Autofill dari asesmen pasien pada episode aktif. |
| D-012 | Mandatory kondisional | Tidak ada field klinis wajib berdasarkan Jenis Pemeriksaan. |
| D-013 | Default Keganasan | X-Ray, Endoskopi, dan Evaluasi Klinis default Tidak Dilakukan. |
| D-014 | Cakupan duplikasi | Hanya episode pelayanan yang sama. |
| D-015 | Status aktif duplikasi | Menunggu Konfirmasi, Dikonfirmasi, Spesimen Diterima, Sedang Diperiksa. |
| D-016 | Status yang tidak memicu duplikasi | Hasil Selesai dan Dibatalkan. |
| D-017 | Alasan override | Opsional. |
| D-018 | Snapshot | Sistem menyimpan snapshot data master, demografi, episode, diagnosis, dan informasi klinis saat order dibuat. |
| D-019 | Billing | Order PA tidak menimbulkan posting billing. |
| D-020 | Riwayat pemeriksaan | Dihapus dari fitur Order PA dan digabung dengan Laboratorium Klinik, Radiologi, serta Transfusi Darah melalui PRD Riwayat Pemeriksaan Penunjang terpisah. |
| D-021 | Proses setelah order | Edit, konfirmasi, pembatalan, status proses, dan hasil berada pada PRD Dashboard/Konfirmasi/Hasil Laboratorium PA terkait. |
| D-022 | RBAC baseline | Order dibuat oleh Dokter Pengirim atau user dengan permission klinis setara; petugas Lab PA menjadi konsumen order melalui dashboard. |

## 16. Asumsi

- Tidak terdapat asumsi bisnis utama yang masih terbuka terkait pemisahan fitur riwayat. Halaman Order PA hanya berfokus pada pembuatan order sampai order tersedia pada Dashboard Laboratorium PA.
- Sumber status order aktif untuk validasi duplikasi tersedia dari layanan order/Dashboard Laboratorium PA tanpa mengharuskan halaman order menampilkan riwayat pemeriksaan.

## 17. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 (Draft) | 19 Juli 2026 | Team Product — Tamtech International | Penyusunan awal berdasarkan kebutuhan dan referensi visual Neurovi v1. |
| 1.1 (Draft — Revisi pasca-konfirmasi) | 20 Juli 2026 | Team Product — Tamtech International | Menetapkan entry point, tanpa Draft, format nomor order, aturan tanggal, default dokter, single-select jaringan, daftar statis, diagnosis asesmen, duplikasi per episode, lifecycle status, edit saat konfirmasi, pembatalan sebelum konfirmasi, no billing, hasil terpisah, snapshot, dan matriks RBAC baseline. |
| 1.2 (Draft — Pemisahan fitur riwayat pemeriksaan) | 20 Juli 2026 | Team Product — Tamtech International | Menghapus seluruh kapabilitas melihat riwayat/status/hasil dari fitur Order PA, memindahkannya ke PRD Riwayat Pemeriksaan Penunjang gabungan, dan memfokuskan dokumen pada pembuatan order sampai tersedia pada Dashboard Laboratorium PA. |
