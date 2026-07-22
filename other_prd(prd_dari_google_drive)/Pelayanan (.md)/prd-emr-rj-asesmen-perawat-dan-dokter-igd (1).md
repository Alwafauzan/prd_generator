# PRD — EMR RJ: Asesmen Perawat dan Dokter IGD

**Related Document:** Mapping Field Asesmen (mapping field igd.xlsx); Mapping Asesmen Rawat Jalan; PRD Asesmen Dokter IGD; PRD Asesmen Perawat IGD; [D11] Triase; [D14] CPPT IGD; [D13] Observasi IGD; [D33] Konsultasi DPJP
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

**Modul**: EMR RJ — Asesmen Perawat dan Dokter IGD (kode fitur **D12**, cluster **EMR**).

Asesmen Perawat dan Dokter IGD merupakan modul dokumentasi klinis yang digunakan oleh **perawat IGD** dan **dokter IGD** untuk mendokumentasikan hasil pengkajian pasien selama pelayanan di Instalasi Gawat Darurat (IGD) secara terstruktur dan terintegrasi sebagai bagian dari **Electronic Medical Record (EMR)**.

Modul terdiri dari dua form asesmen yang saling melengkapi namun dapat diisi secara **independen** sesuai karakteristik pelayanan IGD yang dinamis:
- **Asesmen Keperawatan IGD** — data subjektif, data objektif, skrining klinis (nyeri, risiko jatuh, gizi, kemampuan ibadah, pasien infeksius), tindakan keperawatan, keseimbangan cairan, dan hasil penunjang.
- **Asesmen Medis Dokter IGD** — anamnesis (SOAP), pemeriksaan fisik, GCS, diagnosis, dan rencana penatalaksanaan.

Karakteristik utama modul:
- **Progressive documentation** — pengisian bertahap sesuai perkembangan kondisi pasien selama di IGD.
- **Autofill** dari data **triase** (untuk perawat & dokter) dan dari **asesmen perawat** (untuk dokter) sesuai *business rule* dan *data mapping*, tetap dapat diperbarui sebelum disimpan.
- **Role-Based Access Control (RBAC)** — tab sesuai role login dapat diedit; asesmen role lain *read-only*.
- **Riwayat klinis** pasien sebagai referensi (kunjungan, Lab PK, radiologi, patologi anatomi, penunjang lain).
- **Audit trail** — pencatatan riwayat perubahan (pengguna, waktu, aktivitas).

> Modul ini **belum memiliki BPMN khusus**. Alur diturunkan dari analogi BPMN `g-emr-emergency`, `g-emr-inpatient`, `g-emr-patient-identity`, dan `g-emr-screening` — bagian turunan ditandai `[ASUMSI]`.

## 2. Background

Asesmen IGD adalah salah satu proses inti pelayanan gawat darurat yang menjadi dasar bagi perawat dalam menentukan masalah keperawatan dan tindakan, serta bagi dokter dalam menetapkan diagnosis dan rencana penatalaksanaan.

**Berbeda dengan alur rawat jalan**, asesmen di IGD bersifat **dinamis**: dokter dan perawat dapat mengisi asesmen secara **independen** tanpa terikat urutan pengisian, karena pelayanan menuntut kecepatan.

**Masalah pada kondisi saat ini (As-Is)** — dirangkum dari lampiran PRD Asesmen Perawat IGD & Dokter IGD:
- Pemanfaatan data hasil **triase** dan **asesmen perawat** belum optimal → **pengisian data berulang** (TTV, keluhan, alergi diinput ulang).
- Tampilan form belum optimal dan kurang responsif pada berbagai resolusi layar.
- Belum tersedia **riwayat perubahan asesmen** (audit trail) → akuntabilitas dokumentasi lemah.
- Tampilan *read-only* masih menampilkan seluruh opsi isian (tidak ringkas).
- Referensi klinis pasien tersebar di beberapa menu → dokter/perawat harus berpindah menu.

**Kenapa modul ini perlu dikembangkan**: meningkatkan efisiensi dokumentasi klinis IGD melalui autofill lintas-proses, penyempurnaan tata letak & responsivitas form, tampilan *read-only* ringkas, serta audit trail — tanpa mengurangi integritas rekam medis. Untuk RS Tipe C & D dengan SDM terbatas dan volume IGD tinggi, efisiensi pengisian dan konsistensi data sangat kritikal.

[ASUMSI] Karakteristik IGD RS Tipe C & D: jumlah bed observasi terbatas, dokter jaga & perawat merangkap beberapa peran, koneksi internet dapat tidak stabil sehingga penyimpanan bertahap (draft lokal) menjadi penting.

## 3. In Scope

### Scope Definition (Phase 1 — Must Have / MVP)

Modul dibagi bertahap. Pengerjaan saat ini fokus **Phase 1 (MVP)**; Phase 2 menyusul setelah MVP stabil & tervalidasi di lapangan.

