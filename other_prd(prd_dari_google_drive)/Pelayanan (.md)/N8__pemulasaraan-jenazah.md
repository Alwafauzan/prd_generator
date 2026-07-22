# PRD Pondasi — Pemulasaraan Jenazah (N8)

> **Status kematangan:** FOUNDATION / CONCEPT DRAFT — belum menjadi spesifikasi final. Semua keputusan yang belum didukung sumber ditandai `[ASUMSI]` atau `[PERLU KONFIRMASI]`.

**Related Document:** `template.md`; `data/features-mvp.json` F47/F48; PRD Billing/Tagihan Pasien; N3 Master Penomoran Surat; PRD Dashboard Pelayanan; PRD Asesmen Dokter IGD  
**Versi:** 0.2 — Patient Eligibility Integration  
**Tanggal:** 2026-07-20

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|---|---|---|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa oleh | [PERLU KONFIRMASI] Unit Pemulasaraan / Rekam Medis / Pelayanan | — |
| Disetujui oleh | [PERLU KONFIRMASI] Manajemen Rumah Sakit | — |

**Related Documents dan Status Sumber**

| Sumber (dibaca tanpa perubahan) | Fakta yang Digunakan |
|---|---|
| `data/features-mvp.json` F47 | Modul Pemulasaran Jenazah memiliki menu “Menambahkan data pasien”. |
| `data/features-mvp.json` F48 | Modul Pemulasaran Jenazah memiliki menu “Riwayat data jenazah”. |
| `other_prd(prd_dari_google_drive)/Billing/prd-tagihan-pasien.md` | Pemulasaraan Jenazah adalah salah satu entry point pembentukan charge/tagihan pasien. |
| `result/N3...` dan PRD N3 pada `other_prd...` | Surat Keterangan Kematian dapat menggunakan penomoran internal `KETERANGAN_KEMATIAN`. |
| `result/N9__resume-medis/N9__resume-medis.md` | Resume Medis menjadi sumber keadaan keluar pasien; kebutuhan N8 menetapkan `MENINGGAL` sebagai salah satu syarat eligibility. |
| `bahan_random/AddTransaction.vue` | Acuan menu v1: dropdown `No. RM - Nama`, unit read-only, operator, tindakan, BHP, jumlah, tabel sementara, dan simpan per `id_registration`. |
| `result/A2...staff`, A3 Unit, A53 RBAC | Kandidat sumber staff/unit/hak akses. |

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 2026-07-19 | 0.1 | Pondasi awal berdasarkan sumber yang tersedia; belum menetapkan detail layanan, tarif, formulir kematian, atau integrasi otomatis. |
| 2026-07-20 | 0.2 | Menetapkan sumber dropdown pasien dari Resume Medis berkeadaan MENINGGAL yang telah memiliki Surat Kematian, serta mengadopsi pola transaksi tindakan/BHP dari menu v1. |

## 2. Overview & Background

**Overview / Brief Summary**

N8 menyediakan pondasi pencatatan kasus jenazah yang ditangani rumah sakit sejak kasus diterima unit pemulasaraan sampai diserahkan kepada pihak penerima. MVP difokuskan pada dua capability yang tercatat pada sumber: **menambahkan data pasien/jenazah** dan **melihat riwayat data jenazah**.

Pondasi data dirancang agar kelak dapat mengakomodasi sumber pasien internal maupun jenazah dari luar RS, layanan/tindakan pemulasaraan, penyimpanan/ruang, dokumen serah terima, surat kematian, charge billing, dan approval—namun detail tersebut tidak dipaksakan menjadi keputusan Phase 1 sebelum alur bisnis disepakati.

**Business Process (As-Is vs To-Be)**

**As-Is:** [ASUMSI]

- Data jenazah dicatat pada buku/register atau dokumen terpisah.
- Identitas, waktu kematian/diterima, asal unit, layanan, dan penyerahan berpotensi dicatat berulang.
- Status penanganan dan histori siapa melakukan apa sulit ditelusuri.
- Charge pemulasaraan dan dokumen kematian berpotensi tidak sinkron dengan kasus sumber.

