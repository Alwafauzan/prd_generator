# PRD — Pendaftaran Rawat Jalan

**Related Document:** BPMN: g-admisi-onsite-registration.json; Lampiran: PRD_Pendaftaran_Rawat_Jalan (1).pdf; List Fitur V2.xlsx (sheet MVP, code B1); PRD terkait: B2 (Ranap), A1 (User), A2 (Staf)
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-06-17

## 1. Overview / Brief Summary

Modul **Pendaftaran Rawat Jalan (RJ)** [B1] adalah titik masuk pasien ke layanan poliklinik RS Tipe C & D. Modul menangani: identifikasi & pencarian pasien, registrasi pasien baru (bridging Disdukcapil) atau tinjau-update pasien lama, deteksi duplikat Rekam Medis (RM), screening gejala awal, pemilihan jenis layanan/poli/dokter, pemilihan penjamin (Umum/BPJS/Asuransi), penerbitan SEP BPJS via VClaim, hingga generate & cetak nomor antrean.

Tujuan: registrasi cepat & akurat di jam sibuk (peak 07–11), mencegah pasien tertukar & RM ganda, serta menjamin layanan tetap jalan walau integrasi eksternal (Disdukcapil/BPJS) bermasalah (non-blocking).

**Definisi singkat:**
- **No. RM**: nomor rekam medis unik per pasien, sekali terbit dipakai seumur hidup di RS.
- **SEP**: Surat Eligibilitas Peserta (BPJS) yang menjamin pembiayaan kunjungan.
- **Bridging Disdukcapil**: penarikan data demografi berbasis NIK.
- **Kunjungan (encounter)**: 1 episode pelayanan RJ yang dibuat tiap pasien datang.

## 2. Background

**Masalah saat ini (RS Tipe C & D):**
- Pencarian pasien manual/lambat → antrean panjang di peak pagi (200–400 pasien RJ/hari, 60–70% di jam 07–11).
- RM ganda karena pasien lama tak ditemukan → riwayat medis terpecah, klaim BPJS bermasalah.
- Status keaktifan & eligibilitas BPJS dicek manual → salah terbit SEP, klaim ditolak. [ASUMSI]
- Input data pasien baru lama (form panjang) → menambah waktu layan.
- Ketergantungan integrasi: bila Disdukcapil/BPJS down, layanan ikut berhenti.

**Kenapa modul ini perlu:**
- Memenuhi mandat **RME** (Permenkes RME) & interoperabilitas **SATUSEHAT**.
- Standarisasi alur admisi RJ sesuai BPMN onsite registration.
- Resilient: integrasi eksternal non-blocking agar layanan tetap jalan.

Konteks operasional dari lampiran: pasien baru ±5–10% kunjungan harian (±20–40/hari); target pencarian ≤2 detik untuk DB hingga 100.000 pasien; registrasi pasien baru ≤90 detik.

## 3. In Scope

### Scope Definition (yang dikerjakan)
1. **Identifikasi & pencarian pasien** by No. RM / NIK / Nama / Tgl Lahir / Alamat (toleran kapitalisasi & spasi, paginasi).
2. **Registrasi pasien baru** via input NIK (bridging Disdukcapil) ATAU input manual ATAU Scan KTP (OCR). Field mandatory minimum + pelengkapan bertahap.
3. **Identitas fleksibel**: pasien tanpa NIK (bayi baru lahir, WNA, tak dikenal) → Paspor/KITAS/identitas sementara.
4. **Tinjau & update data pasien lama** (autofill + audit perubahan).
5. **Deteksi duplikat RM** (matching NIK + nama + tgl lahir + alamat) + konfirmasi gunakan RM existing / buat baru.
6. **Screening gejala awal** (batuk/demam) + flag pasien + arahkan isolasi/masker.
7. **Pemilihan jenis layanan** (Klinik / Klinik & Penunjang / Penunjang / MCU), **poli & dokter**, **paket MCU**.
8. **Pemilihan penjamin**: Umum / BPJS / Asuransi.
9. **Integrasi BPJS VClaim**: cek keaktifan kartu, cek eligibilitas, penerbitan SEP.
10. **Generate & cetak nomor antrean**, status "siap dipanggil di poli".
11. **Cek riwayat piutang** pasien + info ke pasien.

