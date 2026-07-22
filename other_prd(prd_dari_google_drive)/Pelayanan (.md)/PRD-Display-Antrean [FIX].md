# PRD — Display Antrean (Antrean Pendaftaran / Loket Admisi)

**Related Document:** PRD Master Data Meja Antrian (Manajemen Loket) — **hard dependency**; Desain Display Antrean (referensi UI)
**Dokumen ID:** PRD-DISP-ANT-v1.0  ·  **Versi:** 1.2 (format Generator Neurovi v2; validasi Rahma: cetak Penerbitan, sumber loket & layanan dari master, Section D dipindah ke master)
**Tanggal Disusun:** 29 Juni 2026 · **Penyusun:** Team Product — Tamtech International · **PIC:** Elfira (System Analyst)
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]` (tidak tercantum di sumber)
**Status:** Draft — Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]` (tidak tercantum di sumber; seluruh scope berlabel Fase 1)

---

## 1. Overview / Brief Summary

Display Antrean adalah rangkaian antarmuka antrean **pendaftaran (loket admisi)** yang mencakup **tiga tampilan yang saling melengkapi**:

1. **Tampilan Penerbitan Nomor Antrean** — antarmuka (kiosk/APM atau layar petugas penerbit) untuk menerbitkan/mencetak nomor antrean sesuai kategori/tujuan/tipe antrean. Akses = tautan/URL khusus (tanpa login) yang dibuka di perangkat kiosk/APM atau layar petugas penerbit.
2. **Tampilan Pemanggilan Nomor Antrean** — antarmuka petugas loket untuk memanggil nomor: menampilkan per loket → kategori/tujuan/tipe antrean, total, antrean saat ini, antrean sisa, berikutnya, serta tombol Panggil, Panggil Lagi, dan Lewati. Akses = tombol **"Antrean Masuk"** pada dashboard Pendaftaran Rawat Jalan (RJ) — petugas yang sudah berada di dashboard RJ menekan tombol ini untuk membuka tampilan pemanggilan.
3. **Display Publik Antrean** — layar publik (TV/monitor di area tunggu) yang menampilkan informasi semua loket: nomor yang sedang dipanggil, nomor berikutnya, dan nomor yang dilewati — secara real-time, plus panggilan suara Bahasa Indonesia (audio chime + TTS), mis. *"Nomor A-002, silakan menuju Loket 4"*. Akses = tautan/URL khusus (tanpa login) yang dibuka di Smart TV/Android TV/Mini PC/PC.

**Karakteristik kunci modul ini:**

- **Tanpa login** untuk ketiga tampilan. Entry point berbeda: penerbitan & display publik = tautan/URL langsung; pemanggilan = tombol "Antrean Masuk" di dashboard Pendaftaran RJ.
- **Sumber data = Master Data Manajemen Loket.** Pilihan loket dan kategori/tipe antrean yang ditampilkan mengikuti konfigurasi pada master data manajemen loket. Display & pemanggilan **hanya mengonsumsi** data tersebut; tidak ada pengaturan antrean di dalam modul ini.
- **Read-only untuk pasien** pada display publik — hanya menampilkan, tidak menerima input transaksi.
- **Logo & nama rumah sakit selalu tampil** untuk ketiga tampilan.
- **Satu state antrean terpusat:** nomor yang dipanggil dikunci ke loket pemanggil sehingga satu nomor tidak dapat dipanggil di dua loket berbeda dalam waktu bersamaan.
- **Suara panggilan menggunakan Third Party yaitu Botika TTS** (TTS Indonesia neural) yang di-render & di-cache server-side lalu diputar dari cache — konsisten Bahasa Indonesia, < 1 detik, jalan di semua browser.

> Penegasan lingkup: seluruh cakupan di sumber berlabel **Fase 1**; tidak ada item Fase 2/3 yang disebut. Karena itu penanda `[**]` nyaris tidak dipakai di dokumen ini.
> Referensi: PRD Master Data Meja Antrian (Manajemen Loket); Desain Display Antrean.

## 2. Background

**Kondisi saat ini (As-Is)** — pada jam sibuk, antrean loket pendaftaran sering menumpuk dan menimbulkan kendala:

- Pasien tidak mengetahui sisa antrean, giliran, dan loket tujuan → sering bertanya ke petugas.
- Pasien yang terlewat harus bertanya manual karena tidak ada informasi visual.
- Petugas tidak memiliki acuan terpusat siapa yang sedang dipanggil di loket lain → risiko satu nomor dipanggil di dua loket berbeda.
- Setiap RS punya jumlah loket & kategori layanan berbeda → konfigurasi harus terpusat dan tanpa ubah kode.

**Masalah spesifik dari V1 yang harus diperbaiki (draft user):**

1. **Latensi tinggi** — sering ada jeda lama antara petugas klik "Panggil" dan munculnya suara panggilan.
2. **Kompatibilitas audio** — suara panggilan tidak selalu jalan di semua browser/perangkat.
3. **Bahasa suara tidak konsisten** — kadang suara keluar dalam Bahasa Inggris/Rusia; harus dipastikan selalu Bahasa Indonesia.
4. **Pengaturan antrean tercampur di fitur display** — pada V1 pengaturan antrean berada di fitur display antrean. Diperbaiki: pengaturan antrean dipindah ke Master Data Manajemen Loket; pada modul Display Antrean **hanya mengonsumsi** data sesuai yang sudah disetel di master.
5. **Tampilan kurang baik** — ketiga tampilan perlu diperbaiki dari sisi keterbacaan, kelengkapan informasi (total/sisa/berikutnya), dan kemudahan operasi (tombol panggil/panggil lagi/lewati).

**Dampak utama yang disasar V2:**
Pengalaman antre yang jelas sejak pasien tiba · suara panggilan cepat, konsisten Bahasa Indonesia, dan jalan di semua browser · integritas pemanggilan (nol tabrakan antar loket) · pemisahan konfigurasi (master) dari operasional (tiga tampilan).

**Strategi rilis:**
- **Fase 1 (MVP)** = seluruh cakupan pada seksi In Scope.
- Fase 2/3 = tidak disebut di sumber.

