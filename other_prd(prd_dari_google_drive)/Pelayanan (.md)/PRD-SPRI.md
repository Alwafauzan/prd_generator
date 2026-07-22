# PRD — Surat Perintah Rawat Inap (SPRI)

**Related Document:** Draft Konsep SPRI; DFD Pembuatan SPRI (Level 0 & Level 1); Flowchart Pembuatan SPRI (+ Legend); Referensi V1 (staging PKU & staging Afdila); PRD Pendaftaran Rawat Inap (**hard dependency** — modul hilir); PRD Asesmen RJ/IGD (**hard dependency** — sumber Dokter Pengirim)
**Dokumen ID:** PRD-P-SPRI-v2.0  ·  **Versi:** 2.5 (Draft — Revisi pasca-feedback)
**Tanggal Disusun:** 8 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

---

## 1. Overview / Brief Summary

Surat Perintah Rawat Inap (SPRI) adalah surat perintah yang dibuat oleh tenaga kesehatan dari layanan Rawat Jalan atau IGD untuk memerintahkan pasien menjalani rawat inap. SPRI berperan sebagai titik masuk resmi dari layanan rawat jalan/gawat darurat menuju proses admisi rawat inap: begitu SPRI tersimpan, pasien mengalir ke daftar tunggu (Waiting List) pada modul Pendaftaran Rawat Inap. Penggunanya adalah dokter, perawat, dan bidan yang menangani pasien di poliklinik atau IGD.

Di Neurovi v1, SPRI sudah tersedia dalam menu **Pembuatan Surat**, tab **Surat Perintah Rawat Inap**. Terdapat dua varian v1: varian PKU (belum memiliki field **Dokter Pengirim**) dan varian Afdila (sudah menambahkan field **Dokter Pengirim**). Field Dokter Pengirim ditambahkan agar informasi dokter yang mengirim pasien ke rawat inap terekam terstruktur dan dapat mengalir ke Resume Medis Rawat Inap. **PRD ini menjadikan varian yang sudah memuat Dokter Pengirim sebagai bentuk kanonik v2.**

Lingkup Fase 1 (MVP) mencakup pembuatan SPRI, autofill Dokter Pengirim, validasi field wajib, transisi pasien ke Waiting List Pendaftaran Rawat Inap, serta pencetakan dokumen SPRI. Titik singgung dengan BPJS, SATUSEHAT, dan integrasi detail ke Casemix/INA-CBG diperlakukan sebagai kapabilitas Fase 2. `[**]`

Fokus fungsional utama v2 adalah field **Dokter Pengirim** beserta logika autofill-nya, yang mengikuti siapa yang login dan dokter yang mengisi asesmen pasien.

> Referensi: Draft Konsep SPRI; DFD & Flowchart Pembuatan SPRI; tampilan V1 staging PKU & Afdila.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: staging PKU & Afdila, Draft Konsep SPRI:
- SPRI tersedia di menu Pembuatan Surat > tab Surat Perintah Rawat Inap, diakses dari konteks pasien di layanan RJ/IGD.
- Form berisi data pasien read-only (Nomor Surat, Nama Pasien, Tanggal Lahir, Alamat) dan field isian: Tipe Penjamin, Jenis Kasus, Ruang Perawatan, DPJP, Jenis Pelayanan, Diagnosa Masuk, Tanggal Rencana Rawat, dan Catatan.
- Terdapat dua varian: **PKU** (belum ada field Dokter Pengirim) dan **Afdila** (sudah menambahkan field Dokter Pengirim). Selain field ini, kedua varian identik.
- SPRI yang sudah dibuat dapat dibuka kembali; field tetap dapat diedit dan disimpan ulang, serta dokumen dapat dicetak.

**Masalah / pain point:**
- **Bisnis proses:** Pada varian tanpa Dokter Pengirim, informasi dokter yang memerintahkan rawat inap tidak terekam terstruktur, sehingga Resume Medis Rawat Inap tidak lengkap.
- **UX:** Penentuan Dokter Pengirim secara manual menyita waktu dan rawan keliru bila petugas yang login bukan dokter yang bersangkutan.
- **Logic system:** Dokter Pengirim yang tepat bergantung pada siapa yang login (dokter vs perawat/bidan) dan pada dokter yang mengisi asesmen pasien.

