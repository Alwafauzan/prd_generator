# PRD — Master Data: Role (A18)

> **Catatan penting — Fitur TANPA UI.** Master Data Role **tidak memiliki antarmuka (layar) khusus** pada Phase 1. Role diperlakukan sebagai **reference/seed data** yang dikelola melalui **API + seeding** oleh super-admin/developer, lalu **dikonsumsi** oleh modul lain: **User (A1)** (penautan role ke akun), **Akses Menu (A37)** (matriks permission per role), dan **RBAC (A53)** (penegakan hak akses). Karena itu bagian UI/UX pada template ditandai *tidak berlaku*; spesifikasi difokuskan ke **data model, API, dan business rules**.

---

## 1. Metadata Dokumen
* **Approval**: [PERLU KONFIRMASI: Nama Stakeholder, Jabatan, Tanggal]
* **Related Documents**: PRD Master Data User (A1); PRD Akses Menu (A37); PRD RBAC (A53)
* **Document Version**:
    * 2026-07-01, v1.0 — Draft awal: katalog Role sebagai reference/seed data (tanpa UI), siap arsitektur approval Phase 2.
    * 2026-07-01, v1.1 — Konfirmasi user: struktur role **datar** (BR-010), **soft-delete only** (BR-009), daftar **16 role bawaan** rekomendasi (§8.3.3).
    * 2026-07-01, v1.2 — Konfirmasi user: kebijakan **penonaktifan/hapus role** (izinkan + blokir user tanpa role lain + wajib migrasi oleh admin, BR-004) & model **multi-role** (BR-011). Metrik #4, state machine, US-006, AC Aktif/Nonaktif, §9 disesuaikan.
    * 2026-07-01, v1.3 — Finalisasi daftar role bawaan §8.3.3 menjadi **21 role**: tambah Direksi, Kepala Unit, Kepala Kasir, Kepala Gudang, Kepala Keuangan; rename Petugas Gudang → **Staf Gudang**.

## 2. Overview & Background
* **Overview/Brief Summary**: **Role** adalah entitas master pada cluster **Control Panel** yang mendefinisikan **kumpulan hak akses bernama** (mis. `Super Admin`, `Administrator`, `Dokter`, `Perawat`, `Apoteker`, `Kasir`, `Pendaftaran`). Modul ini menjadi **katalog role (single source of truth)** yang dirujuk saat menautkan role ke akun user (A1) dan saat menyusun matriks permission (A37/A53). Modul **tidak menyimpan** detail permission per menu — itu domain **Akses Menu (A37)**; A18 hanya menyimpan **identitas & metadata role**.
* **Business Process (As-Is vs To-Be)**:
    * **As-Is**: Daftar role sering **hard-coded** di kode aplikasi atau tersebar/duplikat antar modul. Akibatnya penambahan/penyesuaian role menuntut perubahan kode, rawan **inkonsistensi penamaan** (mis. `admin` vs `Administrator`), dan sulit diaudit.
    * **To-Be**: Role dikelola **terpusat** sebagai reference data dengan **kode role (`role_code`) stabil** sebagai kunci referensi lintas-modul. Modul lain menautkan role via `role_code`/`role_id`, bukan string bebas. Perubahan katalog role tidak lagi memerlukan perubahan kode aplikasi. Pengelolaan Phase 1 dilakukan lewat **API + seed** oleh super-admin/developer (tanpa UI).

## 3. Goals & Metrics
| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1  | Konsistensi referensi role antar modul | 100% modul (A1/A37/A53) merujuk role via `role_code`/`role_id`, bukan string bebas |
| 2  | Keunikan identitas role | 0% duplikasi `role_code` dan `role_name` (case-insensitive) |
| 3  | Integritas role sistem | 0% role bawaan sistem (`is_system_role=true`) terhapus / ter-rename / ter-nonaktif |
| 4  | Penanganan migrasi role | 100% user yang **terblokir** akibat role dinonaktifkan/dihapus teridentifikasi di respons API & (wajib) dimigrasikan admin ke role lain; **0 user terkunci tanpa terdeteksi** |
| 5  | Kemandirian konfigurasi | Perubahan katalog role terbaca real-time oleh A1/A37/A53 tanpa perlu deploy ulang kode |

