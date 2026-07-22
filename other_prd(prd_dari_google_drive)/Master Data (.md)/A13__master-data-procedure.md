# PRD — Master Data / Integrasi SATUSEHAT BPJS V1 V2 — Procedure (ICD-9-CM)

> **Catatan penyusunan:** PRD ini mengikuti struktur `template.md` dan **menyertakan UI** (wording validasi frontend, list view, tampilan detail read-only). Sumber pengetahuan = `example_prd/prd-master-data-procedure-FIX.md` (v3.1). **Deviasi terhadap panduan generik template** (disepakati mengikuti sumber): modul ini **tidak** memakai konsep *status aktif/nonaktif* dan **tidak** memakai *toggle*; penghapusan dilakukan lewat **soft delete** (`is_delete`). Modul ini juga **tidak** menyertakan approval berjenjang (data master referensial) — kolom `status_approval`/`role_approver` **tidak** dibuat karena tidak ada proses persetujuan; Phase 2 di sini = **Impor/Ekspor massal**, bukan approval.

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — [PERLU KONFIRMASI]
* **Related Documents**:
    * List Fitur V2.xlsx (sheet MVP Fitur Operasional) — code **A13** *Procedure*
    * Standar: **ICD-9-CM (WHO)** & **ICD-9 IM** (Indonesian Modification); Grouper **INA-CBG / IDRG** (BPJS casemix)
    * Modul konsumen (code fitur dikosongkan dulu): Asesmen Medis, Klaim BPJS/casemix, Integrasi SATUSEHAT (Resource Procedure), Rekam Medis/EMR
* **Document Version**: 2026-07-01, v1.0 — Draft awal (adaptasi dari sumber v3.1 ke struktur template)

## 2. Overview & Background

* **Overview / Brief Summary**:
  **Master Data Procedure** adalah modul referensi terpusat di cluster **Control Panel** yang mengelola **kode & deskripsi prosedur/tindakan** berbasis klasifikasi **ICD-9-CM**. Modul menjadi *single source of truth* kode prosedur yang dikonsumsi lintas modul: **pencatatan tindakan pada asesmen medis**, **klaim BPJS/casemix (INA-CBG/IDRG)**, **integrasi SATUSEHAT**, dan **EMR**. Catatan penting: **proses integrasi SATUSEHAT/BPJS berada di code fitur lain** — modul ini hanya **menyediakan & memelihara referensi kode**.

  Identitas utama tiap entri: **kode** (numerik 1–6 digit, mis. `99.99`) & **deskripsi** (Bahasa Inggris sesuai ICD-9-CM), ditandai **kategori** (`ICD-9-CM WHO` / `ICD-9 IM`) dan **validity grouper** (`IDRG` / `IDRG-INACBG` / `INACBG` / `Tidak Ada`). **Format kode identik** untuk WHO maupun IM.

  **Cakupan Phase 1**: CRU (Create/Read/Update), **list/dashboard** dengan tiga ikon aksi per baris (**Detail**, **Edit**, **Hapus**), **tampilan detail read-only**, **soft delete** (`is_delete`), **validasi anti-duplikat**, dan **audit trail** yang direkam ke database (tidak ditampilkan di UI). **Phase 2**: impor/ekspor massal.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini):
        1. User dapat CRUD di menu Master Data > Procedure, namun **belum ada input kategori** ICD-9-CM (WHO) / ICD-9 IM → varian klasifikasi tiap kode tak terbedakan.
        2. **Belum ada input klasifikasi grouper casemix (validity)** → keberlakuan kode terhadap INA-CBG/IDRG tidak tercatat, menyulitkan masa transisi grouper.
        3. Perubahan data referensi **tidak terekam terstruktur** → akuntabilitas rendah saat terjadi ketidaksesuaian kode di hilir (klaim).
        4. Risiko **duplikasi kode** belum dijaga ketat → ambiguitas grouping & pelaporan.
        5. Belum ada **tampilan detail read-only** → memeriksa data lengkap harus membuka form edit yang berisiko mengubah data tak sengaja.
    * **To-Be** (workflow digital diusulkan):
        1. Admin membuka **Control Panel > Master Data > Procedure** → sistem menampilkan **list** (`is_delete=false`) + pencarian/filter + **tiga ikon aksi** per baris (Detail/Edit/Hapus).
        2. **Tambah** → isi form (kode, deskripsi, kategori WHO/IM, validity, keterangan) → validasi duplikat & field wajib → simpan → **audit trail direkam ke DB**.
        3. **Detail** (ikon Detail) → tampilan **read-only** field yang sama persis dengan form input (tanpa field sistem, tanpa audit trail); kontrol hanya **Tutup/Kembali**.
        4. **Edit** (ikon Edit pada baris list — satu-satunya titik masuk) → ubah → validasi ulang → simpan → audit trail.
        5. **Hapus** (ikon Hapus pada baris list — satu-satunya titik masuk) → **modal konfirmasi** → set `is_delete=true` → hilang dari list (data tetap di DB) → audit trail. **Pemulihan hanya via database**, tidak ada aksi Pulihkan di UI.
        6. Data tersedia sebagai **referensi read-only** yang dikonsumsi modul hilir; konsumen menyimpan **ID + kode + deskripsi** (snapshot teks).
        7. *(Phase 2)* Impor/ekspor massal.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Konsistensi kode | % pencatatan tindakan pada dokumen klinis (asesmen medis) memakai kode dari master ini = **100%** |
