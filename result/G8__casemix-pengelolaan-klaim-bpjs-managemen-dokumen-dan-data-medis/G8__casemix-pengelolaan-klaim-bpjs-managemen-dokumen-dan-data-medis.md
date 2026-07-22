# PRD — Casemix — Pengelolaan Klaim BPJS: Managemen Dokumen dan Data Medis (G8)

**Related Document:** List Fitur V2.xlsx (sheet MVP, code G8); PRD G9 Penerimaan & Rekonsiliasi Klaim BPJS (hilir — konsumsi kontrak data klaim terkirim); Manual Web Service E-Klaim 5.10.x (attachments/Manual Web Service E-Klaim 5.10.x.pdf); Master ICD-10 & ICD-9-CM; Modul hulu SIMRS (RME, SEP/Pendaftaran, Penunjang, Farmasi, Billing); PRD G2 Tagihan Pasien
**Versi:** 1.0 - Draft awal, selaras model v1.6 PRD G9: G8 menjalankan integrasi teknis penuh ke E-Klaim (grouping + pengiriman + re-koding/resubmit klaim PENDING). Entri List Fitur G7 (grouping) & G10 (resubmit) TIDAK dipakai sebagai modul terpisah — dilebur ke G8 sesuai klarifikasi pemilik konteks.
**Tanggal:** 2026-07-16

## 1. Metadata Dokumen

**Approval**

| PRD Approved By | Nama / Jabatan | Tanggal |
|-----------------|----------------|---------|
| Disiapkan oleh | [PERLU KONFIRMASI] System Analyst | 2026-07-16 |
| Diperiksa oleh | [PERLU KONFIRMASI] Koordinator Casemix / Verifikator Internal | – |
| Disetujui oleh | [PERLU KONFIRMASI] Manajer Keuangan / Direktur RS | – |

**Related Documents**

- List Fitur V2.xlsx — sheet MVP, code **G8** (Casemix > Pengelolaan Klaim BPJS > Managemen Dokumen dan Data Medis).
- **PRD G9 — Penerimaan & Rekonsiliasi Klaim BPJS** (hilir). G9 **mengonsumsi** daftar klaim yang sudah terkirim dari G8 (`claim_submissions` — kunci `sep_no`, lihat §8.2 Kontrak G8→G9) sebagai acuan rekonsiliasi terhadap export Excel BPJS Pending/Dispute; G9 juga **mengembalikan** klaim berstatus `PENDING` ke G8 untuk re-koding.
- **Manual Web Service E-Klaim 5.10.x** → `attachments/Manual Web Service E-Klaim 5.10.x.pdf` (katalog method: `new_claim`, `set_claim_data`, koding Grouping iDRG, Import iDRG to INACBG, Grouping INACBG stage 1 & 2, `send_claim_individual`, `idrg_grouper_reedit`, `inacbg_grouper_reedit`, `reedit_claim`).
- **Master ICD-10** (diagnosis) & **ICD-9-CM** (tindakan/prosedur) — referensi koding.
- **Modul hulu SIMRS**: RME (resume medis, diagnosa, tindakan), Pendaftaran/SEP, Penunjang (lab/radiologi), Farmasi, Billing — sumber data konsolidasi (§7 FR-G8-02).
- PRD **G2** — Tagihan Pasien (tarif RS / real cost sebagai pembanding terhadap tarif grouper).

> **Catatan label & klarifikasi ruang lingkup (v1.0, selaras revisi G9 v1.6):** pada List Fitur, entri terpisah **G7** (Integrasi E-Klaim/INA-CBG) dan **G10** (Resubmit) **tidak dipakai sebagai modul tersendiri** dalam PRD ini. Sesuai klarifikasi langsung pemilik konteks (dituangkan di PRD G9 v1.6 §1), **G8 adalah modul yang menjalankan seluruh prosedur teknis pengiriman klaim ke E-Klaim** — termasuk koding grouping (iDRG & INACBG) dan pengiriman (`send_claim_individual`), yang sebelumnya secara ambigu diasosiasikan ke "modul lain"/G7 — serta **re-koding/pengajuan ulang klaim `PENDING`** (`idrg_grouper_reedit`/`inacbg_grouper_reedit`/`reedit_claim`), yang sebelumnya diasosiasikan ke modul terpisah G10. Lihat §2, §4, §6, §7 untuk detail prosedur.

**Document Version**

| Tanggal | Versi | Deskripsi Perubahan |
|---------|-------|---------------------|
| 2026-07-16 | 1.0 - Draft awal | Draft awal PRD Managemen Dokumen & Data Medis Casemix (G8), disusun selaras model v1.6 PRD G9 (G9 direvisi lebih dulu): G8 mencakup konsolidasi data medis, checklist kelengkapan, koding ICD, pengelolaan dokumen, **DAN** eksekusi teknis penuh ke E-Klaim (grouping iDRG/INACBG + `send_claim_individual`) **serta** re-koding/resubmit untuk klaim `PENDING` hasil rekonsiliasi G9 (maks 2× siklus, kontrak identik dengan BR-G9-15/16). G7 & G10 tidak dipakai sebagai modul terpisah. |

## 2. Overview & Background

**Overview / Brief Summary**

Modul **Managemen Dokumen & Data Medis (G8)** adalah **titik hulu tunggal** siklus klaim BPJS Casemix — mencakup **seluruh** rangkaian dari konsolidasi data medis episode selesai hingga klaim benar-benar terkirim ke BPJS, dan **kembali menangani** klaim yang harus diperbaiki. Cakupan G8:

1. **Konsolidasi data medis** — menarik otomatis data diagnosa, tindakan, hasil penunjang, farmasi, dan tarif dari modul hulu SIMRS (RME, SEP/Pendaftaran, Penunjang, Farmasi, Billing) saat episode pelayanan (rawat inap/jalan) dinyatakan selesai.
2. **Checklist kelengkapan berkas** — memvalidasi kelengkapan dokumen wajib (resume medis final + TTD DPJP, hasil penunjang, dsb) sebagai **gerbang wajib** sebelum koding dapat dimulai.
3. **Pengelolaan dokumen pendukung** — unggah, simpan, dan kelola versi dokumen (resume medis, hasil lab/radiologi, laporan operasi, dsb) dengan jejak audit.
4. **Koding ICD-10 (diagnosis) & ICD-9-CM (tindakan)** — dibantu pencarian master kode, dengan validasi ringan (soft warning) untuk kode *unspecified*.
5. **Grouping & pengiriman klaim ke E-Klaim** *(cakupan baru, v1.0 — dikonfirmasi selaras PRD G9 v1.6)* — G8 menjalankan **integrasi teknis penuh** ke E-Klaim (web service resmi Kemenkes/BPJS yang di-hosting lokal di server RS): `new_claim` (buat klaim + registrasi pasien) → `set_claim_data` (isi data klaim hasil konsolidasi & koding) → koding **Grouping iDRG** (stage 1) → **Import iDRG to INACBG** → koding **Grouping INACBG** (stage 1 & 2) → `send_claim_individual` (kirim per `noSEP`), tervalidasi terhadap master data diagnosis & master data tindakan.
6. **Deteksi selisih nominal pra-submit** — karena grouper INACBG yang dijalankan G8 **adalah grouper resmi yang sama** dengan yang dipakai BPJS untuk menghitung reimbursement, G8 dapat membandingkan **nilai diajukan** (`submitted_amount`, dari tarif RS/INA-CBG) dengan **nilai hasil grouper** (`grouper_amount`) **sebelum klaim dikirim**, dan menandai `has_nominal_selisih = true` bila berbeda. Flag ini **murni informasional** — diteruskan ke G9 sebagai konteks, **tidak menentukan** hasil klaim (lihat §8, kontrak G8→G9).
7. **Re-koding & resubmit klaim `PENDING`** *(cakupan baru, v1.0)* — G9 melakukan rekonsiliasi terhadap export Excel BPJS dan dapat mengembalikan klaim berstatus `PENDING` ke G8 (via kontrak/notifikasi, lihat PRD G9 §8.2 endpoint `follow-up`). G8 membuka kembali klaim tsb untuk **re-koding** (`idrg_grouper_reedit`/`inacbg_grouper_reedit`/`reedit_claim`) dan mengirim ulang, **maksimal 2× siklus** per klaim (identik dengan aturan BR-G9-15/16 di sisi G9) — setelah itu klaim dikunci dan keputusan akhir (terima/tolak) menjadi ranah G9.

