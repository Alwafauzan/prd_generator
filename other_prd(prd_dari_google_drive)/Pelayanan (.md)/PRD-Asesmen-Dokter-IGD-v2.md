# PRD — Asesmen Dokter IGD

**Related Document:** Mapping Field Asesmen IGD (`mapping_field_igd.xlsx`); BPMN "Pelayanan – Assesmen Dokter IGD"; PRD Triase IGD; PRD Asesmen Perawat IGD; PRD Re-triase IGD; PRD Autofill Diagnosa & Tindakan Dokter; PRD CPO IGD; PRD Transfer Internal; PRD SPRI; Dashboard Pelayanan IGD; EMR Pasien; Master Data Diagnosa (ICD-10); Master Data Prosedur (ICD-9); Master Diagnosa Keperawatan
**Dokumen ID:** PRD-P-IGD-DOK-v2.0  ·  **Versi:** 1.0 (Draft awal — konversi ke format generator Neurovi v2)
**Tanggal Disusun:** 07 Juli 2026 · **Penyusun:** Team Product — Tamtech International · **PIC:** Fafa (Product Owner)
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** Q3 2026 — Fase 01 (Must Have / MVP)

## 1. Overview / Brief Summary

**Asesmen Dokter IGD v2.0** adalah modul yang digunakan dokter untuk mendokumentasikan hasil pengkajian medis pasien selama pelayanan di Instalasi Gawat Darurat (IGD) secara terstruktur dan terintegrasi. Modul menopang dokumentasi medis dalam format **SOAP** — Subjektif (anamnesis, riwayat alergi), Objektif (GCS, tanda vital, pemeriksaan fisik, hasil pemeriksaan), Asesmen (diagnosis & ICD-10), dan Planning (tindakan & ICD-9, kondisi keluar, edukasi, TTV saat pulang) — sebagai bagian dari Electronic Medical Record (EMR) per episode kunjungan pasien.

Pada Neurovi v1, asesmen dokter sudah mendukung dokumentasi medis, namun pemanfaatan data dari triase maupun asesmen keperawatan belum optimal sehingga masih terjadi pengisian data berulang; sistem hanya menampilkan info *last updated* tanpa riwayat perubahan; tampilan *read-only* masih menampilkan seluruh field/opsi sehingga kurang ringkas; dan tata letak form belum optimal (white space berlebih, scrolling panjang, belum sepenuhnya responsif).

Fokus utama v2 (Fase 1 MVP): (1) **autofill dari triase/asesmen perawat** sesuai *business rule* & data mapping; (2) **pengisian bertahap** (partial save) sesuai perkembangan kondisi pasien; (3) **hak akses berbasis RBAC** dengan mode *read-only* per role; (4) **riwayat klinis** sebagai referensi; (5) **penyimpanan ke EMR** beserta user & timestamp; dan (6) **riwayat perubahan (audit trail)** menggantikan info *last updated*. Penyempurnaan tampilan (kepadatan UI, responsivitas PC/tablet, *read-only* ringkas) menyertai keenam kapabilitas inti tersebut.

> Referensi: `mapping_field_igd.xlsx` (spesifikasi field per section SOAP), BPMN "Pelayanan – Assesmen Dokter IGD", dan PRD modul terkait (Triase IGD, Asesmen Perawat IGD, Autofill Diagnosa & Tindakan Dokter).

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: PRD sumber Asesmen Dokter IGD (Business Process As-Is + Pain Point) & Feature Overview:

- Pasien datang ke IGD → perawat melakukan triase → petugas registrasi → dokter/perawat membuka form asesmen gawat darurat sesuai role.
- Dokter mengisi asesmen medis dan dapat menyimpan/memperbarui sesuai perkembangan kondisi pasien.
- Sistem **hanya menampilkan info *last updated*** tanpa riwayat perubahan.
- Hasil asesmen tersimpan sebagai bagian dari rekam medis pasien.

**Masalah/pain point:**
- **Aspek bisnis proses:** data triase & asesmen perawat belum dimanfaatkan optimal → **pengisian data berulang**; belum ada mekanisme jelas untuk menentukan **sumber autofill berdasarkan urutan pengisian** asesmen.
- **Aspek UX:** tampilan *read-only* masih menampilkan **seluruh field & opsi** sehingga kurang ringkas untuk dibaca; tata letak form punya **white space berlebih** dan butuh **scrolling panjang**; belum sepenuhnya responsif di berbagai resolusi perangkat.
- **Aspek logic system:** perubahan asesmen belum tersimpan sebagai **log/histori** (hanya *last updated*).

**Dampak utama yang disasar v2:**
- Dokumentasi medis **lebih cepat & konsisten** lewat autofill terarah, tanpa mengurangi integritas data. · Akuntabilitas dokumentasi meningkat lewat **audit trail**.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = Autofill, Pengisian Asesmen (partial save), RBAC, Riwayat Klinis, Simpan Asesmen, Riwayat Perubahan — fokus rilis ini.
- **Fase 2** = enhancement (*Nice to Have*) menyusul setelah MVP stabil & tervalidasi di lapangan. `[**]` `[PERLU KONFIRMASI: cakupan Fase 2 belum diisi di PRD sumber]`

