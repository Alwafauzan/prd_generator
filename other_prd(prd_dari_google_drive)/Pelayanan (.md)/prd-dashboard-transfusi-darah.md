# Product Requirement Document (PRD) - Dashboard Transfusi Darah (F31)

## 1. Metadata Dokumen
* **Approval**: [Nama Stakeholder, Jabatan, Tanggal - Draft Ready for Review]
* **Related Documents**: 
    * E5 Order Permintaan Darah
    * [PRD Konfirmasi Permintaan Darah](konfirmasi_permintaan_darah_link_placeholder)
    * [D3 - Data Sosial Pasien](D3_document_link_placeholder)
    * [E1 - Tindakan dan BHP](E1_document_link_placeholder)
    * [F32 / PRD Input Hasil Pemeriksaan](F32_document_link_placeholder)
    * [G2 - Billing / Tagihan Pasien](G2_document_link_placeholder)
* **Document Version**: 
    * 19 Juli 2026, Versi 1.0, Deskripsi Perubahan: Draft awal penyesuaian format sesuai template standar v2.

## 2. Overview & Background
* **Overview/Brief Summary**: 
    Dashboard Transfusi Darah (F31) adalah layar kerja operasional (worklist) utama untuk petugas Laboratorium Transfusi Darah. Modul ini memusatkan seluruh order Permintaan Darah yang dikirim oleh dokter dari modul **E5 (Order Permintaan Darah) (Order Permintaan Darah)** ke dalam satu antarmuka terintegrasi. Petugas Lab dapat melihat identitas pasien, rincian order, unit pengirim, status konfirmasi, status hasil pemeriksaan, serta status penyelesaian order. F31 hanya menyediakan tombol direct link ke **PRD Konfirmasi Permintaan Darah** dan **F32 / PRD Input Hasil Pemeriksaan**; detail proses bisnis, validasi, form, approval, dan penyimpanan utama untuk kedua proses tersebut berada di PRD terkait, bukan di scope F31. F31 tetap menyediakan akses ke **D3 (Data Sosial Pasien)**, **E1 (Tindakan dan BHP)**, dan integrasi status akhir menuju **G2 (Billing)**.
* **Business Process (As-Is vs To-Be)**:
    * **As-Is**: 
        Proses pengiriman formulir permintaan darah dari ruang perawatan atau IGD ke laboratorium transfusi darah saat ini masih dilakukan secara manual menggunakan kertas fisik atau via telepon. Hal ini menimbulkan kendala operasional berupa keterlambatan penanganan, sulitnya melacak status pengerjaan sampel darah secara real-time oleh dokter pengirim, potensi kesalahan pencatatan identitas pasien (No RM/nama), tidak adanya integrasi dengan pencatatan pemakaian Bahan Habis Pakai (BHP) seperti kantong darah dan reagen, serta penagihan tindakan lab yang sering terlambat atau tidak ter-charge ke Billing System.
    * **To-Be**: 
        Proses diubah menjadi digital sepenuhnya. Begitu dokter selesai menginput permintaan di E5 (Order Permintaan Darah), sistem mengirimkan event `blood_order.created` secara otomatis. F31 menangkap event tersebut secara idempotent dan langsung menampilkannya pada dashboard kerja Lab dengan status `ORDER_CREATED`. F31 menjadi dashboard orkestrasi yang menampilkan worklist dan menyediakan tombol direct link ke proses terkait: Konfirmasi Permintaan Darah dan Input Hasil Pemeriksaan. Setelah proses terkait selesai di PRD/module pemiliknya, F31 mengonsumsi atau menampilkan update status seperti `IN_PROGRESS`, `result_id`, dan `result_status`. Petugas Lab juga dapat langsung mengakses data sosial pasien via deep link ke D3, mencatat tindakan medis dan BHP lewat E1 dalam konteks pasien tersebut, dan merampungkan order yang siap dikirim ke modul Billing (G2).

