# PRD — Master Data / Integrasi BPJS — Tindakan

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A10); PRD A1 User, A2 Staff, A3 Unit, A13 Procedure (ICD-9-CM/SATUSEHAT), A20 Tipe Penjamin, A43 Tarif Kamar, Master Kelas (akan dibuat); Referensi BPJS VClaim, ICD-9-CM Procedure, Permenkes RME/SIMRS
**Versi:** 1.2 - Pengembangan: kode mapping pakai ICD-9-CM (1 kode boleh banyak tindakan); kelas dari Master Kelas; tanpa perhitungan klaim INA-CBG; harga obat/BHP snapshot; komposisi BHP/obat jadi acuan pengurangan stok
**Tanggal:** 2026-06-19

## 1. Overview / Brief Summary

Modul **Master Data Tindakan** (code A10, cluster Control Panel) mengelola seluruh data **jenis tindakan medis/pelayanan beserta tarifnya** yang berlaku di rumah sakit, sekaligus **memetakan (mapping) tindakan ke kode procedure ICD-9-CM** (tautan ke modul A13) untuk keperluan klaim BPJS dan interoperabilitas.

Modul jadi **sumber data utama** acuan tarif tindakan bagi proses operasional, administratif, dan keuangan: pendaftaran, rawat jalan, rawat inap, IGD, penunjang (Lab/Radiologi), farmasi, kasir/billing, dan klaim penjamin.

Lingkup data per tindakan: kode tindakan internal, nama tindakan, kelompok/kategori, unit penyelenggara, jenis tindakan, **kelas perawatan (lookup Master Kelas)**, **tarif jasa sarana**, **tarif jasa pelayanan yang dirinci per komponen jasa medis (dokter, perawat/paramedis, dan lainnya)**, **komponen BHP & obat** (untuk tindakan yang memakai bahan habis pakai/obat, mis. injeksi/vaksin) dengan **harga snapshot**, total tarif, masa berlaku tarif, status aktif, serta **mapping kode procedure ICD-9-CM** (modul A13).

Modul mendukung pengelolaan tarif berlapis: per **kelas perawatan** (dari Master Kelas), per **jenis penjamin** (lookup A20 Tipe Penjamin), serta tarif khusus sesuai kebijakan RS. **Komposisi BHP & obat per tindakan dipakai sebagai acuan pengurangan stok** di modul transaksi/Farmasi. Modul ini **tidak melakukan perhitungan klaim INA-CBG** — hanya menyediakan data. Cakupan untuk RS Tipe C & D — sederhana, dapat dioperasikan SDM IT terbatas.

## 2. Background

**Masalah saat ini (kondisi umum RS Tipe C & D):**
- Daftar tindakan & tarif tersebar di spreadsheet/manual per unit → tidak seragam, rawan beda angka antarunit.
- Komponen tarif (jasa sarana, jasa medis dokter/perawat, BHP, obat) sering digabung jadi 1 angka → tidak transparan, sulit audit & bagi jasa.
- Tindakan ber-BHP/obat (mis. injeksi, vaksin, hecting) tidak terinci bahannya → biaya BHP/obat sering tidak tertagih, salah hitung stok, dan tidak bisa jadi acuan pengurangan stok.
- Perubahan tarif (revisi kebijakan/regulasi) dilakukan manual di banyak tempat → lambat & tidak konsisten.
- Tindakan tidak terpetakan ke kode procedure ICD-9-CM (acuan klaim BPJS) → klaim sering salah/tertolak, verifikasi lama. [ASUMSI] (diturunkan dari pola integrasi BPJS pada `g-admisi-onsite-registration`: "Cek status kartu BPJS", "Penerbitan SEP" yang butuh referensi pelayanan tervalidasi).
- Billing pasien dihitung manual → selisih perhitungan & potensi kehilangan pendapatan.

**Kenapa modul ini perlu:** memusatkan data tindakan + tarif (rinci per komponen) + detail BHP/obat (harga snapshot) + mapping ICD-9-CM dalam satu master, sehingga billing otomatis akurat, klaim BPJS lancar, bagi jasa medis transparan, komposisi BHP/obat jadi acuan pengurangan stok, dan pembaruan tarif sekali ubah berlaku ke semua unit.

## 3. In Scope

### Scope Definition (yang dikerjakan)
- CRUD master tindakan: tambah, ubah, **aktif/nonaktif** (soft delete, bukan hapus permanen).
- Pengelolaan **tarif per tindakan** dengan **komponen rinci**: jasa sarana, jasa medis dokter, jasa medis perawat/paramedis, jasa medis lainnya, komponen BHP, komponen obat, total (auto-hitung) — per **kelas perawatan** (lookup **Master Kelas**) dan per **jenis penjamin** (A20).
- **Detail BHP & obat per tindakan**: daftar item BHP dan/atau obat standar yang dipakai tindakan (mis. vaksin + spuit + alkohol swab pada injeksi vaksin) beserta qty & satuan; **harga satuan diambil snapshot** saat penyusunan komposisi.
- **Komposisi BHP & obat sebagai acuan pengurangan stok**: modul ini menyediakan data baku item + qty per tindakan untuk dikonsumsi modul transaksi/Farmasi yang mengeksekusi pengurangan stok.
- **Masa berlaku tarif** (tanggal mulai–selesai) + riwayat versi tarif.
- **Mapping ke kode procedure ICD-9-CM** (lookup A13); **satu kode ICD-9-CM boleh dipetakan ke lebih dari satu tindakan internal**.
- Pencarian/filter, **import/export** massal (XLSX/CSV) untuk migrasi awal.
- Audit log perubahan data, tarif & detail BHP/obat (siapa, kapan, nilai lama→baru).

