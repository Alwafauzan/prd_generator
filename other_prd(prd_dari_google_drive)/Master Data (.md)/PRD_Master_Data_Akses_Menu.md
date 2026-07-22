# Product Requirement Document (PRD)
# A37 — Master Data Akses Menu

---

## 1. Metadata Dokumen

* **Approval**: [Nama Kepala Bidang IT / Manajer Operasional, Jabatan, Tanggal]
* **Related Documents**:
  * A53 — Admin RBAC (penerus konsep akses menu di Phase 2; mengonsumsi registry A37)
  * A18 — Master Data Role (peran acuan pemetaan akses)
  * A1 — Master Data User, A2 — Master Data Staff (subjek akses)
  * A48 — Konfigurasi RS (identitas RS untuk konteks)
  * List Fitur V2.xlsx (sheet MVP) — A37 (Master Data → Akses Menu (New))
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-29 | 1.0 | PRD awal A37 — registry akses menu, format `template (1).md`. |
| 2026-06-29 | 1.1 | Penegasan: **tidak ada input/CRUD menu** — akses menu disediakan sistem & bertambah otomatis (auto-register). |
| 2026-06-29 | 1.2 | **Penegasan ruang lingkup**: A37 adalah modul **Phase 1 saja** — mengakomodir kebutuhan akses menu sistem sebelum RBAC ada. **Sejak Phase 2, akses menu diakomodir oleh Setting RBAC (A53)** (fitur berbeda); A37 **tidak** memiliki UI/Setting RBAC. **Akses default Phase 1 = pemetaan statis/seed minimal per Role.** **`action_key` bersifat lintas modul (global)**, namun standardisasi & pemetaannya diakomodir di Setting RBAC (Phase 2 / A53). |
| 2026-06-29 | 1.3 | **Granularitas seed Phase 1 = level MENU saja** (tidak sampai `action_key`). **Transisi ke Phase 2: pemetaan seed Phase 1 OTOMATIS diimpor** sebagai konfigurasi awal A53 Setting RBAC. |

> Catatan ruang lingkup: A37 adalah **single source of truth struktur menu** SIMRS (Menu › Sub Menu › Aksi) yang **diisi & dipelihara sistem** (auto-register saat menu dikembangkan). Perannya **terbatas pada Phase 1**: menyediakan katalog menu + **pemetaan akses statis/seed minimal per Role** agar sistem dapat berjalan sebelum RBAC penuh tersedia. **Mulai Phase 2, seluruh tata kelola akses menu (dinamis, per Role/User, dengan UI) ditangani oleh Setting RBAC (A53)** yang mengonsumsi registry A37.

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Akses Menu** (code **A37**, cluster **Control Panel → Master Data**) adalah **registry/katalog terstruktur** seluruh **menu, sub-menu, dan aksi** yang tersedia di SIMRS, sekaligus **mekanisme akses menu Phase 1** sebelum modul RBAC (A53) dikembangkan.

**Dua karakteristik kunci:**
1. **Disediakan sistem, bukan diinput user.** Seluruh entri akses menu **terdaftar otomatis** (auto-register) seiring menu/fitur baru dikembangkan & di-deploy. **Tidak ada layar/fitur untuk menambah, mengubah, atau menghapus menu.**
2. **Modul Phase 1 saja.** A37 mengakomodir kebutuhan akses menu **hanya pada Phase 1** — menyediakan katalog menu + **pemetaan akses statis/seed minimal per Role**. **Sejak Phase 2, konsep akses menu diakomodir oleh Setting RBAC (A53)**, fitur terpisah yang memberi UI & pemetaan dinamis. A37 **tidak** akan menumbuhkan UI sendiri; ia menjadi **fondasi data** yang dikonsumsi A53.

