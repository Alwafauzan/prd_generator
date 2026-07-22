# PRD — Master Data Bangsal

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A15); BPMN terkait: g-admisi-inpatient-registration, g-admisi-emergency-registration, g-emr-inpatient; PRD terkait: A3 Unit, A16 Kamar, A17 Bed, A19 Instalasi, A43 Tarif Kamar
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-06-19

## 1. Overview / Brief Summary

Master Data Bangsal (code **A15**, cluster **Control Panel**) adalah modul pengelolaan data referensi seluruh bangsal/ruang perawatan rawat inap di RS Tipe C & D. Modul ini menjadi **sumber data utama** untuk proses admisi rawat inap, penempatan pasien (bed placement), pemantauan ketersediaan tempat tidur, dan pelaporan utilisasi (BOR).

Lingkup data: kode bangsal, nama bangsal, jenis pelayanan, kelas perawatan, lokasi/gedung, kapasitas tempat tidur, jumlah kamar, status operasional, dan unit/instalasi penanggung jawab.

**Batas modul A15**: hanya pengelolaan *entitas Bangsal*. Detail Kamar = modul A16; detail Bed (nomor TT, status isolasi/maintenance, integrasi BPJS Aplicares) = modul A17; tarif = A43. A15 menyimpan agregat kapasitas dan menjadi induk hierarki Bangsal → Kamar → Bed. [ASUMSI] pemisahan hierarki mengikuti pemecahan fitur A15/A16/A17 pada List Fitur.

## 2. Background

**Masalah saat ini (RS Tipe C & D):**
- Data bangsal sering dikelola manual (spreadsheet/papan tulis) → ketersediaan TT tidak real-time, rawan salah saat admisi.
- Pada alur admisi rawat inap (BPMN `g-admisi-inpatient-registration`), petugas melakukan *Klik Gambar Bed Tersedia → Pilih Bangsal → Reserve/Inden Bed → Update Bed Status*. Aktivitas ini **membutuhkan master bangsal & bed yang akurat**; tanpa master terpusat, pemetaan bed tidak konsisten.
- Pelaporan BOR dan perencanaan kapasitas sulit karena data tersebar.

**Kenapa modul ini perlu:** menyediakan satu sumber kebenaran (single source of truth) data bangsal yang dikonsumsi modul Admisi (A-cluster admisi), EMR Rawat Inap, Keperawatan, Kasir, dan Pelaporan. [ASUMSI] turunan dari pola BPMN admisi, karena A15 belum punya BPMN sendiri.

## 3. In Scope

### Scope Definition (dikerjakan)
- CRUD Bangsal: tambah, ubah, lihat detail, aktif/nonaktif (soft delete).
- Penentuan atribut bangsal: kode, nama, jenis pelayanan, kelas perawatan, lokasi/gedung, instalasi penanggung jawab, unit, jenis kelamin penghuni, flag isolasi/rawat gabung.
- Pencatatan kapasitas agregat (jumlah kamar & total TT) — read-only autofill dari relasi Kamar/Bed bila tersedia, atau input manual bila modul Kamar/Bed belum aktif. [ASUMSI]
- Penutupan sementara bangsal (status operasional: aktif / tutup sementara / nonaktif) + alasan & periode.
- Pencarian, filter, dan daftar bangsal (dashboard ringkas BOR per bangsal).
- Import massal bangsal via template (.csv/.xlsx) — konsisten pola A2/A7/A10/A14.
- Audit trail perubahan data.

### Out Scope (TIDAK dikerjakan di A15)
- Manajemen Kamar detail → **A16**.
- Manajemen Bed detail (status isolasi/maintenance per TT, integrasi BPJS Aplicares/ketersediaan bed online) → **A17**.
- Tarif kamar → **A43**.
- Proses penempatan/reserve pasien & perpindahan antarbangsal (transaksional) → modul Admisi Rawat Inap & Keperawatan.
- Perhitungan & posting billing → Kasir.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Data bangsal terpusat & akurat | % bangsal aktif dengan data lengkap (semua field wajib terisi) | 100% |
| Mempercepat setup awal | Waktu input 1 bangsal baru | < 2 menit [ASUMSI] |
| Mendukung admisi real-time | Modul admisi dapat menarik daftar bangsal aktif tanpa error | 100% request sukses |
| Mendukung pelaporan BOR | Dashboard menampilkan kapasitas & okupansi per bangsal | tersedia |
| Integritas data | Tidak ada kode bangsal duplikat | 0 duplikat |
| Kemudahan migrasi | Import massal berhasil tanpa kehilangan baris valid | error baris dilaporkan per baris |

