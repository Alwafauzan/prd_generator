# PRODUCT REQUIREMENT DOCUMENT
## Dashboard Pelayanan Hemodialisa
**Neurovi SIMRS v2 · Modul Pelayanan — Versi 1.5**

| Field | Isi |
|---|---|
| Dokumen ID | PRD-P-DSH-HD-v1.5 |
| Modul | Pelayanan > Dashboard Pelayanan Hemodialisa (HD) |
| Menempel pada | Pola dasar mengikuti Dashboard Pelayanan Rawat Jalan (PRD-P-DSH-RJ) |
| Versi Dokumen | 1.5 (Draft — Untuk Direview) |
| Tanggal Disusun | 6 Juli 2026 (rev. 7 Juli 2026) |
| Penyusun | Team Product — Tamtech International |
| Approver | M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) |
| Reviewer Teknis | Tim Pradev |
| Status | Untuk Direview |
| Referensi V1 | Screenshot dashboard Hemodialisa V1; tiket [ENHANCE] Indikator Pasien Kontrol di HD |

**Perubahan v1.4 → v1.5**
- **Disposisi & Modal Status Keluar → PRD Discharge.** Dashboard hanya menyediakan **Kolom Status Tindak Lanjut** (menampilkan hasil disposisi); daftar opsi & perilaku tiap disposisi (RJ maupun RI) **didefinisikan di PRD Discharge**, bukan di dashboard ini. Dashboard hanya *commit* alur normal auto-penyelesaian: RJ = "pulangkan", RI = "Selesai Sesi HD".
- **Badge Konsul/Rujuk dihapus.** Konsul/rujuk internal bukan badge tersendiri — menjadi salah satu **nilai disposisi pada Kolom Status Tindak Lanjut**.
- Enumerasi 6 disposisi RJ & aturan per-disposisi (validasi Rawat Inap, Meninggal no-trigger, dsb) dipindahkan ke ranah PRD Discharge.

**Perubahan v1.3 → v1.4**
- Ditambahkan **Kolom Status Tindak Lanjut** (sebelum kolom Aksi), selaras Dashboard RJ & IGD (§9).
- Auto-penyelesaian (BR-013/BR-014) tidak berubah; hanya kini menyetel nilai pada Kolom Status Tindak Lanjut.

**Perubahan v1.2 → v1.3**
- Tab RI: kolom Surat Kontrol tidak ditampilkan, **digantikan kolom Asal Unit** pada posisi tsb.
- Seluruh Open Questions diselesaikan — sumber sesi/shift = Jadwal Praktik Dokter; masuknya pasien RI ke antrian HD mengikuti PRD Pelayanan Rawat Inap; penanda SEP juga berlaku untuk pasien RI BPJS.

---

## Ringkasan Eksekutif

Dokumen ini mendefinisikan **Dashboard Pelayanan Hemodialisa (HD)** versi 1.3 — layar operasional tempat perawat dan dokter unit HD mengelola alur pelayanan dialisis harian, sekaligus *single source of truth* status layanan per pasien di unit HD.

Perbedaan utama dashboard HD dibanding Dashboard Pelayanan Rawat Jalan adalah **unit HD melayani dua kohort pasien sekaligus**: pasien **Rawat Jalan (RJ)** yang datang untuk dialisis rutin, dan pasien **Rawat Inap (RI)** yang dikirim dari bangsal untuk menjalani dialisis lalu kembali ke bangsal. Kedua kohort dipisahkan secara antrian, urutan, dan perlakuan keluar.

Versi V2 memperbaiki keterbatasan V1: (a) auto-pemulangan tanpa kriteria sehingga pasien yang belum dilayani ikut ter-*discharge* dan mencemari data casemix/kunjungan; (b) pasien RI dan RJ tercampur dalam satu dashboard sehingga membingungkan petugas; (c) counter status hanya dua state; dan (d) performa lambat saat menampilkan/mencari data pasien. Versi ini juga mempertahankan fitur produksi V1 berupa **indikator "Perlu Kontrol"** yang bersumber dari jadwal kontrol kembali pada surat kontrol.

---

## 1. Tujuan & Latar Belakang

### 1.1 Tujuan
Menyediakan dashboard operasional agar perawat dan dokter unit HD dapat **melihat seluruh pasien yang akan dilayani** pada hari itu, memantau status layanan tiap pasien secara *real-time*, dan menjalankan alur dialisis dengan pemisahan yang jelas antara pasien RJ dan RI.

### 1.2 Perbaikan dari V1
| No | Aspek | Kondisi V1 (As-Is) | Perbaikan V2 (To-Be) |
|---|---|---|---|
| 1 | Auto-pemulangan | Berjalan tanpa kriteria; pasien yang tidak dilayani ikut otomatis pulang → *false data* casemix & reporting | Auto-penyelesaian hanya berjalan bila memenuhi kriteria (BR-013) |
| 2 | Pemisahan kohort | Pelayanan RI dan RJ tercampur satu dashboard → membingungkan petugas | Kohort **dipisah via Tab** `Rawat Jalan` \| `Rawat Inap`, masing-masing punya antrian, urutan, & counter sendiri (D-01) |
| 3 | Counter status | Hanya dua state (dilayani / belum dilayani) | Tiga state: **belum dilayani / sedang dilayani / selesai dilayani** + total, per tab |
| 4 | Filter sesi | Tidak ada filter jam/shift praktik | Filter **sesi/shift praktik** (mis. dokter praktik pagi/sore/malam di hari yang sama difilter per jam) |
| 5 | Filter dokter | Tidak ada | Filter berdasarkan dokter |
| 6 | Keterbacaan | Baris antar pasien sulit dibedakan | Pembedaan baris (row) yang jelas |
| 7 | Performa | Terasa lambat saat menampilkan & mencari | Target akses & pencarian `< 1 detik` (NFR-01, NFR-02) |
| 8 | Akurasi status | Tidak selalu real-time | Status *event-driven*, konsisten & real-time |

