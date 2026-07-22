# Product Requirement Document (PRD)
# A44 — Paket Pelayanan MCU

---

## 1. Metadata Dokumen

* **Approval**: [Kepala Bidang IT / Kepala Instalasi Laboratorium / Kepala Radiologi, Jabatan, Tanggal]
* **Related Documents**:
  * A44 — Paket Pelayanan MCU (fitur ini)
  * G19 — Paket Pemeriksaan Laboratorium (referensi terkait)
  * G20 — Paket Pemeriksaan Radiologi (referensi terkait)
  * A4 — Master Data Barang Farmasi (sumber item tindakan/pemeriksaan lab)
  * [PERLU KONFIRMASI] Master Data Tindakan Lab (sumber item yang dapat dimasukkan ke paket lab)
  * [PERLU KONFIRMASI] Master Data Item Radiologi (sumber item yang dapat dimasukkan ke paket radiologi)
  * [PERLU KONFIRMASI] Master Data Klinik / Poli (sumber data klinik untuk konfigurasi auto-order)
  * B1 — Pendaftaran Rawat Jalan (trigger pendaftaran klinik → auto-order paket)
  * G18 — Paket Tarif Layanan (paket harga/tarif; berbeda dari paket order pelayanan ini)
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-30 | 1.0 | Draft awal PRD Paket Pelayanan Lab & Radiologi |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Paket Pelayanan** memungkinkan Admin RS untuk mengkonfigurasi **bundel pemeriksaan** — yaitu satu kumpulan item pemeriksaan laboratorium atau radiologi yang dikelompokkan menjadi satu paket bernama. Paket dapat di-order sebagai satu unit dari modul Order Lab / Order Radiologi, sehingga klinisi tidak perlu memilih item satu per satu. Modul ini juga menyediakan fitur **Konfigurasi Auto-Order per Klinik**: klinik tertentu dapat dikonfigurasi agar setiap pendaftaran pasien baru ke klinik tersebut secara otomatis men-trigger pembuatan order paket lab dan/atau paket radiologi yang telah ditentukan.

Terdapat dua sub-modul utama:
* **Paket Lab (G19)**: Bundel item pemeriksaan laboratorium. Contoh: "Paket MCU Basic" = Darah Lengkap + Gula Darah Puasa + Kolesterol Total + Asam Urat.
* **Paket Radiologi (G20)**: Bundel item pemeriksaan radiologi. Contoh: "Paket MCU Thorax" = Foto Thorax PA + Foto Thorax Lateral.
* **Konfigurasi Klinik**: Mapping klinik → paket yang otomatis ter-order saat pendaftaran pasien. Contoh: Poli MCU → auto-order "Paket MCU Basic" (lab) + "Paket MCU Thorax" (radiologi).

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Klinisi / perawat memilih item lab dan radiologi satu per satu saat membuat order; tidak ada bundel — rawan kelupaan item dan memakan waktu lama.
- Paket MCU atau panel pemeriksaan tertentu didefinisikan secara informal (verbal, catatan fisik, atau spreadsheet) dan tidak terintegrasi dengan sistem order.
- Tidak ada mekanisme otomatis yang men-trigger order lab/radiologi berdasarkan klinik tempat pasien mendaftar; petugas harus ingat dan membuat order manual.
- Tidak ada konsistensi: pemeriksaan yang sama bisa dipesan dengan kombinasi item berbeda oleh dokter berbeda untuk kondisi yang sama.

