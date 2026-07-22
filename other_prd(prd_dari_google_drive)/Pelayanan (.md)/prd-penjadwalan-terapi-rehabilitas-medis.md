# Product Requirement Document (PRD) - Penjadwalan Terapi Rehabilitasi Medis (F25)

**Nama fitur:** Penjadwalan Terapi Rehabilitasi Medis  
**Lokasi fitur:** Dashboard Unit Rehab Medis -> Jadwal Penunjang Medis -> Jadwal Terapi Rehab Medis  
**Versi:** 1.4 - Penambahan kebutuhan administrasi Casemix pada data jadwal dan print PDF  
**Tanggal:** 20 Juli 2026  
**Timezone:** Asia/Jakarta  
**Fitur terkait:** Dashboard Unit Rehab Medis, Jadwal Penunjang Medis, Master Data Program Terapi, B6 Pendaftaran Rehabilitasi Medis, E1 Tindakan dan BHP, D3 Data Sosial, G2 Billing/Tagihan Pasien, Administrasi Casemix, modul klaim, Cetak Jadwal Terapi Rehab Medis PDF

## 1. Ringkasan

F25 digunakan oleh Unit Rehab Medis untuk membuat **Jadwal Terapi Rehab Medis** dari daftar pasien yang sudah diperiksa pada dashboard Unit Rehab Medis. User memilih pasien dari dashboard tersebut, menjalankan aksi menuju fitur **Jadwal Penunjang Medis**, lalu masuk ke halaman **Jadwal Terapi Rehab Medis** dengan konteks pasien yang sudah terisi otomatis.

Pada halaman Jadwal Terapi Rehab Medis, saat user membuka pilihan **Terapi**, sistem langsung menampilkan seluruh daftar terapi aktif yang sudah dikelompokkan berdasarkan kategori/program dari **Master Data Program Terapi**. Pengelompokan ini mengikuti struktur master karena pada master tersebut sudah tersedia kategori terapi. User memilih terapi yang akan dipakai, lalu menginput jadwal dalam tampilan mingguan **Senin sampai Minggu** yang default-nya kosong.

Setiap hari dapat memiliki satu atau beberapa baris jadwal. Pada tiap baris, user mengisi **tanggal, jam mulai, jam selesai, dan terapi yang telah dipilih**. Baris jadwal dapat ditambah atau dihapus. Saat user memilih tanggal pada baris hari tertentu, sistem hanya menampilkan pilihan tanggal yang jatuh pada hari tersebut. Contoh: baris Senin hanya menampilkan tanggal-tanggal Senin, baris Selasa hanya menampilkan tanggal-tanggal Selasa.

F25 menjadi sumber jadwal terapi yang terstruktur dan dapat dicetak sebagai **PDF Jadwal Terapi Rehab Medis**. Data jadwal terapi ini diperlukan untuk kebutuhan administrasi Casemix, terutama dokumen **print PDF** sebagai bukti/ringkasan jadwal terapi yang dapat dilampirkan atau dirujuk pada proses verifikasi administrasi. Pencatatan hasil pelaksanaan klinis, charge Tindakan/BHP, dan pengajuan klaim tetap mengikuti modul pemiliknya. F25 menyimpan referensi silang agar jadwal, pasien, program terapi, terapi yang dipilih, tanggal sesuai hari, status pelaksanaan, dan dokumen cetak dapat ditelusuri.

## 2. Masalah dan tujuan

### Masalah

- Pasien yang sudah diperiksa di Unit Rehab Medis belum selalu langsung dapat dijadwalkan dari dashboard unit.
- User perlu berpindah konteks/manual memilih ulang pasien ketika membuat jadwal terapi.
- User belum langsung melihat seluruh daftar terapi yang tersedia ketika memilih terapi.
- Pilihan terapi belum dikelompokkan sesuai kategori/program pada Master Data Program Terapi.
- Jadwal terapi per hari, tanggal, dan jam belum tercatat terstruktur per pasien dan per terapi dalam pola Senin sampai Minggu.
- Pemilihan tanggal pada baris jadwal perlu dibatasi agar user tidak memilih tanggal yang tidak sesuai dengan hari baris tersebut.
- Jadwal terapi belum memiliki format cetak PDF standar untuk diberikan kepada pasien/unit layanan.
- Administrasi Casemix membutuhkan data jadwal terapi dan PDF jadwal sebagai dokumen pendukung verifikasi administrasi.
- Sesi yang sudah dilakukan, tidak hadir, dibatalkan, atau dijadwalkan ulang sulit direkonsiliasi dengan jadwal terapi awal.

### Tujuan

