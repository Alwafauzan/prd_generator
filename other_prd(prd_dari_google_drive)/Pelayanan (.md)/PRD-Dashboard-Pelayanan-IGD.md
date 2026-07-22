# PRODUCT REQUIREMENT DOCUMENT
## Dashboard Pelayanan IGD
**Neurovi SIMRS v2 · Modul Pelayanan — Versi 1.0**

| Field | Isi |
|---|---|
| Dokumen ID | PRD-P-DSH-IGD-v1.0 |
| Modul | Pelayanan > Dashboard Pelayanan IGD |
| Menempel pada | Pola dasar mengikuti Dashboard Pelayanan Rawat Jalan (PRD-P-DSH-RJ) & Dashboard Hemodialisa (PRD-P-DSH-HD) |
| Versi Dokumen | 1.0 (Draft — Untuk Direview) |
| Tanggal Disusun | 15 Juli 2026 |
| Penyusun | Team Product — Tamtech International |
| Approver | M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) |
| Reviewer Teknis | Tim Pradev |
| Status | Untuk Direview |
| Referensi V1 | Screenshot dashboard Poli IGD V1 (2 lembar); Brief Optimasi Performa Dashboard IGD (8 Jul 2026); PRD Asesmen Dokter IGD; PRD Asesmen Perawat IGD; PRD SPRI; PRD Transfer Internal |

**Catatan penyusunan:** Dokumen ini menggantikan pendekatan draft sebelumnya yang berfokus pada **optimasi performa saja** (asumsi: fungsional V2 = identik V1). Berdasarkan diskusi lanjutan & screenshot terbaru, ditemukan bahwa **flow triase-first** (pasien bisa masuk dashboard sebelum punya No. RM) **belum terdokumentasi** di draft performa tsb — sehingga PRD ini disusun ulang sebagai **PRD fungsional lengkap**, mengikuti format Dashboard Pelayanan lainnya, dengan target performa dari brief sebelumnya tetap dipertahankan sebagai NFR (§10).

**Perubahan pasca-review (15 Jul 2026):**
- OQ-01 s/d OQ-05 (§14) diselesaikan — Penanda SEP/Prioritas di-*take out* dari scope; target performa §10 dikonfirmasi mengikat.
- Rincian Menu Pelengkap & menu 3-titik ditambahkan (§6.4), sesuai screenshot V1.
- **Checkpoint SPRI & Transfer Internal diubah dari tri-state menjadi bi-state** (Belum Dibuat / Sudah Dibuat), mengikuti pola checkpoint Surat Kontrol pada Dashboard RJ/HD (§8.3). 7 checkpoint lain (As. Dokter, As. Perawat, Tindakan, Lab, Radiologi, E-resep, Bayar) tetap tri-state.

---

## Ringkasan Eksekutif

**Dashboard Pelayanan IGD** adalah layar operasional tempat perawat dan dokter IGD mengelola alur pelayanan gawat darurat dari **triase** hingga **disposisi keluar** (pulang / lanjut rawat inap), sekaligus menjadi *single source of truth* status layanan per pasien di unit IGD.

Berbeda dari Dashboard RJ (satu kohort) dan Dashboard HD (dua kohort via tab RJ/RI), Dashboard IGD **tidak memisahkan kohort via tab**. Seluruh pasien — termasuk yang **baru di-triase dan belum terdaftar resmi (belum ber-No. RM)** — tampil dalam **satu tabel yang sama**, dengan dua **mode tampilan/sorting** yang bisa ditukar tanpa reload: **Berdasarkan Triase** dan **Berdasarkan Pelayanan**.

Fokus utama V2: (1) **flow triase-first** yang eksplisit didokumentasikan (pasien bisa punya data triase lengkap sebelum ber-No. RM); (2) **10 kolom indikator status** (9 checkpoint layanan + Status Tindak Lanjut); (3) **dua mode sorting** yang jelas definisinya; (4) **counter status 3-state** yang benar (memperbaiki bug V1 di mana ketiga counter menampilkan angka yang sama); (5) **menu aksi cepat per baris** (akses ke Triase, Asesmen, Screening Gizi, Order Gizi, Tindakan & BHP, Obat, Penunjang); dan (6) target performa **real-time & responsif** dari brief optimasi sebelumnya, dipertahankan sebagai NFR mengikat.

---

## 1. Tujuan & Latar Belakang

### 1.1 Tujuan
Menyediakan dashboard operasional agar perawat dan dokter IGD dapat **melihat seluruh pasien** — dari saat baru di-triase hingga selesai dilayani — secara **real-time**, memantau progres tiap checkpoint layanan, dan menjalankan aksi (asesmen, order, SPRI, transfer internal, disposisi) langsung dari baris pasien, tanpa kehilangan waktu akibat performa lambat atau ambiguitas status.

