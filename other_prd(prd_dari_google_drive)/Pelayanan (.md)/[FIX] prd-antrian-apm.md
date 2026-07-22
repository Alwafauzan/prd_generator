# PRD — Antrian: APM (Check-In Mandiri)

**Related Document:** PRD Pendaftaran Rawat Jalan (B1), Contoh Format Antrean, PRD Display Antrian (B9)
**Versi:** 1.2 - Finalisasi (asumsi & pertanyaan terbuka dikonfirmasi & dibersihkan)

## 1. Overview / Brief Summary

**Modul:** Antrian > APM (Anjungan Pendaftaran Mandiri) — Check-In Mandiri (code **B8**, cluster **Admisi**).

APM Check-In Mandiri adalah titik layanan di mana **pasien rawat jalan yang sudah melakukan booking** memperbarui sendiri status kehadirannya (check-in) melalui mesin Anjungan Pendaftaran Mandiri, tanpa harus antre di loket pendaftaran. Pasien mengidentifikasi dirinya menggunakan **NIK** atau **Nomor Booking**, sistem memvalidasi bahwa pasien memiliki booking untuk **kunjungan hari ini**, lalu menjalankan proses check-in sesuai **jenis penjamin**:

- **BPJS**: sistem membuat **SEP** dan mengirim status check-in **Antrol (Antrean Online) task id 3** ke antrean online BPJS. Bila pembuatan SEP berhasil, pasien berhak mendapat cetakan antrean poliklinik. *(Integrasi live = Phase 2, dihandle Tim Gamma Integrasi di proxy; pada Phase 1 dipakai **mock**.)*
- **Umum & Asuransi**: check-in langsung diproses → cetak antrean poliklinik otomatis bila berhasil.

Bila check-in gagal (apa pun penyebabnya), APM menampilkan **alasan yang jelas** dan **arahan tegas ke loket pendaftaran**, lalu **kembali ke halaman awal URL APM** yang ditentukan. Untuk pasien yang tidak memenuhi syarat BPJS, sistem menyatakannya dengan jelas dan mengarahkan ke loket — bukan sekadar menampilkan error teknis.

**Fokus perbaikan di Neurovi v2:** dukungan **on-screen keyboard** pada mesin APM, **log check-in** (menambahkan/membatalkan pasien), serta **log bridging BPJS** dan **clear statement** kondisi loading proses bridging ketika lambat, agar pasien dapat terinfo bahwa response BPJS yang lama, dan bukan kesalahan internal sistem, **clear statement** untuk pasien yang tidak memenuhi kondisi menggunakan BPJS agar menuju ke loket pendaftaran (tiga item terakhir dihandle di proxy oleh Tim Gamma Integrasi).

> Sumber utama: Lampiran `PRD_Pendaftaran_Rawat_Jalan.pdf` + draft user. Ruang lingkup dibagi **Phase 1** (alur inti + Umum/Asuransi + log check-in) dan **Phase 2** (integrasi BPJS live + log bridging).

## 2. Background

**Kondisi saat ini (Neurovi v1):**

- APM sudah melayani check-in mandiri untuk pasien yang sudah booking. Pasien mencari datanya, lalu sistem memperbarui status kehadiran.
- Untuk pasien BPJS, v1 sudah membuat SEP dan menyentuh antrean online BPJS. Tapi saat respons BPJS lambat, layar APM tidak memberi tahu pasien bahwa keterlambatan berasal dari respons BPJS — pasien mengira mesin hang atau salah, sebagian membatalkan dan menumpuk ke loket -> **akan dihandle di proxy oleh tim Gamma (Integrasi)**
- Pasien yang tidak memenuhi syarat memakai BPJS (mis. kepesertaan tidak aktif, rujukan tidak valid) hanya mendapat pesan error teknis, tanpa arahan tegas untuk ke loket. Petugas sering harus menjelaskan ulang.
- Mesin APM dipakai pasien langsung, banyak di antaranya tidak terbiasa mengetik di layar sentuh, tapi on-screen keyboard belum diperhatikan dalam desain input (NIK/No. Booking).
- Belum ada log khusus untuk aktivitas check-in (menambahkan/membatalkan pasien) maupun untuk transaksi bridging BPJS (request/response SEP & Antrol). Saat ada sengketa atau kegagalan, sulit menelusuri apa yang terjadi → **Terkait log bridging BPJS akan dihandle di proxy oleh tim Gamma (Integrasi)**

