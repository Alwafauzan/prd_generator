# PRD — Pendaftaran MCU

**Related Document:** PRD Pendaftaran Rawat Jalan (B1); PRD Pendaftaran Laboratorium (B4); PRD Pendaftaran Radiologi (B5); Master Paket Layanan/Master Paket MCU; Flowchart Pendaftaran MCU; PRD_Pendaftaran_MCU.pdf
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

**Pendaftaran MCU (Medical Check-Up)** adalah jalur khusus pendaftaran rawat jalan untuk pasien yang membutuhkan pemeriksaan kesehatan menyeluruh — umumnya untuk keperluan pra-kerja, periodik perusahaan, sekolah/beasiswa, asuransi, atau persiapan perjalanan/ibadah (haji/umroh/visa).

Di Neurovi v1, pendaftaran MCU dilakukan melalui alur **Pendaftaran Rawat Jalan (B1)** dengan memilih **"Klinik MCU"** pada daftar klinik tujuan, tanpa pembedaan jalur. Modul ini menegaskan kembali pola tersebut untuk **Phase 1 MVP Neurovi v2**: pendaftaran MCU **identik dengan pendaftaran RJ reguler**, hanya berbeda pada pilihan klinik. Perbedaan utama secara fungsional adalah ketika klinik = Klinik MCU, sistem dapat **meng-generate order paket pemeriksaan penunjang (laboratorium & radiologi) secara otomatis** dari paket MCU yang dipilih, sehingga pendaftaran muncul baik di **dashboard pendaftaran RJ** maupun **dashboard pendaftaran penunjang**.

Lingkup PRD ini difokuskan pada **Phase 1 (MVP)** sesuai dokumen lampiran: migrasi tanpa gangguan dan reuse penuh alur RJ. Kapabilitas Phase 2 (validasi penjamin × MCU, field Tujuan MCU, field Paket MCU mandatory dengan auto-stage order penunjang, cetak bundle hasil MCU) dicatat sebagai roadmap dan ditandai `[**]`.

> Referensi: PRD_Pendaftaran_MCU.pdf, Pendaftaran RJ (B1), Pendaftaran Lab (B4), Pendaftaran Radiologi (B5).

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — dari lampiran PRD_Pendaftaran_MCU.pdf:

- Pendaftaran MCU memakai form Pendaftaran RJ. Petugas memilih **"Klinik MCU"** sebagai klinik tujuan, sama seperti memilih poli reguler.
- Identifikasi pasien (baru/lama), bridging Disdukcapil, skrining gejala (batuk/demam), cek piutang, pemilihan penjamin, pemilihan dokter & jadwal — semuanya berjalan **persis sama** dengan Pendaftaran RJ.
- **Tidak ada validasi khusus** saat penjamin BPJS digabung dengan Klinik MCU. BPJS umumnya **tidak menjamin MCU** (kecuali atas indikasi medis spesifik), sehingga tagihan MCU yang ter-set BPJS sering ditolak klaimnya dan harus dikoreksi belakangan.
- **Tidak ada field Tujuan MCU** (pra-kerja, periodik, sekolah, asuransi, dst.) maupun pengantar/perusahaan pengirim. Pelaporan komposisi MCU per tujuan harus disusun manual dari catatan kertas.
- **Pemilihan paket MCU tidak ada di pendaftaran**; paket dibahas di ruang MCU, perawat mencatat daftar pemeriksaan, lalu menginput order penunjang satu per satu di sistem → banyak klik, rawan terlewat.
- Hasil MCU dicetak per modul (lab, radiologi, asesmen); perawat menyatukan manual menjadi map kertas — tidak ada bundling cetak standar.
- Nomor antrean Klinik MCU sudah memakai format **Kode Poli + Nomor Urut** (mis. Q001, Q002) dengan auto-increment per klinik per hari.

**Masalah/pain point (dari draft user):**
- Aspek bisnis proses: ingin agar saat memilih Klinik MCU, paket pemeriksaan lab & radiologi dapat **ter-order otomatis** di awal (opsional).
- Aspek UX: masih terlalu banyak klik untuk mendaftarkan pasien.
- Aspek logic system: belum ada **log pendaftaran pasien** (menambah/membatalkan registrasi).

**Strategi rilis Neurovi v2:**
- **Phase 1 MVP** = sama dengan v1, fokus migrasi tanpa gangguan. Petugas yang hafal alur v1 langsung bisa pakai v2 tanpa training tambahan untuk MCU; sekaligus menyiapkan fondasi teknis agar Phase 2 dapat dirilis tanpa mengganggu operasional.
- **Phase 2** = enhancement penjawab pain point (validasi penjamin × MCU, field Tujuan MCU, field Paket MCU + auto-stage order penunjang, cetak bundle hasil MCU). `[**]`

> Perilaku volume (dari draft): rawat jalan 30–50 pasien/hari, ±300–400 pasien/bulan.

