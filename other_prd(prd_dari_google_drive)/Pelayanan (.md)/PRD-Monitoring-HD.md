# PRD — Monitoring Hemodialisa

**Related Document:** Mockup-Monitoring-HD-v2.0.html (referensi visual); PRD Asesmen Hemodialisa (Perawat & Dokter HD) — hard dependency; PRD Order Hemodialisa — hard dependency (trigger pembuatan periode monitoring baru); Referensi V1 — Monitoring Hemodialisa Neurovi v1
**Dokumen ID:** PRD-P-MON-HD-v2.0  ·  **Versi:** 2.4 (Draft — Revisi pasca-feedback)
**Tanggal Disusun:** 13 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Modul Monitoring Hemodialisa digunakan oleh perawat hemodialisa untuk mencatat parameter observasi pasien selama tindakan hemodialisa berlangsung, dalam satu episode pelayanan. Pada Neurovi v1, pencatatan monitoring HD dilakukan sebagai satu rangkaian data tunggal per episode pelayanan, sehingga kurang fleksibel bila dalam satu episode pelayanan yang sama diperlukan lebih dari satu periode tindakan monitoring.

Untuk Fase 1 MVP, Neurovi v2 menegaskan lingkup pada tiga fokus utama: (a) mendukung pencatatan lebih dari satu periode monitoring HD dalam satu episode pelayanan tanpa menimpa data periode sebelumnya, (b) meningkatkan keterbacaan data monitoring secara real-time melalui optimasi tampilan tabel dan penambahan kolom Keterangan langsung pada tabel, serta (c) menghadirkan riwayat monitoring yang dapat diakses dan dipindah-pindah dengan mudah oleh perawat selama tindakan berlangsung.

> Referensi: Mockup-Monitoring-HD-v2.0.html.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — Draft user:
- Pencatatan monitoring HD dilakukan dalam satu rangkaian data per episode pelayanan.
- Belum ada dukungan pencatatan lebih dari satu periode monitoring dalam episode pelayanan yang sama.
- Layar monitoring memiliki whitespace berlebih, menyisakan area tabel observasi yang sempit.
- Kolom Keterangan tidak tampil langsung di tabel — perawat harus membuka (expand) tiap baris untuk melihat catatan klinis, memperlambat pembacaan saat tindakan berlangsung.
- Tidak ada daftar Riwayat Monitoring; karena hanya ada satu monitoring per episode, kebutuhan berpindah antar periode belum relevan di v1.

**Masalah/pain point:**
- Aspek bisnis proses: sistem belum mendukung kebutuhan mencatat lebih dari satu periode monitoring HD dalam satu episode pelayanan, padahal kondisi klinis pasien dapat memerlukan lebih dari satu sesi observasi terpisah.
- Aspek UX: tampilan halaman monitoring memiliki whitespace yang cukup besar sehingga area tabel observasi menjadi sempit; catatan klinis (Keterangan) tidak langsung terlihat pada tabel tanpa membuka detail baris; belum ada tampilan riwayat monitoring untuk berpindah antar periode.
- Aspek logic system: pembuatan monitoring baru berisiko menimpa (overwrite) data monitoring yang sudah ada karena belum ada pemisahan record per periode.

**Dampak utama yang disasar v2:**
- Fleksibilitas pencatatan monitoring untuk kondisi pasien yang memerlukan lebih dari satu periode observasi dalam satu episode pelayanan · Keterbacaan data monitoring yang lebih baik secara real-time · Efisiensi tampilan layar bagi perawat hemodialisa.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = seluruh kapabilitas yang dijabarkan pada dokumen ini (multiple monitoring, riwayat monitoring, optimasi layout, keterangan pada tabel, ringkasan monitoring & ringkasan Total UF, monitoring header).

> Behavior: jumlah pasien hemodialisa per hari sekitar 30–50 pasien. Ekspektasi: input dan update data monitoring hemodialisa oleh perawat < 1 detik.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Multiple Monitoring HD** — sistem mendukung lebih dari satu periode monitoring HD dalam satu episode pelayanan; setiap periode monitoring baru dibuat secara otomatis oleh sistem ketika pasien di-order ke hemodialisa (trigger dari fitur Order Hemodialisa — PRD terpisah), menghasilkan record terpisah tanpa menimpa data monitoring sebelumnya.
2. **Riwayat Monitoring** — daftar seluruh periode monitoring HD pada episode pelayanan yang sama, dilengkapi tanggal dan waktu, agar perawat dapat berpindah antar periode.
3. **Optimasi Layout** — pengurangan whitespace pada halaman agar area tabel monitoring tampil lebih luas.
4. **Keterangan langsung pada tabel** — kolom Keterangan ditampilkan langsung pada baris tabel monitoring tanpa perlu membuka (expand) detail entri.
5. **Ringkasan Monitoring & Ringkasan Total UF** — tampilan Jumlah UF, Jumlah Intake, dan Total UF per periode monitoring, dihitung dan diperbarui secara real-time.
6. **Monitoring Header** — informasi periode monitoring aktif (nomor monitoring, waktu pelaksanaan, status) ditampilkan pada header layar.
7. **Sticky table header** — header tabel parameter monitoring tetap terlihat saat perawat melakukan scroll pada data observasi.
8. **Validasi prasyarat asesmen saat Simpan** — sistem memeriksa kelengkapan Asesmen Perawat HD dan Asesmen Dokter HD pada episode pelayanan saat tombol Simpan monitoring ditekan; monitoring tidak tersimpan dan sistem menampilkan pop-up peringatan bila asesmen belum lengkap.

