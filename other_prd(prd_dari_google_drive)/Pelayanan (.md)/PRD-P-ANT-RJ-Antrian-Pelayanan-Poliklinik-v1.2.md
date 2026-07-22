# PRD — Display Antrian & Pemanggilan Pasien Poliklinik

**Related Document:** PRD Dashboard Pelayanan Rawat Jalan (PRD-P-DSH-RJ) — *hard dependency*; Manajemen Loket & Antrean; Master Data Kamar/Ruangan; Master Data Jadwal Praktik; Setting Suara & Display; Referensi V1: RS PKU Muhammadiyah Wonosobo — Klinik Penyakit Dalam (staging).
**Dokumen ID:** PRD-P-ANT-RJ-v1.0  ·  **Versi:** 1.2 (Draft — Revisi pasca-feedback)
**Tanggal Disusun:** 30 Juni 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Sprint 29 Juni – 3 Juli 2026

## 1. Overview / Brief Summary

Modul ini mendefinisikan fitur **Display Antrian & Pemanggilan Pasien Poliklinik** yang menempel pada **Dashboard Pelayanan Rawat Jalan**. Fitur terdiri dari dua permukaan: (1) **Panel Pemanggilan** — kontrol operasional di dashboard tempat dokter/perawat memanggil pasien; dan (2) **Layar Display Antrian** — tampilan layar penuh yang ditayangkan ke monitor/TV ruang tunggu, bersifat read-only. Pengguna utamanya dokter dan perawat poli sebagai pemanggil, pasien/pengunjung sebagai penonton layar, serta admin/IT RS sebagai konfigurator.

Pada Neurovi v1 (staging RS PKU Muhammadiyah Wonosobo — Klinik Penyakit Dalam), pemanggilan bergantung pada voice bawaan browser sehingga suara tidak konsisten, latensi terasa lambat, tidak ada konfigurasi suara, serta berpotensi tumpang tindih antar-poli dan delay sinkronisasi antara layar dan suara.

Fase 1 MVP fitur ini berfokus pada: pemanggilan **otomatis** (urut antrian) atau **manual** (pilih nomor), pemilihan ruang praktik, pengelolaan antrean dilewati, tombol preview untuk membuka layar display, suara pemanggilan Bahasa Indonesia baku yang andal lintas-browser (pendekatan pre-rendered), prasyarat tampil panel, serta sinkronisasi real-time panel ↔ layar ↔ suara melalui satu event broadcast.

Kapabilitas lanjutan — konfigurasi suara terpusat vs per-dokter secara lengkap `[**]`, audio dispatch FIFO bergiliran antar-poli `[**]`, pemilihan model/engine suara `[**]`, dan pemulihan audio saat koneksi tersambung kembali `[**]` — dijadwalkan pada Fase 2; sedangkan kustomisasi tampilan display per-RS, dukungan multi-monitor/videotron, dan statistik waktu tunggu/pemanggilan `[**]` masuk Fase 3.

Fitur ini **tidak** menangani logika checkpoint/asesmen/tindakan/disposisi pasien (di PRD Dashboard Pelayanan RJ), **tidak** menangani antrean online/booking (BPJS Antrol/MJKN — fitur hanya mengonsumsi nomor & urutan antrean yang sudah ada), serta **tidak** mencakup konfigurasi perangkat keras TV/jaringan/pengeras suara.

> Referensi: PRD-P-ANT-RJ-v1.0 (Display Antrian & Pemanggilan Pasien Poliklinik v1.2); PRD Dashboard Pelayanan RJ (PRD-P-DSH-RJ).

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — Referensi V1: RS PKU Muhammadiyah Wonosobo, Klinik Penyakit Dalam (staging):
- Suara pemanggilan bergantung pada voice bawaan browser sehingga tidak konsisten dan tidak seragam antar perangkat.
- Latensi suara terasa lambat sejak user klik tombol panggil.
- Tidak ada konfigurasi model suara (terpusat maupun per-dokter).
- Berpotensi tumpang tindih audio saat beberapa poli memanggil bersamaan.
- Sinkronisasi antara layar dan suara berpotensi delay.

**Masalah/pain point:**
- Aspek bisnis proses: pemanggilan pasien belum seragam dan andal di lingkungan RS yang memakai beragam perangkat & browser.
- Aspek UX: suara belum tentu Bahasa Indonesia yang jelas; jeda pemanggilan terasa lama; belum ada opsi konfigurasi suara terpusat/per-dokter sesuai kondisi ruang tunggu.
- Aspek logic system: layar dan suara dapat tidak sinkron; pengumuman antar-poli dapat tumpang tindih.

**Dampak utama yang disasar v2:**
- Alur pemanggilan poliklinik cepat dan tidak ambigu bagi pasien (layar + suara serempak).
- Pengalaman seragam di beragam perangkat dan browser.
- Fleksibilitas operasional: ruang tunggu dengan satu pengeras suara terpusat maupun ruang periksa dengan audio sendiri sama-sama didukung.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = panel pemanggilan (otomatis + manual), pilih ruang, antrean dilewati, tombol preview, layar display dasar, suara Bahasa Indonesia lintas-browser (pre-rendered), prasyarat tampil, sinkronisasi real-time.
- **Fase 2** = konfigurasi suara terpusat vs per-dokter lengkap, audio dispatch FIFO antar-poli, pemilihan model suara, recovery audio saat reconnect. `[**]`
- **Fase 3** = kustomisasi tampilan display per-RS, dukungan multi-monitor/videotron, statistik waktu tunggu & pemanggilan. `[**]`

> Behavior operasional: sekitar 30 user (dokter + perawat) mengakses Dashboard Pelayanan RJ dalam waktu bersamaan.

## 3. In Scope

