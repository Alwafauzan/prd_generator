# PRD — Master Data Standar Tarif Kamar (A43)

## 1. Metadata Dokumen

* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer, Tamtech International (Signature, Date); PIC PRD: Arif Aminudin.
* **Related Documents**:
  * Figma Design V1 — Master Data (node 1596-63766): https://www.figma.com/design/xx0q4R9Y4Fd4jb1kkDIjnu/Master-Data?node-id=1596-63766
  * PRD v1 (Affine workspace): https://affine.localtamtech.com/workspace/a09e12e2-8f0a-4cb8-bf52-44a72144d20b/kg1LGhd7GA-Di8COp-h0P
  * List Fitur V2.xlsx — sheet 'MVP Fitur Operasional' (A43); Master Data terkait: A15 Bangsal, A16 Kamar, A17 Bed, A20 Tipe Penjamin.
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 02 Juni 2026 | 1.0 – Draft awal | Draft awal master data standar tarif kamar |
| 02 Juli 2026 | 1.1 | Restrukturisasi ke format template; Data Requirements diselaraskan dengan dokumen sumber (form input/edit, histori, dashboard); penambahan spesifikasi teknis (DB schema & API). |

## 2. Overview & Background

### Overview / Brief Summary

Setiap rumah sakit memiliki struktur tarif kamar yang berbeda-beda tergantung **kelas perawatan, fasilitas, tipe ruangan, dan status rumah sakit** (pemerintah/swasta). Tidak hanya kamar rawat inap, tetapi juga ruangan layanan khusus seperti **Transit** dan **VK (Verloskamer)** memiliki tarif harian tersendiri yang perlu dikelola secara konsisten. Saat ini banyak rumah sakit belum memiliki sistem digital terpusat untuk mengatur dan memperbarui harga kamar untuk seluruh tipe ruangan secara otomatis dan terintegrasi dengan sistem penagihan.

Fitur **Master Data Standar Tarif Kamar** (kode fitur **A43**, cluster **Control Panel > Master Data**) memungkinkan pihak administrasi rumah sakit untuk:

* Mengatur dan memperbarui harga kamar untuk seluruh tipe ruangan (**Reguler, Intensive Care, Isolasi, Transit, VK**) berdasarkan kelas dan jenis layanan.
* Menjamin konsistensi antara tarif kamar dengan sistem billing dan laporan keuangan, serta sinkronisasi dengan master data kamar (A16).
* Mendukung skenario penggunaan ruangan **Transit** untuk pasien yang sedang menunggu kamar rawat inap atau observasi singkat.
* Mendukung billing untuk pasien obstetri pada ruangan **VK** selama proses persalinan dan observasi.

Dengan fitur ini, tarif kamar untuk seluruh tipe ruangan dapat dikelola secara efisien, transparan, dan akurat dalam satu sistem terintegrasi.

> Konteks target: **SIMRS RS Tipe C & D** — SDM IT terbatas, form harus sederhana & adaptif, minim input yang tidak perlu.

### Business Process (As-Is vs To-Be)

**A. As-Is (kondisi saat ini)**

1. Penentuan tarif kamar/ruangan dilakukan pada master data kamar, sehingga admin harus menginput data tarif secara **berulang** untuk satu tipe kamar dan kelas yang sama pada masing-masing data kamar.
2. Potensi **human error tinggi** karena input data tarif dilakukan berulang untuk tipe ruangan dan kelas yang sama.
3. Jika ada update tarif, admin harus mengupdate seluruh data tarif kamar **satu per satu** untuk setiap data kamar → risiko inkonsistensi data dan sistem tidak efisien.
4. Admin **tidak dapat merencanakan** perubahan tarif karena sistem auto-update tarif ketika tarif kamar diubah.
5. Tarif untuk ruangan **Transit dan VK** belum dikelola secara terstandarisasi pada master data.

**B. To-Be (kondisi yang diharapkan)**

1. Admin keuangan membuka modul **Master Data > Standar Tarif Kamar**.
2. Sistem menampilkan daftar tarif kamar berdasarkan **tipe ruangan** (Reguler, Intensive Care, Isolasi, Transit, VK) dan **kelas** (VVIP, VIP, Kelas I/II/III, dsb. — khusus tipe ruangan yang memerlukan kelas).
3. Admin memilih **tipe ruangan** terlebih dahulu. Sistem menampilkan form adaptif:
   * Tipe Ruangan = **Reguler / Intensive Care / Isolasi** → field **Kelas** (wajib) & **Sub Kelas** (opsional) aktif dan harus diisi.
   * Tipe Ruangan = **Transit / VK** → field Kelas & Sub Kelas otomatis **disabled** (tarif berlaku tunggal per tipe ruangan).
