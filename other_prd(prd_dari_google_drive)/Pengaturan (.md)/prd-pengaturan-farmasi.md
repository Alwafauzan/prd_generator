# PRD — Pengaturan Farmasi (A42)

**Related Document:** List Fitur V2.xlsx (code A42); Master Unit (A3) — sumber Unit Order & Unit Farmasi tujuan; Master Instalasi (A19) — `tipe_instalasi=Farmasi` penentu unit farmasi; Modul Resep Pelayanan Farmasi (konsumen runtime); BPMN acuan alur: g-service-order-resep, g-service-cpo-order, g-service-discharge (resep pulang/BLPL), alur retur obat
**Versi:** 2.0 - Re-scope total: dari 'Master Data Gudang dan Farmasi' (topologi node/route/NPP/cold-chain/visibility/fallback/template — v1.x) menjadi fitur 'Pengaturan Farmasi' pada Menu Pengaturan. Fokus: pemetaan default alur resep Unit Order x Aktivitas Peresepan (Order Obat Pulang, CPO, Retur Obat) -> Tujuan Unit Farmasi (Unit ber-`tipe_instalasi=Farmasi`, A3/A19). Seluruh konten master topologi v1.x dihapus.
**Tanggal:** 2026-07-06

## 1. Overview / Brief Summary

**Pengaturan Farmasi** adalah fitur pada **Menu Pengaturan** yang mengatur **alur (routing) resep** dari **Unit Order** (unit pelayanan pembuat resep) menuju **Unit Farmasi tujuan** — yaitu **Unit yang Instalasi induknya (A19) bertipe `Farmasi`** (mengikuti `tipe_instalasi` pada Master Unit A3 / Master Instalasi A19).

Fitur ini menyediakan **pemetaan default** yang dapat ditinjau & disesuaikan Admin, sehingga saat unit pelayanan melakukan aktivitas peresepan, resep otomatis diarahkan ke unit farmasi yang tepat **tanpa pemilihan manual**.

**Inti konfigurasi = pemetaan 3 unsur:**
1. **Unit Order** — unit pelayanan asal resep (mis. IGD, Poli, Rawat Inap, IBS) — sumber **Master Unit (A3)**.
2. **Aktivitas Peresepan** — jenis aktivitas resep pada unit tersebut:
    * **Order Obat Pulang** — resep obat yang dibawa pulang pasien.
    * **CPO** — resep pemberian obat (rawat inap/IGD); memiliki **opsi centang lokasi pemberian** (IGD dan/atau Rawat Inap) yang menentukan tujuan farmasi. [PERLU KONFIRMASI kepanjangan **CPO** — diasumsikan resep/Catatan Pemberian Obat rawat inap, mengacu BPMN `g-service-cpo-order`].
    * **Retur Obat** — pengembalian obat ke farmasi.
3. **Tujuan Unit Farmasi** — unit farmasi penerima resep (Unit ber-`tipe_instalasi=Farmasi`, mis. **Farmasi IGD**, **Farmasi Rawat Inap**).

> **Perubahan besar (v2.0):** Fitur A42 di-**re-scope total** dari **Master Data Gudang dan Farmasi** (topologi node, route, kepatuhan NPP/cold-chain, visibility, fallback, template — v1.x) menjadi fitur **Pengaturan Farmasi** yang fokus pada **pemetaan alur resep Unit → Unit Farmasi**. Seluruh konten master topologi v1.x **dihapus** dari PRD ini (keputusan user).

## 2. Background

**Kondisi saat ini (masalah)** [ASUMSI — pola umum SIMRS RS Tipe C/D]:
* Penentuan **unit farmasi tujuan** resep sering **manual** / kebiasaan petugas: dokter/perawat memilih depo farmasi saat meresepkan, atau routing di-*hardcode*. Akibatnya resep bisa masuk ke farmasi yang salah, antrian dispensing kacau, dan retur obat tidak jelas tujuannya.
* Aktivitas peresepan berbeda (**obat pulang**, **CPO** rawat inap/IGD, **retur**) sering butuh **tujuan farmasi berbeda**, namun tidak ada tempat terpusat untuk mengaturnya.
* Ketika RS memiliki **beberapa unit farmasi** (mis. Farmasi IGD, Farmasi Rawat Inap, Farmasi Rawat Jalan), pemetaan mana-resep-ke-mana menjadi rumit bila tidak dikonfigurasi.