**Beban operasional:** Pasien rawat jalan check-in mandiri diperkirakan **300–400 pasien/hari** [sumber: draft user]. Menumpuknya kegagalan ke loket saat jam sibuk menjadi masalah utama.

**Target perbaikan (Neurovi v2):**

1. Pencarian pasien yang jelas dengan **NIK / No. Booking** + dukungan **on-screen keyboard**.
2. Validasi tegas **"hanya pasien booking hari ini"** dengan jalur kembali ke URL APM saat gagal.
3. Bridging BPJS **SEP + Antrol task id 3** dengan status loading yang jujur saat lambat dan **retry otomatis** untuk sinkronisasi antrean *(di proxy)*.
4. **Cetak antrean poliklinik** otomatis saat berhasil.
5. Alur jelas ke loket untuk semua kondisi gagal, termasuk tidak-eligible BPJS.
6. **Log check-in** dan **log bridging BPJS** di database.

## 3. In Scope

### 3.1 Scope Definition

**Phase 1 — Alur inti + Umum/Asuransi + Log check-in**

| No | Area |
|----|------|
| 1 | Titik akses check-in: tombol **"Check-in"** di Dashboard Pendaftaran RJ yang men-generate **URL APM/Check-In**. |
| 2 | Halaman Check-In: logo RS, judul, field input pencarian (**NIK atau No. Booking**), **on-screen keyboard**. |
| 3 | Validasi **hanya pasien dengan booking untuk kunjungan hari ini** yang dapat check-in. Tanpa booking hari ini → error beralasan jelas + arahan ke loket, lalu kembali ke halaman awal URL APM. |
| 4 | Konfirmasi identitas & ringkasan kunjungan (poli, dokter, jam, penjamin, tgl kunjungan) sebelum check-in — semua field **read-only**. |
| 5 | **Skrining batuk** di APM (kontrol keselamatan) sebelum penyelesaian check-in. |
| 6 | Check-in pasien **Umum & Asuransi**: proses langsung → **cetak antrean poliklinik otomatis** bila berhasil. |
| 7 | Penanganan gagal check-in: tampilkan alasan + pesan arahan jelas ke loket, lalu kembali ke halaman awal URL APM. |
| 8 | **Log check-in** pasien di database: aktivitas menambahkan (check-in) dan membatalkan pasien. |
| 9 | **Mock** pencarian antrean ke MJKN & mock kirim ke MJKN (menggantikan integrasi live). |

**Phase 2 — Integrasi BPJS live + Log bridging** *(sebagian dihandle Tim Gamma Integrasi di proxy)*

| No | Area |
|----|------|
| 1 | Integrasi live ke **Mobile JKN** (menggantikan mock pencarian booking & pengiriman status ke MJKN). |
| 2 | Check-in pasien **BPJS**: pembuatan **SEP** + pengiriman **status check-in Antrol task id 3**. Bila SEP berhasil → berhak cetak antrean poliklinik. *(di proxy)* |
| 3 | Penanganan **respons BPJS lambat**: status loading yang jelas (menunggu respons BPJS, bukan error internal). *(di proxy)* |
| 4 | **Retry otomatis** di latar belakang untuk pengiriman Antrol task id 3 yang gagal, tanpa menahan pasien. *(di proxy)* |
| 5 | Alur tegas untuk pasien **tidak eligible BPJS** → pernyataan jelas + arahan ke loket (bukan error teknis mentah). *(di proxy)* |
| 6 | **Log bridging BPJS** di database: request/response SEP & pengiriman status antrean. *(di proxy)* |

