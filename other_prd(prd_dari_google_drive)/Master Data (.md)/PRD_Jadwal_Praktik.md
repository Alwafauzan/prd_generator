# Product Requirement Document (PRD) — Jadwal Praktik

## 1. Metadata Dokumen
* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer, Tamtech International (Signature, Date)
* **Related Documents**: PRD Jadwal Praktik.docx (PIC: Nur Fitri Febriani); Spesifikasi API HFIS BPJS (endpoint `updatejadwaldokter`); Regulasi cuti RI — PP No. 11 Tahun 2017 jo. PP No. 17 Tahun 2020 (Manajemen PNS) & UU No. 13 Tahun 2003 jo. UU No. 6 Tahun 2023 (Cipta Kerja); BPMN: belum tersedia untuk modul ini (analogi dari `g-service-internal-consult`, `g-service-internal-referral`, `g-admisi-inpatient-registration`); PRD terkait — A2 Master Data Staf, A3 Master Data Unit, A19 Master Data Instalasi, G6 Integrasi Third-Party BPJS, G16 Ubah Kuota (PRD terpisah), G17 Pengaturan Antrian (PRD terpisah)
* **Document Version**: 17 Juni 2026 — 1.0 (Draft awal Jadwal Praktik, PIC: Nur Fitri Febriani); 29 Juni 2026 — 1.1 (Penyelarasan dengan iterasi pengembangan G15: penyesuaian field kanonik, kebijakan backdate, booking terdampak display-only, enum cuti per regulasi RI, Kode BPJS input manual, scope G16/G17 dipisah, Phase 3 Notifikasi keluar dari modul ini)

## 2. Overview & Background
* **Overview/Brief Summary**: Modul **Jadwal Praktik Tenaga Medis** (kode fitur **G15**, cluster **Core Integration**) adalah pengelolaan jadwal praktik dokter dan tenaga kesehatan non-dokter (ahli gizi, psikolog, fisioterapis, terapis wicara, terapis okupasi) yang menjadi **sumber kebenaran tunggal (single source of truth)** mengenai: kapan setiap tenaga medis dapat menerima pasien (hari + sesi/jam), di poli/unit layanan mana, di ruang mana (ruang praktik reguler & override harian), dengan kuota berapa (terpisah JKN & Non JKN, dijumlah otomatis jadi Kuota Total), dan dengan kode/prefix antrian apa. Fokus G15 mencakup pengaturan jadwal dasar plus perubahan jadwal: input libur/cuti tenaga medis (selaras regulasi RI), re-schedule (pemindahan sesi praktik), serta scheduled change (perubahan jadwal default berlaku pada tanggal efektif di masa depan tanpa mengganggu booking existing). Master data ini menjadi fondasi bagi modul Pendaftaran Rawat Jalan, Antrian, dan integrasi BPJS (HFIS / Antrol).
* **Business Process (As-Is vs To-Be)**:
    * **As-Is**: Jadwal praktik tenaga medis dikelola manual melalui papan jadwal, Excel, atau aplikasi pendaftaran lama yang tidak terintegrasi penuh dengan SIMRS. Akibatnya: konflik penggunaan ruang baru terdeteksi saat hari pelayanan berjalan; pemisahan kuota JKN dan Non JKN dilakukan manual sehingga rawan kuota JKN ke Antrol melebihi kuota HFIS; libur dadakan sering tidak sinkron dengan modul pendaftaran sehingga pasien terlanjur booking; jadwal di kanal eksternal (Mobile JKN/Antrol) tidak selalu sinkron dengan kondisi riil RS.
    * **To-Be**: Jadwal praktik pelayanan rawat jalan dikelola terpusat di Master Data Jadwal Praktik (G15) sebagai single source of truth. Perbaikan validasi konflik ruang secara otomatis berbasis final-state pada satu payload perubahan; simpan via DB transaction (all-or-nothing) untuk menghindari circular dependency. Kuota JKN dan Non JKN diatur per sesi praktik dan tervalidasi terhadap kuota total (fondasi; kebijakan detail di G16). Libur dan re-schedule dapat diinput sekali di modul ini dan langsung memblokir/menyesuaikan slot pendaftaran; booking terdampak ditampilkan display-only sebagai informasi (BR-05). Jenis cuti difilter sesuai status kepegawaian (ASN vs non-ASN) per regulasi RI (BR-12); kategori operasional non-cuti tetap tersedia (Tugas Luar/Diklat/Libur Operasional RS). Backdate untuk pencatatan libur susulan diizinkan dan ditandai di audit trail (BR-09). Scheduled Change dengan effective date memungkinkan perubahan jadwal tanpa mengganggu booking existing; sistem otomatis swap versi pada effective date. Jadwal praktik dokter dapat di-push ke HFIS BPJS melalui endpoint `updatejadwaldokter` (Phase 2), dengan status approval ter-track di Dashboard.

## 3. Goals & Metrics
| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1  | Kelengkapan data jadwal | 100% tenaga medis aktif yang melayani pasien rawat jalan memiliki minimal 1 jadwal praktik aktif. |
| 2  | Akurasi deteksi konflik ruang | 0 kasus dua tenaga medis terdaftar pada ruang & waktu yang sama tanpa flag Multi-Poli yang valid. |
| 3  | Konsistensi kuota | Penjumlahan Kuota JKN + Kuota Non JKN selalu sama dengan Kuota Total pada setiap sesi praktik. |
| 4  | Waktu input jadwal & libur | Input libur 1 tenaga medis ≤ 1 menit; jadwal mingguan standar ≤ 5 menit per tenaga medis. |
| 5  | Refleksi libur real-time | Perubahan jadwal (libur/re-schedule) berlaku di modul Pendaftaran/Antrian < 5 detik (berbagi database). |
| 6  | Akurasi swap versi scheduled change | 100% scheduled change dengan status `scheduled` ter-swap otomatis pada effective date (v_n → archived, v_(n+1) → active) tanpa intervensi manual. |
| 7  | Sinkronisasi HFIS BPJS *(Phase 2)* | 100% jadwal dokter dengan Kode BPJS terisi tersinkron ke HFIS, atau berstatus `Menunggu/Gagal` dengan log retry yang dapat ditelusuri. |
| 8  | Kepatuhan regulasi cuti | 100% input libur menggunakan jenis cuti yang valid sesuai status kepegawaian tenaga medis (BR-12). |
| 9  | Auditability backdate | 100% input libur backdate ditandai sebagai *pencatatan susulan* di audit trail (BR-09). |

## 4. Scope Definition & Phasing
| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| Dashboard Jadwal Praktik | Daftar jadwal (list) + pencarian & filter (unit, tenaga medis, hari, status aktif/libur), sorting per kolom, pagination. | - |
| Pendaftaran Jadwal Praktik | CRUD jadwal praktik baru untuk dokter & tenaga kesehatan non-dokter (tenaga medis, unit, instalasi, hari, sesi tunggal/ganda, jam, ruang reguler, kuota JKN & Non JKN, prefix antrian, flag Multi-Poli, jenis pelayanan, kode BPJS). | - |
| Pengaturan Sesi & Ruang | Pengaturan sesi praktik tunggal & ganda (>1 sesi dalam satu hari), penetapan ruang praktik reguler dan override ruang harian, deteksi konflik penggunaan ruang (final-state validation). | - |
| Pengaturan Kuota & Antrian | Pengaturan kuota pasien terpisah JKN dan Non JKN (Kuota Total = otomatis) sebagai fondasi data; pengaturan kode/prefix antrian pendaftaran per tenaga medis sebagai fondasi data. | - |
| Input Libur/Cuti | Input libur/cuti tenaga medis (jenis libur mengacu regulasi RI, BR-12) dan re-schedule jadwal praktik; menampilkan booking/pendaftaran existing yang terdampak saat input libur (display-only); input libur backdate diizinkan. | - |
| Scheduled Change | Perubahan jadwal dengan tanggal efektif di masa depan; versi jadwal lama tetap berlaku untuk pendaftaran existing; auto-swap pada effective date. | - |
| Status Jadwal & Audit Trail | Pengelolaan status jadwal (aktif/nonaktif), termasuk auto-nonaktif jika tenaga medis di Master Data Staf dinonaktifkan; audit trail perubahan jadwal praktik. | - |
| Integrasi HFIS BPJS | - | Integrasi Update Jadwal Dokter ke HFIS BPJS (endpoint `updatejadwaldokter`) dengan retry/antrian dan status sinkronisasi per jadwal. |