## 3. Goals & Metrics
| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1  | Pemusatan Pekerjaan Lab | 100% order Permintaan Darah yang berhasil tersimpan di E5 (Order Permintaan Darah) harus tampil secara real-time dan idempotent pada F31. |
| 2  | Kecepatan Akses Konfirmasi | Petugas Lab dapat membuka proses Konfirmasi Permintaan Darah melalui tombol direct link dari baris worklist atau modal detail F31. |
| 3  | Kelengkapan Hasil Pemeriksaan | 100% order dilarang diselesaikan (`COMPLETED`) sebelum F31 menerima/menampilkan `result_id` dan `result_status` valid dari PRD Input Hasil Pemeriksaan. |
| 4  | Keterlacakan Audit Klinis | 100% perubahan state (status), metadata konfirmasi, metadata hasil pemeriksaan, dan alasan penolakan (bila di-cancel) dapat ditampilkan/ditelusuri dari F31 sesuai data yang diterima dari modul terkait. |
| 5  | Efisiensi Pencarian Worklist | Petugas Lab dapat mencari pasien, memfilter unit, tipe penjamin, dan periode waktu harian berjalan secara instan tanpa reload halaman dashboard. |

## 4. Scope Definition & Phasing
| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) | Phase 3 (Accounting: Mapping COA) |
|-------------|---------------------|-----------------------------------------|-----------------------------------|
| **Dashboard Worklist (F31)** | Menampilkan daftar order dari E5 (Order Permintaan Darah) secara idempotent; pencarian case-insensitive; sorting nama/tanggal; filter periode harian default. | Sinkronisasi data real-time via WebSocket / Auto-refresh; integrasi visual status eskalasi keterlambatan respon. | N/A (Modul dashboard tidak berdampak keuangan langsung di luar tindakan/BHP). |
| **Alur Transisi Status (State)** | Menampilkan status dasar worklist: `ORDER_CREATED` -> `IN_PROGRESS` -> `COMPLETED`, serta aksi `CANCELED` (Tolak/Cancel sebelum konfirmasi). Perubahan ke `IN_PROGRESS` berasal dari proses Konfirmasi Permintaan Darah yang diakses melalui tombol direct link. | Menampilkan status/indikator hasil escalation dari PRD terkait; detail approval bukan scope F31. | N/A (Pencatatan state dikonversi menjadi log aktivitas audit). |
| **Direct Link Konfirmasi Permintaan Darah** | Menyediakan tombol direct link dari baris worklist/modal detail menuju PRD/modul Konfirmasi Permintaan Darah dengan membawa konteks order. | Menampilkan status hasil konfirmasi/escalation dari PRD terkait. | N/A. |
| **Direct Link Input Hasil Pemeriksaan** | Menyediakan tombol direct link dari baris worklist/modal detail menuju F32 / PRD Input Hasil Pemeriksaan dengan membawa konteks order. | Menampilkan status hasil atau `result_id` yang diterima dari PRD terkait. | N/A. |
| **Integrasi Tindakan & BHP (E1)** | Membuka modul E1 dengan mengirimkan konteks lengkap (`patient_id`, `encounter_id`, `blood_order_id`, `worklist_id`) lewat deep link. | Validasi silang pemakaian BHP (kantong darah) terhadap stok fisik unit transfusi darah secara real-time. | Pemetaan (Mapping) COA atas tindakan lab transfusi darah dan pemakaian BHP (beban kantong darah, reagen) ke akun debit-kredit di Billing G2 untuk akuntansi otomatis. |