### 1.2 Perbaikan dari V1
| No | Aspek | Kondisi V1 (As-Is) | Perbaikan V2 (To-Be) |
|---|---|---|---|
| 1 | Dokumentasi flow triase-first | Tidak terdokumentasi secara eksplisit; pasien tanpa No. RM tampil tanpa aturan jelas | Flow **eksplisit**: pasien masuk via tombol **+ Triase**, tampil dengan status **"Belum Didaftarkan"**, No. RM & seluruh indikator "—" sampai pendaftaran selesai (§6, BR-002) |
| 2 | Counter status pelayanan | **Bug**: ketiga counter (dilayani/belum/total) menampilkan angka yang **sama** (mis. 73/73/73) | Counter dihitung benar per definisi masing-masing status, real-time dari agregasi checkpoint (BR-005) |
| 3 | Filter | Hanya dokter, tanggal, mode tampilan | Ditambah **filter status pelayanan** (sudah dilayani / belum dilayani, default semua) dan **date range** (bukan tanggal tunggal); **filter dokter dihapus** (lihat D-03) |
| 5 | Menu aksi per baris | Aksi tersebar / tidak terstandar | **Menu Pelengkap** terstandar: 7 ikon akses cepat (Triase, Asesmen, Screening Pasien, Order Gizi, Tindakan & BHP, Obat, Penunjang) + menu 3-titik untuk aksi lain |
| 6 | Performa | Lambat pada volume tinggi (150–200 pasien/hari); tidak ada target terukur | Target performa terukur (§10): initial load < 1 detik, filter/search < 1 detik, real-time freshness ≤ 10 detik, ≥ 15 sesi konkuren |
| 7 | Update status | Perlu refresh manual / tidak konsisten antar sesi user | Event-driven, **incremental update** (hanya sel yang berubah), tanpa full reload |

> Fitur inti V1 (kolom, 9 indikator layanan, dua mode tampilan Triase/Pelayanan) **dipertahankan** — V2 memperjelas & mendokumentasikan perilaku yang sudah ada, bukan mengubah alur bisnis IGD.

---

## 2. Cakupan (Scope)

### 2.1 In-Scope
1. Menampilkan **seluruh pasien IGD** (termasuk yang belum ber-No. RM) dalam **satu tabel tunggal** — tidak ada pemisahan tab kohort.
2. **Entry point "+ Triase"**: modal input nama pasien (hasil anamnesis) + Kategori Triase (PACS 1–5); pasien langsung muncul di dashboard dengan status "Belum Didaftarkan" (§6).
3. **Dua mode tampilan/sorting**: Berdasarkan Triase & Berdasarkan Pelayanan, dapat ditukar **tanpa reload** (§6, BR-003, BR-004).
4. **Filter**: pencarian (Nama/No. RM), rentang tanggal (default hari ini), status pelayanan (sudah/belum dilayani, default semua).
5. **Status layanan per pasien** atas **9 checkpoint** (§8) + **1 kolom Status Tindak Lanjut**.
6. **Counter status pelayanan** (3 state: belum/sedang/selesai) + total, dihitung benar secara real-time (perbaikan bug V1).
8. **Pagination**: default 15/halaman, opsi 15/25/50/100 + "Semua" (menyelaraskan konvensi Dashboard RJ FR-05; lihat D-04 untuk catatan perbedaan angka dari brief awal).
9. **Popover/Detail Baris**: No. Pendaftaran, Terdaftar (tanggal-jam), Jenis Kelamin, Umur, NIK, Bangsal (bila lanjut RI), Status Pasien (Lama/Baru), Waktu Triase.
10. **Menu Pelengkap per baris** (akses cepat, ikon + tooltip saat hover): Triase, Asesmen, Screening Pasien (Gizi), Order Gizi, Tindakan & BHP, Obat, Penunjang — plus menu **3-titik** untuk aksi lanjutan (SPRI, Transfer Internal, dsb).
11. **Auto-penyelesaian kondisional**: pasien dengan As. Dokter + As. Perawat + Tindakan = Selesai → Status Tindak Lanjut ter-set otomatis (mengikuti pola BR-013 Dashboard RJ/HD).
12. **Sinkronisasi status real-time** berbasis event, incremental (hanya baris/sel yang berubah).
13. Target performa terukur (NFR, §10) — mewarisi brief optimasi performa sebelumnya.

### 2.2 Out-of-Scope
1. Detail form & flow **Asesmen Dokter IGD** dan **Asesmen Perawat IGD** — masing-masing PRD terpisah (sudah ada).
2. Detail flow **SPRI (Surat Perintah Rawat Inap)** — PRD terpisah (sudah ada).
3. Detail flow **Transfer Internal** — PRD terpisah (sudah ada).
4. Detail **Order Tindakan & BHP, Order Gizi/Screening, Obat/E-Resep, Lab, Radiologi** — masing-masing PRD modul terpisah.
5. Detail **daftar opsi & perilaku disposisi keluar** (Modal Status Keluar) — mengikuti **PRD Discharge**, selaras konvensi Dashboard RJ/HD; dashboard IGD hanya menampilkan hasilnya di Kolom Status Tindak Lanjut.
6. Detail **Pendaftaran IGD** (proses No. RM diterbitkan) — PRD Pendaftaran terkait.
7. Integrasi eksternal (SATUSEHAT, dsb.) — di luar cakupan dokumen ini.
8. Perubahan RBAC di luar yang sudah berlaku pada modul terkait.

---

## 3. Modul Terkait (Related Features)

