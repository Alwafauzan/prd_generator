# PRD Pondasi — Dashboard Laboratorium (N10)

> **Definisi internal:** “Dashboard” pada N10 berarti **operational worklist/list data**, bukan dashboard analitik berisi KPI/grafik.  
> **Status:** FOUNDATION DRAFT v0.2 — perilaku Phase 1 mengacu pada menu Laboratorium v1.

**Sumber:** `template.md`; `bahan_random/LabComponent.vue`; `bahan_random/SocialData.vue`; `bahan_random/LabConfirmation.vue`; `data/features-mvp.json` E3/F1/F2/F3; PRD Order/Pendaftaran Laboratorium; Master Item Pemeriksaan Lab; PRD Tindakan & BHP.  
**Versi:** 0.2 — V1 Operational Parity  
**Tanggal:** 2026-07-20

## 1. Metadata Dokumen

| Approval | Nama/Jabatan | Tanggal |
|---|---|---|
| Disiapkan | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa | [PERLU KONFIRMASI] Kepala Laboratorium | — |
| Disetujui | [PERLU KONFIRMASI] Manajemen RS | — |

| Versi | Tanggal | Perubahan |
|---|---|---|
| 0.1 Foundation | 2026-07-19 | Pondasi worklist order laboratorium dan lifecycle minimum. |
| 0.2 V1 Operational Parity | 2026-07-20 | Menetapkan tab, filter, tabel expandable, Data Sosial, Detail Permintaan/Konfirmasi, Tindakan & BHP, hasil, selesai, dan pembatalan mengikuti v1. |

**Referensi Implementasi v1**

| File | Perilaku yang Diadopsi |
|---|---|
| `LabComponent.vue` | Header tanggal, refresh, filter rentang tanggal, pencarian, empat tab status, tabel expandable, pagination, dan shortcut aksi per pasien. |
| `SocialData.vue` | View/edit Data Sosial pasien dari master pasien dengan validasi dan data wilayah bertingkat. |
| `LabConfirmation.vue` | Detail/konfirmasi permintaan: jadwal, CITO, diagnosis, catatan klinis, pemeriksaan/intervensi, lab rujukan, estimasi selesai, dan penyimpanan order. |

**Referensi read-only:** seluruh dokumen dalam `other_prd(prd_dari_google_drive)` hanya digunakan sebagai sumber dan tidak diubah.

## 2. Overview & Background

N10 adalah halaman awal operasional Laboratorium yang mengikuti pola v1: worklist bertab **Belum Diproses, Proses, Pending, dan Selesai**, filter tanggal, pencarian Nama/No. RM, refresh, tabel pasien expandable, dan shortcut ke Data Sosial, Hasil Laboratorium, Detail Permintaan, Tindakan & BHP, Selesai, atau Cancel Order sesuai status.

Sumber yang tersedia menetapkan lifecycle `Draft → Ordered → Terkonfirmasi → Sedang Diproses → Selesai` atau `Dibatalkan`; status setelah Ordered dipicu dari Dashboard Laboratorium. Fitur terkait mencakup konfirmasi order (F1), input hasil (F2), serta flag/notifikasi nilai kritis (F3).

**As-Is:** [ASUMSI] order dipantau pada daftar/modul terpisah, status dan hasil sulit dilihat dalam satu worklist.  
**To-Be:** pengalaman operasional dipertahankan semirip v1, dengan backend terstruktur, RBAC, optimistic locking, audit, dan pagination server-side.

## 3. Goals & Metrics

| No | Metrics | Target Pondasi |
|---|---|---|
| 1 | Visibilitas order | 100% order Ordered muncul satu kali di worklist. |
| 2 | Status aktual | 100% perubahan status berasal dari aksi bisnis dan diaudit. |
| 3 | Pencarian | List terfilter tampil p95 < 2 detik untuk 50 baris. [ASUMSI] |
| 4 | Nilai kritis | 100% hasil yang memenuhi rule kritis diberi flag; notifikasi final perlu konfirmasi. |
| 5 | Billing-ready | Charge memiliki provenance order/item dan idempotency key. |

## 4. Scope Definition & Phasing

| Fitur | Phase 1 Foundation | Phase 2 |
|---|---|---|
| Worklist | Empat tab v1, count per tab, search, multi-date filter, pagination, refresh, expandable row | KPI/grafik/SLA analytics |
| Data Sosial | Lihat/edit master pasien melalui modal Data Sosial | Integrasi verifikasi identitas lanjutan |
| Konfirmasi | Detail/edit permintaan, diagnosis, CITO, jadwal, pemeriksaan dan rujukan | Approval/escalation |
| Proses | Status processing dan input hasil dasar | Spesimen lengkap, analyzer/LIS |
| Hasil | Draft/final result, critical flag | Verifikasi berjenjang, amendment |
| Billing | Kontrak/provenance status pelayanan | Posting/void penuh setelah aturan disepakati |

