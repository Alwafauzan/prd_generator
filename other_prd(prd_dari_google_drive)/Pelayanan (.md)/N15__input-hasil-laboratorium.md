# Product Requirement Document (PRD) — N15 Input Hasil Laboratorium

> **Status:** Draft v0.1  
> **Tanggal:** 2026-07-21  
> **Prinsip utama:** hasil berstatus `VALID` merupakan hasil resmi; hasil kritis tidak dapat divalidasi tanpa catatan hasil kritis; hasil tervalidasi bersifat immutable dan hanya dapat dikoreksi melalui unvalidasi/revisi yang diaudit.

## 1. Metadata Dokumen

| Atribut | Nilai |
|---|---|
| Approval | [PERLU KONFIRMASI] Kepala Instalasi Laboratorium, Dokter Penanggung Jawab Laboratorium, Manajemen RS |
| Related Documents | `template.md`; Master Item Laboratorium; SOP validasi dan pelaporan nilai kritis RS [PERLU KONFIRMASI] |
| Document Version | 2026-07-21 — v0.1 — Draft awal N15 Input Hasil Laboratorium |

## 2. Overview & Background

### Overview/Brief Summary

N15 menyediakan satu halaman kerja untuk menampilkan order dan hasil pemeriksaan laboratorium, memasukkan hasil secara manual, menampilkan hasil yang telah diterima dari LIS, menentukan interpretasi Normal/Abnormal/Critical secara otomatis, mencatat tindak lanjut nilai kritis, memvalidasi hasil oleh dokter laboratorium, dan mencetak hasil resmi. Kelompok dan item pemeriksaan bersifat dinamis berdasarkan snapshot konfigurasi Master Item Laboratorium saat order diproses.

### Business Process (As-Is vs To-Be)

**As-Is**

Alur V1 tetap digunakan: dokter membuat order, petugas laboratorium mengonfirmasi order, order dapat dikirim ke LIS, LIS mengirim hasil ke SIMRS, atau petugas memasukkan hasil manual bila LIS tidak digunakan, lalu dokter laboratorium memvalidasi hasil. Kendala yang ingin diperbaiki adalah tampilan item yang panjang, indikator abnormal/kritis yang kurang tegas, risiko perubahan hasil tanpa jejak yang memadai, dan risiko hasil kritis divalidasi tanpa catatan tindakan.

**To-Be**

1. User membuka order laboratorium dan melihat snapshot identitas pasien, nomor order, DPJP, dokter laboratorium, tanggal pemeriksaan, serta unit asal.
2. Sistem menampilkan item dalam tabel/grid padat per kelompok pemeriksaan dinamis dengan header kelompok sticky.
3. Hasil dari LIS yang sudah diterima ditampilkan dengan sumber `LIS` dan terkunci bagi user tanpa hak override; hasil non-LIS dapat diisi sesuai tipe data master.
4. Pada setiap perubahan hasil manual, sistem memvalidasi tipe data dan menghitung interpretasi Normal/Abnormal/Critical secara realtime menggunakan snapshot referensi yang sesuai dengan usia, jenis kelamin, metode, dan instrumen.
5. Item Critical memunculkan field catatan wajib. Validasi ditolak sampai seluruh data wajib dan catatan Critical lengkap.
6. Dokter laboratorium memvalidasi hasil. Sistem menyimpan snapshot hasil dan referensi, menerbitkan hasil resmi, serta menyediakan cetak dengan QR/TTE bila dikonfigurasi.
7. Perubahan setelah validasi hanya dilakukan melalui unvalidasi atau revisi oleh user berwenang dan seluruh aktivitas dicatat dalam audit trail.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---|---|---|
| 1 | Ketersediaan hasil | 100% item hasil valid tampil pada order dan kelompok yang sesuai. |
| 2 | Akurasi sumber hasil | 100% item memiliki penanda `MANUAL`, `LIS`, atau `FORMULA` dan sumber tercatat di audit. |
| 3 | Deteksi abnormal/kritis | 100% nilai yang memenuhi snapshot rule master diberi interpretasi dan indikator yang sesuai. |
| 4 | Kepatuhan hasil kritis | 0 hasil Critical dapat divalidasi tanpa catatan kritis wajib. |
| 5 | Integritas hasil resmi | 0 hasil `VALID` dapat diedit langsung; seluruh koreksi melalui unvalidasi/revisi berizin. |
| 6 | Auditability | 100% input, perubahan, validasi, unvalidasi, revisi, cetak, dan sumber hasil tercatat. |
| 7 | Waktu buka halaman | p95 < 2 detik pada beban dan volume item yang disepakati saat performance test. |
| 8 | Waktu tampil seluruh hasil | p95 < 2 detik untuk satu order dengan jumlah item maksimum yang disepakati. |
| 9 | Waktu simpan manual | p95 < 1 detik, tidak termasuk gangguan jaringan pengguna. |
| 10 | Waktu validasi | p95 < 1 detik setelah seluruh precondition terpenuhi. |
| 11 | Realtime classification | Indikator diperbarui ≤ 300 ms setelah input valid tanpa reload halaman. [ASUMSI] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD dan validasi dasar) | Phase 2 (Advanced: Approval/Escalation) |
|---|---|---|
| Informasi order | Tampil snapshot pasien, order, DPJP, validator, tanggal, unit | Context klinis tambahan dan navigasi lintas encounter |
| Kelompok/item | Kelompok dinamis, tabel padat, sticky header, mapping snapshot | Personalisasi kolom dan virtualized grid skala besar |
| Hasil manual | Numeric, Text, Option, Narrative, Formula/read-only, catatan, autosave/draft | Dual entry, verifikasi berjenjang per kelompok |
| Hasil LIS | Menampilkan hasil yang telah diterima, source badge, lock/override RBAC | Rekonsiliasi dan orkestrasi retry integrasi |
| Interpretasi | Normal/Abnormal/Critical realtime dari snapshot rule | Rule kompleks multi-analyte dan delta check |
| Nilai kritis | Badge kuat, catatan wajib, tindak lanjut opsional/configurable | Notifikasi/escalation berjenjang dan acknowledgement DPJP/unit |
| Validasi | Submit, validasi dokter, unvalidasi/revisi berizin | Co-sign/approval berjenjang sesuai kebijakan RS |
| Cetak | Preview/cetak hasil valid dan watermark non-final | TTE/QR verification penuh dan distribusi otomatis |
| Audit | Append-only audit trail aktivitas utama | Audit analytics dan anomaly alert |

