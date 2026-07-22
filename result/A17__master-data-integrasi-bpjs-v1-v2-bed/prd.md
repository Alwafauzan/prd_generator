# PRD — Master Data / Integrasi BPJS V1 V2 — Bed

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A17); PRD terkait: A15 Bangsal, A16 Kamar, A43 Tarif Kamar, A3 Unit, A20 Tipe Penjamin; Integrasi BPJS Aplicares (Ketersediaan Tempat Tidur)
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-06-21

## 1. Overview / Brief Summary

Modul **Master Data Bed** mengelola data tempat tidur (bed) pada tiap kamar dan bangsal perawatan di RS. Menjadi sumber data utama pengelolaan kapasitas rawat inap: penempatan pasien, pemantauan ketersediaan bed, dan optimalisasi fasilitas ranap secara terintegrasi.

Lingkup pengelolaan: tambah, ubah, nonaktifkan bed; konfigurasi kode bed, identitas bed, kamar induk (A16), bangsal induk (A15), kelas perawatan, lokasi gedung/lantai, jenis pelayanan, jenis bed (reguler/isolasi/intensif/observasi), serta status aktif/nonaktif.

Status bed real-time: tersedia (available), terisi (occupied), dipesan (reserved), pembersihan (cleaning), pemeliharaan (maintenance), tidak dapat dipakai sementara (out of service). Status diperbarui otomatis dari aktivitas pelayanan (Admisi RI, transfer, pulang).

**Integrasi BPJS V1 V2 (Aplicares — Ketersediaan Tempat Tidur)**: pemetaan bed ke kode kelas BPJS dan pengiriman data ketersediaan tempat tidur ke BPJS, agar info bed RS tampil pada Aplicares/Mobile JKN. [ASUMSI] Cakupan integrasi BPJS untuk modul ini = Aplicares (bed availability), karena VClaim/SEP tidak relevan untuk master bed.

Data modul ini juga dasar perhitungan indikator ranap: BOR, BTO, ALOS, TOI.

## 2. Background

**Masalah saat ini (RS Tipe C & D):**
- Data bed sering dicatat manual (papan tulis/spreadsheet) → status tidak real-time, rawan ganda-isi atau salah penempatan pasien.
- Petugas admisi sulit tahu bed kosong tanpa telepon ke bangsal → admisi lambat.
- Pelaporan BOR/BTO/ALOS/TOI dihitung manual akhir bulan → rawan salah, tidak untuk keputusan harian.
- Update ketersediaan tempat tidur ke **BPJS Aplicares** sering dilakukan manual/terlambat → info di Mobile JKN tidak akurat, berisiko temuan kepatuhan.

**Kenapa modul ini perlu:** menyediakan master bed terstruktur sebagai single source of truth, dengan status real-time dan bridging otomatis ke BPJS Aplicares, sehingga admisi cepat, penempatan akurat, dan pelaporan kapasitas valid.

[ASUMSI] Alur diturunkan dari analogi BPMN `g-admisi-inpatient-registration` (aktivitas "Klik Gambar Bed Tersedia", "Pilih Bangsal", "Klik SIMPAN (Reserve/Inden Bed)", "Update Bed Status") yang mengonsumsi master bed ini.

## 3. In Scope

### Scope Definition (dikerjakan)
- CRUD master bed: tambah, ubah, nonaktif/aktifkan (soft delete).
- Konfigurasi atribut bed: kode, nomor/identitas, kamar induk (A16), bangsal induk (A15), kelas perawatan, gedung, lantai, jenis bed, jenis pelayanan, status aktif.
- Pemetaan **kode kelas BPJS** per bed (mapping ke kelas Aplicares).
- Pengelolaan **status operasional bed** (available/occupied/reserved/cleaning/maintenance/out of service) — manual override + update otomatis dari modul Admisi RI.
- Dashboard/list ketersediaan bed dengan filter (bangsal, kamar, kelas, status, jenis bed).
- Import massal bed via template (.csv/.xlsx).
- **Integrasi BPJS Aplicares**: kirim/sinkron data ketersediaan tempat tidur (jumlah tersedia per kelas/ruang) ke BPJS V1 & V2.

