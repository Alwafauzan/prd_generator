# PRD — Master Data: Ruang IBS (Instalasi Bedah Sentral) (A39)

> **Kode Fitur:** A39 · **Cluster:** Control Panel · **Modul:** Master Data · **Menu:** Ruang IBS
> SIMRS RS Tipe C & D · Persona: System Analyst senior SIMRS

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] `[PERLU KONFIRMASI]`
* **Related Documents**:
    * List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A39)
    * BPMN acuan (analogi): `g-service-discharge`, `g-admisi-inpatient-registration` ("reschedule jadwal operasi")
    * PRD terkait: A15 Bangsal, A16 Kamar, A17 Bed, A3 Unit, A43 Tarif Kamar (acuan pola master ruang/fasilitas)
    * SATUSEHAT — FHIR Location Resource (interoperabilitas ruang sebagai lokasi fisik)
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-02 | 1.0 - Draft | Draft awal Master Data Ruang IBS |
| 2026-07-02 | 1.1 | Restrukturisasi sesuai template PRD (§1–§9); dilengkapi State Machine, Acceptance Criteria & Wording Validasi per fitur, Database Schema (English) & API Endpoints (English); **impor/ekspor dihapus**; toggle aktif/nonaktif di list; ruang nonaktif tetap tampil di list |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  Modul **Master Data — Ruang IBS** (cluster **Control Panel**) mengelola data referensi **ruang di Instalasi Bedah Sentral (IBS/OK — Operating Theatre)**: kamar operasi (OK-1, OK-2, dst.), ruang persiapan (pre-operative), ruang pemulihan (recovery/RR), dan ruang sterilisasi yang menjadi objek penjadwalan tindakan operasi.

  Master ini menjadi **sumber kebenaran tunggal (single source of truth)** untuk daftar ruang bedah yang dipakai lintas modul: penjadwalan operasi, admisi rawat inap (reschedule jadwal operasi), pencatatan tindakan bedah di EMR, serta tarif layanan bedah. Modul ini adalah **master data statis** (jarang berubah) — bukan modul transaksional.

  > `[ASUMSI]` Cakupan diturunkan dari pola master data ruang/fasilitas lain (A15 Bangsal, A16 Kamar, A17 Bed) dan analogi proses penjadwalan operasi pada BPMN admisi rawat inap ("reschedule jadwal operasi") — modul ini belum memiliki BPMN sendiri.

* **Business Process (As-Is vs To-Be)**:

    * **As-Is** (kondisi saat ini — RS Tipe C & D) `[ASUMSI]`:
        1. Daftar kamar operasi dikelola manual (papan jadwal fisik / whiteboard di depan IBS / spreadsheet lokal).
        2. Saat penjadwalan operasi atau reschedule (lihat BPMN admisi RI), petugas menyebut nama OK sebagai **teks bebas** → rawan salah ketik, sulit dilaporkan, tidak konsisten antar modul.
        3. Tidak ada validasi keunikan, tidak ada status aktif/nonaktif; laporan utilisasi dibuat manual.
        4. Perubahan (penambahan OK baru, penutupan OK renovasi) tidak terekam sistematis.

    * **To-Be** (kondisi diharapkan — workflow digital baru):
        1. Admin Control Panel membuka menu **Master Data > Ruang IBS**.
        2. Sistem menampilkan daftar ruang IBS (list + filter + search) — **termasuk ruang nonaktif** (tidak disembunyikan).
        3. Admin **Tambah/Edit** ruang melalui form tervalidasi (kode unik, tipe ruang baku).
        4. Admin **mengaktif/menonaktifkan** ruang langsung dari list via **tombol geser (toggle)** — **tanpa hapus permanen**, sehingga histori transaksi bedah tetap utuh.
        5. Ruang **aktif** langsung tersedia sebagai **lookup** di modul penjadwalan operasi & EMR tindakan bedah; ruang **nonaktif** tidak muncul sebagai pilihan lookup namun tetap tampil di master list.
        6. `[ASUMSI]` (Phase 2) Ruang di-sinkronkan ke **SATUSEHAT Location** bila diaktifkan.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Data ruang IBS terstandar & terpusat | 100% ruang OK terdaftar di master (vs. daftar fisik) |
