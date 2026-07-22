# PRD — Order Resep (E2)

**Related Document:** BPMN g-service-order-resep.json; List Fitur V2.xlsx (MVP Fitur Operasional) kode E2; PRD terkait E1 (Tindakan & BHP), E12/E23 (CPO), B1/B2 (Pendaftaran), modul Farmasi
**Versi:** 1.1 - Revisi (rehab medis, tanpa alkes/estimasi harga/cek stok, obat pulang ranap, resep default)
**Tanggal:** 2026-06-21

## 1. Overview / Brief Summary

Modul **Order Resep (e-Prescribing)** adalah bagian dari EMR pada SIMRS RS Tipe C & D. Memfasilitasi dokter (DPJP) membuat, mengelola, mengirim, dan memantau resep obat secara elektronik ke unit Farmasi dari berbagai titik layanan: **IGD, Rawat Jalan, Rawat Inap, IBS, VK, Rehabilitasi Medis**.

Dokter menyusun resep dari **formularium RS** (master farmasi). Tiap item mencatat: nama obat/sediaan, dosis, frekuensi, rute, jumlah, durasi, aturan pakai, catatan khusus. Mendukung **2 jenis item**: Non-Racik dan Racik (DTD/Non-DTD). Termasuk fasilitas resep berulang (Iter), PRB, obat pulang (khusus ranap), shortcut copy resep lama, dan **simpan/terapkan resep default** (template per dokter/diagnosa).

**Catatan scope penting:** order resep pada level peresepan medis. **Pemilihan item spesifik obat (merek/batch/substitusi) dan ketersediaan stok ditentukan oleh Farmasi**, bukan oleh dokter saat order. Karena itu order resep **tidak memerlukan cek stok** dan **tidak menampilkan estimasi harga**.

Sistem (Neurovi) melakukan validasi klinis: load riwayat resep, cek sisa obat kronis, tampil riwayat alergi, deteksi duplikasi terapi (peringatan obat sama 3x dosis sama), validasi kelengkapan. Setelah dikirim, order masuk **antrian Farmasi** dengan status real-time (Pending → dst). Seluruh aktivitas tercatat di RME + **audit trail**.

Integrasi: Farmasi, EMR/Assessment, penjamin (BPJS), Apotek Online (bridging), SATUSEHAT.

## 2. Background

**Masalah saat ini (As-Is)** [ASUMSI berdasarkan kondisi umum RS Tipe C&D]:
- Resep ditulis manual di kertas → tulisan dokter sulit dibaca → salah baca obat/dosis oleh Farmasi (medication error).
- Tidak ada validasi otomatis: alergi, duplikasi terapi, sisa obat kronis dicek manual atau terlewat.
- Tidak ada visibilitas status: dokter/perawat tidak tahu resep sudah disiapkan atau belum → koordinasi lemah.
- Dokter mengetik ulang resep yang sering dipakai (pola terapi rutin) → boros waktu.
- Data konsumsi obat & kepatuhan formularium sulit direkap untuk evaluasi.

**Kenapa modul ini perlu:**
- Amanat RME (Permenkes 24/2022) — peresepan wajib terdokumentasi elektronik. [PERLU KONFIRMASI nomor regulasi spesifik]
- Keselamatan pasien (medication safety) + efisiensi waktu layanan.
- Integrasi end-to-end resep → farmasi.

**Pembagian peran (penting):** dokter meresepkan pada level **terapi/zat aktif & sediaan** dari formularium; **Farmasi** yang menentukan **item spesifik obat** (merek/batch/substitusi) dan mengelola **stok**. Maka modul order resep tidak melakukan cek stok maupun perhitungan harga.

**Kendala RS Tipe C&D:** SDM IT & apoteker terbatas, internet kadang tidak stabil. Desain harus sederhana, cepat input (quick chips dosis, resep default, copy resep lama), dan tahan koneksi tidak stabil. [ASUMSI: perlu mode draft lokal/retry kirim bila koneksi putus]

## 3. In Scope

### Scope Definition (dikerjakan)
1. Pembuatan e-Resep dari semua titik layanan (IGD, RJ, RI, IBS, VK, Rehabilitasi Medis) via **2 entry point**: Assessment Poli → Buat Resep, atau Dashboard Pasien → E-Resep (BPMN gateway "Entry Point?").
2. Dua jenis item resep: **Non-Racik** dan **Racik** (metode DTD & Non-DTD) (BPMN gateway "Pilih Jenis?").
3. Staging table: tambah/edit/hapus item sebelum kirim, review daftar item (tanpa estimasi harga).
4. Validasi sistem: load riwayat resep, cek sisa obat kronis, tampil riwayat alergi, deteksi duplikasi terapi (peringatan obat 3x dosis sama), validasi kelengkapan data. **Tanpa cek stok** (stok domain Farmasi).
5. Penandaan resep: **Iter** (berulang) & **PRB**.
6. **Obat dibawa pulang** (form E-Resep Obat Pulang) — **hanya tersedia pada order resep Rawat Inap (ranap)**.
7. **Shortcut copy resep lama** (Klik + pada Resep Lama → auto-copy ke staging).
8. **Simpan & terapkan resep default**: dokter menyimpan template resep yang sering dipakai (per dokter, opsional per diagnosa) lalu memanggilnya untuk auto-isi staging.
9. Quick chips dosis (1, 1/2, 1/3, 1/4, 1/5, 1/8, 2/3, 3/4).
10. Kirim ke antrian Farmasi (Generate Order ID) + status real-time (Pending) + notifikasi ke dokter.
11. Audit trail seluruh aktivitas.
12. Bridging Apotek Online (Sistem Neurovi).

