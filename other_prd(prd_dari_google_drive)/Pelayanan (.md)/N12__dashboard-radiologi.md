# PRD Pondasi — Dashboard Radiologi (N12)

> **Definisi internal:** Dashboard = **operational worklist/list order radiologi**, bukan dashboard KPI/grafik.  
> **Status:** FOUNDATION DRAFT v0.1.

**Sumber:** `template.md`; `data/features-mvp.json` E4/F4/F5/F6; PRD Pendaftaran Radiologi; Master Item Pemeriksaan Radiologi A29; Billing G2; PRD Tindakan & BHP.  
**Tanggal:** 2026-07-19

## 1. Metadata Dokumen

| Approval | Nama/Jabatan | Tanggal |
|---|---|---|
| Disiapkan | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa/Disetujui | [PERLU KONFIRMASI] Kepala Radiologi/Manajemen | — |

| Versi | Deskripsi |
|---|---|
| 0.1 | Pondasi worklist order, konfirmasi, imaging flag, expertise, history comparison. |

Referensi `other_prd(prd_dari_google_drive)` dibaca tanpa perubahan.

## 2. Overview & Background

N12 adalah halaman awal operasional Radiologi berupa list order dari E4/pendaftaran radiologi. Petugas dapat mencari/filter, melihat status, membuka detail, dan menjalankan proses sesuai kewenangan. Sumber menetapkan capability konfirmasi order (F4), input hasil/expertise dengan flag imaging tersedia dan template per jenis pemeriksaan (F5), serta perbandingan dua hasil historis (F6).

**As-Is:** [ASUMSI] daftar order, status imaging, dan expertise belum terpusat/seragam.  
**To-Be:** order muncul idempotent; worklist menunjukkan pasien, pemeriksaan, prioritas, status imaging/expertise; detail mengelola konfirmasi sampai selesai; riwayat mendukung view dan perbandingan hasil.

## 3. Goals & Metrics

| Metrics | Target Pondasi |
|---|---|
| Kelengkapan order | 100% E4 valid muncul sekali. |
| Status imaging/expertise | 100% order menampilkan status keduanya secara terpisah. |
| Traceability | 100% perubahan status/expertise diaudit. |
| Search performance | p95 < 2 detik per 50 baris. [ASUMSI] |
| Billing-ready | Setiap charge memiliki provenance order/item. |

## 4. Scope Definition & Phasing

| Fitur | Phase 1 Foundation | Phase 2 |
|---|---|---|
| Worklist | List/filter/detail/status | KPI/TAT/modality utilization/grafik |
| Konfirmasi | Confirm/cancel | Scheduling/escalation |
| Imaging | Flag belum/tersedia + reference opsional | RIS/PACS/DICOM integration |
| Expertise | Draft/final text menggunakan template reference | TTE, approval/co-sign, speech recognition |
| History | View histori dan pilih dua hasil | Side-by-side image viewer/PACS comparison |

**Out of Scope:** analytics, modality scheduling lengkap, DICOM worklist/PACS viewer, contrast safety workflow, template final per pemeriksaan, dan TTE sebelum workshop.

## 5. Related Features

| Modul | Relasi |
|---|---|
| E4 Order Radiologi | Publisher order. |
| F4/F5/F6 | Konfirmasi, expertise/imaging flag, perbandingan hasil. |
| A29 Master Item Radiologi | Item pemeriksaan dan mapping terminology. |
| Pendaftaran Radiologi | Sumber order non-hulu/registrasi bila berlaku. |
| Tindakan & BHP | Tindakan/consumable selama pemeriksaan. |
| Billing G2 | Consumer charge. |
| EMR | Consumer expertise final dan imaging reference. |

## 6. Business Process & User Stories

| Status | Deskripsi | Transisi |
|---|---|---|
| ORDERED | Order masuk | → CONFIRMED/CANCELLED |
| CONFIRMED | Diterima radiologi | → IN_PROGRESS/CANCELLED |
| IN_PROGRESS | Pemeriksaan berlangsung | → RESULT_DRAFT/CANCELLED |
| RESULT_DRAFT | Imaging/expertise belum final | → COMPLETED |
| COMPLETED | Expertise final/guard terpenuhi | Terminal/addendum |
| CANCELLED | Batal beralasan | Terminal |

- Petugas melihat dan memfilter antrean order.
- Radiografer membuka detail dan memperbarui status imaging.
- Dokter radiologi membuat/finalisasi expertise.
- Dokter pengirim melihat hasil final.
- User berwenang membandingkan dua hasil historis.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**FR-N12-01 — Worklist (P0)**

- E4/order registrasi valid muncul sekali berdasarkan source ID.
- Kolom minimum: waktu/no. order, pasien/MR, unit, dokter peminta, pemeriksaan, modality [jika ada], prioritas, status order, imaging, expertise, update, aksi.
- Search No. order/MR/nama; filter tanggal, unit, modality, priority, status order/imaging/expertise.
- Pagination server-side; klik baris membuka detail sesuai RBAC.