Sebuah entri akses menu mendefinisikan identitas menu (`kode_menu` stabil), label tampilan, hierarki (menu induk → sub-menu), penempatan navigasi (cluster/modul/route/urutan/ikon), serta **daftar aksi** (`action_key`) yang mungkin pada menu tersebut. **`action_key` bersifat lintas modul (global/konsisten)** — mis. `view`, `create`, `update`, `delete`, `print`, `approve`, `export`, `import`, hingga aksi integrasi seperti `terbitkan_sep`, `kirim_satusehat`. Standardisasi penuh & pemetaan granular `action_key` ke role **diakomodir di Setting RBAC (Phase 2 / A53)**.

Lingkup teknis: **master data referensial yang dipelihara sistem** — bukan transaksi, bukan data entry. Pada Phase 1, akses ditentukan oleh **pemetaan statis/seed minimal per Role** (baseline agar sistem aman & dapat dipakai sebelum RBAC penuh). Pada Phase 2, baseline ini digantikan tata kelola dinamis A53.

### Business Process (As-Is vs To-Be)

**As-Is (Kondisi Saat Ini):** *([ASUMSI] — pola RS Tipe C&D, tanpa BPMN khusus)*
- Daftar menu **hardcoded** tersebar; tidak ada katalog menu/aksi terpusat yang dapat diacu modul lain.
- Tidak ada acuan baku "aksi apa saja yang mungkin" per menu → kontrol akses sulit konsisten.
- Saat menu baru dikembangkan, navigasi & akses tidak otomatis sinkron.

**To-Be (Workflow Digital yang Diusulkan):**
- **Phase 1 (A37)**: Seluruh menu & aksi **terdaftar otomatis** dalam **registry tunggal**. Kerangka aplikasi merender navigasi dari registry; akses dibatasi **pemetaan statis/seed minimal per Role**. Katalog **tumbuh otomatis** mengikuti penambahan menu, tanpa input manual.
- **Phase 2 (A53 — Setting RBAC)**: Konsep akses menu **berpindah** ke modul Setting RBAC. A53 **mengonsumsi katalog A37** lalu menyediakan **UI pemetaan dinamis** akses menu/aksi per Role/User, menstandarkan `action_key` lintas modul, dan menegakkan hak akses server-side. **A37 tetap menjadi sumber katalog**, tanpa menambah UI.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi acuan menu antar modul | 100% navigasi & (kelak) katalog RBAC bersumber dari registry A37 yang sama (tidak ada daftar menu hardcoded paralel) |
| 2 | Kelengkapan katalog otomatis | 100% menu/fitur baru yang dikembangkan otomatis terdaftar di registry tanpa input manual |
| 3 | Stabilitas identitas menu | 0 perubahan `kode_menu`/`action_key` yang memutus pemetaan akses (immutable) |
| 4 | Keamanan akses Phase 1 | 100% Role memiliki **pemetaan akses statis/seed minimal** (tidak ada akses default penuh tak terkontrol) |
| 5 | Integritas hierarki | 0 sub-menu yatim (parent tidak valid) dan 0 referensi siklik pada registry |
| 6 | Kesiapan handoff ke A53 | Skema & API registry siap dikonsumsi Setting RBAC (A53) tanpa migrasi struktural besar |

---

## 4. Scope Definition & Phasing

> A37 adalah modul **Phase 1**. Kolom Phase 2 menunjukkan **handoff** ke Setting RBAC (A53) — bukan pekerjaan di A37.

| Fitur / Konsep | Phase 1 (A37) | Phase 2 (Setting RBAC — A53) |
|----------------|---------------|------------------------------|
| Registry Akses Menu (katalog menu & aksi) | **Disediakan sistem** (auto-register, auto-grow) | A53 **mengonsumsi** katalog A37 |
| Hierarki Menu › Sub Menu › Aksi | Tersusun otomatis di registry | (dikonsumsi A53) |
| Render navigasi dari registry | Ya — modul navigasi membaca registry | Tetap dari registry |
| Pemetaan akses ke Role | **Statis / seed minimal per Role** (baseline) | **Dinamis via UI Setting RBAC** (A53) menggantikan baseline |
| `action_key` lintas modul (global) | Tercatat di registry sebagai katalog aksi | **Distandarkan & dipetakan** ke role di Setting RBAC (A53) |
| UI pengelolaan / setting akses | **— (tanpa UI)** | **Di A53** (bukan A37) |
| Audit trail pemetaan akses | — (baseline via seed) | Di A53 |

