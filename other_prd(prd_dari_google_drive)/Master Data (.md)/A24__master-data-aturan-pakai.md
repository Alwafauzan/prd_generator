# Product Requirement Document (PRD)
# A24 — Master Data Aturan Pakai (New)

---

## 1. Metadata Dokumen

* **Approval**: [Kepala Instalasi Farmasi / Kepala Bidang IT, Jabatan, Tanggal]
* **Related Documents**:
  * A4 — Master Data Barang Farmasi (konsumen dropdown aturan pakai saat input data obat)
  * A21 — Master Data Sediaan Barang (bentuk sediaan mempengaruhi aturan pakai; mis. "Tablet" vs "Sirup")
  * A22 — Master Data Satuan & Kemasan (pola implementasi master referensi serupa)
  * [PERLU KONFIRMASI] Modul e-Resep / Order Obat (konsumen dropdown aturan pakai saat penulisan resep)
  * [PERLU KONFIRMASI] Modul Dispensing Farmasi (konsumen untuk cetak label obat)
  * [PERLU KONFIRMASI] Standar SIG (Signatura) SATUSEHAT atau BPJS e-Klaim terkait instruksi dosis (untuk Phase 2)
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-30 | 1.0 | Draft awal PRD Master Data Aturan Pakai (New) |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Aturan Pakai (New)** menyediakan daftar referensi terpusat untuk instruksi penggunaan obat (*dosage instructions / signatura*) yang digunakan di seluruh alur farmasi SIMRS — dari penulisan e-resep oleh dokter, validasi oleh apoteker, hingga pencetakan label pada kemasan obat yang diserahkan ke pasien. Contoh aturan pakai: *"3 x 1 Tablet Sesudah Makan"*, *"2 x 1/2 Tablet Pagi dan Malam"*, *"Sehari Sekali Sebelum Tidur"*.

Modul ini **tidak memiliki halaman UI khusus bagi end-user**; fungsi utamanya adalah menyediakan sumber data untuk komponen **dropdown** di modul-modul lain (e-Resep, Dispensing). Pengelolaan data dilakukan oleh Admin IT / Admin Farmasi melalui panel konfigurasi admin.

Label **(New)** menandakan versi ulang dari pencatatan aturan pakai lama yang dilakukan dengan **free-text** per transaksi. Versi baru ini menyediakan daftar baku terstruktur — dengan komponen frekuensi, dosis per pakai, waktu minum, dan jalur pemberian — sehingga teks label obat dapat di-generate secara konsisten dan data siap untuk kebutuhan pelaporan dan standarisasi.

