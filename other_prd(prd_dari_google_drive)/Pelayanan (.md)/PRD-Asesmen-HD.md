# PRD — Asesmen Hemodialisa

**Related Document:** Mapping Field Asesmen Hemodialisa (sheet: tab `HD` & `Pengkajian Awal HD`); PRD Asesmen Dokter IGD (acuan pola asesmen dokter & pengkodean ICD); PRD Transfer Internal (hard dependency — task terpisah); PRD SPRI (hard dependency — task terpisah); Referensi V1: Neurovi v1 RS PKU Muhammadiyah Wonosobo
**Dokumen ID:** PRD-E-ASD-HD-v2.0  ·  **Versi:** 2.7 (Draft — Revisi pasca-feedback)
**Tanggal Disusun:** 07-07-2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Q3 2026 — Fase 01

## 1. Overview / Brief Summary

Modul Asesmen Hemodialisa adalah form terintegrasi tempat **perawat dan dokter** mendokumentasikan asesmen medis pasien hemodialisa dalam satu alur bermuatan **SOAP** (Subjektif, Objektif, Asesmen, Planning) yang ditutup dengan penetapan **Status Pulang** pasien. Form ini dipakai pada pelayanan Hemodialisa; section perawat mencatat keluhan, pemeriksaan fisik per regio, tanda vital & data berat badan HD, skrining (nyeri, risiko jatuh, gizi), riwayat psikososial, kemampuan ibadah, diagnosa & intervensi keperawatan, sementara section dokter menegakkan diagnosis (ICD‑10) dan tindakan (ICD‑9), menyusun planning dan **resep HD** (durasi, QB, QD, UF Goal, heparinisasi, dialisat, program profiling), serta menetapkan **Status Pulang** pasien.

Di **Neurovi v1** (RS PKU Muhammadiyah Wonosobo), form asesmen HD sudah tersedia dengan **3 tab**: **Riwayat Asesmen HD**, **Pengkajian Awal HD**, dan **Asesmen HD** (perawat & dokter) — ketiganya dicakup dalam dokumen ini. Namun v1 hanya menampilkan info *last updated* tanpa histori perubahan, layoutnya banyak *white space* sehingga menuntut scrolling berulang, dan tampilan read‑only masih memunculkan seluruh opsi (bukan hanya nilai terisi).

**Lingkup Fase 1 (MVP)** menegaskan penyempurnaan dokumentasi SOAP lengkap, pencatatan diagnosa **ICD‑10 (tunggal)** & tindakan ICD‑9, penambahan **riwayat perubahan (change history) + audit trail**, perbaikan **layout & responsivitas** (PC dan tablet, tanpa tombol terpotong), **read‑only ringkas**, tab **Riwayat Asesmen HD** dengan aksi **Salin**, serta shortcut modul termasuk **I‑Care BPJS** (khusus dokter). Beberapa kapabilitas terkait berada **di luar lingkup modul ini** dan ditangani sebagai **related feature** pada task/modul masing‑masing: integrasi **Transfer Internal** & **SPRI**, **pemisahan ICD‑10 WHO/IM**, dan **bridging SATUSEHAT**.

> Referensi: mapping field pada sheet tab `HD` & `Pengkajian Awal HD`; PRD Asesmen Dokter IGD untuk pola ICD.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — Referensi V1 RS PKU Wonosobo:
- Form asesmen HD sudah ada dan dipakai perawat serta dokter, mencakup pengkajian awal dan asesmen perawat/dokter.
- Perubahan data hanya ditampilkan sebagai **info *last updated*** — tidak ada histori siapa mengubah apa dan kapan.
- Layout memiliki **banyak *white space*** sehingga pengisian menuntut scrolling berkali‑kali.
- Tampilan **read‑only menampilkan seluruh opsi** (bukan hanya nilai terisi), memakan ruang dan menyulitkan user lain membaca cepat.
- Risiko **tombol aksi tertutup/terpotong** saat resolusi mengecil (tablet).

**Masalah/pain point:**
- Aspek bisnis proses: pemisahan ICD‑10 **WHO** (SATUSEHAT & grouping INA‑CBG) vs **IM** (grouping IDRG pada eKlaim) **tidak masuk lingkup modul ini** — Fase 1 memakai **ICD‑10 tunggal**; pemisahan menjadi *related feature* pada task Master Data Diagnosa/eKlaim.
- Aspek UX: tidak ada histori perubahan; *white space* & scrolling berlebih; read‑only bertele‑tele; risiko tombol terpotong di tablet; konten *text area* berisiko terpotong.
- Aspek logic system: perubahan data belum tersimpan sebagai log/histori; potensi *caching* memberatkan browser karena form dibuka‑tutup >1x per pasien.

**Dampak utama yang disasar v2:**
- Dokumentasi asesmen HD lengkap & tertelusur (change history + audit trail) · pengisian lebih cepat pada PC & tablet tanpa scrolling/tombol terpotong.

**Strategi rilis:**
- **Fase 1 (MVP)** = dokumentasi SOAP perawat & dokter, Status Pulang, ICD‑10 (tunggal) & ICD‑9, change history + audit trail, tab Riwayat Asesmen HD + aksi Salin, shortcut modul termasuk I‑Care BPJS (dokter), perbaikan layout & responsivitas, read‑only ringkas.
- **Di luar lingkup modul (related feature, task terpisah)** = integrasi aktif **Transfer Internal** & **SPRI**, **pemisahan ICD‑10 WHO/IM**, **bridging SATUSEHAT**.

> Perilaku volume: pasien HD dapat berkunjung **2–3 kali per pekan**, sehingga data kunjungan & asesmen berpotensi sangat banyak; sistem harus tetap ringan diakses. Volume target **±50–60 pasien/hari**.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Modul Asesmen Hemodialisa** pada pelayanan Hemodialisa — **tab Pengkajian Awal HD** (form penuh), **tab Asesmen HD** (section Perawat & Dokter dalam struktur SOAP), dan **tab Riwayat Asesmen HD**; penetapan **Status Pulang** di section Dokter.
2. **Change history** asesmen perawat dan dokter beserta detail **user, waktu (DD‑MM‑YYYY HH:MM), dan isi perubahan**.
3. **Perbaikan layout** — pengurangan *white space* dan kebutuhan scrolling berulang saat pengisian.
4. **Perbaikan read‑only** — hanya menampilkan nilai/opsi yang terisi (bukan seluruh opsi).
5. **Responsivitas PC & tablet** — memastikan tidak ada tombol tertutup/terpotong.
6. **Audit trail** — penyimpanan log perubahan data pada backend setiap simpan/ubah.
7. **Pencatatan diagnosa ICD‑10 (tunggal)** & tindakan **ICD‑9** pada section dokter.
8. **Tab Riwayat Asesmen HD** dengan aksi **Salin Pengkajian Awal** & **Salin Asesmen HD** — berpindah ke tab tujuan dan **auto‑replace** data.
9. **Shortcut modul** di tiap tab untuk role **perawat & dokter**; **I‑Care BPJS** khusus dokter (terhubung ke fitur integrasi BPJS I‑Care).

