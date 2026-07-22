# PRD — EMR Rawat Jalan: List Dokumen EMR

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code D6); PRD terkait: D1 General Consent, D2 Informed Consent, D3 Data Sosial Pasien, D4 Data Alergi, D5 Ringkasan Kesehatan Pasien, D7 EMR IGD, D8 EMR RI, D9 Screening Pasien, D10 Dokumen Pendukung; BPMN acuan: g-emr-inpatient, g-emr-patient-identity, g-emr-emergency, g-emr-screening; Draft user: Overview Fitur EMR Asesmen Perawat
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-06-21

## 1. Overview / Brief Summary

**List Dokumen EMR Rawat Jalan (D6)** adalah layar daftar (index) yang menampilkan seluruh dokumen Electronic Medical Record (EMR) milik satu pasien pada satu episode kunjungan rawat jalan (poliklinik). Layar ini menjadi **pintu masuk tunggal** bagi tenaga kesehatan (dokter/DPJP, perawat) untuk membuka, membuat, melanjutkan, atau melihat status dokumen EMR pada kunjungan RJ — mis. Asesmen Awal Perawat RJ, Asesmen Awal Dokter RJ, CPPT, Skrining (TB/risiko jatuh/nyeri/nutrisi), Consent, dan Dokumen Pendukung.

Modul ini **bukan** form pengisian klinis itu sendiri, melainkan **kerangka/daftar dokumen** yang mengikat tiap dokumen klinis ke konteks kunjungan (`no_rm` + `kunjungan_id` + `unit`/poli). Tiap baris dokumen menampilkan jenis dokumen, status pengisian, pengisi terakhir, dan waktu — serta tombol aksi sesuai kewenangan role.

Selaras draft user (Fitur EMR Asesmen Perawat): asesmen keperawatan diakses & dibuat **dari** layar List Dokumen EMR ini sebagai salah satu jenis dokumen. [ASUMSI] Cakupan klinis tiap form (mis. detail isi Asesmen Perawat) didefinisikan di PRD child masing-masing; D6 fokus pada daftar, status, navigasi, dan kontrol akses dokumen.

## 2. Background

**Kondisi saat ini (RS Tipe C & D):**
- Dokumentasi rawat jalan sebagian masih kertas/terpisah per form, sehingga riwayat dokumen 1 kunjungan tercerai-berai dan sulit ditelusuri.
- Tidak ada satu tampilan yang merangkum dokumen apa saja yang **wajib** dan **sudah/belum** diisi pada kunjungan RJ → asesmen perawat/dokter terlewat, berisiko temuan akreditasi.
- Duplikasi pencatatan: data yang sudah ada (identitas, alergi, TTV) ditulis ulang di tiap form.
- Sulit menelusuri siapa mengisi apa dan kapan (audit trail manual).

**Kenapa modul ini perlu:**
- Memberi **satu daftar terpusat** dokumen EMR per kunjungan RJ → mengurangi dokumen terlewat dan mendukung kepatuhan akreditasi & RME (Permenkes RME).
- Mempercepat akses dokter/perawat ke dokumen yang relevan dengan kontrol kewenangan.
- Menjadi fondasi autofill antar-dokumen (data identitas, alergi, riwayat) sehingga mengurangi duplikasi. [ASUMSI] Pola autofill diturunkan dari g-emr-inpatient ("Data riwayat penyakit, TTV, diagnosa autofill dari asesmen dokter RJ/IGD").

## 3. In Scope

### Scope Definition (dikerjakan)
1. Tampilan **List Dokumen EMR** per kunjungan rawat jalan: daftar dokumen + status + metadata (pengisi, waktu, versi).
2. **Pembukaan akses EMR** berbasis `no_rm` + `kunjungan_id` aktif (RJ), dengan validasi episode kunjungan aktif.
3. **Aksi per dokumen**: Buat (Create), Lanjutkan (Continue/Edit draft), Lihat (View read-only), Tandai Selesai/Final, Cetak.
4. **Header pasien (banner)**: identitas ringkas + flag alergi yang selalu tampil di atas list.
5. **Filter & pencarian** dokumen (jenis dokumen, status, tanggal).
6. **Indikator kelengkapan** dokumen wajib RJ (mis. Asesmen Awal Perawat, Asesmen Awal Dokter). [ASUMSI] Daftar dokumen wajib dikonfigurasi master.
7. **Kontrol kewenangan (RBAC)** per jenis dokumen & per aksi.
8. **Audit trail** akses & perubahan status dokumen (user, timestamp, pasien) — pola dari g-emr-patient-identity.

