# PRD — Master Data: Manajemen Loket & Antrean (Meja Antrian)

**Related Document:** PRD_Manajemen_Loket_Antrean_MVP-B_Harian+Terjadwal.docx (v1.1 Varian B); A3 Master Data Unit; A1 User; A2 Staff; A18 Role / A53 RBAC; Jadwal Praktik; Sistem Antrian SIMRS v2; Mesin Kiosk Mandiri (in-house)
**Versi:** 1.4 - Penyesuaian feedback: aksi Ubah pada daftar loket mengarah ke form loket penuh (terfokus pada bagian layanan valid); penyelarasan US-010/FR-014/Alur C/Business Process; penghapusan penanda '(dikonfirmasi)' pada poin naratif.

## 1. Overview / Brief Summary

**Master Data: Manajemen Loket & Antrean** (kode fitur **A31** — Control Panel > Master Data > Meja Antrian) adalah satu menu pada cluster **Control Panel** SIMRS v2 yang mengelola dua master saling terkait melalui **dua tab**:

- **Tab Layanan** — mendata jenis layanan/tujuan antrean beserta **inisial/prefix seri** (mis. Pendaftaran Poliklinik, Customer Service, Penunjang, MCU, Vaksinasi), format nomor, dan aturan reset.
- **Tab Loket (Meja Antrian)** — mendata titik layanan fisik per unit dan menetapkan **layanan apa saja yang valid dipanggil** dari tiap loket.

**Model penomoran = seri dibagi**: setiap layanan memiliki satu seri antrean, dan satu seri dapat dipanggil oleh beberapa loket sekaligus. Akibatnya satu loket dapat melayani beberapa layanan dan satu layanan dapat dilayani beberapa loket — relasi **banyak-ke-banyak** melalui tabel *valid untuk*.

Modul ini adalah **master data murni (CRUD konfigurasi)**. Seluruh **pengaturan antrean saat operasional** — pemilihan loket oleh petugas, pemanggilan nomor real-time, layar/papan display, suara panggil, dan penghitungan counter berjalan — adalah satu kesatuan fitur **Sistem Antrian** dan **berada di luar dokumen ini**; modul ini hanya menyediakan konfigurasi yang dikonsumsi Sistem Antrian.

Target RS: **Tipe C & D** — konfigurasi sederhana, jumlah loket/layanan sedikit, dapat dikelola admin tunggal.

## 2. Background

Tanpa master loket & layanan terpusat, pengaturan antrean RS Tipe C & D umumnya dilakukan manual/tersebar (papan tulis, konfigurasi per-perangkat kiosk, atau hardcode di aplikasi antrean). Hal ini menimbulkan:

- **Inisial seri tabrakan** antar layanan (mis. dua layanan memakai prefix `A`) → nomor antrean ambigu.
- **Tidak ada acuan tunggal** bagi Sistem Antrian dan Kiosk Mandiri → data tidak konsisten antar perangkat.
- **Loket tidak fleksibel** — satu loket sulit melayani beberapa jenis layanan karena pemetaan kaku.
- **Perubahan konfigurasi** (tambah loket, ganti reset sesi) butuh intervensi teknis, bukan self-service admin.

Modul ini menyediakan **satu sumber kebenaran (single source of truth)** untuk layanan antrean (beserta seri & aturan reset) dan loket lintas unit, sekaligus menetapkan relasi *valid-untuk* sebagai dasar fleksibilitas pemanggilan. Masalah As-Is di atas diturunkan dari pola umum RS Tipe C&D dan konteks pada lampiran, bukan dari BPMN khusus modul ini.

## 3. In Scope

### Scope Definition (Termasuk Lingkup)
- **Tab Layanan**: CRUD layanan/tujuan antrean — kode (auto), nama, unit pemilik, inisial/prefix seri, format nomor, dan aturan reset (**Harian** default / **Terjadwal** pada jam tertentu).
- **Tab Loket (Meja Antrian)**: CRUD loket — kode (auto), nama, unit pemilik, dan **penetapan layanan valid** (relasi *valid-untuk*, multi-select, terbatas pada layanan unit yang sama).
- **Daftar loket ringkas**: kolom **jumlah layanan valid** (tanpa merinci daftar layanan inline) + **aksi Detail/Ubah** — Detail untuk melihat daftar layanan valid, Ubah untuk membuka **form loket penuh** (terfokus pada bagian layanan valid).
- **Status aktif/nonaktif** dan **soft delete** untuk kedua entitas.
- **Pencarian & filter** pada masing-masing daftar (per unit, per status).
- Validasi keunikan: inisial seri unik se-RS; kode auto-generate dijamin unik.

