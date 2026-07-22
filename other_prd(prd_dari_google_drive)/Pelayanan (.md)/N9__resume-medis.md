# PRD Pondasi — Resume Medis (N9)

> **Status kematangan:** FOUNDATION / CONCEPT DRAFT — cakupan jenis layanan dan field final belum diputuskan. Dokumen ini menetapkan aggregate, lifecycle, ownership, dan kontrak data minimum terlebih dahulu.

**Related Document:** `template.md`; `bahan_random/MedicalResume.vue`; Pendaftaran; D5 Ringkasan Pulang RJ; D6 List Dokumen EMR; G8 Casemix; PRD SPRI; G27 Resume Medis Sync  
**Versi:** 0.2 — Registration, DPJP, and Print Integration  
**Tanggal:** 2026-07-20

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|---|---|---|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa oleh | [PERLU KONFIRMASI] Komite Medis / Rekam Medis / Casemix | — |
| Disetujui oleh | [PERLU KONFIRMASI] Manajemen Rumah Sakit | — |

**Related Documents dan Status Sumber**

| Sumber (dibaca tanpa perubahan) | Fakta yang Digunakan |
|---|---|
| `other_prd.../Pelayanan (.md)/prd-data-pasien-ringkasan...md` (D5) | Ringkasan Pulang RJ bersifat satu kunjungan, compose/read-only, mengambil asesmen, diagnosis, tindakan, obat, status keluar, DPJP; guard kelengkapan asesmen. |
| `result/D6.../prd.md` | Dokumen EMR memiliki lifecycle Belum/Draft/Final, RBAC, lock final, addendum, cetak, dan audit. |
| G8 Casemix di `result` dan `other_prd...` | Resume final + TTD DPJP menjadi gerbang kelengkapan sebelum koding/klaim. |
| `other_prd.../Pelayanan (.md)/PRD-SPRI.md` | Dokter Pengirim harus tersedia untuk Resume Medis Rawat Inap. |
| `data/features-mvp.json` G27 | Ada kebutuhan `Resume Medis Sync` untuk SATUSEHAT. |
| `other_prd.../PRD Dashboard Pelayanan + INTEGRASI.md` | Resume medis menjadi sumber Composition/discharge summary untuk integrasi; transformasi/kirim dimiliki modul integrasi. |
| `other_prd.../Ringkasan Pulang Pasien-198332.pdf` | Lampiran bentuk dokumen; detail field final perlu review bersama stakeholder. |
| `bahan_random/MedicalResume.vue` | Acuan v1 untuk data personal, Jenis Penjamin, Tanggal Masuk, Dokter yang Merawat/DPJP, simpan, dan Print Resume Medis. |

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 2026-07-19 | 0.1 | Pondasi lifecycle dan model data resume medis; belum menetapkan template/field final seluruh tipe layanan. |
| 2026-07-20 | 0.2 | Menetapkan Pendaftaran sebagai sumber data personal, tipe penjamin, dan tanggal pendaftaran; menambahkan perubahan DPJP serta alur print mengikuti v1. |

## 2. Overview & Background

**Overview / Brief Summary**

N9 adalah dokumen klinis per episode yang merangkum pelayanan pasien dan menjadi sumber untuk cetak/arsip EMR, kelengkapan Casemix, serta integrasi SATUSEHAT. Karena konsep belum final, Phase 1 membangun fondasi umum yang dapat dipakai untuk Rawat Jalan, IGD, dan Rawat Inap tanpa memaksakan seluruh field sama.

Prinsip utamanya:

- Satu resume terkait satu `encounter_id`/episode dan memiliki tipe layanan.
- Data identitas dan sebagian data klinis di-compose dari sumber canonical, bukan diketik ulang.
- Data personal, tipe penjamin, dan tanggal pendaftaran diambil dari Pendaftaran berdasarkan encounter aktif.
- Dokter yang merawat ditampilkan dan user berwenang dapat mengganti DPJP utama dengan audit perubahan.
- DPJP melengkapi narasi/field yang memang menjadi tanggung jawab resume.
- Resume melalui DRAFT → FINAL; FINAL terkunci, koreksi melalui addendum/versioning.
- Finalisasi dan autentikasi DPJP diekspos sebagai status terstruktur untuk Casemix.
- N9 menyiapkan data “ready to consume”; transformasi/pengiriman SATUSEHAT dimiliki G27.

