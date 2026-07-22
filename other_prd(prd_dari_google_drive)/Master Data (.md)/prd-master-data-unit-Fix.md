# PRD — Master Data: Unit (A3)

**Related Document:** Design Figma — Master Data Unit; Master Data Instalasi (A19); Master Data Bangsal (A15), Kamar (A16), Bed (A17); Master Data Wilayah (A32); Master Data Staf (A2); PRD Inventori/Gudang Farmasi & RT (A42); SATUSEHAT FHIR Location Resource (acuan Phase 2)
**Versi:** 4.3 - **Section Klasifikasi Unit DIHAPUS** — field **Bangsal, Ruangan, Kamar, Bed** dihilangkan (tidak lagi diinput pada Unit; lookup A15/A16/A17 dilepas). Hanya **Lantai** (teks bebas, opsional) dipertahankan & **dipindah ke Section 1 (Data Inti Unit)**. Konsekuensi: wajib-kondisional Bangsal (BR-002/FR-010), fitur Section Klasifikasi Unit, auto-update referensi klasifikasi (BR-008), serta metrik/goal terkait **dihapus**. `tipe_unit`=Bangsal **tidak lagi** meng-enable section klasifikasi (section tak ada); `tipe_unit` tetap menentukan sub-menu sidebar (Poli/Farmasi) & identifikasi unit gudang (A42). · v4.2 - **Field peruntukan Unit dinamai `tipe_unit` (label "Tipe Unit")** dan enum diperluas menjadi **9 nilai**: Gudang / Farmasi / Poli / Darurat / Bangsal / Penunjang Pemeriksaan / Penunjang Terapi / Penunjang Tindakan / Non Pelayanan. Field ini **atribut & input langsung pada Unit** (dropdown wajib) — dipindah dari A19 (v4.1) & tidak diturunkan dari Instalasi induk. Perilaku: **Bangsal** → Section Klasifikasi Unit enable & wajib; **Poli/Farmasi** → sub-menu sidebar; **Gudang** → unit gudang Inventori (A42). *(v4.1: pemindahan field dari A19; v4.0: baca dari A19.)*
**Tanggal:** 2026-07-06

## 1. Metadata Dokumen

* **Approval**: [PERLU KONFIRMASI — Nama Stakeholder, Jabatan, Tanggal]
* **Related Documents**:
    * Design Figma — Master Data Unit
    * Master Data Instalasi (A19) — induk/pengelompokan Unit (field `instalasi`). Catatan: atribut `tipe_unit` **dipindah ke Unit (A3) pada v4.1** — tidak lagi dari A19. `managingOrganization` FHIR (Phase 2)
    * Master Data Bangsal (A15), Kamar (A16), Bed (A17) — *(tidak lagi disematkan pada Unit sejak v4.3 — Section Klasifikasi Unit dihapus)*
    * Master Data Wilayah (A32) — sumber `address` FHIR (Phase 2)
    * Master Data Staf (A2)
    * PRD Inventori / Gudang Farmasi & RT (A42) — konsumen daftar unit gudang (unit yang Instalasi induknya A19 bertipe Gudang)
    * SATUSEHAT FHIR Location Resource — acuan Phase 2
* **Document Version**:
    * 25 Juni 2026 — v2.0 — Phase 1 disederhanakan: seluruh cakupan SATUSEHAT/FHIR `Location` ditunda ke Phase 2.
    * 25 Juni 2026 — v2.1 — Klasifikasi Unit diubah dari dropdown enum tunggal menjadi **section 5 field** (Bangsal/Ruangan/Kamar/Bed/Lantai).
    * 25 Juni 2026 — v2.2 — Klasifikasi (Bangsal/Kamar/Bed) menjadi **WAJIB KONDISIONAL** bila Instalasi (A19) Rawat Inap; ditambah field `instalasi` (6 field inti); referensi master Klasifikasi nonaktif/dihapus = auto-update Sistem + audit trail.
    * 25 Juni 2026 — v2.3 — Penegasan: **seluruh integrasi FHIR/BPJS/SATUSEHAT definitif Phase 2**; BPJS V2 (kode poli VClaim/Aplicares) bila diperlukan = Phase 2.
    * 2 Juli 2026 — v3.0 — **Reformat ke struktur template (1).md (9 section)** tanpa mengubah keputusan Phase 1/Phase 2. Konten diambil dari sumber `prd-master-data-unit.md`.
    * 6 Juli 2026 — v4.0 — **Field `is_gudang` ('Apakah gudang?') dihapus** (identifikasi unit gudang diturunkan dari Instalasi A19 bertipe Gudang). **Perilaku Section Klasifikasi Unit & sub-menu sidebar kini ditentukan `tipe_unit` A19** (Bangsal → enable & wajib; Poli → disable + sub-menu 'Poli'; Farmasi → disable + sub-menu 'Farmasi'), menggantikan boolean `is_rawat_inap`.
    * 6 Juli 2026 — v4.1 — **Field `tipe_unit` dipindahkan dari A19 ke Master Data Unit** — kini **diinput langsung pada Unit** (dropdown wajib), bukan diturunkan dari Instalasi induk. Instalasi (A19) menjadi master pengelompokan murni tanpa atribut peruntukan. Field `instalasi` (induk) tetap wajib sebagai pengelompokan.
    * 6 Juli 2026 — v4.2 — **Field dinamai `tipe_unit` (label "Tipe Unit")** & enum diperluas dari 6 → **9 nilai**: Gudang, Farmasi, Poli, Darurat, Bangsal, Penunjang Pemeriksaan, Penunjang Terapi, Penunjang Tindakan, Non Pelayanan. Penunjang tunggal dipecah 3 (Pemeriksaan/Terapi/Tindakan); ditambah **Darurat**; sufiks "(Rawat Inap)"/"(Rawat Jalan)" dilepas. Perilaku: Section Klasifikasi Unit enable & wajib bila `tipe_unit`=Bangsal; sub-menu sidebar untuk Poli/Farmasi; identifikasi unit gudang (A42) bila Gudang.