**Dampak utama yang disasar v2:**
- Dokter Pengirim terekam secara konsisten dan mengalir ke Resume Medis Rawat Inap. · Autofill mengurangi input manual dan menekan kekeliruan penentuan dokter pengirim.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = pembuatan SPRI, field & autofill Dokter Pengirim, validasi field wajib, transisi ke Waiting List Pendaftaran Rawat Inap, dan cetak dokumen SPRI.
- **Fase 2** = bridging BPJS, SATUSEHAT, dan integrasi detail dokumen SPRI ke Casemix/INA-CBG. `[**]`

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Akses pembuatan SPRI** — dari konteks pasien di layanan RJ/IGD, melalui icon "Lainnya" → menu **Pembuatan Surat** → tab **Surat Perintah Rawat Inap**.
2. **Pengisian field SPRI** — Tipe Penjamin, Jenis Kasus, Ruang Perawatan, **Dokter Pengirim**, DPJP (Utama + tambahan), Jenis Pelayanan, Diagnosa Masuk (multi, ICD-10/free text), Tanggal Rencana Rawat, dan Catatan.
3. **Autofill Dokter Pengirim** — sistem mengisi otomatis Dokter Pengirim berdasarkan konteks login dan dokter yang mengisi asesmen pasien, tetap dapat diedit.
4. **Validasi field wajib saat Simpan** — sistem menolak simpan bila ada field wajib yang belum terisi dan menampilkan popup penanda.
5. **Transisi ke Waiting List** — setelah SPRI tersimpan valid, pasien muncul di menu Pendaftaran Rawat Inap tab Waiting List.
6. **Revisi SPRI** — SPRI yang sudah dibuat dapat dibuka kembali; field tetap dapat diedit dan disimpan ulang. Tidak ada penghapusan SPRI.
7. **Cetak dokumen SPRI** — pencetakan bersifat opsional, dapat dilakukan setelah simpan maupun saat membuka SPRI yang sudah ada.
8. **View SPRI (read-only)** — dari Waiting List Pendaftaran Rawat Inap, petugas dapat membuka SPRI via tombol View SPRI dalam mode read-only (menampilkan hasil pembuatan SPRI; hanya aksi cetak yang aktif).

### Out Scope
- Proses admisi rawat inap sebenarnya (registrasi ranap, penetapan bangsal/bed) — ditangani **PRD Pendaftaran Rawat Inap**.
- Pembatalan rencana rawat inap (aksi **Batal Rawat Inap**) — ditangani **PRD Pendaftaran Rawat Inap**.
- **Fase 2** `[**]` Bridging BPJS (SEP rawat inap), termasuk **Nomor Surat BPJS** (muncul otomatis pada pasien BPJS), dan SATUSEHAT.
- **Fase 2** `[**]` Integrasi detail dokumen SPRI ke Casemix/INA-CBG (aliran ke Casemix diakui di DFD, namun mekanisme integrasinya di luar MVP).
- Migrasi data SPRI v1 → v2 (workstream tersendiri di fase delivery; lihat Pertanyaan Terbuka).

## 4. Goals and Metrics

### Tujuan
Membuat SPRI cepat dan akurat, memastikan Dokter Pengirim terekam konsisten, dan mengalirkan pasien secara mulus ke daftar tunggu rawat inap tanpa pengulangan input.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu muat awal form SPRI (p95) | ≤ 2 detik | NFR-001 |
| Waktu simpan SPRI hingga muncul di Waiting List (p95) | ≤ 3 detik | NFR-002 |
| Dokter Pengirim terisi otomatis tanpa koreksi manual | ≥ 80% | FR-004 |

> *Target di atas mengacu pada standar umum kenyamanan sistem RS dan dapat disesuaikan setelah pengukuran operasional.*

## 5. Related Feature & Persona

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Pelayanan Rawat Jalan / IGD | Titik pembuatan SPRI (event source dari konteks pasien). |
| Asesmen RJ / IGD | Sumber penentuan Dokter Pengirim (dokter yang mengisi asesmen) dan autofill Diagnosa Masuk (dari diagnosa asesmen dokter). **Hard dependency.** |
| Pendaftaran Rawat Inap | Konsumen — menerima pasien di Waiting List setelah SPRI tersimpan; menyediakan View SPRI (read-only) dari Waiting List; menangani admisi & pembatalan (Batal Rawat Inap). **Hard dependency (hilir).** |
| Resume Medis Rawat Inap | Konsumen — menerima informasi Dokter Pengirim. |
| Casemix | Konsumen dokumen SPRI (integrasi detail Fase 2). `[**]` |