### Out Scope (TIDAK dikerjakan di modul ini)
- Pendaftaran Rawat Inap [B2], IGD [B3], Lab [B4], Radiologi [B5], Rehab Medis [B6], MCU end-to-end [B7] (modul B1 hanya entry/penjadwalan ke poli; pelaksanaan layanan di modul masing-masing).
- Mesin Antrian (APM) [B8] & Display Antrian [B9] — modul terpisah (B1 hanya generate nomor).
- Proses klinis di poli (EMR/asesmen dokter).
- Verifikasi klaim BPJS pasca-pelayanan & INA-CBG (modul Keuangan).
- Manajemen master data staf/user/unit (modul A1/A2/A3) — B1 hanya konsumsi lookup.
- Pembayaran/kasir.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Pencarian pasien cepat | Waktu tampil hasil cari (DB ≤100.000) | ≤ 2 detik |
| Registrasi pasien baru cepat | Waktu selesai daftar (kasus normal, field minimum) | ≤ 90 detik |
| Cegah RM ganda | Rasio RM duplikat baru / total RM baru | < 1% [ASUMSI] |
| Resilient integrasi | Registrasi tetap selesai saat Disdukcapil/BPJS down | 100% (non-blocking) |
| Akurasi identitas | Insiden pasien tertukar | 0 |
| Akurasi penjaminan BPJS | SEP terbit untuk kartu aktif & eligible saja | 100% |
| Efisiensi antrean peak | Throughput pendaftaran jam 07–11 | sesuai volume tanpa antre menumpuk [PERLU KONFIRMASI] |
| Cakupan bridging | % pasien baru ber-NIK tervalidasi Disdukcapil | ≥ 90% [ASUMSI] |

## 5. Related Feature

Cluster **Admisi** (List Fitur sheet MVP):

| Code | Module > Menu > Sub Menu | Relasi dengan B1 |
|------|--------------------------|------------------|
| **B1** | Pendaftaran > Pendaftaran Rawat Jalan | **Modul ini** |
| B2 | Pendaftaran > Pendaftaran Rawat Inap | Bagi master pasien, alur penjamin/SEP serupa; field pasien konsisten |
| B3 | Pendaftaran > Pendaftaran IGD | Bagi master pasien & flag screening |
| B4 | Pendaftaran > Pendaftaran Laboratorium | Tujuan rujukan layanan "Penunjang" |
| B5 | Pendaftaran > Pendaftaran Radiologi | Tujuan rujukan layanan "Penunjang" |
| B6 | Pendaftaran > Pendaftaran Rehabilitasi Medis | Jenis layanan poli |
| B7 | Pendaftaran > Pendaftaran MCU | Pilih paket MCU (B1 entry, B7 pelaksanaan) |
| B8 | Antrian > APM | Konsumen nomor antrean B1 |
| B9 | Antrian > Display antrian | Tampilkan antrean hasil B1 |

Modul lintas-cluster terkait (konsistensi field): **A1 (Manajemen User)**, **A2 (Master Staf)**, **A3 (Master Unit)** — sumber lookup dokter/poli/unit.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — RS Tipe C/D umum]
1. Pasien datang ke loket, antre manual.
2. Petugas cari pasien manual (buku/aplikasi lama) → lambat, rawan RM ganda.
3. Data pasien baru diketik manual penuh; NIK tak tervalidasi.
4. Status BPJS dicek di aplikasi VClaim terpisah, copy-paste → salah SEP.
5. Screening gejala tidak terstruktur.
6. Nomor antrean manual/aplikasi terpisah.

### B. To-Be (kondisi diharapkan — turunan BPMN g-admisi-onsite-registration)
1. **Identifikasi status pasien** (baru/lama) sebagai langkah pertama.
2. **Pasien lama** → Cari data → Verifikasi 2 identitas (nama + tgl lahir) → Review hasil cek riwayat piutang → tinjau/update data.
3. **Pasien baru** → pilih metode input (Scan KTP OCR / Input NIK bridging Disdukcapil / Input manual) → Verifikasi & lengkapi data → **Deteksi duplikat RM** → bila ada kandidat: konfirmasi gunakan RM existing / buat baru.
4. **Screening gejala** (batuk/demam) → bila ya: set flag & arahkan isolasi + masker.
5. **Pilih jenis layanan** (Klinik / Klinik & Penunjang / Penunjang / MCU) → **pilih poli & dokter** (atau paket MCU).
6. **Pilih jenis penjamin** → bila BPJS: **cek kartu aktif** → verifikasi biometrik → **cek eligibilitas** → **terbit SEP**; bila Umum: lanjut.
7. **Generate nomor antrean** → **cetak** → pasien menunggu dipanggil di poli → Pendaftaran selesai.

