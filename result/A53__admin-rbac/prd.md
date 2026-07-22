# PRD — Admin: Role-Based Access Control (RBAC)

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional) — A53; Modul terkait: A1 User, A2 Staff, A18 Role, A37 Akses Menu, A55 Jabatan; Permenkes No. 24/2022 (RME), UU No. 27/2022 (Pelindungan Data Pribadi), Permenkes SIMRS
**Versi:** 1.1 - Pengembangan (realtime, per-action, row-level, SEP/SATUSEHAT, tanpa masa berlaku)
**Tanggal:** 2026-06-19

## 1. Overview / Brief Summary

Modul **RBAC (Role-Based Access Control)** adalah mekanisme tata kelola hak akses di SIMRS yang mengatur kewenangan pengguna mengakses menu, fitur, data, dan operasi sistem berdasarkan **peran/jabatan**. Prinsip: pengguna hanya boleh mengakses informasi & aksi sesuai tugas, tanggung jawab, dan tingkat otorisasinya.

Komponen inti:
- **Role** — kumpulan hak akses bernama (mis. Admin SIMRS, Dokter, Perawat, Petugas Pendaftaran, Apoteker, Analis Lab, Kasir, Verifikator BPJS, Manajemen). Setiap role **wajib memiliki minimal 1 permission** [BR-04].
- **Permission** — hak granular **hingga level action (per tombol/operasi)** per **Menu › Sub Menu › Tombol Aksi › Operasi** (view, create, update, delete, validasi, cetak, approve, serta action integrasi spesifik seperti `terbitkan_sep`, `kirim_satusehat`).
- **Mapping Role↔Permission** — matriks centang permission per role.
- **Mapping User↔Role** — penetapan satu/lebih role ke akun pengguna (relasi ke A1 User). **Tanpa masa berlaku/efektif** — mapping aktif sampai dicabut [BR-14].
- **Data Scope (Row-Level)** — pembatasan akses **tingkat baris** data (mis. unit/poli/DPJP) yang melekat pada role/user [BR-12].
- **Perubahan Realtime** — perubahan role/permission/scope berlaku **seketika** ke sesi aktif tanpa menunggu login ulang [BR-05].
- **Audit Trail** — pencatatan setiap perubahan konfigurasi RBAC & aktivitas akses sensitif.

Letak: Control Panel › Admin › RBAC (A53). Aktor utama: **Administrator SIMRS**.

[ASUMSI] Untuk RS Tipe C & D, model RBAC dibuat sederhana (role-permission flat, tanpa hierarki role kompleks) agar mudah dikelola SDM IT terbatas, namun mendukung permission granular hingga level action + pembatasan tingkat baris.

## 2. Background

**Masalah saat ini (kondisi umum RS Tipe C & D):**
- Hak akses sering belum dibedakan per peran — banyak pengguna pakai akun dengan akses berlebih (over-privileged), termasuk akses ke rekam medis & data administratif rahasia.
- Akses sering hanya dibatasi per menu, **belum per action** — user yang boleh melihat data juga bisa mengubah/menghapus/mencetak tanpa pembedaan.
- Belum ada **pembatasan tingkat baris** — semua user yang boleh buka satu menu bisa melihat seluruh baris (mis. dokter melihat pasien unit lain).
- Perubahan akses (jika ada) baru berlaku saat login ulang → ada jeda risiko setelah mutasi/insiden.
- Pengaturan akses tersebar/manual, tidak terpusat, sulit diaudit.
- Saat pegawai mutasi/resign atau struktur organisasi berubah, hak akses tidak disesuaikan tepat waktu → risiko akses tidak sah.
- Tidak ada jejak audit yang memadai → sulit menelusuri siapa mengubah konfigurasi/akses.

**Kenapa modul ini perlu:**
- Kepatuhan terhadap perlindungan data kesehatan (UU PDP, Permenkes RME) menuntut pembatasan akses berbasis peran, **granular per action**, **per baris**, & audit trail.
- Mengurangi risiko penyalahgunaan data, akses tidak sah, dan perubahan data tanpa otorisasi.
- **Pencabutan akses realtime** menutup jeda risiko saat mutasi/resign/insiden.
- Memperkuat pengendalian internal & kesiapan audit (akreditasi RS).

[ASUMSI] Modul ini melengkapi A18 (Role) dan A37 (Akses Menu) yang sudah ada dengan tata kelola permission granular per-action + row-level scope + perubahan realtime + audit trail + manajemen user-role terpusat.

