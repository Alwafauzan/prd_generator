# Product Requirement Document (PRD)
# A55 — Master Data - Jabatan (Include UI)

---

## 1. Metadata Dokumen

* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer Tamtech International
* **Related Documents**:
  * Design Figma — Master Data Jabatan
  * A2 — Master Data Staf (modul konsumen yang mengacu ke Jabatan)
  * Modul Kepegawaian — Pelaporan & Komposisi SDM
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-05-26 | 1.0 | Pembuatan awal dokumen Master Data Jabatan (manual) |
| 2026-07-03 | 1.1 | Restrukturisasi ke template PRD standar + spesifikasi UI (form input, list view, validasi frontend, skema DB & API, state machine) |

---

## 2. Overview & Background

### Overview / Brief Summary

Fitur **Master Data - Jabatan** digunakan untuk mencatat dan mengelola seluruh **jabatan/posisi** di lingkungan Rumah Sakit, baik jabatan **struktural** (mis. Direktur, Kepala Bagian) maupun **fungsional** (mis. Dokter Umum, Perawat, Apoteker, Staf Administrasi). Data ini menjadi **referensi utama (single source of truth)** bagi **A2 — Master Data Staf** dan modul lain yang membutuhkan informasi jabatan, seperti pelaporan kepegawaian dan analisis komposisi sumber daya manusia rumah sakit.

Dengan Master Data - Jabatan yang tersentralisasi, penamaan jabatan menjadi seragam antar staf/modul, pengelompokan staf berdasarkan jabatan menjadi mudah, dan pelaporan kepegawaian menjadi konsisten.

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Daftar jabatan dicatat manual atau di sistem yang tidak terintegrasi → data **tidak terstandarisasi**.
- Penulisan nama jabatan berbeda-beda untuk posisi yang sama (mis. **"Perawat" vs "Suster"**) → data ganda.
- Sulit mengelompokkan dan memetakan staf berdasarkan jabatan.
- Inkonsistensi data jabatan saat dipakai di modul kepegawaian dan pelaporan.

**To-Be (Workflow Digital yang Diusulkan):**
1. Admin membuka menu **Master Data → Jabatan** dan menambahkan data jabatan baru beserta field terkait.
2. Sistem melakukan **validasi** input (nama tidak duplikat, field wajib terisi, keunikan kode) lalu **menyimpan** ke tabel master jabatan.
3. **Master Data Staf** dan modul kepegawaian **otomatis mengambil referensi** jabatan dari tabel master.
4. Admin dapat **memperbarui** detail jabatan (nama/kode/deskripsi); perubahan tersinkron otomatis ke seluruh modul terkait (real-time, tanpa restart).
5. Jika jabatan sudah tidak digunakan, admin mengubah status menjadi **Nonaktif** (bukan hapus) → data tetap tersimpan untuk keperluan historis & staf yang pernah menduduki jabatan tersebut.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Konsistensi data antar modul | 100% modul dan data staf menggunakan referensi jabatan yang sama. |
| 2 | Kemandirian user non-teknis | 100% user Admin RS mampu melakukan setup tanpa bantuan tim teknis. |
| 3 | Kecepatan update konfigurasi | 100% perubahan data langsung terbaca real-time tanpa restart sistem. |
| 4 | Pencarian dan filter jabatan | Waktu pencarian data jabatan < 3 detik. |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced) |
|---------------|---------------------|--------------------|
| Dashboard Jabatan | List, cari (nama/kode), sort semua kolom, pagination 10/hal, kolom Jumlah Staf | Filter/kolom lanjutan, saved view [ASUMSI] |
| Tambah Jabatan | Form identitas jabatan + validasi (nama unik, kode unik, wajib) | — |
| Detail & Update Jabatan | Lihat + ubah detail (semua editable kecuali Nomor) | — |
| Riwayat Aktivitas | Audit log (dibuat/diubah, user, waktu, diff perubahan) | Pencatatan aksi ubah status |
| Ubah Status (Aktif/Nonaktif) | — | Toggle status dari dashboard + warning konfirmasi; approval berjenjang [ASUMSI] |
| Ekspor Data Jabatan | — | Ekspor CSV/XLSX |
| Impor Data Jabatan | — | Impor massal CSV/XLSX (mode tambah / tambah+update) |
| Approval berjenjang | — | Alur approval perubahan (kolom `approval_status`/`approver_role` disiapkan sejak Phase 1) [ASUMSI] |

