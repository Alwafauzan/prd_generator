# PRD — Pendaftaran Penunjang (Laboratorium & Patologi Anatomi)

**Related Document:** PRD Pendaftaran Rawat Jalan (B1 — **hard dependency**: induk pola identifikasi pasien, penjamin/SEP, dashboard digabung); Fitur Order Penunjang / Modul Laboratorium (detail form order & recall — [**]); Referensi V1 (perilaku pendaftaran lab lama)
**Dokumen ID:** PRD-B4-v2.0 · **Modul Code:** B4 (Pendaftaran > Pendaftaran Penunjang) · **Versi:** 2.0 (Draft — konversi format generator dari sumber v0.9)
**Tanggal Disusun:** 10 Jun 2026 (sumber) · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Fase 1 (MVP) — window pengerjaan 29 Jun–3 Jul 2026 `[PERLU KONFIRMASI target rilis produksi/kuartal]`

---

## 1. Overview / Brief Summary

Modul ini menangani **pendaftaran penunjang Laboratorium Klinik dan Patologi Anatomi (PA) melalui loket pendaftaran**, dipakai oleh petugas pendaftaran. Petugas dapat mendaftarkan pasien baru maupun lama ke penunjang, memunculkan list pasien yang sudah terdaftar penunjang, membatalkan registrasi lab/PA yang belum dilayani, mencetak kartu pasien, serta membuat billing baru khusus pendaftaran ulang.

Pada Neurovi v1, order lab/PA dicatat manual atau lewat menu pendaftaran lab lama yang banyak klik dan tidak konsisten dengan tampilan Order Penunjang Lab. Fokus v2 adalah menyederhanakan proses pendaftaran, menyeragamkan tampilan agar mirip Order Penunjang Lab, dan menambahkan log aktivitas pendaftaran.

Lingkup **Fase 1 (MVP)** berfokus pada **proses pendaftarannya**, bukan detail form order. Detail form order akan sama dengan fitur **Order Penunjang** dan dibahas lebih lanjut di dokumen tersebut. Pendaftaran pasien yang **sudah memiliki booking order lab sebelumnya (recall)** ditunda ke Fase 2 agar dikerjakan sekalian dengan modul Lab. `[**]`

> Referensi: PDF sumber "Pendaftaran Penunjang (Laboratorium & Patologi Anatomi)" v0.9; mockup "Permintaan Pemeriksaan Laboratorium" & modal "Laboratorium" pada Pendaftaran RJ.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Pasien datang ke loket; petugas identifikasi pasien (baru/lama) dan pilih penjamin secara manual/terpisah.
- Order lab/PA dicatat manual atau via menu pendaftaran lab lama yang banyak klik dan tidak konsisten dengan tampilan Order Penunjang Lab.
- Antrean penunjang & label spesimen sering manual → rawan salah identitas. `[ASUMSI dari analogi g-admisi-onsite-registration & catatan UX Lampiran]`
- Pembatalan order tidak terstandar; tidak ada log aktivitas pendaftaran.

**Masalah/pain point:**
- Aspek bisnis proses: tetap **as-is** (tidak ada perubahan proses bisnis yang ditargetkan pada rilis ini).
- Aspek UX: masih terlalu banyak klik untuk mendaftarkan pasien.
- Aspek logic system: perlu menambahkan log pendaftaran pasien (menambahkan pasien, membatalkan pasien).

**Dampak utama yang disasar v2:**
- Pendaftaran lebih ringkas & tampilan konsisten dengan Order Penunjang Lab · pembatalan terstandar (ikut membatalkan order ke lab) · jejak aktivitas terekam di log.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = daftar pasien baru/lama ke Lab Klinik & PA (buat order baru), list pasien terdaftar penunjang, pembatalan order "Belum Diproses", cetak kartu pasien, billing pendaftaran ulang (mock), log pendaftaran.
- **Fase 2** = pendaftaran pasien dengan booking order lab sebelumnya (recall/menyambungkan order dokter); cetak label spesimen dari sistem; kode LIS/LOINC & integrasi SATUSEHAT; bridging BPJS. `[**]`

> Behavior/volume: pasien rawat jalan paling banyak 30–50 pasien/hari; estimasi ±300–400 pasien/bulan.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Daftar pasien baru/lama** ke penunjang Lab Klinik & Patologi Anatomi (buat order baru).
2. **List pasien terdaftar penunjang** melalui loket pendaftaran (dashboard digabung dengan Pendaftaran RJ).
3. **Pembatalan registrasi** ke laboratorium untuk pasien yang **belum dilayani**, sekaligus membatalkan order lab yang sudah ter-order ke laboratorium.
4. **Cetak kartu pasien.**
5. **Buat billing baru** khusus pendaftaran ulang (mock).
6. **Log pendaftaran** (menambahkan pasien, membatalkan pasien).

### Mock (Fase 1) — dinyatakan eksplisit di sumber
- Proses order laboratorium yang dibuat otomatis oleh sistem setelah pasien terdaftar (mock).
- Order booking laboratorium sebelumnya dapat terbaca di pendaftaran (mock).
- Generate billing (mock).
- List pemeriksaan laboratorium (mock).
- List pemeriksaan patologi anatomi (mock).

