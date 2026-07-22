# PRD Pondasi — Penundaan Operasi Pasien (N13)

> **Status kematangan:** FOUNDATION / CONCEPT DRAFT v0.1 — detail kebijakan klinis dan operasional belum final.  
> **Prinsip:** Penundaan berbeda dari pembatalan. Penundaan mempertahankan order operasi dan membuka tindak lanjut penjadwalan ulang; pembatalan mengakhiri order.

**Related Document:** `template.md`; `bahan_random/DelayOperationForm.vue`; `data/features-mvp.json` E9/F43/F45; PRD Dashboard IBS; PRD Permintaan Jadwal Operasi; Master Ruang IBS; A53 RBAC  
**Versi:** 0.2 — Direct Schedule Update  
**Tanggal:** 2026-07-20

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|---|---|---|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa oleh | [PERLU KONFIRMASI] Kepala IBS / Komite Medis / Pelayanan | — |
| Disetujui oleh | [PERLU KONFIRMASI] Manajemen Rumah Sakit | — |

**Related Documents dan Fakta Sumber**

| Sumber (read-only) | Fakta yang Digunakan |
|---|---|
| `data/features-mvp.json` E9 | Order hulu berasal dari Permintaan Jadwal Operasi (Order IBS). |
| `data/features-mvp.json` F43 | IBS memiliki menu Jadwal Operasi. |
| `data/features-mvp.json` F45 | IBS memiliki fitur/menu Penundaan Operasi Pasien. |
| `other_prd.../PRD-Dashboard-IBS.md` | Penundaan menyimpan alasan, waktu, petugas; mengubah status menjadi Ditunda; order dapat dikonfirmasi ulang ke jadwal baru. |
| PRD Dashboard IBS | Penundaan dapat bercabang dari Terkonfirmasi/Sedang Berlangsung; perubahan status harus terlihat real-time. |
| Master Ruang IBS | Ruang OK aktif menjadi referensi jadwal/reschedule operasi. |
| `bahan_random/DelayOperationForm.vue` | Acuan v1: identitas dan jadwal lama read-only; kategori Medis/Non Medis, alasan, tanggal/jam baru editable; simpan memperbarui jadwal utama melalui satu request. |

> Disclaimer sumber: folder `other_prd(prd_dari_google_drive)` hanya dibaca dan tidak boleh diubah.

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 2026-07-19 | 0.1 | Pondasi event penundaan, histori jadwal, tindak lanjut reschedule, audit, dan kontrak integrasi. |
| 2026-07-20 | 0.2 | Menetapkan form penundaan sebagai tempat edit jadwal baru dan mewajibkan perubahan langsung tercermin pada form Jadwal Operasi utama. |

## 2. Overview & Background

**Overview / Brief Summary**

N13 mencatat dan mengelola **episode penundaan sekaligus penjadwalan ulang** atas order operasi pasien. Fitur diakses dari Dashboard/Jadwal IBS. Mengikuti v1, user mengedit tanggal serta jam operasi baru langsung pada Form Penundaan; Simpan mencatat alasan dan snapshot jadwal lama sekaligus memperbarui jadwal pada form Jadwal Operasi utama.

N13 tidak menjadi pemilik order operasi, data klinis, atau master jadwal. Order tetap dimiliki E9/IBS; N13 menjadi subdomain/event log penundaan yang mengubah state order secara terkendali dan menyediakan dasar untuk penjadwalan ulang.

**Business Process (As-Is vs To-Be)**

**As-Is:** [ASUMSI]

- Penundaan disampaikan melalui telepon/chat dan jadwal lama langsung diganti.
- Alasan dan pihak yang memutuskan tidak selalu tercatat terstruktur.
- Unit, pasien/keluarga, tim operasi, ruang, dan sumber daya bisa menerima informasi berbeda.
- Sulit menghitung frekuensi penundaan dan membedakan penundaan klinis, pasien, fasilitas, atau administratif.

**To-Be — Pondasi:**

- User berwenang memilih order dan melakukan aksi Tunda.
- Sistem menampilkan identitas pasien dan jadwal lama secara read-only, lalu menyediakan kategori, alasan, tanggal baru, jam mulai baru, dan jam selesai baru untuk diedit.
- Simpan membuat record penundaan immutable, snapshot jadwal lama, dan schedule version baru dalam satu transaksi.
- Jadwal baru langsung menjadi jadwal aktif dan harus tampil pada form Jadwal Operasi utama setelah simpan berhasil.
- Seluruh perubahan tampil pada Dashboard IBS dan audit trail.

