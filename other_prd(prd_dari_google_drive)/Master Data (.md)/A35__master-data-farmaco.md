# PRD — A35 Master Data: Farmaco (Golongan Farmakologi) — Tanpa UI

> Disusun mengikuti **template.md**. Kode Fitur: **A35** · Cluster: Control Panel · Module: Master Data · Menu: **Farmaco**. Target: SIMRS RS Tipe C & D. Dokumen ini **backend/data-oriented (tanpa spesifikasi UI)** — tidak memuat wording validasi frontend maupun layout layar. Bagian turunan asumsi ditandai `[ASUMSI]`; hal belum pasti ditandai `[PERLU KONFIRMASI]`.

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — `[PERLU KONFIRMASI]`
* **Related Documents**:
    * PRD Master Data — Barang Farmasi (A4) — konsumen klasifikasi Farmaco
    * Formularium Nasional / Formularium RS `[PERLU KONFIRMASI]`
    * Referensi klasifikasi WHO ATC (Anatomical Therapeutic Chemical) `[ASUMSI]`
* **Document Version**:
    | Tanggal | Versi | Deskripsi Perubahan |
    |---------|-------|---------------------|
    | 2026-07-02 | 1.0 — Draft awal | Penyusunan awal PRD A35 Farmaco mengikuti template (tanpa UI). |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  Fitur **A35 — Farmaco** adalah master data untuk mengelola **golongan/klasifikasi farmakologi** obat (mis. Analgesik, Antibiotik-Sefalosporin, Antihipertensi-ACE Inhibitor). Klasifikasi ini menjadi **atribut referensi** bagi master Barang Farmasi (A4) dan modul Farmasi/Formularium, sehingga setiap item obat dapat dikelompokkan secara konsisten berdasarkan golongan farmakologi/terapi. Master ini mendukung **struktur hierarki** (golongan → sub-golongan) dan opsional dipetakan ke **kode ATC** untuk pelaporan & interoperabilitas. Sebagai master data Control Panel, fokus Phase 1 adalah **CRUD** dengan pengelolaan status aktif/nonaktif.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini) `[ASUMSI]`:
        * Golongan farmakologi dicatat manual/tersebar (spreadsheet atau bebas di tiap item obat) → penamaan golongan tidak seragam (mis. "Antibiotik" vs "Anti Biotik").
        * Tidak ada hierarki golongan–sub-golongan yang terstandar.
        * Sulit membuat rekap/pelaporan pemakaian obat per golongan farmakologi karena tidak ada referensi tunggal.
        * Tidak ada pemetaan ke kode standar (ATC) untuk pelaporan eksternal.
    * **To-Be** (solusi digital):
        1. Admin Master Data membuka menu **Master Data → Farmaco**, menambah golongan farmakologi baru dengan nama, kode, deskripsi, golongan induk (opsional), dan kode ATC (opsional).
        2. Sistem memvalidasi **keunikan kode** dan **anti-siklus** hierarki, lalu menyimpan.
        3. Master Barang Farmasi (A4) dan modul lain memilih golongan farmakologi dari referensi tunggal ini.
        4. Admin dapat menonaktifkan golongan yang tidak dipakai (soft delete) tanpa menghapus data historis.

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Konsistensi klasifikasi | 100% item obat baru (A4) memilih golongan farmakologi dari master A35 (bukan free-text) |
| 2 | Keterisian referensi | 100% golongan farmakologi memiliki kode unik & nama terisi |
| 3 | Kecepatan pencarian | Waktu pencarian/filter golongan < 3 detik |
| 4 | Integritas data | 0 duplikat kode; 0 siklus hierarki golongan |
| 5 `[**]` | Kesiapan pelaporan standar (Phase 2) | ≥ 90% golongan dipetakan ke kode ATC untuk pelaporan `[PERLU KONFIRMASI]` |

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| Golongan Farmaco | Create, Read (list+detail), Update, aktif/nonaktif | Approval berjenjang perubahan master |
| Hierarki Golongan | Set golongan induk (`parent_id`) + validasi anti-siklus | Reorganisasi massal / pemindahan sub-pohon |
| Pemetaan ATC | Field `atc_code` opsional | Validasi terhadap kamus ATC + sinkronisasi referensi eksternal `[PERLU KONFIRMASI]` |
| Impor/Ekspor | — | Impor/Ekspor CSV/XLSX (mode tambah / tambah+update) `[**]` |
| Audit Log | Pencatatan create/update/status-change | Riwayat + rollback versi `[ASUMSI]` |

