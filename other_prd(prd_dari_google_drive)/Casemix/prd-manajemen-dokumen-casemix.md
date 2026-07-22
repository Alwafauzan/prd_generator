# PRD — Casemix: Manajemen Dokumen & Data Medis (G8)

**Related Document:** PRD-K-CSMX-v1.0.docx — Modul Casemix (Klaim BPJS), Neurovi SIMRS v2, Klaster Klaim (Tamtech International, v1.0, 9 Juli 2026, Status: Draft — Review). Related Feature: G8 Casemix > Pengelolaan Klaim BPJS > Managemen Dokumen dan Data Medis. Fitur terkait se-klaster: G5 Pengajuan Klaim, G6 Integrasi third party (V-Claim BPJS), G7 Integrasi E-Klaim (grouping), G9 Penerimaan Klaim & BA, G10 Resubmit Pengajuan Klaim. Sumber data hulu: RME/Resume Medis, Registrasi/SEP, Penunjang (Lab/Rad), Farmasi, Billing.
**Versi:** 1.0 — Rilis awal PRD G8 (Manajemen Dokumen & Data Medis) diturunkan dari PRD-K-CSMX-v1.0. Fokus: konsolidasi otomatis data medis per episode JKN (tanpa double entry), checklist kelengkapan berkas klaim, pengelolaan/unggah dokumen pendukung, dan koding ICD-10/ICD-9-CM. Bridging/grouping (G7), pengajuan (G5), penerimaan BA & rekonsiliasi (G9), serta resubmit (G10) ditangani fitur terkait.
**Tanggal:** 9 Juli 2026

## 1. Metadata Dokumen

**Kode Dokumen:** PRD-K-CSMX-G8 (turunan PRD-K-CSMX-v1.0) · **Produk:** Neurovi SIMRS v2 · **Modul:** Casemix / Manajemen Dokumen & Data Medis · **Klaster:** Klaim (Core Integration) · **Target RS:** Tipe C/D (ref: RS PKU Muhammadiyah Wonosobo) · **Status:** Draft — Review.

* **Approval**:

| Peran | Nama | Jabatan |
|-------|------|---------|
| Disusun oleh | Ibrahim Alirafi | PIC PRD |
| Diperiksa oleh | Nurfitri | Product Owner |
| Diperiksa oleh | Nurfitri | System Analyst |
| Disetujui oleh | M. Sulthan Farras Nanz | Chief Strategy & Growth Officer |

* **Related Documents**:
    * PRD-K-CSMX-v1.0 — Modul Casemix (Klaim BPJS) — dokumen induk (overview, latar belakang, alur klaim end-to-end, business rule, integrasi, kesiapan iDRG).
    * Fitur terkait se-klaster: G5 (Pengajuan Klaim), G6 (Integrasi V-Claim BPJS), G7 (Integrasi E-Klaim/grouping), G9 (Penerimaan Klaim & BA), G10 (Resubmit).
    * Regulasi acuan: PMK No. 26/2021 (pedoman INA-CBGs), PMK No. 24/2022 (RME sumber utama resume medis), UU No. 17/2023 (Kesehatan).

* **Document Version**:

| Versi | Tanggal | Deskripsi Perubahan | Penyusun |
|-------|---------|---------------------|----------|
| 1.0 | 9 Juli 2026 | Rilis awal PRD G8 — Manajemen Dokumen & Data Medis: overview & background, goals, scope & phasing, state machine dokumen/data, user story & AC, requirement fungsional, spesifikasi data & business rule, interpretasi alur. Diturunkan dari PRD-K-CSMX-v1.0. | Ibrahim Alirafi |

## 2. Overview & Background

* **Overview/Brief Summary**:
G8 adalah fitur **Manajemen Dokumen & Data Medis** pada modul Casemix — pilar *"kemudahan pengelolaan dokumen"* dari alur klaim BPJS. Fitur ini **mengonsolidasikan seluruh data yang menjadi dasar klaim** (identitas & administrasi pasien, SEP, riwayat pelayanan, diagnosa, prosedur/tindakan, hasil penunjang, resume medis, dan rincian billing) dari modul-modul operasional SIMRS ke dalam **satu berkas klaim per episode** yang utuh, terlacak kelengkapannya, dan siap dikoding/diverifikasi. G8 juga menyediakan **koding ICD-10 (diagnosa) & ICD-9-CM (prosedur)** dengan alat bantu pencarian. G8 **tidak** melakukan grouping/pengajuan/rekonsiliasi — itu ditangani fitur terkait (G5/G7/G9/G10); G8 menyiapkan "bahan" klaim yang lengkap dan konsisten sebelum masuk ke tahap tersebut.

Karena pembayaran JKN bersifat **prospektif** (tarif per kasus ditetapkan lewat *grouping*, bukan biaya aktual), maka **akurasi data, kelengkapan dokumen, dan ketepatan koding** menjadi penentu langsung besaran pembayaran. G8 adalah titik kendali kualitas berkas paling hulu untuk menekan pending/reject.

