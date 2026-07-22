# PRD — Dashboard Radiologi (N12)

> **Definisi internal:** Dashboard = **operational worklist/list order radiologi**, bukan dashboard KPI/grafik.  
> **Status:** BASELINE STATUS FLOW & LAYOUT v0.3 — state machine mengikuti keputusan final spreadsheet; gambar menjadi patokan layout.

**Sumber:** `template.md`; `bahan_random/Untitled spreadsheet.xlsx` (**authoritative untuk status dan trigger**); `bahan_random/file_000000004a2c82098cda90920c5a8cc3.webp` (**patokan layout/visual hierarchy saja**); `data/features-mvp.json` E4/F4/F5/F6; PRD Pendaftaran Radiologi; Master Item Pemeriksaan Radiologi A29; Billing G2; PRD Tindakan & BHP.  
**Tanggal:** 2026-07-21

## 1. Metadata Dokumen

| Approval | Nama/Jabatan | Tanggal |
|---|---|---|
| Disiapkan | [PERLU KONFIRMASI] System Analyst | 2026-07-19 |
| Diperiksa/Disetujui | [PERLU KONFIRMASI] Kepala Radiologi/Manajemen | — |

| Versi | Deskripsi |
|---|---|
| 0.1 | Pondasi worklist order, konfirmasi, imaging flag, expertise, history comparison. |
| 0.2 | Membakukan lifecycle status dan trigger berdasarkan spreadsheet keputusan final. |
| 0.3 | Menambahkan patokan layout worklist dari mockup tanpa mengubah status final spreadsheet. |

Referensi `other_prd(prd_dari_google_drive)` dibaca tanpa perubahan.

## 2. Overview & Background

N12 adalah halaman awal operasional Radiologi berupa list order dari E4/pendaftaran radiologi. Petugas dapat mencari/filter, melihat status, membuka detail, dan menjalankan proses sesuai kewenangan. Sumber menetapkan capability konfirmasi order (F4), input hasil/expertise dengan flag imaging tersedia dan template per jenis pemeriksaan (F5), serta perbandingan dua hasil historis (F6).

**As-Is:** [ASUMSI] daftar order, status imaging, dan expertise belum terpusat/seragam.  
**To-Be:** order muncul idempotent dengan status `Belum Terkonfirmasi`; konfirmasi radiografer menentukan `Sedang Diproses` untuk jadwal hari ini atau `Jadwal Terkonfirmasi` untuk jadwal mendatang; pada hari pelaksanaan radiografer melakukan konfirmasi ulang; input foto/image memindahkan order ke `Menunggu Expertise`; penyelesaian pemeriksaan oleh dokter mengubah order menjadi `Selesai`; riwayat mendukung view dan perbandingan hasil.

## 3. Goals & Metrics

| Metrics | Target Pondasi |
|---|---|
| Kelengkapan order | 100% E4 valid muncul sekali. |
| Status imaging/expertise | 100% order menampilkan status keduanya secara terpisah. |
| Akurasi state transition | 100% transisi mengikuti trigger final dan transisi ilegal ditolak. |
| Traceability | 100% perubahan status/expertise diaudit. |
| Search performance | p95 < 2 detik per 50 baris. [ASUMSI] |
| Billing-ready | Setiap charge memiliki provenance order/item. |

## 4. Scope Definition & Phasing

| Fitur | Phase 1 Foundation | Phase 2 |
|---|---|---|
| Worklist | List/filter/detail/status | KPI/TAT/modality utilization/grafik |
| Konfirmasi & jadwal | Konfirmasi berdasarkan tanggal jadwal, konfirmasi ulang saat jadwal tiba, cancel | Reschedule/escalation dan reminder otomatis |
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

