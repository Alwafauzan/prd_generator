# Product Requirement Document (PRD)

# E12.1 — Catatan Pemberian Obat IGD

## 1. Metadata Dokumen

- **Kode Fitur:** E12.1
- **Nama Fitur:** Catatan Pemberian Obat IGD
- **Unit:** IGD saja
- **Parent Feature:** E12 Utama — Order Catatan Pemberian Obat lintas unit
- **Status:** Draft untuk review bisnis, klinis, farmasi, keperawatan, dan teknis
- **Owner:** Product Owner Pelayanan Utama

### Approval

| Stakeholder | Nama/Jabatan | Status | Tanggal |
|---|---|---|---|
| Product Owner Pelayanan Utama | TBD | Pending | TBD |
| Kepala IGD | TBD | Pending | TBD |
| Komite Medik/Perwakilan Dokter IGD | TBD | Pending | TBD |
| Kepala Keperawatan IGD | TBD | Pending | TBD |
| Kepala Instalasi Farmasi | TBD | Pending | TBD |
| IT/SIMRS | TBD | Pending | TBD |

### Related Documents


> Gambar merupakan acuan struktur/alur, bukan desain final. Label, validasi, aksesibilitas, dan konsistensi istilah dapat disempurnakan tanpa mengubah kebutuhan bisnis.

### Document Version

| Tanggal | Versi | Deskripsi Perubahan |
|---|---:|---|
| 19 Juli 2026 | 1.0 | Draft E12.1 khusus IGD berdasarkan referensi visual |
| 19 Juli 2026 | 1.1 | Tambah edit/backdate jam, anti-duplikasi row, audit kritis, dan auto-order lanjut |
| 19 Juli 2026 | 2.0 | Restrukturisasi mengikuti `template-new.md` |
| 19 Juli 2026 | 2.1 | Koreksi Aturan Pakai tiga input dan header List CPO bertingkat tanggal/jam |

## 2. Overview & Background

### Overview / Brief Summary

E12.1 Catatan Pemberian Obat IGD adalah fitur terpisah dari E12 Utama dan hanya berlaku untuk satu episode registrasi IGD. Fitur mencakup:

1. pengajuan resep racik/non-racik oleh dokter IGD;
2. List CPO episode IGD;
3. riwayat pengajuan dan status Farmasi;
4. input pemberian obat oleh perawat kepada pasien;
5. edit dan backdate jam pemberian;
6. pencegahan row obat identik;
7. audit aksi kritis; dan
8. auto-order obat lanjut berdasarkan waktu dan DPJP tertentu.

Semua data dipartisi dengan `registration_id`. Data pasien yang sama dari episode berbeda tidak boleh tercampur.

### Business Process — As-Is

1. Pengajuan resep dan pencatatan pemberian dapat tersebar pada beberapa layar.
2. Status “Diberikan” dari Farmasi dan pemberian kepada pasien berpotensi ditafsirkan sama.
3. Perawat membutuhkan navigasi tambahan untuk menemukan slot waktu yang akan diinput.
4. Kesalahan jam pemberian tidak selalu dapat dikoreksi dengan histori before/after.
5. Pemberian yang terlambat didokumentasikan tidak memiliki mekanisme backdate yang jelas.
6. Obat dengan dosis, aturan pakai, dan rute identik dapat membentuk row ganda.
7. Logging keberhasilan/kegagalan order dan lanjut/henti terapi belum konsisten.
8. Auto-order V1 belum memiliki konfigurasi waktu dan DPJP yang terdokumentasi dengan jelas.

### Business Process — To-Be

1. Dokter membuka episode IGD, menambahkan obat non-racik/racik, menerima validasi alergi/duplikasi, mereview, lalu mengirim order ke Farmasi.
2. Sistem menampilkan List CPO dari sumber row terapi yang sama untuk dokter dan perawat; aksi berbeda berdasarkan role.
3. Riwayat Pengajuan menampilkan status Farmasi secara jelas: Terkirim, Dikonfirmasi, Diberikan Farmasi, Tidak Diberikan, atau Konfirmasi Dokter.
4. Perawat memilih slot/jam, mencatat status dan jumlah pemberian, lalu melengkapi Telaah Obat.
5. Perawat dapat mengedit jam dengan alasan wajib; nilai lama tidak dihapus.
6. Perawat dapat melakukan backdate dengan `administered_at` dan `recorded_at` terpisah.
7. Backend mencegah row aktif kedua jika obat/komposisi, dosis, aturan pakai, dan rute identik pada episode yang sama.
8. Semua order sukses/gagal, edit/backdate, dan lanjut/henti terapi dicatat dalam audit append-only.
9. Scheduler menjalankan auto-order lanjut hanya untuk konfigurasi aktif, waktu yang tepat, episode IGD aktif, DPJP eligible, dan terapi eligible.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---:|---|---|
| 1 | Pengajuan resep elektronik | 100% pengajuan melalui E12.1 menghasilkan Order ID atau error terstruktur |
| 2 | Isolasi episode | 0 data CPO dari `registration_id` lain tampil pada episode aktif |
| 3 | Duplikasi row | 0 row aktif kedua dengan fingerprint identik |
| 4 | Audit order | 100% order sukses/gagal memiliki audit event dan correlation ID |
| 5 | Audit pemberian | 100% input/edit/backdate memiliki aktor, waktu, result, dan histori perubahan |
| 6 | Edit jam | 100% koreksi menghasilkan revision baru tanpa menghapus nilai lama |
| 7 | Backdate | 100% backdate menyimpan waktu aktual dan waktu pencatatan secara terpisah |
| 8 | Auto-order | 0 order lanjut ganda untuk run, episode, terapi, dan periode yang sama |
| 9 | Performa List CPO | p95 < 1 detik pada dataset sampai 60 item |
| 10 | Performa submit/simpan | p95 submit order dan simpan pemberian < 1 detik pada environment acceptance |
| 11 | Beban operasional | Mendukung 100–150 pasien IGD per hari |
| 12 | Kompatibilitas | Lulus UAT pada PC, tablet landscape, dan dua versi mayor terbaru browser target |