### Out Scope (yang TIDAK dikerjakan)
- Transaksi tindakan ke pasien (pencatatan tindakan di EMR/billing) → modul Pelayanan/EMR.
- Pengelolaan master item BHP & obat itu sendiri (data master, harga beli, stok) → modul **Inventory/Farmasi**; di sini hanya **direferensikan (lookup)** untuk menyusun komposisi tindakan. [PERLU KONFIRMASI master sumber item BHP & obat].
- **Eksekusi** pengurangan stok BHP/obat saat tindakan dilakukan → modul transaksi/Farmasi. Modul ini hanya **menyediakan komposisi (item + qty) sebagai acuan** pengurangan tersebut.
- **Perhitungan klaim INA-CBG/grouper → TIDAK dilakukan di modul ini**. Modul hanya menyediakan data tindakan/tarif/kode ICD-9-CM; perhitungan grouper ada di modul Klaim Penjamin.
- Penerbitan SEP → modul Admisi (`g-admisi-onsite-registration`).
- Pengelolaan **Master Kelas** itu sendiri → modul terpisah (akan dibuat); di sini hanya **lookup**.
- Master Tarif Kamar (A43), Procedure SATUSEHAT murni (A13), Item Lab/Radiologi (A14/A29) — hanya direferensikan, tidak dikelola di sini.

## 4. Goals and Metrics

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Keseragaman data tindakan & tarif | % unit pakai master terpusat | 100% [ASUMSI] |
| Akurasi billing otomatis | Selisih perhitungan billing vs tarif master | 0 selisih |
| Transparansi komponen tarif | % tindakan dengan komponen jasa terinci (sarana/medis) | ≥ 90% [ASUMSI] |
| Akurasi biaya & stok BHP/obat | % tindakan ber-BHP/obat yang punya detail komposisi | ≥ 95% [ASUMSI] |
| Kelancaran klaim BPJS | % tindakan ter-mapping kode ICD-9-CM | ≥ 95% [ASUMSI] |
| Efisiensi update tarif | Waktu terapkan revisi tarif ke semua unit | < 1 hari kerja [ASUMSI] |
| Auditabilitas | % perubahan tarif/komposisi tercatat di audit log | 100% |
| Kemudahan migrasi awal | Berhasil import data tindakan via XLSX | 1x sukses tanpa error fatal |

## 5. Related Feature

Dari List Fitur (cluster Control Panel) — fitur yang berkaitan langsung:

| Code | Menu | Hubungan |
|------|------|----------|
| A10 | Master Data / Integrasi BPJS > **Tindakan** | Modul ini |
| A13 | Master Data / Integrasi SATUSEHAT BPJS V1 V2 > Procedure | **Sumber kode procedure ICD-9-CM untuk mapping** |
| A3 | Master Data / Integrasi SATUSEHAT BPJS V2 > Unit | Lookup `unit` penyelenggara tindakan |
| A20 | Master Data > Tipe Penjamin | Lookup `jenis_penjamin` untuk tarif berlapis |
| A43 | Master Data > Tarif Kamar | Pola tarif per kelas (referensi konsistensi) |
| A23 | Master Data / Integrasi BPJS Terminology V2 > Spesialisasi & SMF | Acuan SMF penyelenggara [ASUMSI] |
| (Master Kelas) | Master Data > Kelas Perawatan | Lookup `kelas_perawatan` (modul akan dibuat) [PERLU KONFIRMASI code fitur] |
| (Inventory/Farmasi) | Master BHP & Master Obat/Formularium | Lookup item BHP & obat untuk komposisi + konsumen acuan pengurangan stok [PERLU KONFIRMASI code fitur] |
| A1 / A2 | User / Staff | Aktor pengelola & sumber identitas (audit log) |
| A53 | Admin > RBAC | Hak akses menu master tindakan |

_Catatan: nama menu A13/A3/A23 mengutip label asli di List Fitur. Penamaan modul ini (A10) diluruskan menjadi "Integrasi BPJS" — "V2" sebelumnya adalah salah ketik._

Modul konsumen (di luar Control Panel): Pendaftaran, RJ/RI/IGD, Lab, Radiologi, **Farmasi (komposisi → pengurangan stok)**, Kasir/Billing, Klaim Penjamin.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — modul belum punya BPMN sendiri]
1. Tiap unit punya daftar tindakan & tarif sendiri (spreadsheet/kertas); komponen tarif sering tergabung 1 angka.
2. Tindakan ber-BHP/obat tidak dirinci komposisinya → BHP/obat tidak tertagih, stok dikurangi manual/terpisah.
3. Tarif berubah → admin edit manual di tiap unit, sosialisasi lambat.
4. Saat pasien BPJS, petugas mencocokkan tindakan ke kode ICD-9-CM secara manual → rawan salah, klaim tertolak (pola dari `g-admisi-onsite-registration`: SEP butuh data pelayanan valid).
5. Billing dihitung manual oleh kasir.