**Out of Scope**

- Pengiriman order ke LIS.
- Pembangunan konektor/integrasi penerimaan hasil LIS; N15 hanya mengonsumsi hasil yang sudah tersedia dari layanan integrasi.
- Pengaturan Master Laboratorium, mapping master, normal range, critical range, metode, atau instrumen.
- Kalibrasi alat dan Quality Control alat laboratorium.
- Pengulangan pemeriksaan dan SOP operasional instrumen di luar pencatatan warning/konfirmasi.
- Notifikasi otomatis nilai kritis pada Phase 1; disiapkan sebagai event untuk konfigurasi Phase 2.

## 5. Related Features

| Fitur/Modul | Relasi Teknis/Bisnis |
|---|---|
| Order Laboratorium | Publisher nomor order, encounter, item, prioritas, DPJP, dan unit asal. |
| Dashboard Laboratorium (N10) | Worklist/entry point menuju detail N15 dan consumer status progres hasil. |
| Master Item Laboratorium | Sumber kelompok, tipe data, option set, satuan, metode, normal range, critical range, dan mapping kode LIS. |
| Integration Service LIS | Publisher hasil LIS yang telah diterima; berada di luar scope pembangunan N15. |
| EMR/Hasil Penunjang | Consumer hasil yang telah valid. |
| Notifikasi Klinis | Consumer event Critical untuk DPJP/unit bila fitur dikonfigurasi. |
| TTE/QR Verification | Penyedia tanda tangan/QR pada hasil cetak bila tersedia. |
| RBAC/Admin | Sumber hak input, override LIS, submit, validate, unvalidate, revise, print, dan view audit. |

## 6. Business Process & User Stories

### State Machine Table

| Status | Deskripsi | Efek Stok | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|
| `DRAFT` | Hasil belum lengkap/masih diedit | N/A | → `WAITING_VALIDATION`; tetap `DRAFT`; → `CANCELLED` mengikuti order | Sama |
| `PARTIAL` | Sebagian hasil LIS/manual sudah tersedia dan item lain masih pending | N/A | → `DRAFT` atau `WAITING_VALIDATION` setelah kelengkapan terpenuhi | Dapat memicu monitoring SLA |
| `WAITING_VALIDATION` | Hasil lengkap dan diajukan untuk validasi | N/A | → `VALID`; → `REVISION`/`DRAFT` bila dikembalikan | → tahap co-sign/approval tambahan |
| `VALID` | Hasil resmi, read-only, dapat dipublikasikan/cetak resmi | N/A | → `REVISION` melalui unvalidate/revise berizin | Dapat memerlukan co-sign sebelum publish |
| `REVISION` | Versi sebelumnya tetap terlacak, koreksi sedang dikerjakan | N/A | → `WAITING_VALIDATION`; → `VALID` sebagai versi baru | Approval revisi/escalation |
| `CANCELLED` | Pemeriksaan/order dibatalkan oleh proses hulu dengan alasan | N/A | Terminal; tidak menghapus histori | Sama |

Status `Normal`, `Abnormal`, dan `Critical` adalah **interpretasi per item**, bukan status workflow order.

### User Stories Utama