> **[ASUMSI]** Aturan pakai bersifat flat (tidak berhierarkis). Setiap entri merepresentasikan satu instruksi dosis lengkap yang siap digunakan sebagai satu pilihan dropdown.

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Dokter mengetik aturan pakai secara bebas (*free-text*) di setiap resep; tidak ada daftar baku. Hasilnya tidak konsisten: "3x1", "3 kali sehari 1 tablet", "tiga kali sehari" merujuk hal yang sama.
- Apoteker harus menginterpretasikan teks bebas untuk mencetak label; rawan salah baca/ketik terutama untuk instruksi yang kompleks.
- Tidak ada komponen terstruktur (frekuensi, dosis, waktu); data aturan pakai tidak dapat diagregasi untuk kebutuhan analitik (mis. kepatuhan resep, pola peresepan).
- Teks label obat diketik ulang manual oleh apoteker/asisten apoteker setiap kali dispensing.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin Farmasi/IT mengelola daftar baku aturan pakai melalui panel admin. Setiap entri memiliki komponen terstruktur (frekuensi, dosis per pakai, waktu minum, jalur pemberian) yang digunakan untuk generate teks label secara otomatis.
- **Phase 1**: CRUD aturan pakai terstruktur + API internal `GET /api/v1/master/dosage-instructions` → dirender sebagai dropdown di form e-Resep dan Dispensing. Teks label digenerate otomatis dari komponen, namun dapat di-override secara manual jika diperlukan.
- **Phase 2**: Pemetaan ke kode standar SIG internasional atau SATUSEHAT untuk keperluan interoperabilitas dan e-Klaim.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Konsistensi instruksi dosis | 0 variasi penulisan aturan pakai yang sama antar dokter/apoteker setelah go-live |
| 2 | Efisiensi input resep | Waktu input aturan pakai di form e-Resep ≤ 5 detik (dropdown search vs ketik manual) |
| 3 | Akurasi teks label | ≥ 99% label obat ter-generate otomatis dari master tanpa perlu koreksi manual oleh apoteker |
| 4 | Ketersediaan API | Endpoint aturan pakai uptime ≥ 99,5% |
| 5 | Waktu load dropdown | Dropdown aturan pakai di form e-Resep/Dispensing load ≤ 500ms |
| 6 | Kemudahan pengelolaan | Admin Farmasi dapat menambah / menonaktifkan aturan pakai tanpa perubahan kode aplikasi |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Standarisasi Kode SIG) |
|---------------|---------------------|-------------------------------------------|
| CRUD Aturan Pakai | Tambah / edit / nonaktifkan aturan pakai (nama tampilan, kode, komponen terstruktur, teks label, status) | Tambah field `sig_code` (kode SIG standar / SATUSEHAT) |
| Komponen terstruktur | `frekuensi`, `dosis_per_pakai`, `waktu_minum` (enum), `jalur_pemberian` (enum) | — |
| Auto-generate teks label | Teks label otomatis disusun dari komponen; dapat di-override | Teks label multi-bahasa (Indonesia + Inggris) |
| API internal — list aturan pakai aktif | `GET /api/v1/master/dosage-instructions` → array aktif untuk dropdown | Filter tambahan `?jalur=` per jalur pemberian |
| Validasi duplikasi nama/kode | Cegah duplikat nama tampilan dan kode singkat | — |
| Pemetaan kode SIG standar | Kolom `sig_code` ada di skema DB Phase 1 (nullable) | Input/lookup kode SIG per entri; validasi ke standar SATUSEHAT |
| Panel admin (UI minimal) | Tabel data + form tambah/edit (akses Superadmin/Admin IT/Admin Farmasi) | Tambah kolom sig_code + status mapping |

**Out of Scope**:
- Halaman UI bagi pengguna reguler (dokter, perawat) untuk melihat/mengelola aturan pakai; akses hanya via panel admin.
- Input free-text aturan pakai di form resep (tetap bisa ada sebagai *fallback* di modul e-Resep, tapi bukan bagian dari modul master ini).
- Kalkulasi dosis otomatis berdasarkan berat badan / luas permukaan tubuh pasien (ada di modul klinis).
- Pengelolaan jadwal minum harian per pasien (ada di modul keperawatan / kepatuhan minum obat).

---

## 5. Related Features

* **A4 — Master Data Barang Farmasi**: Dapat menyertakan default `aturan_pakai_id` per barang sebagai saran awal saat dokter memilih obat di e-Resep. [PERLU KONFIRMASI] apakah default aturan pakai disimpan di level barang atau di level resep.
* **A21 — Master Data Sediaan Barang**: Sediaan mempengaruhi aturan pakai yang relevan (mis. aturan pakai untuk Sirup berbeda dengan Tablet). [PERLU KONFIRMASI] apakah perlu filter dropdown aturan pakai berdasarkan sediaan.
* **A22 — Master Data Satuan & Kemasan**: Pola implementasi serupa (master referensi tanpa UI end-user). Jadikan acuan konvensi API, skema tabel, dan mekanisme toggle aktif/nonaktif.
* **[PERLU KONFIRMASI] Modul e-Resep / Order Obat**: Konsumen utama dropdown aturan pakai. Dokter memilih aturan pakai dari dropdown saat menulis resep; nilai yang tersimpan adalah `dosage_instruction_id` beserta `label_text` snapshot.
* **[PERLU KONFIRMASI] Modul Dispensing Farmasi**: Konsumen untuk cetak label. Apoteker melihat `label_text` dari aturan pakai yang dipilih dokter; teks ini dicetak di label kemasan obat yang diserahkan ke pasien.

---

## 6. Business Process & User Stories

### State Machine — Status Aturan Pakai

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `AKTIF` | Aturan pakai tersedia dan dapat dipilih | Muncul di dropdown e-Resep dan Dispensing | → `NONAKTIF` | → `NONAKTIF` |
| `NONAKTIF` | Aturan pakai dinonaktifkan | Tidak muncul di dropdown untuk resep baru; resep historis yang sudah menggunakan aturan pakai ini **tetap menyimpan snapshot teks label** (data historis terjaga) | → `AKTIF` | → `AKTIF` |

