# PRD — Master Data / Integrasi SATUSEHAT BPJS V2 — Item Pemeriksaan Laboratorium

**Related Document:** Template Export/Import Data Pemeriksaan Lab (Phase 2); LOINC Laboratory - SATUSEHAT (terverifikasi, seed manual); Kode Pembiayaan Tindakan & Layanan Kesehatan (KPTL) v1.6; Observation.valueQuantity (UCUM); PRD Master Data Laboratorium v2.2 (Tamtech); Modul terkait: A3 Unit, A10 Tindakan, A13 Procedure, A22 Satuan & Kemasan, A29 Item Pemeriksaan Radiologi, Modul Hasil Laboratorium
**Versi:** 1.1 - Penajaman (jawaban open questions: LOINC hardcoded dropdown, relasi nilai kritis ditegaskan, Answer List opsional, kategori & spesimen input bebas, acuan jenis kelamin, impor/ekspor → Phase 2)

## 1. Overview / Brief Summary

Modul **Master Data Item Pemeriksaan Laboratorium** (kode fitur **A14**, cluster **Control Panel**) adalah modul pengelolaan data pemeriksaan laboratorium yang menjadi **sumber kebenaran tunggal (single source of truth)** atas seluruh layanan pemeriksaan laboratorium di rumah sakit.

Lingkup data yang dikelola:
- **Identitas pemeriksaan**: kode LIS, nama pemeriksaan, kategori, jenis spesimen.
- **Kode terminologi**: LOINC, LOINC Answer List, KPTL (untuk interoperabilitas SATUSEHAT & klaim).
- **Item/komponen pemeriksaan**: satuan (UCUM), rentang nilai normal, ambang **Nilai Kritis (Critical Value)** batas bawah/atas.
- **Kategori Hasil Pemeriksaan**: Numerik, Diskret, dan Narasi (beserta daftar pilihan untuk hasil diskret).

Master data ini menjadi fondasi bagi modul Administrasi/Pendaftaran, Rekam Medis (EMR), Billing, Klaim, dan modul **Hasil Laboratorium**, sehingga setiap perubahan cukup dikelola di satu tempat dan langsung berlaku di seluruh modul terkait.

Pada versi ini ditambahkan **dua kemampuan utama**:
1. **Konfigurasi Nilai Kritis (Critical Value)** — ambang batas kritis bawah/atas per item pemeriksaan numerik. Dikonsumsi modul Hasil Laboratorium untuk *flagging* hasil dan notifikasi real-time ke dokter (DPJP) ketika hasil pasien berada pada titik kritis.
2. **Kategori Hasil Pemeriksaan** — pengelompokan tipe hasil menjadi **Numerik / Diskret / Narasi** untuk mendukung variasi struktur hasil, termasuk konfigurasi pilihan hasil terbatas (mis. Positif/Negatif) dan validasi input yang tepat di modul Hasil Laboratorium.

> **Keputusan Phase 1**: untuk fase ini, daftar **kode LOINC** (dan Answer List) **di-seed manual dan di-hardcode di frontend dalam bentuk dropdown** — belum ada integrasi API live ke SATUSEHAT Terminology. Integrasi tarik/lookup dinamis dijadwalkan fase berikutnya.

> Konteks RS Tipe C & D: jumlah jenis pemeriksaan laboratorium relatif terbatas, SDM laboratorium ramping, dan pemetaan terminologi sering belum baku. Modul ini memusatkan konfigurasi agar petugas tidak perlu menginput ulang kode di banyak tempat. [ASUMSI]

## 2. Background

### 2.1 Konteks Integrasi SATUSEHAT & Terminologi
Ekosistem digital kesehatan Indonesia mewajibkan integrasi data ke platform **SATUSEHAT**. Pengiriman data hasil laboratorium (resource **Observation**) wajib menggunakan standar pengkodean terminologi internasional **LOINC**, serta **KPTL** untuk kebutuhan klaim dan interoperabilitas. Saat ini master data laboratorium belum punya mekanisme konsisten untuk menampung dan memetakan kode **LOINC, Answer List, dan KPTL** secara terstruktur → diperlukan *enhancement* untuk memastikan kesiapan teknis integrasi.

**Catatan penting (dari Lampiran v2.2):**
- Pemetaan kode LOINC dan Answer List **wajib bersumber dari daftar yang telah diverifikasi tim SATUSEHAT**, BUKAN dari browser LOINC publik.
- **Phase 1**: daftar LOINC & Answer List terverifikasi **di-seed manual** dan **di-hardcode sebagai dropdown di frontend** (belum tarik API live). Pembaruan daftar = rilis/seed baru. *(jawaban open question)*
- Validasi duplikasi data pemeriksaan dievaluasi berdasarkan **kode LIS**.
- Status **nonaktif** = acuan modul lain: pemeriksaan nonaktif disembunyikan dari dashboard & tidak muncul pada order penunjang, tetapi tetap tersimpan di history.

