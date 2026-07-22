# PRD — Data Pasien: Ringkasan Kesehatan Pasien / Ringkasan Pulang Rawat Jalan (D5)

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code D5); Lampiran: Ringkasan Pulang Pasien-198332.pdf; PRD terkait: D3 Data Sosial Pasien, D4 Data Alergi, D6 List Dokumen EMR RJ, D12 Asesmen Perawat & Dokter IGD; BPMN acuan (analogi): g-emr-patient-identity, g-emr-inpatient, g-emr-screening
**Versi:** 1.3 - Revisi (v1.1: guard cetak berbasis asesmen, matriks role, field kosong `-`, TTE develop-later, SATUSEHAT out of scope, generate ulang tiap cetak, WIB only; v1.2: entry point MVP = Dashboard Pendaftaran Rawat Jalan via modal "Pilih Print Dokumen", cetak **langsung PDF** tanpa preview, D6/EMR in-scope menunggu EMR; v1.3: blok Pemeriksaan Fisik ditambah **Data Objektif Lainnya** dari asesmen)

## 1. Overview / Brief Summary

Fitur **Ringkasan Kesehatan Pasien / Ringkasan Pulang Rawat Jalan** adalah dokumen ringkasan medis yang dapat **di-generate dan dicetak** sebagai rekap pelayanan pasien selama **satu kunjungan rawat jalan (RJ)**. Dokumen berisi identitas pasien, tanggal kunjungan, ruang/poliklinik, jenis pembiayaan, hasil anamnesis, pemeriksaan fisik (TTV + data objektif lainnya), diagnosis utama & sekunder (berkode ICD-10), tindakan (berkode ICD-9-CM), terapi obat, dan status akhir kunjungan (Status Keluar).

Fitur ini memenuhi kebutuhan RS untuk memberikan salinan ringkasan pelayanan kepada pasien bila diperlukan: **kontrol lanjutan, rujukan ke faskes lain, kebutuhan administrasi, dan dokumentasi rekam medis**. Karena dokumen ini hanya dicetak pada kondisi tertentu dan **bukan bagian alur kerja rutin**, sistem cukup menyediakan mekanisme **generate + cetak langsung PDF** (tanpa layar preview terpisah, mengikuti alur V1) berdasarkan data medis yang sudah tersimpan pada kunjungan tersebut (tidak ada input medis baru pada fitur ini — sifatnya **read/compose only**). Pada MVP, titik akses cetak berada di **Dashboard Pendaftaran Rawat Jalan** (modal "Pilih Print Dokumen" → "Ringkasan Pasien Pulang"); setelah modul EMR tersedia, akses cetak juga tersedia dari **EMR Patient per kunjungan**.

Untuk menjaga validitas data cetak, sistem **hanya** dapat menghasilkan Ringkasan Pulang RJ apabila **asesmen perawat dan asesmen dokter** pada kunjungan tersebut telah diisi. Bila asesmen belum diisi, sistem menampilkan **popup peringatan** bahwa dokumen tidak dapat dicetak karena asesmen belum lengkap.

**Segmen:** RS Tipe C & D. **Modul:** EMR > Data Pasien (D5).

## 2. Background

**Masalah saat ini:**
- Ringkasan pelayanan RJ untuk pasien (kontrol/rujukan/administrasi) sering **ditulis/direkap manual** atau disalin ulang oleh petugas dari berbagai lembar asesmen, sehingga **rawan salah salin, tidak konsisten, dan memakan waktu**. [ASUMSI]
- Data medis kunjungan sebenarnya **sudah terdokumentasi** di modul asesmen dokter/perawat RJ, farmasi (resep), dan diagnosis — namun **belum terkonsolidasi** menjadi satu dokumen cetak yang standar. Analogi dari `g-emr-patient-identity`: modul EMR sudah menyediakan agregasi data klinis (Asesmen, CPPT, Diagnosis, Riwayat, Alergi), data pelayanan, dan riwayat obat. [ASUMSI]
- Tanpa validasi kelengkapan, dokumen bisa tercetak **kosong/parsial**, menurunkan mutu dokumentasi rekam medis.

**Mengapa fitur ini perlu:**
- Menyediakan **satu tombol generate** dokumen ringkasan standar RS dari data kunjungan yang sudah ada, mengurangi pekerjaan manual dan risiko salah salin.
- Menstandarkan format keluaran (lihat Lampiran `Ringkasan Pulang Pasien-198332.pdf`) termasuk header RS, kaki dokumen (kota, tanggal, DPJP), dan disclaimer lembar distribusi.
- Mendukung kebutuhan pasien akan bukti pelayanan untuk kontrol/rujukan/klaim di RS Tipe C & D dengan SDM terbatas.