**Out of Scope**:
| No | Scope | Ditangani oleh |
|----|-------|----------------|
| 1 | Data item obat / stok / satuan | Master Barang Farmasi (A4) & Inventori (A42) |
| 2 | Aturan interaksi obat / kontraindikasi klinis | Modul Clinical Decision Support `[ASUMSI]` |
| 3 | Formularium & status fornas per item | Modul Formularium |
| 4 | Harga / tarif obat | Master Tarif / modul Keuangan |

> Catatan phasing: Phase 1 = CRUD murni **tanpa approval berjenjang**. Skema data menyertakan kolom `approval_status` & `approver_role` (nullable) sejak awal agar siap Phase 2 tanpa migrasi struktur.

---

## 5. Related Features

* **A4 — Master Barang Farmasi**: setiap item obat mereferensikan `farmaco_id` sebagai golongan farmakologi (relasi many-to-one). A35 = sumber lookup tunggal.
* **Formularium** (`[PERLU KONFIRMASI]` kode fitur): pengelompokan item formularium per golongan farmakologi untuk rekap & seleksi.
* **Modul Pelaporan Farmasi**: agregasi pemakaian/pengeluaran obat per golongan farmakologi.

---

## 6. Business Process & User Stories

### State Machine Table — status golongan Farmaco

| Status | Deskripsi | Efek pada Referensi (item A4) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-------------------------------|--------------------|--------------------|
| `active` | Golongan aktif & dapat dipilih | Muncul di dropdown lookup item obat | → inactive | → inactive (via approval) |
| `inactive` | Golongan nonaktif (soft delete) | Tidak dapat dipilih untuk item baru; item historis tetap tertaut | → active | → active (via approval) |

> **Aturan status:** status **tidak** diinput saat create — sistem set `active` (AKTIF) otomatis. Aktif/nonaktif dikelola di level dashboard (toggle). Pada Phase 2, transisi status melewati alur approval (`approval_status`).

### User Stories Utama

| ID | User Story | Prioritas | Fase |
|----|-----------|-----------|------|
| US-001 | Sebagai **Admin Master Data**, saya ingin menambah golongan farmakologi baru (kode, nama, deskripsi), agar klasifikasi obat terstandar. | P0 | 1 |
| US-002 | Sebagai **Admin Master Data**, saya ingin mengubah data golongan farmakologi, agar informasi selalu mutakhir. | P0 | 1 |
| US-003 | Sebagai **Admin Master Data**, saya ingin menetapkan golongan induk (hierarki), agar struktur golongan→sub-golongan jelas. | P1 | 1 |
| US-004 | Sebagai **Admin Master Data**, saya ingin menonaktifkan golongan yang tidak dipakai, agar tidak dipilih untuk item baru tetapi data historis tetap ada. | P0 | 1 |
| US-005 | Sebagai **Petugas Farmasi**, saya ingin memilih golongan farmakologi dari daftar referensi tunggal saat mendata item obat (A4), agar klasifikasi konsisten. | P1 | 1 |
| US-006 | Sebagai **Admin Master Data**, saya ingin memetakan golongan ke kode ATC, agar siap untuk pelaporan standar. | P2 | 1 (field) / 2 (validasi) |
| US-007 `[**]` | Sebagai **Supervisor Farmasi**, saya ingin menyetujui/menolak perubahan master golongan, agar perubahan terkontrol. | P2 | 2 |
| US-008 `[**]` | Sebagai **Admin Master Data**, saya ingin impor/ekspor golongan via CSV/XLSX, agar setup massal cepat. | P2 | 2 |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

> Catatan: dokumen ini **tanpa UI** — bagian *Wording Validasi (Frontend)* pada template sengaja tidak disertakan. Aturan validasi ditulis sebagai **rule level data/API** (lihat §8.3).

---