### Out Scope
- **Detail form order** — mengikuti fitur **Order Penunjang / Modul Laboratorium** (dibahas di dokumen terpisah).
- **Pendaftaran Radiologi** — tampil sebagai opsi di modal Pilih Pemeriksaan Penunjang, tetapi dibahas di PRD terpisah (B5).
- **Cetak label spesimen dari sistem** — saat ini label dicetak dari LIS. `[**]`
- **[Fase 2] `[**]`** Pendaftaran pasien dengan booking order lab sebelumnya (recall) — mekanismenya belum final, dikerjakan sekalian dengan modul Lab.
- **[Fase 2] `[**]`** Kode LIS, kode LOINC, bridging BPJS (SEP/Episode via VClaim), integrasi SATUSEHAT.

## 4. Goals and Metrics

### Tujuan
Menyederhanakan pendaftaran penunjang Lab & PA dari loket agar lebih sedikit klik dan tampilannya konsisten dengan Order Penunjang Lab, dengan pembatalan yang terstandar dan aktivitas yang terekam di log.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Loading dashboard | Maks. 1 detik | NFR-001 |
| Loading pagination | < 1 detik | NFR-002 |
| Pencarian pasien | < 1 detik | NFR-003 |
| Proses pendaftaran pasien | Maks. 1 detik | NFR-004 |
| Volume beban | 30–50 pasien/hari; ±300–400 pasien/bulan | NFR-005 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
> Berdasarkan List Fitur (sheet MVP, cluster Admisi). Modul ini = **B4**.

| Code / Modul | Peran terhadap B4 |
|--------------|-------------------|
| **B1** — Pendaftaran > Pendaftaran Rawat Jalan | Induk pola: identifikasi pasien, penjamin/SEP, dashboard (digabung). **Hard dependency.** |
| **B2** — Pendaftaran > Pendaftaran Rawat Inap | Berbagi field pasien & penjamin. |
| **B3** — Pendaftaran > Pendaftaran IGD | Pola pendaftaran. |
| **B5** — Pendaftaran > Pendaftaran Radiologi | Pola penunjang sejenis (analogi alur). |
| **B6** — Pendaftaran > Rehabilitasi Medis | Pola penunjang. |
| **B7** — Pendaftaran > MCU | Pola penunjang. |
| **B8 / B9** — Antrian > APM / Display antrian | Konsumen nomor antrean penunjang. |
| **(Lab)** — Order Penunjang / Modul Laboratorium | Tujuan order ("Belum Diproses"), detail form order, recall (next phase). |
| **(A3)** — Master Unit | Sumber unit. |
| **(A2)** — Master Staf | Sumber `dokter_id` (jenis_tenaga = dokter). |

Dependency lintas modul: **B1 (Pendaftaran RJ)**, **Master Unit (A3)**, **Master Staf (A2)**, **Billing/Master Tarif**, **Master Data Layanan & Master Data Lab**, **Modul Laboratorium**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Petugas pendaftaran | Primary | Mendaftarkan pasien ke penunjang, membatalkan order, cetak kartu, buat billing pendaftaran ulang. |
| Modul Laboratorium | Secondary | Menerima order "Belum Diproses"; melanjutkan proses order & (Fase 2) cetak label spesimen. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini)
1. Pasien datang ke loket; petugas identifikasi pasien (baru/lama) dan pilih penjamin secara manual/terpisah.
2. Order lab/PA dicatat manual atau via menu pendaftaran lab lama yang banyak klik dan tidak konsisten dengan tampilan Order Penunjang Lab.
3. Antrean penunjang & label spesimen sering manual → rawan salah identitas. `[ASUMSI dari analogi g-admisi-onsite-registration & catatan UX Lampiran]`
4. Pembatalan order tidak terstandar; tidak ada log aktivitas pendaftaran.

### B. To-Be (kondisi diharapkan) — turunan Lampiran + analogi BPMN
1. Identifikasi pasien & penjamin mengikuti alur Pendaftaran Rawat Jalan (B1): cari pasien (NIK/No.RM/nama) → bila baru, input data demografi (opsi bridging Disdukcapil `[ASUMSI dari g-admisi-onsite-registration]`); pilih penjamin (Umum/BPJS/Asuransi).
2. Pilih layanan Penunjang → jenis: **Lab Klinik** atau **Patologi Anatomi**.
3. Sumber order:
   - Bila dokter sudah membuat order di pelayanan → petugas menyambungkan order (recall). `[**] Next phase / mock`
   - Bila pasien membawa pengantar kertas / atas permintaan sendiri → petugas buat order baru.
