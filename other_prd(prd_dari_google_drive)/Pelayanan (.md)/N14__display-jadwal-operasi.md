# PRD — Display Jadwal Operasi (N14)

> **Status:** Draft v1.0  
> **Karakteristik:** Display informasi operasional, read-only, fullscreen, dan real-time.  
> **Prinsip privasi:** Nama pasien wajib dimasking sebelum data dikirim ke layar display publik.

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|---|---|---|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-21 |
| Diperiksa oleh | [PERLU KONFIRMASI] Kepala IBS / Kepala Pelayanan | — |
| Disetujui oleh | [PERLU KONFIRMASI] Manajemen Rumah Sakit | — |

**Related Documents**

| Dokumen/Fitur | Keterangan |
|---|---|
| `template.md` | Acuan struktur PRD. |
| N13 Penundaan Operasi Pasien | Sumber perubahan jadwal dan status Ditunda. |
| Jadwal Operasi / Dashboard IBS | Sumber data jadwal, ruang, operator utama, dan status terkini. |
| Master Ruang IBS | Referensi ruang operasi aktif. |
| A53 Admin RBAC | Acuan hak akses menu dan pembukaan display. |

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 2026-07-21 | 1.0 | Dokumen awal Display Jadwal Operasi berdasarkan kebutuhan bisnis N14. |

## 2. Overview & Background

**Overview / Brief Summary**

N14 menyediakan halaman Display Jadwal Operasi untuk monitor informasi di depan ruang operasi. Halaman menampilkan jadwal pada tanggal aktif, diurutkan dari jam paling awal ke paling akhir, serta diperbarui otomatis agar perubahan jadwal dan status operasi terlihat paling lambat 10 detik setelah perubahan tersimpan pada sistem.

Informasi yang ditampilkan meliputi ruang operasi, jam operasi, nomor registrasi, nama pasien yang telah dimasking, dokter operator utama, dan status operasi. Halaman bersifat read-only, mendukung fullscreen, memiliki jam berjalan, mempertahankan data terakhir ketika koneksi terputus, serta menggunakan tipografi dan kontras yang dapat dibaca dari jarak jauh.

**Business Process (As-Is vs To-Be)**

- **As-Is:** [ASUMSI] Informasi jadwal di depan ruang operasi masih mengandalkan komunikasi verbal, papan manual, atau membuka menu operasional yang tidak dirancang untuk monitor publik. Perubahan status/jam berpotensi terlambat diketahui, sementara tampilan data pasien berisiko terlalu lengkap.
- **To-Be:** Petugas membuka Display Jadwal Operasi melalui tombol pada menu Jadwal Operasi. Sistem membuka halaman monitor mode untuk tanggal aktif, memuat hanya jadwal valid, memasking nama pasien di server, mengurutkan ulang data setiap ada perubahan, dan memperbarui tampilan tanpa reload halaman. Jika jaringan terputus, data terakhir tetap terlihat dengan indikator gagal diperbarui.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---|---|---|
| 1 | Kecepatan halaman | Halaman display siap menampilkan data atau empty state dalam ≤ 2 detik pada kondisi jaringan dan beban normal. |
| 2 | Kesegaran status | Perubahan status/jam yang telah berhasil disimpan tampil pada display maksimal 10 detik. |
| 3 | Privasi pasien | 100% nama pasien yang dikirim ke display telah dimasking; nama lengkap tidak ada dalam payload display. |
| 4 | Validitas data | 0 jadwal tanpa ruang atau tanpa jam operasi tampil pada display. |
| 5 | Ketepatan urutan | 100% baris diurutkan berdasarkan tanggal dan jam operasi secara ascending. |
| 6 | Ketahanan koneksi | Data terakhir yang berhasil dimuat tetap tampil ketika refresh gagal dan indikator koneksi terlihat. |
| 7 | Keterbacaan | Seluruh kolom utama dan status dapat dibaca pada resolusi monitor target dari jarak operasional. [PERLU KONFIRMASI resolusi dan jarak uji] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP) | Phase 2 (Advanced) |
|---|---|---|
| Entry point | Tombol **Display Jadwal Operasi** pada menu Jadwal Operasi | Pengelolaan perangkat/display terdaftar |
| Monitor mode | Halaman fullscreen/read-only dan current time | Kiosk mode terkelola dan remote health monitoring |
| Data | Jadwal tanggal aktif, kolom minimum, filter validasi, urutan ascending | Filter per zona/kelompok ruang dan konfigurasi kolom |
| Sinkronisasi | Polling otomatis maksimal setiap 10 detik, update tanpa reload | Server-Sent Events/WebSocket dengan fallback polling |
| Banyak jadwal | Pagination/rotasi halaman otomatis [ASUMSI] | Konfigurasi durasi rotasi dan layout multi-monitor |
| Gangguan jaringan | Pertahankan snapshot terakhir dan tampilkan indikator offline/stale | Telemetri, alert perangkat, dan retry adaptif |

