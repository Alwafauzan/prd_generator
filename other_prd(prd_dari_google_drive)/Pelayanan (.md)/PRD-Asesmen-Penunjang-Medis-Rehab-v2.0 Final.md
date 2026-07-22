# PRD — Asesmen Penunjang Medis Rehabilitasi Medik (Base/General)

**Related Document:** Draft Konsep Assesmen Fisioterapi (staging v1 RS PKU Muhammadiyah Wonosobo); Draft Mapping Field per Disiplin — Fisioterapi (selesai) · Terapi Wicara & Okupasi Terapi (menyusul via Excel); PRD Rehab Medik / Asesmen Dokter KFR (soft dependency — sumber rujukan program terapi); Referensi V1 Neurovi.
**Dokumen ID:** PRD-PM-RHB-v2.0  ·  **Versi:** 2.4 (Draft — Base/General, pra-mapping Wicara & Okupasi)
**Tanggal Disusun:** 7 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Q3 2026 — Fase 01 `[PERLU KONFIRMASI]`

---

## 1. Overview / Brief Summary

Modul ini mengatur **asesmen penunjang medis di bawah Rehabilitasi Medik**, yaitu asesmen yang diisi oleh terapis untuk tiga disiplin: **Fisioterapi, Terapi Wicara, dan Okupasi Terapi**. Ketiganya berbagi alur, aturan kunjungan, dan struktur layar yang hampir identik; perbedaannya terutama pada **daftar intervensi** dan **field pemeriksaan khas disiplin**. Karena itu PRD ini ditulis sebagai **base/general** yang memuat seluruh perilaku bersama, sedangkan spesifikasi field per disiplin dikelola terpisah lewat **mapping Excel per disiplin**.

Di Neurovi v1, asesmen ini sudah berjalan namun dengan layout lama dan beberapa aturan program kunjungan yang belum tertata di sistem. Pengguna utamanya adalah terapis di klinik rehabilitasi medik pada rumah sakit tipe C/D; pasien lazim mengikuti **program terapi 12 kali kunjungan**, sehingga pola pengisian kunjungan pertama berbeda dari kunjungan lanjutan.

Untuk **Fase 1 (MVP)**, fokusnya adalah menata ulang layar asesmen dan mengunci aturan program kunjungan: penomoran kunjungan otomatis, mode isian kunjungan-1 (lengkap) vs kunjungan lanjutan (ringkas), dan panel Riwayat Terapi yang selaras dengan asesmen rawat jalan lain. Penanganan kasus rawat inap yang membuat nomor kunjungan melampaui 12 disiapkan di requirement namun **belum diaktifkan** `[**]`.

> Referensi: Draft Konsep Assesmen Fisioterapi; Draft Mapping Fisioterapi.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: Draft Konsep Assesmen Fisioterapi (staging):
- Asesmen Fisioterapi/Wicara/Okupasi sudah tersedia dengan struktur Subjektif–Objektif–Asesmen–Planning–Intervensi, termasuk panel Riwayat Terapi per kunjungan.
- Layout masih memakai versi lama dan dinilai belum rapi.
- Aturan "program 12 kali kunjungan" belum dikelola sistem — penomoran kunjungan, pembedaan isian kunjungan-1 vs lanjutan, dan definisi "1 kunjungan selesai" belum tegas.
- Nomor kunjungan belum dihitung otomatis dari riwayat.

**Masalah/pain point:**
- Aspek bisnis proses: satu program terapi terdiri dari banyak kunjungan (lazim 12), tetapi sistem belum membedakan mana kunjungan awal (isi lengkap) dan mana kunjungan lanjutan (cukup intervensi), sehingga terapis berpotensi mengisi ulang bagian yang sama.
- Aspek UX: layout lama menyulitkan pengisian cepat; panel Riwayat Terapi belum seragam dengan asesmen RJ lain sehingga pola navigasi berbeda-beda antar modul.
- Aspek logic system: penomoran kunjungan manual rawan salah; definisi kapan sebuah kunjungan dianggap selesai belum baku.

**Dampak utama yang disasar v2:**
- Pengisian kunjungan lanjutan lebih cepat (hanya Intervensi & Area yang Diterapi) · Penomoran kunjungan konsisten & otomatis · Riwayat Terapi seragam dengan asesmen RJ lain · Layar yang lebih rapi.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = penataan layar asesmen, aturan program kunjungan (penomoran otomatis, mode isian kunjungan-1 vs lanjutan), panel Riwayat Terapi gaya sidenav, dan penerapan untuk tiga disiplin melalui base + mapping field per disiplin.
- **Fase 2** = penanganan kasus rawat inap (nomor kunjungan melampaui 12, aturan reset program baru), serta pelaporan/integrasi lanjutan bila diperlukan. `[**]`

