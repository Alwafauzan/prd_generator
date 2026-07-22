# Product Requirement Document — E19 Surat Kontrol V1/V2 & PRB

## 1. Metadata Dokumen

| Atribut | Nilai |
|---|---|
| Kode Fitur | E19 |
| Modul | Rawat Jalan, Rawat Inap, IGD, VK |
| Menu | Surat Kontrol |
| Status Dokumen | Draft untuk review |
| Tanggal Dokumen | 21 Juli 2026 |

### Approval

| PRD Approved By | Nama/Jabatan | Signature, Date |
|---|---|---|
| PIC Fitur | Arif Aminudin | |
| PIC Integrasi BPJS | Andini / Wildan | |

### Document Version

| Tanggal | Versi | Deskripsi Perubahan |
|---|---|---|
| 21 Juli 2026 | 1.0 | Draft awal Surat Kontrol V2 dan PRB. |
| 21 Juli 2026 | 1.1 | Service Integrasi, retry 3 jam, status berdasarkan nomor BPJS, Monitoring BPJS, dan penyesuaian UI. |
| 21 Juli 2026 | 1.2 | VK ditetapkan dalam scope dan Informasi Potensi PRB dipindahkan ke bagian atas form. |
| 21 Juli 2026 | 2.0 | Restrukturisasi dokumen mengikuti `template-new.md` tanpa mengubah keputusan bisnis yang belum dikonfirmasi. |
| 22 Juli 2026 | 2.1 | Menambahkan konfigurasi domain Surat Kontrol V1/V2, Form V1 tanpa Informasi Potensi PRB dan Program PRB, serta Notes Untuk Developer. |

## 2. Overview & Background

### Overview / Brief Summary

E19 menyediakan pembuatan, perubahan, pencetakan, dan pemantauan **Surat Kontrol V1 atau V2** untuk pelayanan Rawat Jalan, Rawat Inap, IGD, dan VK. Versi yang aktif ditentukan oleh konfigurasi domain E19. V1 menggunakan seluruh isian umum Surat Kontrol tanpa Informasi Potensi PRB dan tanpa bagian Program PRB. V2 merupakan form yang telah dibuat sebelumnya dan mendukung Informasi Potensi PRB, pilihan manual sembilan Program Rujuk Balik (PRB), serta form TTV/pemeriksaan dinamis.

Arsitektur integrasi yang berlaku:

- Domain E19 memiliki konfigurasi versi Surat Kontrol dengan nilai terbatas `V1` atau `V2`; penempatan resolver konfigurasi pada FE atau BE dikembalikan kepada developer, dengan BE tetap memvalidasi kontrak versi sebelum dispatch.
- SIMRS E19 tidak memanggil BPJS VClaim secara langsung.
- Pada V1, SIMRS tidak meminta Potensi PRB dan tidak mengirim data Program PRB. Pada V2, SIMRS mengirim command Get Potensi PRB serta data Program PRB sesuai pilihan pengguna.
- SIMRS menyimpan Surat Kontrol internal dan mengirim command Insert/Update sesuai versi yang aktif kepada Service Integrasi.
- Service Integrasi bertanggung jawab atas credential, Trustmark, transformasi payload BPJS sesuai versi, komunikasi BPJS, dan log bridging teknis. Fitur/kontrak PRB berasal dari pihak ketiga BPJS, bukan fitur yang ditentukan oleh tim integrasi.
- Tidak ada flag boolean integrasi. `bpjs_control_number` terisi berarti **Terintegrasi**; kosong berarti **Belum Terintegrasi**.
- Kegagalan Service Integrasi/BPJS tidak membatalkan Surat Kontrol internal. Cron setiap 3 jam dan tombol Retry pada Monitoring BPJS mengirim ulang command melalui Service Integrasi.

### Business Process — As-Is vs To-Be

#### As-Is

1. Form Surat Kontrol existing belum menampung seluruh parameter PRB V2.
2. Field statis membuat pengguna melihat parameter yang tidak relevan dengan penyakit pasien.
3. Integrasi diasumsikan dilakukan langsung dari backend Surat Kontrol ke BPJS.
4. Kegagalan BPJS berisiko menghambat penerbitan surat atau tidak memiliki retry yang konsisten.
5. Potensi PRB, histori percobaan, dan status keberhasilan BPJS belum terlihat jelas pada alur pengguna.

#### To-Be

1. Pengguna membuka form dari episode Rawat Jalan, Rawat Inap, IGD, atau VK.
2. Sistem membaca konfigurasi versi domain E19 (`V1` atau `V2`) sebelum membentuk form dan command integrasi.
3. Pada V1, data internal langsung tampil dengan seluruh isian umum; Informasi Potensi PRB dan bagian Program PRB tidak dirender.
4. Pada V2, data internal langsung tampil; Informasi Potensi PRB berada di bagian paling atas form dan dimuat melalui Service Integrasi.
5. Pada V2, Potensi PRB hanya rekomendasi. Program PRB default `Tidak Ada` dan dapat dipilih manual.
6. Pada V2, pemilihan Program PRB menampilkan hanya field TTV/pemeriksaan yang relevan secara real-time.
7. Simpan membuat Surat Kontrol internal dan integration job secara atomik serta menyimpan versi kontrak yang digunakan.
8. Dispatcher mengirim command Insert/Update sesuai versi kepada Service Integrasi tanpa direct hit ke BPJS.
9. Jika berhasil, nomor Surat Kontrol BPJS disimpan. Jika gagal/timeout, nomor BPJS tetap kosong dan surat internal tetap aktif.
10. Monitoring Tindak Lanjut Kontrol BPJS menampilkan status berdasarkan nomor BPJS dan tombol Retry bila nomor belum tersedia.
11. Cron setiap 3 jam memproses Surat Kontrol aktif yang nomor BPJS-nya masih kosong.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|---|---|---|
| 1 | Keberlangsungan pelayanan | 100% Surat Kontrol yang lolos validasi internal tetap tersimpan walaupun Service Integrasi/BPJS gagal atau timeout. |
| 2 | Kepatuhan arsitektur | 0 request dari E19 atau cron E19 ke host BPJS; seluruh operasi melalui Service Integrasi. |
| 3 | Akurasi status integrasi | 100% status Terintegrasi hanya tampil bila `bpjs_control_number` terisi; kosong ditampilkan sebagai Belum Terintegrasi. |
| 4 | Retry otomatis dan manual | 100% Surat Kontrol aktif tanpa nomor BPJS memiliki jadwal retry 3 jam dan tombol Retry pada Monitoring BPJS. |
| 5 | Idempotensi | 0 duplikasi Surat Kontrol BPJS akibat retry command dengan action, record, version, dan idempotency key yang sama. |
| 6 | Waktu membuka form | Shell form tampil kurang dari 2 detik pada kondisi normal; Informasi Potensi PRB boleh masih loading. |
| 7 | Dynamic form | Perubahan Program PRB merender/reset field kurang dari 500 ms tanpa reload halaman. |
| 8 | Simpan internal | Response simpan internal kurang dari 2 detik pada kondisi normal dan tidak menunggu hasil final BPJS. |
| 9 | Print | Preview/dokumen siap ditampilkan kurang dari 1 detik pada kondisi normal. |
| 10 | Auditability | 100% create, update, reset PRB, dan attempt integrasi memiliki actor, timestamp, version, correlation ID, dan hasil. |

