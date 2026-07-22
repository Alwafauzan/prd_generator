# PRD — Panel Riwayat Pasien (Riwayat Kunjungan, Riwayat Rujukan & Penunjang) — Sidenav Asesmen & Konsulan RJ

**Related Document:** Overview Asesmen Keperawatan RJ Awal & Lanjutan; Overview All Asesmen RJ Dokter; PRD Asesmen Keperawatan RJ **[hard dependency]**; PRD Asesmen Dokter RJ **[hard dependency]**; PRD/Modul Konsul & Rujuk Internal (Form Konsulan) **[hard dependency]**; Fitur Riwayat Pemeriksaan Penunjang **[hard dependency]**; Referensi V1 — `staging.pkuwsb.neurovi/pelayanan/...`
**Dokumen ID:** PRD-P-RIW-RJ-v2.0  ·  **Versi:** 2.3 (Draft — pasca-review: Riwayat Rujukan di layar Asesmen)
**Tanggal Disusun:** 3 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Secepatnya (ASAP)

---

## 1. Overview / Brief Summary

Modul ini adalah **panel referensi pasien** di sisi kanan layar pelayanan rawat jalan. Panel menampilkan rekam jejak pasien secara baca-saja — navigasi bagian form, kunjungan sebelumnya, riwayat rujukan/konsul, dan hasil pemeriksaan penunjang — agar tenaga klinis dapat merujuk riwayat tanpa berpindah layar saat mengisi form di sisi kiri.

Panel tampil pada **dua layar** (Asesmen & Konsulan) dengan susunan tab yang sedikit berbeda:
- **Layar Asesmen** (form asesmen perawat/bidan/dokter): Navigasi, Riwayat Rujukan, Riwayat Kunjungan, Lab PK, Patologi Anatomi, Radiologi, Penunjang Lainnya.
- **Layar Konsulan** (form konsulan): Riwayat Rujukan, Riwayat Kunjungan, Lab PK, Patologi Anatomi, Radiologi, Penunjang Lainnya.

**Navigasi** hanya muncul di layar Asesmen (form konsulan tidak membutuhkannya karena isiannya singkat). **Riwayat Rujukan** muncul di **kedua layar** — ini penambahan dari V1 (yang hanya menampilkannya di Konsulan) agar riwayat rujukan mudah dicek dari layar Asesmen bila ada. Tab lain (Riwayat Kunjungan, Lab PK, Patologi Anatomi, Radiologi, Penunjang Lainnya) selalu ada di kedua layar.

Selain menampilkan data, panel menyediakan aksi **salin** yang menyisipkan konten terpilih (hasil Lab PK, Kesimpulan PA, Hasil Radiologi) langsung ke field **"Data Objektif Lainnya"** pada form asesmen aktif, sekaligus menyalinnya ke clipboard.

Untuk **Fase 1 (MVP)**, sasarannya adalah **kesetaraan fungsional dengan V1 (parity)** agar pengembangan dapat menggunakan kembali komponen dan kode yang sudah ada. Riwayat kunjungan dimulai dari encounter **Rawat Jalan**; Rawat Inap dan IGD menyusul sebagai roadmap. Kapabilitas lanjutan — riwayat lintas fasilitas kesehatan via SATUSEHAT dan tren nilai lab antar waktu — ditandai `[**]` sebagai Fase 2.

Konteks operasional: sekitar 80% pasien rawat jalan adalah pasien lama yang kontrol kembali, sehingga panel riwayat ini menjadi acuan utama untuk mempercepat dan menyesuaikan pengisian form.

> Referensi: tampilan V1 (layar Asesmen & Konsulan Klinik Bedah Umum / Klinik Jantung), overview Asesmen RJ, coretan alur Konsul & Rujuk Internal.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: tampilan V1 staging:
- Panel referensi sudah tersedia di sisi kanan layar Asesmen (tab pertama Navigasi) dan layar Konsulan (tab pertama Riwayat Rujukan). Di V1, Riwayat Rujukan hanya muncul di layar Konsulan.
- Riwayat Kunjungan ditampilkan dalam format SOAP, dengan kartu buka/tutup, filter tanggal + unit, tombol Tutup Semua/Buka Semua, dan pagination "Lihat Lebih Banyak".
- Riwayat Rujukan menampilkan episode konsul internal & rujuk internal.
- Lab PK, PA, dan Radiologi menampilkan hasil penunjang; Penunjang Lainnya menampilkan file unggahan.
- Hasil penunjang dapat **disisipkan ke field "Data Objektif Lainnya"** pada form asesmen (Lab PK via pilih parameter → "Salin ke Data Objektif Lainnya"; PA & Radiologi via ikon salin).

**Masalah/pain point** (dari overview, dalam konteks pengisian form):
- **Aspek bisnis proses:** ±80% pasien lama kontrol; keluhan & diagnosa sering serupa kunjungan sebelumnya. Pada konsul/rujuk internal, dokter perlu melihat keterkaitan antar-poli.
- **Aspek UX:** tenaga klinis butuh akses cepat ke riwayat & penunjang, serta cara cepat memindahkan hasil penunjang ke catatan asesmen tanpa mengetik ulang.
- **Aspek logic system:** —

**Dampak utama yang disasar v2:**
- Mempercepat pengisian form dengan riwayat yang mudah dirujuk dan hasil penunjang yang bisa langsung disisipkan · Memperjelas keterkaitan antar-poli pada konsul/rujuk internal · Mendukung keputusan klinis berbasis riwayat lengkap.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = kesetaraan fungsional dengan V1; sumber data internal RS; riwayat kunjungan mulai dari encounter Rawat Jalan. Termasuk Riwayat Rujukan (konsul & rujuk internal) dan penanda keterkaitan, serta satu penambahan dari V1: Riwayat Rujukan kini tampil di layar Asesmen & Konsulan (V1 hanya di Konsulan).
- **Fase 2** = riwayat kunjungan Rawat Inap & IGD, riwayat lintas faskes via SATUSEHAT, tren nilai lab. `[**]`

