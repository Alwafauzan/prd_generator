# PRD Pondasi — Dashboard Permintaan Darah (N11)

> **Definisi internal:** Dashboard = **operational worklist/list permintaan darah**, bukan KPI/grafik.  
> **Status:** FOUNDATION DRAFT v0.1.

**Sumber:** `template.md`; `data/features-mvp.json` E5/F31/F32; PRD Tindakan & BHP; Billing G2.  
**Tanggal:** 2026-07-19

## 1. Metadata Dokumen

| Approval | Nama/Jabatan | Tanggal |
|---|---|---|
| Disiapkan | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa/Disetujui | [PERLU KONFIRMASI] Bank Darah/Transfusi/Manajemen | — |

| Versi | Deskripsi |
|---|---|
| 0.1 | Pondasi worklist E5, konfirmasi F31, dan input hasil F32. |

Referensi `other_prd(prd_dari_google_drive)` dibaca tanpa perubahan.

## 2. Overview & Background

N11 menampilkan list permintaan darah dari berbagai unit layanan. Baris dapat dibuka untuk melihat detail dan menjalankan proses bila role berwenang. Berdasarkan sumber, pondasi mencakup order E5, konfirmasi permintaan transfusi F31, dan input hasil pemeriksaan F32. Detail medis seperti compatibility/crossmatch, stok komponen, reaksi transfusi, dan komunikasi dengan lab belum cukup pasti sehingga disiapkan sebagai extension point.

**As-Is:** [ASUMSI] permintaan, konfirmasi, pemeriksaan, dan progres pemenuhan tersebar/manual.  
**To-Be:** seluruh permintaan muncul satu kali pada worklist; petugas filter prioritas/status, membuka detail, mengonfirmasi/menolak, mencatat hasil minimum, mengubah progres, dan menyimpan histori.

## 3. Goals & Metrics

| Metrics | Target Pondasi |
|---|---|
| Kelengkapan worklist | 100% E5 valid muncul sekali. |
| Traceability | 100% perubahan status diaudit. |
| Prioritas | 100% permintaan urgent/emergency terlihat jelas. |
| Patient safety | 0 proses tanpa patient/encounter dan jenis/komponen yang dapat diidentifikasi. |
| Billing-ready | Charge memiliki source request/item dan idempotency key. |

## 4. Scope Definition & Phasing

| Fitur | Phase 1 Foundation | Phase 2 |
|---|---|---|
| Worklist | List/filter/detail/status | KPI stok/TAT/grafik |
| Konfirmasi | Accept/reject/cancel | Approval/escalation |
| Pemeriksaan | Status dan hasil minimum configurable | Crossmatch lengkap/analyzer |
| Pemenuhan | Requested→Confirmed→Processing→Ready→Completed | Reservation/issue stok komponen |
| Reaksi transfusi | Placeholder/reference | Workflow notifikasi lab/PPI/hemovigilance |

**Out of Scope:** keputusan klinis indikasi transfusi, inventory kantong/komponen penuh, donor, distribusi antar-RS, crossmatch detail, bedside administration, dan reaksi transfusi final sampai SOP disepakati.

## 5. Related Features

| Modul | Relasi |
|---|---|
| E5 Order Permintaan Darah | Publisher permintaan. |
| F31 | Konfirmasi permintaan. |
| F32 | Input hasil pemeriksaan; sumber menyebut alur informasi reaksi transfusi ke lab sebagai pengembangan. |
| Master Pasien/Encounter | Identitas canonical. |
| Staff/Unit | Requester, petugas, unit peminta. |
| Billing G2 | Consumer charge Bank Darah. |
| Lab/EMR | Kandidat consumer/provider hasil dan reaksi. |

## 6. Business Process & User Stories

| Status Usulan | Deskripsi | Transisi |
|---|---|---|
| REQUESTED | Permintaan diterima | → CONFIRMED/REJECTED/CANCELLED |
| CONFIRMED | Diterima unit darah | → IN_PROCESS/CANCELLED |
| IN_PROCESS | Pemeriksaan/persiapan berlangsung | → READY/CANCELLED |
| READY | Siap diserahkan/dilanjutkan | → COMPLETED |
| COMPLETED | Proses unit selesai | Terminal |
| REJECTED/CANCELLED | Ditolak/dibatalkan beralasan | Terminal |

- Petugas melihat dan memprioritaskan permintaan.
- Petugas membuka detail pasien, indikasi, komponen, jumlah, requester.
- Petugas mengonfirmasi/menolak dan mencatat hasil proses.
- Unit peminta memantau status tanpa menghubungi manual.
- Auditor melihat histori status dan aktor.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**FR-N11-01 — Worklist (P0)**

