# PRD — Master Data / Integrasi SATUSEHAT BPJS V1 V2 — Staff

**Related Document:** Format_Ekspor_Data_Staf; Template_Impor_Data_Staf; PRD Master Data User (A1); PRD Master Data Jabatan (A55); PRD Master Data Unit (A3); PRD Spesialisasi & SMF (A23)
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

Master Data Staff adalah modul pengelolaan data kepegawaian yang menjadi **sumber kebenaran tunggal (single source of truth)** mengenai setiap individu di dalam organisasi Rumah Sakit: nama, NIP, NIK, jabatan, unit/departemen, profesi, spesialisasi, dan kontak. Modul ini mencatat seluruh tenaga RS — dokter, bidan, perawat, tenaga administrasi, dan staf penunjang.

Master data ini menjadi fondasi bagi modul lain (Master Data User/A1, RBAC/A53, HRIS, Pelayanan/Tindakan) untuk memperoleh data kepegawaian tanpa duplikasi. Data staf cukup dikelola di satu tempat lalu ditautkan via `staff_id` / `nip`.

Khusus konteks **Integrasi SATUSEHAT & BPJS (V1/V2)**, modul ini menyimpan dan memetakan identitas staf medis ke kode eksternal: **kode BPJS dokter** (untuk bridging SEP/VClaim) dan **identitas tenaga ke SATUSEHAT** (mapping practitioner / IHS Number). [ASUMSI] Rincian endpoint mengikuti konfirmasi tim integrasi.

Untuk RS Tipe C & D, modul dirancang sederhana namun lengkap: input manual cepat (< 3 menit/staf), impor/ekspor massal via template, dan auto-fill kode BPJS dokter agar tidak perlu input manual yang rawan salah.

## 2. Background

Selama ini data staf tersebar di berkas dan spreadsheet terpisah sehingga rawan duplikasi dan tidak konsisten. Ketika modul lain membutuhkan data staf, data disalin ulang, membuat pembaruan sulit dan tidak sinkron.

Master Data Staff hadir untuk memusatkan data kepegawaian sebagai acuan tunggal, sehingga perubahan jabatan maupun status staf cukup dilakukan sekali dan langsung berlaku di seluruh modul terkait. Fitur digunakan untuk mencatat seluruh data staf RS: dokter, bidan, perawat, tenaga administrasi, dan staf penunjang.

Konsentrasi detail penting (dari dokumen sumber):
- **Kode BPJS dokter**: ke depan akan di-*get* otomatis dari endpoint BPJS sehingga ketika staf dokter ditambahkan, field kode BPJS terisi otomatis (auto-fill).
- **Status nonaktif = gold standard**: status nonaktif staf menjadi acuan emas bagi modul lain. Jika status staf nonaktif, fungsinya otomatis dinonaktifkan di sistem lain. Contoh: bila staf nonaktif, akun di Master Data User (A1) otomatis ikut nonaktif.

Legend fase: `Phase 1` MVP inti, `[**]` Phase 2, `[***]` Phase 3, `[****]` Phase 4.

## 3. In Scope

### Scope Definition

| Phase | Scope/Area |
|-------|------------|
| Phase 1 | Pendaftaran data staf baru (nama, NIP, NIK, jabatan, unit, profesi, kontak). |
| Phase 1 | Pengelolaan data staf: ubah data, lihat detail, aktivasi/nonaktivasi. |
| Phase 1 | Penetapan status kepegawaian (aktif/nonaktif) yang memengaruhi akses sistem modul lain. |
| Phase 1 | Pencarian, filter, sorting, dan daftar (dashboard) staf. |
| Phase 1 | Penyediaan data staf sebagai sumber tautan (`staff_id`/`nip`) bagi Master Data User (A1) & modul lain. |
| Phase 1 | Auto-fill **kode BPJS dokter** dari endpoint BPJS saat staf dokter ditambahkan. [PERLU KONFIRMASI endpoint] |
| Phase 2 | Impor Data Staf `[**]` (template .csv/.xlsx). |
| Phase 2 | Ekspor Data Staf `[**]`. |
| Phase 2 | Reset Password staf terkait akun `[**]` (handoff ke A1). |
| Phase 3 | Pemetaan Akun COA pada staf `[***]`. |
| Phase 3 | Mapping identitas staf ke **SATUSEHAT Practitioner** (IHS Number) `[***]`. [ASUMSI] |