> Perilaku IGD: proses asesmen bersifat **dinamis** — dokter & perawat dapat mengisi asesmen secara independen tanpa bergantung pada urutan pengisian masing-masing. Volume ~**100–150 asesmen pasien IGD per hari** (Feature Overview).

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Autofill Data Triase & Asesmen Perawat** — sistem menampilkan data tertentu dari triase/asesmen perawat ke form asesmen dokter sesuai *business rule* & data mapping; data hasil autofill tetap dapat diperbarui dokter sebelum disimpan.
2. **Pengisian Asesmen (SOAP)** — dokter mengisi & memperbarui asesmen medis gawat darurat (Subjektif, Objektif, Asesmen, Planning) sesuai standar rumah sakit, dapat disimpan **bertahap** tanpa harus melengkapi seluruh section.
3. **Hak Akses (RBAC)** — batasan lihat/tambah/ubah/simpan per role; saat form dibuka menampilkan tab sesuai role login; asesmen milik role lain hanya *read-only*.
4. **Riwayat Klinis** — menampilkan riwayat kunjungan, hasil laboratorium PK, radiologi, patologi anatomi, dan penunjang lainnya sebagai referensi (read-only).
5. **Simpan Asesmen** — penyimpanan ke EMR sesuai episode kunjungan beserta informasi user & waktu pada setiap simpan/perbarui.
6. **Riwayat Perubahan Asesmen (Audit Trail)** — mencatat setiap simpan/perubahan (user, waktu, aktivitas) dan menampilkannya sebagai riwayat perubahan.
7. **Penyempurnaan Tampilan** — pengurangan white space & scrolling, *read-only* hanya menampilkan nilai terisi, responsivitas PC & tablet (tombol aksi tidak terpotong), text area menyesuaikan tinggi konten.

### Out Scope

- **Form Konsulan** — PRD terpisah (Fase berikutnya).
- **Observasi IGD** — PRD terpisah.
- Detail flow **Re-triase IGD, Transfer Internal, SPRI, CPO IGD** — masing-masing PRD terpisah; modul ini hanya menyediakan keterhubungan/shortcut (lihat §5 & §16).

## 4. Goals and Metrics

### Tujuan
Mempercepat pengisian asesmen medis di IGD dan mengurangi pengisian data berulang lewat pemanfaatan data triase & asesmen perawat sesuai *business rule*; mendukung dokumentasi yang fleksibel & berkesinambungan; memudahkan akses informasi klinis sebagai referensi; menjamin keamanan akses via RBAC; serta mendukung akuntabilitas dokumentasi lewat riwayat perubahan (audit trail).

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Kecepatan buka form & simpan/update asesmen | ≤ 1 detik | NFR-01 |
| Volume harian tanpa penurunan performa | ~100–150 asesmen pasien IGD/hari | NFR-02 |
| Pengurangan pengisian berulang | Data triase/asesmen perawat ter-autofill otomatis sesuai *business rule* & data mapping | BR-001; FR-01 |
| Fleksibilitas dokumentasi | Dapat simpan & perbarui bertahap tanpa melengkapi seluruh section | BR-004; FR-02 |
| Keamanan akses | Asesmen hanya dapat diakses & diubah sesuai RBAC | BR-005; NFR-04 |
| Audit dokumentasi | 100% penyimpanan/pembaruan tercatat (user + timestamp) pada riwayat perubahan | BR-006; NFR-03 |

`[PERLU KONFIRMASI: percentile (mis. p95) dan jumlah user konkuren untuk target ≤ 1 detik belum ditetapkan di sumber.]`

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|----------------------|
| Triase IGD | Sumber autofill (Keluhan Utama → Anamnesis; TTV → TTV; Nyeri) bila asesmen perawat belum tersedia. |
| Asesmen Perawat IGD | Sumber autofill (per data mapping) bila sudah tersimpan sebelum asesmen dokter dibuat. |
| Re-triase IGD | Dokter dapat mengakses form re-triase dari asesmen (flow di PRD Re-triase IGD). |
| Master Data Diagnosa (ICD-10) | Source pemilihan kode ICD-10 (WHO & IM). |
| Master Data Prosedur (ICD-9) | Source pemilihan kode ICD-9 (tindakan). |
| Master Diagnosa Keperawatan | Referensi lintas-asesmen (konteks IGD). |
| Dashboard Pelayanan IGD | Konsumen status asesmen dokter (checkpoint di dashboard IGD). |
| EMR Pasien | Penyimpanan & tampilan hasil asesmen per episode kunjungan. |
| Transfer Internal | Data asesmen IGD terhubung ke form transfer internal (flow di PRD terkait). |
| SPRI | Data asesmen IGD terhubung ke SPRI (flow di PRD terkait). |
| CPO IGD / Buat Resep / Input Tindakan / Buat Surat / Pilih Penunjang | Aksi *shortcut* dari form asesmen (FR-10). |

Dependency lintas modul: **SATUSEHAT (via ICD-10 WHO)**, **BPJS/Eklaim (grouping INA-CBG & IDRG)**, **Master Data Unit / RBAC**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter IGD | Primary | Eksekutor asesmen medis (SOAP), diagnosis, planning, penetapan kondisi keluar, simpan. |
| Perawat IGD | Secondary | Pengisi triase & asesmen perawat (sumber autofill); melihat asesmen dokter *read-only*. |
| Administrator Sistem | Secondary | Mengatur konfigurasi hak akses (RBAC). |
| Auditor / Tim Mutu | Secondary | Konsumen riwayat perubahan (audit trail) untuk penelusuran & akuntabilitas. |
| Role lain (non-dokter) | Tersier | Akses *read-only* terhadap asesmen dokter sesuai hak akses. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
Pasien datang ke IGD → perawat triase → registrasi IGD → dokter/perawat membuka form asesmen gawat darurat sesuai role → dokter mengisi asesmen medis → dapat simpan/perbarui sesuai perkembangan kondisi → sistem hanya menampilkan info *last updated* (tanpa riwayat perubahan) → hasil tersimpan sebagai rekam medis.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Pasien datang ke IGD → perawat triase → registrasi pasien IGD.
2. Dokter membuka form **Asesmen Dokter IGD**; sistem membuka akses EMR berdasarkan RM & kunjungan IGD.
3. Sistem menentukan **sumber autofill** sesuai *business rule*: bila asesmen perawat **belum** tersedia → autofill dari **triase**; bila asesmen perawat **sudah** disimpan & asesmen dokter belum pernah disimpan → autofill dari **asesmen perawat** sesuai data mapping.
4. Dokter memilih **Jenis Kasus** lalu melengkapi/memperbarui asesmen **SOAP**; dapat menyimpan **bertahap** tanpa melengkapi seluruh section.
5. Setelah asesmen dokter tersimpan, **perubahan pada asesmen perawat tidak mengubah** data yang telah tersimpan pada asesmen dokter.
6. Sistem menampilkan **ringkasan riwayat klinis** sebagai referensi.
7. Setiap simpan/perubahan dicatat (user, waktu, aktivitas) sebagai **riwayat perubahan (audit trail)**; sistem **memvalidasi kelengkapan data wajib** → bila valid disimpan ke EMR & audit log dicatat, bila invalid menampilkan error pada field wajib.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Autofill | Pemanfaatan triase/asesmen perawat belum optimal → pengisian berulang | Autofill terarah per *business rule* & data mapping (triase/asesmen perawat) |
| Persistensi asesmen | Tidak ditegaskan; berpotensi tertimpa | Snapshot: asesmen dokter tersimpan tidak berubah oleh perubahan asesmen perawat |
| Riwayat perubahan | Hanya info *last updated* | Riwayat perubahan penuh (user, waktu, aktivitas) sebagai audit trail |
| Tampilan read-only | Menampilkan seluruh field/opsi | Hanya menampilkan nilai/opsi yang terisi |
| Tata letak | White space berlebih, scrolling panjang | Layout padat, scrolling minimal, text area auto-height |
| Responsivitas | Belum sepenuhnya responsif; tombol berisiko terpotong | Responsif PC & tablet; tombol aksi tetap terlihat & terjangkau |