Integrasi non-blocking: Disdukcapil/BPJS down → record masuk daftar tindak-lanjut sinkron, registrasi tetap selesai.

## 7. Main Flow / Mindmap

### Skenario A — Pasien Lama (BPJS, normal)
1. Pasien datang ke loket → petugas pilih "Identifikasi status pasien" = Lama. `[BPMN: Identifikasi status pasien → Keputusan: Pasien baru/lama]`
2. Cari data pasien (No.RM/NIK/Nama). `[Cari data pasien]`
3. Verifikasi identitas pasien (nama + tgl lahir verbal). `[Verifikasi identitas pasien]`
4. Sistem cek riwayat piutang → petugas review & informasikan ke pasien bila ada. `[Cek riwayat piutang pasien → Review dan informasi...]`
5. Tinjau & update data pasien lama → Lanjut dengan catatan. `[Lanjut dengan catatan]`
6. Screening gejala (batuk/demam). `[Screening gejala awal]`
7. Pilih jenis layanan → pilih poli & dokter. `[Pilih jenis layanan; Pilih poli dan dokter]`
8. Pilih penjamin = BPJS → cek kartu aktif → verifikasi biometrik → cek eligibilitas → terbit SEP. `[Cek status kartu BPJS → Kartu aktif? Ya → Verifikasi biometrik → Eligibility valid? → Penerbitan SEP → SEP berhasil dibuat]`
9. Terima data SEP → generate nomor antrean → cetak. `[Terima data SEP → Generate nomor antrian → Cetak nomor antrean]`
10. Pendaftaran selesai → pasien menunggu → siap dipanggil di poli. `[Pendaftaran selesai; Siap dipanggil di poli]`

### Skenario B — Pasien Baru (Input NIK, Umum)
1. Identifikasi status = Baru → Metode input data? `[Keputusan: Pasien baru → Metode input data?]`
2. Input NIK → Bridging Disdukcapil tarik data demografi. `[Input NIK untuk Bridging Disdukcapil → Call API Disdukcapil]`
3. Verifikasi & lengkapi data pasien (koreksi isian awal). `[Verifikasi & lengkapi data pasien]`
4. Deteksi duplikat RM → Ada kandidat? Tidak → lanjut. `[Duplicate Detection → Ada kandidat duplikat? Tidak]`
5. Screening gejala → (bila batuk: set flag + isolasi + masker). `[Set flag "Pasien Batuk/Tempo"; Arahkan ke ruang isolasi & berikan masker]`
6. Pilih jenis layanan → poli & dokter → penjamin = Umum. `[Keputusan #5: Umum → Generate nomor antrian]`
7. Generate & cetak nomor antrean → No.RM tergenerate saat simpan → selesai.

### Skenario C — Cabang gateway penting
- **Metode input data?** → Scan KTP (OCR) / Input NIK bridging / Input manual. `[Metode input data?]`
- **Ada kandidat duplikat?** → Ya → Konfirmasi: gunakan RM existing / buat baru. `[Ada kandidat duplikat? Ya]`
- **Kartu aktif?** → Tidak → event "Kartu tidak aktif" (arahkan ke Umum / urus kartu). `[Keputusan #10: Tidak → Kartu tidak aktif]`
- **Eligibility valid?** → Tidak → event "Eligibility tidak valid" (tidak terbit SEP). `[Eligibility valid? → Eligibility tidak valid]`
- **Batuk/Demam?** → Ya → flag + isolasi + masker. `[Screening gejala awal]`
- **Disdukcapil down/timeout** → lanjut input manual (non-blocking). `[Lampiran: registrasi tetap selesai, masuk daftar sinkron]`