### B. To-Be (kondisi diharapkan)
1. Admin Master Data buka menu **Master Tindakan** (Control Panel).
2. Tambah/ubah tindakan → isi data + tarif per **kelas (lookup Master Kelas)** & penjamin dengan **komponen rinci** (jasa sarana, jasa medis dokter, jasa medis perawat, jasa medis lain) → simpan (status aktif).
3. Untuk tindakan ber-BHP/obat, admin isi **detail komposisi BHP & obat** (item, qty, satuan) → sistem ambil **harga snapshot** dari master & hitung komponen BHP & obat.
4. Admin **mapping** kode internal ↔ **kode procedure ICD-9-CM** (lookup A13); satu kode ICD-9 boleh dipakai banyak tindakan.
5. Set **masa berlaku tarif**; tarif lama tersimpan sebagai riwayat.
6. Modul lain (billing, klaim, EMR) **otomatis** ambil tindakan & tarif aktif sesuai kelas/penjamin tanggal layanan; **modul Farmasi/transaksi ambil komposisi BHP/obat sebagai acuan pengurangan stok** → billing & klaim akurat, stok terkontrol (mendukung "Tampilkan riwayat pelayanan: Tindakan" pada `g-emr-patient-identity`). Perhitungan grouper INA-CBG **bukan** di sini.
7. Setiap perubahan tercatat di audit log (pola "Catat audit log: User, Timestamp" pada `g-emr-patient-identity`).

## 7. Main Flow / Mindmap

**Skenario 1 — Tambah Tindakan baru + tarif:**
1. Admin buka menu Master Tindakan → klik **Tambah**.
2. Isi data tindakan (kode, nama, kelompok, unit, jenis, SMF), set flag **pakai BHP/obat**.
3. Isi tarif: pilih **kelas perawatan (lookup Master Kelas)** & jenis penjamin → input **jasa sarana** + komponen **jasa medis (dokter, perawat/paramedis, lainnya)** → sistem auto-hitung jasa pelayanan & total.
4. Set masa berlaku tarif (tgl_mulai).
5. Simpan → validasi (kode unik, tarif ≥ 0) → data tersimpan status aktif → audit log.

**Skenario 1b — Isi detail BHP & obat (tindakan ber-BHP/obat, mis. injeksi vaksin):**
1. Pada tindakan dengan flag pakai BHP/obat = Ya → buka tab **Detail BHP & Obat**.
2. Tambah item **obat** (lookup master obat/formularium) → input qty & satuan (mis. Vaksin X 0,5 ml × 1).
3. Tambah item **BHP** (lookup master BHP) → input qty & satuan (mis. Spuit 1 ml × 1, Alkohol swab × 1).
4. Sistem ambil **harga snapshot** item dari master → hitung subtotal (qty × harga snapshot) → akumulasi jadi **komponen BHP** & **komponen obat** tarif.
5. Komposisi (item + qty) disimpan sebagai **acuan pengurangan stok** yang dikonsumsi modul transaksi/Farmasi.
6. Gateway: *flag pakai BHP/obat = Ya tapi detail kosong?* → peringatan lengkapi komposisi (BR-013).

**Skenario 2 — Mapping ICD-9-CM (tab Mapping BPJS):**
1. Admin klik tindakan → tab **Mapping BPJS**.
2. Sistem tampilkan **referensi kode procedure ICD-9-CM** (lookup master A13).
3. Gateway: *Kode ICD-9 ditemukan?* → Ya: pilih kode ICD-9-CM → simpan mapping. Tidak: tandai "belum ter-mapping" + notifikasi.
4. **Satu kode ICD-9-CM boleh dipetakan ke lebih dari satu tindakan internal** (BR-015) — tidak ada peringatan duplikasi.

**Skenario 3 — Revisi tarif:**
1. Admin pilih tindakan → **Ubah Tarif** → input komponen tarif baru + tgl_mulai baru.
2. Sistem set tarif lama `tgl_selesai = tgl_mulai_baru - 1` (riwayat) → tarif baru aktif → audit log. (Harga BHP/obat tetap snapshot saat penyusunan komposisi terkait.)

**Skenario 4 — Import massal:** unduh template → isi → upload → validasi baris (kode unik, tipe data) → tampil ringkasan sukses/gagal → commit data valid.

## 8. Business Rules

