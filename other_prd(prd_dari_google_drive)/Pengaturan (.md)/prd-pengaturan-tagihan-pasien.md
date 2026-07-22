# PRD — Pengaturan Tagihan Pasien (A60)

**Related Document:** Permintaan PO A60 Pengaturan Tagihan Pasien; PRD Billing: Tagihan Pasien (G2); PRD RBAC (A53)
**Versi:** 1.2 — Satu pengaturan untuk tombol Ubah Data G2; perubahan terbatas pada item tagihan
**Tanggal:** 2026-07-15

## 1. Metadata Dokumen

| Atribut | Nilai |
|---|---|
| Kode fitur | **A60** |
| Nama fitur | **Pengaturan Tagihan Pasien** |
| Menu | **Pengaturan → Tagihan Pasien** |
| Konsumen konfigurasi | **Tagihan Pasien (G2)** |
| Pengelola Phase 1 | Role **Manajer ke atas** dengan permission eksplisit A60 melalui RBAC A53; Kasir tidak mengubah konfigurasi |
| Scope Phase 1 | **Seluruh Pelayanan** |
| BPMN | Belum tersedia; alur diturunkan dari kontrak G2 |

**Related Documents**
* **G2 Tagihan Pasien** adalah pemilik `bill`, `bill_item`, Lock, perhitungan total, dan audit perubahan item.
* **A53 RBAC** menyediakan permission eksplisit untuk pengelola A60.
* Pendaftaran/encounter serta modul pelayanan sumber menyediakan data pasien dan charge sumber secara read-only.

| Tanggal | Versi | Deskripsi |
|---|---|---|
| 2026-07-15 | 1.0–1.1 | Draft awal dan keputusan tata kelola konfigurasi. |
| 2026-07-15 | 1.2 | **[DIKONFIRMASI]** Tiga toggle diganti satu pengaturan: **Apakah kasir dapat mengupdate data Tagihan?**. Pengaturan ini mengaktifkan/menonaktifkan tombol **Ubah Data** pada G2 dan hanya mencakup tambah dan/atau kurangi item tagihan. |

## 2. Overview & Background

**Pengaturan Tagihan Pasien (A60)** adalah konfigurasi terpusat untuk menentukan apakah Kasir dapat menjalankan perubahan item pada Tagihan Pasien (**G2**). Layar A60 bukan layar transaksi dan bukan master tarif.

A60 hanya memiliki **satu** pengaturan boolean pada Section 1 — Pengaturan:

| Pertanyaan / Label | Field | Dampak pada G2 |
|---|---|---|
| **Apakah kasir dapat mengupdate data Tagihan?** | `allow_update_bill_items` | Aktif: tombol **Ubah Data** tersedia pada Detail Tagihan G2 sebelum Lock. Nonaktif: tombol/aksi tersebut tidak tersedia dan server menolak mutasi manual item tagihan. |

Saat aktif, **Ubah Data** di G2 dapat dipakai untuk **menambah item tagihan** dan/atau **mengurangi item tagihan**. G2 tetap memvalidasi qty dan nilai, menghitung ulang ringkasan/total/outstanding, menegakkan status Lock, dan membuat audit secara atomik.

> **Batas tegas:** update hanya pada `bill_item`/item tagihan. Pengaturan dan tombol ini **tidak pernah** mengubah Data Pasien, identitas/demografi, data pendaftaran/encounter, rekam klinis, order, resep, dispensing, atau baseline/referensi charge dari modul sumber. Header Data Pasien pada G2 tetap read-only.

Konfigurasi awal di-seed **nonaktif**. Manajer berizin mengubahnya untuk scope Seluruh Pelayanan dengan alasan perubahan wajib; Kasir hanya menggunakan hasil konfigurasi pada G2.

## 3. Goals & Metrics