## 3. In Scope

### Scope Definition (yang dikerjakan)
1. **Manajemen Role** — buat, ubah, duplikat, aktif/nonaktif, hapus role (hapus hanya bila tak terpakai). Setiap role wajib minimal 1 permission [BR-04].
2. **Katalog Permission granular per action** — daftar permission hingga **level tombol/operasi** per Menu › Sub Menu › Aksi › Operasi (view/create/update/delete/validasi/cetak/approve) **plus action integrasi spesifik** (mis. `terbitkan_sep`, `batalkan_sep`, `kirim_satusehat`), bersumber dari registry menu/action SIMRS (A37).
3. **Matriks Role × Permission** — antarmuka centang/uncheck permission per role & per action, dengan pencarian & centang massal per modul.
4. **Mapping User ↔ Role** — tetapkan satu/lebih role ke akun pengguna (terhubung A1 User); **tanpa masa berlaku** — aktif sampai dicabut.
5. **Pembatasan Tingkat Baris (Row-Level / Data Scope)** — batasi baris data yang dapat diakses berdasarkan atribut (mis. unit/poli, DPJP, instalasi). Scope melekat pada role/user & dipaksakan server-side.
6. **Penegakan akses realtime (enforcement)** — sistem menyembunyikan/menonaktifkan menu & action, menyaring baris data, dan menolak operasi yang tidak diizinkan (UI + server-side). Perubahan konfigurasi **berlaku seketika** ke sesi aktif.
7. **Hak akses action integrasi BPJS (SEP) & SATUSEHAT** — permission terpisah & granular untuk action `terbitkan_sep`, `batalkan_sep`, `kirim_satusehat`, `tarik_data_satusehat`, dll.
8. **Audit Trail RBAC** — catat perubahan role, permission, scope, mapping user-role, beserta aktor & waktu.
9. **Dashboard RBAC** — ringkasan jumlah role, user per role, role tanpa user, permission per role, scope per role.

### Out Scope (yang TIDAK dikerjakan)
- **Manajemen akun user** (tambah/edit/reset password/aktivasi) → milik **A1 User**.
- **Master Role dasar** definisi nama role murni → sebagian overlap **A18 Role** [PERLU KONFIRMASI batas tegas A18 vs A53].
- **Registry/struktur menu & action** (definisi menu, submenu, daftar action) → milik **A37 Akses Menu**.
- **Single Sign-On / federasi identitas eksternal**.
- **Attribute-Based Access Control (ABAC) penuh** / aturan akses berbasis atribut dinamis kompleks — MVP hanya mendukung row-level scope berbasis atribut tetap (unit/DPJP), bukan rule engine bebas.
- **Masa berlaku/penjadwalan mapping user-role** (efektif mulai/berakhir) — **tidak dipakai** [BR-14].

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Akses sesuai peran | % user punya role terdefinisi (bukan akses default penuh) | 100% |
| Granularitas per action | % action sensitif (hapus/validasi/cetak/SEP/SATUSEHAT) punya permission terpisah | 100% |
| Pembatasan baris | % modul berdata-pasien menerapkan data scope sesuai unit/DPJP | ≥ 90% |
| Kurangi over-privilege | % role mengikuti prinsip least-privilege (review berkala) | ≥ 90% |
| Keterlacakan | % perubahan konfigurasi RBAC tercatat di audit trail | 100% |
| Responsif realtime | Jeda perubahan role/permission berlaku ke sesi aktif | < 5 detik |
| Efisiensi admin | Waktu menetapkan role ke user baru | < 2 menit |
| Responsif perubahan organisasi | Waktu penyesuaian akses saat mutasi/resign | seketika (realtime) |
| Keamanan | Insiden akses tidak sah ke modul sensitif (RME, keuangan, SEP/SATUSEHAT) | 0 |
| Penegakan server-side | % operasi & baris terlarang ditolak server (bukan hanya UI) | 100% |

[ASUMSI] Angka target bersifat usulan awal, perlu disepakati manajemen RS.

## 5. Related Feature