## 7. Main Flow / Mindmap

> Referensi urutan: BPMN "Pelayanan – Assesmen Dokter IGD".

### Skenario 1 — Alur normal (asesmen perawat sudah ada)
1. Dokter buka form Asesmen Dokter IGD → sistem buka akses EMR → **autofill dari asesmen perawat** (sesuai data mapping).
2. Dokter pilih **Jenis Kasus** → isi **SOAP** (S: anamnesis/alergi; O: GCS, TTV, pemeriksaan fisik, hasil pemeriksaan; A: diagnosis + ICD-10; P: tindakan + ICD-9).
3. Dokter isi **Kondisi Keluar** (Status Pulang, indikasi, ruang, DPJP, kondisi, kesadaran), **Edukasi Pasien**, dan **TTV saat pulang**.
4. Klik **Simpan** → sistem **validasi field wajib** → valid → simpan ke EMR + catat audit log & timestamp → tampil di EMR pasien.

### Skenario 2 — Asesmen perawat belum ada (autofill dari triase)
- Saat form dibuka, sistem melakukan **autofill dari data triase** (Keluhan Utama → Anamnesis; TTV → TTV; Nyeri). Dokter dapat mengubah nilai autofill sebelum simpan (BR-002).

### Skenario 3 — Pengisian bertahap (partial save)
- Dokter menyimpan asesmen meskipun belum seluruh section terisi (BR-004); data dapat diperbarui selama episode kunjungan aktif. Setiap simpan/perubahan tercatat di riwayat perubahan (BR-006).

### Skenario 4 — Validasi gagal
- Klik Simpan dengan field wajib belum terisi → sistem menampilkan **error pada field wajib**; asesmen tidak tersimpan hingga valid (BPMN gateway "Data Valid?").

### Skenario 5 — Akses oleh role lain (RBAC)
- Role non-dokter membuka asesmen dokter → tampil **read-only** (hanya nilai terisi). Bila mencoba simpan/ubah → **validasi akses ditolak** (BR-005).

### Skenario 6 — Aksi shortcut modul
- Dari form, dokter mengakses shortcut: Triase, CPO (Catatan Pemberian Obat), Buat Resep, Pilih Penunjang, Buat Surat, Input Tindakan, EMR (FR-10). Flow detail berada di PRD masing-masing.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Sumber autofill ditentukan per urutan pengisian: bila asesmen perawat **belum** tersimpan → autofill dari **triase**; bila asesmen perawat **sudah** tersimpan & asesmen dokter **belum pernah** disimpan → autofill dari **asesmen perawat** (per data mapping). | FR-01; US-01 |
| **BR-002** | Data hasil autofill tetap dapat diubah dokter **sebelum** asesmen disimpan. | FR-01; US-01 |
| **BR-003** | Setelah asesmen dokter tersimpan, perubahan pada asesmen perawat/triase **tidak mengubah** data yang sudah tersimpan pada asesmen dokter (snapshot per episode). | FR-01; US-01 |
| **BR-004** | Dokter dapat menyimpan asesmen **secara bertahap** tanpa melengkapi seluruh section; data dapat diperbarui selama episode kunjungan aktif. | FR-02; US-02 |
| **BR-005** | RBAC: saat form dibuka, sistem menampilkan tab sesuai role login (dokter → tab Asesmen Dokter). Asesmen milik role lain hanya *read-only*; dokter tidak dapat mengubah asesmen perawat; role non-dokter yang mencoba simpan/ubah asesmen dokter → validasi **akses ditolak**. | FR-03; US-03 |
| **BR-006** | Setiap simpan/pembaruan mencatat **user, waktu (DD-MM-YYYY HH:MM), dan aktivitas** ke riwayat perubahan (audit trail). | FR-05, FR-06; US-05, US-06 |
| **BR-007** | Riwayat perubahan menampilkan **histori penuh** (bukan hanya *last updated*) dan hanya dapat diakses sesuai hak akses. | FR-06; US-06 |
| **BR-008** | **GCS Kesimpulan** (tingkat kesadaran) dihitung otomatis dari Eye + Motor + Verbal (Compos Mentis 15–14, Apatis, Delirium, Somnolence, Stupor, Coma) dan bersifat **read-only**. | FR-02; Data Req §14.B |
| **BR-009** | Field ICD-10 dipisah menjadi **ICD-10 WHO** dan **ICD-10 IM**: ICD-10 WHO untuk pengiriman **SATUSEHAT** & grouping **INA-CBG** (Eklaim); ICD-10 IM untuk grouping **IDRG** (Eklaim). Karena tidak semua kode WHO punya pasangan IM, saat WHO terisi user **tidak wajib** memilih IM. | FR-07; Feature Overview |
| **BR-010** | Diagnosis (ICD-10) & Tindakan (ICD-9) dapat **lebih dari satu baris**; penambahan baris dapat via tombol **Enter** keyboard; urutan diagnosis dapat diatur (**drag**), ditambah, dan dihapus. | FR-07; US-07 |
| **BR-011** | Pemilihan **Status Pulang** memunculkan field kondisional sesuai pilihan (lihat §10 Kondisi Keluar). | FR-08; §10 |
| **BR-012** | Field waktu memakai **input manual** (bukan time picker); format waktu seragam **(DD-MM-YYYY) HH:MM**. | FR-11; Feature Overview |
| **BR-013** | Tampilan *read-only* hanya menampilkan **field/opsi yang terisi** (bukan seluruh opsi). | FR-11; US-08 |
| **BR-014** | Field **"Upload File Bukti Penunjang"** dapat di-hide karena telah tercakup oleh **Hasil Penunjang Lainnya**; namun **data lama** pada field tersebut **wajib termigrasi**. | FR-11; §18 R2 |
| **BR-015** | **Riwayat klinis** (riwayat kunjungan, lab PK, radiologi, PA, penunjang lainnya) bersifat **referensi read-only** dan tidak dapat diedit dari modul asesmen. | FR-04; US-04 |