4. Admin memasukkan **tarif harian** dan **tanggal efektif** berlaku.
5. Sistem menyimpan tarif dan mengoneksikan datanya ke master kamar (A16).
6. Saat pasien dirawat, sistem otomatis menarik harga kamar sesuai tipe ruangan, kelas (jika berlaku), dan tanggal efektif:
   * Pasien rawat inap di Kelas I tipe Reguler → tarif Kelas I Reguler.
   * Pasien menempati ruangan Transit → tarif tunggal Transit.
   * Pasien obstetri di VK → tarif tunggal VK.
7. Jika ada perubahan tarif, sistem membuat **versi tarif baru** sesuai tanggal efektif.
8. Billing pasien yang berjalan menyesuaikan tarif baru sesuai tanggal efektif, termasuk untuk pasien yang mengalami **perpindahan antar tipe ruangan** dalam satu episode (mis. VK → Rawat Inap, Transit → Rawat Inap).

## 3. Goals & Metrics

### Goals

1. Menyediakan fitur untuk mengatur dan merencanakan **harga standar tarif kamar** sesuai kelas dan tipe kamar/ruangan selama periode tertentu.
2. Mendukung pengelolaan tarif untuk seluruh tipe ruangan — Rawat Inap (Reguler, Intensive Care, Isolasi), Transit, dan VK — dalam satu master data yang konsisten.
3. **Sinkronisasi** standar tarif kamar dengan master data kamar (A16), hingga ke billing.
4. Memastikan struktur form **adaptif**: field Kelas & Sub Kelas hanya aktif jika tipe ruangan memerlukan, sehingga input Transit & VK tetap sederhana.
5. User dapat mengatur tarif kamar berlaku **per tanggal efektif** (set harga dulu, launching kemudian).

### Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Setting tanggal pemberlakuan tarif kamar | 100% user dapat memberlakukan penetapan tarif pada tanggal berlaku yang ditentukan. |
| 2 | Kelengkapan field wajib | 100% data tarif kamar tersimpan memiliki tipe ruangan, kelas (bila berlaku), tanggal berlaku, dan tarif masing-masing. |
| 3 | Keterlacakan aktivitas | 100% histori perubahan harga kamar tercatat pada riwayat aktivitas (user + waktu). |
| 4 | Integrasi harga kamar dengan master data kamar | 100% data standar harga kamar dapat menjadi acuan harga kamar per hari untuk pasien rawat inap. |
| 5 | Cakupan tipe ruangan | 100% tipe ruangan yang digunakan RS (Reguler, Intensive Care, Isolasi, Transit, VK) memiliki tarif harian aktif yang valid pada tanggal berjalan. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Integrasi/Approval) |
|-------------|---------------------|-----------------------------------------|
| Standar Tarif Kamar berkelas (Reguler, Intensive Care, Isolasi) | Form CRUD tarif berdasarkan kelas & tipe ruangan; validasi conditional kelas/sub kelas. | Penyesuaian & integrasi tarif dengan master data kamar (A16). |
| Standar Tarif Ruangan Transit & VK | Form CRUD tarif tunggal harian tanpa kelas/sub kelas. | Skenario perpindahan antar tipe ruangan pada billing (Transit → RI, VK → RI). |
| Update & Perencanaan Tarif | Update tarif berkala sesuai SK Direksi berdasarkan data terinput; penetapan tanggal efektif (terjadwal). | — |
| Histori & Audit | Histori perubahan harga kamar (nilai, SK, tanggal efektif, user, waktu) untuk audit & pelaporan. | Riwayat aktivitas CRUD master data **kamar** (dibuat/diubah, oleh siapa, kapan). |
| Integrasi Billing | — (endpoint disiapkan) | Tarif otomatis muncul di tagihan pasien untuk seluruh tipe ruangan; perhitungan per durasi stay. |

**Out of Scope:**

1. Handling case pasien **BPJS titip kelas** (PRD terpisah).
2. Integrasi dengan sistem **asuransi eksternal** (BPJS, asuransi swasta) di luar fungsi billing internal.

## 5. Related Features