| Modul | Peran terhadap Dashboard IGD |
|---|---|
| Pendaftaran Triase & Pendaftaran IGD | Sumber pasien; entry "+ Triase" menghasilkan data awal, pendaftaran melengkapi No. RM (BR-002) |
| Asesmen Dokter IGD *(PRD ada)* | *Event source* checkpoint As. Dokter (tri-state); syarat auto-penyelesaian |
| Asesmen Perawat IGD *(PRD ada)* | *Event source* checkpoint As. Perawat (tri-state); syarat auto-penyelesaian |
| Input Tindakan & BHP | *Event source* checkpoint Tindakan (tri-state); syarat auto-penyelesaian |
| Order Lab | *Event source* checkpoint Lab (tri-state) |
| Order Radiologi | *Event source* checkpoint Radiologi (tri-state) |
| E-Resep | *Event source* checkpoint E-resep (tri-state) |
| SPRI *(PRD ada)* | *Event source* checkpoint SPRI (**bi-state**, seperti Surat Kontrol); prasyarat sebelum Transfer Internal ke RI |
| Transfer Internal *(PRD ada)* | *Event source* checkpoint Transfer Internal (**bi-state**, seperti Surat Kontrol); commit kepindahan pasien ke RI |
| Billing / Kasir | *Event source* checkpoint Bayar (tri-state) |
| Screening Gizi / Order Gizi | Akses cepat dari Menu Pelengkap baris pasien |
| PRD Discharge | Sumber daftar opsi & perilaku Modal Status Keluar; dashboard hanya menampilkan hasil pada Kolom Status Tindak Lanjut |
| MD Unit / RBAC | Privilege role untuk aksi asesmen, order, & penyelesaian |

---

## 4. User Stories

| ID | Sebagai | Ingin | Sehingga |
|---|---|---|---|
| US-01 | Perawat Triase | membuka dashboard IGD dan melihat seluruh pasien (termasuk yang baru ditriase, belum ber-RM) dalam satu tabel | bisa memantau antrian dari triase hingga selesai tanpa berpindah layar |
| US-02 | Petugas Triase | menekan tombol **+ Triase** dan input nama + kategori PACS | pasien langsung tercatat di dashboard sebelum proses pendaftaran resmi selesai |
| US-03 | Petugas IGD | menukar mode tampilan **Berdasarkan Triase** ↔ **Berdasarkan Pelayanan** tanpa reload | bisa melihat urutan sesuai kebutuhan klinis (keparahan) atau operasional (kedatangan terbaru) |
| US-04 | Petugas IGD | memfilter berdasarkan status pelayanan (sudah/belum dilayani), rentang tanggal, dan mencari via nama/No. RM | fokus pada pasien yang relevan saat volume tinggi |
| US-05 | Dokter/Perawat IGD | mengakses Asesmen Dokter/Perawat langsung dari baris pasien via Menu Pelengkap | proses asesmen tercatat tanpa navigasi berlapis |
| US-06 | Petugas IGD | melihat status 9 checkpoint layanan secara real-time per pasien | tahu tahapan pelayanan tiap pasien secara akurat |
| US-09 | Petugas IGD | melihat counter status pelayanan (belum/sedang/selesai) yang **akurat** | tahu beban & progres IGD sekilas, tanpa bug angka yang identik |
| US-10 | Petugas IGD | membuka detail baris (popover) untuk lihat No. Pendaftaran, JK, umur, NIK, bangsal, dll | cepat memverifikasi identitas pasien tanpa membuka modul lain |
| US-11 | Dokter | menetapkan disposisi keluar pasien (pulang / lanjut SPRI & Transfer Internal ke RI) | status tindak lanjut pasien tercatat terstruktur |
| US-12 | Sistem | menjalankan auto-penyelesaian hanya untuk pasien yang benar-benar dilayani lengkap | data casemix & kunjungan IGD bersih |
| US-13 | Petugas IGD | mengakses dashboard dengan performa cepat & stabil meski 150–200 pasien/hari | tidak ada keterlambatan informasi saat volume tinggi |