## 3. In Scope

### Scope Definition (yang dikerjakan)
- **Generate & cetak langsung PDF** dokumen Ringkasan Pulang Rawat Jalan per **satu kunjungan RJ** yang dipilih (tanpa layar preview terpisah — mengikuti alur V1).
- **Titik akses (entry point):**
  - **MVP:** dari **Dashboard Pendaftaran Rawat Jalan (B1)** → pilih baris pasien → ikon **Print** → modal **"Pilih Print Dokumen"** → **"Ringkasan Pasien Pulang"**.
  - **Fase berikutnya (menunggu EMR):** dari **halaman EMR Patient per kunjungan** (via D6 List Dokumen EMR) — tetap in-scope, aktif setelah modul EMR tersedia.
- **Konsolidasi otomatis (read-only)** data dari sumber yang sudah tersimpan: identitas pasien (D3), TTV & anamnesis & pemeriksaan fisik (D12), diagnosis (utama/sekunder, ICD-10), tindakan (ICD-9-CM), terapi obat (resep/farmasi), status keluar, DPJP & petugas.
- **Validasi kelengkapan (guard cetak)**: cek apakah **asesmen perawat & dokter** kunjungan sudah diisi; bila belum → blokir cetak + tampilkan **popup peringatan**.
- **Cetak / unduh PDF** dengan template standar RS (header RS, footer tanda tangan DPJP, keterangan lembar distribusi: Lembar 1 Rekam Medis, Lembar 2 Penjamin Biaya, Lembar 3 Pasien).
- **Riwayat/log cetak** (audit trail: siapa mencetak, kapan, kunjungan mana) — analogi audit log `g-emr-patient-identity`.

### Out Scope (yang TIDAK dikerjakan)
- **Input/pengeditan data medis** (anamnesis, TTV, diagnosis, obat) — dilakukan di modul asesmen/diagnosis/farmasi masing-masing, bukan di sini.
- **Ringkasan Pulang Rawat Inap** (resume medis RI) — modul terpisah.
- **Ringkasan lintas-kunjungan / longitudinal patient summary** multi-episode. [PERLU KONFIRMASI apakah dibutuhkan pada MVP]
- **Pengiriman elektronik ke SATUSEHAT** sebagai bundle resume — **tidak termasuk MVP D5** (kebutuhan MVP cukup cetak/PDF).
- **Tanda tangan elektronik (TTE) tervalidasi** — **bergantung pada fitur TTE yang akan dikembangkan kemudian (develop later)**. Pada MVP, dokumen menyediakan area tanda tangan DPJP + **placeholder QR TTE**; fungsionalitas TTE mengikuti rilis fitur TTE (hingga tersedia, penandatanganan mengikuti kebijakan RS/TTD basah).
- **Menampilkan Data Alergi (D4) pada dokumen cetak** — di luar template Ringkasan Pulang RJ (mengikuti lampiran; tidak ada field tambahan di luar template).
- **Kustomisasi template mandiri oleh user RS** (WYSIWYG builder).

## 4. Goals and Metrics

| Tujuan | Metrik | Target |
|---|---|---|
| Mempercepat penyediaan ringkasan pelayanan RJ | Waktu rata-rata generate+cetak dokumen | < 30 detik dari klik "Cetak Ringkasan" [ASUMSI] |
| Mengurangi pekerjaan manual salin data | % dokumen ringkasan yang dibuat via generate otomatis (vs manual) | > 90% dalam 3 bulan pasca go-live [ASUMSI] |
| Menjamin validitas data cetak | % dokumen tercetak yang lolos validasi kelengkapan | 100% (dokumen tidak lengkap tidak boleh tercetak) |
| Akurasi data (tidak salah salin) | Jumlah komplain salah data pada dokumen | 0 kasus salah salin akibat sistem [ASUMSI] |
| Ketertelusuran | % aksi cetak yang tercatat di audit log | 100% |

> Metrik bertanda [ASUMSI] adalah usulan; angka final perlu disepakati manajemen RS.

## 5. Related Feature

Sumber data & keterkaitan (cluster EMR, dari List Fitur MVP):