## 3. Goals & Metrics

| No | Metrics | Success Criteria Pondasi |
|---|---|---|
| 1 | Ketertelusuran | 100% penundaan menyimpan order, jadwal lama, alasan, waktu, dan aktor. |
| 2 | Integritas jadwal | 0 jadwal lama hilang/tertimpa tanpa histori versi. |
| 3 | Konsistensi status | 100% aksi tunda mengubah order dan membuat event penundaan secara atomik. |
| 4 | Sinkronisasi jadwal | 100% penundaan berhasil langsung memperbarui jadwal aktif pada form Jadwal Operasi utama. |
| 5 | Real-time worklist | Perubahan terlihat pada Dashboard IBS ≤5 detik. [ASUMSI] |
| 6 | Keamanan | 0 penundaan oleh role yang tidak berwenang. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — Foundation | Phase 2 — Setelah Kebijakan Final |
|---|---|---|
| Aksi tunda | Validasi status, alasan, waktu, aktor, catatan | Approval berdasarkan kategori/status operasi |
| Kategori alasan | Master/configurable category + free note | Analitik root cause dan mandatory evidence |
| Jadwal | Edit tanggal/jam baru pada form tunda, snapshot jadwal lama, update jadwal utama | Rekomendasi slot/resource otomatis |
| Worklist | Daftar operasi ditunda, search/filter/detail | SLA, escalation, KPI/grafik |
| Notifikasi | Outbox/event readiness | WA/SMS/in-app ke pasien dan tim |
| Integrasi | Dashboard IBS, order, ruang, staff, audit | Farmasi, billing, penunjang, vendor |
| Koreksi | Edit ulang penundaan/jadwal oleh role berwenang dengan versi dan audit | Approval/addendum lanjutan |

**Out of Scope Phase 1**

- Penentuan medis apakah operasi harus ditunda.
- Optimasi otomatis jadwal dokter, ruang OK, alat, implant, ICU/bed, atau tim.
- Pengiriman WA/SMS sebelum consent, template, penerima, retry, dan ownership disepakati.
- Kebijakan refund/void billing, retur obat/BHP, pembatalan penunjang, dan pelepasan reservation secara detail.
- Dashboard analitik penundaan; N13 Phase 1 adalah worklist/list.

## 5. Related Features

| Modul | Relasi Pondasi |
|---|---|
| E9 Permintaan Jadwal Operasi | Sumber order operasi dan konteks pasien/encounter. |
| F43 Jadwal Operasi | Sumber jadwal lama dan tujuan schedule version baru. |
| Dashboard IBS | Entry point aksi Tunda dan consumer status DITUNDA secara real-time. |
| Master Ruang IBS/A16 | Referensi ruang OK aktif untuk jadwal baru. |
| Master Staff/Jadwal Dokter | Referensi operator, DPJP, dokter bedah/anestesi dan availability masa depan. |
| EMR Operasi | Consumer status; N13 tidak mengubah isi klinis. |
| Farmasi/Tindakan & BHP | Kandidat consumer event untuk release/return; aturan final terbuka. |
| Billing G2 | Kandidat consumer dampak charge; N13 tidak menghapus tagihan langsung. |
| A53 RBAC | Hak tunda, reschedule, view, void/koreksi. |

## 6. Business Process & User Stories

**State Machine — Order Operasi (konteks N13)**

| Status | Makna | Transisi yang Relevan |
|---|---|---|
| BELUM_TERKONFIRMASI | Order belum memiliki jadwal terkonfirmasi | [PERLU KONFIRMASI] boleh ditunda atau seharusnya revisi order |
| TERKONFIRMASI | Jadwal telah ditetapkan | → DITUNDA |
| SEDANG_BERLANGSUNG | Operasi telah dimulai | → DITUNDA hanya dengan kewenangan/aturan khusus [PERLU KONFIRMASI] |
| DITUNDA/DIJADWALKAN_ULANG | Penundaan tercatat dan jadwal baru menjadi jadwal aktif | → TERKONFIRMASI sesuai state model Jadwal Operasi [PERLU KONFIRMASI kode status] |
| DIBATALKAN | Order berakhir | Terminal |
| SELESAI | Operasi selesai | Tidak dapat ditunda |

