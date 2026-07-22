# Product Requirement Document (PRD)
# A34 — Master Data Hari Libur

---

## 1. Metadata Dokumen

* **Approval**: [Nama Kepala Bidang IT / Manajer Operasional, Jabatan, Tanggal]
* **Related Documents**:
  * G15 — Jadwal Dokter (Libur & Re-schedule)
  * SOP Pemberitahuan Jadwal Pasien Kontrol
  * [PERLU KONFIRMASI] SOP Libur Nasional RS
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-29 | 1.0 | Draft awal PRD Master Data Hari Libur |
| 2026-06-29 | 1.1 | Tambah seksi Validasi & Spesifikasi UI (Wording Validasi + State Design) per fitur |

---

## 2. Overview & Background

### Overview / Brief Summary

Modul **Master Data Hari Libur** menyediakan repositori terpusat untuk mencatat tanggal-tanggal hari libur resmi (nasional, keagamaan, dan cuti bersama) yang berlaku di rumah sakit. Data ini digunakan sebagai **sumber referensi notifikasi otomatis** kepada pasien yang memiliki jadwal kontrol ulang pada hari-hari tersebut — bukan sebagai penentu libur praktik dokter secara individual.

> **[ASUMSI]** Jadwal libur dokter per-individu dikelola di modul terpisah (G15 — Jadwal Dokter). Modul ini hanya mendefinisikan hari libur **institusional RS** yang menjadi basis pemberitahuan ke pasien.

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini):**
- Informasi hari libur RS tersebar di berbagai media: papan pengumuman, grup WhatsApp staf, dan pengumuman lisan.
- Tidak ada database terpusat; admin harus mengingat atau merujuk kalender fisik.
- Pemberitahuan ke pasien kontrol dilakukan manual (telepon satu per satu oleh staf pendaftaran) — memakan waktu dan rawan terlewat.
- Tidak ada rekam jejak histori penetapan hari libur.
- Konflik informasi sering terjadi antara jadwal dokter dan informasi libur yang diterima pasien.

**To-Be (Workflow Digital yang Diusulkan):**
- Admin Backoffice menginput dan mengelola daftar hari libur RS via form CRUD di modul ini.
- Sistem mencatat setiap hari libur beserta keterangan jenis dan catatan operasional.
- **Phase 1**: Data hari libur tersedia via API internal → dikonsumsi modul notifikasi untuk memeriksa apakah jadwal kontrol pasien jatuh pada hari libur → trigger pesan pemberitahuan otomatis (WhatsApp/SMS) kepada pasien.
- **Phase 2**: Sinkronisasi dua arah dengan Google Calendar RS → hari libur otomatis masuk ke Google Calendar RS; perubahan dari Google Calendar dapat di-import ke sistem.

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|-----------------|
| 1 | Kelengkapan data hari libur | 100% hari libur nasional & cuti bersama tercatat sebelum awal tahun |
| 2 | Akurasi notifikasi ke pasien | ≥ 95% pasien dengan jadwal kontrol pada hari libur menerima notifikasi H-2 |
| 3 | Waktu penginputan hari libur | Admin dapat input batch 1 tahun hari libur dalam < 30 menit |
| 4 | Ketersediaan data via API | Endpoint `/api/hari-libur` uptime ≥ 99,5% |
| 5 | [Phase 2] Sinkronisasi Google Calendar | Lag sinkronisasi ≤ 5 menit setelah perubahan data |

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Integrasi & Otomasi) |
|---------------|---------------------|------------------------------------------|
| Form input hari libur | Tambah / edit / hapus hari libur (tanggal, nama, jenis, keterangan) | — |
| Tampilan daftar hari libur | Tabel dengan filter tahun, jenis, search | Filter tambahan dari Google Calendar |
| Import hari libur nasional | Upload CSV / input manual | Import otomatis dari Google Calendar publik |
| API internal hari libur | `GET /api/hari-libur?tahun=` → array tanggal libur | Webhook untuk trigger notifikasi real-time |
| Notifikasi pasien kontrol | [ASUMSI] Dikonsumsi modul notifikasi terpisah (bukan scope modul ini) | Trigger notifikasi otomatis H-2 terintegrasi langsung |
| Sinkronisasi Google Calendar | — | OAuth2 Google Calendar API, dua arah (push & pull) |
| Riwayat perubahan | Log audit sederhana (createdBy, updatedAt) | Audit trail lengkap dengan diff |

