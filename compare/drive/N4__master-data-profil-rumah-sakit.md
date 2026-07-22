# PRD — Master Data Profil Rumah Sakit

**Related Document:** List Fitur V2.xlsx (sheet MVP, code N4, cluster Control Panel); example_prd/N4-Master_Data_Profil_RS.md (draft sumber); PRD N3 Master Penomoran Surat; Modul dokumen: E-Tiket Pendaftaran, Surat Rawat Jalan, Surat Rawat Inap, Surat Rujukan, Surat Kontrol, Surat Keterangan; A53 Admin RBAC (hak akses admin)
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-07-16

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|-----------------|----------------|---------|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-16 |
| Diperiksa oleh | [PERLU KONFIRMASI] Kepala IT / Manajemen RS | – |
| Disetujui oleh | [PERLU KONFIRMASI] Direktur RS | – |

**Related Documents**

- List Fitur V2.xlsx — sheet MVP, code **N4** (Control Panel > Master Data > Profil Rumah Sakit).
- `example_prd/N4-Master_Data_Profil_RS.md` — draft sumber (Main Goals, Feature Capabilities, Scope, Expected Improvement).
- PRD **N3** — Master Penomoran Surat (dokumen surat yang mengonsumsi identitas RS pada kop).
- Modul dokumen konsumen: **E-Tiket Pendaftaran, Surat Rawat Jalan, Surat Rawat Inap, Surat Rujukan, Surat Kontrol, Surat Keterangan**, serta seluruh output print/PDF.
- PRD **A53** — Admin/RBAC (definisi role & hak akses; hanya admin yang boleh ubah profil).

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-16 | 1.0 - Draft awal | Draft awal PRD Master Data Profil Rumah Sakit (N4) berdasarkan draft sumber & template PRD. Mencakup CRUD profil single-row, upload/preview logo, validasi, service ambil profil untuk modul lain (Phase 1), serta desain DB siap approval berjenjang (Phase 2). |

## 2. Overview & Background

**Overview / Brief Summary**

Modul **Master Data — Profil Rumah Sakit (N4)** menyediakan **single source of truth** untuk identitas resmi rumah sakit: nama, logo, alamat, nomor telepon, email, website, kode pos, kota/kabupaten, provinsi, dan informasi identitas lain yang dibutuhkan sebagai header dokumen. Data ini menjadi acuan tunggal bagi seluruh modul yang menghasilkan dokumen — e-tiket pendaftaran, surat rawat jalan/inap, surat rujukan, surat kontrol, surat keterangan, serta seluruh output cetak dan PDF.

Secara teknis, profil RS umumnya berupa **konfigurasi satu baris (single-row config)**: sistem menyimpan/mengubah satu record profil aktif melalui pola **upsert 1 baris**, bukan kumpulan banyak record seperti master data pada umumnya. Modul menyediakan **upload & penggantian logo** (dengan validasi format, ukuran, dan resolusi), **preview** identitas & logo sebelum disimpan, serta **fallback teks** bila logo belum tersedia. Perubahan profil hanya memengaruhi **dokumen baru** yang diterbitkan setelah perubahan; arsip dokumen yang sudah terbit tetap utuh. Hanya pengguna dengan **hak akses admin** yang dapat mengubah profil. Untuk konsumsi lintas modul, N4 menyediakan **API/service ambil profil**.

**Business Process (As-Is vs To-Be)**

**As-Is (kondisi saat ini — RS Tipe C & D):** [ASUMSI]
- Identitas rumah sakit (nama, alamat, logo, kontak) **ditanam terpisah** pada masing-masing template laporan/dokumen (kop surat, e-tiket, PDF), sering kali **hardcode** atau dikonfigurasi lokal per modul.
- Ketika identitas berubah (rebranding, pindah alamat, ganti nomor telepon, ganti logo), perubahan harus dilakukan **berulang di banyak tempat** → rawan terlewat dan tidak konsisten antar dokumen.
- Tidak ada validasi terpusat untuk kualitas/ukuran logo → logo tampil tidak proporsional saat dicetak.
- Tidak ada kontrol akses khusus; siapa pun yang bisa mengedit template berpotensi mengubah identitas.

