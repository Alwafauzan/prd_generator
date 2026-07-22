# PRD — Dashboard Pelayanan Terapi
### Fisioterapi · Terapi Wicara · Okupasi Terapi

| | |
|---|---|
| **Kode Dokumen** | PRD-P-DSH-TRP-v1.3 *(provisional — mohon konfirmasi penamaan)* |
| **Modul** | Penunjang Medis — Pelayanan Terapi |
| **Status** | DRAFT — Belum disetujui |
| **Approver** | M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) |
| **PIC PRD** | Tim Product |
| **Tim Pelaksana** | Tim Pradev |
| **Target Hospital** | RS Tipe C/D (MVP) — referensi RS PKU Muhammadiyah Wonosobo |
| **Referensi V1** | `staging.pkuwsb.neurovi/penunjang-medis/{fisioterapi \| terapi-wicara \| terapi-okupasi}` |
| **Referensi Struktur** | PRD-P-DSH-RJ (Dashboard Pelayanan RJ), PRD-P-DSH-HD (Dashboard Hemodialisa) |

> **Cakupan dokumen.** Satu PRD ini berlaku untuk **tiga unit terapi** yang tipe layanannya identik: **Fisioterapi**, **Terapi Wicara**, dan **Okupasi Terapi**. Perbedaan antar unit hanya pada label unit, jenis tindakan/tarif, dan terapis penanggung jawab — perilaku dashboard sama persis. Istilah generik **"[Terapi]"** merujuk ke unit aktif (mis. `As. [Terapi]` = `As. Fisioterapi` / `As. Terapi Wicara` / `As. Okupasi Terapi`).

---

## Riwayat Revisi

| Versi | Tanggal | Author | Perubahan |
|---|---|---|---|
| 1.0 | 7 Jul 2026 | Tim Product | Draft awal — adaptasi struktur Dashboard HD/RJ; kohort RJ/RI via tab; asesmen tunggal oleh terapis. |
| 1.1 | 7 Jul 2026 | Tim Product | E-Resep & Surat Kontrol dikembalikan; resolusi OQ-01..04; BR-020 (Bayar = cerminan billing). |
| 1.2 | 7 Jul 2026 | Tim Product | Struktur sub-resep E-Resep dilepas ke PRD E-Resep (BR-012). |
| 1.3 | 7 Jul 2026 | Tim Product | **Surat Kontrol = bi-state** (Belum/Sudah Dibuat), bukan tri-state (BR-023). **Kolom Surat Kontrol dihapus dari tab RI**. Penanda tidak-berlaku memakai **"—"** (bukan label "N/A"). **OQ-C selesai**: disposisi keluar seragam untuk ketiga unit, detail di PRD terpisah. |

---

## 1. Ringkasan

### 1.1 Latar Belakang

Dashboard Pelayanan Terapi V1 (production) sudah berjalan sebagai tampilan utama unit Fisioterapi, Terapi Wicara, dan Okupasi Terapi untuk mengelola pasien harian. Mengikuti pola perbaikan pada Dashboard Pelayanan RJ (V2) dan Dashboard Hemodialisa (V2), V1 terapi memiliki keterbatasan berikut:

- **Rujuk Internal** ditampilkan sebagai kolom aksi tunggal, belum menjadi kolom **Status Tindak Lanjut** yang menampung seluruh disposisi keluar pasien secara konsisten dengan dashboard lain.
- **Kohort pasien tidak terpisah.** Unit terapi melayani pasien **Rawat Jalan (RJ)** dan pasien **Rawat Inap (RI)** yang dikirim dari bangsal. Keduanya punya perlakuan keluar & billing yang berbeda, tetapi V1 menampilkannya dalam satu daftar tanpa pemisah maupun penanda asal.
- Checkpoint status sebagian belum mencerminkan progres "sedang diproses".

### 1.2 Sasaran V2

Menyelaraskan dashboard terapi dengan standar dashboard pelayanan yang sudah disepakati: **(1)** pemisahan & kejelasan kohort RJ/RI, **(2)** kolom disposisi keluar terkonsolidasi (Status Tindak Lanjut), dan **(3)** integritas billing/casemix melalui checkpoint yang akurat + auto-penyelesaian yang aman.

---

## 2. Tujuan & Metrik