### 3.2 Out Scope

| No | Scope |
|----|-------|
| 1 | **Pembuatan booking/registrasi awal** — dilakukan pasien di Mobile JKN atau di loket/Pendaftaran (lihat PRD Pendaftaran RJ / B1). APM hanya memperbarui status check-in booking yang sudah ada. |
| 2 | Pendaftaran pasien baru / input data demografi baru di APM. APM hanya untuk pasien terdaftar & sudah booking. |


## 4. Goals and Metrics

### Goals

1. **Mengurangi beban loket** saat jam sibuk dengan memindahkan proses check-in ke self-service APM.
2. Memberi **kepastian & kejelasan** kepada pasien saat proses berjalan lambat (respons BPJS) maupun saat gagal (arahan tegas ke loket).
3. Menyediakan **jejak audit** (log check-in & log bridging BPJS) untuk investigasi sengketa/kegagalan.
4. Meningkatkan **aksesibilitas** input di mesin sentuh via on-screen keyboard.

### Metrics

| Metrik | Success Criteria |
|--------|--------|
| Adopsi check-in mandiri | ≥ 60% pasien booking yang eligible menyelesaikan check-in di APM tanpa ke loket. |
| Waktu pencarian booking | Loading pencarian data booking < 1 detik (proses internal sistem) |
| Waktu proses check-in (internal sistem) | Proses check-in internal < 1 detik untuk Umum/Asuransi|
| Keterlacakan | 100% check-in (tambah & batal) tercatat di log |
| Kejelasan kegagalan | 100% kegagalan check-in menampilkan alasan + arahan ke loket (tidak ada layar gagal tanpa arahan)|

## 5. Related Feature

Fitur terkait dari List Fitur (cluster **Admisi**):

| Code | Module| Feature|
|------|------|-------------|
| - | Pelayanan / Pendaftaran | Pendaftaran Rawat Jalan (loket), Dashboard Pendaftaran RJ (host tombol Check-in — EP-2), data booking & kunjungan, data sosial pasien. |
| - | Integrasi BPJS | VClaim (SEP), Antrol / WS Antrean (status task id) → **Tim Integrasi akan handle di proxy**. |
| - | Integrasi MJKN | Mobile JKN (pencarian booking & push status) — di-mock pada build ini → **Tim Integrasi akan handle di proxy**. **Mock: (1) Mock kirim ke MJKN; (2) Mock pencarian antrian ke MJKN**. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. Pasien booking menghampiri APM, mencari datanya untuk update kehadiran.
2. Untuk pasien BPJS, sistem membuat SEP dan menyentuh antrean online BPJS. Saat respons BPJS lambat, layar tidak menjelaskan penyebabnya → pasien bingung, sebagian batal & pindah ke loket.
3. Pasien yang tidak memenuhi syarat BPJS hanya mendapat error teknis, tanpa arahan tegas ke loket.
4. Input NIK/No Booking dilakukan tanpa dukungan on-screen keyboard yang memadai untuk layar sentuh.
5. Tidak ada log khusus untuk check-in maupun bridging BPJS — sulit menelusuri saat ada kegagalan/sengketa.
6. Setelah berhasil, pasien mendapat cetakan antrean.

### B. To-Be (Neurovi v2)

1. Dari Dashboard Pendaftaran RJ, tombol "Check-In" ditekan → sistem membuat URL Check-In → Halaman Check-In terbuka menampilkan Logo RS, Judul, field input pencarian (NIK / No. Booking), on-screen keyboard.
2. Sistem mencari booking; hanya booking untuk kunjungan hari ini yang dapat check-in. Bila tidak ada → alasan jelas + arahan ke loket → kembali ke halaman awal URL APM.
3. Pasien mengkonfirmasi atau melakukan check-in ringkasan kunjungan (read-only) → menjawab skrining batuk.
4. Check-in sesuai penjamin: 
   - **BPJS**: sistem membuat SEP + kirim status check-in (Antrol task id 3). Saat menunggu