| 2 | Menghilangkan input lokasi teks bebas | 100% transaksi bedah me-refer `ibs_room_id` (lookup), bukan teks bebas |
| 3 | Kemudahan pengelolaan | Waktu tambah/edit 1 ruang < 2 menit |
| 4 | Integritas data | 0 duplikasi kode ruang |
| 5 | Integritas histori | 0 ruang terpakai transaksi yang terhapus permanen (hanya nonaktif) |
| 6 | Interoperabilitas *(Phase 2)* | % ruang IBS ter-mapping ke SATUSEHAT Location — `[PERLU KONFIRMASI]` target rilis |

> `[ASUMSI]` Angka target adalah asumsi operasional wajar RS Tipe C & D dan perlu divalidasi manajemen.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) |
|-------------|---------------------|--------------------|
| Pendaftaran Ruang IBS | Tambah ruang: kode, nama, tipe ruang, unit, kapasitas | — |
| Pengelolaan Ruang IBS | Ubah data, lihat detail | Approval berjenjang perubahan master (kolom `approval_status`/`approver_role` disiapkan) |
| Status Aktif/Nonaktif | **Toggle (geser) aktif/nonaktif langsung di list**; tanpa hapus permanen; ruang nonaktif tetap tampil di list | — |
| Pencarian & Filter | Cari, filter (tipe/status), sorting, pagination | — |
| Lookup ke modul lain | Ekspos ruang **aktif** sebagai lookup untuk Penjadwalan Operasi & EMR Tindakan | — |
| Integrasi SATUSEHAT | — | Bridging ruang IBS ke resource **Location** (`physicalType = ro`) |

> **Catatan Phasing:** Phase 1 fokus CRUD master + pengelolaan status via toggle **tanpa** hapus permanen dan **tanpa** impor/ekspor. Skema data menyediakan kolom `satusehat_location_id` (Phase 2) dan `approval_status`/`approver_role` (approval Phase 2) sejak awal agar tidak perlu migrasi skema (lihat §8.1).

**Out of Scope**:

| No | Scope |
|----|-------|
| 1 | **Penjadwalan operasi / booking slot ruang** (transaksi) — modul terpisah; A39 hanya menyediakan master ruangnya. |
| 2 | Manajemen bed rawat inap → A17 (Bed). |
| 3 | Manajemen alat/aset di ruang operasi → A41 (Registrasi Aset). |
| 4 | Tarif tindakan bedah → A10 (Tindakan) / A43 (Tarif Kamar). |
| 5 | Monitoring status okupansi real-time ruang OK (dashboard operasional) — di luar master data. |
| 6 | Manajemen SDM/tim bedah (jadwal dokter/perawat) → A2 (Staff). |
| 7 | **Impor & ekspor massal** data ruang IBS — tidak dikembangkan pada PRD ini. |

## 5. Related Features

| Code | Menu | Deskripsi Relasi (Teknis / Bisnis) |
|------|------|-------------------------------------|
| **A39** | Master Data > Ruang IBS | **Modul ini** |
| A15 | Master Data > Bangsal | Pola master ruang/fasilitas (acuan struktur). |
| A16 | Master Data > Kamar | Pola master ruang (field sejenis). |
| A17 | Master Data > Bed | Pola master fasilitas + integrasi. |
| A3 | Master Data > Unit | `unit` sebagai lookup unit penyelenggara. |
| A43 | Master Data > Tarif Kamar | Referensi tarif layanan (relasi longgar). |
| A2 | Master Data > Staff | Tim bedah (relasi longgar, di luar scope). |

**Konsumen master ini (di luar Control Panel):** Penjadwalan Operasi, EMR Tindakan Bedah, Admisi RI (reschedule jadwal operasi — BPMN `g-admisi-inpatient-registration`).

## 6. Business Process & User Stories

### 6.1 State Machine — Status Ruang IBS (`is_active`)