Target volume, batch cron, dan SLA final Service Integrasi masih [PERLU KONFIRMASI]. Target Update `< 2 detik` yang disebut ticket belum dibuat sebagai metric terpisah karena menunggu keputusan audit sebelumnya.

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 — MVP | Phase 2 — Advanced / Escalation |
|---|---|---|
| Form Surat Kontrol | Create/Edit/Print V1 atau V2 dari Rawat Jalan, Rawat Inap, IGD, dan VK; field umum sama pada kedua versi. | Penyempurnaan UX lintas-unit dan konfigurasi field lanjutan. |
| Konfigurasi Versi | Konfigurasi domain `V1`/`V2`; V2 mempertahankan implementasi sebelumnya; versi disimpan pada snapshot/job. | Pengelolaan konfigurasi terpusat dan rollout per fasilitas [PERLU KONFIRMASI]. |
| Potensi PRB | Khusus V2: Get Potensi PRB melalui Service Integrasi saat form dibuka; tampil di bagian atas form; tidak mengunci pilihan. V1 tidak merender atau memanggil fitur ini. | Cache/reconciliation dan alert bila sumber sering tidak tersedia. |
| Program PRB | Khusus V2: default `Tidak Ada`; pilihan manual 9 Program PRB; dynamic TTV; reset nilai ketika program berubah. V1 tidak memiliki bagian ini. | Autofill TTV/pemeriksaan dari asesmen klinis [PERLU KONFIRMASI]. |
| Penyimpanan | Local-first save, full snapshot, record version, audit trail. | Retensi/version history lanjutan dan rekonsiliasi data. |
| Integrasi BPJS | Command Insert/Update V2 ke Service Integrasi; nomor BPJS menjadi indikator keberhasilan. | Dead-letter, aging alert, dan eskalasi operasional. |
| Retry | Cron setiap 3 jam dan Retry manual pada Monitoring BPJS. | Kebijakan max attempts dan escalation rule [PERLU KONFIRMASI]. |
| Monitoring BPJS | Menggunakan Dashboard Monitoring Tindak Lanjut Kontrol BPJS existing; status diturunkan dari nomor BPJS. | Kolom/filter Program PRB atau agregasi PRB [PERLU KONFIRMASI]. |
| Approval | Tidak ada approval berjenjang pada Phase 1. | Approval tidak dibutuhkan berdasarkan requirement saat ini; jika kelak diperlukan, dirancang sebagai workflow terpisah. |

### In Scope Phase 1

1. Create, Edit, dan Print Surat Kontrol V1 atau V2 dari Rawat Jalan, Rawat Inap, IGD, dan VK sesuai konfigurasi domain.
2. Form V1 dan V2 mengikuti `surkon-form`: Nomor Surat RS, identitas pasien, asal unit, booking, poli, dokter, tipe pembayaran, Obat Kronis BPJS, Status Kontrol, tanggal kontrol, tanggal habis rujukan, jam praktik, diagnosis, terapi, dan anjuran.
3. Status Kontrol: `Non Kronis`, `30 Hari`, dan `Kurang dari 30 Hari`.
4. Form V1 tidak menampilkan Informasi Potensi PRB dan tidak memiliki poin 2 Program PRB/Pemeriksaan Dinamis.
5. Form V2 menampilkan Informasi Potensi PRB di bagian paling atas form.
6. Form V2 menyediakan sembilan Program PRB: Diabetes Mellitus, Hipertensi, Asma, Penyakit Jantung, PPOK, Skizofrenia, Stroke, Epilepsi, dan SLE.
7. Khusus V2: dynamic form, validasi range/mandatory, reset nilai saat program berubah, dan full snapshot Update.
8. Local-first persistence, integration job sesuai versi, retry cron 3 jam, Retry manual, dan audit trail.
9. Print V2 menampilkan Program PRB di bawah informasi jam praktik dokter; Print V1 tidak menampilkan Program PRB.

### Out of Scope

1. Direct hit E19 ke endpoint BPJS, credential BPJS, signing, encryption/decryption Trustmark, dan token BPJS.
2. Implementasi internal transformasi payload dan koneksi BPJS di Service Integrasi.
3. Surat Rujuk Balik/SRB; terkait E21.
4. Mapping otomatis 144 diagnosis FKTP/Potensi PRB ke sembilan Program PRB.
5. Approval berjenjang.
6. Pembatalan Surat Kontrol di BPJS [PERLU KONFIRMASI].
7. Unit pelayanan di luar Rawat Jalan, Rawat Inap, IGD, dan VK.
8. Penentuan klinis PRB stabil/tidak stabil [PERLU KONFIRMASI]; keputusan klinis tetap pada dokter/petugas berwenang.

## 5. Related Features

| Kode/Sistem | Fitur | Relasi Teknis/Bisnis |
|---|---|---|
| **E19** | Surat Kontrol — RJ/RI/IGD/VK | Fitur utama dalam PRD ini. |
| B1 | Pendaftaran Rawat Jalan | Sumber registrasi, pasien, penjamin, dan episode RJ. |
| E13 | Discharge Pasien | Titik keputusan tindak lanjut pasien sebelum Surat Kontrol. |
| E20 | SPRI | Alternatif tindak lanjut bila pasien perlu rawat inap. |
| E21 | Pembuatan Surat/Rujuk Balik | Menangani SRB/rujuk balik; tidak digabungkan dengan Surat Kontrol. |
| C6 | External Platform — Surat Kontrol | Relasi/sinkronisasi external platform [PERLU KONFIRMASI]. |
| Service Integrasi | Bridging BPJS VClaim | Satu-satunya komponen yang boleh berkomunikasi langsung dengan BPJS. |
| Monitoring BPJS | Dashboard Tindak Lanjut Kontrol | Menampilkan hasil integrasi dan tombol Retry. |

## 6. Business Process & User Stories

### State Machine Table

Status tidak disediakan sebagai input pada form Create. `internal_status=ACTIVE` ditetapkan otomatis oleh sistem setelah penyimpanan internal berhasil.

| Status Internal | Nomor Surat BPJS | Deskripsi | Efek Stok | Transisi Phase 1 | Transisi Phase 2 |
|---|---|---|---|---|---|
| `ACTIVE` | kosong | Surat internal tersedia, belum memperoleh nomor BPJS. | N/A | Dispatch/Retry → tetap ACTIVE; hasil sukses mengisi nomor BPJS. | Aging alert/escalation. |
| `ACTIVE` | terisi | Surat internal telah memperoleh nomor Surat Kontrol BPJS. | N/A | Edit → full snapshot Update melalui Service Integrasi. | Rekonsiliasi otomatis. |
| `CANCELLED` | kosong/terisi | Surat dibatalkan internal. | N/A | Tidak eligible cron; flow pembatalan BPJS [PERLU KONFIRMASI]. | Workflow pembatalan/escalation bila disetujui. |

`PROCESSING`, `RETRY_PENDING`, dan `REQUIRES_REVIEW` hanya status teknis integration job, bukan status bisnis/flag Surat Kontrol.

### User Stories Utama