## 4. Scope Definition & Phasing
| Fitur/Modul | Phase 1 (MVP: CRUD via API/Seed) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|----------------------------------|-----------------------------------------|
| Katalog Role | Seed role bawaan sistem; List/Detail role via API; Create/Update role kustom; Aktif/Nonaktif role | Perubahan katalog role melewati **approval berjenjang** (`status_approval`, `role_approver`); **effective dating** (`berlaku_mulai`) |
| Guard integritas & migrasi | Cegah hapus/nonaktif role sistem; deteksi **user terdampak** saat role dinonaktifkan/dihapus (user tanpa role lain → terblokir, wajib migrasi) | Audit trail perubahan role + notifikasi ke approver |

**Out of Scope**:
* **Definisi permission/matriks hak akses per menu** (view/create/update/delete/approve) — domain **Akses Menu (A37)** & **RBAC (A53)**.
* **Penautan role ke akun user** — domain **User (A1)**.
* **Penegakan hak akses saat runtime** (guard endpoint/menu) — domain **RBAC (A53)**.
* **Antarmuka/layar pengelolaan Role** — tidak dibuat pada Phase 1 (fitur tanpa UI); bila kelak diperlukan, menjadi PRD/iterasi tersendiri.
* **Hierarki/level role** (parent-child, pewarisan permission antar role) — struktur role bersifat **datar** (dikonfirmasi); tidak ada inheritance antar role.

## 5. Related Features
| Kode | Modul | Relasi |
|------|-------|--------|
| A1 | Master Data User | **Konsumen** — menautkan `role` ke akun user (lookup ke katalog A18). Model **multi-role**: satu user dapat memiliki >1 role (dikonfirmasi, BR-011). **Migrasi** user terdampak saat role dinonaktifkan/dihapus dilakukan di A1 (BR-004). |
| A37 | Akses Menu | **Konsumen** — menyusun matriks permission per `role_id` (menu/sub-menu × operasi). |
| A53 | RBAC | **Konsumen** — menegakkan hak akses berbasis role saat runtime. |

## 6. Business Process & User Stories
* **State Machine Table**:

| Status | Deskripsi | Efek Data | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| `AKTIF` | Role dapat ditautkan ke user & dipakai matriks A37/A53 | Tampil di lookup role (A1/A37) | `AKTIF → NONAKTIF` (diizinkan meski masih dipakai; bukan role sistem — BR-003) | Perlu `status_approval=APPROVED` sebelum efektif |
| `NONAKTIF` | Role diarsipkan; tidak muncul di lookup untuk penautan baru | User yang kehilangan role ini & **tanpa role aktif lain → terblokir** (BR-004); admin **wajib migrasi**. User yang masih punya role lain → tidak terdampak. | `NONAKTIF → AKTIF` (reaktivasi) | Reaktivasi melewati approval |
| `DRAFT` *(Phase 2)* | Perubahan role menunggu persetujuan | Belum efektif ke A1/A37/A53 | — | `DRAFT → APPROVED/REJECTED` oleh `role_approver` |

> **Status Behavior**: Tidak ada input status saat create. Status selalu diset **`AKTIF`** oleh sistem. Pengelolaan aktif/nonaktif dilakukan melalui endpoint toggle (BR-005), bukan field editable pada payload create.

* **User Stories Utama**:

| ID | Role | User Story | Prioritas | Fase |
|----|------|-----------|-----------|------|
| US-001 | Super Admin / Sistem | Sebagai sistem, saya ingin **role bawaan di-seed otomatis** saat inisialisasi, agar RBAC dapat langsung berfungsi tanpa konfigurasi manual. | P0 | Phase 1 |
| US-002 | Super Admin | Sebagai super-admin, saya ingin **mengambil daftar role (list/detail) via API**, agar modul User (A1) & Akses Menu (A37) dapat menautkan role. | P0 | Phase 1 |
| US-003 | Super Admin | Sebagai super-admin, saya ingin **membuat role kustom baru** (`role_code`, `role_name`, deskripsi), agar RS dapat menyesuaikan pembagian tugas. | P0 | Phase 1 |
| US-004 | Super Admin | Sebagai super-admin, saya ingin **mengubah nama/deskripsi role kustom**, agar penamaan tetap relevan — tanpa mengubah `role_code`. | P1 | Phase 1 |
| US-005 | Super Admin | Sebagai super-admin, saya ingin **menonaktifkan/mengaktifkan role**, agar role usang tidak lagi dipakai penautan baru — dengan proteksi role sistem. | P1 | Phase 1 |
| US-006 | Super Admin | Sebagai super-admin, saya ingin **melihat daftar user terdampak** saat menonaktifkan/menghapus role (yang akan terblokir), agar saya dapat **memigrasikan** mereka ke role lain sebelum akses mereka terganggu. | P1 | Phase 1 |
| US-007 | Super Admin | Sebagai super-admin, saya ingin **perubahan katalog role melewati persetujuan**, agar tidak ada perubahan hak akses tanpa kendali. | P2 | Phase 2 |