| Status | Deskripsi | Efek pada Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------------|--------------------|--------------------|
| **Aktif** | Ruang berlaku & dapat dijadwalkan | Muncul sebagai lookup di Penjadwalan Operasi & EMR; **tampil di master list** | Create → Aktif (default); Aktif → Nonaktif (toggle di list) | Sinkron SATUSEHAT `Location.status=active` |
| **Nonaktif** | Ruang ditutup/renovasi | **Tidak** muncul sebagai lookup penjadwalan baru; **tetap tampil di master list** (soft delete, histori utuh) | Nonaktif → Aktif (toggle di list) | Sinkron SATUSEHAT `Location.status=inactive` |

> Ruang IBS tidak memiliki stok; kolom "Efek Stok" pada template diadaptasi menjadi **Efek pada Modul Konsumen**. **Tidak ada hard-delete** — ruang hanya dinonaktifkan (soft delete via `is_active`) demi integritas histori transaksi bedah. Ruang nonaktif **tidak hilang dari list**.

### 6.2 User Stories Utama

Prioritas: **P0** Critical/MVP · **P1** Must Have · **P2** Should Have · **P3** Low · **P4** Enhancement.

* **US-001** — Sebagai **Admin Control Panel**, saya ingin menambah ruang IBS baru dengan kode unik, agar setiap kamar operasi terdaftar baku.
* **US-002** — Sebagai **Admin**, saya ingin mengedit data ruang IBS, agar perubahan (renovasi, ganti nama OK) selalu akurat.
* **US-003** — Sebagai **Admin**, saya ingin **menggeser status aktif/nonaktif ruang langsung dari list** (tanpa menghapus), agar histori transaksi bedah tetap utuh dan pengelolaan cepat.
* **US-004** — Sebagai **Admin**, saya ingin melihat daftar ruang IBS (termasuk yang nonaktif) dengan filter & pencarian, agar cepat menemukan ruang tertentu.
* **US-005** — Sebagai **Petugas Penjadwalan Operasi**, saya ingin memilih ruang IBS **aktif** dari daftar baku (bukan teks bebas), agar penjadwalan konsisten & bisa dilaporkan.
* **US-006** *(Phase 2)* — Sebagai **Admin Integrasi**, saya ingin ruang IBS ter-mapping ke SATUSEHAT Location, agar interoperabel. `[ASUMSI]`

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Tambah Ruang IBS**
* **User Story**: Sebagai Admin Control Panel, saya ingin menambah ruang IBS baru dengan kode unik, agar setiap kamar operasi terdaftar baku. *(US-001)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **Tambah** membuka form ruang IBS.
    * **AC 2**: Data tersimpan; field wajib (Kode, Nama, Tipe Ruang) tidak boleh kosong.
    * **AC 3**: `room_code` divalidasi **unik** dalam satu RS; duplikat → ditolak dengan pesan jelas (BR-001).
    * **AC 4**: Status di-set **AKTIF** oleh sistem — tanpa input status di form create.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Ruang IBS | Text | Required, max 20, alfanumerik, unik | "Kode ruang wajib diisi." / "Kode ruang sudah digunakan. Gunakan kode lain." | "mis. OK-1, RR-1" |
  | Nama Ruang IBS | Text | Required, max 100 | "Nama ruang wajib diisi." | "mis. Kamar Operasi 1" |
  | Tipe Ruang | Dropdown | Required, enum | "Tipe ruang wajib dipilih." | "Kamar Operasi / Pre-Op / Recovery / Sterilisasi" |
  | Kapasitas | Number | Optional, integer > 0 | "Kapasitas harus lebih dari 0." | "Jumlah meja operasi / bed pemulihan" |

---

**Fitur: Ubah Data Ruang IBS**
* **User Story**: Sebagai Admin, saya ingin mengedit data ruang IBS, agar perubahan (renovasi, ganti nama OK) selalu akurat. *(US-002)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **Edit** menampilkan form berisi data existing.
    * **AC 2**: Perubahan tersimpan; validasi mengikuti aturan Tambah Ruang (termasuk keunikan kode bila diubah).
    * **AC 3**: Setiap perubahan tercatat pada audit log (siapa, kapan, aksi) — BR-006/NFR-003.