> Fitur **indikator "Perlu Kontrol"** (dari surat kontrol) tetap dipertahankan dari V1 (§7, BR-022/BR-023).

---

## 2. Cakupan (Scope)

### 2.1 In-Scope
1. Menampilkan **data antrian pasien HD** dengan **pemisahan kohort RJ dan RI** melalui tab.
2. Menampilkan **status layanan per pasien** atas 9 checkpoint (§8).
3. **Kolom tab RI dan RJ: Asal Unit** (bangsal asal pasien dan klinik asal) — menempati posisi kolom Surat Kontrol (yang tidak ditampilkan pada tab RI).
4. **Filter** berdasarkan tanggal layanan, nama dokter, dan sesi/shift praktik.
5. **Pagination** — user memilih jumlah item per tabel, atau menampilkan seluruh pasien sesuai filter.
6. **Pencarian** pasien berdasarkan **No. RM** atau **nama**.
7. **Counter status pelayanan** (tiga state) + total, dihitung per tab.
8. **Penanda SEP** (khusus BPJS) — SEP sudah dibuat pada registrasi tsb.
9. **Penanda pasien prioritas** (`data_sosial.kartu_prioritas == "Ya"` terdaftar hari itu).
10. **Indikator "Perlu Kontrol"** per baris pasien, bersumber dari tanggal kontrol kembali pada surat kontrol (§7, BR-022).
11. **Auto-penyelesaian pasien berdasarkan syarat** (BR-013): RJ → **Pulang**; RI → **Pulangkan Pasien = Selesai Sesi HD** (kembali ke bangsal, bukan discharge RS).
12. **Kolom Status Tindak Lanjut** — menampilkan disposisi keluar pasien; di-set via **Modal Status Keluar** (manual) atau job auto-penyelesaian (§9).
13. Akses **pengisian Asesmen Dokter, Asesmen Perawat & Monitoring HD** dari baris pasien.
14. **Order Radiologi tetap dapat dilakukan** dari alur pelayanan pasien (aksi/menu order), namun **tidak** ditampilkan sebagai kolom status checkpoint pada dashboard.
15. **Routing e-resep** mempertahankan behavior V1 (§6.3), bersumber mapping MD Gudang & Farmasi.

### 2.2 Out-of-Scope
1. Isi/form detail Asesmen Dokter/Perawat, Monitoring HD, Input Tindakan & BHP, Order Alkes, Order Radiologi (PRD modul masing-masing).
2. **Mekanisme masuknya pasien RI dari bangsal ke unit HD** (mengikuti PRD Pelayanan Rawat Inap, D-04).
3. Modul Farmasi (RJ/HD/RI), Lab, Radiologi, E-Resep (dashboard hanya *membaca* statusnya / menyediakan aksi order).
4. Konfigurasi jadwal/shift praktik & mapping farmasi (di master data masing-masing).
5. **Kolom checkpoint Radiologi** pada dashboard (dikecualikan atas keputusan D-08).
6. Detail **daftar opsi & perilaku disposisi keluar (Modal Status Keluar)** — RJ maupun RI → **PRD Discharge**. Dashboard hanya menampilkan hasilnya pada Kolom Status Tindak Lanjut.
7. Detail flow **Rujuk Internal / Rujuk Eksternal** (Form Rujuk, transfer DPJP, surat rujukan) → PRD terkait; tidak dienumerasi di dashboard.
8. Modul **sertifikat kematian** — penanganan disposisi Meninggal mengikuti PRD Discharge.
9. Layar Display Antrian ruang tunggu HD (bila diperlukan → PRD terpisah).

---

## 3. Modul Terkait (Related Features)

