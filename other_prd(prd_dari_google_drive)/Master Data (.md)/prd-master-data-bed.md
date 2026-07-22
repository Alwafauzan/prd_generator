# Product Requirement Document (PRD) — Master Data Bed

> **Kode Fitur:** A17 · **Cluster:** Control Panel · **Modul:** Master Data / Integrasi BPJS & SATUSEHAT V1 V2 · **Menu:** Bed · **Tribe:** Backoffice Administrasi
> SIMRS RS Tipe C & D · Disusun dengan persona System Analyst senior SIMRS

---

## 1. Metadata Dokumen

* **Kode Fitur**: **A17** — Master Data Bed
* **Approval**: M. Sulthan Farras Nanz — Chief Strategy & Growth Officer, Tamtech International — *(Signature, Date)*
* **PIC**: Arif Aminudin
* **Related Documents**:
    * Dokumentasi Satu Sehat (FHIR Location) — [Link Satusehat]
    * PRD Master Data Unit (A3), PRD Master Data Kamar (A16) *(dependency rantai pengiriman Satu Sehat)*
    * PRD Master Data Unit (A3), PRD Master Data Staf (A2) *(hierarki induk & pola integrasi self-service)*
    * PRD Pendaftaran Rawat Inap (`g-admisi-inpatient-registration`) *(konsumen data bed)*
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 12 Juni 2026 | 1.0 - Draft | Draft awal Master Data Bed |
| 24 Juni 2026 | 1.1 - Draft | Revisi draft Master Data Bed |
| 1 Juli 2026 | 2.0 | Field Jenis Kelamin sejak form Tambah Bed + Kirim ke Satu Sehat self-service |
| 1 Juli 2026 | 2.1 | Restrukturisasi sesuai template PRD (§1–§9); Data Requirements (§8.3) diselaraskan penuh dengan Data Requirement pada dokumen sumber (docx) |
| 2 Juli 2026 | 2.2 | **Re-phasing**: seluruh bagian integrasi Satu Sehat (kirim/resend, indikator status 5-state, validasi dependency, mapping FHIR Location, audit pengiriman) dipindahkan dari Phase 1 ke **Phase 2**. Phase 1 kini murni CRUD master data bed. |

---

> **⚠️ Catatan Phasing (v2.2):** Seluruh fungsi **integrasi Satu Sehat** pada PRD ini adalah **Phase 2**. **Phase 1 (MVP)** hanya mencakup CRUD master data bed (tautan Bangsal/Kamar, Nomor Bed, Jenis Kelamin, Ketersediaan manual), pencarian/filter, aktif/nonaktif, dan history integrity — **tanpa** pengiriman ke Satu Sehat. Skema data & UI tetap menyiapkan ruang untuk Satu Sehat sejak Phase 1 agar Phase 2 tidak perlu perubahan skema.

---

## 2. Overview & Background

* **Overview/Brief Summary**:
  **Master Data Bed (A17)** adalah pusat pengaturan data tempat tidur (bed) rumah sakit — menjadi **sumber kebenaran tunggal (single source of truth)** mengenai bed yang tersedia di tiap kamar/ruangan dalam suatu bangsal, jenis kelamin peruntukannya, serta status ketersediaannya. Master ini menjadi fondasi bagi modul **Pendaftaran Rawat Inap** (alokasi bed), **Pelayanan**, **Billing kamar**, dan **Pelaporan eksternal** (Satu Sehat, SIRANAP).

  Hierarki entitas: **Unit → Bangsal → Kamar (Ruangan) → Bed**. Master Data Bed cukup menautkan ke ID Kamar/Bangsal tanpa menduplikasi datanya, sehingga perubahan di level atas tidak perlu diulang di level bed.

  **Fokus Phase 1 (MVP)**: Penambahan field **Jenis Kelamin** sejak awal pendaftaran bed agar alokasi bed dapat dicocokkan dengan jenis kelamin pasien, serta CRUD master data bed yang rapi (tautan Bangsal/Kamar, Nomor Bed unik, Ketersediaan manual).

  **Fokus Phase 2 (Integrasi Satu Sehat)**: Kemampuan **mengirim data bed ke Satu Sehat secara mandiri (self-service)** oleh user RS tanpa intervensi tim Backend, beserta indikator status, validasi dependency, mapping FHIR, dan resend.

  **Cakupan Phase 1 (MVP)**:
    * Field Jenis Kelamin (Laki-laki / Perempuan) tersedia sejak form Tambah Bed.
    * Status ketersediaan bed: Tersedia, Ditempati, Dibersihkan, Rusak — dengan badge warna (diubah manual).
    * Pencarian, filter, sorting, pagination, pengelolaan aktif/nonaktif, dan integritas history.

  **Cakupan Phase 2 (Integrasi Satu Sehat)**:
    * Tombol "Kirim ke Satu Sehat" (self-service) untuk FHIR Location (`physicalType = bd`).
    * Status indikator pengiriman 5-state: Belum Terkirim, Sedang Dikirim, Berhasil, Gagal, Perlu Update.
    * Mapping status ketersediaan bed → FHIR `Location.operationalStatus` (kode HL7 bed status).
    * Mekanisme resend manual saat data bed diubah pasca-pengiriman.
    * Validasi dependency Kamar/Bangsal induk sebelum pengiriman.

* **Business Process (As-Is vs To-Be)**:

    * **As-Is** (Kondisi Saat Ini — masalah operasional):
        * Admin Master Data menambahkan bed via form (Bangsal, Ruangan, Nomor Bed, Availability), **belum ada field Jenis Kelamin** di form tambah.
        * Peruntukan jenis kelamin bed ditentukan manual/menyusul saat alokasi — rawan salah penempatan gender dalam satu kamar.
        * Pengiriman data bed ke Satu Sehat (jika ada) dilakukan **manual oleh tim Backend**; admin tidak punya visibility status.
        * Perubahan data bed **tidak terpropagasi otomatis** ke Satu Sehat dan tidak terjejak.

    * **To-Be** (Kondisi Yang Diharapkan — workflow digital baru):

      *Phase 1 (MVP — CRUD master data bed):*
        * Admin menambahkan bed via form **Tambah Bed v2** lengkap dengan Jenis Kelamin (Laki-laki/Perempuan) dan Ketersediaan.
        * Bed tersimpan & **AKTIF**, siap dipakai alokasi Pendaftaran RI (matching gender).
        * Admin dapat mencari/memfilter, mengubah, mengaktif/menonaktifkan bed; Status Ketersediaan diubah **manual**.

      *Phase 2 (Integrasi Satu Sehat):*
        * Setelah bed tersimpan, status indikator Satu Sehat = **"Belum Terkirim" (NOT_SENT)** dengan tombol Kirim ke Satu Sehat aktif.
        * Admin klik **Kirim ke Satu Sehat**; sistem memvalidasi field mandatory & dependency (Kamar induk sudah memiliki Location ID) lalu **POST** ke FHIR Location (`physicalType = bd`).
        * Response Satu Sehat: berhasil → **"Berhasil Terkirim" (SUCCESS)** + timestamp + Location ID; gagal → **"Gagal" (FAILED)** + pesan error.
        * Perubahan data bed pasca-pengiriman → status **"Perlu Update" (NEEDS_UPDATE)**, tombol Kirim Ulang aktif (**PUT** ke Satu Sehat).
        * Status Ketersediaan bed dipetakan ke `operationalStatus`; dapat diperbarui otomatis oleh modul Pelayanan saat admisi/pulang (lanjutan Phase 2).
        * Tim Backend **tidak lagi perlu intervensi manual** untuk pengiriman rutin.