**Lifecycle Record Penundaan**

| Status | Deskripsi | Transisi |
|---|---|---|
| ACTIVE | Penundaan tersimpan dan jadwal baru aktif | → REVISED/DIBATALKAN |
| REVISED | Kategori, alasan, atau jadwal baru dikoreksi dengan revision baru | → REVISED/DIBATALKAN |
| DIBATALKAN | Order akhirnya dibatalkan melalui aksi terpisah | Terminal |

**User Stories Utama**

- **US-N13-01:** Sebagai Petugas IBS berwenang, saya ingin menunda order dengan alasan agar status aktual tercatat.
- **US-N13-02:** Sebagai Koordinator IBS, saya ingin melihat worklist operasi ditunda dan tindak lanjutnya.
- **US-N13-03:** Sebagai Penjadwal, saya ingin mengedit tanggal dan jam baru langsung pada Form Penundaan agar Jadwal Operasi utama ikut berubah tanpa input ulang.
- **US-N13-06:** Sebagai Penjadwal berwenang, saya ingin mengedit kembali data penundaan/jadwal agar koreksi tercatat tanpa menghilangkan versi sebelumnya.
- **US-N13-04:** Sebagai Tim Operasi/Unit Peminta, saya ingin menerima status terbaru agar tidak memakai jadwal lama.
- **US-N13-05:** Sebagai Auditor/Manajemen, saya ingin melihat siapa, kapan, mengapa, dan berapa kali operasi ditunda.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-N13-01 — Aksi Penundaan**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Tombol Tunda hanya tampil untuk role dan status yang diizinkan.
  - **AC 2:** Backend memvalidasi status terbaru; request bersamaan/stale ditolak HTTP 409.
  - **AC 3:** Mengikuti v1, form menampilkan No. RM, nama pasien, tanggal jadwal lama, jam mulai lama, dan jam selesai lama secara read-only.
  - **AC 4:** User wajib memilih kategori `MEDICAL` atau `NON_MEDICAL`, mengisi alasan, tanggal baru, jam mulai baru, dan jam selesai baru.
  - **AC 5:** Tanggal baru tidak boleh sebelum tanggal rencana operasi lama; jam mulai harus lebih awal dari jam selesai dan keduanya harus berformat waktu valid.
  - **AC 6:** Simpan membuat event penundaan, snapshot `before_delay`, schedule version baru, dan mengubah jadwal aktif dalam satu transaksi.
  - **AC 7:** Setelah berhasil, form ditutup dan Dashboard/form Jadwal Operasi utama melakukan refresh sehingga tanggal serta jam baru langsung terlihat.
  - **AC 8:** Idempotency key yang sama tidak membuat dua episode penundaan.

**Fitur: FR-N13-02 — Kategori Alasan Pondasi**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Phase 1 menyediakan kategori `MEDICAL` (Medis) dan `NON_MEDICAL` (Non Medis), sesuai v1.
  - **AC 2:** Alasan berupa teks wajib untuk kedua kategori.
  - **AC 3:** Penambahan master kategori lebih detail menjadi pengembangan berikutnya tanpa mengubah histori nilai v1.

**Fitur: FR-N13-03 — Worklist Penundaan**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** List menampilkan No. order, pasien/No. RM, prosedur, dokter, prioritas/Cito, jadwal lama, alasan, waktu tunda, pelaku, follow-up status, dan jadwal baru bila ada.
  - **AC 2:** Search No. order/No. RM/nama; filter tanggal, unit, dokter, kategori, Cito, follow-up status.
  - **AC 3:** Default menampilkan penundaan yang belum selesai tindak lanjutnya; riwayat dapat diakses lewat filter.
  - **AC 4:** Pagination server-side dan klik baris membuka detail timeline.