**Out of Scope**:
* Pembuatan order Permintaan Darah awal (merupakan domain eksklusif modul E5 (Order Permintaan Darah)).
* **Konfirmasi Permintaan Darah**: detail proses bisnis, form, validasi klinis/operasional, approval, penyimpanan utama, dan implementasi end-to-end konfirmasi berada di PRD Konfirmasi Permintaan Darah. F31 hanya menyediakan tombol direct link dan menampilkan status/metadata hasil konfirmasi.
* **Input Hasil Pemeriksaan**: detail form, validasi, penyimpanan hasil pemeriksaan, penentuan `result_id`, dan finalisasi hasil berada di F32 / PRD Input Hasil Pemeriksaan. F31 hanya menyediakan tombol direct link dan menampilkan `result_id`/`result_status` yang diterima.
* Manajemen inventori stok darah fisik, pengelolaan donor darah, dan uji crossmatch tingkat lanjut (kecuali disepakati di Phase 2).
* Pengisian atau modifikasi data sosial pasien (dilakukan di modul D3).
* Kasir pembayaran dan pencetakan kuitansi tagihan (dilakukan di modul Billing G2).

## 5. Related Features
* **E5 (Order Permintaan Darah) - Order Permintaan Darah**: Hubungan hulu (Producer) yang mengirimkan pesan event `blood_order.created` berisi data permintaan darah yang menjadi basis pembentukan entri worklist F31.
* **PRD Konfirmasi Permintaan Darah**: Hubungan direct link dari F31 untuk menjalankan proses konfirmasi order. F31 hanya menyediakan tombol navigasi dengan konteks order dan menampilkan status/metadata hasil konfirmasi yang dikembalikan PRD terkait.
* **D3 - Data Sosial Pasien**: Hubungan referensi hilir (Deep link) untuk membuka data demografi pasien lengkap dari baris kerja F31 tanpa kehilangan konteks ID.
* **E1 - Tindakan dan BHP**: Hubungan pencatatan operasional (Deep link) untuk menginput tindakan medis serta logistik Bahan Habis Pakai (kantong darah, reagen) yang dikerjakan oleh petugas Lab atas order tersebut.
* **F32 / PRD Input Hasil Pemeriksaan**: Hubungan direct link dari F31 untuk membuka proses input hasil pemeriksaan. F32/PRD terkait menangani perekaman data hasil pemeriksaan laboratorium transfusi darah, sedangkan F31 hanya menampilkan tombol navigasi dan menerima/menampilkan ID hasil (`result_id`) beserta status hasil (`result_status`) sebelum order dapat diselesaikan (`COMPLETED`).
* **G2 - Billing / Tagihan Pasien**: Hubungan hilir keuangan untuk menampung tagihan otomatis atas tindakan/BHP yang diinput lewat modul E1 terintegrasi F31.

## 6. Business Process & User Stories
* **State Machine Table**:

| Status | Deskripsi | Efek Stok | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| `ORDER_CREATED` | Order baru diterima dari E5 (Order Permintaan Darah); menunggu tindakan petugas Lab. | Belum ada efek stok (darah belum direservasi). | -> `IN_PROGRESS` (berdasarkan hasil proses Konfirmasi Permintaan Darah dari PRD terkait yang dibuka via tombol direct link F31)<br>-> `CANCELED` (via Tolak/Cancel) | Sama + menampilkan indikator escalation dari PRD terkait jika tersedia. |
| `IN_PROGRESS` | Order telah dikonfirmasi dan sedang dalam pengerjaan teknis lab. | Darah donor direservasi sementara untuk pasien terkait. | -> `COMPLETED` (via Selesai, butuh `result_id` valid) | Sama + -> `CANCELED` khusus melalui approval Supervisor Lab disertai alasan klinis kuat. |
| `COMPLETED` | Pemeriksaan selesai, hasil valid tersimpan, order dirampungkan. | Stok darah donor berkurang secara definitif untuk diserahkan. | N/A (State Akhir) | Sama. |
| `CANCELED` | Order ditolak atau dibatalkan oleh petugas Lab (wajib alasan). | Reservasi darah dibatalkan; stok kembali bebas. | N/A (State Akhir) | Sama. |