### Out Scope
- **Flow internal** Transfer Internal & SPRI — hanya titik integrasi keluaran disiapkan; alur penuh ada di PRD/task masing‑masing (hard dependency).
- **Related feature (task/modul terpisah, di luar lingkup):** alur internal Transfer Internal & SPRI, pemisahan ICD‑10 WHO/IM, bridging SATUSEHAT.

## 4. Goals and Metrics

### Tujuan
Perawat dan dokter dapat mendokumentasikan asesmen medis pasien hemodialisa (subjektif, objektif, asesmen, planning, status pulang) dalam **satu form terintegrasi**, dengan diagnosis/tindakan berkode, planning terapi HD, penetapan **Status Pulang** oleh dokter, dan **riwayat perubahan yang tertelusur** — cepat diisi di PC maupun tablet.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu buka form asesmen HD | < 1 detik | NFR‑001 |
| Waktu simpan / update asesmen HD | < 1 detik | NFR‑001 |
| Volume harian tanpa penurunan performa | ±50–60 pasien/hari | NFR‑002 |
| Kelengkapan penyimpanan change history & audit trail | 100% setiap simpan/ubah | NFR‑004 |
| Tampilan utuh (tanpa tombol terpotong) pada breakpoint PC & tablet | 100% pada breakpoint yang ditetapkan | NFR‑005 · `[PERLU KONFIRMASI]` nilai breakpoint |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| **Master Data Diagnosa** | Source field kode **ICD‑10** pada asesmen HD (dokter). | 
| **Master Data Prosedur** | Source field kode **ICD‑9** pada asesmen HD (dokter). |
| **Master Data Staf** | Source petugas perawat (akses & penanggung jawab) dan dokter. |
| **Transfer Internal** | Konsumen — data asesmen HD menjadi sumber form Transfer Internal (**related feature**, task terpisah, di luar lingkup). |
| **SPRI** | Konsumen — data asesmen HD menjadi sumber SPRI (**related feature**, task terpisah, di luar lingkup). |
| **BPJS I‑Care** | Shortcut **I‑Care BPJS** (khusus dokter) tersedia di Fase 1; terhubung ke fitur **integrasi BPJS I‑Care** (related feature). |
| **Pemisahan ICD‑10 WHO/IM** | Diagnosa dipisah WHO (SATUSEHAT/INA‑CBG) + IM (IDRG) — **di luar lingkup modul ini**, menjadi related feature (Master Data Diagnosa/eKlaim). |
| **SATUSEHAT** | Pengiriman diagnosis — **di luar lingkup modul ini**, related feature (task terpisah). |

Dependency lintas modul: **Master Data Diagnosa**, **Master Data Prosedur**, **Master Data Staf**, **Pendaftaran** (agama pasien → memicu section Kemampuan Ibadah).

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Perawat HD | Primary | Mengisi section Subjektif, Objektif, diagnosa & intervensi keperawatan, petugas. |
| Dokter HD (DPJP) | Primary | Menegakkan diagnosis (ICD‑10) & tindakan (ICD‑9), planning & resep HD, **Status Pulang**, I‑Care BPJS. |
| Role lain (mis. verifikator, admin, farmasi) | Tersier | Membaca asesmen (read‑only ringkas) & menelusuri change history. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Perawat membuka form asesmen HD pasien, mengisi pengkajian & asesmen keperawatan, menyimpan.
2. Dokter membuka form yang sama, mengisi asesmen dokter, diagnosis, planning & resep HD, menyimpan.
3. Sistem menampilkan **info *last updated*** pada form; perubahan sebelumnya tidak terekam sebagai histori.
4. Tampilan read‑only menampilkan seluruh field/opsi. `[ASUMSI: pola dari perilaku v1 pada referensi RS PKU Wonosobo]`
5. Tab **Riwayat Asesmen HD** sudah ada untuk melihat riwayat asesmen pasien.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Pada **inisiasi/awal program HD**, di tab **Pengkajian Awal HD** user mengisi riwayat penyakit, riwayat dialisis/transplantasi, pemeriksaan fisik per regio, tanda vital, pemeriksaan penunjang, hasil lab penunjang, dan diagnosis etiologi GGT.
2. Perawat membuka form Asesmen HD; sistem menampilkan atribusi **"diisi oleh [user login] pada [DD‑MM‑YYYY HH:MM]"** per section.
3. Perawat mengisi **S** (Keluhan Utama, Riwayat Psikososial), **O** (Pemeriksaan Fisik, Berat Badan HD, Pengkajian Nyeri, Risiko Jatuh, Skrining Gizi, Kemampuan Ibadah), **A** (Diagnosa Keperawatan), **P** (Intervensi), petugas.
4. Dokter mengisi **S/O** (keluhan, pemeriksaan fisik & penunjang), **A** (Diagnosa + ICD‑10), **P** (Planning + ICD‑9, Resep HD).
5. Dokter menetapkan **Status Pulang** pasien pada section Asesmen Dokter.
6. Setiap simpan mencatat **user, waktu, dan isi perubahan** ke **change history** & **log audit**.
7. Tampilan read‑only hanya memunculkan **nilai terisi**; layout responsif tanpa scrolling/tombol terpotong.
8. Dari tab **Riwayat Asesmen HD**, user menekan **Salin Pengkajian Awal** atau **Salin Asesmen HD** → sistem berpindah ke tab tujuan dan **meng‑auto‑replace** data pada tab tersebut.
9. Data asesmen menjadi sumber untuk **Transfer Internal** & **SPRI** (related feature, task terpisah).

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Histori perubahan | Hanya *last updated* | Change history penuh (user, waktu, isi perubahan) + audit trail |
| Layout | Banyak *white space*, scrolling berulang | Rapat, hemat scrolling, responsif PC & tablet |
| Read‑only | Menampilkan seluruh opsi | Hanya menampilkan nilai terisi |
| Text area | Konten berisiko terpotong | Auto‑height, konten tampil penuh tanpa scroll per‑area |
| Tambah row diagnosa/tindakan | — (dipertahankan) | Tombol **Enter** menambah row (behavior lama dipertahankan) |

## 7. Main Flow / Mindmap

### Skenario 1 — Asesmen perawat lalu dokter (alur normal)
1. Perawat buka form → isi S/O/A/P keperawatan → tetapkan petugas → Simpan.
2. Dokter buka form yang sama → isi keluhan/pemeriksaan → tegakkan Diagnosa + ICD‑10 → susun Planning + Rencana Pelayanan + ICD‑9 → isi Resep HD → Simpan.
3. Sistem mencatat change history + audit trail pada tiap simpan.

### Skenario 2 — Pasien muslim vs non‑muslim (percabangan section)
- Bila **agama = Islam** (dari Pendaftaran) → section **Asesmen Kemampuan Ibadah** tampil. Bila non‑muslim → section tidak tampil/tidak wajib diisi.

### Skenario 3 — Pengkajian Nyeri kondisional
- **Nyeri = Ya** → tampil field **Intensitas (1–10 + Akut/Kronik)**, **Lokasi**, **Time**, **Durasi (menit)**. **Nyeri = Tidak** (default) → field lanjutan tidak tampil.