**To-Be — Pondasi:**

- Setiap kasus berasal dari pasien/encounter internal yang pada Resume Medis memiliki `keadaan = MENINGGAL` dan telah memiliki Surat Kematian.
- Petugas mencatat identitas minimum, sumber kasus, waktu diterima, penanggung jawab/penerima, dan status.
- Sistem menyediakan worklist aktif dan riwayat read-only dengan audit trail.
- Struktur menyimpan provenance Resume Medis dan Surat Kematian yang menjadi dasar eligibility, serta referensi transaksi untuk billing.

## 3. Goals & Metrics

| No | Metrics | Success Criteria Pondasi |
|---|---|---|
| 1 | Identitas kasus | 100% kasus tersimpan memiliki nomor kasus unik dan sumber kasus. |
| 2 | Ketertelusuran status | 100% perubahan status mencatat aktor dan waktu. |
| 3 | Integritas pasien | Kasus pasien internal memakai `patient_id`/`encounter_id`; data pasien tidak dibuat ulang sebagai master tandingan. |
| 4 | Riwayat | 100% kasus yang diserahkan/dibatalkan dapat ditemukan pada riwayat. |
| 5 | Billing-ready | Setiap layanan/charge masa depan memiliki `source_case_id` dan idempotency key. |
| 6 | Keamanan | 0 akses create/update di luar role berwenang. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — Foundation | Phase 2 — Setelah Validasi Bisnis |
|---|---|---|
| Registrasi kasus | Pilih pasien eligible dari dropdown, nomor kasus, identitas minimum | Integrasi kasus eksternal bila dibutuhkan |
| Worklist | Daftar kasus aktif, cari/filter, detail | SLA, notifikasi, dashboard operasional |
| Status | DRAFT, DITERIMA, DALAM_PENANGANAN, SIAP_DISERAHKAN, DISERAHKAN, DIBATALKAN | Approval, escalation, koreksi pasca-serah |
| Layanan | Input operator, tindakan dan/atau BHP beserta jumlah mengikuti pola menu v1 | Paket layanan dan checklist per agama/adat |
| Penyimpanan | Catatan lokasi/ruang opsional | Manajemen kamar pendingin/kapasitas |
| Dokumen | Catatan referensi dokumen | Surat kematian, serah terima, cetak, TTE |
| Billing | Siapkan provenance/event contract | Posting/void charge secara idempotent |
| Audit | Append-only status/activity log | Pelaporan mutu dan analitik |

**Out of Scope Phase 1**

- Penetapan prosedur klinis pemulasaraan berdasarkan agama/adat.
- Pembuatan dan perubahan isi Surat Kematian; N8 hanya memvalidasi dan memakai referensinya dari Resume Medis.
- Manajemen master dan pengadaan Inventory BHP; N8 hanya membaca stok tersedia dan mencatat pemakaian. Kamar pendingin/slot, kendaraan jenazah, pemakaman, atau pihak ketiga juga di luar scope.
- Posting billing aktif sebelum master layanan/tarif dan titik posting diputuskan.
- Pasien eksternal/nonpasien pada dropdown utama.

## 5. Related Features

| Modul | Relasi Pondasi |
|---|---|
| Pendaftaran/Master Pasien | Sumber identitas pasien internal; N8 tidak membuat master pasien tandingan. |
| IGD/RJ/RI/Discharge | Sumber encounter dan unit asal pasien. |
| N3 Master Penomoran Surat | Kandidat generator nomor Surat Keterangan Kematian internal. |
| Billing G2 | Consumer charge pemulasaraan; kontrak event harus idempotent dan dapat void. |
| Master Staff/A2 | Sumber petugas penanggung jawab. |
| Master Unit/A3 | Sumber unit asal dan unit pemulasaraan. |
| A53 RBAC | Hak create, process, handover, view history, dan koreksi. |
| Resume Medis N9 | Sumber eligibility pasien: `keadaan = MENINGGAL` dan Surat Kematian sudah tercatat. N8 hanya membaca status dan referensi dokumen. |