respons BPJS yang lambat, layar menyatakan "sedang menunggu respons BPJS" dengan jelas. Bila SEP berhasil → cetak antrean. Bila pengiriman task id 3 gagal → retry otomatis di latar belakang, tanpa menahan pasien.
   - **Umum & Asuransi**: check-in langsung → cetak antrean otomatis.
5. Cetak antrean poliklinik.
6. Bila gagal (termasuk tidak eligible BPJS) → APM menyatakan alasan + arahan ke loket → kembali ke halaman awal URL APM.
7.Setiap check-in (tambah/batal) dan setiap transaksi bridging BPJS dicatat di log untuk audit.

## 7. Main Flow / Mindmap

**Aktor:** Pasien (utama), Sistem APM/Neurovi, Sistem Integrasi (proxy BPJS — Tim Gamma), Petugas Loket Pendaftaran (fallback saat gagal).

**Trigger:** Pasien ter-booking datang ke mesin APM / membuka URL APM Check-In.

### Skenario 1 — BPJS, Umum & Asuransi
1. Buka halaman Check-In (logo RS, judul, field pencarian, on-screen keyboard).
2. Pasien input **NIK** (16 digit angka) atau **No. Booking** (numerik atau alfanumerik, mis. `20262903001` atau `RJK-20262903001`) → Sistem auto melakukan loading pencarian. Sistem mencari data booking (loading target < 1 detik). (Pada build ini, pencarian booking dari Mobile JKN di-mock).
3. Sistem cari booking. *(Gateway: booking hari ini ada?)* → **Ya**: lanjut. Jika **Tidak** maka menampilkan validasi.
4. Validasi booking hari ini. Sistem memeriksa apakah pasien punya booking untuk kunjungan hari ini:
   a. Tidak ditemukan → pop up "Mohon Maaf" / "Kode booking tidak ditemukan" / [OK] → kembali ke titik awal.
   b. Tanggal akan datang → pop up "Mohon Maaf" / "Tanggal Rencana Kunjungan Anda: [DD-MM-YYYY]. Silakan Datang Pada Hari Sesuai Dengan Rencana Kunjungan Anda" / [OK] → kembali ke titik awal.
   c. Ada & hari ini → lanjut.
5. Validasi NIK. Sistem memeriksa apakah pasien memiliki NIK yang sudah terdaftar:
   a. NIK belum terdaftar -> pop up “Pasien Tidak Dapat Check-In” / “Mohon Maaf Data NIK Anda Belum Terdaftar. Silakan Melengkapi Data ke Bagian Pendaftaran Untuk Melanjutkan Proses Check-In” / [OK] -> kembali ke titik awal
6. Tampilkan **Detail Pasien (ringkasan kunjungan) read-only** — 8 field sesuai arahan: Nama Pasien, Tanggal Lahir, Alamat, Tanggal Kunjungan, Tipe Penjamin, Poli Tujuan, Jam Praktik, Dokter. Sumber = data sosial pasien / data layanan klinik internal **atau** dari MJKN.
7. **Skrining batuk**. Pertanyaan "Apakah pasien batuk?" (radio button, wajib, default: **Tidak**).
8. Pasien konfirmasi **Check-in** → sistem set status hadir.
   a. BPJS: a. Sistem membuat SEP (VClaim). Selama menunggu, layar menampilkan status "Sedang memproses check-in BPJS — menunggu respons BPJS". Bila melewati ambang waktu, tegaskan bahwa keterlambatan berasal dari respons BPJS, bukan kesalahan sistem. b. SEP berhasil → pasien berhak cetak antrean (lanjut step 9). Sistem juga mengirim status check-in Antrol task id 3. Bila pengiriman task id 3 gagal → retry otomatis di latar belakang (tidak menahan pasien, cetak antrean tetap jalan). c. SEP gagal atau pasien tidak eligible BPJS (kepesertaan tidak aktif, rujukan/kontrol tidak valid, dll.) → check-in gagal → tampilkan alasan + arahan ke loket -> Tim Integrasi akan handle di proxy.
   b. Umum & Asuransi: a. Sistem memproses check-in (loading < 1 detik). b. Berhasil → lanjut cetak antrean. Gagal → alasan + arahan ke loket.
