# PRD — Konfirmasi Ambulance (N6)

**Related Document:** `template.md`; `bahan_random/Ambulance.vue`; PRD N7 Order Ambulance; PRD N5 Master Data Rumah Sakit; PRD N4 Profil Rumah Sakit; Master Data Staff; Master Wilayah  
**Versi:** 1.1 — Pemisahan N6/N7  
**Tanggal:** 2026-07-19

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|---|---|---|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-18 |
| Diperiksa oleh | [PERLU KONFIRMASI] Kepala Ambulance / Kepala Pelayanan | — |
| Disetujui oleh | [PERLU KONFIRMASI] Manajemen Rumah Sakit | — |

**Related Documents**

- `template.md` — format standar PRD.
- `bahan_random/Ambulance.vue` — baseline V1 untuk tab Permintaan/Riwayat, pencarian, status, dan navigasi proses.
- **N7 — Order Ambulance** — sumber order dari tindakan dan form detail order.
- **N5 — Master Data Rumah Sakit** — referensi RS eksternal dan tujuan create-on-transaction.
- **N4 — Profil Rumah Sakit** — sumber alamat/koordinat RS saat ini.
- **Master Data Staff** — sumber driver dengan filter role/tipe Driver.
- **Master Wilayah** — referensi wilayah alamat (opsional).

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 2026-07-18 | 1.0 | Draft awal order ambulance, penentuan rute, validasi alamat, kalkulasi jarak/tarif, pemilihan RS dan driver. |
| 2026-07-19 | 1.1 | Menu diubah menjadi Konfirmasi Ambulance; pembuatan order dipisahkan ke N7; baseline daftar mengacu V1 `Ambulance.vue`. |

## 2. Overview & Background

**Overview / Brief Summary**

N6 adalah workspace operasional untuk **mengonfirmasi, menjalankan, memperbarui, menyelesaikan, membatalkan, dan melihat riwayat** order ambulance yang dibuat oleh N7. Mengacu V1 `Ambulance.vue`, halaman terdiri dari tab **Permintaan** dan **Riwayat**, pencarian pasien/No. RM/staff, pagination, indikator status, serta aksi Konfirmasi/Update/Detail. Saat membuka order, operator meninjau data pasien, tindakan & BHP, staff pendamping, rute, rumah sakit, jarak, fee, dan driver. Perubahan rute sebelum perjalanan mewajibkan kalkulasi ulang. Tombol **Hitung Jarak** memanggil layanan jarak Google Maps; sistem menghitung fee dengan formula:

`total_fee = (distance_km × rate_per_km) + base_fee`

Untuk tipe **Ke Rumah Sakit Saat Ini**, tujuan adalah RS current/existing dari N4 dan asal adalah alamat jemput. Untuk tipe **Dari Rumah Sakit Saat Ini**, asal adalah RS current/existing dan tujuan adalah alamat antar/RS tujuan. Istilah “RS Existing” dalam kebutuhan ditafsirkan sebagai RS tempat aplikasi berjalan (N4); konfirmasi bisnis tetap diperlukan.

**Business Process (As-Is vs To-Be)**

**As-Is:** [ASUMSI]

- Permintaan ambulance diteruskan manual via telepon/chat dan dicatat ulang oleh petugas.
- Alamat tidak tervalidasi, jarak dihitung manual, dan fee berpotensi berbeda antarpetugas.
- Penugasan driver dan status perjalanan tidak terpantau pada satu sistem.
- Nama RS baru ditulis bebas tanpa membentuk referensi master.

**To-Be:**