> Perilaku/volume operasional spesifik tidak dinyatakan di sumber.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Kiosk Penerbitan Nomor** (akses via tautan/URL, tanpa login): pasien/petugas pilih kategori/tipe antrean (yang aktif di Master Manajemen Loket) → nomor diterbitkan & masuk antrean → muncul di tampilan pemanggilan loket terkait. Logo & nama RS tampil.
2. **Tampilan Pemanggilan Nomor Antrean** (akses via tombol "Antrean Masuk" di dashboard pendaftaran RJ, tanpa login): petugas buka tampilan pemanggilan, pilih loket, dan tipe antrean yang aktif untuk loket itu. Layar menampilkan kategori/tipe, total antrean, antrean saat ini, sisa, dan berikutnya.
3. **Tampilan Pemanggilan — aksi petugas:** tombol Panggil, Panggil Lagi, Lewati. Panggil Lagi memutar ulang suara untuk nomor yang sedang dipanggil; Lewati memindahkan nomor ke Antrean Dilewati dan melepas kunci loket.
4. **Penguncian atomik nomor ke loket (anti panggil-ganda):** satu nomor tidak bisa dipanggil di dua loket berbeda dalam waktu bersamaan.
5. **Recall & Selesai dari Antrean Dilewati:** petugas memanggil ulang nomor yang sebelumnya dilewati; display menayangkan & menyuarakan ulang. Setelah Selesai, nomor keluar dari Antrean Dilewati dan menandai pasien yang sedang dipanggil sebagai terlayani.
6. **Display Publik:** kartu per loket (nomor Sedang Dipanggil besar, Berikutnya di bawahnya), section Antrean Dilewati, logo & nama RS selalu tampil, pembaruan real-time.
7. **Suara panggilan Bahasa Indonesia (Botika TTS):** chime + *"Nomor [nomor], silakan menuju Loket [n]"* dengan suara Botika, di-render & di-cache server-side lalu diputar via HTML5/Web Audio — konsisten Bahasa Indonesia, latensi < 1 detik, jalan di semua browser.
8. **Penyiaran real-time:** perubahan state antrean disiarkan ke semua display & tampilan pemanggilan dengan latensi < 1 detik (SSE/WebSocket, fallback polling).
9. **Reset antrean harian:** penomoran reset pada jam reset yang dikonfigurasi di Master Manajemen Loket; antrean hari sebelumnya diarsipkan.
10. **Log aktivitas antrean (level loket, DB-only):** mencatat loket, aksi (Terbit/Panggil/Panggil Lagi/Lewati/Panggil Ulang/Selesai), nomor, dan timestamp. Tidak ada `user_id` karena tanpa login. Tidak ditampilkan ke user.

### Out Scope

- **Master Manajemen Loket** (loket, kategori/tipe antrean, pemetaan loket↔tipe, skema penomoran, jam reset, waktu tunggu) — berada di PRD Master Manajemen Loket terpisah. Modul ini **hanya mengonsumsi**.

## 4. Goals and Metrics

### Tujuan

- Menyediakan **tiga tampilan** antrean pendaftaran yang jelas: penerbitan nomor, pemanggilan nomor, dan display publik.
- Memberi pengalaman antre yang jelas sejak pasien tiba: ambil nomor sendiri tanpa login, dengar panggilan yang jelas dalam Bahasa Indonesia, dan tahu harus ke loket mana.
- Menghilangkan tiga keluhan suara v1 (jeda, tidak bunyi di sebagian browser, bahasa tidak konsisten) lewat suara Botika (TTS Indonesia) yang di-render & di-cache server-side lalu diputar dari cache.
- Memastikan satu nomor tidak pernah dipanggil dua loket sekaligus lewat penguncian state terpusat.
- Memisahkan konfigurasi (di Master Manajemen Loket) dari operasional (di tiga tampilan ini) agar pengelolaan rapi dan tidak rawan inkonsistensi seperti v1.

### Metrik (terukur)

| Metrik | Target / Success Criteria | Sumber |
|--------|---------------------------|--------|
| Latensi klik "Panggil" → suara mulai berbunyi | ≥ 95% panggilan: jeda < 1 detik. | NFR-001 |
| Konsistensi bahasa suara | 100% panggilan keluar dalam Bahasa Indonesia (tanpa fallback bahasa lain). | NFR-004 |
| Kompatibilitas browser | Suara berbunyi di 100% browser target display (mis. Chrome, Firefox, Edge versi yang didukung). | NFR-005 |
| Integritas pemanggilan | 0 kasus satu nomor antrean tercatat dipanggil oleh dua loket berbeda dalam waktu bersamaan. | NFR-006 |
| Latensi update display | ≥ 95% perubahan (panggil/lewati/selesai) tampil di display publik < 1 detik dari aksi petugas. | NFR-002 |
| Cadence pemanggilan | Sistem mendukung interval pemanggilan antar pasien ≤ 30 detik tanpa hambatan teknis (target operasional, bukan paksaan sistem). | NFR-007 |

## 5. Related Feature & Persona

### A. Modul Terkait

| Modul | Feature | Peran terhadap Modul |
|-------|---------|-----------------------|
| **Master Manajemen Loket** | Loket, Kategori/Tipe Antrean, Pemetaan Loket↔Tipe, Skema Penomoran, Jam Reset, Waktu Tunggu | Sumber seluruh konfigurasi; modul ini hanya mengonsumsi (**hard dependency**). |
| **Dashboard Pendaftaran RJ** | Tombol "Antrean Masuk" | Entry navigasi ke Tampilan Pemanggilan (tanpa pertukaran data). |

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Pasien (di kiosk/APM) | Primary | Menerbitkan nomor antrean sendiri; menonton display publik. |
| Petugas Penerbit | Secondary | Menerbitkan nomor antrean di layarnya untuk pasien. |
| Petugas Loket | Primary | Memanggil, memanggil lagi, melewati, memanggil ulang, dan menyelesaikan antrean. |
| Operator Display | Tersier | Membuka tautan display publik di TV/monitor & menekan "Aktifkan Suara" sekali. |
| Pengelola | Tersier | Memakai log aktivitas (DB-only) untuk investigasi. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Kondisi Saat Ini)

1. Pasien mengambil nomor (manual/kiosk) lalu menunggu.
2. Petugas memanggil nomor lewat aplikasi.
3. Pengaturan antrean berada di fitur display (tercampur) → menyulitkan pengelolaan & rawan inkonsistensi.
4. Display: pembaruan lambat, suara sering telat, kadang tidak berbunyi di browser tertentu, bahasa suara tidak konsisten.
5. Pasien yang terlewat tidak punya rujukan visual → bertanya ke petugas.
6. Risiko nomor sama dipanggil dua loket karena tidak ada penguncian state terpusat.

### B. To-Be (Kondisi Yang Diharapkan — Fase 1 MVP)

1. **Konfigurasi dipindah ke Master Manajemen Loket** (loket, kategori/tipe antrean, penomoran, jam reset). Ketiga tampilan hanya mengonsumsi.
2. **Penerbitan nomor** (akses via tautan, tanpa login): pasien/petugas pilih kategori/tipe → nomor diterbitkan & masuk antrean → muncul di tampilan pemanggilan loket terkait.
3. **Pemanggilan** (akses via tombol "Antrean Masuk" di dashboard pendaftaran RJ, tanpa login): petugas buka tampilan pemanggilan, pilih loket; layar menampilkan kategori/tipe, total, antrean saat ini, sisa, berikutnya. Klik Panggil → nomor dikunci ke loket itu (tidak bisa dipanggil loket lain). Tersedia Panggil Lagi & Lewati.
4. **Penyiaran real-time ke display publik** (akses via tautan, tanpa login): nomor sedang dipanggil tampil besar pada kartu loket, berikutnya di bawahnya, antrean dilewati, plus suara (chime + Bahasa Indonesia) *"Nomor [nomor], silakan menuju Loket [n]"* dengan latensi < 1 detik.
5. Jika pasien tidak muncul → Panggil Lagi (putar ulang) atau Lewati → nomor pindah ke section Antrean Dilewati pada display publik.
6. Saat pasien terlewat datang → petugas Panggil Ulang dari Antrean Dilewati → display menampilkan & menyuarakan ulang, lalu nomor diselesaikan dan keluar dari Antrean Dilewati.
7. Logo & nama RS selalu tampil untuk ketiga tampilan.

## 7. Main Flow / Mindmap

### Skenario A — Penerbitan Nomor Antrean (Tampilan 1, akses via tautan, tanpa login)

