# PRD — Asesmen Rawat Jalan (Keperawatan & Dokter)

**Related Document:** **PRD Dashboard Pelayanan Rawat Jalan (hard dependency — entry point & event source checkpoint As. Perawat/As. Dokter)**; PRD Pendaftaran Rawat Jalan (sumber pasien, episode kunjungan, penjamin); **PRD Konsul Internal vs Rujuk Internal / Form Konsulan (hard dependency untuk alur rujukan internal)**; Master Data Diagnosa & Tindakan Keperawatan (SDKI/SIKI); Master Data Diagnosa (ICD-10); Master Data Tindakan/Procedure (ICD-9); Integrasi BPJS VClaim (SEP); BPMN D6 — EMR RJ (Asesmen Perawat & Dokter RJ); Referensi field: `Asesmen_Rawat_Jalan.xlsx`
**Dokumen ID:** PRD-P-EMR-RJ-ASM-v1.0 `[PERLU KONFIRMASI kode final]`  ·  **Versi:** 1.0 (Draft awal — konversi format generator)
**Tanggal Disusun:** 29 Juni 2026 (draft awal); dikonversi 1 Juli 2026 · **Penyusun:** Team Product — Tamtech International · **PIC:** Fafa (Product Owner)
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Q3 2026 — Fase 01 (Patient Entry & EMR Foundation)

## 1. Overview / Brief Summary

**Asesmen Rawat Jalan** adalah modul EMR tempat tenaga kesehatan mendokumentasikan hasil pengkajian kondisi pasien selama pelayanan rawat jalan secara terstruktur dan terintegrasi. Modul ini menaungi **dua asesmen yang saling terhubung dalam satu alur pelayanan** — Asesmen Keperawatan (perawat/bidan) dan Asesmen Dokter — dengan pembatasan akses berbasis Role-Based Access Control (RBAC) sehingga tiap pengguna hanya dapat mengakses dan mengubah data sesuai kewenangannya.

Proses dimulai setelah pasien terdaftar di pelayanan rawat jalan. Sebelum form asesmen dibuka, sistem melakukan validasi administrasi (mis. peringatan bila pasien BPJS belum memiliki SEP) tanpa menghalangi pelayanan klinis. Pengguna lalu memilih **Asesmen Awal** atau **Asesmen Lanjutan** sesuai kondisi klinis pada kunjungan tersebut. Pada Asesmen Awal, sistem menampilkan form baru tanpa mengambil data kunjungan sebelumnya; pada Asesmen Lanjutan, sistem menampilkan data asesmen kunjungan sebelumnya dari poliklinik yang sama sebagai autofill. Mengingat sekitar 80% pasien rawat jalan adalah pasien kontrol, **autofill dari riwayat kunjungan menjadi komponen utama efisiensi** modul ini.

Asesmen keperawatan menjadi tahap pertama: perawat/bidan mengisi Skrining TB, data subjektif, data objektif, pemeriksaan/penilaian, hingga asesmen & planning keperawatan. Sistem memastikan Skrining TB tersimpan sebelum asesmen keperawatan dapat disimpan. Setelah asesmen keperawatan selesai, data tertentu (anamnesis/keluhan utama dan TTV) diteruskan otomatis ke asesmen dokter, dan form dokter terbuka untuk diisi. Dokter tidak dapat memulai asesmen sebelum asesmen perawat selesai. Untuk mendukung keputusan klinis, halaman asesmen menyediakan **panel Informasi Klinis** (riwayat kunjungan, hasil laboratorium PK, radiologi, patologi anatomi, dan penunjang lainnya) yang dapat disalin sebagian ke Data Objektif Lainnya.

Fokus lingkup Fase 1 (MVP): pemilihan jenis asesmen + validasinya, autofill Asesmen Lanjutan, Skrining TB sebagai prasyarat simpan, form asesmen keperawatan & dokter per poliklinik, integrasi data perawat→dokter beserta validasi urutan pelayanan, panel Informasi Klinis, RBAC, dan performa tampil/simpan di bawah satu detik.

> Referensi: BPMN D6 (EMR RJ — Asesmen Perawat & Dokter RJ), file field `Asesmen_Rawat_Jalan.xlsx`, dan PRD pendamping (Dashboard Pelayanan RJ, Konsul/Rujuk Internal).

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: draft PRD & pain point lapangan:
- Proses asesmen sudah mendukung pengisian oleh perawat dan dokter, namun **alur pengisian Asesmen Awal vs Lanjutan belum sesuai kebutuhan pelayanan**.
- **Asesmen Awal masih dapat menampilkan data dari asesmen sebelumnya**, sehingga berpotensi menghasilkan dokumentasi yang tidak sesuai ketika pasien datang dengan kasus berbeda.
- **Informasi pendukung** (riwayat kunjungan, hasil penunjang) **belum dimanfaatkan optimal** sebagai referensi selama pengisian asesmen.
- Validasi alur pelayanan (urutan perawat → dokter) dan integrasi data antar tenaga kesehatan belum terstandardisasi.

**Masalah/pain point:**
- Aspek bisnis proses: mekanisme autofill pada Asesmen Awal/Lanjutan belum sesuai kebutuhan; autofill Awal berisiko menampilkan data lama.
- Aspek UX: keluhan & diagnosa pasien kontrol biasanya mirip kunjungan sebelumnya, sehingga tanpa autofill yang benar, pengisian terasa berulang dan lambat; informasi klinis tersebar di beberapa menu; pasien rujukan internal berisiko mengisi ulang asesmen keperawatan yang tidak perlu.
- Aspek logic system: belum ada penjagaan urutan pelayanan (dokter mulai sebelum perawat selesai) dan belum ada prasyarat Skrining TB sebelum simpan.

**Dampak utama yang disasar v2:**
- Dokumentasi klinis **lebih cepat & minim input berulang** lewat autofill yang tepat konteks (Awal tanpa autofill, Lanjutan dengan autofill).
- **Kesinambungan informasi klinis antar kunjungan** terjaga.
- **Integrasi mulus perawat → dokter** (anamnesis/keluhan utama + TTV) dan urutan pelayanan yang terjaga.
- **Keamanan data** melalui RBAC.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = Asesmen Keperawatan & Asesmen Dokter Rawat Jalan (lihat §3) — fokus rilis ini.
- **Fase 2** = enhancement lanjutan. `[PERLU KONFIRMASI — daftar item Fase 2 belum ditentukan di sumber]` `[**]`