---

**Fitur: Kelola Status Aktif/Nonaktif (Toggle di List)**
* **User Story**: Sebagai Admin, saya ingin menggeser status aktif/nonaktif ruang langsung dari list tanpa menghapus, agar histori tetap utuh & pengelolaan cepat. *(US-003)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap baris pada list memiliki **tombol geser (toggle switch)** untuk mengubah status Aktif ⇄ Nonaktif.
    * **AC 2**: Menggeser toggle langsung memperbarui `is_active` (dengan konfirmasi bila ruang dipakai transaksi berjalan) **tanpa** menghapus data.
    * **AC 3**: Ruang **nonaktif tetap tampil di list** (tidak disembunyikan), ditandai badge/warna berbeda.
    * **AC 4**: Ruang nonaktif **tidak** muncul sebagai pilihan lookup di Penjadwalan Operasi & EMR (BR-003).
    * **AC 5**: **Tidak ada** aksi hapus permanen di UI — hanya aktif/nonaktif (BR-002).
* **Validasi — A. Wording Validasi (Frontend)**:

  | Aksi | Rules | Error/Konfirmasi Message |
  |------|-------|--------------------------|
  | Nonaktifkan ruang dipakai transaksi berjalan | Cegah hapus permanen; minta konfirmasi | "Ruang ini masih dipakai pada jadwal/tindakan berjalan. Menonaktifkan hanya mencegah pemakaian baru; data lama tetap utuh." → Lanjut/Kembali |

---

**Fitur: Daftar & Pencarian Ruang IBS**
* **User Story**: Sebagai Admin, saya ingin melihat daftar ruang IBS (termasuk nonaktif) dengan filter & pencarian, agar cepat menemukan ruang tertentu. *(US-004)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: List menampilkan kolom: Kode, Nama Ruang, Tipe Ruang, Kapasitas, Status (+ toggle), Aksi — sesuai §8.3.2.
    * **AC 2**: List menampilkan **ruang aktif maupun nonaktif** (default tidak menyembunyikan nonaktif).
    * **AC 3**: Pencarian (kode/nama), filter (tipe, status), sorting (default kode A-Z), dan pagination berfungsi & dapat dikombinasikan.
    * **AC 4**: Kartu ringkasan (Total Ruang IBS Aktif) tampil di atas daftar.

---

**Fitur: Lookup Ruang untuk Modul Lain**
* **User Story**: Sebagai Petugas Penjadwalan Operasi, saya ingin memilih ruang IBS aktif dari daftar baku (bukan teks bebas), agar penjadwalan konsisten. *(US-005)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Modul Penjadwalan Operasi & EMR Tindakan dapat menarik daftar ruang **aktif** via `ibs_room_id` (BR-003).
    * **AC 2**: Ruang nonaktif tidak muncul di lookup, namun tetap dapat ditampilkan pada data/histori lama yang sudah mereferensikannya.

---

**Fitur: Integrasi SATUSEHAT — Location**
* **User Story**: Sebagai Admin Integrasi, saya ingin ruang IBS ter-mapping ke SATUSEHAT Location, agar interoperabel. *(US-006)* `[ASUMSI]`
* **Prioritas**: P2
* **Fase**: **Phase 2**
* **Acceptance Criteria**:
    * **AC 1**: Ruang dapat di-sinkronkan sebagai resource `Location` (`physicalType = ro`), `status` mengikuti `is_active`, `managingOrganization` = Organization RS.
    * **AC 2**: ID hasil registrasi disimpan pada `satusehat_location_id`; sinkronisasi bersifat asynchronous/retry saat koneksi pulih (NFR-004).

---