| Modul | Peran terhadap Dashboard HD |
|---|---|
| Pendaftaran RJ | Sumber pasien RJ, no. antrian, tanggal kunjungan, cara bayar, klinik/dokter |
| Pelayanan Rawat Inap *(PRD terkait)* | Sumber pasien RI + data **Asal Unit** ke antrian HD |
| Asesmen Hemodialisa (Dokter) | *Event source* checkpoint As. Dokter (tri-state); syarat auto-penyelesaian |
| Asesmen Hemodialisa (Perawat) | *Event source* checkpoint As. Perawat (tri-state); syarat auto-penyelesaian |
| Monitoring Hemodialisa | *Event source* checkpoint Monitoring HD (tri-state); **syarat auto-penyelesaian** |
| Input Tindakan & BHP | *Event source* checkpoint Tindakan (tri-state); syarat auto-penyelesaian |
| Order Alkes | *Event source* checkpoint Order Alkes (tri-state) |
| Order Lab | *Event source* checkpoint Lab (tri-state) |
| Order Radiologi | Aksi order dari alur pelayanan (tidak jadi kolom dashboard) |
| E-Resep | *Event source* checkpoint E-resep Obat (agregat Obat Pulang + CPO, BR-011) |
| Surat Kontrol | *Event source* checkpoint Surat Kontrol (bi-state; RJ) **dan** sumber indikator "Perlu Kontrol" (tanggal kontrol kembali) |
| Billing / Kasir | *Event source* checkpoint Bayar (tri-state) |
| Integrasi BPJS VClaim | Sumber data SEP untuk penanda SEP pasien BPJS |
| MD Jadwal Praktik | Sumber sesi/shift praktik dokter (filter sesi) |
| MD Gudang & Farmasi | Sumber mapping routing e-resep (Obat Pulang / CPO × RJ / RI) |
| MD Unit / RBAC | Privilege role untuk aksi asesmen & penyelesaian |

---

## 4. User Stories

| ID | Sebagai | Ingin | Sehingga |
|---|---|---|---|
| US-01 | Perawat HD | melihat daftar pasien HD hari ini per kohort (RJ/RI) | tahu antrian & urutan pelayanan |
| US-02 | Perawat HD | memfilter berdasarkan dokter, tanggal, sesi/shift praktik | fokus pada pasien di sesi saya |
| US-03 | Perawat/Dokter HD | mengisi Asesmen Dokter, Asesmen Perawat & Monitoring HD dari baris pasien | proses asesmen & monitoring dialisis tercatat |
| US-04 | Perawat/Dokter HD | melihat status tiap checkpoint pasien real-time | tahu langkah mana yang belum/sedang/sudah dikerjakan |
| US-05 | Perawat HD | mencari pasien via No. RM atau nama | cepat menemukan pasien tertentu |
| US-06 | Perawat HD | memilih jumlah item per tabel atau menampilkan semua | menyesuaikan tampilan dengan volume pasien |
| US-07 | Petugas HD | melihat penanda SEP pada pasien BPJS | tahu SEP sudah dibuat pada registrasi tsb |
| US-08 | Petugas HD | melihat penanda pasien prioritas | pasien pemegang kartu prioritas terlayani sesuai haknya |
| US-09 | Petugas HD | melihat counter total & per-status (3 state) tiap kohort | memantau beban & progres pelayanan hari itu |
| US-10 | Petugas HD | melihat **Asal Unit** pasien RI dan RJ | tahu bangsal asal untuk pengembalian pasien |
| US-11 | Petugas HD | melihat indikator **"Perlu Kontrol"** pada pasien yang jadwal kontrol kembalinya jatuh hari ini | pasien tsb dikonsultasikan ke dokter spesialis di hari itu |
| US-12 | Dokter HD | pasien RJ yang selesai lengkap otomatis dipulangkan | data kunjungan & casemix akurat tanpa input manual |
| US-13 | Dokter HD | pasien RI yang selesai lengkap otomatis ditandai **Selesai Sesi HD** | pasien kembali ke bangsal tanpa ter-*discharge* dari RS |
| US-14 | Petugas HD | antrian RJ & RI terpisah dengan urutan sendiri | tidak keliru membaca/melayani lintas kohort |
| US-15 | Dokter/Perawat HD | menetapkan disposisi keluar pasien (pulang, rujuk, meninggal, dll) via Modal Status Keluar | status tindak lanjut pasien tercatat jelas & terstruktur |