> Volume acuan: RS PKU Muhammadiyah Wonosobo, ~200–400 pasien rawat jalan/hari, mayoritas BPJS.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Layar antrean/worklist pasien terapi** — daftar pasien per disiplin dengan kolom status per layanan (As. [Disiplin], Tindakan, Lab, Radiologi, E-resep, Surat Kontrol, Bayar, Rujuk Internal), penghitung dilayani/belum dilayani/total, dan pagination.
2. **Form asesmen terapi** dengan struktur Subjektif → Objektif → Asesmen → Planning → Intervensi, memuat bagian bersama semua disiplin.
3. **Aturan program kunjungan** — penomoran kunjungan otomatis, mode isian kunjungan-1 (lengkap) vs kunjungan-2 dst (ringkas: Intervensi + Area yang Diterapi), dan definisi "1 kunjungan selesai".
4. **Panel Riwayat Terapi** (tampil-saja) yang diselaraskan dengan pola sidenav Riwayat asesmen rawat jalan lain.
5. **Dropdown Intervensi khusus per disiplin** + kode ICD-9 + Area yang Diterapi. Daftar intervensi & field khas disiplin didefinisikan di mapping per disiplin (Fisioterapi selesai; Terapi Wicara & Okupasi Terapi menyusul via mapping Excel).
6. **Diagnosa Medis & Diagnosa Fungsi** (isian bebas + ICD-10 master data, multi-baris) dan **Program Rencana Terapi**.
7. **Tombol aksi asesmen (shortcut):** Buat Resep, Pilih Penunjang, Buat Surat, Input Tindakan, Simpan. Berfungsi sebagai pintasan ke fitur terkait; perilaku detail dibahas di PRD masing-masing fitur, bukan di modul ini.

### Out Scope
- Asesmen Dokter Rehabilitasi Medik / KFR (Tata Laksana KFR, Program Terapi lintas disiplin) — modul/PRD terpisah; menjadi sumber rujukan program terapi.
- Asesmen Psikologi — PRD terpisah (kemiripan lebih rendah).
- Pola prefix No. Antrian & tampilan/antrean per disiplin — dibahas di PRD Dashboard disiplin terkait (mis. Dashboard Fisioterapi).
- **[Fase 2] `[**]`** Penanganan kasus rawat inap yang membuat nomor kunjungan melampaui 12 sebelum reset (disiapkan di requirement, belum diimplementasikan). Aturan reset program setelah 12 kunjungan sendiri sudah termasuk Fase 1.

## 4. Goals and Metrics

### Tujuan
Menyediakan satu kerangka asesmen penunjang medis rehabilitasi medik yang konsisten untuk tiga disiplin, dengan aturan program kunjungan yang jelas dan pengisian kunjungan lanjutan yang efisien, sekaligus memaksimalkan penggunaan ulang komponen antar disiplin.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Akurasi penomoran kunjungan otomatis | 100% sesuai riwayat | BR-004; NFR-008 |
| Field yang perlu diisi ulang di kunjungan lanjutan | 0 selain Intervensi & Area | BR-003 |
| Reuse komponen antar disiplin | Base tunggal + config per disiplin | BR-010; NFR-011 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Pendaftaran Rawat Jalan | Sumber kehadiran pasien & konteks kunjungan (No. RM, penjamin, klinik/unit). |
| Asesmen Dokter Rehab Medik / KFR | Sumber rujukan program terapi (menetapkan program Fisioterapi/Wicara/Okupasi). Soft dependency. |
| Master Data Diagnosa (ICD-10) | Lookup diagnosa medis & diagnosa fungsi. |
| Master Data Procedure (ICD-9) | Lookup kode tindakan/intervensi. |
| E-Resep / Farmasi | Tujuan aksi "Buat Resep". |
| Penunjang (Lab/Radiologi) | Tujuan aksi "Pilih Penunjang". |
| Billing/Kasir | Status "Bayar" pada worklist. |
| Riwayat Kunjungan (sidenav RJ) | Pola tampilan Riwayat Terapi yang harus diselaraskan. |

