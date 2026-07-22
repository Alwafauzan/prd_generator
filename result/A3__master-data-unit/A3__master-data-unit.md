# PRD — A3 Master Data: Unit (FHIR Location / SATUSEHAT) — Include UI

> Disusun mengikuti **template.md**. Sumber pengetahuan: *PRD Master Data / Integrasi SATUSEHAT BPJS V2 — Unit*. Kode Fitur: **A3**. Target: SIMRS RS Tipe C & D. Bagian turunan analogi ditandai `[ASUMSI]`; hal belum pasti ditandai `[PERLU KONFIRMASI]`.

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — `[PERLU KONFIRMASI]`
* **Related Documents**:
    * Design Figma — Master Data Unit (A3)
    * SATUSEHAT FHIR `Location` Resource (R4)
    * PRD Master Data — Instalasi/Organisasi (A19) — induk `managingOrganization`
    * PRD Master Data — Wilayah (A32) — sumber `address`
    * PRD Master Data — Staf (A2)
    * PRD Master Data — Bangsal (A15), Kamar (A16), Bed (A17) — turunan hierarki `partOf`
* **Document Version**:
    | Tanggal | Versi | Deskripsi Perubahan |
    |---------|-------|---------------------|
    | 2026-07-02 | 1.0 — Draft awal | Penyusunan awal PRD A3 Unit mengikuti template, termasuk spesifikasi UI. |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  Fitur **A3 — Master Data Unit** mencatat dan mengelola seluruh **unit/lokasi fisik** RS — dari kompleks RS, gedung, lantai, ruangan/bangsal, kamar, hingga tempat tidur (bed). Unit di sistem ini **setara dengan resource `Location` pada FHIR SATUSEHAT** (lokasi fisik tempat layanan kesehatan dilakukan). Modul menjadi **single source of truth** unit bagi modul lain (Pelayanan RJ/RI/IGD/Penunjang, Farmasi/Inventori, EMR, Keuangan). Data dikirim ke SATUSEHAT dengan **struktur hierarki** via `Location.partOf` (kompleks → gedung → lantai → bangsal/ruangan → kamar → bed) untuk menjamin **interoperabilitas** dan **konsistensi referensi unit**. Field `unit (Unit/Poli)` yang dipakai modul A2/A10/A14/A15/A16/A43/A1 bersumber dari master A3 ini.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini) `[ASUMSI]`:
        * Daftar unit dicatat manual (spreadsheet) atau tersebar per modul → nama/kode unit tidak seragam (mis. "Poli Anak" vs "Klinik Anak").
        * Tidak ada hierarki lokasi formal; relasi gedung–lantai–kamar–bed tidak terekam.
        * Tidak ada data geografis (long/lat) & jam operasional yang diminta SATUSEHAT.
        * Pengiriman ke SATUSEHAT ad-hoc/manual → rawan gagal validasi karena field mandatory FHIR tidak lengkap (mis. `position`).
    * **To-Be** (solusi digital) — selaras FHIR Location:
        1. Admin membuka **Master Data → Unit (A3)**, menambah/mengubah unit dengan field FHIR Location lengkap.
        2. Admin memilih **organisasi pengelola (`managingOrganization`)** dan **lokasi induk (`partOf`)**.
        3. Sistem **memvalidasi** field mandatory FHIR + keunikan `identifier` dalam satu `managingOrganization`, lalu **menyimpan** ke DB internal.
        4. Sistem menampilkan **struktur pohon** hierarki lokasi dan menyediakan Unit sebagai referensi tunggal ke modul lain.
        5. **[Phase 2]** Sistem melakukan **POST** (unit baru) / **PUT** (update) ke endpoint Location SATUSEHAT, menyimpan **IHS Location ID** dari response; bila gagal → status **pending sync** + retry.