4. Aturan penjamin diperiksa di titik ini: order BPJS wajib tertaut episode/rujukan; APS hanya Umum/Asuransi.
5. Simpan → order berstatus **"Belum Diproses"**; sistem menerbitkan 1 nomor antrean penunjang dan menyiapkan label spesimen; order diteruskan ke menu Lab untuk dikonfirmasi.
6. Petugas dapat cetak kartu pasien dan (untuk pendaftaran ulang) membuat billing (mock).
7. Petugas dapat melihat list pasien terdaftar penunjang dan membatalkan order pasien yang belum dilayani (membatalkan registrasi sekaligus order ke lab).
8. Mode offline: seluruh langkah tetap berfungsi; order disimpan lokal dulu lalu disinkronkan ke LIS/SATUSEHAT saat koneksi pulih. `[ASUMSI]`
9. Setiap aksi tambah/batal dicatat di log pendaftaran.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Identifikasi pasien & penjamin | Manual/terpisah | Mengikuti alur Pendaftaran RJ (B1) |
| Tampilan form order | Menu lab lama, banyak klik, tidak konsisten | Mirip Order Penunjang Lab; lebih ringkas |
| Antrean & label spesimen | Manual, rawan salah identitas | Sistem terbitkan antrean + siapkan data label |
| Pembatalan | Tidak terstandar | Terstandar; ikut batalkan order ke Lab; wajib alasan |
| Log aktivitas | Tidak ada | Ada (tambah/batal) |

## 7. Main Flow / Mindmap

### Skenario 1 — Buat Order Baru Lab Klinik (alur normal)
1. Petugas identifikasi pasien & penjamin (mengikuti Pendaftaran RJ). 2. Pada seksi Penunjang, klik **+ Penunjang**. 3. Modal **Pilih Pemeriksaan Penunjang** terbuka (Laboratorium / Patologi Anatomi / Radiologi); tombol **Lanjut** nonaktif sampai satu jenis dipilih. 4. Pilih **Laboratorium** → **Lanjut** → form order Lab terbuka. 5. Pilih pemeriksaan dari katalog (kelompok Layanan Induk + pencarian, centang >1). 6. (Opsional) isi Tanggal/Waktu Pemeriksaan, Prioritas, Diagnosa ICD-10, Dokter Pengirim, Catatan Khusus. 7. **SIMPAN** → Nomor Order dibuat otomatis; status "Belum Diproses"; terbit antrean; order tampil di tabel Penunjang & masuk menu Lab tab "Belum Diproses".

### Skenario 2 — Buat Order Baru Patologi Anatomi
1–4. Sama seperti Skenario 1, pilih **Patologi Anatomi** pada modal. 5. Pilih jenis PA dari master; isi isian inti PA (Jenis Pemeriksaan, Jaringan Tubuh, Keterangan Pungsi bila Pungsi, Lokalisasi, Diagnosis Klinik); bagian tambahan muncul mengikuti Jenis Pemeriksaan (Sitologi Sediaan / Keganasan / Keganasan Pap Smear). 6. **SIMPAN** (minimal jenis PA terpilih) → order "Belum Diproses" + antrean + tampil di tabel Penunjang.

### Skenario 3 — Penjamin BPJS
- Order penjamin BPJS wajib tertaut **Referensi SEP/Episode**; bila kosong → error "Order BPJS harus terkait order dokter/episode". APS hanya Umum/Asuransi. _Sesuai pendaftaran integrasi — dibahas lebih lanjut saat bridging BPJS._ `[**]`

### Skenario 4 — Pasien dengan booking order sebelumnya (recall)
- Petugas menyambungkan order dokter yang sudah ada. Mekanisme belum final → **Fase 2** bersama modul Lab. `[**]` `[PERLU KONFIRMASI mekanisme final]`