### Scope Definition (V1.0 — cakupan PRD ini)
1. **Panel Pemanggilan di dashboard** — Antrean Saat Ini, Antrean Selanjutnya, dan tombol aksi pemanggilan.
2. **Mode pemanggilan** — otomatis (urut antrian) dan manual (pilih nomor antrean spesifik).
3. **Pemilihan ruangan praktik** (mis. Klinik 1 / Klinik 2) yang menentukan label ruang dan rute suara.
4. **Antrean Dilewati** — melewati pasien yang tidak hadir dan memanggil ulang kemudian.
5. **Tombol preview** untuk membuka Layar Display Antrian pada layar terpisah.
6. **Layar Display Antrian** — nama RS, jam, logo, nomor antrean saat ini, nama poli & dokter, ruang, jumlah pasien, antrean selanjutnya, dan antrean dilewati.
7. **Suara pemanggilan TTS Bahasa Indonesia** dengan format kalimat baku.
8. **Konfigurasi suara terpusat** (bergiliran antar-poli) **atau per-dokter/per-ruang** (paralel). `[**] Konfigurasi lengkap: Fase 2`
9. **Sinkronisasi real-time** panel ↔ layar display ↔ suara.
10. **Prasyarat tampil panel** — role berwenang, satu dokter dipilih pada filter, dan tanggal dashboard = hari ini.

### Out Scope
- Logika checkpoint, asesmen, tindakan, dan disposisi pasien (berada di PRD Dashboard Pelayanan RJ).
- Antrean online / booking (BPJS Antrol, MJKN) — fitur ini hanya mengonsumsi nomor & urutan antrean yang sudah ada.
- Konfigurasi perangkat keras TV, jaringan, dan pengeras suara (di luar aplikasi).
- Pemanggilan untuk IGD dan Rawat Inap.
- Pendaftaran, surat kontrol, dan modul penunjang.
- **[Fase 2] `[**]`** Audio dispatch FIFO antar-poli, konfigurasi suara lengkap, pemilihan model suara, recovery audio saat reconnect.

## 4. Goals and Metrics

### Tujuan
Menyediakan mekanisme pemanggilan pasien poliklinik yang cepat, sinkron antara layar dan suara, jelas dalam Bahasa Indonesia, andal lintas-browser, serta mampu melayani banyak poli dan puluhan user secara bersamaan tanpa tumpang tindih audio.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Respon display & mulai suara sejak klik tombol panggil | < 1 detik p95 | NFR-001 |
| Durasi pengucapan suara pemanggilan (satu pengumuman) | < 10 detik | NFR-002 |
| Konkurensi user (dokter + perawat) mengakses dashboard | ~30 user tanpa degradasi | NFR-003 |
| Sinkronisasi data layar vs suara | 0 mismatch / delay terlihat | NFR-004 |
| Kompatibilitas browser (Chrome, Safari, Firefox, Edge) | 4/4 lulus uji pemanggilan | NFR-005 |
| User satisfaction (dokter/perawat, post-pilot) | ≥ 4.0 / 5.0 | Survei pilot |

## 5. Related Feature & Persona

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| **Dashboard Pelayanan RJ** (PRD-P-DSH-RJ) | Host Panel Pemanggilan; sumber daftar antrean, dokter aktif, dan tanggal layanan. |
| **Manajemen Loket & Antrean** | Sumber nomor antrean dan urutannya (mis. C-001, C-002, …). Fitur ini tidak menghasilkan nomor sendiri (BR-002). |
| **Master Data Kamar / Ruangan** | Sumber daftar ruang praktik (Klinik 1, Klinik 2, …) dan labelnya. |
| **Master Data Jadwal Praktik** | Sumber dokter & sesi/jam praktik; dasar prasyarat tampil panel dan daftar ruang yang dapat dipilih (BR-019). |
| **Setting Suara & Display** | Konfigurasi mode audio terpusat vs per-dokter dan model suara. |
| **Perangkat Display (TV) & Audio** | Target tayang layar display dan pemutaran suara pemanggilan. |

Dependency lintas modul: **Dashboard Pelayanan RJ (Hard)**, **Manajemen Loket & Antrean (Hard)**, **MD Kamar/Ruangan (Hard)**, **MD Jadwal Praktik**, **Setting Suara & Display (Soft)**, **Perangkat TV & audio khusus ruang tunggu (Soft)**. Detail di §16.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter Poli | Primary | Pemanggil utama: memanggil pasien (otomatis/manual), memilih ruang, membuka layar display. |
| Perawat Poli | Secondary | Pemanggil pendukung: membantu pemanggilan & pengelolaan antrean dilewati. |
| Pasien / Pengunjung | Tersier | Penonton layar: melihat nomor antrean dan mendengar panggilan (read-only). |
| Admin / IT RS | Secondary | Konfigurator: mengatur mode suara terpusat/per-dokter dan menyiapkan perangkat display. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
Setelah dashboard menampilkan daftar antrian per poli per tanggal, pemanggilan pasien dilakukan dengan mengandalkan voice bawaan browser. Suara tidak konsisten dan bergantung ketersediaan voice per browser, latensi terasa lambat, tidak ada konfigurasi suara, pengumuman antar-poli berpotensi tumpang tindih, dan tampilan layar berpotensi tidak sinkron dengan suara.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Dokter/perawat membuka Dashboard Pelayanan RJ, memilih satu dokter dan tanggal hari ini; ketiga prasyarat terpenuhi → Panel Pemanggilan & tombol preview muncul (BR-001).
2. User memilih ruang praktik dari dropdown (mengikuti ruang tersetting di MD Jadwal Praktik dokter; master ruang dari MD Kamar) → menentukan label ruang di display dan rute suara (BR-013, BR-019).
3. User membuka Layar Display Antrian via tombol preview (ikon monitor) untuk ditayangkan ke TV ruang tunggu (rute tokenized, read-only).
4. User memanggil pasien: mode **otomatis** (Mulai Panggilan → memanggil antrean pertama; Selanjutnya → menyelesaikan saat ini lalu memanggil berikutnya) atau mode **manual** (pilih nomor → Panggil).
5. Saat tombol panggil ditekan, dalam satu event broadcast: ANTREAN SAAT INI diperbarui, layar display diperbarui real-time, dan suara pemanggilan Bahasa Indonesia diputar — target mulai < 1 detik, durasi < 10 detik (BR-014, NFR-001, NFR-002).
6. Bila pasien tidak hadir, user menekan Lewati → antrean pindah ke ANTREAN DILEWATI; dapat dipanggil ulang kapan saja menjadi ANTREAN SAAT INI (BR-007, BR-021).
7. Pada mode suara terpusat, permintaan pemanggilan dari berbagai poli diserialisasi FIFO dengan jeda ~1 detik agar tidak tumpang tindih `[**] Fase 2`; pada mode per-dokter/per-ruang, suara berjalan paralel per perangkat ruang.
8. User menandai pasien masuk via Selesaikan (manual) atau Selanjutnya (otomatis) → status **Dilayani**.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Bahasa suara | Tidak konsisten | Bahasa Indonesia baku |
| Kompatibilitas browser | Bergantung voice bawaan browser | Andal lintas-browser (pre-rendered audio) |
| Latensi suara | Terasa lambat | < 1 detik sejak klik |
| Konfigurasi suara | Tidak ada | Terpusat atau per-dokter |
| Antar-poli | Berpotensi tumpang tindih | Bergiliran via antrian audio (mode terpusat) `[**]` |
| Sinkronisasi layar-suara | Berpotensi delay | Satu event broadcast memicu keduanya |

