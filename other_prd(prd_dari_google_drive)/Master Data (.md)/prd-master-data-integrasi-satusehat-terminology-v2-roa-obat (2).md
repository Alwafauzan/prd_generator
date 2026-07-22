# PRD — Master Data / Integrasi SATUSEHAT Terminology V2 — ROA Obat

**Related Document:** Design Figma — **belum tersedia/belum dibuat** (dikonfirmasi, lihat open_questions); PRD Master Data - Sediaan (A21); PRD Master Data Barang Farmasi (A4); List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A40); Referensi terminologi Phase 2: WHO ATC route codes (http://www.whocc.no/atc), FHIR R4 Dosage.route (MedicationRequest/MedicationAdministration)
**Versi:** 1.2 - Pendalaman mapping terminologi Phase 2 (sistem ATC http://www.whocc.no/atc, FHIR RouteAdministration/Dosage.route; target URI SATUSEHAT masih ditetapkan Phase 2; konfirmasi Design Figma belum dibuat)

## 1. Overview / Brief Summary

Modul **Master Data Rute Pemberian Obat (Route of Administration / ROA)** berfungsi sebagai **master rujukan (reference master)** terpusat untuk mengelola daftar rute pemberian obat secara terstandarisasi pada SIMRS V2 (target RS Tipe C & D).

Daftar ROA dipakai sebagai sumber pilihan tunggal (*single source of truth*) pada proses **input Master Data Barang Farmasi (A4)**, **e-Resep, order obat (CPO), pelayanan farmasi, EMR, dan dokumentasi pemberian obat**. Dengan master terpusat ini, seluruh modul menggunakan referensi rute yang sama sehingga penulisan menjadi konsisten dan tidak lagi bergantung pada input bebas tiap pengguna.

Pada **Phase 1**, modul berfokus pada fungsi **CRUD (Create, Read, Update, Delete)** dengan atribut utama: **Nama Rute (wajib, unik)**, **Kode Rute (opsional, boleh duplikat)**, dan **Deskripsi (opsional)**.

Karakteristik penting Phase 1:
- **Tidak menggunakan konsep status Aktif/Tidak Aktif.** Modul ini **sengaja** memakai `is_deleted` (soft delete) sebagai satu-satunya penanda data hidup/mati — berbeda dari pola master lain (mis. Sediaan A21) yang memakai field kanonik `status_aktif`. (Dikonfirmasi — lihat BR-007.)
- Penghapusan memakai **soft delete** (`is_deleted = true`): data hilang dari UI & pilihan transaksi baru, tetapi tetap tersimpan di database.
- **Kode Rute boleh duplikat**; yang dijaga unik hanya **Nama Rute**. (Dikonfirmasi — kode `inj.intravenous` boleh dipakai bersama oleh "Intravena" dan "Infus".)
- Sistem **belum membedakan jenis terminologi** kode (ATC, SNOMED CT, SATUSEHAT, KFA) pada phase ini.
- **Import/Export massal tidak termasuk Phase 1** (roadmap phase berikutnya).

Label fitur menyebut *Integrasi SATUSEHAT Terminology V2*, namun pada Phase 1 mapping terminologi resmi **belum diimplementasikan** dan menjadi roadmap phase berikutnya. Untuk Phase 2, target mapping sudah mulai diidentifikasi: **sistem kode ATC** (`http://www.whocc.no/atc`) untuk kode rute administrasi WHO, dan representasi interoperabilitas mengikuti **FHIR R4 `Dosage.route`** (elemen route pada MedicationRequest/MedicationAdministration) yang dipakai SATUSEHAT. Target **system/URI terminologi resmi SATUSEHAT untuk Route of Administration masih akan ditetapkan pada Phase 2** (lihat Out Scope & §13).

## 2. Background

Pada kondisi eksisting (As-Is), rute pemberian obat berpotensi diinput **tidak konsisten** karena:

- Perbedaan istilah, singkatan, dan format penulisan antar pengguna/antar RS (mis. "IV" vs "Intravena" vs "inj.intravenous").
- Tidak ada satu daftar rute terpusat yang dapat dirujuk oleh modul Master Data Barang Farmasi (A4), e-Resep, CPO, farmasi, dan EMR.
- Pilihan rute kemungkinan **tertanam (hardcoded)** atau bebas-teks pada form transaksi, sehingga setiap perubahan memerlukan keterlibatan tim teknis. [ASUMSI — diturunkan dari pola masalah pada PRD Master Data Sediaan/A21 yang dilampirkan]

Dampak: data rute tidak terstandarisasi menyulitkan pelaporan, validasi klinis, serta interoperabilitas (mis. ke SATUSEHAT) di masa depan.

Modul ini dikembangkan untuk menjadi **sumber kebenaran tunggal** daftar ROA yang dirujuk seluruh modul terkait (mulai dari penetapan rute pada Master Data Barang Farmasi hingga peresepan), sejalan dengan pendekatan yang sudah dipakai pada Master Data Sediaan (A21) dan Barang Farmasi (A4). Untuk RS Tipe C & D yang SDM IT-nya terbatas, master ini juga memungkinkan **user Admin/Farmasi** menambah/mengubah rute tanpa pengembangan ulang sistem.

Secara strategis, struktur Kode Rute pada Phase 1 sengaja dijaga fleksibel agar di Phase 2 dapat dipetakan ke **terminologi standar** (ATC route, FHIR `Dosage.route`, terminologi SATUSEHAT) tanpa migrasi besar — fondasi interoperabilitas SATUSEHAT (lihat §13).

## 3. In Scope

### Scope Definition (Phase 1 — MVP)
| No | Scope/Area | Phase |
|----|------------|-------|
| 1 | Dashboard / List Master Data ROA (tabel, pencarian, sorting, pagination) | Phase 1 |
| 2 | Tambah Data ROA (Nama Rute, Kode Rute opsional, Deskripsi opsional) | Phase 1 |
| 3 | Update Data ROA | Phase 1 |
| 4 | Hapus Data ROA via **soft delete** (`is_deleted = true`) dengan proteksi data yang sudah pernah terpakai | Phase 1 |
| 5 | Penyediaan daftar ROA sebagai rujukan untuk **Master Data Barang Farmasi (A4)**, e-Resep, order obat (CPO), pelayanan farmasi, EMR, dokumentasi pemberian obat | Phase 1 |
| 6 | Seeding **daftar ROA default sistem** (14 baris pada lampiran draft) | Phase 1 |
| 7 | Audit trail perubahan data (tambah/ubah/hapus) | Phase 1 [ASUMSI — selaras pola A21] |

### Out Scope
| No | Scope | Keterangan |
|----|-------|------------|
| 1 | Penetapan ROA ke masing-masing barang/resep | Dilakukan pada modul yang merujuk ROA (Master Data Barang Farmasi A4 / e-Resep / CPO), bukan di master ini |
| 2 | Pembedaan & mapping **jenis terminologi kode** (ATC Adm.R `http://www.whocc.no/atc`, SNOMED CT, SATUSEHAT, KFA, kode internal) | Phase 2 (dikonfirmasi). Target system/URI SATUSEHAT untuk ROA **masih ditetapkan di Phase 2** |
| 3 | **Push/integrasi aktif ke SATUSEHAT Terminology** (kirim/tarik kode resmi; pemetaan ke FHIR `Dosage.route`) | Phase berikutnya — Phase 1 hanya menyimpan kode bebas |
| 4 | Mapping ROA ↔ jenis sediaan (validasi klinis, rekomendasi rute, autofill peresepan) | Phase berikutnya |
| 5 | Konsep status **Aktif/Nonaktif** (`status_aktif`) | Tidak digunakan pada modul ini (memakai soft delete `is_deleted`) — dikonfirmasi |
| 6 | **Import/Export massal data ROA** | **Phase berikutnya (dikonfirmasi — tidak termasuk Phase 1)**. Field kanonik `file_import`/`mode_import` tidak dipakai di Phase 1. |

## 4. Goals and Metrics

### Goals
- Menyediakan daftar rute pemberian obat yang **terpusat dan terstandarisasi** sebagai rujukan Master Data Barang Farmasi (A4), e-Resep, CPO, farmasi, dan EMR.
- Memastikan **konsistensi** penamaan/penggunaan rute di seluruh modul.
- Mempermudah penambahan/perubahan rute **tanpa pengembangan ulang** sistem.
- Menjaga **integritas & histori data klinis** (data yang sudah pernah dipakai tidak boleh hilang).
- Menyiapkan fondasi untuk mapping terminologi (ATC/FHIR `Dosage.route`/SATUSEHAT/SNOMED/KFA) di phase berikutnya.

### Metrics
| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Konsistensi data rute | 0% duplikasi **Nama Rute** di data non-deleted (Kode Rute boleh duplikat — tidak dihitung) |
| 2 | Kemandirian user non-teknis | 100% user Admin/Farmasi mampu menambah ROA tanpa bantuan tim teknis |
| 3 | Rujukan oleh modul lain | 100% field rute pemberian pada Master Data Barang Farmasi/e-Resep/CPO/farmasi/EMR mengambil pilihan dari master ini |
| 4 | Performa pencarian | Waktu pencarian/filter data ROA < 3 detik |
| 5 | Integritas data klinis | 0% data ROA yang sudah pernah dipakai (`sudah_terpakai = true`) terhapus |
| 6 | Kesiapan mapping Phase 2 | 100% baris ROA memiliki `kode_rute` yang dapat ditelusuri/dipetakan ke ≥1 sistem terminologi target (ATC/SATUSEHAT) saat Phase 2 dimulai [ASUMSI — leading indicator Phase 2] |

## 5. Related Feature

Fitur terkait (cluster **Control Panel**, dari List Fitur sheet MVP) dan modul yang merujuk ROA:

| No | Code | Module / Menu | Hubungan dengan ROA |
|----|------|---------------|---------------------|
| 1 | A40 | Control Panel > Master Data / Integrasi SATUSEHAT Terminology V2 > **ROA Obat** | Modul ini |
| 2 | A4 | Master Data / Integrasi SATUSEHAT Terminology V2 > **Barang Farmasi** | **Merujuk langsung daftar ROA** — ROA dipanggil sebagai pilihan saat input/konfigurasi Master Data Barang Farmasi (dikonfirmasi) |
| 3 | A21 | Master Data / Integrasi SATUSEHAT Terminology V2 > **Sediaan Barang** | Pola master rujukan yang sama; roadmap mapping ROA ↔ Sediaan (Out Scope) |
| 4 | A24 | Master Data > **Aturan Pakai** | Aturan pakai biasanya berdampingan dengan rute pemberian pada e-Resep |
| 5 | A35 | Master Data > **Farmaco** | Terkait data obat |
| 6 | A36 | Master Data > **Grup Obat** | Terkait data obat |
| — | (transaksi) | **e-Resep**, **Order Obat / CPO** (lih. BPMN g-service-cpo-order, g-service-cpo-timing), **Pelayanan Farmasi / Apotek Online** (g-support-apotek-online-iter), **EMR** (g-emr-inpatient, g-emr-patient-identity) | Konsumen daftar ROA |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini)
1. Saat input data barang farmasi / resep / order obat, petugas menulis/memilih rute pemberian dari daftar statis atau bebas-teks. [ASUMSI]
2. Tidak ada standardisasi → muncul variasi istilah & singkatan untuk rute yang sama.
3. Perubahan daftar rute butuh tim teknis (hardcoded). [ASUMSI]
4. Sulit memetakan rute ke standar terminologi untuk pelaporan/interoperabilitas.

### B. To-Be (kondisi diharapkan)
**1. Pengelolaan Daftar ROA Terpusat**
- User Admin/Farmasi membuka menu *Control Panel > Master Data > ROA Obat*.
- User dapat menambah, mengubah, atau menghapus (soft delete) rute pemberian.
- Tiap rute punya atribut: **Nama Rute (unik)**, **Kode Rute (opsional, boleh duplikat)**, **Deskripsi (opsional)**.

**2. Rujukan pada Modul Lain**
- Pada Master Data Barang Farmasi (A4), e-Resep/CPO/farmasi/EMR, field rute pemberian menampilkan daftar ROA yang `is_deleted = false` dari modul ini.

**3. Validasi & Kontrol Data**
- Sistem mencegah **duplikasi Nama Rute** di antara data non-deleted. **Kode Rute tidak divalidasi unik** (boleh sama).
- Data ROA yang **sudah pernah dipakai** (`sudah_terpakai = true`) **tidak boleh dihapus** — sekali terpakai, langsung terkunci dari penghapusan.
- Data dengan `is_deleted = true` boleh dibuat ulang dengan nama yang sama.

**4. Audit Trail**
- Setiap perubahan (tambah/ubah/hapus) terekam: user, timestamp, aksi. [ASUMSI — pola audit dari A21 & BPMN "Log Audit: Siapa, Kapan" pada g-service-cpo-order/timing]

**5. Kesiapan Interoperabilitas (fondasi Phase 2)**
- Kode Rute disimpan apa adanya pada Phase 1, namun struktur dijaga agar Phase 2 dapat menambah pemetaan ke sistem terminologi (ATC `http://www.whocc.no/atc`, FHIR `Dosage.route`, SATUSEHAT) tanpa mengubah entitas inti.

### C. Flow (ringkas)
`[Admin/Farmasi]` → Akses Menu ROA Obat → Input/Edit Data (Nama unik, Kode opsional, Deskripsi opsional) → `[Sistem]` Validasi duplikasi Nama & simpan → Daftar ROA (non-deleted) tersedia sebagai pilihan rute pemberian di Master Data Barang Farmasi (A4)/e-Resep/CPO/Farmasi/EMR. Saat ROA pertama kali dipakai oleh salah satu modul → sistem menandai `sudah_terpakai = true` (terkunci dari penghapusan).

## 7. Main Flow / Mindmap

> Modul ini **belum punya BPMN sendiri**; alur berikut diturunkan dari pola master data (A21) dan BPMN order/pelayanan obat terkait. Bagian turunan ditandai [ASUMSI].

### Skenario 1 — Lihat & Cari Daftar ROA
1. User membuka *Control Panel > Master Data > ROA Obat*.
2. Sistem menampilkan tabel ROA `is_deleted = false` (default sort Nama Rute A→Z).
3. User mencari (Nama/Kode) / sorting / pagination.

### Skenario 2 — Tambah ROA
1. User klik tombol **+ Tambah**.
2. Sistem menampilkan form (overlay): Nama Rute, Kode Rute (opsional), Deskripsi (opsional).
3. User isi & **Simpan**.
4. **Gateway — Nama Rute duplikat (non-deleted)?**
   - **Ya** → tampilkan error, batal simpan.
   - **Tidak** → simpan (Kode Rute TIDAK dicek unik), catat audit, data langsung tersedia di modul yang merujuk.

### Skenario 3 — Update ROA
1. User pilih baris → **Edit**.
2. Ubah field → **Simpan** → validasi duplikasi **Nama Rute** → simpan + audit.
3. Perubahan Nama Rute tercermin pada referensi di modul yang merujuk ROA tersebut. [ASUMSI — pola A21]

### Skenario 4 — Hapus ROA (Soft Delete)
1. User pilih baris → **Hapus**.
2. **Gateway — ROA sudah pernah dipakai (`sudah_terpakai = true`)?**
   - **Ya** → tolak penghapusan + tampilkan peringatan (jaga histori klinis). Tombol Hapus dinonaktifkan sejak awal bila status terpakai.
   - **Tidak** → konfirmasi → set `is_deleted = true`, catat audit; data hilang dari UI & pilihan transaksi baru.

### Skenario 5 — Seeding Default Sistem
- Saat inisialisasi, sistem mengisi 14 ROA default (lihat Data Requirements §11.E). Daftar default dapat berubah sesuai kebutuhan implementasi RS.

## 8. Business Rules

- **BR-001** — **Nama Rute wajib diisi**; Kode Rute & Deskripsi opsional. *(Trace: Skenario 2)*
- **BR-002** — **Tidak boleh duplikat Nama Rute** di antara data `is_deleted = false`. *(Trace: gateway Skenario 2/3)*
- **BR-003** — **Kode Rute BOLEH duplikat** (tidak divalidasi unik). Dikonfirmasi: kode `inj.intravenous` dapat dipakai bersama oleh "Intravena" dan "Infus". Keunikan hanya berlaku pada **Nama Rute** (BR-002). *(Trace: Skenario 2/3, Data Default §11.E)*
- **BR-004** — Penghapusan memakai **soft delete** (`is_deleted = true`); data tidak dihapus fisik. *(Trace: Skenario 4)*
- **BR-005** — **ROA yang sudah pernah dipakai** (ditandai `sudah_terpakai = true` sejak pemakaian pertama oleh Master Data Barang Farmasi/e-Resep/CPO/farmasi/EMR) **tidak dapat dihapus**. Sekali terpakai → langsung terkunci dari penghapusan (tidak perlu menghitung jumlah pemakaian). *(Trace: gateway Skenario 4)*
- **BR-006** — Bila ada data `is_deleted = true`, sistem **mengizinkan** pembuatan data baru dengan Nama Rute yang sama (data lama dianggap tidak aktif). *(Trace: Skenario 2)*
- **BR-007** — Modul ini **tidak memakai status Aktif/Nonaktif** (`status_aktif`). Dikonfirmasi: ROA hanya memakai `is_deleted`. **Konsumen transaksi/master lain WAJIB memfilter `is_deleted = false`** (bukan `status_aktif`) saat mengambil daftar ROA. *(Trace: Overview, Out Scope #5, Integrasi Internal)*
- **BR-008** — Daftar pilihan rute di modul yang merujuk hanya menampilkan ROA `is_deleted = false`. *(Trace: To-Be #2)*
- **BR-009** — Kode Rute pada Phase 1 **tidak dibedakan jenis terminologinya** (bisa kode internal/terminologi apa pun, mis. kode ATC `O`/`N`/`R`, ekspresi `inj.intravenous`, atau kode SNOMED CT seperti `59108006`). Pembedaan & pemetaan ke sistem terminologi resmi (ATC `http://www.whocc.no/atc`, FHIR `Dosage.route`, SATUSEHAT) adalah **Phase 2**. *(Trace: Overview, Out Scope #2/#3, §13)*
- **BR-010** — Setiap aksi tambah/ubah/hapus **direkam di audit trail** (user, timestamp, aksi). [ASUMSI]
- **BR-011** — Penandaan `sudah_terpakai` bersifat **satu arah (irreversible)**: begitu di-set `true` oleh modul mana pun yang merujuk ROA, nilai tidak dikembalikan ke `false` meskipun transaksi/rujukan dibatalkan — untuk menjaga histori klinis. *(Trace: BR-005)* [ASUMSI]
- **BR-012** — (Roadmap Phase 2) Saat mapping terminologi diaktifkan, satu `nama_rute` dapat memiliki **lebih dari satu pemetaan** (mis. ATC route + FHIR `Dosage.route` + kode SATUSEHAT). Pemetaan disimpan di struktur terpisah agar tidak mengubah keunikan Nama Rute Phase 1. *(Trace: §13 Roadmap)* [PERLU KONFIRMASI — desain detail Phase 2]

## 9. User Stories

| ID | User Story | Prioritas | Acceptance Criteria (ringkas) |
|----|-----------|-----------|-------------------------------|
| **US-001** | Sebagai **user Admin/Farmasi**, saya ingin melihat dashboard/daftar ROA, agar seluruh rute pemberian yang dirujuk modul lain terpantau. | P0 | Menu ROA menampilkan tabel data non-deleted; ada pencarian (Nama/Kode), sorting, pagination (10/20/50/100). |
| **US-002** | Sebagai **user Admin/Farmasi**, saya ingin menambah ROA baru (Nama, Kode opsional, Deskripsi opsional), agar rute baru dapat dipilih di Master Data Barang Farmasi/e-Resep/CPO/farmasi/EMR. | P0 | Form overlay tampil; Nama wajib & dicek duplikat; Kode boleh sama; data tersimpan & langsung tersedia. |
| **US-003** | Sebagai **user Admin/Farmasi**, saya ingin mengubah detail ROA, agar daftar selalu sesuai kebutuhan. | P0 | Semua field editable; validasi duplikasi Nama; perubahan tercermin di referensi modul lain. |
| **US-004** | Sebagai **user Admin/Farmasi**, saya ingin menghapus ROA yang belum pernah dipakai, agar daftar tetap rapi tanpa kehilangan histori. | P0 | Soft delete (`is_deleted=true`); data dengan `sudah_terpakai=true` ditolak hapus (tombol Hapus nonaktif) dengan peringatan. |
| **US-005** | Sebagai **user yang merujuk ROA** (input Master Data Barang Farmasi / Dokter / Perawat / Apoteker), saya ingin memilih rute pemberian dari daftar terstandarisasi, agar penulisan konsisten. | P0 | Field rute pemberian di modul perujuk mengambil daftar ROA non-deleted; pemakaian pertama menandai `sudah_terpakai=true`. *(Trace BPMN: g-service-cpo-order, g-service-cpo-timing "Cara Pemberian")* |
| **US-006** | Sebagai **Admin RS**, saya ingin daftar ROA default tersedia saat instalasi, agar tidak input dari nol. | P1 | 14 ROA default ter-seed; dapat diubah sesuai kebutuhan. |
| **US-007** | Sebagai **Manajemen/Auditor**, saya ingin perubahan ROA terekam, agar dapat ditelusuri. | P2 [ASUMSI] | Audit trail mencatat user, timestamp, aksi. |
| **US-008** | Sebagai **Tim Integrasi/Interop**, saya ingin Kode Rute dapat dipetakan ke terminologi standar (ATC/FHIR `Dosage.route`/SATUSEHAT) di Phase 2, agar data rute siap dipertukarkan ke SATUSEHAT. | P3 (Phase 2) | Tersedia mekanisme mapping `kode_rute` → system/URI target; target SATUSEHAT ditetapkan saat Phase 2. *(Out Scope Phase 1 — §13)* [PERLU KONFIRMASI] |

## 10. Functional Requirements

- **FR-001** — Sistem menampilkan **daftar ROA** (`is_deleted=false`) dalam tabel: kolom No, Nama Rute, Kode Rute, Deskripsi, Status Pemakaian (Terpakai/Belum, dari flag `sudah_terpakai`), aksi. *(Trace: US-001)*
- **FR-002** — Sistem menyediakan **pencarian** berdasarkan Nama Rute & Kode Rute. *(US-001)*
- **FR-003** — Sistem menyediakan **sorting** kolom (default Nama Rute A→Z, dukung Z→A) & **pagination** 10/20/50/100. *(US-001)*
- **FR-004** — Sistem menyediakan **form Tambah** (overlay) dengan field Nama Rute (wajib), Kode Rute (opsional), Deskripsi (opsional). *(US-002, BR-001)*
- **FR-005** — Sistem **memvalidasi duplikasi Nama Rute** terhadap data non-deleted sebelum simpan. **Kode Rute TIDAK divalidasi unik** (boleh sama). *(US-002/003, BR-002/003/006)*
- **FR-006** — Sistem menyediakan **form Edit** dengan seluruh field editable. *(US-003)*
- **FR-007** — Sistem melakukan **soft delete** (`is_deleted=true`) saat hapus. *(US-004, BR-004)*
- **FR-008** — Sistem **mengecek flag `sudah_terpakai`** sebelum hapus; bila `true` → tolak hapus + peringatan (tombol Hapus dinonaktifkan). Tidak menghitung jumlah pemakaian — cukup status terpakai/belum. *(US-004, BR-005)*
- **FR-009** — Sistem **menyediakan daftar ROA non-deleted** sebagai sumber pilihan (lookup/API) untuk Master Data Barang Farmasi (A4) & modul transaksi; saat ROA dipilih/dipakai pertama kali, modul perujuk memicu set `sudah_terpakai=true`. *(US-005, BR-005/BR-008)*
- **FR-010** — Sistem **men-seed daftar ROA default** saat inisialisasi (14 baris). *(US-006)*
- **FR-011** — Sistem **merekam audit trail** tiap tambah/ubah/hapus. *(US-007, BR-010)* [ASUMSI]
- **FR-012** — (Roadmap, *bukan* Phase 1) Sistem mendukung **mapping `kode_rute` ke terminologi standar**: kode rute ATC via system URI `http://www.whocc.no/atc`, representasi FHIR R4 `Dosage.route` (CodeableConcept pada MedicationRequest/MedicationAdministration), serta SNOMED CT/KFA, dan **terminologi resmi SATUSEHAT untuk Route of Administration** (system/URI target **ditetapkan di Phase 2**). — **Out Scope Phase 1 (Phase 2)**. *(Trace: US-008, BR-009/BR-012, §13)*
- **FR-013** — (Roadmap, *bukan* Phase 1) **Import/Export massal** data ROA — **Out Scope Phase 1** (field `file_import`/`mode_import` tidak dipakai sekarang).

## 11. Data Requirements (Spesifikasi Field)

### A. Entitas `master_roa` (skema data)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| roa_id | UUID/serial | Primary key, auto-generate |
| nama_rute | varchar(100) | Nama rute pemberian — **unik** di antara `is_deleted=false` |
| kode_rute | varchar(50) | Opsional; kode internal/terminologi (Phase 1 tidak dibedakan jenis); **boleh duplikat** |
| deskripsi | varchar(255) | Opsional |
| is_deleted | boolean | Soft delete; default `false`. **Satu-satunya penanda data hidup/mati** (tidak ada `status_aktif`) |
| sudah_terpakai | boolean | default `false`; di-set `true` (irreversible) saat ROA pertama kali dipakai modul perujuk → mengunci penghapusan (BR-005/BR-011) |
| created_by / created_at | varchar / timestamp | Audit |
| updated_by / updated_at | varchar / timestamp | Audit |

> Catatan desain Phase 2 (tidak diimplementasi Phase 1): pemetaan terminologi **tidak** ditambahkan sebagai kolom inti, melainkan direncanakan di **entitas pemetaan terpisah** (mis. `master_roa_mapping`: `roa_id`, `terminology_system` [URI mis. `http://www.whocc.no/atc`], `code`, `display`, `fhir_element` [mis. `Dosage.route`]) — menjaga struktur Phase 1 stabil tanpa migrasi besar (BR-012). [PERLU KONFIRMASI — desain detail Phase 2]

### B. Layar INPUT — Form Tambah/Edit ROA (FR-004, FR-006)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_rute | Nama Rute | text | Ya | maks 100 char; **unik** di antara `is_deleted=false` | manual | BR-001/BR-002 |
| kode_rute | Kode Rute | text | Tidak | maks 50 char; **TIDAK divalidasi unik (boleh duplikat)** | manual | BR-003 (dikonfirmasi); Phase 1 tidak bedakan terminologi (BR-009) |
| deskripsi | Deskripsi | text | Tidak | maks 255 char | manual | Selaras field kanonik `keterangan` (maks 255) |
| jenis_terminologi | Jenis Terminologi Kode | dropdown | Tidak | enum: ATC Adm.R (`http://www.whocc.no/atc`) / SNOMED CT / SATUSEHAT (URI TBD Phase 2) / KFA / Internal | enum | **Phase 2 (dikonfirmasi)** — TIDAK ditampilkan di Phase 1 |

> Catatan konsistensi (dikonfirmasi): field kanonik `status_aktif` (boolean) yang dipakai master lain (A21 dll) **tidak dipakai** di modul ini (BR-007). Penyaringan data aktif memakai `is_deleted = false`. Konsumen (termasuk A4) wajib mengikuti aturan ini.

### C. Layar TAMPIL — Dashboard / List ROA (FR-001..003)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No | row number | angka | – | urut tampilan |
| Nama Rute | master_roa.nama_rute | text | sort A-Z/Z-A (default A-Z); searchable | |
| Kode Rute | master_roa.kode_rute | text | searchable | kosong bila tidak diisi; boleh sama antar baris |
| Deskripsi | master_roa.deskripsi | text (truncate) | – | |
| Status Pemakaian | master_roa.sudah_terpakai | badge (Terpakai/Belum) | filter | menentukan boleh/tidak hapus (BR-005) |
| Aksi | – | tombol Edit / Hapus | – | Hapus **dinonaktifkan** bila `sudah_terpakai = true` |

*Pagination: 10/20/50/100 per halaman. Hanya menampilkan `is_deleted = false`.*

### D. Layar TAMPIL — Konfirmasi Hapus (FR-007/008)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama/Kode Rute | master_roa | text | – | data yang akan dihapus |
| Status Pemakaian | master_roa.sudah_terpakai | badge (Terpakai/Belum) | – | merah bila Terpakai → tombol Hapus dinonaktifkan; hijau bila Belum → boleh hapus |

### E. Data Default Sistem (seed, FR-010)

| No | Nama Rute             | Kode              |
| -- | --------------------- | ----------------- |
| 1  | Implant               | implant           |
| 2  | Inhalasi              | Inhal             |
| 3  | Nasal                 | N                 |
| 4  | Oral                  | O                 |
| 5  | Parenteral            | P                 |
| 6  | Rektal                | R                 |
| 7  | Sublingual / Bukal    | SL                |
| 8  | Transdermal           | TD                |
| 9  | Vagina                | V                 |
| 10 | Bubuk Inhalasi        | Inhal.powder      |
| 11 | Aerosol Inhalasi      | Inhal.aerosol     |
| 12 | Transdermal Patch     | TD patch          |
| 13 | Instillation Solution | Instill.solution  |
| 14 | Oftalmik              | lamella           |
| 15 | Aerosol Oral          | oral aerosol      |
| 16 | Ocular                | ocular            |
| 17 | Otic                  | otic              |
| 18 | Kutanea               | cutaneous         |
| 19 | Subkutan Injeksi      | inj.subcutaneous  |
| 20 | Intramuskular Injeksi | inj.intramuscular |
| 21 | Intravena Injeksi     | inj.intravenous   |
| 22 | Intratekal Injeksi    | inj.intrathecal   |
| 23 | Topikal               | ointment          |
| 24 | Stomatologic          | stomatologic      |
| 25 | Dikunyah              | Chewing Gum       |
| 26 | SC Implant            | s.c. implant      |
| 27 | Intravesical          | intravesical      |
| 28 | Urethral              | urethral          |
| 29 | Instillation          | Instill           |
| 30 | Larutan Inhalasi      | Inhal.solution    |


> Catatan terminologi (informasi Phase 2, bukan implementasi Phase 1): kode default tampak campuran beberapa sumber — kode huruf tunggal `O/N/R/V/P/SL` selaras dengan **kode rute administrasi WHO ATC** (`http://www.whocc.no/atc`); `59108006` adalah **kode SNOMED CT**; sisanya (`inj.intravenous`, `ointment`, `ocular`, dst.) bersifat ekspresi/kode internal. Pemetaan formal kode-kode ini ke sistem URI target & FHIR `Dosage.route` dilakukan di Phase 2 (BR-009/BR-012, §13). [ASUMSI — interpretasi asal kode]

## 12. Non-Functional Requirements

- **NFR-001 (Performa)** — Pencarian/filter daftar ROA tampil < 3 detik untuk data master skala RS Tipe C & D. *(Trace: Metrik 4)*
- **NFR-002 (Usability)** — Form sederhana (3 field utama), dapat dioperasikan user non-teknis (Admin/Farmasi) tanpa pelatihan khusus. *(Metrik 2)*
- **NFR-003 (Integritas Data)** — Soft delete menjaga histori; data yang sudah pernah dipakai (`sudah_terpakai=true`) tidak pernah hilang/terhapus. *(BR-004/005/011)*
- **NFR-004 (Auditability)** — Semua perubahan tercatat & dapat ditelusuri. [ASUMSI]
- **NFR-005 (Akses)** — Pengguna utama modul ini adalah **user Admin / Farmasi**. Detail RBAC/role spesifik **tidak dibahas dalam PRD ini** (dikonfirmasi) — pengaturan peran mengikuti modul RBAC/Role terpisah.
- **NFR-006 (Ketersediaan/Offline)** — Sebagai master kecil yang jarang berubah, daftar ROA sebaiknya di-cache di sisi modul perujuk agar tetap tersedia saat koneksi tidak stabil. [ASUMSI — kendala internet RS Tipe C & D]
- **NFR-007 (Kompatibilitas/Interoperabilitas)** — Struktur `kode_rute` dirancang fleksibel agar mudah di-extend menjadi mapping multi-terminologi Phase 2 (ATC `http://www.whocc.no/atc`, FHIR `Dosage.route`, SATUSEHAT) **tanpa migrasi besar** — pemetaan direncanakan via entitas terpisah (lihat §11.A & §13).
- **NFR-008 (Konsistensi UI/UX)** — Karena **Design Figma A40 belum tersedia** (dikonfirmasi), implementasi UI Phase 1 mengikuti **pola dashboard & form Master Data Sediaan (A21)** sebagai acuan sementara hingga desain final tersedia. [ASUMSI — acuan A21]

## 13. Integrasi Eksternal

### Phase 1
- **Tidak ada integrasi eksternal aktif.** Meskipun label fitur menyebut *Integrasi SATUSEHAT Terminology V2*, pada Phase 1 modul hanya menyimpan Kode Rute bebas tanpa pertukaran data ke SATUSEHAT. *(Trace: Overview, Out Scope #3, BR-009)*

### Integrasi Internal (konsumen daftar ROA)
| Modul | Arah | Keterangan |
|-------|------|-----------|
| **Master Data Barang Farmasi (A4)** | ROA → A4 | **Dikonfirmasi** — ROA dipanggil sebagai pilihan rute saat input/konfigurasi master barang farmasi; pemilihan dapat memicu `sudah_terpakai=true` |
| e-Resep | ROA → transaksi | Sumber pilihan rute pemberian |
| Order Obat / CPO | ROA → transaksi | "Cara Pemberian" (Trace BPMN g-service-cpo-order, g-service-cpo-timing) |
| Pelayanan Farmasi / Apotek Online | ROA → transaksi | (Trace BPMN g-support-apotek-online-iter) |
| EMR / Dokumentasi Pemberian Obat | ROA → transaksi | (Trace BPMN g-emr-inpatient) |

> Semua konsumen **WAJIB memfilter `is_deleted = false`** (bukan `status_aktif`) — BR-007.

### Roadmap Mapping Terminologi (Phase 2 — Out Scope sekarang)
Target pemetaan `kode_rute` ke sistem terminologi standar. Disimpan via entitas pemetaan terpisah (`master_roa_mapping`, lih. §11.A) agar struktur Phase 1 tetap stabil (BR-012).

| Sistem Terminologi | System URI / Referensi | Peran | Status |
|--------------------|------------------------|-------|--------|
| **WHO ATC — Route of Administration** | `http://www.whocc.no/atc` | Sumber kode rute administrasi standar (mis. `O` Oral, `N` Nasal, `R` Rektal, `V` Vaginal, `P` Parenteral, `SL` Sublingual/Oromucosal) | **Ditetapkan sebagai sistem mapping** (dikonfirmasi user) |
| **FHIR R4 — Route of Administration** | Elemen `Dosage.route` (CodeableConcept) pada `MedicationRequest` / `MedicationAdministration` | Bentuk representasi interoperabilitas saat data rute dikirim via FHIR (sesuai pola SATUSEHAT) | **Acuan format FHIR (dikonfirmasi user: "FHIR RouteAdministration")** |
| **SATUSEHAT Terminology — ROA** | system/URI **belum ditetapkan** | Kode resmi target SATUSEHAT untuk Route of Administration | **[PERLU KONFIRMASI] — akan ditentukan pada Phase 2 sesuai terminologi resmi SATUSEHAT** |
| **SNOMED CT** | `http://snomed.info/sct` (mis. `59108006`) | Alternatif/komplemen kode klinis rute | Phase 2 — opsional |
| **KFA (Kamus Farmasi Indonesia)** | URI KFA | Mapping konteks obat (bila relevan) | Phase 2 — opsional |

**Catatan desain Phase 2:**
- Satu `nama_rute` dapat memiliki >1 pemetaan (ATC + FHIR `Dosage.route` + SATUSEHAT) — BR-012. [PERLU KONFIRMASI desain detail]
- Saat data rute dipertukarkan ke SATUSEHAT, nilai dipublikasikan sebagai `Dosage.route` (CodeableConcept) berisi `system` (URI target) + `code` + `display` hasil mapping.
- **Push/integrasi aktif ke SATUSEHAT** (kirim/tarik kode) tetap **Out Scope Phase 1**.

### Roadmap lain (Phase berikutnya)
- **Import/Export massal ROA**: Phase berikutnya (dikonfirmasi).
- **Mapping ROA ↔ Sediaan (A21)**: untuk validasi klinis, rekomendasi rute, autofill peresepan.