### Skenario 4 — Penetapan Status Pulang
- Dokter memilih **Status Pulang** (dropdown *single select*): Rawat Inap / Pulang / Pulang Paksa / Rujuk Internal / Rujuk Eksternal / Meninggal. Field **opsional** (tidak wajib sebelum simpan). Nilai menjadi rujukan untuk related feature Transfer Internal / SPRI (task terpisah).

### Skenario 5 — Menambah row Diagnosa/Tindakan cepat
- Saat mengisi Diagnosa/Rencana Pelayanan, menekan **Enter** menambah row baru; row dapat di‑*drag‑reorder* dan dihapus.

### Skenario 6 — Salin dari Riwayat Asesmen HD
- Di tab **Riwayat Asesmen HD**, user menekan **Salin Pengkajian Awal** → sistem berpindah ke tab Pengkajian Awal HD dan data ter‑*auto‑replace*; atau **Salin Asesmen HD** → berpindah ke tab Asesmen HD dan data ter‑*auto‑replace*.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Setiap penyimpanan/perubahan asesmen **wajib** mencatat `user`, `waktu (DD‑MM‑YYYY HH:MM)`, dan isi perubahan ke change history & log audit. | FR‑010; US‑008; NFR‑004 |
| **BR-002** | **ICD‑10 (tunggal) wajib** diisi saat menegakkan diagnosa; dipilih dari Master Data Diagnosa. | FR‑006; US‑009 |
| **BR-003** | Pemisahan ICD‑10 **WHO** (SATUSEHAT & grouping INA‑CBG) + **IM** (grouping IDRG pada eKlaim) **di luar lingkup modul ini** — menjadi *related feature* pada task Master Data Diagnosa/eKlaim; Fase 1 memakai ICD‑10 tunggal. | Related Feature |
| **BR-004** | Section **Asesmen Kemampuan Ibadah** hanya tampil bila `agama = Islam` pada Pendaftaran. | FR‑003; Sheet `HD` |
| **BR-005** | Field lanjutan **Pengkajian Nyeri** hanya tampil bila `Nyeri = Ya`; default `Nyeri = Tidak`. | FR‑003; Sheet `HD` |
| **BR-006** | **Kesimpulan Risiko Jatuh** dan **Kesimpulan Skrining Gizi** dihitung otomatis oleh sistem dari skor item, bersifat **hanya tampil, tidak dapat diubah**. | FR‑004; Sheet `HD` |
| **BR-007** | Kesimpulan Skrining Gizi: **≤ 1 = tidak berisiko malnutrisi**, **≥ 2 = berisiko malnutrisi** (dari jumlah skor Penurunan Berat Badan + Asupan Makan Berkurang). | Sheet `HD` |
| **BR-008** | Tampilan **read‑only** hanya menampilkan field/opsi yang **terisi**; opsi yang tidak dipilih tidak ditampilkan. | FR‑009; US‑007 |
| **BR-009** | Menambah row Diagnosa/Rencana Pelayanan dapat menggunakan tombol **+**; row dapat dihapus. | FR‑007; US‑009 |
| **BR-010** | Field bertipe *text area* wajib **auto‑height** mengikuti panjang konten — konten tidak boleh terpotong/menuntut scroll per‑area. | FR‑008; NFR‑006 |
| **BR-011** | Field opsional yang tidak diisi disimpan sebagai **Default**.  | Data Requirements; D‑07 |
| **BR-012** | Keluaran asesmen HD (mis. diagnosa, **Status Pulang**) menjadi sumber untuk **Transfer Internal** & **SPRI** (**related feature**, task terpisah, di luar lingkup). | Related Feature |
| **BR-013** | **Status Pulang** adalah field **dropdown single select** pada section **Asesmen Dokter**, bersifat **opsional** (tidak wajib sebelum simpan); nilai: Rawat Inap / Pulang / Pulang Paksa / Rujuk Internal / Rujuk Eksternal / Meninggal. | FR‑012; §9 |
| **BR-014** | Tab **Riwayat Asesmen HD** menyediakan **Salin Pengkajian Awal** & **Salin Asesmen HD**; memilih salah satu **berpindah ke tab tujuan** dan **meng‑auto‑replace** seluruh data pada tab tersebut. | FR‑015; US‑013 |
| **BR-015** | Shortcut modul tampil di **tiap tab** (Riwayat Asesmen HD, Pengkajian Awal HD, Asesmen HD) hanya untuk role **perawat & dokter**; **I‑Care BPJS** hanya untuk **dokter**. | FR‑013; §10 |
| **BR-016** | **Pengkajian Awal HD** diisi pada tab tersendiri. Field wajib: **Berat Badan, Tinggi Badan, Tekanan Darah, Suhu, Nadi, Nafas (+Jenis), dan Deskripsi Diagnosis Etiologi GGT**; sisanya opsional. Tanggal pemeriksaan penunjang boleh **back‑date & post‑date**. | FR‑016; US‑014 |

<!-- OPSIONAL — sisipkan di sini bila modul punya status kompleks. Nomori ulang section setelahnya. -->

## 9. Status Pulang

**Status Pulang** adalah field tunggal **dropdown *single select*** pada section **Asesmen Dokter**, dipilih dokter untuk menandai disposisi keluar pasien. Field bersifat **opsional** (tidak wajib sebelum simpan). Nilai menjadi rujukan untuk related feature Transfer Internal / SPRI (task terpisah).

| Pilihan | Makna | Keterangan |
|---------|-------|------------|
| **Rawat Inap** | Pasien dilanjutkan rawat inap. | Rujukan **Transfer Internal / SPRI** (related feature). |
| **Pulang** | Pasien pulang setelah HD. | — |
| **Pulang Paksa** | Pulang atas permintaan sendiri (APS). | — |
| **Rujuk Internal** | Rujukan antar unit dalam RS. | Rujukan **Transfer Internal** (related feature). |
| **Rujuk Eksternal** | Rujukan keluar RS. | Rujukan **SPRI / rujukan** (related feature). |
| **Meninggal** | Pasien meninggal. | — |

**Kontrol Akses:** Status Pulang ditetapkan oleh **dokter** (berada pada section Asesmen Dokter), bersifat opsional.

## 10. Aksi Shortcut Modul

| Aksi | Behavior Detail | Kontrol Akses |
|------|-----------------|---------------|
| **Monitoring Hemodialisa** | Membuka modul monitoring HD dari form. | Perawat & Dokter |
| **Order Resep** | Membuka pembuatan order resep. | Perawat & Dokter |
| **Pilih Penunjang** | Membuka pemilihan pemeriksaan penunjang. | Perawat & Dokter |
| **Buat Surat** | Membuka pembuatan surat. | Perawat & Dokter |
| **Input Tindakan** | Membuka input tindakan. | Perawat & Dokter |
| **I‑Care BPJS** | Membuka riwayat pelayanan BPJS I‑Care pasien. | **Khusus Dokter** — Fase 1 (related feature: integrasi BPJS I‑Care) |