- Pemilihan tindakan Ambulance membuat order N7 otomatis tanpa input ulang data pasien/kunjungan; order masuk antrean Permintaan N6.
- Sistem menentukan sisi asal/tujuan berdasarkan tipe perjalanan dan mengunci titik RS saat ini dari N4.
- Alamat dipilih/divalidasi melalui Google Maps; operator menekan Hitung Jarak untuk memperoleh jarak tempuh.
- Fee dihitung otomatis dari snapshot tarif dasar dan tarif per km yang berlaku.
- Driver hanya dapat dipilih dari staff aktif ber-role Driver.
- RS yang belum ada dapat diketik dan otomatis dibuat di N5 ketika transaksi disimpan.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---|---|---|
| 1 | Integrasi order | 100% order N7 yang siap diproses muncul tepat satu kali pada tab Permintaan N6. |
| 2 | Eliminasi input ulang | Data pasien, encounter, tindakan, dan requester terisi otomatis pada order. |
| 3 | Validasi rute | 100% order yang dikonfirmasi memiliki titik asal/tujuan tervalidasi dan koordinat valid. |
| 4 | Akurasi kalkulasi | 100% fee sistem sesuai `(jarak × tarif/km) + tarif dasar` dalam toleransi pembulatan yang ditetapkan. |
| 5 | Validitas driver | 100% driver terpilih berasal dari staff aktif ber-role Driver. |
| 6 | Integritas data | 0 order duplikat dari retry event tindakan; 0 RS master yatim akibat transaksi gagal. |
| 7 | Kinerja kalkulasi | Respons Hitung Jarak p95 < 5 detik di luar gangguan provider. [ASUMSI target] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: Fungsi Dasar) | Phase 2 (Advanced: Approval/Escalation) |
|---|---|---|
| Intake order | Menerima order N7; tab Permintaan/Riwayat, list dan detail | Prioritas/dispatch otomatis dan SLA escalation |
| Rute | 2 tipe perjalanan, Google validation, hitung jarak | Multi-stop, round trip, live traffic/reroute |
| Tarif | Hitung otomatis dan snapshot komponen tarif | Approval override/diskon dan aturan tarif bertingkat |
| RS | Pilih N5 atau ketik baru; RS current dari N4 | Review master baru dan rekomendasi RS |
| Driver | Pilih staff aktif role Driver | Penjadwalan, availability, kendaraan, GPS tracking |
| Status | Order baru hingga selesai/batal | Approval pembatalan, escalation keterlambatan |
| Riwayat | Audit perubahan dan snapshot rute/tarif | Dashboard SLA dan analitik operasional |

**Out of Scope**

- GPS/live tracking kendaraan, optimasi armada, maintenance kendaraan, dan inventaris ambulance.
- Pembayaran/kasir/claim penjamin; N6 hanya menghasilkan nilai fee untuk diteruskan ke billing jika integrasi disepakati.
- Multi-stop, perjalanan pulang-pergi, toll/parking/waiting fee, dan perubahan tarif berbasis jenis kendaraan.
- Pemesanan ambulance tanpa tindakan pasien. [PERLU KONFIRMASI]
- Integrasi wilayah wajib; Phase 1 menyediakan tautan wilayah secara opsional.

## 5. Related Features

| Kode / Modul | Relasi Teknis / Bisnis |
|---|---|
| N7 — Order Ambulance | Membuat/melengkapi order dari tindakan; order tersimpan muncul pada antrean N6. |
| Menu Tindakan | Memicu pembentukan N7, bukan menulis langsung ke N6. |
| N4 — Profil Rumah Sakit | Menyediakan nama, alamat, Google Place/koordinat RS saat ini. Kalkulasi diblokir jika koordinat RS current belum valid. |
| N5 — Master Data Rumah Sakit | Dropdown RS eksternal serta create-on-transaction untuk nama baru. |
| Master Data Staff | Dropdown driver difilter `role=DRIVER` dan `is_active=true`. |
| Master Wilayah | Referensi opsional untuk rekap alamat jemput/antar. |
| Google Maps | Validasi/geocoding alamat dan perhitungan jarak rute. |
| Billing/Kasir | [PERLU KONFIRMASI] Menerima fee ambulance setelah order dikonfirmasi/selesai. |

## 6. Business Process & User Stories

**State Machine Table**