**To-Be (Workflow Digital yang Diusulkan):**
- **Phase 1**: Admin RS mendefinisikan paket lab dan radiologi melalui form UI terstruktur dengan item-selector (multi-select dari master tindakan/item). Admin mengonfigurasi mapping klinik → paket. Saat order, klinisi cukup memilih nama paket; sistem otomatis memasukkan semua item yang telah dikonfigurasi ke dalam order. Saat pendaftaran ke klinik yang sudah dikonfigurasi, sistem otomatis membuat draft order paket tanpa perlu input manual petugas.
- **Phase 2**: Paket dapat di-trigger tidak hanya dari pendaftaran klinik tetapi juga dari tindakan medis / diagnosis tertentu di EMR (mis. bila dokter menginput diagnosis TB → sistem menyarankan auto-order "Paket Lab TB"). Mendukung approval berjenjang untuk order yang di-generate otomatis.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Efisiensi pembuatan order | Waktu pembuatan order lab/radiologi menggunakan paket ≤ 30 detik (vs rata-rata > 3 menit dengan pilih item manual) |
| 2 | Konsistensi pemeriksaan | 0 variasi item dalam satu tipe paket yang sama antara klinisi berbeda setelah go-live |
| 3 | Kelengkapan item | ≥ 95% order yang menggunakan paket tidak memerlukan penambahan item manual |
| 4 | Adopsi fitur | ≥ 80% order lab/radiologi di klinik yang sudah dikonfigurasi paket menggunakan paket (bukan pilih manual) dalam 1 bulan pertama go-live |
| 5 | Keberhasilan auto-order | ≥ 99% pendaftaran pasien ke klinik yang sudah dikonfigurasi berhasil men-generate draft order otomatis tanpa error |
| 6 | Kemudahan pengelolaan | Admin dapat membuat/mengubah paket dan konfigurasi klinik tanpa perubahan kode aplikasi |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD + Auto-Order) | Phase 2 (Advanced: Trigger EMR + Approval) |
|---------------|----------------------------------|--------------------------------------------|
| CRUD Paket Lab | Buat / edit / nonaktifkan paket lab beserta daftar item (multi-select dari master tindakan lab) | — |
| CRUD Paket Radiologi | Buat / edit / nonaktifkan paket radiologi beserta daftar item (multi-select dari master item radiologi) | — |
| Item selector dalam paket | Search + multi-select item dari master; tampilkan nama & kode item | Tambah qty per item jika diperlukan |
| Konfigurasi Auto-Order per Klinik | Mapping klinik → 0..N paket lab + 0..N paket radiologi yang auto-order saat pendaftaran | — |
| Trigger auto-order saat pendaftaran | Saat pasien terdaftar ke klinik yang sudah dikonfigurasi, sistem otomatis membuat **draft** order lab & radiologi dengan item dari paket | Trigger dari diagnosis / tindakan dokter di EMR |
| Penggunaan paket saat order manual | Pada form Order Lab / Order Radiologi, tersedia opsi "Pilih dari Paket" di samping pilih item manual | — |
| Preview item paket | Sebelum simpan/eksekusi order, tampilkan ringkasan item yang akan di-order dari paket yang dipilih | — |
| Approval auto-order | — | Draft auto-order memerlukan konfirmasi klinisi / approval sebelum dieksekusi ke sistem lab/radiologi |
| Trigger dari diagnosis/tindakan EMR | — | Konfigurasi: diagnosis ICD-10 X → sarankan paket Y; klinisi dapat accept/reject saran |

**Out of Scope**:
- Paket tarif / harga layanan (ditangani G18 — Paket Tarif Layanan).
- Pengelolaan item master lab dan radiologi itu sendiri (ada di modul Master Data tindakan/item masing-masing).
- Integrasi LIS (Laboratory Information System) dan RIS (Radiology Information System) secara langsung; modul ini hanya membuat order di SIMRS.
- Paket yang mengombinasikan lab + radiologi + obat dalam satu paket tunggal (setiap paket scope ke satu jenis pelayanan: lab ATAU radiologi).
- Program diskon berbasis paket (ditangani G21 — Program Diskon).

---

## 5. Related Features

* **B1 — Pendaftaran Rawat Jalan**: Trigger utama auto-order. Saat pasien selesai didaftarkan ke klinik tertentu, B1 memanggil service auto-order yang memeriksa konfigurasi klinik dan membuat draft order sesuai paket yang dikonfigurasi.
* **Order Lab (modul EMR/Penunjang Medis)**: Konsumen paket lab. Form order lab menyediakan opsi "Pilih dari Paket" yang memanggil `GET /api/v1/service-packages/lab` dan memasukkan seluruh item paket ke dalam order sekaligus.
* **Order Radiologi (modul EMR/Penunjang Medis)**: Konsumen paket radiologi. Sama seperti order lab, tersedia opsi "Pilih dari Paket" yang memanggil `GET /api/v1/service-packages/radiology`.
* **[PERLU KONFIRMASI] Master Data Tindakan Lab**: Sumber daftar item yang dapat ditambahkan ke paket lab. API `GET /api/v1/master/lab-items` digunakan di item-selector form paket.
* **[PERLU KONFIRMASI] Master Data Item Radiologi**: Sumber daftar item yang dapat ditambahkan ke paket radiologi.
* **[PERLU KONFIRMASI] Master Data Klinik / Poli**: Sumber daftar klinik yang tersedia untuk dikonfigurasi auto-order.

---

## 6. Business Process & User Stories