> Volume rujukan: rawat jalan ±200–400 pasien/hari; ±80% pasien lama.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Tab Navigasi (khusus layar Asesmen)** — daftar bagian form untuk loncat cepat: **Asesmen Perawat** (Skrining TB, Data Subjektif, Data Objektif, Asesmen & Planning) dan **Asesmen Dokter** (Data Subjektif, Data Objektif, Asesmen, Planning), dengan penanda ✓ kelengkapan per grup; klik item meloncat ke bagian terkait.
2. **Tab Riwayat Rujukan (layar Asesmen & Konsulan)** — menampilkan episode **konsul internal** (hierarkis: Poli Induk menaungi Poli Anakan) dan **rujuk internal** (poli setara, dihubungkan penanda keterkaitan). Filter tanggal + unit. Kehadirannya di layar Asesmen adalah penambahan dari V1 (yang hanya menampilkannya di Konsulan) agar riwayat rujukan mudah dicek.
3. **Tab Riwayat Kunjungan** — daftar kartu per kunjungan (Tanggal · Unit · Dokter), format SOAP. Semua kunjungan tampil sebagai **card berdiri sendiri tanpa penanda induk/anakan atau konsul/rujuk**. Kartu buka/tutup; terbaru terbuka default; Tutup Semua/Buka Semua; filter tanggal + unit; pagination. Fase 1 encounter Rawat Jalan (RI & IGD roadmap `[**]`).
4. **Tab Lab PK** — tabel hasil + dropdown tanggal + pencarian jenis pemeriksaan + checkbox multi-pilih → tombol **"Salin ke Data Objektif Lainnya"** (sisip ke form + clipboard).
5. **Tab Patologi Anatomi** — entri per tanggal; Kesimpulan dengan ikon salin (→ Data Objektif Lainnya + clipboard).
6. **Tab Radiologi** — entri per tanggal; Hasil pemeriksaan (narasi) dengan ikon salin (→ Data Objektif Lainnya + clipboard).
7. **Tab Penunjang Lainnya** — menampilkan file unggahan (JPG/PNG/PDF); **image dan PDF sama-sama ditampilkan inline** dalam viewer, dengan navigasi antar-file; empty state bila kosong.
8. **Aksi salin** pada Lab PK, Kesimpulan PA, dan Hasil Radiologi: menyisipkan ke "Data Objektif Lainnya" form asesmen aktif **dan** clipboard.

### Out Scope
- Form Asesmen dan Form Konsulan itu sendiri — diatur pada PRD masing-masing. Panel ini hanya menampilkan (baca-saja) dan menulis ke field "Data Objektif Lainnya".
- Aksi mengubah status DPJP / mengisi jawaban konsulan — itu di Form Konsulan (PRD Konsul & Rujuk Internal).
- Alert SEP BPJS sebelum mengisi — diatur pada PRD Asesmen RJ.
- **[Fase 2] `[**]`** Riwayat kunjungan encounter Rawat Inap & IGD.
- **[Fase 2] `[**]`** Riwayat lintas faskes via SATUSEHAT.
- **[Fase 2] `[**]`** Tren/grafik nilai lab antar waktu.

## 4. Goals and Metrics

### Tujuan
Menyediakan referensi riwayat kunjungan, riwayat rujukan/konsul, dan hasil penunjang yang cepat diakses dari layar Asesmen & Konsulan, serta memungkinkan pemindahan hasil penunjang ke catatan asesmen tanpa mengetik ulang.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Muat awal panel & perpindahan antar-tab | < 1 detik p95 | NFR-001 |
| Buka detail kartu (SOAP / rujukan / hasil penunjang) | < 1 detik p95 | NFR-001 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Asesmen Keperawatan RJ | Host layar Asesmen; menerima sisipan ke "Data Objektif Lainnya"; sumber Navigasi. |
| Asesmen Dokter RJ | Host layar Asesmen; sama seperti di atas. |
| Modul Konsul & Rujuk Internal (Form Konsulan) | Host layar Konsulan; sumber data Riwayat Rujukan (isian konsulan & status DPJP). |
| EMR Kunjungan (RJ, RI, IGD) | Sumber data riwayat kunjungan (SOAP). Fase 1 menarik encounter RJ. |
| Modul Lab PK / Radiologi / Patologi Anatomi | Sumber data hasil penunjang. |
| Fitur Riwayat Pemeriksaan Penunjang | Sumber file unggahan (JPG/PNG/PDF) untuk tab Penunjang Lainnya. |
| Registration / SEP | Konteks pasien (No RM, identitas header). |

Dependency lintas modul: **Master Unit** (filter "Pilih unit"), **Master Staf** (nama dokter pengirim/penerima/pemeriksa), **Master Jenis Pemeriksaan Penunjang** (dropdown Penunjang Lainnya), serta field **"Data Objektif Lainnya"** pada form asesmen (target aksi salin).

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Perawat | Primary | Melihat riwayat & penunjang; menyisipkan hasil ke asesmen keperawatan. |
| Bidan | Primary | Sama seperti perawat, pada pelayanan kebidanan. |
| Dokter | Primary | Melihat riwayat, riwayat rujukan/konsul, & penunjang; menyisipkan hasil; acuan keputusan klinis. |
| Casemix | Secondary | Melihat riwayat untuk koding/klaim. |

