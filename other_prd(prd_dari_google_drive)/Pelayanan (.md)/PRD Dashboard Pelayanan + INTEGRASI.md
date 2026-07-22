# PRD — Dashboard Pelayanan Rawat Jalan (Poliklinik)

**Related Document:** PRD Asesmen Perawat RJ; PRD Asesmen Dokter RJ; PRD Order Tindakan & BHP; PRD E-Resep; PRD Order Lab; PRD Order Radiologi; PRD Surat Kontrol; **PRD Konsul Internal vs Rujuk Internal (hard dependency)**; PRD Pendaftaran Rawat Jalan; Integrasi BPJS VClaim; Master Jadwal Praktik; Master Data Unit / RBAC; **Antrean Online BPJS; iCare BPJS; Master Terminologi ICD (e-Klaim); Casemix / e-Klaim; Fitur Pengiriman EMR BPJS (Smart Claim) — konten integrasi dikonsolidasikan di §16**; Referensi V1 RSU Afdila Cilacap — Klinik Penyakit Dalam (screenshot)
**Dokumen ID:** PRD-P-DSH-RJ-v2.0
**Versi:** 2.4 (Draft — penyesuaian modal pasien Konsul: Selesaikan Konsul)
**Tanggal Disusun:** 30 Juni 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Q3 2026 — Fase 01 (Patient Entry & EMR Foundation)

## 1. Overview / Brief Summary

**Dashboard Pelayanan Poliklinik v2.0** adalah landing screen operasional tempat perawat dan dokter poli mengelola alur layanan pasien rawat jalan, dari registrasi hingga pemulangan. Dashboard ini menampilkan seluruh pasien yang terdaftar pada satu poli untuk tanggal layanan tertentu, lengkap dengan status pengisian asesmen, tindakan, dan order penunjang — sekaligus berperan sebagai **satu sumber kebenaran (single source of truth)** alur layanan harian per poli.

Versi 2.0 menggantikan dashboard V1 yang punya keterbatasan: (a) status checkpoint hanya **dua kondisi (bi-state)** sehingga kondisi "sedang diproses" tidak terlihat; (b) **auto-pemulangan berjalan tanpa prasyarat** sehingga pasien yang belum dilayani ikut ter-pulang dan mengotori data casemix/kunjungan; (c) **tidak ada penanda prioritas, SEP, maupun disposisi tindak lanjut** yang terstruktur; dan (d) **tidak ada filter sesi praktik**.

Fokus utama v2: (1) seluruh **8 checkpoint bertipe tiga kondisi (tri-state)** — termasuk Surat Kontrol dan Bayar; (2) **auto-pemulangan kondisional** berbasis BR-013; (3) **Modal Status Keluar** dengan 6 disposisi standar; (4) pembedaan tegas **Konsul Internal vs Rujuk Internal** beserta kontrol akses pemulangan; (5) **penanda SEP & prioritas**; (6) **popover detail pasien**; dan (7) **sinkronisasi status real-time** berbasis event dengan performa di bawah satu detik.

> Referensi: PRD modul pelayanan terkait (asesmen, order, e-resep, surat kontrol), PRD Pendaftaran RJ, dan PRD pendamping Konsul/Rujuk Internal.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**

Pada V1, dashboard sudah menyediakan daftar antrian, status checkpoint per kolom, dan pagination dasar. Namun ada sejumlah keterbatasan struktural yang menurunkan kualitas data downstream (terutama casemix dan reporting kunjungan) sekaligus mengurangi produktivitas user:

- Status checkpoint hanya **dua kondisi** ("—" / terisi); kondisi "sedang diproses" saat asesmen/tindakan/order masih berjalan tidak tercermin.
- **Auto-pemulangan dijalankan tanpa prasyarat**, sehingga pasien yang tidak dilayani ikut ter-pulang — data kunjungan & casemix jadi bias.
- **Tidak ada pembedaan aturan** antara konsul internal (advisory, satu arah) dan rujuk internal (handover, bisa beruntun), sehingga pelacakan pasien lintas-poli ambigu.
- **Tidak ada filter sesi praktik** untuk dokter yang praktik lebih dari satu sesi di hari yang sama.
- **Tidak ada penanda visual** untuk SEP BPJS maupun pasien kartu prioritas.
- Performa terasa **lambat** saat search/filter pada hari dengan kunjungan tinggi.
- Antar-baris pasien **kurang terdiferensiasi** secara visual sehingga berisiko salah baca.

**Dampak utama yang disasar v2:**
- **Data casemix & reporting kunjungan bersih** — hanya pasien yang benar-benar dilayani yang ter-pulang (BR-013).
- **Visibilitas status real-time** per pasien sehingga handoff perawat–dokter mulus.
- **Beban manual pemulangan berkurang** lewat disposisi terstruktur dan auto-pemulangan kondisional.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = seluruh cakupan dashboard inti (lihat §3) — fokus rilis ini.
- **Fase 2** = integrasi penuh badge Konsul/Rujuk (setelah PRD flow final), pencatatan alasan Pulang Paksa, penghalusan monitoring auto-pemulangan. `[**]`
- **Fase 3** = evaluasi penambahan Lab/Radiologi ke kriteria auto-pemulangan, analitik kepatuhan pemulangan, optimasi performa lanjutan. `[**]`

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Daftar antrian pasien** per poliklinik per tanggal layanan.
2. **Status checkpoint per pasien** — 8 checkpoint tiga kondisi: As. Perawat, As. Dokter, Tindakan & BHP, Lab, Radiologi, E-Resep, Surat Kontrol, Bayar.
3. **Filter**: tanggal layanan, nama dokter, dan jam praktik (langsung menampilkan jam sesuai MD Jadwal Praktik).
4. **Mode tampilan**: pagination default 15/halaman + opsi "Tampilkan Semua" (virtualization).
5. **Pencarian pasien** berdasarkan No. RM atau Nama.
6. **Popover detail pasien** saat hover/klik nama (No. Pendaftaran, jenis kelamin, status pasien lama/baru, waktu terdaftar, umur, bangsal).
7. **Counter status pelayanan** (Belum Dilayani / Sedang Dilayani / Selesai Dilayani) + total pasien.
8. **Penanda SEP** untuk pasien BPJS.
9. **Penanda pasien prioritas** (sumber: `data_sosial.kartu_prioritas == 'Ya'`).
10. **Modal Status Keluar** dengan 6 disposisi standar + manajemen Status Tindak Lanjut.
11. **Auto-pemulangan kondisional** (asesmen perawat + asesmen dokter + tindakan terisi).
12. **Sinkronisasi status real-time** lewat update berbasis event.
13. **Diferensiasi visual baris** yang jelas antar pasien.

### Cakupan Integrasi Eksternal (Konsolidasi Cluster Pelayanan RJ)

Selain fitur dashboard di atas, dokumen ini mengkonsolidasikan kebutuhan **integrasi eksternal** cluster Pelayanan RJ (rincian penuh di **§16**) agar dev memiliki satu acuan. Setiap butir menyertakan **modul pemicu** karena sebagian dipicu di luar layar dashboard:

14. **Penanda SEP dari data internal** — tanpa hit endpoint BPJS *(dashboard)*.
15. **Dispatch Task ID Antrean Online 4/5/6** saat simpan Asesmen Perawat/Dokter & Resep *(modul Asesmen & E-Resep)*.
16. **Akses iCare BPJS** dari form asesmen *(modul Asesmen)*.
17. **Konsistensi terminologi ICD-10/10 IM/9-CM** sebagai sumber Casemix/e-Klaim *(modul Asesmen Dokter & Tindakan)*.
18. **Penyediaan data klinis sebagai sumber resource FHIR** untuk EMR BPJS (Smart Claim) *(modul Asesmen/Tindakan/Resep/Resume)*.

### Out Scope

- Detail form & flow **Asesmen Perawat RJ** — PRD terpisah.
- Detail form & flow **Asesmen Dokter RJ** — PRD terpisah.
- Detail **Order Tindakan & BHP, E-Resep, Lab, Radiologi** — masing-masing PRD terpisah.
- Detail flow **Konsul Internal vs Rujuk Internal** — PRD pendamping wajib (lihat §16). Dashboard hanya menampilkan status, tidak mendefinisikan flow.
- Detail **Surat Kontrol** — PRD terpisah.
- **Dashboard IGD** dan **Dashboard Rawat Inap** — PRD modul terkait.

## 4. Goals and Metrics

### Tujuan
Menyediakan dashboard pelayanan rawat jalan yang **akurat, real-time, dan responsif**, sehingga perawat dan dokter dapat memantau status pelayanan, mengeksekusi aksi (asesmen, order, tindakan, surat kontrol, pemulangan) tanpa friksi, dan menjaga data downstream (casemix, reporting kunjungan, klaim) tetap bersih.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Initial load dashboard (semua data pasien per poli) | < 1 detik p95 @ 30 user konkuren | NFR-01 |
| Response filter & search | < 1 detik p95 | NFR-03 |
| Akurasi auto-pemulangan (zero false-positive: pasien tidak dilayani ikut pulang) | 0 case dalam 30 hari pasca go-live | R1 / BR-013 |
| Real-time status checkpoint (delta event → dashboard) | < 3 detik | NFR-04 |
| User satisfaction (perawat/dokter, survei pasca-pilot) | ≥ 4.0 / 5.0 | — |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
Dashboard adalah **konsumen status** dari banyak modul. Peta relasinya:

