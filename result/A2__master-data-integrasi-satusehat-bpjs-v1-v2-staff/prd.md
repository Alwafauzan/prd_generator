# PRD — Master Data / Integrasi SATUSEHAT BPJS V1 V2 — Staff

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A2); PRD A1 (User), A55 (Jabatan), A3 (Unit), A19 (Instalasi); Permenkes RME; Spesifikasi SATUSEHAT Practitioner; BPJS HFIS/Aplicares
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-06-17

## 1. Overview / Brief Summary

Modul **Master Data Staff** (code A2, cluster Control Panel) adalah modul referensi inti untuk mengelola data seluruh staf rumah sakit — tenaga medis (dokter, perawat, bidan, analis, radiografer, apoteker), tenaga kesehatan lain, dan tenaga non-medis. Data staf di sini menjadi **sumber kebenaran tunggal** yang di-autofill ke modul lain, terutama **A1 (Master User)** untuk pembuatan akun login.

Modul ini juga menjadi titik **integrasi dua arah**:
- **SATUSEHAT** — registrasi/sinkronisasi tenaga medis sebagai *Practitioner* (memperoleh `satusehat_practitioner_id`).
- **BPJS (V1 & V2)** — pemetaan dokter/DPJP ke kode BPJS (HFIS) untuk kebutuhan SEP, Antrol, dan klaim INA-CBG.
- **Disdukcapil** — validasi/bridging NIK saat input identitas staf.

Versi V1/V2 mengacu pada generasi API integrasi (V1 lama, V2 terbaru); modul harus mendukung pemetaan kode ke kedua versi untuk kompatibilitas transisi. [ASUMSI]

## 2. Background

**Masalah saat ini (RS Tipe C & D):**
- Data staf tersebar di Excel/dokumen HR terpisah dari SIMRS → duplikasi & tidak sinkron.
- Pendaftaran dokter ke SATUSEHAT (Practitioner) dilakukan manual lewat portal, ID tidak tercatat balik ke SIMRS → resource SATUSEHAT pada encounter sering gagal/tidak ter-link.
- Pemetaan dokter ke kode BPJS dikelola terpisah → SEP/Antrol salah dokter, klaim tertolak.
- NIK/STR/SIP tidak tervalidasi → data tenaga medis tidak lengkap saat audit akreditasi.
- SDM IT terbatas → butuh form sederhana, validasi otomatis, sinkronisasi 1 klik.

**Kenapa modul ini perlu:** menyatukan master staf sebagai fondasi referensi (dipakai A1 User, penjadwalan, EMR DPJP, billing, klaim) sekaligus pintu integrasi identitas tenaga medis ke SATUSEHAT & BPJS, mengurangi entri ganda dan kesalahan klaim.

## 3. In Scope

### Scope Definition (yang dikerjakan)
- CRUD master staf: tambah, ubah, lihat detail, aktif/nonaktif (soft delete).
- Form input identitas staf (nama, NIP, NIK, jenis kelamin, jabatan, unit, data ketenagaan medis: STR/SIP, SMF/spesialisasi).
- Validasi field: unik NIP, NIK 16 digit + bridging Disdukcapil, format STR/SIP.
- Dashboard/list staf + filter (jabatan, unit, status STR, status sync).
- **Integrasi SATUSEHAT**: registrasi/cari Practitioner, simpan `satusehat_practitioner_id`, indikator status sync.
- **Integrasi BPJS V1 & V2**: pemetaan kode dokter BPJS (kode dokter HFIS) per spesialisasi/poli.
- Import massal staf via template (CSV/XLSX).
- Autofill data staf ke modul A1 (User) via `staff_id`.
- Audit log perubahan data staf.

