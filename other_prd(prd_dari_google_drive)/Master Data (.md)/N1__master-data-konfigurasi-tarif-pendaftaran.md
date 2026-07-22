# PRD — Master Data Konfigurasi Tarif Pendaftaran

**Related Document:** Master Data Tarif Layanan, Modul Pendaftaran Rawat Jalan, Modul Pendaftaran IGD, Modul Billing/Kasir
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-07-16

## 1. Metadata Dokumen

| Atribut | Nilai |
|---------|-------|
| **Nama Modul** | Master Data — Konfigurasi Tarif Pendaftaran |
| **Kode Fitur** | N1 |
| **Cluster** | Control Panel |
| **Approval** | [Nama Stakeholder, Jabatan, Tanggal] |
| **Related Documents** | Master Data Tarif Layanan; Modul Pendaftaran Rawat Jalan; Modul Pendaftaran IGD; Modul Billing/Kasir |
| **Document Version** | 2026-07-16, v1.0, Draft awal |
| **Target Rumah Sakit** | RS Tipe C & D |
| **Persona Pengelola** | Petugas Master Data / Admin Control Panel |

> Modul ini menggantikan mekanisme mapping tarif administrasi pendaftaran yang pada versi sebelumnya (V1) bersifat *hardcode* di backend. Pada versi ini, rumah sakit dapat mengelola aturan tarif administrasi secara mandiri tanpa perubahan source code maupun proses deployment.

## 2. Overview & Background

### Overview / Brief Summary

Modul **Konfigurasi Tarif Pendaftaran** menyediakan mekanisme bagi rumah sakit untuk mengatur aturan pembebanan **tarif administrasi pendaftaran** secara fleksibel tanpa mengubah source code. Setiap proses pendaftaran pasien **Rawat Jalan** maupun **IGD** akan secara otomatis menghasilkan tarif administrasi yang sesuai dengan kebijakan rumah sakit, berdasarkan kombinasi parameter yang dikonfigurasi.

Parameter konfigurasi yang didukung:
- **Unit Pelayanan**: Rawat Jalan / IGD.
- **Status Pasien**: Pasien Baru / Pasien Lama / Semua.
- **Tipe Penjamin**: mis. BPJS, Umum, Asuransi (mengacu master penjamin).
- **Poli/Unit** (opsional, sesuai kebutuhan rumah sakit).

Nominal tarif administrasi **tidak diinput manual** pada modul ini, melainkan **direferensikan dari Master Data Tarif Layanan** sehingga tidak terjadi duplikasi pengelolaan tarif. Bila terdapat lebih dari satu konfigurasi yang memenuhi kriteria pendaftaran, sistem menggunakan **aturan prioritas (priority rule)**.

Contoh mapping (referensi dari draft sumber):

| No | Unit | Status Pasien | Tipe Penjamin | Tarif Layanan (referensi) |
|----|------|---------------|---------------|---------------------------|
| 1 | Rawat Jalan | Baru | BPJS | Administrasi RJ BPJS Baru |
| 2 | Rawat Jalan | Lama | BPJS | Administrasi RJ BPJS Lama |
| 3 | Rawat Jalan | Baru | Umum | Administrasi RJ Umum Baru |
| 4 | Rawat Jalan | Lama | Umum | Administrasi RJ Umum Lama |
| 5 | IGD | Semua | Semua | Administrasi IGD |

### Business Process (As-Is vs To-Be)

**As-Is (kondisi saat ini / V1):**
- Mapping tarif administrasi pendaftaran dilakukan secara *hardcode* pada backend aplikasi.
- Setiap perubahan aturan tarif (mis. tarif BPJS berubah, poli baru dibuka, penambahan tipe penjamin) **memerlukan perubahan source code dan deployment ulang** aplikasi.
- Rumah sakit **bergantung penuh pada tim developer** untuk perubahan sekecil apa pun; waktu tunggu lama dan berisiko salah pasang tarif.
- Tidak ada jejak audit yang rapi atas siapa mengubah aturan tarif, kapan, dan dari nilai apa ke nilai apa.
- Potensi inkonsistensi: nominal administrasi bisa berbeda antara logika backend dan Master Tarif Layanan.

**To-Be (solusi digital yang diusulkan):**
- Petugas Master Data mengelola konfigurasi tarif administrasi melalui menu **Control Panel → Konfigurasi Tarif Pendaftaran** (CRUD) tanpa melibatkan developer.
- Saat pendaftaran RJ/IGD, sistem **otomatis me-resolve** konfigurasi **aktif** yang cocok berdasarkan Unit + Status Pasien + Tipe Penjamin (+ Poli opsional), memilih **priority tertinggi** bila ada beberapa yang cocok, mengambil nominal dari **Master Tarif Layanan**, lalu **menambahkannya ke billing** pasien setelah registrasi berhasil.
- Perubahan konfigurasi **hanya berlaku untuk transaksi baru** setelah disimpan; transaksi billing yang sudah tercatat **tidak berubah** (immutability transaksi historis).
- Setiap aktivitas konfigurasi (tambah/ubah/aktivasi/nonaktif/hapus) tercatat pada **Audit Trail** (user, role, waktu, nilai sebelum & sesudah).