| Modul | Peran terhadap Dashboard |
|-------|--------------------------|
| Pendaftaran Rawat Jalan | Sumber pasien, no. antrian, tanggal kunjungan, cara bayar, poli/dokter. |
| Asesmen Perawat RJ | Event source checkpoint As. Perawat (tri-state). |
| Asesmen Dokter RJ | Event source checkpoint As. Dokter (tri-state). |
| Order Tindakan & BHP | Event source checkpoint Tindakan (tri-state); kriteria auto-pemulangan. |
| Order Lab | Event source checkpoint Lab (tri-state). |
| Order Radiologi | Event source checkpoint Radiologi (tri-state). |
| E-Resep | Event source checkpoint E-Resep (agregat Obat Pulang + CPO, BR-011). |
| Billing / Kasir | Event source checkpoint Bayar (status tagihan, BR-020). |
| Surat Kontrol | Event source checkpoint Surat Kontrol (tri-state). |
| Konsul / Rujuk Internal | Sumber status handover lintas-poli (badge KONSUL / RUJUK). |
| Integrasi BPJS VClaim | Sumber data SEP untuk penanda SEP pasien BPJS. |
| Master Jadwal Praktik | Sumber jam praktik dokter (filter jam praktik). |
| Master Data Unit / RBAC | Privilege role untuk aksi disposisi & auto-pemulangan. |
| Antrean Online BPJS | Penerima dispatch Task ID 4/5/6 (dari simpan asesmen & resep). Lihat §16.4. |
| iCare BPJS | Sumber riwayat pemeriksaan pasien lintas faskes (dibuka dari form asesmen). Lihat §16.5. |
| Master Terminologi ICD (10 / 10 IM / 9-CM) | Sumber pilihan diagnosa & tindakan yang selaras e-Klaim. Lihat §16.6. |
| Casemix / e-Klaim | Konsumen kode ICD untuk grouping iDRG & INA-CBG. Lihat §16.6. |
| Fitur Pengiriman EMR BPJS (Smart Claim) | Konsumen data klinis sebagai resource FHIR; POST dilakukan di fitur ini. Lihat §16.7–§16.8. |

### B. Persona
| Persona | Tipe | Peran terhadap Dashboard |
|---------|------|--------------------------|
| Perawat Poli | Primary | Eksekutor asesmen perawat, monitor antrian, intake awal pasien. |
| Dokter Poli | Primary | Eksekutor asesmen dokter, order pemeriksaan/tindakan, e-resep, surat kontrol, finalisasi/pemulangan. |
| Admin / Loket Poli | Secondary | Mengecek status pasien, mendampingi pasien, membantu pencarian data. |
| Tim Casemix | Secondary | Konsumen data downstream; bergantung pada akurasi status pemulangan untuk grouping klaim. |
| Manajemen / Mutu | Tersier | Memantau ketepatan pelayanan & kepatuhan pemulangan via data agregat. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
Dashboard V1 menampilkan daftar antrian dengan checkpoint **dua kondisi** dan pagination dasar. Auto-pemulangan berjalan **tanpa prasyarat** (semua pasien ikut ter-pulang). Konsul dan rujuk internal **tidak dibedakan**, tidak ada filter sesi praktik, tidak ada penanda SEP/prioritas, dan status diperbarui via refresh manual / terasa lambat.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Pasien terdaftar di Pendaftaran RJ → masuk daftar antrian poli (tanggal layanan = hari ini secara default).
2. **Perawat**: melakukan Asesmen Perawat → checkpoint berjalan ke Selesai.
3. **Dokter**: Asesmen Dokter + order (Tindakan / Lab / Radiologi / E-Resep) → checkpoint terkait berubah.
4. **Penunjang & Farmasi** mengeksekusi order → checkpoint terkait → Selesai.
5. **Dokter** men-set Status Keluar via Modal Disposisi **ATAU** job **auto-pemulangan** (BR-013) berjalan pada cut-off harian.
6. Pasien keluar dari antrian aktif; data mengalir ke casemix/reporting.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Checkpoint | Dua kondisi (kosong/terisi); Surat Kontrol & Bayar tak terinci | Tiga kondisi untuk seluruh 8 checkpoint (termasuk Surat Kontrol & Bayar) |
| Auto-pemulangan | Tanpa prasyarat — semua pasien | Kondisional (BR-013): hanya asesmen + tindakan selesai |
| Status keluar | Tidak terstruktur | 6 disposisi standar via Modal Status Keluar |
| Konsul vs Rujuk | Tidak dibedakan | Aturan tegas + kontrol akses pemulangan (BR-019..025) |
| Filter sesi praktik | Tidak ada | Filter jam praktik langsung (dari MD Jadwal Praktik) |
| Penanda SEP/Prioritas | Tidak ada | Penanda visual khusus |
| Update status | Refresh manual / lambat | Berbasis event, real-time (< 3 detik) |

## 7. Main Flow / Mindmap

### Skenario 1 — Alur layanan normal
1. Pasien terdaftar (Pendaftaran RJ) → muncul di daftar antrian poli.
2. Perawat melakukan **Asesmen Perawat** → checkpoint As. Perawat: Tidak Diisi → Sedang Diproses (form dibuka) → Selesai.
3. Dokter melakukan **Asesmen Dokter** + membuat order (Tindakan/Lab/Radiologi/E-Resep) → checkpoint terkait berubah.
4. Unit penunjang & farmasi mengeksekusi order → checkpoint Lab/Radiologi/E-Resep → Selesai.
5. Dokter set **Status Keluar** via Modal Disposisi **ATAU** job auto-pemulangan (BR-013) pada cut-off.
6. Pasien keluar dari antrian aktif; data mengalir ke casemix/reporting.

### Skenario 2 — Filter & pencarian
- Default menampilkan pasien dengan tanggal kunjungan = hari ini.
- Pilih filter **dokter** + **jam praktik** (mis. 16:00 dari MD Jadwal Praktik) → hanya pasien sesi tersebut yang tampil; filter bersifat AND terhadap tanggal (BR-003).
- Cari pasien via **No. RM / Nama** dalam scope filter aktif → hasil < 1 detik; bila tak cocok, tampilkan empty state yang jelas.

### Skenario 3 — Pemulangan via Modal Status Keluar
- Dokter membuka menu 3-titik → **Pulangkan Pasien** → Modal 6 disposisi (grid 3×2, semua bertone default).
- Disposisi instan (Pulangkan / Pulang Paksa / Meninggal / Rujuk Eksternal) → Status Tindak Lanjut ter-set + toast sukses + audit log (BR-018).
- **Rujuk Internal** → membuka Form Rujuk Internal; status di-set saat form disimpan.
- **Rawat Inap** → validasi keterdaftaran Ranap: terdaftar → set status + info bed; belum → modal info-only tanpa set status (BR-014).
- **Kontrol akses (handover):** Konsul → "Pulangkan Pasien" tetap tersedia; pada modal, opsi "Rujuk Internal" tampil sebagai "Selesaikan Konsul" (BR-024). Rujuk → "Pulangkan" tersedia & "Rujuk Internal" enabled (BR-025).

### Skenario 4 — Auto-pemulangan kondisional (BR-013)
- Job berjalan di belakang layar tanpa preview UI, pada cut-off **23:59 WIB** (fixed).
- **Eligible (pasien reguler)** bila As. Perawat + As. Dokter + Tindakan = **Selesai (ketiganya)** DAN Status Tindak Lanjut = null.
- **Eligible (pasien konsul internal, `status_handover = konsul`)** bila As. Dokter + Tindakan = **Selesai** DAN Status Tindak Lanjut = null — **As. Perawat tidak diwajibkan** (umumnya tidak diisi untuk pasien konsul, D-09). Tindakan tetap wajib (BR-021).
- Pasien yang sudah di-set manual → di-skip (BR-012, manual override menang).
- Action: set Status Tindak Lanjut = 'pulangkan' + audit log. Job idempoten — retry aman tanpa double-discharge.