## 6. Business Process & User Stories

**State Machine Table — Usulan Pondasi**

| Status | Deskripsi | Efek | Transisi Phase 1 | Phase 2 |
|---|---|---|---|---|
| DRAFT | Data minimum belum lengkap | Belum masuk proses | → DITERIMA/DIBATALKAN | Approval koreksi |
| DITERIMA | Jenazah diterima unit | Masuk worklist aktif | → DALAM_PENANGANAN/DIBATALKAN | SLA mulai |
| DALAM_PENANGANAN | Proses berlangsung | Audit aktivitas aktif | → SIAP_DISERAHKAN | Checklist layanan |
| SIAP_DISERAHKAN | Administrasi minimum selesai | Menunggu penerima | → DISERAHKAN | Guard dokumen/billing |
| DISERAHKAN | Jenazah diserahkan | Masuk riwayat; terkunci | Terminal | Addendum/approval koreksi |
| DIBATALKAN | Kasus salah/duplikat/batal | Tidak diproses | Terminal | Reopen approval |

**User Stories Utama**

- **US-N8-01:** Sebagai Petugas, saya ingin mendaftarkan kasus jenazah agar memiliki nomor dan identitas yang dapat ditelusuri.
- **US-N8-02:** Sebagai Petugas, saya ingin dropdown hanya menampilkan pasien meninggal yang Surat Kematiannya sudah diinput agar transaksi tidak salah pasien.
- **US-N8-03:** Sebagai Petugas, saya ingin memperbarui status agar unit mengetahui progres.
- **US-N8-04:** Sebagai Petugas, saya ingin mencatat penerima dan waktu serah terima agar ada bukti operasional.
- **US-N8-05:** Sebagai Rekam Medis/Manajemen, saya ingin mencari riwayat dan audit kasus.
- **US-N8-06:** Sebagai Billing, saya membutuhkan referensi kasus yang stabil untuk charge masa depan.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-N8-01 — Tambah Kasus Jenazah**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Dropdown Pasien hanya memuat encounter yang Resume Medisnya memiliki `keadaan = MENINGGAL` dan Surat Kematian sudah tersimpan/terbit.
  - **AC 2:** Opsi dropdown menggunakan format minimal `No. RM - Nama Pasien`, mengikuti pola v1 `AddTransaction.vue`; pencarian mendukung No. RM dan nama.
  - **AC 3:** Setelah pasien dipilih, sistem menyimpan `patient_id`, `encounter_id`/`id_registration`, dan `death_certificate_id`, lalu menampilkan unit asal secara read-only.
  - **AC 4:** Pasien tidak eligible tidak boleh muncul. Backend wajib mengulang validasi eligibility saat simpan untuk mencegah bypass atau data dropdown kedaluwarsa.
  - **AC 5:** Encounter yang sudah mempunyai transaksi/kasus pemulasaraan aktif tidak muncul lagi, kecuali transaksi lanjutan pada kasus yang sama memang diizinkan [PERLU KONFIRMASI].
  - **AC 6:** Sistem menghasilkan `case_number` unik dan status awal DRAFT; status tidak diinput manual.

**Fitur: FR-N8-01A — Input Tindakan dan BHP (Acuan Menu v1)**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Setelah pasien dipilih, user memilih Operator, Tindakan dan/atau BHP, serta memasukkan jumlah minimal 1.
  - **AC 2:** Daftar Tindakan difilter untuk unit pemulasaraan, tipe pelayanan pasien, kelas pasien, dan penanda layanan pemulasaraan (`mortuary=true`) seperti pada v1.
  - **AC 3:** Daftar BHP hanya memuat stok unit pemulasaraan dengan kuantitas tersedia lebih dari 0; nama dan satuan/kemasan ditampilkan.
  - **AC 4:** Tombol Tambah memasukkan item ke tabel sementara berisi waktu, nama tindakan/BHP, jumlah, dan operator. Item dapat dihapus sebelum penyimpanan.
  - **AC 5:** Setelah item pertama ditambahkan, pasien menjadi read-only sampai transaksi dibatalkan atau seluruh item dihapus.
  - **AC 6:** Tombol Simpan aktif jika minimal satu item tersedia dan menampilkan konfirmasi sebelum menyimpan.