| Code | Menu | Keterkaitan dengan D5 |
|---|---|---|
| **D3** | Data Pasien > Data Sosial Pasien | Sumber **identitas & demografi** (no_rm, nama, nik, jenis_kelamin, tgl_lahir, alamat, pembiayaan/penjamin) |
| **B1** | Pendaftaran > Pendaftaran Rawat Jalan | **Titik akses cetak MVP** — modal "Pilih Print Dokumen" → "Ringkasan Pasien Pulang" per baris pasien/kunjungan |
| **D4** | Data Pasien > Data Alergi | **Tidak ditampilkan** pada dokumen cetak (di luar template lampiran); tetap dapat dilihat di modul EMR |
| **D12** | EMR RJ > Asesmen Perawat & Dokter IGD/RJ | Sumber **anamnesis, pemeriksaan fisik/TTV, diagnosis, tindakan** |
| **D6** | Rawat Jalan > EMR RJ > List Dokumen EMR | **Titik akses cetak fase berikutnya (menunggu EMR)** — Ringkasan Pulang RJ muncul sebagai salah satu dokumen EMR yang bisa dibuka/dicetak dari list; tetap in-scope, aktif setelah modul EMR tersedia |
| **D33** | EMR RJ > Konsultasi DPJP | Sumber data tindakan "konsultasi" bila ada |
| **(Farmasi)** | Resep/CPO | Sumber **daftar obat** yang tercetak |

Catatan: D5 bersifat **konsumen data** dari D3, D4, D12, dan Farmasi; tidak menghasilkan data medis baru.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — tidak ada BPMN khusus D5]
1. Pasien selesai pelayanan RJ dan meminta salinan ringkasan (untuk kontrol/rujukan/administrasi).
2. Petugas/dokter membuka beberapa lembar asesmen & resep, lalu **menyalin/menulis ulang** ringkasan secara manual atau menyusun di aplikasi office.
3. Dokumen dicetak, ditandatangani DPJP, diserahkan ke pasien. Rawan salah salin, format tidak seragam, dan tidak ada log.

### B. To-Be (kondisi diharapkan) — diturunkan dari analogi `g-emr-patient-identity` & `g-emr-inpatient`
1. Petugas/dokter membuka **Dashboard Pendaftaran Rawat Jalan (B1)**, memilih baris pasien/kunjungan → klik ikon **Print** → modal **"Pilih Print Dokumen"** → **"Ringkasan Pasien Pulang"**. *(Fase berikutnya: akses juga dari EMR Patient per kunjungan via D6 — menunggu EMR.)*
2. Sistem **memeriksa kelengkapan asesmen** kunjungan (asesmen perawat & asesmen dokter).
   - **Jika asesmen belum diisi** → sistem menampilkan **popup peringatan** *"Asesmen perawat/dokter belum diisi — dokumen belum dapat dicetak"* dan membatalkan proses cetak. [BR-01]
   - **Jika asesmen sudah diisi** → lanjut.
3. Sistem **mengkonsolidasikan (autofill)** data dari sumber tersimpan: identitas (D3), anamnesis & TTV & pemeriksaan fisik (D12), diagnosis (ICD-10), tindakan (ICD-9-CM), obat (farmasi), status keluar, DPJP & petugas. Analogi: "Data ... akan autofill dari asesmen dokter RJ/IGD" (g-emr-inpatient).
4. Sistem **langsung men-generate PDF** sesuai template RS (tanpa layar preview terpisah) dan **mencatat audit log** (user, timestamp, pasien & kunjungan). Analogi: "Catat audit log: User, Timestamp, Pasien yang diakses" (g-emr-patient-identity).
5. Dokumen tercetak/terunduh sebagai PDF dan diserahkan ke pasien (3 lembar distribusi: Rekam Medis / Penjamin / Pasien).

## 7. Main Flow / Mindmap

**Skenario Utama — Generate & Cetak Ringkasan Pulang RJ (happy path):**
1. [Start] Petugas/DPJP membuka **Dashboard Pendaftaran Rawat Jalan (B1)**, memilih baris pasien/kunjungan. *(Fase berikutnya: dari EMR Patient per kunjungan via D6 — menunggu EMR.)*
2. Klik ikon **Print** → modal **"Pilih Print Dokumen"** → pilih **"Ringkasan Pasien Pulang"**.
3. Sistem cek kelengkapan asesmen kunjungan → **Gateway: Asesmen perawat & dokter sudah diisi?**
   - **Tidak** → tampil **popup peringatan** "asesmen belum diisi", proses cetak dibatalkan → [End: batal].
   - **Ya** → lanjut ke 4.
