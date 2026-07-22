# PRD — Master Data Rumah Sakit (N5)

**Related Document:** `template.md`; PRD N4 Profil Rumah Sakit; PRD N6 Konfirmasi Ambulance; PRD N7 Order Ambulance; Master Wilayah; A53 Admin/RBAC  
**Versi:** 1.0 — Draft awal  
**Tanggal:** 2026-07-18

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|---|---|---|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-18 |
| Diperiksa oleh | [PERLU KONFIRMASI] Kepala IT / Kepala Pelayanan | — |
| Disetujui oleh | [PERLU KONFIRMASI] Manajemen Rumah Sakit | — |

**Related Documents**

- `template.md` — format standar PRD.
- **N4 — Profil Rumah Sakit** — identitas rumah sakit saat ini (RS existing/internal).
- **N7 — Order Ambulance** — konsumen utama master RS dan pemilik create-on-transaction saat order disimpan.
- **N6 — Konfirmasi Ambulance** — membaca snapshot/master RS saat review dan dapat mengoreksi rute sebelum konfirmasi.
- **Master Wilayah** — referensi wilayah alamat (opsional pada Phase 1).
- **A53 — Admin/RBAC** — pengaturan hak akses master data.

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 2026-07-18 | 1.0 | Draft awal master data rumah sakit dan integrasi create-on-transaction ambulance. |
| 2026-07-19 | 1.1 | Relasi disesuaikan: N7 membuat order/RS baru, N6 mengonfirmasi; jarak ditegaskan sebagai data transaksi, bukan master RS. |

## 2. Overview & Background

**Overview / Brief Summary**

Master Data Rumah Sakit (N5) menjadi sumber referensi rumah sakit eksternal yang dipakai pada transaksi ambulance. Admin dapat mencari, menambah, melihat, mengubah, dan mengaktifkan/nonaktifkan data rumah sakit. Saat operator N7 tidak menemukan rumah sakit pada dropdown pencarian, operator boleh mengetik nama baru; ketika order disimpan, sistem membuat record N5 secara otomatis dan menghubungkannya ke order tersebut.

N5 berbeda dari **N4 Profil Rumah Sakit**: N4 menyimpan identitas RS pengguna aplikasi (RS saat ini/internal), sedangkan N5 menyimpan daftar RS rujukan/tujuan/asal eksternal. Record yang dibuat otomatis dari N7 diberi penanda sumber dan dapat dilengkapi admin kemudian. Jarak tidak disimpan sebagai atribut tetap RS karena bergantung pada pasangan origin-destination setiap order.

**Business Process (As-Is vs To-Be)**

**As-Is:** [ASUMSI]

- Nama dan alamat RS tujuan/asal dicatat sebagai teks bebas pada proses ambulance.
- Penulisan nama RS tidak konsisten sehingga pencarian dan rekap sulit serta rawan duplikasi.
- Jika RS belum tersedia, operator harus meminta admin menambah master terlebih dahulu atau melanjutkan dengan teks yang tidak terhubung master.

**To-Be:**