---

## 5. Business Process & User Stories

### State Machine — Status Hari Libur

| Status | Deskripsi | Efek ke Notifikasi Pasien | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------------|--------------------|--------------------|
| `DRAFT` | Data diinput belum dipublish | Tidak aktif sebagai referensi | → `AKTIF` (publish) | → `AKTIF` / sinkronisasi GCal |
| `AKTIF` | Hari libur resmi aktif | Aktif sebagai referensi cek jadwal pasien | → `NONAKTIF` (batalkan) | → `NONAKTIF` / hapus dari GCal |
| `NONAKTIF` | Hari libur dibatalkan/direvisi | Tidak aktif; pasien kontrol tidak mendapat notifikasi libur | → `AKTIF` (reaktivasi) | — |

> [ASUMSI] Status `DRAFT` digunakan untuk persiapan kalender tahun berikutnya sebelum dipublish.

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A34-01 | Admin Backoffice | Menambah entri hari libur baru | Agar data libur RS tersedia sebagai referensi sistem notifikasi |
| US-A34-02 | Admin Backoffice | Mengedit atau membatalkan hari libur yang sudah dicatat | Agar sistem tidak mengirimkan notifikasi keliru jika ada perubahan kalender |
| US-A34-03 | Admin Backoffice | Melihat daftar hari libur per tahun dengan filter | Agar mudah memeriksa kelengkapan data sebelum awal tahun |
| US-A34-04 | Sistem (Internal API consumer) | Mengambil daftar tanggal libur untuk rentang tertentu | Agar modul jadwal/notifikasi dapat memeriksa apakah tanggal kontrol pasien adalah hari libur |
| US-A34-05 | [Phase 2] Admin IT | Menghubungkan sistem ke Google Calendar RS | Agar hari libur yang diinput otomatis muncul di Google Calendar dan sebaliknya |

---

## 6. Functional & UI/UX Requirements

### 6.1 UI/UX Requirements

**General Flow:**
```
Sidebar "Control Panel" → "Master Data" → "Hari Libur"
  ├─ Halaman Daftar Hari Libur (default view — tabel + filter)
  │    └─ Tombol [+ Tambah Hari Libur] → Modal / Halaman Form
  ├─ Aksi per baris: [Edit] [Nonaktifkan] [Hapus]
  └─ [Phase 2] Tombol [Sinkronisasi Google Calendar]
```

**Dashboard / List View:**
- Tabel dengan kolom: No, Tanggal, Nama Hari Libur, Jenis, Status, Keterangan, Aksi.
- Filter: Tahun (dropdown, default tahun berjalan), Jenis Libur (multiselect), Status.
- Search: pencarian teks bebas pada kolom Nama Hari Libur.
- Pagination: 20 baris per halaman.
- Badge warna pada Status: `AKTIF` = hijau, `DRAFT` = kuning, `NONAKTIF` = abu.
- Tampilan tanggal format: `Senin, 1 Januari 2026`.

---

### 6.2 Feature Requirements & Acceptance Criteria

---

**Fitur: Tambah Hari Libur**
* **User Story**: Sebagai Admin Backoffice, saya ingin menambahkan entri hari libur baru agar data libur RS tersedia untuk referensi notifikasi pasien.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form memiliki field: Tanggal (date picker, wajib), Nama Hari Libur (text, wajib, maks 100 karakter), Jenis Libur (dropdown: Nasional / Keagamaan / Cuti Bersama / Lokal RS, wajib), Keterangan (textarea, opsional, maks 500 karakter), Status (radio: Draft / Aktif, default Draft).
  * **AC 2**: Sistem menolak submit jika Tanggal sudah ada di database dengan status `AKTIF` — tampil pesan: *"Tanggal [dd/mm/yyyy] sudah terdaftar sebagai hari libur aktif: [nama]."*
  * **AC 3**: Setelah berhasil disimpan, entri muncul di daftar dengan status sesuai pilihan, diurutkan berdasarkan tanggal ascending.
  * **AC 4**: Log audit mencatat `createdBy` (username admin) dan `createdAt` (timestamp).

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Tanggal | Date picker | Required | "Tanggal wajib diisi" | "Pilih tanggal hari libur" |
  | Tanggal | Date picker | Duplikat AKTIF (server) | "Tanggal [dd/mm/yyyy] sudah terdaftar sebagai hari libur aktif: [nama]" | — |
  | Nama Hari Libur | Text | Required | "Nama hari libur wajib diisi" | "Contoh: Hari Raya Idul Fitri 1447 H" |
  | Nama Hari Libur | Text | Max 100 karakter | "Nama tidak boleh lebih dari 100 karakter ([X]/100)" | — |
  | Jenis Libur | Dropdown | Required | "Jenis libur wajib dipilih" | "Pilih kategori hari libur" |
  | Keterangan | Textarea | Max 500 karakter | "Keterangan tidak boleh lebih dari 500 karakter ([X]/500)" | "Keterangan tambahan (opsional)" |
  | Status | Radio | Required | — | "Draft: belum aktif sebagai referensi. Aktif: langsung digunakan sistem." |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Field `created_by` dan `created_at` tidak ditampilkan di form (dicatat sistem secara otomatis).
  * **Button State**: Tombol [Simpan] disabled selama field wajib belum terisi atau ada error validasi frontend; tampil spinner + label "Menyimpan..." saat request sedang diproses.
  * **Empty State**: — (form selalu tampil saat dibuka via tombol [+ Tambah Hari Libur])

