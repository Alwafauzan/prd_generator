# PRD — Transfer Internal

**Related Document:** [PERLU KONFIRMASI — lampirkan BPMN/Flowchart/Referensi V1 bila ada dokumen pendukung]
**Dokumen ID:** [PERLU KONFIRMASI]  ·  **Versi:** 2.0 (Draft)
**Tanggal Disusun:** 14 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Transfer Internal adalah fitur yang menjadi media handover pasien antar unit pelayanan di dalam rumah sakit, digunakan oleh dokter dan perawat pengirim maupun penerima untuk mendokumentasikan kondisi klinis pasien secara lengkap, terstandarisasi, dan terintegrasi dengan Electronic Medical Record (EMR). Fitur ini mencakup perpindahan pasien pada 7 skenario: Rawat Jalan → Rawat Inap, IGD → Rawat Inap, Rawat Inap → IBS, Rawat Inap → Hemodialisa, Antar Bangsal Rawat Inap, IBS → Rawat Inap, dan Hemodialisa → Rawat Inap, dengan dokumentasi handover menggunakan format SBAR (Situation, Background, Assessment, Recommendation).

Pada Neurovi v1, pengisian Form Transfer Internal bersifat mandatory dan menjadi prasyarat (blocking process) sebelum pasien dapat dipindahkan ke bangsal, sehingga kelengkapan form secara langsung menahan proses admission. Untuk Fase 1 MVP Neurovi v2, penegasan lingkup utama adalah **melepas ketergantungan (dependency) antara kelengkapan pengisian Form Transfer Internal dan proses perpindahan pasien ke bangsal**, sekaligus tetap mempertahankan kelengkapan dokumentasi handover secara klinis. Perbedaan/fokus fungsional utama v2 dibanding v1: (a) Form Transfer Internal dapat diisi sebelum maupun sesudah pasien berpindah ke unit tujuan, (b) perpindahan pasien ke bangsal tidak lagi bergantung pada kelengkapan Form Transfer Internal, dan (c) tampilan form dioptimalkan agar lebih ringkas (mengurangi white space dan scrolling) tanpa mengurangi kelengkapan data.

> Referensi: [PERLU KONFIRMASI — dokumen/PRD terkait, mis. BPMN Transfer Internal, PRD TPPRI, PRD Rawat Inap].

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Form Transfer Internal bersifat **mandatory** dan menjadi proses yang harus diselesaikan sebelum pasien dapat dipindahkan ke bangsal.
- Alur pelayanan v1: SPRI diterbitkan → Registrasi TPPRI → Pengisian Transfer Internal → Pulangkan ke Rawat Inap → pasien baru dapat masuk ke bangsal.
- Ketergantungan tersebut menyebabkan proses admission menjadi terhambat apabila Form Transfer Internal belum selesai diisi.

**Masalah/pain point:**
- **Aspek bisnis proses:** Form Transfer Internal menjadi mandatory gate sebelum pasien pindah ke bangsal — pasien tertahan bila petugas belum sempat menyelesaikan pengisian form, padahal proses administrasi rawat inap (registrasi & alokasi bed) sudah selesai.
- **Aspek UX:** Tampilan form memiliki white space berlebih dan pengelompokan informasi yang membuat pengguna banyak melakukan scrolling saat mengisi, sehingga pengisian menjadi lebih lambat dari yang seharusnya.
- **Aspek logic system:** Sistem menjadikan kelengkapan Form Transfer Internal sebagai syarat teknis (blocking) untuk proses perpindahan pasien ke bangsal, alih-alih memperlakukannya sebagai dokumentasi klinis yang independen dari proses administratif perpindahan.

**Dampak utama yang disasar v2:**
- Menghilangkan hambatan administrasi yang menyebabkan pasien tertahan sebelum masuk bangsal.
- Memastikan dokumentasi handover tetap lengkap tanpa mengganggu alur pelayanan pasien.
- Mempercepat proses admission rawat inap.
- Mempermudah tenaga kesehatan dalam melakukan komunikasi antar unit.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = seluruh capability yang tercantum pada dokumen ini: pencatatan transfer 7 skenario perpindahan, dokumentasi SBAR, dokumentasi pengirim/penerima, dokumentasi perpindahan & kondisi klinis pasien, serta pelepasan dependency Form Transfer Internal terhadap perpindahan pasien ke bangsal.
- **Tidak ada Fase 2/Fase 3** — seluruh kapabilitas pada dokumen ini ditargetkan rilis dalam satu fase (Fase 1 MVP), tidak ada kapabilitas lanjutan yang ditunda ke fase berikutnya.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Form Transfer Internal** — pencatatan transfer internal pasien antar unit pelayanan, meliputi:
   1. Rawat Jalan → Rawat Inap.
   2. IGD → Rawat Inap.
   3. Rawat Inap → IBS.
   4. Rawat Inap → Hemodialisa.
   5. Antar Bangsal Rawat Inap.
   6. IBS → Rawat Inap.
   7. Hemodialisa → Rawat Inap.
