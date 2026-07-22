# PRD — Master Data: Paket Pelayanan MCU (A44)

**Related Document:** Overview_Master_Data_Paket_MCU.md (Tim Product Tamtech International, v1.0, 23 Juni 2026); Related Feature: A44 Control Panel > Master Data > Paket Pelayanan MCU; referensi master item: A10 Tindakan, A13 Procedure, A14 Item Pemeriksaan Lab, A29 Item Pemeriksaan Radiologi, A3 Unit, A23 Spesialisasi & SMF, Master Tarif (penunjang lain); referensi proses: g-support-mcu (Order paket MCU), g-admisi-onsite-registration (pemilihan paket saat pendaftaran)
**Versi:** 1.3 - Menambah **Matriks Harga Jual Paket** (dimensi **Tipe Penjamin (A20) × Kelas (A58)**, Phase 1) menggantikan model harga tunggal: tiap sel = **harga manual** per (penjamin × kelas), sel kosong mewarisi baris/kolom "Semua" lalu **jatuh ke Harga Akumulasi (Σ tarif snapshot)** sebagai fallback terakhir (BR-005/007/020 direvisi). Menambah **Ketersediaan Paket per Unit (A3)** sebagai syarat paket muncul di modul hilir (availability; harga TIDAK dipisah per unit) — BR-021. Selisih markup/diskon dihitung per sel vs akumulasi (BR-023). Substansi v1.2 lain dipertahankan.
**Tanggal:** 9 Juli 2026

## 1. Metadata Dokumen

**Approval**

| Nama | Jabatan | Tanggal |
|------|---------|---------|
| [PERLU KONFIRMASI] | Admin Control Panel / PIC Master Data | [PERLU KONFIRMASI] |
| [PERLU KONFIRMASI] | Manajer Pelayanan / MCU | [PERLU KONFIRMASI] |

**Related Documents**
* **Overview_Master_Data_Paket_MCU.md** (Tim Product Tamtech International, v1.0, 23 Juni 2026) — sumber substansi.
* **Master item komposisi**: A14 Item Pemeriksaan Lab · A29 Item Pemeriksaan Radiologi · A10 Tindakan · A13 Procedure · A23 Spesialisasi & SMF · A3 Unit · Master Tarif (penunjang lain).
* **Referensi proses**: g-support-mcu (*Order paket MCU*, *Print bundle hasil MCU*); g-admisi-onsite-registration (pemilihan paket saat pendaftaran).

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 23 Juni 2026 | 1.0 | Overview awal Master Data Paket MCU. |
| 23 Juni 2026 | 1.1 | Pengembangan: keunikan **kode+nama**, **soft delete** non-destruktif (hard delete dilarang), **import massal + preview** di Phase 1, aturan **concurrency** (optimistic lock), **indikator markup/diskon**, rancangan **Phase 2** (masa berlaku & versioning). |
| 4 Juli 2026 | 1.2 | **Restrukturisasi dokumen** mengikuti **Template PRD** (9 section): Scope & Phasing, State Machine, Feature Requirements & Acceptance Criteria, DB Schema (English), API (English), Data & Business Rules. Substansi tidak berubah. |
| 9 Juli 2026 | 1.3 | **Matriks Harga Jual Paket** (**Tipe Penjamin A20 × Kelas A58**, Phase 1) menggantikan harga tunggal: sel = **harga manual**, kosong → warisi "Semua" → **Harga Akumulasi** sbg fallback (BR-005/007/020 direvisi). **Ketersediaan Paket per Unit (A3)** = syarat paket tampil di hilir (availability; harga tidak dipisah per unit — BR-021). Selisih per sel vs akumulasi (BR-023). |

## 2. Overview & Background

**Overview / Brief Summary**

**Modul:** Master Data — Paket Pelayanan Medical Check-Up (MCU). **Produk:** Neurovi SIMRS v2 — Cluster **Control Panel**. **Kode Fitur:** A44 (Control Panel > Master Data > Paket Pelayanan MCU).

Layanan Medical Check-Up (MCU) terdiri atas sekumpulan pemeriksaan dari berbagai unit (laboratorium, radiologi, tindakan/pemeriksaan fisik, konsultasi, dan penunjang lain) yang ditawarkan sebagai **satu kesatuan produk** dengan harga tersendiri.

Modul **Master Data Paket MCU** menyediakan fungsi untuk **membundling** beberapa item pemeriksaan lintas unit menjadi satu produk Paket MCU yang memiliki **identitas (kode/nama), komposisi item, dan harga sendiri**. Paket berstatus **Aktif** dapat dipanggil sebagai satu produk pada modul hilir (pendaftaran/layanan, mis. proses *Order paket MCU* pada g-support-mcu).

Ini adalah modul **master data (CRUD)** di Control Panel — **bukan** modul transaksi. Fokus: definisi paket, komposisi item, **matriks harga jual per Tipe Penjamin × Kelas** (dengan **Harga Akumulasi** sebagai fallback), **ketersediaan paket per Unit** (syarat paket muncul di modul hilir), pembekuan nilai (**snapshot**), pengaturan status/ketersediaan, **dan import massal paket dengan preview** untuk mempercepat injeksi data master dalam jumlah banyak. Cocok untuk RS Tipe C & D yang mulai memasarkan paket MCU sebagai produk siap jual tanpa menyusun ulang item satu per satu setiap pendaftaran.

**Model harga (v1.3):** harga jual paket **tidak lagi tunggal lintas penjamin**. Setiap paket punya **Matriks Harga Jual** berdimensi **Tipe Penjamin (A20) × Kelas (A58)**; tiap sel berisi **harga manual** (nominal Rp). Bila sel dikosongkan, sistem mewarisi baris **"Semua Penjamin"** / kolom **"Semua Kelas"**, dan bila tetap kosong **jatuh ke Harga Akumulasi** (Σ tarif snapshot komposisi) sebagai **fallback** — sehingga paket **selalu** punya harga di setiap konteks (BR-020). Dimensi **Unit (A3)** berperan sebagai **syarat ketersediaan** (di unit mana paket ditawarkan) — **bukan** variabel harga; harga **tidak** dipisah per unit (BR-021).

**Catatan ruang lingkup rilis:**
* **Phase 1 (rilis ini):** CRUD paket, komposisi lintas unit, **matriks harga jual (Tipe Penjamin × Kelas) + fallback Akumulasi**, **ketersediaan paket per Unit**, snapshot, status, soft delete, **import massal + preview**.
* **Phase 2 (dirancang, belum diimplementasikan):** **Masa berlaku (tanggal dari–sampai)** & **versioning** paket (lihat §4 & BR/FR ber-tag *(Phase 2)*).
* **Phase 3 (Mapping COA):** **N/A** — harga paket tidak dipetakan COA di modul ini; alokasi pendapatan per unit & jurnal ditangani modul **Billing/Casemix** (Out of Scope).

**Business Process (As-Is vs To-Be)** [tidak ada BPMN khusus A44; diturunkan dari overview + analogi g-admisi/g-support-mcu]

* **As-Is (manual / masalah saat ini)**:
    * Belum ada mekanisme mendefinisikan paket MCU secara terstruktur di sistem.
    * Saat pasien MCU mendaftar, petugas memilih item pemeriksaan **satu per satu** dari berbagai master unit (Lab, Radiologi, Tindakan, dll) — rawan terlewat/salah & tidak konsisten antar pasien.
    * Harga paket **tidak baku** — penjumlahan tarif manual, sulit dikontrol, tidak bisa dipromosikan sebagai harga produk tunggal.
    * Tidak ada **sumber kebenaran** komposisi paket yang dapat dipanggil ulang modul pendaftaran/layanan.
    * Saat onboarding/go-live, RS bisa punya **banyak paket sekaligus** → input satu per satu lambat & rawan salah ketik.