Dependency lintas modul: **Master Staf** (sumber daftar dokter untuk Dokter Pengirim & DPJP), **Master Data Kamar** (Ruang Perawatan — field Tipe Kamar), **Master ICD-10** (Diagnosa Masuk), **Master Data Penomoran Surat** (aturan Nomor Surat).

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter | Primary | Membuat SPRI; menjadi Dokter Pengirim default bila yang login adalah dokter yang bersangkutan. |
| Perawat / Bidan | Primary | Membuat SPRI atas nama dokter penanggung jawab; mengisi/mengoreksi Dokter Pengirim bila autofill kosong. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Petugas membuka konteks pasien di layanan RJ/IGD, klik icon "Lainnya".
2. Klik **Pembuatan Surat** → tab **Surat Perintah Rawat Inap**.
3. Bila SPRI sudah pernah dibuat → data tersimpan tampil; field tetap dapat diedit & disimpan ulang, dokumen dapat dicetak.
4. Bila belum → petugas mengisi field secara manual (termasuk Dokter Pengirim) → klik **Simpan** → cetak bila diperlukan.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Petugas membuka konteks pasien di layanan RJ/IGD → icon "Lainnya" → **Pembuatan Surat** → tab **Surat Perintah Rawat Inap**.
2. Sistem memeriksa apakah SPRI untuk konteks tersebut sudah pernah dibuat.
3. Bila sudah → sistem menampilkan data tersimpan; petugas dapat mengedit field dan menyimpan ulang, atau langsung mencetak.
4. Bila belum → sistem menampilkan form dengan data pasien read-only terisi (Nomor Surat, Nama Pasien, Tanggal Lahir, Alamat), Tipe Penjamin ter-autofill dari penjamin aktif, **Dokter Pengirim ter-autofill** berdasarkan konteks login & dokter yang mengisi asesmen pasien, serta **Diagnosa Masuk ter-autofill** dari diagnosa asesmen dokter bila tersedia.
5. Petugas melengkapi field wajib lainnya (Jenis Kasus, Ruang Perawatan, DPJP Utama, Jenis Pelayanan, Diagnosa Masuk, Tanggal Rencana Rawat), Catatan opsional.
6. Klik **Simpan** → sistem memvalidasi field wajib.
7. Bila tidak valid → popup menandai field yang belum lengkap, simpan dibatalkan.
8. Bila valid → SPRI tersimpan, pasien muncul di **Waiting List Pendaftaran Rawat Inap**, informasi Dokter Pengirim tersedia untuk Resume Medis Rawat Inap.
9. Petugas dapat mencetak dokumen SPRI (opsional).

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Dokter Pengirim | Ada, pengisian sebagian besar manual. | Ter-autofill dari konteks login & dokter pengisi asesmen, tetap editable. |
| Transisi ke ranap | Implisit. | Eksplisit — pasien masuk Waiting List Pendaftaran RI setelah simpan valid. |
| Validasi | Mengikuti perilaku v1. | Validasi field wajib eksplisit dengan popup penanda saat Simpan. |

## 7. Main Flow / Mindmap

### Skenario 1 — SPRI baru (alur normal)
1. Konteks pasien RJ/IGD → "Lainnya" → Pembuatan Surat → tab Surat Perintah Rawat Inap.
2. Sistem: SPRI belum pernah dibuat → tampilkan form. 3. Data pasien read-only + Tipe Penjamin + Dokter Pengirim ter-autofill. 4. Petugas lengkapi field wajib + Catatan (opsional). 5. Klik Simpan → validasi lolos → SPRI tersimpan → pasien masuk Waiting List. 6. Print (opsional).

### Skenario 2 — SPRI sudah pernah dibuat
1. Buka tab Surat Perintah Rawat Inap → sistem deteksi SPRI sudah ada dan menampilkan data tersimpan. 2. Field tetap dapat diedit; petugas dapat mengubah lalu klik Simpan untuk menyimpan ulang. 3. Dokumen dapat dicetak kapan saja.

### Skenario 3 — Autofill Dokter Pengirim per konteks
- **Yang login dokter** → Dokter Pengirim default = dirinya sendiri (tetap editable).
- **Yang login perawat/bidan** → Dokter Pengirim diisi dari dokter yang mengisi asesmen pasien.
- **Asesmen belum diisi / pengisinya bukan dokter** → Dokter Pengirim dikosongkan dan wajib diisi manual.

### Skenario 4 — Validasi gagal
- Klik Simpan dengan field wajib belum lengkap → sistem membatalkan simpan → popup menandai field yang belum diisi/belum valid → petugas melengkapi → Simpan ulang.

