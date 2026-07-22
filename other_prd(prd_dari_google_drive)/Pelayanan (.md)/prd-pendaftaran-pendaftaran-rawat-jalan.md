# PRD — Pendaftaran Rawat Jalan

**Related Document:** Tabel Dashboard Pendaftaran; Lucidchart g-admisi-onsite-registration (https://lucid.app/lucidchart/...); Phase 1 Pendaftaran Rawat Jalan.pdf; List Fitur V2.xlsx (sheet MVP Fitur Operasional, code B1)
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

**Modul:** Pendaftaran Rawat Jalan (Code **B1**, Cluster **Admisi**).

Modul Pendaftaran Rawat Jalan (RJ) memungkinkan petugas pendaftaran mendaftarkan pasien rawat jalan — **pasien baru maupun lama** — ke klinik/poli, atau ke klinik dan layanan penunjang, serta menghasilkan seluruh dokumen yang diperlukan dalam proses pendaftaran (SEP, nomor antrian, barcode pasien, kartu pasien).

**Kemampuan inti:**
1. Identifikasi & pencarian pasien (No. RM / NIK / Nama / Tgl Lahir / Alamat) dengan verifikasi dua identitas sebelum lanjut.
2. Registrasi pasien **baru** (Scan KTP/OCR, Bridging Disdukcapil via NIK, atau input manual) dengan deteksi duplikat RM.
3. Registrasi pasien **lama** (cari data existing).
4. Pendaftaran **onsite** dan **booking** (termasuk menerima booking dari **Mobile JKN / MJKN**).
5. Pemilihan jenis layanan: **Klinik**, **Klinik & Penunjang**, atau **Penunjang**; pemilihan poli/dokter & jadwal.
6. Pemilihan jenis penjaminan (BPJS / Asuransi / Umum); pengecekan keaktifan kartu BPJS & **penerbitan SEP**.
7. Pembatalan pendaftaran, batal check-in, penandaan **batal periksa**, dan penghapusan registrasi (oleh Kepala Pendaftaran).
8. Cetak SEP, nomor antrian, barcode pasien, kartu pasien.
9. Trigger update **kuota dokter** saat daftar & batal; penyimpanan jam mulai–selesai & ruangan jadwal dokter terpilih.
10. Pembuatan **billing/biaya admin pendaftaran** otomatis dan pengiriman nomor antrian ke MJKN.

**Catatan engineering (dari draft):** sejumlah integrasi pada fase ini berbasis **mock** (jadwal dokter, asuransi, cek kartu BPJS, kirim antrian MJKN, billing, kode antrian, item tindakan admin, update kuota dokter). Lihat §13. Volume target: **500–600 pasien/hari**, **9.000–10.000 pasien/bulan**.

## 2. Background

RS Tipe C & D memproses volume rawat jalan tinggi dengan **peak pagi pukul 07–11** (±60–70% volume harian terkonsentrasi). Proses pendaftaran saat ini memiliki sejumlah kendala:

- **Terlalu banyak klik** untuk menyelesaikan satu pendaftaran (keluhan UX dari V1).
- Pengecekan keaktifan kartu BPJS & penerbitan SEP dilakukan dengan alur yang **rentan salah** (mis. SEP terbit untuk kartu tidak aktif) bila tidak tervalidasi sistem. [ASUMSI]
- Saat **bridging BPJS lambat**, petugas tidak mendapat informasi yang jelas sehingga mengira sistem internal error.
- Tidak ada **log** pendaftaran & log bridging BPJS untuk audit/troubleshooting.
- Registrasi **rujuk internal** ke penunjang belum dapat dipisah billing dari poli induk.
- Pasien rawat inap yang dirujuk internal ke Penunjang Medis (Hemodialisa, Fisioterapi, Terapi Wicara, Terapi Okupasi) **ikut muncul** di dashboard pendaftaran RJ sehingga membingungkan.

**Tujuan modul ini:** menyederhanakan alur pendaftaran (mengurangi klik), memastikan validasi penjaminan/BPJS yang benar, memberi transparansi status bridging, mencatat log audit, dan menghasilkan seluruh dokumen pendaftaran secara cepat dan akurat sesuai target performa (proses pendaftaran maks. 1 detik).

## 3. In Scope

### 3.1 Scope Definition (yang dikerjakan)
- Pencarian & identifikasi pasien (No. RM / NIK / Nama / Tgl Lahir / Alamat) + verifikasi dua identitas.
- Registrasi pasien **baru** via: Scan KTP (OCR), Bridging Disdukcapil (input NIK), atau input manual; termasuk **deteksi duplikat RM** (matching NIK + nama + tgl lahir + alamat) dan konfirmasi gunakan RM existing / buat baru.
- Registrasi pasien **lama** (cari data existing).
- Pendaftaran **onsite** & **booking**; menerima booking dari **MJKN**.
- Pemilihan jenis layanan (Klinik / Klinik & Penunjang / Penunjang), poli & dokter, jadwal (jam mulai–selesai + ruangan).
- Pemilihan jenis penjaminan; cek keaktifan kartu BPJS; **penerbitan & cetak SEP**.
- Screening gejala awal (batuk/demam) → set flag pasien & arahkan isolasi/masker.
- Generate & cetak **nomor antrian**; cetak **barcode pasien**, **kartu pasien**.
- Pembatalan pendaftaran (klinik & penunjang → batal klinik saja; pembatalan penunjang perlu konfirmasi petugas), **batal check-in**, penandaan **batal periksa**, penghapusan registrasi oleh Kepala Pendaftaran.
- Pengubahan tipe penjamin.
- Trigger update **kuota dokter** (daftar & batal); pembuatan **billing/biaya admin** otomatis; pemisahan billing rujuk internal vs poli induk.
- **Log** pendaftaran pasien & log bridging BPJS.
- Dashboard list pasien terdaftar ke klinik & rujuk internal dari RJ dan IGD.

### 3.2 Out Scope (yang TIDAK dikerjakan)
- Pemanggilan pasien di poli & display antrian (ditangani **B9 Display Antrian** / **B8 APM**).
- Pelayanan medis di poli / EMR klinis (modul Pelayanan Utama).
- Pendaftaran Rawat Inap (**B2**), IGD (**B3**), Lab (**B4**), Radiologi (**B5**), Rehab Medis (**B6**), MCU detail (**B7**) — kecuali keterkaitan rujuk/penunjang.
- Verifikasi klaim BPJS pasca-pelayanan (modul Keuangan/Verifikator).
- **Implementasi nyata** integrasi yang pada fase ini masih mock (lihat §13) — implementasi live = fase berikut. [PERLU KONFIRMASI]
- Penggantian/penghapusan master data (dokter, poli, tindakan, tarif) — dikelola di Control Panel/Master Data.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Pendaftaran cepat | Waktu proses simpan pendaftaran | maks. **1 detik** |
| Dashboard responsif | Loading dashboard | maks. **1 detik** |
| Navigasi list cepat | Loading pagination | **< 1 detik** |
| Pencarian cepat | Waktu tampil hasil pencarian | **< 1 detik** (target draft); ≤ **2 detik** untuk DB ≤ 100.000 pasien (acceptance PDF) |
| Skala harian | Pasien RJ/hari yang dapat dilayani | **500–600** |
| Skala bulanan | Pasien RJ/bulan | **9.000–10.000** |
| Mengurangi klik | Jumlah klik per pendaftaran vs V1 | Berkurang signifikan (target [PERLU KONFIRMASI] angka pasti) |
| Akurasi penjaminan | SEP terbit hanya untuk kartu BPJS aktif | **100%** (tidak ada SEP utk kartu non-aktif) |
| Akurasi identitas | Insiden pasien tertukar | **0** (verifikasi dua identitas wajib) |
| Auditability | Cakupan log pendaftaran & bridging BPJS | **100%** transaksi tercatat |
| Integritas RM | Duplikat RM baru akibat pendaftaran | Mendekati **0** (deteksi duplikat aktif) |

## 5. Related Feature

Fitur terkait dari List Fitur (cluster **Admisi**):

| Code | Menu | Keterkaitan |
|------|------|-------------|
| **B1** | Pendaftaran > Pendaftaran Rawat Jalan | **Modul ini** |
| B2 | Pendaftaran > Pendaftaran Rawat Inap | Berbagi master pasien & field (`no_rm`, `unit`, `dokter_id`); pasien RI rujuk internal **tidak** tampil di dashboard RJ |
| B3 | Pendaftaran > IGD | Pasien IGD dapat rujuk internal ke RJ (tampil di dashboard) |
| B4 | Pendaftaran > Laboratorium | Tujuan layanan penunjang (Klinik & Penunjang / Penunjang) |
| B5 | Pendaftaran > Radiologi | Tujuan layanan penunjang |
| B6 | Pendaftaran > Rehabilitasi Medis | Tujuan penunjang (Fisioterapi, Terapi Wicara, Terapi Okupasi) |
| B7 | Pendaftaran > MCU | Jenis layanan Klinik MCU (pilih paket MCU) |
| B8 | Antrian > APM | Sumber pendaftaran mandiri / nomor antrian |
| B9 | Antrian > Display antrian | Konsumen nomor antrian yang di-generate modul ini |

Master data terkait (Control Panel): **A2** Master Staf (sumber `dokter_id`), **A3** Master Unit (sumber `unit`), **A19** Master Instalasi.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [sebagian ASUMSI]
- Petugas mencari/membuat data pasien; pencarian belum optimal sehingga **duplikat RM** mungkin terbentuk.
- Cek keaktifan BPJS & penerbitan SEP dilakukan tanpa validasi terpadu → risiko **SEP untuk kartu non-aktif**.
- Saat bridging BPJS lambat, **tidak ada indikator**; petugas bingung apakah error internal.
- Banyak **klik/langkah** untuk satu pendaftaran.
- Tidak ada **log** pendaftaran & bridging.
- Billing rujuk internal **tergabung** dengan poli induk.
- Pasien RI yang dirujuk ke penunjang medis **ikut muncul** di dashboard RJ.

### B. To-Be (kondisi diharapkan — turunan BPMN g-admisi-onsite-registration)
1. **Identifikasi status pasien** → Keputusan **Pasien baru atau lama?** (BPMN: gateway #7).
2. **Pasien lama** → *Cari data pasien* → *Verifikasi identitas pasien* → *Review hasil cek riwayat piutang*.
3. **Pasien baru** → Keputusan **Metode input data?** → *Scan KTP (OCR)* **atau** *Input NIK untuk Bridging Disdukcapil* (Call API Disdukcapil & tarik demografi) **atau** *Input data pasien baru* → *Verifikasi & lengkapi data pasien*.
4. **Duplicate Detection** (NIK + nama + tgl lahir + alamat) → *Review hasil deteksi duplikat RM* → Keputusan **Ada kandidat duplikat?** (Ya → *Konfirmasi: gunakan RM existing atau buat baru*; Tidak → lanjut).
5. **Screening gejala awal: Batuk? Demam?** → bila Ya: *Arahkan ke ruang isolasi & berikan masker* + sistem set flag "Pasien Batuk/Tempo" (visible di unit downstream).
6. **Pilih jenis layanan**: Klinik / Klinik & Penunjang / Penunjang (Klinik MCU → *Pilih paket MCU*) → *Pilih poli dan dokter* (+ jadwal: jam mulai–selesai & ruangan).
7. **Pilih jenis penjaminan** → Keputusan **Jenis penjaminan?**: 
   - **BPJS** → *Cek status kartu BPJS* → Keputusan **Kartu aktif?** (Tidak → event *Kartu tidak aktif*, arahkan ke Umum/lengkapi; Ya → *Verifikasi biometrik* → Keputusan **Eligibility valid?** → Valid → *Penerbitan SEP* → event *SEP berhasil dibuat*; Tidak valid → event *Eligibility tidak valid*).
   - **Asuransi** → *Verifikasi kelengkapan dokumen asuransi* → *Input data asuransi*.
   - **Umum** → langsung ke generate antrian.
8. *Generate nomor antrian* → *Cetak nomor antrean* → trigger update kuota dokter & pembuatan billing/biaya admin → event **Pendaftaran selesai**.
9. Cetak dokumen tambahan: barcode pasien, kartu pasien, SEP.

Dashboard menampilkan list pasien terdaftar ke klinik & rujuk internal dari RJ/IGD; pasien RI yang dirujuk ke penunjang medis **disembunyikan**.

## 7. Main Flow / Mindmap

**Skenario A — Pasien lama, penjamin BPJS, layanan Klinik (happy path):**
1. Petugas buka halaman Pendaftaran RJ → cari pasien (No. RM/NIK/Nama). *(BPMN: Cari data pasien)*
2. Pilih kandidat → **verifikasi dua identitas** (nama + tgl lahir verbal). *(Verifikasi identitas pasien)*
3. Sistem tampilkan **riwayat piutang** → petugas review/informasikan. *(Cek riwayat piutang pasien)*
4. Screening batuk/demam → bila perlu arahkan isolasi & masker. *(Screening gejala awal)*
5. Pilih jenis layanan **Klinik** → pilih poli, dokter, jadwal (jam & ruangan). *(Pilih poli dan dokter)*
6. Pilih penjaminan **BPJS** → sistem cek kartu → verifikasi biometrik → eligibility → **terbitkan SEP**. *(Cek status kartu BPJS → Penerbitan SEP)*
7. Generate & cetak nomor antrian; trigger update kuota dokter; buat billing admin. *(Generate nomor antrian)*
8. Cetak SEP / barcode / kartu pasien → **Pendaftaran selesai**.

**Skenario B — Pasien baru, input via Scan KTP / Bridging Disdukcapil:**
1. Identifikasi status → **Pasien baru** → pilih metode input. *(Metode input data?)*
2. Scan KTP (OCR) **atau** input NIK → Bridging Disdukcapil tarik demografi **atau** input manual. *(Scan KTP / Input NIK / Input data pasien baru)*
3. Verifikasi & lengkapi data → **Duplicate Detection** → bila ada kandidat, konfirmasi gunakan RM existing / buat baru. *(Ada kandidat duplikat?)*
4. Lanjut ke screening → jenis layanan → poli/dokter → penjaminan → antrian (sama seperti Skenario A).

**Skenario C — Pasien Umum / Asuransi:**
- **Umum** → setelah pilih poli/dokter langsung *Generate nomor antrian* (tanpa SEP).
- **Asuransi** → *Verifikasi kelengkapan dokumen asuransi* → *Input data asuransi* → generate antrian.

**Skenario D — Klinik & Penunjang / Penunjang (rujuk internal):**
- Pilih layanan Klinik & Penunjang → daftarkan ke poli + penunjang (Lab/Rad/Rehab) → **billing penunjang terpisah** dari poli induk.

**Skenario E — Pembatalan / Batal check-in / Batal periksa:**
- Batal pendaftaran klinik+penunjang → **batal klinik saja**; pembatalan penunjang **butuh konfirmasi petugas**.
- Batal → **kuota dokter dikembalikan**; status ditandai (batal periksa / batal check-in).
- Kepala Pendaftaran dapat **menghapus** registrasi yang sudah dilayani karena kesalahan input perawat.

**Skenario F — Booking & MJKN:**
- Pendaftaran booking (onsite future-dated) atau **terima booking dari MJKN** → masuk antrian sesuai jadwal; trigger kirim nomor antrian ke MJKN.

## 8. Business Rules

| ID | Aturan | Sumber/Trace |
|----|--------|--------------|
| **BR-001** | Sebelum membuat record baru, sistem **wajib** menjalankan pencarian pasien terlebih dahulu. | PDF Phase 1; BPMN Identifikasi status pasien |
| **BR-002** | Petugas **wajib** verifikasi dua identitas (nama lengkap + tgl lahir) sebelum lanjut registrasi/kunjungan baru. | PDF; BPMN Verifikasi identitas pasien |
| **BR-003** | Pencarian harus toleran terhadap kapitalisasi & spasi (mis. "siti aisyah" = "Siti Aisyah"). | PDF Aturan |
| **BR-004** | Bila **Duplicate Detection** (NIK+nama+tgl lahir+alamat) menemukan kandidat → petugas **wajib** konfirmasi: gunakan RM existing atau buat baru. | BPMN Ada kandidat duplikat? |
| **BR-005** | Jika kartu BPJS **tidak aktif** → **dilarang** menerbitkan SEP; arahkan ke jalur Umum atau perbaikan data. | BPMN Kartu aktif? → Kartu tidak aktif |
| **BR-006** | SEP hanya terbit bila **eligibility valid** setelah verifikasi biometrik. | BPMN Eligibility valid? → Penerbitan SEP |
| **BR-007** | Saat proses bridging BPJS lambat, sistem menampilkan **status loading yang jelas** ("menunggu respon BPJS") agar tidak dianggap error internal. | Draft Aspek Bisnis Proses #2 |
| **BR-008** | Bila screening **batuk/demam = Ya** → set flag "Pasien Batuk/Tempo" (visible di poli/ranap/IGD), beri masker & arahkan ke ruang isolasi. | BPMN Screening gejala awal |
| **BR-009** | Pembatalan pendaftaran **Klinik & Penunjang** hanya membatalkan **klinik**; pembatalan **penunjang** harus **dikonfirmasi petugas**. | Draft kemampuan #4 |
| **BR-010** | Setiap **daftar** → kuota dokter berkurang; setiap **batal** → kuota dokter dikembalikan. | Draft kemampuan #9 |
| **BR-011** | Setiap pendaftaran (baru/lama) **otomatis** men-generate biaya admin pendaftaran & membuat billing. | Draft Mock #1, #8 |
| **BR-012** | **Billing rujuk internal** ke penunjang **terpisah** dari billing poli induk. | Draft Aspek Bisnis Proses #1 |
| **BR-013** | Pasien **rawat inap** yang dirujuk internal ke Penunjang Medis (Hemodialisa, Fisioterapi, Terapi Wicara, Terapi Okupasi) **tidak tampil** di dashboard pendaftaran RJ. | Draft scope #4 |
| **BR-014** | Hanya **Kepala Pendaftaran** yang boleh menghapus registrasi pasien yang sudah dilayani (kasus kesalahan input). | Draft Aspek Bisnis Proses #4 |
| **BR-015** | Petugas pendaftaran dapat **mengubah tipe penjamin** dan menandai pendaftaran sebagai **batal periksa**. | Draft Aspek Bisnis Proses #3, #5 |
| **BR-016** | Setiap aksi **tambah/batal pendaftaran** dan setiap **bridging BPJS** wajib tercatat di **log**. | Draft Aspek Logic System #1, #2 |
| **BR-017** | Saat pendaftaran, simpan **jam mulai–selesai** & **ruangan** dari jadwal dokter terpilih. | Draft kemampuan #10 |
| **BR-018** | Booking dari **MJKN** diterima sistem & nomor antrian dikirim balik ke MJKN sesuai jadwal. | Draft scope #2, Mock #7, #9 |

## 9. User Stories

- **US-001** — Sebagai **Petugas Pendaftaran**, saya ingin mencari pasien (No. RM/NIK/Nama/Tgl Lahir/Alamat) dengan cepat dan melihat ≥2 identitas, agar pasien tidak tertukar. *(BPMN: Cari data pasien; ref FR-001/002)*
- **US-002** — Sebagai Petugas Pendaftaran, saya ingin mendaftarkan **pasien baru** via Scan KTP/Bridging Disdukcapil/manual, agar input cepat & akurat. *(BPMN: Metode input data?)*
- **US-003** — Sebagai Petugas Pendaftaran, saya ingin sistem mendeteksi **duplikat RM** dan meminta konfirmasi, agar tidak terbentuk RM ganda. *(BPMN: Ada kandidat duplikat?)*
- **US-004** — Sebagai Petugas Pendaftaran, saya ingin memilih jenis layanan (Klinik / Klinik & Penunjang / Penunjang) + poli, dokter, dan jadwal, agar pasien terarah ke layanan yang tepat. *(BPMN: Pilih jenis layanan / Pilih poli dan dokter)*
- **US-005** — Sebagai Petugas Pendaftaran, saya ingin sistem **cek keaktifan kartu BPJS** sebelum menerbitkan SEP, agar tidak salah membuat SEP. *(BPMN: Cek status kartu BPJS / Kartu aktif?)*
- **US-006** — Sebagai Petugas Pendaftaran, saya ingin **membuat & mencetak SEP** otomatis saat eligibility valid, agar pasien BPJS terlayani. *(BPMN: Penerbitan SEP)*
- **US-007** — Sebagai Petugas Pendaftaran, saya ingin **indikator loading bridging BPJS yang jelas**, agar tahu keterlambatan berasal dari BPJS bukan sistem internal. *(Draft Aspek Bisnis #2)*
- **US-008** — Sebagai Petugas Pendaftaran, saya ingin mencetak **nomor antrian, barcode, dan kartu pasien**, agar dokumen pendaftaran lengkap. *(BPMN: Cetak nomor antrean)*
- **US-009** — Sebagai Petugas Pendaftaran, saya ingin **membatalkan pendaftaran / batal check-in / menandai batal periksa**, agar data sesuai kondisi nyata. *(Draft Aspek Bisnis #3)*
- **US-010** — Sebagai Petugas Pendaftaran, saya ingin pembatalan otomatis **mengembalikan kuota dokter**, agar kuota akurat. *(Draft kemampuan #9)*
- **US-011** — Sebagai **Kepala Pendaftaran**, saya ingin **menghapus registrasi** pasien yang sudah dilayani akibat kesalahan input, agar data bersih. *(Draft Aspek Bisnis #4)*
- **US-012** — Sebagai Petugas Pendaftaran, saya ingin **mengubah tipe penjamin**, agar koreksi penjaminan cepat. *(Draft Aspek Bisnis #5)*
- **US-013** — Sebagai Petugas Pendaftaran, saya ingin melihat **dashboard list pasien terdaftar** ke klinik & rujuk internal dari RJ/IGD (tanpa pasien RI ke penunjang medis), agar pemantauan jelas. *(Draft kemampuan #3, scope #4)*
- **US-014** — Sebagai Petugas Pendaftaran, saya ingin menerima **booking dari MJKN** dan mendaftarkan pasien **onsite/booking**, agar antrian terkelola. *(Draft scope #1, #2)*
- **US-015** — Sebagai **Manajemen/Auditor**, saya ingin **log pendaftaran & bridging BPJS**, agar dapat ditelusuri saat insiden. *(Draft Aspek Logic System)*
- **US-016** — Sebagai Petugas Pendaftaran, saya ingin alur pendaftaran **lebih sedikit klik**, agar lebih cepat saat peak pagi. *(Draft Aspek UX #1)*

## 10. Functional Requirements

| ID | Requirement | Prioritas | Trace BPMN / US |
|----|-------------|-----------|-----------------|
| **FR-001** | Sistem menyediakan pencarian pasien minimal by No. RM, NIK, atau Nama; dapat diperluas by Tgl Lahir & Alamat. | P0 | Cari data pasien / US-001 |
| **FR-002** | Hasil pencarian menampilkan ≥2 identitas (nama lengkap, tgl lahir) + alamat tanpa membuka detail; mendukung paginasi & pencocokan toleran kapitalisasi/spasi. | P0 | US-001 |
| **FR-003** | Sistem menyediakan registrasi pasien baru via **Scan KTP (OCR)**, **Bridging Disdukcapil (input NIK)**, atau **input manual**. | P0 | Metode input data? / US-002 |
| **FR-004** | Sistem menjalankan **Duplicate Detection** (NIK+nama+tgl lahir+alamat) dan menampilkan kandidat untuk dikonfirmasi (RM existing / buat baru). | P0 | Ada kandidat duplikat? / US-003 |
| **FR-005** | Sistem menampilkan **riwayat piutang** pasien saat registrasi. | P1 | Cek riwayat piutang / US-001 |
| **FR-006** | Sistem menyediakan **screening gejala awal** (batuk/demam); bila positif set flag & instruksi isolasi/masker. | P1 | Screening gejala awal / BR-008 |
| **FR-007** | Sistem memungkinkan pemilihan **jenis layanan** (Klinik / Klinik & Penunjang / Penunjang) & **paket MCU** bila Klinik MCU. | P0 | Pilih jenis layanan / US-004 |
| **FR-008** | Sistem memungkinkan pemilihan **poli, dokter, dan jadwal** (jam mulai–selesai + ruangan) dan menyimpannya. | P0 | Pilih poli dan dokter / BR-017 |
| **FR-009** | Sistem memungkinkan pemilihan **jenis penjaminan** (BPJS / Asuransi / Umum) dan pengubahan tipe penjamin. | P0 | Pilih jenis penjaminan / US-012 |
| **FR-010** | Sistem **mengecek keaktifan kartu BPJS** & eligibility sebelum penerbitan SEP; blokir SEP bila tidak aktif/tidak valid. | P0 | Cek status kartu BPJS / BR-005,006 |
| **FR-011** | Sistem **membuat & mencetak SEP**. | P0 | Penerbitan SEP / US-006 |
| **FR-012** | Sistem menampilkan **indikator loading bridging BPJS** yang jelas saat respon lambat. | P1 | BR-007 / US-007 |
| **FR-013** | Sistem **generate & cetak nomor antrian**, **cetak barcode pasien**, **cetak kartu pasien**. | P0 | Generate nomor antrian / US-008 |
| **FR-014** | Setiap pendaftaran **trigger update kuota dokter** (kurang saat daftar, kembali saat batal). | P0 | BR-010 / US-010 |
| **FR-015** | Setiap pendaftaran **men-generate biaya admin & billing** otomatis; billing rujuk internal **terpisah** dari poli induk. | P0 | BR-011,012 |
| **FR-016** | Sistem mendukung **pembatalan pendaftaran**: Klinik & Penunjang → batal klinik saja; pembatalan penunjang butuh konfirmasi petugas; mendukung **batal check-in** & **batal periksa**. | P0 | BR-009,015 / US-009 |
| **FR-017** | **Kepala Pendaftaran** dapat menghapus registrasi pasien yang sudah dilayani (role-based). | P1 | BR-014 / US-011 |
| **FR-018** | Sistem menampilkan **dashboard** list pasien terdaftar ke klinik & rujuk internal dari RJ/IGD; **menyembunyikan** pasien RI yang dirujuk ke penunjang medis. | P0 | BR-013 / US-013 |
| **FR-019** | Sistem mendukung pendaftaran **onsite & booking** dan **menerima booking dari MJKN**; mengirim nomor antrian ke MJKN. | P1 | BR-018 / US-014 |
| **FR-020** | Sistem mencatat **log pendaftaran** (tambah/batal) & **log bridging BPJS**. | P0 | BR-016 / US-015 |

## 11. Data Requirements (Spesifikasi Field)

> Konsistensi: field kanonik (`no_rm`, `nik`, `nama`, `jenis_kelamin`, `tgl_lahir`, `tempat_lahir`, `alamat`, `kode_wilayah`, `no_telp`, `no_hp`, `unit`, `dokter_id`, `status_aktif`) memakai definisi bersama lintas-PRD (Konteks PRD terkait). Jangan dibuat tandingan.

### 11.1 Layar INPUT — Pencarian Pasien (FR-001/002)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keyword | Kata Kunci | text | Tidak | min 2 char; toleran kapitalisasi/spasi | manual | cocokkan ke RM/NIK/Nama |
| filter_by | Cari Berdasarkan | dropdown | Ya | enum: No. RM / NIK / Nama / Tgl Lahir / Alamat | enum; default Nama | |
| no_rm | No. RM | text | Tidak | format RM RS | lookup master pasien | field kanonik |
| nik | NIK | text | Tidak | 16 digit | manual | field kanonik |
| tgl_lahir | Tanggal Lahir | date | Tidak | ≤ hari ini | manual | field kanonik |

### 11.2 Layar INPUT — Registrasi Pasien Baru (FR-003)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| metode_input | Metode Input | dropdown | Ya | enum: Scan KTP / Bridging NIK / Manual | enum | BPMN Metode input data? |
| nik | NIK | text | Ya | 16 digit; valid | OCR KTP / manual / Disdukcapil | field kanonik; trigger bridging |
| nama | Nama Lengkap | text | Ya | maks 100 char | OCR/Disdukcapil/manual | field kanonik |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | L / P | Disdukcapil/manual | field kanonik |
| tempat_lahir | Tempat Lahir | text | Ya | maks 50 char | Disdukcapil/manual | field kanonik |
| tgl_lahir | Tanggal Lahir | date | Ya | ≤ hari ini | Disdukcapil/manual | field kanonik |
| alamat | Alamat | text | Ya | maks 255 char | Disdukcapil/manual | field kanonik |
| kode_wilayah | Kode Wilayah | lookup | Tidak | kode Kemendagri (s/d 10 digit) | master wilayah | field kanonik |
| no_telp | No. Telp | text | Tidak | numerik | manual | field kanonik |
| no_hp | No. HP | text | Tidak | numerik, 10–15 digit | manual | field kanonik |
| file_ktp | Hasil Scan KTP | file | Tidak | gambar; OCR | scan/OCR | sumber auto isi field |
| no_rm | No. RM | text | Tidak | auto-generate unik | auto | terisi setelah simpan |

### 11.3 Layar INPUT — Detail Pendaftaran / Kunjungan (FR-007/008/009)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| tipe_kunjungan | Tipe Kunjungan | dropdown | Ya | enum: Onsite / Booking / MJKN | enum; default Onsite | FR-019 |
| tgl_kunjungan | Tanggal Kunjungan | date | Ya | ≥ hari ini (booking) | manual/MJKN | |
| jenis_layanan | Jenis Layanan | dropdown | Ya | enum: Klinik / Klinik & Penunjang / Penunjang | enum | BPMN Pilih jenis layanan |
| paket_mcu | Paket MCU | dropdown | Tidak | dari master paket MCU | lookup (B7) | wajib bila Klinik MCU |
| unit | Unit/Poli | dropdown(lookup) | Ya | dari master Unit (A3) | lookup A3 | field kanonik |
| dokter_id | Dokter (DPJP) | dropdown(lookup) | Ya | master Staf (A2), jenis_tenaga=dokter | lookup A2 (mock API jadwal) | field kanonik |
| jadwal_id | Jadwal Dokter | dropdown(lookup) | Ya | dari jadwal aktif dokter | mock API jadwal | |
| jam_mulai | Jam Mulai | time | Ya | dari jadwal terpilih | auto dari jadwal | BR-017 |
| jam_selesai | Jam Selesai | time | Ya | dari jadwal terpilih | auto dari jadwal | BR-017 |
| ruangan | Ruangan | text/lookup | Ya | dari jadwal terpilih | auto dari jadwal | BR-017 |
| penunjang_tujuan | Penunjang Tujuan | multiselect(lookup) | Tidak | Lab/Rad/Rehab (B4–B6) | lookup | wajib bila ada penunjang |
| jenis_penjamin | Jenis Penjamin | dropdown | Ya | enum: BPJS / Asuransi / Umum | enum (mock API asuransi) | dapat diubah (US-012) |
| screening_batuk | Batuk? | boolean | Ya | Ya/Tidak | manual | BR-008 |
| screening_demam | Demam? | boolean | Ya | Ya/Tidak | manual | BR-008 |

### 11.4 Layar INPUT — Penjaminan BPJS / SEP (FR-010/011)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_kartu_bpjs | No. Kartu BPJS | text | Ya (BPJS) | 13 digit | manual/MJKN | mock cek keaktifan |
| status_kartu | Status Kartu | display | – | aktif/tidak aktif | integrasi BPJS (mock) | BR-005 |
| jenis_kunjungan_bpjs | Jenis Kunjungan | dropdown | Ya (BPJS) | enum: Kunjungan Sakit/Sehat | enum | VClaim |
| no_rujukan | No. Rujukan | text | Tidak | format rujukan BPJS | manual/VClaim | bila rujukan FKTP |
| poli_tujuan_bpjs | Poli Tujuan (BPJS) | dropdown | Ya (BPJS) | mapping poli BPJS | lookup | |
| diagnosa_awal | Diagnosa Awal | lookup | Tidak | ICD-10 | master ICD | [PERLU KONFIRMASI] wajib/tidak |
| no_sep | No. SEP | text | – | auto dari BPJS | integrasi BPJS (mock) | hasil Penerbitan SEP |

### 11.5 Layar INPUT — Asuransi (FR-009, non-BPJS)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| asuransi_id | Nama Asuransi | dropdown(lookup) | Ya | master asuransi (mock API) | lookup | |
| no_polis | No. Polis/Anggota | text | Ya | sesuai asuransi | manual | |
| dokumen_asuransi | Dokumen Asuransi | file | Tidak | pdf/gambar | upload | BPMN Verifikasi kelengkapan dokumen |

### 11.6 Layar INPUT — Pembatalan / Batal Periksa (FR-016)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| registrasi_id | ID Registrasi | lookup | Ya | dari list terdaftar | sistem | |
| jenis_pembatalan | Jenis Pembatalan | dropdown | Ya | enum: Batal Daftar / Batal Check-in / Batal Periksa | enum | |
| batal_penunjang | Batal Penunjang? | boolean | Tidak | butuh konfirmasi petugas | manual | BR-009 |
| alasan_batal | Alasan | text | Ya | maks 255 char | manual | masuk log (BR-016) |

### 11.7 Layar TAMPIL — Dashboard Pendaftaran RJ (FR-018)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Terdaftar Hari Ini | count registrasi where tgl=today | angka besar (kartu) | – | loading ≤1 dtk |
| Antrian Aktif | count status=menunggu | angka | – | |
| No. Antrian | registrasi.no_antrian | text/badge | sort | |
| No. RM | pasien.no_rm | text | filter/search | field kanonik |
| Nama Pasien | pasien.nama | text | sort A-Z | tampilkan ≥2 identitas |
| Tgl Lahir | pasien.tgl_lahir | dd-mm-yyyy | – | identitas verifikasi |
| Poli/Unit | registrasi.unit | text | filter | field kanonik |
| Dokter | registrasi.dokter_id → Staf | text | filter | |
| Penjamin | registrasi.jenis_penjamin | badge | filter | BPJS/Asuransi/Umum |
| Status SEP | registrasi.no_sep | badge (terbit/belum/N-A) | filter | merah bila gagal |
| Sumber | registrasi.tipe_kunjungan | badge | filter | Onsite/Booking/MJKN |
| Status | registrasi.status | badge | filter | terdaftar/check-in/batal/batal periksa |
| Flag Gejala | registrasi.flag_batuk | badge merah | filter | BR-008 |
| Aksi | – | tombol (Cetak SEP/Antrian/Kartu/Barcode, Batal) | – | role-based |

> Pasien RI yang dirujuk ke penunjang medis (Hemodialisa/Fisioterapi/Terapi Wicara/Terapi Okupasi) **di-exclude** dari dashboard ini (BR-013).

### 11.8 Layar TAMPIL — Log Pendaftaran & Bridging BPJS (FR-020)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | log.timestamp | dd-mm-yyyy HH:mm:ss | sort desc | |
| User | log.user_id → Staf | text | filter | siapa melakukan |
| Aksi | log.action | badge (tambah/batal/bridging) | filter | |
| No. RM / Pasien | log.no_rm | text | search | |
| Detail/Payload | log.detail | text/JSON | – | request/response BPJS |
| Status Bridging | log.bpjs_status | badge (sukses/gagal/timeout) | filter | BR-007 |

## 12. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| **NFR-001** | Waktu proses simpan pendaftaran | maks. **1 detik** |
| **NFR-002** | Waktu loading dashboard | maks. **1 detik** |
| **NFR-003** | Waktu loading pagination | **< 1 detik** |
| **NFR-004** | Waktu hasil pencarian pasien | **< 1 detik** (target draft); ≤ **2 detik** untuk DB ≤ 100.000 pasien |
| **NFR-005** | Throughput | mendukung **500–600 pasien/hari**, **9.000–10.000/bulan**, dengan peak pagi 07–11 (60–70% volume) |
| **NFR-006** | Ketahanan integrasi BPJS | Saat respon BPJS lambat/timeout, UI tetap responsif + indikator loading; tidak men-block seluruh aplikasi (BR-007) |
| **NFR-007** | Auditability | Seluruh aksi pendaftaran/pembatalan & bridging BPJS tercatat (immutable log) |
| **NFR-008** | Keamanan & akses | Role-based: Petugas Pendaftaran vs Kepala Pendaftaran (hak hapus registrasi); data identitas pasien dilindungi |
| **NFR-009** | Usability | Mengurangi jumlah klik per pendaftaran dibanding V1 (alur ringkas, default cerdas) |
| **NFR-010** | Reliabilitas cetak | Cetak SEP/antrian/barcode/kartu konsisten; idempoten (cetak ulang tidak menggandakan transaksi) |
| **NFR-011** | Konektivitas | Pertimbangkan keandalan saat internet RS tipe C/D tidak stabil — antrian retry untuk pengiriman MJKN/bridging [ASUMSI] |
| **NFR-012** | Interoperabilitas | Patuh standar SATUSEHAT/BPJS pada implementasi live (fase berikut) [PERLU KONFIRMASI] |

## 13. Integrasi Eksternal

> **Catatan fase:** pada Phase 1 sebagian integrasi berbentuk **mock** sesuai draft. Implementasi **live** = fase berikut. [PERLU KONFIRMASI cakupan go-live]

| Integrasi | Fungsi | Status Fase 1 | Trace |
|-----------|--------|---------------|-------|
| **BPJS VClaim** | Cek keaktifan kartu, eligibility, **penerbitan SEP**, verifikasi biometrik | **Mock API** | FR-010/011, BPMN Penerbitan SEP |
| **BPJS Antrol / Aplicares** | Pengiriman & sinkron nomor antrian | **Mock function** | FR-019 |
| **Mobile JKN (MJKN)** | Terima booking pendaftaran; kirim nomor antrian | **Mock function** | FR-019, Draft scope #2 |
| **Disdukcapil** | Bridging NIK → tarik data demografi pasien | Live/Mock [PERLU KONFIRMASI] | FR-003, BPMN Call API Disdukcapil |
| **OCR KTP** | Ekstrak data KTP dari scan | [PERLU KONFIRMASI] | FR-003, BPMN Scan KTP (OCR) |
| **Asuransi (pihak ketiga)** | Pilih asuransi & verifikasi polis | **Mock API** | FR-009 |
| **Modul Jadwal Dokter** | Ambil jadwal & kuota dokter; update kuota saat daftar/batal | **Mock API + mock update kuota** | FR-008/014 |
| **Modul Billing/Keuangan** | Generate biaya admin & billing (poli induk + rujuk internal terpisah) | **Mock** | FR-015 |
| **Master Tindakan Admin** | Cari item tindakan admin pendaftaran | **Mock** | Draft Mock #2 |
| **Generator Kode Antrian** | Dapatkan kode antrian sesuai jadwal terpilih | **Mock** | Draft Mock #9 |
| **SATUSEHAT** | Interoperabilitas/kode standar | Belum di fase ini [PERLU KONFIRMASI] | NFR-012 |

**Master data internal terkait:** Master Staf (A2 → `dokter_id`), Master Unit (A3 → `unit`), Master Instalasi (A19), Master Paket MCU (B7), Master ICD-10, Master Wilayah (Kemendagri).

## Asumsi
- [ASUMSI] Kondisi As-Is sebagian disusun dari keluhan di draft (banyak klik, tanpa log, SEP rawan salah) karena dokumen As-Is formal tidak disediakan.
- [ASUMSI] Enum jenis penjamin = BPJS / Asuransi / Umum, dan jenis layanan = Klinik / Klinik & Penunjang / Penunjang sesuai BPMN & draft.
- [ASUMSI] No. RM di-generate otomatis & unik oleh sistem setelah konfirmasi bukan duplikat.
- [ASUMSI] Pengembalian kuota dokter terjadi otomatis pada semua jenis pembatalan (batal daftar/check-in/periksa).
- [ASUMSI] Field penjaminan BPJS (no_kartu_bpjs 13 digit, jenis kunjungan, rujukan) mengikuti format VClaim standar; akan disesuaikan saat integrasi live.
- [ASUMSI] Dashboard meng-exclude pasien RI→penunjang medis berdasarkan flag asal registrasi (rawat inap + tujuan penunjang medis tertentu).
- [ASUMSI] Log bersifat append-only (immutable) untuk kebutuhan audit.
- [ASUMSI] Pendaftaran 'booking' = pendaftaran untuk tanggal kunjungan di masa depan, dibedakan dari 'onsite' (hari ini).

## Pertanyaan Terbuka
- Target penurunan jumlah klik per pendaftaran vs V1 — berapa angka konkret yang dijadikan acceptance?
- Target waktu pencarian final: draft menyebut <1 detik, namun acceptance PDF menyebut ≤2 detik untuk DB ≤100.000 pasien — mana yang mengikat?
- Cakupan go-live integrasi: mana yang tetap mock setelah Phase 1 dan mana yang live (BPJS, Disdukcapil, OCR, MJKN, billing)?
- Apakah diagnosa awal (ICD-10) wajib saat penerbitan SEP rawat jalan?
- Definisi formal format No. RM dan No. SEP untuk RS ini (mengikuti kebijakan RS).
- Apakah SATUSEHAT (encounter rawat jalan) termasuk dalam scope modul ini atau modul EMR/Pelayanan?
- Mekanisme retry/offline untuk pengiriman antrian MJKN & bridging saat internet RS tidak stabil — apakah diperlukan di fase ini?
- Aturan kewenangan: selain Kepala Pendaftaran, role apa lagi yang boleh ubah penjamin / hapus registrasi?
- Verifikasi biometrik BPJS (fingerprint/face) — perangkat & alur di loket apakah tersedia di RS tipe C/D?