## 7. Main Flow / Mindmap

### Skenario 1 — Pemanggilan otomatis (alur normal)
1. Mode otomatis (toggle Panggil Manual OFF).
2. Klik "Mulai Panggilan" → antrean pertama yang menunggu menjadi ANTREAN SAAT INI dan diumumkan (BR-004).
3. Klik "Selanjutnya" → SAAT INI diselesaikan (Dilayani) lalu antrean berikutnya dipanggil (BR-005).
4. "Panggil lagi" mengumumkan ulang SAAT INI tanpa mengubah status atau urutan (BR-008).

### Skenario 2 — Pemanggilan manual (pilih nomor)
1. Aktifkan mode Manual (toggle Panggil Manual ON).
2. Pilih nomor pada dropdown "PILIH NO ANTREAN".
3. Klik "Panggil" → nomor terpilih menjadi ANTREAN SAAT INI dan diumumkan (BR-003).
4. "Selesaikan" menandai SAAT INI selesai dipanggil (pasien masuk → Dilayani).

### Skenario 3 — Antrean dilewati & panggil ulang
1. Pada SAAT INI, klik "Lewati" → antrean pindah ke ANTREAN DILEWATI (FR-006).
2. Buka panel Antrean Dilewati, pilih nomor, klik panggil ulang (ikon suara) → nomor tersebut menjadi ANTREAN SAAT INI kembali (BR-007).
3. Tidak ada pemanggilan ulang otomatis; panggil ulang selalu manual (BR-021).

### Skenario 4 — Suara bergiliran antar-poli (mode terpusat) `[**] Fase 2`
1. Dua poli memanggil hampir bersamaan.
2. Permintaan pemanggilan masuk ke satu antrian audio FIFO.
3. Diputar satu per satu dengan jeda seragam ~1 detik agar tidak tumpang tindih (BR-009, BR-010).
4. Pada mode per-dokter/per-ruang, audio dapat berjalan paralel di perangkat masing-masing.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Panel Pemanggilan dan tombol preview hanya tampil jika role berwenang (dokter/perawat) + satu dokter dipilih pada filter + tanggal dashboard = hari ini. | FR-001; FR-008; US-010 |
| **BR-002** | Sumber nomor & urutan antrean berasal dari Manajemen Loket & Antrean; fitur ini tidak menghasilkan nomor sendiri. | FR-003; §5 |
| **BR-003** | Mode otomatis memanggil sesuai urutan antrian; mode manual memanggil nomor yang dipilih user. | FR-004; US-001 |
| **BR-004** | "Mulai Panggilan" memanggil antrean pertama yang menunggu; setelah ada antrean saat ini, tombol berganti menjadi "Selanjutnya". | FR-004; US-001 |
| **BR-005** | "Selanjutnya" (otomatis) menyelesaikan antrean saat ini lalu memanggil antrean berikutnya dalam satu aksi. | FR-007; US-001 |
| **BR-006** | Hanya satu antrean berstatus Dipanggil (ANTREAN SAAT INI) per ruang/dokter pada satu waktu. | FR-005; §9 |
| **BR-007** | Antrean dilewati dapat dipanggil ulang kapan saja; saat dipanggil ulang menjadi ANTREAN SAAT INI. | FR-006; US-005 |
| **BR-008** | "Panggil lagi" mengumumkan ulang antrean saat ini tanpa mengubah status atau urutan. | FR-004; §9 |
| **BR-009 `[**]`** | **Fase 2:** Mode suara terpusat — seluruh permintaan pemanggilan diserialisasi dalam satu antrian audio FIFO. | FR-010; US-004 |
| **BR-010 `[**]`** | **Fase 2:** Antar pengumuman pada mode terpusat diberi jeda seragam, default 1 detik, agar tidak tumpang tindih. | FR-010; §14.5 |
| **BR-011** | Konfigurasi suara mendukung mode terpusat (semua dokter) atau per-dokter/per-ruang, beserta pemilihan model suara. `[**] Pemilihan model suara: Fase 2` | FR-009; US-008 |
| **BR-012** | Format kalimat suara baku Bahasa Indonesia (lihat §14.1). | FR-005; US-006 |
| **BR-013** | Ruang praktik yang dipilih menentukan label ruang pada display dan rute pemutaran suara (pada mode per-ruang). | FR-002; US-002 |
| **BR-014** | Pembaruan layar display dan pemicu suara berasal dari satu event broadcast yang sama agar selalu sinkron. | FR-005; FR-012; US-009 |
| **BR-015** | Layar display bersifat read-only; diakses lewat rute tokenized; tidak dapat memanggil atau mengubah antrean. | FR-008; §15; NFR-007 |
| **BR-016** | Jumlah Pasien pada display dihitung untuk dokter terpilih (per-dokter), bukan total poli lintas-dokter. Mis. total Klinik Penyakit Dalam 77 pasien, namun untuk dr. Dia Irawati 74 pasien — yang tampil 74. | FR-011; §15 |
| **BR-017** | Display menampilkan minimal tiga keadaan antrean: sedang dilayani (saat ini), antrean selanjutnya, dan antrean dilewati. | FR-011; US-011 |
| **BR-018** | Pada mode terpusat, suara diputar melalui perangkat audio khusus ruang tunggu (mis. perangkat layar display/TV yang terhubung ke pengeras suara), bukan perangkat operator — agar terdengar oleh pasien. | FR-009; §14.4; §15 |
| **BR-019** | Daftar ruang praktik yang dapat dipilih mengikuti ruangan yang disetting pada MD Jadwal Praktik untuk dokter tersebut (master ruang dari MD Kamar). | FR-002; §5 |
| **BR-020** | Mode suara default = terpusat bila RS belum mengonfigurasi. | FR-009 |
| **BR-021** | Tidak ada pemanggilan ulang otomatis; panggil ulang dilakukan manual oleh user. | FR-006 |

