# PRD — Dashboard Pelayanan Rehabilitasi Medik (Rehab Medik)

| Field | Isi |
|---|---|
| Dokumen ID | PRD-P-DSH-RM-v1.3 |
| Modul | Pelayanan › Dashboard Rehabilitasi Medik |
| Versi Dokumen | 1.3 (Draft — Untuk Direview) |
| Tanggal Disusun | 7 Juli 2026 |
| Penyusun | Team Product — Tamtech International |
| Approver | M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) |
| Reviewer Teknis | Tim Pradev |
| Referensi Struktur | PRD-P-DSH-RJ (Dashboard Pelayanan RJ), PRD-P-DSH-HD (Dashboard Hemodialisa) |
| Referensi V1 | Screenshot Dashboard Rehab Medik — RS PKU Muhammadiyah Wonosobo |
| Status | Untuk Direview |

> **Perubahan v1.2 → v1.3.**
> 1. **Badge Konsul/Rujuk dihapus.** Konsul/rujuk internal bukan badge tersendiri — ia menjadi salah satu **nilai disposisi pada Kolom Status Tindak Lanjut** (status keluar pasien).
> 2. **Disposisi & Modal Status Keluar → PRD Discharge.** Dashboard hanya menyediakan **Kolom Status Tindak Lanjut** (menampilkan hasil disposisi); daftar opsi & perilaku tiap disposisi **didefinisikan di PRD Discharge** (PRD terpisah), bukan di dashboard ini. Dashboard hanya *commit* alur normal **"pulangkan"** dari auto-penyelesaian.
>
> Tetap berlaku dari v1.2: **MVP RJ-only** (RI = kesiapan arsitektur, §10), **Surat Kontrol bi-state**, **Asesmen 1 checkpoint**, **Radiologi dipertahankan**.

---

## 1. Ringkasan & Latar Belakang

Dashboard Pelayanan Rehabilitasi Medik adalah *landing screen* operasional bagi perawat dan dokter (Sp.KFR) unit Rehab Medik untuk memantau dan mengeksekusi pelayanan pasien rehabilitasi medis rawat jalan per hari — mulai dari asesmen, tindakan & BHP, order penunjang, hingga penyelesaian/pemulangan pasien. Pada V1 (referensi screenshot), dashboard sudah menyediakan daftar antrian, kolom checkpoint status, badge SEP, counter, dan pagination, namun memiliki keterbatasan struktural yang mengganggu kualitas data downstream (casemix & reporting kunjungan) dan menurunkan produktivitas user.

**Limitasi V1 yang menjadi pendorong V2:**

- **Auto-pemulangan tanpa prasyarat** — pasien yang **tidak dilayani** ikut ter-auto-pulang sehingga mencemari data casemix & reporting kunjungan (*false data*).
- Tidak ada **filter sesi/jam praktik** untuk dokter yang praktik lebih dari satu sesi pada hari yang sama.
- **Tindak lanjut/disposisi pasien tidak terstruktur** — kolom "Rujuk Internal" V1 tidak merepresentasikan seluruh kemungkinan status keluar pasien (pulang, rujuk, meninggal, pulang paksa, dll).
- Performa terasa lambat saat *search*/filter pada hari kunjungan tinggi.
- Row antar pasien kurang terdiferensiasi secara visual sehingga berisiko salah baca.

**Dampak utama yang disasar V2:** data casemix & kunjungan bersih (hanya pasien yang benar-benar dilayani yang ter-*discharge*), disposisi keluar terstruktur, visibilitas status real-time, dan performa < 1 detik.

> **Catatan scope.** Feature brief menyinggung pembedaan pelayanan RJ vs RI. Karena kebutuhan RI belum ada, seluruh perlakuan RI **tidak masuk MVP** dan didokumentasikan sebagai kesiapan arsitektur (§10).

---

## 2. Tujuan & Metrik Sukses