| No | Module | Feature / Relasi |
|----|--------|------------------|
| 1 | **Master Data (A16)** | Master Data Kamar/Ruangan — tarif harian kamar/ruangan sinkron dengan tipe ruangan dan kelas tertentu, termasuk ruangan Transit dan VK. |
| 2 | **Billing** | Tagihan Pasien — tarif harian kamar sinkron dengan master data standar tarif kamar sesuai kelas & tipe ruangan, mencakup perpindahan antar tipe ruangan dalam satu episode. |
| 3 | **Pelayanan Rawat Inap** | Order penempatan kamar — mengacu pada tarif aktif sesuai tipe ruangan & kelas yang dipilih. |
| 4 | **Pelayanan VK / Obstetri** | Order Tindakan VK & masa observasi di ruangan VK — mengacu pada tarif harian VK pada master data. |

**Master data pendukung (lookup):** A15 Bangsal, A3 Unit, A20 Tipe Penjamin, Master Kelas, Master Tipe Ruangan,  A10 Master Tarif Layanan (Administrasi Kelas), A53 RBAC (hak akses CRUD).

## 6. Business Process & User Stories

### State Machine Table (status tarif)

| Status | Deskripsi | Efek pada Billing | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-------------------|--------------------|--------------------|
| **Terjadwal** | Tarif tersimpan dengan tanggal efektif > waktu sekarang; belum berlaku. | Belum dipakai billing. | Create → Terjadwal; dapat di-Edit selama belum aktif. | Sama (dengan approval SK bila diaktifkan). |
| **Aktif** | Tarif berlaku sejak tanggal efektif ≤ waktu sekarang; tarif tunggal & deterministik untuk kombinasinya. | Menjadi acuan tarif harian kamar. | Terjadwal → Aktif (otomatis saat tanggal efektif tercapai). | Aktif → Aktif (versi baru) via SK Direksi. |
| **Berakhir** | Tarif lama yang tergantikan versi baru; diberi tanggal berakhir. | Tetap dipakai untuk hari-hari sebelum tarif baru berlaku (append-only, tidak mengubah transaksi lama). | Aktif → Berakhir saat versi baru aktif. | Sama. |
| **Non-aktif** | Tarif dinonaktifkan manual dari Dashboard (toggle). | Tersembunyi dari pemilihan billing, data tetap tersimpan. | Aktif/Terjadwal → Non-aktif (toggle). | Sama. |

> Prinsip: perubahan tarif bersifat **versioned & append-only**. Tarif lama tidak dihapus — untuk pasien yang sudah terlanjur memiliki transaksi dengan harga lama (meski dalam satu episode), harga hari-hari sebelumnya tidak otomatis ter-update.

### User Stories Utama

Prioritas: **P0** Critical/MVP · **P1** Must Have · **P2** Should Have · **P3** Low/kosmetik · **P4** Enhancement.

| ID | Role | User Story |
|----|------|-----------|
| US-001 | Admin Keuangan | Mengatur tarif kamar rawat inap berdasarkan kelas agar sistem billing otomatis menyesuaikan harga. |
| US-002 | Admin Keuangan | Mengatur tarif harian ruangan **Transit** tanpa mengisi kelas, agar tarif langsung dipakai saat pasien menempati ruangan transit. |
| US-003 | Admin Keuangan | Mengatur tarif harian ruangan **VK** tanpa mengisi kelas, agar tarif langsung dipakai saat pasien obstetri menempati ruangan VK. |
| US-004 | Admin Keuangan | Form input tarif menyesuaikan field aktif berdasarkan tipe ruangan yang dipilih, agar input efisien dan tidak membingungkan. |
| US-005 | Kasir / Staf Billing | Tarif kamar otomatis muncul di tagihan pasien untuk seluruh tipe ruangan, agar perhitungan tagihan akurat tanpa input manual. (Phase 2) |
| US-006 | Manajemen / Auditor | Melihat histori perubahan tarif kamar agar dapat melakukan audit kebijakan tarif. |
| US-007 | Admin Master Data Kamar | Data tarif harian kamar mengacu pada master data standar tarif kamar, termasuk Transit dan VK. (Phase 2) |

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Master Standar Harga Kamar (Rawat Inap — Reguler / Intensive Care / Isolasi)**

