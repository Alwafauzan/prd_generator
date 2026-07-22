# PRD — Master Data: User (New)

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A1); A2 Staff; A18 Role; A37 Akses Menu; A53 RBAC
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

Master Data **User** menyimpan seluruh akun user SIMRS yang dibuat **berdasarkan NIP** yang sudah terdaftar di Master Data Staff (A2). Modul ini bagian dari cluster **Control Panel** (code **A1**).

Fungsi inti:
- Menampilkan seluruh user (list/dashboard).
- Menambah user baru — **langkah pertama wajib input NIP** (lookup ke Master Data Staff).
- Mengedit user.
- Menonaktifkan / mengaktifkan user (soft delete, bukan hapus permanen).

User = kredensial akses sistem (username, password, role/akses menu) yang ditautkan ke satu staf. Pemisahan **Staff** (data kepegawaian) vs **User** (akun login) menjaga 1 staf = 1 akun terkontrol.

Target RS Tipe C & D: SDM IT terbatas → proses pembuatan user harus simpel, validasi otomatis dari data staf, minim input manual.

## 2. Background

**Masalah saat ini [ASUMSI — diturunkan dari pola RS tipe C&D]:**
- Akun user sering dibuat manual tanpa tautan ke data kepegawaian → data ganda, nama tidak konsisten, akun 'hantu' milik staf yang sudah keluar.
- Tidak ada kontrol penonaktifan saat staf resign/mutasi → risiko keamanan (akun masih bisa login).
- Penetapan role/hak akses tidak terstandar.

**Kenapa modul ini perlu:**
- Memenuhi prinsip RME & keamanan data Permenkes SIMRS: tiap aksi klinis/transaksi harus tertelusur ke user yang sah (audit trail).
- Menjamin satu sumber kebenaran identitas: user diturunkan dari NIP staf, bukan diketik ulang.
- Mempermudah admin RS kecil mengelola siklus hidup akun (buat → ubah → nonaktif) di satu menu.

## 3. In Scope

### Scope Definition (dikerjakan)
- List/dashboard seluruh user + pencarian, filter (status, role, unit), sort.
- Tambah user baru diawali **input/lookup NIP** dari Master Data Staff; autofill data identitas dari staf.
- Set kredensial: username, password awal, role/akses menu.
- Edit user (ubah role, reset password, ubah username sesuai aturan).
- Aktif/nonaktif user (soft delete) — akun nonaktif tidak bisa login.
- Validasi unik (username, 1 NIP = 1 user aktif).
- Audit log perubahan (siapa, kapan, aksi).

### Out Scope (TIDAK dikerjakan di modul ini)
- Manajemen data kepegawaian staf → modul **Staff (A2)**.
- Definisi matriks hak akses per menu → modul **Role (A18)** / **Akses Menu (A37)** / **RBAC (A53)**.
- Proses login/autentikasi runtime (session, SSO) → modul auth.
- Sinkronisasi pegawai dari sistem HR eksternal [PERLU KONFIRMASI apakah ada].
- Pendaftaran tenaga medis ke SATUSEHAT (KFA/practitioner) → ditangani modul Staff/integrasi [ASUMSI].

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Akun user tertaut data staf valid | % user dengan NIP valid di Master Staff | 100% |
| Cegah akun ganda | Jumlah NIP dengan >1 user aktif | 0 |
| Siklus hidup akun terkontrol | % staf nonaktif yang user-nya juga nonaktif | 100% |
| Pembuatan user cepat | Waktu rata-rata buat 1 user | < 2 menit |
| Ketertelusuran | % perubahan user yang tercatat di audit log | 100% |
| Kemudahan pakai (RS kecil) | Jumlah field manual saat tambah user | ≤ 4 (sisanya autofill) |

## 5. Related Feature

| Code | Menu | Relasi |
|------|------|--------|
| **A1** | Master Data > User (New) | Modul ini |
| A2 | Master Data > Staff | **Sumber NIP & identitas** (lookup, autofill) |
| A18 | Master Data > Role | Sumber daftar role yang dipilih saat set user |
| A37 | Master Data > Akses Menu (New) | Hak akses menu per role/user |
| A53 | Admin > RBAC | Penegakan kontrol akses berbasis role |
| A3 | Master Data > Unit | Sumber unit/penempatan (autofill dari staf) |
| A55 | Master Data > Jabatan | Konteks jabatan staf |

## 6. Business Process (As-Is / To-Be)