* **To-Be (solusi digital yang diusulkan)**:
    * Pengguna master data membuat/mengubah/mengelola Paket MCU sebagai **satu produk**: komposisi lintas unit, penetapan **matriks harga jual per Tipe Penjamin × Kelas** (fallback ke Harga Akumulasi), **ketersediaan per Unit**, dan status.
    * **Injeksi data master paket massal via import (CSV/XLSX) dengan tahap preview** — tanpa input satu per satu.
    * Modul hilir mendapat **referensi paket siap pakai** → *Order paket MCU* (g-support-mcu) tinggal memanggil paket aktif.
    * **Snapshot** nilai akumulasi saat simpan menjaga **integritas harga historis** (perubahan tarif master tidak diam-diam mengubah harga paket tersimpan).
    * Operasi dirancang **tahan koneksi internet tidak stabil** (internal/intranet, tanpa integrasi eksternal real-time).

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Paket MCU terdefinisi terstruktur | ≥ 1 paket aktif siap pakai setelah go-live [ASUMSI]. |
| 2 | Percepatan injeksi data master via import | ≥ 50 baris/proses tervalidasi & ter-preview dalam 1 proses [ASUMSI]. |
| 3 | Akurasi import | 100% baris valid tersimpan tepat setelah preview dikonfirmasi; **0** baris error ikut tersimpan. |
| 4 | Kurangi kerja manual pemilihan item saat pendaftaran | Waktu pilih layanan MCU turun dari pilih item satu-per-satu → **< 1 menit** pilih 1 paket [ASUMSI]. |
| 5 | Adopsi paket di pendaftaran MCU | **≥ 90%** pendaftaran MCU memakai paket terdefinisi (bukan item lepas) dalam 3 bulan pasca go-live [ASUMSI]. |
| 6 | Integritas harga historis | Perubahan tarif master **tidak** mengubah harga paket tersimpan tanpa re-save; 100% snapshot terjaga (uji BR-006). |
| 7 | Akurasi perhitungan akumulasi | Selisih total akumulasi vs jumlah subtotal manual = **0** (otomatis). |
| 8 | Kontrol margin | 100% sel matriks terisi menampilkan **indikator selisih** (markup/diskon) vs Harga Akumulasi untuk dipantau manajemen. |
| 9 | Kemudahan & keamanan pengelolaan | 100% non-destruktif (soft delete/non-aktif); **0** kehilangan/error data riwayat pelayanan. |
| 10 | Multi-tarif per penjamin & kelas | Harga paket per **Tipe Penjamin × Kelas** terkelola dari satu tempat; **0** perbedaan harga dikelola manual di luar A44; setiap konteks (penjamin×kelas) **selalu** menghasilkan harga (sel terisi atau fallback Akumulasi). |
| 11 | Ketersediaan tepat unit | 100% paket hanya muncul di modul hilir pada **Unit** yang di-assign (atau "Semua Unit"); **0** paket bocor ke unit yang tak menawarkannya. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Masa Berlaku & Versioning) | Phase 3 (Accounting: Mapping COA) |
|-------------|---------------------|-----------------------------------------------|-----------------------------------|
| Dashboard/List Paket | List + search + filter + kartu Total Paket Aktif; aksi Tambah/Edit/Toggle/Hapus(soft)/Import | Kolom **Periode Berlaku** + badge **Kedaluwarsa** | N/A |
| CRUD Header Paket | Kode (≤20 alfanumerik, unik) + Nama (unik) + Deskripsi + Mode Harga; keunikan kode **DAN** nama | Field `berlaku_mulai`/`berlaku_sampai` | N/A |
| Komposisi Item lintas unit | Picker item Lab/Radiologi/Tindakan/Procedure/Konsultasi/Penunjang + Qty + subtotal live | — | N/A |
| Harga Akumulasi (fallback) | Total Akumulasi Tarif = Σ(tarif × qty) dihitung otomatis; jadi **fallback** harga bila sel matriks kosong | — | N/A (alokasi pendapatan per unit di Billing = Out of Scope) |
| **Matriks Harga Jual (Tipe Penjamin × Kelas)** | **Editor matriks: baris Tipe Penjamin (A20) × kolom Kelas (A58); tiap sel = harga manual (nominal Rp); baris/kolom "Semua" = default warisan; sel kosong → warisi "Semua" → jatuh ke Harga Akumulasi (BR-020)** | — | N/A (harga membentuk pendapatan di Billing = Out of Scope) |
| **Selisih per sel** | **Indikator markup/diskon = harga sel efektif − Harga Akumulasi, per (penjamin×kelas); informatif (BR-023)** | — | N/A |
| **Ketersediaan Paket per Unit (A3)** | **Assign paket ke satu/lebih Unit (atau "Semua Unit"); paket hanya muncul di modul hilir untuk unit tsb (syarat adanya paket — BR-021); harga TIDAK dipisah per unit** | — | N/A |
| Snapshot & Concurrency | Snapshot akumulasi & **snapshot tiap sel matriks** saat simpan; optimistic locking (replace-all komposisi + matriks) | Versioning menambah histori versi | N/A |
| Status & Soft Delete | Toggle Aktif/Non-aktif; **soft delete** (hard delete dilarang) | — | N/A |
| Import Massal + Preview | Template CSV/XLSX → unggah → validasi per baris → preview → Proses/Batal → ringkasan | — | N/A |
| Masa Berlaku | — | Paket valid dipanggil hilir hanya dalam `[berlaku_mulai, berlaku_sampai]` (BR-018) | N/A |
| Versioning Paket | — | Perubahan komposisi/harga → versi baru; order historis merujuk versi (BR-019) | N/A |

**Out of Scope**

| Item | Keterangan | Penanggung jawab |
|---|---|---|
| Auto-generate order saat paket dipilih | Pembentukan order dari komposisi paket terjadi di **pendaftaran** (dikonfirmasi user) | Modul Pendaftaran/Order |
| Alokasi pendapatan per unit & jurnal (COA) | Breakdown pendapatan per item/unit untuk akuntansi | Modul Billing/Casemix |
| Harga per **item** dalam paket per penjamin/kelas | Matriks harga berlaku di level **paket** (harga bundel), **bukan** per item komponen | — |
| Approval berjenjang perubahan harga matriks | Perubahan harga langsung Aktif (Phase 1); approval = Phase 2 | — |
| Filter gender/usia pada paket | Tidak diakomodasi | — |
| Duplicate/clone paket | Tidak diakomodasi | — |
| Mapping LOINC/SatuSehat/FHIR di level paket | Terminologi melekat pada item komponen saat order terbentuk (BR-013) | — |
| **Hard delete** | Tidak diperkenankan sama sekali; hanya soft delete/non-aktif (BR-010) | — |

**Rancangan Phase 2 (di luar rilis Phase 1)** — *dirancang sekarang agar skema Phase 1 kompatibel:*
* **Masa berlaku (tanggal dari–sampai)**: paket punya periode aktif efektif `berlaku_mulai`–`berlaku_sampai`; hanya valid dipanggil modul hilir dalam rentang tersebut (selain harus Aktif) — BR-018.
* **Versioning paket**: perubahan komposisi/harga → **versi baru**; order historis tetap merujuk versi saat transaksi — BR-019.

## 5. Related Features

**Fitur ini:** `[A44]` Control Panel > Master Data > Paket Pelayanan MCU.

**Master data sumber komposisi item (dependency picker):**
* `[A14]` Item Pemeriksaan Laboratorium (Integrasi SATUSEHAT/BPJS V2) — sumber item Lab + tarif satuan.
* `[A29]` Item Pemeriksaan Radiologi (Integrasi SATUSEHAT/BPJS V2) — sumber item Radiologi + tarif.
* `[A10]` Tindakan (Integrasi BPJS V2) / `[A13]` Procedure (SATUSEHAT/BPJS V1 V2) — item tindakan/pemeriksaan fisik + tarif.
* `[A23]` Spesialisasi & SMF — referensi item Konsultasi/DPJP.
* `[A3]` Unit — **dua peran**: (1) `unit` sumber tiap item komposisi (kanonik); (2) **dimensi Ketersediaan** — daftar Unit tempat paket ditawarkan (syarat paket muncul di hilir, BR-021). Pakai definisi kanonik.
* **Master Tarif** — sumber item & tarif **penunjang lain** (EKG, treadmill, spirometri, audiometri) yang belum punya master tersendiri [PERLU KONFIRMASI nama master/kode fitur].

**Master dimensi harga (Matriks Harga Jual — Phase 1):**
* `[A20]` Tipe Penjamin — **baris matriks** (`tipe_penjamin_id`); nilai khusus **"Semua Penjamin"** (null) = default warisan. Harga paket dapat dibedakan per penjamin (BR-020).
* `[A58]` Kelas — **kolom matriks** (`kelas_id`, **hanya Kelas induk**: I/II/III/VIP — **bukan** Sub Kelas [KEPUTUSAN], selaras A58/A59); nilai khusus **"Semua Kelas"** (null) = default warisan.

**Master pendukung:**
* `[A1]` User / `[A2]` Staff / `[A53]` RBAC — pencatat audit (created_by/updated_by) & kontrol akses import/CRUD.
* **Template Import Paket MCU (CSV/XLSX)** — diunduh dari menu ini; format kolom lihat §8.3.4.

**Modul hilir yang mengonsumsi paket (bukan bagian modul ini):**
* **Pendaftaran/Admisi** — hanya menampilkan paket **Aktif** yang tersedia untuk **Unit** registrasi; **harga jual terisi otomatis** via resolver berdasarkan **Tipe Penjamin × Kelas** transaksi (FR-028); **pembentukan order dari komposisi paket terjadi di pendaftaran** (g-admisi-onsite-registration).
* **Pelayanan Pendukung** — *Order paket MCU* & *Print bundle hasil MCU* (g-support-mcu).
* **Billing/Casemix** — memakai **harga efektif hasil resolver** (sel matriks penjamin×kelas atau fallback Akumulasi); alokasi pendapatan per unit = Out of Scope.