1. Pasien/petugas membuka tautan/URL penerbitan di kiosk/APM atau layar petugas penerbit.
2. Pilih kategori/tujuan/tipe antrean (daftar bersumber dari master manajemen loket).
3. Sistem menerbitkan nomor antrean (prefix kategori + urut, mis. A-002) sesuai aturan penomoran master, lalu **menampilkan nomor tersebut di layar**.
4. Sistem langsung **memicu cetak otomatis melalui mekanisme cetak bawaan browser** (cetak senyap/otomatis ke printer default, mis. thermal printer) — tanpa aksi tambahan dari pasien/petugas.
5. Begitu proses cetak browser selesai (event `afterprint`), sistem **menandai nomor berstatus "Sudah Tercetak"** → tampilan nomor pada layar **otomatis hilang** dan layar **kembali ke daftar pemilihan kategori/tipe**, siap untuk pasien berikutnya.
6. Nomor yang terbit masuk antrean kategori → muncul di tampilan pemanggilan loket terkait.
7. Bila printer bermasalah/tidak tersedia, nomor **tetap terbit di sistem dan tetap ditampilkan besar di layar** sebagai cadangan (tidak otomatis hilang) — lihat BR-011.
8. Tampilan penerbitan mode tayang penuh dengan logo + nama RS.

### Skenario B — Pemanggilan Nomor (Tampilan 2, akses via tombol "Antrean Masuk", tanpa login)

1. Petugas berada di dashboard Pendaftaran RJ dan menekan tombol "Antrean Masuk" → tampilan pemanggilan terbuka.
2. Petugas memilih loket (daftar loket dari master manajemen loket).
3. Layar menampilkan per loket: kategori/tipe, total, antrean saat ini, antrean sisa, berikutnya, tombol Panggil, Panggil Lagi, Lewati.
4. Petugas klik Panggil → sistem melakukan klaim/kunci atomik nomor ke loket pemanggil. Nomor ditampilkan ke display publik + suara berbunyi.
   - Bila nomor sudah diklaim loket lain (atau oleh sesi lain pada loket yang sama), sistem menolak dan menampilkan info "sudah dipanggil di Loket [n]".
   - Proses checking sistem: (1) mengecek apakah nomor antrean masih tersedia/belum dipanggil; (2) langsung mengunci nomor itu untuk loket tersebut.
5. Sistem mengirim event ke display publik (real-time) dengan suara Botika.
6. Memanggil nomor berikutnya di loket yang sama → nomor aktif sebelumnya otomatis **Dilayani (tutup)** dan dianggap selesai. 
7. Tampilan pemanggilan mode tayang penuh dengan logo + nama RS.

### Skenario C — Panggil Lagi

1. Petugas klik Panggil Lagi → display memutar ulang suara nomor yang sama (state tidak berubah).

### Skenario D — Lewati & Antrean Dilewati

1. Pasien tidak muncul → petugas klik Lewati → nomor pindah ke section Antrean Dilewati di display publik dan pada tampilan pemanggilan.
2. Saat pasien datang → petugas Panggil Ulang (recall) dari Antrean Dilewati → display tampil & suarakan ulang; nomor dikunci ke loket pemanggil; setelah dilayani petugas tandai Selesai → nomor keluar dari Antrean Dilewati.

### Skenario E — Tampil Display Publik (Tampilan 3, akses via tautan)

1. Operator membuka tautan/URL display di Smart TV/Android TV/Mini PC/PC (tanpa login).
2. (Sekali saat memuat) operator menekan "Aktifkan Suara" untuk membuka audio context (kebijakan autoplay).
3. Display masuk mode tayang penuh dengan logo + nama RS, menampilkan semua loket (sesuai master): nomor sedang dipanggil, berikutnya, dan section Antrean Dilewati.
4. Pembaruan real-time mengikuti event panggil/panggil lagi/lewati/recall/selesai dari tampilan pemanggilan.

## 8. Business Rules

**Global**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Ketiga tampilan (Penerbitan, Pemanggilan, Display Publik) diakses tanpa login. Entry: Penerbitan & Display Publik via tautan/URL; Pemanggilan via tombol "Antrean Masuk" di dashboard Pendaftaran RJ. | US-001, US-002, US-007; FR-001, FR-005, FR-017 |
| **BR-002** | Seluruh konfigurasi (daftar loket, kategori/tipe antrean, skema penomoran, jam reset, waktu tunggu) bersumber dari Master Manajemen Loket; modul ini hanya mengonsumsi — tidak ada pengaturan antrean di dalam modul. | Out Scope; FR-001, FR-004, FR-006, FR-021 |
| **BR-003** | Logo & nama RS selalu tampil di ketiga tampilan, di semua kondisi (termasuk saat tidak ada panggilan aktif). | US-001, US-007; FR-001, FR-017 |
| **BR-004** | Satu state antrean terpusat di server sebagai sumber kebenaran; nomor yang dipanggil dikunci ke loket pemanggil sehingga satu nomor tidak dapat dipanggil di dua loket berbeda dalam waktu bersamaan. | US-003; FR-008, FR-020 |
| **BR-005** | Display Publik bersifat read-only (hanya menampilkan; tidak menerima input transaksi/kontrol pemanggilan). | US-007; FR-017 |

**Penerbitan Nomor**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-006** | Daftar kategori/tujuan/tipe pada Tampilan Penerbitan = tipe yang aktif di master; tipe yang dinonaktifkan → tombolnya hilang dari tampilan. | US-001; FR-004 |
| **BR-007** | Penerbitan nomor harus atomik: dua perangkat penerbit yang menerbitkan bersamaan tidak boleh menghasilkan nomor kembar (ref. "Case 1" — tabel Case kosong di sumber, lihat Pertanyaan Terbuka Q2). | US-001; FR-002 |
| **BR-008** | Skema nomor (prefix per tipe, panjang digit/padding, rentang) sepenuhnya dari master, tidak di-hardcode di modul ini. | US-001; FR-002 |
| **BR-009** | Setiap penerbitan mencatat `tipe_antrean` dan `diterbitkan_at`. | FR-002 |
| **BR-010** | **Alur cetak & tampilan penerbitan:** setelah tipe dipilih, nomor tampil di layar lalu sistem **memicu cetak otomatis melalui mekanisme cetak bawaan browser** (cetak senyap/otomatis ke printer default, mis. thermal printer). Begitu proses cetak selesai (event `afterprint`), sistem **menandai nomor berstatus "Sudah Tercetak"**, dan transisi status inilah yang **memicu tampilan nomor otomatis hilang** & layar kembali ke pemilihan tipe. Bila printer mati/habis kertas/tidak tersedia (atau cetak gagal), status tetap `Belum Tercetak`, nomor **tetap terbit di sistem**. `[Mode cetak senyap/kiosk & tenggat bila sinyal cetak tak terkonfirmasi → Q12]` | US-001; FR-003 |

**Pemanggilan & Pilih Loket**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-012** | Tombol "Antrean Masuk" hanya membuka Tampilan Pemanggilan (navigasi); tidak ada pertukaran data dengan proses registrasi/check-in pendaftaran. | US-002; FR-005 |
| **BR-013** | Pemilihan loket terikat ke sesi/perangkat; menampilkan tipe aktif dari tipe yang dipetakan ke loket itu di master (bisa satu atau beberapa). | US-002; FR-006 |
| **BR-014** | Bila loket yang sama dibuka di dua perangkat, keduanya melihat state yang sama (state terpusat); aksi Panggil tetap atomik sehingga tidak menimbulkan duplikasi. | US-002; FR-006, FR-008 |