| Status | Deskripsi | Efek Billing/Operasional | Transisi (Phase 1) | Transisi (Phase 2) |
|---|---|---|---|---|
| MENUNGGU_DIPROSES | Dibuat otomatis dari tindakan | Belum ditagihkan | → DRAFT/DIKONFIRMASI/DIBATALKAN | SLA escalation |
| DRAFT | Operator melengkapi data | Belum ditagihkan | → DIKONFIRMASI/DIBATALKAN | → PENDING_APPROVAL bila override |
| DIKONFIRMASI | Rute, fee, dan driver valid | Fee siap dikirim ke billing [ASUMSI] | → DALAM_PERJALANAN/DIBATALKAN | Dispatch approval opsional |
| DALAM_PERJALANAN | Driver memulai perjalanan | Tidak boleh ubah rute/tarif tanpa reopen | → SELESAI/DIBATALKAN | Live tracking/escalation |
| SELESAI | Perjalanan selesai | Final untuk histori/billing | Terminal | Koreksi via workflow approval |
| DIBATALKAN | Order dibatalkan dengan alasan | Fee tidak ditagihkan/void [ASUMSI] | Terminal | Pembatalan setelah confirm perlu approval |

**User Stories Utama**

- **US-N6-01:** Sebagai Operator Ambulance, saya ingin melihat Permintaan dan Riwayat agar dapat memproses order N7 berdasarkan status.
- **US-N6-02:** Sebagai Operator Ambulance, saya ingin memilih tipe perjalanan agar asal/tujuan terisi dengan benar.
- **US-N6-03:** Sebagai Operator, saya ingin memvalidasi alamat dan menghitung jarak agar rute terukur.
- **US-N6-04:** Sebagai Kasir/Operator, saya ingin fee dihitung otomatis agar tarif konsisten.
- **US-N6-05:** Sebagai Operator, saya ingin memilih atau mengetik RS baru agar transaksi tidak terhambat.
- **US-N6-06:** Sebagai Dispatcher, saya ingin memilih driver yang valid agar perjalanan dapat ditugaskan.
- **US-N6-07:** Sebagai Manajemen, saya ingin melihat status dan audit order agar layanan dapat dimonitor.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-N6-01 — Daftar Permintaan dan Riwayat**

- **User Story:** US-N6-01, US-N6-07
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Tab Permintaan menampilkan order N7 berstatus MENUNGGU_DIPROSES, DRAFT, DIKONFIRMASI, atau DALAM_PERJALANAN; SELESAI/DIBATALKAN masuk tab Riwayat.
  - **AC 2:** Kolom minimum mengikuti V1: tanggal order, unit, pasien + No. RM, tipe penjamin, tindakan, staff pendamping, tujuan/rute, dan status.
  - **AC 3:** Pencarian case-insensitive mendukung nama pasien, No. RM, dan nama staff; input di-debounce maksimal 500 ms.
  - **AC 4:** List memakai pagination server-side, refresh manual, filter status, tipe perjalanan, dan rentang tanggal.
  - **AC 5:** Order belum dikonfirmasi menyediakan aksi **Konfirmasi**; order dikonfirmasi menyediakan badge **Dilayani** dan aksi **Update**; riwayat menyediakan aksi **Detail** read-only.
  - **AC 6:** Detail menampilkan snapshot pasien, tindakan & BHP, dokter/perawat pendamping, rute, fee, dan driver.

**Fitur: FR-N6-02 — Tipe Perjalanan dan Pemetaan Asal/Tujuan**

- **User Story:** US-N6-02
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Tipe hanya `TO_CURRENT_HOSPITAL` (Ke Rumah Sakit Saat Ini) atau `FROM_CURRENT_HOSPITAL` (Dari Rumah Sakit Saat Ini).
  - **AC 2:** `TO_CURRENT_HOSPITAL`: To diisi dan dikunci dari N4; From wajib berupa alamat jemput tervalidasi dan dapat terkait N5 bila asal adalah RS eksternal.
  - **AC 3:** `FROM_CURRENT_HOSPITAL`: From diisi dan dikunci dari N4; To wajib berupa alamat antar tervalidasi dan dapat terkait N5 bila tujuan adalah RS eksternal.
  - **AC 4:** Mengubah tipe perjalanan menghapus hasil kalkulasi lama (`distance`, `duration`, `fee`, `route_calculated_at`) dan meminta konfirmasi bila alamat sisi bebas sudah terisi.
  - **AC 5:** N4 harus memiliki alamat/koordinat valid; jika tidak, Hitung Jarak diblokir dengan instruksi melengkapi Profil RS.