- **BR-001**: `kode_tindakan` internal wajib **unik**; tidak boleh duplikat.
- **BR-002**: `tarif_jasa_pelayanan` = `jasa_medis_dokter` + `jasa_medis_perawat` + `jasa_medis_lain` (auto-hitung). `total_tarif` = `tarif_jasa_sarana` + `tarif_jasa_pelayanan` + `komponen_bhp` + `komponen_obat` (auto-hitung, tidak diinput manual).
- **BR-003**: Semua komponen tarif (sarana, jasa medis, BHP, obat) harus **≥ 0**; total tidak boleh negatif.
- **BR-004**: Satu tindakan bisa punya **banyak baris tarif** unik per kombinasi (kelas_perawatan × jenis_penjamin × periode berlaku). `kelas_perawatan` wajib dipilih dari **Master Kelas** (lookup). Kombinasi sama dengan periode tumpang tindih → ditolak.
- **BR-005**: `tgl_selesai` tarif (jika diisi) harus ≥ `tgl_mulai`.
- **BR-006**: Hapus = **nonaktifkan** (soft delete). Tindakan yang sudah dipakai transaksi tidak boleh hard delete. (pola jaga integritas riwayat pelayanan `g-emr-patient-identity`).
- **BR-007**: Tindakan **nonaktif** tidak muncul sebagai pilihan di modul transaksi, tapi tetap valid untuk data historis.
- **BR-008**: Untuk klaim BPJS, tindakan **wajib ter-mapping kode procedure ICD-9-CM**; jika belum → tandai & beri peringatan saat dipakai pasien BPJS. (turunan kebutuhan SEP/klaim `g-admisi-onsite-registration`).
- **BR-009**: Kode procedure mengacu master A13 (ICD-9-CM); kode tidak valid ditolak.
- **BR-010**: Setiap create/update/nonaktif/ubah-tarif/ubah-detail-BHP-obat **wajib** tercatat di audit log (user, timestamp, nilai lama→baru).
- **BR-011**: Hanya role dengan hak akses (A53 RBAC) yang bisa mengelola master tindakan.
- **BR-012**: Item BHP & obat pada komposisi tindakan **wajib** dipilih dari master Inventory/Farmasi (lookup), tidak boleh teks bebas; item tidak valid/nonaktif ditolak. [PERLU KONFIRMASI master sumber].
- **BR-013**: Jika `pakai_bhp_obat` = Ya maka detail BHP/obat **tidak boleh kosong** (minimal 1 item); sebaliknya jika = Tidak, tab detail dikunci/kosong.
- **BR-014**: `komponen_bhp` = Σ(qty × harga_satuan_snapshot) seluruh item BHP; `komponen_obat` = Σ(qty × harga_satuan_snapshot) seluruh item obat (auto-hitung, read-only). **Harga satuan diambil snapshot** dari master saat penyusunan/penyimpanan komposisi dan tidak berubah otomatis bila harga master berubah; pembaruan harga snapshot dilakukan eksplisit oleh admin.
- **BR-015**: **Satu kode procedure ICD-9-CM boleh dipetakan ke lebih dari satu tindakan internal** (relasi many-to-one tindakan→kode). Tidak ada batasan unik pada `kode_icd9`.
- **BR-016**: **Komposisi BHP & obat (item + qty) jadi acuan pengurangan stok** bagi modul transaksi/Farmasi. Modul A10 hanya menyediakan data baku; eksekusi pengurangan stok di modul transaksi/Farmasi (out scope eksekusi).
- **BR-017**: Modul ini **tidak melakukan perhitungan/ grouping klaim INA-CBG**; hanya menyediakan data tindakan, tarif, dan kode ICD-9-CM untuk modul Klaim Penjamin.

## 9. User Stories