### Out Scope
- Perubahan alur pelayanan hemodialisa itu sendiri — tidak terdapat perubahan alur pada versi ini.
- Modul Asesmen Hemodialisa (Perawat & Dokter HD) — PRD terpisah, hanya menjadi prasyarat/dependency di sini.
- Fitur Order Hemodialisa (proses order pasien ke hemodialisa yang memicu pembuatan periode monitoring baru) — PRD terpisah, hanya menjadi event source/dependency di sini.
- Modul Tindakan, Surat, Penunjang, dan Resep yang diakses melalui tombol pintasan pada layar monitoring — PRD terpisah.

## 4. Goals and Metrics

### Tujuan
Meningkatkan fleksibilitas pencatatan monitoring tindakan hemodialisa dengan mendukung pencatatan beberapa periode monitoring dalam satu episode pelayanan, meningkatkan keterbacaan data monitoring secara real-time, serta mengoptimalkan tampilan agar lebih efisien dan mudah digunakan oleh perawat hemodialisa.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu input/update data monitoring per entri | < 1 detik | NFR-001 |
| Kapasitas operasional harian | 30–50 pasien hemodialisa/hari | Behavior (Performance Expectation) |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Asesmen Hemodialisa (Perawat & Dokter HD) | Prasyarat wajib — divalidasi saat Simpan monitoring. |
| Order Hemodialisa | Event source — memicu pembuatan periode monitoring baru pada episode pelayanan yang sama. |
| Rekam Medis Pasien | Konsumen data — seluruh monitoring disimpan sebagai bagian rekam medis pasien. |
| Input Tindakan / Buat Surat / Pilih Penunjang / Buat Resep | Diakses melalui tombol pintasan pada layar monitoring, di luar lingkup detail modul ini. |

Dependency lintas modul: **Asesmen Hemodialisa (Perawat & Dokter HD)**, **Order Hemodialisa**, **Rekam Medis Pasien**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Perawat Hemodialisa | Primary | Menginput, mengubah, dan menyimpan data monitoring HD selama tindakan berlangsung. |
| Dokter HD | Secondary | Melengkapi Asesmen Dokter HD sebagai prasyarat penyimpanan monitoring. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
Monitoring HD dicatat sebagai satu rangkaian data per episode pelayanan; belum ada pemisahan menjadi beberapa periode monitoring dalam episode yang sama.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Pasien di-order ke hemodialisa melalui fitur Order Hemodialisa (PRD terpisah); sistem membuat periode monitoring baru secara otomatis pada episode pelayanan yang sama.
2. Perawat membuka layar Monitoring Hemodialisa dan mencatat entri observasi pada periode monitoring aktif.
3. Perawat dapat mencentang checkbox Post-HD pada form entri untuk menutup periode monitoring; sistem menampilkan pop-up konfirmasi sebelum status berubah menjadi Selesai.
4. Perawat dapat berpindah antar periode monitoring melalui daftar Riwayat Monitoring untuk melihat atau melanjutkan pencatatan.
5. Perawat menyimpan data monitoring; sistem memvalidasi kelengkapan Asesmen Perawat HD dan Asesmen Dokter HD saat tombol Simpan ditekan — bila belum lengkap, sistem menampilkan pop-up peringatan dan data tidak tersimpan; bila sudah lengkap, seluruh entri, Penyulit Selama HD, dan Discharge Planning tersimpan sebagai bagian rekam medis pasien.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Jumlah periode monitoring per episode | Satu rangkaian data tunggal | Mendukung lebih dari satu periode monitoring, masing-masing sebagai record terpisah |
| Pemicu periode monitoring baru | Tidak relevan (hanya satu monitoring per episode) | Otomatis via trigger order HD dari fitur Order Hemodialisa (PRD terpisah), bukan aksi manual pada layar Monitoring HD |
| Kolom Keterangan | Perlu dibuka (expand) untuk dilihat | Tampil langsung pada tabel |
| Riwayat monitoring | Belum ada tampilan riwayat khusus (hanya satu monitoring per episode) | Daftar Riwayat Monitoring dengan tanggal & waktu per periode |
| Header informasi monitoring | Belum ada | Menampilkan nomor, waktu pelaksanaan, dan status monitoring aktif |
| Perilaku scroll tabel | Header tabel tidak sticky | Sticky table header |

## 7. Main Flow / Mindmap

### Skenario 1 — Pencatatan monitoring pada periode pertama (alur normal)
1. Perawat membuka fitur Monitoring HD.
2. Perawat membuat episode monitoring pertama.
3. Perawat menambahkan entri observasi sesuai waktu pelaksanaan; entri pertama otomatis ditandai Pra-HD.
4. Sistem menghitung ulang Jumlah UF, Jumlah Intake, dan Total UF setiap kali entri ditambah/diubah/dihapus.
5. Perawat menambahkan inputan Penyulit Selama HD dan Discharge Planning.
6. Perawat menyimpan monitoring.
7. Sistem memeriksa kelengkapan Asesmen Perawat HD dan Asesmen Dokter HD; bila belum lengkap, sistem menampilkan pop-up peringatan dan data tidak tersimpan; bila sudah lengkap, data tersimpan sebagai bagian rekam medis pasien.

### Skenario 2 — Pembuatan periode monitoring baru (trigger dari fitur Order Hemodialisa)
1. Pasien di-order ke hemodialisa melalui fitur Order Hemodialisa (PRD terpisah).
2. Sistem membuat periode monitoring baru pada episode pelayanan yang sama, dengan nomor urut berikutnya dan status Berlangsung.
3. Status periode monitoring lain tidak berubah secara otomatis akibat pembuatan periode baru ini; perubahan status Berlangsung → Selesai hanya terjadi melalui checkbox Post-HD (lihat Skenario 3).
4. Perawat mencatat entri observasi pada periode monitoring baru secara independen dari periode-periode lain.

