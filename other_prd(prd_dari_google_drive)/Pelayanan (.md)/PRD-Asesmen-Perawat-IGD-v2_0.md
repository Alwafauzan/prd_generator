# PRD — Asesmen Perawat IGD

**Related Document:** PRD Triase IGD (Re-triase — **sumber autofill**, hard dependency); PRD Asesmen Dokter IGD (asesmen paralel independen); Dashboard Pelayanan IGD; EMR Pasien; Master Diagnosa & Rencana Tindakan Keperawatan; Master Data Staf / RBAC; Mapping Field Asesmen IGD (`mapping_field_igd.xlsx`); Regulasi PMK 47/2018 tentang Pelayanan Kegawatdaruratan; Integrasi SATUSEHAT FHIR R4; Referensi V1 (screenshot/Figma — **belum dilampirkan**, lihat §16)
**Dokumen ID:** PRD-P-APIGD-v2.0  ·  **Versi:** 2.0 (Draft — konversi format generator dari sumber v1.0)
**Tanggal Disusun:**08 Juli 2026 (konversi) · sumber draft 07 Juli 2026 · **Penyusun:** Team Product — Tamtech International · **PIC:** Fafa (Product Owner)
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Q3 2026 — Fase 01

## 1. Overview / Brief Summary

**Asesmen Perawat IGD v2.0** adalah modul yang digunakan perawat untuk mendokumentasikan hasil pengkajian kondisi pasien selama pelayanan di Instalasi Gawat Darurat (IGD) secara terstruktur dan terintegrasi. Modul menampung asesmen keperawatan gawat darurat — data subjektif, data objektif, skrining klinis, masalah & tindakan keperawatan, tindakan IGD, keseimbangan cairan, hingga dokumentasi hasil penunjang — sebagai bagian dari rekam medis elektronik (Electronic Medical Record/EMR) pasien.

Berbeda dengan pelayanan rawat jalan, asesmen di IGD berjalan **dinamis**: perawat dan dokter dapat mengisi asesmen secara **independen** sesuai kebutuhan pelayanan, tanpa terikat urutan pengisian satu sama lain. Sistem mendukung pengisian, pembaruan, dan penyimpanan asesmen sesuai kewenangan pengguna melalui **Role-Based Access Control (RBAC)**, menyediakan **riwayat informasi klinis** pasien sebagai referensi, dan mencatat setiap perubahan data sebagai **riwayat perubahan (audit trail)**.

Fokus utama v2 dibanding v1: (1) **autofill data triase** ke field asesmen sesuai business rule agar tidak ada pengisian ganda; (2) **RBAC + tampilan read-only ringkas** yang hanya menampilkan field/opsi terisi; (3) **riwayat perubahan asesmen** menggantikan sekadar info *last updated*; (4) **penyimpanan bertahap** tanpa harus melengkapi seluruh section; (5) **redesign layout** (mengurangi white space & scrolling) dan responsivitas PC/tablet; serta (6) **penyediaan riwayat klinis** (kunjungan, lab, radiologi, PA) langsung di dalam alur asesmen.

> Referensi: sumber PRD Asesmen Perawat IGD v1.0 (Team Product, 07 Juli 2026), BPMN "Pelayanan – IGD – Asesmen Perawat IGD", dan mapping field `mapping_field_igd.xlsx`.

## 2. Background

Asesmen Perawat IGD adalah salah satu proses utama pelayanan gawat darurat: menjadi dasar perawat dalam mengkaji kondisi pasien, menetapkan masalah keperawatan, mendokumentasikan tindakan, dan menjaga kesinambungan pelayanan klinis. PMK 47/2018 menempatkan perawat sebagai penanggung jawab pelayanan keperawatan kegawatdaruratan, sehingga dokumentasi asesmen keperawatan wajib lengkap dan tertelusur.

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: Business Process (As-Is) PRD v1.0:
- Modul sudah mendukung dokumentasi keperawatan IGD; perawat dapat menyimpan dan memperbarui asesmen sesuai perkembangan kondisi pasien.
- Dokter dan perawat sudah bisa mengisi asesmen secara independen sesuai role.
- Namun sistem **hanya menampilkan info *last updated*** tanpa riwayat perubahan.

**Masalah/pain point** — sumber: Pain Point PRD v1.0:
- **Aspek bisnis proses:** data hasil triase belum dimanfaatkan optimal → masih ada pengisian data berulang (keluhan utama, TTV, dsb.).
- **Aspek UX:** tampilan read-only masih menampilkan seluruh field & opsi isian (kurang ringkas dibaca role lain); tata letak form belum optimal — white space berlebih dan scrolling panjang; form belum sepenuhnya responsif di berbagai resolusi perangkat.
- **Aspek logic system:** riwayat perubahan asesmen belum tersedia (hanya *last updated*), sehingga penelusuran dan akuntabilitas dokumentasi lemah.

**Dampak utama yang disasar v2:**
- **Dokumentasi lebih cepat & tanpa entri ganda** lewat autofill triase.
- **Akuntabilitas & auditabilitas** dokumentasi lewat audit trail (mendukung akreditasi KARS).
- **Keterbacaan & efisiensi** lewat read-only ringkas + layout rapi + responsivitas PC/tablet.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = seluruh cakupan inti Asesmen Perawat IGD (lihat §3): autofill triase, pengisian & simpan bertahap, RBAC + read-only ringkas, riwayat klinis, riwayat perubahan/audit trail.
- **Fase 2** = enhancement pasca-MVP stabil (belum didetailkan pada sumber). `[**]` `[PERLU KONFIRMASI]`

