# PRD — Dashboard Pelayanan Operasi (Instalasi Bedah Sentral / IBS)

**Related Document:** Referensi tampilan Dashboard Pelayanan Operasi Neurovi v1 (screenshot) `[PERLU KONFIRMASI]` dokumen PRD pendamping (mis. PRD EMR Operasi, PRD Farmasi, PRD Billing) bila ada.
**Dokumen ID:** `[PERLU KONFIRMASI]`  ·  **Versi:** 2.0 (Draft)
**Tanggal Disusun:** 16 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]`
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Dashboard Pelayanan Operasi Instalasi Bedah Sentral (IBS) adalah pusat monitoring bagi petugas IBS untuk memantau seluruh proses pelayanan operasi, mulai dari order operasi masuk, konfirmasi jadwal, pelaksanaan tindakan, hingga penyelesaian operasi. Pada Neurovi v1, dashboard ini sudah menampilkan daftar order operasi harian beserta status, nomor antrian, data pasien, dokter operator, tipe penjamin, dan status kegawatan (Cito/Tidak Cito), dilengkapi pencarian nama pasien dan filter tanggal.

Untuk Fase 1 (MVP) Neurovi v2, modul ini mempertahankan seluruh alur bisnis dan fungsi monitoring yang sudah berjalan di v1 — tidak ada perubahan proses bisnis — dengan penguatan pada dua sisi utama: (1) kejelasan visual antara order operasi yang **belum terkonfirmasi** dan yang **sudah terkonfirmasi/berjalan**, melalui indikator status yang lebih informatif, dan (2) penguatan logic sistem agar seluruh tindakan, pencatatan medis, dan dokumentasi operasi selalu tercatat pada **registrasi pasien yang aktif** saat operasi dikonfirmasi — termasuk pada kondisi pasien memiliki lebih dari satu registrasi (Rawat Jalan/IGD/Rawat Inap). Dashboard juga menjadi pusat akses ke fitur-fitur pendukung pelayanan operasi: konfirmasi jadwal, input tindakan & tenaga medis, order obat/BHP, input EMR operasi, pencatatan material/implant, unggah dokumen pendukung, penundaan jadwal, serta pembatalan dan penyelesaian operasi.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — [Screenshot dashboard v1; Draft user]:
- Dashboard menampilkan daftar order operasi pada tanggal tertentu (default hari berjalan) dengan kolom: No Antri, Status, Nama, No. RM, Tipe Penjamin, Cito, dan Dokter.
- Status order operasi yang teramati pada v1 antara lain "Belum terkonfirmasi", "Terkonfirmasi", "Sedang berlangsung", "Ditunda", "Selesai".
- Tersedia ringkasan jumlah pasien per kelompok status di bagian atas daftar (mis. "3 Pasien Belum Dilayani, 1 Pasien Sedang Dilayani").
- Tersedia filter tanggal pelayanan, tombol Filter, serta kolom pencarian nama pasien.
- Baris order yang sedang aktif menampilkan sekumpulan ikon aksi cepat (profil/data sosial, jadwal, tindakan, catatan, dokumen, pemeriksaan penunjang, riwayat/waktu, batal, dan penyelesaian).

**Masalah/pain point:**
- Aspek bisnis proses: Tidak ada pain point pada aspek ini — alur pelayanan operasi V1 tetap dipertahankan di v2.
- Aspek UX: Pembeda visual antara order operasi yang belum dikonfirmasi dan yang sudah dikonfirmasi/berjalan masih kurang jelas, sehingga petugas IBS berpotensi terlambat menindaklanjuti order yang menunggu konfirmasi.
- Aspek logic system: Ketika pasien memiliki lebih dari satu registrasi (mis. pernah berobat di Rawat Jalan lalu masuk kembali lewat IGD/Rawat Inap), terdapat risiko tindakan operasi, catatan medis, dan dokumentasi tercatat pada registrasi yang keliru/tidak aktif.

**Dampak utama yang disasar v2:**
- Petugas IBS lebih cepat mengidentifikasi order yang masih memerlukan tindak lanjut konfirmasi.
- Risiko kesalahan pencatatan pelayanan operasi pada registrasi pasien yang salah berkurang.
- Koordinasi antar-unit (poli, IGD, rawat inap, TPPRI, dan IBS) lebih lancar karena status operasi termonitor secara real-time.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = Dashboard Pelayanan Operasi, filter & pencarian, konfirmasi jadwal, input tindakan & tenaga medis, order obat/BHP, input EMR operasi, pencatatan material/implant/BHP/obat, unggah dokumen pendukung, penundaan jadwal, pembatalan, dan penyelesaian operasi — beserta seluruh integrasi terkait (Rawat Jalan, IGD, Rawat Inap, TPPRI, Farmasi, Billing, EMR/Rekam Medis).

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Dashboard Pelayanan Operasi** — menampilkan daftar order operasi dengan informasi: No Antri, Status, Nama, No. RM, Tipe Penjamin, Cito, Dokter, Tanggal & Waktu Terdaftar, Jenis Kelamin, dan Umur.
2. **Filter dan Pencarian** — filter berdasarkan Tanggal (single date), Kegawatan (Cito/Tidak Cito), dan Status (Belum Terkonfirmasi, Terkonfirmasi, Sedang Berlangsung, Ditunda, Dibatalkan, Selesai); pencarian berdasarkan Nama Pasien dan No. RM.
3. **Fitur pelayanan operasi**: Data Sosial, Konfirmasi Jadwal Operasi, Input EMR, Tindakan & BHP, Catatan Penggunaan Material dan Obat, Dokumen Pendukung, Pemeriksaan Penunjang, Penundaan Jadwal, Batal Operasi, Selesai.
4. **Integrasi dengan seluruh registrasi pasien** (Rawat Jalan, IGD, Rawat Inap, VK).
5. **Integrasi dengan Farmasi** untuk order obat dan BHP.
6. **Integrasi dengan Billing** untuk pencatatan pemakaian yang berdampak pada tagihan.
7. **Integrasi dengan Electronic Medical Record (EMR)** untuk asesmen, laporan operasi, resume tindakan, dan formulir medis sesuai konfigurasi rumah sakit.

### Out Scope
- Master Data IBS.
- Master Data Kamar Operasi.
- Master Tarif Tindakan.
- Master Material/Implant.
- Konfigurasi Template EMR.
- Pengaturan Jadwal Dokter Operasi.
- Pengaturan Master Peralatan Operasi.

## 4. Goals and Metrics

### Tujuan
Menyediakan Dashboard IBS sebagai pusat monitoring seluruh proses pelayanan operasi secara real-time — mulai dari order operasi, konfirmasi jadwal, pelaksanaan tindakan, hingga penyelesaian operasi — guna memudahkan koordinasi antar unit dan memastikan seluruh tindakan serta pencatatan medis tercatat pada registrasi pasien yang benar.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu akses dashboard, pencarian, dan filter | < 1 detik | Performance Expectation |
| Refleksi perubahan status ke seluruh pengguna IBS | Real-time (near real-time) | Performance Expectation |
| Akurasi pencatatan pelayanan IBS pada registrasi aktif yang benar | 100% tindakan/EMR/dokumen menempel pada registrasi yang dikonfirmasi | Expected Improvement (Logic) |
| Registrasi aktif ganda sebagai acuan pencatatan pada satu order | 0 (hanya satu registrasi aktif) | Expected Improvement (Logic) |
| Kejelasan pembeda order belum terkonfirmasi vs terkonfirmasi | 100% order menampilkan pembeda visual status | Expected Improvement (UX) |
| Kelengkapan atribut penundaan (alasan, waktu, petugas) saat status Ditunda | 100% penundaan tercatat lengkap | Feature Capabilities |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Rawat Jalan | Sumber order operasi/registrasi pasien. |
| IGD | Sumber order operasi/registrasi pasien. |
| Rawat Inap | Sumber order operasi/registrasi pasien. |
| TPPRI | Koordinasi terkait registrasi pasien rawat inap untuk kebutuhan operasi. |
| Farmasi | Penyedia/pemroses order obat dan BHP yang digunakan selama tindakan operasi. |
| Billing/Kasir | Konsumen data pemakaian tindakan, obat, BHP, dan material untuk proses penagihan. |
| Electronic Medical Record (EMR) / Rekam Medis | Penyimpan asesmen, laporan operasi, resume tindakan, dan formulir medis operasi; serta penyimpan dokumen pendukung (informed consent, foto tindakan, hasil pemeriksaan penunjang, dll.). |
| Manajemen Dokumen | Penyimpan dokumen pendukung operasi (informed consent, foto tindakan, hasil pemeriksaan penunjang, dokumen lain). |

Dependency lintas modul: **Rawat Jalan**, **IGD**, **Rawat Inap**, **TPPRI**, **Farmasi**, **Billing**, **Electronic Medical Record**, **Manajemen Dokumen**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Petugas IBS | Primary | Memonitor dashboard, melakukan konfirmasi jadwal, input tindakan, penundaan, pembatalan, dan penyelesaian operasi. |
| Dokter Operator | Secondary | Pelaksana tindakan operasi. |
| Perawat/Tenaga Medis Pendukung | Secondary | Tenaga medis yang terlibat dalam tindakan operasi. |
| Farmasi | Tersier | Memproses order obat dan BHP dari IBS. |
| Kasir/Billing | Tersier | Menerima data pemakaian untuk proses tagihan. |
| Petugas Rekam Medis | Tersier | Meninjau kelengkapan dokumen & EMR operasi. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Order operasi masuk ke Dashboard IBS dari registrasi pasien di Rawat Jalan, IGD, VK, atau Rawat Inap, tampil dengan status **"Belum Terkonfirmasi"**.
2. Petugas IBS meninjau daftar order operasi harian melalui dashboard, dapat memfilter berdasarkan tanggal dan mencari pasien.
3. Petugas IBS melakukan konfirmasi jadwal operasi, status berubah menjadi **"Terkonfirmasi"**.
4. Saat tindakan berlangsung, status order berubah menjadi **"Sedang Berlangsung"**.
5. Petugas melakukan input tindakan, EMR, catatan pemakaian obat/BHP/material, dan dokumen pendukung melalui ikon aksi pada baris order.
6. Operasi diselesaikan atau dapat ditunda/dibatalkan sesuai kondisi lapangan.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Order operasi masuk ke Dashboard IBS dari registrasi pasien di Rawat Jalan, IGD, Rawat Inap, atau VK, tampil dengan status **"Belum Terkonfirmasi"** dengan indikator visual yang jelas berbeda dari status lain.
2. Petugas IBS meninjau, memfilter (tanggal, status, kegawatan), dan mencari (nama/No. RM) order operasi.
3. Petugas IBS melakukan konfirmasi jadwal operasi, status berubah menjadi **Terkonfirmasi**; sistem menetapkan registrasi pasien yang dikonfirmasi (registrasi terbaru/aktif) sebagai acuan tunggal pencatatan pelayanan IBS.
4. Saat tindakan mulai, status berubah menjadi **Sedang Berlangsung**; petugas melakukan input tindakan operasi & tenaga medis, order obat/BHP (Farmasi), pencatatan material/implant, input EMR operasi, unggah dokumen pendukung, dan pemeriksaan penunjang — semuanya menempel pada registrasi aktif.
5. Bila operasi ditunda, petugas melakukan **Penundaan Jadwal** (alasan, waktu, petugas) → status berubah menjadi **Ditunda**.
6. Bila operasi dibatalkan, petugas melakukan **Batal Operasi** → status berubah menjadi **Dibatalkan**.
7. Setelah operasi tuntas, petugas menandai **Selesai** → status berubah menjadi **Selesai**; komponen biaya diteruskan ke Billing.
8. Seluruh perubahan status tercermin real-time pada dashboard seluruh pengguna IBS.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Proses bisnis | Alur pelayanan operasi standar. | Tidak berubah — alur tetap sama dengan V1. |
| Indikator status | Pembeda visual antar-status kurang jelas. | Indikator status lebih informatif, pembeda visual jelas antara belum dan sudah terkonfirmasi. |
| Penentuan registrasi aktif | mekanisme V1. | Registrasi yang dikonfirmasi (terbaru/aktif) menjadi acuan tunggal seluruh pencatatan pelayanan IBS, mencegah duplikasi/pencatatan pada registrasi yang tidak digunakan. |
| Filter & pencarian | Filter tanggal, pencarian nama pasien. | Filter tanggal, status, dan kegawatan; pencarian nama pasien dan No. RM (dipertahankan & dilengkapi). |

## 7. Main Flow / Mindmap

### Skenario 1 — Alur normal pelayanan operasi
1. Order operasi masuk dari registrasi pasien (Rawat Jalan/IGD/Rawat Inap/VK) → tampil di Dashboard IBS dengan status **"Belum Terkonfirmasi"**.
2. Petugas IBS meninjau daftar order, memfilter/mencari sesuai kebutuhan.
3. Petugas IBS melakukan konfirmasi jadwal operasi → status berubah menjadi **"Terkonfirmasi"**.
4. Saat tindakan dimulai → status berubah menjadi **"Sedang Berlangsung"**.
5. Petugas menginput tindakan & tenaga medis, order obat/BHP, EMR operasi, catatan pemakaian material/implant, serta mengunggah dokumen pendukung.
6. Operasi selesai → status berubah menjadi **"Selesai"**.

### Skenario 2 — Pasien dengan lebih dari satu registrasi
1. Pasien memiliki lebih dari satu registrasi aktif (mis. riwayat Rawat Jalan dan kunjungan baru via IGD).
2. Petugas IBS mengonfirmasi jadwal operasi pada registrasi yang terbaru/sedang aktif.
3. Seluruh tindakan operasi, catatan medis, dokumentasi medis, dan data pelayanan IBS lainnya tercatat pada registrasi yang dikonfirmasi tersebut, bukan pada registrasi sebelumnya `[BR-002]`.

### Skenario 3 — Penundaan jadwal operasi
1. Petugas IBS memilih order operasi yang akan ditunda.
2. Petugas menginput alasan penundaan, waktu penundaan, dan tercatat sebagai petugas yang melakukan perubahan status.
3. Status order berubah menjadi **"Ditunda"**. Kemudian order berstatus Ditunda dapat dikonfirmasi ulang ke jadwal baru.

### Skenario 4 — Pembatalan operasi
1. Petugas IBS memilih order operasi yang akan dibatalkan.
2. Status order berubah menjadi **"Dibatalkan"**.
## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Petugas IBS dapat melakukan konfirmasi jadwal operasi terhadap order operasi yang berasal dari registrasi pasien mana pun (Rawat Jalan, IGD, maupun Rawat Inap). | Draft user (Aspek Logic System) |
| **BR-002** | Apabila pasien memiliki lebih dari satu registrasi dan operasi dikonfirmasi pada registrasi terbaru/aktif, maka seluruh tindakan operasi, catatan medis operasi, dokumentasi medis, dan data pelayanan IBS lainnya harus tercatat pada registrasi yang dikonfirmasi tersebut, bukan pada registrasi sebelumnya. | Draft user (Aspek Logic System) |
| **BR-003** | Sistem memastikan hanya terdapat satu registrasi aktif yang menjadi acuan pencatatan pelayanan IBS, sehingga tidak terjadi duplikasi maupun pencatatan tindakan pada registrasi yang sudah tidak digunakan. | Draft user (Aspek Logic System) |
| **BR-004** | Status order operasi terdiri dari: Belum Terkonfirmasi, Terkonfirmasi, Sedang Berlangsung, Ditunda, Selesai, dan Dibatalkan. | Draft user (Feature Capabilities); Screenshot v1 |
| **BR-005** | Penundaan operasi wajib mencantumkan alasan penundaan, waktu penundaan, dan petugas yang melakukan perubahan status. | Draft user (Feature Capabilities) |
| **BR-006** | Perubahan status operasi harus langsung tercermin pada dashboard seluruh pengguna IBS secara real-time. | Draft user (Performance Expectation) |

## 9. State Machine

### 9.1 Status Order Operasi
| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Belum Terkonfirmasi | Badge abu-abu | Order operasi baru masuk, menunggu konfirmasi jadwal oleh petugas IBS. |
| Terkonfirmasi | Badge biru | Jadwal operasi telah dikonfirmasi petugas IBS, menunggu pelaksanaan. |
| Sedang Berlangsung | Badge kuning | Tindakan operasi sedang berjalan. |
| Ditunda | Badge orange | Operasi ditunda dengan alasan dan waktu tertentu. |
| Selesai | Badge hijau | Tindakan operasi telah selesai dilaksanakan. |
| Dibatalkan | Badge merha | Order operasi dibatalkan. |

- **Transisi:** Belum Terkonfirmasi → Terkonfirmasi (aksi konfirmasi jadwal oleh petugas IBS) → Sedang Berlangsung (aksi mulai tindakan sesuai jadwal operasi) → Selesai (aksi penyelesaian operasi); dengan kemungkinan cabang dari Terkonfirmasi/Sedang Berlangsung → Ditunda (aksi penundaan), dan dari Belum Terkonfirmasi/Terkonfirmasi → Dibatalkan (aksi pembatalan).

### 9.2 Definisi per Status
- **Belum Terkonfirmasi**: order operasi belum ditindaklanjuti petugas IBS.
- **Terkonfirmasi**: jadwal telah ditetapkan, registrasi aktif telah dikunci sebagai acuan pencatatan (BR-002, BR-003).
- **Sedang Berlangsung**: tindakan operasi berjalan; input tindakan, EMR, obat/BHP, dan dokumen dapat dilakukan.
- **Ditunda**: operasi tertunda, tercatat alasan/waktu/petugas (BR-005).
- **Selesai**: seluruh proses pelayanan operasi rampung.
- **Dibatalkan**: order operasi tidak dilanjutkan.

### 9.3 Status Terminal
Selesai dan Dibatalkan merupakan status akhir (terminal) pada alur order operasi. Terdapat mekanisme perubahan status otomatis oleh sistem jika waktu operasi sudah selesai maka sistem akan auto-selesai.

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Daftar Order Operasi** — menampilkan seluruh order operasi pada tanggal pelayanan terpilih beserta No Antri, Status, Nama, No. RM, Tipe Penjamin, Cito, Dokter, Tanggal & Waktu Terdaftar, Jenis Kelamin, dan Umur. | US-001; BR-004 |
| **FR-002** | **Filter & Pencarian** — memfilter daftar order berdasarkan Tanggal (single), Status, dan Kegawatan (Cito/Tidak Cito); mencari berdasarkan Nama Pasien atau No. RM. | US-002 |
| **FR-003** | **Ringkasan Jumlah Pasien per Status** — menampilkan jumlah pasien pada masing-masing kelompok status pelayanan. | Screenshot v1 |
| **FR-004** | **Konfirmasi Jadwal Operasi** — petugas IBS mengonfirmasi jadwal order operasi, menetapkan registrasi aktif sebagai acuan pencatatan. | US-003; BR-001; BR-002; BR-003 |
| **FR-005** | **Input Tindakan Operasi & Tenaga Medis** — mencatat tindakan operasi beserta tenaga medis yang terlibat. | US-004 |
| **FR-006** | **Catatan Penggunaan Material dan Obat** — melakukan order obat dan bahan habis pakai yang digunakan selama tindakan operasi. | US-005 |
| **FR-007** | **Input EMR** — mengisi asesmen, laporan operasi, resume tindakan, form transfer internal, dan formulir medis sesuai konfigurasi rumah sakit. | US-006 |
| **FR-008** | **Unggah Dokumen Pendukung** — mengunggah informed consent, foto tindakan, hasil pemeriksaan penunjang, dan dokumen lain terkait operasi. | US-008 |
| **FR-009** | **Input Penundaan Operasi** — mencatat alasan, waktu penundaan, dan petugas yang melakukan perubahan status. | US-009; BR-005 |
| **FR-010** | **Pembatalan Operasi** — mengubah status order operasi menjadi Dibatalkan. | US-010 |
| **FR-011** | **Penyelesaian Operasi** — mengubah status order operasi menjadi Selesai setelah seluruh proses rampung. | US-011 |

## 11. User Stories

> Format "Sebagai … ingin … sehingga …". AC pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas IBS**, saya ingin **melihat daftar order operasi pada tanggal tertentu**, sehingga **saya dapat memonitor seluruh jadwal operasi hari itu**. | 1) Given tanggal pelayanan dipilih, When halaman dashboard dibuka, Then daftar order operasi pada tanggal tersebut tampil beserta status masing-masing (FR-001). | FR-001 |
| **US-002** | Sebagai **petugas IBS**, saya ingin **memfilter dan mencari order operasi**, sehingga **saya dapat menemukan data pasien/status yang saya butuhkan dengan cepat**. | 1) Given daftar order operasi tampil, When saya memasukkan kata kunci nama/No. RM atau memilih filter status/kegawatan, Then daftar terupdate sesuai kriteria dalam < 1 detik (NFR-001). | FR-002 |
| **US-003** | Sebagai **petugas IBS**, saya ingin **mengonfirmasi jadwal operasi**, sehingga **order operasi siap dilaksanakan dan registrasi aktif tercatat dengan benar**. | 1) Given order berstatus Belum Terkonfirmasi, When saya melakukan konfirmasi, Then status berubah menjadi Terkonfirmasi dan registrasi aktif terkunci sebagai acuan pencatatan (BR-002, BR-003). | FR-004; BR-001 |
| **US-004** | Sebagai **petugas IBS/dokter operator**, saya ingin **mencatat tindakan operasi dan tenaga medis yang terlibat**, sehingga **riwayat tindakan tercatat lengkap pada registrasi yang benar dan data pemakaian akurat untuk kebutuhan medis serta billing**. | 1) Given operasi berstatus Sedang Berlangsung, When saya menginput tindakan dan tenaga medis, Then data tersimpan pada registrasi aktif dan dapat diteruskan ke Billing. | FR-005 |
| **US-005** | Sebagai **petugas IBS**, saya ingin **mencatat penggunaan material dan obat**, sehingga **kebutuhan farmasi selama tindakan tercatat dan diproses serta billing tercatat**. | 1) Given operasi berjalan, When saya menginput order obat/BHP, Then order diteruskan ke modul Farmasi dan dapat diteruskan ke Billing. | FR-006 |
| **US-006** | Sebagai **dokter operator**, saya ingin **mengisi EMR**, sehingga **asesmen, laporan operasi, form transfer internal, dan resume tindakan terdokumentasi**. | 1) Given operasi berjalan/selesai, When saya mengisi formulir EMR sesuai konfigurasi rumah sakit, Then data tersimpan pada rekam medis pasien terkait. | FR-007 |
| **US-007** | Sebagai **petugas IBS**, saya ingin **mengunggah dokumen pendukung operasi**, sehingga **kelengkapan dokumen (informed consent, foto, hasil penunjang) tersimpan pada registrasi yang benar**. | 1) Given operasi terkonfirmasi/berlangsung, When saya mengunggah dokumen, Then dokumen tersimpan dan terhubung ke registrasi aktif. | FR-009 |
| **US-008** | Sebagai **petugas IBS**, saya ingin **menginput penundaan operasi**, sehingga **perubahan jadwal terdokumentasi dengan alasan yang jelas**. | 1) Given order Terkonfirmasi/Sedang Berlangsung, When saya menginput alasan, waktu, dan petugas terkait, Then status berubah menjadi Ditunda (BR-005). | FR-010; BR-005 |
| **US-009** | Sebagai **petugas IBS**, saya ingin **membatalkan order operasi**, sehingga **order yang tidak jadi dilaksanakan tercatat dengan status yang sesuai**. | 1) Given order belum Selesai, When saya melakukan pembatalan, Then status berubah menjadi Dibatalkan. | FR-011 |
| **US-010** | Sebagai **petugas IBS**, saya ingin **menandai operasi selesai**, sehingga **status pelayanan operasi tercatat rampung**. | 1) Given seluruh tindakan telah dilaksanakan, When saya menandai Selesai, Then status order berubah menjadi Selesai. | FR-012 |

## 12. Data Requirements (Spesifikasi Field)

### A. Layar TAMPIL — Dashboard Pelayanan Operasi (FR-001)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No Antri | Sistem/order operasi | Numerik | Sort default | Auto-increment |
| Status | Order operasi | Badge warna per status | Filter | Lihat 9.1 |
| Nama | Data pasien (registrasi) | Text, disertai gelar (Tn./Ny.) | Search | Reuse data demografi. |
| No. RM | Data pasien (registrasi) | Text/numerik | Search | Reuse data demografi. |
| Tipe Penjamin | Data penjamin (registrasi) | Text (mis. UMUM, BPJS NON PBI, KIS/BPJS PBI) | - | Reuse data penjamin. |
| Cito | Order operasi | Text/badge (Cito / Tidak Cito) | Filter | BR-004 terkait kegawatan |
| Dokter | Data dokter operator (registrasi/order) | Text | — | — |
| Tanggal & Waktu Terdaftar | Order operasi | dd/mm/yyyy, HH:mm WIB | — | Ditampilkan pada v1 sebagai sub-teks status |
| Jenis Kelamin | Data pasien | Text (Laki-Laki/Perempuan) | — | Reuse data demografi. |
| Umur | Data pasien | Numerik (Tahun) | — | Reuse data demografi. |

### B. Layar INPUT — Filter & Pencarian (FR-002)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| tanggal_pelayanan | Tanggal | Date (single) | Ya | dd/mm/yyyy | Default: tanggal hari ini | — |
| status_filter | Status | Multi-select/dropdown | Tidak | Belum Terkonfirmasi/Terkonfirmasi/Sedang Berlangsung/Ditunda/Dibatalkan/Selesai | — | BR-004 |
| kegawatan_filter | Kegawatan | Dropdown/toggle | Tidak | Cito / Tidak Cito | — | — |
| kata_kunci | Cari nama pasien / No. RM | Text | Tidak | Free text | — | — |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Waktu akses dashboard, pencarian, dan filter < 1 detik. | Metrik |
| **NFR-002** | Real-Time | Dashboard menampilkan status operasi secara real-time sesuai perubahan proses pelayanan, dan perubahan status langsung tercermin pada dashboard seluruh pengguna IBS. | Performance Expectation |
| **NFR-003** | Keamanan/RBAC | Akses fitur konfirmasi, input tindakan/EMR, penundaan, dan pembatalan dibatasi sesuai peran pengguna (petugas IBS/dokter operator). detail matriks hak akses. | `[ASUMSI]` |
| **NFR-004** | Auditabilitas | Perubahan status (konfirmasi, penundaan, pembatalan, penyelesaian) tercatat beserta waktu dan petugas yang melakukan perubahan. | BR-005 |
| **NFR-005** | Ergonomi UI | Indikator status ditampilkan secara informatif dan mudah dibedakan secara visual antara order belum terkonfirmasi dan sudah terkonfirmasi/berjalan. | Expected Improvement (Aspek UX) |

## 14. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Rawat Jalan / IGD / Rawat Inap** | Sumber order operasi dan data registrasi pasien. | Internal | FR-001; BR-001 |
| **TPPRI** | Koordinasi registrasi pasien terkait kebutuhan operasi. | Internal | Performance Expectation |
| **Farmasi** | Menerima dan memproses order obat & BHP dari IBS. | Internal | FR-006 |
| **Billing** | Menerima data pemakaian tindakan, obat, BHP, dan material untuk penagihan. | Internal | FR-008 |
| **Electronic Medical Record (EMR) / Rekam Medis** | Menyimpan asesmen, laporan operasi, resume tindakan, dan formulir medis. | Internal | FR-007 |
| **Manajemen Dokumen** | Menyimpan dokumen pendukung operasi (informed consent, foto tindakan, hasil pemeriksaan penunjang, dll.). | Internal | FR-009 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Modul registrasi (Rawat Jalan/IGD/Rawat Inap/VK) | Hard | Order operasi tidak dapat masuk ke Dashboard IBS. |
| Farmasi | Hard | Order obat/BHP tidak dapat diproses. |
| EMR/Rekam Medis | Hard | Input EMR operasi tidak dapat tersimpan. |
| Billing | Hard | Data pemakaian tertunda diteruskan ke tagihan, tidak menghambat pelayanan operasi itu sendiri. |
