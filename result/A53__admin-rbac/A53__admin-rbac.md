# Product Requirement Document (PRD)
# A53 — Admin: Dynamic Permission-Based RBAC

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — [PERLU KONFIRMASI]
* **Related Documents**:
  * Design Figma — Admin RBAC / Manajemen Akses
  * A1 — Master Data User · A2 — Master Data Staff · A18 — Role · A37 — Akses Menu
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-06 | 2.0 | Rework fokus: RBAC dinamis berbasis **permission code** (bukan role hardcoded); skema relasional, alur admin end-to-end, logika eksekusi backend/frontend |

---

## 2. Overview & Background

* **Overview**: Modul **Dynamic Permission-Based RBAC** memberi Admin RS kendali penuh atas hak akses (Menu, Button, Form) **tanpa hardcode role di kode program**. Akses dibentuk dari **Kode Izin (Permission Code)** yang dikelompokkan ke dalam **Role**, lalu Role ditautkan ke **User**. Perubahan akses = konfigurasi data, **bukan** deploy ulang aplikasi.

* **Definisi Kunci** (wajib dipegang konsisten di seluruh dokumen):
    * **Role** = bucket peran **konkret & granular** yang dibuat Admin, mis. `perawat1`, `perawat2`, `keuangan1`, `keuangan2`. Bukan kategori abstrak — satu Role = satu paket akses yang siap ditautkan ke banyak user sejenis.
    * **Permission (Kode Izin)** = pasangan **Komponen UI + Method backend** yang dijaga. Contoh:
        * Button **Add** → `permission_code = ADD_BTN`, `method = add`
        * **Form Input** (tarik data ke form) → `permission_code = FORM_INPUT`, `method = getRow`
        * Menu Pasien → `permission_code = A001`, `method = list/openMenu`
      Artinya setiap kode izin memetakan **elemen UI yang dilindungi** sekaligus **fungsi backend (method)** yang boleh dieksekusi.
    * **Seluruh izin WAJIB melalui Role.** Tidak ada izin yang ditempel langsung ke `user_id`. Untuk memberi akses khusus ke seorang individu, Admin membuat/menautkan Role yang sesuai (mis. `perawat1_khusus`). *(Direct Permission Override ditiadakan pada revisi ini.)*

* **Business Process (As-Is vs To-Be)**:
    * **As-Is**: Role di-hardcode (`if role == 'admin'`). Menambah/mengubah akses butuh developer + deploy. Tidak ada izin granular per tombol; audit lemah.
    * **To-Be**: Admin mendaftarkan Kode Izin → menyusun Role via checklist → menautkan User ke satu/lebih Role. Backend menghimpun array izin **real-time** per request. Frontend hanya kosmetik. Zero developer intervention untuk perubahan akses.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Kemandirian Admin (tanpa IT Vendor) | 100% perubahan hak akses dilakukan Admin tanpa deploy/kode |
| 2 | Granularitas | Izin dapat diberikan hingga level **tombol** (bukan hanya menu) |
| 3 | Dinamis / real-time | Perubahan izin berlaku ≤ 1 aksi berikutnya user tanpa restart sistem |
| 4 | Keamanan backend | 100% request tervalidasi izin di backend; manipulasi frontend tidak menembus |
| 5 | Auditability | 100% perubahan izin/role/asosiasi tercatat (siapa, kapan, apa) |

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD & Enforcement) | Phase 2 (Advanced) |
|-------------|-----------------------------------|--------------------|
| Master Kode Izin (Menu/Button) | CRUD permission code + hierarki menu | Auto-discovery kode dari route/registry [ASUMSI] |
| Role | CRUD + checklist assign permission | Clone/template role, versioning |
| Asosiasi User ↔ Role | Tambah/hapus user ke banyak role | Bulk assign per unit/jabatan |
| Akses khusus individu | Via Role khusus (bukan override langsung) | Role berbatas waktu (temporary access) |
| Enforcement Backend (middleware) | Intersepsi request + Forbidden | Rate-limit & anomaly log |
| Kontrol UI Frontend | Hide menu + disable button via array izin | — |
| Perubahan Dinamis (invalidasi sesi) | Version bump + refetch izin | Force-logout selektif / websocket push |
| Approval perubahan akses | — | Approval berjenjang (kolom `approval_status`/`approver_role` disiapkan sejak Phase 1) |