| Fitur | Sub-Fitur | Perilaku + Rasional |
|-------|-----------|---------------------|
| Asesmen Perawat IGD | Autofill Data Triase | Data tertentu dari triase [D11] di-autofill ke form asesmen perawat sesuai *business rule*; tetap dapat diperbarui. Rasional: kurangi input berulang, jaga konsistensi. |
| Asesmen Perawat IGD | Pengisian Asesmen | Perawat mengisi/memperbarui: data subjektif, data objektif, masalah & tindakan keperawatan, tindakan IGD, keseimbangan cairan, hasil penunjang. |
| Asesmen Dokter IGD | Autofill Triase + Asesmen Perawat | Data dari triase & asesmen perawat (jika sudah diisi) di-autofill ke form dokter sesuai *business rule* & *mapping*; tetap dapat diperbarui. |
| Asesmen Dokter IGD | Pengisian Asesmen (SOAP) | Dokter mengisi anamnesis, pemeriksaan fisik, GCS, diagnosis, rencana penatalaksanaan. |
| Keduanya | Hak Akses (RBAC) | Tab sesuai role login dapat diedit; asesmen role lain *read-only*. |
| Keduanya | Riwayat Klinis | Menampilkan riwayat kunjungan, Lab PK, radiologi, patologi anatomi, penunjang lain sebagai referensi. |
| Keduanya | Simpan Asesmen | Simpan sebagai bagian EMR sesuai episode kunjungan + info pengguna & waktu tiap simpan/update. |
| Keduanya | Riwayat Perubahan (Audit Trail) | Catat setiap simpan/perubahan (pengguna, waktu, aktivitas) & tampilkan sebagai audit trail. |
| Keduanya | Read-only ringkas & Responsivitas | Tampilan *read-only* hanya menampilkan isian terisi; layout & responsivitas dioptimalkan. |

### Out Scope

| No | Scope | Keterangan |
|----|-------|-----------|
| 1 | Form Konsulan / Konsultasi DPJP | Dikelola modul [D33] Konsultasi DPJP. |
| 2 | Observasi IGD | Dikelola modul [D13] Observasi IGD. |
| 3 | CPPT IGD | Dikelola modul [D14] CPPT IGD. |
| 4 | Proses Triase & Re-triase | Dikelola modul [D11] Triase & [D32] Re-triase (modul ini hanya **konsumen** data triase via autofill). |
| 5 | Registrasi/Pendaftaran IGD | Dikelola modul Admisi/Pendaftaran (sumber `kunjungan_id`, `no_rm`). |
| 6 | Order penunjang (Lab/Radiologi) & hasilnya | Modul ini menampilkan hasil sebagai referensi, tidak membuat order. [ASUMSI] |
| 7 | Skrining TB/Stunting/COVID | Dikelola modul [D9] Screening pasien. |

## 4. Goals and Metrics

### Goals
1. Mempercepat proses pengisian asesmen keperawatan & medis di IGD.
2. Mengurangi pengisian data berulang melalui autofill hasil triase & asesmen perawat sesuai *business rule*.
3. Mendukung dokumentasi yang **fleksibel & berkesinambungan** (progressive documentation) sesuai perkembangan kondisi pasien.
4. Memudahkan akses informasi klinis pasien sebagai referensi selama asesmen.
5. Menjamin keamanan akses asesmen melalui RBAC.
6. Mendukung akuntabilitas dokumentasi melalui audit trail.

### Metrics & Success Criteria

| No | Metrik | Target | Cara Ukur |
|----|--------|--------|-----------|
| M1 | Rata-rata waktu pengisian asesmen perawat IGD | Turun ≥ 30% vs baseline | [PERLU KONFIRMASI baseline] timestamp buka form → simpan pertama |
| M2 | Field ter-autofill dari triase/asesmen perawat yang tidak diedit ulang | ≥ 70% field autofill dipertahankan | Bandingkan nilai autofill vs nilai tersimpan |
| M3 | Kelengkapan field wajib asesmen sebelum pasien pindah/pulang | ≥ 95% | Validasi mandatory saat simpan final |
| M4 | Cakupan audit trail | 100% simpan/perubahan tercatat (user, waktu, aktivitas) | Audit log vs jumlah transaksi simpan |
| M5 | Pelanggaran akses (edit asesmen di luar kewenangan role) | 0 kasus | Log RBAC deny |
| M6 | Kepuasan pengguna (perawat & dokter IGD) atas responsivitas form | Skor ≥ 4/5 | Survei pasca-implementasi |

[ASUMSI] Target angka bersifat usulan; perlu disepakati dengan manajemen RS & tim klinis.

## 5. Related Feature

Fitur terkait dari List Fitur (sheet MVP), cluster **EMR**:

| Code | Menu | Relasi dengan D12 |
|------|------|-------------------|
| **D12** | EMR RJ > Asesmen perawat dan dokter IGD | **Modul ini** |
| D11 | EMR RJ > Triase | **Sumber autofill** (keluhan, TTV, dll.) |
| D7 | EMR > IGD > EMR IGD > List Dokumen EMR | Kontainer dokumen EMR IGD tempat asesmen tampil |
| D13 | EMR RJ > Observasi IGD | Lanjutan pelayanan (Out Scope D12) |
| D14 | EMR RJ > CPPT IGD | Asesmen jadi sumber autofill CPPT (analogi `g-emr-inpatient`) |
| D32 | EMR RJ > Re-triase | Dapat memicu pembaruan asesmen |
| D33 | EMR RJ > Konsultasi DPJP | Konsul dari asesmen dokter (Out Scope D12) |
| D4 | Data Pasien > Data Alergi | Riwayat alergi sebagai referensi/autofill |
| D5 | Data Pasien > Ringkasan Kesehatan Pasien | Riwayat klinis referensi |
| D9 | IGD & RJ > Screening pasien (TB, dll.) | Skrining terpisah, direferensikan |
| D10 | Dokumen pendukung | Upload hasil penunjang / file pendukung |
| D16 | EMR RJ > Asesmen Keperawatan Kritis | Eskalasi bila pasien kritis |
| D20 | EMR RJ > Lembar Nilai Kritis | Notifikasi nilai kritis penunjang |

Relasi lintas cluster: master **Unit** (A3), master **Staff** (A1/A2) & **Jabatan** (A55) sebagai sumber identitas pengisi; **RBAC/Role** (A53); registri **Menu** (A37).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Kondisi Saat Ini)