### Skenario 5 — Konsul vs Rujuk Internal (tampilan & handover)
- **Konsul**: advisory satu arah; pasien tetap di poli asal **dan** tampil di poli tujuan dengan badge **KONSUL**. Poli penerima menutup keterlibatannya lewat opsi **"Selesaikan Konsul"** pada Modal Status Keluar (menggantikan "Rujuk Internal", BR-024).
- **Rujuk**: handover, bisa beruntun ke lebih dari satu dokter/poli; pasien tetap di poli asal **dan** tampil di poli tujuan dengan badge **RUJUK**.
- Badge bertahan sampai pelayanan selesai / akhir hari layanan tersebut (BR-017).

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Dashboard hanya menampilkan pasien dengan tanggal kunjungan (Pendaftaran RJ) sama dengan filter tanggal layanan aktif. | FR-02; US-01 |
| **BR-002** | Default tanggal layanan = hari ini (server date WIB). | FR-02; US-01 |
| **BR-003** | Filter dokter dan jam praktik bersifat additive (AND) terhadap filter tanggal. | FR-02; US-02 |
| **BR-004** | Counter status pelayanan dihitung real-time dari agregasi status checkpoint, bukan field statis. | FR-01; US-07 |
| **BR-005** | Penanda SEP hanya dievaluasi untuk pasien `cara_bayar` mengandung "BPJS". SEP kosong → validasi warning (bukan hard block); pasien non-BPJS → kolom kosong. | FR-07; US-05 |
| **BR-006** | Penanda prioritas aktif jika `data_sosial.kartu_prioritas == 'Ya'` pada tanggal pendaftaran. | FR-07; US-06 |
| **BR-007** | Seluruh 8 checkpoint bertipe tiga kondisi: Tidak Diisi (default) → Sedang Diproses → Selesai (final/terverifikasi). | FR-06; §9 |
| **BR-008** | Checkpoint yang tidak relevan untuk pasien tertentu ditampilkan sebagai Tidak Diisi / N/A, **tidak boleh otomatis Selesai**. | FR-06; US-04 |
| **BR-009** | Status checkpoint bersifat read-only di dashboard; sumber kebenaran tetap di modul masing-masing (berbasis event). | FR-06; FR-10 |
| **BR-010** | Surat Kontrol bertipe tiga kondisi seperti checkpoint lain (bukan dua kondisi); Sedang Diproses = form dibuka belum disimpan. | FR-04; §9 |
| **BR-011** | Kolom E-Resep adalah agregat dua sub-resep (Obat Pulang + CPO); state Selesai hanya jika seluruh sub-resep yang relevan sudah selesai. | FR-04 |
| **BR-012** | Pasien dengan Status Tindak Lanjut yang sudah di-set manual di-exclude dari job auto-pemulangan (manual override menang). | FR-09; §9.3 |
| **BR-013** | Job auto-pemulangan hanya mem-pulangkan pasien dengan Status Tindak Lanjut = null dan checkpoint Selesai sesuai jenis pasien: **(a) Pasien reguler** — Asesmen Perawat + Asesmen Dokter + Tindakan = Selesai (ketiganya); **(b) Pasien konsul internal** (`status_handover = konsul`) — Asesmen Dokter + Tindakan = Selesai, **Asesmen Perawat tidak diwajibkan** (umumnya tidak diisi untuk pasien konsul). Tindakan tetap wajib pada kedua kasus (BR-021). | FR-09; US-12; D-09 |
| **BR-014** | Disposisi Rawat Inap memvalidasi keterdaftaran Ranap; jika belum terdaftar, tampilkan modal info-only dan status tidak di-set. | FR-08; US-10 |
| **BR-015** | Konsul Internal bersifat satu arah (advisory) dari poli asal ke poli tujuan. Pasien tetap di poli asal dan juga tampil di poli tujuan. | §11 |
| **BR-016** | Rujuk Internal bersifat handover dan bisa beruntun ke lebih dari satu dokter/poli. Pasien tetap tampil di poli asal dan juga di poli tujuan. | §11; US-11 |
| **BR-017** | Badge KONSUL / RUJUK adalah penanda visual pada baris pasien (bukan pemindahan data). Badge bertahan sampai pelayanan selesai / akhir hari layanan. | §11; FR-04 |
| **BR-018** | Setiap perubahan Status Tindak Lanjut dan eksekusi auto-pemulangan tercatat di audit log (aktor/sistem, timestamp, nilai before/after). | FR-08; FR-09; NFR-09 |
| **BR-019** | Makna "Sedang Diproses": **Grup A** (As. Perawat, As. Dokter, Tindakan & BHP, Surat Kontrol, Bayar) = form dibuka belum disimpan (tanpa menu draft); **Grup B** (Lab, Radiologi, E-Resep) = order terkirim ke unit terkait. | FR-06; §9.2 |
| **BR-020** | Checkpoint Bayar mencerminkan status billing/tagihan kunjungan: Sedang Diproses = form bayar dibuka belum disimpan; Selesai = billing/pembayaran final. | FR-04; §9 |
| **BR-021** | Tindakan & BHP wajib terisi sebagai sumber data tarif/tagihan layanan — termasuk untuk pasien konsul-only — sehingga jadi salah satu syarat auto-pemulangan pada kedua kasus BR-013 (reguler & konsul). | FR-09; D-03, D-09 |
| **BR-022** | Cut-off job auto-pemulangan bersifat fixed pukul 23:59 WIB. | FR-09 |
| **BR-023** | Disposisi Meninggal hanya men-set Status Tindak Lanjut; tidak men-trigger modul sertifikat kematian. | FR-08; §10 |
| **BR-024** | Jika handover state = Konsul, tombol "Pulangkan Pasien" **tetap tersedia** di poli penerima; pada Modal Status Keluar, opsi **"Rujuk Internal" digantikan oleh "Selesaikan Konsul"** (menutup keterlibatan poli penerima atas konsul & melepas badge KONSUL; pasien tetap di poli asal, BR-015/BR-017). Detail flow di PRD Konsul/Rujuk Internal. | FR-08; §10, §11 |
| **BR-025** | Jika handover state = Rujuk, tombol "Pulangkan Pasien" tersedia dan opsi "Rujuk Internal" pada modal enabled. | FR-08; §11 |
| **BR-026** | Satu pasien dapat muncul pada lebih dari satu sesi/jam praktik pada hari yang sama apabila pasien terdaftar lebih dari satu kali (pendaftaran terpisah). | FR-02 |
| **BR-027** | Modul Pelayanan berperan sebagai **penyedia data (data provider)** untuk integrasi eksternal dan **tidak** melakukan POST langsung ke BPJS untuk e-Klaim maupun EMR BPJS; transformasi terminologi & pengiriman dilakukan modul/fitur hilir. | §16.1; FR-15 |
| **BR-028** | Penanda SEP membaca `sep_bpjs.no_sep` (data internal) tanpa memanggil endpoint BPJS/VClaim saat render; pengisian `sep_bpjs` dilakukan modul Pendaftaran/Admisi (upstream). Konsisten dengan BR-005. | §16.3; FR-07; BR-005 |
| **BR-029** | Penyimpanan **Asesmen Perawat** mengirim **Task ID 4** ke Antrean Online. | §16.4; FR-12 |
| **BR-030** | Penyimpanan **Asesmen Dokter** mengirim **Task ID 5** ke Antrean Online. | §16.4; FR-12 |
| **BR-031** | Penyimpanan **Resep** (order farmasi terbentuk) mengirim **Task ID 6** ke Antrean Online. | §16.4; FR-12 |
| **BR-032** | Pengiriman Task ID 4/5/6 berlaku untuk **seluruh pasien** (BPJS maupun non-BPJS) yang memiliki referensi antrean online (kode booking) yang valid. | §16.4; FR-12; US-14 |
| **BR-033** | Pengiriman Task ID **idempoten** per (kunjungan, Task ID) — re-save tidak mengirim ganda; **kegagalan tidak memblokir** penyimpanan (masuk retry queue + audit log). | §16.4; FR-12; NFR-08, NFR-09 |
| **BR-034** | iCare BPJS dapat dibuka dari form asesmen. Riwayat tampil bila **kode dokter BPJS** pada sesi login terisi; bila kosong, klik iCare menampilkan popup **"Kode dokter belum terisi"** dan iCare tidak dibuka. | §16.5; FR-13; US-15 |
| **BR-035** | Dropdown ICD-10 & ICD-10 IM (diagnosa) dan ICD-9-CM (tindakan) bersumber master terminologi yang **selaras e-Klaim**; kode tersimpan lengkap untuk dikonsumsi **Casemix** (grouping iDRG/INA-CBG). Pelayanan tidak melakukan grouping. | §16.6; FR-14; US-16 |
| **BR-036** | Data klinis (ICD-10, tindakan/BHP, resep, resume medis, alergi) di-persist terstruktur & ditandai **"siap-consume"** sebagai sumber resource FHIR (Condition, Procedure, DiagnosticReport, Device, MedicationRequest, Composition, AllergyIntolerance) untuk fitur Pengiriman EMR BPJS; transformasi FHIR & POST dilakukan fitur terpisah. | §16.7, §16.8; FR-15; US-17 |

## 9. State Machine

### 9.1 Checkpoint Tiga Kondisi (berlaku untuk seluruh 8 checkpoint)
Seluruh checkpoint — As. Perawat, As. Dokter, Tindakan & BHP, Lab, Radiologi, E-Resep, Surat Kontrol, Bayar — bertipe tiga kondisi. Tidak ada lagi checkpoint dua kondisi.

| State | Encoding Visual | Makna Umum |
|-------|-----------------|------------|
| Tidak Diisi | Abu / dash (–) | Default. Belum ada aktivitas pada modul sumber. |
| Sedang Diproses | Kuning / setengah | Aktivitas berlangsung tetapi belum final (definisi per checkpoint di §9.2). |
| Selesai | Hijau / centang | Modul sumber menandai final / terverifikasi. |

- **Transisi:** Tidak Diisi → Sedang Diproses → Selesai (berbasis event dari modul sumber). Status read-only di dashboard (BR-009).
- Checkpoint yang tidak relevan untuk pasien (mis. tidak ada order Lab) tetap "Tidak Diisi" / N/A, tidak otomatis "Selesai" (BR-008).

### 9.2 Definisi "Sedang Diproses" per Checkpoint (BR-019)
| Grup | Checkpoint | "Sedang Diproses" berarti |
|------|-----------|---------------------------|
| Grup A | As. Perawat, As. Dokter, Tindakan & BHP, Surat Kontrol, Bayar | Form sudah dibuka tetapi belum disimpan (open form). Tidak ada mekanisme draft pada modul-modul ini, jadi 'Sedang Diproses' = form aktif dibuka tanpa save. |
| Grup B | Lab, Radiologi, E-Resep | Order sudah terkirim ke unit terkait (lab/radiologi/farmasi) tetapi hasil/penyerahan belum selesai. |

> **Catatan Bayar:** checkpoint Bayar mencerminkan status billing/tagihan kunjungan — Sedang Diproses = form bayar dibuka belum disimpan; Selesai = billing/pembayaran final (BR-020).