### Skenario 3 — Penyelesaian periode monitoring via checkbox Post-HD
1. Perawat mencentang checkbox "Post-HD" pada form entri monitoring HD (elemen tunggal di dalam form entri, bukan elemen terpisah).
2. Sistem menampilkan pop-up konfirmasi ("Apakah Anda yakin?") sebelum melanjutkan.
3. Jika perawat mengonfirmasi, sistem menandai periode monitoring (sesi) terkait sebagai berstatus Selesai; seluruh entri pada periode tersebut menjadi tidak dapat diubah maupun dihapus.
4. Jika perawat membatalkan, checkbox Post-HD kembali tidak tercentang dan periode monitoring tetap berstatus Berlangsung.

### Skenario 4 — Prasyarat asesmen belum lengkap saat Simpan
1. Perawat membuka Monitoring HD pada episode pelayanan yang Asesmen Perawat HD dan Asesmen Dokter HD-nya belum diinput.
2. Perawat menginput data monitoring — baik pada periode monitoring pertama maupun periode monitoring berikutnya dalam episode pelayanan yang sama.
3. Ketika perawat menekan Simpan, sistem memeriksa apakah Asesmen Perawat HD dan Asesmen Dokter HD sudah diinput, terlepas dari periode monitoring keberapa yang sedang disimpan.
4. Jika belum, sistem menampilkan pop-up peringatan dan data monitoring tidak tersimpan.
5. Jika sudah, data monitoring berhasil disimpan.

### Skenario 5 — Ubah/hapus entri yang sudah ditambahkan
1. Perawat memilih entri pada tabel monitoring dan menekan aksi Ubah — hanya tersedia saat monitoring berstatus Berlangsung.
2. Perawat menekan aksi Hapus yang ditampilkan berdampingan dengan aksi Ubah pada setiap baris — aksi ini juga hanya aktif selama monitoring berstatus Berlangsung.
3. Ketika status monitoring menjadi Selesai (dipicu checklist Post-HD), tombol Ubah dan Hapus pada seluruh entri periode tersebut menjadi tidak aktif.
4. Sistem menghitung ulang Jumlah UF, Jumlah Intake, dan Total UF setelah perubahan/penghapusan entri.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Field observasi QB, UF, Sistol, Diastol, Nadi, Suhu, Respirasi, NaCl, Dextrose, Makan/Minum, dan Lain-lain wajib diisi pada setiap entri monitoring; entri tidak dapat ditambahkan bila salah satu field tersebut kosong. | Draft user (catatan 1); FR-004 |
| **BR-002** | Field Keterangan bersifat opsional pada entri monitoring. | Draft user (catatan 2) |
| **BR-003** | Field Waktu wajib diisi pada setiap entri, dengan default waktu sistem saat form entri dibuka dan dapat diubah manual oleh user. | Mockup |
| **BR-004** | Checkbox "Post-HD" merupakan satu elemen dalam form entri monitoring HD. Ketika dicentang, sistem menampilkan pop-up konfirmasi ("Apakah Anda yakin?"); jika dikonfirmasi, periode monitoring (sesi) terkait berubah status menjadi Selesai. Jika dibatalkan, checkbox kembali tidak tercentang dan status tetap Berlangsung. | Draft user (catatan 3); dikonfirmasi user |
| **BR-005** | Periode monitoring baru dibuat secara otomatis oleh sistem ketika pasien di-order ke hemodialisa melalui fitur Order Hemodialisa (PRD terpisah), bukan melalui aksi manual pada layar Monitoring HD. Setiap periode monitoring baru merupakan record terpisah dengan identitas dan histori masing-masing, tanpa overwrite periode monitoring yang sudah ada. | Dikonfirmasi user; Draft user (Expected Improvement) |
| **BR-006** | Transisi status monitoring dari Berlangsung menjadi Selesai hanya dipicu oleh checkbox Post-HD yang dicentang dan dikonfirmasi pada form entri (BR-004); pembuatan periode monitoring baru (BR-005) tidak mengubah status periode monitoring lain. | Dikonfirmasi user |
| **BR-007** | Entri pertama pada setiap periode monitoring otomatis ditandai sebagai Pra-HD tanpa input manual user. | Mockup |
| **BR-008** | Entri pada tabel monitoring diurutkan berdasarkan waktu observasi secara ascending. | Mockup |
| **BR-009** | Entri hanya dapat diubah dan dihapus selama monitoring berstatus Berlangsung. Ketika status berubah menjadi Selesai (dipicu checklist Post-HD sesuai BR-004/BR-006), seluruh entri pada periode tersebut tidak dapat diubah maupun dihapus. | Dikonfirmasi user (menggantikan ketentuan pada versi 2.1/2.2 yang masih mengizinkan ubah entri saat Selesai) |
| **BR-010** | Sistem memvalidasi kelengkapan Asesmen Perawat HD dan Asesmen Dokter HD pada episode pelayanan saat tombol Simpan monitoring ditekan — berlaku untuk periode monitoring manapun (pertama maupun berikutnya) dalam episode pelayanan yang sama. Jika belum lengkap, sistem menampilkan pop-up peringatan dan data monitoring tidak tersimpan. Jika sudah lengkap, data monitoring tersimpan sebagai bagian rekam medis pasien. | Draft user (catatan 9); dikonfirmasi user |
| **BR-011** | Status monitoring terdiri dari dua nilai: Berlangsung dan Selesai. | Draft user (catatan 7) |
| **BR-012** | Jumlah UF dihitung sebagai penjumlahan (kumulatif) nilai UF dari seluruh entri pada periode monitoring tersebut — setiap entri baru menambah nilai Jumlah UF sebelumnya. | Dikonfirmasi user |
| **BR-013** | Jumlah Intake dihitung sebagai penjumlahan NaCl + Dextrose + Makan/Minum + Lain-lain dari seluruh entri pada periode monitoring tersebut. | Draft user; dikonfirmasi user |
| **BR-014** | Total UF = Jumlah UF − Jumlah Intake. | Dikonfirmasi user |
| **BR-015** | Field Penyulit Selama HD berupa multiple select dengan pilihan: Masalah Akses, Hipertensi, Pendarahan, Nyeri Dada, First Use Syndrome, Anemia, Sakit Kepala, Gagal Ginjal, Mual dan Muntah, Demam, Kram, Menggigil Dingin, Hipotensi. | Draft user (catatan 5) |
| **BR-016** | Field Penyulit Selama HD dan Discharge Planning bersifat opsional. | Draft user (catatan 8) |
| **BR-017** | Perhitungan Jumlah UF, Jumlah Intake, dan Total UF dilakukan secara independen per periode monitoring. | Draft user (Expected Improvement — Logic System) |