### Out Scope (Di Luar Lingkup)
- **Pengaturan antrean saat operasional (Sistem Antrian)** — satu kesatuan fitur: pemilihan loket oleh petugas, pemanggilan nomor real-time, layar/papan display, suara panggil, counter berjalan, dan **eksekusi reset & penomoran nyata**.
- **Peruntukan loket harian** (mis. Loket 1 = CS hari ini) & pengikatan petugas — ditetapkan saat petugas membuka loket pada login (operasional).
- **Prefix antrean Poli per dokter** — dikelola di modul **Jadwal Praktik**.
- **Perangkat keras/firmware Kiosk Mandiri**, pemetaan menu Kiosk → layanan, serta **kebutuhan cache/offline perangkat** — dibahas pada **PRD Kiosk / Sistem Antrian terpisah**.
- **Master User/Staff/Unit/Role** — referensi lookup, dikelola modul A1/A2/A3/A18-A53.
- **Import/ekspor massal & dashboard pemanfaatan** — di luar lingkup MVP.

## 4. Goals and Metrics

### Goals
1. Menyediakan **satu sumber data terpusat** untuk layanan antrean (beserta seri) dan loket lintas unit.
2. Menetapkan **relasi loket → layanan** (*valid untuk*) sebagai dasar fleksibilitas pemanggilan banyak-ke-banyak.
3. Menjadi **acuan konsisten** bagi Sistem Antrian dan Kiosk Mandiri.

### Metrics
| Metrik | Target | Catatan |
|--------|--------|---------|
| Inisial seri tabrakan | 0 kasus | dijamin validasi unik se-RS (BR-003) |
| Loket tanpa layanan valid tersimpan | 0 | dicegah BR-004 (min. 1 layanan) |
| Waktu admin menambah 1 loket + relasi | < 2 menit | target UX |
| Waktu admin melihat layanan valid 1 loket dari daftar | < 30 detik | via aksi Detail (FR-014) |
| Waktu admin membuka form ubah layanan valid dari daftar | < 1 klik dari baris loket | aksi Ubah → form loket penuh (FR-014) |
| Konsistensi data antrean antar perangkat (Kiosk/Antrian) | 100% baca dari master ini | satu source of truth |
| Konfigurasi reset sesi tanpa intervensi developer | 100% self-service | aturan reset disimpan master |

## 5. Related Feature

| Kode | Modul / Sistem | Relasi |
|------|----------------|--------|
| **A3** | Master Data > Unit | Lookup **unit** pemilik loket & layanan. |
| **A1 / A2** | Master Data > User / Staff | Petugas yang membuka loket saat login (operasional, di luar scope). |
| **A18 / A53** | Role / RBAC | Penentu peran yang berhak mengakses & mengubah master ini (lihat NFR-004). |
| — | Jadwal Praktik | Pemegang prefix antrean Poli per dokter; terpisah dari layanan loket. |
| — | Sistem Antrian SIMRS v2 (termasuk layar pemanggilan) | **Konsumen**: layanan (inisial/format/reset) + relasi *valid-untuk*. Mencakup pemilihan loket, pemanggilan, layar display, dan suara panggil saat operasional. |
| — | Mesin Kiosk Mandiri (in-house) | **Konsumen**: layanan Pendaftaran untuk penerbitan antrean awal. |

**Konsistensi field lintas-PRD**: field `unit` dan `status_aktif` mengikuti definisi kanonik yang sudah dipakai master lain (A2/A3). Field `keterangan` adalah **input teks manual bebas (bukan field kanonik)**.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [diturunkan dari pola umum RS Tipe C&D & lampiran — tanpa BPMN khusus]
1. Konfigurasi loket & inisial antrean ditetapkan manual/tersebar (kiosk per perangkat atau hardcode aplikasi antrean).
2. Tidak ada validasi keunikan inisial → potensi tabrakan seri.
3. Penambahan/penonaktifan loket butuh bantuan teknis; pemetaan loket↔layanan kaku.
4. Sistem Antrian & Kiosk membaca konfigurasi yang tidak terpusat → data bisa berbeda antar perangkat.

