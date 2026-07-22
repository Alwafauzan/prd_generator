# PRD — Master Data Kelas (A58)

> **Kode Fitur:** A58 · **Cluster:** Control Panel · **Modul:** Master Data · **Menu:** Kelas
> SIMRS RS Tipe C & D · Persona: System Analyst senior SIMRS

---

## 1. Metadata Dokumen

* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer, Tamtech International (Signature, Date)
* **PIC PRD**: Arif Aminudin
* **Related Documents**:
    * PRD Master Data Tarif Kamar (A43) — konsumen `kelas` & `sub_kelas`
    * PRD Master Data Kamar (A16), PRD Master Data Bed (A17) — konsumen kelas perawatan
    * PRD RBAC (A53) — kontrol hak akses CRUD master
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-02 | 1.0 - Draft | Draft awal Master Data Kelas (Kelas & Sub Kelas hierarkis, toggle aktif/nonaktif) |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  Modul **Master Data Kelas** (cluster **Control Panel**, kode **A58**) mengelola daftar **kelas pelayanan** rumah sakit secara terpusat dan terstandar. Data bersifat **hierarkis 2 level**:
    * **Kelas (induk/parent)** — mis. **I, II, III, VIP**.
    * **Sub Kelas (anak/child)** — turunan dari sebuah Kelas, mis. **VIP A** & **VIP B** (dari VIP), **I A** (dari I).

  Aturan pembentuk hierarki: pada form Tambah/Edit terdapat field **Kelas** dan **Sub Kelas**. **Jika Sub Kelas tidak diisi, record tersebut menjadi Kelas induk (Parent).** Jika Sub Kelas diisi, record menjadi Sub Kelas di bawah Kelas yang dipilih; **dropdown pemilihan Kelas hanya menampilkan Kelas yang berstatus parent** (bukan sub kelas), karena hierarki dibatasi 2 level.

  Master ini menjadi **sumber kebenaran tunggal (single source of truth)** untuk daftar kelas pelayanan yang dipakai lintas modul: **Master Data Tarif Kamar (A43)**, **Master Data Kamar (A16)**, **Master Data Bed (A17)**, serta billing & pelaporan. Modul ini adalah **master data statis** (jarang berubah) — bukan modul transaksional.

  > `[ASUMSI]` "Kelas pelayanan" = klasifikasi kelas perawatan RS (I/II/III/VIP/VVIP, dll) beserta variasi sub kelasnya (mis. VIP A/B dengan fasilitas/tarif berbeda). Sub Kelas hanya berlaku untuk kelas yang memilikinya; tidak semua Kelas punya Sub Kelas.