* **Background & Masalah V1 yang diperbaiki**:

| Masalah V1 | Dampak | Solusi V2 |
|------------|--------|-----------|
| Jenis Kelamin bed tidak ditetapkan sejak awal | Risiko salah penempatan gender dalam satu kamar; petugas cek manual saat alokasi | Field Jenis Kelamin tersedia sejak form Tambah Bed |
| Pengiriman bed ke Satu Sehat manual oleh Backend | User RS bergantung pada tim Backend, lambat & tidak self-service | Tombol "Kirim ke Satu Sehat" dapat dipicu user |
| Tidak ada visibility status pengiriman | User tidak tahu data sudah terkirim atau belum | Status indikator 5-state dengan badge warna |
| Status Ketersediaan bed tidak terstandar untuk pelaporan | Pelaporan ketersediaan ke Satu Sehat/SIRANAP tidak konsisten | Mapping Ketersediaan → FHIR `operationalStatus` |
| Tidak ada mekanisme resend saat data berubah | Perubahan bed tidak terpropagasi ke Satu Sehat | Resend manual dengan trigger ulang dari user |
| Tidak ada validasi dependency Kamar/Bangsal | Pengiriman gagal di Satu Sehat tanpa pesan jelas | Validasi prerequisites sebelum API call |
| Aksi baris harus pilih list dulu (V1) | Interaksi lambat | Aksi per baris dapat langsung diklik di Dashboard |

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan data | 100% bed aktif memiliki Bangsal, Kamar, Nomor Bed, Jenis Kelamin, dan Ketersediaan |
| 2 | Keunikan nomor bed | 0 duplikasi Nomor Bed dalam satu kamar yang sama |
| 3 | *(Phase 2)* Self-service Satu Sehat | 100% bed baru dapat dikirim ke Satu Sehat oleh user RS tanpa intervensi tim Backend |
| 4 | *(Phase 2)* Tingkat keberhasilan pengiriman | ≥ 95% pengiriman ke Satu Sehat berhasil pada percobaan pertama |
| 5 | *(Phase 2)* Akurasi status ketersediaan | Status Ketersediaan bed konsisten dengan `operationalStatus` yang dikirim ke Satu Sehat |
| 6 | Waktu input data | < 1 menit per bed |

> **Goals**: (1) menyediakan data bed akurat & terpusat sebagai sumber kebenaran tunggal; (2) memastikan setiap bed punya peruntukan Jenis Kelamin sejak awal; (3) memungkinkan user RS memicu pengiriman Satu Sehat mandiri; (4) menyediakan indikator status pengiriman transparan; (5) memenuhi interoperabilitas data Lokasi (`physicalType = bd`) sesuai standar FHIR Kemenkes.

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD Master Data Bed) | Phase 2 (Integrasi Satu Sehat & Automation) |
|-------------|-------------------------------------|----------------------------------------------|
| Pendaftaran Data Bed | Input bed baru: Bangsal, Ruangan/Kamar, Nomor Bed, Jenis Kelamin, Ketersediaan | — |
| Pengelolaan Data Bed | Ubah data, lihat detail, aktivasi/non-aktivasi | Approval berjenjang perubahan master (kolom `approval_status`/`approver_role` disiapkan) |
| Ketersediaan Bed | Kelola manual (Tersedia, Ditempati, Dibersihkan, Rusak) | Auto-update dari modul Pelayanan/Pendaftaran (Ditempati saat admisi, Tersedia saat pulang, Dibersihkan saat housekeeping) |
| Jenis Kelamin Bed | Field Jenis Kelamin (Laki-laki / Perempuan) | — |
| Pencarian & Filter | Cari, filter (Bangsal, Ketersediaan, Jenis Kelamin), sorting, pagination | Tambahan filter Status Satu Sehat |
| Integrasi Satu Sehat | — *(tidak termasuk Phase 1)* | Tombol "Kirim ke Satu Sehat" (user trigger, POST/PUT FHIR Location `physicalType=bd`) & resend manual; validasi dependency induk; lalu auto-sync (background job tanpa user trigger), bulk send, riwayat aktivitas pengiriman lengkap |
| Status Indikator Satu Sehat | — *(tidak termasuk Phase 1)* | 5-state: Belum Terkirim, Sedang Dikirim, Berhasil, Gagal, Perlu Update |
| Mapping FHIR & Validasi Dependency | — *(tidak termasuk Phase 1)* | Mapping Ketersediaan → `operationalStatus`; validasi Kamar/Bangsal induk punya Location ID sebelum kirim |
| Pelaporan Eksternal Lain | — | Integrasi ketersediaan tempat tidur ke SIRANAP & BPJS Aplicares |

> **Catatan Phasing (v2.2):** **Phase 1 (MVP)** fokus pada **CRUD master data bed** — tanpa integrasi Satu Sehat dan tanpa approval berjenjang. **Seluruh integrasi Satu Sehat** (kirim/resend, indikator status 5-state, validasi dependency, mapping FHIR, audit pengiriman) dipindahkan ke **Phase 2**. Skema data sudah menyediakan kolom `satusehat_*` (§8.1) sejak Phase 1 agar Phase 2 tidak memerlukan perubahan skema, begitu pula kolom `approval_status`/`approver_role` untuk approval Phase 2.

**Out of Scope**:

| No | Scope |
|----|-------|
| 1 | Manajemen Bangsal (PRD Master Data Unit, A3) dan Kamar/Ruangan (PRD Master Data Kamar, A16) |
| 2 | Logic alokasi bed otomatis saat admisi pasien — ditangani modul Pendaftaran Rawat Inap |
| 3 | Kelas Perawatan (VIP, Kelas 1, 2, 3, VVIP) — dikelola pada level Kamar, bukan Bed |
| 4 | Logic pemotongan/penagihan biaya kamar berdasarkan bed — ditangani modul Billing |
| 5 | Pengiriman data bed ke sistem eksternal selain Satu Sehat (SIRANAP, BPJS Aplicares) — roadmap Phase 2 |

