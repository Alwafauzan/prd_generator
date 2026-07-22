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
| 2026-06-29 | 1.1 | Tambah seksi Validasi & Spesifikasi UI per fitur |
| 2026-06-29 | 1.2 | Restrukturisasi sesuai template: tambah Related Features G15, DB Schema, API Endpoints; status behavior sesuai template (auto-AKTIF pada create) |

---

## 2. Overview & Background

* **Overview/Brief Summary**: Modul **Master Data Hari Libur** menyediakan repositori terpusat untuk mencatat tanggal-tanggal hari libur resmi (nasional, keagamaan, dan cuti bersama) yang berlaku di rumah sakit. Data ini digunakan sebagai **sumber referensi notifikasi otomatis** kepada pasien yang memiliki jadwal kontrol ulang pada hari-hari tersebut, serta sebagai acuan validasi oleh modul G15 (Jadwal Dokter) saat mengelola libur dan re-schedule dokter.

* **Business Process (As-Is vs To-Be)**:

  * **As-Is**: Informasi hari libur RS tersebar di berbagai media: papan pengumuman, grup WhatsApp staf, dan pengumuman lisan. Tidak ada database terpusat; admin harus mengingat atau merujuk kalender fisik. Pemberitahuan ke pasien kontrol dilakukan manual (telepon satu per satu oleh staf pendaftaran) — memakan waktu dan rawan terlewat. Tidak ada rekam jejak histori penetapan hari libur. Konflik informasi sering terjadi antara jadwal dokter dan informasi libur yang diterima pasien. Modul jadwal dokter (G15) tidak memiliki acuan otomatis hari libur RS sehingga re-schedule dilakukan secara manual.

  * **To-Be**: Admin Backoffice menginput dan mengelola daftar hari libur RS via form CRUD di modul ini. Sistem mencatat setiap hari libur beserta keterangan jenis dan catatan operasional; status langsung `AKTIF` saat disimpan dan dapat dikelola (nonaktifkan/aktifkan) dari Dashboard. **Phase 1**: Data hari libur tersedia via API internal → dikonsumsi modul notifikasi untuk memeriksa apakah jadwal kontrol pasien jatuh pada hari libur; dikonsumsi G15 untuk validasi re-schedule dokter. **Phase 2**: Sinkronisasi dua arah dengan Google Calendar RS → hari libur otomatis masuk ke Google Calendar RS; perubahan dari Google Calendar dapat di-import ke sistem → trigger pesan pemberitahuan otomatis (WhatsApp/SMS) kepada pasien.

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan data hari libur | 100% hari libur nasional & cuti bersama tercatat sebelum awal tahun |
| 2 | Akurasi notifikasi ke pasien | ≥ 95% pasien dengan jadwal kontrol pada hari libur menerima notifikasi H-2 |
| 3 | Waktu penginputan hari libur | Admin dapat input 1 tahun hari libur dalam < 30 menit |
| 4 | Ketersediaan data via API | Endpoint `/api/v1/master/hari-libur` uptime ≥ 99,5% |
| 5 | [Phase 2] Sinkronisasi Google Calendar | Lag sinkronisasi ≤ 5 menit setelah perubahan data |

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Integrasi & Otomasi) |
|-------------|---------------------|-----------------------------------------|
| Form input hari libur | Tambah / edit / hapus hari libur (tanggal, nama, jenis, keterangan); status auto-AKTIF | — |
| Tampilan daftar hari libur | Tabel dengan filter tahun, jenis, status, search | Filter tambahan dari Google Calendar |
| Toggle status | Nonaktifkan / aktifkan dari Dashboard | — |
| API internal hari libur | `GET /api/v1/master/hari-libur` → dikonsumsi notifikasi & G15 | Webhook untuk trigger notifikasi real-time |
| Notifikasi pasien kontrol | [ASUMSI] Dikonsumsi modul notifikasi terpisah (bukan scope modul ini) | Trigger notifikasi otomatis H-2 terintegrasi langsung |
| Import hari libur via CSV | — | Upload CSV batch 1 tahun |
| Sinkronisasi Google Calendar | — | OAuth2 Google Calendar API, dua arah (push & pull) |
| Riwayat perubahan | Log audit sederhana (created_by, updated_at) | Audit trail lengkap dengan diff |