**Out of Scope**: Master Data Staf (CRUD tenaga medis, NIK, Kode BPJS, status aktif) — sumber data, dikelola di modul A2 Master Data Staf; Master Unit/Poli, Ruang, Bangsal, Instalasi — dikelola di Control Panel / Master Data (A3, A19); Proses pendaftaran pasien & pembuatan nomor antrian aktual — modul Pendaftaran Rawat Jalan & G17 Pengaturan Antrian (PRD terpisah); Logika besaran/kebijakan kuota detail — G16 Ubah Kuota (PRD terpisah); Tindak lanjut booking pasien terdampak libur (notifikasi SMS/WA/in-app/email, re-schedule otomatis pasien) — bukan di G15; bila ada peningkatan akan dibuat di modul terpisah. Di G15 cukup ditampilkan sebagai informasi (display-only); Matriks role/RBAC detail — [PERLU KONFIRMASI] belum didetailkan pada iterasi ini; Penghitungan tarif/biaya konsultasi — modul Billing (G1–G4) & Paket Tarif (G18); Sinkronisasi ke SATUSEHAT (G23–G27) — bukan target modul ini.

## 5. Related Features
* **A2 Master Data Staf**: Lookup `tenaga_medis_id` / `dokter_id`, `jenis_profesi`, **status_aktif** (gold standard, BR-04), **Kode BPJS**, dan **status kepegawaian (ASN/non-ASN)** untuk filter jenis cuti (BR-12).
* **A3 Master Data Unit**: Lookup field kanonik `unit` (Poli/Unit Layanan) untuk jadwal.
* **A19 Master Data Instalasi**: Lookup `instalasi_id` (Instalasi Penanggung Jawab).
* **Master Data Ruang**: Lookup `ruang_reguler_id` & ruang override; deteksi konflik (BR-01/BR-02).
* **G6 Integrasi Third-Party BPJS**: Berbagi kredensial BPJS (`cons-id`, `secret-key`, `user-key`) untuk panggilan HFIS.
* **G16 Ubah Kuota (PRD terpisah)**: Berbagi entitas kuota per sesi (kebijakan/besaran kuota detail dikelola di sana).
* **G17 Pengaturan Antrian (PRD terpisah)**: Konsumen `prefix_antrian` untuk generate nomor antrian aktual.
* **Pendaftaran Rawat Jalan**: Konsumen utama slot/kuota/ruang/status libur; menjadi sumber **booking terdampak** (display-only) saat input libur.
* **Antrian (Loket, Poliklinik, Antrol, MJKN)**: Konsumen prefix kode antrian dan ruang per sesi.
* **Mobile JKN / Antrol**: Kanal eksternal turunan HFIS; konsistensi dijaga via sync Phase 2.

## 6. Business Process & User Stories
* **State Machine Table**:
| Status | Deskripsi | Efek Stok | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| Aktif | Jadwal praktik aktif dan tersedia untuk pendaftaran pasien | Slot tersedia untuk pendaftaran | → Nonaktif (manual), → Libur (input libur), → Scheduled (scheduled change) | - |
| Nonaktif | Jadwal praktik dinonaktifkan secara manual atau otomatis (staf nonaktif) | Slot tidak tersedia untuk pendaftaran | → Aktif (manual), → Aktif (otomatis jika staf diaktifkan kembali) | - |
| Libur | Tenaga medis berada dalam periode libur/cuti | Slot tidak tersedia untuk pendaftaran pada rentang tanggal libur | → Aktif (setelah periode libur berakhir), → Nonaktif (manual) | - |
| Scheduled | Versi jadwal baru dengan tanggal efektif di masa depan | Belum berlaku; versi lama tetap aktif | → Aktif (otomatis pada effective date), → Cancelled (manual) | - |
| Archived | Versi jadwal lama yang sudah digantikan versi baru | Tidak berlaku untuk pendaftaran baru | - | - |
| Cancelled | Scheduled change yang dibatalkan sebelum effective date | Tidak pernah berlaku | - | - |

* **User Stories Utama**:
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin meng-input libur/cuti seorang tenaga medis untuk rentang tanggal tertentu, agar slot pada tanggal tersebut otomatis tertutup di Pendaftaran & Antrian.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin melihat daftar booking existing yang terdampak (display-only) sebelum menetapkan libur, agar saya tahu dampaknya — tindak lanjut pasien dilakukan di luar modul ini.
    * Sebagai **Petugas Pendaftaran**, saya ingin me-re-schedule sesi praktik ke hari/jam/ruang lain, agar jadwal mencerminkan kondisi riil.
    * Sebagai **Petugas Pendaftaran**, saya ingin sistem mendeteksi konflik ruang otomatis saat menyimpan, agar tidak ada 2 dokter di ruang sama.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin menukar beberapa ruang sekaligus tanpa terkunci validasi, agar pengaturan ruang fleksibel.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin menetapkan perubahan jadwal dengan tanggal efektif di masa depan, agar booking pasien existing tidak terganggu.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin mengubah jadwal pada tanggal spesifik seorang tenaga medis (hari/jam/ruang/kuota), tanpa mengubah jadwal di hari lain.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin melakukan pertukaran jadwal antar dua atau lebih tenaga medis secara bersamaan.
    * Sebagai **Koordinator Poli**, saya ingin menandai tenaga medis Multi-Poli, agar ia dapat praktik di >1 poli pada waktu bersamaan tanpa dianggap konflik.
    * Sebagai **Admin Master Staf**, saya ingin jadwal aktif otomatis nonaktif saat staf dinonaktifkan, agar tidak ada *jadwal hantu*.
    * Sebagai **Manajemen/Auditor**, saya ingin melihat audit trail perubahan jadwal, agar setiap perubahan dapat ditelusuri (termasuk penanda pencatatan susulan).
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin mencari & memfilter daftar jadwal (per unit, tenaga medis, hari, status), agar cepat menemukan jadwal yang akan diubah.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin memilih jenis cuti yang sesuai regulasi RI saat input libur, agar pencatatan libur tenaga medis sah dan tertib administrasi.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin mencatat libur susulan (backdate) ketika dokter tidak hadir di tanggal yang sudah lewat, agar data jadwal tetap akurat secara historis.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin meng-override ruang harian pada tanggal tertentu tanpa mengubah ruang reguler, karena realita harian kadang berubah.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin menambahkan jadwal praktik baru untuk dokter & tenaga kesehatan non-dokter, lengkap dengan sesi/ruang/kuota/prefix antrian.
    * Sebagai **Penanggung Jawab Jadwal**, saya ingin menonaktifkan jadwal secara manual untuk kondisi khusus.
    * Sebagai **Verifikator/Operator BPJS**, saya ingin perubahan jadwal dokter (Kode BPJS terisi) otomatis tersinkron ke HFIS, agar tidak update dua kali.
    * Sebagai **Verifikator/Operator BPJS**, saya ingin melihat status sinkronisasi HFIS per jadwal (tersinkron/gagal/menunggu) beserta waktu sinkron terakhir, agar saya tahu mana yang perlu ditindaklanjuti.

## 7. Functional Requirements
### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard Jadwal Praktik**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin melihat daftar jadwal praktik dengan pencarian & filter, agar cepat menemukan jadwal yang akan diubah.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan menu Jadwal Praktik dengan daftar jadwal (list) + pencarian & filter (unit, tenaga medis, hari, status aktif/libur), sorting per kolom, pagination.
    * **AC 2**: Kolom yang ditampilkan: Tenaga Medis, Spesialisasi/Sub Spesialisasi, Jenis Profesi, Unit/Poli, Jam Praktik, Ruang Praktik, Kuota (JKN/Non JKN/Total), Status, Sync HFIS (Phase 2).
    * **AC 3**: Header Actions: Tombol + Tambah Jadwal, Tombol Filter (badge jumlah filter aktif), Kolom Pencarian, Pagination.