## 8. Business Rules

| ID | Aturan | Sumber |
|----|--------|--------|
| BR-001 | Pencarian pasien WAJIB jadi langkah pertama sebelum buat record baru; sistem selalu pastikan pasien belum terdaftar. | Lampiran |
| BR-002 | Pencarian toleran kapitalisasi & spasi ("siti aisyah" = "Siti Aisyah"); minimal by No.RM, NIK, atau Nama. | Lampiran |
| BR-003 | Sebelum lanjut registrasi/kunjungan, petugas WAJIB verifikasi 2 identitas (nama lengkap + tgl lahir verbal). | Lampiran |
| BR-004 | Format NIK = 16 digit numerik; bila kurang/lebih → pesan validasi. NIK identitas utama tapi **TIDAK blocking**. | Lampiran + konteks |
| BR-005 | Saat Disdukcapil down/timeout/NIK tak ditemukan → sistem TIDAK memblok; lanjut input manual; record masuk daftar tindak-lanjut sinkron. | Lampiran |
| BR-006 | Field mandatory minimum pasien baru: Nama Lengkap, Tanggal Lahir, Jenis Kelamin, Jenis Identitas, Alamat. Field non-mandatory tak memblok simpan. | Lampiran |
| BR-007 | Pasien tanpa NIK (bayi baru lahir, WNA, tak dikenal) tetap bisa daftar via identitas alternatif (Paspor/KITAS/sementara). | Lampiran |
| BR-008 | No. RM tergenerate unik HANYA setelah pengecekan duplikat lolos. | Lampiran + BPMN |
| BR-009 | Bila deteksi duplikat menemukan kandidat (match NIK + nama + tgl lahir + alamat) → WAJIB konfirmasi: pakai RM existing atau buat baru. | BPMN: Duplicate Detection |
| BR-010 | Jika kartu BPJS **tidak aktif** → TIDAK boleh terbit SEP → arahkan ke jalur Umum / urus kartu. | BPMN: Kartu aktif? |
| BR-011 | Jika **eligibility tidak valid** → TIDAK terbit SEP. | BPMN: Eligibility valid? |
| BR-012 | Penerbitan SEP hanya setelah: kartu aktif → verifikasi biometrik → eligibilitas valid. | BPMN |
| BR-013 | Bila screening batuk/demam = Ya → set flag "Pasien Batuk/Tempo" (visible di poli/ranap/IGD) + arahkan isolasi + beri masker. | BPMN |
| BR-014 | Setiap perubahan data pasien lama dicatat audit (nilai sebelum/sesudah). | Lampiran |
| BR-015 | Bila pasien punya riwayat piutang → tampilkan ke petugas & informasikan ke pasien; tidak otomatis memblok pendaftaran. [PERLU KONFIRMASI apakah piutang memblok] | BPMN |
| BR-016 | Akses layanan tidak boleh ditolak hanya karena NIK belum tervalidasi. | Lampiran |

## 9. User Stories