> Catatan penamaan fitur: meski kode A17 berlabel "Integrasi **BPJS** V1 V2", cakupan integrasi eksternal V2 difokuskan pada **Satu Sehat (FHIR Location)**; BPJS Aplicares masuk Phase 2. `[PERLU KONFIRMASI]` apakah ada bagian BPJS Aplicares yang wajib masuk V2.

---

## 5. Related Features

| No | Kode | Module | Feature | Deskripsi Relasi (Teknis / Bisnis) |
|----|------|--------|---------|-------------------------------------|
| 1 | A16 | Master Data | Master Data Kamar | **Prasyarat** — bed menautkan ke Kamar/Ruangan (FK); Kamar harus punya `Location ID` Satu Sehat sebelum bed dapat dikirim (`partOf`). Kelas Perawatan dikelola di level Kamar. |
| 2 | A3 | Master Data | Master Data Unit | Hierarki induk (Unit → Bangsal → Kamar → Bed); Unit dikirim ke Satu Sehat sebagai Location induk. |
| 3 | A2 | Master Data | Master Data Staf | Sumber `created_by` (`staff_id`) pembuat data bed; acuan **pola integrasi Satu Sehat self-service & indikator status**. |
| 4 | A43 | Master Data | Master Data Tarif Kamar | Dipakai Billing di level Kamar (bukan Bed) — konteks Out Scope. |
| 5 | — | Integrasi | Satu Sehat (FHIR Location) | Target pengiriman data bed (`physicalType = bd`). |
| 6 | — | Pendaftaran | Pendaftaran Rawat Inap (`g-admisi-inpatient-registration`) | Konsumen daftar bed & status untuk alokasi (matching gender pasien). Phase 2: modul ini meng-update Ketersediaan balik ke master. |
| 7 | — | Billing / Pelaporan | Billing Kamar, SIRANAP | Konsumen hierarki bed→kamar & ketersediaan. |

---

## 6. Business Process & User Stories

### 6.1 State Machine — Status Pengiriman Satu Sehat (`satusehat_status`) — *Phase 2*

> Seluruh state machine di bawah ini berlaku pada **Phase 2** (integrasi Satu Sehat). Di Phase 1 bed tidak memiliki status pengiriman aktif; kolom `satusehat_status` disiapkan namun belum digunakan (default **NOT_SENT**). Kolom "Transisi (Phase 1)/(Phase 2)" di bawah merujuk pada sub-tahap integrasi (manual vs auto-sync), keduanya bagian dari Phase 2 produk.

| Status | Deskripsi | Efek Data Bed | Transisi (manual) | Transisi (auto-sync) |
|--------|-----------|---------------|--------------------|--------------------|
| **NOT_SENT** (Belum Terkirim) | Bed baru tersimpan, belum pernah dikirim | Badge abu; tombol Kirim aktif | → SENDING (user klik Kirim) | → SENDING (auto/background) |
| **SENDING** (Sedang Dikirim) | Request POST/PUT sedang berjalan | Badge kuning; tombol nonaktif | → SUCCESS / → FAILED (response) | idem |
| **SUCCESS** (Berhasil Terkirim) | Location ID tersimpan | Badge hijau + timestamp + Location ID | → NEEDS_UPDATE (data berubah) | idem + auto-resend |
| **FAILED** (Gagal) | Pengiriman gagal (belum pernah sukses) | Badge merah + pesan error; tombol Kirim Ulang aktif | → SENDING (POST ulang) | → SENDING (auto-retry) |
| **NEEDS_UPDATE** (Perlu Update) | Field relevan berubah pasca-SUCCESS | Badge oranye; tombol Kirim Ulang aktif | → SENDING (PUT dengan Location ID) | → SENDING (auto-sync) |

> Master Bed tidak memiliki stok; kolom "Efek" pada template diadaptasi menjadi **Efek Data Bed**. Transisi status hanya mengubah `satusehat_status`, `satusehat_location_id`, `satusehat_last_sent_at`, `satusehat_last_error`. Status Ketersediaan (`Tersedia`/`Ditempati`/`Dibersihkan`/`Rusak`) dipetakan ke `operationalStatus` (§8.3.3); perubahan ketersediaan pada bed `SUCCESS` memicu `NEEDS_UPDATE`.

### 6.2 User Stories Utama

* Sebagai **Admin Master Data**, saya ingin **melihat Dashboard Data Bed** agar **ketersediaan bed & status Satu Sehat-nya terpantau dengan baik**.
* Sebagai **Admin Master Data**, saya ingin **menambah, mengubah, dan menonaktifkan data bed** agar **data bed selalu akurat dan up-to-date**.
* *(Phase 2)* Sebagai **Admin Master Data**, saya ingin **memicu pengiriman data bed ke Satu Sehat secara mandiri** agar **tidak bergantung pada tim Backend**.
* Sebagai **Petugas Pendaftaran RI**, saya ingin **daftar bed tersedia beserta peruntukan gender akurat** agar **tidak salah menempatkan pasien**.
* Sebagai **System**, saya ingin **mempertahankan integritas history data bed** agar **riwayat pasien yang memakai bed tidak rusak saat bed dinonaktifkan/diubah**.

> **Skala Prioritas**: P0 Critical (bagian MVP) · P1 Must Have · P2 Should Have · P3 Low (kosmetik) · P4 Enhancement (inovasi masa depan).

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard / Data Bed**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat Dashboard Data Bed, agar ketersediaan bed terpantau termasuk status Satu Sehat-nya.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Detail**:
    * Klik menu Master Data → Bed, tampil halaman Data Bed.
    * Kolom tabel: Bangsal, Nomor Kamar, Nomor Bed, Jenis Kelamin, Ketersediaan, Action. *(Kolom **Status Satu Sehat** ditambahkan pada **Phase 2**.)*
    * Aksi per baris: Detail, Edit, Aktif/Nonaktif — **dapat diakses langsung tanpa memilih list bed dahulu** (perbaikan dari V1). *(Aksi **Kirim/Kirim Ulang Satu Sehat** = **Phase 2**.)*
    * Badge Ketersediaan: Tersedia (hijau), Ditempati (merah), Dibersihkan (kuning), Rusak (abu).
    * *(Phase 2)* Badge Status Satu Sehat 5-state (abu/kuning/hijau/merah/oranye).
    * Filter dropdown: Bangsal, Ketersediaan, Jenis Kelamin + kolom pencarian (Cari…). *(Filter **Status Satu Sehat** = **Phase 2**.)*
    * Pencarian berdasarkan Nama Bangsal. Sorting kolom; default Bangsal A-Z. Pagination 15/25/50 per halaman.
    * Tombol Tambah untuk menambah bed.