## 9. State Machine — Status Pengisian Asesmen

| State | Encoding Visual | Makna |
|-------|-----------------|-------|
| Belum Diisi | Abu / dash (–) | Belum ada data asesmen dokter untuk episode kunjungan. |
| Tersimpan Sebagian | Kuning / setengah | Sudah disimpan namun belum seluruh section terisi (partial save, BR-004). |
| Tersimpan | Hijau / centang | Asesmen tersimpan; dapat diperbarui selama episode aktif. |

- **Transisi:** Belum Diisi → Tersimpan Sebagian → Tersimpan (berbasis aksi simpan dokter). Pembaruan selama episode aktif tidak mengubah state terminal tetapi memicu entri baru pada riwayat perubahan (BR-006).
- Checkpoint pada Dashboard Pelayanan IGD mengonsumsi state ini `[PERLU KONFIRMASI: mapping tri-state dashboard vs status pengisian di sini].`

## 10. Kondisi Keluar — Status Pulang (Disposisi Terstruktur)

Pemilihan **Status Pulang** (single select) memunculkan field kondisional. Field bertanda `*` = wajib bila section Kondisi Keluar diisi.

| Status Pulang | Field kondisional yang muncul | Rule Terkait |
|---------------|-------------------------------|--------------|
| **Pulang** | — (Kondisi, Kesadaran, Edukasi, TTV saat pulang tetap tersedia). | BR-011 |
| **Rawat Inap** | Indikasi Rawat Inap, Rencana Pelayanan, Preskripsi Diet Awal, **Ruang** & **DPJP Rawat Inap** (muncul bila telah mendapat kamar rawat inap). | BR-011 |
| **Pulang Paksa (APS)** | — `[PERLU KONFIRMASI: pencatatan alasan APS]`. | BR-011 |
| **Rujuk Internal** | **Klinik Rujuk Internal** (dropdown multiselect — semua klinik). | BR-011 |
| **Rujuk Eksternal** | **Rumah Sakit Rujukan**, **Klinik Rujukan** (free text). | BR-011 |
| **Meninggal** | — `[PERLU KONFIRMASI: keterhubungan ke modul sertifikat kematian]`. | BR-011 |

**Field pendukung Kondisi Keluar (semua status):** Rencana/Tindakan/Terapi, **Kondisi** (Membaik/Memburuk/Tetap/Meninggal), **Kesadaran** (Compos Mentis/Apatis/Delirium/Somnolence/Stupor/Coma).

## 11. RBAC & Display Rules (Read-Only)

| Aspek | Dokter (owner) | Role lain (non-dokter) |
|-------|----------------|------------------------|
| Landing tab saat buka form | Tab Asesmen Dokter | Sesuai role; asesmen dokter tampil read-only |
| Asesmen Dokter | Lihat/tambah/ubah/simpan | **Read-only** (hanya nilai terisi, BR-013) |
| Asesmen Perawat | **Read-only** (tidak dapat diubah dokter) | Sesuai kewenangan role |
| Simpan/ubah tanpa kewenangan | — | **Validasi akses ditolak** (BR-005) |
| Riwayat perubahan | Dapat diakses sesuai hak akses (BR-007) | Dapat diakses sesuai hak akses (BR-007) |