1. Dashboard Unit Rehab Medis menampilkan list pasien yang sudah diperiksa di Unit Rehab Medis dan dapat dipilih untuk penjadwalan.
2. User dapat membuka fitur Jadwal Penunjang Medis dari pasien terpilih tanpa memilih ulang pasien.
3. Halaman Jadwal Terapi Rehab Medis menampilkan konteks pasien secara read-only.
4. User dapat memilih terapi dari seluruh daftar terapi aktif yang ditampilkan grouped berdasarkan Master Data Program Terapi.
5. User dapat melihat semua hari Senin sampai Minggu dengan kondisi awal kosong.
6. User dapat menambah/menghapus baris jadwal per hari dan mengisi tanggal, jam mulai, jam selesai, serta terapi yang telah dipilih.
7. User hanya dapat memilih tanggal yang sesuai dengan hari pada baris jadwal.
8. User dapat mencetak Jadwal Terapi Rehab Medis dalam format PDF yang rapi dan siap diberikan ke pasien/unit layanan.
9. Administrasi Casemix dapat menggunakan data jadwal terapi dan PDF jadwal sebagai dokumen pendukung verifikasi administrasi.
10. Klinik dan layanan penunjang dapat melihat sesi yang harus dilakukan, statusnya, serta perubahan jadwal.

## 3. Ruang lingkup

### In scope

1. Menampilkan list pasien yang diperiksa pada dashboard Unit Rehab Medis.
2. Aksi dari pasien terpilih menuju fitur Jadwal Penunjang Medis.
3. Halaman Jadwal Terapi Rehab Medis dengan konteks pasien, encounter, unit, dan penjamin secara read-only.
4. Pemilihan **Terapi** dari seluruh daftar terapi aktif yang ditampilkan grouped berdasarkan kategori/program pada Master Data Program Terapi.
5. Penyajian semua hari **Senin-Minggu** pada form jadwal dengan default kosong.
6. Input jadwal terapi manual per baris per hari: tanggal, jam mulai, jam selesai/durasi, dan terapi yang dilaksanakan.
7. Tambah dan hapus baris jadwal per hari.
8. Pembatasan pilihan tanggal per hari, sehingga baris Senin hanya menampilkan tanggal Senin, baris Selasa hanya menampilkan tanggal Selasa, dan seterusnya.
9. Cetak/unduh Jadwal Terapi Rehab Medis dalam format PDF.
10. Penyediaan data jadwal terapi dan PDF jadwal sebagai dokumen pendukung administrasi Casemix.
11. Validasi benturan jadwal pasien, jadwal layanan, ruangan, atau terapis bila data tersedia.
12. Simpan, lihat, ubah, jadwal ulang, dan batalkan jadwal terapi sesuai hak akses.
13. Audit trail seluruh perubahan jadwal, cetak PDF, dan sesi.

### Out of scope

1. Pengelolaan Master Data Program Terapi, termasuk kategori/program terapi dan mapping terapi.
2. Menentukan diagnosis klinis awal atau keputusan medis; F25 hanya memilih terapi/program terapi dari master aktif.
3. Pengelolaan master tindakan/modalitas, tarif, jadwal operasional tenaga kesehatan, dan kapasitas ruangan; dibaca dari modul master/facility terkait.
4. Pencatatan klinis lengkap hasil terapi bila dimiliki dashboard layanan penunjang lain.
5. Pengajuan atau pengiriman klaim ke BPJS/asuransi.
6. Pembayaran pasien; charge mengikuti E1 dan Billing G2.

## 4. Aktor dan hak akses

| Aktor | Hak akses |
|---|---|
| User Unit Rehab Medis | Melihat pasien yang sudah diperiksa, memilih pasien, membuka Jadwal Penunjang Medis, memilih terapi dari daftar grouped, menginput jadwal Senin-Minggu dengan tanggal sesuai hari, mencetak PDF, dan menyimpan jadwal terapi |
| Admin/Petugas Klinik Rehab | Mengelola jadwal terapi, meninjau slot, menjadwalkan ulang, membatalkan jadwal, mencetak ulang PDF, dan memantau sesi |
| Dokter Rehabilitasi Medis | Menjadi sumber hasil pemeriksaan/rujukan klinis dan dapat melihat jadwal/progres pasien sesuai permission |
| Terapis/Pelaksana layanan | Melihat sesi yang ditugaskan dan mengisi status pelaksanaan/catatan melalui modul layanan penunjang |
| Petugas Casemix/Klaim | Melihat data jadwal terapi dan mengunduh PDF jadwal sebagai dokumen pendukung administrasi Casemix/manifest klaim tanpa mengubah keputusan klinis |
| Sistem | Membawa konteks pasien dari dashboard, membaca Master Data Program Terapi, menampilkan terapi grouped, membatasi tanggal sesuai hari, memvalidasi jadwal, membuat PDF, menjaga state, dan mencatat audit |