### 2.2 Gap: Ketiadaan Ambang Nilai Kritis
Pengelolaan data pemeriksaan belum menyediakan acuan ambang **Nilai Kritis** yang baku. Saat hasil pasien berada pada kondisi mengancam jiwa (mis. HGB < 7.0, Kalium > 6.5, Gula Darah > 400), tidak ada mekanisme otomatis yang menandai hasil dan memberitahukannya ke dokter secara cepat → potensi *delay* penanganan dan risiko klinis tinggi. Modul ini memusatkan konfigurasi Nilai Kritis sebagai acuan tunggal, terintegrasi langsung ke modul Hasil Laboratorium untuk *flagging* dan notifikasi real-time. Secara konseptual ambang kritis **membungkus** rentang normal: batas kritis bawah berada di bawah batas normal bawah, dan batas kritis atas berada di atas batas normal atas (lihat BR-005).

### 2.3 Gap: Variasi Kategori Hasil yang Belum Terakomodasi
Struktur data hasil saat ini mengasumsikan semua hasil **numerik dengan range normal**. Padahal ada pemeriksaan non-numerik:
- **Diskret Binary**: Darah Samar (Positif/Negatif), Tes Kehamilan (Positif/Negatif).
- **Diskret Multi-option**: Kultur (Tumbuh/Tidak Tumbuh/Kontaminasi), Golongan Darah (O/A/B/AB), Hapusan Gram (Kokus/Basil/Spirilum).
- **Narasi**: Hapusan Darah Tepi, Pewarnaan (deskripsi morfologi).

Ketiadaan kategori ini menyebabkan: input manual/tidak terstruktur; modul Hasil Lab tak bisa menentukan tipe validasi input yang tepat (dropdown vs numerik vs text area); tidak ada mekanisme memetakan pilihan hasil lokal ke **LOINC Answer List** SATUSEHAT; serta risiko salah input meningkat. Penambahan **Kategori Hasil Pemeriksaan** mengotomasi validasi input dan menjaga konsistensi pengisian hasil di level aplikasi. Pemetaan ke Answer List bersifat **opsional** dan hanya diperlukan untuk pemeriksaan diskret yang datanya dikirim ke SATUSEHAT (lihat BR-006).

## 3. In Scope

### Scope Definition
**Phase 1 (MVP):**
1. Dashboard master data laboratorium (pencarian, sorting, filter kategori, informasi *last updated*).
2. Formulir penambahan/pembaruan data pemeriksaan beserta **item/komponen** pemeriksaan.
3. Pemetaan kode **LOINC, Answer List, dan KPTL** melalui **dropdown frontend** yang di-seed manual dari daftar terverifikasi SATUSEHAT (belum API live).
4. Konfigurasi **Kategori Hasil Pemeriksaan** (Numerik / Diskret / Narasi) + daftar pilihan hasil untuk tipe Diskret.
5. Pengaturan **Nilai Kritis (Critical Value)** batas bawah/atas per item pemeriksaan numerik, dengan validasi relasi terhadap rentang normal (BR-005).
6. Acuan rentang normal **per jenis kelamin** (Semua / Laki-laki / Perempuan).
7. Halaman daftar pemeriksaan laboratorium **nonaktif**.
8. Log aktivitas perubahan (audit trail).

**Phase 2 [**] (di luar MVP rilis ini, dicatat sebagai roadmap):**
- **Impor & ekspor** data pemeriksaan (.xlsx/.csv) sesuai template — *ditunda ke Phase 2 (jawaban open question)*.
- Integrasi **LOINC/Answer List API live** ke SATUSEHAT Terminology (menggantikan dropdown hardcoded Phase 1).
- Integrasi notifikasi Nilai Kritis ke modul Hasil Laboratorium (flagging hasil & alert ke dokter). *(Konfigurasinya di Phase 1; konsumsi/notifikasi di modul Hasil Lab.)*
- Pencatatan log pelaporan nilai kritis / *read-back* untuk akreditasi.

### Out Scope
| No | Scope yang TIDAK dikerjakan modul ini |
|----|----------------------------------------|
| 1 | Order pemeriksaan penunjang laboratorium (modul order penunjang). |
| 2 | Input & verifikasi hasil pemeriksaan laboratorium (modul Hasil Laboratorium). |
| 3 | Logika klinis tatalaksana/penanganan pasien atas hasil nilai kritis. |
| 4 | Pembuatan/penerbitan kode LOINC/KPTL baru (modul ini hanya memetakan dari daftar terverifikasi). |
| 5 | Manajemen master Unit/Satuan/Profesi — dikelola modul A3 (Unit) & A22 (Satuan & Kemasan); modul ini hanya *lookup*. |
| 6 | Master data kategori pemeriksaan & jenis spesimen — Phase 1 keduanya **input bebas (teks)**, tidak ada master data tersendiri (jawaban open question). |

## 4. Goals and Metrics

### Goals
1. Menyediakan modul layanan laboratorium yang lengkap & terstruktur sebagai acuan modul terkait (single source of truth).
2. Menyediakan mekanisme pemetaan kode **LOINC & Answer List** (Phase 1: dropdown hardcoded) untuk kesiapan integrasi SATUSEHAT.
3. Menyediakan mekanisme pemetaan kode **KPTL** untuk mendukung pengiriman data klaim.
4. Menyediakan pengaturan **Nilai Kritis** per pemeriksaan untuk mendukung keselamatan pasien melalui notifikasi dini ke dokter.
5. Menyediakan **Kategori Hasil Pemeriksaan** agar validasi input hasil konsisten dan terstandar.
6. Menyediakan **log aktivitas perubahan** untuk menjamin keakuratan data.