1. Pasien tiba di IGD → registrasi IGD & **triase** [D11] mencatat keluhan awal + TTV.
2. Perawat membuka form Asesmen Keperawatan IGD dan **mengetik ulang** keluhan, TTV, dan data lain yang sudah ada di triase. [ASUMSI dari lampiran PRD Perawat IGD]
3. Dokter membuka form Asesmen Medis dan **mengetik ulang** anamnesis, TTV, keluhan yang sebenarnya sudah tersedia dari triase/asesmen perawat.
4. Form menampilkan seluruh opsi isian bahkan dalam mode lihat → sulit dibaca, tidak responsif di layar kecil.
5. Tidak ada catatan siapa mengubah apa & kapan → sulit audit.
6. Untuk referensi klinis (Lab, radiologi), petugas berpindah menu.

> Konsekuensi: dokumentasi lambat, data tidak konsisten antar-proses, akuntabilitas rendah.

### B. To-Be (Kondisi Diharapkan)

Diturunkan dari analogi `g-emr-emergency` (buka form Asesmen Keperawatan IGD, validasi mandatory, catat audit log) & `g-emr-inpatient` (autofill dari asesmen dokter/perawat RJ/IGD, simpan & update data):

1. Sistem membuka akses EMR berdasarkan **`no_rm`** + **`kunjungan_id`** (kunjungan IGD aktif) dan menerapkan **RBAC** → menampilkan tab sesuai role login. `[trace: g-emr-emergency "Buka akses EMR berdasarkan RM dan kunjungan IGD"]`
2. Saat form asesmen perawat dibuka, sistem **autofill** field dari **triase** [D11] sesuai *business rule* (keluhan utama, TTV, dsb.); perawat melengkapi/mengubah lalu simpan. `[trace: g-emr-inpatient "...autofill dari asesmen dokter RJ/IGD"]`
3. Saat form asesmen dokter dibuka, sistem **autofill** dari **triase** dan **asesmen perawat** (jika sudah diisi) sesuai *mapping* → dokter melengkapi SOAP, GCS, diagnosis, rencana.
4. Perawat & dokter dapat mengisi **independen** (tanpa urutan) & **bertahap** (progressive). Draft dapat disimpan berkala.
5. Sistem memvalidasi **mandatory field** sebelum simpan final; menampilkan error pada field wajib yang belum lengkap. `[trace: g-emr-emergency "Tampilkan error pada field wajib yang belum lengkap"]`
6. Setiap simpan/perubahan → sistem **catat audit log** (user, timestamp, aktivitas) & tampilkan **riwayat perubahan**. `[trace: g-emr-emergency "Catat audit log"]`
7. Panel **Riwayat Klinis** menampilkan kunjungan, Lab PK, radiologi, patologi anatomi, penunjang lain dalam satu layar. `[trace: g-emr-patient-identity "Sediakan hasil penunjang... Tampilkan riwayat klinis"]`
8. Mode **read-only** hanya menampilkan isian yang terisi (ringkas) untuk role yang tidak berwenang.
9. Asesmen tersimpan sebagai bagian EMR episode kunjungan → menjadi sumber autofill untuk **CPPT IGD** [D14] & Observasi [D13].

## 7. Main Flow / Mindmap

### Aktor
- **Perawat IGD** — mengisi asesmen keperawatan.
- **Dokter IGD (DPJP)** — mengisi asesmen medis.
- **Sistem EMR / HIS** — autofill, validasi, RBAC, audit log, simpan.

### Skenario A — Asesmen Perawat IGD
1. **[Start]** Pasien IGD aktif (sudah triase). Perawat memilih pasien dari dashboard IGD.
2. Sistem membuka EMR berdasarkan `no_rm` + `kunjungan_id`, cek RBAC → tampilkan tab **Asesmen Keperawatan IGD** (editable).
3. Sistem **autofill** dari triase: keluhan utama, TTV (TD, RR, Nadi, Suhu, SpO2, TB, BB, GDS), data objektif lainnya.
4. Perawat mengisi: data subjektif (riwayat alergi, psikospiritual, riwayat penyakit dahulu), data objektif (keadaan umum, TTV konfirmasi), asesmen nyeri, risiko jatuh, skrining gizi, kemampuan ibadah, pasien infeksius/immunokompromise, masalah & tindakan keperawatan, tindakan IGD, keseimbangan cairan, hasil penunjang.
5. **[Gateway] Data wajib lengkap?**
   - **Tidak** → tampilkan error field wajib → kembali ke langkah 4.
   - **Ya** → lanjut.
6. Perawat klik **Simpan**. Sistem simpan ke EMR episode + catat audit log (user, waktu, aktivitas).
7. **[End]** Asesmen keperawatan tersimpan; tersedia sebagai referensi/autofill bagi dokter & CPPT.

### Skenario B — Asesmen Dokter IGD
1. **[Start]** Dokter memilih pasien IGD dari dashboard.
2. Sistem membuka EMR + cek RBAC → tampilkan tab **Asesmen Medis IGD** (editable); tab lain read-only.
3. **[Gateway] Asesmen perawat sudah diisi?**
   - **Ya** → autofill anamnesis & TTV dari **triase ATAU asesmen perawat** (sesuai *mapping* — nilai terisi terakhir/prioritas asesmen perawat). [ASUMSI prioritas]
   - **Tidak** → autofill dari **triase** saja.
4. Dokter mengisi: Subjektif (keluhan, anamnesis, riwayat alergi), Objektif (jenis kasus, GCS Eye/Motor/Verbal → kesimpulan otomatis, TTV, pemeriksaan fisik per regio), Assessment (diagnosis), Plan (rencana penatalaksanaan).
5. **[Gateway] Data wajib lengkap?** → error jika belum → lengkapi.
6. Dokter klik **Simpan** → simpan ke EMR + audit log.
7. **[End]** Asesmen medis tersimpan; dapat memicu order, CPPT [D14], konsul DPJP [D33], atau keputusan disposisi (rawat inap/rujuk/pulang — di luar scope D12).