**Out of Scope**:
- Pengelolaan jadwal praktik dokter individu (dikelola di G15)
- Notifikasi otomatis ke pasien (dikonsumsi modul notifikasi terpisah)
- Integrasi API kalender pemerintah untuk hari libur nasional (Phase 1: diinput manual; Phase 2: via CSV / GCal)

---

## 5. Related Features

* **G15 — Jadwal Dokter (Libur & Re-schedule)** *(Core Integration / Facility Management)*
  A34 adalah sumber data hari libur institusional RS yang dikonsumsi G15 via `GET /api/v1/master/hari-libur` untuk memvalidasi apakah jadwal praktik dokter jatuh pada hari libur RS. Ketika admin mengaktifkan atau menonaktifkan hari libur di A34, G15 perlu membaca perubahan tersebut untuk memfasilitasi re-schedule dokter yang terdampak. Data `status = AKTIF` dari A34 menjadi acuan validasi di alur G15; modul G15 hanya **membaca** data A34, tidak ada write-back.

---

## 6. Business Process & User Stories

* **State Machine Table**:

| Status | Deskripsi | Efek Notifikasi & G15 | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|----------------------|--------------------|--------------------|
| `AKTIF` | Hari libur resmi aktif | Aktif sebagai referensi; G15 membaca data ini; trigger notifikasi pasien | → `NONAKTIF` (nonaktifkan via toggle Dashboard) | → `NONAKTIF` / hapus dari GCal |
| `NONAKTIF` | Hari libur dibatalkan/direvisi | Tidak aktif; pasien kontrol tidak mendapat notifikasi libur; G15 tidak menganggap tanggal ini sebagai hari libur | → `AKTIF` (aktifkan kembali via toggle Dashboard) | — |
| `DRAFT` | Impor dari Google Calendar, belum dikonfirmasi | Tidak aktif sebagai referensi | — | → `AKTIF` (konfirmasi admin) |

> **[ASUMSI]** Pada Phase 1, sistem otomatis menyimpan setiap entri baru dengan status `AKTIF`. Pengelolaan status dilakukan di level Dashboard (toggle), bukan di form create/edit. Status `DRAFT` hanya digunakan pada Phase 2 untuk entri hasil impor dari Google Calendar yang menunggu konfirmasi admin.

* **User Stories Utama**:

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A34-01 | Admin Backoffice | Menambah entri hari libur baru | Agar data libur RS tersedia sebagai referensi sistem notifikasi dan modul G15 |
| US-A34-02 | Admin Backoffice | Mengedit data hari libur yang sudah dicatat | Agar informasi hari libur tetap akurat |
| US-A34-03 | Admin Backoffice | Mengaktifkan / menonaktifkan hari libur dari Dashboard | Agar referensi notifikasi dan validasi G15 selalu mencerminkan kondisi aktual |
| US-A34-04 | Admin Backoffice | Melihat daftar hari libur per tahun dengan filter | Agar mudah memeriksa kelengkapan data sebelum awal tahun |
| US-A34-05 | Sistem (modul notifikasi / G15) | Mengambil daftar tanggal libur aktif untuk rentang tertentu via API | Agar dapat memeriksa apakah tanggal kontrol pasien atau jadwal dokter jatuh pada hari libur RS |
| US-A34-06 | [Phase 2] Admin IT | Menghubungkan sistem ke Google Calendar RS | Agar hari libur yang diinput otomatis muncul di Google Calendar dan sebaliknya |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**General UI Flow**:
```
Sidebar "Control Panel" → "Master Data" → "Hari Libur"
  ├─ Halaman Daftar Hari Libur (default view — tabel + filter)
  │    └─ Tombol [+ Tambah Hari Libur] → Form / Modal
  ├─ Aksi per baris: [Edit] [Nonaktifkan/Aktifkan] [Hapus]
  └─ [Phase 2] Tombol [Sinkronisasi Google Calendar]
```