* **User Stories Utama**:
1. **Melihat Worklist**: Sebagai Petugas Lab, saya ingin melihat daftar seluruh order permintaan darah dari unit asal yang disaring berdasarkan periode harian, agar saya dapat mengetahui beban kerja hari ini dengan cepat.
2. **Membuka Konfirmasi Order**: Sebagai Petugas Lab, saya ingin membuka proses Konfirmasi Permintaan Darah melalui tombol direct link dari F31, agar saya dapat melanjutkan konfirmasi di PRD/modul pemilik proses.
3. **Membuka Input Hasil**: Sebagai Petugas Lab, saya ingin membuka proses Input Hasil Pemeriksaan melalui tombol direct link dari F31, agar hasil pemeriksaan diinput di PRD/modul pemilik proses dan F31 dapat menampilkan `result_id`/`result_status` setelah tersedia.
4. **Menolak Order**: Sebagai Petugas Lab, saya ingin menolak order yang tidak valid atau sampel rusak pada status `ORDER_CREATED` dengan mengisi alasan pembatalan, agar dokter pengirim mendapatkan informasi penolakan tersebut secara transparan.
5. **Menyelesaikan Order**: Sebagai Petugas Lab, saya ingin menandai order `IN_PROGRESS` yang sudah memiliki hasil pemeriksaan valid sebagai `COMPLETED`, agar transaksi dapat ditutup dan diteruskan ke sistem tagihan billing.

## 7. Functional Requirements
### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Dashboard Worklist Permintaan Darah**
* **User Story**: Sebagai Petugas Lab, saya ingin melihat daftar permintaan darah terpusat dengan filter harian default dan kolom informasi yang lengkap, agar saya dapat menyaring dan memproses order secara efisien.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Dashboard harus menampilkan kolom wajib: No Order, Tanggal Order, Nama Pasien + JK + Usia (diambil dari D3), No RM (dari E5 (Order Permintaan Darah)), Tipe Pelayanan (dari penjamin E5 (Order Permintaan Darah)), Unit Asal, Rencana Periksa, Dokter, Status, dan Aksi.
    * **AC 2**: Default filter waktu otomatis di-set ke hari berjalan (00:00:00 s.d 23:59:59 Asia/Jakarta) ketika layar pertama kali dibuka.
    * **AC 3**: Pencarian (Search) bersifat case-insensitive dan mencari kecocokan pada No Order, Nama Pasien, No RM, Unit Asal, dan Nama Dokter secara real-time (debounce 300ms) atau setelah menekan Enter.
    * **AC 4**: Sorting (pengurutan) dapat dilakukan pada kolom Nama Pasien (A-Z, Z-A) dan Tanggal Order (Terbaru-Terlama, Terlama-Terbaru) menggunakan data timestamp asli.
* **Validasi**:
  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | `tanggal_mulai` | Date | Required | "Tanggal mulai wajib diisi" | "Pilih tanggal awal filter" |
  | `tanggal_selesai` | Date | Required, >= `tanggal_mulai` | "Tanggal selesai tidak boleh sebelum tanggal mulai" | "Pilih tanggal akhir filter" |

---

**Fitur: Tombol Direct Link Konfirmasi Permintaan Darah**
* **Catatan Scope**: Konfirmasi Permintaan Darah adalah outscope F31 dan dikelola dalam PRD Konfirmasi Permintaan Darah. F31 hanya menyediakan tombol direct link dan menampilkan status/metadata hasil konfirmasi.
* **User Story**: Sebagai Petugas Lab, saya ingin membuka proses Konfirmasi Permintaan Darah dari dashboard F31 agar saya dapat melanjutkan proses di PRD/modul pemiliknya tanpa memilih ulang order.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Tombol "Konfirmasi Permintaan" hanya boleh ditampilkan pada entri worklist yang berstatus `ORDER_CREATED`.
    * **AC 2**: Ketika diklik, F31 membuka direct link ke PRD/modul Konfirmasi Permintaan Darah dengan membawa minimal `patient_id`, `encounter_id`, `blood_order_id`, `order_number`, dan `worklist_id`.
    * **AC 3**: F31 tidak menampilkan form, validasi klinis/operasional, approval, atau penyimpanan utama untuk proses konfirmasi.
    * **AC 4**: Setelah proses konfirmasi selesai di PRD/modul terkait, F31 menampilkan status/metadata yang diterima, misalnya status `IN_PROGRESS`, `confirmed_at`, dan `confirmed_by`.
    * **AC 5**: Setelah status bukan `ORDER_CREATED`, tombol "Konfirmasi Permintaan" dan "Tolak/Cancel" tidak boleh ditampilkan lagi di dashboard.