### Skenario 5 — View SPRI dari Pendaftaran RI (read-only)
1. Petugas pendaftaran membuka Pendaftaran Rawat Inap → tab Waiting List. 2. Pada baris pasien, klik tombol **View SPRI**. 3. Sistem menampilkan SPRI dalam mode read-only (data hasil pembuatan SPRI; tombol Simpan nonaktif, hanya Print aktif). 4. Revisi SPRI tetap dilakukan dari sisi Pelayanan (Pembuatan Surat), bukan dari layar ini.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | SPRI hanya dapat dibuat dari konteks pasien pada layanan Rawat Jalan / IGD melalui menu Pembuatan Surat, tab Surat Perintah Rawat Inap. | Flowchart; US-001; FR-001 |
| **BR-002** | Seluruh field wajib kecuali Catatan. Field wajib: Tipe Penjamin, Jenis Kasus, Ruang Perawatan, Dokter Pengirim, DPJP Utama, Jenis Pelayanan, Diagnosa Masuk 1, Tanggal Rencana Rawat. | Flowchart; FR-006 |
| **BR-003** | Data pasien (Nomor Surat, Nama Pasien, Tanggal Lahir, Alamat) bersifat read-only dan terisi otomatis dari konteks pasien. | UI V1; FR-002 |
| **BR-004** | Tipe Penjamin terisi otomatis dari penjamin aktif pasien saat SPRI dibuat, dan tetap dapat diedit. | DFD; Flowchart; FR-003 |
| **BR-005** | Dokter Pengirim wajib diisi, dipilih dari daftar staf berperan dokter, dan terisi otomatis dengan aturan: (a) bila yang login dokter → default dirinya sendiri sesuai akun login; (b) bila yang login bukan dokter (perawat/bidan) dan belum ada dokter yang mengisi asesmen → dikosongkan, wajib diisi; (c) bila yang login bukan dokter (perawat/bidan) dan sudah ada dokter yang mengisi asesmen → terisi dokter tersebut, sesuai jenis asesmen pasien (general/IGD/kebidanan/mata/gigi). Field tetap dapat diedit meski sudah terisi otomatis. | Flowchart (catatan Dokter Pengirim); FR-004; US-004 |
| **BR-006** | Diagnosa Masuk dapat lebih dari satu (multi-entri); Diagnosa Masuk 1 adalah diagnosa primer & wajib. Diagnosa Masuk dapat diisi dengan kode ICD-10 (dropdown) maupun free text. DPJP juga dapat lebih dari satu (DPJP 1 Utama, DPJP 2, dst.). | UI V1; FR-007 |
| **BR-007** | Setelah SPRI tersimpan valid, pasien otomatis muncul pada Waiting List di modul Pendaftaran Rawat Inap. | DFD; Flowchart; FR-008 |
| **BR-008** | SPRI yang sudah tersimpan tetap dapat diedit dan disimpan ulang (dapat direvisi). Tidak ada penghapusan SPRI. | Draft user; FR-005 |
| **BR-009** | Pencetakan dokumen SPRI bersifat opsional dan dapat dilakukan setelah simpan maupun saat membuka SPRI yang sudah ada. | Flowchart; FR-009 |
| **BR-010** | Informasi Dokter Pengirim tersedia untuk dialirkan ke Resume Medis Rawat Inap. | DFD (aliran "Informasi Data Dokter Pengirim"); FR-010 |
| **BR-011 `[**]`** | **Fase 2:** Dokumen SPRI dialirkan ke Casemix untuk keperluan INA-CBG. | DFD (aliran ke Casemix) |
| **BR-012 `[**]`** | **Fase 2:** SPRI menyertakan titik singgung bridging BPJS / SATUSEHAT. | Domain knowledge |
| **BR-013** | Keunikan SPRI bersifat per registrasi kunjungan (bukan per pasien). Setiap kunjungan menghasilkan SPRI tersendiri. | Draft user; Flowchart (pengecekan "sudah dibuat sebelumnya") |
| **BR-014** | Pasien yang sedang menjalani rawat inap akan tervalidasi saat pendaftaran kunjungan baru, untuk mencegah registrasi ganda. Validasi ini ditangani modul Pendaftaran. | Draft user; Pendaftaran RI |
| **BR-015** | Pembatalan rencana rawat inap dilakukan melalui aksi **Batal Rawat Inap** di Pendaftaran Rawat Inap; SPRI tidak dihapus. | Draft user; Pendaftaran RI |
| **BR-016** | Diagnosa Masuk mengikuti perilaku existing: bila sudah ada diagnosa dari asesmen dokter, Diagnosa Masuk terisi otomatis (autofill). Bila diagnosa asesmen berupa free text → terisi free text; bila berupa ICD-10 → terisi kode ICD-10 beserta deskripsinya. | Flowchart (catatan Diagnosa); FR-007 |
| **BR-017** | Nomor Surat SPRI dibuat otomatis mengikuti rules penomoran pada **Master Data Penomoran Surat** (bukan hardcode). Contoh format: nomor urut 6 digit (mis. 040491). | Draft user (principal); FR-002 |
| **BR-018** | Dari Waiting List Pendaftaran Rawat Inap, SPRI dapat dilihat melalui tombol **View SPRI** dalam mode read-only — menampilkan hasil pembuatan SPRI dengan hanya aksi cetak yang aktif (Simpan nonaktif). Revisi SPRI tetap dilakukan dari konteks Pelayanan. | Draft user; FR-013 |

## 9. State Machine

### 9.1 Status SPRI
| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Belum Dibuat | — (tidak ada record) | Konteks pasien belum memiliki SPRI; form terbuka untuk pengisian. |
| Tersimpan | Data tampil, field tetap editable | SPRI valid tersimpan; pasien sudah masuk Waiting List; masih dapat diedit & disimpan ulang. |

- **Transisi:** Belum Dibuat → (klik Simpan, validasi lolos) → Tersimpan.
- Dari **Tersimpan**, edit lalu Simpan ulang → tetap **Tersimpan** (data diperbarui).
- Aksi **Print** dapat dilakukan pada state Tersimpan tanpa mengubah state.

### 9.2 Catatan transisi
- Validasi gagal tidak mengubah state — form tetap pada Belum Dibuat hingga simpan lolos.
- Tidak ada penghapusan SPRI. Pembatalan rencana rawat inap ditangani di modul Pendaftaran RI melalui aksi **Batal Rawat Inap**, di luar state SPRI.