**Kontrol Akses:** Shortcut tampil di **tiap tab** (Riwayat Asesmen HD, Pengkajian Awal HD, Asesmen HD) hanya untuk role **perawat & dokter**; **I‑Care BPJS** hanya untuk **dokter**. Seluruh tombol aksi wajib **tetap terlihat & terjangkau** pada PC dan tablet (tidak terpotong).

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Isi Data Subjektif (Perawat)** — Keluhan Utama (checkbox multiple + Lain‑lain free text) dan Riwayat Psikososial. | US‑001; BR‑005 |
| **FR-002** | **Isi Data Objektif (Perawat)** — Pemeriksaan Fisik per regio (Keadaan Umum, Kesadaran, Respirasi, Ekstremitas, Konjungtiva), Tanda Vital & Berat Badan HD (TD, Nadi, RR, BB Kering, Pre/Post HD, Akses Vaskular, HD Kateter). | US‑002; US‑003 |
| **FR-003** | **Skrining & Kondisional** — Pengkajian Nyeri (tampil bila Nyeri=Ya), Risiko Jatuh, Skrining Gizi, Kemampuan Ibadah (tampil bila agama=Islam). | US‑004; BR‑004; BR‑005 |
| **FR-004** | **Kesimpulan otomatis** — sistem menghitung Kesimpulan Risiko Jatuh & Skrining Gizi dari skor (hanya tampil, tidak dapat diubah). | BR‑006; BR‑007 |
| **FR-005** | **Diagnosa & Intervensi Keperawatan** — Diagnosa keperawatan (multiple, dapat dihapus) dan Intervensi (keperawatan & kolaborasi), petugas perawat. | US‑008; US‑009; US‑010 |
| **FR-006** | **Diagnosis & Tindakan Dokter** — Diagnosa + **ICD‑10 (tunggal)**; Rencana Pelayanan + **ICD‑9**. Keduanya dari Master Data. | US‑009; BR‑002 |
| **FR-007** | **Planning & Resep HD (Dokter)** — Keluhan, Pemeriksaan Fisik/Penunjang, Planning, Resep HD, TD, QB, QD, UF Goal, Heparinisasi, Program Profiling, Dialisat. Tambah row via **+**, hapus. | US‑009; BR‑009 |
| **FR-008** | **Text area anti‑terpotong** — seluruh *text area* auto‑height mengikuti konten. | BR‑010; NFR‑006 |
| **FR-009** | **Read‑only ringkas** — tampilan bagi user non‑pengisi hanya menampilkan nilai terisi. | US‑007; BR‑008 |
| **FR-010** | **Change history & audit trail** — setiap simpan/ubah mencatat user, waktu, isi perubahan; dapat ditelusuri semua user. | US‑006; US‑008; BR‑001; NFR‑004 |
| **FR-011** | **Hasil Penunjang Lainnya** — pilih jenis pemeriksaan (dropdown), unggah file (JPG/PNG/PDF, maks 10 MB, multiple), keterangan. | US‑007 |
| **FR-012** | **Status Pulang (Dokter)** — dropdown *single select* pada section Asesmen Dokter dengan 6 pilihan (Rawat Inap / Pulang / Pulang Paksa / Rujuk Internal / Rujuk Eksternal / Meninggal). | US‑011; BR‑013; §9 |
| **FR-013** | **Aksi shortcut modul** — Monitoring HD, Order Resep, Pilih Penunjang, Buat Surat, Input Tindakan (perawat & dokter) + I‑Care BPJS (dokter); tampil di tiap tab. | US‑012; BR‑015; §10 |
| **FR-014** | **Petugas** — catat perawat akses & perawat penanggung jawab (dari Master Staf). | US‑010 |
| **FR-015** | **Salin dari Riwayat Asesmen HD** — tombol **Salin Pengkajian Awal** & **Salin Asesmen HD**; berpindah ke tab tujuan dan **auto‑replace** data. | US‑013; BR‑014 |
| **FR-016** | **Pengkajian Awal HD** — form penuh: Riwayat Penyakit, Riwayat Dialisis/Transplantasi, Pemeriksaan Fisik per regio, Tanda Vital, Pemeriksaan Penunjang (datepicker back/post‑date), Hasil Lab Penunjang (**input lab manual**, tanpa integrasi Modul Lab), Diagnosis Etiologi GGT. | US‑014; BR‑016 |

## 12. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **perawat**, saya ingin **mengisi keluhan utama & skala nyeri**, sehingga **kondisi subjektif pasien terdokumentasi**. | 1) Given form terbuka, When memilih Keluhan & mengisi Nyeri=Ya, Then field nyeri lanjutan tampil (BR‑005). | FR‑001 |
| **US-002** | Sebagai **perawat**, saya ingin **mengisi tanda vital & data berat badan HD**, sehingga **data objektif lengkap**. | 1) Given section Objektif, When mengisi TD/Nadi/RR/BB, Then nilai tersimpan dengan satuan benar. | FR‑002 |
| **US-003** | Sebagai **perawat**, saya ingin **mengisi pemeriksaan fisik per regio**, sehingga **temuan fisik terekam**. | 1) Given field regio, When memilih nilai, Then tersimpan; opsi tak dipilih → NULL (BR‑011). | FR‑002 |
| **US-004** | Sebagai **perawat**, saya ingin **mengisi skrining gizi, risiko jatuh, & kemampuan ibadah**, sehingga **skrining awal terpenuhi**. | 1) Given agama=Islam, Then section Ibadah tampil (BR‑004). 2) Given skor gizi ≥2, Then Kesimpulan="berisiko malnutrisi" (BR‑007). | FR‑003; FR‑004 |
| **US-005** | Sebagai **perawat**, saya ingin **mengisi riwayat psikososial**, sehingga **konteks psikososial pasien terdokumentasi**. | 1) Given Kendala Komunikasi=Ada, Then free text tampil. | FR‑001 |
| **US-006** | Sebagai **user (semua role)**, saya ingin **menelusuri riwayat perubahan asesmen**, sehingga **tahu siapa mengubah apa & kapan** (bukan sekadar *last updated*). | 1) Given data pernah diubah, When membuka change history, Then tampil user, waktu (DD‑MM‑YYYY HH:MM), isi perubahan (BR‑001). | FR‑010 |
| **US-007** | Sebagai **user non‑pengisi**, saya ingin **membaca asesmen dalam tampilan ringkas**, sehingga **cepat terbaca tanpa opsi kosong**. | 1) Given read‑only, Then hanya nilai terisi ditampilkan (BR‑008). | FR‑009; FR‑011 |
| **US-008** | Sebagai **perawat**, saya ingin **menegakkan diagnosa keperawatan (bisa >1 & hapus)**, sehingga **diagnosa akurat**. | 1) Given diagnosa, When menambah/menghapus, Then daftar terbarui & tercatat ke log (BR‑001). | FR‑005 |
| **US-009** | Sebagai **dokter**, saya ingin **menegakkan diagnosis (ICD‑10) & tindakan (ICD‑9) dan menyusun planning + resep HD**, sehingga **terapi HD terencana**. | 1) Given diagnosa, When memilih kode ICD‑10 dari master, Then tersimpan (BR‑002). 2) When klik button +, Then row baru muncul (BR‑009). | FR‑006; FR‑007 |
| **US-010** | Sebagai **perawat**, saya ingin **mencatat petugas perawat akses & perawat penanggung jawab**, sehingga **akuntabilitas jelas**. | 1) Given field petugas, When memilih dari Master Staf, Then tersimpan. | FR‑014 |
| **US-011** | Sebagai **dokter**, saya ingin **menetapkan Status Pulang pasien**, sehingga **disposisi keluar pasien jelas**. | 1) Given section Asesmen Dokter, When memilih Status Pulang, Then satu nilai dari 6 pilihan tersimpan (BR‑013). | FR‑012 |
| **US-012** | Sebagai **perawat/dokter**, saya ingin **akses aksi shortcut dari tiap tab**, sehingga **tidak berpindah‑pindah modul**. | 1) Given tiap tab, Then shortcut tampil untuk perawat & dokter; I‑Care BPJS hanya dokter (BR‑015). | FR‑013 |
| **US-013** | Sebagai **perawat/dokter**, saya ingin **menyalin Pengkajian Awal atau Asesmen HD dari tab Riwayat**, sehingga **tidak mengetik ulang data sebelumnya**. | 1) Given tab Riwayat Asesmen HD, When menekan Salin Asesmen HD, Then berpindah ke tab Asesmen HD & data ter‑auto‑replace (BR‑014). | FR‑015 |
| **US-014** | Sebagai **perawat/dokter**, saya ingin **mengisi Pengkajian Awal HD** (riwayat penyakit, riwayat dialisis, pemeriksaan fisik, penunjang, hasil lab, diagnosis etiologi GGT), sehingga **kondisi awal pasien HD terdokumentasi**. | 1) Given tab Pengkajian Awal HD, When menyimpan tanpa field wajib, Then sistem menahan simpan (BR‑016). 2) Given tanggal penunjang, Then dapat back‑date/post‑date. | FR‑016 |

