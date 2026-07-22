# PRD — Master Data Master Program Terapi

**Related Document:** List Fitur V2.xlsx (Code N2, Cluster Control Panel); Draft N2-Master_Program_Terapi (user); Modul terkait: Order Penunjang, Asesmen Fisioterapi, Asesmen Terapi Okupasi, Asesmen Terapi Wicara. BPMN: N/A
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-07-16

## 1. Metadata Dokumen

* **Kode Fitur**: N2 · **Modul**: Master Data — Master Program Terapi · **Klaster**: Control Panel · **Target RS**: Tipe C & D · **Status**: Draft awal.
* **Approval**: [Nama Stakeholder, Jabatan, Tanggal]

| Peran | Nama | Jabatan | Tanggal |
|-------|------|---------|---------|
| Disusun oleh | [PIC PRD] | System Analyst | 2026-07-16 |
| Diperiksa oleh | [Nama] | Product Owner | [Tanggal] |
| Disetujui oleh | [Nama] | [Jabatan] | [Tanggal] |

* **Related Documents**:
    * Draft `N2-Master_Program_Terapi.md` (Main Goals, Feature Capabilities, Performance Expectation, Scope, Expected Improvement From V1).
    * List Fitur V2.xlsx — Code N2, Cluster Control Panel.
    * Modul konsumen: Order Penunjang, Asesmen Fisioterapi, Asesmen Terapi Okupasi, Asesmen Terapi Wicara.

* **Document Version**:

| Versi | Tanggal | Deskripsi Perubahan | Penyusun |
|-------|---------|---------------------|----------|
| 1.0 | 2026-07-16 | Rilis awal PRD N2 — Master Program Terapi & Master Intervensi Terapi. | [PIC PRD] |
| 1.1 | 2026-07-17 | Menambahkan Master Kategori Terapi sebagai pengelompokan dinamis dan terkontrol sekaligus sumber pembentukan menu terapi; Program wajib mereferensikan kategori melalui `category_id`. | [PIC PRD] |

## 2. Overview & Background

* **Overview/Brief Summary**:
**Master Program Terapi (N2)** adalah menu Master Data di klaster Control Panel yang memungkinkan rumah sakit mengelola tiga entitas layanan rehabilitasi: **Kategori Terapi** (mis. Radiologi Terapi, Fisioterapi, Terapi Wicara), **Program Terapi**, dan **Intervensi Terapi**. Kategori merupakan pengelompokan tingkat atas yang menentukan menu terapi; satu Kategori memiliki banyak Program dan satu Program memiliki banyak Intervensi. Ketiganya menjadi **single source of truth**, sehingga nama kategori/menu, program, dan tindakan tidak di-hardcode atau disalin lokal di modul konsumen.

Modul ini murni **master data + relasi hierarkis** (Kategori → Program → Intervensi). Kategori tidak berupa teks bebas pada Program: Program wajib menyimpan `category_id` yang menunjuk Master Kategori Terapi. Kategori dapat ditambah RS melalui UI oleh role berwenang, tetapi kode/menu key harus unik dan stabil, perubahan diaudit, dan kategori yang sudah dipakai tidak boleh dihapus permanen. Menu terapi dibentuk dari Kategori aktif yang dapat diakses user.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is**:
        * Daftar Program/Layanan Terapi dan Intervensi/Tindakan Terapi **ditanam (hardcode)** di source code aplikasi. [ASUMSI, sesuai draft V1]
        * Daftar tindakan **diduplikasi pada tiap modul rehabilitasi** — Order Penunjang punya daftarnya sendiri, form Asesmen Fisioterapi punya salinannya, Asesmen Terapi Okupasi dan Terapi Wicara punya salinan masing-masing. Akibatnya daftar rawan **tidak sinkron** antar modul.
        * Penambahan Program atau Intervensi baru (mis. RS membuka layanan terapi baru) **memerlukan change request ke developer, coding, testing, dan deployment ulang** aplikasi.
        * Karena daftar berbeda antar modul, petugas berisiko **memilih tindakan yang tidak sama** di Order vs Asesmen, menyulitkan rekap, audit, dan pelaporan.
        * Tidak ada keterlacakan terstruktur bahwa suatu tindakan pada Asesmen berasal dari Order tertentu (Rawat Jalan/Rawat Inap/Internal).
    * **To-Be**:
        * Kategori, Program, dan Intervensi Terapi dikelola terpusat melalui UI; **penambahan/perubahan tidak butuh deployment**.
        * Menu terapi dibentuk dinamis dari Master Kategori Terapi AKTIF sesuai hak akses. Aplikasi tidak memakai enum/daftar nama kategori hardcode.
        * Setiap Program wajib memilih satu Kategori dari lookup aktif (`category_id`), bukan mengetik nama kategori bebas.
        * Order Penunjang dan seluruh form Asesmen **membaca referensi dari Master yang sama** (single source of truth) — hanya menampilkan entitas berstatus **AKTIF**.
        * Intervensi dikaitkan ke Program (`program_id`) dan diatur **urutan tampil** (`display_order`) agar konsisten di semua modul.
        * Perubahan Master Data **langsung digunakan** pada Order dan Asesmen berikutnya, tanpa restart layanan.
        * Sistem menyimpan referensi Order pada Asesmen dan menyiapkan relasi Order → Pelaksanaan Terapi untuk kebutuhan histori, dashboard, dan pelaporan (dieksekusi di modul konsumen; N2 menyediakan master yang direferensikan).
        * **Phase 2**: pembuatan/perubahan Program & Intervensi dapat melewati **approval berjenjang** sebelum menjadi aktif; desain database sudah menyiapkan kolom `status_approval` dan `role_approver` sejak Phase 1.

