# PRD — Dashboard VK (E7a)

**Related Document:** Child/consumer dari E7 Order Tindakan VK; BPMN g-support-vk.json; D8 EMR RI; E1, E2, E3, E4, E6, E8, E9, E12, E22; F38; D3; D10
**Versi:** 1.2 — Update data grid, penyelesaian layanan, dan billing VK
**Tanggal:** 18 Juli 2026

## 1. Metadata Dokumen

| Item | Nilai |
|---|---|
| Feature Code | E7a |
| Modul | VK — Dashboard VK |
| Parent | E7 — Order Tindakan VK |
| Cluster | Pelayanan Utama |
| Sumber alur | `bpmn/g-support-vk.json` — area F36/F37/F38/F39 VK |
| Status | Draft awal |

### Approval

| Nama | Jabatan | Tanggal |
|---|---|---|
| [PERLU KONFIRMASI] | Kepala Unit VK / Owner Klinis | [PERLU KONFIRMASI] |
| [PERLU KONFIRMASI] | Kepala Keperawatan | [PERLU KONFIRMASI] |
| [PERLU KONFIRMASI] | Product Owner SIMRS | [PERLU KONFIRMASI] |

### Dokumen Terkait

- **E7 Order Tindakan VK:** produsen handoff dan state awal `ORDER_CREATED`; bukan pemilik state pelayanan berikutnya.
- **D8 EMR RI (Rawat Inap, IBS, VK):** entry point asesmen VK untuk muat/edit; template asesmen yang berlaku [PERLU KONFIRMASI].
- **Pengaturan — Tarif Pendaftaran:** sumber tarif **Biaya Administrasi VK**.
- **A10 Master Data Tarif Tindakan / A59 Pengaturan Harga Obat:** sumber referensi besaran charge layanan VK sesuai tindakan/obat yang dicatat modul tujuan.
- **G2 Billing — Tagihan Pasien:** tujuan seluruh charge layanan VK dan biaya administrasi VK.
- **E1 Tindakan & BHP, E2 e-Resep, E12 CPO, E3 Lab, E4 Radiologi, E22 Patologi Anatomi, E8 Gizi, E6 Ambulans, E9 Order IBS, F38 Surat Keterangan Lahir, D3 Data Sosial, D10 Dokumen Pendukung:** domain aksi klinis/administratif yang dibuka dari konteks pasien Dashboard VK.

### Riwayat Versi

| Tanggal | Versi | Deskripsi |
|---|---|---|
| 18 Juli 2026 | 1.0 | Draft awal Dashboard VK, tiga tab worklist, aksi penerimaan/penolakan/selesai, dan integrasi action launcher. |
| 18 Juli 2026 | 1.1 | Konfirmasi stakeholder: Terima langsung mengaktifkan pasien ke `IN_PROGRESS`; penyelesaian pelayanan dipisahkan dari discharge; Pulangkan Pasien memanggil E13; action lintas-modul hanya tersedia saat Sedang Dilayani; default filter harian dengan timezone Asia/Jakarta. |
| 18 Juli 2026 | 1.2 | Penambahan Unit Dirawat, filter Waktu dan Dokter pada Sudah Dilayani, perubahan Pulangkan Pasien menjadi penyelesaian layanan VK, serta integrasi biaya administrasi dan charge ke Billing G2. |

## 2. Overview & Background

### Overview / Brief Summary

Dashboard VK adalah **worklist operasional pasien Verlos Kamer**, bukan dashboard analitik. Dashboard mengonsumsi order aktif dari E7, memberi petugas VK satu daftar pasien yang aman untuk dikonfirmasi, dilayani, dan ditutup pelayanannya. Semua aksi membuka modul pemilik data dengan konteks pasien/kunjungan VK yang sama; Dashboard VK tidak menggantikan EMR, order klinis, farmasi, penunjang, ataupun discharge administratif.

Tiga tab tetap tersedia: **Konfirmasi Permintaan**, **Sedang Dilayani**, dan **Sudah Dilayani**. Ketiga tab menampilkan **Unit Dirawat** sebagai tujuan bangsal dari SPRI bila tersedia; bila tidak ada SPRI dari Unit Asal, nilainya ditampilkan `-`. Kolom **Tanggal Selesai** hanya ditampilkan pada Tab Sudah Dilayani.

Setiap pasien yang masuk dan dilayani di VK dikenakan **Biaya Administrasi VK**. Tarifnya diatur melalui **Modul Pengaturan → Tarif Pendaftaran**. Charge layanan VK dari seluruh aksi klinis/administratif diteruskan ke **Billing → Tagihan Pasien (G2)**.

### As-Is [ASUMSI]

1. Permintaan pasien ke VK diterima melalui komunikasi lisan/telepon atau daftar yang tidak seragam.
2. Petugas sulit membedakan pasien yang masih menunggu penerimaan, sedang ditangani, dan sudah selesai.
3. Akses EMR, tindakan, resep/CPO, penunjang, surat lahir, dan dokumen dilakukan dari menu terpisah sehingga konteks kunjungan dapat salah pilih.
4. Penolakan atau penyelesaian pelayanan tidak selalu memiliki alasan, waktu, dan pelaku yang dapat diaudit.

### To-Be

1. E7 menyimpan order dan membuat satu worklist item VK berstatus `ORDER_CREATED`.
2. Dashboard VK menampilkan item itu pada tab **Konfirmasi Permintaan**. Petugas berwenang memilih **Terima** atau **Tolak**.
3. Terima adalah satu aksi UI. Sistem mencatat event `RECEIVED` sebagai bukti penerimaan lalu langsung mengaktifkan item sebagai `IN_PROGRESS`; item berpindah ke tab **Sedang Dilayani** tanpa tab/status UI RECEIVED terpisah. Tolak mengubah state menjadi `REJECTED`, mewajibkan alasan, dan mencatat audit trail; item tidak dihapus fisik.
4. Pada Sedang Dilayani, petugas membuka aksi lintas-modul dengan `patient_id`, `encounter_id`, `vk_order_id`, dan konteks `VK`; action E8 Gizi, E6 Ambulans, E9 IBS, F38 Surat Keterangan Lahir, dan D3 Data Sosial baru tersedia setelah pasien diterima dan berstatus `IN_PROGRESS`.
5. Pada tab Sedang Dilayani, user menjalankan **Pulangkan Pasien** sebagai aksi penyelesaian layanan VK. Sistem mencatat `COMPLETED`, `completed_at`, user, serta catatan bila ada, lalu memindahkan item ke tab **Sudah Dilayani**.
6. Tab Sudah Dilayani menampilkan status **Selesai** tanpa status **Menunggu Dipulangkan** dan tanpa aksi pemulangan lanjutan. Proses discharge administratif, bila diperlukan oleh alur rumah sakit, berada di luar aksi Dashboard VK.