### 9.3 Status Tindak Lanjut (Discharge Status)
State awal = null (Belum). Transisi ke salah satu dari 6 disposisi bersifat **terminal** untuk kunjungan tersebut. Disposisi dapat di-set **manual** (Modal Status Keluar, FR-08) atau **otomatis** untuk 'pulangkan' via job auto-pemulangan (FR-09). **Manual override selalu menang atas auto** (BR-012).

## 10. Status Tindak Lanjut — 6 Disposisi

Modal Status Keluar (FR-08) menyediakan 6 disposisi standar (grid 3×2). Seluruh tombol bertone default (tanpa pembedaan warna). Ketersediaan tombol bergantung handover state (BR-024/025).

| Disposisi | Behavior Detail | Rule Terkait |
|-----------|-----------------|--------------|
| **Pulangkan Pasien** | Pemulangan normal. Set Status Tindak Lanjut = 'pulangkan' secara instan + toast sukses. Juga disposisi yang dipakai job auto-pemulangan. | BR-012, BR-013 |
| **Pulang Paksa** | Atas Permintaan Sendiri (APS). Set Status instan. Pencatatan alasan disarankan dan dapat di-extend pasca-MVP. `[**]` | BR-018 |
| **Rujuk Internal** *(pasien non-Konsul)* | Membuka Form Rujuk Internal (handover ke poli/dokter lain). Status di-set saat form disimpan. Mendukung rujukan beruntun. **Untuk pasien Konsul, slot ini digantikan "Selesaikan Konsul".** | BR-016, BR-024, BR-025 |
| **Selesaikan Konsul** *(khusus pasien Konsul — menggantikan Rujuk Internal)* | Menutup keterlibatan poli penerima atas konsul: menandai konsul selesai untuk poli penerima & melepas badge KONSUL dari view poli penerima. Pasien tetap di poli asal (advisory, BR-015). Detail flow di PRD Konsul/Rujuk Internal. | BR-015, BR-017, BR-024 |
| **Meninggal** | Set Status instan. Tidak men-trigger modul sertifikat kematian. | BR-018, BR-023 |
| **Rujuk Eksternal** | Pasien dirujuk ke faskes lain. Set Status instan. Detail surat rujukan keluar di luar scope dashboard. | BR-018 |
| **Rawat Inap** | Validasi keterdaftaran Ranap. Jika terdaftar → set Status + info bed; jika belum → modal info-only tanpa set Status. | BR-014 |

**Kontrol Akses Modal (Handover State):**
- **Konsul** → tombol Pulangkan **tetap tersedia**; opsi Rujuk Internal **digantikan "Selesaikan Konsul"** (BR-024).
- **Rujuk** → tombol Pulangkan tersedia & opsi Rujuk Internal enabled (BR-025).

## 11. Konsul Internal vs Rujuk Internal (Display Rules)

> **Catatan penting:** dashboard hanya **menampilkan** status handover. Definisi flow lengkap ada di PRD pendamping "Konsul Internal vs Rujuk Internal" yang merupakan **hard dependency** (lihat §16). Aturan berikut adalah kontrak tampilan minimum yang harus dipenuhi.

| Aspek | Konsul Internal | Rujuk Internal |
|-------|-----------------|----------------|
| Sifat | Advisory — satu arah | Handover — bisa beruntun |
| Arah | Hanya dari poli asal ke poli tujuan | Bisa beruntun ke lebih dari satu dokter/poli |
| Tampil di poli asal | Tetap tampil (tidak hilang) — BR-015 | Tetap tampil (tidak hilang) — BR-016 |
| Tampil di poli tujuan | Ya, dengan badge KONSUL | Ya, dengan badge RUJUK |
| Badge dashboard | KONSUL (penanda visual) | RUJUK (penanda visual) |
| Retensi badge | Sampai pelayanan selesai / akhir hari (BR-017) | Sampai pelayanan selesai / akhir hari (BR-017) |
| Akses Pulangkan | **Tersedia**; opsi "Rujuk Internal" pada modal → "Selesaikan Konsul" (BR-024) | Tersedia; Rujuk Internal enabled (BR-025) |

> **Klarifikasi badge:** badge KONSUL / RUJUK adalah penanda visual pada baris pasien, **bukan** pemindahan/penghapusan data. Pasien tidak hilang dari poli asal, baik untuk Konsul maupun Rujuk.

## 12. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-01** | **Header Poli Aktif & Counter** — menampilkan nama poli aktif, tanggal layanan, dan counter agregat (Belum Dilayani, Sedang Dilayani, Selesai Dilayani, Total). Counter dihitung real-time dari agregasi checkpoint, bukan field statis. | US-07; BR-004 |
| **FR-02** | **Filter** — tanggal layanan (default hari ini, server WIB), nama dokter (multi-dokter), dan jam praktik (jam langsung dari MD Jadwal Praktik, mis. 08:00 / 16:00 — bukan kategori pagi/sore/malam). Seluruh filter additive/AND terhadap tanggal. | US-01, US-02; BR-001, BR-002, BR-003, BR-026 |
| **FR-03** | **Pencarian pasien** via No. RM atau Nama dalam scope filter aktif. Target response < 1 detik p95. | US-03; NFR-03 |
| **FR-04** | **Tabel Antrian & Kolom Checkpoint** — daftar pasien dengan kolom antrian, penanda prioritas, nama (→ popover), No. RM, cara bayar (+kelas), penanda SEP, klinik & dokter, 8 checkpoint tiga kondisi, badge Rujuk/Konsul, dan menu aksi. Detail kolom di §14.2. | US-04; BR-005..011, BR-017, BR-020 |
| **FR-05** | **Pagination & Tampilkan Semua** — default 15/halaman (opsi 25/50/100); toggle "Tampilkan Semua" me-load seluruh pasien dalam scope filter dengan virtualization rendering. | US-08; NFR-02 |
| **FR-06** | **Status Checkpoint Tiga Kondisi** — definisi state, transisi, dan visual encoding sesuai §9. | US-04; BR-007, BR-008, BR-009, BR-019 |
| **FR-07** | **Penanda Khusus (SEP & Prioritas)** — SEP: centang hijau hanya untuk pasien BPJS; BPJS tanpa SEP → validasi warning (bukan hard block). Prioritas: badge "P" jika `kartu_prioritas == 'Ya'` saat tanggal layanan = tanggal pendaftaran. | US-05, US-06; BR-005, BR-006 |
| **FR-08** | **Modal Status Keluar (6 Disposisi)** — trigger dari opsi "Pulangkan Pasien" pada menu 3-titik; 6 tombol disposisi (grid 3×2) bertone default; ketersediaan & **label** tombol bergantung handover state (untuk pasien Konsul, slot "Rujuk Internal" → "Selesaikan Konsul"). Detail perilaku di §10. | US-10, US-11; §10; BR-014, BR-023, BR-024, BR-025 |
| **FR-09** | **Auto-Pemulangan Kondisional** — job otomatis men-discharge pasien yang eligible pada cut-off 23:59 WIB dengan kriteria bergantung jenis pasien: **reguler** = As. Perawat + As. Dokter + Tindakan = Selesai; **konsul internal** (`status_handover = konsul`) = As. Dokter + Tindakan = Selesai (As. Perawat tidak diwajibkan) — keduanya DAN Status Tindak Lanjut = null. Berjalan di belakang layar tanpa UI preview; set 'pulangkan' + audit log; pasien yang sudah di-set manual di-skip. | US-12; BR-012, BR-013, BR-018, BR-021, BR-022; D-09 |
| **FR-10** | **Real-Time Status Sync** — checkpoint di-update berbasis event dari modul sumber via WebSocket subscription per-poli atau Server-Sent Events (polling dihindari). Delta event → refresh dashboard < 3 detik. | US-13; NFR-04 |
| **FR-11** | **Popover Detail Pasien** — saat hover/klik nama, tampilkan popover ringkas: No. Pendaftaran, jenis kelamin, status pasien (lama/baru), waktu terdaftar, umur, bangsal. | US-09 |
| **FR-12** | **Dispatch Task ID Antrean Online** — pada penyimpanan Asesmen Perawat kirim Task 4, Asesmen Dokter kirim Task 5, Resep kirim Task 6; berlaku seluruh pasien (BPJS/non-BPJS); idempoten per (kunjungan, task); non-blocking + retry queue + audit log. Detail di §16.4. *(Modul pemicu: Asesmen Perawat/Dokter, E-Resep)* | US-14; BR-029, BR-030, BR-031, BR-032, BR-033 |
| **FR-13** | **Akses iCare BPJS dari Form Asesmen** — buka popup riwayat pemeriksaan bila kode dokter BPJS terisi; bila kosong, klik memunculkan popup "Kode dokter belum terisi" tanpa membuka iCare. Detail di §16.5. *(Modul pemicu: Asesmen)* | US-15; BR-034 |
| **FR-14** | **Sumber Terminologi ICD selaras e-Klaim** — dropdown ICD-10/ICD-10 IM/ICD-9-CM dari master terminologi yang selaras e-Klaim; kode disimpan lengkap (kode, deskripsi, penanda primer/sekunder) untuk dikonsumsi Casemix. Detail di §16.6. *(Modul pemicu: Asesmen Dokter, Tindakan & BHP)* | US-16; BR-035 |
| **FR-15** | **Penyediaan Sumber Resource EMR BPJS (FHIR)** — persist data klinis sebagai sumber Condition, Procedure, DiagnosticReport, Device, MedicationRequest, Composition, AllergyIntolerance; ditandai "siap-consume"; tanpa transformasi/POST FHIR (dilakukan fitur Pengiriman EMR BPJS). Detail di §16.7–§16.8. *(Modul pemicu: Asesmen/Tindakan/Resep/Resume Medis)* | US-17; BR-027, BR-036 |