> **Batas fase**: Phase 1 (MVP) = pengelolaan data unit **lokal saja** (CRUD, hierarki, status, audit log). **Seluruh integrasi pihak ketiga** (SATUSEHAT FHIR Location, pemetaan BPJS) berada di **Phase 2**. Skema data & field FHIR sudah disiapkan sejak Phase 1 agar integrasi Phase 2 tidak memerlukan migrasi struktur.

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Konsistensi data antar modul | 100% modul yang butuh unit memakai referensi yang sama (master A3) |
| 2 | Kelengkapan field FHIR (Phase 1) | 100% unit memiliki field mandatory (`name`, `mode`, `position.longitude`, `position.latitude`, `managingOrganization`) terisi — siap kirim saat integrasi Phase 2 |
| 3 | Kemandirian user non-teknis | 100% Admin RS mampu setup unit tanpa bantuan tim teknis |
| 4 | Kecepatan pencarian | Waktu pencarian/filter unit < 3 detik |
| 5 `[**]` | Sukses sinkronisasi SATUSEHAT (Phase 2) | ≥ 95% unit berhasil di-POST/PUT ke endpoint Location tanpa error validasi |

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) |
|-------------|---------------------|--------------------|
| Dashboard Unit | List, cari, filter (status, type, physicalType, organisasi), kartu ringkasan | Kolom & filter lanjutan, saved view |
| Tambah/Edit Unit | Form seluruh field FHIR Location + validasi mandatory (simpan **lokal**) | — |
| Status Unit | Toggle Aktif/Suspended/Inactive (`Location.status`) di dashboard | — |
| Hierarki Lokasi | Manajemen `partOf` + tampilan **tree** + validasi anti-siklus | — |
| Detail Unit | Atribut FHIR lengkap + audit log | Tambah panel status sinkronisasi SATUSEHAT |
| Riwayat Aktivitas | Audit log (user, waktu, aksi, unit) | — |
| **Integrasi SATUSEHAT** | **— (tidak ada di Phase 1)** | POST/PUT FHIR Location + simpan IHS Location ID + status sync + retry pending |
| **Integrasi/Pemetaan BPJS** | **— (tidak ada di Phase 1)** | Pemetaan kode poli/ruang ke referensi BPJS (VClaim/Aplicares) `[PERLU KONFIRMASI]` |
| Operational Status Bed | field muncul bila physicalType=bed | Dashboard okupansi bed lanjutan `[ASUMSI]` |
| Impor/Ekspor Massal | — | Impor/Ekspor CSV/XLSX (mode tambah / tambah+update) `[**]` |
| Approval berjenjang | — | Alur approval perubahan unit (arsitektur data disiapkan sejak Phase 1) `[ASUMSI]` |

**Out of Scope**:
| No | Scope | Ditangani oleh |
|----|-------|----------------|
| 1 | Data organisasi pengelola | Master Data Organisasi/Instalasi (A19) |
| 2 | Staf yang bertugas di unit | Master Data Staf (A2) |
| 3 | Jadwal layanan, appointment, service | Modul HealthcareService & Appointment |
| 4 | Stok & inventori gudang/farmasi | Modul Inventori (A42) |
| 5 | Reservasi & booking bed | Modul Rawat Inap |

> Catatan phasing: **Phase 1 = MVP lokal murni** (CRUD, hierarki, status, audit) — **tanpa integrasi eksternal apa pun** dan tanpa approval berjenjang. Semua integrasi pihak ketiga (SATUSEHAT, BPJS) dan approval berada di **Phase 2**. Skema data menyertakan kolom FHIR + `ihs_location_id`, `sync_status`, `approval_status`, `approver_role` (nullable) sejak awal agar Phase 2 tidak perlu migrasi struktur.

---

## 5. Related Features

| No | Code | Module | Feature | Relasi dengan Unit (A3) |
|----|------|--------|---------|-------------------------|
| 1 | A19 | Master Data | Instalasi (Organization) | `managingOrganization` (induk Unit) |
| 2 | A32 | Master Data | Wilayah (Prov/Kab/Kec/Kel) | Sumber `address` lokasi |
| 3 | A2 | Master Data | Staf | Staf bertugas di Unit (di-handle modul Staf) |
| 4 | A15/A16/A17 | Master Data | Bangsal/Kamar/Bed | Turunan hierarki Unit (`partOf`) |
| 5 | A43 | Master Data | Tarif Kamar | Tarif terkait kamar/kelas perawatan |
| 6 | — | Pelayanan | RJ, RI, IGD, Penunjang | Konsumen referensi Unit |
| 7 | A42 | Inventori/Gudang Farmasi & RT | Penerimaan, Pengeluaran, Mutasi | Lokasi gudang = Unit |
| 8 | — | Integrasi Eksternal | SATUSEHAT FHIR Location | Sinkronisasi unit |

> Field `unit (Unit/Poli)` yang dipakai modul A2/A10/A14/A15/A16/A43/A1 sebagai dropdown lookup **bersumber dari master Unit A3 ini** — acuan tunggal.

---

## 6. Business Process & User Stories

### State Machine Table — `Location.status` (+ sync)