**Fitur: Pendaftaran Jadwal Praktik**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin menambahkan jadwal praktik baru untuk dokter & tenaga kesehatan non-dokter, lengkap dengan sesi/ruang/kuota/prefix antrian.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem dapat membuat jadwal praktik (tenaga medis, unit, instalasi, hari, sesi tunggal/ganda, jam, ruang reguler, kuota JKN & Non JKN, prefix antrian, flag Multi-Poli, jenis pelayanan, kode BPJS).
    * **AC 2**: Sistem menghitung Kuota Total = Kuota JKN + Kuota Non JKN otomatis (read-only) dan memvalidasi kuota non-negatif.
    * **AC 3**: Sesi ganda dalam satu hari tidak boleh saling tumpang tindih jam untuk tenaga medis yang sama.
    * **AC 4**: Status jadwal selalu diset AKTIF oleh sistem pada saat create. Pengelolaan aktif/nonaktif dilakukan di level Dashboard (toggle).

**Fitur: Input Libur/Cuti**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin meng-input libur/cuti seorang tenaga medis untuk rentang tanggal tertentu, agar slot pada tanggal tersebut otomatis tertutup di Pendaftaran & Antrian.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan form Input Libur/Cuti (pilih tenaga medis, jenis cuti sesuai regulasi RI, rentang tanggal — termasuk backdate, keterangan) dan menonaktifkan slot terdampak.
    * **AC 2**: Sebelum menyimpan libur, sistem menampilkan booking existing yang terdampak pada rentang tanggal secara display-only (informasi). Sistem tidak memblokir penyimpanan dan tidak melakukan tindak lanjut otomatis ke pasien pada G15.
    * **AC 3**: Sistem menyediakan daftar pilihan jenis libur/cuti yang difilter sesuai status kepegawaian tenaga medis (ASN vs non-ASN) sebagaimana diatur BR-12.
    * **AC 4**: Sistem mengizinkan input tanggal libur backdate dan memvalidasi tanggal_selesai ≥ tanggal_mulai.
    * **AC 5**: Input libur backdate ditandai otomatis sebagai pencatatan susulan di audit trail (is_backdate = true).

**Fitur: Edit Jadwal Spesifik Tanggal**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin mengubah jadwal pada tanggal spesifik seorang tenaga medis (hari/jam/ruang/kuota), tanpa mengubah jadwal di hari lain.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan fitur untuk mengubah data jadwal pada tanggal spesifik (hari/jam/ruang/kuota JKN & Non JKN) tanpa memengaruhi jadwal di hari lain.
    * **AC 2**: Sistem menjalankan deteksi konflik ruang otomatis berbasis final-state atas satu payload perubahan; mengizinkan jika Multi-Poli valid; simpan via DB transaction (all-or-nothing).
    * **AC 3**: Perubahan dicatat di audit trail (before/after).

**Fitur: Re-schedule Sesi Praktik**
* **User Story**: Sebagai **Petugas Pendaftaran**, saya ingin me-re-schedule sesi praktik ke hari/jam/ruang lain, agar jadwal mencerminkan kondisi riil.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan Re-schedule sesi (ubah hari/jam/ruang) dan menjalankan deteksi konflik ruang.
    * **AC 2**: Sistem menjalankan deteksi konflik ruang otomatis berbasis final-state atas satu payload perubahan; mengizinkan jika Multi-Poli valid; simpan via DB transaction (all-or-nothing).

**Fitur: Tukar Jadwal Antar Tenaga Medis**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin melakukan pertukaran jadwal antar dua atau lebih tenaga medis secara bersamaan.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan fitur untuk menukar jadwal antar dua atau lebih tenaga medis (termasuk hari, jam, ruang, dan kuota).
    * **AC 2**: Sistem menjalankan deteksi konflik ruang otomatis berbasis final-state atas satu payload perubahan; mengizinkan jika Multi-Poli valid; simpan via DB transaction (all-or-nothing).
    * **AC 3**: Sistem mencatat audit trail untuk setiap pertukaran jadwal (before/after untuk setiap tenaga medis yang terlibat).

**Fitur: Scheduled Change**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin menetapkan perubahan jadwal dengan tanggal efektif di masa depan, agar booking pasien existing tidak terganggu.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem mendukung scheduled change: simpan versi jadwal baru dengan tanggal efektif; versi lama tetap berlaku untuk pendaftaran existing s/d H-1 efektif; auto-swap pada effective_date.
    * **AC 2**: Pada effective_date, sistem otomatis swap: versi lama → archived, versi baru → active.

**Fitur: Override Ruang Harian**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin meng-override ruang harian pada tanggal tertentu tanpa mengubah ruang reguler, karena realita harian kadang berubah.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem mendukung override ruang harian (ruang berbeda dari ruang reguler pada tanggal tertentu) tanpa mengubah ruang reguler.
    * **AC 2**: Tanggal override divalidasi konflik ruang.

**Fitur: Auto-Nonaktif Jadwal**
* **User Story**: Sebagai **Admin Master Staf**, saya ingin jadwal aktif otomatis nonaktif saat staf dinonaktifkan, agar tidak ada *jadwal hantu*.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem otomatis menonaktifkan seluruh jadwal aktif ketika tenaga medis di Master Staf di-nonaktif-kan (event-driven).

**Fitur: Toggle Status Libur per Jadwal Spesifik**
* **User Story**: Sebagai **Penanggung Jawab Jadwal**, saya ingin mengubah status jadwal spesifik (per hari/tanggal) dari Aktif menjadi Libur, dan sebaliknya dari Libur menjadi Aktif.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan fitur untuk mengubah status jadwal spesifik (per hari/tanggal) dari Aktif menjadi Libur.
    * **AC 2**: Sistem menyediakan fitur untuk mengubah status jadwal spesifik (per hari/tanggal) dari Libur menjadi Aktif.
    * **AC 3**: Saat mengubah dari Aktif ke Libur, sistem mengecek dan menampilkan booking existing yang terdampak sebagai informasi (display-only).
    * **AC 4**: Perubahan status dicatat di audit trail.  

**Fitur: Audit Trail**
* **User Story**: Sebagai **Manajemen/Auditor**, saya ingin melihat audit trail perubahan jadwal, agar setiap perubahan dapat ditelusuri (termasuk penanda pencatatan susulan).
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem mencatat audit trail (user, timestamp, before/after) untuk setiap operasi jadwal, termasuk penandaan pencatatan susulan untuk input backdate.
    * **AC 2**: Audit trail bersifat immutable (tidak dapat diedit/dihapus).