| ID | Role | Task | Goal |
|---|---|---|---|
| US-001 | Dokter/petugas pelayanan | Membuka form tanpa menunggu BPJS | Pelayanan tidak terhambat. |
| US-002 | Dokter/petugas | Melihat Potensi PRB di bagian atas form | Langsung mengetahui potensi pasien saat form dibuka. |
| US-003 | Dokter | Memilih Program PRB secara manual | Pilihan dapat mengikuti kondisi klinis walau berbeda dari rekomendasi. |
| US-004 | Dokter | Melihat hanya TTV/pemeriksaan yang relevan | Form lebih ringkas dan mengurangi salah input. |
| US-005 | Petugas | Menyimpan Surat Kontrol meskipun integrasi gagal | Pasien tetap memiliki dokumen internal. |
| US-006 | Petugas | Melihat status pada Monitoring BPJS | Mengetahui apakah nomor BPJS sudah tersedia. |
| US-007 | Tim Integrasi | Menerima command terstandar dan idempotent | Tidak terjadi duplikasi BPJS. |
| US-008 | Administrator | Menjalankan retry otomatis/manual | Gangguan sementara pulih tanpa input ulang. |
| US-009 | Auditor | Menelusuri perubahan dan attempt | Setiap hasil dapat dibuktikan. |
| US-010 | Petugas | Melakukan Update dengan full snapshot | Data internal dan BPJS tidak berbeda karena partial update. |
| US-011 | Petugas | Mendapat peringatan perubahan belum disimpan | Input tidak hilang tanpa sengaja. |
| US-012 | Petugas | Mencetak Program PRB dan status nomor BPJS | Dokumen tidak disalahartikan. |

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

#### Fitur FR-001 — Load Form dan Informasi Potensi PRB

- **User Story:** US-001, US-002.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-001.1:** Form dan data internal tampil kurang dari 2 detik pada kondisi normal walaupun Service Integrasi lambat/tidak tersedia.
  - **AC-001.2:** Pada V2, saat form dibuka, SIMRS otomatis meminta Potensi PRB melalui Service Integrasi.
  - **AC-001.3:** Pada V2, Informasi Potensi PRB berada di bagian paling atas dan menyatu dengan form input sebelum field pasien/kontrol.
  - **AC-001.4:** Hasil Potensi PRB tidak otomatis mengubah Program PRB.
  - **AC-001.5:** Jika hasil gagal, form tetap dapat digunakan dan UI menampilkan informasi belum tersedia.
  - **AC-001.6:** Network trace membuktikan E19 hanya memanggil Service Integrasi, bukan host BPJS.
  - **AC-001.7:** Pada V1, UI tidak merender Informasi Potensi PRB dan tidak mengirim request Get Potensi PRB.

#### Fitur FR-002 — Form Create/Edit Surat Kontrol

- **User Story:** Sebagai petugas, saya ingin mengisi data Surat Kontrol existing, agar format operasional tetap familiar.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-002.1:** Form memuat seluruh field pada Data Requirements §8.1.1.
  - **AC-002.2:** Status Kontrol memiliki pilihan Non Kronis, 30 Hari, dan Kurang dari 30 Hari.
  - **AC-002.3:** Poli dan dokter berasal dari master aktif; kode dokter BPJS tidak diketik manual.
  - **AC-002.4:** Diagnosis minimal satu baris; diagnosis, terapi, dan anjuran mendukung tambah/hapus baris.
  - **AC-002.5:** Internal status ditetapkan ACTIVE oleh sistem dan tidak tampil sebagai input.
  - **AC-002.6:** Seluruh field umum memiliki isi, validasi, dan perilaku yang sama pada V1 dan V2.

#### Fitur FR-003 — Program PRB dan Dynamic Form

- **User Story:** US-003, US-004.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Berlaku untuk:** V2 saja.
- **Acceptance Criteria:**
  - **AC-003.1:** Default Program PRB adalah `Tidak Ada`; blok pemeriksaan disembunyikan.
  - **AC-003.2:** Sembilan Program PRB tersedia dengan kode `01`–`09`.
  - **AC-003.3:** Pemilihan program merender field terkait kurang dari 500 ms tanpa reload.
  - **AC-003.4:** Manual override terhadap rekomendasi Potensi PRB diizinkan.
  - **AC-003.5:** Pergantian program langsung menghapus nilai program lama dan menampilkan field program baru.
  - **AC-003.6:** Memilih kembali `Tidak Ada` menyembunyikan seluruh field PRB dan command tidak memuat `formPRB`.
  - **AC-003.7:** Pada V1, seluruh poin 2 Program PRB dan Pemeriksaan Dinamis tidak dirender dan field PRB tidak dikirim pada snapshot/command.

#### Fitur FR-004 — Validasi TTV/Pemeriksaan PRB

- **User Story:** Sebagai dokter, saya ingin validasi spesifik per program, agar payload tidak ditolak.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Berlaku untuk:** V2 saja.
- **Acceptance Criteria:**
  - **AC-004.1:** Nilai di luar range ditolak dengan pesan yang menyebut label dan range.
  - **AC-004.2:** Field boolean hanya menerima Ya/Tidak dan dipetakan menjadi `1/0` pada command.
  - **AC-004.3:** HBA1C dan Asam Urat menerima desimal.
  - **AC-004.4:** Field program yang tidak aktif tidak ikut snapshot/payload.
  - **AC-004.5:** Mandatory field mengikuti konfigurasi final yang disepakati tim klinis dan integrasi [PERLU KONFIRMASI untuk mapping yang masih konflik].

#### Fitur FR-005 — Local-First Save dan Dispatch Command

- **User Story:** US-005, US-007.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-005.1:** Surat internal dan outbox job tersimpan dalam satu transaksi database.
  - **AC-005.2:** Service Integrasi down/timeout tidak me-rollback Surat Kontrol internal.
  - **AC-005.3:** Nomor Surat RS tersedia setelah local save; nomor BPJS boleh masih kosong.
  - **AC-005.4:** UI menampilkan bahwa surat internal berhasil dan integrasi akan dicoba kembali.
  - **AC-005.5:** Command memuat command ID, correlation ID, idempotency key, action, entity, dan record version.
  - **AC-005.6:** `202 Accepted` tanpa nomor BPJS tetap ditampilkan sebagai Belum Terintegrasi.

#### Fitur FR-006 — Update Full Snapshot

- **User Story:** US-010.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-006.1:** Update satu field tetap mengirim seluruh isi form aktif, bukan partial payload.
  - **AC-006.2:** Nomor Surat Kontrol BPJS digunakan untuk action UPDATE bila sudah tersedia; bila belum tersedia, snapshot terbaru tetap action INSERT.
  - **AC-006.3:** Update menaikkan `record_version` dan menyimpan audit trail.
  - **AC-006.4:** Callback version lama tidak boleh menimpa snapshot atau hasil version terbaru.

#### Fitur FR-007 — Retry Cron dan Retry Manual