---

**Fitur: Edit Hari Libur**
* **User Story**: Sebagai Admin Backoffice, saya ingin mengubah data hari libur yang sudah dicatat agar informasi tetap akurat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Edit] membuka form pre-filled dengan data existing. Semua field dapat diubah kecuali `createdAt` dan `createdBy`.
  * **AC 2**: Setelah simpan, sistem memperbarui `updatedAt` dan `updatedBy`.
  * **AC 3**: Jika status diubah dari `AKTIF` ke `NONAKTIF`, sistem menampilkan konfirmasi: *"Menonaktifkan hari libur ini akan menghentikan referensi notifikasi untuk tanggal ini. Lanjutkan?"*

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Hari Libur | Text | Required | "Nama hari libur wajib diisi" | — |
  | Nama Hari Libur | Text | Max 100 karakter | "Nama tidak boleh lebih dari 100 karakter ([X]/100)" | — |
  | Jenis Libur | Dropdown | Required | "Jenis libur wajib dipilih" | — |
  | Keterangan | Textarea | Max 500 karakter | "Keterangan tidak boleh lebih dari 500 karakter ([X]/500)" | — |
  | Status (ke NONAKTIF) | Radio | Konfirmasi perubahan kritis | Modal: "Menonaktifkan hari libur ini akan menghentikan referensi notifikasi untuk tanggal ini. Lanjutkan?" | — |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Field `created_by`, `created_at` tidak dapat diubah dan tidak ditampilkan di form edit; field `tanggal` [PERLU KONFIRMASI] apakah boleh diubah saat status sudah AKTIF.
  * **Button State**: Tombol [Simpan Perubahan] disabled jika tidak ada perubahan dari nilai awal (dirty check); tampil spinner + "Menyimpan..." saat request berlangsung.
  * **Empty State**: — (form selalu pre-filled dengan data existing)

---

**Fitur: Hapus Hari Libur**
* **User Story**: Sebagai Admin Backoffice, saya ingin menghapus entri hari libur yang salah input agar data tetap bersih.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Hapus] hanya muncul pada entri berstatus `DRAFT` atau `NONAKTIF`. Entri berstatus `AKTIF` tidak dapat dihapus langsung — harus di-nonaktifkan dulu.
  * **AC 2**: Konfirmasi hapus tampil: *"Entri hari libur '[nama]' ([tanggal]) akan dihapus permanen. Yakin?"*
  * **AC 3**: Setelah hapus, entri hilang dari daftar dan tidak dapat di-recover via UI.

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | Konfirmasi dialog | — | Modal konfirmasi: "Entri hari libur '[nama]' ([tanggal]) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan. Yakin?" | — |
  | Tombol [Hapus] pada entri AKTIF | Button | Tidak dapat dihapus langsung | Tooltip / disabled state: "Nonaktifkan terlebih dahulu sebelum menghapus" | — |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: — (tidak ada form input pada fitur ini)
  * **Button State**: Tombol [Hapus] hanya visible pada baris berstatus `DRAFT` atau `NONAKTIF`; di-hide (bukan disabled) untuk baris berstatus `AKTIF`. Tombol [Konfirmasi Hapus] dalam modal tampil spinner + disabled saat request berlangsung.
  * **Empty State**: — (tidak relevan pada fitur hapus)

---

