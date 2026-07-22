# Product Requirement Document (PRD) — Master Data Anjuran Sukon (Anjuran Surat Kontrol)

**Kode Fitur:** A30 — Control Panel > Master Data > Anjuran Sukon

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — *belum ditandatangani*
* **Related Documents**:
    * List Fitur V2.xlsx (sheet MVP) — A30 Control Panel > Master Data > Anjuran Sukon
    * PRD Konsep — Master Data Anjuran Sukon v1.7 (`result/A30_prd-master-data-anjuran-sukon/prd-master-data-anjuran-sukon.md`) — sumber konsep utuh PRD ini
    * PRD Formulir Surat Kontrol (Sukon) — *konsumen utama; kode fitur dikosongkan dulu atas keputusan user, akan dilengkapi saat List Fitur final*
    * A1 — Master Data > User (sumber `created_by`/`updated_by`)
    * Tidak ada BPMN khusus untuk modul ini.
* **Document Version**:
    * 2 Juli 2026 — **v2.0 (template)** — Penyusunan ulang PRD konsep v1.7 ke format template standar. **Selaras penuh dengan konsep v1.7**: pengelolaan master dilakukan **sepenuhnya inline** dari Formulir Surat Kontrol; **tidak ada halaman kelola/menu administrasi terpisah**; anti-duplikasi ternormalisasi tekstual (tanpa sinonim), soft delete, master global, snapshot historis, dan **audit dasar** (tanpa versioning/RBAC/approval). Menambahkan rekomendasi skema DB & endpoint API (English) sesuai template.

---

## 2. Overview & Background

### Overview / Brief Summary

**Master Data Anjuran Sukon** adalah kumpulan teks **anjuran kontrol standar** yang dapat digunakan ulang (*reusable*) ketika dokter/petugas mengisi field **Anjuran** pada **Formulir Surat Kontrol** (Sukon). Contoh anjuran: *"Kontrol sesuai jadwal"*, *"Kontrol jika ada keluhan"*, *"Lakukan pemeriksaan lab sebelum kunjungan berikutnya"*.

Berbeda dengan master data konvensional yang dikelola via menu administrasi terpisah, master data ini dikelola **inline** — langsung dari dalam formulir saat surat kontrol sedang disusun. Field Anjuran disajikan sebagai **dropdown yang dapat dicari** (*searchable combobox*). Dari field ini user dapat:
* **Memilih** anjuran yang sudah tersimpan;
* **Menambah baru** (aksi *Tambah Baru*) tanpa berpindah menu — kolom isian menampilkan opsi mengetik anjuran baru atau memilih dari daftar yang sudah ada;
* **Mengubah** dan **menghapus** tiap item langsung dari daftar.

Karakteristik utama:
* **Global**: seluruh dokter & unit berbagi daftar yang sama → konsistensi redaksi se-RS.
* **Anti-duplikasi**: setiap tambah/ubah divalidasi dengan **pencocokan ternormalisasi** (case-insensitive, trim, normalisasi spasi, hapus tanda baca ujung). Normalisasi **tidak menyentuh sinonim/parafrase** — dua kalimat bermakna sama tapi beda kata tetap dianggap entri berbeda (BR-01).

Tujuan: mempercepat dokumentasi tindak lanjut pasien, menjaga konsistensi redaksi antar dokter/kunjungan, dan meningkatkan kualitas data rekam medis — khususnya pada **RS Tipe C & D** yang sumber daya administratifnya terbatas.

> **Catatan scope (MVP):** Pengelolaan master dilakukan **sepenuhnya inline** dari formulir; **menu administrasi/halaman kelola terpisah tidak disediakan**.

### Business Process (As-Is vs To-Be)

* **As-Is (baseline tanpa fitur):** Setelah pemeriksaan, dokter menerbitkan surat kontrol berisi anjuran tindak lanjut. Tanpa master data anjuran, user **mengetik ulang manual** di setiap surat kontrol → pengisian lambat (terutama saat volume pasien tinggi), **redaksi tidak konsisten**, dan **rentan salah ketik** yang menurunkan kualitas data serta menyulitkan pelaporan. RS Tipe C & D umumnya **tidak punya petugas khusus** penyiapan master data terpusat.