Laporan performance test wajib mencantumkan spesifikasi server/database, ukuran payload, concurrency, browser, jaringan, dan p50/p95/p99.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — MVP/CRUD | Phase 2 — Advanced Approval/Escalation |
|---|---|---|
| Pengajuan Non-Racik | Create/edit/delete draft, validasi, submit | Amendment order setelah dikirim dengan approval/konfirmasi |
| Pengajuan Racik | Header racik, multi-bahan, edit/delete, submit | Template racik dan approval perubahan komposisi |
| Validasi Alergi | Mock EMR; match nama/kandungan; warning | Integrasi EMR produksi dan escalation policy klinis |
| Anti-duplikasi Row | Hard prevention berdasarkan fingerprint episode | Clinical override beralasan jika dibutuhkan |
| List CPO | Read episode, slot, role-based actions | Personalisasi dan clinical decision support |
| Riwayat Pengajuan | Filter/search dan timeline status | Analitik status dan eskalasi SLA Farmasi |
| Pemberian Perawat | Input status, jumlah, waktu, telaah | Co-sign/supervisor approval untuk kondisi berisiko |
| Edit Jam | Versioning, alasan wajib, optimistic locking | Approval supervisor berdasarkan periode/risiko |
| Backdate | Dua timestamp, alasan wajib, audit | Approval supervisor dan escalation batas waktu |
| Audit Trail | Append-only event untuk aksi kritis | Alert anomali dan dashboard audit |
| Auto-order Lanjut | Konfigurasi waktu/DPJP, scheduler idempotent, monitoring | Aturan kompleks per obat/formularium dan approval konfigurasi |
| Responsive UI | PC/tablet landscape dan browser target | PWA/mobile enhancement bila dibutuhkan |

### In Scope

1. Pengajuan resep dokter: racik dan non-racik.
2. List CPO khusus episode IGD.
3. Riwayat Pengajuan dan status Farmasi.
4. Input pemberian obat oleh perawat.
5. Edit dan backdate jam pemberian.
6. Telaah Obat: Benar Pasien, Obat, Dosis, Cara, Waktu, dan Tidak ED.
7. Validasi alergi dan row identik.
8. Audit order, pemberian, lanjut/henti terapi, dan auto-order.
9. Auto-order lanjut berdasarkan waktu dan DPJP.
10. Mock integrasi alergi EMR dan status Farmasi.

### Out of Scope

1. Pasien Rawat Inap, IBS, dan VK.
2. Transfer terapi IGD ke Rawat Inap dan flag urgent lintas unit.
3. Stok, picking, dispensing, substitusi, billing, dan proses internal aplikasi Farmasi.
4. Penerimaan obat Rawat Inap.
5. Input Alkes & BHP sebagai proses terpisah [PERLU KONFIRMASI fase berikutnya].
6. DDI/interaksi obat dan rekomendasi dosis otomatis.
7. Order Obat Pulang [PERLU KONFIRMASI kebutuhan IGD].
8. Approval berjenjang pada Phase 1.

## 5. Related Features

| Kode/Sistem | Related Feature | Relasi Teknis/Bisnis |
|---|---|---|
| E12 | Order Catatan Pemberian Obat Utama | Parent feature lintas RI/IBS/IGD/VK; E12.1 dibatasi IGD |
| Pendaftaran IGD | Episode Pelayanan | Sumber pasien, registration, waktu episode, unit, DPJP, penjamin |
| EMR | Riwayat Alergi | Sumber allergy; Phase 1 menggunakan mock dengan kontrak setara target API |
| EMR | Riwayat Pemberian | Consumer riwayat setelah episode selesai [PERLU KONFIRMASI] |
| Master Farmasi | Obat dan Aturan | Sumber obat, sediaan, satuan, rute, aturan umum, kandungan |
| All Pelayanan Farmasi | Proses Resep | Menerima order dan mengirim status SENT/CONFIRMED/DISPENSED/NOT_DISPENSED |
| Master Staf | User/DPJP | Sumber dokter, perawat, profesi, unit, dan kewenangan |

## 6. Business Process & User Stories

### State Machine — Pengajuan/Farmasi

| Status | Deskripsi | Efek Stok | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|
| `DRAFT` | Belum dikirim | Tidak ada | SENT/CANCELLED | SUBMITTED_FOR_APPROVAL |
| `SENT` | Diterima gateway Farmasi | Tidak dikelola E12.1 | CONFIRMED/NOT_DISPENSED/FAILED | AMENDMENT_PENDING |
| `CONFIRMED` | Dikonfirmasi Farmasi | Diproses Farmasi, di luar E12.1 | DISPENSED/NOT_DISPENSED | ESCALATED |
| `DISPENSED` | Diserahkan Farmasi | Stok diproses Farmasi | Terminal | Terminal |
| `NOT_DISPENSED` | Tidak diserahkan | Sesuai proses Farmasi | Terminal | REASSESSMENT |
| `DOCTOR_CONFIRMATION_REQUIRED` | Butuh keputusan dokter | Tidak langsung | CONFIRMED/NOT_DISPENSED | ESCALATED |
| `FAILED` | Integrasi gagal | Tidak ada | Retry ke SENT | ESCALATED |
| `CANCELLED` | Draft dibatalkan | Tidak ada | Terminal | Terminal |

### State Machine — Pemberian Pasien

| Status | Deskripsi | Efek Stok | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|
| `NOT_YET_GIVEN` | Belum dieksekusi | Tidak dikelola E12.1 | GIVEN/NOT_GIVEN/POSTPONED | Sama |
| `GIVEN` | Diberikan kepada pasien | Tidak langsung | EDITED | CORRECTION_PENDING |
| `NOT_GIVEN` | Tidak diberikan | Tidak langsung | EDITED | REVIEW_PENDING |
| `POSTPONED` | Ditunda | Tidak langsung | GIVEN/NOT_GIVEN | ESCALATED |
| `EDITED` | Memiliki revision | Tidak langsung | EDITED | APPROVED_CORRECTION |
| `BACKDATED` | Dicatat setelah waktu aktual | Tidak langsung | EDITED | APPROVAL_PENDING |

### State Machine — Terapi

| Status | Deskripsi | Efek Stok | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|
| `ACTIVE` | Terapi berjalan | Tidak langsung | CONTINUE/STOPPED/COMPLETED | REVIEW_PENDING |
| `CONTINUE` | Dilanjutkan manual/otomatis | Order baru dapat memicu Farmasi | ACTIVE/STOPPED | APPROVAL_PENDING |
| `STOPPED` | Dihentikan | Tidak langsung | Terminal | REACTIVATION_PENDING |
| `COMPLETED` | Jadwal selesai | Tidak langsung | Terminal | Terminal |