## 3. In Scope

### Scope Definition (Phase 1 — MVP)

1. **Entry point** pendaftaran MCU melalui menu Pendaftaran → Pendaftaran Pasien Rawat Jalan → tombol **"Tambah Pendaftar"**. **Tidak ada menu/form terpisah** untuk MCU.
2. **Pemilihan Klinik MCU** dari daftar klinik (master unit/A3), sama caranya dengan memilih poli reguler. **Tidak ada section khusus MCU di Phase 1.**
3. Identifikasi pasien (baru/lama), skrining gejala, cek piutang, pemilihan penjamin, pemilihan jenis layanan, pemilihan dokter & jadwal serta kuota, dan simpan — **mengikuti alur Pendaftaran RJ (B1) tanpa perbedaan**.
4. **Generate nomor antrean MCU** format **Kode Poli + Nomor Urut** (mis. Q001, Q002), auto-increment per klinik per hari (behavior existing v1). Kode poli dapat diatur tiap RS pada master data unit.
5. **Cetak slip antrean MCU** mengikuti mekanisme & layout pendaftaran RJ.
6. **Penerusan data pendaftaran ke modul pelayanan Klinik MCU otomatis** (tanpa refresh manual). Pendaftaran muncul di **dashboard pendaftaran RJ** dan **dashboard pendaftaran penunjang** (draft) `[ASUMSI dari draft user — order penunjang auto-generate]`.
7. **Order paket pemeriksaan laboratorium & radiologi** ter-generate setelah pasien terdaftar bila paket dipilih (di Phase 1 bersifat opsional / `[PERLU KONFIRMASI]` apakah paket diisi di pendaftaran atau di pelayanan — lihat Open Questions).
8. **Ubah & batalkan** pendaftaran MCU sebelum dilayani, termasuk membatalkan order paket pemeriksaan ke lab/radiologi yang **belum dilayani**, mengikuti alur RJ.
9. **Pencarian & filter** pada tabel utama pendaftaran RJ; filter Klinik = Klinik MCU otomatis tersedia karena MCU adalah salah satu klinik di master unit.
10. **Log pendaftaran pasien** (menambah, membatalkan registrasi) — dari pain point aspek logic system.
11. Auto-generate **biaya admin pendaftaran** (pasien baru/lama) & **billing** saat terdaftar (mock di MVP).

### Out Scope

- **[Phase 2] `[**]`** Section khusus MCU yang muncul saat memilih Klinik MCU.
- **[Phase 2] `[**]`** Validasi penjamin × MCU (dialog peringatan BPJS × Klinik MCU dengan opsi *ubah tipe penjamin* / *lanjutkan dengan catatan*).
- **[Phase 2] `[**]`** Field **Tujuan MCU** (mandatory dropdown: pra-kerja, periodik perusahaan, sekolah, beasiswa, asuransi, haji/umroh, visa/perjalanan, lain-lain) + field detail bila "Lain-lain".
- **[Phase 2] `[**]`** Field **Paket MCU** (mandatory dropdown dari Master Paket MCU) + auto-stage daftar pemeriksaan sebagai draft order penunjang siap di-review perawat.
- **[Phase 2] `[**]`** Cetak **bundle hasil MCU** standar (cover + asesmen + hasil penunjang + simpulan & rekomendasi).
- **[Phase 2] `[**]`** Validasi duplikasi pendaftaran MCU harian.
- Master Paket MCU / Master Paket Layanan itu sendiri (dependency PRD terpisah — Control Panel/Master Data).
- Modul pelayanan klinik MCU, input hasil, dan verifikasi klaim BPJS (modul lain).
- Integrasi nyata BPJS/Disdukcapil/Antrean MJKN — di MVP menggunakan **mock API/mock function** (lihat §13).

## 4. Goals and Metrics

### Tujuan
1. Pendaftaran MCU tetap berjalan di v2 dengan **minimal effort migration** (tanpa training tambahan untuk petugas).
2. Saat memilih Klinik MCU, order paket pemeriksaan lab & radiologi dapat **ter-generate otomatis** sehingga pendaftaran tampil di dashboard RJ dan dashboard penunjang.
3. Mengurangi jumlah klik & input manual order penunjang di ruang MCU.
4. Tersedia **audit log** pendaftaran (tambah/batal) untuk telusur.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Loading dashboard pendaftaran | ≤ 1 detik | Draft user (ekspektasi) |
| Loading pagination | < 1 detik | Draft user |
| Pencarian pasien | < 1 detik | Draft user |
| Proses simpan pendaftaran | ≤ 1 detik | Draft user |
| Pasien MCU per hari tertangani | 30–50 pasien/hari (≈300–400/bulan) | Draft user (behavior) |
| Akurasi auto-generate order penunjang dari paket | 100% item paket ter-order (bila paket dipilih) | `[ASUMSI]` |
| Pendaftaran MCU yang dibatalkan sebelum dilayani dapat membatalkan order penunjang belum dilayani | 100% | Goal user |
| Kelengkapan audit log (tambah/batal) | 100% aksi tercatat | Pain point logic |