G8 **tidak** melakukan rekonsiliasi hasil BPJS, penerbitan Berita Acara, maupun pencatatan pembayaran klaim — seluruhnya ranah **G9** (hilir). G8 **menyediakan kontrak data** ke G9 setiap kali `send_claim_individual` sukses (§8, Kontrak G8→G9), dan **menerima balik** notifikasi/pemicu re-koding untuk klaim `PENDING`.

**Business Process (As-Is vs To-Be)**

**As-Is (kondisi saat ini — RS Tipe C & D):** [ASUMSI]
- Data medis (diagnosa, tindakan, hasil penunjang) diinput ulang secara manual oleh tim Casemix dari berkas fisik/print-out RME → rawan **double-entry** dan salah salin.
- Kelengkapan berkas (resume medis, TTD DPJP, hasil penunjang) dicek manual pakai checklist kertas/Excel, tidak termonitor sistem → klaim bisa lanjut ke koding padahal berkas belum lengkap.
- Referensi koding ICD-10/ICD-9-CM terpisah dari sistem (buku/aplikasi lain) → proses koding lambat, rawan salah kode/tidak spesifik.
- **Pengiriman klaim ke E-Klaim dilakukan lewat aplikasi desktop terpisah** tanpa integrasi ke SIMRS — status pengiriman tidak tercatat otomatis di sistem RS, sulit ditelusuri kapan & siapa yang mengirim.
- Selisih nominal (tarif diajukan vs hasil grouper) baru diketahui belakangan lewat laporan manual, bukan saat koding → sulit diaudit sejak awal.
- Ketika klaim `PENDING`, koordinasi re-koding antar tim koding & tim monitoring hasil bersifat manual (telepon/chat), rawan terlewat batas waktu resubmit.
- Data nasional: **~68% klaim pending disebabkan kesalahan koding** [ASUMSI, perlu sumber resmi — PERLU KONFIRMASI]; tim Casemix RS Tipe C/D umumnya **2–5 orang** untuk seluruh proses ini.

**To-Be (kondisi diharapkan):**
- **Konsolidasi otomatis** data medis begitu episode pelayanan selesai — tanpa input ulang manual.
- **Checklist kelengkapan wajib** memblokir progres status ke `Siap Koding` sampai seluruh dokumen wajib terpenuhi.
- **Koding dibantu pencarian** master ICD-10/ICD-9-CM dalam sistem, dengan peringatan lunak (soft warning) untuk kode *unspecified*.
- **Pengiriman klaim terintegrasi langsung dari SIMRS** — `new_claim`→`set_claim_data`→grouping iDRG/INACBG→`send_claim_individual` tercatat otomatis dengan jejak audit lengkap (siapa, kapan, hasil respons E-Klaim).
- **Selisih nominal terdeteksi otomatis** saat grouping, sebelum klaim dikirim — tersedia sebagai konteks bagi tim Casemix maupun G9.
- **Re-koding & resubmit klaim `PENDING` terintegrasi** — begitu G9 menandai klaim `PENDING` untuk resubmit, klaim otomatis muncul di work-list re-koding G8, lengkap dengan riwayat & alasan pending, mempercepat siklus perbaikan sebelum batas 2×.

**Latar Belakang**

- Sistem klaim BPJS Kesehatan memakai skema **INA-CBGs** (Indonesia Case Base Groups) — tarif ditentukan oleh kombinasi diagnosis (ICD-10), tindakan (ICD-9-CM), dan variabel klinis lain (lama rawat, kelas rawat, dsb) melalui **grouper resmi**.
- **Batas waktu pengajuan klaim** ke BPJS umumnya **tanggal 10 bulan berikutnya** setelah bulan pelayanan [ASUMSI, PERLU KONFIRMASI kebijakan RS spesifik] — menjadikan kecepatan konsolidasi-koding-kirim sebagai faktor kritis.
- **Transisi iDRG** (Indonesia Diagnosis Related Group, skema case-mix generasi baru) sedang berjalan bertahap; selama masa transisi kemungkinan ada periode **dual-running** (iDRG & INA-CBGs berdampingan) [PERLU KONFIRMASI timeline resmi Kemenkes]. Struktur data G8 dirancang **iDRG-ready** (granular per diagnosis/tindakan, bukan hanya kode akhir) agar tidak perlu migrasi skema besar saat iDRG resmi berlaku penuh.

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Penurunan klaim pending akibat kesalahan koding | Turun ≥30% dibanding baseline manual (sebelum SIMRS) dalam 6 bulan pertama pemakaian. [ASUMSI target] |
| 2 | Kelengkapan checklist saat masuk status Siap Koding | 100% episode yang mencapai status `Siap Koding` memiliki checklist dokumen wajib lengkap (0 lolos tanpa lengkap). |
| 3 | Kecepatan konsolidasi | Waktu konsolidasi data medis (dari episode selesai sampai siap koding) turun ≥40% dibanding proses manual. [ASUMSI target] |
| 4 | Eliminasi double-entry | 0 kasus input ulang manual untuk data yang sudah tersedia di modul hulu (RME/SEP/Penunjang/Farmasi/Billing). |
| 5 | Ketepatan waktu kirim klaim | 100% klaim episode selesai pada suatu bulan pelayanan terkirim (`send_claim_individual` sukses) sebelum batas waktu (tanggal 10 bulan berikutnya, lihat BR-G8-01). |
| 6 | Cakupan deteksi selisih nominal pra-submit | 100% klaim terkirim memiliki hasil perbandingan `submitted_amount` vs `grouper_amount` (flag `has_nominal_selisih`) tercatat **sebelum** `send_claim_individual`, 0 dihitung belakangan. |
| 7 | Siklus re-koding klaim PENDING | 100% klaim yang ditandai `PENDING` oleh G9 masuk work-list re-koding G8 dalam ≤1 hari kerja; siklus resubmit tidak melebihi 2× (selaras BR-G9-15). |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD + Koding + Kirim) | Phase 2 (Advanced: Approval/Otomasi) |
|-------------|----------------------------------------|----------------------------------------|
| Work-list Episode JKN | Daftar episode selesai (RI/RJ) yang siap dikonsolidasi, filter status. | Prioritas otomatis berdasar deadline (H-x sebelum tanggal 10). |
| Konsolidasi Data Medis | Tarik otomatis diagnosa/tindakan/penunjang/farmasi/tarif dari modul hulu saat episode selesai. | Sinkronisasi near-real-time (event) dari modul hulu, bukan batch/trigger manual. |
| Checklist Kelengkapan Berkas | Checklist dokumen wajib (RI/RJ berbeda) sebagai gerbang status ke `Siap Koding`. | Checklist dinamis per jenis kasus (mis. kasus khusus BBL/rujukan) [PERLU KONFIRMASI]. |
| Pengelolaan Dokumen Pendukung | Unggah/simpan/versi dokumen + jejak audit dasar. | Verifikasi digital/anti-fraud dokumen (tanda tangan elektronik tervalidasi). |
| Koding ICD-10 & ICD-9-CM | Pencarian master kode, input diagnosa (primer/sekunder) & tindakan, soft warning *unspecified*. | Bantuan koding otomatis (NLP/asisten) dari teks resume medis [ASUMSI, luar MVP]. |
| Grouping & Pengiriman Klaim (E-Klaim) | `new_claim`→`set_claim_data`→Grouping iDRG→Import ke INACBG→Grouping INACBG stage 1/2→`send_claim_individual`; deteksi `has_nominal_selisih` otomatis. | **Approval berjenjang** (verifikator internal) sebelum `send_claim_individual` dieksekusi. |
| Re-koding & Resubmit (klaim PENDING dari G9) | Work-list klaim `PENDING`, re-koding manual (`idrg_grouper_reedit`/`inacbg_grouper_reedit`/`reedit_claim`), kirim ulang, hitung siklus (maks 2×, selaras BR-G9-15/16). | Notifikasi/SLA otomatis saat klaim jatuh `PENDING`; auto-highlight penyebab pending (dari `ket_pending` G9) di layar re-koding. |
| Data Medis Granular (iDRG-ready) | Simpan diagnosis/tindakan granular (bukan hanya kode akhir) — siap transisi iDRG. | Dual-running iDRG & INA-CBGs (toggle skema per periode) [PERLU KONFIRMASI, tergantung timeline Kemenkes]. |
| Audit Trail | Log setiap perubahan status/koding/kirim klaim (siapa, kapan, hasil respons E-Klaim). | Dashboard audit lintas periode + ekspor. |