## 13. Data Requirements (Spesifikasi Field)

> Field demografi & penjamin **reuse definisi kanonik dari modul Pendaftaran** — nama, tipe, format, validasi **harus sama**. Header pasien (No. RM, Nama, Tgl Lahir, umur) hanya tampil, tidak dapat diubah. Sumber tabel lengkap: sheet tab `Pengkajian Awal HD` & `HD` (section Perawat & Dokter). `[ASUMSI]` tipe kolom PostgreSQL menyusul keputusan enum/master.
>
> **Catatan default (D‑07):** entri "Default: …" pada kolom Sumber/Default adalah **pra‑pilih tampilan v1** saja. Sesuai keputusan, nilai opsional yang **tidak dinilai user disimpan `NULL`** — pra‑pilih tidak dipersistensi.

### A. Layar INPUT — Pengkajian Awal HD (FR-016)
> Diisi pada tab Pengkajian Awal saat inisiasi/awal program HD. Sumber: sheet tab `Pengkajian Awal HD`.

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| rp_hipertensi | Hipertensi (S · Riwayat Penyakit) | input | Tidak | Sejak (+/-) + lama (numerik) · Tahun | manual | — |
| rp_dm | Diabetes Mellitus | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_batu | Batu Saluran Kemih | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_isk | Infeksi Saluran Kemih | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_bengkak | Bengkak Seluruh Tubuh | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_urin_darah | Urin Berdarah | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_ginjal_lain | Penyakit Ginjal Lain | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_penyakit_lain | Penyakit Lain | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_nefrotoksik | Konsumsi Obat Nefrotoksik | input | Tidak | Sejak (+/-) + lama · Tahun | manual | — |
| rp_operasi_kemih | Operasi Saluran Kemih | free text | Tidak | Spesifikasi | manual | — |
| rd_dialisis_pertama | Dialisis Pertama (S · Riwayat Dialisis/Transplantasi) | datepicker | Tidak | dd-mm-yyyy · back/post‑date | manual | — |
| rd_capd | CAPD | datepicker | Tidak | dd-mm-yyyy · back/post‑date | manual | — |
| rd_transplantasi | Transplantasi Ginjal | datepicker | Tidak | dd-mm-yyyy · back/post‑date | manual | — |
| pf_keadaan_umum | Keadaan Umum (O · Tanda Vital & Umum) | radio | Tidak | Baik / Sedang / Buruk | pra‑pilih: Baik (D‑07) | — |
| pf_kesadaran | Kesadaran | radio | Tidak | CM / Somnolent / Sopor / Stupor / Coma | pra‑pilih: CM (D‑07) | — |
| pf_bb | Berat Badan | numerik | Ya | kg | manual | — |
| pf_tb | Tinggi Badan | numerik | Ya | cm | manual | — |
| pf_td | Tekanan Darah | numerik/numerik | Ya | [Sistolik]/[Diastolik] mmHg | manual | — |
| pf_suhu | Suhu | numerik | Ya | °C | manual | — |
| pf_nadi | Nadi | numerik + radio | Ya | x/menit + Reguler / Irreguler | manual | — |
| pf_nafas | Nafas | numerik | Ya | x/menit | manual | — |
| pf_nafas_jenis | Jenis (Nafas) | input | Ya | free text | manual | — |
| pf_tvj | Tekanan Vena Jugularis | radio | Tidak | Meningkat / Normal | manual | — |
| konj_anemia | Anemia (Konjungtiva) | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada (D‑07) | — |
| konj_sklera | Sklera Ikterik | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| jtg_kardiomegali | Kardiomegali (Jantung) | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| jtg_bising | Bising | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| paru_sonor | Sonor (Paru) | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| paru_wheezing | Wheezing | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| paru_ronchi | Ronchi | radio (+text) | Tidak | Ada / Tidak Ada + lokasi | pra‑pilih: Tidak Ada | mis. Pulmo Dext |
| ekst_edema | Edema (Ekstremitas) | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| abd_hepatomegali | Hepatomegali (Abdomen) | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| abd_splenomegali | Splenomegali | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| abd_ascites | Ascites | radio | Tidak | Ada / Tidak Ada | pra‑pilih: Tidak Ada | — |
| pp_foto_thorax | Foto Thorax (Pemeriksaan Penunjang) | datepicker | Tidak | dd-mm-yyyy | manual | v1: "Tuso Thorax" |
| pp_ekg | EKG | datepicker | Tidak | dd-mm-yyyy | manual | — |
| pp_bno_ivp | BNO/IVP | datepicker | Tidak | dd-mm-yyyy | manual | — |
| pp_usg | USG | datepicker | Tidak | dd-mm-yyyy | manual | — |
| pp_renogram | Renogram | datepicker | Tidak | dd-mm-yyyy | manual | v1: "Remogram" |
| pp_pa_biopsi | PA Biopsi Ginjal | datepicker | Tidak | dd-mm-yyyy | manual | — |
| pp_arteriografi | Arteriografi | datepicker | Tidak | dd-mm-yyyy | manual | v1: "Aneriografi" |
| pp_ct_scan | CT-Scan | datepicker | Tidak | dd-mm-yyyy | manual | — |
| pp_kultur_urin | Kultur Urin | datepicker | Tidak | dd-mm-yyyy | manual | — |
| pp_hasil_lab_btn | Hasil Lab Penunjang (button) | button | Tidak | — | manual | Membuka/menampilkan section input Hasil Lab Penunjang (diisi manual, bukan tarik dari Modul Lab) |
| lab_hb | Hemoglobin (Hasil Lab Penunjang) | input text | Tidak | — | manual | v1: "Hemogoblin" |
| lab_ht | Hematokrit | input text | Tidak | — | manual | — |
| lab_leukosit | Leukosit | input text | Tidak | — | manual | — |
| lab_trombosit | Trombosit | input text | Tidak | — | manual | — |
| lab_hitung_jenis | Hitung Jenis | input text | Tidak | — | manual | — |
| lab_ureum | Ureum | input text | Tidak | — | manual | — |
| lab_kreatinin | Kreatinin | input text | Tidak | — | manual | — |
| lab_asam_urat | Asam Urat | input text | Tidak | — | manual | — |
| lab_got | GOT | input text | Tidak | — | manual | — |
| lab_gpt | GPT | input text | Tidak | — | manual | — |
| lab_hbsag | HbSAg | input text | Tidak | — | manual | — |
| lab_ct_bt | CT/BT | input text | Tidak | — | manual | — |
| lab_urin_lengkap | Urin Lengkap | input text | Tidak | — | manual | — |
| lab_cct | CCT | input text | Tidak | — | manual | — |
| lab_anti_hcv | Anti-HCV | input text | Tidak | — | manual | — |
| ggt_deskripsi | Deskripsi (A · Diagnosis Etiologi GGT) | free text (textarea) | Ya | — | manual | GGT = Gagal Ginjal Terminal |