Hak akses final per role mengikuti konfigurasi permission RS. **[PERLU KONFIRMASI]**

## 5. Konsep dan alur bisnis

### 5.1 Struktur jadwal

Satu pasien yang sudah diperiksa pada Unit Rehab Medis dapat memiliki satu atau beberapa **Jadwal Terapi Rehab Medis**. Setiap jadwal selalu membawa konteks pasien dan encounter dari dashboard Unit Rehab Medis. Pemilihan terapi mengambil seluruh terapi aktif dari Master Data Program Terapi dan menampilkannya dalam group sesuai kategori/program master, misalnya Fisioterapi, Terapi Okupasi, Terapi Wicara, atau kategori lain yang didefinisikan rumah sakit.

Setelah terapi dipilih, user mengisi jadwal pada struktur mingguan Senin sampai Minggu. Semua hari selalu tampil, namun default-nya kosong. Hari yang tidak memiliki sesi dibiarkan tanpa baris jadwal.

Contoh:

```text
Pasien: Bapak Hendra Saputra
Encounter: ENC-RM-260720-001
Daftar terapi grouped:
  Fisioterapi:
    - Infra Red
    - Exercise Therapy
  Terapi Okupasi:
    - Latihan ADL

Terapi dipilih:
  - Fisioterapi - Infra Red
  - Fisioterapi - Exercise Therapy

Jadwal:
  - Senin, 20/07/2026 08:00-08:30 - Fisioterapi - Infra Red
  - Kamis, 23/07/2026 08:00-08:45 - Fisioterapi - Exercise Therapy
  - Selasa/Rabu/Jumat/Sabtu/Minggu kosong
```

### 5.2 Pembatasan pilihan tanggal sesuai hari

Form jadwal tetap menampilkan semua hari Senin sampai Minggu. Saat user menambahkan baris pada salah satu hari, komponen tanggal pada baris tersebut hanya menampilkan tanggal yang jatuh pada hari yang sama.

Contoh:

| Hari baris | Pilihan tanggal yang boleh tampil |
|---|---|
| Senin | Hanya tanggal yang jatuh pada hari Senin |
| Selasa | Hanya tanggal yang jatuh pada hari Selasa |
| Rabu | Hanya tanggal yang jatuh pada hari Rabu |
| Kamis | Hanya tanggal yang jatuh pada hari Kamis |
| Jumat | Hanya tanggal yang jatuh pada hari Jumat |
| Sabtu | Hanya tanggal yang jatuh pada hari Sabtu |
| Minggu | Hanya tanggal yang jatuh pada hari Minggu |

Sistem dapat membentuk daftar tanggal dari periode penjadwalan aktif, misalnya tanggal mulai dan tanggal selesai filter jadwal. Jika periode belum dipilih, sistem menggunakan periode default yang ditetapkan RS, misalnya 30 atau 60 hari ke depan. **[PERLU KONFIRMASI]**

### 5.3 Alur utama

1. User membuka dashboard **Unit Rehab Medis**.
2. Sistem menampilkan list pasien yang sudah diperiksa pada Unit Rehab Medis sesuai tanggal/filter aktif.
3. User memilih salah satu pasien dari list.
4. User menjalankan aksi menuju fitur **Jadwal Penunjang Medis**.
5. Sistem membuka halaman **Jadwal Terapi Rehab Medis** dengan konteks pasien, encounter, unit, penjamin, dan data pemeriksaan secara read-only.
6. User membuka pilihan **Terapi**.
7. Sistem menampilkan seluruh daftar terapi aktif yang sudah dikelompokkan berdasarkan kategori/program pada Master Data Program Terapi.
8. User memilih satu atau beberapa terapi yang akan dijadwalkan.
9. Sistem menampilkan form jadwal mingguan Senin sampai Minggu dengan default kosong.
10. User menambahkan satu atau beberapa baris jadwal pada hari yang diperlukan.
11. Pada tiap baris, user mengisi tanggal, jam mulai, jam selesai/durasi, dan terapi yang telah dipilih.
12. Sistem memastikan pilihan tanggal yang tampil pada baris tersebut hanya tanggal yang sesuai dengan hari baris.
13. Sistem memvalidasi kelengkapan data, konsistensi hari/tanggal, format waktu, terapi yang dipilih, dan benturan jadwal bila data slot tersedia.
14. User memilih **Simpan**.
15. Sistem menyimpan Jadwal Terapi Rehab Medis, membentuk sesi terjadwal, mencatat audit trail, dan mengirim jadwal ke worklist layanan penunjang yang sesuai.
16. User dapat memilih **Print/Cetak PDF** untuk mengunduh Jadwal Terapi Rehab Medis.
17. Petugas Casemix/Klaim dapat menggunakan data jadwal terapi dan PDF jadwal sebagai dokumen pendukung administrasi Casemix.
18. Terapis menjalankan sesi dan mencatat status pelaksanaan pada modul layanan penunjang.