**Tujuan produk:** menyediakan dashboard pelayanan rehabilitasi medik rawat jalan yang akurat, real-time, dan responsif — dengan status tindak lanjut terstruktur — sehingga perawat dan dokter dapat memantau status pelayanan dan mengeksekusi aksi tanpa friksi, serta menjamin data downstream (casemix, reporting kunjungan, klaim) bersih.

| Aspek | Target |
|---|---|
| Initial load dashboard (semua data pasien di unit) | < 1 detik p95 @ 30 user konkuren |
| Response filter & search | < 1 detik p95 |
| Akurasi auto-penyelesaian (zero false-positive: pasien tidak dilayani ikut ter-pulang) | 0 case dalam 30 hari pasca go-live |
| Real-time status checkpoint (delta event source → dashboard) | < 3 detik |
| User satisfaction (perawat/dokter, post-pilot survey) | ≥ 4.0 / 5.0 |

---

## 3. Scope

### 3.1 In-Scope (V1.0 — Rawat Jalan)

1. Daftar antrian pasien Rehab Medik **rawat jalan** per tanggal layanan (default hari ini).
2. **7 checkpoint** status per pasien: As. Rehab Medik, Tindakan & BHP, Lab, Radiologi, E-Resep, Surat Kontrol, Bayar (§8).
3. **Kolom Status Tindak Lanjut** — menampilkan disposisi/status keluar pasien; alur normal di-set oleh auto-penyelesaian, penetapan disposisi lain mengikuti **PRD Discharge** (§9).
4. Filter: tanggal layanan, nama dokter, sesi/jam praktik.
5. Mode tampilan: pagination default + opsi "Tampilkan Semua".
6. Pencarian pasien berdasarkan No. RM atau Nama.
7. Counter status pelayanan tiga-state (Belum Dilayani / Sedang Dilayani / Selesai Dilayani) + total pasien.
8. Penanda **SEP** untuk pasien BPJS.
9. Penanda **pasien prioritas** (`data_sosial.kartu_prioritas == "Ya"`).
10. **Auto-penyelesaian bersyarat** (As. Rehab Medik + Tindakan & BHP terisi) → **Pulang** (Status Tindak Lanjut = "pulangkan").
11. Real-time sync status via *event-driven update*.
12. Diferensiasi row visual yang jelas antar pasien.

### 3.2 Out-of-Scope (mengacu ke PRD lain / future)

- **Daftar opsi & perilaku disposisi keluar + Modal Status Keluar** → **PRD Discharge** (PRD terpisah). Dashboard hanya menampilkan hasilnya pada Kolom Status Tindak Lanjut.
- **Kohort & tab Rawat Inap (RI)**, kolom **Asal Unit**, disposisi RI, pemisahan antrian RJ/RI → **belum ada kebutuhan**; disiapkan sebagai kesiapan arsitektur (§10), bukan fitur MVP.
- Detail form & flow **Asesmen Dokter Rehab Medik** → PRD terpisah. Dashboard hanya **menampilkan** status.
- Detail **Tindakan & BHP, E-Resep (CPO/obat pulang), Lab, Radiologi, Surat Kontrol** → masing-masing PRD terpisah.
- Pembedaan sub-layanan Rehab Medik (Fisioterapi / Terapi Wicara / Terapi Okupasi) sebagai kolom/klinik terpisah → **[PERLU KONFIRMASI]** apakah masuk V1.0 (OQ-02).

---

## 4. Stakeholder & Persona

**Primary Users**
- **Perawat Rehab Medik** — monitor antrian, intake awal, pendampingan tindakan.
- **Dokter Sp.KFR** — eksekutor asesmen, order penunjang, tindakan, e-resep, surat kontrol, finalisasi pelayanan.

**Secondary Users**
- **Admin/Loket Rehab Medik** — mengecek status, mendampingi pasien.
- **Kasir/Billing** — bergantung pada akurasi status *Bayar* & status keluar.
- **Casemix & Reporting** — konsumen data hilir dari akurasi auto-penyelesaian & Status Tindak Lanjut.