### Out Scope

| No | Scope |
|----|-------|
| 1 | Pengelolaan akun login & autentikasi (ditangani Master Data User / A1). |
| 2 | Penggajian, absensi, dan perhitungan tunjangan. |
| 3 | Manajemen kontrak dan dokumen kepegawaian. |
| 4 | Integrasi penuh dengan sistem HRIS pihak ketiga. |

## 4. Goals and Metrics

### Goals
- Menyediakan data kepegawaian yang akurat, terpusat, dan menjadi sumber kebenaran tunggal bagi modul lain.
- Menyediakan database staf RS yang terpusat dan lengkap (dokter, perawat, bidan, admin, penunjang).
- Memastikan setiap staf memiliki identitas dan peran (role) yang terdefinisi jelas.
- Memfasilitasi sinkronisasi data staf dengan modul pelayanan, keuangan, dan SDM.
- Meminimalkan duplikasi & inkonsistensi data antar unit/poli.
- Menjamin identitas staf medis siap-integrasi ke BPJS & SATUSEHAT (kode BPJS dokter terisi).

### Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kelengkapan data | 100% staf aktif memiliki NIP, nama, jabatan, dan unit/departemen. |
| 2 | Keunikan data | 0 duplikasi NIP pada seluruh data staf. |
| 3 | Akurasi status | Status staf selalu mencerminkan kondisi terkini; nonaktif berdampak ke modul lain < 1 detik. |
| 4 | Waktu input data | < 3 menit per staf. |
| 5 | Kesiapan integrasi | 100% staf dokter aktif memiliki kode BPJS dokter terisi. [PERLU KONFIRMASI ketersediaan endpoint] |

## 5. Related Feature

Fitur terkait dari List Fitur (cluster Control Panel):

| Code | Module | Menu / Keterkaitan |
|------|--------|--------------------|
| A1 | Master Data | **User** — mengonsumsi data staf via `staff_id`/`nip`; status nonaktif staf → user nonaktif. |
| A55 | Master Data | **Jabatan** — sumber lookup field `jabatan`. |
| A3 | Master Data | **Unit** — sumber lookup field `unit`/`unit_id`. |
| A19 | Master Data | **Instalasi** — sumber lookup penempatan staf. |
| A23 | Master Data | **Spesialisasi & SMF** (Integrasi BPJS Terminology V2) — sumber lookup `spesialisasi` dokter. |
| A18 / A53 | Master Data | **Role / RBAC** — penetapan peran akses berbasis staf. |
| A10 | Pelayanan | **Tindakan** — DPJP/operator tindakan merujuk ke staf. |
| A32 | Master Data | **Wilayah** — sumber kode wilayah alamat staf. |

Traceability dokumen sumber menyebut Related Feature: User, Spesialisasi Dokter, Profesi, Jabatan, Wilayah (Master Data) dan Tindakan (Pelayanan).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Kondisi Saat Ini)
- Data staf tersebar di berkas/spreadsheet terpisah dan rawan duplikasi.
- Tidak ada acuan tunggal; modul lain menyimpan ulang data staf.
- Perubahan jabatan & status kepegawaian sulit dilacak.
- Kode BPJS dokter diinput/dicari manual → rawan salah saat bridging SEP. [ASUMSI, analogi proses BPJS pada g-admisi-onsite-registration]

### B. To-Be (Kondisi Yang Diharapkan)
- Data staf dikelola terpusat sebagai single source of truth.
- Modul lain cukup menautkan ke `staff_id`/`nip` tanpa menduplikasi data.
- Perubahan status staf langsung berdampak pada modul terkait (nonaktif → akses terblokir, user terkait nonaktif).
- Saat staf dokter ditambahkan, sistem memanggil endpoint BPJS untuk **auto-fill kode BPJS dokter** sebelum disimpan. [ASUMSI, pola integrasi BPJS analogi dari g-admisi-onsite-registration & g-support-apotek-online-iter]
- [ASUMSI] Identitas tenaga medis dapat dipetakan ke SATUSEHAT Practitioner untuk interoperabilitas (Phase 3).

## 7. Main Flow / Mindmap

Alur utama pengelolaan data staf:

1. Admin/HR membuka modul **Master Data → Staff** → tampil Dashboard Data Staf.
2. Admin/HR klik tombol **➕ Tambah** → form Tambah Staf muncul.
3. Admin/HR mengisi data staf (nama, NIP, NIK, jenis kelamin, tgl lahir, jabatan, unit, profesi, kontak).
4. **[Gateway] Profesi = Dokter?**
   - **Ya** → sistem memanggil endpoint BPJS untuk auto-fill **kode BPJS dokter** (dan field spesialisasi/SMF). [ASUMSI]
   - **Tidak** → lanjut tanpa kode BPJS dokter.
5. **[Gateway] Input NIK?** → bila diisi, sistem dapat memvalidasi/bridging Disdukcapil untuk demografi. [ASUMSI, analogi g-admisi-onsite-registration]
6. Sistem memvalidasi kelengkapan field wajib & **keunikan NIP**.
   - **[Gateway] NIP duplikat?** Ya → tolak simpan, tampilkan peringatan. Tidak → lanjut.
7. Data staf tersimpan dengan **status aktif**.
8. Data staf tersedia bagi modul lain melalui `staff_id`/`nip`.
9. Saat staf **nonaktif**, status diperbarui → akses & akun terkait (A1) otomatis terblokir.

Alur sekunder:
- **Detail/Edit**: pilih baris → lihat detail → ubah data → validasi → simpan.
- **Impor `[**]`**: unduh template → isi → unggah file → sistem validasi baris → ringkasan sukses/gagal → simpan.
- **Ekspor `[**]`**: pilih filter → ekspor ke .xlsx/.csv sesuai format ekspor.

## 8. Business Rules

| ID | Aturan | Sumber/Trace |
|----|--------|--------------|
| BR-001 | NIP wajib **unik** di seluruh data staf; duplikat → simpan ditolak. | Metrics keunikan, Main Flow step 6 |
| BR-002 | Field wajib minimal: nama, NIP, jabatan, unit. Tidak lengkap → tidak dapat disimpan. | Goals kelengkapan |
| BR-003 | Status **nonaktif** staf adalah gold standard: bila nonaktif, fungsi/akun staf di modul lain otomatis dinonaktifkan (mis. user A1). | Background |
| BR-004 | Bila profesi = Dokter, sistem mencoba auto-fill **kode BPJS dokter** dari endpoint BPJS sebelum simpan; jika gagal, izinkan simpan dengan kode kosong + flag "perlu sinkron". [ASUMSI] | To-Be, FR-007 |
| BR-005 | NIK harus 16 digit; bila diisi & valid, dapat dipakai bridging demografi Disdukcapil. [ASUMSI] | Field kanonik `nik` |
| BR-006 | No. STR wajib untuk tenaga medis (dokter/perawat/bidan/apoteker); opsional untuk non-medis. | [ASUMSI] praktik SIMRS |
| BR-007 | Staf nonaktif tidak dihapus (soft delete) demi audit & integritas riwayat pelayanan. | [ASUMSI] |
| BR-008 | Saat impor mode "tambah+update", baris dengan NIP sudah ada → update; NIP baru → tambah. | Field kanonik `mode_import` |
| BR-009 | Hanya peran berwenang (Admin Master Data/HR) yang dapat menambah/ubah/nonaktifkan staf. | RBAC A53 |

## 9. User Stories

Prioritas: P0 (Critical/MVP), P1 (Must Have), P2 (Should Have), P3 (Low/kosmetik), P4 (Enhancement).