### Out Scope (tidak dikerjakan)
- Proses pemesanan/reserve bed saat admisi → milik modul Admisi RI (`g-admisi-inpatient-registration`).
- Master Bangsal (A15) dan Master Kamar (A16) → modul terpisah; modul ini hanya referensi (lookup).
- Tarif kamar/bed → A43.
- Perhitungan & penyajian laporan BOR/BTO/ALOS/TOI → modul Pelaporan Manajemen (modul ini hanya menyediakan datanya).
- Integrasi SATUSEHAT Location/bed [PERLU KONFIRMASI] — judul fitur hanya menyebut BPJS V1 V2.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Status bed akurat real-time | Selisih status sistem vs kondisi fisik | < 5% bed/hari [ASUMSI] |
| Percepat info bed untuk admisi | Waktu cek ketersediaan bed | < 10 detik (dari menu) |
| Bridging BPJS Aplicares andal | Keberhasilan sinkron ketersediaan tempat tidur | ≥ 95% sukses/hari [ASUMSI] |
| Data dasar indikator valid | Kelengkapan atribut bed (kelas, kamar, bangsal terisi) | 100% bed aktif |
| Kurangi salah penempatan | Insiden double-occupancy | 0 per bulan |

[PERLU KONFIRMASI] Angka target adalah usulan, perlu disepakati manajemen RS.

## 5. Related Feature

| Code | Menu | Relasi |
|------|------|--------|
| A15 | Master Data > Bangsal | Bangsal induk (lookup) bed |
| A16 | Master Data > Kamar | Kamar induk (lookup) bed |
| A43 | Master Data > Tarif Kamar | Tarif mengikuti kelas bed |
| A3 | Master Data > Unit | Unit/instalasi ranap pemilik bed |
| A20 | Master Data > Tipe Penjamin | Mapping kelas BPJS vs penjamin |
| — | Admisi Rawat Inap (`g-admisi-inpatient-registration`) | Konsumen utama: reserve & update status bed |
| — | IGD / SPRI / Keperawatan / EMR / Kasir | Konsumen status & penempatan bed |
| — | Pelaporan Manajemen | BOR/BTO/ALOS/TOI dari data bed |

Hierarki master: **Bangsal (A15) → Kamar (A16) → Bed (A17)**.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — RS Tipe C&D]
1. Data bed dicatat manual di papan/spreadsheet per bangsal.
2. Petugas admisi telepon bangsal untuk tahu bed kosong.
3. Status bed diupdate manual, sering terlambat → risiko double-isi.
4. Petugas update ketersediaan tempat tidur ke portal BPJS Aplicares secara manual & terpisah.
5. Indikator BOR/BTO dihitung manual akhir bulan.

### B. To-Be (diharapkan)
1. Admin Master Data input bed terstruktur (kode, kamar, bangsal, kelas, jenis, kode BPJS) sekali → jadi single source of truth.
2. Status bed real-time: berubah otomatis saat Admisi RI reserve/isi bed dan saat pasien pulang/transfer (event "Update Bed Status" dari `g-admisi-inpatient-registration`).
3. Petugas/unit lihat dashboard ketersediaan bed dengan filter.
4. Sistem **sinkron otomatis** jumlah tempat tidur tersedia per kelas ke **BPJS Aplicares (V1 & V2)** — terjadwal + on-change.
5. Data bed jadi sumber otomatis indikator ranap.

Keputusan kunci (BR): kode bed unik; bed nonaktif/maintenance tidak boleh dipesan; perubahan kelas bed memengaruhi tarif (A43) & mapping BPJS.

## 7. Main Flow / Mindmap