4. Sistem autofill data dari D3 (identitas), D12 (anamnesis/TTV/diagnosis/tindakan), Farmasi (obat), status keluar, DPJP, petugas.
5. Sistem **langsung men-generate PDF** sesuai template RS (header RS, isi klinis, footer TTD DPJP + QR TTE, keterangan lembar) — **tanpa layar preview terpisah**.
6. Sistem **catat audit log** (user, timestamp, no_rm, kunjungan_id).
7. [End: SEP/Kunjungan] PDF tercetak/terunduh & diserahkan ke pasien.

**Skenario Alternatif A — Asesmen belum diisi:** pada langkah 3 gateway "Tidak" → **popup peringatan** "asesmen perawat/dokter belum diisi", tidak ada dokumen dihasilkan.

**Skenario Alternatif B — Field parsial (mis. Tekanan Darah tidak terekam):** dokumen tetap dapat dicetak selama asesmen terisi (BR-01); field kosong ditampilkan sebagai tanda **`-`** (BR-09).

## 8. Business Rules

- **BR-01 (Guard cetak):** Ringkasan Pulang RJ **hanya** dapat digenerate/dicetak bila **asesmen perawat DAN asesmen dokter** pada kunjungan RJ telah **diisi**. Bila salah satu/keduanya belum diisi → sistem menampilkan **popup peringatan** "Asesmen perawat/dokter belum diisi — dokumen belum dapat dicetak" dan menonaktifkan tombol cetak. *(Traceability: To-Be langkah 2; analogi validasi `g-emr-screening` "Validasi data", `g-emr-emergency` "Validasi mandatory field")*
- **BR-02 (Cakupan 1 kunjungan):** Satu dokumen = satu kunjungan RJ (`kunjungan_id`). Tidak menggabung lintas kunjungan.
- **BR-03 (Read-only):** D5 tidak mengubah data medis; semua field bersumber dari modul lain (D3/D12/Farmasi). Perubahan data hanya via modul sumber.
- **BR-04 (Kode diagnosis & tindakan):** Diagnosis (utama & sekunder) wajib menampilkan **kode ICD-10** dan deskripsi (mis. "Z09.8 - Follow-up exam..."); tindakan menampilkan **kode ICD-9-CM** dan deskripsi (mis. "89.09 - Consultation, not otherwise specified") beserta **kategori (Rencana/Tindakan/Terapi)** sesuai data terekam. *(Sumber: lampiran + spesifikasi field)*
- **BR-05 (Distribusi lembar):** Dokumen mencantumkan keterangan distribusi: **Lembar 1 Rekam Medis, Lembar 2 Penjamin Biaya, Lembar 3 Pasien**. *(Sumber: lampiran)*
- **BR-06 (Identitas DPJP, petugas & TTE):** Footer menampilkan **DPJP** (nama + gelar/spesialis), **petugas pencetak**, dan **QR TTE**. Fungsi TTE **bergantung pada fitur TTE (develop later)**; hingga TTE tersedia, penandatanganan mengikuti kebijakan RS (TTD basah). *(Sumber: lampiran — terdapat QR pada area tanda tangan)*
- **BR-07 (Audit wajib):** Setiap generate/cetak dicatat di audit log (user, timestamp, no_rm, kunjungan_id). *(Analogi `g-emr-patient-identity`)*
- **BR-08 (Hak akses):** Hanya **Dokter, Perawat, dan Petugas Pendaftaran** yang boleh generate/cetak Ringkasan Pulang RJ; role diverifikasi sistem.
- **BR-09 (Field kosong):** Field tanpa data ditampilkan sebagai **`-`** (bukan `null/null`, baris tidak disembunyikan) tanpa menggagalkan cetak, selama BR-01 terpenuhi.
- **BR-10 (Arsip dokumen):** Dokumen **tidak diarsipkan** — PDF **di-generate ulang setiap kali cetak** dari data terkini kunjungan. Yang disimpan hanya **audit log** cetak (BR-07).
- **BR-11 (Zona waktu):** Seluruh stempel waktu (tanggal & jam kunjungan, footer tanggal cetak) menggunakan **WIB**. MVP tidak menangani WITA/WIT.

## 9. User Stories