## 12. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-01** | **Autofill Data Triase & Asesmen Perawat** — sistem melakukan autofill sesuai *business rule* (BR-001) & data mapping; nilai dapat diubah sebelum simpan (BR-002); asesmen dokter tersimpan tidak tertimpa perubahan asesmen perawat (BR-003). | US-01; BR-001, BR-002, BR-003 |
| **FR-02** | **Form Pengisian Asesmen (SOAP)** — menyediakan seluruh section Subjektif/Objektif/Asesmen/Planning sesuai spesifikasi field (§14); mendukung **partial save** & pembaruan selama episode aktif (BR-004); GCS Kesimpulan auto-hitung (BR-008). | US-02; BR-004, BR-008 |
| **FR-03** | **Hak Akses (RBAC)** — kontrol lihat/tambah/ubah/simpan per role; tab default per role; mode read-only untuk role lain; blokir simpan tanpa kewenangan (BR-005; §11). | US-03; BR-005 |
| **FR-04** | **Riwayat Klinis (Referensi)** — menampilkan riwayat kunjungan, hasil lab PK, radiologi, PA, dan penunjang lainnya sebagai referensi read-only (BR-015). | US-04; BR-015 |
| **FR-05** | **Simpan Asesmen ke EMR** — menyimpan asesmen per episode kunjungan beserta user & timestamp; data dapat diakses kembali via EMR pasien (BR-006). | US-05; BR-006 |
| **FR-06** | **Riwayat Perubahan (Audit Trail)** — mencatat setiap create/update (nama user, tanggal, waktu, aktivitas) dan menampilkannya pada panel riwayat; akses sesuai hak akses (BR-006, BR-007). | US-06; BR-006, BR-007 |
| **FR-07** | **Diagnosis ICD-10 & Tindakan ICD-9** — pemilihan dari master data; ICD-10 dipisah WHO & IM (BR-009); multi-baris dengan tombol Enter, drag-urut, tambah/hapus (BR-010). | US-07; BR-009, BR-010 |
| **FR-08** | **Kondisi Keluar (Status Pulang)** — single select dengan field kondisional per pilihan (§10); mendukung Kondisi, Kesadaran (BR-011). | US-08; BR-011; §10 |
| **FR-09** | **Edukasi Pasien & TTV saat Pulang** — checkbox edukasi (Diagnosa/Rencana Asuhan/Tujuan Terapi/Lainnya) & input TTV saat pulang (TD, Nadi, RR) dengan autofill triase/asesmen perawat bila tersedia. | US-08; §14.D |
| **FR-10** | **Aksi Shortcut Modul** — akses cepat dari form: Triase, CPO (Catatan Pemberian Obat), Buat Resep, Pilih Penunjang, Buat Surat, Input Tindakan, EMR. Flow detail di PRD masing-masing. | US-08; §5, §16 |
| **FR-11** | **Optimasi Tampilan** — layout padat (kurangi white space & scrolling); read-only ringkas (BR-013); responsif PC & tablet tanpa tombol terpotong; text area auto-height; input waktu manual format (DD-MM-YYYY) HH:MM (BR-012); caching form ringan (NFR-06). | US-08; BR-012, BR-013; NFR-05, NFR-06 |

## 13. User Stories

> Format: "Sebagai … ingin … sehingga …". Acceptance Criteria pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-01** | Sebagai **dokter IGD**, saya ingin data dari triase/asesmen perawat ditampilkan otomatis, sehingga tidak perlu mengisi data yang sama berulang. | 1) Given asesmen perawat belum tersedia, When form dibuka, Then autofill dari triase (BR-001). 2) Given asesmen perawat sudah disimpan sebelum asesmen dokter dibuat, When form dibuka, Then autofill dari asesmen perawat per data mapping (BR-001). 3) Given nilai autofill, When belum disimpan, Then dapat diubah dokter (BR-002). 4) Given asesmen dokter sudah tersimpan, When asesmen perawat berubah, Then data dokter tidak tertimpa (BR-003). | FR-01; BR-001, BR-002, BR-003 |
| **US-02** | Sebagai **dokter IGD**, saya ingin mengisi asesmen medis, sehingga kondisi pasien terdokumentasi sebagai dasar keputusan klinis. | 1) Given form asesmen (SOAP), When dibuka, Then seluruh section dapat diakses. 2) Given belum seluruh section terisi, When simpan, Then asesmen tetap tersimpan (BR-004). 3) Given episode kunjungan aktif, When perbarui, Then data dapat diperbarui. | FR-02; BR-004 |
| **US-03** | Sebagai **administrator sistem**, saya ingin setiap pengguna hanya mengakses asesmen sesuai kewenangannya. | 1) Given login per role, When form dibuka, Then landing tab sesuai role. 2) Given role dokter, When akses asesmen perawat, Then read-only. 3) Given role lain, When akses asesmen dokter, Then read-only & tidak dapat mengubah (BR-005). | FR-03; BR-005 |
| **US-04** | Sebagai **dokter IGD**, saya ingin melihat informasi klinis pasien sebagai referensi selama asesmen. | 1) Given asesmen berjalan, When buka riwayat klinis, Then tampil riwayat kunjungan, lab, radiologi, PA, penunjang lainnya. 2) Given data referensi, When ditampilkan, Then read-only (BR-015). | FR-04; BR-015 |
| **US-05** | Sebagai **dokter IGD**, saya ingin menyimpan hasil asesmen sebagai bagian rekam medis pasien. | 1) Given asesmen diisi, When simpan, Then tersimpan pada episode kunjungan aktif. 2) Given simpan/perbarui, Then user & timestamp tersimpan (BR-006). 3) Given tersimpan, When buka EMR, Then data tersedia. | FR-05; BR-006 |
| **US-06** | Sebagai **tenaga kesehatan/auditor**, saya ingin melihat riwayat perubahan asesmen, sehingga setiap perubahan dapat ditelusuri. | 1) Given ada create/update, When tercatat, Then histori menyimpan user, tanggal, waktu, aktivitas (BR-006, BR-007). 2) Given panel riwayat, When dibuka, Then menampilkan seluruh perubahan (bukan hanya last updated). 3) Given hak akses, When akses riwayat, Then sesuai kewenangan. | FR-06; BR-006, BR-007 |
| **US-07** | Sebagai **dokter IGD**, saya ingin menegakkan diagnosis & tindakan dengan kode ICD, sehingga koding klinis akurat & siap untuk SATUSEHAT/Eklaim. | 1) Given master data, When pilih diagnosis, Then dapat memilih ICD-10 WHO (& opsional ICD-10 IM, BR-009). 2) Given tindakan, When dipilih, Then dapat memilih ICD-9 dari master prosedur. 3) Given baris diagnosa/tindakan, When tekan Enter, Then baris baru bertambah; urutan diagnosis dapat di-drag/tambah/hapus (BR-010). | FR-07; BR-009, BR-010 |
| **US-08** | Sebagai **dokter IGD**, saya ingin form yang cepat & rapi di PC/tablet, sehingga pelayanan IGD tidak terhambat. | 1) Given resolusi PC/tablet, When form dibuka, Then tombol aksi tetap terlihat & tidak terpotong (NFR-05). 2) Given text area panjang, When diisi, Then tinggi menyesuaikan konten tanpa teks terpotong (BR-013). 3) Given read-only, When ditampilkan, Then hanya nilai terisi (BR-013). 4) Given buka/tutup form >1× per pasien, When caching aktif, Then browser tetap stabil (NFR-06). | FR-11; BR-012, BR-013; NFR-05, NFR-06 |