- **User Story:** US-008.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-007.1:** Cron berjalan setiap 3 jam dan memilih Surat Kontrol ACTIVE dengan `bpjs_control_number` kosong serta `next_retry_at <= now`.
  - **AC-007.2:** Dua instance worker tidak memproses job/version yang sama bersamaan.
  - **AC-007.3:** Retry memakai idempotency key yang sama untuk action, record, dan version yang sama.
  - **AC-007.4:** Baris tanpa nomor BPJS pada Monitoring BPJS menyediakan tombol Retry.
  - **AC-007.5:** Klik Retry mengirim command ke Service Integrasi, bukan BPJS langsung.
  - **AC-007.6:** Setelah nomor BPJS tersimpan, record tidak dipilih lagi untuk retry Insert.

#### Fitur FR-008 — Dashboard Monitoring Tindak Lanjut Kontrol BPJS

- **User Story:** US-006.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-008.1:** Tidak dibuat dashboard khusus Surat Kontrol atau Monitoring Integrasi terpisah.
  - **AC-008.2:** Monitoring memuat filter tanggal, jenis, aktivitas, pencarian nama/RM, counter Gagal dan Total.
  - **AC-008.3:** Kolom minimum: No. RM, No. Surat, No. SEP, Nama, Tanggal Rencana Kontrol, Poli, Kode Dokter, Jenis, Aktivitas, Status Integrasi, dan Aksi.
  - **AC-008.4:** Nomor BPJS terisi menampilkan Terintegrasi tanpa Retry; kosong menampilkan Belum Terintegrasi dan Retry.

#### Fitur FR-009 — Unsaved Changes

- **User Story:** US-011.
- **Prioritas:** P1.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-009.1:** Form dirty memunculkan peringatan sebelum ditutup.
  - **AC-009.2:** Pilih keluar membuang perubahan tanpa mengubah database dan pembukaan berikutnya re-fetch snapshot tersimpan.
  - **AC-009.3:** Pilih tetap di form mempertahankan nilai edit.

#### Fitur FR-010 — Print Surat Kontrol

- **User Story:** US-012.
- **Prioritas:** P1.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-010.1:** Pada V2, Program PRB tampil di bagian bawah setelah jam praktik dokter.
  - **AC-010.2:** Nomor BPJS ditampilkan bila tersedia; dokumen tanpa nomor BPJS tidak boleh menampilkan nomor palsu.
  - **AC-010.3:** Preview/dokumen siap kurang dari 1 detik pada kondisi normal.
  - **AC-010.4:** Pada V1, preview/print tidak menampilkan label maupun nilai Program PRB.

#### Fitur FR-011 — Audit Trail

- **User Story:** US-009.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-011.1:** Create/Update mencatat actor, timestamp, version, dan before/after atau change-set.
  - **AC-011.2:** Attempt mencatat command ID, correlation ID, idempotency key, action, result, response code aman, dan durasi.
  - **AC-011.3:** Token, signature, dan credential tidak masuk log.

#### Fitur FR-012 — Konfigurasi Versi Surat Kontrol

- **User Story:** Sebagai administrator/developer, saya ingin memilih kontrak Surat Kontrol V1 atau V2 melalui konfigurasi domain, agar sistem dapat mengikuti ketersediaan fitur pihak ketiga BPJS tanpa membuat alur pelayanan terpisah.
- **Prioritas:** P0.
- **Fase:** Phase 1.
- **Acceptance Criteria:**
  - **AC-012.1:** Konfigurasi hanya menerima nilai `V1` atau `V2`; nilai kosong/tidak valid ditolak dan dicatat tanpa memulai dispatch.
  - **AC-012.2:** Konfigurasi `V1` menampilkan hanya Form Surat Kontrol umum serta memakai command Insert/Update V1 tanpa `prb_potential`, `prb_program_code`, atau `prbData/formPRB`.
  - **AC-012.3:** Konfigurasi `V2` mempertahankan form yang telah dibuat sebelumnya, termasuk Informasi Potensi PRB dan poin 2 Program PRB/Pemeriksaan Dinamis.
  - **AC-012.4:** Versi yang digunakan disimpan pada Surat Kontrol dan integration job sehingga retry memakai versi snapshot awal, bukan konfigurasi terbaru secara otomatis.
  - **AC-012.5:** Perubahan konfigurasi tidak mengubah versi record existing tanpa aksi migrasi eksplisit.
  - **AC-012.6:** FE boleh menentukan komposisi tampilan dan BE boleh menjadi resolver konfigurasi, namun BE wajib memvalidasi versi serta menghapus/menolak field yang tidak berlaku sebelum dispatch.

### 7.2 Validasi — Wording Frontend

| Field/Kondisi | Tipe Input | Rules | Error Message | Helper Text |
|---|---|---|---|---|
| Tipe Pembayaran | Dropdown | Required | “Tipe Pembayaran wajib dipilih.” | “Mengikuti penjamin pada registrasi pasien.” |
| Booking Pendaftaran | Radio | Required | “Pilih status Booking Pendaftaran.” | “Pilih Ya bila kontrol sekaligus dibuatkan booking.” |
| Nama Poli | Lookup | Required, poli aktif | “Nama Poli wajib dipilih.” | “Pilih poli tujuan kontrol.” |
| Nama Dokter | Lookup | Required, dokter aktif, punya kode BPJS | “Dokter wajib dipilih dan harus memiliki kode BPJS.” | “Dokter mengikuti poli dan jadwal aktif.” |
| Status Kontrol | Dropdown | Required, enum | “Status Kontrol wajib dipilih.” | “Pilih Non Kronis, 30 Hari, atau Kurang dari 30 Hari.” |
| Tanggal Kontrol Kembali | Date | Required, format valid | “Tanggal Kontrol Kembali wajib diisi dan harus valid.” | “Pilih tanggal rencana pasien kembali kontrol.” |
| Diagnosis | Repeater lookup | Required, minimal 1 | “Minimal satu Diagnosis wajib dipilih.” | “Gunakan diagnosis dari EMR/ICD-10.” |
| Program PRB (V2) | Dropdown | Optional, `NONE/01–09` | “Program PRB tidak valid.” | “Informasi Potensi PRB hanya rekomendasi.” |
| TTV numeric (V2) | Number | Range sesuai mapping | “{Label} harus berada pada rentang {min}–{max} {unit}.” | “Isi sesuai hasil pemeriksaan pasien.” |
| TTV mandatory (V2) | Number/Radio | Required per program | “{Label} wajib diisi untuk Program PRB {program}.” | “Field wajib mengikuti konfigurasi BPJS.” |
| Unsaved changes | Form state | Dirty check | “Perubahan belum disimpan. Apakah Anda yakin ingin keluar?” | “Pilih Tidak untuk melanjutkan pengisian.” |
| Integrasi gagal | System result | Nomor BPJS kosong | “Surat Kontrol internal berhasil disimpan. Integrasi BPJS belum berhasil dan akan dicoba kembali.” | “Pantau atau lakukan Retry melalui Monitoring BPJS.” |

## 8. Data & Technical Specifications

### 8.1 Data & Business Rules

#### 8.1.1 Spesifikasi Data — Form Input CREATE/EDIT

