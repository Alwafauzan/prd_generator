# PRD — Master Data Tarif Kamar

**Related Document:** Figma Design V1 (Master-Data, node 1596-63766); PRD v1 Affine (workspace a09e12e2...); PRD_MASTER_DATA_STANDAR_TARIF_KAMAR.pdf. Related feature: A15 Bangsal, A16 Kamar, A17 Bed, A20 Tipe Penjamin.
**Versi:** 1.2 - Revisi: jenis pelayanan & tipe ruangan digabung jadi 1 field kanonik (jenis_layanan_ruangan)
**Tanggal:** 2026-06-21

## 1. Overview / Brief Summary

Modul **Master Data Tarif Kamar** (A43, cluster Control Panel) mengelola **standar tarif akomodasi rawat inap** secara terpusat di SIMRS RS Tipe C & D. Jadi sumber data utama perhitungan biaya akomodasi pasien: tarif per hari berdasarkan **jenis layanan/ruangan**, **kelas perawatan**, dan **masa berlaku (tanggal efektif)**.

**[REVISI v1.2 — sumber: instruksi user]** "Jenis pelayanan" dan "tipe ruangan" **digabung jadi 1 field kanonik tunggal**: `jenis_layanan_ruangan` (label: **Jenis Layanan/Ruangan**). Sebelumnya dua istilah dipakai bergantian untuk konsep sama → kini **satu konsep, satu field, satu enum**. Tidak ada lagi 2 field terpisah maupun ambiguitas istilah. Kunci standar tarif = **jenis_layanan_ruangan + kelas (+ penjamin + periode)**.

**[REVISI v1.1]** Tarif bersifat **standar**, **tidak** diinput per bangsal/unit/instalasi. Setiap **bangsal otomatis memakai standar tarif** yang sesuai kombinasi **jenis_layanan_ruangan + kelas perawatan**-nya. Mapping bangsal → tarif terjadi di sisi konsumen (master Bangsal A15 / billing) lewat lookup standar. Field `bangsal_id`, `unit`, `instalasi_id` **dihapus** dari form tarif.

Cakupan nilai `jenis_layanan_ruangan` (sumber: lampiran PDF):
- **Reguler, Intensive Care, Isolasi** → tarif dibagi per kelas (VVIP / VIP / Kelas I / II / III).
- **Transit, VK (Verloskamer)** → tarif tunggal harian, **tanpa kelas/sub kelas**.

Petugas berwenang dapat menambah, mengubah, menonaktifkan standar tarif, serta menjadwalkan tarif berlaku per tanggal efektif (set harga dulu, berlaku kemudian). Menyimpan histori perubahan untuk audit.

[ASUMSI] RS Tipe C & D: jumlah jenis layanan/ruangan & kelas terbatas, perubahan tarif jarang (ikut SK direksi), SDM IT terbatas → standar tarif tunggal jauh lebih ringkas ketimbang per bangsal.

## 2. Background

**Masalah saat ini (sumber: lampiran PDF):**
- Perubahan tarif dilakukan di beberapa lokasi data berbeda → tidak konsisten antara master kamar, billing, dan laporan keuangan.
- Belum ada mekanisme terpusat mengelola standar tarif per kelas/jenis layanan.
- Risiko: salah penagihan, sulit audit, beban administrasi tinggi saat tarif berubah.

**[REVISI v1.2] Ambiguitas istilah "jenis pelayanan" vs "tipe ruangan":**
- Dua istilah dipakai bergantian di dokumen/awam padahal merujuk konsep sama (Reguler, IC, Isolasi, Transit, VK) → rawan salah paham saat input & lookup.
- Solusi: **konsolidasi jadi 1 field kanonik `jenis_layanan_ruangan`** dengan 1 enum tetap → input lebih sederhana, lookup billing tak ambigu, master konsisten.

**Kenapa tarif distandarkan (bukan per bangsal) [REVISI v1.1 — sumber: instruksi user]:**
- Tarif per bangsal = duplikasi nilai sama berulang → rawan beda & berat dirawat.
- Dengan **1 standar per (jenis_layanan_ruangan + kelas)**, ubah tarif cukup 1 entri → semua bangsal kelas itu ikut otomatis.
- Mengurangi salah input & mempercepat update saat SK direksi turun.

**Variasi struktur tarif:** tiap RS beda kelas/fasilitas/jenis layanan-ruangan. Tidak semua nilai ikut pola kelas — Transit & VK pakai tarif tunggal. Maka pengelolaan tetap **fleksibel tapi terstandar**.