* **To-Be (solusi digital — inline/self-service):** Field Anjuran pada Formulir Surat Kontrol menjadi **searchable combobox** yang membaca **Master Data Anjuran Sukon global**. Dokter mengetik kata kunci → sistem menampilkan anjuran **aktif** yang cocok → dokter **memilih** (jalur utama). Bila tidak ada yang cocok, dokter **Tambah Baru** langsung dari formulir (dengan saran existing ditampilkan); sistem menjalankan **normalisasi tekstual + cek duplikat** lalu menyimpan ke master global dan otomatis memilihnya. **Ubah** dan **Hapus (soft delete)** item juga dilakukan inline dari daftar. Master dibangun **bertahap/organik** oleh dokter/petugas sesuai kebutuhan nyata — **tanpa proses setup terpusat dan tanpa menu administrasi terpisah**.

> **Penegasan proses (keputusan user):** Untuk modul ini **As-Is = To-Be** — pendekatan inline adalah desain proses yang berlaku, sehingga tidak ada perubahan proses. PRD mendokumentasikan alur yang berjalan. Skenario "ketik manual" di atas adalah **baseline historis tanpa fitur**, bukan As-Is modul ini.

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Rata-rata waktu mengisi field Anjuran per surat kontrol | Turun ≥50% vs ketik manual *[ASUMSI baseline ditetapkan saat go-live]* |
| 2 | % anjuran dipilih dari daftar existing vs dibuat baru | ≥70% pilih existing setelah 1 bulan |
| 3 | Jumlah entri master duplikat (ternormalisasi tekstual) | 0 duplikat tekstual |
| 4 | % surat kontrol dengan field anjuran terisi & valid | ≥95% |
| 5 | Jumlah anjuran unik yang terbentuk organik | Tumbuh stabil lalu mendatar (kurva jenuh) |

> Target "0 duplikat" hanya menjamin tidak ada duplikat **tekstual** (sesudah normalisasi dasar). Duplikat **semantik/sinonim** tidak diukur sebagai pelanggaran karena di luar scope normalisasi (keputusan user). Metrik baseline ditetapkan saat go-live; angka indikatif untuk RS Tipe C & D.

---

## 4. Scope Definition & Phasing

> **Catatan phasing:** Modul ini adalah master data ringan berbasis teks yang dibangun organik. Sesuai keputusan user pada konsep v1.7, **tidak ada approval berjenjang, versioning, maupun RBAC** yang direncanakan. Karena itu Phase 2 **kosong (tidak direncanakan)** — seluruh kebutuhan tuntas di Phase 1 (MVP CRUD inline).

| Fitur/Modul | Phase 1 (MVP: CRUD inline) | Phase 2 (Advanced) |
|-------------|----------------------------|--------------------|
| Field Anjuran (searchable combobox inline) | Cari + pilih anjuran aktif dari master global (server-side, debounce, limit). | *Tidak direncanakan.* |
| Tambah Baru (inline) | Buat anjuran baru dari formulir; saran existing ditampilkan saat mengetik; auto-select setelah simpan. | *Tidak direncanakan.* |
| Ubah (inline) | Edit teks anjuran pada item daftar → validasi anti-duplikasi diulang → simpan global. | *Tidak direncanakan.* |
| Hapus (soft delete, inline) | Non-aktifkan item (`is_active=false`) dengan konfirmasi; item hilang dari pemakaian baru. | *Tidak direncanakan.* |
| Validasi anti-duplikasi | Normalisasi tekstual + cek duplikat pada tambah & ubah (tanpa sinonim). | — |
| Master global | Satu master dipakai bersama lintas dokter/unit. | — |
| Audit dasar | `created_by/created_at/updated_by/updated_at` pada setiap perubahan (kondisi terakhir saja). | *Riwayat/versioning nilai — tidak direncanakan (keputusan user).* |
| Integritas historis | Snapshot teks anjuran ke dokumen surat kontrol saat terbit. | — |