**Fitur: Integrasi HFIS BPJS**
* **User Story**: Sebagai **Verifikator/Operator BPJS**, saya ingin perubahan jadwal dokter (Kode BPJS terisi) otomatis tersinkron ke HFIS, agar tidak update dua kali.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Sistem mengirim perubahan jadwal ke HFIS `updatejadwaldokter` untuk Dokter dengan Kode BPJS terisi, dengan mekanisme retry/antrian bila gagal & log hasil sinkron.
    * **AC 2**: Sistem menampilkan status sinkronisasi HFIS per jadwal (Tersinkron/Gagal/Menunggu) beserta waktu sinkron terakhir di Dashboard.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Tenaga Medis | Dropdown (lookup) | Required, dari master Staf (A2), status_aktif = true | "Tenaga Medis wajib diisi" | "Pilih tenaga medis dari daftar staf aktif" |
  | Jenis Profesi | Dropdown / autofill | Required, enum: Dokter / Ahli Gizi / Psikolog / Fisioterapis / Terapis Wicara / Terapis Okupasi | "Jenis Profesi wajib diisi" | "Menentukan eligibilitas HFIS" |
  | Spesialisasi | Dropdown (lookup) | Required, dari master Spesialisasi dan Subspesialisasi (A23) | "Spesialisasi wajib diisi" | "Pilih spesialisasi tenaga medis" |
  | Subspesialisasi | Dropdown (lookup) | Required, dari master Spesialisasi dan Subspesialisasi (A23) | "Subspesialisasi wajib diisi" | "Pilih subspesialisasi tenaga medis" |
  | Unit/Poli | Dropdown (lookup) | Required, dari master Unit (A3) | "Unit/Poli wajib diisi" | "Pilih unit layanan" |
  | Instalasi Penanggung Jawab | Dropdown (lookup) | Optional, dari master Instalasi (A19) | - | "Pilih instalasi penanggung jawab" |
  | Multi-Poli | Boolean | Required, true / false, default false | - | "Jika true, tenaga medis dapat praktik di >1 poli pada waktu bersamaan" |
  | Kode BPJS | Text | Optional, input manual normal | - | "Wajib untuk Dokter bila ingin sync HFIS (Phase 2)" |
  | Hari Praktik | Dropdown / multi-select | Required, enum: Senin–Minggu | "Hari Praktik wajib diisi" | "Bisa > 1 hari" |
  | Nomor Sesi | Number | Required, ≥ 1; sesi ganda diperbolehkan | "Nomor Sesi wajib diisi dan minimal 1" | "Sesi ganda diperbolehkan" |
  | Jam Mulai | Time | Required, format HH:mm | "Jam Mulai wajib diisi" | "Format HH:mm" |
  | Jam Selesai | Time | Required, format HH:mm, > jam_mulai | "Jam Selesai wajib diisi dan harus setelah jam mulai" | "Format HH:mm" |
  | Ruang Praktik (Reguler) | Dropdown (lookup) | Required, dari master Ruang | "Ruang Praktik wajib diisi" | "Dicek konflik final-state" |
  | Kuota JKN | Number | Required, ≥ 0; ≤ kuota HFIS (Phase 2) | "Kuota JKN wajib diisi dan tidak boleh negatif" | "Kebijakan besaran detail di G16" |
  | Kuota Non JKN | Number | Required, ≥ 0 | "Kuota Non JKN wajib diisi dan tidak boleh negatif" | "Kebijakan besaran detail di G16" |
  | Kuota Total | Number (auto) | Auto-calculate = kuota_jkn + kuota_non_jkn | - | "Read-only" |
  | Kode/Prefix Antrian | Text | Required, maks 5 char, alfanumerik | "Prefix Antrian wajib diisi, maksimal 5 karakter" | "Dikonsumsi G17 untuk generate nomor antrian aktual" |
  | Jenis Pelayanan | Dropdown | Required, enum (Rawat Jalan default) | "Jenis Pelayanan wajib diisi" | "Default Rawat Jalan" |
  | Status Aktif | Boolean | Required, aktif / nonaktif, default aktif | - | "Ikut auto-nonaktif jika staf nonaktif" |
  | Jenis Libur/Cuti | Dropdown | Required, enum mengacu BR-12 (regulasi RI), difilter per status kepegawaian | "Jenis Libur/Cuti wajib diisi" | "Terfilter sesuai status kepegawaian (ASN vs non-ASN)" |
  | Tanggal Mulai | Date | Required, boleh di masa lalu (backdate diizinkan) | "Tanggal Mulai wajib diisi" | "Boleh di masa lalu untuk pencatatan susulan" |
  | Tanggal Selesai | Date | Required, ≥ tanggal_mulai | "Tanggal Selesai wajib diisi dan tidak boleh sebelum Tanggal Mulai" | - |
  | Keterangan | Text | Optional, maks 255 char | - | "Maksimal 255 karakter" |
  | Tanggal Override | Date | Required, tanggal pelaksanaan override | "Tanggal Override wajib diisi" | "Override harian, tidak mengubah ruang reguler" |
  | Ruang Baru | Dropdown (lookup) | Required, master Ruang | "Ruang Baru wajib diisi" | "Dicek konflik final-state" |
  | Jam Mulai Baru | Time | Optional, format HH:mm | - | "Untuk re-schedule (opsional)" |
  | Jam Selesai Baru | Time | Optional, format HH:mm, > jam_mulai_baru | - | "Untuk re-schedule (opsional)" |
  | Alasan | Text | Optional, maks 255 char | - | "Masuk audit trail" |
  | Tanggal Efektif Mulai Berlaku | Date | Required, > hari ini | "Tanggal Efektif wajib diisi dan harus > hari ini" | "Versi lama berlaku s/d H-1" |
  | Payload Perubahan | Objek/array | Required, sesuai validasi masing-masing field | "Payload Perubahan wajib diisi" | "Dikirim 1 payload (BR-02)" |

## 8. Data & Technical Specifications
### 8.1 Database Schema Suggestion
* **Table Name**: `medical_staff_schedules`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `is_active`: Boolean (default true)
    * `medical_staff_id`: UUID (Foreign Key to staff table)
    * `unit_id`: UUID (Foreign Key to units table)
    * `installation_id`: UUID (Foreign Key to installations table)
    * `specialization_id`: UUID (Foreign Key to specializations table)
    * `sub_specialization_id`: UUID (Foreign Key to sub_specializations table)
    * `profession_type`: Enum (Dokter / Ahli Gizi / Psikolog / Fisioterapis / Terapis Wicara / Terapis Okupasi)
    * `service_type`: Enum (Rawat Jalan default)
    * `day_of_week`: Enum (Senin–Minggu)
    * `session_number`: Integer (≥ 1)
    * `start_time`: Time (HH:mm)
    * `end_time`: Time (HH:mm)
    * `regular_room_id`: UUID (Foreign Key to rooms table)
    * `quota_jkn`: Integer (≥ 0)
    * `quota_non_jkn`: Integer (≥ 0)
    * `quota_total`: Integer (auto-calculate = quota_jkn + quota_non_jkn)
    * `queue_prefix`: String (max 5 char, alfanumerik)
    * `is_multi_poli`: Boolean (default false)
    * `bpjs_code`: String (optional, input manual normal)
    * `status`: Enum (Aktif / Nonaktif / Libur / Scheduled / Archived / Cancelled)
    * `effective_date`: Date (untuk scheduled change)
    * `version_number`: Integer (auto-increment per schedule_id)
    * `version_status`: Enum (scheduled / active / archived / cancelled)
    * `parent_schedule_id`: UUID (reference to previous version)
    * `sync_status`: Enum (Tersinkron / Gagal / Menunggu)
    * `sync_last_at`: Datetime
    * `created_at`: Datetime
    * `updated_at`: Datetime
    * `created_by`: UUID (Foreign Key to users table)
    * `updated_by`: UUID (Foreign Key to users table)

* **Table Name**: `schedule_leaves`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `medical_staff_id`: UUID (Foreign Key to staff table)
    * `unit_id`: UUID (Foreign Key to units table, optional)
    * `leave_type`: Enum (mengacu BR-12)
    * `start_date`: Date
    * `end_date`: Date
    * `description`: Text (max 255 char)
    * `is_backdate`: Boolean (default false)
    * `created_at`: Datetime
    * `created_by`: UUID (Foreign Key to users table)

* **Table Name**: `schedule_room_overrides`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `schedule_session_id`: UUID (Foreign Key to schedule_sessions table)
    * `override_date`: Date
    * `new_room_id`: UUID (Foreign Key to rooms table)
    * `new_start_time`: Time (optional)
    * `new_end_time`: Time (optional)
    * `reason`: Text (max 255 char)
    * `created_at`: Datetime
    * `created_by`: UUID (Foreign Key to users table)

* **Table Name**: `schedule_audit_trails`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `entity_type`: String
    * `entity_id`: UUID
    * `action`: Enum (Buat / Ubah / Libur / Re-schedule / Override / Scheduled Change / Nonaktif / Sync HFIS)
    * `user_id`: UUID (Foreign Key to users table)
    * `timestamp`: Datetime
    * `before_value`: JSON
    * `after_value`: JSON
    * `is_backdate`: Boolean (default false)