[ASUMSI] Banyak RS Tipe C/D kelola tarif via spreadsheet manual per bangsal → modul gantikan dengan standar tarif digital tunggal.

## 3. In Scope

### Scope Definition (sumber: lampiran PDF + instruksi user)

**Phase 1:**
- Form **standar tarif kamar** berdasarkan **jenis_layanan_ruangan + kelas** (Reguler, Intensive Care, Isolasi).
- Form standar tarif untuk `jenis_layanan_ruangan` **Transit & VK** (tarif tunggal harian, tanpa kelas/sub kelas).
- **[REVISI v1.2]** Satu field kanonik `jenis_layanan_ruangan` menggantikan dua istilah "jenis pelayanan" & "tipe ruangan". Enum tunggal: Reguler / Intensive Care / Isolasi / Transit / VK.
- **Validasi conditional** field Kelas & Sub Kelas: wajib hanya untuk Reguler/Intensive Care/Isolasi; otomatis **disabled** untuk Transit & VK.
- **[REVISI v1.1]** Tarif **tidak** diinput per bangsal/unit/instalasi — field tsb dihapus dari form.
- Update tarif berkala sesuai SK direksi atas data yang sudah diinput.
- **Histori perubahan harga** untuk audit & pelaporan.
- [ASUMSI] CRUD standar tarif (tambah/ubah/nonaktif) + import massal CSV/XLSX + penjadwalan tanggal efektif.

**Phase 2:**
- Integrasi standar tarif dengan master kamar (A16) & **master Bangsal (A15)**: tiap bangsal otomatis ter-mapping ke standar tarif via atribut jenis_layanan_ruangan + kelasnya.
- Integrasi ke pelayanan & billing (termasuk perpindahan antar jenis layanan/ruangan: Transit → Rawat Inap, VK → Rawat Inap).
- Riwayat aktivitas CRUD.

### Out Scope (sumber: lampiran PDF)
1. Handling case pasien BPJS titip kelas (PRD terpisah).
2. Integrasi sistem asuransi eksternal (BPJS, asuransi swasta) di luar fungsi billing internal.
3. **[REVISI v1.1]** Penentuan atribut jenis_layanan_ruangan + kelas tiap bangsal = milik master Bangsal (A15), bukan modul ini. Modul ini hanya sediakan standar tarif untuk dipetakan.
- [ASUMSI] Perhitungan billing aktual & SEP bukan di modul ini (di modul Billing/Kasir/Admisi).

## 4. Goals and Metrics

### Goals (sumber: lampiran PDF + instruksi user)
- Atur & rencanakan **standar** harga tarif kamar sesuai **jenis_layanan_ruangan + kelas** untuk periode tertentu.
- **[REVISI v1.2]** Hilangkan ambiguitas istilah: 1 field kanonik `jenis_layanan_ruangan` → input & lookup konsisten, tak ada lagi "jenis pelayanan" vs "tipe ruangan" terpisah.
- **[REVISI v1.1]** Pastikan setiap bangsal memakai standar tarif yang sama sesuai jenis_layanan_ruangan + kelasnya → 1 sumber, nol duplikasi per bangsal.
- Dukung tarif seluruh jenis layanan/ruangan (Rawat Inap Reguler, Intensive Care, Isolasi, Transit, VK) dalam satu master data konsisten.
- Sinkronisasi standar tarif dengan master kamar hingga billing.
- Form adaptif: field Kelas & Sub Kelas hanya aktif jika jenis_layanan_ruangan memerlukan.
- User dapat set harga berlaku per tanggal efektif (set dulu, launching kemudian).

### Metrics (terukur)
| Metrik | Target | Catatan |
|--------|--------|---------|
| Standar tarif dikelola terpusat (1 sumber per jenis_layanan_ruangan+kelas) | 100% kombinasi aktif punya tarif valid | [ASUMSI] |
| Field jenis layanan/ruangan kanonik | 1 field tunggal (0 istilah ganda) | [REVISI v1.2] |
| Duplikasi tarif per bangsal | 0 (tarif tak lagi per bangsal) | [REVISI v1.1] |
| Konsistensi tarif standar vs billing | 0 selisih saat audit | [PERLU KONFIRMASI] target audit |
| Waktu update 1 standar tarif | < 2 menit/entri (berlaku ke semua bangsal terkait) | [ASUMSI] |
| Histori perubahan terekam | 100% perubahan ada jejak (user + waktu) | wajib audit |
| Error penagihan akomodasi akibat tarif salah | turun signifikan vs baseline | [PERLU KONFIRMASI] baseline |