**Fitur: FR-N13-04 — Update Jadwal Operasi Utama**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** Tanggal dan jam baru yang disimpan pada Form Penundaan menjadi sumber jadwal aktif untuk order/`id_ibs` yang sama.
  - **AC 2:** Form Jadwal Operasi utama membaca schedule version aktif terbaru, bukan snapshot jadwal lama atau salinan data terpisah.
  - **AC 3:** Update memakai optimistic locking/version agar perubahan jadwal lain yang terjadi setelah form dibuka ditolak HTTP 409 dan tidak tertimpa.
  - **AC 4:** Sistem memvalidasi konflik dokter, ruang, dan resource terkait sebelum commit [PERLU KONFIRMASI cakupan resource].
  - **AC 5:** Setelah commit, sistem melakukan cache invalidation/publish event agar jadwal utama, Dashboard IBS, dan detail pasien menampilkan jadwal baru secara konsisten.
  - **AC 6:** Riwayat seluruh jadwal lama/baru tetap dapat dilihat.

**Fitur: FR-N13-04A — Edit Penundaan/Jadwal Baru**

- **Prioritas:** P0
- **Fase:** Phase 1 Foundation
- **Acceptance Criteria:**
  - **AC 1:** User berwenang dapat membuka kembali record penundaan terbaru yang belum terkunci oleh proses operasi selesai/dibatalkan.
  - **AC 2:** Form memuat kategori, alasan, serta jadwal baru terakhir; user dapat mengubahnya dengan validasi yang sama seperti create.
  - **AC 3:** Edit membuat revision/version baru dan tidak menimpa `before_delay` awal maupun histori perubahan sebelumnya.
  - **AC 4:** Penyimpanan edit juga memperbarui jadwal aktif pada form Jadwal Operasi utama dalam transaksi yang sama.
  - **AC 5:** Audit mencatat nilai sebelum/sesudah, alasan koreksi, aktor, dan waktu.

**Fitur: FR-N13-05 — Dampak dan Event Integrasi**

- **Prioritas:** P1
- **Fase:** Phase 1 Foundation (outbox/contract)
- **Acceptance Criteria:**
  - **AC 1:** Sistem menerbitkan `surgery.postponed` idempotent setelah transaksi commit.
  - **AC 2:** Payload minimum berisi order, encounter, postponement, old schedule, category, occurred_at, actor, dan follow-up status.
  - **AC 3:** N13 mencatat acknowledgement consumer tanpa langsung menghapus charge, obat, BHP, atau reservation.
  - **AC 4:** Kegagalan consumer tidak me-rollback fakta penundaan; retry melalui outbox.

**Fitur: FR-N13-06 — Koreksi/Void Penundaan**

- **Prioritas:** P2
- **Fase:** Phase 2
- **Acceptance Criteria:**
  - **AC 1:** Episode yang salah tidak dihapus; dibuat void/addendum dengan alasan dan approver.
  - **AC 2:** State order dipulihkan hanya bila tidak ada schedule/event lanjutan yang konflik.

**Fitur: FR-N13-07 — Analytics dan Escalation**

- **Prioritas:** P2
- **Fase:** Phase 2
- **Acceptance Criteria:**
  - **AC 1:** KPI jumlah/rate penundaan, kategori, unit/dokter, waktu reschedule, dan repeat postponement dihitung dari event immutable.
  - **AC 2:** Penundaan tanpa tindak lanjut melewati SLA memicu escalation.

**Validasi — Wording Frontend**

| Field | Tipe | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Kategori Alasan | Dropdown | Required, aktif | “Kategori alasan penundaan wajib dipilih” | “Pilih penyebab utama yang paling sesuai” |
| Catatan Alasan | Textarea | Required untuk Lainnya; max 1000 | “Jelaskan alasan penundaan” | “Jangan mencantumkan data yang tidak diperlukan” |
| Waktu Penundaan | Datetime | Required; tidak melewati waktu input secara tidak wajar | “Waktu penundaan tidak valid” | “Waktu keputusan/kejadian penundaan” |
| Tanggal Jadwal Baru | Date | Required; tidak sebelum jadwal lama | “Tanggal jadwal baru wajib diisi” | “Tanggal baru akan mengganti jadwal aktif” |
| Jam Mulai Baru | Time | Required; valid dan sebelum jam selesai | “Waktu mulai harus sebelum waktu selesai” | Format HH:mm |
| Jam Selesai Baru | Time | Required; valid dan setelah jam mulai | “Waktu selesai harus setelah waktu mulai” | Format HH:mm |
| Ruang Operasi | Select | Required saat confirm jadwal baru | “Ruang operasi aktif wajib dipilih” | “Hanya ruang OK aktif yang tersedia” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `surgery_postponements`**