> Catatan volume: IGD menangani ± 100–150 pasien/hari (konteks operasional Neurovi). Target beban puncak pengisian form perlu disepakati (lihat §15/NFR & Pertanyaan Terbuka). `[PERLU KONFIRMASI]`

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Autofill Data Triase** — sistem menampilkan data tertentu dari proses triase ke form asesmen perawat sesuai mapping/business rule; data hasil autofill **tetap dapat diperbarui** oleh perawat.
2. **Pengisian Asesmen** — perawat mengisi/memperbarui seluruh section: Data Subjektif, Data Objektif, Nilai Nyeri, Asesmen Risiko Jatuh, Asesmen Kemampuan Ibadah, Skrining Gizi, Asesmen Pasien Infeksius & Immunocompromise, Masalah & Tindakan Keperawatan (Diagnosis + Rencana Tindakan), Tindakan IGD, Keseimbangan Cairan, dan Hasil Penunjang Lainnya (rincian field di §14).
3. **Simpan Bertahap** — perawat dapat menyimpan asesmen secara bertahap **tanpa** harus melengkapi seluruh section, selama episode kunjungan masih aktif.
4. **Hak Akses (RBAC)** — hak lihat/tambah/ubah/simpan dibatasi per role; saat form dibuka, tab asesmen sesuai role yang login terbuka, sedangkan asesmen milik role lain hanya **read-only**.
5. **Tampilan Read-Only Ringkas** — mode read-only hanya menampilkan **field/opsi yang terisi** (bukan seluruh opsi pilihan).
6. **Riwayat Klinis** — menampilkan ringkasan riwayat kunjungan, hasil laboratorium PK, radiologi, patologi anatomi, dan penunjang lain sebagai **referensi (read-only)** selama asesmen.
7. **Simpan Asesmen ke EMR** — menyimpan hasil asesmen pada episode kunjungan aktif beserta user dan timestamp penyimpanan/pembaruan; dapat diakses kembali lewat EMR pasien.
8. **Riwayat Perubahan Asesmen (Audit Trail)** — mencatat setiap create/update beserta user, waktu, dan aktivitas perubahan, lalu menampilkannya sebagai riwayat.
9. **Redesign Layout & Responsivitas** — merapikan layout (mengurangi white space & scrolling) dan memastikan responsif di PC & tablet tanpa button terpotong/tertutup pada resolusi kecil.

### Out Scope

- **Form Konsulan** — PRD terpisah.
- **Observasi Pasien IGD** — PRD terpisah.
- **Asesmen Dokter IGD** (asesmen medis) — PRD terpisah; berjalan paralel & independen (§6).
- **Triase / Re-triase IGD** — PRD terpisah; modul ini hanya **mengonsumsi** hasil triase sebagai autofill.
- **Definisi ulang skala kanonik** Nilai Nyeri, Risiko Jatuh, dan Skrining Gizi — **reuse** definisi kanonik asesmen general (§14); modul ini tidak mendefinisikan ulang skala/scoring-nya.

## 4. Goals and Metrics

### Tujuan
Menyediakan dokumentasi asesmen keperawatan IGD yang **cepat, fleksibel, aman, dan tertelusur** — mempercepat pengisian (autofill triase + simpan bertahap), memudahkan akses referensi klinis, menjaga keamanan akses lewat RBAC, dan mendukung akuntabilitas lewat audit trail — tanpa mengurangi kelengkapan dokumentasi sebagai bagian EMR.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Kecepatan buka & simpan/update form | ≤ 1 detik | NFR-01; Metrik sumber #1 |
| Pengurangan entri berulang | Data triase tampil otomatis pada field asesmen sesuai business rule | FR-01; Metrik sumber #2 |
| Fleksibilitas dokumentasi | User dapat simpan & update bertahap sesuai perkembangan kondisi | FR-03; Metrik sumber #3 |
| Kesinambungan informasi klinis | Riwayat kunjungan & hasil penunjang dapat diakses sebagai referensi saat asesmen | FR-04; Metrik sumber #4 |
| Keamanan akses | Asesmen hanya dapat diakses/diubah sesuai RBAC | NFR-05; Metrik sumber #5 |
| Auditabilitas | 100% aktivitas simpan/update tercatat beserta user & timestamp pada riwayat perubahan | NFR-06; Metrik sumber #6 |
| Efisiensi tampilan | Scrolling & white space berkurang dibanding V1 (target kuantitatif disepakati) `[PERLU KONFIRMASI]` | NFR-04 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Modul |
|-------|----------------------|
| Triase / Re-triase IGD | **Sumber data autofill** (keluhan utama, TTV, data objektif lainnya, dll. sesuai mapping). Hard dependency. |
| Asesmen Dokter IGD | Asesmen paralel independen; sebagian TTV/objektif dapat saling merujuk sesuai mapping (autofill "dari triase atau asesmen perawat"). |
| Dashboard Pelayanan IGD | Konsumen status pengisian asesmen perawat (event source checkpoint). |
| EMR Pasien | Tujuan penyimpanan hasil asesmen (episode kunjungan) + sumber riwayat klinis (kunjungan, lab, radiologi, PA). |
| Master Diagnosa & Rencana Tindakan Keperawatan | Sumber master data untuk Diagnosis Keperawatan & Rencana Tindakan Keperawatan (multiple input). |
| Master Data Staf / RBAC | Sumber role & privilege untuk kontrol akses tab, edit, dan read-only. |
| Integrasi SATUSEHAT FHIR R4 | Target pertukaran data klinis terstruktur (mapping resource FHIR belum didefinisikan — §16, Pertanyaan Terbuka). |