> Seluruh persona melihat data secara **baca-saja**. Satu-satunya aksi tulis dari panel adalah menyisipkan konten ke "Data Objektif Lainnya" form asesmen aktif (via aksi salin).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Tenaga klinis membuka layar Asesmen atau Konsulan; panel referensi tampil di kanan dengan tab pertama sesuai layar.
2. Pengguna berpindah tab untuk melihat navigasi/riwayat/rujukan/hasil, memfilter, membuka/menutup kartu, dan menyisipkan hasil penunjang ke "Data Objektif Lainnya".

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Sama dengan As-Is — perilaku dipertahankan setara V1 (parity), dengan riwayat kunjungan dibatasi encounter Rawat Jalan.
2. `[**]` **Fase 2:** riwayat kunjungan RI & IGD; SATUSEHAT; tren nilai lab.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2 — Fase 1) |
|-------|------------|---------------------|
| Perilaku fungsional | Panel 2 layar, salin ke Data Objektif Lainnya | Setara (parity). |
| Ketersediaan tab Riwayat Rujukan | Hanya di layar Konsulan | Ditampilkan di layar Asesmen **dan** Konsulan (penambahan v2). |
| Cakupan encounter riwayat kunjungan | RJ + RI (tercampur) | Fase 1: RJ saja; RI & IGD menyusul `[**]`. |
| Sumber data | Internal RS | Setara. SATUSEHAT ditunda ke Fase 2 `[**]`. |

## 7. Main Flow / Mindmap

### Skenario 1 — Navigasi form (layar Asesmen)
1. Pengguna membuka layar Asesmen → panel tampil pada tab **Navigasi** → menekan bagian form → form meloncat ke bagian tersebut; grup lengkap ditandai ✓.

### Skenario 2 — Riwayat rujukan/konsul (layar Asesmen & Konsulan)
1. Pengguna membuka tab **Riwayat Rujukan** (tersedia di layar Asesmen maupun Konsulan; di Konsulan menjadi tab pertama).
2. **Konsul internal:** card Poli Induk (wrap-up asesmen) menaungi card Poli Anakan (wrap-up konsulan).
3. **Rujuk internal:** poli asal & tujuan tampil setara, dihubungkan penanda keterkaitan.

### Skenario 3 — Melihat riwayat kunjungan
1. Tab **Riwayat Kunjungan** → semua kunjungan tampil sebagai card berdiri sendiri (tanpa penanda induk/anakan) → baca SOAP, buka/tutup, filter, "Lihat Lebih Banyak".

### Skenario 4 — Melihat & menyisipkan hasil penunjang
1. **Lab PK** → cari parameter → centang beberapa → "N data dipilih" → **"Salin ke Data Objektif Lainnya"** (sisip + clipboard).
2. **PA / Radiologi** → buka entri → ikon salin pada Kesimpulan/Hasil → sisip ke Data Objektif Lainnya + clipboard.
3. **Penunjang Lainnya** → lihat file (image/PDF inline) → navigasi antar-file.