| Tujuan | Metrik Keberhasilan |
|---|---|
| Kohort RJ/RI jelas & tidak tertukar | 100% pasien RI menampilkan Asal Unit; 0 kasus pasien RI ter-*discharge* RS secara keliru. |
| Disposisi keluar tercatat konsisten | 100% pasien selesai memiliki Status Tindak Lanjut terisi (otomatis/manual). |
| Status checkpoint akurat & real-time | Checkpoint tampil ≤ 3 detik dari event modul sumber. |
| Akurasi hitungan layanan harian | Selisih "pasien dilayani" vs kunjungan tervalidasi casemix < 1%. |

---

## 3. Scope

### 3.1 In Scope
- Dashboard daftar pasien harian per unit terapi (Fisioterapi / Terapi Wicara / Okupasi Terapi).
- Pemisahan kohort **RJ** dan **RI** via **tab**, dengan counter & nomor antrian independen per tab.
- Kolom checkpoint: **As. [Terapi], Tindakan, Lab, Radiologi, E-Resep, Bayar** (tri-state) + **Surat Kontrol** (bi-state, tab RJ saja).
- Kolom **Status Tindak Lanjut** (menggantikan kolom Rujuk Internal V1) beserta modal disposisi keluar.
- Kolom **Asal Unit** khusus tab RI.
- Filter tanggal (default hari ini), filter terapis, filter sesi/shift; pencarian.
- Penanda **SEP** (BPJS) & **prioritas** pada baris pasien.
- Job **auto-penyelesaian** harian sesuai kriteria yang disepakati.

### 3.2 Out of Scope
- Isi form Asesmen [Terapi] & Input Tindakan/BHP (PRD tersendiri).
- Isi & struktur form E-Resep (termasuk sub-resep/CPO) dan Surat Kontrol — dashboard hanya membaca status; detail di **PRD E-Resep** & **PRD Surat Kontrol**.
- **Detail form & aturan disposisi keluar** (Pulang/Selesai Sesi/Rujuk Internal/Rujuk Eksternal) — dashboard hanya men-*trigger* & menampilkan status; detail di **PRD Konsul/Rujuk Internal / PRD Discharge**.
- Alur order/registrasi pasien terapi (dari poli RJ maupun order dari bangsal RI) — *dependency*.
- Modul billing/kasir & casemix (dashboard hanya membaca status).
- Unit **Psikologi** — tipe layanan mirip namun di luar batch ini *(kandidat reuse PRD ini di fase berikutnya)*.

---

## 4. Dependencies & Stakeholders

| Jenis | Item |
|---|---|
| **Dependency (hulu)** | Order layanan terapi dari **Poli RJ** (membawa data kunjungan RJ) & **Order dari Ranap/bangsal** (membawa data **Asal Unit**). |
| **Dependency (modul)** | PRD Asesmen [Terapi], PRD Input Tindakan & BHP, **PRD E-Resep**, **PRD Surat Kontrol**, **PRD Konsul/Rujuk Internal / Discharge**, Modul Billing/Kasir, MD Jadwal Praktik/Shift Terapis, MD Staf (terapis). |
| **Konsumen data** | Casemix (klaim), reporting layanan penunjang, handover shift. |
| **Stakeholder** | Terapis (user utama), Kepala unit rehab/penunjang, Kasir, Casemix, DPJP/dokter perujuk. |

---

## 5. Layout Dashboard (Delta V1 → V2)

### 5.1 Perubahan Kolom

| Kolom V1 | V2 | Keterangan |
|---|---|---|
| No. Antrian | **Tetap** | Independen per tab RJ/RI. |
| Nama (+ badge SEP) | **Tetap** | Tambah badge **Prioritas** bila berlaku. |
| No. RM | **Tetap** | |
| Cara Pembayaran | **Tetap** | |
| Klinik (unit + terapis) | **Tetap** | Label: **Unit & Terapis** — nama unit + terapis penanggung jawab. |
| As. [Terapi] | **Tetap → tri-state** | Checkpoint asesmen tunggal oleh terapis. |
| Tindakan | **Tetap → tri-state** | Tindakan & BHP; sumber tarif/tagihan. |
| Lab | **Tetap → tri-state** | Tampil **—** bila tak ada order. |
| Radiologi | **Tetap → tri-state** | Tampil **—** bila tak ada order. |
| E-Resep | **Tetap → tri-state** | **Dipertahankan.** Dashboard membaca **status agregat** dari modul E-Resep (struktur sub-resep di **PRD E-Resep**). |
| Surat Kontrol | **Tetap → bi-state** | **Bi-state** (Belum Dibuat / Sudah Dibuat). Mekanisme jadwal **sesi terapi lanjutan**. **Kolom dihapus pada tab RI.** |
| Bayar | **Tetap → tri-state** | Cerminan status billing (BR-020). |
| Rujuk Internal | **→ Status Tindak Lanjut** | Dilebur menjadi kolom disposisi keluar (Rujuk Internal jadi salah satu pilihan). |
| — | **+ Asal Unit** | **Baru**, khusus tab **RI**. |