---

**Fitur: Tambah Hari Libur**
* **User Story**: Sebagai Admin Backoffice, saya ingin menambahkan entri hari libur baru agar data libur RS tersedia untuk referensi notifikasi pasien dan validasi jadwal di G15.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Form memiliki field: Tanggal (date picker, wajib), Nama Hari Libur (text, wajib, maks 100 karakter), Jenis Libur (dropdown: Nasional / Keagamaan / Cuti Bersama / Lokal RS, wajib), Keterangan (textarea, opsional, maks 500 karakter). **Tidak ada field Status di form create** — sistem otomatis menyimpan dengan status `AKTIF`.
  * **AC 2**: Sistem menolak submit jika Tanggal sudah ada di database dengan status `AKTIF` — tampil pesan: *"Tanggal [dd/mm/yyyy] sudah terdaftar sebagai hari libur aktif: [nama]."*
  * **AC 3**: Setelah berhasil disimpan, entri langsung muncul di daftar dengan status `AKTIF`, diurutkan berdasarkan tanggal ascending.
  * **AC 4**: Log audit mencatat `created_by` (username admin) dan `created_at` (timestamp server).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Tanggal | Date picker | Required | "Tanggal wajib diisi" | "Pilih tanggal hari libur" |
  | Tanggal | Date picker | Duplikat AKTIF (server) | "Tanggal [dd/mm/yyyy] sudah terdaftar sebagai hari libur aktif: [nama]" | — |
  | Nama Hari Libur | Text | Required | "Nama hari libur wajib diisi" | "Contoh: Hari Raya Idul Fitri 1447 H" |
  | Nama Hari Libur | Text | Max 100 karakter | "Nama tidak boleh lebih dari 100 karakter ([X]/100)" | — |
  | Jenis Libur | Dropdown | Required | "Jenis libur wajib dipilih" | "Pilih kategori hari libur" |
  | Keterangan | Textarea | Max 500 karakter | "Keterangan tidak boleh lebih dari 500 karakter ([X]/500)" | "Keterangan tambahan (opsional)" |

  **B. State Design (UI/UX)**
  * **Read-only**: Field `created_by` dan `created_at` tidak ditampilkan di form (dicatat sistem secara otomatis). Field Status tidak tersedia — sistem auto-set `AKTIF`.
  * **Button State**: Tombol [Simpan] disabled selama field wajib belum terisi atau ada error validasi frontend; tampil spinner + "Menyimpan..." saat request diproses.
  * **Empty State**: — (form selalu tampil saat dibuka via tombol [+ Tambah Hari Libur])

---

**Fitur: Edit Hari Libur**
* **User Story**: Sebagai Admin Backoffice, saya ingin mengubah data hari libur yang sudah dicatat agar informasi tetap akurat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Edit] membuka form pre-filled dengan data existing. Field yang dapat diubah: Nama Hari Libur, Jenis Libur, Keterangan. Field `tanggal`, `created_at`, `created_by` tidak dapat diubah.
  * **AC 2**: Setelah simpan, sistem memperbarui `updated_at` dan `updated_by`. Status **tidak berubah** akibat aksi edit.
  * **AC 3**: Jika tidak ada perubahan dari nilai awal, tombol [Simpan Perubahan] tetap disabled (dirty check).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Hari Libur | Text | Required | "Nama hari libur wajib diisi" | — |
  | Nama Hari Libur | Text | Max 100 karakter | "Nama tidak boleh lebih dari 100 karakter ([X]/100)" | — |
  | Jenis Libur | Dropdown | Required | "Jenis libur wajib dipilih" | — |
  | Keterangan | Textarea | Max 500 karakter | "Keterangan tidak boleh lebih dari 500 karakter ([X]/500)" | — |

  **B. State Design (UI/UX)**
  * **Read-only**: Field `tanggal`, `created_by`, `created_at` ditampilkan sebagai informasi read-only, tidak dapat diedit.
  * **Button State**: Tombol [Simpan Perubahan] disabled jika tidak ada perubahan; tampil spinner + "Menyimpan..." saat request berlangsung.
  * **Empty State**: — (form selalu pre-filled dengan data existing)