**Out of Scope**

- Membuat, mengubah, menunda, membatalkan, atau menyelesaikan jadwal dari halaman display.
- Menampilkan nama pasien lengkap, diagnosis, tindakan, nomor rekam medis, kelas, penjamin, atau informasi klinis lain.
- Mengubah business process Jadwal Operasi versi sebelumnya.
- Approval berjenjang karena N14 tidak melakukan mutasi data.
- Notifikasi WhatsApp/SMS, audio announcement, dan integrasi signage pihak ketiga.

## 5. Related Features

| Kode/Modul | Relasi Teknis/Bisnis |
|---|---|
| Jadwal Operasi / Dashboard IBS | Source of truth tanggal, jam, ruang, registrasi, pasien, operator utama, dan status terkini; menyediakan tombol pembuka display. |
| N13 Penundaan Operasi Pasien | Perubahan jadwal dan status Ditunda harus memicu pengurutan serta refresh display. |
| Master Ruang IBS | Referensi nama ruang; jadwal tanpa ruang tidak ditampilkan. |
| Master Staff/Dokter | Referensi dokter operator utama pada jadwal. |
| A53 Admin RBAC | Mengatur siapa yang dapat melihat tombol entry point; halaman display tetap read-only. |

## 6. Business Process & User Stories

**State Machine — Status Operasi pada Display**

| Status | Deskripsi pada Display | Efek Data | Transisi Relevan |
|---|---|---|---|
| `CONFIRMED` | Menunggu Dioperasi | Status sumber `Terkonfirmasi`; jadwal tetap tampil | → `IN_PROGRESS`, `POSTPONED`, atau `CANCELLED` |
| `IN_PROGRESS` | Sedang Berlangsung | Jadwal tetap tampil dan status diperbarui | → `COMPLETED`, `POSTPONED`, atau `CANCELLED` sesuai aturan modul sumber |
| `POSTPONED` | Ditunda | Jadwal tetap tampil; posisi berubah bila jam diubah | → status terbaru dari Jadwal Operasi |
| `COMPLETED` | Selesai | Tetap tampil sampai tanggal aktif berganti | Terminal untuk tanggal tersebut |
| `CANCELLED` | Dibatalkan | Tetap tampil selama tanggal operasi sesuai tanggal aktif | Terminal untuk tanggal tersebut |

> N14 hanya membaca status. Validitas transisi dimiliki modul Jadwal Operasi/IBS.
> Status sumber `Belum Terkonfirmasi` tidak ditampilkan pada N14. Status sumber `Terkonfirmasi` dipetakan menjadi label display **Menunggu Dioperasi**; status lainnya mengikuti label display yang bersesuaian.

**User Stories Utama**