### Actors and Access

| Role | Pengajuan | List | Riwayat | Pemberian | Auto-order Config |
|---|---|---|---|---|---|
| Dokter IGD | Create/edit draft/submit | Read | Read | Read | Tidak |
| Perawat IGD | Tidak | Read | Read | Create/edit/backdate | Tidak |
| Farmasi | Melalui service Farmasi | Read | Read/update status | Read | Tidak |
| Admin CPO | Tidak | Read | Read | Tidak | CRUD config |
| Auditor | Tidak | Read-only | Read-only | Read-only | Read-only |
| Scheduler | Auto-order lanjut | Generate slot | Write history | Tidak | Execute active config |

### User Stories Utama

| ID | User Story |
|---|---|
| US-001 | Sebagai dokter IGD, saya ingin mengajukan obat non-racik agar Farmasi menerima resep terstruktur. |
| US-002 | Sebagai dokter IGD, saya ingin mengajukan racikan multi-bahan agar komposisi terdokumentasi. |
| US-003 | Sebagai dokter, saya ingin melihat validasi alergi/duplikasi agar order lebih aman. |
| US-004 | Sebagai dokter, saya ingin mereview dan mengirim draft agar tidak terjadi salah order. |
| US-005 | Sebagai dokter/perawat, saya ingin melihat List CPO episode IGD agar terapi mudah dibaca. |
| US-006 | Sebagai dokter/perawat/farmasi, saya ingin melihat riwayat pengajuan dan statusnya. |
| US-007 | Sebagai perawat, saya ingin mencatat pemberian pada slot terpilih. |
| US-008 | Sebagai perawat, saya ingin melakukan Telaah Obat sebelum simpan. |
| US-009 | Sebagai perawat, saya ingin mengedit jam yang salah tanpa menghapus histori. |
| US-010 | Sebagai perawat, saya ingin mencatat backdate untuk dokumentasi yang terlambat. |
| US-011 | Sebagai auditor, saya ingin melihat semua event kritis dan hasilnya. |
| US-012 | Sebagai admin CPO, saya ingin mengatur auto-order berdasarkan waktu dan DPJP. |
| US-013 | Sebagai dokter IGD, saya ingin melihat obat rekonsiliasi pasien dan memilih obat yang digunakan agar terapi sebelumnya dapat dimasukkan secara terkontrol ke order resep. |

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

#### Fitur 1 — Pengajuan Resep Non-Racik

- **User Story:** US-001
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-001:** Given dokter berwenang membuka form, when memilih Non Racik, then field REF-01/REF-02 tampil dan lokasi fixed IGD.
  - **AC-002:** Jenis sediaan terisi dari master obat.
  - **AC-003:** Item tidak dapat ditambahkan jika nama, dosis, aturan pakai, atau field kondisional wajib kosong.
  - **AC-004:** Item valid tampil pada Daftar Konfirmasi dan dapat diedit/dihapus sebelum submit.
  - **AC-004A:** Mode Aturan Pakai terstruktur menampilkan tiga input berurutan: jumlah/dosis per pemberian, frekuensi, dan satuan pemberian; preview menghasilkan format `1 × 1 Tablet`.

#### Fitur 2 — Pengajuan Resep Racik

- **User Story:** US-002
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-005:** Nama racikan dan minimal satu bahan wajib.
  - **AC-006:** Setiap bahan memiliki obat, dosis/fraction, satuan, dan allergy check.
  - **AC-007:** Tambahkan ke Obat Racik hanya menambah bahan, belum mengirim order.
  - **AC-008:** Racikan valid tampil sebagai satu item dengan detail komposisi.

#### Fitur 3 — Alergi dan Anti-duplikasi

- **User Story:** US-003
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-009:** Match nama menghasilkan `MATCH_DRUG_NAME`.
  - **AC-010:** Match kandungan menghasilkan `MATCH_INGREDIENT` meskipun merek berbeda.
  - **AC-011:** Ingredient tidak tersedia menghasilkan `UNKNOWN_DATA`, bukan aman.
  - **AC-012:** Given row aktif dengan obat/komposisi, dosis, aturan pakai, dan rute identik, when item ditambah, then backend tidak membuat row kedua dan menampilkan row existing.
  - **AC-013:** Concurrent request tetap menghasilkan satu row aktif karena database constraint.

#### Fitur 4 — Review dan Submit Order

- **User Story:** US-004
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-014:** Order hanya aktif jika minimal satu item valid tersedia.
  - **AC-015:** Submit sukses menghasilkan satu Order ID, status SENT, timestamp, correlation ID, dan audit SUCCESS.
  - **AC-016:** Submit gagal tidak menampilkan sukses serta mencatat error dan audit FAILED.
  - **AC-017:** Retry dengan idempotency key sama tidak membuat order kedua.

#### Fitur 5 — List CPO

#### Fitur 4A - Workspace Order Resep Dokter dan Obat Rekonsiliasi

- **User Story:** US-001/US-002/US-013
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-017A:** Workspace order hanya tersedia untuk role Dokter IGD; role Perawat dan Farmasi tidak melihat tombol, flag, tab, atau aksi simpan Obat Rekonsiliasi.
  - **AC-017B:** Layar order memakai dua kolom: Riwayat Resep Sebelumnya di kiri dan form input di kanan, dengan Non Racik terpilih secara default.
  - **AC-017C:** Dokter dapat memilih item riwayat untuk mengisi form, tetapi wajib meninjau data sebelum menambahkannya ke daftar.
  - **AC-017D:** Daftar obat yang sudah ditambahkan tampil di bawah workspace dan mendukung edit/hapus sebelum Order Obat.
  - **AC-017E:** Mode Racik mengikuti `cpo-order-racik`; dropdown Aturan Umum dan Rute mengikuti master aktif dan referensi `cpo-order-aturan-umum` serta `cpo-order-rute`.
  - **AC-017F:** Jika data rekonsiliasi tersedia, sistem menampilkan flag high-visibility beserta jumlah item dan tab Obat Rekonsiliasi.
  - **AC-017G:** Tab menampilkan Nama Obat, Dosis, Satuan, ringkasan obat, checkbox `Gunakan`, dan tombol Simpan yang menambah pilihan ke draft tanpa submit ke Farmasi.