> **Catatan phasing**: Sesuai dokumen sumber, Phase 1 fokus pada CRUD dasar (Dashboard, Tambah, Detail/Update) + Riwayat Aktivitas. Fitur **Aktif/Nonaktif (Ubah Status)** serta **Ekspor/Impor** masuk **Phase 2**. Status tetap diset **Aktif** oleh sistem saat create (tidak ada input status bebas di form); mekanisme toggle Nonaktif diaktifkan pada Phase 2. Kolom `approval_status`/`approver_role` (nullable) disiapkan sejak Phase 1 agar siap approval berjenjang di Phase 2.

**Out of Scope**:
- Pengelolaan data staf yang menduduki jabatan (ditangani **A2 — Master Data Staf**).
- Penggajian dan tunjangan berdasarkan jabatan (ditangani modul **Penggajian**).
- Struktur organisasi dan hierarki antar jabatan.

---

## 5. Related Features

* **A2 — Master Data Staf**: Konsumen utama referensi jabatan. Field "Jabatan" pada form input Staf **mengambil sumber data dari master ini** (dropdown/lookup). Jabatan berstatus **Nonaktif** tidak dapat dipilih saat menambah/ubah Staf. Kolom **Jumlah Staf** di dashboard Jabatan dihitung otomatis dari data staf aktif yang menduduki jabatan (relasi read-only dari sisi modul Jabatan).
* **Modul Kepegawaian — Pelaporan & Komposisi SDM**: Konsumen referensi jabatan untuk pengelompokan dan analisis komposisi SDM rumah sakit.

---

## 6. Business Process & User Stories

### State Machine — Status Jabatan

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Jabatan terdaftar & dapat dipakai | Muncul di dashboard; tersedia sebagai pilihan dropdown Jabatan di Master Staf & modul kepegawaian | — (semua jabatan dibuat & tetap `AKTIF`; belum ada toggle) | → `NONAKTIF` (bersyarat: tidak ada staf aktif; via warning/approval) |
| `NONAKTIF` | Jabatan tidak dipakai lagi (soft delete) | **Tidak** dapat dipilih saat tambah/ubah Staf; data staf historis yang merujuk jabatan ini **tetap utuh** | — (tidak tersedia di Phase 1) | → `AKTIF` |

> **Aturan status form**: status **tidak diinput bebas** saat create — sistem set `AKTIF` otomatis (field Status Jabatan default `Aktif`). Pada **Phase 1** seluruh jabatan berstatus `AKTIF` (belum ada aksi Nonaktif). Perubahan status ke `NONAKTIF` dilakukan di **level Dashboard** (aksi Ubah Status dengan warning konfirmasi) pada **Phase 2**, dan jabatan **tidak dapat** dinonaktifkan bila masih ditempati staf aktif (BR-A55-04).

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A55-01 | Admin Master Data | Melihat Dashboard data Jabatan (tabel, sort, cari, pagination) | Data jabatan terpantau dengan baik |
| US-A55-02 | Admin Master Data | Menambahkan data Jabatan baru | Data jabatan selalu update dengan data terbaru |
| US-A55-03 | Admin Master Data | Melihat sekaligus mengubah detail Jabatan | Data selalu update dan akurat |
| US-A55-04 | Admin Master Data | Mengubah status Jabatan (Aktif/Nonaktif) dari Dashboard | Status diperbarui tanpa harus membuka Detail *(Phase 2)* |
| US-A55-05 | Admin Master Data | Melihat riwayat aktivitas (kapan, oleh siapa, apa yang berubah) | Setiap perubahan data dapat diaudit |
| US-A55-06 | System / Master Staf | Mengambil daftar jabatan aktif sebagai referensi dropdown | Nama/kode jabatan konsisten antar modul |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Master Data Jabatan — Dashboard**