- **US-001** — Sebagai **DPJP/Dokter RJ**, saya ingin **men-generate Ringkasan Pulang RJ dari data kunjungan yang sudah saya isi**, agar **tidak perlu menulis ulang ringkasan secara manual**. *(Traceability: To-Be 3–4; analogi "autofill dari asesmen dokter RJ/IGD" g-emr-inpatient)*
- **US-002** — Sebagai **Petugas Pendaftaran**, saya ingin **mencetak salinan ringkasan untuk pasien yang butuh kontrol/rujukan/administrasi**, agar **pasien mendapat bukti pelayanan yang sah dan seragam**. *(To-Be 5; BR-08)*
- **US-003** — Sebagai **Petugas/DPJP**, saya ingin **sistem mencegah cetak (dengan popup peringatan) bila asesmen perawat/dokter belum diisi**, agar **tidak ada dokumen kosong/tidak valid yang beredar**. *(BR-01)*
- **US-004** — Sebagai **Petugas**, saya ingin **dokumen langsung ter-generate sebagai PDF saat memilih "Ringkasan Pasien Pulang"**, agar **cepat dan seragam seperti alur V1 tanpa langkah preview tambahan**. *(Main Flow 5)*
- **US-005** — Sebagai **Manajemen/Rekam Medis**, saya ingin **setiap pencetakan tercatat (audit log)**, agar **ada ketertelusuran akses dokumen medis pasien**. *(BR-07)*
- **US-006** — Sebagai **Petugas**, saya ingin **mengunduh dokumen dalam format PDF**, agar **bisa disimpan/dikirim bila diperlukan**. *(Main Flow 7–8)*
- **US-007** — Sebagai **Pasien**, saya ingin **menerima ringkasan berisi identitas, diagnosis, obat, dan status pulang saya**, agar **bisa dipakai untuk kontrol lanjutan atau rujukan**. *(Sumber: lampiran)*

## 10. Functional Requirements

| ID | Requirement | Traceability |
|---|---|---|
| **FR-001** | Sistem menyediakan aksi **"Ringkasan Pasien Pulang"** pada modal **"Pilih Print Dokumen"** di **Dashboard Pendaftaran Rawat Jalan (B1)** untuk satu baris pasien/kunjungan RJ (MVP). Fase berikutnya: aksi cetak juga tersedia dari **EMR Patient per kunjungan (D6)** setelah modul EMR tersedia. | US-001, US-002 |
| **FR-002** | Sebelum generate, sistem **memvalidasi bahwa asesmen perawat & dokter sudah diisi**. Bila belum → tampilkan **popup peringatan** & nonaktifkan tombol cetak. | BR-01, US-003 |
| **FR-003** | Sistem **autofill (read-only)** field dokumen dari: identitas (D3), anamnesis/pemeriksaan fisik/TTV/diagnosis/tindakan (D12), obat (Farmasi), status keluar, DPJP, petugas. | To-Be 3, US-001 |
| **FR-004** | Sistem menampilkan **diagnosis dengan kode ICD-10** (utama & sekunder) dan **tindakan dengan kode ICD-9-CM** sesuai data terekam. | BR-04 |
| **FR-005** | Sistem **langsung men-generate PDF** dalam template standar RS (header, isi, footer TTD DPJP + QR TTE, keterangan lembar distribusi) **tanpa layar preview terpisah**. | US-004, BR-05, BR-06 |
| **FR-006** | Sistem menyediakan **Cetak** dan **Unduh PDF**. | US-006 |
| **FR-007** | Sistem **mencatat audit log** setiap generate/cetak (user, timestamp, no_rm, kunjungan_id). | BR-07, US-005 |
| **FR-008** | Sistem membatasi akses fitur pada **Dokter, Perawat, dan Petugas Pendaftaran**. | BR-08 |
| **FR-009** | Bila field sumber kosong, sistem menampilkan **`-`** tanpa menggagalkan cetak (selama FR-002 lolos). | BR-09 |
| **FR-010** | Sistem menampilkan **footer**: kota + tanggal (WIB), "Dokter Penanggung Jawab Pelayanan" + nama DPJP bergelar, **QR TTE**, dan nama petugas pencetak. | BR-06, BR-11 (sumber: lampiran) |
| **FR-011** | Ringkasan yang dihasilkan tercatat/terhubung sebagai dokumen pada **List Dokumen EMR (D6)** kunjungan tersebut. [ASUMSI] | Related Feature D6 |
| **FR-012** | Dokumen **di-generate ulang setiap cetak** (tidak diarsipkan sebagai file); hanya audit log yang disimpan. | BR-10 |
| **FR-013** | Seluruh stempel waktu pada dokumen menggunakan **WIB**. | BR-11 |

## 11. Data Requirements (Spesifikasi Field)

Catatan: D5 tidak memiliki form input medis. Terdapat **(A) pemicu cetak** (tanpa layar preview terpisah — parameter otomatis dari baris terpilih) dan **(B) dokumen keluaran** (menampilkan data). Field mengikuti definisi kanonik lintas-PRD.