> Konsistensi: deskripsi To-Be di atas selaras dengan State Machine (§6), Acceptance Criteria (§7), dan Business Rules (§8.3).

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kemandirian pengelolaan tarif | 100% perubahan aturan tarif administrasi pendaftaran dapat dilakukan mandiri oleh petugas RS **tanpa** perubahan source code / deployment. |
| 2 | Akurasi resolusi tarif | ≥ 99% pendaftaran RJ/IGD memperoleh tarif administrasi yang sesuai konfigurasi aktif (diukur dari sampel rekonsiliasi billing). |
| 3 | Otomasi pembebanan billing | 100% tarif administrasi hasil konfigurasi otomatis masuk ke billing pasien setelah registrasi berhasil, tanpa input manual. |
| 4 | Konsistensi sumber tarif | 0 duplikasi nominal tarif; seluruh nominal administrasi bersumber dari Master Data Tarif Layanan. |
| 5 | Waktu perubahan aturan | Perubahan/aktivasi konfigurasi efektif berlaku untuk transaksi baru **≤ 1 menit** setelah disimpan. [ASUMSI] |
| 6 | Auditability | 100% aktivitas konfigurasi (create/update/toggle/delete) tercatat di Audit Trail dengan user, role, waktu, nilai lama & baru. |
| 7 | Kinerja resolusi | Proses resolusi tarif saat pendaftaran ≤ 500 ms pada kondisi beban normal. [ASUMSI] |
| 8 | Kemudahan pakai | Petugas dapat membuat 1 konfigurasi baru ≤ 2 menit tanpa pelatihan mendalam (usability). [ASUMSI] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|------------------------------------------|
| Konfigurasi Tarif Administrasi (RJ & IGD) | CRUD konfigurasi (create/read/update/soft-delete) dengan parameter Unit, Status Pasien, Tipe Penjamin, Poli opsional | Perubahan konfigurasi melalui **approval berjenjang** (maker–checker) sebelum aktif |
| Referensi Tarif | Ambil nominal dari Master Tarif Layanan (read-only) | Notifikasi bila tarif layanan sumber berubah/nonaktif |
| Aktivasi/Nonaktif | Toggle aktif/nonaktif via Dashboard | Aktivasi menunggu persetujuan approver |
| Priority Rule | Set nilai prioritas + deteksi bentrok konfigurasi | Rekomendasi/validasi prioritas otomatis |
| Preview / Simulasi | Preview hasil resolusi tarif sebelum simpan | Simulasi massal (batch) lintas skenario |
| Pencarian & Filter | Search + filter (unit, status pasien, penjamin, status aktif) | — |
| Histori & Audit Trail | Pencatatan otomatis semua perubahan (user, role, waktu, before/after) | Approval trail (pengaju, penyetuju, alasan) |
| Integrasi Pendaftaran RJ/IGD → Billing | Resolusi otomatis + push tarif ke billing saat registrasi sukses | — |

**Out of Scope:**
- Tarif Kamar Rawat Inap.
- Tarif Kamar VK (bersalin).
- Master Standar Harga Kamar.
- Tarif tindakan medis.
- Tarif obat dan BHP.
- Pengelolaan Master Tarif Layanan itu sendiri (hanya direferensikan, dikelola di modul terpisah).
- Pengelolaan Master Penjamin/Poli (hanya direferensikan).
- Approval berjenjang (dipindahkan ke Phase 2; namun desain DB sudah disiapkan sejak Phase 1).

## 5. Related Features

Modul ini terhubung dengan beberapa modul lain dalam SIMRS:

- **Master Tarif Layanan** — Sumber nominal tarif administrasi. Modul N1 **hanya mereferensikan** `service_tariff_id`; nominal, nama, dan status tarif dikelola di modul ini. Bila tarif sumber nonaktif/dihapus, konfigurasi terkait harus ditandai *invalid* / [PERLU KONFIRMASI] perilaku fallback.
- **Modul Pendaftaran Rawat Jalan** — Konsumen konfigurasi. Saat registrasi RJ berhasil, memanggil resolusi tarif administrasi (Unit=Rawat Jalan) dan meneruskan hasil ke Billing.
- **Modul Pendaftaran IGD** — Konsumen konfigurasi. Saat registrasi IGD berhasil, memanggil resolusi tarif administrasi (Unit=IGD) dan meneruskan hasil ke Billing.
- **Modul Billing / Kasir** — Penerima output. Tarif administrasi hasil resolusi otomatis ditambahkan sebagai item tagihan pada billing pasien. Perubahan konfigurasi **tidak** mengubah item billing yang sudah tercatat.
- **Master Penjamin** — Sumber pilihan Tipe Penjamin (BPJS, Umum, Asuransi, dll). [ASUMSI] direferensikan via `guarantor_type_id`.
- **Master Poli/Unit** — Sumber pilihan Poli (opsional). [ASUMSI] direferensikan via `poli_unit_id`.
- **Audit Trail / Log Aktivitas** — Menerima catatan setiap perubahan konfigurasi.

Relasi teknis utama: N1 bertindak sebagai **penyedia aturan (rule provider)**; Pendaftaran RJ/IGD sebagai **pemicu (trigger)**; Master Tarif Layanan sebagai **sumber nilai**; Billing sebagai **muara (sink)**.

## 6. Business Process & User Stories

### State Machine Table

Status konfigurasi tarif pendaftaran. Kolom "Efek" menjelaskan dampak status terhadap **resolusi tarif saat pendaftaran** (analog kolom Efek Stok pada template).

| Status | Deskripsi | Efek (terhadap resolusi tarif) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-------------------------------|--------------------|--------------------|
| AKTIF | Konfigurasi berlaku dan menjadi kandidat resolusi tarif | Diikutkan dalam pencocokan saat pendaftaran RJ/IGD | AKTIF → NONAKTIF (toggle) | Sama; perubahan aktif via approval |
| NONAKTIF | Konfigurasi dinonaktifkan sementara | **Tidak** diikutkan dalam resolusi tarif | NONAKTIF → AKTIF (toggle) | Aktivasi menunggu approval |
| DIHAPUS (soft delete) | Konfigurasi dihapus logis (`deleted_at` terisi) | Tidak muncul di daftar & tidak diikutkan resolusi | AKTIF/NONAKTIF → DIHAPUS | Penghapusan menunggu approval |
| DRAFT | (Phase 2) Konfigurasi baru belum diajukan | Tidak diikutkan resolusi | — (tidak dipakai Phase 1) | DRAFT → MENUNGGU_APPROVAL |
| MENUNGGU_APPROVAL | (Phase 2) Menunggu persetujuan approver | Tidak diikutkan resolusi | — | MENUNGGU_APPROVAL → DISETUJUI / DITOLAK |
| DISETUJUI | (Phase 2) Disetujui, siap diaktifkan | Diikutkan bila status aktif | — | DISETUJUI → AKTIF |
| DITOLAK | (Phase 2) Ditolak approver | Tidak diikutkan resolusi | — | DITOLAK → DRAFT (revisi) |

> **Catatan status Phase 1:** Saat create, konfigurasi **selalu langsung AKTIF** oleh sistem (tidak ada input status di form). Kolom `status_approval` diset default (mis. `APPROVED`) di Phase 1 dan menjadi bermakna pada Phase 2. Status DRAFT/MENUNGGU_APPROVAL/DISETUJUI/DITOLAK hanya aktif pada Phase 2.

### User Stories Utama