> Behavior: hampir 80% pasien yang berkunjung adalah pasien lama yang kontrol kembali, sehingga autofill dari riwayat kunjungan sebelumnya menjadi kebutuhan utama.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Validasi SEP BPJS** — sebelum asesmen dimulai, sistem menampilkan alert bila pasien BPJS belum memiliki SEP, sebagai informasi tanpa menghalangi pelayanan.
2. **Pemilihan Jenis Asesmen** — Asesmen Awal atau Asesmen Lanjutan, dipilih sesuai kondisi klinis kunjungan saat ini.
3. **Validasi Jenis Asesmen** — bila memilih Asesmen Lanjutan tetapi tidak ada riwayat asesmen, sistem menampilkan konfirmasi untuk lanjut sebagai Asesmen Awal.
4. **Asesmen Awal** — form baru tanpa autofill dari kunjungan sebelumnya.
5. **Asesmen Lanjutan** — autofill data asesmen dari kunjungan sebelumnya pada poliklinik yang sama, tetap dapat diedit sesuai hak akses.
6. **Skrining TB** — wajib untuk semua pasien rawat jalan (kecuali unit penunjang tertentu), sebagai prasyarat penyimpanan asesmen keperawatan.
7. **Form Asesmen Keperawatan** — subjektif, objektif (TTV & antropometri), status fungsional, pengkajian nyeri, risiko jatuh, skrining gizi, serta asesmen & planning keperawatan; komposisi field mengikuti mapping poliklinik.
8. **Form Asesmen Dokter** — anamnesis tambahan, pemeriksaan fisik, pemeriksaan penunjang, diagnosis (ICD-10), planning (tindakan/ICD-9, instruksi), dan status pulang.
9. **Integrasi Data Asesmen (perawat → dokter)** — anamnesis/keluhan utama & TTV diteruskan otomatis ke asesmen dokter.
10. **Validasi Alur Pelayanan** — dokter hanya dapat mengisi asesmen setelah asesmen perawat selesai.
11. **Autofill Asesmen Dokter Lanjutan** — data dokter dari kunjungan sebelumnya; bila kunjungan sebelumnya tidak memiliki asesmen dokter, autofill hanya TTV & keluhan utama dari perawat.
12. **Panel Informasi Klinis** — riwayat kunjungan, hasil laboratorium PK, radiologi, patologi anatomi, penunjang lainnya (read-only referensi) di side-navigation.
13. **Salin Hasil Penunjang ke Data Objektif Lainnya** — menambahkan hasil terpilih tanpa menghapus data yang sudah ada.
14. **Navigasi Section** — panel navigasi antar section asesmen & informasi klinis.
15. **Simpan Asesmen** — per role, per episode kunjungan aktif; menjadi referensi kunjungan berikutnya.
16. **Hak Akses (RBAC)** — keperawatan: Perawat, Bidan, Casemix; medis: Dokter, Casemix.
17. **Form per Poliklinik** — form asesmen mengikuti mapping poli (General, General Anak, Gigi & Mulut, Mata, Kebidanan, dst.).

### Out Scope

- **Form Konsulan** (asesmen untuk pasien rujukan/konsul internal pada poli tujuan) — PRD terpisah (Konsul Internal vs Rujuk Internal). Modul ini hanya menyatakan bahwa pasien rujukan internal tidak mengisi ulang asesmen keperawatan (lihat BR-018).
- Definisi & flow lengkap **Konsul/Rujuk Internal** — PRD pendamping (hard dependency).
- **Dashboard Pelayanan Rawat Jalan** (daftar antrian, checkpoint, disposisi keluar) — PRD terpisah; modul ini adalah salah satu event source-nya.
- Detail **modul penunjang** (Lab, Radiologi, Patologi Anatomi) yang hasilnya ditampilkan di panel Informasi Klinis — masing-masing PRD terpisah.
- **Fase 2 `[**]`** — item enhancement belum ditentukan di sumber `[PERLU KONFIRMASI]`.

## 4. Goals and Metrics

### Tujuan
Mempercepat pengisian asesmen rawat jalan, mengurangi input berulang melalui autofill pada Asesmen Lanjutan, menjaga kesinambungan dokumentasi klinis antar kunjungan, mendukung integrasi proses asesmen perawat–dokter, dan menjamin keamanan data melalui RBAC — tanpa mengurangi akurasi dan kelengkapan dokumentasi klinis.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Membuka form asesmen | < 1 detik p95 | NFR-01 |
| Menyimpan / memperbarui asesmen | < 1 detik p95 | NFR-02 |
| Pengurangan input berulang (pasien kontrol) | Data asesmen sebelumnya tampil sebagai autofill pada Asesmen Lanjutan sesuai aturan | FR-05, FR-12 |
| Konsistensi & kelengkapan dokumentasi | Seluruh field mandatory tervalidasi sebelum asesmen dapat disimpan | FR-08, BR-017 |
| Kesinambungan informasi klinis | Riwayat kunjungan & hasil penunjang dapat diakses sebagai referensi selama asesmen | FR-13 |
| Keamanan akses | Asesmen hanya dapat diakses & diubah sesuai RBAC | NFR-04, BR-011, BR-012 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Modul Asesmen |
|-------|------------------------------|
| Dashboard Pelayanan Rawat Jalan | Entry point pemilihan pasien; konsumen event checkpoint As. Perawat & As. Dokter (tri-state). |
| Pendaftaran Rawat Jalan | Sumber pasien, episode kunjungan, poli/dokter, cara bayar/penjamin (basis validasi SEP). |
| EMR Pasien | Wadah rekam medis; asesmen tersimpan sebagai bagian EMR per episode kunjungan. |
| Master Data Diagnosa & Tindakan Keperawatan (SDKI/SIKI) | Sumber pilihan Diagnosis Keperawatan & Rencana Tindakan Keperawatan. |
| Master Data Diagnosa (ICD-10) | Sumber diagnosis medis pada asesmen dokter. |
| Master Data Tindakan / Procedure (ICD-9) | Sumber tindakan/prosedur pada planning dokter. |
| Skrining TB | Sub-form prasyarat sebelum simpan asesmen keperawatan. `[ASUMSI: bagian dari form asesmen, bukan modul terpisah]` |
| Konsul / Rujuk Internal (Form Konsulan) | Menentukan bahwa pasien rujukan internal tidak mengisi ulang asesmen keperawatan (BR-018). |
| Integrasi BPJS VClaim | Sumber status SEP untuk validasi/alert SEP. |

Dependency lintas modul: **Dashboard Pelayanan RJ**, **Pendaftaran RJ**, **Master Diagnosa/Tindakan Keperawatan**, **Master ICD-10/ICD-9**, **RBAC/Master Data Unit**.

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Perawat Poli | Primary | Eksekutor asesmen keperawatan (subjektif, objektif, skrining, asesmen & planning keperawatan). |
| Bidan | Primary | Setara perawat untuk asesmen keperawatan (mis. poli kebidanan). |
| Dokter Poli | Primary | Eksekutor asesmen medis (anamnesis tambahan, pemeriksaan fisik, diagnosis, planning, status pulang). |
| Casemix | Secondary | Dapat membuat/memperbarui asesmen keperawatan maupun dokter (kelengkapan dokumentasi/klaim). |
| Admin Sistem | Tersier | Pengaturan hak akses (RBAC) per role. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
Petugas memilih pasien pada dashboard pelayanan rawat jalan, membuka menu Asesmen Keperawatan, memilih Asesmen Awal/Lanjutan, lalu mengisi form. Pada Asesmen Lanjutan, sistem menampilkan data kunjungan sebelumnya sebagai autofill. Petugas mengisi/memperbarui data (termasuk Skrining TB) lalu menyimpan asesmen ke rekam medis. **Keterbatasan:** autofill Asesmen Awal masih dapat menampilkan data lama; riwayat & hasil penunjang belum optimal dijadikan referensi; urutan pelayanan & prasyarat Skrining TB belum tervalidasi.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Pasien telah terdaftar di pelayanan rawat jalan; perawat membuka dashboard & memilih pasien.
2. Perawat membuka form asesmen sesuai poliklinik.
3. Sistem menampilkan alert bila pasien BPJS belum memiliki SEP (non-blocking).
4. Perawat memilih **Asesmen Awal** atau **Asesmen Lanjutan**:
   - Awal → form baru tanpa autofill.
   - Lanjutan → autofill data kunjungan sebelumnya (poli sama).
   - Lanjutan tanpa riwayat → sistem konfirmasi lanjut sebagai Awal.