- **User Story:** US-005
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-018:** Header menampilkan RM, nama, tanggal lahir/umur, unit IGD, DPJP, penjamin, dan alergi.
  - **AC-019:** Row menampilkan lanjut/stop, obat/dosis, aturan, rute, sediaan, lokasi, dan slot.
  - **AC-020:** Data hanya berasal dari `registration_id` aktif.
  - **AC-021:** Login perawat menampilkan Input Pemberian, Edit Jam, dan Backdate sesuai kewenangan.
  - **AC-022:** Catatan revision/backdate memiliki indikator teks, bukan warna saja.
  - **AC-022A:** Header matriks memiliki dua tingkat: tanggal pada tingkat pertama dan satu atau beberapa jam pemberian pada tingkat kedua.
  - **AC-022B:** Satu tanggal dengan dua jadwal menghasilkan dua subkolom jam tanpa mengulang kolom identitas obat.

#### Fitur 6 — Riwayat Pengajuan

- **User Story:** US-006
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-023:** Filter rentang tanggal dan pencarian obat tersedia.
  - **AC-024:** Kolom sesuai REF-06/REF-07 tampil.
  - **AC-025:** `DISPENSED` dilabeli “Diberikan Farmasi”, bukan “Diberikan”.
  - **AC-026:** Alasan tampil untuk status yang membutuhkan alasan.

#### Fitur 7 — Input Pemberian dan Telaah Obat

- **User Story:** US-007/US-008
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-027:** Pilih Jam hanya menampilkan slot episode/tanggal aktif.
  - **AC-028:** Pemilihan slot menampilkan item yang terjadwal pada slot itu.
  - **AC-029:** GIVEN mewajibkan waktu aktual dan jumlah > 0.
  - **AC-030:** NOT_GIVEN/POSTPONED mewajibkan alasan.
  - **AC-031:** Enam Telaah Obat wajib dijawab sebelum simpan.
  - **AC-032:** Simpan sukses memperbarui List CPO dan audit dalam satu transaksi.

#### Fitur 8 — Edit Jam Pemberian

- **User Story:** US-009
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-033:** Form menampilkan obat, slot, waktu lama, waktu baru, version, dan alasan wajib.
  - **AC-034:** Simpan membuat revision baru dan mempertahankan nilai lama.
  - **AC-035:** List menampilkan indikator Diedit.
  - **AC-036:** Version basi menghasilkan HTTP 409 dan tidak menimpa perubahan terbaru.

#### Fitur 9 — Backdate

- **User Story:** US-010
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-037:** Form meminta waktu aktual dan alasan keterlambatan.
  - **AC-038:** Waktu aktual tidak boleh sebelum episode atau setelah waktu server.
  - **AC-039:** `administered_at` dan `recorded_at` tersimpan terpisah.
  - **AC-040:** List menampilkan indikator Backdate dan audit menyimpan kedua timestamp.

#### Fitur 10 — Audit Aksi Kritis

- **User Story:** US-011
- **Prioritas:** P0
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-041:** Order sukses/gagal memiliki event, result, actor, timestamp, dan correlation ID.
  - **AC-042:** Edit/backdate memiliki before/after dan alasan.
  - **AC-043:** Lanjut/henti terapi memiliki status lama/baru, actor/source, alasan, dan timestamp.
  - **AC-044:** Audit append-only dan tidak dapat dihapus dari UI operasional.

#### Fitur 11 — Auto-order Obat Lanjut

- **User Story:** US-012
- **Prioritas:** P1
- **Fase:** Phase 1
- **Acceptance Criteria:**
  - **AC-045:** Konfigurasi memuat IGD, timezone, waktu, periode efektif, status, dan DPJP.
  - **AC-046:** Scheduler hanya memproses episode aktif dari DPJP eligible dan terapi eligible.
  - **AC-047:** Run/episode/terapi/periode sama tidak membuat order kedua.
  - **AC-048:** Monitoring menampilkan sukses, gagal, dilewati, dan alasan per item.
  - **AC-049:** Perubahan konfigurasi membuat version baru tanpa mengubah histori run.

### 7.2 Validasi — Wording Frontend

| Field/Kondisi | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Nama Obat | Lookup | Required, master aktif | “Nama obat wajib dipilih.” | “Cari obat dari formularium aktif.” |
| Dosis | Decimal + unit | Required, > 0 | “Dosis harus lebih besar dari 0.” | “Masukkan dosis dan satuannya.” |
| Nama Racikan | Text | Required, max 150 | “Nama racikan wajib diisi.” | “Gunakan nama yang mudah dikenali.” |
| Bahan Racik | Array | Minimal 1 | “Tambahkan minimal satu bahan racik.” | “Setiap bahan wajib memiliki dosis.” |
| Rute | Lookup | Kondisional | “Rute pemberian wajib dipilih.” | “Pilih rute sesuai instruksi klinis.” |
| Row Duplikat | System | Fingerprint aktif identik | “Obat dengan dosis, aturan pakai, dan rute yang sama sudah ada pada episode ini.” | “Gunakan row existing atau Order Lanjut.” |
| Allergy Match | System | Nama/kandungan cocok | “Alergi obat terdeteksi.” | “Periksa allergen dan kandungan sebelum melanjutkan.” |
| Jam Pemberian | Datetime | Required untuk GIVEN | “Waktu pemberian wajib diisi.” | “Gunakan waktu aktual pemberian.” |
| Jumlah | Decimal | > 0 untuk GIVEN | “Jumlah pemberian harus lebih besar dari 0.” | “Masukkan jumlah dan satuan.” |
| Alasan Tidak Diberi | Text/lookup | Required NOT_GIVEN | “Alasan tidak diberikan wajib diisi.” | “Pilih atau tuliskan alasan.” |
| Alasan Ditunda | Text/lookup | Required POSTPONED | “Alasan penundaan wajib diisi.” | “Cantumkan rencana tindak lanjut.” |
| Alasan Koreksi | Textarea | Required edit | “Alasan koreksi wajib diisi.” | “Nilai lama tetap disimpan.” |
| Alasan Backdate | Textarea | Required backdate | “Alasan backdate wajib diisi.” | “Waktu pencatatan sistem tidak dapat diubah.” |
| Waktu Masa Depan | Datetime | <= server time | “Waktu pemberian tidak boleh melebihi waktu saat ini.” | — |
| Waktu Sebelum Episode | Datetime | >= episode start | “Waktu pemberian tidak boleh sebelum episode IGD dimulai.” | — |
| Version Conflict | System | Version harus terbaru | “Data telah diperbarui pengguna lain.” | “Muat data terbaru sebelum mencoba kembali.” |
| DPJP Auto-order | Multi-select | Minimal 1 | “Pilih minimal satu DPJP.” | “Hanya episode dari DPJP ini yang diproses.” |