### B. To-Be (kondisi diharapkan)
1. Admin mengelola **Tab Layanan** lebih dulu (acuan): tetapkan nama, unit, **inisial seri unik**, format nomor, aturan reset (Harian/Terjadwal).
2. Admin mengelola **Tab Loket**: buat loket per unit, lalu **multi-select layanan valid** (hanya layanan unit yang sama).
3. Daftar loket menampilkan ringkas **jumlah layanan valid**; admin dapat membuka **Detail** (lihat daftar layanan valid tanpa meninggalkan daftar) atau **Ubah** (membuka **form loket penuh** yang terfokus pada bagian layanan valid) untuk menyesuaikan pemetaannya.
4. Sistem **auto-generate kode** loket & layanan, **validasi** keunikan inisial dan minimal 1 layanan per loket.
5. **Soft delete** menjaga data berhistori; entitas nonaktif disembunyikan dari operasional.
6. Sistem Antrian dan Kiosk **membaca satu master** → konsisten lintas perangkat.

## 7. Main Flow / Mindmap

### Alur A — Kelola Layanan (Tab Layanan)
1. Admin buka menu **Manajemen Loket & Antrean → Tab Layanan → Tambah Layanan**.
2. Isi form: nama, unit, inisial/prefix, format nomor, aturan reset (Harian/Terjadwal + jam jika terjadwal).
3. Sistem **men-generate `kode_layanan` otomatis** & **memvalidasi keunikan inisial se-RS**.
4. **Gateway: Inisial unik?** → *Tidak*: tampilkan error "inisial sudah dipakai" (kembali ke langkah 2). → *Ya*: simpan.
5. Layanan tampil di daftar dengan status **Aktif**.
6. **Ubah/Nonaktif/Hapus**: edit field; nonaktif menyembunyikan dari operasional; hapus = **soft delete** (ditolak bila masih direferensikan).

### Alur B — Kelola Loket & Layanan Valid (Tab Loket / Meja Antrian)
1. Admin buka **Tab Loket → Tambah Loket**.
2. Isi form: nama loket, unit pemilik.
3. **Pilih layanan valid** (multi-select) — pilihan dibatasi **layanan pada unit yang sama**.
4. Sistem **men-generate `kode_loket` otomatis** & memvalidasi **minimal satu layanan dipilih**.
5. **Gateway: ≥1 layanan valid?** → *Tidak*: error "loket wajib punya minimal 1 layanan" (kembali ke langkah 3). → *Ya*: simpan.
6. Loket tampil di daftar dengan kolom **jumlah layanan valid** (bukan daftar rincinya).

### Alur C — Lihat/Ubah Layanan Valid dari Daftar Loket
1. Pada **Tab Loket**, tiap baris menampilkan **Jumlah Layanan Valid** (angka) + aksi **Detail** dan **Ubah**.
2. Admin klik **Detail** → sistem menampilkan **daftar layanan valid** loket tsb (nama + inisial) dalam mode baca (mis. panel/modal), tanpa meninggalkan daftar.
3. Admin klik **Ubah** → sistem **membuka form loket penuh** (semua field loket dapat disunting: nama, unit, dan layanan valid), **di-scroll/terfokus ke bagian multi-select layanan valid** yang sudah terisi pilihan saat ini; pilihan tetap dibatasi **layanan unit sama & Aktif**.
4. Admin menambah/menghapus layanan valid (dan/atau menyunting field loket lain bila perlu) lalu simpan.
5. **Gateway: ≥1 layanan valid?** → *Tidak*: error (BR-004), batal simpan. → *Ya*: relasi *valid-untuk* diperbarui; kolom Jumlah Layanan Valid pada daftar ikut ter-update.

### Mindmap relasi
- **1 Unit → banyak Loket** (mis. Pendaftaran punya Loket 1–4).
- **1 Unit → banyak Layanan** (Poliklinik, CS, MCU, Vaksinasi).
- **Loket ↔ Layanan = banyak-ke-banyak** (tabel *valid untuk*).

## 8. Business Rules