## 10. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas RJ/IGD**, saya ingin membuat SPRI dari konteks pasien, sehingga perintah rawat inap terdokumentasi resmi. | 1) Given pasien di layanan RJ/IGD, When saya buka Pembuatan Surat > tab Surat Perintah Rawat Inap dan SPRI belum ada, Then form pembuatan tampil (BR-001). | FR-001; BR-001 |
| **US-002** | Sebagai **petugas**, saya ingin data pasien terisi otomatis, sehingga saya tidak mengetik ulang identitas. | 1) Given form SPRI terbuka, When form dimuat, Then Nomor Surat, Nama Pasien, Tanggal Lahir, Alamat terisi read-only (BR-003). | FR-002; BR-003 |
| **US-003** | Sebagai **petugas**, saya ingin Tipe Penjamin terisi dari penjamin aktif pasien, sehingga konsisten dengan status penjamin. | 1) Given pasien punya penjamin aktif, When form dimuat, Then Tipe Penjamin ter-autofill dan tetap dapat diubah (BR-004). | FR-003; BR-004 |
| **US-004** | Sebagai **petugas**, saya ingin Dokter Pengirim terisi otomatis sesuai konteks, sehingga tidak perlu menentukan manual dan terekam akurat. | 1) Given yang login dokter, When form dimuat, Then Dokter Pengirim default dirinya (sesuai akun login), tetap editable. 2) Given login perawat/bidan dan belum ada dokter yang mengisi asesmen, When form dimuat, Then Dokter Pengirim kosong & wajib diisi. 3) Given login perawat/bidan dan sudah ada dokter yang mengisi asesmen, When form dimuat, Then Dokter Pengirim terisi dokter pengisi asesmen sesuai jenis asesmen (general/IGD/kebidanan/mata/gigi) (BR-005). | FR-004; BR-005 |
| **US-005** | Sebagai **petugas**, saya ingin sistem mencegah simpan bila field wajib belum lengkap, sehingga SPRI tidak tersimpan setengah jadi. | 1) Given ada field wajib kosong, When saya klik Simpan, Then simpan dibatalkan & popup menandai field yang kurang (BR-002). | FR-006; BR-002 |
| **US-006** | Sebagai **petugas**, saya ingin pasien otomatis masuk Waiting List setelah SPRI tersimpan, sehingga proses admisi ranap langsung berlanjut. | 1) Given SPRI tersimpan valid, When simpan berhasil, Then pasien muncul di Waiting List Pendaftaran RI (BR-007). | FR-008; BR-007 |
| **US-007** | Sebagai **petugas**, saya ingin mencetak SPRI, sehingga tersedia dokumen fisik bila diperlukan. | 1) Given SPRI tersimpan, When saya klik Print, Then dokumen SPRI tercetak tanpa mengubah data (BR-009). | FR-009; BR-009 |
| **US-008** | Sebagai **petugas**, saat SPRI sudah ada saya ingin dapat membukanya, mengedit bila perlu, lalu menyimpan ulang, sehingga data perintah tetap bisa diperbaiki. | 1) Given SPRI sudah dibuat, When saya buka tab-nya, Then data tersimpan tampil dan field dapat diedit. 2) When saya ubah lalu klik Simpan, Then perubahan tersimpan (BR-008). | FR-005; BR-008 |
| **US-009** | Sebagai **petugas pendaftaran RI**, saya ingin melihat SPRI pasien dari Waiting List, sehingga saya dapat memverifikasi perintah rawat inap tanpa mengubahnya. | 1) Given pasien ada di Waiting List, When saya klik View SPRI, Then SPRI tampil read-only (hanya Print aktif, Simpan nonaktif) (BR-018). | FR-013; BR-018 |

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Akses & pembuatan SPRI** — sistem menyediakan pembuatan SPRI dari konteks pasien RJ/IGD via Pembuatan Surat > tab Surat Perintah Rawat Inap. | US-001; BR-001 |
| **FR-002** | **Autofill data pasien** — sistem mengisi Nomor Surat, Nama Pasien, Tanggal Lahir, Alamat secara read-only dari konteks pasien. | US-002; BR-003 |
| **FR-003** | **Autofill Tipe Penjamin** — sistem mengisi Tipe Penjamin dari penjamin aktif pasien; field tetap dapat diedit. | US-003; BR-004 |
| **FR-004** | **Autofill Dokter Pengirim** — sistem menentukan Dokter Pengirim sesuai konteks login & dokter yang mengisi asesmen pasien (lihat BR-005); field tetap dapat diedit. | US-004; BR-005 |
| **FR-005** | **Buka & revisi SPRI existing** — bila SPRI untuk konteks tersebut sudah ada, sistem menampilkan data tersimpan dengan field tetap dapat diedit dan disimpan ulang; cetak tersedia. | US-008; BR-008 |
| **FR-006** | **Validasi field wajib** — saat Simpan, sistem memvalidasi seluruh field wajib; bila belum lengkap, simpan dibatalkan dan popup menandai field yang kurang. | US-005; BR-002 |
| **FR-007** | **Diagnosa Masuk & DPJP multi-entri** — sistem memungkinkan penambahan lebih dari satu Diagnosa Masuk (Diagnosa 1 wajib sebagai primer) dan lebih dari satu DPJP (DPJP 1 Utama, 2, dst.). Diagnosa Masuk dapat diisi via dropdown ICD-10 maupun free text, dan terisi otomatis dari diagnosa asesmen dokter bila tersedia (mengikuti format sumbernya). | BR-006; BR-016 |
| **FR-008** | **Transisi ke Waiting List** — setelah SPRI tersimpan valid, sistem menampilkan pasien pada Waiting List Pendaftaran Rawat Inap. | US-006; BR-007 |
| **FR-009** | **Cetak SPRI** — sistem menyediakan pencetakan dokumen SPRI (opsional) tanpa mengubah data. | US-007; BR-009 |
| **FR-010** | **Sediakan info Dokter Pengirim untuk Resume Medis** — sistem menyediakan informasi Dokter Pengirim untuk dialirkan ke Resume Medis Rawat Inap. | BR-010 |
| **FR-011 `[**]`** | **Fase 2** — aliran dokumen SPRI ke Casemix (INA-CBG). | BR-011 |
| **FR-012 `[**]`** | **Fase 2** — titik singgung bridging BPJS / SATUSEHAT. | BR-012 |
| **FR-013** | **View SPRI (read-only)** — sistem menampilkan SPRI dalam mode read-only saat dibuka via tombol View SPRI di Waiting List Pendaftaran Rawat Inap; hanya aksi cetak yang aktif, Simpan nonaktif. | US-009; BR-018 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi & penjamin **reuse definisi kanonik dari modul Pendaftaran / B1** — nama, tipe, format, validasi **harus sama**.

