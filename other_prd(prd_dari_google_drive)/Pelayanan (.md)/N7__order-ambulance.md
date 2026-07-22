# PRD — Order Ambulance (N7)

**Related Document:** `template.md`; `bahan_random/OrderAmbulance.vue`; PRD N6 Konfirmasi Ambulance; PRD N5 Master Data Rumah Sakit; PRD N4 Profil Rumah Sakit; Menu Tindakan; Master Data Staff  
**Versi:** 1.0 — Draft awal  
**Tanggal:** 2026-07-19

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|---|---|---|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa oleh | [PERLU KONFIRMASI] Kepala Ambulance / Kepala Pelayanan | — |
| Disetujui oleh | [PERLU KONFIRMASI] Manajemen Rumah Sakit | — |

**Related Documents**

- `bahan_random/OrderAmbulance.vue` — baseline V1 untuk detail pasien, tindakan & BHP, staff pendamping, RS tujuan, jarak, driver, dan simpan order.
- **N6 — Konfirmasi Ambulance** — antrean proses, konfirmasi, update layanan, penyelesaian, dan riwayat.
- **N5 — Master Data Rumah Sakit** — referensi RS eksternal dan tujuan penyimpanan RS baru.
- **N4 — Profil Rumah Sakit** — sumber RS saat ini beserta alamat/koordinatnya.
- **Menu Tindakan** — pemicu pembentukan order ketika tindakan Ambulance dipilih.
- **Master Data Staff** — sumber driver aktif serta dokter/perawat pendamping.

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 2026-07-19 | 1.0 | Draft awal N7 berdasarkan `OrderAmbulance.vue` V1 dan kebutuhan peningkatan V2. |

## 2. Overview & Background

**Overview / Brief Summary**

N7 menyediakan form pembentukan dan pelengkapan **Order Ambulance**. Order dibuat otomatis ketika tindakan Ambulance dipilih pada Menu Tindakan, lalu user melengkapi data perjalanan sebelum order diproses di N6.

Baseline V1 menampilkan data pasien (tanggal order, nama, No. RM, unit, penjamin), ringkasan tindakan & BHP, dokter/perawat pendamping, RS tujuan, jarak manual, tautan Google Maps, driver, dan flag selesai. V2 mempertahankan konteks tersebut dengan perbaikan berikut:

- Mendukung dua tipe perjalanan: **Ke Rumah Sakit Saat Ini** dan **Dari Rumah Sakit Saat Ini**.
- Menggunakan N4 untuk titik RS saat ini dan N5 untuk RS eksternal.
- Alamat divalidasi Google Maps dan jarak dihitung sistem, tidak diketik manual.
- Fee dihitung otomatis: `(jarak km × tarif per km) + tarif dasar`.
- RS baru dapat diketik dan disimpan otomatis ke N5 ketika order berhasil disimpan.
- Penyelesaian layanan dipindahkan ke N6; N7 fokus pada pembuatan/pelengkapan order.

**Business Process (As-Is vs To-Be)**

**As-Is — V1:**

- Detail order dibuka dari halaman Layanan Ambulance.
- RS tujuan dipilih dari `/masterdata/hospital`; jarak dapat diinput manual dan link Google Maps hanya membantu melihat rute.
- Driver diambil dari `/staff/driver`.
- Payload V1 memakai `destination_hospital`, `estimated_distance`, driver, `isConfirm`, dan `isFinish` pada endpoint update berdasarkan registrasi.
- Form berorientasi rujuk ke RS tujuan; belum memodelkan asal/tujuan dua arah secara eksplisit.
- Jarak dapat tersimpan pada master RS (`total_distance`), sehingga berisiko menganggap jarak selalu sama untuk semua titik asal.

**To-Be — V2:**