**Fitur: FR-N6-03 — Input dan Validasi Alamat**

- **User Story:** US-N6-03
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** User dapat mengetik alamat; aplikasi menampilkan saran Google Maps dan menyimpan pilihan sebagai `place_id`, formatted address, latitude, longitude.
  - **AC 2:** Text input yang berubah setelah validasi mengubah status alamat menjadi BELUM_VALID dan mengosongkan hasil jarak/fee.
  - **AC 3:** Tombol Hitung Jarak hanya aktif bila kedua endpoint memiliki koordinat valid.
  - **AC 4:** Referensi Master Wilayah bersifat opsional dan tidak menghalangi kalkulasi jika koordinat valid.
  - **AC 5:** Bila layanan validasi gagal, input tidak hilang; tampilkan error dan tombol Coba Lagi.

**Fitur: FR-N6-04 — Pemilihan Rumah Sakit dan Create-on-Transaction**

- **User Story:** US-N6-05
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Combobox RS mengambil record N5 AKTIF dan mendukung pencarian nama/alamat.
  - **AC 2:** Jika tidak ditemukan, user dapat memilih aksi `Gunakan “{nama}” sebagai rumah sakit baru`.
  - **AC 3:** Penyimpanan order dengan RS baru menjalankan duplicate check backend, membuat N5 bila perlu, dan menautkan `hospital_id` secara atomik.
  - **AC 4:** Bila save order gagal, RS baru tidak boleh tertinggal di N5.
  - **AC 5:** Transaksi menyimpan snapshot nama/alamat/koordinat RS agar histori tidak berubah saat master diedit.

**Fitur: FR-N6-05 — Hitung Jarak melalui Google Maps**

- **User Story:** US-N6-03
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Klik Hitung Jarak mengirim koordinat/place ID origin dan destination ke backend; API key tidak diekspos untuk pemanggilan server-side.
  - **AC 2:** Sistem menggunakan jarak rute kendaraan (`driving distance`), bukan garis lurus, lalu menyimpan nilai asli meter dan tampilan kilometer.
  - **AC 3:** Tampilan km dibulatkan 2 desimal; basis fee menggunakan meter/jarak presisi atau aturan pembulatan tarif yang dikonfigurasi. [PERLU KONFIRMASI]
  - **AC 4:** Sistem menyimpan provider, request timestamp, distance meter, duration second, status provider, dan hash origin/destination untuk audit/cache.
  - **AC 5:** Respons tidak memiliki rute → kalkulasi gagal, fee tidak terisi, dan user melihat “Rute tidak ditemukan. Periksa alamat asal dan tujuan.”
  - **AC 6:** Timeout/quota/provider error tidak menghasilkan fee nol; tampilkan error yang dapat dicoba ulang dan catat log teknis tanpa mengekspos API key.
  - **AC 7:** Perubahan origin/destination setelah kalkulasi menandai hasil KADALUARSA dan mengosongkan fee sampai dihitung ulang.

**Fitur: FR-N6-06 — Kalkulasi Tarif Ambulance**

- **User Story:** US-N6-04
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Setelah jarak sukses, sistem mengambil konfigurasi tarif aktif dan menghitung `fee = (billable_distance_km × rate_per_km) + base_fee`.
  - **AC 2:** Base fee, rate per km, jarak tagih, formula version, dan total fee disimpan sebagai snapshot pada order.
  - **AC 3:** Seluruh perhitungan menggunakan decimal, bukan floating point; total Rupiah dibulatkan mengikuti kebijakan tarif. [PERLU KONFIRMASI]
  - **AC 4:** Jika konfigurasi tarif tidak ada/tidak aktif, sistem menampilkan error dan order tidak dapat DIKONFIRMASI.
  - **AC 5:** Operator tidak dapat mengedit jarak atau fee hasil sistem pada Phase 1.
  - **AC 6:** Contoh uji: jarak tagih 12,50 km, tarif/km Rp10.000, tarif dasar Rp100.000 menghasilkan Rp225.000.