**Skenario 1 — Tambah Bed (Admin Master Data)**
1. Buka Control Panel > Master Data > Bed.
2. Klik Tambah → form bed muncul.
3. Pilih Bangsal (A15) → Kamar (A16) terfilter sesuai bangsal.
4. Isi kode bed, nomor bed, kelas perawatan, jenis bed, jenis pelayanan, gedung, lantai.
5. Pilih kode kelas BPJS (Aplicares) untuk bed.
6. Set status aktif & status operasional awal (default: available).
7. Sistem validasi (kode unik, kamar≤kapasitas) → SIMPAN.
8. Bed masuk master; data ketersediaan kelas terkait dihitung ulang → trigger sinkron Aplicares.

**Skenario 2 — Ubah / Nonaktifkan Bed**
1. Cari bed di list → pilih.
2. Edit atribut atau ubah status_aktif → nonaktif.
3. BR: jika status operasional = occupied/reserved → tidak boleh nonaktif (blok + pesan).
4. SIMPAN → recompute ketersediaan → sinkron Aplicares.

**Skenario 3 — Update Status Operasional Bed**
- Manual: Admin/Perawat ubah status (mis. cleaning→available, set maintenance).
- Otomatis: event dari Admisi RI (reserve→reserved, masuk→occupied, pulang→cleaning/available). [ASUMSI dari `g-admisi-inpatient-registration`]
- Tiap perubahan status available → recompute & push Aplicares.

**Skenario 4 — Sinkron BPJS Aplicares**
- Trigger: on-change ketersediaan + terjadwal (cron) [ASUMSI].
- Sistem agregasi jumlah bed available per (ruang/kelas BPJS) → kirim ke API Aplicares V1/V2 → simpan respons & log.
- Gagal → retry + tandai status sinkron error di dashboard.

**Skenario 5 — Import Massal Bed**
1. Unduh template → isi → upload (.csv/.xlsx).
2. Pilih mode (tambah / tambah+update).
3. Sistem validasi per baris → tampilkan ringkasan sukses/gagal → commit.

## 8. Business Rules

- **BR-001** Kode bed wajib **unik** se-RS. Duplikat → tolak simpan.
- **BR-002** Bed wajib punya **Kamar induk (A16)** dan **Bangsal induk (A15)** valid (status aktif). Trace: form Skenario 1 step 3.
- **BR-003** Jumlah bed aktif dalam satu kamar tidak boleh melebihi **kapasitas kamar (A16)**.
- **BR-004** Bed dengan status operasional **occupied** atau **reserved** **tidak boleh** dinonaktifkan atau dihapus. Trace: Skenario 2 step 3.
- **BR-005** Bed **nonaktif / maintenance / out_of_service** tidak boleh dipesan/diisi oleh Admisi RI.
- **BR-006** Perubahan **kelas perawatan** bed memengaruhi **tarif (A43)** dan **mapping kelas BPJS** → wajib konfirmasi.
- **BR-007** Setiap perubahan yang mengubah jumlah bed **available** memicu **recompute ketersediaan** dan **sinkron BPJS Aplicares**. Trace: Skenario 1 step 8, Skenario 3, Skenario 4.
- **BR-008** Transisi status valid: available↔reserved↔occupied→cleaning→available; available↔maintenance↔out_of_service. Transisi tidak valid ditolak. [ASUMSI]
- **BR-009** Soft delete (nonaktif) — data historis bed dipertahankan untuk indikator BOR/BTO.
- **BR-010** Mapping kode kelas BPJS wajib diisi untuk bed yang ikut dilaporkan ke Aplicares; bila kosong → bed tidak masuk agregasi Aplicares (warning). [PERLU KONFIRMASI]

## 9. User Stories