**Kenapa fitur ini perlu:**
Fitur **Pengaturan Farmasi** memusatkan aturan routing resep pada satu layar di **Menu Pengaturan** yang dikelola **Admin**. Dengan **pemetaan default** (siap pakai) + kemampuan penyesuaian per unit, seluruh modul resep (order resep, CPO, resep pulang/BLPL, retur) membaca aturan yang sama, konsisten, dan dapat diaudit — tanpa menambah beban pemilihan manual bagi dokter/perawat/TTK.

## 3. Scope Definition & Phasing

### In Scope (Phase 1 — MVP)
1. **Penempatan fitur** di **Menu Pengaturan** dengan judul **"Pengaturan Farmasi"**.
2. **CRUD pemetaan alur resep per Unit Order** — untuk tiap unit pelayanan, tetapkan tujuan Unit Farmasi per **Aktivitas Peresepan**.
3. **3 Aktivitas Peresepan**:
    * **Order Obat Pulang** → 1 Unit Farmasi tujuan.
    * **CPO** → opsi **centang lokasi pemberian** (**IGD**, **Rawat Inap**, atau keduanya); tiap lokasi tercentang punya Unit Farmasi tujuan (bisa lebih dari satu tujuan).
    * **Retur Obat** → 1 Unit Farmasi tujuan.
4. **Sumber Tujuan** = **Unit ber-`tipe_instalasi=Farmasi`** (lookup Master Unit A3, difilter tipe instalasi Farmasi dari A19) — hanya yang **aktif**.
5. **Pemetaan default (pre-seeded)** yang dapat ditinjau & diubah Admin.
6. **Status aktif/nonaktif** pemetaan + **audit log** perubahan (aktor Admin).
7. **Dashboard/List pemetaan** per unit dengan pencarian & filter.
8. **Ekspos aturan** ke modul resep (dibaca saat runtime) — modul resep yang mengeksekusi, bukan fitur ini.

### Out of Scope
* **Eksekusi resep itu sendiri** (pembuatan/pengiriman/dispensing resep) — milik modul **Resep Pelayanan Farmasi** & BPMN `g-service-order-resep` / `g-service-cpo-order` / `g-service-discharge`. Fitur ini hanya menyediakan **aturan tujuan**.
* **Manajemen stok/inventory** unit farmasi.
* **CRUD Master Unit (A3) & Master Instalasi (A19)** — hanya di-*lookup*.
* **Topologi node, route source→destination, kepatuhan NPP/cold-chain, visibility, fallback, template topologi, import massal** (seluruh konten A42 v1.x) — **dihapus** dari fitur ini.

### Phasing
| Item | Phase 1 (MVP) | Phase 2 |
|------|---------------|---------|
| Pemetaan Unit Order × Aktivitas → Tujuan Farmasi | ✅ CRUD + default | — |
| CPO multi-lokasi (IGD/Rawat Inap) | ✅ | — |
| Audit log pemetaan | ✅ | — |
| Import massal pemetaan (.csv/.xlsx) | — | ✅ (FR-012) |
| Aturan lanjutan (mis. per shift/jam, per kategori obat) | — | ✅ [PERLU KONFIRMASI kebutuhan] |

## 4. Related Features

| Code | Menu | Keterkaitan dengan Pengaturan Farmasi | Phase |
|------|------|----------------------------------------|-------|
| **A42** | **Pengaturan > Pengaturan Farmasi** | **Fitur ini** (dikelola role Admin) | Phase 1 |
| **A3** | Master Data > Unit | Sumber **Unit Order** (unit pelayanan asal) **dan** **Unit Farmasi tujuan** (Unit ber-`tipe_instalasi=Farmasi`) | Phase 1 |
| **A19** | Master Data > Instalasi | Penyedia `tipe_instalasi`; **tipe `Farmasi`** menentukan unit mana yang layak jadi **Tujuan Unit Farmasi** | Phase 1 |
| — | Modul Resep Pelayanan Farmasi | **Konsumen runtime**: membaca pemetaan ini untuk mengarahkan resep (obat pulang/CPO/retur) ke unit farmasi tujuan | Phase 1 |
| — | g-service-order-resep / g-service-cpo-order / g-service-discharge | Alur eksekusi resep (obat pulang, CPO, BLPL) yang **membaca** aturan pemetaan ini | Phase 1 |
| A18 / A53 | Role / RBAC | Membatasi akses konfigurasi ke role **Admin** | Phase 1 |