**Out of Scope:** dashboard analitik, detail alur pengambilan/label/transport spesimen, integrasi analyzer/LIS, rule reference range lengkap, TTE, dan WA nilai kritis sampai kontrak/consent diputuskan.

## 5. Related Features

| Modul | Relasi |
|---|---|
| E3 Order Lab | Publisher order Ordered. |
| F1/F2/F3 | Capability yang diorkestrasi N10: konfirmasi, hasil, nilai kritis. |
| Master Item Lab | Nama item, specimen/reference/rule bila tersedia. |
| Tindakan & BHP | Input tindakan/BHP selama proses. |
| Billing G2 | Consumer charge berdasarkan trigger pelaksanaan yang disepakati. |
| EMR | Consumer hasil final. |

## 6. Business Process & User Stories

| Status | Deskripsi | Transisi Phase 1 |
|---|---|---|
| ORDERED/BELUM_DIPROSES | Order diterima dari hulu dan tampil di tab Belum Diproses | → IN_PROGRESS/PENDING/CANCELLED |
| CONFIRMED/IN_PROGRESS | Diterima/diproses lab dan tampil di tab Proses | → COMPLETED/PENDING/CANCELLED |
| PENDING | Jadwal pemeriksaan berada di masa depan/ditunda sesuai order | → IN_PROGRESS/CANCELLED |
| IN_PROGRESS | Aktivitas/input hasil dimulai | → COMPLETED/CANCELLED |
| COMPLETED | Hasil/pemeriksaan selesai | Terminal; koreksi via addendum [PERLU KONFIRMASI] |
| CANCELLED | Dibatalkan dengan alasan | Terminal |

- **US-N10-01:** Petugas melihat seluruh order pada satu worklist.
- **US-N10-02:** Petugas mencari/filter berdasarkan pasien, No. RM, unit, status, tanggal, prioritas.
- **US-N10-03:** Petugas membuka detail dan mengonfirmasi order.
- **US-N10-04:** Petugas menginput/meninjau hasil dan menyelesaikan pemeriksaan.
- **US-N10-05:** Petugas/dokter menerima penanda nilai kritis.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**FR-N10-01 — Worklist Laboratorium (P0, Phase 1)**

- Tersedia tab **Belum Diproses**, **Proses**, **Pending**, dan **Selesai**, masing-masing menampilkan jumlah record seperti v1.
- Filter tanggal menerima satu tanggal atau rentang dua tanggal; default hari ini. Clear mengembalikan filter ke hari ini.
- Pencarian ter-debounce mendukung Nama Pasien atau No. RM; pergantian tab/search mereset halaman ke 1.
- Kolom mengikuti v1: No. Antrean, No. Order, Rencana Periksa, No. RM, Nama, Tipe Penjamin, Unit, Ruang Perawatan, Dokter, dan badge CITO/Non CITO.
- Pasien prioritas menampilkan indikator khusus. Klik baris expand menampilkan waktu pemesanan, waktu rencana pemeriksaan, jenis kelamin, dan umur.
- Pagination server-side; default 5 baris per halaman mengikuti v1 [dapat dikonfigurasi]. Refresh tidak menduplikasi baris.
- Aksi pada expanded row ditampilkan sesuai tab, lock order, status, dan RBAC.

**FR-N10-01A — Shortcut Aksi Expanded Row (P0, Phase 1)**

- **Data Sosial:** tersedia pada semua tab.
- **Hasil Laboratorium:** tersedia pada tab Proses dan Selesai.
- **Detail Permintaan:** tersedia pada semua tab.
- **Tindakan dan BHP:** tersedia pada tab Proses dan Pending.
- **Selesai:** tersedia pada tab Belum Diproses/Proses hanya jika permintaan sudah terkunci dan seluruh guard terpenuhi.
- **Cancel Order Penunjang:** tersedia selama permintaan belum terkunci; wajib konfirmasi dan mengikuti RBAC.
- Setelah modal ditutup atau aksi berhasil, selected patient dibersihkan dan worklist di-refresh.

**FR-N10-01B — Data Sosial Pasien (P0, Phase 1)**