**Out of Scope**:
* **Input/CRUD menu oleh user** — **TIDAK ADA**. Menu/aksi disediakan & dipelihara **sistem** (auto-register), bukan ditambah/diubah/dihapus manual.
* **UI apa pun & fitur Setting RBAC** — **bukan bagian A37**. Sejak Phase 2 ditangani **A53** (UI pemetaan dinamis, standardisasi `action_key`, penegakan permission, audit trail).
* Definisi master **Role** (nama/atribut peran) — domain **A18 Role**.
* Manajemen **User/Staff** — domain A1/A2.
* **UI pada Phase 1** (ditegaskan: Phase 1 tanpa UI).

---

## 5. Related Features

| Code | Module | Relasi Teknis / Bisnis |
|------|--------|------------------------|
| **A53** | Admin RBAC (Setting RBAC) | **Penerus konsep akses menu sejak Phase 2.** Mengonsumsi registry A37 (Menu › Sub Menu › Aksi) sebagai katalog permission; menyediakan UI pemetaan dinamis per Role/User, menstandarkan `action_key`, menegakkan hak akses. A37 = fondasi data; A53 = tata kelola & penegakan. |
| **A18** | Master Data Role | Sumber Role untuk pemetaan akses (baseline seed Phase 1 & dinamis Phase 2). |
| A1 | Master Data User | Subjek akhir akses menu (via Role). |
| A2 | Master Data Staff | Penempatan staf → user → role → akses menu. |
| A48 | Konfigurasi RS | Konteks identitas RS. |

> Istilah kanonik bersama: `kode_menu`/`menu_key`, `action_key` (lintas modul), `role` (A18), `status_aktif` — dipakai konsisten dengan A53/A18.

---

## 6. Business Process & User Stories

### State Machine — Status Entri Menu *(dikelola sistem)*

| Status | Deskripsi | Efek ke Modul Lain | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------|--------------------|--------------------|
| `AKTIF` | Entri menu/aksi aktif & dipakai navigasi + (kelak) katalog RBAC | Tampil di navigasi; tersedia untuk pemetaan akses | Disediakan sistem saat menu dikembangkan (default `AKTIF`) | Sama (dikonsumsi A53) |
| `NONAKTIF` | Entri di-deprecate **oleh sistem** (menu ditarik dari rilis) | Tidak dirender; tidak tersedia sebagai akses baru; pemetaan historis tetap utuh | Diatur sistem | Diatur sistem |

> [ASUMSI] Status entri **dikelola sistem** mengikuti siklus pengembangan menu, bukan oleh user. Tidak ada hard delete; menu yang ditarik di-`NONAKTIF`-kan agar pemetaan akses tetap konsisten. Tidak ada workflow approval (registry teknis) — kolom approval tidak disertakan.

### User Stories Utama

| ID | User Story | Prioritas | Fase |
|----|-----------|-----------|------|
| US-A37-01 | Sebagai **Sistem**, saya ingin mendaftarkan menu baru secara otomatis ke registry saat dikembangkan/di-deploy, agar katalog selalu lengkap tanpa input manual. | P0 | Phase 1 |
| US-A37-02 | Sebagai **Modul Navigasi**, saya ingin membaca registry menu terstruktur, agar merender menu konsisten tanpa daftar hardcoded. | P0 | Phase 1 |
| US-A37-03 | Sebagai **Sistem**, saya ingin membatasi akses menu berdasarkan **pemetaan statis/seed minimal per Role**, agar tiap Role hanya mengakses menu sesuai baseline kewenangannya sebelum RBAC penuh ada. | P0 | Phase 1 |
| US-A37-04 | Sebagai **Modul Setting RBAC (A53)**, saya ingin mengonsumsi katalog Menu › Sub Menu › Aksi (`action_key` lintas modul) dari A37, agar dapat membangun pemetaan akses dinamis di Phase 2. | P0 (handoff) | Phase 2 (A53) |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