2. **Dokumentasi SBAR** — Situation, Background, Assessment, Recommendation.
3. **Dokumentasi kondisi klinis pasien** — Vital Sign, GCS, Skala Nyeri, kondisi umum pasien, riwayat alergi, diagnosis medis, diagnosis keperawatan, tindakan medis yang telah dilakukan.
4. **Dokumentasi perpindahan pasien** — unit asal, unit tujuan, bangsal, ruangan, bed tujuan, cara perpindahan pasien, alasan perpindahan.
5. **Dokumentasi tenaga kesehatan pengirim dan penerima** — dokter pengirim, perawat pengirim, perawat penerima, waktu transfer.
6. **Dokumentasi obat yang sedang diberikan** kepada pasien.
7. **Dokumentasi alat bantu** yang masih terpasang pada pasien.
8. **Dokumentasi pemeriksaan penunjang** yang disertakan saat transfer.
9. **Dokumentasi rekomendasi dan instruksi lanjutan** kepada unit penerima.
10. **Pelepasan dependency admission** — Form Transfer Internal dapat diisi sebelum maupun sesudah pasien berpindah ke unit tujuan; perpindahan pasien ke bangsal tidak bergantung pada kelengkapan pengisian form.
11. **Integrasi** dengan EMR, TPPRI, Rawat Inap, Rawat Jalan, IGD, IBS, Hemodialisa, dan Bed Management.

### Out Scope
- Master Bangsal.
- Master Bed.
- Billing Rawat Inap.
- Proses registrasi rawat inap.
- Ganti Bed.
- Discharge Planning.

## 4. Goals and Metrics

### Tujuan
Menyediakan fitur Transfer Internal sebagai media handover pasien antar unit pelayanan yang terdokumentasi lengkap, terstandarisasi, dan terintegrasi dengan EMR — sekaligus memastikan proses administrasi perpindahan pasien ke bangsal tidak terhambat oleh kelengkapan dokumentasi handover.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Perpindahan pasien ke bangsal tidak menunggu kelengkapan Form Transfer Internal | target kuantitatif belum disebutkan sumber | Aspek Logic System |
| Waktu proses admission rawat inap | target percepatan (mis. durasi p50/p95) belum disebutkan sumber | Ekspektasi |
| Kelengkapan dokumentasi handover (SBAR) meski form dilengkapi belakangan | target cakupan % belum disebutkan sumber | Ekspektasi |
| Efisiensi pengisian form (pengurangan scrolling/waktu isi) | target waktu/jumlah scroll belum disebutkan sumber | Aspek UX |

## 5. Related Feature

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| **EMR** | Menyimpan seluruh informasi handover yang diisi pada Form Transfer Internal sebagai bagian rekam medis pasien. |
| **TPPRI** | Sumber data registrasi rawat inap; Form Transfer Internal tetap terhubung dengan registrasi rawat inap aktif pasien. |
| **Rawat Inap** | Unit tujuan/asal pada berbagai skenario transfer: tujuan (RJ→RI, IGD→RI, IBS→RI, Hemodialisa→RI), asal (RI→IBS, RI→Hemodialisa), serta antar Bangsal RI. |
| **Rawat Jalan** | Unit asal pada skenario Rawat Jalan → Rawat Inap. |
| **IGD** | Unit asal pada skenario IGD → Rawat Inap. |
| **IBS** | Unit tujuan pada skenario Rawat Inap → IBS; unit asal pada skenario IBS → Rawat Inap. |
| **Hemodialisa** | Unit tujuan pada skenario Rawat Inap → Hemodialisa; unit asal pada skenario Hemodialisa → Rawat Inap. |
| **Bed Management** | Sumber data alokasi bed/ketersediaan untuk perpindahan pasien ke bangsal. |

