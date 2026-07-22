# PRD — Asesmen Rehabilitasi Medik (Optimalisasi Layout UI)

**Related Document:** PRD Asesmen Rehab Medik — Neurovi V1 (referensi As-Is); Mapping Asesmen Rawat Jalan — sheet "Rehab Medik"
**Dokumen ID:** [PERLU KONFIRMASI]
**Versi:** 1.0 (Draft — Untuk Direview)
**Tanggal Disusun:** 16 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Modul Asesmen Rehabilitasi Medik adalah formulir pengisian asesmen klinis berformat SOAP (Subjektif, Objektif, Asesmen, Planning) yang digunakan oleh dokter spesialis kedokteran fisik dan rehabilitasi untuk mendokumentasikan pemeriksaan pasien rehabilitasi medik sebagai bagian dari rekam medis elektronik (EMR). Pada Neurovi v1, seluruh field dan alur pengisian asesmen — mulai dari anamnesis, pemeriksaan fisik dan uji fungsi, diagnosis medis (ICD-10), diagnosis fungsi, pemeriksaan penunjang, tata laksana rehabilitasi medis (ICD-9), program terapi, hingga edukasi/anjuran/evaluasi — sudah berjalan dan didukung penuh, namun tampilan halaman memiliki whitespace berlebihan, ukuran textbox yang belum proporsional, serta membutuhkan scrolling vertikal yang panjang.

Lingkup Fase 1 (MVP) modul ini **murni optimalisasi tampilan antarmuka (UI/layout)** — mengelompokkan section, memadatkan informasi, menyesuaikan ukuran komponen input, dan merapikan tata letak agar responsif di desktop dan tablet. **Tidak ada perubahan pada alur proses bisnis maupun logika sistem (validasi, kalkulasi, aturan simpan) yang sudah berjalan di v1** — seluruh fungsi dan urutan pengisian dipertahankan apa adanya.

> Referensi: Mapping Asesmen Rawat Jalan — sheet "Rehab Medik".

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — Mapping Asesmen Rawat Jalan (sheet "Rehab Medik"):
- Asesmen rehab medik sudah mendukung pengisian lengkap: anamnesis, pemeriksaan fisik & uji fungsi, diagnosis medis (ICD-10), diagnosis fungsi, pemeriksaan penunjang, tata laksana KFR (ICD-9), program terapi beserta frekuensi tindakan, edukasi, anjuran, dan evaluasi.
- Tampilan halaman belum dioptimalkan: whitespace berlebihan, textbox belum proporsional terhadap karakteristik datanya, pengelompokan section belum terstruktur berdasarkan kategori klinis, area Program Terapi belum ringkas untuk tambah/hapus tindakan, alignment antar-komponen belum konsisten, dan tampilan tombol aksi belum optimal.

**Masalah/pain point:**
- Aspek bisnis proses: `Tidak terdapat perubahan proses bisnis dibandingkan V1.`
- Aspek UX: whitespace berlebihan → informasi yang tampil dalam satu layar terbatas; scrolling vertikal panjang; pengelompokan section belum jelas; ukuran textbox belum proporsional; area Program Terapi kurang ringkas; alignment komponen belum konsisten; tampilan tombol aksi belum optimal.
- Aspek logic system: `Tidak terdapat perubahan logic system dibandingkan V1.`

**Dampak utama yang disasar v2:**
- Dokter dapat menyelesaikan dokumentasi asesmen lebih cepat dengan informasi lebih padat dan mudah dibaca · Mengurangi kebutuhan scrolling vertikal.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = Seluruh scope optimalisasi layout UI pada Section 3 di bawah, dalam satu rilis.