**Out of Scope**:
- Autentikasi/identity provider (login, password, SSO) — milik modul Auth/A1.
- Master data User & Staff (A1/A2) — direferensikan, tidak didefinisikan ulang.
- Approval berjenjang perubahan akses (Phase 2).

---

## 5. Related Features

| Code | Module | Relasi dengan A53 |
|------|--------|-------------------|
| A1 | Master Data User | Sumber `user_id` yang ditautkan ke Role |
| A2 | Master Data Staff | Konteks jabatan/unit pegawai (dasar pengelompokan Role) |
| A18 | Role | Konsep role di-*supersede* menjadi **Role dinamis** di modul ini |
| A37 | Akses Menu | Daftar menu = sumber kandidat **Kode Izin** tipe MENU |

---

## 6. Business Process & User Stories

### State Machine — Status Entitas RBAC

| Status | Deskripsi | Efek pada Akses | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------------|--------------------|--------------------|
| `AKTIF` | Kode Izin / Role aktif | Diperhitungkan saat resolve izin user | → NONAKTIF | → NONAKTIF (via approval) |
| `NONAKTIF` | Dinonaktifkan (soft delete) | **Diabaikan** saat resolve; user kehilangan izin turunannya | → AKTIF | → AKTIF (via approval) |

> **Aturan status**: status tidak diinput bebas saat create (diset `AKTIF` oleh sistem). Non-aktivasi via toggle Dashboard. Izin efektif user = **gabungan (union) izin dari semua Role aktif** yang ditautkan; tidak ada jalur izin di luar role (BR-A53-05).

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A53-01 | Admin | Mendaftarkan Kode Izin baru (Menu/Button) | Sistem punya katalog izin granular |
| US-A53-02 | Admin | Membuat Role & mencentang Kode Izin | Menyusun paket akses per peran (mis. `perawat1`, `keuangan1`) |
| US-A53-03 | Admin | Menautkan User ke satu/lebih Role | User mewarisi izin dari role |
| US-A53-04 | Admin | Menautkan user ke Role khusus untuk kasus pengecualian akses | Memberi akses berbeda tanpa menempel izin langsung ke user |
| US-A53-05 | Admin | Menukar hak akses user di tengah jam kerja | Perubahan berlaku real-time tanpa user re-login |
| US-A53-06 | System | Menghimpun array izin dari `user_id` tiap request | Enforcement backend akurat & dinamis |
| US-A53-07 | Auditor | Melihat log perubahan izin | Memenuhi audit keamanan |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Master Kode Izin (Permission Code)**
* **User Story**: Sebagai Admin, saya ingin mendaftarkan Kode Izin (Menu/Button), agar akses dapat diberikan secara granular.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memuat: `permission_code` (unik), `permission_name`, `permission_type` (MENU/BUTTON/FORM/TAB/API), **`method`** (aksi backend: `add`/`getRow`/`update`/`delete`/…), `parent_menu` (opsional), `module`.
    * **AC 2**: `permission_code` unik & immutable setelah dipakai (BR-A53-01); duplikat ditolak.
    * **AC 3**: Kode tipe BUTTON/FORM/TAB/API wajib punya `parent_menu` (agar tombol/form menempel ke menu induk) — [PERLU KONFIRMASI apakah wajib].
    * **AC 4**: Menonaktifkan kode izin langsung mengeluarkannya dari resolve izin seluruh user (BR-A53-07).