## 2. Overview & Background

* **Overview/Brief Summary**:
  Fitur **Master Data - Unit** (code **A3**, cluster **Control Panel / Master Data**) digunakan untuk mencatat dan mengelola daftar **unit/lokasi** Rumah Sakit sebagai **referensi tunggal (single source of truth)** bagi modul lain (Pelayanan Rawat Jalan/Rawat Inap/IGD/Penunjang, Inventori/Gudang Farmasi & RT, Rekam Medis/EMR, Keuangan).
  **Cakupan Phase 1 (MVP) = data inti unit murni tanpa integrasi eksternal**:
    * **Instalasi induk** (`instalasi`): tiap Unit merujuk ke satu Instalasi dari **Master Data Instalasi (A19)** sebagai **pengelompokan** (tanpa mewariskan tipe).
    * **Tipe Unit** (`tipe_unit`): **field wajib pada Unit** (enum **9 nilai**: Gudang, Farmasi, Poli, Darurat, Bangsal, Penunjang Pemeriksaan, Penunjang Terapi, Penunjang Tindakan, Non Pelayanan) — **menentukan perilaku Unit**: Poli → Unit tampil di sub-menu **Poli** sidebar; Farmasi → sub-menu **Farmasi**; Gudang → unit gudang untuk Inventori (A42); tipe lain → tanpa perilaku khusus. *(Dipindah dari A19 pada v4.1 & dinamai `tipe_unit` pada v4.2.)*
    * **Identitas unit**: Kode Unit + Nama Unit.
    * **Lantai** (teks bebas, opsional) — field inti. *(v4.3: Section Klasifikasi Unit dengan field Bangsal/Ruangan/Kamar/Bed dihapus; hanya Lantai dipertahankan & masuk data inti.)*
    * **Status** aktif/nonaktif (soft delete) + **Keterangan**.
    * **Dashboard/List, Tambah, Update, Riwayat Aktivitas (audit log)** — termasuk perubahan otomatis oleh Sistem.
  Keselarasan Unit dengan resource **`Location` FHIR SATUSEHAT** (identifier, mode, type, physicalType, position, partOf/hierarki, hoursOfOperation, operationalStatus bed, POST/PUT + IHS Location ID) serta pemetaan **BPJS** adalah pekerjaan **Phase 2** — bukan Phase 1.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** `[ASUMSI]`: Daftar unit dicatat **manual** (spreadsheet) atau tersebar di tiap modul. Dampak: nama/kode unit **tidak seragam** (mis. 'Poli Anak' vs 'Klinik Anak'); keterkaitan unit dengan **Instalasi induk tidak tercatat** sehingga aturan berbasis jenis instalasi (unit rawat inap wajib bangsal/kamar/bed) tak dapat ditegakkan; **tidak ada klasifikasi unit seragam** dan keterkaitan Bangsal/Kamar/Bed tidak terstruktur.
    * **To-Be** (Phase 1): Master Data Unit menjadi **referensi tunggal**. Admin membuka menu Master Data → Unit, memilih **Instalasi induk** (A19), memilih **Tipe Unit** (field Unit, 9 nilai), mengisi **Kode, Nama, Keterangan, Lantai (opsional), Status**. Perilaku ditentukan **`tipe_unit` milik Unit**: **Poli**/**Farmasi** → Unit otomatis muncul sebagai sub-menu **Poli**/**Farmasi** pada sidebar; **Gudang** → dikenali sebagai unit gudang (A42). Sistem memvalidasi (kode unik, field wajib) lalu menyimpan; Unit langsung tersedia sebagai referensi modul lain. Perubahan tercatat di Riwayat Aktivitas.
    * **To-Be** (Phase 2 — SATUSEHAT onboarding) `[**]`: Pelengkapan field FHIR Location (mode/type/physicalType/position/address/telecom/hoursOfOperation), pemetaan `managingOrganization` (dari `instalasi` Phase 1) & `partOf`, validasi field mandatory FHIR, **POST/PUT ke SATUSEHAT** + simpan **IHS Location ID**, hierarki tree, operationalStatus bed, penanganan kegagalan sync, serta impor/ekspor massal.

## 3. Goals & Metrics

**Goals (Phase 1)**
* Menyediakan **daftar unit terstandar & terintegrasi** sebagai referensi tunggal di seluruh sistem RS.
* Memastikan tiap Unit terhubung ke **Instalasi induk (A19)** dan memiliki **Tipe Unit** (field Unit) yang menentukan perilaku Unit (sub-menu sidebar / identifikasi unit gudang) — Poli/Farmasi/Gudang/dll.
* Memungkinkan **identifikasi unit gudang** melalui **Unit ber-`tipe_unit`=Gudang** agar Inventori (A42) dapat memilih lokasi gudang (tanpa flag manual).
* Memastikan **kemandirian Admin RS non-teknis** melakukan setup unit tanpa bantuan IT.