## 9. State Machine

### 9.1 Status Monitoring
| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Berlangsung | Badge biru | Periode monitoring aktif; entri dapat ditambah, diubah, dan dihapus. |
| Selesai | Badge hijau | Periode monitoring telah ditutup melalui checkbox Post-HD; seluruh entri pada periode ini tidak dapat diubah maupun dihapus. |

- **Transisi:** Berlangsung → Selesai, hanya dipicu oleh checkbox "Post-HD" yang dicentang dan dikonfirmasi pada form entri (BR-004, BR-006). Pembuatan periode monitoring baru (trigger order HD, BR-005) tidak memengaruhi status periode monitoring lain.
- **Perubahan belum tersimpan:** selain status Berlangsung/Selesai, sistem juga menandai kondisi "ada perubahan belum disimpan" pada periode monitoring yang sedang diedit, hingga user menekan Simpan.

### 9.2 Penanda Pra-HD per Entri
Entri pertama pada setiap periode monitoring otomatis diberi penanda Pra-HD (BR-007); entri berikutnya tidak diberi penanda ini. Penanda ini bersifat informatif dan tidak memengaruhi status periode monitoring.

## 10. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Elemen checkbox "Post-HD" | Tetap satu elemen di dalam form entri monitoring HD (bukan elemen terpisah); ketika dicentang, sistem menampilkan pop-up konfirmasi sebelum periode monitoring berubah status menjadi Selesai (BR-004). |
| D-02 | Ubah/hapus entri pada monitoring berstatus Selesai | Ketika status monitoring berubah menjadi Selesai (dipicu checklist Post-HD), seluruh entri pada periode tersebut tidak dapat diubah maupun dihapus (BR-009). |
| D-03 | Penamaan & formula ringkasan monitoring | Digunakan tiga istilah: **Jumlah UF** (kumulatif UF seluruh entri), **Jumlah Intake** (kumulatif NaCl + Dextrose + Makan/Minum + Lain-lain seluruh entri), dan **Total UF** (Jumlah UF − Jumlah Intake) (BR-012, BR-013, BR-014). |
| D-04 | Aksi Hapus pada tabel monitoring | Tombol Hapus ditampilkan berdampingan dengan tombol Ubah pada setiap baris tabel; keduanya aktif hanya saat monitoring berstatus Berlangsung dan nonaktif saat status Selesai (BR-009). |
| D-05 | Pemicu pembuatan periode monitoring baru | Dipicu secara otomatis oleh event pasien di-order ke hemodialisa dari fitur Order Hemodialisa (PRD terpisah), bukan melalui tombol manual pada layar Monitoring HD (BR-005). |
| D-06 | Waktu validasi prasyarat asesmen | Kelengkapan Asesmen Perawat HD dan Asesmen Dokter HD divalidasi saat tombol Simpan monitoring ditekan (bukan penguncian aksi sejak layar dibuka); jika belum lengkap, sistem menampilkan pop-up peringatan dan data tidak tersimpan (BR-010). |

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Buat periode monitoring baru (otomatis)** — sistem membuat periode monitoring baru secara otomatis pada episode pelayanan yang sama ketika menerima trigger order pasien ke hemodialisa dari fitur Order Hemodialisa; tidak ada aksi manual pengguna pada layar Monitoring HD untuk memulai periode baru. | [US-001; BR-005] |
| **FR-002** | **Tampilkan Riwayat Monitoring** — sistem menampilkan daftar seluruh periode monitoring pada episode pelayanan yang sama, berisi nomor monitoring, tanggal & waktu mulai, status, jumlah entri, dan ringkasan Jumlah UF/Jumlah Intake/Total UF. | [US-002; BR-011] |
| **FR-003** | **Berpindah antar periode monitoring** — user dapat memilih periode monitoring dari daftar Riwayat Monitoring untuk melihat/melanjutkan pencatatan pada periode tersebut. | [US-002] |
| **FR-004** | **Tambah entri observasi** — user dapat menambahkan entri monitoring baru berisi waktu observasi, seluruh parameter wajib, dan checkbox Post-HD, dengan Keterangan bersifat opsional. | [US-003; BR-001; BR-002; BR-003; BR-004] |
| **FR-005** | **Ubah entri observasi** — user dapat mengubah entri monitoring yang sudah ditambahkan, selama monitoring berstatus Berlangsung. Aksi ini nonaktif ketika status Selesai. | [US-004; BR-009] |
| **FR-006** | **Hapus entri observasi** — user dapat menghapus entri monitoring melalui tombol Hapus di sebelah tombol Ubah pada setiap baris, selama monitoring berstatus Berlangsung. Aksi ini nonaktif ketika status Selesai. | [US-004; BR-009] |
| **FR-007** | **Tampilkan Keterangan pada tabel** — kolom Keterangan ditampilkan langsung pada baris tabel monitoring tanpa perlu membuka detail entri. | [US-005; BR-002] |
| **FR-008** | **Tampilkan Monitoring Header** — header layar menampilkan nomor monitoring aktif, waktu pelaksanaan, status, dan indikator perubahan belum tersimpan. | [US-006] |
| **FR-009** | **Sticky table header** — header kolom parameter monitoring tetap terlihat saat user melakukan scroll pada data observasi. | [US-007] |
| **FR-010** | **Hitung Ringkasan Monitoring** — sistem menghitung dan menampilkan Jumlah UF, Jumlah Intake, dan Total UF secara real-time setiap kali entri ditambah/diubah/dihapus. | [US-008; BR-012; BR-013; BR-014; BR-017] |
| **FR-011** | **Input Penyulit Selama HD & Discharge Planning** — user dapat memilih satu atau lebih Penyulit Selama HD (multiple select) dan mengisi Discharge Planning; keduanya opsional. | [US-009; BR-015; BR-016] |
| **FR-012** | **Simpan monitoring ke rekam medis** — seluruh data monitoring (entri, penyulit, discharge planning) tersimpan sebagai bagian rekam medis pasien saat user menekan Simpan dan asesmen prasyarat lengkap. | [US-010] |
| **FR-013** | **Validasi kelengkapan field wajib** — sistem memvalidasi seluruh field wajib saat entri disimpan dan menampilkan pesan error bila ada field yang kosong. | [US-003; BR-001] |
| **FR-014** | **Checkbox Post-HD** — user dapat mencentang Post-HD pada form entri; sistem menampilkan pop-up konfirmasi, dan bila dikonfirmasi, periode monitoring terkait berubah status menjadi Selesai. | [US-011; BR-004; BR-006] |
| **FR-015** | **Validasi asesmen saat Simpan** — sistem memeriksa kelengkapan Asesmen Perawat HD dan Asesmen Dokter HD saat tombol Simpan monitoring ditekan, berlaku untuk periode monitoring manapun (pertama maupun berikutnya); menampilkan pop-up peringatan dan membatalkan penyimpanan bila belum lengkap. | [US-012; BR-010] |