- **US-N15-01:** Sebagai petugas laboratorium, saya ingin melihat seluruh item per kelompok agar dapat memproses order secara cepat.
- **US-N15-02:** Sebagai petugas laboratorium, saya ingin mengisi hasil sesuai tipe item agar data yang disimpan valid.
- **US-N15-03:** Sebagai petugas laboratorium, saya ingin hasil LIS terkunci dan bertanda sumber agar tidak salah mengubah data integrasi.
- **US-N15-04:** Sebagai petugas laboratorium, saya ingin segera mengetahui nilai abnormal/kritis agar dapat menjalankan SOP.
- **US-N15-05:** Sebagai dokter laboratorium, saya ingin memvalidasi hasil lengkap dan menolak hasil kritis tanpa catatan agar hanya hasil layak yang diterbitkan.
- **US-N15-06:** Sebagai dokter laboratorium berwenang, saya ingin melakukan unvalidasi/revisi dengan alasan agar koreksi terdokumentasi.
- **US-N15-07:** Sebagai DPJP/unit pelayanan, saya ingin melihat hasil resmi secara cepat dan jelas agar dapat mengambil keputusan klinis.
- **US-N15-08:** Sebagai auditor, saya ingin melihat riwayat nilai, sumber, dan actor agar setiap perubahan dapat ditelusuri.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur FR-N15-01 — Informasi Order Laboratorium**

- **User Story:** Sebagai user laboratorium, saya ingin melihat konteks order agar memastikan hasil dicatat pada pasien dan order yang benar.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Saat order valid dibuka, sistem menampilkan nama pasien, nomor rekam medis, nomor order, DPJP, dokter laboratorium/validator, tanggal pemeriksaan, dan bangsal/unit asal.
  - **AC 2:** Bila nomor order tidak ditemukan atau user tidak berhak mengakses encounter, API mengembalikan 404 atau 403 tanpa mengekspos data pasien.
  - **AC 3:** Hasil LIS hanya dipasangkan bila identifier order dan kode item cocok dengan mapping yang berlaku pada order; mismatch masuk exception log dan tidak mengubah item lain.

**Fitur FR-N15-02 — Kelompok dan Detail Item Dinamis**

- **User Story:** Sebagai petugas, saya ingin melihat item dalam kelompok dinamis dan grid padat agar scrolling berkurang.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Sistem membentuk kelompok berdasarkan snapshot master, tidak menggunakan daftar kelompok hard-coded.
  - **AC 2:** Setiap baris menampilkan nama pemeriksaan, hasil/input, satuan, nilai normal, metode, sumber, interpretasi, dan status validasi.
  - **AC 3:** Urutan kelompok dan item mengikuti sort order master yang tersimpan saat order dibuat.
  - **AC 4:** Header kelompok tetap terlihat saat isi kelompok di-scroll; kelompok dapat collapse/expand tanpa kehilangan nilai yang belum disimpan.

**Fitur FR-N15-03 — Input Hasil Manual Berdasarkan Tipe Data**

- **User Story:** Sebagai petugas, saya ingin memasukkan hasil dengan kontrol yang sesuai tipe data agar input konsisten.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** `NUMERIC` hanya menerima angka, tanda minus bila diizinkan, dan presisi sesuai master; separator desimal dinormalisasi sebelum simpan.
  - **AC 2:** `TEXT` dan `NARRATIVE` menerapkan required/max length; `OPTION` hanya menerima value aktif dalam option snapshot; `FORMULA` dihitung sistem dan read-only.
  - **AC 3:** Simpan hanya mengubah item yang dikirim dan tidak menimpa item lain, termasuk item LIS/pending.
  - **AC 4:** Input invalid tidak disimpan; field ditandai dan pesan spesifik ditampilkan.
  - **AC 5:** Save menggunakan optimistic concurrency/version; stale update ditolak dengan 409 dan nilai terbaru dikembalikan.

**Fitur FR-N15-04 — Penanganan Hasil dari LIS**

- **User Story:** Sebagai petugas, saya ingin mengenali dan menjaga hasil LIS agar provenance data tidak hilang.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Item yang diterima dari integration service tampil dengan badge `LIS`, waktu diterima, dan identifier message/batch bila tersedia.
  - **AC 2:** User biasa tidak dapat mengedit item LIS; UI read-only dan API mengembalikan 403 bila edit dipaksakan.
  - **AC 3:** User dengan permission `lab_result.override_lis` dapat mengubah sebelum validasi dengan alasan wajib; hasil perubahan menjadi versi baru dan provenance LIS asal tetap tersimpan.
  - **AC 4:** Pesan duplikat dengan idempotency key yang sama tidak membuat versi baru. Koreksi LIS dengan versi/waktu lebih baru membuat revision record dan audit.
  - **AC 5:** Kedatangan parsial hanya memperbarui item yang disebut dan status agregat menjadi `PARTIAL` bila masih ada item wajib pending.

**Fitur FR-N15-05 — Deteksi Normal, Abnormal, dan Critical**