##### A. Identitas dan Konteks

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `control_letter_id` | ID Surat Internal | UUID | Ya | Unik, immutable | Auto-generate | Tidak tampil sebagai input. |
| `integration_version` | Versi Surat Kontrol | Enum/system | Ya | `V1`, `V2` | Konfigurasi domain E19 | Disimpan pada record dan job; bukan pilihan user operasional. |
| `internal_control_number` | Nomor Surat RS | Text/read-only | Ya | Unik | Auto-generate | Berbeda dari nomor BPJS. |
| `registration_id` | ID Registrasi | Lookup/UUID | Ya | Episode aktif/valid | Registrasi | |
| `service_type` | Jenis Pelayanan | Enum/read-only | Ya | `OUTPATIENT`, `INPATIENT`, `EMERGENCY`, `MATERNITY/VK` | Episode | Scope RJ/RI/IGD/VK. |
| `medical_record_number` | No. RM | Text/read-only | Ya | Format kanonik RS | Master pasien | |
| `patient_name` | Nama Pasien | Text/read-only | Ya | Maks. 100 karakter | Master pasien | |
| `birth_date` | Tanggal Lahir | Date/read-only | Ya | `DD MMMM YYYY` pada UI | Master pasien | |
| `address` | Alamat | Textarea/read-only | Tidak | Alamat tersimpan | Master pasien | |
| `source_unit_name` | Asal Unit | Text/read-only | Ya | Unit episode aktif | Episode | |
| `bpjs_card_number` | No. Kartu BPJS | Text/read-only | Kondisional | 13 digit [PERLU KONFIRMASI] | Penjamin/SEP | Wajib bridging BPJS. |
| `sep_number` | No. SEP | Text/read-only | Kondisional | Format SEP | Modul SEP | Wajib Insert V2. |
| `sep_date` | Tanggal SEP | Date/read-only | Kondisional | `YYYY-MM-DD` | Modul SEP | Query Potensi PRB. |
| `prb_potential` | Informasi Potensi PRB | Object/read-only | Tidak | Status, kategori, source time | Service Integrasi | Khusus V2; tampil paling atas; rekomendasi. Tidak dimuat pada V1. |

##### B. Data Kontrol

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `payment_type_id` | Tipe Pembayaran | Lookup | Ya | Penjamin aktif | Registrasi/default | |
| `bpjs_chronic_drug` | Obat Kronis BPJS | Radio boolean | Ya | Ada/Tidak | Pelayanan/default Tidak | |
| `control_status` | Status Kontrol | Enum | Ya | `NON_CHRONIC`, `THIRTY_DAYS`, `LESS_THAN_THIRTY_DAYS` | Default Non Kronis | |
| `booking_registration` | Booking Pendaftaran | Radio boolean | Ya | Ya/Tidak | Konteks/default | |
| `referral_unit_id` | Nama Poli | Lookup | Ya | Poli aktif | Master unit | Mapping `poliKontrol`. |
| `doctor_id` | Nama Dokter | Lookup | Ya | Dokter aktif | Master staf/jadwal | |
| `doctor_bpjs_code` | Kode Dokter BPJS | Text/read-only | Ya untuk BPJS | Tidak kosong | Master integrasi staf | Tidak manual. |
| `control_date` | Tanggal Kontrol Kembali | Date | Ya | `YYYY-MM-DD`; aturan status [PERLU KONFIRMASI] | Manual | |
| `referral_expiry_date` | Tanggal Habis Rujukan | Date/read-only | Kondisional | `YYYY-MM-DD` | Rujukan/SEP | |
| `control_times` | Jam Praktik Dokter | Time range/read-only | Ya | Start < end | Jadwal dokter | Dicetak. |
| `diagnoses` | Diagnosis | Repeater lookup | Ya | Minimal 1 | EMR/manual | Full snapshot. |
| `therapies` | Terapi | Repeater text/lookup | Tidak | Tambah/hapus baris | EMR/manual | |
| `suggestions` | Anjuran | Repeater lookup/text | Tidak | Master atau Tambah Baru | Master anjuran/manual | |
| `prb_program_code` | Program PRB | Enum | Tidak | `NONE`, `01–09` | Default `NONE` | Khusus V2; manual override diizinkan. Tidak ada pada V1. |
| `internal_status` | Status Internal | Enum/system | Ya | Default `ACTIVE` | Sistem | Bukan input user. |
| `record_version` | Versi Data | Integer/system | Ya | Mulai 1, increment Update | Sistem | Optimistic locking. |
| `created_by` | Dibuat Oleh | Lookup/system | Ya | User aktif | Session login | |

##### C. Dynamic TTV/Pemeriksaan PRB

Seluruh subsection ini hanya berlaku untuk Surat Kontrol V2. Surat Kontrol V1 tidak merender dan tidak menyimpan field PRB.

Mandatory yang belum final tetap `[PERLU KONFIRMASI]`; dokumen referensi memiliki perbedaan pada beberapa field.

| Program | Field BPJS | Label | Tipe | Wajib | Range/Enum | Satuan |
|---|---|---|---|---|---|---|
| Diabetes `01` | `HBA1C` | HbA1c | Decimal | Tidak | 0.1–15 | % |
| `01` | `GDP` | Gula Darah Puasa | Integer | Ya | 10–500 | mg/dL |
| `01` | `GD2JPP` | Gula Darah 2 Jam PP | Integer | Tidak | 10–500 | mg/dL |
| `01` | `eGFR` | eGFR | Integer | Tidak | 5–150 | mL/min |
| `01` | `TD_Sistolik` | TD Sistolik | Integer | [PERLU KONFIRMASI] | 20–200 | mmHg |
| `01` | `TD_Diastolik` | TD Diastolik | Integer | Ya | 20–200 | mmHg |
| `01` | `LDL` | LDL | Integer | Tidak | 20–500 | mg/dL |
| Hipertensi `02` | `eGFR` | eGFR | Integer | [PERLU KONFIRMASI] | 5–150 | mL/min |
| `02` | `Rata_TD_Sistolik` | Rata-rata TD Sistolik | Integer | [PERLU KONFIRMASI] | 20–200 | mmHg |
| `02` | `Rata_TD_Diastolik` | Rata-rata TD Diastolik | Integer | [PERLU KONFIRMASI] | 20–200 | mmHg |
| `02` | `JantungKoroner` | Jantung Koroner | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `02` | `Stroke` | Stroke | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `02` | `VaskularPerifer` | Vaskular Perifer | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `02` | `Aritmia` | Aritmia | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `02` | `AtrialFibrilasi` | Atrial Fibrilasi | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| Asma `03` | `Terkontrol` | Terkontrol | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `03` | `Gejala2xMinggu` | Gejala >2x/Minggu | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `03` | `BangunMalam` | Bangun Malam | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `03` | `KeterbatasanFisik` | Keterbatasan Fisik | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `03` | `FungsiParu` | Fungsi Paru | Integer | [PERLU KONFIRMASI] | 0–100 | — |
| Jantung `04` | `Rata_TD_Sistolik` | Rata-rata TD Sistolik | Integer | Ya | 20–200 | mmHg |
| `04` | `Rata_TD_Diastolik` | Rata-rata TD Diastolik | Integer | Ya | 20–200 | mmHg |
| `04` | `Aritmia` | Aritmia | Boolean | Ya | 0/1 | — |
| `04` | `NadiIstirahat` | Nadi Istirahat | Integer | Ya | 20–200 | kali/menit |
| `04` | `SesakNapas3Bulan` | Sesak Napas 3 Bulan | Boolean | Ya | 0/1 | — |
| `04` | `NyeriDada3Bulan` | Nyeri Dada 3 Bulan | Boolean | Ya | 0/1 | — |
| `04` | `SesakNapasAktivitas` | Sesak Napas saat Aktivitas | Boolean | Ya | 0/1 | — |
| `04` | `NyeriDadaAktivitas` | Nyeri Dada saat Aktivitas | Boolean | Ya | 0/1 | — |
| PPOK `05` | `SkorMMRC` | Skor MMRC | Integer | Tidak | 0–40 | — |
| `05` | `Eksaserbasi1Tahun` | Eksaserbasi 1 Tahun | Boolean | Ya | 0/1 | — |
| `05` | `MampuAktivitas` | Mampu Aktivitas | Boolean | Ya | 0/1 | — |
| Skizofrenia `06` | `Remisi` | Remisi | Integer | [PERLU KONFIRMASI] | 0–100 | — |
| `06` | `TerapiRumatan` | Terapi Rumatan | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `06` | `Usia` | Usia | Integer | [PERLU KONFIRMASI] | 1–100 | tahun |
| Stroke `07` | `GDP` | Gula Darah Puasa | Integer | [PERLU KONFIRMASI] | 10–500 | mg/dL |
| `07` | `TD_Sistolik` | TD Sistolik | Integer | [PERLU KONFIRMASI] | 20–200 | mmHg |
| `07` | `TD_Diastolik` | TD Diastolik | Integer | [PERLU KONFIRMASI] | 20–200 | mmHg |
| `07` | `LDL` | LDL | Integer | [PERLU KONFIRMASI] | 20–500 | mg/dL |
| `07` | `AsamUrat` | Asam Urat | Decimal | [PERLU KONFIRMASI] | 0.1–20 | mg/dL |
| Epilepsi `08` | `Epileptik6Bulan` | Epileptik 6 Bulan | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `08` | `EfekSampingOAB` | Efek Samping OAB | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| `08` | `HamilMenyusui` | Hamil/Menyusui | Boolean | [PERLU KONFIRMASI] | 0/1 | — |
| SLE `09` | `RemisiSLE` | Remisi SLE | Integer | Ya | 0–100 | — |
| `09` | `Hamil` | Hamil | Boolean | Ya | 0/1 | — |