| ID | User Story | Prioritas | Trace BPMN |
|----|-----------|-----------|------------|
| US-001 | Sebagai Petugas Pendaftaran, saya ingin mencari pasien cepat (≤2 dtk) by No.RM/NIK/Nama dan melihat ≥2 identitas, agar pasien tak tertukar. | P0 | Cari data pasien |
| US-002 | Sebagai Petugas, saya ingin verifikasi 2 identitas (nama+tgl lahir) sebelum lanjut, agar identitas benar. | P0 | Verifikasi identitas pasien |
| US-003 | Sebagai Petugas, saya ingin daftarkan pasien baru via NIK (bridging Disdukcapil) ATAU manual, agar tetap melayani walau Disdukcapil bermasalah. | P0 | Input NIK bridging / Input data pasien baru |
| US-004 | Sebagai Petugas, saya ingin scan KTP (OCR) untuk auto-isi form, agar input cepat. | P1 | Scan KTP (OCR) |
| US-005 | Sebagai Petugas, saya ingin sistem deteksi duplikat RM & minta konfirmasi, agar tak terbit RM ganda. | P0 | Duplicate Detection; Ada kandidat duplikat? |
| US-006 | Sebagai Petugas, saya ingin daftarkan pasien tanpa NIK via identitas alternatif, agar bayi/WNA/tak dikenal tetap dilayani. | P0 | (Lampiran Identitas Fleksibel) |
| US-007 | Sebagai Petugas, saya ingin tinjau & update data pasien lama (autofill) dengan audit, agar data mutakhir. | P0 | Lanjut dengan catatan |
| US-008 | Sebagai Petugas, saya ingin lihat riwayat piutang pasien & informasikan, agar pasien tahu kewajibannya. | P1 | Cek riwayat piutang pasien |
| US-009 | Sebagai Petugas, saya ingin screening gejala (batuk/demam) & sistem set flag + arahkan isolasi, agar cegah penularan. | P1 | Screening gejala awal |
| US-010 | Sebagai Petugas, saya ingin pilih jenis layanan, poli & dokter (atau paket MCU), agar kunjungan terarah. | P0 | Pilih jenis layanan; Pilih poli dan dokter |
| US-011 | Sebagai Petugas/Sistem, saya ingin cek keaktifan kartu BPJS otomatis sebelum SEP, agar tak salah terbit SEP. | P0 | Cek status kartu BPJS; Kartu aktif? |
| US-012 | Sebagai Sistem, saya ingin cek eligibilitas & terbitkan SEP via VClaim, agar penjaminan sah. | P0 | Penerbitan SEP; SEP berhasil dibuat |
| US-013 | Sebagai Petugas, saya ingin generate & cetak nomor antrean, agar pasien menunggu dipanggil di poli. | P0 | Generate nomor antrian; Cetak nomor antrean |
| US-014 | Sebagai Pasien, saya ingin terima nomor antrean & info kejelasan, agar tahu giliran. | P0 | Terima nomor antrean |

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | Sistem sediakan layar pencarian pasien dengan input No.RM/NIK/Nama/Tgl Lahir/Alamat; hasil ≤2 dtk untuk DB ≤100.000; paginasi untuk kata kunci umum. | US-001, BR-001/002 |
| FR-002 | Sistem tampilkan kandidat hasil cari dengan ≥2 identitas (nama lengkap, tgl lahir, alamat) tanpa buka detail. | US-001 |
| FR-003 | Sistem wajibkan konfirmasi verifikasi 2 identitas sebelum tombol Lanjut aktif. | US-002, BR-003 |
| FR-004 | Form Registrasi Pasien Baru terima NIK 16 digit → panggil API Disdukcapil; sukses → prefill form (editable). | US-003, BR-004 |
| FR-005 | Bila Disdukcapil timeout/down/NIK tak ada → tampilkan notice, izinkan input manual, tandai record "perlu sinkron Disdukcapil". | US-003, BR-005 |
| FR-006 | Form OCR: unggah/scan KTP → ekstrak NIK/nama/tgl lahir/alamat → prefill (editable). | US-004 |
| FR-007 | Sebelum generate No.RM, jalankan Duplicate Detection (match NIK+nama+tgl lahir+alamat) di latar; bila ada kandidat → modal konfirmasi (pakai RM existing / buat baru). | US-005, BR-008/009 |
| FR-008 | Dukung jenis identitas: KTP/NIK, Paspor, KITAS, Identitas Sementara (bayi/tak dikenal). | US-006, BR-007 |
| FR-009 | Form pasien lama autofill dari record; setiap edit dicatat audit (field, nilai lama, nilai baru, user, waktu). | US-007, BR-014 |
| FR-010 | Sistem cek & tampilkan riwayat piutang pasien dari modul Keuangan; tampilkan badge ke petugas. | US-008, BR-015 |
| FR-011 | Form screening gejala (batuk/demam boolean); bila Ya → set flag "Pasien Batuk/Tempo" pada kunjungan (visible poli/ranap/IGD) + tampilkan instruksi isolasi+masker. | US-009, BR-013 |
| FR-012 | Pilih jenis layanan (enum: Klinik / Klinik & Penunjang / Penunjang / MCU); bila MCU → pilih paket MCU; pilih poli (lookup A3) & dokter (lookup A2). | US-010 |
| FR-013 | Pilih penjamin (Umum/BPJS/Asuransi); bila BPJS → input no.kartu/NIK → cek keaktifan VClaim. | US-011, BR-010 |
| FR-014 | Bila kartu aktif → verifikasi biometrik (sidik jari) → cek eligibilitas → terbit SEP; simpan no.SEP pada kunjungan. Bila tidak aktif/eligible tidak valid → blokir SEP, tawarkan jalur Umum. | US-011/012, BR-010/011/012 |
| FR-015 | Bila penjamin Asuransi → verifikasi kelengkapan dokumen asuransi + input data asuransi. | (BPMN: Verifikasi kelengkapan dokumen asuransi) |
| FR-016 | Generate nomor antrean per poli + cetak (thermal); tampilkan estimasi & status "siap dipanggil". | US-013/014 |
| FR-017 | Saat simpan registrasi pasien baru lolos duplikat → generate No.RM unik. | BR-008 |
| FR-018 | Field non-mandatory tidak boleh memblok penyimpanan. | BR-006 |