* **Acceptance Criteria**:
    * **AC 1**: Halaman Data Bed tampil dengan seluruh kolom (Bangsal, Nomor Kamar, Nomor Bed, Jenis Kelamin, Ketersediaan, Action). *(Kolom **Status Satu Sehat** = **Phase 2**.)*
    * **AC 2**: Badge Ketersediaan tampil sesuai state (warna sesuai §8.3.2). *(Badge **Status Satu Sehat** 5-state = **Phase 2**, sesuai §6.1.)*
    * **AC 3**: Filter (Bangsal, Jenis Kelamin, Ketersediaan), pencarian, sorting default A-Z & pagination (15/25/50) berfungsi. *(Filter **Status Satu Sehat** = **Phase 2**.)*
    * **AC 4**: Aksi per baris dapat langsung diklik tanpa perlu memilih baris terlebih dahulu.

**Fitur: Tambah Bed**
* **User Story**: Sebagai Admin Master Data, saya ingin menambahkan data bed baru, agar tercatat di sistem dan dapat dikirim ke Satu Sehat.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Detail**:
    * Klik Tambah membuka modal "Menambahkan Bed".
    * Field: Bangsal (dropdown, mandatory); Ruangan/Kamar (dropdown cascading dari Bangsal, mandatory); Nomor Bed (input, mandatory); Ketersediaan (dropdown, mandatory); **Jenis Kelamin** (dropdown Laki-laki/Perempuan/Belum Ditentukan — PENAMBAHAN v2).
    * Tidak ada input status Aktif/Nonaktif di form create — status selalu diset **AKTIF** oleh sistem (lihat BR-2).
    * Tombol SIMPAN menyimpan ke database; tombol Kembali untuk batal.
    * *(Phase 2)* Setelah tersimpan, status indikator Satu Sehat = "Belum Terkirim" (NOT_SENT).
* **Acceptance Criteria**:
    * **AC 1**: Data tersimpan; field wajib (Bangsal, Kamar, Nomor Bed, Ketersediaan) tidak boleh kosong.
    * **AC 2**: Kombinasi Bangsal + Kamar + Nomor Bed unik tervalidasi (tidak boleh duplikat dalam satu kamar).
    * **AC 3**: Jenis Kelamin tersimpan sesuai pilihan (default Belum Ditentukan bila tidak dipilih).
    * **AC 4**: Status bed = AKTIF — tanpa input manual. *(Kolom `satusehat_status` default NOT_SENT disiapkan namun baru dipakai di **Phase 2**.)*
* **Validasi — A. Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Bangsal | Dropdown | Required | "Bangsal wajib dipilih." | "Pilih bangsal induk bed" |
  | Ruangan/Kamar | Dropdown (cascading) | Required | "Ruangan wajib dipilih." | "Pilih kamar dalam bangsal terpilih" |
  | Nomor Bed | Text | Required, min 1, max 20, unik per kamar | "Nomor bed wajib diisi." / "Nomor bed sudah digunakan di kamar ini. Gunakan nomor lain." | "Contoh: Bed 1" |
  | Ketersediaan | Dropdown | Required | "Status ketersediaan wajib dipilih." | "Pilih kondisi awal bed" |
  | Jenis Kelamin | Dropdown | Optional, default Belum Ditentukan | — | "Peruntukan gender bed untuk pencocokan alokasi" |

**Fitur: Ubah Data Bed**
* **User Story**: Sebagai Admin Master Data, saya ingin mengubah detail bed, agar data tetap update.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Detail**:
    * Klik Edit di Dashboard membuka form edit Bed; menampilkan semua data yang telah diinput.
    * Field yang dapat diubah: Bangsal, Ruangan/Kamar, Nomor Bed, Jenis Kelamin, Ketersediaan.
    * *(Phase 2)* Jika bed sudah `SUCCESS` dan field relevan (Nomor Bed, Kamar/`partOf`, status, ketersediaan) berubah → status menjadi `NEEDS_UPDATE`.
    * Field Nomor (sistem/`sequence_no`) tidak dapat diubah.
    * Tombol Update menyimpan; Kembali untuk batal.
* **Acceptance Criteria**:
    * **AC 1**: Perubahan tersimpan.
    * **AC 2** *(Phase 2)*: Status Satu Sehat otomatis menjadi NEEDS_UPDATE jika field relevan berubah pasca-pengiriman.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Nomor (sistem) | Number (read-only) | Auto-generate, tidak dapat diubah | "Nomor bed sistem tidak dapat diubah." | — |
  | *(field lain)* | — | Mengikuti aturan validasi Tambah Bed | — | — |

**Fitur: Kelola Ketersediaan Bed**
* **User Story**: Sebagai Admin Master Data, saya ingin mengubah status ketersediaan bed, agar kondisi bed tercermin akurat.
* **Prioritas**: P0
* **Fase**: Phase 1 (manual) · Phase 2 (auto dari modul Pelayanan)
* **Detail**:
    * Status Ketersediaan: Tersedia, Ditempati, Dibersihkan, Rusak.
    * *(Phase 2)* Perubahan dipetakan ke FHIR `operationalStatus` (lihat §8.3.3).
    * *(Phase 2)* Jika bed sudah terkirim, perubahan ketersediaan memicu `NEEDS_UPDATE` untuk resend.
    * *(Phase 2)* Diperbarui otomatis oleh modul Pelayanan (Ditempati saat admisi, Tersedia saat pulang, Dibersihkan saat housekeeping).
* **Acceptance Criteria**:
    * **AC 1**: Ketersediaan bed dapat diubah manual.
    * **AC 2** *(Phase 2)*: Perubahan memetakan `operationalStatus` dan memicu NEEDS_UPDATE bila sudah terkirim.

**Fitur: Kelola Status Bed (Aktif/Nonaktif)**
* **User Story**: Sebagai Admin Master Data, saya ingin menonaktifkan/mengaktifkan bed, agar bed yang tidak dipakai tidak muncul di transaksi tanpa merusak history.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Detail**:
    * Switch Aktif/Nonaktif tersedia di Detail Bed dan Dashboard (per baris) — bukan di form create.
    * Bed nonaktif tidak muncul di modul alokasi/transaksional.
    * *(Phase 2)* Jika bed nonaktif & sudah terkirim, status Location diperbarui menjadi `inactive` pada pengiriman berikutnya.
    * Menonaktifkan bed **tidak mempengaruhi** history data riwayat pasien yang sudah memakai bed tersebut.
* **Acceptance Criteria**:
    * **AC 1**: Status bed dapat diubah aktif/nonaktif.
    * **AC 2**: Bed nonaktif tidak muncul di modul transaksional.
    * **AC 3**: Bed yang dinonaktifkan tidak menghilang/rusak pada history pasien & history sistem.