### A. As-Is [ASUMSI — RS tipe C&D belum ada modul ini]
1. Admin buat akun manual, ketik nama/identitas ulang.
2. Tidak ada validasi tautan ke data staf → potensi salah ketik & duplikat.
3. Staf resign → akun jarang dinonaktifkan.
4. Role diberikan ad-hoc tanpa standar.

### B. To-Be (diharapkan)
1. Admin buka menu Master Data > User → lihat seluruh user.
2. Klik **Tambah User** → **input NIP** terlebih dahulu.
3. Sistem cari NIP di Master Data Staff (A2):
   - Ditemukan → autofill nama, NIK, unit, jabatan; lanjut.
   - Tidak ditemukan → tolak, arahkan daftarkan staf dulu di A2.
   - Sudah punya user aktif → tolak (cegah duplikat).
4. Admin set username, password awal, role (A18).
5. Validasi unik username & simpan → user aktif, tercatat di audit log.
6. Edit/nonaktif sesuai kebutuhan; staf nonaktif memicu rekomendasi nonaktifkan user.

*Pola diturunkan dari analogi proses lain (validasi & duplicate-detection) — lihat Business Rules.* 

## 7. Main Flow / Mindmap

**Aktor:** Admin / Petugas IT RS (pengelola Control Panel).

**Skenario 1 — Tambah User Baru (happy path):**
1. Buka menu User → tampil list user.
2. Klik Tambah User → form minta **NIP**.
3. Input NIP → sistem lookup ke Master Staff (A2).
4. NIP valid & belum punya user → autofill identitas (read-only).
5. Input username, password awal, pilih role.
6. Validasi (username unik, password kebijakan, role wajib).
7. Simpan → user status **Aktif** + audit log.

**Skenario 2 — NIP tidak ditemukan:** sistem tampilkan error, sarankan daftar staf di A2.

**Skenario 3 — NIP sudah punya user aktif:** sistem tolak, tampilkan user existing (analogi *Duplicate Detection* — few-shot BPMN admisi).

**Skenario 4 — Edit User:** pilih user dari list → ubah role/username/reset password → simpan + audit.

**Skenario 5 — Nonaktifkan User:** pilih user → set nonaktif → konfirmasi → user tak bisa login + audit.

*Analogi alur: pola lookup+validasi+simpan+audit dari g-service-internal-consult ("Validasi: tersedia", "Catat audit log: User pembuat, Timestamp") dan g-emr-patient-identity ("Catat audit log: User, Timestamp").* 

## 8. Business Rules

- **BR-001:** Tambah user WAJIB diawali input NIP; tanpa NIP valid, form lanjutan terkunci. *(draft user)*
- **BR-002:** NIP harus ada di Master Data Staff (A2) berstatus aktif. Jika tidak ada → tolak. *(analogi validasi g-service-internal-consult)*
- **BR-003:** 1 NIP hanya boleh punya **1 user aktif**. Jika sudah ada → tolak / tampilkan existing. *(analogi Duplicate Detection — few-shot admisi)*
- **BR-004:** Username harus **unik** seluruh sistem.
- **BR-005:** User tidak dihapus permanen, hanya **nonaktif** (soft delete) demi audit trail RME.
- **BR-006:** User nonaktif tidak boleh login (ditegakkan modul auth/RBAC A53).
- **BR-007:** Identitas (nama, NIK, unit, jabatan) **read-only** di modul User; diubah hanya via Staff (A2). *(single source of truth)*
- **BR-008:** Setiap aksi create/edit/nonaktif tercatat audit log (user pelaku, timestamp, aksi). *(Permenkes/RME)*
- **BR-009:** Role wajib dipilih minimal 1 saat membuat user. *[PERLU KONFIRMASI: multi-role per user?]*
- **BR-010:** Saat staf di A2 dinonaktifkan → sistem rekomendasikan/auto-nonaktifkan user terkait. *[PERLU KONFIRMASI: otomatis atau manual]*

## 9. User Stories