- **US-001** Sebagai **Admin Master Data**, saya ingin menambah/mengubah data bed lengkap (kamar, bangsal, kelas, jenis), agar tersedia data bed akurat sebagai acuan ranap. (Trace: Skenario 1)
- **US-002** Sebagai **Admin Master Data**, saya ingin menonaktifkan bed yang rusak, agar tidak terpilih saat admisi. (Trace: Skenario 2; BR-004)
- **US-003** Sebagai **Petugas Admisi RI**, saya ingin melihat bed tersedia per bangsal/kelas real-time, agar penempatan pasien cepat & tepat. (Analogi `g-admisi-inpatient-registration`)
- **US-004** Sebagai **Perawat bangsal**, saya ingin mengubah status bed (cleaning→available, maintenance), agar status mencerminkan kondisi fisik. (Trace: Skenario 3)
- **US-005** Sebagai **Operator/Sistem**, saya ingin ketersediaan tempat tidur tersinkron otomatis ke BPJS Aplicares, agar info di Mobile JKN akurat tanpa input manual. (Trace: Skenario 4; BR-007)
- **US-006** Sebagai **Admin**, saya ingin import massal bed via template, agar setup awal/penambahan banyak bed cepat. (Trace: Skenario 5)
- **US-007** Sebagai **Manajemen**, saya ingin data bed lengkap & historis, agar indikator BOR/BTO/ALOS/TOI valid. (Trace: BR-009)

## 10. Functional Requirements

- **FR-001** Sistem menyediakan form CRUD bed dengan field di §11.A. (US-001)
- **FR-002** Sistem memfilter dropdown Kamar (A16) berdasarkan Bangsal (A15) terpilih. (US-001; BR-002)
- **FR-003** Sistem memvalidasi kode bed unik & kapasitas kamar saat simpan. (BR-001, BR-003)
- **FR-004** Sistem mencegah nonaktif/hapus bed berstatus occupied/reserved. (BR-004)
- **FR-005** Sistem mengelola status operasional bed manual & menerima update otomatis dari modul Admisi RI via event/API internal. (US-004; Skenario 3)
- **FR-006** Sistem menampilkan dashboard/list ketersediaan bed dengan filter & ringkasan per status (§11.B). (US-003)
- **FR-007** Sistem mengagregasi jumlah bed available per kelas/ruang BPJS dan mengirim ke **API BPJS Aplicares V1 & V2** (on-change + terjadwal), menyimpan log & status sinkron. (US-005; BR-007)
- **FR-008** Sistem menyediakan retry & indikator error sinkron Aplicares. (FR-007)
- **FR-009** Sistem menyediakan import massal bed (template .csv/.xlsx, mode tambah/tambah+update) dengan validasi per baris & ringkasan hasil. (US-006)
- **FR-010** Sistem menyimpan riwayat perubahan status bed (audit) untuk dasar indikator ranap. (US-007; BR-009)
- **FR-011** Sistem menyediakan mapping kode kelas BPJS per bed. (BR-010)

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Tambah/Edit Bed (FR-001, FR-002, FR-011)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| bed_id | ID Bed | text | Ya | auto, unik | auto-generate | primary key internal |
| kode_bed | Kode Bed | text | Ya | unik se-RS, maks 20 char | manual | BR-001 |
| nomor_bed | Nomor/Identitas Bed | text | Ya | maks 20 char | manual | mis. "01", "A-3" |
| bangsal_id | Bangsal Induk | dropdown(lookup) | Ya | dari master Bangsal (A15), aktif | lookup A15 | BR-002 |
| kamar_id | Kamar Induk | dropdown(lookup) | Ya | dari master Kamar (A16), terfilter by bangsal | lookup A16 | FR-002; BR-003 |
| kelas_perawatan | Kelas Perawatan | dropdown | Ya | enum: VIP/Kelas 1/2/3/ICU/Isolasi | enum/master kelas | pengaruh tarif A43 |
| jenis_bed | Jenis Bed | dropdown | Ya | enum: reguler/isolasi/intensif/observasi | enum | |
| jenis_pelayanan | Jenis Pelayanan | dropdown(lookup) | Tidak | dari master Unit/Instalasi (A3) | lookup A3 | unit ranap pemilik |
| gedung | Gedung | text | Tidak | maks 50 char | manual | lokasi |
| lantai | Lantai | text | Tidak | maks 10 char | manual | lokasi |
| kode_kelas_bpjs | Kode Kelas BPJS (Aplicares) | dropdown | Tidak | enum kode kelas BPJS | mapping BPJS Aplicares | BR-010; wajib bila dilaporkan ke Aplicares [PERLU KONFIRMASI] |
| kode_ruang_aplicares | Kode Ruang Aplicares | text | Tidak | sesuai referensi BPJS | integrasi BPJS | [PERLU KONFIRMASI] format/sumber kode ruang Aplicares |
| status_operasional | Status Operasional | dropdown | Ya | enum: available/occupied/reserved/cleaning/maintenance/out_of_service | default available | BR-008 |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | konsisten kanonik; BR-004,BR-009 |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | konsisten kanonik |