- **User Story:** Sebagai petugas, saya ingin interpretasi dihitung otomatis agar hasil berisiko cepat terlihat.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Untuk numeric, server menentukan interpretasi dari nilai hasil dan snapshot rule terpilih berdasarkan usia saat pemeriksaan, jenis kelamin, metode, dan instrumen bila dikonfigurasi.
  - **AC 2:** Rule Critical dievaluasi dengan prioritas lebih tinggi daripada Abnormal; item yang memenuhi Critical ditampilkan `CRITICAL`, bukan hanya `ABNORMAL`.
  - **AC 3:** Setelah input valid, UI menampilkan interpretasi realtime ≤ 300 ms [ASUMSI], dan hasil final selalu dihitung ulang di server saat simpan/validasi.
  - **AC 4:** Abnormal menggunakan badge/icon oranye; Critical menggunakan badge/icon merah dan label `CRITICAL`; status tidak bergantung hanya pada warna.
  - **AC 5:** Tooltip/badge menjelaskan rule yang terpicu tanpa mengekspos data master yang tidak relevan.
  - **AC 6:** Jika tidak ada rule yang cocok, sistem menampilkan `REFERENCE_NOT_AVAILABLE`, tidak mengasumsikan Normal, dan menerapkan guard validasi sesuai konfigurasi RS [PERLU KONFIRMASI].

**Fitur FR-N15-06 — Catatan Pemeriksaan dan Hasil Kritis**

- **User Story:** Sebagai petugas, saya ingin mencatat komentar, interpretasi, dan tindakan hasil kritis agar konteks klinis terdokumentasi.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Sistem menyediakan catatan pemeriksaan, komentar laboratorium, interpretasi hasil, dan alasan kondisi khusus pada level order atau item sesuai konfigurasi.
  - **AC 2:** Ketika item menjadi Critical, field catatan hasil kritis otomatis tampil dan wajib diisi sebelum submit/validate.
  - **AC 3:** Tindak lanjut bersifat wajib atau opsional mengikuti konfigurasi RS; bila wajib dan kosong, validasi ditolak.
  - **AC 4:** Perubahan nilai dari Critical menjadi non-Critical tidak menghapus catatan yang sudah ada; catatan tetap di histori dan dapat ditandai tidak lagi aktif.

**Fitur FR-N15-07 — Submit dan Validasi Dokter Laboratorium**

- **User Story:** Sebagai dokter laboratorium, saya ingin memvalidasi hasil lengkap agar hasil resmi hanya diterbitkan setelah review.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Submit ke `WAITING_VALIDATION` hanya berhasil bila seluruh item wajib memiliki hasil valid atau status pengecualian yang diizinkan dan beralasan.
  - **AC 2:** Validasi hanya tersedia bagi permission `lab_result.validate`; validator dan waktu validasi berasal dari session/server clock.
  - **AC 3:** Validasi ditolak secara atomik bila ada item Critical tanpa catatan wajib, item invalid, item pending wajib, atau versi berubah sejak halaman dibuka.
  - **AC 4:** Validasi membuat immutable publication version berisi snapshot hasil, satuan, metode, normal/critical reference, interpretasi, catatan, validator, dan timestamp.
  - **AC 5:** Setelah validasi, field input read-only dan hasil tersedia bagi consumer EMR/unit sesuai kebijakan publikasi RS.

**Fitur FR-N15-08 — Unvalidasi dan Revisi**

- **User Story:** Sebagai user berwenang, saya ingin mengoreksi hasil valid melalui proses resmi agar integritas audit terjaga.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Edit langsung terhadap publication `VALID` selalu ditolak.
  - **AC 2:** Unvalidasi/revisi memerlukan permission khusus dan alasan minimal 10 karakter [ASUMSI].
  - **AC 3:** Sistem mempertahankan versi resmi sebelumnya, membuat working version baru berstatus `REVISION`, dan mencatat actor, waktu, alasan, before/after.
  - **AC 4:** Hasil revisi harus divalidasi kembali dan nomor versi hasil bertambah; cetakan versi lama tetap dapat ditelusuri tetapi ditandai superseded.

**Fitur FR-N15-09 — Cetak Hasil Laboratorium**

- **User Story:** Sebagai user berwenang, saya ingin mencetak hasil agar dapat digunakan dalam pelayanan klinis.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Cetak resmi memuat identitas pasien, nomor order, kelompok/item, hasil, satuan, nilai normal, indikator abnormal/kritis non-color-only, catatan yang dikonfigurasi tampil, dokter laboratorium, dan tanggal validasi.
  - **AC 2:** QR Code/TTE hanya ditampilkan bila provider dikonfigurasi dan token verifikasi valid; jika tidak, sistem tidak membuat QR palsu.
  - **AC 3:** Preview/cetak hasil belum valid memiliki watermark `BELUM VALID` dan tidak diberi label sebagai hasil resmi.
  - **AC 4:** Cetak selalu merujuk publication version tertentu dan mencatat actor, waktu, versi, serta jenis output pada audit trail.