## 8. Data & Technical Specifications

### 8.1 Data & Business Rules

#### 8.1.1 Spesifikasi Data — Form Input/Create/Edit

##### A. Header Pasien dan Episode

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `patient_id` | ID Pasien | identifier | Ya | Valid | Master Pasien | Hidden |
| `registration_id` | ID Registrasi | identifier | Ya | Episode IGD | Pendaftaran | Partition key |
| `medical_record_number` | No. RM | text | Ya | Format RS | Master Pasien | Read-only |
| `patient_name` | Nama | text | Ya | — | Master Pasien | Read-only |
| `date_of_birth` | Tanggal Lahir | date | Ya | — | Master Pasien | Read-only |
| `unit_code` | Unit | enum | Ya | Fixed IGD | Episode | Read-only |
| `attending_doctor_id` | DPJP | lookup | Ya | Dokter aktif | Pendaftaran | — |
| `payer_name` | Penjamin | text | Tidak | — | Pendaftaran | — |
| `allergy_summary` | Alergi | list | Tidak | Source/freshness | EMR/mock | High visibility |

##### B. Form Non-Racik

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `creation_type` | Jenis Pembuatan | radio | Ya | NON_COMPOUND | User | — |
| `medication_id` | Nama Obat | lookup | Ya | Master aktif | Master Farmasi | Allergy check |
| `dosage_form` | Jenis Sediaan | text/lookup | Ya | Sesuai obat | Master Farmasi | Autofill |
| `dose_value` | Dosis | decimal | Ya | > 0 | Dokter | — |
| `dose_unit` | Satuan Dosis | lookup | Ya | Compatible | Master Satuan | — |
| `is_extra_medication` | Obat Extra | boolean | Ya | Ya/Tidak | Dokter | Detail jika Ya [PK] |
| `is_sliding_scale` | Sliding Scale | boolean | Ya | Ya/Tidak | Dokter | Detail jika Ya [PK] |
| `dose_per_administration` | Jumlah/Dosis per Pemberian | decimal | Ya untuk mode terstruktur | > 0 | Dokter | Input pertama; contoh `1` |
| `frequency_value` | Frekuensi | number/lookup | Ya untuk mode terstruktur | > 0/master aktif | Dokter/Master | Input kedua; ditampilkan setelah simbol `×` |
| `administration_unit` | Unit Pemberian | lookup | Ya untuk mode terstruktur | Active/compatible | Master | Input ketiga; Tablet/TPM/Tetes/dll |
| `instruction_free_text` | Aturan Pakai Bebas | text | Kondisional | Max 255 | Dokter | Untuk mode alternatif teks bebas |
| `route_code` | Rute | lookup | Kondisional | Master aktif | Master Rute | REF-04 |
| `general_instruction_id` | Aturan Umum | lookup | Tidak | Master aktif | Master Aturan | REF-05 |
| `special_instruction` | Instruksi Khusus | textarea | Tidak | Max 500 | Dokter | — |
| `care_location` | Diberikan di | enum | Ya | IGD | Sistem | Fixed |

##### C. Form Racik

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `compound_name` | Nama Racikan | text | Ya | Max 150 | Dokter | — |
| `ingredients[]` | Bahan Racik | array | Ya | Min 1 | Dokter | Multi-row |
| `ingredient_medication_id` | Nama Bahan | lookup | Ya/item | Master aktif | Master Farmasi | Allergy check |
| `ingredient_dose_value` | Dosis Bahan | decimal/fraction | Ya/item | > 0/fraction valid | Dokter | — |
| `ingredient_dose_unit` | Satuan Bahan | lookup | Ya/item | Compatible | Master | — |
| `quantity` | Jumlah | decimal | Ya | > 0 | Dokter | — |
| `quantity_unit` | Satuan Jumlah | lookup | Ya | Active | Master | Ampul/bungkus |
| `frequency_value` | Aturan Pakai | structured | Ya | Valid | Dokter | — |
| `route_code` | Rute | lookup | Ya | Active | Master Rute | — |
| `general_instruction_id` | Aturan Umum | lookup | Tidak | Active | Master Aturan | — |
| `other_instruction` | Aturan Lainnya | textarea | Tidak | Max 500 | Dokter | — |

##### C1. Obat Rekonsiliasi untuk Order Dokter

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `reconciliation_id` | ID Rekonsiliasi | identifier | Ya | Milik pasien/episode | Rekonsiliasi Obat/EMR | Hidden |
| `medication_name` | Nama Obat | text/lookup | Ya | Tidak kosong | Rekonsiliasi Obat/Master Farmasi | Read-only pada tab |
| `dose_value` | Dosis | decimal/text | Ya | Nilai valid | Rekonsiliasi Obat | Contoh `300` |
| `dose_unit` | Satuan | text/lookup | Ya | Satuan valid | Rekonsiliasi Obat/Master Satuan | Contoh `mg Kapsul` |
| `medication_summary` | Informasi Obat | computed text | Ya | Nama+dosis+satuan | Sistem | Contoh `Paracetamol 300 mg Kapsul` |
| `use_in_order` | Gunakan | boolean | Ya | true/false | Dokter | Default false |
| `selected_by` | Dipilih Oleh | identifier | Ya saat simpan | Role Dokter aktif | Session/Master Staf | Audit |
| `selected_at` | Waktu Dipilih | datetime | Ya saat simpan | Server time | Sistem | Audit |

##### D. Form Pemberian dan Telaah

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `schedule_slot_id` | Pilih Jam | lookup | Ya | Milik episode/tanggal | Schedule | REF-10 |
| `administration_time` | Waktu Aktual | datetime | Ya | Batas episode/server | Perawat | — |
| `administration_status` | Status Pemberian | enum | Ya | 4 status | Perawat | — |
| `administered_quantity` | Jumlah | decimal | Kondisional | > 0 jika GIVEN | Perawat | — |
| `administered_unit` | Satuan | lookup | Kondisional | Compatible | Master | — |
| `not_given_reason` | Alasan | text/lookup | Kondisional | NOT_GIVEN/POSTPONED | Perawat | — |
| `is_completed` | Selesai | boolean | Tidak | — | Perawat | — |
| `right_patient` | Benar Pasien | boolean | Ya | Ya/Tidak | Perawat | Telaah |
| `right_medication` | Benar Obat | boolean | Ya | Ya/Tidak | Perawat | Telaah |
| `right_dose` | Benar Dosis | boolean | Ya | Ya/Tidak | Perawat | Telaah |
| `right_route` | Benar Cara | boolean | Ya | Ya/Tidak | Perawat | Telaah |
| `right_time` | Benar Waktu | boolean | Ya | Ya/Tidak | Perawat | Telaah |
| `not_expired` | Tidak ED | boolean | Ya | Ya/Tidak | Perawat | Telaah |