## 13. User Stories

> Format: "Sebagai … ingin … sehingga …". Acceptance Criteria dalam pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-01** | Sebagai **perawat poli**, saya ingin melihat daftar seluruh pasien yang terdaftar di poli hari ini, sehingga bisa memantau antrian dan memulai intake. | 1) Given buka dashboard poli aktif, When halaman dimuat, Then tampil pasien tanggal hari ini secara default (BR-001, BR-002). 2) Given pasien banyak, When dimuat, Then initial load < 1 detik p95 (NFR-01). | BR-001, BR-002; NFR-01 |
| **US-02** | Sebagai **user poli**, saya ingin memfilter berdasarkan tanggal, dokter, dan jam praktik, sehingga hanya melihat pasien yang relevan. | 1) Given dokter punya >1 jam praktik, When pilih salah satu jam (mis. 16:00) dari MD Jadwal Praktik, Then hanya pasien jam itu yang tampil. 2) Given filter dokter & jam aktif, When diterapkan, Then keduanya AND terhadap tanggal (BR-003). | FR-02; BR-003 |
| **US-03** | Sebagai **dokter**, saya ingin mencari pasien via No. RM atau Nama, sehingga cepat menemukan pasien di hari ramai. | 1) Given ketik No. RM/Nama, When cari, Then hasil < 1 detik p95 (NFR-03). 2) Given query tak cocok, When selesai, Then tampil empty state yang jelas. | FR-03; NFR-03 |
| **US-04** | Sebagai **user poli**, saya ingin melihat status checkpoint tiga kondisi per pasien, sehingga tahu tahap pelayanan secara akurat. | 1) Given form Grup A dibuka belum disimpan, When dimuat, Then checkpoint = 'Sedang Diproses' (BR-019). 2) Given order Grup B terkirim belum selesai, Then 'Sedang Diproses' (BR-019). 3) Given checkpoint tidak relevan, Then Tidak Diisi/N/A, bukan Selesai (BR-008). 4) Given status berubah di sumber, When event diterima, Then dashboard update < 3 detik (NFR-04). | BR-008, BR-019; NFR-04 |
| **US-05** | Sebagai **user poli**, saya ingin penanda SEP untuk pasien BPJS, sehingga pasien tanpa SEP bisa di-follow-up sebelum pelayanan. | 1) Given pasien BPJS punya `no_sep`, Then penanda SEP hijau muncul (BR-005). 2) Given pasien BPJS tanpa SEP, Then muncul validasi warning (bukan hard block). 3) Given non-BPJS, Then kolom SEP kosong. | FR-07; BR-005 |
| **US-06** | Sebagai **user poli**, saya ingin penanda pasien prioritas, sehingga mendahulukan pasien yang berhak. | 1) Given `kartu_prioritas == 'Ya'` pada tanggal pendaftaran, Then badge 'P' muncul (BR-006). | FR-07; BR-006 |
| **US-07** | Sebagai **user poli**, saya ingin counter status pelayanan, sehingga tahu beban & progres poli sekilas. | 1) Given dashboard aktif, When dimuat, Then counter Belum/Sedang/Selesai + Total dihitung real-time dari checkpoint (BR-004). | FR-01; BR-004 |
| **US-08** | Sebagai **user poli**, saya ingin pagination (default 15) dan opsi Tampilkan Semua, sehingga membaca daftar panjang tanpa lag. | 1) Given dimuat, When default, Then pagination 15/halaman (opsi 25/50/100). 2) Given Tampilkan Semua aktif, When daftar besar dimuat, Then memakai virtualization & tetap responsif (NFR-02). | FR-05; NFR-02 |
| **US-09** | Sebagai **user poli**, saya ingin popover detail saat hover/klik nama, sehingga cepat memverifikasi identitas & kunjungan. | 1) Given hover/klik nama, When popover muncul, Then tampil No. Pendaftaran, jenis kelamin, status pasien, waktu terdaftar, umur, bangsal (FR-11). | FR-11 |
| **US-10** | Sebagai **dokter**, saya ingin memulangkan pasien lewat Modal Status Keluar dengan 6 disposisi, sehingga status keluar tercatat terstruktur. | 1) Given klik 'Pulangkan Pasien', When modal buka, Then 6 disposisi tampil (grid 3×2) bertone default. 2) Given handover=Konsul, Then Pulangkan tetap tersedia & slot 'Rujuk Internal' tampil sebagai 'Selesaikan Konsul' (BR-024). 3) Given handover=Rujuk, Then Pulangkan tersedia & Rujuk Internal enabled (BR-025). 4) Given pilih 'Rawat Inap' & pasien belum terdaftar Ranap, Then modal info-only & status tidak di-set (BR-014). 5) Given pilih disposisi instan, Then status ter-set & tercatat di audit log (BR-018). | FR-08; BR-014, BR-018, BR-024, BR-025 |
| **US-11** | Sebagai **dokter**, saya ingin merujuk internal pasien (bisa beruntun), sehingga handover lintas-poli jelas & terlacak. | 1) Given pilih 'Rujuk Internal', When form disimpan, Then status di-set & pasien tampil di poli tujuan dengan badge RUJUK, tetap tampil di poli asal (BR-016, BR-017). 2) Given dirujuk beruntun, When rujukan berikutnya dibuat, Then bisa ke lebih dari satu dokter/poli (BR-016). | FR-08; BR-016, BR-017 |
| **US-12** | Sebagai **sistem**, saya ingin menjalankan auto-pemulangan hanya untuk pasien yang benar-benar dilayani, sehingga data casemix bersih. | 1) Given pasien reguler dengan As. Perawat + As. Dokter + Tindakan = Selesai & status = null, When cut-off 23:59 WIB, Then di-pulangkan otomatis (BR-013a, BR-022). 2) Given pasien konsul internal (`status_handover=konsul`) dengan As. Dokter + Tindakan = Selesai & status = null, Then di-pulangkan otomatis meski As. Perawat belum diisi (BR-013b, D-09). 3) Given salah satu kriteria wajib belum Selesai, Then TIDAK di-pulangkan. 4) Given pasien (reguler/konsul) & Tindakan belum diisi, Then tidak eligible (BR-021). 5) Given sudah di-set manual, Then di-skip (BR-012). 6) Given job dijalankan ulang, Then tidak terjadi double-discharge (NFR-08). | FR-09; BR-012, BR-013, BR-021, BR-022, D-09; NFR-08 |
| **US-13** | Sebagai **user poli**, saya ingin status pelayanan akurat & real-time, sehingga tidak perlu refresh manual. | 1) Given status berubah di modul lain, When event delta diterima, Then dashboard update otomatis < 3 detik tanpa refresh (NFR-04). | FR-10; NFR-04 |
| **US-14** | Sebagai **sistem**, saya ingin melaporkan tahapan pelayanan ke Antrean Online otomatis, sehingga data antrean akurat tanpa input manual. | 1) Given Asesmen Perawat disimpan, Then kirim Task 4; Asesmen Dokter → Task 5; Resep → Task 6 (BR-029, BR-030, BR-031). 2) Given pasien punya referensi antrean online, When disimpan, Then task dikirim tanpa membedakan BPJS/non-BPJS (BR-032). 3) Given re-save tahapan sama, Then tidak ada task ganda (BR-033). 4) Given pengiriman gagal, Then simpan tetap berhasil & task masuk retry queue (BR-033, NFR-08). | FR-12; BR-029, BR-030, BR-031, BR-032, BR-033 |
| **US-15** | Sebagai **dokter**, saya ingin membuka riwayat iCare dari form asesmen, sehingga mendapat konteks klinis lintas faskes. | 1) Given kode dokter BPJS terisi, When klik iCare, Then popup riwayat tampil (BR-034). 2) Given kode dokter BPJS kosong, When klik iCare, Then muncul popup "Kode dokter belum terisi" & iCare tidak dibuka (BR-034). | FR-13; BR-034 |
| **US-16** | Sebagai **tim Casemix**, saya ingin kode ICD dari asesmen selaras terminologi e-Klaim, sehingga grouping iDRG/INA-CBG tanpa koreksi manual. | 1) Given pilih ICD-10/ICD-10 IM/ICD-9-CM, Then opsi berasal dari master selaras e-Klaim (BR-035). 2) Given kode tersimpan, Then lengkap dengan deskripsi & penanda primer/sekunder. 3) Given Casemix membaca kode, Then tanpa transformasi tambahan. | FR-14; BR-035 |
| **US-17** | Sebagai **fitur Pengiriman EMR BPJS**, saya ingin data klinis Pelayanan tersedia terstruktur, sehingga dapat membentuk resource FHIR & POST ke Smart Claim. | 1) Given diagnosa/tindakan/BHP/resep/resume/alergi tersimpan, Then ditandai "siap-consume" (BR-036). 2) Given tiap data sumber, Then dapat dipetakan ke resource FHIR target (§16.8). 3) Given Pelayanan, Then tidak melakukan POST/transformasi FHIR (BR-027). | FR-15; BR-027, BR-036 |

## 14. Data Requirements (Spesifikasi Field)

> Dashboard bersifat **read-mostly**. Status checkpoint diterima sebagai **event delta**, bukan query langsung ke tabel transaksi modul.

### 14.1 Field yang Dikonsumsi Dashboard