---

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | Dashboard menampilkan **dua tab kohort**: `Rawat Jalan` & `Rawat Inap`, dengan **jumlah pasien pada label tab** (mis. `Rawat Jalan (30)`). |
| FR-02 | Setiap tab menampilkan tabel pasien dengan **nomor antrian independen** per kohort (mis. HD-001, HD-002, …). |
| FR-03 | Kolom tabel (tab RJ): No. Antrian, Nama (+ badge SEP inline bila BPJS + penanda prioritas + indikator Perlu Kontrol), No. RM, Cara Pembayaran, Klinik (+ dokter), 9 kolom checkpoint (§8), **Status Tindak Lanjut**, indikator status pelayanan. |
| FR-04 | Kolom tabel (tab RI): **sama dengan RJ, namun kolom Surat Kontrol tidak ditampilkan dan digantikan kolom `Asal Unit`** (bangsal asal) pada posisi tsb. Kolom **Status Tindak Lanjut** tetap tampil. |
| FR-05 | **Filter**: tanggal layanan (default hari ini), nama dokter, sesi/shift praktik. Filter sesi menampilkan **jam aktual** dari MD Jadwal Praktik, bukan kategori. |
| FR-06 | Filter bersifat *additive* (AND) terhadap filter tanggal, dievaluasi dalam tab aktif. |
| FR-07 | **Pencarian** pasien via No. RM atau nama, aktif dalam tab kohort yang dibuka. |
| FR-08 | **Pagination**: user memilih jumlah item per tabel (default mengikuti V1 = 5); tersedia opsi menampilkan seluruh pasien sesuai filter. |
| FR-09 | **Counter status** per tab (tiga state): total pasien + *belum dilayani* / *sedang dilayani* / *selesai dilayani*, real-time dari agregasi checkpoint. |
| FR-10 | **Penanda SEP** dievaluasi untuk pasien BPJS (baik RJ maupun RI); menampilkan checklist bila SEP sudah dibuat pada registrasi tsb. |
| FR-11 | **Penanda prioritas** aktif bila `data_sosial.kartu_prioritas == "Ya"` pada tanggal pendaftaran. |
| FR-12 | **Indikator "Perlu Kontrol"** ditampilkan per baris bila memenuhi BR-022 (tanggal kontrol kembali pada surat kontrol terakhir ke poli Hemodialisa == tanggal layanan aktif). |
| FR-13 | Setiap baris menyediakan **akses cepat** membuka Asesmen Dokter, Asesmen Perawat & Monitoring HD (sesuai privilege role). |
| FR-14 | **9 checkpoint** ditampilkan sebagai kolom status: As. Dokter, As. Perawat, Monitoring HD, Tindakan, Lab, E-resep Obat, Order Alkes, Surat Kontrol, Bayar (§8). Status **read-only** di dashboard. |
| FR-15 | Kolom **E-resep Obat** = agregat sub-resep Obat Pulang + CPO (BR-011). |
| FR-16 | **Order Radiologi** dapat dilakukan dari alur pelayanan pasien; **tidak** ditampilkan sebagai kolom status pada dashboard (D-08). |
| FR-17 | **Auto-penyelesaian** oleh *background job* (BR-013): pasien memenuhi syarat diselesaikan otomatis — **RJ → Pulang**, **RI → Pulangkan Pasien = Selesai Sesi HD** (kembali ke bangsal). |
| FR-18 | Pembedaan baris (row) antar pasien jelas secara visual. |
| FR-19 | Data dashboard *auto-refresh*/real-time atas perubahan status checkpoint dari modul sumber. |
| FR-20 | **Kolom Status Tindak Lanjut** (sebelum kolom Aksi) menampilkan disposisi pasien; nilai berasal dari job auto-penyelesaian (BR-014) atau penetapan manual. |
| FR-21 | Alur normal Status Tindak Lanjut di-set oleh auto-penyelesaian: **RJ = "pulangkan"**, **RI = "Selesai Sesi HD"**. |
| FR-22 | Penetapan disposisi manual dilakukan via aksi/Modal Status Keluar pada baris pasien; **daftar opsi & perilaku tiap disposisi (RJ maupun RI) mengikuti PRD Discharge** — tidak didefinisikan di dashboard ini. |

---

## 6. Business Process

### 6.1 Alur Utama (To-Be)
**Pasien RJ**
> Terdaftar (Pendaftaran RJ dan Pendaftaran IGD berdasarkan dari trigger **Order Hemodialisa**) → antrian tab **Rawat Jalan** dan dibedakan berdasarkan **Asal Unit**
> → Perawat: Asesmen Perawat · Dokter: Asesmen Dokter (checkpoint → Selesai)
> → Pelaksanaan dialisis: Monitoring HD diisi selama sesi (→ Selesai)
> → Input Tindakan & BHP + order (Alkes / Lab / Radiologi / E-Resep) sesuai kebutuhan
> → **Keluar**: (a) otomatis via job bila kriteria BR-013 terpenuhi → Status Tindak Lanjut = "pulangkan"; atau (b) manual via aksi Status Keluar — **opsi & perilaku disposisi mengikuti PRD Discharge**
> → Keluar dari antrian RJ; data → casemix & reporting kunjungan.

**Pasien RI**
> Dikirim dari bangsal (mengikuti PRD Pelayanan Rawat Inap, membawa data **Asal Unit**) → antrian tab **Rawat Inap**
> → Asesmen Dokter/Perawat → Monitoring HD → Tindakan & BHP + order (bila ada)
> → **Keluar**: (a) otomatis via job bila kriteria BR-013 terpenuhi → **"Selesai Sesi HD"**; atau (b) manual (opsi disposisi RI mengikuti PRD Discharge)
> → Pasien **kembali ke bangsal (Asal Unit)**; episode rawat inap **tetap aktif** (bukan discharge RS).

### 6.2 Perbedaan Perlakuan Keluar RJ vs RI
| Aspek | Pasien RJ | Pasien RI |
|---|---|---|
| Syarat auto (BR-013) | As. Dokter + As. Perawat + Tindakan + Monitoring HD = Selesai | (sama) |
| Aksi sistem | **Pulang** (akhiri kunjungan RJ) | **Pulangkan Pasien = Selesai Sesi HD** → kembali ke bangsal |
| Efek status RI | — | **Tidak** men-*discharge* dari RS; episode RI tetap aktif |
| Aliran data | Casemix & reporting kunjungan RJ | Sesi HD tercatat pada episode rawat inap |
| Kolom Surat Kontrol | Berlaku | Tidak ditampilkan |
| Kolom Asal Unit | — | Berlaku (menempati slot Surat Kontrol) |