---

**Fitur: Toggle Aktif / Nonaktif**
* **User Story**: Sebagai Admin Backoffice, saya ingin mengaktifkan atau menonaktifkan hari libur langsung dari Dashboard agar status referensi notifikasi dan G15 selalu akurat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Kolom Aksi di tabel menyediakan tombol [Nonaktifkan] untuk entri berstatus `AKTIF` dan tombol [Aktifkan] untuk entri berstatus `NONAKTIF`.
  * **AC 2**: Klik [Nonaktifkan] menampilkan modal konfirmasi sebelum eksekusi.
  * **AC 3**: Setelah toggle berhasil, badge status di baris yang bersangkutan diperbarui secara real-time tanpa reload halaman.
  * **AC 4**: Sistem memperbarui `updated_at` dan `updated_by` pada setiap toggle.
  * **AC 5**: Jika [Aktifkan] dipicu pada tanggal yang sudah memiliki entri `AKTIF` lain, sistem menolak dengan pesan error.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | Konfirmasi Nonaktifkan | Sebelum ubah ke NONAKTIF | Modal: "Menonaktifkan hari libur '[nama]' akan menghentikan referensi notifikasi dan validasi jadwal dokter (G15) untuk tanggal ini. Lanjutkan?" | — |
  | — | Konfirmasi Aktifkan | Duplikat tanggal AKTIF (server) | "Tanggal [dd/mm/yyyy] sudah memiliki entri aktif: [nama]. Nonaktifkan entri tersebut terlebih dahulu." | — |

---

**Fitur: Hapus Hari Libur**
* **User Story**: Sebagai Admin Backoffice, saya ingin menghapus entri hari libur yang salah input agar data tetap bersih.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Tombol [Hapus] hanya tersedia pada entri berstatus `NONAKTIF`. Entri berstatus `AKTIF` tidak dapat dihapus langsung — harus dinonaktifkan terlebih dahulu.
  * **AC 2**: Konfirmasi hapus tampil sebelum eksekusi: *"Entri hari libur '[nama]' ([tanggal]) akan dihapus permanen. Yakin?"*
  * **AC 3**: Setelah hapus, entri hilang dari daftar dan tidak dapat di-recover via UI.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | Konfirmasi dialog | — | Modal: "Entri hari libur '[nama]' ([tanggal]) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan. Yakin?" | — |
  | Tombol [Hapus] pada entri AKTIF | Button | Tidak dapat dihapus langsung | Tooltip: "Nonaktifkan terlebih dahulu sebelum menghapus" | — |

  **B. State Design (UI/UX)**
  * **Button State**: Tombol [Hapus] hanya visible pada baris berstatus `NONAKTIF`; di-hide untuk baris berstatus `AKTIF`. Tombol [Konfirmasi Hapus] dalam modal tampil spinner + disabled saat request berlangsung.

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

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Search Nama | Text | — | — | "Cari nama hari libur..." |
  | Filter Tahun | Dropdown | — | — | Default: tahun berjalan |
  | Filter Jenis | Multiselect | — | — | "Semua jenis" bila tidak ada yang dipilih |
  | Filter Status | Dropdown | — | — | "Semua status" bila tidak dipilih |

  **B. State Design (UI/UX)**
  * **Read-only**: Seluruh tabel bersifat read-only; aksi dilakukan via tombol di kolom Aksi.
  * **Button State**: Tombol [+ Tambah Hari Libur] selalu enabled; tombol [Reset Filter] hanya muncul jika ada filter aktif; navigasi pagination disabled pada halaman pertama/terakhir.
  * **Empty State**:
    * Belum ada data: *"Belum ada data hari libur untuk tahun [YYYY]. Klik [+ Tambah Hari Libur] untuk menambahkan."*
    * Filter aktif, tidak ada hasil: *"Tidak ada data yang cocok dengan filter yang dipilih. Coba ubah atau reset filter."*