## 12. User Stories

> Format "Sebagai … ingin … sehingga …". AC pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **perawat hemodialisa**, saya ingin **periode monitoring baru otomatis tersedia ketika pasien di-order ke hemodialisa**, sehingga **saya dapat langsung mencatat observasi tanpa membuat periode monitoring secara manual**. | 1) Given pasien di-order ke hemodialisa melalui fitur Order Hemodialisa, When order tersebut diterima sistem, Then periode monitoring baru dibuat otomatis dengan status Berlangsung pada episode pelayanan yang sama (BR-005). 2) Given periode monitoring lain sedang Berlangsung, When periode baru dibuat, Then status periode lain tidak berubah secara otomatis (BR-006). | [FR-001] |
| **US-002** | Sebagai **perawat hemodialisa**, saya ingin **melihat riwayat seluruh periode monitoring dalam episode pelayanan**, sehingga **saya dapat berpindah antar periode dengan mudah**. | 1) Given episode pelayanan memiliki lebih dari satu periode monitoring, When perawat membuka daftar Riwayat Monitoring, Then seluruh periode tampil dengan nomor, waktu mulai, status, dan ringkasan (BR-011). 2) Given perawat memilih salah satu periode, When periode dipilih, Then layar menampilkan detail entri periode tersebut. | [FR-002; FR-003] |
| **US-003** | Sebagai **perawat hemodialisa**, saya ingin **menambahkan entri observasi dengan seluruh parameter wajib**, sehingga **data klinis pasien selama HD terdokumentasi lengkap**. | 1) Given form entri terbuka, When salah satu field wajib kosong, Then sistem menampilkan error dan entri tidak tersimpan (BR-001). 2) Given seluruh field wajib terisi, When perawat menekan "Tambahkan Entri", Then entri tersimpan dan tabel diperbarui. | [FR-004; FR-013] |
| **US-004** | Sebagai **perawat hemodialisa**, saya ingin **mengubah atau menghapus entri yang sudah ditambahkan**, sehingga **saya dapat mengoreksi kesalahan pencatatan selama monitoring masih berlangsung**. | 1) Given monitoring berstatus Berlangsung, When perawat menekan aksi Ubah, Then form entri terbuka dengan data terkini untuk diedit (BR-009). 2) Given monitoring berstatus Berlangsung, When perawat menekan aksi Hapus di sebelah tombol Ubah, Then entri dihapus dan Jumlah UF/Jumlah Intake/Total UF dihitung ulang (BR-009). 3) Given monitoring berstatus Selesai, When perawat melihat tabel monitoring, Then tombol Ubah dan Hapus keduanya tidak aktif (BR-009). | [FR-005; FR-006] |
| **US-005** | Sebagai **perawat hemodialisa**, saya ingin **melihat kolom Keterangan langsung pada tabel monitoring**, sehingga **saya dapat membaca informasi klinis penting tanpa membuka detail baris**. | 1) Given entri memiliki Keterangan, When tabel monitoring ditampilkan, Then Keterangan tampil langsung pada baris terkait (BR-002). | [FR-007] |
| **US-006** | Sebagai **perawat hemodialisa**, saya ingin **melihat informasi periode monitoring aktif pada header**, sehingga **saya selalu tahu konteks periode yang sedang saya catat**. | 1) Given periode monitoring aktif dipilih, When layar dimuat, Then header menampilkan nomor monitoring, waktu mulai, dan status. | [FR-008] |
| **US-007** | Sebagai **perawat hemodialisa**, saya ingin **header tabel tetap terlihat saat scroll**, sehingga **saya tidak perlu scroll berulang untuk melihat nama parameter**. | 1) Given tabel memiliki banyak baris entri, When perawat scroll ke bawah, Then header kolom tetap terlihat di posisi atas tabel. | [FR-009] |
| **US-008** | Sebagai **perawat hemodialisa**, saya ingin **melihat ringkasan Jumlah UF, Jumlah Intake, dan Total UF yang diperbarui otomatis**, sehingga **saya dapat memantau kondisi cairan pasien selama tindakan**. | 1) Given entri baru ditambahkan/diubah/dihapus, When ringkasan monitoring dihitung, Then Jumlah UF, Jumlah Intake, dan Total UF diperbarui sesuai BR-012–BR-014. | [FR-010] |
| **US-009** | Sebagai **perawat hemodialisa**, saya ingin **mencatat Penyulit Selama HD dan Discharge Planning**, sehingga **kondisi khusus dan rencana pemulangan pasien tercatat**. | 1) Given field ini opsional, When tidak diisi, Then monitoring tetap dapat disimpan (BR-016). 2) Given perawat memilih satu/lebih Penyulit, When dipilih, Then pilihan tampil sebagai chip yang dapat dihapus. | [FR-011] |
| **US-010** | Sebagai **perawat hemodialisa**, saya ingin **menyimpan seluruh data monitoring sebagai bagian rekam medis pasien**, sehingga **data tersedia untuk keperluan medis selanjutnya**. | 1) Given monitoring memiliki minimal satu entri dan asesmen prasyarat lengkap, When perawat menekan Simpan, Then data tersimpan dan waktu simpan terakhir tercatat. | [FR-012] |
| **US-011** | Sebagai **perawat hemodialisa**, saya ingin **menandai entri sebagai Post-HD dengan konfirmasi terlebih dahulu**, sehingga **periode monitoring tidak tertutup secara tidak sengaja**. | 1) Given checkbox Post-HD dicentang pada form entri, When perawat mencentang, Then sistem menampilkan pop-up konfirmasi "Apakah Anda yakin?" (BR-004). 2) Given perawat mengonfirmasi pop-up, When konfirmasi disetujui, Then status periode monitoring berubah menjadi Selesai dan seluruh entrinya tidak dapat diubah/dihapus (BR-004; BR-009). 3) Given perawat membatalkan pop-up, When dibatalkan, Then checkbox kembali tidak tercentang dan status tetap Berlangsung. | [FR-014] |
| **US-012** | Sebagai **perawat hemodialisa**, saya ingin **diberi tahu bila asesmen prasyarat belum lengkap saat saya menyimpan monitoring**, sehingga **saya tahu langkah yang harus dilakukan sebelum data tersimpan**. | 1) Given Asesmen Perawat HD dan/atau Asesmen Dokter HD belum diinput, When perawat menekan Simpan pada monitoring, Then sistem menampilkan pop-up peringatan dan data monitoring tidak tersimpan (BR-010). 2) Given asesmen sudah lengkap, When perawat menekan Simpan, Then data monitoring tersimpan sebagai bagian rekam medis pasien. | [FR-015] |