Dependency lintas modul: **Master Diagnosa Keperawatan**, **Master Staf/RBAC**, **Triase IGD** (autofill), **EMR** (persist + riwayat klinis).

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Perawat IGD | Primary | Eksekutor pengisian/pembaruan asesmen keperawatan; landing ke tab Asesmen Perawat. |
| Dokter IGD | Secondary | Membaca asesmen perawat (read-only) sebagai referensi; mengisi asesmen medis secara independen di tab-nya sendiri. |
| Auditor / Tim Mutu | Secondary | Konsumen riwayat perubahan (audit trail) untuk penelusuran & akuntabilitas. |
| Administrator Sistem | Tersier | Mengonfigurasi RBAC (role, privilege akses asesmen). |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1) — sumber: Business Process PRD v1.0
1. Pasien datang ke IGD → perawat melakukan triase → petugas registrasi pasien IGD.
2. Dokter/perawat membuka form Asesmen Gawat Darurat sesuai role masing-masing.
3. Perawat mengisi asesmen keperawatan; dokter mengisi asesmen medis **independen**.
4. Perawat dapat menyimpan/memperbarui asesmen sesuai perkembangan kondisi pasien.
5. Sistem hanya menampilkan info *last updated* (tanpa riwayat perubahan).
6. Sistem menyimpan hasil asesmen sebagai bagian rekam medis pasien.

### B. To-Be (Neurovi v2 — Fase 1 MVP) — sumber: Business Process (To-Be) PRD v1.0 + BPMN
1. Pasien datang ke IGD → perawat triase → petugas registrasi pasien IGD.
2. Dokter/perawat membuka form Asesmen Gawat Darurat secara **independen** sesuai role; sistem menampilkan tab asesmen sesuai role yang login.
3. Sistem melakukan **autofill** data tertentu dari hasil triase ke asesmen perawat sesuai business rule (BR-001).
4. Perawat melengkapi/memperbarui data asesmen; dapat **menyimpan bertahap** tanpa menyelesaikan seluruh section (BR-004).
5. Sistem menampilkan **ringkasan riwayat klinis** sebagai referensi selama asesmen.
6. Setiap simpan/update dicatat beserta user, waktu, dan aktivitas → **riwayat perubahan (audit trail)** (BR-006).
7. Role lain melihat hasil asesmen perawat dalam **read-only ringkas** sesuai hak akses (BR-002, BR-003).
8. Sistem menyimpan hasil asesmen ke EMR pada episode kunjungan aktif (BR-005).

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Data triase | Tidak dimanfaatkan → entri berulang | Autofill ke asesmen sesuai mapping (tetap editable) — BR-001 |
| Riwayat perubahan | Hanya *last updated* | Audit trail penuh (user, waktu, aktivitas) — BR-006 |
| Read-only | Menampilkan seluruh field & opsi | Ringkas: hanya field/opsi terisi — BR-003 |
| Layout & responsif | White space berlebih, scrolling panjang, button berisiko terpotong | Layout rapi, scrolling minimal, responsif PC & tablet — NFR-04, NFR-08 |
| Penyimpanan | Simpan (perkembangan kondisi) | Simpan **bertahap** per section — BR-004 |

## 7. Main Flow / Mindmap

> Acuan visual: BPMN "Pelayanan – IGD – Asesmen Perawat IGD" (swimlane: Pasien/Pengantar · Petugas Triase IGD · Petugas Pendaftaran IGD · Perawat IGD · Sistem EMR/HIS Neurovi).

### Skenario 1 — Alur normal pengisian asesmen perawat
1. Pasien datang ke IGD (Pasien/Pengantar) → menunggu pelayanan keperawatan.
2. Petugas triase melakukan triase awal → simpan hasil triase (data triase mengalir ke sistem).
3. Petugas pendaftaran melakukan registrasi IGD (pasien lama → cari No. RM lama; pasien baru → buat RM baru) → lengkapi data RM & kunjungan IGD aktif.
4. Perawat membuka form Asesmen Keperawatan IGD → sistem membuka akses EMR pasien & kunjungan IGD aktif, menampilkan form, dan **autofill** data dari triase/registrasi (identitas, anamnesa, TTV awal) — BR-001.
5. Perawat mengisi berurutan (dapat dilewati/parsial): Data Subjektif → Data Objektif → Nilai Nyeri → Risiko Jatuh → Kemampuan Ibadah → Skrining Gizi → Infeksius/Immunokompromise → Masalah & Tindakan Keperawatan → Rencana Tindakan → Tindakan IGD → Keseimbangan Cairan → Hasil Penunjang (upload) → keterangan tambahan.
6. Perawat klik **Simpan** → sistem **validasi field wajib** → jika valid: simpan asesmen + catat audit log (user & timestamp) → tampilkan hasil asesmen pada EMR pasien; jika invalid: tampilkan error pada field wajib yang belum lengkap (BR-007).