**Panggil (Claim Atomik & Kunci ke Loket)**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-015** | Klik Panggil mengambil tepat satu nomor Menunggu berikutnya dari tipe aktif loket, secara atomik di server (satu operasi terkunci). Tidak boleh ada dua loket mendapat nomor yang sama. | US-003; FR-008 |
| **BR-016** | Nomor yang sudah Sedang Dipanggil tidak muncul lagi sebagai kandidat panggil di loket mana pun. | US-003; FR-008 |
| **BR-017** | Penyelesaian otomatis: memanggil nomor berikutnya otomatis menyelesaikan (Selesai) nomor yang sedang dipanggil di loket itu sebelum nomor baru dikunci; tidak ada tombol Selesai terpisah pada alur pemanggilan utama. Contoh: panggil A-001, lalu Panggil untuk berikutnya → A-001 dianggap Selesai. | US-003, US-005; FR-009 |
| **BR-018** | Panggil mencatat `dipanggil_at`, `panggil_count` = 1, dan mengunci `loket_id`. | FR-008 |
| **BR-019** | Bila nomor sudah diklaim loket/sesi lain, sistem menolak dan menampilkan "sudah dipanggil di Loket [n]". | US-003; FR-010 |
| **BR-020** | Pemanggilan paralel antar loket berjalan independen; penguncian atomik hanya mencegah nomor yang sama diambil dua loket. Saat dua loket klik Panggil hampir bersamaan, masing-masing mendapat nomor berbeda (atau satu mendapat "Antrean kosong"). | US-003; FR-008 |
| **BR-021** | Bila tidak ada nomor Menunggu untuk tipe aktif, tampilkan "Antrean kosong" (tanpa suara, tanpa perubahan state). | US-003; FR-011 |

**Panggil Lagi & Lewati**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-022** | Panggil Lagi hanya berlaku untuk nomor yang Sedang Dipanggil di loket itu; status tetap Sedang Dipanggil, `panggil_count` bertambah, kunci loket tidak berubah. | US-004; FR-012 |
| **BR-023** | Lewati hanya untuk nomor Sedang Dipanggil di loket itu; status → Dilewati, kunci `loket_id` dilepas, `dilewati_at` dicatat, nomor masuk section Antrean Dilewati. | US-004; FR-013 |
| **BR-024** | Lewati tidak menghapus nomor — pasien masih bisa dilayani lewat Panggil Ulang. | US-004, US-006; FR-013, FR-015 |

**Status Tombol & Penyelesaian**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-025** | Aturan enable/disable tombol Panggil/Panggil Lagi/Lewati mengikuti kondisi loket (lihat Seksi 10 Status Tombol). | US-005; FR-014 |
| **BR-026** | Status Selesai bersifat final: nomor tidak bisa dipanggil/dilewati lagi (`selesai_at` dicatat, kunci loket dilepas). | US-005; FR-009, FR-016 |
| **BR-027** | Section Antrean Dilewati memiliki button Selesai yang memindahkan nomor ke status final Selesai dan menghilangkannya dari list Antrean Dilewati. | US-005, US-006; FR-016 |

**Panggil Ulang (Recall)**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-028** | Panggil Ulang (recall) harus atomik: bila dua loket memanggil ulang nomor Dilewati yang sama, hanya satu berhasil; yang lain mendapat "Nomor sudah dipanggil loket lain". | US-006; FR-015 |
| **BR-029** | Recall mengubah Dilewati → Sedang Dipanggil, mengunci `loket_id`, menambah `panggil_count`; penyelesaian otomatis juga berlaku pada nomor hasil recall. | US-006; FR-015, FR-009 |

**Display Publik & Audio**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-030** | Susunan kartu loket mengikuti loket aktif dari master; loket yang tidak melayani tetap tampil dengan placeholder "—". | US-007; FR-017 |
| **BR-031** | Saat reconnect setelah koneksi putus, display me-render ulang state terbaru tanpa memutar ulang suara event yang terlewat. | US-007, US-009; FR-020 |
| **BR-032** | Aktivasi audio dilakukan sekali saat memuat ("Aktifkan Suara") untuk membuka audio context (kebijakan autoplay browser). | US-007; FR-018 |

**Suara (Botika TTS)**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-033** | Semua panggilan berbunyi dalam Bahasa Indonesia (suara Botika), tanpa fallback ke bahasa lain. | US-008; FR-019 |
| **BR-034** | Audio di-render Botika di server lalu di-cache (key = teks/kombinasi nomor+loket); bila sudah ada di cache, dipakai langsung tanpa memanggil Botika lagi. | US-008; FR-019 |
| **BR-035** | Default pembacaan: nomor antrean dibaca digit per digit; nomor loket dibaca angka penuh — dapat dikonfigurasi. | US-008; FR-019 |

**Real-Time, Reset & Log**

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-036** | Target latensi siaran < 1 detik dari aksi ke tampilan; state server = sumber kebenaran, klien hanya menampilkan. | US-009; FR-020 |
| **BR-037** | Koneksi real-time putus → klien fallback ke polling berkala + reconnect; saat tersambung, resync state penuh tanpa memutar ulang suara event yang terlewat. | US-009; FR-020 |
| **BR-038** | Penomoran reset pada jam reset yang dikonfigurasi di master; antrean hari sebelumnya diarsipkan. | Scope; FR-021 |
| **BR-039** | Log aktivitas level loket (DB-only) mencatat `loket_id`, `tipe_antrean`, `nomor_antrean`, `action_type`, `panggil_count`, `status_antrean` [Menunggu, Sedang Dipanggil, Dilewati, Selesai], dan timestamp server; tidak ada `user_id` (tanpa login); tidak ditampilkan ke user. | US-010; FR-022 |

## 9. State Machine — Status Antrean

### 9.1 Empat Kondisi

| State | Makna |
|-------|-------|
| **Menunggu** | Nomor sudah diterbitkan, belum dipanggil. |
| **Sedang Dipanggil** | Nomor sedang dipanggil di sebuah loket dan dikunci ke `loket_id` itu. |
| **Dilewati** | Nomor dilewati; kunci loket dilepas; tampil di section Antrean Dilewati. |
| **Selesai** | Status terminal/final; nomor tidak bisa dipanggil/dilewati lagi. |

> Enumerasi state sesuai `status_antrean` pada log (BR-039).

### 9.2 Transisi

| Dari → Ke | Pemicu | Efek utama |
|-----------|--------|------------|
| Menunggu → Sedang Dipanggil | Panggil | Kunci `loket_id`; catat `dipanggil_at`; `panggil_count` = 1 (BR-015, BR-018). |
| Sedang Dipanggil → Sedang Dipanggil (tetap) | Panggil Lagi | `panggil_count` bertambah; status & kunci tidak berubah (BR-022). |
| Sedang Dipanggil → Dilewati | Lewati | Lepas kunci; catat `dilewati_at`; masuk Antrean Dilewati (BR-023). |
| Sedang Dipanggil → Selesai | Penyelesaian otomatis saat panggil nomor berikutnya | Catat `selesai_at`; lepas kunci; final (BR-017, BR-026). |
| Dilewati → Sedang Dipanggil | Panggil Ulang (recall, atomik) | Kunci `loket_id`; `panggil_count` bertambah (BR-028, BR-029). |
| Dilewati → Selesai | Button Selesai di section Antrean Dilewati | Keluar dari list Antrean Dilewati; final (BR-027). |