---

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | Menampilkan daftar antrian pasien Rehab Medik rawat jalan pada tanggal layanan aktif (default = hari ini). |
| FR-02 | Nomor antrian/urutan pasien ditampilkan per tanggal & sesi. |
| FR-03 | Menampilkan **counter tiga-state** (Total + Belum/Sedang/Selesai Dilayani), dihitung real-time dari agregasi checkpoint. |
| FR-04 | Filter **tanggal layanan** (date picker, default hari ini). |
| FR-05 | Filter **nama dokter**. |
| FR-06 | Filter **sesi/jam praktik** — menampilkan jam praktik aktual dari MD Jadwal Praktik dokter tsb (mendukung dokter dengan jam pagi/sore/malam pada hari yang sama). |
| FR-07 | Filter bersifat *additive* (AND). |
| FR-08 | **Pencarian** pasien berdasarkan No. RM atau Nama. |
| FR-09 | **Pagination** default + opsi "Tampilkan Semua"; nilai default item/halaman = **15** [ASUMSI, samakan dgn Dashboard RJ]. |
| FR-10 | **Penanda SEP** hanya dievaluasi untuk pasien BPJS; menampilkan checklist bila SEP sudah dibuat pada registrasi tsb. |
| FR-11 | **Penanda prioritas** aktif bila `data_sosial.kartu_prioritas == "Ya"` pada tanggal pendaftaran. |
| FR-12 | Setiap baris menyediakan **akses cepat** membuka Asesmen Rehab Medik & modul terkait sesuai *privilege* role. |
| FR-13 | **7 checkpoint** ditampilkan sebagai kolom status (§8); status **read-only** di dashboard. |
| FR-14 | Kolom **E-Resep** = agregat sub-resep Obat Pulang + CPO (BR-010). |
| FR-15 | **Kolom Status Tindak Lanjut** (sebelum kolom Aksi) menampilkan disposisi/status keluar pasien. Alur normal di-set oleh auto-penyelesaian = "pulangkan"; **daftar opsi & perilaku disposisi lain (Modal Status Keluar) mengikuti PRD Discharge** (§9). |
| FR-16 | **Auto-penyelesaian** oleh *background job* (BR-012): pasien memenuhi syarat diselesaikan otomatis → **Pulang** (Status Tindak Lanjut = "pulangkan"). |
| FR-17 | Pembedaan baris (row) antar pasien jelas secara visual. |
| FR-18 | Data dashboard *auto-refresh*/real-time atas perubahan status checkpoint dari modul sumber. |
| FR-19 | **[PERLU KONFIRMASI]** Popover Detail Pasien saat hover/klik nama (No. Pendaftaran, jenis kelamin, status lama/baru, waktu terdaftar, umur) — mengikuti pola Dashboard RJ. |

---

## 6. Business Process

### 6.1 Alur Utama (To-Be)

> Terdaftar (Pendaftaran RJ) → antrian Rehab Medik
> → Perawat: intake · Dokter Sp.KFR: Asesmen Rehab Medik (checkpoint → Selesai)
> → Input Tindakan & BHP + order penunjang (Lab / Radiologi / E-Resep) sesuai kebutuhan
> → **Keluar**: (a) otomatis via job bila kriteria BR-012 terpenuhi → Status Tindak Lanjut = "pulangkan"; atau (b) manual via aksi Status Keluar pada baris pasien — **opsi & perilaku disposisi mengikuti PRD Discharge**
> → Keluar dari antrian; data → casemix & reporting kunjungan RJ.

### 6.2 Routing E-Resep (dipertahankan dari V1)

| Sumber | Jenis order | Tujuan farmasi |
|---|---|---|
| Pasien RJ | E-resep obat dibawa pulang | Farmasi **Rawat Jalan** |
| Pasien RJ | Order pelayanan **CPO** | Farmasi **Rawat Jalan** |