* **Latar Belakang (ringkas)**:
    * RS Tipe C & D umumnya **tidak memiliki tim developer standby**, sehingga kebutuhan menambah/menyesuaikan layanan rehabilitasi harus dapat dilakukan mandiri oleh petugas Master Data secara cepat dan auditable.
    * Layanan rehabilitasi medik bersifat berkembang (RS dapat menambah modalitas/tindakan baru); ketergantungan pada hardcode menghambat kelincahan layanan.
    * Konsistensi daftar tindakan lintas modul (Order & Asesmen) adalah prasyarat untuk rekap pelayanan, penagihan, dan pelaporan yang akurat.

## 3. Goals & Metrics

**Tujuan fitur N2**: menghilangkan hardcode daftar Program & Intervensi terapi; menyediakan single source of truth yang dibaca Order Penunjang dan seluruh Asesmen; serta menjaga konsistensi dan keterlacakan tindakan rehabilitasi lintas modul.

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kemandirian penambahan Program Terapi | RS dapat menambah Program Terapi baru **tanpa deployment aplikasi** (100% via UI). |
| 2 | Kemandirian penambahan Intervensi | RS dapat menambah Intervensi baru **tanpa deployment aplikasi** (100% via UI). |
| 3 | Eliminasi hardcode | 0 daftar tindakan/program terapi tersimpan hardcode di source code setelah rilis. |
| 4 | Konsistensi lintas modul | 100% daftar Program & Intervensi yang tampil di Order Penunjang dan form Asesmen (Fisioterapi/Okupasi/Wicara) bersumber dari Master N2 (tidak ada salinan lokal). |
| 5 | Performa tampil Program | Waktu menampilkan daftar Program Terapi (aktif) **< 300 ms**. |
| 6 | Performa tampil Intervensi | Waktu menampilkan daftar Intervensi (per Program, aktif) **< 500 ms**. |
| 7 | Keterlacakan | 100% Intervensi memiliki keterkaitan ke Program (`program_id` wajib), mendukung rantai Order → Program → Intervensi → Asesmen → Pelaksanaan. |
| 8 | Integritas data | 0 kasus penghapusan Program/Intervensi yang masih direferensikan Order/Asesmen aktif (dicegah oleh Business Rules; alternatif = nonaktif). |

> Catatan: target angka performa (metrik 5 & 6) mengacu pada draft user (Performance Expectation). Target adopsi/kualitas lain yang bersifat manajerial → [PERLU KONFIRMASI] ke manajemen RS.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| Master Kategori Terapi | CRUD terkontrol oleh Admin Master Data, kode/menu key unik, toggle Aktif/Nonaktif, urutan menu, audit trail. Kategori baru langsung aktif pada Phase 1. | Approval wajib untuk tambah/ubah kategori karena berdampak pada struktur menu lintas modul. |
| Master Program Terapi | CRUD Program (Tambah, Ubah, Detail), toggle Aktif/Nonaktif, atur urutan tampil (`display_order`), pencarian & filter. Status saat create selalu AKTIF. | Approval berjenjang untuk create/edit Program (DRAFT → MENUNGGU_APPROVAL → DISETUJUI/DITOLAK). Kolom `status_approval`, `role_approver` sudah ada sejak Phase 1. |
| Master Intervensi Terapi | CRUD Intervensi, relasi wajib ke Program (`program_id`), toggle Aktif/Nonaktif, atur urutan tampil per Program, pencarian & filter per Program. | Approval berjenjang untuk create/edit Intervensi; escalation bila tidak diproses dalam SLA. [ASUMSI SLA] |
| Relasi Program ↔ Intervensi | Pengaturan Intervensi berdasarkan Program (1 Program → N Intervensi); pengaturan urutan tampil Intervensi. | — (stabil, tanpa perubahan Phase 2). |
| Konsumsi oleh modul lain | Menyediakan endpoint read (list aktif) untuk Order Penunjang & Asesmen (Fisioterapi/Okupasi/Wicara). | — (kontrak read tetap; hanya entitas DISETUJUI+AKTIF yang tampil). |
| Audit Trail | Pencatatan aksi tambah/ubah/aktivasi/nonaktif (user, role, waktu, before/after). | Pencatatan aksi approval/penolakan + jejak approver. |

**Out of Scope**:
* Logika **Order Penunjang** itu sendiri (pembuatan order, alur order RJ/RI) — modul terpisah; N2 hanya menyediakan master yang dibaca.
* Logika **Asesmen** (form pengisian asesmen Fisioterapi/Okupasi/Wicara, penilaian klinis) — modul terpisah; N2 hanya menyediakan master.
* **Pelaksanaan Terapi** (eksekusi & pencatatan tindakan saat dilakukan) — modul terpisah; N2 menyediakan referensi Intervensi yang dieksekusi.
* **Tarif** tindakan/terapi — dikelola di Master Data Tarif (di luar N2). [PERLU KONFIRMASI] apakah Intervensi perlu tautan ke item tarif.
* **Penjadwalan** terapi & manajemen antrian rehabilitasi.
* **Pelaporan/dashboard** analitik pelayanan rehabilitasi (N2 menyiapkan data referensinya, laporan dibangun di modul pelaporan).

## 5. Related Features