- N5 menjadi satu referensi rumah sakit eksternal untuk N7 dan N6.
- Dropdown RS mendukung pencarian sekaligus input nama baru (creatable combobox).
- RS baru dibuat otomatis secara atomik saat order N7 berhasil disimpan; bila transaksi gagal, record master tidak boleh tertinggal.
- Sistem melakukan pemeriksaan kemungkinan duplikat dan memberi penanda `AMBULANCE_TRANSACTION` pada data yang dibuat dari N6.
- Data minimal hasil pembuatan otomatis dapat dilengkapi dan diverifikasi admin tanpa memutus relasi transaksi lama.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---|---|---|
| 1 | Penggunaan referensi terstruktur | ≥95% transaksi ambulance menyimpan `hospital_id`, bukan hanya nama teks. |
| 2 | Create-on-transaction | 100% nama RS baru pada transaksi sukses tersimpan di N5 dan tertaut ke transaksi yang sama. |
| 3 | Konsistensi transaksi | 0 record RS yatim bila penyimpanan transaksi ambulance gagal/rollback. |
| 4 | Pencegahan duplikat | 100% kandidat nama/alamat serupa memunculkan saran data existing sebelum record baru dibuat. |
| 5 | Kualitas data | 100% record memiliki nama; record hasil N6 memiliki sumber pembuatan dan audit trail. |
| 6 | Kinerja pencarian | Respons pencarian autocomplete p95 < 500 ms untuk data ≤100.000 record. [ASUMSI target] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|---|---|---|
| CRUD rumah sakit | List, cari, tambah, detail, edit, soft delete/nonaktif | Approval perubahan data kritikal dan merge duplikat |
| Alamat | Teks alamat, koordinat opsional, referensi wilayah opsional | Normalisasi wajib dan enrichment wilayah otomatis |
| Integrasi N7/N6 | Dropdown N7 dan create-on-transaction; lookup/review pada N6 | Review/approval record baru sebelum menjadi master terverifikasi |
| Validasi duplikat | Peringatan berdasarkan nama ternormalisasi dan kota/alamat | Fuzzy matching dan workflow merge |
| Status | Otomatis AKTIF saat create; toggle di list | Approval aktivasi/nonaktivasi |

**Out of Scope**

- Profil RS internal/current hospital (dikelola N4).
- Credential bridging, kontrak kerja sama, bed availability, jadwal dokter, atau tarif layanan RS eksternal.
- Sinkronisasi direktori RS eksternal nasional. [PERLU KONFIRMASI]
- Penghapusan fisik record yang sudah direferensikan transaksi.

## 5. Related Features

| Kode / Modul | Relasi Teknis / Bisnis |
|---|---|
| N4 — Profil Rumah Sakit | Menyediakan RS saat ini sebagai titik tetap. N4 tidak diduplikasi menjadi record N5. |
| N7 — Order Ambulance | Membaca N5; dapat membuat N5 saat order disimpan; menyimpan FK dan snapshot. |
| N6 — Konfirmasi Ambulance | Membaca relasi/snapshot N5 dan dapat mengoreksi RS sebelum konfirmasi. |
| Master Wilayah | Menjadi referensi opsional provinsi/kabupaten/kecamatan/kelurahan. |
| Google Maps | Memvalidasi alamat dan menyimpan `place_id`, latitude, longitude bila tersedia. |
| A53 — Admin/RBAC | Mengatur izin view/create/edit/toggle/merge master. |

## 6. Business Process & User Stories

**State Machine Table**

| Status | Deskripsi | Efek Transaksi | Transisi (Phase 1) | Transisi (Phase 2) |
|---|---|---|---|---|
| AKTIF | Dapat dipilih pada transaksi baru | Bisa digunakan N6 | Otomatis saat create; dapat → NONAKTIF | Aktif setelah approval |
| NONAKTIF | Tidak ditawarkan pada pencarian default | Transaksi lama tetap menampilkan snapshot | Toggle dari list; dapat → AKTIF | Perlu approval |
| PENDING_REVIEW | Record otomatis menunggu verifikasi | Tetap dapat tertaut ke transaksi pembuat [ASUMSI] | Tidak dipakai sebagai status approval; disiapkan | → APPROVED/REJECTED/MERGED |
| MERGED | Record duplikat dialihkan ke record canonical | Referensi dialihkan | — | Hasil proses merge |

**User Stories Utama**

- **US-N5-01:** Sebagai Admin, saya ingin mengelola daftar RS agar tersedia referensi konsisten.
- **US-N5-02:** Sebagai Operator Ambulance, saya ingin mencari RS berdasarkan nama/alamat agar dapat memilih cepat.
- **US-N5-03:** Sebagai Operator Ambulance, saya ingin mengetik RS yang belum ada agar transaksi tidak terhambat.
- **US-N5-04:** Sebagai Data Steward, saya ingin melihat sumber data dan kandidat duplikat agar kualitas master terjaga.
- **US-N5-05:** Sebagai Auditor, saya ingin transaksi lama tetap menunjukkan RS yang digunakan meski master berubah/nonaktif.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-N5-01 — Daftar, Pencarian, dan Detail Rumah Sakit**