> **[ASUMSI]** Aturan pakai tidak dapat dihapus (hard delete) jika sudah pernah direferensikan oleh ≥ 1 resep historis; hanya dapat dinonaktifkan. Penghapusan hanya diizinkan untuk entri yang belum pernah digunakan.

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A24-01 | Admin IT / Admin Farmasi | Menambah aturan pakai baru dengan komponen terstruktur melalui panel admin | Memperluas daftar instruksi dosis tanpa mengubah kode aplikasi |
| US-A24-02 | Admin IT / Admin Farmasi | Mengedit aturan pakai yang ada (nama, komponen, atau teks label) | Memperbaiki instruksi yang keliru atau memperbarui formulasi |
| US-A24-03 | Admin IT / Admin Farmasi | Menonaktifkan aturan pakai yang sudah tidak relevan | Menjaga dropdown di modul konsumen tetap bersih |
| US-A24-04 | Admin IT / Admin Farmasi | Mengaktifkan kembali aturan pakai yang pernah dinonaktifkan | Memulihkan instruksi yang sempat dihentikan sementara |
| US-A24-05 | System / Modul e-Resep | Mengambil daftar aturan pakai aktif via API untuk dropdown resep | Memungkinkan dokter memilih instruksi dosis dari daftar baku saat menulis resep |
| US-A24-06 | System / Modul Dispensing | Mengambil teks label dari aturan pakai yang dipilih untuk dicetak di kemasan obat | Memastikan teks label konsisten dan otomatis tanpa ketik ulang |
| US-A24-07 | Admin IT / Admin Farmasi | [Phase 2] Memetakan aturan pakai ke kode SIG standar | Memastikan data resep yang dikirim ke SATUSEHAT menggunakan kode instruksi dosis yang terstandar |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Tambah Aturan Pakai**

* **User Story**: Sebagai Admin IT / Admin Farmasi, saya ingin menambah aturan pakai baru dengan mengisi komponen terstruktur melalui panel admin, agar teks label otomatis terbentuk dan dropdown resep bertambah tanpa mengubah kode aplikasi.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form tambah menampilkan field: Nama Tampilan (wajib), Kode Singkat (wajib), Frekuensi/Hari (wajib), Dosis per Pakai (wajib), Waktu Minum (wajib, dropdown enum), Jalur Pemberian (opsional, dropdown enum), Keterangan Tambahan (opsional), dan Preview Teks Label (readonly, otomatis terbentuk).
    * **AC 2**: Sistem menolak penyimpanan jika Nama Tampilan sudah ada (case-insensitive, setelah trim) dengan pesan `"Nama aturan pakai sudah digunakan"`.
    * **AC 3**: Sistem menolak penyimpanan jika Kode Singkat sudah ada (case-insensitive) dengan pesan `"Kode singkat sudah digunakan"`.
    * **AC 4**: Field **Preview Teks Label** otomatis diperbarui setiap kali Admin mengubah salah satu komponen (frekuensi, dosis, waktu, jalur), menampilkan teks yang akan dicetak di label obat. Contoh format: *"3 x 1 Tablet, Sesudah Makan"*.
    * **AC 5**: Admin dapat **meng-override** teks label secara manual di field terpisah "Teks Label (Override)". Jika override diisi, teks ini yang digunakan untuk cetak label — bukan hasil auto-generate.
    * **AC 6**: Setelah berhasil disimpan, status aturan pakai otomatis `AKTIF`; tidak ada input status di form create.
    * **AC 7**: Entri baru langsung tersedia di API `GET /api/v1/master/dosage-instructions` dalam ≤ 1 detik.
    * **AC 8**: Kode Singkat otomatis diubah ke UPPERCASE sebelum disimpan.