### State Machine — Status Paket Pelayanan

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Paket aktif dan dapat digunakan | Muncul di dropdown "Pilih dari Paket" pada form Order Lab/Radiologi; dapat dipilih di konfigurasi klinik | → `NONAKTIF` | → `NONAKTIF` |
| `NONAKTIF` | Paket dinonaktifkan | Tidak muncul di dropdown order; konfigurasi klinik yang masih merujuk paket ini ditandai warning; order historis yang menggunakan paket ini **tetap tersimpan** | → `AKTIF` | → `AKTIF` |

> **[ASUMSI]** Paket tidak dapat dihapus (hard delete) jika sudah pernah digunakan dalam ≥ 1 order historis; hanya dapat dinonaktifkan.

### State Machine — Status Auto-Order (Draft Order yang Di-generate Otomatis)

| Status | Deskripsi | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------|--------------------|
| `DRAFT` | Order dibuat otomatis oleh sistem, menunggu konfirmasi petugas | → `CONFIRMED` (klinisi/perawat konfirmasi) / → `CANCELLED` (petugas batalkan) | → `PENDING_APPROVAL` (masuk flow approval) |
| `CONFIRMED` | Order sudah dikonfirmasi, diteruskan ke sistem lab/radiologi | → `CANCELLED` (sebelum diproses lab/RIS) | — |
| `CANCELLED` | Draft auto-order dibatalkan | — | — |

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A44-01 | Admin Facility Management | Membuat paket lab baru dengan memilih item tindakan lab dari master | Menyediakan bundel pemeriksaan lab siap-pakai untuk klinisi |
| US-A44-02 | Admin Facility Management | Mengedit item dalam paket lab yang sudah ada | Memperbarui komposisi paket tanpa membuat paket baru |
| US-A44-03 | Admin Facility Management | Menonaktifkan paket lab yang tidak lagi relevan | Menjaga daftar paket tetap bersih tanpa kehilangan data historis |
| US-A44-04 | Admin Facility Management | Membuat paket radiologi baru dengan memilih item pemeriksaan radiologi | Menyediakan bundel pemeriksaan radiologi siap-pakai untuk klinisi |
| US-A44-05 | Admin Facility Management | Mengedit item dalam paket radiologi yang sudah ada | Memperbarui komposisi paket |
| US-A44-06 | Admin Facility Management | Menonaktifkan paket radiologi yang tidak relevan | Menjaga daftar paket bersih |
| US-A44-07 | Admin Facility Management | Mengkonfigurasi klinik tertentu untuk auto-order paket lab dan/atau radiologi saat ada pendaftaran pasien | Memastikan pasien yang mendaftar ke klinik tertentu langsung mendapatkan pemeriksaan yang sudah distandarkan |
| US-A44-08 | Perawat / Dokter | Memilih paket saat membuat order lab, agar semua item dalam paket otomatis masuk ke order | Mengurangi waktu dan risiko kelupaan item saat membuat order |
| US-A44-09 | Perawat / Admin Pendaftaran | Mengonfirmasi atau membatalkan draft auto-order yang dibuat sistem saat pendaftaran pasien | Memastikan order yang di-generate otomatis sesuai dengan kebutuhan pasien aktual |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: CRUD Paket Lab**

* **User Story**: Sebagai Admin Facility Management, saya ingin membuat, mengedit, dan menonaktifkan paket lab yang berisi kumpulan item tindakan laboratorium, agar klinisi dapat memesan bundel pemeriksaan lab dengan sekali pilih.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Halaman daftar paket lab menampilkan tabel dengan kolom: Nama Paket, Jumlah Item, Status (Aktif/Nonaktif), Tanggal Dibuat, Aksi (Edit, Toggle Aktif/Nonaktif).
    * **AC 2**: Form tambah/edit paket lab menyediakan field: Nama Paket (wajib), Deskripsi (opsional), dan komponen **Item Selector** (multi-select item tindakan lab dari master).
    * **AC 3**: Item Selector mendukung pencarian real-time (search-as-you-type) berdasarkan nama atau kode item; hasil muncul dalam ≤ 300ms.
    * **AC 4**: Item yang sudah dipilih ditampilkan sebagai chips/tags yang dapat dihapus satu per satu.
    * **AC 5**: Sistem menolak penyimpanan jika Nama Paket kosong atau jika tidak ada item yang dipilih (minimal 1 item). Pesan error: *"Nama paket wajib diisi"* / *"Paket harus memiliki minimal 1 item pemeriksaan"*.
    * **AC 6**: Sistem menolak penyimpanan jika Nama Paket sudah digunakan oleh paket lab lain (case-insensitive). Pesan: *"Nama paket sudah digunakan"*.
    * **AC 7**: Setelah berhasil disimpan, paket langsung berstatus `AKTIF` dan tersedia di dropdown order lab serta di konfigurasi klinik.
    * **AC 8**: Toggle nonaktif menampilkan konfirmasi jika paket masih terdaftar di konfigurasi klinik: *"Paket ini digunakan oleh X klinik dalam konfigurasi auto-order. Menonaktifkan paket tidak akan menghapus konfigurasi tersebut, namun auto-order tidak akan berjalan. Lanjutkan?"*