### Out Scope (TIDAK dikerjakan)
- Pembuatan akun login & password (milik **A1 Master User**).
- Manajemen role/RBAC & akses menu (milik A18 Role, A37 Akses Menu, A53 RBAC).
- Penggajian/payroll & absensi/HRIS penuh.
- Penjadwalan jaga/poli dokter (modul penjadwalan).
- Master Jabatan (A55), Unit (A3), Instalasi (A19), Spesialisasi & SMF (A23) — modul ini hanya **mereferensikan** via lookup.
- Kredensialing/penilaian kinerja klinis.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Master staf jadi sumber tunggal | % staf aktif terdata lengkap (NIK valid + jabatan + unit) | ≥ 95% |
| Hilangkan entri ganda ke A1 | % user A1 yang autofill dari staff_id | 100% |
| Tenaga medis tersinkron SATUSEHAT | % tenaga medis punya `satusehat_practitioner_id` | ≥ 90% [ASUMSI] |
| Klaim BPJS benar dokter | jumlah SEP/klaim ditolak karena kode dokter salah | turun ≥ 80% |
| Validasi identitas | % NIK staf tervalidasi Disdukcapil | ≥ 90% |
| Efisiensi entri | waktu input 1 staf baru | ≤ 3 menit [ASUMSI] |
| Data ketenagaan akurat | % tenaga medis dgn STR/SIP terisi & belum kedaluwarsa | ≥ 95% |

## 5. Related Feature

| Code | Menu | Relasi |
|------|------|--------|
| A1 | Master Data > User (New) | Konsumen utama: autofill nama, nip, nik, jenis_kelamin, jabatan via `staff_id` |
| A55 | Master Data > Jabatan | Sumber lookup `jabatan` |
| A3 | Master Data / Integrasi SATUSEHAT BPJS V2 > Unit | Sumber lookup `unit` |
| A19 | Master Data > Instalasi (New) | Lookup instalasi/penempatan |
| A23 | Master Data / Integrasi BPJS Terminology V2 > Spesialisasi & SMF | Sumber lookup `spesialisasi`/`smf` tenaga medis |
| A18 | Master Data > Role | Penetapan role di A1, bukan di sini |
| A53 | Admin > RBAC | Hak akses staf (out scope modul ini) |

**Catatan integrasi modul referensi:** A2 berdiri sebagai *upstream* — perubahan nama/jabatan staf harus terpropagasi ke A1 dan modul klinis (EMR DPJP, g-emr-patient-identity menyediakan data sosial/identitas). [ASUMSI]

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari pola admisi/integrasi BPJS-Disdukcapil pada g-admisi-onsite-registration & g-emr-patient-identity]
1. Admin HR/IT input data staf di Excel terpisah.
2. Pendaftaran dokter ke SATUSEHAT manual via portal; ID Practitioner dicatat manual (sering hilang).
3. Kode dokter BPJS dikelola di file lain → rawan salah saat buat SEP.
4. NIK staf tidak divalidasi.
5. Saat buat akun SIMRS, data staf diketik ulang → duplikasi & inkonsistensi.

### B. To-Be (kondisi diharapkan)
1. Admin buka **Control Panel > Master Data > Staff**, klik **Tambah Staf**.
2. Input NIK → sistem **bridging Disdukcapil** tarik nama/jenis kelamin/tgl lahir (pola sama dgn g-admisi-onsite-registration "Call API Disdukcapil & tarik data demografi").
3. Sistem cek **duplikat** (NIK/NIP) → blokir bila sudah ada (pola "Duplicate Detection" admisi).
4. Admin lengkapi jabatan, unit, dan—jika tenaga medis—STR/SIP, spesialisasi/SMF.
5. Untuk tenaga medis: klik **Sinkron SATUSEHAT** → sistem cari/registrasi Practitioner → simpan `satusehat_practitioner_id` + status sync.
6. Untuk dokter BPJS: klik **Petakan Kode BPJS** → pilih versi (V1/V2) + kode dokter HFIS.
7. Simpan → data tersedia untuk autofill A1 (User) dan modul klinis.
8. Perubahan tercatat di **audit log** (pola g-emr-patient-identity "Catat audit log: User, Timestamp").

## 7. Main Flow / Mindmap