### Skenario 5 — Batalkan Order Lab
- Petugas pilih order berstatus "Belum Diproses" → batalkan; sistem minta **alasan**; pembatalan ikut membatalkan order yang telah diteruskan ke Lab; aksi tercatat di log. Order "Sedang Diproses"/"Selesai" tidak dapat dibatalkan dari pendaftaran.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Jalur pendaftaran penunjang ditentukan sumber order & penjamin. Fase 1: buat order baru. Recall booking order sebelumnya = Fase 2. | US-001; FR-019 `[**]` |
| **BR-002** | Data pasien & jenis penjamin mengikuti Pendaftaran RJ (B1); tidak diinput ulang di form penunjang. | US-001; FR-002; DR-1.7 |
| **BR-003** | Daftar pemeriksaan disaring sesuai jenis penjamin; hanya pemeriksaan **aktif & sesuai penjamin** yang tampil (sumber master data aktif). | US-001, US-002; FR-003; DR-1.15 |
| **BR-004** | Order penjamin **BPJS wajib tertaut Referensi SEP/Episode**; APS hanya Umum/Asuransi. Bila kosong pada BPJS → error "Order BPJS harus terkait order dokter/episode". | FR-012; DR-1.8 `[**]` |
| **BR-005** | Nomor Order **dibuat otomatis oleh sistem**; format = tanggal + nomor urut harian (reset tiap hari). Contoh: `2606175002`. | FR-009; DR-1.1 |
| **BR-006** | Lab Klinik: tidak dapat SIMPAN tanpa minimal **1 pemeriksaan**. | US-002; FR-006; DR-1.15 |
| **BR-007** | Patologi Anatomi: tidak dapat SIMPAN tanpa **minimal jenis PA terpilih**. | US-003; FR-008 |
| **BR-008** | Setelah SIMPAN: status **"Belum Diproses"**, terbit **1 nomor antrean penunjang**, sistem menyiapkan label spesimen, order diteruskan ke menu Lab tab "Belum Diproses". | US-002, US-003; FR-010; DR-1.10 |
| **BR-009** | Pendaftaran **hanya membuat status "Belum Diproses"**; transisi "Sedang Diproses"/"Selesai" dikelola modul Lab. | DR-1.10; §9 State Machine |
| **BR-010** | Hanya order **"Belum Diproses"** yang dapat dibatalkan dari pendaftaran; pembatalan **ikut membatalkan** order yang telah diteruskan ke Lab; **wajib alasan**; tercatat di log. Order "Sedang Diproses"/"Selesai" tidak dapat dibatalkan dari pendaftaran. | US-005; FR-013 |
| **BR-011** | Setiap aksi tambah/batal pendaftaran dicatat di **log pendaftaran**. | FR-014; NFR-006 |
| **BR-012** | Bagian tambahan form PA **muncul mengikuti Jenis Pemeriksaan** (Sitologi Sediaan / Keganasan / Keganasan Pap Smear). | US-003; FR-007; DR-2.2 |
| **BR-013** | Petugas dapat **mencetak kartu pasien**. | US-006; FR-015 |
| **BR-014** | Untuk **pendaftaran ulang**, sistem dapat membuat billing baru (mock Fase 1). | US-006; FR-016 |
| **BR-015 `[**]`** | **Fase 2:** Sistem menyiapkan data label spesimen (min. 2 identitas Nama + Tgl Lahir, No. RM, barcode Nomor Order, jenis pemeriksaan); pada fase ini label masih dicetak dari **LIS**. | US-004; FR-018; DR-2.1 |
| **BR-016 `[ASUMSI]`** | Mode offline: seluruh langkah tetap berfungsi; order disimpan lokal lalu disinkronkan ke LIS/SATUSEHAT saat koneksi pulih. | FR-020 |

## 9. State Machine — Status Order Penunjang

### 9.1 Tiga Kondisi Status
| State | Makna | Dikelola oleh |
|-------|-------|---------------|
| **Belum Diproses** | Order baru dibuat dari pendaftaran; menunggu dikonfirmasi lab. | Pendaftaran (B4) — satu-satunya status yang dibuat di sini |
| **Sedang Diproses** | Order sedang dikerjakan di lab. | Modul Laboratorium |
| **Selesai** | Order tuntas. | Modul Laboratorium |

- **Transisi:** Belum Diproses → Sedang Diproses → Selesai (berbasis event pada modul Lab).
- Default value status saat pendaftaran = **Belum Diproses** (BR-008, BR-009).

### 9.2 Aturan Pembatalan per Status
| Status saat ini | Dapat dibatalkan dari pendaftaran? | Efek |
|-----------------|-----------------------------------|------|
| Belum Diproses | Ya | Batalkan registrasi + batalkan order ke Lab + minta alasan + catat log (BR-010) |
| Sedang Diproses | Tidak | — |
| Selesai | Tidak | — |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Entry point Penunjang** — pada form Tambah Pendaftar (RJ) seksi Penunjang, tombol **+ Penunjang** membuka modal **Pilih Pemeriksaan Penunjang** (Laboratorium / Patologi Anatomi / Radiologi). Tombol **Lanjut** nonaktif sampai satu jenis dipilih; **Batal** menutup modal tanpa membuat order. | US-001; BR-001 |
| **FR-002** | **Data pasien & penjamin dari RJ** — setelah Lanjut, form order sesuai jenis terbuka; jenis penjamin & data pasien mengikuti Pendaftaran RJ, tidak diinput ulang. | US-001; BR-002 |
| **FR-003** | **Filter pemeriksaan per penjamin** — daftar pemeriksaan disaring sesuai jenis penjamin; hanya pemeriksaan aktif yang tampil (sumber master data aktif). | US-001, US-002; BR-003 |
| **FR-004** | **Katalog Lab** — tampil berkelompok per Layanan Induk (Hematologi, Kimia Klinik, Imuno-serologi, Urinalisa, dst.) + pencarian nama pemeriksaan; kelompok dapat dibuka/tutup; centang lebih dari satu; tersedia pilihan paket pemeriksaan (mis. Paket Operasi). `[ASUMSI: paket opsional]` | US-002; BR-006 |
| **FR-005** | **Isian order Lab (opsional kecuali pemeriksaan)** — Tanggal Pemeriksaan (default hari ini), Waktu, Prioritas (CITO/Reguler, default Reguler), Diagnosa ICD-10 (boleh >1), Dokter Pengirim (default "-"), Catatan Khusus. | US-002; DR-1 |
| **FR-006** | **Validasi SIMPAN Lab** — tidak dapat SIMPAN tanpa minimal 1 pemeriksaan. | US-002; BR-006 |
| **FR-007** | **Form order PA** — pilih jenis PA dari master (Jenis = Patologi Anatomi); isian inti (Jenis Pemeriksaan, Jaringan Tubuh, Keterangan Pungsi bila Pungsi, Lokalisasi, Diagnosis Klinik); bagian tambahan muncul mengikuti Jenis Pemeriksaan. | US-003; BR-012 |
| **FR-008** | **Validasi SIMPAN PA** — tidak dapat SIMPAN tanpa minimal jenis PA terpilih. | US-003; BR-007 |
| **FR-009** | **Generate Nomor Order** — dibuat otomatis oleh sistem; format tanggal + nomor urut harian (reset tiap hari). | US-002, US-003; BR-005 |
| **FR-010** | **Efek SIMPAN** — status "Belum Diproses"; terbit 1 nomor antrean penunjang; siapkan data label spesimen; order diteruskan ke menu Lab tab "Belum Diproses". | US-002, US-003; BR-008 |
| **FR-011** | **Tabel Penunjang** — order tersimpan tampil sebagai baris di tabel Penunjang: No. \| Layanan Penunjang \| No. Order \| Tanggal Pemeriksaan \| Dokter Pengirim \| Aksi. | US-001; BR-008 |
| **FR-012** | **Validasi penjamin BPJS** — Referensi SEP/Episode wajib untuk BPJS; error bila kosong. `[**] saat bridging BPJS` | Skenario 3; BR-004 |
| **FR-013** | **Batalkan order** — hanya order "Belum Diproses"; membatalkan registrasi sekaligus order ke Lab; minta alasan; tercatat di log. | US-005; BR-010 |
| **FR-014** | **Log pendaftaran** — mencatat aksi menambahkan & membatalkan pasien/order. | US-005; BR-011 |
| **FR-015** | **Cetak kartu pasien.** | US-006; BR-013 |
| **FR-016** | **Buat billing baru** untuk pendaftaran ulang (mock). | US-006; BR-014 |
| **FR-017** | **List pasien terdaftar penunjang** — ditampilkan di dashboard yang digabung dengan Pendaftaran RJ. | US-007 |
| **FR-018 `[**]`** | **Fase 2** — siapkan data label spesimen dari sistem (cetak masih dari LIS pada fase ini). | US-004; BR-015 |
| **FR-019 `[**]`** | **Fase 2** — pendaftaran pasien dengan booking order lab sebelumnya (recall/menyambungkan order dokter). | US-001; BR-001 |
| **FR-020 `[ASUMSI]`** | Mode offline — order disimpan lokal lalu disinkronkan ke LIS/SATUSEHAT saat online. | BR-016 |