### 6.3 Routing E-Resep (dipertahankan dari V1)
| Sumber | Jenis order | Tujuan farmasi |
|---|---|---|
| Pasien RJ | E-resep obat dibawa pulang | Farmasi **Rawat Jalan** |
| Pasien RJ | Order pelayanan **CPO** | Farmasi **Hemodialisa** |
| Pasien RI | E-resep obat dibawa pulang | Farmasi **Rawat Inap** |
| Pasien RI | Order pelayanan **CPO** | Farmasi **Rawat Inap** |

> Mapping tujuan farmasi bersumber dari setting user pada **MD Gudang & Farmasi** (BR-012).

---

## 7. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Dashboard hanya menampilkan pasien dengan tanggal layanan HD sama dengan filter tanggal aktif. |
| BR-002 | Default tanggal layanan = hari ini (server date WIB). |
| BR-003 | Pasien dipisah ke tab **RJ** atau **RI** berdasarkan jenis rawat saat masuk antrian HD; masing-masing punya nomor urut/antrian independen. |
| BR-004 | Filter dokter & sesi/shift praktik bersifat *additive* (AND) terhadap filter tanggal, dievaluasi dalam tab aktif. |
| BR-005 | Counter status per tab (3 state) dihitung real-time dari agregasi checkpoint, bukan field statis. |
| BR-006 | Penanda SEP hanya dievaluasi untuk pasien dengan `cara_bayar` mengandung "BPJS"; pasien non-BPJS menampilkan kolom kosong. |
| BR-007 | Penanda prioritas aktif bila `data_sosial.kartu_prioritas == "Ya"` pada tanggal pendaftaran. |
| BR-008 | Checkpoint **As. Dokter, As. Perawat, Monitoring HD, Tindakan, Lab, E-resep Obat, Order Alkes, Bayar** bertipe **tri-state**: Tidak Diisi → Sedang Diproses → Selesai. |
| BR-009 | Checkpoint **Surat Kontrol** bertipe **bi-state** (Belum Dibuat / Sudah Dibuat); hanya berlaku pada kohort RJ. Pada kohort RI kolom Surat Kontrol **tidak ditampilkan** dan digantikan kolom Asal Unit. |
| BR-010 | Checkpoint yang tidak relevan untuk pasien tertentu ditampilkan Tidak Diisi / N/A; **tidak boleh** otomatis Selesai. |
| BR-011 | Kolom E-resep Obat = agregat dua sub-resep (Obat Pulang + CPO); Selesai hanya bila seluruh sub-resep relevan sudah selesai. |
| BR-012 | Routing tujuan farmasi e-resep mengikuti mapping MD Gudang & Farmasi + behavior V1 (§6.3). |
| BR-013 | **Kriteria auto-penyelesaian: As. Dokter + As. Perawat + Tindakan + Monitoring HD = Selesai** (keempatnya). Lab, E-resep, Order Alkes, Surat Kontrol, Bayar **tidak** masuk kriteria. Kriteria ini berlaku tunggal untuk semua pasien HD (tidak ada pengecualian). |
| BR-014 | Aksi auto-penyelesaian: kohort **RJ → Pulang** (akhiri kunjungan); kohort **RI → Pulangkan Pasien = Selesai Sesi HD** (kembali ke Asal Unit/bangsal, tidak men-*discharge* dari RS). |
| BR-015 | Status checkpoint read-only di dashboard; sumber kebenaran tetap di modul masing-masing (event-driven). |
| BR-016 | Makna "Sedang Diproses": untuk As. Dokter / As. Perawat / Monitoring HD / Tindakan / Bayar = form dibuka belum disimpan; untuk Lab / E-resep / Order Alkes = order terkirim ke unit terkait. |
| BR-017 | Pasien dengan status keluar yang telah di-set manual di-*exclude* dari job auto-penyelesaian (manual override menang). |
| BR-018 | Setiap eksekusi auto-penyelesaian & perubahan status keluar tercatat di audit log (aktor/sistem, timestamp, before/after). |
| BR-019 | Satu pasien RJ dapat muncul pada lebih dari satu sesi/jam praktik pada hari yang sama bila terdaftar lebih dari satu kali (pendaftaran terpisah). |
| BR-020 | Checkpoint Bayar: Sedang Diproses = form bayar dibuka belum disimpan; Selesai = billing/pembayaran final. |
| BR-021 | Job auto-penyelesaian berjalan sesuai pola Dashboard RJ (background job, cut-off harian). |
| BR-022 | **Indikator "Perlu Kontrol"** ditampilkan pada pasien bila **tanggal layanan aktif (hari ini) == tanggal kontrol kembali** yang tercatat pada **surat kontrol terakhir (paling update)** dengan **poli tujuan = Hemodialisa** untuk pasien tsb. |
| BR-023 | Bila pasien memiliki lebih dari satu surat kontrol ke poli Hemodialisa, indikator menggunakan **surat kontrol yang paling update**. Tujuan indikator: menandai pasien yang perlu dikonsultasikan ke dokter spesialis di hari itu (kebijakan BPJS: jadwal kontrol bulanan penyakit dalam digabung dengan layanan HD terakhir). |
| BR-024 | **Kolom Status Tindak Lanjut** menampilkan disposisi keluar pasien; nilai alur normal di-set job auto-penyelesaian (BR-014): RJ = "pulangkan", RI = "Selesai Sesi HD". |
| BR-025 | **Daftar opsi & perilaku disposisi keluar (Modal Status Keluar), untuk RJ maupun RI, mengikuti PRD Discharge** — tidak didefinisikan di dashboard ini. Dashboard hanya menampilkan hasil disposisi & menyediakan titik pemicunya. |
| BR-026 | **Tidak ada badge Konsul/Rujuk.** Konsul/rujuk internal adalah salah satu **nilai disposisi pada Kolom Status Tindak Lanjut**, bukan badge tersendiri. |