| ID | Aturan | Sumber/Traceability |
|----|--------|---------------------|
| **BR-001** | `kode_loket` dan `kode_layanan` **digenerate otomatis** sistem & dijamin unik; tidak diinput manual dan tidak ditampilkan pada form. | Alur A & B (lampiran BR-001) |
| **BR-002** | Loket menempel pada **satu unit**; layanan menempel pada **satu unit**. | Alur A & B (lampiran BR-002) |
| **BR-003** | `inisial_antrean` **wajib & unik se-RS**, **1–3 karakter alfanumerik** — tidak boleh dua layanan berbagi inisial sama. Inisial = identitas seri yang dipakai Sistem Antrian. | Alur A langkah 3-4 (lampiran BR-003) |
| **BR-004** | Loket **wajib minimal satu layanan valid**; layanan yang dapat dipilih hanya **layanan pada unit yang sama** (tidak lintas-unit). Berlaku juga saat mengubah layanan valid via form loket penuh yang dibuka dari aksi Ubah pada daftar. | Alur B langkah 3-5 & Alur C (lampiran BR-004) |
| **BR-005** | Aturan reset nomor: **Harian (default)** atau **Terjadwal** pada jam tertentu (mis. pergantian sesi pagi/sore). Master menyimpan aturannya; **eksekusi reset dijalankan Sistem Antrian**. | Alur A (lampiran BR-005) |
| **BR-006** | Penghapusan memakai **soft delete**; layanan/loket yang masih direferensikan **tidak boleh dihapus permanen**. | Alur A & B (lampiran BR-006) |
| **BR-007** | Layanan/loket berstatus **Nonaktif disembunyikan** dari operasional dan dari pilihan *valid-untuk*. | Alur A & B (lampiran BR-007) |
| **BR-008** | **Format nomor** mengikuti pola `{inisial}-{angka berurut}` dengan **default `{inisial}-{000}`** (mis. `A-001`); jumlah digit padding dapat dikonfigurasi. Master hanya menyimpan polanya; **eksekusi penomoran berjalan di Sistem Antrian**. | Turunan model seri dibagi |
| **BR-009** | Pada **daftar loket**, layanan valid ditampilkan **hanya sebagai jumlah (angka)**, bukan daftar rinci inline; rincian layanan valid diakses melalui aksi **Detail** (baca, panel/modal) atau **Ubah** (membuka **form loket penuh** untuk sunting). | Alur B langkah 6 & Alur C (feedback v1.3–v1.4) |

## 9. User Stories

- **US-001** — Sebagai **Admin Control Panel**, saya ingin **menambah layanan antrean beserta inisial seri unik (1–3 char alfanumerik)**, agar setiap tujuan antrean punya seri nomor yang tidak tabrakan. *(BR-003)*
- **US-002** — Sebagai **Admin**, saya ingin **sistem menolak inisial yang sudah dipakai**, agar tidak ada dua layanan berbagi seri. *(BR-003)*
- **US-003** — Sebagai **Admin**, saya ingin **mengatur aturan reset nomor (Harian/Terjadwal)** per layanan, agar nomor antrean reset sesuai sesi operasional. *(BR-005)*
- **US-004** — Sebagai **Admin**, saya ingin **menambah loket (meja antrian) dan memilih layanan valid yang dilayaninya**, agar satu loket fleksibel melayani beberapa layanan. *(BR-004)*
- **US-005** — Sebagai **Admin**, saya ingin **pilihan layanan saat membuat loket dibatasi ke unit yang sama**, agar relasi tidak salah lintas-unit. *(BR-004)*
- **US-006** — Sebagai **Admin**, saya ingin **menonaktifkan loket/layanan tanpa menghapus permanen**, agar histori tetap terjaga dan data hilang dari operasional. *(BR-006, BR-007)*
- **US-007** — Sebagai **Admin**, saya ingin **mencari/memfilter daftar loket & layanan per unit/status**, agar mudah mengelola saat jumlah bertambah.
- **US-008** — Sebagai **Sistem Antrian / Kiosk Mandiri (konsumen)**, saya ingin **membaca master layanan (inisial/format/reset) dan relasi valid-untuk**, agar pemanggilan & penerbitan nomor konsisten. *(FR-013)*
- **US-009** — Sebagai **Admin**, saya ingin **daftar loket menampilkan ringkas jumlah layanan valid** (bukan daftar panjang), agar tabel tetap rapi dan mudah dipindai. *(BR-009, FR-006)*
- **US-010** — Sebagai **Admin**, saya ingin **tombol Detail/Ubah di tiap baris loket** — **Detail** untuk melihat daftar layanan validnya secara cepat, dan **Ubah** untuk **langsung diarahkan ke form loket penuh** (terfokus pada bagian layanan valid) — agar bisa menyesuaikan pemetaan loket↔layanan langsung dari daftar tanpa menavigasi manual. *(BR-009, FR-014)*