#### 8.1.2 Spesifikasi Data — Monitoring BPJS

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|---|---|---|---|---|
| No. RM | Master pasien | Text | Cari | |
| No. Surat | `bpjs_control_number` | Text atau `—` | Cari/sort | Kosong = belum terintegrasi. |
| No. SEP | `sep_number` | Text | Cari | |
| Nama | Master pasien | Text | Cari nama/RM | |
| Tanggal Rencana Kontrol | `control_date` | `DD-MM-YYYY` | Filter tanggal/sort | |
| Poli | Master poli | Text | Filter | |
| Kode Dokter | Mapping dokter BPJS | Text | Filter | |
| Jenis | Jenis tindak lanjut | Badge/text | Filter | Nilai final mengikuti Monitoring BPJS existing. |
| Aktivitas | Attempt terakhir | Badge/text | Filter | Insert, Update, Retry, Gagal. |
| Status Integrasi | Turunan nomor BPJS | Terintegrasi/Belum Terintegrasi | Filter | Bukan field tersimpan. |
| Aksi | Hak akses | Tombol Retry | — | Hanya bila nomor BPJS kosong. |

#### 8.1.3 Data Integrasi — System Managed

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|---|---|---|---|---|---|---|
| `bpjs_control_number` | No. Surat Kontrol BPJS | Text | Tidak | Unik bila tersedia | Service Integrasi | Indikator tunggal keberhasilan. |
| `integration_action` | Aksi | Enum | Ya | `INSERT/UPDATE` | Sistem | Berdasarkan nomor BPJS. |
| `command_id` | Command ID | UUID | Ya | Unik | Sistem | |
| `correlation_id` | Correlation ID | UUID/Text | Ya | End-to-end trace | Sistem | |
| `idempotency_key` | Idempotency Key | Text | Ya | Unik action+record+version | Sistem | Stabil saat retry. |
| `job_status` | Status Job Teknis | Enum | Ya | `PENDING/PROCESSING/RETRY_PENDING/REQUIRES_REVIEW/SUCCEEDED` | Worker | Bukan status bisnis. |
| `attempt_count` | Jumlah Percobaan | Integer | Ya | >=0 | Default 0 | |
| `last_attempt_at` | Percobaan Terakhir | Datetime | Tidak | ISO 8601 timezone | Sistem | |
| `next_retry_at` | Retry Berikutnya | Datetime | Tidak | Slot 3 jam | Sistem | Untuk nomor BPJS kosong. |
| `last_error_code` | Kode Error | Text | Tidak | Kode aman | Service Integrasi | |
| `last_error_message` | Pesan Error | Text | Tidak | Disanitasi | Service Integrasi | Tidak memuat secret. |
| `locked_until` | Batas Lock | Datetime | Tidak | Lease time | Worker | Anti double processing. |

#### 8.1.4 Business Rules

| ID | Business Rule |
|---|---|
| BR-001 | E19 dan cron dilarang memanggil BPJS langsung; seluruh operasi melalui Service Integrasi. |
| BR-002 | Surat internal dan integration job harus tersimpan atomik; kegagalan dispatch tidak me-rollback surat. |
| BR-003 | Status dihitung dari nomor BPJS: terisi = Terintegrasi; kosong = Belum Terintegrasi. |
| BR-004 | Nomor BPJS hanya boleh berasal dari Service Integrasi dan tidak dapat diedit user. |
| BR-005 | Create/Update menaikkan `record_version`; callback version lama tidak boleh menimpa data terbaru. |
| BR-006 | Tanpa nomor BPJS menggunakan INSERT; dengan nomor BPJS menggunakan UPDATE. |
| BR-007 | Command wajib memiliki command ID, correlation ID, dan idempotency key. |
| BR-008 | Timeout/unknown result tetap Belum Terintegrasi; retry memakai idempotency key yang sama. |
| BR-009 | Cron 3 jam hanya memilih ACTIVE, nomor BPJS kosong, jatuh tempo, dan tidak terkunci. |
| BR-010 | Lock/lease wajib mencegah dispatch paralel job yang sama. |
| BR-011 | Program PRB opsional, default `Tidak Ada`; Potensi PRB tidak mengunci pilihan. |
| BR-012 | Program PRB aktif hanya menampilkan field yang dipetakan; `Tidak Ada` tidak mengirim `formPRB`. |
| BR-013 | Pergantian Program PRB langsung menghapus nilai program lama. |
| BR-014 | Update menyimpan/mengirim full snapshot. |
| BR-015 | Perubahan belum disimpan tidak mengubah database; buang perubahan harus re-fetch snapshot. |
| BR-016 | Mandatory/range mengikuti konfigurasi program; konflik referensi diselesaikan sebelum UAT. |
| BR-017 | Kegagalan Potensi PRB tidak menghalangi Create/Edit internal. |
| BR-018 | Nomor Surat RS dan nomor BPJS berbeda; nomor BPJS menjadi indikator integrasi. |
| BR-019 | Dokumen tanpa nomor BPJS tidak boleh menampilkan nomor BPJS palsu. |
| BR-020 | Credential/token/signature tidak boleh masuk application log. |
| BR-021 | Konfigurasi domain E19 hanya `V1` atau `V2`; versi yang digunakan wajib tersimpan pada record dan integration job. |
| BR-022 | V1 tidak memanggil Potensi PRB, tidak merender poin 2 Program PRB, dan tidak mengirim field/payload PRB. |
| BR-023 | V2 mempertahankan implementasi Surat Kontrol dan PRB yang telah dibuat sebelumnya. |
| BR-024 | Retry wajib memakai versi pada snapshot job; perubahan konfigurasi tidak mengubah record/job existing secara implisit. |