| Fitur/Modul | Relasi Teknis/Bisnis dengan N2 |
|-------------|-------------------------------|
| **Order Penunjang** | Konsumen. Mengambil daftar **Program** dan **Intervensi** berstatus AKTIF dari Master N2 saat membuat order terapi. Order menyimpan `program_id` dan `intervention_id` sebagai referensi (bukan menyalin nama), sehingga tercatat asal order (Rawat Jalan/Rawat Inap/Internal). |
| **Asesmen Fisioterapi** | Konsumen. Form asesmen memilih Program & Intervensi dari Master N2 yang sama; menyimpan referensi Order (bila asesmen berasal dari Order Penunjang) agar diketahui tindakan berasal dari Order RI/RJ. |
| **Asesmen Terapi Okupasi** | Konsumen. Sama seperti Asesmen Fisioterapi — membaca Master N2 (Program Terapi Okupasi & Intervensinya). |
| **Asesmen Terapi Wicara** | Konsumen. Sama seperti Asesmen Fisioterapi — membaca Master N2 (Program Terapi Wicara & Intervensinya). |
| **Pelaksanaan Terapi** | Konsumen tidak langsung. Mereferensikan Intervensi yang dilaksanakan; menutup rantai keterlacakan Order → Program → Intervensi → Asesmen → Pelaksanaan. [ASUMSI] modul terpisah. |
| **RBAC / Admin** | Mengontrol Role yang boleh mengelola Master Program/Intervensi Terapi dan (Phase 2) yang bertindak sebagai approver. [ASUMSI] mengikuti modul RBAC RS. |

> Relasi keterlacakan (Order menyimpan referensi ke Program/Intervensi; Asesmen menyimpan referensi Order) diimplementasikan di sisi modul konsumen. N2 menjamin ketersediaan identitas stabil (`id` UUID) untuk direferensikan.

## 6. Business Process & User Stories

* **State Machine Table** (berlaku untuk entitas **Program** maupun **Intervensi**):

| Status | Deskripsi | Efek (Ketersediaan di Order/Asesmen) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|--------------------------------------|--------------------|--------------------|
| AKTIF | Entitas berlaku dan dapat dipilih. Status default saat create (Phase 1). | **Tampil & dapat dipilih** di Order Penunjang dan form Asesmen. | AKTIF → NONAKTIF (toggle di Dashboard) | DISETUJUI → AKTIF (setelah approval); AKTIF → NONAKTIF |
| NONAKTIF | Entitas dinonaktifkan sementara tanpa dihapus. Referensi histori tetap utuh. | **Tidak tampil** untuk pemilihan baru; data lama yang sudah mereferensikan tetap valid (tampil sebagai histori). | NONAKTIF → AKTIF (toggle di Dashboard) | NONAKTIF → AKTIF |
| DRAFT | *(Phase 2)* Entitas dibuat namun belum diajukan approval. | Tidak tampil di Order/Asesmen. | — (tidak dipakai di Phase 1) | DRAFT → MENUNGGU_APPROVAL; DRAFT → (hapus draft) |
| MENUNGGU_APPROVAL | *(Phase 2)* Menunggu persetujuan approver berdasarkan `role_approver`. | Tidak tampil di Order/Asesmen. | — | MENUNGGU_APPROVAL → DISETUJUI / DITOLAK |
| DISETUJUI | *(Phase 2)* Disetujui approver; siap diaktifkan. | Menjadi AKTIF (tampil). | — | DISETUJUI → AKTIF |
| DITOLAK | *(Phase 2)* Ditolak approver disertai alasan. | Tidak tampil di Order/Asesmen. | — | DITOLAK → DRAFT (revisi & ajukan ulang) |

> **Phase 1**: hanya kolom `is_active` yang aktif dipakai (AKTIF/NONAKTIF). Kolom `status_approval` dibuat sejak Phase 1 dengan nilai default `DISETUJUI` (auto, tanpa alur approval) agar migrasi ke Phase 2 tidak mengubah skema. Toggle aktif/nonaktif dilakukan di Dashboard, **bukan** di form create/edit.

* **User Stories Utama**:
    * **US-001**: Sebagai **Admin Master Data**, saya ingin menambah Program Terapi baru (mis. Fisioterapi), agar RS dapat menyediakan layanan rehabilitasi baru tanpa menunggu deployment aplikasi.
    * **US-002**: Sebagai **Admin Master Data**, saya ingin mengubah data Program Terapi, agar informasi program tetap akurat mengikuti kebijakan RS.
    * **US-003**: Sebagai **Admin Master Data**, saya ingin menambah Intervensi Terapi dan mengaitkannya ke sebuah Program, agar tindakan spesifik terkelola di bawah program yang tepat.
    * **US-004**: Sebagai **Admin Master Data**, saya ingin mengubah data Intervensi Terapi, agar detail tindakan tetap relevan.
    * **US-005**: Sebagai **Admin Master Data**, saya ingin mengatur urutan tampil Intervensi dalam satu Program, agar daftar tindakan tampil runut di seluruh modul.
    * **US-006**: Sebagai **Admin Master Data**, saya ingin mengaktifkan/menonaktifkan Program maupun Intervensi tanpa menghapusnya, agar dapat menyembunyikan tindakan yang tidak dipakai tanpa merusak histori.
    * **US-007**: Sebagai **Admin Master Data**, saya ingin mencari & memfilter daftar Program/Intervensi (per status, per program), agar mudah mengelola banyak data.
    * **US-008**: Sebagai **Petugas Order Penunjang**, saya ingin memilih Program & Intervensi dari daftar master yang sama, agar order terapi konsisten dan tercatat rujukannya.
    * **US-009**: Sebagai **Terapis (Fisioterapi/Okupasi/Wicara)**, saya ingin form Asesmen menampilkan daftar Program & Intervensi yang identik dengan Order, agar tidak terjadi perbedaan tindakan antar modul.
    * **US-010**: Sebagai **Manajemen RS/Auditor**, saya ingin setiap perubahan Master terekam (siapa, kapan, sebelum/sesudah), agar perubahan layanan rehabilitasi dapat diaudit.
    * **US-011** *(Phase 2)*: Sebagai **Supervisor Rehabilitasi/Approver**, saya ingin menyetujui atau menolak pengajuan Program/Intervensi baru sebelum aktif, agar hanya data tervalidasi yang dipakai lintas modul.
    * **US-012**: Sebagai **Admin Master Data**, saya ingin mengelola Kategori Terapi secara terkontrol, agar RS dapat menambah jenis/menu terapi tanpa deployment dan tanpa menimbulkan variasi nama kategori yang tidak seragam.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-000 — Kelola Kategori Terapi**