* **User Story**: Sebagai Admin Master Data, saya dapat melihat Dashboard data Jabatan, agar data Jabatan bisa terpantau dengan baik.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Ketika klik menu **Master Data → Jabatan**, sistem menampilkan halaman **Dashboard Data Jabatan**.
    * **AC 2**: Dashboard menampilkan tabel dengan kolom: **Nomor, Nama, Kode, Jumlah Staf, Status**.
    * **AC 3**: Semua kolom dapat diklik untuk mengubah urutan (sorting).
    * **AC 4**: Urutan default data diurutkan berdasarkan **Nama Jabatan Ascending (A–Z)**; mendukung Descending (Z–A).
    * **AC 5**: Terdapat kolom Pencarian; user dapat mencari data berdasarkan **Nama** atau **Kode**. Hasil pencarian tampil < 3 detik.
    * **AC 6**: Terdapat **Pagination** dengan setiap halaman berisi **10 data**.
    * **AC 7**: Pada setiap baris data terdapat tombol **Detail** dan **Ubah Status**.
    * **AC 8**: Terdapat tombol **➕** (tooltip "Tambah Jabatan") untuk menambahkan data baru.
    * **AC 9**: Kolom **Jumlah Staf** menampilkan jumlah staf aktif yang menempati jabatan, dihitung otomatis dari Master Data Staf (A2).

---

**Fitur: Master Data Jabatan — Tambah Data**

* **User Story**: Sebagai Admin Master Data, saya dapat menambahkan data Jabatan, agar data Jabatan selalu update dengan data terbaru.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Ketika klik tombol **➕** sistem menampilkan view **Tambah Jabatan** (overlay).
    * **AC 2**: Form Tambah Jabatan memuat field: **Nomor, Nama, Kode, Deskripsi, Status Jabatan** (detail di §8.3.1).
    * **AC 3**: **Nomor** autofill = nomor terbesar/terakhir tersimpan + 1, **tidak editable**, tidak boleh duplikat (BR-A55-05).
    * **AC 4**: **Nama** wajib diisi, 1–100 karakter, tidak boleh duplikat (BR-A55-01, BR-A55-02).
    * **AC 5**: **Kode** opsional, maks 50 karakter, tidak boleh duplikat bila diisi (BR-A55-03).
    * **AC 6**: **Status Jabatan** default **Aktif** (diset otomatis oleh sistem; tidak diinput bebas).
    * **AC 7**: Terdapat tombol **Simpan** di bagian bawah untuk menyimpan data baru ke database; setelah tersimpan **redirect ke halaman Dashboard**.
    * **AC 8**: Terdapat tombol **Kembali** di sebelah kiri tombol Simpan untuk menutup halaman Tambah Jabatan tanpa menyimpan.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama | Text | Required, 1–100 char, unik | "Nama Jabatan wajib diisi." / "Nama Jabatan sudah digunakan, gunakan nama lain." | Masukkan nama jabatan, mis. Perawat Pelaksana |
  | Kode | Text | Optional, Max 50, unik bila diisi | "Kode Jabatan sudah digunakan, gunakan kode lain." | Kode baku jabatan (opsional), mis. JBT-001 |
  | Deskripsi | Text Area | Optional, Max 300 | "Deskripsi maksimal 300 karakter." | Keterangan singkat jabatan (opsional) |

---

**Fitur: Master Data Jabatan — Update Data (Detail)**

* **User Story**: Sebagai Admin Master Data, saya dapat melihat sekaligus mengubah detail Jabatan apabila diperlukan, agar data selalu update dengan data terbaru.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Ketika klik tombol **Detail** (tooltip "Detail Jabatan") sistem menampilkan view **Detail Jabatan** (overlay) dengan field & section sama seperti halaman Tambah Jabatan.
    * **AC 2**: Semua kolom data **editable kecuali Nomor**.
    * **AC 3**: Validasi sama seperti Tambah (Nama wajib & unik, Kode unik bila diisi); pengecualian duplikasi untuk data itu sendiri.
    * **AC 4**: Terdapat tombol **Update** di bagian bawah untuk menyimpan pembaruan; setelah tersimpan **redirect ke halaman Dashboard**.
    * **AC 5**: Terdapat tombol **Kembali** di sebelah kiri tombol Update untuk menutup view tanpa menyimpan.

* **Validasi**: Identik dengan form Tambah, dengan pengecualian duplikasi untuk entri sendiri (AC 3).

---

**Fitur: [Phase 2] Master Data Jabatan — Update Status**