### 8.2 Recommended API Endpoints — English

| Method | Endpoint | Function |
|---|---|---|
| GET | `/api/v1/registrations/{registrationId}/control-letter` | Get existing control letter and BPJS number. |
| GET | `/api/v1/registrations/{registrationId}/prb-potential` | Request PRB potential through Integration Service. |
| POST | `/api/v1/registrations/{registrationId}/control-letters` | Create internal snapshot and outbox job. |
| PUT | `/api/v1/control-letters/{controlLetterId}` | Update full snapshot and create versioned job. |
| GET | `/api/v1/bpjs/control-letter-monitoring` | Monitoring filters, counters, derived status, and actions. |
| POST | `/api/v1/control-letters/{controlLetterId}/retry` | Retry through Integration Service. |
| GET | `/api/v1/control-letters/{controlLetterId}/print` | Generate print preview/document. |
| POST | `/api/v1/integration-events/bpjs/control-letter` | Authenticated, idempotent result callback [ASUMSI]. |

### 8.3 Command Contract — Integration Service

`commandType` wajib mengikuti `integration_version`: `BPJS_CONTROL_LETTER_INSERT_V1`/`UPDATE_V1` atau `BPJS_CONTROL_LETTER_INSERT_V2`/`UPDATE_V2`. Contoh berikut adalah V2. Command V1 menggunakan field umum yang sama tetapi tidak memuat `prbProgramCode` dan `prbData/formPRB`.

Untuk V2, Service Integrasi membentuk payload BPJS `request`, `kdStatusPRB`, dan `formPRB.data`. Untuk V2 non-PRB, `prbProgramCode/prbData` tidak dikirim atau null sesuai kontrak. Untuk V1, elemen PRB tidak boleh dibentuk atau dikirim.

Tanpa `bpjsControlNumber`, status tampilan tetap Belum Terintegrasi. Callback stale wajib dicatat tetapi tidak boleh menimpa version terbaru.

### 8.4 Cron Retry

- Schedule: setiap 3 jam, timezone `Asia/Jakarta`. (Dikembalikan ke DEV, karena ada max hit ke BPJS)
- Selection: `control_letters.bpjs_control_number IS NULL`, internal status ACTIVE, `next_retry_at <= now`, lock kosong/kedaluwarsa.
- Processing: atomic lock/`SKIP LOCKED`, kirim snapshot version aktif ke Service Integrasi, simpan attempt.
- Success: simpan nomor BPJS setelah hasil final/version match.
- Retryable failure: jadwalkan slot 3 jam berikutnya.
- Non-retryable: `REQUIRES_REVIEW` [PERLU KONFIRMASI daftar error].
- Timeout/unknown: tetap nomor BPJS kosong dan rekonsiliasi dengan idempotency key sebelum Insert baru.
- Max attempts: [PERLU KONFIRMASI].

### 8.5 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-001 | Local save dan outbox berada dalam satu transaksi. |
| NFR-002 | Gangguan Service Integrasi/BPJS tidak menghalangi form dan penyimpanan internal. |
| NFR-003 | Create/Update/Retry/Callback idempotent. |
| NFR-004 | Optimistic locking menggunakan `record_version`. |
| NFR-005 | Service-to-service authentication, TLS, allowlist, dan least privilege. |
| NFR-006 | Log tidak mengekspos credential atau data klinis berlebihan. |
| NFR-007 | Metrik pending, success rate, retry count, oldest pending age, latency, dan error code tersedia. |
| NFR-008 | Form, dynamic render, local save, dan print memenuhi Goals §3. |
| NFR-009 | Audit log append-only dengan timezone, actor, version, dan correlation ID. |
| NFR-010 | Status tidak dibedakan hanya dengan warna. |
| NFR-011 | Mapping Program PRB/range/mandatory dikonfigurasi dan versioned. |

### 8.6 Integrasi Eksternal dan Internal

| Sistem | Arah | Data/Tujuan | Aturan |
|---|---|---|---|
| Registrasi/EMR | Konsumsi | Pasien, episode, diagnosis, SEP, unit | Tidak mengubah sumber data. |
| Master Staff/Jadwal | Konsumsi | Dokter, kode BPJS, poli, jam praktik | Kode BPJS wajib bridging. |
| Service Integrasi | Dua arah | Potensi PRB, Insert/Update, hasil final | Satu-satunya gateway BPJS. |
| BPJS VClaim V2 | Tidak langsung | Potensi PRB dan Rencana Kontrol V2 | Hanya diakses Service Integrasi. |
| Scheduler/Cron | Internal | Memilih surat tanpa nomor BPJS | Setiap 3 jam. |
| Monitoring BPJS | Internal | Status turunan dan Retry | Bukan dashboard khusus E19. |
| E21 | Internal | Rujuk Balik/SRB | Di luar scope E19. |

### 8.8 Risks, Assumptions, Open Questions, Definition of Done

#### Risks & Mitigation

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Timeout tetapi BPJS sebenarnya sukses | Duplicate Insert | Idempotency key dan inquiry/reconciliation di Service Integrasi. |
| Callback version lama | Hasil lama menimpa data | Version matching dan optimistic locking. |
| Cron multi-instance | Double dispatch | Atomic lock/lease atau `SKIP LOCKED`. |
| Error validasi berulang | Beban/noise | Klasifikasi non-retryable → review. |
| Mapping mandatory konflik | Penolakan BPJS | Finalisasi konfigurasi sebelum UAT. |
| Print sebelum nomor BPJS | Dokumen disalahartikan | Pisahkan nomor RS/BPJS dan tampilkan Belum Terintegrasi. |

#### Assumptions

- Service Integrasi menyediakan command API dan hasil final dengan entity/version/correlation atau status query ekuivalen.
- Service Integrasi bertanggung jawab atas idempotensi ke BPJS dan log bridging teknis.
- RBAC pelayanan mengatur pengguna Create/Edit/Print/Retry.
- Nomor Surat RS boleh terbit sebelum nomor BPJS.
- Program PRB dipilih manual, bukan mapping otomatis ICD-10.
- V2 adalah perilaku existing sebelum konfigurasi versi ditambahkan.

#### Open Questions