### Skenario 2 — Autofill dari triase & pembaruan
- Field yang bertanda "autofill dari triase" (keluhan utama, TTV, data objektif lainnya, dll.) terisi otomatis saat form dibuka (BR-001).
- Perawat tetap dapat **mengubah** nilai hasil autofill bila kondisi pasien berkembang; nilai baru yang disimpan tercatat di riwayat perubahan.

### Skenario 3 — Simpan bertahap & pembaruan lintas waktu
- Perawat menyimpan sebagian section (mis. hanya Data Subjektif + TTV) → asesmen tersimpan sebagai bagian episode aktif (BR-004).
- Pembaruan berikutnya (menambah tindakan, keseimbangan cairan, dsb.) tercatat sebagai entri baru pada riwayat perubahan (BR-006).

### Skenario 4 — Akses read-only role lain
- Dokter/role lain membuka Asesmen Gawat Darurat → landing ke tab role-nya; tab Asesmen Perawat tampil **read-only ringkas** (hanya field terisi) — BR-002, BR-003.
- Role non-perawat tidak dapat mengubah asesmen perawat (BR-002).

### Skenario 5 — Aksi lanjutan dari form asesmen `[ASUMSI: dari Feature Overview]`
- Dari konteks asesmen, perawat dapat mengakses aksi lanjutan: Triase, Catatan Pemberian Obat (CPO), Buat Resep, Pilih Penunjang, Buat Surat, Input Tindakan, dan EMR. `[PERLU KONFIRMASI]` daftar & perilaku aksi lanjutan (tidak dirinci pada sumber PRD v1.0).

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Sistem mengisi otomatis (autofill) field asesmen perawat dari data triase sesuai mapping (`mapping_field_igd.xlsx`); nilai autofill **tetap dapat diperbarui** perawat. Field yang di-mapping: Keluhan Utama, TD, RR, Nadi, Suhu, SatO₂, TB, BB, GDS, Data Objektif Lainnya (lihat §14). | FR-01; US-01; Mapping Field |
| **BR-002** | Hak akses lihat/tambah/ubah/simpan ditentukan per role (RBAC). Role perawat → tab Asesmen Perawat aktif; role lain → asesmen perawat **read-only** (tidak dapat diubah). | FR-05; US-03 |
| **BR-003** | Tampilan read-only hanya menampilkan **field/opsi yang terisi**, bukan seluruh opsi pilihan. | FR-06; US-03 |
| **BR-004** | Perawat dapat menyimpan asesmen **bertahap** (parsial) tanpa melengkapi seluruh section, selama episode kunjungan IGD masih aktif; data dapat diperbarui kembali. | FR-03; US-02 |
| **BR-005** | Hasil asesmen disimpan pada **episode kunjungan aktif** sebagai bagian EMR, beserta user penyimpan/pengubah dan timestamp (format DD-MM-YYYY HH:MM). | FR-07; US-05 |
| **BR-006** | Setiap aktivitas create/update asesmen dicatat sebagai **riwayat perubahan (audit trail)**: user, tanggal, waktu, aktivitas. 100% perubahan tersimpan (tidak ada yang hilang). Riwayat hanya dapat dilihat sesuai hak akses. | FR-08; US-06; NFR-06 |
| **BR-007** | Saat Simpan, sistem memvalidasi **field wajib**; jika belum lengkap, simpan ditolak dan error ditampilkan pada field terkait. Field wajib minimal: Diagnosis Keperawatan & Rencana Tindakan Keperawatan (bertanda `*`). | FR-02; §14; BPMN "Validasi field wajib" |
| **BR-008** | Skor & kesimpulan yang bersifat turunan — **Skor/Kategori Risiko Jatuh** dan **Kesimpulan Skrining Gizi (status malnutrisi)** — dihitung **otomatis** dari input dan ter-update real-time (read-only bagi user). | FR-02; §14.2 |
| **BR-009** | **Nilai Nyeri**, **Risiko Jatuh**, dan **Skrining Gizi** memakai **definisi kanonik asesmen general** ("Sama dengan general" / "Sesuai umur seperti general" pada mapping). Risiko Jatuh menyesuaikan instrumen per kelompok umur. `[PERLU KONFIRMASI]` instrumen per umur (mis. anak vs dewasa vs geriatri). | §14; Mapping Field |
| **BR-010** | Tabel Keseimbangan Cairan digenerasi dari input (Waktu, Pemasukan/Pengeluaran) dan bersifat **read-only**; Jumlah Pemasukan/Pengeluaran dihitung otomatis oleh sistem per entri waktu. | FR-02; §14 |
| **BR-011** | Asesmen perawat dan asesmen dokter IGD dapat diisi **independen** tanpa saling menunggu urutan; keduanya menempel pada episode kunjungan IGD yang sama. | §6; US-02 |

## 9. Kontrol Akses & Tampilan Read-Only (RBAC — Display Rules)