### 9.3 Catatan Terminal

- Status **Selesai** bersifat final (BR-026).
- Penyelesaian otomatis juga berlaku untuk nomor hasil recall (BR-029).
- Skenario B menyebut istilah **"Dilayani (tutup)"** untuk kondisi ini; diasumsikan setara "Selesai" — lihat Pertanyaan Terbuka Q8.

## 10. Status Tombol Pemanggilan & Penyelesaian Otomatis

### 10.1 Matriks Enable/Disable Tombol

| Kondisi loket | Panggil | Panggil Lagi | Lewati |
|---------------|:-------:|:------------:|:------:|
| Belum ada antrean masuk (tidak ada antrean, belum ada yang dipanggil) | disable | disable | disable |
| Ada antrean menunggu, belum ada yang dipanggil di loket ini | enable | disable | disable |
| Sedang memanggil sebuah nomor, masih ada antrean menunggu berikutnya | enable | enable | enable |
| Sedang memanggil nomor terakhir/satu-satunya (tidak ada berikutnya) | disable | enable | disable |

### 10.2 Penyelesaian Otomatis

- **Tidak ada tombol Selesai terpisah** pada alur pemanggilan utama. Saat petugas klik Panggil untuk nomor berikutnya, nomor yang sedang dipanggil di loket itu otomatis berstatus Selesai (`selesai_at` dicatat, kunci loket dilepas) sebelum nomor baru dikunci.
- Penyelesaian otomatis juga berlaku untuk nomor hasil **Panggil Ulang (recall)**: saat petugas memanggil nomor berikutnya, nomor recall yang sedang dipanggil otomatis Selesai.
- Status Selesai bersifat final: nomor tidak bisa dipanggil/dilewati lagi.
- **Pengecualian — section Antrean Dilewati:** untuk penyelesaian antrean pada section ini tersedia button **Selesai** yang akan menghilangkan antrean dari list Antrean Dilewati.

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Buka Tampilan Penerbitan** — via tautan/URL (tanpa login) di kiosk/APM atau layar petugas penerbit; menampilkan logo & nama RS + tombol tipe antrean aktif dari master. | US-001; BR-001, BR-003, BR-006 |
| **FR-002** | **Terbitkan nomor atomik** — menerbitkan nomor berikutnya per tipe (prefix + urut dari skema master) secara atomik; catat `tipe_antrean` & `diterbitkan_at`. | US-001; BR-007, BR-008, BR-009 |
| **FR-003** | **Cetak otomatis via browser & tampilan otomatis hilang** — nomor tampil di layar, lalu sistem memicu cetak otomatis lewat mekanisme cetak bawaan browser (cetak senyap/otomatis ke printer default, mis. thermal); saat proses cetak selesai (`afterprint`), sistem menandai nomor **"Sudah Tercetak"** yang memicu tampilan nomor otomatis hilang (kembali ke pemilihan tipe). Bila printer bermasalah, status tetap Belum Tercetak dan nomor tetap terbit. | US-001; BR-011 |
| **FR-004** | **Sinkron tipe aktif** — tombol tipe yang dinonaktifkan di master hilang dari Tampilan Penerbitan. | US-001; BR-006 |
| **FR-005** | **Buka Tampilan Pemanggilan** — via tombol "Antrean Masuk" di dashboard Pendaftaran RJ (navigasi, tanpa login tambahan, tanpa pertukaran data registrasi/check-in). | US-002; BR-001, BR-012 |
| **FR-006** | **Pilih loket & tipe aktif** — pilih loket dari master (terikat ke sesi/perangkat) + pilih tipe aktif (dipetakan ke loket itu di master; bisa satu/beberapa). | US-002; BR-013, BR-014 |
| **FR-007** | **Tampilkan status per tipe aktif** — total antrean, nomor sedang dipanggil di loket ini, sisa antrean menunggu, dan nomor berikutnya. | US-002; BR-013 |
| **FR-008** | **Panggil (claim & kunci atomik)** — ambil satu nomor Menunggu berikutnya, kunci ke `loket_id`, catat `dipanggil_at` & `panggil_count`=1; siarkan event + suara. | US-003; BR-004, BR-015, BR-016, BR-018, BR-020 |
| **FR-009** | **Penyelesaian otomatis** — memanggil nomor berikutnya otomatis menyelesaikan nomor sebelumnya di loket itu (`selesai_at`, lepas kunci) sebelum nomor baru dikunci; tanpa tombol Selesai. | US-003, US-005; BR-017, BR-026 |
| **FR-010** | **Tolak panggil-ganda** — bila nomor sudah diklaim loket/sesi lain, tolak & tampilkan "sudah dipanggil di Loket [n]". | US-003; BR-019 |
| **FR-011** | **Antrean kosong** — bila tidak ada nomor Menunggu untuk tipe aktif, tampilkan "Antrean kosong" (tanpa suara/perubahan state). | US-003; BR-021 |
| **FR-012** | **Panggil Lagi** — putar ulang suara nomor Sedang Dipanggil; `panggil_count` bertambah; status & kunci loket tetap. | US-004; BR-022 |
| **FR-013** | **Lewati** — Sedang Dipanggil → Dilewati; lepas kunci; catat `dilewati_at`; masuk section Antrean Dilewati. | US-004; BR-023, BR-024 |
| **FR-014** | **Status tombol (enable/disable)** — atur ketersediaan Panggil/Panggil Lagi/Lewati per kondisi loket (Seksi 10.1). | US-005; BR-025 |
| **FR-015** | **Panggil Ulang (recall) atomik** — dari Antrean Dilewati: Dilewati → Sedang Dipanggil, kunci `loket_id`, `panggil_count` bertambah; tayang & suara ulang; klaim atomik. | US-006; BR-028, BR-029 |
| **FR-016** | **Selesai dari Antrean Dilewati** — button Selesai → status final Selesai; nomor keluar dari list Antrean Dilewati. | US-005, US-006; BR-027 |
| **FR-017** | **Display Publik** — via tautan/URL: kartu per loket (Sedang Dipanggil besar + Berikutnya kecil), section Antrean Dilewati, logo & nama RS permanen, placeholder "—" untuk loket idle; read-only. | US-007; BR-003, BR-005, BR-030 |
| **FR-018** | **Aktivasi & pemutaran audio display** — aktivasi sekali ("Aktifkan Suara"); putar chime + suara pada event panggil/panggil ulang. | US-007, US-008; BR-032 |
| **FR-019** | **Suara Botika Bahasa Indonesia** — susun teks, render Botika server-side + cache (reuse dari cache), putar via HTML5/Web Audio; nomor digit-per-digit, loket angka penuh (dapat dikonfigurasi). | US-008; BR-033, BR-034, BR-035 |
| **FR-020** | **Penyiaran real-time** — siarkan event state (SSE/WebSocket, fallback polling) < 1 detik; state server = sumber kebenaran; resync penuh saat reconnect tanpa memutar ulang suara terlewat. | US-009; BR-004, BR-036, BR-037 |
| **FR-021** | **Reset harian & arsip** — reset penomoran pada jam reset dari master; arsipkan antrean hari sebelumnya. | Scope; BR-038 |
| **FR-022** | **Log aktivitas (DB-only)** — catat `loket_id`, `tipe_antrean`, `nomor_antrean`, `action_type`, `panggil_count`, `status_antrean`, timestamp server; tanpa `user_id`; tidak ditampilkan. | US-010; BR-039 |