- **User Story:** US-N5-01, US-N5-02
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** List menampilkan nama, alamat ringkas, kota/kabupaten, telepon, sumber, status verifikasi, status aktif, dan terakhir diubah.
  - **AC 2:** Pencarian bersifat case-insensitive berdasarkan nama, alias, alamat, kota/kabupaten, dan telepon.
  - **AC 3:** Default list/dropdown hanya menampilkan record AKTIF; filter dapat menampilkan semua status.
  - **AC 4:** Endpoint autocomplete membatasi hasil default 20 dan mendukung pagination/cursor.

**Fitur: FR-N5-02 — Tambah dan Edit Rumah Sakit oleh Admin**

- **User Story:** US-N5-01
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Nama RS wajib; alamat, wilayah, telepon, email, koordinat, dan Google `place_id` opsional.
  - **AC 2:** Status tidak tersedia di form create dan diset AKTIF oleh sistem.
  - **AC 3:** Sebelum simpan, sistem mencari nama ternormalisasi yang sama; kandidat ditampilkan dan user harus memilih existing atau mengonfirmasi pembuatan baru.
  - **AC 4:** Edit tidak mengubah snapshot nama/alamat pada transaksi ambulance historis.
  - **AC 5:** Semua create/edit mencatat aktor, waktu, dan sumber.

**Fitur: FR-N5-03 — Create-on-Transaction dari N7**

- **User Story:** US-N5-03
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Combobox N7 menerima pilihan record existing atau teks nama baru yang telah di-trim dengan panjang 3–150 karakter.
  - **AC 2:** Saat payload berisi nama baru, backend mengulang pemeriksaan duplikat dalam transaksi database, bukan mengandalkan frontend saja.
  - **AC 3:** Jika tidak ada exact match, backend membuat N5 dengan `source=AMBULANCE_TRANSACTION`, status AKTIF, `verification_status=UNVERIFIED`, lalu menyimpan `hospital_id` pada transaksi.
  - **AC 4:** Pembuatan N5 dan penyimpanan order N7 bersifat atomik; kegagalan salah satunya me-rollback keduanya.
  - **AC 5:** Jika exact match ditemukan akibat request bersamaan, sistem menggunakan record existing dan tidak membuat duplikat.
  - **AC 6:** Nama dan alamat yang dipakai disalin sebagai snapshot pada order untuk kebutuhan audit historis N7/N6.

**Fitur: FR-N5-04 — Validasi Alamat dan Google Place**

- **User Story:** US-N5-01, US-N5-03
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Admin/operator dapat memilih hasil validasi Google Maps; sistem menyimpan `place_id`, alamat terformat, latitude, dan longitude.
  - **AC 2:** Kegagalan layanan Google tidak menghapus input user; user mendapat pesan gagal validasi dan dapat mencoba ulang.
  - **AC 3:** Untuk N5 Phase 1, koordinat dan referensi wilayah bersifat opsional; status validasi alamat terlihat jelas.

**Fitur: FR-N5-05 — Toggle Aktif/Nonaktif**

- **User Story:** US-N5-01, US-N5-05
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Toggle hanya tersedia pada list/dashboard, bukan form create.
  - **AC 2:** Record NONAKTIF tidak muncul pada dropdown N6 default tetapi tetap dapat dilihat pada transaksi lama.
  - **AC 3:** Sistem menolak hard delete jika record telah direferensikan transaksi dan menawarkan nonaktif sebagai pengganti.

**Fitur: FR-N5-06 — Review dan Merge Duplikat**

- **User Story:** US-N5-04
- **Prioritas:** P2
- **Fase:** Phase 2
- **Acceptance Criteria:**
  - **AC 1:** Data Steward dapat memilih record canonical dan satu/lebih record duplikat.
  - **AC 2:** Seluruh FK transaksi dialihkan secara aman, record lama berstatus MERGED, dan audit merge tersimpan.
  - **AC 3:** Merge memerlukan approval sesuai `role_approver`.