- Modal mengambil pasien berdasarkan No. RM dan menggunakan master pasien sebagai source of truth.
- Minimal mendukung field v1: No. RM read-only, nama lengkap, sapaan/status pasien, jenis kelamin, tanggal/tempat lahir, alamat, provinsi/kabupaten/kecamatan/kelurahan, telepon, jenis/nomor identitas, serta field sosial lain yang tersedia pada master pasien.
- Dropdown wilayah bersifat cascading; perubahan parent membersihkan pilihan child yang tidak lagi valid.
- Hak edit mengikuti RBAC. Penyimpanan mengubah master pasien dan mencatat audit; perubahan tidak membuat pasien baru atau snapshot tandingan.

**FR-N10-02 — Detail dan Konfirmasi (P0, Phase 1)**

- Header mengikuti v1: No. RM, nama+jenis kelamin, tanggal lahir, dan tipe pelayanan pasien.
- Form menampilkan No. Order, CITO, jadwal tanggal+jam, unit/klinik, catatan klinis, diagnosis, daftar pemeriksaan/intervensi, kelas, dan dokter peminta.
- Diagnosis minimal satu untuk update order; pemeriksaan/intervensi minimal satu.
- Setiap pemeriksaan dapat ditandai CITO dan/atau Rujukan. Jika Rujukan, Lab Rujukan dan estimasi tanggal selesai wajib diisi.
- Daftar pemeriksaan difilter berdasarkan unit Laboratorium, tipe Rawat Jalan/Rawat Inap, kelas, dan kata kunci sebagaimana v1.
- Simpan memperbarui order berdasarkan nomor order secara atomik dan memancarkan event pembaruan billing/claim-plan bila relevan.
- Cancel wajib alasan; histori item, tindakan, billing, dan status tidak dihapus.
- Perubahan order oleh hulu setelah confirm ditampilkan sebagai konflik/version change, tidak menimpa diam-diam.

**FR-N10-03 — Proses dan Hasil Dasar (P0, Phase 1)**

- Aktivitas operasional pertama mengubah CONFIRMED → IN_PROGRESS.
- Hasil disimpan per order item dengan value/text, unit, reference range, flag, dan petugas.
- COMPLETED hanya bila seluruh item wajib memiliki status hasil sesuai konfigurasi.
- Hasil final terkunci; mekanisme koreksi ditandai [PERLU KONFIRMASI].

**FR-N10-04 — Nilai Kritis (P1, Foundation)**

- Rule kritis dievaluasi pada hasil terstruktur; match memberi badge CRITICAL.
- Sistem mencatat acknowledged_by/at; kanal notifikasi WA belum wajib sampai template, consent, recipient, retry disepakati.
- Critical flag tidak boleh hilang karena refresh atau perubahan tampilan.

**FR-N10-05 — Analytics (P2)**

- Kartu volume, TAT, backlog, critical rate, grafik tren hanya Phase 2 dan tidak mengubah fungsi worklist utama.

**Validasi Frontend**

