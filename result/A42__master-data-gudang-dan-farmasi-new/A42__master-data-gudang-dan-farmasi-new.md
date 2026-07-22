# Product Requirement Document (PRD)
# A42 — Master Data Gudang dan Farmasi (New) (Include UI)

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder, Jabatan, Tanggal] — [PERLU KONFIRMASI]
* **Related Documents**:
  * Design Figma — Master Data Gudang dan Farmasi
  * List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A42)
  * A4 — Master Barang Farmasi · A33 — Kategori Barang · A21 — Sediaan Barang · A19 — Instalasi · A2 — Staff · A3 — Unit · A39 — Ruang IBS · A18/A53 — Role/RBAC
  * BPMN acuan (analogi): `g-service-order-resep`, `g-service-cpo-order`, `g-service-discharge`, `g-emr-inpatient`
  * Regulasi: UU 35/2009 (Narkotika), Permenkes 3/2015 (NPP), Standar STARKES PKPO
* **Document Version**:

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-06-23 | 1.2 | Hapus baseline insiden & DPHO/Fornas dari master; import massal → Phase 2; life-saving whitelist → modul lain; saran NFR performa/offline; klarifikasi dependency modul distribusi |
| 2026-07-03 | 1.3 | Restrukturisasi ke template PRD standar + spesifikasi UI (form input, list view, validasi frontend, skema DB & API, state machine) |

---

## 2. Overview & Background

### Overview / Brief Summary

**Master Data Gudang dan Farmasi** adalah modul *relationship/policy master* di **Control Panel** yang menyimpan **topologi node Instalasi Farmasi** (Gudang Farmasi Pusat, Depo Farmasi, Depo NPP, Floor Stock) beserta **aturan routing** yang menghubungkannya. Berbeda dari master data lain (A4 Barang Farmasi, A33 Kategori Barang) yang menyimpan *entitas*, master ini menyimpan **edges/hubungan & aturan** dalam graph operasional farmasi.

Modul mendefinisikan lima hal utama:
1. **Node Topology** — titik penyimpanan & pelayanan farmasi beserta atribut compliance (brankas NPP, cold chain, jam operasional, kebutuhan APJ on-site).
2. **Route Definition (Source → Destination)** — siapa boleh order dari mana, kategori diizinkan/dilarang, batas qty, frekuensi, eligibilitas auto-fulfillment.
3. **Prescription Activity Routing (mapping 3-dimensi)** — memetakan **Unit Order × Activity Peresepan × Lokasi Pemberian → Target Farmasi**. Resep dari unit pelayanan (Poli/IGD/Ranap/IBS) otomatis diarahkan ke Depo yang melayaninya berdasarkan **jenis aktivitas** (Order Obat Pulang, CPO, Retur Obat) dan **lokasi pemberian** (mis. CPO diberikan di IGD & Ranap → 2 depo). Termasuk *fork* otomatis item Narkotika/Psikotropika ke Depo NPP.
4. **Visibility Rules** per route — menentukan stok node mana yang terlihat oleh siapa.
5. **Fallback & Substitution Rules** — jalur cadangan bila stok depo target habis.

> **Konsep kunci Prescription Activity Routing:** master ini menyimpan **aturan mapping**-nya, sedangkan **input runtime** (dokter memilih obat, mencentang **"Diberikan di: Rawat Inap / IGD"** pada form Input Resep Obat, dsb.) berada di **modul operasional** (`g-service-order-resep` / `g-service-cpo-order`). Modul operasional **membaca** mapping A42 untuk menentukan resep masuk ke depo farmasi mana. Penentu tujuan berbeda per activity: **CPO** mengikuti **lokasi pemberian** (checkbox runtime, bisa multi-target); **Order Obat Pulang** & **Retur Obat** mengikuti **unit order**.

Dengan master ini, alur resep & permintaan distribusi internal antar node menjadi otomatis, valid secara regulasi (UU 35/2009, Permenkes 3/2015, STARKES PKPO), dan disesuaikan untuk keterbatasan SDM RS Tipe C & D (APJ tunggal, TTK terbatas). Modul adalah **fondasi konfigurasi** — proses operasional (order resep, CPO, distribusi stok) **membaca** master ini saat runtime.

> **Pengelola master ini = role Admin (bagian admin).** Seluruh aktivitas CRUD master (node, route, prescription routing, visibility, fallback) dilakukan bagian Admin — sama seperti master data lain (A1/A2/A19/A33). APJ/Apoteker muncul sebagai **data referensi** (penanggung jawab node), bukan pelaku/approver konfigurasi. **Tidak ada langkah approval** di dalam modul ini.

### Business Process (As-Is vs To-Be)

**As-Is (Proses Manual Saat Ini)** — [ASUMSI, diturunkan dari pola BPMN terkait; A42 belum punya BPMN sendiri]:
- Penentuan depo tujuan resep dilakukan manual oleh petugas farmasi / berdasarkan kebiasaan; resep NPP dipilah manual, rawan keliru (volume 200–800 resep/hari di Tipe C).
- Permintaan stok antar Gudang–Depo memakai form manual/kertas tanpa validasi kategori & batas qty; persetujuan lewat lisan/WA tanpa kontrol.
- Tidak ada matriks visibility stok — dokter meresepkan obat yang ternyata kosong di depo.
- Tidak ada audit trail terstruktur untuk perubahan aturan distribusi.
- **Risiko kepatuhan**: dispensing NPP wajib di node berbrankas dengan APJ pendamping; tanpa routing otomatis, item NPP berisiko diproses di depo non-compliant.

**To-Be (Workflow Digital yang Diusulkan)** — fondasi konfigurasi terpusat oleh Admin:
1. **Setup awal**: Admin memilih **template topologi** (Minimal/Standar/Lengkap) → sistem auto-generate node + default routes → Admin review & adjust → **Admin aktifkan** topologi (tanpa langkah approval terpisah).
2. **Konfigurasi route & rules**: Admin mendefinisikan/menyesuaikan Route Definition, Prescription Routing, Visibility, dan Fallback.
3. **Runtime (dibaca modul lain)**: saat dokter menyimpan resep → sistem baca Prescription Activity Routing dengan kunci **(unit order, activity, lokasi pemberian)** → tentukan target depo (bisa **>1 depo** untuk CPO multi-lokasi); item NPP → **fork** ke Depo NPP otomatis. Alur **Retur Obat** diarahkan balik ke depo asal sesuai mapping. Saat TTK buat Permintaan Distribusi → sistem baca Route → validasi kategori & qty → qty ≤ threshold pada route eligible → **auto-fulfill**; di atas threshold → ditandai untuk penanganan manual oleh modul distribusi.
4. **Audit**: setiap perubahan master & keputusan routing tercatat (siapa, kapan, apa) — retensi 5 tahun (STARKES PKPO).

> **Catatan dependency (v1.2):** Persetujuan eksekusi (transfer Cito, dual-control NPP, permintaan di atas threshold) & tracking nomor seri NPP dikonfirmasi **akan** ditangani modul distribusi/mutasi barang, **namun belum terakomodasi saat ini** → sementara menjadi manual/luar-sistem dan dicatat sebagai risiko transisi (lihat Pertanyaan Terbuka).