> Catatan konsistensi: definisi **unit farmasi** di fitur ini **tidak dibuat ulang** — ia diturunkan dari `tipe_instalasi=Farmasi` (A19) pada Master Unit (A3). Sinkron dengan perilaku A3 (unit ber-instalasi Farmasi tampil sebagai sub-menu 'Farmasi' pada sidebar).

## 5. Model Pemetaan Alur Resep (Inti)

Konfigurasi inti = tabel pemetaan **Unit Order × Aktivitas Peresepan → Tujuan Unit Farmasi**.

### 5.1 Struktur Pemetaan
| Unsur | Keterangan | Sumber |
|-------|-----------|--------|
| **Unit Order** | Unit pelayanan asal resep (IGD, Poli, Rawat Inap, IBS, dll) | Master Unit (A3) — unit aktif |
| **Aktivitas Peresepan** | (a) **Order Obat Pulang** · (b) **CPO** (dengan centang lokasi pemberian: IGD / Rawat Inap) · (c) **Retur Obat** | enum aktivitas |
| **Tujuan Unit Farmasi** | Unit farmasi penerima resep | Master Unit (A3) yang `tipe_instalasi=Farmasi` (A19), aktif |

### 5.2 Perilaku per Aktivitas
* **Order Obat Pulang** → **tepat 1** Unit Farmasi tujuan.
* **CPO** → memiliki **centang lokasi pemberian**:
    * ☑ **Diberikan di IGD** → 1 Unit Farmasi tujuan (mis. Farmasi IGD).
    * ☑ **Diberikan di Rawat Inap** → 1 Unit Farmasi tujuan (mis. Farmasi Rawat Inap).
    * Boleh **dicentang keduanya** → resep CPO diarahkan ke **dua** tujuan farmasi sekaligus.
    * Tidak dicentang sama sekali → aktivitas CPO **tidak aktif** untuk unit tersebut.
* **Retur Obat** → **tepat 1** Unit Farmasi tujuan.

### 5.3 Contoh — Unit Order = **IGD**
| Aktivitas Peresepan | Opsi / Centang | Tujuan Unit Farmasi |
|---------------------|----------------|---------------------|
| Order Obat Pulang | — | **Farmasi IGD** |
| CPO | ☑ diberikan di **IGD** | **Farmasi IGD** |
| CPO | ☑ diberikan di **Rawat Inap** | **Farmasi Rawat Inap** |
| CPO | ☑ diberikan di **IGD & Rawat Inap** | **Farmasi IGD + Farmasi Rawat Inap** |
| Retur Obat | — | **Farmasi IGD** |

### 5.4 Pemetaan Default ("secara default")
Sistem menyediakan pemetaan **default** yang dapat langsung dipakai & disesuaikan Admin. [ASUMSI aturan default — perlu konfirmasi final]:
* **Order Obat Pulang** & **Retur Obat** → default ke Unit Farmasi yang **selokasi/seinstalasi** dengan Unit Order (mis. IGD → Farmasi IGD).
* **CPO** → lokasi pemberian default mengikuti sifat unit (unit IGD → centang IGD; unit rawat inap → centang Rawat Inap), tujuan = farmasi lokasi tersebut.
* Admin dapat mengubah tujuan/lokasi kapan pun; perubahan menandai baris sebagai **bukan default** + tercatat audit.

## 6. Business Process (As-Is / To-Be)

### A. As-Is [ASUMSI — modul A42 belum punya BPMN sendiri; diturunkan dari pola alur resep]
1. Petugas/dokter menentukan **unit farmasi tujuan** resep secara manual atau berdasarkan kebiasaan; aktivitas berbeda (obat pulang, CPO, retur) tidak punya aturan tujuan yang baku.
2. Bila ada beberapa unit farmasi, resep rawan salah tujuan → antrian & retur tidak tertib.
3. Tidak ada konfigurasi terpusat & audit atas aturan tujuan resep.