### Skenario 5 — Tidak ada data
1. Tab tanpa data pada filter aktif → empty state "Tidak ada riwayat yang ditemukan".

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Panel menampilkan data secara baca-saja. Satu-satunya aksi tulis adalah menyisipkan konten terpilih ke field "Data Objektif Lainnya" pada form asesmen aktif (via aksi salin); panel tidak mengubah data sumber. | FR-001; NFR-003 |
| **BR-002** | Susunan tab berbeda per layar. **Navigasi** hanya muncul di layar Asesmen (form konsulan tidak membutuhkannya karena isian singkat). **Riwayat Rujukan** muncul di **kedua layar** (Asesmen & Konsulan) — penambahan dari V1 yang hanya menampilkannya di Konsulan; di Konsulan menjadi tab pertama. Tab lain (Riwayat Kunjungan, Lab PK, PA, Radiologi, Penunjang Lainnya) tampil di kedua layar. | FR-001; FR-002; FR-003 |
| **BR-003** | Riwayat kunjungan ditarik berdasarkan No RM. Fase 1 mencakup encounter Rawat Jalan; RI & IGD menyusul (roadmap). | FR-004 |
| **BR-004** | Tab Riwayat Kunjungan menampilkan seluruh kunjungan sebagai **card berdiri sendiri tanpa penanda** induk/anakan atau konsul/rujuk; keterkaitan rujukan hanya ditampilkan di Riwayat Rujukan. | FR-004; BR-017 |
| **BR-005** | Daftar kunjungan/rujukan/penunjang diurutkan dari terbaru ke terlama. | FR-004 |
| **BR-006** | Kartu kunjungan terbaru terbuka secara default; kartu lain tertutup. | FR-004 |
| **BR-007** | Tombol Tutup Semua/Buka Semua men-toggle status seluruh kartu; label menyesuaikan status. | FR-006 |
| **BR-008** | Filter tanggal + unit berlaku pada Riwayat Rujukan, Riwayat Kunjungan, PA, Radiologi, dan Penunjang Lainnya. Tab **Lab PK** memakai **pencarian jenis pemeriksaan + dropdown tanggal** (tanpa filter unit), sesuai V1. | FR-005; FR-010 |
| **BR-009** | Pagination "Lihat Lebih Banyak" memuat batch kunjungan berikutnya di Riwayat Kunjungan. | FR-007 |
| **BR-010** | Bagian Objektif menampilkan TTV: TD, Suhu, Nadi, RR, Saturasi, TB, BB, GDS (kosong bila tidak diisi). | FR-008 |
| **BR-011** | Bagian Asesmen menampilkan diagnosa beserta kode ICD-10. | FR-009 |
| **BR-012** | Bagian Planning menampilkan Tindakan beserta kode ICD-9 serta rencana tindakan/terapi. | FR-009 |
| **BR-013** | Aksi salin pada **Kesimpulan PA** dan **Hasil Radiologi** (a) menyisipkan teks ke field "Data Objektif Lainnya" form asesmen aktif dan (b) menyalinnya ke clipboard. | FR-011; FR-012 |
| **BR-014** | Tab Lab PK menampilkan nilai per parameter pada kolom tanggal terpilih (dropdown tanggal); pencarian memfilter jenis pemeriksaan. | FR-010 |
| **BR-015** | Checkbox Lab PK memilih beberapa parameter. Saat ≥1 terpilih, muncul info **"N data dipilih"** + tombol **"Salin ke Data Objektif Lainnya"** yang menyisipkan parameter + nilai terpilih ke "Data Objektif Lainnya" (dan clipboard). | FR-010 |
| **BR-016** | Tab Navigasi (hanya layar Asesmen) menampilkan bagian form — **Asesmen Perawat:** Skrining TB, Data Subjektif, Data Objektif, Asesmen & Planning; **Asesmen Dokter:** Data Subjektif, Data Objektif, Asesmen, Planning — dengan penanda ✓ kelengkapan per grup; klik item meloncat ke bagian terkait. | FR-002 |
| **BR-017** | Tab Riwayat Rujukan menampilkan episode **konsul internal** (hierarkis induk→anakan) dan **rujuk internal** (poli setara). | FR-003 |
| **BR-018** | **Konsul internal:** Poli Induk (asal) ditampilkan sebagai wrap-up form asesmen (isi sama dengan card-nya di Riwayat Kunjungan), menaungi Poli Anakan (tujuan) berupa wrap-up form konsulan — badge "Konsultasi"; Dokter (pengirim → penerima); Diagnosa; Jawaban dokter konsulan; Tindakan yang diberikan; Hasil pemeriksaan laboratorium; Hasil pemeriksaan elektro medis; Hasil pemeriksaan radiologi. | FR-003 |
| **BR-019** | **Rujuk internal:** poli asal & poli tujuan ditampilkan **setara** (masing-masing wrap-up form asesmen), dihubungkan **penanda keterkaitan** (garis penghubung). | FR-003 |
| **BR-020** | Status DPJP diambil dari "Update Status DPJP" pada form konsulan: **konsul internal** → DPJP tetap di poli asal; **rujuk internal** → DPJP pindah ke poli tujuan. | FR-003 |
| **BR-021** | Tab Penunjang Lainnya menampilkan file unggahan (JPG/PNG/PDF) dari fitur Riwayat Pemeriksaan Penunjang. **Image dan PDF sama-sama ditampilkan inline** dalam viewer, dengan navigasi antar-file; bila file gagal dimuat, sediakan tautan unduh. Tiap entri: Jenis Pemeriksaan (dari master), file, Keterangan. | FR-013 |
| **BR-022 `[**]`** | **Fase 2:** riwayat kunjungan ditarik lintas faskes via SATUSEHAT; ditambah encounter RI & IGD. | FR-015 |
| **BR-023 `[**]`** | **Fase 2:** nilai lab ditampilkan sebagai tren antar waktu. | FR-016 |

## 9. Display Rules — Struktur Tampilan per Tab

> Header pasien (No RM, Nama, Tanggal Lahir/Usia, TB, BB) berada di atas layar dan digunakan bersama (reuse dari modul asesmen/registration). Target aksi salin = field **"Data Objektif Lainnya"** pada bagian DATA OBJEKTIF form asesmen.

### 9.1 Navigasi (khusus layar Asesmen)
- **Grup:** "Asesmen Perawat" (✓ bila lengkap) → Skrining TB, Data Subjektif, Data Objektif, Asesmen & Planning. "Asesmen Dokter" (✓ bila lengkap) → Data Subjektif, Data Objektif, Asesmen, Planning.
- **Aksi:** klik item → form di sisi kiri meloncat/scroll ke bagian terkait.

### 9.2 Riwayat Rujukan (layar Asesmen & Konsulan)
- **Kontrol atas:** input tanggal (DD/MM/YYYY) + dropdown "Pilih unit".
- **Konsul internal (hierarkis):**
  - Card **Poli Induk** (asal) = wrap-up form asesmen (isi sama dengan card di Riwayat Kunjungan) — menaungi:
  - Card **Poli Anakan** (tujuan) = wrap-up form konsulan: badge "Konsultasi"; header `tanggal, jam WIB • unit`; Dokter (pengirim → penerima); Diagnosa; Jawaban dokter konsulan; Tindakan yang diberikan; Hasil pemeriksaan laboratorium; Hasil pemeriksaan elektro medis; Hasil pemeriksaan radiologi.
- **Rujuk internal (setara):**
  - Poli asal & poli tujuan ditampilkan **setara** (masing-masing wrap-up form asesmen), dihubungkan **penanda keterkaitan** (garis penghubung).
- **DPJP:** konsul internal → tetap di poli asal; rujuk internal → pindah ke poli tujuan.

### 9.3 Riwayat Kunjungan
- **Kontrol atas:** input tanggal, dropdown "Pilih unit", tombol Tutup Semua/Buka Semua.
- **Kartu (header):** `Tanggal • Unit • Dokter`, dengan chevron buka/tutup. Semua kunjungan = card berdiri sendiri, tanpa penanda induk/anakan/konsul/rujuk.
- **Kartu (isi):** Subjektif (keluhan) · Objektif (TTV: TD, Suhu, Nadi, RR, Saturasi, TB, BB, GDS) · Asesmen (diagnosa + ICD-10) · Planning (Tindakan + ICD-9, rencana tindakan/terapi).
- **Footer:** "Lihat Lebih Banyak".