## 7. Functional Requirements
### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Seed Role Bawaan Sistem**
* **User Story**: US-001 — Sebagai sistem, saya ingin role bawaan di-seed otomatis saat inisialisasi.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Saat inisialisasi/seed, sistem membuat set role bawaan default sesuai **Daftar Role Bawaan (§8.3.3)** dengan `status_aktif=AKTIF`. Hanya `SUPER_ADMIN` & `ADMIN` yang `is_system_role=true` (terkunci); role operasional lain di-seed dengan `is_system_role=false` sehingga RS dapat menyesuaikan (rename/nonaktif).
    * **AC 2**: Operasi seed bersifat **idempotent** — dijalankan berulang tidak menghasilkan duplikasi (dedup by `role_code`).
    * **AC 3**: Role dengan `is_system_role=true` tidak dapat dihapus, di-rename, maupun dinonaktifkan (BR-003).

**Fitur: List & Detail Role (API)**
* **User Story**: US-002 — Sebagai super-admin, saya ingin mengambil daftar/detail role via API.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `GET /api/v1/roles` mengembalikan daftar role dengan field `role_id`, `role_code`, `role_name`, `deskripsi`, `is_system_role`, `status_aktif`.
    * **AC 2**: Mendukung filter `status_aktif` dan pencarian by `role_code`/`role_name`; default hanya mengembalikan role `AKTIF` bila parameter status tidak dikirim [ASUMSI].
    * **AC 3**: `GET /api/v1/roles/{id}` mengembalikan detail satu role; `404` bila tidak ditemukan.

**Fitur: Create Role Kustom (API)**
* **User Story**: US-003 — Sebagai super-admin, saya ingin membuat role kustom baru.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `POST /api/v1/roles` menerima `role_code` (opsional; auto-generate bila kosong), `role_name` (wajib), `deskripsi` (opsional).
    * **AC 2**: Sistem menolak simpan bila `role_name` sudah dipakai (unik case-insensitive) atau `role_code` sudah ada — respons `409 Conflict` dengan pesan spesifik (BR-001, BR-002).
    * **AC 3**: Role baru tersimpan dengan `is_system_role=false` dan `status_aktif=AKTIF` (tidak menerima status dari payload — BR-005).
    * **AC 4**: `role_code` yang tersimpan **immutable** (tidak dapat diubah setelah dibuat — BR-006).

**Fitur: Update Role Kustom (API)**
* **User Story**: US-004 — Sebagai super-admin, saya ingin mengubah nama/deskripsi role kustom.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `PATCH /api/v1/roles/{id}` hanya mengizinkan perubahan `role_name` & `deskripsi`; `role_code` diabaikan/ditolak bila dikirim (BR-006).
    * **AC 2**: Perubahan `role_name` tetap tunduk keunikan case-insensitive (BR-002).
    * **AC 3**: Menolak perubahan pada role `is_system_role=true` dengan `403 Forbidden` (BR-003).

**Fitur: Aktif/Nonaktif Role + Penanganan User Terdampak (API)**
* **User Story**: US-005, US-006 — Sebagai super-admin, saya ingin menonaktifkan/mengaktifkan role dan menangani user terdampak.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `PATCH /api/v1/roles/{id}/status` mengubah `status_aktif` antara `AKTIF`/`NONAKTIF`.
    * **AC 2**: Menonaktifkan/menghapus (soft-delete) role non-sistem yang masih dipakai **tetap diizinkan** — tidak ditolak. Respons mengembalikan **daftar user terdampak**, dipisah: (a) **akan terblokir** (role aktifnya tinggal role ini), (b) **tidak terdampak** (masih punya ≥1 role aktif lain) (BR-004).
    * **AC 3**: Menolak menonaktifkan/menghapus role `is_system_role=true` dengan `403 Forbidden` (BR-003).
    * **AC 4**: User yang kehilangan **satu-satunya role aktifnya** akibat aksi ini menjadi **terblokir** — tidak dapat login/mengakses sistem (ditegakkan saat login/RBAC A53) sampai admin memigrasikannya ke role lain via A1 (BR-004, BR-011).
    * **AC 5**: User yang **masih memiliki ≥1 role aktif lain** tidak terblokir dan **tidak** masuk daftar migrasi.
    * **AC 6**: Role `NONAKTIF`/terhapus **tidak muncul** pada lookup penautan role baru (A1/A37), namun role `NONAKTIF` tetap dapat direaktivasi.