## 14. Data Requirements (Spesifikasi Field)

> Sumber: `mapping_field_igd.xlsx` (Klinik General — Asesmen Dokter). Field demografi & penjamin **reuse definisi kanonik dari modul Pendaftaran/EMR IGD** — nama, tipe, format, validasi harus sama. Kebanyakan field bersifat **partial save** (Wajib = Tidak) kecuali dinyatakan; aturan mandatory per field masih perlu dikonfirmasi (§20).

### A. Layar INPUT — Subjektif (S) (FR-02)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| jenis_kasus | Jenis Kasus | single select / radiobutton | Tidak | Bedah/Trauma/Non-Trauma/Obgyn/Non Bedah/Interna/Anak/Saraf/Jantung | manual | + opsi "Kasus Lainnya" (freetext). |
| anamnesis | Anamnesis | freetext (text area) | Tidak | — | **autofill** triase/asesmen perawat | Auto-height (BR-013). |
| riwayat_alergi | Riwayat Alergi | single select + input | Tidak | Tidak ada / Ada | manual | Bila "Ada": sebutkan (multiple input). |

### B. Layar INPUT — Objektif (O) (FR-02)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| gcs_eye | GCS – Eye | single select | Tidak | 4=Open spontaneously … 1=No eye opening | manual | — |
| gcs_motor | GCS – Motor | single select | Tidak | 6=Obeys command … 1=No response | manual | — |
| gcs_verbal | GCS – Verbal | single select | Tidak | 5=Orientated … 1=No verbal | manual | — |
| gcs_kesimpulan | GCS – Kesimpulan | auto (read-only) | — | Compos Mentis/Apatis/Delirium/Somnolence/Stupor/Coma | **auto** dari Eye+Motor+Verbal | BR-008. |
| td | Tekanan Darah | Sistolik/Diastolik | Tidak | mmHg | **autofill** triase/asesmen perawat | — |
| rr | RR | numerik | Tidak | x/menit | **autofill** triase/asesmen perawat | — |
| nadi | Nadi | numerik | Tidak | x/menit | **autofill** triase/asesmen perawat | — |
| suhu | Suhu | numerik | Tidak | °C | **autofill** triase/asesmen perawat | — |
| spo2 | Saturasi O₂ | numerik | Tidak | % | **autofill** triase/asesmen perawat | — |
| tinggi_badan | Tinggi Badan | numerik | Tidak | cm | **autofill** triase/asesmen perawat | — |
| berat_badan | Berat Badan | numerik | Tidak | kg | **autofill** triase/asesmen perawat | — |
| gds | GDS | numerik | Tidak | mg/dL | **autofill** triase/asesmen perawat | — |
| data_objektif_lain | Data Objektif Lainnya | freetext | Tidak | — | **autofill** triase/asesmen perawat | — |
| pf_kepala … pf_anogenitalia | Pemeriksaan Fisik (Kepala, Mata, Mulut, Leher, Dada, Perut, Alat Gerak, Anogenitalia) | freetext | Tidak | default "normal" | manual | Per regio. |
| pf_temuan_lain | Temuan Fisik Lainnya | freetext | Tidak | — | manual | — |
| hp_lab | Hasil Pemeriksaan – Laboratorium | freetext | Tidak | — | manual | — |
| hp_radiologi | Hasil Pemeriksaan – Radiologi | freetext | Tidak | — | manual | — |
| hp_penunjang_lain | Hasil Pemeriksaan – Penunjang Lainnya | freetext | Tidak | — | manual | — |
| hp_upload_bukti | Upload File Bukti Penunjang | upload file | Tidak | JPG/PNG/PDF | manual | **Dapat di-hide** (BR-014); migrasi data lama wajib. |

### C. Layar INPUT — Asesmen (A) (FR-07)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| diagnosis | Diagnosis | freetext (multi-baris) | Tidak | — | manual | Enter → baris baru; drag-urut/tambah/hapus (BR-010). |
| icd10_who | ICD-10 (WHO) | lookup master diagnosa | Tidak | kode ICD-10 WHO | Master Data Diagnosa | Untuk SATUSEHAT & INA-CBG (BR-009). |
| icd10_im | ICD-10 (IM) | lookup master diagnosa | Tidak | kode ICD-10 IM | Master Data Diagnosa | Untuk IDRG; tidak wajib bila WHO terisi (BR-009). `[PERLU KONFIRMASI: mapping xlsx masih 1 field ICD-10]` |