### 8.2 API Endpoint Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/medical-staff-schedules` | List data jadwal praktik dengan filter & pagination |
| POST   | `/api/v1/medical-staff-schedules` | Create data jadwal praktik baru |
| GET    | `/api/v1/medical-staff-schedules/{id}` | Get detail jadwal praktik |
| PATCH  | `/api/v1/medical-staff-schedules/{id}` | Update data jadwal praktik |
| PATCH  | `/api/v1/medical-staff-schedules/{id}/toggle-active` | Toggle Active/Inactive jadwal |
| POST   | `/api/v1/medical-staff-schedules/{id}/schedule-change` | Create scheduled change dengan effective date |
| POST   | `/api/v1/schedule-leaves` | Create input libur/cuti |
| GET    | `/api/v1/schedule-leaves` | List data libur/cuti dengan filter |
| POST   | `/api/v1/schedule-room-overrides` | Create override ruang harian |
| PATCH  | `/api/v1/medical-staff-schedules/{id}/edit-specific-date` | Edit jadwal pada tanggal spesifik |
| POST   | `/api/v1/medical-staff-schedules/swap` | Tukar jadwal antar dua atau lebih tenaga medis |
| PATCH  | `/api/v1/medical-staff-schedules/{id}/toggle-holiday-status` | Toggle status libur per jadwal spesifik (Aktif ↔ Libur) |
| GET    | `/api/v1/schedule-audit-trails` | List audit trail dengan filter |
| POST   | `/api/v1/medical-staff-schedules/{id}/sync-hfis` | Manual trigger sync HFIS (Phase 2) |

### 8.3 Data & Business Rules
#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)
| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| tenaga_medis_id | Tenaga Medis | Dropdown (lookup) | Ya | dari master Staf (A2), status_aktif = true | lookup A2 | mencakup dokter & non-dokter; untuk dokter pakai dokter_id |
| jenis_profesi | Jenis Profesi | Dropdown / autofill | Ya | enum: Dokter / Ahli Gizi / Psikolog / Fisioterapis / Terapis Wicara / Terapis Okupasi | dari master Staf | menentukan eligibilitas HFIS (BR-08, BR-15) |
| spesialisasi | Spesialisasi | Dropdown (lookup) | Ya | dari master Spesialisasi dan Subspesialisasi (A23) | lookup A23 | field kanonik |
| subspesialisasi | Subspesialisasi | Dropdown (lookup) | Ya | dari master Spesialisasi dan Subspesialisasi (A23) | lookup A23 | field kanonik |
| unit | Unit/Poli | Dropdown (lookup) | Ya | dari master Unit (A3) | lookup A3 | field kanonik |
| instalasi_id | Instalasi Penanggung Jawab | Dropdown (lookup) | Tidak | dari master Instalasi (A19) | lookup A19 | field kanonik |
| flag_multi_poli | Multi-Poli | Boolean | Ya | true / false | default false | true → boleh ruang/waktu paralel valid (BR-13) |
| kode_bpjs | Kode BPJS (poli/dokter) | Text | Tidak | input manual normal (tanpa validasi format khusus); wajib untuk Dokter bila ingin sync HFIS (Phase 2) | manual | BR-08; input bebas oleh petugas; bisa juga di-input di Master Staf |
| hari | Hari Praktik | Dropdown / multi-select | Ya | enum: Senin–Minggu | manual | bisa > 1 hari |
| sesi_no | Nomor Sesi | Number | Ya | ≥ 1; sesi ganda diperbolehkan | manual | BR-11 anti-overlap |
| jam_mulai | Jam Mulai | Time | Ya | format HH:mm | manual | |
| jam_selesai | Jam Selesai | Time | Ya | format HH:mm, > jam_mulai | manual | BR-11 |
| ruang_reguler_id | Ruang Praktik (Reguler) | Dropdown (lookup) | Ya | dari master Ruang | lookup | dicek konflik final-state (BR-01, BR-02) |
| kuota_jkn | Kuota JKN | Number | Ya | ≥ 0; ≤ kuota HFIS (Phase 2, BR-07) | manual | kebijakan besaran detail di G16 |
| kuota_non_jkn | Kuota Non JKN | Number | Ya | ≥ 0 | manual | kebijakan besaran detail di G16 |
| kuota_total | Kuota Total | Number (auto) | Ya (auto) | = kuota_jkn + kuota_non_jkn | auto-hitung | read-only (BR-06) |
| prefix_antrian | Kode/Prefix Antrian | Text | Ya | maks 5 char, alfanumerik | manual | dikonsumsi G17 untuk generate nomor antrian aktual |
| jenis_pelayanan | Jenis Pelayanan | Dropdown | Ya | enum (Rawat Jalan default) | default Rawat Jalan | field kanonik |
| status_aktif | Status Aktif | Boolean | Ya | aktif / nonaktif | default aktif | field kanonik; ikut auto-nonaktif jika staf nonaktif (BR-04) |
| jenis_libur | Jenis Libur/Cuti | Dropdown | Ya | enum mengacu BR-12 (regulasi RI), difilter per status kepegawaian | enum (BR-12) | sumber dasar hukum: PP 11/2017 jo. PP 17/2020 (ASN); UU 13/2003 jo. UU 6/2023 (non-ASN) |
| tanggal_mulai | Tanggal Mulai | Date | Ya | boleh di masa lalu (backdate diizinkan, BR-09) | manual | input susulan otomatis ditandai di audit (is_backdate = true) |
| tanggal_selesai | Tanggal Selesai | Date | Ya | ≥ tanggal_mulai | manual | |
| keterangan | Keterangan | Text | Tidak | maks 255 char | manual | field kanonik |
| tanggal_override | Tanggal (Override) | Date | Ya | tanggal pelaksanaan override | manual | override harian (FR-007); tidak mengubah ruang reguler (BR-14) |
| ruang_baru_id | Ruang Baru | Dropdown (lookup) | Ya | master Ruang | lookup | dicek konflik final-state (BR-02) |
| jam_mulai_baru | Jam Mulai Baru | Time | Tidak | format HH:mm | manual | re-schedule (opsional) |
| jam_selesai_baru | Jam Selesai Baru | Time | Tidak | format HH:mm, > jam_mulai_baru | manual | re-schedule (opsional) |
| alasan | Alasan Perubahan | Text | Tidak | maks 255 char | manual | masuk audit trail |
| tanggal_efektif | Tanggal Efektif Mulai Berlaku | Date | Ya | > hari ini | manual | BR-03; versi lama berlaku s/d H-1 |
| payload_perubahan | Perubahan (sesi/ruang/kuota/antrian) | Objek/array | Ya | sesuai validasi masing-masing field di 8.3.1 | form | dikirim 1 payload (BR-02); simpan via DB transaction |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Tenaga Medis | jadwal.tenaga_medis_id → Staf.nama (A2) | text | filter, sort A–Z (default) | direct ke Detail Jadwal saat diklik |
| Spesialisasi / Sub Spesialisasi | Staf.spesialisasi / Staf.subspesialisasi (A23) | text | filter | Data: Master Data Spesialisasi / Sub Spesialisasi |
| Jenis Profesi | Staf.jenis_profesi | badge | filter | enum: Dokter / Ahli Gizi / Psikolog / Fisioterapis / Terapis Wicara / Terapis Okupasi |
| Unit/Poli | jadwal.unit → Unit.nama (A3) | text | filter | field kanonik |
| Jam Praktik (Hari dan Sesi termasuk) | jadwal.jam_mulai – jadwal.jam_selesai + jadwal.hari + jadwal.sesi_no | HH:mm – HH:mm | sort | |
| Ruang Praktik | jadwal.ruang_reguler_id → Ruang.nama | text | filter | tampil merah bila ada override harian aktif |
| Kuota (JKN / Non JKN / Total) | jadwal.kuota_jkn / kuota_non_jkn / kuota_total | angka format x / y / z | – | Total auto-calculate (BR-06) |
| Status | jadwal.status_aktif / status libur computed | badge (Aktif / Nonaktif / Libur) | filter | warna: hijau / abu / oranye |
| Sync HFIS | jadwal.sync_status (Phase 2) | badge (Tersinkron / Gagal / Menunggu) | filter | + tooltip waktu sync terakhir |