* **Business Process (As-Is vs To-Be)**:

    * **As-Is** (kondisi saat ini) `[ASUMSI]`:
        1. Daftar kelas & sub kelas dicatat manual (spreadsheet/dokumen) atau ditulis bebas (teks) di masing-masing modul (tarif kamar, kamar, bed).
        2. Tidak ada acuan baku → penamaan kelas tidak konsisten antar modul (mis. "VIP-A" vs "VIP A" vs "VIPA").
        3. Perubahan (penambahan sub kelas, penonaktifan kelas) tidak terekam sistematis dan rawan tumpang tindih.

    * **To-Be** (kondisi diharapkan — workflow digital baru):
        1. Admin Control Panel membuka menu **Master Data > Kelas**.
        2. Sistem menampilkan **dashboard** daftar Kelas & Sub Kelas (termasuk yang nonaktif) beserti toggle status.
        3. Admin **Tambah/Edit**: mengisi **Kelas** (dan opsional **Sub Kelas**). Sub Kelas kosong → Kelas parent; Sub Kelas terisi → sub kelas di bawah Kelas terpilih (dropdown hanya parent).
        4. Admin **mengaktif/menonaktifkan** entri langsung dari dashboard via **tombol geser (switch toggle)** — tanpa hapus permanen.
        5. Kelas & Sub Kelas **aktif** langsung tersedia sebagai **lookup** di modul Tarif Kamar (A43), Kamar (A16), Bed (A17).

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelas pelayanan terstandar & terpusat | 100% kelas/sub kelas yang dipakai RS terdaftar di master (bukan teks bebas) |
| 2 | Konsistensi lintas modul | 100% modul konsumen (A43/A16/A17) me-refer `class_id` (lookup), bukan teks bebas |
| 3 | Integritas hierarki | 0 sub kelas yang menautkan ke induk non-parent (hierarki maks 2 level terjaga) |
| 4 | Keunikan | 0 duplikasi nama Kelas parent; 0 duplikasi nama Sub Kelas dalam satu Kelas |
| 5 | Kemudahan pengelolaan | Waktu tambah/edit 1 kelas < 1 menit |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) |
|-------------|---------------------|--------------------|
| Pendaftaran Kelas / Sub Kelas | Tambah Kelas (parent) & Sub Kelas (child) via satu form | — |
| Pengelolaan Kelas / Sub Kelas | Ubah data, lihat daftar | Approval berjenjang perubahan master (kolom `approval_status`/`approver_role` disiapkan) |
| Status Aktif/Nonaktif | **Toggle (switch) aktif/nonaktif langsung di dashboard**; tanpa hapus permanen | — |
| Hierarki Parent-Child | Dropdown Kelas hanya menampilkan Kelas parent; Sub Kelas kosong → parent | — |
| Pencarian & Filter | Cari (kelas/sub kelas), filter (status), sorting, pagination | — |
| Lookup ke modul lain | Ekspos Kelas & Sub Kelas **aktif** sebagai lookup untuk A43/A16/A17 | — |

> **Catatan Phasing:** Phase 1 fokus CRUD hierarkis 2 level + pengelolaan status via toggle **tanpa** hapus permanen. Skema data menyediakan kolom `approval_status`/`approver_role` (approval Phase 2) sejak awal agar tidak perlu migrasi skema (lihat §8.1).

**Out of Scope**:

| No | Scope |
|----|-------|
| 1 | **Tarif per kelas/sub kelas** — dikelola Master Data Tarif Kamar (A43). |
| 2 | Penetapan kelas pada kamar/bed — dikelola A16 (Kamar) / A17 (Bed). |
| 3 | Mapping kelas ke terminologi BPJS/SATUSEHAT — modul integrasi terpisah. |
| 4 | Hierarki lebih dari 2 level (Sub-sub kelas) — dibatasi 2 level pada PRD ini. |
| 5 | Impor/ekspor massal data kelas. |

## 5. Related Features

| Code | Menu | Deskripsi Relasi (Teknis / Bisnis) |
|------|------|-------------------------------------|
| **A58** | Master Data > Kelas | **Modul ini** |
| A43 | Master Data > Tarif Kamar | Konsumen — tarif diset per Kelas & Sub Kelas (`class_id`); A58 = sumber daftar kelas/sub kelas. |
| A16 | Master Data > Kamar | Konsumen — kamar mereferensi kelas perawatan. |
| A17 | Master Data > Bed | Konsumen — kelas perawatan bed konsisten dengan master ini. |
| A53 | Admin > RBAC | Menentukan hak akses CRUD & toggle status master kelas. |

## 6. Business Process & User Stories

### 6.1 State Machine — Status Kelas / Sub Kelas (`is_active`)

| Status | Deskripsi | Efek pada Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------------|--------------------|--------------------|
| **Aktif** | Kelas/Sub Kelas berlaku | Muncul sebagai lookup di A43/A16/A17; **tampil di dashboard** | Create → Aktif (default); Aktif → Nonaktif (toggle). **Nonaktifkan Kelas parent → cascade nonaktif seluruh Sub Kelas di bawahnya** | Sama (dengan approval bila diaktifkan) |
| **Nonaktif** | Kelas/Sub Kelas tidak berlaku | **Tidak** muncul sebagai pilihan lookup baru; **tetap tampil di dashboard** (soft delete, histori utuh) | Nonaktif → Aktif (toggle, **1-1 tanpa cascade**). **Sub Kelas hanya bisa diaktifkan bila Kelas induk berstatus aktif** | Sama |