---

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | Dashboard menampilkan **satu tabel tunggal** untuk seluruh pasien IGD — **tidak ada pemisahan tab kohort** seperti Dashboard HD/Terapi. |
| FR-02 | **Entry Point "+ Triase"**: tombol mengambang (floating action button) membuka modal input nama pasien (dari anamnesis) + Kategori Triase (PACS 1–5). Setelah disimpan, pasien langsung tampil di dashboard dengan badge **"Belum Didaftarkan"**. |
| FR-03 | **Kolom tabel** (14 kolom total): No. Triase, Nama, Kategori Triase (badge PACS), No. RM (kosong bila belum terdaftar), Cara Pembayaran, Status Tindak Lanjut, dan **9 kolom checkpoint**: As. Dokter, As. Perawat, Tindakan, Lab, Radiologi, E-resep, SPRI, Transfer Internal, Bayar. |
| FR-04 | **Mode tampilan/sorting** (toggle, tanpa reload): **Berdasarkan Triase** = urut descending No. Triase (terlepas status daftar/layani); **Berdasarkan Pelayanan** = urut descending berdasarkan waktu pendaftaran/pelayanan terbaru (pasien yang belum ber-RM tetap tampil di atas karena entri paling baru). |
| FR-05 | **Filter**: pencarian (Nama / No. RM), rentang tanggal (default hari ini), status pelayanan (sudah dilayani / belum dilayani, default menampilkan semua). Filter bersifat *additive* (AND). **Tidak ada filter dokter/jam praktik/checkin** (D-03). |
| FR-06 | **Pagination**: default **15/halaman**; opsi **15 / 25 / 50 / 100** + **"Semua"** (menyelaraskan Dashboard RJ FR-05, opsi "Semua" dipertahankan dari V1 IGD — lihat D-04). |
| FR-07 | **Counter status pelayanan** (3 state: Belum Dilayani / Sedang Dilayani / Selesai Dilayani) + Total, dihitung **real-time dari agregasi checkpoint** — bukan field statis (memperbaiki bug V1 di mana ketiga angka identik). |
| FR-09 | **9 kolom checkpoint** — 7 bertipe **tri-state** (As. Dokter, As. Perawat, Tindakan, Lab, Radiologi, E-resep, Bayar) dan 2 bertipe **bi-state** (SPRI, Transfer Internal, mengikuti pola Surat Kontrol) — read-only di dashboard, event-driven dari modul sumber. |
| FR-10 | **Kolom Status Tindak Lanjut** (sebelum kolom Aksi) menampilkan disposisi pasien (Pulang / lanjut RI via SPRI+Transfer Internal / dsb.); nilai berasal dari job auto-penyelesaian atau penetapan manual mengikuti **PRD Discharge** (selaras konvensi Dashboard RJ/HD). |
| FR-11 | **Auto-penyelesaian kondisional**: pasien dengan As. Dokter + As. Perawat + Tindakan = Selesai (ketiganya) DAN Status Tindak Lanjut = null → di-set otomatis; manual override menang (mengikuti pola BR-012/013 Dashboard RJ). |
| FR-12 | **Popover Detail Baris**: No. Pendaftaran, Terdaftar (tanggal-jam), Jenis Kelamin, Umur, NIK, Bangsal, Status Pasien (Lama/Baru), Waktu Triase. |
| FR-13 | **Menu Pelengkap** per baris: 7 ikon akses cepat dengan tooltip saat hover — Triase, Asesmen, Screening Pasien, Order Gizi, Tindakan & BHP, Obat, Penunjang — plus **menu 3-titik** berisi 9 item aksi lanjutan (rincian §6.4). |
| FR-14 | **Real-Time Status Sync**: checkpoint diperbarui berbasis event (incremental — hanya baris/sel yang berubah), tanpa full reload. Target freshness ≤ 10 detik (§10). |
| FR-15 | Header menampilkan **info "Terakhir Diperbarui"** dan tombol **Refresh** manual. |

---

## 6. Business Process

### 6.1 Alur Utama (To-Be) — Flow Triase-First

> **Koreksi penting dari model V1:** pasien **di-triase terlebih dahulu**, baru kemudian didaftarkan (bukan sebaliknya). Dashboard harus menampung pasien yang **belum punya No. RM**.

1. Petugas triase menekan **+ Triase** → input nama pasien (dari anamnesis) + Kategori Triase (PACS 1–5) → simpan.
2. Pasien **langsung muncul di dashboard**, badge **"Belum Didaftarkan"**, kolom No. RM & Cara Pembayaran = "—", seluruh 9 checkpoint = "—".
3. Petugas pendaftaran memproses pendaftaran IGD → **No. RM terisi** → badge "Belum Didaftarkan" hilang, Cara Pembayaran terisi.
4. **Perawat**: Asesmen Perawat → checkpoint As. Perawat → Selesai.
5. **Dokter**: Asesmen Dokter + order (Tindakan/Lab/Radiologi/E-Resep) → checkpoint terkait berubah.
6. Unit penunjang & farmasi mengeksekusi order → checkpoint terkait → Selesai.
7. **Disposisi**:
   - **Pulang** — otomatis (auto-penyelesaian, FR-11) atau manual via Modal Status Keluar (mengikuti PRD Discharge).
   - **Lanjut Rawat Inap** — dokter membuat **SPRI** → checkpoint SPRI = *Sudah Dibuat* → **Transfer Internal** dibuat → checkpoint Transfer Internal = *Sudah Dibuat* → pasien keluar dari antrian aktif IGD, episode berlanjut di RI.
8. Data mengalir ke casemix/reporting kunjungan IGD.

### 6.2 Dua Mode Tampilan/Sorting
| Mode | Definisi Urutan | Catatan |
|---|---|---|
| **Berdasarkan Triase** | Descending No. Triase (nomor triase terbaru di atas) | Terlepas dari status daftar/layani — mencerminkan urutan kedatangan klinis |
| **Berdasarkan Pelayanan** | Descending berdasarkan waktu pendaftaran/pelayanan terbaru | Pasien yang belum ber-No. RM tetap tampil di atas selama entrinya paling baru; urutan **bisa berbeda** dari No. Triase (mis. No. Triase 2 PACS 4 bisa dilayani lebih dulu dari No. Triase 3 PACS 2, sehingga muncul lebih atas di mode Pelayanan) |