**Fitur FR-N15-10 — Audit Trail dan RBAC**

- **User Story:** Sebagai auditor/admin, saya ingin aktivitas hasil dapat ditelusuri dan dibatasi sesuai kewenangan.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Audit append-only mencatat input, perubahan nilai, override LIS, submit, validate, unvalidate, revise, print, sumber, actor, waktu, reason, dan correlation ID.
  - **AC 2:** API memeriksa permission pada server; menyembunyikan tombol di UI bukan satu-satunya kontrol.
  - **AC 3:** Audit menyimpan before/after dengan masking sesuai kebijakan keamanan dan tidak dapat diedit oleh user operasional.

### Validasi — Wording Frontend

| Field | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Hasil numeric | Decimal | Sesuai precision/scale dan instrument limit snapshot | “Masukkan hasil berupa angka yang valid.” | “Gunakan angka sesuai satuan pemeriksaan.” |
| Hasil text | Text | Required jika item wajib; max sesuai master | “Hasil pemeriksaan wajib diisi.” | “Masukkan hasil sesuai format pemeriksaan.” |
| Hasil option | Select/Radio | Harus berasal dari option snapshot | “Pilih salah satu hasil yang tersedia.” | “Pilihan mengikuti konfigurasi item.” |
| Narrative | Textarea | Max length configurable | “Narasi melebihi batas karakter.” | “Tambahkan uraian hasil pemeriksaan.” |
| Catatan hasil kritis | Textarea | Required ketika interpretasi Critical | “Catatan hasil kritis wajib diisi sebelum validasi.” | “Jelaskan konfirmasi/pelaporan hasil kritis yang dilakukan.” |
| Tindak lanjut | Textarea/Select | Required bila konfigurasi RS mewajibkan | “Tindak lanjut hasil kritis wajib diisi.” | “Catat tindakan sesuai SOP rumah sakit.” |
| Alasan override LIS | Textarea | Required untuk override, min 10 [ASUMSI] | “Alasan perubahan hasil LIS wajib diisi.” | “Perubahan akan tercatat pada audit trail.” |
| Alasan unvalidasi/revisi | Textarea | Required, min 10 [ASUMSI] | “Alasan unvalidasi atau revisi wajib diisi.” | “Hasil versi sebelumnya tetap tersimpan.” |
| Instrument limit confirmation | Checkbox + note | Required bila di luar batas alat | “Konfirmasi hasil di luar batas alat sebelum menyimpan.” | “Ikuti SOP pengulangan/konfirmasi pemeriksaan.” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table `laboratory_result_sets`**

- `id`: UUID, primary key.
- `laboratory_order_id`: UUID, indexed, unique per active aggregate.
- `order_number`: varchar, indexed snapshot.
- `patient_id`, `encounter_id`, `dpjp_id`, `origin_unit_id`: UUID references.
- `responsible_lab_doctor_id`: UUID nullable until assigned.
- `examination_at`: timestamptz.
- `workflow_status`: enum `DRAFT|PARTIAL|WAITING_VALIDATION|VALID|REVISION|CANCELLED`.
- `current_working_version`, `current_published_version`: integer.
- `row_version`: bigint for optimistic locking.
- `created_at`, `created_by`, `updated_at`, `updated_by`.

**Table `laboratory_result_items`**

- `id`: UUID, primary key; `result_set_id`: UUID, foreign key.
- `order_item_id`: UUID; unique with `result_set_id`.
- `master_item_id`, `master_item_version`: identifier snapshot source.
- `group_code`, `group_name`, `group_sort_order`: snapshot.
- `item_code`, `item_name`, `item_sort_order`: snapshot.
- `data_type`: enum `NUMERIC|TEXT|OPTION|NARRATIVE|FORMULA`.
- `result_numeric`: decimal nullable; `result_text`: text nullable; `result_option_code`: varchar nullable; `result_raw`: text nullable.
- `unit_code`, `unit_display`, `method_code`, `method_display`, `instrument_id`: snapshot.
- `source_type`: enum `MANUAL|LIS|FORMULA`; `source_message_id`, `source_received_at`.
- `interpretation`: enum `NORMAL|ABNORMAL|CRITICAL|REFERENCE_NOT_AVAILABLE|PENDING`.
- `validation_status`: enum aligned with result set as needed.
- `is_required`, `is_locked`, `row_version`, audit timestamps.

**Table `laboratory_reference_snapshots`**

- `id`: UUID; `result_item_id`: UUID; `publication_version`: integer nullable while draft.
- `sex_criteria`, `age_min`, `age_max`, `age_unit`, `method_code`, `instrument_id`.
- `normal_low`, `normal_high`, `normal_text`, `critical_low`, `critical_high`.
- `rule_expression`: JSONB untuk rule non-numeric yang terkontrol.
- `display_reference`, `matched_rule_id`, `matched_rule_version`, `effective_at`.