> Catatan volume: pasien rehabilitasi medik biasanya sekitar 40–60 pasien per hari.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Optimalisasi layout asesmen** — menata ulang struktur halaman formulir asesmen.
2. **Pengurangan whitespace** — memampatkan ruang kosong berlebihan agar lebih banyak informasi tampil per layar.
3. **Responsive layout desktop dan Tablet** — tata letak menyesuaikan lebar layar desktop dan tablet.
4. **Pengelompokan section asesmen** — mengelompokkan komponen berdasarkan kategori informasi klinis (Subjektif, Objektif, Asesmen, Planning sesuai mapping "Rehab Medik").
5. **Penyesuaian ukuran textbox** — ukuran area input disesuaikan dengan karakteristik data yang diinput (mis. anamnesis vs field singkat).
6. **Optimalisasi area Program Terapi** — tampilan lebih ringkas, konsisten, memudahkan tambah/hapus tindakan.
7. **Konsistensi alignment komponen**.
8. **Optimalisasi tampilan tombol aksi**.

### Out Scope
- Perubahan proses bisnis asesmen rehab medik — di luar lingkup, tidak ada perubahan alur.
- Perubahan logic/validasi sistem yang sudah berjalan di v1.
- Penambahan field atau kapabilitas baru di luar struktur data yang sudah ada pada mapping "Rehab Medik".
- Optimalisasi tampilan untuk perangkat mobile/handphone.

## 4. Goals and Metrics

### Tujuan
Meningkatkan efisiensi pengisian asesmen rehabilitasi medik melalui optimalisasi tampilan antarmuka sehingga informasi lebih padat, mudah dibaca, dan mengurangi kebutuhan scrolling — tanpa mengubah alur bisnis maupun logika sistem yang telah berjalan.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu simpan & update asesmen oleh dokter | < 1 detik | NFR-001 |
| Volume pasien rehab medik yang didukung | ± 40–60 pasien/hari | Behavior (Performance Expectation) |
| Pengurangan scrolling vertikal / percepatan waktu pengisian | [PERLU KONFIRMASI — belum ada target kuantitatif dari sumber] | — |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Rekam Medis Elektronik (EMR) | Konsumen — hasil simpan asesmen rehab medik menjadi bagian dari EMR pasien. |
| Master Data Diagnosa (ICD-10) | Sumber lookup — diagnosis medis dan diagnosis fungsi. |
| Master Data Procedure (ICD-9) | Sumber lookup — kode tata laksana KFR. |

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|-----------------------|
| Dokter Spesialis Kedokteran Fisik dan Rehabilitasi | Primary | Mengisi dan menyimpan asesmen rehabilitasi medik pasien. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Dokter membuka formulir asesmen rehab medik pasien.
2. Dokter mengisi bagian Subjektif (anamnesis, hubungan dengan keluarga, indikasi suspek penyakit akibat kerja).
3. Dokter mengisi bagian Objektif (pemeriksaan fisik dan uji fungsi).
4. Dokter mengisi bagian Asesmen (diagnosis medis dengan ICD-10, diagnosis fungsi dengan ICD-10, pemeriksaan penunjang).
5. Dokter mengisi bagian Planning (tata laksana KFR/ICD-9, program terapi beserta tindakan dan frekuensi, edukasi, anjuran, evaluasi).
6. Dokter menyimpan asesmen sebagai bagian rekam medis elektronik pasien.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1–6. Sama persis dengan langkah As-Is di atas — **tidak ada perubahan urutan maupun logika pengisian**. Perubahan hanya pada tata letak dan tampilan tiap section agar lebih padat, terkelompok, dan minim scrolling.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Proses bisnis & urutan pengisian | Anamnesis → Objektif → Asesmen → Planning → Simpan | Tidak berubah |
| Logic/validasi sistem | Sesuai aturan existing (mis. Tindakan wajib bila Program Terapi dipilih) | Tidak berubah |
| Tata letak | Whitespace berlebihan, section belum terkelompok jelas, kebanyakan satu kolom | Section dikelompokkan per kategori klinis (Subjektif/Objektif/Asesmen/Planning), layout dua kolom di desktop |
| Ukuran textbox | Seragam, belum proporsional terhadap jenis data | Disesuaikan per karakteristik data (mis. anamnesis lebih besar, field singkat lebih ringkas) |
| Area Program Terapi | Kurang ringkas untuk tambah/hapus tindakan | Ringkas, konsisten, mudah tambah/hapus tindakan |
| Scrolling | Vertikal panjang | Diminimalkan lewat pemadatan & pengelompokan |