### B. Layar INPUT — Asesmen Perawat (FR-001..005, 014)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keluhan_utama | Keluhan (S) | checkbox multiple | Ya | Sesak Nafas / Mual, Muntah / Gatal / Lain‑lain | manual | Lain‑lain → free text |
| psikososial_keyakinan | Keyakinan/Tradisi/Budaya | radio | Tidak | Tidak ada / Ada | Default: Tidak ada | — |
| psikososial_kendala_komunikasi | Kendala Komunikasi | radio (+text) | Tidak | Tidak ada / Ada | Default: Tidak ada | Ada → free text |
| psikososial_perawat_rumah | Yang Merawat Di Rumah | radio (+text) | Tidak | Tidak ada / Ada | Default: Tidak ada | Ada → free text |
| psikososial_kondisi | Kondisi Saat Ini | dropdown | Tidak | Tenang / Gelisah / Takut terhadap tindakan / Marah / Mudah tersinggung | manual | — |
| pf_keadaan_umum | Keadaan Umum (O) | radio (+text) | Ya | Baik / Sedang / Buruk / Lain‑lain | Default: Baik| Lain‑lain → free text |
| pf_kesadaran | Kesadaran | radio (+text) | Ya | Compos Mentis / Lain‑lain | Default: Compos Mentis | Lain‑lain → free text |
| pf_respirasi | Respirasi | radio | Ya | Normal / Kuspnaul / Dispnea / Ronchi | Default: Normal | v1: "Kuspnaul" |
| pf_respirasi_frekuensi | Frekuensi (RR) | numerik | Ya | x/menit | manual | — |
| pf_ekstremitas | Ekstremitas | radio | Ya | Tidak Edema / Dehidrasi / Oedema / Edema Anasarka / Pucat & Dingin | manual | — |
| pf_td | Tekanan Darah | numerik/numerik | Ya | [Sistolik]/[Diastolik] mmHg | Default: Tidak Edema | — |
| pf_nadi | Nadi | radio | Ya | Reguler / Irreguler | Default: Reguler | — |
| pf_nadi_frekuensi | Frekuensi (Nadi) | numerik | Ya | x/menit | Default: 0 | — |
| pf_konjungtiva | Konjungtiva | radio (+text) | Ya | Tidak Anemis / Anemis / Lain‑lain | Default: Tidak Anemis | Lain‑lain → free text |
| bb_kering | Berat Badan Kering | numerik | Ya | Kg | manual | — |
| bb_pre_hd | Pre HD | numerik | Ya | Kg | manual | — |
| bb_post_hd | Post HD | numerik | Ya | Kg | manual | — |
| akses_vaskular | Akses Vaskular | dropdown | Ya | AV‑Fistula / Femoral | master/manual | `[PERLU KONFIRMASI]` opsi lengkap |
| hd_kateter | HD Kateter | dropdown | Ya | Subclavia / Jugular / Femoral | master/manual | — |
| nyeri | Nyeri | radio | Tidak | Tidak / Ya | Default: Tidak | Ya → tampil field lanjutan (BR‑005) |
| nyeri_intensitas | Intensitas | skala 1–10 + radio | Tidak | 1–10 + Akut / Kronik | Default: 0 | tampil bila Nyeri=Ya |
| nyeri_lokasi | Lokasi | text | Tidak | — | manual | tampil bila Nyeri=Ya |
| nyeri_time | Time | radio | Tidak | Terus menerus / Hilang timbul | Default: Terus Menerus | tampil bila Nyeri=Ya |
| nyeri_durasi | Durasi | numerik | Tidak | menit | manual | tampil bila Nyeri=Ya |
| rj_riwayat_jatuh | Riwayat jatuh (bln terakhir) | radio | Tidak | Tidak / Ya | Default: Tidak | Risiko Jatuh |
| rj_dx_sekunder | Diagnosis medis sekunder >2 | radio | Tidak | Tidak / Ya | Default: Tidak | — |
| rj_alat_bantu | Alat bantu jalan | radio | Tidak | Normal / Penopang / Furnitur | Default: Normal | — |
| rj_heparin_lock | Memakai terapi heparin lock/IV | radio | Tidak | Tidak / Ya | Default: Tidak | — |
| rj_cara_berpindah | Cara berjalan/berpindah | radio | Tidak | Normal / Lemah / Terganggu | Default: Normal | — |
| rj_status_mental | Status mental | radio | Tidak | Sesuai kemampuan / Lupa | Default: Sesuai kemampuan | — |
| rj_kesimpulan | Kesimpulan Risiko Jatuh | auto | — | hanya tampil | dibuat otomatis oleh sistem | BR‑006 |
| gizi_penunjang | Penunjang (Gizi) | text | Tidak | — | manual | `[PERLU KONFIRMASI]` makna field |
| gizi_penurunan_bb | Penurunan BB (6 bln) | dropdown | Tidak | 6 opsi berbobot (0–4) | manual | skor untuk Kesimpulan (BR‑007) |
| gizi_asupan | Asupan makan berkurang | radio | Tidak | Tidak(0) / Ya(1) | Default: Tidak | — |
| gizi_kesimpulan | Kesimpulan Gizi | auto | — | hanya tampil | dibuat otomatis oleh sistem | ≤1 tidak berisiko, ≥2 berisiko (BR‑007) |
| ibadah_wajib | Wajib Ibadah | radio | Tidak | Baligh / Belum Baligh / Halangan | Default: Baligh | tampil bila agama=Islam (BR‑004) |
| ibadah_bersuci | Bersuci / Wudhu | radio | Tidak | Mandiri / Dibantu / Tayamum | Default: Mandiri | — |
| ibadah_sholat | Sholat | radio | Tidak | Berdiri / Duduk / Berbaring / Isyarat | Default: Berdiri | — |
| dx_keperawatan | Dx / Diagnosa Keperawatan | multiple select | Ya | 8 opsi (Kelebihan volume cairan … Lainnya) | Enum | multiple; hapus (US‑008) |
| petugas_perawat_1 | Perawat Akses | dropdown | Ya | — | Master Staf role perawat | Petugas yang melakukan akses vaskular |
| intervensi_keperawatan | Intervensi Keperawatan (P) | multiple select | Ya | 13 opsi | Enum | — |
| intervensi_kolaborasi | Intervensi Kolaborasi | multiple select | Ya | 11 opsi | Enum | — |
| petugas_perawat_2 | Perawat Penanggung Jawab | multiple select | Ya | — | Master Staf role perawat | Perawat yang merawat pasien HD |
| nomor_seri_dialiser | Nomor Seri Dialiser | free text | Tidak | — | manual | **Section Asesmen Perawat (Planning)**. Traceability dializer — pencegahan tertukar |