**Business Process (As-Is vs To-Be)**

**As-Is:** [ASUMSI]

- Data ringkasan dikumpulkan manual dari asesmen, CPPT, diagnosis, tindakan, hasil penunjang, dan resep.
- Format/finalisasi dapat berbeda antar-unit; kelengkapan baru diketahui saat pasien pulang atau pemberkasan klaim.
- Perubahan setelah tanda tangan sulit ditelusuri bila tidak ada versi/addendum.

**To-Be — Pondasi:**

- Resume dibuat dari konteks episode dan menarik data sumber dengan provenance.
- Sistem menunjukkan kelengkapan dan membedakan data sumber, data editable, serta snapshot final.
- DPJP finalisasi; sistem mengunci versi, mencatat audit, dan menerbitkan status untuk D6/G8/G27.
- Koreksi setelah final tidak menimpa dokumen asli.

## 3. Goals & Metrics

| No | Metrics | Success Criteria Pondasi |
|---|---|---|
| 1 | Episode linkage | 100% resume memiliki patient, encounter, service type, dan DPJP. |
| 2 | Integritas sumber | 100% field hasil compose menyimpan sumber/provenance atau snapshot versi final. |
| 3 | Finalisasi | 100% resume FINAL mencatat DPJP, waktu final, dan metode autentikasi. |
| 4 | Casemix readiness | G8 dapat membaca status final/autentikasi secara terstruktur tanpa unggah ulang bila dokumen berasal dari N9. |
| 5 | Audit/versioning | 0 perubahan diam-diam pada versi FINAL; seluruh koreksi melalui addendum/version baru. |
| 6 | Interoperability readiness | 100% resume FINAL memiliki identifier dan status sinkronisasi untuk G27. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — Foundation | Phase 2 — Setelah Validasi Klinis |
|---|---|---|
| Worklist | Resume per episode, status, kelengkapan, DPJP | SLA menjelang pulang, notifikasi/escalation |
| Compose data | Identitas, encounter, diagnosis, tindakan, obat, hasil penting, DPJP | Rules per spesialisasi/layanan, auto-summary lanjutan |
| Data Pendaftaran | Data personal, tipe penjamin, tanggal pendaftaran read-only | Rekonsiliasi perubahan penjamin lintas episode |
| Dokter | Tampilkan dokter yang merawat dan ubah DPJP utama oleh role berwenang | Co-sign/multi-DPJP lanjutan |
| Form | Section schema generik + field minimum | Template spesifik RJ/IGD/RI dan spesialisasi |
| Lifecycle | DRAFT, READY_TO_FINALIZE, FINAL, AMENDED/CANCELLED | Approval/co-sign multi-dokter |
| Finalisasi | Konfirmasi DPJP dan lock | TTE tersertifikasi/QR tervalidasi |
| Output | Preview dan print Resume Medis setelah data tersimpan, tanpa perubahan yang belum disimpan | Template builder/varian RS |
| Casemix | Expose final status/document reference | Checklist/notification dua arah |
| SATUSEHAT | Siapkan canonical data + sync status | Transformasi/kirim oleh G27, retry/reconciliation |

**Out of Scope Phase 1**

- Menyamakan semua field RJ, IGD, dan RI sebelum workshop klinis.
- Diagnosis/prosedur baru yang hanya hidup di resume; sumber canonical tetap modul diagnosis/tindakan.
- Koding klaim dan grouping (milik G8).
- Transformasi/POST FHIR (milik G27/integration layer).
- TTE tersertifikasi, co-sign, template builder, dan AI summarization.

## 5. Related Features