## 11. Data Requirements (Spesifikasi Field)

> Field kanonik (nama/tipe/format) mengikuti **Konteks PRD terkait** (A1/A2/B2). `nik`, `nama`, `jenis_kelamin`, `tgl_lahir`, `alamat`, `no_hp`, `unit` reuse definisi bersama.

### 11.1 Layar: Pencarian Pasien (FR-001/002) — INPUT
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keyword | Kata Kunci | text | Tidak* | min 1 kriteria terisi | manual | toleran kapital/spasi (BR-002) |
| no_rm | No. Rekam Medis | text | Tidak* | format No.RM RS | manual | salah satu kriteria |
| nik | NIK | text | Tidak* | 16 digit numerik | manual | reuse kanonik |
| nama | Nama Pasien | text | Tidak* | maks 100 char | manual | reuse kanonik |
| tgl_lahir | Tanggal Lahir | date | Tidak | <= hari ini | manual | reuse kanonik |
| alamat | Alamat | text | Tidak | maks 255 char | manual | reuse kanonik |

*minimal 1 dari (no_rm/nik/nama) terisi.

### 11.2 Layar: Hasil Pencarian Pasien (FR-002) — TAMPIL
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Lengkap | master_pasien.nama | text | sort A-Z | identitas 1 |
| Tanggal Lahir | master_pasien.tgl_lahir | dd-mm-yyyy | sort | identitas 2 (verifikasi) |
| No. RM | master_pasien.no_rm | text | sort | |
| NIK | master_pasien.nik | text (mask sebagian) | – | privasi |
| Alamat | master_pasien.alamat | text | – | bantu identifikasi |
| Jenis Kelamin | master_pasien.jenis_kelamin | badge L/P | filter | reuse kanonik |
| (paginasi) | – | 20/halaman | – | kata kunci umum (FR-001) |

### 11.3 Layar: Registrasi Pasien Baru (FR-004/006/017) — INPUT
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_identitas | Jenis Identitas | dropdown | Ya | KTP/NIK, Paspor, KITAS, Sementara | manual | BR-006/007 |
| nik | NIK | text | Kondisional | 16 digit numerik | input→bridging Disdukcapil | wajib bila jenis=KTP; non-blocking (BR-004) |
| no_identitas_alt | No. Identitas Alternatif | text | Kondisional | sesuai jenis | manual | wajib bila non-KTP |
| nama | Nama Lengkap | text | Ya | maks 100 char | manual/Disdukcapil | reuse kanonik |
| tgl_lahir | Tanggal Lahir | date | Ya | <= hari ini | manual/Disdukcapil | reuse kanonik |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | L/P | manual/Disdukcapil | reuse kanonik |
| alamat | Alamat | text | Ya | maks 255 char | manual/Disdukcapil | reuse kanonik |
| no_hp | No. HP | text | Tidak | 10–15 digit | manual | reuse kanonik |
| tempat_lahir | Tempat Lahir | text | Tidak | maks 100 char | manual/Disdukcapil | |
| nama_ibu | Nama Ibu Kandung | text | Tidak | maks 100 char | manual | bantu identitas/RME [PERLU KONFIRMASI mandatory] |
| pekerjaan | Pekerjaan | dropdown | Tidak | master pekerjaan | lookup | |
| no_rm | No. RM | text | Auto | unik, auto-generate | auto setelah cek duplikat | BR-008 |