- **US-01** — Sebagai **Petugas Master Data**, saya ingin **membuat konfigurasi tarif administrasi** berdasarkan kombinasi Unit, Status Pasien, dan Tipe Penjamin, agar tarif pendaftaran otomatis sesuai kebijakan RS tanpa minta bantuan developer.
- **US-02** — Sebagai **Petugas Master Data**, saya ingin **mengubah konfigurasi** yang sudah ada, agar aturan tarif tetap mengikuti perubahan kebijakan.
- **US-03** — Sebagai **Petugas Master Data**, saya ingin **mencari & memfilter** konfigurasi, agar cepat menemukan aturan tertentu di antara banyak data.
- **US-04** — Sebagai **Petugas Master Data**, saya ingin **mengaktifkan/menonaktifkan** konfigurasi lewat toggle di Dashboard, agar bisa menyalakan/mematikan aturan tanpa menghapusnya.
- **US-05** — Sebagai **Petugas Master Data**, saya ingin **melihat preview hasil resolusi tarif** sebelum menyimpan, agar yakin konfigurasi menghasilkan tarif yang benar.
- **US-06** — Sebagai **Petugas Master Data**, saya ingin **mengatur prioritas** saat beberapa konfigurasi cocok, agar sistem memilih aturan yang tepat.
- **US-07** — Sebagai **Supervisor / Auditor**, saya ingin **melihat histori & audit trail** perubahan konfigurasi, agar setiap perubahan dapat dipertanggungjawabkan.
- **US-08** — Sebagai **Petugas Pendaftaran (RJ/IGD)**, saya ingin **tarif administrasi otomatis muncul di billing** saat registrasi berhasil, agar tidak perlu input tarif manual.
- **US-09** — Sebagai **Petugas Master Data**, saya ingin **menghapus (soft delete) konfigurasi** yang tidak dipakai, agar daftar tetap rapi tanpa kehilangan jejak audit.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: FR-01 — Buat Konfigurasi Tarif Pendaftaran (Create)**
- **User Story**: US-01 — Sebagai Petugas Master Data, saya ingin membuat konfigurasi tarif administrasi berdasarkan kombinasi parameter, agar tarif pendaftaran otomatis sesuai kebijakan RS.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Form create menampilkan field: Nama Konfigurasi, Unit Pelayanan (RJ/IGD), Status Pasien (Baru/Lama/Semua), Tipe Penjamin, Poli/Unit (opsional), Tarif Layanan (dropdown dari Master Tarif Layanan), Prioritas.
    - **AC2**: Field **Status tidak ditampilkan** di form; saat disimpan sistem otomatis mengeset status = **AKTIF** dan `status_approval` = default (`APPROVED`).
    - **AC3**: Nominal tarif **tidak diinput manual**; hanya `service_tariff_id` yang dipilih. Nominal ditampilkan read-only mengikuti Master Tarif Layanan.
    - **AC4**: Sistem menolak simpan bila ada konfigurasi **AKTIF** lain dengan kombinasi (Unit + Status Pasien + Tipe Penjamin + Poli) **identik dan prioritas sama** → tampilkan pesan bentrok.
    - **AC5**: Setelah simpan sukses, muncul notifikasi "Konfigurasi berhasil dibuat", data tampil di List dengan status AKTIF, dan tercatat 1 entri Audit Trail (action=CREATE).
    - **AC6**: Field wajib kosong → simpan diblokir dengan pesan validasi per field.

- **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nama Konfigurasi | Text | Required, Max 100 | "Nama konfigurasi wajib diisi" | "Contoh: Administrasi RJ BPJS Pasien Baru" |
  | Unit Pelayanan | Dropdown | Required (RJ/IGD) | "Unit pelayanan wajib dipilih" | "Pilih Rawat Jalan atau IGD" |
  | Status Pasien | Dropdown | Required (Baru/Lama/Semua) | "Status pasien wajib dipilih" | "Pilih Baru, Lama, atau Semua" |
  | Tipe Penjamin | Dropdown | Required | "Tipe penjamin wajib dipilih" | "Contoh: BPJS, Umum, Asuransi" |
  | Poli/Unit | Dropdown | Optional | — | "Kosongkan bila berlaku untuk semua poli" |
  | Tarif Layanan | Dropdown (searchable) | Required, harus tarif aktif | "Tarif layanan wajib dipilih" | "Diambil dari Master Tarif Layanan" |
  | Prioritas | Number | Required, Integer ≥ 1 | "Prioritas wajib diisi (angka ≥ 1)" | "Angka lebih kecil = prioritas lebih tinggi" |

---

**Fitur: FR-02 — Ubah Konfigurasi (Edit)**
- **User Story**: US-02
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Form edit memuat nilai eksisting; seluruh field FR-01 dapat diubah kecuali status (dikelola via toggle di Dashboard).
    - **AC2**: Validasi bentrok kombinasi berlaku sama seperti create (AC4 FR-01), mengecualikan record yang sedang diedit.
    - **AC3**: Perubahan hanya berlaku untuk transaksi pendaftaran **setelah** disimpan; billing yang sudah tercatat tidak berubah.
    - **AC4**: Simpan sukses mencatat Audit Trail (action=UPDATE) dengan nilai **sebelum** dan **sesudah**.
- **Validasi**: Sama dengan tabel FR-01 (A).

---

**Fitur: FR-03 — Daftar, Pencarian & Filter (List)**
- **User Story**: US-03
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: List menampilkan kolom: Nama Konfigurasi, Unit, Status Pasien, Tipe Penjamin, Poli, Tarif Layanan (+nominal), Prioritas, Status (AKTIF/NONAKTIF), Aksi.
    - **AC2**: Tersedia search by Nama dan filter by Unit, Status Pasien, Tipe Penjamin, Status Aktif.
    - **AC3**: List men-support pagination dan sort minimal by Prioritas dan Nama.
    - **AC4**: Record ber-`deleted_at` (soft delete) tidak ditampilkan.
- **Validasi**: Input search di-trim; filter kosong = tampilkan semua.

---