5. Perawat mengisi Skrining TB dan data asesmen keperawatan sesuai kewenangan; **penyimpanan hanya diizinkan setelah Skrining TB tersimpan** dan field mandatory lengkap.
6. Setelah asesmen perawat tersimpan, sistem memperbarui data yang dipakai asesmen dokter (integrasi) dan **membuka form dokter**.
7. Dokter membuka form asesmen; bila asesmen perawat belum tersedia, sistem menampilkan informasi bahwa asesmen perawat harus diselesaikan lebih dulu.
8. Sistem menyajikan data dokter sesuai jenis asesmen: anamnesis & TTV mengikuti asesmen perawat terbaru; field dokter lainnya mengikuti kunjungan sebelumnya (Lanjutan) atau kosong (Awal).
9. Dokter melengkapi asesmen medis (pemeriksaan fisik, diagnosis, planning, status pulang) lalu menyimpan sebagai bagian rekam medis.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Autofill Asesmen Awal | Masih bisa menampilkan data lama | Tanpa autofill (BR-003) |
| Autofill Asesmen Lanjutan | Ada tetapi belum sesuai kebutuhan | Autofill dari kunjungan sebelumnya poli sama, editable (BR-004) |
| Validasi jenis asesmen | Tidak ada | Lanjutan tanpa riwayat → konfirmasi jadi Awal (BR-005) |
| Prasyarat Skrining TB | Tidak tervalidasi | Wajib tersimpan sebelum simpan asesmen keperawatan (BR-006) |
| Urutan pelayanan | Tidak dijaga | Dokter terkunci sampai asesmen perawat selesai (BR-008) |
| Integrasi perawat→dokter | Belum standar | Anamnesis/keluhan utama + TTV diteruskan otomatis (BR-009) |
| Informasi klinis | Tersebar, manual | Panel Informasi Klinis + Salin ke Data Objektif Lainnya (FR-13, FR-14) |

## 7. Main Flow / Mindmap

Alur berikut diturunkan dari BPMN **D6 — EMR RJ (Asesmen Perawat & Dokter RJ)**.

### Skenario 1 — Asesmen Perawat (alur normal)
1. Pasien tiba di Nurse Station (sudah check-in) → perawat memanggil pasien → verifikasi identitas (Nama, RM, Penjamin).
2. Pilih **Jenis Asesmen**: Awal / Lanjutan (Lanjutan menampilkan history asesmen).
3. Input **Data Subjektif** (keluhan, riwayat penyakit, alergi).
4. Input **Data Objektif — TTV** (TD, Nadi, RR, Suhu, SpO2) & antropometri (TB, BB).
5. **Skrining**: TB, Gizi, Nyeri.
6. Input **Assessment & Planning Keperawatan**.
7. **Review kelengkapan data** → bila belum lengkap muncul **Alert: Data Belum Lengkap**; bila lengkap → **Simpan dan Lanjutkan** (unlock form dokter).
8. **Autofill data perawat ke form dokter** → simpan asesmen → status **Ready untuk Dokter**.

### Skenario 2 — Asesmen Dokter (alur normal)
1. Dokter memanggil pasien → verifikasi identitas.
2. **Review data asesmen perawat** (autofill ke asesmen dokter).
3. **Anamnesis tambahan** → **pemeriksaan fisik** → **input diagnosa (ICD-10)** → **input planning** (tindakan, instruksi).
4. **Status Pulang?** menentukan cabang finalisasi (lihat Skenario 4).
5. Konsultasi dengan perawat & dokter selesai → **Selesai Pelayanan**.

### Skenario 3 — Variasi jenis asesmen & riwayat
- **Asesmen Awal**: form baru, tanpa autofill kunjungan sebelumnya.
- **Asesmen Lanjutan**: autofill data asesmen kunjungan sebelumnya (poli sama); untuk dokter, anamnesis & TTV tetap diperbarui dari asesmen perawat terbaru.
- **Lanjutan tanpa riwayat**: konfirmasi untuk melanjutkan sebagai Awal (BR-005).
- **Kunjungan sebelumnya tanpa asesmen dokter**: autofill dokter hanya TTV & keluhan utama dari perawat (BR-010).

### Skenario 4 — Status Pulang (cabang finalisasi dokter)
- **Pasien Pulang** → Finalisasi instruksi pulang (Resep, Kontrol, Edukasi) → Pasien pulang.
- **Pasien Rawat Inap** → Koordinasi rawat inap (Bed, Planning Awal) → pasien terdaftar & masuk Rawat Inap.
- **Pasien Dirujuk** → Koordinasi rujukan (RS tujuan, Resume, Ambulans) → pasien dirujuk.

> Eksekusi disposisi keluar (Pulang/Rawat Inap/Pulang Paksa/Rujuk Internal/Rujuk Eksternal/Meninggal) selaras dengan **Modal Status Keluar** pada Dashboard Pelayanan RJ. `[ASUMSI: mekanisme sama; batas kepemilikan field "Status Pulang" pada planning dokter vs disposisi Dashboard perlu ditegaskan — lihat Pertanyaan Terbuka]`