* **Validasi (Service/API Layer — tanpa frontend):**

  | Field | Tipe Input | Rules | Error Message (respons API) |
  |-------|------------|-------|-----------------------------|
  | `role_name` | Text | Required, unik case-insensitive, maks 50 | "Nama role wajib diisi" / "Nama role sudah digunakan" |
  | `role_code` | Text | Opsional saat create (auto bila kosong), unik, alfanumerik + underscore, maks 20, uppercase, **immutable** | "Kode role sudah digunakan" / "Kode role tidak dapat diubah" |
  | `deskripsi` | Text | Optional, maks 255 | "Deskripsi maksimal 255 karakter" |

## 8. Data & Technical Specifications
### 8.1 Database Schema Suggestion
* **Table Name**: `master_role`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `role_code`: VARCHAR(20) UNIQUE NOT NULL — kunci referensi stabil lintas-modul (immutable)
    * `role_name`: VARCHAR(50) NOT NULL — unik case-insensitive (disarankan unique index pada `LOWER(role_name)`)
    * `deskripsi`: VARCHAR(255) NULL
    * `is_system_role`: BOOLEAN NOT NULL DEFAULT false — role bawaan sistem (tidak dapat dihapus/rename/nonaktif)
    * `is_active`: BOOLEAN NOT NULL DEFAULT true — merepresentasikan `status_aktif` (`AKTIF`/`NONAKTIF`)
    * `is_deleted`: BOOLEAN NOT NULL DEFAULT false — penanda **soft-delete** (BR-009); hard-delete tidak disediakan
    * `status_approval`: VARCHAR(20) NULL DEFAULT 'APPROVED' — **SIAP Phase 2** (`DRAFT`/`APPROVED`/`REJECTED`)
    * `role_approver`: VARCHAR(20) NULL — **SIAP Phase 2** (role yang berwenang menyetujui perubahan)
    * `berlaku_mulai`: DATE NULL — **SIAP Phase 2** (effective dating)
    * `created_by`, `created_at`, `updated_by`, `updated_at`: audit metadata

### 8.2 API Endpoint Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/roles` | List role (filter `status`, search `role_code`/`role_name`) |
| GET    | `/api/v1/roles/{id}` | Detail satu role |
| POST   | `/api/v1/roles` | Create role kustom (`is_system_role=false`, status auto `AKTIF`) |
| PATCH  | `/api/v1/roles/{id}` | Update `role_name`/`deskripsi` (role_code immutable) |
| PATCH  | `/api/v1/roles/{id}/status` | Toggle Aktif/Nonaktif (guard BR-003/BR-004) |
| DELETE | `/api/v1/roles/{id}` | **Soft-delete** role kustom (set `is_deleted=true`, guard BR-003/BR-004). Hard-delete tidak disediakan. |

### 8.3 Data & Business Rules
#### 8.3.1 Spesifikasi Data — Payload Create/Update (API)
| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `role_code` | Kode Role | text | Tidak (create) | unik, alfanumerik+underscore, maks 20, uppercase | manual/auto | **immutable** setelah dibuat (BR-006); kunci referensi A1/A37/A53 |
| `role_name` | Nama Role | text | Ya | unik case-insensitive, maks 50 | manual | selaras definisi `role_name` di kamus (A53) |
| `deskripsi` | Deskripsi | text | Tidak | maks 255 | manual | |
| `is_system_role` | Role Bawaan Sistem | boolean | Ya | true/false, default false | sistem/seed | true → terkunci (BR-003) |
| `status_aktif` | Status | enum | — | `AKTIF`/`NONAKTIF`, default `AKTIF` | sistem | tidak diterima saat create; via endpoint status (BR-005) |
| `status_approval` | Status Approval | enum | Tidak | `DRAFT`/`APPROVED`/`REJECTED` | sistem | **[Phase 2]** SIAP arsitektur approval |
| `role_approver` | Role Approver | text | Tidak | role valid di A18 | sistem | **[Phase 2]** |
| `berlaku_mulai` | Berlaku Mulai | date | Tidak | ≥ hari ini | manual | **[Phase 2]** effective dating |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)
> **Tidak berlaku** — fitur tanpa UI. Sebagai gantinya, struktur **respons `GET /api/v1/roles`** mengembalikan: `role_id`, `role_code`, `role_name`, `deskripsi`, `is_system_role`, `status_aktif`. Konsumen (A1/A37) merender daftar ini di UI masing-masing.