**Fitur: FR-N8-02 — Penerimaan dan Detail Kasus**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Transisi DRAFT → DITERIMA mensyaratkan identitas minimum, sumber, waktu diterima, dan petugas penerima.
  - **AC 2:** Detail menampilkan identitas, sumber/unit, timestamp penting, status, petugas, catatan, dan referensi dokumen.
  - **AC 3:** Waktu kematian klinis tidak boleh disimpulkan dari waktu diterima; keduanya field berbeda.

**Fitur: FR-N8-03 — Proses dan Serah Terima**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Status hanya berubah melalui aksi state machine.
  - **AC 2:** Serah terima mensyaratkan nama penerima, hubungan/instansi, identitas/kontak minimum [PERLU KONFIRMASI], waktu, dan petugas menyerahkan.
  - **AC 3:** Setelah DISERAHKAN, data inti terkunci; koreksi dicatat sebagai addendum/approval Phase 2.
  - **AC 4:** Setiap transisi membuat log append-only.

**Fitur: FR-N8-04 — Daftar Aktif dan Riwayat**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Worklist aktif menampilkan DRAFT–SIAP_DISERAHKAN; Riwayat menampilkan DISERAHKAN/DIBATALKAN.
  - **AC 2:** Pencarian mendukung nomor kasus, No. RM, nama, NIK, dan penerima; filter sumber, unit, status, tanggal.
  - **AC 3:** Pagination server-side dan default sort waktu diterima terbaru.

**Fitur: FR-N8-05 — Pondasi Billing dan Dokumen**

- **Prioritas:** P1
- **Fase:** Phase 1 Foundation (kontrak saja)
- **Acceptance Criteria:**
  - **AC 1:** Struktur menyediakan `billing_source_ref` dan status sinkronisasi tanpa otomatis membuat charge.
  - **AC 2:** Struktur menyediakan relasi dokumen dengan jenis, nomor, status, versi, dan URL/reference tanpa menetapkan template final.
  - **AC 3:** Aktivasi posting billing/surat dilakukan hanya setelah business rule dan ownership dikonfirmasi.

**Fitur: FR-N8-06 — Approval/Koreksi**

- **Prioritas:** P2
- **Fase:** Phase 2
- **Acceptance Criteria:**
  - **AC 1:** Koreksi data inti setelah DISERAHKAN menjadi PENDING_APPROVAL.
  - **AC 2:** Approver dapat approve/reject dengan alasan; record asli tetap dapat ditelusuri.

**Validasi — Wording Frontend Pondasi**

| Field | Tipe | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Pasien | Autocomplete | Required; hanya eligible | “Pasien wajib dipilih” | “Hanya pasien meninggal dengan Surat Kematian yang sudah diinput” |
| Operator | Select | Required, staff aktif unit pemulasaraan | “Operator wajib dipilih” | “Pilih operator pelaksana” |
| Tindakan/BHP | Autocomplete | Minimal salah satu | “Pilih tindakan atau BHP” | “Tambahkan tindakan dan/atau BHP ke daftar” |
| Jumlah | Number | Integer, minimal 1 | “Jumlah minimal 1” | “Masukkan jumlah tindakan atau BHP” |
| Waktu Diterima | Datetime | Required, tidak di masa depan | “Waktu diterima tidak valid” | “Berbeda dari waktu kematian” |
| Unit Asal | Select | Conditional | “Unit asal wajib dipilih untuk pasien internal” | “Diambil dari encounter bila tersedia” |
| Penerima | Text | Required saat serah | “Nama penerima wajib diisi” | “Keluarga atau instansi penerima” |
| Catatan | Textarea | Optional, max 1000 | “Catatan maksimal 1.000 karakter” | “Jangan memasukkan data yang tidak diperlukan” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `mortuary_cases`**