##### E. Edit/Backdate

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `administration_id` | ID Pemberian | UUID | Ya | Valid | Sistem | Read-only |
| `previous_administered_at` | Waktu Lama | datetime | Edit | Read-only | Administration | — |
| `administered_at` | Waktu Baru/Aktual | datetime | Ya | Episode <= time <= server | Perawat | — |
| `recorded_at` | Waktu Pencatatan | datetime | Ya | Server | Sistem | Tidak dapat diedit |
| `change_type` | Jenis Perubahan | enum | Ya | EDIT_TIME/BACKDATE | Sistem/User | — |
| `change_reason` | Alasan | textarea | Ya | Non-blank | Perawat | Audit |
| `version` | Version | integer | Edit | Harus terbaru | Sistem | Optimistic lock |

##### F. Konfigurasi Auto-order

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `unit_code` | Unit | enum | Ya | IGD | Sistem | Fixed |
| `timezone` | Zona Waktu | string | Ya | Asia/Jakarta | Default | — |
| `execution_time` | Waktu Eksekusi | time/schedule | Ya | Valid | Admin | — |
| `effective_from` | Efektif Mulai | date | Ya | — | Admin | — |
| `effective_to` | Efektif Sampai | date | Tidak | >= start | Admin | — |
| `eligible_doctor_ids[]` | DPJP | array UUID | Ya | Min 1 dokter aktif | Master Staf | — |
| `is_active` | Status | boolean | Ya | Default false pada create | Sistem/Admin | Status tidak diinput bebas |
| `version` | Version | integer | Ya | Increment | Sistem | — |

#### 8.1.2 Spesifikasi Data — Tampilan Daftar/List View

##### A. List CPO

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|---|---|---|---|---|
| Lanjut Obat | Therapy status | Badge text | Filter | LANJUT/STOP |
| Nama Obat/Dosis | Order snapshot | Text | Search | Sticky column pada tablet |
| Aturan Pakai | Order item | Text | — | — |
| Rute | Master snapshot | Label | Filter | — |
| Sediaan | Master snapshot | Label | Filter | — |
| Diberikan di | Order | IGD | Fixed | — |
| Tanggal Pemberian | Schedule | Grouped header | Date | Header tingkat pertama; `colspan` sesuai jumlah jam |
| Jam Pemberian | Schedule | Subcolumn `HH:mm` | Time | Header tingkat kedua; beberapa jam per tanggal |
| Status/Marker | Administration | Icon + text + time | Filter | Diedit/Backdate terlihat |
| Nama Petugas | Master Staf | Text | — | Per slot |

##### B. Riwayat Pengajuan

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|---|---|---|---|---|
| Tgl Order | Order | Date time | Range/sort desc | — |
| Nama Obat | Snapshot | Text | Search | — |
| Dosis | Snapshot | Value + unit | — | — |
| Jumlah | Farmasi/Admin | Number | — | Label konteks wajib |
| Aturan Pakai | Snapshot | Text | — | — |
| Diberikan di | Order | IGD | Filter | — |
| Nama Dokter | Master Staf | Text | Filter | — |
| Farmasi | Pharmacy source | Badge text | Filter | — |
| Status | Status history | Badge text | Filter | Diberikan Farmasi |
| Alasan | Status history | Text | — | Tampil kondisional |

##### C. Monitoring Auto-order

| Kolom | Sumber Data | Format | Filter/Sort | Catatan |
|---|---|---|---|---|
| Run ID | Run | Text | Search | — |
| Waktu | Run | Start/end | Date/sort desc | — |
| Config Version | Run snapshot | `vN` | Filter | — |
| Sukses/Gagal/Dilewati | Counts | Number | — | — |
| Status | Computed | SUCCESS/PARTIAL/FAILED | Filter | — |
| Detail Item | Run items | Drawer/table | Result | Episode, DPJP, therapy, reason |

### 8.2 Business Rules

| ID | Business Rule |
|---|---|
| BR-001 | Semua data terikat pada `registration_id` episode IGD. |
| BR-002 | Hanya dokter berwenang dapat membuat/edit/submit resep. |
| BR-002A | Flag, tab, checklist `Gunakan`, dan tombol Simpan Obat Rekonsiliasi hanya dirender dan diotorisasi backend untuk role Dokter IGD. |
| BR-002B | Memilih riwayat resep atau Obat Rekonsiliasi hanya membuat/menambah item DRAFT dan tidak melakukan submit otomatis ke Farmasi. |
| BR-002C | Sistem menolak `reconciliation_id` lintas pasien/episode dan mencatat audit REJECTED. |
| BR-003 | Draft hanya dapat diedit sebelum SENT. |
| BR-004 | Lokasi selalu IGD; Rawat Inap tidak ditampilkan/disabled. |
| BR-005 | Obat, sediaan, rute, aturan, dan satuan berasal dari master aktif. |
| BR-006 | Racik minimal satu bahan; setiap bahan memiliki dosis/satuan. |
| BR-006A | Aturan Pakai mode terstruktur terdiri dari tepat tiga input: `dose_per_administration × frequency_value administration_unit`; ketiganya wajib dan disimpan sebagai field terpisah, bukan satu string. |
| BR-007 | Allergy check dijalankan saat item berubah dan sebelum submit. |
| BR-008 | Fingerprint non-racik: `registration_id + medication_id + normalized_dose + normalized_instruction + route_code`. |
| BR-009 | Fingerprint racik: episode + normalized composition + dose/instruction + route; urutan bahan tidak mengubah fingerprint. |
| BR-010 | Unique partial constraint mencegah row aktif identik pada race condition. |
| BR-011 | Submit memakai idempotency key. |
| BR-012 | Aksi perawat hanya tersedia untuk role/unit/episode berwenang. |
| BR-012A | List CPO mengelompokkan slot berdasarkan tanggal lokal Asia/Jakarta. Setiap tanggal menjadi parent header dan setiap `scheduled_at` menjadi subkolom jam `HH:mm` yang diurutkan menaik. |
| BR-013 | GIVEN wajib waktu aktual dan jumlah > 0. |
| BR-014 | NOT_GIVEN/POSTPONED wajib alasan. |
| BR-015 | Enam Telaah Obat wajib sebelum simpan. |
| BR-016 | Edit membuat revision dan alasan; nilai lama tidak dihapus. |
| BR-017 | Backdate menyimpan administered_at dan recorded_at terpisah. |
| BR-018 | Waktu aktual berada di antara episode start dan server time. |
| BR-019 | Version basi menghasilkan 409. |
| BR-020 | Audit kritis bersifat append-only. |
| BR-021 | Auto-order hanya untuk config aktif, waktu efektif, episode aktif, DPJP/terapi eligible. |
| BR-022 | Auto-order idempotent per run/episode/therapy/period. |
| BR-023 | Kegagalan satu item auto-order tidak membatalkan item lain. |
| BR-024 | Status Farmasi “DISPENSED” dilabeli Diberikan Farmasi. |