---

## 8. State Machine — Status Checkpoint

### 8.1 Legenda visual (mengikuti V1)
| Ikon | State |
|---|---|
| ✔ (hijau) | Selesai |
| 🕐 (jam) | Sedang Diproses |
| — | Tidak Diisi / N/A |

### 8.2 Checkpoint tri-state
Berlaku: **As. Dokter, As. Perawat, Monitoring HD, Tindakan, Lab, E-resep Obat, Order Alkes, Bayar.**

| State | Definisi | Pemicu |
|---|---|---|
| Tidak Diisi / Tidak Ada Order | Kondisi awal | Default |
| Sedang Diproses | Grup form: dibuka belum disimpan · Grup order: order terkirim belum selesai | Aksi user di modul sumber |
| Selesai | Form tersimpan/terverifikasi · Order dieksekusi tuntas | Event dari modul sumber |

### 8.3 Checkpoint bi-state (Surat Kontrol — RJ saja)
| State | Definisi |
|---|---|
| Belum Dibuat | Surat kontrol belum diterbitkan |
| Sudah Dibuat | Surat kontrol telah diterbitkan |
| — (tidak ditampilkan) | Pada kohort RI kolom Surat Kontrol digantikan kolom Asal Unit |

### 8.4 Matriks keberlakuan checkpoint per kohort
| Checkpoint | RJ | RI |
|---|---|---|
| As. Dokter | ✓ | ✓ |
| As. Perawat | ✓ | ✓ |
| Monitoring HD | ✓ | ✓ |
| Tindakan (& BHP) | ✓ | ✓ |
| Lab | ✓ | ✓ |
| E-resep Obat (Obat Pulang + CPO) | ✓ | ✓ |
| Order Alkes | ✓ | ✓ |
| Surat Kontrol | ✓ | Tidak ditampilkan |
| Bayar | ✓ | ✓ |
| *(Kolom khusus)* Asal Unit | — | ✓ (menempati slot Surat Kontrol) |

> **Radiologi**: aksi order tersedia dari alur pelayanan, **tidak** menjadi kolom checkpoint pada dashboard (D-08).

---

## 9. Status Tindak Lanjut & Auto-Penyelesaian

**Kolom Status Tindak Lanjut** ditempatkan sebelum kolom Aksi, menampilkan disposisi keluar pasien (mis. pulang, rujuk internal, rujuk eksternal, meninggal, pulang paksa, rawat inap, dsb).

### 9.1 Auto-Penyelesaian (background job)

| Aspek | Detail |
|---|---|
| Pemicu | *Background job* mengevaluasi pasien yang memenuhi BR-013 |
| Kriteria | As. Dokter + As. Perawat + Tindakan + Monitoring HD = Selesai (BR-013) — tunggal, tanpa pengecualian |
| RJ | Set Status Tindak Lanjut = **"pulangkan"**; keluar dari antrian RJ; data → casemix & reporting kunjungan |
| RI | Set Status Tindak Lanjut = **"Selesai Sesi HD"**; kembali ke Asal Unit/bangsal; episode rawat inap **tetap aktif** |
| Manual override | Bila status keluar telah di-set manual, pasien di-*exclude* dari job (BR-017) |
| Pengaman | Pasien yang **belum** memenuhi kriteria tidak boleh diselesaikan otomatis (mencegah *false data*) |
| Audit | Semua eksekusi tercatat (BR-018) |

### 9.2 Penetapan Disposisi Manual → PRD Discharge

Penetapan disposisi keluar secara manual dilakukan via aksi/Modal Status Keluar pada baris pasien. **Daftar opsi & perilaku tiap disposisi (RJ maupun RI) — termasuk validasi Rawat Inap, penanganan Meninggal, Rujuk Internal/Eksternal, dsb — didefinisikan di PRD Discharge** (PRD terpisah, D-13), **bukan** di dashboard ini. Dashboard hanya:

- menampilkan hasil disposisi pada **Kolom Status Tindak Lanjut**,
- menyediakan titik pemicu aksi Status Keluar,
- menghormati **override manual > auto** (BR-017) & mencatat perubahan ke **audit log** (BR-018).

> Konsul/rujuk internal **bukan badge** — ia salah satu nilai disposisi pada Kolom Status Tindak Lanjut (BR-026).

---

## 10. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Akses dashboard menampilkan seluruh data pasien unit HD **< 1 detik**. |
| NFR-02 | Respon sistem saat filter atau pencarian **< 1 detik**. |
| NFR-03 | Mendukung **± 30 user** perawat & dokter mengakses bersamaan. |
| NFR-04 | Status layanan ditampilkan **konsisten, akurat, real-time**. |
| NFR-05 | Pembedaan baris antar pasien jelas & konsisten. |
| NFR-06 | Akses aksi (asesmen, penyelesaian) mematuhi RBAC per role. |
| NFR-07 | Audit log tersimpan untuk aksi penyelesaian & perubahan status keluar. |