### 9.4 Lab PK
- **Kontrol atas:** pencarian "Cari jenis pemeriksaan…".
- **Tabel:** kolom Jenis Pemeriksaan + kolom nilai per tanggal (header tanggal dengan dropdown). Tiap baris: checkbox + parameter + nilai.
- **Pilih & salin:** ≥1 parameter dicentang → panel "N data dipilih" + tombol "Salin ke Data Objektif Lainnya" → sisip parameter + nilai ke Data Objektif Lainnya (dan clipboard).

### 9.5 Patologi Anatomi
- **Kontrol atas:** input tanggal + dropdown "Pilih unit".
- **Pengelompokan:** per tanggal; entri dengan timestamp + sumber.
- **Isi entri:** Dokter pengirim, Dokter penerima, Diagnosa, Jenis pemeriksaan, Mikroskopik, Makroskopik, **Kesimpulan** (ikon salin → Data Objektif Lainnya + clipboard), Saran.

### 9.6 Radiologi
- **Kontrol atas:** input tanggal + dropdown "Pilih unit".
- **Pengelompokan:** per tanggal; entri dengan timestamp + sumber.
- **Isi entri:** Dokter pengirim, Dokter penerima, Diagnosa (kode ICD), Jenis pemeriksaan, **Hasil pemeriksaan** (narasi, ikon salin → Data Objektif Lainnya + clipboard).

### 9.7 Penunjang Lainnya
- **Kontrol atas:** input tanggal + dropdown "Pilih unit".
- **Pengelompokan:** per tanggal; tiap entri: header `tanggal, jam WIB • dokter`, dropdown **Jenis Pemeriksaan** (dari master, mis. usg/mri/ekg), **viewer file**, dan **Keterangan**.
- **File hasil unggahan:** JPG/PNG dan **PDF sama-sama ditampilkan inline** dalam viewer (PDF memakai viewer berkontrol halaman/zoom/rotate/unduh/cetak); navigasi antar-file `‹ nama-file (n/total) ›`.
- **Fallback:** bila file gagal dimuat / tipe tak didukung, sediakan tautan unduh.
- **Empty state:** "Tidak ada riwayat yang ditemukan" bila kosong.

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Render panel referensi** di sisi kanan layar Asesmen & Konsulan. Navigasi hanya di Asesmen; Riwayat Rujukan di kedua layar (di Konsulan sebagai tab pertama); Riwayat Kunjungan, Lab PK, PA, Radiologi, Penunjang Lainnya di kedua layar. | US-001; US-002; BR-001; BR-002 |
| **FR-002** | **Tab Navigasi** (layar Asesmen) — tampilkan bagian form dengan ✓ kelengkapan; klik meloncat ke bagian terkait. | US-003; BR-016 |
| **FR-003** | **Tab Riwayat Rujukan** (layar Asesmen & Konsulan) — tampilkan konsul internal (hierarkis induk→anakan; anakan = wrap-up konsulan) & rujuk internal (poli setara + penanda keterkaitan); tampilkan status DPJP. | US-009; BR-017; BR-018; BR-019; BR-020 |
| **FR-004** | **Tab Riwayat Kunjungan** — daftar kartu SOAP berdiri sendiri (tanpa penanda), buka/tutup, terbaru default, urut terbaru→terlama; Fase 1 encounter RJ. | US-001; BR-003; BR-004; BR-005; BR-006 |
| **FR-005** | **Filter riwayat** — input tanggal + dropdown "Pilih unit" pada tab yang mendukung. | US-004; BR-008 |
| **FR-006** | **Tutup Semua / Buka Semua** — men-toggle status seluruh kartu; label menyesuaikan. | US-001; BR-007 |
| **FR-007** | **Pagination** — "Lihat Lebih Banyak" memuat batch berikutnya. | US-001; BR-009 |
| **FR-008** | **Tampilan Objektif** — TTV lengkap per kunjungan. | US-001; BR-010 |
| **FR-009** | **Tampilan Asesmen & Planning** — diagnosa + ICD-10; Tindakan + ICD-9 & rencana tindakan/terapi. | US-001; BR-011; BR-012 |
| **FR-010** | **Tab Lab PK** — tabel parameter × nilai, dropdown tanggal, pencarian, checkbox multi-pilih → "N data dipilih" + "Salin ke Data Objektif Lainnya" (sisip + clipboard). | US-005; BR-014; BR-015 |
| **FR-011** | **Tab Patologi Anatomi** — entri per tanggal; Kesimpulan salin (→ Data Objektif Lainnya + clipboard). | US-006; BR-013 |
| **FR-012** | **Tab Radiologi** — entri per tanggal; Hasil pemeriksaan salin (→ Data Objektif Lainnya + clipboard). | US-006; BR-013 |
| **FR-013** | **Tab Penunjang Lainnya** — tampilkan file unggahan (JPG/PNG/PDF) inline dalam viewer, navigasi antar-file, fallback unduh; Jenis Pemeriksaan (master) + Keterangan. | US-007; BR-021 |
| **FR-014** | **Empty state** — tiap tab menampilkan "Tidak ada riwayat yang ditemukan" bila tidak ada data pada filter aktif. | US-008 |
| **FR-015 `[**]`** | **Fase 2** — riwayat lintas faskes via SATUSEHAT; tambahkan encounter RI & IGD. | BR-022 |
| **FR-016 `[**]`** | **Fase 2** — tren nilai lab antar waktu. | BR-023 |