**Fitur: Daftar & Filter Hari Libur**
* **User Story**: Sebagai Admin Backoffice, saya ingin melihat seluruh daftar hari libur dengan kemampuan filter agar mudah memverifikasi kelengkapan data.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Default tampil hari libur tahun berjalan, diurutkan tanggal ascending.
  * **AC 2**: Filter tahun mengubah tampilan tanpa reload halaman; dropdown berisi tahun dari data terlama hingga tahun depan.
  * **AC 3**: Filter jenis libur (multiselect) dan filter status dapat dikombinasikan.
  * **AC 4**: Search teks memfilter baris secara real-time (debounce 300ms) pada kolom Nama Hari Libur.
  * **AC 5**: Jumlah entri yang tampil tertera di atas tabel: *"Menampilkan X dari Y entri"*.

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Search Nama | Text | — | — | "Cari nama hari libur..." |
  | Filter Tahun | Dropdown | — | — | Default: tahun berjalan |
  | Filter Jenis | Multiselect | — | — | "Semua jenis" bila tidak ada yang dipilih |
  | Filter Status | Dropdown | — | — | "Semua status" bila tidak dipilih |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Seluruh tabel bersifat read-only; aksi dilakukan via tombol di kolom Aksi, bukan inline edit.
  * **Button State**: Tombol [+ Tambah Hari Libur] selalu enabled; tombol navigasi pagination disabled pada halaman pertama/terakhir; tombol [Reset Filter] hanya muncul jika ada filter aktif.
  * **Empty State**:
    * Belum ada data sama sekali: *"Belum ada data hari libur untuk tahun [YYYY]. Klik [+ Tambah Hari Libur] untuk menambahkan."*
    * Ada filter aktif tapi tidak ada hasil: *"Tidak ada data yang cocok dengan filter yang dipilih. Coba ubah atau reset filter."*

---

**Fitur: API Internal — Cek Hari Libur**
* **User Story**: Sebagai sistem (modul notifikasi/jadwal), saya ingin mengambil daftar hari libur aktif untuk rentang tanggal tertentu agar dapat memeriksa apakah jadwal kontrol pasien jatuh pada hari libur.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Endpoint `GET /api/master/hari-libur` tersedia dengan parameter query: `dari` (date, format `YYYY-MM-DD`), `sampai` (date), `status` (default `AKTIF`).
  * **AC 2**: Response berupa JSON array: `[{ "tanggal": "YYYY-MM-DD", "nama": "...", "jenis": "...", "keterangan": "..." }]`.
  * **AC 3**: Jika tidak ada hari libur pada rentang yang diminta, response adalah array kosong `[]` dengan HTTP 200.
  * **AC 4**: Endpoint hanya dapat diakses oleh service internal (autentikasi via service token / internal header) — tidak exposed ke publik.
  * **AC 5**: Response time ≤ 200ms untuk query rentang 1 tahun.

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  *Fitur ini tidak memiliki form UI langsung — konsumsi API dilakukan sistem-ke-sistem. Validasi ada di sisi server (lihat AC 1–5).*

  **B. State Design (UI/UX)**
  * **Read-only Mode**: — (tidak ada UI end-user untuk fitur ini)
  * **Button State**: — (tidak ada UI end-user untuk fitur ini)
  * **Empty State**: — (tidak ada UI end-user untuk fitur ini)

---