- **US-N14-01:** Sebagai petugas IBS, saya ingin membuka monitor mode dari menu Jadwal Operasi agar display dapat dipasang tanpa navigasi operasional lain.
- **US-N14-02:** Sebagai tenaga medis, saya ingin melihat ruang, jam, registrasi, operator utama, dan status terbaru agar dapat memantau alur operasi.
- **US-N14-03:** Sebagai pasien/keluarga, saya ingin memperoleh informasi status melalui identitas yang disamarkan agar privasi pasien terjaga.
- **US-N14-04:** Sebagai petugas IBS, saya ingin display tetap menunjukkan data terakhir ketika jaringan terganggu agar layar tidak kosong.
- **US-N14-05:** Sebagai pengelola monitor, saya ingin seluruh jadwal terlihat bergantian secara otomatis agar tidak perlu menggunakan mouse atau keyboard.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-N14-01 — Entry Point dan Monitor Mode**

- **User Story:** Sebagai petugas IBS, saya ingin membuka display dari menu Jadwal Operasi agar halaman siap digunakan pada monitor informasi.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Menu Jadwal Operasi menyediakan tombol berlabel **Display Jadwal Operasi** untuk role yang diberi hak akses.
  - **AC 2:** Tombol membuka halaman display dengan tanggal aktif dari menu sumber; jika tidak tersedia, sistem menggunakan tanggal hari ini. [ASUMSI]
  - **AC 3:** Halaman menyediakan kontrol untuk masuk fullscreen melalui browser Fullscreen API karena browser tidak mengizinkan fullscreen otomatis tanpa interaksi pengguna.
  - **AC 4:** Setelah fullscreen aktif, area navigasi, sidebar, tombol edit, dan aksi mutasi data tidak ditampilkan.
  - **AC 5:** Keluar dari fullscreen tidak mengubah atau menghapus data jadwal.

**Fitur: FR-N14-02 — Daftar Jadwal Tanggal Aktif**

- **User Story:** Sebagai pengguna display, saya ingin melihat jadwal yang relevan untuk tanggal aktif agar informasi tidak tercampur dengan tanggal lain.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Request data selalu membawa `schedule_date` dalam format `YYYY-MM-DD` dan server hanya mengembalikan jadwal untuk tanggal tersebut menurut zona waktu rumah sakit.
  - **AC 2:** Setiap baris menampilkan Ruang Operasi, Jam Operasi, Nomor Registrasi, Nama Pasien (masked), Dokter Operator, dan Status Operasi.
  - **AC 3:** Jadwal tanpa ruang operasi atau tanpa jam operasi dikeluarkan oleh backend dan tidak muncul di payload.
  - **AC 4:** Jadwal dibatalkan dan selesai tetap ditampilkan sepanjang masih termasuk tanggal aktif.
  - **AC 5:** Bila hasil valid berjumlah nol, halaman menampilkan tepat: **“Belum terdapat jadwal operasi.”**
  - **AC 6:** Jadwal berstatus sumber `Belum Terkonfirmasi` tidak dikirim ke display; jadwal mulai dapat tampil setelah berstatus `Terkonfirmasi` dan memenuhi seluruh validasi data.

**Fitur: FR-N14-03 — Pengurutan dan Perubahan Jadwal**

- **User Story:** Sebagai tenaga medis, saya ingin jadwal terurut dari waktu paling awal agar urutan operasional mudah dipahami.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Backend mengurutkan data berdasarkan `operation_date ASC`, `operation_start_time ASC`, lalu `registration_number ASC` sebagai tie-breaker deterministik.
  - **AC 2:** Frontend mempertahankan urutan yang sama setelah setiap refresh.
  - **AC 3:** Ketika jam operasi berubah, refresh berikutnya memindahkan baris ke posisi yang sesuai tanpa reload halaman.
  - **AC 4:** Identitas DOM/item menggunakan ID jadwal stabil sehingga update dan perpindahan baris tidak menyebabkan flicker seluruh tabel.

**Fitur: FR-N14-04 — Masking dan Pembatasan Data Pasien**

