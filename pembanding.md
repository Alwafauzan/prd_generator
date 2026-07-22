# PRD — Master Data: Gudang dan Farmasi (New) — Include UI

> Disusun mengikuti **template.md**. Sumber pengetahuan: *PRD — Master Data Gudang dan Farmasi (A42) v1.2*. Target: SIMRS RS Tipe C & D. Bagian yang diturunkan dari analogi (bukan dari lampiran sumber) ditandai `[ASUMSI]`; hal yang belum pasti ditandai `[PERLU KONFIRMASI]`.
>
> **Karakter modul:** master *relationship/policy* — menyimpan **topologi node Instalasi Farmasi** (Gudang Pusat, Depo, Depo NPP, Floor Stock) + **aturan routing** (edges) yang menghubungkannya. Berbeda dari master entitas biasa (A4 Barang, A33 Kategori) yang menyimpan objek; modul ini menyimpan **hubungan & aturan** dalam graph operasional farmasi. Dikelola penuh oleh role **Admin** — **tanpa langkah approval** di dalam modul ini (approval eksekusi = ranah modul distribusi).

---

## 1. Metadata Dokumen

* **Approval**: [Nama Stakeholder — mis. Kepala Instalasi Farmasi / APJ / Manajer Operasional, Jabatan, Tanggal] — `[PERLU KONFIRMASI]`
* **Related Documents**:
    * List Fitur V2.xlsx — sheet MVP Fitur Operasional, code **A42**
    * PRD A4 — Master Barang Farmasi (sumber kategori NPP/cold-chain, ROP, `is_substitutable`)
    * PRD A33 — Kategori Barang · A21 — Sediaan Barang · A19 — Instalasi · A2 — Staff · A3 — Unit · A39 — Ruang IBS
    * PRD A18/A37/A53 — Role / Akses Menu / RBAC
    * Design Figma — Master Data Gudang & Farmasi `[PERLU KONFIRMASI]`
    * Regulasi: **UU 35/2009** (Narkotika), **Permenkes 3/2015** (NPP), **Standar STARKES PKPO**
    * BPMN acuan (analogi runtime): `g-service-order-resep`, `g-service-cpo-order`, `g-service-discharge`, `g-emr-inpatient`
* **Document Version**:

    | Tanggal | Versi | Deskripsi Perubahan |
    |---------|-------|---------------------|
    | 2026-07-02 | 1.0 — Include UI | Penyusunan ulang PRD A42 mengikuti template.md; menambah spesifikasi UI (acceptance criteria, wording validasi, state design), skema DB (English), dan rekomendasi API endpoint. Basis konten = A42 v1.2 (approval dihapus, whitelist life-saving & DPHO/Fornas di modul lain, import massal → Phase 2). |

---

## 2. Overview & Background

* **Overview / Brief Summary**:
  **Master Data Gudang dan Farmasi** adalah modul *relationship/policy master* di Control Panel yang menyimpan **topologi node Instalasi Farmasi** beserta **aturan routing** yang menghubungkannya. Modul mendefinisikan empat hal utama:
    1. **Node Topology** — titik penyimpanan & pelayanan farmasi (Gudang Pusat, Depo Standar, Depo NPP, Floor Stock) + atribut compliance (brankas NPP, cold chain, jam operasional, kebutuhan APJ on-site).
    2. **Route Definition (Source → Destination)** — siapa boleh order dari mana, kategori diizinkan/dilarang, batas qty, frekuensi, eligibilitas auto-fulfillment.
    3. **Prescription Routing Rules** — resep dari unit pelayanan (Poli/IGD/Ranap/IBS) diarahkan otomatis ke Depo yang melayaninya, termasuk *fork* otomatis item Narkotika/Psikotropika (NPP) ke Depo NPP.
    4. **Visibility & Fallback Rules** — stok node mana yang terlihat oleh siapa, dan jalur cadangan saat stok target habis.

  Modul ini adalah **fondasi konfigurasi**: proses operasional (order resep, CPO ranap, distribusi stok) **membaca** master ini saat runtime. Pengelola master = role **Admin** (bagian admin), sama seperti master data lain (A1/A2/A19/A33). APJ/Apoteker muncul sebagai **data referensi** (penanggung jawab node), bukan approver.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is** (kondisi saat ini — masalah) `[ASUMSI — diturunkan dari pola BPMN terkait; A42 belum punya BPMN sendiri]`:
        * Routing resep & permintaan stok antar Gudang–Depo **tidak terkonfigurasi sebagai master** — *hardcoded* atau ditentukan manual petugas. Akibat: resep salah depo, antrian dispensing kacau (200–800 resep/hari di Tipe C), permintaan stok tanpa kontrol kategori/qty.
        * Dispensing NPP rawan diproses di depo non-compliant (risiko UU 35/2009, Permenkes 3/2015) karena tak ada routing/fork otomatis.
        * Tak ada flag node cold-chain → obat rantai dingin berisiko dirutekan salah.
        * Tak ada matriks visibility → dokter meresepkan obat yang kosong di depo.
        * Tak ada audit trail terstruktur untuk perubahan aturan distribusi.
        * Setup graph topologi dari nol membebani Admin non-IT.
    * **To-Be** (solusi digital — fondasi konfigurasi terpusat oleh Admin):
        1. **Setup awal**: Admin pilih **template topologi** (Minimal/Standar/Lengkap) → sistem auto-generate node + default routes + default prescription routing → Admin review & adjust → **Admin aktifkan** (tanpa langkah approval).
        2. **Konfigurasi**: Admin mendefinisikan/menyesuaikan Route Definition, Prescription Routing, Visibility, dan Fallback.
        3. **Runtime (dibaca modul lain)**: saat dokter klik "Resep" → sistem baca Prescription Routing → tentukan target depo; item NPP → **fork** ke Depo NPP otomatis. Saat TTK buat Permintaan Distribusi → sistem baca Route → validasi kategori & qty → qty ≤ threshold pada route eligible → **auto-fulfill**; di atas threshold → ditandai untuk **penanganan manual di modul distribusi** (bukan approval di master ini).
        4. **Audit**: setiap perubahan master & keputusan routing tercatat (siapa, kapan, before/after) — retensi 5 tahun (STARKES PKPO).

    > **Catatan phasing (template poin 1):** Phase 1 fokus CRUD + validasi compliance, **tanpa approval berjenjang** (approval eksekusi distribusi ditangani modul distribusi/mutasi barang — di luar modul ini). Skema data tetap menyertakan kolom `approval_status` & `approver_role` (nullable, default `none`) sejak Phase 1 agar arsitektur siap bila kebijakan approval master diperlukan di masa depan. `[ASUMSI]`

---

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Routing resep otomatis tanpa intervensi manual | ≥ 95% resep ter-route otomatis ke depo benar tanpa koreksi manual `[ASUMSI target]` |
| 2 | Kepatuhan dispensing NPP | 100% item NPP ter-fork ke Depo NPP compliant (zero tolerance — UU 35/2009) |
| 3 | Setup cepat oleh Admin RS Tipe C/D | Waktu konfigurasi topologi awal via template ≤ 30 menit `[ASUMSI]` |
| 4 | Kontrol permintaan stok antar node | 100% permintaan distribusi tervalidasi kategori & qty oleh sistem |
| 5 | Auditability | 100% perubahan master tercatat audit log lengkap, retensi 5 tahun (STARKES PKPO) |
| 6 | Visibility benar | 100% akses lihat stok node sesuai matriks visibility role (NPP restricted enforced) |
| 7 | Kelengkapan & validitas konfigurasi (proxy kualitas master) | 100% node/route aktif lolos validasi compliance (NPP/cold-chain/fallback wajib) `[ASUMSI]` |

> **Catatan (v1.2):** Metrik "jumlah insiden resep salah depo" beserta baselinenya **DIHAPUS** dari master ini — pengukuran insiden adalah ranah modul operasional/pelayanan farmasi. Kualitas master diukur lewat **proxy konfigurasi** (validitas compliance node/route) yang dihitung langsung dari data master.