## 11. User Stories

> Prioritas per fitur (P0/P1) dipertahankan dari sumber. Fitur ber-`[**]` = Fase 2.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001 (P0)** | Sebagai **petugas**, saya ingin **mendaftarkan pasien ke penunjang lewat jalur yang sesuai sumber order & penjaminnya**, sehingga **order tercatat benar dan tidak berisiko ditolak**. | 1) Given seksi Penunjang, When klik **+ Penunjang**, Then modal Pilih Pemeriksaan Penunjang terbuka (Lab/PA/Radiologi); Lanjut nonaktif sampai satu jenis dipilih; Batal menutup tanpa membuat order (FR-001). 2) Given jenis dipilih, When Lanjut, Then form order sesuai jenis terbuka; data pasien & penjamin mengikuti RJ, tidak diinput ulang (BR-002). 3) Then daftar pemeriksaan disaring sesuai penjamin dari master data aktif (BR-003). 4) Then order tersimpan tampil sebagai baris di tabel Penunjang (No. \| Layanan Penunjang \| No. Order \| Tanggal Pemeriksaan \| Dokter Pengirim \| Aksi) (FR-011). | FR-001, FR-002, FR-003, FR-011; BR-001, BR-002, BR-003 |
| **US-002 (P1)** | Sebagai **petugas pendaftaran**, saya ingin **memilih pemeriksaan lab dari katalog**, sehingga **order tercatat dan pasien memperoleh antrean**. | 1) Given form order Lab, When buka katalog, Then tampil berkelompok per Layanan Induk (Hematologi, Kimia Klinik, Imuno-serologi, Urinalisa, dst.) + pencarian; kelompok dibuka/tutup; centang >1 (FR-004). 2) Given isian, Then Tanggal Pemeriksaan default hari ini, Prioritas default Reguler, Dokter Pengirim default "-"; semua opsional kecuali pemeriksaan (FR-005). 3) When SIMPAN tanpa pemeriksaan, Then ditolak (min. 1 pemeriksaan) (BR-006). 4) When SIMPAN valid, Then Nomor Order dibuat otomatis; status "Belum Diproses"; muncul di tabel Penunjang & menu Lab tab "Belum Diproses" (BR-005, BR-008). | FR-004, FR-005, FR-006, FR-009, FR-010; BR-005, BR-006, BR-008 |
| **US-003 (P1)** | Sebagai **petugas**, saya ingin **membuat order PA secara ringkas**, sehingga **order PA tercatat**. | 1) Given form PA, Then jenis PA dipilih dari master (Jenis = Patologi Anatomi); Nomor Order dibuat otomatis (BR-005). 2) Then isian inti: Jenis Pemeriksaan, Jaringan Tubuh (Biopsi/Extirpasi/Operasi/Kerokan/Pungsi), Keterangan Pungsi (bila Pungsi), Lokalisasi, Diagnosis Klinik; bagian tambahan muncul sesuai Jenis Pemeriksaan (Sitologi Sediaan/Keganasan/Keganasan Pap Smear) (BR-012). 3) When SIMPAN tanpa jenis PA, Then ditolak (BR-007). 4) When SIMPAN valid, Then order "Belum Diproses" + antrean + muncul di tabel Penunjang (BR-008). | FR-007, FR-008, FR-009, FR-010; BR-007, BR-008, BR-012 |
| **US-004 `[**]`** | Sebagai **petugas**, saya ingin **sistem menyiapkan label spesimen**, sehingga **pasien dapat teridentifikasi benar**. | 1) `[**]` Given order tersimpan, Then sistem menyiapkan data label: min. 2 identitas (Nama + Tgl Lahir), No. RM, barcode Nomor Order, jenis pemeriksaan (BR-015). 2) `[**]` Then pada fase ini label masih dicetak dari LIS. | FR-018; BR-015 |
| **US-005** | Sebagai **petugas pendaftaran**, saya ingin **membatalkan registrasi penunjang pasien yang belum dilayani sekaligus membatalkan order lab-nya**, sehingga **data bersih**. | 1) Given order "Belum Diproses", When batalkan, Then sistem minta alasan; registrasi & order ke Lab dibatalkan; tercatat di log (BR-010, BR-011). 2) Given order "Sedang Diproses"/"Selesai", Then tidak dapat dibatalkan dari pendaftaran (BR-010). | FR-013, FR-014; BR-010, BR-011 |
| **US-006** | Sebagai **petugas pendaftaran**, saya ingin **mencetak kartu pasien dan membuat billing untuk pendaftaran ulang**, sehingga **administrasi pasien lengkap**. | 1) Then petugas dapat mencetak kartu pasien (BR-013). 2) Given pendaftaran ulang, When buat billing, Then sistem membuat billing baru (mock) (BR-014). | FR-015, FR-016; BR-013, BR-014 |
| **US-007** | Sebagai **petugas pendaftaran**, saya ingin **melihat list pasien yang terdaftar penunjang**, sehingga **saya bisa memantau & menindaklanjuti**. | 1) Then list pasien terdaftar penunjang tampil di dashboard yang digabung dengan Pendaftaran RJ (FR-017). | FR-017 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi & penjamin **reuse definisi kanonik dari B1 (Pendaftaran Rawat Jalan)** — nama, tipe, format, validasi **harus sama**. **Dashboard digabung dengan Pendaftaran RJ**; detail Data Requirement dashboard mengikuti Pendaftaran RJ.
> Catatan mockup: form order (page 7 "Permintaan Pemeriksaan Laboratorium") dan modal "Laboratorium" (page 8) sebagai referensi tampilan. Harapannya tampilan order penunjang di pendaftaran mirip Order Penunjang Lab — **bukan** seperti pendaftaran lab saat ini.