**Fitur: Tambah Golongan Farmaco**
* **User Story**: Sebagai Admin Master Data, saya ingin menambah golongan farmakologi baru, agar klasifikasi obat terstandar.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menerima create dengan field wajib `farmaco_code` dan `name` (lihat §8.3.1).
    * **AC 2**: Sistem menolak create bila `farmaco_code` sudah ada (unik global, case-insensitive) dengan error `409 Conflict`.
    * **AC 3**: Bila `parent_id` diisi, sistem memvalidasi parent ada & `active`, dan menolak bila membentuk siklus (BR-003).
    * **AC 4**: Status **tidak** dikirim dari klien; sistem menyet `status=active` otomatis (BR-005).
    * **AC 5**: Create sukses mengembalikan `201 Created` beserta `id` dan mencatat audit log aksi `create`.

---

**Fitur: Ubah Golongan Farmaco**
* **User Story**: Sebagai Admin Master Data, saya ingin mengubah data golongan farmakologi.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem memvalidasi keunikan `farmaco_code` (mengecualikan record sendiri) dan anti-siklus `parent_id`.
    * **AC 2**: Field `status` tidak dapat diubah melalui endpoint update umum; perubahan status memakai endpoint khusus (§8.2).
    * **AC 3**: Update sukses mengembalikan `200 OK` dan mencatat audit log aksi `update` beserta diff perubahan.

---

**Fitur: List & Detail Golongan Farmaco**
* **User Story**: Sebagai Petugas Farmasi/Admin, saya ingin mencari & melihat golongan farmakologi.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Endpoint list mendukung pencarian by `code`/`name`, filter `status` & `parent_id`, serta pagination; respons < 3 detik (BR/NFR).
    * **AC 2**: Endpoint list dapat mengembalikan bentuk **flat** maupun **tree** (query `view=tree`) untuk kebutuhan hierarki.
    * **AC 3**: Endpoint detail mengembalikan seluruh atribut + daftar sub-golongan langsung (children).

---

**Fitur: Aktif/Nonaktif Golongan (Soft Delete)**
* **User Story**: Sebagai Admin Master Data, saya ingin menonaktifkan golongan yang tidak dipakai.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Endpoint status mengubah `status` antara `active`/`inactive` (soft delete) — data tidak dihapus fisik (BR-004).
    * **AC 2**: Golongan `inactive` tidak muncul sebagai pilihan lookup untuk item obat baru (A4), namun item historis yang telah tertaut tetap valid (BR-002).
    * **AC 3**: Sistem menolak menonaktifkan golongan yang masih memiliki sub-golongan `active` — harus dinonaktifkan/pindahkan dulu (BR-006). `[ASUMSI]`
    * **AC 4**: Perubahan status tercatat di audit log aksi `status-change`.

---

**Fitur: Approval Perubahan Master `[**]`**
* **User Story**: Sebagai Supervisor Farmasi, saya ingin menyetujui/menolak perubahan master golongan.
* **Prioritas**: P2 · **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Perubahan (create/update/status) masuk status `approval_status=pending` sebelum berlaku efektif.
    * **AC 2**: Approver dengan `approver_role` sesuai dapat `approve`/`reject`; hanya perubahan `approved` yang berlaku.
    * **AC 3**: Seluruh keputusan approval tercatat di audit log.

---

**Fitur: Impor & Ekspor Massal `[**]`**
* **User Story**: Sebagai Admin Master Data, saya ingin impor/ekspor golongan via CSV/XLSX.
* **Prioritas**: P2 · **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Unduh template CSV/XLSX; unggah dengan mode `tambah` / `tambah+update`.
    * **AC 2**: Validasi per baris (keunikan kode, parent valid, anti-siklus); baris invalid dilaporkan tanpa membatalkan baris valid.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `master_farmaco`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `farmaco_code`: VARCHAR(30) — **unik** (case-insensitive), NOT NULL
    * `name`: VARCHAR(150) NOT NULL — nama golongan farmakologi
    * `description`: VARCHAR(500) NULL
    * `parent_id`: UUID NULL (FK → `master_farmaco.id`, self-ref; anti-siklus, BR-003)
    * `atc_code`: VARCHAR(10) NULL — kode WHO ATC (opsional; validasi kamus di Phase 2)
    * `level`: SMALLINT NULL — kedalaman hierarki (turunan, di-maintain sistem) `[ASUMSI]`
    * `status`: ENUM('active','inactive') DEFAULT 'active' NOT NULL
    * `is_active`: BOOLEAN DEFAULT true — turunan `status='active'` (kompatibilitas lintas-master)
    * `approval_status`: ENUM('none','pending','approved','rejected') DEFAULT 'none' — *disiapkan untuk Phase 2*
    * `approver_role`: VARCHAR(50) NULL — *disiapkan untuk Phase 2*
    * `created_at`, `updated_at`: TIMESTAMP
    * `created_by`, `updated_by`: UUID/VARCHAR