**Skenario 1 — Tambah staf baru (tenaga medis):**
Buka menu Staff → Tambah → Input NIK → [Gateway: NIK valid Disdukcapil?] Ya→autofill demografi / Tidak→isi manual + tandai belum tervalidasi → [Gateway: NIK/NIP duplikat?] Ya→blokir & tampilkan staf existing / Tidak→lanjut → Isi jabatan, unit, jenis tenaga → [Gateway: Tenaga medis?] Ya→isi STR/SIP + spesialisasi/SMF → Sinkron SATUSEHAT Practitioner → Petakan kode BPJS (V1/V2) / Tidak→skip → Simpan → Event: Staf tersimpan & siap autofill A1.

**Skenario 2 — Sinkron SATUSEHAT (Practitioner):**
Pilih staf → klik Sinkron → sistem cari Practitioner by NIK di SATUSEHAT → [Gateway: ditemukan?] Ya→ambil & simpan `satusehat_practitioner_id` / Tidak→registrasi Practitioner baru → simpan ID + status sync (success/failed) → tampilkan badge status.

**Skenario 3 — Pemetaan kode dokter BPJS:**
Pilih dokter → Petakan Kode BPJS → pilih versi (V1/V2) → input/ambil kode dokter HFIS per spesialisasi → simpan → dipakai saat penerbitan SEP/Antrol.

**Skenario 4 — Edit / Nonaktifkan staf:**
Cari staf → Edit field / Toggle status_aktif → [Gateway: punya user A1 aktif?] bila nonaktif → peringatan dampak ke akun login → Simpan → audit log.

**Skenario 5 — Import massal:**
Unduh template → isi → upload → sistem validasi per baris (NIK/NIP unik, format) → tampilkan baris valid/error → konfirmasi → simpan batch.

## 8. Business Rules

- **BR-001**: `nip` wajib unik di seluruh sistem. Duplikat → tolak simpan. (trace: Skenario 1 gateway duplikat)
- **BR-002**: `nik` wajib 16 digit numerik & divalidasi Disdukcapil; jika gagal validasi, staf tetap bisa disimpan tapi ditandai `[NIK belum tervalidasi]`. [ASUMSI — pola bridging admisi]
- **BR-003**: Jika `nik` atau `nip` cocok dengan staf existing → blokir buat baru, tawarkan buka data existing. (pola Duplicate Detection g-admisi-onsite-registration)
- **BR-004**: `no_str` & `no_sip` **wajib** untuk jenis tenaga = medis/tenaga kesehatan; opsional untuk non-medis.
- **BR-005**: Sinkron SATUSEHAT Practitioner hanya untuk tenaga medis/kesehatan yang punya NIK valid. Tanpa NIK valid → tombol sinkron disable.
- **BR-006**: `satusehat_practitioner_id` unik per staf; satu staf maksimal satu Practitioner ID aktif.
- **BR-007**: Pemetaan kode dokter BPJS hanya untuk staf dgn jabatan dokter & punya spesialisasi/SMF (A23). Wajib pilih versi V1 atau V2.
- **BR-008**: Staf tidak boleh dihapus permanen bila pernah dipakai transaksi (SEP/EMR/billing) → hanya `status_aktif = nonaktif` (soft delete).
- **BR-009**: Menonaktifkan staf yang masih punya user A1 aktif → munculkan peringatan; status user dikelola di A1, bukan auto-nonaktif. [PERLU KONFIRMASI]
- **BR-010**: Field kanonik (`nama`, `nip`, `nik`, `jenis_kelamin`, `jabatan`) mengikuti definisi bersama A1/A2 — modul lain hanya autofill, tak boleh override di A1.

## 9. User Stories