* **User Story**: US-012.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Hanya role Admin Master Data yang berhak menambah, mengubah, mengurutkan, mengaktifkan, atau menonaktifkan Kategori Terapi.
    * **AC 2**: Form kategori memuat Nama Kategori, Kode Kategori/menu key, dan Urutan Menu. Nama dan kode wajib serta unik secara case-insensitive setelah trim; kode hanya menerima huruf kapital, angka, dan underscore.
    * **AC 3**: Menu terapi dibentuk dari Kategori berstatus AKTIF dan diurutkan berdasarkan `display_order`; kategori tidak boleh ditulis sebagai enum atau daftar nama hardcode di source code.
    * **AC 4**: Kategori yang sudah direferensikan Program atau histori transaksi tidak boleh dihapus permanen. Penonaktifan menyembunyikan kategori beserta Program/Intervensinya dari pilihan dan menu baru tanpa mengubah histori.
    * **AC 5**: Perubahan `category_code` pada kategori yang sudah digunakan ditolak; admin hanya boleh mengubah nama tampil, urutan, dan status. Semua perubahan tercatat di Audit Trail.
    * **AC 6**: Pada Phase 2, kategori baru/perubahan kategori wajib melalui approval sebelum memengaruhi menu terapi.

**Fitur: FR-001 — Tambah Program Terapi**
* **User Story**: US-001. Sebagai Admin Master Data, saya ingin menambah Program Terapi baru, agar RS dapat menyediakan layanan rehabilitasi baru tanpa deployment.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Tambah Program menampilkan field: Kategori Terapi (wajib, lookup kategori AKTIF), Nama Program (wajib), Kode Program (opsional/auto), Deskripsi (opsional), Urutan Tampil (opsional). Field **Status TIDAK ada** di form; sistem set `is_active = true` dan `status_approval = DISETUJUI` otomatis.
    * **AC 2**: Menyimpan tanpa Nama Program menampilkan error validasi dan data tidak tersimpan.
    * **AC 3**: Menyimpan Nama Program yang duplikat (case-insensitive, trim) dalam Kategori yang sama ditolak; nama sama boleh digunakan pada Kategori berbeda.
    * **AC 4**: Setelah simpan berhasil, Program baru muncul di Dashboard dengan badge status AKTIF dan tercatat di Audit Trail (aksi Tambah, user, waktu).
    * **AC 5**: Program baru berstatus AKTIF langsung tersedia dibaca modul Order Penunjang & Asesmen tanpa restart layanan.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kategori Terapi | Dropdown lookup | Required, hanya Kategori AKTIF | "Kategori Terapi wajib dipilih" | "Kategori menentukan menu tempat Program ditampilkan" |
  | Nama Program | Text | Required, Max 100, unik (case-insensitive) | "Nama Program wajib diisi" / "Nama Program sudah ada" | "Contoh: Fisioterapi, Terapi Okupasi, Terapi Wicara" |
  | Kode Program | Text | Optional, Max 20, unik bila diisi, alfanumerik | "Kode Program sudah digunakan" | "Kosongkan untuk dibuat otomatis oleh sistem" |
  | Deskripsi | Textarea | Optional, Max 255 | "Deskripsi maksimal 255 karakter" | "Penjelasan singkat program (opsional)" |
  | Urutan Tampil | Number | Optional, integer >= 1 | "Urutan tampil harus angka positif" | "Menentukan posisi tampil; kosong = urut terakhir" |

**Fitur: FR-002 — Ubah Program Terapi**
* **User Story**: US-002.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Edit menampilkan data existing; field Status tidak dapat diubah dari form ini (dikelola via toggle Dashboard).
    * **AC 2**: Validasi sama dengan Tambah (Nama wajib & unik terhadap program AKTIF lain selain dirinya).
    * **AC 3**: Perubahan tersimpan mencatat before/after di Audit Trail.
    * **AC 4**: Perubahan nama Program tidak memutus referensi Intervensi/Order/Asesmen yang memakai `id` Program (referensi berbasis `id`, bukan nama).

**Fitur: FR-003 — Toggle Aktif/Nonaktif Program (Dashboard)**
* **User Story**: US-006.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Toggle status dilakukan dari Dashboard/List (bukan form create).
    * **AC 2**: Menonaktifkan Program menyembunyikannya dari pilihan baru di Order & Asesmen, tetapi data lama yang mereferensikannya tetap valid.
    * **AC 3**: Menonaktifkan Program yang masih memiliki Intervensi AKTIF menampilkan konfirmasi peringatan (Intervensi turut tidak terpilih bila Program nonaktif). [ASUMSI perilaku cascade tampilan]
    * **AC 4**: Aksi aktivasi/nonaktif tercatat di Audit Trail.

**Fitur: FR-004 — Tambah Intervensi Terapi (terkait Program)**
* **User Story**: US-003.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Tambah Intervensi mewajibkan pemilihan **Program** (dropdown dari Program AKTIF) dan **Nama Intervensi**. Field Status tidak ada; sistem set AKTIF otomatis.
    * **AC 2**: Menyimpan tanpa Program atau tanpa Nama Intervensi ditolak dengan error.
    * **AC 3**: Nama Intervensi duplikat **dalam Program yang sama** (case-insensitive) ditolak; nama sama diperbolehkan lintas Program berbeda. [ASUMSI]
    * **AC 4**: Intervensi baru muncul di daftar Intervensi Program terkait, urut sesuai `display_order`, dan tercatat di Audit Trail.
* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Program | Dropdown | Required, hanya Program AKTIF | "Program wajib dipilih" | "Pilih program induk intervensi ini" |
  | Nama Intervensi | Text | Required, Max 100, unik dalam Program | "Nama Intervensi wajib diisi" / "Nama Intervensi sudah ada dalam Program ini" | "Contoh: Latihan ROM, Terapi Artikulasi" |
  | Kode Intervensi | Text | Optional, Max 20, unik bila diisi | "Kode Intervensi sudah digunakan" | "Kosongkan untuk dibuat otomatis" |
  | Deskripsi | Textarea | Optional, Max 255 | "Deskripsi maksimal 255 karakter" | "Penjelasan singkat tindakan (opsional)" |
  | Urutan Tampil | Number | Optional, integer >= 1 | "Urutan tampil harus angka positif" | "Posisi tampil dalam program; kosong = urut terakhir" |

**Fitur: FR-005 — Ubah Intervensi Terapi**
* **User Story**: US-004.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Edit menampilkan data existing termasuk Program induk; memindahkan Intervensi ke Program lain diperbolehkan (mengubah `program_id`) dengan validasi keunikan nama pada Program tujuan. [ASUMSI]
    * **AC 2**: Validasi keunikan nama dalam Program tujuan berlaku.
    * **AC 3**: Perubahan tercatat before/after di Audit Trail.

**Fitur: FR-006 — Toggle Aktif/Nonaktif Intervensi (Dashboard)**
* **User Story**: US-006.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Toggle dari Dashboard/List Intervensi.
    * **AC 2**: Intervensi nonaktif tidak dapat dipilih baru di Order/Asesmen; referensi lama tetap valid.
    * **AC 3**: Aksi tercatat di Audit Trail.

**Fitur: FR-007 — Atur Urutan Tampil Intervensi**
* **User Story**: US-005.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat mengubah `display_order` Intervensi dalam satu Program (mis. drag-and-drop atau input angka).
    * **AC 2**: Urutan tersimpan konsisten dan dipakai saat Intervensi ditampilkan di Order & Asesmen.
    * **AC 3**: Perubahan urutan tercatat di Audit Trail (ringkas). [ASUMSI]

**Fitur: FR-008 — Dashboard/List Program & Intervensi (Cari & Filter)**
* **User Story**: US-007.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: List Program menampilkan kolom Nama, Kode, Jumlah Intervensi, Urutan, Status; mendukung pencarian nama dan filter status.
    * **AC 2**: List Intervensi difilter per Program dan per status; mendukung pencarian nama.
    * **AC 3**: Toggle aktif/nonaktif tersedia langsung dari list.

**Fitur: FR-009 — Endpoint Read untuk Modul Konsumen (Order & Asesmen)**
* **User Story**: US-008, US-009.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Tersedia endpoint list Program AKTIF dan list Intervensi AKTIF per Program yang dipanggil Order Penunjang & form Asesmen.
    * **AC 2**: Endpoint hanya mengembalikan entitas berstatus AKTIF (dan Phase 2: DISETUJUI+AKTIF).
    * **AC 3**: Respons list Program < 300 ms dan list Intervensi < 500 ms pada kondisi data wajar (lihat NFR).

**Fitur: FR-010 — Audit Trail Perubahan Master**
* **User Story**: US-010.
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap aksi tambah/ubah/aktivasi/nonaktif Program & Intervensi tercatat: user, role, timestamp, data before, data after.
    * **AC 2**: Audit Trail tidak dapat diedit/dihapus oleh user (immutable).

**Fitur: FR-011 — Approval Berjenjang Program & Intervensi (Phase 2)**
* **User Story**: US-011.
* **Prioritas**: P3
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Pengajuan Program/Intervensi baru masuk status MENUNGGU_APPROVAL; hanya `role_approver` yang dapat menyetujui/menolak.
    * **AC 2**: Persetujuan mengubah status ke DISETUJUI lalu AKTIF; penolakan mengubah ke DITOLAK dengan alasan wajib.
    * **AC 3**: Seluruh langkah approval tercatat di Audit Trail (siapa approver, kapan, keputusan, alasan).
    * **AC 4**: Skema database tidak berubah dari Phase 1 (kolom `status_approval` & `role_approver` sudah tersedia).

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `therapy_program`**
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | Identitas stabil, direferensikan Order/Intervensi/Asesmen |
| `category_id` | UUID (FK → therapy_category.id), NOT NULL | Kategori/menu induk Program; wajib berupa referensi master, bukan teks bebas |
| `program_code` | VARCHAR(20), UNIQUE, NULLABLE | Kode program; auto-generate bila kosong |
| `program_name` | VARCHAR(100), NOT NULL | Nama program (mis. Fisioterapi) — unik case-insensitive antar program aktif |
| `description` | VARCHAR(255), NULLABLE | Deskripsi singkat |
| `display_order` | INT, NULLABLE | Urutan tampil |
| `is_active` | BOOLEAN, DEFAULT true | Status aktif/nonaktif (Phase 1) |
| `status_approval` | VARCHAR(20), DEFAULT 'DISETUJUI' | Phase 2: DRAFT/MENUNGGU_APPROVAL/DISETUJUI/DITOLAK. Phase 1 default DISETUJUI |
| `role_approver` | VARCHAR(50), NULLABLE | Phase 2: role yang berhak approve; NULL di Phase 1 |
| `created_by` | UUID/VARCHAR | User pembuat |
| `created_at` | TIMESTAMP | Waktu buat |
| `updated_by` | UUID/VARCHAR, NULLABLE | User pengubah terakhir |
| `updated_at` | TIMESTAMP, NULLABLE | Waktu ubah terakhir |