| Status | Deskripsi | Efek pada Referensi | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|---------------------|--------------------|--------------------|
| `active` | Unit aktif & dapat dipakai transaksi baru | Muncul di semua dropdown lookup | → suspended, → inactive | → suspended, → inactive (via approval) |
| `suspended` | Unit ditangguhkan sementara | Tidak dipilih transaksi baru; historis tetap | → active, → inactive | idem (via approval) |
| `inactive` | Unit nonaktif (soft delete) | Tidak dipilih transaksi baru; historis tetap | → active | → active (via approval) |

**Sync State `[Phase 2]`:** `synced` (IHS Location ID tersimpan) · `pending` (gagal/antre kirim, dapat retry) · `error` (gagal validasi FHIR). Transisi: `pending → synced` saat retry sukses; `synced → pending` saat edit belum ter-PUT. Di **Phase 1** kolom `sync_status` tetap ada di skema namun **tidak dipakai** (tanpa proses sinkronisasi).

> **Aturan status form:** status **tidak** diinput saat create — sistem set `active` otomatis. Perubahan status dilakukan di **level Dashboard** (toggle/aksi Ubah Status).

### User Stories Utama

| ID | User Story | Prioritas | Fase |
|----|-----------|-----------|------|
| US-001 | Sebagai **Admin Master Data**, saya ingin menambah unit dengan field FHIR Location lengkap, agar data lokasi terstandar & siap dikirim ke SATUSEHAT saat integrasi Phase 2. | P0 | 1 |
| US-002 | Sebagai **Admin Master Data**, saya ingin mengubah data unit dan tersimpan lokal, agar data selalu mutakhir. | P0 | 1 |
| US-003 | Sebagai **Admin Master Data**, saya ingin menetapkan `partOf` dan melihat tree lokasi, agar hierarki kompleks→…→bed jelas. | P0 | 1 |
| US-004 | Sebagai **Admin Master Data**, saya ingin mengubah status unit (active/suspended/inactive) dari dashboard, agar unit nonaktif tidak dipakai transaksi baru tetapi tetap ada di histori. | P0 | 1 |
| US-005 | Sebagai **Admin RS non-teknis**, saya ingin mencari & memfilter unit < 3 detik, agar setup/pengecekan mudah tanpa IT. | P0 | 1 |
| US-006 | Sebagai **Petugas Pelayanan/Inventori**, saya ingin memilih unit dari daftar referensi tunggal, agar nama/kode konsisten antar modul. | P1 | 1 |
| US-007 | Sebagai **Admin Master Data**, saya ingin mengelola operationalStatus bed (occupied/vacant/reserved), agar rawat inap terbantu. `[ASUMSI]` | P1 | 1 |
| US-008 `[**]` | Sebagai **Sistem (Integrasi)**, saya ingin mengirim unit ke SATUSEHAT (POST/PUT) dan menyimpan IHS Location ID dari response, agar unit tersinkron & update berikutnya memakai referensi benar. | P2 | 2 |
| US-009 `[**]` | Sebagai **Admin Master Data**, saya ingin impor/ekspor unit via CSV/XLSX, agar setup massal cepat. | P2 | 2 |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Dashboard Unit (List, Cari, Filter)**
* **User Story**: Sebagai Admin RS, saya ingin melihat & mencari unit dengan cepat, agar pengecekan mudah.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Dashboard menampilkan kolom: Kode Unit, Nama, Tipe/Tipe Fisik, Organisasi Pengelola, Lokasi Induk, Status (badge), Aksi. *(Kolom Status Sinkron SATUSEHAT ditambahkan di Phase 2.)*
    * **AC 2**: Pencarian by kode/nama mengembalikan hasil < 3 detik (NFR-001).
    * **AC 3**: Filter tersedia untuk `status`, `type`, `physical_type`, `managing_organization`. *(Filter `sync_status` menyusul di Phase 2.)*
    * **AC 4**: Kartu ringkasan menampilkan Total Unit Aktif dan Total Bed (Vacant/Occupied). `[ASUMSI]`
    * **AC 5**: Aksi per baris: Edit, Detail, Ubah Status.

---