### Out Scope (TIDAK dikerjakan di D6)
- Detail field/logika klinis isi tiap form (Asesmen Perawat, CPPT, Skrining) → PRD child masing-masing (turunan D6, mis. D9 Screening).
- Modul pendaftaran/registrasi RJ (di Admisi) — D6 hanya **mengonsumsi** `kunjungan_id`.
- Penjaminan/SEP BPJS, klaim INA-CBG.
- Resep & farmasi RJ (g-support-pharmacy-rj) — diakses dari dokumen terkait, bukan dari list.
- EMR IGD (D7) & EMR RI (D8) — modul terpisah dengan konteks unit berbeda.

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Pusatkan akses dokumen EMR per kunjungan RJ | % kunjungan RJ yang dokumennya diakses via List Dokumen EMR | ≥ 95% [ASUMSI] |
| Kurangi dokumen wajib terlewat | % kunjungan RJ dengan Asesmen Awal Perawat & Dokter terisi sebelum kunjungan ditutup | ≥ 90% [ASUMSI] |
| Percepat akses dokumen | Rata-rata waktu buka List → buka dokumen | ≤ 3 detik [ASUMSI] |
| Telusur lengkap (akreditasi) | % aksi dokumen tercatat di audit trail | 100% |
| Kurangi duplikasi input | % field identitas/alergi yang autofill (bukan ketik ulang) | ≥ 80% [ASUMSI] |
| Kepatuhan kewenangan | Jumlah akses dokumen di luar kewenangan yang lolos | 0 |

[PERLU KONFIRMASI] Angka target final disepakati manajemen RS & tim mutu.

## 5. Related Feature

Dari List Fitur (cluster **EMR**, sheet MVP):

| Code | Menu | Relasi dengan D6 |
|------|------|------------------|
| **D6** | EMR > Rawat Jalan > EMR RJ > **List Dokumen EMR** | **Modul ini** (parent). Child dokumen menyusul. |
| D1 | EMR > Pendaftaran > General Consent | Muncul sebagai dokumen di list (jika berlaku untuk kunjungan). |
| D2 | EMR > Pendaftaran > Informed Consent | Dokumen tindakan tampil di list. |
| D3 | EMR > Data Pasien > Data Sosial Pasien | Sumber autofill identitas banner. |
| D4 | EMR > Data Pasien > Data Alergi | Sumber flag alergi di banner pasien. |
| D5 | EMR > Data Pasien > Ringkasan Kesehatan Pasien | Tautan ringkasan lintas-kunjungan. |
| D7 | EMR > IGD > List Dokumen EMR | Pola sejajar (konteks unit IGD). |
| D8 | EMR > Rawat Inap/IBS/VK > List Dokumen EMR | Pola sejajar (parent, child menyusul). |
| D9 | EMR > IGD & RJ > Screening pasien (TB, Stunting, COVID) | Dokumen skrining yang tampil/dibuat dari list. |
| D10 | EMR > ... > Dokumen pendukung | Dokumen pendukung & upload file tampil di list. |

[ASUMSI] D6 sebagai parent menampung child dokumen (catatan List Fitur: "akan ada code child dari code parent").

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — RS Tipe C&D, tanpa BPMN khusus D6]
1. Pasien selesai daftar di poli; berkas RM (kertas) atau modul terpisah disiapkan.
2. Perawat mengisi asesmen di lembar kertas / form aplikasi terpisah; dokter mengisi asesmen & CPPT di lembar lain.
3. Tidak ada satu daftar status; petugas mengecek manual dokumen mana yang sudah/belum diisi.
4. Riwayat & identitas ditulis ulang tiap form (duplikasi).
5. Penelusuran siapa-mengisi-apa dilakukan manual dari paraf di kertas.