## 5. Related Feature

Fitur terkait cluster **Control Panel** (List Fitur MVP):

| Code | Menu | Relasi |
|------|------|--------|
| A15 | Master Data > Bangsal | **[REVISI v1.1]** Bangsal punya atribut jenis_layanan_ruangan + kelas → otomatis memetakan ke standar tarif modul ini. Bangsal **bukan** lagi field di master tarif. |
| A16 | Master Data > Kamar | Standar tarif dipakai per kamar via kelas & jenis_layanan_ruangan kamar |
| A17 | Master Data > Bed | Bed di bawah kamar; akomodasi dihitung per bed/kamar |
| A20 | Master Data > Tipe Penjamin | Tarif berbeda per kategori penjamin (umum/perusahaan/asuransi/JKN) |

**[REVISI v1.1]** A19 Instalasi & A3 Unit **dihapus** dari relasi — field instalasi & unit tak lagi dipakai di master tarif.

**[REVISI v1.2]** Master Bangsal (A15), Kamar (A16) & modul konsumen harus pakai **enum kanonik `jenis_layanan_ruangan` yang sama** agar lookup tarif cocok. [PERLU KONFIRMASI] nama field & enum di A15/A16 diselaraskan ke kanonik ini.

Integrasi lintas modul (sumber: draft user): Admisi Rawat Inap, SPRI, Manajemen Bed, Kasir, Billing, Penjamin, Pelaporan Keuangan — konsumen standar tarif dari master ini.

[ASUMSI] Modul A43 = penyedia standar tarif (master), modul lain = konsumen yang memetakan via jenis_layanan_ruangan + kelas.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan, tak ada BPMN khusus]
1. Tarif kamar dicatat di spreadsheet/dokumen terpisah, sering per bangsal/unit → nilai sama diulang.
2. Istilah "jenis pelayanan" & "tipe ruangan" dipakai bergantian → input tak konsisten.
3. Saat SK direksi ubah tarif, petugas update manual di banyak baris/tempat → rawan beda.
4. Billing rawat inap pakai tarif yang kadang belum sinkron → salah tagih.
5. Tidak ada jejak siapa ubah & kapan → audit sulit.

### B. To-Be (kondisi diharapkan) [REVISI v1.1 + v1.2]
1. Admin Tarif buka menu Control Panel > Master Data > Tarif Kamar.
2. Tambah/ubah **standar tarif**: pilih **Jenis Layanan/Ruangan** (`jenis_layanan_ruangan`, 1 field) → sistem aktif/nonaktifkan field Kelas & Sub Kelas (conditional).
3. Isi tarif akomodasi/hari + komponen tarif + **tanggal efektif** + (opsional) kategori penjamin. **Tanpa** input bangsal/unit/instalasi.
4. Sistem validasi (tarif > 0, tidak duplikat jenis_layanan_ruangan+kelas+penjamin+periode) → simpan → status aktif.
5. Histori perubahan otomatis terekam (user + waktu + nilai lama/baru).
6. Setiap **bangsal** (A15) yang punya jenis_layanan_ruangan + kelas tertentu **otomatis mewarisi** standar tarif yang cocok. Modul Billing/Kasir/Admisi ambil tarif berlaku via lookup (jenis_layanan_ruangan + kelas + tanggal efektif).

[ASUMSI] Pola alur master data (CRUD + import + dashboard) diturunkan dari BPMN backoffice-inventory & master data lain (analogi).

## 7. Main Flow / Mindmap

### Skenario 1 — Tambah Standar Tarif (jenis layanan/ruangan berkelas)
1. Admin buka menu Tarif Kamar → klik **Tambah**.
2. Pilih **Jenis Layanan/Ruangan** (`jenis_layanan_ruangan`) = Reguler/Intensive Care/Isolasi → field Kelas & Sub Kelas **aktif (wajib)**.
3. Isi kelas perawatan, tarif/hari, komponen tarif, tanggal efektif, penjamin (opsional), keterangan. **[REVISI v1.1]** Tidak ada input bangsal/unit/instalasi.
4. Sistem cek duplikat (jenis_layanan_ruangan+kelas+penjamin+periode tumpang tindih). Gateway: **Duplikat?** Ya → tolak/konfirmasi; Tidak → simpan.
5. Simpan → status aktif → histori terekam → semua bangsal kelas tsb otomatis pakai tarif ini.