- **User Story:** Sebagai petugas privasi, saya ingin nama pasien disamarkan sebelum ditampilkan agar layar publik tidak mengekspos identitas lengkap.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Masking dilakukan di backend sebelum serialisasi response; payload endpoint display tidak memuat nama lengkap pasien.
  - **AC 2:** Setiap kata dipisahkan berdasarkan spasi; hanya karakter pertama yang ditampilkan dalam huruf kapital, sedangkan setiap karakter berikutnya diganti satu bintang (`*`). Contoh: `Amelia Ramadhani` menjadi `A***** R********`.
  - **AC 3:** Kata yang hanya terdiri dari satu karakter ditampilkan sebagai karakter tersebut dalam huruf kapital. Contoh: `A Budi` menjadi `A B***`.
  - **AC 4:** Jumlah kata, spasi antarkata, dan panjang setiap kata dipertahankan; karakter selain karakter pertama pada setiap kata—termasuk gelar atau tanda baca—diganti dengan bintang.
  - **AC 5:** Nomor registrasi ditampilkan lengkap; nomor rekam medis tidak dikirim ke endpoint display.
  - **AC 6:** Nama masked dan dokter yang melebihi lebar kolom dipotong dengan ellipsis tanpa memperlebar layout.

**Fitur: FR-N14-05 — Refresh Otomatis dan Indikator Koneksi**

- **User Story:** Sebagai pengguna display, saya ingin status diperbarui otomatis dan data lama tetap terlihat saat koneksi gagal.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Frontend meminta pembaruan maksimal setiap 10 detik; interval rekomendasi 5 detik. [ASUMSI]
  - **AC 2:** Refresh berjalan di background dan tidak menampilkan loading overlay yang menutupi daftar yang sudah ada.
  - **AC 3:** Response sukses memperbarui hanya data yang berubah serta menyimpan `last_successful_update_at`.
  - **AC 4:** Response gagal/timeout tidak menghapus daftar terakhir; halaman menampilkan indikator **“Data sedang tidak dapat diperbarui”** dan waktu pembaruan terakhir.
  - **AC 5:** Setelah koneksi pulih dan satu refresh sukses, indikator gangguan hilang serta data langsung direkonsiliasi.
  - **AC 6:** Request refresh tidak bertumpuk; siklus berikutnya menunggu request sebelumnya selesai atau membatalkannya.
  - **AC 7:** Pergantian tanggal lokal rumah sakit memicu perubahan tanggal aktif ke hari baru dan pengambilan ulang data, apabila display dibuka menggunakan mode tanggal hari ini. [ASUMSI]

**Fitur: FR-N14-06 — Current Time dan Keterbacaan**

- **User Story:** Sebagai pengguna display, saya ingin melihat waktu saat ini dan informasi berkontras tinggi agar mudah dibaca dari jauh.
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Pojok layar menampilkan jam `HH:mm:ss` dan tanggal aktif menggunakan zona waktu rumah sakit.
  - **AC 2:** Jam diperbarui setiap detik tanpa memicu refresh data jadwal.
  - **AC 3:** Status memiliki label teks, tidak dibedakan hanya dengan warna.
  - **AC 4:** Kontras teks dan latar minimum mengikuti WCAG AA; ukuran font final divalidasi pada monitor target. [PERLU KONFIRMASI spesifikasi monitor]
  - **AC 5:** Layout tetap terbaca pada resolusi minimum 1366×768 dan optimal pada Full HD. [ASUMSI]

**Fitur: FR-N14-07 — Banyak Jadwal dan Rotasi Otomatis**

- **User Story:** Sebagai pengelola monitor, saya ingin semua jadwal ditampilkan bergantian agar layar tidak memerlukan interaksi manual.
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC 1:** Jika jumlah baris melebihi kapasitas viewport, data dibagi menjadi halaman dengan jumlah baris dihitung dari tinggi layar atau konfigurasi aman.
  - **AC 2:** Halaman berpindah otomatis setiap 10 detik. [ASUMSI]
  - **AC 3:** Indikator halaman `x/y` ditampilkan dan rotasi kembali ke halaman pertama setelah halaman terakhir.
  - **AC 4:** Refresh data mempertahankan halaman aktif bila masih valid; jika tidak, halaman aktif disesuaikan ke halaman terakhir yang tersedia.
  - **AC 5:** Rotasi tidak menggunakan scrolling cepat yang mengurangi keterbacaan.