---

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Routing resep otomatis tanpa intervensi manual | ≥ 95% resep ter-route otomatis ke depo benar tanpa koreksi manual [ASUMSI target] |
| 2 | Kepatuhan dispensing NPP | 100% item NPP ter-fork ke Depo NPP compliant (zero tolerance, UU 35/2009) |
| 3 | Setup cepat oleh Admin (RS Tipe C/D) | Waktu konfigurasi topologi awal via template ≤ 30 menit [ASUMSI] |
| 4 | Kontrol permintaan stok antar node | 100% permintaan distribusi tervalidasi kategori & qty oleh sistem |
| 5 | Auditability | 100% perubahan master tercatat audit log lengkap; retensi 5 tahun (STARKES PKPO) |
| 6 | Visibility benar | 100% akses lihat stok node sesuai matriks visibility role (NPP restricted enforced) |
| 7 | Kelengkapan & validitas konfigurasi (proxy kualitas master) | 100% node/route aktif lolos validasi compliance (NPP/cold-chain/fallback wajib) [ASUMSI] |

> **Catatan v1.2:** Metrik "insiden resep salah depo" **dihapus** dari master ini — pengukuran insiden adalah ranah modul operasional/pelayanan farmasi, bukan master konfigurasi. Kualitas master diukur lewat **proxy konfigurasi** (validitas compliance node/route) yang dihitung langsung dari data master.

---

## 4. Scope Definition & Phasing

| Fitur / Modul | Phase 1 (MVP: CRUD & Config) | Phase 2 / 3 (Advanced) |
|---------------|------------------------------|------------------------|
| CRUD Node Farmasi | Node GUDANG_PUSAT/DEPO_STANDAR/DEPO_NPP/FLOOR_STOCK + atribut compliance | — |
| Template Topologi Pre-seeded | Minimal/Standar/Lengkap → auto-generate node + default routes; review & aktivasi | — |
| CRUD Route Definition | Source→Destination, kategori allow/exclude, max qty, frequency, auto-fulfillment + threshold | — |
| CRUD Prescription **Activity** Routing (3-dimensi) | Mapping Unit Order × Activity (Obat Pulang/CPO/Retur) × Lokasi Pemberian → Target Farmasi (multi-target), fork NPP, fallback | — |
| Visibility Rules | Matriks visibility stok node per role (public/cross-depo/restricted NPP) | — |
| Fallback & Substitution Rules | Fallback path + substitusi (referensi A4 `is_substitutable`) | — |
| Dashboard & Graph Topologi | List node & route + filter + visualisasi node-edge | Analytics optimisasi topologi (**Phase 3**) |
| Audit Log | Catatan create/update/delete + aktivasi/non-aktivasi node | — |
| Import Massal node/route | — | Import `.csv/.xlsx` (mode tambah / tambah+update) — **Phase 2** (FR-A42-15) |
| Restock auto-trigger (stok < X%) | — | **Phase 2** (milik interaksi modul stok) |
| Approval eksekusi / dual-control NPP / transfer Cito | — | **Di luar modul ini** → modul distribusi/mutasi barang |

**Out of Scope**:
- **Approval Workflow / persetujuan eksekusi** (auto-approve, approval APJ dua sisi, dual-control transfer Cito) — **dihapus dari modul ini**; ditangani modul operasional/distribusi. *Dependency: dikonfirmasi akan diakomodasi modul distribusi, namun belum terakomodasi saat ini.*
- **Tracking nomor seri kemasan NPP (dual-control)** — di modul distribusi/mutasi barang.
- **Metrik & baseline insiden "resep salah depo"** — di modul operasional/pelayanan farmasi.
- **Routing resep BPJS berbasis DPHO/Fornas & ketersediaan per depo** — di modul resep pelayanan farmasi.
- **Whitelist obat life-saving Floor Stock** — di modul stok.
- Eksekusi runtime alur resep/distribusi (milik `g-service-order-resep`, `g-service-cpo-order`, distribusi internal) — modul ini hanya menyediakan **aturan** yang dibaca.
- Master entitas obat/barang & atribut ROP/`is_substitutable` (milik A4) — hanya direferensikan.
- Master Kategori (A33), Sediaan (A21), Instalasi (A19), Staff/APJ (A2) — direferensikan, tidak didefinisikan ulang.
- Gudang non-farmasi (Rumah Tangga, Gizi/A6), Laboratorium & Radiologi.
- Manajemen stok/saldo riil per node (milik modul Inventory).

> **Catatan phasing (template)**: Panduan template menyarankan menyiapkan arsitektur data untuk approval Phase 2. Karena approval **secara eksplisit di luar modul ini** (ditangani modul distribusi), kolom `approval_status`/`approver_role` (nullable, default `none`) tetap disertakan di skema sebagai *reserved* demi konsistensi lintas-PRD, namun **tidak diaktifkan** pada modul master ini.

---

## 5. Related Features

| Code | Menu | Keterkaitan dengan A42 |
|------|------|------------------------|
| A4 | Master Data > Barang Farmasi | Sumber entitas obat + atribut ROP, `is_substitutable`, kategori NPP/cold-chain per barang (dasar substitution & validasi route) |
| A33 | Master Data > Kategori Barang | Sumber `allowed_categories` / `excluded_categories` per route |
| A21 | Master Data > Sediaan Barang | Referensi bentuk sediaan barang yang dirutekan |
| A19 | Master Data > Instalasi | Instalasi induk node (Instalasi Farmasi) |
| A2 | Master Data > Staff | Sumber APJ / Apoteker Pendamping / TTK sebagai **penanggung jawab node** (data referensi, bukan approver) |
| A3 / A39 | Master Data > Unit / Ruang IBS | Sumber `source_unit_pelayanan` (Poli/IGD/Ranap/IBS) pada Prescription Routing |
| A18 / A37 / A53 | Role / Akses Menu / RBAC | Akses **Admin** ke master & visibility stok per role |
| A36 / A35 | Grup Obat / Farmaco | Klasifikasi obat pendukung kategori routing |

**Modul operasional yang membaca master ini (eksekusi = Out Scope):** `g-service-order-resep` (routing resep RJ/pulang) · `g-service-cpo-order` (CPO ranap) · `g-service-discharge` (resep BLPL) · Modul Distribusi/Mutasi Barang (persetujuan eksekusi, transfer Cito, tracking seri NPP) · Modul Resep Pelayanan Farmasi (DPHO/Fornas BPJS) · Modul Stok (whitelist life-saving Floor Stock).

---

## 6. Business Process & User Stories

### State Machine — Status Node / Topologi

| Status | Deskripsi | Efek ke Modul Konsumen | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------------------------|--------------------|--------------------|
| `DRAFT` | Node/route hasil generate template, belum diaktifkan | Tidak dibaca modul operasional saat runtime | → `AKTIF` (via aktivasi Admin) | idem |
| `AKTIF` | Node/route aktif & dibaca modul operasional | Muncul di dashboard; dipakai routing resep/distribusi; visibility enforced | → `NONAKTIF` (soft, dependency check) | → `NONAKTIF` |
| `NONAKTIF` | Node/route dinonaktifkan (soft delete) | **Tidak** dipakai routing baru; referensi historis tetap utuh | → `AKTIF` | → `AKTIF` |