* **Validasi**:

  **A. Wording Validasi (Frontend / API Response)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Paket | Text | Required; Max 150 karakter; Unik (case-insensitive) per tipe (Lab) | "Nama paket wajib diisi" / "Nama paket sudah digunakan" | "Contoh: Paket MCU Basic, Panel Diabetes, Paket Hepatitis" |
  | Deskripsi | Textarea | Opsional; Max 500 karakter | "Deskripsi maksimal 500 karakter" | "Jelaskan tujuan atau indikasi klinis paket ini" |
  | Item Lab | Multi-select | Required; min 1 item; tidak ada duplikat item dalam satu paket | "Paket harus memiliki minimal 1 item" / "Item tidak boleh duplikat dalam satu paket" | "Cari dan pilih item pemeriksaan lab yang termasuk dalam paket ini" |

---

**Fitur: CRUD Paket Radiologi**

* **User Story**: Sebagai Admin Facility Management, saya ingin membuat, mengedit, dan menonaktifkan paket radiologi yang berisi kumpulan item pemeriksaan radiologi, agar klinisi dapat memesan bundel pemeriksaan radiologi dengan sekali pilih.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Halaman daftar paket radiologi menampilkan tabel dengan kolom: Nama Paket, Jumlah Item, Status (Aktif/Nonaktif), Tanggal Dibuat, Aksi (Edit, Toggle Aktif/Nonaktif).
    * **AC 2**: Form tambah/edit paket radiologi menyediakan field: Nama Paket (wajib), Deskripsi (opsional), dan Item Selector (multi-select item pemeriksaan radiologi dari master).
    * **AC 3**: Item Selector mendukung pencarian real-time berdasarkan nama atau kode item radiologi (≤ 300ms).
    * **AC 4**: Item yang sudah dipilih ditampilkan sebagai chips/tags yang dapat dihapus.
    * **AC 5**: Sistem menolak penyimpanan jika Nama Paket kosong, duplikat, atau tidak ada item yang dipilih. Pesan error identik dengan paket lab.
    * **AC 6**: Setelah berhasil disimpan, paket langsung berstatus `AKTIF` dan tersedia di dropdown order radiologi serta di konfigurasi klinik.
    * **AC 7**: Toggle nonaktif menampilkan konfirmasi jika paket masih terdaftar di konfigurasi klinik (pesan identik dengan paket lab).

* **Validasi**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Paket | Text | Required; Max 150 karakter; Unik (case-insensitive) per tipe (Radiologi) | "Nama paket wajib diisi" / "Nama paket sudah digunakan" | "Contoh: Paket MCU Thorax, Panel Bone Survey, Paket Abdomen Lengkap" |
  | Deskripsi | Textarea | Opsional; Max 500 karakter | "Deskripsi maksimal 500 karakter" | "Jelaskan indikasi klinis atau tujuan paket radiologi ini" |
  | Item Radiologi | Multi-select | Required; min 1 item; tidak ada duplikat | "Paket harus memiliki minimal 1 item" | "Cari dan pilih item pemeriksaan radiologi yang termasuk dalam paket ini" |

---

**Fitur: Konfigurasi Auto-Order Paket per Klinik**

* **User Story**: Sebagai Admin Facility Management, saya ingin mengkonfigurasi klinik tertentu agar saat ada pendaftaran pasien, sistem otomatis membuat draft order untuk paket lab dan/atau paket radiologi yang sudah saya tentukan.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Halaman konfigurasi menampilkan daftar seluruh klinik yang terdaftar di sistem. Setiap klinik memiliki status konfigurasi: "Terkonfigurasi" (sudah ada ≥ 1 paket dipetakan) atau "Belum Dikonfigurasi".
    * **AC 2**: Admin dapat membuka halaman detail konfigurasi per klinik dan menambahkan/menghapus paket lab dan/atau paket radiologi yang akan di-auto-order.
    * **AC 3**: Dalam satu klinik, dapat dikonfigurasi: 0 atau lebih paket lab **DAN** 0 atau lebih paket radiologi secara independen (tidak wajib keduanya ada).
    * **AC 4**: Hanya paket berstatus `AKTIF` yang dapat dipilih dalam konfigurasi klinik. Paket nonaktif tidak muncul di dropdown.
    * **AC 5**: Jika paket yang sudah dikonfigurasi dinonaktifkan, baris konfigurasi tersebut ditandai dengan warning "Paket nonaktif — auto-order tidak akan berjalan" namun tidak otomatis dihapus dari konfigurasi.
    * **AC 6**: Konfigurasi yang telah disimpan aktif segera (tanpa restart) — pendaftaran berikutnya ke klinik tersebut langsung men-trigger auto-order.
    * **AC 7**: Admin dapat menonaktifkan seluruh auto-order untuk klinik tertentu dengan toggle "Aktifkan Auto-Order" tanpa harus menghapus konfigurasi paket.