| Code | Menu | Relasi |
|------|------|--------|
| A53 | Control Panel › Admin › RBAC | **Modul ini** |
| A1 | Master Data › User (New) | Sumber akun pengguna untuk mapping User↔Role |
| A2 | Master Data › Staff | Sumber identitas (nama, NIP, NIK, jabatan, unit) yang diwarisi User |
| A18 | Master Data › Role | Definisi role dasar — RBAC mengelola permission per role [PERLU KONFIRMASI pembagian tugas] |
| A37 | Master Data › Akses Menu (New) | Registry menu/submenu **& daftar action** → sumber katalog permission granular |
| A55 | Master Data › Jabatan | Acuan pemetaan jabatan → role default [ASUMSI] |
| A3 | Master Data › Unit/Poli | Sumber atribut **data scope** (row-level) |
| A45 | Super Admin (CMS) › On/Off Feature | Feature flag dapat membatasi permission/action yang tampil |
| A47 | Super Admin (CMS) › Semua Konfigurasi sistem | Konfigurasi global di atas RBAC |

Catatan konsistensi: field identitas user (`nama`, `nip`, `nik`, `jabatan`, `unit`) mengikuti definisi kanonik dari A1/A2 — tidak didefinisikan ulang di sini.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari pola umum RS Tipe C&D, tanpa BPMN khusus]
1. Admin membuat akun user; hak akses tidak/seragam dibedakan per peran.
2. Akses dibatasi per menu saja — tidak per action; user bisa lihat = bisa ubah/hapus.
3. Semua baris data tampil tanpa pembatasan (dokter lihat pasien unit lain).
4. Banyak user mengakses modul di luar tugasnya (akses berlebih).
5. Perubahan tugas pegawai tidak diikuti penyesuaian akses, dan baru berlaku saat login ulang.
6. Tidak ada jejak audit perubahan akses → sulit ditelusuri saat audit/insiden.

### B. To-Be (kondisi diharapkan)
1. Admin mendefinisikan **Role** sesuai peran di RS (wajib ≥ 1 permission).
2. Admin memetakan **Permission granular per action** (menu/aksi/operasi + action SEP/SATUSEHAT) ke tiap role via **Matriks Role × Permission**.
3. Admin menetapkan **Data Scope (row-level)** per role/user (mis. hanya unit/poli/DPJP tertentu).
4. Saat membuat/mengubah user (A1), admin menetapkan **Role** → hak akses efektif terbentuk otomatis (tanpa masa berlaku).
5. Saat login & **selama sesi berjalan**, sistem memuat permission + scope efektif; **menu/action disembunyikan, baris difilter, operasi ditolak** bila tak diizinkan (enforcement UI + server-side).
6. Setiap perubahan permission/role/scope **berlaku seketika (realtime)** ke sesi aktif tanpa login ulang.
7. Setiap perubahan RBAC dan akses sensitif **tercatat di audit trail**.
8. Saat mutasi/resign, admin cukup ubah/cabut role → akses **dicabut seketika**.

[ASUMSI] Pola enforcement & audit dianalogikan dari proses operasional ber-BPMN (mis. g-service-discharge, g-admisi-onsite-registration) di mana aksi sensitif — terbitkan SEP, settlement billing, close registrasi, input resume medis, kirim SATUSEHAT — memerlukan otorisasi peran tertentu; RBAC menjadi gerbang otorisasi lintas modul tersebut.

## 7. Main Flow / Mindmap