**FR-N12-02 — Detail dan Konfirmasi (P0)**

- Detail menampilkan snapshot pasien/encounter, indikasi, item, requester, catatan, alergi/risiko yang tersedia [PERLU KONFIRMASI], dan status log.
- Confirm hanya dari ORDERED; cancel wajib alasan dan tidak menghapus histori/billing.
- Konflik perubahan order setelah confirm ditampilkan eksplisit.

**FR-N12-03 — Imaging Status (P0 Foundation)**

- Imaging status terpisah: NOT_AVAILABLE/AVAILABLE/FAILED [PERLU KONFIRMASI].
- Menandai AVAILABLE menyimpan waktu, actor/system, dan `imaging_reference` opsional.
- Sistem tidak mengklaim file DICOM tersedia bila hanya expertise yang diisi.

**FR-N12-04 — Expertise (P0 Foundation)**

- Expertise draft terkait order item dan template schema/version pemeriksaan.
- Finalisasi menyimpan author, verifier [jika berbeda], waktu, dan snapshot isi.
- COMPLETED memerlukan guard configurable: imaging available dan/atau expertise final sesuai item.
- Final immutable; koreksi via addendum/version.

**FR-N12-05 — Perbandingan Hasil (P1)**

- User memilih tepat dua hasil FINAL milik pasien yang sama.
- Phase 1 membandingkan metadata dan teks expertise side-by-side; image comparison hanya bila viewer/PACS tersedia.
- Akses comparison dicatat audit.

**FR-N12-06 — Analytics (P2)**

- KPI volume, TAT, backlog, modality utilization, critical findings/tren berada di Phase 2.

**Validasi**

| Field | Rules | Pesan |
|---|---|---|
| Alasan cancel | Required min 5 | “Alasan pembatalan wajib diisi” |
| Expertise final | Section wajib template lengkap | “Expertise belum lengkap” |
| Compare | Tepat 2 final result, pasien sama | “Pilih dua hasil final dari pasien yang sama” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**`radiology_orders`**: id, source_order_id unique, patient/encounter/requester/unit, priority, status, ordered/confirmed/started/completed/cancelled timestamps, billing sync, audit.  
**`radiology_order_items`**: order_id, exam item reference, code/name/modality snapshot, status, imaging_status/reference.  
**`radiology_reports`**: item_id, version, template schema/version, content JSON/text, status DRAFT/FINAL/AMENDED, author/verifier/final timestamps.  
**`radiology_status_logs`**: append-only.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/radiology/worklist` | List/filter |
| GET | `/api/v1/radiology/orders/{id}` | Detail |
| POST | `/api/v1/radiology/orders/{id}/confirm` | Confirm |
| POST | `/api/v1/radiology/orders/{id}/start` | Start |
| PATCH | `/api/v1/radiology/items/{id}/imaging-status` | Update imaging flag/reference |
| PUT | `/api/v1/radiology/items/{id}/report` | Save expertise draft |
| POST | `/api/v1/radiology/items/{id}/report/finalize` | Finalize expertise |
| POST | `/api/v1/radiology/orders/{id}/complete` | Complete |
| POST | `/api/v1/radiology/orders/{id}/cancel` | Cancel |
| GET | `/api/v1/radiology/results/compare?left=&right=` | Compare two final results |

### 8.3 Data & Business Rules

- **BR-N12-01:** Dashboard berarti worklist; analytics bukan Phase 1.
- **BR-N12-02:** Order status, imaging status, dan expertise status adalah dimensi terpisah.
- **BR-N12-03:** Satu source order satu aggregate; item/detail tidak digandakan menjadi row tanpa keputusan UX.
- **BR-N12-04:** Expertise final immutable dan versioned.
- **BR-N12-05:** Compare hanya untuk hasil pasien sama; audit wajib.
- **BR-N12-06:** RIS/PACS/DICOM adalah extension, bukan asumsi MVP.

## 9. Workflow / BPMN Interpretation

`Order E4 → Worklist N12 → Detail/Confirm → Examination → Imaging Available → Expertise Draft/Final → Complete → EMR/Billing/History/Compare`

## Pertanyaan Terbuka

- Apakah satu row per order atau per item pemeriksaan?
- Apa guard selesai: imaging available, expertise final, atau keduanya?
- Siapa author/verifier dan apakah perlu co-sign?
- Apakah RIS/PACS/DICOM tersedia dan apa identifier/reference canonical-nya?
- Template expertise per jenis pemeriksaan dikelola di mana?
- Kapan billing dibentuk/void?
- Perbandingan Phase 1 hanya teks atau wajib image viewer?