> **Aturan status form**: status **tidak diinput bebas** saat create — node baru dari template berstatus `DRAFT`, node manual diset `AKTIF` oleh sistem setelah lolos validasi compliance. Non-aktivasi dilakukan di **level Dashboard** (toggle) dengan **dependency check** (NFR-A42-07): node/route yang masih direferensikan route/rule aktif tidak dapat dinonaktifkan langsung.

### User Stories Utama

| ID | Role | Task | Goal |
|----|------|------|------|
| US-A42-01 | Admin | Memilih template topologi farmasi (Minimal/Standar/Lengkap) | Tidak perlu membangun graph node dari nol |
| US-A42-02 | Admin | Meninjau & mengaktifkan topologi hasil generate template | Konfigurasi sesuai kondisi nyata RS sebelum dipakai |
| US-A42-03 | Admin | Menandai node sebagai Depo NPP berbrankas + menetapkan penanggung jawab APJ | Dispensing NPP hanya di tempat compliant |
| US-A42-04 | Admin | Mengatur route distribusi per depo | Permintaan stok tervalidasi kategori & qty |
| US-A42-05 | Admin | Mengatur prescription activity routing (Unit Order × Activity × Lokasi Pemberian → Target Farmasi) | Setiap jenis resep (Obat Pulang/CPO/Retur) masuk ke depo yang benar |
| US-A42-05b | Admin | Mengonfigurasi CPO agar mengikuti **lokasi pemberian** (checkbox "Diberikan di") termasuk **multi-target** (IGD & Ranap sekaligus) | Resep CPO tersebar tepat ke tiap depo yang melayani lokasi pemberian |
| US-A42-05c | Admin | Mengonfigurasi tujuan **Retur Obat** per unit/depo asal | Obat retur kembali ke depo yang benar |
| US-A42-06 | Admin | Mengonfigurasi fork otomatis resep Narkotika ke Depo NPP | Pasien ambil item NPP di tempat berbrankas |
| US-A42-07 | Admin | Mengatur threshold auto-fulfillment per route | Permintaan rutin kecil langsung dipenuhi tanpa penanganan manual |
| US-A42-08 | Dokter | Melihat ketersediaan stok di depo target resep (read-only) | Tidak meresepkan obat yang kosong |
| US-A42-09 | TTK | Melihat aturan route & depo tempat bertugas (read-only) | Memahami alur saat order/dispense |
| US-A42-10 | TTK Depo | Cross-depo lookup stok depo lain | Koordinasi transfer saat stok habis |
| US-A42-11 | Auditor | Melihat audit log perubahan master & keputusan routing | Memenuhi audit STARKES PKPO |
| US-A42-12 | Admin | Menandai node cold-chain capable | Obat rantai dingin hanya dirutekan ke node berkulkas terkalibrasi |
| US-A42-13 | Admin | Mendefinisikan fallback path & aturan substitusi | Pelayanan tetap berjalan saat stok depo target habis |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Template Topologi Pre-seeded & Aktivasi**

* **User Story**: Sebagai Admin, saya ingin memilih template topologi (Minimal/Standar/Lengkap) lalu meninjau & mengaktifkannya, agar setup topologi cepat tanpa membangun graph dari nol.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem menyediakan **3 template** (Minimal/Standar/Lengkap); memilih salah satu meng-generate node + default routes + default prescription routing berstatus `DRAFT`.
    * **AC 2**: Admin dapat mengedit nama node, parameter, serta menambah/menghapus node/route hasil generate sebelum aktivasi.
    * **AC 3**: Sistem memvalidasi compliance sebelum aktivasi: node `DEPO_NPP` wajib `npp_storage_compliant=true` + penanggung jawab APJ terisi (BR-A42-01, BR-A42-08).
    * **AC 4**: Aksi **Aktifkan Topologi** mengubah status node/route `DRAFT → AKTIF` dan tercatat di audit log; **tanpa langkah approval**.
    * **AC 5**: Setup topologi awal via template dapat diselesaikan ≤ 30 menit oleh Admin non-IT (NFR-A42-06).

---

**Fitur: CRUD Node Farmasi**

* **User Story**: Sebagai Admin, saya ingin mengelola node farmasi (Gudang Pusat, Depo, Depo NPP, Floor Stock) beserta atribut compliance-nya, agar topologi penyimpanan & pelayanan farmasi terdefinisi dengan benar.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Node memuat seluruh field pada §8.3.1-A (tipe, instalasi induk, penanggung jawab, jam operasional, flag compliance).
    * **AC 2**: `kode_node` unik (maks 20 char, alfanumerik); duplikat ditolak.
    * **AC 3**: Node `DEPO_NPP` menolak simpan bila `npp_storage_compliant=false` (BR-A42-01).
    * **AC 4**: Node `requires_apj_on_site=true` hanya dapat ditandai operasional bila penanggung jawab APJ/Apoteker terisi (bukan TTK saja) (BR-A42-08).
    * **AC 5**: Node `FLOOR_STOCK` wajib memiliki `parent_node_id`. Tidak ada field whitelist obat life-saving (BR-A42-15).
    * **AC 6**: Status node tidak diinput bebas di create (DRAFT dari template / AKTIF oleh sistem); non-aktivasi via dashboard dengan dependency check (NFR-A42-07).

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Node | Text | Required, Max 20, alfanumerik, unik | "Kode node wajib diisi dan harus unik." | Mengikuti pola kode master, mis. DEPO-RJ-01 |
  | Nama Node | Text | Required, Max 100 | "Nama node wajib diisi." | mis. Depo Farmasi Rawat Jalan |
  | Tipe Node | Dropdown | Required (enum 4 tipe) | "Tipe node wajib dipilih." | Menentukan aturan turunan compliance |
  | Instalasi Penanggung Jawab | Dropdown (lookup A19) | Required | "Instalasi wajib dipilih." | Bersumber dari Master Instalasi |
  | Penanggung Jawab (APJ/Apoteker) | Dropdown (lookup A2) | Required | "Penanggung jawab wajib dipilih." | Data referensi, bukan approver |
  | Brankas NPP Compliant | Boolean | Required true jika Tipe=DEPO_NPP | "Depo NPP wajib berbrankas compliant." | Syarat dispensing Narkotika/Psikotropika |
  | Jam Buka / Jam Tutup | Time | Required, format HH:mm | "Jam operasional wajib diisi." | 24/7 → 00:00–23:59 |

---

**Fitur: CRUD Route Definition (Source → Destination)**

* **User Story**: Sebagai Admin, saya ingin mengatur route distribusi antar node, agar permintaan stok tervalidasi kategori & qty.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form Route memuat field pada §8.3.1-B (source, destination, tipe permintaan, allowed/excluded categories, max qty, frequency, auto-fulfillment + threshold).
    * **AC 2**: Sistem menolak route bila `source_id = destination_id` atau duplikat kombinasi (source+destination+tipe permintaan) (BR-A42-10).
    * **AC 3**: `excluded_categories` mengalahkan `allowed_categories` bila konflik (BR-A42-09).
    * **AC 4**: `auto_fulfillment_threshold` wajib diisi (≥1) bila `auto_fulfillment_eligible=true` (BR-A42-03).
    * **AC 5**: Route melibatkan kategori NPP/Cold Chain → sistem memvalidasi node tujuan `npp_storage_compliant`/`cold_chain_capable=true` sebelum simpan (BR-A42-01, BR-A42-04).