## 5. Related Feature

Fitur terkait dari cluster **Control Panel** (List Fitur sheet MVP):

| Code | Menu | Relasi |
|------|------|--------|
| A15 | Master Data > Bangsal | **modul ini** |
| A16 | Master Data > Kamar | child — kamar berada di bawah bangsal |
| A17 | Master Data > Bed | grandchild — bed berada di bawah kamar; integrasi BPJS |
| A3 | Master Data > Unit | lookup `unit` (kanonik) |
| A19 | Master Data > Instalasi | lookup instalasi penanggung jawab |
| A43 | Master Data > Tarif Kamar | tarif per kelas/bangsal |
| A39 | Master Data > Ruang IBS | ruang khusus bedah (referensi pola) |

Konsumen data (lintas cluster): Admisi Rawat Inap, IGD, EMR Rawat Inap (`g-emr-inpatient`), Keperawatan, Kasir, Pelaporan Manajemen.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — turunan, A15 tanpa BPMN]
1. Daftar bangsal & kapasitas dicatat manual (spreadsheet/papan).
2. Saat admisi, petugas menanyakan ketersediaan TT via telepon/lihat papan.
3. Perubahan kapasitas/penutupan ruang tidak tercatat sistematis.
4. Pelaporan BOR direkap manual → lambat & rawan salah.

### B. To-Be (kondisi diharapkan)
1. Admin/Petugas membuka **Control Panel > Master Data > Bangsal**.
2. Sistem menampilkan daftar bangsal + ringkasan kapasitas/okupansi.
3. Admin tambah/ubah bangsal → sistem validasi kode unik & field wajib → simpan + audit trail.
4. Admin set status operasional (tutup sementara/nonaktif) dengan alasan & periode.
5. Data bangsal aktif tersedia real-time untuk modul Admisi (analog BPMN `g-admisi-inpatient-registration`: *Pilih Bangsal → Reserve/Inden Bed → Update Bed Status*) dan IGD (`g-admisi-emergency-registration`).
6. Perubahan langsung terefleksi di dashboard BOR & laporan.

## 7. Main Flow / Mindmap

**Skenario 1 — Tambah Bangsal**
Masuk menu A15 → klik *Tambah Bangsal* → isi form → sistem cek kode unik → cek field wajib → simpan → catat audit → tampil di daftar.

**Skenario 2 — Ubah / Nonaktif Bangsal**
Pilih bangsal di daftar → *Edit* → ubah atribut / set status → bila set nonaktif & masih ada bed terisi → **blokir** (BR-05) → simpan.

**Skenario 3 — Tutup Sementara**
Pilih bangsal → *Tutup Sementara* → input alasan + periode → status = tutup sementara → bangsal tidak muncul sebagai opsi penempatan di Admisi.

**Skenario 4 — Import Massal**
Unduh template → isi → upload (.csv/.xlsx) → pilih mode (tambah / tambah+update) → sistem validasi per baris → tampil ringkasan sukses/gagal → konfirmasi → simpan baris valid.

**Skenario 5 — Lihat Dashboard / Cari**
Masuk menu → filter (instalasi/kelas/status) → lihat kapasitas & okupansi per bangsal.

**Decision points (gateway):**
- *Kode bangsal sudah ada?* → Ya: tolak/konfirmasi; Tidak: lanjut.
- *Bangsal masih ada bed terisi?* (saat nonaktif) → Ya: blokir; Tidak: izinkan.
- *Mode import?* → tambah / tambah+update.

## 8. Business Rules