### Metrics
| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Kelengkapan & pengelolaan data | Data pemeriksaan dapat ditambah, diubah, dinonaktifkan; >95% user laboratorium menyatakan pengelolaan mudah & cepat. |
| 2 | Kecepatan pencarian | Waktu pencarian/filter pemeriksaan < 3 detik. |
| 3 | Akurasi pemetaan LOINC | 100% pemeriksaan terpetakan ke kode LOINC dengan tepat (dari dropdown terverifikasi). |
| 4 | Akurasi pemetaan KPTL | 100% pemeriksaan terpetakan ke KPTL dengan tepat. |
| 5 | Single source of truth | Tidak ada perbedaan data layanan pemeriksaan antar modul SIMRS. |
| 6 | Notifikasi nilai kritis | 100% hasil numerik yang melewati ambang nilai kritis (untuk item terkonfigurasi) ter-*flag* & memicu notifikasi ke dokter. *(realisasi di Phase 2/modul Hasil Lab)* |
| 7 | Konsistensi kategori hasil | 100% pemeriksaan diskret memiliki daftar pilihan hasil terbatas; input bebas pada hasil diskret = 0. [ASUMSI target] |
| 8 | Validitas ambang kritis | 100% konfigurasi nilai kritis lolos validasi relasi (critical_low < normal_min, critical_high > normal_max). |

## 5. Related Feature

Diturunkan dari List Fitur cluster **Control Panel** dan dokumen lampiran.

| No | Code | Module / Menu | Keterkaitan |
|----|------|---------------|-------------|
| 1 | **A3** | Master Data > Unit | *Lookup* `unit` (Unit/Poli — lab) untuk pemeriksaan. Definisi field kanonik bersama. |
| 2 | **A22** | Master Data / SATUSEHAT Terminology V2 > Satuan & Kemasan | Sumber `satuan` item pemeriksaan (UCUM). |
| 3 | **A10** | Master Data / Integrasi BPJS V2 > Tindakan | Layanan/tindakan lab untuk billing & tarif. |
| 4 | **A13** | Master Data / SATUSEHAT BPJS V1 V2 > Procedure | Pemetaan procedure terkait pemeriksaan. |
| 5 | **A29** | Master Data / SATUSEHAT BPJS V2 > Item Pemeriksaan Radiologi | Pola struktur master penunjang sejenis (konsistensi pola). |
| 6 | **A32** | Master Data / SATUSEHAT V2 > Wilayah | Pola modul Master Data + integrasi SATUSEHAT (acuan). |
| 7 | — | Integrasi SATUSEHAT > Observation (LOINC, Answer List) | Konsumsi kode LOINC & Answer List saat kirim hasil. Phase 1: daftar di-seed hardcoded; API live = Phase 2. |
| 8 | — | Integrasi Klaim (BPJS) > Pemetaan KPTL | KPTL untuk pengiriman data klaim. |
| 9 | — | **Modul Hasil Laboratorium** | Konsumen utama: kategori hasil (tipe validasi input) + ambang Nilai Kritis (flagging & notifikasi dokter). |
| 10 | — | Administrasi, Rekam Medis, Billing, Klaim | Sinkronisasi data pemeriksaan laboratorium. |

## 6. Business Process (As-Is / To-Be)

> Modul ini **belum punya BPMN sendiri**. Alur diturunkan dari pola master data Control Panel & proses integrasi (analogi `g-admisi-onsite-registration` untuk pola cek/bridging integrasi, `g-support-apotek-online-iter` untuk pola validasi & kirim data ke sistem eksternal). [ASUMSI]

### A. As-Is (kondisi saat ini)
1. Data pemeriksaan laboratorium dikelola sebagian di LIS / spreadsheet terpisah, tidak ada single source of truth. [ASUMSI]
2. Kode LOINC/KPTL belum dipetakan terstruktur → saat kirim Observation ke SATUSEHAT kode di-input manual / sering kosong → klaim & interoperabilitas terhambat.
3. Tidak ada ambang Nilai Kritis baku → hasil mengancam jiwa tidak otomatis ditandai; pelaporan ke dokter manual & lambat.
4. Semua hasil diasumsikan numerik → hasil diskret/narasi diinput bebas, rawan salah & tidak terstandar.
5. Penonaktifan pemeriksaan tidak konsisten → pemeriksaan usang masih muncul di order.

### B. To-Be (kondisi diharapkan)
1. **Petugas Lab / Admin Master Data** mengelola seluruh data pemeriksaan dari satu dashboard (cari, filter kategori, lihat *last updated*).
2. Saat **tambah/edit pemeriksaan**, sistem menyediakan **dropdown** kode **LOINC, Answer List (bila diskret & dikirim SATUSEHAT), KPTL** dari daftar terverifikasi yang di-seed (Phase 1: hardcoded di frontend, bukan input bebas).
3. Sistem **mendeteksi duplikat berdasarkan kode LIS** sebelum simpan (analogi *duplicate detection* pada admisi onsite). Jika duplikat → tolak/peringatkan.
4. Untuk tiap item numerik, petugas mengisi **rentang normal** (opsional per jenis kelamin) + **ambang Nilai Kritis bawah/atas**; sistem memvalidasi `critical_low < normal_min` dan `critical_high > normal_max` bila normal terisi. Untuk hasil **diskret**, petugas mengisi **daftar pilihan hasil**; pemetaan ke Answer List opsional (wajib hanya bila dikirim SATUSEHAT).
5. Data tersimpan menjadi acuan tunggal; modul Hasil Lab membaca **kategori hasil** (menentukan tipe input) dan **ambang kritis** (flagging + notifikasi dokter).
6. Penonaktifan menyembunyikan pemeriksaan dari dashboard & order, tetapi history tetap tersimpan.
7. **Impor/ekspor** massal (.xlsx/.csv) — **ditunda ke Phase 2**; pada Phase 1 entri data dilakukan via form.