**Goals (Phase 2)** `[**]`
* Menyelaraskan struktur unit dengan **FHIR Location SATUSEHAT** & menjamin interoperabilitas (POST/PUT Location, IHS Location ID).
* Mendukung **hierarki lokasi multi-tingkat** (`partOf`), jam operasional, dan status operasional bed.

| No | Metrics | Success Criteria | Phase |
|----|---------|------------------|-------|
| 1 | Konsistensi data antar modul | 100% modul yang membutuhkan unit memakai referensi yang sama | Phase 1 |
| 2 | Kemandirian user non-teknis | 100% Admin RS mampu setup unit tanpa bantuan tim teknis | Phase 1 |
| 3 | Kecepatan pencarian | Waktu pencarian unit **< 3 detik** | Phase 1 |
| 4 | Akurasi identifikasi gudang | 100% unit gudang (Unit ber-`tipe_unit`=Gudang) terpilih benar saat dipakai Inventori (A42) | Phase 1 |
| 7 | Kepatuhan FHIR SATUSEHAT `[**]` | 100% unit yang dikirim ke SATUSEHAT punya field mandatory FHIR (`name`, `mode`, `position`, `managingOrganization`) terisi | Phase 2 |
| 8 | Sukses sinkronisasi SATUSEHAT `[**]` | ≥ 95% unit berhasil di-POST/PUT ke endpoint Location tanpa error validasi | Phase 2 |
| 9 | Navigasi sub-menu instalasi | 100% Instalasi bertipe Poli/Farmasi menampilkan daftar unit sebagai sub-menu sidebar yang benar | Phase 1 |

## 4. Scope Definition & Phasing

> **Arahan phasing (definitif):** **Seluruh integrasi eksternal — FHIR, BPJS, dan SATUSEHAT — berada di Phase 2.** Phase 1 = master data inti Unit murni (dashboard, CRUD, Tipe Unit, identifikasi gudang, relasi Instalasi A19, audit) **tanpa** integrasi eksternal. Arsitektur data tetap disiapkan (kolom FHIR/IHS/BPJS ada namun tidak difungsikan di Phase 1).

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Integrasi & Lanjutan) |
|-------------|---------------------|--------------------------------|
| Dashboard Unit | List, cari, filter (instalasi/Tipe Unit/status), kartu ringkasan | — |
| Data Unit | Tambah/Update, **field inti** (Instalasi, Tipe Unit, Kode, Nama, Keterangan, **Lantai**, Status) | — |
| Relasi Instalasi (A19) | Field `instalasi` (induk/pengelompokan); **Tipe Unit = field Unit** (dipindah dari A19 v4.1) menentukan sub-menu sidebar & identifikasi unit gudang | Peran `managingOrganization` FHIR |
| Status Unit | Aktif/Nonaktif (soft delete) | — |
| Identifikasi Unit Gudang | Diturunkan dari **Unit ber-`tipe_unit`=Gudang** (tanpa flag manual) — dikonsumsi Inventori (A42) | — |
| Navigasi Sidebar | Unit bertipe **Poli** → sub-menu **Poli**; **Farmasi** → sub-menu **Farmasi** (daftar unit) | — |
| Riwayat Aktivitas | Audit log (aktor user/Sistem, waktu, aksi, field, alasan) | — |
| FHIR Location | — | Field FHIR lengkap (alias/mode/type/physicalType/position/address/telecom/hoursOfOperation), POST/PUT SATUSEHAT + IHS Location ID + retry `[**]` |
| Hierarki Lokasi | — | `partOf` + tampilan tree kompleks→gedung→lantai→ruangan→kamar→bed `[**]` |
| operationalStatus bed | — | occupied/vacant/reserved/dst `[**]` |
| Pemetaan BPJS | — | Kode poli VClaim/Aplicares (bila diperlukan) `[**]` [PERLU KONFIRMASI kebutuhan] |
| Impor/Ekspor Unit | — | Template CSV/XLSX (tambah / tambah+update) `[**]` |

**Out of Scope**:
1. Pengelolaan **master Instalasi** (CRUD entitasnya) — Master Data Instalasi (A19); Unit hanya me-lookup.
2. Pengelolaan **staf** yang bertugas di unit — Master Data Staf (A2).
3. Pengelolaan **jadwal layanan/appointment/service** — modul HealthcareService & Appointment.
4. Pengelolaan **stok & isi** gudang/farmasi — modul Inventori (A42); identifikasi unit gudang diturunkan dari Instalasi (A19) bertipe Gudang.
5. Reservasi & booking bed — modul Rawat Inap.
6. Pengelolaan **master Bangsal/Kamar/Bed** (A15/A16/A17) — **tidak lagi disematkan pada Unit** (Section Klasifikasi Unit dihapus v4.3); dikelola di modul masing-masing.
7. **Interoperabilitas SATUSEHAT/FHIR Location & pemetaan BPJS** — dialihkan ke **Phase 2** (seluruh integrasi eksternal).

## 5. Related Features