* **Business Process (As-Is vs To-Be)**:
    * **As-Is**:
        * Petugas Casemix mengumpulkan berkas rekam medis dan menyatukannya dengan billing **secara manual** per pasien; sering terjadi **input ganda (double entry)** dari modul lain.
        * Kelengkapan berkas (resume medis final + TTD DPJP, SEP, hasil penunjang, bukti tindakan) **tidak terpantau sistematis** — kekurangan baru diketahui saat pemberkasan atau setelah umpan balik verifikator BPJS.
        * Koding ICD-10/ICD-9-CM dilakukan koder dengan **acuan terpisah**; inkonsistensi diagnosa–prosedur baru ketahuan belakangan.
        * Data nasional: **~68% kasus pending** berkaitan dengan kesalahan koding diagnosa/prosedur; penyebab berulang lain = **resume medis tidak lengkap** & **berkas penunjang kurang**. Tim Casemix RS tipe C/D umumnya hanya **2–5 orang**, sehingga hanya sebagian kecil klaim sempat direview pra-submission.
    * **To-Be**:
        * Saat episode JKN selesai (RI pulang / RJ selesai), sistem **otomatis menarik & mengonsolidasi** data administrasi, klinis, penunjang, obat, dan billing per episode — **tanpa input ulang**.
        * **Checklist kelengkapan berkas wajib** dievaluasi otomatis; item yang kurang ditandai, dan episode tidak dapat naik status sampai lengkap (mis. resume final + TTD DPJP).
        * Koder menetapkan **ICD-10 & ICD-9-CM** dibantu pencarian kode; peringatan lunak muncul untuk kode *unspecified* (.9) bila data klinis mendukung kode lebih spesifik.
        * Semua dokumen pendukung dikelola digital per klaim dengan **audit trail** (tanpa hard delete) demi kepatuhan akreditasi (MRMIK/STARKES). Struktur data disiapkan **granular** agar siap transisi INA-CBG → iDRG tanpa perombakan.

* **Latar Belakang (ringkas)**:
    * **Sistem casemix JKN**: tarif INA-CBGs (1.077 kelompok — 789 RI, 288 RJ), koding diagnosis **ICD-10** & prosedur **ICD-9-CM**, dikelompokkan lewat *grouper* (UNU/E-Klaim). Sumber pengelompokan = **resume medis**; kelengkapan administratif = syarat keabsahan klaim.
    * **Deadline**: klaim diajukan **paling lambat tanggal 10 bulan berikutnya** — kelengkapan berkas hulu (tanggung jawab G8) menentukan ketepatan pengajuan (G5).
    * **Transisi iDRG**: INA-Grouper iDRG menggantikan INA-CBG **secara bertahap** (uji coba nasional 1 Okt 2025, target rollout 2026) — **belum ada go-live nasional resmi**; pola transisi umumnya **dual-running 6–12 bulan**. iDRG menuntut koding lebih granular (dx utama, komorbiditas, komplikasi, LOS) + validasi konsistensi lebih ketat. **[KEPUTUSAN]** Arsitektur data medis G8 dirancang granular & siap validasi konsistensi sejak awal, sehingga peralihan ke iDRG hanya butuh pembaruan modul grouper/pemetaan (di G7), bukan perombakan G8.

## 3. Goals & Metrics

**Tujuan fitur G8**: menyediakan satu tempat konsolidasi data & dokumen klaim per episode tanpa input ganda; mempermudah pengelolaan & pelacakan kelengkapan berkas; menyediakan koding & fondasi validasi konsistensi pra-submission; serta menyiapkan data granular siap iDRG.

| No | Metrics | Baseline | Success Criteria |
|----|---------|----------|------------------|
| 1 | Pending rate akibat koding & kelengkapan berkas (bagian yang dikendalikan G8) | Kondisi berjalan RS (nasional ~68% pending terkait koding) | Turun ≥ 30% dalam 3 bulan |
| 2 | Kelengkapan berkas wajib per episode saat naik ke *Siap Koding* | Manual, tidak terpantau | 100% episode *Siap Koding* memenuhi checklist wajib |
| 3 | Rata-rata waktu konsolidasi & penyiapan berkas per klaim | Manual | Turun ≥ 40% |
| 4 | Eliminasi input ganda (double entry) data medis dari modul hulu | Input ulang manual | 0 input ulang untuk field yang tersedia di sumber SIMRS |
| 5 | Kelengkapan koding komorbiditas/komplikasi (dx sekunder) | — | Meningkat & terpantau per koder |
| 6 | Ketepatan pengisian resume medis final + TTD DPJP sebelum koding | Manual | 100% episode terkoding memiliki resume final ber-TTD (BR-03) |

## 4. Scope Definition & Phasing