### 5.2 Susunan Kolom Final

**Tab RJ (13 kolom):** No. Antrian · Nama · No. RM · Cara Pembayaran · Unit & Terapis · As. [Terapi] · Tindakan · Lab · Radiologi · E-Resep · **Surat Kontrol** · Bayar · **Status Tindak Lanjut**

**Tab RI (13 kolom):** No. Antrian · Nama · No. RM · Cara Pembayaran · **Asal Unit** · Unit & Terapis · As. [Terapi] · Tindakan · Lab · Radiologi · E-Resep · Bayar · **Status Tindak Lanjut**

> **Checkpoint per tab.** RJ = 7 (6 tri-state + Surat Kontrol bi-state). RI = 6 (tanpa Surat Kontrol; **kolom Surat Kontrol tidak ditampilkan di tab RI**). Sel yang tidak berlaku ditampilkan sebagai tanda **"—"** (tanpa label "N/A").

### 5.3 Header & Filter (mengikuti Dashboard HD)
- Counter 3-state **per tab**: *Dilayani · Belum dilayani · Total* (real-time dari agregasi checkpoint, bukan field statis).
- Filter **Tanggal** (default hari ini, server WIB), **Terapis**, **Sesi/Shift** (additive/AND terhadap tanggal, dievaluasi dalam tab aktif), + pencarian nama/RM.
- **Pasien per halaman**: default mengikuti standar dashboard *(usul: 15 — konfirmasi)*.

---

## 6. Alur Proses (Business Process)

### 6.1 Pasien RJ (Rawat Jalan)
Order terapi dari **Poli RJ** → masuk antrian **tab RJ**
→ Asesmen [Terapi] → Tindakan & BHP (+ order Lab/Rad/E-Resep bila ada) → Surat Kontrol (bila perlu sesi lanjutan)
→ Bila kriteria auto (BR-013) terpenuhi → **Pulang** (akhiri kunjungan RJ).

### 6.2 Pasien RI (Rawat Inap)
Order terapi dari **bangsal/Ranap** (membawa **Asal Unit**) → masuk antrian **tab RI**
→ Asesmen [Terapi] → Tindakan & BHP (+ order bila ada)
→ Bila kriteria auto (BR-013) terpenuhi → aksi **"Selesai Sesi Terapi"** → pasien **kembali ke bangsal (Asal Unit)**; **episode rawat inap tetap aktif** (bukan discharge RS).

### 6.3 Perbedaan Perlakuan Keluar RJ vs RI

| Aspek | Pasien RJ | Pasien RI |
|---|---|---|
| Syarat auto (BR-013) | As. [Terapi] + Tindakan = Selesai | (sama) |
| Aksi sistem | **Pulang** (akhiri kunjungan RJ) | **Selesai Sesi Terapi** → kembali ke bangsal |
| Efek status RI | — | **Tidak** men-*discharge* dari RS; episode RI tetap aktif |
| Aliran data | Casemix & reporting kunjungan RJ | Sesi terapi tercatat pada episode rawat inap |
| Kolom Surat Kontrol | Berlaku (bi-state) | **Kolom dihapus** |
| Kolom Asal Unit | — | Berlaku |

### 6.4 Catatan E-Resep
Dashboard hanya menampilkan **status agregat** E-Resep. Struktur sub-resep, routing tujuan farmasi (RJ/RI), dan aturan agregasinya merupakan scope **PRD E-Resep** — bukan dashboard ini.

---

