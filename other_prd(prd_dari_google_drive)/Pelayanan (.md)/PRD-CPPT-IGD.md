# PRD — CPPT IGD (Catatan Perkembangan Pasien Terintegrasi — Instalasi Gawat Darurat)

**Related Document:** Requirement – CPPT IGD; PRD CPPT Rawat Inap (**hard dependency** — keterhubungan data); PRD SPRI (sumber DPJP); PRD EMR IGD / Asesmen Awal IGD (modul induk & sibling); Referensi V1 — CPPT Rawat Inap (staging PKU Wonosobo) & CPPT IGD client Afdila
**Dokumen ID:** PRD-C-CPPT-IGD-v2.0  ·  **Versi:** 2.6 (Draft — Matriks izin Salin per role)
**Tanggal Disusun:** 09 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]` — Fase 01

---

## 1. Overview / Brief Summary

CPPT IGD adalah modul pencatatan perkembangan pasien terintegrasi khusus lingkup Instalasi Gawat Darurat (IGD). Modul ini dipakai oleh **dokter, perawat/bidan, ahli gizi, farmasi, terapi wicara, terapi okupasi, dan fisioterapi** untuk mendokumentasikan tindak lanjut medis, respons klinis, serta instruksi/rencana lanjutan yang terjadi **setelah** asesmen awal IGD, selama pasien masih berada di IGD; **DPJP** berperan sebagai verifikator. Pencatatan memakai form per-role (metode SOAP untuk sebagian besar role, dengan variasi ADIME/DRP/khusus disiplin) dan disajikan secara kronologis.

Di Neurovi v1, fitur CPPT IGD **belum tersedia** di client PKU (sudah ada di client Afdila). Akibatnya, perkembangan pasien selama di IGD berisiko tercatat pada CPPT Rawat Inap atau tercatat tidak konsisten, sehingga menyulitkan penelusuran kronologi klinis. Selain itu, dashboard CPPT pada v1 kadang lambat dimuat (bisa lebih dari 10 detik), dan penyimpanan draft hanya bersifat per device.

Untuk Fase 1 (MVP), modul ini fokus pada: input CPPT SOAP + Instruksi Tenaga Kesehatan, multi-entrian per pasien, tampilan kronologis, edit/hapus dengan penandaan entrian yang diubah, input backdate sesuai waktu kejadian klinis, penanda HANDOVER antar shift, verifikasi readback, verifikasi DPJP, header Data Pasien & DPJP, Refresh Data, penyimpanan draft (caching) per akun user, akses melalui navbar EMR IGD, dan keterhubungan data ke CPPT Rawat Inap bila pasien berlanjut ke RI.

Perbedaan fungsional utama dibanding v1: dashboard ditargetkan muat < 1 detik, adanya kemampuan backdate, dan caching draft berpindah dari per-device menjadi per-akun user. Tampilan gabungan data CPPT lintas layanan (RI atau IGD dalam satu tampilan) diperlakukan sebagai kapabilitas lanjutan `[**]`.

> Referensi: `Requirement – CPPT IGD`; catatan Main Goals / Feature Capabilities / Performance / Scope / Expected Improvement; screenshot tampilan CPPT v1 (staging PKU Wonosobo).

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: Requirement CPPT IGD + screenshot v1:
- Fitur CPPT IGD **belum ada** di client PKU; sudah tersedia di client Afdila.
- Perkembangan pasien selama di IGD berisiko ikut tercatat di CPPT Rawat Inap atau tercatat tidak konsisten.
- Dashboard CPPT kadang sangat lambat dimuat (bisa > 10 detik).
- Penyimpanan draft CPPT hanya per device — draft yang belum tersimpan tidak dapat dilanjutkan di device lain.
- Belum ada kemampuan menginput entrian secara backdate.

**Masalah / pain point:**
- Aspek bisnis proses: tanpa CPPT IGD terstruktur, kronologi klinis di IGD sulit ditelusuri dan kesinambungan dokumen saat pasien pindah layanan tidak terjaga.
- Aspek UX: dashboard CPPT lambat dimuat; entrian tidak selalu dapat mencerminkan waktu kejadian klinis yang sebenarnya.
- Aspek logic system: caching draft per-device membuat pekerjaan tidak dapat dilanjutkan lintas device.

**Dampak utama yang disasar v2:**
- Dokumentasi klinis IGD lengkap, berkelanjutan, dan kronologis · kesinambungan informasi saat pasien pindah ke RI/RJ · kelengkapan dokumen untuk verifikasi klaim BPJS · performa muat & simpan < 1 detik.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = pencatatan CPPT IGD SOAP, kronologis, edit/hapus + tanda edit, backdate, handover, verifikasi readback, verifikasi DPJP, caching per akun user, akses via EMR IGD, keterhubungan ke CPPT RI.
- **Fase 2** = tampilan gabungan data CPPT lintas layanan (RI/IGD) di satu UI (BE sudah menyediakan data). **UI akan dibuat ketika modul RI dikerjakan.** `[**]`

> Volume operasional: 100–150 pasien/hari dengan estimasi hingga ~50 entrian data per hari.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Modul CPPT khusus lingkup IGD** — bukan Rawat Inap maupun Rawat Jalan.
2. **Role pengisi CPPT (7 varian form)** — Dokter, Perawat/Bidan, Ahli Gizi, Farmasi, Terapi Wicara, Terapi Okupasi, Fisioterapi. Form berbeda per role (sumber: `CPPT.xlsx`). **DPJP** berperan sebagai verifikator (bukan varian form).
3. **Input SOAP + Instruksi Tenaga Kesehatan + Nama Staff + Verifikasi DPJP** — sesuai struktur form v1.
4. **Multi-entrian** — pasien dapat memiliki lebih dari satu entrian CPPT selama di IGD.
5. **Tampilan kronologis** — entrian ditampilkan berurutan dari waktu terbaru ke terlama.
6. **Edit & hapus entrian** — entrian yang diubah ditandai, dengan riwayat perubahan yang dapat ditelusuri.
7. **Backdate entrian CPPT** — berlaku untuk entrian baru maupun entrian yang sudah ada.
8. **Penanda HANDOVER antar shift** — menampilkan shift asal → shift tujuan, jam, dan nama petugas.
9. **Caching draft CPPT per akun user** — dapat dilanjutkan di device berbeda.
10. **Keterhubungan data CPPT IGD ke CPPT Rawat Inap** — bila pasien berlanjut ke RI.
11. **Akses melalui EMR IGD** — **saat ini navbar EMR IGD hanya berisi menu CPPT.** Rancangan navbar penuh (menggabungkan Asesmen Kebidanan, Asesmen Persalinan, CPO, CPPT (IGD), Transfer Internal, dan Riwayat Pemeriksaan Penunjang) beserta sinkronisasi Transfer Internal & CPO dengan button/icon existing di dashboard pelayanan IGD **menyusul** seiring modul-modul tersebut dikerjakan.
12. **Header Data Pasien & DPJP + Refresh Data** pada halaman CPPT.
13. **Panel Riwayat Pemeriksaan Penunjang** — tab Riwayat CPPT, Riwayat Resep, Laboratorium, Patologi, Radiologi (mengikuti v1 — **dikonfirmasi**), dengan aksi **Salin (auto-replace)** dari Riwayat Resep/Laboratorium/Patologi/Radiologi ke field CPPT tertentu (§14.K).

### Out Scope
- **Asesmen awal IGD** — mengikuti modul/fitur asesmen awal yang sudah ada (PRD terpisah).
- **CPPT Rawat Inap & CPPT Rawat Jalan** — modul terpisah; CPPT IGD hanya terhubung datanya, bukan menggantikan.
- **[Fase 2] `[**]`** Tampilan gabungan data input CPPT dari RI atau IGD dalam satu UI (BE sudah menyediakan data). UI menyusul saat modul RI dikerjakan.
<!-- Read Back kini masuk lingkup (Fase 1) untuk role Dokter, Perawat/Bidan, Ahli Gizi, Farmasi — lihat §14.E. -->

## 4. Goals and Metrics

### Tujuan
Menyediakan CPPT khusus IGD agar seluruh aktivitas klinis selama pasien berada di IGD terdokumentasi lengkap, berkelanjutan, dan kronologis; mudah ditelusuri; menjaga kesinambungan informasi saat pasien berpindah layanan; serta mendukung kelengkapan dokumen untuk verifikasi klaim BPJS.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu buka/muat dashboard CPPT | < 1 detik (v1 kadang > 10 detik) | NFR-001 |
| Waktu simpan entrian CPPT | < 1 detik | NFR-002 |
| Stabilitas volume harian | 100–150 pasien/hari, ~50 entrian/hari | NFR-003 |
| Kelangsungan draft lintas device | Draft per akun user terbaca & dapat dilanjutkan di device lain | NFR-004 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul / Code | Peran terhadap Modul |
|--------------|-----------------------|
| **Asesmen Awal IGD** | Modul induk EMR IGD; CPPT IGD mencatat perkembangan **setelah** asesmen awal. Bukan bagian CPPT IGD. |
| **SPRI** | Menambah DPJP. DPJP awal dari dokter pendaftaran IGD; bertambah dengan DPJP pada SPRI setelah SPRI dibuat. **Hard dependency** untuk penambahan DPJP. |
| **CPPT Rawat Inap** | Tujuan keterhubungan data — entrian CPPT IGD terhubung ke CPPT RI bila pasien berlanjut ke RI. **Hard dependency.** |
| **CPO (Catatan Pemberian Obat)** | Sibling EMR IGD; dapat diakses via icon obat maupun EMR IGD, tersinkronisasi. Kehadiran di navbar EMR IGD **menyusul**. |
| **Transfer Internal** | Sibling EMR IGD; dapat diakses via button existing maupun EMR IGD, tersinkronisasi. Kehadiran di navbar EMR IGD **menyusul**. |
| **Riwayat Pemeriksaan Penunjang** | Panel riwayat (CPPT, Resep, Laboratorium, Patologi, Radiologi) di sisi form. |
| **Pendaftaran IGD** | Sumber No. RM & status terdaftar. Bila pasien belum terdaftar, akses CPPT IGD ditolak dengan popup. |
| **Diagnosa Keperawatan** | Sumber diagnosa khusus untuk role Perawat. |
| **Tindakan Keperawatan** | Sumber rencana tindakan khusus untuk role perawat yang telah dimappingkan berdasarkan dari diagnosa keperawatan. |

Dependency lintas modul: **Master ICD-10** (dropdown diagnosa), **Master Staf** (Nama Staff & role), **Master Unit** (lokasi/unit pasien).

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter IGD | Primary | Menginput CPPT SOAP + TTV, Diagnosa **+ ICD-10**, rencana tindakan, instruksi, Read Back. |
| Perawat / Bidan IGD | Primary | Menginput CPPT SOAP + TTV, Diagnosa (tanpa ICD), rencana tindakan, Read Back; mendokumentasikan handover antar shift. |
| Ahli Gizi | Primary | Menginput CPPT format **ADIME** (Assesmen–Diagnosis–Intervensi–Monitoring–Evaluasi), Read Back. |
| Farmasi | Primary | Menginput CPPT SOAP + TTV, Assesmen **DRP** + Uraian, Plan, Read Back. |
| Terapi Wicara | Primary | Menginput CPPT Objektif khusus + Diagnosa + Intervensi (dropdown). |
| Terapi Okupasi | Primary | Menginput CPPT Objektif (Pemeriksaan) + Diagnosa + Intervensi (dropdown). |
| Fisioterapi | Primary | Menginput CPPT Objektif khusus (nyeri/inspeksi/palpasi) + Diagnosa + Intervensi (dropdown). |
| DPJP | Primary | Memberikan verifikasi terhadap entrian CPPT IGD yang telah dibaca (dapat berulang dalam satu hari). Bukan varian form. |
| PPA lain (viewer) | Secondary | Melihat riwayat CPPT IGD secara terintegrasi; melihat status "Terverifikasi DPJP". |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
Di client PKU, belum ada CPPT IGD; perkembangan pasien selama di IGD ditulis pada CPPT Rawat Inap atau tercatat tidak konsisten. Pada client Afdila, CPPT IGD sudah tersedia. Pola input & tampilan mengacu pada CPPT Rawat Inap v1 (screenshot terlampir): form SOAP di sisi kiri, panel Riwayat Pemeriksaan Penunjang di sisi kanan, dashboard tabel entrian dengan kolom Tanggal / Hasil Pemeriksaan / Instruksi / Nama Staff / Verifikasi, serta verifikasi DPJP. `[ASUMSI: screenshot v1 adalah CPPT RI sebagai acuan visual & fungsional; CPPT IGD mengikuti pola yang sama — didukung catatan "sama seperti di CPPT RI".]`

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. User membuka EMR IGD dan memilih menu **CPPT** pada navbar.
2. Sistem memeriksa status pendaftaran pasien di IGD. Bila belum terdaftar → tampilkan popup "Pasien Belum Terdaftar" (proses berhenti).
3. Dashboard CPPT IGD memuat seluruh entrian pasien secara kronologis (terbaru → terlama), lengkap dengan header Data Pasien & DPJP.
4. User menekan **Masukan Data** untuk menginput entrian baru (SOAP + Instruksi Tenaga Kesehatan), atau **Detail/Edit** untuk membuka entrian yang ada.
5. Saat input, user dapat menyetel Tanggal & Jam sesuai waktu kejadian klinis (backdate).
6. User menyimpan entrian; entrian langsung tampil di riwayat kronologis dan terhubung ke CPPT RI bila pasien berlanjut ke RI.
7. Perawat/bidan dapat menyisipkan penanda **HANDOVER** antar shift di antara entrian.
8. DPJP membuka entrian dan memberikan **Verifikasi**; role lain melihat label "Terverifikasi DPJP".
9. Draft yang belum tersimpan disimpan (cache) per akun user, sehingga dapat dilanjutkan di device lain.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Ketersediaan CPPT IGD di PKU | Belum ada (hanya ada di Afdila) | Tersedia untuk PKU |
| Waktu muat dashboard | Kadang > 10 detik | Target < 1 detik |
| Backdate entrian | Belum ada | Tersedia (baru & existing) |
| Caching draft | Per device | Per akun user (lanjut lintas device) |
| Keterhubungan ke CPPT RI | Tidak eksplisit | Entrian tersimpan terhubung ke CPPT RI |

## 7. Main Flow / Mindmap

### Skenario 1 — Input CPPT IGD baru (alur normal)
1. Buka EMR IGD → menu CPPT.
2. Dashboard memuat entrian pasien kronologis.
3. Klik **Masukan Data**.
4. Isi form sesuai role (mis. SOAP + TTV untuk Dokter/Perawat: S keluhan + riwayat alergi; O TTV + data objektif; A diagnosa (+ ICD-10 utk Dokter); P rencana tindakan) + Instruksi Tenaga Kesehatan.
5. (Opsional) setel Tanggal & Jam kejadian klinis (backdate).
6. **Simpan** → entrian tampil di riwayat + Nama Staff/role terisi otomatis.

### Skenario 2 — Menampilkan & menelusuri riwayat
Saat input, panel Riwayat menampilkan entrian CPPT sebelumnya (terbaru → terlama) beserta tab Riwayat Resep, Laboratorium, Patologi, dan Radiologi. User dapat **Refresh Data** untuk memuat ulang.

### Skenario 3 — Verifikasi DPJP
DPJP membuka kolom **Verifikasi** pada dashboard list (button hanya muncul bila login sebagai DPJP pasien tersebut) → klik **Verifikasi** → mengisi **catatan verifikasi** → klik **Verifikasi** → verifikasi berhasil, entrian ditandai "Terverifikasi DPJP" beserta Verifikator, tanggal, dan catatan. DPJP dapat verifikasi lebih dari satu kali dalam satu hari. User lain hanya melihat label, bukan button.

### Skenario 4 — Verifikasi Read Back (oleh Pemberi Pesan)
Pada dashboard list, aksi **Read Back** hanya muncul bila login = **Pemberi Pesan** yang dipilih saat pembuatan CPPT → klik **Read Back** → sistem menampilkan informasi read back (waktu, pemberi pesan, pesan) → user klik **Verifikasi** → verifikasi berhasil, status read back menjadi **"Terverifikasi"** (sebelumnya "Belum Diverifikasi") dan menjadi read-only.

### Skenario 5 — Edit / Backdate / Handover
- **Edit** entrian: button Edit **enable hanya untuk pembuat entrian**; entrian yang diubah ditandai "Diedit"; riwayat perubahan dapat dibandingkan (Sebelum vs Setelah Diubah). Edit setelah verifikasi **tidak me-reset** status DPJP; Read Back yang sudah "Terverifikasi" **read-only** (user tetap dapat menambah read back baru). Backdate juga berlaku pada edit.
- **Backdate**: Tanggal & jam merepresentasikan waktu kejadian klinis, bukan waktu input sistem.
- **Handover**: petugas menyisipkan penanda serah terima (shift asal → tujuan, jam, pemberi → penerima) di antara entrian.
- **Hapus** entri: menghapus entri **saat masih dalam proses input** (mis. baris yang sedang ditambahkan) — **bukan** menghapus CPPT yang sudah tersimpan & tampil di dashboard.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | CPPT IGD hanya dapat diakses untuk pasien yang sudah terdaftar di IGD (punya No. RM). Bila belum terdaftar, tampilkan popup "Pasien Belum Terdaftar". | FR-013; US-013 |
| **BR-002** | Satu pasien dapat memiliki lebih dari satu entrian CPPT IGD selama berada di IGD. | FR-002; US-001 |
| **BR-003** | Entrian CPPT IGD ditampilkan kronologis, dari waktu terbaru ke terlama. | FR-003; US-002 |
| **BR-004** | Tanggal & jam entrian merepresentasikan waktu kejadian klinis (mendukung backdate), bukan waktu input sistem. | FR-005; US-004 |
| **BR-005** | Backdate berlaku untuk entrian baru maupun entrian yang sudah ada (melalui edit). | FR-005; US-004 |
| **BR-006** | Entrian yang diedit ditandai; riwayat perubahan dapat ditelusuri (perbandingan Sebelum vs Setelah Diubah). | FR-004; US-003 |
| **BR-007** | DPJP CPPT IGD berasal dari **dokter yang dipilih saat pendaftaran IGD**, dan **bertambah** bila SPRI dibuat (mengikuti DPJP pada SPRI). DPJP dapat lebih dari satu. | FR-016; US-007 |
| **BR-008** | Button Verifikasi hanya muncul untuk DPJP pasien tersebut. Role lain melihat label "Terverifikasi DPJP" (bukan button). | FR-007; US-006 |
| **BR-009** | DPJP dapat melakukan verifikasi lebih dari satu kali dalam satu hari. | FR-007; US-006 |
| **BR-010** | Nama Staff & role diisi otomatis dari akun user yang sedang login. | FR-001; US-001 |
| **BR-011** | Draft CPPT yang belum tersimpan disimpan (cache) per akun user (bukan per device); dapat dilanjutkan di device lain. | FR-010; US-009 |
| **BR-012** | Entrian CPPT IGD yang tersimpan terhubung ke CPPT Rawat Inap bila pasien berlanjut ke RI. | FR-011; US-005 |
| **BR-013** | Penanda HANDOVER adalah **aksi yang dipicu petugas dari dalam layar CPPT IGD** (bukan dibuat otomatis dari pergantian penulis entrian); menampilkan shift asal → shift tujuan, jam serah terima, pemberi, dan penerima, disisipkan di antara entrian CPPT. | FR-006; US-004 |
| **BR-014** | Transfer Internal & CPO tersinkronisasi antara akses via EMR IGD dan button/icon existing di dashboard pelayanan IGD. **Berlaku saat menu tersebut hadir di navbar EMR IGD** (saat ini navbar hanya CPPT). | FR-014; US-012 |
| **BR-016** | Diagnosa/Assesmen wajib minimal satu. **ICD-10 hanya pada form Dokter** (dari Master data diagnosa); Perawat/Bidan memakai Diagnosa tanpa ICD; disiplin lain memakai istilah Assesmen/Diagnosis/DRP sesuai form-nya. | FR-001; `CPPT.xlsx` |
| **BR-017** | Blok Objektif **Tanda Vital** hanya pada form **Dokter, Perawat/Bidan, Farmasi**. TTV wajib: TD, Suhu, Nadi, RR, Saturasi O2; GDS opsional. Ahli Gizi & disiplin terapi (Wicara/Okupasi/Fisioterapi) **tidak** memakai TTV. | FR-001; `CPPT.xlsx` |
| **BR-018 `[**]`** | **Fase 2:** Data input CPPT dari RI atau IGD ditampilkan gabung dalam satu UI (BE sudah menyediakan data). **UI dibuat saat modul RI dikerjakan.** | Requirement |
| **BR-019** | Handover dicatat oleh petugas dari dalam layar CPPT. **Pemberi dan Penerima dipilih manual** dari Master Staf (dropdown single select, tanpa auto-fill). | FR-006; `CPPT.xlsx` |
| **BR-020** | Shift asal & tujuan dipilih manual dari daftar label **Pagi / Siang / Sore**. | FR-006; `CPPT.xlsx` |
| **BR-021** | Posisi kronologis penanda HANDOVER mengikuti **jam serah terima** yang diisi (mendukung backdate), bukan waktu pencatatan sistem — konsisten dengan BR-004. | FR-006 |
| **BR-022** | Struktur field CPPT ditentukan oleh **role/disiplin** pengisi (7 varian). Blok Header & Informasi sama; blok Subjektif/Objektif/Assesmen–Plan/Read Back mengikuti mapping per role di `CPPT.xlsx`. | FR-001; FR-019 |
| **BR-023** | Read Back tersedia pada form **Dokter, Perawat/Bidan, Ahli Gizi, Farmasi**. Bila diaktifkan, dapat menambahkan lebih dari satu Read Back dan menghapusnya; Pemberi Pesan dari Master Staf. | FR-018; `CPPT.xlsx` |
| **BR-024** | Aksi **Hapus** berlaku untuk entri yang **masih dalam proses input** (belum tersimpan), **bukan** menghapus CPPT yang sudah tersimpan & tampil di dashboard. Kontrol akses **tidak** berlaku per-role. | FR-004 |
| **BR-025** | **Salin Riwayat Resep** — hanya untuk role **Dokter** dan **Farmasi**; auto-replace field **Rencana Tindakan** (pada Farmasi = field **Plan**) dengan **nama obat, dosis, aturan pakai**. Perawat/Bidan, Ahli Gizi, dan 3 disiplin terapi **tidak** dapat menyalin resep. | FR-020; US-014 |
| **BR-026** | **Salin Laboratorium** — user memilih pemeriksaan via **checkbox**, auto-replace dengan **pemeriksaan, hasil, unit**. Target: **Data Objektif Lainnya** (Dokter, Farmasi, Perawat/Bidan) atau **Assesmen** (Ahli Gizi). Terapi Wicara/Okupasi/Fisioterapi **tidak** dapat menyalin. | FR-020; US-014 |
| **BR-027** | **Salin Patologi** — auto-replace dengan **Kesimpulan**. Target: **Data Objektif Lainnya** (Dokter, Farmasi, Perawat/Bidan) atau **Assesmen** (Ahli Gizi). Terapi Wicara/Okupasi/Fisioterapi **tidak** dapat menyalin. | FR-020; US-014 |
| **BR-028** | **Salin Radiologi** — auto-replace dengan **jenis pemeriksaan, hasil pemeriksaan, kesan**. Target: **Data Objektif Lainnya** (Dokter, Farmasi, Perawat/Bidan) atau **Assesmen** (Ahli Gizi). Terapi Wicara/Okupasi/Fisioterapi **tidak** dapat menyalin. | FR-020; US-014 |
| **BR-029** | Aksi Salin bersifat **menambahkan** (menambah isi field target, bukan mengganti). Ketersediaan Salin & field target ditentukan **per role** sesuai matriks §14.K; tombol Salin tidak tampil pada role/sumber yang tidak diizinkan. | FR-020 |
| **BR-030** | Pada dashboard list CPPT, button **Edit** hanya **enable bila user login = pembuat entrian** CPPT tersebut. User lain melihat Edit dalam keadaan disabled/tersembunyi. | FR-021; US-003 |
| **BR-031** | **Verifikasi Read Back** — aksi **Read Back** pada dashboard list hanya muncul bila user login = **Pemberi Pesan** yang dipilih saat pembuatan CPPT. Alur: klik **Read Back** → sistem menampilkan informasi read back → user klik **Verifikasi** → read back menjadi **Terverifikasi**. | FR-022; US-015 |
| **BR-032** | Setiap Read Back memiliki **status**: **"Belum Diverifikasi"** (default saat dibuat) dan **"Terverifikasi"** (setelah diverifikasi Pemberi Pesan). Status ditampilkan pada blok Read Back. | FR-022; US-015 |
| **BR-033** | **Verifikasi DPJP** — pada kolom Verifikasi dashboard list, button **Verifikasi** muncul bila user login sebagai **DPJP** pasien tersebut. Alur: klik Verifikasi → user mengisi **catatan verifikasi** → klik **Verifikasi** → entrian menjadi **"Terverifikasi DPJP"**. | FR-007; US-006 |
| **BR-034** | **Edit setelah verifikasi** — data CPPT tetap dapat diedit meski Read Back dan/atau verifikasi DPJP sudah dilakukan; **status verifikasi DPJP tidak ter-reset** oleh edit. Namun **section Read Back yang sudah "Terverifikasi" bersifat read-only** (tidak dapat diedit); user tetap dapat **menambahkan Read Back baru**. Read Back yang masih "Belum Diverifikasi" tetap dapat diedit. | FR-021; FR-022; US-003 |

## 9. State Machine — Status Entrian CPPT IGD

### 9.1 Kondisi entrian
| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Draft (belum tersimpan) | Indikator draft / cache | Entrian sedang diisi; disimpan sementara (cache) per akun user. |
| Tersimpan | Kartu entrian normal | Entrian tersimpan, tampil di riwayat kronologis. |
| Tersimpan — Diedit | Badge "Diedit" | Entrian pernah diubah; riwayat perubahan tersedia. Edit hanya oleh pembuat (BR-030). |
| Terverifikasi DPJP | Label/badge "Terverifikasi DPJP" + Verifikator | Entrian telah diverifikasi DPJP (dapat lebih dari sekali/hari). |

**Sub-status Read Back** (per read back):
| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Belum Diverifikasi | Badge "Belum Diverifikasi" | Default saat read back dibuat; masih dapat diedit. |
| Terverifikasi | Badge "Terverifikasi" | Sudah diverifikasi Pemberi Pesan; **read-only** (tidak dapat diedit). |

- **Transisi entrian:** Draft → Tersimpan (aksi Simpan) → Diedit (aksi Edit oleh pembuat) → Terverifikasi DPJP (aksi Verifikasi oleh DPJP). Verifikasi dapat berulang; edit dapat terjadi sebelum/sesudah verifikasi.
- **Edit setelah verifikasi (BR-034):** entrian CPPT tetap dapat diedit meski sudah diverifikasi — **status verifikasi DPJP tidak ter-reset**. Section Read Back yang sudah **Terverifikasi** menjadi **read-only**; read back yang masih **Belum Diverifikasi** tetap dapat diedit; user tetap dapat **menambahkan Read Back baru**.
- **Transisi Read Back:** Belum Diverifikasi → Terverifikasi (aksi Verifikasi Read Back oleh Pemberi Pesan; BR-031).

### 9.2 Catatan status
- Draft bersifat per akun user; login di device lain menampilkan draft yang sama untuk dilanjutkan (BR-011).
- Status "Diedit" tidak menghapus entrian asli — perbandingan Sebelum vs Setelah Diubah tetap dapat ditelusuri (BR-006).

## 10. Aksi per Entrian CPPT IGD

| Aksi | Behavior Detail | Rule Terkait |
|------|-----------------|--------------|
| **Masukan Data** | Membuka form input entrian baru (SOAP + Instruksi). Nama Staff/role terisi otomatis. | BR-002; BR-010 |
| **Detail** | Menampilkan isi entrian secara penuh (read). | FR-003 |
| **Edit** | Mengubah entrian tersimpan; entrian ditandai "Diedit"; mendukung backdate. **Enable hanya bila login = pembuat entrian** (BR-030). Read Back yang sudah Terverifikasi read-only (BR-034). | BR-005; BR-006; BR-030; BR-034 |
| **Hapus** | Menghapus entri yang **masih dalam proses input** (belum tersimpan) — bukan CPPT tersimpan di dashboard. | FR-004; BR-024 |
| **Verifikasi** (DPJP) | Muncul di kolom Verifikasi bila login sebagai DPJP pasien tersebut. Klik → isi **catatan verifikasi** → klik Verifikasi → "Terverifikasi DPJP" + Verifikator; dapat berulang/hari. | BR-008; BR-009; BR-033 |
| **Read Back** (Pemberi Pesan) | Muncul bila login = Pemberi Pesan read back tersebut. Klik → tampil informasi read back → klik Verifikasi → read back "Terverifikasi". | BR-031; BR-032 |
| **Tambah Handover** | Membuka form serah terima dari dalam layar CPPT (Pemberi & Penerima dipilih manual dari Master Staf; shift asal/tujuan Pagi/Siang/Sore; jam; catatan) lalu menyisipkan penanda ke timeline. | BR-013; BR-019; BR-020; BR-021 |
| **Refresh Data** | Memuat ulang dashboard/riwayat CPPT. | FR-009 |

**Kontrol Akses:** button **Verifikasi (DPJP)** hanya untuk DPJP pasien tersebut; **Read Back (Verifikasi)** hanya untuk Pemberi Pesan read back tersebut; **Edit** hanya untuk pembuat entrian (BR-030). Hapus (saat proses input) tidak dibatasi per-role.

## 11. Display Rules — Verifikasi DPJP, Verifikasi Read Back, Edit & Handover

> Dashboard/modul CPPT hanya menampilkan status verifikasi & DPJP; sumber DPJP dari dokter pendaftaran IGD + SPRI (BR-007). Visibilitas button pada dashboard list bergantung pada identitas user login (pembuat / Pemberi Pesan / DPJP).

| Aspek | Verifikasi (DPJP) | Verifikasi Read Back (Pemberi Pesan) | Handover |
|-------|-------------------|--------------------------------------|----------|
| Pemicu | Login sebagai DPJP pasien | Login = Pemberi Pesan read back | Serah terima antar shift |
| Button muncul untuk | DPJP pasien tersebut | Pemberi Pesan read back tersebut | Petugas pencatat |
| Tampil untuk user lain | Label "Terverifikasi DPJP" (read-only) | Badge status read back (read-only) | Penanda handover (read-only) |
| Alur | Klik Verifikasi → isi catatan → Verifikasi | Klik Read Back → tampil info → Verifikasi | Isi form manual → Sisipkan |
| Frekuensi | Boleh lebih dari sekali dalam satu hari | Sekali per read back (jadi Terverifikasi) | Sesuai pergantian shift |
| Info ditampilkan | Verifikator, tanggal, catatan verifikasi | Waktu, Pemberi Pesan, Pesan, status | Shift asal → tujuan, jam, pemberi → penerima |

> **Edit (BR-030):** button Edit pada dashboard list enable hanya bila login = pembuat entrian. Read Back yang sudah Terverifikasi bersifat read-only saat edit (BR-034).

## 12. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Input CPPT (form per-role)** — blok Header & Informasi sama untuk semua role; blok Subjektif/Objektif/Assesmen–Plan/Read Back mengikuti varian role (Dokter, Perawat/Bidan, Ahli Gizi, Farmasi, Terapi Wicara, Terapi Okupasi, Fisioterapi) sesuai §14. Nama Staff/role otomatis. | US-001; BR-010; BR-016; BR-017; BR-022 |
| **FR-002** | **Multi-entrian** — pasien dapat memiliki lebih dari satu entrian CPPT selama di IGD. | US-001; BR-002 |
| **FR-003** | **Tampilan riwayat kronologis** — menampilkan entrian CPPT sebelumnya berurutan terbaru → terlama, termasuk saat input. | US-002; BR-003 |
| **FR-004** | **Edit entrian & Hapus entri** — Edit berlaku pada entrian tersimpan (ditandai "Diedit"; riwayat perubahan Sebelum vs Setelah dapat ditelusuri). Hapus berlaku pada entri yang **masih dalam proses input** (belum tersimpan), bukan CPPT tersimpan di dashboard. | US-003; BR-006; BR-024 |
| **FR-005** | **Backdate entrian** — menyetel tanggal & jam sesuai waktu kejadian klinis; berlaku untuk entrian baru & existing. | US-004; BR-004; BR-005 |
| **FR-006** | **Penanda HANDOVER (aksi petugas)** — form serah terima dari dalam layar CPPT: **Pemberi & Penerima dipilih manual** dari Master Staf; shift asal/tujuan (Pagi/Siang/Sore) & jam serah terima diisi; penanda disisipkan di timeline sesuai jam. Detail field: §14.G. | US-004; BR-013; BR-019; BR-020; BR-021 |
| **FR-007** | **Verifikasi DPJP** — di kolom Verifikasi, button muncul bila login sebagai DPJP pasien tersebut; alur: klik → isi **catatan verifikasi** → Verifikasi → "Terverifikasi DPJP" + Verifikator; dapat berulang/hari. User lain melihat label read-only. | US-006; BR-008; BR-009; BR-033 |
| **FR-008** | **Header Data Pasien & DPJP** — menampilkan No. RM, identitas, alamat pasien, dan DPJP pada halaman CPPT. | US-007; BR-007 |
| **FR-009** | **Refresh Data** — memuat ulang dashboard/riwayat CPPT. | US-008 |
| **FR-010** | **Caching draft per akun user** — draft yang belum tersimpan dapat dibaca & dilanjutkan di device lain. | US-009; BR-011 |
| **FR-011** | **Keterhubungan ke CPPT RI** — entrian tersimpan terhubung ke CPPT Rawat Inap bila pasien berlanjut ke RI. | US-005; BR-012 |
| **FR-012** | **Akses via navbar EMR IGD** — CPPT IGD diakses dari navbar EMR IGD. **Saat ini navbar hanya berisi menu CPPT**; menu lain (Asesmen Kebidanan, Asesmen Persalinan, CPO, Transfer Internal, Riwayat Pemeriksaan Penunjang) menyusul seiring modulnya dikerjakan. | US-010; Requirement A |
| **FR-013** | **Popup "Pasien Belum Terdaftar"** — bila pasien belum terdaftar di IGD, akses ditolak dengan pesan & aksi OK. | US-013; BR-001 |
| **FR-014 `[**]`** | **Sinkronisasi Transfer Internal & CPO** — dapat diakses via EMR IGD maupun button/icon existing, tersinkronisasi. **Menyusul** saat menu Transfer Internal & CPO hadir di navbar EMR IGD (navbar saat ini hanya CPPT). | US-012; BR-014 |
| **FR-015** | **Panel Riwayat Pemeriksaan Penunjang** — tab Riwayat CPPT, Riwayat Resep, Laboratorium, Patologi, Radiologi (mengikuti v1 — **dikonfirmasi**). | US-002 |
| **FR-016** | **DPJP dari pendaftaran + SPRI** — DPJP diisi dari dokter yang dipilih saat pendaftaran IGD; bertambah bila SPRI dibuat (dapat lebih dari satu). | US-007; BR-007 |
| **FR-017 `[**]`** | **Fase 2** — tampilan gabungan data CPPT dari RI/IGD dalam satu UI (BE sudah menyediakan data). UI dibuat saat modul RI dikerjakan. | BR-018 |
| **FR-018** | **Read Back (SBAR)** — pada form Dokter, Perawat/Bidan, Ahli Gizi, Farmasi: checkbox "Beri Read Back" mengaktifkan blok (Tanggal+Waktu, Pemberi Pesan [dropdown multiple, Master Staf], Pesan); dapat >1 read back & dihapus. Detail: §14.E. | US-006; BR-023; `CPPT.xlsx` |
| **FR-019** | **Rendering form per role** — sistem menampilkan varian form sesuai role/disiplin user yang login (7 varian). | US-001; BR-022 |
| **FR-020** | **Salin (auto-replace) dari Riwayat Penunjang** — tombol Salin pada tab Riwayat Resep / Laboratorium / Patologi / Radiologi menyalin data ke field CPPT secara **auto-replace** (mengganti isi, bukan menambah). Laboratorium: pilih pemeriksaan via checkbox dulu. **Ketersediaan & field target berbeda per role** (matriks §14.K). | US-014; BR-025; BR-026; BR-027; BR-028; BR-029 |
| **FR-021** | **Kontrol Edit per pembuat** — pada dashboard list, button Edit enable hanya bila login = pembuat entrian; edit setelah verifikasi tidak me-reset status DPJP; Read Back yang sudah Terverifikasi read-only. | US-003; BR-030; BR-034 |
| **FR-022** | **Verifikasi Read Back** — aksi Read Back (muncul untuk Pemberi Pesan) menampilkan informasi read back + tombol Verifikasi; setelah diverifikasi, status read back = "Terverifikasi". Setiap read back berstatus "Belum Diverifikasi"/"Terverifikasi". | US-015; BR-031; BR-032 |

## 13. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **PPA pengisi (Dokter / Perawat / Bidan / Ahli Gizi / Farmasi / Terapis)**, saya ingin **menginput CPPT sesuai form role saya**, sehingga **perkembangan pasien di IGD terdokumentasi lengkap & sesuai disiplin**. | 1) Given user login dengan role tertentu, When membuka form CPPT, Then varian form sesuai role tampil (BR-022, FR-019). 2) When mengisi & Simpan, Then entrian tersimpan & Nama Staff/role otomatis (BR-010). 3) Given diagnosa/assesmen wajib kosong, When Simpan, Then sistem menolak (BR-016). | FR-001; FR-002; FR-019 |
| **US-002** | Sebagai **PPA**, saya ingin **melihat riwayat CPPT sebelumnya secara kronologis**, sehingga **saya paham perkembangan pasien**. | Given dashboard terbuka, When memuat, Then entrian tampil terbaru → terlama beserta tab riwayat penunjang (BR-003). | FR-003; FR-015 |
| **US-003** | Sebagai **pembuat entrian**, saya ingin **hanya saya yang dapat mengedit entrian saya (dengan penandaan) dan menghapus entri saat masih menginput**, sehingga **koreksi tetap tertelusur & aman**. | 1) Given entrian tersimpan, When saya (pembuat) klik Edit, Then Edit enable & entrian ditandai "Diedit" (BR-006, BR-030); user lain: Edit disabled. 2) Given entrian sudah diverifikasi, When diedit, Then status DPJP tidak ter-reset & Read Back Terverifikasi read-only (BR-034). 3) Given masih proses input, When menghapus entri, Then entri (belum tersimpan) dihapus (BR-024). | FR-004; FR-021 |
| **US-004** | Sebagai **user pencatat**, saya ingin **menyetel waktu kejadian klinis (backdate) & menandai handover**, sehingga **kronologi sesuai kejadian sebenarnya**. | 1) Given input, When menyetel tanggal/jam, Then entrian memakai waktu kejadian, bukan waktu sistem (BR-004). 2) Given pergantian shift, When menekan Tambah Handover & memilih Pemberi/Penerima (manual) + shift + jam, Then penanda tampil di posisi sesuai jam serah terima (BR-013, BR-019, BR-021). | FR-005; FR-006 |
| **US-005** | Sebagai **tim klinis**, saya ingin **entrian CPPT IGD terhubung ke CPPT RI**, sehingga **kesinambungan terjaga saat pasien pindah layanan**. | Given pasien berlanjut ke RI, When entrian tersimpan, Then data terhubung ke CPPT RI (BR-012). | FR-011 |
| **US-006** | Sebagai **DPJP**, saya ingin **memverifikasi entrian yang saya baca dengan catatan**, sehingga **entrian tervalidasi**. | 1) Given saya DPJP pasien, When membuka kolom Verifikasi, Then button Verifikasi muncul; user lain melihat label (BR-008, BR-033). 2) When klik Verifikasi → isi catatan → Verifikasi, Then entrian "Terverifikasi DPJP" (BR-033). 3) Then verifikasi dapat berulang dalam satu hari (BR-009). | FR-007 |
| **US-007** | Sebagai **PPA**, saya ingin **melihat Data Pasien & DPJP di halaman CPPT**, sehingga **konteks pasien jelas**. | Given halaman CPPT, Then header menampilkan No. RM/identitas/alamat & DPJP; DPJP dari dokter pendaftaran IGD dan bertambah bila SPRI dibuat (BR-007). | FR-008; FR-016 |
| **US-008** | Sebagai **PPA**, saya ingin **Refresh Data**, sehingga **riwayat CPPT selalu mutakhir**. | Given dashboard, When Refresh Data, Then data dimuat ulang. | FR-009 |
| **US-009** | Sebagai **user**, saya ingin **melanjutkan draft dari device berbeda**, sehingga **pekerjaan tidak terputus**. | Given draft belum tersimpan, When login di device lain, Then draft yang sama terbaca & dapat dilanjutkan penyimpanannya (BR-011). | FR-010 |
| **US-010** | Sebagai **user IGD**, saya ingin **mengakses CPPT dari navbar EMR IGD**, sehingga **fitur IGD terpusat**. | Given EMR IGD terbuka, Then navbar menampilkan menu CPPT (menu lain menyusul seiring modulnya dikerjakan). | FR-012 |
| **US-012** | Sebagai **user IGD**, saya ingin **Transfer Internal & CPO tersinkron lintas titik akses**, sehingga **tidak ada data ganda/terpisah**. | Given akses via EMR IGD atau button existing, Then keduanya tersinkronisasi (BR-014). | FR-014 |
| **US-013** | Sebagai **user IGD**, saya ingin **peringatan bila pasien belum terdaftar**, sehingga **saya menyelesaikan pendaftaran dahulu**. | Given pasien belum terdaftar, When klik icon EMR IGD, Then popup "Pasien Belum Terdaftar" tampil dengan aksi OK (BR-001). | FR-013 |
| **US-014** | Sebagai **PPA pengisi**, saya ingin **menyalin data dari Riwayat Penunjang ke field CPPT sesuai izin role saya**, sehingga **tidak perlu mengetik ulang**. | 1) Given role Dokter/Farmasi, When klik Salin di Riwayat Resep, Then **Rencana Tindakan** (Farmasi: Plan) terganti dengan nama obat/dosis/aturan pakai (BR-025). 2) Given Lab/Patologi/Radiologi, When Salin, Then target = **Data Objektif Lainnya** (Dokter/Farmasi/Perawat-Bidan) atau **Assesmen** (Ahli Gizi) (BR-026–028). 3) Given Terapi Wicara/Okupasi/Fisioterapi, Then tombol Salin tidak tersedia; Perawat/Bidan & Ahli Gizi tidak dapat menyalin Resep (BR-029, §14.K). | FR-020 |
| **US-015** | Sebagai **Pemberi Pesan** yang dipilih pada read back, saya ingin **memverifikasi read back yang ditujukan ke saya**, sehingga **komunikasi tervalidasi**. | 1) Given saya Pemberi Pesan read back, When membuka dashboard, Then aksi Read Back muncul untuk saya (BR-031). 2) When klik Read Back → tampil info → klik Verifikasi, Then status read back menjadi "Terverifikasi" & read-only (BR-031, BR-032, BR-034). 3) Given read back Terverifikasi, Then saya tetap dapat menambahkan read back baru (BR-034). | FR-022 |

## 14. Data Requirements (Spesifikasi Field)

> Field demografi & identitas pasien **reuse dari modul Pendaftaran/Data Pasien**; DPJP dari **SPRI**; ICD-10 dari **Master ICD-10**; Pemberi Pesan (Read Back) & petugas Handover dari **Master Staf**.
> **Form CPPT bersifat per-role/disiplin** (sumber: `CPPT.xlsx`). Blok **Header** & **Informasi** sama untuk semua role; blok **Subjektif / Objektif / Assesmen–Plan / Read Back** berbeda per role. Role/disiplin: **Dokter, Perawat/Bidan, Ahli Gizi, Farmasi, Terapi Wicara, Terapi Okupasi, Fisioterapi.**

### A. Ringkasan struktur form per role
| Section | Dokter | Perawat/Bidan | Ahli Gizi | Farmasi | T. Wicara | T. Okupasi | Fisioterapi |
|---------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Header (identitas pasien) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Informasi (staff, lokasi, tgl/waktu) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subjektif (Keluhan + Riwayat Alergi) | ✓ | ✓ | –¹ | ✓ | ✓ | ✓ | ✓ |
| Objektif — Tanda Vital | ✓ | ✓ | – | ✓ | – | – | – |
| Objektif — khusus disiplin | – | – | – | – | ✓ | ✓ | ✓ |
| Assesmen–Plan | Dx **+ ICD-10** | Dx (tanpa ICD) | **ADIME**² | **DRP**³ | Dx + Intervensi | Dx + Intervensi | Dx + Intervensi |
| Read Back | ✓ | ✓ | ✓ | ✓ | – | – | – |

¹ Ahli Gizi tidak punya blok Subjektif; punya blok **Assesmen (+ Riwayat Alergi)** sebagai gantinya.
² **ADIME** = Assesmen · Diagnosis · Intervensi · Monitoring · Evaluasi.
³ **DRP** = Drug Related Problem (dropdown) + Uraian Permasalahan.

### B. Blok bersama — Header & Informasi (semua role) (FR-001, FR-008)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_pasien | Nama Pasien (+ status: Ny., Tn., dll.) | display | Ya | — | Autofill Data Pasien | Header. |
| no_rm | No. RM | display | Ya | — | Autofill Data Pasien | — |
| jenis_kelamin | Jenis Kelamin | display | Ya | — | Autofill Data Pasien | — |
| umur | Umur | display | Ya | — | Autofill Data Pasien | — |
| tgl_lahir | Tgl Lahir | display | Ya | — | Autofill Data Pasien | — |
| alamat | Alamat | display | Ya | — | Autofill Data Pasien | — |
| staff | Staff | display | Ya | — | Autofill by user login | Informasi. |
| lokasi_pasien | Lokasi Pasien | display | Ya | — | Autofill unit/bangsal | — |
| waktu_kejadian | Tanggal + Waktu | datepicker + input | Ya | dd/mm/yyyy + HH:mm | Autofill sistem — **editable & backdate** | Waktu kejadian klinis (BR-004). |

### C. Blok Subjektif standar — Dokter, Perawat/Bidan, Farmasi, T. Wicara, T. Okupasi, Fisioterapi (FR-001)
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| keluhan | Keluhan | text area | Ya | manual | — |
| riwayat_alergi | Riwayat Alergi | text field | Tidak | manual | Dapat tambah/hapus baris. |

### D. Blok Objektif — Tanda Vital — Dokter, Perawat/Bidan, Farmasi (FR-001, BR-017)
| Field | Label | Tipe | Wajib | Validasi/Format | Catatan |
|-------|-------|------|-------|-----------------|---------|
| tekanan_darah | Tekanan Darah | numerik | Ya | mmHg | — |
| suhu | Suhu | numerik | Ya | °C | — |
| nadi | Nadi | numerik | Ya | x/menit | — |
| rr | RR | numerik | Ya | x/menit | — |
| saturasi_o2 | Saturasi O2 | numerik | Ya | % | — |
| gds | GDS | numerik | Tidak | — | — |
| data_objektif_lain | Data Objektif Lainnya | text area | Tidak | teks | — |

### E. Blok Read Back — Dokter, Perawat/Bidan, Ahli Gizi, Farmasi (FR-018, FR-022)
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| beri_read_back | Beri Read Back | checkbox | Tidak | manual | Bila diceklis → blok Read Back aktif. Dapat **>1** read back & hapus. |
| rb_waktu | Tanggal + Waktu | datepicker + input | Ya | manual | Aktif bila Read Back diaktifkan. |
| rb_pemberi_pesan | Pemberi Pesan | dropdown multiple select | Ya | Master Staf | Penentu siapa yang berhak memverifikasi read back (BR-031). |
| rb_pesan | Pesan | text area | Tidak | manual | — |
| rb_status | Status Read Back | badge | — | sistem | **"Belum Diverifikasi"** (default) / **"Terverifikasi"** (BR-032). Setelah Terverifikasi → **read-only** (BR-034). |
| rb_verifikasi | Verifikasi (Read Back) | button/aksi | — | — | Muncul bila login = Pemberi Pesan; klik → tampil info → Verifikasi (BR-031). |

### F. Blok Assesmen–Plan per role (FR-001, BR-016)

**F.1 Dokter**
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| diagnosa_icd | Diagnosa + ICD-10 | text field + lookup | Ya | ICD dari Master data diagnosa | Dapat tambah/hapus baris. |
| rencana_tindakan | Rencana Tindakan | text field | Ya | manual | Dapat tambah/hapus baris. |
| instruksi_nakes | Instruksi Tenaga Kesehatan | text area | Tidak | manual | — |

**F.2 Perawat/Bidan** — sama seperti Dokter, **kecuali Diagnosa tanpa ICD-10**
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| diagnosa | Diagnosa | text field | Ya | manual | Tambah/hapus baris. **Tanpa ICD-10.** |
| rencana_tindakan | Rencana Tindakan | text field | Ya | manual | Tambah/hapus baris. |
| instruksi_nakes | Instruksi Tenaga Kesehatan | text area | Tidak | manual | — |

**F.3 Ahli Gizi** — format **ADIME** (menggantikan Subjektif/Objektif/Assesmen-Plan standar)
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| assesmen | Assesmen | text area | Ya | manual | Menggantikan Subjektif. |
| riwayat_alergi | Riwayat Alergi | text field | Tidak | manual | Tambah/hapus baris. |
| diagnosis | Diagnosis | text area | Ya | manual | — |
| intervensi | Intervensi | text area | Ya | manual | — |
| monitoring | Monitoring | text area | Ya | manual | — |
| evaluasi | Evaluasi | text area | Ya | manual | — |

**F.4 Farmasi**
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| drp | DRP (Drug Related Problem) | dropdown | Ya | Pilihan (lihat di bawah) | Tambah/hapus baris. |
| uraian_permasalahan | Uraian Permasalahan | text area | Ya | manual | — |
| plan | Plan | text field | Ya | manual | Tambah/hapus baris. |
| instruksi_nakes | Instruksi Tenaga Kesehatan | text area | Tidak | manual | — |

> Pilihan **DRP**: 1) Indikasi belum diterapi (Untreated Indication); 2) Pemilihan obat kurang sesuai (Improper Drug Selection); 3) Dosis sub terapi (Sub Therapeutical Dose); 4) Dosis berlebih (Overdosage); 5) Gagal mendapatkan terapi (Not Receiving Drugs); 6) Efek samping obat (Adverse Drug Reaction); 7) Interaksi obat (Drug Interaction); 8) Obat tanpa indikasi (Drug Use Without Indication); 9) Tidak ada masalah obat (No DRP).

**F.5 Terapi Wicara** — Objektif & Plan khusus (tanpa TTV, tanpa Read Back)
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| kemampuan_motorik | Kemampuan Motorik | text area | Wajib min. 1 | manual | Objektif. |
| pemeriksaan_khusus_bahasa | Pemeriksaan Khusus — Bahasa | text area | Wajib min. 1 | manual | Sub-section Pemeriksaan Khusus. |
| pemeriksaan_khusus_bicara | Pemeriksaan Khusus — Bicara | text area | Wajib min. 1 | manual | — |
| pemeriksaan_khusus_makan_menelan | Pemeriksaan Khusus — Makan Menelan | text area | Wajib min. 1 | manual | — |
| pemeriksaan_khusus_suara | Pemeriksaan Khusus — Suara | text area | Wajib min. 1 | manual | — |
| pemeriksaan_khusus_irama | Pemeriksaan Khusus — Irama Kelancaran | text area | Wajib min. 1 | manual | — |
| pemeriksaan_khusus_pendengaran | Pemeriksaan Khusus — Pendengaran | text area | Wajib min. 1 | manual | — |
| diagnosa | Diagnosa | text field | Ya | manual | Assesmen. |
| intervensi | Intervensi | dropdown multiple select | Ya | Pilihan (lihat di bawah) | Plan. |
| instruksi_nakes | Instruksi Tenaga Kesehatan | text area | Tidak | manual | — |

> Pilihan **Intervensi (Terapi Wicara)**: 1) Assesmen Awal; 2) Voice Exercise; 3) Speech Exercise; 4) Stuttering Exercise; 5) Oral Motor Exercise; 6) Breathing Exercise; 7) Swallowing Exercise; 8) Language Exercise.

**F.6 Terapi Okupasi** — Objektif & Plan khusus (tanpa TTV, tanpa Read Back)
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| pemeriksaan | Pemeriksaan | text area | Wajib min. 1 | manual | Objektif. |
| diagnosa | Diagnosa | text field | Ya | manual | Assesmen. |
| intervensi | Intervensi | dropdown multiple select | Ya | Pilihan (lihat di bawah) | Plan. |

> Pilihan **Intervensi (Terapi Okupasi)**: 1) Terapi Perilaku; 2) Assesmen dan Evaluasi; 3) Terapi Kognitif; 4) Terapi Rehabilitasi Okupasi; 5) Terapi Sensor Motor; 6) Terapi Fungsional; 7) Terapi Sensor Integrasi.

**F.7 Fisioterapi** — Objektif & Plan khusus (tanpa TTV, tanpa Read Back)
| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| nyeri_diam | Nyeri Diam | text field | Wajib min. 1 | manual | Objektif. |
| nyeri_gerak | Nyeri Gerak | text field | Wajib min. 1 | manual | — |
| kekuatan_otot | Kekuatan Otot | text field | Wajib min. 1 | manual | — |
| nyeri_tekan | Nyeri Tekan | text field | Wajib min. 1 | manual | — |
| inspeksi_statis_* | Inspeksi Statis — Oedem/Deformitas/Kontaktur/Kemerahan/Atopi (…di) | text field | Wajib min. 1 | manual | Sub-section Inspeksi Statis (5 field). |
| inspeksi_dinamis | Inspeksi Dinamis | checkbox | Wajib min. 1 | Pola Jalan / Sikap Tubuh / Pola Aktivitas Lain | Sub-section Inspeksi Dinamis. |
| palpasi_* | Palpasi — Peningkatan Suhu Lokal/Spasme/Pitting Oedem (…di) | text field | Wajib min. 1 | manual | Sub-section Palpasi (3 field). |
| diagnosa | Diagnosa | text field | Ya | manual | Assesmen. |
| intervensi | Intervensi | dropdown multiple select | Ya | Pilihan (lihat di bawah) | Plan. |
| instruksi_nakes | Instruksi Tenaga Kesehatan | text area | Tidak | manual | — |

> Pilihan **Intervensi (Fisioterapi)**: 1) Infra Red Radiation; 2) Parafin; 3) Short Wave Diatermi; 4) Ultra Sound Terapi; 5) TENS; 6) Terapi Latihan; 7) Bobath Exc; 8) Infra Red Radiation General; 9) Excercise General; 10) Stimulasi Faradic/Galvanic; 11) Sepeda Statis; 12) MLDV; 13) Tumbuh Kembang; 14) Chest Terapi; 15) Pijat Laktasi.

### G. Form HANDOVER — Serah Terima Antar Shift (FR-006)
> Dicatat **dari dalam layar CPPT IGD** (bukan modul terpisah); penanda muncul di antara entrian pada timeline yang sama. Field/opsi/mandatory mengikuti tab `Handover` pada `CPPT.xlsx` — **Pemberi & Penerima dipilih manual** (tanpa auto-fill).

| Field | Label | Tipe | Wajib | Sumber/Default | Catatan |
|-------|-------|------|-------|----------------|---------|
| pemberi | Pemberi | dropdown single select | Ya | Master Staf (manual) | — |
| penerima | Penerima | dropdown single select | Ya | Master Staf (manual) | — |
| shift_asal | Shift Asal | dropdown single select | Ya | Pilihan: 1) Pagi 2) Siang 3) Sore | Manual. |
| shift_tujuan | Shift Tujuan | dropdown single select | Ya | Pilihan: 1) Pagi 2) Siang 3) Sore | Manual. |
| jam_serah_terima | Jam Serah Terima | input | Ya | HH:mm; default = waktu kini, dapat diubah | **Menentukan posisi kronologis penanda** (BR-021). |
| catatan_handover | Catatan | input text | Tidak | manual | — |
| sisipkan | Sisipkan | button | Ya | — | Menyisipkan penanda ke timeline CPPT. |

### H. Data ter-generate saat Simpan (FR-001)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| entry_id | ID Entrian | string | dibuat otomatis oleh sistem | Kunci entrian. |
| nama_staff | Nama Staff | string | dari akun user login | Otomatis (BR-010). |
| role_staff | Role Staff | string | dari akun user login | Badge role; menentukan varian form (Dokter / Perawat/Bidan / Ahli Gizi / Farmasi / T. Wicara / T. Okupasi / Fisioterapi). |
| unit_lokasi | Lokasi/Unit Pasien | string | Master Unit / konteks IGD | `[PERLU KONFIRMASI]` format lokasi di IGD. |
| created_at_system | Waktu Input Sistem | datetime | dibuat otomatis oleh sistem | Untuk audit; berbeda dari waktu_kejadian. |
| is_edited | Penanda Diedit | boolean | dibuat otomatis oleh sistem | True bila entrian diubah (BR-006). |
| link_cppt_ri | Tautan ke CPPT RI | ref | dibuat otomatis oleh sistem | Bila pasien berlanjut ke RI (BR-012). |

### I. Layar TAMPIL — Dashboard CPPT IGD (FR-003)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal | entrian.waktu_kejadian | dd/mm/yyyy HH:mm WIB + unit | Sort desc (terbaru dulu) | Termasuk tombol Detail/Edit. |
| Hasil Pemeriksaan, Analisa & Penatalaksanaan | entrian (S/O/A) | blok SOAP | — | Subjective, Objective, Assessment. |
| Instruksi Tenaga Kesehatan (termasuk pasca bedah/prosedur) | entrian.instruksi_nakes + plan | teks/daftar | — | Plan & instruksi. |
| Nama Staff | entrian.nama_staff + role | teks + badge role | — | Badge sesuai role (7 varian). |
| Verifikasi | verifikasi DPJP | badge "Terverifikasi DPJP" / button (DPJP) + Verifikator | — | Button hanya untuk DPJP (BR-008). |
| Penanda HANDOVER | handover | baris pemisah (shift asal→tujuan, jam, pemberi→penerima) | Disisipkan kronologis per jam serah terima | Antar entrian (BR-013). |

### J. Panel Riwayat Pemeriksaan Penunjang (FR-015)
| Tab | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-----|-------------|-----------------|-------------|---------|
| Riwayat CPPT | entrian CPPT | kartu per tanggal | Kronologis; Tampilkan/Sembunyikan Semua | — |
| Riwayat Resep | resep | kartu per peresepan (CPPO) | Kronologis | Riwayat Alergi & Daftar Kronis tampil. Tombol **Salin** → §14.K. |
| Laboratorium | hasil lab | tabel (Pemeriksaan/Hasil/Unit/Nilai Normal/Metode) | Filter Tanggal & Unit | Nilai abnormal ditandai. **Checkbox** pilih pemeriksaan + **Salin** → §14.K. |
| Patologi | hasil patologi | kartu (Mikroskopik/Makroskopik/Kesimpulan/Saran) | Filter Tanggal & Unit | Tombol **Salin** → §14.K. |
| Radiologi | hasil radiologi | kartu + Hasil Imaging | Filter Tanggal & Unit | Tombol **Salin** → §14.K. |

### K. Aksi Salin (auto-replace) dari Riwayat Penunjang (FR-020)
> Tombol **Salin** pada tab Riwayat Penunjang menyalin data ke field CPPT dan **mengganti** (auto-replace) isi field target — bukan menambah. **Ketersediaan Salin berbeda per role** (BR-025–029).

**K.1 Matriks izin Salin per role** (✓ = boleh · ✗ = tidak; nilai = field target)
| Role | Riwayat Resep | Laboratorium | Patologi | Radiologi |
|------|---------------|--------------|----------|-----------|
| **Dokter** | ✓ Rencana Tindakan | ✓ Data Objektif Lainnya | ✓ Data Objektif Lainnya | ✓ Data Objektif Lainnya |
| **Farmasi** | ✓ Rencana Tindakan¹ | ✓ Data Objektif Lainnya | ✓ Data Objektif Lainnya | ✓ Data Objektif Lainnya |
| **Perawat/Bidan** | ✗ | ✓ Data Objektif Lainnya | ✓ Data Objektif Lainnya | ✓ Data Objektif Lainnya |
| **Ahli Gizi** | ✗ | ✓ **Assesmen** | ✓ **Assesmen** | ✓ **Assesmen** |
| **Terapi Wicara** | ✗ | ✗ | ✗ | ✗ |
| **Terapi Okupasi** | ✗ | ✗ | ✗ | ✗ |
| **Fisioterapi** | ✗ | ✗ | ✗ | ✗ |

¹ Pada form **Farmasi**, padanan field "Rencana Tindakan" adalah field **Plan**.

**K.2 Konten yang disalin per sumber**
| Tab sumber | Pemilihan | Konten yang disalin (auto-replace) | Rule |
|------------|-----------|-------------------------------------|------|
| Riwayat Resep | per kartu resep | Nama obat · dosis · aturan pakai | BR-025 |
| Laboratorium | **checkbox** per pemeriksaan | Pemeriksaan · Hasil · Unit (baris terpilih) | BR-026 |
| Patologi | per kartu | Kesimpulan | BR-027 |
| Radiologi | per kartu | Jenis Pemeriksaan · Hasil Pemeriksaan · Kesan | BR-028 |

*Pada role tanpa izin/target (mis. Terapi Wicara/Okupasi/Fisioterapi, atau Resep untuk Perawat-Bidan/Ahli Gizi), tombol Salin tidak tersedia.*

## 15. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Waktu buka/muat dashboard CPPT IGD < 1 detik (v1 kadang > 10 detik). | Metrik; FR-003 |
| **NFR-002** | Performa | Waktu simpan entrian CPPT < 1 detik. | Metrik; FR-001 |
| **NFR-003** | Skalabilitas | Stabil pada volume 100–150 pasien/hari, estimasi ~50 entrian/hari. | Metrik |
| **NFR-004** | Reliabilitas | Draft CPPT di-cache per akun user; dapat dibaca & dilanjutkan di device berbeda tanpa kehilangan data. | FR-010; BR-011 |
| **NFR-005** | Auditabilitas | Riwayat perubahan entrian tertelusur (perbandingan Sebelum vs Setelah Diubah); waktu kejadian & waktu sistem terpisah. | FR-004; BR-004 |
| **NFR-006** | Keamanan/RBAC | Verifikasi DPJP hanya untuk DPJP pasien; Verifikasi Read Back hanya untuk Pemberi Pesan; Edit hanya untuk pembuat entrian; user lain read-only. | FR-007; FR-021; FR-022; BR-008; BR-030; BR-031 |
| **NFR-007 `[**]`** | Konsistensi | Transfer Internal & CPO tersinkronisasi lintas titik akses (EMR IGD & button/icon existing) — berlaku saat menu-nya hadir di navbar EMR IGD. | FR-014; BR-014 |
| **NFR-008** | Real-Time | Entrian tersimpan langsung tampil pada riwayat kronologis. | FR-003 |

## 16. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **SPRI** | Sumber DPJP CPPT IGD. | Internal | FR-016; BR-007 |
| **CPPT Rawat Inap** | Tujuan keterhubungan data entrian. | Internal | FR-011; BR-012 |
| **Master ICD-10** | Dropdown kode diagnosa. | Internal | FR-001; BR-016 |
| **Master Staf** | Nama Staff & role otomatis; Pemberi Pesan Read Back. | Internal | FR-001; BR-010 |
| **Master Unit** | Lokasi/unit pasien. | Internal | FR-001 |
| **Pendaftaran IGD** | Sumber No. RM & status terdaftar (gate popup). | Internal | FR-013; BR-001 |
| **CPO & Transfer Internal** | Sibling EMR IGD; sinkronisasi lintas titik akses. | Internal | FR-014; BR-014 |
| **Master Diagnosa Keperawatan** | Dropdown diagnosa perawat. | Internal |  |
| **Master Tindakan Keperawatan** | Dropdown rencana tindakan perawat berdasarkan mappingan dari diagnosa perawat. | Internal |  |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD CPPT Rawat Inap | Hard | Keterhubungan data entrian ke RI tidak dapat direalisasikan. |
| PRD SPRI | Hard | DPJP tidak dapat terisi; verifikasi tertunda. |
| Pendaftaran IGD (No. RM) | Hard | Gate akses & popup tidak berfungsi. |
| BE penyedia data CPPT RI/IGD (untuk tampilan gabungan) | Soft `[**]` | Data sudah disediakan BE; UI tampilan gabungan dibuat saat modul RI dikerjakan (Fase 2). |

> Catatan BPJS: dukungan terhadap kelengkapan dokumen untuk **verifikasi klaim BPJS** merupakan manfaat hilir dari kelengkapan dokumentasi CPPT IGD, bukan integrasi API langsung pada modul ini.

## 17. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Sumber DPJP | DPJP dari dokter yang dipilih saat pendaftaran IGD; bertambah bila SPRI dibuat (dapat >1) (BR-007). |
| D-02 | Verifikasi DPJP | Button hanya untuk DPJP pasien tersebut; label "Terverifikasi DPJP" untuk role lain; dapat berulang dalam satu hari (BR-008, BR-009). |
| D-03 | Backdate | Tanggal & jam = waktu kejadian klinis; berlaku untuk entrian baru & existing (BR-004, BR-005). |
| D-04 | Caching draft | Per akun user, bukan per device; dapat dilanjutkan lintas device (BR-011). |
| D-05 | Sinkronisasi | Transfer Internal & CPO tersinkronisasi antara EMR IGD dan button/icon existing (BR-014). |
| D-06 | Gate akses | Bila pasien belum terdaftar (belum ada No. RM), tampilkan popup "Pasien Belum Terdaftar" (BR-001, FR-013). |
| D-07 | Form per-role | Form CPPT punya 7 varian (Dokter, Perawat/Bidan, Ahli Gizi, Farmasi, T. Wicara, T. Okupasi, Fisioterapi); Header+Informasi sama, sisanya berbeda per mapping `CPPT.xlsx` (BR-022). ICD-10 hanya di form Dokter (BR-016); TTV hanya Dokter/Perawat/Farmasi (BR-017). |
| D-08 | Handover | Aksi petugas dari dalam CPPT; **Pemberi & Penerima dipilih manual** dari Master Staf (tanpa auto-fill); shift Pagi/Siang/Sore manual; posisi ikut jam serah terima (BR-013, BR-019, BR-020, BR-021). |
| D-09 | Read Back | Masuk Fase 1 untuk Dokter/Perawat-Bidan/Ahli Gizi/Farmasi; dapat >1 & dihapus (BR-023). |
| D-10 | Hapus entri | Hapus berlaku untuk entri yang **masih dalam proses input** (bukan CPPT tersimpan di dashboard); kontrol akses tidak per-role (BR-024). |
| D-11 | Navbar EMR IGD | Saat ini navbar hanya berisi menu CPPT; menu lain (Asesmen Kebidanan/Persalinan, CPO, Transfer Internal, Riwayat Penunjang) & sinkronisasinya menyusul seiring modulnya dikerjakan (FR-012, FR-014). |
| D-12 | Tampilan gabungan CPPT (Fase 2) | UI gabungan RI/IGD dibuat saat modul RI dikerjakan; data sudah disediakan BE (BR-018, FR-017). |
| D-13 | Salin dari Riwayat Penunjang (per role) | Auto-replace, izin & target per role (§14.K): **Resep** → Rencana Tindakan hanya Dokter & Farmasi (Farmasi=Plan); **Lab/Patologi/Radiologi** → Data Objektif Lainnya (Dokter/Farmasi/Perawat-Bidan) atau Assesmen (Ahli Gizi); Terapi Wicara/Okupasi/Fisioterapi tidak dapat menyalin (BR-025–029). |
| D-14 | Kontrol Edit | Button Edit pada dashboard list enable hanya bila login = pembuat entrian (BR-030). |
| D-15 | Verifikasi Read Back | Aksi Read Back muncul hanya untuk Pemberi Pesan; klik Read Back → tampil info → Verifikasi → status "Terverifikasi". Read back berstatus "Belum Diverifikasi"/"Terverifikasi" (BR-031, BR-032). Verifikasi DPJP: klik → isi catatan → Verifikasi (BR-033). |
| D-16 | Edit setelah verifikasi | Data CPPT tetap dapat diedit setelah verifikasi; status DPJP tidak ter-reset. Read Back "Terverifikasi" read-only; read back "Belum Diverifikasi" masih dapat diedit; read back baru boleh ditambah (BR-034). |

## 18. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Input CPPT **7 varian form per-role**, multi-entrian, tampilan kronologis, edit entrian (tanda edit) + hapus entri saat proses input, backdate, **handover (Pemberi & Penerima manual, shift Pagi/Siang/Sore)**, **Read Back** (Dokter/Perawat-Bidan/Ahli Gizi/Farmasi), verifikasi DPJP, header pasien & DPJP, Refresh Data, caching per akun user, akses via navbar EMR IGD (**saat ini hanya menu CPPT**), popup pasien belum terdaftar, panel Riwayat Penunjang, keterhubungan ke CPPT RI. Sinkronisasi Transfer Internal & CPO menyusul saat menu-nya hadir di navbar. |
| **Fase 2** `[**]` | Tampilan gabungan data CPPT lintas layanan (RI/IGD) dalam satu UI — **UI dibuat saat modul RI dikerjakan** (data sudah disediakan BE). |

## 19. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Penyalahgunaan backdate (waktu kejadian tidak sesuai). | Simpan waktu sistem terpisah untuk audit; tandai entrian yang diedit; riwayat perubahan tertelusur (NFR-005). |
| R2 | Konflik draft antar-device (edit paralel dari dua device satu akun). | Tetapkan strategi resolusi (last-write-wins vs lock). `[PERLU KONFIRMASI]` |
| R3 | Beban muat banyak entrian (~50/hari) menahan performa. | Pagination/lazy-load; target muat < 1 detik (NFR-001). |
| R4 | DPJP awal bergantung pada pemilihan dokter saat pendaftaran IGD. | Pastikan dokter terpilih saat pendaftaran; DPJP bertambah otomatis saat SPRI dibuat (BR-007). |

## 20. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| v2.0 | 09 Juli 2026 | Team Product | Draft awal PRD CPPT IGD berdasarkan Requirement CPPT IGD, catatan (Main Goals / Feature Capabilities / Performance / Scope / Expected Improvement), dan screenshot tampilan CPPT v1 (staging PKU Wonosobo). |
| v2.1 | 09 Juli 2026 | Team Product | **Form CPPT per-role/disiplin** (7 varian: Dokter, Perawat/Bidan, Ahli Gizi, Farmasi, Terapi Wicara, Terapi Okupasi, Fisioterapi) berdasarkan `CPPT.xlsx` — §14 di-restrukturisasi (blok bersama + per-role), Persona, Scope, BR-016/017 + BR-019–023, FR-001/006/018 + FR-019, US-001/004, Keputusan Desain D-07–09. **Mekanisme HANDOVER** + form-nya di §14.G. Read Back dikonfirmasi masuk Fase 1 untuk 4 role. |
| v2.2 | 09 Juli 2026 | Team Product | Klarifikasi: (1) role pemakai = 7 disiplin (DPJP = verifikator) di §1; (2) Fase 2 tampilan gabungan RI/IGD — UI dibuat saat modul RI dikerjakan; (3) navbar EMR IGD **saat ini hanya menu CPPT**, menu lain + sinkronisasi Transfer Internal/CPO menyusul; (4) panel Riwayat Penunjang **dikonfirmasi**; (5) hapus entrian. Keputusan Desain D-10–12 ditambah. |
| v2.3 | 09 Juli 2026 | Team Product | (1) Skenario 1 dibuat daftar bernomor vertikal; (2) Skenario 5 (Pasien belum terdaftar) dihapus dari Main Flow; (3) **BR-007** DPJP = dari dokter pendaftaran IGD + bertambah saat SPRI dibuat (D-01, FR-016, US-007, §5, §11, R4); (4) **BR-015 dihapus**; (5) BR-020 — penurunan shift otomatis Fase 2 dihapus (juga di Roadmap); (6) **Hapus** = entri saat proses input (bukan CPPT tersimpan), kontrol akses tidak per-role (BR-024, D-10, FR-004, §10, US-003); (7) **Handover manual** — Pemberi & Penerima dropdown manual tanpa auto-fill (BR-019, FR-006, §14.G, §10, US-004, D-08); (8) **Bagian Asumsi & Pertanyaan Terbuka dihapus**; Change Log dinomori ulang menjadi §20. |
| v2.4 | 09 Juli 2026 | Team Product | **Aksi Salin (auto-replace) dari Riwayat Penunjang** — Riwayat Resep → Rencana Tindakan; Laboratorium (pilih checkbox) → Data Objektif Lainnya (pemeriksaan/hasil/unit); Patologi → Data Objektif Lainnya (Kesimpulan); Radiologi → Data Objektif Lainnya (jenis/hasil/kesan). Ditambah FR-020, BR-025–029, US-014, §14.J (catatan Salin) + §14.K (mapping), D-13, Scope #13. |
| v2.5 | 09 Juli 2026 | Team Product | Kontrol akses & verifikasi pada dashboard list: (1) **Edit** enable hanya untuk pembuat entrian (BR-030, FR-021, D-14); (2) **Verifikasi Read Back** oleh Pemberi Pesan — klik Read Back → tampil info → Verifikasi (BR-031, FR-022, US-015, D-15); (3) **Verifikasi DPJP** dengan input catatan (BR-033, FR-007, US-006); (4) **Status Read Back** "Belum Diverifikasi"/"Terverifikasi" di §14.E (BR-032); (5) Edit setelah verifikasi tidak me-reset DPJP, Read Back Terverifikasi read-only, read back baru boleh ditambah (BR-034, D-16) — menuntaskan `[PERLU KONFIRMASI]` lama. State Machine §9, Aksi §10, Display Rules §11, NFR-006 diperbarui; Skenario 3–5 di §7. |
| v2.6 | 09 Juli 2026 | Team Product | **Matriks izin Salin per role** (§14.K): **Resep** → Rencana Tindakan hanya **Dokter & Farmasi** (Farmasi = field Plan; konten kini nama obat/dosis/aturan pakai); **Lab/Patologi/Radiologi** → **Data Objektif Lainnya** (Dokter/Farmasi/Perawat-Bidan) atau **Assesmen** (Ahli Gizi); **Terapi Wicara/Okupasi/Fisioterapi** tidak dapat menyalin; Perawat/Bidan & Ahli Gizi tidak dapat menyalin Resep. BR-025–029, FR-020, US-014, D-13 diperbarui. |