**Phase 3 (Accounting): N/A untuk G8.** Pemetaan Chart of Account (COA) atas pendapatan klaim terjadi di modul **Billing/Accounting** dan pada **saat penerimaan pembayaran** di **G9** (Berita Acara & pencatatan pembayaran) — bukan di titik koding/pengiriman klaim (G8). [KEPUTUSAN]

**Out of Scope**
- **Rekonsiliasi hasil BPJS, Berita Acara, dan pencatatan pembayaran klaim** → modul **G9** (hilir). G8 hanya menyediakan kontrak data klaim terkirim.
- **Integrasi API BPJS VClaim Monitoring Klaim** (tarik hasil klaim) → modul **G9**, Phase 2, [PERLU KONFIRMASI] ketersediaan.
- **Autentikasi & transport teknis E-Klaim/VClaim** tingkat infrastruktur (encryption key, signature, dekripsi) yang **di luar** pemanggilan method bisnis (`new_claim`, dst.) → lapisan Integrasi BPJS tersendiri (shared service), G8 hanya konsumen method-nya.
- **Klaim asuransi swasta / non-BPJS** → modul **G11–G14**.
- **Resume medis SATUSEHAT** (interoperabilitas nasional) → modul **G27**.
- **Verifikasi digital/anti-fraud** dokumen tingkat lanjut (tanda tangan elektronik tervalidasi pihak ketiga) → di luar MVP.
- **Skema penuh iDRG** (aturan grouping detail generasi baru) → menunggu kepastian timeline resmi Kemenkes; MVP hanya menyiapkan struktur data granular (iDRG-ready), bukan implementasi aturan iDRG penuh. [ASUMSI]
- **Perhitungan tarif/tagihan RS** (real cost) → modul **G2** (dipakai hanya sebagai pembanding terhadap tarif grouper).

## 5. Related Features

| Code | Modul / Menu | Relasi Teknis / Bisnis dengan G8 |
|------|--------------|-----------------------------------|
| **G9** | Penerimaan & Rekonsiliasi Klaim BPJS | **Hilir utama.** G8 menyediakan **kontrak data klaim terkirim** (`sep_no`, `g8_claim_id`, `jns_pelayanan`, `tgl_pulang`, `submitted_amount`, `grouper_amount`, `has_nominal_selisih`, `sent_at`, `g8_status`) setiap `send_claim_individual` sukses (lihat §8.2). G9 **mengembalikan** klaim `PENDING` ke G8 untuk re-koding (via notifikasi/status pada endpoint `follow-up` G9), maksimal 2× siklus (selaras BR-G9-15/16). |
| Modul hulu SIMRS (RME, SEP/Pendaftaran, Penunjang, Farmasi, Billing) | — | **Sumber data konsolidasi** (§7 FR-G8-02): diagnosa & tindakan (RME), identitas & episode (SEP/Pendaftaran), hasil lab/radiologi (Penunjang), obat & alkes (Farmasi), tarif RS (Billing). |
| G2 | Tagihan Pasien | Tarif RS / real cost sebagai pembanding terhadap tarif hasil grouper INACBG (`submitted_amount` bersumber dari sini). |
| Master ICD-10 / ICD-9-CM | — | Referensi lookup koding diagnosis (ICD-10) & tindakan/prosedur (ICD-9-CM). |

> **Catatan (v1.0, selaras G9 v1.6):** entri List Fitur **G7** (grouping/integrasi E-Klaim) dan **G10** (resubmit) **tidak dipakai sebagai modul terpisah** dalam PRD ini — keduanya melebur menjadi bagian dari G8 (§2, §4, §7). Bila di masa depan diputuskan memisah kembali, kontrak data pada §8 tetap menjadi acuan batas tanggung jawab.

## 6. Business Process & User Stories

**State Machine Table — Status Klaim (per episode / `noSEP`)**