**Fitur: Import Hari Libur via CSV**
* **User Story**: Sebagai Admin Backoffice, saya ingin mengimpor daftar hari libur nasional sekaligus dari file CSV agar tidak perlu input satu per satu.
* **Prioritas**: P2
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tersedia tombol [Import CSV] yang membuka dialog upload. Template CSV dapat diunduh dari halaman yang sama.
  * **AC 2**: Format CSV: kolom `tanggal` (YYYY-MM-DD), `nama`, `jenis`, `keterangan` (opsional).
  * **AC 3**: Sistem memvalidasi setiap baris sebelum simpan; baris yang gagal validasi ditampilkan dalam ringkasan error (baris ke-N: alasan error). Baris valid tetap disimpan.
  * **AC 4**: Duplikat tanggal yang sudah ada di DB (status AKTIF) di-skip dan dilaporkan.
  * **AC 5**: Batas upload: maks 366 baris per file (1 tahun kalender).

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | File CSV | File upload | Required, ekstensi `.csv` saja | "Format file tidak didukung. Hanya file .csv yang diterima." | "Unduh template CSV sebagai panduan format" |
  | File CSV | File upload | Maks 366 baris | "File melebihi batas maksimum 366 baris (1 tahun kalender)." | — |
  | Kolom `tanggal` (per baris) | CSV cell | Format YYYY-MM-DD | "Baris [N]: Format tanggal tidak valid. Gunakan format YYYY-MM-DD." | — |
  | Kolom `jenis` (per baris) | CSV cell | Enum valid | "Baris [N]: Jenis '[nilai]' tidak dikenal. Nilai yang valid: NASIONAL, KEAGAMAAN, CUTI_BERSAMA, LOKAL_RS." | — |
  | Kolom `nama` (per baris) | CSV cell | Required, maks 100 karakter | "Baris [N]: Nama hari libur wajib diisi." / "Baris [N]: Nama melebihi 100 karakter." | — |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Setelah file dipilih, pratinjau 5 baris pertama ditampilkan dalam tabel sebelum import dikonfirmasi.
  * **Button State**: Tombol [Import] disabled sebelum file dipilih; tampil progress bar + "Memproses X dari Y baris..." saat import berjalan; tombol [Batal] tersedia selama proses berjalan.
  * **Empty State**: Area drop-zone menampilkan: *"Seret file CSV ke sini, atau klik untuk memilih file."* dengan ikon upload dan link *"Unduh template CSV"*.

---

**Fitur: [Phase 2] Sinkronisasi Google Calendar**
* **User Story**: Sebagai Admin IT, saya ingin menghubungkan Master Data Hari Libur ke Google Calendar RS agar hari libur yang dicatat di sistem otomatis muncul di kalender RS dan dapat diimport balik.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Halaman pengaturan integrasi tersedia di Settings → Integrasi → Google Calendar, dengan tombol [Connect with Google] yang memulai alur OAuth2.
  * **AC 2**: Setelah terhubung, setiap hari libur yang di-set AKTIF otomatis ditambahkan sebagai event di Google Calendar RS yang dipilih (field: judul = nama libur, all-day event, deskripsi = jenis + keterangan).
  * **AC 3**: Perubahan status ke NONAKTIF menghapus event terkait dari Google Calendar.
  * **AC 4**: Tersedia tombol [Sync dari Google Calendar] untuk mengambil event dari Google Calendar RS sebagai draft hari libur baru (memerlukan konfirmasi admin sebelum di-AKTIF-kan).
  * **AC 5**: [PERLU KONFIRMASI] Jika token OAuth2 kedaluwarsa, sistem menampilkan alert di halaman Hari Libur dan halaman Settings tanpa mengganggu fungsionalitas Phase 1.

* **Validasi & Spesifikasi UI**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | OAuth2 flow | Koneksi gagal | "Koneksi ke Google Calendar gagal. Pastikan akun memiliki akses ke kalender RS yang dipilih." | — |
  | — | Token OAuth2 | Token kedaluwarsa | Banner alert: "Koneksi Google Calendar kedaluwarsa. Hubungkan ulang di Settings → Integrasi → Google Calendar." | — |
  | Sync dari GCal | Button | Tidak ada event baru | Info toast: "Tidak ada hari libur baru yang ditemukan di Google Calendar." | — |

  **B. State Design (UI/UX)**
  * **Read-only Mode**: Daftar event yang diimpor dari Google Calendar masuk sebagai `DRAFT` dan hanya dapat diaktifkan setelah konfirmasi admin — field `tanggal` dan `nama` dari GCal di-lock (read-only), hanya `jenis` dan `keterangan` yang dapat diubah sebelum diaktifkan.
  * **Button State**: Tombol [Connect with Google] berubah menjadi [Terhubung ✓ — Putuskan] setelah koneksi berhasil; tombol [Sync dari GCal] tampil disabled + spinner "Menyinkronkan..." selama proses berlangsung; tidak dapat diklik ulang hingga selesai.
  * **Empty State**: Halaman Settings → Integrasi → Google Calendar menampilkan: *"Belum terhubung ke Google Calendar. Klik [Connect with Google] untuk mulai sinkronisasi hari libur RS."*

---

## 7. Data & Business Rules