### 11.4 Layar: Konfirmasi Duplikat RM (FR-007) — TAMPIL
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Skor Match | duplicate_detection | persen/badge | sort desc | match NIK+nama+tgl lahir+alamat |
| Nama | master_pasien.nama | text | – | kandidat |
| Tgl Lahir | master_pasien.tgl_lahir | dd-mm-yyyy | – | |
| No. RM existing | master_pasien.no_rm | text | – | opsi "gunakan RM ini" |
| Alamat | master_pasien.alamat | text | – | |
| Aksi | – | tombol: Pakai RM existing / Buat baru | – | BR-009 |

### 11.5 Layar: Screening Gejala (FR-011) — INPUT
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| batuk | Batuk? | boolean | Ya | Ya/Tidak | manual | |
| demam | Demam? | boolean | Ya | Ya/Tidak | manual | |
| flag_isolasi | Flag Pasien Batuk/Tempo | boolean | Auto | true bila batuk/demam | auto | visible poli/ranap/IGD (BR-013) |

### 11.6 Layar: Pilih Layanan & Penjamin (FR-012/013) — INPUT
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_layanan | Jenis Layanan | dropdown | Ya | Klinik/Klinik&Penunjang/Penunjang/MCU | enum | |
| paket_mcu | Paket MCU | dropdown | Kondisional | master paket MCU | lookup | wajib bila jenis=MCU |
| unit | Poli/Unit Tujuan | dropdown(lookup) | Ya | master Unit (A3) | lookup A3 | reuse kanonik |
| dokter_id | Dokter (DPJP) | dropdown(lookup) | Ya | master Staf (A2), jenis_tenaga=dokter | lookup A2 | |
| jenis_penjamin | Jenis Penjamin | dropdown | Ya | Umum/BPJS/Asuransi | manual | |
| no_kartu_bpjs | No. Kartu BPJS | text | Kondisional | 13 digit | manual/VClaim | wajib bila BPJS |
| no_rujukan | No. Rujukan | text | Tidak | format rujukan BPJS | manual | bila perlu rujukan |
| no_polis_asuransi | No. Polis Asuransi | text | Kondisional | sesuai asuransi | manual | wajib bila Asuransi (FR-015) |

### 11.7 Layar: Hasil SEP & Antrean (FR-014/016) — TAMPIL
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Status Kartu BPJS | VClaim | badge Aktif/Tidak Aktif | – | BR-010 |
| Status Eligibilitas | VClaim | badge Valid/Tidak Valid | – | BR-011 |
| No. SEP | VClaim/SEP | text | – | hanya bila terbit |
| No. Antrean | antrean (auto) | angka besar + poli | – | cetak thermal |
| Poli/Dokter Tujuan | unit + dokter | text | – | |
| Estimasi/Status | antrean | "siap dipanggil" | – | |

### 11.8 Layar: Riwayat Piutang (FR-010) — TAMPIL
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Piutang | sum(keuangan.piutang) where pasien | Rp | – | badge merah bila >0 |
| Tanggal | keuangan.tgl | dd-mm-yyyy | sort desc | |
| Keterangan | keuangan.ket | text | – | |
| Nominal | keuangan.nominal | Rp | – | BR-015 |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-001 | Performa | Hasil pencarian pasien ≤ 2 detik untuk DB hingga 100.000 record; paginasi untuk kata kunci umum. |
| NFR-002 | Performa | Registrasi pasien baru (field minimum) selesai ≤ 90 detik kasus normal. |
| NFR-003 | Ketersediaan | Integrasi eksternal (Disdukcapil/BPJS) **non-blocking**; layanan tetap jalan saat down → record masuk antrean sinkron. |
| NFR-004 | Skalabilitas | Tahan beban peak 07–11 (60–70% volume harian; 200–400 pasien RJ/hari). |
| NFR-005 | Keandalan/Offline | [ASUMSI] Mode degradasi saat internet tidak stabil (umum di RS C/D): cache master, retry/sinkron otomatis. [PERLU KONFIRMASI kebutuhan offline penuh] |
| NFR-006 | Keamanan & Privasi | Data pasien (NIK, demografi) terenkripsi; akses berbasis peran (A1); NIK di-mask pada list. |
| NFR-007 | Auditability | Semua perubahan data pasien & keputusan duplikat/SEP tercatat (user, waktu, nilai lama/baru). |
| NFR-008 | Usability | Form minimal-klik, keyboard-friendly, default cerdas untuk peak hour; pesan validasi jelas. |
| NFR-009 | Interoperabilitas | Mapping data ke **SATUSEHAT** (kode + system URI: pasien/encounter); patuh standar RME. |
| NFR-010 | Kompatibilitas | Cetak nomor antrean ke printer thermal umum; jalan di browser standar PC loket. |
| NFR-011 | Akurasi | Pencocokan pencarian toleran kapitalisasi & spasi. |