### A. Layar INPUT — Form SPRI (FR-001 s/d FR-007)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nomor_surat | Nomor Surat | text | — | Mengikuti rules Master Data Penomoran Surat (contoh: nomor urut 6 digit — mis. 040491) | Dibuat otomatis sesuai konfigurasi Master Data Penomoran Surat | Read-only. V1 masih hardcode; v2 mengikuti Master Penomoran Surat (BR-017). |
| nama_pasien | Nama Pasien | text | — | — | Konteks pasien | Read-only, reuse kanonik. |
| tanggal_lahir | Tanggal Lahir | date | — | dd MMMM yyyy | Konteks pasien | Read-only, reuse kanonik. |
| alamat | Alamat | text | — | — | Konteks pasien | Read-only, reuse kanonik. |
| tipe_penjamin | Tipe Penjamin | dropdown | Ya | — | Autofill penjamin aktif | Editable. |
| jenis_kasus | Jenis Kasus | dropdown | Ya | Bedah Trauma / Bedah Non-Trauma / Obgyn / Interna / Anak / Syaraf / Jantung / Neonatus | Enum tetap | — |
| ruang_perawatan | Ruang Perawatan | multi-select | Ya | Nilai contoh: HCU / Nifas / Perinatologi / Anak / NICU/PICU / Umum / ICU / ICCU / VK / Isolasi | Master Data Kamar (field Tipe Kamar) | Multi-select. |
| dokter_pengirim | Dokter Pengirim | dropdown | Ya | Staf peran = dokter | Daftar staf peran dokter; autofill mengikuti BR-005; editable | Autofill dari dokter pengisi asesmen sesuai jenis asesmen (general/IGD/kebidanan/mata/gigi). Bila belum ada dokter pengisi asesmen → wajib diisi manual. |
| dpjp_utama | Nama DPJP 1 (Utama) | dropdown | Ya | — | Master Staf | DPJP utama; dapat ditambah DPJP 2, dst. via tombol (+). |
| dpjp_tambahan | Nama DPJP n | dropdown | Tidak | — | Master Staf | Dapat ditambah via tombol (+). |
| jenis_pelayanan | Jenis Pelayanan | dropdown | Ya | Preventif / Kuratif / Rehabilitatif / Paliatif | Enum tetap | — |
| diagnosa_masuk | Diagnosa Masuk n | dropdown / free text | Ya (min. 1) | ICD-10 (kode + deskripsi) atau free text | Master ICD-10 / input bebas; autofill dari diagnosa asesmen dokter | Multi-entri via (+); Diagnosa 1 primer & wajib. Autofill mengikuti format sumber: free text → free text; ICD-10 → kode + deskripsi (BR-016). |
| tgl_rencana_rawat | Tanggal Rencana Rawat | date | Ya | datepicker | Manual | — |
| catatan | Catatan | textarea | Tidak | — | Manual | Satu-satunya field opsional. |

### B. Data TER-GENERATE saat Simpan (FR-006, FR-008)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| status_spri | Status SPRI | enum | Dibuat otomatis → Tersimpan | Lihat State Machine §9. |
| created_by | Dibuat oleh | reference | Dibuat otomatis dari sesi login | Untuk auditabilitas (NFR). |
| created_at | Waktu dibuat | datetime | Dibuat otomatis | Untuk auditabilitas (NFR). |