* **Validasi (Frontend)**:
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Izin | Text | Required, Max 50, unik, `[A-Z0-9_]` | "Kode izin wajib & harus unik." | mis. `A001` (menu), `ADD_BTN` (tombol), `FORM_INPUT` (form) |
  | Nama Izin | Text | Required, Max 100 | "Nama izin wajib diisi." | mis. "Tombol Tambah Pasien" |
  | Tipe (Komponen UI) | Dropdown | Required (MENU/BUTTON/FORM/TAB/API) | "Tipe izin wajib dipilih." | Komponen UI yang dilindungi |
  | Method (Aksi Backend) | Text | Required | "Method wajib diisi." | Fungsi backend yang dijaga, mis. `add`, `getRow` |
  | Parent Menu | Dropdown(lookup) | Kondisional | "Parent menu wajib untuk tombol/form." | Menu induk tempat komponen berada |

---

**Fitur: Manajemen Role**
* **User Story**: Sebagai Admin, saya ingin membuat Role dan mencentang Kode Izin di dalamnya, agar paket akses per peran mudah dikelola.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat membuat Role (`name`, `description`), mis. `perawat1`, `perawat2`, `keuangan1`, `keuangan2`.
    * **AC 2**: Layar assign menampilkan **checklist** seluruh Kode Izin aktif (dikelompokkan per module/menu); centang = izin masuk role.
    * **AC 3**: Menyimpan menulis relasi ke `role_permissions` (hapus centang = hapus baris).
    * **AC 4**: Perubahan isi role berlaku ke **semua user** anggota role pada resolve berikutnya (BR-A53-06).

---

**Fitur: Asosiasi User ↔ Role**
* **User Story**: Sebagai Admin, saya ingin memasukkan User ke satu/lebih Role, agar user mewarisi izin dari role tersebut. Seluruh izin **hanya** dari role.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Satu User dapat ditautkan ke **banyak** Role (many-to-many).
    * **AC 2**: **Tidak ada** mekanisme menempel izin langsung ke user; akses khusus dibuat lewat Role tersendiri (BR-A53-10).
    * **AC 3**: Izin efektif = **gabungan (∪) izin dari semua Role aktif** yang ditautkan ke user (BR-A53-05).
    * **AC 4**: Duplikasi tautan (user+role) ditolak (BR-A53-04).

---

**Fitur: Perubahan Dinamis (Real-Time Session)**
* **User Story**: Sebagai Admin, saya ingin menukar hak akses user di tengah jam kerja dan langsung berlaku, agar tidak perlu menunggu user re-login.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap perubahan izin/role/tautan men-*bump* `permission_version` user terkait (BR-A53-08).
    * **AC 2**: Request berikutnya dari user memicu **re-resolve** array izin (cache miss karena versi berubah) → akses terbaru berlaku tanpa re-login.
    * **AC 3**: Bila izin dicabut, aksi berikutnya yang butuh izin tersebut ditolak **Forbidden (403)**.
    * **AC 4**: Frontend menerima sinyal versi berubah → refetch izin → menu/tombol menyesuaikan tanpa reload penuh [ASUMSI mekanisme polling/websocket].

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion (Relasional — Dynamic RBAC)

> **Struktur: 3 Master + 2 Jembatan.** Seluruh izin mengalir hanya lewat Role (tidak ada override per-user).
>
> | # | Tabel | Kategori | Peran |
> |---|-------|----------|-------|
> | 1 | `users` (A1) | **Master** | entitas user (direferensikan, tidak didefinisikan di sini) |
> | 2 | `roles` | **Master** | entitas peran (mis. `perawat1`) |
> | 3 | `permissions` | **Master** | entitas izin (Komponen UI + Method) |
> | 4 | `user_roles` | *Jembatan* | realisasi M:N "user memiliki role" (hasil centang) |
> | 5 | `role_permissions` | *Jembatan* | realisasi M:N "role memiliki permission" (hasil centang) |
>
> Dua tabel jembatan **wajib** untuk relasi many-to-many (tidak bisa dihilangkan tanpa mengorbankan integritas FK & query balik). Tabel `user_permission_version` & `audit_log_rbac` di bawah bersifat **opsional/pendukung** (invalidasi sesi & audit), bukan inti RBAC.