### A. DR-1 — Order Penunjang (FR-005, FR-009, FR-010)
| # | Field | Wajib | Pilihan/Format | Sumber/Default | Catatan |
|---|-------|-------|----------------|----------------|---------|
| 1 | **Nomor Order** | Mandatory | Tanggal + nomor urut harian (reset tiap hari) — contoh `2606175002` | Dibuat otomatis oleh sistem | BR-005; FR-009 |
| 2 | **Nomor Registrasi/Kunjungan** | Mandatory | — | Modul Pendaftaran (kunjungan aktif) | Penghubung order ke kunjungan pasien. **Tidak tampil di form order**, tampil di dashboard Pendaftaran RJ |
| 3 | **No. RM** | Mandatory | — | Data pasien (RM tunggal) | Mengikuti RM pasien; tidak ada RM khusus lab |
| 4 | **Tanggal Order** | Mandatory | — | Default: tanggal & jam saat order dibuat | — |
| 5 | **Tanggal Pemeriksaan** | Mandatory | — | Default: hari ini (dapat diubah) | — |
| 6 | **Jenis** | Mandatory | Lab Klinik / Patologi Anatomi | — | — |
| 7 | **Jenis Penjamin** | Mandatory | Umum / Asuransi / BPJS | Dipilih di Pendaftaran RJ — hanya melanjutkan dari RJ | Menentukan aturan jalur (lihat Pola Umum — Jalur Masuk & Penjamin); BR-002 |
| 8 | **Referensi SEP/Episode** | Mandatory (BPJS); Optional (Umum/APS) | — | SEP/episode kunjungan BPJS | Error "Order BPJS harus terkait order dokter/episode" bila kosong pada BPJS. _Sesuai pendaftaran integrasi — dibahas saat bridging BPJS_ `[**]`; BR-004 |
| 9 | **No. Kartu/Polis Asuransi** | Optional | — | Surat jaminan penjamin/asuransi | Sesuai Pendaftaran RJ — hanya melanjutkan dari RJ |
| 10 | **Status** | Mandatory | Belum Diproses / Sedang Diproses / Selesai | Default: Belum Diproses | Pendaftaran hanya membuat "Belum Diproses"; BR-009 |
| 11 | **Prioritas Pemeriksaan** | Optional | CITO / Reguler | Default: Reguler | — |
| 12 | **Diagnosa Sementara (ICD-10)** | Optional | — | Master ICD-10 | Boleh lebih dari satu |
| 13 | **Dokter Pengirim** | Optional (calon wajib Phase 2) | — | Master dokter aktif; Default "-" | Dapat dilengkapi di lab; Phase 2 sebagai perujuk di SATUSEHAT `[**]` |
| 14 | **Catatan Khusus** | Optional | — | Manual | Contoh: puasa, instruksi persiapan |
| 15 | **Daftar Pemeriksaan (baris item)** | Mandatory (min. 1 untuk Lab Klinik) | — | Master pemeriksaan aktif (disaring sesuai penjamin) | Tiap baris = satu item katalog; BR-003, BR-006 |