**Skenario 1 — Buat & konfigurasi Role**
1. Admin buka Control Panel › Admin › RBAC.
2. Tab **Role** → klik Tambah Role → isi nama role, deskripsi, status aktif.
3. Sistem simpan role → audit trail mencatat (aktor, waktu, aksi: CREATE_ROLE).
4. Buka **Matriks Permission** role tsb → centang permission per modul/aksi/**action** (termasuk `terbitkan_sep`, `kirim_satusehat`).
5. Simpan → validasi **minimal 1 permission** [BR-04] → audit trail (UPDATE_ROLE_PERMISSION).

**Skenario 2 — Atur Data Scope (row-level)**
1. Pada role/user, buka tab **Data Scope**.
2. Pilih jenis scope (semua data / per unit-poli / per DPJP / per instalasi) dan nilainya.
3. Simpan → audit trail (UPDATE_DATA_SCOPE). Scope dipaksakan server-side saat query data [BR-12].

**Skenario 3 — Tetapkan Role ke User**
1. Tab **User-Role** → cari user (data dari A1).
2. Pilih satu/lebih role → simpan (**tanpa masa berlaku**) [BR-14].
3. Sistem hitung permission + scope efektif (union role) → audit trail (ASSIGN_ROLE).
4. **Sesi aktif user langsung diperbarui** (realtime) [BR-05].

**Skenario 4 — Enforcement saat user beraktivitas**
1. User login → sistem muat permission + scope efektif.
2. Render menu/action: hanya yang ber-permission `view`/action terkait yang tampil.
3. Daftar data difilter sesuai data scope (mis. hanya pasien unit user) [BR-12].
4. User klik action (mis. Hapus / Terbitkan SEP) → cek permission action spesifik:
   - Diizinkan → operasi diproses.
   - Tidak diizinkan → tolak + pesan "Akses ditolak" + catat percobaan [BR-06].
5. Server memvalidasi ulang permission **dan scope baris** di setiap endpoint [BR-07, BR-12] (cegah bypass UI).

**Skenario 5 — Perubahan organisasi (mutasi/nonaktif) realtime**
1. Pegawai mutasi → admin ubah role/scope user; atau resign → nonaktifkan user (A1) / cabut role.
2. Sistem **cabut akses seketika** (invalidasi sesi/permission cache) → audit trail (REVOKE_ROLE) [BR-05].

**Decision points:** Role sudah dipakai user? (blok hapus) · Permission ≥ 1? (validasi simpan) · Action diizinkan? (allow/deny) · Baris dalam scope user? (tampil/sembunyi) · User super-admin? (akses penuh, tak bisa dikunci sendiri).

## 8. Business Rules

- **BR-01** — Nama role harus **unik** (case-insensitive) dan tidak boleh kosong.
- **BR-02** — Role yang masih **dipakai ≥ 1 user aktif tidak boleh dihapus**; harus dicabut/dipindah dulu.
- **BR-03** — Minimal **satu** akun ber-role **Administrator SIMRS** harus selalu ada & aktif (cegah lockout total).
- **BR-04** — Role **wajib memiliki minimal 1 permission**; role tanpa permission **tidak boleh disimpan** (placeholder kosong dilarang). *(Diperkuat sesuai instruksi: tidak ada role kosong.)*
- **BR-05** — Perubahan permission/role/scope berlaku **realtime**: sistem menginvalidasi & memperbarui sesi aktif user terdampak seketika (target < 5 detik), tanpa menunggu login ulang. *(Diubah dari next-login.)*
- **BR-06** — Operasi/action tanpa permission **ditolak**; UI menyembunyikan/menonaktifkan kontrolnya.
- **BR-07** — Enforcement **wajib di server-side** pada setiap endpoint, bukan hanya menyembunyikan menu/action di UI.
- **BR-08** — Permission efektif user = **union** seluruh role yang melekat (tidak ada deny eksplisit di MVP).
- **BR-09** — Akses ke modul sensitif (RME, Keuangan/Kasir, Konfigurasi sistem, action SEP/SATUSEHAT) **default tertutup**; harus diberikan eksplisit (least-privilege).
- **BR-10** — Setiap perubahan RBAC (role, permission, data scope, mapping user-role) **wajib tercatat** di audit trail dengan aktor, waktu, nilai lama→baru.
- **BR-11** — User **tidak boleh mencabut role admin dari dirinya sendiri** jika menyebabkan ia kehilangan akses RBAC (cegah self-lockout).
- **BR-12** — **Row-level scope**: baris data yang dapat diakses dibatasi atribut scope (unit/poli/DPJP/instalasi) yang melekat pada role/user; difilter **server-side** pada setiap query data. Jika beberapa role memberi scope berbeda, scope efektif = **union** (gabungan) area yang diizinkan. *(Baru.)*
- **BR-13** — **Action integrasi** BPJS-SEP & SATUSEHAT (mis. `terbitkan_sep`, `batalkan_sep`, `kirim_satusehat`, `tarik_data_satusehat`) adalah **permission terpisah & granular**, tidak otomatis mengikuti permission `view` menu induk. *(Baru — sesuai instruksi 5.)*
- **BR-14** — Mapping User↔Role **tidak memakai masa berlaku/efektif tanggal**; mapping aktif sejak ditetapkan sampai dicabut manual. *(Baru — sesuai instruksi 6.)*

## 9. User Stories

- **US-001** — Sebagai Admin SIMRS, saya ingin membuat & mengubah role, agar hak akses dapat dikelompokkan sesuai peran di RS. (To-Be #1)
- **US-002** — Sebagai Admin SIMRS, saya ingin mengatur permission granular **hingga per action** (tombol/operasi) pada tiap role, agar pengguna hanya bisa melakukan tindakan sesuai tugasnya. (To-Be #2, BR-13)
- **US-003** — Sebagai Admin SIMRS, saya ingin menetapkan satu/lebih role ke akun pengguna **tanpa masa berlaku**, agar hak akses efektif terbentuk otomatis & sederhana. (To-Be #4, BR-14)
- **US-004** — Sebagai Admin SIMRS, saya ingin sistem menolak operasi/action yang tidak diizinkan di sisi server, agar tidak bisa di-bypass lewat UI. (To-Be #5, BR-07)
- **US-005** — Sebagai Admin SIMRS, saya ingin melihat audit trail perubahan akses, agar setiap tindakan dapat ditelusuri & dipertanggungjawabkan. (To-Be #7)
- **US-006** — Sebagai Admin SIMRS, saya ingin perubahan/pencabutan role berlaku **seketika (realtime)** saat pegawai mutasi/resign, agar tidak ada jeda akses tidak sah. (To-Be #6/#8, BR-05)
- **US-007** — Sebagai Admin SIMRS, saya ingin sistem mencegah penghapusan role yang masih dipakai, mencegah role kosong, & mencegah lockout admin, agar sistem tetap dapat dikelola. (BR-02, BR-03, BR-04, BR-11)
- **US-008** — Sebagai Dokter/Perawat/Kasir (end user), saya ingin hanya melihat menu, action, **dan baris data** yang relevan dengan peran & unit saya, agar antarmuka sederhana & data rahasia terlindungi. (To-Be #5, BR-12)
- **US-009** — Sebagai Manajemen RS, saya ingin melihat ringkasan distribusi role, user, & scope, agar dapat menilai tata kelola akses untuk kebutuhan audit/akreditasi. (Dashboard)
- **US-010** — Sebagai Admin SIMRS, saya ingin mengatur **hak akses khusus** untuk action **Terbitkan/Batalkan SEP** dan **Kirim/Tarik data SATUSEHAT** secara terpisah, agar hanya petugas berwenang (mis. Verifikator BPJS, petugas RME) yang dapat menjalankannya. (BR-13)
- **US-011** — Sebagai Admin SIMRS, saya ingin membatasi data yang terlihat **per baris** (unit/poli/DPJP), agar dokter/perawat hanya mengakses pasien di lingkup tugasnya. (BR-12)

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | Sistem menyediakan CRUD Role (tambah, ubah, duplikat, aktif/nonaktif, hapus terkondisi). | US-001, BR-01/02 |
| FR-002 | Sistem menampilkan katalog permission terstruktur Menu › Sub Menu › Aksi › **Action**, bersumber dari registry menu/action (A37). | US-002 |
| FR-003 | Sistem menyediakan Matriks Role × Permission dengan centang **per action**, centang massal per modul, dan pencarian. | US-002 |
| FR-004 | Sistem **mewajibkan minimal 1 permission** saat menyimpan role; role kosong ditolak. | BR-04 |
| FR-005 | Sistem menyediakan layar User-Role: cari user (A1), tetapkan/cabut satu/lebih role, **tanpa field masa berlaku**. | US-003, BR-08/14 |
| FR-006 | Sistem menghitung permission + data scope efektif user sebagai union seluruh role-nya. | BR-08/12 |
| FR-007 | Sistem merender menu & action sesuai permission (menyembunyikan/menonaktifkan yang tak diizinkan). | US-008 |
| FR-008 | Sistem menolak operasi/action tanpa permission di sisi server pada setiap endpoint. | US-004, BR-06/07 |
| FR-009 | Sistem mencatat audit trail untuk setiap perubahan role/permission/**scope**/mapping (aktor, waktu, nilai lama→baru, IP). | US-005, BR-10 |
| FR-010 | Sistem menyediakan layar/list & filter Audit Trail RBAC. | US-005 |
| FR-011 | Sistem mencegah hapus role yang dipakai user aktif, mencegah role kosong, & mencegah self-lockout admin. | US-007, BR-02/03/04/11 |
| FR-012 | Sistem menyediakan Dashboard RBAC (jumlah role, user per role, role tanpa user, permission per role, scope per role). | US-009 |
| FR-013 | Sistem mendukung pemetaan default role berdasarkan Jabatan (A55) saat pembuatan user [ASUMSI]. | US-003 |
| FR-014 | Sistem menandai modul/action sensitif (RME, Keuangan, Konfigurasi, SEP, SATUSEHAT) sebagai default-tertutup (least-privilege). | BR-09 |
| FR-015 | Sistem menyediakan pengaturan **Data Scope (row-level)** per role/user (semua/unit-poli/DPJP/instalasi) & memfilter baris data **server-side** sesuai scope efektif. | US-011, BR-12 |
| FR-016 | Sistem menerapkan perubahan permission/role/scope **secara realtime** ke sesi aktif (invalidasi & refresh permission/scope cache user terdampak, target < 5 detik) tanpa login ulang. | US-006, BR-05 |
| FR-017 | Sistem menyediakan permission **action integrasi terpisah** untuk BPJS-SEP (`terbitkan_sep`, `batalkan_sep`, dll) & SATUSEHAT (`kirim_satusehat`, `tarik_data_satusehat`, dll), terlepas dari permission `view` menu induk. | US-010, BR-13 |
| FR-018 | Sistem menyediakan mekanisme push/sinyal pencabutan sesi (server-driven) agar enforcement realtime tetap konsisten. [ASUMSI] | BR-05 |

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Form Tambah/Edit Role (INPUT) — FR-001
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| role_id | ID Role | text | Ya | auto, unik | auto-generate | read-only |
| role_name | Nama Role | text | Ya | unik (case-insensitive), maks 50 char | manual | BR-01 |
| role_code | Kode Role | text | Tidak | unik, alfanumerik, maks 20 char | manual/auto | utk integrasi internal |
| deskripsi | Deskripsi | text | Tidak | maks 255 char | manual | mengikuti `keterangan` kanonik |
| is_system_role | Role Bawaan Sistem | boolean | Ya | true/false | default false | role bawaan tak bisa dihapus |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik `status_aktif` |
| jumlah_permission | Jumlah Permission | number | Ya | **>= 1** (validasi saat simpan) | terhitung dari matriks | BR-04, role kosong ditolak |