## 10. Functional Requirements

### Tab Layanan
- **FR-001** Sistem menyediakan daftar layanan dengan kolom: nama, unit, inisial, format nomor, aturan reset, status; mendukung **cari & filter** (unit, status). *(US-001, US-007)*
- **FR-002** Form Tambah/Edit Layanan menerima: nama, unit (lookup A3), inisial_antrean, format_nomor, jenis_reset, jam_reset (kondisional). *(US-001)*
- **FR-003** Sistem **auto-generate `kode_layanan`** unik, tidak ditampilkan di form. *(BR-001)*
- **FR-004** Sistem **validasi `inisial_antrean`**: wajib, **1–3 karakter alfanumerik**, dan **unik se-RS** sebelum simpan; tolak + pesan error bila tidak valid/duplikat. *(BR-003, US-002)*
- **FR-005** Bila `jenis_reset = Terjadwal`, field **`jam_reset` menjadi wajib**; bila `Harian`, jam_reset disembunyikan/diabaikan. *(BR-005, US-003)*

### Tab Loket (Meja Antrian)
- **FR-006** Sistem menyediakan daftar loket dengan kolom: nama, unit, **jumlah layanan valid (angka saja, bukan daftar rinci)**, status, dan **kolom aksi (Detail, Ubah, dan aksi umum)**; cari & filter (unit, status). *(US-007, US-009, BR-009)*
- **FR-007** Form Tambah/Edit Loket menerima: nama, unit (lookup A3), dan **multi-select layanan valid**. *(US-004)*
- **FR-008** Daftar pilihan layanan pada form loket **difilter ke unit yang sama** dan **hanya layanan berstatus Aktif**. *(BR-004, BR-007, US-005)*
- **FR-009** Sistem **auto-generate `kode_loket`** unik, tidak ditampilkan di form. *(BR-001)*
- **FR-010** Sistem **menolak simpan loket tanpa minimal satu layanan valid**. *(BR-004)*
- **FR-014** Tiap baris daftar loket menyediakan aksi **Detail** dan **Ubah** untuk layanan valid: *(US-010, BR-009)*
  - **Detail** — menampilkan daftar layanan valid loket tsb (nama + inisial) dalam mode baca (panel/modal), tanpa mengubah data dan tanpa meninggalkan daftar.
  - **Ubah** — **mengarahkan admin ke form loket penuh** (form Edit Loket yang sama dengan FR-007 — semua field loket dapat disunting), **terbuka dengan fokus/scroll ke bagian multi-select layanan valid** yang sudah terisi pilihan saat ini; pilihan tetap dibatasi **layanan unit sama & Aktif** (FR-008) dan tunduk pada **minimal 1 layanan** (FR-010/BR-004). Setelah simpan, kolom **Jumlah Layanan Valid** pada daftar diperbarui. *(catatan: Ubah bukan editor parsial inline, melainkan jalan pintas ke form penuh.)*