## 13. Integrasi Eksternal

| Integrasi | Fungsi di B1 | Endpoint/Modul | Catatan |
|-----------|--------------|----------------|---------|
| **Disdukcapil** (NIK bridging) | Tarik data demografi by NIK saat registrasi pasien baru | Call API Disdukcapil → data demografi | **Non-blocking** (BR-005); timeout/down → input manual + flag sinkron |
| **BPJS VClaim** | Cek keaktifan kartu, cek eligibilitas, penerbitan SEP | VClaim (cek kartu, SEP) | Kartu tidak aktif/eligibility tidak valid → tidak terbit SEP (BR-010/011) |
| **BPJS Biometrik** | Verifikasi sidik jari sebelum SEP | Mesin/SDK fingerprint BPJS | [PERLU KONFIRMASI: wajib biometrik untuk RJ atau hanya tertentu] |
| **SATUSEHAT** | Kirim data pasien & encounter (kunjungan RJ) | FHIR Patient/Encounter (kode + system URI) | Patuh interoperabilitas; mapping kode standar |
| **OCR KTP** | Ekstrak data KTP saat scan | Modul/lib OCR | Hasil editable (FR-006); [PERLU KONFIRMASI vendor OCR] |
| **Modul Keuangan (internal)** | Cek riwayat piutang pasien | API internal piutang | BR-015 |
| **Master Data A2/A3** | Lookup dokter (Staf) & poli (Unit) | Internal A2/A3 | Reuse kanonik `unit`, `dokter_id` |
| **INA-CBG** | (Out scope B1) referensi tarif; dipakai pasca-pelayanan | Modul Keuangan | Tidak diproses di B1 |

**Catatan resilience:** Semua integrasi eksternal didesain non-blocking — kegagalan integrasi tidak menghentikan registrasi; record ditandai untuk tindak-lanjut sinkron otomatis.

## Asumsi
- [ASUMSI] Kondisi As-Is mengikuti pola umum RS Tipe C/D (proses manual/semi-manual).
- [ASUMSI] Target rasio RM duplikat <1% dan cakupan bridging ≥90% (belum dikonfirmasi manajemen).
- [ASUMSI] Mode degradasi/cache saat internet tidak stabil dibutuhkan karena infrastruktur RS C/D terbatas.
- [ASUMSI] Metrik throughput peak hour mengikuti volume 200–400 pasien/hari dari lampiran.
- [ASUMSI] No. kartu BPJS 13 digit dan format SEP mengikuti standar VClaim.
- [ASUMSI] Field kanonik (nik, nama, jenis_kelamin, tgl_lahir, alamat, no_hp, unit) konsisten dengan modul A1/A2/B2 sesuai blok Konteks PRD terkait.

## Pertanyaan Terbuka
- Apakah riwayat piutang memblok pendaftaran atau hanya peringatan? (BR-015)
- Verifikasi biometrik BPJS wajib untuk semua pasien RJ atau hanya kondisi tertentu?
- Field nama_ibu kandung apakah mandatory untuk RME/SATUSEHAT?
- Kebutuhan mode offline penuh saat internet RS tidak stabil — sejauh apa? (NFR-005)
- Vendor/SDK OCR KTP yang dipakai?
- Format & panjang No. RM yang disepakati RS?
- Target rasio RM duplikat & cakupan bridging — angka resmi dari manajemen?
- Apakah pasien Asuransi swasta perlu pra-otorisasi sebelum antrean terbit?