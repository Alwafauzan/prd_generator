# PRD — Master Data Kamar

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional); PRD A15 Master Data Bangsal; PRD A17 Master Data Bed; PRD A43 Tarif Kamar; PRD A19 Instalasi; BPMN g-admisi-inpatient-registration
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-06-19

## 1. Overview / Brief Summary

**Modul:** Control Panel > Master Data > Kamar (Code: **A16**, Cluster: Control Panel).

Master Data Kamar adalah modul pengelolaan data referensi kamar perawatan rawat inap di SIMRS RS Tipe C & D. Modul ini menjadi **sumber data utama** untuk pengaturan kapasitas, penempatan pasien, dan pemantauan ketersediaan ruang perawatan.

Fungsi inti:
- CRUD data kamar: tambah, ubah, nonaktifkan (soft delete).
- Atribut kamar: kode kamar, nama/nomor kamar, bangsal induk, kelas perawatan, jenis kamar, kapasitas tempat tidur, jenis kelamin penghuni, status operasional, lokasi (gedung/lantai), fasilitas khusus.
- Pengelolaan detail tempat tidur (bed) pada tiap kamar dikelola di modul **A17 Master Data Bed** — A16 menyediakan kapasitas & relasi induk.

**Posisi hierarki data:** Instalasi (A19) → Bangsal (A15) → **Kamar (A16)** → Bed (A17).

Modul ini bersifat master/referensi (bukan transaksi). Data kamar dikonsumsi modul transaksional (Admisi RI, SPRI, IGD, Keperawatan, Kasir) untuk reservasi, perpindahan, dan pemantauan okupansi (BOR/ALOS/TOI). [ASUMSI] Detail status real-time bed (kosong/terisi/cleaning/maintenance/isolasi) berada di modul Bed/transaksi, bukan di master Kamar.

## 2. Background

**Kondisi saat ini (RS Tipe C & D):**
- Data kamar sering dikelola manual (papan tulis/whiteboard, file Excel terpisah per bangsal), tidak terpusat. [ASUMSI]
- Ketersediaan kamar tidak real-time → petugas admisi telepon/keliling bangsal untuk cek bed kosong. Memicu antrian dan salah penempatan.
- Tidak ada standardisasi kode kamar → kesulitan integrasi dengan tarif (A43), klaim BPJS (kelas perawatan), dan pelaporan (BOR/ALOS/TOI).
- Perpindahan pasien antar kamar/bangsal tidak terdokumentasi rapi.

**Kenapa modul ini perlu:**
- Pada BPMN `g-admisi-inpatient-registration` terdapat aktivitas "Klik Gambar Bed Tersedia", "Pilih Bangsal", "Klik SIMPAN (Reserve/Inden Bed)", "Update Bed Status". Semua bergantung pada **master kamar & bed yang akurat dan terstruktur**.
- Tanpa master kamar terstruktur, fitur reservasi bed visual dan perhitungan indikator hunian tidak dapat berjalan.
- Kelas perawatan kamar dibutuhkan untuk validasi hak kelas peserta BPJS saat admisi.

## 3. In Scope

### Scope Definition (yang dikerjakan)
- CRUD data kamar (tambah, ubah, lihat detail, nonaktif/aktif). Hapus = soft delete.
- Relasi kamar ke **Bangsal (A15)** induk; pewarisan default atribut dari bangsal (kelas perawatan, jenis pelayanan, gedung, lantai, jenis kelamin penghuni) yang dapat di-override per kamar.
- Pengelolaan atribut: kode kamar (unik), nama/nomor, jenis kamar, kapasitas bed, kelas perawatan, jenis kelamin penghuni, status operasional, lokasi, fasilitas khusus, flag isolasi.
- Pencarian, filter (per bangsal/kelas/status), dan daftar (list) kamar.
- Import/export massal kamar via template (.csv/.xlsx).
- Dashboard ringkas master kamar (jumlah kamar per bangsal/kelas, status aktif).
- Validasi konsistensi: kapasitas vs jumlah bed terdaftar (A17), kelas perawatan harus selaras dengan tarif (A43).