---

**Fitur: CRUD Prescription Activity Routing (Unit × Activity × Lokasi → Target Farmasi)**

* **User Story**: Sebagai Admin, saya ingin memetakan tujuan farmasi berdasarkan **unit order**, **jenis aktivitas resep** (Order Obat Pulang / CPO / Retur Obat), dan **lokasi pemberian**, agar tiap jenis resep otomatis masuk ke depo yang benar — termasuk multi-target dan fork NPP.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memuat field pada §8.3.1-C (unit order, **activity peresepan**, sumber penentu tujuan, target depo **(multi-target)**, filter status pasien, filter kategori, fork NPP target, urgency routing, fallback depo).
    * **AC 2**: Field `prescription_activity` wajib dipilih (enum: `ORDER_OBAT_PULANG` / `CPO` / `RETUR_OBAT` / `RESEP_RJ`); mapping unik per kombinasi (unit order + activity + lokasi pemberian) (BR-A42-13).
    * **AC 3**: Untuk activity `CPO`, penentu tujuan = **lokasi pemberian** (nilai checkbox "Diberikan di" dari runtime). Bila lokasi tercentang lebih dari satu (mis. IGD & Ranap) → resep di-route ke **beberapa depo sekaligus (multi-target)** sesuai mapping (BR-A42-17).
    * **AC 4**: Untuk activity `ORDER_OBAT_PULANG` & `RETUR_OBAT`, penentu tujuan = **unit order / depo asal** (bukan lokasi pemberian) (BR-A42-18).
    * **AC 5**: `fork_npp_target_id` wajib diisi bila rule mencakup kategori NPP, dan hanya menerima node `DEPO_NPP` dengan `npp_storage_compliant=true` (BR-A42-02, BR-A42-08). Fork NPP berlaku di atas hasil routing activity (setiap target dapat memicu fork NPP).
    * **AC 6**: `target_depo_id`, `urgency_routing`, dan `fallback_depo_id` hanya menerima node `DEPO_*` aktif.
    * **AC 7**: Checkbox "Diberikan di" adalah **input runtime milik modul operasional**; A42 hanya menyimpan **aturan mapping** yang dibaca modul tersebut (AC 1 Fitur API Internal).
    * **AC 8**: Form **tidak** memiliki field evaluasi DPHO/Fornas/ketersediaan BPJS (BR-A42-16).

  **Contoh mapping (unit order = IGD):**
  | Activity | Lokasi Pemberian (runtime) | Target Farmasi |
  |----------|----------------------------|----------------|
  | Order Obat Pulang | — | Depo Farmasi IGD |
  | CPO | Rawat Inap | Depo Farmasi Ranap |
  | CPO | IGD | Depo Farmasi IGD |
  | CPO | IGD & Rawat Inap | Depo Farmasi IGD **+** Depo Farmasi Ranap |
  | Retur Obat | — | Depo Farmasi IGD |

---

**Fitur: Visibility Rules**

* **User Story**: Sebagai Admin, saya ingin mengatur matriks visibility stok node per role, agar stok NPP hanya terlihat oleh yang berhak.
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat menetapkan `visibility_role` per node (lookup A18) — public / cross-depo / restricted NPP.
    * **AC 2**: Stok Depo NPP **restricted**: hanya APJ & TTK Depo NPP; tidak terlihat dokter umum (BR-A42-07).
    * **AC 3**: Data stok NPP tidak boleh terekspos ke role tidak berhak bahkan via API (NFR-A42-04).

---

**Fitur: Fallback & Substitution Rules**

* **User Story**: Sebagai Admin, saya ingin mendefinisikan fallback path & aturan substitusi, agar pelayanan tetap berjalan saat stok depo target habis.
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap node minimal punya satu fallback path; default = Gudang Pusat dengan auto-upgrade urgensi ke Cito bila stok target kosong (BR-A42-06).
    * **AC 2**: Substitusi hanya disuggest untuk barang `is_substitutable=true` (referensi A4) dan stok habis di seluruh node pada fallback path (BR-A42-12).
    * **AC 3**: Fallback path 2 (cross-depo lookup) tersedia; eksekusi transfer ditangani modul distribusi (Out Scope).

---

**Fitur: Dashboard, List & Graph Topologi**

* **User Story**: Sebagai Admin, saya ingin melihat dashboard node & route dengan filter dan visualisasi graph, agar mudah meninjau topologi.
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Dashboard menampilkan kartu ringkasan (Total Node Aktif, Total Depo NPP) + tabel node & route sesuai §8.3.2.
    * **AC 2**: Filter tersedia untuk tipe node, status aktif, kategori; pencarian by nama node.
    * **AC 3**: Tersedia visualisasi **graph node-edge** (node = titik, route = edge) untuk review; NPP badge merah. [ASUMSI bentuk UI final]
    * **AC 4**: Setiap baris memiliki aksi Detail, Edit, Ubah Status.

---

**Fitur: Audit Log**

* **User Story**: Sebagai Auditor, saya ingin melihat audit log perubahan master & aktivasi node, agar memenuhi audit STARKES PKPO.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem mencatat setiap create/update/delete master & aktivasi/non-aktivasi node: user, timestamp, before/after (diff).
    * **AC 2**: Log bersifat immutable dengan retensi **5 tahun** (NFR-A42-01).

---

**Fitur: API Internal (Expose Aturan ke Modul Operasional)**

* **User Story**: Sebagai Sistem (modul operasional), saya ingin membaca aturan routing/visibility master ini via API internal saat runtime, agar eksekusi resep/distribusi konsisten dengan konfigurasi.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sistem mengekspos endpoint resolve (target depo, fork NPP, fallback, visibility) untuk dibaca modul resep/distribusi (FR-A42-13).
    * **AC 2**: Pembacaan aturan ≤ 500 ms p95 (idealnya ≤ 300 ms via in-memory cache) (NFR-A42-02).
    * **AC 3**: Perubahan master memicu invalidasi cache (bump versi konfigurasi) agar tidak stale, khususnya aturan NPP.

---

**Fitur: [Phase 2] Import Massal Node/Route**

* **User Story**: Sebagai Admin, saya ingin mengimpor node/route via template `.csv/.xlsx`, agar setup massal cepat.
* **Prioritas**: P2 · **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Unduh template; unggah dengan mode `tambah` / `tambah+update`.
    * **AC 2**: Validasi per baris (compliance, integritas referensial); baris invalid dilaporkan tanpa membatalkan baris valid.
    * **AC 3**: Format & kolom template final disepakati di Phase 2 (placeholder di §8.3.1-E).

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