- **US-001** — Sebagai Admin Control Panel, saya ingin menambah data staf baru dengan validasi NIK & NIP otomatis, agar data referensi akurat dan bebas duplikat. (trace: Skenario 1)
- **US-002** — Sebagai Admin, saya ingin sistem menarik demografi staf dari Disdukcapil saat input NIK, agar entri lebih cepat & valid. (trace: pola g-admisi-onsite-registration)
- **US-003** — Sebagai Admin/IT, saya ingin men-sinkron tenaga medis ke SATUSEHAT sebagai Practitioner dengan satu klik, agar `satusehat_practitioner_id` tersimpan untuk resource encounter. (trace: Skenario 2)
- **US-004** — Sebagai Verifikator/Admin BPJS, saya ingin memetakan kode dokter BPJS (V1/V2) per spesialisasi, agar SEP & klaim merujuk dokter yang benar. (trace: Skenario 3)
- **US-005** — Sebagai Admin A1, saya ingin memilih staf dari master saat membuat user, agar nama/NIP/NIK/jabatan terisi otomatis tanpa ketik ulang. (trace: Related Feature A1)
- **US-006** — Sebagai Admin, saya ingin import massal staf via template, agar migrasi data awal cepat. (trace: Skenario 5)
- **US-007** — Sebagai Manajemen, saya ingin dashboard staf dengan filter status STR & status sync, agar memantau kelengkapan kredensial & kepatuhan integrasi. (trace: Data Requirements dashboard)
- **US-008** — Sebagai Auditor, saya ingin melihat audit log perubahan data staf, agar perubahan dapat ditelusuri. (trace: BR + pola g-emr-patient-identity audit log)

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | Form CRUD staf (tambah/edit/detail/nonaktif) dgn field di §11 | US-001 |
| FR-002 | Validasi unik `nip`; tolak simpan bila duplikat | BR-001, US-001 |
| FR-003 | Input `nik` 16 digit → tombol bridging Disdukcapil → autofill nama/jenis_kelamin/tgl_lahir | BR-002, US-002 |
| FR-004 | Duplicate detection by NIK/NIP → tampilkan staf existing | BR-003, US-001 |
| FR-005 | Field STR/SIP & spesialisasi/SMF muncul kondisional bila jenis tenaga = medis | BR-004 |
| FR-006 | Tombol Sinkron SATUSEHAT: cari Practitioner by NIK; bila tak ada registrasi baru; simpan `satusehat_practitioner_id` + status sync + timestamp | BR-005/006, US-003 |
| FR-007 | Tombol Petakan Kode BPJS: pilih versi V1/V2 + input kode dokter HFIS per spesialisasi | BR-007, US-004 |
| FR-008 | Expose `staff_id` + field kanonik untuk autofill A1 (lookup) | US-005 |
| FR-009 | Import massal via template CSV/XLSX + validasi per baris + laporan error | US-006 |
| FR-010 | Dashboard/list staf dgn filter (jabatan, unit, status STR, status sync) + search | US-007 |
| FR-011 | Audit log: user, timestamp, field lama→baru | US-008 |
| FR-012 | Soft delete (status_aktif) untuk staf bertransaksi | BR-008 |
| FR-013 | Badge status integrasi (SATUSEHAT synced/failed/none; BPJS mapped/none) di list & detail | US-007 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Tambah/Edit Staf (FR-001..FR-007)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| staff_id | ID Staf | text | Ya (auto) | auto-generate, unik | auto | PK; dipakai autofill A1 |
| nama | Nama Lengkap | text | Ya | maks 100 char | manual / autofill Disdukcapil | field kanonik (A1,A2) |
| nip | NIP | text | Ya | unik, 18 digit | manual | BR-001; tidak boleh duplikat |
| nik | NIK | text | Ya | 16 digit numerik, valid Disdukcapil | integrasi Disdukcapil (bridging) | BR-002/003; FR-003 |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | L / P | autofill Disdukcapil / manual | enum |
| tgl_lahir | Tanggal Lahir | date | Ya | ≤ hari ini | autofill Disdukcapil / manual | |
| tempat_lahir | Tempat Lahir | text | Tidak | maks 50 char | manual | [PERLU KONFIRMASI] |
| jabatan | Jabatan | dropdown | Ya | dari master Jabatan (A55) | lookup A55 | field kanonik |
| unit | Unit/Instalasi | dropdown | Ya | dari master Unit (A3)/Instalasi (A19) | lookup A3/A19 | penempatan |
| jenis_tenaga | Jenis Tenaga | dropdown | Ya | medis / kesehatan / non-medis | enum | menentukan field kondisional |
| spesialisasi_smf | Spesialisasi & SMF | dropdown | Kondisional | dari master A23 | lookup A23 | wajib bila jenis_tenaga=medis; BR-007 |
| no_str | No. STR | text | Kondisional | format STR | manual | wajib tenaga medis/kesehatan; BR-004 |
| str_berlaku_sampai | STR Berlaku s/d | date | Kondisional | ≥ hari ini saat input | manual | untuk badge expired |
| no_sip | No. SIP | text | Kondisional | format SIP | manual | wajib tenaga medis; BR-004 |
| email | Email | text | Tidak | format email | manual | field kanonik (A1,A2) |
| no_hp | No. HP | text | Tidak | 10–15 digit | manual | field kanonik (A1,A2) |
| satusehat_practitioner_id | SATUSEHAT Practitioner ID | text | Tidak (auto) | format ID SATUSEHAT | integrasi SATUSEHAT (FR-006) | read-only; diisi saat sinkron |
| satusehat_sync_status | Status Sync SATUSEHAT | dropdown | Tidak (auto) | none/synced/failed | sistem | badge |
| bpjs_kode_dokter | Kode Dokter BPJS | text | Kondisional | format kode HFIS | integrasi/manual BPJS (FR-007) | per spesialisasi |
| bpjs_versi | Versi Integrasi BPJS | dropdown | Kondisional | V1 / V2 | enum | BR-007 |
| status_aktif | Status Aktif | boolean | Ya | aktif / nonaktif | default aktif | field kanonik; soft delete BR-008 |