* **Validasi**:

  **A. Wording Validasi (Frontend / API Response)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Tampilan | Text | Required; Max 150 karakter; Unik (case-insensitive) | "Nama aturan pakai wajib diisi" / "Nama aturan pakai sudah digunakan" | "Teks yang tampil di dropdown resep. Contoh: 3 x 1 Tablet Sesudah Makan" |
  | Kode Singkat | Text | Required; Max 30 karakter; Alfanumerik + strip; Unik; Auto-UPPERCASE | "Kode singkat wajib diisi" / "Kode singkat sudah digunakan" | "Contoh: 3X1-SM, 2X1-PG-ML, 1X1-STD" |
  | Frekuensi / Hari | Number | Required; Integer ≥ 1; Max 24 | "Frekuensi wajib diisi" / "Frekuensi tidak valid (1–24)" | "Berapa kali sehari obat diminum. Contoh: 3 (untuk 3 kali sehari)" |
  | Dosis per Pakai | Text | Required; Max 20 karakter; Format: angka atau pecahan (1, 1/2, 2, 1/4) | "Dosis per pakai wajib diisi" | "Berapa unit per sekali minum. Contoh: 1, 1/2, 2" |
  | Waktu Minum | Dropdown | Required; nilai dari enum tetap | "Waktu minum wajib dipilih" | "Pilih waktu terbaik untuk mengonsumsi obat ini" |
  | Jalur Pemberian | Dropdown | Opsional; nilai dari enum tetap | — | "Kosongkan jika oral (default). Isi jika bukan oral" |
  | Keterangan Tambahan | Textarea | Opsional; Max 300 karakter | "Keterangan maksimal 300 karakter" | "Catatan klinis tambahan. Contoh: Kocok dahulu sebelum diminum" |
  | Teks Label (Override) | Textarea | Opsional; Max 255 karakter | "Teks label maksimal 255 karakter" | "Isi jika ingin mengganti teks label dari hasil auto-generate" |

---

**Fitur: Edit Aturan Pakai**

* **User Story**: Sebagai Admin IT / Admin Farmasi, saya ingin mengedit komponen aturan pakai yang ada agar instruksi yang keliru atau tidak tepat dapat diperbaiki.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form edit pre-populated dengan seluruh data aturan pakai yang dipilih.
    * **AC 2**: Seluruh field dapat diubah. Validasi duplikasi tetap berlaku, dengan pengecualian untuk entri itu sendiri.
    * **AC 3**: Mengubah komponen (frekuensi, dosis, waktu, jalur) secara otomatis memperbarui Preview Teks Label secara real-time.
    * **AC 4**: Jika aturan pakai sudah pernah digunakan dalam ≥ 1 resep historis, sistem menampilkan banner peringatan: *"Aturan pakai ini sudah digunakan di X resep. Perubahan tidak akan mempengaruhi resep historis yang sudah tersimpan (snapshot teks label tetap seperti semula)."*
    * **AC 5**: Status (AKTIF/NONAKTIF) tidak dapat diubah melalui form edit; dikelola via toggle di list view.
    * **AC 6**: Perubahan langsung tercermin di API dalam ≤ 1 detik.

* **Validasi**: Identik dengan form Tambah, dengan pengecualian duplikasi untuk entri sendiri.

---

**Fitur: Toggle Aktif / Nonaktif Aturan Pakai**

* **User Story**: Sebagai Admin IT / Admin Farmasi, saya ingin menonaktifkan atau mengaktifkan kembali aturan pakai melalui toggle di daftar, agar dropdown di modul konsumen hanya menampilkan instruksi yang relevan.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat men-toggle status aturan pakai dari `AKTIF` → `NONAKTIF` atau sebaliknya langsung dari list view.
    * **AC 2**: Aturan pakai yang dinonaktifkan langsung tidak muncul di respons API `GET /api/v1/master/dosage-instructions` (endpoint dropdown modul konsumen).
    * **AC 3**: Resep historis yang sudah menggunakan aturan pakai yang dinonaktifkan **tidak terpengaruh** — snapshot teks label tetap tersimpan di record resep.
    * **AC 4**: Sistem menampilkan dialog konfirmasi sebelum menonaktifkan aturan pakai yang masih aktif digunakan (dipakai dalam ≥ 1 resep aktif / belum diserahkan): *"Aturan pakai ini masih digunakan di X resep yang sedang berjalan. Menonaktifkan tidak akan membatalkan resep tersebut. Lanjutkan?"*

---

**Fitur: Hapus Aturan Pakai**

* **User Story**: Sebagai Admin IT, saya ingin menghapus aturan pakai yang dibuat salah dan belum pernah digunakan, agar daftar tetap bersih.
* **Prioritas**: P2
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Hapus hanya diizinkan jika aturan pakai belum pernah digunakan dalam resep manapun (jumlah penggunaan = 0).
    * **AC 2**: Jika sudah digunakan, tombol hapus dinonaktifkan atau sistem menolak dengan pesan: *"Aturan pakai tidak dapat dihapus karena sudah digunakan di X resep. Nonaktifkan sebagai gantinya."*
    * **AC 3**: Hapus yang berhasil menghilangkan entri secara permanen (hard delete) dari database.