| 2 | Kelengkapan kategori | % kode memiliki kategori ICD-9-CM (WHO/IM) terisi = **100%** |
| 3 | Integritas data | Jumlah kode procedure duplikat aktif (`is_delete=false`) = **0** |
| 4 | Akuntabilitas | % aktivitas tambah/ubah/hapus terekam audit trail di database = **100%** |
| 5 | Kesiapan transisi grouper | % kode memiliki nilai validity terisi (bukan kosong) = **100%** |
| 6 | Efisiensi | Waktu rata-rata menambah 1 data procedure < **1 menit** |
| 7 | Keamanan peninjauan | Tampilan detail read-only: 0 jalur edit & 0 jalur hapus dari layar detail = **100% read-only** |
| 8 | Konsistensi tampilan | Field di Detail = field form input (0 field sistem bocor ke UI Detail) = **100%** |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP) | Phase 2 (Lanjutan) |
|-------------|---------------|--------------------|
| CRUD Procedure | Create, Read, Update via menu master; validasi duplikat & field wajib | — |
| List/Dashboard | List `is_delete=false` + search/filter + 3 ikon aksi (Detail/Edit/Hapus) | — |
| Tampilan Detail | Detail **read-only** (field = form input, tanpa field sistem, tanpa audit) | — |
| Soft Delete | Hapus via `is_delete` (modal konfirmasi, tanpa peringatan pemakaian) | — |
| Audit Trail | Rekam ke database (append-only), **tidak** ditampilkan di UI | — |
| Impor/Ekspor Massal | — | **Impor/ekspor** `.csv`/`.xlsx` (initial load, update berkala, migrasi) |

> **Catatan phasing:** Panduan template menaruh "Approval/Escalation" di Phase 2. Untuk master referensial ini **tidak ada approval berjenjang** (sesuai sumber) — sehingga Phase 2 diisi **Impor/Ekspor massal**. Bila approval diperlukan di masa depan, dapat ditambahkan tanpa mengganggu struktur inti.

**Out of Scope**:
* **Ikon/tombol Edit maupun Hapus pada layar Detail** — tidak disediakan; jalur Edit & Hapus **hanya** melalui ikon pada baris list. Layar detail hanya **Tutup/Kembali**.
* **Aksi Pulihkan via UI** — tidak ada; pemulihan (`is_delete=false`) hanya langsung di database.
* **Riwayat audit trail di UI** (termasuk pada Tampilan Detail) — tidak ditampilkan; hanya tersimpan di database.
* **Menampilkan field sistem** (`procedure_id`, `is_delete`) di layar Detail — tidak.
* **Hard delete** — tidak disediakan (data master tidak dihapus permanen).
* **Status aktif/nonaktif & toggle** — **tidak ada** konsep ini pada modul (hanya soft delete via `is_delete`).
* **Grouping/klaim casemix** itu sendiri — milik modul Klaim BPJS/casemix.
* **Pemetaan terminologi & proses integrasi SATUSEHAT/BPJS** — di code fitur lain.
* **Pengelolaan tarif** procedure — di modul Master Data Layanan.
* **RBAC (modul peran & hak akses)** — tidak masuk PRD ini; kontrol akses bersifat dasar mengikuti peran pengguna (NFR-004, FR-008).
* Mapping otomatis ICD-9 ↔ ICD-10 — tidak ada keterkaitan.