---

**Fitur: API Internal — Cek Hari Libur**
* **User Story**: Sebagai sistem (modul notifikasi / G15), saya ingin mengambil daftar hari libur aktif untuk rentang tanggal tertentu agar dapat memeriksa apakah tanggal jadwal jatuh pada hari libur RS.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
  * **AC 1**: Endpoint `GET /api/v1/master/hari-libur` tersedia dengan parameter query: `dari` (date, format `YYYY-MM-DD`), `sampai` (date), `status` (default `AKTIF`).
  * **AC 2**: Response berupa JSON array: `[{ "tanggal": "YYYY-MM-DD", "nama": "...", "jenis": "...", "keterangan": "..." }]`.
  * **AC 3**: Jika tidak ada hari libur pada rentang yang diminta, response adalah array kosong `[]` dengan HTTP 200.
  * **AC 4**: Endpoint hanya dapat diakses oleh service internal (autentikasi via service token / internal header) — tidak exposed ke publik.
  * **AC 5**: Response time ≤ 200ms untuk query rentang 1 tahun.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  *Fitur ini tidak memiliki UI langsung — konsumsi API dilakukan sistem-ke-sistem. Validasi ada di sisi server (lihat AC 1–5).*

---

**Fitur: Sinkronisasi Google Calendar** *(Phase 2)*
* **User Story**: Sebagai Admin IT, saya ingin menghubungkan Master Data Hari Libur ke Google Calendar RS agar hari libur yang dicatat di sistem otomatis muncul di kalender RS dan dapat diimport balik.
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
  * **AC 1**: Halaman pengaturan integrasi tersedia di Settings → Integrasi → Google Calendar, dengan tombol [Connect with Google] yang memulai alur OAuth2.
  * **AC 2**: Setelah terhubung, setiap hari libur berstatus `AKTIF` otomatis ditambahkan sebagai all-day event di Google Calendar RS yang dipilih (judul = nama libur, deskripsi = jenis + keterangan).
  * **AC 3**: Perubahan status ke `NONAKTIF` menghapus event terkait dari Google Calendar.
  * **AC 4**: Tersedia tombol [Sync dari Google Calendar] untuk mengambil event dari Google Calendar RS sebagai entri berstatus `DRAFT` — memerlukan konfirmasi admin sebelum di-`AKTIF`-kan.
  * **AC 5**: [PERLU KONFIRMASI] Jika token OAuth2 kedaluwarsa, sistem menampilkan alert di halaman Hari Libur tanpa mengganggu fungsionalitas Phase 1.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | — | OAuth2 flow | Koneksi gagal | "Koneksi ke Google Calendar gagal. Pastikan akun memiliki akses ke kalender RS yang dipilih." | — |
  | — | Token OAuth2 | Kedaluwarsa | Banner: "Koneksi Google Calendar kedaluwarsa. Hubungkan ulang di Settings → Integrasi → Google Calendar." | — |
  | Sync dari GCal | Button | Tidak ada event baru | Toast info: "Tidak ada hari libur baru yang ditemukan di Google Calendar." | — |

  **B. State Design (UI/UX)**
  * **Read-only**: Entri hasil import GCal masuk sebagai `DRAFT`; field `tanggal` dan `nama` di-lock, hanya `jenis` dan `keterangan` yang dapat diubah sebelum diaktifkan.
  * **Button State**: Tombol [Connect with Google] berubah menjadi [Terhubung ✓ — Putuskan] setelah koneksi berhasil; tombol [Sync dari GCal] disabled + spinner "Menyinkronkan..." selama proses berlangsung.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `holiday_master`