> Mapping tujuan farmasi bersumber dari setting user pada **MD Gudang & Farmasi** (BR-011).
> *Routing untuk pasien RI (→ Farmasi Rawat Inap) menjadi bagian kesiapan arsitektur (§10).*

---

## 7. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Dashboard hanya menampilkan pasien dengan tanggal layanan Rehab Medik sama dengan filter tanggal aktif. |
| BR-002 | Default tanggal layanan = hari ini (server date WIB). |
| BR-003 | Filter dokter & sesi/jam praktik bersifat *additive* (AND) terhadap filter tanggal. |
| BR-004 | Counter status dihitung real-time dari agregasi status checkpoint, bukan field statis. |
| BR-005 | Penanda SEP hanya dievaluasi untuk pasien dengan `cara_bayar` mengandung "BPJS"; pasien non-BPJS menampilkan kolom kosong. |
| BR-006 | Penanda prioritas aktif bila `data_sosial.kartu_prioritas == "Ya"` pada tanggal pendaftaran. |
| BR-007 | Checkpoint **As. Rehab Medik, Tindakan & BHP, E-Resep, Lab, Radiologi, Bayar** bertipe **tri-state**: Tidak Diisi → Sedang Diproses → Selesai. |
| BR-008 | Checkpoint **Surat Kontrol** bertipe **bi-state** (Belum Dibuat / Sudah Dibuat). |
| BR-009 | Definisi state **"Sedang Diproses"** per checkpoint: **Grup A** (form-based: As. Rehab Medik, Tindakan & BHP) = form dibuka & belum disimpan final; **Grup B** (order-based: E-Resep, Lab, Radiologi) = order sudah terkirim & belum tuntas. |
| BR-010 | Kolom E-Resep adalah agregat dua sub-resep (Obat Pulang + CPO); state Selesai hanya bila seluruh sub-resep yang relevan sudah selesai. |
| BR-011 | Routing tujuan farmasi e-resep mengikuti mapping pada MD Gudang & Farmasi dan behavior V1 (§6.2). |
| BR-012 | **Kriteria auto-penyelesaian**: As. Rehab Medik = Selesai **DAN** Tindakan & BHP = Selesai → set Status Tindak Lanjut = "pulangkan" & keluarkan pasien. Pasien yang belum memenuhi **tidak boleh** diselesaikan otomatis (mencegah *false data* casemix). |
| BR-013 | Status keluar yang di-set **manual** meng-*override* auto-penyelesaian (manual menang); pasien di-*exclude* dari job. |
| BR-014 | **Daftar opsi & perilaku disposisi keluar (Modal Status Keluar) mengikuti PRD Discharge** — tidak didefinisikan di dashboard ini. Dashboard hanya menampilkan hasil disposisi pada Kolom Status Tindak Lanjut & menyediakan titik pemicunya. |
| BR-015 | Checkpoint yang tidak relevan untuk pasien tertentu ditampilkan Tidak Diisi / N/A; **tidak boleh** otomatis Selesai. |
| BR-016 | Setiap perubahan Status Tindak Lanjut & eksekusi auto-penyelesaian tercatat di **audit log** (aktor/sistem, timestamp, nilai before/after). |

---

## 8. Definisi Checkpoint & State

| # | Checkpoint | Tipe | Keterangan |
|---|---|---|---|
| 1 | **As. Rehab Medik** | Tri-state | Asesmen Dokter Sp.KFR. Sumber: modul Asesmen Rehab Medik. |
| 2 | **Tindakan & BHP** | Tri-state | Input tindakan rehab & BHP. |
| 3 | **Lab** | Tri-state | Order pemeriksaan laboratorium. |
| 4 | **Radiologi** | Tri-state | Order pemeriksaan radiologi. *(Ditampilkan sebagai kolom, sesuai V1 Rehab Medik.)* |
| 5 | **E-Resep** | Tri-state | Agregat Obat Pulang + CPO (BR-010). |
| 6 | **Surat Kontrol** | **Bi-state** | **Belum Dibuat / Sudah Dibuat.** |
| 7 | **Bayar** | Tri-state | Status pembayaran. |