* **Business Rules**:
    * **BR-001**: Tidak boleh ada 2 tenaga medis menggunakan ruang yang sama pada waktu (hari+sesi/jam) yang sama, kecuali tenaga medis ber-flag Multi-Poli valid pada kedua sisi.
    * **BR-002**: Validasi konflik ruang memakai final-state: backend mengevaluasi seluruh perubahan dalam satu payload (array) — duplikat dicek setelah semua diterapkan, lalu disimpan via DB transaction (jika satu gagal, gagal semua). Frontend hanya memperingatkan bila ada ruang sama dipilih dua kali di layar yang sama.
    * **BR-003**: Perubahan jadwal default dengan tanggal efektif di masa depan tidak mengubah jadwal aktif saat ini; versi lama tetap berlaku untuk booking existing hingga H-1 tanggal efektif. Pada effective_date, sistem otomatis swap (versi lama → archived, versi baru → active).
    * **BR-004**: Jika tenaga medis di-nonaktif-kan pada Master Data Staf (A2, gold standard), seluruh jadwal aktifnya otomatis dinonaktifkan (event-driven).
    * **BR-005**: Saat input libur/cuti, sistem wajib mengecek & menampilkan booking/pendaftaran existing pada rentang tanggal terdampak sebagai informasi (display-only) sebelum konfirmasi. Petugas tetap dapat menyimpan libur; tindak lanjut pasien (notifikasi/re-schedule) bukan bagian G15 dan akan ditangani modul terpisah bila ada peningkatan.
    * **BR-006**: Kuota Total = Kuota JKN + Kuota Non JKN, dihitung otomatis (read-only). Kuota tidak boleh negatif. Kebijakan besaran kuota detail diatur di G16.
    * **BR-007**: Kuota JKN yang di-bridging ke Antrol/HFIS tidak boleh melebihi kuota JKN yang ditetapkan di HFIS.
    * **BR-008**: Integrasi HFIS (updatejadwaldokter) hanya berjalan untuk tenaga medis dengan Jenis Profesi = Dokter DAN Kode BPJS terisi pada Master Data Staf. Kode BPJS = input manual normal pada Master/Form (tanpa validasi format khusus pada iterasi ini).
    * **BR-009**: Backdate diizinkan: tanggal_mulai libur boleh berada di masa lalu untuk pencatatan susulan; sistem mencatat entri sebagai pencatatan susulan di audit trail (is_backdate = true). Tetap berlaku: tanggal_selesai ≥ tanggal_mulai.
    * **BR-010**: Setiap perubahan jadwal (buat/ubah/libur/re-schedule/nonaktif/scheduled change/override) wajib tercatat di audit trail (user, timestamp, before–after, dan tanda pencatatan susulan bila backdate). Log bersifat immutable (tidak dapat diedit/dihapus).
    * **BR-011**: Sesi ganda dalam satu hari tidak boleh saling tumpang tindih jam untuk tenaga medis yang sama. Maksimal jumlah sesi per hari mengikuti konfigurasi sistem.
    * **BR-012**: Jenis libur/cuti yang dapat dipilih mengacu pada regulasi RI sesuai status kepegawaian tenaga medis: untuk ASN/PNS mengikuti PP No. 11 Tahun 2017 jo. PP No. 17 Tahun 2020 (Cuti Tahunan, Cuti Besar, Cuti Sakit, Cuti Melahirkan, Cuti Karena Alasan Penting, Cuti Bersama, Cuti di Luar Tanggungan Negara); untuk non-ASN (pegawai swasta/BLUD kontrak) mengikuti UU No. 13 Tahun 2003 jo. UU No. 6 Tahun 2023 (Cipta Kerja) (Cuti Tahunan, Cuti Sakit, Cuti Melahirkan/Keguguran, Cuti Karena Alasan Penting, Istirahat Panjang). Selain kategori cuti, sistem juga menyediakan kategori operasional non-cuti yang tetap menutup slot: Tugas/Dinas Luar, Pendidikan/Pelatihan (Diklat), dan Libur Operasional RS.
    * **BR-013**: Flag Multi-Poli disimpan pada level jadwal praktik (per entri), bukan pada master data staf. Default false. Jika true, tenaga medis dapat memiliki ≥ 2 jadwal aktif pada hari & jam yang sama tanpa dianggap konflik.
    * **BR-014**: Override ruang harian hanya berlaku untuk tanggal terkait; tidak mengubah ruang reguler. Tanggal override divalidasi konflik ruang.
    * **BR-015**: Eligibilitas HFIS — Toggle/proses sinkronisasi HFIS hanya tersedia untuk jadwal Dokter dengan Kode BPJS terisi (BR-08). Bila Kode BPJS kosong, sinkronisasi tidak dijalankan.

## 9. Workflow / BPMN Interpretation
* **Skenario 1 — Input Libur/Cuti Tenaga Medis (fokus G15)**: Penanggung Jawab Jadwal membuka Dashboard Jadwal Praktik → pilih tenaga medis → buka form Input Libur/Cuti → pilih jenis libur/cuti dari dropdown (terfilter sesuai status kepegawaian tenaga medis per BR-12) → isi Tanggal Mulai dan Tanggal Selesai (Tanggal Mulai boleh di masa lalu untuk pencatatan susulan; BR-09) → sistem mengquery booking/pendaftaran existing yang terdampak pada rentang tanggal → tampilkan display-only sebagai informasi (BR-05) → klik Simpan → slot pendaftaran pada rentang tanggal otomatis tertutup; audit trail mencatat user, timestamp, dan tanda pencatatan susulan bila backdate.

* **Skenario 2 — Re-schedule Sesi Praktik**: Petugas Pendaftaran membuka Detail Jadwal → pilih sesi yang akan di-reschedule → isi Tanggal Override, Ruang Baru, opsional Jam Mulai/Selesai Baru, Alasan → sistem menjalankan deteksi konflik ruang final-state untuk tanggal & sesi terkait → klik Simpan → perubahan tersimpan via DB transaction; audit trail tercatat.

* **Skenario 3 — Scheduled Change (Effective Date di Masa Depan)**: Penanggung Jawab Jadwal membuka Detail Jadwal → klik Ubah Jadwal Mulai Tanggal → isi Tanggal Efektif Mulai Berlaku (> hari ini, BR-03) dan payload perubahan (sesi/ruang/kuota/antrian) → sistem menyimpan versi baru dengan status scheduled; versi lama tetap aktif untuk booking existing s/d H-1 effective date → pada effective_date, sistem otomatis swap: versi lama → archived, versi baru → active.

* **Skenario 4 — Edit Beberapa Ruang Sekaligus (anti circular dependency)**: Penanggung Jawab Jadwal mengubah ruang beberapa sesi sekaligus di layar → Frontend memperingatkan bila ada ruang sama dipilih dua kali di layar yang sama → klik Simpan → semua perubahan dikirim dalam satu payload (array) ke backend → Backend menerapkan validasi final-state ("apakah setelah semua perubahan ini diterapkan, ada ruang terduplikasi?") dan simpan via DB transaction (BR-02).

* **Skenario 5 — Edit Jadwal Spesifik Tanggal**: Penanggung Jawab Jadwal membuka Detail Jadwal → pilih tanggal spesifik yang ingin diubah → ubah data (hari/jam/ruang/kuota JKN & Non JKN) → sistem menjalankan deteksi konflik ruang final-state → klik Simpan → perubahan tersimpan via DB transaction; audit trail tercatat (before/after).

* **Skenario 6 — Auto-Nonaktif Karena Tenaga Medis Nonaktif (event-driven, BR-04)**: Pada Master Data Staf (A2), admin menonaktifkan tenaga medis → Sistem menerima event → seluruh jadwal aktif tenaga medis otomatis dinonaktifkan → Audit trail mencatat aksi dengan referensi event sumber.

* **Skenario 7 — Toggle Status Libur per Jadwal Spesifik**: Penanggung Jawab Jadwal membuka Detail Jadwal → pilih tanggal spesifik → klik toggle status (Aktif ↔ Libur) → jika berubah ke Libur, sistem mengecek dan menampilkan booking existing yang terdampak sebagai informasi (display-only) → klik Konfirmasi → status berubah; audit trail tercatat.

* **Skenario 8 — Tukar Jadwal Antar Tenaga Medis**: Penanggung Jawab Jadwal membuka menu Tukar Jadwal → pilih dua atau lebih tenaga medis yang ingin ditukar jadwalnya → sistem menampilkan jadwal masing-masing → user menentukan pertukaran (hari/jam/ruang/kuota) → sistem menjalankan deteksi konflik ruang final-state → klik Simpan → pertukaran tersimpan via DB transaction; audit trail tercatat (before/after untuk setiap tenaga medis).