### D. Layar INPUT — Planning (P) (FR-08, FR-09)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| tindakan | Tindakan | freetext (multi-baris) | Tidak | — | manual | Enter → baris baru (BR-010). |
| tindakan_tgl | Tanggal | date | Tidak | YYYY-MM-DD | manual | — |
| tindakan_jam | Waktu | time (input manual) | Tidak | HH:MM | manual | Bukan time picker (BR-012). |
| icd9 | ICD-9 | lookup master prosedur | Tidak | kode ICD-9 | Master Data Prosedur | — |
| rencana_terapi | Rencana/Tindakan/Terapi | freetext | Tidak | — | manual | — |
| status_pulang | Status Pulang | single select / radiobutton | **Ya\*** | Pulang/Rawat Inap/Pulang Paksa/Rujuk Internal/Rujuk Eksternal/Meninggal | manual | Wajib bila Kondisi Keluar diisi; memicu field kondisional (§10). |
| klinik_rujuk_internal | Klinik Rujuk Internal | dropdown multiselect | Kondisional | semua klinik | Master Unit | Muncul bila Status Pulang = Rujuk Internal. |
| rs_rujukan | Rumah Sakit Rujukan | freetext | Kondisional | — | manual | Muncul bila Rujuk Eksternal. |
| klinik_rujukan | Klinik Rujukan | freetext | Kondisional | — | manual | Muncul bila Rujuk Eksternal. |
| indikasi_ranap | Indikasi Rawat Inap | freetext | Kondisional | — | manual | Muncul bila Rawat Inap. |
| rencana_pelayanan | Rencana Pelayanan | freetext | Kondisional | — | manual | Muncul bila Rawat Inap. |
| preskripsi_diet | Preskripsi Diet Awal | freetext | Kondisional | — | manual | Muncul bila Rawat Inap. |
| ruang | Ruang | dropdown | Kondisional | — | Master Unit | Muncul bila Rawat Inap & sudah dapat kamar. |
| dpjp_ranap | DPJP Rawat Inap | dropdown | Kondisional | — | Master Staf | Muncul bila Rawat Inap & sudah dapat kamar. |
| kondisi | Kondisi | single select | Tidak | Membaik/Memburuk/Tetap/Meninggal | manual | — |
| kesadaran | Kesadaran | single select | Tidak | Compos Mentis/Apatis/Delirium/Somnolence/Stupor/Coma | manual | — |
| edukasi | Edukasi yang telah diberikan | checkbox (multi) | Tidak | Diagnosa/Rencana Asuhan/Tujuan Terapi/Lainnya | manual | "Lainnya" → freetext. |
| ttv_pulang_td | TTV saat Pulang – Tekanan Darah | Sistolik/Diastolik | Tidak | mmHg | **autofill** triase/asesmen perawat | — |
| ttv_pulang_nadi | TTV saat Pulang – Nadi | numerik | Tidak | x/menit | **autofill** triase/asesmen perawat | — |
| ttv_pulang_rr | TTV saat Pulang – RR | numerik | Tidak | x/menit | **autofill** triase/asesmen perawat | — |
| hpl_jenis | Hasil Penunjang Lainnya – Jenis Pemeriksaan | dropdown | Tidak | USG/EKG/CTG/CT Scan/Echocardiography/EEG/MRI/dll | manual | — |
| hpl_hasil | Hasil Penunjang Lainnya – Hasil Pemeriksaan | upload file | Tidak | JPG/PNG/PDF | manual | — |
| hpl_keterangan | Hasil Penunjang Lainnya – Keterangan | freetext | Tidak | — | manual | — |

### E. Data TER-GENERATE saat Simpan (FR-05, FR-06)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| gcs_kesimpulan | Tingkat Kesadaran (GCS) | enum | dibuat otomatis dari Eye+Motor+Verbal | BR-008. |
| created_by / updated_by | User Pencatat/Pengubah | ref user | dari sesi login | BR-006. |
| created_at / updated_at | Timestamp | datetime | DD-MM-YYYY HH:MM (server) | BR-006. |
| activity_log | Aktivitas Perubahan | text | create/update + ringkasan perubahan | BR-006, BR-007 (audit trail). |

## 15. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-01** | Performa | Buka form, simpan, dan update asesmen ≤ 1 detik. | Metrik |
| **NFR-02** | Skalabilitas | Mampu menangani ~100–150 asesmen pasien IGD/hari tanpa penurunan performa. | Metrik |
| **NFR-03** | Auditabilitas | 100% penyimpanan/perubahan tercatat (user + timestamp + aktivitas) pada riwayat perubahan. | BR-006 |
| **NFR-04** | Keamanan / RBAC | Hak akses lihat/tambah/ubah/simpan diterapkan per role; blokir simpan tanpa kewenangan. | BR-005 |
| **NFR-05** | Ergonomi UI | Responsif PC & tablet tanpa tombol terpotong; kurangi white space & scrolling; text area auto-height. | FR-11 |
| **NFR-06** | Reliabilitas | Caching tampilan form tidak membebani browser hingga crash saat buka/tutup >1× per pasien. | FR-11 |
| **NFR-07** | Konsistensi | Terminologi & field selaras dengan modul terkait (Triase IGD, Asesmen Perawat IGD, EMR). | Domain knowledge |

## 16. Integrasi Eksternal & Dependency

> Modul ini terutama **mengonsumsi data internal** (triase, asesmen perawat) dan menjadi **sumber koding** untuk pengiriman eksternal.

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **SATUSEHAT (FHIR R4)** | Pengiriman diagnosis via **ICD-10 WHO**. | Live/Internal `[PERLU KONFIRMASI]` | BR-009; FR-07 |
| **BPJS / Eklaim** | Grouping **INA-CBG** (ICD-10 WHO) & **IDRG** (ICD-10 IM). | Live/Internal `[PERLU KONFIRMASI]` | BR-009 |
| **Master Data Diagnosa / Prosedur** | Source kode ICD-10 (WHO/IM) & ICD-9. | Internal | FR-07 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Triase IGD (sumber autofill) | **Hard** | Autofill dari triase tidak berjalan (fallback pengisian manual). |
| Asesmen Perawat IGD (sumber autofill) | **Hard** | Autofill dari asesmen perawat tidak berjalan. |
| Master Data Diagnosa/Prosedur | **Hard** | Pemilihan ICD-10/ICD-9 tidak tersedia. |
| RBAC / Master Data Unit & Staf | **Hard** | Kontrol akses & dropdown Ruang/DPJP tidak aktif. |
| Re-triase / Transfer Internal / SPRI / CPO IGD | Soft | Shortcut/keterhubungan lintas modul nonaktif; asesmen tetap dapat diisi. |
| Dashboard Pelayanan IGD | Soft | Status checkpoint asesmen tidak tampil di dashboard. |