### B. Layar TAMPIL — Dashboard / List Staf (FR-010, FR-013)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Staf Aktif | count master_staf where status_aktif | angka besar (kartu) | – | ringkasan |
| Total Tenaga Medis | count where jenis_tenaga=medis | angka (kartu) | – | |
| % Tersinkron SATUSEHAT | count synced / total medis | persen + grafik | – | KPI integrasi |
| Nama | master_staf.nama | text | sort A-Z | |
| NIP | master_staf.nip | text | search | |
| Jabatan | master_staf.jabatan | text | filter | |
| Unit | master_staf.unit | text | filter | |
| Status STR | master_staf.str_berlaku_sampai | badge valid/expired | filter | merah bila lewat tgl |
| SATUSEHAT | satusehat_sync_status | badge synced/failed/none | filter | FR-013 |
| BPJS | bpjs_kode_dokter | badge mapped/none | filter | FR-013 |
| Status | status_aktif | badge aktif/nonaktif | filter | |

### C. Layar TAMPIL — Detail Staf + Audit Log (FR-011)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Field diubah | audit_log.field | text | – | |
| Nilai lama → baru | audit_log.old/new | text | – | |
| Oleh | audit_log.user | text | sort | |
| Waktu | audit_log.timestamp | datetime | sort desc | pola g-emr audit log |

### D. Layar INPUT — Import Massal (FR-009)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Staf | file | Ya | .csv/.xlsx, sesuai template | manual upload | validasi per baris (NIK/NIP unik) |
| mode_import | Mode | dropdown | Ya | tambah / tambah+update | enum | [PERLU KONFIRMASI] |

## 12. Non-Functional Requirements