9. **Cetak antrean poliklinik** otomatis -> berhasil. Kembali ke halaman awal URL APM (otomatis setelah jeda)
10. Gagal check-in. APM menampilkan alasan kegagalan + pesan arahan jelas ke loket pendaftaran. Catat log (gagal/batal sesuai kondisi). Tombol/jeda kembali ke halaman awal URL APM.
11. Tulis **log check-in (tambah)** → kembali ke halaman awal URL APM.

## 8. Business Rules

| ID | Rule | Sumber |
|----|------|--------|
| **BR-001** | Hanya pasien dengan **booking untuk kunjungan hari ini** yang boleh check-in. Booking tidak ada hari ini → gagal + arahan ke loket. | draft user #1; lampiran |
| **BR-002** | Pencarian pasien di APM hanya boleh via **NIK** atau **No. Booking**. | draft user #1 |
| **BR-003** | Semua field **Detail Pasien** pada layar konfirmasi bersifat **read-only** (tidak dapat diubah di APM). | draft user (Detail Pasien); lampiran |
| **BR-004** | Pasien **Umum & Asuransi**: bila check-in berhasil → **cetak antrean poliklinik otomatis**. | draft user #5 |
| **BR-005** | Bila **check-in gagal** apa pun sebabnya → tampilkan **alasan** + **arahan ke loket** → **kembali ke halaman awal URL APM**. | draft user #3; lampiran |
| **BR-006** | Setiap aksi **check-in (tambah)** dan **pembatalan** wajib dicatat ke **log check-in**. | draft aspek logic #1 |
| **BR-007** | Skrining **batuk** dilakukan sebelum penyelesaian check-in sebagai kontrol keselamatan; input **wajib** (mandatory), **default "Tidak"**. | draft user (Skrining Batuk); lampiran (In Scope P1) |
| **BR-008** | Input di APM wajib mendukung **on-screen keyboard**. | draft aspek UX; lampiran |
| **BR-009** | Pada Phase 1, pencarian booking & pengiriman status ke MJKN menggunakan **mock**; integrasi live = Phase 2. | draft (mock); lampiran |
| **BR-010** | **No. Booking** menerima format **numerik** maupun **alfanumerik** (mengandung huruf), mis. `20262903001` atau `RJK-20262903001`; berasal dari Pendaftaran RJ atau dari MJKN. | draft user (Input Pencarian #1) |
| **BR-011** | **NIK** yang di-input di APM harus **16 digit angka**. | draft user (Input Pencarian #2) |
| **BR-012** | Sumber data **Detail Pasien** = data sosial pasien / data layanan klinik internal **atau** dari **MJKN** (data booking yang sama), ditampilkan read-only tanpa membuat definisi tandingan. | draft user (Detail Pasien) |

## 9. User Stories

| ID | User Story | Traceability |
|----|-----------|--------------|
| **US-001** | Sebagai **Pasien**, saya ingin mencari data booking saya dengan **NIK atau No. Booking** dibantu **on-screen keyboard**, agar mudah check-in tanpa mengetik sulit di layar sentuh. | BR-002, BR-008, BR-010, BR-011 |
| **US-002** | Sebagai **Pasien**, saya ingin sistem memastikan saya punya **booking hari ini**, agar tidak salah check-in di hari yang keliru. | BR-001 |
| **US-003** | Sebagai **Pasien**, saya ingin melihat **Detail Pasien (Nama, Tgl Lahir, Alamat, Tanggal Kunjungan, Tipe Penjamin, Poli Tujuan, Jam Praktik, Dokter)** yang read-only sebelum konfirmasi, agar yakin datanya benar. | BR-003, BR-012 |
| **US-004** | Sebagai **Pasien Umum/Asuransi**, saya ingin check-in langsung diproses dan **antrean poliklinik tercetak otomatis**, agar cepat menuju poli. | BR-004 |
| **US-005** | Sebagai **Pasien**, saat check-in **gagal** saya ingin melihat **alasan jelas + arahan ke loket** lalu kembali ke halaman awal, agar tahu langkah berikutnya. | BR-005 |
| **US-006** | Sebagai **Admin/Auditor**, saya ingin **log check-in** tersimpan, agar dapat menelusuri sengketa/kegagalan. | BR-006 |
| **US-007** | Sebagai **Pasien**, saya ingin menjawab **skrining batuk** (radio, default Tidak) sebelum check-in selesai, agar keselamatan terjaga. | BR-007 |
| **US-008** | Sebagai **Petugas Pendaftaran RJ**, saya ingin tombol **Check-in** di Dashboard RJ men-generate URL APM, agar mudah mengaktifkan kanal APM. | Lampiran In Scope P1 #1 |

## 10. Functional Requirements

| ID | Requirement | Prioritas | Phase | Trace |
|----|-------------|-----------|-------|-------|
| **FR-001** | Dashboard Pendaftaran RJ (B1) menyediakan tombol **Check-in** yang men-generate **URL APM/Check-In**. | Must | 1 | US-008 |
| **FR-002** | Halaman Check-In menampilkan **logo RS, judul, field input pencarian (NIK/No. Booking)**, dan **on-screen keyboard**. | Must | 1 | US-001, BR-008 |
| **FR-003** | Sistem mencari booking berdasarkan **NIK (16 digit angka)** atau **No. Booking (numerik/alfanumerik)** dan memvalidasi **booking = kunjungan hari ini**. | Must | 1 | US-002, BR-001/002/010/011 |
| **FR-004** | Bila booking hari ini tidak ditemukan → tampilkan **error beralasan + arahan ke loket** → kembali ke URL APM. | Must | 1 | US-005, BR-005 |
| **FR-005** | Tampilkan layar **Detail Pasien read-only** (Nama, Tgl Lahir, Alamat, Tanggal Kunjungan, Tipe Penjamin, Poli Tujuan, Jam Praktik, Dokter). | Must | 1 | US-003, BR-003/012 |
| **FR-006** | Tampilkan **skrining batuk** (radio button, wajib, default "Tidak", pilihan "Ya"/"Tidak") sebelum penyelesaian check-in; hasil memicu arahan keselamatan. | Must | 1 | US-007, BR-007 |
| **FR-007** | Untuk **Umum/Asuransi**: proses check-in langsung → set status hadir → **cetak antrean poliklinik otomatis**. | Must | 1 | US-004, BR-004 |
| **FR-008** | Sediakan tombol **Kembali** pada layar konfirmasi/loading → kembali ke URL APM. | Must | 1 | US-005 |
| **FR-009** | Catat **log check-in** (event: tambah/check-in & batal) beserta metadata (waktu, pasien, no_booking, mesin/URL, hasil). | Must | 1 | US-006, BR-006 |
| **FR-010** | **Mock** pencarian antrean & pengiriman status ke MJKN pada Phase 1. | Must | 1 | BR-009 |
| **FR-011** | Semua jalur gagal (booking/eligibility/SEP/error sistem) → **auto-redirect** kembali ke halaman awal URL APM. | Must | 1 | US-005, BR-005 |
| **FR-012** | Pada berhasil, **cetak tiket antrean poliklinik** memuat: no antrean, poli, dokter, jam/estimasi, nama pasien, tgl. | Must | 1 | US-004 |

## 11. Data Requirements (Spesifikasi Field)

> Field pasien/penjamin **read-only** di APM di-reuse dari B1/B2 (Konteks PRD terkait) atau dari **MJKN** (data booking yang sama). APM tidak membuat definisi tandingan. Struktur field di bawah mengikuti **arahan user** untuk Input Pencarian, Detail Pasien, dan Skrining Batuk.

### 11.1 Dashboard APM → Input Pencarian (FR-002/003)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_booking | No. Booking | text | Kondisional | **Numerik atau alfanumerik** (boleh mengandung huruf & tanda hubung), mis. `20262903001` atau `RJK-20262903001` | input manual (on-screen keyboard); nomor dari **Pendaftaran RJ** atau dari **MJKN** | wajib bila metode_cari = No. Booking (BR-010); jangan paksa hanya angka |
| nik | NIK | text | Kondisional | **16 digit angka** (numerik saja) | input manual (on-screen keyboard); NIK pasien | wajib bila metode_cari = NIK (BR-011); definisi kanonik (B1/B2) |

*Catatan: minimal salah satu (`no_booking` atau `nik`) wajib diisi; pencarian auto-trigger saat input valid.*

### 11.2 Dashboard APM → Detail Pasien (read-only, FR-005)

Semua field **read-only**. Sumber = data sosial pasien / data layanan klinik internal **atau** dari **MJKN** (data booking yang sama).

| Kolom | Label | Sumber Data | Format Tampilan | Catatan |
|-------|-------|-------------|-----------------|---------|
| nama_pasien | Nama Pasien | Detail **data sosial pasien** (B1) **atau** MJKN → *Nama Lengkap* | text | read-only (BR-003) |
| tgl_lahir | Tanggal Lahir | Detail **data sosial pasien** (B1) **atau** MJKN → *Tanggal Lahir* | tanggal (DD-MM-YYYY) | read-only |
| alamat | Alamat | Detail **data sosial pasien** (B1) **atau** MJKN → *Alamat* | text | read-only |
| tgl_kunjungan | Tanggal Kunjungan | Detail **data layanan klinik** (B1) **atau** MJKN → *Tanggal & Hari* | tanggal + hari | read-only; harus = hari ini (BR-001) |
| tipe_penjamin | Tipe Penjamin | Detail **data layanan klinik** (B1) **atau** MJKN → *Tipe Penjamin* | badge: Umum/BPJS/Asuransi | read-only; menentukan cabang alur check-in |
| poli_tujuan | Poli Tujuan | Detail **data layanan klinik** (B1) **atau** MJKN → *Klinik* | text | read-only |
| jam_praktik | Jam Praktik | Detail **data layanan klinik** (B1) **atau** MJKN → *Jam Praktik* | jam (HH:mm) | read-only |
| dokter | Dokter | Detail **data layanan klinik** (B1, master Staf A2) **atau** MJKN → *Dokter* | text (nama dokter) | read-only |

*Field pendukung BPJS (opsional, tidak tampil di dashboard utama): `no_bpjs` (13 digit, kanonik B1/B2) & `status_kartu` (badge aktif/tidak, VClaim) — hanya relevan pada cabang BPJS Phase 2 (proxy), bukan bagian dari 8 field Detail Pasien arahan user.*

### 11.3 Skrining Batuk (FR-006)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| skrining_batuk | Apakah pasien batuk? | **radio button** | **Ya (mandatory)** | enum: **Ya / Tidak** | manual; **default "Tidak"** | editable; "Ya" → arahan keselamatan (beri masker / arahkan loket/poli khusus) (BR-007) |

### 11.4 Entitas — Log Check-In (FR-009, BR-006)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| log_id | ID Log | text | Ya | unik, auto-generate | auto | |
| event_type | Jenis Event | dropdown | Ya | enum: CHECKIN_ADD / CHECKIN_CANCEL | auto | BR-006 |
| no_booking | No. Booking | text | Ya | numerik/alfanumerik (BR-010) | booking | |
| nik | NIK | text | Tidak | 16 digit angka | input/booking | |
| tipe_penjamin | Penjamin | dropdown | Ya | Umum/BPJS/Asuransi | booking | |
| skrining_batuk | Skrining Batuk | dropdown | Ya | Ya/Tidak | input APM | dari FR-006 |
| hasil | Hasil | dropdown | Ya | enum: SUCCESS / FAILED | auto | |
| alasan_gagal | Alasan Gagal | text | Kondisional | maks 255 char | auto | wajib bila hasil=FAILED |
| sumber_apm | Mesin/URL APM | text | Ya | – | konteks sesi | audit |
| waktu | Timestamp | datetime | Ya | ISO 8601 | auto (server time) |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Loading pencarian data booking **< 1 detik**. | draft user |
| **NFR-002** | Performa | Proses check-in **Umum/Asuransi < 1 detik**. | draft user |
| **NFR-003** | Kapasitas | Mendukung **300–400 check-in mandiri/hari** dengan lonjakan di jam sibuk pagi. | draft user |
| **NFR-004** | Usability | Mendukung **on-screen keyboard** & UI ramah layar sentuh (target besar, alur minim langkah); field pencarian NIK memaksa mode numerik, No. Booking mode alfanumerik. | draft aspek UX; BR-010/011 |
| **NFR-005** | Usability | Pesan gagal harus **manusiawi & jelas** (alasan + arahan ke loket), bukan error teknis mentah. | BR-005 |
| **NFR-006** | Auditability | **100%** transaksi check-in & bridging tercatat di log dengan timestamp server. | BR-006 |
| **NFR-007** | Keamanan/Privasi | Data pasien pada layar publik APM (Detail Pasien) di-mask sebagian (mis. NIK, tgl lahir) & sesi otomatis reset ke halaman awal setelah selesai/idle. | konteks mesin publik |
| **NFR-008** | Kompatibilitas | Berjalan di perangkat/kiosk APM RS tipe C&D (spesifikasi minimum). | draft aspek teknis |
| **NFR-009** | Kompatibilitas | Berjalan di perangkat printer untuk proses cetak antrean. | draft aspek teknis |

## 13. Integrasi Eksternal

| Sistem | Tujuan | Endpoint/Proses | Phase | Penanggung Jawab |
|--------|--------|-----------------|-------|------------------|
| **BPJS VClaim** | Cek eligibility kartu & **buat SEP** | Create SEP (bridging) | 2 | Tim Gamma Integrasi (di proxy) |
| **BPJS Antrol (Antrean Online)** | Kirim **status check-in task id 3** + sinkronisasi antrean | Update antrean online task id 3 | 2 | Tim Gamma Integrasi (di proxy) |
| **Mobile JKN (MJKN)** | Pencarian booking & pengiriman status check-in; **sumber Detail Pasien** (Nama, Tgl Lahir, Alamat, Tanggal & Hari, Tipe Penjamin, Klinik, Jam Praktik, Dokter) | Live (P2) / **Mock** (P1) | 1 mock → 2 live | Tim Integrasi |
| **Modul Pendaftaran RJ (B1)** | Sumber data booking/registrasi & **data sosial pasien / data layanan klinik**; penyedia tombol Check-in & URL APM | Internal (DB/master pasien, booking) | 1 | Tim Admisi |
| **Printer Antrean** | Cetak tiket antrean poliklinik otomatis | Driver/print service | 1 | Tim APM |

**Catatan interoperabilitas & mock:**
- Detail Pasien dapat bersumber dari **data internal RS (B1)** maupun **MJKN** dengan pemetaan field: Nama Lengkap→nama_pasien, Tanggal Lahir→tgl_lahir, Alamat→alamat, Tanggal & Hari→tgl_kunjungan, Tipe Penjamin→tipe_penjamin, Klinik→poli_tujuan, Jam Praktik→jam_praktik, Dokter→dokter.
- Phase 1 wajib menyediakan **mock**: (a) pencarian antrean ke MJKN, (b) kirim status ke MJKN — agar alur end-to-end (termasuk cetak antrean) bisa diuji tanpa integrasi live. [BR-009]
- Bridging BPJS (SEP + Antrol), retry, log bridging, dan penanganan lambat/eligibility **dihandle di proxy oleh Tim Gamma Integrasi** — modul APM menyediakan pemicu, penampilan status, dan konsumsi hasil.