> Seluruh fitur A37 berada di **Phase 1** dan **tanpa UI**. Tata kelola akses ber-UI (Setting RBAC) adalah lingkup **A53** sejak Phase 2.

**Fitur: Registry Akses Menu Disediakan Sistem (Auto-Register) — Phase 1, tanpa UI**
* **User Story**: Sebagai Sistem, saya ingin seluruh menu/aksi terdaftar otomatis dalam registry terstruktur saat dikembangkan, agar tersedia acuan tunggal tanpa input manual.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Registry mendefinisikan tiap entri menu dengan minimal: `kode_menu` (unik & stabil), `nama_menu`, `parent_id` (hierarki), `cluster`, `modul`, `route`, `urutan`, `level`, dan daftar `action_key` (lintas modul) yang mungkin pada menu tersebut.
  * **AC 2**: Entri **disediakan sistem** — menu baru **terdaftar otomatis** (auto-register saat deploy/startup); **tidak ada input/CRUD manual**.
  * **AC 3**: Hierarki valid — setiap `parent_id` mengacu entri yang ada; tidak ada referensi siklik; sub-menu mewarisi konteks induk.
  * **AC 4**: `kode_menu` & `action_key` bersifat **immutable** agar pemetaan akses tidak terputus saat di-handoff ke A53.
  * **AC 5**: Default `status_aktif` setiap entri = `AKTIF`; menu yang ditarik dari rilis di-`NONAKTIF`-kan oleh sistem (bukan dihapus).
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | — | **Tidak berlaku (tanpa UI & tanpa input).** Validasi struktur registry ditegakkan saat auto-register/startup (lihat Business Rules). | — | — |

---

**Fitur: Konsumsi Registry oleh Navigasi — Phase 1**
* **User Story**: Sebagai Modul Navigasi, saya ingin membaca registry via API/loader, agar menu dirender dari sumber tunggal.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tersedia akses baca (API/loader) yang mengembalikan **pohon menu** (hierarki + aksi) dan **daftar datar** menu/aksi aktif.
  * **AC 2**: Modul navigasi merender menu **hanya** dari registry (tidak ada daftar menu hardcoded paralel).
  * **AC 3**: Menu/aksi `NONAKTIF` tidak dirender.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | — | **Tidak berlaku (Phase 1 tanpa UI).** Kontrak data API didefinisikan di §8.2. | — | — |

---

**Fitur: Pemetaan Akses Statis per Role (Seed Minimal) — Phase 1, tanpa UI**
* **User Story**: Sebagai Sistem, saya ingin membatasi akses menu per Role berdasarkan pemetaan statis/seed minimal, agar akses terkontrol sebelum RBAC penuh (A53) tersedia.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tersedia **pemetaan seed** Role → menu yang diizinkan, bersifat **minimal** (baseline per Role; bukan akses default penuh). **Granularitas = level MENU saja** (bukan per `action_key`) pada Phase 1.
  * **AC 2**: Navigasi & akses route **menghormati** pemetaan seed — Role hanya melihat/memakai menu yang dipetakan.
  * **AC 3**: Pemetaan **disediakan via seed/konfigurasi** (tanpa UI); perubahan dilakukan via rilis terkontrol.
  * **AC 4**: Pemetaan hanya mereferensikan menu `AKTIF` di registry; entri `NONAKTIF` diabaikan.
  * **AC 5**: Pada Phase 2, pemetaan seed ini **otomatis diimpor** sebagai **konfigurasi awal** tata kelola dinamis **A53 Setting RBAC** (bukan disusun ulang manual).
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | — | **Tidak berlaku (tanpa UI).** Pemetaan via seed; struktur di §8.3.2. | — | — |

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

> Tabel registry **diisi & dipelihara sistem** (auto-register), bukan input pengguna.

