# PRD — Master Data / Integrasi SATUSEHAT BPJS V2 — Item Pemeriksaan Laboratorium

**Related Document:** Template Export/Import Data Pemeriksaan Lab; LOINC Laboratory - SATUSEHAT (kode terverifikasi); LOINC Answer List - SATUSEHAT (terverifikasi); Observation.valueQuantity (UCUM via Master Satuan & Kemasan A22); PRD Master Data Laboratorium v2.2 (Tamtech); PRD A3 Unit, A22 Satuan & Kemasan, A11 Diagnosa, A13 Procedure, A55 Jabatan; PRD Modul Pelayanan Penunjang (Lab/Radiologi)
**Versi:** 1.4 - Refinement: kedua open question pada v1.3 DITUTUP sebagai OUT OF SCOPE A14 (bukan lingkup modul ini): (1) bentuk teknis kontrak read-only A14→Pelayanan Penunjang = keputusan arsitektur, bukan requirement A14; (2) perlakuan pengiriman saat header punya LOINC tetapi sebagian komponen tidak (atau sebaliknya) = logika modul Pelayanan Penunjang. Keduanya dipindah ke Out Scope (#14, #15); daftar open_questions dikosongkan. (lanjutan v1.3)

## 1. Overview / Brief Summary

**Modul:** Control Panel > Master Data / Integrasi SATUSEHAT BPJS V2 > Item Pemeriksaan Laboratorium (**Code A14**, Cluster **Control Panel**).

Master Data Item Pemeriksaan Laboratorium adalah modul pengelolaan data pemeriksaan laboratorium yang menjadi **sumber kebenaran tunggal (single source of truth)** atas seluruh layanan pemeriksaan laboratorium di rumah sakit. Modul ini menyimpan dan mengelola: kode LIS, kode terminologi **SATUSEHAT (LOINC & LOINC Answer List)**, nama & kategori pemeriksaan, jenis spesimen, item/komponen pemeriksaan, **satuan (UCUM — bersumber dari Master Data Satuan & Kemasan A22)**, rentang nilai normal, **ambang Nilai Kritis (Critical Value)** per item numerik, dan **Kategori Hasil Pemeriksaan** (Numerik / Diskret / Narasi).

Master data ini menjadi fondasi bagi modul Administrasi, Rekam Medis (EMR), Billing, Order Penunjang, modul **Hasil Laboratorium**, dan modul **Pelayanan Penunjang**, sehingga setiap perubahan cukup dikelola di satu tempat dan langsung berlaku di seluruh modul terkait.

**Batasan integrasi (hasil refinement v1.2–v1.4):**
- Integrasi eksternal modul ini secara konseptual **hanya ke SATUSEHAT** (resource Observation). Pemetaan klaim **KPTL/BPJS tidak termasuk** dalam modul ini (lihat Out Scope).
- Master data **menyimpan & menyediakan** pemetaan terminologi (LOINC & Answer List) sebagai **kesiapan integrasi**, namun pemetaan ini bersifat **OPSIONAL** — tidak diwajibkan di tingkat master.
- **Keputusan pengiriman ke SATUSEHAT dan pemaksaan kelengkapan LOINC sebelum kirim BUKAN tanggung jawab modul ini** — ditangani di **modul Pelayanan Penunjang (Lab/Radiologi)** saat data hasil benar-benar akan dikirim.
- **(v1.3) Tidak ada indikator/API 'kesiapan LOINC' terpisah dari A14.** **Kehadiran kode LOINC** pada pemeriksaan/komponen ITULAH sinyal kesiapan: bila kode LOINC terisi, modul Pelayanan **otomatis mengirim** Observation ke SATUSEHAT saat pemeriksaan dilakukan; bila kosong, tidak dikirim (lihat BR-007, BR-015, FR-017).
- **(v1.4)** Dua aspek teknis lanjutan **dikeluarkan dari lingkup A14**: (a) bentuk teknis kontrak akses read-only A14→Pelayanan Penunjang (keputusan arsitektur), dan (b) perlakuan pengiriman parsial saat header punya LOINC tetapi sebagian komponen tidak (logika modul Pelayanan Penunjang). Lihat Out Scope #14, #15.

**Dua kemampuan utama versi ini:**
1. **Konfigurasi Nilai Kritis (Critical Value)** — **hanya satu pasang ambang**: batas **bawah** & batas **atas** per item pemeriksaan numerik; dikonsumsi modul Hasil Laboratorium untuk flagging hasil dan notifikasi real-time ke dokter.
2. **Kategori Hasil Pemeriksaan** — pengelompokan tipe hasil menjadi **Numerik, Diskret, dan Narasi**, termasuk konfigurasi pilihan hasil terbatas (Answer List) untuk pemeriksaan diskret guna menentukan tipe validasi input yang tepat di modul Hasil Laboratorium.

**Konteks RS Tipe C & D [ASUMSI]:** layanan lab terbatas (hematologi, kimia klinik, urinalisis, imunoserologi dasar), SDM IT terbatas. Modul wajib menyediakan import/export massal agar setup awal tidak bergantung pada input manual satu per satu. Dataset terminologi SATUSEHAT (LOINC/Answer List) disiapkan via **seed manual** (lihat NFR-006).

## 2. Background

### Konteks Integrasi SATUSEHAT & Terminologi
Ekosistem digital kesehatan Indonesia mewajibkan integrasi data ke platform **SATUSEHAT**. Pengiriman data hasil laboratorium (resource **Observation**) wajib menggunakan standar terminologi internasional **LOINC** (Logical Observation Identifiers Names and Codes) dan **LOINC Answer List** untuk hasil diskret. Saat ini master data lab belum punya mekanisme konsisten untuk menampung & memetakan kode **LOINC dan Answer List** secara terstruktur → diperlukan enhancement agar **kesiapan teknis** integrasi terjamin di tingkat master.

> **Ketentuan penting (v1.2–v1.4):**
> - Pemetaan kode LOINC & Answer List **wajib bersumber dari daftar yang telah diverifikasi tim SATUSEHAT**, bukan dari browser LOINC publik (BR-002).
> - Di master data, pemetaan terminologi bersifat **OPSIONAL** (disimpan sebagai kesiapan). **Keputusan apakah suatu pemeriksaan dikirim ke SATUSEHAT** beserta **validasi/pemaksaan kelengkapan LOINC sebelum kirim ditangani di modul Pelayanan Penunjang (Lab/Radiologi)** — di luar lingkup A14.
> - **(v1.3) Sinyal kesiapan = kehadiran kode LOINC.** A14 **tidak** memublikasikan status/indikator/API kesiapan tersendiri. Modul Pelayanan cukup membaca kode LOINC yang tersimpan: **bila ada → Observation otomatis terkirim saat pemeriksaan; bila kosong → tidak dikirim** (BR-015, FR-017).
> - **(v1.4) Mekanisme akses teknis** (tabel/view/service) yang dipakai modul Pelayanan untuk membaca kode LOINC, serta **perlakuan pengiriman parsial** (header ber-LOINC namun sebagian komponen tidak), **bukan lingkup A14** — masing-masing keputusan arsitektur & logika modul Pelayanan Penunjang (Out Scope #14, #15).
> - **Satuan mengacu UCUM** dan **bersumber dari Master Data Satuan & Kemasan (A22)** — kode UCUM dikelola di master A22, modul ini hanya me-*lookup*-nya.
> - **Pemetaan klaim (KPTL/BPJS/INA-CBG) di luar lingkup** modul A14.

### Gap 1: Ketiadaan Ambang Nilai Kritis
Pengelolaan data pemeriksaan belum menyediakan acuan ambang **Nilai Kritis** yang baku. Ketika hasil pemeriksaan pasien mengancam jiwa (mis. **HGB < 7.0**, **Kalium > 6.5**, **Gula Darah > 400**), tidak ada mekanisme otomatis yang menandai hasil dan memberitahu dokter cepat → **delay penanganan** & risiko klinis tinggi. Modul ini memusatkan konfigurasi Nilai Kritis sebagai acuan tunggal, **dengan satu pasang ambang (batas bawah & batas atas saja)**, terintegrasi ke modul Hasil Laboratorium untuk flagging & notifikasi real-time.

### Gap 2: Variasi Kategori Hasil Belum Terakomodasi
Struktur data hasil saat ini mengasumsikan **semua hasil numerik dengan range normal**. Praktik klinis memiliki hasil non-numerik:
- **Diskret Binary:** Darah Samar (Positif/Negatif), Tes Kehamilan (Positif/Negatif)
- **Diskret Multi-option:** Kultur (Tumbuh/Tidak Tumbuh/Kontaminasi), Golongan Darah (O/A/B/AB), Hapusan Gram (Kokus/Basil/Spirilum)
- **Narasi:** Hapusan Darah Tepi, Pewarnaan (deskripsi morfologi)

Dampak ketiadaan kategori: input manual/tidak terstruktur, modul Hasil Lab tak bisa menentukan tipe validasi (dropdown vs numerik vs text area), tidak ada mapping pilihan hasil lokal ke **LOINC Answer List**, dan risiko salah input meningkat.

### Catatan lain (v1.2–v1.4)
- **Validasi duplikasi** dievaluasi berdasarkan **kode LIS**.
- **Rentang nilai normal** dikonfigurasi **cukup 1 (satu) baris per komponen** dengan atribut **jenis kelamin: Laki-laki / Perempuan / Semua** (tanpa struktur multi-baris dan tanpa granularitas kelompok usia di versi ini).
- **Komponen numerik BOLEH tanpa rentang normal sama sekali** (mis. pemeriksaan kuantitatif tanpa rujukan baku). **Nilai rentang/kritis BOLEH bernilai negatif** (mis. Base Excess). **(v1.3)** Sistem **menegakkan validasi** `nilai_normal_min <= nilai_normal_max` dan `critical_low < critical_high` sebagai **perbandingan numerik biasa yang berlaku penuh pada nilai negatif** (mis. `-5 <= -2` valid; `-2 <= -5` ditolak) — lihat BR-004, BR-014.
- **Status nonaktif** = acuan modul lain: pemeriksaan nonaktif disembunyikan dari dashboard & tidak muncul pada order penunjang, **namun tetap tersimpan pada history pemeriksaan**.
- **Kategori pemeriksaan & jenis spesimen** = **input manual** (tanpa master data tersendiri di versi ini).

## 3. In Scope

### Scope Definition
**Phase 1 (MVP):**
- Dashboard master data laboratorium (pencarian, sorting, filter kategori, informasi *last updated*).
- Formulir penambahan/pembaruan data pemeriksaan beserta **item/komponen pemeriksaan**.
- Integrasi pemetaan kode **LOINC & LOINC Answer List** (bersumber daftar terverifikasi SATUSEHAT) — **bersifat OPSIONAL** sebagai kesiapan integrasi; tidak diwajibkan di tingkat master.
- **Lookup satuan (UCUM) dari Master Data Satuan & Kemasan (A22)**.
- Konfigurasi **Kategori Hasil Pemeriksaan** (Numerik / Diskret / Narasi) + pilihan hasil (Answer List) untuk diskret.
- Pengaturan **Nilai Kritis (Critical Value)** — **batas bawah & batas atas saja** — per item pemeriksaan numerik (boleh bernilai negatif, dengan validasi `bawah<atas`).
- Pengaturan **rentang normal cukup 1 baris per komponen** dengan jenis kelamin (Laki-laki / Perempuan / Semua); **boleh dikosongkan**; bila diisi divalidasi `min<=max` (berlaku pada nilai negatif).
- Halaman daftar pemeriksaan laboratorium **nonaktif**.
- **Impor & ekspor** data pemeriksaan (.xlsx/.csv) — kolom terminologi **cukup kode LOINC** (header & komponen).
- **Seed manual** dataset terminologi SATUSEHAT (LOINC/Answer List).
- Log aktivitas perubahan data (audit trail).

**Phase 2 [**]:**
- Integrasi notifikasi Nilai Kritis ke modul Hasil Laboratorium (flagging hasil & alert ke dokter).
- Pencatatan log pelaporan nilai kritis / read-back untuk kebutuhan akreditasi.

### Out Scope
| No | Scope yang TIDAK dikerjakan |
|----|------------------------------|
| 1 | Order pemeriksaan penunjang laboratorium (modul Order Penunjang). |
| 2 | Input & verifikasi **hasil** pemeriksaan laboratorium (modul Hasil Laboratorium). |
| 3 | Logika klinis tatalaksana/penanganan pasien atas hasil nilai kritis. |
| 4 | Pengelolaan alat/analyzer LIS & koneksi interface alat (di luar penyimpanan kode LIS). |
| 5 | Penetapan tarif pemeriksaan lab (mengacu master Tarif/Tindakan A10) — modul ini hanya mereferensikan. [ASUMSI] |
| 6 | **Pemetaan kode klaim KPTL / bridging BPJS / INA-CBG** — integrasi modul ini hanya ke SATUSEHAT. (Diasumsikan ditangani modul Klaim/Tindakan A10 bila dibutuhkan.) |
| 7 | **Master Data Satuan & Kemasan + pengelolaan kode UCUM** — dikelola di modul **A22**; modul A14 hanya me-*lookup*. |
| 8 | **Master Kategori Pemeriksaan & Jenis Spesimen** — di versi ini **input manual**, bukan master data tersendiri. |
| 9 | **Nilai Kritis multi-tingkat** (panic high/low, abnormal bertingkat) — versi ini **hanya satu pasang batas bawah & atas**. |
| 10 | **Sinkronisasi otomatis/berkala dataset terminologi** — versi ini **seed manual**. |
| 11 | **Penandaan/keputusan pengiriman ke SATUSEHAT & pemaksaan kelengkapan LOINC sebelum kirim** — **DIPINDAH ke modul Pelayanan Penunjang (Lab/Radiologi)**. Master A14 hanya menyimpan kode LOINC sebagai kesiapan (opsional). **(v1.3)** A14 **TIDAK** membuat flag/indikator/API kesiapan terpisah — modul Pelayanan menilai kesiapan langsung dari **ada/tidaknya kode LOINC** (BR-015). |
| 12 | **Multi-baris rujukan normal / struktur rujukan per kombinasi gender+usia** — versi ini **cukup 1 baris per komponen**. |
| 13 | **(v1.3) Kolom non-terminologi tambahan & mapping Answer List di file Import/Export** — template pemetaan terminologi **cukup kode LOINC** (header & komponen); mapping Answer List dilakukan via form, bukan kolom template (Refinement user instr.3). |
| 14 | **(v1.4) Penetapan bentuk teknis kontrak akses read-only A14 → modul Pelayanan Penunjang** (tabel master langsung / view / internal service untuk membaca kode LOINC) — **keputusan arsitektur**, bukan requirement A14. A14 cukup menyimpan & menyediakan kode LOINC/Answer List sebagai data referensi (FR-017, NFR-011). |
| 15 | **(v1.4) Perlakuan pengiriman parsial Observation** saat header pemeriksaan punya LOINC tetapi sebagian komponen tidak (atau sebaliknya) — **logika modul Pelayanan Penunjang** saat membentuk & mengirim Observation; di luar lingkup A14. A14 hanya menyimpan kode LOINC per header & per komponen apa adanya (BR-015, BR-017). |

## 4. Goals and Metrics

### Goals
1. Menyediakan modul layanan laboratorium yang lengkap & terstruktur sebagai acuan modul terkait (single source of truth).
2. Menyediakan **kesiapan** pemetaan kode **LOINC & Answer List** (opsional) untuk integrasi SATUSEHAT (Observation), sehingga modul Pelayanan tinggal membaca kode LOINC untuk **otomatis mengirim** saat pemeriksaan dilakukan.
3. Menyediakan pengaturan **Nilai Kritis (batas bawah & atas)** per pemeriksaan untuk keselamatan pasien (notifikasi dini ke dokter).
4. Menyediakan **Kategori Hasil** agar modul Hasil Lab dapat memilih tipe validasi input yang tepat.
5. Menyediakan **rentang normal per jenis kelamin** (L/P/Semua, 1 baris/komponen) sebagai acuan flag abnormal.
6. Menyediakan log aktivitas perubahan guna memastikan keakuratan data.

### Metrics
| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Kelengkapan & pengelolaan data | Data pemeriksaan dapat ditambah, diubah, dinonaktifkan; >95% user lab menyatakan proses mudah & cepat. |
| 2 | Kecepatan pencarian | Waktu pencarian/filter pemeriksaan < **3 detik**. |
| 3 | Validitas pemetaan LOINC | **100%** pemeriksaan yang **dipetakan** LOINC menggunakan kode dari daftar **terverifikasi SATUSEHAT** (bukan kode bebas). |
| 4 | Single source of truth | Tidak ada perbedaan data layanan pemeriksaan antar modul SIMRS. |
| 5 | Notifikasi nilai kritis | **100%** hasil numerik yang melewati ambang kritis (item terkonfigurasi) ter-flag & memicu notifikasi ke dokter. [Phase 2] |
| 6 | Konsistensi kategori hasil | **100%** item diskret memiliki Answer List terdefinisi; modul Hasil Lab menampilkan input sesuai kategori. |
| 7 | Konsistensi satuan | **100%** komponen numerik (yang menggunakan satuan) memakai satuan yang valid di Master A22 (UCUM). |
| 8 | Integritas rentang/kritis (v1.3) | **0** data tersimpan yang melanggar `nilai_normal_min<=max` / `critical_low<high` (termasuk pada nilai negatif). |

## 5. Related Feature

| No | Code | Module / Menu | Relasi |
|----|------|---------------|--------|
| 1 | A3 | Master Data > Unit | Field `unit` (unit pelaksana = Laboratorium) di-lookup dari master Unit. |
| 2 | A22 | Master Data / SATUSEHAT Terminology V2 > Satuan & Kemasan | **Sumber satuan (UCUM)** untuk komponen pemeriksaan. **Kode UCUM dikelola di A22**; A14 hanya me-*lookup*. (Confirmed) |
| 3 | A10 | Master Data / Integrasi BPJS V2 > Tindakan | Referensi tarif/tindakan lab untuk billing. **Pemetaan klaim KPTL bukan tanggung jawab A14** (out scope). |
| 4 | A11 / A13 | Master Data > Diagnosa / Procedure | Pola integrasi SATUSEHAT yang sama (mapping kode terminologi). |
| 5 | A32 | Master Data / SATUSEHAT V2 > Wilayah | Pola modul integrasi SATUSEHAT (referensi konsistensi). |
| 6 | A55 | Master Data > Jabatan | Otorisasi role pengelola master lab. |
| 7 | — | **Modul Pelayanan Penunjang (Lab/Radiologi)** | **Pemilik keputusan & validasi pengiriman SATUSEHAT.** Menilai kesiapan **langsung dari ada/tidaknya kode LOINC** di A14; bila LOINC terisi → **Observation otomatis terkirim** saat pemeriksaan. **Tidak menarik indikator kesiapan terpisah** (v1.3, BR-015). **(v1.4)** Bentuk teknis kontrak akses & perlakuan pengiriman parsial = milik modul ini, bukan A14 (Out Scope #14/#15). |
| 8 | — | Integrasi SATUSEHAT > Observation (LOINC, Answer List) | Konsumen kode terminologi (mapping disiapkan opsional di master). |
| 9 | — | Hasil Laboratorium | Konsumen Nilai Kritis (flagging & notifikasi) + Kategori Hasil (tipe input). |
| 10 | — | Administrasi, Rekam Medis, Billing | Sinkronisasi data pemeriksaan lab. |

**Konsistensi lintas-PRD:** field `unit`, `status_aktif`, `file_import`, `mode_import`, `keterangan` mengikuti definisi kanonik bersama; `satuan` mengacu definisi di **A22** (Satuan & Kemasan).

## 6. Business Process (As-Is / To-Be)

> Modul ini **belum punya BPMN sendiri**; alur diturunkan dari pola master data (analogi: g-admisi-onsite-registration untuk *duplicate detection* & integrasi, g-backoffice-inventory-penerimaan untuk pola form simpan/validasi). Bagian turunan ditandai **[ASUMSI]**.

### A. As-Is (kondisi saat ini)
1. Data pemeriksaan lab dicatat tidak terpusat (spreadsheet/konfigurasi per modul) → rawan beda antar modul. [ASUMSI]
2. Kode LOINC/Answer List belum dipetakan terstruktur; bila dibutuhkan SATUSEHAT, petugas mencari manual di browser LOINC publik (berisiko salah, tak terverifikasi).
3. Tidak ada ambang Nilai Kritis baku → hasil mengancam jiwa tidak otomatis ditandai; notifikasi dokter mengandalkan kesadaran petugas.
4. Semua hasil diasumsikan numerik → hasil diskret/narasi diinput bebas, tidak terstruktur, rawan salah.
5. Satuan diketik bebas per modul → tidak konsisten dengan UCUM.

### B. To-Be (kondisi diharapkan)
1. Petugas Lab/Admin Master membuka **Dashboard Master Data Lab** → mencari/filter pemeriksaan.
2. **Tambah/Edit pemeriksaan**: isi kode LIS, nama, kategori pemeriksaan (manual), spesimen (manual) → sistem **cek duplikasi by kode LIS** (gateway: *Kode LIS sudah ada?* → Ya: tolak; Tidak: lanjut) [analogi duplicate detection].
3. **Pemetaan LOINC (opsional/kesiapan):** petugas boleh memetakan kode **LOINC** (header & komponen) dari daftar terverifikasi SATUSEHAT. **Tidak ada gateway wajib di sini** — keputusan & validasi pengiriman dilakukan **di modul Pelayanan Penunjang** saat data akan dikirim.
4. **Tentukan Kategori Hasil** per item (gateway: *Numerik / Diskret / Narasi?*):
   - Numerik → pilih **satuan (UCUM) dari Master A22** (bila ada), isi rentang normal **1 baris** dengan jenis kelamin (L/P/Semua) **atau dikosongkan**, opsi **Nilai Kritis (batas bawah & atas, boleh negatif)**. Sistem menegakkan `min<=max` & `bawah<atas` (berlaku pada nilai negatif).
   - Diskret → definisikan **pilihan hasil (Answer List)** + mapping ke LOINC Answer List (opsional/kesiapan).
   - Narasi → set tipe input text area (tanpa Answer List/range).
5. **Simpan** → data jadi acuan tunggal seluruh modul terkait; perubahan dicatat di **log aktivitas**.
6. **Nonaktifkan** pemeriksaan → hilang dari dashboard & order penunjang, tetap tersimpan di history.
7. **Import/Export massal** (.xlsx/.csv) untuk setup awal & pembaruan bulk — kolom terminologi **cukup kode LOINC**.
8. **[Modul Pelayanan]** Saat pemeriksaan dilakukan & hasil siap dikirim ke SATUSEHAT, modul Pelayanan **memeriksa ada/tidaknya kode LOINC** pada pemeriksaan/komponen (dari A14): **bila ada → Observation OTOMATIS terkirim**; **bila kosong → tidak dikirim**. Tidak ada flag/indikator kesiapan terpisah dari A14 (v1.3). **(v1.4)** Cara modul Pelayanan mengakses kode tersebut serta perlakuan bila LOINC hanya sebagian terisi (header vs komponen) = ranah modul Pelayanan, bukan A14 (Out Scope #14/#15).
9. **[Phase 2]** Modul Hasil Lab membaca konfigurasi Nilai Kritis → hasil pasien melewati ambang → flag kritis + notifikasi real-time ke dokter + log read-back.

## 7. Main Flow / Mindmap

**Aktor:** Petugas Laboratorium / Admin Master Data (pengelola), Sistem (validasi & lookup terminologi), Modul Pelayanan Penunjang (pemilik keputusan kirim SATUSEHAT), Modul Hasil Laboratorium (konsumen, Phase 2).

### Skenario 1 — Tambah Pemeriksaan Baru (numerik)
1. Buka Control Panel > Master Data > Item Pemeriksaan Laboratorium.
2. Klik **Tambah Pemeriksaan**.
3. Isi data umum: kode LIS, nama pemeriksaan, kategori (manual), jenis spesimen (manual), unit pelaksana.
4. Sistem **cek duplikasi by kode LIS** → bila duplikat, tampilkan peringatan & blok simpan.
5. **(Opsional)** Pilih kode **LOINC** (header pemeriksaan) dari daftar terverifikasi sebagai kesiapan integrasi. Tidak diwajibkan — keputusan kirim ada di modul Pelayanan, yang menilai kesiapan dari ada/tidaknya kode LOINC ini.
6. Tambah **item/komponen pemeriksaan** (mis. Hematologi → HGB, WBC, PLT). Per komponen: pilih **Kategori Hasil = Numerik** → pilih **satuan (UCUM) dari Master A22** (bila ada), isi **1 baris** nilai rujukan dengan jenis kelamin (L/P/Semua) **atau biarkan kosong**, LOINC komponen (opsional).
7. Aktifkan **Nilai Kritis** (opsional) → isi **batas bawah & batas atas** kritis (boleh bernilai negatif). Sistem memvalidasi `critical_low < critical_high` (perbandingan numerik biasa, berlaku pada nilai negatif).
8. Klik **Simpan** → bila lolos validasi rentang/kritis, data tersimpan, log aktivitas tercatat, langsung berlaku di modul terkait.

### Skenario 2 — Komponen Diskret (Answer List)
1. Pada komponen, set **Kategori Hasil = Diskret**.
2. Definisikan **pilihan hasil** (mis. Positif / Negatif).
3. **(Opsional)** Petakan tiap pilihan ke **LOINC Answer List** terverifikasi (mis. LA6576-8 Positive) sebagai kesiapan.
4. Simpan → modul Hasil Lab menampilkan dropdown sesuai pilihan.

### Skenario 3 — Komponen Narasi
1. Set **Kategori Hasil = Narasi** → tidak ada range/Answer List/Nilai Kritis/satuan.
2. Sistem menandai tipe input = text area di modul Hasil Lab.

### Skenario 4 — Nonaktifkan / Aktifkan
1. Pilih pemeriksaan → toggle **status_aktif** = nonaktif → konfirmasi.
2. Pemeriksaan disembunyikan dari dashboard & order penunjang; tetap di history.

### Skenario 5 — Import/Export
1. **Export**: unduh data pemeriksaan (.xlsx/.csv) sesuai template; kolom terminologi **cukup kode LOINC** (header & komponen).
2. **Import**: unggah file → pilih **mode** (tambah / tambah+update) → sistem validasi (kode LIS unik, **kode LOINC valid bila diisi**, satuan valid di A22 bila diisi, `min<=max` & `bawah<atas` bila diisi) → tampilkan ringkasan sukses/gagal per baris → konfirmasi → simpan.

### Skenario 6 — Seed Manual Terminologi
1. Admin menyiapkan dataset **LOINC/Answer List terverifikasi SATUSEHAT** secara **manual (seed)**.
2. Dataset menjadi sumber lookup pemetaan; pembaruan dilakukan manual oleh admin (tanpa sinkronisasi otomatis).

### Skenario 7 — Konsumsi Kesiapan oleh Modul Pelayanan (v1.3–v1.4)
1. Saat pemeriksaan pasien dilakukan, modul Pelayanan Penunjang membaca kode **LOINC** pemeriksaan/komponen dari A14.
2. **Bila kode LOINC ada** → Observation **otomatis dibentuk & dikirim** ke SATUSEHAT (validasi kelengkapan final dilakukan di Pelayanan).
3. **Bila kode LOINC kosong** → tidak ada pengiriman. **A14 tidak menyediakan indikator/flag kesiapan tersendiri.**
4. **(v1.4)** Mekanisme teknis akses data & perlakuan bila LOINC hanya sebagian terisi (header vs komponen) **ditentukan oleh modul Pelayanan Penunjang** — bukan bagian alur/lingkup A14 (Out Scope #14/#15).

## 8. Business Rules

| ID | Rule | Sumber |
|----|------|--------|
| BR-001 | Validasi **duplikasi** pemeriksaan dievaluasi berdasarkan **kode LIS**; kode LIS wajib unik. | Lampiran v2.2 |
| BR-002 | Pemetaan **LOINC & Answer List** WAJIB dari daftar **terverifikasi tim SATUSEHAT**, bukan browser LOINC publik. | Lampiran v2.2 |
| BR-003 | Pemeriksaan **nonaktif** disembunyikan dari dashboard & order penunjang, tetapi **tetap tersimpan di history pemeriksaan** (tidak dihapus fisik). | Lampiran v2.2 |
| BR-004 | **Nilai Kritis** hanya berlaku untuk komponen ber-**Kategori Hasil = Numerik**, dan **hanya satu pasang ambang: batas bawah & batas atas**. Keduanya opsional; **jika keduanya diisi: `critical_low < critical_high`** ditegakkan sistem sebagai **perbandingan numerik biasa, berlaku penuh pada nilai negatif** (mis. `-10 < -3` valid). Nilai **boleh negatif**. **Tidak ada level kritis bertingkat.** | Refinement user (v1.2/v1.3) |
| BR-005 | Komponen **Diskret** WAJIB memiliki minimal 2 pilihan hasil (Answer List). Pemetaan tiap pilihan ke LOINC Answer List bersifat **opsional (kesiapan)**; kewajiban pengiriman ditentukan modul Pelayanan. | Draft + Refinement user |
| BR-006 | Komponen **Narasi** tidak boleh memiliki rentang normal, satuan numerik, maupun Nilai Kritis. | Draft |
| BR-007 | **Pemetaan LOINC di master data bersifat OPSIONAL (kesiapan integrasi).** Penentuan pengiriman & pemaksaan kelengkapan LOINC sebelum kirim **DIPINDAH ke modul Pelayanan Penunjang (Lab/Radiologi)** — di luar lingkup A14. Master A14 tidak memblok simpan karena LOINC kosong. | Refinement user |
| BR-008 | Satuan komponen numerik **bersumber dari Master Data Satuan & Kemasan (A22)** dan mengacu **UCUM** (Observation.valueQuantity); kode UCUM dikelola di A22, bukan diketik bebas di A14. | Refinement user |
| BR-009 | Pada **Import**, baris dengan kode LIS duplikat ditolak (mode *tambah*) atau di-update (mode *tambah+update*) sesuai `mode_import`. | [ASUMSI] |
| BR-010 | Setiap perubahan (tambah/edit/nonaktif/import) dicatat di **log aktivitas** (user, waktu, aksi). | Lampiran v2.2 |
| BR-011 | Rentang normal dikonfigurasi **cukup 1 (satu) baris per komponen**, dengan atribut **jenis kelamin: Laki-laki / Perempuan / Semua**. **Tidak ada struktur multi-baris** dan tidak ada granularitas kelompok usia di versi ini. | Refinement user |
| BR-012 | Dataset terminologi SATUSEHAT (LOINC/Answer List) disiapkan & diperbarui via **seed manual**; **tidak ada sinkronisasi otomatis/berkala** di versi ini. | Refinement user |
| BR-013 | **Integrasi eksternal modul ini hanya ke SATUSEHAT.** Pemetaan klaim KPTL/BPJS/INA-CBG **di luar lingkup** A14. | Refinement user |
| BR-014 | **Komponen numerik BOLEH tidak memiliki rentang normal sama sekali** (mis. pemeriksaan kuantitatif tanpa rujukan baku). Bila diisi, **nilai rentang normal & Nilai Kritis boleh bernilai negatif** (mis. Base Excess); **validasi `nilai_normal_min <= nilai_normal_max` ditegakkan sebagai perbandingan numerik biasa terhadap tanda apa pun** (mis. `-5 <= -2` valid; `-2 <= -5` ditolak). **(v1.3 — DIKONFIRMASI & ditambahkan eksplisit.)** | Refinement user (v1.3) |
| BR-015 | **(v1.3) A14 TIDAK menyediakan indikator/flag/API 'kesiapan LOINC' yang terpisah.** **Kehadiran kode LOINC** pada pemeriksaan/komponen menjadi satu-satunya sinyal kesiapan: bila kode LOINC terisi, modul Pelayanan Penunjang **otomatis mengirim** Observation ke SATUSEHAT saat pemeriksaan dilakukan; bila kosong, tidak dikirim. | Refinement user (instr.1) |
| BR-016 | **(v1.3)** Pada file **Import/Export**, pemetaan terminologi **cukup kolom kode LOINC** (header & komponen). Tidak ada kolom `kirim_satusehat`/`kode_kptl`; mapping LOINC Answer List per pilihan diskret dilakukan via form (bukan kolom template). | Refinement user (instr.3) |
| BR-017 | **(v1.4)** A14 menyimpan kode LOINC **per header dan per komponen secara independen, apa adanya** — boleh terisi sebagian (header saja, komponen saja, atau campuran). **Perlakuan pengiriman parsial** (mis. komponen tanpa LOINC di-skip atau membatalkan Observation) **bukan lingkup A14**; sepenuhnya ditentukan modul Pelayanan Penunjang saat membentuk Observation. | Refinement user (v1.4, Out Scope #15) |
| BR-018 | **(v1.4)** Bentuk teknis kontrak akses kode LOINC/konfigurasi dari A14 ke modul konsumen (tabel/view/internal service) **bukan keputusan A14** melainkan arsitektur sistem. Kewajiban A14 hanya **menyimpan & memelihara** data referensi tersebut secara stabil & read-consistent. | Refinement user (v1.4, Out Scope #14) |

## 9. User Stories

- **US-001** — Sebagai Admin Master Data Lab, saya ingin **menambah & mengubah** data pemeriksaan beserta komponennya di satu tempat, agar seluruh modul SIMRS memakai data yang sama. *(traceability: To-Be langkah 2)*
- **US-002** — Sebagai Admin Master Data Lab, saya ingin sistem **menolak kode LIS duplikat**, agar tidak ada data pemeriksaan ganda. *(BR-001)*
- **US-003** — Sebagai Petugas Integrasi, saya ingin **memetakan LOINC & Answer List dari daftar terverifikasi SATUSEHAT** secara opsional, agar tersedia sebagai kesiapan integrasi Observation. *(BR-002, BR-007)*
- **US-004** — Sebagai Petugas Integrasi, saya ingin **cukup menyimpan kode LOINC pada pemeriksaan/komponen tanpa indikator kesiapan tambahan**, agar modul Pelayanan dapat otomatis mengirim Observation saat pemeriksaan dilakukan bila kode LOINC ada. *(BR-007, BR-015)*
- **US-005** — Sebagai Admin Master Data Lab, saya ingin mengatur **Kategori Hasil (Numerik/Diskret/Narasi)** per komponen, agar modul Hasil Lab memakai tipe input yang tepat. *(To-Be langkah 4)*
- **US-006** — Sebagai Admin Master Data Lab, saya ingin mendefinisikan **pilihan hasil (Answer List)** untuk pemeriksaan diskret, agar input hasil terbatas & konsisten. *(BR-005)*
- **US-007** — Sebagai Admin Master Data Lab, saya ingin mengatur **ambang Nilai Kritis (batas bawah & atas, boleh negatif)** per item numerik dengan validasi `bawah<atas`, agar hasil mengancam jiwa bisa ditandai otomatis tanpa salah konfigurasi. *(BR-004, BR-014)*
- **US-008** — Sebagai Dokter (DPJP), saya ingin mendapat **notifikasi real-time** saat hasil pasien melewati nilai kritis, agar dapat menangani cepat. *(Phase 2)*
- **US-009** — Sebagai Admin Master Data Lab, saya ingin **menonaktifkan** pemeriksaan tanpa menghapus history, agar data lama tetap tertelusur. *(BR-003)*
- **US-010** — Sebagai Admin Master Data Lab, saya ingin **import/export** data pemeriksaan (.xlsx/.csv) dengan kolom terminologi cukup kode LOINC, agar setup & pembaruan massal cepat & sederhana. *(To-Be langkah 7, BR-016)*
- **US-011** — Sebagai Admin/Manajemen, saya ingin **mencari & memfilter** pemeriksaan dengan cepat (<3 detik) dan melihat *last updated*, agar pengelolaan efisien. *(Metrik 2)*
- **US-012** — Sebagai Auditor/QA, saya ingin **log aktivitas perubahan**, agar keakuratan data terjamin. *(BR-010)*
- **US-013** — Sebagai Admin Master Data Lab, saya ingin memilih **satuan (UCUM) dari Master Satuan & Kemasan (A22)**, agar satuan komponen konsisten & valid untuk Observation. *(BR-008)*
- **US-014** — Sebagai Admin Master Data Lab, saya ingin menetapkan **rentang normal dalam 1 baris** dengan jenis kelamin (L/P/Semua) atau **mengosongkannya**, agar acuan flag abnormal sesuai & sederhana. *(BR-011, BR-014)*
- **US-015** — Sebagai Admin Master Data Lab, saya ingin **menyimpan komponen numerik tanpa rentang normal** dan **dengan nilai negatif** yang tervalidasi `min<=max`, agar pemeriksaan kuantitatif tanpa rujukan baku tetap terakomodasi tanpa data tak konsisten. *(BR-014)*
- **US-016** — **(v1.4)** Sebagai Admin Master Data Lab, saya ingin **menyimpan kode LOINC header & komponen secara independen (boleh terisi sebagian)** tanpa dipaksa melengkapi semuanya, agar pemetaan kesiapan bisa bertahap; perlakuan pengiriman parsial diserahkan ke modul Pelayanan. *(BR-017, Out Scope #15)*

## 10. Functional Requirements

| ID | Requirement | Terkait |
|----|-------------|---------|
| FR-001 | Sistem menyediakan **Dashboard** daftar pemeriksaan lab: kolom kode LIS, nama, kategori, kategori hasil, status pemetaan LOINC (informasional), status, last updated; dengan **search, sort, filter kategori**. | US-011 |
| FR-002 | Sistem menyediakan **form Tambah/Edit Pemeriksaan** (data umum + komponen). | US-001 |
| FR-003 | Sistem **memvalidasi duplikasi kode LIS** saat simpan & saat import. | US-002, BR-001 |
| FR-004 | Sistem menyediakan **lookup LOINC & LOINC Answer List** dari dataset terverifikasi SATUSEHAT (read-only sumber, **seed manual**); pemetaan bersifat **opsional** dan **tidak memblok simpan** bila kosong. | US-003/004, BR-002/007/012 |
| FR-005 | **[DIPINDAH ke modul Pelayanan Penunjang]** Keputusan & validasi pengiriman SATUSEHAT bukan tanggung jawab A14. **(v1.3)** Modul Pelayanan menilai kesiapan **langsung dari ada/tidaknya kode LOINC** di A14 (tanpa indikator/flag terpisah) → bila ada, Observation otomatis terkirim saat pemeriksaan. **(v1.4)** Mekanisme akses teknis & perlakuan pengiriman parsial = ranah modul Pelayanan (Out Scope #14/#15). | US-004, BR-007/013/015/017/018 |
| FR-006 | Sistem mendukung pengelolaan **item/komponen** per pemeriksaan (tambah/edit/hapus komponen). | US-001 |
| FR-007 | Sistem mendukung pemilihan **Kategori Hasil** per komponen (Numerik/Diskret/Narasi) dan menyesuaikan field yang muncul. | US-005, BR-004/005/006 |
| FR-008 | Untuk komponen **Diskret**, sistem mengelola **Answer List** (pilihan hasil + mapping LOINC Answer List **opsional**, via form). | US-006, BR-005/016 |
| FR-009 | Untuk komponen **Numerik**, sistem mengelola **satuan (UCUM dari Master A22, opsional), rentang normal 1 baris dengan jenis kelamin L/P/Semua (boleh dikosongkan, nilai boleh negatif), dan Nilai Kritis (hanya batas bawah & atas, boleh negatif)**. **(v1.3) Sistem menegakkan validasi `nilai_normal_min <= nilai_normal_max` dan `critical_low < critical_high` sebagai perbandingan numerik biasa yang berlaku penuh pada nilai negatif** (mis. `-5 <= -2` valid, `-2 <= -5` ditolak); pelanggaran memblok simpan baik pada form maupun import. | US-007/013/014/015, BR-004/008/011/014 |
| FR-010 | Sistem menyediakan **toggle status_aktif**; nonaktif menyembunyikan dari dashboard/order namun mempertahankan history. | US-009, BR-003 |
| FR-011 | Sistem menyediakan **Export** data (.xlsx/.csv) sesuai template; kolom terminologi **cukup kode LOINC** (header & komponen). | US-010, BR-016 |
| FR-012 | Sistem menyediakan **Import** data (.xlsx/.csv) dengan pilihan **mode (tambah / tambah+update)**, validasi per baris (kode LIS unik, kode LOINC valid bila diisi, satuan valid di A22 bila diisi, `min<=max` & `bawah<atas` bila diisi), dan ringkasan hasil. | US-010, BR-009/014/016 |
| FR-013 | Sistem menyediakan **halaman daftar pemeriksaan nonaktif**. | US-009 |
| FR-014 | Sistem mencatat **log aktivitas** (user, waktu, aksi, before/after) tiap perubahan. | US-012, BR-010 |
| FR-015 | Sistem menyediakan **lookup satuan dari Master Data Satuan & Kemasan (A22)** untuk komponen numerik (kode UCUM mengikuti A22). | US-013, BR-008 |
| FR-016 | **[Phase 2]** Sistem mengekspos konfigurasi Nilai Kritis & Kategori Hasil sebagai acuan modul Hasil Laboratorium (API/internal) untuk flagging & notifikasi. | US-008 |
| FR-017 | Sistem **menyimpan kode LOINC/Answer List** pada pemeriksaan/komponen sebagai kesiapan. **(v1.3) Tidak ada indikator/flag/API 'kesiapan LOINC' terpisah** — kehadiran kode LOINC itu sendiri yang dibaca modul Pelayanan Penunjang (read-only) untuk **otomatis mengirim** Observation saat pemeriksaan dilakukan. **(v1.4)** Kode LOINC header & komponen disimpan **independen, boleh terisi sebagian** (BR-017); A14 tidak menentukan bentuk teknis kontrak akses (BR-018). | US-004/016, BR-007/015/017/018 |
| FR-018 | **(v1.3)** Field LOINC tetap **tidak wajib** di form & template; ketiadaan kode LOINC tidak memblok simpan, namun mengakibatkan pemeriksaan terkait **tidak dikirim** ke SATUSEHAT oleh modul Pelayanan. | US-004, BR-015 |

## 11. Data Requirements (Spesifikasi Field)

### A. Form Tambah/Edit Pemeriksaan — Data Umum (INPUT) — *FR-002/003/004*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_lis | Kode LIS | text | Ya | **unik**, maks 30 char | manual | dasar validasi duplikasi (BR-001) |
| nama_pemeriksaan | Nama Pemeriksaan | text | Ya | maks 150 char | manual | |
| kategori_pemeriksaan | Kategori Pemeriksaan | text | Ya | maks 100 char | **manual** (tanpa master) | mis. Hematologi/Kimia Klinik/Urinalisis; filter dashboard |
| jenis_spesimen | Jenis Spesimen | text | Ya | maks 100 char | **manual** (tanpa master) | mis. Darah/Urin/Feses/Sputum |
| unit | Unit/Poli (pelaksana) | dropdown(lookup) | Ya | dari master Unit (A3) | lookup A3 | **field kanonik** = Laboratorium |
| kode_loinc_header | Kode LOINC (panel) | lookup | **Tidak (opsional)** | dari dataset LOINC terverifikasi (seed manual) | integrasi SATUSEHAT | **kesiapan**; tidak memblok simpan bila kosong (BR-002/007). **(v1.3) Ada-nya kode ini = sinyal auto-kirim** oleh modul Pelayanan (BR-015). **(v1.4)** disimpan independen dari LOINC komponen, boleh terisi sebagian (BR-017) |
| metode_pemeriksaan | Metode | text | Tidak | maks 100 char | manual | mis. Flowcytometry, ELISA [ASUMSI] |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | **field kanonik** |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | **field kanonik**; nonaktif → BR-003 |

> Catatan v1.2–v1.4: field `kode_kptl` **dihapus** (pemetaan klaim out scope, BR-013). Field **`kirim_satusehat` TIDAK ADA di master** — penentuan pengiriman ditangani modul Pelayanan Penunjang dengan membaca **ada/tidaknya `kode_loinc_*`** (BR-007/015). **Tidak ada field/indikator 'kesiapan LOINC' tambahan.** **(v1.4)** tidak ada field bentuk kontrak akses/flag pengiriman parsial — keduanya out scope (#14/#15).

### B. Sub-form Item/Komponen Pemeriksaan (INPUT) — *FR-006/007/008/009/015*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_komponen | Nama Komponen | text | Ya | maks 100 char | manual | mis. HGB, WBC |
| kode_loinc_komponen | LOINC Komponen | lookup | **Tidak (opsional)** | dataset LOINC terverifikasi (seed manual) | integrasi SATUSEHAT | kesiapan; tidak memblok simpan (BR-007). **(v1.3) ada → auto-kirim komponen** (BR-015). **(v1.4)** independen dari LOINC header; boleh terisi sebagian (BR-017) |
| kategori_hasil | Kategori Hasil | dropdown | Ya | enum: Numerik / Diskret / Narasi | enum | menentukan field tampil (FR-007) |
| satuan | Satuan (UCUM) | lookup | Tidak | bila diisi → valid di A22; hanya Numerik | **Master Satuan & Kemasan (A22)** | hanya Numerik; **kode UCUM dikelola di A22** (BR-008) |
| ref_gender | Jenis Kelamin Rujukan | dropdown | Tidak | enum: **Laki-laki / Perempuan / Semua** | default **Semua** | atribut pada **1 baris** rujukan normal (BR-011) |
| nilai_normal_min | Rentang Normal - Min | number | Tidak | numerik, **boleh negatif** | manual | hanya Numerik; **boleh dikosongkan** (BR-014) |
| nilai_normal_max | Rentang Normal - Max | number | Tidak | **`>= nilai_normal_min`** (perbandingan numerik biasa, berlaku pada nilai negatif), **boleh negatif** | manual | hanya Numerik; **boleh dikosongkan** (BR-014, v1.3) |
| critical_aktif | Aktifkan Nilai Kritis | boolean | Tidak | default nonaktif | manual | hanya Numerik (BR-004) |
| critical_low | Nilai Kritis Bawah | number | Kondisional | wajib bila critical_aktif & batas bawah dipakai; **boleh negatif** | manual | mis. HGB 7.0 |
| critical_high | Nilai Kritis Atas | number | Kondisional | **`critical_low < critical_high`** (perbandingan numerik biasa, berlaku pada nilai negatif); **boleh negatif** | manual | mis. Kalium 6.5 — **hanya pasangan bawah/atas, tanpa level bertingkat** (BR-004) |

> Catatan v1.2–v1.4: **rentang normal = 1 (satu) baris per komponen** (BR-011); field `ref_kelompok_usia` **dihapus** & struktur multi-baris dihilangkan. Komponen numerik **boleh disimpan tanpa rentang normal** (BR-014). **(v1.3) Validasi `min<=max` & `low<high` ditegakkan penuh termasuk pada nilai negatif** — pelanggaran memblok simpan. **(v1.4)** A14 tidak menyimpan atribut perlakuan pengiriman parsial; logika tersebut milik modul Pelayanan (BR-017, Out Scope #15).

### C. Sub-form Answer List (komponen Diskret) (INPUT) — *FR-008*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| pilihan_hasil | Pilihan Hasil | text | Ya | min 2 pilihan/komponen | manual | mis. Positif/Negatif (BR-005) |
| kode_answer_loinc | LOINC Answer Code | lookup | **Tidak (opsional)** | dari LOINC Answer List terverifikasi (seed manual) | integrasi SATUSEHAT | kesiapan; mis. LA6576-8; tidak memblok simpan (BR-007). **(v1.3) dipetakan via form, bukan kolom template** (BR-016) |
| urutan | Urutan Tampil | number | Tidak | integer ≥1 | manual | urutan dropdown di Hasil Lab |
| is_default | Default | boolean | Tidak | maks 1 default | default false | |

### D. Form Import Massal (INPUT) — *FR-012*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Pemeriksaan | file | Ya | .csv/.xlsx, sesuai template, maks 10MB | manual upload | **field kanonik** |
| mode_import | Mode | dropdown | Ya | enum: tambah / tambah+update | enum | **field kanonik** (BR-009) |

> **(v1.3) Kolom baku Template Import/Export (FINAL — BR-016):**
> `kode_lis | nama_pemeriksaan | kategori_pemeriksaan | jenis_spesimen | unit | kode_loinc_header | metode_pemeriksaan | keterangan | status_aktif | nama_komponen | kode_loinc_komponen | kategori_hasil | satuan | ref_gender | nilai_normal_min | nilai_normal_max | critical_aktif | critical_low | critical_high`
> - Pemetaan terminologi di template **cukup kode LOINC** (header & komponen): kolom `kode_loinc_header` & `kode_loinc_komponen`. **Tidak ada** kolom `kirim_satusehat`, `kode_kptl`, maupun kolom indikator kesiapan.
> - Mapping **LOINC Answer List** untuk pilihan diskret **TIDAK** dijadikan kolom template — dikelola via form (sub-form Answer List).
> - Validasi import: kode LIS unik (wajib); kode LOINC valid **bila diisi**; satuan valid di A22 **bila diisi**; `nilai_normal_min<=max` & `critical_low<critical_high` **bila diisi** (termasuk nilai negatif).

### E. Dashboard Master Data Lab (TAMPIL) — *FR-001*
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Pemeriksaan Aktif | count where status_aktif | angka besar (kartu) | – | ringkasan |
| Kode LIS | item_pemeriksaan.kode_lis | text | sort, filter | |
| Nama Pemeriksaan | item_pemeriksaan.nama | text | sort A-Z (default) | |
| Kategori | item_pemeriksaan.kategori | text/badge | filter | |
| Kategori Hasil | komponen.kategori_hasil | badge (Numerik/Diskret/Narasi) | filter | agregasi bila multi-komponen |
| LOINC | kode_loinc_header | badge (Terpetakan/Belum) | filter (terpetakan/belum) | **informasional** — Terpetakan menyiratkan akan auto-kirim oleh Pelayanan (BR-015); tidak memblok |
| Status | status_aktif | badge (Aktif/Nonaktif) | filter | |
| Last Updated | log.updated_at | tanggal-waktu | sort terbaru | dari log aktivitas (FR-014) |

> Catatan v1.2: kolom **KPTL & Kirim SATUSEHAT dihapus** (out scope / dipindah ke Pelayanan). **(v1.3)** Kolom LOINC tetap informasional sebagai cermin kesiapan, bukan indikator/flag terpisah.

### F. Daftar Pemeriksaan Nonaktif (TAMPIL) — *FR-013*
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Kode LIS / Nama | item_pemeriksaan where !aktif | text | sort | |
| Tgl Nonaktif | log aktivitas | tanggal | sort terbaru | |
| Dinonaktifkan oleh | log.user | text | – | audit |
| Aksi | – | tombol Aktifkan kembali | – | mempertahankan history (BR-003) |

### G. Log Aktivitas (TAMPIL) — *FR-014*
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | log.timestamp | tanggal-waktu | sort terbaru | |
| User | log.user | text | filter | |
| Aksi | log.action | badge (Tambah/Edit/Nonaktif/Import) | filter | |
| Objek | log.kode_lis | text | – | pemeriksaan terdampak |
| Perubahan | log.before_after | teks ringkas | – | before/after |

## 12. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | **Performa:** pencarian/filter dashboard < **3 detik** untuk dataset hingga ribuan pemeriksaan. |
| NFR-002 | **Skalabilitas import:** file hingga 10MB / beberapa ribu baris diproses tanpa timeout (proses background bila perlu). [ASUMSI] |
| NFR-003 | **Keamanan & RBAC:** hanya role berwenang (Admin Master Data / Penanggung Jawab Lab) dapat menambah/mengubah/nonaktifkan; mengacu A18/A53. |
| NFR-004 | **Auditability:** semua perubahan tercatat (user, waktu, before/after) & tidak dapat dihapus. |
| NFR-005 | **Integritas data:** kode LIS unik dijaga di level DB (unique constraint), bukan hanya UI. **(v1.3)** Validasi `nilai_normal_min<=max` & `critical_low<high` ditegakkan di level layanan/DB (constraint/trigger), bukan hanya UI, termasuk pada nilai negatif. |
| NFR-006 | **Konsistensi terminologi:** dataset LOINC/Answer List disiapkan via **seed manual** dan dapat diperbarui terpisah (per versi) tanpa mengubah data pemeriksaan existing; **tanpa sinkronisasi otomatis** (BR-012). |
| NFR-007 | **Ketersediaan offline/RS Tipe C-D:** master bersifat referensi; bila koneksi terbatas, data master di-cache lokal agar order/hasil lab tetap berjalan. [ASUMSI] |
| NFR-008 | **Usability:** form adaptif sesuai **Kategori Hasil** (field tidak relevan disembunyikan) untuk mengurangi kesalahan input; pemetaan LOINC ditampilkan sebagai opsional/kesiapan. |
| NFR-009 | **Kompatibilitas:** export/import mengikuti template baku v1.3 (kolom & urutan tetap; terminologi cukup kode LOINC; tanpa kolom kirim_satusehat/KPTL) agar interoperable dengan tools RS. |
| NFR-010 | **Konsistensi satuan:** satuan komponen numerik direferensikan dari Master A22 (UCUM); A14 tidak menyimpan definisi UCUM tandingan. |
| NFR-011 | **(v1.3) Kontrak antar-modul yang minimal:** A14 mengekspos **kode LOINC/Answer List & konfigurasi Nilai Kritis** sebagai kontrak read-only stabil bagi modul Pelayanan Penunjang & Hasil Laboratorium. **Tidak ada endpoint/field 'kesiapan' tambahan** — konsumen menilai kesiapan dari kehadiran kode LOINC (BR-015, FR-017). **(v1.4)** Kewajiban A14 dibatasi pada **penyimpanan & pemeliharaan data referensi yang read-consistent**; **bentuk teknis kontrak akses (tabel/view/service) BUKAN lingkup A14** melainkan keputusan arsitektur (BR-018, Out Scope #14). |
| NFR-012 | **(v1.4) Independensi data LOINC:** A14 menyimpan kode LOINC header & komponen secara independen sehingga pemetaan dapat parsial; A14 **tidak menerapkan aturan konsistensi lintas-level** (header vs komponen) — penanganan pengiriman parsial diserahkan ke modul Pelayanan Penunjang (BR-017, Out Scope #15). |

## 13. Integrasi Eksternal

> **Lingkup integrasi modul ini = SATUSEHAT saja** (BR-013). Pemetaan klaim KPTL/BPJS/INA-CBG tidak dikerjakan di A14. **Keputusan & validasi pengiriman ke SATUSEHAT ditangani modul Pelayanan Penunjang** (BR-007). **(v1.3) Sinyal kesiapan = kehadiran kode LOINC; A14 tidak menyediakan indikator kesiapan terpisah** (BR-015). **(v1.4) Bentuk teknis kontrak akses & perlakuan pengiriman parsial = ranah modul Pelayanan / arsitektur, bukan A14** (Out Scope #14/#15, BR-017/BR-018).

| Integrasi | Arah | Tujuan | Catatan |
|-----------|------|--------|---------|
| **SATUSEHAT — Observation (LOINC)** | Konsumsi dataset (lookup) + simpan kode | Master **menyimpan** kode LOINC header & komponen sebagai **kesiapan** agar Observation valid saat dikirim. | Sumber kode **wajib terverifikasi tim SATUSEHAT** (BR-002), **seed manual** (BR-012). Pemetaan **opsional** di master. **(v1.3) Kehadiran kode LOINC → modul Pelayanan auto-kirim** saat pemeriksaan; kosong → tidak dikirim (BR-015). **(v1.4)** kode header & komponen disimpan independen/boleh parsial (BR-017). |
| **SATUSEHAT — LOINC Answer List** | Konsumsi dataset | Mapping pilihan hasil diskret lokal → kode Answer standar (kesiapan, opsional, via form). | mis. LA6576-8 Positive, LA6577-6 Negative [ASUMSI contoh]; seed manual; **bukan kolom template** (BR-016). |
| **Master Satuan & Kemasan (A22) — UCUM** | Lookup (internal master) | Satuan komponen numerik (Observation.valueQuantity). | **Kode UCUM dikelola di A22**; A14 hanya me-*lookup* (BR-008). |
| **Modul Pelayanan Penunjang (Lab/Radiologi) (internal)** | Konsumsi kode (read-only dari master) | **Memutuskan & memvalidasi pengiriman.** **(v1.3)** Menilai kesiapan dari **ada/tidaknya kode LOINC** → bila ada, Observation **otomatis terkirim** saat pemeriksaan. | **Pemilik logika kirim** (FR-005/FR-017, BR-007/015). **Tidak menarik indikator kesiapan terpisah.** **(v1.4) Pemilik bentuk teknis akses & perlakuan pengiriman parsial** (Out Scope #14/#15). |
| **Modul Hasil Laboratorium (internal)** | Ekspos konfigurasi | Nilai Kritis (bawah/atas) & Kategori Hasil → flagging + notifikasi dokter (Phase 2). | API/internal service (FR-016). |
| **Modul Administrasi/RME/Billing (internal)** | Ekspos master | Single source of truth data pemeriksaan. | Perubahan langsung berlaku. |
| ~~KPTL / BPJS V2 / INA-CBG~~ | — | — | **Out scope** modul A14 (BR-013). Bila dibutuhkan, ditangani modul Klaim/Tindakan (A10). |

## Asumsi
- [ASUMSI] Modul belum punya BPMN sendiri; alur As-Is/To-Be diturunkan dari pola master data & analogi g-admisi-onsite-registration (duplicate detection) serta g-backoffice-inventory-penerimaan (form simpan/validasi).
- [ASUMSI] RS Tipe C & D memiliki layanan lab terbatas; import/export massal & seed manual terminologi diperlukan agar setup tidak bergantung input manual per item.
- [ASUMSI] Field kanonik (unit, status_aktif, file_import, mode_import, keterangan) mengikuti definisi bersama lintas-PRD Control Panel; `satuan` mengikuti definisi Master A22.
- [ASUMSI] Notifikasi nilai kritis & log read-back adalah Phase 2; modul A14 hanya menyediakan konfigurasi/penyimpanan acuan.
- [ASUMSI] Tarif pemeriksaan dikelola di master Tindakan (A10); modul ini hanya mereferensikan untuk billing.
- [ASUMSI] Contoh kode LOINC Answer (LA6576-8/LA6577-6) bersifat ilustratif; nilai final mengikuti dataset terverifikasi SATUSEHAT.
- [ASUMSI] Penyebutan 'pelayanan radiologi' oleh user dipahami sebagai modul Pelayanan Penunjang (Lab/Radiologi); untuk konteks A14, konsumen utamanya adalah pelayanan laboratorium.
- [CONFIRMED — refinement user v1.3] Tidak ada indikator/flag/API 'kesiapan LOINC' terpisah dari A14; kehadiran kode LOINC = sinyal kesiapan, modul Pelayanan otomatis mengirim Observation saat pemeriksaan bila LOINC terisi (instr.1, BR-015).
- [CONFIRMED — refinement user v1.3] Validasi `nilai_normal_min <= nilai_normal_max` & `critical_low < critical_high` ditambahkan eksplisit dan berlaku sebagai perbandingan numerik biasa termasuk pada nilai negatif (instr.2, BR-004/BR-014).
- [CONFIRMED — refinement user v1.3] Template Import/Export: pemetaan terminologi cukup kode LOINC (header & komponen); tanpa kolom kirim_satusehat/KPTL; mapping Answer List via form (instr.3, BR-016).
- [CONFIRMED — refinement user v1.4] Bentuk teknis kontrak akses read-only A14 → modul Pelayanan Penunjang BUKAN lingkup A14 (keputusan arsitektur); A14 hanya menyimpan & memelihara data referensi read-consistent. Open question v1.3 ditutup → Out Scope #14 (BR-018).
- [CONFIRMED — refinement user v1.4] Perlakuan pengiriman parsial Observation (header punya LOINC tetapi sebagian komponen tidak, atau sebaliknya) BUKAN lingkup A14; logika milik modul Pelayanan Penunjang. A14 menyimpan kode LOINC header & komponen independen/boleh parsial. Open question v1.3 ditutup → Out Scope #15 (BR-017).
- [CONFIRMED — refinement user] Rentang normal cukup 1 (satu) baris per komponen dengan jenis kelamin L/P/Semua; tidak ada struktur multi-baris.
- [CONFIRMED — refinement user] Komponen numerik boleh tanpa rentang normal sama sekali, dan nilai rentang/kritis boleh bernilai negatif.
- [CONFIRMED — refinement user] Keputusan & validasi pengiriman ditangani modul Pelayanan Penunjang (out scope A14); pemetaan LOINC di master bersifat opsional (kesiapan).
- [CONFIRMED — refinement user] Satuan bersumber dari Master Data Satuan & Kemasan (A22); kode UCUM dikelola di A22.
- [CONFIRMED — refinement user] Kategori pemeriksaan & jenis spesimen = input manual, tanpa master data tersendiri.
- [CONFIRMED — refinement user] Integrasi modul hanya ke SATUSEHAT; KPTL/BPJS out scope.
- [CONFIRMED — refinement user] Nilai Kritis hanya satu pasang batas bawah & atas (tanpa level bertingkat).
- [CONFIRMED — refinement user] Dataset terminologi disiapkan via seed manual (tanpa sinkronisasi otomatis).