### 11.2 Matriks Role × Permission — granular per action (INPUT) — FR-003
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| role_id | Role | lookup | Ya | role aktif | lookup master Role | konteks matriks |
| menu_id | Menu/Sub Menu | lookup | Ya | dari registry A37 | lookup A37 | hierarki menu |
| action_id | Action | lookup | Ya | dari registry action A37 | lookup A37 | granular per tombol/operasi |
| action_key | Kode Action | text | Ya | enum/registry (mis. view, create, update, delete, validasi, cetak, approve, terbitkan_sep, batalkan_sep, kirim_satusehat) | A37 | BR-13 |
| is_granted | Diizinkan | boolean | Ya | true/false | default false | least-privilege [BR-09] |

### 11.3 Data Scope / Row-Level (INPUT) — FR-015 *(baru)*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| scope_id | ID Scope | text | Ya | auto, unik | auto-generate | read-only |
| owner_type | Lekat Pada | dropdown | Ya | role / user | enum | scope bisa di role atau override per user |
| owner_id | Role/User | lookup | Ya | role aktif / user A1 | lookup | sesuai owner_type |
| scope_type | Jenis Scope | dropdown | Ya | semua / unit_poli / dpjp / instalasi | enum | default `semua` [BR-12] |
| scope_values | Nilai Scope | multi-lookup | Tidak* | dari master Unit (A3)/DPJP/Instalasi | lookup | *wajib bila scope_type ≠ semua |
| enforce_level | Penegakan | dropdown | Ya | server-side (default) | enum | wajib server-side [BR-07] |