### C. Layar INPUT — Asesmen Dokter (FR-006, 007, 011, 012)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| dok_keluhan | Keluhan (S) | free text | Tidak | — | manual | — |
| dok_pemeriksaan_fisik | Pemeriksaan Fisik (O) | free text | Tidak | — | manual | auto‑height (BR‑010) |
| dok_pemeriksaan_penunjang | Pemeriksaan Penunjang (O) | free text | Tidak | — | manual | — |
| penunjang_jenis | Jenis Pemeriksaan | dropdown | Tidak | 19 opsi (USG, EKG, CTG, CT Scan, …) | manual | Hasil Penunjang Lainnya |
| penunjang_file | Unggah File | upload | Tidak | JPG/PNG/PDF, maks 10 MB, multiple | manual | — |
| penunjang_keterangan | Keterangan | free text | Tidak | — | manual | keterangan/kesimpulan |
| dok_diagnosa | Diagnosa (A) | free text + ICD‑10 | Ya | ICD‑10 (tunggal) | Master Diagnosa | repeatable (+, hapus) (BR‑002/009) · pemisahan WHO/IM = related feature (di luar lingkup) |
| dok_planning | Planning (P) | free text | Tidak | — | manual | — |
| dok_rencana_pelayanan | Rencana Pelayanan (P) | free text + ICD‑9 | Tidak | ICD‑9 | Master Prosedur | repeatable (hapus) |
| resep_hd | Resep HD | dropdown | — | Inisiasi / Akut / Rutin / Pre‑OP / SLED / Lain‑lain | manual | — |
| resep_td | TD (Durasi HD) | numerik | Ya | jam | manual | `[PERLU KONFIRMASI]` TD=Time Dialysis/durasi |
| resep_qb | QB (Blood Flow) | numerik | Ya | ml/menit | manual | — |
| resep_qd | QD (Dialysate Flow) | numerik | Ya | ml/menit | manual | — |
| resep_uf_goal | UF Goal | numerik | Ya | ml | manual | — |
| resep_profiling | Program Profiling | checkbox multiple (+input) | Ya | NA / UF / Bicarbonat | manual | tiap opsi + input nilai |
| resep_heparinisasi | Heparinisasi | checkbox multiple (+input) | Tidak | Dosis Sirkulasi / Dosis Awal / Dosis Maintenance / LMWH / Tanpa Heparin / Program Bilas NaCl 0.9% 100cc | manual | tiap opsi + input |
| resep_heparin_maintenance | Heparinisasi – Dosis Maintenance | checkbox (+input) | Tidak | Continue (ui/jam) / Intermitten (ui/jam) | manual | — |
| resep_bilas_nacl | Program Bilas NaCl 0.9% 100cc | radio | Tidak | per 1 jam / per 1/2 jam | manual | bila dicentang |
| resep_dialisat | Dialisat | checkbox multiple (+input) | Tidak | Asetat / Bicarbonat / Conductivity (ms/cm) / Temperatur (°C) | manual | v1: "Condactiviti" |
| status_pulang | Status Pulang | dropdown (single select) | Tidak | Rawat Inap / Pulang / Pulang Paksa / Rujuk Internal / Rujuk Eksternal / Meninggal | manual | Section Asesmen Dokter · opsional · §9 · BR‑013 |

### D. Data TER-GENERATE saat Simpan (FR-010)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| updated_by | Diisi oleh | reference (user) | dari user login | atribusi per section (BR‑001) |
| updated_at | Waktu | timestamp | DD‑MM‑YYYY HH:MM | — |
| change_history | Riwayat Perubahan | log | user + waktu + diff isi perubahan | ditelusuri semua user (US‑006) |
| audit_log | Log Audit | log backend | tersimpan 100% tiap simpan/ubah | NFR‑004 |

## 14. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Buka, simpan, dan update asesmen HD **< 1 detik**. | Metrik; Ekspektasi #2 |
| **NFR-002** | Skalabilitas | Menangani **±50–60 pasien/hari** tanpa penurunan performa; data kunjungan besar (2–3x/pekan) tetap ringan. | Behavior #1; Ekspektasi #1 |
| **NFR-003** | Reliabilitas | Form dibuka‑tutup >1x per pasien; *caching* tampilan tidak boleh memberatkan/menyebabkan crash browser. | Aspek Logic #2 |
| **NFR-004** | Auditabilitas | Change history & log audit tersimpan **100%** setiap simpan/ubah, memuat user, waktu (DD‑MM‑YYYY HH:MM), isi perubahan. | Ekspektasi #3; BR‑001 |
| **NFR-005** | Responsivitas | Layout menyesuaikan resolusi PC & tablet; **seluruh tombol aksi tetap terlihat & terjangkau** (tidak terpotong). | Behavior #4; Ekspektasi #4 |
| **NFR-006** | Ergonomi UI | *Text area* auto‑height; tanpa *white space* berlebih & scrolling berulang; read‑only ringkas. | Aspek UX #2,#3; BR‑010 |
| **NFR-007** | Usability | Tambah row diagnosa/tindakan via **Enter** (minim perpindahan keyboard‑mouse). | Behavior lama; BR‑009 |

## 15. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Master Data Diagnosa** | Source ICD‑10. | Internal | FR‑006 |
| **Master Data Prosedur** | Source ICD‑9. | Internal | FR‑006 |
| **Master Data Staf** | Source petugas perawat & DPJP. | Internal | FR‑014 |
| **Transfer Internal** | Sambung keluaran asesmen. | Related feature (task terpisah) | BR‑012 |
| **SPRI** | Sambung keluaran asesmen. | Related feature (task terpisah) | BR‑012 |
| **BPJS I‑Care** | Shortcut riwayat pelayanan I‑Care (dokter). | Fase 1 (shortcut) · related feature | FR‑013 |
| **SATUSEHAT** | Pengiriman diagnosis (via ICD‑10). | Related feature (task terpisah) | BR‑003 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Master Data Diagnosa/Prosedur/Staf | Hard | Field ICD & petugas tidak dapat diisi. |
| PRD Transfer Internal | Hard (related feature) | Keluaran Status Pulang (Rawat Inap/Rujuk) tidak tersambung. |
| PRD SPRI | Hard (related feature) | Rujukan keluar tidak tersambung. |