**Fitur: Integrasi Satu Sehat — Kirim**
* **User Story**: Sebagai Admin Master Data, saya ingin memicu pengiriman data bed ke Satu Sehat secara mandiri tanpa intervensi tim Backend.
* **Prioritas**: P0
* **Fase**: **Phase 2**
* **Detail**:
    * Tombol "Kirim ke Satu Sehat" tersedia di Dashboard (per baris) dan Detail Bed. Aktif ketika status = NOT_SENT atau FAILED.
    * Validasi prerequisites: field mandatory terisi; Kamar induk sudah punya Location ID Satu Sehat; RS punya Organization IHS Number (Master Sarana Index).
    * Validasi gagal → tampilkan pesan error spesifik dan batalkan pengiriman (status tetap NOT_SENT).
    * Valid → status SENDING, POST ke FHIR Location (`physicalType=bd`, `partOf=Location Kamar`, `operationalStatus` dari Ketersediaan).
    * Berhasil → simpan Location ID + SUCCESS + timestamp. Gagal → simpan pesan error + FAILED + tombol Kirim Ulang aktif.
* **Acceptance Criteria**:
    * **AC 1**: User dapat memicu pengiriman secara mandiri.
    * **AC 2**: Status terupdate sesuai response Satu Sehat (SENDING → SUCCESS/FAILED).
    * **AC 3**: Location ID tersimpan setelah berhasil.
    * **AC 4**: Pesan error tampil jelas jika gagal.
* **Validasi — A. Wording Validasi (Frontend)**:

  | Field / Aksi | Tipe Input | Rules | Error Message | Helper Text |
  |--------------|------------|-------|---------------|-------------|
  | Kirim ke Satu Sehat | Aksi | Kamar induk harus punya Location ID | "Kamar induk belum terdaftar di Satu Sehat. Mohon kirim data Kamar terlebih dahulu." | — |
  | Kirim ke Satu Sehat | Aksi | RS harus punya IHS Number | "Rumah Sakit belum terdaftar di Master Sarana Index Satu Sehat. Hubungi admin sistem." | — |
  | Kirim ke Satu Sehat | Aksi | API timeout/error | "Pengiriman ke Satu Sehat gagal: [pesan error dari API]. Silakan coba kirim ulang." | — |

**Fitur: Resend / Kirim Ulang ke Satu Sehat**
* **User Story**: Sebagai Admin Master Data, saya ingin memicu pengiriman ulang ketika data bed berubah atau pengiriman sebelumnya gagal.
* **Prioritas**: P0
* **Fase**: **Phase 2**
* **Detail**:
    * Tombol "Kirim Ulang" aktif ketika status = NEEDS_UPDATE atau FAILED.
    * NEEDS_UPDATE → **PUT** ke FHIR Location menggunakan Location ID tersimpan.
    * FAILED → **POST** ulang (belum pernah berhasil).
    * Trigger resend selalu manual oleh user. Setelah berhasil → SUCCESS dengan timestamp terbaru.
* **Acceptance Criteria**:
    * **AC 1**: Resend dapat dilakukan user.
    * **AC 2**: PUT untuk update (NEEDS_UPDATE), POST untuk gagal sebelumnya (FAILED).
    * **AC 3**: Status terupdate setelah response.

**Fitur: Indikator Satu Sehat**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat status pengiriman setiap bed ke Satu Sehat dengan jelas, agar tahu data mana yang perlu tindakan.
* **Prioritas**: P0
* **Fase**: **Phase 2**
* **Detail**:
    * Badge 5-state di Dashboard & Detail Bed: Belum Terkirim (abu), Sedang Dikirim (kuning), Berhasil Terkirim (hijau + timestamp & Location ID), Gagal (merah + pesan error & tombol Kirim Ulang), Perlu Update (oranye).
    * Tooltip badge menampilkan detail (timestamp terakhir, Location ID, pesan error).
    * Detail Bed menampilkan history singkat (tanggal pengiriman pertama berhasil, update terakhir).
* **Acceptance Criteria**:
    * **AC 1**: Status indikator tampil konsisten & informatif di seluruh entry point (Dashboard & Detail).

**Fitur: Lihat Detail Bed**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat detail data bed beserta riwayat pengiriman Satu Sehat-nya.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Detail**:
    * Menampilkan seluruh field bed (Bangsal, Kamar, Nomor Bed, Jenis Kelamin, Ketersediaan, Status Aktif). *(Status & info Satu Sehat = **Phase 2**.)*
    * *(Phase 2)* Menampilkan informasi pengiriman: Location ID (jika ada), tanggal pengiriman terakhir, jenis aksi terakhir (POST/PUT).
* **Acceptance Criteria**:
    * **AC 1**: Detail tampil lengkap & akurat.
    * **AC 2** *(Phase 2)*: Informasi pengiriman Satu Sehat ditampilkan.

**Fitur: Filter**
* **User Story**: Sebagai Admin Master Data, saya ingin memfilter bed untuk identifikasi cepat.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Detail**:
    * Filter Bangsal (dropdown); Ketersediaan (Tersedia/Ditempati/Dibersihkan/Rusak); Jenis Kelamin (Laki-laki/Perempuan/Belum Ditentukan). *(Filter **Status Satu Sehat** (Belum Terkirim/Berhasil/Gagal/Perlu Update) = **Phase 2**.)*
* **Acceptance Criteria**:
    * **AC 1**: Hasil tampil sesuai filter yang aktif (dapat dikombinasikan).

**Fitur: History Data Bed**
* **User Story**: Sebagai System, saya ingin tetap menampilkan & memberikan akses data pasien yang memiliki data bed.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Detail**:
    * Data Master Bed tidak hilang/rusak/tidak bisa dibuka ketika bed dinonaktifkan pada history pasien.
    * Pasien **selesai pelayanan** → perubahan Master Bed **tidak** meng-update history (snapshot data lama dipertahankan). Pasien **masih dalam pelayanan** → data Master Bed terupdate sesuai perubahan.
* **Acceptance Criteria**:
    * **AC 1**: History data Master Bed tidak hilang ataupun rusak.
    * **AC 2**: Perubahan master tidak mengubah snapshot history pasien yang sudah selesai pelayanan.

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