**Validasi — Wording Frontend**

| Field | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Nama Rumah Sakit | Text | Required, trim, 3–150 char | “Nama rumah sakit wajib diisi (3–150 karakter)” | “Ketik nama resmi rumah sakit” |
| Alamat | Textarea | Optional, max 500 | “Alamat maksimal 500 karakter” | “Pilih hasil Google Maps untuk memvalidasi alamat” |
| Wilayah | Cascading dropdown | Optional, relasi hierarkis valid | “Wilayah yang dipilih tidak valid” | “Opsional untuk kebutuhan rekap” |
| Telepon | Text | Optional, 7–20 char | “Nomor telepon tidak valid” | “Contoh: 021-1234567” |
| Email | Email | Optional, max 100 | “Format email tidak valid” | “Email resmi rumah sakit” |
| Google Place | Autocomplete | Optional | “Alamat belum berhasil divalidasi” | “Pilih alamat yang sesuai dari Google Maps” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table Name: `hospitals`**

- `id`: UUID, PK
- `name`: VARCHAR(150), required
- `normalized_name`: VARCHAR(150), required, indexed
- `alias`: VARCHAR(150), nullable
- `address_text`: VARCHAR(500), nullable
- `formatted_address`: VARCHAR(500), nullable
- `region_id`: UUID, nullable, FK → master wilayah
- `city_name`, `province_name`: VARCHAR(100), nullable (denormalized display)
- `google_place_id`: VARCHAR(255), nullable, unique where not null
- `latitude`, `longitude`: DECIMAL(10,7), nullable
- `phone`: VARCHAR(20), nullable
- `email`: VARCHAR(100), nullable
- `source`: ENUM(`MANUAL`,`AMBULANCE_TRANSACTION`,`IMPORT`,`INTEGRATION`)
- `verification_status`: ENUM(`UNVERIFIED`,`VERIFIED`,`REJECTED`), default `UNVERIFIED`
- `is_active`: BOOLEAN, default true
- `merged_into_id`: UUID, nullable, self FK (Phase 2)
- `status_approval`: ENUM(`APPROVED`,`PENDING_APPROVAL`,`REJECTED`), default `APPROVED`
- `role_approver`: VARCHAR(100), nullable
- `created_by`, `updated_by`: UUID
- `created_at`, `updated_at`, `deleted_at`: TIMESTAMP

**Recommended Constraints**