### Out Scope (TIDAK dikerjakan di modul ini)
- **Pemilihan item spesifik obat** (merek/dagang, batch, substitusi generik↔paten) — **ditentukan oleh Farmasi**, bukan dokter saat order.
- **Cek & manajemen stok obat** — order resep tidak memerlukan stok; ketersediaan diurus Farmasi/Inventory.
- **Estimasi/perhitungan harga resep** — bukan tanggung jawab modul ini (Farmasi/Kasir).
- Order alkes/BHP — bukan bagian order resep ini (lihat E1 Tindakan & BHP).
- Proses internal Farmasi: verifikasi apoteker, penyiapan, dispensing, penyerahan obat (modul Farmasi terpisah; modul ini hanya kirim order + terima status).
- Pencatatan pemberian obat di bangsal / e-MAR (E12 CPO, E23 CPO Input Waktu).
- Order penunjang Lab/Rad/Darah/Gizi/PA (E3/E4/E5/E8/E22) — modul order terpisah.
- Tindakan & BHP (E1).
- Penagihan/billing & klaim INA-CBG (modul Kasir/Klaim).

## 4. Goals and Metrics

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Kurangi medication error karena resep manual | % resep dengan peringatan validasi yang ditindaklanjuti; jumlah error baca obat | turun ≥ 70% [PERLU KONFIRMASI baseline] |
| Percepat waktu peresepan | Rata-rata waktu buat 1 resep | < 2 menit [ASUMSI] |
| Tingkatkan kepatuhan formularium | % item resep dari formularium RS | ≥ 95% [PERLU KONFIRMASI] |
| Efisiensi input via template | % resep yang dibuat dari resep default/copy resep lama | ≥ 40% [ASUMSI] |
| Visibilitas status resep | % resep dengan status real-time terlacak | 100% |
| Akuntabilitas | % aktivitas peresepan tercatat audit trail | 100% |
| Adopsi e-Prescribing | % dokter pakai e-Resep vs manual | ≥ 90% dalam 3 bulan [ASUMSI] |

## 5. Related Feature

Fitur terkait dari cluster **Pelayanan Utama** (List Fitur MVP):

| Code | Menu / Sub Menu | Relasi dengan Order Resep |
|------|-----------------|---------------------------|
| E1 | Tindakan & BHP | Alkes/BHP ditangani di sini (di luar order resep) |
| **E2** | **Order resep** (modul ini) | — |
| E3 | Order penunjang Laboratorium | Pola order serupa (staging → kirim antrian) |
| E4 | Order penunjang Radiologi | Pola order serupa |
| E5 | Order permintaan darah | Pola order serupa |
| E8 | Order gizi | Pola order serupa |
| E12 | Order Catatan Pemberian Obat (CPO) | Hilir resep ranap — obat yang sudah diresepkan diberikan ke pasien |
| E13 | Discharge Pasien | Obat pulang (PRB/Iter) terkait discharge ranap |
| E22 | Order Patologi Anatomi | Pola order serupa |
| E23 | CPO - Input Waktu Pemberian Obat | Hilir e-MAR |

Modul luar cluster: **Pendaftaran (B1/B2)** sumber data pasien & penjamin; **Farmasi** penerima order + penentu item spesifik & stok; **EMR/Assessment** entry point.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI]
1. Dokter periksa pasien, tulis resep tangan di blanko kertas.
2. Resep diserahkan ke pasien/perawat → dibawa ke Farmasi.
3. Petugas Farmasi baca manual; bila ragu (tulisan/dosis) telpon/datangi dokter.
4. Cek alergi, duplikasi dilakukan manual/ingatan → rawan terlewat.
5. Dokter menulis ulang pola terapi rutin tiap kali → boros waktu.
6. Tidak ada status real-time; rekap konsumsi obat manual.