**Table `laboratory_result_notes`**

- `id`: UUID; `result_set_id`, `result_item_id` nullable.
- `note_type`: enum `EXAM_NOTE|LAB_COMMENT|INTERPRETATION|SPECIAL_CONDITION|CRITICAL_NOTE|FOLLOW_UP|OVERRIDE_REASON|REVISION_REASON`.
- `content`: text; `is_required`, `is_active`; audit columns.

**Table `laboratory_result_publications`**

- `id`: UUID; `result_set_id`: UUID; `version`: integer, unique pair.
- `snapshot_payload`: JSONB immutable.
- `status`: enum `VALID|SUPERSEDED|REVOKED`.
- `validated_by`, `validated_at`, `superseded_by_publication_id`.
- `signature_provider`, `signature_reference`, `qr_verification_token_hash` nullable.

**Table `laboratory_result_events`**

- `id`: UUID; `result_set_id`, `result_item_id` nullable.
- `event_type`, `actor_id`, `actor_role`, `occurred_at`, `reason`.
- `before_payload`, `after_payload`: JSONB; `correlation_id`, `ip_address`, `user_agent` sesuai kebijakan.
- Append-only; retention mengikuti kebijakan rekam medis RS [PERLU KONFIRMASI].

**Table `laboratory_lis_receipts`**

- `id`: UUID; `idempotency_key`: varchar unique; `order_number`, `item_code`.
- `message_id`, `message_version`, `result_item_id`, `received_at`, `processed_at`.
- `processing_status`: enum `PROCESSED|DUPLICATE|REJECTED|MAPPING_ERROR`.
- `error_detail`: JSONB nullable.