| Field | Sumber | M/O | Keterangan |
|-------|--------|-----|------------|
| no_antrian | pendaftaran | M | Format {Prefix}-{Sequence} |
| no_pendaftaran | pendaftaran | M | Ditampilkan di popover (FR-11) |
| tanggal_kunjungan, jam_terdaftar | pendaftaran | M | Basis filter tanggal (BR-001) & popover |
| nama, no_rm, jenis_kelamin, umur | pasien | M | Identitas + isi popover |
| status_pasien (lama/baru) | pasien | O | Isi popover |
| cara_bayar (+ kelas) | pendaftaran | M | Basis evaluasi SEP (BR-005) |
| kartu_prioritas | data_sosial | O | Basis penanda prioritas (BR-006) |
| no_sep | sep_bpjs | O | NULL-able; SEP kosong → warning |
| unit, dokter, jam_praktik | unit / MD Jadwal Praktik | M | Kolom Klinik & filter jam praktik |
| status checkpoint ×8 (incl. Surat Kontrol & Bayar) | event modul | M | Tiga kondisi per checkpoint (§9) |
| status_handover (konsul/rujuk) | konsul/rujuk | O | Badge KONSUL / RUJUK (BR-017) |
| status_tindak_lanjut | dashboard | O | NULL atau salah satu dari 6 disposisi |

### 14.2 Layar TAMPIL — Kolom Tabel Antrian (FR-04)

| Kolom | Sumber Data | Format Tampilan | Catatan |
|-------|-------------|-----------------|---------|
| Antrian | pendaftaran.no_antrian | text {Prefix}-{Sequence} | — |
| Penanda Prioritas | data_sosial.kartu_prioritas | badge "P" jika 'Ya' | BR-006 |
| Nama Pasien | pasien.nama | text + popover (hover/klik) | FR-11 |
| No. RM | pasien.no_rm | text | — |
| Cara Pembayaran | pendaftaran.cara_bayar | text (termasuk kelas: I/II/III) | — |
| Penanda SEP | sep_bpjs.no_sep IS NOT NULL | centang hijau bila ada; kosong → warning | BR-005 |
| Klinik & Dokter | unit.nama + dokter.nama | dokter di baris kedua | — |
| As. Perawat / As. Dokter / Tindakan & BHP / Lab / Radiologi / Surat Kontrol | state machine (§9) | ikon tiga kondisi | BR-007 |
| E-Resep | state machine (BR-011) | ikon tiga kondisi (agregat Obat Pulang + CPO) | BR-011 |
| Bayar | state machine (BR-020) | ikon tiga kondisi (status billing/tagihan) | BR-020 |
| Rujuk/Konsul Internal | status handover (BR-019..023) | badge KONSUL / RUJUK | BR-017 |
| Aksi | — | menu 3-titik: detail, pulangkan/disposisi | FR-08 |

> Diferensiasi baris: alternating background + border-bottom lebih tegas dari V1. Tinggi baris 64–72px termasuk meta sub-text (NFR-05).

### 14.3 Layar TAMPIL — Popover Detail Pasien (FR-11)
Isi popover (contoh): No. Pendaftaran (mis. 674050), Jenis Kelamin, Status Pasien (Lama/Baru), Terdaftar (tanggal-jam WIB), Umur, Bangsal (untuk RJ: "-").

### 14.4 Input / Aksi
- **Filter**: tanggal layanan (date), nama dokter (dropdown multi), jam praktik (dropdown dari MD Jadwal Praktik).
- **Pencarian**: No. RM / Nama (text).
- **Modal Status Keluar**: pemilihan 1 dari 6 disposisi; Rujuk Internal & Rawat Inap membuka form/validasi lanjutan (lihat §10).

## 15. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-01** | Performa | Initial load < 1 detik p95 dengan 30 user konkuren per poli. | Metrik |
| **NFR-02** | Skalabilitas | Mode "Tampilkan Semua" wajib memakai virtualization rendering. | FR-05 |
| **NFR-03** | Responsivitas | Filter & search < 1 detik p95. | FR-02, FR-03 |
| **NFR-04** | Real-Time | Delta event ke dashboard < 3 detik via WebSocket/SSE; polling dihindari. | FR-10 |
| **NFR-05** | Ergonomi UI | Diferensiasi baris jelas; tinggi baris 64–72px; usable pada layar 1366×768 ke atas. | FR-04 |
| **NFR-06** | Aksesibilitas | Status checkpoint tidak boleh hanya bergantung warna (ikon + warna + label). | §9 |
| **NFR-07** | Keamanan/RBAC | Aksi disposisi & auto-pemulangan tunduk privilege role. | Master Unit/RBAC |
| **NFR-08** | Reliabilitas | Job auto-pemulangan idempoten; retry aman tanpa double-discharge. | FR-09 |
| **NFR-09** | Auditabilitas | Seluruh perubahan status tercatat (BR-018). | BR-018 |

## 16. Integrasi Eksternal & Dependency

> **Cakupan bagian ini.** Layar dashboard sendiri sebagian besar **mengonsumsi event internal**; satu-satunya pembacaan berkaitan BPJS pada dashboard adalah **penanda SEP dari data internal** (§16.3). Namun agar dev memiliki **satu acuan**, bagian ini mengkonsolidasikan seluruh kebutuhan integrasi eksternal **cluster Pelayanan RJ** — termasuk titik yang dipicu dari modul Asesmen, Tindakan & BHP, E-Resep, dan Resume Medis. Tiap kebutuhan menyertakan **Modul Pemicu** agar batas tanggung jawab tetap jelas.

### 16.1 Prinsip Integrasi — Pelayanan sebagai Penyedia Data (BR-027)

> **Modul Pelayanan berperan sebagai penyedia data (data provider), bukan pelaksana pengiriman (POST) langsung ke BPJS untuk e-Klaim maupun EMR BPJS.**

Titik integrasi terbagi dua sifat:
- **Aktif** — Pelayanan memanggil/mengirim langsung: dispatch Task ID Antrean Online (§16.4), akses iCare BPJS (§16.5), dan pembacaan SEP internal untuk badge (§16.3).
- **Pasif (penyediaan data)** — Pelayanan menyiapkan & mem-persist data terstruktur untuk dikonsumsi modul/fitur lain: kode ICD untuk Casemix/e-Klaim (§16.6) dan data klinis untuk fitur Pengiriman EMR BPJS (§16.7–§16.8). Transformasi terminologi & POST **tidak** dilakukan di Pelayanan.

### 16.2 Peta Titik Integrasi

| # | Titik Integrasi | Sifat | Modul Pemicu | Pemilik Proses Akhir | Trace |
|---|-----------------|-------|--------------|----------------------|-------|
| 1 | Penanda SEP (badge) | Aktif — baca internal | Dashboard | Dashboard/Pelayanan | BR-028; FR-07 |
| 2 | Antrean Online — Task 4 | Aktif — POST | Asesmen Perawat | Pelayanan | BR-029; FR-12 |
| 3 | Antrean Online — Task 5 | Aktif — POST | Asesmen Dokter | Pelayanan | BR-030; FR-12 |
| 4 | Antrean Online — Task 6 | Aktif — POST | E-Resep | Pelayanan | BR-031; FR-12 |
| 5 | iCare BPJS | Aktif — buka/akses | Asesmen | Pelayanan | BR-034; FR-13 |
| 6 | Terminologi ICD-10/10 IM/9-CM | Pasif — disediakan | Asesmen Dokter, Tindakan | Casemix / e-Klaim | BR-035; FR-14 |
| 7 | Resource FHIR EMR BPJS | Pasif — disediakan | Asesmen/Tindakan/Resep/Resume | Fitur Pengiriman EMR BPJS | BR-036; FR-15 |

### 16.3 Penanda SEP — Data Internal (poin 1)

Penanda SEP pada dashboard membaca `sep_bpjs.no_sep IS NOT NULL` (**data internal**) dan **tidak** memanggil endpoint BPJS/VClaim saat render — konsisten dengan **BR-005 / FR-07**. Pengisian tabel `sep_bpjs` dilakukan modul **Pendaftaran/Admisi** melalui VClaim (upstream), bukan oleh dashboard maupun modul pelayanan. SEP kosong → validasi *warning* (bukan hard block, BR-005).

### 16.4 Antrean Online — Task ID 4/5/6 (poin 2–4)

Penyimpanan aksi pelayanan memicu pelaporan tahapan ke Antrean Online:

| Pemicu (event simpan) | Task ID | Modul Pemicu | Makna tahapan |
|-----------------------|---------|--------------|---------------|
| Asesmen Perawat disimpan | 4 | Asesmen Perawat RJ | Tahapan pelayanan perawat |
| Asesmen Dokter disimpan | 5 | Asesmen Dokter RJ | Tahapan pelayanan dokter |
| Resep disimpan (order farmasi terbentuk) | 6 | E-Resep | Tahapan mulai layanan farmasi |

Ketentuan (BR-032, BR-033):
- Berlaku untuk **seluruh pasien** (BPJS maupun non-BPJS) yang memiliki referensi antrean online (kode booking) valid.
- Dipicu **post-commit** (setelah simpan berhasil); **asinkron** terhadap UI — kegagalan/keterlambatan BPJS tidak menghambat alur klinis.
- **Idempoten** per (kunjungan, Task ID) → re-save tidak mengirim ganda.
- Kegagalan **tidak memblokir** simpan; masuk **retry queue** + **audit log** (NFR-08, NFR-09).
- Task ID selain 4/5/6 (check-in, panggil loket, selesai farmasi) di luar cakupan — ditangani Admisi & Farmasi.

### 16.5 iCare BPJS (poin 5)