- `id`: UUID, PK
- `case_number`: VARCHAR(50), unique
- `source_type`: ENUM(`INTERNAL_PATIENT`) untuk Phase 1
- `patient_id`, `encounter_id`: UUID, required
- `medical_resume_id`, `death_certificate_id`: UUID, required; provenance eligibility
- identity snapshot: `medical_record_no`, `name`, `national_id`, `birth_date`, `sex`
- `origin_unit_id`: UUID, nullable
- `death_at`: TIMESTAMP, nullable — fakta klinis dari sumber, bukan diestimasi
- `received_at`: TIMESTAMP, required saat DITERIMA
- `received_by`: UUID
- `status`: ENUM sesuai state machine
- `location_id/location_text`: nullable, pondasi penyimpanan
- `notes`: TEXT, nullable
- handover: `recipient_name`, `recipient_relation`, `recipient_identity_no`, `recipient_contact`, `handed_over_at`, `handed_over_by`
- `billing_sync_status`, `billing_source_ref`: nullable
- `status_approval`, `role_approver`: disiapkan untuk Phase 2
- audit columns dan soft delete

**Table: `mortuary_case_status_logs`**

- `id`, `mortuary_case_id`, `from_status`, `to_status`, `note`, `changed_by`, `changed_at`

**Table: `mortuary_case_documents`**