## 7. Main Flow / Mindmap

### Skenario 1 — Pengisian asesmen rehab medik (alur normal)
1. Dokter membuka formulir asesmen pasien rehab medik.
2. Isi Subjektif: Anamnesis (free text); Hubungan dengan Keluarga (Diri Sendiri/Anak/Istri/Suami/Orang tua/Keluarga); Suspek Penyakit Akibat Kerja (Ya/Tidak).
3. Isi Objektif: Pemeriksaan Fisik dan Uji Fungsi (free text).
4. Isi Asesmen: Diagnosis Medis (Diagnosa + ICD-10); Diagnosis Fungsi (Diagnosa + ICD-10); Pemeriksaan Penunjang (free text).
5. Isi Planning: Goal Terapi (Tata Laksana KFR/ICD-9); pilih Program Terapi (multi-checkbox: Fisioterapi, Terapi Wicara, Terapi Okupasi, Psikologi); isi Tindakan, ICD-9, dan Frekuensi Tindakan per program terapi yang dipilih; isi Edukasi, Anjuran, Evaluasi.
6. Simpan asesmen → tersimpan sebagai bagian EMR pasien.

### Skenario 2 — Program Terapi lebih dari satu
1. Dokter memilih lebih dari satu checkbox Program Terapi (mis. Fisioterapi dan Terapi Wicara).
2. Sistem menampilkan baris Tindakan, ICD-9, dan Frekuensi Tindakan untuk masing-masing program terapi yang dipilih.
3. Dokter menambah/menghapus baris tindakan sesuai kebutuhan pada area Program Terapi yang telah dioptimalkan.

### Skenario 3 — Validasi Tindakan wajib
- Bila Program Terapi dipilih namun field Tindakan belum diisi, sistem menampilkan validasi wajib isi (perilaku existing, dipertahankan tanpa perubahan).

## 8. Business Rules

> Seluruh Business Rules berikut merupakan aturan existing pada Neurovi v1 yang **dipertahankan tanpa perubahan** — tidak ada penambahan/pengubahan logic pada Fase 1 MVP ini.

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Field **Tindakan** wajib diisi apabila **Program Terapi** dipilih. | Mapping "Rehab Medik" |
| **BR-002** | **Frekuensi Tindakan** diinput dalam format numerik dengan satuan "kali / minggu". | Mapping "Rehab Medik" |
| **BR-003** | Field **ICD-10** (Diagnosis Medis & Diagnosis Fungsi) dan **ICD-9** (Tata Laksana KFR) diisi melalui pencarian master data, bukan input bebas. | Mapping "Rehab Medik" |

## 9. Functional Requirements

| ID | Functional Requirement | Trace |
|----|--------------------------|-------|
| **FR-001** | **Pengelompokan Section** — mengelompokkan field asesmen ke dalam 4 kategori klinis: Subjektif, Objektif, Asesmen, Planning, sesuai struktur mapping "Rehab Medik". | US-001 |
| **FR-002** | **Layout Dua Kolom Desktop** — menampilkan section-section asesmen dalam layout dua kolom pada perangkat desktop untuk memanfaatkan ruang layar. | US-002 |
| **FR-003** | **Responsive Tablet** — menyesuaikan tata letak (kolom, ukuran komponen) pada perangkat tablet. | US-002 |
| **FR-004** | **Penyesuaian Ukuran Textbox** — ukuran area input disesuaikan dengan karakteristik data (mis. Anamnesis dan Pemeriksaan Fisik/Uji Fungsi memakai area teks lebih besar; field singkat seperti Frekuensi Tindakan memakai input ringkas). | US-003 |
| **FR-005** | **Optimalisasi Area Program Terapi** — tampilan checkbox Program Terapi beserta baris Tindakan/ICD-9/Frekuensi Tindakan dibuat ringkas dan konsisten, dengan aksi tambah/hapus baris tindakan yang jelas. | US-004; BR-001 |
| **FR-006** | **Konsistensi Alignment** — seluruh label, input, dan komponen antar-section memakai grid dan alignment yang konsisten. | US-005 |
| **FR-007** | **Optimalisasi Tombol Aksi** — tampilan tombol Simpan/Batal dioptimalkan agar mudah dijangkau tanpa mengganggu area input. | US-006 |
| **FR-008** | **Simpan Asesmen** — menyimpan seluruh data asesmen sebagai bagian rekam medis elektronik (EMR) sesuai logic existing, tanpa perubahan proses. | US-006; BR-001; BR-002 |