#### Table: `pharmacy_nodes`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | PK, default `gen_random_uuid()` | — |
| `node_code` | VARCHAR(20) | NOT NULL, UNIQUE | Alfanumerik (BR integritas) |
| `node_name` | VARCHAR(100) | NOT NULL | — |
| `node_type` | ENUM(`GUDANG_PUSAT`,`DEPO_STANDAR`,`DEPO_NPP`,`FLOOR_STOCK`) | NOT NULL | Menentukan aturan turunan |
| `installation_id` | UUID | NOT NULL, FK → `installations(id)` (A19) | Instalasi induk |
| `parent_node_id` | UUID | NULLABLE, FK → `pharmacy_nodes(id)` | Wajib untuk FLOOR_STOCK |
| `person_in_charge_id` | UUID | NOT NULL, FK → `staff(id)` (A2) | APJ/Apoteker (data referensi) |
| `address` | VARCHAR(255) | NULLABLE | — |
| `contact` | VARCHAR(50) | NULLABLE | — |
| `opening_time` | TIME | NOT NULL | HH:mm |
| `closing_time` | TIME | NOT NULL | HH:mm; 24/7 → 00:00–23:59 (BR-A42-05) |
| `max_capacity_sku` | INTEGER | NULLABLE, ≥0 | — |
| `npp_storage_compliant` | BOOLEAN | NOT NULL, default `false` | Syarat DEPO_NPP (BR-A42-01) |
| `cold_chain_capable` | BOOLEAN | NOT NULL, default `false` | Kulkas 2–8°C terkalibrasi (BR-A42-04) |
| `requires_apj_on_site` | BOOLEAN | NOT NULL, default `false` | BR-A42-08 |
| `audit_zone` | BOOLEAN | NOT NULL, default `true` | Retensi log 5 thn |
| `serves_prescription` | BOOLEAN | NOT NULL, default (DEPO_*=true, GUDANG_PUSAT=false) | Peran ganda RS Tipe D mikro (BR-A42-11) [PERLU KONFIRMASI nama flag] |
| `status` | ENUM(`DRAFT`,`AKTIF`,`NONAKTIF`) | NOT NULL, default `DRAFT` | State machine §6 |
| `is_active` | BOOLEAN | NOT NULL, default `true` | Turunan `status='AKTIF'` |
| `description` | VARCHAR(255) | NULLABLE | Field kanonik |
| `approval_status` | ENUM(`none`,`pending`,`approved`,`rejected`) | NOT NULL, default `none` | *Reserved — approval di luar modul ini (§4)* |
| `approver_role` | VARCHAR(50) | NULLABLE | *Reserved Phase 2* |
| `created_at`/`created_by`/`updated_at`/`updated_by` | — | audit | — |

#### Table: `distribution_routes`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | PK | — |
| `source_id` | UUID | NOT NULL, FK → `pharmacy_nodes(id)` | ≠ destination (BR-A42-10) |
| `destination_id` | UUID | NOT NULL, FK → `pharmacy_nodes(id)` | — |
| `request_type` | ENUM(`RUTIN`,`CITO`,`EMERGENCY`) | NOT NULL | — |
| `allowed_categories` | JSONB / M2M → `item_categories` (A33) | NULLABLE | Kosong = semua kecuali excluded |
| `excluded_categories` | JSONB / M2M → `item_categories` (A33) | NULLABLE | Menang vs allowed (BR-A42-09) |
| `max_qty_per_request` | INTEGER | NULLABLE, ≥1 | — |
| `frequency_rule` | ENUM(`daily`,`weekly`,`on-demand`) | NOT NULL | — |
| `auto_fulfillment_eligible` | BOOLEAN | NOT NULL, default `false` | BR-A42-03 |
| `auto_fulfillment_threshold` | INTEGER | NULLABLE (wajib bila eligible), ≥1 | Di atas batas → manual di modul distribusi |
| `status` | ENUM(`DRAFT`,`AKTIF`,`NONAKTIF`) | NOT NULL, default `AKTIF` | — |
| `created_at`/`updated_at`/... | — | audit | — |

**Unique constraint**: `(source_id, destination_id, request_type)` — cegah route duplikat (BR-A42-10).

#### Table: `prescription_activity_routing_rules`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | PK | — |
| `source_unit_id` | UUID | NOT NULL, FK → `units(id)` (A3) / `ibs_rooms(id)` (A39) | **Dimensi 1**: unit order (Poli/IGD/Ranap/IBS) |
| `prescription_activity` | ENUM(`ORDER_OBAT_PULANG`,`CPO`,`RETUR_OBAT`,`RESEP_RJ`) | NOT NULL | **Dimensi 2**: jenis aktivitas resep |
| `destination_driver` | ENUM(`LOKASI_PEMBERIAN`,`UNIT_ORDER`,`DEPO_ASAL`) | NOT NULL | Sumber penentu tujuan: CPO→`LOKASI_PEMBERIAN`; Obat Pulang→`UNIT_ORDER`; Retur→`DEPO_ASAL` (BR-A42-18) |
| `delivery_location` | ENUM(`RAWAT_INAP`,`IGD`,`RAWAT_JALAN`,…) | NULLABLE | **Dimensi 3**: lokasi pemberian; wajib bila `destination_driver=LOKASI_PEMBERIAN` (nilai dari checkbox "Diberikan di" runtime) |
| `patient_status_filter` | ENUM(`RJ`,`RI`,`IGD`,`BLPL`) | NULLABLE | Kosong = semua |
| `category_filter` | JSONB / M2M → `item_categories` (A33) | NULLABLE | Dasar fork NPP |
| `fork_npp_target_id` | UUID | NULLABLE (wajib bila kategori NPP), FK → `pharmacy_nodes(id)` | Node DEPO_NPP compliant (BR-A42-02/08) |
| `urgency_routing_id` | UUID | NULLABLE, FK → `pharmacy_nodes(id)` | Override Cito |
| `fallback_depo_id` | UUID | NOT NULL, FK → `pharmacy_nodes(id)` | Default Gudang Pusat (BR-A42-06) |
| `status` | ENUM(`DRAFT`,`AKTIF`,`NONAKTIF`) | NOT NULL, default `AKTIF` | — |

**Unique constraint**: `(source_unit_id, prescription_activity, delivery_location)` — satu mapping unik per kombinasi dimensi (BR-A42-13).

#### Table: `prescription_routing_targets` (multi-target — 1 rule : N depo)

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | PK | — |
| `rule_id` | UUID | NOT NULL, FK → `prescription_activity_routing_rules(id)` | — |
| `target_depo_id` | UUID | NOT NULL, FK → `pharmacy_nodes(id)` | Node DEPO_* aktif; **≥1 baris** per rule (CPO IGD & Ranap = 2 baris) (BR-A42-17) |

> **Multi-target**: satu rule dapat menunjuk >1 depo (mis. CPO diberikan di IGD & Rawat Inap → 2 baris `prescription_routing_targets`). Menggantikan kolom tunggal `target_depo_id` versi sebelumnya.

#### Table: `node_visibility_rules`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | PK | — |
| `node_id` | UUID | NOT NULL, FK → `pharmacy_nodes(id)` | — |
| `visibility_roles` | JSONB / M2M → `roles` (A18) | NOT NULL | NPP → hanya APJ & TTK NPP (BR-A42-07) |
| `cross_depo_visibility_for_doctor` | BOOLEAN | NOT NULL, default `false` | — |

#### Table: `fallback_substitution_rules`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | PK | — |
| `node_id` | UUID | NOT NULL, FK → `pharmacy_nodes(id)` | — |
| `fallback_path_1_id` | UUID | NOT NULL, FK → `pharmacy_nodes(id)` | Default Gudang Pusat, auto-upgrade Cito (BR-A42-06) |
| `fallback_path_2_id` | UUID | NULLABLE, FK → `pharmacy_nodes(id)` | Cross-depo lookup |
| `allow_substitution` | BOOLEAN | NOT NULL, default `false` | Hanya barang `is_substitutable` A4 (BR-A42-12) |