---

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD + Validasi) | Phase 2 (Advanced) |
|-------------|--------------------------------|--------------------|
| CRUD Node Farmasi | Tambah/edit/toggle status node + atribut compliance | — |
| Template Topologi Pre-seeded | 3 template (Minimal/Standar/Lengkap) auto-generate node + default routes + default prescription routing | Template kustom yang dapat disimpan Admin `[ASUMSI]` |
| CRUD Route Definition | Source→Destination, kategori allowed/excluded, max qty, frequency, auto-fulfillment + threshold | — |
| CRUD Prescription Routing | Unit→Depo, filter status/kategori, fork NPP, urgency override, fallback depo | — |
| Visibility & Fallback/Substitution Rules | Matriks visibility per role, fallback path, flag substitusi | — |
| Dashboard & List (Node/Route) | List + filter + kartu ringkasan + visualisasi graph topologi | Graph editor drag-and-drop lanjutan `[ASUMSI]` |
| Audit Log | Catat create/update/delete/toggle (user, waktu, before/after) | Viewer audit lanjutan + diff visual |
| Read API internal | Expose ruleset ke modul operasional (resep/distribusi) | Cache versioning + webhook invalidation |
| Import Massal node/route | — | Import `.csv/.xlsx` (mode tambah / tambah+update); format & kolom template disepakati Phase 2 (FR-015) |
| Restock auto-trigger (stok < X%) | — | **Phase 2** (auto-generate permintaan berbasis threshold) |
| Analytics optimisasi topologi | — | **Phase 3** (untuk Manajer Operasional) |
| Approval workflow master | — (**tidak** ada approval di modul ini; skema `approval_status`/`approver_role` disiapkan nullable) | Bila dibutuhkan; eksekusi approval distribusi = modul distribusi |

**Out of Scope** (ditangani modul lain):

| No | Scope | Ditangani oleh |
|----|-------|----------------|
| 1 | Approval / persetujuan eksekusi (auto-approve, dual-control transfer Cito) | Modul Distribusi/Mutasi Barang — **dependency v1.2: dikonfirmasi akan diakomodasi, namun belum terakomodasi saat ini** (lihat Open Questions) |
| 2 | Tracking nomor seri kemasan NPP (dual-control) | Modul Distribusi / Mutasi Barang |
| 3 | Metrik & baseline insiden "resep salah depo" | Modul operasional/pelayanan farmasi |
| 4 | Routing resep BPJS berbasis DPHO/Fornas & ketersediaan per depo | Modul Resep Pelayanan Farmasi |
| 5 | Whitelist obat life-saving Floor Stock | Modul Stok |
| 6 | Eksekusi runtime alur resep/distribusi | `g-service-order-resep`, `g-service-cpo-order`, distribusi internal |
| 7 | Master entitas obat & atribut ROP/`is_substitutable` | A4 Barang Farmasi (direferensikan) |
| 8 | Master Kategori (A33), Sediaan (A21), Instalasi (A19), Staff (A2), Unit (A3) | Direferensikan, tidak didefinisikan ulang |
| 9 | Gudang non-farmasi (Rumah Tangga, Gizi/A6), Lab, Radiologi | Master terpisah |
| 10 | Manajemen stok/saldo riil per node | Modul Inventory |

> Catatan phasing: Phase 1 fokus CRUD + validasi compliance tanpa approval berjenjang. Kolom `approval_status`/`approver_role` (nullable) disiapkan sejak Phase 1 agar arsitektur siap. Import massal, restock auto-trigger → Phase 2; analytics → Phase 3.

---

## 5. Related Features

| No | Code | Module | Feature | Relasi dengan A42 |
|----|------|--------|---------|-------------------|
| 1 | **A42** | Master Data | Gudang dan Farmasi (New) | **Modul ini** (dikelola role Admin) |
| 2 | A4 | Master Data | Barang Farmasi | Sumber atribut kategori NPP/cold-chain, ROP, `is_substitutable` per barang (dasar substitution & validasi route) |
| 3 | A33 | Master Data | Kategori Barang | Sumber `allowed_categories`/`excluded_categories` per route |
| 4 | A21 | Master Data | Sediaan Barang (New) | Referensi bentuk sediaan barang yang dirutekan |
| 5 | A19 | Master Data | Instalasi (New) | Instalasi induk node (Instalasi Farmasi) |
| 6 | A2 | Master Data | Staff | Sumber APJ/Apoteker/TTK sebagai **penanggung jawab node** (referensi, bukan approver) |
| 7 | A18/A37/A53 | Control Panel | Role / Akses Menu / RBAC | Akses Admin ke master & visibility stok per role |
| 8 | A3 | Master Data | Unit | Sumber `source_unit_pelayanan` (Poli/IGD/Ranap/IBS) pada Prescription Routing |
| 9 | A39 | Master Data | Ruang IBS | Sumber unit IBS untuk routing resep operasi |
| 10 | A36/A35 | Master Data | Grup Obat / Farmaco | Klasifikasi obat pendukung kategori routing |
| 11 | — | Operasional | `g-service-order-resep` / `g-service-cpo-order` / `g-service-discharge` | **Konsumen** aturan routing/visibility saat runtime (Out Scope eksekusi) |
| 12 | — | Operasional | Modul Distribusi/Mutasi · Resep Pelayanan Farmasi · Stok | Konsumen route/threshold/topologi; menangani approval eksekusi, DPHO/Fornas, whitelist life-saving |

---

## 6. Business Process & User Stories

### State Machine Table — Status Node & Aturan

Semua entitas master (node, route, prescription rule, visibility rule) memakai pola status **aktif/nonaktif** (soft delete). Status **tidak** diinput saat create — sistem set `AKTIF` otomatis; aktivasi/non-aktivasi dilakukan di **level Dashboard** (toggle).

| Status | Deskripsi | Efek pada Runtime (dibaca modul operasional) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------------------------------------------|--------------------|--------------------|
| `AKTIF` | Entitas aktif & dapat dibaca modul operasional | Node/route/rule dipakai routing, dispensing, distribusi | → `NONAKTIF` (dengan dependency check) | idem (opsional approval bila kebijakan master approval diaktifkan) |
| `NONAKTIF` | Entitas dinonaktifkan (soft delete) | Tidak dipakai routing baru; route/rule yang menunjuknya ditandai *broken* → wajib diperbaiki | → `AKTIF` (bila validasi compliance lolos) | idem |
| `DRAFT_TEMPLATE` | Node/route hasil generate template belum diaktifkan Admin | Belum dibaca modul operasional; menunggu review Admin | → `AKTIF` (Admin aktifkan) | idem |

**Aturan aktivasi khusus (gate compliance saat `DRAFT_TEMPLATE`/`NONAKTIF` → `AKTIF`):**
* Node `tipe=DEPO_NPP` hanya boleh AKTIF bila `npp_storage_compliant=true` **dan** punya penanggung jawab APJ (BR-001, BR-008).
* Node `requires_apj_on_site=true` hanya boleh operasional bila ada APJ/Apoteker on-site (bukan TTK saja) (BR-008).
* Setiap node minimal punya satu fallback path sebelum aktif (BR-006).

> **Aturan status form:** status **tidak** diinput saat create (sistem set `AKTIF`, atau `DRAFT_TEMPLATE` bila lahir dari template). Perubahan status via aksi Dashboard, dengan **dependency check** referensial (NFR-007).

### User Stories Utama

| ID | User Story | Prioritas | Fase |
|----|-----------|-----------|------|
| US-001 | Sebagai **Admin**, saya ingin memilih template topologi (Minimal/Standar/Lengkap), agar tak perlu membangun graph node dari nol. | P0 | 1 |
| US-002 | Sebagai **Admin**, saya ingin meninjau & mengaktifkan topologi hasil template, agar konfigurasi sesuai kondisi RS sebelum dipakai. | P0 | 1 |
| US-003 | Sebagai **Admin**, saya ingin menandai node sebagai Depo NPP berbrankas + set penanggung jawab APJ, agar dispensing NPP hanya di tempat compliant. | P0 | 1 |
| US-004 | Sebagai **Admin**, saya ingin mengatur route distribusi per depo, agar permintaan stok ke Gudang Pusat tervalidasi kategori & qty. | P0 | 1 |
| US-005 | Sebagai **Admin**, saya ingin mengatur prescription routing agar resep tiap poli otomatis ke depo yang melayaninya. | P0 | 1 |
| US-006 | Sebagai **Admin**, saya ingin resep berisi Narkotika otomatis ter-fork ke Depo NPP, agar item NPP diambil di tempat berbrankas. | P0 | 1 |
| US-007 | Sebagai **Admin**, saya ingin mengatur threshold auto-fulfillment per route, agar permintaan rutin kecil langsung dipenuhi tanpa penanganan manual. | P0 | 1 |
| US-008 | Sebagai **Dokter**, saya ingin melihat ketersediaan stok di depo target resep saya (sesuai visibility), agar tak meresepkan obat kosong. | P1 | 1 |
| US-009 | Sebagai **TTK**, saya ingin melihat aturan route & depo tempat saya bertugas (read-only), agar memahami alur saat order/dispense. | P1 | 1 |
| US-010 | Sebagai **TTK Depo**, saya ingin cross-depo lookup stok depo lain, agar koordinasi transfer saat stok saya habis. | P1 | 1 |
| US-011 | Sebagai **Auditor**, saya ingin melihat audit log perubahan master & keputusan routing, agar memenuhi audit STARKES PKPO. | P1 | 1 |
| US-012 | Sebagai **Admin**, saya ingin menandai node cold-chain capable, agar obat rantai dingin hanya dirutekan ke node berkulkas terkalibrasi. | P0 | 1 |
| US-013 | Sebagai **Admin**, saya ingin mendefinisikan fallback path & aturan substitusi, agar pelayanan berjalan saat stok depo target habis. | P1 | 1 |
| US-014 | Sebagai **Admin**, saya ingin impor massal node/route via CSV/XLSX, agar setup RS multi-depo cepat. | P2 | 2 |