> Modul ini punya aturan tampil non-trivial per role. Kontrak tampilan minimum:

| Aspek | Role Perawat (owner) | Role Lain (mis. Dokter) |
|-------|----------------------|--------------------------|
| Landing saat form dibuka | Tab **Asesmen Perawat** aktif & editable | Tab role masing-masing aktif; tab Asesmen Perawat tampil sebagai read-only |
| Edit asesmen perawat | Ya (tambah/ubah/simpan) — BR-002 | Tidak (read-only) — BR-002 |
| Tampilan field | Seluruh field & opsi (mode input) | **Hanya field/opsi terisi** (read-only ringkas) — BR-003 |
| Riwayat perubahan | Dapat dilihat sesuai hak akses | Dapat dilihat sesuai hak akses — BR-006 |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-01** | **Autofill Data Triase** — saat form dibuka, sistem mengisi field asesmen dari data triase sesuai mapping; field autofill tetap editable. | US-01; BR-001 |
| **FR-02** | **Pengisian Asesmen (multi-section)** — menyediakan seluruh section input (§14); menghitung otomatis skor turunan (Risiko Jatuh, Skrining Gizi); menggenerasi tabel keseimbangan cairan; validasi field wajib saat simpan. | US-02; BR-004, BR-007, BR-008, BR-010 |
| **FR-03** | **Simpan Bertahap & Update** — simpan asesmen parsial per section tanpa harus lengkap; update selama episode aktif. | US-02; BR-004 |
| **FR-04** | **Riwayat Klinis (referensi)** — menampilkan ringkasan riwayat kunjungan, lab PK, radiologi, PA, dan penunjang lain sebagai referensi read-only selama asesmen. | US-04 |
| **FR-05** | **Hak Akses (RBAC)** — menentukan tab landing, hak edit, dan read-only per role (§9). | US-03; BR-002 |
| **FR-06** | **Read-Only Ringkas** — mode read-only hanya menampilkan field/opsi terisi. | US-03; BR-003 |
| **FR-07** | **Simpan ke EMR** — menyimpan asesmen pada episode kunjungan aktif beserta user & timestamp; dapat diakses kembali via EMR pasien. | US-05; BR-005 |
| **FR-08** | **Riwayat Perubahan Asesmen (Audit Trail)** — mencatat setiap create/update (user, waktu, aktivitas) dan menampilkannya sebagai riwayat; akses sesuai hak. | US-06; BR-006 |
| **FR-09** | **Redesign Layout & Responsivitas** — layout rapi (white space & scrolling minimal), responsif PC & tablet tanpa button terpotong pada resolusi kecil. | US-07; NFR-04, NFR-08 |

## 11. User Stories

> Format "Sebagai … ingin … sehingga …". AC pola Given-When-Then. Kolom **P** = level prioritas (P0 Critical/MVP … P4 Enhancement) per konvensi Tamtech.

| ID | User Story | Acceptance Criteria (Given-When-Then) | P | Trace |
|----|------------|----------------------------------------|---|-------|
| **US-01** | Sebagai **perawat IGD**, saya ingin data hasil triase tampil otomatis pada asesmen, sehingga tidak perlu mengisi data yang sama. | 1) Given form asesmen dibuka & triase sudah terisi, When form dimuat, Then field ter-mapping terisi otomatis (BR-001). 2) Given nilai autofill, When perawat mengubahnya, Then nilai baru tersimpan & tercatat di riwayat (BR-006). 3) Given field tak ada di mapping, Then kosong/menunggu input manual. | P0 | FR-01; BR-001 |
| **US-02** | Sebagai **perawat IGD**, saya ingin mengisi & menyimpan asesmen keperawatan (termasuk bertahap), sehingga kondisi pasien terdokumentasi lengkap sebagai dasar pelayanan IGD. | 1) Given seluruh section tersedia, When perawat mengisi sebagian & menyimpan, Then asesmen tersimpan walau belum lengkap (BR-004). 2) Given asesmen tersimpan, When perawat membuka kembali, Then data dapat diperbarui (BR-004). 3) Given input Risiko Jatuh/Skrining Gizi, Then skor/kesimpulan terhitung otomatis (BR-008). | P0 | FR-02, FR-03; BR-004, BR-008 |
| **US-03** | Sebagai **administrator sistem**, saya ingin tiap pengguna hanya mengakses asesmen sesuai kewenangannya, sehingga data aman. | 1) Given user login, When form dibuka, Then landing = tab sesuai role (BR-002). 2) Given role non-perawat, Then asesmen perawat read-only & tidak dapat diubah (BR-002). 3) Given mode read-only, Then hanya field/opsi terisi yang tampil (BR-003). | P0 | FR-05, FR-06; BR-002, BR-003 |
| **US-04** | Sebagai **perawat IGD**, saya ingin melihat riwayat klinis pasien sebagai referensi selama asesmen, sehingga tidak perlu membuka banyak menu. | 1) Given asesmen terbuka, When perawat membuka panel riwayat, Then tampil riwayat kunjungan, lab, radiologi, PA, penunjang lain (FR-04). 2) Given data referensi, Then bersifat read-only (tidak dapat diedit). | P1 | FR-04 |
| **US-05** | Sebagai **perawat IGD**, saya ingin menyimpan hasil asesmen sebagai bagian rekam medis, sehingga dokumentasi berkesinambungan. | 1) Given klik Simpan & field wajib lengkap, Then asesmen tersimpan pada episode aktif (BR-005, BR-007). 2) Given tersimpan, Then user penyimpan & timestamp tercatat (BR-005). 3) Given tersimpan, Then data tersedia di EMR pasien (FR-07). | P0 | FR-07; BR-005, BR-007 |
| **US-06** | Sebagai **tenaga kesehatan/auditor**, saya ingin melihat riwayat perubahan asesmen, sehingga setiap perubahan dapat ditelusuri. | 1) Given tiap create/update, Then tercatat user, tanggal, waktu, aktivitas (BR-006). 2) Given panel riwayat, Then perubahan tampil terurut. 3) Given hak akses terbatas, Then riwayat hanya tampil sesuai hak (BR-006). | P1 | FR-08; BR-006 |
| **US-07** | Sebagai **perawat IGD**, saya ingin form yang rapi & responsif, sehingga pengisian cepat di PC maupun tablet. | 1) Given form dimuat, Then white space & scrolling minimal dibanding V1 (NFR-04). 2) Given resolusi tablet/kecil, Then tidak ada button terpotong/tertutup (NFR-08). | P2 | FR-09; NFR-04, NFR-08 |

