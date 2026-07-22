# PRD — Pendaftaran Radiologi

**Related Document:** PRD Pendaftaran Rawat Jalan v2.0 (Penunjang sebagai bagian pemilihan layanan); Form Order Radiologi (Figma: Pelayanan node 16750-117800); PRD Pelayanan Radiologi v1.0; [SHARED] Mapping Form Permintaan Radiologi Neurovi
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

Modul **Pendaftaran Radiologi** (code **B5**, cluster **Admisi**) memfasilitasi petugas loket pendaftaran mendaftarkan pasien — baru maupun lama — ke layanan penunjang **Radiologi**. Modul ini merupakan turunan dari **PRD Pendaftaran Rawat Jalan** (identifikasi pasien & pemilihan penjamin mengikuti alur induk), dengan penambahan logika khusus pemesanan pemeriksaan radiologi.

Ruang lingkup inti:
1. Mendaftarkan pasien baru & pasien lama ke radiologi.
2. Menyambungkan (connect) order radiologi yang sudah dibuat dokter di modul Pelayanan — **[PERLU KONFIRMASI: dijadwalkan next phase per lampiran]**.
3. Membuat order radiologi baru (dari pengantar kertas atau Atas Permintaan Sendiri/APS).
4. Menampilkan daftar pasien terdaftar penunjang melalui loket & membatalkan registrasi/order yang belum dilayani.
5. Mencetak Kartu Pasien & Label Identitas Pasien, menerbitkan nomor antrean radiologi.
6. Membuat billing baru khusus pendaftaran ulang (mock pada MVP).

Nilai strategis: menstandarkan data order menjadi terstandar **LOINC + kode Modality** agar valid untuk bridging **SATUSEHAT** dan **PACS**, menggantikan order berupa checkbox teks tanpa Master Data ID.

> Catatan altitude: item bertanda **Mock** pada MVP = order tergenerate setelah pendaftaran, pembacaan booking order sebelumnya, generate billing, dan list pemeriksaan radiologi.

## 2. Background

**Sumber: Lampiran PRD_Pendaftaran_Radiologi Juli 2026.pdf + draft user.**

Saat ini RS menghadapi kendala memenuhi regulasi integrasi **SATUSEHAT** dan standar **PACS** karena:

1. **Hardcoded Orders** — Form order dokter hanya berupa *checkbox teks biasa* yang tidak memiliki **Master Data ID**, **Kode Modality**, maupun **LOINC Code**. Akibatnya bridging data gagal karena sistem tidak tahu standar pemeriksaan apa yang diminta.

Solusi yang dipilih (paling memungkinkan untuk RS Tipe C & D): melakukan **mapping statis di backend** dan memecah struktur penyimpanan data hasil, **tanpa mengubah UI order dokter secara drastis**. Dengan begitu, saat order disimpan, sistem menyimpan data hasil mapping (LOINC + Modality), bukan sekadar teks nama checkbox.

**Masalah operasional saat ini (As-Is, dari draft user):**
- **UX**: masih terlalu banyak klik untuk mendaftarkan pasien.
- **Logic system**: belum ada log aktivitas pendaftaran (menambahkan pasien, membatalkan pasien) sehingga sulit audit.
- Order radiologi belum standar → risiko tolakan bridging BPJS/SATUSEHAT.

**Behavior/volume (dari draft):** pasien rawat jalan 30–50/hari, estimasi 300–400/bulan. Karakter beban rendah–menengah, sesuai profil RS Tipe C & D dengan SDM & infrastruktur terbatas (perlu dukungan mode offline).

## 3. In Scope

### Scope Definition (yang dikerjakan)
- **Identifikasi pasien & pemilihan penjamin** — mengikuti PRD Pendaftaran Rawat Jalan (B1), tidak diulang detail di sini.
- **Pendaftaran radiologi pasien baru & lama** melalui loket.
- **Tiga jalur masuk order:** (a) sambungkan order pelayanan/dokter — **[PERLU KONFIRMASI: next phase]**; (b) buat baru dari pengantar kertas; (c) buat baru APS/datang langsung.
- **Buat Order Baru per Modalitas + Sisi/Proyeksi** dengan katalog difilter sesuai jenis penjamin & status aktif master data.
- **Mapping statis backend** nama pemeriksaan → **LOINC + Modality** (mengikuti sheet [SHARED] Mapping).
- **Penerbitan nomor antrean radiologi** + status order **'Belum Diproses'** yang mengalir ke menu Radiologi.
- **Cetak Label Identitas Pasien** & **Kartu Pasien**.
- **List pasien terdaftar penunjang** melalui loket + **pembatalan registrasi & order** yang belum dilayani.
- **Log aktivitas pendaftaran** (tambah pasien, batal pasien).
- **Pengingat persiapan/keselamatan** (skrining kehamilan, pemeriksaan kontras).
- **Mode offline**: order tersimpan lokal lalu disinkron saat koneksi kembali.
- **Billing pendaftaran ulang** (mock generate).