**To-Be (kondisi diharapkan):**
- Seluruh identitas RS dikelola melalui **satu master data terpusat**; setiap modul dokumen **wajib mengambil** identitas dari master ini (bukan hardcode/konfigurasi lokal).
- Perubahan identitas cukup dilakukan **sekali** di halaman konfigurasi profil → otomatis dipakai seluruh dokumen baru.
- Sistem memvalidasi kelengkapan data wajib serta **format, ukuran, dan resolusi logo** sebelum disimpan, dengan **preview** sebelum konfirmasi.
- Tersedia **fallback teks** (nama RS) bila logo kosong, sehingga dokumen tetap terbit.
- Perubahan hanya berlaku untuk **dokumen baru**; arsip lama tidak berubah → konsistensi historis terjaga.
- Hanya **admin** yang dapat mengubah; desain data disiapkan untuk **approval berjenjang** perubahan identitas pada Phase 2.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Sentralisasi identitas | 100% modul dokumen (e-tiket, surat RJ/RI, rujukan, kontrol, keterangan, PDF) mengambil identitas RS dari master N4, tanpa hardcode/konfigurasi lokal. |
| 2 | Efisiensi perubahan identitas | Perubahan nama/alamat/kontak/logo cukup dilakukan **1 kali** di satu halaman; 0 penyesuaian manual pada template dokumen. |
| 3 | Konsistensi dokumen | 0 perbedaan identitas RS antar dokumen yang diterbitkan setelah perubahan (semua seragam). |
| 4 | Kualitas logo tercetak | 100% logo yang tersimpan lolos validasi format/ukuran/resolusi; logo tampil proporsional pada media digital & cetak. |
| 5 | Ketersediaan fallback | 100% dokumen tetap terbit meski logo kosong (fallback teks nama RS aktif). |
| 6 | Konsistensi arsip | 100% dokumen yang telah terbit sebelum perubahan tidak berubah identitasnya (perubahan hanya untuk dokumen baru). |
| 7 | Keamanan akses | 100% aksi ubah profil hanya dapat dilakukan role admin; setiap perubahan tercatat pelaku & waktu (audit). |
| 8 | Ketersediaan service | Endpoint GET profil tersedia untuk modul lain dengan waktu respons < 300 ms (data di-cache). [ASUMSI target] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD & Fungsi Dasar) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|-------------------------------------|------------------------------------------|
| Profil RS (identitas dasar) | Kelola profil pola **upsert 1 baris** (create bila kosong, edit bila sudah ada): nama, alamat, telepon, email, website, kode pos, kota/kabupaten, provinsi, dll. | **Approval berjenjang** untuk perubahan identitas (usulan → review → setujui/tolak) sebelum profil aktif berubah. |
| Logo RS | Upload, ganti, hapus logo; validasi format/ukuran/resolusi; **preview**; **fallback teks** bila kosong. | Approval khusus penggantian logo (branding) mengikuti alur approval identitas. |
| Preview | Preview identitas & logo (mis. sebagai kop dokumen) sebelum disimpan. | Preview versi usulan vs versi aktif saat proses approval. |
| Validasi data wajib | Validasi field wajib + format (email/telepon/URL) sebelum simpan. | – (idem, tetap berlaku). |
| Service ambil profil | **GET profil aktif** untuk konsumsi modul lain (e-tiket, surat, PDF). | Versi profil (opsional) — service dapat mengambil profil pada tanggal tertentu untuk audit. [ASUMSI] |
| Status aktif/nonaktif | Kolom status disiapkan; profil selalu **AKTIF** (single-row config). Toggle di Dashboard tersedia namun kurang relevan untuk 1 baris. [ASUMSI] | Riwayat versi profil (history) & rollback ke versi sebelumnya. |

**Out of Scope**
- **Manajemen multi-cabang / multi-RS** (beberapa profil aktif sekaligus) → di luar cakupan MVP; N4 mengelola **satu** profil RS. [ASUMSI]
- **Rendering/tata letak dokumen** (kop surat, layout PDF, ukuran header) → tanggung jawab masing-masing modul dokumen; N4 hanya menyediakan **data & logo**.
- **Manajemen user & role** (definisi admin) → modul **A53 Admin/RBAC**; N4 hanya mengonsumsi hak akses.
- **Penyimpanan/optimasi file skala besar (CDN, image processing lanjutan)** → di luar MVP; MVP cukup simpan file + validasi dasar. [ASUMSI]
- **Versi/riwayat profil (history)** → Phase 2.

## 5. Related Features