Dependency lintas modul: **TPPRI**, **Rawat Inap**, **Bed Management**, **EMR**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter pengirim | Primary | Mendokumentasikan kondisi klinis pasien & mengisi bagian SBAR pada unit asal. |
| Perawat pengirim | Primary | Mendokumentasikan kondisi klinis, alat bantu, obat yang diberikan pada unit asal. |
| Perawat penerima | Secondary | Menerima informasi handover di unit tujuan. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. SPRI diterbitkan.
2. Registrasi TPPRI.
3. Pengisian Transfer Internal (wajib diselesaikan).
4. Pulangkan ke Rawat Inap.
5. Pasien baru dapat masuk ke bangsal setelah Form Transfer Internal selesai diisi.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Registrasi rawat inap dan alokasi bed diselesaikan sesuai alur pelayanan (SPRI → Registrasi TPPRI).
2. Pasien dapat langsung dipindahkan ke bangsal setelah proses administrasi rawat inap selesai, **tanpa menunggu** kelengkapan Form Transfer Internal.
3. Form Transfer Internal dapat diisi sebelum maupun sesudah pasien berpindah ke unit tujuan.
4. Seluruh informasi handover yang diisi langsung tersimpan ke rekam medis pasien (EMR), kapan pun form tersebut dilengkapi.
5. Sistem tetap melakukan validasi terhadap data wajib pada saat penyimpanan Form Transfer Internal, namun validasi tersebut tidak menghambat proses admission maupun perpindahan pasien.
6. Data Transfer Internal tetap terhubung dengan registrasi rawat inap aktif dan tersimpan sebagai bagian rekam medis pasien meski dilengkapi belakangan.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Bisnis Proses | Form Transfer Internal mandatory sebelum pasien pindah ke bangsal | Pengisian form tidak lagi menjadi dependensi perpindahan pasien; dapat dilengkapi sebelum/sesudah pindah |
| User Experience | Tampilan padat white space, banyak scrolling | Tampilan dioptimalkan — white space dikurangi, pengelompokan lebih ringkas, lebih sedikit scrolling |
| Logic System | Form Transfer Internal sebagai prasyarat (blocking process) | Form Transfer Internal bukan syarat teknis perpindahan; validasi tetap berjalan saat simpan namun tidak blocking |

## 7. Main Flow / Mindmap

### Skenario 1 — Rawat Jalan → Rawat Inap
1. Pasien menyelesaikan proses administrasi rawat inap (SPRI, Registrasi TPPRI, alokasi bed).
2. Pasien dapat langsung dipindahkan ke bangsal begitu proses administrasi selesai.
3. Form Transfer Internal dapat diisi oleh dokter/perawat pengirim sebelum atau sesudah pasien berpindah, melalui entry point: **Dashboard Pelayanan Poli Rawat Jalan → menu Three Dots → Form Transfer Internal**.

### Skenario 2 — IGD → Rawat Inap
1. Sama seperti Skenario 1, dengan unit asal IGD.
2. Entry point: **Dashboard Pelayanan IGD → menu Three Dots → Form Transfer Internal**.

### Skenario 3 — Rawat Inap → IBS
1. Pasien rawat inap dipindahkan ke IBS sesuai alur pelayanan operasi.
2. Form Transfer Internal mendokumentasikan kondisi klinis, alat bantu, obat, dan rekomendasi untuk unit IBS; dapat dilengkapi sebelum/sesudah pasien berpindah.
3. Entry point: **Input EMR Rawat Inap → Transfer Internal**.

### Skenario 4 — Rawat Inap → Hemodialisa
1. Pasien rawat inap dipindahkan ke unit Hemodialisa.
2. Form Transfer Internal mendokumentasikan kondisi klinis pasien menjelang sesi HD; dapat dilengkapi sebelum/sesudah pasien berpindah.
3. Entry point: **Input EMR Rawat Inap → Transfer Internal**.

### Skenario 5 — Antar Bangsal Rawat Inap
1. Pasien dipindahkan antar bangsal/bed dalam rawat inap.
2. Form Transfer Internal mendokumentasikan alasan & cara perpindahan; perpindahan bed tidak menunggu kelengkapan form.
3. Entry point: **Input EMR Rawat Inap → Transfer Internal**.

### Skenario 6 — IBS → Rawat Inap
1. Pasien selesai tindakan di IBS dan dipindahkan kembali ke rawat inap.
2. Form Transfer Internal mendokumentasikan kondisi klinis pasca-tindakan (kondisi umum, vital sign, GCS, skala nyeri), tindakan medis yang telah dilakukan, alat bantu terpasang, dan rekomendasi/instruksi lanjutan untuk unit rawat inap; dapat dilengkapi sebelum/sesudah pasien berpindah.
3. Entry point: **Input EMR Rawat Inap → Transfer Internal**, atau **Dashboard Pelayanan IBS → Form Transfer Internal**.