## 17. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP — Must Have)** | Autofill triase/asesmen perawat, Pengisian Asesmen SOAP (partial save), RBAC + read-only, Riwayat Klinis, Simpan ke EMR, Riwayat Perubahan (audit trail), penyempurnaan tampilan (responsif, read-only ringkas, ICD-10 WHO/IM, multi-row diagnosa/tindakan). |
| **Fase 2 (Nice to Have)** `[**]` | Enhancement menyusul setelah MVP stabil & tervalidasi. `[PERLU KONFIRMASI: cakupan belum diisi di PRD sumber; kandidat: Form Konsulan, Observasi IGD — saat ini Out Scope]` |

## 18. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Caching form membebani browser hingga crash (buka/tutup >1× per pasien). | Manajemen cache ringan, batasi payload yang dipertahankan, uji beban di perangkat tablet (NFR-06). |
| R2 | Migrasi data lama pada field "Upload File Bukti Penunjang" tidak lengkap saat field di-hide. | Skrip migrasi ke field terkait + verifikasi kelengkapan sebelum hide (BR-014). |
| R3 | Ambiguitas ICD-10 WHO vs IM (mapping xlsx masih satu field). | Konfirmasi & pemisahan field ICD-10 WHO/IM, validasi grouping INA-CBG/IDRG (BR-009). |
| R4 | Aturan field wajib (mandatory) belum terdefinisi → validasi simpan tidak konsisten. | Definisikan aturan validasi per field bersama tim klinis sebelum development (§20). |
| R5 | Perubahan asesmen perawat menimpa asesmen dokter yang sudah tersimpan. | Terapkan snapshot per episode (BR-003) + uji regresi persistensi. |

## Asumsi
- [ASUMSI] Detail baseline V1 pada dokumen ini diturunkan dari **Business Process As-Is + Pain Point pada PRD sumber Asesmen Dokter IGD** dan Feature Overview, bukan dari dokumen PRD V1 Asesmen Dokter IGD yang berdiri sendiri (dokumen V1 khusus modul ini tidak ditemukan di project knowledge). Bila ada dokumen/Figma V1, mohon dilampirkan untuk memperkuat perbandingan.
- [ASUMSI] Struktur SOAP (S/O/A/P) sebagai kerangka form mengikuti pengelompokan section pada `mapping_field_igd.xlsx` dan BPMN ("Isi SOAP").
- [ASUMSI] GCS Kesimpulan bersifat read-only hasil kalkulasi otomatis (Eye+Motor+Verbal) sesuai keterangan di mapping.
- [ASUMSI] Field kondisional Kondisi Keluar (§10) ditampilkan/di-hide berdasarkan pilihan Status Pulang sesuai kolom keterangan mapping ("jika memilih status pulang …").

## Pertanyaan Terbuka
- [PERLU KONFIRMASI] **Aturan field wajib (mandatory)** per section untuk validasi Simpan — sumber hanya menandai *Status Pulang* sebagai wajib; field lain belum ditentukan (partial save aktif).
- [PERLU KONFIRMASI] **Nilai breakpoint pasti** untuk responsivitas PC & tablet (Feature Overview menyatakan perlu dikonfirmasi).
- [PERLU KONFIRMASI] **Target performa** ≤ 1 detik: percentile (mis. p95) dan jumlah user konkuren.
- [PERLU KONFIRMASI] **Pemisahan field ICD-10 WHO vs IM** — mapping xlsx masih menampilkan satu field ICD-10; perlu penegasan struktur field & aturan wajib WHO.
- [PERLU KONFIRMASI] **Cakupan Fase 2 (Nice to Have)** — belum diisi di PRD sumber.
- [PERLU KONFIRMASI] **Pulang Paksa (APS):** apakah perlu pencatatan alasan? · **Meninggal:** apakah men-trigger modul sertifikat kematian?
- [PERLU KONFIRMASI] **Sumber & scope role** untuk RBAC (daftar role yang boleh lihat/ubah) serta akses panel riwayat perubahan per role.
- [PERLU KONFIRMASI] **Mapping status pengisian asesmen (§9)** ke checkpoint tri-state Dashboard Pelayanan IGD.
- [PERLU KONFIRMASI] **Detail keterhubungan** asesmen IGD → Transfer Internal & SPRI (field mana yang diteruskan) dan status integrasi SATUSEHAT/Eklaim.

## Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 (Draft awal) | 07 Juli 2026 | Team Product | Draft awal PRD Asesmen Dokter IGD. |
| 1.0 (Konversi generator) | 10 Juli 2026 | Team Product | Konversi ke format generator Neurovi v2: penstrukturan SOAP (S/O/A/P) dari mapping field, Business Process As-Is/To-Be & Main Flow dari BPMN, BR/FR/US/NFR, Data Requirements per section, State Machine status pengisian, Kondisi Keluar (6 Status Pulang), RBAC display rules, Integrasi (SATUSEHAT/Eklaim/Master Data), Roadmap, Risk, Asumsi & Pertanyaan Terbuka. |

---
> **Catatan Penutup:** Dokumen berstatus Draft hasil konversi ke format generator Neurovi v2. Seluruh substansi ditarik dari PRD sumber Asesmen Dokter IGD, `mapping_field_igd.xlsx`, BPMN, dan Feature Overview — tanpa penambahan asumsi diam-diam. Item yang belum jelas ditandai `[PERLU KONFIRMASI]` (§20). Setelah pertanyaan terbuka terjawab (terutama aturan field wajib, breakpoint, dan pemisahan ICD-10 WHO/IM), status dapat dinaikkan menjadi Approved untuk implementasi.