* **Validasi**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Pilih Paket Lab | Multi-select | Opsional; hanya paket Lab berstatus AKTIF | — | "Pilih satu atau lebih paket lab yang akan otomatis di-order saat pasien mendaftar ke klinik ini" |
  | Pilih Paket Radiologi | Multi-select | Opsional; hanya paket Radiologi berstatus AKTIF | — | "Pilih satu atau lebih paket radiologi yang akan otomatis di-order saat pasien mendaftar ke klinik ini" |

---

**Fitur: Auto-Order Paket saat Pendaftaran Pasien**

* **User Story**: Sebagai perawat / admin pendaftaran, saya ingin sistem otomatis membuat draft order lab dan radiologi sesuai paket yang dikonfigurasi saat saya mendaftarkan pasien ke klinik tertentu, agar saya tidak perlu membuat order manual satu per satu.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Ketika proses pendaftaran pasien ke klinik selesai (status pendaftaran `TERDAFTAR`), sistem secara otomatis memeriksa apakah klinik tujuan memiliki konfigurasi auto-order aktif.
    * **AC 2**: Jika ada konfigurasi aktif: sistem membuat draft order lab (satu order berisi semua item dari semua paket lab yang dikonfigurasi) dan/atau draft order radiologi (satu order berisi semua item dari semua paket radiologi yang dikonfigurasi) dengan status `DRAFT`.
    * **AC 3**: Petugas mendapat notifikasi/indikator pada layar pendaftaran: *"Draft order lab dan radiologi telah dibuat otomatis. Silakan konfirmasi di halaman order."*
    * **AC 4**: Petugas (klinisi/perawat) dapat melihat draft auto-order di halaman Order Lab / Order Radiologi dan dapat: (a) **Konfirmasi** → order dieksekusi ke sistem lab/radiologi, atau (b) **Batalkan** → draft dihapus / dibatalkan.
    * **AC 5**: Petugas dapat mengedit item dalam draft sebelum dikonfirmasi (menambah atau menghapus item dari paket yang sudah dipilih).
    * **AC 6**: Jika auto-order gagal dibuat (error sistem), proses pendaftaran **tidak boleh gagal** — pendaftaran tetap berhasil, dan sistem mencatat log error auto-order. Petugas mendapat notifikasi error: *"Pendaftaran berhasil, namun auto-order gagal dibuat. Silakan buat order manual."*
    * **AC 7**: Jika klinik tidak memiliki konfigurasi auto-order, proses pendaftaran berjalan normal tanpa membuat draft order.

---

**Fitur: Pilih Paket saat Order Lab / Radiologi (Manual)**

* **User Story**: Sebagai dokter atau perawat, saya ingin memilih paket saat membuat order lab atau radiologi secara manual, agar semua item dalam paket otomatis masuk ke order tanpa saya pilih satu per satu.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Order Lab dan Order Radiologi menyediakan dua mode entry: (a) **Pilih Manual** (item satu per satu, behaviour existing) dan (b) **Pilih dari Paket** (pilih paket, item otomatis masuk).
    * **AC 2**: Saat mode "Pilih dari Paket" dipilih, muncul dropdown/search paket yang hanya menampilkan paket berstatus `AKTIF` sesuai tipe order (Lab → paket lab, Radiologi → paket radiologi).
    * **AC 3**: Setelah paket dipilih, sistem menampilkan **preview item** paket (nama item, kode) dalam tabel ringkasan sebelum dikonfirmasi.
    * **AC 4**: Klinisi dapat memilih **lebih dari satu paket** sekaligus dalam satu order; item dari semua paket yang dipilih digabung (dengan penghapusan duplikat jika ada item yang sama di dua paket).
    * **AC 5**: Klinisi dapat menghapus item individual dari daftar setelah paket dipilih (jika ada item yang tidak diperlukan untuk pasien tertentu) sebelum order dikonfirmasi.
    * **AC 6**: Order yang menggunakan paket mencatat referensi `package_id` sumber paket (untuk keperluan analitik & audit).

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