### 5.4 Rekomendasi format PDF Jadwal Terapi Rehab Medis

Format PDF direkomendasikan sebagai dokumen A4 portrait, 1-2 halaman per pasien untuk satu periode jadwal.

Struktur PDF:

1. Header RS: logo, nama RS, alamat, kontak, judul **Jadwal Terapi Rehab Medis**.
2. Identitas pasien: No. RM, nama, tanggal lahir/usia, jenis kelamin, penjamin, encounter/registrasi.
3. Informasi klinik: Unit Rehab Medis, dokter/pemeriksa, tanggal pemeriksaan, nomor jadwal.
4. Ringkasan terapi dipilih: grouped berdasarkan Master Data Program Terapi.
5. Tabel jadwal mingguan: Senin-Minggu, tanggal, jam mulai, jam selesai, terapi, unit layanan, status.
6. Keterangan administrasi Casemix: nomor jadwal, encounter/registrasi, penjamin, dan pernyataan bahwa dokumen merupakan jadwal terapi rehab medis untuk pendukung administrasi Casemix.
7. Catatan: instruksi kehadiran, catatan admin/klinis singkat, kontak perubahan jadwal.
8. Footer: waktu cetak, user pencetak, QR/barcode nomor jadwal, dan ruang tanda tangan/stempel bila dibutuhkan.

## 6. Data Requirement

### 6.1 List pasien dashboard Unit Rehab Medis

Masuk ke dalam Scope PRD Dashboard Unit Rehab Medis

### 6.2 Master Data Program Terapi yang dibaca

| Key | Label | Sumber | Wajib | Catatan |
|---|---|---|---|---|
| `program_therapy_id` | ID Program Terapi | Master Data Program Terapi | Ya | Dipakai sebagai ID group/kategori terapi |
| `program_therapy_code` | Kode Program/Kategori | Master Data Program Terapi | Tidak | Ditampilkan bila tersedia untuk memudahkan grouping |
| `program_therapy_name` | Nama Program/Kategori Terapi | Master Data Program Terapi | Ya | Menjadi header group pada pilihan Terapi |
| `diagnosis_label` | Diagnosa/Indikasi | Master Data Program Terapi | Tidak | Ditampilkan sebagai metadata bila master tetap menyimpan diagnosa |
| `therapy_options` | Pilihan Terapi | Master Data Program Terapi | Ya | Seluruh terapi aktif yang ditampilkan grouped saat user memilih Terapi |
| `therapy_option_id` | ID Terapi | Master Data Program Terapi | Ya | Value terapi yang disimpan pada baris jadwal |
| `therapy_name` | Nama Terapi | Master Data Program Terapi | Ya | Label item pada pilihan Terapi |
| `service_unit` | Layanan Tujuan | Master Data Program Terapi/Master Unit | Ya | Contoh Klinik Fisioterapi |
| `default_duration_minutes` | Durasi Default | Master Data Program Terapi | Tidak | Dipakai untuk mengisi jam selesai otomatis bila tersedia |
| `is_active` | Status Aktif | Master Data Program Terapi | Ya | Hanya data aktif yang dapat dipilih |

### 6.3 Form Jadwal Terapi Rehab Medis