### 7.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `id` | — | UUID | Auto | Auto-generate | Sistem | Primary key, tidak ditampilkan ke user |
| `tanggal` | Tanggal | Date | Ya | Format YYYY-MM-DD; tidak boleh duplikat dengan status AKTIF | Input admin | Date picker, tampil dd/mm/yyyy |
| `nama` | Nama Hari Libur | String | Ya | Maks 100 karakter; tidak boleh kosong | Input admin | Contoh: "Hari Raya Idul Fitri 1447 H" |
| `jenis` | Jenis Libur | Enum | Ya | Nilai: `NASIONAL`, `KEAGAMAAN`, `CUTI_BERSAMA`, `LOKAL_RS` | Dropdown sistem | [PERLU KONFIRMASI] apakah ada jenis lain |
| `keterangan` | Keterangan | Text | Tidak | Maks 500 karakter | Input admin | Contoh: "Termasuk cuti bersama pemerintah" |
| `status` | Status | Enum | Ya | Nilai: `DRAFT`, `AKTIF`, `NONAKTIF` | Input admin | Default: `DRAFT` |
| `created_by` | — | String | Auto | Username login | Sistem | Tidak ditampilkan di form |
| `created_at` | — | Timestamp | Auto | Auto server time | Sistem | Log audit |
| `updated_by` | — | String | Auto | Username login | Sistem | Diisi saat edit |
| `updated_at` | — | Timestamp | Auto | Auto server time | Sistem | Diperbarui tiap edit |
| `gcal_event_id` | — | String | Tidak | String ID event Google Calendar | Google Calendar API | [Phase 2] Null jika belum sinkronisasi |

### 7.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No | Urutan tampilan | Integer | — | Reset per halaman |
| Tanggal | `tanggal` | `EEE, dd MMM yyyy` (contoh: Sen, 01 Jan 2026) | Sort ascending/descending | Default sort ascending |
| Nama Hari Libur | `nama` | String | Search teks, Sort | — |
| Jenis | `jenis` | Label: Nasional / Keagamaan / Cuti Bersama / Lokal RS | Filter multiselect | Badge warna per jenis |
| Status | `status` | Badge: Aktif (hijau) / Draft (kuning) / Nonaktif (abu) | Filter dropdown | — |
| Keterangan | `keterangan` | Truncate 80 char + tooltip full text | — | Tampil "-" jika kosong |
| Aksi | — | Tombol [Edit] [Nonaktifkan/Aktifkan] [Hapus] | — | [Hapus] hanya untuk DRAFT/NONAKTIF |

### 7.3 Business Rules

| ID | Aturan |
|----|--------|
| BR-A34-01 | Satu tanggal hanya boleh memiliki **satu** entri berstatus `AKTIF`. Entri duplikat tanggal dengan status berbeda (DRAFT/NONAKTIF) diperbolehkan. |
| BR-A34-02 | Modul ini **bukan** penentu libur praktik dokter. Jadwal praktik dokter dikelola di modul G15. Modul ini hanya menyediakan referensi hari libur institusional RS untuk keperluan notifikasi pasien. |
| BR-A34-03 | Data hari libur yang berstatus `AKTIF` dikonsumsi oleh sistem notifikasi untuk memeriksa jadwal kontrol pasien. Modul notifikasi **hanya membaca** data dari modul ini — tidak ada modifikasi lintas modul. |
| BR-A34-04 | Entri berstatus `AKTIF` tidak dapat langsung dihapus. Harus di-nonaktifkan terlebih dahulu, kemudian baru dapat dihapus. |
| BR-A34-05 | Jenis libur `LOKAL_RS` digunakan untuk hari libur spesifik RS yang tidak ada di kalender nasional (contoh: hari jadi RS, kegiatan akreditasi). |
| BR-A34-06 | [PERLU KONFIRMASI] Apakah hari libur yang jatuh di akhir pekan (Sabtu/Minggu) tetap perlu dicatat? Saat ini diasumsikan YA — dicatat agar data lengkap, meski umumnya tidak berdampak pada jadwal pasien weekday. |
| BR-A34-07 | [Phase 2] Perubahan data hari libur (tambah/nonaktifkan) yang berasal dari import Google Calendar harus melalui konfirmasi admin sebelum berstatus `AKTIF`. |

---

## 8. Workflow / BPMN Interpretation

> [ASUMSI] Tidak tersedia file BPMN spesifik untuk modul ini. Alur berikut disusun berdasarkan analogi proses Master Data umum dan kebutuhan fungsional yang dijelaskan.

### Alur Phase 1 — Input & Konsumsi Hari Libur