### C. Layar TAMPIL — View SPRI read-only (FR-013)
Menampilkan seluruh field hasil pembuatan SPRI (§12.A) beserta data ter-generate (§12.B) secara **read-only**; hanya aksi **Print** yang aktif (Simpan nonaktif). Diakses via tombol View SPRI di Waiting List Pendaftaran RI.

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Seluruh field SPRI | Data pembuatan SPRI (§12.A, §12.B) | Read-only, sesuai tipe field | — | Tidak dapat diedit dari layar ini. |
| Nomor Surat BPJS `[**]` | Bridging BPJS (SEP) | Read-only, text | — | **Fase 2** — muncul otomatis hanya untuk pasien BPJS (hasil bridging BPJS); tidak tampil untuk pasien Umum/Asuransi. Menunggu integrasi BPJS. |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Form SPRI dimuat dengan data & autofill ≤ 2 detik (p95). | Metrik |
| **NFR-002** | Performa | Simpan SPRI hingga pasien muncul di Waiting List ≤ 3 detik (p95). | Metrik |
| **NFR-003** | Keamanan / RBAC | Pembuatan SPRI hanya untuk peran berwenang (dokter, perawat, bidan) sesuai akun login. | Domain knowledge; D-09 |
| **NFR-004** | Auditabilitas | Setiap SPRI merekam pembuat & waktu pembuatan. | Data Req §12.B |
| **NFR-005** | Reliabilitas | Kegagalan validasi/simpan tidak menyimpan SPRI parsial dan tidak memindahkan pasien ke Waiting List. | BR-002; BR-007 |
| **NFR-006** | Usability | Autofill Dokter Pengirim mengurangi input manual namun tetap dapat dikoreksi petugas. | FR-004 |

## 14. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| Master Staf | Sumber daftar dokter untuk Dokter Pengirim & DPJP. | Internal | FR-004; FR-002 |
| Master Data Kamar | Sumber Ruang Perawatan (field Tipe Kamar). | Internal | FR-006 |
| Master ICD-10 | Sumber Diagnosa Masuk (kode + deskripsi). | Internal | FR-007 |
| Master Data Penomoran Surat | Sumber aturan penomoran Nomor Surat. | Internal | BR-017; FR-002 |
| BPJS (VClaim / bridging) | Titik singgung SEP rawat inap; sumber Nomor Surat BPJS (tampil pada pasien BPJS). | `[**]` Fase 2 | FR-012 |
| SATUSEHAT | Pelaporan/interoperabilitas. | `[**]` Fase 2 | FR-012 |
| Casemix / INA-CBG | Konsumen dokumen SPRI. | `[**]` Fase 2 | FR-011 |

> Jenis Kasus & Jenis Pelayanan bersifat enum tetap (bukan sumber eksternal).

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD Asesmen RJ/IGD | Hard | Autofill Dokter Pengirim & Diagnosa Masuk tidak dapat menarik data dari asesmen. |
| PRD Pendaftaran Rawat Inap | Hard | Transisi ke Waiting List tidak memiliki tujuan; alur hilir (admisi & pembatalan) terputus. |
| Resume Medis Rawat Inap | Soft | Informasi Dokter Pengirim tidak dapat dikonsumsi hilir. |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Sifat SPRI setelah tersimpan | Dapat diedit & disimpan ulang (bukan immutable); tidak ada penghapusan SPRI (BR-008). |
| D-02 | Keunikan SPRI | Satu SPRI per registrasi kunjungan, bukan per pasien (BR-013). |
| D-03 | Pembatalan rencana ranap | Melalui aksi Batal Rawat Inap di Pendaftaran RI; SPRI tidak dihapus (BR-015). |
| D-04 | Tipe Penjamin | Autofill dari penjamin aktif, tetap editable (BR-004). |
| D-05 | Sumber Jenis Kasus & Ruang | Jenis Kasus = enum tetap; Ruang Perawatan = Master Data Kamar (field Tipe Kamar), multi-select (§12.A). |
| D-06 | Penomoran Nomor Surat | Mengikuti rules Master Data Penomoran Surat (bukan hardcode); contoh nomor urut 6 digit (mis. 040491) (BR-017). |
| D-07 | Field wajib | Seluruh field wajib kecuali Catatan (BR-002). |
| D-08 | DPJP & Diagnosa Masuk | Multi-entri (DPJP 1 Utama, 2, dst.; Diagnosa 1 primer & wajib) (BR-006). |
| D-09 | RBAC — peran pembuat SPRI | Dokter, perawat, dan bidan (sesuai akun login) (NFR-003). |
| D-10 | Diagnosa Masuk — input & autofill | Dropdown ICD-10 atau free text; autofill dari diagnosa asesmen dokter mengikuti format sumber (BR-006, BR-016). |
| D-11 | View SPRI dari Pendaftaran RI | Via tombol View SPRI di Waiting List; read-only (hanya Print). Revisi tetap dari sisi Pelayanan (BR-008, BR-018). |
| D-12 `[**]` | Nomor Surat BPJS | Hasil bridging BPJS, muncul otomatis hanya untuk pasien BPJS; tidak tampil untuk pasien Umum/Asuransi. Fase 2 — menunggu integrasi BPJS. |

## 16. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Pembuatan SPRI, autofill data pasien/penjamin/Dokter Pengirim, validasi field wajib, revisi SPRI (edit & simpan ulang), transisi ke Waiting List, cetak, penyediaan info Dokter Pengirim untuk Resume Medis. |
| **Fase 2** `[**]` | Bridging BPJS (SEP ranap), SATUSEHAT, integrasi detail dokumen SPRI ke Casemix/INA-CBG. |