## 11. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **perawat/bidan**, saya ingin **melihat riwayat kunjungan pasien di panel samping**, sehingga **saya menyesuaikan isian tanpa berpindah layar**. | 1) Given tab Riwayat Kunjungan, When dibuka, Then card tampil urut terbaru & terbaru terbuka (BR-005, BR-006). 2) When "Lihat Lebih Banyak" ditekan, Then batch berikutnya dimuat (BR-009). | FR-004; FR-007 |
| **US-002** | Sebagai **dokter**, saya ingin **melihat riwayat kunjungan & hasil penunjang**, sehingga **keputusan klinis berbasis riwayat lengkap**. | 1) Given panel tampil, When berpindah tab, Then data tampil < 1 detik p95 (NFR-001). | FR-001; FR-008; FR-009 |
| **US-003** | Sebagai **tenaga klinis**, saya ingin **loncat cepat antar bagian form dari Navigasi**, sehingga **efisien mengisi asesmen & tahu bagian yang lengkap**. | 1) Given tab Navigasi (layar Asesmen), When menekan bagian, Then form meloncat ke bagian itu; grup lengkap ditandai ✓ (BR-016). | FR-002 |
| **US-004** | Sebagai **tenaga klinis**, saya ingin **menyaring riwayat berdasarkan tanggal & unit**, sehingga **cepat menemukan yang relevan**. | 1) Given tab yang mendukung, When mengisi tanggal/unit, Then daftar tersaring (BR-008). | FR-005 |
| **US-005** | Sebagai **tenaga klinis**, saya ingin **memilih beberapa hasil Lab PK dan menyalinnya ke Data Objektif Lainnya**, sehingga **tidak mengetik ulang nilai lab**. | 1) Given tab Lab PK, When mencentang beberapa parameter, Then muncul "N data dipilih" + tombol Salin (BR-015). 2) When "Salin ke Data Objektif Lainnya" ditekan, Then parameter + nilai tersisip ke field & clipboard (BR-015, BR-013). | FR-010 |
| **US-006** | Sebagai **tenaga klinis**, saya ingin **menyalin Kesimpulan PA / Hasil Radiologi ke Data Objektif Lainnya**, sehingga **hasil penunjang langsung masuk catatan asesmen**. | 1) Given entri PA/Radiologi, When menekan ikon salin, Then teks tersisip ke Data Objektif Lainnya & clipboard (BR-013). | FR-011; FR-012 |
| **US-007** | Sebagai **tenaga klinis**, saya ingin **melihat file hasil penunjang lainnya (image & PDF) langsung di panel**, sehingga **saya tidak perlu mengunduh untuk membacanya**. | 1) Given tab Penunjang Lainnya ada file, When entri dibuka, Then image/PDF tampil inline dengan navigasi antar-file (BR-021). 2) Given file gagal dimuat, Then tersedia tautan unduh (BR-021). | FR-013 |
| **US-008** | Sebagai **tenaga klinis**, saya ingin **penanda jelas saat data kosong**, sehingga **saya tahu tidak ada riwayat, bukan sistem gagal**. | 1) Given tidak ada data pada tab/filter, When dibuka, Then tampil "Tidak ada riwayat yang ditemukan" (FR-014). | FR-014 |
| **US-009** | Sebagai **dokter (poli asal/tujuan)**, saya ingin **melihat riwayat konsul & rujuk internal beserta keterkaitannya**, sehingga **saya memahami konteks rujukan pasien**. | 1) Given konsul internal, When tab Riwayat Rujukan dibuka, Then Poli Induk menaungi Poli Anakan (anakan = wrap-up konsulan) (BR-018). 2) Given rujuk internal, Then poli asal & tujuan tampil setara dengan penanda keterkaitan (BR-019). | FR-003 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi header **reuse definisi kanonik dari Registration/Asesmen RJ**. Seluruh tabel bersifat **tampilan (read-only)**; aksi salin menulis ke "Data Objektif Lainnya" form asesmen.

### A. Layar TAMPIL — Kartu Riwayat Kunjungan (FR-004)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal · Unit · Dokter | EMR / Master Unit / Master Staf | header kartu | Filter tanggal/unit · Sort terbaru→terlama | Card berdiri sendiri, tanpa penanda. |
| Subjektif | EMR (Subjektif) | text | — | Keluhan. |
| Objektif — TTV | EMR (Objektif) | `TD /  mmHg · Suhu °C · Nadi x/menit · RR x/menit · Saturasi % · TB cm · BB kg · GDS mg/dL` | — | BR-010. |
| Asesmen | EMR (Asesmen) | daftar `Diagnosa (ICD-10)` | — | BR-011. |
| Planning | EMR (Planning) | daftar `Tindakan (ICD-9)` + rencana | — | BR-012. |

### B. Layar TAMPIL — Riwayat Rujukan (FR-003)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Header | EMR / Form Konsulan | `tanggal, jam WIB • unit` + badge (Konsultasi) | Filter tanggal/unit | — |
| (Konsul) Poli Induk | EMR asesmen | wrap-up asesmen (SOAP) | hierarkis | Sama dengan card Riwayat Kunjungan. |
| (Konsul) Poli Anakan | Form Konsulan | Dokter (pengirim → penerima), Diagnosa, Jawaban dokter konsulan, Tindakan yang diberikan, Hasil lab / elektro medis / radiologi | nested di bawah induk | Wrap-up form konsulan. |
| (Rujuk) Poli asal & tujuan | EMR asesmen | wrap-up asesmen, ditampilkan setara | penanda keterkaitan | Tidak hierarkis. |
| Status DPJP | Form Konsulan | text | — | Konsul: tetap poli asal; Rujuk: pindah poli tujuan (BR-020). |