| Modul | Relasi Pondasi |
|---|---|
| D6 List Dokumen EMR | Entry point dan status dokumen; N9 muncul sebagai Draft/Final/Addendum. |
| D5 Ringkasan Pulang RJ | Referensi capability RJ; perlu keputusan apakah D5 menjadi view/output N9 atau tetap dokumen terpisah. |
| Asesmen/CPPT | Sumber anamnesis, pemeriksaan, perjalanan klinis, dan kondisi pasien. |
| Master Diagnosis/Procedure | Sumber kode diagnosis/tindakan; N9 menyimpan reference+snapshot. |
| Farmasi | Sumber obat selama perawatan dan obat pulang. |
| Lab/Radiologi/Penunjang | Sumber hasil penting yang dipilih/diringkas. |
| SPRI/Rawat Inap | Sumber Dokter Pengirim dan konteks admisi RI. |
| Pendaftaran | Sumber canonical data personal, tipe penjamin, `registered_at`/tanggal pendaftaran, serta identitas encounter. |
| G8 Casemix | Consumer resume FINAL + autentikasi DPJP sebagai guard kelengkapan. |
| G27 SATUSEHAT | Consumer data resume ready-to-consume; memiliki ownership transformasi/kirim. |
| N4 Profil RS | Header identitas RS pada output PDF. |
| A53 RBAC | Hak create/edit/finalize/view/print/addendum. |

## 6. Business Process & User Stories

**State Machine Table — Usulan Pondasi**

| Status | Deskripsi | Efek | Transisi Phase 1 | Phase 2 |
|---|---|---|---|---|
| DRAFT | Resume dibuat/diisi | Editable role berwenang | → READY_TO_FINALIZE/CANCELLED | Co-author |
| READY_TO_FINALIZE | Field minimum lengkap | Menunggu DPJP | → FINAL/DRAFT | Reminder/escalation |
| FINAL | Disahkan DPJP | Locked; tersedia bagi G8/G27/cetak | → AMENDED | TTE/co-sign |
| AMENDED | Versi final baru dengan referensi versi sebelumnya | Versi lama tetap immutable | → FINAL (versi baru) | Approval addendum |
| CANCELLED | Draft dibatalkan karena salah konteks/duplikat | Tidak menjadi dokumen klinis final | Terminal | Reopen approval |

**User Stories Utama**

- **US-N9-01:** Sebagai DPJP, saya ingin membuka resume per episode dengan data terisi dari sumber agar tidak menyalin ulang.
- **US-N9-02:** Sebagai DPJP, saya ingin melengkapi ringkasan perjalanan, kondisi pulang, terapi, dan rencana tindak lanjut.
- **US-N9-03:** Sebagai DPJP, saya ingin memeriksa kelengkapan lalu finalisasi agar dokumen sah dan terkunci.
- **US-N9-04:** Sebagai Rekam Medis, saya ingin melihat status, versi, dan audit resume.
- **US-N9-05:** Sebagai Casemix, saya ingin memperoleh resume final dan status autentikasi secara otomatis.
- **US-N9-06:** Sebagai Integration Service, saya ingin membaca data final yang stabil untuk sinkronisasi SATUSEHAT.
- **US-N9-07:** Sebagai DPJP, saya ingin membuat addendum tanpa menghapus versi asli.
- **US-N9-08:** Sebagai user berwenang, saya ingin mengganti DPJP utama tanpa menghilangkan histori dokter yang merawat.
- **US-N9-09:** Sebagai petugas, saya ingin mencetak versi Resume Medis yang sudah tersimpan agar hasil cetak konsisten dengan data sistem.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-N9-01 — Worklist Resume per Episode**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** List menampilkan patient, No. RM, encounter, tipe layanan, unit, DPJP, tanggal masuk/pulang, status resume, dan kelengkapan.
  - **AC 2:** Filter mendukung tipe layanan, unit, DPJP, status, tanggal; pencarian nama/No. RM/encounter.
  - **AC 3:** Satu tipe resume hanya memiliki satu aggregate aktif per encounter; versi/addendum berada di bawah aggregate yang sama.

**Fitur: FR-N9-02 — Create dan Compose Data Sumber**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Create memerlukan patient, encounter, service type, dan DPJP yang valid.
  - **AC 2:** Sistem mengambil data personal dari Pendaftaran berdasarkan `encounter_id`/`id_registration`, minimal No. RM, nama, jenis kelamin, tanggal lahir/umur, agama, pekerjaan, alamat, dan nomor telepon.
  - **AC 3:** Sistem mengambil tipe/jenis penjamin dan tanggal pendaftaran (`registered_at`) dari record Pendaftaran pada encounter yang sama; field ditampilkan read-only.
  - **AC 4:** Sistem menarik diagnosis, tindakan, obat, hasil penunjang relevan, alergi, dan staff dari modul canonical yang tersedia.
  - **AC 5:** Data gagal ditarik ditandai per section; tidak dianggap kosong secara diam-diam.
  - **AC 6:** Re-sync diperbolehkan pada DRAFT; sistem menampilkan perbedaan dan tidak menimpa input manual tanpa konfirmasi.
  - **AC 7:** Setiap section menyimpan provenance/source updated time.