| ID | Role | User Story | P | Acceptance Criteria (ringkas) |
|----|------|-----------|---|-------------------------------|
| US-001 | Admin Master Data | Sebagai Admin, saya dapat melihat **Dashboard Data Staf**, agar data staf terpantau. | P0 | Tabel kolom: NIP, Nama, No. Telepon, Jenis Profesi, Spesialis, Jabatan, Status, User/Non User `[**]`; sortir semua kolom; default sort Nama A-Z; pencarian by NIP/Nama/No.Telp/Spesialis/Jabatan; pagination 10/20/50/100; tombol Detail, Reset Password `[**]`, dan ➕ Tambah. |
| US-002 | Admin Master Data | Sebagai Admin, saya dapat **menambah staf baru**, agar data kepegawaian terpusat. | P0 | Form field wajib tervalidasi; NIP unik; tersimpan status aktif. |
| US-003 | Admin Master Data | Sebagai Admin, saya dapat **mengubah & melihat detail** staf. | P0 | Perubahan tersimpan & ter-audit. |
| US-004 | Admin Master Data | Sebagai Admin, saya dapat **menonaktifkan/mengaktifkan** staf, agar akses modul lain ikut menyesuaikan. | P0 | Toggle status; nonaktif → user A1 ikut nonaktif (BR-003). |
| US-005 | Admin Master Data | Sebagai Admin, saya dapat **mencari & memfilter** staf. | P0 | Filter status/profesi/unit; pencarian multi-kolom. |
| US-006 | Modul lain (A1/RBAC) | Sebagai modul konsumen, saya dapat **menautkan staf via `staff_id`/`nip`**, agar tidak menduplikasi data. | P0 | Endpoint/lookup staf aktif tersedia. |
| US-007 | Admin Integrasi | Sebagai Admin, saat menambah **staf dokter**, saya ingin **kode BPJS dokter terisi otomatis**, agar bridging SEP akurat. | P1 | Auto-fill dari endpoint BPJS; gagal → flag perlu sinkron (BR-004). [PERLU KONFIRMASI] |
| US-008 | Admin Master Data | Sebagai Admin, saya dapat **impor data staf** dari template. `[**]` | P2 | Unggah .csv/.xlsx; validasi per baris; ringkasan sukses/gagal (BR-008). |
| US-009 | Admin Master Data | Sebagai Admin, saya dapat **ekspor data staf**. `[**]` | P2 | Ekspor sesuai Format_Ekspor_Data_Staf. |
| US-010 | Admin Integrasi | Sebagai Admin, saya dapat **memetakan staf ke SATUSEHAT Practitioner**. `[***]` | P3 | Mapping IHS Number tersimpan. [ASUMSI] |

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | Sistem menampilkan dashboard daftar staf dengan kolom NIP, Nama, No. Telepon, Jenis Profesi, Spesialis, Jabatan, Status, User/Non User `[**]`; sorting semua kolom; default Nama A-Z. | US-001 |
| FR-002 | Sistem menyediakan pencarian (NIP/Nama/No.Telp/Spesialis/Jabatan), filter (status/profesi/unit), dan pagination (10/20/50/100). | US-001, US-005 |
| FR-003 | Sistem menyediakan form Tambah/Edit staf dengan validasi field wajib & format (lihat Data Requirements §11). | US-002, US-003 |
| FR-004 | Sistem memvalidasi keunikan NIP saat simpan; duplikat → blokir + pesan error. | BR-001 |
| FR-005 | Sistem mendukung aktivasi/nonaktivasi staf (soft delete) dan meng-cascade status nonaktif ke modul konsumen (user A1). | US-004, BR-003, BR-007 |
| FR-006 | Sistem mengekspos data staf aktif (lookup/endpoint internal) bagi modul lain via `staff_id`/`nip`. | US-006 |
| FR-007 | Saat profesi = Dokter, sistem memanggil endpoint BPJS untuk auto-fill kode BPJS dokter (& spesialisasi/SMF bila tersedia) sebelum simpan; tangani gagal dengan flag sinkron. [PERLU KONFIRMASI endpoint & field response] | US-007, BR-004 |
| FR-008 | Sistem menyediakan impor data staf via template (.csv/.xlsx) dengan mode tambah / tambah+update dan laporan validasi per baris. `[**]` | US-008, BR-008 |
| FR-009 | Sistem menyediakan ekspor data staf sesuai Format_Ekspor_Data_Staf. `[**]` | US-009 |
| FR-010 | Sistem mencatat audit log (user, timestamp, aksi) untuk setiap perubahan data staf. | [ASUMSI] analogi g-emr-patient-identity audit log |
| FR-011 | [Phase 3] Sistem memetakan staf ke SATUSEHAT Practitioner (IHS Number). `[***]` | US-010 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Tambah/Edit Staf (FR-003)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama | Nama Lengkap | text | Ya | maks 100 char | manual | Field kanonik (selaras A1) |
| nip | NIP | text | Ya | unik, 18 digit | manual | Field kanonik; tidak boleh duplikat (BR-001) |
| nik | NIK | text | Tidak | 16 digit, valid Disdukcapil | manual / integrasi Disdukcapil | Field kanonik; dipakai bridging demografi (BR-005) |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | L / P | enum | Field kanonik |
| tgl_lahir | Tanggal Lahir | date | Ya | <= hari ini | manual | |
| tempat_lahir | Tempat Lahir | text | Tidak | maks 50 char | manual | |
| jenis_profesi | Jenis Profesi | dropdown | Ya | enum: Dokter/Perawat/Bidan/Apoteker/Analis/Radiografer/Ahli Gizi/Administrasi/Penunjang | master profesi | Memicu auto-fill BPJS bila Dokter (FR-007) |
| jabatan | Jabatan | dropdown | Ya | dari master Jabatan (A55) | lookup A55 | Field kanonik |
| unit | Unit/Instalasi | dropdown | Ya | dari master Unit (A3)/Instalasi (A19) | lookup A3/A19 | Field kanonik |
| spesialisasi | Spesialisasi/SMF | dropdown | Tidak | dari master Spesialisasi & SMF (A23) | lookup A23 | Wajib bila profesi Dokter spesialis |
| no_str | No. STR | text | Tidak | format STR | manual | Wajib utk tenaga medis (BR-006) |
| no_sip | No. SIP | text | Tidak | format SIP | manual | [ASUMSI] |
| kode_bpjs_dokter | Kode BPJS Dokter | text | Tidak | sesuai format BPJS | integrasi BPJS (auto-fill) | Terisi otomatis bila Dokter (FR-007); read-only bila auto |
| ihs_number | IHS Number (SATUSEHAT) | text | Tidak | format IHS | integrasi SATUSEHAT | Phase 3 `[***]` [ASUMSI] |
| email | Email | text | Tidak | format email | manual | Field kanonik |
| no_hp | No. HP | text | Tidak | 10–15 digit | manual | Field kanonik |
| no_telp | No. Telepon | text | Tidak | 10–15 digit | manual | |
| alamat | Alamat | text | Tidak | maks 255 char | manual/Disdukcapil | Field kanonik |
| kode_wilayah | Kode Wilayah | lookup | Tidak | kode Kemendagri (dari A32) | lookup A32 | Prov/Kab/Kec/Kel |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | Field kanonik |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | Field kanonik (BR-003) |