### Out Scope (yang TIDAK dikerjakan)
- Pengelolaan detail per tempat tidur / status real-time bed (kosong/terisi/cleaning/maintenance/isolasi/okupansi) → modul **A17 Master Data Bed** & modul transaksi.
- Proses reservasi/inden bed, penempatan pasien, perpindahan pasien → modul **Admisi RI / Keperawatan**.
- Penetapan tarif kamar → modul **A43 Tarif Kamar**.
- Perhitungan & penyajian indikator BOR/ALOS/TOI → modul **Pelaporan Manajemen** (A16 hanya menyediakan data referensi).
- Master Bangsal (A15) dan Instalasi (A19) → modul masing-masing.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Data kamar terpusat & akurat | % kamar fisik tercatat di master | 100% [PERLU KONFIRMASI baseline] |
| Standardisasi kode kamar | Duplikasi kode kamar | 0 (unik dijaga sistem) |
| Percepat setup data kamar | Waktu input 1 kamar | < 2 menit/kamar [ASUMSI] |
| Dukung admisi cepat | Master kamap siap dikonsumsi modul Admisi RI | 100% kamar aktif punya kelas & kapasitas valid |
| Konsistensi kapasitas | Kamar dengan kapasitas ≠ jumlah bed terdaftar | 0 (warning sistem) |
| Efisiensi entry massal | Berhasil import via template | ≥ 95% baris valid sekali upload [ASUMSI] |

## 5. Related Feature

Dari List Fitur (cluster Control Panel):

| Code | Menu | Relasi dengan A16 |
|------|------|-------------------|
| **A15** | Master Data > Bangsal | **Induk** kamar. Kamar wajib milik 1 bangsal. Mewarisi default atribut. |
| **A17** | Master Data > Bed (Integrasi BPJS V1 V2) | **Anak** kamar. Bed terdaftar di dalam kamar; kapasitas A16 = jumlah bed. |
| **A43** | Master Data > Tarif Kamar | Tarif mengikuti kelas perawatan kamar. |
| **A19** | Master Data > Instalasi (New) | Bangsal (induk kamar) berada di bawah instalasi. |
| **A3** | Master Data > Unit | Lookup unit pengelola. |
| **A18 / A37 / A53** | Role / Akses Menu / RBAC | Mengatur hak akses CRUD master kamar. |

Modul transaksional yang mengkonsumsi A16: Admisi Rawat Inap, SPRI, IGD, Keperawatan, Kasir, Pelaporan Manajemen.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari analogi BPMN admisi RI]
1. Daftar kamar dicatat manual di Excel/papan per bangsal.
2. Saat admisi, petugas pendaftaran RI telepon/keliling bangsal untuk cek bed kosong (analogi BPMN: tahap "Pilih Bangsal" / "Klik Gambar Bed Tersedia" belum tersistem).
3. Tidak ada kode kamar baku → tarif & klaim kelas perawatan rawan salah.
4. Perubahan kamar (tambah/tutup) tidak terdokumentasi terpusat.

### B. To-Be (kondisi diharapkan)
1. Admin Master Data membuka menu Control Panel > Master Data > Kamar.
2. Pilih bangsal induk (A15) → sistem prefill default (kelas, jenis pelayanan, gedung, lantai, jenis kelamin penghuni).
3. Input atribut kamar (kode unik, nama/nomor, jenis kamar, kapasitas, fasilitas).
4. Sistem validasi: kode unik, kapasitas > 0, kelas selaras tarif (A43).
5. Simpan → kamar tersedia untuk modul Bed (A17) & Admisi RI.
6. Untuk entry massal: unduh template → isi → import (mode tambah / tambah+update).
7. Perubahan/penonaktifan kamar tercatat (audit) & langsung memengaruhi pilihan di modul transaksi.