| No | Goal / Metric | Kriteria Keberhasilan |
|---|---|---|
| 1 | Kontrol kewenangan terpusat | 100% klik dan request **Ubah Data** G2 dievaluasi terhadap `allow_update_bill_items`, role, dan status Lock. |
| 2 | Satu perilaku yang jelas | Saat aktif, Kasir dapat menambah dan/atau mengurangi item tagihan melalui satu entry point; saat nonaktif, seluruh mutasi manual item ditolak. |
| 3 | Batas data pasien | 0 perubahan dari A60/G2 flow ini memutakhirkan data pasien, pendaftaran, encounter, atau data klinis sumber. |
| 4 | Kepatuhan Lock | 0 perubahan item berhasil ketika `is_locked=true`, terlepas dari nilai pengaturan. |
| 5 | Auditability | 100% perubahan konfigurasi dan item menyimpan aktor, waktu, alasan, before/after, serta `setting_version`. |

## 4. Scope Definition & Phasing

| Area | Phase 1 — MVP | Phase 2 — Approval | Phase 3 — Accounting |
|---|---|---|---|
| Section 1 — Pengaturan | Satu toggle `allow_update_bill_items`, default `false`, scope Seluruh Pelayanan | Maker-checker/effective date bila diperlukan | N/A |
| Konsumsi G2 | Toggle mengatur ketersediaan tombol/aksi **Ubah Data** untuk tambah/kurangi `bill_item` pra-Lock | Approval koreksi pasca-Lock tetap mekanisme G2 | Nilai efektif menjadi basis jurnal G2 |
| Audit konfigurasi | Versioning, alasan wajib, optimistic concurrency, riwayat append-only | Diff/approval trail | Retensi sesuai kebijakan RS |

### In Scope — Phase 1
1. Satu pengaturan berlabel **Apakah kasir dapat mengupdate data Tagihan?**.
2. Toggle tersebut mengaktifkan/menonaktifkan tombol **Ubah Data** pada Detail Tagihan G2.
3. Dari tombol itu Kasir dapat menambah dan/atau mengurangi item tagihan sebelum Lock, sesuai validasi G2.
4. Satu konfigurasi aktif scope **ALL_SERVICES**; akses baca/simpan A60 hanya Manajer ke atas melalui A53.
5. Versioning dan audit konfigurasi; audit mutasi item tetap milik G2.

### Out of Scope
* Mengubah data pasien, data pendaftaran/encounter, rekam klinis, order, resep, dispensing, master tarif, atau baseline modul sumber.
* Pembayaran, diskon, Lock/Unlock, perhitungan total, dan CRUD transaksi selain perubahan item melalui **Ubah Data** — milik G2.
* Konfigurasi terpisah untuk tambah, kurangi, atau ubah nilai item.
* Konfigurasi per unit/ruang/penjamin/kategori serta limit qty/nominal.
* Mapping COA/jurnal; A60 tidak membentuk jurnal.

## 5. Related Features

| Code / Modul | Relasi | Tanggung Jawab |
|---|---|---|
| **A60** | Pengaturan → Tagihan Pasien | Menyimpan satu kebijakan izin dan versinya. |
| **G2** | Billing/Kasir → Tagihan Pasien | Membaca kebijakan saat tombol/aksi **Ubah Data** digunakan; mengubah `bill_item`, validasi, rekalkulasi, Lock, dan audit. |
| **A53** | Admin → RBAC | Memberikan permission A60 kepada Manajer ke atas. |
| Pendaftaran/encounter | Sumber Data Pasien | Menyediakan header pasien read-only untuk G2; bukan target update A60. |
| Modul pelayanan/penunjang/farmasi/akomodasi | Sumber charge | Menyediakan baseline/refensi source yang tetap immutable. |

**Kontrak A60 → G2**
* A60 mengirim konfigurasi aktif dan `setting_version`.
* G2 mengevaluasi konfigurasi ketika aksi dieksekusi, bukan hanya ketika layar dibuka.
* Bila konfigurasi tidak tersedia atau tidak valid, G2 **fail closed**: sembunyikan/nonaktifkan tombol dan tolak request tanpa mengubah item.