## 12. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **pasien yang baru datang (atau petugas penerbit yang membantu)**, saya ingin **menerbitkan/mencetak nomor antrean pendaftaran sesuai kategori/tujuan/tipe tanpa perlu login**, supaya **pasien bisa langsung menunggu dipanggil ke loket**. | 1) Given tautan penerbitan dibuka di kiosk/APM atau layar petugas, Then layar menampilkan logo & nama RS dan hanya tipe antrean yang aktif di master (BR-003, BR-006). 2) When menekan satu tipe, Then satu nomor terbit (prefix + padding dari master) baik mode pasien maupun petugas, dan nomor tersebut **tampil di layar** (BR-008, BR-010). 3) Then sistem **memicu cetak otomatis** via mekanisme cetak browser; saat cetak selesai (`afterprint`) nomor ditandai **"Sudah Tercetak"**, tampilan nomor **otomatis hilang** & layar kembali ke pemilihan tipe (BR-011). 4) Then nomor muncul di display publik & tampilan pemanggilan loket terkait < 1 detik. 5) When printer bermasalah, Then nomor tetap terbit (BR-011). | FR-001–FR-004 |
| **US-002** | Sebagai **petugas loket**, saya ingin **membuka tampilan pemanggilan tanpa login, memilih loket yang saya operasikan, dan menentukan tipe antrean yang saya layani**, supaya **saya bisa memanggil pasien yang tepat dari antrean yang tepat**. | 1) Given berada di dashboard Pendaftaran RJ, When menekan "Antrean Masuk", Then tampilan pemanggilan terbuka tanpa login tambahan & tanpa membaca/memicu data registrasi/check-in (BR-012). 2) When memilih loket, Then sistem menampilkan tipe aktif yang dipetakan ke loket itu (BR-013). 3) Then layar menampilkan total, sedang dipanggil, sisa, dan berikutnya untuk tipe aktif, konsisten dengan state terpusat (BR-014). | FR-005–FR-007 |
| **US-003** | Sebagai **petugas**, saya ingin **memanggil pasien berikutnya dengan satu klik dan yakin nomor itu hanya menjadi milik loket saya**, supaya **tidak terjadi tabrakan dengan loket lain seperti di v1**. | 1) When klik Panggil, Then diambil tepat satu nomor Menunggu berikutnya, dikunci ke loket pemanggil (BR-015, BR-018). 2) Then loket lain tidak bisa memanggil nomor yang sama; loket berbeda bisa memanggil nomor berbeda bersamaan (BR-016, BR-020). 3) When dua loket klik Panggil hampir bersamaan, Then masing-masing mendapat nomor berbeda (atau satu mendapat "Antrean kosong") (BR-020, BR-021). 4) When memanggil berikutnya, Then nomor sebelumnya otomatis Selesai (BR-017). 5) Then tombol Panggil Lagi & Lewati aktif; event & suara tampil < 1 detik. | FR-008–FR-011 |
| **US-004** | Sebagai **petugas**, ketika pasien yang saya panggil belum muncul, saya ingin **bisa memutar ulang panggilan atau melewatinya**, supaya **antrean tetap jalan**. | 1) When klik Panggil Lagi, Then suara nomor yang sama diputar ulang tanpa mengubah status (BR-022). 2) When klik Lewati, Then nomor pindah ke Antrean Dilewati & kunci loket dilepas (BR-023). 3) Then nomor yang dilewati muncul di section Antrean Dilewati pada display publik < 1 detik. | FR-012, FR-013 |
| **US-005** | Sebagai **petugas**, saya ingin **tombol Panggil/Panggil Lagi/Lewati aktif hanya saat memang bisa dipakai, dan tidak perlu menekan Selesai terpisah**, supaya **alur memanggil sederhana dan tidak salah klik**. | 1) When belum ada antrean masuk, Then ketiga tombol disable. 2) When ada antrean Menunggu & belum ada yang dipanggil, Then hanya Panggil enable. 3) When sedang memanggil & ada berikutnya, Then Panggil Lagi & Lewati enable. 4) When hanya tersisa 1 nomor / antrean habis di akhir, Then hanya Panggil Lagi enable (Seksi 10.1). 5) Then memanggil berikutnya otomatis menyelesaikan nomor aktif (BR-017); button Selesai (section Dilewati) memindahkan nomor ke final Selesai (BR-027). | FR-009, FR-014, FR-016 |
| **US-006** | Sebagai **petugas**, ketika pasien yang sempat terlewat akhirnya datang, saya ingin **memanggilnya ulang dari daftar Antrean Dilewati**, supaya **ia tetap terlayani tanpa harus ambil nomor baru**. | 1) Given melihat section Antrean Dilewati, When memilih nomor & klik Panggil Ulang, Then cek atomik status Dilewati → ubah ke Sedang Dipanggil, kunci ke loket ini (BR-029). 2) Then display menayangkan & menyuarakan ulang; section Antrean Dilewati diperbarui. 3) When dua loket recall nomor Dilewati sama, Then hanya satu berhasil; lainnya dapat "Nomor sudah dipanggil loket lain" (BR-028). 4) When klik Selesai, Then nomor keluar dari Antrean Dilewati (final). | FR-015, FR-016 |
| **US-007** | Sebagai **pasien yang menunggu**, saya ingin **melihat layar yang jelas menampilkan nomor yang sedang dipanggil dan ke loket mana, plus nomor-nomor yang terlewat**, supaya **saya tahu kapan dan ke mana harus menuju**. | 1) Given display dibuka via link di TV/monitor (tanpa login), Then logo & nama RS selalu tampil (BR-003). 2) Then tiap loket aktif punya kartu: Sedang Dipanggil (besar) + Berikutnya (kecil); loket idle tampil "—" (BR-030). 3) Then section Antrean Dilewati menampilkan nomor berstatus Dilewati. 4) Then display diperbarui real-time < 1 detik dari aksi petugas; reconnect me-render ulang state tanpa memutar ulang suara terlewat (BR-031). | FR-017, FR-018 |
| **US-008** | Sebagai **pasien**, saya ingin **mendengar panggilan yang jelas dalam Bahasa Indonesia yang langsung berbunyi begitu petugas memanggil**, supaya **saya tidak ketinggalan giliran karena suara telat, tidak bunyi, atau salah bahasa seperti di v1**. | 1) Then semua panggilan berbunyi Bahasa Indonesia (Botika), tanpa fallback bahasa lain (BR-033). 2) Then jeda event panggil → suara mulai < 1 detik (audio dari cache) (BR-034). 3) Then suara berbunyi di seluruh browser target (Chrome, Firefox, Edge versi didukung). 4) Then nomor dibaca digit per digit; loket angka penuh (default, dapat dikonfigurasi) (BR-035). | FR-018, FR-019 |
| **US-009** | Sebagai **pasien/petugas**, saya ingin **display dan tampilan pemanggilan selalu sinkron dengan kejadian terbaru**, supaya **nomor yang dipanggil langsung muncul di layar**. | 1) Then perubahan state tampil di semua klien terhubung < 1 detik (BR-036). 2) When koneksi putus lalu pulih, Then klien resync ke state terbaru tanpa duplikasi/suara berulang (BR-037). 3) Then tidak ada klien yang menampilkan state bertentangan dengan server (BR-036). | FR-020 |
| **US-010** | Sebagai **pengelola**, saya ingin **ada catatan aktivitas antrean (siapa loket yang memanggil apa dan kapan) untuk investigasi, walau tanpa login**. | 1) Then setiap aksi tercatat dengan loket, nomor, tipe, jenis aksi, dan timestamp (BR-039). 2) Then log tidak ditampilkan di tampilan mana pun; hanya via DB. 3) Then tidak ada `user_id` (sesuai keputusan tanpa login). | FR-022 |