Master Data Profil Rumah Sakit menjadi **penyedia identitas** bagi seluruh modul yang menghasilkan dokumen. Modul-modul berikut **mengonsumsi** profil melalui service `GET /api/v1/hospital-profile` (bukan hardcode):

| Modul / Menu | Relasi Teknis / Bisnis dengan N4 |
|--------------|----------------------------------|
| E-Tiket Pendaftaran | Menampilkan nama & logo RS pada kepala e-tiket (cetak/PDF/thermal). Mengambil `name`, `logo_url`, alamat singkat dari profil aktif. |
| Surat Rawat Jalan | Kop surat memuat identitas RS (nama, logo, alamat, telepon, email, website) dari profil aktif. |
| Surat Rawat Inap | Kop surat & footer memuat identitas RS dari profil aktif. |
| Surat Rujukan | Identitas RS perujuk (nama, alamat, kontak, logo) diambil dari profil aktif untuk kop dokumen rujukan. |
| Surat Kontrol | Kop surat kontrol memuat identitas RS dari profil aktif. |
| Surat Keterangan | Kop & tanda tangan resmi memuat identitas RS dari profil aktif. |
| Output Print / PDF (umum) | Seluruh dokumen administrasi yang butuh header identitas RS mengambil data dari profil aktif; menerapkan **fallback teks** bila `logo_url` kosong. |
| N3 — Master Penomoran Surat | Nomor surat sering dikombinasikan dengan kode/identitas RS pada kop; keduanya tampil bersama di header dokumen. |
| A53 — Admin/RBAC | Menyediakan definisi role admin; N4 membatasi aksi ubah profil hanya untuk role admin. |

> Prinsip integrasi: modul konsumen **tidak boleh** menyimpan salinan hardcode identitas RS. Saat mencetak dokumen, modul memanggil service profil aktif; nilai yang tercetak menjadi bagian arsip dokumen tersebut (snapshot pada saat terbit) sehingga perubahan profil berikutnya tidak mengubah dokumen lama.

## 6. Business Process & User Stories

**State Machine Table — Status Profil RS**

> Catatan single-row config: profil RS adalah **satu baris konfigurasi** yang selalu ada dan **AKTIF**. Status di sini terutama menyiapkan struktur untuk **approval berjenjang (Phase 2)**. Toggle nonaktif secara praktis kurang relevan untuk 1 baris (menonaktifkan berarti dokumen kehilangan identitas) → disediakan namun tidak dianjurkan dipakai. [ASUMSI]

| Status | Deskripsi | Efek (pada dokumen) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|---------------------|--------------------|--------------------|
| AKTIF | Profil resmi RS yang sedang berlaku; dipakai seluruh dokumen baru. | Dokumen baru memakai identitas ini. | Set otomatis saat create/edit tersimpan (langsung berlaku). | Berubah menjadi AKTIF hanya setelah usulan **APPROVED**. |
| DRAFT/PENDING_APPROVAL | Usulan perubahan identitas menunggu persetujuan. | **Belum** memengaruhi dokumen; dokumen tetap pakai versi AKTIF. | – (tidak dipakai di Phase 1; perubahan langsung berlaku). | Dibuat saat admin mengajukan perubahan → menunggu approver. |
| REJECTED | Usulan perubahan ditolak approver. | Tidak ada perubahan; versi AKTIF tetap. | – | Approver menolak → usulan diarsipkan, profil AKTIF tak berubah. |
| NONAKTIF | Profil dinonaktifkan (toggle Dashboard). | Dokumen kehilangan sumber identitas → **tidak dianjurkan**; fallback teks minimal. | Toggle manual di Dashboard (jarang dipakai). [ASUMSI] | idem. |

**User Stories Utama**