### Skenario 5 — Pasien rujukan/konsul internal (poli tujuan)
- Perawat di poli tujuan **tidak perlu mengisi ulang** asesmen keperawatan (BR-018).
- Dokter di poli tujuan **hanya mengisi Form Konsulan** — **out of scope** modul ini (PRD Konsul/Rujuk Internal, hard dependency).

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Validasi/alert SEP hanya dievaluasi untuk pasien BPJS. SEP belum ada → alert konfirmasi (non-blocking); pasien tetap dapat melanjutkan pelayanan. Pasien non-BPJS → tidak ada alert. | FR-01; US-01 |
| **BR-002** | Jenis asesmen (Awal/Lanjutan) dipilih **satu kali** di awal pengisian. Update asesmen tidak meminta pemilihan ulang jenis asesmen. | FR-02; US-02 |
| **BR-003** | Asesmen Awal menampilkan form baru **tanpa** autofill data kunjungan sebelumnya. | FR-04; US-04 |
| **BR-004** | Asesmen Lanjutan menampilkan **autofill** data asesmen kunjungan sebelumnya **pada poliklinik yang sama**, dan tetap dapat diedit sesuai hak akses. | FR-05; US-05 |
| **BR-005** | Bila memilih Asesmen Lanjutan namun pasien belum memiliki riwayat asesmen, sistem menampilkan konfirmasi untuk melanjutkan menggunakan Asesmen Awal. | FR-03; US-03 |
| **BR-006** | Semua pasien rawat jalan wajib mengisi Skrining TB **sebelum** asesmen keperawatan disimpan. Pengecualian: unit pelayanan penunjang — **Hemodialisa, Fisioterapi, Terapi Wicara, Terapi Okupasi, Psikologi**. Asesmen keperawatan hanya dapat disimpan bila Skrining TB telah disimpan. | FR-06; US-07 |
| **BR-007** | Kategori Skrining TB mengikuti usia pasien: **Anak** (sistem skoring; total skor **≥ 6 → Suspek TB**, < 6 → Tidak Suspek) dan **Dewasa** (checklist Ya/Tidak). | FR-06; `Asesmen_Rawat_Jalan.xlsx` — sheet Skrining TB |
| **BR-008** | Dokter tidak dapat memulai/mengisi asesmen sebelum asesmen perawat **selesai**. Bila belum tersedia, sistem menampilkan informasi bahwa asesmen perawat harus diselesaikan lebih dulu. | FR-10; US-08 |
| **BR-009** | Data **anamnesis/keluhan utama** dan **TTV** pada asesmen dokter **selalu mengikuti asesmen perawat terbaru** (diteruskan otomatis). | FR-09; US-10 |
| **BR-010** | Pada Asesmen Lanjutan dokter, field dokter lainnya mengikuti data asesmen dokter kunjungan sebelumnya. Bila kunjungan sebelumnya **tidak** memiliki asesmen dokter, autofill hanya berisi **TTV & keluhan utama** dari asesmen perawat. | FR-12; US-10 |
| **BR-011** | Data asesmen **keperawatan** hanya dapat dibuat/diperbarui oleh role **Perawat, Bidan, Casemix**. Dokter tidak dapat mengubah data asesmen perawat. | FR-17; US-06, US-11 |
| **BR-012** | Data asesmen **dokter** hanya dapat dibuat/diperbarui oleh role **Dokter, Casemix**. Perawat/bidan tidak dapat mengisi asesmen dokter. | FR-17; US-09, US-11 |
| **BR-013** | Form asesmen yang ditampilkan mengikuti **mapping poliklinik**: General (default) atau form spesialistik (General Anak, Gigi & Mulut, Mata, Kebidanan, dll.) sesuai jenis poli. | FR-18; `Asesmen_Rawat_Jalan.xlsx` — sheet Mapping |
| **BR-014** | Informasi klinis pada panel (riwayat kunjungan, lab PK, radiologi, PA, penunjang lainnya) bersifat **read-only referensi**; tidak dapat diubah dari panel. | FR-13; US-13 |
| **BR-015** | Aksi **Salin ke Data Objektif Lainnya** menambahkan hasil penunjang terpilih **di bawah** data yang sudah ada, **tanpa menghapus** data existing. Tersedia untuk asesmen perawat & dokter sesuai hak akses. | FR-14; US-13 |
| **BR-016** | Asesmen disimpan pada **episode kunjungan aktif** dan menjadi referensi/riwayat untuk kunjungan berikutnya. | FR-16; US-14 |
| **BR-017** | Field mandatory tervalidasi sebelum simpan; bila belum lengkap, sistem menampilkan **Alert: Data Belum Lengkap** dan penyimpanan ditahan. | FR-08; BPMN D6 |
| **BR-018** | Pasien **rujukan internal** di poli tujuan: perawat **tidak perlu** mengisi asesmen keperawatan lagi; dokter **hanya mengisi Form Konsulan** (Form Konsulan = out of scope; PRD Konsul/Rujuk Internal, hard dependency). | §3 Out Scope; FR-19 |
| **BR-019** | Diagnosis & Rencana Tindakan Keperawatan diambil dari **master data (SDKI/SIKI)**; Diagnosis medis dari **master ICD-10**; Tindakan/procedure dari **master ICD-9**. | FR-07, FR-11; `Asesmen_Rawat_Jalan.xlsx` |
| **BR-020** | Field **Status Pulang** pada planning dokter memuat disposisi: **Pulang, Rawat Inap, Pulang Paksa, Rujuk Internal, Rujuk Eksternal, Meninggal** — selaras dengan Modal Status Keluar Dashboard. `[ASUMSI selaras Dashboard]` | FR-11; sheet Mata/Kebidanan |
| **BR-021** | Setelah asesmen perawat disimpan, checkpoint **As. Perawat = Selesai** dan **form dokter di-unlock**; status diteruskan ke Dashboard sebagai event (tri-state). | FR-09; Dashboard PRD |
| **BR-022** | Skrining **TB, Gizi, dan Nyeri** merupakan bagian dari asesmen keperawatan sesuai poli (komposisi field per form mengikuti mapping). | §12; BPMN D6 |

## 9. State Machine

### 9.1 Status Pengisian Asesmen (per role) — Tiga Kondisi
Selaras dengan checkpoint tri-state Dashboard (As. Perawat & As. Dokter).

| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Tidak Diisi | Abu / dash (–) | Belum ada aktivitas pada asesmen tersebut. |
| Sedang Diproses | Kuning / setengah | Form dibuka tetapi belum disimpan (tanpa mekanisme draft). |
| Selesai | Hijau / centang | Asesmen disimpan/final; memicu event ke Dashboard. |

- **Transisi:** Tidak Diisi → Sedang Diproses → Selesai (berbasis aksi user & event simpan). Status pada Dashboard bersifat read-only (sumber kebenaran = modul asesmen).

### 9.2 Gerbang Alur Pelayanan (Perawat → Dokter)
| State Form Dokter | Kondisi | Perilaku |
|-------------------|---------|----------|
| **Locked** | Asesmen perawat belum Selesai | Dokter tidak dapat mengisi; sistem menampilkan info "asesmen perawat harus diselesaikan lebih dulu" (BR-008). |
| **Unlocked** | Asesmen perawat Selesai (tersimpan) | Form dokter terbuka; anamnesis/keluhan utama + TTV ter-autofill dari asesmen perawat terbaru (BR-009, BR-021). |