## 17. Asumsi
- `[ASUMSI]` Prinsip penentuan Dokter Pengirim sudah dikonfirmasi (lihat BR-005), termasuk ketergantungan pada jenis asesmen pasien (general/IGD/kebidanan/mata/gigi). Yang masih bersifat asumsi hanya pemetaan sumber datanya, yang mengikuti **model data v2** saat modul Asesmen di-rewrite.
- `[ASUMSI]` Tugas modul SPRI selesai saat perintah tersimpan dan pasien muncul di Waiting List; admisi sebenarnya (registrasi ranap, penetapan bed) dan pembatalan berada di modul Pendaftaran Rawat Inap.
- `[ASUMSI]` Varian dengan Dokter Pengirim adalah superset varian tanpa Dokter Pengirim — diperkuat tampilan staging PKU yang identik dengan Afdila kecuali tidak memuat field Dokter Pengirim.

## 18. Pertanyaan Terbuka
- `[PERLU KONFIRMASI]` **BPJS/SATUSEHAT** — titik singgung bridging mana yang masuk Fase 2, dan apakah ada dampak ke field SPRI di Fase 1.
- `[PERLU KONFIRMASI]` **Template dokumen cetak** — apakah tata letak dokumen SPRI perlu didefinisikan pada PRD ini atau terpisah.
- `[PERLU KONFIRMASI]` **Migrasi data** — penanganan SPRI v1 yang masih aktif/open saat cutover (eksekusi ETL di luar lingkup PRD ini; keputusan bersih vs bawa data ditentukan setelah alur final).
- `[PERLU KONFIRMASI]` **Target Release** — periode rilis SPRI.

## 19. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 2.0 (Draft — Base) | 8 Juli 2026 | Team Product | Draft base awal SPRI Neurovi v2. Baseline varian dengan Dokter Pengirim. Dokter Pengirim ditulis sebagai intent tanpa skema collection v1. Aliran hilir (Waiting List, Resume Medis, Casemix) dan pemisahan Fase 1/2 ditetapkan. Open question ditandai `[PERLU KONFIRMASI]`. |
| 2.1 (Draft — Revisi pasca-feedback) | 8 Juli 2026 | Team Product | SPRI dinyatakan dapat diedit & disimpan ulang (konsep "terkunci/immutable" dibatalkan) — merembet ke Scope, Business Process, Main Flow, BR-008, State Machine, US-008, FR-005, Roadmap. Bahasa autofill Dokter Pengirim disederhanakan (dikaitkan ke "dokter yang mengisi asesmen"). Field wajib, Tipe Penjamin editable, keunikan per registrasi, penomoran 6 digit, sumber Jenis Kasus (enum) & Ruang (Master Data Kamar) dikunci; enum dropdown diisi dari tampilan V1. Metrik performa diisi standar RS. BR-014 (validasi pasien sedang RI) & BR-015 (pembatalan via Pendaftaran RI) ditambahkan. Section Keputusan Desain (Resolved) ditambahkan; Pertanyaan Terbuka diringkas. Catatan volume dihapus. |
| 2.2 (Draft — Revisi pasca-feedback) | 8 Juli 2026 | Team Product | Konfirmasi: perilaku Dokter Pengirim saat asesmen belum diisi/pengisi bukan dokter (tag `[ASUMSI]` dilepas dari Skenario 3). Peran pembuat SPRI dikunci = dokter, perawat, bidan (D-09; tag matriks peran dilepas dari NFR-003; pertanyaan terbuka RBAC ditutup). |
| 2.3 (Draft — Revisi pasca-feedback) | 8 Juli 2026 | Team Product | Koreksi perilaku Diagnosa Masuk: dropdown ICD-10 maupun free text, dengan autofill dari diagnosa asesmen dokter mengikuti format sumber (BR-006 direvisi; BR-016 ditambah; FR-007 diperluas; D-10 ditambah; Data Req diperbarui). Nomor Surat mengikuti Master Data Penomoran Surat (bukan hardcode) — BR-017 ditambah; D-06 & Data Req diperbarui; dependency Master Penomoran Surat ditambahkan. Peran modul Asesmen diperluas (sumber Dokter Pengirim + Diagnosa Masuk). |
| 2.4 (Draft — Revisi pasca-feedback) | 8 Juli 2026 | Team Product | Ditambah fitur **View SPRI (read-only)** dari Waiting List Pendaftaran RI — BR-018, FR-013, US-009, Skenario 5, §12.C, D-11; membedakan dua titik akses (revisi dari Pelayanan vs view read-only dari Pendaftaran RI); pertanyaan "Tautan SPRI ↔ registrasi" ditutup. Aturan **Dokter Pengirim** diperjelas: kondisi belum/sudah ada dokter pengisi asesmen + jenis asesmen (general/IGD/kebidanan/mata/gigi) — BR-005, US-004, Data Req, Asumsi diperbarui. Observasi field **Nomor Surat BPJS** dicatat & ditandai `[PERLU KONFIRMASI]`. |
| 2.5 (Draft — Revisi pasca-feedback) | 8 Juli 2026 | Team Product | **Nomor Surat BPJS** dikonfirmasi sebagai hasil bridging BPJS (muncul otomatis hanya untuk pasien BPJS, tidak untuk Umum/Asuransi) dan diklasifikasikan **Fase 2 — menunggu integrasi BPJS** (`[**]`). Diperbarui di §3 Out Scope, §12.C, §14, dan dikunci sebagai D-12; pertanyaan terbuka terkait ditutup. |