- **BR-01**: Kode bangsal wajib **unik** se-RS; tidak boleh duplikat.
- **BR-02**: Field wajib (kode, nama, jenis pelayanan, kelas perawatan, instalasi, unit, status) harus terisi sebelum simpan.
- **BR-03**: Kelas perawatan harus dari enum terdaftar (VIP/Kelas 1/2/3/Isolasi/ICU) — selaras master kelas. [PERLU KONFIRMASI] daftar kelas final RS.
- **BR-04**: Bangsal berstatus *tutup sementara* / *nonaktif* TIDAK muncul sebagai opsi penempatan di modul Admisi (traceability: BPMN `g-admisi-inpatient-registration` aktivitas *Pilih Bangsal*).
- **BR-05**: Bangsal tidak boleh dinonaktifkan bila masih memiliki bed dengan status terisi. [ASUMSI]
- **BR-06**: Penonaktifan = *soft delete* (status_aktif=nonaktif), data historis dipertahankan untuk pelaporan & rekam medis.
- **BR-07**: Jenis kelamin penghuni bangsal (L/P/Campur) wajib diisi untuk mendukung penempatan pasien sesuai gender. [ASUMSI]
- **BR-08**: Kapasitas TT total = jumlah bed pada kamar di bawah bangsal (autofill bila A16/A17 aktif); bila input manual, beri flag `[manual]`.
- **BR-09**: Import mode *tambah* gagal bila kode sudah ada; mode *tambah+update* meng-update baris dengan kode cocok.

## 9. User Stories

- **US-001**: Sebagai **Admin/Petugas Control Panel**, saya ingin menambah bangsal baru dengan atribut lengkap, agar data tersedia untuk admisi rawat inap. *(source: BPMN g-admisi-inpatient-registration — Pilih Bangsal)*
- **US-002**: Sebagai Admin, saya ingin sistem menolak kode bangsal duplikat, agar tidak terjadi ambiguitas penempatan. *(BR-01)*
- **US-003**: Sebagai Admin, saya ingin mengubah atribut & status operasional bangsal, agar data selalu sesuai kondisi nyata.
- **US-004**: Sebagai Admin, saya ingin menutup sementara bangsal dengan alasan & periode, agar bangsal tidak dipilih saat renovasi/sterilisasi.
- **US-005**: Sebagai Admin, saya ingin mengimpor banyak bangsal sekaligus via template, agar setup awal cepat. *(pola A2/A7/A10/A14)*
- **US-006**: Sebagai **Petugas Pendaftaran RI**, saya ingin melihat hanya bangsal aktif yang sesuai kelas & gender pasien, agar penempatan benar. *(g-admisi-inpatient-registration — Klik Gambar Bed Tersedia)*
- **US-007**: Sebagai **Manajemen**, saya ingin melihat dashboard kapasitas & okupansi (BOR) per bangsal, agar bisa mengambil keputusan kapasitas.
- **US-008**: Sebagai Admin, saya ingin melihat audit trail perubahan bangsal, agar perubahan dapat ditelusuri.

## 10. Functional Requirements