## 6. Business Process & User Stories

**State Machine Table**

Status berlaku pada entitas **Paket MCU**. Efek "Ketersediaan" = kemunculan paket sebagai pilihan di modul hilir.

| Status | Deskripsi | Efek (Ketersediaan Hilir) | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|---------------------------|--------------------|--------------------|
| Aktif | Paket siap jual; komposisi ≥1 item; snapshot terbekukan | Muncul sebagai pilihan produk di pendaftaran/layanan | → Non-aktif (toggle) · → Soft-deleted (hapus) | → Kedaluwarsa (bila di luar rentang berlaku) |
| Non-aktif | Disembunyikan dari modul hilir; data tetap tersimpan | Tidak muncul untuk transaksi baru; riwayat lama tetap valid | → Aktif (toggle) · → Soft-deleted | → Aktif |
| Soft-deleted | Dihapus non-destruktif; hilang dari daftar/pilihan | Tidak muncul; **riwayat order sebelumnya tetap utuh** | (final; **hard delete dilarang** — BR-010) | — |
| *(Phase 2)* Kedaluwarsa | Aktif namun **di luar** `[berlaku_mulai, berlaku_sampai]` | Tidak muncul di hilir walau status Aktif (BR-018) | — | → Aktif (bila kembali dalam rentang) |

> Catatan Phasing: `berlaku_mulai`/`berlaku_sampai` (Phase 2) & tabel `mcu_package_version` (Phase 2) **belum aktif** di Phase 1; skema Phase 1 disiapkan agar penambahan field tanggal & versi tidak merombak skema inti (§8.1). Status **tidak diinput** di form create — sistem set **Aktif**; pengelolaan aktif/nonaktif via toggle Dashboard.
> Catatan Ketersediaan: **Unit** (BR-021) bersifat **ortogonal** terhadap status. Paket muncul di modul hilir hanya bila **Aktif** **DAN** Unit registrasi termasuk daftar Unit paket (atau paket "Semua Unit"). Mengubah daftar Unit tidak mengubah status.

**User Stories Utama**
* **US-001** — Sebagai **Pengguna Master Data**, saya ingin membuat Paket MCU baru dengan **kode (≤20 alfanumerik), nama, dan deskripsi**, agar paket punya identitas yang dapat direferensikan order/billing. (BR-001)
* **US-002** — Sebagai Pengguna Master Data, saya ingin memilih item pemeriksaan **lintas unit** (Lab/Radiologi/Tindakan/Procedure/Konsultasi/Penunjang) lewat **satu picker**, agar tidak berpindah-pindah master.
* **US-003** — Sebagai Pengguna Master Data, saya ingin mengatur **Qty per item** dan melihat subtotalnya, agar item berulang terhitung benar.
* **US-004** — Sebagai Pengguna Master Data, saya ingin melihat **Total Akumulasi Tarif** terhitung otomatis & **live**, agar tahu nilai paket tanpa hitung manual.
* **US-005** — Sebagai Pengguna Master Data, saya ingin menetapkan **harga jual manual per Tipe Penjamin × Kelas** lewat **matriks**, agar tarif paket bisa dibedakan per jalur pembayaran & kelas perawatan (mis. BPJS Kelas III ≠ Umum VIP). (BR-020)
* **US-005b** — Sebagai Pengguna Master Data, saya ingin **mengosongkan sel matriks** dan sistem otomatis memakai **Harga Akumulasi** sebagai acuan, agar tidak perlu mengisi semua kombinasi bila cukup satu harga bundel. (BR-020)
* **US-005c** — Sebagai Pengguna Master Data, saya ingin **menetapkan Unit tempat paket ditawarkan** (satu/lebih Unit atau "Semua Unit"), agar paket hanya muncul di pendaftaran unit yang benar (syarat adanya paket). (BR-021)
* **US-006** — Sebagai Pengguna Master Data, saya ingin **Harga Akumulasi & selisih (markup/diskon)** ditampilkan per sel matriks, agar tahu margin harga jual vs tarif komposisi. (BR-023)
* **US-007** — Sebagai Pengguna Master Data, saya ingin nilai akumulasi **dan tiap sel matriks dibekukan saat simpan (snapshot)**, agar harga paket tidak berubah diam-diam saat tarif master direvisi.
* **US-008** — Sebagai Pengguna Master Data, saya ingin **mengaktifkan/menonaktifkan** paket, agar hanya paket siap jual yang muncul di pendaftaran.
* **US-009** — Sebagai Pengguna Master Data, saya ingin menghapus paket secara **non-destruktif (soft delete)** tanpa kehilangan riwayat pelayanan; saya **tidak** memerlukan hard delete.
* **US-010** — Sebagai Pengguna Master Data, saya ingin **mencari/memfilter** daftar paket (kode/nama/status), agar cepat menemukan paket yang akan diedit.
* **US-011** — Sebagai Pengguna Master Data, saya ingin sistem **mencegah paket duplikat** berdasarkan **kode maupun nama**, agar tak ada paket kembar yang membingungkan modul hilir.
* **US-012** — Sebagai Pengguna Master Data, saya ingin **mengunduh template lalu meng-import banyak paket sekaligus**, agar tidak menginput satu per satu.
* **US-013** — Sebagai Pengguna Master Data, saya ingin melihat **preview hasil validasi import** (valid vs error/duplikat) sebelum diproses, agar bisa memutuskan **lanjut proses atau batal**.
* **US-014** — Sebagai Pengguna Master Data, saya ingin **ringkasan hasil import** (jumlah tersimpan & dilewati + alasan), agar tahu baris mana yang perlu diperbaiki.
* **US-015** — Sebagai Pengguna Master Data, saya ingin **diperingatkan bila paket yang saya edit sudah diubah pengguna lain**, agar perubahan tidak saling menimpa.
* **US-016** — Sebagai **Petugas Pendaftaran (modul hilir)**, saya ingin memilih **satu Paket MCU aktif yang tersedia untuk Unit registrasi**, dan **harga jual terisi otomatis** sesuai **Tipe Penjamin × Kelas** transaksi, agar seluruh komponen & harga ter-set sekaligus tanpa pilih manual (**order terbentuk di pendaftaran**). *(di luar scope A44; konsumen resolver FR-028)*
* **US-017** *(Phase 2)* — Sebagai Pengguna Master Data, saya ingin menetapkan **masa berlaku** paket & menyimpan **versi**, agar paket kedaluwarsa otomatis tidak terpakai dan order historis merujuk versi yang benar.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard / List Paket MCU (FR-001)**
* **User Story**: US-010.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Menu **Master Data > Paket Pelayanan MCU** menampilkan **kartu Total Paket Aktif** + daftar paket dengan kolom pada §8.3.2 (kode, nama, jml item, **Harga Akumulasi**, **rentang harga matriks** (min–max sel terisi) / "Akumulasi" bila kosong, **Unit ketersediaan**, status).
    * **AC 2**: Tersedia aksi **Tambah / Edit / Aktif-Nonaktif / Hapus(soft) / Import**.
    * **AC 3**: **Search** kode/nama & **filter** status / **Unit ketersediaan** / **Tipe Penjamin** / **Kelas** (paket yang punya sel matriks pada dimensi tsb) & sort bekerja kombinatif; hasil ter-update tanpa reload penuh.
    * **AC 4**: Paket **soft-deleted tidak muncul** di daftar/pilihan; hanya paket **Aktif** yang terekspos ke modul hilir (BR-008).

**Fitur: CRUD Header Paket (FR-002, FR-013)**
* **User Story**: US-001, US-011.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Form header berisi `kode_paket` (≤20 char alfanumerik), `nama_paket` (≤100 char), `deskripsi` (opsional), **Unit ketersediaan** (multi-pilih A3 atau "Semua Unit"). **Status TIDAK diinput** (sistem set **Aktif**; toggle di Dashboard). **Harga** ditetapkan lewat **Matriks Harga Jual** (FR-006) — bukan field tunggal.
    * **AC 2 — Keunikan ganda**: Simpan **memvalidasi keunikan `kode_paket` DAN `nama_paket`** terhadap paket yang **belum soft-deleted** (BR-001/001b/001c) → tolak dengan pesan spesifik.
    * **AC 3 — Komposisi wajib**: Paket wajib **≥ 1 item** komposisi sebelum dapat disimpan (BR-002).
    * **AC 3b — Unit wajib**: Paket wajib punya **≥ 1 Unit ketersediaan** atau ditandai **"Semua Unit"** sebelum disimpan (BR-021).
    * **AC 4 — Atomik**: Header + komposisi + **matriks harga** + Unit + snapshot ditulis dalam **satu transaksi**; bila gagal tidak ada yang tersimpan sebagian (NFR-003).