## 3. Goals & Metrics

| No | Metrik | Success Criteria |
|---|---|---|
| 1 | Visibilitas order | 100% order E7 aktif yang berhasil disimpan muncul tepat pada satu tab aktif Dashboard VK dalam ≤ 3 detik. |
| 2 | Ketepatan state | 0% item aktif tampil sekaligus pada Konfirmasi dan Sedang Dilayani; state/timestamp sinkron dengan audit trail. |
| 3 | Audit keputusan | 100% aksi Terima, Tolak, dan Pulangkan Pasien sebagai penyelesaian layanan memiliki actor, server timestamp, state lama/baru, serta alasan bila dipersyaratkan. |
| 4 | Keselamatan konteks aksi | 100% deep link action membawa `patient_id`, `encounter_id`, `vk_order_id`, dan `service_context=VK`; target menolak konteks tidak aktif/tidak berhak. |
| 5 | Kecepatan kerja | P95 pemuatan daftar/filter pada scope unit normal ≤ 3 detik [ASUMSI; perlu baseline]. |
| 6 | Tanpa penghapusan jejak | 0% order/worklist dihapus fisik melalui aksi Tolak atau selesai pelayanan. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — MVP | Phase 2 — Approval/Escalation | Phase 3 — Mapping COA |
|---|---|---|---|
| Tiga tab worklist | Konfirmasi Permintaan, Sedang Dilayani, Sudah Dilayani dengan kolom wajib, pencarian, filter, sort, pagination, loading/empty/error. | Saved filter, SLA/breach alert, kapasitas/queue, notifikasi eskalasi. | N/A — dashboard tidak membuat transaksi keuangan. |
| Penerimaan order | Terima dan Tolak dengan alasan wajib saat Tolak, idempotensi, row lock/versioning, audit. | Approval berjenjang atau eskalasi bila waktu respons terlampaui; `status_approval` dan `role_approver`. | N/A. |
| Pelayanan aktif | State `IN_PROGRESS`, detail drawer, action launcher lintas-modul, timeline audit read-only. | Checklist kesiapan persalinan, kolaborasi role dan notification. | Dashboard hanya meneruskan referensi tindakan/charge ke E1/Billing; `coa_id`, `akun_debit`, `akun_kredit` tidak dipopulasi di E7a. |
| Penyelesaian pelayanan | Aksi **Pulangkan Pasien** pada Sedang Dilayani mengubah `IN_PROGRESS` menjadi `COMPLETED`/**Selesai** dan memindahkan item ke Sudah Dilayani; tidak ada aksi lanjutan pada tab tersebut. | Re-open/correction berjenjang dan review supervisor. | N/A. |
| Biaya administrasi dan charge | E7a meneruskan referensi biaya administrasi VK dan charge layanan ke Billing — Tagihan Pasien (G2); E7a tidak menghitung nominal final. | Rekonsiliasi, klaim, refund, dan mapping COA lanjutan. | Billing/G2 menjadi source of truth transaksi. |

### Out of Scope Phase 1

- Membuat atau mengubah isi asesmen, tindakan, BHP, resep, CPO, order penunjang, order gizi, ambulans, IBS, dokumen, data sosial, atau surat lahir; E7a hanya membuka modul pemiliknya.
- Pengelolaan stok, dispensing farmasi, hasil penunjang, kalkulasi nominal billing, klaim, jurnal, dan mapping COA. E7a tetap mengirim referensi charge ke Billing G2.
- Penentuan ruang/bed VK, penjadwalan tenaga, kapasitas, SLA otomatis, notifikasi eksternal, dan approval berjenjang.
- Penghapusan fisik order/worklist atau pengubahan riwayat audit.
- Eksekusi detail discharge administratif, bila diperlukan, tetap menjadi milik E13 dan bukan aksi pada Dashboard VK.
- Transfer internal/E11 dan perubahan unit aktif Rawat Inap secara langsung oleh E7a.

## 5. Business Process & User Stories

### State Machine

| Status | Tab | Deskripsi | Efek Data | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|---|
| `ORDER_CREATED` | Konfirmasi Permintaan | Order E7 aktif menunggu keputusan VK. | `ordered_at`, unit asal, DPJP dan snapshot konteks tersimpan. | E7 → `ORDER_CREATED`; Terima → event `RECEIVED` lalu langsung `IN_PROGRESS`; Tolak → `REJECTED`. | Eskalasi bila melewati SLA. |
| `RECEIVED` | Tidak menjadi tab/status UI terpisah | Event penerimaan transien sebagai bukti bahwa user menerima order. | `received_at`, `received_by`, audit event terisi. | Setelah event tersimpan, item langsung berstatus `IN_PROGRESS` dan pindah ke Sedang Dilayani. | Dapat dikembangkan menjadi approval/triase hanya bila kebijakan berubah. |
| `IN_PROGRESS` | Sedang Dilayani | Pasien sudah diterima dan sedang dalam tanggung jawab operasional VK. | Action launcher lintas-modul tersedia sesuai RBAC/prasyarat. | Pulangkan Pasien sebagai penyelesaian layanan → `COMPLETED`. | Pause/transfer/escalation [PERLU KONFIRMASI]. |
| `COMPLETED` | Sudah Dilayani | Pelayanan VK telah selesai dan ditampilkan sebagai **Selesai**. | `completed_at`, `completed_by`, completion note/audit terisi. | Terminal E7a; tidak ada aksi pemulangan pada tab ini. | Re-open/correction dengan approval VK. |
| `DISCHARGED` | Tidak tampil pada tiga tab aktif | Status eksternal/legacy bila discharge administratif dicatat oleh modul lain. | Dikelola modul discharge terkait, bukan command E7a. | Bukan transisi UI E7a. | Mengikuti owner discharge. |
| `REJECTED` | Tidak ada tab khusus | Order ditolak oleh VK. | `rejected_at`, `rejected_by`, `rejection_reason` wajib. | Terminal; gunakan status/filter dan audit bila perlu. | Re-review/escalation bila kebijakan ditambahkan. |
| `CANCELED` | Tidak ada tab khusus | Order dibatalkan oleh owner proses terkait. | Audit pembatalan dipertahankan. | Bukan aksi normal E7a; cukup direpresentasikan sebagai status. | Aturan pembatalan lintas-unit [PERLU KONFIRMASI]. |

**BR-E7A-01 — Keanggotaan tab eksklusif:** `ORDER_CREATED` hanya di Konfirmasi, `IN_PROGRESS` hanya di Sedang Dilayani, dan `COMPLETED` hanya di Sudah Dilayani sebagai status **Selesai**. `RECEIVED` hanya event audit transien, bukan tab/status UI yang terpisah. `DISCHARGED`, `REJECTED`, dan `CANCELED` tidak memiliki tab khusus; status tetap tersimpan untuk filter/detail/audit sesuai hak akses.

### User Stories

- **US-E7A-01:** Sebagai petugas VK, saya ingin melihat order E7 yang menunggu agar dapat cepat menerima atau menolak pasien. *(BPMN: menerima rujukan/order VK)*
- **US-E7A-02:** Sebagai petugas VK, saya ingin memberi alasan saat menolak agar unit asal dan auditor dapat menelusuri keputusan. *(BPMN gateway: `tolak`)*
- **US-E7A-03:** Sebagai dokter/perawat VK, saya ingin membuka EMR dan seluruh aksi pelayanan dari baris pasien yang sama agar tidak salah konteks. *(BPMN: Input EMR, Input tindakan, Order penunjang, Order Operasi)*
- **US-E7A-04:** Sebagai petugas berwenang, saya ingin menekan **Pulangkan Pasien** pada tab Sedang Dilayani sebagai penyelesaian layanan VK agar pasien berpindah ke tab Sudah Dilayani dengan status **Selesai**.
- **US-E7A-05:** Sebagai petugas VK, saya ingin tab Sudah Dilayani hanya menampilkan pasien yang sudah selesai tanpa status Menunggu Dipulangkan atau aksi pemulangan lanjutan.
- **US-E7A-06:** Sebagai auditor/supervisor, saya ingin melihat riwayat state yang tidak dapat diubah agar keputusan layanan dan discharge dapat ditelusuri.

## 6. Functional & UI/UX Requirements

### 6.1 UI/UX dan General Flow

1. User membuka menu **VK > Dashboard VK**; server menerapkan RBAC dan scope unit sebelum mengembalikan data.
2. Header memuat pencarian Nama Pasien/No. RM/No. Order, filter rentang waktu, Unit Asal, DPJP, status relevan, tombol Reset, serta `data_as_of`. Pada Tab Sudah Dilayani, filter waktu menggunakan `completed_at`, default **harian untuk tanggal berjalan** dari `00:00:00` sampai `23:59:59` timezone **Asia/Jakarta**, dan user dapat mengubah rentang tanggal serta memfilter berdasarkan dokter DPJP.
3. Tiga tab menampilkan count hasil scope: **Konfirmasi Permintaan**, **Sedang Dilayani**, **Sudah Dilayani**.
4. Semua tabel memiliki kolom **Unit Dirawat**. **Tanggal Selesai** tidak ditampilkan pada Tab Konfirmasi Permintaan dan Tab Sedang Dilayani; hanya Tab Sudah Dilayani yang menampilkannya. Detail field per tab berada pada Section 7.1.
5. Banner informasi menyatakan bahwa setiap pasien VK dikenakan **Biaya Administrasi VK**. Tarif dibaca dari **Modul Pengaturan → Tarif Pendaftaran**. Referensi charge layanan dan biaya administrasi diteruskan ke Billing G2.
5. Klik baris membuka detail drawer read-only: identitas/context order, state, timestamps, user, alasan penolakan/penyelesaian bila ada, dan timeline audit. Aksi berada di drawer/row menu sesuai tab dan RBAC.
6. UI menangani skeleton/loading, daftar kosong yang menjelaskan filter aktif, error dengan retry, pagination server-side, sort yang diizinkan, dan refresh tanpa menghilangkan filter.

### 6.2 Feature Requirements & Acceptance Criteria

#### FR-E7A-01 — Worklist dan Tab
**User Story:** US-E7A-01. **Prioritas:** P0. **Fase:** Phase 1.

- **AC 1:** Sistem hanya mengembalikan item E7 aktif yang berada pada scope organisasi/unit user di server.
- **AC 2:** `ORDER_CREATED` muncul hanya pada Konfirmasi Permintaan; `IN_PROGRESS` hanya pada Sedang Dilayani; `COMPLETED` hanya pada Sudah Dilayani.
- **AC 3:** Ketiga tab menampilkan **Unit Dirawat** sesuai Section 7.1.1–7.1.3; setiap kolom memiliki field dan sumber data yang terdokumentasi. **Tanggal Selesai** hanya ada pada Tab Sudah Dilayani.
- **AC 4:** Pencarian Name/No. RM/No. Order, filter, sort, dan pagination diterapkan di server serta tidak mengubah state pasien.
- **AC 5:** `Unit Dirawat` mengambil tujuan bangsal dari SPRI yang berasal dari Unit Asal; bila SPRI tidak ada atau tujuan bangsal kosong, sistem menampilkan `-`.
- **AC 6:** Saat halaman pertama kali dibuka, filter waktu otomatis menggunakan tanggal berjalan dalam timezone Asia/Jakarta. Pada Tab Sudah Dilayani basis waktunya `completed_at`, dan tombol Reset mengembalikan filter harian serta dokter ke default.

#### FR-E7A-02 — Terima dan Tolak Permintaan
**User Story:** US-E7A-01, US-E7A-02. **Prioritas:** P0. **Fase:** Phase 1. **Trace BPMN:** `terima` / `tolak`.

- **AC 1:** Hanya item `ORDER_CREATED` yang menampilkan aksi Terima dan Tolak kepada role berwenang.
- **AC 2:** Terima meminta konfirmasi sebagai **satu aksi UI**, menulis event `RECEIVED`, lalu langsung mengubah item yang sama menjadi `IN_PROGRESS` dalam satu transaksi/idempotent command; `received_at`, `received_by`, `updated_at`, dan audit tercatat. Tidak ada langkah/klik UI terpisah untuk RECEIVED dan IN_PROGRESS.
- **AC 3:** Tolak membuka dialog dengan `rejection_reason` wajib; submit kosong ditolak di frontend dan server.
- **AC 4:** Tolak mengubah state ke `REJECTED`, mencatat actor/timestamp/alasan, dan tidak menghapus row/order fisik.
- **AC 5:** Dua request bersamaan atau retry dengan idempotency key yang sama tidak boleh menghasilkan transisi ganda; stale version mendapat respons konflik yang aman.

#### FR-E7A-03 — Aksi Pelayanan dari Konteks Pasien
**User Story:** US-E7A-03. **Prioritas:** P0. **Fase:** Phase 1.

- **AC 1:** Setelah Terima berhasil dan item berstatus `IN_PROGRESS` pada tab Sedang Dilayani, action menu dapat membuka: D8 Asesmen EMR RI/IBS/VK (muat/edit), E8 Order Makanan Gizi, E1 Input Tindakan dan BHP, E2 e-Resep, E12 CPO, E3 Lab, E4 Radiologi, E22 Patologi Anatomi, F38 Surat Keterangan Lahir, D3 Data Sosial, E6 Ambulans, E9 Order Operasi, dan D10 Dokumen Pendukung.
- **AC 1a:** Action E8 Gizi, E6 Ambulans, E9 IBS, F38 Surat Keterangan Lahir, dan D3 Data Sosial tidak tersedia pada Konfirmasi Permintaan (`ORDER_CREATED`) maupun Sudah Dilayani (`COMPLETED`); action tersebut hanya tersedia pada `IN_PROGRESS` setelah pasien diterima.
- **AC 2:** Setiap deep link membawa `patient_id`, `encounter_id`, `vk_order_id`, dan `service_context=VK`; parameter hanya sebagai konteks dan target memvalidasi ulang hak akses serta kunjungan aktif.
- **AC 3:** Aksi yang tidak diizinkan role, tidak relevan state, atau tidak tersedia pada konfigurasi RS disembunyikan/disabled dengan alasan yang dapat dipahami; server target tetap menjadi guard terakhir.
- **AC 4:** E2 dan E12 ditampilkan sebagai pilihan berbeda: E2 membuat/mengelola e-Resep, E12 membuat/mengelola order CPO; Dashboard VK tidak menyinkronkan atau menduplikasi order obat tersebut.
- **AC 5:** Return dari modul target tidak boleh mengubah state worklist tanpa command Dashboard VK yang eksplisit dan teraudit.

#### FR-E7A-04 — Pulangkan Pasien sebagai Penyelesaian Layanan VK
**User Story:** US-E7A-04. **Prioritas:** P0. **Fase:** Phase 1.

- **AC 1:** Aksi **Pulangkan Pasien** tersedia pada `IN_PROGRESS` di tab Sedang Dilayani untuk role berwenang.
- **AC 2:** Konfirmasi sukses mencatat `COMPLETED`, `completed_at` dari server, `completed_by`, completion note, audit event, dan memindahkan row ke tab Sudah Dilayani.
- **AC 3:** Pada tab Sudah Dilayani, status ditampilkan sebagai **Selesai**. Tidak ada status Menunggu Dipulangkan dan tidak ada action untuk memulangkan pasien.
- **AC 4:** Action launcher klinis tidak lagi tersedia setelah `COMPLETED`; request ulang bersifat idempotent dan tidak mengubah `completed_at` pertama.
- **AC 5:** Aksi ini menyelesaikan worklist layanan VK dan tidak memanggil E11 maupun E13 dari Dashboard VK.

#### FR-E7A-05 — Biaya Administrasi dan Charge Billing VK
**User Story:** US-E7A-05. **Prioritas:** P0. **Fase:** Phase 1.

- **AC 1:** Sistem menampilkan statement bahwa pasien VK dikenakan **Biaya Administrasi VK**.
- **AC 2:** Besaran biaya administrasi dibaca dari **Modul Pengaturan → Tarif Pendaftaran** dan diteruskan ke Billing G2 satu kali per episode/order VK aktif.
- **AC 3:** Charge layanan VK dari aksi D8, E8, E1, E2, E12, E3, E4, E22, F38, D3, E6, E9, dan D10 diteruskan ke **Billing → Tagihan Pasien (G2)** dengan `patient_id`, `encounter_id`, `vk_order_id`, `service_context=VK`, sumber aksi, dan referensi tarif.
- **AC 4:** Nominal tindakan mengacu pada **A10 Master Data Tarif Tindakan**, nominal obat mengacu pada **A59 Pengaturan Harga Obat**, dan biaya administrasi mengacu pada **Tarif Pendaftaran**.
- **AC 5:** E7a tidak menghitung ulang atau mengubah nominal final; Billing G2 menjadi source of truth charge, idempotency, pembatalan, dan audit finansial.

#### FR-E7A-06 — Audit, RBAC, dan Read-only History
**User Story:** US-E7A-06. **Prioritas:** P0. **Fase:** Phase 1.

- **AC 1:** Setiap state transition menyimpan state lama/baru, actor, server timestamp, correlation/idempotency key, dan alasan/catatan bila tersedia.
- **AC 2:** Timeline audit tidak dapat diedit atau dihapus dari Dashboard VK.
- **AC 3:** RBAC dan row-level scope divalidasi pada API list/detail/transition, bukan hanya dengan menyembunyikan tombol UI.
- **AC 4:** Role matrix untuk lihat, terima, tolak, pulangkan, dan masing-masing action launcher ditetapkan konfigurasi RS [PERLU KONFIRMASI].

## 7. Data & Business Rules

### 7.1 Data Requirement

| Field | Label | Tipe | Wajib | Sumber Data/Logika | Validasi | Keterangan |
|---|---|---|---|---|---|---|
| `vk_worklist_id` | ID Worklist VK | UUID | Ya | Dibuat saat handoff E7/worklist | Unik | Identitas record worklist. |
| `vk_order_id` | No. Order VK | UUID | Ya | E7 Order Tindakan VK | Unik untuk order aktif | Satu item aktif per order VK aktif. |
| `encounter_id` | ID Kunjungan | UUID | Ya | Kunjungan aktif E7 | FK valid | Konteks semua action launcher. |
| `patient_id` | ID Pasien | UUID | Ya | Master pasien/E7 | FK valid | Bukan pengganti No. RM. |
| `patient_name_snapshot` | Nama Pasien | VARCHAR(200) | Ya | Snapshot E7/master pasien | Tidak kosong | Nama Pasien pada tabel; perubahan identitas mengikuti kebijakan master [PERLU KONFIRMASI]. |
| `medical_record_no_snapshot` | No. RM | VARCHAR(50) | Ya | Master pasien | Tidak kosong | No. RM pada tabel. |
| `registration_at` | Tanggal Daftar | TIMESTAMPTZ | Ya | Modul Pendaftaran/encounter | Read-only | Ditampilkan sebagai Tanggal Daftar. |
| `ordered_at` | Tanggal Order VK | TIMESTAMPTZ | Ya | E7 server timestamp | Read-only | Ditampilkan sebagai Tanggal Order VK. |
| `completed_at` | Tanggal Selesai Dilayani | TIMESTAMPTZ | Tidak | Aksi Pulangkan Pasien sebagai penyelesaian layanan | Hanya `COMPLETED` | Ditampilkan sebagai Tanggal Selesai pada Tab Sudah Dilayani. |
| `source_unit_id`, `source_unit_name_snapshot` | Unit Asal | UUID, VARCHAR(150) | Ya | E7 | FK/snapshot | Unit Asal pengorder. |
| `spri_id` | ID SPRI | UUID | Tidak | Unit Asal / Modul SPRI | FK valid bila tersedia | Referensi Surat Perintah Rawat Inap yang menentukan tujuan bangsal. |
| `ward_destination_id`, `ward_destination_name_snapshot` | Unit Dirawat | UUID, VARCHAR(150) | Ya | SPRI dari Unit Asal | Jika tidak ada SPRI/tujuan, tampilkan `-` | Tujuan bangsal pasien bila akan dirawat-inapkan setelah layanan VK. Read-only pada semua tab. |
| `dpjp_id`, `dpjp_name_snapshot` | Nama Dokter DPJP | UUID, VARCHAR(200) | Ya | E7/Master Praktisi | Praktisi aktif saat order | Nama Dokter DPJP pada tabel. |
| `service_status` | Status Pelayanan VK | ENUM | Ya | State machine | Enum yang diizinkan | `ORDER_CREATED`, `IN_PROGRESS`, `COMPLETED`, `DISCHARGED`, `REJECTED`, `CANCELED`; `RECEIVED` dicatat sebagai event, bukan status UI aktif. |
| `received_at`, `received_by` | Waktu/User Penerima | TIMESTAMPTZ, UUID | Kondisional | Aksi Terima | Wajib setelah terima | Bukti event penerimaan sebelum langsung `IN_PROGRESS`. |
| `rejected_at`, `rejected_by`, `rejection_reason` | Waktu/User/Alasan Penolakan | TIMESTAMPTZ, UUID, TEXT | Kondisional | Aksi Tolak | Alasan wajib bila `REJECTED` | Tidak boleh hard delete. |
| `completed_by`, `completion_note` | User/Catatan Selesai Dilayani | UUID, TEXT | Kondisional | Aksi Pulangkan Pasien | `completed_by` wajib saat `COMPLETED` | Catatan penyelesaian pelayanan VK. |
| `e13_discharge_id` | ID Discharge E13 | UUID | Kondisional | E13 Discharge Pasien | Wajib saat E13 sukses | Referensi discharge sebagai source of truth E13. |
| `discharged_at`, `discharged_by` | Waktu/User Discharge | TIMESTAMPTZ, UUID | Kondisional | Callback/event E13 | Wajib saat `DISCHARGED` | Timestamp dan actor hasil discharge E13. |
| `status_approval`, `role_approver` | Status/Role Approver | VARCHAR(20), VARCHAR(50) | Ya | Default `NOT_REQUIRED` | Reserved Phase 2 | Siap approval/escalation, belum menghambat Phase 1. |
| `coa_id`, `akun_debit`, `akun_kredit` | Referensi COA | UUID, VARCHAR(50), VARCHAR(50) | Tidak | Referensi downstream | Tidak dipopulasi E7a | [Phase 3] Milik domain tindakan/billing bila relevan. |
| `admin_fee_tariff_id`, `admin_fee_amount` | Biaya Administrasi VK | UUID, DECIMAL | Kondisional | Pengaturan → Tarif Pendaftaran | Tarif aktif; nominal tidak boleh negatif | Charge administrasi VK yang dikirim ke Billing G2. |
| `billing_charge_status`, `billing_reference_id` | Status/Referensi Charge Billing | ENUM, UUID | Kondisional | Billing G2 | Idempotent per order/aksi | Menyimpan status pengiriman dan referensi Tagihan Pasien. |
| `version` | Versi Data | BIGINT | Ya | Sistem | Optimistic lock | Mencegah lost update transition. |
| `created_at`, `updated_at` | Metadata Waktu | TIMESTAMPTZ | Ya | Server | Read-only | Ditampilkan dalam timezone Asia/Jakarta. |

### 7.1.1 Data Requirement — Tab Konfirmasi Permintaan

Tab ini hanya menampilkan worklist dengan status `ORDER_CREATED`. `RECEIVED` tidak ditampilkan sebagai status/tab karena hanya event audit saat user menekan Terima.

| Kolom Tampilan | Keterangan | Field / Derived Data | Sumber Data | Aturan Tampil / Aksi |
|---|---|---|---|---|
| No. Order VK | No. Order VK | `vk_order_id` / `order_number` | E7 Order Tindakan VK | Read-only; identitas order unik. |
| Nama Pasien | Nama Pasien | `patient_name_snapshot` | E7 + Master Data Pasien | Read-only; gunakan snapshot order. |
| Tanggal Daftar | Tanggal Daftar | `registration_at` | Modul Pendaftaran / encounter aktif | Format tanggal dan waktu Asia/Jakarta. |
| No. RM | No. RM | `medical_record_no_snapshot` | Master Data Pasien / E7 | Read-only; dapat digunakan untuk pencarian. |
| Tanggal Order VK | Tanggal Order VK | `ordered_at` | E7 server timestamp | Format tanggal dan waktu Asia/Jakarta. |
| Unit Asal | Unit Asal | `source_unit_name_snapshot` | E7 / modul asal IGD, Poli RJ, atau Ranap | Read-only; tampilkan unit saat order dibuat. |
| Unit Dirawat | Tujuan Bangsal | `ward_destination_name_snapshot` | SPRI dari Unit Asal | Tampilkan nama bangsal tujuan; jika `spri_id`/tujuan tidak tersedia, tampilkan `-`. |
| Nama Dokter DPJP | Nama Dokter DPJP | `dpjp_name_snapshot` | E7 + Master Data Praktisi | Read-only; snapshot DPJP saat order. |
| Status | Status Pelayanan VK | `service_status = ORDER_CREATED` | State machine E7a | Badge **Konfirmasi Permintaan** / **Menunggu Dikonfirmasi**. |
| Waktu Menunggu | Durasi menunggu | `now - ordered_at` | Kalkulasi E7a dari server timestamp | Diperbarui saat refresh; timezone Asia/Jakarta. |
| Aksi | Aksi Konfirmasi | `accept`, `reject` | RBAC + state machine E7a | Role berwenang dapat memilih **Terima** atau **Tolak**. Tolak wajib alasan. |

### 7.1.2 Data Requirement — Tab Sedang Dilayani

Tab ini hanya menampilkan pasien yang telah diterima dan langsung berstatus `IN_PROGRESS`. Seluruh action launcher klinis/administratif pada Phase 1 hanya boleh digunakan dari tab ini.

| Kolom Tampilan | Keterangan | Field / Derived Data | Sumber Data | Aturan Tampil / Aksi |
|---|---|---|---|---|
| No. Order VK | No. Order VK | `vk_order_id` / `order_number` | E7 Order Tindakan VK | Read-only; identitas order unik. |
| Nama Pasien | Nama Pasien | `patient_name_snapshot` | E7 + Master Data Pasien | Read-only; gunakan snapshot order. |
| Tanggal Daftar | Tanggal Daftar | `registration_at` | Modul Pendaftaran / encounter aktif | Format tanggal dan waktu Asia/Jakarta. |
| No. RM | No. RM | `medical_record_no_snapshot` | Master Data Pasien / E7 | Read-only; dapat digunakan untuk pencarian. |
| Tanggal Order VK | Tanggal Order VK | `ordered_at` | E7 server timestamp | Format tanggal dan waktu Asia/Jakarta. |
| Unit Asal | Unit Asal | `source_unit_name_snapshot` | E7 / modul asal IGD, Poli RJ, atau Ranap | Read-only. |
| Unit Dirawat | Tujuan Bangsal | `ward_destination_name_snapshot` | SPRI dari Unit Asal | Tampilkan nama bangsal tujuan; jika `spri_id`/tujuan tidak tersedia, tampilkan `-`. |
| Nama Dokter DPJP | Nama Dokter DPJP | `dpjp_name_snapshot` | E7 + Master Data Praktisi | Read-only. |
| Status | Status Pelayanan VK | `service_status = IN_PROGRESS` | State machine E7a | Badge **Sedang Dilayani**. |
| Waktu Mulai Dilayani | Waktu Mulai Dilayani | `received_at` | Event Terima E7a | Waktu mulai operasional setelah pasien diterima; tampil Asia/Jakarta. |
| Durasi Pelayanan | Durasi berjalan | `now - received_at` | Kalkulasi E7a | Diperbarui saat refresh; bukan nilai yang diinput user. |
| Aksi Pelayanan | Action Launcher | `patient_id`, `encounter_id`, `vk_order_id`, `service_context=VK` | RBAC + konfigurasi target | Tersedia hanya pada `IN_PROGRESS`: D8, E8, E1, E2, E12, E3, E4, E22, F38, D3, E6, E9, dan D10. |
| Aksi Pulangkan Pasien | Penyelesaian Layanan VK | `complete_service` | RBAC + state machine E7a | Mengubah `IN_PROGRESS` menjadi `COMPLETED`/**Selesai** dan memindahkan item ke Sudah Dilayani. Tidak memanggil E11/E13. |

### 7.1.3 Data Requirement — Tab Sudah Dilayani

Tab ini hanya menampilkan pasien dengan status `COMPLETED`, yang ditampilkan sebagai **Selesai**. Tidak ada status **Menunggu Dipulangkan** dan tidak ada aksi pemulangan pada tab ini.

| Kolom Tampilan | Keterangan | Field / Derived Data | Sumber Data | Aturan Tampil / Aksi |
|---|---|---|---|---|
| No. Order VK | No. Order VK | `vk_order_id` / `order_number` | E7 Order Tindakan VK | Read-only; identitas order unik. |
| Nama Pasien | Nama Pasien | `patient_name_snapshot` | E7 + Master Data Pasien | Read-only; gunakan snapshot order. |
| Tanggal Daftar | Tanggal Daftar | `registration_at` | Modul Pendaftaran / encounter aktif | Format tanggal dan waktu Asia/Jakarta. |
| No. RM | No. RM | `medical_record_no_snapshot` | Master Data Pasien / E7 | Read-only; dapat digunakan untuk pencarian. |
| Tanggal Order VK | Tanggal Order VK | `ordered_at` | E7 server timestamp | Format tanggal dan waktu Asia/Jakarta. |
| Tanggal Selesai | Tanggal Selesai Dilayani | `completed_at` | Aksi Pulangkan Pasien sebagai penyelesaian layanan | Wajib; format tanggal dan waktu Asia/Jakarta. |
| Unit Asal | Unit Asal | `source_unit_name_snapshot` | E7 / modul asal IGD, Poli RJ, atau Ranap | Read-only. |
| Unit Dirawat | Tujuan Bangsal | `ward_destination_name_snapshot` | SPRI dari Unit Asal | Tampilkan nama bangsal tujuan; jika `spri_id`/tujuan tidak tersedia, tampilkan `-`. |
| Nama Dokter DPJP | Nama Dokter DPJP | `dpjp_name_snapshot` | E7 + Master Data Praktisi | Read-only. |
| Status | Status Pelayanan VK | `service_status = COMPLETED` | State machine E7a | Badge **Selesai**. |
| Durasi Pelayanan | Durasi Pelayanan | `completed_at - received_at` | Kalkulasi E7a | Durasi final dari penerimaan sampai selesai dilayani. |
| Aksi | Tidak ada | `null` | State machine E7a | Tidak ada aksi pemulangan lanjutan. |

**Aturan bersama seluruh tab:** Tab Konfirmasi dan Sedang Dilayani menggunakan waktu order/aktivasi sesuai kebutuhan operasional. Tab Sudah Dilayani menggunakan `completed_at` sebagai basis filter **Waktu**, default tanggal berjalan `00:00:00–23:59:59` Asia/Jakarta, dan menyediakan filter **Nama Dokter DPJP**. User dapat mengatur rentang tanggal. Pencarian menggunakan Nama Pasien, No. RM, dan No. Order VK; `REJECTED`, `CANCELED`, dan `DISCHARGED` tidak memiliki tab operasional khusus.

### 7.2 Audit Event Minimum

| Field | Tipe | Keterangan |
|---|---|---|
| `audit_id` | UUID | Identitas event. |
| `vk_worklist_id` | UUID | Relasi ke worklist. |
| `event_type` | ENUM | `CREATED`, `RECEIVED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED`, `DISCHARGE_REQUESTED`, `DISCHARGED`, `ACTION_OPENED` [PERLU KONFIRMASI untuk logging launcher]. |
| `from_status`, `to_status` | ENUM | State sebelum/sesudah event. |
| `actor_id`, `actor_role`, `occurred_at` | UUID, VARCHAR, TIMESTAMPTZ | Pelaku dan waktu server. |
| `reason`, `metadata_json` | TEXT, JSONB | Alasan keputusan dan metadata non-klinis yang aman. |
| `idempotency_key`, `correlation_id` | VARCHAR | Deduplikasi dan trace lintas layanan. |

### 7.3 Business Rules

- **BR-E7A-01:** Keanggotaan tab mengikuti state machine secara eksklusif; filter tidak boleh mengubah state.
- **BR-E7A-02:** Hanya E7/order producer yang boleh membuat state awal `ORDER_CREATED`; E7a tidak membuat order VK baru.
- **BR-E7A-03:** Terima/Tolak/Pulangkan Pasien dijalankan dengan validasi state terkini, scope, RBAC, version, dan idempotency key. Terima menyimpan event `RECEIVED` dan langsung mengaktifkan `IN_PROGRESS` dalam satu transaksi.
- **BR-E7A-04:** Penolakan wajib menyimpan alasan; reject/cancel/completed adalah soft-status dengan audit, bukan `DELETE`. Pernyataan BPMN “menghapus order pelayanan VK” ditafsirkan sebagai penutupan status yang teraudit sampai kebijakan owner menegaskan lain.
- **BR-E7A-05:** Satu `vk_order_id` aktif hanya mempunyai satu worklist item aktif. Unique constraint dan transaksi producer/consumer mencegah duplikasi.
- **BR-E7A-06:** Semua action launcher hanya meneruskan konteks; modul tujuan adalah source of truth atas data klinis, validasi, persetujuan, stok, billing, dan audit detailnya.
- **BR-E7A-07:** Aksi **Pulangkan Pasien** pada Sedang Dilayani menyelesaikan **pelayanan worklist VK** dengan transisi `IN_PROGRESS → COMPLETED`, lalu menampilkan status **Selesai** di Sudah Dilayani. E7a tidak memanggil E11/E13 melalui aksi ini dan tidak mengubah active unit Rawat Inap secara langsung.
- **BR-E7A-08:** Snapshot Nama/No. RM/Unit Asal/Unit Dirawat/DPJP menjaga keterbacaan riwayat. Unit Dirawat berasal dari tujuan SPRI Unit Asal; tanpa SPRI/tujuan nilainya `-`.
- **BR-E7A-09:** Data pasien hanya dapat terlihat pada scope unit/role yang berwenang; daftar, detail, export masa depan, dan deep link harus menerapkan RBAC server-side.
- **BR-E7A-10:** Action E8 Gizi, E6 Ambulans, E9 IBS, F38 Surat Keterangan Lahir, dan D3 Data Sosial hanya tersedia saat pasien berstatus `IN_PROGRESS` di tab Sedang Dilayani, setelah event penerimaan berhasil.
- **BR-E7A-11:** Default filter pada Tab Sudah Dilayani adalah harian berdasarkan `completed_at` untuk tanggal berjalan `00:00:00–23:59:59` Asia/Jakarta. User dapat mengubah rentang tanggal dan filter Nama Dokter DPJP tanpa mengubah state worklist.
- **BR-E7A-12:** `REJECTED` dan `CANCELED` tidak memiliki tab atau history operasional khusus; keduanya cukup direpresentasikan sebagai status dan audit event pada detail/filter yang berwenang.
- **BR-E7A-13:** Setiap pasien VK yang masuk layanan dikenakan Biaya Administrasi VK satu kali per episode/order aktif. Tarif diambil dari Pengaturan → Tarif Pendaftaran dan charge dikirim ke Billing G2 secara idempotent.
- **BR-E7A-14:** Charge layanan dari D8, E8, E1, E2, E12, E3, E4, E22, F38, D3, E6, E9, dan D10 masuk ke Billing → Tagihan Pasien (G2). Referensi nominal tindakan menggunakan A10, nominal obat menggunakan A59, dan biaya administrasi menggunakan Tarif Pendaftaran.
- **BR-E7A-15:** E7a hanya meneruskan referensi sumber charge dan konteks pasien/encounter/order; Billing G2 menjadi source of truth untuk nominal, status charge, idempotency, reversal, dan audit finansial.

## 8. Workflow / BPMN Interpretation

Interpretasi ini berlandaskan `bpmn/g-support-vk.json` pada container **F36 F37 F38 F39 - VK** dan dilengkapi kontrak E7.

1. Dari IGD, Poli Kebidanan/Obgyn, atau Rawat Inap, E7 menyimpan Order Tindakan VK dan mengirim handoff yang menjadi `ORDER_CREATED`.
2. Saat user membuka **Buka menu unit VK**, Dashboard VK memuat daftar Konfirmasi Permintaan sesuai scope petugas. *(Trace: `menerima rujukan/order VK dari IGD/VK/Rawat Inap`.)*
3. Petugas memilih item. Gateway BPMN diterjemahkan sebagai **Terima** atau **Tolak**. Terima adalah satu aksi: sistem mencatat event `RECEIVED` lalu langsung menempatkan pasien dengan status `IN_PROGRESS` di Sedang Dilayani; tidak ada langkah UI RECEIVED terpisah. Tolak meminta alasan dan menutup permintaan sebagai soft-status. *(Trace: garis `terima` dan `tolak`.)*
4. Untuk pasien Sedang Dilayani, user memilih aksi sesuai kebutuhan: **Input EMR** melalui D8, **Input tindakan** melalui E1, Order Penunjang melalui E3/E4/E22, Order Operasi melalui E9, serta action launcher lain yang tercantum pada FR-E7A-03. Charge dari aksi tersebut diteruskan ke Billing G2.
5. Setelah layanan selesai, user menjalankan **Pulangkan Pasien** pada tab Sedang Dilayani. Dalam E7a, aksi ini adalah penyelesaian layanan VK: Dashboard merekam `COMPLETED` dan timestamp, lalu memindahkan pasien ke Sudah Dilayani dengan status **Selesai**.
6. Tab Sudah Dilayani menggunakan filter Waktu berbasis `completed_at` dengan default harian dan filter Nama Dokter DPJP. Tidak ada aksi pemulangan lanjutan. Biaya administrasi VK dibuat berdasarkan Tarif Pendaftaran dan dikirim bersama referensi charge layanan ke Billing G2.
7. BPMN juga memuat teks `Sistem menghapus order pelayanan VK`; pada desain ini tidak diterapkan sebagai hapus fisik demi audit dan keselamatan. `REJECTED`/`CANCELED` cukup disimpan sebagai status dan audit event tanpa tab/history operasional khusus.

### Kontrak Integrasi Minimum

- **Inbound E7 → E7a:** `vk_order_id`, `encounter_id`, `patient_id`, nomor order, `ordered_at`, unit asal snapshot, `spri_id`, unit dirawat snapshot, DPJP snapshot, status awal, dan correlation/idempotency key.
- **E7a command:** `accept`, `reject`, `complete_service`, dan `publish_billing_reference`, semuanya memvalidasi status, version, scope, role, dan idempotency key di server. `accept` menyimpan event `RECEIVED` lalu langsung menetapkan `IN_PROGRESS`; `complete_service` dipicu oleh aksi UI **Pulangkan Pasien**.
- **Billing G2 event:** E7a mengirim referensi biaya administrasi VK dan charge layanan beserta `patient_id`, `encounter_id`, `vk_order_id`, `service_context`, `charge_source`, dan `tariff_reference`; Billing mengembalikan `billing_reference_id` dan status penerimaan secara idempotent.
- **Outbound action launcher:** konteks pasien/encounter/order VK, tanpa membuat copy data klinis.
- **Event/audit:** event state disimpan immutable dan tersedia untuk detail/history sesuai hak akses.

## Asumsi
- E7 tetap menjadi producer tunggal order VK dan telah menyediakan referensi encounter/pasien/DPJP/unit asal yang valid.
- Server menggunakan optimistic locking serta idempotency key untuk command state transition.
- D8 adalah entry point asesmen VK sesuai keputusan stakeholder; F40 tidak dipakai karena master saat ini menunjuk asesmen MCU.
- Dashboard VK tidak menghitung nominal charge, stok, klaim, jurnal, atau mapping COA secara langsung; Dashboard mengirim referensi charge dan biaya administrasi ke Billing G2.
- Semua waktu disimpan sebagai TIMESTAMPTZ server dan ditampilkan dalam timezone **Asia/Jakarta**.
- Filter Tab Sudah Dilayani default menggunakan tanggal berjalan, pukul `00:00:00–23:59:59` Asia/Jakarta, berdasarkan `completed_at`; filter dokter DPJP tersedia dan rentang waktu dapat diubah user.

## Pertanyaan Terbuka
- Role matrix final untuk lihat, Terima, Tolak, Pulangkan Pasien sebagai penyelesaian layanan, dan masing-masing action launcher per profesi/unit.
- Template/jenis asesmen VK mana pada D8 yang wajib dimuat atau dapat diedit.
- SLA penerimaan dan kebijakan retensi audit yang berlaku di RS.

## 9. Example Data, Flow & UI Preview

Contoh data bersama E7 dan E7a tersedia pada [`example-data.json`](example-data.json). Alur terintegrasi dan konteks antar-modul tersedia pada [`integrated-flow.md`](integrated-flow.md):

`E7 Order Tindakan VK` → `E7a Konfirmasi Permintaan` → `RECEIVED` event → `IN_PROGRESS / Sedang Dilayani` → aksi `Pulangkan Pasien` → `COMPLETED / Selesai / Sudah Dilayani`.

UI Preview interaktif Dashboard VK tersedia pada [`preview.html`](preview.html). Preview mendukung simulasi Terima, Tolak, filter Waktu/Dokter, action launcher E8/E6/E9/F38/D3, dan aksi Pulangkan Pasien sebagai penyelesaian layanan VK.

Preview entry point Order Tindakan VK tersedia pada [Preview E7](../E7__pelayanan-utama-order-tindakan-vk/preview.html).