- **US-N4-01** — Sebagai **Admin RS**, saya ingin mengisi/mengubah identitas rumah sakit (nama, alamat, kontak, dll) di satu halaman, agar seluruh dokumen otomatis konsisten. *(traceability: FR-N4-01)*
- **US-N4-02** — Sebagai **Admin RS**, saya ingin mengunggah dan mengganti logo RS dengan validasi format/ukuran/resolusi, agar logo tampil proporsional saat dicetak. *(FR-N4-02)*
- **US-N4-03** — Sebagai **Admin RS**, saya ingin melihat **preview** identitas & logo (sebagai kop dokumen) sebelum menyimpan, agar hasil sesuai harapan. *(FR-N4-03)*
- **US-N4-04** — Sebagai **Admin RS**, saya ingin sistem memvalidasi kelengkapan data wajib & format sebelum simpan, agar tidak ada profil tidak lengkap. *(FR-N4-04)*
- **US-N4-05** — Sebagai **Developer modul dokumen**, saya ingin mengambil identitas RS aktif melalui satu service, agar tidak perlu hardcode identitas di tiap modul. *(FR-N4-05)*
- **US-N4-06** — Sebagai **Sistem/pengguna dokumen**, saya ingin dokumen tetap terbit dengan fallback teks nama RS bila logo kosong, agar dokumen tidak gagal cetak. *(FR-N4-06)*
- **US-N4-07** — Sebagai **Manajemen RS**, saya ingin memastikan hanya admin yang dapat mengubah profil dan setiap perubahan tercatat (pelaku & waktu), agar identitas resmi terlindungi. *(FR-N4-07)*
- **US-N4-08** — Sebagai **Manajemen RS**, saya ingin perubahan identitas melewati **persetujuan berjenjang** (Phase 2), agar perubahan branding/identitas resmi terkontrol. *(FR-N4-08)*

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**FR-N4-01 — Kelola Profil RS (Upsert Single-Row)**
- **User Story**: Sebagai Admin RS, saya ingin mengisi/mengubah identitas RS di satu halaman, agar seluruh dokumen konsisten.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Bila belum ada profil, halaman menampilkan form kosong (mode CREATE); bila sudah ada, form terisi data profil aktif (mode EDIT). Sistem hanya menyimpan **satu baris** profil (pola upsert).
  - **AC 2**: Field yang dapat dikelola: nama RS, logo, alamat, telepon, email, website, kode pos, kota/kabupaten, provinsi, serta informasi identitas tambahan (mis. tipe/kelas RS, no. izin operasional). [PERLU KONFIRMASI field tambahan]
  - **AC 3**: Simpan hanya berhasil bila seluruh field wajib terisi & lolos validasi (lihat FR-N4-04); status otomatis di-set **AKTIF** (tidak ada input status di form).
  - **AC 4**: Setelah simpan, perubahan langsung berlaku untuk dokumen baru (Phase 1, tanpa approval); dokumen yang sudah terbit tidak berubah.

**FR-N4-02 — Upload & Ganti Logo RS**
- **User Story**: Sebagai Admin RS, saya ingin mengunggah/mengganti logo dengan validasi, agar logo tampil optimal saat dicetak.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Sistem menerima file logo format **PNG atau JPG/JPEG** saja; format lain ditolak dengan pesan jelas.
  - **AC 2**: Ukuran file maksimal **2 MB**; file lebih besar ditolak. [ASUMSI batas — konfirmasi RS]
  - **AC 3**: Dimensi minimal **200×200 px** dan maksimal **2000×2000 px**; rasio disarankan mendekati 1:1 (kotak). Di luar rentang → ditolak/peringatan. [ASUMSI]
  - **AC 4**: Mengunggah logo baru **mengganti** logo lama (menimpa referensi `logo_url` pada profil); logo lama dapat dihapus dari storage. [ASUMSI kebijakan retensi file]
  - **AC 5**: Admin dapat **menghapus** logo → `logo_url` kosong; sistem otomatis mengaktifkan fallback teks (FR-N4-06).

**FR-N4-03 — Preview Identitas & Logo**
- **User Story**: Sebagai Admin RS, saya ingin preview identitas & logo sebelum simpan, agar hasil sesuai.
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Sebelum menyimpan, sistem menampilkan preview kop dokumen (logo + nama + alamat + kontak) menggunakan data yang sedang diisi.
  - **AC 2**: Preview logo menampilkan gambar yang diunggah secara proporsional; bila logo kosong, preview menampilkan **fallback teks** nama RS.
  - **AC 3**: Preview bersifat non-persisten (tidak menyimpan apa pun sampai admin menekan Simpan).

**FR-N4-04 — Validasi Data Wajib & Format**
- **User Story**: Sebagai Admin RS, saya ingin validasi otomatis sebelum simpan, agar profil tidak tidak lengkap/salah format.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Field wajib (nama RS, alamat, telepon, kota/kabupaten, provinsi) tidak boleh kosong; simpan diblokir bila ada yang kosong.
  - **AC 2**: Email tervalidasi format email; website tervalidasi format URL; telepon hanya angka/karakter telepon yang valid; kode pos 5 digit angka.
  - **AC 3**: Pesan error tampil per field (lihat Wording Validasi Frontend), tidak sekadar pesan umum.