### B. Layar TAMPIL — Dashboard/List Ketersediaan Bed (FR-006)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Bed Aktif | count master_bed where status_aktif | angka besar (kartu) | – | ringkasan |
| Bed Tersedia | count where status_operasional=available | angka + badge hijau | – | kartu |
| Bed Terisi | count where status_operasional=occupied | angka + badge merah | – | kartu |
| Bed Maintenance/OOS | count where status in (maintenance,out_of_service) | angka + badge abu | – | kartu |
| Kode Bed | master_bed.kode_bed | text | sort A-Z | |
| Nomor Bed | master_bed.nomor_bed | text | sort | |
| Bangsal | master_bangsal.nama (A15) | text | filter | |
| Kamar | master_kamar.nama (A16) | text | filter | |
| Kelas | master_bed.kelas_perawatan | text/badge | filter | |
| Jenis Bed | master_bed.jenis_bed | badge | filter | |
| Status Operasional | master_bed.status_operasional | badge berwarna | filter | warna per status |
| Status Sinkron BPJS | log sinkron Aplicares terakhir | badge (sukses/error) | filter | FR-008; merah jika error |
| Update Terakhir | audit status bed | datetime (dd-mm-yyyy HH:mm) | sort desc | FR-010 |

### C. Layar INPUT — Import Massal Bed (FR-009)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Bed | file | Ya | .csv/.xlsx, sesuai template, maks 10MB | manual upload | konsisten kanonik |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | konsisten kanonik |

[PERLU KONFIRMASI] Daftar enum kelas perawatan & kode kelas BPJS mengikuti referensi resmi BPJS Aplicares dan konfigurasi RS.

## 12. Non-Functional Requirements

- **NFR-001 Performa**: list/dashboard bed tampil < 3 detik untuk ≤ 500 bed (skala RS Tipe C&D). [ASUMSI]
- **NFR-002 Ketersediaan**: modul master & dashboard tersedia jam operasional RS; status bed update < 5 detik dari event Admisi RI.
- **NFR-003 Keandalan integrasi**: sinkron Aplicares idempotent + retry (mis. 3x backoff); kegagalan tidak boleh menggantung UI (async). [ASUMSI]
- **NFR-004 Resiliensi jaringan (Tipe C&D)**: internet tidak stabil → operasi master bed tetap jalan offline; sinkron Aplicares antri & kirim ulang saat online. [ASUMSI; PERLU KONFIRMASI dukungan offline]
- **NFR-005 Keamanan & RBAC**: akses CRUD bed & ubah status dibatasi role (A18/A53); kredensial BPJS (cons-id, secret, user-key) disimpan terenkripsi.
- **NFR-006 Audit**: semua perubahan bed & status tercatat (user, timestamp) — konsisten pola audit EMR.
- **NFR-007 Usability**: form dapat dipakai SDM IT terbatas; pesan validasi jelas Bahasa Indonesia.
- **NFR-008 Skalabilitas data**: simpan histori status untuk hitung BOR/BTO/ALOS/TOI lintas periode.

## 13. Integrasi Eksternal