| Status | Deskripsi | Efek | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------|--------------------|--------------------|
| Draft/Terkumpul | Episode selesai, data medis terkonsolidasi otomatis. | Data terisi, belum tervalidasi | → Belum Lengkap / Siap Koding | idem |
| Belum Lengkap | Checklist dokumen wajib belum terpenuhi. | Memblokir progres ke koding | → Siap Koding (saat checklist lengkap) | idem |
| Siap Koding | Checklist lengkap; siap diinput ICD-10/ICD-9-CM. | Gerbang mutu terlewati | → Terkoding | idem + validasi konsistensi otomatis (FR-G8-07 fondasi) |
| Terkoding | Koding ICD-10/ICD-9-CM lengkap & lolos soft warning. | Siap grouping | → Ter-grouping | idem |
| Ter-grouping | Grouping iDRG → Import INACBG → Grouping INACBG stage 1/2 selesai; `has_nominal_selisih` terhitung. | Nilai grouper tersedia | → Terkirim (`send_claim_individual`) | idem + approval berjenjang sebelum kirim |
| Terkirim | `send_claim_individual` sukses; kontrak data dikirim ke G9. | `sent_at` terisi, klaim dikunci dari edit bebas | (terminal di G8, kendali pindah ke G9) | idem |
| Pending — Re-koding | G9 menandai klaim `PENDING`; klaim dibuka kembali di G8. | `resubmit_count` (di G8) +1 saat kirim ulang | → Terkoding (edit ulang) → ... → Terkirim (kirim ulang) | idem |
| Terkunci (limit resubmit) | `resubmit_count` mencapai 2 dan tetap `PENDING`. | Tidak dapat re-koding lagi, keputusan akhir di G9 | (terminal di G8) | idem |

> **Catatan:** transisi mundur (Terkirim → Pending–Re-koding) **hanya** dipicu oleh notifikasi dari **G9** (klaim ditandai `PENDING` hasil rekonsiliasi), bukan inisiatif bebas dari G8 — menjaga satu sumber kebenaran status di G9 (§8 Kontrak G8↔G9). Klaim berstatus `DISPUTE`/`COCOK` di G9 **tidak pernah** kembali ke G8 (final di sisi G9).

**User Stories Utama**

- **US-G8-01** — Sebagai **Petugas Casemix**, saya ingin melihat work-list episode JKN yang sudah selesai pelayanan, agar tahu mana yang perlu segera dikonsolidasi & dikoding.
- **US-G8-02** — Sebagai **Petugas Casemix**, saya ingin data medis (diagnosa, tindakan, penunjang, farmasi, tarif) terkonsolidasi otomatis dari modul hulu, agar tidak perlu input ulang manual.
- **US-G8-03** — Sebagai **Petugas Casemix**, saya ingin sistem memvalidasi kelengkapan berkas wajib sebelum koding dimulai, agar tidak ada klaim lanjut dengan berkas tidak lengkap.
- **US-G8-04** — Sebagai **Petugas Casemix**, saya ingin mengunggah & mengelola dokumen pendukung (resume medis, hasil penunjang, dsb) dengan jejak versi, agar berkas klaim terdokumentasi rapi.
- **US-G8-05** — Sebagai **Koder (Tim Casemix)**, saya ingin mencari & menginput kode ICD-10 (diagnosis) dan ICD-9-CM (tindakan) dibantu pencarian master, agar koding cepat dan akurat.
- **US-G8-06** — Sebagai **Koder**, saya ingin mendapat peringatan lunak saat memilih kode *unspecified*, agar terdorong memakai kode lebih spesifik bila memungkinkan.
- **US-G8-07** — Sebagai **Petugas Casemix**, saya ingin sistem menjalankan grouping (iDRG → INACBG) dan mengirim klaim ke E-Klaim langsung dari SIMRS, agar tidak perlu berpindah aplikasi & status pengiriman tercatat otomatis.
- **US-G8-08** — Sebagai **Petugas/Manajemen Casemix**, saya ingin melihat flag selisih nominal (tarif diajukan vs hasil grouper) segera setelah grouping, agar bisa ditelaah sebelum klaim dikirim.
- **US-G8-09** — Sebagai **Koder**, saya ingin klaim yang ditandai `PENDING` oleh G9 otomatis masuk work-list re-koding saya lengkap dengan alasan pending, agar dapat segera diperbaiki & dikirim ulang sebelum batas siklus habis.
- **US-G8-10** — Sebagai **Koordinator Casemix**, saya ingin melihat riwayat audit koding & pengiriman (siapa, kapan, hasil respons E-Klaim) per klaim, agar dapat ditelusuri saat ada masalah.
- **US-G8-11** *(Phase 2)* — Sebagai **Koordinator Casemix**, saya ingin pengiriman klaim melewati approval berjenjang sebelum `send_claim_individual` dieksekusi, agar ada kontrol mutu tambahan.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: Work-list Episode JKN (FR-G8-01)**
- **User Story**: Sebagai Petugas Casemix, saya ingin melihat daftar episode JKN yang sudah selesai pelayanan, agar tahu mana yang perlu dikonsolidasi & dikoding.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Diberikan episode rawat inap/jalan berstatus "selesai pelayanan" di modul hulu, maka episode tersebut **otomatis muncul** di work-list G8 dengan status awal `Draft/Terkumpul`.
    - **AC 2**: Work-list dapat difilter per status (`Draft/Terkumpul`, `Belum Lengkap`, `Siap Koding`, `Terkoding`, `Ter-grouping`, `Terkirim`, `Pending — Re-koding`, `Terkunci`) dan diurutkan per tanggal pulang/deadline pengajuan.
    - **AC 3**: Episode mendekati batas waktu pengajuan (tanggal 10 bulan berikutnya) ditandai visual (badge peringatan).

**Fitur: Konsolidasi Otomatis Data Medis (FR-G8-02)**
- **User Story**: Sebagai Petugas Casemix, saya ingin data medis terkonsolidasi otomatis dari modul hulu, agar tidak perlu input ulang manual.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Saat episode berpindah ke "selesai pelayanan", sistem menarik otomatis: diagnosa & tindakan (RME), identitas/SEP (Pendaftaran), hasil penunjang (Penunjang), pemakaian obat/alkes (Farmasi), tarif RS (Billing).
    - **AC 2**: Data yang gagal ditarik (mis. modul hulu belum lengkap) ditandai eksplisit per field — **tidak** disimpan kosong secara diam-diam.
    - **AC 3**: Konsolidasi dapat dijalankan ulang (re-sync) manual bila data hulu berubah setelah tarikan awal.

**Fitur: Checklist Kelengkapan Berkas Wajib (FR-G8-03)**
- **User Story**: Sebagai Petugas Casemix, saya ingin sistem memvalidasi kelengkapan berkas wajib, agar tidak ada klaim lanjut ke koding dengan berkas tidak lengkap.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Checklist dokumen wajib berbeda untuk Rawat Inap vs Rawat Jalan (daftar final [PERLU KONFIRMASI], minimal mencakup: resume medis final + TTD DPJP, hasil penunjang relevan, laporan operasi bila ada tindakan bedah).
    - **AC 2**: Status episode **tidak dapat** berpindah ke `Siap Koding` selama ada item checklist wajib yang belum terpenuhi (`is_present = false`).
    - **AC 3**: Petugas dapat melihat progres checklist (X dari Y item terpenuhi) di work-list tanpa membuka detail.

**Fitur: Pengelolaan & Unggah Dokumen Pendukung (FR-G8-04)**
- **User Story**: Sebagai Petugas Casemix, saya ingin mengunggah & mengelola dokumen pendukung, agar berkas klaim terdokumentasi rapi dengan jejak versi.
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Dokumen dapat diunggah per jenis (resume medis, hasil penunjang, laporan operasi, dsb), format PDF/gambar, maks 10MB per file.
    - **AC 2**: Mengunggah versi baru **tidak menghapus** versi lama (soft-delete/versioning) — riwayat dapat ditelusuri.
    - **AC 3**: Setiap unggah/hapus dicatat di audit trail (FR-G8-09): siapa, kapan, jenis dokumen.