### B. To-Be (kondisi diharapkan — turunan BPMN)
1. Dokter buka E-Resep dari **Assessment Poli** atau **Dashboard Pasien** (Entry Point?).
2. Sistem **auto-load riwayat resep**, **cek sisa obat kronis**, tampil **riwayat alergi** di sidebar (Always Display).
3. Dokter pilih jenis item (Non-Racik / Racik), atau pakai **shortcut copy resep lama**, atau **terapkan resep default**.
4. Untuk Non-Racik: pilih obat dari formularium (level terapi/zat & sediaan), isi dosis/jumlah/aturan/rute → tambah ke staging. **Order resep tidak memerlukan stok** — ketersediaan & item spesifik ditentukan Farmasi.
5. Untuk Racik: isi nama racikan, pilih metode **DTD** (chips dosis) / **Non-DTD** (jumlah manual), tambah bahan satu per satu.
6. Sistem **deteksi duplikasi** (obat 3x dosis sama → notif: Lanjutkan / Cancel).
7. Dokter review staging table (daftar item, tanpa harga), tandai **Iter/PRB** bila perlu. Pada **ranap**, dokter dapat membuat **E-Resep Obat Pulang**.
8. Dokter dapat **menyimpan resep saat ini sebagai resep default** untuk dipakai ulang.
9. Bila data benar → **Simpan (Kirim ke Farmasi)**; sistem validasi kelengkapan, **Generate Order ID**, kirim ke antrian, set ikon **Pending ⏰**, **Log Audit**.
10. Dokter terima **notifikasi Order Berhasil**; Farmasi terima order (Pending) → tampil di List Pending → apoteker menentukan **item spesifik & stok** lalu memproses.
11. Status resep dipantau real-time.

## 7. Main Flow / Mindmap

Alur utama (urut dari BPMN `g-service-order-resep.json`, disesuaikan revisi):

**Pra-isi otomatis (Sistem Neurovi):**
Load Riwayat Resep → Cek Sisa Obat Kronis → Display Info ke Dokter → (opsi Auto-Copy resep shortcut / Terapkan Resep Default).

**Skenario A — Entry Point (Gateway: Entry Point?)**
- A1: Assessment Poli → Buat Resep → E-Resep, atau
- A2: Dashboard Pasien → Pilih E-Resep.

**Skenario B — Obat Pulang (hanya RANAP)**
- Bila order resep pada layanan **Rawat Inap** dan dokter putuskan pasien perlu obat pulang → Buka Form E-Resep Obat Dibawa Pulang → review riwayat resep/alergi sidebar. (Pada RJ/IGD/IBS/VK/Rehab Medis, opsi obat pulang **tidak ditampilkan**.)