## 9. State Machine

### 9.1 Siklus Status Antrean
| State | Makna | Transisi |
|-------|-------|----------|
| **Menunggu** | Default, ada dalam antrian, belum dipanggil. | → Dipanggil (panggil) |
| **Dipanggil** | Sedang menjadi ANTREAN SAAT INI / sedang diumumkan. | → Dilayani (Selesaikan/Selanjutnya); → Dilewati (Lewati); → Dipanggil (Panggil lagi, tetap) |
| **Dilewati** | Dilewati karena pasien belum hadir. | → Dipanggil (panggil ulang) |
| **Dilayani** | Pasien sudah masuk / selesai dipanggil. | Terminal untuk siklus pemanggilan. |

- Hanya satu antrean berstatus **Dipanggil** per ruang/dokter pada satu waktu (BR-006).
- **"Panggil lagi"** mengumumkan ulang antrean saat ini tanpa mengubah status atau urutan (BR-008).

### 9.2 Antrian Audio (Mode Terpusat) `[**] Fase 2`
| State | Makna |
|-------|-------|
| **Idle** | Tidak ada pengumuman dalam antrian. |
| **Antri** | Permintaan pemanggilan menunggu giliran di antrian FIFO. |
| **Diputar** | Pengumuman sedang diucapkan; permintaan lain menunggu. |
| **Selesai** | Pengumuman selesai; jeda singkat lalu memutar antrian berikutnya. |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Prasyarat Tampil Panel Pemanggilan** — Panel Pemanggilan + tombol preview tampil hanya jika role berwenang, satu dokter dipilih, dan tanggal = hari ini (server WIB). Di luar kondisi itu, panel disembunyikan dan dashboard hanya bersifat baca. | US-010; BR-001 |
| **FR-002** | **Pemilihan Ruangan Praktik** — Dropdown pilih ruang (mis. Klinik 1, Klinik 2) mengikuti ruangan yang disetting pada MD Jadwal Praktik dokter tersebut; master ruang dari MD Kamar. Ruang terpilih menentukan label ruang pada layar display dan rute pemutaran suara. | US-002; BR-013; BR-019 |
| **FR-003** | **Panel Antrean Saat Ini & Selanjutnya** — Menampilkan ANTREAN SAAT INI (nomor besar + nama) dan ANTREAN SELANJUTNYA (nomor + nama). Kondisi awal: Saat Ini = "-", Selanjutnya = antrean pertama yang menunggu. | BR-002 |
| **FR-004** | **Mode Pemanggilan: Otomatis vs Manual** — Toggle "Panggil Manual" memilih mode. **Otomatis (OFF):** tombol "Mulai Panggilan", "Selanjutnya", "Panggil lagi", "Lewati". **Manual (ON):** dropdown "PILIH NO ANTREAN" + tombol "Panggil", "Selesaikan", "Lewati". | US-001; BR-003; BR-004 |
| **FR-005** | **Eksekusi Pemanggilan & Trigger Suara** — Saat tombol panggil ditekan, sistem dalam satu event: (1) memperbarui ANTREAN SAAT INI; (2) mem-broadcast ke Layar Display; (3) memicu suara pemanggilan Bahasa Indonesia. Ketiganya berasal dari satu event broadcast agar sinkron. Target mulai suara < 1 detik, durasi ucapan < 10 detik. | US-001; US-009; BR-014; NFR-001; NFR-002 |
| **FR-006** | **Antrean Dilewati (Skip & Panggil Ulang)** — "Lewati" memindahkan antrean saat ini ke daftar ANTREAN DILEWATI. Panel Antrean Dilewati menyediakan dropdown pilih nomor dilewati + tombol panggil ulang (ikon suara) dan tandai (ikon centang). Memanggil ulang menjadikan antrean tersebut ANTREAN SAAT INI kembali. | US-005; BR-007; BR-021 |
| **FR-007** | **Selesaikan / Selanjutnya** — Mode manual: "Selesaikan" menandai antrean saat ini selesai dipanggil (pasien masuk). Mode otomatis: "Selanjutnya" menyelesaikan saat ini lalu langsung memanggil antrean berikutnya. | US-001; BR-005 |
| **FR-008** | **Tombol Preview Layar Display** — Ikon monitor membuka Layar Display Antrian (rute tokenized layar penuh) pada tab/jendela baru untuk ditayangkan ke TV ruang tunggu. Tombol hanya muncul saat prasyarat FR-001 terpenuhi. | US-003; BR-015 |
| **FR-009** | **Konfigurasi Suara: Terpusat vs Per-Dokter** — Mode terpusat: satu output suara untuk ruang tunggu; semua poli berbagi sehingga pengumuman diserialisasi bergiliran (FR-010). Mode per-dokter/per-ruang: suara diputar pada perangkat ruang masing-masing, paralel tanpa serialisasi. Tersedia pemilihan model/engine suara. `[**] Konfigurasi lengkap & pemilihan model suara: Fase 2` | US-008; BR-011; BR-020 |
| **FR-010 `[**]`** | **Fase 2 — Pemanggilan Bergiliran Antar-Poli (Audio Dispatch)** — Pada mode terpusat, permintaan pemanggilan dari berbagai poli masuk ke satu antrian audio (FIFO) dan diputar satu per satu dengan jeda antar pengumuman agar tidak tumpang tindih. Detail di §14. | US-004; BR-009; BR-010 |
| **FR-011** | **Layar Display Antrian (Konten)** — Layar display menayangkan minimal: nama RS, jam berjalan, logo; nomor antrean saat ini (besar) + nama poli + nama dokter; label ruang; jumlah pasien (per-dokter); antrean selanjutnya; dan antrean dilewati. Detail di §15. | US-011; BR-016; BR-017 |
| **FR-012** | **Sinkronisasi Real-Time** — Panel, layar display, dan suara tersinkron via WebSocket. Data yang tampil di layar dan suara yang diputar harus konsisten tanpa delay terlihat. | US-009; BR-014; NFR-004 |