## 10. User Stories

> Format "Sebagai … ingin … sehingga …". AC pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|------------------------------------------|-------|
| **US-001** | Sebagai **dokter rehab medik**, saya ingin **tampilan asesmen dikelompokkan berdasarkan kategori klinis (Subjektif/Objektif/Asesmen/Planning)**, sehingga **saya dapat mengisi data sesuai urutan pemeriksaan tanpa kebingungan navigasi**. | 1) Given formulir asesmen dibuka, When halaman dimuat, Then field ditampilkan terkelompok dalam 4 section sesuai kategori (FR-001). | FR-001 |
| **US-002** | Sebagai **dokter rehab medik**, saya ingin **layout dua kolom pada desktop dan tampilan menyesuaikan pada tablet**, sehingga **ruang layar termanfaatkan maksimal dan tidak perlu scroll berlebihan**. | 1) Given perangkat desktop, When formulir dibuka, Then section ditampilkan dua kolom (FR-002). 2) Given perangkat tablet, When formulir dibuka, Then layout menyesuaikan lebar layar (FR-003). | FR-002; FR-003 |
| **US-003** | Sebagai **dokter rehab medik**, saya ingin **ukuran textbox proporsional terhadap jenis datanya**, sehingga **area input nyaman digunakan tanpa ruang terbuang**. | 1) Given field Anamnesis, When ditampilkan, Then area teks berukuran lebih besar dibanding field singkat (FR-004). | FR-004 |
| **US-004** | Sebagai **dokter rehab medik**, saya ingin **area Program Terapi yang ringkas**, sehingga **saya mudah menambah atau menghapus tindakan sesuai program terapi yang dipilih**. | 1) Given Program Terapi dipilih, When dokter menambah baris tindakan, Then baris Tindakan/ICD-9/Frekuensi baru muncul rapi di area yang sama (FR-005). 2) Given Program Terapi dipilih tanpa Tindakan diisi, When disimpan, Then sistem menampilkan validasi wajib isi (BR-001). | FR-005; BR-001 |
| **US-005** | Sebagai **dokter rehab medik**, saya ingin **alignment komponen konsisten di seluruh halaman**, sehingga **formulir mudah dibaca dan dipindai secara visual**. | 1) Given seluruh section ditampilkan, When dibandingkan, Then label dan input mengikuti grid yang sama (FR-006). | FR-006 |
| **US-006** | Sebagai **dokter rehab medik**, saya ingin **menyimpan asesmen dengan cepat (< 1 detik)**, sehingga **saya dapat melayani 40–60 pasien per hari tanpa hambatan waktu**. | 1) Given data asesmen telah diisi, When tombol Simpan ditekan, Then data tersimpan sebagai EMR dalam < 1 detik (FR-008; NFR-001). | FR-007; FR-008 |

## 11. Data Requirements (Spesifikasi Field)

> Field asesmen berikut mengikuti struktur mapping kanonik pada sheet **"Rehab Medik"** — nama, tipe, dan sumber data harus sama dengan mapping tersebut; PRD ini tidak menambah maupun mengurangi field.