* **Validasi**: Tidak ada form input konfirmasi di F31. Validasi bisnis dan validasi klinis konfirmasi berada di PRD Konfirmasi Permintaan Darah. F31 hanya melakukan validasi visibilitas tombol berdasarkan status lokal worklist.

---

**Fitur: Tolak/Cancel Order**
* **User Story**: Sebagai Petugas Lab, saya ingin menolak order permintaan darah sebelum diproses dengan menyertakan alasan pembatalan, agar order dihentikan dan alasan tercatat secara jelas.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Tombol "Tolak/Cancel Order" hanya tampil pada order yang berstatus `ORDER_CREATED`.
    * **AC 2**: Mengklik tombol harus memunculkan modal dialog popup "Alasan Pembatalan" yang mewajibkan input teks alasan penolakan.
    * **AC 3**: Setelah disubmit, status berubah menjadi `CANCELED`, mencatat `cancellation_reason` dan `canceled_at`. Tombol aksi dihilangkan dari dashboard kerja.
* **Validasi**:
  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | `cancellation_reason` | Text Area | Required, Min 10, Max 200 | "Alasan pembatalan wajib diisi (minimal 10 karakter)" | "Masukkan alasan detail penolakan/pembatalan order" |

---

**Fitur: Tombol Direct Link Input Hasil Pemeriksaan**
* **Catatan Scope**: Input Hasil Pemeriksaan adalah outscope F31 dan dikelola dalam F32 / PRD Input Hasil Pemeriksaan. F31 hanya menyediakan tombol direct link dan menampilkan `result_id`/`result_status` yang diterima.
* **User Story**: Sebagai Petugas Lab, saya ingin membuka proses Input Hasil Pemeriksaan dari dashboard F31 agar hasil pemeriksaan diinput di PRD/modul pemiliknya tanpa memilih ulang order.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Tombol "Input Hasil Pemeriksaan" hanya aktif pada order yang berstatus `IN_PROGRESS`.
    * **AC 2**: Ketika diklik, F31 membuka direct link ke F32 / PRD Input Hasil Pemeriksaan
    * **AC 3**: F31 tidak menampilkan form Golongan Darah, Rhesus, Crossmatch, validasi hasil, atau penyimpanan utama hasil pemeriksaan.
    * **AC 4**: Setelah hasil disimpan/final di F32 / PRD terkait, F31 menampilkan `result_id` dan `result_status` yang diterima.
    * **AC 5**: Pada status `COMPLETED`, tombol berubah menjadi "Lihat Hasil Pemeriksaan" dan tetap berupa direct link read-only ke F32 / PRD terkait.
* **Validasi**: Tidak ada form input hasil pemeriksaan di F31. Validasi field hasil pemeriksaan berada di F32 / PRD Input Hasil Pemeriksaan. F31 hanya melakukan validasi visibilitas tombol berdasarkan status lokal worklist.

---

**Fitur: Selesaikan Order (Complete)**
* **User Story**: Sebagai Petugas Lab, saya ingin menyelesaikan order yang pengerjaannya telah rampung agar statusnya berubah menjadi Selesai.
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Tombol "Selesai" hanya boleh diklik ketika order berada di status `IN_PROGRESS`.
    * **AC 2**: Ketika diklik, sistem wajib memeriksa apakah order tersebut telah memiliki `result_id` dengan status hasil valid.
    * **AC 3**: Jika `result_id` belum ada, sistem wajib menggagalkan aksi dan menampilkan pesan error: **"Hasil pemeriksaan wajib diinput sebelum order diselesaikan."**
    * **AC 4**: Jika pemeriksaan valid, status diperbarui menjadi `COMPLETED`, mencatat `completed_at` serta `completed_by`.