* **User Story**: Sebagai **Admin Keuangan**, saya ingin mengatur tarif kamar rawat inap berdasarkan kelas, agar sistem billing otomatis menyesuaikan harga.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Setiap tarif memiliki atribut tipe ruangan, kelas, dan tarif harian.
  * **AC 2**: Dapat **menambah, mengubah, dan menonaktifkan** tarif kamar.
  * **AC 3**: Tarif dapat diatur berdasarkan **tanggal efektif** dan masa berlaku.
  * **AC 4**: Sistem **menolak** input jika tanggal berlaku backdate — minimal date = today, dan jam harus > now (bukan timestamp saat ini).
  * **AC 5**: Tarif lama otomatis tersimpan sebagai **histori**.
  * **AC 6**: User dapat **mengedit** data tarif yang **belum aktif** (status Terjadwal).

* **Validasi — Wording (Frontend)**

| Field | Tipe Input | Rules | Error Message | Helper Text |
|-------|------------|-------|---------------|-------------|
| Tipe Ruangan | Dropdown | Required | "Tipe ruangan wajib dipilih" | "Pilih tipe ruangan" |
| Kelas | Dropdown | Required (Reguler/IC/Isolasi) | "Kelas wajib dipilih untuk tipe ruangan ini" | "Pilih kelas perawatan" |
| Tarif Harian | Number | Required, ≥ 0, integer (tanpa desimal) | "Tarif harian wajib diisi" | "Masukkan tarif per hari (Rp)" |
| Tanggal Efektif | Date & time | Required, ≥ today, jam > now | "Tanggal berlaku tidak boleh backdate; jam harus lebih dari sekarang" | "Pilih tanggal & jam mulai berlaku" |
| Nomor SK | Text | Required | "Nomor SK wajib diisi" | "Masukkan nomor SK penetapan tarif" |

---

**Fitur: Master Tarif Ruangan Transit**

* **User Story**: Sebagai **Admin Keuangan**, saya ingin mengatur tarif harian ruangan **Transit** tanpa harus mengisi kelas, agar tarif transit dapat langsung dipakai saat pasien menempati ruangan transit.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tipe Ruangan = Transit memiliki **tarif tunggal per hari**.
  * **AC 2**: Field Kelas & Sub Kelas otomatis **disabled / tidak wajib** saat tipe ruangan = Transit.
  * **AC 3**: Dapat menambah, mengubah, dan menonaktifkan tarif ruangan Transit.
  * **AC 4**: Hanya boleh ada **satu tarif aktif** untuk Tipe Ruangan = Transit pada satu waktu.
  * **AC 5**: Sistem menolak input jika tanggal berlaku backdate (min. date = today, jam > now).

---

**Fitur: Master Tarif Ruangan VK (Verloskamer)**

* **User Story**: Sebagai **Admin Keuangan**, saya ingin mengatur tarif harian ruangan **VK** tanpa harus mengisi kelas, agar tarif VK dapat langsung dipakai saat pasien obstetri menempati ruangan VK.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tipe Ruangan = VK memiliki **tarif tunggal per hari**.
  * **AC 2**: Field Kelas & Sub Kelas otomatis **disabled / tidak wajib** saat tipe ruangan = VK.
  * **AC 3**: Dapat menambah, mengubah, dan menonaktifkan tarif ruangan VK.
  * **AC 4**: Hanya boleh ada **satu tarif aktif** untuk Tipe Ruangan = VK pada satu waktu.
  * **AC 5**: Sistem menolak input jika tanggal berlaku backdate (min. date = today, jam > now).

---

**Fitur: Conditional Field Kelas Berdasarkan Tipe Ruangan**

* **User Story**: Sebagai **Admin Keuangan**, saya ingin form input tarif menyesuaikan field aktif berdasarkan tipe ruangan yang dipilih, agar input lebih efisien dan tidak membingungkan.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form mendeteksi tipe ruangan yang dipilih user.
  * **AC 2**: Jika Tipe Ruangan = Reguler/Intensive Care/Isolasi → field **Kelas aktif & wajib**, **Sub Kelas aktif & opsional**.
  * **AC 3**: Jika Tipe Ruangan = Transit/VK → field Kelas & Sub Kelas otomatis **disabled**, dengan label informasi: **"Tidak berlaku untuk tipe ruangan ini"**.
  * **AC 4**: Behavior field Kelas & Sub Kelas berubah **real-time** saat user mengubah Tipe Ruangan (tanpa reload).
  * **AC 5**: Sistem **tidak menyimpan** nilai Kelas/Sub Kelas untuk row dengan Tipe Ruangan = Transit/VK.
  * **AC 6**: Dashboard menampilkan **"-"** pada kolom Kelas untuk row Transit/VK.

---

**Fitur: Integrasi Billing**