**Out of Scope**:
1. Pengisian/penerbitan **Formulir Surat Kontrol** itu sendiri (modul terpisah) — di sini hanya perilaku field Anjuran.
2. **Halaman kelola / menu administrasi Master Data Anjuran terpisah** di Control Panel — **tidak diperlukan** pada MVP. Seluruh pengelolaan (tambah/ubah/hapus/cari) dilakukan **inline** dari dalam formulir. *[PERLU KONFIRMASI: bila kelak dibutuhkan menu audit/cleanup khusus]*
3. **Deteksi duplikat berbasis sinonim/semantik** — normalisasi hanya tekstual; anjuran bermakna sama dengan redaksi berbeda dibiarkan sebagai entri terpisah. (Keputusan user.)
4. Integrasi terminologi eksternal (SATUSEHAT/BPJS) untuk anjuran — anjuran bersifat teks bebas terstandardisasi internal, bukan kode. *[ASUMSI]*
5. **Versioning/riwayat perubahan teks anjuran** — tidak dibuat; cukup audit dasar (siapa & kapan terakhir mengubah). (Keputusan user.)
6. **Approval berjenjang & RBAC** pengelolaan anjuran — tidak direncanakan (keputusan user; BR-007/NFR-006 lama sudah dihapus pada konsep).
7. **Hard delete** data master — hanya soft delete.

---

## 5. Related Features

* **A1 — Master Data > User**: sumber referensi audit dasar. Field `created_by`/`updated_by` pada master anjuran mengacu ke user pada A1. Relasi teknis: `control_advice.created_by/updated_by` → `user.id`. Relasi bisnis: menentukan **siapa** yang membuat/mengubah/menonaktifkan anjuran untuk penelusuran audit dasar.
* **Formulir Surat Kontrol (Sukon)** — *konsumen utama; kode fitur dikosongkan dulu atas keputusan user*: field **Anjuran** memanggil master ini (combobox + Tambah Baru inline) dan **men-snapshot** teks anjuran saat surat kontrol diterbitkan. Ketiadaan kode fitur bukan blocker pembangunan A30; akan dilengkapi saat List Fitur final.

---

## 6. Business Process & User Stories

### State Machine Table

Entitas anjuran memiliki state utama `is_active` (aktif/nonaktif). Tidak ada state approval (keputusan user).

| Status | Deskripsi | Efek pada Formulir Surat Kontrol | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|----------------------------------|--------------------|--------------------|
| **AKTIF** | Anjuran tersedia untuk dipilih & disarankan. | Muncul di combobox pemakaian baru. | → NONAKTIF (aksi *Hapus* = soft delete) | *(tidak ada perubahan)* |
| **NONAKTIF** | Soft-deleted; tidak dipakai lagi untuk surat baru. | **Tidak** muncul di combobox pemakaian baru; tetap terbaca pada dokumen lama (snapshot). | *(tetap; tanpa halaman kelola khusus, tidak ada aksi reactivate inline pada MVP)* | *(tidak ada perubahan)* |

> Sesuai panduan template: **status tidak diinput di form create** — entri baru selalu diset **AKTIF** oleh sistem. Penonaktifan dilakukan lewat aksi **Hapus (soft delete)** inline pada daftar combobox.

### User Stories Utama