* **Table Name**: `audit_log_farmaco`
* **Key Columns**: `id` UUID PK · `farmaco_id` UUID FK · `farmaco_code` VARCHAR · `action` ENUM('create','update','status_change','approve','reject') · `user_id` · `user_name` · `diff` JSONB · `created_at` TIMESTAMP.

*Index & Constraint:* `UNIQUE(lower(farmaco_code))`; index pada `name`, `status`, `parent_id`; FK `parent_id` ON DELETE RESTRICT; constraint aplikatif untuk mencegah siklus (cek pada service layer / recursive CTE).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/farmaco` | List golongan (query: `search`, `status`, `parent_id`, `view=flat\|tree`, pagination) |
| GET | `/api/v1/farmaco/{id}` | Detail golongan + children langsung |
| POST | `/api/v1/farmaco` | Create golongan → validasi unik + anti-siklus → simpan (status=active) |
| PUT | `/api/v1/farmaco/{id}` | Update atribut golongan (tanpa status) |
| PATCH | `/api/v1/farmaco/{id}/status` | Toggle Active/Inactive (soft delete) |
| GET | `/api/v1/farmaco/{id}/audit-logs` | Riwayat aktivitas golongan |
| PATCH | `/api/v1/farmaco/{id}/approval` | Approve/Reject perubahan `[**] Phase 2` |
| POST | `/api/v1/farmaco/import` | Impor massal CSV/XLSX `[**] Phase 2` |
| GET | `/api/v1/farmaco/export` | Ekspor CSV/XLSX `[**] Phase 2` |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Field (Data Model)

> Disajikan sebagai **spesifikasi data level backend** (bukan layar). Tanpa UI: tidak ada wording error/helper text frontend.

| Field | Tipe | Wajib | Validasi (rule data/API) | Sumber | Catatan |
|-------|------|-------|--------------------------|--------|---------|
| farmaco_code | string(30) | Ya | unik case-insensitive; alfanumerik + `-`/`.`; trim | manual / auto-generate | key bisnis; BR-001 |
| name | string(150) | Ya | maks 150 char; tidak kosong setelah trim | manual | nama golongan farmakologi |
| description | string(500) | Tidak | maks 500 char | manual | keterangan/deskripsi golongan |
| parent_id | uuid | Tidak | golongan lain valid & `active`; tidak boleh diri sendiri/siklus | lookup A35 | hierarki; BR-003 |
| atc_code | string(10) | Tidak | format ATC (1 huruf + 2 digit + …) `[ASUMSI]`; validasi kamus di Phase 2 | manual / kamus ATC | pelaporan standar |
| status | enum | Sistem | active/inactive; **tidak** dikirim saat create (default active) | sistem | BR-005 |
| approval_status | enum | Sistem | none/pending/approved/rejected | sistem | Phase 2 |

#### 8.3.2 (Tampilan Daftar / List View) — *Dihilangkan (tanpa UI)*

> Sesuai permintaan **tanpa UI**, spesifikasi kolom & layout List View tidak disertakan. Kebutuhan data list dipenuhi oleh kontrak endpoint `GET /api/v1/farmaco` (§8.2): field yang dikembalikan minimal `id`, `farmaco_code`, `name`, `parent_id`, `status`, `atc_code`.

* **Business Rules**:

| ID | Business Rule | Prioritas | Fase |
|----|---------------|-----------|------|
| BR-001 | `farmaco_code` wajib **unik** (case-insensitive) di seluruh master; duplikat ditolak. | P0 | 1 |
| BR-002 | Golongan `inactive` tidak dapat dipilih untuk item obat baru (A4), tetapi tautan pada item historis tetap valid. | P0 | 1 |
| BR-003 | `parent_id` tidak boleh menunjuk diri sendiri atau membentuk **siklus** dalam hierarki golongan. | P0 | 1 |
| BR-004 | Golongan **tidak dihapus permanen** bila sudah direferensikan item obat; gunakan soft delete (`status=inactive`). | P0 | 1 |
| BR-005 | Status tidak diinput saat create; sistem set `active`. Perubahan status hanya via endpoint status. | P1 | 1 |
| BR-006 | Golongan tidak boleh dinonaktifkan bila masih punya sub-golongan `active`. `[ASUMSI]` | P1 | 1 |
| BR-007 `[**]` | Perubahan master melewati approval (`approval_status`) sebelum efektif. | P2 | 2 |
| BR-008 `[**]` | `atc_code` divalidasi terhadap kamus ATC resmi bila diisi. `[PERLU KONFIRMASI]` | P2 | 2 |

**Catatan Non-Functional (ringkas):** performa list/search < 3 detik (index pada `farmaco_code`, `name`, `status`); RBAC hanya role Admin Master Data yang boleh menulis; seluruh perubahan tercatat di audit log (auditability).

---

## 9. Workflow / BPMN Interpretation

> Modul A35 **tidak memiliki BPMN khusus** (master data Control Panel). Alur diturunkan dari pola CRUD master data standar `[ASUMSI]`.

**Flow utama Phase 1 (To-Be, CRUD lokal):**
```
[Admin Master Data]
   → Akses Menu Master Data - Farmaco (A35)
   → Pilih Tambah / Edit Golongan
   → Input kode, nama, deskripsi, (opsional) golongan induk & kode ATC