**Fitur: FR-N6-07 — Pemilihan Driver**

- **User Story:** US-N6-06
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Dropdown hanya memuat staff `is_active=true` dan memiliki role/tipe `DRIVER`.
  - **AC 2:** Backend memvalidasi ulang role dan status driver saat simpan/konfirmasi; payload driver tidak valid ditolak.
  - **AC 3:** Driver wajib sebelum status DIKONFIRMASI, tetapi boleh kosong saat DRAFT.
  - **AC 4:** Jika driver dinonaktifkan setelah dipilih tetapi sebelum konfirmasi, konfirmasi ditolak dan operator harus memilih ulang.
  - **AC 5:** Cegah penugasan driver pada order aktif yang waktunya bentrok jika jadwal tersedia. [PERLU KONFIRMASI; minimal beri peringatan]

**Fitur: FR-N6-08 — Simpan, Konfirmasi, Mulai, Selesai, dan Batal**

- **User Story:** US-N6-07
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** DRAFT dapat disimpan tanpa driver/jarak final; DIKONFIRMASI mensyaratkan tipe, endpoint valid, kalkulasi terbaru, tarif aktif, dan driver valid.
  - **AC 2:** Hanya transisi pada state machine yang diterima; transisi ilegal menghasilkan HTTP 409.
  - **AC 3:** MULAI mencatat `started_at`; SELESAI mencatat `completed_at`; BATAL wajib alasan minimal 5 karakter dan `cancelled_by/at`.
  - **AC 4:** Setelah DALAM_PERJALANAN, rute/tarif/driver terkunci; koreksi membutuhkan pembatalan/reopen sesuai hak akses. [PERLU KONFIRMASI]
  - **AC 5:** Semua transisi dan perubahan field penting dicatat pada audit log.

**Fitur: FR-N6-09 — Approval Override/Escalation**

- **User Story:** US-N6-07
- **Prioritas:** P2
- **Fase:** Phase 2
- **Acceptance Criteria:**
  - **AC 1:** Override tarif/rute atau pembatalan setelah konfirmasi menghasilkan PENDING_APPROVAL.
  - **AC 2:** Approver dapat approve/reject dengan catatan; nilai aktif tidak berubah sebelum approved.
  - **AC 3:** Order melewati SLA MENUNGGU_DIPROSES memicu notifikasi/escalation sesuai konfigurasi.

**Validasi — Wording Frontend**

| Field | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Tipe Perjalanan | Radio/Select | Required, 2 opsi | “Tipe perjalanan wajib dipilih” | “Tentukan arah perjalanan terhadap RS saat ini” |
| Rumah Sakit | Creatable combobox | Conditional, N5/new 3–150 | “Pilih atau ketik nama rumah sakit” | “Data baru disimpan ke Master RS saat transaksi disimpan” |
| Alamat Jemput/Antar | Google autocomplete + text | Required pada sisi bebas, harus tervalidasi saat confirm | “Pilih alamat yang valid dari Google Maps” | “Ketik alamat lalu pilih hasil yang sesuai” |
| Wilayah | Cascading select | Optional | “Wilayah tidak valid” | “Opsional untuk kebutuhan rekap” |
| Driver | Dropdown | Required saat confirm, active Driver | “Driver aktif wajib dipilih” | “Daftar hanya menampilkan staff dengan role Driver” |
| Jarak | Read-only | Hasil provider, >0 | “Hitung jarak terlebih dahulu” | “Klik Hitung Jarak setelah alamat tervalidasi” |
| Tarif Dasar | Read-only currency | Konfigurasi aktif | “Konfigurasi tarif dasar tidak tersedia” | “Diambil otomatis dari konfigurasi tarif” |
| Tarif per KM | Read-only currency | Konfigurasi aktif | “Konfigurasi tarif per km tidak tersedia” | “Diambil otomatis dari konfigurasi tarif” |
| Total Fee | Read-only currency | Hasil formula | “Tarif belum dapat dihitung” | “(Jarak × Tarif per KM) + Tarif Dasar” |
| Alasan Batal | Textarea | Required saat cancel, min 5, max 500 | “Alasan pembatalan wajib diisi” | “Jelaskan alasan pembatalan” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table Name: `ambulance_orders`**