### B. To-Be — pemetaan terpusat di Menu Pengaturan (dikelola Admin)
1. **Setup**: Admin buka **Pengaturan → Pengaturan Farmasi**. Sistem menampilkan **pemetaan default** per Unit Order.
2. **Penyesuaian**: Admin meninjau tiap Unit Order → menetapkan/mengubah Tujuan Unit Farmasi per aktivitas (Obat Pulang, CPO + centang lokasi, Retur). Dropdown tujuan hanya menampilkan **unit ber-tipe instalasi Farmasi** yang aktif.
3. **Simpan**: Sistem memvalidasi (aktivitas aktif punya tujuan; CPO tercentang punya tujuan; tujuan = unit farmasi aktif) → simpan → **audit log** (aktor Admin).
4. **Runtime (dibaca modul resep)**: saat unit pelayanan membuat resep, modul resep membaca pemetaan ini → resep otomatis diarahkan ke Unit Farmasi tujuan sesuai aktivitas & (untuk CPO) lokasi pemberian.

> Eksekusi resep (pengiriman/dispensing) tetap milik **modul Resep Pelayanan Farmasi** — fitur ini hanya sumber **aturan tujuan**.

## 7. User Stories

| ID | User Story | Traceability |
|----|-----------|--------------|
| **US-001** | Sebagai **Admin**, saya ingin membuka **Pengaturan → Pengaturan Farmasi** dan melihat pemetaan default alur resep per unit, agar tidak menyetel dari nol. | Skenario To-Be; FR-001,007 |
| **US-002** | Sebagai **Admin**, saya ingin menetapkan **Tujuan Unit Farmasi untuk Order Obat Pulang** tiap Unit Order, agar resep pulang masuk ke farmasi yang benar. | FR-003; §5 |
| **US-003** | Sebagai **Admin**, saya ingin mengonfigurasi **CPO** dengan **centang lokasi pemberian (IGD/Rawat Inap)** dan tujuan farmasinya, agar resep CPO diarahkan sesuai tempat pemberian. | FR-004; §5.2/5.3 |
| **US-004** | Sebagai **Admin**, saya ingin CPO yang dicentang **IGD & Rawat Inap** diarahkan ke **dua farmasi** sekaligus, agar kebutuhan pemberian ganda terpenuhi. | FR-004; BR-002 |
| **US-005** | Sebagai **Admin**, saya ingin menetapkan **Tujuan Unit Farmasi untuk Retur Obat**, agar pengembalian obat jelas tujuannya. | FR-005 |
| **US-006** | Sebagai **Admin**, saya ingin dropdown tujuan **hanya menampilkan unit ber-instalasi Farmasi yang aktif**, agar tidak salah memilih unit non-farmasi. | FR-006; BR-001 |
| **US-007** | Sebagai **Admin**, saya ingin setiap perubahan pemetaan **tercatat audit**, agar dapat ditelusuri. | FR-009 |
| **US-008** | Sebagai **Dokter/Perawat/TTK**, saya ingin resep otomatis menuju farmasi yang tepat tanpa memilih manual, agar alur pelayanan cepat & tertib. | FR-011 (runtime konsumen) |

## 8. Functional Requirements & Acceptance Criteria

> Legend Prioritas: **P0** Critical (MVP) · **P1** Must Have · **P2** Should Have. Fase: Phase 1 = MVP · `[**]` = Phase 2.