- **US-001** — Sebagai Admin, saya ingin melihat seluruh user dalam satu list dengan filter & pencarian, agar mudah mengelola akun. *(draft user)*
- **US-002** — Sebagai Admin, saya ingin menambah user diawali input NIP, agar data user otomatis tertaut staf yang valid. *(draft user; analogi lookup g-emr-patient-identity)*
- **US-003** — Sebagai Admin, saya ingin sistem autofill identitas dari Master Staff setelah NIP valid, agar tidak ketik ulang & bebas salah. *(BR-007)*
- **US-004** — Sebagai Admin, saya ingin diperingatkan bila NIP sudah punya user aktif, agar tidak membuat akun ganda. *(BR-003)*
- **US-005** — Sebagai Admin, saya ingin menetapkan username, password awal, dan role saat membuat user, agar user bisa login sesuai haknya.
- **US-006** — Sebagai Admin, saya ingin mengedit role & reset password user, agar bisa menyesuaikan perubahan tugas staf.
- **US-007** — Sebagai Admin, saya ingin menonaktifkan user, agar staf yang resign/mutasi tak bisa lagi akses sistem. *(BR-006)*
- **US-008** — Sebagai Auditor/Manajemen, saya ingin setiap perubahan user tercatat, agar akses sistem tertelusur. *(BR-008)*

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | Sistem menampilkan list user (kolom: nama, username, NIP, role, unit, status) dengan pencarian, filter status/role/unit, sort, pagination. | US-001 |
| FR-002 | Tombol Tambah User membuka form yang **pertama meminta NIP**; field lain terkunci sampai NIP valid. | US-002, BR-001 |
| FR-003 | Sistem melakukan lookup NIP ke Master Staff (A2) saat input; tampilkan hasil/temuan. | US-002, BR-002 |
| FR-004 | Bila NIP ditemukan & aktif → autofill nama, NIK, unit, jabatan (read-only). | US-003, BR-007 |
| FR-005 | Bila NIP tidak ada / staf nonaktif → tampilkan error + arahkan ke A2. | BR-002 |
| FR-006 | Bila NIP sudah punya user aktif → blokir simpan, tampilkan user existing. | US-004, BR-003 |
| FR-007 | Sistem menerima input username, password awal, role; validasi username unik & kebijakan password. | US-005, BR-004 |
| FR-008 | Simpan user → status Aktif default; catat audit log. | US-005, BR-008 |
| FR-009 | Edit user: ubah username (cek unik), role, reset password; identitas read-only. | US-006, BR-007 |
| FR-010 | Aktif/nonaktif user (soft delete) dengan konfirmasi; nonaktif tak bisa login. | US-007, BR-005/006 |
| FR-011 | Catat audit log tiap aksi create/edit/aktivasi (pelaku, timestamp, aksi, before/after). | US-008, BR-008 |
| FR-012 | Role dipilih dari Master Role (A18); akses menu mengikuti A37/RBAC A53. | BR-009 |
| FR-013 | [ASUMSI] Saat staf dinonaktifkan di A2, sistem beri notifikasi/rekomendasi nonaktifkan user. | BR-010 |

## 11. Data Requirements (Spesifikasi Field)

### A. Form Tambah/Edit User (INPUT) — terkait FR-002..FR-009

**Langkah 1 — Input NIP (gerbang awal):**

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nip | NIP | lookup | Ya | harus ada di Master Staff aktif | integrasi master Staff (A2) | langkah pertama; kunci form (BR-001) |

**Langkah 2 — Identitas (autofill, read-only) FR-004:**

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama | Nama Lengkap | text | Ya | maks 100 char | autofill Staff (A2) | read-only |
| nik | NIK | text | Tidak | 16 digit | autofill Staff (A2) | read-only |
| unit | Unit/Poli | text | Tidak | dari master unit (A3) | autofill Staff | read-only |
| jabatan | Jabatan | text | Tidak | dari master jabatan (A55) | autofill Staff | read-only |
| no_str | No. STR | text | Tidak | format STR | autofill Staff | read-only; tenaga medis |

**Langkah 3 — Kredensial & Akses (input manual) FR-007/FR-012:**

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| username | Username | text | Ya | unik, 4–30 char, alfanumerik | manual | tak boleh duplikat (BR-004) |
| password | Password Awal | text(password) | Ya | min 8 char, kebijakan password | manual/auto-generate | wajib ganti saat login pertama [PERLU KONFIRMASI] |
| konfirmasi_password | Konfirmasi Password | text(password) | Ya | sama dengan password | manual | |
| role_id | Role | dropdown/multi | Ya | dari Master Role (A18) | lookup | min 1 (BR-009); multi-role [PERLU KONFIRMASI] |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | soft delete (BR-005) |
| email | Email | text | Tidak | format email | autofill Staff / manual | utk reset password [PERLU KONFIRMASI] |
| no_hp | No. HP | text | Tidak | digit, 10–14 | autofill Staff / manual | [PERLU KONFIRMASI] |