**Table: `therapy_intervention`**
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | Identitas stabil, direferensikan Order/Asesmen/Pelaksanaan |
| `program_id` | UUID (FK → therapy_program.id), NOT NULL | Relasi wajib ke Program |
| `intervention_code` | VARCHAR(20), UNIQUE, NULLABLE | Kode intervensi; auto-generate bila kosong |
| `intervention_name` | VARCHAR(100), NOT NULL | Nama intervensi — unik case-insensitive dalam satu `program_id` |
| `description` | VARCHAR(255), NULLABLE | Deskripsi singkat |
| `display_order` | INT, NULLABLE | Urutan tampil dalam program |
| `is_active` | BOOLEAN, DEFAULT true | Status aktif/nonaktif (Phase 1) |
| `status_approval` | VARCHAR(20), DEFAULT 'DISETUJUI' | Phase 2 (sama dengan program) |
| `role_approver` | VARCHAR(50), NULLABLE | Phase 2 |
| `created_by` | UUID/VARCHAR | User pembuat |
| `created_at` | TIMESTAMP | Waktu buat |
| `updated_by` | UUID/VARCHAR, NULLABLE | User pengubah terakhir |
| `updated_at` | TIMESTAMP, NULLABLE | Waktu ubah terakhir |

**Index/Constraint**:
* `therapy_program.category_id` → FK ke `therapy_category.id` (ON DELETE RESTRICT).
* `therapy_intervention.program_id` → FK ke `therapy_program.id` (ON DELETE RESTRICT — cegah hapus Program yang masih punya Intervensi).
* Unique composite `(program_id, LOWER(intervention_name))` untuk keunikan nama intervensi dalam program.
* Unique composite `(category_id, LOWER(program_name))` pada program aktif untuk keunikan nama program dalam kategori.
* Index `(is_active, display_order)` pada kedua tabel untuk mempercepat query list aktif terurut (mendukung target performa).

**Table pendukung (opsional): `therapy_master_audit`** — `id`, `entity_type` (program/intervention), `entity_id`, `action_type` (CREATE/UPDATE/ACTIVATE/DEACTIVATE/APPROVE/REJECT), `data_before` (JSON), `data_after` (JSON), `actor_user`, `actor_role`, `created_at`. [ASUMSI] dapat memakai modul Audit Trail terpusat RS bila tersedia.

> Referensi lintas modul (di modul konsumen, **bukan** dibuat di N2): Order menyimpan `program_id` & `intervention_id`; Asesmen menyimpan `order_id` + `intervention_id`; Pelaksanaan menyimpan `intervention_id`. Ini menutup rantai Order → Program → Intervensi → Asesmen → Pelaksanaan Terapi.