## 11. User Stories

> Format "Sebagai … ingin … sehingga …". Acceptance Criteria dalam pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **dokter/perawat**, saya ingin **memanggil pasien untuk dilayani (otomatis urut atau manual pilih nomor)**, sehingga **pasien masuk sesuai antrian**. | 1) Given mode otomatis, When klik "Mulai Panggilan", Then antrean pertama menjadi ANTREAN SAAT INI dan diumumkan (BR-004). 2) Given ada antrean saat ini (otomatis), When klik "Selanjutnya", Then saat ini diselesaikan dan berikutnya dipanggil (BR-005). 3) Given mode manual, When pilih nomor dan klik "Panggil", Then nomor itu menjadi ANTREAN SAAT INI dan diumumkan (BR-003). | FR-004; FR-005; FR-007 |
| **US-002** | Sebagai **dokter**, saya ingin **memilih ruangan praktik**, sehingga **display dan suara menunjuk ruang yang benar**. | 1) Given daftar ruang dari MD Kamar, When memilih ruang (mis. Klinik 1), Then label ruang pada display dan teks suara mengikuti pilihan (BR-013). | FR-002; BR-013 |
| **US-003** | Sebagai **dokter**, saya ingin **membuka tampilan antrian untuk pasien**, sehingga **nomor antrean tayang di ruang tunggu**. | 1) Given prasyarat tampil terpenuhi, When klik tombol preview (ikon monitor), Then Layar Display Antrian terbuka pada layar terpisah (FR-008). 2) Given layar display terbuka, When pemanggilan terjadi, Then layar menampilkan nomor saat ini secara real-time (NFR-004). | FR-008; NFR-004 |
| **US-004** | Sebagai **sistem**, saya ingin **pemanggilan dilakukan bergiliran antar poli pada mode terpusat**, sehingga **suara tidak tumpang tindih**. `[**]` | 1) Given mode terpusat dan dua poli memanggil hampir bersamaan, When pengumuman dijadwalkan, Then keduanya diputar bergiliran FIFO dengan jeda (BR-009, BR-010). 2) Given mode per-dokter/per-ruang, When dua ruang memanggil, Then audio dapat berjalan paralel. | FR-010; BR-009; BR-010 |
| **US-005** | Sebagai **dokter/perawat**, saya ingin **melewati dan memanggil ulang antrean**, sehingga **pasien yang belum hadir bisa dipanggil kemudian**. | 1) Given antrean saat ini, When klik "Lewati", Then antrean pindah ke ANTREAN DILEWATI (FR-006). 2) Given antrean dilewati, When memanggil ulang, Then antrean tersebut menjadi ANTREAN SAAT INI (BR-007). | FR-006; BR-007 |
| **US-006** | Sebagai **pasien**, saya ingin **mendengar panggilan dalam Bahasa Indonesia**, sehingga **jelas dipanggil ke poli/ruang mana**. | 1) Given pemanggilan, When suara diputar, Then format "Nomor antrian [no], silakan menuju [poli], ruang [ruang]" dalam Bahasa Indonesia (BR-012). | FR-005; BR-012 |
| **US-007** | Sebagai **user**, saya ingin **pemanggilan berfungsi di browser apa pun**, sehingga **tidak tergantung perangkat**. | 1) Given Chrome/Safari/Firefox/Edge, When memanggil, Then suara tetap berbunyi dengan andal (NFR-005, opsi pre-rendered). | NFR-005; §14.3 |
| **US-008** | Sebagai **admin/IT**, saya ingin **mengatur suara terpusat atau per-dokter**, sehingga **sesuai kondisi ruang tunggu RS**. | 1) Given setting suara, When pilih "terpusat", Then semua poli berbagi satu output dan bergiliran (FR-009, FR-010). 2) Given setting "per-dokter", When dua ruang memanggil, Then audio diputar di perangkat masing-masing. | FR-009; FR-010; BR-011 |
| **US-009** | Sebagai **pasien**, saya ingin **data layar dan suara konsisten tanpa delay**, sehingga **tidak salah dengar/lihat**. | 1) Given pemanggilan, When event broadcast dikirim, Then nomor di layar = nomor yang diucapkan, tanpa delay terlihat (BR-014, NFR-004). | FR-012; BR-014; NFR-004 |
| **US-010** | Sebagai **sistem**, saya ingin **panel pemanggilan hanya muncul pada konteks yang benar**, sehingga **tidak ada pemanggilan keliru**. | 1) Given role berwenang + satu dokter dipilih + tanggal hari ini, When dashboard dibuka, Then panel & preview tampil (BR-001). 2) Given tanggal lampau atau semua dokter, When dashboard dibuka, Then panel disembunyikan. | FR-001; BR-001 |
| **US-011** | Sebagai **pasien**, saya ingin **layar menampilkan sedang dilayani, antrean selanjutnya, dan antrean dilewati**, sehingga **saya tahu posisi antrian**. | 1) Given layar display, When ditayangkan, Then tampil nomor saat ini, antrean selanjutnya, dan daftar dilewati (BR-017, FR-011). | FR-011; BR-017 |