---

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

---

**Fitur: Setup Topologi via Template Pre-seeded** *(FR-002)*
* **User Story**: Sebagai Admin, saya ingin memilih template topologi farmasi, agar tak membangun graph node dari nol. *(US-001, US-002)*
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Tersedia 3 template — **Minimal** (RS Tipe D mikro: 1 node Gudang+Depo peran ganda), **Standar** (Gudang Pusat + Depo RJ + Depo RI), **Lengkap** (+ Depo NPP + Depo IGD 24/7 + Floor Stock).
    * **AC 2**: Memilih template meng-generate node + default routes + default prescription routing dengan status `DRAFT_TEMPLATE` (belum dibaca modul operasional).
    * **AC 3**: Admin dapat mengedit nama node, parameter, dan menambah/menghapus node/route hasil generate sebelum aktivasi (Gateway "Sesuai kebutuhan RS?").
    * **AC 4**: Aktivasi topologi hanya berhasil bila seluruh gate compliance lolos (Depo NPP compliant + ada APJ; setiap node punya fallback) — bila gagal, sistem menampilkan daftar node/route yang belum valid.
    * **AC 5**: Aktivasi mencatat audit log (user, timestamp, template dipilih). **Tanpa langkah approval.**

* **Validasi (Wording Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Pilih Template | Radio card | Required | "Pilih salah satu template topologi untuk melanjutkan." | "Minimal untuk RS Tipe D mikro; Lengkap untuk RS dengan Depo NPP & IGD 24/7." |
  | Aktifkan Topologi | Button | Semua gate compliance lolos | "Topologi belum dapat diaktifkan: [N] node/route belum memenuhi syarat compliance. Lihat daftar." | "Depo NPP wajib brankas + APJ; setiap node wajib punya fallback." |

* **State Design (UI/UX)**:
  * **Read-only**: Kolom audit (`created_by`, `created_at`) tidak ditampilkan di layar generate.
  * **Button State**: [Generate dari Template] disabled sebelum template dipilih; [Aktifkan] disabled selama masih ada node/route berstatus invalid; spinner "Membuat topologi..." saat generate.
  * **Empty State**: Bila belum ada topologi: *"Belum ada topologi farmasi. Pilih template untuk mulai, atau tambah node manual."*

---

**Fitur: CRUD Node Farmasi** *(FR-001, FR-003)*
* **User Story**: Sebagai Admin, saya ingin mengelola node farmasi + atribut compliance, agar dispensing sesuai regulasi. *(US-003, US-012)*
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memuat seluruh field pada §8.3.1 (Form Node Farmasi).
    * **AC 2**: `tipe_node` = enum GUDANG_PUSAT / DEPO_STANDAR / DEPO_NPP / FLOOR_STOCK; memilih tipe mengaktifkan validasi turunan (BR-001, BR-008).
    * **AC 3**: Bila `tipe_node = DEPO_NPP`, field `npp_storage_compliant` wajib `true` dan `penanggung_jawab_id` (APJ) wajib sebelum node dapat diaktifkan (BR-001).
    * **AC 4**: Bila `tipe_node = FLOOR_STOCK`, field `parent_node_id` wajib; **tidak** ada field whitelist obat life-saving (dikelola modul stok — BR-015).
    * **AC 5**: `status_aktif` **tidak** ditampilkan di form create; sistem set `AKTIF` otomatis (atau `DRAFT_TEMPLATE` bila dari template). Toggle status via Dashboard dengan dependency check.
    * **AC 6**: `jam_buka` < `jam_tutup`, kecuali mode 24/7 (`00:00–23:59`) (BR-005).
    * **AC 7**: Semua create/update/toggle tercatat audit log (before/after).

* **Validasi (Wording Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode Node | Text | Required, unik, maks 20, alfanumerik | "Kode node wajib diisi dan harus unik (maks 20 karakter alfanumerik)." | "Contoh: DEPO-RJ-01. Bisa auto-generate." |
  | Nama Node | Text | Required, maks 100 | "Nama node wajib diisi." | "Contoh: Depo Farmasi Rawat Jalan." |
  | Tipe Node | Dropdown | Required | "Tipe node wajib dipilih." | "Menentukan aturan compliance turunan." |
  | Instalasi Penanggung Jawab | Dropdown (lookup A19) | Required | "Instalasi penanggung jawab wajib dipilih." | "Sumber dari Master Instalasi." |
  | Node Induk | Dropdown (lookup A42) | Wajib bila FLOOR_STOCK | "Node induk wajib untuk Floor Stock/sub-stock." | "Node di atasnya pada hierarki." |
  | Penanggung Jawab (APJ) | Dropdown (lookup A2) | Required (role apoteker); wajib bila DEPO_NPP | "Penanggung jawab (APJ/Apoteker) wajib dipilih." | "Data referensi, bukan approver." |
  | Brankas NPP Compliant | Toggle | Wajib true bila DEPO_NPP | "Depo NPP wajib brankas compliant (UU 35/2009)." | "Aktifkan bila node punya brankas NPP terstandar." |
  | Cold Chain Capable | Toggle | — | — | "Aktifkan bila ada kulkas 2–8°C terkalibrasi." |
  | Wajib APJ On-Site | Toggle | — | — | "Node hanya operasional bila APJ/Apoteker on-site." |
  | Jam Buka / Jam Tutup | Time | Required, buka < tutup (atau 24/7) | "Jam buka harus lebih awal dari jam tutup." | "Isi 00:00–23:59 untuk operasional 24/7." |
  | Kapasitas Max (SKU) | Number | ≥ 0 | "Kapasitas tidak boleh negatif." | "Opsional; per kategori bila perlu." |

* **State Design (UI/UX)**:
  * **Read-only**: `created_by`, `created_at`, `updated_by`, `updated_at` tidak ditampilkan di form.
  * **Conditional fields**: `parent_node_id` wajib & disorot saat tipe=FLOOR_STOCK; `npp_storage_compliant` di-*enforce* true saat tipe=DEPO_NPP; `serves_prescription` default true untuk DEPO_*, false untuk GUDANG_PUSAT (BR-011) `[PERLU KONFIRMASI nama flag]`.
  * **Button State**: [Simpan] disabled selama field wajib kosong / ada error; spinner "Menyimpan...".
  * **Empty State (list node)**: *"Belum ada node farmasi. Buat via template atau tambah manual."*

---

**Fitur: CRUD Route Definition (Source → Destination)** *(FR-004, FR-005, FR-006)*
* **User Story**: Sebagai Admin, saya ingin mengatur route distribusi antar node, agar permintaan stok tervalidasi kategori & qty. *(US-004, US-007)*
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memuat field pada §8.3.1 (Form Route Definition).
    * **AC 2**: Sistem menolak route bila `source_id = destination_id` atau duplikat kombinasi (source + destination + tipe_permintaan) (BR-010).
    * **AC 3**: Bila route melibatkan kategori NPP/Cold Chain, sistem **memvalidasi node tujuan compliant** (`npp_storage_compliant`/`cold_chain_capable = true`) sebelum simpan (BR-004; Skenario B).
    * **AC 4**: `excluded_categories` mengalahkan `allowed_categories` saat konflik (BR-009).
    * **AC 5**: `auto_fulfillment_threshold` **wajib** bila `auto_fulfillment_eligible = true` (≥ 1); di atas threshold → runtime tandai "penanganan manual di modul distribusi" (BR-003).
    * **AC 6**: **Tidak** ada field `approval_level` di form (approval dihapus dari master ini).

* **Validasi (Wording Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Node Asal | Dropdown (lookup node aktif) | Required, ≠ tujuan | "Node asal wajib dipilih dan tidak boleh sama dengan tujuan." | — |
  | Node Tujuan | Dropdown (lookup node aktif) | Required | "Node tujuan wajib dipilih." | — |
  | Tipe Permintaan | Dropdown | Required (Rutin/Cito/Emergency) | "Tipe permintaan wajib dipilih." | — |
  | Kategori Diizinkan | Multiselect (lookup A33) | — | — | "Kosong = semua kategori kecuali yang dilarang." |
  | Kategori Dilarang | Multiselect (lookup A33) | — | — | "Menang atas kategori diizinkan bila konflik." |
  | Max Qty per Permintaan | Number | ≥ 1 | "Max qty minimal 1." | — |
  | Aturan Frekuensi | Dropdown | Required (daily/weekly/on-demand) | "Aturan frekuensi wajib dipilih." | — |
  | Eligible Auto-Fulfillment | Toggle | — | — | "Aktifkan agar permintaan kecil langsung dipenuhi." |
  | Batas Qty Auto-Fulfill | Number | Wajib bila eligible; ≥ 1 | "Batas qty auto-fulfill wajib diisi bila eligible aktif." | "Di atas batas → ditangani manual di modul distribusi." |
  | (Server) Compliance tujuan | — | NPP/Cold-Chain route → node tujuan compliant | "Node tujuan tidak memenuhi syarat compliance untuk kategori NPP/Cold Chain." | — |
  | (Server) Duplikat route | — | source+destination+tipe unik | "Route dengan asal, tujuan, dan tipe yang sama sudah ada." | — |

* **State Design (UI/UX)**:
  * **Conditional field**: `auto_fulfillment_threshold` muncul/wajib hanya saat `auto_fulfillment_eligible = true`.
  * **Button State**: [Simpan] disabled bila validasi frontend gagal; spinner saat submit.
  * **Empty State (list route)**: *"Belum ada route. Tambah route atau generate dari template."*

---

**Fitur: CRUD Prescription Routing Rule (+ Fork NPP)** *(FR-007, FR-008)*
* **User Story**: Sebagai Admin, saya ingin resep tiap unit otomatis ke depo pelayan, & item NPP ter-fork ke Depo NPP. *(US-005, US-006)*
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memuat field pada §8.3.1 (Form Prescription Routing Rule).
    * **AC 2**: `target_depo_id`, `urgency_routing`, `fallback_depo_id` hanya menerima node tipe DEPO_* yang **aktif** (validasi referensial).
    * **AC 3**: Bila `category_filter` mencakup kategori NPP, `fork_npp_target_id` **wajib** dan node target harus `tipe=DEPO_NPP` + `npp_storage_compliant=true` (BR-002, BR-008; FR-008).
    * **AC 4**: `fallback_depo_id` wajib; default Gudang Pusat dengan auto-upgrade Cito bila stok target kosong (BR-006).
    * **AC 5**: Default 1 unit pelayanan → 1 target depo (one-to-one); multi-target hanya untuk fork NPP (BR-013).
    * **AC 6**: Form **tidak** memiliki field evaluasi DPHO/Fornas atau ketersediaan stok BPJS (ranah modul resep pelayanan farmasi — BR-016).

* **Validasi (Wording Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Unit Pelayanan Asal | Dropdown (lookup A3/A39) | Required | "Unit pelayanan asal wajib dipilih." | "Poli/IGD/Ranap/IBS." |
  | Depo Target | Dropdown (lookup node DEPO_* aktif) | Required | "Depo target wajib dipilih dan harus aktif." | — |
  | Filter Status Pasien | Dropdown | — (RJ/RI/IGD/BLPL) | — | "Kosong = berlaku semua status." |
  | Filter Kategori | Multiselect (lookup A33) | — | — | "Dasar fork NPP." |
  | Depo NPP (Fork) | Dropdown (lookup DEPO_NPP compliant) | Wajib bila kategori NPP dipilih | "Depo NPP fork wajib diisi untuk resep berkategori Narkotika/Psikotropika, dan harus compliant." | "Item NPP dialihkan otomatis ke depo berbrankas." |
  | Override Routing Cito | Dropdown (lookup node DEPO_* aktif) | — | — | "Mis. Cito ranap → Depo IGD 24/7." |
  | Depo Fallback | Dropdown (lookup node aktif) | Required | "Depo fallback wajib dipilih." | "Default Gudang Pusat (BR-006)." |

* **State Design (UI/UX)**:
  * **Conditional field**: `fork_npp_target_id` muncul & wajib saat `category_filter` memuat kategori NPP.
  * **Button State**: [Simpan] disabled bila validasi gagal; spinner saat submit.
  * **Empty State**: *"Belum ada aturan prescription routing. Tambahkan pemetaan unit → depo."*

---

**Fitur: Visibility & Fallback/Substitution Rules** *(FR-009, FR-010)*
* **User Story**: Sebagai Admin, saya ingin mengatur siapa melihat stok node & jalur cadangan/substitusi. *(US-008, US-010, US-013)*
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Form memuat field pada §8.3.1 (Form Visibility & Fallback/Substitution).
    * **AC 2**: Node `tipe=DEPO_NPP` → visibility **restricted**: hanya role APJ & TTK Depo NPP; tidak terlihat dokter umum (BR-007; enforced hingga API — NFR-004).
    * **AC 3**: Minimal 1 fallback path per node; default Gudang Pusat dengan auto-upgrade Cito (BR-006).
    * **AC 4**: `allow_substitution=true` hanya berlaku untuk barang `is_substitutable=true` (referensi A4) & stok habis di seluruh node fallback path (BR-012).
    * **AC 5**: Eksekusi transfer cross-depo **tidak** dilakukan di modul ini (ditangani modul distribusi) — master hanya mendefinisikan lookup.

* **Validasi (Wording Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Node | Dropdown (lookup node aktif) | Required | "Node wajib dipilih." | — |
  | Role Pelihat | Multiselect (lookup A18) | Required | "Minimal satu role pelihat wajib dipilih." | "Node NPP hanya boleh APJ & TTK NPP." |
  | Visible untuk Dokter | Toggle | Node NPP → dipaksa off | "Stok Depo NPP tidak boleh terlihat oleh dokter umum (UU 35/2009)." | "Cross-depo lookup untuk dokter." |
  | Fallback Path 1 | Dropdown (lookup node aktif) | Required | "Fallback path 1 wajib dipilih." | "Default Gudang Pusat, auto-upgrade Cito." |
  | Fallback Path 2 (Cross-Depo) | Dropdown (lookup node aktif) | — | — | "Eksekusi transfer ditangani modul distribusi." |
  | Izinkan Substitusi | Toggle | — | — | "Hanya untuk barang is_substitutable (A4)." |

* **State Design (UI/UX)**:
  * **Read-only enforcement**: Bila node terpilih bertipe DEPO_NPP, toggle "Visible untuk Dokter" dikunci off dan multiselect role membatasi pilihan ke role NPP.
  * **Button State**: [Simpan] disabled bila role pelihat kosong / fallback 1 kosong.

---

**Fitur: Dashboard & List Node/Route + Graph Topologi** *(FR-012)*
* **User Story**: Sebagai Admin, saya ingin melihat ringkasan, list, dan graph topologi. *(US-002, US-009)*
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Dashboard menampilkan kartu ringkasan: Total Node Aktif, Total Depo NPP, Total Route Aktif, Node Non-Compliant (indikator merah).
    * **AC 2**: List Node menampilkan kolom pada §8.3.2 dengan filter tipe node, status, compliance, instalasi; badge warna per tipe (NPP merah).
    * **AC 3**: List Route/Prescription Routing menampilkan "Asal → Tujuan", tipe permintaan, kategori, auto-fulfillment, status.
    * **AC 4**: Tersedia visualisasi **graph node-edge** (node = titik, route = edge berlabel) untuk memudahkan review Admin `[ASUMSI bentuk UI menyesuaikan kapasitas tim]`.
    * **AC 5**: Aksi per baris: Edit, Detail, Ubah Status (toggle). Node/route tidak dapat dihapus permanen bila direferensikan runtime — hanya soft delete (NFR-007).

* **Validasi (Wording Frontend)**:

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Search Node/Route | Text | — | — | "Cari nama/kode node atau route..." |
  | Filter Tipe Node | Dropdown | — | — | "Semua tipe" bila kosong |
  | Filter Status | Dropdown | — | — | "Semua status" bila kosong |
  | Toggle Ubah Status (ke NONAKTIF) | Button | Dependency check | Modal: "Node/route ini masih dipakai [N] route/rule aktif. Nonaktifkan akan memutus routing tersebut. Lanjutkan?" | — |

* **State Design (UI/UX)**:
  * **Read-only**: seluruh tabel read-only; aksi via kolom Aksi (bukan inline edit).
  * **Button State**: [Ubah Status] menampilkan konfirmasi bila ada dependency; spinner saat proses. [Reset Filter] muncul hanya bila ada filter aktif.
  * **Empty State**: tanpa data → *"Belum ada node/route. Mulai dari template."*; ada filter tanpa hasil → *"Tidak ada data cocok. Ubah/reset filter."*

---

**Fitur: Audit Log Master** *(FR-011)*
* **User Story**: Sebagai Auditor, saya ingin melihat audit log perubahan master, agar memenuhi STARKES PKPO. *(US-011)*
* **Prioritas**: P1 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Setiap create/update/delete (soft) & toggle status node/route/rule tercatat: user, timestamp, aksi, entitas, **before/after (diff)**.
    * **AC 2**: Audit log **immutable** & retensi minimal **5 tahun** (STARKES PKPO — NFR-001).
    * **AC 3**: Viewer audit mendukung filter berdasarkan entitas, tipe aksi, user, dan rentang tanggal; sort waktu desc.

* **State Design (UI/UX)**: read-only viewer; Empty State: *"Belum ada aktivitas tercatat."*

---

**Fitur: Read API Internal untuk Modul Operasional** *(FR-013)*
* **User Story**: Sebagai Sistem (modul resep/distribusi), saya ingin membaca ruleset routing/visibility saat runtime.
* **Prioritas**: P0 · **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Tersedia endpoint internal read-only (lihat §8.2) yang mengembalikan node/route/prescription-routing/visibility aktif.
    * **AC 2**: Pembacaan ruleset ≤ 500 ms (idealnya ≤ 300 ms) via in-memory cache (NFR-002).
    * **AC 3**: Perubahan master → bump versi konfigurasi → modul operasional reload cache; sediakan **last-known-good** saat DB sesaat tak terjangkau (NFR-005).
    * **AC 4**: Data stok/visibility NPP **tidak** terekspos ke role tidak berhak bahkan via API (NFR-004).
    * **AC 5**: Endpoint hanya diakses service internal (service token) — tidak exposed publik.

---

**Fitur: Import Massal Node/Route `[Phase 2]`** *(FR-015)*
* **User Story**: Sebagai Admin, saya ingin impor massal node/route via CSV/XLSX. *(US-014)*
* **Prioritas**: P2 · **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Unduh template `.csv/.xlsx`; unggah dengan mode `tambah` / `tambah+update`. Format & kolom final disepakati di Phase 2.
    * **AC 2**: Validasi per baris (compliance, referensial); baris invalid dilaporkan tanpa membatalkan baris valid.
    * **AC 3**: Node/route hasil import masuk status `DRAFT_TEMPLATE`, wajib di-review & diaktifkan Admin.

    > **Catatan:** Placeholder field tercatat di §8.3.1 (Form Import Massal) untuk referensi; **tidak** diimplementasikan di MVP (instruksi user v1.2).

### 7.2 Ringkasan FR ↔ Fase

| FR | Requirement (ringkas) | Fase | Traceability |
|----|-----------------------|------|--------------|
| FR-001 | CRUD Node Farmasi (4 tipe) | 1 | US-001..003 |
| FR-002 | 3 template topologi pre-seeded | 1 | US-001 |
| FR-003 | Validasi atribut compliance node | 1 | BR-001,004,008 |
| FR-004 | CRUD Route Definition | 1 | US-004,007 |
| FR-005 | Tolak route self/duplikat | 1 | BR-010 |
| FR-006 | Presedensi excluded > allowed | 1 | BR-009 |
| FR-007 | CRUD Prescription Routing (+ fork NPP) | 1 | US-005,006 |
| FR-008 | Validasi depo NPP compliant sebelum fork | 1 | BR-001,002 |
| FR-009 | Konfigurasi Visibility Rules | 1 | US-008,010; BR-007 |
| FR-010 | Fallback & Substitution Rules | 1 | US-013; BR-006,012 |
| FR-011 | Audit log immutable retensi 5 thn | 1 | US-011; PKPO |
| FR-012 | Dashboard/list + graph topologi | 1 | US-002,009 |
| FR-013 | Read API internal ke modul operasional | 1 | integrasi internal |
| FR-014 | Mode RS Tipe D mikro (peran ganda) | 1 | BR-011 |
| FR-015 | Import massal node/route | 2 | Phase 2 |
| FR-016 | Batasi CRUD hanya role Admin; tanpa approval | 1 | BR-014 |
| FR-017 | Tidak menyediakan whitelist life-saving / evaluasi DPHO-Fornas | 1 | BR-015,016 |

---

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

> Semua tabel menyertakan `approval_status`/`approver_role` (nullable, default `none`) untuk kesiapan arsitektur Phase 2, meski approval **tidak** dipakai di modul ini.

* **Table Name**: `pharmacy_node`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `node_code`: VARCHAR(20) — unik, alfanumerik (BR-010 pola master)
    * `name`: VARCHAR(100) NOT NULL
    * `node_type`: ENUM('GUDANG_PUSAT','DEPO_STANDAR','DEPO_NPP','FLOOR_STOCK') NOT NULL
    * `installation_id`: UUID NOT NULL (FK → `master_installation`, A19)
    * `parent_node_id`: UUID NULL (FK → `pharmacy_node.id`, self-ref; wajib untuk FLOOR_STOCK)
    * `person_in_charge_id`: UUID NULL (FK → `master_staff`, A2; role apoteker) — wajib bila DEPO_NPP
    * `address`: VARCHAR(255) NULL
    * `contact`: VARCHAR(30) NULL
    * `open_time`: TIME NOT NULL
    * `close_time`: TIME NOT NULL — 24/7 → 00:00–23:59
    * `max_sku_capacity`: INT NULL — CHECK ≥ 0
    * `npp_storage_compliant`: BOOLEAN NOT NULL DEFAULT false — CHECK: true bila `node_type='DEPO_NPP'` (BR-001)
    * `cold_chain_capable`: BOOLEAN NOT NULL DEFAULT false (BR-004)
    * `requires_apj_on_site`: BOOLEAN NOT NULL DEFAULT false (BR-008)
    * `audit_zone`: BOOLEAN NOT NULL DEFAULT true — retensi log 5 thn
    * `serves_prescription`: BOOLEAN NOT NULL — default true untuk DEPO_*, false GUDANG_PUSAT (BR-011) `[PERLU KONFIRMASI nama flag]`
    * `status`: ENUM('AKTIF','NONAKTIF','DRAFT_TEMPLATE') NOT NULL DEFAULT 'AKTIF'
    * `notes`: VARCHAR(255) NULL
    * `approval_status`: ENUM('none','pending','approved','rejected') DEFAULT 'none' — *disiapkan Phase 2*
    * `approver_role`: VARCHAR(50) NULL — *disiapkan Phase 2*
    * `is_active`: BOOLEAN GENERATED — turunan `status='AKTIF'`
    * `created_at`, `updated_at`, `created_by`, `updated_by`

* **Table Name**: `pharmacy_route`
* **Key Columns**:
    * `id`: UUID (PK)
    * `source_id`: UUID NOT NULL (FK → `pharmacy_node.id`)
    * `destination_id`: UUID NOT NULL (FK → `pharmacy_node.id`) — CHECK `source_id <> destination_id` (BR-010)
    * `request_type`: ENUM('RUTIN','CITO','EMERGENCY') NOT NULL
    * `allowed_categories`: JSONB NULL — array FK Kategori (A33); kosong = semua kecuali excluded
    * `excluded_categories`: JSONB NULL — menang atas allowed (BR-009)
    * `max_qty_per_request`: INT NULL — CHECK ≥ 1
    * `frequency_rule`: ENUM('daily','weekly','on-demand') NOT NULL
    * `auto_fulfillment_eligible`: BOOLEAN NOT NULL DEFAULT false (BR-003)
    * `auto_fulfillment_threshold`: INT NULL — NOT NULL bila eligible=true; CHECK ≥ 1
    * `status`: ENUM('AKTIF','NONAKTIF','DRAFT_TEMPLATE') NOT NULL DEFAULT 'AKTIF'
    * `approval_status`, `approver_role`: *disiapkan Phase 2*
    * `created_at`, `updated_at`, `created_by`, `updated_by`
    * *Unique index*: `(source_id, destination_id, request_type)` (BR-010)

* **Table Name**: `prescription_routing_rule`
* **Key Columns**:
    * `id`: UUID (PK)
    * `source_unit_id`: UUID NOT NULL (FK → `master_unit` A3 / `master_ibs_room` A39)
    * `target_depo_id`: UUID NOT NULL (FK → `pharmacy_node.id`, tipe DEPO_* aktif)
    * `patient_status_filter`: ENUM('RJ','RI','IGD','BLPL') NULL — null = semua
    * `category_filter`: JSONB NULL — array FK Kategori (A33)
    * `fork_npp_target_id`: UUID NULL (FK → `pharmacy_node.id`, DEPO_NPP compliant) — wajib bila kategori NPP (BR-002,008)
    * `urgency_routing_id`: UUID NULL (FK → `pharmacy_node.id`, DEPO_* aktif)
    * `fallback_depo_id`: UUID NOT NULL (FK → `pharmacy_node.id`, aktif) — default Gudang Pusat (BR-006)
    * `status`: ENUM('AKTIF','NONAKTIF','DRAFT_TEMPLATE') NOT NULL DEFAULT 'AKTIF'
    * `approval_status`, `approver_role`: *disiapkan Phase 2*
    * `created_at`, `updated_at`, `created_by`, `updated_by`

* **Table Name**: `node_visibility_rule`
* **Key Columns**:
    * `id`: UUID (PK) · `node_id`: UUID NOT NULL (FK → `pharmacy_node.id`)
    * `visibility_roles`: JSONB NOT NULL — array FK Role (A18); NPP → hanya APJ & TTK NPP (BR-007)
    * `visible_for_doctor`: BOOLEAN NOT NULL DEFAULT false — dipaksa false bila node DEPO_NPP
    * `fallback_path_1_id`: UUID NOT NULL (FK → `pharmacy_node.id`) — default Gudang Pusat (BR-006)
    * `fallback_path_2_id`: UUID NULL (FK → `pharmacy_node.id`) — cross-depo lookup
    * `allow_substitution`: BOOLEAN NOT NULL DEFAULT false — hanya barang `is_substitutable` A4 (BR-012)
    * `status`, `created_at`, `updated_at`, `created_by`, `updated_by`

* **Table Name**: `topology_template` (pre-seeded, read reference)
* **Key Columns**: `id` · `template_code` ENUM('MINIMAL','STANDAR','LENGKAP') · `name` · `definition` JSONB (blueprint node+route+prescription-routing) · `is_active`.

* **Table Name**: `pharmacy_master_audit_log`
* **Key Columns**: `id` UUID PK · `entity_type` ENUM('node','route','prescription_rule','visibility_rule') · `entity_id` UUID · `action` ENUM('create','update','delete','status_change','activate_template') · `user_id` · `user_name` · `diff` JSONB (before/after) · `created_at` TIMESTAMP (immutable, retensi 5 thn).

*Index performa (NFR-002):* index pada `pharmacy_node(status, node_type)`, `pharmacy_route(source_id, destination_id, status)`, `prescription_routing_rule(source_unit_id, status)` untuk pembacaan runtime cepat.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pharmacy/nodes` | List node (query: `search`, `node_type`, `status`, `installation_id`, `compliance`, pagination) |
| GET | `/api/v1/pharmacy/nodes/{id}` | Detail node + atribut compliance + penanggung jawab |
| POST | `/api/v1/pharmacy/nodes` | Create node (status=AKTIF) → validasi compliance |
| PUT | `/api/v1/pharmacy/nodes/{id}` | Update node |
| PATCH | `/api/v1/pharmacy/nodes/{id}/status` | Toggle Aktif/Nonaktif (dengan dependency check) |
| GET | `/api/v1/pharmacy/routes` | List route (query: `source_id`, `destination_id`, `request_type`, `status`) |
| POST | `/api/v1/pharmacy/routes` | Create route → validasi self/duplikat + compliance tujuan |
| PUT | `/api/v1/pharmacy/routes/{id}` | Update route |
| PATCH | `/api/v1/pharmacy/routes/{id}/status` | Toggle status route |
| GET/POST/PUT | `/api/v1/pharmacy/prescription-routings` | CRUD prescription routing (+ validasi fork NPP) |
| GET/POST/PUT | `/api/v1/pharmacy/visibility-rules` | CRUD visibility & fallback/substitution |
| GET | `/api/v1/pharmacy/templates` | List template topologi (Minimal/Standar/Lengkap) |
| POST | `/api/v1/pharmacy/templates/{code}/generate` | Generate node+route+routing (status DRAFT_TEMPLATE) |
| POST | `/api/v1/pharmacy/topology/activate` | Aktifkan topologi (gate compliance) → audit |
| GET | `/api/v1/pharmacy/topology/graph` | Struktur graph node-edge untuk visualisasi |
| GET | `/api/v1/pharmacy/audit-logs` | Audit log (filter entity/action/user/tanggal) |
| **GET** | `/internal/v1/pharmacy/ruleset` | **Read-only ruleset aktif** untuk modul operasional (service token; cache-versioned; last-known-good) — FR-013 |
| POST | `/api/v1/pharmacy/import` | Import massal node/route CSV/XLSX `[Phase 2]` |
| GET | `/api/v1/pharmacy/export` | Ekspor node/route CSV/XLSX `[Phase 2]` |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT) — UI

**A. Form Node Farmasi** *(FR-001, FR-003)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| node_code | Kode Node | text | Ya | unik, maks 20, alfanumerik | auto/manual | pola kode master |
| name | Nama Node | text | Ya | maks 100 | manual | mis. "Depo Farmasi RJ" |
| node_type | Tipe Node | dropdown | Ya | GUDANG_PUSAT/DEPO_STANDAR/DEPO_NPP/FLOOR_STOCK | enum | pengendali aturan turunan |
| installation_id | Instalasi Penanggung Jawab | dropdown (lookup) | Ya | dari A19 | lookup A19 | |
| parent_node_id | Node Induk | dropdown (lookup) | Kondisional | wajib bila FLOOR_STOCK | lookup A42 | hierarki sub-stock |
| person_in_charge_id | Penanggung Jawab (APJ/Apoteker) | dropdown (lookup) | Ya | role apoteker (A2); wajib bila DEPO_NPP | lookup A2 | data referensi, bukan approver |
| address | Alamat/Lokasi Fisik | text | Tidak | maks 255 | manual | |
| contact | Kontak | text | Tidak | format telp | manual | |
| open_time | Jam Buka | time | Ya | HH:mm | manual | |
| close_time | Jam Tutup | time | Ya | HH:mm; 24/7 → 00:00–23:59 | manual | BR-005 |
| max_sku_capacity | Kapasitas Max (SKU) | number | Tidak | ≥ 0 | manual | |
| npp_storage_compliant | Brankas NPP Compliant | boolean | Ya | wajib true bila DEPO_NPP | default false | BR-001 |
| cold_chain_capable | Cold Chain Capable | boolean | Ya | true/false | default false | kulkas 2–8°C (BR-004) |
| requires_apj_on_site | Wajib APJ On-Site | boolean | Ya | true/false | default false | BR-008 |
| audit_zone | Zona Audit PKPO | boolean | Ya | true/false | default true | retensi 5 thn |
| serves_prescription | Melayani Resep | boolean | Ya | default true DEPO_*, false GUDANG_PUSAT | default | BR-011 `[PERLU KONFIRMASI nama flag]` |
| notes | Keterangan | text | Tidak | maks 255 | manual | field kanonik |

> Status **tidak** ditampilkan di form create (sistem set AKTIF/DRAFT_TEMPLATE). Node FLOOR_STOCK **tidak** memiliki field whitelist life-saving (BR-015).

**B. Form Route Definition** *(FR-004)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| source_id | Node Asal | dropdown (lookup) | Ya | node aktif; ≠ tujuan | lookup A42 | BR-010 |
| destination_id | Node Tujuan | dropdown (lookup) | Ya | node aktif | lookup A42 | |
| request_type | Tipe Permintaan | dropdown | Ya | Rutin/Cito/Emergency | enum | |
| allowed_categories | Kategori Diizinkan | multiselect (lookup) | Tidak | dari A33 | lookup A33 | kosong = semua kecuali excluded |
| excluded_categories | Kategori Dilarang | multiselect (lookup) | Tidak | dari A33 | lookup A33 | menang vs allowed (BR-009) |
| max_qty_per_request | Max Qty per Permintaan | number | Tidak | ≥ 1 | manual | |
| frequency_rule | Aturan Frekuensi | dropdown | Ya | daily/weekly/on-demand | enum | |
| auto_fulfillment_eligible | Eligible Auto-Fulfillment | boolean | Ya | true/false | default false | BR-003 |
| auto_fulfillment_threshold | Batas Qty Auto-Fulfill | number | Kondisional | wajib bila eligible; ≥ 1 | manual | di atas batas → manual di modul distribusi |

> Field `approval_level` **dihapus** (approval dihapus dari master ini). Status tidak diinput di create.

**C. Form Prescription Routing Rule** *(FR-007)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| source_unit_id | Unit Pelayanan Asal | dropdown (lookup) | Ya | dari A3/A39 | lookup A3/A39 | Poli/IGD/Ranap/IBS |
| target_depo_id | Depo Target | dropdown (lookup) | Ya | node DEPO_* aktif | lookup A42 | |
| patient_status_filter | Filter Status Pasien | dropdown | Tidak | RJ/RI/IGD/BLPL | enum | kosong = semua |
| category_filter | Filter Kategori | multiselect (lookup) | Tidak | dari A33 | lookup A33 | dasar fork NPP |
| fork_npp_target_id | Depo NPP (Fork) | dropdown (lookup) | Kondisional | DEPO_NPP compliant; wajib bila kategori NPP | lookup A42 | BR-002,008 |
| urgency_routing_id | Override Routing Cito | dropdown (lookup) | Tidak | DEPO_* aktif | lookup A42 | mis. Cito ranap → Depo IGD 24/7 |
| fallback_depo_id | Depo Fallback | dropdown (lookup) | Ya | node aktif | lookup A42 | default Gudang Pusat (BR-006) |

> **Tidak** ada field evaluasi DPHO/Fornas/ketersediaan BPJS (BR-016). Status tidak diinput di create.

**D. Form Visibility & Fallback/Substitution Rule** *(FR-009, FR-010)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| node_id | Node | dropdown (lookup) | Ya | node aktif | lookup A42 | |
| visibility_roles | Role Pelihat | multiselect (lookup) | Ya | dari A18 | lookup A18 | NPP → hanya APJ & TTK NPP (BR-007) |
| visible_for_doctor | Visible utk Dokter | boolean | Ya | dipaksa false bila node DEPO_NPP | default false | Skenario 4 |
| fallback_path_1_id | Fallback Path 1 | dropdown (lookup) | Ya | node aktif; default Gudang Pusat | lookup A42 | auto-upgrade Cito (BR-006) |
| fallback_path_2_id | Fallback Path 2 (Cross-Depo) | dropdown (lookup) | Tidak | node aktif | lookup A42 | eksekusi transfer di modul distribusi |
| allow_substitution | Izinkan Substitusi | boolean | Ya | true/false | default false | hanya barang is_substitutable A4 (BR-012) |

**E. Form Import Massal** *(FR-015 — `[Phase 2 — bukan MVP]`)* — placeholder

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| import_file | File Import | file | Ya (Phase 2) | .csv/.xlsx sesuai template | upload | field kanonik; format final Phase 2 |
| import_mode | Mode | dropdown | Ya (Phase 2) | tambah / tambah+update | enum | field kanonik |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View) — UI

**A. Dashboard / List Node** *(FR-012)*

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| Total Node Aktif | count node where status=AKTIF | angka (kartu) | – | ringkasan |
| Total Depo NPP | count where node_type=DEPO_NPP | angka (kartu) | – | indikator compliance |
| Node Non-Compliant | count tipe NPP tanpa compliant/APJ | angka merah (kartu) | – | alert |
| Nama Node | pharmacy_node.name | text | sort A-Z, search | |
| Tipe Node | node_type | badge (warna per tipe) | filter | NPP badge merah |
| Instalasi | A19.name | text | filter | |
| Jam Operasional | open_time–close_time | HH:mm–HH:mm / 24/7 | – | |
| Compliance | flag npp/cold_chain/apj | ikon badge | filter | merah jika tipe NPP non-compliant |
| Penanggung Jawab | A2.name | text | filter | APJ/Apoteker (referensi) |
| Status | status | badge (Aktif hijau / Nonaktif abu / Draft kuning) | filter | |
| Jumlah Route | count route where source/destination=node | angka | sort | |
| Aksi | – | Edit / Detail / Ubah Status | – | soft delete only |

**B. List Route / Prescription Routing** *(FR-012)*

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|-------|-------------|--------|-------------|---------|
| Asal → Tujuan | route.source_id → destination_id | "NodeA → NodeB" | sort, filter | |
| Tipe Permintaan | route.request_type | badge (Rutin/Cito/Emergency) | filter | |
| Kategori Diizinkan | route.allowed_categories (A33) | chips | filter | |
| Auto-Fulfillment | auto_fulfillment_eligible + threshold | "≤ N qty" / – | filter | di atas batas → manual di modul distribusi |
| Status | route.status | badge | filter | |

> Kolom **Level Approval** dihapus dari list route (approval dihapus dari master ini).

#### 8.3.3 Business Rules

| ID | Business Rule | Prioritas | Sumber/Traceability |
|----|---------------|-----------|---------------------|
| BR-001 | Hanya node `node_type=DEPO_NPP` & `npp_storage_compliant=true` boleh jadi target dispensing/penyimpanan NPP. | P0 | UU 35/2009; Permenkes 3/2015 |
| BR-002 | Resep mengandung item NPP **wajib di-fork otomatis**: non-NPP → depo reguler, NPP → Depo NPP. | P0 | analogi g-service-order-resep |
| BR-003 | Permintaan qty ≤ `auto_fulfillment_threshold` pada route eligible → auto-fulfill; di atas → penanganan manual di modul distribusi (bukan approval master ini; belum terakomodasi saat ini). | P0 | Skenario 2 |
| BR-004 | Item Cold Chain hanya boleh dirutekan ke node `cold_chain_capable=true`. | P0 | STARKES PKPO |
| BR-005 | Permintaan ke Gudang Pusat di luar jam operasional → antrian hari berikutnya, kecuali Emergency + APJ on-call (ditangani modul operasional). | P1 | Draft (Operating Hours) |
| BR-006 | Setiap node minimal 1 fallback path; default Gudang Pusat, auto-upgrade Cito bila target kosong. | P0 | Draft (Fallback) |
| BR-007 | Visibility stok Depo NPP **restricted**: hanya APJ & TTK Depo NPP; tidak terlihat dokter umum. | P0 | UU 35/2009 |
| BR-008 | Node `requires_apj_on_site=true` hanya operasional bila ada APJ/Apoteker on-site (bukan TTK saja). | P0 | Draft (Compliance) |
| BR-009 | `excluded_categories` mengalahkan `allowed_categories` bila konflik. | P0 | Draft (Route) |
| BR-010 | `source_id≠destination_id`; tidak boleh route duplikat (source+destination+tipe). | P0 | integritas data |
| BR-011 | RS Tipe D mikro (1 Instalasi Farmasi tunggal) didukung: 1 node peran ganda Gudang+Depo (`GUDANG_PUSAT` + `serves_prescription=true`). | P1 | Draft (Template Minimal) `[PERLU KONFIRMASI penamaan flag]` |
| BR-012 | Substitusi generik disuggest hanya bila barang `is_substitutable=true` (A4) & stok habis di seluruh node fallback path. | P1 | integrasi A4 |
| BR-013 | Default 1 unit pelayanan → 1 target depo (one-to-one); multi-target hanya untuk fork NPP. | P1 | Draft (Simplified routing) |
| BR-014 | Seluruh CRUD master (node/route/routing/visibility/fallback + aktivasi) oleh role **Admin**. **Tidak ada approval** di modul ini. | P0 | Instruksi user; A18/A53 |
| BR-015 | Master **tidak** menyimpan whitelist obat life-saving Floor Stock; node FLOOR_STOCK hanya topologi + atribut compliance. Whitelist di modul stok. | P0 | Instruksi user v1.2 |
| BR-016 | Master **tidak** mengevaluasi DPHO/Fornas/ketersediaan per depo untuk BPJS; dilakukan modul resep pelayanan farmasi. | P0 | Instruksi user v1.2 |

---

## 9. Workflow / BPMN Interpretation

> `[ASUMSI]` A42 belum memiliki BPMN sendiri; seluruh alur diturunkan secara analogi dari `g-service-order-resep`, `g-service-cpo-order`, `g-service-discharge`, `g-emr-inpatient`.

### Skenario A — Setup Topologi via Template (utama)

```
[Admin]
  → Buka menu Master Data > Gudang dan Farmasi
  → Pilih Template Topologi (Minimal / Standar / Lengkap)
[Sistem]
  → Auto-generate node + default routes + default prescription routing (status DRAFT_TEMPLATE)
[Admin]
  → Gateway: Sesuai kebutuhan RS?
       ├─ Tidak → edit nama node/parameter, tambah/hapus node/route
       └─ Ya  → lanjut
  → Lengkapi atribut compliance per node (brankas NPP, cold chain, APJ on-site, jam operasional)
  → Gateway: Ada node NPP? → Ya: wajib npp_storage_compliant=true + APJ ditetapkan
  → Klik [Aktifkan Topologi]
[Sistem]
  → Gate compliance (Depo NPP compliant + APJ; setiap node ada fallback)
       ├─ Gagal → tampilkan daftar node/route belum valid → kembali
       └─ Lolos → status AKTIF → audit log tercatat (TANPA approval)
```

### Skenario B — Tambah/Edit Route Definition

```
[Admin] → Pilih Node Source & Destination
        → Set tipe permintaan, allowed/excluded categories, max qty, frequency, auto-fulfillment + threshold
[Sistem] → Gateway: Route melibatkan kategori NPP / Cold Chain?
             ├─ Ya  → validasi node tujuan compliant (npp/cold_chain=true) sebelum simpan
             └─ Tidak → langsung simpan
        → Validasi source≠destination & non-duplikat → Simpan → audit log
```

### Skenario C — Konfigurasi Prescription Routing

```
[Admin] → Pilih source_unit_pelayanan → set target_depo
        → Set category_filter (item NPP → fork ke Depo NPP), patient_status_filter, urgency_routing, fallback_depo
[Sistem] → Validasi target depo & fallback aktif; depo NPP compliant → Simpan → audit
```

### Skenario D — Visibility & Fallback Rules

```
[Admin] → Set matriks visibility per role (dokter→depo target; TTK→cross-depo; NPP restricted)
        → Set fallback path default (semua depo → Gudang Pusat, auto-upgrade Cito) + cross-depo lookup
[Sistem] → Simpan → audit (eksekusi transfer cross-depo = modul distribusi)
```

### Runtime (dibaca modul operasional — Out Scope eksekusi)

```
[Dokter klik "Resep" (g-service-order-resep)]
  → Modul resep GET /internal/v1/pharmacy/ruleset
  → Baca Prescription Routing → tentukan target depo
  → Ada item NPP? → fork ke Depo NPP otomatis (BR-002)
[TTK buat Permintaan Distribusi]
  → Baca Route → validasi kategori & qty
  → qty ≤ threshold pada route eligible? → auto-fulfill
       else → tandai "penanganan manual di modul distribusi" (BR-003; belum terakomodasi saat ini)
[Visibility] → enforce stok terlihat sesuai role (NPP restricted, NFR-004)
```

> Traceability runtime: fork NPP & routing resep diturunkan dari task BPMN `g-service-order-resep` ("Klik Simpan (Kirim ke Farmasi)", "Pilih Jenis?", "Entry Point?") dan `g-service-cpo-order` ("Set flag URGENT", "Tampilkan di Antrian Order"). `[ASUMSI]`

---

## 10. Non-Functional Requirements

| ID | Kategori | Requirement | Target/Catatan |
|----|----------|-------------|----------------|
| NFR-001 | Audit & Retensi | Perubahan master & keputusan routing tercatat immutable | Retensi **5 tahun** (STARKES PKPO) |
| NFR-002 | Performa baca runtime | Pembacaan ruleset oleh modul operasional | **≤ 500 ms p95** (idealnya ≤ 300 ms) via **in-memory cache** — tak perlu Redis untuk Tipe C/D |
| NFR-003 | Keamanan/RBAC | CRUD master dibatasi role **Admin**; TTK/Dokter/Auditor read-only sesuai visibility; APJ/Apoteker = data referensi; **tanpa peran approval** | via A18/A53 |
| NFR-004 | Enforcement visibility NPP | Data stok NPP tidak terekspos ke role tak berhak bahkan via API | UU 35/2009 |
| NFR-005 | Ketersediaan | Ruleset tetap terbaca 24/7 (Depo IGD/RI) walau internet eksternal putus | in-memory preload + **last-known-good config** saat DB sesaat tak terjangkau; UPS + LAN andal |
| NFR-006 | Usability | Setup topologi via template ≤ 30 menit oleh Admin non-IT; graph visual review | RS Tipe C/D SDM terbatas |
| NFR-007 | Integritas data | Validasi referensial (node/route/rule tak boleh menunjuk entitas terhapus); **soft-delete + dependency check** | mencegah broken routing |
| NFR-008 | Skalabilitas | Mendukung ~10 node & puluhan route per RS Tipe C tanpa degradasi | `[ASUMSI]` |

> **Konteks infrastruktur RS Tipe C/D:** SIMRS umumnya **on-premise** (server lokal, LAN/Wi-Fi internal), bukan cloud. Internet publik dipakai untuk bridging eksternal (BPJS/SATUSEHAT), bukan akses SIMRS internal. Volume master kecil (±10 node, puluhan route). Karena itu strategi **in-memory cache + cache invalidation (bump versi saat save) + last-known-good** sudah memadai; offline-first client per-workstation = overkill untuk MVP. `[PERLU KONFIRMASI ke tim infrastruktur RS: murni on-premise atau ada komponen cloud]`

---

## 11. Open Questions & Assumptions

### Asumsi
- `[ASUMSI]` A42 belum punya BPMN sendiri; seluruh alur As-Is/To-Be & skenario runtime diturunkan analogi dari `g-service-order-resep`, `g-service-cpo-order`, `g-service-discharge`, `g-emr-inpatient`.
- Sesuai instruksi user (v1.1/v1.2): **flow approval dihapus** dari modul ini; seluruh CRUD oleh role **Admin** tanpa langkah persetujuan internal. Kolom `approval_status`/`approver_role` disiapkan nullable untuk kesiapan arsitektur, **tidak** dipakai di MVP.
- Metrik & baseline insiden "resep salah depo" **tidak** disimpan di master (ranah modul operasional). Kualitas master diukur via proxy validitas compliance.
- Pertimbangan DPHO/Fornas & ketersediaan per depo untuk BPJS ditangani **modul resep pelayanan farmasi** (BR-016), bukan master ini.
- Persetujuan eksekusi (transfer Cito, dual-control NPP, permintaan di atas threshold) & tracking nomor seri NPP diakomodir **modul distribusi/mutasi barang** — dengan catatan **belum terakomodasi saat ini** (risiko transisi → penanganan manual sementara).
- Whitelist obat life-saving Floor Stock dikelola **modul stok** (BR-015); node FLOOR_STOCK hanya topologi + compliance.
- Import massal node/route (FR-015) → **Phase 2**; restock auto-trigger → Phase 2; analytics optimisasi topologi → Phase 3.
- Infrastruktur RS Tipe C/D diasumsikan on-premise/LAN → in-memory cache + last-known-good sebagai solusi hemat-ops; perlu validasi tim infrastruktur.
- APJ/Apoteker dicatat sebagai penanggung jawab node (**data referensi**), bukan approver.
- Field kanonik (`status`, `notes/keterangan`, `installation_id`, `unit`, `import_file`, `import_mode`) mengikuti definisi bersama modul lain (A1/A2/A19/A3) untuk konsistensi lintas-PRD.
- Target metrik (≥95% routing otomatis, ≤30 menit setup, ≤500 ms baca runtime) = asumsi awal, perlu validasi.
- Visualisasi graph node-edge disarankan untuk review Admin; bentuk akhir UI menyesuaikan kapasitas tim.

### Pertanyaan Terbuka
- `[PERLU KONFIRMASI]` Penamaan flag peran ganda RS Tipe D mikro (`serves_prescription`) belum disepakati.
- `[PERLU KONFIRMASI/RISIKO]` Dependency modul distribusi/mutasi barang: penanganan persetujuan eksekusi & tracking nomor seri NPP dikonfirmasi AKAN diakomodasi, NAMUN BELUM terakomodasi saat ini. Perlu dipastikan masuk backlog modul distribusi + rencana transisi (penanganan manual sementara).
- `[PERLU KONFIRMASI]` Validasi ke tim infrastruktur RS: SIMRS murni on-premise (LAN) atau ada komponen cloud — menentukan kecukupan strategi in-memory cache & last-known-good vs offline-first client.
- `[PERLU KONFIRMASI]` Approval Metadata (§1): nama & jabatan stakeholder penyetuju dokumen.
- `[PERLU KONFIRMASI]` Apakah `audit_zone` selalu true untuk semua tipe node, atau hanya untuk node yang menyimpan NPP/obat high-alert.