* **Key Columns**:
  * `id`: UUID (Primary Key)
  * `tanggal`: DATE NOT NULL
  * `nama`: VARCHAR(100) NOT NULL
  * `jenis`: ENUM('NASIONAL', 'KEAGAMAAN', 'CUTI_BERSAMA', 'LOKAL_RS') NOT NULL
  * `keterangan`: TEXT (nullable, max 500 char)
  * `status`: ENUM('AKTIF', 'NONAKTIF', 'DRAFT') NOT NULL DEFAULT 'AKTIF'
  * `is_active`: BOOLEAN DEFAULT true — filter cepat (false = NONAKTIF permanen)
  * `created_by`: VARCHAR(100) NOT NULL
  * `created_at`: TIMESTAMP NOT NULL DEFAULT now()
  * `updated_by`: VARCHAR(100) (nullable)
  * `updated_at`: TIMESTAMP (nullable)
  * `gcal_event_id`: VARCHAR(255) (nullable) — [Phase 2] ID event Google Calendar

* **Index**: `idx_holiday_tanggal_status` ON (`tanggal`, `status`) — untuk cek duplikat aktif dan query range API

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/master/hari-libur` | List data (query: `tahun`, `jenis`, `status`, `dari`, `sampai`, `q`) |
| POST | `/api/v1/master/hari-libur` | Create data (status auto = AKTIF) |
| GET | `/api/v1/master/hari-libur/{id}` | Get detail satu entri |
| PUT | `/api/v1/master/hari-libur/{id}` | Update nama, jenis, keterangan |
| PATCH | `/api/v1/master/hari-libur/{id}/status` | Toggle Aktif / Nonaktif |
| DELETE | `/api/v1/master/hari-libur/{id}` | Hapus (hanya jika status NONAKTIF) |
| POST | `/api/v1/master/hari-libur/import` | [Phase 2] Import batch dari file CSV |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `id` | — | UUID | Auto | Auto-generate | Sistem | Primary key, tidak ditampilkan ke user |
| `tanggal` | Tanggal | Date | Ya | Format YYYY-MM-DD; tidak boleh duplikat dengan status AKTIF | Input admin | Date picker, tampil dd/mm/yyyy; read-only pada form edit |
| `nama` | Nama Hari Libur | String | Ya | Maks 100 karakter; tidak boleh kosong | Input admin | Contoh: "Hari Raya Idul Fitri 1447 H" |
| `jenis` | Jenis Libur | Enum | Ya | Nilai: `NASIONAL`, `KEAGAMAAN`, `CUTI_BERSAMA`, `LOKAL_RS` | Dropdown sistem | [PERLU KONFIRMASI] apakah ada jenis lain |
| `keterangan` | Keterangan | Text | Tidak | Maks 500 karakter | Input admin | Contoh: "Termasuk cuti bersama pemerintah" |
| `status` | — | Enum | Auto | Sistem set `AKTIF` pada create; diubah via toggle di Dashboard | Sistem | Tidak tersedia di form create/edit |
| `created_by` | — | String | Auto | Username login | Sistem | Tidak ditampilkan di form; tampil read-only di form edit |
| `created_at` | — | Timestamp | Auto | Auto server time | Sistem | Log audit; tampil read-only di form edit |
| `updated_by` | — | String | Auto | Username login | Sistem | Diisi saat edit / toggle |
| `updated_at` | — | Timestamp | Auto | Auto server time | Sistem | Diperbarui tiap edit / toggle |
| `gcal_event_id` | — | String | Tidak | String ID event GCal | Google Calendar API | [Phase 2] Null jika belum sinkronisasi |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No | Urutan tampilan | Integer | — | Reset per halaman |
| Tanggal | `tanggal` | `EEE, dd MMM yyyy` (contoh: Sen, 01 Jan 2026) | Sort asc/desc | Default sort ascending |
| Nama Hari Libur | `nama` | String | Search teks, Sort | — |
| Jenis | `jenis` | Nasional / Keagamaan / Cuti Bersama / Lokal RS | Filter multiselect | Badge warna per jenis |
| Status | `status` | Badge: Aktif (hijau) / Nonaktif (abu) / Draft (kuning, Phase 2) | Filter dropdown | — |
| Keterangan | `keterangan` | Truncate 80 char + tooltip full text | — | Tampil "–" jika kosong |
| Aksi | — | [Edit] [Nonaktifkan/Aktifkan] [Hapus] | — | [Hapus] hanya untuk NONAKTIF |

* **Business Rules**:

| ID | Aturan |
|----|--------|
| BR-A34-01 | Satu tanggal hanya boleh memiliki **satu** entri berstatus `AKTIF`. Entri duplikat tanggal dengan status `NONAKTIF` diperbolehkan. |
| BR-A34-02 | Modul ini **bukan** penentu libur praktik dokter individu. Jadwal praktik dokter dikelola di G15. A34 hanya menyediakan referensi hari libur institusional RS. |
| BR-A34-03 | Data hari libur berstatus `AKTIF` dikonsumsi oleh sistem notifikasi dan G15 secara read-only. Tidak ada modifikasi lintas modul. |
| BR-A34-04 | Entri berstatus `AKTIF` tidak dapat langsung dihapus. Harus dinonaktifkan terlebih dahulu, kemudian baru dapat dihapus. |
| BR-A34-05 | Jenis libur `LOKAL_RS` digunakan untuk hari libur spesifik RS yang tidak ada di kalender nasional (contoh: hari jadi RS, kegiatan akreditasi). |
| BR-A34-06 | Status selalu diset `AKTIF` oleh sistem pada saat create. Tidak ada input status di form create. Pengelolaan aktif/nonaktif dilakukan di level Dashboard (toggle). |
| BR-A34-07 | [PERLU KONFIRMASI] Apakah hari libur yang jatuh di akhir pekan (Sabtu/Minggu) tetap perlu dicatat? Diasumsikan YA — dicatat agar data lengkap. |
| BR-A34-08 | [Phase 2] Entri hasil impor dari Google Calendar masuk dengan status `DRAFT` dan harus melalui konfirmasi admin sebelum berstatus `AKTIF`. |

---

## 9. Workflow / BPMN Interpretation

> [ASUMSI] Tidak tersedia file BPMN spesifik untuk modul ini. Alur berikut disusun berdasarkan analogi proses Master Data umum dan kebutuhan fungsional yang dijelaskan.

**Alur Phase 1 — Input & Konsumsi Hari Libur**

```
[Admin Backoffice]
  │
  ├─ Buka halaman Master Data Hari Libur
  ├─ Klik [+ Tambah Hari Libur]
  ├─ Isi form (tanggal, nama, jenis, keterangan)
  │    ├─ [Validasi GAGAL] → Tampil pesan error inline → Kembali ke form
  │    └─ [Validasi OK] → Simpan ke DB; sistem auto-set status = AKTIF
  │         └─ Entri langsung tersedia via API internal
  │
  ├─ Dashboard → Klik [Nonaktifkan] → Konfirmasi modal → Status = NONAKTIF
  └─ Dashboard → Klik [Aktifkan]   → Status = AKTIF (jika tidak duplikat)