## 6. Business Process & User Stories

### 6.1 Alur Pengelolaan Konfigurasi
1. Manajer berizin membuka **Pengaturan → Tagihan Pasien**.
2. Sistem memuat satu toggle aktif, versi, pengubah terakhir, dan riwayat.
3. Manajer mengaktifkan/menonaktifkan **Apakah kasir dapat mengupdate data Tagihan?** serta mengisi alasan perubahan.
4. Sistem memvalidasi alasan dan `expected_version`; saat valid sistem membuat versi/audit baru.
5. G2 memakai versi terbaru untuk aksi berikutnya.

### 6.2 Alur Konsumsi pada G2
1. Kasir membuka Detail Tagihan; Data Pasien tampil read-only.
2. G2 menampilkan tombol **Ubah Data** hanya bila role Kasir memenuhi, `allow_update_bill_items=true`, dan tagihan belum Lock.
3. Kasir memilih tambah item tagihan dan/atau kurangi item tagihan, lalu mengisi alasan perubahan.
4. G2 memvalidasi perubahan, memutakhirkan `bill_item` dan ringkasan secara atomik, lalu mencatat audit dengan `setting_version`.
5. Bila konfigurasi nonaktif atau tagihan Lock, tidak ada perubahan data.

### 6.3 User Stories
| ID | User Story | Prioritas | Fase | Traceability |
|---|---|---|---|---|
| **US-001** | Sebagai Manajer, saya ingin mengaktifkan/menonaktifkan satu izin update Tagihan agar kewenangan Kasir terkendali. | P0 | 1 | FR-001–FR-004 |
| **US-002** | Sebagai Kasir, saya ingin tombol **Ubah Data** tersedia hanya saat diizinkan agar saya dapat menambah dan/atau mengurangi item tagihan sebelum Lock. | P0 | 1 | FR-005–FR-008 |
| **US-003** | Sebagai Auditor, saya ingin versi pengaturan dan audit perubahan item tercatat agar dasar koreksi dapat ditelusuri. | P1 | 1 | FR-009, BR-004 |
| **US-004** | Sebagai pengguna G2, saya ingin Data Pasien tetap read-only saat mengubah item agar data pasien tidak berubah melalui Billing. | P0 | 1 | FR-010, BR-006 |

## 7. Functional & UI/UX Requirements

### 7.1 Fitur: Layar Pengaturan Tagihan Pasien
1. **FR-001 — Akses:** hanya Manajer ke atas dengan permission eksplisit A53 dapat membuka dan menyimpan A60.
2. **FR-002 — Satu toggle:** Section 1 menampilkan tepat satu toggle berlabel **Apakah kasir dapat mengupdate data Tagihan?**, versi aktif, pengubah terakhir, dan scope Seluruh Pelayanan.
3. **FR-003 — Mapping:** toggle memetakan ke `allow_update_bill_items`; tidak ada `allow_add`, `allow_reduce`, atau `allow_update` terpisah.
4. **FR-004 — Simpan:** konfigurasi awal `false`; semua nilai valid. Setiap perubahan wajib alasan maksimal 500 karakter, menggunakan `expected_version`, membuat `setting_version` baru dan audit append-only.

### 7.2 Fitur: Enforcement pada G2
1. **FR-005 — Tombol Ubah Data:** G2 hanya menampilkan/mengaktifkan tombol **Ubah Data** bila `allow_update_bill_items=true`, role Kasir valid, dan `is_locked=false`; server wajib memvalidasi ulang atomik.
2. **FR-006 — Tambah item:** melalui Ubah Data, Kasir dapat membuat item `BILLING_MANUAL` dengan qty > 0, harga ≥ 0, dan alasan wajib.
3. **FR-007 — Kurangi item:** melalui Ubah Data, Kasir dapat mengurangi qty/nilai efektif tanpa nilai negatif; qty 0 diberi status `REDUCED_TO_ZERO` dan audit tidak dihapus.
4. **FR-008 — Lock:** `is_locked=true` selalu menolak tombol/aksi Ubah Data, dengan pesan jalur Unlock G2.
5. **FR-009 — Audit & rekalkulasi:** perubahan yang lolos merekalkulasi ringkasan/penjamin/outstanding dan mencatat before/after, alasan, aktor, waktu, sesi Kasir, sumber, serta `setting_version`.
6. **FR-010 — Batas pasien:** form Ubah Data tidak memuat field edit Data Pasien. Data pasien, pendaftaran/encounter, dan sumber klinis tetap read-only dan tidak boleh diproses oleh endpoint mutasi item.