Kamar yang aktif & punya bed terdaftar (A17) langsung muncul pada layar reservasi bed admisi (BPMN: "Klik Gambar Bed Tersedia" → "Reserve/Inden Bed").

## 7. Main Flow / Mindmap

**Skenario 1 — Tambah Kamar (manual)**
1. Admin buka menu Kamar → klik **Tambah Kamar**.
2. Pilih **Bangsal** induk (dropdown A15) → sistem prefill default.
3. Isi form kamar (kode, nama/nomor, jenis kamar, kelas, kapasitas, jenis kelamin penghuni, lokasi, fasilitas, flag isolasi).
4. Klik **Simpan**.
5. Gateway *Kode kamar unik?* → Tidak: tampilkan error, kembali ke form. Ya: lanjut.
6. Gateway *Kelas selaras tarif (A43)?* → Tidak: warning [PERLU KONFIRMASI apakah hard-block atau soft-warning]. Ya: simpan.
7. Event akhir: **Kamar berhasil dibuat**, status default = aktif. Siap diisi bed (A17).

**Skenario 2 — Ubah / Nonaktifkan Kamar**
1. Admin cari kamar (filter bangsal/kelas/status) → buka detail.
2. Ubah atribut atau set status non-operasional/nonaktif.
3. Gateway *Kamar punya bed terisi pasien aktif?* → Ya: blok nonaktif, tampilkan pesan "pindahkan pasien dahulu". Tidak: lanjut.
4. Simpan → audit log tercatat.

**Skenario 3 — Import Massal**
1. Admin klik **Import** → unduh template (.xlsx/.csv).
2. Isi data → upload → pilih mode (tambah / tambah+update).
3. Sistem validasi tiap baris (kode unik, bangsal valid, kapasitas > 0).
4. Tampilkan ringkasan: baris sukses / gagal + alasan.
5. Konfirmasi → commit data valid. Event akhir: **Import selesai**.

## 8. Business Rules

- **BR-001**: Kode kamar wajib **unik** dalam lingkup RS. Duplikat → tolak simpan.
- **BR-002**: Setiap kamar wajib milik **tepat 1 bangsal** (A15). Tidak boleh kamar tanpa bangsal induk.
- **BR-003**: Kapasitas tempat tidur harus **> 0** (integer).
- **BR-004**: Jumlah bed terdaftar di A17 **tidak boleh melebihi** kapasitas kamar. Jika kapasitas dikurangi di bawah jumlah bed aktif → tolak/peringatkan. [PERLU KONFIRMASI: blok keras vs warning]
- **BR-005**: Kamar **tidak dapat dinonaktifkan/dihapus** bila masih ada bed terisi pasien aktif (telusur ke modul transaksi). [ASUMSI dari BPMN "Update Bed Status"]
- **BR-006**: Penghapusan = **soft delete** (status_aktif = nonaktif), data historis dipertahankan untuk pelaporan.
- **BR-007**: Kelas perawatan kamar harus memiliki **tarif** padanan di A43; bila belum ada → warning saat simpan.
- **BR-008**: Jenis kelamin penghuni (L / P / Campur) default mengikuti bangsal, dapat di-override per kamar; dipakai modul admisi untuk validasi penempatan.
- **BR-009**: Default atribut diwarisi dari bangsal induk (kelas, jenis pelayanan, gedung, lantai) namun **dapat di-override** per kamar.
- **BR-010**: Hanya role berhak (RBAC A53) yang dapat CRUD master kamar.

## 9. User Stories