### Umum
- **FR-011** Aksi hapus = **soft delete**; ditolak bila entitas masih direferensikan (loket→layanan / relasi aktif). *(BR-006)*
- **FR-012** Toggle status **Aktif/Nonaktif**; entitas Nonaktif tidak muncul di operasional & pilihan valid-untuk. *(BR-007)*
- **FR-013** Sistem **mengekspos data master** (layanan + relasi valid-untuk) untuk dikonsumsi Sistem Antrian/Kiosk. *(US-008)* Mekanisme teknis konsumsi (mis. API internal / shared DB / sync) **ditentukan tim pengembang saat implementasi** dan tidak diatur di PRD ini.

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Form Tambah/Edit Layanan (Tab Layanan) — INPUT
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_layanan | Kode Layanan | text | Ya | unik, auto-generate | auto sistem | BR-001, tidak ditampilkan di form |
| nama_layanan | Nama Layanan | text | Ya | maks 100 char | manual | mis. Pendaftaran Poliklinik, CS, MCU |
| unit | Unit/Poli | dropdown (lookup) | Ya | dari master Unit (A3) | lookup A3 | field kanonik `unit`; pemilik layanan (BR-002) |
| inisial_antrean | Inisial/Prefix Seri | text | Ya | **unik se-RS**, **1–3 char alfanumerik** | manual | BR-003; identitas seri dipakai Sistem Antrian |
| format_nomor | Format Nomor | text | Ya | pola `{inisial}-{NNN}`, jumlah digit padding dapat dikonfigurasi | default `{inisial}-{000}` (mis. `A-001`) | BR-008; eksekusi penomoran di Sistem Antrian |
| jenis_reset | Aturan Reset | dropdown | Ya | enum: Harian / Terjadwal | default Harian | BR-005 |
| jam_reset | Jam Reset | time | Kondisional | wajib bila jenis_reset=Terjadwal; format HH:mm | manual | mis. 13:00 pergantian sesi (BR-005) |
| waktu_tunggu | Waktu Tunggu | numerik | Ya | maks 3 digit | manual | input waktu tunggu dalam numerik satuan **menit** |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik `status_aktif` (BR-007) |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | input teks manual bebas (bukan field kanonik) |

### 11.2 Form Tambah/Edit Loket / Meja Antrian (Tab Loket) — INPUT
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_loket | Kode Loket | text | Ya | unik, auto-generate | auto sistem | BR-001, tidak ditampilkan di form |
| nama_loket | Nama Loket | text | Ya | maks 50 char | manual | mis. Loket 1, Meja CS 2 |
| unit | Unit/Poli | dropdown (lookup) | Ya | dari master Unit (A3) | lookup A3 | field kanonik `unit`; pemilik loket (BR-002) |
| layanan_valid_ids | Layanan Valid (Valid Untuk) | lookup multi-select | Ya | **min. 1**; hanya layanan unit sama & Aktif | relasi ke layanan (Tab Layanan) | BR-004; relasi banyak-ke-banyak; form ini juga dibuka via aksi Ubah pada daftar (FR-014), terfokus ke field ini |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik `status_aktif` (BR-007) |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | input teks manual bebas (bukan field kanonik) |

### 11.3 Relasi *Valid Untuk* (entitas penghubung) — DATA
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| loket_id | Loket | lookup | Ya | FK ke loket | sistem | bagian PK komposit |
| layanan_id | Layanan | lookup | Ya | FK ke layanan | sistem | bagian PK komposit; unit harus sama (BR-004) |

### 11.4 Daftar Layanan (Tab Layanan) — TAMPIL DATA
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Layanan | layanan.nama_layanan | text | sort A-Z | |
| Unit | layanan.unit (A3) | text | filter | |
| Inisial | layanan.inisial_antrean | badge | sort | |
| Format Nomor | layanan.format_nomor | text (mis. `A-000`) | – | |
| Aturan Reset | layanan.jenis_reset (+jam) | text (mis. "Terjadwal 13:00") | filter | |
| Status | layanan.status_aktif | badge (Aktif/Nonaktif) | filter | warna abu jika nonaktif |

### 11.5 Daftar Loket (Tab Loket) — TAMPIL DATA
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Loket | loket.nama_loket | text | sort A-Z | |
| Unit | loket.unit (A3) | text | filter | |
| Jumlah Layanan Valid | count relasi valid-untuk (status Aktif) | angka saja (mis. "3") | sort | **hanya jumlah, tanpa daftar rinci inline**; rincian via aksi Detail/Ubah (BR-009, FR-006) |
| Status | loket.status_aktif | badge (Aktif/Nonaktif) | filter | BR-007 |
| Aksi | – | tombol **Detail** & **Ubah** (+ aksi umum: nonaktif/hapus) | – | Detail = lihat layanan valid (baca, panel/modal); Ubah = mengarahkan ke **form loket penuh** terfokus pada layanan valid (FR-014, US-010) |

### 11.6 Detail Layanan Valid Loket (panel/modal dari aksi Detail) — TAMPIL DATA
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Layanan | layanan.nama_layanan (via relasi valid-untuk) | text | sort A-Z | hanya layanan valid pada loket terpilih |
| Inisial | layanan.inisial_antrean | badge | – | identitas seri (BR-003) |
| Aturan Reset | layanan.jenis_reset (+jam) | text | – | konteks operasional (read-only) |
| Status | layanan.status_aktif | badge (Aktif/Nonaktif) | – | layanan Nonaktif ditandai (tidak dipanggil operasional, BR-007) |

