# PRD — Pendaftaran Rawat Jalan (B1)

**Related Document:** BPMN: g-admisi-onsite-registration (Lucidchart: https://lucid.app/lucidchart/73562261-e454-410a-8e4b-8133a20d5551/edit); List Fitur V2.xlsx (sheet MVP Fitur Operasional, cluster Admisi); Draft PRD Pendaftaran Neurovi v2
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

Modul **Pendaftaran Rawat Jalan (RJ)** adalah titik masuk pertama pasien ke rumah sakit pada SIMRS Neurovi: tempat identitas pasien dibuat, penjaminan ditentukan, dan kelengkapan persyaratan layanan diperiksa. Modul melayani jalur RJ melalui **loket (petugas)** dan **Anjungan Pendaftaran Mandiri (APM)**, serta menyiapkan keterhubungan dengan ekosistem wajib (BPJS, SATUSEHAT, Disdukcapil).

Pada v1, modul ini sumber masalah berulang: integrasi BPJS rapuh, rekam medis ganda, risiko salah identitas pada pasien APM, dan alur terlalu banyak langkah. Akarnya: desain belum matang.

Tujuan v2: satu alur pendaftaran baku yang **cepat untuk kasus rutin**, **aktif mencegah kesalahan sejak titik masuk**, menjadikan data pendaftaran sebagai **sumber tunggal** yang langsung tersedia bagi unit hilir, dan **tetap berjalan saat koneksi pihak ketiga terganggu**.

Fokus PRD: **Pendaftaran Rawat Jalan**. Dibagi dua fase: **Phase 1 (Must Have/MVP)** dikerjakan sekarang, **Phase 2 (Nice to Have)** menyusul setelah MVP stabil. Jalur IGD & Rawat Inap memakai fondasi sama namun ditulis di PRD terpisah (B2, B3).

**Target RS**: tipe C & D non-metropolitan, acuan RS PKU Muhammadiyah Wonosobo. Mayoritas pasien BPJS (>70–80% kunjungan), petugas turnover tinggi, internet/listrik tidak stabil.

## 2. Background

Neurovi v1 sudah berjalan di RS PKU Muhammadiyah Wonosobo. Modul pendaftaran dirancang sebelum desain sistem matang → banyak pola menyusahkan di lapangan. Penulisan ulang (v2) memperbaiki fondasi sambil mempertahankan kapabilitas yang terbukti dipakai.

**Profil RS target membentuk karakter masalah:**
- Mayoritas pasien BPJS (>70–80%) → jalur BPJS adalah alur utama, bukan opsi.
- Petugas turnover tinggi, pelatihan singkat → sistem harus memandu, bukan andalkan hafalan SOP.
- Internet/listrik tidak stabil → registrasi harus tetap jalan saat bridging down.

**Masalah v1 + kasus nyata:**

| # | Masalah | Contoh nyata |
|---|---------|--------------|
| 1 | Integrasi BPJS rapuh (beban terbesar) | Pasien belum validasi biometrik tapi SEP terbit → klaim tertolak. VClaim down → pendaftaran tersendat |
| 2 | Risiko salah identitas (terutama APM) | APM tidak cetak barcode identitas → petugas poli isi manual → salah input jenis kelamin (IKP). Satu pasien >1 No.RM (duplikat) |
| 3 | Input menyusahkan & alur berbelit | Registrasi penunjang: nomor order diketik manual, sulit diingat/disalin. Keluhan utama: terlalu banyak langkah/klik untuk kerja rutin |
| 4 | Antrean lambat jam sibuk | Akumulasi langkah berlebih + input manual + ketergantungan koneksi pihak ketiga |

**Kenapa pendaftaran dibenahi lebih dulu:** kesalahan identitas/penjaminan/persyaratan di titik ini terbawa ke seluruh proses hilir (RME poli, billing, klaim BPJS) dan jauh lebih mahal diperbaiki di belakang.

**User behavior (kasus khusus):**
- Pasien rentan (lansia, buta huruf, tanpa smartphone) → wajib ada alur dibantu petugas; APM bukan satu-satunya jalan.
- Kedatangan penunjang di luar jadwal → perlu recall order.
- [ASUMSI] Volume kunjungan RJ harian khas RS C/D: ratusan pasien, puncak pagi hari.

## 3. In Scope

### Scope Definition
Dokumen memuat keseluruhan scope Pendaftaran RJ sebagai roadmap, dibagi dua fase. Pengerjaan saat ini fokus **Phase 1 (MVP)**.

#### PHASE 1 — Must Have (MVP)
**Pendaftaran Onsite (Loket):**
- Dashboard Pendaftaran RJ (filter, tabel, batal periksa).
- **Identifikasi & Registrasi Pasien**: registrasi pasien lama (cari by No.RM/NIK/Nama + verifikasi 2 identitas), tinjau ulang data, pencegahan duplikat RM (matching latar, intervensi hanya bila mirip tinggi), identitas fleksibel tanpa NIK (Paspor/KITAS/bayi/WNA/tak dikenal — No.RM selalu dapat dibuat).
- **Penjaminan**: Umum (jalur penuh), Asuransi (berbasis dokumen, tanpa bridging), Ganti Penjamin guard-aware (penjamin melekat ke encounter), Info Piutang (info-only, tidak memblok).
- **Keselamatan & Skrining**: Skrining Batuk strategi TEMPO (1 pertanyaan, tandai+masker+area terpisah+prioritas, penanda diteruskan ke poli).
- **Layanan, Penunjang & Antrean**: pilih jenis layanan (Klinik/Penunjang/Penunjang+Klinik, incl. MCU) + poli/dokter dari slot Facility Management; **registrasi penunjang via recall order (dropdown)** dukung kedatangan di luar tanggal jadwal; generate+cetak nomor antrean + check-in.
- **Consent & Privasi (UU PDP)**: General Consent (saat pasien/layanan/versi baru), Consent Data Spesifik terpisah (SATUSEHAT/biometrik, penolakan tidak memblok layanan inti).
- **Fitur v1 dipertahankan**: Data Sosial + hak akses berbasis peran, export, print, batal pasien (Administrator), logika penjaminan × jenis layanan incl. MCU.
- **Integritas & Ketahanan**: ketahanan saat pihak ketiga down (terima-lalu-rekonsiliasi), peran & jejak audit, satu sumber data (event-driven), kesiapan integrasi BPJS/SATUSEHAT (port disiapkan, belum aktif).

**Pendaftaran APM (MVP):** check-in mandiri via booking Mobile JKN (logika registrasi sama dengan loket), cetak barcode identitas otomatis (anti-IKP), skrining batuk di APM + fallback loket.

#### PHASE 2 — Nice to Have
- Registrasi pasien baru via Scan KTP/OCR + validasi Disdukcapil.
- Merge/Unmerge RM (Kepala RM / Super Admin, non-destruktif, reversible, audit).
- Riwayat pembatalan pendaftaran.
- **Bridging BPJS aktif**: eligibilitas, SEP, antrean online (Mobile JKN), indikator validasi biometrik (SEP tidak bisa dibuat bila belum biometrik).
- **SATUSEHAT aktif**: kirim Patient/Encounter (FHIR R4).
- Guard klaim lanjutan: peringatan SEP-tanggal & validasi rujukan same-day.

### Out Scope
| # | TIDAK termasuk |
|---|----------------|
| 1 | Penjadwalan dokter & resolusi konflik ruangan (milik Facility Management; pendaftaran hanya pakai slot) |
| 2 | Registrasi IGD & Rawat Inap (PRD terpisah B2/B3) |
| 3 | Billing / perhitungan tarif & pengakuan tanggal billing (modul Billing) |
| 4 | Casemix / klaim INA-CBG (modul terpisah) |
| 5 | Keputusan arsitektur teknis / multi-tenant (ranah engineering) |

## 4. Goals and Metrics

**Goals:**
- Tingkatkan akurasi data pasien.
- Tingkatkan efisiensi proses pendaftaran.
- Sediakan antarmuka mudah digunakan.
- Kurangi bug & kesalahan sistem.
- Dukung operasional RS secara menyeluruh.

**Metrics:**

| # | Metric | Success Criteria |
|---|--------|------------------|
| 1 | Waktu registrasi pasien lama (kasus umum: poli sama, kartu aktif) | ≤ 30 detik / ≤ 3 klik pada UAT |
| 2 | Pencegahan duplikat RM | Jumlah RM ganda baru turun signifikan vs baseline v1 |
| 3 | Keselamatan identitas APM | 0 insiden salah identitas berkas; barcode tercetak otomatis 100% |
| 4 | Kontinuitas layanan saat pihak ketiga down | 0 menit downtime loket akibat BPJS |
| 5 | Efisiensi & otomasi | % registrasi selesai tanpa intervensi manual naik; data hilir tersedia tanpa endpoint terpisah |
| 6 | Kemudahan penggunaan (UX) | ≥ 80% petugas/pasien nilai alur "mudah dipahami & digunakan" pada UAT |

[PERLU KONFIRMASI] Baseline angka v1 untuk metric #2 (jumlah RM ganda/bulan) belum tersedia.

## 5. Related Feature

**Modul/fitur internal terkait:**

| No | Module | Feature |
|----|--------|---------|
| 1 | Master Data (Control Panel) | Unit/Klinik, Tipe Penjamin, Jadwal Dokter, Wilayah (Provinsi/Kab/Kec/Kel), Staf/Dokter |
| 2 | Pendaftaran | Bridging SEP BPJS (Phase 2) |
| 3 | Facility Management | Slot jadwal dokter & ruangan (sumber pilih poli/dokter) |
| 4 | Penunjang (Lab/Radiologi) | Order pemeriksaan (sumber recall order) |
| 5 | Billing | Pengakuan tanggal & tarif (downstream) |

**Cluster Admisi (List Fitur V2, sheet MVP):**
- **[B1] Pendaftaran Rawat Jalan** ← PRD ini
- [B2] Pendaftaran Rawat Inap
- [B3] Pendaftaran Instalasi Gawat Darurat
- [B4] Pendaftaran Laboratorium
- [B5] Pendaftaran Radiologi
- [B6] Pendaftaran Rehabilitasi Medis
- [B7] Pendaftaran MCU
- [B8] Antrian > APM
- [B9] Antrian > Display antrian

Catatan: B1 berbagi fondasi registrasi dengan B2–B7; B8 (APM) tercakup dalam scope APM PRD ini; B9 menerima nomor antrean yang digenerate B1.

## 6. Business Process (As-Is / To-Be)

Prinsip utama: **cepat untuk kasus rutin, aktif mencegah kesalahan di titik berisiko**.

### A. As-Is (kondisi v1)
- Status BPJS & validasi biometrik dicek manual/tidak konsisten → SEP terbit tanpa biometrik → klaim tertolak. *(asumsi dari draft)*
- Pencarian & pencegahan duplikat belum memadai → satu pasien >1 No.RM.
- APM tidak cetak barcode identitas → petugas poli isi manual → IKP (salah jenis kelamin).
- Registrasi penunjang: nomor order diketik manual → susah, salah ketik.
- Banyak langkah/klik untuk kerja rutin → antrean lambat jam sibuk.
- Bridging pihak ketiga down → loket ikut berhenti.

### B. To-Be (turunan BPMN g-admisi-onsite-registration)
Alur per tahap (lane: Pasien, Petugas Pendaftaran, Sistem/Integrasi):

**A. Identifikasi & Registrasi Pasien** — `Identifikasi status pasien` → gateway `Pasien baru atau lama?`
- Pasien lama → `Cari data pasien` → `Verifikasi identitas pasien` (2 penanda: nama + tgl lahir).
- Pasien baru → gateway `Metode input data?` → `Scan KTP (OCR)` [Phase 2] / `Input NIK untuk Bridging Disdukcapil` / `Input data pasien baru` → `Verifikasi & lengkapi data pasien`.
- `Duplicate Detection (matching NIK+nama+tgl lahir+alamat)` → gateway `Ada kandidat duplikat?` → Ya: `Konfirmasi gunakan RM existing atau buat baru`; Tidak: lanjut. (Klinis: verifikasi 2 identitas = barrier keselamatan; cegah RM ganda jaga riwayat utuh.)

**B. Skrining Keselamatan (TEMPO)** — `Screening gejala awal: Batuk?` → gateway Ya: `Arahkan ke ruang isolasi & berikan masker` + `Set flag Pasien Batuk/Tempo (visible unit downstream)`; Tidak: lanjut. (Klinis: TB airborne; pisahkan dini lindungi pasien/petugas; PPI TB + akreditasi.)

**C. Pemilihan Layanan, Poli & Penjamin** — `Pilih jenis layanan: Klinik / Klinik & Penunjang / Penunjang` (incl. MCU → `Pilih paket MCU`) → `Pilih poli dan dokter` (slot Facility Management) → `Pilih jenis penjaminan` → gateway `Jenis penjaminan?`. (Bisnis: penjamin melekat encounter; slot dari modul jadwal cegah double-book.) Info piutang ditampilkan (info-only).

**D. Registrasi Penunjang (Recall Order)** — pasien dengan order dokter → pilih dari dropdown (nomor order, dokter pengirim, jenis pemeriksaan); dukung kedatangan beda tanggal. Tanpa order → buat permintaan baru (Lab Klinik / Patologi Anatomi).

**E. Jalur BPJS [Phase 2]** — `Cek status kartu BPJS` → gateway `Kartu aktif?` → Tidak: event `Kartu tidak aktif` (arahkan umum); Ya: `Verifikasi biometrik` → gateway `Eligibility valid?` → valid: `Penerbitan SEP` → event `SEP berhasil dibuat`; tidak valid: event `Eligibility tidak valid`. Jalur Asuransi: `Verifikasi kelengkapan dokumen asuransi` → `Input data asuransi`.

**F. Pendaftaran Mandiri (APM)** — booking Mobile JKN → input nomor/kode/NIK → konfirmasi → cetak antrean + **barcode identitas** → tunggu di poli. Tanpa booking/data tak lengkap/butuh consent → fallback loket.

**G. Penyelesaian** — `Generate nomor antrian` → `Cetak nomor antrean` → event `Pendaftaran selesai`; data otomatis tersedia real-time di unit hilir (poli/billing/RME) → event `Siap dipanggil di poli`.

**H. Ketahanan saat Pihak Ketiga Down** — registrasi internal tidak bergantung BPJS/Disdukcapil/SATUSEHAT; panggilan gagal diterima dulu → diantrekan retry otomatis; record ditandai "menunggu sinkron" + masuk daftar kerja petugas.

## 7. Main Flow / Mindmap

### Skenario 1 — Pasien Lama, Umum (happy path, target ≤3 klik)
1. [Pasien] Datang ke loket.
2. [Petugas] Identifikasi status → pilih **Pasien lama**.
3. [Petugas] Cari by No.RM/NIK/Nama → verifikasi 2 identitas (nama + tgl lahir).
4. [Sistem] Tampilkan info piutang (info-only).
5. [Petugas] Pilih jenis layanan → poli & dokter (slot tersedia) → penjamin **Umum**.
6. [Petugas] Skrining batuk → Tidak.
7. [Sistem] Generate + [Petugas] cetak nomor antrean. → **Pendaftaran selesai**.

### Skenario 2 — Pasien Baru (input NIK Disdukcapil)
1. Identifikasi → **Pasien baru** → Metode input: Input NIK (bridging Disdukcapil) / manual / [Phase 2] Scan KTP OCR.
2. [Sistem] Call API Disdukcapil → tarik demografi. Bila gagal → lanjut manual, tandai menunggu sinkron.
3. Verifikasi & lengkapi data.
4. [Sistem] Duplicate Detection. Bila kandidat duplikat → konfirmasi gunakan RM existing / buat baru (wajib alasan).
5. Skrining batuk → pilih layanan/poli/penjamin → antrean.

### Skenario 3 — BPJS [Phase 2]
1. Pilih penjamin BPJS → [Sistem] Cek status kartu.
2. Kartu tidak aktif → event Kartu tidak aktif → arahkan Umum.
3. Kartu aktif → Verifikasi biometrik → Eligibility valid? → Penerbitan SEP → SEP berhasil dibuat → terima data SEP → antrean.

### Skenario 4 — Skrining Batuk Positif (TEMPO)
Skrining batuk → Ya → arahkan ruang isolasi + masker → set flag Pasien Batuk (visible downstream) → prioritas antrean → lanjut alur normal.

### Skenario 5 — Registrasi Penunjang (recall order, beda tanggal)
Pilih layanan Penunjang/Klinik+Penunjang → pilih order dari dropdown (no order, dokter pengirim, jenis periksa) atau buat baru → antrean.

### Skenario 6 — APM
Booking Mobile JKN → input no/kode/NIK → konfirmasi → cetak antrean + barcode identitas → tunggu poli. Edge: tanpa booking / data tak lengkap / consent baru → fallback loket.

### Skenario 7 — Pihak Ketiga Down
Panggilan eksternal gagal → terima registrasi → tandai "menunggu sinkron" → masuk daftar kerja → retry otomatis saat koneksi pulih.

## 8. Business Rules

| ID | Rule | Sumber BPMN/Draft |
|----|------|-------------------|
| BR-001 | Verifikasi minimal 2 identitas (nama lengkap + tgl lahir) sebelum lanjut pasien lama | `Verifikasi identitas pasien` / KARS SKP-1 |
| BR-002 | Duplicate detection berjalan di latar (NIK persis + cocok nama/tgl lahir/alamat); intervensi petugas hanya bila kemiripan tinggi; keputusan akhir di petugas | `Duplicate Detection`, gateway `Ada kandidat duplikat?` |
| BR-003 | Bila kandidat duplikat → wajib konfirmasi gunakan RM existing atau buat baru (buat baru wajib alasan) | `Konfirmasi: gunakan RM existing atau buat baru` |
| BR-004 | No.RM selalu dapat dibuat walau identitas belum lengkap (bayi/WNA/tak dikenal/tanpa NIK) | Identitas Fleksibel |
| BR-005 | Penjamin melekat pada kunjungan (encounter), bukan pasien. Ganti penjamin → evaluasi delta kewajiban, arahkan ke langkah kurang (mis. SEP), tidak boleh simpan-paksa | Ganti Penjamin guard-aware |
| BR-006 | Piutang ditampilkan info-only, TIDAK memblok pendaftaran | `Review hasil cek riwayat piutang` |
| BR-007 | Skrining batuk wajib dijawab sebelum lanjut pilih layanan; bila Ya → flag + masker + area terpisah + prioritas, penanda diteruskan ke poli | gateway Batuk, `Set flag Pasien Batuk/Tempo` |
| BR-008 | Poli/dokter hanya dari slot tersedia (Facility Management); kuota habis → tombol Lanjut disabled | `Pilih poli dan dokter`, Data Req B.3 |
| BR-009 | [Phase 2] Kartu BPJS tidak aktif → SEP tidak boleh terbit → arahkan Umum | gateway `Kartu aktif?`, event `Kartu tidak aktif` |
| BR-010 | [Phase 2] SEP tidak dapat dibuat bila belum validasi biometrik | `Verifikasi biometrik`, draft BPJS |
| BR-011 | [Phase 2] Eligibility tidak valid → tidak terbit SEP | gateway `Eligibility valid?`, event `Eligibility tidak valid` |
| BR-012 | General consent diminta saat pasien baru / tipe layanan baru (RJ→RI) / versi consent berubah; tercatat versi+waktu+petugas | Consent UU PDP |
| BR-013 | Consent data spesifik (SATUSEHAT/biometrik) terpisah dari general; penolakan TIDAK memblok layanan inti & data tidak dikirim | Consent Data Spesifik, UU PDP |
| BR-014 | Panggilan eksternal gagal → terima-lalu-rekonsiliasi: simpan, tandai "menunggu sinkron", retry otomatis | Resilience |
| BR-015 | Aksi sensitif (batal, merge, edit Data Sosial, override) wajib hak akses + tercatat audit | Roles & Audit |
| BR-016 | NIK wajib 16 digit angka & unik; bila terisi → Jenis Identitas autofill "KTP", Nomor Identitas autofill read-only | Validasi, Data Req B.2 |
| BR-017 | Email mandatory bila penjamin BPJS; bila null → kirim email default contoh ke BPJS | Data Req B.2 #21 |
| BR-018 | APM hanya untuk pasien booking + data lengkap + tak butuh consent baru; selain itu fallback loket. APM wajib cetak barcode identitas | Scope APM |
| BR-019 | Batal periksa: alasan wajib (dropdown; "Lainnya" → text max 200); hanya Administrator | Data Req A.3 |
| BR-020 | Pasien sudah terdaftar di poli sama hari ini → peringatkan sebelum buat pendaftaran baru | Case #4 |

## 9. User Stories

| ID | Story | Source task (BPMN) |
|----|-------|--------------------|
| US-001 | Sebagai Petugas Pendaftaran, ingin cari pasien lama by No.RM/NIK/Nama + verifikasi 2 identitas, agar tidak salah pasien | Cari data pasien / Verifikasi identitas |
| US-002 | Sebagai Petugas, ingin sistem deteksi duplikat otomatis & menyela hanya bila mirip tinggi, agar tidak buat RM ganda tanpa memperlambat kerja rutin | Duplicate Detection / Ada kandidat duplikat? |
| US-003 | Sebagai Petugas, ingin konfirmasi gunakan RM existing atau buat baru saat ada kandidat, agar riwayat pasien tetap utuh | Konfirmasi gunakan RM existing/buat baru |
| US-004 | Sebagai Petugas, ingin input NIK lalu sistem tarik demografi Disdukcapil, agar input cepat & minim salah ketik | Input NIK untuk Bridging Disdukcapil |
| US-005 | Sebagai Petugas, ingin daftarkan pasien tanpa identitas lengkap (bayi/WNA/tak dikenal), agar pasien tetap dilayani | Identitas Fleksibel |
| US-006 | Sebagai Petugas, ingin lihat info piutang tanpa terblokir, agar tetap layani pasien sambil tahu status finansial | Review hasil cek riwayat piutang |
| US-007 | Sebagai Petugas, ingin skrining batuk 1 pertanyaan & sistem set flag + arahkan isolasi, agar cegah penularan TB | Screening gejala awal: Batuk? |
| US-008 | Sebagai Petugas, ingin pilih poli/dokter dari slot tersedia dengan kuota terlihat, agar tidak double-book | Pilih poli dan dokter |
| US-009 | Sebagai Petugas, ingin pilih paket MCU saat layanan MCU, agar pendaftaran MCU benar | Pilih paket MCU |
| US-010 | Sebagai Petugas, ingin pilih order penunjang dari dropdown (incl. beda tanggal), agar tidak ketik nomor manual | (recall order, draft D) |
| US-011 | Sebagai Petugas, ingin ganti penjamin guard-aware yang arahkan ke langkah kurang, agar klaim tidak gagal | Pilih jenis penjaminan |
| US-012 | Sebagai Sistem, ingin cek status kartu BPJS sebelum SEP [Phase 2], agar tidak buat SEP salah | Cek status kartu BPJS |
| US-013 | Sebagai Sistem, ingin pastikan biometrik tervalidasi sebelum SEP [Phase 2], agar klaim tidak tertolak | Verifikasi biometrik / Penerbitan SEP |
| US-014 | Sebagai Petugas, ingin verifikasi & input dokumen asuransi, agar berkas klaim lengkap | Verifikasi kelengkapan dokumen asuransi / Input data asuransi |
| US-015 | Sebagai Petugas, ingin generate & cetak nomor antrean per kunjungan, agar pasien terpanggil & waktu tunggu terpantau | Generate/Cetak nomor antrean |
| US-016 | Sebagai Pasien, ingin check-in mandiri APM via booking Mobile JKN & cetak antrean + barcode identitas, agar cepat & berkas tidak salah identitas | Pendaftaran APM |
| US-017 | Sebagai Petugas, ingin registrasi tetap jalan saat BPJS/Disdukcapil/SATUSEHAT down, dengan record ditandai menunggu sinkron, agar loket tidak berhenti | Resilience H |
| US-018 | Sebagai Pasien, ingin general consent diminta saat perlu saja (tidak tiap kunjungan), agar tidak menambah friksi | Consent |
| US-019 | Sebagai Pasien, ingin consent SATUSEHAT/biometrik terpisah & penolakan tidak menghalangi layanan inti, agar hak data terlindungi (UU PDP) | Consent Data Spesifik |
| US-020 | Sebagai Administrator, ingin batal periksa dengan alasan tercatat audit, agar pembatalan tertelusur | Batal Periksa A.3 |
| US-021 | Sebagai Kepala RM (Phase 2), ingin merge/unmerge RM non-destruktif + audit, agar duplikat terlanjur bisa diperbaiki | Phase 2 |
| US-022 | Sebagai Manajemen, ingin dashboard pendaftaran dengan filter (tanggal/dokter/unit/status/SEP/fingerprint), agar pantau operasional | Dashboard A |

## 10. Functional Requirements

Traceability: FR → task BPMN / Data Req draft.

### Dashboard (A)
| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | Dashboard RJ dgn filter: Jenis Pasien, Cetak Antrean, Fingerprint, SEP, Tanggal (default hari ini), Dokter, Unit/Klinik, Jenis Pendaftaran, Status Kunjungan, Search (No.RM/Nama/Alamat) | Data Req A.1 |
| FR-002 | Tabel kolom: No, Tgl/Waktu, No Antrean (Kode Unit-001), No.RM (6 digit), Nama (+icon fingerprint), No Registrasi (12 digit), NIK, No Kartu, SEP, Alamat, Dokter, Klinik, Cara Bayar, Jenis Pasien (badge Baru/Lama), Jenis Pendaftaran, Status Kunjungan, Cetak, MJKN, Check-in, Batal Periksa | Data Req A.2 |
| FR-003 | Status Kunjungan: Terjadwal (booking), Hadir (walk-in/check-in), Selesai (update dari modul pelayanan), Dibatalkan (batal periksa) | Data Req A.2 #15 |
| FR-004 | Batal Periksa: dropdown alasan (Tidak datang/Reschedule/Dokter batal/Lainnya); Lainnya→text mandatory max 200; sekali input | Data Req A.3, BR-019 |

### Registrasi (B)
| ID | Requirement | Trace |
|----|-------------|-------|
| FR-010 | Cari pasien lama by No.RM/Nama/NIK/Tgl Lahir/Alamat | Data Req B.1 |
| FR-011 | Form Informasi Pribadi: No.RM auto (6 digit, read-only), No Kartu BPJS (≤13, unik, bridging), NIK (≤16, unik, bridging SATUSEHAT+Disdukcapil), Jenis Identitas (autofill KTP bila NIK), Nomor Identitas (autofill read-only bila NIK), Nama (3–200, *), Status Pasien (*), Jenis Kelamin (*), Tgl Lahir (*), Usia (autofill), Wilayah Prov→Kab→Kec→Kel (dependent, master wilayah), Alamat Lengkap (*), Agama (*), No Telp (*), Kartu Prioritas, Gol Darah, Email, Pendidikan, Pekerjaan, Status Kawin (*), Nama Ayah/Ibu, Etnis (*), Bahasa (*), Hambatan Komunikasi (*), Disabilitas (*) | Data Req B.2 |
| FR-012 | Section Layanan Klinik: Tipe Penjamin (BPJS/Asuransi/Umum, *), Nama+No Asuransi (bila Asuransi, simpan value terakhir), Layanan (Klinik/Penunjang/Penunjang+Klinik, *), Toggle Booking, Cara Masuk (mandatory bila BPJS), Klinik (*), Dokter (*), Tgl&Hari (*), Jam Praktik (* + flag berlangsung/akan datang), Kuota (autofill, potong saat itu), Penunjang + Nomor Order (bila layanan penunjang) | Data Req B.3 |
| FR-013 | Recall order penunjang via dropdown (nomor order aktif, dokter pengirim, jenis periksa); dukung kedatangan beda tanggal; tanpa order → buat baru | Data Req B.3 #13, draft D |
| FR-014 | Section Skrining Batuk: radio Ya/Tidak (mandatory, default Tidak) | Data Req B.4, US-007 |
| FR-015 | Section Penanggung Jawab + Penanggung Jawab Keuangan (nama/telp/alamat, checkbox samakan dgn pasien) | Data Req B.5 |
| FR-016 | [Phase 2] Section Buat SEP: Tgl SEP, No Kartu, Pasien CoB, Asal/No Rujukan, PPK Asal, Catatan, No SKDP, DPJP, Poli Eksklusif, Tujuan/Jenis/Alasan Kunjungan, Status Kecelakaan + field turunan (No Laporan Polisi, bukti, tgl, penjamin, suplesi, wilayah), Hak/Naik Kelas Rawat, Pembiayaan, Diagnosa | Data Req B.6 |
| FR-017 | Section Register Sidik Jari (optional) | Data Req B.7 |
| FR-018 | Update & Detail data pasien lama menampilkan seluruh data terinput; edit Data Sosial kontrol peran (Role 1 & 2) | Data Req C, D |
| FR-019 | [Phase 2] Riwayat Pembatalan: No Antrean, No Pendaftaran, No.RM, Nama, No SEP, NIK, Klinik, Alamat, Cara Bayar, Dibatalkan Oleh, Dibatalkan Pada | Data Req E |

### Integrasi & Antrean
| ID | Requirement | Trace |
|----|-------------|-------|
| FR-020 | [Phase 2] Cek status kartu BPJS sebelum SEP; tidak aktif → blok SEP, arahkan Umum | Cek status kartu / BR-009 |
| FR-021 | [Phase 2] Verifikasi biometrik prasyarat SEP; eligibility valid → terbit SEP | Verifikasi biometrik / Penerbitan SEP |
| FR-022 | [Phase 2] Bridging Disdukcapil tarik demografi dari NIK; gagal → fallback manual + tandai sinkron | Call API Disdukcapil |
| FR-023 | Generate nomor antrean per poli/hari (Kode Unit-001 auto-increment), cetak, catat check-in (manual/APM) | Generate/Cetak antrean |
| FR-024 | Terima-lalu-rekonsiliasi: queue retry panggilan eksternal gagal, status "menunggu sinkron", daftar kerja petugas | Resilience / BR-014 |
| FR-025 | Event-driven: data registrasi selesai otomatis tersedia ke poli/billing/RME/BI real-time | Penyelesaian G |
| FR-026 | APM: input no/kode/NIK booking Mobile JKN → konfirmasi → cetak antrean + barcode identitas; skrining batuk; fallback loket | Scope APM / BR-018 |

### Validasi (lihat juga draft)
| ID | Requirement |
|----|-------------|
| FR-030 | NIK ≠16 digit → "NIK tidak valid. Harus 16 digit angka." |
| FR-031 | Disdukcapil tidak ketemu/timeout → "Data NIK tidak ditemukan atau koneksi terganggu. Silakan lanjut input manual; NIK divalidasi otomatis saat koneksi pulih." |
| FR-032 | Field mandatory kosong → pesan per field (mis. "Nama lengkap wajib diisi", "Dokter wajib dipilih") |
| FR-033 | Email format salah → "Format email tidak valid" |
| FR-034 | Dokter tidak praktik pd poli/tgl → "Dr. [Nama] tidak praktik pada [tanggal]. Pilih jadwal/dokter lain." |
| FR-035 | Kuota habis → tombol Lanjut disabled + "Kuota dokter telah penuh. Pilih dokter/jadwal lain." |
| FR-036 | NIK duplikat → "NIK sudah terdaftar atas nama [nama]. Apakah pasien sama?" (Ya→existing / Tidak→tinjau) |
| FR-037 | Skrining batuk belum dijawab → "Skrining batuk wajib diisi sebelum melanjutkan." |
| FR-038 | General consent belum direkam → "General consent belum direkam untuk pasien/layanan ini. Rekam sebelum melanjutkan." |
| FR-039 | Pasien sudah terdaftar di poli sama hari ini → "Pasien sudah terdaftar di [poli] hari ini. Lanjutkan pendaftaran baru?" |

## 11. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-001 | Performa | Registrasi pasien lama kasus umum ≤30 detik / ≤3 klik (UAT) |
| NFR-002 | Ketahanan | Loket 0 menit downtime akibat BPJS/Disdukcapil/SATUSEHAT down (terima-lalu-rekonsiliasi); retry otomatis saat koneksi pulih |
| NFR-003 | Usability | ≥80% petugas/pasien nilai alur mudah; UI memandu (turnover tinggi, tidak andalkan hafalan SOP) |
| NFR-004 | Keamanan & Privasi | RBAC least-privilege; aksi sensitif (batal/merge/edit Data Sosial/override) wajib hak akses + audit trail; patuh UU PDP |
| NFR-005 | Integritas data | No.RM/No Registrasi/No Antrean unik & auto-increment; cegah RM ganda; NIK unik |
| NFR-006 | Interoperabilitas | Titik integrasi BPJS/SATUSEHAT/Disdukcapil sebagai port pluggable (MVP penuh untuk Umum/Asuransi; bridging dipasang Phase 2) |
| NFR-007 | Ketersediaan | [ASUMSI] Operasional jam layanan RS; APM down → fallback loket dgn petugas siaga |
| NFR-008 | Skalabilitas | Tangani lonjakan jam sibuk pagi tanpa degradasi signifikan [PERLU KONFIRMASI target concurrent users/TPS] |
| NFR-009 | Auditability | Consent tercatat versi+waktu+petugas; pembatalan tercatat dibatalkan oleh+pada |
| NFR-010 | Kompatibilitas | [ASUMSI] Berjalan di hardware loket & kiosk APM existing RS C/D; printer thermal antrean + barcode |

## 12. Integrasi Eksternal

| Sistem | Fungsi | Fase | Catatan |
|--------|--------|------|---------|
| **BPJS VClaim** | Cek eligibilitas kartu, verifikasi biometrik (read-only indikator), penerbitan SEP | Phase 2 (port disiapkan Phase 1) | SEP tidak terbit bila kartu tidak aktif / belum biometrik / eligibility tidak valid (BR-009/010/011). Sumber error terbesar v1 → claim-first |
| **BPJS Antrol / Mobile JKN** | Sinkron antrean online, check-in APM via booking | Phase 2 | APM Phase 1 pakai input no/kode/NIK booking |
| **Disdukcapil** | Validasi NIK + tarik demografi | Phase 2 | Gagal/timeout → fallback manual + tandai menunggu sinkron (FR-031) |
| **SATUSEHAT (FHIR R4)** | Kirim Patient/Encounter | Phase 2 | Consent data spesifik terpisah; penolakan → tidak kirim, tidak blok layanan (BR-013). Mandat UU 17/2023 penegakan 2026 |
| **E-Klaim / INA-CBG** | Cara Masuk untuk klaim | Out scope (modul Casemix) | Field Cara Masuk disiapkan utk bridging E-Klaim |

**Prinsip integrasi (NFR-006 + BR-014):**
- Semua titik integrasi = **port pluggable**; MVP (Phase 1) berjalan penuh untuk Umum & Asuransi tanpa bridging aktif.
- **Terima-lalu-rekonsiliasi**: registrasi internal tidak bergantung ketersediaan layanan luar. Panggilan gagal → antre → retry otomatis → status "menunggu sinkron" di daftar kerja petugas.

**Sumber data internal (Master Data / Facility Management):** Unit/Klinik, Tipe Penjamin, Jadwal Dokter + kuota slot, Wilayah (Prov/Kab/Kec/Kel), Staf/Dokter, Order penunjang.

## Asumsi
- [ASUMSI] As-Is v1 (cek BPJS manual, SEP tanpa biometrik) diturunkan dari narasi draft, bukan observasi langsung.
- [ASUMSI] Volume kunjungan RJ harian RS C/D: ratusan pasien, puncak pagi.
- [ASUMSI] Hardware loket & kiosk APM existing; tersedia printer thermal untuk antrean + barcode identitas.
- [ASUMSI] Ketersediaan sistem mengikuti jam layanan RS, bukan 24/7.
- [ASUMSI] Modul pelayanan (poli) yang meng-update Status Kunjungan 'Selesai' sudah/akan tersedia sebagai konsumer event.
- [ASUMSI] Format No.RM 6 digit, No Registrasi 12 digit (YYYYMMDD+seq), No Antrean Kode Unit-NNN sesuai Data Req.
- [ASUMSI] Strategi TEMPO = skrining 1 pertanyaan batuk; penilaian gejala mendalam ranah unit klinis, bukan pendaftaran.

## Pertanyaan Terbuka
- Baseline angka v1 belum tersedia: jumlah RM ganda/bulan & waktu layani rata-rata per pasien (untuk validasi metric #1 & #2). [PERLU KONFIRMASI]
- Target NFR performa: concurrent users / TPS pada jam sibuk pagi belum ditentukan.
- Nomor Order recall — sumber & format pasti ('Nomor order yang aktif -> TBC' di Data Req B.3 #13).
- Field SEP belum lengkap di draft: No SKDP, Nama Sub/Spesialis, Diagnosa (tipe data & sumber kosong).
- Sumber master Nama Asuransi (Data Req B.3 #2 ditandai '?').
- Definisi peran pasti: Role 1 & 2 (edit Data Sosial), Administrator, Kepala RM, Super Admin — matriks hak akses detail.
- Konfirmasi BPMN: file g-admisi-onsite-registration mencakup Scan KTP OCR sebagai langkah, tapi draft menempatkan OCR di Phase 2 — pastikan OCR memang Phase 2.
- Mekanisme & UX 'daftar kerja petugas' untuk record menunggu sinkron (notifikasi, SLA retry).