* **Validasi**:

  **A. Wording Validasi (Frontend)**

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|-----------|-------|---------------|-------------|
  | Kode Paket | Text | Required, ≤20, alfanumerik, unik (non-deleted) | "Kode wajib, ≤20 alfanumerik, & belum dipakai." | "Contoh: MCU-BASIC. Identitas referensi order/billing." |
  | Nama Paket | Text | Required, ≤100, unik (non-deleted) | "Nama paket wajib diisi & tidak boleh duplikat." | "Contoh: Paket MCU Basic." |
  | Deskripsi | Textarea | Optional, ≤500 | — | "Keterangan singkat paket." |
  | Unit Ketersediaan | Multi-select (A3) + toggle "Semua Unit" | Required (≥1 Unit **atau** "Semua Unit") | "Pilih minimal satu Unit atau centang Semua Unit." | "Menentukan di unit mana paket ditawarkan (BR-021)." |

**Fitur: Picker Komposisi Item Lintas Unit (FR-003, FR-004, FR-005, FR-015)**
* **User Story**: US-002, US-003, US-004.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Picker menarik item dari master **Lab (A14), Radiologi (A29), Tindakan (A10), Procedure (A13), Konsultasi/SMF (A23), Penunjang (Master Tarif)**; dapat **dicari & difilter per sumber unit**.
    * **AC 2**: Tiap baris item menampilkan **nama item, sumber unit (A3), `tarif_satuan` (referensi master), `qty` (default 1, editable ≥ 1), `subtotal` (auto)**.
    * **AC 3**: **Total Akumulasi Tarif = Σ(tarif_satuan × qty)** dihitung **live** tiap item ditambah/dihapus atau qty diubah (BR-004).
    * **AC 4**: Bila item merujuk master unit/tarif yang **non-aktif/terhapus**, sistem **memperingatkan** saat edit dan tidak menghitungnya sebagai item aktif baru (BR-012).
* **Validasi**:

  **A. Wording Validasi (Frontend)**

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|-----------|-------|---------------|-------------|
  | Item Pemeriksaan | Lookup (picker) | Required, item valid dari master | "Pilih item dari master." | "Cari per nama/kode; filter per unit." |
  | Qty | Number (int) | Required, ≥ 1, bilangan bulat | "Qty minimal 1." | "Boleh > 1 (BR-003)." |
  | Tarif Satuan / Subtotal | — (auto, read-only) | integer ≥ 0 | — | "Subtotal = Tarif × Qty (BR-004)." |

**Fitur: Matriks Harga Jual Paket — Tipe Penjamin × Kelas (FR-006, FR-009, FR-016)**
* **User Story**: US-005, US-005b, US-006.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Editor matriks**: Form menampilkan **Matriks Harga Jual**: **baris = Tipe Penjamin (A20)** termasuk **"Semua Penjamin"**, **kolom = Kelas (A58)** termasuk **"Semua Kelas"**. Tiap **sel** dapat diisi **harga manual** (nominal Rp, integer ≥ 0); sel kosong = warisi default (BR-020).
    * **AC 2 — Fallback berjenjang**: Harga efektif suatu konteks (penjamin, kelas) diresolusi: **sel (penjamin×kelas)** → **(penjamin × Semua Kelas)** → **(Semua Penjamin × kelas)** → **(Semua Penjamin × Semua Kelas)** → **Harga Akumulasi** (`total_accumulated_tariff`). Karena akumulasi selalu ada, **setiap konteks selalu menghasilkan harga** (BR-020).
    * **AC 3 — Tanpa sel wajib**: Paket boleh disimpan **tanpa mengisi sel apa pun** (seluruh matriks kosong) — semua konteks memakai Harga Akumulasi. Mengisi sel = override manual atas akumulasi.
    * **AC 4 — Selisih per sel**: Tiap sel terisi menampilkan **selisih = harga sel − Harga Akumulasi** (+ markup / − diskon), **informatif & tidak memblok simpan** (BR-023).
    * **AC 5 — Snapshot per sel**: Saat **Simpan**, nilai tiap sel & Harga Akumulasi **dibekukan (snapshot)**; keunikan **satu nilai aktif per (paket × penjamin × kelas)** (BR-022).
    * **AC 6 — Rupiah penuh**: Semua nilai uang **Rupiah penuh, integer ≥ 0, tanpa sen** (BR-011).
* **Validasi**:

  **A. Wording Validasi (Frontend)**

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|-----------|-------|---------------|-------------|
  | Sel Matriks (harga) | Number per sel | Optional; integer ≥ 0; tanpa sen; kosong = warisi default | "Harga tidak boleh negatif / tanpa sen." | "Kosongkan untuk memakai Harga Akumulasi. Sel spesifik meng-override baris/kolom Semua." |
  | Baris/Kolom "Semua" | Header matriks | "Semua Penjamin" & "Semua Kelas" = default/fallback; tidak wajib diisi | — | "Boleh langsung isi sel spesifik; celah tertutup Harga Akumulasi." |

**Fitur: Ketersediaan Paket per Unit (FR-026)**
* **User Story**: US-005c.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Form menyediakan **multi-pilih Unit (A3)** + toggle **"Semua Unit"**; paket wajib ≥ 1 Unit atau "Semua Unit" (BR-021).
    * **AC 2**: Modul hilir hanya menampilkan paket **Aktif** yang **Unit registrasinya termasuk** daftar Unit paket (atau paket "Semua Unit") — syarat adanya paket (BR-021).
    * **AC 3**: Unit **tidak mengubah harga** — harga tetap tunggal-matriks per paket; Unit hanya menyaring ketersediaan.
    * **AC 4**: Unit yang di-assign menjadi **non-aktif/terhapus** di A3 → paket **diperingatkan** saat edit; unit tsb tidak dihitung sebagai target ketersediaan aktif [ASUMSI] (analog BR-012).

**Fitur: Resolver Harga Efektif untuk Modul Hilir (FR-028)**
* **User Story**: US-016 *(konsumen hilir)*.
* **Prioritas**: P1.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: A44 mengekspos **lookup/API** yang, diberi (`package_id`, `unit`, `tipe_penjamin`, `kelas`), mengembalikan **harga efektif** mengikuti presedensi AC 2 fitur Matriks — atau menolak bila paket **tidak tersedia** untuk unit tsb (BR-021).
    * **AC 2**: Harga yang dikembalikan berasal dari **snapshot** paket (bukan hitung ulang tarif master) demi integritas historis (BR-006).
    * **AC 3**: **Pembentukan order** dari komposisi tetap terjadi **di pendaftaran** (Modul Order) — bukan di A44.

**Fitur: Snapshot & Edit dengan Concurrency (FR-007, FR-008, FR-023)**
* **User Story**: US-007, US-015.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Snapshot**: Saat **Simpan**, `total_accumulated_tariff` **dan setiap sel Matriks Harga** yang terisi **dibekukan** ke DB; perubahan tarif master setelahnya **tidak** mengubah nilai tersimpan (BR-006).
    * **AC 2 — Recompute saat edit**: Saat paket **dibuka**, akumulasi **dihitung ulang** dari tarif master terkini; token versi (`row_version`/`updated_at`) ditangkap.
    * **AC 3 — Optimistic locking**: Bila token versi **berubah** antara buka & simpan → simpan **ditolak** dengan pesan *"data telah diubah pengguna lain, muat ulang"* (BR-017, NFR-010).
    * **AC 4 — Replace-all**: Komposisi disimpan sebagai **unit utuh (replace-all)** dalam satu transaksi (tanpa partial merge antar user).

**Fitur: Status Aktif/Non-aktif (FR-010)**
* **User Story**: US-008.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Toggle status di Dashboard mengubah `status_aktif`; **hanya Aktif** terekspos ke modul hilir (BR-008).
    * **AC 2**: Paket **Non-aktif** tetap tersimpan, tidak muncul di hilir, dan **dapat diaktifkan kembali**.

**Fitur: Soft Delete Non-Destruktif (FR-011, FR-012)**
* **User Story**: US-009.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Hapus = **soft delete** (`is_deleted=true`) dengan konfirmasi; paket hilang dari daftar/pilihan.
    * **AC 2**: **Riwayat pelayanan/order** yang pernah memakai paket **tetap utuh** (tidak hilang/error); **hard delete tidak tersedia** (BR-009/010).
    * **AC 3**: Audit `deleted_by/at` tercatat (NFR-005).

**Fitur: Ekspos Paket Aktif ke Modul Hilir (FR-014)**
* **User Story**: US-016 *(konsumen hilir)*.
* **Prioritas**: P1.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Sistem mengekspos **daftar paket Aktif yang tersedia untuk Unit** yang diminta (atau paket "Semua Unit") via lookup/API internal untuk modul pendaftaran/layanan (BR-008/021).
    * **AC 2**: Harga jual paket diambil via **resolver** (FR-028) sesuai Tipe Penjamin × Kelas transaksi.
    * **AC 3**: **Pembentukan order** dari komposisi paket terjadi **di pendaftaran** (Modul Order) — bukan di A44.