Indeks minimum: `order_number`, `(patient_id, examination_at)`, `(workflow_status, updated_at)`, `(result_set_id, group_sort_order, item_sort_order)`, `source_message_id`, dan audit `(result_set_id, occurred_at)`.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/laboratory/result-sets/{id}` | Detail order, groups, items, notes, permissions, dan version. |
| GET | `/api/v1/laboratory/result-sets/by-order/{orderNumber}` | Resolve hasil berdasarkan nomor order. |
| PATCH | `/api/v1/laboratory/result-items/{itemId}` | Simpan satu hasil manual dengan `If-Match`/row version. |
| PATCH | `/api/v1/laboratory/result-sets/{id}/bulk-items` | Simpan batch item manual secara atomik. |
| POST | `/api/v1/laboratory/result-items/{itemId}/override-lis` | Override hasil LIS berizin dengan alasan. |
| PUT | `/api/v1/laboratory/result-sets/{id}/notes` | Upsert catatan order/item. |
| POST | `/api/v1/laboratory/result-sets/{id}/classify-preview` | Preview klasifikasi realtime; server tetap authoritative. |
| POST | `/api/v1/laboratory/result-sets/{id}/submit` | Submit ke Waiting Validation. |
| POST | `/api/v1/laboratory/result-sets/{id}/validate` | Validasi atomik dan buat publication. |
| POST | `/api/v1/laboratory/result-sets/{id}/unvalidate` | Unvalidasi berizin dengan alasan. |
| POST | `/api/v1/laboratory/result-sets/{id}/revisions` | Buat working revision dari publication. |
| GET | `/api/v1/laboratory/result-sets/{id}/publications` | Daftar versi hasil resmi. |
| GET | `/api/v1/laboratory/publications/{publicationId}/print` | Render PDF/print untuk versi tertentu. |
| GET | `/api/v1/laboratory/result-sets/{id}/audit-events` | Audit trail sesuai permission. |
| POST | `/internal/v1/laboratory/lis-results` | Contract consumer internal; implementasi konektor LIS di luar scope N15. |

Semua mutation menerima `Idempotency-Key` yang relevan, correlation ID, dan row/version precondition. Error menggunakan struktur konsisten: `code`, `message`, `field_errors`, `correlation_id`.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `result_numeric` | Hasil | Decimal | Kondisional | Precision, scale, min/max instrument | Manual | Hanya tipe Numeric. |
| `result_text` | Hasil | Text | Kondisional | Max length/regex master | Manual | Text/Narrative. |
| `result_option_code` | Hasil | Select/Radio | Kondisional | Option snapshot aktif | Master + Manual | Contoh Positif/Negatif. |
| `formula_result` | Hasil | Read-only | Sistem | Formula versioned, dependency lengkap | Sistem | Tidak dapat diedit. |
| `exam_note` | Catatan Pemeriksaan | Textarea | Tidak | Max configurable | Manual | Dapat dicetak bila konfigurasi mengizinkan. |
| `lab_comment` | Komentar Laboratorium | Textarea | Tidak | Max configurable | Manual | Level order/item. |
| `result_interpretation_note` | Interpretasi Hasil | Textarea | Tidak | Max configurable | Manual | Bukan pengganti klasifikasi sistem. |
| `critical_note` | Catatan Hasil Kritis | Textarea | Jika Critical | Required, non-whitespace | Manual | Guard submit/validate. |
| `critical_follow_up` | Tindak Lanjut | Textarea/Select | Configurable | Sesuai policy snapshot | Manual | Phase 1 merekam; notifikasi Phase 2. |
| `override_reason` | Alasan Override LIS | Textarea | Saat override | Permission + min length | Manual | Provenance LIS dipertahankan. |
| `revision_reason` | Alasan Revisi | Textarea | Saat unvalidate/revise | Permission + min length | Manual | Disimpan pada event. |
| `row_version` | Versi Data | Hidden | Ya | Harus sama dengan server | Sistem | Optimistic locking. |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar/Detail

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|---|---|---|---|---|
| Identitas pasien | Snapshot order/patient | Nama, MR, usia, jenis kelamin | Tidak | Data minimum sesuai akses. |
| Nomor order | Order | Text | Search | Identifier canonical LIS matching. |
| DPJP | Order snapshot | Nama dokter | Tidak | Tidak editable di N15. |
| Dokter laboratorium | Assignment/result set | Nama + status | Filter [ASUMSI] | Validator aktual tersimpan saat validasi. |
| Tanggal pemeriksaan | Result set | Tanggal/jam zona RS | Sort | Bukan waktu input. |
| Bangsal/unit asal | Encounter/order snapshot | Nama unit | Filter | Snapshot untuk histori. |
| Kelompok | Item snapshot | Nama + sticky header | Sort master | Dinamis. |
| Pemeriksaan | Item snapshot | Kode + nama | Sort master | Tooltip kode bila perlu. |
| Hasil | Result item | Sesuai tipe | Tidak | Input/read-only berdasar source/status/RBAC. |
| Unit | Item snapshot | Text | Tidak | Snapshot. |
| Nilai normal | Reference snapshot | Display range/text | Tidak | Snapshot saat hasil diterbitkan. |
| Metode | Item snapshot | Text | Tidak | Dapat memengaruhi reference. |
| Sumber | Result item | Badge LIS/Manual/Formula | Filter | Wajib untuk audit. |
| Interpretasi | System classification | Badge/icon + tooltip | Filter | Normal/Abnormal/Critical/No Reference/Pending. |
| Status validasi | Result set/item | Badge | Filter | Draft/Partial/Menunggu/Valid/Revisi. |
| Catatan kritis | Result note | Indicator + editor | Filter Critical | Muncul otomatis untuk Critical. |

### Business Rules

- **BR-N15-01:** Nomor order dan order item ID adalah identifier utama agregat; hasil tidak boleh dipasangkan hanya berdasarkan nama pasien/item.
- **BR-N15-02:** Kelompok, item, tipe data, unit, metode, option, formula, serta rule normal/critical yang digunakan harus disnapshot agar perubahan master tidak mengubah histori.
- **BR-N15-03:** Klasifikasi server adalah authoritative. Preview client hanya untuk feedback realtime.
- **BR-N15-04:** Priority klasifikasi adalah `CRITICAL` > `ABNORMAL` > `NORMAL`; ketiadaan referensi menghasilkan `REFERENCE_NOT_AVAILABLE`.
- **BR-N15-05:** Hasil di luar instrument limit memerlukan warning dan konfirmasi sesuai SOP; keputusan blok/nonblok [PERLU KONFIRMASI].
- **BR-N15-06:** Item LIS read-only kecuali user memiliki permission override dan hasil belum `VALID`.
- **BR-N15-07:** Hasil `VALID` tidak dapat dimutasi. Koreksi membuat versi baru melalui unvalidate/revision.
- **BR-N15-08:** Critical note wajib sebelum submit/validate; follow-up wajib hanya bila policy RS mengaktifkannya.
- **BR-N15-09:** Perubahan master/mapping berlaku untuk order baru dan tidak melakukan retroactive recalculation pada publication lama.
- **BR-N15-10:** Hasil LIS duplikat dideduplikasi menggunakan idempotency key/message version; update parsial tidak menimpa item yang tidak dikirim.
- **BR-N15-11:** Formula dihitung dari dependency pada versi hasil yang sama; perubahan dependency memicu hitung ulang dan klasifikasi ulang sebelum validasi.
- **BR-N15-12:** Publish ke consumer klinis hanya memakai publication `VALID`, kecuali kebijakan mengizinkan view non-final dengan badge/watermark eksplisit.
- **BR-N15-13:** Semua timestamp menggunakan server clock, disimpan UTC, dan ditampilkan sesuai zona waktu rumah sakit.
- **BR-N15-14:** Akses data, masking audit, dan retention mengikuti kebijakan keamanan serta rekam medis RS [PERLU KONFIRMASI].

### Matrix Hak Akses Minimum

| Aksi | Petugas Lab | Dokter Lab | User Override LIS | Auditor | DPJP/Unit |
|---|---:|---:|---:|---:|---:|
| Lihat detail | Ya | Ya | Ya | Sesuai scope | Ya, sesuai encounter |
| Input manual Draft/Revision | Ya | Configurable | Ya | Tidak | Tidak |
| Override LIS sebelum validasi | Tidak | Configurable | Ya | Tidak | Tidak |
| Submit validasi | Ya | Ya | Ya | Tidak | Tidak |
| Validasi | Tidak | Ya | Jika juga validator | Tidak | Tidak |
| Unvalidate/revise | Tidak | Permission khusus | Permission khusus | Tidak | Tidak |
| Cetak | Ya, sesuai status | Ya | Ya | Sesuai scope | Hasil valid |
| Lihat audit | Terbatas | Terbatas | Terbatas | Ya | Tidak |

## 9. Workflow / BPMN Interpretation

```text
Dokter membuat order
  → Petugas laboratorium mengonfirmasi order
  → [Gateway: sumber hasil]
      → LIS: layanan integrasi menerima hasil → validasi order/item mapping → deduplikasi → isi item bertanda LIS
      → Manual: petugas mengisi hasil sesuai tipe data
  → Sistem validasi tipe + pilih reference snapshot + klasifikasi realtime
  → [Gateway: hasil lengkap?]
      → Tidak: status PARTIAL/DRAFT, menunggu item lain
      → Ya: lanjut
  → [Gateway: ada Critical?]
      → Ya: tampilkan alert + wajibkan critical note (+ follow-up jika dikonfigurasi)
      → Tidak: lanjut
  → Submit WAITING_VALIDATION
  → Dokter laboratorium review
  → [Gateway: lolos guard validasi?]
      → Tidak: kembali DRAFT/REVISION dengan alasan
      → Ya: buat publication immutable VALID
  → Publikasi ke EMR/unit + cetak versi resmi
  → [Jika koreksi]: unvalidate/revise berizin → versi baru → validasi ulang