* **User Story**: Sebagai **Kasir / Staf Billing**, saya ingin tarif kamar otomatis muncul di tagihan pasien untuk seluruh tipe ruangan (Rawat Inap, Transit, VK), agar perhitungan tagihan akurat tanpa input manual.
* **Prioritas**: P0
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Saat pasien masuk atau berpindah ke suatu ruangan, sistem menarik tarif kamar berdasarkan tipe ruangan, kelas (jika berlaku), dan tanggal berlaku.
  * **AC 2**: Tarif kamar muncul otomatis di billing tanpa input manual.
  * **AC 3**: Sistem menghitung total biaya inap berdasarkan **lama hari rawat**.
  * **AC 4**: Skenario perpindahan antar tipe ruangan (mis. VK → Rawat Inap, Transit → Rawat Inap) dihitung **terpisah per tipe ruangan** sesuai durasi stay.

---

**Fitur: Audit dan Histori Harga**

* **User Story**: Sebagai **Manajemen**, saya ingin melihat histori perubahan tarif kamar, agar dapat melakukan audit kebijakan tarif.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Sistem menyimpan setiap perubahan harga dengan **timestamp, user ID, dan nomor SK** untuk setiap tipe ruangan termasuk Transit dan VK.
  * **AC 2**: Dapat menampilkan riwayat harga berdasarkan kamar/kelas.

---

**Fitur: Integrasi dengan Master Data Kamar**

* **User Story**: Sebagai sistem, semua data tarif harga kamar harian mengacu pada master data standar harga kamar, termasuk Transit dan VK.
* **Prioritas**: P0
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Setiap penambahan kamar baru mengikuti harga dari opsi pada master data standar harga kamar berdasarkan tipe ruangan & kelas (jika berlaku).
  * **AC 2**: Ketika user memilih kelas pada master data kamar, sistem me-pairing tarif kamar harian sesuai kelas yang dipilih.
  * **AC 3**: Untuk kamar dengan Tipe Ruangan = Transit/VK, master data kamar langsung mengambil **tarif tunggal** yang berlaku tanpa memilih kelas.

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `room_rate_standards`** (master standar tarif kamar — versioned)

| Column | Tipe Data | Keterangan |
|--------|-----------|------------|
| `id` | UUID (PK) | Primary key |
| `room_type` | VARCHAR / ENUM | Reguler, Intensive Care, Isolasi, Transit, VK (extensible) |
| `class_id` | UUID (FK → `class_id`) | Nullable — NULL untuk Transit/VK |
| `sub_class_id` | UUID (FK → `class_id`) | Nullable -> Master Data Kelas |
| `class_admin_service_id` | UUID (FK → `services_id`) | Administrasi Kelas; nullable, NULL untuk Transit/VK -> Master Data Tarif Layanan |
| `insurance_id` | UUID (FK → `insurance_id`) | Tipe Penjamin; nullable -> Master Data Tipe Penjamin |
| `daily_rate` | BIGINT | Tarif harian (Rupiah, tanpa desimal) |
| `effective_at` | TIMESTAMP | Tanggal & waktu efektif berlaku |
| `end_at` | TIMESTAMP | Nullable; diisi saat versi baru menggantikan |
| `decree_number` | VARCHAR | Nomor SK |
| `is_active` | BOOLEAN (default `true`) | Toggle aktif/non-aktif dari Dashboard |
| `status` | VARCHAR | scheduled / active / expired (derivable dari effective_at & end_at) |
| `created_by` | UUID (FK → `users`) | Pembuat |
| `updated_by` | UUID (FK → `users`) | Pengubah terakhir (Nama User) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | Terakhir diupdate |

**Table: `room_rate_histories`** (histori perubahan tarif — append-only)

| Column | Tipe Data | Keterangan |
|--------|-----------|------------|
| `id` | UUID (PK) | |
| `room_rate_id` | UUID (FK → `room_rate_standards`) | Referensi tarif |
| `action` | VARCHAR | create / update / deactivate |
| `daily_rate` | BIGINT | Tarif pada perubahan |
| `decree_number` | VARCHAR | Nomor SK |
| `effective_at` | TIMESTAMP | Tanggal efektif berlaku |
| `changed_at` | TIMESTAMP | Tanggal & waktu perubahan |
| `changed_by` | UUID (FK → `users`) | Nama Petugas |