## 5. Related Features

Bagian dari cluster **Control Panel > Master Data / Integrasi SATUSEHAT BPJS V1 V2 > Procedure** (**code A13**). Kode dipakai untuk **pencatatan tindakan pada asesmen medis** (bukan order tindakan). Modul ini **tidak** berhubungan dengan master diagnosa, diagnosa perawat, Staff, Unit, atau Jabatan. **RBAC tidak** dijadikan related feature.

| Modul (konsumen) | Code Fitur | Relasi |
|------------------|-----------|--------|
| Pelayanan — Asesmen Medis | (dikosongkan dulu) | Ambil **ID + kode + deskripsi** untuk pencatatan tindakan; simpan teks + ID (snapshot). Konsumen utama. |
| Klaim BPJS/casemix (INA-CBG/IDRG) | (dikosongkan dulu) | Ambil **ID + kode + deskripsi + validity** untuk grouping & klaim; simpan teks + ID. |
| Integrasi SATUSEHAT — Resource Procedure | (dikosongkan dulu) | Ambil **ID + kode + deskripsi** untuk mapping/kirim resource Procedure (deskripsi = `display`). Proses integrasi di modul itu, bukan di master. |
| Rekam Medis/EMR | (dikosongkan dulu) | Menampilkan/menyimpan kode + deskripsi pada dokumen RME; simpan teks + ID. |

## 6. Business Process & User Stories

* **State Machine Table** (modul master referensial — **tanpa status aktif/nonaktif**; state = visibilitas `is_delete`):

| Status | Deskripsi | Efek Stok | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| `TAMPIL` (`is_delete=false`) | Procedure tampil di list & tersedia sebagai referensi konsumen | — (master, tanpa stok) | `TAMPIL → TERHAPUS` (soft delete via ikon Hapus + modal konfirmasi) | sama (tanpa approval) |
| `TERHAPUS` (`is_delete=true`) | Hilang dari list dashboard; data tetap tersimpan di DB | — | `TERHAPUS → TAMPIL` **hanya via database** (`is_delete=false`), **tidak** melalui UI | sama |

> Tidak ada state `AKTIF`/`NONAKTIF`, tidak ada `PENDING_APPROVAL`. Hard delete tidak tersedia. Efek stok tidak berlaku (data referensi klinis, bukan barang).

* **User Stories Utama**:
    * **US-001** — Sebagai **Admin Master Data**, saya ingin **menambah procedure (kode & deskripsi)** sesuai ICD-9-CM (numerik 1–6 digit), agar tersedia referensi kode tindakan terstandar. *(To-Be 2)*
    * **US-002** — Sebagai **Admin Master Data**, saya ingin **sistem menolak kode duplikat**, agar tidak ada ambiguitas grouping & pelaporan. *(BR-001)*
    * **US-003** — Sebagai **Admin Master Data**, saya ingin **mengubah procedure** melalui **ikon Edit pada baris list**, agar data mutakhir saat regulator memperbarui kode. *(To-Be 4)*
    * **US-004** — Sebagai **Admin Master Data**, saya ingin **menandai kategori (WHO/IM) & validity grouper**, agar varian klasifikasi terbedakan & akurat selama/pasca transisi INA-CBG → IDRG. *(BR-003, BR-004)*
    * **US-005** — Sebagai **Admin Master Data**, saya ingin **mencari & memfilter** procedure by kode/deskripsi/kategori/validity, agar cepat menemukan kode. *(To-Be 1)*
    * **US-006** — Sebagai **Supervisor/Auditor**, saya ingin **setiap perubahan terekam di audit trail database**, agar dapat ditelusuri saat terjadi ketidaksesuaian klaim (tanpa perlu ditampilkan di UI). *(BR-005)*
    * **US-007** — Sebagai **modul konsumen (Asesmen/Klaim/SATUSEHAT/EMR)**, saya ingin **mengambil ID + kode + deskripsi** dan **menyimpan snapshot teks + ID**, agar konsisten lintas modul & tetap utuh meski di-soft delete. *(BR-009)*
    * **US-008** — Sebagai **Admin Master Data**, saya ingin **menghapus (soft delete)** procedure via **ikon Hapus pada baris list** (modal konfirmasi) → `is_delete=true`, agar keterhubungan transaksi tetap terjaga. *(BR-006)*
    * **US-009** — Sebagai **Admin Master Data/Koder**, saya ingin **melihat tampilan detail read-only** via ikon Detail (field = form input, tanpa field sistem, tanpa audit), agar memeriksa data tanpa risiko mengubah/menghapus. *(BR-010)*
    * **US-010** *(Phase 2)* — Sebagai **Admin Master Data**, saya ingin **impor/ekspor massal**, agar pemuatan awal/pembaruan/migrasi efisien.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Tambah Procedure**