| Key | Label | Sumber | Wajib | Catatan |
|---|---|---|---|---|
| `schedule_id` | ID Jadwal Terapi | F25 | Ya | Terbentuk saat simpan |
| `rehab_visit_id` | ID Kunjungan Rehab | Dashboard Unit Rehab Medis | Ya | Konteks pasien terpilih |
| `patient_id`, `encounter_id` | Pasien dan Encounter | Dashboard Unit Rehab Medis | Ya | Read-only |
| `selected_therapy_options` | Terapi Dipilih | Master Data Program Terapi | Ya | Daftar terapi yang user pilih dari daftar grouped |
| `program_therapy_id` | Program/Kategori Terapi | Master Data Program Terapi | Ya | Disimpan dari group terapi yang dipilih |
| `therapy_option_id` | Terapi yang Dilaksanakan | Master Data Program Terapi | Ya | Dipilih per baris dari terapi yang sudah dipilih |
| `week_day` | Hari | Sistem | Ya | Senin-Minggu selalu tersedia pada UI; default tanpa baris jadwal |
| `day_name` | Nama Hari | Sistem/Input | Ya bila baris diisi | Dihitung dari tanggal atau dipilih user lalu divalidasi |
| `available_dates_by_day` | Pilihan Tanggal Sesuai Hari | Sistem | Ya | Daftar tanggal yang ditampilkan pada baris, difilter sesuai `week_day` |
| `therapy_date` | Tanggal | Input user | Ya | Format tanggal lokal Asia/Jakarta; hanya dapat dipilih dari `available_dates_by_day` pada hari tersebut |
| `start_time` | Jam Mulai | Input user | Ya | Format HH:mm |
| `end_time` | Jam Selesai | Input/sistem | Kondisional | Wajib bila durasi tidak tersedia |
| `duration_minutes` | Durasi | Master/Input | Kondisional | Dapat diisi dari master atau manual |
| `service_unit` | Unit Pelaksana | Master Data Program Terapi | Ya | Menentukan worklist layanan penunjang |
| `therapist_id` | Terapis | Jadwal layanan | Tidak | Dapat ditentukan kemudian |
| `room_id` | Ruangan | Facility schedule | Tidak | **[PERLU KONFIRMASI]** |
| `schedule_note` | Catatan Jadwal | Input user | Tidak | Instruksi singkat bila perlu |
| `schedule_status` | Status Jadwal | F25/modul layanan | Ya | Draft/Scheduled/Checked-in/Completed/No-show/Canceled/Rescheduled |
| `row_action` | Aksi Baris | UI/F25 | Ya | Tambah/hapus baris jadwal per hari |
| `created_at`, `created_by` | Dibuat Oleh/Pada | F25 | Ya | Audit |

### 6.4 Data cetak PDF jadwal

| Key | Label | Sumber | Wajib | Catatan |
|---|---|---|---|---|
| `print_document_id` | ID Dokumen Cetak | F25 | Ya saat cetak | Audit dokumen PDF |
| `print_format_version` | Versi Format PDF | F25 | Ya | Contoh `rehab_schedule_pdf_v1` |
| `schedule_id` | ID Jadwal Terapi | F25 | Ya | Jadwal yang dicetak |
| `printed_at` | Waktu Cetak | Sistem | Ya | Timestamp Asia/Jakarta pada tampilan |
| `printed_by` | Dicetak Oleh | Sistem | Ya | User dan role |
| `pdf_sections` | Section PDF | F25 | Ya | Header RS, identitas pasien, jadwal, catatan, footer |
| `casemix_administration_note` | Catatan Administrasi Casemix | F25 | Ya | Statement bahwa PDF jadwal digunakan sebagai dokumen pendukung administrasi Casemix |
| `qr_reference` | QR/Barcode Referensi | F25 | Tidak | Untuk validasi nomor jadwal/dokumen |

### 6.5 Data eviden klaim

F25 menyediakan referensi jadwal dan pelaksanaan yang dapat dipakai untuk administrasi Casemix dan manifest eviden klaim. Data jadwal terapi dan PDF jadwal diperlukan sebagai dokumen pendukung administrasi Casemix. F25 tidak mengirim klaim secara langsung.

| Eviden | Sumber | Wajib saat sesi diklaim | Keterangan |
|---|---|---|---|
| Identitas pasien dan encounter | D3/Pendaftaran | Ya | No RM, nama, penjamin, episode layanan |
| Jadwal Terapi Rehab Medis | F25 | Ya | Program/kategori terapi, terapi, hari, tanggal, jam, unit, status |
| PDF Jadwal Terapi Rehab Medis | F25 | Ya untuk administrasi Casemix | Dokumen cetak jadwal sebagai bukti/ringkasan administrasi Casemix |
| Bukti kehadiran/pelaksanaan | Modul layanan penunjang | Ya untuk Completed | Status hadir dan waktu pelaksanaan |
| Catatan hasil terapi | Modul layanan penunjang/EMR | Ya untuk Completed | Catatan singkat, respons/progres, pelaksana |
| Referensi tindakan/BHP | E1/G2 | Sesuai charge | Nomor tindakan, tarif, status billing |
| Audit dan signature | F25/modul layanan | Ya | User, role, waktu, perubahan, tanda tangan elektronik bila tersedia |

Aturan dokumen dan field klaim BPJS/asuransi perlu disesuaikan dengan kontrak penjamin dan kebijakan RS. **[PERLU KONFIRMASI]**