### Out Scope (yang TIDAK dikerjakan)
- Proses **pelayanan/pembacaan hasil radiologi** (milik PRD Pelayanan Radiologi v1.0).
- Pembuatan **order oleh dokter** di modul Pelayanan (hanya dibaca/disambung di sini).
- Integrasi **PACS penuh** end-to-end (MVP hanya menyiapkan data terstandar; pengiriman actual = [PERLU KONFIRMASI]).
- **Billing riil/transaksi kasir** — pada MVP hanya *mock*.
- Pembuatan/pengubahan **master pemeriksaan & mapping LOINC** (dikelola di modul Master Data / Control Panel).
- Fitur **sambungkan-order** implementasi penuh → **[PERLU KONFIRMASI: dijadwalkan next phase]**.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Percepat proses pendaftaran radiologi | Waktu proses pendaftaran (klik SIMPAN → order tersimpan) | maks **1 detik** |
| Dashboard/list responsif | Loading dashboard | maks **1 detik** |
| Navigasi list efisien | Loading pagination | **< 1 detik** |
| Pencarian pasien cepat | Waktu cari pasien | **< 1 detik** |
| Kurangi klik pendaftaran (UX) | Jumlah klik untuk daftar 1 pasien (order baru) | turun vs baseline As-Is **[PERLU KONFIRMASI: baseline & target angka]** |
| Data order valid untuk bridging | % pemeriksaan ter-mapping ke LOINC + Modality | **100%** dari katalog aktif |
| Akurasi order penjamin | % order BPJS yang lolos aturan (terkait order dokter + episode/rujukan) | ≥ **99%** |
| Auditabilitas | % aksi pendaftaran/pembatalan tercatat di log | **100%** |
| Keandalan offline | Order berhasil tersinkron setelah koneksi kembali | **100%** tanpa data hilang |

> Volume acuan (dari draft): 30–50 pasien/hari, 300–400/bulan. Metrik performa diverifikasi pada beban puncak harian.

## 5. Related Feature

Fitur terkait dari List Fitur (sheet MVP, cluster **Admisi**):

| Code | Menu | Relasi dengan B5 |
|------|------|------------------|
| **B1** | Pendaftaran > Pendaftaran Rawat Jalan | **Induk** — identifikasi pasien & pemilihan penjamin & pemilihan layanan Penunjang mengacu ke sini |
| **B2** | Pendaftaran > Pendaftaran Rawat Inap | Pola pendaftaran & penjamin sejenis |
| **B3** | Pendaftaran > Pendaftaran IGD | Pola pendaftaran & penjamin sejenis |
| **B4** | Pendaftaran > Pendaftaran Laboratorium | **Sibling penunjang** — pola alur/field paling mirip (order penunjang) |
| **B6** | Pendaftaran > Pendaftaran Rehabilitasi Medis | Sibling penunjang |
| **B7** | Pendaftaran > Pendaftaran MCU | Sibling penunjang (paket pemeriksaan) |
| **B8 / B9** | Antrian > APM / Display antrian | Menerima nomor antrean radiologi yang diterbitkan modul ini |

Modul eksternal terkait (lintas cluster): **Pelayanan Radiologi (v1.0)** sebagai penerima order; **EMR** (g-emr-patient-identity) yang menampilkan hasil penunjang Radiologi; **Master Data** (katalog pemeriksaan + mapping LOINC/Modality).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) — [ASUMSI diturunkan dari draft & analogi BPMN Admisi]
1. Pasien datang membawa pengantar radiologi (kertas) atau order dokter.
2. Petugas mendaftarkan pasien; **order radiologi berupa checkbox teks** tanpa kode standar (LOINC/Modality).
3. Pemilihan pemeriksaan manual & banyak klik; tidak ada filter penjamin otomatis.
4. Data order **tidak valid untuk bridging** SATUSEHAT/PACS → sering ditolak/di-input ulang.
5. **Tidak ada log** aksi tambah/batal pasien → audit sulit.