### Skenario 7 — Hemodialisa → Rawat Inap
1. Pasien selesai menjalani sesi hemodialisa dan dipindahkan kembali ke rawat inap.
2. Form Transfer Internal mendokumentasikan kondisi klinis pasca-sesi HD dan rekomendasi/instruksi lanjutan untuk unit rawat inap; dapat dilengkapi sebelum/sesudah pasien berpindah.
3. Entry point: **Dashboard Pelayanan Hemodialisa → menu Three Dots → Form Transfer Internal**.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|-----------------|
| **BR-001** | Form Transfer Internal dapat diisi sebelum maupun sesudah pasien berpindah ke unit tujuan. | Behavior — Draft user |
| **BR-002** | Perpindahan pasien ke bangsal tidak bergantung pada kelengkapan pengisian Form Transfer Internal. | Behavior — Draft user |
| **BR-003** | Seluruh informasi handover yang diisi pada Form Transfer Internal langsung tersimpan ke rekam medis pasien (EMR). | Behavior — Draft user |
| **BR-004** | Informasi transfer tetap dapat dilengkapi setelah pasien berhasil masuk ke bangsal apabila diperlukan. | Behavior — Draft user |
| **BR-005** | Setelah pasien selesai melakukan registrasi rawat inap dan memperoleh alokasi bed, pasien dapat langsung dipindahkan ke bangsal sesuai alur pelayanan, tanpa menunggu Form Transfer Internal. | Aspek Logic System — Draft user |
| **BR-006** | Form Transfer Internal tetap dapat dibuat, diperbarui, maupun dilengkapi setelah pasien resmi masuk ke bangsal. | Aspek Logic System — Draft user |
| **BR-007** | Seluruh data Transfer Internal tetap terhubung dengan registrasi rawat inap aktif dan tersimpan sebagai bagian dari rekam medis pasien. | Aspek Logic System — Draft user |
| **BR-008** | Sistem tetap melakukan validasi terhadap data wajib pada saat penyimpanan Form Transfer Internal, namun validasi tersebut tidak menghambat proses admission maupun perpindahan pasien. | Aspek Logic System — Draft user |
| **BR-009** | Field wajib pada Form Transfer Internal mengikuti spesifikasi per section SBAR (lihat Data Requirements), antara lain: Dokter Pengirim, Perawat Pengirim, Cara Pindah, Tanggal & Waktu Pindah, Unit Tujuan, Pindah Ruang (Bangsal/Ruangan/Bed — untuk skenario menuju RI), DPJP, Alasan Pindah, Keadaan Umum Saat Pindah, Vital Sign, Diagnosis Medis, Tindakan Medis, dan Diagnosis Keperawatan. | Data Requirements |

## 9. Functional Requirements

| ID | Functional Requirement | Trace |
|----|--------------------------|-------|
| **FR-001** | **Pencatatan Transfer Internal 7 skenario** — mencatat perpindahan pasien pada skenario Rawat Jalan→RI, IGD→RI, RI→IBS, RI→Hemodialisa, Antar Bangsal RI, IBS→RI, dan Hemodialisa→RI. | [US-001; BR-001] |
| **FR-002** | **Dokumentasi SBAR** — form mendukung dokumentasi handover dengan format Situation, Background, Assessment, Recommendation. | [US-002] |
| **FR-003** | **Dokumentasi pengirim & penerima** — mencatat dokter pengirim, perawat pengirim, perawat penerima, dan waktu transfer. | [US-003] |
| **FR-004** | **Dokumentasi perpindahan pasien** — mencatat unit asal, unit tujuan, bangsal, ruangan, bed tujuan, cara perpindahan, dan alasan perpindahan; dikelompokkan pada section **Situation** (SBAR). | [US-001] |
| **FR-005** | **Dokumentasi kondisi klinis pasien** — mencatat Vital Sign, GCS, Skala Nyeri, kondisi umum, riwayat alergi, diagnosis medis, diagnosis keperawatan, dan tindakan medis yang telah dilakukan; dikelompokkan pada section **Background** dan **Assessment** (SBAR). | [US-002] |
| **FR-006** | **Dokumentasi alat bantu terpasang** pada pasien. | [US-002] |
| **FR-007** | **Dokumentasi obat yang sedang diberikan** kepada pasien. | [US-002] |
| **FR-008** | **Dokumentasi pemeriksaan penunjang** yang disertakan saat transfer. | [US-002] |
| **FR-009** | **Dokumentasi rekomendasi dan instruksi lanjutan** kepada unit penerima. | [US-002] |
| **FR-010** | **Penyimpanan non-blocking** — Form Transfer Internal dapat disimpan/dilengkapi sebelum maupun sesudah pasien berpindah, tanpa menghambat proses perpindahan ke bangsal. | [US-004; BR-001; BR-002; BR-008] |
| **FR-011** | **Integrasi eksternal** — dengan EMR, TPPRI, Rawat Inap, Rawat Jalan, IGD, IBS, Hemodialisa, dan Bed Management. | [BR-003; BR-007] |
| **FR-012** | **Header Identifikasi Pasien** — menampilkan No. RM, Nama Pasien, Status Pasien, Tanggal Lahir + Umur, dan Jenis Kelamin secara sticky di bagian atas Form Transfer Internal. | [Data Requirements — Header Form] |
| **FR-013** | **Entry point Form Transfer Internal per unit** — Dashboard Pelayanan Poli Rawat Jalan (menu Three Dots) untuk Skenario 1; Dashboard Pelayanan IGD (menu Three Dots) untuk Skenario 2; Input EMR Rawat Inap → Transfer Internal untuk Skenario 3, 4, dan 5; Input EMR Rawat Inap → Transfer Internal atau Dashboard Pelayanan IBS untuk Skenario 6; Dashboard Pelayanan Hemodialisa (menu Three Dots) untuk Skenario 7. | [Main Flow] |