---

**Fitur: API List Aturan Pakai (untuk Modul Konsumen)**

* **User Story**: Sebagai sistem (modul e-Resep / Dispensing), saya ingin mengambil daftar aturan pakai aktif via API untuk mengisi dropdown instruksi dosis secara dinamis.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: `GET /api/v1/master/dosage-instructions` mengembalikan seluruh aturan pakai berstatus `AKTIF`, diurutkan berdasarkan `display_name` ASC.
    * **AC 2**: Respons JSON menyertakan minimal: `id`, `display_name`, `code`, `frequency_per_day`, `dose_per_use`, `timing`, `route`, `label_text` (teks siap cetak), `notes`.
    * **AC 3**: Response time ≤ 500ms dalam kondisi normal (< 500 entri).
    * **AC 4**: Parameter opsional `?route=ORAL|TOPIKAL|...` untuk filter berdasarkan jalur pemberian.
    * **AC 5**: Parameter opsional `?include_inactive=true` (hanya Admin) mengembalikan semua termasuk yang nonaktif.
    * **AC 6**: Field `label_text` mengembalikan nilai override jika diset, atau teks auto-generate jika tidak ada override.

---

**Fitur: [Phase 2] Pemetaan Kode SIG Standar**

* **User Story**: Sebagai Admin Farmasi, saya ingin memetakan setiap aturan pakai ke kode SIG standar (SATUSEHAT atau standar internasional), agar data resep yang dikirim ke SATUSEHAT menggunakan kode instruksi dosis yang valid.
* **Prioritas**: P1
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat mengisi kolom "Kode SIG" pada form edit aturan pakai secara manual atau melalui tombol "Lookup Standar".
    * **AC 2**: Entri yang sudah memiliki kode SIG ditandai badge "Mapped"; yang belum bertanda "Unmapped".
    * **AC 3**: API mengembalikan `sig_code` dalam respons jika sudah dipetakan, untuk digunakan payload SATUSEHAT.
    * **AC 4**: Sistem menolak kode SIG duplikat (satu kode SIG tidak boleh dipetakan ke lebih dari satu aturan pakai).

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `dosage_instructions`
* **Key Columns**:

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` | — |
| `display_name` | VARCHAR(150) | NOT NULL, UNIQUE (case-insensitive) | Nama yang tampil di dropdown resep |
| `code` | VARCHAR(30) | NOT NULL, UNIQUE | Kode singkat, disimpan UPPERCASE |
| `frequency_per_day` | SMALLINT | NOT NULL, CHECK ≥ 1 | Berapa kali sehari (mis. 3 untuk "3 x 1") |
| `dose_per_use` | VARCHAR(20) | NOT NULL | Dosis per kali pakai (mis. "1", "1/2", "2") |
| `timing` | ENUM | NOT NULL | Waktu minum — lihat nilai enum di bawah |
| `route` | ENUM | NULLABLE | Jalur pemberian — lihat nilai enum di bawah |
| `notes` | VARCHAR(300) | NULLABLE | Keterangan tambahan klinis |
| `label_text_auto` | VARCHAR(255) | NOT NULL | Teks label auto-generate dari komponen; diperbarui otomatis saat simpan |
| `label_text_override` | VARCHAR(255) | NULLABLE | Override teks label manual; jika terisi, dipakai menggantikan `label_text_auto` |
| `sig_code` | VARCHAR(50) | NULLABLE, UNIQUE (jika terisi) | Kode SIG standar (Phase 2); nullable di Phase 1 |
| `is_active` | BOOLEAN | NOT NULL, default `true` | — |
| `created_by` | UUID | NULLABLE, FK → `users(id)` | — |
| `updated_by` | UUID | NULLABLE, FK → `users(id)` | — |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | — |

**Enum `timing`** (Waktu Minum):

| Nilai | Label Tampilan |
|-------|---------------|
| `SEBELUM_MAKAN` | Sebelum Makan |
| `SESUDAH_MAKAN` | Sesudah Makan |
| `SAAT_MAKAN` | Saat Makan |
| `SEBELUM_TIDUR` | Sebelum Tidur |
| `SAAT_BANGUN_TIDUR` | Saat Bangun Tidur |
| `TIDAK_TERIKAT_WAKTU_MAKAN` | Tidak Terikat Waktu Makan |

**Enum `route`** (Jalur Pemberian):

| Nilai | Label Tampilan |
|-------|---------------|
| `ORAL` | Oral (Diminum) |
| `TOPIKAL` | Topikal (Dioleskan) |
| `INJEKSI` | Injeksi |
| `INHALASI` | Inhalasi |
| `TETES_MATA` | Tetes Mata |
| `TETES_TELINGA` | Tetes Telinga |
| `TETES_HIDUNG` | Tetes Hidung |
| `SUBLINGUAL` | Sublingual |
| `SUPPOSITORIA` | Suppositoria / Rektal |

> **Catatan**: Kolom `sig_code` disertakan sejak Phase 1 agar skema siap untuk pemetaan standar SIG di Phase 2 tanpa migrasi merusak.

> **Logika `label_text` yang dikembalikan API**: `COALESCE(label_text_override, label_text_auto)` — override menang jika ada; jika tidak, pakai auto-generate. API field `label_text` di respons sudah merupakan nilai final yang siap dipakai.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/master/dosage-instructions` | List aturan pakai aktif; `?route=` filter by jalur; `?include_inactive=true` untuk admin |
| GET | `/api/v1/master/dosage-instructions/{id}` | Detail satu aturan pakai |
| POST | `/api/v1/master/dosage-instructions` | Buat aturan pakai baru |
| PUT | `/api/v1/master/dosage-instructions/{id}` | Edit aturan pakai |
| PATCH | `/api/v1/master/dosage-instructions/{id}/toggle-active` | Toggle status AKTIF ↔ NONAKTIF |
| DELETE | `/api/v1/master/dosage-instructions/{id}` | Hapus (hanya jika belum pernah digunakan) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `display_name` | Nama Tampilan | Text | Ya | Required; Max 150 karakter; Unik case-insensitive | Input admin | Trim spasi; ini yang muncul di dropdown resep |
| `code` | Kode Singkat | Text | Ya | Required; Max 30 karakter; Alfanumerik + strip; Unik; Auto-UPPERCASE | Input admin | Dipakai untuk identifikasi di laporan & integrasi |
| `frequency_per_day` | Frekuensi / Hari | Number | Ya | Integer ≥ 1, ≤ 24 | Input admin | "Berapa kali sehari" |
| `dose_per_use` | Dosis per Pakai | Text | Ya | Max 20 karakter; format: angka integer atau pecahan (1, 1/2, 2, 1/4) | Input admin | "Berapa unit sekali minum" |
| `timing` | Waktu Minum | Dropdown | Ya | Required; nilai dari enum `timing` | Dropdown tetap (enum) | Menentukan keterangan waktu di teks label |
| `route` | Jalur Pemberian | Dropdown | Tidak | Nilai dari enum `route`; default `ORAL` jika tidak diisi | Dropdown tetap (enum) | Opsional; `ORAL` adalah jalur paling umum |
| `notes` | Keterangan Tambahan | Textarea | Tidak | Max 300 karakter | Input admin | "Contoh: Kocok dahulu sebelum diminum" |
| `label_text_override` | Teks Label (Override) | Textarea | Tidak | Max 255 karakter | Input admin | Kosongkan untuk pakai auto-generate; isi jika perlu teks khusus |
| `label_text_auto` | Preview Teks Label | Readonly text | — | Auto-generate; tidak bisa diedit langsung | Sistem (generate dari komponen) | Tampilkan real-time saat Admin mengisi komponen |
| `is_active` | — | — | — | — | Sistem | Tidak diekspos di form create; otomatis `true` |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nama Tampilan | `display_name` | Plain text | Sort ASC/DESC; Search (contains) | — |
| Kode | `code` | Plain text UPPERCASE | Sort ASC/DESC; Search | — |
| Frekuensi | `frequency_per_day` | "{n}x/hari" | Sort ASC/DESC | — |
| Dosis/Pakai | `dose_per_use` | Plain text | — | — |
| Waktu Minum | `timing` | Label dari enum (mis. "Sesudah Makan") | Filter: per nilai enum | — |
| Jalur | `route` | Label dari enum atau "-" jika ORAL | Filter: per nilai enum | — |
| Teks Label | `label_text_auto` atau `label_text_override` | Plain text (truncate 60 char + tooltip) | — | Tampilkan badge "Override" jika menggunakan label_text_override |
| Status | `is_active` | Badge: "Aktif" / "Nonaktif" | Filter: Semua / Aktif / Nonaktif | Default: Aktif |
| Aksi | — | Tombol Edit, Toggle, Hapus | — | Hapus hanya enabled jika belum pernah digunakan |

**Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A24-01 | `display_name` unik secara case-insensitive dan setelah trim spasi. |
| BR-A24-02 | `code` unik, selalu disimpan UPPERCASE, hanya boleh mengandung huruf A–Z, angka 0–9, dan tanda strip (-). |
| BR-A24-03 | Status selalu di-set `AKTIF` saat pertama kali dibuat; tidak ada input status di form create. |
| BR-A24-04 | `label_text_auto` di-generate otomatis oleh sistem mengikuti format: `"{frequency_per_day} x {dose_per_use}, {label_timing}"` dan opsional diakhiri keterangan route jika bukan ORAL. Contoh: *"3 x 1, Sesudah Makan"* atau *"2 x 1, Sebelum Tidur (Tetes Mata)"*. |
| BR-A24-05 | Field `label_text` yang dikembalikan API adalah `COALESCE(label_text_override, label_text_auto)` — override menang jika diisi. |
| BR-A24-06 | Aturan pakai yang sudah direferensikan oleh ≥ 1 resep historis tidak dapat dihapus (hard delete). |
| BR-A24-07 | Menonaktifkan aturan pakai tidak mengubah snapshot teks label di resep historis; resep yang sudah tersimpan menggunakan teks label saat resep dibuat. |
| BR-A24-08 | Perubahan pada `display_name`, komponen, atau `label_text_override` **tidak otomatis memperbarui** snapshot di resep historis yang sudah menggunakan aturan pakai ini. Snapshot bersifat immutable sejak resep dibuat. |
| BR-A24-09 | API `GET /api/v1/master/dosage-instructions` (tanpa `include_inactive`) hanya mengembalikan aturan pakai berstatus `AKTIF`. |
| BR-A24-10 | [Phase 2] `sig_code` unik per tabel jika terisi; satu kode SIG tidak boleh dipetakan ke lebih dari satu aturan pakai. |