* **Table Name**: `beds`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `sequence_no`: BigInt (auto-increment, read-only nomor sistem)
    * `bangsal_id`: UUID (FK → `units.id` -> Unit yang instalasinya bangsal)
    * `kamar_id`: UUID (FK → `rooms.id` -> master Data Kamar)
    * `bed_number`: Varchar(20) — Nomor Bed
    * `gender`: Enum(`L`, `P`, `BELUM_DITENTUKAN`) default `BELUM_DITENTUKAN`
    * `availability`: Enum(`TERSEDIA`, `DITEMPATI`, `DIBERSIHKAN`, `RUSAK`) default `TERSEDIA`
    * `keterangan`: Text (nullable)
    * `is_active`: Boolean (default `true`)
    * `satusehat_status`: Enum(`NOT_SENT`, `SENDING`, `SUCCESS`, `FAILED`, `NEEDS_UPDATE`) default `NOT_SENT`
    * `satusehat_location_id`: Varchar (UUID dari Satu Sehat, nullable) — dipakai untuk PUT saat resend
    * `satusehat_last_sent_at`: Timestamp (nullable)
    * `satusehat_first_success_at`: Timestamp (nullable) — untuk audit, tidak berubah saat resend
    * `satusehat_last_error`: Text (nullable)
    * `satusehat_last_action`: Enum(`POST`, `PUT`, nullable)
    * `created_by`: UUID (FK → `staff.id`)
    * `created_at`, `updated_at`: Timestamp
    * `deleted_at`: Timestamp (nullable, soft delete)
    * *(Phase 2-ready, belum diaktifkan)* `approval_status`: Enum (nullable) · `approver_role`: Varchar (nullable)
* **Constraints**:
    * `UNIQUE(kamar_id, bed_number) WHERE deleted_at IS NULL` — keunikan nomor bed per kamar.
    * *(Phase 2-ready)*: kolom `satusehat_status`, `satusehat_location_id`, dan enum ketersediaan sudah mengakomodasi auto-sync tanpa perubahan skema. Kolom `approval_status`/`approver_role` disiapkan untuk approval berjenjang Phase 2 (belum diaktifkan di Phase 1). `[ASUMSI]`

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/beds` | List bed (support filter: `bangsal_id`, `availability`, `gender`, `satusehat_status`, `search`, `sort`, `page`, `per_page`) |
| GET | `/api/v1/beds/{id}` | Detail bed + info pengiriman Satu Sehat |
| POST | `/api/v1/beds` | Create bed baru (status = AKTIF, Satu Sehat awal = NOT_SENT) |
| PUT | `/api/v1/beds/{id}` | Update data bed (trigger NEEDS_UPDATE bila field relevan berubah pasca-SUCCESS) |
| PATCH | `/api/v1/beds/{id}/availability` | Kelola ketersediaan bed |
| PATCH | `/api/v1/beds/{id}/status` | Toggle Aktif/Nonaktif |
| POST | `/api/v1/beds/{id}/satusehat/send` | **(Phase 2)** Kirim ke Satu Sehat (POST FHIR Location; validasi prerequisites) |
| POST | `/api/v1/beds/{id}/satusehat/resend` | **(Phase 2)** Kirim Ulang (PUT jika NEEDS_UPDATE, POST jika FAILED) |
| GET | `/api/v1/wards` | Dropdown bangsal aktif (cascading source) |
| GET | `/api/v1/rooms?bangsal_id={id}` | Dropdown kamar aktif per bangsal (cascading) |

### 8.3 Data & Business Rules

> **Sumber**: Sub-bagian §8.3.1–§8.3.6 di bawah diselaraskan penuh dengan bagian **Data Requirement (A–F)**, **Validasi**, dan **Case (Edge Case & Mitigasi)** pada dokumen sumber `PRD_MASTER_DATA_BED.docx`.

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT) — *(docx: Data Requirement B & F)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| bangsal_id | Bangsal | Single Dropdown | Ya (editable) | Required; hanya bangsal aktif | Master Data Unit (A15) -> Unit yang Instalasinya Bangsal | Contoh: Bangsal Melati |
| kamar_id | Ruangan / Kamar | Single Dropdown (cascading dari Bangsal) | Ya (editable) | Required; hanya kamar aktif; Kamar harus punya Location ID Satu Sehat sebelum bed dapat dikirim | Master Data Kamar (A16) | Dikirim sebagai `partOf` (reference Location ID Kamar). Contoh: Kamar 101A |
| bed_number | Nomor Bed | Text Input | Ya (editable) | min 1 char, max 20 char; UNIQUE per kamar (`UNIQUE(kamar_id, bed_number) WHERE deleted_at IS NULL`) | Input manual | Dikirim sebagai `identifier.value` & `name`. Contoh: Bed 1 |
| gender | Jenis Kelamin | Single Dropdown (Laki-laki / Perempuan / Belum Ditentukan) | Optional (editable) — default `BELUM_DITENTUKAN` | Enum `L`, `P`, `BELUM_DITENTUKAN` | Input manual | **Field LOKAL SIMRS** untuk pencocokan gender bed dengan pasien saat alokasi. FHIR R4 Location tak punya field gender standar → pengiriman `[PERLU KONFIRMASI]` SA. Contoh: Laki-laki |
| availability | Ketersediaan (Availability) | Single Dropdown | Ya (editable) | Enum (docx form): `TERSEDIA`, `DITEMPATI`, `DIBERSIHKAN`, `BELUM_DITENTUKAN` | Input manual | Dipetakan ke `Location.operationalStatus` (§8.3.3). Contoh: Tersedia. **`[PERLU KONFIRMASI]`**: nilai form (docx bagian B) memuat `BELUM_DITENTUKAN`, sedangkan Dashboard/Kelola (docx bagian A & F) memuat `RUSAK` — perlu penyatuan enum final |
| sequence_no | Nomor | Number Input (Read-only) | Ya | Auto-generate (tidak dapat diubah) | Sistem (sequence increment) | Contoh: 1024 |
| is_active | Status Aktif | Switch (Aktif / Nonaktif) | Ya — default `Aktif` | — | Input manual via Detail Bed / Dashboard (**bukan** di form create; lihat BR-2) | Bed nonaktif tak muncul di modul alokasi/transaksional. *(Phase 2: Aktif → `active`, Nonaktif → `inactive` ke Satu Sehat pada resend berikutnya.)* |
| keterangan | Keterangan | Text | Tidak | maks 255 char `[ASUMSI]` | Input manual | Catatan bebas |

> **Catatan status behavior**: Tidak ada input Status Aktif/Nonaktif di form **create** — status selalu diset **AKTIF** oleh sistem; pengelolaan aktif/nonaktif dilakukan di level Dashboard/Detail (toggle). Lihat BR-2.
>
> **Catatan Ubah Data Bed** *(docx: Data Requirement E)*: form edit menampilkan semua data yang telah diinput. *(Phase 2)* Perubahan pada field yang dikirim ke Satu Sehat (Nomor Bed, Kamar/`partOf`, status, `operationalStatus`/Ketersediaan) mengubah `satusehat_status` → `NEEDS_UPDATE` bila sebelumnya `SUCCESS`.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View / Dashboard) — *(docx: Data Requirement A)*

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Bangsal | Master Data Unit (A3) | Teks read-only | Filter dropdown; Sort default A-Z | Read-only di dashboard; diatur via form Tambah/Ubah. Contoh: Bangsal ICU |
| Nomor Kamar | Master Data Kamar (A16) | Teks read-only | Sort | Read-only di dashboard. Contoh: 101A |
| Nomor Bed | Detail Bed | Teks read-only | Sort | Read-only di dashboard. Contoh: Bed 1 |
| Jenis Kelamin | Detail Bed | Badge/teks (read-only) | Filter (L / P / Belum Ditentukan) | Enum `L`, `P` (docx dashboard: default `L`). Contoh: Laki-laki |
| Ketersediaan | Detail Bed | Badge warna (hijau/merah/kuning/abu) | Filter; Editable via aksi Kelola Ketersediaan | Enum `TERSEDIA`, `DITEMPATI`, `DIBERSIHKAN`, `RUSAK`. Contoh: Tersedia |
| Status Satu Sehat *(Phase 2)* | Sistem (response API & event pengiriman) | Badge 5-state + tooltip | Filter | **Phase 2**. Enum `NOT_SENT`, `SENDING`, `SUCCESS`, `FAILED`, `NEEDS_UPDATE` (abu/kuning/hijau/merah/oranye). Read-only (auto). Tooltip: timestamp, Location ID, pesan error. Contoh: Berhasil Terkirim (tooltip: 12/06/2026 14:30 — Location ID: a1b2c3d4-…) |
| Action | Kontekstual per status bed | Button group | — | Phase 1: [Tambah Bed] [Detail] [Edit] [Aktif/Nonaktif]. **Phase 2**: tambah [Kirim/Kirim Ulang Satu Sehat] |

#### 8.3.3 Mapping ke Satu Sehat — FHIR Location (`physicalType = bd`) — *Phase 2* — *(docx: Data Requirement C)*

| Element FHIR | Nilai / Sumber |
|--------------|----------------|
| `identifier.use` | Static `'official'` |
| `identifier.system` | `http://sys-ids.kemkes.go.id/location/{organization-ihs-number}` (auto dari IHS Number RS / Master Sarana Index) |
| `identifier.value` | Dari Nomor Bed (atau kode bed unik) |
| `status` | Dari Status Aktif/Nonaktif: Aktif → `'active'`, Nonaktif → `'inactive'` |
| `name` | Dari Nomor Bed (mis. 'Bed 1', atau gabungan Kamar-Bed sesuai konvensi RS) |
| `mode` | Static `'instance'` (bed adalah lokasi spesifik) |
| `physicalType.coding` | code `'bd'`, display `'Bed'`, system `http://terminology.hl7.org/CodeSystem/location-physical-type` |
| `operationalStatus` | Dari Ketersediaan → kode HL7 (`system: http://terminology.hl7.org/CodeSystem/v2-0116`): Tersedia → `'U'` (Unoccupied), Ditempati → `'O'` (Occupied), Dibersihkan → `'H'` (Housekeeping), Belum Ditentukan → `'U'` (Unoccupied). **`[PERLU KONFIRMASI]`** kode final untuk `Rusak` (usulan `'C'`/Closed atau `'K'`/Contaminated) & system URI final SA |
| `partOf` | `Location/{id-Location-Kamar}` (auto dari Kamar; Kamar harus sudah terkirim lebih dulu) |
| `managingOrganization` | `Organization/{organization-ihs-number}` (auto dari Master Sarana Index) |
| Jenis Kelamin (catatan) | FHIR R4 Location **tidak punya** elemen gender standar. Opsi: tidak dikirim di v1 (field lokal) atau via `Location.extension` khusus — **`[PERLU KONFIRMASI]`** SA & profil Satu Sehat |