### B. To-Be (kondisi diharapkan) — diturunkan dari g-emr-patient-identity & g-emr-inpatient
1. Setelah kunjungan RJ aktif (dari Admisi), tenaga kesehatan membuka menu **EMR pasien** → sistem **buka akses EMR berdasarkan `no_rm` + `kunjungan_id`** (pola g-emr-emergency "Buka akses EMR berdasarkan RM dan kunjungan").
2. Sistem menampilkan **banner pasien** (identitas + flag alergi) dan **List Dokumen EMR** kunjungan: dokumen wajib & opsional dengan status (Belum dibuat / Draft / Final).
3. Sistem **catat audit log** (user, timestamp, pasien) setiap akses — pola g-emr-patient-identity ("Catat audit log: User, Timestamp, Pasien yang diakses").
4. Tenaga kesehatan memilih dokumen → buat/lanjutkan/lihat sesuai kewenangan; data identitas/alergi/TTV **autofill** dari modul terkait [ASUMSI dari g-emr-inpatient].
5. Saat dokumen disimpan/difinalkan, **status di list ter-update otomatis** + indikator kelengkapan dokumen wajib menyala.
6. Kunjungan RJ hanya bisa ditutup bila dokumen wajib lengkap [PERLU KONFIRMASI aturan penutupan].

## 7. Main Flow / Mindmap

**Skenario 1 — Buka List Dokumen EMR (happy path)**
1. Tenaga kesehatan login → buka menu EMR / pilih pasien dari worklist poli.
2. Sistem validasi: ada `kunjungan_id` RJ aktif? → Ya: lanjut. Tidak: tampilkan pesan "Tidak ada kunjungan aktif".
3. Sistem buka akses EMR by `no_rm` + `kunjungan_id`; catat audit log.
4. Sistem render banner pasien + List Dokumen EMR (dokumen wajib + opsional + status).
5. User memilih jenis dokumen.

**Skenario 2 — Buat dokumen baru**
1. Dari list, user klik **Buat** pada dokumen ber-status "Belum dibuat".
2. Sistem cek kewenangan role atas jenis dokumen → berwenang? Ya: buka form (modul child). Tidak: tombol disabled + tooltip.
3. Setelah disimpan, sistem buat record dokumen status **Draft**, kembalikan ke list, perbarui status & metadata.

**Skenario 3 — Lanjutkan / Lihat / Finalkan**
1. Dokumen status **Draft** → aksi **Lanjutkan** (pengisi sah) atau **Lihat** (read-only bagi yang hanya berhak baca).
2. Pengisi menandai **Final** → status menjadi **Final/terkunci**; edit lanjutan butuh addendum [PERLU KONFIRMASI mekanisme addendum].
3. List perbarui indikator kelengkapan dokumen wajib.

**Skenario 4 — Cetak / Unduh**
1. Dari dokumen Final, user klik **Cetak** → sistem render PDF berkop RS; catat audit (cetak).

**Gateway/keputusan kunci:** Kunjungan aktif? · Role berwenang atas dokumen? · Dokumen wajib lengkap? · Dokumen sudah Final (boleh edit?).

## 8. Business Rules

- **BR-001** Akses EMR hanya untuk pasien dengan **`kunjungan_id` RJ aktif**; tanpa kunjungan aktif, list tidak dibuka. (trace: g-emr-emergency "Buka akses EMR berdasarkan RM dan kunjungan")
- **BR-002** Setiap dokumen EMR terikat ke **satu** `kunjungan_id` + `no_rm` + `unit`/poli; tidak boleh lintas kunjungan.
- **BR-003** **RBAC per jenis dokumen & aksi**: hanya role berwenang yang bisa Buat/Edit; role lain maksimal View. (mis. Asesmen Perawat → diisi Perawat; Asesmen Dokter/CPPT → Dokter/DPJP) [PERLU KONFIRMASI matriks final].
- **BR-004** Dokumen status **Final terkunci**; perubahan hanya via **addendum** bertanda waktu, dokumen asli tidak dihapus. [PERLU KONFIRMASI]
- **BR-005** Setiap akses, buat, ubah status, dan cetak **wajib tercatat audit trail** (user, role, timestamp, pasien, aksi). (trace: g-emr-patient-identity "Catat audit log")
- **BR-006** Indikator **dokumen wajib** RJ harus lengkap sebelum kunjungan ditutup; jika belum, beri peringatan. [PERLU KONFIRMASI apakah blok keras atau soft-warning]
- **BR-007** Banner **flag alergi** wajib tampil menonjol bila ada data alergi (sumber D4). (keselamatan pasien)
- **BR-008** Field identitas pasien di banner & autofill **mengikuti definisi kanonik** (`no_rm`, `nama`, `nik`, `jenis_kelamin`, `tgl_lahir`) dari modul Admisi/Data Pasien — tidak boleh definisi tandingan.
- **BR-009** Soft-delete only untuk dokumen Draft yang dibuat keliru; dokumen Final tidak bisa dihapus. [PERLU KONFIRMASI]

## 9. User Stories