| No | Code | Module | Feature | Relasi dengan Unit | Phase |
|----|------|--------|---------|--------------------|-------|
| 1 | A42 | Inventori / Gudang Farmasi & RT | Penerimaan, Pengeluaran, Mutasi | **Lokasi gudang = Unit yang Instalasi induknya (A19) bertipe Gudang**; Inventori memilih unit gudang dari master ini | Phase 1 |
| 2 | A2 | Master Data | Staf | Staf bertugas di Unit (di-handle modul Staf) | Phase 1 |
| 6 | A19 | Master Data | **Instalasi (Organization)** | **Phase 1:** induk/pengelompokan Unit (field `instalasi`). Atribut `tipe_unit` **dipindah ke Unit (A3) v4.1** — A19 tak lagi menentukan perilaku sidebar. **Phase 2:** `managingOrganization` FHIR | Phase 1 (+ `managingOrganization` `[**]`) |
| 7 | — | Pelayanan | Rawat Jalan, Rawat Inap, IGD, Penunjang | Konsumen referensi Unit | Phase 1 |
| 8 | A32 | Master Data | Wilayah (Prov/Kab/Kec/Kel) | Sumber `address` lokasi FHIR | Phase 2 `[**]` |
| 9 | A43 | Master Data | Tarif Kamar | Tarif terkait kamar/kelas perawatan | Phase 2 `[**]` |
| 10 | — | Integrasi Eksternal | SATUSEHAT FHIR Location / BPJS | Sinkronisasi unit / pemetaan kode | Phase 2 `[**]` |

> Catatan konsistensi: field `unit (Unit/Poli)` yang dipakai modul A1/A2/A10/A14/A15/A16/A43 sebagai dropdown lookup **bersumber dari master Unit (A3) ini**. Field `instalasi` **me-lookup** ke A19 — bukan mengelola entitasnya. Field kanonik `nama` & `keterangan` mengikuti definisi bersama modul Control Panel lain. *(Section Klasifikasi Unit/lookup A15/A16/A17 dihapus v4.3 — Unit tidak lagi menyematkan Bangsal/Kamar/Bed.)*

## 6. Business Process & User Stories

* **State Machine Table** (status Unit — soft delete):

| Status | Deskripsi | Efek | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------|--------------------|--------------------|
| AKTIF | Unit aktif & dapat dipilih sebagai referensi | Muncul di lookup modul Pelayanan/Inventori; dikirim ke SATUSEHAT (Phase 2) | AKTIF → NONAKTIF (toggle Admin) | AKTIF → NONAKTIF; map ke `Location.status=active` |
| NONAKTIF | Unit dinonaktifkan (soft delete) | **Tidak** dapat dipilih untuk transaksi baru; tetap tampil di histori | NONAKTIF → AKTIF (toggle) | map ke `Location.status=inactive` |
| SUSPENDED *(disiapkan, Phase 2)* | Status FHIR `suspended` | Relevan hanya saat pemetaan `Location.status` | — | AKTIF/NONAKTIF → SUSPENDED |

> Catatan: status baru selalu di-set **AKTIF** oleh sistem; pengelolaan aktif/nonaktif via **toggle di Dashboard** (tanpa hard delete — BR-006). Nilai `suspended` FHIR baru relevan Phase 2.

* **User Stories Utama**:
    * **Phase 1**
        * **US-001** — Sebagai **Admin Master Data**, saya ingin menambah unit baru dengan data inti (Instalasi, Kode, Nama, Keterangan, Status), agar daftar unit terstandar & cepat tersedia sebagai referensi.
        * **US-002** — Sebagai **Admin Master Data**, saya ingin mengubah data unit, agar perubahan langsung terpakai di seluruh modul yang merujuk unit.
        * **US-003** — Sebagai **Admin Master Data**, saat memilih Instalasi bertipe **Poli** atau **Farmasi**, saya ingin Unit tersebut otomatis muncul sebagai **sub-menu (Poli/Farmasi) pada sidebar** navigasi, agar mudah diakses tanpa konfigurasi menu manual.
        * **US-005** — Sebagai **Admin Master Data**, saya ingin mengubah status unit (aktif/nonaktif), agar unit nonaktif tidak dipakai transaksi baru tetapi tetap ada di histori.
        * **US-006** — Sebagai **Admin RS non-teknis**, saya ingin mencari & memfilter unit dengan cepat (< 3 detik), agar setup mudah tanpa bantuan IT.
        * **US-007** — Sebagai **Petugas Pelayanan/Inventori**, saya ingin memilih unit dari daftar referensi tunggal, agar nama/kode unit konsisten antar modul.
        * **US-008** — Sebagai **Admin Master Data**, saya ingin melihat Riwayat Aktivitas perubahan unit, agar setiap perubahan dapat ditelusuri.
    * **Phase 2** `[**]`
        * **US-101** — melengkapi unit dengan field FHIR Location lengkap agar siap dikirim ke SATUSEHAT.
        * **US-102** — mengubah unit & sistem otomatis **PUT** ke SATUSEHAT memakai IHS Location ID.
        * **US-103** — menetapkan lokasi induk (`partOf`) & melihat struktur pohon lokasi.
        * **US-104** — (Sistem Integrasi) menyimpan **IHS Location ID** dari response SATUSEHAT.
        * **US-105** — mengelola **operationalStatus bed** (occupied/vacant/reserved).
        * **US-106** — impor/ekspor data unit via template CSV/XLSX.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

> Legend Prioritas: **P0** Critical (MVP) · **P1** Must Have · **P2** Should Have · **P3** Low · **P4** Enhancement. Legend Fase: Phase 1 = MVP · `[**]` = Phase 2.

---