#### Table: `permissions` — katalog Kode Izin (master)
| Kolom | Tipe | Key | Fungsi |
|-------|------|-----|--------|
| `id` | UUID | **PK** | Identitas baris |
| `permission_code` | VARCHAR(50) | **UNIQUE** | Kode yang dicek sistem, mis. `A001` (menu), `ADD_BTN` (tombol), `FORM_INPUT` (form) |
| `permission_name` | VARCHAR(100) | — | Label manusiawi, mis. "Tombol Tambah Pasien" |
| `permission_type` | ENUM(`MENU`,`BUTTON`,`FORM`,`TAB`,`API`) | — | **Komponen UI** yang dilindungi |
| `method` | VARCHAR(50) | — | **Method/aksi backend** yang dijaga kode ini, mis. `add`, `getRow`, `update`, `delete`, `list`. Dipakai guard backend memetakan handler → kode izin |
| `parent_menu_id` | UUID | **FK → permissions.id** | Hierarki: tombol/form/tab menempel ke menu induk (self-ref) |
| `module` | VARCHAR(50) | — | Pengelompokan (mis. Pasien, Farmasi) |
| `description` | VARCHAR(255) | — | Keterangan |
| `is_active` | BOOLEAN | — | Soft delete (default true) |
| `created_at`/`updated_at`/`created_by`/`updated_by` | — | — | Audit |

> **Contoh baris `permissions`:**
> | permission_code | permission_type | method | parent_menu | keterangan |
> |---|---|---|---|---|
> | `A001` | MENU | `openMenu` | — | Menu Pasien |
> | `ADD_BTN` | BUTTON | `add` | `A001` | Tombol Tambah pada menu Pasien |
> | `FORM_INPUT` | FORM | `getRow` | `A001` | Form input (tarik data baris ke form) |
> | `SAVE_BTN` | BUTTON | `update` | `A001` | Tombol Simpan |

#### Table: `roles` — Role / peran konkret (mis. `perawat1`, `keuangan1`)
| Kolom | Tipe | Key | Fungsi |
|-------|------|-----|--------|
| `id` | UUID | **PK** | Identitas role |
| `name` | VARCHAR(100) | **UNIQUE** | Nama role konkret, mis. `perawat1`, `perawat2`, `keuangan1`, `keuangan2` |
| `description` | VARCHAR(255) | — | Keterangan |
| `is_active` | BOOLEAN | — | Soft delete |
| `approval_status` | ENUM(`none`,`pending`,`approved`,`rejected`) | — | *Reserved Phase 2 (approval perubahan akses)* |
| `approver_role` | VARCHAR(50) | — | *Reserved Phase 2* |
| `created_at`/`updated_at`/... | — | — | Audit |

#### Table: `role_permissions` *(Jembatan)* — **1 Role : N Izin**
| Kolom | Tipe | Key | Fungsi |
|-------|------|-----|--------|
| `id` | UUID | **PK** | — |
| `role_id` | UUID | **FK → roles.id** | Role pemilik |
| `permission_id` | UUID | **FK → permissions.id** | Izin yang masuk role |
| — | — | **UNIQUE(role_id, permission_id)** | Cegah duplikat centang |

#### Table: `user_roles` *(Jembatan)* — **1 User : N Role**
| Kolom | Tipe | Key | Fungsi |
|-------|------|-----|--------|
| `id` | UUID | **PK** | — |
| `user_id` | UUID | **FK → users.id** (A1) | User yang ditautkan |
| `role_id` | UUID | **FK → roles.id** | Role yang diwarisi |
| — | — | **UNIQUE(user_id, role_id)** | Cegah tautan ganda |

> **Catatan revisi:** Tabel `user_permission_overrides` (izin langsung ke user) **DITIADAKAN**. Seluruh izin kini mengalir hanya via `user_roles` → `role_permissions`. Akses khusus per individu = buat Role tersendiri.