### 6.3 Perbandingan dengan Dashboard Lain
| Aspek | RJ | HD | IGD |
|---|---|---|---|
| Pemisahan kohort | Tidak ada (RJ saja) | Tab RJ/RI | **Tidak ada tab — 1 dashboard, 2 mode sorting** |
| Entry point pasien | Pendaftaran RJ (sudah ber-No. RM) | Pendaftaran RJ / kiriman bangsal | **Triase dulu (bisa belum ber-No. RM), baru pendaftaran** |
| Sorting default | Ascending (daftar duluan di atas) | Ascending per kohort | **Descending** (data/triase terbaru di atas) |
| Filter dokter/jam praktik/checkin | Ada | Ada | **Tidak ada** (D-03) |

### 6.4 Rincian Menu Pelengkap & Menu 3-Titik (FR-13)

**7 Ikon Akses Cepat** (tooltip saat hover):
| Ikon | Aksi |
|---|---|
| 1 | Form Triase |
| 2 | Form Asesmen |
| 3 | Screening (Gizi) |
| 4 | Order Gizi |
| 5 | Tindakan & BHP |
| 6 | Obat |
| 7 | Penunjang |

**9 Item Menu 3-Titik** (dikonfirmasi dari screenshot V1):
| No | Item |
|---|---|
| 1 | Data Sosial Pasien |
| 2 | Permintaan Jadwal Operasi |
| 3 | Pembuatan Surat |
| 4 | Form Transfer Internal |
| 5 | Form Laporan Operasi |
| 6 | Form PPI/IPCN *(kondisional — tampak nonaktif/abu-abu di V1, kemungkinan bergantung status/role pasien; lihat submenu "›")* |
| 7 | Order Ambulance |
| 8 | Order Tindakan VK |
| 9 | Pulangkan Pasien |

> **Catatan:** "Form Transfer Internal" dan "Pulangkan Pasien" pada menu 3-titik ini adalah **titik pemicu aksi** (entry point UI) — perilaku & validasi lengkapnya tetap mengikuti PRD Transfer Internal (§11 D-05) dan PRD Discharge (§11 D-09), bukan didefinisikan ulang di sini. Item "Form PPI/IPCN" berada di luar cakupan modul checkpoint dashboard ini (§2.2) — hanya dicatat sebagai entry point yang ada di V1.

---

## 7. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Dashboard menampilkan pasien dengan tanggal layanan dalam rentang filter tanggal aktif (default hari ini). |
| BR-002 | Pasien dapat tampil di dashboard **sebelum memiliki No. RM** — yaitu segera setelah data triase disimpan via **+ Triase**. Status "Belum Didaftarkan" ditampilkan hingga proses pendaftaran IGD selesai (No. RM terisi). |
| BR-003 | Mode **Berdasarkan Triase**: urutan descending No. Triase, terlepas dari status pendaftaran/pelayanan. |
| BR-004 | Mode **Berdasarkan Pelayanan**: urutan descending berdasarkan waktu pendaftaran/pelayanan terbaru; dapat berbeda urutan dari No. Triase. |
| BR-005 | Counter status pelayanan (3 state + total) dihitung **real-time dari agregasi checkpoint**, bukan field statis — **wajib** menghasilkan angka yang berbeda antar state (perbaikan atas bug V1). |
| BR-008 | Checkpoint **As. Dokter, As. Perawat, Tindakan, Lab, Radiologi, E-resep, Bayar** bertipe **tri-state**: Tidak Diisi → Sedang Diproses → Selesai. |
| BR-009 | Checkpoint yang tidak relevan untuk pasien tertentu (mis. Transfer Internal untuk pasien yang pulang tanpa rawat inap) ditampilkan "—", **tidak boleh** otomatis Selesai. |
| BR-010 | Checkpoint **SPRI** (bi-state) harus berstatus **Sudah Dibuat** sebelum checkpoint **Transfer Internal** (bi-state) dapat diisi (prasyarat berurutan, mengikuti PRD SPRI & Transfer Internal). |
| BR-011 | Status checkpoint bersifat **read-only** di dashboard; sumber kebenaran tetap di modul masing-masing (event-driven). |
| BR-012 | **Kriteria auto-penyelesaian**: As. Dokter + As. Perawat + Tindakan = Selesai (ketiganya) DAN Status Tindak Lanjut = null → di-set otomatis "pulangkan". Pasien yang sudah di-set manual di-*exclude* (manual override menang). |
| BR-013 | **Daftar opsi & perilaku disposisi keluar** (Modal Status Keluar) mengikuti **PRD Discharge** — tidak didefinisikan di dashboard ini. Dashboard hanya menampilkan hasil pada Kolom Status Tindak Lanjut. |
| BR-014 | Filter status pelayanan "sudah dilayani" didefinisikan sebagai: **minimal satu asesmen (Dokter atau Perawat) berstatus Selesai**. *(Dikonfirmasi)* |
| BR-015 | Setiap perubahan Status Tindak Lanjut dan eksekusi auto-penyelesaian tercatat di audit log (aktor/sistem, timestamp, before/after). |
| BR-016 | **Tidak ada filter dokter, jam praktik, atau status check-in** pada Dashboard IGD (berbeda dari RJ/HD/Rehab/Terapi) — keputusan eksplisit karena alur IGD tidak terjadwal per dokter (D-03). |