## 10. User Stories

> Format "Sebagai … ingin … sehingga …". AC pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|------------------------------------------|-------|
| **US-001** | Sebagai **dokter/perawat pengirim**, saya ingin mendokumentasikan perpindahan pasien antar unit pelayanan, sehingga informasi klinis pasien dapat diteruskan secara utuh kepada unit penerima. | 1) Given pasien akan berpindah unit, When dokter/perawat mengisi Form Transfer Internal, Then data unit asal, tujuan, bangsal, ruangan, bed, cara & alasan perpindahan tersimpan (FR-004). 2) Given form belum lengkap, When pasien sudah dipindahkan ke bangsal, Then perpindahan tetap dapat dilakukan (BR-002). | [FR-001; FR-004; BR-001; BR-002] |
| **US-002** | Sebagai **dokter/perawat**, saya ingin mendokumentasikan handover menggunakan format SBAR beserta kondisi klinis, alat bantu, obat, pemeriksaan penunjang, dan rekomendasi, sehingga unit penerima memperoleh informasi klinis yang lengkap dan terstruktur. | 1) Given form Transfer Internal dibuka, When user mengisi section Situation/Background/Assessment/Recommendation, Then seluruh data tersimpan ke EMR (BR-003). | [FR-002; FR-005; FR-006; FR-007; FR-008; FR-009] |
| **US-003** | Sebagai **perawat/dokter unit penerima**, saya ingin melihat informasi dokter pengirim, perawat pengirim, perawat penerima, dan waktu transfer, sehingga saya dapat mengidentifikasi pihak yang bertanggung jawab dan menghubungi unit asal bila diperlukan. | 1) Given Form Transfer Internal tersimpan, When unit penerima membuka dokumen, Then informasi pengirim/penerima & waktu transfer tampil (FR-003). | [FR-003] |
| **US-004** | Sebagai **dokter/perawat**, saya ingin dapat menyimpan Form Transfer Internal kapan pun — sebelum atau sesudah pasien berpindah — sehingga dokumentasi tetap lengkap tanpa mengganggu alur pelayanan pasien. | 1) Given pasien sudah masuk ke bangsal, When dokter/perawat melengkapi Form Transfer Internal, Then data tersimpan & tetap terhubung dengan registrasi rawat inap aktif (BR-006; BR-007). 2) Given data wajib belum lengkap, When user menyimpan form, Then sistem tetap menjalankan validasi data wajib tanpa menghambat proses admission (BR-008). | [FR-010; BR-001; BR-002; BR-006; BR-007; BR-008] |

## 11. Data Requirements (Spesifikasi Field)

> Spesifikasi field pada section ini mengikuti definisi yang sudah ditetapkan pada dokumen `PRD_Transfer_Internal.md` (bagian Data Requirement), disesuaikan strukturnya agar dokumentasi kondisi klinis & perpindahan pasien dikelompokkan berdasarkan format **SBAR** (Situation, Background, Assessment, Recommendation).

### A. Header Form — Identitas Pasien (tampil sticky di seluruh form, FR-012)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| no_rm | No. RM | Read-only | — | — | Autofill dari Pendaftaran Pasien | Autofill, tidak dapat diubah user |
| nama_pasien | Nama Pasien | Read-only | — | — | Autofill dari Data Sosial Pasien — Nama Pasien | Autofill, tidak dapat diubah user |
| status_pasien | Status Pasien | Read-only | — | — | Autofill dari Data Sosial Pasien — Status Pasien | Autofill, tidak dapat diubah user |
| tanggal_lahir_umur | Tanggal Lahir + Umur | Read-only | — | Tanggal lahir + usia dalam tahun | Autofill dari Data Sosial Pasien — Tanggal Lahir + Umur Pasien | Autofill, tidak dapat diubah user |
| jenis_kelamin | Jenis Kelamin | Read-only | — | — | Autofill dari Data Sosial Pasien — Jenis Kelamin Pasien | Autofill, tidak dapat diubah user |

### B. Informasi Pengirim & Penerima Transfer (FR-003)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| dokter_pengirim | Dokter Pengirim | Single select dropdown | Ya | — | Autofill dari DPJP Utama; sumber data Master Data Staf (profesi dokter) | Editable |
| perawat_pengirim | Perawat Pengirim | Single select dropdown | Ya | — | Sumber data Master Data Staf (profesi perawat) | Editable |
| perawat_penerima | Perawat Penerima | Single select dropdown | Tidak | — | Sumber data Master Data Staf (profesi perawat) | Editable |
| tanggal_waktu_transfer | Tanggal & Waktu Transfer | Date & time picker | Tidak | Format tanggal DD/MM/YYYY; format waktu HH:MM; dapat back-date & post-date | Autofill default tanggal & waktu sistem saat form diisi | Editable |