**Fitur: FR-N9-02A — Dokter yang Merawat dan Perubahan DPJP**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Sistem menampilkan seluruh Dokter yang Merawat dari data episode/rawat inap, dengan DPJP utama ditandai secara jelas.
  - **AC 2:** User dengan hak akses dapat memilih dokter aktif sebagai DPJP utama pengganti dari master staff role Dokter.
  - **AC 3:** Perubahan DPJP tidak menghapus daftar dokter yang pernah merawat dan tidak mengubah data Pendaftaran secara diam-diam.
  - **AC 4:** Sistem mencatat DPJP lama, DPJP baru, alasan perubahan, aktor, role, dan waktu pada audit log.
  - **AC 5:** DPJP tidak dapat diubah setelah resume FINAL; perubahan memerlukan addendum atau pembukaan workflow resmi [PERLU KONFIRMASI].
  - **AC 6:** Hanya DPJP utama terbaru yang digunakan untuk validasi kewenangan finalisasi dan ditampilkan sebagai DPJP utama pada hasil print.

**Fitur: FR-N9-03 — Section Minimum Resume**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Schema mendukung minimal: identitas/episode, indikasi/keluhan masuk, ringkasan perjalanan, diagnosis utama/sekunder, prosedur/tindakan, terapi/obat, hasil penting, kondisi/status keluar, instruksi/obat pulang, rencana kontrol, dan DPJP.
  - **AC 2:** Field wajib per service type dikonfigurasi, bukan di-hardcode satu aturan untuk semua layanan.
  - **AC 3:** Diagnosis dan tindakan mereferensikan master/record canonical serta menyimpan snapshot kode/deskripsi pada FINAL.
  - **AC 4:** Dokter Pengirim tersedia untuk tipe Rawat Inap bila berasal dari SPRI.

**Fitur: FR-N9-04 — Validasi dan Finalisasi DPJP**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** READY_TO_FINALIZE hanya tercapai jika seluruh field minimum konfigurasi service type terpenuhi.
  - **AC 2:** Hanya DPJP atau role pengganti resmi [PERLU KONFIRMASI] dapat finalisasi.
  - **AC 3:** Finalisasi mencatat `finalized_by`, `finalized_at`, role, dan authentication method.
  - **AC 4:** FINAL immutable; API update biasa mengembalikan HTTP 409.
  - **AC 5:** Event `medical_resume.finalized` diterbitkan idempotent untuk D6/G8/G27.

**Fitur: FR-N9-05 — View, PDF, dan Audit**

- **Prioritas:** P1
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Tombol Print tersedia mengikuti pola v1 dan hanya aktif ketika resume sudah memiliki data tersimpan serta tidak ada perubahan form yang belum disimpan.
  - **AC 2:** Saat Print dipilih, sistem mengambil konfigurasi header/tanda tangan, membentuk preview/PDF Resume Medis, lalu membuka dialog print.
  - **AC 3:** Hasil print memuat data personal, tipe penjamin, tanggal pendaftaran/masuk, tanggal keluar bila ada, dokter yang merawat, DPJP utama terbaru, isi klinis, keadaan keluar, identifier resume, versi, dan autentikasi.
  - **AC 4:** Print menggunakan snapshot tersimpan/final; perubahan form yang belum disimpan tidak boleh ikut tercetak.
  - **AC 5:** Akses, edit, perubahan DPJP, finalisasi, cetak, dan unduh dicatat append-only.
  - **AC 6:** Kebijakan apakah PDF diarsipkan atau dirender ulang ditandai [PERLU KONFIRMASI]; snapshot data FINAL tetap disimpan.

**Fitur: FR-N9-06 — Addendum/Versioning**

- **Prioritas:** P1
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Koreksi FINAL membuat versi/addendum baru dengan alasan wajib dan referensi versi sebelumnya.
  - **AC 2:** Versi sebelumnya tetap dapat dibaca dan tidak dapat dihapus.
  - **AC 3:** G8/G27 menerima event versi terbaru tanpa kehilangan identifier/riwayat lama.