### Skenario C — Read-only / Lihat oleh role lain
1. Role tanpa kewenangan edit membuka asesmen → sistem tampilkan mode **read-only ringkas** (hanya isian terisi) + audit trail.

> [ASUMSI] Skenario diturunkan dari BPMN `g-emr-emergency`/`g-emr-inpatient`; belum ada BPMN khusus D12 → perlu validasi tim klinis IGD.

## 8. Business Rules

| ID | Business Rule | Sumber/Trace |
|----|---------------|--------------|
| **BR-001** | Asesmen hanya dapat dibuka untuk pasien dengan **kunjungan IGD aktif** (`kunjungan_id` valid + `no_rm` cocok). | g-emr-emergency "Buka akses EMR berdasarkan RM dan kunjungan IGD" |
| **BR-002** | **RBAC**: hanya role sesuai kewenangan yang dapat *tambah/ubah/simpan* tab asesmennya; role lain **read-only**. Perawat tidak dapat mengubah asesmen medis dokter & sebaliknya. | Lampiran PRD (Hak Akses RBAC) |
| **BR-003** | Perawat & dokter dapat mengisi asesmen **independen** tanpa urutan (asesmen dokter tidak wajib menunggu asesmen perawat). | Lampiran PRD Background |
| **BR-004** | **Autofill perawat**: field yang di-mapping dari triase [D11] terisi otomatis saat form dibuka, **tetap editable** sebelum simpan. | Lampiran PRD (Autofill Data Triase) |
| **BR-005** | **Autofill dokter**: field di-mapping dari **triase** DAN **asesmen perawat (bila sudah diisi)**. Bila asesmen perawat sudah ada, nilai asesmen perawat diprioritaskan sebagai sumber autofill; bila belum, dari triase. Semua tetap editable. | mapping field igd.xlsx ("autofill dari triase atau asesmen perawat (jika sudah diisi terlebih dahulu)") |
| **BR-006** | **GCS**: Kesimpulan kesadaran dihitung otomatis dari total Eye+Motor+Verbal: 15–14 Compos Mentis; 13–12 Apatis; 11–10 Delirium; 9–7 Somnolence; 6–4 Stupor; ≤3 Coma. Tidak dapat diisi manual. | mapping field igd.xlsx |
| **BR-007** | Field kondisional: jika **Riwayat Alergi = Ada** → wajib isi detail alergi (multiple input). Jika **Riwayat Psikospiritual = Ada** → wajib pilih ≥1 checkbox. | mapping field igd.xlsx |
| **BR-008** | **Validasi mandatory** dijalankan saat **simpan final**; field wajib belum lengkap → tampilkan error, blok simpan final (draft tetap boleh disimpan). | g-emr-emergency "Validasi mandatory field" / "Tampilkan error..." |
| **BR-009** | Setiap **simpan/perubahan** wajib tercatat di **audit trail** (`user_id`, timestamp, aktivitas create/update, ringkasan field berubah). Tidak dapat dihapus. | g-emr-emergency "Catat audit log" |
| **BR-010** | Asesmen tersimpan **terikat episode kunjungan** (`kunjungan_id`); tidak dapat dipindah antar kunjungan. | Lampiran PRD (Simpan Asesmen) |
| **BR-011** | Nilai TTV di luar rentang fisiologis wajar memicu **peringatan (warning)**, tidak memblok simpan (nilai ekstrem valid di IGD). [ASUMSI] | Turunan konteks IGD |
| **BR-012** | Skrining nyeri, risiko jatuh, dan gizi mengikuti instrumen sesuai **kelompok umur** pasien (dewasa/anak). | mapping field igd.xlsx ("Sesuai dengan umur seperti general") |
| **BR-013** | Mode **read-only** hanya menampilkan field yang **terisi** (isian kosong disembunyikan) agar ringkas. | Lampiran PRD Perawat IGD (Background) |
| **BR-014** | Asesmen yang sudah disimpan menjadi sumber **autofill CPPT IGD** [D14] & referensi Observasi [D13]. | Analogi g-emr-inpatient |

## 9. User Stories