**Fitur: Dashboard Unit**
* **User Story**: Sebagai Admin/Petugas, saya ingin melihat daftar unit dengan pencarian & filter, agar unit mudah dipantau & dipilih.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Dashboard menampilkan tabel unit dengan kolom kunci (Kode, Nama, Instalasi, Tipe Unit, Lantai, Status).
    * **AC 2**: Tersedia **kartu ringkasan** Total Unit Aktif & Total Unit Gudang (Unit ber-`tipe_unit`=Gudang).
    * **AC 3**: Pencarian by Kode/Nama; **filter** by Instalasi, **Tipe Unit**, status.
    * **AC 4**: Sorting kolom (default Kode A-Z) & pagination.
    * **AC 5**: Setiap baris memiliki aksi **Edit / Detail / Ubah Status**.

---

**Fitur: Tambah / Edit Data Unit (field inti)**
* **User Story**: Sebagai Admin Master Data, saya ingin menambah/mengubah unit dengan data inti, agar daftar unit terstandar & terhubung ke Instalasi induk.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form berisi **field inti**: Instalasi (lookup A19), **Tipe Unit** (dropdown 9 nilai), Kode Unit, Nama Unit, Keterangan, **Lantai** (teks bebas, opsional), Status.
    * **AC 2**: **Kode Unit divalidasi unik**; duplikat/ kosong → simpan ditolak (BR-001).
    * **AC 3**: Field wajib tanpa syarat (Instalasi, Tipe Unit, Kode, Nama, Status) harus terisi sebelum simpan (BR-002). **Lantai opsional**.
    * **AC 4**: Lookup Instalasi hanya menampilkan Instalasi **aktif** & memvalidasi nilai terhadap A19 (BR-009).
    * **AC 5**: Setelah tersimpan, unit langsung tersedia sebagai referensi modul lain.

---

**Fitur: Navigasi Sidebar Berdasarkan Tipe Unit (Unit)**
* **User Story**: Sebagai pengguna sistem, saya ingin unit bertipe Poli/Farmasi otomatis tampil sebagai sub-menu pada sidebar, agar navigasi ke daftar unit tersebut cepat & tanpa setup menu manual.
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Bila **Unit** bertipe **Poli**, sistem menambahkan daftar unit terkait sebagai **sub-menu 'Poli'** pada sidebar navigasi (BR-003).
    * **AC 2**: Bila **Unit** bertipe **Farmasi**, sistem menambahkan daftar unit terkait sebagai **sub-menu 'Farmasi'** pada sidebar navigasi (BR-003).
    * **AC 3**: Sub-menu hanya memuat unit **aktif**; unit nonaktif tidak ditampilkan di sidebar (BR-005).
    * **AC 4**: **Identifikasi unit gudang** untuk Inventori (A42) diturunkan dari **Unit** bertipe **Gudang** — bukan flag manual (BR-007).
    * **AC 5**: [PERLU KONFIRMASI] Perilaku sidebar untuk Tipe Unit lain (Darurat / Gudang / Penunjang Pemeriksaan / Penunjang Terapi / Penunjang Tindakan / Non Pelayanan) — apakah perlu sub-menu tersendiri?

---

**Fitur: Status Aktif/Nonaktif (Soft Delete)**
* **User Story**: Sebagai Admin Master Data, saya ingin mengaktifkan/menonaktifkan unit, agar unit usang tidak dipakai transaksi baru namun tetap tersimpan.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Toggle status Aktif/Nonaktif (soft delete) — tanpa hard delete (BR-006).
    * **AC 2**: Unit Nonaktif **tidak dapat dipilih** sebagai referensi transaksi baru namun **tetap tampil di histori** (BR-005).

---

**Fitur: Detail Unit & Riwayat Aktivitas**
* **User Story**: Sebagai Admin Master Data, saya ingin melihat detail unit & riwayat perubahannya, agar setiap perubahan dapat ditelusuri.
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Detail menampilkan seluruh field inti (Instalasi, Tipe Unit, Kode, Nama, Keterangan, Lantai, Status).
    * **AC 2**: Riwayat Aktivitas berupa timeline (aktor user, waktu, aksi, field terdampak, alasan) — mencakup seluruh perubahan Admin.

---

**Fitur: SATUSEHAT FHIR Location Onboarding** `[**]`
* **User Story**: Sebagai Admin Master Data / Sistem Integrasi, saya ingin melengkapi & menyinkronkan unit ke SATUSEHAT, agar interoperabilitas terpenuhi.
* **Prioritas**: P0 (Phase 2) · **Fase**: Phase 2 `[**]`
* **Acceptance Criteria**:
    * **AC 1**: Form field FHIR Location lengkap (mode, type, physicalType, position, address dari A32, telecom, hoursOfOperation, managingOrganization dari A19, partOf).
    * **AC 2**: Validasi field mandatory FHIR (`name`, `mode`, `position.longitude/latitude`, `managingOrganization`) & keunikan identifier per organisasi (BR-101, BR-102).
    * **AC 3**: **POST** unit baru ke SATUSEHAT Location + simpan **IHS Location ID**; **PUT** saat update (BR-105).
    * **AC 4**: Manajemen hierarki `partOf` (tree) + validasi anti-siklus (BR-103); operationalStatus bed saat physicalType=bed (BR-104).
    * **AC 5**: Kegagalan sync → status **pending + retry**; data internal tetap tersimpan (BR-106).
    * **AC 6**: Impor/Ekspor data unit via template CSV/XLSX (tambah / tambah+update).
    * **AC 7**: Pemetaan **BPJS** (kode poli VClaim/Aplicares) bila diperlukan — Phase 2 [PERLU KONFIRMASI kebutuhan].