---

## 8. State Machine — Status Checkpoint

### 8.1 Legenda Visual (mengikuti konvensi V1)
| Ikon | State |
|---|---|
| ✔ (hijau) | Selesai |
| 🕐 (biru) | Sedang Diproses / Menunggu Hasil |
| — | Tidak Diisi / N/A / Belum Didaftarkan |

### 8.2 Checkpoint Tri-State
Berlaku untuk **7 checkpoint**: As. Dokter, As. Perawat, Tindakan, Lab, Radiologi, E-resep, Bayar.

| State | Definisi | Pemicu |
|---|---|---|
| Tidak Diisi | Kondisi awal / pasien belum terdaftar | Default |
| Sedang Diproses | Form dibuka belum disimpan (As. Dokter/Perawat/Tindakan/Bayar) atau order terkirim belum selesai (Lab/Radiologi/E-resep) | Aksi user di modul sumber |
| Selesai | Form tersimpan/terverifikasi atau order dieksekusi tuntas | Event dari modul sumber |

### 8.3 Checkpoint Bi-State (SPRI & Transfer Internal)
Berlaku untuk **2 checkpoint**: **SPRI** dan **Transfer Internal** — mengikuti pola bi-state yang sama dengan checkpoint Surat Kontrol pada Dashboard RJ/HD (bukan tri-state seperti 7 checkpoint lain di §8.2).

| State | Definisi |
|---|---|
| Belum Dibuat | SPRI / Transfer Internal belum diterbitkan untuk pasien tsb |
| Sudah Dibuat | SPRI / Transfer Internal telah diterbitkan/tersimpan |

> Tidak ada state "Sedang Diproses" untuk kedua checkpoint ini — konsisten dengan definisi bi-state Surat Kontrol (§8.3 PRD Dashboard HD). Prasyarat urutan tetap berlaku: **SPRI = Sudah Dibuat** sebelum **Transfer Internal** dapat diisi (BR-010).

### 8.4 Status Pra-Pendaftaran (khusus IGD)
| State | Definisi |
|---|---|
| Belum Didaftarkan | Data triase tersimpan (No. Triase & Kategori terisi), No. RM & seluruh checkpoint = "—" |
| Terdaftar | Pendaftaran IGD selesai, No. RM terisi, checkpoint mulai dapat diisi |

---

## 9. Status Tindak Lanjut & Auto-Penyelesaian

**Kolom Status Tindak Lanjut** ditempatkan sebelum kolom Aksi, menampilkan disposisi keluar pasien (Pulang / lanjut Rawat Inap via SPRI+Transfer Internal / dsb.) — selaras konvensi Dashboard RJ & HD.

### 9.1 Auto-Penyelesaian (background job)
| Aspek | Detail |
|---|---|
| Kriteria | As. Dokter + As. Perawat + Tindakan = Selesai (ketiganya), BR-012 |
| Aksi | Set Status Tindak Lanjut = "pulangkan"; pasien keluar dari antrian aktif |
| Manual override | Pasien yang sudah di-set manual di-*exclude* dari job (menang atas auto) |
| Audit | Seluruh eksekusi tercatat (BR-015) |

### 9.2 Penetapan Disposisi Manual → PRD Discharge
Penetapan disposisi keluar (termasuk alur lanjut Rawat Inap via SPRI → Transfer Internal) dilakukan via aksi pada baris pasien. **Daftar opsi & perilaku tiap disposisi didefinisikan di PRD Discharge** (selaras BR-013). Dashboard hanya:
- menampilkan hasil disposisi pada Kolom Status Tindak Lanjut,
- menyediakan titik pemicu aksi (Menu Pelengkap / menu 3-titik),
- mencatat perubahan ke audit log.

---

## 10. Non-Functional Requirements

> Target berikut mewarisi brief Optimasi Performa Dashboard IGD (8 Jul 2026) dan telah dikonfirmasi sebagai target mengikat dari SPV.