## 7. Aturan bisnis

1. Jadwal Terapi Rehab Medis hanya dapat dibuat dari pasien yang tersedia pada list dashboard Unit Rehab Medis dan memiliki `patient_id` serta `encounter_id` valid.
2. Aksi ke Jadwal Penunjang Medis wajib membawa konteks minimal `rehab_visit_id`, `patient_id`, `encounter_id`, `medical_record_number`, dan `patient_name`.
3. Saat user memilih **Terapi**, sistem wajib menampilkan seluruh terapi aktif dari Master Data Program Terapi.
4. Daftar terapi wajib dikelompokkan berdasarkan kategori/program yang tersedia pada Master Data Program Terapi.
5. User dapat memilih satu atau beberapa terapi dari daftar grouped tersebut.
6. Form jadwal wajib menampilkan semua hari Senin sampai Minggu dengan kondisi awal kosong.
7. Hari tanpa jadwal boleh tetap kosong dan tidak membentuk sesi.
8. Setiap baris jadwal yang ditambahkan wajib memiliki tanggal, jam mulai, jam selesai atau durasi, dan terapi yang telah dipilih.
9. Baris jadwal dapat ditambah dan dihapus per hari sebelum jadwal disimpan.
10. Pilihan tanggal pada setiap baris wajib difilter berdasarkan hari baris tersebut.
11. Baris Senin hanya boleh menampilkan dan menyimpan tanggal Senin; aturan yang sama berlaku untuk Selasa sampai Minggu.
12. Jika tanggal tersedia dari kalender umum/API, sistem wajib menyaring tanggal yang tidak sesuai hari sebelum ditampilkan ke user.
13. Hari harus konsisten dengan tanggal yang dipilih. Jika ada manipulasi payload dari client, server wajib menolak tanggal yang tidak sesuai hari baris.
14. Jam selesai atau durasi wajib tersedia. Sistem dapat mengisi durasi default dari Master Data Program Terapi bila tersedia.
15. Sistem tidak boleh menyimpan baris dengan terapi yang tidak termasuk dalam daftar terapi yang dipilih user.
16. Sistem wajib menandai benturan jadwal pasien, layanan, ruangan, atau terapis bila data pembanding tersedia.
17. Tombol **Simpan** membuat sesi jadwal berstatus `SCHEDULED`.
18. Tombol **Print/Cetak PDF** hanya aktif setelah jadwal tersimpan atau saat ada nomor jadwal yang valid.
19. PDF jadwal wajib mencantumkan identitas pasien, daftar terapi grouped, tabel jadwal, waktu cetak, user pencetak, dan keterangan administrasi Casemix.
20. Data jadwal terapi dan PDF jadwal wajib dapat dirujuk oleh administrasi Casemix sebagai dokumen pendukung verifikasi administrasi.
21. Jadwal yang sudah `COMPLETED` tidak boleh diubah langsung; koreksi dilakukan melalui reschedule/amendment dengan audit.
22. Reschedule menyimpan jadwal lama, jadwal baru, alasan, user, dan waktu perubahan.
23. Sesi Canceled/No-show tidak dihitung sebagai sesi Completed dan tidak menjadi eviden klaim layanan yang terlaksana, kecuali kebijakan penjamin menyatakan lain. **[PERLU KONFIRMASI]**
24. Sesi Completed wajib memiliki `execution_reference` dan, bila ada charge, `charge_reference` sebelum masuk status siap klaim.
25. Hak akses dan validasi state harus diterapkan di server; UI tidak menjadi satu-satunya pengaman.

## 8. State machine

### 8.1 Jadwal Terapi

| State | Label | Transisi |
|---|---|---|
| `DRAFT` | Draft | Form belum disimpan final atau user masih menyusun baris jadwal |
| `SCHEDULED` | Terjadwal | Jadwal tersimpan dan dikirim ke worklist layanan penunjang |
| `RESCHEDULED` | Dijadwalkan Ulang | Jadwal berubah dengan alasan dan histori tetap tersimpan |
| `CANCELED` | Dibatalkan | Jadwal dibatalkan dengan alasan |
| `COMPLETED` | Selesai | Terapi sudah selesai dan dikonfirmasi modul pelaksana |
| `NO_SHOW` | Tidak Hadir | Pasien tidak hadir sesuai kebijakan layanan |

### 8.2 Sesi

`SCHEDULED -> CHECKED_IN -> COMPLETED`