* **User Story**: Sebagai Admin Master Data, saya dapat mengubah status Jabatan dari Dashboard, agar status bisa diperbarui tanpa harus membuka Detail terlebih dahulu.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Ketika klik tombol **Ubah Status** (tooltip "Ubah Status Jabatan") tampil **warning Perubahan Status** disertai tombol **Batal** dan **Ubah Status**.
    * **AC 2**: Apabila status saat ini **Aktif**, klik Ubah Status menampilkan warning perubahan menjadi **Non Aktif**; apabila status saat ini **Non Aktif**, menampilkan warning perubahan menjadi **Aktif**.
    * **AC 3**: Jabatan **Nonaktif** tidak dapat dipilih saat menambah/ubah Staf (BR-A55-06).
    * **AC 4**: Sistem **menolak** penonaktifan bila jabatan masih ditempati **staf aktif** dan menampilkan pesan (BR-A55-04).
    * **AC 5**: Perubahan status tercatat di **Riwayat Aktivitas**.

---

**Fitur: Riwayat Aktivitas**

* **User Story**: Sebagai admin, saya dapat mengetahui kapan data di-update/dibuat/di-nonaktifkan/di-aktifkan, oleh siapa, dan data apa saja yang berubah, agar setiap perubahan dapat diaudit.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyimpan **Tanggal & Waktu** saat action dilakukan (format `dd/mm/yyyy HH:mm`).
    * **AC 2**: Sistem menyimpan **User ID / Nama** pelaku action.
    * **AC 3**: Aktivitas dikategorikan: **Dibuat (created_at)**, **Diubah (updated_at)**, **Ubah Status**.
    * **AC 4**: Untuk aktivitas Diubah, sistem menampilkan **data yang berubah** dalam format `Field: data sebelumnya -> data update` (mis. `No Telpon: 089462537381 -> 09898887777`).
    * **AC 5**: Contoh tampilan: *"Dibuat oleh 111/Agus pada 11/09/2026 13:13"* · *"Diubah oleh 222/Joko pada 12/09/2026 09:01 — Alamat: Solo -> Jogja; No Telp: 0983717131 -> 0931111112"*.

---

**Fitur: [Phase 2] Ekspor & Impor Data Jabatan**

* **User Story**: Sebagai Admin Master Data, saya dapat mengekspor dan mengimpor data Jabatan via CSV/XLSX, agar setup massal dan backup data lebih cepat.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat mengunduh template CSV/XLSX dan mengunggah dengan mode `tambah` / `tambah+update`.
    * **AC 2**: Validasi per baris (nama & kode unik); baris invalid dilaporkan tanpa membatalkan baris valid.
    * **AC 3**: Admin dapat mengekspor seluruh data jabatan (sesuai filter aktif) ke CSV/XLSX.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