> Status pada dashboard **read-only**; perubahan berasal dari modul sumber via *event*. **Kolom Status Tindak Lanjut** (disposisi keluar) bukan checkpoint — dibahas terpisah di §9.

---

## 9. Kolom Status Tindak Lanjut

**Kolom Status Tindak Lanjut** ditempatkan sebelum kolom Aksi, menampilkan disposisi/status keluar pasien (mis. pulang, rujuk internal, rujuk eksternal, meninggal, pulang paksa, rawat inap, dsb).

| Aspek | Detail |
|---|---|
| Sumber nilai (alur normal) | Job auto-penyelesaian menyetel **"pulangkan"** saat kriteria BR-012 terpenuhi. |
| Penetapan manual | Melalui aksi/Modal Status Keluar pada baris pasien. **Daftar opsi & perilaku tiap disposisi didefinisikan di PRD Discharge** (PRD terpisah), bukan di dashboard ini. |
| Override | Status keluar manual menang atas auto-penyelesaian (BR-013). |
| Efek | Pasien yang telah disposisi keluar dikeluarkan dari antrian aktif. |
| Audit | Setiap perubahan tercatat di audit log (BR-016). |

> Dashboard **tidak** mendefinisikan validasi/behavior per disposisi (mis. Rujuk Internal, Rawat Inap, Meninggal); seluruhnya menjadi ranah **PRD Discharge** (DEP-03).

---

## 10. Catatan Kesiapan Arsitektur — Ranap (Future Scope)

> **Status: bukan fitur MVP.** Kebutuhan pelayanan Rehab Medik untuk pasien Rawat Inap (RI) **belum ada** saat ini, namun **bisa muncul ke depan**. Bagian ini adalah **catatan untuk developer** agar arsitektur MVP disiapkan sehingga penambahan RI tidak memerlukan rework besar.

Rekomendasi kesiapan arsitektur:

1. **Model data cohort-aware.** Sertakan atribut kohort (RJ/RI) pada entitas antrian sejak awal, walau MVP hanya mengisi RJ — sehingga penambahan tab RI cukup mengaktifkan filter kohort tanpa migrasi skema.
2. **Layout siap-tab.** Rancang layout daftar antrian agar dapat menampung **tab toggle** `Rawat Jalan | Rawat Inap` & counter per-tab di masa depan.
3. **Kolom Asal Unit (opsional/tersembunyi).** Sediakan provisi kolom **Asal Unit** yang dapat diaktifkan untuk kohort RI (menempati slot serupa pola Dashboard HD).
4. **Sumber masuk pasien RI belum ditentukan.** Rehab Medik **tidak** memakai mekanisme "Order dari Ranap". Bila RI ditambahkan, sumber masuknya pasien RI perlu didefinisikan pada PRD tersendiri (mis. pendaftaran manual di loket rehab atau integrasi Ranap) — **jangan diasumsikan** di MVP.
5. **Disposisi keluar RI → PRD Discharge.** Bila RI diaktifkan, alur normal = **"Selesai Sesi Rehab"** (kembali ke Asal Unit, episode ranap tetap aktif, **bukan** discharge RS); daftar lengkap disposisi RI tetap mengikuti **PRD Discharge** — konsisten dengan Dashboard HD.
6. **Routing e-resep RI.** Provisi routing agar e-resep pasien RI (obat pulang & CPO) dapat diarahkan ke **Farmasi Rawat Inap** saat RI diaktifkan.

---

## 11. Non-Functional Requirements