**FR-N4-05 — Service Ambil Profil (untuk Modul Lain)**
- **User Story**: Sebagai Developer modul dokumen, saya ingin mengambil identitas RS aktif via satu service, agar tidak hardcode.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Tersedia endpoint `GET /api/v1/hospital-profile` yang mengembalikan profil **AKTIF** (nama, logo_url, alamat, telepon, email, website, kode pos, kota, provinsi, dll) dalam JSON.
  - **AC 2**: Response menyertakan `logo_url` absolut/relatif yang dapat dirender; bila logo kosong, `logo_url` = null dan field `fallback_text` = nama RS.
  - **AC 3**: Endpoint dapat diakses modul internal (e-tiket, surat, PDF); respons di-cache untuk performa (invalidasi saat profil berubah). [ASUMSI]

**FR-N4-06 — Fallback Teks Bila Logo Kosong**
- **User Story**: Sebagai Sistem/pengguna dokumen, saya ingin fallback teks bila logo kosong, agar dokumen tetap terbit.
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Bila `logo_url` kosong, dokumen/preview menampilkan **teks nama RS** (opsional + alamat singkat) pada posisi logo, bukan gambar rusak/kosong.
  - **AC 2**: Aturan fallback disediakan lewat service (field `fallback_text`) agar seluruh modul konsumen konsisten.

**FR-N4-07 — Kontrol Akses (Hanya Admin) & Audit**
- **User Story**: Sebagai Manajemen RS, saya ingin hanya admin yang bisa ubah profil & setiap perubahan tercatat, agar identitas terlindungi.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
  - **AC 1**: Hanya user dengan role **admin** (A53) yang dapat mengakses form edit & menyimpan; role lain hanya dapat melihat (read-only) atau tidak sama sekali. [PERLU KONFIRMASI]
  - **AC 2**: Setiap penyimpanan mencatat `updated_by` & `updated_at`; perubahan terekam untuk audit.
  - **AC 3**: Percobaan ubah oleh non-admin ditolak (HTTP 403) dengan pesan yang jelas.

**FR-N4-08 — Approval Berjenjang Perubahan Identitas (Phase 2)**
- **User Story**: Sebagai Manajemen RS, saya ingin perubahan identitas melewati persetujuan berjenjang, agar perubahan resmi terkontrol.
- **Prioritas**: P2
- **Fase**: Phase 2
- **Acceptance Criteria**:
  - **AC 1**: Admin mengajukan perubahan → tersimpan sebagai usulan berstatus `PENDING_APPROVAL`; profil AKTIF **belum** berubah.
  - **AC 2**: Approver (role approver) dapat **menyetujui** (usulan menjadi AKTIF, menggantikan versi lama) atau **menolak** (`REJECTED`, profil tetap).
  - **AC 3**: Kolom `status_approval` & `role_approver` sudah tersedia di skema sejak Phase 1 sehingga tidak perlu migrasi struktur besar.
  - **AC 4**: Riwayat usulan (siapa mengajukan, siapa menyetujui/menolak, kapan) tercatat. [ASUMSI]

**Validasi — Wording (Frontend), Form Profil RS**