## 12. Data Requirements (Spesifikasi Field)

> Field identitas & antrean **reuse definisi kanonik dari modul sumber antrean** (Manajemen Loket & Antrean / Pendaftaran Rawat Jalan) — nama, tipe, format, validasi **harus sama**.

### A. Kontrol Panel Pemanggilan (Input) — FR-002, FR-004, FR-009
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| ruang_praktik | Ruang Praktik | dropdown/lookup | Ya | pilih dari ruang tersetting pada MD Jadwal Praktik dokter | lookup MD Jadwal Praktik / MD Kamar | Menentukan label display & rute suara (BR-013, BR-019). |
| mode_panggil | Panggil Manual (toggle) | boolean/toggle | Ya | OFF = Otomatis, ON = Manual | UI state, default Otomatis | Menentukan set tombol yang aktif (BR-003, FR-004). |
| no_antrean_terpilih | PILIH NO ANTREAN | dropdown | Tidak | wajib saat mode Manual | lookup antrean menunggu | Dipakai hanya pada mode Manual (FR-004). |

### B. Data yang Dikonsumsi & Ditampilkan (Panel + Layar Display) — FR-003, FR-011
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| no_antrian | antrean (Manajemen Loket) | teks besar (mis. C-001) | urut antrean | Sumber & urutan dari Manajemen Loket (BR-002). |
| nama, no_rm | pasien (kanonik) | teks | — | Identitas pada panel & kartu. |
| unit/poli | unit | teks | per poli | Nama poli pada display. |
| dokter | jadwal praktik | teks | satu dokter (prasyarat) | Nama dokter pada display. |
| status_antrean | antrean | badge | — | Menunggu / Dipanggil / Dilewati / Dilayani (§9). |
| urutan_antrean | antrean | angka urut | sort urutan | Dasar mode otomatis. |
| jumlah_pasien | dashboard | angka | per-dokter terpilih | Per-dokter, bukan total poli lintas-dokter (BR-016). |
| daftar_dilewati | antrean | daftar nomor | — | Untuk panel & display Antrean Dilewati (BR-017). |
| config_suara | Setting Suara & Display | Terpusat / Per-Dokter (+model) | — | Dikonfigurasi di modul Setting; default Terpusat (BR-020). Pemilihan model suara `[**]` Fase 2 (BR-011). |
| display_token | sistem | token rute | — | Rute layar display read-only; mengikat unit/dokter/tanggal (BR-015, NFR-007). |

### C. Data yang Dibuat/Diperbarui Sistem saat Pemanggilan — FR-005, FR-012
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| status_antrean | Status Antrean | enum | Diperbarui otomatis oleh sistem saat aksi panggil/selesai/lewati | Transisi §9 (BR-006). |
| event_broadcast | Event Pemanggilan | payload | Dibuat otomatis oleh sistem saat pemanggilan (berisi no_antrian, poli, dokter, ruang) | Satu event memicu update layar + suara (BR-014). |
| display_token | Token Display | string | Dibuat otomatis oleh sistem saat membuka layar display | Read-only, mengikat unit/dokter/tanggal (BR-015, NFR-007). |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Respon display & mulai suara < 1 detik p95 sejak klik tombol panggil. | Metrik; FR-005 |
| **NFR-002** | Durasi Suara | Satu pengumuman selesai diucapkan < 10 detik. | Metrik; FR-005 |
| **NFR-003** | Konkurensi | Mendukung ~30 user (dokter + perawat) konkuren tanpa degradasi. | Metrik; Behavior |
| **NFR-004** | Real-Time | Broadcast pemanggilan ke layar < 1 detik; data layar & suara sinkron tanpa delay terlihat. | FR-012; BR-014 |
| **NFR-005** | Lintas-Browser | Pemanggilan berfungsi di Chrome, Safari, Firefox, dan Microsoft Edge. | Metrik; §14.3 |
| **NFR-006** | Reliabilitas | Audio dispatch idempoten (tanpa double-play); pulih otomatis saat koneksi WebSocket tersambung kembali. `[**] Recovery saat reconnect: Fase 2` | R4; FR-010 |
| **NFR-007** | Keamanan | Layar display read-only via rute tokenized; token mengikat unit/dokter/tanggal. | BR-015 |
| **NFR-008** | Ergonomi | Nomor antrean pada display terbaca dari jarak ruang tunggu; kontras tinggi. | FR-011 |