### 11.4 Form User-Role (INPUT) — FR-005 *(field masa berlaku DIHAPUS)*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| user_id | User | lookup | Ya | user dari A1 | lookup A1 User | |
| nama | Nama Lengkap | text | – | maks 100 char | autofill dari Staff (A2) | field kanonik, read-only |
| nip | NIP | text | – | 18 digit, unik | autofill dari Staff | field kanonik, read-only |
| jabatan | Jabatan | dropdown | – | master Jabatan (A55) | autofill dari Staff | field kanonik, read-only |
| unit | Unit/Poli | dropdown(lookup) | – | master Unit (A3) | autofill dari Staff | field kanonik, read-only |
| role_ids | Role | dropdown(multi) | Ya | minimal 1 role aktif | lookup master Role | union permission+scope [BR-08/12] |

> Catatan: field `berlaku_mulai`/`berlaku_berakhir` **dihilangkan** sesuai keputusan tidak memakai masa berlaku [BR-14].

### 11.5 Audit Trail RBAC (TAMPIL DATA) — FR-010
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit_log.created_at | datetime (dd-mm-yyyy HH:mm) | sort desc (default), filter rentang tanggal | |
| Aktor | audit_log.actor (nama+NIP) | text | filter | dari A1/A2 |
| Aksi | audit_log.action | badge (CREATE/UPDATE/DELETE/ASSIGN/REVOKE/UPDATE_SCOPE) | filter | enum |
| Objek | audit_log.entity (Role/Permission/Data-Scope/User-Role) | text | filter | |
| Nilai Lama → Baru | audit_log.old/new | text/diff | – | ringkas, detail di modal |
| IP | audit_log.ip | text | filter | [ASUMSI] |