### 9.3 Jenis Asesmen (dipilih sekali)
| Jenis | Autofill | Catatan |
|-------|----------|---------|
| **Awal** | Tidak ada (BR-003) | Untuk kasus/episode berbeda meski poli sama. |
| **Lanjutan** | Ada — dari kunjungan sebelumnya poli sama (BR-004) | Bila tak ada riwayat → konfirmasi jadi Awal (BR-005). |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-01** | **Validasi/Alert SEP BPJS** — saat form asesmen dibuka, tampilkan alert konfirmasi bila pasien BPJS belum memiliki SEP; non-blocking, hanya untuk pasien BPJS. | US-01; BR-001 |
| **FR-02** | **Pemilihan Jenis Asesmen** — pilihan Awal/Lanjutan ditentukan sebelum form ditampilkan; dipilih satu kali di awal pengisian. | US-02; BR-002 |
| **FR-03** | **Validasi Jenis Asesmen** — bila Lanjutan dipilih tanpa riwayat asesmen, tampilkan konfirmasi untuk lanjut sebagai Awal. | US-03; BR-005 |
| **FR-04** | **Asesmen Awal** — tampilkan form baru tanpa autofill kunjungan sebelumnya. | US-04; BR-003 |
| **FR-05** | **Asesmen Lanjutan** — autofill data asesmen dari kunjungan sebelumnya (poli sama), editable sesuai hak akses. | US-05; BR-004 |
| **FR-06** | **Skrining TB** — form skrining sesuai kategori usia (Anak berbasis skor / Dewasa checklist); wajib tersimpan sebagai prasyarat simpan asesmen keperawatan; pengecualian unit penunjang. | US-07; BR-006, BR-007 |
| **FR-07** | **Form Asesmen Keperawatan** — pengisian section: Subjektif, Objektif (TTV & antropometri, Data Objektif Lainnya), Status Fungsional, Pengkajian Nyeri (PQRST), Risiko Jatuh, Skrining Gizi, Asesmen & Planning Keperawatan (master data SDKI/SIKI). Detail field §12. | US-06; BR-013, BR-019, BR-022 |
| **FR-08** | **Validasi Kelengkapan Data** — field mandatory tervalidasi sebelum simpan; bila belum lengkap tampilkan Alert Data Belum Lengkap. | US-06; BR-017 |
| **FR-09** | **Integrasi Data Perawat → Dokter** — meneruskan anamnesis/keluhan utama & TTV ke asesmen dokter dan meng-unlock form dokter setelah asesmen perawat disimpan. | US-10; BR-009, BR-021 |
| **FR-10** | **Validasi Alur Pelayanan** — kunci form dokter hingga asesmen perawat selesai; tampilkan info bila belum tersedia. | US-08; BR-008 |
| **FR-11** | **Form Asesmen Dokter** — anamnesis tambahan, pemeriksaan fisik (status lokalis/generalis), pemeriksaan penunjang, Diagnosis (ICD-10), Planning (Tindakan/ICD-9, Rencana/Terapi), Status Pulang & Instruksi Rawat Inap. Detail field §12. | US-09; BR-012, BR-019, BR-020 |
| **FR-12** | **Autofill Asesmen Dokter Lanjutan** — isi field dokter dari kunjungan sebelumnya; bila kunjungan sebelumnya tanpa asesmen dokter, autofill hanya TTV & keluhan utama dari perawat. | US-10; BR-010 |
| **FR-13** | **Panel Informasi Klinis** — tampilkan riwayat kunjungan, hasil lab PK, radiologi, patologi anatomi, penunjang lainnya (read-only) pada side-navigation tanpa berpindah halaman. | US-13; BR-014 |
| **FR-14** | **Salin ke Data Objektif Lainnya** — salin hasil penunjang terpilih ke field Data Objektif Lainnya (append, tanpa menghapus data existing); tersedia untuk perawat & dokter sesuai hak akses. | US-13; BR-015 |
| **FR-15** | **Navigasi Section** — panel navigasi antar section asesmen & informasi klinis; berpindah tanpa kehilangan data yang telah diinput. | US-12 |
| **FR-16** | **Simpan Asesmen** — simpan per role pada episode kunjungan aktif; tersedia sebagai riwayat kunjungan berikutnya. | US-14; BR-016 |
| **FR-17** | **Hak Akses (RBAC)** — batasi lihat/tambah/ubah/simpan per role (keperawatan: Perawat/Bidan/Casemix; medis: Dokter/Casemix). | US-11; BR-011, BR-012 |
| **FR-18** | **Form per Poliklinik** — render form asesmen (perawat & dokter) sesuai mapping poli. | US-06, US-09; BR-013 |
| **FR-19** | **Penanganan Rujukan Internal** — pada poli tujuan, perawat tidak perlu mengisi asesmen keperawatan; dokter diarahkan ke Form Konsulan (out of scope). | Aspek UX draft; BR-018 |

## 11. User Stories

> Format "Sebagai … ingin … sehingga …". Acceptance Criteria dalam pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-01** | Sebagai **perawat**, saya ingin mengetahui bila pasien BPJS belum memiliki SEP sebelum memulai asesmen, sehingga administrasi penjamin dapat diperhatikan tanpa menghambat pelayanan. | 1) Given pasien BPJS tanpa SEP, When form asesmen dibuka, Then muncul alert konfirmasi (BR-001). 2) Given pasien non-BPJS, Then tidak ada alert. 3) Given alert muncul, When konfirmasi, Then pengguna tetap dapat melanjutkan pelayanan. | FR-01; BR-001 |
| **US-02** | Sebagai **perawat**, saya ingin memilih Asesmen Awal atau Lanjutan sesuai kondisi pasien, sehingga jenis asesmen sesuai konteks kunjungan. | 1) Given form akan dibuka, When memilih jenis asesmen, Then form mengikuti pilihan tersebut. 2) Given asesmen di-update, Then sistem tidak meminta pemilihan jenis ulang (BR-002). | FR-02; BR-002 |
| **US-03** | Sebagai **tenaga kesehatan**, saya ingin sistem memvalidasi bila Lanjutan dipilih tanpa riwayat asesmen, sehingga tidak salah menggunakan Asesmen Lanjutan. | 1) Given tidak ada riwayat asesmen, When memilih Lanjutan, Then sistem menawarkan lanjut sebagai Awal (BR-005). 2) Given konfirmasi diterima, Then form Awal ditampilkan. | FR-03; BR-005 |
| **US-04** | Sebagai **tenaga kesehatan**, saya ingin memulai asesmen baru untuk kasus/episode berbeda, sehingga dokumentasi independen dari kunjungan sebelumnya. | 1) Given memilih Awal, When form dibuka, Then seluruh field kosong tanpa autofill (BR-003). | FR-04; BR-003 |
| **US-05** | Sebagai **tenaga kesehatan**, saya ingin melanjutkan asesmen berdasarkan kunjungan sebelumnya, sehingga pengisian pasien kontrol lebih cepat. | 1) Given memilih Lanjutan & ada riwayat poli sama, When form dibuka, Then data sebelumnya tampil sebagai autofill (BR-004). 2) Given autofill tampil, When perlu, Then data dapat diubah sesuai hak akses. | FR-05; BR-004 |
| **US-06** | Sebagai **perawat**, saya ingin mengisi asesmen keperawatan sebagai dasar pelayanan, sehingga dokumentasi keperawatan lengkap & tervalidasi. | 1) Given field mandatory belum lengkap, When simpan, Then muncul Alert Data Belum Lengkap (BR-017). 2) Given lengkap & Skrining TB tersimpan, When simpan, Then asesmen tersimpan. 3) Given bukan role berwenang, Then tidak dapat mengubah (BR-011). | FR-07, FR-08; BR-011, BR-017 |
| **US-07** | Sebagai **perawat**, saya ingin memastikan Skrining TB selesai sebelum asesmen disimpan, sehingga kebijakan skrining TB terpenuhi. | 1) Given Skrining TB belum tersimpan, When simpan asesmen, Then ditahan hingga Skrining TB tersimpan (BR-006). 2) Given unit dikecualikan (Hemodialisa/Fisioterapi/Terapi Wicara/Terapi Okupasi/Psikologi), Then validasi tidak berlaku. 3) Given pasien anak, Then skor menentukan Suspek TB bila ≥6 (BR-007). | FR-06; BR-006, BR-007 |
| **US-08** | Sebagai **dokter**, saya ingin memastikan asesmen perawat tersedia sebelum saya mulai, sehingga urutan pelayanan terjaga. | 1) Given asesmen perawat belum selesai, When dokter membuka form, Then form terkunci + info (BR-008). 2) Given asesmen perawat selesai, Then form dokter terbuka. | FR-10; BR-008 |
| **US-09** | Sebagai **dokter**, saya ingin melengkapi asesmen medis berdasarkan hasil perawat & pemeriksaan, sehingga keputusan klinis terdokumentasi. | 1) Given form dokter terbuka, When mengisi, Then data tersimpan pada kunjungan aktif. 2) Given bukan role dokter/casemix, Then tidak dapat mengubah (BR-012). | FR-11; BR-012 |
| **US-10** | Sebagai **dokter**, saya ingin data tertentu dari asesmen perawat otomatis dipakai pada asesmen dokter, sehingga tidak input ulang. | 1) Given asesmen perawat tersimpan, When form dokter dibuka, Then anamnesis/keluhan utama & TTV mengikuti asesmen perawat terbaru (BR-009). 2) Given Lanjutan & kunjungan sebelumnya tanpa asesmen dokter, Then autofill hanya TTV & keluhan utama (BR-010). | FR-09, FR-12; BR-009, BR-010 |
| **US-11** | Sebagai **administrator sistem**, saya ingin tiap pengguna hanya mengakses fitur sesuai kewenangan, sehingga data aman. | 1) Given role keperawatan, Then dapat ubah asesmen keperawatan, tidak asesmen dokter (BR-011). 2) Given role dokter, Then dapat ubah asesmen dokter, tidak asesmen perawat (BR-012). | FR-17; BR-011, BR-012 |
| **US-12** | Sebagai **tenaga kesehatan**, saya ingin berpindah antar section dengan mudah, sehingga form panjang tidak menyulitkan. | 1) Given form panjang, When memakai navigasi section, Then berpindah tanpa kehilangan data yang telah diinput. | FR-15 |
| **US-13** | Sebagai **tenaga kesehatan**, saya ingin melihat & memanfaatkan riwayat informasi klinis selama asesmen, sehingga dokumentasi lebih cepat. | 1) Given panel Informasi Klinis, When dibuka, Then tampil riwayat kunjungan, lab PK, radiologi, PA, penunjang lainnya (read-only, BR-014). 2) Given hasil dipilih, When Salin, Then ditambahkan ke Data Objektif Lainnya tanpa menghapus data existing (BR-015). | FR-13, FR-14; BR-014, BR-015 |
| **US-14** | Sebagai **tenaga kesehatan**, saya ingin menyimpan asesmen sebagai bagian rekam medis, sehingga tersedia sebagai referensi kunjungan berikutnya. | 1) Given asesmen valid, When simpan, Then tersimpan pada episode kunjungan aktif & muncul pada riwayat (BR-016). | FR-16; BR-016 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi & penjamin **reuse definisi kanonik dari Pendaftaran Rawat Jalan** — nama, tipe, format, validasi harus sama. Field TTV dipakai bersama antara asesmen perawat & dokter (autofill). Referensi lengkap komposisi field per poli: `Asesmen_Rawat_Jalan.xlsx`.