## 14. Mekanisme Pemanggilan Suara (TTS)

### 14.1 Format Kalimat
Template pengumuman (Bahasa Indonesia), BR-012:

> "Nomor antrian [C-001], silakan menuju [Klinik Penyakit Dalam], ruang [Klinik 1]."

### 14.2 Latensi & Durasi
- Mulai suara < 1 detik sejak klik tombol panggil (NFR-001).
- Durasi satu pengumuman < 10 detik (NFR-002).

### 14.3 Strategi Lintas-Browser
Ketersediaan voice Bahasa Indonesia pada Web Speech API (speechSynthesis) tidak konsisten di Safari dan Firefox. Untuk menjamin keandalan dan latensi rendah, direkomendasikan pendekatan audio terkelola, bukan murni TTS browser.

| Opsi | Penjelasan |
|------|------------|
| **A. Pre-rendered (rekomendasi)** | Sediakan potongan audio yang sudah dibuat (frasa baku, huruf antrean, angka, nama poli, nama ruang). Saat memanggil, potongan dirangkai dan diputar via HTMLAudioElement — didukung semua browser, latensi paling rendah karena dapat di-preload. |
| **B. Server TTS + cache** | Server menghasilkan audio pengumuman lalu dialirkan/di-cache. Konten lebih fleksibel, namun bergantung latensi jaringan; perlu cache agar panggilan berulang tetap cepat. |
| **C. Web Speech API (fallback)** | Dipakai hanya bila perangkat memiliki voice id-ID yang baik; tidak diandalkan sebagai mekanisme utama. |

### 14.4 Mode Audio
- **Terpusat:** satu output di ruang tunggu untuk semua poli, melalui perangkat audio khusus ruang tunggu (bukan perangkat operator, BR-018); pengumuman bergiliran (FIFO). `[**] Fase 2`
- **Per-dokter/per-ruang:** tiap ruang memutar suaranya sendiri; pengumuman antar-ruang dapat paralel.

### 14.5 Pemanggilan Bergiliran Antar-Poli `[**] Fase 2`
Pada mode terpusat, dispatcher audio sisi server menerima seluruh permintaan pemanggilan dari semua poli, mengantrikannya FIFO, lalu memutar satu per satu dengan jeda seragam ~1 detik antar pengumuman (BR-009, BR-010). Ini mencegah dua poli berbicara bersamaan pada satu pengeras suara.

## 15. Layar Display Antrian

Tampilan layar penuh untuk ruang tunggu, dibuka via tombol preview. Read-only dan diakses lewat rute tokenized (BR-015, NFR-007).

### 15.1 Konten Layar
| Elemen | Isi |
|--------|-----|
| Header | Nama RS (mis. RS PKU Muhammadiyah Wonosobo), jam berjalan, dan logo Neurovi. |
| Kartu Antrean Saat Ini | Nama poli, nomor antrean saat ini dalam ukuran besar (mis. C-001), dan nama dokter. |
| Ruang | Label ruang praktik (mis. Klinik 1). |
| Jumlah Pasien | Jumlah pasien dokter terpilih pada tanggal layanan (per-dokter, bukan total poli lintas-dokter — BR-016). |
| Antrean Selanjutnya | Nomor antrean berikutnya yang akan dipanggil. |
| Antrean Dilewati | Daftar nomor antrean yang dilewati. |

### 15.2 Perilaku
- Update real-time via WebSocket setiap ada pemanggilan (BR-014).
- Pada mode terpusat, suara diputar oleh perangkat audio khusus ruang tunggu (perangkat layar display/TV yang terhubung ke pengeras suara), bukan perangkat operator (BR-018). `[**] Fase 2`
- Read-only: tidak ada kontrol pemanggilan pada layar display (BR-015).

## 16. Integrasi Eksternal & Dependency

> Fitur ini hanya **mengonsumsi** nomor & urutan antrean yang sudah ada; antrean online/booking (BPJS Antrol, MJKN) berada di luar lingkup (§3 Out Scope).

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Library audio pre-rendered / Engine TTS** | Menyediakan/menghasilkan potongan audio (frasa baku, angka, nama poli/ruang) untuk pemanggilan suara. | Engine & lisensi `[PERLU KONFIRMASI]` (OQ-01, keputusan Tim Pradev/IT) | FR-005; FR-010; §14 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Dashboard Pelayanan RJ | Hard | Tidak ada host panel & sumber antrean/dokter/tanggal. |
| Manajemen Loket & Antrean | Hard | Tidak ada nomor & urutan antrean untuk dipanggil. |
| MD Kamar / Ruangan | Hard | Tidak ada pilihan ruang & label untuk display/suara. |
| Library audio pre-rendered / TTS | Hard | Suara pemanggilan tidak dapat diputar. |
| Setting Suara & Display | Soft | Mode terpusat/per-dokter tidak dapat dikonfigurasi (pakai default terpusat, BR-020). |
| Perangkat TV & audio khusus ruang tunggu | Soft | Tanpa perangkat audio khusus, suara mode terpusat tak terdengar pasien; perlu fallback ke mode per-ruang. |