---

## 11. Dependencies

| ID | Dependency | Sifat |
|---|---|---|
| D-01 | Modul Asesmen Hemodialisa (Dokter & Perawat) — form & event | Wajib |
| D-02 | Modul Monitoring Hemodialisa — form & event | Wajib |
| D-03 | Modul Input Tindakan & BHP + Order Alkes | Wajib |
| D-04 | **Masuknya pasien RI ke antrian HD** (sumber pasien RI + data Asal Unit) — mengikuti **PRD Pelayanan Rawat Inap** | Wajib |
| D-05 | E-Resep + mapping MD Gudang & Farmasi (routing §6.3) | Wajib |
| D-06 | Order Lab (event status) | Wajib |
| D-07 | Order Radiologi (aksi order dari alur pelayanan) | Wajib |
| D-08 | Surat Kontrol (checkpoint RJ **+** sumber tanggal kontrol kembali untuk indikator Perlu Kontrol) | Wajib |
| D-09 | Billing/Kasir (event status Bayar) | Wajib |
| D-10 | Integrasi BPJS VClaim (data SEP) | Wajib (BPJS) |
| D-11 | MD Jadwal Praktik (sesi/shift) | Wajib |
| D-12 | MD Unit / RBAC | Wajib |
| D-13 | **PRD Discharge** — sumber daftar opsi & perilaku disposisi Status Tindak Lanjut (RJ maupun RI); dashboard hanya *commit* alur normal auto-penyelesaian | Wajib (untuk disposisi manual) |

> *Catatan: label D-xx pada bagian ini merujuk pada Dependencies; label D-xx pada §13 merujuk pada Keputusan Desain (konteks memisahkan keduanya).*

---

## 12. Acceptance Criteria (Given–When–Then)

| ID | Kriteria |
|---|---|
| AC-01 | **Given** ada pasien HD RJ & RI hari ini, **When** dashboard dibuka, **Then** tampil dua tab dengan jumlah pasien di label masing-masing. |
| AC-02 | **Given** tab RJ aktif, **When** user memfilter dokter + sesi tertentu, **Then** hanya pasien RJ dokter & sesi tsb tampil, respon < 1 detik. |
| AC-03 | **Given** user mengetik No. RM/nama, **When** pencarian dijalankan, **Then** pasien cocok pada tab aktif tampil < 1 detik. |
| AC-04 | **Given** pasien BPJS dengan SEP sudah dibuat, **When** baris ditampilkan, **Then** badge SEP tercentang; non-BPJS kosong. |
| AC-05 | **Given** pasien kartu prioritas (== "Ya") terdaftar hari ini, **When** baris ditampilkan, **Then** penanda prioritas muncul. |
| AC-06 | **Given** pasien memiliki surat kontrol terakhir ke poli HD dengan tanggal kontrol kembali == hari ini, **When** baris ditampilkan, **Then** indikator **"Perlu Kontrol"** muncul. |
| AC-07 | **Given** order Lab terkirim belum selesai, **When** dashboard dilihat, **Then** checkpoint Lab = **Sedang Diproses**; setelah tuntas → **Selesai**. |
| AC-08 | **Given** tab RI aktif, **When** baris pasien RI ditampilkan, **Then** kolom **Asal Unit** terisi pada posisi Surat Kontrol, dan kolom Surat Kontrol **tidak ditampilkan**. |
| AC-09 | **Given** pasien RJ dengan As. Dokter + As. Perawat + Tindakan + Monitoring HD = Selesai, **When** job berjalan, **Then** pasien di-set **Pulang** & keluar dari antrian RJ. |
| AC-10 | **Given** pasien RI memenuhi BR-013, **When** job berjalan, **Then** pasien di-set **Selesai Sesi HD** & kembali ke Asal Unit, **tanpa** discharge RS. |
| AC-11 | **Given** pasien **belum** memenuhi kriteria, **When** job berjalan, **Then** pasien **tidak** diselesaikan otomatis. |
| AC-12 | **Given** status keluar telah di-set manual, **When** job berjalan, **Then** pasien di-*exclude* (override manual menang). |
| AC-13 | **Given** e-resep CPO pasien RJ, **When** order dikirim, **Then** masuk ke **Farmasi Hemodialisa**; obat pulang RJ → **Farmasi Rawat Jalan**. |
| AC-14 | **Given** e-resep pasien RI (obat pulang maupun CPO), **When** order dikirim, **Then** keduanya masuk ke **Farmasi Rawat Inap**. |
| AC-15 | **Given** pasien dengan disposisi keluar dipilih pada baris (perilaku per PRD Discharge), **When** disposisi disimpan, **Then** Kolom Status Tindak Lanjut menampilkan nilai disposisi tsb & pasien keluar antrian aktif. |
| AC-16 | **Given** pasien RJ memenuhi BR-013, **When** job berjalan, **Then** Status Tindak Lanjut = "pulangkan"; pasien RI → "Selesai Sesi HD". |
| AC-17 | **Given** Status Tindak Lanjut telah di-set manual, **When** job berjalan, **Then** pasien di-*exclude* (override manual menang, BR-017). |

---