#### Table: `user_permission_version` — penanda invalidasi sesi (dinamis)
| Kolom | Tipe | Key | Fungsi |
|-------|------|-----|--------|
| `user_id` | UUID | **PK / FK → users.id** | — |
| `version` | BIGINT | — | Di-*bump* tiap perubahan izin user → paksa re-resolve (BR-A53-08) |
| `updated_at` | TIMESTAMPTZ | — | — |

#### Table: `audit_log_rbac`
| Kolom | Tipe | Key | Fungsi |
|-------|------|-----|--------|
| `id` | UUID | **PK** | — |
| `entity_type` | ENUM(`permission`,`role`,`role_permission`,`user_role`) | — | Objek yang berubah |
| `action` | ENUM(`create`,`update`,`delete`,`assign`,`revoke`) | — | Aksi |
| `diff` | JSONB | — | before/after |
| `actor_user_id`/`actor_name` | — | — | Admin pelaku |
| `created_at` | TIMESTAMPTZ | — | Immutable |

**Relasi (ERD ringkas):**
```
users (A1) ──< user_roles >── roles ──< role_permissions >── permissions
                                                                  └─(parent_menu_id self-ref)
   Master        Jembatan     Master       Jembatan            Master
```

**Resolve izin efektif (konsep query / stored procedure `sp_get_user_permissions(user_id)`):**
```sql
-- Izin efektif = DISTINCT gabungan izin dari SEMUA role aktif user (satu-satunya sumber)
SELECT DISTINCT p.permission_code, p.method
FROM user_roles ur
JOIN roles r            ON r.id = ur.role_id AND r.is_active
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p      ON p.id = rp.permission_id AND p.is_active
WHERE ur.user_id = :uid;
```

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT | `/api/v1/rbac/permissions` | CRUD Kode Izin (Menu/Button) |
| PATCH | `/api/v1/rbac/permissions/{id}/status` | Toggle aktif/nonaktif |
| GET/POST/PUT | `/api/v1/rbac/roles` | CRUD Role |
| PUT | `/api/v1/rbac/roles/{id}/permissions` | Set checklist izin role (replace-all) |
| GET/POST/DELETE | `/api/v1/rbac/users/{userId}/roles` | Tautkan/lepas user ↔ role |
| GET | `/api/v1/rbac/users/{userId}/effective-permissions` | Array kode izin efektif (hasil resolve dari role) |
| GET | `/api/v1/rbac/me/permissions` | Array izin milik user login (dipakai frontend) |
| GET | `/api/v1/rbac/audit-logs` | Riwayat perubahan RBAC |

### 8.3 Data & Business Rules

#### 8.3.1 Form Input (CREATE/EDIT)
| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `permission_code` | Kode Izin | text | Ya | unik, `[A-Z0-9_]`, maks 50 | manual | immutable pasca dipakai (BR-A53-01); mis. `ADD_BTN` |
| `permission_type` | Tipe Izin (Komponen UI) | dropdown | Ya | MENU/BUTTON/FORM/TAB/API | enum | komponen UI yang dilindungi |
| `method` | Method (Aksi Backend) | text | Ya | maks 50 | manual | fungsi backend yang dijaga, mis. `add`, `getRow` |
| `parent_menu_id` | Parent Menu | dropdown(lookup) | Kondisional | wajib utk BUTTON/FORM/TAB | lookup permissions | hierarki |
| `roles.name` | Nama Role | text | Ya | unik, maks 100 | manual | mis. `perawat1`, `keuangan1` |

#### 8.3.2 Tampilan Daftar (List View)
| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| Kode Izin | `permission_code` | badge mono | filter type, search | — |
| Tipe / Method | `permission_type` / `method` | badge | filter | mis. BUTTON·`add`, FORM·`getRow` |
| Module / Parent | `module` / `parent_menu` | text | filter | hierarki |
| Role | `roles.name` | text | search | jml izin & jml user |
| User → Roles | count `user_roles` | angka | sort | per user |
| Status | `is_active` | badge aktif/nonaktif | filter | — |