- **FR-001**: Sistem menyediakan form tambah bangsal dengan field sesuai §11. *(US-001)*
- **FR-002**: Sistem memvalidasi keunikan kode bangsal saat simpan. *(BR-01, US-002)*
- **FR-003**: Sistem memvalidasi field wajib sebelum simpan. *(BR-02)*
- **FR-004**: Sistem menyediakan fungsi edit & ubah status operasional. *(US-003)*
- **FR-005**: Sistem menyediakan aksi *tutup sementara* dengan input alasan & periode. *(US-004, BR-04)*
- **FR-006**: Sistem mencegah nonaktif bila masih ada bed terisi. *(BR-05)*
- **FR-007**: Sistem menyediakan import massal (.csv/.xlsx) dengan mode tambah / tambah+update + laporan per baris. *(US-005, BR-09)*
- **FR-008**: Sistem menyediakan daftar bangsal dengan pencarian & filter (instalasi/kelas/status/gedung). *(US-006)*
- **FR-009**: Sistem menyediakan dashboard kapasitas & okupansi (BOR) per bangsal. *(US-007)*
- **FR-010**: Sistem menghitung/menampilkan kapasitas TT agregat dari relasi Kamar/Bed (autofill) atau manual. *(BR-08)*
- **FR-011**: Sistem menyediakan API/penyedia data daftar bangsal aktif untuk modul Admisi/IGD/EMR. *(US-006)*
- **FR-012**: Sistem mencatat audit trail (user, waktu, perubahan). *(US-008)*
- **FR-013**: Sistem menyediakan unduh template import. *(US-005)*

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Form Tambah/Edit Bangsal (INPUT) — FR-001..006

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_bangsal | Kode Bangsal | text | Ya | unik, maks 10 char, alfanumerik | manual / auto-generate | BR-01, tidak boleh duplikat |
| nama_bangsal | Nama Bangsal | text | Ya | maks 100 char | manual | |
| jenis_pelayanan | Jenis Pelayanan | dropdown | Ya | enum: Penyakit Dalam/Bedah/Anak/Kebidanan/Perinatologi/Isolasi/ICU/IGD | enum | [PERLU KONFIRMASI] daftar final |
| kelas_perawatan | Kelas Perawatan | dropdown | Ya | enum: VIP/Kelas 1/Kelas 2/Kelas 3/Isolasi/ICU | enum/master kelas | BR-03, [PERLU KONFIRMASI] |
| instalasi_id | Instalasi Penanggung Jawab | dropdown(lookup) | Ya | dari master Instalasi (A19) | lookup A19 | |
| unit | Unit/Poli | dropdown(lookup) | Tidak | dari master Unit (A3) | lookup A3 | field kanonik — definisi sama A3 |
| gedung | Lokasi/Gedung | text | Tidak | maks 50 char | manual | |
| lantai | Lantai | text | Tidak | maks 10 char | manual | [ASUMSI] |
| jenis_kelamin_penghuni | Jenis Kelamin Penghuni | dropdown | Ya | enum: L / P / Campur | enum | BR-07 |
| jumlah_kamar | Jumlah Kamar | number | Tidak | >= 0, integer | autofill dari A16 / manual | read-only bila A16 aktif, BR-08 |
| kapasitas_tt | Kapasitas Tempat Tidur | number | Tidak | >= 0, integer | autofill dari A17 / manual | read-only bila A17 aktif, BR-08 |
| flag_isolasi | Bangsal Isolasi | boolean | Tidak | true/false | default false | |
| flag_rawat_gabung | Rawat Gabung (Ibu-Bayi) | boolean | Tidak | true/false | default false | analog g-admisi-inpatient *Rawat Gabung?* |
| status_operasional | Status Operasional | dropdown | Ya | enum: Aktif / Tutup Sementara / Nonaktif | default Aktif | BR-04 |
| alasan_tutup | Alasan Tutup Sementara | text | Kondisional | maks 255 char | manual | wajib bila status=Tutup Sementara |
| periode_tutup_mulai | Mulai Tutup | date | Kondisional | <= periode_tutup_selesai | manual | wajib bila Tutup Sementara |
| periode_tutup_selesai | Selesai Tutup | date | Kondisional | >= periode_tutup_mulai | manual | |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik (sama definisi lintas-PRD) |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik, BR-06 soft delete |

### 11.2 Import Massal Bangsal (INPUT) — FR-007

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Bangsal | file | Ya | .csv/.xlsx, sesuai template | manual upload | field kanonik (sama A2/A7/A10/A14) |
| mode_import | Mode | dropdown | Ya | enum: tambah / tambah+update | enum | field kanonik, BR-09 |

### 11.3 Daftar / Dashboard Bangsal (TAMPIL) — FR-008, FR-009

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Bangsal Aktif | count bangsal where status_aktif | angka besar (kartu) | – | ringkasan |
| Total Kapasitas TT | sum kapasitas_tt aktif | angka besar | – | ringkasan |
| BOR Global | (TT terisi / total TT) ×100 | persen + warna | – | data okupansi dari modul Admisi/Bed [ASUMSI] |
| Kode Bangsal | bangsal.kode_bangsal | text | sort A-Z | |
| Nama Bangsal | bangsal.nama_bangsal | text | sort, search | |
| Jenis Pelayanan | bangsal.jenis_pelayanan | text | filter | |
| Kelas | bangsal.kelas_perawatan | badge | filter | |
| Instalasi | bangsal.instalasi_id → nama | text | filter | |
| Gedung | bangsal.gedung | text | filter | |
| Kapasitas / Terisi | kapasitas_tt / okupansi | angka (mis. 20/14) | sort | okupansi real-time dari Admisi/Bed |
| BOR per Bangsal | terisi/kapasitas ×100 | persen + bar | sort | |
| Status | bangsal.status_operasional | badge (hijau/kuning/abu) | filter | kuning=tutup sementara |

### 11.4 Audit Trail (TAMPIL) — FR-012

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit.timestamp | datetime | sort desc | |
| User | audit.user → nama | text | filter | |
| Aksi | audit.action | badge (create/update/deactivate) | filter | |
| Field Berubah | audit.diff | text (before→after) | – | |