```
[Admin Backoffice]
  │
  ├─ Buka halaman Master Data Hari Libur
  ├─ Klik [+ Tambah Hari Libur]
  ├─ Isi form (tanggal, nama, jenis, keterangan, status)
  │    ├─ [Validasi GAGAL] → Tampil pesan error inline → Kembali ke form
  │    └─ [Validasi OK] → Simpan ke DB
  │         ├─ Status = DRAFT → Tersimpan, belum aktif sebagai referensi
  │         └─ Status = AKTIF → Tersimpan, langsung tersedia via API internal
  │
[Sistem Notifikasi — modul terpisah]
  │
  ├─ Saat pasien mendaftar kontrol ulang:
  │    └─ GET /api/master/hari-libur?dari=&sampai= → cek apakah tanggal kontrol = hari libur
  │         ├─ [Bukan hari libur] → Proses normal, tidak ada notifikasi libur
  │         └─ [Hari libur ditemukan] → Trigger notifikasi ke pasien:
  │              "Jadwal kontrol Anda pada [tanggal] bertepatan dengan hari libur RS ([nama libur]).
  │               Mohon hubungi pendaftaran untuk penjadwalan ulang."
```

### Alur Phase 2 — Sinkronisasi Google Calendar

```
[Admin IT]
  │
  ├─ Settings → Integrasi → Google Calendar → [Connect with Google]
  ├─ OAuth2 consent → Pilih Google Calendar RS
  └─ Koneksi tersimpan (token disimpan terenkripsi)

[Sistem — Otomasi]
  │
  ├─ Saat hari libur di-AKTIF-kan → Push event ke Google Calendar RS
  ├─ Saat hari libur di-NONAKTIF-kan → Hapus event dari Google Calendar RS
  └─ [Sync dari GCal] → Ambil event dari GCal → Tampil sebagai DRAFT → Admin konfirmasi → AKTIF
```

---

## 9. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-A34-01 | Performa | Halaman daftar (1 tahun data) load < 2 detik |
| NFR-A34-02 | Performa | API internal `/api/master/hari-libur` response time ≤ 200ms |
| NFR-A34-03 | Keamanan | Endpoint API internal hanya dapat diakses dengan service token; tidak exposed ke publik atau client-side |
| NFR-A34-04 | Keamanan | Akses halaman admin dibatasi role: `ADMIN_BACKOFFICE`, `ADMIN_IT`, `SUPERADMIN` |
| NFR-A34-05 | Audit | Setiap perubahan data mencatat `updatedBy` dan `updatedAt` — tersimpan minimal 1 tahun |
| NFR-A34-06 | [Phase 2] Keamanan | Token OAuth2 Google Calendar disimpan terenkripsi (AES-256 atau vault); tidak disimpan plaintext di DB |

---

## 10. Open Questions & Assumptions

### Asumsi
- [ASUMSI] Jadwal libur dokter individu **tidak** dikelola di modul ini — dikelola di G15. Modul A34 hanya menetapkan hari libur institusional RS sebagai referensi notifikasi.
- [ASUMSI] Modul notifikasi yang mengonsumsi data hari libur ini merupakan modul terpisah yang dikembangkan di sprint/tim lain.
- [ASUMSI] Entri hari libur di akhir pekan (Sabtu/Minggu) tetap dicatat meski potensi dampaknya lebih kecil.
- [ASUMSI] Data hari libur nasional tidak diambil otomatis dari API pemerintah — diinput manual atau via CSV oleh admin.

### Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah tipe libur `LOKAL_RS` sudah cukup, atau ada sub-kategori lain yang dibutuhkan (contoh: libur sebagian unit, libur poliklinik tertentu)?
- [PERLU KONFIRMASI] Apakah hari libur yang jatuh bersamaan dengan jadwal kontrol pasien cukup dengan notifikasi satu arah (ke pasien), atau ada notifikasi ke staf/dokter terkait juga?
- [PERLU KONFIRMASI] Berapa hari sebelum tanggal kontrol notifikasi harus dikirim? (Diasumsikan H-2 berdasarkan best practice, perlu konfirmasi SOP RS.)
- [PERLU KONFIRMASI] Untuk Phase 2: Google Calendar mana yang digunakan (calendar RS, bukan personal dokter)?
- [PERLU KONFIRMASI] Apakah perlu fitur `recurring` untuk hari libur yang berulang setiap tahun pada tanggal tetap (mis. 17 Agustus)?