* **US-01** — Sebagai **Dokter (DPJP)**, saya ingin **mencari & memilih anjuran yang sudah ada** dari dropdown, agar tidak perlu mengetik ulang dan pengisian lebih cepat.
* **US-02** — Sebagai **Dokter**, saya ingin **menambah anjuran baru langsung dari formulir** tanpa pindah menu, agar dapat mendokumentasikan tindak lanjut yang belum ada di daftar.
* **US-03** — Sebagai **Dokter**, saat menambah anjuran baru saya ingin **melihat daftar yang sudah ada (saran)**, agar cenderung memilih ulang dan menghindari duplikasi.
* **US-04** — Sebagai **Sistem/Petugas**, saya ingin **validasi anti-duplikasi tekstual otomatis**, agar master tetap bersih dari duplikat persis (catatan: sinonim tidak dicek).
* **US-05** — Sebagai **Dokter**, saya ingin **mengubah** teks anjuran, agar redaksi yang keliru dapat diperbaiki untuk pemakaian berikutnya.
* **US-06** — Sebagai **Dokter**, saya ingin **menghapus (soft delete)** anjuran yang tidak relevan **tanpa merusak surat kontrol lama**, agar daftar tetap ringkas.
* **US-07** — Sebagai **Manajemen**, saya ingin **konsistensi redaksi anjuran** lintas dokter/kunjungan, agar pelaporan & analisis data RM lebih akurat.
* **US-08** — Sebagai **Admin/Manajemen**, saya ingin **mengetahui siapa & kapan** sebuah anjuran terakhir dibuat/diubah/dinonaktifkan (audit dasar), agar perubahan master dapat ditelusuri tanpa perlu riwayat versi penuh.

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Searchable Combobox Anjuran (inline pada Formulir Surat Kontrol) — FR-001**
* **User Story**: Sebagai Dokter, saya ingin mencari & memilih anjuran aktif dari dropdown, agar pengisian cepat dan konsisten.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Field Anjuran berupa **searchable combobox** yang menampilkan **hanya anjuran AKTIF** (global) dengan pencarian **server-side** (debounce, limit hasil).
    * **AC 2**: Memilih item langsung mengisi field; combobox dapat dioperasikan dengan **keyboard** (panah + Enter).
    * **AC 3**: Item **NONAKTIF tidak muncul** pada hasil pencarian pemakaian baru (BR-05).
    * **AC 4**: Hasil combobox tampil **≤500 ms** untuk master ≤10.000 entri (NFR-001).

---

**Fitur: Tambah Baru Anjuran (inline) — FR-002, FR-003, FR-004**
* **User Story**: Sebagai Dokter, saya ingin menambah anjuran baru langsung dari formulir sambil melihat saran existing, agar tidak pindah menu dan tidak membuat duplikat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Aksi **Tambah Baru** membuka kolom isian inline yang **tetap menampilkan saran/daftar existing** yang mirip saat user mengetik (FR-002).
    * **AC 2**: Saat **Simpan**, sistem menjalankan **normalisasi tekstual** (trim → lowercase → collapse spasi → hapus tanda baca ujung) lalu **cek duplikat** terhadap entri **aktif** (FR-003, BR-01).
    * **AC 3**: Jika **duplikat tekstual ditemukan**, sistem **memblok simpan**, menampilkan entri existing, dan menyarankan memilih entri tersebut (FR-003).
    * **AC 4**: Jika **tidak duplikat** (termasuk kasus sinonim/redaksi berbeda — sengaja tidak diblok), anjuran **tersimpan ke master global** (`is_active=true`, audit dasar dicatat) dan **otomatis terpilih** pada field yang sedang diisi (FR-004, BR-02/06).
    * **AC 5**: Panjang teks anjuran divalidasi **3–255 karakter** (final).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Teks Anjuran | Text | Required, Min 3, Max 255 | "Teks anjuran wajib diisi (3–255 karakter)." | "Contoh: Kontrol sesuai jadwal / Kontrol jika ada keluhan." |
  | Teks Anjuran | Text | Unik ternormalisasi (tekstual) | "Anjuran serupa sudah ada. Silakan pilih entri yang tersedia." | "Sistem mencocokkan teks (bukan makna). Sinonim tidak terdeteksi otomatis." |

---

**Fitur: Ubah Anjuran (inline) — FR-005**
* **User Story**: Sebagai Dokter, saya ingin mengubah teks anjuran yang keliru, agar redaksi diperbaiki untuk pemakaian berikutnya tanpa mengubah surat kontrol lama.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Aksi **Ubah** pada item mengedit teks → **validasi anti-duplikasi diulang** (FR-003) → simpan **global**.
    * **AC 2**: Perubahan **tidak mengubah** surat kontrol yang sudah terbit (BR-03).

---