> Master Kelas tidak memiliki stok; kolom "Efek Stok" pada template diadaptasi menjadi **Efek pada Modul Konsumen**. **Tidak ada hard-delete** — entri hanya dinonaktifkan (soft delete via `is_active`). **Aturan status berjenjang (BR-006):** menonaktifkan Kelas parent **otomatis menonaktifkan seluruh Sub Kelas** di bawahnya (cascade nonaktif); sebaliknya **pengaktifan bersifat 1-1** (tidak cascade) — mengaktifkan Sub Kelas **memerlukan Kelas induk aktif**, bila induk nonaktif maka aktivasi Sub Kelas ditolak.

### 6.2 User Stories Utama

Prioritas: **P0** Critical/MVP · **P1** Must Have · **P2** Should Have · **P3** Low · **P4** Enhancement.

* **US-001** — Sebagai **Admin Control Panel**, saya ingin menambah **Kelas** baru (mis. I, II, III, VIP), agar daftar kelas pelayanan terstandar.
* **US-002** — Sebagai **Admin**, saya ingin menambah **Sub Kelas** (mis. VIP A/B dari VIP) dengan memilih Kelas induk dari dropdown, agar variasi kelas terkelola rapi.
* **US-003** — Sebagai **Admin**, saya ingin mengedit Kelas/Sub Kelas, agar penamaan selalu akurat.
* **US-004** — Sebagai **Admin**, saya ingin **menggeser status aktif/nonaktif** langsung dari dashboard (tanpa menghapus), agar referensi di modul lain tetap utuh.
* **US-005** — Sebagai **Admin**, saya ingin melihat daftar Kelas & Sub Kelas dengan pencarian/filter, agar cepat menemukan entri tertentu.
* **US-006** — Sebagai **Admin Tarif/Kamar (konsumen)**, saya ingin memilih Kelas & Sub Kelas dari daftar baku (bukan teks bebas), agar data konsisten lintas modul.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Dashboard / Daftar Kelas**
* **User Story**: Sebagai Admin, saya ingin melihat daftar Kelas & Sub Kelas beserta statusnya, agar kelas pelayanan terpantau & mudah dikelola. *(US-005)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Menu Master Data → Kelas menampilkan dashboard dengan kolom **Kelas**, **Sub Kelas**, dan **Aksi**.
    * **AC 2**: Kolom **Aksi** memuat **switch toggle Aktif/Nonaktif** per baris (dan tombol Edit).
    * **AC 3**: Untuk baris Kelas parent, kolom **Sub Kelas** menampilkan **"-"**; untuk baris Sub Kelas, kolom **Kelas** menampilkan nama Kelas induknya.
    * **AC 4**: List menampilkan entri **aktif maupun nonaktif** (nonaktif tidak disembunyikan, ditandai badge/warna berbeda).
    * **AC 5**: Pencarian (kelas/sub kelas), filter (status), sorting, dan pagination berfungsi.
    * **AC 6**: Tombol **+ Tambah** tersedia untuk menambah data baru.

---