## 5. Related Feature

Fitur terkait dari List Fitur (cluster **Admisi**):

| Code | Modul / Menu | Relasi dengan Pendaftaran MCU |
|------|--------------|-------------------------------|
| **B1** | Pendaftaran > Pendaftaran Rawat Jalan | **Parent flow.** MCU = RJ dengan Klinik MCU. Seluruh alur identifikasi, penjamin, dokter/jadwal, antrean reuse dari B1. |
| **B4** | Pendaftaran > Pendaftaran Laboratorium | Target order paket pemeriksaan **lab** yang ter-generate dari paket MCU. |
| **B5** | Pendaftaran > Pendaftaran Radiologi | Target order paket pemeriksaan **radiologi** yang ter-generate dari paket MCU. |
| B2 | Pendaftaran > Rawat Inap | Pola identifikasi pasien & penjamin yang konsisten. |
| B3 | Pendaftaran > IGD | Referensi pola pendaftaran. |
| B8 / B9 | Antrian > APM / Display Antrian | Konsumen nomor antrean MCU & trigger antrean MJKN. |

Dependency lintas modul: **Master Unit (A3)** (klinik MCU), **Master Staf (A2)** (dokter), **Master Paket Layanan / Master Paket MCU** (Phase 2), **Modul Pelayanan Klinik MCU**, **Billing/Kasir**.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1 / kondisi saat ini)
1. Petugas membuka Pendaftaran RJ → Tambah Pendaftar.
2. Identifikasi pasien (baru/lama), bridging Disdukcapil, skrining gejala, cek piutang, pilih penjamin, pilih **Klinik MCU**, pilih dokter & jadwal → simpan.
3. Nomor antrean MCU ter-generate (Kode Poli + Nomor Urut).
4. Pasien ke ruang MCU; **paket dibahas di ruang**, perawat mencatat manual & input order penunjang satu per satu.
5. Penjamin BPJS × MCU tidak divalidasi → klaim sering ditolak, dikoreksi belakangan.
6. Hasil dicetak per modul, disatukan manual jadi map kertas.

> Sumber: lampiran PRD. Pola alur identifikasi/penjamin/SEP mengacu BPMN `g-admisi-onsite-registration` (Verifikasi identitas, Cek status kartu BPJS, Pilih jenis penjaminan, Cek riwayat piutang, Konfirmasi RM existing/baru, Pilih poli & dokter). `[ASUMSI: pola diturunkan dari BPMN RJ onsite karena MCU belum punya BPMN sendiri]`

### B. To-Be (Neurovi v2 — Phase 1 MVP)
1. Petugas membuka **Pendaftaran RJ → Tambah Pendaftar** (entry point sama; tanpa form terpisah MCU).
2. **Identifikasi pasien**: cari pasien (kata kunci/NIK/No. RM) → jika ada kandidat duplikat, konfirmasi pakai RM existing atau buat baru; jika baru, input data demografis (opsi bridging Disdukcapil via NIK). `[ASUMSI dari BPMN g-admisi-onsite-registration]`
3. **Skrining gejala** & **cek piutang** mengikuti RJ.
4. **Pilih penjamin** (Umum/BPJS/Asuransi) → bila BPJS, cek keaktifan kartu & penerbitan SEP (mock API di MVP). _Validasi BPJS × MCU = Phase 2._ `[**]`
5. **Pilih Klinik MCU** dari master unit, lalu **pilih dokter & jadwal** (cek kuota) — semua sama dengan poli reguler.
6. **Simpan** → sistem: generate **No. RM** (bila baru), generate **nomor antrean MCU**, **auto-generate order paket pemeriksaan lab & radiologi** (bila paket dipilih), generate **biaya admin** & **billing** (mock), trigger **antrean MJKN** (mock function), tulis **audit log (tambah)**.
7. Data pendaftaran **diteruskan otomatis** ke dashboard Pelayanan Klinik MCU **dan** dashboard pendaftaran penunjang (order lab/radiologi sebagai draft).
8. **Cetak slip antrean** (layout RJ).
9. **Ubah/batal** sebelum dilayani: pembatalan registrasi MCU **membatalkan order penunjang yang belum dilayani**, tulis **audit log (batal)**.

## 7. Main Flow / Mindmap