#### Table: `audit_log_pharmacy_master`

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|-----------|------------|
| `id` | UUID | PK | — |
| `entity_type` | ENUM(`node`,`route`,`prescription_rule`,`visibility_rule`,`fallback_rule`) | NOT NULL | — |
| `entity_id` | UUID | NOT NULL | — |
| `action` | ENUM(`create`,`update`,`delete`,`activate`,`deactivate`) | NOT NULL | — |
| `diff` | JSONB | NULLABLE | before/after |
| `user_id`/`user_name` | — | NOT NULL | Pelaku (Admin) |
| `created_at` | TIMESTAMPTZ | NOT NULL, immutable | Retensi 5 thn (NFR-A42-01) |

> **Reserved (template)**: kolom `approval_status`/`approver_role` disertakan hanya di `pharmacy_nodes` sebagai *reserved* demi konsistensi lintas-PRD; approval eksekusi ditangani modul distribusi (§4), tidak diaktifkan di master ini.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pharmacy/nodes` | List node (filter: `type`, `status`, `installation_id`; search) |
| POST | `/api/v1/pharmacy/nodes` | Create node → validasi compliance |
| GET | `/api/v1/pharmacy/nodes/{id}` | Detail node |
| PUT | `/api/v1/pharmacy/nodes/{id}` | Update node |
| PATCH | `/api/v1/pharmacy/nodes/{id}/status` | Aktivasi/non-aktivasi (dependency check) |
| GET/POST/PUT | `/api/v1/pharmacy/routes` | CRUD Route Definition |
| GET/POST/PUT | `/api/v1/pharmacy/prescription-routing` | CRUD Prescription Activity Routing (Unit × Activity × Lokasi → target(s), multi-target) |
| GET/POST/PUT | `/api/v1/pharmacy/visibility-rules` | CRUD Visibility Rules |
| GET/POST/PUT | `/api/v1/pharmacy/fallback-rules` | CRUD Fallback & Substitution Rules |
| GET | `/api/v1/pharmacy/templates` | List template topologi (Minimal/Standar/Lengkap) |
| POST | `/api/v1/pharmacy/templates/{key}/generate` | Generate node+route dari template (status DRAFT) |
| POST | `/api/v1/pharmacy/topology/activate` | Aktifkan topologi (DRAFT → AKTIF) |
| GET | `/api/v1/pharmacy/audit-logs` | Audit log master (filter entity/action/tanggal) |
| GET | `/internal/v1/pharmacy/resolve-route` | **[internal runtime]** Resolve target depo(s) dari `(source_unit, activity, delivery_location[])` + fork NPP + fallback; mengembalikan **array depo** (multi-target) untuk resep/distribusi (FR-A42-13) |
| POST | `/api/v1/pharmacy/import` | **[Phase 2]** Import massal node/route CSV/XLSX |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

**A. Form Node Farmasi**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `node_code` | Kode Node | text | Ya | unik, maks 20, alfanumerik | auto/manual | pola kode master |
| `node_name` | Nama Node | text | Ya | maks 100 | manual | mis. Depo Farmasi RJ |
| `node_type` | Tipe Node | dropdown | Ya | enum 4 tipe | enum | menentukan aturan turunan |
| `installation_id` | Instalasi PJ | dropdown(lookup) | Ya | dari A19 | lookup A19 | — |
| `parent_node_id` | Node Induk | dropdown(lookup) | Kondisional | wajib utk FLOOR_STOCK | lookup A42 | — |
| `person_in_charge_id` | Penanggung Jawab (APJ) | dropdown(lookup) | Ya | dari A2 (role apoteker) | lookup A2 | data referensi |
| `opening_time`/`closing_time` | Jam Buka/Tutup | time | Ya | HH:mm | manual | 24/7 → 00:00–23:59 |
| `npp_storage_compliant` | Brankas NPP Compliant | boolean | Ya | true jika DEPO_NPP | default false | BR-A42-01 |
| `cold_chain_capable` | Cold Chain Capable | boolean | Ya | true/false | default false | BR-A42-04 |
| `requires_apj_on_site` | Wajib APJ On-Site | boolean | Ya | true/false | default false | BR-A42-08 |
| `audit_zone` | Zona Audit PKPO | boolean | Ya | true/false | default true | retensi 5 thn |
| `serves_prescription` | Melayani Resep | boolean | Ya | true/false | default per tipe | BR-A42-11 [PERLU KONFIRMASI] |
| `status` | Status | badge | — | DRAFT/AKTIF/NONAKTIF | sistem | tidak diinput bebas di create |
| `description` | Keterangan | textarea | Tidak | maks 255 | manual | field kanonik |

> Node `FLOOR_STOCK` **tidak** menyimpan whitelist obat life-saving — dikelola modul stok (BR-A42-15).

**B. Form Route Definition**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `source_id` | Node Asal | dropdown(lookup) | Ya | node aktif, ≠ destination | lookup A42 | BR-A42-10 |
| `destination_id` | Node Tujuan | dropdown(lookup) | Ya | node aktif | lookup A42 | — |
| `request_type` | Tipe Permintaan | dropdown | Ya | Rutin/Cito/Emergency | enum | — |
| `allowed_categories` | Kategori Diizinkan | multiselect | Tidak | dari A33 | lookup A33 | kosong = semua kecuali excluded |
| `excluded_categories` | Kategori Dilarang | multiselect | Tidak | dari A33 | lookup A33 | menang vs allowed (BR-A42-09) |
| `max_qty_per_request` | Max Qty/Permintaan | number | Tidak | ≥1 | manual | — |
| `frequency_rule` | Aturan Frekuensi | dropdown | Ya | daily/weekly/on-demand | enum | — |
| `auto_fulfillment_eligible` | Eligible Auto-Fulfillment | boolean | Ya | true/false | default false | BR-A42-03 |
| `auto_fulfillment_threshold` | Batas Qty Auto-Fulfill | number | Kondisional | wajib bila eligible; ≥1 | manual | di atas batas → manual (modul distribusi) |
| `status` | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik |

**C. Form Prescription Activity Routing Rule** (3-dimensi + multi-target)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `source_unit_id` | Unit Order (Asal) | dropdown(lookup) | Ya | dari A3/A39 | lookup A3/A39 | **Dimensi 1** — Poli/IGD/Ranap/IBS |
| `prescription_activity` | Activity Peresepan | dropdown | Ya | Order Obat Pulang / CPO / Retur Obat / Resep RJ | enum | **Dimensi 2** |
| `destination_driver` | Sumber Penentu Tujuan | dropdown | Ya | Lokasi Pemberian / Unit Order / Depo Asal | enum | CPO→Lokasi Pemberian; Obat Pulang→Unit Order; Retur→Depo Asal (BR-A42-18) |
| `delivery_location` | Lokasi Pemberian | dropdown | Kondisional | wajib bila driver=Lokasi Pemberian | enum | **Dimensi 3** — nilai dari checkbox "Diberikan di" (runtime) |
| `target_depo_ids` | Depo Target | **multiselect**(lookup) | Ya | node DEPO_* aktif; **≥1** | lookup A42 | **multi-target** (CPO IGD & Ranap = 2 depo) (BR-A42-17) |
| `patient_status_filter` | Filter Status Pasien | dropdown | Tidak | RJ/RI/IGD/BLPL | enum | kosong = semua |
| `category_filter` | Filter Kategori | multiselect | Tidak | dari A33 | lookup A33 | dasar fork NPP |
| `fork_npp_target_id` | Depo NPP (Fork) | dropdown(lookup) | Kondisional | DEPO_NPP compliant | lookup A42 | wajib bila kategori NPP (BR-A42-02/08) |
| `urgency_routing_id` | Override Routing Cito | dropdown(lookup) | Tidak | node DEPO_* aktif | lookup A42 | — |
| `fallback_depo_id` | Depo Fallback | dropdown(lookup) | Ya | node aktif | lookup A42 | default Gudang Pusat (BR-A42-06) |
| `status` | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik |

> Checkbox **"Diberikan di"** bukan field master — itu input **runtime** di form Input Resep Obat (modul operasional). Master hanya memetakan nilai lokasi tersebut ke depo. Form ini juga **tidak** memiliki field DPHO/Fornas/ketersediaan BPJS (BR-A42-16).

**D. Form Visibility & Fallback/Substitution Rule**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `node_id` | Node | dropdown(lookup) | Ya | node aktif | lookup A42 | — |
| `visibility_roles` | Role Pelihat | multiselect | Ya | dari A18 | lookup A18 | NPP → hanya APJ & TTK NPP (BR-A42-07) |
| `cross_depo_visibility_for_doctor` | Visible utk Dokter | boolean | Ya | true/false | default false | — |
| `fallback_path_1_id` | Fallback Path 1 | dropdown(lookup) | Ya | node aktif | default Gudang Pusat | auto-upgrade Cito (BR-A42-06) |
| `fallback_path_2_id` | Fallback Path 2 (Cross-Depo) | dropdown(lookup) | Tidak | node aktif | lookup A42 | eksekusi transfer di modul distribusi |
| `allow_substitution` | Izinkan Substitusi | boolean | Ya | true/false | default false | hanya barang `is_substitutable` A4 (BR-A42-12) |

**E. Form Import Massal — [Phase 2, bukan MVP]**

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `file_import` | File Import | file | Ya (P2) | .csv/.xlsx sesuai template | upload | field kanonik; format final di Phase 2 |
| `mode_import` | Mode | dropdown | Ya (P2) | tambah / tambah+update | enum | field kanonik |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

**Dashboard / List Node**

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Total Node Aktif | count node where status=AKTIF | angka (kartu) | – | ringkasan |
| Total Depo NPP | count node where type=DEPO_NPP | angka (kartu) | – | indikator compliance |
| Nama Node | `node_name` | text | sort A-Z, filter, search | — |
| Tipe Node | `node_type` | badge (warna per tipe) | filter | NPP badge merah |
| Instalasi | A19.nama | text | filter | — |
| Jam Operasional | `opening_time`–`closing_time` | HH:mm–HH:mm / 24/7 | – | — |
| Compliance | flag npp/cold_chain/apj | ikon badge | filter | merah jika non-compliant tapi tipe NPP |
| Penanggung Jawab | A2.nama | text | filter | APJ/Apoteker (referensi) |
| Status | `status` | badge (draft/aktif/nonaktif) | filter | — |
| Jumlah Route | count route where source/destination=node | angka | sort | — |
| Aksi | — | Detail / Edit / Ubah Status | — | — |

**List Route / Prescription Routing**

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Asal → Tujuan | route.source → destination | "NodeA → NodeB" | sort, filter | — |
| Tipe Permintaan | route.request_type | badge (Rutin/Cito/Emergency) | filter | — |
| Kategori Diizinkan | route.allowed_categories (A33) | chips | filter | — |
| Auto-Fulfillment | route.eligible + threshold | "≤ N qty" / – | filter | di atas batas → manual (modul distribusi) |
| Status | route.status | badge | filter | — |

**Business Rules**:

| ID | Aturan | Sumber/Traceability |
|----|--------|---------------------|
| BR-A42-01 | Hanya node `tipe=DEPO_NPP` + `npp_storage_compliant=true` yang boleh jadi target dispensing/penyimpanan NPP. | UU 35/2009; Permenkes 3/2015 |
| BR-A42-02 | Resep mengandung item NPP **wajib di-fork otomatis**: non-NPP → depo reguler, NPP → Depo NPP. | Skenario 1; g-service-order-resep |
| BR-A42-03 | Permintaan qty ≤ `auto_fulfillment_threshold` pada route eligible → auto-fulfill; di atas threshold → penanganan manual di modul distribusi (belum terakomodasi saat ini). | Skenario 2 |
| BR-A42-04 | Item Cold Chain hanya boleh dirutekan ke node `cold_chain_capable=true`. | STARKES PKPO |
| BR-A42-05 | Permintaan ke Gudang Pusat di luar `operating_hours` masuk antrian hari berikutnya, kecuali di-flag Emergency dengan APJ on-call. | Draft (Operating Hours) |
| BR-A42-06 | Setiap node minimal punya satu fallback path; default = Gudang Pusat, auto-upgrade Cito bila stok target kosong. | Draft (Fallback) |
| BR-A42-07 | Visibility stok Depo NPP **restricted**: hanya APJ & TTK Depo NPP; tidak terlihat dokter umum. | UU 35/2009 |
| BR-A42-08 | Node `requires_apj_on_site=true` hanya boleh operasional bila ada APJ/Apoteker on-site (bukan TTK saja). | Draft (Compliance) |
| BR-A42-09 | `excluded_categories` mengalahkan `allowed_categories` bila konflik pada satu route. | Draft (Route Definition) |
| BR-A42-10 | `source_id` ≠ `destination_id`; tidak boleh route duplikat (source+destination+tipe permintaan). | [ASUMSI] integritas data |
| BR-A42-11 | RS Tipe D mikro (1 Instalasi Farmasi tunggal): 1 node berperan ganda Gudang+Depo (`tipe=GUDANG_PUSAT`, `serves_prescription=true`). | Draft (Template Minimal) [PERLU KONFIRMASI nama flag] |
| BR-A42-12 | Substitusi generik hanya disuggest bila barang `is_substitutable=true` (A4) dan stok habis di seluruh node fallback path. | Draft; integrasi A4 |
| BR-A42-13 | Prescription Activity Routing di-keyed oleh **(source_unit_id, prescription_activity, delivery_location)** dan harus **unik** per kombinasi; satu kombinasi dapat menunjuk **≥1 depo target** (multi-target). | Konsep user (mapping 3-dimensi) |
| BR-A42-17 | Untuk activity `CPO`, tujuan mengikuti **lokasi pemberian** (`delivery_location` dari checkbox "Diberikan di" runtime). Bila >1 lokasi tercentang (mis. IGD & Ranap), resep di-route ke **semua depo** hasil mapping tiap lokasi (multi-target). | Konsep user; contoh CPO IGD+Ranap |
| BR-A42-18 | `destination_driver` menentukan sumber tujuan per activity: `CPO`→`LOKASI_PEMBERIAN`, `ORDER_OBAT_PULANG`→`UNIT_ORDER`, `RETUR_OBAT`→`DEPO_ASAL`. Untuk Obat Pulang & Retur, `delivery_location` diabaikan. | Konsep user |
| BR-A42-14 | Seluruh CRUD master (node, route, prescription routing, visibility, fallback, aktivasi/non-aktivasi) dilakukan role **Admin**; **tidak ada langkah approval** di modul ini. | Instruksi user; A18/A53 |
| BR-A42-15 | Master ini **tidak** menyimpan whitelist obat life-saving Floor Stock; node FLOOR_STOCK hanya topologi + atribut compliance. Whitelist dikelola modul stok. | Instruksi user v1.2 |
| BR-A42-16 | Master ini **tidak** mengevaluasi DPHO/Fornas/ketersediaan per depo untuk resep BPJS; hanya menyediakan target depo/route. Evaluasi di modul resep pelayanan farmasi. | Instruksi user v1.2 |

**Non-Functional Requirements (ringkas):**

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-A42-01 | Audit & retensi immutable | 5 tahun (STARKES PKPO) |
| NFR-A42-02 | Performa baca runtime aturan | ≤ 500 ms p95 (idealnya ≤ 300 ms via in-memory cache) |
| NFR-A42-03 | RBAC — CRUD hanya role Admin; TTK/Dokter/Auditor read-only | wajib (A18/A53) |
| NFR-A42-04 | Enforcement visibility NPP (termasuk via API) | UU 35/2009 |
| NFR-A42-05 | Ketersediaan aturan 24/7 (tahan putus internet eksternal, on-premise/LAN) | last-known-good config |
| NFR-A42-06 | Usability — setup via template ≤ 30 menit oleh Admin non-IT | RS Tipe C/D |
| NFR-A42-07 | Integritas data — validasi referensial + soft-delete dependency check | mencegah broken routing |
| NFR-A42-08 | Skalabilitas ~10 node & puluhan route per RS Tipe C tanpa degradasi | [ASUMSI] |

---

## 9. Workflow / BPMN Interpretation

> **[ASUMSI]** Modul A42 belum punya BPMN sendiri; alur diturunkan secara analogi dari `g-service-order-resep`, `g-service-cpo-order`, `g-service-discharge`, `g-emr-inpatient`.

**Skenario A — Setup Topologi via Template (utama):**
1. Admin buka menu **Master Data > Gudang dan Farmasi**.
2. Pilih **Template Topologi** (Minimal/Standar/Lengkap) sesuai profil RS.
3. Sistem auto-generate node + default routes + default prescription routing (status `DRAFT`).
4. **Gateway: Sesuai kebutuhan RS?** Ya → review atribut; Tidak → edit nama node/parameter, tambah/hapus node/route.
5. Lengkapi atribut compliance per node (brankas NPP, cold chain, APJ on-site, jam operasional).
6. **Gateway: Ada node NPP?** Ya → wajib set `npp_storage_compliant=true` + tetapkan penanggung jawab APJ.
7. **Admin aktifkan** topologi → status `AKTIF` → audit log tercatat *(tanpa approval)*.

**Skenario B — Tambah/Edit Route Definition:**
1. Admin pilih node Source & Destination → set tipe permintaan, allowed/excluded categories, max qty, frequency, auto-fulfillment + threshold.
2. **Gateway: Route melibatkan NPP/Cold Chain?** Ya → validasi compliance node tujuan wajib `true` sebelum simpan. Tidak → langsung simpan.
3. Simpan → audit log.

**Skenario C — Konfigurasi Prescription Activity Routing (3-dimensi):**
1. Admin pilih **Unit Order** (`source_unit`, mis. IGD) → pilih **Activity** (`prescription_activity`: Order Obat Pulang / CPO / Retur Obat).
2. Sistem set `destination_driver` sesuai activity (CPO→Lokasi Pemberian; Obat Pulang→Unit Order; Retur→Depo Asal).
3. Bila driver = Lokasi Pemberian → Admin memetakan tiap **lokasi pemberian** (Rawat Inap/IGD/…) ke **depo target** (boleh **>1 depo** untuk satu kombinasi = multi-target).
4. Set `category_filter`: item NPP → **fork** ke Depo NPP; set `patient_status_filter`, `urgency_routing`, `fallback_depo`.
5. Validasi: target depo & fallback = node aktif; depo NPP compliant; kombinasi (unit+activity+lokasi) unik. Simpan → audit.

*Contoh:* Unit=IGD, Activity=CPO, Lokasi=IGD & Rawat Inap → target = [Depo IGD, Depo Ranap]. Unit=IGD, Activity=Order Obat Pulang → target = [Depo IGD]. Unit=IGD, Activity=Retur Obat → target = [Depo IGD].

**Skenario D — Visibility & Fallback Rules:**
1. Admin set matriks visibility per role (dokter→depo target; TTK→cross-depo; NPP restricted).
2. Set fallback path default (semua depo → Gudang Pusat, auto-upgrade Cito) + cross-depo lookup.
3. Simpan → audit.

**Runtime (dibaca modul operasional, di luar modul ini):** saat dokter menyimpan resep, dokter mencentang **"Diberikan di"** (Rawat Inap/IGD) di form Input Resep Obat → modul operasional memanggil `/internal/v1/pharmacy/resolve-route` dengan `(source_unit, activity, delivery_location[])` → master mengembalikan **array depo target** (multi-target), fork NPP, dan fallback sesuai aturan.

---

## Asumsi
- **Flow approval dihapus** dari modul ini (instruksi user v1.1); seluruh CRUD dilakukan role **Admin** tanpa persetujuan internal. Kolom `approval_status`/`approver_role` bersifat *reserved* demi konsistensi lintas-PRD, tidak diaktifkan.
- Metrik & baseline insiden "resep salah depo", pertimbangan DPHO/Fornas BPJS, whitelist life-saving Floor Stock, serta tracking nomor seri NPP & persetujuan eksekusi berada di **modul lain** (v1.2).
- Import massal node/route (FR-A42-15) digeser ke **Phase 2**; restock auto-trigger = Phase 2; analytics optimisasi topologi = Phase 3.
- RS Tipe C/D diasumsikan SIMRS on-premise/LAN → strategi in-memory cache + cache invalidation + last-known-good config (NFR-A42-02/05), tanpa Redis/offline-first client di MVP.
- APJ/Apoteker dicatat sebagai penanggung jawab node (data referensi), bukan approver.
- Field kanonik (`status`/`description`/`installation_id`/`file_import`/`mode_import`) mengikuti definisi bersama lintas-PRD (A1/A2/A19/A3).

## Pertanyaan Terbuka
- Penamaan flag peran ganda RS Tipe D mikro (`serves_prescription`) belum disepakati. [PERLU KONFIRMASI]
- Dependency modul distribusi/mutasi barang: persetujuan eksekusi (transfer Cito, permintaan di atas threshold) & tracking nomor seri NPP dikonfirmasi AKAN diakomodasi, NAMUN BELUM saat ini. Perlu masuk backlog + rencana transisi (penanganan manual sementara). [PERLU KONFIRMASI / RISIKO]
- Validasi tim infrastruktur RS: SIMRS murni on-premise (LAN) atau ada komponen cloud — menentukan kecukupan in-memory cache & last-known-good. [PERLU KONFIRMASI]
- Format & kolom baku template Import Massal Phase 2. [PERLU KONFIRMASI]