### C. Dokumentasi Kondisi Klinis & Perpindahan Pasien — dikelompokkan berdasarkan SBAR

#### C.1 Situation (Situasi) — FR-004
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| status_penjamin | Status | Read-only | — | — | Autofill dari tipe penjamin | — |
| cara_pindah | Cara Pindah | Radio button | Ya | Pilihan: Kursi Roda / Brankar / Mandiri | — | Editable |
| tanggal_pindah | Tanggal Pindah | Date picker | Ya | Format DD/MM/YYYY; dapat back-date & post-date | Autofill default tanggal sistem | Editable |
| waktu_pindah | Waktu Pindah | Time picker | Ya | Format HH:MM; dapat back-date & post-date | Autofill default waktu sistem | Editable |
| ruang_asal | Ruang Asal | Read-only | — | — | Autofill dari unit asal | — |
| unit_tujuan | Unit Tujuan | Radio button | Ya | Pilihan: Bangsal / Ruang IBS / Ruang Hemodialisa `[PERLU KONFIRMASI]` — perlu ditambahkan opsi untuk skenario arah balik (mis. Ruang Rawat Inap untuk IBS→RI/Hemodialisa→RI) | — | Editable |
| pindah_bangsal | Pindah Ruang — Pilih Bangsal | Single select dropdown | Ya (untuk skenario menuju RI) | — | Autofill dari pemilihan bangsal TPPRI untuk IGD/RJ/IBS; sumber data Master Data Bangsal & Bed | Editable |
| pindah_ruangan | Pindah Ruang — Pilih Ruangan | Single select dropdown | Ya (untuk skenario menuju RI) | Tampilan format "Ruang - Kelas" (mis. "Ruang 203 - Kls. I") | Autofill dari pemilihan bangsal TPPRI untuk IGD/RJ/IBS; sumber data Master Data Kamar | Editable |
| pindah_bed | Pindah Ruang — Pilih Bed | Single select dropdown | Ya (untuk skenario menuju RI) | Hanya menampilkan bed berstatus tersedia | Autofill dari pemilihan bangsal TPPRI untuk IGD/RJ/IBS; sumber data Master Data Bed | Editable |
| dpjp | DPJP | Single select dropdown | Ya | — | Autofill dari DPJP Utama; sumber data Master Data Staf (profesi dokter) | Editable |

#### C.2 Background — FR-004 / FR-005
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| alasan_rawat_inap | Alasan Rawat Inap | Text input | Tidak | Min 0 — Max 255 karakter | — | — |
| riwayat_alergi | Riwayat Alergi | Radio button | Tidak | Pilihan: Ada / Tidak Ada (default: Tidak Ada); bila "Ada" tampil text area tambahan | Autofill dari asesmen perawat — riwayat alergi | Editable |