### A. Pemicu Cetak Ringkasan (modal "Pilih Print Dokumen")
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| kunjungan_id | No. Kunjungan | context | Ya | kunjungan RJ terpilih | **auto dari baris pasien terpilih** (Dashboard Pendaftaran RJ) | 1 dokumen = 1 kunjungan (BR-02); bukan input ketik manual |
| no_rm | No. RM | context | Ya | format RM RS | **auto dari baris/kunjungan** terpilih | konsisten kanonik (D3/D6/D12) |
| jenis_dokumen | Jenis Dokumen | pilihan modal | Ya | fixed: **"Ringkasan Pasien Pulang"** | dipilih di modal "Pilih Print Dokumen" | memicu generate PDF langsung |
| aksi | Aksi | button | Ya | **Generate PDF langsung** (tanpa preview) | manual | tunduk BR-01 |

### B. Dokumen Keluaran — Ringkasan Pulang RJ (menampilkan data)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Header RS (nama/logo RS) | master profil RS | teks + logo | – | mis. "RS PKU MUHAMMADIYAH" (lampiran) |
| No. RM | no_rm (D3) | text | – | kanonik |
| Nama | nama (D3) | text, maks 100 char | – | kanonik; sertakan gelar sapaan (An./Tn./Ny.) [ASUMSI dari lampiran "An."] |
| NIK | nik (D3) | 16 digit | – | kanonik, valid Disdukcapil |
| Alamat | alamat (D3) | text multi-baris | – | dari data sosial pasien |
| Tanggal Lahir | tgl_lahir (D3) | date (dd MMMM yyyy) | – | kanonik, <= hari ini |
| Jenis Kelamin | jenis_kelamin (D3) | "Laki-laki/Perempuan" (map L/P) | – | kanonik enum L/P |
| Ruang/Poliklinik | poli_id / master poli (kunjungan) | text | – | mis. "Klinik Anak" |
| Pembiayaan/Penjamin | penjamin (D3/pendaftaran) | text | – | mis. "Umum" (lampiran) |
| Tanggal Kunjungan | kunjungan.tanggal + jam | dd-MM-yyyy ; HH:mm WIB | – | mis. "30-06-2026 ; 15:22 WIB" |
| Anamnesis | anamnesis/keluhan (D12) | free text | – | mis. "kontrol, BB naik 600 gram..." |
| Pemeriksaan Fisik — Tekanan Darah | td_sistolik / td_diastolik (D12 · blok Data Objektif) | "Tekanan Darah : {sistolik}/{diastolik} mmHg" | – | tampil `-` bila kosong (BR-09) — lihat catatan null/null di Pertanyaan Terbuka |
| Pemeriksaan Fisik — Nadi | nadi (D12 · blok Data Objektif) | "Nadi : {nilai} x/menit" | – | kanonik TTV |
| Pemeriksaan Fisik — RR | rr (D12 · blok Data Objektif) | "RR : {nilai} x/menit" | – | kanonik TTV |
| Pemeriksaan Fisik — Temperatur | suhu (D12 · blok Data Objektif) | "Temperatur : {nilai} °C" (30–45) | – | kanonik `suhu` |
| Pemeriksaan Fisik — Saturasi | saturasi (D12 · blok Data Objektif) | "Saturasi : {nilai} %" | – | field asesmen berlabel **"Saturasi"** (blok Data Objektif) |
| Pemeriksaan Fisik — Data Objektif Lainnya | data_objektif_lainnya (D12 · blok Data Objektif) | "Data Objektif Lainnya : {teks}" (free text) | – | **BARU** — field free text asesmen ikut dicetak; tampil `-` bila kosong (BR-09) |
| Diagnosis Utama | diagnosis primer (D12) | "KODE ICD-10 - deskripsi" | – | BR-04; mis. "Z09.8 - Follow-up exam..." |
| Diagnosis Sekunder | diagnosis sekunder (D12) | list "KODE ICD-10 - deskripsi" | – | BR-04; mis. "Anemia def besi" (pada lampiran tanpa kode karena sumber belum berkode) |
| Tindakan | tindakan/prosedur (D12/D33) | list "KODE ICD-9-CM - deskripsi" + kategori (Rencana/Tindakan/Terapi) | – | BR-04; mis. "89.09 - Consultation...", "edukasi" |
| Obat | resep/CPO (Farmasi) — **obat pulang / e-resep** | list: nama obat + bentuk + rute | – | mis. "Maltofer Drop 30 ml Tetes Oral" |
| Status Keluar | status_keluar (kunjungan/pelayanan) | enum (Pulang/Rujuk/...) | – | mis. "Pulang" |
| Footer Kota & Tanggal | master profil RS + tanggal cetak | "Kota, dd MMMM yyyy" | – | mis. "Wonosobo, 30 Juni 2026" |
| DPJP | dokter penanggung jawab (kunjungan) | nama + gelar/spesialis | – | mis. "dr. Galih Herlambang, Sp. A" (BR-06) |
| QR TTE | modul TTE (develop later) | QR code | – | placeholder MVP; fungsi TTE mengikuti rilis fitur TTE (BR-06) |
| Petugas | user pencetak | text | – | mis. "dokter" (lampiran) |
| Keterangan Lembar | statis template | teks kaki | – | "Lembar 1: Rekam Medis / 2: Penjamin Biaya / 3: Pasien" (BR-05) |