- `id`: UUID, PK
- `surgery_order_id`: UUID, required, FK
- `sequence_no`: INT — urutan penundaan per order
- `old_schedule_id`: UUID, required
- `reason_category_id`: UUID, required
- `reason_note`: VARCHAR(1000), nullable/conditional
- `postponed_at`: TIMESTAMP, required — waktu keputusan/kejadian
- `postponed_by`: UUID, required
- `order_status_before`: VARCHAR(30), required
- `record_status`: ENUM(`ACTIVE`,`REVISED`,`CANCELLED`)
- `new_schedule_id`: UUID, required
- `current_revision_no`: INT, required
- `resolution_note`: VARCHAR(1000), nullable
- `resolved_by`, `resolved_at`: nullable
- `status_approval`, `role_approver`: Phase 2 ready
- audit timestamps; no hard delete
- Unique `(surgery_order_id, sequence_no)` dan idempotency key.

**Table: `surgery_postponement_reason_categories`**

- `id`, `code`, `name`, `group_code`, `requires_note`, `is_active`, display order, approval/audit fields.

**Table: `surgery_schedule_versions`** (atau gunakan tabel jadwal existing)

- `id`, `surgery_order_id`, `version_number`, `previous_schedule_id`, room/start/end/team snapshot, `status`, `change_source`, `postponement_id`, audit fields.

**Table: `integration_outbox`**