## 7. Main Flow / Mindmap

**Aktor**: Petugas Laboratorium / Admin Master Data (pengelola), Sistem Neurovi (SIMRS), Daftar terminologi SATUSEHAT (LOINC/Answer List, seed hardcoded Phase 1), Integrasi Klaim BPJS (KPTL). Konsumen hilir: Modul Hasil Laboratorium, Dokter/DPJP.

### Skenario 1 — Tambah Pemeriksaan Baru
1. Admin buka **Dashboard Master Data Laboratorium** → klik **Tambah Pemeriksaan**.
2. Isi data umum: nama pemeriksaan, **kode LIS**, kategori (input bebas), jenis spesimen (input bebas), unit (lab), status aktif.
3. Pilih **kode LOINC** dari **dropdown** (daftar terverifikasi yang di-seed) & **kode KPTL**.
4. Tambah **item/komponen** pemeriksaan (≥1). Per item pilih **Kategori Hasil**:
   - **Numerik** → isi satuan (UCUM), rentang normal (opsional per jenis kelamin: Semua/Laki-laki/Perempuan), **ambang Nilai Kritis bawah/atas** (tervalidasi terhadap rentang normal).
   - **Diskret** → isi **daftar pilihan hasil** (mis. Positif/Negatif); **opsional** map tiap pilihan ke **LOINC Answer List** (dari dropdown) bila pemeriksaan dikirim SATUSEHAT.
   - **Narasi** → tanpa pilihan; modul Hasil Lab menyajikan *text area*.
5. Klik **SIMPAN** → Sistem **cek duplikat kode LIS** + **validasi ambang kritis** → jika lolos: simpan + catat audit log; jika duplikat/validasi gagal: tampilkan peringatan, batal simpan.
6. **Event akhir**: "Pemeriksaan berhasil disimpan & siap dikonsumsi modul Hasil Lab / order penunjang."

### Skenario 2 — Edit / Nonaktifkan Pemeriksaan
1. Cari pemeriksaan → buka detail → ubah field / toggle **status aktif**.
2. Jika dinonaktifkan → disembunyikan dari dashboard aktif & order, tetap muncul di **halaman Pemeriksaan Nonaktif** & history.
3. Simpan → audit log mencatat perubahan (user, waktu, before/after).

### Skenario 3 — Impor / Ekspor Massal *(Phase 2 — di luar rilis ini)*
1. Admin unduh **template** (.xlsx/.csv) → isi → unggah.
2. Sistem **validasi per baris** (kode LIS unik, LOINC/KPTL valid, ambang kritis numerik). Baris valid disimpan; baris gagal di-*return* dengan keterangan error.
3. Ekspor: unduh seluruh/terfilter data pemeriksaan.
> Skenario ini didokumentasikan untuk perencanaan; **tidak diimplementasikan di Phase 1**.

## 8. Business Rules

- **BR-001** — Duplikasi pemeriksaan dievaluasi berdasarkan **kode LIS**. Jika kode LIS sudah ada → simpan ditolak. *(traceability: analogi Duplicate Detection — g-admisi-onsite-registration)*
- **BR-002** — Kode **LOINC & Answer List wajib bersumber dari daftar terverifikasi tim SATUSEHAT**, bukan dari browser LOINC publik. **Phase 1**: daftar di-**seed manual** dan disajikan sebagai **dropdown hardcoded di frontend** (tanpa API live).
- **BR-003** — Setiap pemeriksaan **wajib** memiliki minimal **1 item/komponen** pemeriksaan.
- **BR-004** — Field **Ambang Nilai Kritis** hanya berlaku & wajib divalidasi untuk item berkategori **Numerik**. Untuk Diskret/Narasi field ini disembunyikan/diabaikan.
- **BR-005** — Pada ambang Nilai Kritis berlaku: **batas bawah ≤ batas atas** (`critical_low ≤ critical_high`), DAN ambang kritis **membungkus** rentang normal bila rentang normal terisi: **`critical_low < nilai_normal_min`** dan **`critical_high > nilai_normal_max`**. Validasi dijalankan saat simpan; pelanggaran → tolak simpan. *(ditegaskan dari jawaban open question)*
- **BR-006** — Item berkategori **Diskret wajib** memiliki ≥2 pilihan hasil. Pemetaan tiap pilihan ke **LOINC Answer List bersifat OPSIONAL**, dan **wajib hanya untuk pemeriksaan yang dikirim ke SATUSEHAT**. *(jawaban open question)*
- **BR-007** — Pemeriksaan **nonaktif** disembunyikan dari dashboard aktif & tidak muncul pada order penunjang, namun **tetap tersimpan** pada history pemeriksaan (tidak boleh hard-delete bila sudah pernah dipakai).
- **BR-008** — Setiap perubahan data (tambah/edit/nonaktif) **wajib tercatat** di audit log (user, timestamp, before/after). *(impor = Phase 2)*
- **BR-009** — Pemetaan **KPTL wajib** terisi agar pemeriksaan dapat dikirim untuk kebutuhan klaim BPJS.
- **BR-010** — Field bersama (`unit`, `status_aktif`, `satuan`) **wajib mengikuti definisi kanonik** dari modul A3/A22 — tidak boleh mendefinisikan ulang. *(konsistensi lintas-PRD)*
- **BR-011** *(Phase 2)* — Saat impor massal, baris gagal validasi **tidak menggagalkan** seluruh batch; baris valid tetap disimpan, baris gagal dikembalikan dengan keterangan error.
- **BR-012** — **Kategori pemeriksaan** dan **jenis spesimen** pada Phase 1 adalah **input bebas (teks)** tanpa master data; konsistensi penamaan menjadi tanggung jawab pengisi. *(jawaban open question; master data = kandidat Phase berikutnya)*
- **BR-013** — Acuan rentang normal pada Phase 1 dibedakan **hanya per jenis kelamin** dengan pilihan **Semua / Laki-laki / Perempuan**; pembedaan per kelompok usia tidak termasuk Phase 1. *(jawaban open question)*