**Fitur: Tambah Kelas / Sub Kelas**
* **User Story**: Sebagai Admin, saya ingin menambah Kelas (parent) atau Sub Kelas (child) melalui satu form, agar pengelolaan sederhana. *(US-001, US-002)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memiliki field **Kelas** dan **Sub Kelas** (spesifikasi di §8.3.1).
    * **AC 2**: **Jika Sub Kelas kosong** → record disimpan sebagai **Kelas induk (Parent)** (`parent_id = null`).
    * **AC 3**: **Jika Sub Kelas terisi** → record disimpan sebagai **Sub Kelas** di bawah Kelas terpilih (`parent_id` = id Kelas parent).
    * **AC 4**: **Dropdown pemilihan Kelas** (saat mengisi Sub Kelas) **hanya menampilkan Kelas parent** yang aktif — bukan Sub Kelas (BR-002).
    * **AC 5**: Nama Kelas parent unik; nama Sub Kelas unik dalam satu Kelas induk (BR-004).
    * **AC 6**: Status di-set **AKTIF** oleh sistem — tanpa input status di form create.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kelas | Combobox (dropdown parent + input baru) | Required | "Kelas wajib diisi/dipilih." | "Pilih Kelas induk atau ketik Kelas baru (mis. VIP)" |
  | Kelas | Combobox | Nama Kelas parent unik (saat buat parent baru) | "Kelas '{nama}' sudah terdaftar." | — |
  | Sub Kelas | Text | Optional; unik dalam Kelas induk; kosong = Kelas jadi Parent | "Sub Kelas '{nama}' sudah ada pada Kelas {kelas}." | "Kosongkan bila ini Kelas induk. Isi bila membuat sub kelas (mis. VIP A)" |

---

**Fitur: Ubah Kelas / Sub Kelas**
* **User Story**: Sebagai Admin, saya ingin mengedit data Kelas/Sub Kelas, agar penamaan selalu akurat. *(US-003)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Klik **Edit** menampilkan form berisi data existing (Kelas, Sub Kelas).
    * **AC 2**: Perubahan tersimpan; validasi keunikan & aturan hierarki (dropdown Kelas = parent saja) tetap berlaku.
    * **AC 3**: Mengubah Kelas induk sebuah Sub Kelas hanya boleh memilih Kelas parent lain (bukan sub kelas) — hierarki tetap 2 level (BR-001).

---

**Fitur: Kelola Status Aktif/Nonaktif (Toggle di Dashboard)**
* **User Story**: Sebagai Admin, saya ingin menggeser status aktif/nonaktif langsung dari dashboard tanpa menghapus, agar referensi di modul lain tetap utuh. *(US-004)*
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap baris memiliki **switch toggle** Aktif ⇄ Nonaktif pada kolom Aksi.
    * **AC 2**: Menggeser toggle langsung memperbarui `is_active` **tanpa** menghapus data (soft delete).
    * **AC 3**: Entri nonaktif **tetap tampil di dashboard**, namun **tidak** muncul sebagai pilihan lookup baru di modul konsumen (BR-005).
    * **AC 4 (Cascade nonaktif)**: Menonaktifkan **Kelas parent** otomatis **menonaktifkan seluruh Sub Kelas** di bawahnya (dengan konfirmasi) — BR-006.
    * **AC 5 (Aktivasi 1-1)**: Pengaktifan bersifat **satu per satu (tidak cascade)** — mengaktifkan Kelas parent **tidak** otomatis mengaktifkan Sub Kelasnya.
    * **AC 6 (Validasi aktivasi Sub Kelas)**: Mengaktifkan **Sub Kelas** hanya berhasil bila **Kelas induk berstatus aktif**; bila induk nonaktif → **aktivasi ditolak** dengan pesan jelas (BR-006).
    * **AC 7**: **Tidak ada** aksi hapus permanen di UI — hanya aktif/nonaktif.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Aksi | Rules | Konfirmasi/Error Message |
  |------|-------|--------------------------|
  | Nonaktifkan **Kelas parent** yang punya Sub Kelas aktif | Cascade nonaktif; minta konfirmasi | "Menonaktifkan Kelas ini akan **menonaktifkan {n} Sub Kelas** di bawahnya. Lanjutkan?" → Lanjut/Kembali |
  | Aktifkan **Sub Kelas** saat Kelas induk nonaktif | Tolak aktivasi | "Sub Kelas tidak dapat diaktifkan karena Kelas induk '{kelas}' berstatus nonaktif. Aktifkan Kelas induk terlebih dahulu." |
  | Nonaktifkan kelas/sub kelas dipakai modul lain | Cegah hapus permanen; minta konfirmasi | "Kelas/Sub Kelas ini masih dipakai pada data aktif. Menonaktifkan hanya mencegah pemakaian baru; data lama tetap utuh." → Lanjut/Kembali |