### B. To-Be (kondisi diharapkan) — turunan lampiran + draft
1. Pasien diidentifikasi & penjamin dipilih mengikuti **Pendaftaran Rawat Jalan (B1)**.
2. Petugas memilih layanan **Penunjang → Radiologi**.
3. **Bila dokter sudah membuat order** radiologi di pelayanan → petugas **menyambungkannya** (pilih dari daftar order pasien yang menunggu). *(next phase)*
4. **Bila pasien membawa pengantar kertas / APS** → petugas **membuat order baru**: memilih pemeriksaan per modalitas, mengisi Sisi & proyeksi bila relevan, dan Prioritas Pemeriksaan.
5. Sistem **memeriksa aturan penjamin**: order BPJS wajib terkait order dokter + episode/rujukan; **APS hanya untuk Umum/Asuransi**.
6. Setelah disimpan, order berstatus **'Belum Diproses'**, sistem **menerbitkan satu nomor antrean radiologi** dan **mencetak Label Identitas Pasien**, lalu order mengalir ke menu **Radiologi**.
7. Bila ada **penanda persiapan/keselamatan** (skrining kehamilan, pemeriksaan kontras) → sistem menampilkan pengingat.
8. Seluruh langkah tetap berfungsi saat **offline**; order disimpan dulu lalu disinkron begitu koneksi kembali.
9. Setiap aksi (tambah/batal pasien-order) dicatat ke **log pendaftaran** [ASUMSI dari draft aspek logic].

## 7. Main Flow / Mindmap

### Skenario A — Buat Order Baru (pengantar kertas / APS)
1. Petugas buka menu **Pendaftaran Radiologi**.
2. **Identifikasi pasien**: cari pasien lama (kata kunci/NIK/No.RM) atau daftar **pasien baru** (mengikuti B1).
3. Pilih **jenis penjamin** (Umum/BPJS/Asuransi).
4. Pilih jalur **Buat Order Baru** (dari pengantar kertas atau APS).
5. Sistem menampilkan **header pasien (view-only)**: No.RM, Nama.
6. Sistem generate **No. Radiologi** otomatis.
7. Petugas isi: Tanggal/Jadwal (default hari ini), **Prioritas** (CITO/Reguler, default Reguler), **Diagnosa ICD-10** (boleh >1), Dokter Pengirim (opsional), Catatan Khusus/Persiapan.
8. Petugas pilih pemeriksaan dari **katalog per Modalitas + Region** (Cranium; Vertebrae; Thorax & Abdomen; Extremitas Atas; Extremitas Bawah; Kontras; CT Scan; USG; Panoramic; Lain-lain). Katalog **difilter sesuai penjamin & status aktif**.
9. **Gateway — pemeriksaan ekstremitas?** → wajib isi **Sisi** (Dex/Sin/Dex&Sin) & **proyeksi** (AP/Lateral/AP&Lat) bila belum melekat pada nama pemeriksaan.
10. **Gateway — aturan penjamin** → jika BPJS: order wajib terkait order dokter + episode/rujukan; jika APS: hanya Umum/Asuransi.
11. **Gateway — minimal 1 pemeriksaan?** → tidak boleh SIMPAN bila kosong.
12. Petugas klik **SIMPAN** → backend melakukan **mapping LOINC + Modality** → order berstatus **'Belum Diproses'**.
13. Sistem terbitkan **nomor antrean radiologi** + cetak **Label Identitas Pasien** (+ pengingat keselamatan bila ada).
14. Order mengalir ke menu **Radiologi**. **Event akhir: Order radiologi berhasil terdaftar.**

### Skenario B — Sambungkan Order Dokter *(next phase)* [PERLU KONFIRMASI]
1–3. Identifikasi pasien & penjamin (sama seperti A).
4. Sistem tampilkan **daftar order radiologi milik pasien yang masih menunggu** (No.Radiologi, Dokter Pengirim, Pemeriksaan, Tanggal, Prioritas). Order selesai/kedaluwarsa **tidak muncul**.
5. Petugas **pilih order dari daftar** (bisa cari/saring) — tanpa input nomor manual.
6. Menyambungkan order → terbitkan **satu antrean + Label Identitas Pasien**. **Event akhir: Order tersambung.**

### Skenario C — Pendaftaran Ulang (billing baru)
1. Petugas cari pasien yang **sudah dipesankan radiologi** sebelumnya.
2. Pilih order/booking existing → daftar ulang.
3. Sistem **generate billing baru** (mock) khusus pendaftaran ulang.
4. Terbitkan antrean + Label. **Event akhir: Daftar ulang berhasil.**