| ID | NFR |
|---|---|
| NFR-01 | Initial load & response filter/search < 1 detik p95 @ 30 user konkuren. |
| NFR-02 | Delta status checkpoint (event → dashboard) < 3 detik. |
| NFR-03 | Pagination default + virtualization pada mode "Tampilkan Semua" untuk menjaga performa. |
| NFR-04 | Arsitektur *event-driven* untuk konsistensi real-time status. |
| NFR-05 | RBAC: akses buka form/aksi mengikuti privilege role (perawat vs dokter). |
| NFR-06 | Audit log untuk seluruh perubahan Status Tindak Lanjut & penyelesaian. |
| NFR-07 | Model data & layout disiapkan cohort-aware untuk kesiapan RI (§10). |

---

## 12. Dependencies

| ID | Dependency | Sifat |
|---|---|---|
| DEP-01 | Modul **Asesmen Dokter Rehab Medik** | Menyediakan checkpoint #1 |
| DEP-02 | Modul **Tindakan & BHP**, **E-Resep**, **Lab**, **Radiologi**, **Surat Kontrol** | Menyediakan checkpoint 2–7 |
| DEP-03 | **PRD Discharge** | Sumber daftar opsi & perilaku disposisi Status Tindak Lanjut (§9) |
| DEP-04 | **MD Jadwal Praktik** (sumber sesi/jam praktik) | Filter FR-06 |
| DEP-05 | **MD Gudang & Farmasi** (mapping routing e-resep) | BR-011 |

---

## 13. Acceptance Criteria (Given-When-Then)

| ID | Kriteria |
|---|---|
| AC-01 | **Given** tanggal layanan hari ini, **When** dashboard dibuka, **Then** pasien Rehab Medik rawat jalan tampil dengan counter tiga-state + total. |
| AC-02 | **Given** dokter praktik 2 sesi di hari sama, **When** filter sesi/jam dipilih, **Then** hanya pasien pada sesi tsb yang tampil (per MD Jadwal Praktik). |
| AC-03 | **Given** user mengetik No. RM/nama, **When** pencarian dijalankan, **Then** pasien cocok tampil < 1 detik. |
| AC-04 | **Given** pasien BPJS dengan SEP sudah dibuat, **When** baris ditampilkan, **Then** penanda SEP tercentang; non-BPJS kosong. |
| AC-05 | **Given** pasien kartu prioritas (== "Ya") terdaftar hari ini, **When** baris ditampilkan, **Then** penanda prioritas muncul. |
| AC-06 | **Given** dokter membuka form Asesmen Rehab Medik & belum menyimpan, **When** dashboard dilihat, **Then** checkpoint As. Rehab Medik = **Sedang Diproses**. |
| AC-07 | **Given** order Lab terkirim & belum selesai, **When** dashboard dilihat, **Then** checkpoint Lab = **Sedang Diproses**; setelah tuntas → **Selesai**. |
| AC-08 | **Given** Surat Kontrol, **When** ditampilkan, **Then** hanya dua state (Belum Dibuat / Sudah Dibuat). |
| AC-09 | **Given** pasien dengan As. Rehab Medik + Tindakan & BHP = Selesai, **When** job auto-penyelesaian berjalan, **Then** Status Tindak Lanjut = "pulangkan" & pasien keluar antrian. |
| AC-10 | **Given** pasien **belum** memenuhi BR-012, **When** job berjalan, **Then** pasien **tidak** diselesaikan otomatis. |
| AC-11 | **Given** Status Tindak Lanjut sudah di-set manual, **When** job berjalan, **Then** pasien di-*exclude* (override manual menang). |
| AC-12 | **Given** disposisi keluar dipilih pada baris pasien, **When** disposisi disimpan (perilaku per PRD Discharge), **Then** Kolom Status Tindak Lanjut menampilkan nilai disposisi tsb & pasien keluar antrian aktif. |
| AC-13 | **Given** e-resep pasien (obat pulang maupun CPO), **When** order dikirim, **Then** keduanya masuk ke **Farmasi Rawat Jalan**. |

---

## 14. Keputusan Desain