**Fitur: Koding ICD-10 (Diagnosis) & ICD-9-CM (Tindakan) (FR-G8-05)**
- **User Story**: Sebagai Koder, saya ingin mencari & menginput kode ICD-10/ICD-9-CM dibantu pencarian master, agar koding cepat dan akurat.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Pencarian kode ICD-10/ICD-9-CM berbasis teks (nama diagnosis/tindakan) maupun kode, menampilkan hasil dari master data.
    - **AC 2**: Diagnosis dapat ditandai jenis (`primer`/`sekunder`) dan diberi urutan (`sequence`); tindakan dicatat per prosedur dengan tanggal pelaksanaan.
    - **AC 3**: Memilih kode ICD-10 kategori *unspecified* (mis. akhiran ".9") memicu **soft warning** (tidak memblokir simpan) yang menyarankan kode lebih spesifik bila tersedia.
    - **AC 4**: Status episode berpindah ke `Terkoding` setelah minimal 1 diagnosis primer tersimpan (tindakan opsional tergantung kasus).

**Fitur: Grouping & Pengiriman Klaim ke E-Klaim (FR-G8-06)** *(cakupan baru v1.0, selaras G9 v1.6)*
- **User Story**: Sebagai Petugas Casemix, saya ingin sistem menjalankan grouping dan mengirim klaim ke E-Klaim langsung dari SIMRS, agar tidak berpindah aplikasi & status pengiriman tercatat otomatis.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Dari status `Terkoding`, petugas memicu proses grouping: sistem memanggil berurutan `new_claim` (bila belum ada) → `set_claim_data` (kirim data konsolidasi + koding) → **Grouping iDRG** → **Import iDRG to INACBG** → **Grouping INACBG stage 1** → **Grouping INACBG stage 2**, tervalidasi terhadap master data diagnosis & tindakan.
    - **AC 2**: Setiap panggilan method dicatat di `claim_submission_log` (request, response, timestamp, status sukses/gagal) — kegagalan pada satu tahap **menghentikan** rangkaian dan ditampilkan sebagai error aktif, tidak melanjutkan ke tahap berikut.
    - **AC 3**: Setelah grouping INACBG stage 2 sukses, status berpindah ke `Ter-grouping` dan nilai `grouper_amount` tersimpan (memicu FR-G8-07).
    - **AC 4**: Dari status `Ter-grouping`, petugas memicu `send_claim_individual` per `noSEP`; sukses → status `Terkirim`, `sent_at` terisi, dan kontrak data klaim terkirim diteruskan ke G9 (§8.2).
    - **AC 5**: Klaim berstatus `Terkirim` **terkunci** dari edit data medis/koding bebas — perubahan hanya melalui alur re-koding (FR-G8-08) yang dipicu G9.

**Fitur: Deteksi Selisih Nominal Pra-Submit (FR-G8-07)** *(cakupan baru v1.0)*
- **User Story**: Sebagai Petugas/Manajemen Casemix, saya ingin melihat flag selisih nominal segera setelah grouping, agar bisa ditelaah sebelum klaim dikirim.
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Setelah grouping INACBG stage 2 sukses, sistem membandingkan `submitted_amount` (tarif RS/diajukan, dari Billing) dengan `grouper_amount` (hasil grouper INACBG).
    - **AC 2**: Bila kedua nilai berbeda, `has_nominal_selisih` diset `true`; badge selisih tampil di work-list & detail klaim (nilai diajukan vs nilai grouper, ditampilkan sebagai konteks — bukan blocker pengiriman).
    - **AC 3**: Flag & kedua nilai ini **diteruskan apa adanya** ke G9 dalam kontrak data klaim terkirim (§8.2) — G8 tidak menunggu konfirmasi/approval atas selisih untuk melanjutkan pengiriman (kecuali diaktifkan approval berjenjang Phase 2).

**Fitur: Re-koding & Resubmit Klaim PENDING (FR-G8-08)** *(cakupan baru v1.0, menggantikan G10)*
- **User Story**: Sebagai Koder, saya ingin klaim yang ditandai PENDING oleh G9 otomatis masuk work-list re-koding saya, agar dapat segera diperbaiki & dikirim ulang sebelum batas siklus habis.
- **Prioritas**: P0
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Saat G9 menandai klaim `PENDING` untuk `RESUBMIT` (lihat PRD G9 FR-G9-05/BR-G9-16), klaim terkait (match `sep_no`) muncul di work-list **"Re-koding"** G8 dengan status `Pending — Re-koding`, lengkap dengan alasan pending (`jenis_pending`/`ket_pending` dari G9, bila tersedia).
    - **AC 2**: Koder dapat mengedit koding (ICD-10/ICD-9-CM) dan/atau data klaim, lalu memicu **re-grouping** via `idrg_grouper_reedit` dan/atau `inacbg_grouper_reedit`, dan mengirim ulang via `reedit_claim`.
    - **AC 3**: Setiap pengiriman ulang yang sukses menambah `resubmit_count` (di G8) sebanyak 1 — **selaras** dengan `resubmit_count` yang dilacak G9 (BR-G9-16); nilai maksimal **2×**.
    - **AC 4**: Setelah `resubmit_count` mencapai 2 dan klaim kembali `PENDING`, work-list re-koding G8 **mengunci** klaim tsb (tidak ada aksi re-koding lagi) — status `Terkunci (limit resubmit)`; keputusan akhir (terima/tolak) dilakukan di G9 (BR-G9-15).
    - **AC 5**: Klaim `DISPUTE` atau `COCOK` di G9 **tidak pernah** memicu entri di work-list re-koding G8 (final di sisi G9, tidak ada jalur balik).