## 12. Data Requirements (Spesifikasi Field)

> Field TTV & data objektif **autofill dari Triase** (dan/atau asesmen perawat bila sudah terisi) sesuai `mapping_field_igd.xlsx`. Field bertanda `*` **wajib**. Section **Nilai Nyeri, Risiko Jatuh, Skrining Gizi** memakai **definisi kanonik asesmen general** — tipe, format, opsi, scoring harus sama dengan modul general (BR-009).

### 12.1 Layar INPUT — Form Asesmen Perawat IGD (FR-02)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keluhan_utama | Keluhan Utama | free text | Tidak | — | Autofill dari triase | Editable (BR-001) |
| riwayat_alergi | Riwayat Alergi | single select (Tidak ada/Ada) | Tidak | Jika "Ada" → sebutkan (multiple input) | Manual | — |
| riwayat_psikospiritual | Riwayat Psikospiritual | single select (Tidak ada/Ada) | Tidak | Jika "Ada" → checkbox: Takut Kematian, Takut Dioperasi, Kecemasan, Putus Asa, Kesurupan, Tahayul/Khurafat | Manual | — |
| riwayat_penyakit_dahulu | Riwayat Penyakit Dahulu | free text | Tidak | Jika ada → sebutkan (multiple input) | Manual | — |
| keadaan_umum | Keadaan Umum | single select (radio/dropdown) | Tidak | Baik / Sedang / Buruk | Manual | Section Objektif |
| td | Tekanan Darah | numerik | Tidak | Sistolik/Diastolik (mmHg) | Autofill triase | Editable |
| rr | RR | numerik | Tidak | x/menit | Autofill triase | Editable |
| nadi | Nadi | numerik | Tidak | x/menit | Autofill triase | Editable |
| suhu | Suhu | numerik | Tidak | °C | Autofill triase | Editable |
| sat_o2 | Saturasi O₂ | numerik | Tidak | % | Autofill triase | Editable |
| tinggi_badan | Tinggi Badan | numerik | Tidak | cm | Autofill triase | Editable |
| berat_badan | Berat Badan | numerik | Tidak | kg | Autofill triase | Editable |
| gds | GDS | numerik | Tidak | mg/dL | Autofill triase | Editable |
| data_objektif_lainnya | Data Objektif Lainnya | free text | Tidak | — | Autofill triase | Editable |
| nilai_nyeri | Nilai Nyeri (PQRST + skala 0–10) | reuse general | Tidak | "Sama dengan general" | Reuse general | Kanonik (BR-009) |
| risiko_jatuh | Asesmen Risiko Jatuh | reuse general (per umur) | Tidak | "Sesuai umur seperti general"; Skor & Kategori auto (§12.2) | Reuse general | Instrumen per umur `[PERLU KONFIRMASI]` |
| skrining_gizi | Skrining Gizi | reuse general | Tidak | "Sama dengan general"; Kesimpulan auto (§12.2) | Reuse general | Kanonik (BR-009) |
| ibadah_wajib | Wajib Ibadah | single select (radio/dropdown) | Tidak | Baligh / Tidak Baligh / Berhalangan | Manual | Kemampuan Ibadah |
| ibadah_bersuci | Bersuci | single select | Tidak | Bersuci Mandiri / Dengan Bantuan / Tayamum | Manual | — |
| ibadah_sholat | Sholat | single select | Tidak | Berdiri / Duduk / Berbaring-Miring / Isyarat | Manual | — |
| psikologis | Psikologis | multiple select (checkbox) | Tidak | Senang, Tenang, Cemas, Sedih, Tegang, Takut, Depresi, Marah, Lain-lain (sebutkan) | Manual | — |
| sosial_ekonomi | Sosial Ekonomi | single select | Tidak | Baik / Cukup / Kurang | Manual | — |
| infeksius_flag | Pasien Infeksius/Immunokompromise? | single select | Tidak | Ya / Tidak | Manual | Jika "Ya" → klasifikasi tampil |
| infeksius_airborne | Airborne | checklist multiple | Tidak | TBC aktif, Campak, MDR-TB, SARS, Aspergilosis, Varicella-Zoster, Lainnya (freetext) | Manual | Muncul jika infeksius = Ya |
| infeksius_droplet | Droplet | checklist multiple | Tidak | ISPA, H1N1, Rubella, Difteri, Pneumonia, Mumps, H5N1, Lainnya (freetext) | Manual | Muncul jika infeksius = Ya |
| infeksius_kontak | Kontak | checklist multiple | Tidak | Hepatitis A, MDRO HIV, Herpes Simpleks, Scabies, Konjungtivitis, Varicella-Zoster, Lainnya (freetext) | Manual | Muncul jika infeksius = Ya |
| diagnosis_keperawatan* | Diagnosis Keperawatan | lookup master (multiple input) | **Ya** | Dari Master Diagnosa Keperawatan | Master data | Wajib (BR-007) |
| rencana_tindakan* | Rencana Tindakan Keperawatan | lookup master (multiple input) | **Ya** | Terhubung ke diagnosis; 1 diagnosis → banyak rencana | Master data | Wajib (BR-007) |
| tindakan_bhd | Bantuan Hidup Dasar | checklist multiple | Tidak | RJP, Gudel, Tracheostomy, Defibrilasi, Lainnya (freetext) | Manual | Tindakan IGD |
| tindakan_invasif | Tindakan Invasif | checklist multiple | Tidak | IV Cath, CVC, Kateterisasi, Heacting, Suction, NGT, Lainnya (freetext) | Manual | — |
| tindakan_bidai | Tindakan Bidai | checklist multiple | Tidak | Sling, Bidai, Gips, Skin Traksi, Lainnya (freetext) | Manual | — |
| px_penunjang | Px Penunjang | checklist multiple | Tidak | EKG, Rontgen, CT Scan, USG, GDS, Laboratorium, Lainnya (freetext) | Manual | — |
| cairan_waktu | Waktu Pencatatan | jam (HH:MM) | Tidak | Default = waktu buka asesmen | Default now | Keseimbangan Cairan |
| cairan_masuk_oral | Pemasukan — Oral | numerik (cc) | Tidak | — | Manual | — |
| cairan_masuk_iv | Pemasukan — Cairan IV (Infus/Elektrolit/Lainnya freetext) | numerik (cc) | Tidak | — | Manual | — |
| cairan_keluar_urine | Pengeluaran — Urine | numerik (cc) | Tidak | — | Manual | — |
| cairan_keluar_bab | Pengeluaran — BAB | numerik (cc) | Tidak | — | Manual | — |
| cairan_keluar_aspirasi | Pengeluaran — Aspirasi | numerik (cc) | Tidak | — | Manual | — |
| cairan_keluar_muntah | Pengeluaran — Muntah | numerik (cc) | Tidak | — | Manual | — |
| cairan_tambah | Tambahkan ke tabel | button | — | Menambahkan entri ke tabel keseimbangan cairan | — | Trigger generate (§12.2) |
| penunjang_jenis | Hasil Penunjang — Jenis Pemeriksaan | dropdown | Tidak | USG, EKG, CTG, CT Scan, Echocardiography, EEG, MRI, Spirometry, Endoscopy, Colonoscopy, Fluoroscopy, Biopsi, Lab/Radiologi luar RS, USG Urologi, Uroflowmetri, ESWL, Audiometri, Treadmill, dll. | Manual | — |
| penunjang_hasil | Hasil Pemeriksaan | upload file | Tidak | Format file `[PERLU KONFIRMASI]` | Upload | mis. EKG |
| penunjang_keterangan | Keterangan | free text | Tidak | — | Manual | — |