#### Table: `service_packages`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` | — |
| `name` | VARCHAR(150) | NOT NULL | Nama paket; UNIQUE per `type` (case-insensitive) |
| `type` | ENUM(`LAB`, `RADIOLOGY`) | NOT NULL | Jenis paket |
| `description` | TEXT | NULLABLE | Deskripsi/indikasi klinis |
| `is_active` | BOOLEAN | NOT NULL, default `true` | Status aktif/nonaktif |
| `created_by` | UUID | NOT NULL, FK → `users(id)` | — |
| `updated_by` | UUID | NULLABLE, FK → `users(id)` | — |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |

**Unique constraint**: `(name, type)` case-insensitive — nama unik dalam tipe yang sama.

#### Table: `service_package_items`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key | — |
| `package_id` | UUID | NOT NULL, FK → `service_packages(id)` ON DELETE CASCADE | — |
| `item_id` | UUID | NOT NULL | FK → tabel master item sesuai tipe paket: `lab_items(id)` atau `radiology_items(id)` [PERLU KONFIRMASI nama tabel] |
| `item_type` | ENUM(`LAB`, `RADIOLOGY`) | NOT NULL | Harus konsisten dengan `service_packages.type` induk |
| `item_name` | VARCHAR(255) | NOT NULL | Snapshot nama item saat paket disimpan (untuk toleransi perubahan nama master) |
| `item_code` | VARCHAR(50) | NULLABLE | Snapshot kode item |
| `sort_order` | SMALLINT | NOT NULL, default `0` | Urutan tampilan item dalam paket |

**Unique constraint**: `(package_id, item_id)` — satu item tidak boleh duplikat dalam satu paket.

#### Table: `clinic_package_settings`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key | — |
| `clinic_id` | UUID | NOT NULL, FK → `clinics(id)` [PERLU KONFIRMASI] | Klinik yang dikonfigurasi |
| `package_id` | UUID | NOT NULL, FK → `service_packages(id)` | Paket yang dikonfigurasi untuk klinik ini |
| `is_enabled` | BOOLEAN | NOT NULL, default `true` | Toggle aktif/nonaktif per baris konfigurasi |
| `created_by` | UUID | NOT NULL, FK → `users(id)` | — |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |

**Unique constraint**: `(clinic_id, package_id)` — satu paket tidak boleh dikonfigurasi dua kali untuk klinik yang sama.