**Table: `therapy_category`**
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | Identitas stabil kategori |
| `category_code` | VARCHAR(30), NOT NULL, UNIQUE | Kode/menu key stabil; format `^[A-Z0-9_]+$`; tidak dapat diubah setelah digunakan |
| `category_name` | VARCHAR(100), NOT NULL | Nama yang tampil sebagai menu; unik case-insensitive di antara kategori aktif |
| `display_order` | INT, NULLABLE | Urutan menu; kosong = urut terakhir |
| `is_active` | BOOLEAN, DEFAULT true | Menentukan ketersediaan kategori/menu untuk transaksi baru |
| `status_approval` | VARCHAR(20), DEFAULT 'DISETUJUI' | Phase 2: status approval kategori |
| `created_by`, `created_at`, `updated_by`, `updated_at` | Audit columns | Identitas dan waktu perubahan |

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/therapy-categories` | List Kategori; modul menu memakai filter `is_active=true` dan hak akses user |
| POST | `/api/v1/therapy-categories` | Create Kategori oleh role berwenang |
| PUT | `/api/v1/therapy-categories/{id}` | Update nama/urutan Kategori; kode terkunci setelah digunakan |
| PATCH | `/api/v1/therapy-categories/{id}/status` | Toggle Aktif/Nonaktif Kategori |
| GET | `/api/v1/therapy-programs` | List Program (filter: `is_active`, `search`, sort `display_order`) |
| GET | `/api/v1/therapy-programs/{id}` | Detail satu Program |
| POST | `/api/v1/therapy-programs` | Create Program (status default AKTIF/DISETUJUI) |
| PUT | `/api/v1/therapy-programs/{id}` | Update Program |
| PATCH | `/api/v1/therapy-programs/{id}/status` | Toggle Aktif/Nonaktif Program (Dashboard) |
| PATCH | `/api/v1/therapy-programs/reorder` | Ubah urutan tampil beberapa Program |
| GET | `/api/v1/therapy-programs/{id}/interventions` | List Intervensi milik satu Program |
| GET | `/api/v1/interventions` | List Intervensi (filter: `program_id`, `is_active`, `search`) |
| GET | `/api/v1/interventions/{id}` | Detail satu Intervensi |
| POST | `/api/v1/interventions` | Create Intervensi (wajib `program_id`) |
| PUT | `/api/v1/interventions/{id}` | Update Intervensi |
| PATCH | `/api/v1/interventions/{id}/status` | Toggle Aktif/Nonaktif Intervensi (Dashboard) |
| PATCH | `/api/v1/interventions/reorder` | Ubah urutan tampil Intervensi dalam satu Program |
| GET | `/api/v1/therapy-programs?is_active=true` | (Konsumsi Order/Asesmen) Hanya Program AKTIF |
| POST | `/api/v1/therapy-programs/{id}/approve` | *(Phase 2)* Setujui/tolak pengajuan Program |
| POST | `/api/v1/interventions/{id}/approve` | *(Phase 2)* Setujui/tolak pengajuan Intervensi |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

**A. Form Program Terapi (FR-001 / FR-002)**
| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| category_id | Kategori Terapi | Dropdown (lookup) | Ya | Harus Kategori AKTIF | Lookup `therapy_category` | Menentukan menu tempat Program ditampilkan; bukan input teks bebas |
| program_name | Nama Program | Text | Ya | Max 100, unik (case-insensitive) antar program aktif | Manual | Contoh: Fisioterapi, Terapi Okupasi, Terapi Wicara |
| program_code | Kode Program | Text | Tidak | Max 20, unik bila diisi, alfanumerik | Manual/auto-generate | Kosong = dibuat otomatis |
| description | Deskripsi | Textarea | Tidak | Max 255 | Manual | Opsional |
| display_order | Urutan Tampil | Number | Tidak | Integer >= 1 | Manual | Kosong = urut terakhir |
| — | Status | — | — | — | Sistem | **Tidak ada di form**; set AKTIF otomatis (toggle di Dashboard) |

**B. Form Intervensi Terapi (FR-004 / FR-005)**
| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| program_id | Program | Dropdown (lookup) | Ya | Harus Program berstatus AKTIF | Lookup `therapy_program` | Menentukan program induk |
| intervention_name | Nama Intervensi | Text | Ya | Max 100, unik (case-insensitive) dalam program terpilih | Manual | Contoh: Latihan ROM, Terapi Artikulasi |
| intervention_code | Kode Intervensi | Text | Tidak | Max 20, unik bila diisi | Manual/auto-generate | Kosong = otomatis |
| description | Deskripsi | Textarea | Tidak | Max 255 | Manual | Opsional |
| display_order | Urutan Tampil | Number | Tidak | Integer >= 1 | Manual | Urut dalam program; kosong = urut terakhir |
| — | Status | — | — | — | Sistem | **Tidak ada di form**; set AKTIF otomatis (toggle di Dashboard) |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

**A. List Program Terapi (FR-008)**
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Kategori Terapi | therapy_category.category_name (via category_id) | Text | Filter, Sort | Menentukan menu induk |
| Nama Program | program_name | Text | Search, Sort A-Z | |
| Kode Program | program_code | Text | Sort | |
| Jumlah Intervensi | COUNT(therapy_intervention WHERE program_id) | Angka | Sort | Intervensi aktif/total [ASUMSI tampil "aktif/total"] |
| Urutan Tampil | display_order | Angka | Sort | |
| Status | is_active | Badge (AKTIF hijau / NONAKTIF abu) | Filter | Toggle langsung dari list |
| Aksi | — | Tombol (Detail/Edit/Toggle) | — | |

**B. List Intervensi Terapi (FR-008)**
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Program | therapy_program.program_name (via program_id) | Text | Filter per Program | |
| Nama Intervensi | intervention_name | Text | Search, Sort | |
| Kode Intervensi | intervention_code | Text | Sort | |
| Urutan Tampil | display_order | Angka | Sort (default) | Urut dalam program |
| Status | is_active | Badge (AKTIF/NONAKTIF) | Filter | Toggle langsung dari list |
| Aksi | — | Tombol (Detail/Edit/Toggle/Reorder) | — | |

**Business Rules**:
* **BR-000**: Kategori Terapi adalah master referensi terkontrol, bukan enum/hardcode dan bukan teks bebas. Setiap Program WAJIB memiliki `category_id` valid.
* **BR-001**: Setiap Intervensi WAJIB memiliki `program_id` (tidak boleh Intervensi tanpa Program).
* **BR-002**: Status saat create SELALU AKTIF (`is_active = true`, `status_approval = DISETUJUI` di Phase 1) — tidak ada input status di form; pengaturan aktif/nonaktif hanya via toggle Dashboard.
* **BR-003**: Order Penunjang & form Asesmen HANYA menampilkan Program/Intervensi berstatus AKTIF (Phase 2: AKTIF + DISETUJUI) sebagai pilihan baru.
* **BR-004**: Program/Intervensi yang sudah direferensikan Order/Asesmen TIDAK boleh dihapus permanen; gunakan Nonaktif (soft) demi integritas histori (FK ON DELETE RESTRICT).
* **BR-005**: Nama Kategori unik lintas RS; Nama Program unik dalam satu Kategori; Nama Intervensi unik dalam satu Program (semua case-insensitive pada data aktif).
* **BR-006**: Referensi antar modul memakai `id` (UUID) yang stabil, bukan nama; mengganti nama tidak memutus referensi.
* **BR-007**: Perubahan Master (tambah/ubah/aktivasi/nonaktif) langsung berlaku untuk Order/Asesmen berikutnya tanpa restart layanan; transaksi Order/Asesmen yang sudah tercatat tetap merujuk data historis (snapshot referensi via `id`).
* **BR-008**: Menonaktifkan Program menyebabkan Intervensi di bawahnya tidak dapat dipilih baru (efek tampilan), namun status Intervensi individual tidak diubah otomatis. [ASUMSI — perlu konfirmasi apakah cascade nonaktif diinginkan].
* **BR-009**: Seluruh aksi tercatat di Audit Trail minimal: user, role, timestamp, data before, data after (FR-010).
* **BR-010** *(Phase 2)*: Program/Intervensi berstatus DRAFT/MENUNGGU_APPROVAL/DITOLAK tidak tampil di modul konsumen; hanya `role_approver` yang boleh menyetujui.
* **BR-011**: Menu terapi hanya bersumber dari Kategori AKTIF yang diizinkan oleh RBAC, diurutkan dengan `display_order`, dan menggunakan `category_code` sebagai key stabil. Semua kategori membuka layar generik (mis. `/terapi/{category_code}`), bukan route/komponen berbeda yang di-hardcode per nama kategori.
* **BR-012**: Menonaktifkan Kategori membuat Program dan Intervensi turunannya tidak tersedia untuk transaksi/menu baru tanpa mengubah `is_active` masing-masing; referensi histori tetap dapat dibaca.

## 9. Workflow / BPMN Interpretation

**BPMN tidak tersedia untuk N2** — alur berikut adalah interpretasi [ASUMSI] berdasarkan draft user dan pola Master Data existing di klaster Control Panel.

**Alur 1 — Tambah Program Terapi (Phase 1)**
1. Admin Master Data membuka menu Master Program Terapi → tab Program → klik "Tambah Program".
2. Admin mengisi form (Nama Program wajib; Kode, Deskripsi, Urutan opsional). Field Status tidak tampil.
3. Sistem memvalidasi mandatory & keunikan nama.
   * Gateway: Nama valid & unik? **Tidak** → tampilkan error, tetap di form. **Ya** → lanjut.
4. Sistem menyimpan Program dengan `is_active = true`, `status_approval = DISETUJUI`, mencatat Audit Trail.
5. Event akhir: "Program Terapi tersimpan (AKTIF)" — langsung tersedia untuk Order & Asesmen.

**Alur 2 — Tambah Intervensi Terapi (Phase 1)**
1. Admin membuka tab Intervensi → klik "Tambah Intervensi".
2. Admin memilih Program (dropdown Program AKTIF), mengisi Nama Intervensi (wajib), Kode/Deskripsi/Urutan (opsional).
3. Sistem memvalidasi mandatory, Program AKTIF, dan keunikan nama dalam Program.
   * Gateway: Valid? **Tidak** → error. **Ya** → lanjut.
4. Sistem menyimpan Intervensi (`program_id` terisi, AKTIF), menempatkan sesuai `display_order`, mencatat Audit Trail.
5. Event akhir: "Intervensi tersimpan (AKTIF)".

**Alur 3 — Toggle Aktif/Nonaktif (Dashboard)**
1. Admin membuka Dashboard/List Program atau Intervensi.
2. Admin menekan toggle status pada baris terkait.
   * Gateway (nonaktif Program): Program masih punya Intervensi AKTIF? **Ya** → tampilkan konfirmasi dampak. **Tidak** → lanjut.
3. Sistem mengubah `is_active`, mencatat Audit Trail.
4. Efek: entitas nonaktif hilang dari pilihan baru di Order/Asesmen; referensi lama tetap valid.

**Alur 4 — Konsumsi oleh Order Penunjang & Asesmen (lintas modul, konteks)**
1. Petugas Order Penunjang membuat order terapi → sistem memanggil `GET /api/v1/therapy-programs?is_active=true` lalu `.../interventions` per Program.
2. Petugas memilih Program & Intervensi → Order menyimpan `program_id` & `intervention_id` (referensi, bukan salinan nama) + konteks asal (RJ/RI/Internal).
3. Saat Asesmen dibuat (dari Order tsb), form Asesmen membaca Master yang sama dan menyimpan `order_id` sebagai referensi.
4. Pelaksanaan Terapi mereferensikan `intervention_id` — menutup rantai Order → Program → Intervensi → Asesmen → Pelaksanaan untuk histori, dashboard, dan pelaporan.
> Langkah Alur 4 berada di modul konsumen (Out of Scope N2); dicantumkan sebagai konteks keterlacakan yang difasilitasi Master N2.

**Alur 5 — Approval Berjenjang (Phase 2)**
1. Admin membuat Program/Intervensi → status DRAFT → ajukan → MENUNGGU_APPROVAL.
2. Approver (`role_approver`) meninjau.
   * Gateway: Disetujui? **Ya** → DISETUJUI → AKTIF. **Tidak** → DITOLAK (alasan wajib) → dapat direvisi (kembali DRAFT).
3. Seluruh keputusan tercatat di Audit Trail.

## Asumsi

- N2 belum memiliki BPMN sendiri; seluruh alur (Workflow §9) dan proses To-Be diturunkan secara analogi dari draft user dan pola Master Data existing klaster Control Panel, ditandai [ASUMSI].
- Status entitas saat create selalu AKTIF; kolom status_approval dibuat sejak Phase 1 (default DISETUJUI) agar transisi ke approval berjenjang Phase 2 tidak mengubah skema database.
- Nama Intervensi unik dalam satu Program (boleh sama lintas Program berbeda); Nama Program unik case-insensitive antar program aktif.
- Referensi lintas modul (Order menyimpan program_id/intervention_id, Asesmen menyimpan order_id, Pelaksanaan menyimpan intervention_id) diimplementasikan di modul konsumen; N2 hanya menyediakan identitas UUID yang stabil.
- Target performa < 300 ms (list Program) dan < 500 ms (list Intervensi) mengikuti Performance Expectation pada draft user, diukur pada volume data wajar RS Tipe C & D.
- Penghapusan permanen entitas yang sudah direferensikan tidak diizinkan (FK RESTRICT); pengelolaan ketersediaan memakai mekanisme aktif/nonaktif (soft).

## Pertanyaan Terbuka

- Apakah Intervensi perlu ditautkan ke item tarif/tindakan (untuk penagihan), atau tarif dikelola sepenuhnya di modul Master Tarif terpisah?
- Perilaku cascade saat Program dinonaktifkan: apakah seluruh Intervensi di bawahnya otomatis ikut nonaktif, atau hanya disembunyikan dari pilihan (status individual tetap)?
- Apakah pemindahan Intervensi antar-Program (ubah program_id) diizinkan, mengingat dampak pada referensi Order/Asesmen historis?
- Role/jabatan spesifik mana yang berhak mengelola Master Program/Intervensi Terapi, dan (Phase 2) siapa role_approver-nya?
- Struktur tingkatan approval Phase 2 (berapa jenjang, siapa saja) dan SLA/escalation bila approval tertunda?
- Apakah Audit Trail memakai modul terpusat RS yang sudah ada, atau tabel audit khusus master ini?
- Apakah perlu atribut tambahan pada Intervensi (mis. estimasi durasi atau satuan/frekuensi) untuk kebutuhan Asesmen/Pelaksanaan?