| ID | User Story | Trace BPMN/Sumber |
|----|-----------|-------------------|
| **US-001** | Sebagai **Perawat IGD**, saya ingin data keluhan & TTV dari triase ter-autofill ke form asesmen keperawatan, agar tidak mengetik ulang dan dokumentasi lebih cepat. | g-emr-inpatient (autofill) |
| **US-002** | Sebagai **Perawat IGD**, saya ingin mengisi asesmen keperawatan (subjektif, objektif, skrining, tindakan, cairan, penunjang) secara bertahap, agar dapat mengikuti perkembangan kondisi pasien. | Lampiran PRD Perawat |
| **US-003** | Sebagai **Dokter IGD**, saya ingin data dari triase & asesmen perawat ter-autofill ke asesmen medis, agar saya cukup melengkapi tanpa input berulang. | mapping field igd.xlsx |
| **US-004** | Sebagai **Dokter IGD**, saya ingin GCS dihitung & disimpulkan otomatis, agar penilaian kesadaran akurat & konsisten. | mapping field igd.xlsx |
| **US-005** | Sebagai **Dokter IGD**, saya ingin mengisi SOAP (anamnesis, pemeriksaan fisik, diagnosis, rencana), agar keputusan klinis terdokumentasi lengkap. | Lampiran PRD Dokter |
| **US-006** | Sebagai **tenaga kesehatan**, saya ingin hanya bisa mengubah asesmen sesuai kewenangan role saya, agar keamanan & integritas data terjaga. | RBAC (lampiran) |
| **US-007** | Sebagai **Dokter/Perawat IGD**, saya ingin melihat riwayat klinis (kunjungan, Lab PK, radiologi, PA, penunjang lain) dalam satu layar, agar tidak berpindah menu. | g-emr-patient-identity |
| **US-008** | Sebagai **tenaga kesehatan**, saya ingin sistem memvalidasi field wajib sebelum simpan final, agar dokumentasi tidak tertinggal tidak lengkap. | g-emr-emergency (validasi) |
| **US-009** | Sebagai **Kepala IGD / auditor**, saya ingin melihat riwayat perubahan asesmen (siapa, kapan, apa), agar akuntabilitas & penelusuran terjaga. | g-emr-emergency (audit log) |
| **US-010** | Sebagai **tenaga kesehatan**, saya ingin melihat asesmen role lain dalam mode read-only ringkas, agar cepat memahami kondisi pasien tanpa mengubah data. | RBAC / read-only |
| **US-011** | Sebagai **Perawat IGD**, saya ingin menyimpan draft asesmen berkala meski belum lengkap, agar data aman saat koneksi tidak stabil. [ASUMSI RS Tipe C&D] | Konteks infrastruktur |
| **US-012** | Sebagai **tenaga kesehatan**, saya ingin form responsif di berbagai ukuran layar, agar efisien digunakan di area IGD. | Lampiran PRD (responsivitas) |

## 10. Functional Requirements

| ID | Functional Requirement | Prioritas | Trace |
|----|------------------------|-----------|-------|
| **FR-001** | Sistem membuka form asesmen berdasarkan `no_rm` + `kunjungan_id` (kunjungan IGD aktif) dan menerapkan RBAC untuk menentukan tab editable/read-only. | Must | BR-001, BR-002 |
| **FR-002** | Sistem menampilkan **tab Asesmen Keperawatan IGD** dengan section: Subjektif, Objektif, Asesmen Nyeri, Risiko Jatuh, Skrining Gizi, Kemampuan Ibadah, Pasien Infeksius, Masalah & Tindakan Keperawatan, Tindakan IGD, Keseimbangan Cairan, Hasil Penunjang. | Must | US-002 |
| **FR-003** | Sistem menampilkan **tab Asesmen Medis Dokter IGD** dengan section: Subjektif (keluhan, anamnesis, alergi), Objektif (jenis kasus, GCS, TTV, pemeriksaan fisik), Assessment (diagnosis), Plan (penatalaksanaan). | Must | US-005 |
| **FR-004** | Sistem meng-**autofill** field asesmen perawat dari triase [D11] sesuai *mapping*; nilai editable sebelum simpan. | Must | BR-004 |
| **FR-005** | Sistem meng-**autofill** field asesmen dokter dari triase & asesmen perawat (prioritas asesmen perawat bila ada); nilai editable. | Must | BR-005 |
| **FR-006** | Sistem menghitung **GCS** otomatis (Eye+Motor+Verbal) & menetapkan kesimpulan kesadaran; field kesimpulan read-only. | Must | BR-006 |
| **FR-007** | Sistem menampilkan/menyembunyikan **field kondisional** (mis. detail alergi hanya jika "Ada"). | Must | BR-007 |
| **FR-008** | Sistem memvalidasi **mandatory field** saat simpan final & menampilkan error inline pada field wajib kosong. | Must | BR-008 |
| **FR-009** | Sistem menyimpan asesmen ke EMR episode kunjungan beserta `user_id` & timestamp; mendukung **simpan draft** & **simpan final**. | Must | BR-010, US-011 |
| **FR-010** | Sistem mencatat **audit trail** setiap simpan/perubahan (user, waktu, aktivitas, ringkasan field berubah) & menampilkannya. | Must | BR-009, US-009 |
| **FR-011** | Sistem menampilkan panel **Riwayat Klinis** (kunjungan, Lab PK, radiologi, patologi anatomi, penunjang lain) sebagai referensi read-only. | Must | US-007 |
| **FR-012** | Sistem menampilkan asesmen dalam mode **read-only ringkas** (hanya isian terisi) untuk role tanpa kewenangan edit. | Must | BR-013, US-010 |
| **FR-013** | Sistem memberi **warning** (non-blocking) pada nilai TTV di luar rentang wajar. | Should | BR-011 |
| **FR-014** | Form **responsif** pada resolusi desktop/tablet area IGD. | Should | US-012 |
| **FR-015** | Sistem menyediakan skrining sesuai **kelompok umur** (dewasa/anak) untuk nyeri, risiko jatuh, gizi. | Must | BR-012 |
| **FR-016** | Sistem menampilkan **status kelengkapan** asesmen (draft/final) pada dashboard IGD & header form. [ASUMSI] | Should | US-008 |

## 11. Data Requirements (Spesifikasi Field)

> Field kanonik (`no_rm`, `kunjungan_id`, `nama`, `nip`, `jabatan`, `unit`, `user_id`) mengikuti **Konteks PRD terkait** — nama/tipe/format SAMA, tidak dibuat definisi tandingan.