### B. Layar INPUT — Impor Data Staf `[**]` (FR-008)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Staf | file | Ya | .csv/.xlsx, sesuai template | manual upload | Field kanonik; maks ukuran [PERLU KONFIRMASI] |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | Field kanonik (BR-008) |

### C. Layar TAMPIL — Dashboard / List Data Staf (FR-001)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| NIP | master_staff.nip | text | sort | |
| Nama | master_staff.nama | text | sort, default A-Z; search | |
| No. Telepon | master_staff.no_telp/no_hp | text | search | |
| Jenis Profesi | master_staff.jenis_profesi | text/badge | filter | |
| Spesialis | master_staff.spesialisasi (A23) | text | search/filter | |
| Jabatan | master_staff.jabatan (A55) | text | filter/search | |
| Status | master_staff.status_aktif | badge (Aktif=hijau / Nonaktif=abu) | filter | BR-003 |
| User/Non User `[**]` | join master_user (A1) by staff_id | badge | filter | Apakah staf punya akun user |
| Aksi | – | tombol Detail, Reset Password `[**]` | – | + tombol ➕ Tambah di header |

### D. Layar TAMPIL — Kartu Ringkasan (opsional)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Staf Aktif | count master_staff where status_aktif=true | angka besar | – | kartu ringkasan |
| Staf Dokter w/ Kode BPJS | count where profesi=Dokter & kode_bpjs_dokter not null | angka + % | – | indikator kesiapan integrasi (Metrics #5) |
| Staf STR Kadaluarsa | count where no_str expired | badge merah | filter | [ASUMSI] bila ada tgl berlaku STR |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-001 | Performa | Dashboard staf termuat < 3 detik untuk ≤ 5.000 baris; input simpan < 1 detik. Sesuai skala RS Tipe C/D. |
| NFR-002 | Usability | Input 1 staf dapat diselesaikan < 3 menit (Metrics #4); form sederhana, field wajib jelas ditandai. |
| NFR-003 | Keamanan/RBAC | Akses tambah/ubah/nonaktif hanya untuk peran berwenang (A53); data NIK/STR diperlakukan sebagai data sensitif. |
| NFR-004 | Auditability | Semua perubahan tercatat (user, timestamp, before/after) — FR-010. |
| NFR-005 | Integritas data | Soft delete (nonaktif), bukan hard delete, demi referensi historis pelayanan (BR-007). |
| NFR-006 | Ketersediaan/Offline | [ASUMSI] Untuk RS dengan internet tidak stabil, auto-fill BPJS bersifat best-effort; kegagalan jaringan tidak memblokir penyimpanan staf (BR-004). |
| NFR-007 | Kompatibilitas | Impor/ekspor mendukung .csv & .xlsx; template versi terkontrol. |
| NFR-008 | Konsistensi | Definisi field (nip, nik, status_aktif, jabatan, unit) mengikuti kamus kanonik lintas-PRD; perubahan harus selaras A1/A3/A55. |

## 13. Integrasi Eksternal

| Integrasi | Tujuan | Arah | Field/Endpoint | Catatan |
|-----------|--------|------|----------------|---------|
| **BPJS (VClaim)** | Auto-fill kode BPJS dokter saat staf dokter ditambahkan | Tarik (GET) | endpoint referensi dokter BPJS → `kode_bpjs_dokter`, (opsional) spesialisasi/SMF | [PERLU KONFIRMASI] endpoint & struktur response; pola analogi dari g-admisi-onsite-registration (bridging) & g-support-apotek-online-iter |
| **SATUSEHAT (Practitioner / Terminology V2)** | Mapping identitas tenaga medis → IHS Number Practitioner | Tarik/Dorong | `ihs_number` | Phase 3 `[***]`; mendukung interoperabilitas RME [ASUMSI] |
| **Disdukcapil** | Validasi/bridging NIK → demografi (nama, tgl lahir, alamat) | Tarik (GET) | `nik` → demografi | Opsional saat NIK diisi; pola analogi g-admisi-onsite-registration & g-emergency-registration [ASUMSI] |
| **Modul internal A1 (User)** | Sinkron status: staf nonaktif → user nonaktif | Dorong (event) | `staff_id`/`nip`, `status_aktif` | BR-003 (gold standard) |
| **Modul internal A53 (RBAC)** | Penetapan role berbasis staf | Tarik | `staff_id` | |

Catatan interoperabilitas: penamaan kode/identitas mengikuti standar SATUSEHAT (system URI) dan BPJS. Versi V1/V2 menandakan dukungan dua versi terminologi/bridging sesuai konfigurasi RS. [PERLU KONFIRMASI] perbedaan spesifik V1 vs V2 untuk modul Staff.

## Asumsi
- [ASUMSI] Auto-fill kode BPJS dokter & bridging Disdukcapil diturunkan dari pola integrasi BPJS/Disdukcapil pada BPMN admisi (g-admisi-onsite-registration, g-emergency-registration) karena modul ini belum punya BPMN sendiri.
- [ASUMSI] No. STR/SIP wajib untuk tenaga medis dan opsional untuk non-medis (praktik umum SIMRS).
- [ASUMSI] Penghapusan staf bersifat soft delete (nonaktif) demi integritas riwayat pelayanan.
- [ASUMSI] Audit log perubahan data staf mengikuti pola audit pada g-emr-patient-identity.
- [ASUMSI] NIP menggunakan format 18 digit unik sesuai kamus field kanonik lintas-PRD (A1).
- [ASUMSI] Mapping SATUSEHAT Practitioner (IHS Number) ditempatkan di Phase 3.
- [ASUMSI] Auto-fill BPJS bersifat best-effort; kegagalan jaringan (umum di RS Tipe C/D) tidak memblokir simpan.

## Pertanyaan Terbuka
- Endpoint BPJS untuk auto-fill kode BPJS dokter: URL, autentikasi, dan struktur response? (FR-007)
- Perbedaan konkret cakupan integrasi V1 vs V2 untuk modul Staff (apa yang berbeda di field/endpoint)?
- Apakah mapping SATUSEHAT Practitioner (IHS Number) masuk MVP atau benar Phase 3?
- Apakah NIK staf wajib? Dokumen sumber tidak mewajibkan, kamus kanonik mendefinisikan 16 digit.
- Apakah No. STR memiliki tanggal berlaku (untuk indikator STR kadaluarsa di dashboard)?
- Batas ukuran file & jumlah baris maksimum untuk impor staf?
- Format pasti Template_Impor_Data_Staf & Format_Ekspor_Data_Staf (daftar kolom resmi)?