Dependency lintas modul: **Master Unit/Klinik**, **Master Staf** (penulis asesmen), **Pendaftaran RJ**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Fisioterapis | Primary | Mengisi asesmen & intervensi Fisioterapi. |
| Terapis Wicara | Primary | Mengisi asesmen & intervensi Terapi Wicara. |
| Okupasi Terapis | Primary | Mengisi asesmen & intervensi Okupasi Terapi. |
| Dokter Rehab Medik (KFR) | Secondary | Menetapkan program terapi (sumber rujukan); tidak mengisi asesmen terapis. |
| Petugas Billing/Kasir | Tersier | Konsumen status "Bayar" di worklist. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Pasien terdaftar dan muncul di worklist klinik terapi terkait.
2. Terapis membuka asesmen, mengisi seluruh bagian (Subjektif–Objektif–Asesmen–Planning–Intervensi) tanpa pembedaan otomatis antara kunjungan awal dan lanjutan.
3. Nomor kunjungan tidak dihitung sistem secara baku; Riwayat Terapi tampil per kunjungan namun dengan pola berbeda dari asesmen RJ lain.
4. Terapis menyimpan. Definisi "kunjungan selesai" belum tegas di sistem v1 (di v2 dibakukan: asesmen terisi + pasien dipulangkan).

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Pasien terdaftar → muncul di worklist disiplin terkait dengan status layanan awal "belum dilayani".
2. Terapis membuka asesmen. Sistem menghitung **nomor kunjungan otomatis** dari riwayat kunjungan terapi pasien pada disiplin tersebut.
3. Bila **kunjungan ke-1**: terapis mengisi asesmen **lengkap** (Anamnesis s.d. Program Rencana Terapi, lalu Intervensi & Area).
4. Bila **kunjungan ke-2 dst**: terapis cukup mengisi **Intervensi & Area yang Diterapi**; bagian asesmen lengkap tidak wajib diulang.
5. Panel **Riwayat Terapi** menampilkan intervensi tiap kunjungan (Intervensi & ICD-9, Area yang diterapi) beserta penulis & waktu, dengan pola sidenav seragam.
6. Terapis menyimpan. Di **dashboard**, status kunjungan **selesai** mengikuti pola asesmen RJ lain (tercentang saat pasien dipulangkan). Namun agar kunjungan **dihitung dalam penomoran**, asesmen harus terisi **dan** pasien dipulangkan; penomoran berikutnya melanjutkan dari kunjungan valid terakhir.
7. Program lazim 12 kunjungan; setelah 12, program baru dimulai dengan **reset nomor ke-1** dan kembali mengisi lengkap (Anamnesis s.d. Program Rencana Terapi). Kasus rawat inap yang membuat nomor melampaui 12 sebelum reset disiapkan namun belum aktif. `[**]`

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Layout | Versi lama, kurang rapi | Ditata ulang, lebih ringkas |
| Isian kunjungan lanjutan | Semua bagian terbuka | Cukup Intervensi & Area yang Diterapi |
| Nomor kunjungan | Belum baku/otomatis | Dihitung otomatis dari riwayat |
| Riwayat Terapi | Pola sendiri | Selaras sidenav Riwayat asesmen RJ lain |
| Definisi kunjungan selesai | Belum tegas | Baku: daftar → asesmen terisi → dipulangkan |
| Cakupan disiplin | Per form terpisah | Base bersama + config per disiplin |

## 7. Main Flow / Mindmap

### Skenario 1 — Kunjungan pertama (alur normal)
1. Pasien terdaftar → muncul di worklist disiplin.
2. Terapis membuka asesmen → sistem menetapkan Kunjungan ke-1.
3. Terapis mengisi Subjektif → Objektif → Asesmen → Planning (Program Rencana Terapi) → Intervensi & Area.
4. Simpan → status layanan "As. [Disiplin]" pada worklist berubah menjadi terisi/dilayani.

### Skenario 2 — Kunjungan lanjutan (ke-2 dst)
1. Pasien terdaftar ulang untuk program yang sama → muncul di worklist.
2. Terapis membuka asesmen → sistem menetapkan Kunjungan ke-n (melanjutkan riwayat).
3. Terapis cukup mengisi **Intervensi & Area yang Diterapi**; bagian lengkap tampil sebagai konteks/riwayat.
4. Simpan → Riwayat Terapi bertambah satu entri (dengan penulis & waktu).

### Skenario 3 — Riwayat & rujukan lintas asesmen
- Terapis membuka panel Riwayat Terapi (sidenav) → memfilter per tanggal/unit → menelusuri intervensi kunjungan sebelumnya.
- Riwayat memakai pola **sidenav yang sama dengan asesmen RJ lain**, dengan fokus menampilkan riwayat terapi (intervensi per kunjungan). Contoh isi riwayat terapi dilampirkan di mapping Excel per disiplin.

### Skenario 4 — Reset program setelah 12 kunjungan (Fase 1)
- Setelah program 12 kunjungan selesai, program baru dimulai → nomor **reset ke-1**.
- Kunjungan ke-1 program baru kembali mengisi **lengkap** (Anamnesis s.d. Program Rencana Terapi), lalu Intervensi & Area.