Form asesmen menyediakan aksi membuka **iCare BPJS** (riwayat pemeriksaan pasien lintas faskes). Perilaku (BR-034):
- **Kode dokter BPJS terisi** → klik iCare menampilkan **popup riwayat pemeriksaan**.
- **Kode dokter BPJS kosong** → aksi tetap dapat diklik; klik menampilkan **popup peringatan "Kode dokter belum terisi"** dan iCare **tidak** dibuka.

### 16.6 Penyediaan Data e-Klaim via Casemix (poin 6–7)

Pelayanan **tidak** berinteraksi langsung dengan e-Klaim; ia menyediakan kode ICD yang konsisten untuk dikonsumsi **Casemix** (BR-035):
- **ICD-10 & ICD-10 IM** (diagnosa, dari Asesmen Dokter) — dipakai Casemix untuk grouping **iDRG & INA-CBG** di e-Klaim.
- **ICD-9-CM** (tindakan, dari Input Tindakan & BHP) — dikonsumsi Casemix pada proses yang sama.

Dropdown ICD **wajib** bersumber master terminologi yang selaras e-Klaim; kode disimpan lengkap (kode, deskripsi, penanda primer/sekunder) agar dapat dibaca Casemix tanpa transformasi tambahan. Grouping dilakukan sepenuhnya di Casemix/e-Klaim, bukan di Pelayanan.

### 16.7 Penyediaan Data EMR BPJS — Smart Claim (poin 8–12)

Pelayanan mem-persist data klinis sebagai **sumber resource FHIR** untuk fitur Pengiriman EMR BPJS (BR-036). **Transformasi terminologi & proses POST dilakukan di fitur Pengiriman EMR BPJS yang terpisah (poin 12)** — Pelayanan cukup menjamin ketersediaan & kelengkapan data sumber, ditandai **"siap-consume"**.

| Sumber data Pelayanan | Resource FHIR | Modul Pemicu |
|-----------------------|---------------|--------------|
| Kode ICD-10 (diagnosa) | `Condition` | Asesmen Dokter |
| Tindakan & BHP | `Procedure`, `DiagnosticReport` (Lab & Radiologi), `Device` | Input Tindakan & BHP |
| Order resep | `MedicationRequest` | E-Resep |
| Resume medis | `Composition` (mereferensikan Condition, MedicationRequest, AllergyIntolerance) | Resume Medis |
| Data alergi | `AllergyIntolerance` | Asesmen (lihat catatan §16.8) |

### 16.8 Pemetaan Resource FHIR (Sumber → Target)

> **Catatan.** Skeleton & mapping berikut mengacu **contoh payload referensi EMR BPJS (Smart Claim)**. Struktur ini menjadi acuan kelengkapan data yang di-persist Pelayanan; profil FHIR final, mapping terminologi, & proses POST tetap milik fitur **Pengiriman EMR BPJS**.

**(a) Condition — dari ICD-10 (poin 8)**

```jsonc
{
  "resourceType": "Condition",
  "clinicalStatus": { "coding": [{ "code": "active" }] },
  "category":      [{ "coding": [{ "code": "encounter-diagnosis" }] }],
  "code": {
    "coding": [{
      "system":  "http://hl7.org/fhir/sid/icd-10",
      "code":    "<icd10_code>",
      "display": "<icd10_display>"
    }]
  },
  "subject":      { "reference": "Patient/<id_pasien>" },
  "encounter":    { "reference": "Encounter/<id_kunjungan>" },
  "recordedDate": "<tgl_asesmen_dokter>"
}
```

| FHIR path | Sumber data Pelayanan |
|-----------|-----------------------|
| `Condition.code.coding.code` / `.display` | Kode & deskripsi ICD-10 (Asesmen Dokter) |
| `Condition.subject` | Identitas pasien (No. RM) |
| `Condition.encounter` | ID kunjungan |
| `Condition.recordedDate` | Tanggal asesmen dokter |

**(b) Procedure / DiagnosticReport / Device — dari Input Tindakan & BHP (poin 9)**

| Resource | Sumber data Pelayanan | Catatan |
|----------|-----------------------|---------|
| `Procedure` | Tindakan medis (kode ICD-9-CM, waktu, pelaksana) | Satu tindakan → satu Procedure |
| `DiagnosticReport` | Hasil Laboratorium & Radiologi | Report klinis penunjang |
| `Device` | BHP/alat yang digunakan pada tindakan | Perangkat/bahan pada Procedure |

```jsonc
{
  "resourceType": "Procedure",
  "status": "completed",
  "code": {
    "coding": [{
      "system":  "http://hl7.org/fhir/sid/icd-9-cm",
      "code":    "<icd9cm_code>",
      "display": "<icd9cm_display>"
    }]
  },
  "subject":   { "reference": "Patient/<id_pasien>" },
  "encounter": { "reference": "Encounter/<id_kunjungan>" },
  "performedDateTime": "<tgl_tindakan>"
}
```

**(c) MedicationRequest — dari Order Resep (poin 10)**

```jsonc
// Mengacu contoh payload referensi EMR BPJS
{
  "resourceType": "MedicationRequest",
  "identifier": [{ "system": "id_resep_pulang", "value": "<id_resep>" }],
  "intent": "final",
  "medicationCodeableConcept": {
    "coding": [{ "code": "<kode_obat>", "system": "http://rscm.co.id/drug" }],
    "text": "<nama_obat_lengkap>"
  },
  "subject":   { "display": "<nama_pasien>", "reference": "Patient/<id_pasien>" },
  "requester": { "display": "<nama_dokter>", "reference": "Practitioner/<id_dokter>" },
  "performer": { "reference": "Organization/<id_unit>" },
  "reasonCode": [{ "coding": [{ "code": "", "display": "", "system": "" }], "text": "" }],
  "dispenseRequest": {
    "quantity": { "value": "1", "unit": "AMP", "code": "AMP",
                  "system": "http://unitsofmeasure.org" }
  },
  "dosageInstruction": [{
    "text": "1 kali",
    "route":  { "coding": [{ "code": "002", "display": "INTRAVENOUS",
                             "system": "http://snomed.info/sct" }] },
    "timing": { "repeat": { "frequency": "1", "period": 1, "periodUnit": "na" } }
  }]
}
```

| FHIR path | Sumber data Pelayanan |
|-----------|-----------------------|
| `identifier.value` | ID resep (mis. resep pulang) |
| `medicationCodeableConcept.coding.code` / `.text` | Kode & nama lengkap obat (master obat) |
| `subject` | Pasien (nama + No. RM) |
| `requester` | Dokter penulis resep |
| `performer` | Unit/organisasi peresep |
| `dispenseRequest.quantity` | Jumlah & satuan (mis. 1 AMP) |
| `dosageInstruction.route` | Rute pemberian (mis. INTRAVENOUS) |
| `dosageInstruction.timing.repeat` | Frekuensi/aturan pakai |
| `dosageInstruction.text` | Signa naratif (mis. "1 kali") |

**(d) Composition — dari Resume Medis (poin 11)**

```jsonc
// Mengacu contoh payload referensi EMR BPJS (Discharge Summary)
{
  "resourceType": "Composition",
  "status": "final",
  "type":  { "text": "Discharge Summary",
             "coding": [{ "system": "http://loinc.org", "code": "81218-0" }] },
  "subject":   { "display": "<nama_pasien>", "reference": "Patient/<id_pasien>" },
  "encounter": { "reference": "Encounter/<id_kunjungan>" },
  "date":   "<tgl_resume>",
  "author": [{ "display": "<nama_dokter>", "reference": "Practitioner/<id_dokter>" }],
  "title":  "Discharge Summary",
  "confidentiality": "N",
  "section": [ /* per LOINC — lihat tabel di bawah */ ]
}
```

Tiap section memiliki kode LOINC dan (untuk section tertentu) `entry` yang mereferensikan resource lain:

| Sec | Kode LOINC | Judul section | Sumber data & referensi |
|-----|-----------|---------------|-------------------------|
| 0 | 29299-5 | Reason for admission | Alasan masuk/kunjungan |
| 1 | 10154-3 | Chief complaint | Keluhan utama |
| 2 | 42347-5 | Admission diagnosis | Diagnosa masuk → entry: `Condition` |
| 3 | 75311-1 | Medications on Discharge | Obat pulang → entry: `MedicationRequest` |
| 4 | 18776-5 | Plan of care | Rencana asuhan → entry: `MedicationRequest` |
| 5 | 48765-2 | Known allergies | Alergi → entry: `AllergyIntolerance` |

> **Perlu diperhatikan.** Composition mereferensikan resource lain (`Condition`, `MedicationRequest`, `AllergyIntolerance`). Konsekuensinya, selain diagnosa/tindakan/resep, **data alergi pasien** juga perlu tersedia terstruktur di Pelayanan agar section "Known allergies" terisi. Bila data alergi belum tercakup pada form asesmen saat ini, perlu dikonfirmasi sebagai kebutuhan tambahan (lihat R9).