## 13. Data Requirements (Spesifikasi Field)

> Field demografi & penjamin (No. RM, Nama, Tanggal Lahir) **reuse definisi kanonik dari modul Registrasi/Data Pasien** — nama, tipe, format, validasi harus sama.

### A. Layar INPUT — Form Entri Monitoring (FR-004)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| waktu | Waktu | time | Ya | format HH:mm | Default waktu sistem saat form dibuka, dapat diubah manual | — |
| qb | QB | numeric | Ya | angka - satuan ml/menit| Input manual | — |
| uf | UF | numeric | Ya | angka - satuan ml | Input manual | Komponen Jumlah UF (BR-012) |
| sistol | Sistol | numeric | Ya | angka - satuan mmHg | Input manual | — |
| diastol | Diastol | numeric | Ya | angka - satuan mmHg | Input manual | — |
| nadi | Nadi | numeric | Ya | angka - satuan x/menit | Input manual | — |
| suhu | Suhu | numeric | Ya | angka desimal - satuan °C | Input manual | — |
| resp | Respirasi | numeric | Ya | angka - satuan x/menit | Input manual | — |
| nacl | NaCl | numeric | Ya | angka - satuan ml | Input manual | Komponen Jumlah Intake (BR-013) |
| dextrose | Dextrose | numeric | Ya | angka - satuan ml | Input manual | Komponen Jumlah Intake |
| makan | Makan/Minum | numeric | Ya | angka - satuan ml | Input manual | Komponen Jumlah Intake |
| lain | Lain-lain | numeric | Ya | angka - satuan ml | Input manual | Komponen Jumlah Intake |
| ufgoal | UF Goal | numeric | Ya | angka - satuan ml | Input manual | Target UF periode berjalan — field independen, tidak menjadi basis perhitungan Jumlah UF |
| ket | Keterangan | text | Tidak | bebas, tampil langsung pada kolom tabel | Input manual | Satu-satunya field observasi yang opsional (BR-002) |
| post_hd | Post-HD (checkbox) | boolean | Tidak | — | Input manual | Elemen tunggal pada form entri; jika dicentang, sistem menampilkan pop-up konfirmasi, lalu periode monitoring menjadi Selesai (BR-004, D-01). Seluruh entri periode tersebut menjadi non-editable/non-deletable (BR-009, D-02). |
| petugas | Petugas | text | Ya (otomatis) | — | Diisi otomatis dari user login | Read-only pada form |