- Satu tindakan Ambulance menghasilkan tepat satu draft/order N7 secara idempotent.
- Data klinis dan registrasi terisi otomatis serta tampil read-only.
- User menentukan tipe perjalanan, RS/alamat sisi bebas, dan memilih hasil validasi Google Maps.
- Sistem menghitung jarak per transaksi berdasarkan pasangan koordinat aktual dan menyimpan snapshot rute/tarif pada order, bukan sebagai jarak universal di N5.
- Setelah order disimpan, order muncul di tab Permintaan N6 untuk dikonfirmasi dan dilayani.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---|---|---|
| 1 | Pembentukan otomatis | 100% tindakan Ambulance sukses menghasilkan tepat satu order N7. |
| 2 | Kelengkapan konteks | 100% order menyimpan pasien, encounter, unit, penjamin, requester, tindakan, dan staff pendamping yang relevan. |
| 3 | Validitas alamat | 100% order yang diajukan ke N6 memiliki endpoint rute berkoordinat valid. |
| 4 | Akurasi jarak | 100% jarak berasal dari layanan rute kendaraan dan terkait pasangan origin-destination transaksi. |
| 5 | Akurasi fee | 100% total sesuai formula dan snapshot konfigurasi tarif. |
| 6 | Integritas N5 | 0 RS yatim ketika simpan order gagal; 0 perubahan `total_distance` global akibat rute transaksi. |
| 7 | Validitas driver | Jika driver dipilih di N7, 100% berasal dari staff aktif ber-role Driver. |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP) | Phase 2 (Advanced) |
|---|---|---|
| Trigger order | Otomatis dari tindakan Ambulance, idempotent | Order manual/emergency dengan approval [PERLU KONFIRMASI] |
| Data pasien | Snapshot pasien, kunjungan, unit, penjamin | Enrichment kondisi/priority klinis |
| Tindakan & BHP | Ringkasan dan edit melalui modul tindakan/BHP sesuai hak akses | Approval perubahan setelah konfirmasi |
| Rute | Dua tipe perjalanan, validasi alamat, hitung jarak | Multi-stop/round trip/live traffic |
| Rumah sakit | Pilih N5 atau create-on-transaction; current hospital dari N4 | Review/merge master otomatis |
| Tarif | Hitung otomatis dan snapshot | Tarif bertingkat/override dengan approval |
| Driver | Pilih driver aktif opsional pada draft | Availability, shift, kendaraan, dispatch otomatis |
| Handoff N6 | Simpan order ke antrean Permintaan | SLA/notifikasi/escalation |

**Out of Scope**

- Konfirmasi operasional, mulai, selesai, pembatalan setelah diproses, dan riwayat — milik N6.
- Live GPS, kendaraan, jadwal armada, maintenance, serta optimasi dispatch.
- Multi-stop, round trip, tarif tol/parkir/waktu tunggu, dan jenis ambulance.
- Pengelolaan master tarif secara lengkap di dalam form N7.

## 5. Related Features

| Kode / Modul | Relasi Teknis / Bisnis |
|---|---|
| Menu Tindakan | Publisher `source_action_id`; tindakan Ambulance membuat order N7. |
| N6 — Konfirmasi Ambulance | Consumer order; menampilkan order tersimpan pada tab Permintaan dan mengelola status lanjutan. |
| N4 — Profil Rumah Sakit | Menyediakan endpoint RS current yang dikunci sesuai tipe perjalanan. |
| N5 — Master Data Rumah Sakit | Menyediakan combobox RS eksternal dan menerima RS baru secara atomik. |
| Master Data Staff | Menyediakan driver aktif serta data staff pendamping. |
| Master Wilayah | Referensi opsional wilayah alamat jemput/antar. |
| Google Maps | Autocomplete/geocoding alamat dan perhitungan driving distance. |
| Tindakan & BHP | Menyediakan ringkasan dan mekanisme edit seperti baseline V1. |

## 6. Business Process & User Stories

**State Machine Table**

| Status | Deskripsi | Efek | Transisi (Phase 1) | Transisi (Phase 2) |
|---|---|---|---|---|
| DRAFT | Dibentuk dari tindakan; dapat dilengkapi | Belum siap dikonfirmasi | → DIAJUKAN/DIBATALKAN | → PENDING_APPROVAL jika override |
| DIAJUKAN | Data minimum lengkap dan masuk antrean N6 | Muncul sebagai MENUNGGU_DIPROSES di N6 | Dikelola N6 → DIKONFIRMASI | SLA escalation |
| DIBATALKAN | Tindakan/order dibatalkan sebelum proses N6 | Tidak dapat diproses | Terminal | Reopen dengan approval |

> Setelah DIAJUKAN, status operasional menggunakan state machine N6. N7 tidak menyediakan checkbox “Pasien Selesai Dilayani” seperti V1 karena penyelesaian adalah tanggung jawab N6.

**User Stories Utama**