**Validasi — Wording Frontend**

| Field/Kondisi | Tipe | Rules | Error/Indicator Message | Helper Text |
|---|---|---|---|---|
| Tanggal aktif | Query/date | Wajib, format `YYYY-MM-DD`, tanggal valid | “Tanggal jadwal tidak valid.” | Tanggal berasal dari menu Jadwal Operasi atau hari ini. |
| Data kosong | Empty state | Tidak ada jadwal valid | “Belum terdapat jadwal operasi.” | — |
| Koneksi/refresh gagal | System state | Timeout/network/5xx | “Data sedang tidak dapat diperbarui.” | “Pembaruan terakhir: {datetime}” |
| Fullscreen tidak didukung/gagal | Browser state | Fullscreen API gagal | “Mode fullscreen tidak dapat diaktifkan. Gunakan fullscreen browser.” | Gunakan tombol/shortcut browser. |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

N14 tidak membutuhkan tabel transaksi baru dan harus membaca source of truth Jadwal Operasi. Bila skema eksisting belum tersedia, minimum field pada tabel/view adalah:

**Table/View: `surgery_schedules` / `surgery_schedule_display_view`**

- `id`: UUID, primary/stable identifier
- `operation_date`: DATE, required
- `operation_start_time`: TIME, required untuk display
- `operating_room_id`: UUID, nullable pada sumber tetapi wajib untuk display
- `registration_id`: UUID, required
- `registration_number`: VARCHAR(50), required
- `patient_id`: UUID, required; hanya dipakai server untuk masking
- `primary_operator_id`: UUID, required [PERLU KONFIRMASI bila sumber mengizinkan kosong]
- `status`: ENUM/string dari status canonical Jadwal Operasi
- `version`: BIGINT atau `updated_at`: TIMESTAMP untuk incremental refresh/cache validation
- `cancelled_at`, `completed_at`: TIMESTAMP, nullable
- audit timestamps sesuai tabel sumber

**Optional Table: `display_device_settings` (Phase 2)**

- `id`, `device_code`, `room_group_id`, `timezone`, `page_duration_seconds`, `rows_per_page`, `is_active`, audit fields.