## 9. User Stories

- **US-001** — Sebagai *Petugas Laboratorium*, saya ingin **menambah & mengubah data pemeriksaan beserta itemnya** dari satu dashboard, agar seluruh modul memakai data yang sama. *(source: pola master data Control Panel)*
- **US-002** — Sebagai *Petugas Laboratorium*, saya ingin **memilih kode LOINC & Answer List dari dropdown terverifikasi**, agar pengiriman Observation ke SATUSEHAT valid tanpa salah ketik. *(Phase 1: dropdown hardcoded)*
- **US-003** — Sebagai *Petugas Klaim/Admin*, saya ingin **memetakan kode KPTL** per pemeriksaan, agar data klaim BPJS terkirim dengan kode pembiayaan yang benar.
- **US-004** — Sebagai *Petugas Laboratorium*, saya ingin **mengatur ambang Nilai Kritis bawah/atas** per item numerik dengan validasi terhadap rentang normal, agar modul Hasil Lab dapat menandai hasil kritis & memberi notifikasi dini ke dokter.
- **US-005** — Sebagai *Dokter/DPJP* (konsumen hilir), saya ingin **mendapat notifikasi otomatis** saat hasil pasien melewati ambang kritis, agar penanganan tidak terlambat. *(realisasi Phase 2 / modul Hasil Lab)*
- **US-006** — Sebagai *Petugas Laboratorium*, saya ingin **menentukan Kategori Hasil (Numerik/Diskret/Narasi)** dan daftar pilihan untuk hasil diskret, agar input hasil terstandar & tervalidasi.
- **US-007** — Sebagai *Admin*, saya ingin **menonaktifkan pemeriksaan usang**, agar tidak muncul di order tetapi history tetap tersimpan. *(BR-007)*
- **US-008** — Sebagai *Admin*, saya ingin **mendeteksi duplikat berdasarkan kode LIS** sebelum simpan, agar tidak ada data ganda. *(BR-001)*
- **US-009** *(Phase 2)* — Sebagai *Admin*, saya ingin **mengimpor & mengekspor data pemeriksaan (.xlsx/.csv)** dengan validasi per baris, agar setup awal & pemeliharaan massal cepat.
- **US-010** — Sebagai *Auditor/Supervisor*, saya ingin **melihat log perubahan data**, agar keakuratan data terjamin. *(BR-008)*
- **US-011** — Sebagai *Petugas Laboratorium*, saya ingin **mencari & memfilter pemeriksaan < 3 detik**, agar pengelolaan cepat.
- **US-012** — Sebagai *Petugas Laboratorium*, saya ingin **mengisi rentang normal berbeda per jenis kelamin (Semua/Laki-laki/Perempuan)**, agar acuan nilai normal sesuai karakteristik pasien. *(BR-013)*

## 10. Functional Requirements