#### Table: `auto_order_logs`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key | — |
| `registration_id` | UUID | NOT NULL, FK → `registrations(id)` | Pendaftaran yang men-trigger auto-order |
| `clinic_id` | UUID | NOT NULL | Klinik tempat pendaftaran |
| `package_id` | UUID | NOT NULL | Paket yang di-trigger |
| `order_id` | UUID | NULLABLE | ID order yang dibuat (null jika gagal) |
| `status` | ENUM(`SUCCESS`, `FAILED`, `CANCELLED`) | NOT NULL | Status hasil auto-order |
| `error_message` | TEXT | NULLABLE | Pesan error jika status = FAILED |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/service-packages` | List paket; `?type=LAB\|RADIOLOGY` filter by tipe; `?is_active=true` untuk dropdown konsumen |
| GET | `/api/v1/service-packages/{id}` | Detail paket beserta list item |
| POST | `/api/v1/service-packages` | Buat paket baru (lab atau radiologi) |
| PUT | `/api/v1/service-packages/{id}` | Edit paket (nama, deskripsi, komposisi item) |
| PATCH | `/api/v1/service-packages/{id}/toggle-active` | Toggle status AKTIF ↔ NONAKTIF |
| GET | `/api/v1/clinic-package-settings` | List konfigurasi klinik; `?clinic_id=` filter per klinik |
| GET | `/api/v1/clinic-package-settings/{clinic_id}` | Detail konfigurasi paket untuk satu klinik |
| PUT | `/api/v1/clinic-package-settings/{clinic_id}` | Simpan/update konfigurasi paket untuk satu klinik (upsert) |
| PATCH | `/api/v1/clinic-package-settings/{clinic_id}/toggle` | Toggle is_enabled auto-order untuk satu klinik |
| POST | `/api/v1/auto-orders/trigger` | Trigger auto-order dari pendaftaran (dipanggil internal oleh B1 saat status pendaftaran = TERDAFTAR) |
| GET | `/api/v1/master/lab-items` | [PERLU KONFIRMASI] List item lab untuk item-selector paket |
| GET | `/api/v1/master/radiology-items` | [PERLU KONFIRMASI] List item radiologi untuk item-selector paket |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT Paket)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `name` | Nama Paket | Text | Ya | Required; Max 150 karakter; Unik case-insensitive per tipe | Input admin | Trim spasi sebelum validasi & simpan |
| `type` | Tipe Paket | Dropdown / Readonly | Ya | Enum: `LAB` \| `RADIOLOGY`; di form create dipilih di awal (tab/page terpisah) | Input admin atau ditentukan dari context halaman | Di form edit, tipe tidak dapat diubah |
| `description` | Deskripsi | Textarea | Tidak | Max 500 karakter | Input admin | "Jelaskan indikasi klinis paket ini" |
| `items` | Item Pemeriksaan | Multi-select (item selector) | Ya | Min 1 item; tidak ada duplikat | Master tindakan lab / item radiologi (via API) | Tampilkan nama + kode; simpan snapshot `item_name` dan `item_code` di tabel `service_package_items` |
| `is_active` | — | — | — | — | Sistem | Tidak diekspos di form create; otomatis `true`. Dikelola via toggle di list view |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View Paket)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nama Paket | `name` | Plain text | Sort ASC/DESC; Search (contains) | — |
| Tipe | `type` | Badge: "Lab" (biru) / "Radiologi" (ungu) | Filter: Lab / Radiologi / Semua | — |
| Jumlah Item | COUNT dari `service_package_items` | Integer | Sort ASC/DESC | — |
| Digunakan di Klinik | COUNT dari `clinic_package_settings` | Integer | — | Jumlah klinik yang menggunakan paket ini dalam konfigurasi |
| Status | `is_active` | Badge: "Aktif" (hijau) / "Nonaktif" (abu) | Filter: Semua / Aktif / Nonaktif | Default: Aktif |
| Dibuat | `created_at` | dd MMM yyyy | Sort ASC/DESC | — |
| Aksi | — | Tombol Edit, Toggle Aktif/Nonaktif | — | — |

#### 8.3.3 Spesifikasi Data — Tampilan Konfigurasi Klinik

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nama Klinik | `clinic.name` | Plain text | Search; Sort ASC/DESC | — |
| Paket Lab | Nama paket lab terkonfigurasi | Badge list atau jumlah paket | — | Tampilkan nama singkat; jika banyak → "3 paket" + tooltip |
| Paket Radiologi | Nama paket radiologi terkonfigurasi | Badge list atau jumlah paket | — | — |
| Auto-Order | `is_enabled` (level klinik) | Toggle + badge: "Aktif" / "Nonaktif" | Filter: Aktif / Nonaktif | — |
| Status | "Terkonfigurasi" / "Belum Dikonfigurasi" | Badge | Filter | — |

**Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A44-01 | Nama paket unik secara case-insensitive per tipe (LAB dan RADIOLOGY boleh punya nama sama, tapi sesama LAB tidak boleh duplikat). |
| BR-A44-02 | Satu paket minimal harus memiliki 1 item pemeriksaan. Paket kosong tidak dapat disimpan. |
| BR-A44-03 | Item dalam paket tidak boleh duplikat (item yang sama tidak dapat masuk dua kali dalam satu paket). |
| BR-A44-04 | Tipe paket (`LAB`/`RADIOLOGY`) tidak dapat diubah setelah paket dibuat. |
| BR-A44-05 | `item_name` dan `item_code` dalam `service_package_items` disimpan sebagai snapshot saat paket disimpan. Jika nama item di master berubah, snapshot dalam paket tidak otomatis berubah (harus edit paket manual). |
| BR-A44-06 | Paket yang sudah pernah digunakan dalam ≥ 1 order (historis) tidak dapat dihapus secara hard delete; hanya dapat dinonaktifkan. |
| BR-A44-07 | Paket yang dinonaktifkan tidak dapat dipilih dalam konfigurasi klinik baru; konfigurasi lama yang merujuk paket nonaktif ditandai warning tetapi tidak dihapus otomatis. |
| BR-A44-CFG-01 | Dalam satu klinik, paket yang sama tidak boleh dikonfigurasi dua kali (unique per `clinic_id + package_id`). |
| BR-A44-CFG-02 | Konfigurasi klinik dapat memuat 0 paket lab dan 1+ paket radiologi (atau sebaliknya); tidak wajib keduanya ada. |
| BR-A44-ORD-01 | Saat auto-order di-trigger, sistem membuat **satu** order lab (berisi semua item dari semua paket lab yang dikonfigurasi untuk klinik tersebut) dan **satu** order radiologi. Tidak dibuat satu order per paket. |
| BR-A44-ORD-02 | Jika ada item yang sama muncul di dua paket lab yang dikonfigurasi untuk satu klinik, item tersebut hanya dimasukkan **sekali** ke dalam order (deduplication). |
| BR-A44-ORD-03 | Auto-order hanya di-trigger jika `clinic_package_settings.is_enabled = true` untuk klinik yang bersangkutan. |
| BR-A44-ORD-04 | Kegagalan auto-order (error teknis) **tidak boleh memblokir** proses pendaftaran; pendaftaran tetap berhasil dan error dicatat di `auto_order_logs`. |
| BR-A44-ORD-05 | Draft auto-order yang belum dikonfirmasi selama > 24 jam secara otomatis dibatalkan oleh sistem (status → `CANCELLED`) dan dicatat di log. **[PERLU KONFIRMASI]** durasi timeout. |

---

## 9. Workflow / BPMN Interpretation

> **[ASUMSI]** Tidak ada BPMN Lucidchart tersedia untuk modul ini. Alur berdasarkan analisis kebutuhan bisnis yang disampaikan.

**Alur Setup Paket (Admin Facility Management):**

1. Admin buka menu **Facility Management → Paket Pelayanan**.
2. Admin pilih tab **Paket Lab** atau **Paket Radiologi**.
3. Klik **+ Tambah Paket** → form muncul.
4. Admin isi Nama Paket, Deskripsi (opsional), dan cari/pilih item melalui Item Selector.
5. Admin klik **Simpan** → sistem validasi → paket tersimpan berstatus `AKTIF`.
6. Paket langsung tersedia di dropdown order dan di konfigurasi klinik.

**Alur Konfigurasi Auto-Order Klinik (Admin Facility Management):**

1. Admin buka menu **Facility Management → Konfigurasi Auto-Order Klinik**.
2. Admin pilih klinik yang ingin dikonfigurasi → halaman detail konfigurasi klinik terbuka.
3. Admin pilih satu atau lebih paket lab dari dropdown (hanya paket LAB aktif).
4. Admin pilih satu atau lebih paket radiologi dari dropdown (hanya paket RADIOLOGY aktif).
5. Admin klik **Simpan Konfigurasi** → konfigurasi aktif segera.

**Alur Auto-Order saat Pendaftaran Pasien:**

1. Petugas pendaftaran / klinisi mendaftarkan pasien ke klinik X melalui modul B1 — Pendaftaran Rawat Jalan.
2. Saat status pendaftaran berubah menjadi `TERDAFTAR`, B1 memanggil internal service `/api/v1/auto-orders/trigger` dengan payload `{registration_id, clinic_id}`.
3. Sistem memeriksa `clinic_package_settings` untuk klinik X: apakah `is_enabled = true` dan ada paket aktif yang dikonfigurasi?
   - **Tidak ada konfigurasi / nonaktif** → tidak ada aksi; pendaftaran selesai normal.
   - **Ada konfigurasi aktif** → lanjut ke langkah 4.
4. Sistem mengumpulkan semua item dari semua paket lab yang dikonfigurasi (dengan deduplication) dan membuat **satu** draft order lab berstatus `DRAFT`.
5. Sistem mengumpulkan semua item dari semua paket radiologi yang dikonfigurasi (dengan deduplication) dan membuat **satu** draft order radiologi berstatus `DRAFT`.
6. Petugas menerima notifikasi: *"Draft order lab dan radiologi telah dibuat otomatis."*
7. Klinisi / perawat membuka halaman Order → lihat draft auto-order → review item → klik **Konfirmasi** atau **Batalkan**.
   - **Konfirmasi** → status `CONFIRMED`; order diteruskan ke sistem lab/radiologi.
   - **Batalkan** → status `CANCELLED`; dicatat di log.

**Alur Pilih Paket saat Order Manual:**

1. Dokter / perawat buka form Order Lab atau Order Radiologi.
2. Pilih mode **"Pilih dari Paket"**.
3. Cari dan pilih paket dari dropdown (hanya paket aktif sesuai tipe).
4. Sistem menampilkan preview item dalam paket.
5. Klinisi dapat menambah / menghapus item individual jika diperlukan.
6. Klinisi klik **Buat Order** → order tersimpan dengan referensi `package_id`.