[Sistem]
   → Validasi: kode unik (BR-001) & anti-siklus parent (BR-003)
   → (Valid?) ── Tidak → Kembalikan error (409/422)
              └─ Ya  → Simpan ke DB master_farmaco (status=active), catat audit log
   → Golongan tersedia sebagai lookup di Master Barang Farmasi (A4) & Formularium
[Nonaktif]
   → Admin set status=inactive (soft delete) bila golongan tak dipakai
   → Item historis tetap tertaut; item baru tak bisa memilih golongan inactive (BR-002)
```

**Lanjutan Phase 2 (approval & impor):**
```
[Admin] ajukan perubahan → approval_status=pending
[Supervisor] approve/reject → hanya 'approved' yang berlaku efektif
[Impor massal] unduh template → isi → upload → validasi per baris → simpan
```

---

## Asumsi
- `[ASUMSI]` "Farmaco" (A35) diinterpretasikan sebagai **Master Golongan Farmakologi** (klasifikasi obat), konsisten dengan konteks Master Data Farmasi SIMRS. `[PERLU KONFIRMASI]` cakupan pasti (farmakologi vs farmakoterapi vs bentuk sediaan).
- `[ASUMSI]` Hierarki golongan→sub-golongan didukung via `parent_id`; kedalaman maksimum tidak dibatasi eksplisit.
- `[ASUMSI]` Aturan larangan nonaktif bila punya child aktif (BR-006) mengikuti pola integritas master hierarki.
- `[ASUMSI]` Kolom `approval_status`/`approver_role` disiapkan Phase 1 untuk mendukung approval Phase 2.

## Pertanyaan Terbuka
- Definisi resmi ruang lingkup "Farmaco" A35: golongan farmakologi, kelas terapi, atau keduanya? Apakah termasuk pemetaan ke Formularium Nasional?
- Apakah pemetaan `atc_code` wajib atau opsional, dan apakah tersedia kamus ATC internal untuk validasi (Phase 2)?
- Apakah hierarki golongan multi-level diperlukan, atau cukup satu tingkat (golongan saja)?
- Siapa role approver untuk Phase 2 (Supervisor Farmasi / Apoteker Penanggung Jawab)?
- Apakah relasi ke Barang Farmasi (A4) many-to-one (satu item satu golongan) atau many-to-many (satu item beberapa golongan)?