**Fitur: Tambah Unit (FHIR Location)**
* **User Story**: Sebagai Admin Master Data, saya ingin menambah unit dengan field FHIR Location lengkap, agar data terstandar & siap dikirim ke SATUSEHAT saat integrasi Phase 2.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memuat seluruh field pada §8.3.1.
    * **AC 2**: Field mandatory FHIR (`nama`, `mode`, `position_longitude`, `position_latitude`, `managing_organization`) divalidasi wajib sebelum simpan (BR-001).
    * **AC 3**: `unit_code` divalidasi unik dalam satu `managing_organization`; duplikat ditolak dengan pesan jelas (BR-002).
    * **AC 4**: Field `status` **tidak** ditampilkan di form create; sistem set `active` otomatis.
    * **AC 5**: Field `operational_status` hanya muncul saat `physical_type = bd (bed)` (BR-004).
    * **AC 6**: Setelah valid, data **tersimpan lokal** ke DB (tanpa pengiriman ke sistem eksternal). *(Pengiriman POST ke SATUSEHAT dilakukan pada Phase 2.)*

---

**Fitur: Edit Unit**
* **User Story**: Sebagai Admin Master Data, saya ingin mengubah data unit dan tersimpan lokal, agar data selalu mutakhir.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Edit menampilkan seluruh field dengan nilai existing.
    * **AC 2**: Validasi sama seperti Tambah (mandatory FHIR + keunikan identifier).
    * **AC 3**: Perubahan tersimpan lokal ke DB dan tercatat di audit log. *(Pemicu PUT ke SATUSEHAT berdasarkan `ihs_location_id` dilakukan pada Phase 2 — BR-005.)*

---

**Fitur: Ubah Status Unit (Dashboard)**
* **User Story**: Sebagai Admin Master Data, saya ingin mengubah status unit dari dashboard.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Aksi Ubah Status mengubah `Location.status` (active/suspended/inactive) sesuai State Machine (§6).
    * **AC 2**: Unit `inactive`/`suspended` tidak muncul sebagai pilihan transaksi baru di modul lain, tetapi tetap tampil di data historis (BR-006).
    * **AC 3**: Unit **tidak** dapat dihapus permanen bila sudah direferensikan transaksi (BR-007) — hanya soft delete via status.
    * **AC 4**: Perubahan status tercatat di audit log. *(Sinkronisasi PUT status ke SATUSEHAT dilakukan pada Phase 2.)*

---

**Fitur: Manajemen Hierarki (`partOf`) + Tree**
* **User Story**: Sebagai Admin Master Data, saya ingin menetapkan lokasi induk & melihat pohon lokasi.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Field `part_of` memilih unit lain yang valid.
    * **AC 2**: Sistem menolak `part_of` yang menunjuk diri sendiri atau membentuk **siklus** (BR-003).
    * **AC 3**: Detail Unit menampilkan **tree** kompleks→gedung→lantai→ruangan→kamar→bed dengan expand/collapse.

---

**Fitur: Integrasi SATUSEHAT (POST/PUT + Retry) `[**]`**
* **User Story**: Sebagai Sistem, saya ingin mengirim unit ke SATUSEHAT, menyimpan IHS Location ID & menangani kegagalan sync.
* **Prioritas**: P2 · **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: POST unit baru → simpan `ihs_location_id` dari response.
    * **AC 2**: Update unit yang sudah punya `ihs_location_id` memakai **PUT** (bukan POST) — BR-005.
    * **AC 3**: Kegagalan POST/PUT → data internal tetap tersimpan, `sync_status = pending`, error ter-log, ada notifikasi (BR-008).
    * **AC 4**: Tersedia mekanisme retry untuk unit `pending`/`error`.

> Prasyarat Phase 2 sudah dipenuhi Phase 1: field FHIR lengkap tervalidasi + kolom `ihs_location_id`/`sync_status` tersedia di skema (§8.1).

---

**Fitur: Detail Unit & Riwayat Aktivitas**
* **User Story**: Sebagai Admin, saya ingin melihat atribut lengkap + audit log.
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Detail menampilkan seluruh atribut FHIR (§8.3.1) + posisi pada peta. *(Panel `ihs_location_id` + status sync ditambahkan di Phase 2.)*
    * **AC 2**: Audit log mencatat user, timestamp, aksi (create/update/status-change), unit, dan diff perubahan. *(Aksi `sync` menyusul di Phase 2.)*

---

**Fitur: Impor & Ekspor Massal `[**]`**
* **User Story**: Sebagai Admin, saya ingin impor/ekspor unit via CSV/XLSX.
* **Prioritas**: P2 · **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Unduh template CSV/XLSX; unggah dengan mode `tambah` / `tambah+update`.
    * **AC 2**: Validasi per baris; baris invalid dilaporkan tanpa membatalkan baris valid; sukses tersimpan (masuk antrian sync bila integrasi Phase 2 aktif).

### 7.2 Validasi (Wording Frontend)