| Field | Tipe Input | Rules | Error Message | Helper Text |
|-------|------------|-------|---------------|-------------|
| Nama Rumah Sakit | Text | Required, maks 150 char | "Nama rumah sakit wajib diisi" | "Nama resmi RS sesuai izin operasional" |
| Logo | File Upload | Format PNG/JPG/JPEG, maks 2 MB, dimensi 200×200 s/d 2000×2000 px | "Format harus PNG/JPG, maks 2 MB, dimensi 200–2000 px" | "Unggah logo kotak (1:1) resolusi tinggi untuk hasil cetak optimal" |
| Alamat | Textarea | Required, maks 255 char | "Alamat wajib diisi" | "Alamat lengkap RS (jalan, no., kelurahan/kecamatan)" |
| Nomor Telepon | Text | Required, 7–20 digit, hanya angka/(+ - spasi) | "Nomor telepon tidak valid" | "Contoh: 021-1234567 atau +62211234567" |
| Email | Email | Optional, format email valid, maks 100 char | "Format email tidak valid" | "Email resmi RS untuk korespondensi" |
| Website | URL | Optional, format URL valid, maks 100 char | "Format website tidak valid" | "Contoh: https://rsxxx.co.id" |
| Kode Pos | Text | Optional, 5 digit angka | "Kode pos harus 5 digit angka" | "Kode pos wilayah RS" |
| Kota/Kabupaten | Text/Dropdown | Required, maks 100 char | "Kota/Kabupaten wajib diisi" | "Pilih/isi kota atau kabupaten RS" |
| Provinsi | Text/Dropdown | Required, maks 100 char | "Provinsi wajib diisi" | "Pilih/isi provinsi RS" |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `hospital_profile`** (konfigurasi single-row — idealnya hanya berisi 1 baris AKTIF; pola simpan **upsert**)
- `id`: UUID (Primary Key)
- `name`: String(150) — nama resmi RS (wajib)
- `logo_url`: String(255), nullable — path/URL file logo; null → fallback teks
- `address`: String(255) — alamat lengkap (wajib)
- `phone`: String(20) — nomor telepon (wajib)
- `email`: String(100), nullable
- `website`: String(100), nullable
- `postal_code`: String(5), nullable
- `city`: String(100) — kota/kabupaten (wajib)
- `province`: String(100) — provinsi (wajib)
- `hospital_type`: String(10), nullable — tipe/kelas RS (mis. C/D) [PERLU KONFIRMASI]
- `operational_license_no`: String(100), nullable — no. izin operasional [PERLU KONFIRMASI]
- `is_active`: Boolean (default true) — profil aktif (single-row selalu true)
- `status_approval`: Enum('none','pending','approved','rejected') (default 'none') — **disiapkan sejak Phase 1** untuk approval Phase 2
- `role_approver`: String(50), nullable — role yang berhak menyetujui (Phase 2)
- `created_by`: UUID · `created_at`: Timestamp
- `updated_by`: UUID · `updated_at`: Timestamp

**Table: `hospital_profile_change_requests`** (opsional, aktif di Phase 2 — usulan perubahan)
- `id`: UUID (PK) · `profile_id`: UUID (FK)
- `payload`: JSON — snapshot field usulan
- `logo_url`: String(255), nullable — logo usulan
- `status_approval`: Enum('pending','approved','rejected')
- `requested_by`: UUID · `requested_at`: Timestamp
- `approver_id`: UUID, nullable · `approved_at`: Timestamp, nullable · `approval_note`: String(255), nullable