**Fitur: Audit Trail Dokumen & Koding (FR-G8-09)**
- **User Story**: Sebagai Koordinator Casemix, saya ingin melihat riwayat audit koding & pengiriman, agar dapat ditelusuri saat ada masalah.
- **Prioritas**: P1
- **Fase**: Phase 1
- **Acceptance Criteria**:
    - **AC 1**: Setiap perubahan status, koding, unggah dokumen, dan panggilan method E-Klaim (`new_claim`, `set_claim_data`, grouping, `send_claim_individual`, `*_reedit`) dicatat: aktor, waktu, jenis aksi, hasil (sukses/gagal + pesan).
    - **AC 2**: Log bersifat **append-only** (tidak dapat diedit/dihapus dari UI) dan dapat difilter per klaim/episode.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Kode ICD-10 (Primer) | Search/Select | Required, harus valid di master ICD-10 | "Diagnosis primer wajib diisi" | "Cari berdasarkan nama diagnosis atau kode" |
  | Kode ICD-9-CM | Search/Select | Opsional, harus valid di master ICD-9-CM bila diisi | "Kode tindakan tidak ditemukan di master" | "Cari berdasarkan nama tindakan atau kode" |
  | Jenis Diagnosa | Dropdown | Required (Primer/Sekunder) | "Jenis diagnosa wajib dipilih" | "Tandai diagnosis utama sebagai Primer" |
  | Kode Unspecified | Search/Select | Soft warning (tidak memblokir) | "Kode ini bersifat umum (unspecified) — pertimbangkan kode lebih spesifik bila tersedia" | "Cek deskripsi lengkap sebelum menyimpan" |
  | Berkas Pendukung | Upload | Required sesuai checklist, PDF/gambar, maks 10MB | "File wajib diunggah sesuai jenis dokumen" | "Format PDF/JPG/PNG, maksimal 10MB" |
  | Resume Medis Final | Checklist item | Required, wajib bertanda tangan DPJP | "Resume medis final + TTD DPJP wajib ada sebelum koding" | "Pastikan resume sudah difinalisasi di RME" |
  | Catatan Re-koding | Text | Required saat memicu pengiriman ulang | "Catatan alasan perbaikan wajib diisi" | "Jelaskan perubahan yang dilakukan sebelum kirim ulang" |

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table: `claim`** (header klaim per episode/`noSEP`)
- `id`: UUID (PK) · `sep_no`: String (unik, NOT NULL) — kunci utama kontrak ke G9
- `episode_id`: UUID (ref episode pelayanan hulu, NOT NULL) · `patient_id`: UUID (NOT NULL)
- `jns_pelayanan`: Enum (rawat_inap / rawat_jalan, NOT NULL) · `tgl_masuk`, `tgl_pulang`: Date
- `length_of_stay`: Integer (nullable, dihitung dari tgl_masuk/tgl_pulang, iDRG-ready)
- `status`: Enum (draft / belum_lengkap / siap_koding / terkoding / ter_grouping / terkirim / pending_reedit / terkunci, default `draft`)
- `submitted_amount`: Decimal (nullable, tarif RS/diajukan dari Billing) · `grouper_amount`: Decimal (nullable, hasil grouper INACBG)
- `has_nominal_selisih`: Boolean (NOT NULL, default false) — dihitung saat grouping selesai (FR-G8-07)
- `cbg_code`: String (nullable) · `grouper_version`: String (nullable, versi grouper INACBG/iDRG dipakai)
- `resubmit_count`: Integer (NOT NULL, default 0) — selaras `resubmit_count` di G9 (`claim_reconciliations`)
- `sent_at`: DateTime (nullable, waktu `send_claim_individual` sukses) · `is_active`: Boolean (default true)
- `created_by`, `created_at`, `updated_at`

**Table: `claim_diagnosis`** (diagnosis ICD-10, granular — iDRG-ready)
- `id`: UUID (PK) · `claim_id`: UUID (FK claim, NOT NULL) · `icd10_code`: String (NOT NULL)
- `dx_type`: Enum (primer / sekunder, NOT NULL) · `is_cc_mcc`: Boolean (nullable, penanda komplikasi/komorbiditas) · `sequence`: Integer
- `icd10_im_code`: String (nullable) — kode iDRG-ready untuk skema masa depan
- `created_by`, `created_at`

**Table: `claim_procedure`** (tindakan ICD-9-CM, granular — iDRG-ready)
- `id`: UUID (PK) · `claim_id`: UUID (FK claim, NOT NULL) · `icd9_code`: String (NOT NULL)
- `procedure_date`: Date (nullable) · `sequence`: Integer
- `icd9_im_code`: String (nullable) — kode iDRG-ready
- `created_by`, `created_at`

**Table: `claim_document`** (checklist & dokumen pendukung)
- `id`: UUID (PK) · `claim_id`: UUID (FK claim, NOT NULL) · `doc_type`: String (NOT NULL, mis. resume_medis_final, hasil_lab, laporan_operasi)
- `is_required`: Boolean (NOT NULL) · `is_present`: Boolean (NOT NULL, default false)
- `file_ref`: String (nullable) · `version`: Integer (default 1) · `is_deleted`: Boolean (default false, soft-delete)
- `uploaded_by`, `uploaded_at`

**Table: `claim_submission_log`** (jejak panggilan method E-Klaim — termasuk re-koding)
- `id`: UUID (PK) · `claim_id`: UUID (FK claim, NOT NULL) · `method`: Enum (new_claim / set_claim_data / grouping_idrg / import_idrg_to_inacbg / grouping_inacbg_1 / grouping_inacbg_2 / send_claim_individual / idrg_grouper_reedit / inacbg_grouper_reedit / reedit_claim)
- `is_success`: Boolean (NOT NULL) · `request_payload`: JSON (nullable) · `response_payload`: JSON (nullable) · `error_message`: String (nullable)
- `resubmit_cycle`: Integer (nullable, terisi untuk method `*_reedit`, menandai siklus ke berapa)
- `called_by`, `called_at`

**Table: `claim_audit_log`** (append-only, seluruh perubahan status/koding/dokumen)
- `id`: UUID (PK) · `claim_id`: UUID (FK claim, NOT NULL) · `action`: String (NOT NULL) · `detail`: JSON (nullable)
- `actor_id`: UUID (NOT NULL) · `created_at`: DateTime (NOT NULL)