**Fitur: Kontrol Akses (RBAC)**
* **User Story**: Sebagai Admin Sistem, saya ingin membatasi operasi CRUD & toggle status sesuai role, agar hanya user berhak yang dapat mengubah master.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Menu & aksi (tambah/ubah/toggle status) tunduk pada RBAC (A53); user tanpa hak tidak melihat/mengeksekusi aksi (BR-007).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `ibs_rooms`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `room_code`: Varchar(20) — Kode Ruang IBS, **unik**
    * `room_name`: Varchar(100) — Nama Ruang IBS
    * `room_type`: Enum(`OPERATING_ROOM`, `PRE_OP`, `RECOVERY`, `STERILIZATION`)
    * `unit_id`: UUID (FK → `units.id`, nullable)
    * `capacity`: Smallint (nullable, > 0) — jumlah meja operasi / bed pemulihan
    * `satusehat_location_id`: Varchar (nullable) — **Phase 2** (ID FHIR Location)
    * `is_active`: Boolean (default `true`)
    * `notes`: Varchar(255) (nullable) — Keterangan
    * `created_by`, `updated_by`: UUID (FK → `users.id`)
    * `created_at`, `updated_at`: Timestamp
    * `deleted_at`: Timestamp (nullable) — **hanya soft delete; tidak dipakai untuk hapus permanen dari UI**
    * *(Phase 2-ready, belum diaktifkan)* `approval_status`: Enum (nullable) · `approver_role`: Varchar (nullable)