### B. DR-2 — Label Spesimen & Isian Khusus Patologi Anatomi
| # | Data | Ketentuan |
|---|------|-----------|
| 1 | **Label Spesimen/Barcode** `[**]` | Disiapkan pendaftaran, ditempel lab. Isi: min. 2 identitas (Nama + Tgl Lahir), No. RM, barcode Nomor Order, jenis pemeriksaan. Contoh label menyusul; saat ini user print dari LIS (next phase) — hanya disiapkan bahwa akan ada label spesimen. |
| 2 | **Isian klinis PA (order jenis PA)** | Isian inti (calon wajib, validasi tim lab PA): Jenis Pemeriksaan; Jaringan Tubuh Yang Diperoleh (Biopsi/Extirpasi/Operasi/Kerokan/Pungsi); Keterangan Pungsi (bila Pungsi); Lokalisasi; Diagnosis Klinik. Optional: Keterangan Klinik. Bagian tambahan (muncul sesuai Jenis Pemeriksaan): Sitologi Sediaan; Keganasan; Keganasan Pap Smear. Sumber Data: dokter pengirim (EMR/modul PA). `[PERLU KONFIRMASI: cek referensi dari V1]` |

### C. DR-3 — Master Pemeriksaan (dikelola di Master Data / Control Panel)
> Detail ada pada Master Data Layanan & Master Data Lab; di sini hanya menunjukkan keterkaitannya.

| # | Data | Wajib | Pilihan/Contoh | Catatan |
|---|------|-------|----------------|---------|
| 1 | Nama Pemeriksaan | Mandatory | APTT, Gula Darah Puasa, HbA1c | — |
| 2 | Layanan Induk / Kategori | Mandatory | Hematologi, Kimia Klinik, dll | Kelompok yang bisa dibuka-tutup di daftar pilih pemeriksaan |
| 3 | Jenis | Mandatory | Lab Klinik / Patologi Anatomi / (Radiologi menyusul) | — |
| 4 | Kode LIS | Optional (Phase 2) `[**]` | — | Kunci penghubung ke sistem lab (LIS) |
| 5 | Kode LOINC | Optional (Phase 2) `[**]` | — | Kode standar nasional/SATUSEHAT |
| 6 | Panel / Paket | Optional | — | Penanda paket; dipakai untuk paket APS |
| 7 | Tarif & pemetaan per penjamin | Mandatory | — | Sumber: Billing / Master Tarif; menentukan daftar pemeriksaan sesuai jenis penjamin |
| 8 | Status Aktif | Mandatory | Aktif / Nonaktif | Yang nonaktif tidak muncul di daftar pilih |

### D. Tabel Penunjang (tampil di form pendaftaran) — FR-011
| Kolom | Sumber Data | Catatan |
|-------|-------------|---------|
| No. | urut baris | — |
| Layanan Penunjang | Jenis order (Lab Klinik/PA) | — |
| No. Order | order.nomor_order | Dibuat otomatis (BR-005) |
| Tanggal Pemeriksaan | order.tanggal_pemeriksaan | Default hari ini |
| Dokter Pengirim | order.dokter_pengirim | Default "-" |
| Aksi | — | Termasuk batal (hanya "Belum Diproses") |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Loading dashboard maks. 1 detik. | Metrik; FR-017 |
| **NFR-002** | Performa | Loading pagination < 1 detik. | Metrik |
| **NFR-003** | Performa | Pencarian pasien < 1 detik. | Metrik |
| **NFR-004** | Performa | Proses pendaftaran pasien maks. 1 detik. | Metrik; FR-010 |
| **NFR-005** | Skalabilitas | Menampung 30–50 pasien/hari; ±300–400 pasien/bulan. | Behavior sumber |
| **NFR-006** | Auditabilitas | Mencatat aktivitas pendaftaran (tambah/batal) di log. | BR-011; FR-014 |
| **NFR-007** | Konsistensi UI | Tampilan order penunjang di pendaftaran harus mirip Order Penunjang Lab — bukan seperti pendaftaran lab v1. | Catatan sumber |
| **NFR-008 `[ASUMSI]`** | Reliabilitas | Mode offline berfungsi; order tersimpan lokal & tersinkron ke LIS/SATUSEHAT saat online. | BR-016; FR-020 |