### Skenario D — Pembatalan
1. Petugas buka **List Pasien Terdaftar Penunjang** di loket.
2. Pilih pasien/order yang **belum dilayani**.
3. Klik **Batalkan** → sistem batalkan registrasi **sekaligus** membatalkan order radiologi yang sudah ter-order ke Radiologi.
4. **Gateway — sudah dilayani?** → jika sudah, pembatalan ditolak.
5. Catat ke **log pendaftaran**. **Event akhir: Registrasi & order dibatalkan.**

### Skenario E — Offline
- Semua langkah A–D berfungsi offline; order disimpan lokal (status *pending sync*) → disinkron otomatis saat koneksi kembali [ASUMSI mekanisme sync mengikuti standar Neurovi].

## 8. Business Rules

| ID | Aturan | Sumber |
|----|--------|--------|
| **BR-001** | Order tidak dapat disimpan tanpa **minimal satu** pemeriksaan. | Lampiran (Buat Order Baru) |
| **BR-002** | Pemeriksaan **ekstremitas** tidak dapat disimpan tanpa **Sisi** terisi (Dex/Sin/Dex&Sin). | Lampiran |
| **BR-003** | Hanya pemeriksaan **aktif** dan **sesuai jenis penjamin** yang tampil di katalog. | Lampiran |
| **BR-004** | **Header pasien view-only** (No.RM, Nama tidak dapat diubah di layar order). | Lampiran |
| **BR-005** | **No. Radiologi** dibuat otomatis oleh sistem (tidak diinput manual). | Lampiran |
| **BR-006** | Order **BPJS** wajib terkait **order dokter + episode/rujukan**; **APS** hanya untuk penjamin **Umum/Asuransi**. | Lampiran (Business Process #5) |
| **BR-007** | Setelah SIMPAN, order berstatus **'Belum Diproses'** dan mengalir ke menu Radiologi. | Lampiran |
| **BR-008** | Setiap penyimpanan/penyambungan order menerbitkan **satu** nomor antrean radiologi + Label Identitas Pasien. | Lampiran |
| **BR-009** | Backend menyimpan hasil **mapping LOINC + Modality**, bukan teks nama checkbox. | Lampiran (Formulir Order) |
| **BR-010** | Prioritas default **Reguler** (opsi CITO). Tanggal/Jadwal default **hari ini**. | Lampiran |
| **BR-011** | Pembatalan hanya untuk order/registrasi yang **belum dilayani**; pembatalan membatalkan **registrasi + order** sekaligus. | Draft user |
| **BR-012** | Daftar sambungkan-order hanya menampilkan order **aktif/menunggu** milik pasien terpilih; order selesai/kedaluwarsa tidak muncul; **tanpa input nomor manual**. | Lampiran |
| **BR-013** | **No. RM tunggal** — nomor RM mengikuti RM pasien (satu RM per pasien). | Lampiran (Pola Umum) + kanonik no_rm |
| **BR-014** | Semua aksi tambah/batal dicatat ke **log pendaftaran** (user, timestamp, pasien, aksi). | Draft (aspek logic) |
| **BR-015** | Pendaftaran ulang atas order existing memicu **generate billing baru** (mock MVP). | Draft user |
| **BR-016** | Bila ada penanda persiapan/keselamatan (skrining kehamilan, kontras) → sistem menampilkan **pengingat** sebelum/saat SIMPAN. | Lampiran (Business Process #7) |
| **BR-017** | Seluruh fungsi tetap berjalan **offline**; order disimpan lokal & disinkron saat online. | Lampiran (Business Process #8) |

## 9. User Stories

- **US-001** — Sebagai **Petugas Pendaftaran**, saya ingin **mendaftarkan pasien baru maupun lama ke radiologi melalui jalur yang sesuai sumber order & penjaminnya**, agar order tercatat benar dan tidak berisiko ditolak. *(P0; traceability: alur Pola Umum lampiran)*
- **US-002** — Sebagai **Petugas Pendaftaran**, saya ingin **memilih pemeriksaan radiologi dari katalog per modalitas dan menandai Sisi (Dex/Sin)**, agar order tercatat benar dan pasien memperoleh antrean. *(P1; traceability: Buat Order Baru)*
- **US-003** — Sebagai **Sistem**, saya ingin **menerjemahkan input checkbox statis dokter menjadi data terstandar (LOINC & Modality)**, sehingga data tersimpan valid untuk dikirim ke SATUSEHAT dan PACS. *(P1; traceability: Formulir Order Radiologi)*
- **US-004** — Sebagai **Petugas Pendaftaran**, saya ingin **menyambungkan order radiologi yang sudah dibuat dokter dengan memilih dari daftar**, agar tidak perlu mengetik nomor dan tidak salah sambung. *(P1; next phase; traceability: Sambungkan Order)*
- **US-005** — Sebagai **Petugas Pendaftaran**, saya ingin **melihat daftar pasien terdaftar penunjang melalui loket**, agar dapat memantau & menindaklanjuti pendaftaran radiologi. *(draft #3)*
- **US-006** — Sebagai **Petugas Pendaftaran**, saya ingin **membatalkan registrasi radiologi pasien yang belum dilayani sekaligus membatalkan order yang sudah ter-order**, agar data tetap bersih dan konsisten. *(draft #4; BR-011)*
- **US-007** — Sebagai **Petugas Pendaftaran**, saya ingin **mencetak Kartu Pasien dan Label Identitas Pasien**, agar identitas pasien tersedia untuk pelayanan radiologi. *(draft #5; BR-008)*
- **US-008** — Sebagai **Petugas Pendaftaran**, saya ingin **membuat billing baru khusus pendaftaran ulang**, agar pasien yang sudah dipesankan radiologi dapat didaftarkan ulang dengan tagihan yang tepat. *(draft #6; BR-015, mock)*
- **US-009** — Sebagai **Manajemen/Admin**, saya ingin **setiap aksi tambah/batal pendaftaran tercatat dalam log**, agar dapat diaudit. *(draft aspek logic; BR-014)*
- **US-010** — Sebagai **Petugas Pendaftaran**, saya ingin **mendaftarkan pasien tetap berfungsi saat offline dan tersinkron otomatis**, agar pelayanan tidak terhenti saat internet tidak stabil. *(BR-017; profil RS Tipe C&D)*
- **US-011** — Sebagai **Petugas Pendaftaran**, saya ingin **melihat pengingat persiapan/keselamatan (skrining kehamilan, kontras)**, agar pemeriksaan aman dilakukan. *(BR-016)*

## 10. Functional Requirements

| ID | Requirement | Prioritas | Traceability |
|----|-------------|-----------|--------------|
| **FR-001** | Sistem menyediakan **identifikasi & pencarian pasien** (baru/lama) dan pemilihan penjamin mengikuti B1 sebelum masuk order radiologi. | P0 | US-001, Main Flow A#2-3 |
| **FR-002** | Sistem menyediakan **tiga jalur** order: sambungkan-order *(next phase)*, buat-baru dari pengantar kertas, buat-baru APS. | P0 | US-001, BR-006 |
| **FR-003** | Sistem menampilkan **header pasien view-only** (No.RM, Nama) di layar order. | P1 | BR-004 |
| **FR-004** | Sistem **generate No. Radiologi otomatis** saat membuat order. | P1 | BR-005 |
| **FR-005** | Form order menampilkan field: Tanggal/Jadwal (default hari ini), Prioritas (CITO/Reguler, default Reguler), Diagnosa ICD-10 (multi), Dokter Pengirim (opsional), Catatan Khusus/Persiapan. | P1 | US-002, BR-010 |
| **FR-006** | Katalog pemeriksaan dikelompokkan **per Modalitas + Region** dan **difilter sesuai penjamin & status aktif**. | P1 | US-002, BR-003 |
| **FR-007** | Untuk pemeriksaan ekstremitas (dan relevan), sistem **meminta Sisi & proyeksi** bila belum melekat pada nama pemeriksaan; blokir SIMPAN bila Sisi kosong. | P1 | US-002, BR-002 |
| **FR-008** | Sistem **memvalidasi minimal satu pemeriksaan** sebelum SIMPAN. | P1 | BR-001 |
| **FR-009** | Sistem **memetakan setiap pemeriksaan ke kode LOINC + Modality** (sesuai sheet [SHARED] Mapping) dan menyimpan hasil mapping saat SIMPAN, bukan teks. | P1 | US-003, BR-009 |
| **FR-010** | Sistem **memvalidasi aturan penjamin** (BPJS wajib order dokter + episode/rujukan; APS hanya Umum/Asuransi). | P1 | BR-006 |
| **FR-011** | Setelah SIMPAN, order berstatus **'Belum Diproses'**, sistem **menerbitkan nomor antrean radiologi** dan order mengalir ke menu Radiologi. | P1 | BR-007, BR-008 |
| **FR-012** | Sistem **mencetak Label Identitas Pasien** & menyediakan **cetak Kartu Pasien**. | P1 | US-007 |
| **FR-013** | Layar **Sambungkan Order** menampilkan daftar order menunggu milik pasien (No.Radiologi, Dokter Pengirim, Pemeriksaan, Tanggal, Prioritas), tanpa input nomor manual; order selesai/kedaluwarsa tidak muncul. *(next phase)* | P1 | US-004, BR-012 |
| **FR-014** | Sistem menyediakan **List Pasien Terdaftar Penunjang** di loket dengan pencarian, filter & pagination. | P1 | US-005 |
| **FR-015** | Sistem menyediakan **pembatalan** registrasi+order untuk pasien yang belum dilayani; tolak bila sudah dilayani. | P1 | US-006, BR-011 |
| **FR-016** | Sistem **mencatat log pendaftaran** (user, timestamp, pasien, aksi tambah/batal). | P1 | US-009, BR-014 |
| **FR-017** | Sistem **generate billing baru (mock)** untuk pendaftaran ulang atas order existing. | P2 | US-008, BR-015 |
| **FR-018** | Sistem menampilkan **pengingat persiapan/keselamatan** (skrining kehamilan, kontras) bila ada penanda. | P2 | US-011, BR-016 |
| **FR-019** | Sistem berfungsi **offline** (simpan lokal) dan **sinkron otomatis** saat koneksi kembali. | P1 | US-010, BR-017 |
| **FR-020** | (Mock MVP) Sistem membaca **booking/order radiologi sebelumnya** milik pasien di layar pendaftaran & menampilkan **list pemeriksaan radiologi**. | P2 | Draft (Mock) |

## 11. Data Requirements (Spesifikasi Field)

> Field kanonik (nama, nik, no_rm, tgl_lahir, jenis_kelamin, no_hp, alamat, jenis_penjamin, no_bpjs, jenis_kunjungan, kata_kunci, dll) **konsisten dengan PRD B1/B2/B4/B7** — definisi & validasi SAMA. Perbedaan ditandai [PERLU KONFIRMASI].

### A. Layar INPUT — Identifikasi & Pencarian Pasien (FR-001)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_kunjungan | Jenis Kunjungan | dropdown | Ya | enum: Baru / Lama | manual | kanonik B1 |
| kata_kunci | Cari Pasien | text | Tidak | min 3 char | manual | kanonik B1 |
| nik | NIK | text | Ya (baru) | 16 digit, valid Disdukcapil | integrasi Disdukcapil | kanonik |
| no_rm | No. RM | text | Tidak | format RM RS, RM tunggal | lookup | kanonik; BR-013 |
| jenis_penjamin | Penjamin | dropdown | Ya | enum: Umum/BPJS/Asuransi | manual | kanonik |
| no_bpjs | No. Kartu BPJS | text | Ya (jika BPJS) | 13 digit | manual / VClaim | kanonik |

### B. Layar INPUT — Data Pasien Baru (FR-001, mengikuti B1)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nik | NIK | text | Ya | 16 digit, valid Disdukcapil | integrasi Disdukcapil | kanonik |
| no_rm | No. RM | text | Ya | format RM RS | auto-generate | kanonik |
| nama | Nama Lengkap | text | Ya | maks 100 char | manual/Disdukcapil | kanonik |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | L / P | manual/Disdukcapil | kanonik |
| tgl_lahir | Tanggal Lahir | date | Ya | <= hari ini | manual/Disdukcapil | kanonik |
| tempat_lahir | Tempat Lahir | text | Ya | maks 50 char | manual | kanonik |
| alamat | Alamat | text | Ya | maks 255 char | manual/Disdukcapil | kanonik |
| kode_wilayah | Kode Wilayah | lookup | Tidak | kode Kemendagri 2/4/6/10 digit | lookup wilayah | kanonik |
| no_hp | No. HP | text | Tidak | 10–15 digit | manual | kanonik |

### C. Layar INPUT — Buat Order Radiologi Baru (FR-003..FR-010)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_rm | No. RM (header) | text | Ya | view-only | lookup pasien | BR-004 |
| nama | Nama (header) | text | Ya | view-only | lookup pasien | BR-004 |
| no_radiologi | No. Radiologi | text | Ya | unik, auto | auto-generate | BR-005 |
| tgl_jadwal | Tanggal/Jadwal Pemeriksaan | date | Ya | >= hari ini | default hari ini | BR-010 |
| prioritas | Prioritas Pemeriksaan | dropdown | Ya | enum: CITO / Reguler | default Reguler | BR-010 |
| diagnosa_icd10 | Diagnosa (ICD-10) | lookup (multi) | Ya | dari master ICD-10; boleh >1 | lookup master ICD-10 | |
| dokter_pengirim | Dokter Pengirim | dropdown(lookup) | Tidak | master Staf (A2), jenis_tenaga=dokter | lookup A2 | kanonik dokter_id |
| catatan_khusus | Catatan Khusus/Persiapan | text | Tidak | maks 255 char | manual | pengingat keselamatan |
| pemeriksaan[] | Pemeriksaan | lookup (multi) | Ya (min 1) | dari katalog aktif, filter penjamin | master pemeriksaan radiologi | BR-001, BR-003 |
| modalitas | Modalitas/Region | dropdown | Ya | enum: Cranium/Vertebrae/Thorax&Abdomen/Extremitas Atas/Extremitas Bawah/Kontras/CT Scan/USG/Panoramic/Lain-lain | master | pengelompokan katalog |
| sisi | Sisi | dropdown | Ya (jika ekstremitas) | enum: Dex / Sin / Dex&Sin | manual | BR-002 |
| proyeksi | Proyeksi | dropdown | Tidak | enum: AP / Lateral / AP&Lat | manual | bila belum melekat di nama pemeriksaan |
| loinc_code | Kode LOINC | text | Ya (sistem) | dari mapping | auto (mapping backend) | FR-009, tidak diinput user |
| modality_code | Kode Modality | text | Ya (sistem) | dari mapping | auto (mapping backend) | FR-009 |

### D. Layar TAMPIL — List Pasien Terdaftar Penunjang / Loket (FR-014)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. Radiologi | order_radiologi.no_radiologi | text | sort | |
| No. RM | pasien.no_rm | text | filter | |
| Nama Pasien | pasien.nama | text | filter, sort A-Z | kanonik |
| Penjamin | order.jenis_penjamin | badge | filter | |
| Pemeriksaan | order.pemeriksaan[] | list/chip | – | |
| Prioritas | order.prioritas | badge (CITO merah/Reguler) | filter | |
| Tanggal/Jadwal | order.tgl_jadwal | dd-mm-yyyy | sort (default terbaru) | |
| Status | order.status | badge (Belum Diproses/…) | filter | |
| No. Antrean | order.no_antrean | text | – | |
| Aksi | – | tombol (Batalkan / Cetak Label / Cetak Kartu) | – | Batalkan aktif hanya jika belum dilayani (BR-011) |

### E. Layar TAMPIL — Sambungkan Order (FR-013, next phase)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. Radiologi | order_radiologi.no_radiologi | text | – | tanpa input nomor manual |
| Dokter Pengirim | order.dokter_pengirim | text | filter | |
| Pemeriksaan | order.pemeriksaan[] | list | – | |
| Tanggal | order.tgl_jadwal | dd-mm-yyyy | sort | |
| Prioritas | order.prioritas | badge | filter | |
| (aksi) Sambungkan | – | tombol | – | hanya order menunggu; selesai/kedaluwarsa disembunyikan (BR-012) |

### F. Layar TAMPIL — Log Pendaftaran (FR-016)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Timestamp | log.created_at | dd-mm-yyyy hh:mm | sort (default terbaru) | |
| User | log.user (staff nama) | text | filter | kanonik nama |
| Aksi | log.action | badge (Tambah/Batal) | filter | BR-014 |
| Pasien (No.RM/Nama) | log.pasien | text | filter | |
| No. Radiologi | log.no_radiologi | text | – | |

> **Mock MVP (FR-020)**: list pemeriksaan radiologi & pembacaan booking order sebelumnya menggunakan data mock — struktur kolom mengikuti tabel D. [PERLU KONFIRMASI: sumber data riil saat integrasi Pelayanan Radiologi].

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Target |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Loading dashboard | maks **1 detik** |
| **NFR-002** | Performa | Loading pagination list | **< 1 detik** |
| **NFR-003** | Performa | Pencarian pasien | **< 1 detik** |
| **NFR-004** | Performa | Proses pendaftaran (SIMPAN → tersimpan) | maks **1 detik** |
| **NFR-005** | Skalabilitas | Menangani beban 30–50 pasien/hari, 300–400/bulan tanpa degradasi | sesuai NFR-001..004 pada beban puncak |
| **NFR-006** | Ketersediaan (offline) | Fungsi pendaftaran & order berjalan offline, sinkron otomatis saat online, tanpa kehilangan data | 100% sinkron |
| **NFR-007** | Usability | Minimalkan jumlah klik pendaftaran (perbaikan UX As-Is) | [PERLU KONFIRMASI target angka] |
| **NFR-008** | Auditabilitas | Semua aksi tambah/batal tercatat & tak dapat dihapus | 100% |
| **NFR-009** | Keamanan | Akses menu sesuai role (Petugas Pendaftaran); data pasien terlindungi | sesuai kebijakan RS |
| **NFR-010** | Interoperabilitas | Data order tersimpan terstandar (LOINC + Modality) siap bridging SATUSEHAT & PACS | 100% katalog aktif ter-mapping |
| **NFR-011** | Kompatibilitas | Berjalan pada perangkat/infra sederhana RS Tipe C&D (browser standar) | [ASUMSI] |
| **NFR-012** | Keandalan cetak | Cetak Label & Kartu Pasien pada printer loket standar | [PERLU KONFIRMASI jenis printer] |

## 13. Integrasi Eksternal

| Sistem | Tujuan Integrasi | Arah | Catatan |
|--------|------------------|------|---------|
| **BPJS (VClaim/SEP)** | Validasi penjamin BPJS, kaitan order dokter + episode/rujukan, keaktifan kartu | 2 arah | Mengikuti alur B1; order BPJS wajib terkait order dokter (BR-006) |
| **Disdukcapil (NIK)** | Bridging & tarik data demografi pasien baru (NIK 16 digit) | tarik | Kanonik NIK; mengikuti B1 |
| **SATUSEHAT** | Kirim data order terstandar (LOINC + kode + system URI) | kirim | Butuh mapping LOINC valid (FR-009); pengiriman actual [PERLU KONFIRMASI scope MVP] |
| **PACS / RIS** | Pengiriman order/Modality ke sistem imaging | kirim | MVP siapkan data terstandar (kode Modality); integrasi penuh [PERLU KONFIRMASI/next phase] |
| **Antrian (B8 APM / B9 Display)** | Terima & tampilkan nomor antrean radiologi | kirim | Nomor antrean diterbitkan saat SIMPAN (BR-008) |
| **Billing/Kasir** | Generate billing pendaftaran ulang | kirim | **Mock** pada MVP (FR-017) |
| **Master Data (Katalog Pemeriksaan + Mapping LOINC/Modality + ICD-10)** | Sumber katalog, mapping, & diagnosa | tarik | Sheet [SHARED] Mapping Form Permintaan Radiologi |
| **Modul Pelayanan Radiologi (v1.0)** | Kirim order 'Belum Diproses' ke menu Radiologi; baca order dokter existing | 2 arah | Sambungkan-order = next phase (FR-013) |
| **EMR (g-emr-patient-identity)** | Order & hasil radiologi tampil di riwayat penunjang pasien | kirim | Konsumen data |

## Asumsi
- [ASUMSI] Alur As-Is diturunkan dari draft user + analogi BPMN cluster Admisi (onsite/emergency registration) karena modul ini belum punya BPMN sendiri.
- [ASUMSI] Identifikasi pasien, pemilihan penjamin, dan pendaftaran pasien baru mengikuti PRD Pendaftaran Rawat Jalan (B1) — field mengacu definisi kanonik lintas-PRD.
- [ASUMSI] Mekanisme sinkronisasi offline mengikuti standar platform Neurovi/HIS.
- [ASUMSI] Role pengguna utama adalah Petugas Pendaftaran (loket); akses menu diatur per role.
- [ASUMSI] Kode LOINC & Modality bersumber dari master data yang dikelola di modul Control Panel/Master Data, bukan diinput di modul ini.
- [ASUMSI] Field diagnosa menggunakan master ICD-10 yang sama dengan modul pelayanan.
- [ASUMSI] Pengelompokan modalitas mengikuti baseline v1 (Cranium, Vertebrae, Thorax & Abdomen, Extremitas Atas/Bawah, Kontras, CT Scan, USG, Panoramic, Lain-lain) sesuai lampiran.

## Pertanyaan Terbuka
- Kapan fitur 'Sambungkan Order Dokter' (FR-013/US-004) diaktifkan penuh? Lampiran menandai next phase.
- Apakah pengiriman ke SATUSEHAT & PACS dilakukan di modul ini pada MVP, atau hanya menyiapkan data terstandar?
- Target angka pengurangan jumlah klik pendaftaran (baseline As-Is vs target) untuk NFR-007?
- Format & aturan penomoran No. Radiologi dan No. Antrean radiologi (prefix, reset harian?).
- Jenis printer & format cetak Kartu Pasien vs Label Identitas Pasien di loket (NFR-012).
- Detail mekanisme & konflik saat sinkronisasi order offline (misal nomor antrean saat offline).
- Aturan kedaluwarsa (expired) order radiologi yang menyebabkan order tidak muncul di daftar sambungkan.
- Skema billing pendaftaran ulang saat berhenti mock — tarif per modalitas & integrasi kasir riil.
- Daftar lengkap penanda persiapan/keselamatan (selain skrining kehamilan & kontras) dan sumber datanya.