| Status Canonical | Label UI | Deskripsi | Trigger/Transisi Sah |
|---|---|---|---|
| `UNCONFIRMED` | Belum Terkonfirmasi | Order radiologi baru disimpan dari pelayanan dan masuk dashboard radiologi. | → `IN_PROGRESS` bila dikonfirmasi untuk jadwal hari ini; → `SCHEDULE_CONFIRMED` bila dikonfirmasi untuk jadwal bukan hari ini; → `CANCELLED`. |
| `SCHEDULE_CONFIRMED` | Jadwal Terkonfirmasi | Jadwal mendatang telah dikonfirmasi radiografer, tetapi pemeriksaan belum dimulai. | → `IN_PROGRESS` melalui konfirmasi ulang ketika tanggal jadwal telah tiba; → `CANCELLED`. |
| `IN_PROGRESS` | Sedang Diproses | Pasien siap diperiksa hari ini/pemeriksaan sedang dilakukan. | → `WAITING_EXPERTISE` setelah radiografer menginput foto/image; → `CANCELLED`. |
| `WAITING_EXPERTISE` | Menunggu Expertise | Foto/image tersedia dan menunggu pemeriksaan/expertise dokter radiologi. | → `COMPLETED` ketika dokter selesai memeriksa/menyelesaikan expertise; → `CANCELLED` hanya dengan kewenangan dan alasan. |
| `COMPLETED` | Selesai | Dokter telah selesai memeriksa dan hasil/expertise selesai. | Terminal; koreksi melalui addendum/revisi. |
| `CANCELLED` | Dibatalkan | Order dibatalkan dengan alasan dan audit trail. | Terminal. |

**Keputusan perhitungan tanggal:** pembandingan “hari ini” menggunakan tanggal jadwal pada zona waktu rumah sakit. Konfirmasi ulang `SCHEDULE_CONFIRMED → IN_PROGRESS` hanya tersedia ketika `scheduled_date <= current_hospital_date`; sistem tidak mengubah status otomatis tanpa aksi radiografer.

### Patokan Layout Worklist

Mockup `bahan_random/file_000000004a2c82098cda90920c5a8cc3.webp` menjadi patokan komposisi dan hierarki halaman, bukan sumber status. Label status pada mockup yang berbeda—misalnya “Belum Dijadwalkan”, “Sudah Dijadwalkan”, “Siap Diperiksa Hari Ini”, “Imaging Selesai”, atau “Menunggu Expert”—wajib diganti dengan label canonical dari spreadsheet bila merepresentasikan lifecycle order.

Struktur desktop yang dipertahankan:

1. Sidebar modul Radiologi di kiri dan breadcrumb `Radiologi > Worklist`.
2. Header halaman berisi judul **Worklist Radiologi** dan deskripsi singkat.
3. Deretan summary card untuk `Belum Terkonfirmasi`, `Jadwal Terkonfirmasi`, `Sedang Diproses`, `Menunggu Expertise`, `Selesai`, `Dibatalkan`, serta card `Total Order` dengan pemilih tanggal.
4. Dua tab operasional: **Penjadwalan** dan **Pemeriksaan Hari Ini**. Tab mengubah scope data, bukan mengubah definisi status.
5. Area filter horizontal, pencarian, Reset Filter, dan Export.
6. Panel filter status dan jumlah order di sisi kiri tabel; daftar status memakai enam status canonical yang sama dengan summary card.
7. Tabel worklist padat di sisi kanan, action per row, lalu page-size selector dan pagination di bagian bawah.

Summary card, panel filter status, tab, dan tabel harus memakai query/filter state yang sama agar jumlah dan baris tidak saling bertentangan.

- Petugas melihat dan memfilter antrean order.
- Radiografer membuka detail dan memperbarui status imaging.
- Dokter radiologi membuat/finalisasi expertise.
- Dokter pengirim melihat hasil final.
- User berwenang membandingkan dua hasil historis.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**FR-N12-01 — Worklist (P0)**

- E4/order registrasi valid muncul sekali berdasarkan source ID.
- Kolom mengikuti patokan layout: No., No. Order, Tanggal Order, Jam Order, Pasien (nama, No. RM, tanggal lahir/usia), Unit Pengirim dan Dokter Pengirim, Pemeriksaan dan Modalitas, Prioritas, Status Jadwal, Status Pemeriksaan, dan Aksi.
- Search menerima nama pasien, No. RM, No. Order, dan nama pemeriksaan.
- Filter minimum: tanggal order/jadwal, modalitas, unit pengirim, dokter pengirim, prioritas, jenis rawat, CITO/STAT, dan status canonical.
- Pagination server-side; klik baris membuka detail sesuai RBAC.
- Summary card menampilkan count berdasarkan tanggal/scope aktif; klik card menerapkan filter status terkait.
- Tab `Penjadwalan` memuat order yang membutuhkan konfirmasi awal atau memiliki jadwal terkonfirmasi; tab `Pemeriksaan Hari Ini` memuat order yang siap diproses hari ini, sedang diproses, atau menunggu expertise sesuai filter tanggal.
- Aksi row kontekstual: `Konfirmasi/Jadwalkan` untuk `UNCONFIRMED`, `Ubah Jadwal` dan `Mulai Pemeriksaan` untuk `SCHEDULE_CONFIRMED` sesuai guard tanggal, serta `Lihat Detail`/aksi proses sesuai status berikutnya.
- Tombol Reset mengembalikan filter ke default tanggal hari ini dan seluruh dropdown ke `Semua`; Export mengekspor dataset hasil filter aktif sesuai permission.