---

**Fitur: Lookup Kelas untuk Modul Lain**
* **User Story**: Sebagai Admin Tarif/Kamar, saya ingin memilih Kelas & Sub Kelas dari daftar baku, agar data konsisten lintas modul. *(US-006)*
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Modul A43/A16/A17 dapat menarik daftar Kelas & Sub Kelas **aktif** via `class_id` (BR-005).
    * **AC 2**: Lookup dapat menampilkan struktur berjenjang (Kelas → Sub Kelas); entri nonaktif tidak muncul untuk pilihan baru namun tetap tampil pada data lama yang sudah mereferensikannya.

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `service_classes`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `name`: Varchar(50) — nama entri: **nama Kelas** bila parent, **nama Sub Kelas** bila child (mis. "VIP" atau "VIP A")
    * `parent_id`: UUID (FK → `service_classes.id`, nullable) — **NULL = Kelas induk (Parent)**; **NOT NULL = Sub Kelas** (menunjuk Kelas induk)
    * `is_active`: Boolean (default `true`)
    * `created_by`, `updated_by`: UUID (FK → `users.id`)
    * `created_at`, `updated_at`: Timestamp
    * `deleted_at`: Timestamp (nullable) — hanya soft delete; **tidak** dipakai untuk hapus permanen dari UI
    * *(Phase 2-ready, belum diaktifkan)* `approval_status`: Enum (nullable) · `approver_role`: Varchar (nullable)