### BPJS Aplicares — Ketersediaan Tempat Tidur (V1 & V2)
- **Tujuan**: kirim/sinkron jumlah tempat tidur tersedia per kelas/ruang ke BPJS agar tampil di Aplicares/Mobile JKN.
- **Arah**: SIMRS → BPJS (push) untuk update ketersediaan; (opsi) GET referensi kelas/ruang dari BPJS.
- **Endpoint (umum Aplicares)** [PERLU KONFIRMASI versi/path tepat per kontrak BPJS RS]:
  - Referensi: `GET .../aplicares/rest/ref/kelas` (master kelas BPJS).
  - Update bed: `POST/PUT .../aplicares/rest/tempattidur/update` (ketersediaan per ruang/kelas).
  - List ruang RS: `GET .../aplicares/rest/list/ruang`.
- **Auth**: header BPJS standar — `X-cons-id`, `X-timestamp`, `X-signature` (HMAC-SHA256), `user_key`; payload terenkripsi (LZ-string + Base64 decrypt respons). [ASUMSI mengikuti pola BPJS VClaim/Aplicares]
- **Pemicu**: on-change (saat available berubah, BR-007) + terjadwal (cron, mis. tiap 15 menit). [ASUMSI]
- **Mapping field**: `kelas_perawatan`+`kode_kelas_bpjs` → kode kelas Aplicares; agregasi count available per ruang → `tersedia`; `kapasitas` dari A16.
- **Penanganan gagal**: retry backoff, log respons, badge "error" di dashboard (FR-008), antrian saat offline (NFR-004).
- **V1 vs V2** [PERLU KONFIRMASI]: perbedaan endpoint/format payload antara Aplicares V1 dan V2 perlu dipetakan dari dokumentasi BPJS terbaru; modul mendukung dua versi via konfigurasi.

### Integrasi Internal SIMRS
- **Admisi RI / IGD / SPRI** (`g-admisi-inpatient-registration`): konsumsi ketersediaan bed; kirim event reserve/occupy/discharge → update `status_operasional`.
- **Master Bangsal (A15) & Kamar (A16)**: lookup hierarki induk.
- **Tarif Kamar (A43)**: kelas bed → tarif.
- **Keperawatan/EMR/Kasir**: referensi lokasi & status bed pasien.
- **Pelaporan Manajemen**: sumber data indikator BOR/BTO/ALOS/TOI.

## Asumsi
- [ASUMSI] Cakupan 'Integrasi BPJS V1 V2' modul Bed = BPJS Aplicares (ketersediaan tempat tidur), bukan VClaim/SEP.
- [ASUMSI] Alur status bed otomatis (reserve/occupy/discharge) diturunkan dari BPMN g-admisi-inpatient-registration.
- [ASUMSI] Pola auth BPJS (cons-id, timestamp, signature HMAC, user_key) sama dengan layanan BPJS lain.
- [ASUMSI] Target metrik (95% sukses sinkron, <5% selisih status) adalah usulan awal, belum disepakati manajemen.
- [ASUMSI] Hierarki master Bangsal→Kamar→Bed; modul Bed hanya referensi A15/A16 (lookup).
- [ASUMSI] Skala RS Tipe C&D ≤ ~500 bed untuk patokan performa.
- Field kanonik (status_aktif, keterangan, file_import, mode_import, unit) memakai definisi bersama lintas-PRD agar konsisten.

## Pertanyaan Terbuka
- Endpoint & versi tepat BPJS Aplicares V1 vs V2 (path, payload, auth) sesuai kontrak RS — perlu dokumen resmi BPJS.
- Apakah kode_kelas_bpjs wajib untuk semua bed yang dilaporkan, atau hanya kelas tertentu?
- Apakah modul ini perlu dukungan offline + antrian sinkron (internet tidak stabil Tipe C&D)?
- Frekuensi sinkron terjadwal Aplicares (cron) yang disepakati?
- Daftar enum kelas perawatan & jenis bed final sesuai konfigurasi RS.
- Format & sumber kode_ruang_aplicares (manual mapping vs tarik dari API BPJS).
- Apakah integrasi SATUSEHAT (Location/bed) termasuk scope, atau murni BPJS saja?