### 16.9 Dependency

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD Konsul vs Rujuk Internal (flow) | **Hard** | Status handover tidak terisi; badge KONSUL/RUJUK & kontrol akses tidak aktif. |
| Pendaftaran Rawat Jalan | **Hard** | Tidak ada sumber pasien/antrian. |
| Event status Asesmen/Order/Tindakan/Bayar | **Hard** | Checkpoint tidak dapat tiga kondisi. |
| Master Terminologi ICD (10 / 10 IM / 9-CM) selaras e-Klaim | **Hard** (untuk Casemix) | Dropdown ICD tidak selaras → grouping iDRG/INA-CBG gagal/keliru (R6). |
| Integrasi BPJS VClaim (SEP) | Soft | Penanda SEP nonaktif untuk BPJS. |
| Antrean Online BPJS | Soft | Task ID 4/5/6 tidak terkirim; progres antrean online tidak update (tidak memblok pelayanan). |
| iCare BPJS | Soft | Riwayat pemeriksaan lintas faskes tidak tersedia dari asesmen. |
| Casemix / e-Klaim | Konsumen | Konsumen kode ICD; tidak memblok Pelayanan. |
| Fitur Pengiriman EMR BPJS (Smart Claim) | Konsumen | Konsumen data FHIR; transformasi & POST dilakukan di fitur tsb. |
| Master Jadwal Praktik | Soft | Filter jam praktik nonaktif. |
| RBAC / Master Data Unit | Soft | Aksi disposisi tanpa kontrol privilege. |

## 17. Keputusan Desain (Resolved)

Seluruh open question dari draft sebelumnya telah dijawab stakeholder.

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Sumber data jam praktik | Diambil dari MD Jadwal Praktik (ditampilkan sebagai jam langsung, bukan kategori pagi/sore/malam). |
| D-02 | Cut-off auto-pemulangan | Fixed pukul 23:59 WIB (BR-022). |
| D-03 | Pasien konsul-only (tanpa tindakan) | Tetap wajib ada Tindakan terisi (sumber tarif/tagihan via menu Tindakan, BR-021) → tetap masuk kriteria auto-pemulangan (kriteria As. Perawat untuk pasien konsul: lihat D-09). |
| D-04 | Lab/Radiologi pada auto-pemulangan | Belum diperlukan fase ini; kandidat iterasi berikutnya. `[**]` |
| D-05 | SEP belum terbit | Memunculkan validasi warning, bukan hard block (BR-005). |
| D-06 | Disposisi Meninggal | Tidak men-trigger modul sertifikat kematian (BR-023). |
| D-07 | Badge handover (retensi) | Penanda visual saja; bertahan sampai pelayanan selesai / akhir hari layanan (BR-017). |
| D-08 | Satu pasien di >1 jam praktik | Mungkin terjadi bila pasien mendaftar lebih dari satu kali (pendaftaran terpisah) — BR-026. |
| D-09 | Kriteria auto-pemulangan pasien konsul internal | Asesmen Perawat **tidak diwajibkan** untuk pasien konsul internal (`status_handover = konsul`) karena umumnya tidak diisi; kriteria eligible = As. Dokter + Tindakan = Selesai. Tindakan tetap wajib (BR-021). Diterapkan pada BR-013(b). |

## 18. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Daftar antrian, filter (tanggal/dokter/jam praktik), search, 8 checkpoint tiga kondisi, popover detail pasien, counter, penanda SEP & prioritas, Modal Status Keluar (6 disposisi) + kontrol akses handover, auto-pemulangan BR-013, real-time sync. |
| **Fase 2** `[**]` | Integrasi penuh badge Konsul/Rujuk (setelah PRD flow final), pencatatan alasan Pulang Paksa, penghalusan monitoring auto-pemulangan (internal). |
| **Fase 3** `[**]` | Evaluasi penambahan Lab/Radiologi ke kriteria auto-pemulangan, analitik kepatuhan pemulangan, optimasi performa lanjutan. |

## 19. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Auto-pemulangan false-positive (pasien tidak dilayani ikut pulang). | BR-013 ketat (asesmen + tindakan wajib) + audit log + metrik zero-false-positive 30 hari. |
| R2 | PRD Konsul/Rujuk (flow) belum final saat go-live. | Dashboard hanya konsumen status; badge & kontrol akses nonaktif sampai flow tersedia, tanpa memblok fitur lain. |
| R3 | Performa lambat pada hari kunjungan tinggi. | Virtualization + indexing + berbasis event (tanpa polling) + budget < 1 detik. |
| R4 | Inkonsistensi status checkpoint vs modul sumber. | Single source of truth di modul + delta event + rekonsiliasi periodik. |
| R5 | SEP belum terbit terlewat petugas. | Validasi warning yang jelas pada baris pasien BPJS (bukan hard block, BR-005). |
| R6 | Master terminologi ICD tidak selaras e-Klaim → grouping iDRG/INA-CBG gagal/keliru. | Master terminologi terpusat + validasi keselarasan; kunci dropdown ke master (BR-035, §16.6). |
| R7 | Gangguan layanan Antrean Online → Task ID gagal terkirim. | Pengiriman asinkron + retry queue + audit log; simpan tidak diblokir (BR-033, §16.4). |
| R8 | Duplikasi Task ID akibat re-save. | Idempotensi per (kunjungan, Task ID) (BR-033). |
| R9 | Data sumber FHIR tidak lengkap (mis. alergi belum tercakup asesmen) → resource EMR BPJS gagal dibentuk di fitur hilir. | Penanda "siap-consume" + kelengkapan atribut wajib (BR-036); konfirmasi cakupan data alergi pada form asesmen (§16.8). |

## Asumsi
- [ASUMSI] Mekanisme transport real-time (WebSocket subscription per-poli vs Server-Sent Events) bersifat detail implementasi dan diserahkan ke Tim Pradev; yang mengikat adalah budget delta < 3 detik dan larangan polling (NFR-04).
- [ASUMSI] Role yang berhak mengeksekusi disposisi & memicu auto-pemulangan ditentukan via RBAC/Master Data Unit sesuai praktik SIMRS (NFR-07).
- [ASUMSI] Rekonsiliasi periodik status checkpoint (mitigasi R4) dijalankan sebagai mekanisme pendukung event-driven, detail interval menyusul.

## Pertanyaan Terbuka
- [PERLU KONFIRMASI] Ketersediaan **PRD Konsul/Rujuk Internal (flow)** sebagai sumber status handover — prasyarat hard untuk mengaktifkan badge & kontrol akses pemulangan (R2, §16). Sebelum siap, fitur lain tetap jalan tanpa terblokir.
- [PERLU KONFIRMASI] Timeline evaluasi penambahan **Lab/Radiologi** ke kriteria auto-pemulangan (D-04, Fase 3). `[**]`
- [PERLU KONFIRMASI] Apakah **pencatatan alasan Pulang Paksa** masuk MVP atau ditunda ke Fase 2 (saat ini disarankan, dapat di-extend pasca-MVP). `[**]`

## Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| v0.1 | 29 Jun 2026 | Team Product | Overview PRD & rancangan fitur awal (FR, BR, state machine, disposisi). |
| v2.0 | 30 Jun 2026 | Team Product | PRD lengkap: FR-01..10, BR-001..018, state machine, 6 disposisi, NFR, user story + AC, dependencies, open questions, roadmap, risk. |
| v2.1 | 30 Jun 2026 | Team Product | Revisi pasca-feedback: Surat Kontrol & Bayar jadi tiga kondisi (8 checkpoint), filter jam praktik dari MD Jadwal, popover detail pasien (FR-11), disposisi tanpa tone visual + kontrol akses handover (BR-024/025), hapus preview auto-pemulangan, definisi 'Sedang Diproses' per checkpoint (BR-019), badge handover sebagai penanda, user story dalam tabel, Open Questions diselesaikan menjadi Keputusan Desain. |
| v2.2 | 3 Jul 2026 | Team Product | Integrasi konten PRD Integrasi Eksternal Pelayanan ke dalam dokumen. §16 diperluas menjadi spesifikasi integrasi cluster (16.1 prinsip data-provider, 16.2 peta titik integrasi, 16.3 SEP internal, 16.4 Antrean Online Task 4/5/6 untuk seluruh pasien, 16.5 iCare + popup, 16.6 terminologi ICD untuk Casemix, 16.7–16.8 penyediaan resource FHIR EMR BPJS + skeleton & mapping, 16.9 dependency). Ditambah BR-027..036, FR-12..15, US-14..17, R6..R9; §3 (cakupan integrasi) & §5.A (modul eksternal) diperbarui. Menyingkap kebutuhan resource AllergyIntolerance (R9). |
| v2.3 | 3 Jul 2026 | Team Product | Kriteria auto-pemulangan dibuat kondisional per jenis pasien: reguler = As. Perawat + As. Dokter + Tindakan; **konsul internal = As. Dokter + Tindakan** (As. Perawat tidak diwajibkan karena umumnya tidak diisi). Diperbarui: BR-013 (kasus a/b), BR-021, FR-09, US-12, Skenario 4 (§7), Keputusan Desain D-03 & D-09 (baru). Tindakan tetap wajib pada kedua kasus. |
| v2.4 | 3 Jul 2026 | Team Product | Penyesuaian Modal Status Keluar untuk pasien Konsul: tombol "Pulangkan Pasien" **tetap tersedia** di poli penerima, dan slot **"Rujuk Internal" digantikan "Selesaikan Konsul"** (menutup konsul di poli penerima; pasien tetap di poli asal). Diperbarui: BR-024, FR-08, US-10, §10 (row disposisi + kontrol akses), §11 (baris Akses Pulangkan), Skenario 3 & 5 (§7). |

---
> **Catatan Penutup:** Dokumen berstatus Draft hasil revisi v2.1. Seluruh Open Questions awal sudah diselesaikan (§17). Prasyarat tersisa untuk go-live adalah ketersediaan flow Konsul/Rujuk Internal dari PRD pendamping (§16) sebagai sumber status handover. Setelahnya, status dapat dinaikkan menjadi Approved dan dijadwalkan implementasi oleh Tim Pradev.