**Fitur: FR-04 — Aktivasi / Nonaktif (Toggle Status)**
- **User Story**: US-04
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Toggle status berada di Dashboard/List (bukan di form create/edit).
    - **AC2**: Toggle AKTIF→NONAKTIF menghentikan konfigurasi dari resolusi tarif; NONAKTIF→AKTIF mengembalikannya.
    - **AC3**: Setiap toggle menampilkan konfirmasi dan mencatat Audit Trail (action=TOGGLE_STATUS, before/after).
    - **AC4**: Menonaktifkan konfigurasi tidak menghapus data dan tidak mengubah transaksi historis.
- **Validasi**:
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Toggle Status | Switch | Butuh konfirmasi | "Gagal mengubah status, coba lagi" | "Nonaktif = tidak dipakai saat pendaftaran" |

---

**Fitur: FR-05 — Preview / Simulasi Resolusi Tarif**
- **User Story**: US-05
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Pengguna memasukkan skenario (Unit + Status Pasien + Tipe Penjamin + Poli) lalu menekan Preview.
    - **AC2**: Sistem menampilkan konfigurasi yang **terpilih** beserta nominal tarif dari Master Tarif Layanan, atau pesan "Tidak ada konfigurasi yang cocok".
    - **AC3**: Bila beberapa cocok, sistem menampilkan yang **prioritas tertinggi** dan mencantumkan daftar kandidat lain (informasi).
    - **AC4**: Preview bersifat read-only, **tidak** membuat transaksi billing.
- **Validasi**: Skenario minimal Unit + Status Pasien + Tipe Penjamin wajib diisi.

---

**Fitur: FR-06 — Aturan Prioritas (Priority Rule)**
- **User Story**: US-06
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Setiap konfigurasi memiliki nilai `priority` (integer ≥ 1); angka lebih kecil = prioritas lebih tinggi. [PERLU KONFIRMASI arah urutan]
    - **AC2**: Saat pendaftaran, bila >1 konfigurasi AKTIF cocok, sistem memilih `priority` tertinggi; bila `priority` sama, gunakan tie-breaker deterministik (mis. `updated_at` terbaru). [ASUMSI]
    - **AC3**: Sistem memperingatkan bila terdeteksi dua konfigurasi AKTIF dengan kriteria & prioritas identik.
- **Validasi**: Prioritas wajib integer ≥ 1.

---

**Fitur: FR-07 — Histori & Audit Trail**
- **User Story**: US-07
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Setiap CREATE/UPDATE/TOGGLE_STATUS/DELETE mencatat: user, role, timestamp, action, nilai sebelum (JSON), nilai sesudah (JSON).
    - **AC2**: Halaman histori per-konfigurasi menampilkan daftar perubahan urut waktu (terbaru di atas).
    - **AC3**: Audit Trail bersifat **append-only** (tidak dapat diedit/dihapus dari UI).
- **Validasi**: —

---

**Fitur: FR-08 — Resolusi Otomatis saat Pendaftaran → Billing**
- **User Story**: US-08
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Saat registrasi RJ/IGD berhasil, sistem memanggil resolusi tarif (endpoint resolve) dengan parameter pasien.
    - **AC2**: Nominal tarif administrasi hasil resolusi otomatis ditambahkan sebagai item ke billing pasien tanpa input manual.
    - **AC3**: Sistem menggunakan konfigurasi yang **berlaku pada saat transaksi** (snapshot nominal disimpan di item billing).
    - **AC4**: Bila tidak ada konfigurasi cocok, sistem menangani sesuai kebijakan fallback [PERLU KONFIRMASI]: (a) tidak membebankan administrasi, atau (b) memblokir & minta konfigurasi.
- **Validasi**: —

---

**Fitur: FR-09 — Hapus Konfigurasi (Soft Delete)**
- **User Story**: US-09
- **Prioritas**: P2
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC1**: Delete bersifat **soft delete** (`deleted_at` terisi); data tidak hilang permanen.
    - **AC2**: Konfigurasi terhapus tidak tampil di List dan tidak diikutkan resolusi.
    - **AC3**: Delete mencatat Audit Trail (action=DELETE) dan meminta konfirmasi.
- **Validasi**: Konfirmasi "Yakin hapus konfigurasi ini?" wajib disetujui.

---