Cabang yang diizinkan: `SCHEDULED -> CANCELED`, `SCHEDULED -> RESCHEDULED -> SCHEDULED`, dan `SCHEDULED -> NO_SHOW`. Sesi `COMPLETED` bersifat final; koreksi dilakukan melalui amendment/audit.

## 9. Search, filter, dan tampilan dashboard

- Search: No RM, nama pasien, No Jadwal, program/kategori terapi, dan terapi/tindakan/modalitas.
- Filter dashboard Unit Rehab Medis: tanggal pemeriksaan, status pemeriksaan, dokter/petugas, unit/ruangan, dan penjamin.
- Filter halaman Jadwal Terapi Rehab Medis: periode jadwal, status jadwal, program/kategori terapi, terapi, unit layanan, dan penjamin.
- Tampilan utama dashboard: list pasien yang sudah diperiksa dan aksi **Jadwal Penunjang Medis** per pasien.
- Tampilan halaman jadwal: header pasien read-only, pemilih Terapi grouped berdasarkan Master Data Program Terapi, tabel mingguan Senin-Minggu default kosong, pilihan tanggal yang sudah difilter sesuai hari, input jam/terapi per baris, kontrol tambah/hapus baris, tombol **Simpan**, dan tombol **Print/Cetak PDF**.
- Sorting: tanggal pemeriksaan, tanggal sesi terdekat, dan nama pasien.
- Jadwal yang memiliki benturan slot diberi warning sebelum disimpan.

## 10. Integrasi

| Modul | Arah | Kebutuhan |
|---|---|---|
| D3 Data Sosial | F25 membaca | Identitas pasien dan data sosial read-only |
| B6 Pendaftaran Rehab Medis | F25 membaca | Encounter, penjamin, unit, episode layanan |
| Dashboard Unit Rehab Medis | F25 membaca/menerima konteks | List pasien yang sudah diperiksa dan data pemeriksaan |
| Jadwal Penunjang Medis | F25 membuka/menggunakan | Entry point halaman Jadwal Terapi Rehab Medis dari pasien terpilih |
| Master Data Program Terapi | F25 membaca | Daftar program/kategori terapi aktif dan seluruh pilihan terapi grouped |
| Master Tindakan/Tarif | F25 membaca | Durasi, tarif aktif, dan metadata tindakan bila dibutuhkan |
| Dashboard layanan penunjang | F25 mengirim/menerima | Sesi yang harus dikerjakan dan status pelaksanaan |
| E1 Tindakan dan BHP | F25 mereferensikan | Tindakan/BHP dan charge per sesi |
| G2 Billing | F25/G2 sinkron | Referensi charge dan status tagihan |
| Administrasi Casemix | F25 menyediakan | Data jadwal terapi dan PDF Jadwal Terapi Rehab Medis sebagai dokumen pendukung administrasi Casemix |
| Modul Klaim | F25 menyediakan manifest | Paket eviden jadwal dan pelaksanaan |
| PDF/Document Service | F25 membuat dokumen | Generate dan unduh Jadwal Terapi Rehab Medis PDF |