---

* **Validasi (Wording Frontend)**

  | Field / Aksi | Tipe Input | Rules | Error / Confirm Message |
  |--------------|------------|-------|-------------------------|
  | Instalasi | Dropdown (lookup A19) | Required, valid & aktif | 'Instalasi wajib dipilih.' |
  | Kode Unit | Text | Required, unik, maks 50 | 'Kode Unit wajib diisi & tidak boleh duplikat.' |
  | Nama Unit | Text | Required, maks 100 | 'Nama Unit wajib diisi.' |
  | Tipe Unit | Dropdown (enum 9 nilai) | Required | 'Tipe Unit wajib dipilih.' |
  | Lantai | Text | Opsional, maks 50 | — |
  | Status | Dropdown | Required, default Aktif | — |
  | Hapus permanen | Aksi | Diblokir bila sudah direferensikan | 'Unit sudah dipakai, gunakan Nonaktif (soft delete).' |

## 8. Data & Technical Specifications

> Catatan: nama tabel/kolom & endpoint adalah **rekomendasi teknis [ASUMSI]** untuk divalidasi tim engineering. Kolom FHIR/IHS/BPJS **disiapkan sejak Phase 1** namun **dipetakan/difungsikan pada Phase 2**.

### 8.1 Database Schema Suggestion

* **Table Name**: `units` (Master Unit)
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `unit_code`: String (**unique**, maks 50)
    * `name`: String (Nama Unit, maks 100)
    * `installation_id`: UUID (FK → `installations` / A19) — induk/pengelompokan Unit
    * `tipe_unit`: ENUM(`GUDANG`,`FARMASI`,`POLI`,`DARURAT`,`BANGSAL`,`PENUNJANG_PEMERIKSAAN`,`PENUNJANG_TERAPI`,`PENUNJANG_TINDAKAN`,`NON_PELAYANAN`) NOT NULL — **klasifikasi peruntukan Unit (9 nilai; dipindah dari `installations`/A19 v4.1, dinamai `tipe_unit` v4.2)**; penentu sub-menu sidebar & identifikasi unit gudang (A42)
    * `description`: String (nullable) — Keterangan
    * `lantai`: String (nullable, maks 50) — Lantai (teks bebas, field inti Section 1). *(v4.3: Section Klasifikasi Unit dihapus — kolom `classification_ward_id`/`classification_room_text`/`classification_kamar_id`/`classification_bed_id` dihilangkan; hanya Lantai dipertahankan & dipindah ke data inti.)*
    * `is_active`: Boolean (default true) — status aktif/nonaktif (soft delete)
    * *(Phase 2 — disiapkan, belum difungsikan)* `ihs_location_id`, `fhir_mode`, `fhir_type`, `physical_type`, `position_longitude`, `position_latitude`, `part_of_id` (self-FK), `sync_status`, `bpjs_poli_code`
    * `created_at`, `updated_at`, `created_by`, `updated_by`