- **US-001**: Sebagai Admin Master Data, saya ingin menambah kamar baru dengan memilih bangsal induk dan mengisi atributnya, agar data kamar terpusat dan akurat. *(BPMN: "Pilih Bangsal")*
- **US-002**: Sebagai Admin Master Data, saya ingin sistem menolak kode kamar duplikat, agar tidak terjadi tumpang tindih data. *(BR-001)*
- **US-003**: Sebagai Admin Master Data, saya ingin atribut kamar otomatis terisi default dari bangsal induk, agar input lebih cepat dan konsisten. *(BR-009)*
- **US-004**: Sebagai Admin Master Data, saya ingin mengubah kapasitas & status kamar, agar data mengikuti kondisi fisik terkini.
- **US-005**: Sebagai Admin Master Data, saya ingin dicegah menonaktifkan kamar yang masih terisi pasien, agar tidak mengganggu pelayanan. *(BR-005)*
- **US-006**: Sebagai Admin Master Data, saya ingin import massal kamar via template, agar setup awal RS cepat. *(Skenario 3)*
- **US-007**: Sebagai Petugas Pendaftaran RI, saya ingin melihat daftar kamar aktif beserta kelas & kapasitas, agar dapat menempatkan pasien sesuai hak kelas. *(BPMN: "Klik Gambar Bed Tersedia")*
- **US-008**: Sebagai Manajemen, saya ingin data master kamar terstruktur per bangsal/kelas, agar mendukung perhitungan BOR/ALOS/TOI.
- **US-009**: Sebagai Admin, saya ingin filter & cari kamar per bangsal/kelas/status, agar mudah mengelola banyak kamar.

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menyediakan form tambah kamar dengan pemilihan bangsal induk (A15). | US-001 / BPMN "Pilih Bangsal" |
| **FR-002** | Sistem prefill default atribut dari bangsal terpilih, dapat di-override. | US-003 / BR-009 |
| **FR-003** | Sistem memvalidasi keunikan kode kamar sebelum simpan. | US-002 / BR-001 |
| **FR-004** | Sistem memvalidasi kapasitas integer > 0. | BR-003 |
| **FR-005** | Sistem menyediakan edit atribut & ubah status kamar. | US-004 |
| **FR-006** | Sistem mencegah nonaktif/hapus kamar dengan bed terisi pasien aktif. | US-005 / BR-005 |
| **FR-007** | Penghapusan bersifat soft delete + audit log (user, waktu, perubahan). | BR-006 |
| **FR-008** | Sistem menyediakan list kamar dengan pencarian & filter (bangsal/kelas/status). | US-009 |
| **FR-009** | Sistem menyediakan import massal (template .csv/.xlsx) dengan mode tambah / tambah+update + ringkasan validasi. | US-006 / Skenario 3 |
| **FR-010** | Sistem menyediakan export daftar kamar. | US-008 |
| **FR-011** | Sistem memvalidasi keselarasan kelas perawatan dengan tarif (A43). | BR-007 |
| **FR-012** | Sistem menyediakan dashboard ringkas (jumlah kamar per bangsal/kelas/status). | US-008 |
| **FR-013** | Sistem mengekspos data kamar aktif ke modul Bed (A17) & Admisi RI. | US-007 |
| **FR-014** | Akses CRUD dibatasi RBAC (A53). | BR-010 |

## 11. Data Requirements (Spesifikasi Field)

Entitas selaras hierarki: **Bangsal (A15)** `kode_bangsal, nama_bangsal, jenis_pelayanan, kelas_perawatan, instalasi_id, unit, gedung, lantai, jenis_kelamin_penghuni, jumlah_kamar` → **Kamar (A16)** → **Bed (A17)**.