**Fitur: Hapus Anjuran (soft delete, inline) — FR-006**
* **User Story**: Sebagai Dokter, saya ingin menghapus anjuran tidak relevan tanpa merusak surat kontrol lama, agar daftar tetap ringkas.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Aksi **Hapus** = **soft delete** (`is_active=false`) dengan **konfirmasi**.
    * **AC 2**: Item hilang dari pemakaian baru; **data lama tetap utuh** (BR-03/04/05).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Hapus (soft delete) | Konfirmasi | Wajib konfirmasi | "Nonaktifkan anjuran ini? Surat kontrol lama tetap utuh." | "Non-aktif = tidak muncul untuk surat baru; dokumen lama tidak berubah." |

---

**Fitur: Snapshot Teks Anjuran ke Surat Kontrol — FR-008**
* **User Story**: Sebagai Sistem, saya ingin men-snapshot teks anjuran ke dokumen saat surat kontrol terbit, agar perubahan/penonaktifan master tidak mengubah dokumen lama.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Saat surat kontrol **diterbitkan**, teks anjuran disalin sebagai **snapshot** ke dokumen (BR-03) *[ASUMSI]*.
    * **AC 2**: Operasi **Ubah/Hapus** pada master **tidak mengubah** snapshot dokumen yang sudah terbit.

---

**Fitur: Audit Dasar — FR-010**
* **User Story**: Sebagai Admin/Manajemen, saya ingin mengetahui siapa & kapan anjuran terakhir dibuat/diubah/dinonaktifkan, agar perubahan master dapat ditelusuri.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap tambah/ubah/hapus mencatat `created_by`, `created_at`, `updated_by`, `updated_at` — **kondisi terakhir saja**.
    * **AC 2**: **Tidak** menyimpan riwayat/versi nilai sebelumnya (keputusan user).

> Catatan penomoran FR mengikuti konsep v1.7: **FR-007 & FR-009 sengaja dikosongkan** (dihapus pada revisi konsep) agar ID lain tetap stabil.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `control_advice` (Master Data Anjuran Sukon — entitas konsep: `master_anjuran_sukon`)
* **Key Columns**:
    * `id`: UUID (Primary Key) — konsep: `anjuran_id`
    * `advice_text`: VARCHAR(255) NOT NULL — teks anjuran (3–255 char); konsep: `teks_anjuran`
    * `normalized_text`: VARCHAR(255) NOT NULL — derived (trim + lowercase + collapse spasi + hapus tanda baca ujung); konsep: `teks_normal`. **UNIQUE INDEX** untuk cegah duplikat balapan (race)
    * `description`: VARCHAR(255) NULL — keterangan opsional; konsep: `keterangan`
    * `is_active`: Boolean (default **true**) — soft delete via `false`; konsep: `status_aktif`
    * `created_by`: UUID NOT NULL — FK → `user.id` (A1)
    * `created_at`: TIMESTAMP NOT NULL (default now)
    * `updated_by`: UUID NULL — FK → `user.id` (A1)
    * `updated_at`: TIMESTAMP NULL
* **Index**: `UNIQUE(normalized_text)` (NFR-003 — cegah duplikat balapan), index pada `is_active`, index pada `normalized_text` untuk pencarian `LIKE`.

> **Tanpa** kolom approval/RBAC/versioning — sesuai keputusan user (BR-007/NFR-006 lama telah dihapus pada konsep; tidak ada tabel riwayat versi).
>
> **Snapshot** ada di sisi tabel dokumen surat kontrol (modul terpisah, out of scope), mis. `surat_kontrol.advice_text_snapshot VARCHAR(255)` yang menyalin `control_advice.advice_text` saat terbit — dicatat di sini untuk keselarasan (FR-008/BR-03).

### 8.2 API Endpoint Recommendations