## 17. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Mekanisme suara | Pendekatan pre-rendered (rangkai potongan audio) sebagai utama demi keandalan lintas-browser & latensi rendah; server-TTS sebagai alternatif, Web Speech API sebagai fallback. |
| D-02 | Prasyarat tampil panel | Role berwenang + satu dokter dipilih + tanggal = hari ini (BR-001). |
| D-03 | Sinkronisasi | Satu event broadcast memicu update layar dan suara sekaligus (BR-014). |
| D-04 | Bergiliran antar-poli | Mode terpusat memakai antrian audio FIFO + jeda; mode per-ruang paralel (FR-010). |
| D-05 | Output suara mode terpusat | Suara diputar via perangkat audio khusus ruang tunggu (mis. perangkat layar display/TV yang terhubung ke pengeras suara), bukan perangkat operator — agar terdengar pasien (BR-018). |
| D-06 | Basis Jumlah Pasien display | Dihitung per-dokter terpilih, bukan total poli lintas-dokter. Mis. total Klinik Penyakit Dalam 77, dr. Dia 74 — yang tampil 74 (BR-016). |
| D-07 | Sumber ruang praktik | Ruang yang dapat dipilih mengikuti ruangan yang disetting pada MD Jadwal Praktik untuk dokter tersebut; master ruang tetap dari MD Kamar (BR-019). |
| D-08 | Mode suara default | Terpusat (BR-020). |
| D-09 | Jeda antar pengumuman | Seragam, default 1 detik (BR-010). |
| D-10 | Pemanggilan ulang | Manual — tidak ada auto re-call meski pasien belum hadir (BR-021). |

## 18. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Panel pemanggilan (otomatis + manual), pilih ruang, antrean dilewati, tombol preview, layar display dasar, suara Bahasa Indonesia lintas-browser (pre-rendered), prasyarat tampil, sinkronisasi real-time. |
| **Fase 2** `[**]` | Konfigurasi suara terpusat vs per-dokter lengkap, audio dispatch FIFO antar-poli, pemilihan model suara, recovery audio saat reconnect. |
| **Fase 3** `[**]` | Kustomisasi tampilan display per-RS, dukungan multi-monitor/videotron, statistik waktu tunggu & pemanggilan. |

## 19. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Web Speech API tidak konsisten di Safari/Firefox. | Pakai audio pre-rendered sebagai mekanisme utama; Web Speech hanya fallback (D-01). |
| R2 | Audio tumpang tindih saat banyak poli memanggil bersamaan. | Antrian audio FIFO + jeda pada mode terpusat (BR-009, BR-010). |
| R3 | Latensi suara > 1 detik. | Preload & cache potongan audio; rangkai di sisi klien agar mulai instan. |
| R4 | Layar display tidak sinkron dengan panel. | Satu event broadcast untuk layar & suara + WebSocket + recovery saat reconnect (BR-014, NFR-006). |
| R5 | Panel muncul pada konteks salah (tanggal lampau / semua dokter). | Prasyarat tampil ketat (BR-001). |
| R6 | 30 user konkuren membebani broadcast. | Channel per poli/ruang + payload ringan; uji beban sebelum go-live. |

## 20. Asumsi

- `[ASUMSI]` Penahapan (phasing) mengikuti §18 Roadmap dari sumber: item "konfigurasi lengkap", "audio dispatch FIFO antar-poli", "pemilihan model suara", dan "recovery audio saat reconnect" ditandai `[**]` Fase 2, sementara dukungan dasar dua mode dan sinkronisasi real-time berada di Fase 1.
- `[ASUMSI]` Field identitas pasien (nama, no_rm) dan data antrean (no_antrian, urutan_antrean) reuse definisi kanonik dari modul sumber antrean (Manajemen Loket & Antrean / Pendaftaran Rawat Jalan) — nama, tipe, format, dan validasi konsisten.
- `[ASUMSI]` Trace antar BR ↔ FR ↔ US ditarik dari referensi silang yang sudah ada di sumber (FR/US mengutip BR terkait), bukan dikira-kira.

## 21. Pertanyaan Terbuka

- `[PERLU KONFIRMASI]` **(OQ-01)** Engine/model suara spesifik dan lisensinya untuk opsi pre-rendered/server-TTS (mis. rekaman suara manusia, Google/Azure TTS Indonesia, atau TTS lokal) — keputusan teknis bersama Tim Pradev/IT; tidak memblok desain.
- `[PERLU KONFIRMASI]` **Batas Fase 1 vs Fase 2 untuk konfigurasi suara & audio dispatch.** §3 (In Scope V1.0) mencantumkan konfigurasi suara terpusat/per-dokter dan sinkronisasi sebagai bagian fitur, sementara §18 Roadmap menempatkan "konfigurasi lengkap", "audio dispatch FIFO antar-poli", "pemilihan model suara", dan "recovery audio saat reconnect" pada Fase 2. Perlu penegasan: apakah dukungan dua mode secara dasar (tanpa serialisasi FIFO penuh) sudah masuk Fase 1, atau seluruh konfigurasi suara ditunda ke Fase 2?

## 22. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| v1.0 | 30 Jun 2026 | Team Product | PRD awal Display Antrian & Pemanggilan Pasien Poliklinik: dua permukaan (panel + layar display), mode otomatis/manual, pilih ruang, antrean dilewati, suara TTS Bahasa Indonesia lintas-browser, konfigurasi terpusat/per-dokter, audio dispatch antar-poli, prasyarat tampil, FR-001..012, BR-001..017, NFR, user story + AC, dependencies, keputusan & open questions, roadmap, risk. |
| v1.1 | 30 Jun 2026 | Team Product | Revisi pasca-feedback: OQ-01 diputuskan — suara mode terpusat via perangkat audio khusus ruang tunggu, bukan perangkat operator (D-05, BR-018); OQ-03 diputuskan — Jumlah Pasien display dihitung per-dokter terpilih (77 total poli vs 74 dr. Dia → tampil 74) (D-06, BR-016). |
| v1.2 | 30 Jun 2026 | Team Product | Resolusi open question lanjutan: ruang praktik mengikuti setting MD Jadwal Praktik (D-07, BR-019); mode suara default terpusat (D-08, BR-020); jeda antar pengumuman seragam 1 detik (D-09, BR-010); pemanggilan ulang manual tanpa auto re-call (D-10, BR-021). Tersisa satu OQ teknis: pilihan engine/lisensi suara (untuk Tim Pradev/IT). |