* **Table Name**: `unit_activity_logs` (Riwayat Aktivitas)
* **Key Columns**:
    * `id`: UUID (PK), `unit_id`: UUID (FK → `units`)
    * `actor`: String (nama/nip user **atau** `SYSTEM`)
    * `action`: Enum (`CREATE`, `UPDATE`, `STATUS_CHANGE`)
    * `affected_fields`: JSON, `reason`: String (nullable), `diff`: JSON
    * `created_at`: Timestamp

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/units` | List unit (search kode/nama; filter instalasi/tipe_unit/status; sort; pagination) |
| GET    | `/api/v1/units?tipe_unit=GUDANG` | List unit gudang (Unit ber-`tipe_unit`=Gudang; untuk modul Inventori A42) |
| GET    | `/api/v1/units/{id}` | Detail unit (field inti termasuk Tipe Unit & Lantai) |
| POST   | `/api/v1/units` | Tambah unit |
| PUT    | `/api/v1/units/{id}` | Edit unit |
| PATCH  | `/api/v1/units/{id}/status` | Toggle Aktif/Nonaktif (soft delete) |
| GET    | `/api/v1/units/{id}/activity-logs` | Riwayat aktivitas unit |
| GET    | `/api/v1/installations` | Lookup daftar Instalasi (A19) untuk dropdown induk Unit (pengelompokan) |
| POST   | `/api/v1/satusehat/locations` `[**]` | POST unit baru ke SATUSEHAT Location (Phase 2) |
| PUT    | `/api/v1/satusehat/locations/{ihs_id}` `[**]` | PUT update ke SATUSEHAT (Phase 2) |
| POST   | `/api/v1/units/import` `[**]` | Impor massal (CSV/XLSX) (Phase 2) |
| GET    | `/api/v1/units/export` `[**]` | Ekspor data unit (Phase 2) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT) — Phase 1

**Field inti (Section 1 — Data Inti Unit)**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| instalasi | Instalasi | Dropdown (lookup) | Ya | valid & aktif di A19 | Master Instalasi (A19) | induk pengelompokan Unit; Phase 2 = `managingOrganization` |
| tipe_unit | Tipe Unit | Dropdown (enum 9 nilai) | Ya | salah satu dari: Gudang / Farmasi / Poli / Darurat / Bangsal / Penunjang Pemeriksaan / Penunjang Terapi / Penunjang Tindakan / Non Pelayanan | **manual (field Unit — dipindah dari A19 v4.1, dinamai v4.2)** | **penentu perilaku Unit**: Poli/Farmasi → sub-menu sidebar (BR-003); Gudang → unit gudang Inventori A42 (BR-007) |
| unit_code | Kode Unit | Text | Ya | unik, maks 50 | manual / auto-generate | BR-001 |
| nama | Nama Unit | Text | Ya | maks 100 | manual | field kanonik `nama` |
| keterangan | Keterangan | Text | Tidak | maks 255 | manual | field kanonik `keterangan` |
| lantai | Lantai | Text | Tidak | maks 50 | manual | teks bebas *(dipindah dari Section Klasifikasi Unit ke data inti — v4.3)* |
| status | Status | Dropdown | Ya | aktif/nonaktif | default aktif | soft delete; BR-005/BR-006 |

> **Section Klasifikasi Unit DIHAPUS (v4.3):** field Bangsal (A15), Ruangan, Kamar (A16), Bed (A17) tidak lagi diinput pada Unit. Hanya **Lantai** dipertahankan & masuk data inti di atas.

> Field FHIR Location (alias, mode, type, physicalType, position, address/Wilayah A32, telecom, hoursOfOperation, availabilityException, operationalStatus, kelas_perawatan) & pemetaan BPJS **tidak** ada di form Phase 1 — dilengkapi pada **Phase 2** `[**]`.

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View) — Phase 1

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| Total Unit Aktif | count `units` where is_active | angka (kartu) | – | ringkasan |
| Total Unit Gudang | count Unit ber-`tipe_unit`=Gudang | angka (kartu) | – | relevan Inventori (A42) |
| Kode Unit | `units.unit_code` | text | sort A-Z, search | |
| Nama Unit | `units.name` | text | sort, search | |
| Instalasi | `installations.name` (A19) | text/badge | filter | pengelompokan induk |
| Tipe Unit | `units.tipe_unit` (field Unit) | badge | filter | 9 nilai; penentu sub-menu sidebar & unit gudang |
| Lantai | `units.lantai` | text | filter/search | teks bebas (opsional) |
| Status | `units.is_active` | badge (Aktif hijau / Nonaktif abu) | filter | |
| Aksi | – | Edit / Detail / Ubah Status | – | kolom Status Sinkron SATUSEHAT = Phase 2 `[**]` |

* **Business Rules (Phase 1)**:
    * **BR-001**: **Kode Unit wajib unik** & tidak boleh kosong; duplikat ditolak.
    * **BR-002**: Field wajib tanpa syarat: `instalasi`, `tipe_unit`, `unit_code`, `nama`, `status`. **Lantai** opsional. *(v4.3: Section Klasifikasi Unit & wajib-kondisional Bangsal/Kamar/Bed dihapus.)*
    * **BR-003**: Perilaku navigasi sidebar mengikuti `tipe_unit` **Unit**: **Poli** → daftar unit tampil sebagai sub-menu **'Poli'**; **Farmasi** → sub-menu **'Farmasi'**. Hanya unit aktif yang ditampilkan.
    * **BR-005**: Unit Nonaktif tidak boleh dipilih referensi transaksi baru; tetap tampil di histori.
    * **BR-006**: Unit tidak boleh dihapus permanen bila sudah direferensikan; gunakan Nonaktif (soft delete).
    * **BR-007**: **Identifikasi unit gudang** untuk Inventori (A42) diturunkan dari **Unit ber-`tipe_unit`=Gudang** (field Unit) — tidak ada flag `is_gudang` manual. [PERLU KONFIRMASI] kontrak data dengan A42.
    * **BR-009**: Field `instalasi` wajib merujuk Instalasi valid & aktif di A19 (pengelompokan induk); field **`tipe_unit` (milik Unit) wajib** dan menentukan sub-menu sidebar & identifikasi unit gudang (BR-003/BR-007). Tipe Unit **independen** dari Instalasi induk (tidak lagi diwariskan A19).
* **Business Rules (Phase 2 — SATUSEHAT/FHIR)** `[**]`:
    * **BR-101**: Field mandatory FHIR (`name`, `mode`, `position.longitude/latitude`, `managingOrganization`) wajib sebelum kirim.
    * **BR-102**: `identifier` unit unik dalam satu `managingOrganization`.
    * **BR-103**: `partOf` tidak boleh menunjuk diri sendiri / membentuk siklus.
    * **BR-104**: `physicalType`=bed mengaktifkan `operationalStatus`; physicalType lain disembunyikan. [ASUMSI]
    * **BR-105**: Unit yang sudah dikirim SATUSEHAT memakai **PUT** (bukan POST) saat update, berbasis IHS Location ID.
    * **BR-106**: Kegagalan POST/PUT → data internal tersimpan `sync=pending` & dapat di-retry.
    * **BR-107**: `address` mengacu Master Wilayah (A32); tidak boleh free-text untuk prov/kab/kec/kel. [PERLU KONFIRMASI]

## 9. Workflow / BPMN Interpretation

> Tidak tersedia file BPMN khusus modul ini; interpretasi alur diturunkan dari Business Process (To-Be) & pola integrasi BPJS/SATUSEHAT pada BPMN Admisi `[ASUMSI]`.

### Flow Utama Phase 1 (To-Be)
```
[Admin Master Data]
   → Akses Menu Master Data - Unit
   → Pilih Tambah / Edit Unit
   → Pilih Instalasi induk (lookup A19, pengelompokan)
   → Pilih **Tipe Unit** (field Unit, 9 nilai) → menentukan perilaku:
        • Bila **Poli** → Unit ditambahkan ke sub-menu 'Poli' sidebar
        • Bila **Farmasi** → Unit ditambahkan ke sub-menu 'Farmasi' sidebar
        • Bila **Gudang** → Unit dikenali sebagai unit gudang untuk Inventori (A42)
        • Tipe lain → tanpa perilaku khusus
   → Input field inti: Kode Unit, Nama Unit, Keterangan, **Lantai (opsional)**, Status