### 11.1 Layar INPUT — Header / Konteks Pasien (auto, read-only di form asesmen)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_rm | No. RM | text | Ya | format RM RS | lookup (konteks) | field kanonik |
| kunjungan_id | No. Kunjungan IGD | lookup | Ya | kunjungan IGD aktif | auto (konteks) | field kanonik; BR-001 |
| nama | Nama Pasien | text | Ya | maks 100 char | autofill pendaftaran | field kanonik |
| unit | Unit/Poli (IGD) | dropdown(lookup) | Ya | dari master Unit (A3) | lookup A3 | field kanonik |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | L / P | autofill pendaftaran | konsisten entitas pasien |
| tgl_lahir | Tanggal Lahir | date | Ya | ≤ hari ini | autofill pendaftaran | dasar kelompok umur (BR-012) |
| pengisi_user_id | Pengisi (User) | lookup | Ya | dari A1 User | `user_id` login | audit; FR-010 |
| pengisi_nama | Nama Pengisi | text | Ya | maks 100 char | autofill Staff | field kanonik `nama` |
| pengisi_jabatan | Jabatan Pengisi | dropdown | Ya | master Jabatan (A55) | autofill Staff | field kanonik `jabatan` |

### 11.2 Layar INPUT — Asesmen Keperawatan IGD (FR-002)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keluhan_utama | Keluhan Utama | text (free) | Ya | maks 500 char | autofill triase | BR-004 |
| riwayat_alergi | Riwayat Alergi | dropdown | Ya | Tidak ada / Ada | manual (ref D4) | jika Ada → wajib detail (BR-007) |
| detail_alergi | Detail Alergi | multi-input text | Kondisional | wajib bila riwayat_alergi=Ada | manual | BR-007 |
| riwayat_psikospiritual | Riwayat Psikospiritual | dropdown | Ya | Tidak ada / Ada | manual | jika Ada → checkbox wajib |
| psikospiritual_detail | Detail Psikospiritual | checkbox (multi) | Kondisional | Takut Kematian/Dioperasi/Kecemasan/Putus Asa/Kesurupan/Tahayul-Khuforat | manual | BR-007 |
| riwayat_penyakit_dahulu | Riwayat Penyakit Dahulu | multi-input text | Tidak | maks 500 char | manual | |
| keadaan_umum | Keadaan Umum | radiobutton | Ya | Baik/Sedang/Buruk | manual | |
| td_sistolik | TD Sistolik | number | Ya | mmHg, 0–300 | autofill triase | BR-011 warning |
| td_diastolik | TD Diastolik | number | Ya | mmHg, 0–200 | autofill triase | |
| rr | Respiratory Rate | number | Ya | x/menit, 0–80 | autofill triase | |
| nadi | Nadi | number | Ya | x/menit, 0–250 | autofill triase | |
| suhu | Suhu | number | Ya | °C, 30–45 | autofill triase | |
| spo2 | Saturasi O2 | number | Ya | %, 0–100 | autofill triase | |
| tinggi_badan | Tinggi Badan | number | Tidak | cm, >0 | autofill triase | |
| berat_badan | Berat Badan | number | Tidak | kg, >0 | autofill triase | |
| gds | GDS | number | Tidak | mg/dL, ≥0 | autofill triase | |
| data_objektif_lain | Data Objektif Lainnya | text (free) | Tidak | maks 1000 char | autofill triase | |
| asesmen_nyeri | Asesmen Nyeri | group (instrumen) | Ya | sesuai umur (BR-012) | manual | skala nyeri per umur |
| asesmen_risiko_jatuh | Asesmen Risiko Jatuh | group (instrumen) | Ya | sesuai umur | manual | Morse/Humpty Dumpty [ASUMSI instrumen] |
| skrining_gizi | Skrining Gizi | group | Ya | sesuai umur | manual | |
| kemampuan_ibadah_wajib | Wajib Ibadah | radiobutton | Tidak | Baligh/Tidak Baligh/Berhalangan | manual | |
| kemampuan_bersuci | Bersuci | radiobutton | Tidak | Mandiri/Dengan Bantuan/Tayamum | manual | |
| kemampuan_sholat | Sholat | radiobutton | Tidak | Berdiri/Duduk/Berbaring-Miring/Isyarat | manual | |
| psikologis | Psikologis | checkbox (multi) | Tidak | Senang/Tenang/Cemas/Sedih/Tegang/Takut/Depresi/Marah/Lain-lain | manual | |
| sosial_ekonomi | Sosial Ekonomi | radiobutton | Tidak | Baik/Cukup/Kurang | manual | |
| pasien_infeksius | Pasien Infeksius/Immunokompromise | boolean+detail | Ya | Ya/Tidak | manual | jika Ya → sebutkan [PERLU KONFIRMASI daftar opsi] |
| masalah_keperawatan | Masalah Keperawatan | multi-select/text | Ya | dari master diagnosa keperawatan [PERLU KONFIRMASI SDKI] | lookup/manual | |
| tindakan_keperawatan | Tindakan Keperawatan | multi-select/text | Ya | maks 1000 char | manual | |
| tindakan_igd | Tindakan IGD | multi-input | Tidak | [PERLU KONFIRMASI daftar tindakan] | manual/lookup | |
| keseimbangan_cairan | Keseimbangan Cairan (intake/output) | number group | Tidak | mL, ≥0 | manual | |
| hasil_penunjang | Hasil Penunjang | text + file | Tidak | upload (ref D10) | manual/integrasi | file: pdf/jpg/png ≤10MB |