### B. Data TER-GENERATE saat Simpan (FR-001, FR-010)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| no_monitoring | Nomor Monitoring | integer | Dibuat otomatis oleh sistem saat menerima trigger order HD, berurutan per episode pelayanan | BR-005 |
| pra | Penanda Pra-HD | boolean | Dibuat otomatis oleh sistem: true untuk entri pertama pada periode | BR-007 |
| status | Status Monitoring | text | Dibuat otomatis oleh sistem: Berlangsung saat periode dibuat; Selesai saat checkbox Post-HD dicentang & dikonfirmasi | BR-006; BR-004 |
| tersimpan | Waktu Tersimpan Terakhir | datetime | Dibuat otomatis oleh sistem saat tombol Simpan ditekan dan asesmen prasyarat lengkap | BR-010 |
| jumlah_uf | Jumlah UF | numeric | Dibuat otomatis: Σ UF seluruh entri periode (kumulatif per entri) | BR-012 |
| jumlah_intake | Jumlah Intake | numeric | Dibuat otomatis: Σ (NaCl + Dextrose + Makan/Minum + Lain-lain) seluruh entri periode | BR-013 |
| total_uf | Total UF | numeric | Dibuat otomatis: Jumlah UF − Jumlah Intake | BR-014 |

### C. Layar TAMPIL — Tabel Monitoring (FR-007, FR-008, FR-009)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | entri.waktu | HH:mm, label kecil "Pra-HD" bila berlaku | Sort ascending berdasarkan waktu | Kolom sticky di sisi kiri |
| QB, UF, Sistol, Diastol, Nadi, Suhu, Respirasi | entri.[field] | angka | — | — |
| NaCl, Dextrose, Makan/Minum, Lain-lain | entri.[field] | angka, dikelompokkan di bawah header grup "Intake" | — | — |
| UF Goal | entri.ufgoal | angka | — | — |
| Keterangan | entri.ket | teks, terpotong (ellipsis) dengan tooltip teks penuh | — | Tampil langsung tanpa expand (BR-002) |
| Petugas | entri.petugas | teks | — | — |
| Aksi | — | tombol Ubah dan tombol Hapus ditampilkan berdampingan per baris | — | Keduanya aktif hanya saat status Berlangsung; nonaktif saat status Selesai (BR-009, D-02, D-04) |

### D. Layar TAMPIL — Daftar Riwayat Monitoring (FR-002)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nomor Monitoring | mons.no_monitoring | "Monitoring N" | Sort berdasarkan urutan pembuatan | — |
| Tanggal & Waktu Mulai | mons.mulai | tanggal + HH:mm | — | Draft user (catatan 4) |
| Status | mons.status | badge Berlangsung/Selesai | Filter berdasarkan status `[ASUMSI]` | BR-011 |
| Jumlah Entri | count(entri) | angka | — | — |
| Ringkasan Jumlah UF/Jumlah Intake/Total UF | mons.jumlah_uf, jumlah_intake, total_uf | angka ringkas | — | Dihitung per periode monitoring (BR-017) |

## 14. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Input dan update data monitoring hemodialisa oleh perawat harus selesai dalam < 1 detik. | Performance Expectation |
| **NFR-002** | Skalabilitas | Sistem mendukung beban operasional 30–50 pasien hemodialisa per hari dengan potensi beberapa periode monitoring berjalan bersamaan. | Behavior (Performance Expectation) |
| **NFR-003** | Ergonomi UI | Tata letak halaman dioptimalkan dengan mengurangi whitespace agar area tabel monitoring tampil lebih luas dan mudah dibaca. | Expected Improvement — UX |
| **NFR-004** | Real-Time | Header tabel bersifat sticky saat scroll; ringkasan Jumlah UF, Jumlah Intake, dan Total UF diperbarui secara real-time mengikuti perubahan entri. | Expected Improvement — UX |
| **NFR-005** | Aksesibilitas | Mengikuti pedoman aksesibilitas umum aplikasi Neurovi yang sudah berjalan. | — |
| **NFR-006** | Keamanan/RBAC | Hanya user berperan perawat hemodialisa (dan peran berwenang lain) yang dapat menginput/mengubah monitoring; sistem memvalidasi kelengkapan asesmen prasyarat saat data disimpan (BR-010). | Draft user (catatan 9); BR-010 |
| **NFR-007** | Auditabilitas | Setiap entri monitoring tercatat dengan waktu observasi dan petugas yang menginput, tersimpan sebagai bagian rekam medis pasien. | Capability #6; Data Requirements |
| **NFR-008** | Usability | Form entri menampilkan indikator field wajib dan pesan error yang jelas saat validasi gagal; pop-up konfirmasi ditampilkan untuk aksi Post-HD dan pop-up peringatan untuk validasi asesmen. | Mockup (validasi form); BR-004; BR-010 |
| **NFR-009** | Konsistensi | Field demografi & penjamin (No. RM, Nama, Tanggal Lahir) mengikuti definisi kanonik yang sama dengan modul lain. |  |