- `id`, `mortuary_case_id`, `document_type`, `document_number`, `version`, `status`, `file_reference`, audit columns

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/mortuary-cases` | Worklist/riwayat/filter |
| GET | `/api/v1/mortuary-cases/{id}` | Detail kasus |
| POST | `/api/v1/mortuary-cases` | Create DRAFT |
| PUT | `/api/v1/mortuary-cases/{id}` | Update sebelum terkunci |
| POST | `/api/v1/mortuary-cases/{id}/receive` | Tandai diterima |
| POST | `/api/v1/mortuary-cases/{id}/start-processing` | Mulai penanganan |
| POST | `/api/v1/mortuary-cases/{id}/ready-for-handover` | Siap diserahkan |
| POST | `/api/v1/mortuary-cases/{id}/handover` | Serah terima |
| POST | `/api/v1/mortuary-cases/{id}/cancel` | Batalkan dengan alasan |
| GET | `/api/v1/mortuary/eligible-patients` | Dropdown pasien; filter server-side Resume Medis `keadaan=MENINGGAL` dan Surat Kematian tersedia |
| GET | `/api/v1/mortuary/interventions` | Lookup tindakan berdasarkan unit pemulasaraan, tipe pelayanan, kelas, dan kata kunci |
| GET | `/api/v1/mortuary/consumables` | Lookup stok BHP tersedia pada unit pemulasaraan |
| POST | `/api/v1/mortuary-cases/{id}/transactions` | Simpan tindakan/BHP per encounter secara atomik |

### 8.3 Data & Business Rules

#### 8.3.1 Form Input Minimum

| Field | Label | Wajib | Sumber | Catatan |
|---|---|---|---|---|
| patient/encounter | Pasien/Kunjungan | Ya | Resume Medis + Patient/Registration | Hanya eligible; read-only setelah item ditambahkan |
| medical_resume_id | Resume Medis | Ya | N9 | Harus berkeadaan MENINGGAL |
| death_certificate_id | Surat Kematian | Ya | N9/Dokumen EMR | Harus sudah tersimpan/terbit |
| identity snapshot | Identitas | Ya | Patient/Registration | Menjaga histori |
| operator_id | Operator | Ya per item | Staff unit pemulasaraan | Staff aktif |
| intervention_id / consumable_id | Tindakan/BHP | Minimal salah satu item | Master tindakan/Inventory | Referensi item canonical |
| quantity | Jumlah | Ya per item | User | Integer minimal 1 |
| received_at/by | Penerimaan | Saat receive | User/session | — |
| death_at | Waktu Kematian | Tidak pada foundation | Sumber klinis | Tidak boleh dikarang N8 |
| origin_unit_id | Unit Asal | Jika internal | Encounter/A3 | — |
| handover fields | Penerima | Saat handover | User | Detail final perlu validasi |

#### 8.3.2 List View

| Kolom | Sumber | Filter/Sort | Catatan |
|---|---|---|---|
| No. Kasus | case_number | Search | Link detail |
| Diterima | received_at | Range/sort | — |
| Identitas | name + MR/NIK | Search | Masking sesuai role |
| Sumber/Unit | source_type/origin_unit | Filter | — |
| Status | status | Filter | Badge |
| Lokasi | location | Filter | Opsional foundation |
| Penerima | recipient_name | Search | Riwayat |

**Business Rules**

- **BR-N8-01:** N8 tidak menetapkan seseorang meninggal; waktu/status klinis berasal dari modul klinis berwenang.
- **BR-N8-02:** Satu kasus memiliki satu nomor unik; pasien internal tetap mereferensikan master pasien.
- **BR-N8-03:** Eligibility dropdown adalah irisan kondisi `Resume Medis.keadaan = MENINGGAL` DAN Surat Kematian sudah tersedia; pemenuhan satu kondisi saja tidak cukup.
- **BR-N8-04:** DISERAHKAN mengunci data inti dan memindahkan kasus ke Riwayat.
- **BR-N8-05:** Billing dan dokumen menggunakan provenance/idempotency; tidak boleh membuat duplikasi charge/nomor.
- **BR-N8-06:** Semua transisi dan akses sensitif diaudit.
- **BR-N8-07:** Validasi eligibility dilakukan saat membaca dropdown dan diulang secara transaksional saat simpan.
- **BR-N8-08:** Penyimpanan tindakan/BHP harus atomik per request; kegagalan salah satu item tidak boleh menghasilkan transaksi parsial.

## 9. Workflow / BPMN Interpretation

> BPMN khusus belum tersedia. Ini alur pondasi, bukan SOP klinis final.

1. Dokter/petugas berwenang mengisi Resume Medis dengan `keadaan = MENINGGAL` dan menginput Surat Kematian.
2. N8 membaca pasien eligible dan menampilkannya pada dropdown dengan label `No. RM - Nama Pasien`.
3. Petugas memilih pasien; sistem menampilkan unit asal read-only dan melakukan duplicate check.
4. Petugas memilih operator, menambahkan tindakan dan/atau BHP beserta jumlah ke tabel sementara.
5. Petugas mengonfirmasi Simpan; backend memvalidasi ulang eligibility dan menyimpan kasus beserta transaksi secara atomik.
6. Petugas melengkapi penerimaan dan proses sampai SIAP_DISERAHKAN.
7. Petugas mencatat penerima dan waktu → DISERAHKAN; record terkunci dan masuk Riwayat.

## Asumsi

- [ASUMSI] F47 dan F48 diwujudkan sebagai satu aggregate dengan worklist aktif dan tab riwayat.
- [ASUMSI] Phase 1 belum mengatur checklist agama/adat atau ruang pendingin.

## Pertanyaan Terbuka Prioritas

- Status Surat Kematian apa yang dianggap eligible: `DRAFT`, `FINAL/TERBIT`, atau cukup sudah memiliki record?
- Encounter yang sudah pernah dipilih harus hilang permanen dari dropdown atau tetap tersedia untuk transaksi lanjutan pada kasus yang sama?
- Siapa yang berwenang menyatakan/menginput waktu kematian dan menerbitkan Surat Kematian?
- Tahapan dan checklist layanan pemulasaraan yang sebenarnya apa saja?
- Apakah perlu manajemen kamar pendingin, kapasitas, dan durasi penyimpanan?
- Kapan charge dibentuk, diperbarui, dan di-void? Master tarif/tindakannya berasal dari mana?
- Dokumen apa yang dihasilkan dan siapa penandatangan/approver-nya?
- Persyaratan identitas pihak penerima dan bukti serah terima apa saja?