* **User Story**: Sebagai Admin Master Data, saya ingin menambah procedure, agar tersedia referensi kode terstandar.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Tambah menyediakan field kode, deskripsi, kategori (WHO/IM), validity (4 enum), keterangan; tanpa input status apa pun.
    * **AC 2**: Menyimpan dengan kode yang sudah ada (case-insensitive, trim) ditolak + pesan mis. `"Kode 99.99 sudah ada"`; data tidak tersimpan.
    * **AC 3**: Menyimpan dengan field wajib kosong ditolak + pesan `"[nama field] wajib diisi"` untuk tiap field bermasalah; kembali ke form.
    * **AC 4**: Kode di luar format numerik 1–6 digit ditolak dengan pesan format.
    * **AC 5**: Simpan sukses → data masuk DB (`is_delete=false`), audit trail (user, timestamp, after) terekam ke database, muncul di list.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Procedure | Text | Required, **unik** (case-insensitive), numerik 1–6 digit (titik pemisah, mis. `99.99`) | "Kode wajib diisi" / "Kode {nilai} sudah ada" / "Format kode tidak valid (numerik 1–6 digit)" | "Masukkan kode ICD-9-CM, mis. 99.99" |
  | Deskripsi Procedure | Text | Required, maks 255 char | "Deskripsi wajib diisi" | "Tulis deskripsi dalam Bahasa Inggris (ICD-9-CM)" |
  | Kategori | Dropdown | Required, enum: ICD-9-CM WHO / ICD-9 IM | "Kategori wajib diisi" | "Pilih sumber klasifikasi: WHO atau IM" |
  | Validity Grouper | Dropdown | Required, enum: IDRG / IDRG-INACBG / INACBG / Tidak Ada | "Validity wajib diisi" | "Pilih keberlakuan grouper casemix" |
  | Keterangan | Text | Optional, maks 255 char | — | "Catatan opsional" |

---

**Fitur: Ubah Procedure (Form Edit)**
* **User Story**: Sebagai Admin Master Data, saya ingin mengubah procedure via ikon Edit di baris list, agar data tetap mutakhir.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: **Satu-satunya** titik masuk Form Edit adalah **ikon Edit pada baris list**; layar Detail tidak menyediakan jalur Edit.
    * **AC 2**: Form Edit terisi data existing; menyimpan menjalankan **ulang** validasi keunikan & field wajib.
    * **AC 3**: Mengubah kode menjadi bentrok dengan kode lain ditolak + pesan; kembali ke form.
    * **AC 4**: Simpan sukses → audit trail before/after terekam ke database.
* **Validasi**: sama dengan tabel Wording Validasi (Frontend) pada fitur Tambah.

---

**Fitur: List/Dashboard + Pencarian & Filter**
* **User Story**: Sebagai Admin Master Data, saya ingin mencari & memfilter procedure, agar cepat menemukan kode.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: List menampilkan **hanya** `is_delete=false` dengan kolom Kode, Deskripsi, Kategori, Validity + **tiga ikon aksi** (Detail/Edit/Hapus) per baris.
    * **AC 2**: Pencarian by kode/deskripsi & filter by kategori/validity berfungsi.
    * **AC 3**: **Tidak ada** filter/tampilan "Terhapus" (data `is_delete=true` tidak diakses via UI).

---