### 12.1 Prasyarat & Pemilihan (FR-01, FR-02, FR-03)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| sep_status | Status SEP | boolean | — | Alert bila BPJS & SEP kosong | Integrasi VClaim | Non-blocking (BR-001) |
| jenis_asesmen | Jenis Asesmen | radio | Ya | Awal / Lanjutan | manual | Dipilih 1x (BR-002) |
| konfirmasi_awal | Konfirmasi lanjut Awal | dialog | kondisional | Muncul bila Lanjutan tanpa riwayat | sistem | BR-005 |

### 12.2 Layar INPUT — Skrining TB (FR-06)

Form mengikuti kategori usia (Anak / Dewasa) — sheet **Skrining TB**.

| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| tb_anak_q1..q8 | Pertanyaan skrining TB anak (batuk, demam, kontak TB, kelenjar getah bening, pembengkakan tulang/sendi, rontgen thorax, uji tuberkulin, status gizi) | radio button (berskor) | Ya (anak) | Tiap item punya skor | Total skor menentukan kesimpulan |
| tb_anak_ket | Keterangan | free text | Tidak | — | Opsional |
| tb_anak_skor | Skor | perhitungan | auto | Sum skor item | Read-only |
| tb_anak_kesimpulan | Kesimpulan | auto | auto | **≥ 6 → Suspek TB**; < 6 → Tidak Suspek | BR-007 |
| tb_dewasa_q1..q7 | Pertanyaan skrining TB dewasa (batuk, batuk berdahak >2 mgg, batuk berdarah, sesak, demam tak jelas, penurunan BB >1 bln, rontgen mengarah TB Paru) | radio button (Ya/Tidak) | Ya (dewasa) | — | Checklist |
| tb_dewasa_ket | Keterangan | free text | Tidak | — | Opsional |
| tb_dewasa_kesimpulan | Kesimpulan | pilih | Ya | Suspek TB / Tidak Suspek TB | — |

> Skrining TB adalah **prasyarat simpan** asesmen keperawatan (BR-006), kecuali unit pengecualian.

### 12.3 Layar INPUT — Asesmen Keperawatan (General/baseline) (FR-07)

| Section | SubSection | Field | Tipe | Value / Format |
|---------|-----------|-------|------|----------------|
| Subjektif | — | Keluhan Umum | free text | — |
| | | Jenis Anamnesis | radio | Autoanamnesis / Alloanamnesis (jika allo: pemberi keterangan) |
| | | Riwayat Alergi | radio | Tidak ada / Ada (jika ada: sebutkan) |
| | | Jenis Penyakit | radio | Akut / Kronis |
| | | Riwayat Psikospiritual | radio + multi | Tidak ada / Ada → Takut Kematian, Takut Dioperasi, Kecemasan, Putus Asa, Kesurupan, Tahayul/Khurofat |
| | | Riwayat Penyakit Dahulu | free text | jika ada: sebutkan |
| | | Riwayat Penggunaan Obat | radio + detail | Tidak ada / Ada → Nama Obat, Dosis, Tanggal Penggunaan Terakhir |
| Objektif | TTV | Tekanan Darah | numerik | Sistolik/Diastolik (mmHg) |
| | | RR | numerik | x/menit |
| | | Nadi | numerik | x/menit |
| | | Suhu | numerik | °C |
| | | Saturasi O2 | numerik | % |
| | | GDS | numerik | mg/dL |
| | | Tinggi Badan | numerik | cm (antropometri) |
| | | Berat Badan | numerik | kg (antropometri) |
| | | Data Objektif Lainnya | free text | target aksi Salin (FR-14) |
| Status Fungsional | — | Penggunaan Alat Bantu | radio | Tidak / Tongkat / Kursi Roda |
| | | Cacat Tubuh | radio | Tidak ada / Ada (jika ada: sebutkan) |
| Pengkajian Nyeri (PQRST) | — | Scale | skala | 0–10 |
| | | Provocation | pilih | Cahaya / Gelap / Gerakan / Berbaring / Lainnya |
| | | Severity | radio | Tidak Nyeri / Ringan / Sedang / Berat |
| | | Quality | pilih | Ditusuk/Dipukul/Berdenyut/Ditikam/Kram/Ditarik/Dibakar/Tajam/Lainnya (sebutkan) |
| | | Time | radio | Terus Menerus / Hilang Timbul; <30 / >30 menit |
| | | Radiation | radio | Tidak / Ada |
| Risiko Jatuh (Dewasa) | — | Usia | auto | dari tanggal lahir |
| | | Tidak Seimbang / Menggunakan Penopang | radio | Tidak / Ada |
| | | Score | perhitungan | 0 / 10 / 12 |
| | | Hasil | auto | Tidak Beresiko / Resiko Rendah / Resiko Tinggi |
| Skrining Gizi | — | Penurunan Berat (6 bln) | pilih | Tidak / Tidak yakin / Ya (1–5, 6–10, 11–15, >15 kg) / Tidak tahu |
| | | Asupan Berkurang | radio | Tidak / Ya |
| | | Kesimpulan | pilih | 1 (tidak berisiko) … 5 (berisiko malnutrisi) |
| Asesmen & Planning | — | Diagnosis Keperawatan | lookup master data | SDKI/SIKI (BR-019) |
| | | Rencana Tindakan Keperawatan | lookup master data | mengikuti diagnosis (BR-019) |