> **Catatan prioritas:** kolom Prioritas (P) pada tabel Business Requirement di sumber **kosong** — level P0/P1/P2 per fitur belum ditetapkan. Lihat Pertanyaan Terbuka Q1.

## 13. Data Requirements (Spesifikasi Field)

> Field antrean & konfigurasi (loket, tipe antrean, skema penomoran, jam reset, waktu tunggu) **reuse definisi kanonik dari Master Manajemen Loket** — nama, tipe, format, validasi harus sama. Modul ini hanya mengonsumsi.
> Penomoran section field mengikuti sumber (C, D, E, F). Section **A & B tidak ada di sumber** — lihat Pertanyaan Terbuka Q5. Section **D (Pengaturan Antrean) dipindah ke master** dan dipertahankan sebagai penanda (tombstone) agar pemetaan ke sumber tetap jelas.

### A. Antrean Pendaftaran Staff — Filter (FR-006)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| pilih_loket | Pilih Loket | dropdown (single) | — | Daftar loket **bersumber dari master data manajemen loket / meja antrean** (bukan hardcoded) | Master data manajemen loket / meja antrean · Default: Kosong | Read-only terhadap master; hanya memilih, tidak mengelola daftar loket. |


### B. Antrean Pendaftaran Staff — Dashboard Antrean (FR-007, FR-008, FR-012, FR-013)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No | Generate by sistem (nomor urutan) | numerik | — | Read-only. |
| Tujuan/Kategori Tipe Antrean | **Layanan** yang disetting pada master data manajemen loket / meja antrean | text | — | Read-only. Bukan dari proses pendaftaran — mengikuti "layanan" yang dipetakan ke loket/tipe di master (konsisten dengan BR-012: tidak ada pertukaran data dengan registrasi/check-in). |
| Total Antrean | Total nomor antrean yang terbit untuk layanan/tipe tersebut (dari state antrean modul) | numerik | — | Read-only. Dihitung dari nomor terbit per layanan/tipe (master), bukan dari data pendaftaran. |
| Antrean Saat Ini | Terisi ketika klik "Panggil" | text (mis. A-001) | — | Default: `-` · Read-only. |
| Sisa Antrean | Total antrean − antrean yang sudah dipanggil (mis. 10 − 1 = 9) | numerik | — | Read-only. |
| Berikutnya | Nomor antrean berikutnya yang akan dipanggil | text (mis. A-001) | — | Read-only. |
| Button Panggil | — | button | — | Aksi Panggil (FR-008). |
| Button Panggil Lagi | — | button | — | Aksi Panggil Lagi (FR-012). |
| Button Lewatin Antrean | — | button | — | Klik → data antrean masuk ke section "Antrean Dilewati" (FR-013). *(Sumber menulis "Button panggil" pada baris ini — kemungkinan salah tulis untuk tombol Lewati; lihat Q10.)* |

### F. Antrean Pendaftaran Staff — Dashboard Antrean — Section Antrean Dilewati (FR-015, FR-016)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No | Generate by sistem (nomor urutan) | numerik | — | Read-only. |
| No Antrean | Nomor antrean yang terbit (dari penerbitan) untuk layanan/tipe terkait | text | — | Read-only. |
| Tujuan | **Layanan** yang disetting pada master data manajemen loket / meja antrean | text | — | Read-only. Mengikuti "layanan" di master, bukan data pendaftaran. |
| Button Panggil | — | button | — | Aksi Panggil Ulang/recall (FR-015). |
| Button Selesai | — | button | — | Klik → data antrean hilang dari section "Antrean Dilewati" (FR-016). |

### G. Data yang Dibuat/Dicatat Sistem saat Aksi (FR-002, FR-008, FR-012, FR-013, FR-015, FR-016)

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| tipe_antrean | Tipe Antrean | referensi | Dari master (saat terbit) | BR-009. |
| diterbitkan_at | Diterbitkan pada | timestamp | Dibuat otomatis saat penerbitan | BR-009. |
| status_cetak | Status Cetak | enum | `Belum Tercetak` (default saat terbit) → `Sudah Tercetak` saat proses cetak browser selesai (event `afterprint`) | BR-011. Transisi ke **Sudah Tercetak** memicu tampilan nomor otomatis hilang & kembali ke layar pemilihan. |
| tercetak_at | Tercetak pada | timestamp | Dibuat otomatis saat status jadi `Sudah Tercetak` | BR-011. |
| loket_id | Loket | referensi | Dikunci saat Panggil/Panggil Ulang | BR-018, BR-029. |
| dipanggil_at | Dipanggil pada | timestamp | Dibuat otomatis saat Panggil | BR-018. |
| panggil_count | Jumlah panggil | numerik | Bertambah saat Panggil/Panggil Lagi/Recall | BR-018, BR-022, BR-029. |
| dilewati_at | Dilewati pada | timestamp | Dibuat otomatis saat Lewati | BR-023. |
| selesai_at | Selesai pada | timestamp | Dibuat otomatis saat penyelesaian (otomatis/Selesai) | BR-017, BR-026. |
| status_antrean | Status Antrean | enum | Menunggu / Sedang Dipanggil / Dilewati / Selesai | Seksi 9; BR-039. |
| action_type | Jenis Aksi | enum | Terbit / Panggil / Panggil Lagi / Lewati / Panggil Ulang / Selesai | BR-039 (log). |

## 14. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Latensi klik "Panggil" → suara mulai berbunyi < 1 detik untuk ≥ 95% panggilan (audio dari cache, bukan render saat panggil). | Metrik; FR-019 |
| **NFR-002** | Performa | Latensi update display publik < 1 detik untuk ≥ 95% perubahan (panggil/lewati/selesai). | Metrik; FR-020 |
| **NFR-003** | Real-Time | Latensi siaran event < 1 detik dari aksi ke semua klien terhubung. | Metrik; FR-020 |
| **NFR-004** | Konsistensi | 100% panggilan keluar dalam Bahasa Indonesia (tanpa fallback bahasa lain). | Metrik; FR-019 |
| **NFR-005** | Kompatibilitas | Suara berbunyi di 100% browser target display (Chrome, Firefox, Edge versi yang didukung). Daftar versi pasti `[PERLU KONFIRMASI Q3 — Config 3]`. | Metrik; FR-018 |
| **NFR-006** | Integritas/Konsistensi | 0 kasus satu nomor antrean tercatat dipanggil dua loket berbeda dalam waktu bersamaan (penguncian atomik terpusat). | Metrik; FR-008 |
| **NFR-007** | Skalabilitas/Operasional | Mendukung interval pemanggilan antar pasien ≤ 30 detik tanpa hambatan teknis (target operasional, bukan paksaan sistem). | Metrik |
| **NFR-008** | Keandalan | Printer down → nomor tetap terbit & tampil besar di layar; koneksi real-time putus → fallback polling + resync state penuh saat pulih. | FR-003, FR-020 |
| **NFR-009** | Keamanan/Akses | Ketiga tampilan tanpa login; Tampilan Penerbitan hanya bisa menerbitkan nomor (tanpa akses data pasien/fungsi lain); tombol "Antrean Masuk" murni navigasi. | BR-001, BR-012 |
| **NFR-010** | Auditabilitas | Semua aksi tercatat di log DB-only dengan timestamp server; tanpa `user_id`; tidak ditampilkan ke user. | FR-022 |