- **US-001** Sebagai **Perawat RJ**, saya ingin melihat satu daftar semua dokumen EMR kunjungan pasien beserta statusnya, agar tahu dokumen mana yang belum saya isi. (trace: g-emr-patient-identity "Tampilkan dashboard EMR pasien")
- **US-002** Sebagai **Perawat RJ**, saya ingin membuat Asesmen Awal Keperawatan dari list, agar pencatatan terhubung ke kunjungan yang benar. (trace: g-emr-emergency "Buka form Asesmen Keperawatan"; draft user)
- **US-003** Sebagai **Dokter/DPJP**, saya ingin membuka asesmen perawat & CPPT dari satu tempat, agar bisa mengambil keputusan klinis tanpa berpindah modul.
- **US-004** Sebagai **Dokter/DPJP**, saya ingin field riwayat/TTV/diagnosa autofill dari asesmen sebelumnya, agar tidak mengetik ulang. (trace: g-emr-inpatient autofill)
- **US-005** Sebagai **tenaga kesehatan**, saya ingin selalu melihat banner identitas + flag alergi di atas list, agar aman saat pelayanan. (trace: D4 Data Alergi)
- **US-006** Sebagai **tenaga kesehatan**, saya ingin memfilter/mencari dokumen per jenis & status, agar cepat menemukan dokumen pada kunjungan dengan banyak dokumen.
- **US-007** Sebagai **DPJP**, saya ingin menandai dokumen Final agar terkunci dari perubahan tak sah, dan menambah addendum bila perlu koreksi.
- **US-008** Sebagai **Admin/Verifikator mutu**, saya ingin audit trail tiap akses dokumen, agar memenuhi akreditasi & telusur. (trace: g-emr-patient-identity "Catat audit log")
- **US-009** Sebagai **tenaga kesehatan**, saya ingin sistem mencegah saya membuka EMR pasien tanpa kunjungan aktif, agar dokumentasi selalu pada konteks benar.

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| **FR-001** | Sistem memvalidasi `kunjungan_id` RJ aktif sebelum membuka List Dokumen EMR; jika tidak ada → tampilkan pesan & blok akses. | BR-001; g-emr-emergency |
| **FR-002** | Sistem membuka akses EMR berdasarkan `no_rm` + `kunjungan_id` dan menampilkan daftar dokumen kunjungan. | g-emr-patient-identity |
| **FR-003** | Sistem menampilkan **banner pasien**: `no_rm`, `nama`, `jenis_kelamin`, `tgl_lahir`/umur, `jenis_penjamin`, flag **alergi**. | US-005; D3/D4 |
| **FR-004** | Tiap baris dokumen menampilkan: jenis dokumen, status (Belum/Draft/Final), pengisi terakhir, waktu update, label wajib/opsional. | US-001 |
| **FR-005** | Aksi per dokumen: **Buat / Lanjutkan / Lihat / Finalkan / Cetak**, ditampilkan sesuai RBAC & status. | US-002,003,007; BR-003 |
| **FR-006** | Sistem menerapkan RBAC per jenis dokumen & aksi; aksi tak berwenang disabled + alasan. | BR-003 |
| **FR-007** | Saat dokumen child disimpan/difinalkan, status & metadata di list ter-update otomatis. | US-001 |
| **FR-008** | Sistem menghitung & menampilkan **indikator kelengkapan dokumen wajib** kunjungan RJ. | US-001; BR-006 |
| **FR-009** | Filter & pencarian dokumen (jenis, status, rentang tanggal); default urut terbaru. | US-006 |
| **FR-010** | Sistem mencatat **audit trail** untuk akses, buat, ubah status, cetak (user, role, timestamp, pasien, aksi). | US-008; BR-005 |
| **FR-011** | Dokumen Final terkunci; koreksi via addendum bertanda waktu. | BR-004 |
| **FR-012** | Cetak dokumen Final → PDF berkop RS; aksi tercatat audit. | US-... ; FR-010 |
| **FR-013** | Autofill field klinis dari modul terkait saat membuka form child (identitas, alergi, TTV, diagnosa). | US-004; g-emr-inpatient |
| **FR-014** | [ASUMSI] Mode degradasi koneksi: list dapat dibuka read-only dari cache terakhir bila internet putus; tulis disinkron saat online. | Kendala Tipe C&D |

## 11. Data Requirements (Spesifikasi Field)

Catatan: D6 = layar **list & navigasi**; field klinis isi dokumen ada di PRD child. Field kanonik mengikuti **Konteks PRD terkait** (jangan definisi tandingan).