- Unique partial index pada `google_place_id` jika tidak null.
- Index pada `normalized_name`, `city_name`, `is_active`, dan trigram/full-text index untuk autocomplete.
- Hard delete diblokir bila ada FK transaksi.
- Idempotency key pada create-on-transaction untuk mencegah duplikasi retry.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/hospitals` | List/filter/pagination rumah sakit |
| GET | `/api/v1/hospitals/search` | Autocomplete untuk N7/N6 |
| GET | `/api/v1/hospitals/{id}` | Detail rumah sakit |
| POST | `/api/v1/hospitals` | Create oleh admin; default AKTIF |
| PUT | `/api/v1/hospitals/{id}` | Edit data |
| PATCH | `/api/v1/hospitals/{id}/status` | Toggle aktif/nonaktif |
| DELETE | `/api/v1/hospitals/{id}` | Soft delete jika tidak direferensikan |
| POST | `/api/v1/hospitals/duplicate-check` | Cek kandidat duplikat |
| POST | `/api/v1/hospitals/{id}/merge` | Phase 2: merge ke canonical record |

> Create-on-transaction dilakukan oleh service internal N7 dalam satu database transaction. Tidak disarankan frontend memanggil POST hospital lalu POST order secara terpisah.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| name | Nama RS | Text | Ya | 3–150, trim | User/N6 | Kunci pencarian utama |
| address_text | Alamat | Textarea | Tidak | Max 500 | User | Input mentah |
| google_place_id | Google Place | Autocomplete | Tidak | Valid response | Google Maps | Identitas tempat |
| latitude/longitude | Koordinat | Read-only | Tidak | Rentang koordinat valid | Google Maps | Terisi setelah validasi |
| region_id | Wilayah | Cascading select | Tidak | Hierarki valid | Master Wilayah | Opsional Phase 1 |
| phone | Telepon | Text | Tidak | 7–20 | User | — |
| email | Email | Email | Tidak | Format email | User | — |
| is_active | Status | Tidak tampil | — | Otomatis true | Sistem | Toggle di list |

#### 8.3.2 Spesifikasi Data — List View

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|---|---|---|---|---|
| Nama RS | name | Text | Search/sort | Tampilkan badge belum terverifikasi |
| Alamat | formatted_address/address_text | Text | Search | Prioritaskan formatted address |
| Kota/Provinsi | city_name/province_name | Text | Filter | — |
| Kontak | phone/email | Text | — | — |
| Sumber | source | Badge | Filter | Manual/N6/import |
| Verifikasi | verification_status | Badge | Filter | — |
| Status | is_active | Toggle/badge | Filter | Toggle di dashboard |
| Terakhir Diubah | updated_at/updated_by | Date + user | Sort desc | Audit |

**Business Rules**

- **BR-N5-01:** N4 adalah RS internal; N5 adalah direktori RS eksternal. Keduanya tidak boleh disamakan tanpa keputusan arsitektur eksplisit.
- **BR-N5-02:** Status create selalu AKTIF dan tidak diinput di form.
- **BR-N5-03:** Create-on-transaction dan penyimpanan order N7 harus berada dalam satu unit transaksi atomik.
- **BR-N5-04:** Pemeriksaan duplikat frontend hanya bantuan; backend wajib memeriksa ulang.
- **BR-N5-05:** Record yang sudah dipakai tidak boleh hard delete; nonaktif/merge tidak menghilangkan histori.
- **BR-N5-06:** Perubahan master tidak mengubah snapshot rumah sakit pada transaksi lama.
- **BR-N5-07:** Data otomatis dari N6 ditandai UNVERIFIED sampai diverifikasi admin/data steward.

## 9. Workflow / BPMN Interpretation

**Alur A — CRUD Admin**

1. Admin membuka N5 dan mencari record.
2. Admin menambah/mengedit data; sistem melakukan validasi dan duplicate check.
3. Jika valid, sistem menyimpan sebagai AKTIF dan mencatat audit.
4. Aktif/nonaktif dikelola melalui toggle pada list.

**Alur B — RS Baru dari N7**

1. Operator mencari RS di combobox N7.
2. Jika tidak ditemukan, operator mengetik nama baru dan melengkapi alamat bila tersedia.
3. Saat Simpan transaksi, backend memeriksa ulang exact match/place ID.
4. Existing ditemukan → gunakan `hospital_id` existing. Tidak ditemukan → buat N5 sumber `AMBULANCE_TRANSACTION` dan UNVERIFIED.
5. Simpan `hospital_id` dan snapshot pada order N7 dalam transaksi database yang sama; N6 membaca data yang sama saat konfirmasi.
6. Jika ada kegagalan, seluruh perubahan di-rollback.

## Asumsi

- [ASUMSI] N5 menyimpan RS eksternal, sedangkan RS saat ini berasal dari N4.
- [ASUMSI] Record otomatis dapat langsung digunakan oleh transaksi pembuat meski berstatus UNVERIFIED.
- [ASUMSI] Duplicate check MVP memakai normalized exact match + kota/place ID; fuzzy merge masuk Phase 2.
- [ASUMSI] Master Wilayah dan validasi Google bersifat opsional untuk kelengkapan N5 Phase 1.

## Pertanyaan Terbuka

- Apakah N5 hanya untuk RS eksternal atau juga mendukung cabang/jejaring RS internal?
- Field minimal selain nama untuk record baru dari N6: apakah alamat wajib?
- Siapa role yang memverifikasi record otomatis, dan apakah record UNVERIFIED boleh digunakan transaksi berikutnya?
- Apakah tersedia direktori RS nasional/SATUSEHAT yang perlu dijadikan sumber sinkronisasi?
- Apa aturan final deteksi dan merge duplikat?