**Catatan phasing**: Phase 1 = konsolidasi + pengelolaan dokumen + koding dasar (tanpa verifikasi berjenjang), namun arsitektur data disiapkan untuk Phase 2 (verifikasi/separation of duties) dan siap iDRG. **Phase 3 (Mapping COA) = N/A** untuk G8 — pengakuan pendapatan/piutang klaim & jurnal dilakukan di modul Billing/Akuntansi dan pada penerimaan pembayaran (G9), bukan pada pengelolaan dokumen/data medis. Struktur data tetap menyimpan referensi (id_klaim, tarif) agar modul keuangan dapat memetakan COA di hilir.

| Fitur/Modul | Phase 1 (MVP: Konsolidasi & CRUD Dokumen) | Phase 2 (Advanced: Verifikasi/Kontrol) | Phase 3 (Accounting: Mapping COA) |
|-------------|-------------------------------------------|----------------------------------------|-----------------------------------|
| Work-list episode JKN | List episode RI/RJ + filter + indikator kelengkapan | Prioritas otomatis (risiko/selisih), SLA deadline | N/A |
| Konsolidasi data medis | Tarik otomatis administrasi/klinis/penunjang/obat/billing per episode | Refresh delta + deteksi perubahan sumber pasca-kunci | N/A |
| Checklist kelengkapan berkas | Checklist wajib ada/tidak + penanda item kurang | Blokir naik status + override berwenang tercatat | N/A |
| Pengelolaan dokumen pendukung | Unggah/lihat/ganti berkas digital per klaim + audit | Versioning berkas + e-sign resume DPJP | N/A |
| Koding ICD-10 / ICD-9-CM | Pencarian & penetapan dx primer/sekunder & prosedur | Peringatan konsistensi & separation of duties (BR-15) | N/A |
| Data medis (dx/prosedur/resume/LOS) | Simpan granular (CC/MCC, LOS, urutan dx) siap iDRG | Kunci pasca-verifikasi + jejak perubahan koding | N/A |

**Out of Scope (G8)**:
* Bridging/grouping ke E-Klaim (kode CBG + tarif) → **G7**.
* Penyusunan batch & pengajuan klaim ke E-Klaim/BPJS + berita acara → **G5**.
* Integrasi V-Claim BPJS (kepesertaan & penerbitan SEP) → **G6** (G8 hanya *menerima* SEP sebagai data).
* Penerimaan status BPJS, BAHV, rekonsiliasi nilai → **G9**.
* Pengelolaan pending/dispute & re-submission → **G10**.
* Pengembangan grouper/tarif mandiri (mengandalkan grouper resmi via bridging).
* Implementasi penuh skema iDRG (severity granular, MDC, ICD-10-IM/ICD-9-IM) — arsitektur disiapkan, implementasi *deferred*.
* Verifikasi digital BPJS (Vidi/Vedika), aturan readmisi/fragmentasi, purifikasi data, anti-fraud.
* Klaim non-BPJS (asuransi swasta) → G11–G14. Pengiriman resume ke SATUSEHAT → G27 (deferred untuk konteks klaim).

## 5. Related Features

G8 adalah **titik hulu** rantai klaim BPJS; ia menyiapkan berkas & data medis yang konsisten, lalu menyerahkannya (*handoff*) ke fitur hilir.

| Kode | Fitur | Relasi dengan G8 |
|------|-------|------------------|
| **G5** | Pengajuan Klaim | Menerima episode ber-status *Siap Ajukan* dari G8 (berkas 100% lengkap) untuk disusun batch & diajukan. |
| **G6** | Integrasi third party (V-Claim BPJS) | Menyediakan data kepesertaan & **SEP** yang dikonsumsi G8 sebagai syarat & item checklist. |
| **G7** | Integrasi E-Klaim (grouping) | Menerima paket data medis (dx/prosedur/LOS) hasil koding G8 untuk *grouping* → kode CBG + tarif; hasil dikembalikan ke record klaim. |
| **G9** | Penerimaan Klaim & BA | Menerima umpan balik BPJS/BAHV; alasan pending dapat mengembalikan episode ke G8 untuk perbaikan berkas/koding. |
| **G10** | Resubmit Pengajuan Klaim | Setelah G8 merevisi berkas/koding atas klaim pending/dispute, G10 mengajukan ulang dalam batas waktu. |
| Modul hulu SIMRS | Registrasi/SEP, RME/Resume Medis, Pelayanan RI/RJ, Penunjang (Lab/Rad), Farmasi, Billing | **Sumber data** konsolidasi otomatis G8 (administrasi, diagnosa, prosedur, penunjang, obat, billing). |

## 6. Business Process & User Stories

* **State Machine Table** — G8 mengelola *irisan hulu* dari siklus klaim (konsolidasi → siap ajukan). Status *Ter-grouping/Diajukan/Pending/Disetujui/Dibayar* berada di fitur hilir (G5/G7/G9) dan hanya dirujuk. Status **tidak diinput manual** di form; transisi dipicu event/kelengkapan (bukan toggle aktif/nonaktif master data).