- `id`: UUID, PK
- `order_number`: VARCHAR(50), unique
- `source_action_id`: UUID, required, unique (idempotency)
- `patient_id`, `encounter_id`, `requesting_unit_id`: UUID, required sesuai konteks
- `requested_by`: UUID; `requested_at`: TIMESTAMP
- `trip_type`: ENUM(`TO_CURRENT_HOSPITAL`,`FROM_CURRENT_HOSPITAL`)
- `status`: ENUM(`WAITING`,`DRAFT`,`CONFIRMED`,`IN_PROGRESS`,`COMPLETED`,`CANCELLED`)
- `current_hospital_profile_id`: UUID, FK → N4/snapshot reference
- `external_hospital_id`: UUID, nullable, FK → `hospitals.id`
- `origin_address_text`, `origin_formatted_address`: VARCHAR(500)
- `origin_google_place_id`: VARCHAR(255), nullable
- `origin_latitude`, `origin_longitude`: DECIMAL(10,7)
- `origin_region_id`: UUID, nullable
- `destination_address_text`, `destination_formatted_address`: VARCHAR(500)
- `destination_google_place_id`: VARCHAR(255), nullable
- `destination_latitude`, `destination_longitude`: DECIMAL(10,7)
- `destination_region_id`: UUID, nullable
- `hospital_name_snapshot`, `hospital_address_snapshot`: VARCHAR
- `driver_staff_id`: UUID, nullable, FK → staff
- `distance_meters`: BIGINT, nullable
- `duration_seconds`: BIGINT, nullable
- `distance_provider`: VARCHAR(50), nullable
- `route_calculated_at`: TIMESTAMP, nullable
- `route_points_hash`: VARCHAR(128), nullable
- `base_fee`: DECIMAL(18,2), nullable
- `rate_per_km`: DECIMAL(18,2), nullable
- `billable_distance_km`: DECIMAL(12,3), nullable
- `total_fee`: DECIMAL(18,2), nullable
- `tariff_config_id`: UUID, nullable
- `tariff_formula_version`: VARCHAR(20), nullable
- `started_at`, `completed_at`, `cancelled_at`: TIMESTAMP, nullable
- `cancellation_reason`: VARCHAR(500), nullable
- `status_approval`: ENUM(`APPROVED`,`PENDING_APPROVAL`,`REJECTED`), default `APPROVED`
- `role_approver`: VARCHAR(100), nullable
- `created_by`, `updated_by`, `cancelled_by`: UUID
- `created_at`, `updated_at`: TIMESTAMP

**Table Name: `ambulance_tariff_configs`**

- `id`: UUID, PK
- `name`: VARCHAR(100)
- `base_fee`: DECIMAL(18,2)
- `rate_per_km`: DECIMAL(18,2)
- `distance_rounding_method`: ENUM(`EXACT`,`CEIL_KM`,`ROUND_KM`,`ROUND_0_1_KM`)
- `currency`: CHAR(3), default `IDR`
- `effective_from`, `effective_to`: TIMESTAMP, nullable
- `is_active`: BOOLEAN, default true
- `status_approval`, `role_approver`: prepared for Phase 2
- audit columns

**Table Name: `ambulance_order_status_logs`**