### Skenario 1 — Pendaftaran MCU pasien baru (happy path)
1. Petugas klik **Tambah Pendaftar** di dashboard Pendaftaran RJ.
2. Cari pasien (kata kunci/NIK) → tidak ditemukan → pilih **Pasien Baru**.
3. (Opsi) Input NIK → **Bridging Disdukcapil** (mock) → autofill demografi; atau input manual.
4. Lengkapi data pasien baru → sistem generate **No. RM**.
5. Skrining gejala → cek piutang → pilih **Penjamin**.
6. Pilih **Klinik MCU** → pilih **Dokter** & **Jadwal** (cek kuota, update kuota — mock).
7. (Opsi Phase 1 / Phase 2) Pilih **Paket MCU**.
8. Klik **Simpan** → generate **nomor antrean MCU (Q###)** + **biaya admin** + **billing** (mock) + **auto-order lab & radiologi** (bila paket dipilih) + trigger **antrean MJKN** (mock) + **audit log (tambah)**.
9. **Cetak slip antrean**. Pendaftaran muncul di dashboard Pelayanan MCU & dashboard penunjang.

### Skenario 2 — Pendaftaran MCU pasien lama
2a. Cari pasien → ketemu → konfirmasi pakai **RM existing** (jika ada kandidat duplikat, pilih gunakan existing atau buat baru). Lanjut langkah 5.

### Skenario 3 — Penjamin BPJS (MVP)
5a. Penjamin = BPJS → cek keaktifan kartu (mock API) → bila aktif, terbitkan SEP (mock). _Peringatan BPJS × MCU = Phase 2_ `[**]`. Bila kartu tidak aktif → arahkan ke Umum/Asuransi `[ASUMSI dari BPMN onsite: gateway "Kartu aktif?"]`.

### Skenario 4 — Ubah / Batal sebelum dilayani
- Petugas buka pendaftaran MCU yang belum dilayani → **Ubah** (data/jadwal) atau **Batal**.
- Pada Batal: sistem membatalkan **order lab/radiologi yang belum dilayani**, batalkan billing terkait (mock), tulis **audit log (batal)**.
- Order yang **sudah dilayani** tidak dapat dibatalkan dari sini → `[PERLU KONFIRMASI]` perlu approval/alur khusus.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Pendaftaran MCU **tidak punya form terpisah**; selalu lewat form Pendaftaran RJ dengan memilih Klinik MCU. | In Scope Phase 1 |
| **BR-002** | Klinik MCU adalah entitas klinik di **master unit (A3)**; setiap RS dapat menyetel kode poli sendiri. | Lampiran PRD |
| **BR-003** | Nomor antrean MCU = **Kode Poli + Nomor Urut** (mis. Q001), **auto-increment per klinik per hari**, reset harian. | Lampiran PRD |
| **BR-004** | Bila **paket MCU dipilih**, sistem **auto-generate order pemeriksaan lab & radiologi** sesuai item paket; pendaftaran tampil di dashboard pendaftaran penunjang. | Draft user / Goal |
| **BR-005** | **Pembatalan** pendaftaran MCU sebelum dilayani **wajib membatalkan order penunjang yang belum dilayani**; order yang sudah dilayani **tidak** ikut dibatalkan. | Goal user |
| **BR-006** | Setiap pendaftaran (baru/lama) meng-generate **biaya admin pendaftaran** + **billing** secara otomatis. | Mock draft user |
| **BR-007** | Setiap aksi **tambah** & **batal** registrasi **wajib ditulis ke audit log** (user, timestamp, pasien, aksi). | Pain point logic |
| **BR-008** | Jika penjamin = **BPJS**, cek keaktifan kartu sebelum penerbitan SEP; kartu tidak aktif → SEP tidak terbit, arahkan ke Umum/Asuransi. `[ASUMSI BPMN g-admisi-onsite-registration]` | BPMN onsite |
| **BR-009** | Jika ditemukan **kandidat duplikat** pasien (matching NIK/nama/tgl lahir) → wajib konfirmasi gunakan RM existing atau buat baru. `[ASUMSI BPMN onsite]` | BPMN onsite |
| **BR-010 `[**]`** | **Phase 2:** kombinasi penjamin **BPJS × Klinik MCU** memunculkan dialog peringatan (BPJS umumnya tidak menjamin MCU) dengan opsi *ubah tipe penjamin* / *lanjutkan dengan catatan*. | Lampiran PRD Phase 2 |
| **BR-011 `[**]`** | **Phase 2:** field **Tujuan MCU** & **Paket MCU** mandatory saat klinik = Klinik MCU; "Lain-lain" → field detail wajib. | Lampiran PRD Phase 2 |
| **BR-012 `[**]`** | **Phase 2:** validasi **duplikasi pendaftaran MCU harian** untuk pasien yang sama. | Lampiran PRD Phase 2 |

## 9. User Stories

| ID | User Story | Trace |
|----|------------|-------|
| **US-001** | Sebagai **Petugas Pendaftaran**, saya ingin mendaftarkan **pasien baru** ke Klinik MCU lewat form RJ, agar tidak perlu mempelajari form baru. | Draft user #1; BR-001 |
| **US-002** | Sebagai **Petugas Pendaftaran**, saya ingin mendaftarkan **pasien lama** ke Klinik MCU dengan mencari RM existing, agar data riwayat tetap satu. | Draft user #2; BR-009 |
| **US-003** | Sebagai **Petugas Pendaftaran**, saya ingin saat memilih Klinik MCU sistem **otomatis meng-order paket lab & radiologi**, agar tidak input order satu per satu. | Draft user; BR-004 |
| **US-004** | Sebagai **Petugas Pendaftaran**, saya ingin pendaftaran MCU muncul di **dashboard RJ dan dashboard penunjang**, agar lab/radiologi siap melayani. | Draft user #3 |
| **US-005** | Sebagai **Petugas Pendaftaran**, saya ingin **membatalkan** registrasi MCU dan order penunjang yang **belum dilayani**, agar kesalahan dapat dikoreksi. | Goal user; BR-005 |
| **US-006** | Sebagai **Petugas Pendaftaran**, saya ingin **mengubah** data/jadwal pendaftaran MCU sebelum dilayani, agar reschedule mudah. | Goal user |
| **US-007** | Sebagai **Petugas Pendaftaran**, saya ingin **nomor & slip antrean MCU** ter-generate dan tercetak otomatis, agar alur antrean konsisten dengan RJ. | BR-003 |
| **US-008** | Sebagai **Petugas Pendaftaran**, saya ingin memilih **dokter & jadwal** MCU dengan info kuota, agar tidak overbooking. | BPMN onsite (Pilih poli & dokter) |
| **US-009** | Sebagai **Admin/Manajemen**, saya ingin **audit log** tambah/batal pendaftaran, agar setiap perubahan dapat ditelusuri. | Pain point logic; BR-007 |
| **US-010** | Sebagai **Petugas Pendaftaran**, saya ingin saat penjamin BPJS dicek keaktifan kartunya, agar tidak salah menerbitkan SEP. | BR-008 `[ASUMSI]` |
| **US-011 `[**]`** | **Phase 2** — Sebagai **Petugas Pendaftaran**, saya ingin peringatan saat BPJS × Klinik MCU, agar klaim tidak ditolak. | BR-010 |
| **US-012 `[**]`** | **Phase 2** — Sebagai **Manajemen**, saya ingin mencatat **Tujuan MCU**, agar pelaporan komposisi MCU tidak manual. | BR-011 |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | Sistem menyediakan tombol **Tambah Pendaftar** pada dashboard Pendaftaran RJ sebagai satu-satunya entry point pendaftaran MCU. | US-001; BR-001 |
| **FR-002** | Sistem menyediakan **pencarian pasien** (kata kunci min 3 char / NIK / No. RM) dan menampilkan kandidat; bila duplikat, sistem meminta konfirmasi RM existing/baru. | US-002; BR-009 |
| **FR-003** | Untuk pasien baru, sistem menyediakan **form data demografis** dengan opsi **bridging Disdukcapil** (mock API) via NIK, lalu **generate No. RM**. | US-001 |
| **FR-004** | Sistem menampilkan **daftar klinik dari master unit** termasuk **Klinik MCU**; pemilihan klinik = poli reguler. | BR-002 |
| **FR-005** | Sistem menyediakan **pemilihan dokter & jadwal** dengan info **kuota** (mock API jadwal/kuota) dan meng-update kuota saat simpan (mock). | US-008 |
| **FR-006** | Sistem menyediakan **pemilihan penjamin** (Umum/BPJS/Asuransi); BPJS → cek keaktifan kartu & penerbitan SEP (mock API). | US-010; BR-008 |
| **FR-007** | Pada **Simpan**, sistem meng-generate **nomor antrean MCU** (Kode Poli + Nomor Urut, auto-increment/hari). | US-007; BR-003 |
| **FR-008** | Pada **Simpan**, bila **paket MCU dipilih**, sistem **auto-generate order pemeriksaan lab & radiologi** dari item paket (mock ambil item dari master paket layanan) dan menampilkannya sebagai **draft** di dashboard pendaftaran penunjang. | US-003; BR-004 |
| **FR-009** | Sistem **meneruskan** data pendaftaran ke **dashboard Pelayanan Klinik MCU** dan **dashboard pendaftaran penunjang** secara otomatis (tanpa refresh manual). | US-004 |
| **FR-010** | Pada **Simpan**, sistem meng-generate **biaya admin pendaftaran** (baru/lama), **mock item tindakan admin**, dan **billing** (mock). | BR-006 |
| **FR-011** | Sistem men-**trigger pengiriman antrian ke MJKN** (mock function) setelah simpan. | BPMN/Antrean |
| **FR-012** | Sistem menyediakan **Cetak slip antrean** (layout RJ). | US-007 |
| **FR-013** | Sistem mengizinkan **Ubah** pendaftaran MCU sebelum dilayani (data pasien, penjamin, dokter, jadwal). | US-006 |
| **FR-014** | Sistem mengizinkan **Batal** pendaftaran MCU sebelum dilayani dan **membatalkan order penunjang yang belum dilayani** + billing terkait (mock). | US-005; BR-005 |
| **FR-015** | Sistem mencatat **audit log** untuk setiap aksi **tambah** & **batal** (user, timestamp, no_rm, klinik, aksi, alasan). | US-009; BR-007 |
| **FR-016** | Dashboard utama RJ menyediakan **pencarian & filter** termasuk filter **Klinik = Klinik MCU** dengan **pagination**. | Goal/Metrik |
| **FR-017 `[**]`** | **Phase 2** — dialog **validasi penjamin × MCU** (BPJS × Klinik MCU). | BR-010 |
| **FR-018 `[**]`** | **Phase 2** — field **Tujuan MCU** (mandatory dropdown + detail) & field **Paket MCU** (mandatory dropdown) dengan **auto-stage** daftar pemeriksaan sebagai draft order penunjang. | BR-011 |
| **FR-019 `[**]`** | **Phase 2** — **Cetak bundle hasil MCU** standar. | Lampiran PRD |

## 11. Data Requirements (Spesifikasi Field)

> Field demografi & penjamin **reuse definisi kanonik dari Pendaftaran RJ (B1)** dan modul terkait — nama, tipe, format, validasi **harus sama**.

### A. Layar INPUT — Pencarian / Identifikasi Pasien (FR-002)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_kunjungan | Jenis Kunjungan | dropdown | Ya | enum: Baru / Lama | manual | kanonik B1 |
| kata_kunci | Cari Pasien | text | Tidak | min 3 char | manual | kanonik B1 |
| nik | NIK | text | Tidak | 16 digit, valid Disdukcapil | manual / integrasi Disdukcapil (mock) | kanonik |
| no_rm | No. RM | text | Tidak | format RM RS | lookup | kanonik; auto-generate bila pasien baru |

### B. Layar INPUT — Data Pasien Baru (FR-003)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nik | NIK | text | Ya | 16 digit, valid Disdukcapil | integrasi Disdukcapil (mock) | bridging |
| no_rm | No. RM | text | Ya | format RM RS, unik | auto-generate | dibuat saat simpan |
| nama | Nama Lengkap | text | Ya | maks 100 char | manual / autofill Disdukcapil | kanonik |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | enum: L / P | manual / Disdukcapil | kanonik |
| tempat_lahir | Tempat Lahir | text | Ya | maks 50 char | manual | kanonik |
| tgl_lahir | Tanggal Lahir | date | Ya | ≤ hari ini | manual / Disdukcapil | kanonik |
| alamat | Alamat | text | Ya | maks 255 char | manual / Disdukcapil | kanonik |
| kode_wilayah | Kode Wilayah | lookup | Tidak | kode Kemendagri (2/4/6/10 digit) | lookup master wilayah | kanonik |
| no_hp | No. HP | text | Tidak | 10–15 digit | manual | kanonik |
| no_bpjs | No. Kartu BPJS | text | Tidak | 13 digit | manual / VClaim (mock) | wajib bila penjamin BPJS |

### C. Layar INPUT — Penjamin & SEP (FR-006)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_penjamin | Penjamin | dropdown | Ya | enum: Umum / BPJS / Asuransi | manual | kanonik |
| no_rujukan_fktp | No. Rujukan FKTP | text | Tidak | format VClaim | manual / VClaim (mock) | bila BPJS |
| status_kartu | Status Kartu BPJS | text/badge | Tidak | aktif/tidak aktif | integrasi VClaim (mock) | read-only hasil cek |
| no_sep | No. SEP | text | Tidak | format SEP | auto / VClaim (mock) | bila terbit |
| nama_asuransi | Nama Asuransi | dropdown/lookup | Tidak | dari master asuransi | lookup (mock API) | bila Asuransi |
| diagnosa_awal | Diagnosa Awal | text | Tidak | — | manual | bila BPJS/indikasi medis |

### D. Layar INPUT — Tujuan Kunjungan MCU (FR-004, FR-005, FR-008)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| unit | Klinik/Unit | dropdown(lookup) | Ya | dari master unit (A3) | lookup A3 | pilih **Klinik MCU**; kanonik |
| dokter_id | Dokter (DPJP) | dropdown(lookup) | Ya | master staf (A2), jenis_tenaga=dokter | lookup A2 | kanonik |
| jadwal_id | Jadwal Praktik | dropdown | Ya | jadwal aktif, kuota > 0 | mock API jadwal | update kuota saat simpan (mock) |
| jenis_layanan | Jenis Layanan | dropdown | Ya | dari master layanan | lookup | mengikuti RJ |
| paket_mcu_id | Paket MCU | dropdown(lookup) | Tidak (P1) / **Ya (P2)** `[**]` | dari Master Paket MCU/Layanan | lookup (mock) | bila dipilih → auto-order penunjang (FR-008); `[PERLU KONFIRMASI]` apakah wajib di Phase 1 |
| tujuan_mcu | Tujuan MCU `[**]` | dropdown | Ya (P2) | enum: Pra-kerja/Periodik Perusahaan/Sekolah/Beasiswa/Asuransi/Haji-Umroh/Visa-Perjalanan/Lain-lain | manual | Phase 2 |
| tujuan_mcu_detail | Detail Tujuan `[**]` | text | Ya bila tujuan=Lain-lain | maks 100 char | manual | Phase 2 |
| skrining_gejala | Skrining Gejala (batuk/demam) | boolean/checklist | Tidak | enum sesuai RJ | manual | mengikuti RJ |

### E. Data TER-GENERATE saat Simpan (FR-007, FR-008, FR-010, FR-011)

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| no_antrean | Nomor Antrean MCU | text | Kode Poli + No. Urut (mis. Q001), auto-increment/klinik/hari | BR-003 |
| order_penunjang[] | Order Lab/Radiologi | list/relasi | dari item paket MCU (mock master paket) | draft ke dashboard penunjang; FR-008 |
| biaya_admin | Biaya Admin Pendaftaran | number (Rp) | auto by jenis_kunjungan (mock) | FR-010 |
| billing_id | Billing | lookup/relasi | auto-generate (mock) | FR-010 |
| status_antrean_mjkn | Status Kirim MJKN | boolean | mock function | FR-011 |

### F. Layar TAMPIL — Dashboard Pendaftaran RJ (filter Klinik MCU) (FR-016)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. Antrean | pendaftaran.no_antrean | text (Q###) | sort | |
| No. RM | pasien.no_rm | text | filter/sort | |
| Nama Pasien | pasien.nama | text | sort A-Z | |
| Klinik | master_unit.nama | text | **filter = Klinik MCU** | otomatis tersedia |
| Dokter | master_staf.nama | text | filter | |
| Penjamin | pendaftaran.jenis_penjamin | badge | filter | |
| Status | pendaftaran.status | badge (Terdaftar/Dilayani/Batal) | filter | |
| Jam Daftar | pendaftaran.created_at | HH:mm | sort (default desc) | |
| Aksi | – | tombol Ubah/Batal/Cetak Slip | – | nonaktif bila sudah dilayani |

### G. Layar TAMPIL — Dashboard Pendaftaran Penunjang (FR-009)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. RM / Nama | pasien | text | filter/sort | |
| Asal | pendaftaran (Klinik MCU) | badge "MCU" | filter | |
| Jenis Penunjang | order_penunjang.jenis | badge (Lab/Radiologi) | filter | |
| Item Pemeriksaan | order_penunjang.item[] | list | – | dari paket MCU |
| Status Order | order_penunjang.status | badge (Draft/Dilayani/Batal) | filter | draft = belum dilayani |
| Jam Order | order_penunjang.created_at | HH:mm | sort | |

> Field `paket_mcu_id`/`tujuan_mcu` & detail status mock yang belum final → `[PERLU KONFIRMASI]`, lihat Open Questions.

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Loading dashboard pendaftaran ≤ **1 detik**. | Draft user |
| **NFR-002** | Performa | Loading **pagination** < 1 detik. | Draft user |
| **NFR-003** | Performa | **Pencarian pasien** < 1 detik. | Draft user |
| **NFR-004** | Performa | **Proses simpan** pendaftaran ≤ 1 detik. | Draft user |
| **NFR-005** | Skalabilitas | Mendukung 30–50 pendaftaran MCU/hari (≈300–400/bulan) tanpa degradasi. | Draft user |
| **NFR-006** | Usability | Tidak perlu training tambahan untuk MCU; alur identik RJ; minimalkan jumlah klik. | Lampiran/pain point UX |
| **NFR-007** | Auditability | Audit log tambah/batal tersimpan & tidak dapat diubah (user, timestamp, pasien, aksi). | BR-007 |
| **NFR-008** | Reliability/Offline | `[ASUMSI]` Pertimbangkan mode sinkronisasi bila internet RS tipe C&D tidak stabil saat memanggil API (mock di MVP). | Domain knowledge |
| **NFR-009** | Konsistensi | Field demografi/penjamin reuse definisi kanonik B1; tidak boleh ada definisi tandingan. | Konteks PRD terkait |
| **NFR-010** | Konfigurabilitas | Kode poli MCU & format antrean dapat diatur per RS via master unit. | Lampiran PRD |
| **NFR-011** | Keamanan | Akses pendaftaran/ubah/batal sesuai role petugas pendaftaran (RBAC). `[ASUMSI]` | Domain |

## 13. Integrasi Eksternal

> Di **MVP (Phase 1)** seluruh integrasi di bawah menggunakan **mock API / mock function** sesuai catatan draft user. Implementasi nyata menyusul (`[PERLU KONFIRMASI]` timeline).

| Integrasi | Fungsi di modul ini | Status MVP | Trace |
|-----------|---------------------|-----------|-------|
| **BPJS (VClaim/SEP)** | Cek keaktifan kartu BPJS; penerbitan SEP; no rujukan FKTP. | **Mock API** | FR-006; draft mock #8 |
| **Disdukcapil (NIK)** | Bridging NIK → autofill demografi pasien baru. | **Mock API** | FR-003; BPMN onsite |
| **Asuransi** | Pemilihan & validasi asuransi (selain BPJS). | **Mock API** | draft mock #7 |
| **Antrean MJKN (Mobile JKN)** | Trigger pengiriman nomor antrian. | **Mock function** | FR-011; draft mock #9 |
| **Jadwal & Kuota Dokter** | Pemilihan jadwal & update kuota dokter. | **Mock API** | FR-005; draft mock #5,#6 |
| **Billing/Kasir** | Generate billing & biaya admin pendaftaran; pembatalan billing saat batal. | **Mock** | FR-010; draft mock #3,#10 |
| **Master Paket Layanan / Master Paket MCU** | Ambil item paket pemeriksaan → auto-generate order penunjang. | **Mock master** | FR-008; draft mock #1,#2 |
| **Modul Pelayanan Lab (B4) & Radiologi (B5)** | Tujuan draft order penunjang dari paket MCU. | Internal | FR-008, FR-009 |
| **Modul Pelayanan Klinik MCU** | Penerusan data pendaftaran otomatis. | Internal | FR-009 |
| **SATUSEHAT** | `[PERLU KONFIRMASI]` Interoperabilitas/encounter MCU — belum dirinci di lampiran untuk Phase 1. | TBD | Konteks integrasi bersama |

**Item mock yang dicatat draft user (rangkuman):** order lab & radiologi auto-generate; paket pemeriksaan MCU dari master; biaya admin baru/lama; item tindakan admin; update kuota dokter; jadwal dokter; pemilihan asuransi; cek keaktifan BPJS; trigger antrean MJKN; pembuatan billing.

## Asumsi
- [ASUMSI] Pola alur identifikasi pasien, cek BPJS, penjamin, duplikat, pemilihan poli/dokter diturunkan dari BPMN g-admisi-onsite-registration karena modul MCU belum memiliki BPMN sendiri.
- [ASUMSI] Pendaftaran MCU yang muncul di 'dashboard pendaftaran penunjang' = order penunjang berstatus draft hasil auto-generate paket; perawat me-review sebelum dilayani.
- [ASUMSI] Audit log juga sebaiknya mencatat aksi 'ubah' meski draft hanya menyebut tambah & batal.
- [ASUMSI] Mode offline/sinkronisasi dipertimbangkan karena keterbatasan jaringan RS tipe C&D, namun di MVP integrasi bersifat mock.
- [ASUMSI] Field jadwal_id, jenis_layanan, skrining_gejala mengikuti definisi pada PRD Pendaftaran RJ (B1) yang belum tercantum eksplisit di konteks kanonik.
- [ASUMSI] Akses fitur dibatasi role Petugas Pendaftaran (RBAC) sesuai praktik SIMRS.

## Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah pemilihan Paket MCU sudah aktif di Phase 1 (opsional) atau sepenuhnya Phase 2? Lampiran PRD menempatkan field Paket MCU sebagai Phase 2 [**], namun draft user meminta auto-order lab/radiologi saat memilih Klinik MCU.
- [PERLU KONFIRMASI] Sumber item paket pemeriksaan: apakah dari Master Paket MCU khusus atau Master Paket Layanan umum? Bagaimana mapping item ke jenis penunjang (Lab vs Radiologi)?
- [PERLU KONFIRMASI] Aturan pembatalan: untuk order penunjang yang SUDAH dilayani, apakah perlu approval khusus / alur reversal terpisah?
- [PERLU KONFIRMASI] Penanganan penjamin BPJS × MCU di Phase 1 (tanpa dialog validasi): apakah dibiarkan seperti v1 atau diberi catatan default? Validasi penuh baru Phase 2.
- [PERLU KONFIRMASI] Apakah modul ini perlu mengirim encounter/observasi ke SATUSEHAT pada Phase 1, atau ditunda?
- [PERLU KONFIRMASI] Timeline penggantian mock API/mock function menjadi integrasi nyata (BPJS, Disdukcapil, MJKN, Billing).
- [PERLU KONFIRMASI] Skema/atribut lengkap audit log (apakah cukup tambah/batal, atau termasuk ubah?). Draft hanya menyebut menambah & membatalkan.