| Field | Tipe Input | Rules | Error Message | Helper Text |
|-------|------------|-------|---------------|-------------|
| Kode Unit | Text | Required, Max 50, unik per organisasi | "Kode unit wajib diisi dan harus unik dalam organisasi pengelola." | "Kode identifier unit, mis. UNIT-POLI-ANAK." |
| Nama Unit | Text | Required, Max 100 | "Nama unit wajib diisi." | "Nama resmi unit, mis. Poli Anak." |
| Alias | Text | Max 100 | "Alias maksimal 100 karakter." | "Nama lain unit (opsional)." |
| Keterangan | Textarea | Max 255 | "Keterangan maksimal 255 karakter." | "Deskripsi singkat unit." |
| Mode Lokasi | Dropdown | Required (instance/kind) | "Mode lokasi wajib dipilih." | "Umumnya 'instance' untuk lokasi fisik nyata." |
| Tipe Unit | Dropdown (lookup) | Required | "Tipe unit wajib dipilih." | "Contoh: HOSP, WARD, ER (codeset SATUSEHAT)." |
| Tipe Fisik | Dropdown | Required | "Tipe fisik wajib dipilih." | "Menentukan level hierarki: site/building/level/room/bed." |
| Status Operasional | Dropdown | Required jika Tipe Fisik = bed | "Status operasional wajib untuk bed." | "Occupied/Vacant/Reserved — hanya untuk bed." |
| Organisasi Pengelola | Dropdown (lookup A19) | Required | "Organisasi pengelola wajib dipilih." | "Sumber dari Master Instalasi/Organisasi." |
| Lokasi Induk (partOf) | Lookup | Tidak boleh diri sendiri/siklus | "Lokasi induk tidak boleh membentuk siklus." | "Pilih unit di atasnya pada hierarki." |
| Longitude | Number | Required, -180..180 | "Longitude wajib, rentang -180 s/d 180." | "Titik lokasi (mandatory SATUSEHAT)." |
| Latitude | Number | Required, -90..90 | "Latitude wajib, rentang -90 s/d 90." | "Titik lokasi (mandatory SATUSEHAT)." |
| Provinsi/Kab/Kec/Kel | Dropdown (lookup A32) | Cascading | "Pilih wilayah sesuai urutan." | "Bersumber dari Master Wilayah." |
| Kode Pos | Text | 5 digit | "Kode pos harus 5 digit angka." | — |
| No. Telepon Unit | Text | 10–15 digit | "Nomor telepon 10–15 digit." | — |
| Email Unit | Text | Format email | "Format email tidak valid." | — |
| Jam Operasional | Komposit | Jam buka < jam tutup | "Jam buka harus lebih awal dari jam tutup." | "Set per hari operasional." |

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `master_unit`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `unit_code`: VARCHAR(50) — unik per `managing_organization_id` (BR-002)
    * `name`: VARCHAR(100) NOT NULL
    * `alias`: VARCHAR(100) NULL
    * `description`: VARCHAR(255) NULL
    * `status`: ENUM('active','suspended','inactive') DEFAULT 'active' — `Location.status`
    * `operational_status`: VARCHAR(2) NULL — hanya bila `physical_type='bd'`
    * `mode`: ENUM('instance','kind') DEFAULT 'instance' NOT NULL
    * `type_code`: VARCHAR(20) NOT NULL — ServiceDeliveryLocationRoleType (HOSP/WARD/ER/…)
    * `physical_type`: VARCHAR(5) NOT NULL — si/bu/wi/lvl/ro/bd/area
    * `managing_organization_id`: UUID NOT NULL (FK → `master_organization`, A19)
    * `part_of_id`: UUID NULL (FK → `master_unit.id`, self-ref; anti-siklus)
    * `position_longitude`: DECIMAL(9,6) NOT NULL
    * `position_latitude`: DECIMAL(9,6) NOT NULL
    * `position_altitude`: DECIMAL(9,2) NULL
    * `province_code`, `regency_code`, `district_code`, `village_code`: VARCHAR — FK Wilayah (A32)
    * `address_line`: VARCHAR(255) NULL
    * `postal_code`: VARCHAR(5) NULL
    * `telecom_phone`: VARCHAR(15) NULL
    * `telecom_email`: VARCHAR(100) NULL
    * `hours_of_operation`: JSONB NULL — [{days_of_week, opening_time, closing_time}]
    * `availability_exceptions`: VARCHAR(255) NULL
    * `care_class`: VARCHAR(20) NULL — VVIP/VIP/I/II/III/Isolasi `[PERLU KONFIRMASI]`
    * `ihs_location_id`: VARCHAR(64) NULL — Location.id dari SATUSEHAT
    * `sync_status`: ENUM('synced','pending','error') DEFAULT 'pending'
    * `sync_error_message`: TEXT NULL
    * `approval_status`: ENUM('none','pending','approved','rejected') DEFAULT 'none' — *disiapkan untuk Phase 2*
    * `approver_role`: VARCHAR(50) NULL — *disiapkan untuk Phase 2*
    * `is_active`: BOOLEAN DEFAULT true — turunan `status<>'inactive'`
    * `created_at`, `updated_at`, `created_by`, `updated_by`