| ID | Requirement | Prioritas · Fase | Acceptance Criteria (ringkas) |
|----|-------------|------------------|-------------------------------|
| **FR-001** | Fitur ditempatkan di **Menu Pengaturan** dengan judul **"Pengaturan Farmasi"**. | P0 · Phase 1 | Item menu "Pengaturan Farmasi" muncul di grup Pengaturan & membuka layar pemetaan. |
| **FR-002** | **CRUD pemetaan alur resep per Unit Order.** | P0 · Phase 1 | Admin dapat memilih Unit Order (A3) lalu menyetel tujuan per aktivitas; simpan/ubah tersimpan. |
| **FR-003** | Aktivitas **Order Obat Pulang** → **tepat 1** Unit Farmasi tujuan. | P0 · Phase 1 | Tersedia 1 dropdown tujuan; wajib terisi bila aktivitas aktif. |
| **FR-004** | Aktivitas **CPO** dengan **centang lokasi pemberian (IGD / Rawat Inap, multi)**; tiap lokasi tercentang → 1 Unit Farmasi tujuan. | P0 · Phase 1 | Centang IGD → 1 tujuan; centang Rawat Inap → 1 tujuan; centang keduanya → 2 tujuan; tanpa centang → CPO nonaktif. |
| **FR-005** | Aktivitas **Retur Obat** → **tepat 1** Unit Farmasi tujuan. | P0 · Phase 1 | 1 dropdown tujuan; wajib terisi bila aktivitas aktif. |
| **FR-006** | Dropdown **Tujuan Unit Farmasi** hanya menampilkan **Unit ber-`tipe_instalasi=Farmasi` (A19)** yang **aktif**. | P0 · Phase 1 | Unit non-farmasi/nonaktif tidak muncul; nilai tersimpan divalidasi ke A3/A19. |
| **FR-007** | Sistem menyediakan **pemetaan default (pre-seeded)** yang dapat ditinjau & diubah. | P1 · Phase 1 | Saat pertama dibuka, tiap Unit Order sudah punya default; perubahan menandai baris bukan-default. |
| **FR-008** | **Validasi simpan**: tiap aktivitas aktif wajib punya tujuan; CPO tercentang wajib tujuan; tujuan wajib unit farmasi aktif. | P0 · Phase 1 | Simpan ditolak dengan pesan bila tujuan kosong/invalid. |
| **FR-009** | **Status aktif/nonaktif** pemetaan + **audit log** (aktor Admin, waktu, before/after). | P1 · Phase 1 | Toggle status; riwayat perubahan tampil & tersimpan. |
| **FR-010** | **Dashboard/List** pemetaan per Unit Order dengan cari & filter (unit, aktivitas, tujuan farmasi, status). | P1 · Phase 1 | Daftar menampilkan ringkasan pemetaan; filter berfungsi. |
| **FR-011** | **Ekspos aturan** ke modul resep (dibaca runtime) via service internal. | P0 · Phase 1 | Modul resep dapat membaca tujuan per (unit, aktivitas, lokasi CPO). |
| **FR-012** | **Import massal** pemetaan (.csv/.xlsx), mode tambah/tambah+update. | P2 · `[**]` | Phase 2 — format template disepakati kemudian. |
| **FR-013** | Bila **Unit Farmasi tujuan dinonaktifkan**, pemetaan terkait ditandai **perlu ditinjau** & tidak dipakai routing. | P1 · Phase 1 | Sistem menampilkan peringatan pada pemetaan yang tujuannya nonaktif. |

## 9. Data Requirements (Spesifikasi Field)

> Catatan: nama tabel/kolom = **rekomendasi teknis [ASUMSI]** untuk divalidasi engineering.

### 9.1 Form **Pemetaan Alur Resep** (INPUT) — per Unit Order (FR-002..008)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| unit_order_id | Unit Order | Dropdown (lookup) | Ya | unit aktif | Master Unit (A3) | unit pelayanan asal resep |
| obatpulang_farmasi_id | Obat Pulang → Farmasi | Dropdown (lookup) | Ya (bila aktivitas aktif) | unit `tipe_instalasi=Farmasi` & aktif | A3 (filter A19=Farmasi) | tepat 1 tujuan (FR-003) |
| cpo_igd_aktif | CPO — diberikan di IGD | Checkbox | Tidak | — | — | centang → butuh tujuan |
| cpo_igd_farmasi_id | CPO IGD → Farmasi | Dropdown (lookup) | Kondisional (wajib bila `cpo_igd_aktif`) | unit farmasi aktif | A3 (Farmasi) | tujuan CPO lokasi IGD |
| cpo_ranap_aktif | CPO — diberikan di Rawat Inap | Checkbox | Tidak | — | — | centang → butuh tujuan |
| cpo_ranap_farmasi_id | CPO Rawat Inap → Farmasi | Dropdown (lookup) | Kondisional (wajib bila `cpo_ranap_aktif`) | unit farmasi aktif | A3 (Farmasi) | tujuan CPO lokasi Rawat Inap |
| retur_farmasi_id | Retur Obat → Farmasi | Dropdown (lookup) | Ya (bila aktivitas aktif) | unit farmasi aktif | A3 (Farmasi) | tepat 1 tujuan (FR-005) |
| is_default | Pemetaan Default | boolean | Ya | true/false | default true saat seed | jadi false bila diubah Admin (BR-005) |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | **field kanonik** |
| keterangan | Keterangan | text | Tidak | maks 255 | manual | **field kanonik** |