- **US-001**: Sebagai **Admin Master Data**, saya ingin menambah jenis tindakan baru beserta tarifnya, agar semua unit memakai data tindakan & tarif yang seragam. _(trace: To-Be langkah 2; analog "Tampilkan riwayat pelayanan: Tindakan" `g-emr-patient-identity`)_
- **US-002**: Sebagai Admin Master Data, saya ingin mengatur tarif berbeda per **kelas perawatan (dari Master Kelas)** dan jenis penjamin, agar perhitungan biaya sesuai ketentuan. _(trace: Skenario 1 langkah 3, BR-004)_
- **US-003**: Sebagai Admin Master Data, saya ingin memetakan tindakan ke **kode procedure ICD-9-CM**, agar klaim BPJS tidak tertolak. _(trace: Skenario 2; analog "Penerbitan SEP" `g-admisi-onsite-registration`)_
- **US-004**: Sebagai Admin Master Data, saya ingin merevisi tarif dengan masa berlaku, agar perubahan kebijakan tarif diterapkan serentak tanpa kehilangan riwayat. _(trace: Skenario 3)_
- **US-005**: Sebagai Admin Master Data, saya ingin mengimpor data tindakan secara massal dari file, agar migrasi awal cepat. _(trace: Skenario 4)_
- **US-006**: Sebagai **Verifikator BPJS/Manajemen**, saya ingin melihat tindakan yang belum ter-mapping ICD-9-CM, agar bisa segera dilengkapi sebelum klaim. _(trace: BR-008)_
- **US-007**: Sebagai **Kasir/Modul Billing**, saya ingin sistem otomatis mengambil tarif aktif sesuai kelas & penjamin, agar billing pasien akurat tanpa input manual. _(trace: To-Be langkah 6)_
- **US-008**: Sebagai Admin, saya ingin menonaktifkan tindakan yang tidak berlaku, agar tidak terpilih di transaksi baru tapi riwayat tetap utuh. _(trace: BR-006/BR-007)_
- **US-009**: Sebagai **Auditor/Manajemen**, saya ingin melihat riwayat perubahan tarif, agar transparansi pengelolaan tarif terjaga. _(trace: BR-010)_
- **US-010**: Sebagai Admin Master Data, saya ingin merinci **komponen jasa medis** (dokter, perawat/paramedis, lainnya) pada tarif tindakan, agar bagi jasa medis transparan dan dapat dihitung otomatis. _(trace: BR-002, Skenario 1 langkah 3)_
- **US-011**: Sebagai Admin Master Data, saya ingin mendefinisikan **detail BHP & obat** yang dipakai sebuah tindakan dengan **harga snapshot** (mis. injeksi vaksin: vaksin + spuit + alkohol swab), agar biaya BHP/obat ikut terhitung di tarif dan stabil terhadap perubahan harga master. _(trace: Skenario 1b, BR-013/BR-014)_
- **US-012**: Sebagai **Apoteker/Modul Farmasi**, saya ingin mengambil komposisi BHP & obat standar per tindakan, agar **pengurangan stok** saat tindakan mengacu data baku. _(trace: To-Be langkah 6, BR-016)_
- **US-013**: Sebagai Admin Master Data, saya ingin **satu kode ICD-9-CM dipetakan ke beberapa tindakan internal**, agar tindakan yang berbeda nama tapi satu kode procedure tetap valid untuk klaim. _(trace: BR-015, Skenario 2)_

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | Sistem menyediakan CRUD tindakan (tambah/ubah/nonaktif) dengan validasi BR-001..BR-003, termasuk flag `pakai_bhp_obat` | US-001, Skenario 1 |
| FR-002 | Sistem auto-hitung `tarif_jasa_pelayanan` (Σ jasa medis) dan `total_tarif` (sarana + pelayanan + BHP + obat), read-only | US-002/US-010, BR-002 |
| FR-003 | Sistem mendukung multi-baris tarif per (kelas × penjamin × periode) dengan cek tumpang-tindih; `kelas` via lookup Master Kelas | US-002, BR-004 |
| FR-004 | Sistem menyimpan masa berlaku tarif & mempertahankan riwayat versi tarif | US-004, BR-005, Skenario 3 |
| FR-005 | Sistem menyediakan referensi/lookup kode procedure ICD-9-CM dari master A13 sebagai bahan mapping | US-003, Skenario 2 |
| FR-006 | Sistem menyediakan mapping kode internal ↔ kode procedure ICD-9-CM (lookup A13); mendukung satu kode ICD-9 dipakai banyak tindakan (tanpa batasan unik) | US-003/US-013, BR-008/BR-009/BR-015 |
| FR-007 | Sistem menampilkan daftar/dashboard tindakan dengan filter (unit, kelompok, status, status mapping, pakai BHP/obat) | US-006, US-008 |
| FR-008 | Sistem menyediakan import/export massal XLSX/CSV dengan validasi per baris & ringkasan hasil | US-005, Skenario 4 |
| FR-009 | Sistem menyediakan API/penyedia data tarif aktif + komposisi BHP/obat untuk modul billing/klaim/farmasi (by tindakan, kelas, penjamin, tanggal) | US-007/US-012, To-Be 6 |
| FR-010 | Sistem mencatat audit log seluruh perubahan, termasuk komponen jasa & detail BHP/obat (user, timestamp, before/after) | US-009, BR-010 |
| FR-011 | Sistem membatasi akses menu via RBAC (A53) | BR-011 |
| FR-012 | Sistem menandai & memfilter tindakan yang belum ter-mapping ICD-9-CM | US-006, BR-008 |
| FR-013 | Sistem menyediakan input **komponen jasa medis** terpisah (dokter, perawat/paramedis, lainnya) pada tiap baris tarif | US-010, BR-002 |
| FR-014 | Sistem menyediakan sub-form **detail BHP & obat** per tindakan: tambah/hapus item via lookup master (qty, satuan), ambil **harga snapshot**, auto-hitung subtotal & komponen BHP/obat | US-011, BR-012/BR-013/BR-014 |
| FR-015 | Sistem memvalidasi: jika `pakai_bhp_obat`=Ya maka detail BHP/obat minimal 1 item sebelum simpan | US-011, BR-013 |
| FR-016 | Sistem menyediakan data **komposisi BHP & obat (item + qty)** sebagai acuan pengurangan stok bagi modul transaksi/Farmasi (read API/export) | US-012, BR-016 |
| FR-017 | Sistem menyediakan aksi **perbarui harga snapshot** komposisi secara eksplisit (per tindakan/massal) bila harga master berubah | US-011, BR-014 |

## 11. Data Requirements (Spesifikasi Field)