[Sistem]
   → Validasi: Kode Unit unik + field wajib (Instalasi, Tipe Unit, Kode, Nama, Status) terisi
   → Validasi lookup: nilai Instalasi ada di master & aktif
   → (Valid?) ── Tidak → tampilkan error, kembali ke form
              └─ Ya  → simpan ke DB + catat audit log (aktor = Admin)
   → Unit tersedia sebagai referensi modul Pelayanan, Inventori (lokasi gudang), Rawat Inap, EMR, dll.
```

### Skenario Tambahan Phase 1
* **Ubah status unit**: Admin set Aktif/Nonaktif (soft delete) → unit nonaktif tidak dipilih transaksi baru, tetap tampil di histori.

### Flow Phase 2 (SATUSEHAT onboarding) `[**]`
```
[Admin] → Lengkapi field FHIR Location (mode/type/physicalType/position/managingOrganization/partOf/...)
[Sistem] → Validasi field mandatory FHIR & keunikan identifier
         → POST (baru) / PUT (update) ke SATUSEHAT Location
         → (Sukses?) ── Tidak → status 'pending sync' + retry
                      └─ Ya  → simpan IHS Location ID
         → Kelola hierarki partOf (tree) + operationalStatus bed
```

## Asumsi
- Atribut **`tipe_unit`** (enum 9 nilai: Gudang/Farmasi/Poli/Darurat/Bangsal/Penunjang Pemeriksaan/Penunjang Terapi/Penunjang Tindakan/Non Pelayanan) kini **field input pada Unit** (dipindah dari A19 v4.1, dinamai v4.2) — menentukan sub-menu sidebar & identifikasi unit gudang (A42). Tipe Unit independen dari Instalasi induk.
- [KEPUTUSAN v4.3] **Section Klasifikasi Unit DIHAPUS** — field Bangsal/Ruangan/Kamar/Bed tidak lagi diinput pada Unit (lookup A15/A16/A17 dilepas). Hanya **Lantai** (teks bebas, opsional) dipertahankan & masuk **field inti (Section 1)**. Konsekuensi: wajib-kondisional Bangsal, fitur Section Klasifikasi, & auto-update referensi klasifikasi dihapus.
- [ASUMSI] Relasi Unit→Instalasi (A19) berlaku Phase 1 sebagai field `instalasi`; pada Phase 2 dipetakan ke `managingOrganization` FHIR tanpa input ganda.
- [ASUMSI] Lookup Instalasi hanya menampilkan entitas master aktif.
- [ASUMSI] As-Is diturunkan dari pola umum RS Tipe C & D (pencatatan manual/tersebar), bukan BPMN khusus modul ini.
- [ASUMSI] Status Phase 1 aktif/nonaktif cukup untuk soft delete; nilai `suspended` (FHIR) baru relevan Phase 2.
- [KEPUTUSAN] Seluruh integrasi FHIR/BPJS/SATUSEHAT ditempatkan di Phase 2 (definitif); Phase 1 murni master data inti tanpa integrasi eksternal.
- [KEPUTUSAN] Field input `is_gudang` ('Apakah gudang?') **dihapus**; identifikasi unit gudang untuk Inventori (A42) diturunkan dari **Unit ber-`tipe_unit`=Gudang**.
- [KEPUTUSAN] Unit bertipe Poli/Farmasi menambahkan daftar unit sebagai sub-menu ('Poli'/'Farmasi') pada sidebar navigasi sistem.

## Pertanyaan Terbuka
- [Phase 1] Konfirmasi kontrak data dengan Inventori (A42): identifikasi unit gudang via Instalasi (A19) bertipe Gudang — apakah A42 setuju sumber ini menggantikan flag `is_gudang`? (BR-007)
- [Phase 1] Apakah `unit_code` di-generate otomatis oleh sistem atau diinput manual (atau keduanya dengan pola tertentu)?
- [Phase 2] Base URL & environment endpoint SATUSEHAT Location (sandbox vs production) serta versi FHIR yang dipakai?
- [Phase 2] Representasi `tipe_unit` (mis. Gudang, Bangsal) & field Lantai di FHIR (`physicalType`/`partOf`/extension)? *(Section Klasifikasi Unit dihapus v4.3.)*
- [Phase 2] Daftar enum resmi `kelas_perawatan` & `operationalStatus` bed untuk RS Tipe C & D?
- [Phase 2] Apakah modul Unit perlu pemetaan ke referensi BPJS (kode poli VClaim/Aplicares), mengingat nama modul menyebut 'BPJS V2'?
- [Phase 1] Perilaku sub-menu sidebar untuk Tipe Unit selain Poli/Farmasi (mis. Darurat/Gudang/Penunjang Pemeriksaan/Terapi/Tindakan/Non Pelayanan) — apakah perlu sub-menu tersendiri? (BR-003)