### 12.4 Layar INPUT — Asesmen Dokter (General/baseline) (FR-11)

| Section | SubSection | Field | Tipe | Value / Format |
|---------|-----------|-------|------|----------------|
| Subjektif | — | Anamnesis | free text | **autofill** keluhan utama dari perawat (BR-009) |
| Objektif | TTV | TD, RR, Nadi, Suhu, Saturasi, GDS, TB, BB | numerik | **autofill** dari asesmen perawat (BR-009) |
| | | Data Objektif Lainnya | free text | target aksi Salin (FR-14) |
| Pemeriksaan Fisik | Status Lokalis / Generalis | Kepala, Rambut, Mata, Telinga, Hidung, Mulut, Leher, Dada, Payudara, Punggung, Perut, Ekstremitas Atas/Bawah, Genitalia, Anus/Dubur | free text / normal | pemeriksaan head-to-toe |
| Pemeriksaan Penunjang | — | Jenis Pemeriksaan / Hasil Pemeriksaan / Keterangan | text | referensi hasil penunjang |
| Asesmen | — | Diagnosis | free text | deskripsi diagnosis |
| | | ICD-10 | lookup master data | master diagnosa (BR-019) |
| Planning | — | Tindakan | free text | — |
| | | ICD-9 | lookup master data | master procedure (BR-019) |
| | | Rencana/Tindakan/Terapi | free text | — |
| | | Status Pulang | dropdown | Pulang / Rawat Inap / Pulang Paksa / Rujuk Internal / Rujuk Eksternal / Meninggal (BR-020) |
| | | Instruksi Rawat Inap | free text | — |

### 12.5 Variasi Form per Poliklinik (FR-18, BR-013)

Baseline = **General**. Form spesialistik menamb/mengganti section berikut (ref: `Asesmen_Rawat_Jalan.xlsx`, sheet Mapping & per-poli):

| Form (poli) | Perbedaan utama dari General |
|-------------|------------------------------|
| **General Anak** | Skrining TB **Anak**; Risiko Jatuh **Humpty Dumpty** (Diagnosis, Gangguan Kognitif, Faktor Lingkungan, Faktor Pembedahan/Sedasi, Medikamentosa, Skor 0–6/7–11/12–17). |
| **Gigi dan Mulut** | Subjektif + Kebiasaan & Riwayat Kesehatan Gigi; **Pemeriksaan Ekstra Oral** (Muka, Kel. Lymph) & **Intra Oral** (Bibir, Mukosa, Lidah, Gingiva); **odontogram/Gigi** (anotasi gambar); **Asesmen Kemampuan Ibadah** (PKU); dokter: penunjang via upload. |
| **Mata** | **Status Ophthalmologicus** (anotasi mata OD & OS pada kanvas gambar; Visus, Refraksi Subyektif/Objektif, Proyeksi Sinar/Warna, Bulbus Okuli … Tensio Oculi — default Normal); skala nyeri **Wong-Baker faces**; Diagnosis Kerja multiple + ICD-10; Hasil Penunjang Lainnya (upload). |
| **Kebidanan (PKU)** | **Riwayat Kehamilan/Persalinan/Nifas** (tabel + entry), **Riwayat KB & Menstruasi**, **LILA**, **ANC/non-ANC**, USG upload, Status Sosial-Ekonomi, Asesmen Kemampuan Ibadah. |
| **Hemodialisa / Rehab Medik / Psikologi / dll.** | Form khusus per poli; sebagian termasuk **pengecualian Skrining TB**. `[PERLU KONFIRMASI: detail field form Hemodialisa, Rehab Medik, Psikologi belum lengkap di sumber]` |
| **Anestesi / Akupuntur** | Mapping menandai "Konsulan only" / "Tindakan only" — perlu penegasan apakah masuk lingkup asesmen ini. `[PERLU KONFIRMASI]` |

### 12.6 Panel Informasi Klinis (read-only) (FR-13)

| Kolom | Sumber Data | Format Tampilan | Catatan |
|-------|-------------|-----------------|---------|
| Riwayat Kunjungan | EMR / kunjungan | list | referensi |
| Hasil Laboratorium PK | modul Lab | list/tabel | dapat disalin (FR-14) |
| Hasil Radiologi | modul Radiologi | list | dapat disalin (FR-14) |
| Hasil Patologi Anatomi | modul PA | list | dapat disalin (FR-14) |
| Penunjang Lainnya | modul penunjang | list | dapat disalin (FR-14) |

### 12.7 Data TER-GENERATE saat Simpan (FR-16)

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| status_asesmen_perawat | Checkpoint As. Perawat | enum | tri-state (§9.1) | event ke Dashboard (BR-021) |
| status_asesmen_dokter | Checkpoint As. Dokter | enum | tri-state (§9.1) | event ke Dashboard |
| form_dokter_lock | Status kunci form dokter | boolean | dibuat otomatis saat perawat Selesai | BR-008, BR-021 |
| episode_kunjungan_id | ID episode kunjungan | ref | dari Pendaftaran RJ | BR-016 |
| audit_asesmen | Jejak perubahan | log | aktor, timestamp, before/after | NFR-05 `[ASUMSI]` |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-01** | Performa | Membuka form asesmen < 1 detik p95. | Metrik |
| **NFR-02** | Performa | Menyimpan/memperbarui asesmen < 1 detik p95. | Metrik |
| **NFR-03** | Real-Time | Setelah asesmen perawat disimpan, checkpoint & unlock form dokter diteruskan sebagai event ke Dashboard. `[ASUMSI: budget delta selaras Dashboard < 3 detik]` | FR-09; Dashboard PRD |
| **NFR-04** | Keamanan/RBAC | Akses lihat/tambah/ubah/simpan dibatasi per role (keperawatan vs medis). | FR-17; BR-011, BR-012 |
| **NFR-05** | Auditabilitas | Perubahan asesmen tercatat (aktor, timestamp). `[ASUMSI: praktik EMR standar]` | Domain knowledge |
| **NFR-06** | Usability | Navigasi section untuk form panjang; berpindah tanpa kehilangan data terinput; kurangi scrolling. | FR-15 |
| **NFR-07** | Konsistensi | Field demografi/penjamin/TTV reuse definisi kanonik (Pendaftaran RJ); TTV konsisten antara perawat & dokter. | §12 |
| **NFR-08** | Reliabilitas | Autofill tidak menimpa nilai yang telah diubah user setelah form dimuat. `[ASUMSI]` | FR-05, FR-12 |
| **NFR-09** | Aksesibilitas | Status/checkpoint tidak hanya bergantung warna (ikon + warna + label). | §9 |