---

## 9. Workflow / BPMN Interpretation

> **[ASUMSI]** Tidak ada BPMN khusus untuk modul ini. Proses bisnis sederhana (pengelolaan data referensi statis tanpa approval berjenjang).

**Alur Pengelolaan Aturan Pakai (Admin IT / Admin Farmasi — via Panel Admin):**

1. Admin login ke SIMRS dan mengakses panel admin (route `/admin/master/dosage-instructions`).
2. Admin melihat list view aturan pakai (default: filter Aktif).
3. **Tambah**: Admin klik + Tambah → isi form (nama, kode, frekuensi, dosis, waktu, jalur, keterangan) → Preview Teks Label otomatis terbentuk → Admin dapat override teks label jika perlu → Simpan → entri langsung tersedia di API.
4. **Edit**: Admin klik Edit pada baris → form pre-populated → ubah field → Preview Teks Label diperbarui real-time → Simpan → perubahan segera tercermin di API (resep historis tidak berubah).
5. **Nonaktifkan**: Admin klik toggle → konfirmasi jika masih ada resep aktif → status `NONAKTIF` → entri hilang dari dropdown modul konsumen.
6. **Aktifkan kembali**: Admin filter "Nonaktif" → klik toggle → entri kembali muncul di dropdown.
7. **Hapus**: Admin klik Hapus (hanya aktif jika penggunaan = 0) → konfirmasi → hapus permanen.

**Alur Konsumsi oleh Modul e-Resep (Otomatis):**

1. Form e-Resep dimuat → memanggil `GET /api/v1/master/dosage-instructions` (opsional dengan `?route=ORAL` jika konteks obat oral sudah diketahui).
2. API mengembalikan array aturan pakai aktif → dirender sebagai dropdown "Aturan Pakai" di form resep.
3. Dokter pilih aturan pakai → sistem menyimpan `dosage_instruction_id` DAN snapshot `label_text` di record resep/item resep.
4. Saat dispensing → apoteker melihat `label_text` dari record resep → teks dicetak di label kemasan obat.