* **Skenario 9 — Sinkronisasi ke HFIS BPJS (Phase 2)**: Setiap operasi buat/ubah/libur/re-schedule pada jadwal Dokter dengan Kode BPJS terisi memicu sinkronisasi → Sistem memanggil endpoint POST {BASE_URL}/{Service Name}/jadwaldokter/updatejadwaldokter dengan header & body sesuai kontrak BPJS → Jika sukses → status Tersinkron dengan timestamp. Jika gagal/timeout → simpan lokal, status Menunggu/Gagal, retry exponential backoff.

## 10. Non-Functional Requirements
| ID | Kategori | Requirement |
|---|---|---|
| **NFR-001** | Konsistensi/Integritas | Penyimpanan perubahan ruang massal & scheduled change wajib transaksional (DB transaction, all-or-nothing) untuk mencegah state parsial. *(BR-002)* |
| **NFR-002** | Performa | Perubahan jadwal (libur/re-schedule) berlaku di modul Pendaftaran/Antrian real-time (< 5 detik); pencarian/filter daftar jadwal ≤ 3 detik untuk dataset RS tipe C&D. [ASUMSI target] |
| **NFR-003** | Keandalan integrasi (RS C/D, internet tidak stabil) | Sync HFIS memakai antrian + retry (mis. exponential backoff) bila koneksi BPJS gagal; perubahan tetap tersimpan lokal & ditandai Menunggu. [ASUMSI] |
| **NFR-004** | Audit & Keamanan | Audit trail immutable (tidak bisa diedit/dihapus), minimal menyimpan user, timestamp, before/after, dan penanda pencatatan susulan; retensi sesuai kebijakan RS. [PERLU KONFIRMASI retensi] |
| **NFR-005** | Otorisasi (RBAC) | Hanya role berwenang yang boleh mengubah jadwal. [PERLU KONFIRMASI matriks role — belum didetailkan pada iterasi ini] |
| **NFR-006** | Usability | Form input libur 1 tenaga medis dapat diselesaikan < 1 menit; peringatan konflik ruang jelas & actionable; pilihan jenis cuti otomatis terfilter sesuai status kepegawaian. [ASUMSI] |
| **NFR-007** | Konkurensi | Cegah race condition saat 2 user mengubah jadwal/ruang tenaga medis sama (optimistic/pessimistic locking). [ASUMSI] |
| **NFR-008** | Ketersediaan | Modul jadwal harus dapat dioperasikan walau integrasi HFIS down (degradasi terkendali — sync menyusul); modul Pendaftaran/Antrian dapat membaca jadwal aktif via cache lokal saat modul Master Data dalam pemeliharaan. |
| **NFR-009** | Auditability data kuota | Perubahan kuota JKN/Non JKN tercatat agar selisih dengan HFIS dapat ditelusuri. |
| **NFR-010** | Kepatuhan regulasi | Daftar jenis cuti & aturan terkait mengikuti regulasi RI yang berlaku (PP 11/2017 jo. PP 17/2020; UU 13/2003 jo. UU 6/2023); bila regulasi berubah, daftar enum dapat dikonfigurasi tanpa mengubah kode (master data jenis cuti). [ASUMSI mekanisme konfigurasi] |

## 11. Integrasi Eksternal
### 11.1 HFIS BPJS — `updatejadwaldokter` *(Phase 2)*
* **Tujuan:** sinkronisasi jadwal praktik dokter SIMRS → HFIS agar tidak ada mismatch & user tidak update 2×.
* **Trigger:** setiap buat/ubah/libur/re-schedule jadwal **Dokter** yang **Kode BPJS terisi** (BR-08). Kode BPJS = input manual normal pada Master/Form (lihat 8.3.1).
* **Data yang dikirim (perkiraan):** kode poli BPJS, kode dokter BPJS, hari, jam mulai–selesai, kuota (JKN), kapasitas. [PERLU KONFIRMASI mapping field sesuai Spesifikasi API HFIS BPJS — diabaikan pada iterasi ini]
* **Aturan kuota:** `kuota_jkn` SIMRS ≤ kuota HFIS (BR-007).
* **Penanganan gagal:** simpan lokal + status `Menunggu/Gagal` + retry otomatis (NFR-003); tampilkan status sync (FR-017).
* **Keamanan:** kredensial BPJS (`cons-id`, `secret-key`, `user-key`) dikelola terpusat — berbagi dengan modul **G6 Integrasi Third-Party (BPJS)**. [PERLU KONFIRMASI sumber kredensial bersama]

### 11.2 Modul Internal SIMRS (konsumen jadwal — single source of truth)
* **Pendaftaran Rawat Jalan** — membaca slot, kuota (JKN/Non JKN), ruang, status libur; menjadi sumber **booking terdampak** (display-only) saat input libur (8.3.2, BR-05).
* **Antrian** *(G17 — PRD terpisah)* — membaca `prefix_antrian` & sesi untuk generate nomor antrian aktual.
* **Master Data Staf (A2)** — sumber `dokter_id` / `tenaga_medis_id`, `jenis_profesi`, **`status_aktif`** (gold standard, BR-04), **Kode BPJS**, dan **status kepegawaian (ASN / non-ASN)** untuk filter jenis cuti (BR-12).
* **Master Unit (A3) / Ruang / Instalasi (A19)** — sumber `unit`, `ruang_*_id`, `instalasi_id`.
* **Ubah Kuota**  — berbagi entitas kuota per sesi.

### 11.3 Kanal Eksternal (turunan HFIS)
* **Mobile JKN / Antrol** — menampilkan jadwal & kuota JKN yang bersumber dari HFIS; konsistensi dijaga via sync di 11.1.

> Catatan RS Tipe C & D: pertimbangkan **mode toleran offline** untuk operasi jadwal harian; sinkronisasi BPJS bersifat *eventual* (menyusul saat koneksi pulih). [ASUMSI]

## 12. Edge Cases & Mitigasi
| No | Case | Dampak | Mitigasi |
|---|---|---|---|
| 1 | Tenaga medis dinonaktifkan saat memiliki jadwal aktif & pasien terdaftar pada slot mendatang. | Pasien yang sudah terdaftar tidak dapat dilayani oleh tenaga medis tersebut. | Event-driven: jadwal otomatis dinonaktifkan saat staf nonaktif (BR-04). Booking terdampak tampil di modul Pendaftaran sebagai informasi; tindak lanjut pasien di luar G15. |
| 2 | Multi-Poli flag dimatikan saat ada jadwal overlap aktif yang bergantung. | Setelah flag mati, terdapat jadwal yang melanggar deteksi konflik ruang. | Sebelum mematikan flag, sistem memeriksa jadwal yang konflik. Jika ditemukan, mati flag tidak diizinkan sampai jadwal konflik diselesaikan (nonaktifkan/ubah ruang). |
| 3 | User mengubah beberapa ruang sekaligus, tetapi salah satu kombinasi mengakibatkan duplikat ruang di state akhir. | Tanpa final-state validation, user terkunci karena validasi per-ruang (circular dependency). | Final-state validation atas seluruh payload + DB transaction (all-or-nothing) (BR-002). |
| 4 | Libur backdate (Tanggal Mulai Libur < hari ini) untuk pencatatan susulan. | Sebelumnya: ditolak; pasien terlanjur booking di slot yang seharusnya tutup. | **Backdate diizinkan** (BR-009); entri ditandai `is_backdate = true` di audit trail; petugas dapat menindaklanjuti booking yang terlanjur masuk. |
| 5 | Petugas memilih jenis cuti yang tidak sesuai status kepegawaian (mis. "Cuti Besar" untuk pegawai non-ASN). | Pencatatan cuti tidak sah secara regulasi. | Dropdown `jenis_libur` **difilter otomatis** sesuai `status_kepegawaian` dari Master Staf (BR-12, FR-013). |
| 6 | Update jadwal dari SIMRS ke HFIS BPJS timeout/gagal *(Phase 2)*. | Status sinkronisasi tidak ter-update; jadwal SIMRS dan HFIS tidak sinkron. | Simpan lokal + status `Menunggu/Gagal`; retry exponential backoff (NFR-003); admin dapat retry manual; status visible di Dashboard (FR-017). |
| 7 | Override ruang harian ke ruang yang akan konflik dengan tenaga medis lain. | Bentrok ruang pada tanggal override. | Validasi konflik ruang dijalankan juga untuk override (FR-006). Jika konflik, override ditolak. |
| 8 | Effective date scheduled change jatuh pada periode libur/cuti tenaga medis yang sudah terdaftar. | Pada `effective_date`, dokter sedang libur sehingga jadwal baru belum bisa langsung dipakai untuk pendaftaran. | Sistem tetap mengaktifkan versi baru pada `effective_date` (auto-swap), namun pada tanggal libur slot pendaftaran tetap tidak tersedia mengikuti logic libur eksisting. Jadwal baru efektif digunakan setelah periode libur selesai. **Warning non-blocking** ditampilkan saat admin submit scheduled change. |
| 9 | Race condition: dua user mengubah jadwal/ruang tenaga medis yang sama hampir bersamaan. | Salah satu perubahan tertimpa tanpa peringatan. | Optimistic/pessimistic locking (NFR-007); audit trail mencatat siapa & kapan; perubahan terakhir dapat ditelusuri. |
| 10 | Booking terdampak banyak (mis. > 50 pasien) saat input libur 1 minggu. | Pengelola jadwal khawatir tindak lanjut pasien tidak tertangani. | G15 hanya menampilkan daftar (display-only) sebagai informasi; tindak lanjut pasien (notifikasi/re-schedule) di luar scope G15 (BR-05). Petugas dapat ekspor daftar booking untuk dihubungi manual. |