#### 8.3.3 Daftar Role Bawaan (Seed) — Rekomendasi
> Rekomendasi role default untuk SIMRS RS Tipe C & D. `SUPER_ADMIN` & `ADMIN` bersifat **role sistem** (terkunci, BR-003); sisanya di-seed sebagai default namun `is_system_role=false` sehingga RS dapat menyesuaikan. **Matriks permission per role ditetapkan di Akses Menu (A37)**, bukan di modul ini.

| `role_code` | `role_name` | `is_system_role` | Cakupan fungsional (ringkas) |
|-------------|-------------|:----------------:|------------------------------|
| `SUPER_ADMIN` | Super Admin | Ya | Akses penuh + konfigurasi RBAC/role/menu (A37/A53) |
| `ADMIN` | Administrator | Ya | Kelola master data & akun user RS (A1) |
| `DIREKSI` | Direksi | Tidak | Dashboard eksekutif & laporan strategis (read-only); approver tertinggi [Phase 2] |
| `MANAJEMEN` | Manajemen | Tidak | Dashboard & laporan (umumnya read-only) |
| `KEPALA_UNIT` | Kepala Unit | Tidak | Supervisi & approval lingkup unit/instalasi [Phase 2] |
| `DOKTER` | Dokter | Tidak | EMR, diagnosa, order lab/radiologi/resep, tindakan |
| `PERAWAT` | Perawat | Tidak | Asesmen & asuhan keperawatan, TTV, tindakan |
| `BIDAN` | Bidan | Tidak | Pelayanan kebidanan (KIA/VK/persalinan) |
| `APOTEKER` | Apoteker | Tidak | Telaah resep, dispensing, pengelolaan farmasi |
| `ASISTEN_APOTEKER` | Asisten Apoteker (TTK) | Tidak | Bantu dispensing & stok farmasi |
| `ANALIS_LAB` | Analis Laboratorium | Tidak | Input & validasi hasil lab (LIS) |
| `RADIOGRAFER` | Radiografer | Tidak | Pemeriksaan & hasil radiologi (RIS/PACS) |
| `AHLI_GIZI` | Ahli Gizi | Tidak | Asuhan gizi & permintaan makanan pasien |
| `PENDAFTARAN` | Petugas Pendaftaran | Tidak | Registrasi/admisi pasien, penjaminan/SEP |
| `REKAM_MEDIS` | Petugas Rekam Medis | Tidak | Pengelolaan berkas RM, koding diagnosa |
| `KASIR` | Kasir | Tidak | Billing & penerimaan pembayaran |
| `KEPALA_KASIR` | Kepala Kasir | Tidak | Supervisi transaksi kasir; approval refund/void/koreksi [Phase 2] |
| `GUDANG` | Staf Gudang | Tidak | Inventory: stok, distribusi, pengadaan barang |
| `KEPALA_GUDANG` | Kepala Gudang | Tidak | Supervisi stok; approval permintaan/distribusi/pengadaan [Phase 2] |
| `KEUANGAN` | Staf Keuangan | Tidak | Jurnal, rekap pendapatan, keuangan |
| `KEPALA_KEUANGAN` | Kepala Keuangan | Tidak | Supervisi keuangan; approval jurnal/pembayaran [Phase 2] |

> Daftar di atas adalah **daftar bawaan final** (21 role) hasil konfirmasi RS. RS tetap dapat menambah role kustom atau menonaktifkan role non-sistem sesuai kebutuhan. Set minimum agar sistem berfungsi: `SUPER_ADMIN` + `ADMIN`. Role `KEPALA_*` & `DIREKSI` berfungsi penuh sebagai **approver** saat approval berjenjang aktif di Phase 2.