**Fitur: Import Massal Paket + Preview (FR-017, FR-018, FR-019, FR-020, FR-021, FR-022)**
* **User Story**: US-012, US-013, US-014.
* **Prioritas**: P0.
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1 — Template**: Tersedia **unduh template Import Paket MCU (CSV/XLSX)** dengan kolom & contoh isian, mencakup **Unit ketersediaan** & **sel Matriks Harga (penjamin×kelas)** (§8.3.4).
    * **AC 2 — Unggah & parse**: Sistem menerima **unggah CSV/XLSX** (maks ukuran/baris [PERLU KONFIRMASI]) dan mem-parsing jadi baris kandidat (header + komposisi + unit + matriks harga).
    * **AC 3 — Validasi per baris**: Tiap baris divalidasi — `kode_paket` ≤20 alfanumerik & **unik**, `nama_paket` **unik**, item valid & ada di master, `qty` ≥ 1, harga sel rupiah penuh ≥ 0, **Unit valid (≥1 atau "Semua Unit")**, `tipe_penjamin`/`kelas` valid (A20/A58) atau "Semua", **duplikat dalam-file** & **terhadap existing** ditandai error (BR-015/016/021/022).
    * **AC 4 — Preview**: Sistem menampilkan **PREVIEW** — tabel baris **Valid** vs **Error/Duplikat** (dengan **alasan per baris**) + ringkasan jumlah; pengguna memilih **Proses** atau **Batal** (BR-014).
    * **AC 5 — Proses/Batal**: Pada **Proses**, **hanya baris valid** disimpan (snapshot dihitung saat simpan), baris error dilewati; tampilkan **ringkasan hasil** (X tersimpan, Y dilewati + alasan). Pada **Batal**, **tidak ada** yang tersimpan.
    * **AC 6 — Laporan gagal**: Tersedia **unduh daftar baris gagal** + alasan untuk diperbaiki & diunggah ulang [ASUMSI].
* **Validasi**:

  **A. Wording Validasi (Frontend)**

  | Field/Aksi | Tipe | Rules | Error Message | Helper Text |
  |-----------|------|-------|---------------|-------------|
  | File Import | Upload (CSV/XLSX) | Wajib; format sesuai template | "Format file tidak sesuai template." | "Unduh template dulu bila perlu." |
  | Baris (per-row) | — (validasi) | kode ≤20/unik, nama unik, item valid, qty ≥ 1, harga ≥ 0 | "Baris N: <alasan spesifik>." | "Kolom sesuai §8.3.4." |
  | Keputusan | Proses / Batal | Proses hanya simpan baris valid | — | "Batal = tidak ada yang tersimpan (BR-014)." |

**Fitur: Masa Berlaku & Versioning (FR-024, FR-025) — Phase 2**
* **User Story**: US-017.
* **Prioritas**: P2.
* **Fase**: Phase 2.
* **Acceptance Criteria**:
    * **AC 1 — Masa berlaku**: Field `berlaku_mulai`/`berlaku_sampai` (opsional; `berlaku_sampai` ≥ `berlaku_mulai`); modul hilir menampilkan paket bila **Aktif DAN** tanggal hari ini ∈ `[berlaku_mulai, berlaku_sampai]` (rentang kosong = selamanya) — BR-018.
    * **AC 2 — Versioning**: Perubahan komposisi/harga yang disimpan → **versi baru** (`version_no` inkremental); versi lama disimpan **immutable**; order historis merujuk versi saat transaksi (BR-019).
    * **AC 3 — Kompatibilitas maju**: Struktur Phase 1 tidak dirombak — hanya penambahan field tanggal & tabel `mcu_package_version` (§8.1).

### 7.2 Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| **NFR-001** | Performa | Perhitungan Total Akumulasi Tarif live ≤ **300 ms** untuk komposisi ≤ 50 item [ASUMSI]. |
| **NFR-002** | Performa | List paket termuat ≤ **2 dtk** untuk ≤ 500 paket (beban RS Tipe C/D) [ASUMSI]. |
| **NFR-002b** | Performa (Import) | Validasi & preview import ≤ **5 dtk** untuk ≤ 50 baris; tampilkan progress bila lebih [ASUMSI]. |
| **NFR-003** | Integritas data | Snapshot akumulasi & subtotal disimpan **atomik** bersama header (transaksi tunggal). Import menyimpan baris valid dalam transaksi terkontrol (parsial-aman: hanya baris valid commit). |
| **NFR-004** | Keamanan/Akses | CRUD & Import dibatasi role master data via **RBAC (A53)**; aksi tercatat audit. |
| **NFR-005** | Auditability | Setiap create/update/soft-delete/toggle/import menyimpan **user & timestamp**. |
| **NFR-006** | Reliabilitas | Soft delete & non-aktif **tidak menghapus data fisik**; riwayat pelayanan tetap utuh; data dapat dipulihkan (BR-009/010). Hard delete tidak tersedia. |
| **NFR-007** | Usability | Picker komposisi & layar import mendukung pencarian cepat, filter per unit, preview jelas; UI sederhana untuk SDM terbatas RS Tipe C/D. |
| **NFR-008** | Konsistensi mata uang | Semua nilai **Rupiah penuh tanpa sen**, format ribuan (Rp20.000); penyimpanan **integer rupiah** (BR-011). |
| **NFR-009** | Reliabilitas jaringan | Berjalan baik pada **koneksi tidak stabil** (lokal/intranet, tanpa integrasi eksternal real-time). Import idempotent terhadap retry (cek unik kode+nama). |
| **NFR-010** | Concurrency | **Optimistic locking** (disarankan): tangkap `row_version`/`updated_at` saat buka; bandingkan saat simpan; bila berubah → tolak + pesan muat ulang. Hindari pessimistic lock. Komposisi **& matriks harga** disimpan replace-all dalam satu transaksi (BR-017, FR-023). |
| **NFR-011** | Performa (Resolver) | Resolver harga efektif (per package_id × unit × penjamin × kelas) mengembalikan hasil ≤ **200 ms** dari data snapshot; **tanpa** hitung ulang tarif master (BR-006) [ASUMSI]. |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

> **Struktur DB final diserahkan tim dev** [ASUMSI]; usulan berikut acuan. Field bersama (`unit`, `status_aktif`) memakai definisi kanonik lintas-PRD (konsisten A3/master lain).

* **Table Name**: `mcu_package` (Paket MCU — header)
    * `id`: UUID (Primary Key)
    * `package_code`: VARCHAR(20) (unik, alfanumerik) — BR-001
    * `package_name`: VARCHAR(100) (unik) — BR-001b
    * `description`: VARCHAR(500) (opsional)
    * `total_accumulated_tariff`: INTEGER (Rp, snapshot, ≥ 0) — **Harga Akumulasi = fallback** bila sel matriks kosong (BR-006/020)
    * `is_all_units`: Boolean (default false) — bila true, paket tersedia di **Semua Unit** (abaikan `mcu_package_unit`) — BR-021
    * `is_active`: Boolean (default true) — BR-008
    * `is_deleted`: Boolean (default false) — soft delete (BR-009/010)
    * `row_version`: INTEGER — optimistic lock (BR-017)
    * `created_by/at`, `updated_by/at`, `deleted_by/at`: audit
    * *(Phase 2)* `effective_from`: DATE, `effective_to`: DATE — masa berlaku (BR-018)

* **Table Name**: `mcu_package_item` (komposisi)
    * `id`: UUID (Primary Key)
    * `package_id`: UUID (FK → mcu_package, ON DELETE RESTRICT)
    * `item_id`: UUID/VARCHAR — item master (A14/A29/A10/A13/A23/Master Tarif)
    * `item_source_unit`: VARCHAR — sumber unit (A3, kanonik)
    * `tariff_unit_snapshot`: INTEGER (Rp) — tarif satuan saat simpan
    * `qty`: INTEGER (≥ 1, default 1) — BR-003
    * `subtotal_snapshot`: INTEGER (Rp) = `tariff_unit_snapshot × qty` — BR-004

* **Table Name**: `mcu_package_price` (Matriks Harga Jual — sel Tipe Penjamin × Kelas) *(Phase 1)*
    * `id`: UUID (Primary Key)
    * `package_id`: UUID (FK → mcu_package, ON DELETE RESTRICT)
    * `tipe_penjamin_id`: UUID (FK → A20, **nullable**) — `NULL` = **Semua Penjamin** (baris default)
    * `kelas_id`: UUID (FK → A58, **nullable**, **Kelas induk saja**) — `NULL` = **Semua Kelas** (kolom default)
    * `price_snapshot`: INTEGER (Rp, ≥ 0) — harga manual sel, dibekukan saat simpan (BR-011/022)
    * `is_active`: Boolean (default true)
    * `created_by/at`, `updated_by/at`: audit
    * **Unique (aktif)**: `UNIQUE(package_id, COALESCE(tipe_penjamin_id,'ALL'), COALESCE(kelas_id,'ALL')) WHERE is_active=true` — maksimal **satu sel aktif** per (paket × penjamin × kelas) (BR-022). *(sentinel COALESCE karena NULL tak dianggap sama di unique index).*
    * > **Sel kosong tidak disimpan** sebagai baris — ketiadaan baris = warisi default → Harga Akumulasi (BR-020).