**Fitur: FR-N9-07 — Kontrak Casemix dan SATUSEHAT**

- **Prioritas:** P1
- **Fase:** Phase 1 Foundation (kontrak/readiness)
- **Acceptance Criteria:**
  - **AC 1:** G8 dapat membaca `status=FINAL`, DPJP, authentication status, version, dan document reference.
  - **AC 2:** N9 menyediakan canonical JSON/snapshot final untuk G27; N9 tidak memanggil endpoint SATUSEHAT langsung.
  - **AC 3:** N9 menyimpan status sinkronisasi yang dikembalikan G27 (`NOT_QUEUED/QUEUED/SENT/FAILED`) tanpa menjadikannya syarat finalisasi klinis.

**Fitur: FR-N9-08 — Approval/Co-sign/TTE**

- **Prioritas:** P2
- **Fase:** Phase 2
- **Acceptance Criteria:**
  - **AC 1:** Workflow dapat memerlukan co-sign/approval sesuai service type.
  - **AC 2:** Integrasi TTE menyimpan signature reference, certificate metadata, dan verification status tanpa mengubah snapshot klinis.

**Validasi — Wording Frontend Pondasi**

| Field/Section | Tipe | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Encounter | Context | Required, valid | “Episode pelayanan tidak valid” | “Resume dibuat untuk satu episode pelayanan” |
| DPJP Utama | Lookup | Required; default dari episode; perubahan hanya role berwenang dan alasan wajib | “DPJP wajib tersedia” | “Perubahan DPJP akan dicatat pada audit” |
| Ringkasan Perjalanan | Textarea | Conditional required, max [PERLU KONFIRMASI] | “Ringkasan perjalanan wajib diisi” | “Ringkas perjalanan klinis selama episode” |
| Diagnosis Utama | Reference | Required saat final | “Diagnosis utama wajib tersedia” | “Perbaiki pada modul diagnosis jika tidak sesuai” |
| Kondisi/Status Keluar | Select | Required saat final | “Status keluar wajib dipilih” | “Gunakan nilai sesuai tipe pelayanan” |
| Rencana Tindak Lanjut | Text/structured | Required sesuai status | “Rencana tindak lanjut wajib diisi” | “Kontrol, rujukan, atau instruksi lanjutan” |
| Alasan Addendum | Textarea | Required untuk koreksi FINAL | “Alasan addendum wajib diisi” | “Dokumen final lama tidak akan ditimpa” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `medical_resumes`**

- `id`: UUID, PK
- `resume_number`: VARCHAR(50), unique
- `patient_id`, `encounter_id`: UUID, required
- registration snapshot: `medical_record_no`, `patient_name`, `sex`, `birth_date`, `religion`, `occupation`, `address`, `phone_number`
- `guarantor_type_id`, `guarantor_type_name`: reference + snapshot dari Pendaftaran
- `registered_at`: TIMESTAMP, required; tanggal pendaftaran/masuk dari Pendaftaran
- `service_type`: ENUM(`OUTPATIENT`,`EMERGENCY`,`INPATIENT`,`OTHER`)
- `template_schema_id`: UUID/version, required
- `attending_practitioner_id`: UUID, required
- `referring_practitioner_id`: UUID, nullable
- `status`: ENUM(`DRAFT`,`READY_TO_FINALIZE`,`FINAL`,`AMENDED`,`CANCELLED`)
- `current_version_id`: UUID, nullable
- `completeness_percent`: DECIMAL, derived
- `finalized_by`, `finalized_at`, `authentication_method`, `authentication_status`
- `integration_sync_status`: ENUM(`NOT_QUEUED`,`QUEUED`,`SENT`,`FAILED`)
- `status_approval`, `role_approver`: Phase 2 ready
- audit/soft-delete columns
- Unique logical constraint `(encounter_id, service_type)` untuk aggregate aktif [PERLU KONFIRMASI multi-resume].

**Table: `medical_resume_versions`**