## 14. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **BPJS VClaim (SEP)** | Sumber status SEP untuk alert SEP BPJS. | Live / Mock `[PERLU KONFIRMASI]` | FR-01 |
| **Master Data Diagnosa & Tindakan Keperawatan (SDKI/SIKI)** | Sumber Diagnosis & Rencana Tindakan Keperawatan. | Internal | FR-07; BR-019 |
| **Master Data Diagnosa (ICD-10)** | Sumber diagnosis medis. | Internal | FR-11; BR-019 |
| **Master Data Tindakan/Procedure (ICD-9)** | Sumber tindakan/prosedur planning dokter. | Internal | FR-11; BR-019 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Dashboard Pelayanan Rawat Jalan | **Hard** | Tidak ada entry point pemilihan pasien & konsumsi checkpoint. |
| Pendaftaran Rawat Jalan | **Hard** | Tidak ada sumber pasien, episode kunjungan, penjamin. |
| Skrining TB (sub-form) | **Hard** | Prasyarat simpan asesmen keperawatan tidak terpenuhi (BR-006). |
| Master Diagnosa/Tindakan Keperawatan & ICD-10/ICD-9 | **Hard** | Field diagnosis/tindakan tidak dapat diisi dari master data. |
| PRD Konsul/Rujuk Internal (Form Konsulan) | **Hard** | Alur pasien rujukan internal (BR-018) tidak tuntas; dokter poli tujuan tanpa Form Konsulan. |
| Integrasi BPJS VClaim (SEP) | Soft | Alert SEP nonaktif untuk pasien BPJS. |
| RBAC / Master Data Unit | Soft | Kontrol akses per role tidak aktif. |
| Modul Lab / Radiologi / PA / Penunjang | Soft | Panel Informasi Klinis kosong / aksi Salin tidak berfungsi. |

## 15. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Validasi SEP; pemilihan & validasi jenis asesmen; Asesmen Awal/Lanjutan + autofill; Skrining TB (prasyarat simpan); form asesmen keperawatan & dokter per poli; integrasi perawat→dokter + validasi alur pelayanan; panel Informasi Klinis + Salin ke Data Objektif Lainnya; navigasi section; simpan per episode; RBAC; performa < 1 detik. |
| **Fase 2** `[**]` | `[PERLU KONFIRMASI]` — item enhancement belum ditentukan di sumber. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Asesmen Awal keliru menampilkan data kunjungan lama (pain point V1). | BR-003 tegas: Awal tanpa autofill; QA khusus alur Awal vs Lanjutan. |
| R2 | Dokter memulai asesmen sebelum perawat selesai. | BR-008 lock form + info; checkpoint tri-state (§9.2). |
| R3 | Skrining TB terlewat sehingga kebijakan tak terpenuhi. | BR-006 gating simpan; pengecualian unit terdefinisi. |
| R4 | Performa lambat pada form panjang / banyak field. | Navigasi section, lazy-load panel riwayat, budget < 1 detik (NFR-01/02). |
| R5 | Perubahan data oleh role tidak berwenang. | RBAC ketat (BR-011/012); audit log. |
| R6 | Autofill menimpa input user yang sudah diubah. | NFR-08: autofill hanya saat load; hormati perubahan manual. |

## 17. Asumsi
- [ASUMSI] Mekanisme checkpoint tri-state (As. Perawat/As. Dokter) & event ke Dashboard mengikuti kontrak yang sama dengan PRD Dashboard Pelayanan RJ.
- [ASUMSI] Skrining TB merupakan sub-form dalam form asesmen (bukan modul terpisah), sesuai penempatannya di `Asesmen_Rawat_Jalan.xlsx`.
- [ASUMSI] Diagnosis & Rencana Tindakan Keperawatan bersumber dari Master Data Diagnosa & Tindakan Keperawatan (NANDA/SDKI + NIC/SIKI) sesuai modul master yang sudah ada.
- [ASUMSI] Field "Status Pulang" pada planning dokter memakai enam disposisi yang sama dengan Modal Status Keluar Dashboard.
- [ASUMSI] Audit trail perubahan asesmen mengikuti praktik EMR standar (aktor, timestamp, before/after).

## 18. Pertanyaan Terbuka
- [PERLU KONFIRMASI] Kode dokumen final untuk PRD ini (usulan: PRD-P-EMR-RJ-ASM).
- [PERLU KONFIRMASI] Batas kepemilikan aksi disposisi keluar: apakah "Status Pulang" di planning dokter meng-set Status Tindak Lanjut Dashboard, atau keduanya dikelola terpisah?
- [PERLU KONFIRMASI] Detail field lengkap form **Hemodialisa, Rehab Medik, Psikologi** serta status poli "Konsulan only" (Anestesi) & "Tindakan only" (Akupuntur) dalam lingkup asesmen ini.
- [PERLU KONFIRMASI] Daftar unit pengecualian Skrining TB — apakah pasti hanya Hemodialisa, Fisioterapi, Terapi Wicara, Terapi Okupasi, Psikologi (perlu selaras dengan sheet Mapping)?
- [PERLU KONFIRMASI] Status integrasi SEP (Live vs Mock) pada rilis Fase 1.
- [PERLU KONFIRMASI] Isi konkret Fase 2 (Nice to Have) — kosong pada sumber.
- [PERLU KONFIRMASI] Aturan penentuan kategori usia Anak vs Dewasa untuk Skrining TB & Risiko Jatuh (ambang usia).

## 19. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 (Draft awal) | 29 Juni 2026 | Team Product (PIC: Fafa) | Draft awal PRD Asesmen Rawat Jalan (overview, scope, business process, user stories, related feature). |
| 1.0 — konversi generator | 1 Juli 2026 | Team Product | Konversi ke format Generator Neurovi v2: penambahan BR/FR/US berkode & ter-trace, State Machine, Data Requirements per form (Skrining TB, keperawatan & dokter General + variasi per poli), NFR, Integrasi & Dependency, Roadmap, Risk, Asumsi & Pertanyaan Terbuka. Diselaraskan dengan BPMN D6 dan `Asesmen_Rawat_Jalan.xlsx`. |

---
> **Catatan Penutup:** Dokumen ini adalah konversi format generator dari PRD Asesmen Rawat Jalan v1.0 (Draft awal). Seluruh substansi sumber dipertahankan; bagian yang belum ditentukan ditandai `[PERLU KONFIRMASI]` dan asumsi berdasar sumber ditandai `[ASUMSI]`. Prasyarat go-live utama: ketersediaan Master Diagnosa/Tindakan Keperawatan & ICD, integrasi checkpoint Dashboard, serta PRD Konsul/Rujuk Internal (Form Konsulan) untuk alur rujukan internal.