| ID | Functional Requirement | Traceability |
|----|------------------------|--------------|
| **FR-001** | Dashboard menampilkan daftar pemeriksaan dengan pencarian (nama/kode LIS), filter kategori & status, sorting, info *last updated*. | US-001, US-011 |
| **FR-002** | Form Tambah/Edit pemeriksaan: data umum (nama, kode LIS, kategori [input bebas], spesimen [input bebas], unit, status aktif). | US-001, BR-012 |
| **FR-003** | Pemilihan **kode LOINC** dari **dropdown frontend** yang di-seed dari daftar terverifikasi SATUSEHAT (Phase 1, tanpa API live). | US-002, BR-002 |
| **FR-004** | Pemetaan **LOINC Answer List** untuk item diskret (map pilihan lokal → Answer List dari dropdown), **opsional**, wajib hanya bila pemeriksaan dikirim SATUSEHAT. | US-002, US-006, BR-006 |
| **FR-005** | Pemetaan **kode KPTL** per pemeriksaan. | US-003, BR-009 |
| **FR-006** | Pengelolaan **item/komponen** pemeriksaan (tambah/edit/hapus, min 1 item). | US-001, BR-003 |
| **FR-007** | Pemilihan **Kategori Hasil** per item: Numerik / Diskret / Narasi → menentukan field yang aktif. | US-006 |
| **FR-008** | Konfigurasi item Numerik: satuan (UCUM, lookup A22), rentang normal (opsional per jenis kelamin), **ambang Nilai Kritis bawah/atas** dengan validasi `critical_low < normal_min` & `critical_high > normal_max`. | US-004, US-012, BR-004, BR-005, BR-013 |
| **FR-009** | Konfigurasi item Diskret: daftar pilihan hasil (≥2); map Answer List opsional. | US-006, BR-006 |
| **FR-010** | Validasi **duplikasi berdasarkan kode LIS** saat simpan. | US-008, BR-001 |
| **FR-011** | Toggle **status aktif/nonaktif**; halaman daftar pemeriksaan nonaktif; data nonaktif tetap di history. | US-007, BR-007 |
| **FR-012** *(Phase 2)* | **Impor** (.xlsx/.csv) dengan template + validasi per baris + laporan baris gagal; **ekspor** seluruh/terfilter. | US-009, BR-011 |
| **FR-013** | **Audit log** seluruh perubahan (user, waktu, before/after). | US-010, BR-008 |
| **FR-014** | Menyediakan data terstruktur (kategori hasil + ambang kritis) yang dapat dibaca modul Hasil Laboratorium. | US-005, US-006 |
| **FR-015** | Validasi field bersama mengikuti definisi kanonik (unit, status_aktif, satuan). | BR-010 |
| **FR-016** | Field **acuan jenis kelamin** pada item numerik berupa pilihan **Semua / Laki-laki / Perempuan**; bila Laki-laki/Perempuan dipilih, rentang normal berlaku spesifik untuk jenis kelamin tsb. | US-012, BR-013 |

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Form Tambah/Edit Pemeriksaan — Data Umum (INPUT) — *FR-002, FR-003, FR-005*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_lis | Kode LIS | text | Ya | unik, alfanumerik maks 20 char | manual | Kunci deteksi duplikasi (BR-001) |
| kode_loinc | Kode LOINC | dropdown | Tidak | "Pilih Kode" | lookup/integrasi | opsional; validasi jika ada |
| nama_pemeriksaan | Nama Pemeriksaan | dropdown | Ya | dari daftar existing | lookup | BR-011; master list pemeriksaan |
| kategori_pemeriksaan | Kategori Pemeriksaan | text | Tidak | maks 50 char | input bebas (manual) | Phase 1 tanpa master data (BR-012) |

### 11.2 Form Item/Komponen Pemeriksaan (INPUT, repeatable ≥1) — *FR-006, FR-007, FR-008, FR-009, FR-016*
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_item | Nama Item/Komponen | text | Ya | maks 100 char | manual | mis. Hemoglobin, Leukosit |
| ref_jenis_kelamin | Jenis Kelamin | radio button | Tidak | Semua jenis kelamin / Laki-laki / Perempuan | enum, default **Semua** | rentang normal bisa beda per JK (BR-013); tanpa kelompok usia di Phase 1 |
| batas_usia | Batas Usia | Input Batas Atas dan batas Bawah | Tidak | Satuan Hari, Bulan, Tahun | manual | hanya Numerik |
| unit | Unit | Text | Ya | Unit | manual | bebas |
| nilai_normal_min | Batas Bawah Nilai Normal | number | Tidak | numerik | manual | hanya Numerik |
| nilai_normal_max | Batas Atas Nilai Normal | number | Tidak | numerik, ≥ min | manual | hanya Numerik |
| critical_low | Batas Bawah | number | Tidak | numerik; **< nilai_normal_min** (bila normal terisi) | manual | hanya Numerik; FR-008/BR-004/BR-005; nilai kritis ambang bawah |
| critical_high | Batas Atas | number | Tidak | numerik; **> nilai_normal_max** (bila normal terisi) & **≥ critical_low** | manual | hanya Numerik; BR-005; nilai kritis ambang atas |
| operator | Operator | text | Tidak | maks 50 char | manual | optional; deskripsi metode/operator |
| metode | Metode | text | Tidak | maks 255 char | manual | optional; deskripsi metode teknis pemeriksaan |
| pilihan_input | Pilihan Input | dropdown enum | Tidak | **Default** / **Input Pilihan** | enum, default **Default** | hanya aktif jika kategori_hasil = **Diskret**; BR-003 |
| daftar_pilihan | Daftar Inputan Hasil (jika Memilih Input Pilihan) | repeatable text | Tidak | maks 100 char per pilihan | user input | hanya tampil jika pilihan_input = **Input Pilihan**; contoh: Positif, Negatif atau Tinggi, Sedang, Rendah |

> Catatan validasi BR-005: bila pasangan rentang normal diisi, sistem menolak simpan jika `critical_low ≥ nilai_normal_min` atau `critical_high ≤ nilai_normal_max`. Bila item punya beberapa baris acuan per jenis kelamin, validasi diterapkan per baris acuan. [ASUMSI struktur multi-baris per jenis kelamin]


### 11.3 Dashboard / List Pemeriksaan (TAMPIL) — *FR-001*