> Semua field dapat ditelusuri ke FR/Alur terkait (mis. `inisial_antrean` → FR-004/BR-003; `format_nomor` → BR-008; `layanan_valid_ids` → FR-008/FR-010/FR-014/BR-004; kolom Jumlah Layanan Valid → FR-006/BR-009; aksi Detail → FR-014 (baca); aksi Ubah → FR-014 (mengarah ke form loket penuh)).

## 12. Non-Functional Requirements

- **NFR-001 (Konsistensi)** Master ini adalah satu sumber kebenaran; perubahan tersedia bagi Sistem Antrian/Kiosk pada pembacaan berikutnya.
- **NFR-002 (Integritas)** Keunikan `inisial_antrean` se-RS & kode auto-generate dijamin di level basis data (unique constraint), bukan hanya validasi UI. *(BR-001, BR-003)*
- **NFR-003 (Usability)** UI dua-tab sederhana, dapat dioperasikan admin tunggal RS Tipe C&D tanpa pelatihan teknis; daftar loket ringkas (jumlah layanan + aksi Detail/Ubah) sehingga tabel tetap mudah dipindai; aksi **Ubah** membawa admin ke form loket penuh yang sudah terfokus ke bagian layanan valid sehingga tidak perlu mencari menu edit secara manual; pesan error jelas (mis. inisial duplikat, inisial >3 char/non-alfanumerik, loket tanpa layanan). *(BR-009, FR-014)*
- **NFR-004 (Keamanan/RBAC)** Akses **baca & ubah** master ini mengikuti **pengaturan peran & hak akses** pada master Role/Hak Akses (A18/A53); tidak ada peran yang di-hardcode di modul ini.
- **NFR-005 (Auditabilitas dasar)** Sistem mencatat pembuat & waktu ubah (created/updated by, timestamp) untuk setiap entitas, termasuk perubahan relasi *valid-untuk* via form loket yang dibuka dari aksi Ubah.
- **NFR-006 (Ketersediaan saat operasional)** Kebutuhan **cache/offline** perangkat Antrian/Kiosk saat internet RS tidak stabil **didetailkan pada PRD Kiosk / Sistem Antrian terpisah** dan berada di luar lingkup master ini.
- **NFR-007 (Skala)** Mendukung jumlah loket & layanan tingkat RS Tipe C&D (puluhan), bukan ribuan; performa daftar < 2 detik.

## 13. Integrasi Eksternal

Modul ini **master data murni** — **tidak ada integrasi eksternal langsung** (tidak ke BPJS/SATUSEHAT/Disdukcapil). Integrasi bersifat **internal antar-modul SIMRS** (modul ini = produsen konfigurasi, modul lain = konsumen):

| Sistem | Arah | Data | Catatan |
|--------|------|------|---------|
| **Sistem Antrian SIMRS v2** (termasuk pengaturan antrean operasional & layar pemanggilan) | Konsumen ← master | layanan (inisial, format_nomor, jenis_reset, jam_reset) + relasi *valid-untuk* | Satu kesatuan fitur operasional: petugas pilih loket, pemanggilan nomor, layar/papan display, suara panggil, counter, dan **eksekusi reset & penomoran** (BR-005, BR-008) berjalan di sini. |
| **Mesin Kiosk Mandiri (in-house)** | Konsumen ← master | layanan Pendaftaran (untuk penerbitan antrean awal) | Pemetaan menu Kiosk→layanan & kebutuhan offline dikelola PRD Kiosk terpisah (Out Scope). |
| **Master Unit (A3)** | Lookup → modul ini | daftar unit | Pemilik loket & layanan (BR-002). |
| **User/Staff (A1/A2), Role/RBAC (A18/A53)** | Lookup/akses | peran admin & petugas | Hak akses master mengikuti pengaturan Role (NFR-004); pengikatan petugas ke loket = operasional (Out Scope). |

*Mekanisme teknis konsumsi data master oleh Sistem Antrian/Kiosk (API internal / shared DB / sync) ditentukan tim pengembang saat implementasi.*