### B. Dashboard / List User (TAMPIL) — FR-001

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total User Aktif | count user where aktif | angka besar (kartu) | – | ringkasan |
| Total User Nonaktif | count user where !aktif | angka (kartu) | – | ringkasan |
| Nama | user→staff.nama | text | sort A-Z | |
| Username | user.username | text | search | |
| NIP | user.nip | text | search | |
| Role | user.role | badge | filter | |
| Unit | staff.unit | text | filter | |
| Status | user.status_aktif | badge (hijau aktif/abu nonaktif) | filter | default aktif |
| Login Terakhir | auth log | datetime | sort | [PERLU KONFIRMASI ketersediaan] |
| Aksi | – | tombol Edit / Nonaktif | – | |

### C. Detail User (TAMPIL) — FR-009

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Identitas (nama, NIK, unit, jabatan, STR) | Staff (A2) | text read-only | – | dari NIP |
| Username / Role / Status | user | text/badge | – | |
| Riwayat Audit | audit log | tabel (pelaku, waktu, aksi) | sort waktu | FR-011 |

## 12. Non-Functional Requirements

- **NFR-001 (Keamanan):** Password disimpan ter-hash (bcrypt/argon2), tak pernah plaintext. Sesuai keamanan data RME.
- **NFR-002 (Audit):** Audit log immutable, retensi sesuai kebijakan RS [PERLU KONFIRMASI durasi].
- **NFR-003 (Performa):** List user (≤ ribuan baris RS tipe C&D) tampil < 2 detik; lookup NIP < 1 detik.
- **NFR-004 (Usability):** Form minim input manual; autofill maksimal — cocok SDM IT terbatas.
- **NFR-005 (Ketersediaan):** Modul jalan di infrastruktur sederhana; pertimbangkan koneksi internet tak stabil — lookup NIP ke data staf bersifat lokal (bukan eksternal) sehingga tetap jalan offline. [ASUMSI]
- **NFR-006 (Hak akses):** Hanya role Admin/Super Admin boleh akses menu User. Ditegakkan RBAC (A53).
- **NFR-007 (Konsistensi):** Identitas single source di Staff (A2); tak ada penggandaan editable.

## 13. Integrasi Eksternal

**Internal (utama):**
- **Master Staff (A2):** lookup NIP + autofill identitas. Dependensi inti.
- **Master Role (A18) / Akses Menu (A37) / RBAC (A53):** penetapan & penegakan hak akses.
- **Master Unit (A3) / Jabatan (A55):** konteks penempatan (via staf).
- **Modul Auth/Login:** konsumen status user (aktif/nonaktif) saat autentikasi.

**Eksternal:**
- **SATUSEHAT / BPJS:** TIDAK langsung di modul User. Identitas tenaga medis (practitioner KFA, NIK Disdukcapil) dikelola di modul Staff (A2). User hanya mewarisi. [ASUMSI]
- **Disdukcapil (NIK):** validasi NIK dilakukan di A2, bukan di sini.

## Asumsi
- Modul tidak punya BPMN sendiri; alur diturunkan dari analogi pola validasi+lookup+audit pada g-service-internal-consult dan g-emr-patient-identity, serta pola Duplicate Detection few-shot admisi.
- Aktor utama = Admin / Petugas IT RS pada Control Panel.
- Penghapusan user memakai soft delete (nonaktif) demi audit trail RME, bukan hard delete.
- Identitas user (nama, NIK, unit, jabatan) bersumber tunggal dari Master Staff (A2) dan read-only di modul ini.
- Lookup NIP bersifat lokal sehingga modul tetap berfungsi saat internet tidak stabil (relevan RS tipe C&D).
- Integrasi SATUSEHAT/BPJS untuk identitas tenaga medis ditangani di modul Staff, bukan di modul User.

## Pertanyaan Terbuka
- Satu user boleh punya banyak role, atau hanya satu role? (BR-009/FR-012)
- Penonaktifan staf di A2 → user terkait dinonaktifkan otomatis atau hanya rekomendasi? (BR-010/FR-013)
- Password awal: di-generate sistem atau diketik admin? Wajib ganti saat login pertama?
- Apakah email & no HP dipakai untuk reset password / notifikasi? Sumbernya autofill staf atau input manual?
- Field 'Login Terakhir' tersedia dari modul auth untuk ditampilkan di list?
- Retensi audit log berapa lama (kebijakan RS / Permenkes)?
- Apakah username boleh diubah setelah dibuat, atau dikunci?
- Apakah ada sinkronisasi pegawai dari sistem HR eksternal?