> Nama pasien masked sebaiknya dihitung pada service/SQL projection dan tidak disimpan sebagai duplikasi agar selalu mengikuti nama terbaru tanpa menyimpan identitas publik tambahan.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/surgery-schedule-display?schedule_date={YYYY-MM-DD}` | Mengambil snapshot display yang sudah difilter, dimasking, dan diurutkan. |
| GET | `/api/v1/surgery-schedule-display?schedule_date={date}&updated_after={timestamp}` | Opsional incremental refresh; response tetap memiliki versi snapshot. |
| GET | `/api/v1/surgery-schedule-display/health` | Phase 2: health/telemetry display service. |

**Kontrak response minimum**

```json
{
  "schedule_date": "2026-07-21",
  "server_time": "2026-07-21T10:15:30+07:00",
  "version": "2026-07-21T10:15:28.123+07:00",
  "items": [
    {
      "schedule_id": "uuid",
      "operating_room": "OK 1",
      "operation_time": "10:30",
      "registration_number": "REG-20260721-001",
      "patient_name_masked": "A***** R********",
      "primary_operator_name": "dr. Budi Santoso, Sp.B",
      "operation_status": "IN_PROGRESS",
      "operation_status_label": "Sedang Berlangsung",
      "updated_at": "2026-07-21T10:15:28+07:00"
    }
  ]
}
```

Endpoint display tidak menyediakan method POST, PUT, PATCH, atau DELETE.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input

Tidak ada form create/edit pada halaman N14. Satu-satunya input konteks adalah tanggal aktif yang diteruskan dari menu Jadwal Operasi atau ditetapkan ke tanggal hari ini oleh sistem.

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `schedule_date` | Tanggal Jadwal | Date/query | Ya | Tanggal valid `YYYY-MM-DD` | Menu Jadwal Operasi / system date | Tidak mengubah data operasi. |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|---|---|---|---|---|
| Ruang Operasi | `operating_rooms.name` | Teks | Required; tidak tampil bila kosong | Ellipsis bila perlu. |
| Jam Operasi | `surgery_schedules.operation_start_time` | `HH:mm` | Sort ASC; required | Zona waktu rumah sakit. |
| Nomor Registrasi | `registrations.registration_number` | Teks lengkap | Tie-breaker ASC | Tidak dimasking. |
| Nama Pasien | `patients.name` via masker server | Masked text | — | Nama lengkap dilarang dalam payload. |
| Dokter Operator | Operator utama pada jadwal | Teks | — | Hanya operator utama; ellipsis bila panjang. |
| Status Operasi | Status canonical jadwal | Badge + teks | Hanya status valid | Label sesuai mapping status. |
| Jam Saat Ini | `server_time` + clock client tersinkronisasi | `HH:mm:ss` | — | Pojok layar, zona waktu RS. |

**Business Rules**

- **BR-N14-01:** Display hanya menampilkan jadwal dengan `operation_date` sama dengan tanggal aktif dalam zona waktu rumah sakit.
- **BR-N14-02:** Jadwal diurutkan dari waktu paling awal ke paling akhir; nomor registrasi menjadi tie-breaker.
- **BR-N14-03:** Jadwal tanpa ruang operasi atau jam operasi tidak boleh dikirim ke display.
- **BR-N14-04:** Nama pasien wajib dimasking di backend; nama lengkap tidak boleh tersedia pada source HTML, state client, log frontend, analytics, atau response display.
- **BR-N14-05:** Nomor registrasi ditampilkan lengkap sebagai identitas operasional.
- **BR-N14-06:** Dokter yang ditampilkan adalah operator utama pada jadwal, bukan seluruh tim operasi.
- **BR-N14-07:** Status sumber `UNCONFIRMED`/Belum Terkonfirmasi tidak ditampilkan. Status sumber `CONFIRMED`/Terkonfirmasi dipetakan menjadi **Menunggu Dioperasi**; `IN_PROGRESS`, `POSTPONED`, `COMPLETED`, dan `CANCELLED` masing-masing ditampilkan sebagai **Sedang Berlangsung**, **Ditunda**, **Selesai**, dan **Dibatalkan**.
- **BR-N14-08:** Jadwal berstatus selesai atau dibatalkan tetap tampil selama tanggal operasinya sesuai tanggal aktif.
- **BR-N14-09:** N14 bersifat read-only dan tidak memiliki endpoint mutasi.
- **BR-N14-10:** Refresh gagal tidak boleh mengosongkan snapshot terakhir yang sudah berhasil dimuat.
- **BR-N14-11:** Bila load pertama gagal dan belum ada snapshot, sistem menampilkan indikator gagal memperbarui tanpa mengarang data jadwal.
- **BR-N14-12:** Tanggal aktif otomatis berganti pada tengah malam hanya untuk display yang dibuka dalam mode hari ini; tanggal yang dipilih eksplisit tetap dipertahankan. [ASUMSI]

### 8.4 Non-Functional Requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-N14-01 | Performance | Initial page load ≤ 2 detik pada kondisi normal; API menggunakan index pada `(operation_date, operation_start_time)` dan pagination/response ringkas. |
| NFR-N14-02 | Freshness | Polling maksimum 10 detik; target perubahan terlihat ≤ 10 detik sejak commit pada sumber. |
| NFR-N14-03 | Smooth update | Refresh tidak melakukan full-page reload, tidak menutupi data dengan spinner, dan memakai keyed reconciliation. |
| NFR-N14-04 | Availability | Snapshot terakhir dipertahankan dalam memory dan dapat disimpan pada session/local cache sesuai kebijakan keamanan. [PERLU KONFIRMASI kebijakan cache data pasien masked] |
| NFR-N14-05 | Security | Endpoint hanya mengembalikan field whitelist, memakai TLS, tidak mengekspos nama lengkap, dan menerapkan akses sesuai arsitektur jaringan/RBAC rumah sakit. |
| NFR-N14-06 | Accessibility | Kontras minimum WCAG AA, status memiliki label teks, dan layout tidak bergantung pada warna saja. |
| NFR-N14-07 | Scalability | Query server-side, response terkompresi, dan rotasi/pagination tetap responsif untuk banyak jadwal pada satu hari. [PERLU KONFIRMASI volume puncak] |
| NFR-N14-08 | Observability | Catat latency, error rate, refresh failure, jumlah item, dan usia data tanpa mencatat nama/registrasi pasien pada log aplikasi. |

## 9. Workflow / BPMN Interpretation

BPMN khusus N14 belum tersedia. Interpretasi alur berdasarkan kebutuhan adalah:

1. Petugas membuka menu Jadwal Operasi dan menentukan tanggal aktif.
2. Petugas memilih **Display Jadwal Operasi**.
3. Sistem membuka monitor mode dan meminta snapshot tanggal aktif.
4. Backend memvalidasi tanggal, mengambil jadwal, membuang record tanpa ruang/jam, memetakan status valid, memasking nama pasien, lalu mengurutkan data.
5. Frontend menampilkan header, tanggal, current time, tabel jadwal, dan kontrol fullscreen.
6. Setiap maksimal 10 detik frontend meminta data terbaru tanpa menutup data lama.
7. Bila status atau jam berubah, baris diperbarui dan diurutkan kembali secara halus.
8. Bila data melebihi kapasitas layar, halaman berotasi otomatis.
9. Bila refresh gagal, snapshot terakhir tetap tampil bersama indikator koneksi dan waktu pembaruan terakhir.
10. Bila refresh kembali sukses, indikator gangguan hilang dan snapshot terbaru ditampilkan.

`Jadwal Operasi → Buka Display → Filter tanggal & validasi → Masking → Sort → Fullscreen → Refresh berkala → Update/rotasi atau pertahankan snapshot saat offline`

## Asumsi

- [ASUMSI] Phase 1 menggunakan polling 5 detik agar target propagasi maksimal 10 detik dapat dicapai tanpa ketergantungan WebSocket.
- [ASUMSI] Tanggal aktif mengikuti tanggal pada menu sumber; jika tidak tersedia, menggunakan tanggal hari ini.
- [ASUMSI] Banyak jadwal ditangani dengan pagination dan rotasi otomatis setiap 10 detik.
- [ASUMSI] Resolusi minimum yang didukung 1366×768 dan target utama Full HD.

## Pertanyaan Terbuka

- Apa zona waktu canonical rumah sakit; apakah selalu `Asia/Jakarta` atau configurable per rumah sakit?
- Apakah halaman display dapat diakses tanpa login di jaringan internal, memakai display token, atau harus mempertahankan sesi petugas?
- Berapa resolusi, ukuran monitor, jarak baca, dan jumlah baris maksimum yang harus diuji?
- Apakah tanggal yang dipilih eksplisit harus tetap terkunci setelah lewat tengah malam atau otomatis pindah ke hari baru?
- Berapa interval dan pola rotasi halaman yang disetujui: pagination 10 detik atau auto-scroll?
- Apakah dokter operator boleh kosong; bila kosong, apakah jadwal tetap ditampilkan dengan tanda “—”?
- Apakah status internal sumber sudah identik dengan lima status display atau memerlukan mapping tambahan?
- Apakah snapshot masked boleh disimpan di local storage untuk bertahan setelah browser reload ketika offline?