- **US-N7-01:** Sebagai Petugas Klinis, saya ingin tindakan Ambulance membuat order otomatis agar tidak menginput ulang pasien.
- **US-N7-02:** Sebagai Operator, saya ingin melihat pasien, tindakan/BHP, dan staff pendamping agar konteks order lengkap.
- **US-N7-03:** Sebagai Operator, saya ingin menentukan tipe dan endpoint perjalanan agar rute benar.
- **US-N7-04:** Sebagai Operator, saya ingin menghitung jarak dan fee otomatis agar nilai konsisten.
- **US-N7-05:** Sebagai Operator, saya ingin memilih atau membuat RS baru agar order tidak terhambat.
- **US-N7-06:** Sebagai Dispatcher, saya ingin memilih driver aktif sejak order jika sudah diketahui.
- **US-N7-07:** Sebagai Operator, saya ingin mengajukan order ke N6 agar dapat dikonfirmasi dan dilayani.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-N7-01 — Pembentukan Order dari Tindakan**

- **User Story:** US-N7-01
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Tindakan berkode Ambulance yang berhasil disimpan membuat satu order DRAFT.
  - **AC 2:** `source_action_id` wajib unik; retry event/API mengembalikan order yang sama dan tidak membuat duplikat.
  - **AC 3:** Tindakan selain Ambulance tidak membuat N7.
  - **AC 4:** Pembatalan tindakan sebelum order diproses membatalkan draft dan mencatat sumber/alasan. [ASUMSI]

**Fitur: FR-N7-02 — Data Pasien, Tindakan/BHP, dan Staff Pendamping**

- **User Story:** US-N7-02
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Form menampilkan tanggal order, nama pasien, No. RM, unit/bangsal, tipe penjamin, dokter, dan perawat secara read-only seperti V1.
  - **AC 2:** Ringkasan menampilkan nama tindakan/BHP, jumlah, dan operator; loading/error/empty state tersedia.
  - **AC 3:** Aksi Edit Tindakan & BHP membuka modul terkait dan refresh ringkasan setelah simpan, mengikuti pola V1.
  - **AC 4:** Edit tindakan/BHP tunduk pada RBAC dan tidak boleh mengganti pasien/encounter order.
  - **AC 5:** Saat order diajukan, snapshot ringkasan disimpan untuk audit; sumber canonical tetap pada modul tindakan/BHP.

**Fitur: FR-N7-03 — Tipe Perjalanan dan Endpoint**

- **User Story:** US-N7-03
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Tipe hanya Ke Rumah Sakit Saat Ini (`TO_CURRENT_HOSPITAL`) atau Dari Rumah Sakit Saat Ini (`FROM_CURRENT_HOSPITAL`).
  - **AC 2:** Ke RS Saat Ini: destination dikunci dari N4; origin wajib alamat jemput/RS eksternal.
  - **AC 3:** Dari RS Saat Ini: origin dikunci dari N4; destination wajib alamat antar/RS eksternal.
  - **AC 4:** Mengubah tipe menghapus kalkulasi jarak/fee dan meminta konfirmasi jika sisi bebas sudah terisi.
  - **AC 5:** N4 tanpa koordinat valid memblokir Hitung Jarak dengan pesan untuk melengkapi Profil RS.

**Fitur: FR-N7-04 — Alamat dan Integrasi Master Wilayah**

- **User Story:** US-N7-03
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** User mengetik alamat dan memilih saran Google Maps; sistem menyimpan `place_id`, formatted address, latitude, longitude.
  - **AC 2:** Perubahan teks setelah validasi menandai alamat BELUM_VALID dan mengosongkan jarak/fee.
  - **AC 3:** Master Wilayah opsional; order tetap dapat disimpan jika koordinat valid dan wilayah kosong.
  - **AC 4:** Kegagalan provider tidak menghapus input dan menyediakan Coba Lagi; order boleh disimpan DRAFT tetapi tidak DIAJUKAN.

**Fitur: FR-N7-05 — Pilih/Buat Rumah Sakit**

- **User Story:** US-N7-05
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Creatable combobox mengambil N5 AKTIF dan mencari berdasarkan nama/alamat.
  - **AC 2:** Nama tidak ditemukan dapat dipilih sebagai RS baru dengan panjang 3–150 karakter.
  - **AC 3:** Backend mengulang duplicate check; existing digunakan bila match, selain itu N5 dibuat dengan sumber `AMBULANCE_TRANSACTION` dan UNVERIFIED.
  - **AC 4:** Create N5 dan save order berada dalam satu transaksi database; kegagalan salah satu me-rollback keduanya.
  - **AC 5:** Order menyimpan `hospital_id` dan snapshot nama/alamat/koordinat.