**Fitur: Tampilan Detail (Read-only)**
* **User Story**: Sebagai Admin Master Data/Koder, saya ingin melihat detail read-only, agar memeriksa data tanpa risiko mengubah/menghapus.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Dibuka dari **ikon Detail** pada baris list; menampilkan **field yang sama persis dengan form input** (kode, deskripsi, kategori, validity, keterangan) dalam mode read-only.
    * **AC 2**: **TIDAK** menampilkan field sistem (`procedure_id`, `is_delete`) dan **TIDAK** menampilkan audit trail.
    * **AC 3**: **TIDAK ada** ikon/tombol Edit maupun Hapus; satu-satunya kontrol = **Tutup/Kembali**.
    * **AC 4**: Untuk mengubah → kembali ke list, pakai ikon Edit; untuk menghapus → kembali ke list, pakai ikon Hapus.

---

**Fitur: Hapus (Soft Delete)**
* **User Story**: Sebagai Admin Master Data, saya ingin soft delete procedure via ikon Hapus di list, agar data historis tetap terjaga.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Aksi Hapus **hanya** tersedia via **ikon Hapus pada baris list**; menampilkan **modal konfirmasi**.
    * **AC 2**: Konfirmasi → set `is_delete=true` **langsung** (tanpa peringatan pemakaian di modul lain) → procedure hilang dari list, data tetap di DB → audit trail terekam.
    * **AC 3**: **Tidak ada** aksi Pulihkan di UI; pemulihan hanya via database (`is_delete=false`).
    * **AC 4**: **Tidak ada** hard delete.

  **A. Wording Validasi (Frontend) — Modal Konfirmasi Hapus**
  | Elemen | Tipe | Rules | Wording | Helper Text |
  |--------|------|-------|---------|-------------|
  | Modal Konfirmasi | Dialog | Wajib konfirmasi sebelum eksekusi | Judul: "Hapus Procedure?" · Isi: "Data akan disembunyikan dari daftar (soft delete) dan dapat dipulihkan melalui database." · Tombol: "Batal" / "Hapus" | — |

---

**Fitur: Referensi/Lookup untuk Konsumen (read-only)**
* **User Story**: Sebagai modul konsumen, saya ingin mengambil ID + kode + deskripsi, agar konsisten lintas modul.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Endpoint lookup mengembalikan **ID + kode + deskripsi** (dan `validity` bila diminta) untuk data `is_delete=false`.
    * **AC 2**: Konsumen menyimpan **snapshot teks + ID**; soft delete di master **tidak** memutus data historis konsumen.

---

**Fitur: Impor & Ekspor Massal (Phase 2)**
* **User Story**: Sebagai Admin Master Data, saya ingin impor/ekspor massal, agar pemuatan/pembaruan/migrasi efisien.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Tombol **Impor** → unggah `.csv`/`.xlsx` → validasi per baris (duplikat/format) → ringkasan sukses/gagal → commit. Mode `tambah` menolak kode existing; `tambah+update` memperbarui.
    * **AC 2**: Tombol **Ekspor** → generate file sesuai filter aktif → unduh.

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `master_procedure`
* **Key Columns**:
    * `procedure_id`: UUID (Primary Key) — internal, tidak ditampilkan di UI Detail
    * `kode`: VARCHAR(10) NOT NULL — numerik 1–6 digit (titik pemisah, mis. `99.99`); **UNIQUE (case-insensitive)** via lower-index
    * `deskripsi`: VARCHAR(255) NOT NULL — Bahasa Inggris (ICD-9-CM)
    * `kategori`: ENUM(`ICD9CM_WHO`,`ICD9_IM`) NOT NULL
    * `validity`: ENUM(`IDRG`,`IDRG_INACBG`,`INACBG`,`TIDAK_ADA`) NOT NULL
    * `keterangan`: VARCHAR(255) NULL
    * `is_delete`: BOOLEAN NOT NULL DEFAULT false — penanda **soft delete** (bukan status aktif/nonaktif)
    * `created_at` / `updated_at`: TIMESTAMP
    * `created_by` / `updated_by`: identitas dari sesi login (modul tidak terhubung master Staff)

  > **Tidak ada** kolom `is_active`, `status`, `status_approval`, atau `role_approver` — modul tidak memakai status aktif/nonaktif maupun approval (sesuai sumber). Visibilitas list dikendalikan `is_delete=false`.