* **Validasi**:
  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | `result_id` | Hidden | Required | "Hasil pemeriksaan wajib diinput sebelum order diselesaikan." | - |

---

## 8. Data & Technical Specifications
### 8.1 Database Schema Suggestion
* **Table Name**: `blood_transfusion_worklists`
* **Key Columns**:
    * `id`: UUID (Primary Key, default `gen_random_uuid()`)
    * `blood_order_id`: UUID (Unique, reference to E5 (Order Permintaan Darah) blood_order for idempotency)
    * `order_number`: VARCHAR(50) (Unique, reference to E5 (Order Permintaan Darah) order code)
    * `patient_id`: UUID (Reference to patient master in D3)
    * `encounter_id`: UUID (Reference to active patient encounter)
    * `source_unit_id`: VARCHAR(50) (Identifier for unit asal)
    * `ordered_at`: TIMESTAMP WITH TIME ZONE (Timestamp order dibuat di E5 (Order Permintaan Darah))
    * `planned_exam_at`: TIMESTAMP WITH TIME ZONE (Rencana pelaksanaan pemeriksaan)
    * `ordering_doctor_id`: VARCHAR(50) (ID Dokter pengirim)
    * `status`: VARCHAR(30) (Status worklist: 'ORDER_CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED')
    * `result_id`: UUID (Nullable, reference to result document from F32 / PRD Input Hasil Pemeriksaan)
    * `result_status`: VARCHAR(20) (Nullable, e.g., 'PENDING', 'VALID', 'FINAL')
    * `cancellation_reason`: TEXT (Nullable, filled if status is CANCELED)
    * `confirmed_at`: TIMESTAMP WITH TIME ZONE (Nullable, metadata hasil konfirmasi dari PRD Konfirmasi Permintaan Darah)
    * `confirmed_by`: VARCHAR(100) (Nullable, metadata hasil konfirmasi dari PRD Konfirmasi Permintaan Darah)
    * `completed_at`: TIMESTAMP WITH TIME ZONE (Nullable)
    * `completed_by`: VARCHAR(100) (Nullable)
    * `canceled_at`: TIMESTAMP WITH TIME ZONE (Nullable)
    * `canceled_by`: VARCHAR(100) (Nullable)
    * `coa_id`: UUID (Nullable, Phase 3 Mapping COA preparation)
    * `is_active`: Boolean (default true)
    * `created_at`: TIMESTAMP WITH TIME ZONE (default NOW())
    * `updated_at`: TIMESTAMP WITH TIME ZONE (default NOW())

### 8.2 API Endpoint Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/blood-transfusion/worklists` | List worklist data with search, sort, pagination, and status/unit filters. |
| GET    | `/api/v1/blood-transfusion/worklists/{id}` | Retrieve details of a single worklist entry (including patient metadata and order details). |
| GET    | `/api/v1/blood-transfusion/worklists/{id}/confirm-link` | Menghasilkan direct link ke PRD/modul Konfirmasi Permintaan Darah dengan konteks order; tidak memproses konfirmasi di F31. |
| GET    | `/api/v1/blood-transfusion/worklists/{id}/result-link` | Menghasilkan direct link ke F32 / PRD Input Hasil Pemeriksaan dengan konteks order; tidak menyimpan hasil pemeriksaan di F31. |
| POST   | `/api/v1/blood-transfusion/worklists/{id}/cancel` | Cancel order from `ORDER_CREATED` to `CANCELED` (requires `cancellation_reason`). |
| POST   | `/api/v1/blood-transfusion/worklists/{id}/complete` | Complete worklist entry from `IN_PROGRESS` to `COMPLETED` (checks `result_id` existence). |
| PATCH  | `/api/v1/blood-transfusion/worklists/{id}/toggle-active` | Toggle active status (`is_active` boolean value) for dashboard management. |