**Fitur: FR-N7-06 — Hitung Jarak**

- **User Story:** US-N7-04
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Tombol aktif hanya jika origin/destination memiliki koordinat valid.
  - **AC 2:** Backend memanggil layanan jarak dengan mode driving; API key tetap server-side.
  - **AC 3:** Sistem menyimpan meter sebagai nilai canonical, duration second, provider, timestamp, dan hash titik rute.
  - **AC 4:** Tampilan km maksimal 2 desimal; jarak tidak dapat diedit manual seperti V1.
  - **AC 5:** Tidak ada rute/timeout/quota error tidak menghasilkan jarak atau fee nol; user mendapat error yang dapat dicoba ulang.
  - **AC 6:** Jarak adalah atribut order/rute, bukan `total_distance` global pada record N5.

**Fitur: FR-N7-07 — Kalkulasi Fee**

- **User Story:** US-N7-04
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Setelah jarak sukses, sistem mengambil tarif aktif dan menghitung `(billable_distance_km × rate_per_km) + base_fee`.
  - **AC 2:** Jarak tagih, tarif dasar, tarif/km, total, aturan pembulatan, dan versi formula disimpan sebagai snapshot.
  - **AC 3:** Tidak ada tarif aktif → order boleh DRAFT tetapi tidak dapat DIAJUKAN.
  - **AC 4:** Perhitungan memakai decimal; contoh 12,50 km × Rp10.000 + Rp100.000 = Rp225.000.
  - **AC 5:** Fee tidak dapat diedit manual pada Phase 1.

**Fitur: FR-N7-08 — Pemilihan Driver**

- **User Story:** US-N7-06
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Dropdown hanya menampilkan staff aktif dengan role/tipe Driver, sebagaimana endpoint V1 `/staff/driver`.
  - **AC 2:** Driver opsional saat simpan DRAFT dan [PERLU KONFIRMASI] apakah wajib saat DIAJUKAN; N6 tetap memvalidasi saat konfirmasi.
  - **AC 3:** Backend menolak ID staff nonaktif/non-Driver.
  - **AC 4:** Bentrok jadwal menampilkan peringatan bila data availability tersedia.

**Fitur: FR-N7-09 — Simpan Draft dan Ajukan ke N6**

- **User Story:** US-N7-07
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Simpan Draft menerima data belum lengkap dan tidak mengubah status menjadi layanan berjalan.
  - **AC 2:** Ajukan mensyaratkan tipe, endpoint tervalidasi, kalkulasi terbaru, tarif aktif, serta data pasien/sumber lengkap.
  - **AC 3:** Setelah sukses DIAJUKAN, order muncul pada tab Permintaan N6 maksimal 5 detik tanpa duplikasi.
  - **AC 4:** N7 tidak menyediakan flag `isFinish`; penyelesaian dilakukan N6.
  - **AC 5:** Semua perubahan mencatat `updated_by/at`; audit menyimpan perubahan rute dan tarif.

**Validasi — Wording Frontend**

| Field | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Tipe Perjalanan | Radio | Required | “Tipe perjalanan wajib dipilih” | “Tentukan arah perjalanan terhadap RS saat ini” |
| Rumah Sakit | Creatable combobox | Conditional, N5/new 3–150 | “Pilih atau ketik nama rumah sakit” | “RS baru disimpan ke Master RS saat order disimpan” |
| Alamat Jemput/Antar | Google autocomplete | Required saat ajukan | “Pilih alamat yang valid dari Google Maps” | “Ketik alamat lalu pilih hasil yang sesuai” |
| Wilayah | Cascading dropdown | Optional | “Wilayah yang dipilih tidak valid” | “Opsional untuk rekap” |
| Driver | Dropdown | Optional di draft | “Staff yang dipilih bukan driver aktif” | “Daftar berasal dari Master Staff role Driver” |
| Jarak | Read-only | Hasil provider > 0 | “Hitung jarak terlebih dahulu” | “Jarak dihitung otomatis berdasarkan rute” |
| Tarif Dasar | Read-only currency | Config aktif | “Konfigurasi tarif dasar tidak tersedia” | “Diambil otomatis” |
| Tarif per KM | Read-only currency | Config aktif | “Konfigurasi tarif per km tidak tersedia” | “Diambil otomatis” |
| Total Fee | Read-only currency | Formula | “Fee belum dapat dihitung” | “(Jarak × Tarif per KM) + Tarif Dasar” |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