1. Pola hasil Service Integrasi: synchronous response, callback, message broker, atau polling?
2. Endpoint/schema resmi Get Potensi PRB, Insert V2, Update V2, dan inquiry?
3. SLA final setelah `202 Accepted`?
4. Error retryable/non-retryable dan aturan review?
5. Max attempts dan eskalasi operasional?
6. Rekonsiliasi timeout setelah BPJS sebenarnya sukses?
7. Apakah surat tanpa nomor BPJS boleh diberikan ke pasien dan wording apa yang disetujui?
8. Mapping mandatory TTV final, termasuk konflik `TD_Sistolik` Diabetes?
9. Sumber autofill TTV dan aturan rata-rata tekanan darah?
10. Pembatalan internal perlu membatalkan di BPJS?
11. Otorisasi Edit setelah terintegrasi/tanggal kontrol lewat?
12. Scope uniqueness nomor BPJS lintas tenant?
13. Relasi C6 External Platform?
14. PRB stabil/tidak stabil dan monitoring pasien PRB masih menunggu keputusan audit sebelumnya.
15. Lokasi dan media konfigurasi versi (FE environment, BE configuration service, atau konfigurasi tenant/fasilitas) diputuskan developer sesuai arsitektur aplikasi.

#### Definition of Done

1. Seluruh AC P0 lulus unit, integration, concurrency, dan UAT.
2. Tidak ada direct dependency/network route E19 ke BPJS.
3. Service down, BPJS error, ambiguous timeout, duplicate/stale callback, dan cron paralel teruji.
4. Local Create/Update tetap tersimpan saat integrasi gagal.
5. Retry 3 jam dan Retry manual tidak membuat duplikasi.
6. Mapping sembilan PRB dan mandatory disetujui Product, klinis, dan tim integrasi.
7. Audit trail, Monitoring BPJS, Retry, dan observability tersedia.
8. Kontrak Service Integrasi dan runbook review disetujui.

### 8.9 Notes Untuk Developer

1. Fitur dan kontrak PRB disediakan oleh pihak ketiga **BPJS**, bukan oleh tim integrasi. Tim integrasi berperan sebagai gateway/adapter dan tidak menjadi sumber keputusan bisnis PRB.
2. Tambahkan konfigurasi pada domain E19 untuk memilih versi Surat Kontrol: `V1` atau `V2`. Nama key yang direkomendasikan adalah `control_letter.integration_version`.
3. Penggunaan konfigurasi di FE atau BE dikembalikan kepada developer. Walaupun FE dapat memakai konfigurasi untuk composition/rendering, BE tetap harus menjadi enforcement point atas schema command yang dikirim.
4. Nilai konfigurasi harus eksplisit. Untuk menjaga kompatibilitas implementasi yang sudah ada, environment existing dapat dimigrasikan dengan nilai awal `V2`; nilai kosong atau selain `V1`/`V2` tidak boleh fallback diam-diam.
5. **Form Surat Kontrol V1** berisi field umum yang sama dengan form existing, tetapi tidak memiliki:
   - bagian **Informasi Potensi PRB**; dan
   - poin **2. Program PRB dan Pemeriksaan Dinamis**, termasuk seluruh field TTV/pemeriksaan PRB.
6. **Form Surat Kontrol V2** adalah form yang telah dibuat sebelumnya dan tetap memiliki Informasi Potensi PRB serta poin 2 Program PRB/Pemeriksaan Dinamis.
7. Simpan `integration_version` pada record Surat Kontrol dan `payload_snapshot_json`/integration job. Retry harus memakai versi snapshot tersebut agar perubahan konfigurasi tidak mengirim record lama menggunakan kontrak baru.
8. Pada V1, jangan memanggil Get Potensi PRB dan jangan mengirim `prb_potential`, `prb_program_code`, `prbData`, `kdStatusPRB`, atau `formPRB`. BE harus menghapus atau menolak field PRB yang masuk pada mode V1.
9. Pisahkan mapper/validator/command type per versi (`*_V1` dan `*_V2`) dengan shared model untuk field umum; hindari conditional yang tersebar di setiap field.
10. Perubahan konfigurasi hanya berlaku untuk pembuatan record baru. Migrasi record existing ke versi lain harus berupa aksi eksplisit, tervalidasi, dan diaudit.
11. **Pastikan Fitur tetap bisa berjalan meskipun ada trouble dari BPJS**

## 9. Workflow / BPMN Interpretation

E19 tidak memiliki BPMN khusus pada repository. Workflow diturunkan dari ticket, dokumen SRS/PRB Enhancement, referensi UI, dan arsitektur Service Integrasi yang disepakati. [ASUMSI]

### 9.1 Membuka Form dan Potensi PRB

```text
[Buka Surat Kontrol dari episode RJ/RI/IGD/VK]
  → Muat data registrasi, pasien, SEP, dokter, poli, dan surat tersimpan
  → Resolve integration_version dari record existing atau konfigurasi domain
  → Tampilkan form < 2 detik
  → integration_version = V1?
       Ya    → tampilkan field umum tanpa Informasi Potensi PRB dan tanpa poin 2 Program PRB
       Tidak → mode V2:
               → Tampilkan badge Potensi PRB di bagian paling atas dalam keadaan loading
               → SIMRS → Service Integrasi: GET_PRB_POTENTIAL
               → Service Integrasi → BPJS
               → Hasil tersedia?
                    Ya    → tampilkan Potensi/Tidak Potensi sebagai rekomendasi
                    Tidak → tampilkan informasi belum tersedia; form tetap aktif
               → Program PRB default Tidak Ada atau nilai terakhir tersimpan
```

### 9.2 Create dan Integrasi Berhasil

```text
[User isi form → Simpan]
  → Validasi field umum + dynamic PRB khusus V2
  → Simpan Surat internal + integration_version + record_version + outbox secara atomik
  → internal_status = ACTIVE; nomor BPJS kosong
  → Kirim command INSERT_V1 atau INSERT_V2 sesuai snapshot ke Service Integrasi
  → Service Integrasi hit BPJS sesuai versi
  → Hasil final sukses + nomor BPJS
  → Cocokkan entity/version/correlation
  → Simpan bpjs_control_number
  → Monitoring menampilkan Terintegrasi
```

### 9.3 Gagal dan Retry

```text
[Surat internal berhasil tersimpan]
  → Command gagal/timeout
  → Nomor BPJS tetap kosong
  → Simpan attempt, error, dan next_retry_at
  → Tampilkan Belum Terintegrasi pada Monitoring BPJS
  → Jalur A: Cron setiap 3 jam memilih record jatuh tempo
  → Jalur B: Petugas klik Retry
  → Keduanya mengirim ulang command ke Service Integrasi dengan idempotency key yang sama
  → Jika nomor BPJS diterima, status tampilan otomatis Terintegrasi
```

### 9.4 Update Full Snapshot

```text
[Buka Surat Kontrol tersimpan]
  → Tampilkan snapshot terakhir
  → User mengubah field
  → Jika Program PRB berubah, reset pemeriksaan lama
  → Simpan full snapshot + increment record_version
  → Nomor BPJS tersedia? Ya = UPDATE; Tidak = INSERT snapshot terbaru
  → Kirim command melalui Service Integrasi
  → Callback stale tidak boleh menimpa version terbaru
```

### 9.5 Unsaved Changes

```text
[User menutup form dengan perubahan]
  → Tampilkan konfirmasi
  → Tidak keluar → kembali ke form dan pertahankan nilai edit
  → Ya, keluar → buang perubahan, jangan ubah database, re-fetch snapshot tersimpan
```