**Tabel master pendukung**: `room_classes` (Kelas 1/2/3, VIP, VVIP, President Suite — extensible), `room_sub_classes` (`class_id`, `name`; hanya untuk kelas selain 1/2/3, bisa >1 per kelas), `room_types`, `guarantor_types`, `services` (Administrasi Kelas). Setiap tabel master minimal memiliki `id` (UUID PK), `name`, `is_active` (default `true`).

> Catatan Phase 2: struktur `class_id`/`guarantor_type_id` + versioning (`effective_at`/`end_at`) sudah menyiapkan integrasi ke master kamar (A16) dan billing tanpa perubahan skema besar.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/room-rates` | List tarif kamar (filter: room_type, class, guarantor, status; sort; search) |
| POST | `/api/v1/room-rates` | Create tarif baru (status default `scheduled`/`active` sesuai `effective_at`) |
| GET | `/api/v1/room-rates/{id}` | Detail satu tarif |
| PUT | `/api/v1/room-rates/{id}` | Edit tarif yang **belum aktif** (Terjadwal) |
| PATCH | `/api/v1/room-rates/{id}/status` | Toggle Aktif/Non-aktif dari Dashboard |
| GET | `/api/v1/room-rates/{id}/histories` | Riwayat perubahan tarif |
| GET | `/api/v1/room-rates/resolve` | (Phase 2) Ambil tarif aktif per `room_type` + `class` + tanggal layanan (dipakai billing) |
| GET | `/api/v1/room-classes` · `/api/v1/room-sub-classes` · `/api/v1/room-types` | Lookup master pendukung |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input/Edit (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| Tipe Ruangan | Tipe Ruangan | Dropdown | **Wajib** | Pilih salah satu | Master Data Tipe Ruangan | Non-editable setelah dipilih. User admin dapat menambah tipe ruangan baru. Menentukan behavior conditional field. Default: Reguler, Intensive Care (HCU/ICCU/ICU/PICU/NICU), Isolasi (terang/gelap), Transit, VK (Verloskamer). |
| Kelas | Kelas | Dropdown | **Conditional** — wajib jika Tipe Ruangan = Reguler/Intensive Care/Isolasi; **disabled** jika Transit/VK | Pilih salah satu | Master Data Kelas | Non-editable. User admin dapat menambah nama kelas baru. Default: Kelas 1, Kelas 2, Kelas 3, VIP, VVIP, President Suite. |
| Sub Kelas | Sub Kelas | Dropdown | Tidak Wajib — **disabled** jika Tipe Ruangan = Transit/VK **atau** Kelas = 1/2/3 | — | Master Data Kelas | Editable. Hanya kelas selain 1/2/3 yang punya sub kelas. User dapat menginput >1 sub kelas per kelas (mis. VIP-A/B/C dengan harga berbeda). |
| Tarif Harian | Tarif Harian | Number | **Wajib** | Rupiah, tanpa desimal, ≥ 0 | Input manual | Editable. Berlaku per hari untuk seluruh tipe ruangan. |
| Tanggal Efektif | Tanggal Efektif | Date & time | **Wajib** | Min. = today, **tidak boleh backdate**, jam harus > now (bukan timestamp now) | Input manual | Editable. Menentukan kapan tarif baru mulai berlaku. Tidak boleh 2 harga pada tanggal & kelas yang sama (lihat BR). Tidak meng-update tarif hari sebelumnya yang sudah terhitung untuk pasien berjalan. |
| Nomor SK | Nomor SK | Text | **Wajib** | — | Input manual | Editable. Nomor SK penetapan tarif. |
| Administrasi Kelas | Administrasi Kelas | Dropdown | Tidak Wajib — **disabled** jika Tipe Ruangan = Transit/VK | — | Master Data Tarif Layanan | Editable. Tarif dikenakan ke billing setiap pasien pindah ke bangsal beda kelas; tidak dikenakan bila pindah dalam kelas yang sama. |
| Tipe Penjamin | Tipe Penjamin | Dropdown | Tidak Wajib | — | Master Data Tipe Penjamin (A20) | Editable. Sebagian RS menerapkan tarif administrasi kelas berbeda per tipe penjamin (mis. ADMEDIKA/BPJS/UMUM). |
| Nama User | Nama User | Text | Wajib (auto) | — | Master Data Staff | **Read-only** — nama user yang mengupdate master data. |
| Terakhir Diupdate | Terakhir Diupdate | Date & time | Wajib (auto) | — | Sistem | **Read-only** — tanggal & waktu terakhir master data diupdate. |

> **Catatan status**: sesuai konvensi, form CREATE **tidak** menyediakan input Status — status keaktifan default **Aktif** dan dikelola via toggle di Dashboard (§8.3.2 kolom Status Keaktifan).

**Conditional Behavior Form** *(Data Requirement A — poin 11)*

Field yang aktif/wajib pada form berubah **secara dinamis** berdasarkan **Tipe Ruangan** yang dipilih user:

* **Tipe Ruangan = Reguler / Intensive Care / Isolasi** → Kelas (**wajib**), Sub Kelas (**opsional**, tergantung kelas), Administrasi Kelas (**opsional**), Tarif Harian (**wajib**), Tanggal Efektif (**wajib**), Nomor SK (**wajib**).
* **Tipe Ruangan = Transit** → Kelas (**disabled**), Sub Kelas (**disabled**), Administrasi Kelas (**disabled**), Tarif Harian (**wajib**), Tanggal Efektif (**wajib**), Nomor SK (**wajib**).
* **Tipe Ruangan = VK** → Kelas (**disabled**), Sub Kelas (**disabled**), Administrasi Kelas (**disabled**), Tarif Harian (**wajib**), Tanggal Efektif (**wajib**), Nomor SK (**wajib**).

Ringkasan matriks perilaku field per Tipe Ruangan:

| Tipe Ruangan | Kelas | Sub Kelas | Administrasi Kelas | Tarif Harian | Tanggal Efektif | Nomor SK |
|--------------|-------|-----------|--------------------|--------------|-----------------|----------|
| Reguler / Intensive Care / Isolasi | Wajib | Opsional (tergantung kelas) | Opsional | Wajib | Wajib | Wajib |
| Transit | Disabled | Disabled | Disabled | Wajib | Wajib | Wajib |
| VK | Disabled | Disabled | Disabled | Wajib | Wajib | Wajib |

> Field yang **disabled** menampilkan placeholder **"Tidak berlaku untuk tipe ruangan ini"** dan tidak dapat di-edit.

#### 8.3.2 Spesifikasi Data — Tampilan Dashboard / Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nama Kelas + Sub Kelas | `class` + `sub_class` | Text | Filter | Mis. "Kelas III" (tanpa sub) atau "Kelas VIP-B" (dengan sub). Tampilkan **"-"** untuk Tipe Ruangan Transit/VK. |
| Tipe Ruangan | `room_type` | Text / Badge | Filter | Reguler, Intensive Care, Isolasi, Transit, VK. |
| Tarif Harian | `daily_rate` | Text (Rp) | Sort | Tarif harian yang diinput. |
| Nomor SK | `decree_number` | Text | Filter | Nomor SK yang diinput. |
| Nama User | `updated_by` (Master Staff) | Text | Filter | User yang terakhir menginput/mengubah master. |
| Terakhir Update | `updated_at` | DD/MM/YYYY HH:MM WIB | Sort (default desc) | Mis. 14/11/2025 14:00 WIB. |
| Status Keaktifan | `is_active` | Badge | Filter | Pilihan: **Aktif** (default) / **Non-aktif**. Dikelola via toggle di Dashboard. |
| Aksi | – | Tombol (Edit / Histori / Toggle Status) | – | Edit hanya untuk tarif belum aktif; sesuai hak akses RBAC (A53). |

#### 8.3.3 Spesifikasi Data — Detail Histori Perubahan Tarif

| Kolom | Sumber Data | Format | Wajib | Catatan |
|-------|-------------|--------|-------|---------|
| Tanggal Perubahan | `changed_at` | Text, DD/MM/YYYY HH:MM (WIB) | Wajib | Timestamp perubahan tarif. |
| Nomor SK | `decree_number` | Text | Wajib | Nomor SK yang diinput. |
| Tarif | `daily_rate` | Number (Rp) | Wajib | Mis. Rp 500.000. |
| Tanggal Efektif Berlaku | `effective_at` | Text, DD/MM/YYYY HH:MM (WIB) | Wajib | Tanggal mulai efektif berlaku (bisa beberapa hari setelah entri). |
| Nama Petugas | `changed_by` | Text | Wajib | Mis. Danang Aji Nugraha S.E. |

> Contoh tampilan tabel histori:
>
> | Tanggal Perubahan | Nomor SK | Tarif | Tanggal Efektif Berlaku | Nama Petugas |
> |-------------------|----------|-------|-------------------------|--------------|
> | 01/11/2025 14:30 WIB | ASD123 | Rp 500.000 | 03/11/2025 | Danang Aji Nugraha S.E |
> | 01/01/2025 00:00 WIB | ASD123 | Rp 350.000 | 02/01/2025 | Danang Aji Nugraha S.E |

#### 8.3.4 Business Rules

| ID | Business Rule |
|----|---------------|
| **BR-001** | Field **Kelas** & **Sub Kelas** wajib untuk Tipe Ruangan **Reguler, Intensive Care, Isolasi**; otomatis **disabled & tidak disimpan** untuk **Transit** & **VK**. |
| **BR-002** | **Sub Kelas** hanya berlaku untuk kelas selain Kelas 1/2/3; boleh lebih dari satu sub kelas per kelas (mis. VIP-A/B/C dengan tarif berbeda). |
| **BR-003** | **Tarif Harian** berupa angka ≥ 0, format Rupiah **tanpa desimal**, berlaku per hari untuk seluruh tipe ruangan. |
| **BR-004** | **Tanggal Efektif** minimal = today, **tidak boleh backdate**, dan jam harus > now (bukan timestamp saat ini). |
| **BR-005** | Tidak boleh ada **2 harga kamar pada tanggal & kelas yang sama** → validasi: *"Tidak dapat membuat 2 harga kamar pada tanggal yang sama, silakan edit harga sebelumnya."* |
| **BR-006** | Hanya boleh ada **satu tarif aktif** pada satu waktu untuk Tipe Ruangan = **Transit** dan untuk Tipe Ruangan = **VK**. |
| **BR-007** | Perubahan tarif membuat **versi baru**; tarif lama tersimpan sebagai histori (append-only). Untuk pasien dengan transaksi berjalan, harga hari-hari sebelumnya yang sudah terhitung **tidak** otomatis ter-update meski dalam satu episode. |
| **BR-008** | User dapat **mengedit** tarif yang **belum aktif** (status Terjadwal); tarif yang sudah aktif dikelola dengan membuat versi baru. |
| **BR-009** | **Administrasi Kelas** dikenakan ke billing setiap pasien pindah ke bangsal berbeda kelas; tidak dikenakan bila pindah dalam kelas yang sama. Tidak relevan untuk Transit/VK. |
| **BR-010** | Status keaktifan default **Aktif**; pengelolaan Aktif/Non-aktif dilakukan lewat toggle di Dashboard (tidak ada input status di form create). |
| **BR-011** | Akses CRUD tarif dibatasi via **RBAC (A53)**; setiap operasi mencatat identitas user login pada histori. |

## 9. Workflow / BPMN Interpretation

> [ASUMSI] Tidak ada BPMN khusus modul A43. Alur diturunkan dari deskripsi To-Be dan analogi pola master data & billing pada BPMN terkait (`g-service-pathology-order` untuk pola 'Load Master Data' & gateway 'Tanggal > TODAY?'; `g-admisi-inpatient-registration` untuk konsumsi tarif kamar).

**Alur utama (To-Be):**

1. Admin keuangan membuka **Master Data > Standar Tarif Kamar** → Dashboard menampilkan daftar tarif (filter tipe ruangan/kelas/penjamin/status).
2. Klik **Tambah Tarif** → pilih **Tipe Ruangan**.
   * *Gateway conditional:* Reguler/IC/Isolasi → aktifkan Kelas (wajib) & Sub Kelas (opsional); Transit/VK → disable Kelas/Sub Kelas/Administrasi Kelas.
3. Isi Tarif Harian, Tanggal Efektif, Nomor SK, (opsional) Tipe Penjamin & Administrasi Kelas → **SIMPAN**.
4. Validasi: conditional field (BR-001/002), tarif ≥ 0 (BR-003), tanggal efektif tidak backdate & jam > now (BR-004), tidak duplikat tanggal+kelas (BR-005), tarif tunggal aktif untuk Transit/VK (BR-006).
   * *Gateway Tanggal Efektif > now?* → Ya: status **Terjadwal**; Tidak/sekarang: **Aktif**.
5. Sistem menyimpan + mencatat **histori** (nilai, SK, tanggal efektif, user, timestamp) dan mengoneksikan ke master kamar (A16, Phase 2).
6. Pada tanggal efektif, tarif otomatis **Aktif**; versi lama diberi **tanggal berakhir** (Berakhir).
7. (Phase 2) Billing menarik tarif aktif per tipe ruangan + kelas + tanggal layanan; perpindahan antar tipe ruangan dihitung terpisah per durasi stay.
8. Auditor membuka **Detail Histori** untuk menelusuri perubahan tarif.