### C. Layar TAMPIL — Tabel Lab PK (FR-010)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| (pilih) | — | checkbox | — | Multi-pilih → "N data dipilih" + tombol Salin. |
| Jenis Pemeriksaan | Modul Lab PK | text | Pencarian | — |
| Nilai | Modul Lab PK | numerik/text | Kolom per tanggal (dropdown) | — |

### D. Layar TAMPIL — Entri Patologi Anatomi (FR-011)
| Kolom | Sumber Data | Format Tampilan | Catatan |
|-------|-------------|-----------------|---------|
| Tanggal & sumber | Modul PA | `DD MMMM YYYY, HH:mm WIB • Sumber` | Grup per tanggal; filter tanggal/unit. |
| Dokter pengirim / penerima · Diagnosa · Jenis pemeriksaan · Mikroskopik · Makroskopik · Saran | Modul PA | text | — |
| Kesimpulan | Modul PA | text + ikon salin | Salin → Data Objektif Lainnya + clipboard (BR-013). |

### E. Layar TAMPIL — Entri Radiologi (FR-012)
| Kolom | Sumber Data | Format Tampilan | Catatan |
|-------|-------------|-----------------|---------|
| Tanggal & sumber | Modul Radiologi | `DD MMMM YYYY, HH:mm WIB • Sumber` | Grup per tanggal; filter tanggal/unit. |
| Dokter pengirim / penerima · Diagnosa (ICD) · Jenis pemeriksaan | Modul Radiologi | text | Pengirim bisa kosong (sesuai V1). |
| Hasil pemeriksaan | Modul Radiologi | narasi + ikon salin | Salin → Data Objektif Lainnya + clipboard (BR-013). |

### F. Layar TAMPIL — Entri Penunjang Lainnya (FR-013)
| Kolom | Sumber Data | Format Tampilan | Catatan |
|-------|-------------|-----------------|---------|
| Tanggal & dokter | Riwayat Pemeriksaan Penunjang | `DD MMM YYYY, HH:mm WIB • Dokter` | Grup per tanggal; filter tanggal/unit. |
| Jenis Pemeriksaan | Master Jenis Pemeriksaan | dropdown/text | Mis. usg, mri, ekg. |
| File | Riwayat Pemeriksaan Penunjang | viewer inline (image & PDF), navigasi antar-file | JPG/PNG/PDF; fallback unduh (BR-021). |
| Keterangan | Riwayat Pemeriksaan Penunjang | text | — |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Muat awal panel, perpindahan antar-tab, dan buka detail kartu ≤ 1 detik p95. | Metrik |
| **NFR-002** | Skalabilitas | Detail SOAP/rujukan/hasil dimuat saat kartu dibuka (lazy-load); daftar ringkas dimuat lebih dulu + pagination. File penunjang dimuat saat entri dibuka. | FR-004; FR-007; FR-013 |
| **NFR-003** | Keamanan/RBAC | Panel baca-saja atas data sumber bagi perawat, bidan, dokter, casemix; aksi salin hanya menulis ke "Data Objektif Lainnya" form asesmen aktif. | BR-001 |
| **NFR-004** | Konsistensi | Struktur SOAP, rujukan, dan hasil penunjang konsisten dengan modul sumber. | Domain knowledge |
| **NFR-005** | Usability | Kartu terbaru terbuka default; buka/tutup, Tutup/Buka Semua, aksi salin, dan navigasi file responsif. | BR-006; BR-007; BR-013; BR-021 |
| **NFR-006** | Keandalan | Bila modul sumber / file tidak tersedia, panel menampilkan empty/error/fallback unduh tanpa memblok pengisian form. | FR-014; BR-021 |