> Model penyimpanan alternatif [ASUMSI]: satu tabel `pengaturan_farmasi_mapping` dengan baris per (unit_order_id, aktivitas ∈ {OBAT_PULANG, CPO, RETUR}, lokasi_cpo ∈ {IGD, RAWAT_INAP, null}) → `tujuan_farmasi_unit_id`. CPO IGD & Rawat Inap = 2 baris. Bentuk final diserahkan ke engineering.

### 9.2 **List / Dashboard Pemetaan** (TAMPIL) — FR-010

| Kolom | Sumber | Format | Filter/Sort | Catatan |
|-------|--------|--------|-------------|---------|
| Unit Order | A3.nama | text | sort, filter | |
| Obat Pulang → | tujuan farmasi | badge nama unit farmasi | filter | 1 tujuan |
| CPO (IGD) → | tujuan farmasi | badge / "—" bila tak dicentang | filter | |
| CPO (Rawat Inap) → | tujuan farmasi | badge / "—" | filter | |
| Retur → | tujuan farmasi | badge | filter | 1 tujuan |
| Default? | is_default | badge Ya/Tidak | filter | |
| Status | status_aktif | badge Aktif/Nonaktif | filter | |
| Aksi | — | Edit / Ubah Status | — | |

## 10. Business Rules

| ID | Aturan | Sumber/Traceability |
|----|--------|---------------------|
| **BR-001** | **Tujuan Unit Farmasi wajib** Unit ber-`tipe_instalasi=Farmasi` (A19) & **aktif**. Unit non-farmasi/nonaktif tidak valid sebagai tujuan. | FR-006; A3/A19 |
| **BR-002** | Aktivitas **CPO** dapat memiliki **>1 tujuan** — satu per lokasi pemberian yang dicentang (**IGD**, **Rawat Inap**). Centang keduanya → 2 tujuan. | Contoh IGD; FR-004 |
| **BR-003** | Bila **tidak ada** lokasi CPO dicentang → aktivitas **CPO nonaktif** untuk unit tersebut (tidak ada routing CPO). | §5.2 |
| **BR-004** | **Order Obat Pulang** & **Retur Obat** masing-masing **tepat 1** tujuan farmasi (tidak multi). | FR-003,005 |
| **BR-005** | Sistem menyeed **pemetaan default** (`is_default=true`). Setiap perubahan Admin → `is_default=false` + **audit** (aktor, waktu, before/after). | FR-007,009 |
| **BR-006** | Satu **Unit Order** memiliki **satu set pemetaan** (Obat Pulang, CPO, Retur) — tidak duplikat per unit. | integritas [ASUMSI] |
| **BR-007** | Aktivitas yang **aktif wajib punya tujuan** sebelum simpan (Obat Pulang, Retur, dan tiap lokasi CPO yang dicentang). | FR-008 |
| **BR-008** | Seluruh pengelolaan (CRUD) dilakukan role **Admin**; **tidak ada langkah approval**. | RBAC A18/A53 |
| **BR-009** | Bila Unit Farmasi tujuan **dinonaktifkan** setelah dipetakan → pemetaan ditandai **perlu ditinjau** & tidak dipakai routing sampai diperbaiki. | FR-013 |
| **BR-010** | Fitur ini **tidak** mengeksekusi resep — hanya menyediakan **aturan tujuan** yang dibaca modul resep saat runtime. | Scope; FR-011 |

## 11. Non-Functional Requirements

| ID | Requirement | Target/Catatan |
|----|-------------|----------------|
| **NFR-001** | **Performa baca runtime** — modul resep membaca pemetaan ≤ **300–500 ms** agar tidak menghambat alur peresepan. | volume kecil; in-memory cache disarankan |
| **NFR-002** | **Audit & Retensi** — perubahan pemetaan tercatat immutable; retensi mengikuti kebijakan RS (mengacu STARKES PKPO bila berlaku). | wajib |
| **NFR-003** | **RBAC** — konfigurasi hanya untuk role **Admin**; peran lain read-only/tidak akses. | via A18/A53 |
| **NFR-004** | **Integritas referensi** — pemetaan tidak boleh menunjuk unit terhapus/nonaktif; soft-delete + dependency check. | mencegah routing rusak (BR-009) |
| **NFR-005** | **Usability** — pemetaan default siap pakai; penyesuaian per unit intuitif untuk Admin non-IT. | RS Tipe C/D SDM terbatas |
| **NFR-006** | **Konsistensi cache** — perubahan pemetaan → invalidasi/refresh cache modul resep agar tidak stale. | last-known-good saat DB sesaat down |