N7 dan N6 menggunakan aggregate/table order yang sama agar tidak terjadi duplikasi data antar-menu.

**Table Name: `ambulance_orders`**

- `id`: UUID, PK
- `order_number`: VARCHAR(50), unique
- `source_action_id`: UUID, required, unique
- `patient_id`, `encounter_id`, `requesting_unit_id`: UUID
- `requested_by`, `requested_at`: UUID/TIMESTAMP
- `trip_type`: ENUM(`TO_CURRENT_HOSPITAL`,`FROM_CURRENT_HOSPITAL`)
- `status`: ENUM(`DRAFT`,`SUBMITTED`,`CONFIRMED`,`IN_PROGRESS`,`COMPLETED`,`CANCELLED`)
- `current_hospital_profile_id`: UUID
- `external_hospital_id`: UUID, nullable, FK → `hospitals.id`
- origin/destination: `address_text`, `formatted_address`, `google_place_id`, `latitude`, `longitude`, `region_id`
- `hospital_name_snapshot`, `hospital_address_snapshot`: VARCHAR
- `driver_staff_id`: UUID, nullable
- `distance_meters`, `duration_seconds`: BIGINT, nullable
- `distance_provider`, `route_points_hash`: VARCHAR, nullable
- `route_calculated_at`: TIMESTAMP, nullable
- `tariff_config_id`: UUID, nullable
- `base_fee`, `rate_per_km`, `billable_distance_km`, `total_fee`: DECIMAL, nullable
- `distance_rounding_method`, `tariff_formula_version`: VARCHAR, nullable
- `action_bhp_snapshot`: JSON, nullable
- `companion_staff_snapshot`: JSON, nullable
- `status_approval`, `role_approver`: disiapkan untuk Phase 2
- audit timestamps/users

**Table Name: `ambulance_tariff_configs`**