[Sistem Notifikasi — modul terpisah]
  │
  └─ GET /api/v1/master/hari-libur?dari=&sampai=
       ├─ [Bukan hari libur] → Proses normal
       └─ [Hari libur AKTIF ditemukan] → Trigger notifikasi ke pasien:
            "Jadwal kontrol Anda pada [tanggal] bertepatan dengan hari libur RS ([nama libur]).
             Mohon hubungi pendaftaran untuk penjadwalan ulang."

[G15 — Jadwal Dokter]
  └─ GET /api/v1/master/hari-libur?dari=&sampai=
       └─ [Jadwal dokter pada hari libur AKTIF] → Flag untuk proses re-schedule di G15
```

**Alur Phase 2 — Sinkronisasi Google Calendar**

```
[Admin IT]
  ├─ Settings → Integrasi → Google Calendar → [Connect with Google]
  ├─ OAuth2 consent → Pilih Google Calendar RS
  └─ Token tersimpan terenkripsi

[Sistem — Otomasi]
  ├─ Hari libur di-AKTIF-kan → Push all-day event ke Google Calendar RS
  ├─ Hari libur di-NONAKTIF-kan → Hapus event dari Google Calendar RS
  └─ [Sync dari GCal] → Ambil event → Masuk sebagai DRAFT → Admin konfirmasi → AKTIF