| Status | Deskripsi | Efek pada Berkas/Data | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------------------|--------------------|--------------------|
| Draft / Terkumpul | Episode terbentuk, data sedang dikonsolidasi otomatis. | Data medis di-*pull* dari sumber SIMRS. | → Belum Lengkap / Siap Koding | idem |
| Belum Lengkap | Ada item checklist wajib yang kurang (mis. resume belum final). | Koding **diblokir**; item kurang ditandai. | → Siap Koding (saat lengkap) | idem + blokir override tercatat |
| Siap Koding | Berkas wajib lengkap & resume final ber-TTD DPJP. | Data terkunci sebagai basis koding. | → Terkoding | idem |
| Terkoding | Dx (ICD-10) & prosedur (ICD-9-CM) telah ditetapkan. | Paket data medis siap di-*handoff* ke grouping (G7). | → *Ter-grouping* (handoff G7) | → Verifikasi Internal → Terkoding/Siap Ajukan |
| (rujukan) Ter-grouping / Siap Ajukan | Diproses fitur hilir; dapat kembali ke *Terkoding* bila revisi. | Perubahan koding pasca-handoff via jejak audit. | dikelola G5/G7 | Verifikasi internal (BR-10/BR-15) |

> Transisi **mundur** (kembali ke *Terkoding*/*Belum Lengkap*) dimungkinkan dari verifikasi internal (Phase 2) maupun umpan balik BPJS (G9→G10). Setiap transisi tercatat di audit trail (BR-10/BR-11).

* **User Stories Utama** (subset G8 dari PRD-K-CSMX; format Role–Task–Goal):
    * **US-01 (Koder)**: melihat *work-list* episode JKN siap dikoding beserta status kelengkapan, agar dapat memprioritaskan pekerjaan & tak melewatkan episode.
    * **US-02 (Koder)**: data pasien, pelayanan, diagnosa, prosedur, penunjang & billing terkumpul otomatis per episode, agar tak perlu input ulang (tanpa double entry).
    * **US-03 (Koder)**: mencari & menetapkan kode ICD-10 & ICD-9-CM dengan bantuan pencarian, agar koding cepat & akurat.
    * **US-08 (Petugas Administrasi Klaim)**: mengelola & mengunggah berkas pendukung digital per klaim, agar berkas lengkap & siap diverifikasi BPJS.
    * **US-13 (DPJP)**: melengkapi & menandatangani resume medis serta mengonfirmasi diagnosa, agar berkas klaim absah & siap dikoding.
    * **US-G8-1 (Koder/Verifikator)**: melihat penanda inkonsistensi awal diagnosa–prosedur–tindakan–obat pada berkas, agar potensi pending terdeteksi sebelum handoff grouping (*fondasi* validasi, penuh di Phase 2 / fitur verifikasi).

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Work-list Episode JKN (FR-01)**
* **User Story**: US-01.
* **Prioritas**: P0 (Must).
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Menu **Casemix > Manajemen Dokumen & Data Medis** menampilkan daftar episode JKN (RI & RJ) dengan kolom pada §8.3.2 (no. SEP, no. RM/nama, jenis rawat, penjamin, tgl pulang, **status kelengkapan**, status klaim).
    * **AC 2**: Tersedia **filter** (periode, penjamin, jenis rawat RI/RJ, status, unit) & **search** (no. SEP / no. RM / nama) yang bekerja kombinatif tanpa reload penuh.
    * **AC 3**: *Given* berkas belum lengkap, *When* episode ditampilkan, *Then* status **Belum Lengkap** dan **item yang kurang ditandai**.
    * **AC 4**: Hanya episode dengan **penjamin BPJS/JKN** yang tampil di alur ini (BR-01); episode tanpa SEP valid ditandai *menunggu SEP* (BR-02).

**Fitur: Konsolidasi Otomatis Data Medis (FR-02)**
* **User Story**: US-02.
* **Prioritas**: P0 (Must).
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: *Given* episode dipilih, *When* halaman detail dibuka, *Then* data **administrasi, klinis, penunjang, obat, dan billing** tampil terkonsolidasi dari sumber SIMRS **tanpa input ulang**.
    * **AC 2**: *Given* data sumber berubah **sebelum** koding (status ≤ Siap Koding), *When* detail dimuat ulang, *Then* data mengikuti sumber terbaru; **setelah** terkunci, perubahan sumber ditandai *delta* (tidak menimpa diam-diam).
    * **AC 3**: Setiap field konsolidasi menampilkan **sumber asal** (modul & timestamp) untuk keterlacakan (NFR-04).

**Fitur: Checklist Kelengkapan Berkas Wajib (FR-03)**
* **User Story**: US-01, US-08.
* **Prioritas**: P0 (Must).
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Checklist berkas wajib per episode menampilkan status **ada/tidak** (mis. SEP, resume medis final + TTD DPJP, hasil penunjang, bukti tindakan, billing).
    * **AC 2**: *Given* resume medis belum final / belum ber-TTD DPJP, *Then* status episode tetap **Belum Lengkap** dan **koding diblokir** (BR-03).
    * **AC 3**: *Given* seluruh item wajib terpenuhi, *When* dievaluasi, *Then* episode dapat naik ke **Siap Koding**; kelengkapan 100% adalah syarat menuju *Siap Ajukan* (BR-08).

**Fitur: Pengelolaan & Unggah Dokumen Pendukung (FR-08)**
* **User Story**: US-08.
* **Prioritas**: P0 (Must).
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Petugas dapat **mengunggah, melihat, dan mengganti** berkas pendukung digital (PDF/gambar) per jenis berkas, dengan metadata (jenis, wajib y/t, diunggah_oleh, waktu).
    * **AC 2**: **Tidak ada hard delete**; penggantian/penghapusan tercatat sebagai versi/aksi di audit trail (BR-11).
    * **AC 3**: Ukuran/tipe file divalidasi; berkas rusak/format tak didukung ditolak dengan pesan jelas.

**Fitur: Koding ICD-10 & ICD-9-CM (FR-04)**
* **User Story**: US-03.
* **Prioritas**: P0 (Must).
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: *Given* koder mengetik kata kunci/kode, *When* pencarian dijalankan, *Then* daftar kode **ICD-10** (diagnosa) / **ICD-9-CM** (prosedur) yang cocok muncul & dapat dipilih.
    * **AC 2**: Koder dapat menetapkan **≥1 diagnosa primer (wajib)** + diagnosa **sekunder/komplikasi/komorbiditas** (dengan penanda jenis & urutan) serta prosedur (BR-05).
    * **AC 3**: *Given* hanya kode **unspecified (.9)** dipilih padahal data klinis mendukung kode lebih spesifik, *When* disimpan, *Then* sistem menampilkan **peringatan lunak** (BR-13) — tidak memblokir, tapi tercatat.
    * **AC 4**: *Given* dx & prosedur telah lengkap, *When* disimpan, *Then* episode menjadi **Terkoding** & paket data siap di-*handoff* ke grouping (G7).

**Fitur: Fondasi Validasi Konsistensi (FR-06 — parsial di G8)**
* **User Story**: US-G8-1, US-05 (induk).
* **Prioritas**: P1 (Should) untuk penanda; verifikasi berjenjang penuh = Phase 2 / fitur verifikasi.
* **Fase**: Phase 1 (penanda) → Phase 2 (blokir/override).
* **Acceptance Criteria**:
    * **AC 1**: Sistem menampilkan **penanda inkonsistensi awal** (mis. prosedur tanpa dukungan diagnosa; dx komplikasi tanpa bukti tindakan/penunjang).
    * **AC 2 (Phase 2)**: *Given* terdapat temuan wajib, *When* koder mencoba lanjut, *Then* episode tidak dapat naik ke *Siap Ajukan* sampai temuan diselesaikan/di-*override* oleh peran berwenang (tercatat).

**Fitur: Audit Trail Dokumen & Koding (FR-14)**
* **User Story**: US-08, US-13 (kepatuhan).
* **Prioritas**: P0 (Must).
* **Fase**: Phase 1.
* **Acceptance Criteria**:
    * **AC 1**: Setiap aksi (konsolidasi, unggah/ganti berkas, koding, perubahan status) tercatat: aktor, aksi, dari_status → ke_status, catatan, waktu.
    * **AC 2**: Log **tak-terhapus** dan dapat ditelusuri per episode (MRMIK/STARKES) — NFR-02.

* **Validasi**:

  **A. Wording Validasi (Frontend)**

  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode ICD-10 (Dx primer) | Autocomplete | Required (≥1 primer), dari master ICD-10 | "Diagnosa primer wajib dipilih" | "Cari kode/istilah diagnosa (ICD-10)" |
  | Kode ICD-9-CM (Prosedur) | Autocomplete | Opsional, dari master ICD-9-CM | "Kode prosedur tidak dikenal" | "Cari kode/nama prosedur (ICD-9-CM)" |
  | Jenis Diagnosa | Select | Required bila baris dx diisi (primer/sekunder/komplikasi/komorbiditas) | "Jenis diagnosa wajib dipilih" | "Tandai peran diagnosa untuk severity" |
  | Kode unspecified (.9) | (validasi lunak) | Soft-warning bila data klinis mendukung spesifik | — (peringatan, bukan error) | "Pertimbangkan kode lebih spesifik (BR-13)" |
  | Berkas Pendukung | File upload | Tipe: PDF/JPG/PNG; Maks (mis. 10MB/file) | "Format/ukuran file tidak didukung" | "Unggah resume/SEP/penunjang (PDF/gambar)" |
  | Resume Final + TTD DPJP | Status (read/aksi DPJP) | Wajib final sebelum Siap Koding (BR-03) | "Resume medis belum final/ber-TTD DPJP" | "Koding terbuka setelah resume difinalisasi DPJP" |
  | Catatan Verifikasi/Kembalikan | Textarea | Required saat mengembalikan (Phase 2) | "Catatan wajib diisi saat mengembalikan" | "Jelaskan alasan pengembalian ke koder" |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

> **Struktur DB final diserahkan tim dev** [ASUMSI]; usulan berikut acuan. Field bersama (`unit`, timestamp audit) memakai definisi kanonik lintas-PRD. Struktur **sengaja granular** (CC/MCC, LOS, urutan dx, versi grouper) demi **kesiapan iDRG** (BR-04).

* **Table Name**: `claim` (header klaim per episode)
    * `id`: UUID (Primary Key)
    * `episode_id`: UUID (FK → episode pelayanan SIMRS) — 1 episode = 1 klaim (BR-14)
    * `sep_no`: VARCHAR (no. SEP; syarat klaim — BR-02)
    * `mr_no`: VARCHAR (no. RM)
    * `care_type`: ENUM('RI','RJ')
    * `payer`: VARCHAR (penjamin; hanya BPJS/JKN masuk alur — BR-01)
    * `admission_date`, `discharge_date`: DATE
    * `length_of_stay`: INTEGER (LOS, hari — input severity iDRG)
    * `hospital_tariff`: BIGINT (Rp, tarif RS dari billing; snapshot)
    * `cbg_code`: VARCHAR (nullable — diisi hasil grouping G7)
    * `cbg_tariff`: BIGINT (nullable — hasil grouping G7)
    * `grouper_version`: VARCHAR (nullable — INA-CBG/iDRG dual-running; diisi G7) — NFR-08
    * `status`: ENUM (Terkumpul, BelumLengkap, SiapKoding, Terkoding, ...(hilir)) — dikelola sistem, bukan input
    * `is_deleted`: Boolean (default false) — tanpa hard delete (BR-11)
    * `created_by/at`, `updated_by/at`: audit

* **Table Name**: `claim_diagnosis`
    * `id`: UUID (PK) · `claim_id`: UUID (FK → claim, ON DELETE RESTRICT)
    * `dx_type`: ENUM('primer','sekunder','komplikasi','komorbiditas') — BR-05
    * `icd10_code`: VARCHAR · `description`: VARCHAR
    * `is_cc_mcc`: Boolean (penanda CC/MCC — severity iDRG)
    * `sequence`: INTEGER (urutan)
    * *(iDRG-ready)* `icd10_im_code`: VARCHAR (nullable — pemetaan ICD-10-IM, deferred)

* **Table Name**: `claim_procedure`
    * `id`: UUID (PK) · `claim_id`: UUID (FK)
    * `icd9cm_code`: VARCHAR · `description`: VARCHAR · `procedure_date`: DATE
    * *(iDRG-ready)* `icd9_im_code`: VARCHAR (nullable — deferred)

* **Table Name**: `claim_document` (berkas pendukung)
    * `id`: UUID (PK) · `claim_id`: UUID (FK)
    * `doc_type`: VARCHAR (resume_medis, sep, hasil_penunjang, bukti_tindakan, billing, lainnya)
    * `is_required`: Boolean · `is_present`: Boolean (status checklist — BR-08)
    * `file_ref`: VARCHAR (path/objek storage) · `version`: INTEGER (Phase 2 versioning)
    * `uploaded_by`, `uploaded_at`: audit · `is_deleted`: Boolean (soft — BR-11)

* **Table Name**: `claim_billing_summary`
    * `claim_id`: UUID (FK) · `total_hospital_cost`: BIGINT · `component_ref`: JSON/ref (→ modul Billing)

* **Table Name**: `claim_audit_log`
    * `id`: UUID (PK) · `claim_id`: UUID (FK) · `actor`: UUID · `action`: VARCHAR
    * `from_status`, `to_status`: VARCHAR · `note`: TEXT · `created_at`: TIMESTAMP (append-only — NFR-02, BR-10/11)

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/casemix/claims` | Work-list episode JKN + filter (periode, penjamin, care_type, status, unit) & search |
| GET | `/api/v1/casemix/claims/{id}` | Detail klaim terkonsolidasi (administrasi, klinis, penunjang, obat, billing) |
| POST | `/api/v1/casemix/claims/{id}/consolidate` | Trigger/refresh konsolidasi data dari sumber SIMRS |
| GET | `/api/v1/casemix/claims/{id}/checklist` | Status kelengkapan berkas wajib |
| GET | `/api/v1/icd10?q=` · `/api/v1/icd9cm?q=` | Pencarian kode diagnosa / prosedur |
| PUT | `/api/v1/casemix/claims/{id}/diagnoses` | Simpan set diagnosa (primer/sekunder/komplikasi/komorbiditas) |
| PUT | `/api/v1/casemix/claims/{id}/procedures` | Simpan set prosedur (ICD-9-CM) |
| POST | `/api/v1/casemix/claims/{id}/documents` | Unggah berkas pendukung (multipart) |
| GET | `/api/v1/casemix/claims/{id}/documents/{docId}` | Unduh/lihat berkas |
| GET | `/api/v1/casemix/claims/{id}/audit` | Audit trail episode |
| POST | `/api/v1/casemix/claims/{id}/submit-coding` | Tandai Terkoding & handoff paket data ke grouping (G7) |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar Detail/Koding Klaim)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| icd10_code (primer) | Diagnosa Primer | Autocomplete | Ya | ≥1, dari master ICD-10 | Input koder + acuan resume | BR-05 |
| icd10_code (sekunder) | Diagnosa Sekunder/Komplikasi/Komorbiditas | Autocomplete (multi) | Tidak | dari master ICD-10 | Input koder | Didorong utk severity; penanda CC/MCC |
| dx_type | Jenis Diagnosa | Select | Ya (per baris) | primer/sekunder/komplikasi/komorbiditas | Input koder | Menentukan urutan & severity |
| icd9cm_code | Prosedur/Tindakan | Autocomplete (multi) | Tidak | dari master ICD-9-CM | Input koder + bukti tindakan | — |
| doc (berkas) | Berkas Pendukung | File | Ya (yg wajib) | PDF/JPG/PNG, maks ukuran | Unggah petugas | Checklist wajib (BR-08); no hard delete (BR-11) |
| — (status) | Status Klaim | (sistem) | — | Tidak diinput; transisi via event | Sistem | State machine §6 |
| sep_no | No. SEP | (auto) | Ya | Valid, dari V-Claim (G6) | Registrasi/SEP | Syarat klaim (BR-02) |
| resume_final | Resume Final + TTD DPJP | (aksi DPJP) | Ya (pra-koding) | Final & ber-TTD | RME/DPJP | Gate koding (BR-03) |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (Work-list View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| No. SEP | claim.sep_no | Teks | Filter/Search | — |
| No. RM / Nama | claim.mr_no + pasien | Teks | Search | — |
| Jenis Rawat | claim.care_type | RI/RJ | Filter | RI validasi lebih ketat |
| Penjamin | claim.payer | Teks | Filter | Hanya BPJS/JKN (BR-01) |
| Tgl Pulang | claim.discharge_date | DD/MM/YYYY | Sort | Basis deadline tgl 10 (G5) |
| Status Kelengkapan | agregasi claim_document | Badge (Lengkap/Belum Lengkap) | Filter | Item kurang ditandai (FR-03) |
| Status Klaim | claim.status | Badge | Filter | State machine §6 |
| Koder | claim_audit_log | Teks | Filter | Separation of duties (BR-15) |

* **Business Rules** (subset G8 dari PRD-K-CSMX):
    * **BR-01**: Hanya episode dengan penjamin **BPJS/JKN** yang masuk alur casemix.
    * **BR-02**: Episode wajib memiliki **SEP valid** agar dapat diklaim.
    * **BR-03**: **Resume medis harus final & ditandatangani DPJP** sebelum status *Siap Koding*.
    * **BR-04**: Koding diagnosis **ICD-10**, prosedur **ICD-9-CM**; struktur data disiapkan untuk transisi **ICD-10-IM/ICD-9-IM (iDRG)**.
    * **BR-05**: **Minimal satu diagnosa primer** wajib; sekunder/komplikasi/komorbiditas didorong untuk ketepatan severity.
    * **BR-08**: Klaim tidak dapat naik ke *Siap Ajukan* (handoff G5) bila **checklist berkas wajib belum 100%**.
    * **BR-10**: Perubahan koding **setelah verifikasi** (Phase 2) harus melalui verifikator & tercatat pada audit trail.
    * **BR-11**: **Tanpa hard delete** berkas/klaim; semua perubahan tercatat untuk kepatuhan akreditasi (MRMIK/STARKES).
    * **BR-13**: Penggunaan kode **unspecified (.9)** memicu **peringatan lunak** bila data klinis mendukung kode lebih spesifik.
    * **BR-14**: **Satu episode = satu klaim**; readmisi/fragmentasi ditangani terpisah (*deferred*).
    * **BR-15**: **Separation of duties** — koder & verifikator internal tidak dirangkap akun yang sama pada episode yang sama (relevan saat Phase 2).

## 9. Workflow / BPMN Interpretation

**[ASUMSI]** Tidak ada BPMN Lucidchart khusus G8; alur diturunkan dari **§7 Alur Proses Bisnis PRD-K-CSMX-v1.0**, dibatasi pada tahap yang menjadi tanggung jawab G8 (tahap 1–4 & pengelolaan dokumen), dengan tahap 5–12 dirujuk sebagai *handoff* ke fitur hilir.

**Alur G8 (hulu rantai klaim):**
1. **Trigger episode** — Pasien JKN pulang (RI) / selesai pelayanan (RJ) → episode masuk *work-list* Casemix (FR-01).
2. **Konsolidasi data** — Sistem menarik SEP, resume medis, diagnosa, prosedur, hasil penunjang, obat, & billing per episode dari modul SIMRS (FR-02, tanpa double entry).
3. **Cek kelengkapan** — Sistem mengevaluasi checklist wajib (SEP valid, resume final + TTD DPJP, penunjang, bukti tindakan). Status: **Belum Lengkap → Siap Koding** (FR-03, BR-02/03/08).
4. **Koding** — Koder menetapkan **ICD-10** (dx primer + sekunder/komorbiditas/komplikasi) & **ICD-9-CM** (prosedur), dibantu pencarian; peringatan lunak untuk *unspecified* (FR-04, BR-05/13). Status → **Terkoding**.
5. **Pengelolaan dokumen** — Sepanjang alur, berkas pendukung digital diunggah/diganti per klaim dengan audit trail (FR-08, BR-11).
6. **Handoff** — Paket data medis (dx/prosedur/LOS/CC-MCC) diserahkan ke **grouping (G7)**; hasil kode CBG + tarif dikembalikan ke record klaim. Selanjutnya **verifikasi internal (Phase 2) → pemberkasan → pengajuan (G5) → monitoring/penerimaan (G9) → revisi/re-submit (G10)** — **di luar lingkup G8**.

> **Fondasi validasi (US-G8-1)**: penanda inkonsistensi awal diagnosa–prosedur–tindakan–obat dijalankan pada tahap 4–5 sebagai *quality gate* hulu; penegakan blokir/override penuh berada di tahap verifikasi internal (Phase 2). Ini adalah fondasi audit pra-submission yang makin krusial di era **iDRG**.

## Asumsi
- [ASUMSI] G8 = irisan 'Manajemen Dokumen & Data Medis' dari modul Casemix (PRD-K-CSMX-v1.0); grouping (G7), pengajuan (G5), penerimaan/BA & rekonsiliasi (G9), serta resubmit (G10) berada di fitur terkait dan DI LUAR lingkup G8.
- [ASUMSI] Tidak ada BPMN Lucidchart khusus G8; alur pada §9 diturunkan dari §7 PRD induk dan dibatasi pada tahap hulu (konsolidasi → koding → handoff), ditandai [ASUMSI].
- [ASUMSI] Modul hulu (Registrasi/SEP via G6, RME/Resume Medis, Penunjang Lab/Rad, Farmasi, Billing) menyediakan data sumber yang diperlukan untuk konsolidasi otomatis.
- [ASUMSI] Master kode ICD-10 & ICD-9-CM tersedia sebagai sumber pencarian (lookup); G8 hanya mereferensikan, bukan mengelola master kode.
- [ASUMSI] Struktur DB final (tabel/field/versi) diserahkan tim dev; usulan pada §8.1 hanya rancangan acuan yang sengaja dibuat granular demi kesiapan iDRG.
- [ASUMSI] Nilai uang (tarif RS/CBG) disimpan sebagai integer Rupiah; tarif CBG & versi grouper diisi oleh G7 (grouping), bukan dihitung G8 (BR-06 induk).
- [KEPUTUSAN] Phase 3 (Mapping COA) = N/A untuk G8 — pengakuan pendapatan/piutang klaim & jurnal dilakukan di modul Billing/Akuntansi dan pada penerimaan pembayaran (G9); G8 hanya menyimpan referensi (id_klaim, tarif) agar dapat dipetakan di hilir.
- [KEPUTUSAN] Status klaim bersifat state-machine event-driven (bukan toggle aktif/nonaktif master data); tidak ada input status di form create — sistem menetapkan transisi berdasarkan kelengkapan/aksi.
- [KEPUTUSAN] Arsitektur data medis dibuat siap iDRG sejak awal (penanda CC/MCC, LOS, urutan dx, kolom *_im deferred, versi grouper) agar transisi INA-CBG → iDRG hanya butuh pembaruan modul grouper/pemetaan (di G7).

## Pertanyaan Terbuka
- [PERLU KONFIRMASI] Daftar final 'berkas wajib' pada checklist kelengkapan per jenis rawat (RI vs RJ) — apakah sama dengan PRD induk (SEP, resume final+TTD, penunjang, bukti tindakan, billing) atau ada tambahan spesifik RS PKU? (OQ untuk Casemix RS)
- [PERLU KONFIRMASI] Metode integrasi pengambilan data hulu: pull langsung ke DB modul, service internal, atau event? (OQ-01 induk — Pradev/IT)
- [PERLU KONFIRMASI] Apakah fondasi validasi konsistensi (FR-06 penanda) cukup di Phase 1, atau verifikasi internal berjenjang (approve/kembalikan) ditarik ke MVP? (OQ-02 induk — PO)
- [PERLU KONFIRMASI] Skema Bayi Baru Lahir (BBL), naik kelas/urun biaya, dan readmisi — ditempatkan di fase mana dan bagaimana dampaknya ke struktur data G8? (OQ-03 induk — PO/SA)
- [PERLU KONFIRMASI] Batas ukuran/tipe file unggahan berkas pendukung & kebijakan retensi/versioning (Phase 2). (IT)
- [PERLU KONFIRMASI] Apakah e-sign resume DPJP dilakukan di dalam G8 atau sepenuhnya di modul RME (G8 hanya membaca status final)? (SA/RME)