## 7. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Dashboard hanya menampilkan pasien dengan tanggal layanan terapi = filter tanggal aktif. |
| BR-002 | Default tanggal layanan = hari ini (server date WIB). |
| BR-003 | Pasien dipisah ke tab **RJ** atau **RI** berdasarkan jenis rawat saat masuk antrian terapi; masing-masing punya nomor urut/antrian independen. |
| BR-004 | Filter terapis & sesi/shift bersifat *additive* (AND) terhadap filter tanggal, dievaluasi dalam tab aktif. |
| BR-005 | Counter status per tab (3-state) dihitung real-time dari agregasi checkpoint, bukan field statis. |
| BR-006 | Penanda **SEP** hanya dievaluasi untuk pasien dengan `cara_bayar` mengandung "BPJS"; pasien non-BPJS menampilkan kolom kosong (validasi warning, bukan hard block). |
| BR-007 | Penanda **prioritas** aktif bila `data_sosial.kartu_prioritas == "Ya"` pada tanggal pendaftaran. |
| BR-008 | Checkpoint **As. [Terapi], Tindakan, Lab, Radiologi, E-Resep, Bayar** bertipe **tri-state**: Tidak Diisi → Sedang Diproses → Selesai. Checkpoint **Surat Kontrol** bertipe **bi-state** (lihat BR-023). |
| BR-009 | Checkpoint asesmen bersifat **tunggal** (diisi terapis); **tidak ada** pemisahan As. Dokter / As. Perawat pada dashboard ini. |
| BR-010 | Checkpoint yang tidak relevan untuk pasien tertentu ditampilkan sebagai tanda **"—"** (bukan label "N/A"); **tidak boleh** otomatis Selesai. |
| BR-011 | Status checkpoint **read-only** di dashboard; sumber kebenaran tetap di modul masing-masing (event-driven). |
| BR-012 | Kolom **E-Resep** menampilkan **status agregat** dari modul E-Resep (Selesai bila seluruh sub-resep relevan sudah selesai). **Struktur sub-resep & routing farmasi merupakan scope PRD E-Resep**, bukan dashboard. |
| BR-013 | Job **auto-penyelesaian** hanya memproses pasien dengan **As. [Terapi] + Tindakan = Selesai** DAN Status Tindak Lanjut = null. (E-Resep, Surat Kontrol, Lab, Radiologi, Bayar **bukan** syarat auto.) |
| BR-014 | Pasien dengan Status Tindak Lanjut yang sudah ter-set manual **di-exclude** dari job auto-penyelesaian (manual override menang). |
| BR-015 | **Pasien RJ** yang memenuhi BR-013 → aksi **Pulang** (akhiri kunjungan RJ). **Pasien RI** → aksi **Selesai Sesi Terapi** (kembali ke bangsal, episode RI tetap aktif — bukan discharge RS). |
| BR-016 | **Rujuk Internal** dari unit terapi ke poli/unit lain (mis. Fisioterapi → Okupasi Terapi, atau kembali ke poli perujuk) di-set melalui modal Status Tindak Lanjut; pasien tetap tampil di unit asal (badge penanda), tidak hilang. |
| BR-017 | Kolom **Asal Unit** wajib terisi untuk seluruh pasien tab RI (bersumber dari order Ranap); tidak berlaku untuk tab RJ. |
| BR-018 | Setiap perubahan Status Tindak Lanjut & eksekusi auto-penyelesaian tercatat di **audit log** (aktor/sistem, timestamp, before/after). |
| BR-019 | Makna **"Sedang Diproses"**: **Grup A** (As. [Terapi], Tindakan, Bayar) = form dibuka belum disimpan (tanpa menu draft); **Grup B** (Lab, Radiologi, E-Resep) = order terkirim ke unit terkait, belum final. *(Surat Kontrol bi-state — tidak punya state Sedang Diproses.)* |
| BR-020 | Checkpoint **Bayar** murni **cerminan status billing** kunjungan/sesi terapi. Apakah tagihan **dipisah** (mandiri per sesi) atau **digabung** (konsolidasi dengan tagihan bangsal/rawat inap) adalah **pengaturan pada modul Billing**, bukan pada dashboard. Dashboard hanya mengikuti: Sedang Diproses = form bayar dibuka belum final; **Selesai = tagihan yang relevan sudah lunas di billing**. Berlaku untuk kohort RJ maupun RI. |
| BR-021 | **Tindakan & BHP wajib terisi** sebagai sumber data tarif/tagihan layanan sehingga menjadi salah satu syarat auto-penyelesaian (BR-013). |
| BR-022 | Cut-off job auto-penyelesaian bersifat fixed pukul 23:59 WIB. `[ASUMSI — mengikuti Dashboard RJ]` |
| BR-023 | Checkpoint **Surat Kontrol** bertipe **bi-state**: **Belum Dibuat / Sudah Dibuat** (bukan tri-state). Berlaku pada kohort **RJ** sebagai mekanisme jadwal sesi lanjutan; pada **tab RI kolom Surat Kontrol dihapus** (tidak ditampilkan). |
| BR-024 | Disposisi keluar (Status Tindak Lanjut) berlaku **seragam** untuk ketiga unit terapi; **detail form & aturan** disposisi didefinisikan di PRD terpisah (Konsul/Rujuk Internal / Discharge). |