* **Table Name**: `master_menu_access` (registry menu/hierarki)

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `id` | UUID | Primary Key | ID internal entri menu |
| `kode_menu` | VARCHAR(60) | NOT NULL, UNIQUE, **immutable** | Identitas stabil menu |
| `nama_menu` | VARCHAR(100) | NOT NULL | Label tampilan |
| `parent_id` | UUID | NULL, FK → `master_menu_access.id` | Hierarki (NULL = level atas) |
| `cluster` | VARCHAR(50) | NOT NULL | Pengelompokan navigasi |
| `modul` | VARCHAR(80) | NULL | Modul pemilik menu |
| `route` | VARCHAR(200) | NULL | Path/route navigasi |
| `icon` | VARCHAR(60) | NULL | Ikon (opsional) |
| `urutan` | INT | NOT NULL, DEFAULT 0 | Urutan tampil |
| `level` | INT | NOT NULL, DEFAULT 1 | Kedalaman (1=menu, 2=sub-menu, …) |
| `keterangan` | VARCHAR(255) | NULL | Keterangan |
| `status_aktif` | BOOLEAN | NOT NULL, DEFAULT true | Soft status (dikelola sistem) |
| `registered_at` | TIMESTAMP | NULL | Waktu pertama terdaftar (auto-register) |
| `updated_at` | TIMESTAMP | NULL | Pembaruan terakhir oleh sistem |

* **Table Name**: `menu_action` (daftar aksi per menu — `action_key` lintas modul)

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `id` | UUID | Primary Key | ID aksi |
| `menu_id` | UUID | NOT NULL, FK → `master_menu_access.id` | Menu pemilik aksi |
| `action_key` | VARCHAR(60) | NOT NULL, **immutable** | Kunci aksi **lintas modul/global** (`view`,`create`,`update`,…) |
| `label` | VARCHAR(100) | NULL | Label tampilan aksi |
| `status_aktif` | BOOLEAN | NOT NULL, DEFAULT true | Soft status (dikelola sistem) |
| | | UNIQUE (`menu_id`,`action_key`) | Aksi unik per menu |

* **Table Name**: `seed_role_menu_access` (pemetaan akses statis Phase 1 — baseline per Role, **level menu saja**)

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `role_id` | UUID/VARCHAR | NOT NULL, ref A18 Role | Role acuan |
| `menu_id` | UUID | NOT NULL, FK → `master_menu_access.id` | Menu yang diizinkan (**granularitas level menu**; tanpa `action_key` di Phase 1) |
| | | UNIQUE (`role_id`,`menu_id`) | Hindari duplikasi |

> Granularitas Phase 1 sengaja **per menu** (bukan per aksi) agar baseline sederhana. Pemetaan hingga `action_key` baru hadir di **A53 Setting RBAC (Phase 2)**.