### C. Riwayat/Audit Cetak (list — untuk RM/Manajemen)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Waktu Cetak | audit_log.timestamp | dd-MM-yyyy HH:mm | sort desc (default) | BR-07 |
| User Pencetak | audit_log.user | text | filter | |
| No. RM / Nama | audit_log.no_rm + nama | text | filter/cari | |
| No. Kunjungan | audit_log.kunjungan_id | text | filter | |
| Jenis Dokumen | "Ringkasan Pulang RJ" | text | filter | |

## 12. Non-Functional Requirements

- **NFR-001 (Kinerja):** Generate PDF (autofill + render) ≤ 5 detik pada koneksi normal RS Tipe C/D; total sampai PDF siap cetak/unduh ≤ 30 detik. Tanpa layar preview terpisah. [ASUMSI]
- **NFR-002 (Ketersediaan/offline):** Fitur mengandalkan data lokal yang sudah tersimpan; **tetap dapat generate saat internet tidak stabil** karena tidak butuh panggilan eksternal wajib (kecuali cetak dari data yang sudah ada). [ASUMSI — sesuai kendala RS C/D]
- **NFR-003 (Keamanan & Privasi):** Akses dibatasi role berwenang (BR-08); dokumen memuat data medis sensitif → transport terenkripsi (HTTPS) dan kontrol akses berbasis role. Audit log tak dapat diubah pengguna biasa.
- **NFR-004 (Auditability & arsip):** Dokumen **tidak diarsipkan sebagai file** — di-generate ulang tiap cetak (BR-10). Semua aksi generate/cetak tercatat di **audit log** (user, timestamp, pasien, kunjungan); masa retensi log mengikuti kebijakan RM RS. [PERLU KONFIRMASI durasi retensi audit log]
- **NFR-005 (Konsistensi cetak/PDF):** Layout PDF konsisten (A4/A5), muat 1 halaman untuk kunjungan tunggal umumnya; font & header seragam sesuai profil RS.
- **NFR-006 (Akurasi data):** Nilai yang ditampilkan harus **identik** dengan sumber (tanpa transformasi selain format tampilan) untuk mencegah salah salin.
- **NFR-007 (Kompatibilitas):** PDF dapat dicetak pada printer standar RS (laser/inkjet), dan ukuran font terbaca.
- **NFR-008 (Lokalisasi):** Bahasa Indonesia; format tanggal Indonesia; zona waktu **WIB only** untuk MVP (tidak menangani WITA/WIT). [ASUMSI mayoritas RS target berada di zona WIB]

## 13. Integrasi Eksternal

D5 pada dasarnya adalah **konsolidator internal** (read-only) — integrasi eksternal minimal.

| Integrasi | Arah | Keperluan pada D5 | Status |
|---|---|---|---|
| **Modul internal D3 (Data Sosial)** | Baca | Identitas & demografi pasien (no_rm, nama, nik, alamat, tgl_lahir, jenis_kelamin, penjamin) | Wajib |
| **Modul internal D12 (Asesmen RJ)** | Baca | Anamnesis, pemeriksaan fisik/TTV + data objektif lainnya, diagnosis (ICD-10), tindakan (ICD-9-CM) | Wajib |
| **Modul Farmasi (Resep/CPO)** | Baca | Daftar obat yang diberikan | Wajib |
| **Modul D6 (List Dokumen EMR)** | Tulis-referensi | Registrasi Ringkasan sebagai dokumen kunjungan | [ASUMSI] |
| **Disdukcapil (NIK)** | — | Tidak dipanggil langsung oleh D5; NIK sudah tervalidasi saat pendaftaran (kanonik dari A2/D3) | Tidak langsung |
| **BPJS (VClaim/SEP)** | — | Tidak dipanggil oleh D5; status penjamin/SEP diambil dari data pendaftaran bila ditampilkan | Tidak langsung |
| **SATUSEHAT (bundle resume RJ)** | Kirim | Pengiriman terstruktur ke SATUSEHAT | **Out of scope MVP** (cukup cetak/PDF) |