## 15. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Master Manajemen Loket** | Sumber konfigurasi: loket, kategori/tipe antrean, pemetaan loket↔tipe, skema penomoran, jam reset, waktu tunggu. | Internal (PRD terpisah) | FR-001, FR-004, FR-006, FR-021 |
| **Botika TTS** (Third Party) | Render suara panggilan Bahasa Indonesia (TTS Indonesia neural), server-side + cache. | Third Party / Live | FR-019 |
| **Dashboard Pendaftaran RJ** | Entry navigasi via tombol "Antrean Masuk" ke Tampilan Pemanggilan (tanpa pertukaran data). | Internal | FR-005 |
| **Transport real-time** (SSE/WebSocket, fallback polling) | Penyiaran event state antrean ke display & pemanggilan. | Internal | FR-020 |
| **Thermal printer** (via cetak browser) | Cetak tiket nomor antrean, dipicu lewat mekanisme cetak bawaan browser (cetak senyap/otomatis) ke printer default perangkat penerbit; bila gagal, nomor tetap tampil di layar. | Perangkat | FR-003 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Master Manajemen Loket | **Hard** | Tanpa master, tidak ada loket/tipe/skema penomoran/jam reset → modul tidak berfungsi. |
| Botika TTS | **Hard** (untuk fitur suara) | Tanpa Botika, panggilan suara Bahasa Indonesia tidak dapat dipenuhi. |
| Transport real-time | **Hard** | Tanpa siaran real-time, display & pemanggilan tidak sinkron (< 1 detik tak terpenuhi). |
| Dashboard Pendaftaran RJ | **Soft** (navigasi) | Tanpa tombol "Antrean Masuk", entry pemanggilan perlu jalur alternatif. |
| Thermal printer | **Soft** | Nomor tetap terbit & tampil di layar sebagai cadangan (BR-011). |

## 16. Risk & Mitigation

> Tabel **Case** di sumber **kosong** (kolom No/Case/Dampak/Mitigasi tanpa isi), padahal Fitur Penerbitan mereferensikan "Case 1". Butir di bawah **hanya menyarikan penanganan tepi yang sudah dinyatakan inline di sumber** (bukan risiko baru). Formalisasi tabel Case → Pertanyaan Terbuka Q2.

| ID | Risiko | Mitigasi (sesuai sumber) |
|----|--------|--------------------------|
| R1 | Dua perangkat penerbit menerbitkan bersamaan → nomor kembar. | Penerbitan atomik di server (BR-007) — *ref. "Case 1" yang belum terisi*. |
| R2 | Dua loket memanggil nomor yang sama (tabrakan seperti v1). | Klaim & penguncian atomik nomor ke `loket_id`; nomor Sedang Dipanggil tak jadi kandidat panggil (BR-004, BR-015, BR-019). |
| R3 | Recall nomor Dilewati yang sama oleh dua loket. | Panggil Ulang atomik; hanya satu berhasil, lainnya "Nomor sudah dipanggil loket lain" (BR-028). |
| R4 | Printer mati/habis kertas atau cetak via browser gagal. | Nomor tetap terbit di sistem & tetap ditampilkan besar di layar sebagai cadangan; tampilan **tidak** otomatis hilang saat cetak gagal (BR-011). |
| R5 | Koneksi real-time putus. | Fallback polling + reconnect; resync state penuh tanpa memutar ulang suara terlewat (BR-037). |
| R6 | Suara telat/tidak bunyi/salah bahasa (masalah v1). | Botika TTS Indonesia, render + cache server-side, diputar dari cache; aktivasi audio sekali di display (BR-032, BR-033, BR-034). |

## 17. Konfigurasi Tenant (Informasi Lain)

| Config | Cakupan | Status |
|--------|---------|--------|
| **Config 1 — Logo & Nama RS** | Ditampilkan permanen di ketiga tampilan (BR-003). | Parameter/sumber logo detail `[PERLU KONFIRMASI Q3]`. |
| **Config 2 — Suara (Botika TTS)** | Engine Botika (TTS Indonesia neural); render + cache server-side; default nomor digit-per-digit + loket angka penuh (BR-033–BR-035). | Parameter suara (voice/kecepatan/pitch) & pengaturan konvensi baca `[PERLU KONFIRMASI Q3]`. |
| **Config 3 — Browser/Perangkat Display yang Didukung** | Browser target: Chrome/Firefox/Edge (versi didukung); perangkat: Smart TV/Android TV/Mini PC/PC. | Daftar versi & perangkat pasti `[PERLU KONFIRMASI Q3]` (terkait NFR-005). |


## 20. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 (Draft awal) | 29 Juni 2026 | Elfira (System Analyst) / Team Product | Draft awal Display Antrean (dokumen sumber). |
| 1.0 (format Generator) | 1 Juli 2026 | Team Product | Konversi ke format Generator Neurovi v2: penambahan ID BR-001–BR-039, US-001–US-010, FR-001–FR-022, NFR-001–NFR-010; seksi State Machine & Status Tombol; Risk & Mitigation dari case inline; seluruh gap sumber ditandai `[PERLU KONFIRMASI]`. Substansi konten dipertahankan penuh. |
| 1.1 | 1 Juli 2026 | Team Product | Perilaku Penerbitan diperjelas: klik tipe → nomor tampil di layar → **cetak otomatis via mekanisme cetak browser** → setelah tercetak, **tampilan nomor otomatis hilang** (kembali ke pemilihan tipe); printer gagal → nomor tetap tampil tanpa auto-hilang. Terpropagasi ke Skenario A, BR-011, FR-003, US-001, baris integrasi printer, Risk R4, Config 3, Asumsi. Ditambahkan Q12 (deteksi "sudah tercetak" & mode cetak senyap/kiosk). |
| 1.2 | 1 Juli 2026 | Team Product | Validasi Rahma: **(1)** auto-hilang → kembali ke layar pemilihan **dikonfirmasi** (ASUMSI dilepas). **(3)** Status **"Sudah Tercetak"** (via `afterprint`) dikonfirmasi sebagai pemicu auto-hilang → ditambah field `status_cetak` & `tercetak_at` di Data Req G; BR-011/FR-003/US-001 diperbarui. **(2a)** Q6 terjawab — `pilih_loket` bersumber dari master data manajemen loket/meja antrean (bukan hardcoded). **(2b)** Q4/Q9 terjawab — Section D (Pengaturan Antrean) **dihapus/dipindah ke master** (dipertahankan sebagai tombstone; `waktu_tunggu` jadi field master). **(4)** Q7 terjawab — Tujuan/Total di Dashboard (E/F) bersumber dari **"layanan"** yang disetting di master, bukan proses pendaftaran. Q4, Q6, Q7, Q9 dikeluarkan dari Pertanyaan Terbuka; Q12 dipersempit ke tenggat fallback & mode kiosk. |