## 14. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **EMR Kunjungan (RJ, RI, IGD)** | Sumber data riwayat kunjungan (SOAP). Fase 1 = RJ. | Internal | FR-004 |
| **Modul Konsul & Rujuk Internal (Form Konsulan)** | Sumber data Riwayat Rujukan & status DPJP. | Internal | FR-003 |
| **Modul Lab PK / Radiologi / Patologi Anatomi** | Sumber data hasil penunjang. | Internal | FR-010; FR-011; FR-012 |
| **Fitur Riwayat Pemeriksaan Penunjang** | Sumber file unggahan Penunjang Lainnya. | Internal | FR-013 |
| **Master Unit / Master Staf / Master Jenis Pemeriksaan** | Filter unit, nama dokter, jenis pemeriksaan penunjang. | Internal | FR-005; FR-013 |
| **SATUSEHAT** `[**]` | Fase 2 — riwayat lintas faskes. | Belum aktif | FR-015 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD Asesmen RJ (field "Data Objektif Lainnya" & definisi bagian form untuk Navigasi) | Hard | Panel tak punya konteks tampil / target salin / navigasi. |
| Modul Konsul & Rujuk Internal (Form Konsulan) | Hard | Tab Riwayat Rujukan tak ada data & layar Konsulan tak ada. |
| Fitur Riwayat Pemeriksaan Penunjang | Hard | Tab Penunjang Lainnya tak ada file. |
| Master Unit / Master Staf / Master Jenis Pemeriksaan | Hard | Filter unit / nama dokter / jenis pemeriksaan tak tampil. |
| Modul penunjang (Lab/PA/Radiologi) | Hard | Tab terkait tak menampilkan data (empty state). |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Fungsi checkbox + dropdown tanggal Lab PK | Checkbox multi-pilih; ≥1 terpilih → "N data dipilih" + "Salin ke Data Objektif Lainnya" (sisip + clipboard). Dropdown memilih kolom tanggal hasil (BR-014, BR-015). |
| D-02 | Cakupan tab Navigasi | Dispesifikasikan di PRD ini; bagian form + ✓ + loncat; **hanya layar Asesmen** (BR-016). |
| D-03 | Cakupan encounter riwayat kunjungan | Target RJ + RI + IGD; **Fase 1 mulai dari RJ** (BR-003). |
| D-04 | Target release | Secepatnya (ASAP). |
| D-05 | Target performa | < 1 detik p95 berlaku untuk panel (NFR-001). |
| D-06 | Perilaku aksi salin | Menyisipkan ke "Data Objektif Lainnya" form asesmen aktif **dan** clipboard (BR-013, BR-015). |
| D-07 | Ketersediaan filter per tab | Riwayat Rujukan/Kunjungan/PA/Radiologi/Penunjang Lainnya = tanggal + unit; Lab PK = pencarian + dropdown tanggal (BR-008). |
| D-08 | Penunjang Lainnya — tampilan file | **Image dan PDF sama-sama ditampilkan inline** dalam viewer (bukan chip/dialog), navigasi antar-file, fallback unduh; sumber dari fitur Riwayat Pemeriksaan Penunjang; jenis pemeriksaan dari master (BR-021). |
| D-09 | Riwayat Rujukan vs Riwayat Kunjungan | Riwayat Rujukan tetap **tab tersendiri**; Riwayat Kunjungan **datar** (semua card berdiri sendiri, tanpa penanda). Relasi hanya di Riwayat Rujukan (BR-004, BR-017). |
| D-10 | Bentuk tampilan konsul vs rujuk | Konsul internal **hierarkis** (induk→anakan, anakan = wrap-up konsulan); rujuk internal **setara**, dihubungkan penanda keterkaitan (BR-018, BR-019). |
| D-11 | Semantik DPJP | Konsul internal → DPJP tetap poli asal; rujuk internal → DPJP pindah poli tujuan (BR-020). |
| D-12 | Susunan tab per layar | Navigasi hanya di layar Asesmen (isian konsulan singkat); tab lain (termasuk Riwayat Rujukan) tampil di kedua layar (BR-002). |
| D-13 | Fase penanda keterkaitan | Riwayat Rujukan + penanda keterkaitan rujuk internal → **Fase 1**. |
| D-14 | Riwayat Rujukan di layar Asesmen | **Penambahan dari V1** (yang hanya menampilkannya di Konsulan): Riwayat Rujukan kini tampil juga di layar Asesmen agar riwayat rujukan mudah dicek. Termasuk Fase 1 (BR-002, BR-017). |

## 16. Asumsi
- Seluruh asumsi awal telah dikonfirmasi Product Owner dan diangkat menjadi Business Rules / Keputusan Desain. Penyesuaian yang tercatat: (a) "salin = clipboard" diperluas menjadi "salin = sisip ke Data Objektif Lainnya + clipboard"; (b) Penunjang Lainnya PDF disamakan dengan image (inline viewer), bukan chip/dialog; (c) Riwayat Rujukan ditampilkan di layar Asesmen & Konsulan (bukan hanya Konsulan seperti V1).

## 17. Pertanyaan Terbuka
- `[PERLU KONFIRMASI]` Format teks yang disisipkan ke "Data Objektif Lainnya" untuk pilihan Lab PK (mis. `Nama: Nilai` per baris) dan apakah menimpa atau menambah (append) isi field.
- `[PERLU KONFIRMASI]` Field tujuan salin untuk Hasil Radiologi — diasumsikan "Data Objektif Lainnya" (mengikuti pola PA); mohon dipastikan.
- `[PERLU KONFIRMASI]` Rendering persis **penanda keterkaitan** rujuk internal (garis penghubung / badge) — target Fase 1, detail desain menyusul dari tim desain.

## 18. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 2.0 | 1 Juli 2026 | Team Product | Draft awal — konversi dari V1 (parity). |
| 2.1 | 1 Juli 2026 | Team Product | Aksi salin = sisip ke "Data Objektif Lainnya" + clipboard (Fase 1); Navigasi masuk lingkup; encounter Fase 1 = RJ; target ASAP & performa panel; Lab PK multi-pilih (BR-015); section Keputusan Desain. |
| 2.2 | 3 Juli 2026 | Team Product | Tambah **tab Riwayat Rujukan** (konsul internal hierarkis induk→anakan; rujuk internal setara + penanda keterkaitan; semantik DPJP); panel **dua layar** dengan **tab pertama kontekstual** (Navigasi @Asesmen, Riwayat Rujukan @Konsulan); penegasan Riwayat Kunjungan datar tanpa penanda; **Penunjang Lainnya** menampilkan file unggahan (image & PDF inline, navigasi, fallback unduh) dari fitur Riwayat Pemeriksaan Penunjang; tambah dependency Form Konsulan, Riwayat Pemeriksaan Penunjang, Master Jenis Pemeriksaan; Keputusan Desain D-08–D-13. |
| 2.3 | 3 Juli 2026 | Team Product | Pasca-review PO: **tab Riwayat Rujukan kini tampil di layar Asesmen & Konsulan** (penambahan dari V1 yang hanya di Konsulan) agar riwayat rujukan mudah dicek; Navigasi tetap hanya di Asesmen. Propagasi ke Overview, Background, In Scope, Business Process, Main Flow, BR-002, Display Rules 9.2, FR-001/FR-003; tambah D-14; asumsi & pertanyaan terbuka terkait ditutup. |