- E5 valid muncul sekali berdasarkan `request_id`.
- Kolom: waktu/no. permintaan, pasien/No. RM, unit, dokter peminta, jenis/komponen, jumlah, golongan darah bila tersedia, prioritas, status, update, aksi.
- Search No. permintaan/MR/nama; filter tanggal, unit, prioritas, komponen, status; pagination server-side.
- Klik baris membuka detail; data klinis sensitif mengikuti RBAC.

**FR-N11-02 — Detail dan Konfirmasi (P0)**

- Detail memuat patient/encounter, indikasi/diagnosis reference, request items, jumlah, prioritas, catatan, requester, status log.
- Confirm hanya dari REQUESTED; reject/cancel wajib alasan dan tidak menghapus histori.
- Backend memvalidasi status terbaru untuk mencegah double process.

**FR-N11-03 — Pemeriksaan dan Progres (P0 Foundation)**

- Sistem menyediakan hasil pemeriksaan berbasis schema/configuration tanpa menetapkan field crossmatch final.
- Aktivitas pertama mengubah CONFIRMED→IN_PROCESS.
- READY/COMPLETED memerlukan semua item memenuhi guard yang dikonfigurasi.
- Hasil final terkunci dan versioned.

**FR-N11-04 — Riwayat dan Audit (P0)**

- Completed/rejected/cancelled tersedia pada riwayat.
- Semua view sensitif, perubahan status, hasil, dan cetak dicatat append-only.

**FR-N11-05 — Reaksi Transfusi (P2)**

- Event reaksi dapat mereferensikan request/komponen/patient dan menginformasikan laboratorium; workflow final menunggu SOP.

**Validasi**

| Field | Rules | Pesan |
|---|---|---|
| Prioritas | Required enum | “Prioritas permintaan wajib dipilih” |
| Komponen & jumlah | Required, qty > 0 | “Komponen dan jumlah darah wajib valid” |
| Alasan reject/cancel | Required min 5 | “Alasan wajib diisi” |
| Hasil wajib | Configurable | “Pemeriksaan wajib belum lengkap” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**`blood_requests`**: id, source_request_id unique, patient/encounter/unit/requester, indication snapshot/reference, blood type snapshot nullable, priority, status, timestamps, cancellation/rejection reason, billing sync, audit.  
**`blood_request_items`**: request_id, component code/name snapshot, quantity requested/fulfilled, status.  
**`blood_request_tests`**: request/item, test schema/code, value/result/status, version, entered/verified fields.  
**`blood_request_status_logs`**: append-only.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/blood-requests/worklist` | List/filter |
| GET | `/api/v1/blood-requests/{id}` | Detail |
| POST | `/api/v1/blood-requests/{id}/confirm` | Confirm |
| POST | `/api/v1/blood-requests/{id}/reject` | Reject |
| POST | `/api/v1/blood-requests/{id}/start` | Mulai proses |
| PUT | `/api/v1/blood-requests/{id}/tests` | Simpan hasil |
| POST | `/api/v1/blood-requests/{id}/ready` | Siap |
| POST | `/api/v1/blood-requests/{id}/complete` | Selesai |
| POST | `/api/v1/blood-requests/{id}/cancel` | Batal |

### 8.3 Data & Business Rules

- **BR-N11-01:** Dashboard berarti worklist, bukan analitik.
- **BR-N11-02:** Satu source request satu aggregate; komponen berada pada detail.
- **BR-N11-03:** N11 tidak mengubah master pasien/golongan darah tanpa workflow berwenang.
- **BR-N11-04:** Status/hasiI hanya melalui aksi valid dan diaudit.
- **BR-N11-05:** Detail compatibility, inventory reservation, bedside transfusion, dan reaction workflow belum dianggap final.

## 9. Workflow / BPMN Interpretation

`Order E5 → Worklist N11 → Detail → Confirm/Reject → Examination/Preparation → Ready → Complete → EMR/Billing/History`

## Pertanyaan Terbuka

- Apakah N11 milik Bank Darah atau Transfusi Darah dan siapa role operatornya?
- Komponen, jumlah, golongan, rhesus, indikasi, dan urgency minimum apa saja?
- Tahapan crossmatch/compatibility dan siapa verifier-nya?
- Apakah N11 mengelola stok/reservasi/issue kantong atau hanya permintaan?
- Kapan billing terbentuk/void?
- Bagaimana alur reaksi transfusi dan notifikasi ke lab/PPI/dokter?