### Skenario 5 — Kasus rawat inap (Fase 2) `[**]`
- Pasien sedang rawat inap dan sudah di kunjungan ke-11; muncul 2 kunjungan terapi tambahan selama ranap → nomor lanjut hingga ke-13 sebelum reset. `[**]`

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Asesmen penunjang medis rehab (Fisioterapi/Terapi Wicara/Okupasi Terapi) berbasis program kunjungan; satu program lazimnya 12 kali kunjungan. | Draft user (Principal note #2); FR-004 |
| **BR-002** | Kunjungan ke-1 **setiap program** (termasuk program baru setelah reset) wajib mengisi asesmen lengkap (Anamnesis s.d. Program Rencana Terapi) sebelum Intervensi. | Principal note #2; FR-004; US-002 |
| **BR-003** | Kunjungan ke-2 dan seterusnya cukup mengisi Intervensi & Area yang Diterapi; bagian asesmen lengkap tidak wajib diulang. | Principal note #2; FR-004; US-003 |
| **BR-004** | Nomor kunjungan (Kunjungan ke-n) dihitung **otomatis** oleh sistem dari riwayat kunjungan terapi pasien pada disiplin terkait. | Principal note (jawaban user); FR-003 |
| **BR-005** | Agar **dihitung dalam penomoran**, satu kunjungan harus: pasien terdaftar → **asesmen terisi** → **dipulangkan**; penomoran kunjungan berikutnya melanjutkan dari kunjungan valid terakhir. | Principal note #5 (jawaban user); FR-003; FR-012 |
| **BR-006** | Status kunjungan **selesai di dashboard** mengikuti pola asesmen RJ lain: tercentang saat pasien **dipulangkan** (tanpa syarat asesmen terisi). Berbeda dari syarat penomoran (BR-005). | Principal note (jawaban user); FR-001 |
| **BR-007 `[**]`** | **Fase 2:** Pada kasus rawat inap, nomor kunjungan dapat melampaui 12 (mis. hingga 13) bila ada kunjungan terapi tambahan selama ranap sebelum reset. | Principal note #4; FR-011 |
| **BR-008** | Panel Riwayat Terapi menampilkan intervensi per kunjungan (Intervensi & ICD-9, Area yang diterapi) lengkap dengan penulis & waktu input; **hanya tampil, tidak dapat diubah**. | Principal note #3; FR-005 |
| **BR-009** | Riwayat Terapi disajikan mengikuti pola **sidenav Riwayat asesmen RJ lain** (filter tanggal + unit, "Buka Semua", struktur Subjektif/Objektif/Asesmen/Planning). | Principal note #3; FR-005 |
| **BR-010** | Setiap disiplin memakai **daftar Intervensi khusus** miliknya sendiri; daftar intervensi & field khas disiplin didefinisikan pada mapping per disiplin. | Draft user; FR-006 |
| **BR-011** | Setiap Intervensi terhubung ke sebuah kode **ICD-9** yang **dipilih dari master data ICD-9 (procedure)** untuk intervensi tersebut, disertai **Area yang Diterapi**. | Principal note (jawaban user); FR-006 |
| **BR-012** | Diagnosa Medis & Diagnosa Fungsi berupa isian bebas (kiri) + **ICD-10** master data diagnosa (kanan); dapat lebih dari satu baris (tambah/hapus baris). | Draft Konsep (Image 2); FR-007 |
| **BR-013** | Skor Nyeri terdiri dari **Nyeri Diam, Nyeri Tekan, Nyeri Gerak** berupa nilai numerik dengan **skala NRS (0–10)** dan bersifat **opsional**. | Principal note (jawaban user); FR-008 |
| **BR-014 `[ASUMSI]`** | v2 mempertahankan perilaku v1 kecuali ada justifikasi; deviasi Fase 1 terbatas pada penataan layout & aturan program kunjungan yang disebut Principal. | Domain knowledge (v1 baseline) |
| **BR-015** | Pada kunjungan lanjutan (n ≥ 2), **seluruh baris** Intervensi beserta **ICD-9 & Area yang Diterapi terisi otomatis dari kunjungan sebelumnya bila sudah ada**, dan tetap **dapat diubah (editable)**. | Principal note (jawaban user); FR-006 |
| **BR-016** | **Fase 1:** Setelah program 12 kunjungan selesai, program baru dimulai dengan **reset nomor kunjungan ke-1**; kunjungan ke-1 program baru kembali mengisi lengkap (Anamnesis s.d. Program Rencana Terapi). | Principal note (jawaban user); FR-004; BR-002 |

## 9. State Machine — Siklus Kunjungan Terapi

### 9.1 Status Kunjungan
| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Belum Dilayani | tanda "—" pada kolom As. [Disiplin] di worklist | Pasien terdaftar, asesmen belum diisi. |
| Terisi/Dilayani | kolom terisi/ikon aktif | Asesmen kunjungan ini sudah diisi terapis. |
| Selesai (Dipulangkan) | tercentang di dashboard saat pasien dipulangkan (ikut pola asesmen RJ lain) | Status kunjungan selesai **di dashboard** — cukup dipulangkan (BR-006). |

- **Transisi:** Belum Dilayani → Terisi (aksi Simpan) → Selesai (pemulangan) — berbasis aksi user & event pemulangan.

> Catatan: status "selesai" di dashboard (cukup dipulangkan) **berbeda** dari syarat kunjungan **valid untuk penomoran** (asesmen terisi **dan** dipulangkan).

### 9.2 Aturan Penomoran
- Nomor Kunjungan ke-n dihitung otomatis dari kunjungan terapi **valid** pada disiplin & program yang sama (BR-004).
- Sebuah kunjungan **valid untuk penomoran** bila asesmen **terisi dan** pasien **dipulangkan** — berbeda dari status "selesai" di dashboard yang cukup dipulangkan (BR-005, BR-006).
- Kunjungan lanjutan melanjutkan penomoran hingga 12; setelah 12, program baru **reset ke-1** (BR-016).

### 9.3 Reset Program & Kasus Rawat Inap
- **Fase 1:** Setelah program 12 kunjungan selesai, program baru dimulai → nomor **reset ke-1**; kunjungan ke-1 program baru mengisi lengkap kembali (Anamnesis s.d. Program Rencana Terapi) (BR-016).
- **Fase 2 `[**]`:** Pada kasus rawat inap, nomor dapat melampaui 12 sebelum reset (BR-007).

## 10. Tombol Aksi Asesmen — Shortcut

Tombol aksi pada layar asesmen berfungsi sebagai **pintasan** ke fitur terkait. Perilaku detail tiap aksi dibahas di PRD masing-masing fitur, bukan di modul ini.

| Aksi | Fungsi (pintasan ke) | Rule Terkait |
|------|----------------------|--------------|
| **Simpan** | Menyimpan asesmen kunjungan berjalan; menambah entri Riwayat Terapi (penulis + waktu). | BR-005; BR-008 |
| **Buat Resep** | Pembuatan e-resep. | FR-010 |
| **Pilih Penunjang** | Order pemeriksaan penunjang (Lab/Radiologi). | FR-010 |
| **Buat Surat** | Pembuatan surat (mis. kontrol/rujuk). | FR-010 |
| **Input Tindakan** | Input tindakan/prosedur (ICD-9). | FR-010 |

**Kontrol Akses:** aksi tersedia sesuai peran terapis & status kunjungan.

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Worklist pasien terapi** — menampilkan daftar pasien per disiplin dengan kolom No. Antrian, Nama, No. RM, Cara Pembayaran, Klinik, dan status per layanan (As. [Disiplin], Tindakan, Lab, Radiologi, E-resep, Surat Kontrol, Bayar, Rujuk Internal); penghitung dilayani/belum/total; pagination & pilih jumlah per halaman. | US-001; BR-005 |
| **FR-002** | **Form asesmen terstruktur** Subjektif → Objektif → Asesmen → Planning → Intervensi, dengan bagian bersama semua disiplin dan slot field khas disiplin. | US-002; BR-010 |
| **FR-003** | **Penomoran kunjungan otomatis** — sistem menetapkan Kunjungan ke-n dari riwayat kunjungan terapi pada disiplin & program terkait. | US-002; BR-004; BR-005 |
| **FR-004** | **Mode isian per kunjungan** — kunjungan ke-1 mengisi asesmen lengkap; kunjungan ke-2 dst cukup Intervensi & Area yang Diterapi. | US-002; US-003; BR-002; BR-003 |
| **FR-005** | **Panel Riwayat Terapi (tampil-saja)** gaya sidenav — filter tanggal & unit, struktur Subjektif/Objektif/Asesmen/Planning, menampilkan intervensi per kunjungan + penulis & waktu. | US-004; BR-008; BR-009 |
| **FR-006** | **Intervensi khusus per disiplin** — dropdown daftar intervensi milik disiplin + kode ICD-9 (pilih dari master data ICD-9) + Area yang Diterapi (dapat lebih dari satu baris). Pada kunjungan lanjutan, **seluruh baris** terisi otomatis dari kunjungan sebelumnya bila ada & dapat diubah. | US-003; BR-010; BR-011; BR-015 |
| **FR-007** | **Diagnosa Medis & Diagnosa Fungsi** — isian bebas (kiri) + ICD-10 master data (kanan), multi-baris (tambah/hapus). | US-002; BR-012 |
| **FR-008** | **Skor Nyeri** — input Nyeri Diam, Nyeri Tekan, Nyeri Gerak (numerik). | US-002; BR-013 |
| **FR-009** | **Hasil Penunjang Lainnya** — dropdown Jenis Pemeriksaan + unggah file (JPG/PNG/PDF, maks 10 MB) + Keterangan. | US-002; BR-012 |
| **FR-010** | **Tombol aksi asesmen** — Buat Resep, Pilih Penunjang, Buat Surat, Input Tindakan, Simpan. | US-002; BR-006 |
| **FR-011 `[**]`** | **Fase 2** — penanganan nomor kunjungan melampaui 12 pada kasus rawat inap & reset saat program baru. | BR-007 |
| **FR-012** | **Validasi kunjungan selesai** — asesmen wajib terisi sebelum pasien dipulangkan; penomoran berikutnya melanjutkan riwayat. | US-005; BR-005; BR-006 |

## 12. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **terapis**, saya ingin **melihat daftar pasien yang perlu diasesmen di klinik saya beserta status layanannya**, sehingga **saya tahu siapa yang belum dilayani**. | 1) Given saya membuka worklist, When ada pasien terdaftar, Then daftar tampil dengan status per layanan & penghitung dilayani/belum/total (FR-001). 2) Given pasien banyak, When melebihi 1 halaman, Then pagination & pilih jumlah per halaman tersedia. | FR-001 |
| **US-002** | Sebagai **terapis**, saya ingin **mengisi asesmen lengkap pada kunjungan pertama pasien**, sehingga **rencana terapi terekam sejak awal program**. | 1) Given kunjungan ke-1, When saya membuka asesmen, Then seluruh bagian (Anamnesis s.d. Program Rencana Terapi + Intervensi) dapat diisi (BR-002). 2) Given saya menyimpan, When asesmen valid, Then entri Riwayat Terapi terbentuk dengan penulis & waktu (BR-008). | FR-002; FR-003; FR-004; FR-007; FR-008; BR-002 |
| **US-003** | Sebagai **terapis**, saya ingin **mengisi hanya intervensi & area pada kunjungan lanjutan**, sehingga **saya tidak perlu mengulang asesmen yang sama**. | 1) Given kunjungan ke-2 dst, When saya membuka asesmen, Then cukup Intervensi & Area yang Diterapi yang wajib diisi (BR-003). 2) Given intervensi dipilih, When saya menyimpan, Then Riwayat Terapi bertambah satu entri. | FR-004; FR-006; BR-003 |
| **US-004** | Sebagai **terapis**, saya ingin **menelusuri riwayat terapi pasien dengan pola yang seragam**, sehingga **navigasinya sama seperti asesmen RJ lain**. | 1) Given panel Riwayat Terapi, When saya memfilter tanggal/unit, Then daftar kunjungan terfilter tampil tampil-saja (BR-008, BR-009). | FR-005; BR-009 |
| **US-005** | Sebagai **terapis**, saya ingin **sistem memastikan asesmen terisi sebelum pasien dipulangkan**, sehingga **penomoran kunjungan tetap akurat**. | 1) Given pasien akan dipulangkan, When asesmen belum terisi, Then sistem menahan/mengingatkan (BR-006). 2) Given kunjungan selesai, When pasien datang lagi, Then nomor kunjungan melanjutkan riwayat (BR-005). | FR-012; BR-005; BR-006 |
| **US-006** | Sebagai **fisioterapis/terapis wicara/okupasi terapis**, saya ingin **daftar intervensi sesuai disiplin saya**, sehingga **pilihan intervensi relevan**. | 1) Given saya di disiplin tertentu, When membuka dropdown Intervensi, Then hanya intervensi disiplin itu tampil (BR-010). 2) Given intervensi dipilih, When tersimpan, Then kode ICD-9 & Area yang Diterapi tercatat (BR-011). | FR-006; BR-010; BR-011 |