### 8.3 Data & Business Rules
#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)
*Catatan: Entri worklist utama dibuat otomatis oleh integrasi sistem via event `blood_order.created` (tidak ada form CREATE manual dari sisi user untuk baris baru). F31 tidak memiliki form Konfirmasi Permintaan Darah dan tidak memiliki form Input Hasil Pemeriksaan; keduanya hanya dibuka melalui tombol direct link ke PRD/modul terkait.*
Berikut adalah form penunjang yang tetap berada dalam scope F31:

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| `cancellation_reason` | Alasan Pembatalan | Text Area | Ya (Jika Cancel) | Min 10, Max 200 karakter | User Input | Diperlukan di modal dialog Tolak/Cancel. |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| **No Order** | `order_number` | Text | Filter (Search) | Kode unik dari E5 (Order Permintaan Darah), contoh: `DB-260719-0001` |
| **Tanggal Order** | `ordered_at` | DateTime (Lokal) | Filter (Date) / Sort | Contoh: `Minggu, 19 Juli 2026 12:25` |
| **Nama Pasien** | `patient_name` | Text (disertai JK & Usia) | Filter (Search) / Sort | Diambil dari D3, contoh: `Andi Pratama (L · 35 thn)` |
| **No RM** | `medical_record_number` | Text | Filter (Search) | Nomor Rekam Medis dari E5 (Order Permintaan Darah) |
| **Tipe Penjamin** | `payer_type` | Text | Filter (Dropdown) | Diambil dari `payer_type` E5 (Order Permintaan Darah), contoh: `BPJS` |
| **Unit Asal** | `source_unit` | Text | Filter (Dropdown) | Unit pengirim, contoh: `IGD` |
| **Rencana Periksa** | `planned_exam_at` | DateTime (Lokal) | - | Rencana pelaksanaan dari E5 (Order Permintaan Darah), contoh: `20/07/2026 20:26` |
| **Dokter** | `ordering_doctor` | Text | Filter (Search) | Nama dokter pengirim dari E5 (Order Permintaan Darah) |
| **Status** | `status` | Label Badge (Color-coded) | Filter (Dropdown) | Menunggu Konfirmasi, Sedang Diproses, Selesai, Dibatalkan |

* **Business Rules**:
1. **Idempotensi Integrasi**: Pembuatan entri worklist F31 harus menggunakan `blood_order_id` dan `order_number` dari event E5 (Order Permintaan Darah) sebagai constraint unik. Jika event yang sama diterima kembali, sistem harus mengabaikannya tanpa membuat baris ganda.
2. **Server-Side State Guard**: UI hanya merefleksikan kontrol aksi. Validasi transisi status wajib di-enforce di level API/backend server. Request API cancel pada status `IN_PROGRESS` harus mengembalikan error `409 Conflict`.
3. **Penyelesaian Berdasarkan Kelayakan Medis**: Aksi "Selesai" (`COMPLETED`) wajib memeriksa keberadaan kolom `result_id` yang tidak null dan `result_status` bernilai valid. Jika kriteria ini tidak terpenuhi, transisi database harus dibatalkan (rollback) dengan feedback pesan error yang jelas.
4. **Deep-Linking Context Management**: Semua tombol navigasi ke PRD/modul Konfirmasi Permintaan Darah, F32 / PRD Input Hasil Pemeriksaan, D3 (Data Sosial), dan E1 (Tindakan/BHP) wajib membawa query parameter `patient_id`, `encounter_id`, `blood_order_id`, `order_number`, dan `worklist_id`. Saat user kembali dari modul terkait ke F31, dashboard harus mengingat parameter filter aktif sebelumnya.
5. **Auto-Status Behavior**: Sesuai panduan standar, entri baru yang dibuat otomatis oleh sistem selalu di-set aktif (`is_active = true`). Pengelolaan aktif/nonaktif baris data hanya boleh dilakukan di level Dashboard via toggle status aktif.
6. **Batas Scope Konfirmasi**: F31 tidak menjalankan proses Konfirmasi Permintaan Darah. F31 hanya menampilkan tombol direct link dan status/metadata hasil konfirmasi yang diterima dari PRD terkait.
7. **Batas Scope Input Hasil**: F31 tidak menjalankan proses Input Hasil Pemeriksaan. F31 hanya menampilkan tombol direct link serta `result_id`/`result_status` yang diterima dari F32 / PRD terkait.