---

## 8. State Machine — Checkpoint

### 8.1 Tipe Checkpoint
| Checkpoint | Tipe | State |
|---|---|---|
| As. [Terapi], Tindakan, Lab, Radiologi, E-Resep, Bayar | **Tri-state** | Tidak Diisi (—) → Sedang Diproses (kuning) → Selesai (hijau) |
| Surat Kontrol *(RJ saja)* | **Bi-state** | Belum Dibuat (—) → Sudah Dibuat (hijau) |

Transisi event-driven, read-only di dashboard. Checkpoint tak relevan tetap **"—"** (BR-010). Pada tab RI, kolom Surat Kontrol dihilangkan (BR-023).

### 8.2 Definisi "Sedang Diproses" — Tri-state (BR-019)
| Grup | Checkpoint | "Sedang Diproses" berarti |
|---|---|---|
| A | As. [Terapi], Tindakan, Bayar | Form dibuka, belum disimpan (tanpa mekanisme draft). |
| B | Lab, Radiologi, E-Resep | Order terkirim ke unit terkait, hasil/pemenuhan belum final. |

### 8.3 Status Tindak Lanjut (Disposisi Keluar)
Kolom dedicated sebelum kolom aksi. Nilai (badge):

| Disposisi | Berlaku | Efek |
|---|---|---|
| **Selesai / Pulang** | RJ | Akhiri kunjungan RJ. Dapat otomatis via BR-013 atau manual. |
| **Selesai Sesi Terapi** | RI | Kembali ke bangsal (Asal Unit); episode RI tetap aktif. |
| **Rujuk Internal** | RJ & RI | Rujuk ke poli/unit lain. |
| **Rujuk Eksternal** | RJ & RI | Set badge; surat rujukan di modul terkait. `[ASUMSI — jarang]` |
| *(kosong)* | — | Placeholder "—" bila belum ada disposisi. |

> Disposisi berlaku **seragam** untuk ketiga unit; **detail form & aturan** (validasi, generate surat, chaining) didefinisikan di **PRD Konsul/Rujuk Internal / Discharge** (BR-024). Dashboard hanya men-*trigger* & menampilkan status.

---

## 9. Functional Requirements (ringkas)

| ID | Judul | Deskripsi |
|---|---|---|
| FR-01 | Tab kohort RJ/RI | Toggle tab dengan counter & antrian independen (BR-003, BR-005). |
| FR-02 | Daftar pasien harian | Render pasien per tanggal & tab, urut No. Antrian ASC. |
| FR-03 | Checkpoint | Render 6 checkpoint tri-state + Surat Kontrol bi-state (RJ); tab RI tanpa kolom Surat Kontrol (BR-008/010/011/023). |
| FR-04 | Kolom Asal Unit (RI) | Tampilkan asal bangsal untuk seluruh baris tab RI (BR-017). |
| FR-05 | Badge SEP & Prioritas | Sesuai BR-006/BR-007. |
| FR-06 | Filter & pencarian | Tanggal, terapis, sesi/shift (AND), + search nama/RM (BR-004). |
| FR-07 | Kolom Status Tindak Lanjut | Render disposisi + placeholder (§8.3). |
| FR-08 | Modal disposisi keluar | Set Selesai/Pulang, Selesai Sesi, Rujuk Internal, Rujuk Eksternal (BR-015/016/024). |
| FR-09 | Auto-penyelesaian harian | Job cut-off memproses pasien per BR-013/014/015/022. |
| FR-10 | Popover detail pasien | Hover/klik nama → info pendaftaran (mengikuti Dashboard RJ FR-11). `[ASUMSI]` |

---

## 10. User Stories (Given–When–Then, contoh utama)