**Acceptance Criteria Layout FR-N12-01**

- Pada viewport desktop ≥ 1280 px, summary cards tampil satu deret, filter status berada di kiri tabel, dan tabel tetap menjadi area utama halaman.
- Pada viewport yang lebih sempit, summary cards dan filter dapat wrap/collapse tanpa menghilangkan fungsi; tabel boleh horizontal scroll dengan identitas pasien dan aksi tetap mudah diakses.
- Count `Total Order` sama dengan total dataset untuk tanggal/scope aktif; jumlah per status tidak boleh negatif dan tidak boleh menghitung order yang sama dua kali.
- Perubahan tanggal, tab, filter, pencarian, summary card, page, atau page size mengambil data server-side dan mempertahankan state pada URL/query string.
- Loading, empty state, error state, dan no-result state tersedia tanpa mengubah layout secara drastis.
- Status tidak disampaikan melalui warna saja; setiap badge memiliki teks dan kontras yang memenuhi standar aksesibilitas aplikasi.

**FR-N12-02 — Detail dan Konfirmasi (P0)**

- Detail menampilkan snapshot pasien/encounter, indikasi, item, requester, catatan, alergi/risiko yang tersedia [PERLU KONFIRMASI], dan status log.
- Confirm dari `UNCONFIRMED` memeriksa tanggal jadwal terhadap tanggal rumah sakit: jadwal hari ini menghasilkan `IN_PROGRESS`, sedangkan jadwal bukan hari ini menghasilkan `SCHEDULE_CONFIRMED`.
- Confirm ulang dari `SCHEDULE_CONFIRMED` menghasilkan `IN_PROGRESS` hanya ketika tanggal jadwal telah tiba atau terlewati; percobaan sebelum waktunya ditolak.
- Confirm bersifat aksi eksplisit radiografer dan menyimpan actor serta timestamp; tidak ada transisi otomatis ketika pergantian tanggal.
- Cancel wajib alasan dan tidak menghapus histori/billing.
- Konflik perubahan order setelah confirm ditampilkan eksplisit.

**FR-N12-03 — Imaging Status (P0 Foundation)**

- Imaging status terpisah: NOT_AVAILABLE/AVAILABLE/FAILED [PERLU KONFIRMASI].
- Input foto/image hanya diperbolehkan pada status `IN_PROGRESS`; penyimpanan image yang berhasil mengubah status order secara atomik menjadi `WAITING_EXPERTISE`.
- Menandai AVAILABLE menyimpan waktu, actor/system, dan `imaging_reference`; minimal satu reference image wajib tersedia sebelum transisi ke `WAITING_EXPERTISE`.
- Sistem tidak mengklaim file DICOM tersedia bila hanya expertise yang diisi.

**FR-N12-04 — Expertise (P0 Foundation)**

- Expertise draft terkait order item dan template schema/version pemeriksaan.
- Finalisasi menyimpan author, verifier [jika berbeda], waktu, dan snapshot isi.
- Expertise hanya dapat diselesaikan dokter radiologi/user berizin ketika order `WAITING_EXPERTISE` dan foto/image tersedia. Penyelesaian expertise mengubah status secara atomik menjadi `COMPLETED`/`Selesai`.
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
| Konfirmasi jadwal | `scheduled_date <= current_hospital_date` untuk konfirmasi ulang | “Pemeriksaan belum dapat dimulai sebelum tanggal jadwal.” |
| Foto/image | Minimal satu image reference valid sebelum Menunggu Expertise | “Foto/image wajib tersedia sebelum dikirim untuk expertise.” |

**Spesifikasi Filter Worklist**