### A. Form Tambah/Edit Tindakan (INPUT) — trace FR-001

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_tindakan | Kode Tindakan | text | Ya | unik, maks 20 char, alfanumerik | manual/auto-suggest | BR-001 |
| nama_tindakan | Nama Tindakan | text | Ya | maks 150 char | manual | |
| kelompok | Kelompok/Kategori | dropdown | Ya | dari master kategori tindakan | lookup | [PERLU KONFIRMASI master kategori] |
| jenis_tindakan | Jenis Tindakan | dropdown | Ya | mis. medis/operatif/non-operatif/penunjang | enum | [PERLU KONFIRMASI daftar enum] |
| unit | Unit/Poli Penyelenggara | dropdown(lookup) | Ya | dari master Unit (A3) | lookup A3 | konsisten dgn A3 |
| smf | Spesialisasi/SMF | dropdown(lookup) | Tidak | dari master A23 | lookup A23 | [ASUMSI] |
| kode_icd9 | Kode Procedure (ICD-9-CM) | lookup | Tidak | valid di master A13 | lookup A13 | wajib utk klaim BPJS, BR-008/BR-009; diisi di tab Mapping |
| pakai_bhp_obat | Pakai BHP/Obat | boolean | Ya | ya/tidak | default tidak | Ya → wajib isi tab Detail BHP & Obat (BR-013) |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | konsisten lintas-PRD (A1/A2/A7) |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | |

### B. Sub-form Tarif Tindakan (INPUT, multi-baris) — trace FR-002/FR-003/FR-013

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kelas_perawatan | Kelas Perawatan | dropdown(lookup) | Ya | dari **Master Kelas** | lookup Master Kelas | item 3 — bukan enum lagi; [PERLU KONFIRMASI code fitur Master Kelas] |
| jenis_penjamin | Jenis Penjamin | dropdown(lookup) | Ya | dari master Tipe Penjamin (A20) | lookup A20 | mis. Umum/BPJS/Asuransi |
| tarif_jasa_sarana | Jasa Sarana | number | Ya | ≥ 0, format Rp | manual | BR-003 |
| jasa_medis_dokter | Jasa Medis Dokter | number | Ya | ≥ 0, format Rp | manual | komponen jasa pelayanan, BR-002/BR-003 |
| jasa_medis_perawat | Jasa Medis Perawat/Paramedis | number | Ya | ≥ 0, format Rp | manual | komponen jasa pelayanan |
| jasa_medis_lain | Jasa Medis Lainnya | number | Tidak | ≥ 0, format Rp | manual/default 0 | mis. anestesi/asisten [ASUMSI komponen] |
| tarif_jasa_pelayanan | Total Jasa Pelayanan | number | auto | = dokter+perawat+lain | auto-hitung | read-only, BR-002 |
| komponen_bhp | Komponen BHP | number | auto | = Σ subtotal BHP (tab D) | auto-hitung | read-only, BR-014 (snapshot) |
| komponen_obat | Komponen Obat | number | auto | = Σ subtotal obat (tab D) | auto-hitung | read-only, BR-014 (snapshot) |
| total_tarif | Total Tarif | number | auto | = sarana+pelayanan+BHP+obat | auto-hitung | read-only, BR-002 |
| tgl_mulai | Tanggal Mulai Berlaku | date | Ya | format tgl | manual/default hari ini | BR-005 |
| tgl_selesai | Tanggal Selesai Berlaku | date | Tidak | ≥ tgl_mulai | manual/auto saat revisi | kosong = berlaku terus, BR-005 |

### C. Tab Mapping BPJS (INPUT) — trace FR-005/FR-006 — **kode = ICD-9-CM**

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_icd9 | Kode Procedure ICD-9-CM | lookup | Tidak* | valid di master A13 | lookup A13 | *wajib utk klaim BPJS (BR-008); **1 kode boleh dipakai banyak tindakan, tanpa cek unik** (BR-015) |
| nama_icd9 | Nama Procedure (ICD-9-CM) | text | auto | read-only | autofill A13 | autofill dari kode_icd9 |
| status_mapping | Status Mapping | badge | auto | ter-mapping / belum | auto | FR-012 |

_Catatan item 1: kolom kode pada tab ini diubah dari kode tindakan BPJS menjadi **kode procedure ICD-9-CM** (sumber master A13). Item 2: relasi tindakan→kode bersifat many-to-one (banyak tindakan boleh satu kode ICD-9)._

### D. Tab Detail BHP & Obat (INPUT, multi-baris) — trace FR-014/FR-015/FR-016 — hanya aktif bila `pakai_bhp_obat`=Ya

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_item | Jenis Item | dropdown | Ya | BHP / Obat | enum | menentukan akumulasi ke komponen_bhp atau komponen_obat |
| item_id | Item (BHP/Obat) | lookup | Ya | dari master Inventory/Farmasi, item aktif | lookup master BHP/Obat | BR-012; teks bebas dilarang [PERLU KONFIRMASI code master] |
| nama_item | Nama Item | text | auto | read-only | autofill dari item_id | |
| qty | Jumlah | number | Ya | > 0 | manual | **dipakai sebagai acuan pengurangan stok** (BR-016) |
| satuan | Satuan | text | auto | dari master item | autofill | mis. pcs, ampul, ml |
| harga_satuan_snapshot | Harga Satuan (Snapshot) | number | auto | ≥ 0, format Rp | **snapshot dari master saat simpan** | read-only; item 5 — BR-014; tidak ikut berubah saat harga master berubah |
| subtotal | Subtotal | number | auto | = qty × harga_satuan_snapshot | auto-hitung | read-only |
| tgl_snapshot_harga | Tgl Snapshot Harga | date | auto | – | sistem saat simpan | info kapan harga diambil; dasar FR-017 |