* **Table Name**: `procedure_audit_trail` (append-only, **tidak** dirender di UI)
* **Key Columns**:
    * `id`: UUID (PK)
    * `procedure_id`: UUID (FK → `master_procedure.procedure_id`)
    * `timestamp`: TIMESTAMP NOT NULL
    * `action`: ENUM(`CREATE`,`UPDATE`,`DELETE`) NOT NULL — `DELETE` = perubahan `is_delete=true`
    * `user`: VARCHAR(100) NOT NULL — pelaku dari sesi login
    * `before` / `after`: JSONB — snapshot diff per field (termasuk `is_delete`)

  > Constraint: `UNIQUE(lower(kode)) WHERE is_delete=false` (anti-duplikat level DB, BR-001/NFR-002). Index: `INDEX(kode)`, `INDEX(deskripsi)`, `INDEX(is_delete)`, `INDEX(kategori)`, `INDEX(validity)`. Audit append-only (tidak dapat diubah/dihapus pengguna, NFR-003).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/procedures` | List data `is_delete=false` (params: `?q=`, `?kategori=`, `?validity=`, `?page=`, `?per_page=`) |
| GET | `/api/v1/procedures/{id}` | Detail read-only (field form input saja; tanpa field sistem & audit) |
| POST | `/api/v1/procedures` | Create data (validasi unik + field wajib; rekam audit `CREATE`) |
| PUT | `/api/v1/procedures/{id}` | Update data (validasi ulang; rekam audit `UPDATE` before/after) |
| DELETE | `/api/v1/procedures/{id}` | **Soft delete** → set `is_delete=true` (rekam audit `DELETE`) |
| GET | `/api/v1/procedures/lookup` | Referensi untuk konsumen: kembalikan `id`+`kode`+`deskripsi` (+`validity` opsional), `is_delete=false` |
| POST | `/api/v1/procedures/import` | *(Phase 2)* Impor massal `.csv`/`.xlsx` (mode `tambah`/`tambah+update`) → ringkasan per baris |
| GET | `/api/v1/procedures/export` | *(Phase 2)* Ekspor `.xlsx`/`.csv` sesuai filter aktif |

> Catatan: **tidak ada** endpoint `PATCH .../status` (toggle) karena tidak ada status aktif/nonaktif. **Tidak ada** endpoint restore (pemulihan hanya via database). `DELETE` bersifat *soft* (bukan hard delete).

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `kode` | Kode Procedure | text | Ya | unik (case-insensitive), numerik 1–6 digit, mis. `99.99`; format sama WHO/IM | manual | BR-001, BR-007; pesan "Kode wajib diisi" |
| `deskripsi` | Deskripsi Procedure | text | Ya | maks 255 char | manual | BR-002; **Bahasa Inggris (ICD-9-CM)**, NFR-005 |
| `kategori` | Kategori | dropdown | Ya | enum: ICD-9-CM WHO / ICD-9 IM | enum | BR-003; pembeda sumber, bukan format kode/terminologi |
| `validity` | Validity Grouper | dropdown | Ya | enum: IDRG / IDRG-INACBG / INACBG / Tidak Ada (final) | enum | BR-004 |
| `keterangan` | Keterangan | text | Tidak | maks 255 char | manual | field kanonik `keterangan` |

> **Field sistem (tidak diinput manual & tidak ditampilkan di Detail):** `procedure_id` (auto, dikunci), `is_delete` (default `false`; di-set `true` saat Hapus dari list; pemulihan hanya via DB). **Tidak ada** field status aktif/nonaktif. Field pemetaan terminologi SATUSEHAT/BPJS **tidak ada** di modul ini (ditangani modul integrasi/code fitur lain).

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

> Default list **hanya** `is_delete=false`. **Tidak ada** tampilan "Terhapus". Label antarmuka/tombol **Bahasa Indonesia**, konten data (kode & deskripsi) **Bahasa Inggris** (ICD-9-CM), NFR-005.

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Procedure | count `master_procedure where is_delete=false` | angka besar (kartu) | – | ringkasan |
| Kode | `master_procedure.kode` | text monospace | sort A→Z; search | numerik 1–6 digit |
| Deskripsi | `master_procedure.deskripsi` | text | sort; search | Bahasa Inggris (ICD-9-CM) |
| Kategori | `master_procedure.kategori` | badge (WHO / IM) | filter | |
| Validity | `master_procedure.validity` | badge (IDRG/IDRG-INACBG/INACBG/Tidak Ada) | filter | warna berbeda per nilai |
| Aksi | – | **tiga ikon: Detail / Edit / Hapus** | – | Detail=read-only (FR-Detail); Edit=satu-satunya masuk Form Edit; Hapus=satu-satunya soft delete (modal konfirmasi); **tanpa tombol Pulihkan** |

#### 8.3.3 Spesifikasi Data — Tampilan Detail (Read-only)

> Dibuka dari **ikon Detail**. Menampilkan **field yang sama persis dengan form input**, mode read-only. **Tanpa field sistem**, **tanpa audit trail**, **tanpa ikon Edit/Hapus**. Kontrol hanya **Tutup/Kembali**.

| Field | Sumber Data | Format | Catatan |
|-------|-------------|--------|---------|
| Kode | `master_procedure.kode` | text monospace (read-only) | = field form input |
| Deskripsi | `master_procedure.deskripsi` | text (read-only) | Bahasa Inggris (ICD-9-CM) |
| Kategori | `master_procedure.kategori` | badge WHO/IM (read-only) | = field form input |
| Validity | `master_procedure.validity` | badge (read-only) | = field form input |
| Keterangan | `master_procedure.keterangan` | text (read-only) | kosong bila tidak diisi |
| (Aksi) | – | tombol **Tutup/Kembali** saja | tanpa Edit/Hapus/Simpan/Pulihkan; tanpa panel audit |

* **Business Rules**:
    * **BR-001**: Kode **wajib unik** (case-insensitive, trim) saat tambah & ubah — ditegakkan di level database (NFR-002).
    * **BR-002**: `kode` & `deskripsi` **wajib diisi**; field wajib kosong → pesan `"[nama field] wajib diisi"` & kembali ke form.
    * **BR-003**: Wajib **kategori** `ICD-9-CM WHO` **atau** `ICD-9 IM` — pembeda sumber rujukan, **tidak** mengubah format kode, **tidak** terkait terminologi SATUSEHAT/BPJS.
    * **BR-004**: Wajib **validity** `IDRG` / `IDRG-INACBG` / `INACBG` / `Tidak Ada` (enum final, single-select, tidak boleh kosong).
    * **BR-005**: Setiap **tambah/ubah/hapus** wajib **direkam ke audit trail database** (user, timestamp, before/after) sejak Phase 1; **tidak** ditampilkan di UI.
    * **BR-006**: **Tidak ada hard delete**. Hapus = **soft delete** (`is_delete=true`), **hanya** via ikon Hapus pada baris list + modal konfirmasi, **tanpa** peringatan pemakaian modul lain. **Tidak ada** status aktif/nonaktif. Pemulihan hanya via database.
    * **BR-007**: `kode` numerik 1–6 digit (titik = pemisah, mis. `99.99`); **format sama** WHO & IM.
    * **BR-008** *(Phase 2)*: Impor — baris duplikat/format salah ditolak per baris; mode `tambah` menolak kode existing, `tambah+update` memperbarui.
    * **BR-009**: Modul konsumen **menyimpan ID + kode + deskripsi** (snapshot). Saat procedure di-soft delete, data historis konsumen **tetap utuh** — alasan soft delete tak perlu peringatan.
    * **BR-010**: **Tampilan Detail read-only** = field form input, **tanpa** field sistem, **tanpa** ikon Edit/Hapus (hanya Tutup/Kembali), **tanpa** audit trail. Edit hanya via ikon Edit list; Hapus hanya via ikon Hapus list.
    * **BR-011**: **Pemisahan aksi pada list**: tiga ikon berbeda fungsi (Detail/Edit/Hapus), masing-masing **titik masuk tunggal**; Edit & Hapus **tidak** diduplikasi di layar Detail.

## 9. Workflow / BPMN Interpretation

> Modul **belum punya BPMN sendiri**; alur diturunkan analogi dari pola master/terminologi sejenis. [ASUMSI]

**Skenario 1 — Tambah Procedure (Phase 1)**
```
[Start] Buka menu Master Data Procedure → tampil list + tombol Tambah
  → Klik Tambah → isi kode (1–6 digit), deskripsi, kategori (WHO/IM), validity, keterangan → Simpan
  → [Gateway] Kode duplikat?
        Ya  → tolak + "Kode {nilai} sudah ada" → kembali ke form
        Tidak → [Gateway] Field wajib valid?
              Tidak → kembali ke form + "[nama field] wajib diisi"
              Ya → Simpan ke DB → rekam audit CREATE → [End] "Procedure berhasil ditambahkan"