### A. Layar INPUT — Form Tambah/Edit Kamar (FR-001..005, 011)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_kamar | Kode Kamar | text | Ya | unik, maks 20 char, alfanumerik | manual / auto-generate | BR-001 |
| nama_kamar | Nama / Nomor Kamar | text | Ya | maks 50 char | manual | mis. "Melati 201" |
| bangsal_id | Bangsal Induk | lookup | Ya | dari master Bangsal (A15) | lookup A15 | BR-002 |
| instalasi_id | Instalasi | lookup | Tidak | dari master Instalasi (A19) | autofill dari bangsal | read-only/override |
| unit | Unit/Poli | dropdown(lookup) | Tidak | dari master Unit (A3) | autofill dari bangsal (lookup A3) | **field kanonik** |
| jenis_pelayanan | Jenis Pelayanan | dropdown | Ya | enum: Rawat Inap | default RI (dari bangsal) | **field kanonik** |
| kelas_perawatan | Kelas Perawatan | dropdown | Ya | enum: Kelas 1/Kelas 2/Kelas 3/VIP | autofill dari bangsal, override | **field kanonik**; BR-007 |
| jenis_kamar | Jenis Kamar | dropdown | Ya | enum: Standar/Isolasi/VIP/Intensif | manual | [PERLU KONFIRMASI daftar enum final] |
| kapasitas_bed | Kapasitas Tempat Tidur | number | Ya | integer > 0 | manual | BR-003/BR-004 |
| jenis_kelamin_penghuni | Jenis Kelamin Penghuni | dropdown | Ya | enum: L / P / Campur | autofill dari bangsal, override | BR-008 |
| gedung | Gedung | text/dropdown | Tidak | maks 50 char | autofill dari bangsal | lokasi |
| lantai | Lantai | text/number | Tidak | – | autofill dari bangsal | lokasi |
| flag_isolasi | Kamar Isolasi | boolean | Ya | true/false | default false | untuk penempatan kasus menular |
| fasilitas | Fasilitas Khusus | text/multiselect | Tidak | maks 255 char | manual | mis. AC, kamar mandi dalam, oksigen sentral |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | **field kanonik** |
| status_operasional | Status Operasional | dropdown | Ya | enum: Operasional/Tutup Sementara/Renovasi | default Operasional | beda dari status_aktif |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | **field kanonik**; soft delete BR-006 |

### B. Layar INPUT — Import Massal Kamar (FR-009)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Kamar | file | Ya | .csv/.xlsx, sesuai template | manual upload | **field kanonik** |
| mode_import | Mode | dropdown | Ya | enum: tambah / tambah+update | enum | **field kanonik** |

### C. Layar TAMPIL — List Kamar (FR-008)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Kode Kamar | kamar.kode_kamar | text | sort A-Z | |
| Nama/Nomor | kamar.nama_kamar | text | sort | |
| Bangsal | bangsal.nama_bangsal | text | filter | |
| Kelas | kamar.kelas_perawatan | badge | filter | |
| Jenis Kamar | kamar.jenis_kamar | text | filter | |
| Kapasitas | kamar.kapasitas_bed | angka | sort | |
| Bed Terdaftar | count A17 where kamar_id | angka (x / kapasitas) | – | warning bila > kapasitas (BR-004) |
| JK Penghuni | kamar.jenis_kelamin_penghuni | text | filter | |
| Status | kamar.status_aktif + status_operasional | badge (hijau aktif / abu nonaktif) | filter | |

### D. Layar TAMPIL — Dashboard Ringkas Kamar (FR-012)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Kamar Aktif | count kamar where status_aktif | angka besar | – | kartu ringkasan |
| Total Kapasitas Bed | sum kamar.kapasitas_bed (aktif) | angka besar | – | |
| Kamar per Kelas | group by kelas_perawatan | grafik batang | filter kelas | |
| Kamar per Bangsal | group by bangsal | tabel/grafik | filter bangsal | |
| Kamar Non-Operasional | count where status_operasional ≠ Operasional | angka + badge | – | warna kuning |

## 12. Non-Functional Requirements

- **NFR-001 (Performa)**: List & pencarian kamar tampil < 2 detik untuk ≤ 500 kamar (skala RS Tipe C & D). [ASUMSI]
- **NFR-002 (Keandalan/Offline)**: Master kamar di-cache lokal agar modul admisi tetap dapat menampilkan daftar kamar saat internet tidak stabil; sinkron saat koneksi pulih. [ASUMSI — kendala infrastruktur RS C&D]
- **NFR-003 (Keamanan/RBAC)**: CRUD master kamar hanya untuk role berwenang (A53); aksi tercatat di audit log (user, waktu, before/after).
- **NFR-004 (Integritas Data)**: Constraint unik kode_kamar & foreign key ke bangsal/instalasi dijaga di level DB.
- **NFR-005 (Usability)**: Form prefill default + validasi inline; entry 1 kamar < 2 menit.
- **NFR-006 (Auditability)**: Soft delete + riwayat perubahan dipertahankan untuk pelaporan.
- **NFR-007 (Kompatibilitas)**: Template import .csv/.xlsx kompatibel Excel versi umum di RS. [ASUMSI]
- **NFR-008 (Skalabilitas)**: Mendukung penambahan bangsal/kamar tanpa perubahan skema.