```

### Mitigasi Risiko yang Harus Diuji

| Skenario | Expected System Behavior |
|---|---|
| Hasil LIS diterima dua kali | Request kedua dengan idempotency key sama ditandai duplicate, tidak membuat nilai/versi baru. |
| Hasil LIS parsial | Hanya item dalam payload diperbarui; item lain tetap; agregat `PARTIAL`. |
| Koneksi LIS terputus | N15 tidak menghapus order/hasil; mekanisme retry berada pada integration service dan harus idempoten. |
| Tipe hasil tidak sesuai master | Simpan ditolak dengan field error spesifik dan audit error/correlation ID. |
| Nilai di luar batas alat | Warning muncul dan konfirmasi/alasan diterapkan sesuai policy. |
| Critical tanpa catatan | Submit/validate mengembalikan 422 dan menunjukkan semua item yang belum lengkap. |
| Edit setelah validasi | PATCH ditolak; user diarahkan ke unvalidate/revision bila berhak. |
| Mapping master berubah | Order/publication lama tetap menggunakan snapshot; perubahan hanya untuk order baru. |
| Dokter membuka hasil sebelum validasi | Badge/watermark `BELUM VALID` terlihat dan hasil tidak dianggap resmi. |
| Dua user menyunting item sama | Update dengan row version lama ditolak 409 dan tidak melakukan silent overwrite. |

## Pertanyaan Terbuka

- Apakah `REFERENCE_NOT_AVAILABLE` memblokir validasi atau cukup membutuhkan konfirmasi dokter laboratorium?
- Apakah tindak lanjut Critical wajib untuk semua RS atau configurable per rumah sakit/item?
- Apa batas minimum/maksimum catatan dan alasan yang disetujui SOP?
- Apakah satu order dapat divalidasi parsial per kelompok/item, atau validasi selalu satu agregat order?
- Siapa yang boleh melakukan unvalidasi, dan apakah perlu persetujuan kedua pada Phase 2?
- Apakah hasil non-final boleh dilihat DPJP/unit, atau hanya user laboratorium?
- Berapa jumlah maksimum item per order untuk target performance test?
- Format cetak, identitas TTE/QR provider, masa berlaku token, dan kebijakan cetak ulang seperti apa?
- Apa kebijakan ketika usia/jenis kelamin/metode/instrumen tidak memperoleh reference rule yang unik?
- Apakah notifikasi Critical memerlukan acknowledgement dan escalation timer pada Phase 2?

## Asumsi

- Integration service menyediakan hasil LIS yang sudah memiliki nomor order, kode item, message ID/idempotency key, dan timestamp; pembangunan konektornya bukan scope N15.
- Master Item Laboratorium menyediakan version/snapshot data yang cukup untuk menjaga histori.
- Validasi utama dilakukan per order/result set; validasi parsial per kelompok belum diasumsikan.
- Sistem RBAC mampu mendefinisikan permission granular yang direkomendasikan dalam PRD ini.