* **Table Name**: `audit_log_unit`
* **Key Columns**: `id` UUID PK · `unit_id` UUID FK · `unit_code` VARCHAR · `action` ENUM('create','update','status_change','sync') · `user_id` · `user_name` · `diff` JSONB · `created_at` TIMESTAMP.

*Index:* `(managing_organization_id, unit_code)` unik; index pada `name`, `status`, `sync_status` untuk performa pencarian (NFR-001).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/units` | List unit (query: `search`, `status`, `type`, `physical_type`, `organization_id`, `sync_status`, pagination) |
| GET | `/api/v1/units/{id}` | Detail unit + atribut FHIR lengkap |
| GET | `/api/v1/units/tree` | Struktur pohon hierarki (`partOf`) |
| POST | `/api/v1/units` | Create unit → validasi → simpan lokal (Phase 1) |
| PUT | `/api/v1/units/{id}` | Update unit → validasi → simpan lokal (Phase 1) |
| PATCH | `/api/v1/units/{id}/status` | Ubah status (active/suspended/inactive) |
| GET | `/api/v1/units/{id}/audit-logs` | Riwayat aktivitas unit |
| POST | `/api/v1/units/{id}/sync` | Kirim/retry sinkronisasi SATUSEHAT (pending/error) `[**] Phase 2` |
| POST | `/api/v1/units/import` | Impor massal CSV/XLSX `[**] Phase 2` |
| GET | `/api/v1/units/export` | Ekspor CSV/XLSX `[**] Phase 2` |

> **Phase 1 vs Phase 2**: pada Phase 1, `POST`/`PUT` hanya menyimpan data secara lokal (tanpa memanggil endpoint eksternal). Pada Phase 2, kedua handler ini juga memicu POST/PUT ke SATUSEHAT Location (POST bila belum ada `ihs_location_id`, PUT bila sudah) dan endpoint `/sync` menangani retry.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT) — UI

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| unit_code | Kode Unit (identifier) | text | Ya | unik per organisasi, maks 50 | manual/auto | BR-002; FHIR `identifier` |
| nama | Nama Unit | text | Ya | maks 100 | manual | FHIR `name` (mandatory) |
| alias | Alias | text | Tidak | maks 100 | manual | FHIR `alias` |
| keterangan | Keterangan | textarea | Tidak | maks 255 | manual | FHIR `description` |
| operational_status | Status Operasional | dropdown | Kondisional | O/U/K/C/H/I | manual | hanya bila physicalType=bed; FHIR `operationalStatus` |
| mode | Mode Lokasi | dropdown | Ya | instance/kind | default instance | FHIR `mode` (mandatory) |
| type | Tipe Unit | dropdown(lookup) | Ya | HOSP/OF/WARD/ER/… | codeset SATUSEHAT | FHIR `type` |
| physical_type | Tipe Fisik | dropdown | Ya | si/bu/wi/lvl/ro/bd/area | codeset FHIR | FHIR `physicalType`; pengendali hierarki |
| managing_organization | Organisasi Pengelola | dropdown(lookup) | Ya | dari A19 | lookup A19 | FHIR `managingOrganization` (mandatory) |
| part_of | Lokasi Induk | lookup | Tidak | valid, tidak siklus | lookup Unit (A3) | FHIR `partOf`; BR-003 |
| position_longitude | Longitude | number | Ya | -180..180 | manual/map | FHIR `position.longitude` (mandatory) |
| position_latitude | Latitude | number | Ya | -90..90 | manual/map | FHIR `position.latitude` (mandatory) |
| position_altitude | Altitude | number | Tidak | desimal | manual | FHIR `position.altitude` |
| provinsi | Provinsi | dropdown(lookup) | Tidak | dari A32 | lookup A32 | `address`; BR-009 |
| kabupaten | Kabupaten/Kota | dropdown(lookup) | Tidak | turun dari provinsi | lookup A32 | |
| kecamatan | Kecamatan | dropdown(lookup) | Tidak | turun dari kabupaten | lookup A32 | |
| kelurahan | Kelurahan/Desa | dropdown(lookup) | Tidak | turun dari kecamatan | lookup A32 | |
| alamat | Alamat (jalan/detail) | text | Tidak | maks 255 | manual | FHIR `address.line` |
| kode_pos | Kode Pos | text | Tidak | 5 digit | manual | FHIR `address.postalCode` |
| telecom_phone | No. Telepon | text | Tidak | 10–15 digit | manual | FHIR `telecom` |
| telecom_email | Email | text | Tidak | format email | manual | FHIR `telecom` |
| hours_of_operation | Jam Operasional | komposit | Tidak | buka < tutup | manual | FHIR `hoursOfOperation` |
| availability_exception | Pengecualian Jam | text | Tidak | maks 255 | manual | FHIR `availabilityExceptions` |
| kelas_perawatan | Kelas Perawatan | dropdown | Tidak | VVIP/VIP/I/II/III/Isolasi | master kelas | `[PERLU KONFIRMASI]` enum; relevan bila room/bed |

> **Status tidak ditampilkan di form create** (diset `active` oleh sistem; template poin 3). Pada mode Edit, status diubah lewat aksi dashboard.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View) — UI

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| Total Unit Aktif | count where status=active | angka (kartu) | – | ringkasan |
| Total Bed (Vacant/Occupied) | count where physicalType=bed group by operationalStatus | angka + badge | filter | `[ASUMSI]` |
| Kode Unit | unit_code | text | sort A-Z, search | |
| Nama Unit | name | text | sort, search | |
| Tipe / Tipe Fisik | type / physical_type | badge | filter | |
| Organisasi Pengelola | managing_organization (A19) | text | filter | |
| Lokasi Induk | part_of | text | filter | hierarki |
| Status | status | badge (active=hijau/suspended=kuning/inactive=abu) | filter | |
| Status Sinkron SATUSEHAT `[**]` | sync_status + ihs_location_id | badge (synced/pending/error) | filter | **Phase 2** |
| Aksi | – | Edit / Detail / Ubah Status | – | |

**Layar Detail + Tree (UI):** Tree Lokasi (rekursif via part_of, expand/collapse, anti-siklus) · Atribut FHIR lengkap (label-value + peta posisi) · Riwayat Aktivitas (tabel user/waktu/aksi, sort waktu desc) · **[Phase 2]** IHS Location ID + status sync.

* **Business Rules**:

| ID | Business Rule | Prioritas | Fase |
|----|---------------|-----------|------|
| BR-001 | Field mandatory FHIR (`name`, `mode`, `position.longitude`, `position.latitude`, `managingOrganization`) wajib terisi sebelum simpan. | P0 | 1 |
| BR-002 | `identifier` unit harus unik dalam satu `managingOrganization`; duplikat ditolak. | P0 | 1 |
| BR-003 | `partOf` tidak boleh menunjuk diri sendiri atau membentuk siklus. | P0 | 1 |
| BR-004 | `physicalType=bed` mengaktifkan `operationalStatus`; tipe lain field disembunyikan. `[ASUMSI]` | P1 | 1 |
| BR-006 | Unit `inactive` tidak dipilih transaksi baru tetapi tetap tampil di data historis. | P1 | 1 |
| BR-007 | Unit tidak dihapus permanen bila sudah direferensikan transaksi; pakai soft delete (status inactive). | P0 | 1 |
| BR-009 | `address` mengacu Master Wilayah (A32) untuk kode Kemendagri; tidak free-text untuk prov/kab/kec/kel. `[PERLU KONFIRMASI]` | P1 | 1 |
| BR-005 `[**]` | Unit yang sudah terkirim memakai PUT (bukan POST) saat update, berdasarkan IHS Location ID. | P0 | 2 |
| BR-008 `[**]` | Bila POST/PUT gagal, data tetap tersimpan dengan `sync_status=pending` dan dapat di-retry. | P1 | 2 |

---

## 9. Workflow / BPMN Interpretation

**Flow utama Phase 1 (To-Be, MVP lokal):**
```
[Admin Master Data]
   → Akses Menu Master Data - Unit (A3)
   → Pilih Tambah / Edit Unit
   → Input Data Unit lengkap (FHIR Location)
   → Pilih managingOrganization (A19) & partOf (induk)