## 9. Workflow / BPMN Interpretation
Berdasarkan diagram alur BPMN `g-support-blood-transfusion.json` dan skenario integrasi sistem yang dirancang:
1. **Pemicu Alur**: Alur kerja dimulai di sisi modul **E5 (Order Permintaan Darah)** di mana dokter menginput formulir Permintaan Darah untuk pasien. Setelah data disimpan, broker sistem memancarkan event `blood_order.created`.
2. **Inisiasi Worklist**: Server F31 menangkap event tersebut, memvalidasi idempotensi kunci, dan menyisipkan baris kerja baru di tabel database dengan status default `ORDER_CREATED` (Menunggu Konfirmasi).
3. **Verifikasi & Aksi Awal**: Petugas Lab Transfusi Darah melihat entri baru pada layar kerja F31 yang secara default tersaring ke hari ini. Petugas membuka modal Detail Permintaan untuk memverifikasi data klinis.
    * *Skenario Penolakan*: Jika data permintaan tidak lengkap, sampel rusak, atau stok reagen kosong, petugas mengklik tombol **Tolak/Cancel Order**. Petugas wajib menginput alasan penolakan di form modal popup. Sistem menyimpan alasan tersebut di kolom `cancellation_reason`, mengubah status menjadi `CANCELED`, dan mengirimkan update log audit. Alur order berakhir di sini.
    * *Skenario Penerimaan*: Jika data valid, petugas mengklik tombol direct link **Konfirmasi Permintaan** di F31. F31 membuka PRD/modul Konfirmasi Permintaan Darah dengan konteks order. Setelah proses terkait selesai, F31 menampilkan status `IN_PROGRESS`, `confirmed_at`, dan `confirmed_by` yang diterima dari PRD/modul pemilik proses. Tombol pembatalan otomatis dinonaktifkan baik di UI maupun di level API setelah status bukan `ORDER_CREATED`.
4. **Pengerjaan & Integrasi Eksternal**: Selama status berada di `IN_PROGRESS`, petugas melakukan pengerjaan fisik sampel darah. Petugas dapat mengklik tombol shortcut terintegrasi untuk:
    * Membuka **D3 (Data Sosial)** guna melihat detail klinis pasien (membawa ID konteks).
    * Membuka **E1 (Tindakan dan BHP)** guna mencatat tindakan medis lab yang dilakukan dan pemakaian BHP (seperti kantong darah, jarum, reagen) secara langsung di dalam billing pasien.
5. **Input Hasil Medis**: Setelah pengerjaan laboratorium selesai (seperti crossmatch, penentuan golongan darah final), petugas mengklik tombol direct link **Input Hasil Pemeriksaan** di F31. F31 membuka F32 / PRD Input Hasil Pemeriksaan dengan konteks order. Input, validasi, penyimpanan, dan finalisasi hasil dilakukan di PRD/modul terkait. Setelah hasil tersedia, F31 menampilkan `result_id` dan `result_status` yang diterima.
6. **Penyelesaian Alur**: Petugas mengklik tombol **Selesai**. Sistem memvalidasi apakah order tersebut telah memiliki `result_id`. Jika ya, sistem memperbarui status order menjadi `COMPLETED` dan mencatat data penyelesaian. Alur kerja untuk order ini dinyatakan selesai secara operasional dan transaksi billing siap diposting di modul G2.