### 7.3 State UI
| Kondisi | Perilaku |
|---|---|
| Toggle nonaktif/default | Tombol Ubah Data G2 disembunyikan/nonaktif; request mutasi item ditolak. |
| Toggle aktif, pra-Lock | Tombol Ubah Data tersedia untuk tambah/kurangi item saja. |
| Tagihan Lock | Tombol/aksi diblokir walaupun toggle aktif. |
| Konfigurasi gagal diverifikasi | Fail closed dengan pesan untuk menghubungi Admin. |
| Data Pasien | Selalu read-only pada Detail Tagihan. |

## 8. Data & Business Rules

### 8.1 Data Model Rekomendasi

**Table: `patient_billing_setting`** — satu konfigurasi aktif untuk `ALL_SERVICES`.

| Field | Tipe | Wajib | Sumber Data/Logika | Validasi | Keterangan |
|---|---|---|---|---|---|
| `id` | UUID | Ya | Sistem | PK | Identitas konfigurasi. |
| `scope` | enum | Ya | Sistem | hanya `ALL_SERVICES` Phase 1 | Scope konfigurasi. |
| `allow_update_bill_items` | boolean | Ya | Toggle A60 | default `false` | Satu izin untuk tombol Ubah Data G2 dan operasi tambah/kurangi `bill_item`. |
| `setting_version` | integer | Ya | Sistem | naik monotonik | Versi yang direkam audit G2. |
| `is_active` | boolean | Ya | Sistem | tepat satu aktif/scope | Konfigurasi runtime. |
| `reason` | varchar(500) | Ya | Input Manajer | trim tidak kosong; maks. 500 | Alasan perubahan konfigurasi. |
| `created_by`, `created_at`, `updated_by`, `updated_at` | UUID, timestamp | Ya | Auth/sistem | — | Audit konfigurasi. |

**Table: `patient_billing_setting_audit`** menyimpan snapshot before/after dari `allow_update_bill_items`, versi, alasan, aktor, dan waktu secara append-only.