### A. Layar INPUT — Formulir Asesmen Rehab Medik (FR-001)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| anamnesis | Anamnesis | Free text (textarea) | YA | — | Manual | Section: Subjektif |
| hubungan_keluarga | Hubungan dengan Keluarga | Pilihan tunggal (dropdown/radio) | TIDAK| Diri Sendiri / Anak / Istri / Suami / Orang tua / Keluarga | Manual | Section: Subjektif |
| suspek_pak | Suspek Penyakit Akibat Kerja | Pilihan tunggal (Ya/Tidak) | TIDAK | Ya / Tidak | Manual, Default: Tidak | Section: Subjektif |
| pemeriksaan_fisik_uji_fungsi | Pemeriksaan Fisik dan Uji Fungsi | Free text (textarea) | YA | — | Manual | Section: Objektif |
| diagnosa_medis | Diagnosa (Diagnosis Medis) | Free text | YA | — | Manual | Section: Asesmen |
| icd10_diagnosis_medis | ICD-10 (Diagnosis Medis) | Lookup | TIDAK | Master data diagnosa | Integrasi master data | Section: Asesmen |
| diagnosa_fungsi | Diagnosa (Diagnosis Fungsi) | Free text | YA | — | Manual | Section: Asesmen |
| icd10_diagnosis_fungsi | ICD-10 (Diagnosis Fungsi) | Lookup | TIDAK | Master data diagnosa | Integrasi master data | Section: Asesmen |
| pemeriksaan_penunjang | Pemeriksaan Penunjang | Free text (textarea) | TIDAK | — | Manual | Section: Asesmen |
| goal_terapi | Goal Terapi (Tata Laksana KFR) | Lookup | TIDAK | Master data diagnosa | Manual | Section: Planning |
| program_terapi | Program Terapi | Multiple checkbox | TIDAK | Fisioterapi / Terapi Wicara / Terapi Okupasi / Psikologi | Manual | Section: Planning |
| tindakan | Tindakan | Free text | Ya, wajib bila Program Terapi dipilih | Wajib isi jika Program Terapi dipilih (BR-001) | Manual | Section: Planning |
| icd9_tindakan | ICD-9 | Lookup | TIDAK | Master data procedure | Integrasi master data | Section: Planning |
| frekuensi_tindakan | Frekuensi Tindakan | Numerik | YA | Numerik, satuan "kali / minggu" | Manual | Section: Planning |
| edukasi | Edukasi | Free text (textarea) | TIDAK | — | Manual | Section: Planning |
| anjuran | Anjuran | Free text (textarea) | TIDAK | — | Manual | Section: Planning |
| evaluasi | Evaluasi | Free text (textarea) | TIDAK | — | Manual | Section: Planning |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Proses simpan dan update asesmen oleh dokter selesai dalam < 1 detik. | Performance Expectation |
| **NFR-002** | Skalabilitas | Sistem mendukung volume ± 40–60 pasien rehab medik per hari tanpa penurunan performa. | Performance Expectation (Behavior) |
| **NFR-003** | Responsivitas | Layout formulir menyesuaikan tampilan pada perangkat desktop dan tablet. | Scope |
| **NFR-004** | Ergonomi UI | Ukuran textbox proporsional terhadap karakteristik data dan whitespace diminimalkan agar informasi lebih padat. | Expected Improvement (UX) |
| **NFR-005** | Konsistensi | Alignment komponen dan tampilan tombol aksi konsisten di seluruh section. | Scope |
| **NFR-006** | Usability | Kebutuhan scrolling vertikal diminimalkan untuk mempercepat proses dokumentasi. | Expected Improvement (UX) |

## 13. Integrasi Eksternal

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|------------------------|--------|-------|
| Master Data Diagnosa (ICD-10) | Lookup Diagnosis Medis dan Diagnosis Fungsi | Internal | FR-001 |
| Master Data Procedure (ICD-9) | Lookup kode Tata Laksana KFR / Tindakan | Internal | FR-005 |
| Rekam Medis Elektronik (EMR) | Penyimpanan hasil akhir asesmen rehab medik | Internal | FR-008 |