[Sistem]
   → Validasi field mandatory FHIR & keunikan identifier
   → (Valid?) ── Tidak → Tampilkan pesan error, kembali ke form
              └─ Ya  → Simpan ke DB master_unit (status=active), catat audit log
   → Unit tersedia sebagai referensi di modul Pelayanan, Inventori, Rawat Inap, EMR
```

**Lanjutan Phase 2 (integrasi SATUSEHAT):**
```
[Sistem] setelah simpan lokal
   → POST (baru) / PUT (update) ke SATUSEHAT Location
   → (Sukses?) ── Tidak → sync_status=pending + log error + notifikasi (retry)
                └─ Ya  → Simpan IHS Location ID (sync_status=synced)
```

**Skenario tambahan:** Ubah status (Phase 1: lokal + audit; Phase 2: PUT `Location.status`) · Kelola hierarki (`partOf` → tree) · Impor massal `[**]` Phase 2 (unduh template → isi → upload → validasi baris → simpan + antrian sync).

### Integrasi Eksternal — SATUSEHAT FHIR `Location` `[**] Phase 2`
> Seluruh sub-bagian integrasi berikut **dieksekusi pada Phase 2**. Pada Phase 1 hanya dijadikan acuan pemetaan field agar data lokal sudah siap dikirim.

* **Endpoint**: `POST /Location` (baru), `PUT /Location/{id}` (update). `[PERLU KONFIRMASI]` base URL & environment (sandbox/production) + versi FHIR.
* **Autentikasi**: OAuth2 client credentials SATUSEHAT (dikelola layer integrasi global). `[ASUMSI]`
* **Mandatory FHIR** (BR-001): `name`, `mode`, `position.longitude`, `position.latitude`, `managingOrganization`.
* **Simpan**: IHS Location ID (`Location.id`) untuk PUT & referensi modul lain.
* **Mapping internal → FHIR**: `unit_code→identifier[].value` · `nama→name` · `alias→alias[]` · `keterangan→description` · `status→status` · `operational_status→operationalStatus` · `mode→mode` · `type→type[].coding` · `physical_type→physicalType.coding` · `managing_organization→managingOrganization.reference (Organization/{ihs})` · `part_of→partOf.reference (Location/{ihs})` · `position_*→position.*` · `prov/kab/kec/kel/alamat/kode_pos→address.*` (extension kode Kemendagri A32) · `telecom_*→telecom[]` · `hours_of_operation→hoursOfOperation[]`.

### BPJS V2 `[**] Phase 2` `[PERLU KONFIRMASI]`
Nama modul menyebut "BPJS V2" tetapi sumber hanya merinci FHIR Location SATUSEHAT. Pemetaan/integrasi BPJS **berada di Phase 2**. `[PERLU KONFIRMASI]` apakah Unit perlu pemetaan kode poli/ruang ke referensi BPJS (VClaim/Aplicares). Bila ya → tambah field `kode_poli_bpjs`.

---

## Asumsi
- `[ASUMSI]` As-Is diturunkan dari pola umum RS Tipe C & D (pencatatan manual/tersebar), bukan BPMN khusus.
- `[ASUMSI]` Pola 'validasi → kirim → simpan ID response' diadaptasi dari integrasi BPJS/SATUSEHAT proses Admisi (penerbitan SEP).
- `[ASUMSI]` operationalStatus bed dikelola sebagai atribut Location; reservasi/booking bed di modul Rawat Inap (Out Scope).
- `[ASUMSI]` Internet tidak stabil → data disimpan lokal dulu lalu sync asinkron dengan antrian retry (BR-008).
- `[ASUMSI]` Kolom `approval_status`/`approver_role` disiapkan Phase 1 untuk mendukung approval berjenjang Phase 2.

## Pertanyaan Terbuka
- Base URL & environment endpoint SATUSEHAT Location (sandbox vs production) + versi FHIR?
- Apakah Unit perlu pemetaan referensi BPJS (kode poli/ruang VClaim/Aplicares)? Field tambahan apa?
- Hubungan `status_aktif` (boolean) vs `Location.status` — dipertahankan keduanya atau cukup satu?
- Daftar enum resmi `kelas_perawatan` dan `operationalStatus` bed untuk RS Tipe C & D?
- Apakah alamat unit WAJIB dari Master Wilayah (A32) atau boleh sebagian free-text (BR-009)?
- Codeset `type` & `physicalType` disediakan master internal atau ditarik dari terminology SATUSEHAT?