## 15. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| Asesmen Hemodialisa (Perawat & Dokter HD) | Prasyarat wajib — divalidasi saat Simpan monitoring | Internal | FR-015; BR-010 |
| Order Hemodialisa | Event source — memicu pembuatan periode monitoring baru pada episode pelayanan yang sama | Internal | FR-001; BR-005 |
| Rekam Medis Pasien | Penyimpanan permanen seluruh data monitoring | Internal | FR-012 |
| Input Tindakan / Buat Surat / Pilih Penunjang / Buat Resep | Akses cepat lintas modul melalui tombol pintasan pada layar monitoring | Internal | Out of Scope |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Asesmen Perawat & Dokter HD | Hard | Data monitoring tidak dapat tersimpan saat Simpan ditekan. |
| Order Hemodialisa | Hard | Periode monitoring baru tidak dapat dibuat tanpa event order HD dari fitur terpisah. |
| Rekam Medis Pasien | Hard | Data monitoring tidak dapat tersimpan sebagai bagian rekam medis pasien. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Satuan dan rentang nilai valid untuk parameter klinis (QB, UF, Sistol, dsb.) belum ditetapkan, berisiko validasi input yang tidak sesuai standar medis. | Koordinasi dengan tim medis/keperawatan untuk menetapkan satuan dan rentang normal sebelum implementasi validasi field. |
| R2 | Jumlah UF bersifat kumulatif dari seluruh entri (bukan nilai entri terakhir), sehingga input UF yang keliru pada satu entri akan memengaruhi Total UF pada seluruh periode, dan tidak dapat dikoreksi lagi setelah periode berstatus Selesai. | Tampilkan Jumlah UF, Jumlah Intake, dan Total UF secara jelas pada setiap perubahan entri sebelum Post-HD dicentang; pastikan pop-up konfirmasi Post-HD menampilkan ringkasan akhir agar perawat dapat mengecek ulang sebelum menutup periode. |
| R3 | Tombol Ubah dan Hapus yang nonaktif total pada status Selesai berpotensi menyulitkan koreksi data bila kesalahan baru diketahui setelah periode ditutup. | Sediakan mekanisme eskalasi/koreksi terpisah (mis. melalui modul rekam medis) untuk kasus koreksi pasca-Selesai; klarifikasi kebutuhan ini ke stakeholder. |
| R4 | Mekanisme teknis (event/API) pemicu pembuatan periode monitoring baru dari fitur Order Hemodialisa ke modul Monitoring HD belum dijabarkan, berisiko menimbulkan kesenjangan integrasi antar tim pengembang. | Selaraskan kontrak data/event dengan tim yang mengerjakan PRD Order Hemodialisa sebelum pengembangan dimulai. |

## 17. Asumsi
- [ASUMSI] Field Petugas diisi otomatis berdasarkan user yang login, mengikuti pola pada mockup acuan.
- [ASUMSI] Nomor Monitoring dibuat otomatis oleh sistem secara berurutan dalam satu episode pelayanan, sesuai pola pada mockup acuan.
- [ASUMSI] Entri pertama pada setiap periode monitoring otomatis ditandai sebagai Pra-HD tanpa input manual dari user (BR-007), berdasarkan pola mockup acuan.

## 19. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 2.0 | 13 Juli 2026 | Team Product | Draf awal PRD Monitoring HD v2 berdasarkan Draft user & mockup acuan. |
| 2.1 | 13 Juli 2026 | Team Product | Menambahkan section Keputusan Desain (Resolved); mengonfirmasi perilaku checkbox Post-HD (D-01); mengonfirmasi aturan ubah/hapus entri pada monitoring berstatus Selesai (D-02); mengganti penamaan & formula ringkasan monitoring menjadi Jumlah UF, Jumlah Intake, dan Total UF (D-03); menambahkan posisi tombol Hapus berdampingan dengan tombol Ubah (D-04); menyesuaikan BR, FR, US, Data Requirements, NFR, dan Risk & Mitigation terkait. |
| 2.2 | 13 Juli 2026 | Team Product | Melengkapi kondisi As-Is Neurovi v1 pada Background dengan detail whitespace berlebih, kolom Keterangan yang perlu di-expand, dan ketiadaan Riwayat Monitoring; merinci langkah Skenario 1 pada Main Flow; menandai relasi antara penguncian aksi di awal (Skenario 4) dengan pemeriksaan ulang saat Simpan sebagai open question baru. |
| 2.3 | 13 Juli 2026 | Team Product | Mengubah pemicu transisi status Berlangsung → Selesai menjadi **hanya** melalui checkbox Post-HD (BR-006), menghapus ketentuan status berubah otomatis saat monitoring baru dibuat; menambahkan pop-up konfirmasi saat Post-HD dicentang (BR-004); mengubah ketentuan ubah/hapus entri — keduanya nonaktif saat status Selesai, menggantikan keputusan v2.1 (BR-009, D-02); mengubah pemicu pembuatan periode monitoring baru dari tombol manual menjadi trigger otomatis dari fitur Order Hemodialisa (PRD terpisah) (BR-005, D-05); mengubah waktu validasi prasyarat asesmen dari penguncian di awal menjadi validasi saat Simpan dengan pop-up peringatan (BR-010, D-06), sehingga menjawab open question versi 2.2; menambahkan Order Hemodialisa sebagai dependency baru; menambahkan Risk R4 terkait detail teknis integrasi trigger order HD. |
| 2.4 | 13 Juli 2026 | Team Product | Menyesuaikan Skenario 4 agar berlaku umum untuk periode monitoring manapun (pertama maupun berikutnya), bukan hanya saat "membuat monitoring baru"; menghapus frasa yang tersisa dan berpotensi bertentangan dengan BR-005/D-05 (pembuatan periode monitoring otomatis via trigger Order Hemodialisa); menegaskan cakupan validasi asesmen saat Simpan (BR-010, FR-015) berlaku untuk seluruh periode monitoring dalam episode pelayanan yang sama. |