> Catatan pola simpan: karena profil bersifat single-row config, operasi tulis memakai **upsert** (INSERT bila belum ada baris AKTIF, UPDATE baris yang sama bila sudah ada). Kolom `status_approval`/`role_approver` disiapkan sejak awal agar Phase 2 tidak perlu migrasi struktur besar.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hospital-profile` | **Ambil profil aktif** (untuk modul lain: e-tiket, surat, PDF); menyertakan `logo_url` & `fallback_text` |
| PUT | `/api/v1/hospital-profile` | Simpan profil (**upsert** single-row) — create bila kosong, update bila ada (admin only) |
| POST | `/api/v1/hospital-profile/logo` | Upload/ganti logo (multipart) dengan validasi format/ukuran/resolusi (admin only) |
| DELETE | `/api/v1/hospital-profile/logo` | Hapus logo → `logo_url` null, aktifkan fallback teks (admin only) |
| PATCH | `/api/v1/hospital-profile/status` | Toggle Active/Inactive (Dashboard) — kurang relevan untuk single-row [ASUMSI] |
| POST | `/api/v1/hospital-profile/change-requests` | (Phase 2) Ajukan usulan perubahan identitas → `PENDING_APPROVAL` |
| PATCH | `/api/v1/hospital-profile/change-requests/{id}/approve` | (Phase 2) Setujui usulan → jadikan profil aktif |
| PATCH | `/api/v1/hospital-profile/change-requests/{id}/reject` | (Phase 2) Tolak usulan |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT Profil)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| name | Nama Rumah Sakit | text | Ya | maks 150 char | input admin | nama resmi sesuai izin |
| logo | Logo | file | Tidak | PNG/JPG, ≤2 MB, 200–2000 px | upload admin | kosong → fallback teks |
| address | Alamat | textarea | Ya | maks 255 char | input admin | alamat lengkap |
| phone | Nomor Telepon | text | Ya | 7–20 digit telepon | input admin | – |
| email | Email | email | Tidak | format email, maks 100 | input admin | email resmi RS |
| website | Website | url | Tidak | format URL, maks 100 | input admin | – |
| postal_code | Kode Pos | text | Tidak | 5 digit angka | input admin | – |
| city | Kota/Kabupaten | text/dropdown | Ya | maks 100 char | input admin / ref wilayah | [PERLU KONFIRMASI apakah pakai master wilayah] |
| province | Provinsi | text/dropdown | Ya | maks 100 char | input admin / ref wilayah | [PERLU KONFIRMASI master wilayah] |
| hospital_type | Tipe/Kelas RS | text/dropdown | Tidak | mis. C/D | input admin | [PERLU KONFIRMASI kebutuhan field] |
| status | Status | (tidak ditampilkan) | – | otomatis AKTIF | sistem | tidak diinput di form (single-row) |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar / Preview (List / Preview View)

> Karena profil single-row, "List" praktis berupa **1 baris/kartu profil aktif** + area **Preview kop dokumen**.

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Logo | hospital_profile.logo_url | gambar (thumbnail) | – | fallback teks nama RS bila kosong |
| Nama RS | hospital_profile.name | text | – | judul kartu profil |
| Alamat | hospital_profile.address | text | – | – |
| Kontak | hospital_profile.phone + email | text | – | gabungan telepon & email |
| Website | hospital_profile.website | link | – | klik → buka tab baru |
| Kota/Provinsi | hospital_profile.city + province | text | – | – |
| Status | hospital_profile.is_active | badge | – | AKTIF (toggle di Dashboard, jarang dipakai) |
| Terakhir diubah | hospital_profile.updated_at + updated_by | dd-MM-yyyy HH:mm + nama | sort | jejak audit |
| Preview Kop | seluruh field profil | render kop (logo+nama+alamat+kontak) | – | pratinjau tampilan dokumen |

**Business Rules**
- **BR-N4-01**: Profil RS bersifat **single-row config**; operasi simpan memakai **upsert** (satu baris AKTIF). Tidak ada create record kedua saat sudah ada profil aktif.
- **BR-N4-02**: Status di-set **AKTIF** otomatis oleh sistem; tidak ada input status di form. Toggle nonaktif tersedia di Dashboard namun kurang relevan (menonaktifkan menghilangkan sumber identitas dokumen). [ASUMSI]
- **BR-N4-03**: Logo hanya menerima **PNG/JPG/JPEG**, ukuran ≤ 2 MB, dimensi 200–2000 px. File tidak valid ditolak sebelum tersimpan. [ASUMSI batas]
- **BR-N4-04**: Bila `logo_url` kosong, seluruh dokumen & preview memakai **fallback teks** (nama RS) — service menyediakan `fallback_text` agar konsisten lintas modul.
- **BR-N4-05**: Perubahan profil hanya memengaruhi **dokumen baru** yang diterbitkan setelah perubahan. Dokumen yang sudah terbit menyimpan **snapshot identitas** pada saat terbit → arsip lama tidak berubah.
- **BR-N4-06**: Seluruh modul dokumen **wajib** mengambil identitas dari service `GET /api/v1/hospital-profile`; dilarang hardcode/konfigurasi lokal identitas RS.
- **BR-N4-07**: Hanya role **admin** yang dapat mengubah profil/logo. Setiap perubahan mencatat `updated_by` & `updated_at` (audit). Non-admin → 403.
- **BR-N4-08**: Field wajib (name, address, phone, city, province) harus lengkap & lolos validasi format sebelum simpan.
- **BR-N4-09** (Phase 2): Perubahan identitas melewati approval berjenjang; profil AKTIF baru berubah setelah usulan `approved`. Kolom `status_approval`/`role_approver` disiapkan sejak Phase 1.

## 9. Workflow / BPMN Interpretation

> Modul N4 **tidak memiliki BPMN** pada data List Fitur. Alur berikut diturunkan dari draft sumber (`example_prd/N4-Master_Data_Profil_RS.md`) dan pola konfigurasi master data SIMRS. Bagian turunan ditandai [ASUMSI].

**Alur A — Konfigurasi Profil RS (Admin):** [ASUMSI]
1. Admin membuka menu **Control Panel > Master Data > Profil Rumah Sakit**. *(hak akses admin diverifikasi — non-admin ditolak)*
2. Sistem menampilkan form: mode CREATE bila belum ada profil, mode EDIT bila sudah ada (form terisi profil aktif).
3. Admin mengisi/mengubah identitas (nama, alamat, telepon, email, website, kode pos, kota, provinsi, dll).
4. Admin mengunggah/mengganti **logo** → sistem memvalidasi format (PNG/JPG), ukuran (≤2 MB), dan dimensi (200–2000 px). Bila tidak valid → tampil error, unggah ditolak.
5. Admin menekan **Preview** → sistem menampilkan kop dokumen (logo + identitas). Bila logo kosong → tampil fallback teks nama RS.
6. Admin menekan **Simpan** → sistem memvalidasi field wajib & format. Bila lolos → **upsert** satu baris `hospital_profile`, status **AKTIF**, catat `updated_by`/`updated_at`.
7. Perubahan langsung berlaku untuk **dokumen baru**; arsip dokumen lama tidak berubah.

**Alur B — Konsumsi Profil oleh Modul Dokumen:** [ASUMSI]
1. Modul dokumen (e-tiket / surat RJ/RI / rujukan / kontrol / keterangan / PDF) hendak mencetak dokumen.
2. Modul memanggil service **`GET /api/v1/hospital-profile`** → menerima identitas RS aktif + `logo_url` (atau `fallback_text` bila kosong).
3. Modul merender kop/header dokumen memakai data tersebut; nilai yang tercetak menjadi **snapshot** bagian arsip dokumen (tidak berubah oleh perubahan profil berikutnya).
4. Bila `logo_url` kosong → modul menampilkan **fallback teks** (nama RS) pada posisi logo.

**Alur C — Approval Berjenjang Perubahan Identitas (Phase 2):** [ASUMSI]
1. Admin mengajukan perubahan identitas → tersimpan sebagai usulan `PENDING_APPROVAL` (profil AKTIF belum berubah).
2. Approver meninjau (dapat membandingkan versi usulan vs aktif melalui preview).
3. **Setujui** → usulan menjadi profil AKTIF (menggantikan lama); **Tolak** → status `REJECTED`, profil tetap.
4. Riwayat usulan (pengaju, approver, waktu, catatan) tercatat untuk audit.

## Asumsi

- [ASUMSI] Profil RS dikelola sebagai single-row config (satu profil aktif) — belum mendukung multi-cabang/multi-RS pada MVP.
- [ASUMSI] Batas logo: format PNG/JPG/JPEG, ukuran ≤ 2 MB, dimensi 200×200 s/d 2000×2000 px, rasio disarankan 1:1 — angka menunggu konfirmasi kebutuhan cetak RS.
- [ASUMSI] Perubahan profil hanya memengaruhi dokumen baru; dokumen yang telah terbit menyimpan snapshot identitas saat terbit sehingga arsip lama tidak berubah.
- [ASUMSI] Service GET profil di-cache untuk performa dan diinvalidasi saat profil berubah; target respons < 300 ms.
- [ASUMSI] Toggle status aktif/nonaktif disediakan di Dashboard mengikuti pola template, namun kurang relevan untuk single-row config (menonaktifkan menghilangkan sumber identitas dokumen).
- [ASUMSI] Alur workflow diturunkan dari draft sumber & pola master data SIMRS karena N4 tidak memiliki BPMN.

## Pertanyaan Terbuka

- [PERLU KONFIRMASI] Field identitas tambahan yang perlu tampil di kop dokumen (mis. tipe/kelas RS, no. izin operasional, NPWP, akreditasi) — mana yang wajib?
- [PERLU KONFIRMASI] Batas teknis logo (format, ukuran maksimal, dimensi min/maks, rasio) sesuai kebutuhan cetak & template dokumen RS.
- [PERLU KONFIRMASI] Apakah kota/kabupaten & provinsi mengambil dari master wilayah (referensi) atau input bebas?
- [PERLU KONFIRMASI] Definisi role admin yang berhak mengubah profil (mengacu A53/RBAC) dan apakah role lain boleh read-only.
- [PERLU KONFIRMASI] Kebijakan retensi file logo lama saat diganti (dihapus dari storage atau diarsipkan).
- [PERLU KONFIRMASI] Untuk Phase 2: siapa approver perubahan identitas (jabatan/role) dan apakah perlu lebih dari satu jenjang persetujuan.