## 13. Data Requirements (Spesifikasi Field)

> **Spesifikasi field asesmen per disiplin bersifat otoritatif di mapping Excel per disiplin** (Fisioterapi: `Draft_Mapping_Fisioterapi.xlsx`; Terapi Wicara & Okupasi Terapi menyusul). PRD base ini **tidak** memuat tabel field asesmen — cukup mendokumentasikan data lintas-field yang **bersama**: layar worklist dan data yang dibuat sistem saat simpan.
> Catatan: badan asesmen (Data Penunjang, Pemeriksaan Umum, Pemeriksaan Khusus/Pengukuran) serta keberadaan sejumlah field (mis. Skor Nyeri, Kemampuan Fungsional) **berbeda per disiplin** — lihat Excel masing-masing. Field demografi & penjamin di worklist tetap **reuse definisi kanonik dari Pendaftaran RJ (B1)**.

### A. Layar TAMPIL — Worklist Pasien Terapi (FR-001)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. Antrian | antrean.no | text (mis. FS-001) | urut antrean | Pola prefix per disiplin dibahas di PRD Dashboard disiplin terkait |
| Nama | pasien.nama | text | — | Reuse kanonik B1 |
| No. RM | pasien.no_rm | text | cari | Reuse kanonik B1 |
| Cara Pembayaran | pendaftaran.penjamin | text/badge | filter | mis. BPJS PBI/Non PBI, Umum |
| Klinik | unit.nama | text | filter | Klinik disiplin + nama tenaga |
| As. [Disiplin] | asesmen.status | ikon/"—" | — | Belum vs terisi (State 9.1) |
| Tindakan | tindakan.status | ikon/"—" | — | — |
| Lab · Radiologi · E-resep · Surat Kontrol · Bayar · Rujuk Internal | modul terkait | ikon/"—" | — | Status per layanan |