| ID | Keputusan |
|---|---|
| D-01 | **Scope MVP = Rawat Jalan only.** Kohort RI belum ada kebutuhan; disiapkan sebagai kesiapan arsitektur (§10), bukan fitur MVP. |
| D-02 | Kriteria auto-penyelesaian = **As. Rehab Medik + Tindakan & BHP** (2 checkpoint) → **Pulang** ("pulangkan"). |
| D-03 | **Asesmen = satu** checkpoint (As. Rehab Medik/dokter), mengikuti V1 (tidak dipisah perawat/dokter). |
| D-04 | **Surat Kontrol = bi-state** (Belum/Sudah Dibuat). |
| D-05 | Kolom **Radiologi ditampilkan** sebagai checkpoint (sesuai V1 & feature doc). |
| D-06 | Routing E-Resep RJ (obat pulang **dan** CPO) → **Farmasi Rawat Jalan**. |
| D-07 | **Tidak ada badge Konsul/Rujuk.** Konsul/rujuk internal adalah salah satu **nilai disposisi pada Kolom Status Tindak Lanjut**, bukan badge tersendiri. |
| D-08 | Kolom V1 "Rujuk Internal" **digantikan** oleh **Kolom Status Tindak Lanjut**. Daftar opsi & perilaku disposisi **didefinisikan di PRD Discharge**, bukan di dashboard ini. |

---

## 15. Open Questions

| ID | Pertanyaan | Default sementara |
|---|---|---|
| OQ-01 | Sumber data **sesi/jam praktik** — MD Jadwal Praktik yang sama, atau konfigurasi shift Rehab tersendiri? | Asumsi: MD Jadwal Praktik |
| OQ-02 | Perlukah pembedaan **sub-layanan** Rehab Medik (Fisioterapi/Terapi Wicara/Terapi Okupasi) sebagai kolom/klinik? | Satu unit (ikut V1) |
| OQ-03 | Kapan **job auto-penyelesaian** berjalan — event-driven saat kriteria terpenuhi, cut-off harian, atau keduanya? | Usulan: event-driven + sweep cut-off harian |
| OQ-04 | Nilai default **pagination** (item/halaman) | Usulan: 15 (samakan Dashboard RJ) |

> *Seluruh OQ bersifat konfirmasi & tidak memblok struktur MVP.*

---

## 16. Roadmap & Risk Register

### 16.1 Roadmap (usulan)

| Fase | Cakupan |
|---|---|
| Fase 1 (MVP) | RJ-only: 7 checkpoint, Kolom Status Tindak Lanjut (disposisi via PRD Discharge), filter (tanggal/dokter/sesi), pencarian, pagination, counter 3-state, penanda SEP & prioritas, auto-penyelesaian (Pulang) — arsitektur disiapkan cohort-aware (§10) |
| Fase 2 (bila dibutuhkan) | Aktivasi kohort **Rawat Inap** (tab RI, Asal Unit, disposisi RI via PRD Discharge, routing e-resep RI) sesuai §10 |

### 16.2 Risk Register

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-01 | Job auto salah men-*discharge* pasien belum dilayani | *False data* casemix | Uji ketat BR-012; audit log |
| R-02 | Status checkpoint tidak real-time (event delay) | Salah baca progres | Arsitektur event-driven + refresh; NFR-04 |
| R-03 | Performa < 1 detik tidak tercapai pada volume tinggi | UX buruk | Indexing, pagination default |
| R-04 | Routing e-resep salah tujuan farmasi | Obat salah unit | Validasi mapping MD Gudang & Farmasi; AC-13 |
| R-05 | Arsitektur MVP tidak cohort-aware → rework saat RI ditambah | Biaya rework tinggi | Terapkan §10 sejak MVP (model data & layout siap-tab) |
| R-06 | PRD Discharge belum siap saat dashboard dibangun | Disposisi manual belum lengkap | Selaraskan timeline dengan PRD Discharge; MVP tetap bisa jalan dgn auto "pulangkan" |

---

*Dokumen ini adalah draft untuk direview. Item ber-[PERLU KONFIRMASI] & Open Questions menunggu konfirmasi sebelum dikunci ke v1.4.*