* **Business Rules**:
    * **BR-001**: `role_code` **unik** di seluruh sistem.
    * **BR-002**: `role_name` **unik case-insensitive** (mis. `Admin` ≡ `admin`).
    * **BR-003**: Role dengan `is_system_role=true` **tidak dapat** dihapus, di-rename, maupun dinonaktifkan.
    * **BR-004**: Role non-sistem **boleh** dinonaktifkan/di-soft-delete meski masih dipakai user. Dampaknya: **(a)** user yang role aktifnya **tinggal role ini** (tidak punya role lain) menjadi **terblokir** — tidak dapat login/akses; **(b)** user yang masih memiliki **≥1 role aktif lain** tidak terdampak. Saat aksi, sistem mengembalikan **daftar user terdampak** dan admin **wajib memigrasikan** user terblokir ke role pengganti (via A1). Aksi tetap tunduk BR-003 (role sistem tidak boleh dinonaktifkan/dihapus).
    * **BR-005**: Saat create, `status_aktif` selalu diset **`AKTIF`** oleh sistem; tidak diterima dari payload. Perubahan status hanya via endpoint toggle.
    * **BR-006**: `role_code` bersifat **immutable** setelah dibuat (menjaga stabilitas referensi lintas-modul).
    * **BR-007**: Pengelolaan katalog role (create/update/status/delete) **hanya** boleh oleh role `SUPER_ADMIN`/administrator, ditegakkan oleh RBAC (A53).
    * **BR-008** *(Phase 2)*: Setiap perubahan katalog role menghasilkan record `status_approval=DRAFT` dan baru efektif setelah disetujui `role_approver`.
    * **BR-009**: Penghapusan role bersifat **soft-delete** (`is_deleted=true`/arsip), **bukan hard-delete** — data & jejak referensi tetap tersimpan untuk audit. Soft-delete tetap tunduk BR-003 (role sistem terkunci) & memicu penanganan user terdampak BR-004.
    * **BR-010**: Struktur role bersifat **datar** — tidak ada hierarki/pewarisan permission antar role; setiap role berdiri sendiri (permission-nya penuh ditetapkan di A37).
    * **BR-011**: Model **multi-role** — satu user dapat memiliki >1 role. Setiap user harus memiliki **≥1 role aktif** untuk mengakses sistem; user tanpa role aktif → **akses diblokir** (ditegakkan saat login/RBAC A53). Ini menjadi dasar kebijakan migrasi pada BR-004.

## 9. Workflow / BPMN Interpretation
* **Tidak ada BPMN khusus** untuk A18 (knowledge mode; role adalah reference data). Alur logis Phase 1 (via API/seed, tanpa UI):
    1. **Inisialisasi** → sistem menjalankan seed role bawaan (idempotent, `is_system_role=true`, `AKTIF`).
    2. **Konsumsi** → A1 (User) & A37 (Akses Menu) memanggil `GET /api/v1/roles` untuk menautkan/menyusun matriks.
    3. **Tambah role kustom** → `POST /roles` → validasi keunikan (`role_code`/`role_name`) → simpan `AKTIF`, `is_system_role=false`.
    4. **Ubah role** → `PATCH /roles/{id}` → gateway `is_system_role`? bila true → tolak (BR-003); bila false → update `role_name`/`deskripsi` (role_code dikunci).
    5. **Nonaktifkan/soft-delete role** → gateway role sistem? (tolak, BR-003) → set `NONAKTIF`/`is_deleted` → sistem hitung **user terdampak**: user tanpa role aktif lain → **terblokir** (BR-004/BR-011); user dengan role lain → dilewati → kembalikan **daftar user terblokir** untuk **migrasi oleh admin** (via A1).
    6. *(Phase 2)* Setiap perubahan → `DRAFT` → notifikasi `role_approver` → approve/reject → efektif sesuai `berlaku_mulai`.

---
### Keputusan Terkonfirmasi
* **Struktur role datar** — tanpa hierarki/pewarisan (BR-010).
* **Soft-delete only** — hard-delete tidak disediakan (BR-009).
* **Daftar role bawaan (final)** — §8.3.3, **21 role** (`SUPER_ADMIN` & `ADMIN` = role sistem; ditambah pimpinan: Direksi, Kepala Unit, Kepala Kasir, Kepala Gudang, Kepala Keuangan; Petugas Gudang → **Staf Gudang**).
* **Multi-role** — satu user dapat memiliki >1 role (BR-011).
* **Penonaktifan/hapus role** — diizinkan; user yang kehilangan satu-satunya role aktifnya → **terblokir** & **wajib dimigrasikan** admin ke role lain; user yang masih punya role lain tidak terdampak (BR-004).

### Open Questions / Perlu Konfirmasi
1. Nama & jabatan **stakeholder approval** dokumen (§1 Metadata).