## 13. Keputusan Desain

| ID | Keputusan |
|---|---|
| D-01 | Pemisahan kohort RJ vs RI menggunakan **Tab toggle** `Rawat Jalan` \| `Rawat Inap` dengan counter jumlah pada label tab. |
| D-02 | Auto-penyelesaian pasien RI = **"Pulangkan Pasien" / Selesai Sesi HD** (kembali ke bangsal), **bukan** discharge RS. |
| D-03 | Checkpoint HD = **9 item** (mengikuti V1), termasuk **Bayar** dan **Order Alkes**. |
| D-04 | Surat Kontrol bi-state & hanya berlaku pada kohort RJ; pada tab RI kolomnya **tidak ditampilkan** dan digantikan Asal Unit. |
| D-05 | Tab RI: kolom **Asal Unit** menempati posisi kolom Surat Kontrol (Surat Kontrol tidak ditampilkan pada RI). |
| D-06 | Kriteria auto-penyelesaian = As. Dokter + As. Perawat + Tindakan + **Monitoring HD**, berlaku tunggal tanpa pengecualian. |
| D-07 | Counter status tiga state (belum/sedang/selesai) — perbaikan atas V1 yang dua state. |
| D-08 | **Radiologi** tetap dapat di-order dari alur pelayanan, namun **tidak** ditampilkan sebagai kolom checkpoint dashboard (kasus rare, informasi kurang penting). |
| D-09 | Indikator **"Perlu Kontrol"** bersumber dari tanggal kontrol kembali pada surat kontrol terakhir (poli HD) — fitur produksi V1 dipertahankan. |
| D-10 | Ditambahkan **Kolom Status Tindak Lanjut** (sebelum kolom Aksi), selaras Dashboard RJ & IGD. Dashboard hanya *commit* nilai alur normal auto-penyelesaian (RJ "pulangkan", RI "Selesai Sesi HD"). |
| D-11 | **Daftar opsi & perilaku disposisi (Modal Status Keluar) → PRD Discharge**, bukan didefinisikan di dashboard. **Tidak ada badge Konsul/Rujuk** — konsul/rujuk adalah salah satu nilai disposisi pada Kolom Status Tindak Lanjut. |

---

## 14. Open Questions

Seluruh Open Questions telah **diselesaikan** pada v1.3:

| ID | Pertanyaan | Resolusi |
|---|---|---|
| OQ-01 | Sumber data sesi/shift HD | **Jadwal Praktik Dokter** (MD Jadwal Praktik) |
| OQ-02 | Mekanisme masuknya pasien RI ke antrian HD + sumber data Asal Unit | **Mengikuti PRD Pelayanan Rawat Inap** |
| OQ-03 | Apakah pasien RI perlu penanda SEP? | **Ya** — penanda SEP berlaku untuk pasien BPJS, baik RJ maupun RI |

*Tidak ada open question tersisa.*

---

## 15. Roadmap & Risk Register

### 15.1 Roadmap (usulan)
| Fase | Cakupan |
|---|---|
| Fase 1 (MVP) | Tab RJ/RI, 9 checkpoint tri/bi-state, kolom Asal Unit (RI), **Kolom Status Tindak Lanjut + Modal Status Keluar**, filter, pencarian, pagination, counter 3-state, penanda SEP & prioritas, indikator Perlu Kontrol, auto-penyelesaian (RJ Pulang / RI Selesai Sesi HD) |
| Fase 2 | Integrasi dengan PRD Pelayanan Rawat Inap (masuknya pasien RI + Asal Unit) |
| Fase 3 | Layar Display Antrian ruang tunggu HD (bila dibutuhkan) |

### 15.2 Risk Register
| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-01 | Integrasi Pelayanan Rawat Inap (D-04) belum siap | Kohort RI & Asal Unit tidak terisi | Selaraskan dengan PRD Pelayanan Rawat Inap; MVP RJ bisa rilis lebih dulu |
| R-02 | Job auto salah men-*discharge* RI sebagai pulang RS | *False data* rawat inap | Uji ketat BR-014; audit log; pemisahan aksi RJ/RI |
| R-03 | Timing job cut-off harian kurang pas untuk RI (sesi HD selesai siang) | Pasien RI tertunda ditandai selesai | Pantau; opsi trigger per akhir sesi (bahasan Fase 2) |
| R-04 | Status checkpoint tidak real-time (event delay) | Salah baca progres | Arsitektur event-driven + refresh; NFR-04 |
| R-05 | Performa < 1 detik tidak tercapai pada volume tinggi | UX buruk | Indexing, pagination default, render per-tab |
| R-06 | Routing e-resep salah tujuan farmasi | Obat salah unit | Validasi mapping MD Gudang & Farmasi; AC-13 & AC-14 |
| R-07 | Indikator Perlu Kontrol salah tanggal (surat kontrol tidak paling update) | Pasien terlewat kontrol | Pastikan BR-023 (ambil surat kontrol paling update ke poli HD); uji kasus multi surat kontrol |

---

*Dokumen ini draft v1.5 untuk direview — Kolom Status Tindak Lanjut dipertahankan; daftar opsi & perilaku disposisi mengikuti PRD Discharge (§9). Setelah disetujui, dikunci kembali ke Final.*