### 12.2 Data TER-GENERATE saat Simpan / Interaksi (FR-02)

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| risiko_jatuh_skor | Skor Risiko Jatuh | numerik | Dihitung otomatis dari input Risiko Jatuh | Read-only (BR-008) |
| risiko_jatuh_kategori | Kategori Risiko Jatuh | enum | Diturunkan dari skor | Read-only (BR-008) |
| skrining_gizi_kesimpulan | Kesimpulan Skrining Gizi (status malnutrisi) | enum | Dihitung otomatis dari input Skrining Gizi | Read-only (BR-008) |
| tabel_cairan | Tabel Keseimbangan Cairan | tabel read-only | Digenerasi dari input (Jam, Pemasukan, Jumlah Pemasukan, Pengeluaran, Jumlah Pengeluaran) | Jumlah dihitung otomatis (BR-010) |
| created_by / updated_by | User Penyimpan/Pengubah | lookup staf | Dari sesi login | Audit (BR-005) |
| created_at / updated_at | Timestamp | datetime | DD-MM-YYYY HH:MM | Audit (BR-005) |
| audit_entry | Entri Riwayat Perubahan | record | user + waktu + aktivitas (create/update) | Audit trail (BR-006) |

### 12.3 Tampilan Read-Only (FR-06)
Mode read-only menampilkan **hanya field/opsi terisi** (bukan seluruh opsi), disusun ringkas per section untuk memudahkan pembacaan role lain (BR-003).

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-01** | Performa | Buka & simpan/update form ≤ 1 detik. | Metrik #1 |
| **NFR-02** | Skalabilitas | Andal untuk beban operasional IGD (± 100–150 pasien/hari; target puncak pengisian disepakati). `[PERLU KONFIRMASI]` | Feature Overview |
| **NFR-03** | Ergonomi UI | Buka-tutup asesmen di device yang sama tidak memberatkan device (caching/persistence efisien). | Feature Overview |
| **NFR-04** | Usability | White space & scrolling minimal dibanding V1 (target kuantitatif disepakati). `[PERLU KONFIRMASI]` | FR-09 |
| **NFR-05** | Keamanan/RBAC | Akses & perubahan asesmen tunduk role/privilege (Master Staf/RBAC). | Metrik #5; BR-002 |
| **NFR-06** | Auditabilitas | 100% perubahan tercatat pada riwayat (tidak ada yang hilang); mendukung akreditasi KARS. | Metrik #6; BR-006 |
| **NFR-07** | Reliabilitas | Data hasil autofill & simpan bertahap tidak hilang saat form dibuka-tutup ulang. | FR-01, FR-03 |
| **NFR-08** | Responsivitas | Layout responsif PC & tablet; tidak ada button terpotong/tertutup pada resolusi kecil. | FR-09 |