| Field | Rules | Pesan |
|---|---|---|
| Diagnosis | Minimal 1 pada update order | “Diagnosa belum dipilih” |
| Pemeriksaan/Intervensi | Minimal 1 | “Intervensi diisi minimal 1” |
| Lab Rujukan | Required jika item Rujukan | “Lab rujukan pemeriksaan belum dipilih” |
| Estimasi Selesai Rujukan | Required dan tanggal valid jika Rujukan | “Tanggal selesai pemeriksaan rujukan belum diisi” |
| Alasan batal | Required min 5 saat cancel | “Alasan pembatalan wajib diisi” |
| Hasil | Sesuai tipe item | “Format hasil tidak sesuai jenis pemeriksaan” |
| Status selesai | Semua item wajib lengkap | “Masih ada hasil pemeriksaan yang belum lengkap” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**`laboratory_orders`**: `id`, `source_order_id` unique, patient/encounter/requester/unit, priority, status, ordered/confirmed/started/completed/cancelled timestamps, cancellation reason, billing sync status, audit fields.  
**`laboratory_order_items`**: `id`, `order_id`, `exam_item_id`, code/name snapshot, specimen requirement, status.  
**`laboratory_results`**: item_id, version, value/text, unit/reference snapshots, abnormal/critical flags, result status, entered/verified staff and timestamps.  
**`laboratory_status_logs`**: append-only transitions.
**`laboratory_order_revisions`**: snapshot sebelum/sesudah perubahan jadwal, CITO, diagnosis, catatan, pemeriksaan, rujukan, aktor, waktu, dan version.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/laboratory/worklist` | List/filter/pagination |
| GET | `/api/v1/laboratory/worklist/counts` | Count Belum Diproses/Proses/Pending/Selesai dengan filter tanggal yang sama |
| GET | `/api/v1/laboratory/orders/{id}` | Detail |
| PUT | `/api/v1/laboratory/orders/{id}` | Update detail permintaan/konfirmasi dengan optimistic locking |
| POST | `/api/v1/laboratory/orders/{id}/confirm` | Konfirmasi |
| POST | `/api/v1/laboratory/orders/{id}/start` | Mulai proses |
| PUT | `/api/v1/laboratory/orders/{id}/results` | Simpan hasil draft |
| POST | `/api/v1/laboratory/orders/{id}/complete` | Selesai/final |
| POST | `/api/v1/laboratory/orders/{id}/cancel` | Batal |
| POST | `/api/v1/laboratory/results/{id}/acknowledge-critical` | Acknowledge kritis |
| GET | `/api/v1/patients/{medicalRecordNo}/social-data` | Ambil Data Sosial master pasien |
| PUT | `/api/v1/patients/{patientId}/social-data` | Update Data Sosial sesuai RBAC dan audit |
| GET | `/api/v1/regions` | Lookup wilayah cascading berdasarkan type dan parent |
| GET | `/api/v1/laboratory/referral-labs` | Lookup laboratorium rujukan |

### 8.3 Data & Business Rules

**List columns mengikuti v1:** queue number, order number, planned examination, medical record number, patient name/priority, guarantor type, service unit, ward, requesting doctor, CITO status.

**Pemetaan tab:**

| Tab UI | Query Status | Aksi Utama |
|---|---|---|
| Belum Diproses | `ORDERED/UNPROCESSED` | Data Sosial, Detail Permintaan, Selesai jika locked, Cancel jika unlocked |
| Proses | `CONFIRMED/IN_PROGRESS` | Data Sosial, Hasil, Detail Permintaan, Tindakan & BHP, Selesai jika locked |
| Pending | `PENDING` | Data Sosial, Detail Permintaan, Tindakan & BHP, Cancel jika unlocked |
| Selesai | `COMPLETED` | Data Sosial, Hasil read-only/final, Detail Permintaan |

- **BR-N10-01:** Dashboard = worklist, bukan analytics.
- **BR-N10-02:** Satu source order satu row aggregate; item berada di detail.
- **BR-N10-03:** Status hanya berubah melalui aksi bisnis yang valid.
- **BR-N10-04:** Final result immutable; semua perubahan diaudit/versioned.
- **BR-N10-05:** Billing dan EMR mengonsumsi event idempotent dengan provenance.
- **BR-N10-06:** Tampilan dan urutan aksi mengikuti v1, tetapi visibilitas final selalu ditentukan oleh status backend dan RBAC, bukan hanya kondisi frontend.
- **BR-N10-07:** Data Sosial yang diedit dari dashboard tetap mengubah master pasien canonical dan wajib diaudit.
- **BR-N10-08:** Order unlocked dapat dibatalkan; order locked tidak dapat dibatalkan melalui shortcut biasa.
- **BR-N10-09:** Item Rujukan wajib memiliki laboratorium tujuan dan estimasi selesai sebelum disimpan.
- **BR-N10-10:** Count tab dan isi list harus memakai filter tanggal/search/status yang konsisten agar angka tidak berbeda dari worklist.

## 9. Workflow / BPMN Interpretation

1. Order E3 masuk ke tab Belum Diproses atau Pending berdasarkan jadwal/status.
2. Petugas memfilter tanggal, mencari Nama/No. RM, memilih tab, lalu expand pasien.
3. Petugas dapat melihat/memperbarui Data Sosial sesuai RBAC atau membuka Detail Permintaan.
4. Pada Detail Permintaan, petugas meninjau/mengubah CITO, jadwal, diagnosis, catatan klinis, pemeriksaan, dan rujukan lalu menyimpan.
5. Order aktif masuk Proses; petugas mengisi Hasil Laboratorium serta Tindakan & BHP.
6. Jika request locked dan persyaratan lengkap, petugas mengonfirmasi Selesai.
7. Order berpindah ke tab Selesai; hasil final tersedia bagi EMR/Billing dan audit.

`Order E3 → Belum Diproses/Pending → Expanded Actions → Detail/Konfirmasi → Proses → Hasil + Tindakan/BHP → Selesai`

Belum ada BPMN final; detail specimen, verifikasi hasil, billing trigger, dan notifikasi kritis wajib melalui workshop.

## Pertanyaan Terbuka

- Tahap specimen apa saja yang masuk MVP?
- Siapa boleh input, verify, dan finalisasi hasil?
- Kapan charge dibentuk: confirm, mulai, atau selesai?
- Rule nilai kritis dan penerima notifikasi berasal dari master mana?
- Apakah LIS/analyzer integration dibutuhkan pada Phase 1?