### Skenario 2 — Tambah Standar Tarif (Transit / VK)
1. Admin klik **Tambah** → pilih Jenis Layanan/Ruangan = Transit / VK.
2. Field Kelas & Sub Kelas **otomatis disabled** (tarif tunggal).
3. Isi tarif tunggal harian + tanggal efektif + keterangan → validasi → simpan.

### Skenario 3 — Update / Penjadwalan Tarif
1. Admin pilih standar tarif existing → **Ubah** atau **Tambah versi baru** dengan tanggal efektif mendatang.
2. Gateway: **Tanggal efektif > hari ini?** Ya → tarif terjadwal (belum berlaku); Tidak → berlaku saat aktif.
3. Simpan → histori catat nilai lama → baru → seluruh bangsal terkait ikut pada tanggal efektif.

### Skenario 4 — Import Massal
1. Admin unduh template → isi → unggah file (.csv/.xlsx) → pilih mode (tambah / tambah+update).
2. Sistem validasi baris (termasuk nilai `jenis_layanan_ruangan` harus sesuai enum kanonik) → tampilkan ringkasan (sukses/gagal) → konfirmasi → simpan.

### Skenario 5 — Nonaktifkan Tarif
1. Admin set `status_aktif` = nonaktif → tarif tak dipakai transaksi baru → histori terekam.

[ASUMSI] Semua skenario diturunkan analogi BPMN master data; tak ada BPMN A43 spesifik.

## 8. Business Rules

- **BR-001** (Conditional field): Jika `jenis_layanan_ruangan` ∈ {Reguler, Intensive Care, Isolasi} → field **Kelas** & **Sub Kelas wajib** & aktif. Jika ∈ {Transit, VK} → kedua field **disabled & dikosongkan** (tarif tunggal). (Sumber: lampiran PDF) → trace Skenario 1 & 2.
- **BR-002** (Tarif valid): `tarif_per_hari` harus > 0 (number, tanpa desimal negatif). → trace Skenario 1.
- **BR-003** (Anti-duplikat) **[REVISI v1.1]**: Tidak boleh ada 2 standar tarif aktif dengan kombinasi sama (**jenis_layanan_ruangan + kelas + penjamin + periode efektif tumpang tindih**). Bangsal/unit/instalasi **bukan** bagian kunci. → trace gateway "Duplikat?".
- **BR-004** (Tanggal efektif): Tarif berlaku mulai `tgl_efektif`. Tarif `tgl_efektif > hari ini` = terjadwal, belum dipakai billing. → trace Skenario 3.
- **BR-005** (Histori wajib): Setiap create/update/nonaktif WAJIB rekam jejak (user, waktu, nilai lama/baru). → trace semua skenario.
- **BR-006** (Hak akses): Hanya role dengan hak Master Tarif (mis. Admin/Keuangan) boleh ubah tarif. [ASUMSI] selaras RBAC (A53).
- **BR-007** (Nonaktif ≠ hapus): Standar tarif yang pernah dipakai transaksi tidak boleh dihapus permanen, hanya dinonaktifkan (jaga integritas billing histori). [ASUMSI].
- **BR-008** (Mapping bangsal → standar) **[REVISI v1.1]**: Setiap bangsal (A15) memakai standar tarif yang cocok dengan **atribut jenis_layanan_ruangan + kelas perawatan**-nya. Bila bangsal punya kombinasi yang belum ada standar tarif aktifnya → flag/peringatan ke admin (tarif tak ditemukan). [PERLU KONFIRMASI] mekanisme & lokasi mapping (di A15 atau service A43).
- **BR-009** (Field kanonik tunggal) **[REVISI v1.2]**: "jenis pelayanan" & "tipe ruangan" = **satu field** `jenis_layanan_ruangan` dengan enum tetap {Reguler, Intensive Care, Isolasi, Transit, VK}. Modul konsumen (A15/A16/Billing) wajib pakai enum & nama field yang sama untuk lookup. → trace BR-001, BR-003, FR-002, FR-009.

## 9. User Stories