### 8.3 Database Schema Recommendation

| Table Name | Key Columns | Purpose |
|---|---|---|
| `igd_cpo_orders` | `id`, `registration_id`, `prescriber_id`, `status`, `idempotency_key`, timestamps | Header order |
| `igd_cpo_order_items` | `id`, `order_id`, `item_type`, medication, dose, instruction, route, `fingerprint` | Item order |
| `igd_cpo_compounds` | `id`, `order_item_id`, `compound_name`, quantity | Header racik |
| `igd_cpo_compound_ingredients` | `id`, `compound_id`, medication, dose/unit | Bahan racik |
| `igd_cpo_order_status_history` | `id`, order/item, from/to, reason, source, timestamp | Timeline Farmasi |
| `igd_cpo_therapy_rows` | `id`, `registration_id`, `fingerprint`, therapy status, version | Row unik CPO |
| `igd_cpo_schedule_slots` | `id`, registration, therapy, `scheduled_at`, status, version | Slot |
| `igd_cpo_administrations` | `id`, slot, status, actual/recorded time, quantity, nurse, reason, version | Pemberian aktif |
| `igd_cpo_administration_revisions` | `id`, administration, revision, before/after, type/reason, actor/time | Histori perubahan |
| `igd_cpo_medication_reviews` | `id`, administration, six-right booleans, reviewer/time | Telaah |
| `igd_cpo_allergy_checks` | `id`, draft/item, result, match, source | Allergy evidence |
| `igd_cpo_auto_order_configs` | `id`, unit, timezone/schedule, effective dates, active, version, `status_approval`, `role_approver` | Config siap Phase 2 |
| `igd_cpo_auto_order_config_doctors` | `config_id`, `doctor_id` | DPJP eligible |
| `igd_cpo_auto_order_runs` | `id`, config/version, start/end, counts | Run header |
| `igd_cpo_auto_order_run_items` | `id`, run, registration, therapy, result/reason/order | Run detail |
| `igd_cpo_audit_events` | `id`, registration, entity/action/result, actor, before/after, correlation, time | Audit append-only |

Constraints/indexes minimum:

1. `unit_code = 'IGD'`.
2. Unique `idempotency_key` order.
3. Unique partial `(registration_id, fingerprint)` untuk therapy row aktif.
4. Unique `(therapy_row_id, scheduled_at)` untuk slot.
5. Unique `(run_id, registration_id, therapy_row_id, continuation_period)`.
6. Index List CPO `(registration_id, scheduled_at)`.
7. Index history `(registration_id, ordered_at DESC)`.
8. Index audit `(registration_id, occurred_at DESC)` dan `correlation_id`.

### 8.4 API Endpoint Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/igd/registrations/{registrationId}/cpo` | Header dan List CPO |
| POST | `/api/v1/igd/registrations/{registrationId}/cpo/drafts` | Create draft |
| POST | `/api/v1/igd/cpo/drafts/{draftId}/items` | Add non-racik/racik |
| PATCH | `/api/v1/igd/cpo/drafts/{draftId}/items/{itemId}` | Edit item |
| DELETE | `/api/v1/igd/cpo/drafts/{draftId}/items/{itemId}` | Delete item |
| POST | `/api/v1/igd/cpo/drafts/{draftId}/allergy-check` | Allergy check |
| POST | `/api/v1/igd/cpo/drafts/{draftId}/submit` | Submit idempotent |
| GET | `/api/v1/igd/registrations/{registrationId}/cpo/order-history` | Riwayat |
| POST | `/api/v1/integrations/pharmacy/igd-cpo/{orderId}/status` | Callback Farmasi |
| GET | `/api/v1/igd/registrations/{registrationId}/cpo/schedule-slots?date=` | Pilih Jam |
| POST | `/api/v1/igd/cpo/schedule-slots/{slotId}/administrations` | Input pemberian/telaah |
| PATCH | `/api/v1/igd/cpo/administrations/{administrationId}` | Edit dengan version/reason |
| POST | `/api/v1/igd/cpo/schedule-slots/{slotId}/administrations/backdate` | Backdate |
| GET | `/api/v1/igd/cpo/administrations/{administrationId}/revisions` | Revisions |
| GET/POST | `/api/v1/igd/cpo/auto-order-configs` | List/create config |
| PATCH | `/api/v1/igd/cpo/auto-order-configs/{configId}` | Create config version/toggle |
| GET | `/api/v1/igd/cpo/auto-order-runs` | Monitoring run |
| GET | `/api/v1/igd/cpo/audit-events` | Audit authorized |

Mutation menggunakan `X-Correlation-ID`; submit order wajib `Idempotency-Key`. Gunakan HTTP 409 untuk version conflict, 422 untuk validation, 401/403 untuk autentikasi/otorisasi.

### 8.5 Integrations

| System | Direction | Contract Minimum |
|---|---|---|
| Pendaftaran IGD | Inbound | patient, registration, episode time/status, unit, DPJP, payer |
| Master Farmasi | Inbound | medication, dosage form, unit, route, general instruction, ingredient |
| EMR Allergy | Inbound | allergy ID, allergen, type, reaction, severity, source/freshness |
| All Pelayanan Farmasi | Both | order snapshot; status event with ID, time, source, reason |
| Master Staf | Inbound | user, profession, unit, active status, DPJP eligibility |
| EMR Medication History | Outbound | final administration plus revision/version [PERLU KONFIRMASI] |