### Non-Functional Requirements
- **NFR-01 (Kinerja)**: Resolusi tarif saat pendaftaran ≤ 500 ms pada beban normal. [ASUMSI]
- **NFR-02 (Auditability)**: 100% perubahan konfigurasi tercatat immutable di Audit Trail.
- **NFR-03 (Konsistensi)**: Nominal tarif selalu bersumber dari Master Tarif Layanan; tidak ada penyimpanan nominal terpisah yang bisa divergen (kecuali snapshot di item billing historis).
- **NFR-04 (Keamanan/Otorisasi)**: Hanya role berwenang (mis. Admin Master Data) yang dapat CRUD & toggle; role lain read-only. [PERLU KONFIRMASI matriks role]
- **NFR-05 (Reliabilitas)**: Kegagalan resolusi tidak boleh menggagalkan proses registrasi secara diam-diam; harus ada penanganan error/log.
- **NFR-06 (Kompatibilitas)**: Berjalan baik untuk RS Tipe C & D dengan volume pendaftaran menengah.

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table Name**: `registration_fee_configs`

**Key Columns**:
- `id`: UUID (Primary Key)
- `config_code`: VARCHAR(30) (Unique, auto-generated) — kode konfigurasi
- `config_name`: VARCHAR(100) (Not Null)
- `service_unit`: ENUM('RAWAT_JALAN','IGD') (Not Null)
- `patient_status`: ENUM('BARU','LAMA','SEMUA') (Not Null)
- `guarantor_type_id`: UUID (FK → master_guarantor_types, Not Null)
- `poli_unit_id`: UUID (FK → master_poli_units, Nullable — opsional)
- `service_tariff_id`: UUID (FK → master_service_tariffs, Not Null) — sumber nominal
- `priority`: INTEGER (Not Null, default 1)
- `is_active`: BOOLEAN (Not Null, default true)
- `status_approval`: ENUM('DRAFT','PENDING','APPROVED','REJECTED') (Not Null, default 'APPROVED') — *disiapkan untuk Phase 2*
- `role_approver`: VARCHAR(50) (Nullable) — *disiapkan untuk Phase 2*
- `submitted_by`: UUID (Nullable) — *Phase 2*
- `approved_by`: UUID (Nullable) — *Phase 2*
- `approved_at`: TIMESTAMP (Nullable) — *Phase 2*
- `effective_from`: TIMESTAMP (Nullable) — awal berlaku [ASUMSI]
- `effective_to`: TIMESTAMP (Nullable) — akhir berlaku [ASUMSI]
- `created_by`: UUID (Not Null)
- `created_at`: TIMESTAMP (Not Null, default now())
- `updated_by`: UUID (Nullable)
- `updated_at`: TIMESTAMP (Nullable)
- `deleted_at`: TIMESTAMP (Nullable) — soft delete

> **Catatan Phasing:** Kolom `status_approval`, `role_approver`, `submitted_by`, `approved_by`, `approved_at` sudah disertakan sejak **Phase 1** (diisi nilai default/`APPROVED`) agar migrasi ke approval berjenjang **Phase 2** tidak memerlukan perubahan skema besar.
> **Index disarankan:** komposit `(service_unit, patient_status, guarantor_type_id, poli_unit_id, is_active, priority)` untuk mempercepat resolusi.

**Table Name**: `registration_fee_config_audit_logs`

**Key Columns**:
- `id`: UUID (Primary Key)
- `config_id`: UUID (FK → registration_fee_configs)
- `action`: ENUM('CREATE','UPDATE','TOGGLE_STATUS','DELETE') (Not Null)
- `changed_by`: UUID (Not Null)
- `changed_by_role`: VARCHAR(50) (Not Null)
- `changed_at`: TIMESTAMP (Not Null, default now())
- `old_value`: JSONB (Nullable) — snapshot sebelum
- `new_value`: JSONB (Nullable) — snapshot sesudah