_Contoh komposisi **Injeksi Vaksin**: Obat → Vaksin X (qty 1, ampul); BHP → Spuit 1 ml (qty 1, pcs), Alkohol Swab (qty 1, pcs), Sarung Tangan (qty 1, pasang). Σ obat → `komponen_obat`; Σ BHP → `komponen_bhp`. Daftar item + qty ini dikonsumsi modul Farmasi/transaksi untuk **pengurangan stok** (BR-016)._

### E. Form Import Massal (INPUT) — trace FR-008

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Tindakan | file | Ya | .xlsx/.csv, ≤ 10MB | upload | sesuai template |
| mode_import | Mode | dropdown | Ya | tambah baru / update existing | enum | [PERLU KONFIRMASI apakah detail BHP/obat ikut diimpor atau diisi manual] |

### F. Dashboard/List Tindakan (TAMPIL DATA) — trace FR-007/FR-012

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Tindakan Aktif | count tindakan where aktif | angka besar | – | kartu ringkasan |
| Belum Ter-mapping ICD-9 | count where status_mapping=belum | angka + badge merah | – | FR-012 |
| Kode | tindakan.kode_tindakan | text | sort/filter | |
| Nama Tindakan | tindakan.nama_tindakan | text | sort A-Z, search | |
| Kelompok | tindakan.kelompok | text | filter | |
| Unit | master Unit (A3) | text | filter | |
| BHP/Obat | tindakan.pakai_bhp_obat | badge (ya/tidak) | filter | tindakan ber-komposisi |
| Total Tarif (Umum/Kls) | tarif aktif | Rp | sort | tampil tarif default/kelas terpilih |
| Status Mapping ICD-9 | mapping | badge (hijau/abu) | filter | |
| Status | tindakan.status_aktif | badge aktif/nonaktif | filter | |

### G. Detail Riwayat Tarif (TAMPIL DATA) — trace FR-004/FR-010

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Periode | tgl_mulai–tgl_selesai | tanggal | sort desc | |
| Kelas / Penjamin | tarif baris (kelas dari Master Kelas) | text | filter | |
| Jasa Sarana | tarif_jasa_sarana | Rp | – | |
| Jasa Pelayanan (rinci) | jasa medis dokter/perawat/lain | Rp (breakdown) | – | tampil komponen, BR-002 |
| Komponen BHP / Obat | komponen_bhp, komponen_obat | Rp | – | dari tab Detail BHP & Obat (harga snapshot) |
| Total Tarif | total_tarif | Rp | – | |
| Diubah Oleh | audit_log.user (A2 Staff) | nama | – | konsisten field `nama` |
| Waktu | audit_log.timestamp | datetime | sort desc | BR-010 |

## 12. Non-Functional Requirements

- **NFR-001 (Kinerja)**: List/pencarian tindakan tampil < 3 detik untuk ≤ 10.000 baris (skala RS Tipe C/D). [ASUMSI]
- **NFR-002 (Ketersediaan/Offline)**: Master tindakan dapat dibaca dari cache lokal saat internet tidak stabil. [ASUMSI — kendala infrastruktur Tipe C/D]
- **NFR-003 (Keamanan & Akses)**: Akses tunduk RBAC (A53); hanya role berwenang dapat ubah tarif/komponen jasa/komposisi BHP-obat/mapping/harga snapshot.
- **NFR-004 (Auditabilitas)**: Semua perubahan data, tarif & komposisi BHP/obat (termasuk pembaruan harga snapshot) tersimpan permanen (immutable log) — BR-010.
- **NFR-005 (Integritas Data)**: Tindakan terpakai transaksi tidak dapat di-hard delete (BR-006); referensi antar-master (Unit/Procedure/Penjamin/Kelas/Item BHP-Obat) konsisten — item BHP/obat nonaktif tidak boleh ditambahkan ke komposisi baru (BR-012).
- **NFR-006 (Usability)**: Form sederhana, validasi inline, pesan error berbahasa Indonesia; tab Detail BHP & Obat hanya muncul bila relevan (pakai_bhp_obat=Ya) — cocok SDM IT terbatas.
- **NFR-007 (Interoperabilitas)**: Mapping mengikuti struktur kode ICD-9-CM (via A13); data siap dikonsumsi modul klaim, **tanpa perhitungan grouper INA-CBG di modul ini** (BR-017).
- **NFR-008 (Skalabilitas data)**: Mendukung versi tarif historis (termasuk komponen jasa & komposisi BHP/obat dengan harga snapshot) tanpa menghapus data lama.
- **NFR-009 (Konsistensi harga snapshot)**: Harga BHP/obat pada komposisi bersifat snapshot (BR-014); perubahan harga master tidak mengubah komposisi tersimpan kecuali admin jalankan perbarui snapshot (FR-017).

## 13. Integrasi Eksternal