### A. Banner Pasien (TAMPIL — selalu di atas list) — FR-003
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. RM | master_pasien.no_rm (kanonik) | text format RM RS | – | identitas kunci |
| Nama | master_pasien.nama (kanonik, autofill) | text maks 100 | – | |
| Jenis Kelamin | master_pasien.jenis_kelamin (L/P) | badge L/P | – | |
| Tanggal Lahir / Umur | master_pasien.tgl_lahir | tanggal + umur (th/bln) | – | umur dihitung |
| Penjamin | kunjungan.jenis_penjamin (Umum/BPJS/Asuransi) | badge | – | dari Admisi |
| Flag Alergi | D4 Data Alergi | badge merah "ALERGI" / "NKA" | – | menonjol; BR-007 |
| Poli / Unit | kunjungan.unit (lookup A3) | text | – | konteks kunjungan |
| No. Kunjungan | kunjungan.kunjungan_id | text/kode | – | [ASUMSI] id internal |

### B. List Dokumen EMR (TAMPIL — daftar) — FR-004
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Jenis Dokumen | master_jenis_dokumen.nama | text + ikon | filter | mis. Asesmen Perawat, CPPT, Skrining TB |
| Wajib? | master_jenis_dokumen.is_wajib | badge Wajib/Opsional | filter | konfigurasi master |
| Status | dokumen_emr.status | badge: Belum/Draft/Final | filter; default sort | |
| Pengisi Terakhir | dokumen_emr.updated_by → Staff.nama | text | sort | trace Staff |
| Waktu Update | dokumen_emr.updated_at | tanggal+jam (dd-MM-yyyy HH:mm) | sort desc default | |
| Versi/Addendum | dokumen_emr.versi | angka | – | bila ada addendum |
| Aksi | – (RBAC + status) | tombol Buat/Lanjutkan/Lihat/Final/Cetak | – | FR-005 |

### C. Indikator Kelengkapan (TAMPIL — kartu ringkas) — FR-008
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Dokumen Wajib Terisi | count(dokumen wajib status Final) / count(wajib) | "3/4" + progress bar | – | kartu ringkasan |
| Status Kelengkapan | derivasi | badge Lengkap/Belum Lengkap | – | warna hijau/kuning |

### D. Filter / Pencarian (INPUT) — FR-009
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| q | Cari Dokumen | text | Tidak | maks 100 char | manual | cari nama jenis dokumen |
| f_jenis | Jenis Dokumen | dropdown | Tidak | dari master jenis dokumen | lookup | multi-select [ASUMSI] |
| f_status | Status | dropdown | Tidak | enum: Belum/Draft/Final | enum | |
| f_tgl_dari | Tanggal Dari | date | Tidak | <= tgl_sampai | manual | |
| f_tgl_sampai | Tanggal Sampai | date | Tidak | >= tgl_dari, <= hari ini | manual | |

### E. Aksi Buat/Finalkan Dokumen (INPUT minimal di level list) — FR-005, FR-011
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_dokumen_id | Jenis Dokumen | lookup | Ya | dari master jenis dokumen | lookup | menentukan form child |
| kunjungan_id | No. Kunjungan | lookup | Ya | kunjungan RJ aktif | auto (konteks) | BR-002 |
| no_rm | No. RM | lookup | Ya | format RM RS | auto (konteks) | kanonik |
| konfirmasi_final | Tandai Final | boolean | Tidak | true→kunci dokumen | manual | BR-004; perlu konfirmasi popup |
| alasan_addendum | Alasan Addendum | text | Tidak | wajib bila edit dokumen Final | manual | [PERLU KONFIRMASI] |

### F. Field Audit Trail (TAMPIL/sistem) — FR-010
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| User | audit.user_id → Staff.nama | text | filter | |
| Role | audit.role | text | filter | |
| Aksi | audit.action | enum: akses/buat/ubah-status/cetak | filter | |
| Timestamp | audit.created_at | dd-MM-yyyy HH:mm:ss | sort desc | |
| Pasien | audit.no_rm | text | – | BR-005 |

## 12. Non-Functional Requirements