- `id`: UUID, PK
- `ambulance_order_id`: UUID, FK
- `from_status`, `to_status`: VARCHAR(30)
- `note`: VARCHAR(500), nullable
- `changed_by`: UUID; `changed_at`: TIMESTAMP

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/ambulance-orders` | List/filter order |
| GET | `/api/v1/ambulance-orders/{id}` | Detail order |
| PUT | `/api/v1/ambulance-orders/{id}` | Simpan/perbarui DRAFT, termasuk RS baru atomik |
| POST | `/api/v1/ambulance-orders/{id}/calculate-route` | Validasi endpoint, panggil distance provider, hitung fee |
| POST | `/api/v1/ambulance-orders/{id}/confirm` | Validasi lengkap dan konfirmasi |
| POST | `/api/v1/ambulance-orders/{id}/start` | Mulai perjalanan |
| POST | `/api/v1/ambulance-orders/{id}/complete` | Selesaikan perjalanan |
| POST | `/api/v1/ambulance-orders/{id}/cancel` | Batalkan dengan alasan |
| GET | `/api/v1/staff?role=DRIVER&is_active=true` | Sumber dropdown driver |
| GET | `/api/v1/hospitals/search?q={query}` | Sumber creatable combobox N5 |
| GET | `/api/v1/hospital-profile` | Sumber RS saat ini (N4) |
| GET | `/api/v1/ambulance-tariff-configs/active` | Konfigurasi tarif aktif |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| patient | Pasien | Read-only | Ya | Dari tindakan | Menu Tindakan | Tidak dapat diubah |
| trip_type | Tipe Perjalanan | Radio | Ya | Dua enum | User | Mengatur sisi RS current |
| current_hospital | RS Saat Ini | Read-only | Ya | N4 lengkap | N4 | Terkunci |
| external_hospital | Rumah Sakit | Creatable combobox | Kondisional | N5 atau nama baru | N5/User | Jika alamat merupakan RS |
| free_address | Alamat Jemput/Antar | Autocomplete | Ya | Google validated saat confirm | User/Google | Sisi bebas sesuai trip type |
| region_id | Wilayah | Cascading select | Tidak | Hierarki valid | Master Wilayah | Opsional |
| driver_staff_id | Driver | Select | Saat confirm | Staff aktif role Driver | Master Staff | Boleh kosong di draft |
| distance | Jarak | Read-only | Saat confirm | >0 dan tidak stale | Provider | Meter disimpan, km ditampilkan |
| base_fee/rate/total | Tarif | Read-only | Saat confirm | Konfigurasi aktif | Sistem | Snapshot |

#### 8.3.2 Spesifikasi Data — List View

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|---|---|---|---|---|
| No. Order | order_number | Text/link | Search/sort | — |
| Waktu Order | requested_at | dd-MM-yyyy HH:mm | Range/sort desc | — |
| Pasien | patient | No. RM + nama | Search | Hak akses data pasien berlaku |
| Tipe | trip_type | Badge | Filter | Ke/Dari RS Saat Ini |
| Rute | origin → destination snapshot | Text | Search | Ringkas |
| Driver | driver snapshot/current | Text | Filter | — |
| Jarak | distance_meters | `0.00 km` | Sort | — |
| Fee | total_fee | Rupiah | Sort | — |
| Status | status | Badge | Filter | — |
| Aksi | state + permission | Button/menu | — | Detail/proses/cancel |

**Business Rules**

- **BR-N6-01:** N6 hanya memproses order yang dibentuk N7; satu order tampil satu kali sesuai ID dan statusnya.
- **BR-N6-02:** Trip type menentukan titik RS current yang terkunci; sisi lain merupakan alamat bebas/RS eksternal.
- **BR-N6-03:** Jarak harus berasal dari rute berkendara provider dan tidak boleh diedit manual pada Phase 1.
- **BR-N6-04:** Fee hanya dihitung setelah rute valid, menggunakan snapshot tarif aktif.
- **BR-N6-05:** Perubahan endpoint membatalkan kalkulasi lama dan mewajibkan Hitung Jarak ulang.
- **BR-N6-06:** RS baru dan order disimpan atomik; histori menyimpan FK dan snapshot.
- **BR-N6-07:** Driver wajib aktif dan memiliki role Driver pada saat konfirmasi.
- **BR-N6-08:** Order hanya bergerak sesuai state machine; seluruh transisi diaudit.
- **BR-N6-09:** Status tidak diinput bebas; N6 mengubah status hanya melalui aksi state machine yang valid.
- **BR-N6-10:** API key/provider secret disimpan server-side; log tidak boleh memuat secret atau data pasien berlebih.

## 9. Workflow / BPMN Interpretation

**Alur Utama Phase 1**

1. N7 mengajukan order ambulance yang berasal dari tindakan pasien.
2. Order muncul satu kali pada tab **Permintaan** N6.
3. Operator mencari/memilih order dan membuka detail; data pasien/kunjungan, tindakan & BHP, serta staff pendamping tampil.
4. Operator memilih tipe perjalanan:
   - Ke RS Saat Ini → To = N4, From = alamat jemput.
   - Dari RS Saat Ini → From = N4, To = alamat antar.
5. Operator memilih RS N5 atau mengetik nama RS baru bila konteks alamat merupakan rumah sakit.
6. Operator mengetik dan memilih alamat valid dari Google Maps; wilayah dapat dipilih opsional.
7. Operator klik **Hitung Jarak** → backend menghitung driving distance → mengambil tarif aktif → menghitung fee.
8. Operator memilih driver dari staff aktif ber-role Driver.
9. Operator menyimpan draft atau mengonfirmasi. Saat konfirmasi, backend memvalidasi ulang semua prasyarat.
10. Normalnya relasi N5 sudah dibentuk N7; jika data rute dikoreksi ke RS baru sebelum konfirmasi, N6 memakai mekanisme atomik yang sama.
11. Driver memulai perjalanan → status DALAM_PERJALANAN; setelah selesai → SELESAI.
12. Pembatalan menyimpan alasan dan audit; perlakuan billing mengikuti keputusan integrasi.

**Diagram alur ringkas**

`Tindakan Ambulance → N7 Order Ambulance → Permintaan N6 → review/validasi → Konfirmasi → Dilayani/Update → Selesai → Riwayat`

## Asumsi

- [ASUMSI] “Rumah Sakit Saat Ini/RS Existing” adalah profil RS internal dari N4.
- [ASUMSI] Mengikuti V1 `Ambulance.vue`, N6 mencakup tab Permintaan dan Riwayat dalam satu menu.
- [ASUMSI] Tarif disimpan pada konfigurasi khusus ambulance; nilai pada transaksi selalu snapshot.
- [ASUMSI] Jarak dihitung untuk moda driving dan satu arah, tanpa multi-stop/tol/parkir.
- [ASUMSI] Fee siap diteruskan ke billing saat DIKONFIRMASI; titik posting final perlu dikonfirmasi.
- [ASUMSI] Draft boleh belum lengkap; konfirmasi wajib lengkap.

## Pertanyaan Terbuka

- Apakah “RS Existing” berarti RS internal dari N4 atau RS yang sudah ada pada N5?
- Di menu mana tarif dasar, tarif per km, metode pembulatan, dan periode efektif dikonfigurasi?
- Apakah jarak tagih memakai nilai presisi, pembulatan ke atas per km, atau aturan lain?
- Apakah durasi/traffic, tol, parkir, waiting fee, jenis kendaraan, atau round trip memengaruhi tarif?
- Kapan fee diposting ke billing: saat konfirmasi, mulai, atau selesai? Bagaimana void saat batal?
- Apakah alamat bebas wajib dipilih dari Google Maps, atau boleh override manual ketika provider bermasalah?
- Apakah driver dapat menangani order bentrok, dan apakah perlu memilih kendaraan/ambulance?
- Siapa role yang boleh memproses, membatalkan, dan mengoreksi order?
- Apakah pembatalan tindakan setelah order diproses harus otomatis membatalkan N6 atau membutuhkan konfirmasi operator?