**Business Rules**:
| ID | Aturan |
|----|--------|
| BR-A53-01 | `permission_code` unik & **immutable** setelah direferensikan Role (ubah = buat kode baru). |
| BR-A53-02 | Relasi bersifat many-to-many: 1 user ⇄ N role; 1 role ⇄ N izin. |
| BR-A53-03 | Izin efektif dihitung **real-time** per request, bukan disimpan statis di token. |
| BR-A53-04 | Tautan (user+role) tidak boleh duplikat. |
| BR-A53-05 | Izin efektif user = **gabungan (union) izin dari semua Role aktif**. Tidak ada penambahan/pengurangan izin di luar role. |
| BR-A53-06 | Perubahan isi role berlaku ke seluruh anggota role pada resolve berikutnya. |
| BR-A53-07 | Kode izin/role `NONAKTIF` diabaikan saat resolve (soft delete, bukan hapus fisik). |
| BR-A53-08 | Setiap perubahan izin men-*bump* `user_permission_version` → invalidasi cache sesi (dinamis). |
| BR-A53-09 | Enforcement **wajib** di backend; frontend hanya kosmetik (BR keamanan). |
| BR-A53-10 | **Tidak ada izin langsung ke user** (Direct Permission Override ditiadakan); seluruh izin wajib melalui Role. Akses khusus individu = Role tersendiri. |

---

## 9. Workflow / BPMN Interpretation — Alur Admin End-to-End

**A. Pembuatan Master Data (Kode Izin):**
1. Admin buka **Admin → RBAC → Kode Izin** → klik **Tambah**.
2. Isi `permission_code` (mis. `A001`/menu, `ADD_BTN`/tombol, `FORM_INPUT`/form), `permission_name`, `permission_type` (komponen UI), **`method`** (aksi backend: `add`/`getRow`/…), `parent_menu`.
3. Simpan → kode masuk katalog `permissions` (status AKTIF) → audit log.

**B. Manajemen Role:**
1. Admin buka **Role** → **Tambah** → isi nama peran konkret (mis. **`perawat1`**, **`keuangan1`**).
2. Buka layar **Assign Izin** → tampil **checklist** seluruh kode izin (dikelompokkan per module/menu).
3. Centang izin yang termasuk role (mis. `A001`, `ADD_BTN`, `FORM_INPUT`) → **Simpan** → tertulis ke `role_permissions`.

**C. Asosiasi Pegawai (User ↔ Role):**
1. Admin buka **User Access** → pilih `user_id`.
2. Centang satu/lebih **Role** (mis. user X = `perawat1` + `keuangan1`) → user mewarisi seluruh izin role (`user_roles`).
3. Butuh akses khusus untuk 1 orang? **Buat Role baru** (mis. `perawat1_khusus`) berisi izin yang diinginkan, lalu tautkan — **bukan** menempel izin langsung ke user.
4. Simpan → sistem **bump `user_permission_version`** → audit log.

**D. Perubahan Dinamis (real-time di tengah jam kerja):**
1. Admin mencabut/menambah izin user X saat X sedang login.
2. Sistem menaikkan `user_permission_version[X]`.
3. Request berikutnya dari X → backend deteksi versi berubah → **re-resolve** array izin via `sp_get_user_permissions` (cache lama dibuang).
4. Efek: izin baru langsung berlaku **tanpa re-login**. Aksi yang izinnya dicabut → **403 Forbidden**. Frontend refetch `/rbac/me/permissions` → menu/tombol menyesuaikan.

---

## 10. System Logic — Eksekusi Kode Izin

### 10.1 Token & Autentikasi (identitas saja, izin dihitung real-time)
* **Token hanya membawa Kredensial Identitas** (`user_id`, exp, iss) — **bukan** daftar izin. Alasan:
    * Izin bisa berubah kapan saja; menaruhnya di token = **stale** sampai token kedaluwarsa.
    * Daftar izin bisa panjang → token membengkak.