* **Constraints**:
    * `UNIQUE(name, parent_id) WHERE deleted_at IS NULL` — nama unik dalam scope induk yang sama (nama Kelas parent unik antar parent; nama Sub Kelas unik dalam satu Kelas induk) — BR-004.
    * **Hierarki maks 2 level**: `parent_id` hanya boleh menunjuk baris dengan `parent_id IS NULL` (Kelas parent). Sub Kelas tidak boleh menjadi induk (BR-001/002).
    * `CHECK (parent_id <> id)` — cegah self-reference.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/service-classes` | List Kelas & Sub Kelas (filter: `is_active`, `search`, `sort`, `page`, `per_page`) — **menampilkan aktif & nonaktif**; dukung struktur berjenjang |
| GET | `/api/v1/service-classes/parents` | List **Kelas parent aktif** saja — untuk **dropdown pemilihan Kelas** (BR-002) |
| POST | `/api/v1/service-classes` | Create Kelas (parent, `parent_id` null) atau Sub Kelas (`parent_id` diisi); status = AKTIF |
| GET | `/api/v1/service-classes/{id}` | Detail entri |
| PUT | `/api/v1/service-classes/{id}` | Update Kelas/Sub Kelas |
| PATCH | `/api/v1/service-classes/{id}/status` | **Toggle Aktif/Nonaktif** (dari switch di dashboard) |
| GET | `/api/v1/service-classes/lookup` | Lookup Kelas & Sub Kelas **aktif** untuk modul A43/A16/A17 (BR-005) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| class (parent) | Kelas | Combobox (dropdown parent + input baru) | Ya | Nama Kelas parent unik (bila buat parent baru). Saat mengisi Sub Kelas, **dropdown hanya menampilkan Kelas parent aktif** | manual / lookup parents (`/service-classes/parents`) | mis. I, II, III, VIP. Menentukan `parent_id` bila diikuti Sub Kelas (BR-002) |
| sub_class | Sub Kelas | Text Input | Tidak | Max 50 char; unik dalam satu Kelas induk. **Kosong → record menjadi Kelas parent** | manual | Diisi **nama penuh** (mis. "VIP A", "VIP B" dari VIP; "I A" dari I) dan disimpan apa adanya di `name`. Terisi → record = Sub Kelas (BR-003) |

> **Aturan hierarki (BR-001/002/003):**
> * **Sub Kelas kosong** → sistem menyimpan **Kelas induk (Parent)**: `name` = nilai field Kelas, `parent_id = null`.
> * **Sub Kelas terisi** → sistem menyimpan **Sub Kelas**: `name` = nilai field Sub Kelas, `parent_id` = id Kelas yang dipilih pada dropdown (parent).
> * **Dropdown Kelas hanya menampilkan Kelas parent** (`parent_id IS NULL` & aktif) — sub kelas tidak dapat menjadi induk.
>
> **Catatan status behavior**: Tidak ada input Status di form **create** — status di-set **AKTIF** oleh sistem; pengelolaan Aktif/Nonaktif via **switch toggle di dashboard**.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (Dashboard / List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kelas | `parent_id IS NULL ? name : parent.name` | text | Sort (default A-Z); Search | Untuk baris Sub Kelas menampilkan nama Kelas induknya |
| Sub Kelas | `parent_id IS NULL ? "-" : name` | text | Search | **"-"** untuk baris Kelas parent |
| Aksi | `is_active` + operasi | **Switch toggle (Aktif/Nonaktif)** + tombol Edit | Filter (status) | Toggle langsung mengubah status; **tanpa** aksi hapus permanen; entri nonaktif tetap tampil (badge abu) |

> Contoh isi dashboard:
>
> | Kelas | Sub Kelas | Aksi |
> |-------|-----------|------|
> | I | - | [switch: Aktif] [Edit] |
> | I | I A | [switch: Aktif] [Edit] |
> | II | - | [switch: Aktif] [Edit] |
> | III | - | [switch: Aktif] [Edit] |
> | VIP | - | [switch: Aktif] [Edit] |
> | VIP | VIP A | [switch: Aktif] [Edit] |
> | VIP | VIP B | [switch: Nonaktif] [Edit] |

#### 8.3.3 Business Rules

* **BR-001** — Hierarki dibatasi **2 level**: **Kelas (parent)** → **Sub Kelas (child)**. Sub Kelas tidak boleh memiliki turunan (tidak boleh menjadi induk).
* **BR-002** — **Dropdown pemilihan Kelas** (saat menambah/mengubah Sub Kelas) hanya menampilkan **Kelas parent** (`parent_id IS NULL`) yang **aktif**.
* **BR-003** — Pada form Tambah/Edit: **Sub Kelas kosong → record menjadi Kelas induk (Parent)**; Sub Kelas terisi → record menjadi Sub Kelas di bawah Kelas terpilih.
* **BR-004** — **Keunikan**: nama Kelas parent unik antar parent; nama Sub Kelas unik dalam satu Kelas induk (`UNIQUE(name, parent_id)`).
* **BR-005** — Hanya entri `is_active = true` yang muncul sebagai **lookup** di modul konsumen (A43/A16/A17). Entri nonaktif **tetap tampil di dashboard** master, namun tidak dapat dipilih untuk data baru.
* **BR-006 (Status berjenjang)** —
    * **Nonaktif cascade**: menonaktifkan **Kelas parent** otomatis menonaktifkan **seluruh Sub Kelas** di bawahnya.
    * **Aktivasi 1-1**: pengaktifan bersifat satu per satu (tidak cascade) — mengaktifkan Kelas parent **tidak** otomatis mengaktifkan Sub Kelasnya.
    * **Validasi aktivasi Sub Kelas**: Sub Kelas hanya dapat diaktifkan bila **Kelas induk aktif**; bila induk nonaktif → aktivasi Sub Kelas **ditolak**.
* **BR-007** — **Tidak ada hapus permanen**; entri hanya dinonaktifkan (soft delete via `is_active`) demi integritas referensi modul konsumen.
* **BR-008** — Hanya role dengan hak akses Master Data Control Panel (RBAC A53) yang boleh CRUD & toggle status.

## 9. Workflow / BPMN Interpretation

> Modul A58 **belum punya BPMN sendiri**. Alur diturunkan dari pola master data hierarkis (mis. sub kelas pada A43 Tarif Kamar) dan pola master data + toggle status pada master lain. Bagian turunan ditandai `[ASUMSI]`.

**Skenario 1 — Tambah Kelas induk (Parent)**
1. Admin buka **Master Data > Kelas** → klik **+ Tambah**.
2. Isi field **Kelas** (mis. "VIP"), **kosongkan Sub Kelas** → **SIMPAN**.
3. Sistem validasi keunikan nama Kelas parent.
   * **Gateway — Nama sudah ada?** Ya → error "Kelas sudah terdaftar"; Tidak → lanjut.
4. Tersimpan sebagai Kelas parent (`parent_id = null`), status **Aktif** → muncul di dashboard (Sub Kelas = "-").

**Skenario 2 — Tambah Sub Kelas**
1. Admin klik **+ Tambah** → pada field **Kelas**, pilih Kelas induk dari **dropdown (hanya parent, mis. VIP)**.
2. Isi field **Sub Kelas** (mis. "VIP A") → **SIMPAN**.
3. Sistem validasi keunikan Sub Kelas dalam Kelas induk & konsistensi hierarki (induk harus parent).
4. Tersimpan sebagai Sub Kelas (`parent_id` = id VIP), status **Aktif** → muncul di dashboard (Kelas = "VIP", Sub Kelas = "VIP A").

**Skenario 3 — Toggle Aktif/Nonaktif**
1. Admin **geser switch** pada baris Kelas/Sub Kelas di dashboard.
2. **Nonaktifkan Kelas parent**:
   * **Gateway — Punya Sub Kelas aktif?** Ya → konfirmasi "akan menonaktifkan {n} Sub Kelas" → bila lanjut, **cascade nonaktif** parent + seluruh Sub Kelasnya.
3. **Aktifkan Sub Kelas** (1-1):
   * **Gateway — Kelas induk aktif?** Tidak → **tolak** aktivasi + pesan "aktifkan Kelas induk dahulu"; Ya → Sub Kelas aktif.
4. **Aktifkan Kelas parent**: hanya mengaktifkan parent itu sendiri (tidak cascade ke Sub Kelas; Sub Kelas diaktifkan satu per satu).
5. Entri nonaktif **tetap tampil di dashboard** (badge abu), tidak muncul di lookup pilihan baru.

**Skenario 4 — Konsumsi oleh modul lain**
1. Modul Tarif Kamar (A43) / Kamar (A16) / Bed (A17) memanggil lookup Kelas & Sub Kelas **aktif** → pilih → simpan `class_id`.

---

## Lampiran — Asumsi & Pertanyaan Terbuka

**Asumsi & Keputusan Desain**
* `[ASUMSI]` Modul A58 belum punya BPMN sendiri; alur diturunkan dari pola master data hierarkis & toggle status.
* `[ASUMSI]` "Kelas pelayanan" = klasifikasi kelas perawatan RS (I/II/III/VIP/VVIP + variasi sub kelas seperti VIP A/B).
* Hierarki dibatasi **2 level** (Kelas → Sub Kelas); sub-sub kelas di luar cakupan.
* **Nama Sub Kelas disimpan sebagai nilai penuh** (mis. "VIP A") pada kolom `name` — bukan sufiks.
* **Status berjenjang**: menonaktifkan Kelas parent → **cascade nonaktif** ke seluruh Sub Kelas; pengaktifan **1-1** (tidak cascade); mengaktifkan Sub Kelas **memerlukan Kelas induk aktif** (bila induk nonaktif → ditolak).
* Untuk saat ini **tidak ada atribut tambahan** selain Kelas & Sub Kelas (tanpa kode kelas/keterangan/urutan tampil).
* Nonaktivasi (soft delete) dipilih agar referensi di modul konsumen tetap utuh; tidak ada hapus permanen.

**Pertanyaan Terbuka**
* Apakah perlu mapping Kelas ke terminologi BPJS (kelas rawat 1/2/3) untuk klaim? (di luar cakupan saat ini)
* Hak akses (role) mana yang boleh CRUD & toggle status master Kelas? (relasi A53 RBAC)