**Skenario C — Shortcut resep lama (Gateway #6: Ya)**
- Klik + pada Resep Lama → Resep Auto-Copy ke Staging Table.

**Skenario C2 — Resep default (template)**
- Pilih Resep Default → item template auto-copy ke Staging (editable). Dokter juga dapat "Simpan sebagai Resep Default" dari staging saat ini.

**Skenario D — Tambah item baru (Gateway: Pilih Jenis?)**
- **Non-Racik:** Pilih Nama Obat (formularium) → Isi Sediaan/Dosis/Jumlah → Aturan Pakai → Rute/Aturan Umum/Lainnya → Tambahkan (Staging).
- **Racik:** Isi Nama Racikan → Pilih Metode (DTD: chips dosis / Non-DTD: jumlah manual) → Pilih Obat Bahan → Isi Sediaan/Dosis (atau jumlah manual) → Tambahkan ke Obat Racik → Bahan masuk Tabel Racikan → (Ada Bahan Lain? ulang) → Isi Form Kanan (Jumlah/Aturan/Rute) → Tambahkan (1 Item Racik ke Staging).

**Validasi:**
- Sistem check duplikasi: obat sama 3x dosis sama? → bila ya: notif **Lanjutkan / Cancel**.
  - Cancel → Hapus dari staging & pilih obat lain.
  - Lanjutkan → Tandai Iter/PRB → Item masuk Staging Table.
- **Tidak ada cek/filter stok** pada alur ini (stok ditangani Farmasi).

**Finalisasi (Gateway: Ada Item Lain? → Data Benar?)**
- Review Daftar Obat → Data Benar?
  - Tidak → Edit/Hapus Item → kembali review.
  - Ya → (opsional Simpan sebagai Resep Default) → Klik Simpan (Kirim ke Farmasi).
- Sistem: Validasi Kelengkapan → Generate Order ID → Kirim ke Antrian Farmasi → Update Icon ⏰ Pending → Log Audit → **Ready**.
- Dokter: Terima Notifikasi Order Berhasil → Lihat Icon Status Pending.
- Farmasi: Terima Order (Pending) → Tampilkan di List Pending → tentukan item spesifik & stok → proses.

## 8. Business Rules

| ID | Aturan | Sumber BPMN |
|----|--------|-------------|
| BR-001 | Obat hanya bisa dipilih dari formularium/master farmasi RS (level terapi/zat & sediaan). | Pilih Nama Obat |
| BR-002 | **Order resep tidak melakukan cek stok.** Penentuan item spesifik obat & ketersediaan stok adalah wewenang Farmasi saat memproses order. | Revisi (To-Be) |
| BR-003 | Jika obat sama diresepkan **3x dengan dosis sama** untuk pasien ini → tampilkan notif duplikasi; dokter wajib pilih **Lanjutkan** atau **Cancel**. | Check riwayat 3x + Gateway "Pilihan?" |
| BR-004 | Jika dokter pilih **Cancel** pada notif duplikasi → item dihapus dari staging, pilih obat lain. | Gateway "Pilihan?" |
| BR-005 | Resep **tidak boleh dikirim** bila data tidak lengkap (Validasi Kelengkapan gagal). | Validasi Kelengkapan Data |
| BR-006 | Item racik metode **DTD** wajib pakai chips dosis; **Non-DTD** wajib input jumlah bahan manual. | Gateway "Pilih Metode?" |
| BR-007 | Jenis item wajib salah satu: **Non-Racik / Racik**. (Alkes tidak ditangani di modul ini.) | Gateway "Pilih Jenis?" |
| BR-008 | Riwayat resep, sisa obat kronis, dan riwayat alergi selalu ditampilkan otomatis di sidebar (Always Display). | Load Riwayat / Check Sisa Obat Kronis |
| BR-009 | Order ID di-generate sistem hanya setelah Simpan & validasi lolos; unik per order. | Generate Order ID |
| BR-010 | Setiap aktivitas peresepan dicatat di audit trail (siapa, kapan, aksi). | Log Audit |
| BR-011 | **Form E-Resep Obat Pulang hanya tersedia pada order resep Rawat Inap (ranap).** Pada layanan lain opsi ini tidak ditampilkan. | Revisi |
| BR-012 | Resep dapat ditandai **Iter** (berulang) atau **PRB**; aturan jumlah pengulangan Iter mengikuti kebijakan RS. [PERLU KONFIRMASI batas Iter] | Tandai Iter/PRB |
| BR-013 | Status awal order setelah kirim = **Pending** (ikon ⏰); update real-time mengikuti progres Farmasi. | Update Icon Pending |
| BR-014 | [ASUMSI] Validasi alergi: bila obat mengandung zat yang dialergikan pasien → tampilkan peringatan keras sebelum tambah ke staging. | Show Riwayat Alergi |
| BR-015 | Dokter dapat **menyimpan resep saat ini sebagai Resep Default** (template) dan **menerapkannya** untuk auto-isi staging. Resep default tersimpan per dokter (opsional per diagnosa); item tetap editable setelah diterapkan. | Revisi |
| BR-016 | [ASUMSI] Untuk pasien penjamin BPJS, obat di luar formularium ditandai non-tanggungan; penentuan tanggungan final mengikuti Farmasi/klaim. | jenis_penjamin |

## 9. User Stories

**Dokter (DPJP)**
- **US-001**: Sebagai Dokter, saya ingin membuka E-Resep dari Assessment Poli maupun Dashboard Pasien, agar bisa meresepkan dari titik kerja manapun. *(BPMN: Gateway Entry Point?)*
- **US-002**: Sebagai Dokter, saya ingin melihat riwayat resep, sisa obat kronis, dan riwayat alergi otomatis di sidebar, agar peresepan aman & berkesinambungan. *(BPMN: Load Riwayat Resep, Check Sisa Obat Kronis, Show Riwayat Alergi)*
- **US-003**: Sebagai Dokter, saya ingin memilih obat non-racik dari formularium dan mengisi sediaan/dosis/jumlah/aturan/rute, agar resep lengkap. *(BPMN: Pilih Nama Obat → Isi Sediaan, Dosis, Jumlah → Aturan/Rute)*
- **US-004**: Sebagai Dokter, saya ingin membuat obat racik (DTD pakai chips dosis / Non-DTD jumlah manual) dengan banyak bahan, agar racikan akurat. *(BPMN: Pilih Metode? → DTD/Non-DTD → Pilih Obat Bahan)*
- **US-006**: Sebagai Dokter, saya ingin memakai chips dosis cepat (1, 1/2, 1/3, ...), agar input dosis cepat. *(BPMN: Isi Dosis Quick Chips)*
- **US-007**: Sebagai Dokter, saya ingin copy resep lama via shortcut (+ pada resep lama), agar tidak input ulang. *(BPMN: Klik + Resep Lama → Auto-Copy ke Staging)*
- **US-008**: Sebagai Dokter, saya ingin diberi peringatan bila obat sama sudah 3x diresepkan dosis sama, agar bisa lanjut atau batalkan. *(BPMN: Check riwayat 3x → notif Lanjutkan/Cancel)*
- **US-010**: Sebagai Dokter, saya ingin review/edit/hapus item di staging sebelum kirim, agar resep benar sebelum dikirim. *(BPMN: Staging Table, Edit/Hapus Item, Data Benar?)*
- **US-011**: Sebagai Dokter, saya ingin menandai resep Iter/PRB, agar pengulangan & rujuk balik terkelola. *(BPMN: Tandai Iter/PRB)*
- **US-012**: Sebagai Dokter pada Rawat Inap, saya ingin membuat E-Resep obat dibawa pulang, agar terapi lanjut di rumah. Opsi ini hanya muncul pada order resep ranap. *(BPMN: Buka Form E-Resep Obat Pulang — khusus ranap)*
- **US-014**: Sebagai Dokter, saya ingin notifikasi Order Berhasil + status Pending, agar tahu resep terkirim. *(BPMN: Terima Notifikasi / Icon Status Pending)*
- **US-017**: Sebagai Dokter, saya ingin menyimpan resep yang saya buat sebagai **resep default** (template per diagnosa/rutin), agar tidak mengetik ulang pola terapi yang sering dipakai. *(Revisi: Simpan Resep Default)*
- **US-018**: Sebagai Dokter, saya ingin menerapkan **resep default** untuk auto-isi staging lalu menyesuaikan, agar peresepan lebih cepat. *(Revisi: Terapkan Resep Default)*

**Apoteker / Petugas Farmasi**
- **US-015**: Sebagai Petugas Farmasi, saya ingin menerima order resep elektronik dan melihatnya di List Pending, agar bisa menentukan item spesifik & stok lalu memproses. *(BPMN: Terima Order (Pending) → List Pending)*

**Manajemen / Audit**
- **US-016**: Sebagai Manajemen, saya ingin seluruh peresepan tercatat di audit trail, agar akuntabel & patuh regulasi. *(BPMN: Log Audit)*

*(Catatan: US-005 [Alkes], US-009 [estimasi harga], US-013 [filter stok] dihapus sesuai revisi — pemilihan item spesifik, harga, dan stok bukan scope dokter.)*

## 10. Functional Requirements

| ID | Requirement | Traceability BPMN |
|----|-------------|-------------------|
| FR-001 | Sistem menyediakan 2 entry point E-Resep (Assessment Poli, Dashboard Pasien) dari semua titik layanan (IGD/RJ/RI/IBS/VK/Rehabilitasi Medis). | Gateway Entry Point? |
| FR-002 | Sistem auto-load & tampilkan di sidebar: riwayat resep, sisa obat kronis, riwayat alergi pasien. | Load Riwayat Resep, Check Sisa Obat Kronis, Show Riwayat Alergi |
| FR-003 | Sistem menampilkan pencarian obat dari formularium (level terapi/zat & sediaan). **Tanpa cek/indikator stok** — item spesifik & stok ditentukan Farmasi. | Pilih Nama Obat (revisi: hapus cek stok) |
| FR-004 | Form item Non-Racik: pilih obat, sediaan, dosis, jumlah, aturan pakai, rute, aturan umum/lainnya → tambah ke staging. | Pilih Nama Obat → Isi Sediaan/Dosis/Jumlah → Aturan/Rute |
| FR-005 | Form item Racik: nama racikan, pilih metode DTD (chips dosis) / Non-DTD (jumlah manual), tambah multi-bahan, jumlah/aturan/rute racik → 1 item racik ke staging. | Pilih Metode?, Pilih Obat Bahan, Tabel Racikan, Isi Form Kanan |
| FR-007 | Quick chips dosis: 1, 1/2, 1/3, 1/4, 1/5, 1/8, 2/3, 3/4, plus input manual. | Isi Dosis Quick Chips |
| FR-008 | Shortcut copy resep lama: klik + pada resep lama → auto-copy seluruh item ke staging table (editable). | Klik + Resep Lama → Auto-Copy ke Staging |
| FR-011 | Staging table: tampil semua item, edit, hapus, review sebelum kirim (**tanpa kolom estimasi harga**). | Staging Table, Edit/Hapus Item, Review Daftar |
| FR-012 | Penandaan resep Iter & PRB. | Tandai Iter/PRB |
| FR-013 | Form E-Resep obat dibawa pulang **hanya aktif/ditampilkan pada order resep Rawat Inap (ranap)**. | Buka Form E-Resep Obat Pulang (revisi: khusus ranap) |
| FR-014 | Validasi kelengkapan data sebelum kirim; blokir kirim bila gagal. | Validasi Kelengkapan Data, Gateway Data Benar? |
| FR-015 | Generate Order ID unik & kirim order ke antrian Farmasi. | Generate Order ID, Kirim ke Antrian Farmasi |
| FR-016 | Set & tampilkan status order real-time (awal: Pending ⏰); notifikasi Order Berhasil ke dokter. | Update Icon Pending, Terima Notifikasi |
| FR-017 | List Pending order di sisi Farmasi (terima order). | Terima Order (Pending), Tampilkan di List Pending |
| FR-018 | Audit trail seluruh aksi peresepan (user, waktu, aksi, before/after). | Log Audit |
| FR-019 | Bridging ke Apotek Online (Sistem Neurovi). | Bridging dengan Apotek Online |
| FR-020 | [ASUMSI] Simpan draft resep lokal & retry kirim otomatis bila koneksi terputus (kondisi RS C&D). | — |
| FR-021 | **Simpan Resep Default**: dokter menyimpan kumpulan item resep saat ini sebagai template (nama template, opsional tautan diagnosa ICD-10), tersimpan per dokter. | Revisi |
| FR-022 | **Terapkan Resep Default**: dokter memilih template → seluruh item auto-copy ke staging (editable); dokter dapat kelola (ubah/hapus) daftar resep default miliknya. | Revisi |

*(FR-006 [Alkes], FR-010 [estimasi harga] dihapus sesuai revisi.)*

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Header E-Resep — konteks pasien (TAMPIL, read-only; sumber konteks PRD B1/B2)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| no_rm | lookup (master pasien) | text format RM RS | — | konteks kanonik B1/B2 |
| nama | autofill dari pendaftaran | text maks 100 char | — | kanonik |
| jenis_kelamin | autofill | L / P | — | kanonik |
| tgl_lahir | autofill | dd-mm-yyyy + umur | — | kanonik, untuk hitung dosis anak |
| jenis_penjamin | autofill | Umum/BPJS/Asuransi | — | kanonik; pengaruhi tanggungan (final di Farmasi) |
| no_sep | integrasi VClaim | text format SEP | — | kanonik; bila BPJS |
| unit | lookup master Unit (A3) | text | — | kanonik; titik layanan peresepan (penentu opsi obat pulang) |
| jenis_layanan | konteks order | RJ/RI/IGD/IBS/VK/Rehab Medis | — | **menentukan ketersediaan form obat pulang (hanya RI)** |
| diagnosa_awal | master ICD-10 | kode + nama ICD-10 | — | kanonik; dasar terapi & tautan resep default |

### 11.2 Sidebar Klinis (TAMPIL otomatis — FR-002)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Riwayat Alergi | data alergi pasien (EMR) | badge merah/list | — | tampil paling atas |
| Riwayat Resep | tabel resep historis | list (tgl, obat, dosis) | sort tgl desc | Always Display |
| Sisa Obat Kronis | hitung resep kronis aktif | list (obat, sisa hari) | — | untuk pasien kronis/PRB |

### 11.3 Form Item Non-Racik (INPUT — FR-004)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| obat_id | Nama Obat | lookup | Ya | dari formularium aktif (level terapi/zat & sediaan) | master farmasi | **tanpa indikator stok**; item spesifik oleh Farmasi |
| sediaan | Bentuk Sediaan | dropdown | Ya | enum (tablet/kapsul/sirup/injeksi/...) | master obat | auto dari obat |
| dosis | Dosis | text/number | Ya | > 0; chips/manual | manual/chips | quick chips FR-007 |
| frekuensi | Frekuensi | dropdown | Ya | enum (1x1, 2x1, 3x1, 1x sehari, prn,...) | manual | [PERLU KONFIRMASI master frekuensi] |
| rute | Rute Pemberian | dropdown | Ya | enum (oral/IV/IM/SC/topikal/...) | master | |
| jumlah | Jumlah | number | Ya | integer > 0 | manual | tanpa validasi ≤ stok |
| durasi | Durasi Terapi (hari) | number | Tidak | integer > 0 | manual | |
| aturan_pakai | Aturan Pakai | text | Ya | maks 255 char | manual | mis. sebelum makan |
| aturan_lainnya | Aturan Lainnya | text | Tidak | maks 255 char | manual | |
| catatan_khusus | Catatan Khusus | text | Tidak | maks 255 char | manual | |

### 11.4 Form Item Racik (INPUT — FR-005)

**Header racikan:**
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_racikan | Nama Racikan | text | Ya | maks 100 char | manual | mis. "Obat Racik 1" |
| metode_racik | Metode | dropdown | Ya | DTD / Non-DTD | manual | BR-006 |
| jumlah_racik | Jumlah (bungkus/kapsul) | number | Ya | integer > 0 | manual | form kanan |
| aturan_racik | Aturan Pakai | text | Ya | maks 255 char | manual | |
| rute_racik | Rute | dropdown | Ya | enum rute | master | |

**Bahan racik (multi-row → Tabel Racikan):**
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| bahan_obat_id | Obat/Bahan | lookup | Ya | dari formularium | master farmasi | tanpa cek stok |
| jenis_sediaan_bahan | Jenis Sediaan Bahan | dropdown | Ya | enum | master | |
| dosis_bahan | Dosis (DTD) | text/number | Kondisional | wajib bila DTD; chips/manual | chips | metode DTD |
| jumlah_bahan | Jumlah Bahan (Non-DTD) | number | Kondisional | wajib bila Non-DTD; > 0 | manual | metode Non-DTD |

### 11.5 Penandaan Resep & Obat Pulang (INPUT — FR-012/FR-013)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| flag_iter | Iter (Berulang) | boolean | Tidak | default false | manual | BR-012 |
| jumlah_iter | Jumlah Iter | number | Kondisional | wajib bila iter; integer > 0 | manual | [PERLU KONFIRMASI batas] |
| flag_prb | PRB | boolean | Tidak | default false | manual | rujuk balik |
| flag_obat_pulang | Obat Dibawa Pulang | boolean | Tidak | default false; **hanya muncul bila jenis_layanan = RI** | manual | FR-013/BR-011 |

### 11.6 Resep Default / Template (INPUT + kelola — FR-021/FR-022)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| template_id | ID Template | auto | Ya | unik | auto-generate | |
| nama_template | Nama Resep Default | text | Ya | maks 100 char, unik per dokter | manual | mis. "ISPA Dewasa" |
| dokter_id | Pemilik | lookup | Ya | session login | auto | per dokter |
| diagnosa_terkait | Diagnosa (opsional) | lookup ICD-10 | Tidak | kode ICD-10 valid | master ICD-10 | tautan ke diagnosa |
| items | Daftar Item | array | Ya | ≥ 1 item (non-racik/racik) | dari staging saat simpan | editable saat diterapkan |
| dibuat_pada | Dibuat | timestamp | Ya | auto | sistem | |

**Kelola Resep Default (TAMPIL — FR-022):**
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| nama_template | master template | text | sort A-Z / filter | |
| diagnosa_terkait | template | kode+nama ICD-10 | filter | |
| jumlah_item | count items | number | — | |
| aksi | — | tombol Terapkan / Edit / Hapus | — | FR-022 |

### 11.7 Staging Table (TAMPIL + edit — FR-011)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| jenis_item | item staging | badge (Non-Racik/Racik) | filter | |
| nama_item | item staging | text | — | obat/racikan |
| dosis_aturan | item staging | text ringkas | — | |
| jumlah | item staging | number | — | |
| status_validasi | hasil cek sistem | badge (ok / duplikasi / alergi) | filter | tanpa status stok |
| aksi | — | tombol Edit/Hapus | — | FR-011 |

*(Kolom estimasi_harga_item & estimasi_total dihapus — bukan scope dokter.)*

### 11.8 Notif Duplikasi (TAMPIL — FR-009/BR-003)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| pesan | check riwayat 3x | teks "Obat sudah 3x diresepkan dosis sama" | — | |
| aksi | — | tombol Lanjutkan / Cancel | — | BR-003/004 |

### 11.9 Order terkirim & List Pending Farmasi (TAMPIL — FR-016/FR-017)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| order_id | Generate Order ID | text unik | sort | FR-015 |
| no_rm / nama | header resep | text | filter | |
| unit_asal / jenis_layanan | header | text | filter | titik layanan |
| dokter | session login (nama) | text | filter | kanonik nama |
| waktu_order | timestamp kirim | dd-mm-yyyy HH:mm | sort desc | |
| status | status order | badge (⏰ Pending/Diproses/Selesai) | filter | FR-016 |
| jumlah_item | count item | number | — | |

### 11.10 Audit Trail (TAMPIL — FR-018)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| waktu | log | timestamp | sort desc | |
| user | session (nama, role) | text | filter | |
| aksi | log | enum (buat/edit/hapus/kirim/simpan template) | filter | |
| order_id | log | text | filter | |
| detail | log | before/after | — | BR-010 |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-001 | Performa | Pencarian obat & load sidebar riwayat tampil < 2 detik untuk data normal. [ASUMSI] |
| NFR-002 | Performa | Kirim resep → Order ID ter-generate < 3 detik. [ASUMSI] |
| NFR-003 | Keandalan/Offline | Tahan koneksi tidak stabil (RS C&D): draft tersimpan lokal + retry kirim otomatis (FR-020). [ASUMSI] |
| NFR-004 | Keamanan | Akses berbasis peran: hanya dokter berwenang bisa membuat/kirim resep & kelola resep default miliknya; apoteker akses list order. |
| NFR-005 | Keamanan/Audit | Audit trail immutable, simpan ≥ sesuai retensi RME. [PERLU KONFIRMASI masa simpan] |
| NFR-006 | Keselamatan | Peringatan alergi/duplikasi harus jelas (warna + wajib aksi), tidak bisa terlewat diam-diam. |
| NFR-007 | Usability | Input cepat: quick chips dosis, resep default, copy resep lama; minimal klik. |
| NFR-008 | Interoperabilitas | Data obat & resep mengikuti format SATUSEHAT (MedicationRequest) untuk pengiriman. [PERLU KONFIRMASI cakupan SATUSEHAT MVP] |
| NFR-009 | Kompatibilitas | Jalan di browser standar + perangkat layar kecil (workstation poli/IGD sederhana). |
| NFR-010 | Integritas Data | Order ID unik; tidak ada double-submit (idempotent saat retry). |
| NFR-011 | Skalabilitas | Mendukung volume resep harian RS Tipe C&D (estimasi puluhan–ratusan/hari). [ASUMSI] |

## 13. Integrasi Eksternal

| Sistem | Arah | Fungsi | Catatan |
|--------|------|--------|---------|
| **Modul Farmasi (internal SIMRS)** | kirim order / terima status | Order resep masuk antrian Farmasi (Pending); Farmasi **menentukan item spesifik & stok**, status balik real-time | Inti alur; verifikasi/dispensing/penentuan item & harga di modul Farmasi (out scope) |
| **EMR / Assessment (B1/B2, diagnosa)** | baca | Konteks pasien, diagnosa, alergi, riwayat resep | Entry point Assessment Poli |
| **Master Farmasi / Formularium** | baca | Daftar obat & sediaan (level terapi/zat) | BR-001, FR-003 — **stok & harga tidak dikonsumsi di modul ini** |
| **BPJS (VClaim/SEP)** | baca | no_sep, jenis_penjamin → konteks tanggungan (final di Farmasi/klaim) | Kanonik B1/B2 |
| **SATUSEHAT** | kirim | Kirim data resep (MedicationRequest) untuk interoperabilitas | [PERLU KONFIRMASI cakupan & resource SATUSEHAT MVP] |
| **Apotek Online (Bridging Sistem Neurovi)** | dua arah | Bridging order ke apotek online | BPMN: Bridging dengan Apotek Online; [PERLU KONFIRMASI detail API] |
| **Disdukcapil (NIK)** | baca | Hanya via data pasien (tidak langsung di modul resep) | Kanonik dari B1/B2 |

Catatan interoperabilitas: gunakan kode obat standar (KFA/SATUSEHAT) bila tersedia di master; petakan obat lokal → kode KFA. [PERLU KONFIRMASI ketersediaan mapping KFA di RS]. **Penentuan harga & stok dihapus dari scope modul ini** (domain Farmasi/Kasir).

## Asumsi
- Kondisi As-Is (resep manual kertas, tanpa validasi otomatis) berdasarkan pola umum RS Tipe C&D.
- Order resep tidak memerlukan stok: penentuan item spesifik obat & ketersediaan stok adalah wewenang Farmasi (BR-002).
- Estimasi/perhitungan harga dihapus dari modul ini; harga ditentukan Farmasi/Kasir.
- Form E-Resep Obat Pulang hanya muncul pada order resep Rawat Inap (ranap); pada RJ/IGD/IBS/VK/Rehab Medis tidak ditampilkan (BR-011).
- Resep default disimpan per dokter, opsional ditautkan diagnosa ICD-10; item tetap editable saat diterapkan (BR-015).
- Alkes tidak ditangani di modul order resep ini (lihat E1 Tindakan & BHP).
- Titik layanan modul: IGD, Rawat Jalan, Rawat Inap, IBS, VK, Rehabilitasi Medis (MCU dihapus dari scope).
- Perlu mode draft lokal + retry kirim karena internet RS C&D sering tidak stabil (FR-020/NFR-003).
- Validasi alergi keras (peringatan wajib) diasumsikan ada meski BPMN hanya 'Show Riwayat Alergi' (BR-014).
- Target metrik (waktu < 2 menit, adopsi 90%, kepatuhan formularium 95%) adalah asumsi awal, perlu disepakati manajemen.
- Field pasien (no_rm, nama, jenis_kelamin, tgl_lahir, jenis_penjamin, no_sep, unit, jenis_layanan, diagnosa_awal) mengikuti definisi kanonik dari PRD B1/B2 — read-only di modul ini.
- Quick chips dosis (1, 1/2, 1/3, 1/4, 1/5, 1/8, 2/3, 3/4) sesuai BPMN dipakai untuk dosis racik DTD & obat non-racik.

## Pertanyaan Terbuka
- Batas maksimal pengulangan Iter & masa berlaku resep Iter mengikuti kebijakan RS mana? (BR-012)
- Cakupan SATUSEHAT untuk MVP: apakah kirim MedicationRequest wajib di fase 1? (NFR-008)
- Apakah master frekuensi pemberian sudah ada / perlu dibuat? (FR-004 field frekuensi)
- Detail API & skenario bridging Apotek Online (Sistem Neurovi) — sinkron/async, data apa? (FR-019)
- Resep default: disimpan per dokter saja atau bisa dibagikan antar dokter/per unit? Maks jumlah template? (FR-021/FR-022)
- Apakah resep default boleh ditautkan otomatis & disarankan berdasarkan diagnosa ICD-10 saat assessment? (FR-021)
- Konfirmasi: order resep benar-benar tanpa cek stok sama sekali, atau perlu peringatan informatif (non-blocking) bila Farmasi tahu kosong? (BR-002)
- Karena item spesifik & harga ditentukan Farmasi, apakah dokter perlu melihat feedback substitusi/harga setelah Farmasi memproses? (alur balik)
- Aturan tanggungan obat BPJS di luar formularium — ditangani di Farmasi/klaim; apakah perlu flag awal di order? (BR-016)
- Apakah modul ini perlu cek interaksi obat-obat selain duplikasi 3x? Draft menyebut interaksi obat tapi BPMN hanya duplikasi.
- Masa retensi audit trail & data resep sesuai regulasi RME? (NFR-005)
- Apakah ada role selain dokter yang boleh input resep (mis. dokter koas dengan approval)? (NFR-004)
- Ketersediaan mapping kode obat KFA/SATUSEHAT di master farmasi RS?