### 11.6 Dashboard RBAC (TAMPIL DATA) — FR-012
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Role Aktif | count Role where aktif | angka besar (kartu) | – | ringkasan |
| Total User Ber-role | count distinct user_role | angka besar | – | |
| Role Tanpa User | count Role tanpa mapping | angka besar (badge merah) | – | sorot tata kelola |
| Role Tanpa Permission | count Role where jumlah_permission=0 | angka (harus 0) | – | indikator BR-04 |
| Nama Role | Role.role_name | text | sort A-Z | |
| Jumlah User | count user per role | angka | sort desc | |
| Jumlah Permission (action) | count action per role | angka | sort | indikasi over-privilege granular |
| Data Scope | scope_type per role | badge (semua/unit/dpjp/instalasi) | filter | BR-12 |
| Status | Role.status_aktif | badge (aktif/nonaktif) | filter | |

[PERLU KONFIRMASI] Daftar final `action_key` (termasuk action SEP/SATUSEHAT) & atribut scope tersedia bergantung pada registry A37 dan modul integrasi BPJS/SATUSEHAT.

## 12. Non-Functional Requirements

- **NFR-001 (Keamanan)** — Enforcement permission **dan data scope** wajib server-side di setiap endpoint; password & sesi mengikuti kebijakan keamanan SIMRS. (BR-07/12)
- **NFR-002 (Keamanan/Privasi)** — Akses modul RME, keuangan, & action SEP/SATUSEHAT default tertutup; selaras UU PDP & Permenkes RME. (BR-09/13)
- **NFR-003 (Auditability)** — Audit trail immutable (tidak bisa diubah/dihapus dari UI), retensi minimal [PERLU KONFIRMASI: usulan 5 tahun untuk kebutuhan akreditasi].
- **NFR-004 (Performa)** — Pemuatan permission+scope efektif saat login < 2 detik; cek otorisasi + filter scope per request < 100 ms. [ASUMSI]
- **NFR-005 (Usability)** — Matriks permission per-action & pengaturan scope dapat dikelola admin non-teknis (centang, cari, centang massal). Sesuai SDM IT terbatas RS Tipe C&D.
- **NFR-006 (Ketersediaan/Reliabilitas)** — Mekanisme cegah lockout admin (BR-03/BR-11); fallback akun super-admin terkunci aman.
- **NFR-007 (Skalabilitas sederhana)** — Mendukung jumlah role, user, action, & scope khas RS Tipe C&D (puluhan role, ratusan user) tanpa redesign.
- **NFR-008 (Realtime & internet tidak stabil)** — Perubahan permission/role/scope berlaku **realtime** via invalidasi sesi/permission cache (server-driven). Saat koneksi user terputus, enforcement terbaru diterapkan saat reconnect/refresh sesi; cache lokal punya TTL pendek agar tidak memakai izin basi. [ASUMSI — diubah dari model next-login agar memenuhi kebutuhan realtime di RS Tipe C&D]
- **NFR-009 (Konsistensi enforcement)** — Filter row-level diterapkan pada lapisan query/data, bukan hanya UI, agar ekspor/laporan/API juga terbatas pada scope user. (BR-12)

## 13. Integrasi Eksternal

RBAC adalah modul **internal**; tidak memanggil layanan eksternal secara langsung, tetapi **menjadi gerbang otorisasi** bagi modul lain yang berintegrasi eksternal, **hingga level action**.