## 14. Integrasi Eksternal & Dependency

| Integrasi/Modul | Fungsi di modul ini | Tipe | Dampak Jika Belum Siap |
|-----------------|---------------------|------|------------------------|
| **Triase / Re-triase IGD** | Sumber autofill (keluhan utama, TTV, data objektif) | **Hard** | Autofill nonaktif → entri berulang seperti V1. |
| **EMR Pasien** | Persist asesmen + sumber riwayat klinis | **Hard** | Asesmen tak tersimpan; riwayat klinis tak tampil. |
| **Master Diagnosa & Rencana Tindakan Keperawatan** | Lookup Diagnosis & Rencana Tindakan | **Hard** | Field wajib (BR-007) tak dapat diisi. |
| **Master Staf / RBAC** | Role, privilege, landing tab, read-only | **Hard** | Kontrol akses & read-only ringkas tak aktif. |
| **Integrasi SATUSEHAT FHIR R4** | Pertukaran data klinis terstruktur | Soft | Data lokal tetap jalan; interoperabilitas tertunda. Mapping resource FHIR belum didefinisikan (§15). |
| **Dashboard Pelayanan IGD** | Konsumen status pengisian (event) | Soft | Status checkpoint asesmen perawat tak terlihat di dashboard. |

## 15. Asumsi
- [ASUMSI] Field wajib minimal = Diagnosis Keperawatan & Rencana Tindakan Keperawatan (bertanda `*` di mapping). Field lain bersifat opsional kecuali dinyatakan lain oleh tim klinis (BR-007). Dasar: penanda `*` pada `mapping_field_igd.xlsx`.
- [ASUMSI] "Sama dengan general" pada mapping berarti **reuse penuh** definisi kanonik asesmen general (Nilai Nyeri, Risiko Jatuh, Skrining Gizi) — tipe, opsi, dan scoring identik, tidak didefinisikan ulang di sini (BR-009).
- [ASUMSI] Simpan bertahap tidak memerlukan status "draft" khusus; asesmen tersimpan langsung sebagai bagian episode aktif dan dapat diperbarui (BR-004). Dasar: To-Be PRD v1.0 ("menyimpan asesmen secara bertahap").
- [ASUMSI] Daftar aksi lanjutan (Triase, CPO, Buat Resep, Pilih Penunjang, Buat Surat, Input Tindakan, EMR) berasal dari Feature Overview, bukan sumber PRD v1.0 — dimasukkan sebagai konteks, bukan requirement final (Skenario 5).
- [ASUMSI] Riwayat perubahan mengikuti pola dua-tab (Formulir + Riwayat) yang lazim pada modul asesmen Neurovi lain. Detail UI diserahkan ke desain.

## 16. Pertanyaan Terbuka
- 

## 17. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 | 07 Juli 2026 | Team Product | Draft awal PRD Asesmen Perawat IGD (Overview, Background, Scope, Goals/Metrics, Business Process, User Story). |
| 2.0 | 08 Juli 2026 | Team Product | Konversi ke format generator Neurovi v2: metadata, In/Out Scope, Goals & Metrics terukur, Business Process As-Is/To-Be + tabel perbedaan, Main Flow (dari BPMN), RBAC/Display Rules, BR-001..011, FR-01..09, US-01..07 (Given-When-Then + prioritas), Data Requirements dari `mapping_field_igd.xlsx` (INPUT + generated + read-only), NFR, Integrasi/Dependency, Asumsi & Pertanyaan Terbuka. |

---
> **Catatan Penutup:** Dokumen berstatus Draft hasil konversi ke format generator. Substansi mengikuti sumber PRD v1.0, mapping field, dan BPMN — tanpa menambah requirement yang tidak bersumber (bagian tak pasti ditandai `[PERLU KONFIRMASI]`). Setelah Pertanyaan Terbuka (§16) terjawab — terutama referensi V1, mapping triase final, dan mapping SATUSEHAT — status dapat dinaikkan menjadi Approved untuk implementasi Tim Pradev.