#### 11.3.1 Filter & Search
| Elemen | Tipe | Fungsi | Catatan |
|--------|------|--------|---------|
| Filter Kategori Pemeriksaan | dropdown | filter list berdasarkan kategori_pemeriksaan | optional; "Pilih Kategori Pemeriksaan" |
| Cari Pemeriksaan | text input + search icon | search by kode_lis, nama_pemeriksaan | real-time atau on-click search icon |
| Refresh | icon button | reload data list | |
| Settings | icon button | konfigurasi kolom (future phase) | optional |

#### 11.3.2 Kolom Tabel List
| Kolom | Sumber Data | Format Tampilan | Sort | Filter | Catatan |
|-------|-------------|-----------------|------|--------|---------|
| Kode LIS | master_lab.kode_lis | text | Ya (A-Z) | search | |
| Kode LOINC | master_lab.kode_loinc | text | Tidak | Tidak | optional; jika kosong tampil "-" |
| Deskripsi | master_lab.keterangan | text (truncate max 50 char) | Tidak | Tidak | optional; hover tooltip jika > 50 char |
| Nama Pemeriksaan | master_lab.nama_pemeriksaan | text | Ya (A-Z) | search | |
| Kategori Pemeriksaan | master_lab.kategori_pemeriksaan | text/badge | Tidak | Ya (dropdown) | |
| Status Pemeriksaan | master_lab.status_aktif | toggle + badge (Aktif/Nonaktif) | Tidak | Ya | Aktif = green, Nonaktif = gray |
| Aksi | – | button HAPUS (merah) + EDIT (biru) | Tidak | Tidak | row action; ikon/text button |

#### 11.3.3 Pagination & Summary
| Elemen | Fungsi | Catatan |
|--------|--------|---------|
| Total Pemeriksaan Aktif | Menampilkan count data aktif | ringkasan di atas/bawah tabel (optional) |
| Pagination | navigasi halaman (1, 2, 3, ... ) | default page size = 10 rows; next/prev arrows |
| Total Records | "Menampilkan X dari Y pemeriksaan" | optional di bawah tabel |

### 11.7 Audit Log (TAMPIL) — *FR-013*
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit_log.timestamp | tanggal+jam | sort desc | |
| User | audit_log.user | text | filter | |
| Aksi | audit_log.action | badge (Tambah/Edit/Nonaktif) | filter | Impor = Phase 2 |
| Objek | audit_log.kode_lis + nama | text | search | |
| Perubahan | audit_log.diff | before → after | – | ringkas field berubah |

## 12. Non-Functional Requirements

- **NFR-001 (Performa)** — Pencarian/filter pemeriksaan menghasilkan ≤ 3 detik untuk dataset RS tipe C&D (≤ ±1.000 pemeriksaan). *(Metric 2)*
- **NFR-002 (Ketersediaan/Offline)** — Master data perlu dapat di-*cache* lokal agar order penunjang & Hasil Lab tetap berjalan saat internet tidak stabil. Daftar LOINC/Answer List Phase 1 di-seed hardcoded di frontend sehingga **tidak bergantung koneksi** saat input. [ASUMSI — kendala infrastruktur tipe C&D]
- **NFR-003 (Keamanan/RBAC)** — Akses tambah/edit/nonaktif dibatasi role (mis. Admin Master Data / Kepala Lab) sesuai modul A53 RBAC; user umum hanya baca.
- **NFR-004 (Auditability)** — Seluruh perubahan tercatat & tidak dapat dihapus (immutable log). *(BR-008)*
- **NFR-005 (Integritas Data)** — Pemeriksaan yang sudah dipakai (ada di history/order) tidak boleh *hard-delete*, hanya nonaktif. *(BR-007)*
- **NFR-006 (Interoperabilitas)** — Kode mengikuti standar: LOINC (system `http://loinc.org`), UCUM untuk satuan, KPTL untuk klaim. *(system URI Answer List & KPTL pada payload SATUSEHAT difinalisasi saat integrasi pengiriman — modul ini menyimpan kodenya saja)*
- **NFR-007 (Usability)** — Form mendukung pengisian banyak item per pemeriksaan tanpa reload; field kategori-hasil dinamis (menampilkan/menyembunyikan field sesuai tipe); dropdown LOINC/Answer List mendukung pencarian cepat (typeahead) di sisi frontend.
- **NFR-008 (Skalabilitas Impor)** *(Phase 2)* — Impor massal memproses ≥ 1.000 baris dengan laporan per-baris tanpa menggagalkan seluruh batch. *(BR-011)*
- **NFR-009 (Maintainability seed LOINC)** — Daftar LOINC/Answer List hardcoded Phase 1 harus terisolasi (mis. satu file konstanta/konfigurasi frontend) agar pembaruan/seed berikutnya mudah & terlacak versi. [ASUMSI implementasi]

## 13. Integrasi Eksternal