## 12. Non-Functional Requirements

- **NFR-001 (Performa)**: Daftar bangsal & dashboard tampil < 3 detik untuk ≤ 200 bangsal. [ASUMSI] skala RS Tipe C/D.
- **NFR-002 (Ketersediaan)**: Master data ter-cache agar modul Admisi tetap dapat menampilkan daftar bangsal saat koneksi tidak stabil; sinkronisasi saat online. (RS Tipe C/D internet kadang tidak stabil.)
- **NFR-003 (Keamanan/RBAC)**: Akses CRUD hanya untuk role berwenang (Admin/Control Panel) via RBAC (A53). Audit trail wajib.
- **NFR-004 (Integritas)**: Constraint unik pada kode_bangsal di level DB.
- **NFR-005 (Usability)**: Form berbahasa Indonesia, validasi inline, pesan error per field jelas.
- **NFR-006 (Auditability)**: Semua create/update/deactivate tercatat (user, waktu, before/after).
- **NFR-007 (Kompatibilitas)**: Import menerima .csv & .xlsx; template tersedia untuk diunduh.
- **NFR-008 (Skalabilitas data)**: Mendukung hierarki Bangsal→Kamar→Bed tanpa perubahan skema saat A16/A17 aktif.

## 13. Integrasi Eksternal

Modul A15 sendiri **tidak memanggil integrasi eksternal langsung** (master internal). Relasi & konsumsi data:

| Tujuan | Jenis | Arah | Catatan |
|--------|-------|------|---------|
| Master Unit (A3) | internal lookup | A15 ← A3 | field `unit` |
| Master Instalasi (A19) | internal lookup | A15 ← A19 | penanggung jawab |
| Master Kamar (A16) / Bed (A17) | internal relasi | A15 ↔ A16/A17 | kapasitas agregat & okupansi |
| Modul Admisi RI / IGD | internal API | A15 → konsumen | daftar bangsal aktif utk penempatan (g-admisi-inpatient-registration, g-admisi-emergency-registration) |
| EMR Rawat Inap | internal | A15 → konsumen | konteks lokasi pasien (g-emr-inpatient) |
| Kasir / Tarif (A43) | internal | A15 ↔ A43 | tarif per kelas/bangsal |
| Pelaporan Manajemen | internal | A15 → konsumen | BOR & utilisasi |

**Integrasi eksternal terkait (di modul lain, bukan A15):**
- **BPJS Aplicares / ketersediaan bed online** → ditangani di **A17 (Bed)**. [PERLU KONFIRMASI] apakah pelaporan ketersediaan TT ke Aplicares dipicu dari level bangsal atau bed.
- **SATUSEHAT** lokasi/ruang (resource Location) → [PERLU KONFIRMASI] apakah bangsal dipetakan ke SATUSEHAT Location.

## Asumsi
- A15 tanpa BPMN sendiri — As-Is/To-Be & beberapa BR diturunkan dari pola BPMN admisi rawat inap & IGD. [ASUMSI]
- Pemisahan hierarki Bangsal (A15) / Kamar (A16) / Bed (A17) mengikuti pemecahan fitur pada List Fitur.
- Penonaktifan = soft delete; data historis dipertahankan untuk rekam medis & pelaporan.
- Field kanonik (unit, keterangan, status_aktif, file_import, mode_import) memakai definisi yang sama dengan modul lain (A2/A3/A7/A10/A14).
- Target performa (<3 dtk, ≤200 bangsal) skala khas RS Tipe C & D.
- Field lantai & rawat gabung ditambahkan sebagai kebutuhan wajar penempatan pasien.

## Pertanyaan Terbuka
- Daftar final enum kelas perawatan & jenis pelayanan untuk RS ini? (BR-03)
- Apakah kapasitas TT & jumlah kamar di-autofill dari A16/A17 atau diinput manual di A15 saat modul tersebut belum aktif? (BR-08)
- Apakah pelaporan ketersediaan TT ke BPJS Aplicares dipicu dari level Bangsal (A15) atau Bed (A17)?
- Apakah entitas Bangsal perlu dipetakan ke SATUSEHAT resource Location?
- Sumber data okupansi/BOR real-time: modul Admisi atau status Bed (A17)?
- Aturan gender penempatan (jenis_kelamin_penghuni Campur) — apakah berlaku untuk semua jenis pelayanan?