### 8.2 API Endpoint Recommendations
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/settings/patient-billing` | Membaca satu toggle, scope, versi, dan pengubah terakhir. |
| PUT | `/api/v1/settings/patient-billing` | Menyimpan `{ allow_update_bill_items, expected_version, reason }`. |
| GET | `/api/v1/settings/patient-billing/history` | Membaca riwayat append-only. |
| GET | `/api/v1/settings/patient-billing/permission?action=UPDATE_BILL_ITEMS` | Resolusi internal izin Ubah Data G2. |
| POST | `/api/v1/bills/{id}/items` | Aksi G2 tambah item melalui Ubah Data; wajib izin aktif, pra-Lock, alasan, dan audit atomik. |
| POST | `/api/v1/bills/{id}/items/{itemId}/reduce` | Aksi G2 kurangi item melalui Ubah Data; wajib izin aktif, pra-Lock, alasan, dan audit atomik. |

### 8.3 Business Rules
| ID | Aturan | Traceability |
|---|---|---|
| **BR-001** | A60 hanya memiliki satu izin `allow_update_bill_items`; tidak ada izin Tambah/Kurangi/Ubah terpisah. | FR-002/003 |
| **BR-002** | Nilai `true` membuat G2 menyediakan satu entry point **Ubah Data** untuk tambah dan/atau kurangi item tagihan pra-Lock. | FR-005–FR-007 |
| **BR-003** | Nilai `false`, konfigurasi tidak tersedia, atau konfigurasi tidak valid membuat G2 fail closed tanpa mutasi item. | FR-005; NFR-003 |
| **BR-004** | Mutasi item wajib menyimpan `setting_version`, before/after, alasan, aktor, waktu, sesi Kasir, dan referensi sumber. | FR-009 |
| **BR-005** | Lock selalu mengalahkan pengaturan. | FR-008 |
| **BR-006** | A60/G2 flow ini tidak boleh membuat atau mengubah Data Pasien, pendaftaran/encounter, rekam klinis, order, resep, dispensing, maupun baseline sumber. | FR-010 |
| **BR-007** | Tambah membuat `BILLING_MANUAL`; pengurangan tidak boleh negatif dan tidak menghapus audit. | FR-006/007 |
| **BR-008** | Hanya Manajer ke atas dengan permission eksplisit A53 dapat mengubah A60; Kasir tidak mengelola konfigurasi. | FR-001 |

### 8.4 Non-Functional Requirements
| ID | Requirement | Target / Acceptance |
|---|---|---|
| **NFR-001** | Audit & integritas | Audit konfigurasi/item append-only; tidak ada hard-delete dari aplikasi. |
| **NFR-002** | RBAC | Validasi A53 dan izin G2 dilakukan server-side. |
| **NFR-003** | Fail closed | Gangguan baca konfigurasi menolak mutasi item dan tidak mengubah data. |
| **NFR-004** | Konsistensi transaksi | Cek izin, Lock, mutasi `bill_item`, rekalkulasi, dan audit berada dalam satu transaksi. |

## 9. Workflow / BPMN Interpretation

> A60 belum memiliki BPMN sendiri; alur berikut berasal dari kontrak dengan G2.

### Skenario 1 — Manajer mengatur hak Kasir
1. Manajer berizin membuka A60 dan memuat konfigurasi aktif.
2. Manajer mengubah toggle **Apakah kasir dapat mengupdate data Tagihan?** dan mengisi alasan.
3. **Gateway: alasan dan versi valid?**
   * Tidak → tampilkan validasi, tidak menyimpan perubahan.
   * Ya → buat versi baru serta audit append-only.

### Skenario 2 — Kasir menggunakan Ubah Data G2
1. Kasir membuka Detail Tagihan; header Data Pasien hanya dibaca.
2. **Gateway: `allow_update_bill_items=true` dan tagihan belum Lock?**
   * Tidak → tombol/endpoint Ubah Data tidak tersedia atau ditolak tanpa perubahan.
   * Ya → tampilkan tombol **Ubah Data**.
3. Kasir memilih tambah item dan/atau kurangi item, lalu mengisi alasan.
4. G2 memvalidasi nilai, mengubah `bill_item`, merekalkulasi total, dan menulis audit berversi secara atomik.
5. Tidak ada langkah yang mengubah Data Pasien atau sumber klinis.

### Skenario 3 — Tagihan Lock
1. Kasir mencoba Ubah Data ketika `is_locked=true`.
2. G2 menolak aksi meski toggle aktif dan mengarahkan koreksi ke proses Unlock G2.

## Asumsi
- A60 berlaku untuk Seluruh Pelayanan dan menyediakan satu konfigurasi aktif.
- Konfigurasi awal di-seed dengan allow_update_bill_items=false.
- Manajer ke atas dengan permission eksplisit A53 mengelola A60; Kasir hanya mengonsumsi izin di G2.
- [DIKONFIRMASI] Pengaturan A60 hanya mengaktifkan/menonaktifkan tombol Ubah Data G2 untuk tambah dan/atau kurangi item tagihan.
- [DIKONFIRMASI] Update tidak mencakup Data Pasien, pendaftaran/encounter, atau data klinis sumber.