#### C.3 Assessment — FR-005
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| alasan_pindah | Alasan Pindah | Radio button | Ya | Pilihan: Atas permintaan dokter / Atas permintaan sendiri / Menyesuaikan penjamin | — | Editable |
| keadaan_umum | Keadaan Umum Saat Pindah | Radio button | Ya | Pilihan: Baik / Sedang / Buruk | — | Editable |
| vital_sign | Vital Sign | — | Ya | — | Autofill dari TTV — Asesmen Perawat | Editable |
| gcs_eye | GCS — Eye | Radio button | Tidak | Pilihan skor: Spontan (4) / Respon terhadap suara (3) / Respon terhadap nyeri (2) / Tidak ada (1) | Autofill dari asesmen dokter — GCS | Editable |
| gcs_motor | GCS — Motor | Radio button | Tidak | Pilihan skor: Menuruti perintah (6) / Melokalisir nyeri (5) / Fleksi normal (4) / Fleksi abnormal (3) / Ekstensi (2) / Tidak ada (1) | Autofill dari asesmen dokter — GCS | Editable |
| gcs_verbal | GCS — Verbal | Radio button | Tidak | Pilihan skor: Orientasi baik (5) / Bingung (4) / Pembicaraan tidak sesuai (3) / Mengerang (2) / Tidak ada (1) | Autofill dari asesmen dokter — GCS | Editable |
| gcs_kesimpulan | Kesimpulan GCS | Read-only | — | Menampilkan total skor + interpretasi (mis. "15 (Compos Mentis)") | Autofill dari hasil kalkulasi GCS (Eye+Motor+Verbal) | Auto-update saat E/M/V berubah |
| diagnosis_medis | Diagnosis Medis | Text input | Ya | Min 3 — Max 200 karakter; dapat tambah/hapus baris (multi-entry) | Autofill dari hasil asesmen dokter — diagnosis | Editable |
| tindakan_medis | Tindakan Medis + Waktu Tindakan | Text input + time field | Ya | Min 3 — Max 200 karakter; field waktu format HH:MM; dapat tambah/hapus baris | Autofill dari hasil asesmen dokter — tindakan | Editable |
| diagnosis_keperawatan | Diagnosis Keperawatan | Single select dropdown | Ya | Daftar diagnosis keperawatan baku (mis. Nyeri Akut, Risiko Jatuh, Hipertermia, dll.); dapat tambah/hapus baris | Autofill dari hasil asesmen perawat — diagnosis keperawatan | Editable |
| skala_nyeri | Skala Nyeri | Numerik input | Tidak | Rentang 0–10; tidak boleh desimal/negatif | Autofill dari hasil asesmen perawat — nilai nyeri | Editable |
| hasil_pemeriksaan | Hasil Pemeriksaan | Checkbox (multiple) | Tidak | Pilihan: Foto Rontgen / CT Scan; field "lembar" (numerik, 1–100 karakter, tidak boleh desimal/negatif) aktif bila checkbox dipilih | — | Editable |
| penunjang_disertakan | Penunjang yang Disertakan | Checkbox (multiple) | Tidak | Pilihan: USG / EEG / EKG / Laboratorium / Lainnya; "Lainnya" menampilkan text input tambahan (max 200 karakter) | — | Editable |
| penunjang_medis | Penunjang Medis | Text input | Tidak | Max 500 karakter | — | Editable |
| alat_bantu | Alat Bantu Terpasang + Tanggal | Text input + date | Tidak | Max 500 karakter; format tanggal DD/MM/YYYY, dapat back-date/post-date; dapat tambah/hapus baris | — | Editable |
| obat_diberikan | Obat yang Diberikan (Nama Obat, Dosis, Sediaan, Aturan Pakai, Cara Pemberian, Tanggal, Jumlah, Satuan) | Grup field (multi-entry) | Tidak (seluruh sub-field opsional) | Nama Obat: teks, max 500. Dosis: numerik, boleh desimal, tidak boleh negatif. Sediaan & Satuan: teks, max 500. Aturan Pakai: teks, max 500. Cara Pemberian: dropdown dari Master Data ROA. Tanggal: format DD/MM/YYYY, dapat back-date/post-date. Jumlah: numerik, tidak boleh negatif | Autofill dari e-resep yang telah diserahkan | Dapat tambah/hapus baris; seluruh sub-field editable |

#### C.4 Recommendation (Rekomendasi) — FR-002
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| rekomendasi | Rekomendasi | Text area | Tidak | Min 0 — Max 500 karakter | Autofill dari field Rencana Pelayanan pada asesmen dokter unit asal | Editable |

### D. Mapping Autofill Transfer Internal

> Mapping berikut mengikuti definisi pada dokumen `PRD_Transfer_Internal.md` (bagian Mapping Autofill Transfer Internal), menjelaskan dari mana masing-masing field terisi otomatis per skenario/unit asal.

#### D.1 General (berlaku di semua skenario)
| Field | Autofill dari |
|-------|----------------|
| Nama Dokter Yang Mengirim | DPJP Utama |
| Waktu Pengisian | Tanggal: default hari ini by sistem; Waktu: default by sistem |
| Status | Sumber data dari tipe penjamin |
| Tanggal Pindah | Default hari ini by sistem |
| Jam Pindah | Default jam by sistem |
| Ruang Asal | Unit Asal |
| DPJP | DPJP Utama |
| Obat yang Diberikan | E-Resep yang telah diserahkan |
| Pindah ke Ruang | Pemilihan bangsal |

#### D.2 IGD → Rawat Inap
| Field | Autofill dari |
|-------|----------------|
| Riwayat Alergi | Asesmen Perawat → Riwayat Alergi |
| Vital Sign (TD, Nadi, Respirasi, Suhu Badan) | Asesmen Perawat → TTV |
| Skala Nyeri | Asesmen Perawat → Nilai Nyeri |
| Diagnosis Keperawatan | Asesmen Perawat → Diagnosa Keperawatan |
| GCS (Eye, Motor, Verbal, Kesimpulan) | Asesmen Dokter → GCS (E-M-V) + Total |
| Diagnosis Medis | Asesmen Dokter → Diagnosa |
| Tindakan Medis | Asesmen Dokter → Tindakan |
| Rekomendasi | Asesmen Dokter → Rencana Pelayanan |

#### D.3 Rawat Jalan → Rawat Inap
| Field | Autofill dari |
|-------|----------------|
| Alasan Rawat Inap | Asesmen Perawat → Keluhan Umum |
| Riwayat Alergi | Asesmen Perawat → Riwayat Alergi |
| Vital Sign (TD, Nadi, Respirasi, Suhu Badan) | Asesmen Perawat → TTV |
| Skala Nyeri | Asesmen Perawat → Nilai Nyeri |
| Diagnosis Keperawatan | Asesmen Perawat → Diagnosa Keperawatan |
| Diagnosis Medis | Asesmen Dokter → Diagnosa |
| Tindakan Medis | Asesmen Dokter → Tindakan |
| Rekomendasi | Asesmen Dokter → Instruksi Rawat Inap |