* **Alur**: request masuk → validasi tanda tangan token → ambil `user_id` → backend memanggil `sp_get_user_permissions(user_id)` (atau query resolve §8.1) → dapat **array kode izin** terbaru.
* **Cache tipis (opsional)**: array izin di-cache in-memory dengan **kunci = `user_id` + `permission_version`**. Saat versi di-bump (BR-A53-08), cache otomatis miss → re-resolve. Tanpa Redis pun cukup untuk RS Tipe C/D (in-process cache).

### 10.2 Gerbang Keamanan Backend (Satpam Utama — WAJIB)
* Setiap endpoint sensitif dilindungi **middleware/guard** yang mengecek kode izin **sebelum** fungsi database inti dijalankan.
* Logika intersepsi (pseudocode):
```js
function requirePermission(code) {
  return (req, res, next) => {
    const perms = getUserPermissions(req.userId);   // array real-time
    if (!perms.includes(code)) {
      throw new ForbiddenError('403');               // catch → hentikan request
    }
    next();                                          // lolos → lanjut ke handler/DB
  };
}
// contoh: endpoint method `add` dijaga kode ADD_BTN
router.post('/patients',     requirePermission('ADD_BTN'),    addPatient)   // method: add
router.get('/patients/:id',  requirePermission('FORM_INPUT'), getRow)       // method: getRow
```
* **Mapping method → kode izin**: guard memetakan **handler/method backend** (mis. `add`, `getRow`) ke `permission_code` lewat kolom `permissions.method` (§8.1). Jadi izin tidak sekadar "buka menu", tapi mengunci **aksi backend** spesifik.
* **Prinsip**: bila kode izin **tidak ada** di array user → request di-*catch* / dilempar **Forbidden (403)**, **fungsi DB tidak pernah dieksekusi**. Ini titik keamanan sebenarnya.

### 10.3 Kontrol Antarmuka Frontend (Kosmetik — bukan keamanan)
* Saat login (atau saat versi berubah), frontend memanggil `GET /rbac/me/permissions` → simpan **array kode izin** di state.
* Pemakaian:
    * **Menu**: `v-if="perms.includes('A001')"` / conditional routing (route guard menyembunyikan rute tanpa izin).
    * **Tombol**: `:disabled="!perms.includes('ADD_BTN')"` atau sembunyikan.
    * **Form**: `v-if="perms.includes('FORM_INPUT')"` untuk mengaktifkan form input (method `getRow`).
* **Kenapa aman walau frontend bisa dimanipulasi**: menampilkan paksa tombol via DevTools **tidak memberi akses** — saat aksi dikirim, **backend (§10.2) tetap mengecek array izin** dan menolak 403. Frontend hanya mempercantik UX (sembunyikan yang tak relevan), **bukan** lapisan keamanan.

> **Aturan emas**: *Frontend memutuskan apa yang **terlihat**; Backend memutuskan apa yang **boleh terjadi**.* (BR-A53-09)

---

## Asumsi
- `permission_version` dipakai sebagai mekanisme invalidasi sesi dinamis; push ke frontend via polling ringan atau websocket [ASUMSI mekanisme final].
- Kolom `approval_status`/`approver_role` di `roles` bersifat *reserved* untuk approval perubahan akses Phase 2.
- `users` bersumber dari A1; enforcement per-record (row-level, mis. "hanya lihat pasien unit sendiri") = kandidat Phase 2, di luar scope permission code menu/button.

## Pertanyaan Terbuka
- Apakah izin tipe API/row-level (data scoping per unit) masuk Phase 1 atau Phase 2? [PERLU KONFIRMASI]
- Mekanisme push perubahan dinamis: polling interval vs websocket? [PERLU KONFIRMASI]
- Apakah `parent_menu` wajib untuk semua BUTTON/TAB, atau boleh berdiri sendiri? [PERLU KONFIRMASI]