- **NFR-001 (Performa)**: list staf (≤ beberapa ratus baris untuk RS tipe C/D) tampil ≤ 2 dtk; sinkron SATUSEHAT per staf ≤ 5 dtk pada koneksi normal. [ASUMSI]
- **NFR-002 (Keandalan/Offline)**: internet RS tipe C/D tidak stabil → CRUD staf tetap jalan offline; sinkron SATUSEHAT/BPJS antri & retry saat online (status `failed`/`pending` + tombol coba lagi). [ASUMSI]
- **NFR-003 (Keamanan)**: NIK & data pribadi staf hanya untuk role berwenang; akses tercatat audit log (Permenkes perlindungan data).
- **NFR-004 (Auditability)**: semua perubahan field tersimpan dengan user+timestamp (FR-011).
- **NFR-005 (Kompatibilitas)**: dukung integrasi BPJS V1 & V2 paralel selama masa transisi; kode dokter dapat dipetakan ke kedua versi.
- **NFR-006 (Usability)**: form ramah operator non-IT — field kondisional, pesan error jelas berbahasa Indonesia.
- **NFR-007 (Integritas)**: tak boleh hard delete staf bertransaksi (BR-008).

## 13. Integrasi Eksternal

| Integrasi | Arah | Fungsi | Field terkait | Catatan |
|-----------|------|--------|---------------|---------|
| **Disdukcapil (NIK)** | tarik | Validasi NIK + autofill nama/jenis_kelamin/tgl_lahir | nik, nama, jenis_kelamin, tgl_lahir | bridging, pola g-admisi-onsite-registration; FR-003 |
| **SATUSEHAT (Practitioner)** | dua arah | Cari/registrasi tenaga medis sebagai Practitioner; simpan ID | satusehat_practitioner_id, satusehat_sync_status | resource `Practitioner` FHIR; ID dipakai modul klinis/encounter; FR-006 [ASUMSI sistem/URI sesuai spesifikasi SATUSEHAT V2] |
| **BPJS V1 & V2 (HFIS)** | dua arah | Pemetaan kode dokter untuk SEP/Antrol/klaim INA-CBG | bpjs_kode_dokter, bpjs_versi, spesialisasi_smf | kode dokter HFIS per spesialisasi; FR-007 |
| **Modul A1 (User)** | downstream | Autofill data staf saat buat akun | staff_id + field kanonik | 1 staff = 1 user aktif; FR-008 |
| **Modul klinis/EMR** | downstream | Identitas DPJP/tenaga medis | staff_id, nama, satusehat_practitioner_id | pola g-emr-patient-identity (data sosial/identitas) |

**Catatan SATUSEHAT**: gunakan identifier NIK sebagai key pencarian Practitioner; simpan `satusehat_practitioner_id` agar setiap Encounter/Observation di modul klinis dapat mereferensikan praktisi yang valid. Bila registrasi gagal, status `failed` + retry (NFR-002).

## Asumsi
- [ASUMSI] Tidak ada BPMN khusus A2 — alur As-Is/To-Be diturunkan dari pola g-admisi-onsite-registration (bridging Disdukcapil, duplicate detection) & g-emr-patient-identity (audit log).
- [ASUMSI] SATUSEHAT memakai resource Practitioner FHIR dengan NIK sebagai identifier pencarian (spesifikasi V2).
- [ASUMSI] V1/V2 mengacu generasi API integrasi BPJS/SATUSEHAT; modul mendukung keduanya untuk transisi.
- [ASUMSI] Target metrik (waktu input ≤3 mnt, sync ≥90%) angka awal, dikalibrasi setelah pilot.
- [ASUMSI] RS tipe C/D punya jumlah staf relatif kecil → list tanpa paginasi berat; tetap sediakan search/filter.

## Pertanyaan Terbuka
- BR-009: saat staf dinonaktifkan, apakah user A1 terkait auto-nonaktif atau hanya diberi peringatan? [PERLU KONFIRMASI]
- Perbedaan teknis pemetaan kode dokter BPJS V1 vs V2 (format & endpoint) — perlu spesifikasi HFIS final.
- Mode import massal: tambah saja atau tambah+update by NIP/NIK? [PERLU KONFIRMASI]
- Apakah tempat_lahir & data ketenagaan tambahan (golongan, pendidikan) masuk MVP? [PERLU KONFIRMASI]
- Field STR/SIP: apakah perlu unggah dokumen scan (file) di MVP atau cukup nomor?