* **Constraints/Integritas**:
  * `parent_id` ≠ `id` & tidak siklik (divalidasi sistem saat auto-register).
  * `kode_menu` & `action_key` **immutable**.
  * **Phase 2**: tata kelola pemetaan akses dinamis (mis. `rbac_role_permission`) menjadi milik **A53**, menggantikan/menyerap `seed_role_menu_access`.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Fase | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/menu-access/tree` | Phase 1 | Pohon menu (hierarki + aksi) untuk navigasi & (kelak) katalog RBAC |
| GET | `/api/v1/menu-access` | Phase 1 | Daftar datar menu/aksi (params: `cluster`, `status`, `search`) — read-only |
| GET | `/api/v1/menu-access/{kode_menu}` | Phase 1 | Detail satu menu + aksinya |
| GET | `/api/v1/menu-access/role/{roleId}` | Phase 1 | Menu/aksi yang diizinkan untuk Role (dari pemetaan seed) — dipakai navigasi |
| (internal) | `POST /internal/menu-access/sync` | Phase 1 | **Auto-register sistem** — sinkronisasi registry dari definisi menu aplikasi (bukan user-facing) |

> **Tidak ada endpoint POST/PATCH/DELETE menu user-facing** dan **tidak ada endpoint Setting RBAC di A37**. Penambahan isi katalog hanya via auto-register. UI & endpoint pemetaan akses dinamis adalah lingkup **A53 (Phase 2)**.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Struktur Entri Registry Menu (disediakan sistem; tanpa form input)

> **Tidak ada form input untuk menu** — entri disediakan sistem (auto-register). Tabel berikut mendeskripsikan **struktur data** entri registry, bukan field form.

| Field | Label | Tipe | Sumber | Catatan |
|-------|-------|------|--------|---------|
| `kode_menu` | Kode Menu | text | sistem (auto-register) | Unik, **immutable**; identitas untuk pemetaan akses |
| `nama_menu` | Nama Menu | text | sistem | Label tampilan |
| `parent_id` | Menu Induk | ref menu | sistem | Hierarki; kosong = level atas; tidak siklik |
| `cluster` / `modul` | Cluster / Modul | text | sistem | Pengelompokan navigasi |
| `route` | Route / Path | text | sistem | Path navigasi |
| `urutan` / `level` | Urutan / Level | number | sistem | Posisi & kedalaman tampil |
| `action_key[]` | Daftar Aksi | list (lintas modul) | sistem | Katalog aksi; **immutable**; distandarkan & dipetakan di Setting RBAC (A53) |
| `status_aktif` | Status | boolean | sistem | Default `AKTIF`; di-`NONAKTIF`-kan sistem bila menu ditarik — **dikelola sistem, bukan form** |

#### 8.3.2 Spesifikasi Data — Pemetaan Akses Statis per Role (Seed Minimal, Phase 1)

> Disediakan via seed/konfigurasi (tanpa UI). Menjadi data awal yang diadopsi/digantikan **A53 Setting RBAC** di Phase 2.

| Field | Label | Tipe | Sumber | Catatan |
|-------|-------|------|--------|---------|
| `role_id` | Role | ref (A18) | seed | Role acuan baseline |
| `menu_id` | Menu Diizinkan | ref registry | seed | Hanya menu `AKTIF`; **granularitas level menu** (tanpa `action_key` di Phase 1) |
| (kebijakan) | Baseline minimal | — | seed | Tidak ada akses default penuh; tiap Role dipetakan eksplisit di level menu |
| (transisi) | Impor ke A53 | — | sistem | Pemetaan seed **otomatis diimpor** sebagai konfigurasi awal A53 Setting RBAC (Phase 2) |

#### Business Rules

| ID | Rule |
|----|------|
| **BR-A37-01** | **Akses menu disediakan sistem** — entri menu/aksi terdaftar otomatis (auto-register) saat menu dikembangkan/di-deploy. **Tidak ada input/CRUD menu oleh user.** |
| **BR-A37-02** | Katalog **bertambah otomatis** seiring menu baru dikembangkan; tanpa pendaftaran manual. |
| **BR-A37-03** | **`kode_menu` unik & immutable**; **`action_key` lintas modul (global), unik per menu & immutable** — agar pemetaan akses tidak terputus saat handoff ke A53. |
| **BR-A37-04** | **Hierarki valid** — `parent_id` mengacu entri yang ada, bukan diri sendiri, tidak siklik. |
| **BR-A37-05** | **Sumber kebenaran tunggal** — navigasi & (kelak) katalog RBAC **wajib** bersumber dari registry A37; dilarang daftar menu hardcoded paralel. |
| **BR-A37-06** | Menu/aksi **`NONAKTIF`** tidak dirender & tidak tersedia sebagai akses baru; pemetaan historis tetap utuh. |
| **BR-A37-07** | **Status dikelola sistem** (siklus pengembangan menu); tidak ada hard delete — menu ditarik di-`NONAKTIF`-kan. |
| **BR-A37-08** | **Akses Phase 1 = pemetaan statis/seed minimal per Role**, **granularitas level MENU saja** (tanpa `action_key`) — tidak ada akses default penuh; setiap Role dipetakan eksplisit ke menu yang diizinkan. |
| **BR-A37-09** | **Ruang lingkup A37 = Phase 1 saja.** Sejak Phase 2, tata kelola akses menu (UI, pemetaan dinamis per Role/User, granularitas hingga `action_key`, standardisasi `action_key`, audit) **diakomodir oleh Setting RBAC (A53)** yang mengonsumsi registry A37. A37 tidak menumbuhkan UI. |
| **BR-A37-10** | **Pemisahan tanggung jawab**: A37 = **apa** (katalog menu/aksi, disediakan sistem) + baseline seed Phase 1 (level menu); A53 = **siapa boleh akses apa** (tata kelola dinamis hingga aksi, Phase 2). |
| **BR-A37-11** | **Transisi seed → A53**: pemetaan seed Phase 1 (Role × menu) **otomatis diimpor** sebagai **konfigurasi awal** A53 Setting RBAC saat Phase 2 — bukan disusun ulang manual. |

---

## 9. Workflow / BPMN Interpretation

> [ASUMSI] A37 **belum memiliki BPMN sendiri**. Alur diturunkan dari pola registry referensial yang dipelihara sistem + instruksi pengembangan (tanpa input menu; Phase 1 tanpa UI; handoff ke A53 di Phase 2).

**Phase 1 (A37, tanpa UI):**
1. **Auto-Register** — Saat menu baru dikembangkan & di-deploy, sistem mendaftarkan entri menu (`kode_menu`, hierarki, `action_key` lintas modul) ke registry. **Gateway validasi** (saat sync/startup): kode unik, parent valid & tidak siklik, action unik per menu → bila gagal, registrasi ditolak/diberi peringatan.
2. **Pemuatan & Baseline Akses** — Aplikasi memuat registry (default `AKTIF`) dan **pemetaan akses statis/seed minimal per Role** (**level menu saja**).
3. **Render Navigasi** — Modul navigasi membaca pohon menu **dan** memfilter sesuai pemetaan seed Role pengguna (per menu) → merender menu yang diizinkan.
4. **Pertumbuhan Katalog** — Menu baru bertambah otomatis pada rilis berikutnya; menu ditarik di-`NONAKTIF`-kan sistem. Tidak ada langkah input manual.

**Phase 2 (handoff → A53 Setting RBAC):**
1. **Konsumsi Katalog** — A53 membaca registry A37 (menu × `action_key`) sebagai katalog permission.
2. **Tata Kelola Dinamis** — A53 menyediakan **UI Setting RBAC**: pemetaan akses menu/aksi per Role/User (granularitas hingga `action_key`), standardisasi `action_key` lintas modul, penegakan server-side, audit trail. Pemetaan seed Phase 1 (Role × menu) **otomatis diimpor** sebagai **konfigurasi awal** A53.
3. **A37 tetap fondasi** — Registry tetap disediakan sistem (auto-grow); A37 **tidak** menambah UI.

---

### Catatan Pengembang
- **Penegasan utama**: A37 = **modul Phase 1 saja**, **tanpa input/CRUD menu** (disediakan sistem, auto-grow). Sejak **Phase 2**, akses menu **diakomodir Setting RBAC (A53)** — fitur berbeda; A37 jadi fondasi data.
- **Akses Phase 1** = **pemetaan statis/seed minimal per Role** (bukan akses default penuh).
- **`action_key`** = **lintas modul (global)**; standardisasi & pemetaan granular diakomodir di Setting RBAC (Phase 2 / A53).
- **Stabilitas identitas**: `kode_menu`/`action_key` immutable agar handoff ke A53 mulus.

### Pertanyaan Terbuka
- **Mekanisme auto-register**: bagaimana sistem mendeteksi & mendaftarkan menu baru (scan route/manifest saat build/deploy, atau definisi terpusat di kode)? Real-time DB vs rilis?
- Apakah perlu **registry `action_key` global terpisah** (daftar enum lintas modul) sebagai acuan standardisasi di A53?

> **Keputusan terjawab**: Granularitas seed Phase 1 = **level menu saja** (BR-A37-08). Transisi seed → A53 = **otomatis diimpor** sebagai konfigurasi awal (BR-A37-11).