*Seluruh endpoint dipanggil **inline** oleh combobox Formulir Surat Kontrol — tidak ada UI admin terpisah.*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/control-advices?search=&limit=` | Cari anjuran **aktif** (server-side, debounce) untuk combobox & saran Tambah Baru. |
| POST | `/api/v1/control-advices` | Create anjuran baru. Jalankan normalisasi + cek duplikat; **409 Conflict** + entri existing bila duplikat tekstual. Status selalu diset `is_active=true`. |
| PATCH | `/api/v1/control-advices/:id` | Ubah `advice_text`/`description`. Ulangi validasi anti-duplikasi. Tidak mengubah snapshot dokumen lama. |
| PATCH | `/api/v1/control-advices/:id/status` | Hapus (soft delete) — set `is_active=false` dengan konfirmasi. Body: `{ is_active: false }`. |

> **Tanpa** endpoint hard delete (`DELETE`) — penghapusan hanya via soft delete.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT — Tambah/Ubah inline dari formulir)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `advice_text` (`teks_anjuran`) | Teks Anjuran | text | Ya | 3–255 char (final); unik ternormalisasi tekstual (BR-01) | manual | Field utama (combobox). |
| `normalized_text` (`teks_normal`) | Teks Ternormalisasi | text | Ya (derived) | trim + lowercase + collapse spasi + hapus tanda baca ujung | auto | Dipakai cek duplikat (FR-003); **tidak** memproses sinonim. |
| `description` (`keterangan`) | Keterangan | text | Tidak | maks 255 char | manual | Field kanonik (konsisten lintas-PRD). |
| `is_active` (`status_aktif`) | Status Aktif | boolean | (sistem) | default **aktif** | sistem | **Tidak diinput di form create**; hapus = set nonaktif (BR-04). |
| `created_by` | Dibuat Oleh | lookup | Ya | dari Master User (A1) | auto (user login) | Audit dasar. |
| `created_at` | Tgl Dibuat | datetime | Ya | auto | auto | Audit dasar. |
| `updated_by` | Diubah Oleh | lookup | Tidak | dari Master User (A1) | auto | Audit dasar. |
| `updated_at` | Tgl Diubah | datetime | Tidak | auto | auto | Audit dasar. |

**Field Anjuran pada Formulir Surat Kontrol (combobox):**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `anjuran_ref` | Anjuran | lookup (combobox) | Ya | harus referensi anjuran **aktif**, atau hasil Tambah Baru | lookup `control_advice` | searchable, debounce (FR-001). |
| `teks_snapshot` | Teks Anjuran (tercetak) | text | Ya | salinan `advice_text` saat terbit (maks 255 char) | auto snapshot | integritas historis (FR-008). |

> **Audit dasar (keputusan user):** hanya menyimpan kondisi terakhir. **Tidak ada** tabel/riwayat versi nilai sebelumnya. Bila perlu jejak perubahan penuh → enhancement terpisah pasca-MVP.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

> **Catatan:** Halaman daftar/kelola Master Data Anjuran terpisah **tidak disediakan** (Out Scope). "Daftar" yang tampil adalah **dropdown combobox** dan **saran saat Tambah Baru**, keduanya inline pada formulir.

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Saran Anjuran Existing | query `LIKE` ternormalisasi tekstual atas `normalized_text` | list ringkas, highlight kecocokan | urut relevansi | Mendorong pilih ulang (US-03); pencocokan tekstual, bukan sinonim. Hanya item **aktif**. |

* **Business Rules**:
    * **BR-01 (Anti-duplikasi ternormalisasi — tekstual):** Saat tambah/ubah, teks anjuran dinormalisasi: (1) trim; (2) lowercase; (3) collapse spasi/tab ganda → satu spasi; (4) hapus tanda baca di ujung. **Sinonim/singkatan/parafrase TIDAK dinormalisasi** — teks bermakna sama tapi beda kata dianggap berbeda & diizinkan. Jika hasil normalisasi sama persis dengan entri **aktif** → **tolak simpan** & arahkan pilih entri existing. *(Keputusan user: sinonim diabaikan.)*
    * **BR-02 (Master global):** Satu master dipakai bersama seluruh dokter & unit; tanpa penyekatan per-unit.
    * **BR-03 (Integritas historis):** Hapus/ubah anjuran **tidak mengubah** surat kontrol yang sudah diterbitkan (teks di-snapshot saat terbit). *[ASUMSI]*
    * **BR-04 (Soft delete):** Hapus = set `is_active=false`; data tidak dihilangkan fisik agar relasi historis & audit aman. **Tanpa hard delete.**
    * **BR-05 (Item nonaktif tidak muncul):** Anjuran nonaktif tidak tampil di combobox pemakaian baru, tetapi tetap terbaca pada dokumen lama.
    * **BR-06 (Audit dasar):** Setiap tambah/ubah/hapus mencatat `created_by`/`updated_by` + timestamp — **kondisi terakhir saja**, tanpa riwayat/versi nilai sebelumnya. *(Keputusan user.)*

---

## 9. Workflow / BPMN Interpretation

> Modul ini **tidak punya BPMN sendiri**; alur diturunkan dari konsep v1.7 & analogi proses terkait ("Load Master Data" & "Generate Smart Recommendation" pada *g-service-pathology-order*, serta pola pilih/tambah inline pada alur admisi). *[ASUMSI]*

**To-Be (alur inline pada Formulir Surat Kontrol):**
1. **Mulai:** Dokter menyelesaikan pemeriksaan → membuka Formulir Surat Kontrol → fokus ke field **Anjuran** (searchable combobox). *Hanya anjuran aktif ditampilkan (BR-05).*
2. Dokter **mengetik kata kunci** → sistem menampilkan (debounce, server-side) daftar anjuran **aktif** global yang cocok (FR-001).
3. **Gateway — Anjuran sesuai sudah ada?**
    * **Ya** → dokter **memilih** → field terisi → lanjut ke langkah 6.
    * **Tidak** → lanjut ke langkah 4 (Tambah Baru).
4. **Tambah Baru (inline):** dokter klik **Tambah Baru** → muncul kolom isian yang **tetap menampilkan saran existing** (mendorong pilih ulang, US-03) → dokter mengetik teks anjuran (3–255 char) → **Simpan** (FR-002).
5. Sistem **normalisasi tekstual** lalu **cek duplikat** terhadap entri aktif (BR-01, FR-003).
    * **Gateway — Duplikat tekstual ditemukan?**
        * **Ya** → sistem **memblok simpan**, menampilkan entri existing, menyarankan pilih entri tersebut → kembali ke langkah 3.
        * **Tidak** (termasuk sinonim/redaksi berbeda — sengaja tidak diblok) → anjuran **tersimpan ke master global** (`is_active=true`, audit dicatat) → **otomatis terpilih** (FR-004, BR-02/06).
6. **(Opsional) Kelola item dari daftar:**
    * **Ubah:** pilih *Ubah* → edit teks → ulangi validasi langkah 5 → simpan global (tidak mengubah surat kontrol lama) (FR-005, BR-03).
    * **Hapus:** pilih *Hapus* → konfirmasi → **soft delete** (`is_active=false`) → item hilang dari pemakaian baru, dokumen lama tetap utuh (FR-006, BR-04/05).
7. **Selesai:** Surat kontrol diterbitkan → **teks anjuran di-snapshot** ke dokumen sehingga perubahan/penghapusan master di kemudian hari tidak mengubah dokumen yang sudah terbit (FR-008, BR-03) *[ASUMSI]*.

**Verifikasi kelengkapan alur:** setiap gateway memiliki kedua cabang berujung hasil valid (terpilih / tersimpan-lalu-terpilih / diarahkan pilih ulang); operasi ubah/hapus memakai validasi & soft delete yang sama; tiap langkah tertaut ke FR/BR terkait; tidak ada cabang menggantung (*dangling*).

---

## Non-Functional Requirements

* **NFR-001 (Performa pencarian):** Hasil combobox tampil ≤500 ms untuk master ≤10.000 entri; gunakan index pada `normalized_text`. *[ASUMSI volume RS Tipe C/D]*
* **NFR-002 (Usability):** Alur tambah baru ≤3 klik dari field; combobox mendukung keyboard (panah + enter).
* **NFR-003 (Konsistensi data):** Constraint **unik** pada `normalized_text` di level database mencegah duplikasi balapan (race) selain validasi aplikasi (BR-01). Keunikan hanya level tekstual ternormalisasi (bukan semantik).
* **NFR-004 (Ketersediaan offline/jaringan):** Master di-cache lokal/server on-prem; tidak bergantung layanan eksternal. *[ASUMSI]*
* **NFR-005 (Auditability):** Semua perubahan terekam sebagai audit dasar (FR-010) & dapat ditelusuri (siapa/kapan terakhir). Riwayat versi tidak disediakan (keputusan user).
* **NFR-007 (Skalabilitas teks):** `advice_text` dibatasi **255 char (final, dikonfirmasi user)** untuk konsistensi tampilan & cetak.
* **NFR-008 (Integritas historis):** Operasi hapus/ubah tidak boleh mengubah snapshot pada dokumen terbit (BR-03).

> *Catatan revisi (dari konsep):* NFR-006 (Keamanan/RBAC) **dihapus** mengikuti penghapusan BR-007. Nomor NFR-006 dikosongkan agar ID lain tetap stabil.

## Integrasi Eksternal

* **Tidak ada integrasi eksternal wajib** (BPJS/SATUSEHAT/Disdukcapil) untuk modul ini. Anjuran adalah teks terstandardisasi internal, bukan kode terminologi. *[ASUMSI]*

**Integrasi internal (lintas modul):**
* **Formulir Surat Kontrol** (kode fitur dikosongkan dulu) — konsumen utama master ini (combobox + snapshot teks).
* **Master User (A1)** — sumber `created_by`/`updated_by` (audit dasar).

*Catatan SATUSEHAT:* Bila ke depan anjuran perlu dipetakan ke kode (mis. CarePlan/ServiceRequest pada FHIR), mapping ditambahkan terpisah. *[PERLU KONFIRMASI kebutuhan interoperabilitas]*

---

## Asumsi

* Untuk modul ini **As-Is = To-Be** — tidak ada perubahan proses; PRD mendokumentasikan alur yang sudah berjalan. Skenario "ketik manual" adalah baseline historis tanpa fitur, bukan As-Is modul.
* Modul tidak punya BPMN sendiri; alur diturunkan dari analogi proses terkait (g-service-pathology-order 'Load Master Data' & 'Smart Recommendation', pola inline admisi).
* Pengelolaan master dilakukan **sepenuhnya inline** dari formulir; halaman/menu administrasi terpisah **tidak disediakan** pada MVP.
* Teks anjuran di-snapshot ke dokumen surat kontrol saat penerbitan → hapus/ubah master tidak mengubah dokumen lama (BR-03/FR-008).
* Hapus = soft delete (`is_active=false`), bukan hard delete (BR-04).
* Master bersifat global tanpa penyekatan per-unit (BR-02).
* Tanpa integrasi terminologi eksternal (SATUSEHAT/BPJS) untuk anjuran pada MVP.
* Normalisasi duplikat (final): trim + lowercase + collapse spasi ganda + hapus tanda baca ujung. Sinonim/parafrase/singkatan diabaikan (keputusan user).
* Audit dasar saja (siapa/kapan terakhir); tanpa riwayat/versioning nilai (keputusan user). Tanpa approval berjenjang & RBAC.
* Batas panjang teks anjuran **255 char** final (keputusan user, NFR-007).
* Kode fitur Formulir Surat Kontrol dikosongkan dulu; bukan blocker pembangunan A30.
* Field kanonik `is_active`/`status_aktif` & `description`/keterangan mengikuti definisi bersama lintas-PRD.
* Volume master ≤10.000 entri untuk konteks RS Tipe C & D (dasar target performa).

## Pertanyaan Terbuka

* Tidak ada open question aktif untuk MVP. Pertanyaan konsep v1.5 telah ditutup pada v1.6: (1) kode fitur Formulir Surat Kontrol dikosongkan dulu, (2) normalisasi anti-duplikasi mengabaikan sinonim, (3) batas teks 255 char final, (4) cukup audit dasar tanpa versioning.
* Pasca-MVP (bukan blocker): kode fitur Formulir Surat Kontrol perlu dilengkapi saat List Fitur difinalisasi.
* Pasca-MVP (bukan blocker): kebutuhan interoperabilitas SATUSEHAT (CarePlan/ServiceRequest) bila anjuran kelak perlu dipetakan ke kode.
* *[PERLU KONFIRMASI]* Bila kelak dibutuhkan menu audit/cleanup khusus (halaman kelola terpisah), akan dievaluasi sebagai enhancement — di luar scope MVP.