| ID | Story |
|---|---|
| US-01 | **Given** pasien RJ dengan semua checkpoint kosong, **when** terapis membuka form Asesmen [Terapi] tanpa simpan, **then** checkpoint As. [Terapi] = Sedang Diproses (kuning). |
| US-02 | **Given** pasien RJ dengan As. [Terapi] + Tindakan = Selesai & Status Tindak Lanjut null, **when** job cut-off jalan, **then** pasien di-set **Pulang** dan kunjungan RJ ditutup. |
| US-03 | **Given** pasien RI dengan As. [Terapi] + Tindakan = Selesai, **when** terapis klik **Selesai Sesi Terapi**, **then** badge "Selesai Sesi" muncul, pasien kembali ke bangsal, episode RI tetap aktif. |
| US-04 | **Given** pasien RI, **when** dashboard render tab RI, **then** kolom **Asal Unit** tampil & kolom **Surat Kontrol tidak ditampilkan**; tab RJ tidak menampilkan Asal Unit. |
| US-05 | **Given** pasien RJ butuh sesi lanjutan, **when** terapis membuat **Surat Kontrol**, **then** checkpoint Surat Kontrol = **Sudah Dibuat** (hijau). |
| US-06 | **Given** tagihan pasien belum lunas di billing, **when** dashboard render, **then** checkpoint Bayar = Sedang Diproses/Tidak Diisi; **saat lunas di billing** → Bayar = Selesai (BR-020). |
| US-07 | **Given** operator memfilter terapis "X" + sesi "pagi", **when** filter diterapkan pada tab aktif, **then** hanya pasien terapis X sesi pagi yang tampil, counter menyesuaikan. |

---

## 11. NFR (ringkas)
- Load daftar < 1 detik p95; scroll responsif (virtualization bila > N baris).
- Perubahan status checkpoint tampil ≤ 3 detik dari event modul sumber.
- Audit log seluruh disposisi & auto-penyelesaian (BR-018).

---

## 12. Risk & Mitigation
| Risiko | Mitigasi |
|---|---|
| Pasien RI keliru ter-*discharge* RS | BR-015 memisahkan aksi RI (Selesai Sesi, bukan discharge); QA khusus. |
| Auto-penyelesaian false-positive (pasien belum dilayani ikut ditutup) | Syarat ganda As. [Terapi] + Tindakan = Selesai (BR-013). |
| Asal Unit kosong pada order RI | BR-017 mewajibkan; validasi di sisi order Ranap (dependency). |
| Bayar Selesai padahal billing belum lunas | BR-020 mengikat checkpoint ke status lunas billing, bukan sekadar form dibuka. |

---

## 13. Open Questions / Keputusan

### 13.1 Sudah Diputuskan
| ID | Keputusan | Hasil |
|---|---|---|
| OQ-01 | Kriteria auto-penyelesaian | **As. [Terapi] + Tindakan** (keduanya Selesai). ✅ |
| OQ-02 | Kolom Lab & Radiologi | **Dipertahankan** (tampil — bila tak ada order). ✅ |
| OQ-03 | Checkpoint Bayar (RJ & RI) | **Cerminan status billing**; pisah/gabung tagihan = setting modul billing; lunas → Selesai (BR-020). ✅ |
| OQ-04 | E-Resep & Surat Kontrol | **Dimunculkan**; Surat Kontrol = mekanisme penjadwalan sesi lanjutan. ✅ |
| OQ-A | Struktur sub-resep E-Resep | **Scope PRD E-Resep** (BR-012). ✅ |
| OQ-B | Surat Kontrol pada tab RI | **Kolom dihapus** dari tab RI (BR-023). ✅ |
| OQ-C | Keseragaman disposisi antar unit | **Seragam** untuk ketiga unit; **detail di PRD terpisah** (BR-024). ✅ |

### 13.2 Masih Perlu Konfirmasi
| ID | Pertanyaan | Usulan Default |
|---|---|---|
| **OQ-D** | Penamaan kode dokumen `PRD-P-DSH-TRP` sesuai konvensi? | Konfirmasi. |

---

## 14. Change Log
- **v1.0 (7 Jul 2026):** Draft awal untuk review.
- **v1.1 (7 Jul 2026):** E-Resep & Surat Kontrol dikembalikan; resolusi OQ-01..04; BR-020 (Bayar = cerminan billing).
- **v1.2 (7 Jul 2026):** Struktur sub-resep E-Resep dilepas ke PRD E-Resep (BR-012).
- **v1.3 (7 Jul 2026):** Surat Kontrol dicatat sebagai **bi-state** (BR-023); kolom Surat Kontrol **dihapus dari tab RI**; penanda tidak-berlaku memakai **"—"** (bukan "N/A"); OQ-C selesai (disposisi seragam, detail di PRD terpisah — BR-024). Sisa OQ: hanya OQ-D (penamaan).