| Field | Tipe | Default | Perilaku |
|---|---|---|---|
| Tanggal | Date picker | Tanggal rumah sakit hari ini | Menjadi scope summary card, total, status panel, dan tabel. |
| Modalitas | Single select | Semua | X-Ray/CT/MRI/USG/dll mengikuti master/modalitas order. |
| Unit Pengirim | Searchable select | Semua | Filter berdasarkan snapshot unit pengirim. |
| Dokter Pengirim | Searchable select | Semua | Filter berdasarkan requester order. |
| Prioritas | Single select | Semua | Minimal Rutin dan CITO/STAT sesuai data order. |
| Rawat | Single select | Semua | Rawat Jalan/Rawat Inap/IGD/IBS/VK sesuai sumber order. |
| CITO/STAT | Checkbox | Tidak dicentang | Bila aktif hanya menampilkan order prioritas CITO/STAT. |
| Pencarian | Search input | Kosong | Debounce; nama pasien, No. RM, No. Order, atau pemeriksaan. |
| Status | Status panel/summary card | Semua | Satu status canonical pada satu waktu; dapat di-reset. |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**`radiology_orders`**: id, source_order_id unique, patient/encounter/requester/unit, priority, `scheduled_at`, status enum `UNCONFIRMED|SCHEDULE_CONFIRMED|IN_PROGRESS|WAITING_EXPERTISE|COMPLETED|CANCELLED`, ordered/schedule_confirmed/started/waiting_expertise/completed/cancelled timestamps, billing sync, row_version, audit.  
**`radiology_order_items`**: order_id, exam item reference, code/name/modality snapshot, status, imaging_status/reference.  
**`radiology_reports`**: item_id, version, template schema/version, content JSON/text, status DRAFT/FINAL/AMENDED, author/verifier/final timestamps.  
**`radiology_status_logs`**: append-only.

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/radiology/worklist` | List/filter |
| GET | `/api/v1/radiology/orders/{id}` | Detail |
| POST | `/api/v1/radiology/orders/{id}/confirm` | Confirm |
| POST | `/api/v1/radiology/orders/{id}/start` | Konfirmasi ulang jadwal dan mulai pemeriksaan |
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
- **BR-N12-07:** Status canonical dan trigger mengikuti spreadsheet keputusan final; label UI tidak boleh digunakan sebagai free-text status.
- **BR-N12-08:** `UNCONFIRMED → IN_PROGRESS` berlaku untuk jadwal hari ini; `UNCONFIRMED → SCHEDULE_CONFIRMED` berlaku untuk jadwal bukan hari ini.
- **BR-N12-09:** `SCHEDULE_CONFIRMED` tidak berubah otomatis pada hari pelaksanaan. Radiografer wajib melakukan konfirmasi ulang untuk memulai pemeriksaan.
- **BR-N12-10:** Input foto/image yang berhasil merupakan satu-satunya trigger normal `IN_PROGRESS → WAITING_EXPERTISE`.
- **BR-N12-11:** Penyelesaian pemeriksaan/expertise oleh dokter merupakan trigger `WAITING_EXPERTISE → COMPLETED`.
- **BR-N12-12:** Setiap transition menggunakan optimistic locking, server clock, actor session, dan append-only status log; transisi ilegal mengembalikan HTTP 409.
- **BR-N12-13:** Gambar referensi menentukan layout, bukan nomenklatur atau lifecycle. Bila terjadi konflik, status dan trigger spreadsheet selalu menang.
- **BR-N12-14:** Summary card, total order, status panel, dan tabel berasal dari filter/query yang sama serta satu definisi agregasi server-side.
- **BR-N12-15:** `Status Jadwal` dapat menampilkan informasi tanggal/jam jadwal, tetapi tidak membuat lifecycle tambahan di luar enam status canonical.

## 9. Workflow / BPMN Interpretation

`Order disimpan → Belum Terkonfirmasi → [jadwal hari ini: Sedang Diproses | jadwal mendatang: Jadwal Terkonfirmasi → konfirmasi ulang saat jadwal tiba → Sedang Diproses] → input foto/image → Menunggu Expertise → dokter selesai memeriksa/expertise → Selesai → EMR/Billing/History/Compare`

## Pertanyaan Terbuka

- Apakah satu row per order atau per item pemeriksaan?
- Siapa author/verifier dan apakah perlu co-sign?
- Apakah RIS/PACS/DICOM tersedia dan apa identifier/reference canonical-nya?
- Template expertise per jenis pemeriksaan dikelola di mana?
- Kapan billing dibentuk/void?
- Perbandingan Phase 1 hanya teks atau wajib image viewer?