```

---

## 10. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-A34-01 | Performa | Halaman daftar (1 tahun data) load < 2 detik |
| NFR-A34-02 | Performa | API internal `/api/v1/master/hari-libur` response time ≤ 200ms untuk query rentang 1 tahun |
| NFR-A34-03 | Keamanan | Endpoint API internal hanya dapat diakses dengan service token — tidak exposed ke publik atau client-side |
| NFR-A34-04 | Keamanan | Akses halaman admin dibatasi role: `ADMIN_BACKOFFICE`, `ADMIN_IT`, `SUPERADMIN` |
| NFR-A34-05 | Audit | Setiap perubahan data mencatat `updated_by` dan `updated_at` — tersimpan minimal 1 tahun |
| NFR-A34-06 | [Phase 2] Keamanan | Token OAuth2 Google Calendar disimpan terenkripsi (AES-256 atau vault); tidak disimpan plaintext di DB |

---

## 11. Open Questions & Assumptions

### Asumsi
- [ASUMSI] Jadwal libur dokter individu tidak dikelola di modul ini — dikelola di G15. A34 hanya menetapkan hari libur institusional RS sebagai referensi.
- [ASUMSI] Modul notifikasi yang mengonsumsi data hari libur ini merupakan modul terpisah.
- [ASUMSI] G15 mengonsumsi endpoint A34 secara read-only; tidak ada write-back dari G15 ke A34.
- [ASUMSI] Entri hari libur di akhir pekan tetap dicatat meski potensi dampaknya lebih kecil.
- [ASUMSI] Data hari libur nasional tidak diambil otomatis dari API pemerintah — diinput manual (Phase 2: via import GCal).

### Pertanyaan Terbuka
- [PERLU KONFIRMASI] Apakah tipe libur `LOKAL_RS` sudah cukup, atau ada sub-kategori lain (contoh: libur sebagian unit, libur poliklinik tertentu)?
- [PERLU KONFIRMASI] Apakah notifikasi ke pasien cukup satu arah, atau ada notifikasi ke dokter/staf terkait juga?
- [PERLU KONFIRMASI] Berapa hari sebelum tanggal kontrol notifikasi harus dikirim? (Diasumsikan H-2, perlu konfirmasi SOP RS.)
- [PERLU KONFIRMASI] Bagaimana G15 diberitahu saat hari libur baru di-AKTIF-kan? Polling periodik atau webhook dari A34?
- [PERLU KONFIRMASI] Untuk Phase 2: Google Calendar mana yang digunakan (kalender institusi RS, bukan personal dokter)?
- [PERLU KONFIRMASI] Apakah perlu fitur `recurring` untuk hari libur yang berulang setiap tahun pada tanggal tetap (mis. 17 Agustus)?