* **Constraints**:
    * `UNIQUE(room_code) WHERE deleted_at IS NULL` — keunikan kode ruang di level DB (BR-001, NFR-005).
    * `CHECK(capacity > 0)` bila diisi (BR-006).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ibs-rooms` | List ruang IBS (filter: `room_type`, `is_active`, `search`, `sort`, `page`, `per_page`) — **menampilkan aktif & nonaktif** |
| POST | `/api/v1/ibs-rooms` | Create ruang baru (status = AKTIF) |
| GET | `/api/v1/ibs-rooms/{id}` | Detail ruang |
| PUT | `/api/v1/ibs-rooms/{id}` | Update data ruang |
| PATCH | `/api/v1/ibs-rooms/{id}/status` | **Toggle Aktif/Nonaktif** (dari tombol geser di list) |
| GET | `/api/v1/ibs-rooms/lookup` | Lookup ruang **aktif** untuk Penjadwalan Operasi & EMR (BR-003) |
| GET | `/api/v1/units` | Lookup Unit (relasi opsional) |
| POST | `/api/v1/ibs-rooms/{id}/satusehat/sync` | **(Phase 2)** Bridging ke SATUSEHAT Location |

> Tidak ada endpoint impor/ekspor — dihapus dari cakupan.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| room_code | Kode Ruang IBS | Text | Ya | unik, max 20 char, alfanumerik | manual | mis. OK-1, RR-1 (pola `kode_kamar` A16); BR-001 |
| room_name | Nama Ruang IBS | Text | Ya | max 100 char | manual | mis. "Kamar Operasi 1" |
| room_type | Tipe Ruang | Dropdown | Ya | enum: Kamar Operasi / Ruang Persiapan (Pre-Op) / Ruang Pemulihan (RR) / Ruang Sterilisasi | Enum | BR-005 |
| unit_id | Unit | Dropdown (lookup) | Tidak | dari master Unit (A3) | Lookup A3 | field kanonik |
| capacity | Kapasitas (Meja/Bed) | Number | Tidak | integer > 0 | manual | BR-006 |
| notes | Keterangan | Text | Tidak | max 255 char | manual | field kanonik |
| satusehat_location_id | Kode SATUSEHAT Location | Text (read-only) | Tidak | format ID Location SATUSEHAT | integrasi SATUSEHAT | **Phase 2** — diisi otomatis saat bridging |

> **Catatan status behavior**: Tidak ada input Status di form **create** — status di-set **AKTIF** oleh sistem; pengelolaan Aktif/Nonaktif dilakukan via **tombol geser (toggle) di list/Dashboard** (bukan di form).

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View / Dashboard)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Total Ruang IBS Aktif | `count(ibs_rooms WHERE is_active)` | angka besar (kartu ringkasan) | – | KPI di atas daftar |
| Kode | `ibs_rooms.room_code` | text | Sort default A-Z; Search | |
| Nama Ruang | `ibs_rooms.room_name` | text | Search | |
| Tipe Ruang | `ibs_rooms.room_type` | badge | Filter | |
| Kapasitas | `ibs_rooms.capacity` | angka | Sort | |
| Status | `ibs_rooms.is_active` | **tombol geser (toggle switch)** + badge (hijau=aktif / abu=nonaktif) | Filter | **Toggle langsung mengubah status**; nonaktif **tetap tampil di list** |
| Status SATUSEHAT *(Phase 2)* | ada/tidaknya `satusehat_location_id` | badge (tersinkron/belum) | Filter | tampil bila integrasi aktif |
| Aksi | – | button group | – | [Detail] [Edit] — **tanpa** aksi hapus permanen |

> **Catatan list:** default view **tidak menyembunyikan** ruang nonaktif; filter Status = Semua/Aktif/Nonaktif. Kolom Status memuat **tombol geser** untuk mengaktif/menonaktifkan tiap ruang langsung dari daftar.

#### 8.3.3 Business Rules

* **BR-001** — `room_code` wajib **unik** dalam satu RS. Jika duplikat → tolak simpan.
* **BR-002** — Ruang **tidak boleh dihapus permanen**; hanya di-nonaktifkan (`is_active = false`). Ruang nonaktif **tetap tampil di master list** (histori transaksi utuh).
* **BR-003** — Hanya ruang `is_active = true` yang muncul sebagai pilihan **lookup** di modul Penjadwalan Operasi & EMR (ruang nonaktif tetap ada di master list, tetapi tidak dapat dipilih untuk transaksi baru).
* **BR-005** — `room_type` mengikuti enum baku (Kamar Operasi / Ruang Persiapan / Ruang Pemulihan / Ruang Sterilisasi). Nilai di luar enum ditolak.
* **BR-006** — `capacity` harus > 0 bila diisi.
* **BR-007** — Hanya role dengan hak akses Master Data Control Panel yang boleh CRUD & toggle status (RBAC A53 / A18 Role). `[PERLU KONFIRMASI]` hak akses spesifik.
* **BR-008** — Perubahan status via toggle pada ruang yang dipakai transaksi berjalan memerlukan konfirmasi; menonaktifkan hanya mencegah pemakaian baru, data lama tetap utuh.

## 9. Workflow / BPMN Interpretation

> Modul A39 **belum punya BPMN sendiri**. Alur diturunkan dari pola master data A15/A16/A17 dan proses penjadwalan operasi pada BPMN `g-admisi-inpatient-registration` ("reschedule jadwal operasi") serta pola penguncian data pada `g-service-discharge`. Bagian turunan ditandai `[ASUMSI]`.

**Skenario 1 — Tambah Ruang IBS (Create)**
1. Admin buka **Master Data > Ruang IBS** → klik **Tambah**.
2. Sistem menampilkan form ruang IBS.
3. Admin isi field (kode, nama, tipe ruang, unit, kapasitas).
4. Sistem validasi: keunikan `room_code`, field wajib, relasi valid.
   * **Gateway — Kode sudah ada?** Ya → error "kode duplikat"; Tidak → lanjut.
5. Klik **SIMPAN** → data tersimpan, status default **Aktif** → muncul di list & tersedia sebagai lookup.

**Skenario 2 — Edit / Toggle Aktif-Nonaktif**
1. Admin cari & pilih ruang dari list → **Edit** (ubah data) → **SIMPAN** (validasi sama seperti Create).
2. Untuk mengubah status: **geser tombol toggle** pada baris ruang di list.
   * **Gateway — Ruang dipakai transaksi berjalan?** Ya → minta konfirmasi (hanya nonaktif, tanpa hapus permanen); Tidak → langsung ubah status.
3. Ruang nonaktif **tetap tampil di list** (badge abu), namun tidak muncul di lookup penjadwalan baru.

**Skenario 3 — Konsumsi oleh modul lain**
1. Modul Penjadwalan Operasi / EMR memanggil lookup ruang **aktif** → pilih → simpan `ibs_room_id`.

**Skenario 4 — (Phase 2) Bridging SATUSEHAT**
1. Saat ruang diaktifkan, sistem sinkron ke SATUSEHAT `Location` (`physicalType = ro`, `status` mengikuti `is_active`) → simpan `satusehat_location_id` (asynchronous/retry).

---

## 10. Non-Functional Requirements

* **NFR-001 (Performa)** — List ruang IBS tampil < 2 detik untuk data khas RS Tipe C&D (< 50 ruang); lookup di modul lain < 1 detik.
* **NFR-002 (Usability)** — Form dapat dioperasikan petugas non-IT; label bahasa Indonesia; pesan error jelas & spesifik per field; toggle status intuitif.
* **NFR-003 (Keamanan/Audit)** — Setiap Create/Update/perubahan status dicatat **audit log** (siapa, kapan, aksi). Akses dibatasi RBAC (A53).
* **NFR-004 (Ketersediaan/Offline)** — Master data statis di-cache lokal agar lookup tetap jalan saat internet tidak stabil; bridging SATUSEHAT asynchronous/retry saat koneksi pulih. `[ASUMSI]`
* **NFR-005 (Integritas)** — Constraint keunikan `room_code` diberlakukan di level basis data, bukan hanya UI.
* **NFR-006 (Skalabilitas)** — Struktur mendukung penambahan tipe ruang/atribut baru tanpa migrasi mayor.

---

## 11. Integrasi Eksternal

| Integrasi | Arah | Keterangan | Fase/Status |
|-----------|------|------------|-------------|
| **SATUSEHAT — Location** | Outbound (push) | Ruang IBS diregistrasi sebagai resource **Location** (`physicalType = ro`) untuk interoperabilitas & pelaporan tindakan bedah | **Phase 2** `[PERLU KONFIRMASI]` masuk MVP/tidak |
| **Master Unit (A3)** | Internal lookup | `unit_id` | Opsional |
| **Modul Penjadwalan Operasi** | Internal (dikonsumsi) | Lookup ruang aktif (US-005); BPMN `g-admisi-inpatient-registration` "reschedule jadwal operasi" | Wajib (konsumen) |
| **EMR Tindakan Bedah** | Internal (dikonsumsi) | Lokasi tindakan operasi | Wajib (konsumen) |

> **Catatan Interoperabilitas SATUSEHAT** `[ASUMSI]`: bila diaktifkan (Phase 2), gunakan resource `Location` dengan `physicalType = ro (room)`, `status = active/inactive` mengikuti `is_active`, dan referensi `managingOrganization` ke Organization RS. Kode hasil registrasi disimpan di `satusehat_location_id`. Tidak ada kode BPJS khusus untuk master ruang IBS. `[PERLU KONFIRMASI]` apakah ketersediaan OK perlu dilaporkan ke BPJS Aplicares.

---

## Lampiran — Asumsi & Pertanyaan Terbuka

**Asumsi**
* `[ASUMSI]` Modul A39 belum punya BPMN sendiri; alur As-Is/To-Be & gateway diturunkan dari pola master data A15/A16/A17 dan proses penjadwalan operasi di BPMN `g-admisi-inpatient-registration`.
* `[ASUMSI]` Ruang IBS = ruang di Instalasi Bedah Sentral (kamar operasi, pre-op, recovery, sterilisasi) — objek master data statis, bukan transaksional.
* `[ASUMSI]` RS Tipe C & D memiliki 1–3 kamar operasi sehingga data ruang berjumlah kecil.
* `[ASUMSI]` Nonaktivasi (soft delete) dipilih agar histori transaksi bedah tetap utuh; **tidak ada hapus permanen**.
* `[ASUMSI]` Field kanonik (unit, is_active, keterangan) mengikuti definisi bersama lintas-PRD.

**Pertanyaan Terbuka**
* Apakah A39 masuk cakupan bridging SATUSEHAT Location pada rilis MVP (Phase 2)?
* Hak akses (role) mana yang boleh CRUD & toggle status master Ruang IBS? (A53 RBAC / A18 Role)
* Apakah ketersediaan/okupansi ruang OK perlu dilaporkan ke BPJS Aplicares seperti bed?
* Apakah `capacity` bermakna jumlah meja operasi (OK) sekaligus jumlah bed (RR), atau perlu dipisah per tipe ruang?