**Catatan konsistensi**: `sep_no` pada `claim` adalah **kunci yang sama** dipakai G9 (`claim_submissions.sep_no`). `resubmit_count` di G8 **harus disinkronkan** dengan `resubmit_count` di `claim_reconciliations` milik G9 pada setiap siklus (transaksional, lihat §8.2 endpoint kontrak).

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/api/v1/casemix/claims/worklist` | List episode/klaim (filter status, deadline) |
| POST | `/api/v1/casemix/claims/{episodeId}/consolidate` | Trigger konsolidasi otomatis data medis dari modul hulu |
| GET | `/api/v1/casemix/claims/{claimId}/checklist` | Ambil status checklist kelengkapan berkas |
| POST | `/api/v1/casemix/claims/{claimId}/documents` | Unggah dokumen pendukung |
| GET | `/api/v1/casemix/icd10?q=` | Pencarian master ICD-10 |
| GET | `/api/v1/casemix/icd9?q=` | Pencarian master ICD-9-CM |
| POST | `/api/v1/casemix/claims/{claimId}/diagnosis` | Simpan diagnosis (primer/sekunder) |
| POST | `/api/v1/casemix/claims/{claimId}/procedures` | Simpan tindakan |
| POST | `/api/v1/casemix/claims/{claimId}/submit-to-eklaim` | Jalankan rangkaian `new_claim`→`set_claim_data`→grouping iDRG/INACBG→`send_claim_individual` (FR-G8-06) |
| POST | `/api/v1/casemix/claims/{claimId}/reedit` | Jalankan re-koding & kirim ulang (`idrg_grouper_reedit`/`inacbg_grouper_reedit`/`reedit_claim`) untuk klaim `Pending — Re-koding` (FR-G8-08) |
| GET | `/api/v1/casemix/claims/{claimId}/audit-log` | Riwayat audit klaim |
| **POST** | **`/api/v1/casemix/claims/submissions/notify-pending`** | **Kontrak masuk dari G9** — menerima notifikasi klaim `PENDING` (`sep_no`, alasan pending) untuk dimasukkan ke work-list re-koding G8 (dipanggil oleh endpoint `follow-up` G9, lihat PRD G9 §8.2) |

**Kontrak data — G8 → G9** (dikirim setiap `send_claim_individual` sukses, dikonsumsi tabel `claim_submissions` milik G9; field identik dengan PRD G9 §9):

| Field | Wajib | Sumber di G8 | Kegunaan di G9 |
|-------|-------|---------------|-----------------|
| `sep_no` | Ya | `claim.sep_no` | kunci match ke export Excel BPJS |
| `g8_claim_id` | Ya | `claim.id` | jejak balik & pemicu resubmit/re-koding |
| `jns_pelayanan` | Ya | `claim.jns_pelayanan` | scoping & filter |
| `tgl_pulang` | Ya | `claim.tgl_pulang` | scoping periode |
| `submitted_amount` | Ya | `claim.submitted_amount` | dasar tampilan nilai diajukan |
| `grouper_amount` | Tidak | `claim.grouper_amount` | konteks selisih nominal |
| `has_nominal_selisih` | Ya (default false) | `claim.has_nominal_selisih` | flag informasional, bukan penentu recon_status |
| `sent_at` | Ya | `claim.sent_at` | penanda klaim resmi "terkirim" |
| `g8_status` | Opsional | `claim.status` | status pengajuan di sisi G8 |

**Mekanisme transport** (view DB bersama / API internal / event) — [PERLU KONFIRMASI], selaras dengan PRD G9 §9.

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar Koding, CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| sep_no | No. SEP | text | Ya (auto) | – | konsolidasi (SEP/Pendaftaran) | read-only |
| icd10_code | Diagnosis (ICD-10) | search/select | Ya (min. 1 primer) | valid di master ICD-10 | input manual (koder) | soft warning bila unspecified |
| dx_type | Jenis Diagnosa | dropdown | Ya | Primer/Sekunder | input manual | 1 primer wajib per klaim |
| icd9_code | Tindakan (ICD-9-CM) | search/select | Tidak | valid di master ICD-9-CM bila diisi | input manual | tergantung kasus |
| submitted_amount | Nilai Diajukan | number (auto) | Ya (auto) | ≥ 0 | Billing | read-only, dari tarif RS |
| grouper_amount | Nilai Grouper | number (auto) | Tampil setelah grouping | ≥ 0 | hasil grouping INACBG | read-only |
| checklist_item | Item Checklist | checkbox | Ya (per jenis dokumen wajib) | – | dokumen | memblokir status Siap Koding bila belum lengkap |
| document_file | Berkas Pendukung | upload | Ya sesuai checklist | PDF/gambar, maks 10MB | unggah manual | versi/soft-delete |
| resubmit_note | Catatan Re-koding | text | Ya saat kirim ulang | maks 300 karakter | input manual | wajib jelaskan perbaikan |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (Work-list View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|----------------|---------|
| No. SEP | claim.sep_no | text | filter | kunci klaim |
| Nama Pasien | episode/patient | text | filter | – |
| Jenis Pelayanan | claim.jns_pelayanan | badge | filter | Rawat Inap/Jalan |
| Status Klaim | claim.status | badge | filter/sort | draft…terkirim…terkunci |
| Checklist | claim_document (agregat) | progress (X/Y) | – | indikator kelengkapan |
| Diagnosis Primer | claim_diagnosis (dx_type=primer) | text | – | ringkas 1 baris |
| Nilai Diajukan | claim.submitted_amount | Rp | sort | – |
| Selisih Nominal | claim.has_nominal_selisih + grouper_amount | badge | filter | informasional, muncul setelah grouping |
| Siklus Re-koding | claim.resubmit_count | badge | filter | format 'N/2', kosong bila belum pernah pending |
| Tanggal Kirim | claim.sent_at | date | sort | kosong bila belum terkirim |
| Deadline | dihitung dari tgl_pulang + kebijakan (tanggal 10 bulan berikutnya) | date/badge | sort | warna peringatan mendekati batas |

**Business Rules**
- **BR-G8-01**: Batas waktu pengajuan klaim = tanggal 10 bulan berikutnya setelah bulan pelayanan (`tgl_pulang`). [ASUMSI, PERLU KONFIRMASI kebijakan RS spesifik]
- **BR-G8-02**: Status **tidak dapat** berpindah ke `Siap Koding` selama ada item `claim_document` wajib (`is_required = true`) dengan `is_present = false`.
- **BR-G8-03**: Minimal **1 diagnosis primer** wajib tersimpan sebelum status dapat berpindah ke `Terkoding`.
- **BR-G8-04**: Rangkaian grouping (`new_claim`→`set_claim_data`→Grouping iDRG→Import ke INACBG→Grouping INACBG stage 1/2) dijalankan **berurutan**; kegagalan di satu tahap **menghentikan** rangkaian, tidak melanjut ke tahap berikutnya (dicatat di `claim_submission_log`).
- **BR-G8-05**: `has_nominal_selisih = true` bila `grouper_amount ≠ submitted_amount` setelah grouping INACBG stage 2 sukses. Flag ini **tidak memblokir** `send_claim_individual` pada Phase 1 (murni informasional, selaras BR-G9-11).
- **BR-G8-06**: Klaim berstatus `Terkirim` **terkunci** dari edit koding/data medis bebas — perubahan hanya lewat alur re-koding (BR-G8-08) yang dipicu notifikasi `PENDING` dari G9.
- **BR-G8-07**: Kontrak data klaim terkirim (§8.2) **wajib dikirim** ke G9 setiap `send_claim_individual` sukses, dalam transaksi yang sama dengan penyimpanan `sent_at`.
- **BR-G8-08 (Re-koding, maks 2× — selaras BR-G9-15/16 di G9)**: Saat menerima notifikasi `PENDING` dari G9, klaim berpindah ke status `Pending — Re-koding` bila `resubmit_count < 2`. Pengiriman ulang sukses (`reedit_claim`) menambah `resubmit_count` **+1** (identik dengan increment di sisi G9, dalam transaksi terkoordinasi — [PERLU KONFIRMASI mekanisme idempoten lintas modul]). Bila `resubmit_count` mencapai **2** dan klaim kembali `PENDING`, status G8 berpindah ke `Terkunci (limit resubmit)` — tidak ada aksi re-koding lagi; keputusan akhir (terima/tolak) sepenuhnya di G9.
- **BR-G8-09**: Klaim `DISPUTE` atau `COCOK` di sisi G9 **tidak pernah** memicu notifikasi balik ke G8 — hanya `PENDING` yang membuka alur re-koding (selaras BR-G9-12).
- **BR-G8-10**: Setiap perubahan status, koding, dokumen, dan panggilan method E-Klaim dicatat di `claim_audit_log` (append-only, tidak dapat diedit/dihapus dari UI).

## 9. Workflow / BPMN Interpretation

> Modul G8 **belum memiliki BPMN Lucidchart tersendiri** — tidak ditemukan file BPMN untuk kode G8 di `bpmn/`. Alur berikut diturunkan dari deskripsi prosedur teknis Manual Web Service E-Klaim 5.10.x, pola siklus klaim BPJS Casemix, dan kontrak data ke/dari G9 (PRD G9 §9). Ditandai [ASUMSI] pada bagian turunan.

**Alur Utama — Konsolidasi sampai Pengiriman Klaim (happy path):**
1. **Trigger**: Episode pelayanan (rawat inap/jalan) dinyatakan **selesai** di modul hulu (RME/SEP/Penunjang/Farmasi/Billing) → episode masuk work-list G8 (`Draft/Terkumpul`). *(FR-G8-01)*
2. **Konsolidasi otomatis**: sistem menarik data diagnosa, tindakan, hasil penunjang, farmasi, dan tarif dari modul hulu. *(FR-G8-02)*
3. **Cek kelengkapan (checklist)**: sistem memvalidasi dokumen wajib; status `Belum Lengkap` sampai seluruh item wajib terpenuhi, lalu berpindah ke `Siap Koding`. *(FR-G8-03)*
4. **Pengelolaan dokumen**: petugas mengunggah/melengkapi dokumen pendukung sesuai checklist bila belum tersedia otomatis. *(FR-G8-04)*
5. **Koding**: koder menginput diagnosis (ICD-10, primer/sekunder) & tindakan (ICD-9-CM) dibantu pencarian master; status → `Terkoding`. *(FR-G8-05)*
6. **Grouping & pengiriman ke E-Klaim**: sistem menjalankan `new_claim`→`set_claim_data`→Grouping iDRG→Import iDRG to INACBG→Grouping INACBG stage 1/2 (status → `Ter-grouping`, `has_nominal_selisih` terhitung) → `send_claim_individual` (status → `Terkirim`, `sent_at` terisi). *(FR-G8-06, FR-G8-07)*
7. **Handoff ke G9**: kontrak data klaim terkirim (`sep_no`, `g8_claim_id`, `jns_pelayanan`, `tgl_pulang`, `submitted_amount`, `grouper_amount`, `has_nominal_selisih`, `sent_at`, `g8_status`) diteruskan ke G9 untuk rekonsiliasi terhadap export Excel BPJS.

**Cabang / skenario alternatif:**
- **Klaim ditandai `PENDING` oleh G9** → notifikasi masuk ke G8 (`/submissions/notify-pending`) → klaim berpindah `Pending — Re-koding` → koder memperbaiki koding/data → re-grouping (`idrg_grouper_reedit`/`inacbg_grouper_reedit`) → kirim ulang (`reedit_claim`) → `resubmit_count` +1 → kembali ke langkah 7 (handoff ulang ke G9). Maksimal **2× siklus** (BR-G8-08); siklus ke-3 → status `Terkunci (limit resubmit)`, keputusan akhir di G9.
- **Klaim `DISPUTE` atau `COCOK` di G9** → **final**, tidak pernah kembali ke G8.
- **Kegagalan pada salah satu tahap grouping/pengiriman** (mis. validasi master data diagnosis/tindakan gagal di E-Klaim) → rangkaian berhenti, error ditampilkan, klaim tetap di status sebelumnya sampai diperbaiki & dicoba ulang (BR-G8-04).
- **Konsolidasi ulang** → bila data hulu berubah setelah tarikan awal (mis. hasil penunjang susulan), petugas dapat memicu re-sync manual sebelum status mencapai `Terkoding`.

## Asumsi
- [ASUMSI] G8 adalah modul yang menjalankan seluruh prosedur teknis pengiriman klaim ke E-Klaim (grouping iDRG/INACBG + send_claim_individual) DAN re-koding/resubmit klaim PENDING — dikonfirmasi selaras PRD G9 v1.6 §1. Entri List Fitur G7 & G10 tidak dipakai sebagai modul terpisah dalam PRD ini.
- [ASUMSI] Tidak ada BPMN Lucidchart khusus G8 — alur §9 diturunkan dari Manual Web Service E-Klaim 5.10.x dan kontrak data dengan G9.
- [ASUMSI] Data medis dari modul hulu (RME, SEP/Pendaftaran, Penunjang, Farmasi, Billing) tersedia & dapat ditarik otomatis saat episode selesai — mekanisme integrasi (event/pull/service) belum final [PERLU KONFIRMASI].
- [ASUMSI] Master ICD-10/ICD-9-CM tersedia sebagai referensi lookup di sistem; G8 tidak mengelola/mengedit master kode itu sendiri (hanya konsumen).
- [ASUMSI] Struktur tabel di §8.1 adalah usulan awal — nama/tipe kolom final mengikuti standar penamaan tim engineering.
- [ASUMSI] Nilai moneter disimpan sebagai integer Rupiah (bukan desimal pecahan); tarif grouper (INA-CBG/iDRG) dimiliki/dihitung di G8, tarif RS (real cost) dirujuk dari G2 sebagai pembanding.
- [KEPUTUSAN] Phase 3 (Accounting) = N/A untuk G8 — pemetaan COA & pencatatan penerimaan pembayaran terjadi di Billing/Accounting dan di G9 (Berita Acara & pembayaran), bukan di titik koding/pengiriman klaim.
- [KEPUTUSAN] State machine G8 bersifat event-driven (dipicu selesainya tahap/notifikasi G9), bukan toggle status bebas oleh user — menjaga konsistensi dengan model rekonsiliasi G9.
- [KEPUTUSAN] Struktur data diagnosis/tindakan dibuat granular & iDRG-ready (field icd10_im_code/icd9_im_code disiapkan) agar tidak perlu migrasi skema besar saat iDRG resmi berlaku penuh.
- [ASUMSI] resubmit_count di G8 disinkronkan dengan resubmit_count di claim_reconciliations milik G9 (maks 2×, selaras BR-G9-15/16) — mekanisme sinkronisasi transaksional lintas modul belum final [PERLU KONFIRMASI].

## Pertanyaan Terbuka
- [PERLU KONFIRMASI] Daftar final dokumen wajib per checklist (Rawat Inap vs Rawat Jalan) — termasuk kasus khusus (BBL, naik kelas rawat, readmisi).
- [PERLU KONFIRMASI] Mekanisme integrasi data dari modul hulu (RME/SEP/Penunjang/Farmasi/Billing) ke G8 — pull terjadwal, service call langsung, atau event-driven saat episode selesai.
- [PERLU KONFIRMASI] Mekanisme transport & sinkronisasi transaksional kontrak data G8 ↔ G9 (khususnya notifikasi PENDING & increment resubmit_count lintas modul) — view DB bersama / API internal / event.
- [PERLU KONFIRMASI] Kebijakan batas waktu pengajuan klaim (tanggal 10 bulan berikutnya) — apakah berlaku seragam atau bervariasi per RS/kontrak BPJS.
- [PERLU KONFIRMASI] Kebijakan ukuran file & retensi dokumen pendukung (berapa lama disimpan, apakah ada arsip terpisah).
- [PERLU KONFIRMASI] Kepemilikan tanda tangan elektronik (e-sign) resume medis final DPJP — apakah difasilitasi modul RME atau G8.
- [PERLU KONFIRMASI] Timeline resmi transisi iDRG dari Kemenkes & apakah diperlukan mode dual-running (iDRG & INA-CBGs berdampingan) pada MVP atau cukup disiapkan strukturnya saja.
- [PERLU KONFIRMASI] Apakah fondasi validasi konsistensi data (pra-koding, mis. cek kecocokan diagnosis-tindakan) perlu masuk MVP Phase 1 atau ditunda ke Phase 2.