| ID | Requirement |
|---|---|
| NFR-01 | Initial load seluruh data pasien (± 150–200 pasien aktif/hari) **< 1 detik** pada kondisi normal. |
| NFR-02 | Respon filter, pencarian, dan pergantian mode tampilan **< 1 detik**. |
| NFR-03 | Update status real-time (delta event → dashboard) **≤ 10 detik**, tanpa full reload — target ditetapkan SPV, mengikat. |
| NFR-04 | Update bersifat **incremental** — hanya baris/sel yang berubah yang di-*refresh*, bukan seluruh tabel. |
| NFR-05 | Mendukung **≥ 15 sesi pengguna konkuren** (dokter, perawat, admin, petugas penunjang) tanpa desinkronisasi status antar sesi — target ditetapkan SPV, mengikat. |
| NFR-06 | Stabil selama sesi kerja panjang (± 8 jam) dengan refresh berkala, tanpa memory leak / penurunan performa browser. |
| NFR-07 | Kompatibel & responsif pada perangkat **PC maupun tablet**. |
| NFR-08 | Pergantian mode tampilan / filter **tidak** mereset posisi scroll, filter aktif, atau fokus pengguna. |
| NFR-09 | Status checkpoint tidak boleh hanya bergantung warna (ikon + warna + label). |
| NFR-10 | Aksi (asesmen, order, penyelesaian) mematuhi privilege RBAC per role. |
| NFR-11 | Seluruh perubahan status tercatat pada audit log. |
| NFR-12 | Indikator status **tidak dihitung ulang saat query** — didenormalisasi/*materialized* per pasien per modul, diperbarui event-driven saat transaksi tersimpan. |

---

## 11. Dependencies

| ID | Dependency | Sifat |
|---|---|---|
| D-01 | Modul Asesmen Dokter IGD & Asesmen Perawat IGD (form & event) | Wajib |
| D-02 | Modul Input Tindakan & BHP | Wajib |
| D-03 | Order Lab, Order Radiologi, E-Resep (event status) | Wajib |
| D-04 | **PRD SPRI** — sumber checkpoint SPRI & prasyarat Transfer Internal | Wajib (untuk disposisi lanjut RI) |
| D-05 | **PRD Transfer Internal** — commit kepindahan pasien ke RI | Wajib (untuk disposisi lanjut RI) |
| D-06 | Billing/Kasir (event status Bayar) | Wajib |
| D-07 | Modul Pendaftaran Triase & Pendaftaran IGD (sumber data awal + No. RM) | Wajib |
| D-09 | **PRD Discharge** — sumber daftar opsi & perilaku disposisi Status Tindak Lanjut | Wajib (untuk disposisi manual) |
| D-10 | MD Unit / RBAC | Wajib |
| D-11 | Screening Gizi / Order Gizi (akses dari Menu Pelengkap) | Wajib (untuk Menu Pelengkap) |

---

## 12. Acceptance Criteria (Given–When–Then)

| ID | Kriteria |
|---|---|
| AC-01 | **Given** petugas menekan **+ Triase** dan mengisi nama + kategori PACS, **When** disimpan, **Then** pasien langsung muncul di dashboard dengan badge "Belum Didaftarkan", No. RM & Cara Pembayaran "—", seluruh checkpoint "—". |
| AC-02 | **Given** mode **Berdasarkan Triase** aktif, **When** dashboard dimuat, **Then** pasien terurut descending No. Triase, terlepas status daftar/layani. |
| AC-03 | **Given** mode **Berdasarkan Pelayanan** aktif, **When** dashboard dimuat, **Then** pasien terurut descending berdasarkan waktu pendaftaran/pelayanan terbaru — urutan dapat berbeda dari No. Triase. |
| AC-04 | **Given** user menukar mode tampilan, **When** toggle ditekan, **Then** tabel diurutkan ulang **tanpa reload halaman** dan filter/search aktif tetap terjaga. |
| AC-05 | **Given** ada pasien belum dilayani & sudah selesai dilayani, **When** dashboard dimuat, **Then** ketiga counter (belum/sedang/selesai) menampilkan **angka yang berbeda** sesuai kondisi riil (bug V1 tidak terjadi). |
| AC-07 | **Given** pasien As. Dokter + As. Perawat + Tindakan = Selesai, **When** job auto-penyelesaian berjalan, **Then** Status Tindak Lanjut ter-set "pulangkan" otomatis. |
| AC-08 | **Given** dokter membuat SPRI untuk pasien, **When** SPRI tersimpan, **Then** checkpoint SPRI = **Sudah Dibuat** (bi-state) dan checkpoint Transfer Internal menjadi dapat diisi. |
| AC-09 | **Given** user hover pada ikon Menu Pelengkap, **When** kursor berada di atas ikon, **Then** tooltip nama aksi muncul (Triase/Asesmen/Screening Pasien/Order Gizi/Tindakan & BHP/Obat/Penunjang). |
| AC-10 | **Given** user klik nama pasien / baris, **When** popover dibuka, **Then** tampil No. Pendaftaran, JK, umur, NIK, bangsal, status pasien, waktu triase. |
| AC-11 | **Given** perubahan status di modul sumber, **When** event diterima, **Then** hanya sel/baris terkait yang diperbarui pada dashboard (< 10 detik), tanpa reload penuh. |
| AC-12 | **Given** 200 pasien aktif hari itu, **When** dashboard dimuat, **Then** initial load < 1 detik (p95). |

---

## 13. Keputusan Desain

| ID | Keputusan |
|---|---|
| D-01 | Dashboard IGD **tidak menggunakan tab kohort** — satu tabel tunggal dengan dua mode sorting (Triase/Pelayanan), berbeda dari pola tab RJ/RI di Dashboard HD & Terapi. |
| D-02 | Dashboard **tidak memiliki kolom "Asal Unit"** — dikonfirmasi dari screenshot dashboard riil (koreksi atas asumsi awal). |
| D-03 | **Tidak ada filter Dokter/Jam Praktik/Check-in** pada Dashboard IGD — keputusan eksplisit, berbeda dari RJ/HD/Rehab/Terapi, karena alur IGD tidak terjadwal per dokter. |
| D-04 | **Pagination** menyesuaikan konvensi Dashboard RJ (FR-05): 15/25/50/100 + "Semua" — opsi "25" (bukan "30") dipakai untuk konsistensi lintas dashboard; opsi "Semua" dipertahankan dari V1 IGD. |
| D-05 | Flow pasien adalah **triase dahulu, baru pendaftaran** — dashboard harus menampung pasien pra-pendaftaran (belum ber-No. RM) dengan status "Belum Didaftarkan". |
| D-06 | **Data Pasien** menggunakan format No. Triase, Nama, Kategori Triase, No. RM, Cara Pembayaran (bukan No. Antrian seperti dashboard lain) — sesuai sifat kedatangan IGD yang berbasis triase, bukan antrian terjadwal. |
| D-07 | Sorting default seluruh Dashboard IGD adalah **descending** (data/triase terbaru di atas) — kebalikan dari RJ/HD/Rehab/Terapi yang ascending (siapa daftar duluan di atas), karena prioritas IGD adalah kasus terbaru/paling urgent. |
| D-08 | Kolom checkpoint IGD berjumlah **9** (bukan 11): tidak ada kolom Asal Unit; SPRI & Transfer Internal menggantikan Surat Kontrol yang dipakai dashboard lain — dan mengikuti tipe **bi-state** yang sama seperti Surat Kontrol (bukan tri-state). |
| D-09 | **Kolom Status Tindak Lanjut** ditambahkan (sebelum kolom Aksi), selaras konvensi Dashboard RJ & HD (§9). Daftar opsi & perilaku disposisi mengikuti **PRD Discharge**, tidak didefinisikan di dashboard ini. |

---

## 14. Open Questions (Resolved)

Seluruh Open Questions dari draft sebelumnya telah dijawab pada 15 Juli 2026.

| ID | Pertanyaan | Status |
|---|---|---|
| OQ-01 | ~~Penanda SEP & Prioritas~~ — **Resolved**: dikonfirmasi tidak relevan untuk Dashboard IGD, **di-take out** dari scope (§2, §5, §7). | **Resolved** |
| OQ-02 | ~~Definisi "sudah dilayani"~~ — **Resolved**: dikonfirmasi minimal satu asesmen (Dokter atau Perawat) berstatus Selesai (BR-014). | **Resolved** |
| OQ-03 | ~~Target performa~~ — **Resolved**: freshness ≤ 10 detik & konkurensi ≥ 15 sesi **dipertahankan** sebagai target mengikat, ditetapkan langsung oleh SPV (bukan usulan lagi). | **Resolved** |
| OQ-04 | ~~Posisi ikon edit (pensil) pada baris pasien~~ — **Dikonfirmasi**: ikon edit tetap menempel pada kolom **Cara Pembayaran** (edit penjamin), bukan pada Status Tindak Lanjut. | **Resolved** |
| OQ-05 | ~~Rincian 9 item pada menu 3-titik~~ — **Dikonfirmasi**, lihat daftar final pada §5 FR-13 & §6.4. | **Resolved** |

---

## 15. Roadmap & Risk Register

### 15.1 Roadmap (usulan)
| Fase | Cakupan |
|---|---|
| Fase 1 (MVP) | Flow triase-first, satu tabel tanpa tab kohort, 2 mode sorting, 9 checkpoint + Status Tindak Lanjut, filter (search/date range/status pelayanan), counter 3-state (perbaikan bug), pagination, popover detail, Menu Pelengkap 7 ikon, auto-penyelesaian, target performa §10 |
| Fase 2 | Integrasi penuh PRD Discharge untuk Modal Status Keluar |
| Fase 3 | Real-time mechanism enhancement (SSE/WebSocket) bila polling MVP belum memenuhi target freshness |

### 15.2 Risk Register
| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-01 | Definisi "sudah dilayani" (OQ-02) belum dikunci sebelum go-live | Counter & filter status pelayanan tidak konsisten dengan ekspektasi user | Kunci BR-014 bersama stakeholder sebelum implementasi filter |
| R-02 | Target performa (OQ-03) tidak tervalidasi dengan kondisi lapangan riil | NFR-03/05 gagal terpenuhi saat volume puncak | Ukur baseline V1 sebagai pembanding; sesuaikan target pasca-pilot |
| R-03 | Auto-penyelesaian salah men-set pasien yang masih perlu lanjut ke SPRI/Transfer Internal | *False data* — pasien ter-"pulangkan" padahal seharusnya lanjut RI | Uji ketat BR-012; pastikan pasien dengan SPRI aktif di-*exclude* dari kriteria auto-pulang murni |
| R-05 | Performa < 1 detik tidak tercapai pada volume tinggi (150–200 pasien/hari) | UX buruk, keterlambatan informasi klinis | Indexing, virtualization, indikator materialized (NFR-12) |
| R-06 | Status checkpoint tidak real-time (event delay) | Salah baca progres pasien gawat darurat | Arsitektur event-driven + audit rekonsiliasi periodik |

---

*Dokumen ini draft v1.0 untuk direview. Seluruh 5 Open Questions (§14) telah diselesaikan: OQ-01 (Penanda SEP/Prioritas) di-**take out** dari scope karena tidak relevan untuk IGD; OQ-02, OQ-04, dan OQ-05 **dikonfirmasi**; OQ-03 (target performa) **dipertahankan** sebagai target mengikat dari SPV. Dokumen siap dinaikkan status menjadi Approved setelah review akhir oleh Tim Pradev.*