#### D.4 Antar Bangsal Rawat Inap
| Field | Autofill dari |
|-------|----------------|
| Vital Sign (TD, Nadi, Respirasi, Suhu Badan) | CPPT → TTV |
| Diagnosis Keperawatan | Asesmen Perawat RI → Diagnosa Keperawatan |
| Diagnosis Medis | CPPT → Diagnosa |
| Tindakan Medis | CPPT → Tindakan |
| Rekomendasi | CPPT → Rencana Tindakan |

#### D.5 Hemodialisa → Rawat Inap
| Field | Autofill dari |
|-------|----------------|
| Vital Sign (TD, Nadi, Respirasi, Suhu Badan) | Asesmen Perawat → TTV |
| Skala Nyeri | Asesmen Perawat → Nilai Nyeri |
| Diagnosis Medis | Asesmen Dokter → Diagnosa |
| Tindakan Medis | Asesmen Dokter → Tindakan |
| Rekomendasi | Asesmen Dokter → Rencana Pelayanan |

#### D.6 Rawat Inap → IBS, Rawat Inap → Hemodialisa, IBS → Rawat Inap
`[PERLU KONFIRMASI]` Mapping autofill spesifik untuk ketiga skenario ini belum dirinci pada dokumen sumber — perlu konfirmasi apakah mengikuti pola mapping D.4 (Antar Bangsal RI, berbasis CPPT) atau memiliki sumber data tersendiri.

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|--------------|--------|
| **NFR-001** | Performa | `[PERLU KONFIRMASI]` — Mempercepat proses admission rawat inap; target waktu/durasi spesifik belum disebutkan sumber. | Ekspektasi |
| **NFR-002** | Usability | Tampilan form dioptimalkan dengan mengurangi white space, pengelompokan informasi lebih ringkas, dan lebih sedikit scrolling saat pengisian. | Aspek UX |
| **NFR-003** | Auditabilitas | `[PERLU KONFIRMASI]` — Sumber tidak merinci ketentuan audit log (siapa/kapan record dibuat/diubah). | — |
| **NFR-004** | Keamanan/RBAC | `[PERLU KONFIRMASI]` — Sumber tidak merinci hak akses per peran (dokter/perawat pengirim/penerima). | — |
| **NFR-005** | Reliabilitas | Seluruh informasi handover langsung tersimpan ke rekam medis pasien, termasuk saat dilengkapi setelah pasien masuk bangsal. | Behavior |

## 13. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|------------------------|--------|-------|
| **EMR** | Menyimpan seluruh dokumentasi handover Transfer Internal sebagai bagian rekam medis pasien. | `[PERLU KONFIRMASI]` | [FR-011; BR-003] |
| **TPPRI** | Sumber data registrasi rawat inap; data Transfer Internal terhubung dengan registrasi aktif. | `[PERLU KONFIRMASI]` | [FR-011; BR-007] |
| **Rawat Inap** | Unit asal/tujuan pada berbagai skenario transfer (tujuan dari RJ, IGD, IBS, Hemodialisa; asal ke IBS, Hemodialisa; serta antar Bangsal). | `[PERLU KONFIRMASI]` | [FR-001; FR-011] |
| **Rawat Jalan** | Unit asal pada skenario Rawat Jalan → Rawat Inap. | `[PERLU KONFIRMASI]` | [FR-001; FR-011] |
| **IGD** | Unit asal pada skenario IGD → Rawat Inap. | `[PERLU KONFIRMASI]` | [FR-001; FR-011] |
| **IBS** | Unit tujuan pada skenario Rawat Inap → IBS; unit asal pada skenario IBS → Rawat Inap. | `[PERLU KONFIRMASI]` | [FR-001; FR-011] |
| **Hemodialisa** | Unit tujuan pada skenario Rawat Inap → Hemodialisa; unit asal pada skenario Hemodialisa → Rawat Inap. | `[PERLU KONFIRMASI]` | [FR-001; FR-011] |
| **Bed Management** | Sumber data alokasi/ketersediaan bed tujuan. | `[PERLU KONFIRMASI]` | [FR-004; FR-011] |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|--------------------------|
| TPPRI (Registrasi RI & alokasi bed) | Hard | Tanpa registrasi & alokasi bed selesai, pasien belum dapat dipindahkan ke bangsal — namun ini di luar kendali Form Transfer Internal itu sendiri. |
| Bed Management | Hard | Data bed tujuan (bangsal/ruangan/bed) bergantung pada ketersediaan data dari modul ini. |
| EMR | Hard | Tanpa integrasi EMR, dokumentasi handover tidak tersimpan sebagai bagian rekam medis pasien. |