```

**Skenario 2 — Ubah Procedure (Phase 1)**
```
[Start] Klik IKON EDIT pada baris list (satu-satunya titik masuk; layar Detail tak punya ikon Edit)
  → Form Edit terisi data existing → ubah field → Simpan
  → [Gateway] Kode bentrok? Ya → tolak + pesan → kembali. Tidak → [Gateway] Field wajib valid?
        Tidak → kembali + "[nama field] wajib diisi"
        Ya → Simpan → rekam audit UPDATE (before/after) → [End] "Perubahan tersimpan"
```

**Skenario 3 — Lihat/Cari & Detail Read-only (Phase 1)**
```
[Start] Buka list → cari by kode/deskripsi → filter by kategori/validity
  → (opsional) Klik IKON DETAIL → Tampilan Detail read-only (kode, deskripsi, kategori, validity, keterangan)
        (tanpa field sistem, tanpa audit trail; kontrol hanya Tutup/Kembali; TIDAK ada ikon Edit/Hapus)
        → Mau ubah? kembali ke list → ikon Edit (Skenario 2)
        → Mau hapus? kembali ke list → ikon Hapus (Skenario 4)
```

**Skenario 4 — Hapus / Soft Delete (Phase 1)**
```
Pilih data → klik IKON HAPUS pada baris list (satu-satunya titik masuk; TIDAK dari Detail)
  → modal konfirmasi → konfirmasi → set is_delete=true (tanpa peringatan pemakaian) → hilang dari list (data tetap di DB)
  → rekam audit DELETE → [End]