* **Table Name**: `mcu_package_unit` (Ketersediaan Unit) *(Phase 1)*
    * `id`: UUID (Primary Key)
    * `package_id`: UUID (FK → mcu_package, ON DELETE RESTRICT)
    * `unit_id`: UUID (FK → A3 Unit, kanonik)
    * **Unique**: `UNIQUE(package_id, unit_id)` — satu unit tak berganda per paket (BR-021).
    * > Diabaikan bila `mcu_package.is_all_units = true`.

* **Table Name**: `mcu_package_version` *(Phase 2)* — histori versi
    * `id`: UUID (Primary Key)
    * `package_id`: UUID (FK → mcu_package)
    * `version_no`: INTEGER (inkremental)
    * `snapshot`: JSONB — header + komposisi + **matriks harga** + unit saat versi
    * `effective_at`: TIMESTAMPTZ · `created_by/at`: audit — BR-019

> **Catatan implementasi**: (a) Keunikan **kode DAN nama** dievaluasi hanya terhadap paket **belum soft-deleted** (BR-001c) — gunakan **partial unique index** `WHERE NOT is_deleted`. (b) `total_accumulated_tariff`, `subtotal_snapshot`, **& `mcu_package_price.price_snapshot`** = **snapshot** saat simpan (BR-006). (c) Komposisi, **matriks harga, & unit** disimpan **replace-all** dalam satu transaksi (NFR-010). (d) Kolom Phase 2 (`effective_from/to`, tabel `mcu_package_version`) disiapkan namun belum aktif. (e) `ON DELETE RESTRICT` menegaskan **tidak ada hard delete** (BR-010). (f) Resolver harga (FR-028) mengevaluasi presedensi sel matriks → Harga Akumulasi **di aplikasi**, bukan menyimpan hasil per konteks (BR-020).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mcu-packages` | List paket + ringkasan (kode, nama, jml item, mode, harga, selisih, status). |
| GET | `/api/v1/mcu-packages/{id}` | Detail paket + komposisi + **matriks harga** + **unit** (recompute akumulasi + token versi). |
| POST | `/api/v1/mcu-packages` | Create paket + komposisi + **matriks harga** + **unit** (atomik; snapshot saat simpan). |
| PUT | `/api/v1/mcu-packages/{id}` | Update paket + komposisi + **matriks harga + unit** (replace-all; **optimistic lock** via `row_version`). |
| PATCH | `/api/v1/mcu-packages/{id}/status` | Toggle Aktif/Non-aktif. |
| DELETE | `/api/v1/mcu-packages/{id}` | **Soft delete** (set `is_deleted`); hard delete tidak disediakan. |
| GET | `/api/v1/mcu-packages?active=true&unit={unit_id}` | Lookup paket **Aktif** yang **tersedia untuk unit** tsb (atau "Semua Unit") untuk modul pendaftaran/layanan (BR-008/021). |
| GET | `/api/v1/mcu-packages/{id}/price?unit=&tipe_penjamin=&kelas=` | **Resolver harga efektif** (FR-028): presedensi sel matriks → Harga Akumulasi; tolak bila paket tak tersedia untuk unit (BR-020/021). |
| GET | `/api/v1/tariff-items?source=lab\|radiologi\|tindakan\|procedure\|konsultasi\|penunjang&q=` | Picker item komposisi lintas unit (A14/A29/A10/A13/A23/Master Tarif). |
| GET | `/api/v1/mcu-packages/import/template` | Unduh **template** Import (CSV/XLSX). |
| POST | `/api/v1/mcu-packages/import/validate` | Unggah file → parse & validasi → kembalikan **PREVIEW** (valid vs error + alasan). |
| POST | `/api/v1/mcu-packages/import/commit` | **Proses** baris valid (snapshot saat simpan) → ringkasan hasil. |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

*Header Paket (`mcu_package`)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| package_code | Kode Paket | String | Ya | Unik (non-deleted), ≤20, alfanumerik | manual | Identitas order/billing (BR-001). |
| package_name | Nama Paket | String | Ya | Unik (non-deleted), ≤100 | manual | Tak boleh duplikat (BR-001b). |
| description | Deskripsi | Text | Tidak | ≤500 [ASUMSI] | manual | Keterangan singkat. |
| total_accumulated_tariff | Harga Akumulasi | Integer (Rp) | Auto | read-only, ≥ 0, tanpa sen | auto Σ(subtotal) | Dibekukan saat simpan; **fallback** harga bila sel matriks kosong (BR-006/020). |
| units | Unit Ketersediaan | Multi-lookup (A3) / "Semua Unit" | Ya | ≥1 Unit **atau** `is_all_units=true` | A3 (kanonik) | Syarat paket tampil di hilir (BR-021). |
| status_aktif | — | Boolean | Ya (sistem) | default `true` | sistem | Tidak diinput; toggle di Dashboard (BR-008). |

*Matriks Harga Jual (`mcu_package_price`) — sel per Tipe Penjamin × Kelas*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| tipe_penjamin_id | Tipe Penjamin (baris) | Lookup A20 / "Semua Penjamin" | Auto | valid A20 atau null | A20 | null = Semua Penjamin (default warisan). |
| kelas_id | Kelas (kolom) | Lookup A58 / "Semua Kelas" | Auto | valid A58 (**Kelas induk**) atau null | A58 | null = Semua Kelas (default warisan). |
| price_snapshot | Harga Sel | Integer (Rp) | Tidak | ≥ 0, tanpa sen; **kosong = tak disimpan → fallback Akumulasi** | manual | Override manual atas akumulasi (BR-020/022). |
| selisih | Selisih (Markup/Diskon) | Integer (Rp) | Auto | = harga sel − akumulasi | auto | + markup / − diskon; informatif (BR-023). |

*Ketersediaan Unit (`mcu_package_unit`)*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| unit_id | Unit | Lookup A3 | Ya (bila bukan Semua Unit) | valid & aktif di A3 | A3 (kanonik) | Paket tampil di hilir hanya untuk unit ini (BR-021). |

*Baris Item Komposisi (`mcu_package_item`) — picker lintas unit*

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| item_id | Item Pemeriksaan | Lookup | Ya | item valid dari master; paket ≥ 1 item | A14/A29/A10/A13/A23/Master Tarif | Pilih via picker (BR-002). |
| nama_item | Nama Item | String | Auto | — | dari master item | Read-only. |
| unit | Sumber Unit | Lookup | Auto | dari Master Unit | A3 (kanonik) | Reuse definisi A3. |
| tariff_unit_snapshot | Tarif Satuan | Integer (Rp) | Auto | ≥ 0, read-only, tanpa sen | dari master tarif item | Basis subtotal. |
| qty | Qty | Integer | Ya | bilangan bulat ≥ 1 | default 1 | Boleh > 1 (BR-003). |
| subtotal_snapshot | Subtotal | Integer (Rp) | Auto | = tarif × qty, read-only | auto | BR-004. |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View / Dashboard)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Total Paket Aktif | count `is_active=true & not is_deleted` | angka besar (kartu) | — | ringkasan. |
| Kode Paket | `package_code` | teks | sort, search | unik. |
| Nama Paket | `package_name` | teks | sort, search | unik. |
| Jml Item | count komposisi | angka | sort | jumlah komponen. |
| Harga Akumulasi | `total_accumulated_tariff` | Rp penuh (Rp20.000) | sort | nilai snapshot; fallback harga. |
| Rentang Harga (Matriks) | min–max `mcu_package_price.price_snapshot` | Rp penuh (min–max) / "Akumulasi" bila kosong | sort | sebaran harga per penjamin×kelas (BR-020). |
| Jml Sel Terisi | count `mcu_package_price` | angka | sort | 0 = semua konteks pakai Akumulasi. |
| Unit Ketersediaan | `mcu_package_unit` / `is_all_units` | chips unit / "Semua Unit" | filter | syarat tampil di hilir (BR-021). |
| Status | `is_active` | badge (Aktif/Non-aktif) | filter | merah bila Non-aktif. |
| *(Phase 2)* Periode Berlaku | `effective_from`–`effective_to` | tanggal + badge **Kedaluwarsa** | filter | BR-018. |
| Aksi | — | Edit / Aktif-Nonaktif / Hapus(soft) | — | tanpa hard delete. |

#### 8.3.3 Spesifikasi Data — Import: Preview Hasil Validasi (FR-020/021)

| Kolom | Sumber Data | Format | Catatan |
|-------|-------------|--------|---------|
| No. Baris | file import | angka | nomor baris di file. |
| Kode Paket | baris.kode_paket | teks | dicek unik & ≤20 alfanumerik. |
| Nama Paket | baris.nama_paket | teks | dicek unik. |
| Jml Item | baris (komposisi) | angka | ≥ 1 (BR-002). |
| Unit | baris.unit(s) / "Semua Unit" | chips | ≥1 unit valid atau Semua (BR-021). |
| Sel Matriks | baris (penjamin×kelas→harga) | ringkas (n sel) / "Akumulasi" | opsional; kosong = fallback Akumulasi (BR-020). |
| Status Validasi | hasil validasi | badge **Valid (hijau)** / **Error (merah)** | — |
| Alasan Error | hasil validasi | teks | mis. "kode duplikat", "nama sudah ada", "item tidak ditemukan", "qty < 1", "unit tidak dikenal", "penjamin/kelas tidak valid". |
| (Footer) Ringkasan | agregasi | "X valid, Y error" + tombol **Proses**/**Batal** | BR-014. |

> Setelah **Proses**: layar **Ringkasan Hasil** menampilkan jumlah tersimpan, jumlah dilewati, dan unduhan baris gagal (FR-021/022).

#### 8.3.4 Template Import Paket MCU (CSV/XLSX) (FR-017) [PERLU KONFIRMASI struktur final dgn tim dev]

Usulan **empat sheet** (atau satu sheet baris berulang dikelompokkan `kode_paket`):
* **Sheet 1 — Header Paket**: `kode_paket`, `nama_paket`, `deskripsi`, `semua_unit` (Y/N).
* **Sheet 2 — Komposisi**: `kode_paket` (relasi ke header), `kode_item`/`item_id`, `qty`.
* **Sheet 3 — Unit Ketersediaan**: `kode_paket`, `kode_unit`/`unit_id` (diabaikan bila `semua_unit=Y`).
* **Sheet 4 — Matriks Harga**: `kode_paket`, `tipe_penjamin` (kode A20 atau `SEMUA`), `kelas` (kode A58 atau `SEMUA`), `harga` (rupiah penuh). Baris yang tak diisi = konteks memakai **Harga Akumulasi**.
> Validasi import mengikuti BR-015/016/021/022. Bila satu sheet: tiap baris = 1 item; header/unit/matriks diambil dari kolom tambahan per `kode_paket`. Status paket di-set **Aktif** oleh sistem (tidak diimpor).

**Business Rules**
* **BR-001**: `package_code` wajib & **unik**, maks **20 karakter alfanumerik** (huruf+angka).
* **BR-001b**: `package_name` juga wajib **unik**. Paket duplikat bila **kode ATAU nama** bertabrakan dengan paket lain belum soft-deleted → tolak simpan/import.
* **BR-001c**: Keunikan **dievaluasi terhadap paket belum soft-deleted**. Kode/nama paket soft-deleted tetap dipertahankan; bila tabrakan dengan paket soft-deleted, sistem **memperingatkan** & menyarankan mengaktifkan/memulihkan paket lama alih-alih membuat duplikat [ASUMSI penanganan].
* **BR-002**: Paket **wajib ≥ 1 item** komposisi sebelum disimpan (manual maupun import).
* **BR-003**: `qty` per item default 1, **boleh > 1**, bilangan bulat positif (≥ 1).
* **BR-004**: `subtotal` = `tarif_satuan × qty`; **Total Akumulasi Tarif** = Σ subtotal; dihitung ulang otomatis tiap item/qty berubah selama sesi edit.
* **BR-005**: **Harga Akumulasi** (`total_accumulated_tariff` = Σ subtotal) selalu dihitung & disimpan; berfungsi sebagai **harga acuan/fallback**. Penetapan harga jual dilakukan lewat **Matriks Harga (BR-020)**, **bukan** lagi lewat mode Akumulasi/Manual (field `price_mode` dihapus).
* **BR-005b**: *(digantikan BR-023 — selisih dihitung per sel matriks vs Harga Akumulasi).*
* **BR-006**: **Snapshot** — `total_accumulated_tariff` **dan setiap sel Matriks Harga** (`mcu_package_price.price_snapshot`) **dibekukan saat Simpan**. Perubahan tarif master unit setelahnya **tidak** otomatis mengubah nilai tersimpan; akumulasi hanya dihitung ulang saat paket dibuka & disimpan ulang.
* **BR-007** *(direvisi v1.3)*: Harga jual paket **dibedakan per Tipe Penjamin × Kelas** lewat **Matriks Harga (BR-020)** — menggantikan aturan "harga tunggal lintas penjamin" (v1.2). Bila RS tidak membedakan, cukup isi sel **Semua Penjamin × Semua Kelas** atau kosongkan seluruhnya (pakai Akumulasi).
* **BR-008**: Hanya paket **Aktif** yang muncul sebagai pilihan di modul pendaftaran/layanan. **Non-aktif** tetap tersimpan & dapat diaktifkan kembali.
* **BR-009**: **Soft delete (non-destruktif)** — paket dihapus tidak hilang permanen, tidak muncul di daftar/pilihan; **riwayat pelayanan/order sebelumnya tetap utuh tanpa hilang/error**.
* **BR-010**: **Hard delete tidak diperkenankan** untuk paket apa pun. Penghapusan hanya via soft delete; non-aktif untuk menyembunyikan dari hilir.
* **BR-011**: `price_snapshot` (sel matriks), `tarif_satuan`, `subtotal`, `total_accumulated_tariff` = **Rupiah penuh tanpa sen** (disimpan integer rupiah, ≥ 0).
* **BR-012**: Item komposisi yang sumbernya (master unit/tarif) telah dinonaktifkan/dihapus → **ditandai/diperingatkan** saat edit; tidak dihitung sebagai item aktif baru [ASUMSI].
* **BR-013**: Mapping terminologi (LOINC/SATUSEHAT/FHIR) **tidak** dilakukan di level paket; melekat pada item komponen saat order terbentuk.
* **BR-014 (Import)**: Import diproses **hanya setelah preview dikonfirmasi (Proses)**. **Batal** → tidak ada baris tersimpan.
* **BR-015 (Import)**: Pada import, **hanya baris valid** disimpan; baris error/duplikat **dilewati** & dilaporkan dengan alasan. Validasi tiap baris memenuhi BR-001/001b/002/003/005/011.
* **BR-016 (Import)**: **Duplikat dalam file** (kode/nama berulang antar baris) maupun **duplikat terhadap existing** → error di preview, tidak diproses.
* **BR-017 (Concurrency)**: Edit paket memakai **optimistic locking**: token versi (`updated_at`/`row_version`) ditangkap saat buka; bila berubah saat simpan → tolak dengan pesan *"data telah diubah pengguna lain, muat ulang"*.
* **BR-018** *(Phase 2)*: **Masa berlaku** — bila `berlaku_mulai`/`berlaku_sampai` diisi, paket hanya valid dipanggil hilir dalam rentang tersebut (selain harus Aktif). `berlaku_sampai` ≥ `berlaku_mulai`.
* **BR-019** *(Phase 2)*: **Versioning** — perubahan komposisi/harga menghasilkan versi baru; order historis merujuk versi saat transaksi.
* **BR-020 (Matriks Harga)**: Setiap paket punya **Matriks Harga Jual** berdimensi **Tipe Penjamin (A20, baris) × Kelas (A58, kolom)**, keduanya menyertakan opsi **"Semua"** (null = default). Tiap **sel** dapat diisi **harga manual** (nominal Rp integer ≥ 0). **Harga efektif** untuk konteks (penjamin, kelas) diresolusi berjenjang: **(penjamin×kelas) → (penjamin×Semua Kelas) → (Semua Penjamin×kelas) → (Semua Penjamin×Semua Kelas) → Harga Akumulasi**. Sel kosong **tidak disimpan**; ketiadaannya = jatuh ke tingkat berikutnya. Karena Akumulasi selalu ada, **setiap konteks selalu menghasilkan harga**. Matriks **tidak** dipisah per Unit (harga sama lintas unit).
* **BR-021 (Ketersediaan Unit)**: Paket punya daftar **Unit (A3)** tempat ia ditawarkan, **atau** ditandai **"Semua Unit"** (`is_all_units=true`). Paket wajib punya **≥ 1 Unit atau "Semua Unit"** untuk disimpan. Modul hilir hanya menampilkan paket **Aktif** yang **Unit registrasinya termasuk** daftar tsb (atau paket "Semua Unit"). Unit **hanya** menyaring ketersediaan (**syarat adanya paket**) — **tidak** memengaruhi harga.
* **BR-022 (Keunikan & snapshot sel)**: Maksimal **satu sel aktif** per kombinasi **(paket × penjamin × kelas)** — kombinasi (termasuk "Semua") tak boleh ganda. Nilai tiap sel **di-snapshot** saat simpan; matriks disimpan **replace-all** dalam transaksi paket (NFR-010).
* **BR-023 (Selisih per sel)**: Untuk tiap sel terisi, sistem menampilkan **selisih = harga sel − Harga Akumulasi** (+ markup / − diskon). **Informatif**; tidak memblok simpan (menggantikan BR-005b).

### 8.4 Integrasi Eksternal & Internal

**Modul ini TIDAK melakukan integrasi eksternal langsung** — master data internal Control Panel; operasi **tahan koneksi tidak stabil** (intranet/lokal).

**Integrasi internal (lookup ke master lain):**
* **A14 Item Lab** / **A29 Item Radiologi** — sumber item + tarif satuan.
* **A10 Tindakan** / **A13 Procedure** — item tindakan/pemeriksaan fisik + tarif.
* **A23 Spesialisasi & SMF** — item Konsultasi/DPJP.
* **A3 Unit** — field `unit` (kanonik) **dan** dimensi **Ketersediaan** paket (BR-021).
* **A20 Tipe Penjamin** — **baris Matriks Harga** (`tipe_penjamin_id`; null = Semua Penjamin) — BR-020.
* **A58 Kelas** — **kolom Matriks Harga** (`kelas_id`, Kelas induk; null = Semua Kelas) — BR-020.
* **Master Tarif** — item & tarif **penunjang lain** (EKG, treadmill, spirometri, audiometri) [PERLU KONFIRMASI nama/kode master].

**Terminologi & SATUSEHAT:** mapping LOINC/SATUSEHAT/FHIR **tidak** di level paket (BR-013); melekat pada item komponen & diproses saat **order terbentuk di pendaftaran** (g-support-mcu). A14/A29/A10/A13 sudah berintegrasi SATUSEHAT/BPJS V2 di level item — paket hanya mereferensikan.

**Integrasi ke modul hilir (konsumen, bukan dilakukan modul ini):** Pendaftaran/Admisi & Pelayanan (g-admisi-onsite-registration, g-support-mcu) memanggil daftar paket **Aktif yang tersedia untuk Unit registrasi** (FR-014/BR-021) & **resolver harga** (FR-028) per Tipe Penjamin × Kelas; **pembentukan order komponen terjadi di pendaftaran**. Billing/Casemix memakai **harga efektif hasil resolver**; alokasi pendapatan per unit = Out of Scope.

## 9. Workflow / BPMN Interpretation

Tidak ada BPMN khusus A44; alur **diturunkan [ASUMSI]** dari overview + analogi g-support-mcu (*Order paket MCU*) & g-admisi-onsite-registration.

**Proses 1 — Definisi Paket manual (A44, Phase 1) [happy path]**
1. **Aktor: Pengguna Master Data** membuka menu *Paket Pelayanan MCU* → klik **Tambah Paket**.
2. Isi header: `kode_paket` (unik, ≤20 alfanumerik), `nama_paket` (unik), `deskripsi`, **Unit ketersediaan** (≥1 Unit A3 atau "Semua Unit"). (Status tidak diinput → sistem set Aktif.)
3. Buka **picker komposisi** → pilih item lintas unit (Lab/Radiologi/Tindakan/Procedure/Konsultasi/Penunjang), atur `qty`. Tiap item: nama, sumber unit, tarif satuan, subtotal.
4. Sistem menghitung **Harga Akumulasi** live (Σ tarif × qty).
5. Isi **Matriks Harga Jual** (baris Tipe Penjamin A20 × kolom Kelas A58): isi harga manual pada sel yang perlu dibedakan; **kosongkan** sel lain (akan mewarisi "Semua" lalu jatuh ke **Harga Akumulasi**). Tiap sel terisi menampilkan **selisih (markup/diskon)** vs akumulasi.
6. Klik **Simpan** → **Decision: Validasi lolos?** (kode duplikat / **nama duplikat** / komposisi kosong / **Unit kosong** / qty < 1 / harga sel < 0). Tidak → error spesifik, kembali edit. Ya → **snapshot** Harga Akumulasi & tiap sel matriks + simpan komposisi/matriks/unit (atomik, replace-all).
7. Paket **Aktif** siap dipanggil modul pendaftaran/layanan **pada Unit yang di-assign**; harga jual diresolusi per **penjamin × kelas** transaksi (FR-028).

**Proses 2 — Import massal paket (A44, Phase 1)**
1. Unduh **template** CSV/XLSX → isi banyak paket (header + komposisi) → **unggah**.
2. Sistem **parse & validasi tiap baris** (format, keunikan kode+nama, item valid, qty ≥ 1, dst).
3. Tampilkan **PREVIEW**: baris **valid** vs **error/duplikat** (+ alasan) + ringkasan.
4. **Decision — Proses?** *Proses* → hanya baris valid disimpan (snapshot saat simpan), baris error dilewati & dilaporkan; *Batal* → tidak ada tersimpan.
5. Tampilkan **ringkasan hasil** (X tersimpan, Y dilewati + alasan) + unduhan baris gagal.

**Proses 3 — Pemeliharaan**
* **Edit**: buka paket → tangkap token versi → akumulasi **dihitung ulang** dari tarif master terkini → ubah komposisi/qty/**sel matriks harga**/**unit ketersediaan** → Simpan → **Decision: token versi sama?** Berubah → tolak + muat ulang (BR-017); sama → snapshot (akumulasi + tiap sel) diperbarui.
* **Toggle Non-aktif**: paket tidak muncul di hilir, data tetap tersimpan.
* **Soft delete**: paket hilang dari daftar/pilihan; **riwayat order sebelumnya tetap utuh**; **hard delete tidak diperkenankan**.

**Konsumsi oleh modul hilir (referensi, di luar modul ini)**
* Saat **pendaftaran**, sistem menampilkan paket Aktif **yang tersedia untuk Unit registrasi** (BR-021); saat paket dipilih, **resolver (FR-028)** mengembalikan **harga efektif** sesuai **Tipe Penjamin × Kelas** transaksi (presedensi sel matriks → Harga Akumulasi) → **pembentukan order komponen terjadi di pendaftaran** (g-support-mcu: *Order paket MCU*) → *Print bundle hasil MCU*.

**Alur Phase 2 (dirancang) [ASUMSI]**
* Saat simpan, isi `berlaku_mulai`–`berlaku_sampai`; hilir hanya menampilkan paket **Aktif DAN** dalam rentang berlaku (BR-018).
* Perubahan komposisi/harga membuat **versi baru** (`mcu_package_version`); order historis merujuk versi saat transaksi (BR-019).

## Asumsi
- [ASUMSI] Tidak ada BPMN khusus A44; alur As-Is/To-Be & workflow diturunkan dari overview + analogi g-support-mcu / g-admisi-onsite-registration — ditandai [ASUMSI] pada §9.
- [ASUMSI] Master A14, A29, A10, A13, A23, A3, dan **Master Tarif** (penunjang lain) tersedia sebagai sumber item & tarif; A44 hanya mereferensikan (lookup).
- [PERLU KONFIRMASI] Nama/kode **Master Tarif** untuk item penunjang lain (EKG, treadmill, spirometri, audiometri) yang belum punya master tersendiri.
- [PERLU KONFIRMASI] Batas ukuran/jumlah baris file import & struktur final template (§8.3.4).
- [ASUMSI] Nilai uang disimpan **integer Rupiah** tanpa sen (BR-011).
- [ASUMSI] Struktur DB final (tabel/field/versi) **diserahkan tim dev**; usulan `mcu_package` + `mcu_package_item` (+ `mcu_package_version` Phase 2) hanya rancangan acuan.
- [KEPUTUSAN] Keunikan **kode DAN nama** dievaluasi terhadap paket **belum soft-deleted** (BR-001c); **hard delete dilarang** (BR-010).
- [KEPUTUSAN] **Snapshot** nilai akumulasi saat simpan menjaga integritas harga historis (BR-006); **optimistic locking** untuk concurrency (BR-017/NFR-010).
- [KEPUTUSAN v1.3] **Matriks Harga Jual** (Tipe Penjamin A20 × Kelas A58, Phase 1) menggantikan harga tunggal (BR-007 direvisi): sel = harga manual; kosong → warisi "Semua" → **Harga Akumulasi** sebagai fallback (BR-020). **Phase 3 (Mapping COA) tetap N/A** — alokasi pendapatan per unit di modul Billing/Casemix (Out of Scope).
- [KEPUTUSAN v1.3] **Unit (A3) = syarat ketersediaan** paket (di unit mana paket ditawarkan), **bukan** variabel harga — harga TIDAK dipisah per unit; satu matriks Penjamin×Kelas berlaku untuk seluruh paket (BR-021).
- [ASUMSI] Paket wajib ≥1 Unit atau "Semua Unit"; unit yang dinonaktifkan/terhapus di A3 → paket diperingatkan saat edit (analog BR-012).
- [KEPUTUSAN] Kolom Kelas pada matriks harga memakai **hanya Kelas induk** (I/II/III/VIP), selaras A58/A59 — **bukan** Sub Kelas (dikonfirmasi user).