- **US-001** — Sebagai **Admin Tarif/Keuangan**, saya ingin menambah **standar** tarif kamar per jenis layanan/ruangan & kelas, agar semua bangsal kelas tsb pakai tarif sama & konsisten. (trace Skenario 1) **[REVISI v1.1]**
- **US-002** — Sebagai Admin Tarif, saya ingin field Kelas/Sub Kelas otomatis nonaktif untuk Transit & VK, agar input tarif tunggal tetap sederhana. (trace BR-001, Skenario 2)
- **US-003** — Sebagai Admin Tarif, saya ingin menjadwalkan tarif berlaku per tanggal efektif, agar bisa set harga sebelum tanggal launching. (trace BR-004, Skenario 3)
- **US-004** — Sebagai Auditor/Manajemen, saya ingin melihat histori perubahan tarif (siapa, kapan, nilai lama/baru), agar audit & evaluasi mudah. (trace BR-005)
- **US-005** — Sebagai Admin Tarif, saya ingin import massal standar tarif via CSV/XLSX, agar input awal/banyak perubahan cepat. (trace Skenario 4)
- **US-006** — Sebagai Admin Tarif, saya ingin menonaktifkan tarif lama tanpa menghapus, agar transaksi historis tetap valid. (trace BR-007, Skenario 5)
- **US-007** — Sebagai Kasir/Petugas Billing, saya ingin sistem otomatis ambil standar tarif berlaku (sesuai jenis_layanan_ruangan + kelas bangsal pasien) saat hitung akomodasi, agar tak salah tagih. (trace To-Be #6) **[REVISI v1.1]**
- **US-008** — Sebagai Manajemen, saya ingin melihat daftar standar tarif aktif per jenis layanan/ruangan & kelas, agar bisa simulasi & evaluasi pendapatan rawat inap. (trace dashboard)
- **US-009** — Sebagai Admin Bangsal, saya ingin bangsal otomatis mewarisi standar tarif sesuai jenis_layanan_ruangan + kelasnya tanpa input tarif per bangsal, agar bebas duplikasi & cepat dirawat. (trace BR-008) **[REVISI v1.1]**
- **US-010** — Sebagai Admin Tarif, saya ingin satu field **Jenis Layanan/Ruangan** (bukan dua istilah terpisah), agar input tidak membingungkan & lookup billing pasti cocok. (trace BR-009) **[REVISI v1.2]**

## 10. Functional Requirements

- **FR-001** CRUD **standar tarif** kamar (tambah/lihat/ubah/nonaktif), keyed by jenis_layanan_ruangan + kelas (+ penjamin + periode). **[REVISI v1.1]** tanpa field bangsal/unit/instalasi. (US-001, US-006)
- **FR-002** Conditional rendering field Kelas & Sub Kelas berdasarkan `jenis_layanan_ruangan` (aktif untuk Reguler/IC/Isolasi; disabled untuk Transit/VK). (US-002, BR-001)
- **FR-003** Validasi tarif: tarif > 0, tanggal efektif valid, cek anti-duplikat kombinasi (jenis_layanan_ruangan+kelas+penjamin+periode). (BR-002, BR-003)
- **FR-004** Penjadwalan tarif via `tgl_efektif`; tampilkan status (Aktif / Terjadwal / Nonaktif). (US-003, BR-004)
- **FR-005** Histori perubahan tarif otomatis (user, timestamp, nilai lama→baru), telusur per tarif. (US-004, BR-005)
- **FR-006** Import massal standar tarif (.csv/.xlsx) + unduh template + mode tambah/tambah+update + ringkasan validasi. **[REVISI v1.1]** template tanpa kolom bangsal/unit/instalasi; **[REVISI v1.2]** kolom tunggal `jenis_layanan_ruangan` (validasi terhadap enum kanonik). (US-005)
- **FR-007** Dukungan tarif per kategori penjamin (umum/perusahaan/asuransi/JKN) — opsional per baris tarif. (sumber: draft user) [PERLU KONFIRMASI] kedalaman di MVP.
- **FR-008** Dashboard/list standar tarif: filter (jenis_layanan_ruangan, kelas, penjamin, status), sort, ringkasan jumlah tarif aktif. (US-008)
- **FR-009** Penyediaan standar tarif berlaku (lookup by **jenis_layanan_ruangan + kelas + tanggal + penjamin**) untuk dikonsumsi modul Billing/Kasir/Admisi/Bangsal. **[REVISI v1.1]** mapping bangsal→tarif via atribut bangsal. (US-007, US-009) [ASUMSI] via API/service internal.
- **FR-010** Kontrol akses berbasis role untuk operasi ubah tarif. (BR-006) [ASUMSI] selaras A53 RBAC.
- **FR-011** **[REVISI v1.1]** Deteksi gap mapping: identifikasi kombinasi jenis_layanan_ruangan + kelas (dari bangsal aktif) yang belum punya standar tarif aktif → tampilkan peringatan ke admin. (US-009, BR-008) [PERLU KONFIRMASI] lokasi implementasi (A43 atau A15).
- **FR-012** **[REVISI v1.2]** Field tunggal `jenis_layanan_ruangan` (dropdown, enum kanonik {Reguler, Intensive Care, Isolasi, Transit, VK}) menggantikan dua field/istilah terpisah di seluruh form, import, list, lookup, & histori. (US-010, BR-009)

## 11. Data Requirements (Spesifikasi Field)

### A. Form Tambah/Edit Standar Tarif Kamar (INPUT) — trace FR-001, FR-002, FR-003, FR-004, FR-012

**[REVISI v1.2]** `jenis_pelayanan` & istilah "tipe ruangan" **digabung** jadi 1 field kanonik **`jenis_layanan_ruangan`**.
**[REVISI v1.1]** Field `bangsal_id`, `unit`, `instalasi_id` **DIHAPUS**.

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_tarif | Kode Tarif | text | Ya | unik, maks 20 char | auto-generate / manual | tidak boleh duplikat |
| jenis_layanan_ruangan | Jenis Layanan/Ruangan | dropdown | Ya | enum kanonik: Reguler / Intensive Care / Isolasi / Transit / VK | enum | **[REVISI v1.2]** 1 field gabungan (eks "jenis pelayanan" + "tipe ruangan"). Penentu standar tarif & conditional Kelas (BR-001, BR-009). Modul konsumen wajib pakai enum sama |
| kelas_perawatan | Kelas Perawatan | dropdown | Kondisional | enum: VVIP/VIP/Kelas 1/2/3 | manual | **wajib** jika Reguler/IC/Isolasi; disabled jika Transit/VK. Bersama jenis_layanan_ruangan = kunci standar tarif. [PERLU KONFIRMASI] tambah VVIP di enum kanonik (kanonik kini: Kelas 1/2/3/VIP) |
| sub_kelas | Sub Kelas | dropdown | Kondisional | enum sesuai RS | manual | sama aturan kelas_perawatan; disabled Transit/VK |
| tarif_per_hari | Tarif Akomodasi/Hari | number | Ya | > 0, format Rp, integer | manual | BR-002 |
| komponen_tarif | Komponen Tarif | text/list | Tidak | maks 255 char/komponen | manual | rincian komponen (jasa sarana, akomodasi) [PERLU KONFIRMASI] struktur detail |
| tipe_penjamin_id | Kategori Penjamin | dropdown(lookup) | Tidak | dari master Tipe Penjamin (A20) | lookup A20 / default Umum | FR-007 |
| tgl_efektif | Tanggal Efektif Mulai | date | Ya | tanggal valid; boleh > hari ini | manual | BR-004; terjadwal jika > hari ini |
| tgl_berakhir | Tanggal Berakhir | date | Tidak | >= tgl_efektif | manual | kosong = berlaku s/d diganti |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | field kanonik |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik (mis. No. SK direksi) |

> **Catatan konsolidasi [REVISI v1.2]:** field lama `jenis_pelayanan` di-rename/satukan jadi `jenis_layanan_ruangan`. Tidak ada field `tipe_ruangan` terpisah. Migrasi data: nilai existing dipetakan 1:1 ke enum kanonik.
> **Catatan penghapusan [REVISI v1.1]:** `bangsal_id` (A15), `unit` (A3), `instalasi_id` (A19) tidak lagi diinput; pemetaan bangsal → standar tarif via atribut bangsal saat lookup (FR-009, BR-008).

### B. Form Import Massal Standar Tarif (INPUT) — trace FR-006, FR-012

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Tarif | file | Ya | .csv/.xlsx, sesuai template | manual upload | template kolom tunggal `jenis_layanan_ruangan`; tanpa kolom bangsal/unit/instalasi [REVISI v1.1/v1.2] |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | field kanonik |

### C. Dashboard / List Standar Tarif Kamar (TAMPIL) — trace FR-008

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Tarif Aktif | count tarif where status_aktif | angka besar | – | kartu ringkasan |
| Kode Tarif | tarif.kode_tarif | text | sort | |
| Jenis Layanan/Ruangan | tarif.jenis_layanan_ruangan | badge | filter | **[REVISI v1.2]** 1 kolom gabungan |
| Kelas | tarif.kelas_perawatan | text / "-" untuk Transit/VK | filter | |
| Tarif/Hari | tarif.tarif_per_hari | mata uang Rp | sort | |
| Penjamin | master Tipe Penjamin (A20) | text | filter | default Umum |
| Tgl Efektif | tarif.tgl_efektif | tanggal | sort (default terbaru) | |
| Status | tarif.status_aktif + tgl_efektif | badge: Aktif / Terjadwal / Nonaktif | filter | terjadwal jika tgl_efektif>hari ini |

### D. Histori Perubahan Tarif (TAMPIL) — trace FR-005, BR-005

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | log.timestamp | tanggal+jam | sort (default terbaru) | |
| User | log.user (master User A1) | text | filter | siapa mengubah |
| Aksi | log.action | badge: Tambah/Ubah/Nonaktif | filter | |
| Field Berubah | log.field | text | – | |
| Nilai Lama → Baru | log.old → log.new | text | – | utk tarif format Rp |

### E. Peringatan Gap Mapping (TAMPIL) — trace FR-011, BR-008 [REVISI v1.1]

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Jenis Layanan/Ruangan | bangsal aktif (A15) tanpa standar tarif cocok | text | filter | kombinasi belum bertarif |
| Kelas | bangsal aktif (A15) | text | filter | |
| Jumlah Bangsal Terdampak | count bangsal | angka | sort | bangsal yang belum bisa lookup tarif |

[PERLU KONFIRMASI] enum kelas: kanonik = Kelas 1/2/3/VIP; lampiran sebut VVIP juga → perlu selaraskan master.

## 12. Non-Functional Requirements

- **NFR-001** (Performa): Load list tarif & dashboard < 3 detik untuk data tipikal RS Tipe C/D. **[REVISI v1.1]** standar tarif jauh lebih sedikit baris. [ASUMSI] << ~200 baris tarif.
- **NFR-002** (Integritas data): Standar tarif yang sudah dipakai transaksi tidak boleh berubah retroaktif; perubahan = versi baru. (BR-007)
- **NFR-003** (Auditability): Histori perubahan immutable, permanen, dapat diekspor untuk audit. (BR-005)
- **NFR-004** (Keamanan/akses): Operasi ubah tarif dibatasi role berhak (RBAC A53); semua aksi terlog. (BR-006)
- **NFR-005** (Usability): Form adaptif & sederhana; conditional field jelas; pesan validasi Bahasa Indonesia. **[REVISI v1.2]** satu field Jenis Layanan/Ruangan menghilangkan kebingungan istilah ganda; penghapusan field bangsal/unit/instalasi mempersingkat form.
- **NFR-006** (Reliabilitas/offline): [ASUMSI] Master data jarang berubah → cache lokal standar tarif berlaku agar billing tetap jalan saat internet tidak stabil; sinkron saat online. [PERLU KONFIRMASI] kebutuhan offline.
- **NFR-007** (Konsistensi): Standar tarif = single source of truth; modul konsumen wajib ambil dari service A43 via lookup jenis_layanan_ruangan + kelas, tidak simpan tarif sendiri & tidak per bangsal.
- **NFR-008** (Konsistensi semantik) **[REVISI v1.2]**: Enum & nama field `jenis_layanan_ruangan` harus identik lintas modul (A43/A15/A16/Billing) agar lookup tarif tak gagal. Perubahan enum = perubahan terkontrol & tersinkron. (BR-009)

## 13. Integrasi Eksternal

Modul ini **master data internal** — integrasi utamanya **antar-modul SIMRS**, bukan layanan eksternal (BPJS/SATUSEHAT). (Sumber: Out Scope lampiran.)

| Integrasi | Arah | Tujuan | Catatan |
|-----------|------|--------|---------|
| Master Bangsal (A15) | sediakan standar + terima atribut | Bangsal mapping ke standar tarif via jenis_layanan_ruangan + kelas | **[REVISI v1.1]** inti perubahan; Phase 2. **[REVISI v1.2]** enum field harus sama |
| Master Kamar (A16) / Bed (A17) | konsumsi & sinkron | Kelas & jenis_layanan_ruangan konsisten | Phase 2 |
| Master Tipe Penjamin (A20) | lookup | Tarif per kategori penjamin | FR-007 |
| Billing & Kasir | sediakan tarif | Hitung akomodasi otomatis (lama hari × standar tarif berlaku, by jenis_layanan_ruangan+kelas bangsal pasien) | FR-009 |
| Admisi Rawat Inap / SPRI / Manajemen Bed | sediakan tarif | Estimasi biaya saat admisi/pindah kamar | sumber: draft user |
| Pelaporan Keuangan | sediakan data | Analisis pendapatan, simulasi tarif, audit | sumber: draft user |
| RBAC (A53) | konsumsi | Kontrol hak akses ubah tarif | BR-006 |

**[REVISI v1.1]** Master Instalasi (A19) & Unit (A3) **dihapus** dari integrasi modul ini.
**[REVISI v1.2]** Kontrak lookup (FR-009) memakai 1 parameter `jenis_layanan_ruangan` (bukan jenis pelayanan + tipe ruangan terpisah) → semua konsumen kirim nilai enum kanonik.

**Tidak ada** integrasi langsung ke BPJS/SATUSEHAT/Disdukcapil. [ASUMSI] Skenario BPJS titip kelas & SEP ditangani modul Admisi/Billing (Out Scope).

## Asumsi
- [REVISI v1.2] "jenis pelayanan" & "tipe ruangan" = satu konsep → 1 field kanonik `jenis_layanan_ruangan` (enum tetap), dipakai seragam di form/import/list/lookup/histori & modul konsumen.
- [REVISI v1.1] Tarif = standar per kombinasi jenis_layanan_ruangan + kelas (+ penjamin + periode); tidak diinput per bangsal/unit/instalasi. Field bangsal_id, unit, instalasi_id dihapus.
- [REVISI v1.1] Setiap bangsal mewarisi standar tarif via atribut jenis_layanan_ruangan + kelas miliknya (didefinisikan di master Bangsal A15).
- Tidak ada BPMN khusus A43 — semua alur (As-Is/To-Be, Main Flow) diturunkan analogi dari BPMN master data & backoffice inventory.
- RS Tipe C/D: jumlah jenis layanan/ruangan & kelas terbatas, perubahan tarif jarang (ikut SK direksi); standar tarif << ~200 baris.
- Modul = penyedia master data; perhitungan billing aktual & SEP ada di modul Billing/Kasir/Admisi.
- CRUD + import massal CSV/XLSX + penjadwalan tanggal efektif termasuk Phase 1 (kombinasi draft user + lampiran).
- Standar tarif yang pernah dipakai transaksi hanya dinonaktifkan, tidak dihapus permanen (jaga integritas histori billing).
- Hak akses ubah tarif selaras RBAC modul A53.
- Field status_aktif, file_import, keterangan, mode_import, jenis_layanan_ruangan, kelas_perawatan memakai definisi kanonik lintas-PRD.

## Pertanyaan Terbuka
- [REVISI v1.2 — RESOLVED] "jenis pelayanan" vs "tipe ruangan" → digabung jadi 1 field kanonik `jenis_layanan_ruangan` (enum: Reguler/Intensive Care/Isolasi/Transit/VK). Tindak lanjut: selaraskan nama field & enum yang sama di master Bangsal (A15), Kamar (A16), Billing. [PERLU KONFIRMASI] nama akhir field di modul konsumen.
- [REVISI v1.2] Migrasi data tarif lama: pastikan nilai "jenis pelayanan"/"tipe ruangan" existing dipetakan 1:1 ke enum kanonik tanpa data hilang/duplikat.
- [REVISI v1.1] Lokasi mapping bangsal → standar tarif: atribut jenis_layanan_ruangan + kelas disimpan di master Bangsal (A15) atau di service A43? (BR-008, FR-011)
- [REVISI v1.1] Aksi saat bangsal punya kombinasi jenis_layanan_ruangan + kelas yang belum bertarif: blokir transaksi, default fallback, atau hanya peringatan? (FR-011)
- Enum kelas perawatan: kanonik = Kelas 1/2/3/VIP, tapi lampiran sebut VVIP. Tambahkan VVIP ke master? [PERLU KONFIRMASI]
- Struktur detail komponen tarif (jasa sarana, akomodasi, lain-lain) — dirinci per komponen atau satu nilai tarif/hari?
- Kedalaman tarif per kategori penjamin di MVP (FR-007): Phase 1 atau Phase 2?
- Apakah perlu mode offline/cache standar tarif untuk RS dengan internet tidak stabil? (NFR-006)
- Target baseline error penagihan & target audit konsistensi (metrik bagian 4).