- event id/type, aggregate id/version, payload, status, retry count, timestamps.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/surgery-postponements` | Worklist/filter/riwayat |
| GET | `/api/v1/surgery-postponements/{id}` | Detail/timeline |
| POST | `/api/v1/surgery-orders/{id}/postpone` | Tunda secara atomik |
| PUT | `/api/v1/surgery-postponements/{id}` | Edit kategori, alasan, dan jadwal baru; buat revision serta update jadwal aktif |
| POST | `/api/v1/surgery-postponements/{id}/reschedule` | Endpoint kompatibilitas bila update jadwal dipisah; tetap harus satu transaksi dengan penundaan |
| POST | `/api/v1/surgery-postponements/{id}/cancel-order` | Akhiri sebagai pembatalan [PERLU KONFIRMASI ownership] |
| GET | `/api/v1/surgery-postponement-reasons` | Lookup kategori aktif |
| GET | `/api/v1/surgery-orders/{id}/schedule-history` | Histori jadwal |
| POST | `/api/v1/surgery-postponements/{id}/void` | Phase 2: koreksi ber-approval |

### 8.3 Data & Business Rules

#### 8.3.1 Form Penundaan

| Field | Label | Wajib | Sumber | Catatan |
|---|---|---|---|---|
| patient_no_rm / patient_name | No. RM / Nama Pasien | Ya/read-only | Order/Patient | Sesuai konteks pasien terpilih |
| before_delay | Jadwal Seharusnya | Ya/read-only | Schedule aktif saat form dibuka | Tanggal, jam mulai, jam selesai |
| delay_type | Kategori | Ya | User | `MEDICAL`/`NON_MEDICAL` |
| delay_reason | Alasan | Ya | User | Tidak boleh kosong |
| operation_plan_date | Jadwal Baru | Ya | User | Tidak sebelum tanggal jadwal lama |
| start_time / end_time | Jam Baru | Ya | User | Mulai < selesai |
| created_by/updated_by | Petugas | Ya | Session | Tidak diinput manual |

#### 8.3.2 Worklist

| Kolom | Sumber | Filter/Sort | Catatan |
|---|---|---|---|
| Pasien/Order | snapshot/reference | Search | No. RM + nama + order |
| Operasi | procedure snapshot | Search | — |
| Dokter/Cito | schedule/order | Filter | — |
| Jadwal Lama | old schedule snapshot | Range | Tidak berubah |
| Alasan | category + note | Filter | — |
| Ditunda | postponed_at/by | Range/sort | — |
| Follow-up | follow_up_status | Filter | Fokus default unfinished |
| Jadwal Baru | active schedule version | Range | Jadwal aktif hasil penundaan/edit terakhir |

**Business Rules**

- **BR-N13-01:** Penundaan tidak sama dengan pembatalan; order tetap aktif sampai dijadwalkan ulang atau dibatalkan eksplisit.
- **BR-N13-02:** Setiap penundaan adalah event baru; penundaan berulang tidak menimpa event sebelumnya.
- **BR-N13-03:** Jadwal lama immutable/snapshot; reschedule menghasilkan versi baru.
- **BR-N13-04:** Alasan, waktu penundaan, dan aktor wajib sesuai sumber Dashboard IBS.
- **BR-N13-05:** Tunda + update state order + outbox event dilakukan atomik.
- **BR-N13-06:** Penundaan dari SEDANG_BERLANGSUNG memerlukan aturan khusus karena dapat berarti interupsi operasi, bukan reschedule biasa. [PERLU KONFIRMASI]
- **BR-N13-07:** N13 tidak menghapus billing, EMR, obat, BHP, atau reservation; consumer menindaklanjuti event sesuai domain masing-masing.
- **BR-N13-08:** Semua create, follow-up, reschedule, void, view sensitif, dan notifikasi diaudit.
- **BR-N13-09:** Form Penundaan adalah entry point edit jadwal baru; penyimpanan tidak boleh sukses jika jadwal aktif pada form Jadwal Operasi utama gagal diperbarui.
- **BR-N13-10:** `before_delay` bersifat immutable dan selalu menunjuk jadwal aktif sebelum episode penundaan pertama; edit berikutnya disimpan sebagai revision.
- **BR-N13-11:** Jadwal utama dan N13 harus memakai aggregate/schedule version yang sama untuk mencegah dual source of truth.

## 9. Workflow / BPMN Interpretation

> BPMN khusus N13 belum tersedia; alur diturunkan dari PRD Dashboard IBS.

1. User membuka order TERKONFIRMASI dari Dashboard/Jadwal IBS.
2. User klik **Tunda Operasi**; sistem validasi role dan state terbaru.
3. Sistem menampilkan No. RM, nama, tanggal/jam jadwal lama secara read-only.
4. User memilih kategori Medis/Non Medis, mengisi alasan, tanggal baru, jam mulai baru, dan jam selesai baru.
5. Simpan atomik: validasi versi/konflik, buat episode N13 dan `before_delay`, buat schedule version baru, jadikan jadwal baru aktif, simpan audit, lalu publish event.
6. Form ditutup; Dashboard dan form Jadwal Operasi utama me-refresh data dan menampilkan jadwal baru.
7. Bila diperlukan, user berwenang membuka Edit; perubahan membuat revision baru dan kembali memperbarui jadwal utama secara atomik.
8. Pembatalan tetap menjadi aksi terpisah dan tercatat.

`Order/Jadwal IBS → Tunda → Record alasan + snapshot jadwal → DITUNDA → Follow-up → Jadwal baru/Cancel → Timeline historis`

## Asumsi

- [ASUMSI] N13 diwujudkan sebagai worklist + detail timeline dan aksi dari Dashboard IBS.
- [ASUMSI] Kategori alasan awal configurable dan belum final.
- [ASUMSI] Satu order dapat ditunda lebih dari sekali.

## Pertanyaan Terbuka Prioritas

- Status mana yang boleh ditunda: hanya TERKONFIRMASI atau juga BELUM_TERKONFIRMASI/SEDANG_BERLANGSUNG?
- Siapa boleh menunda dan apakah kategori tertentu memerlukan persetujuan dokter/koordinator?
- Daftar kategori alasan final dan bukti/catatan wajibnya apa saja?
- Apakah perubahan penundaan boleh diedit sampai status tertentu, dan role mana yang boleh mengeditnya?
- Resource apa yang harus divalidasi/release: ruang, dokter, anestesi, alat, implant, ICU/bed?
- Apa dampak penundaan terhadap obat/BHP, penunjang, informed consent, puasa, dan EMR?
- Apa dampak billing dan siapa owner void/refund charge?
- Siapa yang wajib menerima notifikasi dan melalui kanal apa?
- Apa perbedaan terminologi “penundaan saat operasi belum mulai” versus “interupsi saat sedang berlangsung”?
- Apakah repeat postponement memerlukan escalation/approval khusus?