## 13. Change Log
| Kode | Item | Perubahan | Event |
|---|---|---|---|
| A1 | Inisialisasi PRD | Draft awal Jadwal Praktik mencakup 15 user story MVP dan 3 user story integrasi HFIS BPJS [**]. | 17–18 Juni 2026 |
| A2 | Perubahan Jadwal Berjadwal & Notifikasi Pasien | Penambahan user story Scheduled Change (P0), 2 section data requirement (Scheduled Change, Notifikasi Pasien), 3 validasi, dan 3 case untuk skenario perubahan jadwal dengan effective date di masa depan. | 18 Juni 2026 |
| A3 | Penyelarasan G15 (iterasi pengembangan) | (a) Field kanonik disesuaikan dengan PRD bersama (`unit`, `dokter_id`/`tenaga_medis_id`, `instalasi_id`, `jenis_pelayanan`); (b) `kode_bpjs` diubah jadi **input manual normal** (bukan autofill read-only); (c) penambahan field `instalasi_id`, `jenis_pelayanan`, `kode_bpjs`, `booking_terdampak`; (d) `jenis_libur` enum diselaraskan **regulasi RI** (PP 11/2017 jo. PP 17/2020 untuk ASN; UU 13/2003 jo. UU 6/2023 untuk non-ASN; + kategori operasional non-cuti); (e) **backdate libur diizinkan** (sebelumnya ditolak); (f) **booking terdampak = display-only** (Phase 3 Notifikasi Pasien dikeluarkan dari scope G15, akan ditangani modul terpisah); (g) **G16 Ubah Kuota & G17 Pengaturan Antrian** dipisah jadi PRD terpisah; (h) `prefix_antrian` maksimal **5 char** (sebelumnya 3); (i) Edge Cases #9 & #10 (notifikasi pasien) dihapus, digantikan case race condition & booking terdampak banyak. | 29 Juni 2026 |
| A4 | Restrukturisasi Format PRD | Penyesuaian format PRD sesuai template.md: penambahan State Machine Table, restrukturisasi Functional Requirements dengan format feature-based dan validation tables, penambahan Database Schema Suggestion, API Endpoint Recommendations, dan Workflow/BPMN Interpretation. | 30 Juni 2026 |
| A5 | Penambahan Fitur Baru (Edit Spesifik Tanggal, Tukar Jadwal, Toggle Libur) | Penambahan fitur Edit Jadwal Spesifik Tanggal (ubah jadwal per hari tanpa mengubah hari lain), Tukar Jadwal Antar Tenaga Medis (menukar jadwal 2+ tenaga medis), dan Toggle Status Libur per Jadwal Spesifik (Aktif ↔ Libur per hari/tanggal). Penambahan User Stories, Functional Requirements dengan Acceptance Criteria, Workflow/BPMN scenarios, dan API endpoints terkait. | 30 Juni 2026 |

## 14. Asumsi
* [ASUMSI] Alur As-Is/To-Be diturunkan dari pola validasi "Poli/Jadwal/Kuota tersedia" dan "Log Audit" pada BPMN `g-service-internal-consult`, `g-service-internal-referral`, dan `g-service-cpo-order` karena modul ini belum punya BPMN sendiri.
* [ASUMSI] Perubahan jadwal berlaku real-time (< 5 detik) ke modul Pendaftaran/Antrian karena berbagi database (single source of truth).
* [ASUMSI] Sinkronisasi HFIS bersifat *eventual* dengan retry, mengingat keterbatasan kestabilan internet RS Tipe C & D.
* [DIKONFIRMASI #4] Saat input libur, sistem hanya **MENAMPILKAN** booking existing terdampak (display-only); tindak lanjut pasien (notifikasi/re-schedule) tidak termasuk G15 dan akan ditangani modul terpisah bila ada peningkatan.
* [DIKONFIRMASI #1] Fitur Ubah Kuota (G16) dan Pengaturan Antrian (G17) dirilis sebagai PRD/modul terpisah; G15 menyiapkan entitas dasarnya (`kuota_jkn`, `kuota_non_jkn`, `kuota_total`, `prefix_antrian`).
* [DIKONFIRMASI #3] Input libur backdate (tanggal di masa lalu) diizinkan untuk pencatatan susulan; ditandai di audit trail (`is_backdate = true`).
* [DIKONFIRMASI #6] Jenis libur/cuti diselaraskan dengan regulasi RI: PP 11/2017 jo. PP 17/2020 untuk ASN; UU 13/2003 jo. UU 6/2023 (Cipta Kerja) untuk non-ASN; ditambah kategori operasional non-cuti (Tugas Luar/Diklat/Libur Operasional RS).
* [DIKONFIRMASI #8] Kode BPJS diisi sebagai input manual normal (tanpa validasi format khusus pada iterasi ini).
* [ASUMSI] Field `jenis_pelayanan` kanonik mendefinisikan 'Rawat Inap'; untuk Jadwal Praktik konteksnya **Rawat Jalan** — ditandai [PERLU KONFIRMASI] agar definisi bersama tetap dihormati.
* [ASUMSI] Sesi ganda tidak boleh tumpang tindih jam untuk tenaga medis yang sama (BR-11).
* [ASUMSI] Optimistic/pessimistic locking diterapkan untuk mencegah race condition perubahan jadwal oleh dua user (NFR-007).
* [ASUMSI] Sumber status kepegawaian (ASN/non-ASN) tersedia di Master Staf (A2) untuk filter jenis cuti (BR-12).

## 15. Pertanyaan Terbuka
* Mapping field tepat untuk endpoint HFIS `updatejadwaldokter` (nama field, format kode poli/dokter BPJS) — perlu Spesifikasi API HFIS BPJS. [DITUNDA per instruksi #2]
* Matriks role/RBAC: siapa boleh input libur, re-schedule, scheduled change, dan trigger sync HFIS? [DITUNDA per instruksi #5]
* Kebijakan retensi audit trail dan target *success-rate* sync HFIS yang resmi? [DITUNDA per instruksi #7]
* Sumber/atribut "status kepegawaian (ASN/non-ASN)" di Master Staf (A2) untuk memfilter daftar jenis cuti (BR-12) — perlu konfirmasi ketersediaan field.
* Apakah daftar jenis cuti perlu dikelola sebagai master data konfigurabel agar mudah diperbarui saat regulasi berubah? (NFR-010)
* Apakah maksimal jumlah sesi per hari per tenaga medis (BR-11) dapat dikonfigurasi per RS, atau hard-coded di sistem?
* Untuk Scheduled Change yang `effective_date` jatuh pada periode libur tenaga medis (Edge Case #8): apakah warning non-blocking sudah cukup, atau perlu opsi tambahan *auto-postpone effective date* ke setelah libur?