#### Table: `master_position` (Jabatan)

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` | — |
| `position_no` | INTEGER | NOT NULL, UNIQUE | Nomor urut = max+1, tidak editable (BR-A55-05) |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE (WHERE `is_deleted=false`) | Nama jabatan; wajib & unik (BR-A55-01, BR-A55-02) |
| `code` | VARCHAR(50) | NULLABLE, UNIQUE (jika terisi) | Kode baku jabatan; unik bila diisi (BR-A55-03) |
| `description` | VARCHAR(300) | NULLABLE | Deskripsi jabatan |
| `status` | ENUM(`AKTIF`,`NONAKTIF`) | NOT NULL, default `AKTIF` | Status jabatan; diubah via dashboard |
| `is_active` | BOOLEAN | NOT NULL, default `true` | Turunan `status = 'AKTIF'` |
| `approval_status` | ENUM(`none`,`pending`,`approved`,`rejected`) | NOT NULL, default `none` | *Disiapkan untuk Phase 2 (approval berjenjang)* |
| `approver_role` | VARCHAR(50) | NULLABLE | *Disiapkan untuk Phase 2* |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |
| `created_by` | VARCHAR(255) | NOT NULL | — |
| `updated_at` | TIMESTAMPTZ | NULLABLE | — |
| `updated_by` | VARCHAR(255) | NULLABLE | — |

#### Table: `audit_log_position` (Riwayat Aktivitas)

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key | — |
| `position_id` | UUID | NOT NULL, FK → `master_position(id)` | — |
| `position_name` | VARCHAR(100) | NOT NULL | Snapshot nama saat aksi |
| `action` | ENUM(`create`,`update`,`status_change`) | NOT NULL | Kategori aktivitas |
| `diff` | JSONB | NULLABLE | `{field: {old, new}}` untuk aksi update |
| `user_id` | VARCHAR(255) | NOT NULL | Pelaku aksi |
| `user_name` | VARCHAR(255) | NOT NULL | Nama pelaku |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | Waktu aksi |

**Index**: UNIQUE `name` (WHERE `is_deleted=false`), UNIQUE `code` (partial, WHERE `code IS NOT NULL`), UNIQUE `position_no`; index pada `status` untuk performa filter (< 3 detik).

> **Catatan `jumlah_staf`**: dihitung *on-the-fly* via `COUNT` pada tabel Staf (A2) `WHERE position_id = ? AND status='AKTIF'` — **tidak** disimpan sebagai kolom denormalisasi agar tidak basi. [ASUMSI]

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/positions` | List jabatan (query: `search`, `status`, `sort`, `page`, `limit=10`); menyertakan `staff_count` |
| GET | `/api/v1/positions/{id}` | Detail satu jabatan |
| POST | `/api/v1/positions` | Tambah jabatan → validasi (nama/kode unik) → simpan (status=AKTIF) |
| PUT | `/api/v1/positions/{id}` | Update jabatan (semua field kecuali `position_no`) |
| PATCH | `/api/v1/positions/{id}/status` | Ubah status Aktif/Nonaktif (cek staf aktif dahulu) |
| GET | `/api/v1/positions/{id}/audit-logs` | Riwayat aktivitas jabatan |
| POST | `/api/v1/positions/import` | [Phase 2] Impor massal CSV/XLSX |
| GET | `/api/v1/positions/export` | [Phase 2] Ekspor CSV/XLSX |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

*Section: Identitas Jabatan*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `position_no` | Nomor | Number (autofill) | Ya (auto) | Unik, tidak editable, = nomor terakhir + 1 | Sistem | BR-A55-05; tidak editable di Create & Edit |
| `name` | Nama | Text Input | Ya | Min 1, Max 100 char, unik | Input admin | BR-A55-01, BR-A55-02 |
| `code` | Kode | Text Input | Tidak | Max 50 char, unik bila diisi | Input admin | BR-A55-03; identifier baku |
| `description` | Deskripsi | Text Area | Tidak | Max 300 char | Input admin | — |
| `status` | Status Jabatan | Switch (Aktif/Nonaktif) | — | Default Aktif | Sistem | Tidak diinput saat create; diubah via dashboard |

> **Status tidak diinput bebas di form create** (diset `AKTIF` oleh sistem). Pada mode Detail/Edit, field selain Nomor editable; status diubah lewat aksi **Ubah Status** di dashboard, bukan field bebas.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nomor | `position_no` | Angka | Sort | Sesuai Detail Jabatan — Nomor |
| Nama | `name` | Plain text | Sort A–Z (default) / Z–A; Search | Tidak boleh duplikat |
| Kode | `code` | Plain text | Sort; Search | — |
| Jumlah Staf | `COUNT` staf aktif (A2) | Angka | Sort | Dihitung otomatis dari Master Data Staf |
| Status | `status` | Badge (Aktif=hijau / Nonaktif=abu) | Filter | — |
| Aksi | — | Tombol Detail, Ubah Status | — | Tombol ➕ Tambah di header dashboard |

**Layar Detail (UI):** Field identitas jabatan (label-value, semua editable kecuali Nomor) + **Riwayat Aktivitas** (tabel: waktu, user, aksi, diff perubahan; urut waktu descending).

**Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A55-01 | Field **Nama** wajib terisi sebelum Simpan/Update. |
| BR-A55-02 | **Nama** jabatan harus **unik**; duplikat ditolak dengan pesan "Nama Jabatan sudah digunakan, gunakan nama lain." |
| BR-A55-03 | **Kode** jabatan bila diisi harus **unik**; duplikat ditolak dengan pesan "Kode Jabatan sudah digunakan, gunakan kode lain." |
| BR-A55-04 | Jabatan **tidak dapat dinonaktifkan/dihapus** bila masih ditempati **staf aktif**; sistem menolak dengan pesan "Jabatan masih ditempati staf aktif dan tidak dapat dihapus." Staf harus dipindah/dinonaktifkan dahulu. |
| BR-A55-05 | **Nomor** di-generate sistem (nomor terakhir + 1), unik, tidak editable. |
| BR-A55-06 | Jabatan **Nonaktif** tidak muncul sebagai pilihan saat tambah/ubah Staf, tetapi tetap tampil di data historis. |
| BR-A55-07 | Tidak ada hard delete; penonaktifan bersifat **soft** (data historis & staf yang pernah menduduki jabatan tetap terjaga). |
| BR-A55-08 | Setiap create/update/status-change tercatat di **audit log** (tanggal & waktu, user, kategori aksi, diff perubahan). |