### 8.6 Non-Functional Requirements

1. p95 List CPO, submit/update order, serta input/edit/backdate < 1 detik pada environment acceptance.
2. Dataset sampai 60 item dan volume 100–150 pasien IGD/hari.
3. Responsive PC/tablet landscape; sticky medication column dan horizontal slot scroll.
4. Dua versi mayor terbaru Chrome, Edge, Firefox, Safari saat release.
5. Status menggunakan teks/icon, tidak hanya warna.
6. TLS in transit, encryption at rest sesuai infrastruktur, dan PHI minimal pada log teknis.
7. Mutation transaksional dan idempotent.
8. Scheduler menggunakan distributed lock.
9. Metrics: latency p50/p95/p99, error, duplicate block, allergy match, conflict, auto-order success/failure/skip.

### 8.7 Audit Events

| Event | Results | Minimum Payload |
|---|---|---|
| `CPO_DRAFT_CHANGED` | SUCCESS/FAILED | before/after, actor, item, episode |
| `CPO_ALLERGY_CHECKED` | MATCH/NO_MATCH/UNKNOWN | match type, allergen/ingredient, source |
| `CPO_ORDER_SUBMITTED` | SUCCESS/FAILED | order, actor, error, correlation |
| `CPO_ORDER_STATUS_CHANGED` | SUCCESS/REJECTED | from/to, source, reason |
| `CPO_ADMINISTRATION_RECORDED` | SUCCESS/FAILED | nurse, slot/item, status, actual time, quantity |
| `CPO_MEDICATION_REVIEW_RECORDED` | SUCCESS/FAILED | six-right results, nurse |
| `CPO_ADMINISTRATION_CHANGED` | SUCCESS/CONFLICT/FAILED | before/after, reason, version |
| `CPO_ADMINISTRATION_BACKDATED` | SUCCESS/FAILED | actual/recorded time, reason, nurse |
| `CPO_THERAPY_CONTINUED` | SUCCESS/FAILED | old/new status, therapy, actor/source, reason |
| `CPO_THERAPY_STOPPED` | SUCCESS/FAILED | old/new status, therapy, actor/source, reason |
| `CPO_AUTO_ORDER_CONFIG_CHANGED` | SUCCESS/FAILED | before/after, admin, version |
| `CPO_AUTO_ORDER_RUN` | SUCCESS/PARTIAL/FAILED | run/config version, counts, item results |

### 8.8 Open Decisions

1. Apakah Alkes masuk E12.1 Phase 1?
2. Apakah Order Obat Pulang dibutuhkan di IGD?
3. Detail field Obat Extra dan Sliding Scale?
4. Kebijakan jika Telaah Obat bernilai Tidak?
5. Batas maksimal edit/backdate setelah episode tutup?
6. Apakah jam aktual boleh berbeda dari slot?
7. Status Farmasi per header, item, atau keduanya?
8. Definisi kolom “Diberikan” pada riwayat: dispensed atau administered?
9. Retensi audit/rekam medis?
10. Jam awal, continuation period, eligibility terapi, dan DPJP awal auto-order?

## 9. Workflow / BPMN Interpretation

Tidak ada BPMN khusus E12.1 yang diberikan. Workflow berikut merupakan interpretasi dari referensi visual dan behavior Product Owner; perlu dibuat BPMN formal pada tahap refinement.

### 9.1 Pengajuan Non-Racik

`Start → Dokter buka episode IGD → Buka CPO → Tambah Obat → Non Racik → Isi obat/dosis → Isi tiga input Aturan Pakai (jumlah × frekuensi + satuan) → Pilih rute → Validasi alergi dan duplikasi → Tambah ke daftar → Review → Submit → Generate Order ID → Kirim Farmasi → SENT → Audit → End`

Cabang:

- Field tidak lengkap → kembali ke form.
- Allergy match → warning/kebijakan klinis [PERLU KONFIRMASI hard-block/override].
- Fingerprint identik → blok row baru dan buka row existing.
- Integrasi gagal → status FAILED, audit, retry idempotent.

### 9.2 Pengajuan Racik

`Start → Pilih Racik → Isi nama racikan → Tambah bahan satu per satu → Allergy check per bahan → Isi jumlah/aturan/rute → Tambah ke daftar → Review → Submit → Farmasi`

### 9.3 List dan Riwayat

`Buka episode → Validate role/registration → Load patient/allergy → Load therapy rows/slots → Group slots by tanggal lokal → Urutkan subkolom jam → Display List CPO bertingkat tanggal/jam → User memilih Riwayat → Filter tanggal/cari obat → Display status timeline`

### 9.4 Pemberian Obat

`Perawat buka List → Input Pemberian → Pilih Jam → Load item slot → Pilih status → Isi jumlah/alasan → Isi enam Telaah → Validasi → Simpan transaction → Update List → Audit`

### 9.5 Edit Jam

`Pilih catatan tersimpan → Edit Jam → Load waktu/version → Isi waktu baru + alasan → Validate boundary/version → Create revision → Update active record → Indicator Diedit → Audit`

### 9.6 Backdate

`Pilih slot terlewat → Backdate → Isi waktu aktual + alasan → Validate episode/server time → Save administered_at + server recorded_at → Indicator Backdate → Audit`

### 9.7 Auto-order Lanjut

`Scheduler trigger → Acquire lock → Load active config/version → Select active IGD episodes with eligible DPJP → Select eligible therapies → Check idempotency/fingerprint → Create continuation order → Send Farmasi → Record item result → Complete run counts → Audit`

### 9.8 Definition of Done

1. Semua AC P0 lulus UAT dokter/perawat IGD.
2. State Farmasi lulus integration test.
3. Allergy match nama/kandungan lulus dengan mock.
4. Anti-duplikasi lulus concurrent test.
5. RBAC lulus negative test.
6. Performance lulus untuk 60 item.
7. UI lulus PC/tablet/browser target.
8. Audit sukses/gagal dapat ditelusuri dengan correlation ID.
9. Edit/backdate lulus revision, conflict, dan boundary test.
10. Auto-order hanya memproses DPJP eligible dan tidak membuat order ganda.