#### 8.3.4 Field Status Pengiriman Satu Sehat — *Phase 2* — *(docx: Data Requirement D)*

> Kolom-kolom di bawah disiapkan pada skema sejak Phase 1 (agar Phase 2 tanpa migrasi), namun **baru diisi/dipakai pada Phase 2** saat integrasi Satu Sehat aktif.

| Field | Tipe | Keterangan |
|-------|------|------------|
| `satusehat_status` | Enum | `NOT_SENT` (Belum Terkirim, default), `SENDING` (Sedang Dikirim), `SUCCESS` (Berhasil), `FAILED` (Gagal), `NEEDS_UPDATE` (Perlu Update). Auto-generated dari response & event perubahan data |
| `satusehat_location_id` | String (UUID) | Location ID dari Satu Sehat; disimpan setelah pengiriman pertama berhasil; dipakai untuk PUT saat resend; `null` bila belum pernah berhasil |
| `satusehat_last_sent_at` | Timestamp | Waktu pengiriman terakhir (berhasil/gagal). Format `DD/MM/YYYY HH:MM` |
| `satusehat_last_error` | String (nullable) | Pesan error dari Satu Sehat jika `FAILED`; `null` bila terakhir `SUCCESS` |
| `satusehat_first_success_at` | Timestamp (nullable) | Waktu pengiriman pertama berhasil; tidak berubah saat resend; untuk audit |

#### 8.3.5 Business Rules

* **BR-1 (Keunikan)**: Kombinasi Bangsal + Kamar + Nomor Bed harus unik; `UNIQUE(kamar_id, bed_number) WHERE deleted_at IS NULL`.
* **BR-2 (Status default)**: Status bed selalu diset `AKTIF` oleh sistem saat create; tidak ada input status di form create. Pengelolaan aktif/nonaktif via toggle Dashboard/Detail.
* **BR-3 (Dependency chain Satu Sehat)** *(Phase 2)*: Instalasi → Bangsal → Kamar → Bed. Bed hanya dapat dikirim bila Kamar induk sudah punya Location ID & RS punya Organization IHS Number.
* **BR-4 (Trigger NEEDS_UPDATE)** *(Phase 2)*: Perubahan field yang dikirim ke Satu Sehat (Nomor Bed, Kamar/`partOf`, status, Ketersediaan/`operationalStatus`) mengubah `satusehat_status` → `NEEDS_UPDATE` bila sebelumnya `SUCCESS`.
* **BR-5 (POST vs PUT)** *(Phase 2)*: `FAILED` (belum pernah sukses) → POST ulang; `NEEDS_UPDATE` (sudah punya Location ID) → PUT (idempoten).
* **BR-6 (Resend manual)** *(Phase 2)*: Sistem menyimpan hanya state terbaru (snapshot) — bila data diubah berkali-kali sebelum resend, hanya data terakhir yang dikirim; tidak ada history per-perubahan di Phase 2 awal.
* **BR-7 (History integrity)**: Nonaktif/ubah Master Bed tidak merusak history pasien. Pasien selesai pelayanan → snapshot lama dipertahankan; pasien masih dalam pelayanan → ikut perubahan.
* **BR-8 (Gender scope)**: Master Bed hanya menyediakan atribut Jenis Kelamin; pencocokan & pencegahan salah gender dilakukan modul Pendaftaran Rawat Inap (di luar scope master).