Catatan interoperabilitas: kode diagnosis (ICD-10) & tindakan (ICD-9-CM) yang sudah dipilih di modul asesmen dapat menjadi dasar mapping SATUSEHAT di fase berikutnya; pada MVP D5 hanya ditampilkan/dicetak. [ASUMSI]

## Asumsi
- [ASUMSI] Tidak ada BPMN khusus D5; alur As-Is/To-Be diturunkan dari analogi g-emr-patient-identity (agregasi & audit log), g-emr-inpatient (autofill dari asesmen), dan pola validasi g-emr-screening/g-emr-emergency.
- [ASUMSI] D5 bersifat read-only: seluruh data medis berasal dari modul lain (D3/D12/Farmasi); tidak ada input medis di fitur ini.
- [ASUMSI] Struktur dokumen keluaran (header RS, isi klinis, footer DPJP, keterangan 3 lembar) mengikuti Lampiran 'Ringkasan Pulang Pasien-198332.pdf'.
- [ASUMSI] Diagnosis memakai ICD-10 dan tindakan memakai ICD-9-CM sesuai contoh pada lampiran.
- [ASUMSI] Field identitas/TTV mengikuti definisi kanonik lintas-PRD (no_rm, nama, nik, jenis_kelamin, tgl_lahir, kunjungan_id, suhu, dst.).
- [ASUMSI] Ringkasan dapat diakses/tercatat melalui List Dokumen EMR (D6).
- [ASUMSI] Fitur dapat berjalan saat internet tidak stabil karena hanya membaca data lokal yang sudah tersimpan (sesuai kendala RS Tipe C & D).

## Pertanyaan Terbuka

> Catatan: Pertanyaan berikut telah **terjawab** pada revisi v1.1–v1.2 dan dipindahkan ke Business Rules/Data Requirements — data medis minimal (BR-01: asesmen perawat & dokter), matriks role (BR-08: Dokter/Perawat/Petugas Pendaftaran), tampilan field kosong (BR-09: `-`), SATUSEHAT (out of scope), TTE (BR-06: develop later), arsip dokumen (BR-10: generate ulang tiap cetak), zona waktu (BR-11: WIB only), Data Alergi (tidak dicetak), **entry point MVP** (Dashboard Pendaftaran RJ via modal "Pilih Print Dokumen"; D6/EMR menunggu EMR), **alur cetak** (langsung PDF tanpa preview).

Yang masih perlu klarifikasi:
- **Konfirmasi guard BR-01:** apakah **kedua** asesmen (perawat & dokter) **wajib** terisi untuk lolos cetak, atau cukup **salah satu** (mis. kasus poli tertentu yang tidak selalu melalui asesmen perawat)?
- **Konfirmasi tampilan field kosong pada TTV:** BR-09 menetapkan **`-`**, namun lampiran/V1 menampilkan **`null/null`** untuk Tekanan Darah kosong. Pakai `-` (konsisten BR-09) atau pertahankan `null/null` seperti V1? *(Berlaku juga untuk apakah "Data Objektif Lainnya" kosong ditampilkan `-` atau barisnya disembunyikan.)*
- **Nama field teknis (DB) di D12** untuk binding: label input asesmen sudah jelas dari form Data Objektif (Tekanan Darah sistolik/diastolik, Nadi, RR, Suhu, Saturasi, Data Objektif Lainnya) — tinggal konfirmasi nama kolom di database.
- **Masa retensi audit log cetak** (durasi penyimpanan log — dokumen sendiri sudah dipastikan generate ulang, tidak diarsip).
- **Ukuran kertas standar** dokumen (A4 vs A5) dan jumlah rangkap/lembar cetak (lampiran menyebut 3 lembar: Rekam Medis / Penjamin / Pasien).
- **Ringkasan lintas-kunjungan (longitudinal)** — apakah dibutuhkan pada MVP, atau tetap 1 dokumen = 1 kunjungan (BR-02)?
- **Cakupan akses Petugas Pendaftaran** — boleh mencetak untuk semua kunjungan, atau hanya kunjungan yang status keluarnya sudah terisi?