### B. Data TER-GENERATE saat Simpan (FR-003, FR-005, FR-012)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| kunjungan_ke | Kunjungan ke-n | numerik | dibuat otomatis dari riwayat kunjungan terapi | BR-004; BR-005 |
| penulis | Penulis Asesmen | text | dari Master Staf (user login) | BR-008 (Riwayat) |
| waktu_input | Waktu Input | datetime | dibuat otomatis oleh sistem | BR-008 |
| status_kunjungan | Status Kunjungan | enum | Belum Dilayani / Terisi / Selesai | State 9.1 |

## 14. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Worklist tetap responsif pada beban klinik terapi harian. | §4 |
| **NFR-002** | Ergonomi UI | Layout asesmen ditata ulang agar pengisian cepat; mengurangi beban visual v1. | Principal note #1 |
| **NFR-003** | Konsistensi | Panel Riwayat Terapi seragam dengan pola sidenav Riwayat asesmen RJ lain. | BR-009 |
| **NFR-004** | Auditabilitas | Setiap entri Riwayat Terapi mencatat penulis & waktu input, tidak dapat diubah. | BR-008 |
| **NFR-005** | Keamanan/RBAC | Akses asesmen & intervensi dibatasi per peran/disiplin terapis. | Persona §5B |
| **NFR-006** | Konfigurabilitas | Daftar Intervensi & field khas disiplin dapat dikonfigurasi per disiplin tanpa mengubah alur base. | BR-010 |
| **NFR-007** | Reliabilitas | Aturan "kunjungan selesai" & validasi asesmen terisi konsisten sebelum pemulangan. | BR-006 |
| **NFR-008** | Konsistensi Data | Penomoran kunjungan otomatis akurat 100% mengikuti riwayat; tidak ada nomor ganda/loncat tak sengaja. | BR-004; BR-005 |