| Integrasi | Arah | Data | Catatan |
|-----------|------|------|---------|
| **SATUSEHAT — Terminology (LOINC)** | Seed/lookup lokal | Daftar kode LOINC laboratorium **terverifikasi** | **Phase 1: di-seed manual & hardcoded sebagai dropdown frontend** (bukan API live). Integrasi tarik dinamis = Phase 2. BR-002. |
| **SATUSEHAT — LOINC Answer List** | Seed/lookup lokal | Daftar Answer List untuk hasil diskret | **Phase 1: hardcoded dropdown**. Map pilihan hasil lokal → Answer List **opsional**, wajib hanya bila dikirim SATUSEHAT (FR-004, BR-006). |
| **SATUSEHAT — Observation** | Konsumsi (hilir) | Master ini menyediakan kode LOINC + Answer List saat modul Hasil Lab mengirim Observation | Pengiriman hasil = scope modul Hasil Lab, bukan modul ini. |
| **Klaim BPJS — KPTL** | Tarik/lookup | Kode Pembiayaan Tindakan & Layanan Kesehatan v1.6 | Pemetaan KPTL per pemeriksaan (FR-005, BR-009). |
| **Master Unit (A3)** | Lookup internal | `unit` (lab) | Field kanonik bersama. |
| **Master Satuan & Kemasan (A22)** | Lookup internal | `satuan` (UCUM) item numerik | Field kanonik bersama. |
| **Modul Hasil Laboratorium** | Sediakan (hilir) | Kategori hasil (tipe validasi input) + ambang Nilai Kritis | Flagging & notifikasi dokter (Phase 2). |
| **Modul Billing/Klaim/RME** | Sediakan (hilir) | Data pemeriksaan + KPTL | Single source of truth. |

> **Catatan Interoperabilitas**: pastikan setiap pemeriksaan/ item memiliki pasangan kode lokal (kode LIS) ↔ kode standar (LOINC) ↔ kode pembiayaan (KPTL). Untuk hasil diskret yang dikirim ke SATUSEHAT, tiap pilihan lokal harus punya pasangan Answer List agar Observation bertipe `valueCodeableConcept` valid; untuk numerik gunakan `valueQuantity` dengan UCUM; untuk narasi `valueString`. Pemetaan Answer List bersifat opsional bila pemeriksaan tidak dikirim ke SATUSEHAT. [ASUMSI pemetaan tipe value SATUSEHAT]

## Asumsi
- [ASUMSI] Modul belum punya BPMN sendiri; alur As-Is/To-Be & pola validasi/integrasi diturunkan dari analogi BPMN g-admisi-onsite-registration (duplicate detection, bridging integrasi) dan g-support-apotek-online-iter (validasi data & return response saat kirim ke sistem eksternal).
- [ASUMSI] Aktor pengelola = Petugas Laboratorium / Admin Master Data; konsumen hilir = modul Hasil Laboratorium & Dokter/DPJP.
- [KEPUTUSAN] Phase 1: daftar LOINC & Answer List di-seed manual dan di-hardcode sebagai dropdown di frontend (tanpa API live ke SATUSEHAT Terminology). Integrasi dinamis = Phase 2.
- [KEPUTUSAN] Relasi ambang Nilai Kritis terhadap rentang normal ditegaskan: critical_low < nilai_normal_min dan critical_high > nilai_normal_max (BR-005).
- [KEPUTUSAN] Pemetaan LOINC Answer List untuk hasil diskret bersifat opsional; wajib hanya untuk pemeriksaan yang dikirim ke SATUSEHAT (BR-006).
- [KEPUTUSAN] Kategori pemeriksaan & jenis spesimen pada Phase 1 = input bebas (teks), tanpa master data (BR-012).
- [KEPUTUSAN] Acuan rentang normal dibedakan hanya per jenis kelamin dengan pilihan Semua / Laki-laki / Perempuan; tanpa kelompok usia di Phase 1 (BR-013).
- [KEPUTUSAN] Impor/ekspor data pemeriksaan ditunda ke Phase 2 (FR-012, US-009, BR-011, NFR-008).
- [ASUMSI] Kendala infrastruktur RS tipe C&D → master data perlu cache lokal/offline (NFR-002); dropdown LOINC hardcoded mengurangi ketergantungan koneksi saat input.
- [ASUMSI] Field kanonik unit, status_aktif, keterangan, file_import, mode_import mengikuti definisi bersama lintas-PRD (A2/A3/A22) tanpa redefinisi.
- [ASUMSI] Notifikasi Nilai Kritis ke dokter & log read-back adalah Phase 2 (realisasi di modul Hasil Laboratorium); modul A14 hanya menyediakan konfigurasinya.
- [ASUMSI] Pemetaan tipe value SATUSEHAT: numerik → valueQuantity (UCUM), diskret → valueCodeableConcept (Answer List), narasi → valueString.

## Pertanyaan Terbuka
- [PARKIR — diabaikan untuk Phase 1] system URI / coding system resmi untuk LOINC Answer List & KPTL pada payload SATUSEHAT (difinalisasi saat modul pengiriman Observation). — NFR-006.
- [PARKIR — diabaikan untuk Phase 1] Apakah satu pemeriksaan bisa punya >1 KPTL (per tarif/penjamin) atau selalu 1:1?
- [PHASE 2] Format & kolom pasti template impor/ekspor (.xlsx/.csv) sesuai 'Template Export/Import Data Pemeriksaan Lab' — impor/ekspor ditunda ke Phase 2.
- Struktur penyimpanan rentang normal per jenis kelamin: satu baris dengan kolom L/P, atau baris acuan terpisah per jenis kelamin (Semua/Laki-laki/Perempuan)? — implikasi ke validasi BR-005 multi-baris. [PERLU KONFIRMASI implementasi]
- Kapan & bagaimana mekanisme pembaruan daftar LOINC/Answer List hardcoded (frekuensi seed ulang / proses rilis) sebelum migrasi ke API live Phase 2?