> Item billing (di modul Billing) menyimpan **snapshot nominal** tarif administrasi agar transaksi historis tidak berubah saat konfigurasi diperbarui.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/registration-fee-configs` | List konfigurasi (support search & filter: unit, patient_status, guarantor_type, is_active; pagination & sort) |
| GET | `/api/v1/registration-fee-configs/{id}` | Detail satu konfigurasi |
| POST | `/api/v1/registration-fee-configs` | Create konfigurasi (status di-set AKTIF oleh sistem) |
| PUT | `/api/v1/registration-fee-configs/{id}` | Update konfigurasi |
| PATCH | `/api/v1/registration-fee-configs/{id}/status` | Toggle Active/Inactive |
| DELETE | `/api/v1/registration-fee-configs/{id}` | Soft delete konfigurasi |
| GET | `/api/v1/registration-fee-configs/{id}/history` | Riwayat audit trail per konfigurasi |
| POST | `/api/v1/registration-fee-configs/preview` | Preview/simulasi resolusi tarif untuk skenario tertentu (read-only) |
| POST | `/api/v1/registration-fee-configs/resolve` | Resolusi tarif untuk transaksi pendaftaran (dipakai modul RJ/IGD) |
| GET | `/api/v1/service-tariffs?type=registration` | Lookup tarif administrasi aktif dari Master Tarif Layanan (dropdown) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| config_name | Nama Konfigurasi | Text | Ya | Max 100 | Input user | Contoh: "Administrasi RJ BPJS Baru" |
| service_unit | Unit Pelayanan | Dropdown | Ya | RAWAT_JALAN / IGD | Enum sistem | Menentukan modul pendaftaran pemicu |
| patient_status | Status Pasien | Dropdown | Ya | BARU / LAMA / SEMUA | Enum sistem | "SEMUA" cocok untuk kedua status |
| guarantor_type_id | Tipe Penjamin | Dropdown | Ya | Harus penjamin valid | Master Penjamin | Contoh: BPJS, Umum, Asuransi |
| poli_unit_id | Poli/Unit | Dropdown | Tidak | Poli valid bila diisi | Master Poli/Unit | Opsional; kosong = berlaku semua poli |
| service_tariff_id | Tarif Layanan | Dropdown (searchable) | Ya | Harus tarif aktif | Master Tarif Layanan | Nominal read-only mengikuti master |
| priority | Prioritas | Number | Ya | Integer ≥ 1 | Input user | Angka kecil = prioritas tinggi [PERLU KONFIRMASI] |
| status | Status | — | — (tidak di form) | Di-set AKTIF oleh sistem | Sistem | Dikelola via toggle Dashboard |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Nama Konfigurasi | `config_name` | Text | Search, Sort | — |
| Unit | `service_unit` | Badge (RJ/IGD) | Filter | — |
| Status Pasien | `patient_status` | Badge (Baru/Lama/Semua) | Filter | — |
| Tipe Penjamin | join `guarantor_type_id` | Text | Filter | Nama penjamin dari master |
| Poli | join `poli_unit_id` | Text / "Semua" | — | "Semua" bila null |
| Tarif Layanan | join `service_tariff_id` | Text + Rp nominal | — | Nominal dari Master Tarif Layanan |
| Prioritas | `priority` | Number | Sort | — |
| Status | `is_active` | Toggle (AKTIF/NONAKTIF) | Filter | Toggle di sini (FR-04) |
| Aksi | — | Icon (Edit/Hapus/Histori/Preview) | — | — |

#### Business Rules
- **BR-01**: Nominal tarif administrasi **selalu** berasal dari Master Tarif Layanan (`service_tariff_id`); modul ini tidak menyimpan nominal secara independen.
- **BR-02**: Saat create, status **selalu AKTIF** dan tidak diinput di form; `status_approval` default `APPROVED` (Phase 1).
- **BR-03**: Bila >1 konfigurasi AKTIF cocok dengan kriteria pendaftaran, sistem memilih **prioritas tertinggi** (priority terkecil); tie-breaker = `updated_at` terbaru. [ASUMSI]
- **BR-04**: Tidak boleh ada dua konfigurasi **AKTIF** dengan kombinasi (Unit + Status Pasien + Tipe Penjamin + Poli) **dan** prioritas identik (validasi bentrok).
- **BR-05**: Perubahan/aktivasi/nonaktif/hapus konfigurasi **hanya** berlaku untuk transaksi pendaftaran **setelah** perubahan disimpan; item billing yang sudah tercatat tidak berubah (immutability + snapshot nominal).
- **BR-06**: Konfigurasi NONAKTIF atau soft-deleted **tidak** diikutkan dalam resolusi tarif.
- **BR-07**: `patient_status = SEMUA` cocok untuk pasien Baru maupun Lama; kriteria spesifik (BARU/LAMA) diutamakan bila prioritas lebih tinggi. [PERLU KONFIRMASI interaksi SEMUA vs prioritas]
- **BR-08**: Setiap perubahan konfigurasi **wajib** menghasilkan entri Audit Trail (user, role, waktu, before, after).
- **BR-09**: Bila tarif layanan sumber dinonaktifkan/dihapus, konfigurasi yang mereferensikannya harus ditandai *invalid* dan tidak dipakai resolusi. [PERLU KONFIRMASI]
- **BR-10**: Delete bersifat soft delete; data tetap tersimpan untuk kebutuhan audit.

## 9. Workflow / BPMN Interpretation

> BPMN formal untuk fitur ini belum tersedia. Alur berikut disusun berdasarkan draft sumber dan template. **[ASUMSI]**

### Alur A — Pengelolaan Konfigurasi (oleh Petugas Master Data)
1. Petugas membuka menu **Control Panel → Konfigurasi Tarif Pendaftaran**.
2. Sistem menampilkan **List** konfigurasi (search/filter tersedia).
3. Petugas menekan **Tambah** → mengisi form (Unit, Status Pasien, Tipe Penjamin, Poli opsional, Tarif Layanan, Prioritas).
4. (Opsional) Petugas menekan **Preview** → sistem menampilkan konfigurasi terpilih & nominal tarif untuk skenario uji.
5. Petugas menekan **Simpan** → sistem memvalidasi (field wajib, bentrok kombinasi/prioritas).
6. Bila valid → sistem menyimpan dengan status **AKTIF**, `status_approval=APPROVED`, dan mencatat **Audit Trail (CREATE)**.
7. Petugas dapat **Edit**, **Toggle Aktif/Nonaktif** (di Dashboard), atau **Soft Delete**; setiap aksi tercatat di Audit Trail.

### Alur B — Resolusi Tarif saat Pendaftaran (otomatis, dipicu modul RJ/IGD)
1. Petugas Pendaftaran menyelesaikan registrasi pasien RJ/IGD.
2. Modul Pendaftaran memanggil `POST /resolve` dengan parameter (Unit, Status Pasien, Tipe Penjamin, Poli).
3. Sistem mencari konfigurasi **AKTIF** yang cocok.
   - Tidak ada yang cocok → jalankan kebijakan fallback [PERLU KONFIRMASI].
   - Satu cocok → gunakan konfigurasi tersebut.
   - Beberapa cocok → pilih **prioritas tertinggi** (tie-breaker `updated_at`).
4. Sistem mengambil **nominal** dari Master Tarif Layanan (`service_tariff_id`).
5. Sistem menambahkan item tarif administrasi (dengan **snapshot nominal**) ke **Billing** pasien.
6. Transaksi tercatat; perubahan konfigurasi berikutnya tidak mengubah item billing ini.

### Alur C (Phase 2, referensi) — Approval Berjenjang
1. Petugas membuat/mengubah konfigurasi → status **DRAFT** → **MENUNGGU_APPROVAL**.
2. **Approver** meninjau → **DISETUJUI** (lanjut AKTIF) atau **DITOLAK** (kembali DRAFT untuk revisi).
3. Approval trail (pengaju, penyetuju, waktu, alasan) tercatat. *(Di luar cakupan Phase 1.)*

## Asumsi

- [ASUMSI] Nominal tarif administrasi sepenuhnya dikelola di Master Tarif Layanan; modul N1 hanya mereferensikan, tidak menyimpan nominal (kecuali snapshot di item billing historis).
- [ASUMSI] Prioritas menggunakan integer ≥ 1 dengan angka lebih kecil = prioritas lebih tinggi; tie-breaker memakai updated_at terbaru.
- [ASUMSI] Target kinerja resolusi ≤ 500 ms dan efektivitas perubahan ≤ 1 menit adalah nilai awal yang perlu divalidasi terhadap infrastruktur RS Tipe C & D.
- [ASUMSI] Tipe Penjamin dan Poli/Unit direferensikan dari master yang sudah ada (Master Penjamin, Master Poli/Unit) via foreign key.
- [ASUMSI] Field effective_from/effective_to disiapkan di skema namun implementasi penjadwalan masa berlaku dapat ditunda bila belum dibutuhkan Phase 1.
- [ASUMSI] Approval berjenjang seluruhnya di Phase 2; Phase 1 mengisi status_approval = APPROVED secara default.
- [ASUMSI] Delete = soft delete demi kebutuhan audit; tidak ada hard delete dari UI.
- [ASUMSI] BPMN formal belum tersedia; alur pada §9 merupakan interpretasi dari draft sumber.

## Pertanyaan Terbuka

- Konvensi arah prioritas: apakah angka terkecil = prioritas tertinggi, atau sebaliknya? (BR-03, FR-06)
- Kebijakan fallback bila tidak ada konfigurasi tarif yang cocok saat pendaftaran: tidak membebankan administrasi, memakai default, atau memblokir registrasi? (FR-08 AC4, BR-09)
- Bagaimana interaksi patient_status = SEMUA terhadap konfigurasi spesifik BARU/LAMA dalam pemilihan prioritas? (BR-07)
- Perilaku bila Tarif Layanan sumber dinonaktifkan/dihapus di Master Tarif Layanan — apakah konfigurasi otomatis nonaktif atau ditandai invalid? (BR-09)
- Matriks role/otorisasi: role apa saja yang boleh CRUD, toggle, dan hanya view? (NFR-04)
- Apakah field effective_from / effective_to (masa berlaku terjadwal) termasuk Phase 1 atau ditunda? (8.1)
- Apakah penghapusan konfigurasi diperbolehkan sepenuhnya (soft delete) atau perlu batasan (mis. tidak boleh hapus bila pernah dipakai transaksi)? (FR-09)
- Sumber daftar Tipe Penjamin dan Poli — apakah benar-benar dari Master Penjamin & Master Poli/Unit yang sudah ada?