## 15. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| Master Data Diagnosa (ICD-10) | Lookup diagnosa medis & fungsi. | Internal | FR-007 |
| Master Data Procedure (ICD-9) | Lookup kode intervensi/tindakan. | Internal | FR-006 |
| Master Unit/Klinik & Master Staf | Sumber unit, penulis asesmen. | Internal | FR-005; §13C |
| SATUSEHAT/FHIR | Pelaporan asesmen/tindakan. | `[**]` Fase 2 `[PERLU KONFIRMASI]` | — |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Pendaftaran RJ | Hard | Tanpa kehadiran/registrasi, pasien tidak muncul di worklist. |
| Asesmen Dokter Rehab Medik / KFR | Soft | Program terapi belum terujuk; asesmen tetap dapat diisi manual. `[PERLU KONFIRMASI]` |
| Mapping field per disiplin (Wicara & Okupasi) | Hard (untuk kedua disiplin itu) | Base tak dapat di-instansiasi penuh untuk disiplin yang field-nya belum dipetakan. |

## 16. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Arsitektur PRD tiga disiplin | 1 PRD base/general + mapping field per disiplin (bukan 3 PRD terpisah). |
| D-02 | Pola isian program kunjungan | Kunjungan ke-1 lengkap; ke-2 dst cukup Intervensi & Area (BR-002, BR-003). |
| D-03 | Penomoran kunjungan | Dihitung otomatis dari riwayat (BR-004). |
| D-04 | Definisi "1 kunjungan" | Daftar → asesmen terisi → dipulangkan; nomor lanjut dari terakhir (BR-005). |
| D-05 | Riwayat Terapi | Dipertahankan, diselaraskan pola sidenav Riwayat asesmen RJ lain (BR-009). |
| D-06 | Kemampuan Fungsional | 6 opsi tetap (Tidur/Bedrest/Gendong … Resiko Jatuh). |
| D-07 | Jenis Pemeriksaan | Single dropdown, 16 opsi (mengikuti mapping existing). |
| D-08 | Diagnosa Medis | Kiri free text, kanan ICD-10 master data (BR-012). |
| D-09 | Skor Nyeri | Numerik, skala **NRS (0–10)**, opsional (BR-013). |
| D-10 | ICD-9 Intervensi | Dipilih dari master data ICD-9 (procedure) untuk intervensi terkait (BR-011). |
| D-11 | Autofill Intervensi | Kunjungan lanjutan (K≥2) mengisi otomatis **seluruh baris** Intervensi/ICD-9/Area dari kunjungan sebelumnya bila ada; editable (BR-015). |
| D-12 | Kunjungan selesai — dashboard vs penomoran | Dashboard: selesai saat pasien dipulangkan (ikut asesmen RJ lain, BR-006). Penomoran: hanya dihitung bila asesmen terisi + dipulangkan (BR-005). |
| D-13 | Reset program | Reset ke-1 setelah 12 kunjungan & isi lengkap kembali = **Fase 1** (BR-016). Hanya kasus rawat inap (nomor >12 sebelum reset) yang **Fase 2** (BR-007). |
| D-14 | Tombol aksi asesmen | Berfungsi sebagai shortcut ke fitur terkait; perilaku detail dibahas di PRD fitur masing-masing (§10). |

## 17. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Penataan layar asesmen; aturan program kunjungan (penomoran otomatis, mode K-1 vs lanjutan, **reset program setelah 12 kunjungan**); panel Riwayat Terapi gaya sidenav; base + mapping Fisioterapi; worklist. |
| **Fase 2** `[**]` | Kasus rawat inap (nomor >12 sebelum reset); pelaporan/integrasi SATUSEHAT bila diperlukan; penerapan Terapi Wicara & Okupasi setelah mapping-nya lengkap. |