## 12. Integrasi & Dependency

Fitur ini **konfigurasi-sentris**; keterkaitan utamanya adalah **integrasi internal antar-modul SIMRS**.

| Modul | Arah | Tujuan |
|-------|------|--------|
| **A3 Master Unit** | baca | Sumber **Unit Order** & **Unit Farmasi tujuan** (difilter `tipe_instalasi=Farmasi`) |
| **A19 Master Instalasi** | baca | Penyedia `tipe_instalasi`; tipe **Farmasi** menentukan kelayakan unit sebagai tujuan |
| **Modul Resep Pelayanan Farmasi** | sediakan aturan | **Konsumen runtime**: membaca tujuan per (unit, aktivitas, lokasi CPO) untuk mengarahkan resep obat pulang/CPO/retur |
| **g-service-order-resep / g-service-cpo-order / g-service-discharge** | sediakan aturan | Alur eksekusi resep membaca pemetaan ini (obat pulang, CPO, resep pulang/BLPL, retur) |
| **A18 Role / A53 RBAC** | baca | Penegakan akses **Admin** sebagai pengelola |

### Dependency / Risiko
* **Ketergantungan pada A3/A19**: unit farmasi tujuan hanya muncul bila ada Unit ber-`tipe_instalasi=Farmasi`. Bila belum ada unit farmasi terdefinisi, pemetaan tidak dapat lengkap → prasyarat data master. [PERLU KONFIRMASI]
* **Kepanjangan & cakupan CPO** (lokasi pemberian, apakah selain IGD/Rawat Inap ada lokasi lain, mis. IBS) perlu dikonfirmasi. [PERLU KONFIRMASI]
* Eksekusi & pengiriman resep tetap tergantung kesiapan **modul resep** yang membaca aturan ini.

## Asumsi
- Sesuai keputusan user (v2.0): fitur A42 di-re-scope TOTAL menjadi 'Pengaturan Farmasi' di Menu Pengaturan; seluruh konten master topologi/route/NPP/cold-chain/visibility/fallback/template v1.x dihapus.
- 'Unit Farmasi' tidak didefinisikan ulang di fitur ini — ia = Unit (A3) yang Instalasi induknya (A19) bertipe `Farmasi` (`tipe_instalasi=FARMASI`). Konsisten dengan perilaku A3 (sub-menu 'Farmasi' pada sidebar).
- [PERLU KONFIRMASI] Kepanjangan & definisi resmi 'CPO' — diasumsikan resep/Catatan Pemberian Obat rawat inap (mengacu BPMN g-service-cpo-order).
- [ASUMSI] Aturan pemetaan default: Obat Pulang & Retur → farmasi selokasi/seinstalasi Unit Order; CPO → lokasi pemberian sesuai sifat unit. Admin dapat mengubah; aturan default final perlu dikonfirmasi.
- [ASUMSI] Lokasi pemberian CPO = {IGD, Rawat Inap} sesuai contoh user; kemungkinan lokasi lain (mis. IBS) perlu dikonfirmasi.
- Pengelolaan oleh role Admin tanpa approval (konsisten kebijakan master/pengaturan lain).
- Fitur hanya menyimpan ATURAN tujuan; eksekusi resep adalah tanggung jawab modul Resep Pelayanan Farmasi yang membaca aturan ini saat runtime.
- Field kanonik (status_aktif, keterangan) mengikuti definisi bersama lintas-PRD.
- Import massal pemetaan = Phase 2.

## Pertanyaan Terbuka
- Kepanjangan resmi 'CPO' dan seluruh lokasi pemberiannya (hanya IGD & Rawat Inap, atau ada lokasi lain seperti IBS/HD)? [PERLU KONFIRMASI]
- Aturan pemetaan DEFAULT yang diinginkan untuk tiap tipe unit order (bagaimana sistem menebak farmasi default)? [PERLU KONFIRMASI]
- Apakah Order Obat Pulang / Retur perlu mendukung >1 tujuan farmasi di masa depan, atau tetap tepat 1? [PERLU KONFIRMASI]
- Apakah pemetaan perlu dimensi tambahan (mis. per shift/jam, per kategori obat, per penjamin BPJS/umum)? — kandidat Phase 2. [PERLU KONFIRMASI]