- `id`, `medical_resume_id`, `version_number`, `previous_version_id`
- `content_json`: JSONB — snapshot final/draft sesuai schema
- `source_provenance_json`: JSONB — IDs dan timestamp sumber
- `change_reason`: TEXT, nullable
- `is_final`: BOOLEAN
- `created_by`, `created_at`, `finalized_by`, `finalized_at`
- Unique `(medical_resume_id, version_number)`.

**Table: `medical_resume_audit_logs`**

- `id`, `medical_resume_id`, `version_id`, `action`, `actor_id`, `role`, `metadata_json`, `created_at`; append-only.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/medical-resumes` | Worklist/filter |
| GET | `/api/v1/medical-resumes/{id}` | Detail + current version |
| POST | `/api/v1/medical-resumes` | Create/reuse DRAFT per encounter |
| PUT | `/api/v1/medical-resumes/{id}/draft` | Simpan draft |
| POST | `/api/v1/medical-resumes/{id}/sync-sources` | Tarik/compare sumber canonical |
| GET | `/api/v1/medical-resumes/{id}/registration-context` | Ambil data personal, tipe penjamin, dan tanggal pendaftaran read-only |
| PUT | `/api/v1/medical-resumes/{id}/primary-dpjp` | Ubah DPJP utama dengan alasan dan audit |
| GET | `/api/v1/medical-resumes/{id}/completeness` | Hasil validasi section wajib |
| POST | `/api/v1/medical-resumes/{id}/ready` | Tandai siap finalisasi |
| POST | `/api/v1/medical-resumes/{id}/finalize` | Finalisasi DPJP, lock, publish event |
| POST | `/api/v1/medical-resumes/{id}/addenda` | Buat versi koreksi |
| GET | `/api/v1/medical-resumes/{id}/versions` | Riwayat versi |
| GET | `/api/v1/medical-resumes/{id}/pdf` | Render/ambil PDF |
| POST | `/api/v1/medical-resumes/{id}/print-events` | Catat audit print setelah dokumen berhasil disiapkan |
| GET | `/api/v1/medical-resumes/{id}/integration-payload` | Canonical snapshot untuk G27 |

### 8.3 Data & Business Rules

#### 8.3.1 Section Data Minimum

| Section | Sumber Utama | Mode | Wajib Final |
|---|---|---|---|
| Data personal | Pendaftaran/Patient | Read-only snapshot | Ya |
| Tipe penjamin | Pendaftaran encounter | Read-only reference + snapshot | Ya |
| Tanggal pendaftaran/masuk | Pendaftaran `registered_at` | Read-only datetime | Ya |
| DPJP/Dokter Pengirim | Encounter/SPRI | Read-only/reference | DPJP ya; pengirim khusus RI |
| Dokter yang merawat | Episode/Rawat Inap | List reference; DPJP utama dapat diubah oleh role berwenang | Ya |
| Alasan masuk/keluhan | Asesmen + resume | Compose/edit terbatas | Per service type |
| Perjalanan klinis | CPPT/asesmen + DPJP | Editable DPJP | Ya [ASUMSI] |
| Diagnosis | Modul diagnosis | Reference + snapshot | Utama ya |
| Tindakan/prosedur | Modul tindakan | Reference + snapshot | Jika ada |
| Obat/terapi | Farmasi + DPJP | Compose/reference | Per service type |
| Hasil penting | Penunjang | Reference/selection | Jika relevan |
| Kondisi/status keluar | Discharge | Structured | Ya |
| Instruksi/rencana kontrol | DPJP | Structured/text | Conditional |
| Autentikasi | Session/TTE | System | Ya |

#### 8.3.2 Worklist

| Kolom | Sumber | Filter/Sort | Catatan |
|---|---|---|---|
| Pasien | snapshot/master | Search | Nama + No. RM |
| Episode | encounter | Search | Tipe/unit/tanggal |
| DPJP | staff | Filter | — |
| Status Resume | status | Filter | Draft/Ready/Final |
| Kelengkapan | derived | Sort | Persen + missing count |
| Finalisasi | finalized_at/by | Range | — |
| Casemix | derived consumer status | Filter | Opsional display |
| SATUSEHAT | integration_sync_status | Filter | Status dari G27 |

**Business Rules**

- **BR-N9-01:** Satu resume adalah satu episode; resume bukan ringkasan longitudinal lintas kunjungan.
- **BR-N9-02:** Data canonical diperbaiki di modul sumber; N9 menyimpan reference/provenance dan snapshot final.
- **BR-N9-03:** Wajib field ditentukan per service type/template version.
- **BR-N9-04:** Hanya DPJP/role resmi dapat finalisasi; FINAL immutable.
- **BR-N9-05:** Addendum tidak menghapus atau menimpa versi final sebelumnya.
- **BR-N9-06:** G8 mengonsumsi status final/autentikasi; tidak menjadi owner isi resume.
- **BR-N9-07:** G27 menjadi owner transformasi/pengiriman SATUSEHAT; kegagalan sync tidak membatalkan FINAL klinis.
- **BR-N9-08:** D5 dan N9 tidak boleh menghasilkan dua dokumen final yang bertentangan untuk episode yang sama; hubungan keduanya harus diputuskan sebelum implementasi.
- **BR-N9-09:** Data personal, tipe penjamin, dan tanggal pendaftaran berasal dari record Pendaftaran untuk `encounter_id` yang sama; N9 tidak menyediakan edit langsung terhadap data tersebut.
- **BR-N9-10:** Perubahan DPJP wajib beralasan dan diaudit; daftar dokter yang pernah merawat tetap dipertahankan sebagai histori.
- **BR-N9-11:** Print hanya menggunakan versi tersimpan dan harus diblokir ketika terdapat perubahan yang belum disimpan.
- **BR-N9-12:** Jika keadaan keluar `MENINGGAL`, Resume Medis dan referensi Surat Kematian menjadi sumber eligibility dropdown pasien pada N8 Pemulasaraan Jenazah.

## 9. Workflow / BPMN Interpretation

> BPMN N9 belum tersedia. Alur berikut adalah fondasi lifecycle dokumen EMR.

1. Episode tersedia; user membuka N9 dari D6/worklist/discharge.
2. Sistem membuat/reuse DRAFT dan menarik data personal, tipe penjamin, tanggal pendaftaran, dokter yang merawat, serta data klinis beserta provenance.
3. User berwenang dapat mengganti DPJP utama dengan alasan; sistem menyimpan histori perubahan.
4. DPJP meninjau, melengkapi section editable, dan memperbaiki data canonical melalui modul sumber bila perlu.
5. Sistem menghitung kelengkapan berdasarkan template service type.
6. Data disimpan; tombol Print aktif ketika tidak ada perubahan yang belum disimpan.
7. Lengkap → READY_TO_FINALIZE; DPJP mengonfirmasi finalisasi.
8. Sistem membuat snapshot versi FINAL, mengunci versi, mencatat audit, dan menerbitkan event.
9. D6 menampilkan FINAL; G8 membaca status/autentikasi; G27 mengantrekan sinkronisasi. Jika keadaan MENINGGAL dan Surat Kematian tersedia, N8 dapat menampilkan pasien pada dropdown.
10. Koreksi → addendum/version baru; versi lama tetap tersedia.

## Asumsi

- [ASUMSI] N9 menjadi aggregate umum untuk RJ/IGD/RI dengan template berbeda.
- [ASUMSI] Resume Final + autentikasi DPJP menjadi sumber canonical bagi Casemix.
- [ASUMSI] N9 menyimpan snapshot final walaupun PDF dapat dirender ulang.
- [ASUMSI] D5 dapat menjadi output/view RJ dari aggregate N9, tetapi keputusan final masih terbuka.

## Pertanyaan Terbuka Prioritas

- Apakah N9 mencakup RJ, IGD, dan RI atau hanya Resume Medis Rawat Inap?
- Apakah D5 Ringkasan Pulang RJ menjadi bagian/output N9 atau tetap dokumen terpisah?
- Daftar field wajib final per tipe layanan dan sumber canonical setiap field apa saja?
- Siapa boleh membuat, mengedit, finalisasi, dan addendum? Apakah dokter pengganti boleh finalisasi?
- Apakah TTE wajib pada MVP atau cukup autentikasi user + area TTD basah?
- Apakah PDF final harus diarsipkan atau cukup snapshot JSON + render deterministik?
- Kapan resume wajib final terhadap proses pulang dan apakah memblokir discharge?
- Bagaimana G8 mengetahui pembatalan/addendum setelah klaim diproses?
- Mapping final G27/SATUSEHAT dan status retry/reconciliation seperti apa?