### 11.3 Layar INPUT — Asesmen Medis Dokter IGD (FR-003)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_kasus | Jenis Kasus | radiobutton | Ya | Bedah/Trauma/Non-Trauma/Obgyn/Non Bedah/Interna/Anak/Saraf/Jantung/Kasus Lainnya | manual | |
| anamnesis | Anamnesis | text (free) | Ya | maks 2000 char | autofill triase/asesmen perawat | BR-005 |
| dr_riwayat_alergi | Riwayat Alergi | dropdown+detail | Ya | Tidak ada/Ada | autofill/ manual | BR-007 |
| gcs_eye | GCS - Eye | dropdown | Ya | 1–4 (Open spontaneously…No eye opening) | manual | |
| gcs_motor | GCS - Motor | dropdown | Ya | 1–6 (Obeys command…No motor response) | manual | |
| gcs_verbal | GCS - Verbal | dropdown | Ya | 1–5 (Orientated…No verbal response) | manual | |
| gcs_total | GCS Total | number | Auto | 3–15 | hitung otomatis | read-only, FR-006 |
| gcs_kesimpulan | Kesimpulan Kesadaran | enum | Auto | Compos Mentis/Apatis/Delirium/Somnolence/Stupor/Coma | hitung otomatis (BR-006) | read-only |
| dr_td | Tekanan Darah (Sist/Diast) | number group | Ya | mmHg | autofill triase/perawat | |
| dr_rr | RR | number | Ya | x/menit | autofill triase/perawat | |
| dr_nadi | Nadi | number | Ya | x/menit | autofill triase/perawat | |
| dr_suhu | Suhu | number | Ya | °C | autofill triase/perawat | |
| dr_spo2 | Saturasi O2 | number | Ya | % | autofill triase/perawat | |
| dr_tb | Tinggi Badan | number | Tidak | cm | autofill triase/perawat | |
| dr_bb | Berat Badan | number | Tidak | kg | autofill triase/perawat | |
| dr_gds | GDS | number | Tidak | mg/dL | autofill triase/perawat | |
| pf_kepala | Pemeriksaan Fisik - Kepala | text/normal | Tidak | freetext atau flag normal | manual | |
| pf_mata | PF - Mata | text/normal | Tidak | freetext/normal | manual | |
| pf_mulut | PF - Mulut | text/normal | Tidak | freetext/normal | manual | |
| pf_leher | PF - Leher | text/normal | Tidak | freetext/normal | manual | |
| pf_dada | PF - Dada | text/normal | Tidak | freetext/normal | manual | |
| pf_perut | PF - Perut | text/normal | Tidak | freetext/normal | manual | |
| pf_lainnya | PF - Regio Lainnya | text/normal | Tidak | [PERLU KONFIRMASI daftar regio lengkap] | manual | ekstremitas, genital, dll. |
| diagnosis | Diagnosis (Assessment) | lookup (ICD-10) | Ya | kode + nama ICD-10 | lookup ICD-10 / SATUSEHAT | primer & sekunder |
| rencana_penatalaksanaan | Rencana Penatalaksanaan (Plan) | text (free) | Ya | maks 2000 char | manual | terapi/order/disposisi |

### 11.4 Layar TAMPIL — Dashboard Pasien IGD (entry ke asesmen)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. RM | pasien.no_rm | text | cari | |
| Nama Pasien | pasien.nama | text | sort A-Z | |
| Kategori Triase | triase [D11] | badge warna (merah/kuning/hijau) | filter | |
| Status Asesmen Perawat | asesmen.status | badge (Belum/Draft/Final) | filter | FR-016 |
| Status Asesmen Dokter | asesmen.status | badge (Belum/Draft/Final) | filter | FR-016 |
| Waktu Masuk IGD | kunjungan.waktu_masuk | datetime | sort terbaru | |
| DPJP/Perawat PJ | asesmen.pengisi_nama | text | filter | |

### 11.5 Layar TAMPIL — Panel Riwayat Klinis (FR-011)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Riwayat Kunjungan | modul pelayanan | list (tanggal, unit, dx) | sort terbaru | g-emr-patient-identity |
| Hasil Lab PK | LIS (Lab) | list nilai + flag abnormal | filter tgl | integrasi LIS |
| Hasil Radiologi | RIS/PACS | list + link gambar | filter tgl | integrasi RIS/PACS |
| Patologi Anatomi | modul penunjang | list hasil | filter tgl | |
| Penunjang Lainnya | modul penunjang | list + file | filter | |
| Riwayat Alergi | Data Alergi [D4] | badge (alergen) | – | warna merah |

### 11.6 Layar TAMPIL — Riwayat Perubahan / Audit Trail (FR-010)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit.timestamp | datetime | sort terbaru | BR-009 |
| Pengguna | audit.user_id → Staff | text (nama, jabatan) | filter | field kanonik |
| Aktivitas | audit.action | badge (Create/Update/View) | filter | |
| Ringkasan Perubahan | audit.diff | text (field: lama → baru) | – | |
| Tab/Section | audit.section | text | filter | Perawat/Dokter |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Target |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Form asesmen (termasuk autofill) tampil sepenuhnya | ≤ 3 detik pada jaringan RS standar |
| **NFR-002** | Performa | Simpan asesmen (draft/final) | ≤ 2 detik |
| **NFR-003** | Responsivitas | Layout adaptif desktop & tablet area IGD | ≥ 1024px & tablet 768px |
| **NFR-004** | Ketersediaan | Dukungan **simpan draft berkala/lokal** saat koneksi tidak stabil, sinkronisasi saat online kembali [ASUMSI RS Tipe C&D] | Tidak kehilangan data draft |
| **NFR-005** | Keamanan | RBAC ditegakkan di **server-side** (bukan hanya UI); akses ditolak dicatat | 0 bypass |
| **NFR-006** | Auditabilitas | Audit trail immutable (tidak dapat diubah/dihapus) & tersimpan sesuai retensi rekam medis | 100% transaksi |
| **NFR-007** | Integritas Data | Asesmen final tidak dapat dihapus; koreksi via addendum/versi baru | Sesuai kaidah RME |
| **NFR-008** | Kompatibilitas | Berjalan di browser modern (Chrome/Edge terbaru) | 2 versi terakhir |
| **NFR-009** | Usability | Field wajib & error ditandai jelas; autofill dibedakan visual dari input manual | Skor usability ≥ 4/5 |
| **NFR-010** | Kepatuhan | Sesuai Permenkes RME & standar SATUSEHAT untuk data yang dikirim | Lolos validasi |
| **NFR-011** | Skalabilitas | Mendukung beban puncak IGD RS Tipe C&D | [PERLU KONFIRMASI jumlah kunjungan/jam] |
| **NFR-012** | Audit Waktu | Semua timestamp memakai zona waktu server & format ISO (WIB/WITA/WIT sesuai lokasi RS) | Konsisten |