---

## 9. Workflow / BPMN Interpretation

> **[ASUMSI]** Tidak ada BPMN Lucidchart untuk modul ini. Alur berdasarkan bagian *Business Process → Flow* pada dokumen sumber dan konvensi operasional RS.

**Alur Tambah / Edit Jabatan (Admin Master Data):**

1. Admin mengakses menu **Master Data - Jabatan** → Dashboard menampilkan daftar jabatan.
2. Admin klik **➕ Tambah** (atau **Detail** untuk edit) → form overlay muncul.
3. Admin mengisi data jabatan (**Nama, Kode, Deskripsi**); Nomor autofill, Status default Aktif.
4. Admin klik **Simpan** (Tambah) / **Update** (Edit).
5. Sistem **validasi**: Nama wajib & unik; Kode unik bila diisi.
   - Jika **tidak valid** → tampilkan pesan error, kembali ke form.
   - Jika **valid** → simpan ke `master_position` + catat **audit log** → redirect ke Dashboard.
6. Jabatan tersedia sebagai **referensi** di Master Data Staf (A2) & modul kepegawaian.

**Alur Ubah Status (Aktif ↔ Nonaktif):**

1. Admin klik **Ubah Status** pada baris jabatan di dashboard.
2. Sistem cek: apakah ada **staf aktif** yang menempati jabatan?
   - Jika **ya** (menonaktifkan) → **blokir** dengan pesan (BR-A55-04).
   - Jika **tidak** → tampilkan **warning konfirmasi** (Aktif → Nonaktif, atau sebaliknya).
3. Admin konfirmasi → sistem mengubah status + catat audit log.
4. Jabatan Nonaktif tidak lagi muncul sebagai pilihan di modul Staf; data historis tetap utuh.

### Case Handling (dari dokumen sumber)

| No | Case | Dampak | Mitigasi |
|----|------|--------|----------|
| 1 | Jabatan dinonaktifkan padahal masih ditempati staf aktif. | Staf kehilangan referensi jabatan; pelaporan kepegawaian tidak konsisten. | Sistem mencegah penonaktifan (BR-A55-04) dan menampilkan pesan; staf harus dipindah/dinonaktifkan dahulu. |
| 2 | Penginputan nama jabatan mirip/duplikat ("Perawat" vs "Suster"). | Data ganda & kebingungan saat memilih jabatan di modul Staf. | Validasi keunikan nama saat Simpan/Update (BR-A55-02); gunakan **Kode Jabatan** sebagai identifier baku; sosialisasikan daftar jabatan baku ke admin RS. |

---

## Informasi Lain

Master Data Jabatan menjadi referensi utama bagi Master Data Staf (A2). Pada modul Staf, field "Jabatan" mengambil sumber data dari master ini. Perubahan atau penonaktifan jabatan berdampak pada staf yang tertaut dan mengikuti aturan validasi BR-A55-04 & BR-A55-06. Untuk membedakan jabatan dengan nama mirip, pertimbangkan penggunaan **Kode Jabatan** sebagai identifier baku.

## Pertanyaan Terbuka

- Apakah **Kode Jabatan** akan diwajibkan sebagai identifier baku (saat ini opsional)? [PERLU KONFIRMASI]
- Apakah perlu klasifikasi jabatan **struktural vs fungsional** sebagai field terpisah untuk pelaporan komposisi SDM? [PERLU KONFIRMASI]
- Definisi resmi "staf aktif" untuk aturan BR-A55-04 (mengikuti status di modul Staf A2)? [PERLU KONFIRMASI]
- Format & kolom baku template Impor/Ekspor Phase 2? [PERLU KONFIRMASI]