## 18. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Penomoran kunjungan otomatis salah pada kasus batas (registrasi ganda, batal). | Uji aturan BR-004/BR-005 dengan skenario batas; kunci definisi "kunjungan selesai" sebelum implementasi. |
| R2 | Field Wicara & Okupasi berbeda jauh dari Fisioterapi sehingga varian menebal. | Diff mapping Wicara/Okupasi vs Fisioterapi lebih dulu untuk memastikan pola base + varian tetap layak. |
| R3 | Kasus rawat inap (Fase 2) memengaruhi penomoran bila tak disiapkan sejak awal. | Requirement BR-007 ditulis sekarang meski belum diimplementasikan. |

## 19. Asumsi
- `[ASUMSI]` v2 mempertahankan perilaku v1 kecuali untuk penataan layout & aturan program kunjungan yang disebut Principal (BR-014).
- `[ASUMSI]` Bagian Subjektif (Anamnesis, Data Penunjang), vital sign, Skor Nyeri, Kemampuan Fungsional, Diagnosa, Program Rencana, dan struktur Intervensi bersifat **bersama** ketiga disiplin; yang berbeda adalah daftar intervensi & blok pemeriksaan khas disiplin. Perlu divalidasi saat mapping Wicara & Okupasi.
- `[ASUMSI]` Worklist mengikuti perilaku v1 kecuali dinyatakan lain. Tombol aksi bersifat shortcut (detail di PRD fitur masing-masing).

## 20. Pertanyaan Terbuka
- `[PERLU KONFIRMASI]` Kebutuhan integrasi SATUSEHAT/FHIR di Fase 2 (perlu atau tidak). `[**]`
- `[PERLU KONFIRMASI]` Perilaku bila program terapi belum terujuk dari Asesmen Dokter KFR (dependency soft) — apakah asesmen tetap diisi manual.
- `[PERLU KONFIRMASI]` Target Release final (Q3 2026 — Fase 01) masih tentatif.

> Catatan: field & daftar intervensi khas **Terapi Wicara** dan **Okupasi Terapi** bukan pertanyaan terbuka, melainkan tugas mapping — ditangani via mapping Excel per disiplin.

## 21. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| v2.0 | 7 Juli 2026 | Team Product | Draft base/general awal untuk asesmen penunjang medis rehab (Fisioterapi/Wicara/Okupasi); menyerap 5 note Principal, mapping Fisioterapi, dan keputusan arsitektur base + mapping per disiplin. |
| v2.1 | 7 Juli 2026 | Team Product | Skor Nyeri dikunci opsional (D-09); ICD-9 Intervensi = pilih dari master data ICD-9 (D-10, BR-011); tambah BR-015 autofill Intervensi/ICD-9/Area dari kunjungan sebelumnya (D-11, FR-006). Propagasi ke Data Req §13B, Keputusan Desain, & Open Questions. |
| v2.2 | 7 Juli 2026 | Team Product | Koreksi: reset program setelah 12 kunjungan = **Fase 1** (BR-016, D-13); hanya kasus ranap nomor >12 yang Fase 2 (BR-007). Bedakan status selesai dashboard (dipulangkan) vs syarat penomoran (terisi + dipulangkan) — BR-005/BR-006/D-12, §9. Tombol aksi jadi shortcut tanpa detail (§10, D-14). Riwayat Terapi: sidenav sama dgn RJ lain, contoh isi di mapping Excel. Hapus tag konfirmasi tombol aksi, pemicu reset, cakupan Riwayat, encoding selesai. Skenario dipecah (4: reset Fase 1; 5: ranap Fase 2). |
| v2.3 | 7 Juli 2026 | Team Product | Tutup 5 open item: Skor Nyeri = skala **NRS (0–10)**, opsional (BR-013, D-09); autofill Intervensi = **seluruh baris** kunjungan sebelumnya, editable (BR-015, FR-006, D-11, §13B). Prefix No. Antrian → PRD Dashboard (Out Scope, §13A). Target performa & volume worklist dihapus (NFR-001 disederhanakan, metrik dihapus). Wicara/Okupasi = tugas mapping Excel (bukan open question). §20 disisakan 3 open item genuine (SATUSEHAT Fase 2, dependency KFR, target release). |
| v2.4 | 7 Juli 2026 | Team Product | §13 dirampingkan: tabel field INPUT (§13B) dihapus — spesifikasi field asesmen per disiplin sepenuhnya otoritatif di Excel per disiplin (dikuatkan bukti field Terapi Wicara beda tebal dari Fisioterapi). Sisa §13: intro delegasi ke Excel, A. Worklist, B. Data ter-generate (renumber dari C). Flow/rules/BR/FR tidak berubah. |