Pulihkan: TIDAK via UI — hanya langsung di database (is_delete=false). Hard delete TIDAK tersedia.
```

**Skenario 5 — Impor/Ekspor (Phase 2)**
```
Impor: tombol Impor → (opsional) unduh template → upload .csv/.xlsx → validasi per baris (duplikat/format)
       → ringkasan sukses/gagal → commit
Ekspor: tombol Ekspor (mengikuti filter aktif) → generate .xlsx/.csv → unduh
```

---

## Asumsi
* [DIKONFIRMASI dari sumber] List menyediakan tiga ikon aksi per baris (Detail/Edit/Hapus); Edit & Hapus adalah titik masuk tunggal masing-masing.
* [DIKONFIRMASI dari sumber] Tampilan Detail read-only: hanya Tutup/Kembali; tanpa ikon Edit/Hapus; tanpa field sistem; tanpa audit trail.
* [DIKONFIRMASI dari sumber] Tidak ada status aktif/nonaktif; penghapusan = soft delete `is_delete`; pemulihan hanya via database.
* [DIKONFIRMASI dari sumber] Tidak ada approval berjenjang; Phase 2 = impor/ekspor massal.
* [ASUMSI] Deviasi dari panduan generik template (is_active/toggle/approval) diputuskan mengikuti sumber pengetahuan yang lebih otoritatif untuk modul ini.
* [ASUMSI] Deskripsi procedure ditulis Bahasa Inggris sesuai ICD-9-CM; label antarmuka Bahasa Indonesia.

## Pertanyaan Terbuka
* Konfirmasi format kanonik penyimpanan enum `kategori`/`validity` (nilai DB vs label tampil).
* Batas panjang & pola kode final bila ada variasi ICD-9 IM tertentu (tetap 1–6 digit?).
* Kebijakan retensi & akses audit trail di database (siapa boleh query, berapa lama).
* Template file impor Phase 2 (kolom & contoh) dan mode default (`tambah` vs `tambah+update`).
* Apakah endpoint lookup perlu mengembalikan data ber-`is_delete=true` untuk resolusi historis konsumen (mis. render dokumen lama), atau cukup snapshot di konsumen saja.