| Integrasi | Arah | Tujuan | Catatan |
|-----------|------|--------|---------|
| **ICD-9-CM Procedure (via master A13)** | Lookup referensi kode | Mapping kode procedure → klaim BPJS | `kode_icd9` lookup ke A13; **1 kode boleh banyak tindakan** (BR-015); kode tidak valid ditolak (BR-009) |
| **BPJS (VClaim/SEP)** | Konsumsi (downstream) | Kode ICD-9 & tarif jadi acuan klaim/SEP | Modul ini sediakan data; penerbitan SEP & klaim di modul Admisi/Klaim [PERLU KONFIRMASI alur klaim] |
| **INA-CBG** | Konsumsi (downstream) | Data tindakan/kode jadi input grouper klaim | **Perhitungan grouper TIDAK di modul ini** (BR-017); hanya sediakan data |
| **Master Kelas (akan dibuat)** | Lookup | `kelas_perawatan` per baris tarif | item 3 — bukan enum; [PERLU KONFIRMASI code fitur Master Kelas] |
| **Master internal A3 (Unit), A20 (Tipe Penjamin), A23 (SMF), A13 (Procedure)** | Lookup | Konsistensi master data | Reuse definisi lintas-PRD |
| **Master Inventory/Farmasi (BHP & Obat/Formularium)** | Lookup + penyedia data | Komposisi BHP & obat (harga **snapshot**) + **acuan pengurangan stok** | Item & harga dari master; harga diambil snapshot (BR-014); komposisi (item+qty) dikonsumsi Farmasi/transaksi untuk pengurangan stok (BR-016) [PERLU KONFIRMASI code fitur] |
| **A2 Staff / A1 User** | Konsumsi identitas | Audit log (nama, NIP) | Pakai field kanonik `nama`, `nip` (konsisten lintas-PRD) |

**Integrasi dipakai bersama (sesuai konteks PRD terkait):** ICD-9-CM (A13); BPJS (VClaim/SEP); SATUSEHAT; INA-CBG (downstream, tanpa grouping di sini); Master Kelas; Inventory/Farmasi (item BHP & obat + pengurangan stok).

## Asumsi
- [ASUMSI] Modul belum punya BPMN sendiri; alur As-Is/To-Be diturunkan dari pola BPMN terkait (g-admisi-onsite-registration, g-emr-patient-identity).
- [ASUMSI] Penamaan 'BPJS V2' pada modul adalah salah ketik dan diluruskan menjadi 'BPJS'; nama tab 'Mapping BPJS' dipertahankan walau kodenya kini ICD-9-CM.
- [KEPUTUSAN] Kode pada tab Mapping BPJS = kode procedure ICD-9-CM (bukan kode tindakan BPJS).
- [KEPUTUSAN] Satu kode ICD-9-CM boleh dipetakan ke lebih dari satu tindakan internal (many-to-one).
- [KEPUTUSAN] `kelas_perawatan` diambil dari Master Kelas (lookup), bukan enum statis; modul Master Kelas akan dibuat terpisah.
- [KEPUTUSAN] Modul ini tidak melakukan perhitungan klaim INA-CBG; hanya menyediakan data.
- [KEPUTUSAN] Harga BHP/obat pada komposisi diambil snapshot saat penyusunan/penyimpanan dan tidak berubah otomatis mengikuti master.
- [KEPUTUSAN] Komposisi BHP/obat (item + qty) dipakai sebagai acuan pengurangan stok; eksekusi pengurangan di modul transaksi/Farmasi.
- [ASUMSI] Target metrik (95% mapping, 95% komposisi BHP/obat, <1 hari update, 100% terpusat) adalah usulan awal, perlu disepakati manajemen.
- [ASUMSI] Tarif berlapis per kelas perawatan × jenis penjamin × periode; struktur final menunggu konfirmasi.
- [ASUMSI] Jasa pelayanan dirinci jadi komponen jasa medis dokter, perawat/paramedis, dan lainnya; total auto-hitung.
- [ASUMSI] SMF/Spesialisasi (A23) opsional sebagai atribut penyelenggara tindakan.
- [ASUMSI] Kode procedure ICD-9-CM diambil via lookup ke master A13, bukan diinput bebas.

## Pertanyaan Terbuka
- Code fitur & struktur Master Kelas (sumber `kelas_perawatan`) — kapan tersedia dan apa atributnya?
- Daftar enum jenis_tindakan dan master kategori/kelompok tindakan — apa nilai bakunya?
- Sumber master item BHP & Obat (code fitur Inventory/Farmasi) untuk lookup komposisi & harga snapshot?
- Mekanisme pembaruan harga snapshot (FR-017): manual per tindakan, massal, atau ada notifikasi saat harga master berubah?
- Kontrak data antara komposisi A10 dan modul Farmasi/transaksi untuk pengurangan stok (BR-016): format, trigger, dan penanganan stok kurang?
- Komponen jasa medis final: cukup dokter + perawat/paramedis + lainnya, atau perlu pecah lagi (anestesi, asisten, operator)?
- Apakah detail BHP/obat ikut diimpor lewat template massal atau wajib diisi manual per tindakan?
- Apakah perlu menyimpan beberapa kode ICD-9-CM per satu tindakan (multi-kode), atau cukup satu kode per tindakan dengan kode boleh dipakai banyak tindakan?