## 13. Integrasi Eksternal

Master Kamar (A16) sebagian besar berintegrasi **internal antar-modul SIMRS**, bukan eksternal langsung.

**Integrasi internal:**
- **A15 Bangsal** — sumber induk & default atribut (kode_bangsal, kelas, jenis_pelayanan, gedung, lantai, jenis_kelamin_penghuni).
- **A17 Bed** — bed terdaftar dalam kamar; validasi jumlah bed ≤ kapasitas.
- **A43 Tarif Kamar** — kelas perawatan kamar → padanan tarif.
- **A19 Instalasi**, **A3 Unit** — lookup referensi.
- **Admisi RI / SPRI / IGD / Keperawatan / Kasir** — mengkonsumsi data kamar aktif untuk reservasi, penempatan, perpindahan, billing.
- **Pelaporan Manajemen** — data kamar untuk BOR/ALOS/TOI.

**Integrasi eksternal:**
- **BPJS V1/V2** — relevan pada level **Bed (A17)** untuk pemetaan kelas perawatan ke ketentuan kelas peserta BPJS. A16 menyediakan atribut `kelas_perawatan` sebagai dasar. [PERLU KONFIRMASI apakah mapping kelas BPJS dilakukan di A16, A17, atau A43].
- **SATUSEHAT** — [PERLU KONFIRMASI] kebutuhan kode lokasi/ruang (FHIR Location resource) bila RS wajib mengirim data lokasi rawat inap. Belum termasuk MVP A16 kecuali ditentukan.

Tidak ada integrasi langsung ke Disdukcapil/VClaim pada master kamar.

## Asumsi
- [ASUMSI] As-Is diturunkan dari analogi BPMN g-admisi-inpatient-registration (modul belum punya BPMN sendiri).
- [ASUMSI] Status real-time bed (cleaning/maintenance/isolasi/okupansi) dikelola di modul Bed (A17)/transaksi, bukan master Kamar.
- [ASUMSI] Default atribut kamar diwarisi dari bangsal induk dan dapat di-override.
- [ASUMSI] Skala data ≤ 500 kamar untuk RS Tipe C & D → target performa < 2 detik.
- [ASUMSI] Mode offline/cache lokal dibutuhkan karena internet RS C&D tidak selalu stabil.
- [ASUMSI] Penghapusan kamar = soft delete demi integritas pelaporan historis.
- [ASUMSI] Field kanonik (unit, kelas_perawatan, jenis_pelayanan, status_aktif, keterangan, file_import, mode_import) memakai definisi bersama dari modul lain.

## Pertanyaan Terbuka
- BR-004: pelanggaran kapasitas (jumlah bed > kapasitas) di-blok keras atau hanya warning?
- Daftar enum final 'jenis_kamar' (Standar/Isolasi/VIP/Intensif) — perlu konfirmasi RS.
- Mapping kelas perawatan ke ketentuan BPJS dilakukan di modul mana (A16/A17/A43)?
- Apakah A16 wajib mengirim data lokasi/ruang ke SATUSEHAT (FHIR Location)?
- Apakah kode_kamar di-generate otomatis (pola tertentu) atau manual penuh?
- Validasi kelas vs tarif (BR-007): hard-block atau soft-warning saat simpan?
- Baseline jumlah kamar fisik per RS Tipe C & D untuk menetapkan target metrik.