## 11. API rekomendasi

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/rehab/dashboard/patients` | List pasien yang sudah diperiksa pada Unit Rehab Medis dengan search/filter/sort |
| GET | `/api/v1/rehab/schedule-context/{rehab_visit_id}` | Ambil konteks pasien untuk halaman Jadwal Terapi Rehab Medis |
| GET | `/api/v1/rehab/program-therapy-master/grouped-therapies` | Seluruh daftar terapi aktif grouped berdasarkan Master Data Program Terapi |
| GET | `/api/v1/rehab/program-therapy-master/{id}/therapy-options` | Pilihan terapi/tindakan/modalitas pada program/kategori tertentu |
| GET | `/api/v1/rehab/therapy-schedules/available-dates?day={day_code}&from={date}&to={date}` | Daftar tanggal yang sesuai dengan hari baris jadwal |
| POST | `/api/v1/rehab/therapy-schedules` | Simpan Jadwal Terapi Rehab Medis dan membentuk sesi terjadwal |
| GET | `/api/v1/rehab/therapy-schedules` | Daftar jadwal terapi dengan search/filter/sort |
| PATCH | `/api/v1/rehab/therapy-schedules/{id}` | Edit jadwal sebelum Completed |
| POST | `/api/v1/rehab/therapy-schedules/{id}/reschedule` | Jadwal ulang dengan alasan |
| POST | `/api/v1/rehab/therapy-schedules/{id}/cancel` | Batalkan jadwal dengan alasan |
| GET | `/api/v1/rehab/therapy-schedules/{id}/print.pdf` | Generate/unduh PDF Jadwal Terapi Rehab Medis |
| GET | `/api/v1/rehab/therapy-schedules/{id}/claim-evidence` | Manifest eviden klaim per jadwal |

## 12. Audit, keamanan, dan non-functional requirements

- Semua perubahan pasien-konteks, program/kategori terapi, terapi, jadwal, status, dokumen PDF, dan eviden mencatat before/after, actor, role, timestamp, alasan, dan correlation ID.
- Data pasien, dokumen administrasi Casemix, dan dokumen klaim hanya dapat dibuka oleh role yang memiliki akses pada unit/episode terkait.
- Simpan jadwal harus idempotent agar refresh/retry tidak membuat duplikasi.
- Operasi save/reschedule/cancel harus transaksional: perubahan jadwal, status, dan audit berhasil bersama atau rollback.
- Histori jadwal dan sesi tidak dihapus permanen; pembatalan menggunakan state dan alasan.
- Waktu disimpan dalam UTC/timestamp standar dan ditampilkan dalam Asia/Jakarta.
- PDF jadwal harus dapat diunduh ulang dari jadwal tersimpan tanpa mengubah data jadwal dan dapat dipakai oleh administrasi Casemix.
- Setiap generate/print PDF mencatat audit `printed_at`, `printed_by`, dan versi format dokumen.

## 13. Kriteria penerimaan

1. Dashboard Unit Rehab Medis menampilkan list pasien yang sudah diperiksa.
2. User dapat memilih pasien dan membuka aksi **Jadwal Penunjang Medis**.
3. Halaman **Jadwal Terapi Rehab Medis** terbuka dengan data pasien dan encounter terisi read-only.
4. Saat user memilih **Terapi**, sistem langsung menampilkan seluruh terapi aktif grouped berdasarkan Master Data Program Terapi.
5. User dapat memilih satu atau beberapa terapi dari daftar grouped.
6. Form jadwal menampilkan semua hari Senin sampai Minggu dengan default kosong.
7. User dapat menambah dan menghapus baris jadwal pada tiap hari.
8. User dapat memilih tanggal, jam mulai, jam selesai, dan terapi yang telah dipilih pada tiap baris.
9. Pada baris Senin, sistem hanya menampilkan tanggal Senin; pada baris Selasa, sistem hanya menampilkan tanggal Selasa; dan seterusnya sampai Minggu.
10. Server menolak simpan jika tanggal pada payload tidak sesuai dengan hari baris.
11. Tombol **Simpan** menyimpan jadwal dan membentuk sesi berstatus `SCHEDULED`.
12. Sistem mencegah terapi di luar daftar terapi yang dipilih dan menandai benturan jadwal.
13. User dapat mencetak/mengunduh **PDF Jadwal Terapi Rehab Medis** dari jadwal tersimpan.
14. PDF berisi identitas pasien, daftar terapi grouped, tabel jadwal mingguan, waktu cetak, user pencetak, dan keterangan administrasi Casemix.
15. Petugas Casemix/Klaim dapat menggunakan data jadwal terapi dan PDF jadwal sebagai dokumen pendukung administrasi Casemix.
16. Riwayat jadwal lama dan alasan perubahan tetap dapat dilihat.
17. Sesi Completed memiliki referensi pelaksanaan dan dapat ditautkan ke E1/G2.

## 14. Hal yang perlu dikonfirmasi

| Topik | Keputusan yang dibutuhkan |
|---|---|
| Master Data Program Terapi | Struktur kategori/program terapi, therapy option, indikasi/diagnosa bila ada, dan durasi default |
| Slot | Sumber jam operasional, kapasitas ruangan, dan kapasitas terapis berasal dari G15 atau modul lain? |
| Pelaksana | Apakah terapis dipilih saat simpan jadwal atau ditentukan oleh unit pelaksana mendekati sesi? |
| Periode pilihan tanggal | Periode default untuk membentuk opsi tanggal sesuai hari, misalnya 30/60/90 hari ke depan |
| Print PDF | Apakah PDF perlu tanda tangan/stempel, QR/barcode, nomor dokumen resmi, dan kop surat RS tertentu |
| Administrasi Casemix | Apakah ada redaksi baku, kode dokumen, atau field tambahan yang wajib dicantumkan pada PDF untuk kebutuhan Casemix |
| Klaim | Format lampiran dan field wajib BPJS/asuransi yang disepakati RS |
| Pelaksanaan | Modul mana yang menjadi sumber status Completed dan catatan terapi? |
| Charge | Kapan E1/G2 membentuk charge: saat booking, check-in, atau Completed? |
| No-show | Apakah perlu membuat sesi pengganti otomatis atau dokter/admin menjadwalkan manual? |