- **NFR-001 Performa**: List Dokumen EMR tampil ≤ 3 detik untuk kunjungan dengan ≤ 50 dokumen [ASUMSI].
- **NFR-002 Keamanan & Privasi**: akses berbasis RBAC + sesi login; data RME terenkripsi saat transit (TLS) & saat disimpan [PERLU KONFIRMASI standar enkripsi RS]; patuhi Permenkes RME & UU PDP.
- **NFR-003 Audit & Telusur**: audit trail immutable (tidak bisa diubah/dihapus user), retensi sesuai kebijakan RM [PERLU KONFIRMASI lama retensi].
- **NFR-004 Ketersediaan**: target uptime jam layanan poli; **mode degradasi** read-only saat internet tidak stabil (Tipe C&D) — FR-014 [ASUMSI].
- **NFR-005 Usability**: 1 layar tanpa scroll horizontal di resolusi 1366×768; tombol aksi jelas; banner alergi kontras tinggi.
- **NFR-006 Kompatibilitas**: jalan di browser modern (Chrome/Edge terbaru) pada PC poli spesifikasi rendah.
- **NFR-007 Konsistensi data**: field identitas memakai definisi kanonik bersama; satu sumber kebenaran per field.
- **NFR-008 Skalabilitas**: mendukung penambahan jenis dokumen child tanpa ubah struktur list (konfigurasi master).

## 13. Integrasi Eksternal

| Integrasi | Tujuan di D6 | Catatan |
|-----------|--------------|---------|
| **Modul Admisi/Pendaftaran RJ** (internal) | Sumber `kunjungan_id`, `no_rm`, `unit`/poli, `jenis_penjamin` | D6 konsumen; tidak membuat kunjungan |
| **D3 Data Sosial / D4 Data Alergi** (internal) | Autofill banner identitas + flag alergi | BR-007 |
| **D5 Ringkasan Kesehatan** (internal) | Tautan riwayat lintas-kunjungan | opsional |
| **SATUSEHAT** | Pengiriman/penandaan dokumen klinis terstandar (Encounter, kode + system URI) | [ASUMSI] dilakukan di level dokumen child, D6 menampilkan status kirim SATUSEHAT |
| **BPJS (VClaim/SEP)** | Konteks penjamin kunjungan (tampil saja di banner) | tidak ada transaksi SEP di D6 |
| **Disdukcapil (NIK)** | Sumber identitas pasien (via modul Pendaftaran) | tidak dipanggil langsung dari D6 |
| **Master Data (Control Panel)** | Master jenis dokumen, dokumen wajib, matriks RBAC, master Unit (A3) | konfigurasi |

[PERLU KONFIRMASI] Apakah penandaan/kirim SATUSEHAT menjadi kolom status di list D6 atau sepenuhnya di dokumen child. [ASUMSI] LIS/RIS/Farmasi diakses dari dokumen terkait, bukan dari layar list.

## Asumsi
- D6 belum punya BPMN sendiri; alur To-Be diturunkan dari g-emr-patient-identity, g-emr-emergency, g-emr-inpatient, g-emr-screening (ditandai [ASUMSI] di isi).
- D6 = layar list/index dokumen; field klinis isi tiap dokumen didefinisikan di PRD child (parent-child sesuai catatan List Fitur).
- Field identitas (no_rm, nama, nik, jenis_kelamin, tgl_lahir, jenis_penjamin, unit) memakai definisi kanonik dari Konteks PRD terkait.
- kunjungan_id adalah id kunjungan internal dari modul Admisi RJ.
- Autofill identitas/alergi/TTV/diagnosa mengikuti pola g-emr-inpatient.
- Target performa/kelengkapan/akses adalah estimasi awal, perlu validasi manajemen & tim mutu.
- Mode degradasi koneksi disertakan karena keterbatasan infrastruktur RS Tipe C&D.

## Pertanyaan Terbuka
- Matriks RBAC final per jenis dokumen & aksi (siapa boleh Buat/Edit/View/Final) — perlu disepakati tim klinis.
- Aturan penutupan kunjungan RJ: blok keras atau soft-warning bila dokumen wajib belum lengkap (BR-006)?
- Mekanisme addendum & lock dokumen Final (BR-004/BR-011): bentuk addendum, siapa berwenang, jejak versi.
- Daftar dokumen WAJIB untuk kunjungan RJ Tipe C&D (mis. apakah Asesmen Awal Dokter + Perawat keduanya wajib).
- Apakah status pengiriman SATUSEHAT ditampilkan sebagai kolom di list D6.
- Kebijakan retensi & enkripsi audit trail / RME (NFR-002/003).
- Apakah mode offline/degradasi read-only (FR-014/NFR-004) masuk MVP atau fase berikutnya.