## 16. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| D-01 | Pengkodean ICD‑10 | **Tidak dipecah** — Diagnosa memakai **ICD‑10 tunggal**. Pemisahan WHO/IM = related feature di luar lingkup (BR‑002; BR‑003). |
| D-02 | Struktur form | Mengikuti **SOAP** (S/O/A/P) + Status Pulang, konsisten dengan mapping sheet. |
| D-03 | Behavior tambah row | **Enter** menambah row diagnosa/tindakan dipertahankan dari v1 (BR‑009). |
| D-04 | Read‑only | Hanya menampilkan nilai terisi (BR‑008). |
| D-05 | Disposisi keluar | Disederhanakan menjadi **satu field Status Pulang** (dropdown single select) di section Asesmen Dokter — sub‑form Kondisi Keluar & Edukasi ditiadakan (BR‑013). |
| D-06 | GCS | **Tidak dipakai** — cukup field **Kesadaran** (Compos Mentis / Lain‑lain) sesuai mapping sheet. |
| D-07 | Default field opsional | Field opsional yang tidak dinilai disimpan **NULL**; pra‑pilih/default v1 **tidak dipersistensi** (BR‑011). |
| D-08 | Status Pulang | Bersifat **opsional** — tidak wajib sebelum simpan (BR‑013). |
| D-09 | Nomor Seri Dialiser | Diinput pada **section Asesmen Perawat (Planning)**. |
| D-10 | Salin dari Riwayat | Tab **Riwayat Asesmen HD** menyediakan Salin Pengkajian Awal & Salin Asesmen HD → pindah tab + **auto‑replace** (BR‑014). |
| D-11 | Cakupan Pengkajian Awal HD | Tab **Pengkajian Awal HD digabung** ke PRD ini sebagai form penuh (bukan companion terpisah); mapping field dari sheet `Pengkajian Awal HD` (FR‑016, BR‑016, Data Req §13.A). |
| D-12 | Hasil Lab Penunjang | **Diinput manual** — **tidak** ada integrasi ke Modul Laboratorium; Modul Laboratorium dikeluarkan dari related feature/integrasi (§13.A). |

## 17. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Dokumentasi SOAP perawat & dokter, Status Pulang, ICD‑10 (tunggal) & ICD‑9, change history + audit trail, tab Riwayat Asesmen HD + aksi Salin, shortcut modul termasuk I‑Care BPJS (dokter), layout responsif & read‑only ringkas. |
| **Di luar lingkup (related feature, task terpisah)** | Integrasi aktif Transfer Internal & SPRI, pemisahan ICD‑10 WHO/IM, bridging SATUSEHAT — dikerjakan pada task/modul masing‑masing. |

## 18. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Volume data asesmen besar (2–3x/pekan/pasien) memperlambat form. | Paginasi/lazy‑load riwayat; indeks per pasien+tanggal; uji beban 50–60 pasien/hari (NFR‑002). |
| R2 | *Caching* tampilan membebani browser saat buka‑tutup berulang. | Batasi state di memori, bersihkan saat unmount; hindari penumpukan DOM (NFR‑003). |
| R3 | Tombol aksi terpotong pada tablet. | Uji breakpoint PC & tablet; action bar sticky/terlihat penuh (NFR‑005). |
| R4 | Field **Status Pulang** belum tercantum di mapping sheet (baru diputuskan). | Tambahkan field Status Pulang ke tab `HD` (section Dokter) sebelum development. |


## 21. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 2.0 | 07-07-2026 | Team Product | Draft awal PRD Asesmen Hemodialisa dari catatan produk + mapping sheet (tab HD & Pengkajian Awal HD). Struktur SOAP, ICD‑10 WHO/IM, change history & audit, kondisi keluar, responsivitas. |
| 2.1 | 07-07-2026 | Team Product | Kondisi Keluar disederhanakan menjadi field tunggal **Status Pulang** (dropdown single select, 6 opsi: Rawat Inap/Pulang/Pulang Paksa/Rujuk Internal/Rujuk Eksternal/Meninggal) di section Asesmen Dokter (BR‑013, D‑05). **GCS ditiadakan** — cukup field Kesadaran (D‑06). Sub‑form Kondisi Keluar & Edukasi Pasien dihapus. |
| 2.2 | 07-07-2026 | Team Product | **Pemecahan ICD‑10 WHO/IM dibatalkan** — Diagnosa memakai **ICD‑10 tunggal** (BR‑002, D‑01). *(Catatan: pada v2.3 pemisahan WHO/IM ditetapkan sebagai related feature di luar lingkup, bukan Fase 2.)* |
| 2.3 | 07-07-2026 | Team Product | Istilah **"blok" → "section"** di seluruh dokumen. Transfer Internal, SPRI, pemisahan ICD‑10 WHO/IM, SATUSEHAT **bukan Fase 2** melainkan **related feature / di luar lingkup** (task masing‑masing). **I‑Care BPJS = Fase 1** (dokter) + related feature integrasi BPJS I‑Care. Ditambah **tab Riwayat Asesmen HD** + aksi **Salin** (auto‑replace) — FR‑015, BR‑014, US‑013, D‑10. Resolusi: **Status Pulang opsional** (D‑08), **Nomor Seri Dialiser di section Perawat/Planning** (D‑09), label **Perawat Akses / Perawat Penanggung Jawab**, field opsional kosong → **NULL** (D‑07), shortcut di tiap tab untuk perawat & dokter, I‑Care dokter (BR‑015). |
| 2.4 | 07-07-2026 | Team Product | Ditambahkan **Panel Informasi Klinis** — referensi **read‑only** di **side‑navigation** (Riwayat Kunjungan, Lab PK, Radiologi, Patologi Anatomi, Penunjang Lainnya), dibuka **tanpa berpindah halaman**, data *lazy‑load* — FR‑016, BR‑016, US‑014, D‑11, Skenario 7, Data Req §13.D, R5. Modul Radiologi, Patologi Anatomi, Riwayat Kunjungan ditambahkan sebagai related feature/integrasi. |
| 2.5 | 07-07-2026 | Team Product | **Panel Informasi Klinis dibatalkan (tidak jadi)** — seluruh referensi dihapus (FR‑016, BR‑016, US‑014, D‑11, Skenario 7, Data Req §13.D, R5) beserta modul sumber terkait (Radiologi, Patologi Anatomi, Riwayat Kunjungan). Dokumen kembali ke lingkup v2.3 + resolusi feedback. |
| 2.6 | 07-07-2026 | Team Product | **Pengkajian Awal HD digabung** ke PRD ini sebagai form penuh (bukan companion terpisah) — FR‑016, BR‑016, US‑014, D‑11, To‑Be step 1, dan **Data Requirements §13.A** (mapping lengkap dari sheet `Pengkajian Awal HD`, termasuk 15 field lab manual Hasil Lab Penunjang). Section Data Req lama digeser: Asesmen Perawat→B, Asesmen Dokter→C, Data ter‑generate→D. Referensi companion & dependency dihapus. |
| 2.7 | 07-07-2026 | Team Product | **Modul Laboratorium dikeluarkan** dari related feature & integrasi — Hasil Lab Penunjang **diinput manual** (bukan tarik dari Modul Lab). Diperbarui: §5 Related Feature, dependency, §15 Integrasi, Data Req §13.A (button + sumber manual), FR‑016, D‑12. |