- `id`: UUID, PK
- `name`: VARCHAR(100)
- `base_fee`, `rate_per_km`: DECIMAL(18,2)
- `distance_rounding_method`: ENUM(`EXACT`,`CEIL_KM`,`ROUND_KM`,`ROUND_0_1_KM`)
- `currency`: CHAR(3), default `IDR`
- `effective_from`, `effective_to`: TIMESTAMP
- `is_active`: BOOLEAN, default true
- `status_approval`, `role_approver`, audit columns

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ambulance-orders/from-action` | Internal, idempotent create dari tindakan |
| GET | `/api/v1/ambulance-orders/{id}` | Ambil detail form N7 |
| PUT | `/api/v1/ambulance-orders/{id}/draft` | Simpan draft, termasuk create-on-transaction N5 |
| POST | `/api/v1/ambulance-orders/{id}/calculate-route` | Hitung driving distance dan fee |
| POST | `/api/v1/ambulance-orders/{id}/submit` | Validasi dan ajukan ke N6 |
| POST | `/api/v1/ambulance-orders/{id}/cancel-draft` | Batalkan sebelum diproses N6 |
| GET | `/api/v1/hospitals/search` | Creatable combobox N5 |
| GET | `/api/v1/hospital-profile` | Titik RS saat ini dari N4 |
| GET | `/api/v1/staff?role=DRIVER&is_active=true` | Dropdown driver |
| GET | `/api/v1/encounters/{id}/actions-consumables` | Ringkasan tindakan & BHP |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input

| Field | Label | Tipe | Wajib | Sumber | Catatan |
|---|---|---|---|---|---|
| patient/order context | Data Pasien | Read-only card | Ya | Tindakan/encounter | Baseline V1 |
| action_bhp | Tindakan & BHP | Read-only list + edit action | Ya | Modul tindakan/BHP | Snapshot saat submit |
| companion_staff | Staff Pendamping | Read-only list | Tidak | Encounter | Dokter/perawat |
| trip_type | Tipe Perjalanan | Radio | Saat submit | User | Menentukan endpoint terkunci |
| external_hospital | RS | Creatable combobox | Kondisional | N5/User | — |
| free_address | Alamat Jemput/Antar | Autocomplete | Saat submit | Google/User | Harus tervalidasi |
| region_id | Wilayah | Cascading select | Tidak | Master Wilayah | Opsional |
| driver_staff_id | Driver | Dropdown | [PERLU KONFIRMASI] | Master Staff | N6 validasi saat confirm |
| distance/fee | Jarak & Tarif | Read-only | Saat submit | Sistem | Tidak manual |

#### 8.3.2 Spesifikasi Data — Tampilan Ringkasan

| Elemen | Sumber Data | Format | Catatan |
|---|---|---|---|
| Tanggal Order | requested_at | dd-MM-yyyy HH:mm | V1 hanya tanggal; V2 tambah waktu |
| Pasien | snapshot patient | Nama + No. RM | Read-only |
| Unit/Penjamin | encounter snapshot | Text | Read-only |
| Tindakan/BHP | action_bhp_snapshot/source | Table | Nama, jumlah, operator |
| Staff Pendamping | companion_staff_snapshot | List | Dokter/perawat |
| Rute | origin → destination | Text/map summary | Dua arah |
| Jarak | distance_meters | 0.00 km | Read-only |
| Fee | total_fee | Rupiah | Breakdown tersedia |
| Driver | staff | Text/select | Opsional sesuai tahap |

**Business Rules**

- **BR-N7-01:** Satu `source_action_id` hanya memiliki satu order.
- **BR-N7-02:** N7 membuat/melengkapi order; N6 mengonfirmasi dan menyelesaikan layanan.
- **BR-N7-03:** N4 adalah titik RS current; N5 adalah referensi RS eksternal.
- **BR-N7-04:** Jarak disimpan per order/rute, tidak boleh disimpan sebagai `total_distance` universal di N5.
- **BR-N7-05:** Perubahan endpoint membuat kalkulasi route/fee stale dan wajib dihitung ulang.
- **BR-N7-06:** Create N5 dan save order wajib atomik.
- **BR-N7-07:** Status tidak diinput user; create otomatis DRAFT dan submit otomatis SUBMITTED.
- **BR-N7-08:** N7 tidak boleh menetapkan COMPLETED/`isFinish`; itu kewenangan N6.
- **BR-N7-09:** Payload baru menggunakan ID order, bukan hanya ID registrasi, agar beberapa order per encounter dapat didukung dengan aman. [ASUMSI]

## 9. Workflow / BPMN Interpretation

1. Petugas memilih tindakan **Ambulance** dan menyimpan.
2. Sistem membuat/reuse satu order DRAFT berdasarkan `source_action_id`.
3. N7 menampilkan data pasien, unit, penjamin, tindakan/BHP, dokter, dan perawat.
4. User memilih tipe perjalanan; N4 mengisi sisi RS current secara read-only.
5. User memilih N5 atau mengetik RS baru dan mengisi alamat sisi bebas.
6. User memilih hasil Google Maps; sistem menyimpan koordinat.
7. User menekan **Hitung Jarak**; backend memperoleh driving distance dan menghitung fee.
8. User dapat memilih driver bila sudah diketahui.
9. Simpan Draft → data tetap dapat dilengkapi; Ajukan → validasi lengkap.
10. Jika RS baru, N5 dan order disimpan atomik.
11. Order SUBMITTED muncul pada tab Permintaan N6 untuk dikonfirmasi dan dilayani.

`Tindakan Ambulance → Draft N7 → lengkapi konteks/rute → Hitung Jarak & Fee → Simpan/Ajukan → Permintaan N6`

## Asumsi

- [ASUMSI] Satu encounter dapat memiliki lebih dari satu order ambulance sepanjang berasal dari tindakan berbeda; karena itu identitas utama adalah order ID + source action ID, bukan registration ID saja.
- [ASUMSI] Edit tindakan/BHP tetap memakai modul existing seperti V1 dan tunduk pada RBAC.
- [ASUMSI] Driver boleh dipilih di N7, tetapi validasi final dilakukan N6.
- [ASUMSI] Google Maps dipanggil server-side untuk kalkulasi rute; alamat autocomplete dapat memakai key frontend yang dibatasi domain/API.

## Pertanyaan Terbuka

- Apakah driver wajib saat Ajukan N7 atau baru wajib saat Konfirmasi N6?
- Apakah user klinis pembuat tindakan boleh mengisi seluruh form N7, atau hanya operator ambulance?
- Apakah tindakan & BHP boleh diedit sebelum submit saja atau sampai sebelum N6 mulai perjalanan?
- Menu mana yang mengelola konfigurasi tarif dasar, tarif/km, pembulatan, dan periode efektif?
- Apakah satu encounter boleh memiliki beberapa order ambulance?
- Apakah order dapat dibuat tanpa pasien untuk keadaan darurat? Jika ya, masukkan Phase 2 atau menu terpisah?