## 13. Integrasi Eksternal

| Sistem/Modul | Arah | Data | Keperluan | Catatan |
|--------------|------|------|-----------|---------|
| **Triase [D11]** (internal) | Masuk | keluhan utama, TTV, data objektif | **Autofill** asesmen perawat & dokter | BR-004/005 |
| **Asesmen Perawat → Asesmen Dokter** (internal) | Masuk | anamnesis, TTV | Autofill dokter bila perawat sudah isi | BR-005 |
| **Master Staff (A1/A2) & Jabatan (A55)** | Masuk | `user_id`, `nama`, `nip`, `jabatan` | Identitas pengisi & audit | field kanonik |
| **Master Unit (A3)** | Masuk | `unit` | Konteks IGD | field kanonik |
| **RBAC/Role (A53)** | Masuk | role, hak akses menu | Tab editable/read-only | BR-002, NFR-005 |
| **LIS (Lab)** | Masuk | hasil Lab PK | Panel Riwayat Klinis | FR-011 |
| **RIS/PACS (Radiologi)** | Masuk | hasil & citra radiologi | Panel Riwayat Klinis | FR-011 |
| **Data Alergi [D4] / Ringkasan Kesehatan [D5]** | Masuk | riwayat alergi, ringkasan | Referensi & autofill alergi | BR-007 |
| **SATUSEHAT** | Keluar | Encounter, Condition (diagnosis ICD-10), Observation (TTV/GCS) | Interoperabilitas RME | [ASUMSI: pengiriman mengikuti resource FHIR SATUSEHAT; perlu mapping kode] |
| **ICD-10** | Masuk | kode & nama diagnosis | Field diagnosis dokter | Bisa via master lokal atau SATUSEHAT |
| **BPJS (VClaim/SEP)** | – | – | Tidak langsung dipakai modul asesmen | konteks kunjungan; [PERLU KONFIRMASI apakah diagnosis IGD dikirim ke SEP] |
| **CPPT IGD [D14] / Observasi [D13]** (internal) | Keluar | data asesmen tersimpan | Sumber autofill lanjutan | BR-014 |
| **Dokumen Pendukung [D10]** | Keluar/Masuk | file hasil penunjang | Upload/lampiran | FR-002 |

> [ASUMSI] Detail resource & profil FHIR SATUSEHAT (Encounter IGD, Observation GCS/TTV, Condition) perlu disepakati saat desain integrasi. [PERLU KONFIRMASI] Apakah pengiriman SATUSEHAT dilakukan real-time saat simpan final atau batch.

## Asumsi
- [ASUMSI] Alur As-Is/To-Be diturunkan dari BPMN analogi (g-emr-emergency, g-emr-inpatient, g-emr-patient-identity, g-emr-screening) karena D12 belum memiliki BPMN khusus.
- [ASUMSI] RS Tipe C & D memiliki koneksi yang dapat tidak stabil → dukungan simpan draft/offline (NFR-004) diusulkan.
- [ASUMSI] Prioritas autofill dokter: nilai asesmen perawat mengungguli triase bila keduanya terisi.
- [ASUMSI] Diagnosis memakai ICD-10 (dari master lokal atau SATUSEHAT); struktur field diagnosis primer & sekunder.
- [ASUMSI] GCS & rentang skoring kesadaran mengikuti tabel di mapping field igd.xlsx.
- [ASUMSI] Warning nilai TTV di luar rentang bersifat non-blocking karena kondisi ekstrem valid di IGD.
- [ASUMSI] Instrumen skrining nyeri/risiko jatuh/gizi mengikuti kelompok umur (dewasa/anak) sesuai catatan 'sama dengan general/sesuai umur' di mapping.
- [ASUMSI] Field kanonik (no_rm, kunjungan_id, nama, nip, jabatan, unit, user_id) mengikuti definisi bersama lintas-PRD tanpa perubahan.
- [ASUMSI] Target metrik (M1–M6) adalah usulan awal dan perlu disepakati manajemen & tim klinis.

## Pertanyaan Terbuka
- Baseline waktu pengisian asesmen saat ini (untuk target M1) — berapa menit rata-rata? [PERLU KONFIRMASI]
- Instrumen skrining risiko jatuh & gizi yang dipakai RS (Morse/Humpty Dumpty; MST/STRONG-kids) per kelompok umur?
- Master masalah keperawatan yang dipakai (SDKI/NANDA) dan apakah berupa lookup terstruktur?
- Daftar lengkap opsi 'Tindakan IGD' dan regio pemeriksaan fisik dokter di luar yang tercantum di mapping field.
- Prioritas sumber autofill dokter bila triase & asesmen perawat berbeda nilai — mana yang menang? (asumsi saat ini: asesmen perawat).
- Apakah diagnosis IGD dikirim ke BPJS (SEP) dan/atau SATUSEHAT, real-time atau batch?
- Mekanisme koreksi asesmen final: addendum vs versioning — kebijakan RS?
- Apakah dibutuhkan tanda tangan elektronik / verifikasi DPJP pada asesmen medis?
- Beban puncak IGD (kunjungan/jam) untuk NFR skalabilitas.
- Daftar opsi penyakit infeksius/immunokompromise untuk skrining.