#### 8.3.6 Edge Cases & Mitigasi — *(docx: Case)*

> Case yang menyangkut pengiriman Satu Sehat (No. 1–5, 7) berlaku pada **Phase 2**; Case No. 6 (matching gender) relevan sejak **Phase 1**.

| No | Case | Dampak | Mitigasi |
|----|------|--------|----------|
| 1 *(Phase 2)* | Bed dibuat tetapi Kamar induk belum dikirim ke Satu Sehat | Tombol Kirim menolak request; bed tidak bisa dikirim | Pesan error eksplisit + CTA ke halaman Master Kamar agar user kirim Kamar dulu |
| 2 *(Phase 2)* | Ketersediaan/data bed diubah berkali-kali sebelum resend | Status tetap `NEEDS_UPDATE`; hanya data terbaru dikirim saat Kirim Ulang | Simpan state terbaru (snapshot); tanpa history per-perubahan di Phase 2 awal |
| 3 *(Phase 2)* | Response Satu Sehat lambat (timeout) | Status tersangkut `SENDING`; user bingung | Timeout API maks 30 detik → `FAILED` dengan pesan "Timeout — coba kirim ulang" |
| 4 *(Phase 2)* | Bed sudah terkirim lalu dinonaktifkan | Status di Satu Sehat masih `active` padahal di SIMRS `inactive` | Perubahan status memicu `NEEDS_UPDATE`; user diingatkan Kirim Ulang via badge |
| 5 *(Phase 2)* | Token autentikasi Satu Sehat expired saat kirim | API return 401 Unauthorized | Refresh token via OAuth client credentials + retry sekali; gagal → `FAILED` "Otentikasi Satu Sehat gagal. Hubungi admin sistem." |
| 6 | Jenis Kelamin bed ≠ jenis kelamin pasien saat alokasi | Potensi salah penempatan gender dalam kamar | Master Bed hanya sediakan atribut; pencocokan & pencegahan di modul Pendaftaran Rawat Inap (di luar scope master) |
| 7 *(Phase 2)* | Ketersediaan 'Belum Ditentukan' saat kirim ke Satu Sehat | `operationalStatus` tidak jelas | Default tidak kirim `operationalStatus` atau kirim `'U'` — **`[PERLU KONFIRMASI]`** final SA |

* **Business Rules ringkas**: keunikan Nomor Bed per Kamar (BR-1); status default AKTIF (BR-2); dependency chain Instalasi→Bangsal→Kamar→Bed (BR-3); POST untuk kirim pertama/gagal & PUT untuk update/resend (BR-5, idempoten); resend selalu manual (BR-6); integritas history pasien terjaga (BR-7).

---

## 9. Workflow / BPMN Interpretation

> Modul ini **belum punya BPMN sendiri**. Alur di bawah diturunkan dari dokumen sumber (docx) + pola integrasi Satu Sehat pada modul sejenis (Staff A2 / Unit A3) dan aktivitas *Update Bed Status* pada `g-admisi-inpatient-registration`. Bagian turunan ditandai `[ASUMSI]`.

**Alur Utama Phase 1 — Tambah Bed (CRUD)**:

1. **Admin Master Data** membuka menu Master Data → Bed → klik **Tambah**.
2. Isi form: Bangsal → Kamar (cascading) → Nomor Bed → Jenis Kelamin → Ketersediaan → **SIMPAN**.
3. Sistem validasi field mandatory + keunikan (Bangsal+Kamar+Nomor Bed). Valid → simpan; status bed = AKTIF, siap dipakai alokasi Pendaftaran RI. *(Kolom status Satu Sehat tersimpan = **NOT_SENT** untuk dipakai Phase 2.)*

**Alur Utama Phase 2 — Kirim Bed ke Satu Sehat**:

4. Admin klik **Kirim ke Satu Sehat**. Sistem cek prerequisites:
    * Field mandatory terisi? Kamar induk punya Location ID? RS punya IHS Number?
    * Gagal → tampilkan pesan error spesifik, batalkan (status tetap NOT_SENT).
5. Valid → status **SENDING** → **POST** FHIR Location (`physicalType=bd`, `partOf=Location Kamar`, `operationalStatus` dari Ketersediaan, `managingOrganization` dari IHS).
6. Response:
    * **Berhasil** → simpan Location ID, `satusehat_first_success_at`, timestamp → status **SUCCESS** (badge hijau).
    * **Gagal** → simpan pesan error → status **FAILED** (badge merah), tombol Kirim Ulang aktif.
7. **Perubahan data bed** pasca-SUCCESS (Nomor Bed / Kamar / status / Ketersediaan) → status **NEEDS_UPDATE** (badge oranye).
8. Admin klik **Kirim Ulang**:
    * NEEDS_UPDATE → **PUT** ke Location ID tersimpan.
    * FAILED → **POST** ulang.
    * Berhasil → kembali **SUCCESS** dengan timestamp terbaru.

**Dependency rantai pengiriman**: Instalasi → Bangsal → Kamar → **Bed**. Master Kamar wajib sudah memiliki kapabilitas kirim Satu Sehat & Location ID sebelum Bed dapat dikirim.

---

### Catatan untuk SA & Tim Engineering (Informasi Lain)

* Mapping Ketersediaan → FHIR `Location.operationalStatus` (§8.3.3) **`[PERLU KONFIRMASI]`** final SA — termasuk kode untuk `Rusak`.
* Penyatuan enum **Ketersediaan**: docx form (B) memuat `BELUM_DITENTUKAN`, sedangkan Dashboard (A) & Kelola (F) memuat `RUSAK`. **`[PERLU KONFIRMASI]`** himpunan nilai final.
* Field **Jenis Kelamin** bed = field LOKAL untuk pencocokan alokasi gender; FHIR R4 Location tak punya field gender standar → pengiriman (tidak dikirim / via extension) **`[PERLU KONFIRMASI]`** SA & profil Satu Sehat.
* Dependency utama: pastikan **Master Data Kamar (A16)** sudah punya kapabilitas kirim Satu Sehat & Location ID sebelum implementasi pengiriman Bed.
* **Phase 2 roadmap**: auto-update Ketersediaan dari modul Pelayanan/Pendaftaran; auto-sync Satu Sehat (background job, tanpa user trigger); bulk send; riwayat aktivitas pengiriman lengkap; integrasi SIRANAP & BPJS Aplicares; kesiapan approval berjenjang (kolom `approval_status`/`approver_role`).
* **Kelas Perawatan** (VIP/Kelas 1/2/3/VVIP) diisi pada level **Kamar** (`Location.extension.serviceClass`), bukan pada Bed.