## 14. Integrasi Eksternal & Dependency

> Fase 1 MVP memakai sejumlah **mock** yang dinyatakan eksplisit di sumber (proses order tergenerate, keterbacaan booking order sebelumnya, billing, list pemeriksaan Lab & PA).

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Disdukcapil** | Opsi bridging saat input pasien baru. | Live (RJ) — `[ASUMSI dari g-admisi-onsite-registration]` | §6.B.1 |
| **BPJS VClaim (SEP/Episode)** | Referensi SEP/Episode untuk order BPJS. | `[**]` Saat bridging BPJS | BR-004; FR-012 |
| **SATUSEHAT / LIS** | Sinkronisasi order (mode offline) & label; Dokter Pengirim sebagai perujuk. | `[**]` / `[ASUMSI]` offline | FR-020; DR-1.13 |
| **Modul Laboratorium (Order Penunjang)** | Tujuan order ("Belum Diproses"); detail form order; recall. | Internal (recall = `[**]`) | BR-008 |
| **Billing / Master Tarif** | Generate billing pendaftaran ulang; tarif & pemetaan penjamin. | Mock (billing Fase 1) | FR-016; DR-3.7 |
| **Master Data Layanan & Master Data Lab** | Sumber master pemeriksaan (Lab/PA), kategori, status aktif. | Internal (list = mock Fase 1) | DR-3 |
| **List pemeriksaan Lab & PA** | Katalog pemeriksaan yang tampil. | Mock (Fase 1, dinyatakan sumber) | FR-003, FR-004 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| B1 — Pendaftaran Rawat Jalan | Hard | Identifikasi pasien, penjamin/SEP, dan dashboard gabungan tidak berfungsi. |
| Modul Laboratorium / Order Penunjang | Hard (tujuan order) | Order "Belum Diproses" tidak punya penerima; detail form order & recall tertunda. |
| Master Data Layanan & Master Data Lab | Hard | Katalog pemeriksaan & penyaringan per penjamin tidak tersedia. |
| Billing / Master Tarif | Soft (Fase 1 mock) | Billing pendaftaran ulang belum riil (masih mock). |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| **D-01** | Pendaftaran pasien dengan booking order lab sebelumnya (recall) | Ditunda ke **next phase** agar dikerjakan sekalian dengan modul Lab — dikonfirmasi dengan mba Fitri (Nur Fitri). (BR-001; FR-019 `[**]`) |

## 16. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Daftar pasien baru/lama ke Lab Klinik & PA (buat order baru); list pasien terdaftar penunjang; batal order "Belum Diproses" (ikut batalkan order ke Lab); cetak kartu pasien; billing pendaftaran ulang (mock); log pendaftaran. |
| **Fase 2** `[**]` | Pendaftaran pasien dengan booking order lab sebelumnya (recall); cetak label spesimen dari sistem; kode LIS & LOINC; bridging BPJS (SEP/Episode via VClaim); integrasi SATUSEHAT; Dokter Pengirim sebagai perujuk. |

## 17. Asumsi

- `[ASUMSI]` Antrean penunjang & label spesimen pada v1 sering manual → rawan salah identitas (dari analogi `g-admisi-onsite-registration` & catatan UX Lampiran).
- `[ASUMSI]` Opsi bridging Disdukcapil saat input pasien baru (dari `g-admisi-onsite-registration`).
- `[ASUMSI]` Blok To-Be diturunkan dari Lampiran + analogi BPMN (belum ada BPMN modul B4 sendiri).
- `[ASUMSI]` Mode offline berfungsi; order tersimpan lokal & sinkron ke LIS/SATUSEHAT saat online.
- `[ASUMSI: opsional]` Paket pemeriksaan (mis. Paket Operasi) pada katalog Lab.

## 18. Pertanyaan Terbuka

- `[PERLU KONFIRMASI]` Mekanisme pendaftaran pasien dengan booking order lab sebelumnya (recall) belum final — dikerjakan next phase bersama modul Lab.
- `[PERLU KONFIRMASI]` Referensi field klinis PA perlu dicek dari V1 ("cek referensi dari V1").
- `[PERLU KONFIRMASI]` Target rilis produksi/kuartal belum dinyatakan di sumber (window pengerjaan 29 Jun–3 Jul 2026).
- `[PERLU KONFIRMASI]` Contoh/format label spesimen menyusul (saat ini dicetak dari LIS).
- `[PERLU KONFIRMASI]` Detail form order mengikuti fitur Order Penunjang — perlu dipastikan sinkron saat dokumen tersebut final.

## 19. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 0.9 | 10 Jun 2026 | Team Product | Draft awal Pendaftaran Penunjang (Lab & PA). |
| 2.0 | 01 Jul 2026 | Team Product | Konversi ke format generator Neurovi v2 (MD): penomoran BR/US/FR/NFR + Trace; ditambah section State Machine, Keputusan Desain, Roadmap; prioritas P0/P1 dan penanda `[**]`/`[ASUMSI]`/`[PERLU KONFIRMASI]` dipertahankan dari sumber. |