| Integrasi/Modul | Arah | Peran RBAC |
|-----------------|------|------------|
| A1 User | Internal | Sumber akun untuk mapping User↔Role |
| A2 Staff | Internal | Sumber identitas (nama, NIP, NIK, jabatan, unit) — read-only |
| A3 Unit/Poli | Internal | Sumber atribut data scope (row-level) |
| A37 Akses Menu | Internal | Sumber registry menu **& daftar action** → katalog permission granular |
| A55 Jabatan | Internal | Acuan pemetaan default jabatan→role [ASUMSI] |
| **BPJS (VClaim/SEP)** | Eksternal (tak langsung) | RBAC mengatur **permission action terpisah**: `terbitkan_sep`, `batalkan_sep`, `cek_keaktifan`, dll. Hanya role berwenang (mis. Verifikator BPJS/Petugas Pendaftaran) yang boleh menjalankannya [BR-13] |
| **SATUSEHAT** | Eksternal (tak langsung) | RBAC mengatur **permission action terpisah**: `kirim_satusehat`, `tarik_data_satusehat`, dll. Hanya role berwenang (mis. Petugas RME/Dokter) yang boleh menjalankannya [BR-13] |
| Disdukcapil, INA-CBG, LIS, RIS/PACS | Eksternal (tak langsung) | RBAC menentukan **siapa boleh** menjalankan operasi yang memanggil integrasi — bukan memanggil API-nya |

Keputusan: action integrasi eksternal (mis. tombol "Terbitkan SEP", "Kirim ke SATUSEHAT") **memakai permission terpisah & granular**, tidak otomatis mengikuti permission menu induk [BR-13]. *(Sesuai instruksi 5.)*

Catatan konsistensi: tidak ada field identitas baru didefinisikan di sini — `nama`, `nik`, `nip`, `jenis_kelamin`, `jabatan`, `unit`, `status_aktif`, `keterangan` mengikuti definisi kanonik modul A1/A2.

## Asumsi
- [ASUMSI] Tidak ada BPMN khusus RBAC; alur As-Is/To-Be diturunkan dari pola umum RS Tipe C&D + analogi proses operasional ber-BPMN (otorisasi aksi sensitif: SEP, settlement, resume medis, SATUSEHAT).
- [ASUMSI] Model RBAC flat (role-permission, union antar role), granular per action, dengan row-level scope berbasis atribut tetap (unit/DPJP) — bukan rule engine ABAC penuh; tanpa hierarki role/inheritance & tanpa deny eksplisit untuk MVP.
- [ASUMSI] Enforcement realtime via invalidasi sesi/permission+scope cache; cache lokal ber-TTL pendek agar tidak memakai izin basi saat internet fluktuatif.
- [ASUMSI] Pemetaan default Jabatan (A55) → Role saat pembuatan user untuk mempercepat onboarding.
- [ASUMSI] Modul/action sensitif (RME, Keuangan/Kasir, Konfigurasi, SEP, SATUSEHAT) default-tertutup (least-privilege).
- [ASUMSI] Field identitas user diwarisi read-only dari A1/A2; RBAC tidak mengelola data master staf.
- [KEPUTUSAN] Role wajib minimal 1 permission (role kosong ditolak) — BR-04.
- [KEPUTUSAN] Mapping User↔Role tanpa masa berlaku/efektif tanggal — BR-14.
- [KEPUTUSAN] Perubahan akses berlaku realtime, bukan next-login — BR-05.
- [KEPUTUSAN] Pembatasan tingkat baris (row-level/data scope) masuk in-scope MVP — BR-12.
- [KEPUTUSAN] Action SEP & SATUSEHAT memakai permission terpisah granular — BR-13.
- [ASUMSI] Target metrik & NFR (waktu, retensi) adalah usulan awal, perlu persetujuan manajemen RS.

## Pertanyaan Terbuka
- Batas tegas tanggung jawab antara A18 (Role), A37 (Akses Menu), dan A53 (RBAC) — siapa pemilik CRUD role vs permission/action vs mapping vs scope?
- Mekanisme teknis realtime enforcement (BR-05): push server-driven (WebSocket/SSE) vs polling TTL pendek — mana yang dipilih mengingat infrastruktur RS Tipe C&D?
- Daftar final action_key per modul (termasuk action SEP/SATUSEHAT) — bergantung registry A37 & modul integrasi.
- Atribut data scope yang didukung MVP: cukup unit/poli & DPJP, atau perlu instalasi/cabang lain? (BR-12)
- Bila scope antar-role berbeda, konfirmasi kebijakan union vs intersection (default diusulkan union). (BR-12)
- Retensi audit trail berapa lama (usulan 5 tahun untuk akreditasi)?