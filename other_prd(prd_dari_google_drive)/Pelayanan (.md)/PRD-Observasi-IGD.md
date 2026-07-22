# PRD — Observasi IGD (Tab "Observasi Pasien" — Modul Asesmen Gawat Darurat)

**Related Document:** Catatan Fitur "Observasi IGD" (Main Goals, Capabilities, Performance, Scope, Expected Improvement) + konfirmasi 4 open question (3 Juli 2026); Mockup UI **v1** (3 gambar: tab default, form entri, tabel terisi — dipakai sebagai baseline, bukan target v2); PRD Asesmen Gawat Darurat / Asesmen IGD (parent — **hard dependency**); Neurovi v1 (referensi baseline)
**Dokumen ID:** PRD-E-OBS-IGD-v2.0  ·  **Versi:** 2.4 (Draft — Revisi pasca-konfirmasi)
**Tanggal Disusun:** 3 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Tim Pradev
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]` (belum ditentukan di sumber)

---

## 1. Overview / Brief Summary

Observasi IGD adalah tab **"Observasi Pasien"** di dalam modul **Asesmen Gawat Darurat**, sejajar dengan tab **Asesmen Dokter** dan **Asesmen Perawat**. Tab ini dipakai dokter dan perawat IGD untuk mencatat hasil **primary survey ABCD** (Airway, Breathing, Circulation, Disability) sekaligus **entri observasi berkala** (tanda vital, GCS, diagnosa) yang terekam lengkap dengan tanggal, jam, dan nama petugas.

Mockup yang tersedia menggambarkan perilaku **Neurovi v1**: tabel observasi hanya menampilkan info *last updated* tanpa mencakup data ABCD, ruang ABCD dialokasikan besar meski jarang terisi penuh, entri harus lewat tombol "Tambah Entry" (modal), dan tata letaknya banyak ruang kosong dengan penempatan tombol tidak konsisten.

Untuk **Fase 1 (MVP) v2**, lingkupnya: input ABCD (dengan info **terakhir diperbarui — kapan & oleh siapa**), CRUD entri observasi berkala lewat **form input pada section Data Observasi** (tombol **“Tambahkan”** menambahkan ke tabel), Total Skor GCS yang dihitung otomatis oleh sistem, validasi field wajib & rentang SpO2, header read-only **Kategori Triase** (dari pendaftaran triase) **& diagnosa kerja** (dari Asesmen Dokter, free text) (tampilan baru di v2), serta **shortcut I-CARE BPJS** untuk pasien BPJS. Proses bisnis dan logika sistem inti tidak berubah dari v1 — fokus v2 pada **UX dan kelengkapan data**.

> Referensi: Catatan Fitur Observasi IGD; Mockup UI v1 (tab default, form entri, tabel terisi); konfirmasi stakeholder 3 Juli 2026.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: Catatan "Expected Improvement From V1" & mockup v1:
- Tab observasi menampung data ABCD dan entri observasi; tabel observasi hanya menampilkan info *last updated*, **tanpa mencakup data ABCD** dan tanpa jejak siapa/kapan mengubah.
- Ruang untuk data ABCD dialokasikan besar, padahal faktanya jarang terisi lengkap.
- Penambahan entri **harus** melalui klik "Tambah Entry" (form/modal).
- Header belum menampilkan Kategori Triase & diagnosa kerja.
- Belum ada shortcut ke I-CARE BPJS.
- Tata letak memiliki banyak ruang kosong dan penempatan tombol tidak konsisten (terlalu menempel ke tabel).

**Masalah/pain point:**
- Aspek bisnis proses: **Tidak ada perubahan** (proses observasi IGD tetap sama).
- Aspek UX: (a) perubahan ABCD tidak ikut terekam/tampil (kapan & oleh siapa); (b) ruang ABCD boros sehingga tabel Data Observasi sempit; (c) input lewat modal popup yang terpisah dari section observasi; (d) header minim konteks (tanpa triase & diagnosa kerja); (e) tidak ada akses cepat I-CARE; (f) layout tidak rapi & tombol tidak konsisten.
- Aspek logic system: **Tidak ada perubahan**.

**Dampak utama yang disasar v2:**
- Riwayat observasi lebih lengkap: perubahan data ABCD ikut tampil dengan info **terakhir diperbarui (kapan & oleh siapa)**.
- Ruang ABCD lebih ringkas → tabel Data Observasi lebih luas & mudah dipantau.
- Input lebih ringkas lewat **form pada section Data Observasi** (tombol “Tambahkan”).
- Header memberi konteks klinis (triase & diagnosa kerja).
- Akses cepat data I-CARE BPJS dari tab observasi.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = seluruh lingkup v2 modul ini: tab Observasi Pasien; ABCD + info terakhir diperbarui; CRUD entri observasi via **form “Tambahkan”**; auto-Total Skor GCS; validasi wajib & rentang SpO2; header read-only (triase & diagnosa kerja); shortcut I-CARE BPJS; layout rapi.
- **Fase 2** = belum ada item khusus untuk modul ini (reserved) — mis. jejak audit granular per-field bila kelak dibutuhkan. `[**]`

> Volume operasional acuan: **100–150 pasien IGD/hari**, komposisi ±70% umum/asuransi dan ±30% BPJS.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Tab "Observasi Pasien"** di dalam modul Asesmen IGD, sejajar dengan tab Asesmen Dokter & Asesmen Perawat.
2. **Primary survey ABCD** — field Airway, Breathing, Circulation, Disability (dapat diisi & disimpan), dengan info **terakhir diperbarui (tanggal/jam & nama petugas)**.
3. **CRUD entri observasi berkala** — dengan **form input pada section Data Observasi** (tombol **“Tambahkan”** menambahkan ke tabel) sebagai metode utama v2 (tambah, lihat, edit, hapus).
4. **Auto-calculate Total Skor GCS** dari input E/M/V (read-only).
5. **Validasi** field wajib (Diagnosa, Nadi, Respirasi, Suhu) dan rentang SpO2 (1–100).
6. **Header read-only**: **Kategori Triase** (dari **pendaftaran triase**, mis. PACS 1) & **diagnosa kerja** (dari **Asesmen Dokter**, free text) — tampilan **baru di v2** (mockup lama = v1). Bila diagnosa kerja >1, ditampilkan sebagai satu kalimat dipisah koma.
7. **Shortcut I-CARE BPJS** — akses cepat data I-CARE untuk pasien BPJS langsung dari tab observasi (baru di v2).

### Out Scope
- Tab **Asesmen Dokter** & **Asesmen Perawat** (berada di PRD Asesmen Gawat Darurat / parent).
- Jejak audit granular per-field/versi (bukan sekadar "terakhir diperbarui") — reserved Fase 2. `[**]`

## 4. Goals and Metrics

### Tujuan
Memberi dokter & perawat IGD satu tempat untuk mencatat primary survey ABCD dan observasi berkala pasien (TTV, GCS, diagnosa) yang akurat, terekam siapa & kapan (termasuk perubahan ABCD), mudah dipantau lewat tabel Data Observasi, dan terhubung cepat ke data I-CARE BPJS untuk pasien BPJS.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu akses & simpan data observasi | < 1 detik | NFR-001 |
| Kelengkapan atribut audit tiap entri (Nama Petugas + timestamp) | 100% entri | NFR-003 |
| Stabilitas pada volume operasional | 100–150 pasien IGD/hari tanpa degradasi performa | NFR-002 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul / Code | Peran terhadap Modul |
|--------------|-----------------------|
| **Asesmen Gawat Darurat / Asesmen IGD** (parent) | Container tab observasi & sumber identitas pasien (No. RM, Nama, Tgl Lahir). **Hard dependency**. |
| **Master ICD-10** | Sumber lookup field ICD-10 pada entri. |
| **Master Staf (A2)** | Sumber Nama Petugas (dari user yang login). |
| **Pendaftaran Triase** | Sumber **Kategori Triase** (mis. PACS 1) yang tampil read-only di header. |
| **Asesmen Dokter** (tab dalam Asesmen IGD) | Sumber **diagnosa kerja** (free text); bila >1 diagnosa, digabung menjadi satu kalimat dipisah koma. |
| **BPJS I-CARE** | Sumber riwayat pelayanan pasien BPJS untuk shortcut. |

Dependency lintas modul: **Master ICD-10**, **Master Staf (A2)**, **Pendaftaran Triase**, **Asesmen Dokter**, **BPJS I-CARE**.

## 6. Business Process (As-Is / To-Be)

> Catatan sumber: **aspek bisnis proses tidak ada perubahan**. Perbedaan v1→v2 murni pada UX & kelengkapan data.

### A. As-Is (Neurovi v1)
1. Petugas IGD membuka modul Asesmen Gawat Darurat, memilih tab observasi.
2. Mengisi data ABCD pada area yang besar (sering tidak terisi lengkap).
3. Menekan "Tambah Entry" (modal), mengisi TTV/GCS/diagnosa, lalu menyimpan entri.
4. Tabel observasi menampilkan info *last updated* saja — tanpa data ABCD & tanpa jejak siapa/kapan.
5. Header tanpa Kategori Triase & diagnosa kerja; tidak ada akses I-CARE.
6. Layout banyak ruang kosong; penempatan tombol tidak konsisten.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Petugas IGD membuka tab **"Observasi Pasien"**; header read-only menampilkan identitas pasien, **Kategori Triase** (dari pendaftaran triase), dan **diagnosa kerja** (dari Asesmen Dokter, free text; bila >1 digabung dipisah koma) — baru v2.
2. Mengisi **ABCD** pada area yang **diringkas**; saat disimpan, sistem mencatat & menampilkan **"terakhir diperbarui (tanggal/jam & nama petugas)"**.
3. Mengisi **form Data Observasi** di section Data Observasi, lalu menekan **“Tambahkan”** → entri masuk sebagai baris di tabel.
4. **Total Skor GCS dihitung otomatis** dari E/M/V; **validasi** field wajib & rentang SpO2 saat simpan.
5. **Tabel Data Observasi** menampilkan seluruh riwayat entri + **Nama Petugas** + timestamp.
6. Petugas dapat **mengedit/menghapus** entri lewat ikon aksi pada baris tabel (edit memuat data ke form untuk diperbarui).
7. Untuk pasien **BPJS**, tersedia **shortcut I-CARE BPJS** dari tab observasi.
8. Data ABCD & entri **disimpan** dan **langsung tampil kembali** saat tab dibuka ulang.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Isi tabel & riwayat | Info *last updated* saja, tanpa ABCD, tanpa siapa/kapan | Seluruh riwayat entri + Nama Petugas + timestamp; perubahan **ABCD ikut tampil** dengan info terakhir diperbarui (kapan & oleh siapa) |
| Metode input entri | Wajib lewat "Tambah Entry" (modal popup) | **Form pada section Data Observasi** + tombol **“Tambahkan”** |
| Header | Tanpa triase & diagnosa kerja | Menampilkan **Kategori Triase** (dari pendaftaran triase) & **diagnosa kerja** (dari Asesmen Dokter; >1 digabung koma) (baru v2) |
| Akses I-CARE | Tidak ada | **Shortcut I-CARE BPJS** untuk pasien BPJS |
| Ruang ABCD & layout | Boros, tombol tidak konsisten | Diringkas; layout rapi, tombol konsisten |
| Bisnis proses & logic | — | Tidak berubah |

## 7. Main Flow / Mindmap

### Skenario 1 — Catat ABCD & tambah entri observasi (alur normal)
1. Petugas membuka tab "Observasi Pasien"; header menampilkan triase & diagnosa kerja.
2. Mengisi Airway/Breathing/Circulation/Disability → menekan **SIMPAN** (tab utama) → data ABCD tersimpan & info **"terakhir diperbarui (kapan & oleh siapa)"** diperbarui.
3. Mengisi **form Data Observasi**; Tanggal & Jam terisi otomatis dari waktu sistem.
4. Mengisi Diagnosa, ICD-10, GCS (E/M/V), Tekanan Darah, Nadi, Respirasi, Suhu, SpO2, Urin, Keterangan pada form; **Total Skor GCS** terisi otomatis.
5. Menekan **“Tambahkan”** → sistem memvalidasi field wajib & rentang SpO2 → entri masuk ke tabel dengan **Nama Petugas** (user login) & timestamp; form dikosongkan untuk entri berikutnya.

### Skenario 2 — Pantau perkembangan (lihat riwayat)
1. Petugas membuka tab observasi.
2. Data Observasi menampilkan seluruh entri, lengkap dengan GCS (format `E{e}M{m}V{v}`), Total Skor, Tekanan Darah (`sistole / diastole`), TTV lain, Keterangan, dan Nama Petugas; info terakhir diperbarui ABCD tampil di area ABCD.

### Skenario 3 — Edit / hapus entri
1. Petugas menekan ikon **edit** pada baris → data entri dimuat ke **form Data Observasi** → ubah nilai → tekan **“Perbarui”**.
2. Petugas menekan ikon **hapus** → entri dihapus dari tabel (soft-delete).

### Skenario 4 — Pasien BPJS: shortcut I-CARE
- Untuk pasien penjamin **BPJS**, petugas menekan **shortcut I-CARE BPJS** dari tab observasi untuk mengakses data riwayat pelayanan. 

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Total Skor GCS dihitung otomatis oleh sistem = E + M + V; field read-only, tidak dapat diketik manual. | FR-005; US-004 |
| **BR-002** | Komponen GCS dibatasi per variabel: **E (1–4), M (1–6), V (1–5)**; total maksimum 15. Bila input melebihi rentang, sistem menampilkan **pesan error per variabel** (mis. "Hanya angka 1-4" untuk E, "Hanya angka 1-6" untuk M, "Hanya angka 1-5" untuk V) dan entri tidak dapat disimpan sampai diperbaiki.| FR-004; FR-005 |
| **BR-003** | Field wajib pada entri observasi = **Diagnosa, Nadi, Respirasi, Suhu, SpO2**. Bila kosong saat simpan, sistem menampilkan pesan validasi dan entri tidak tersimpan. **ICD-10 opsional.** | FR-004; US-007 |
| **BR-004** | SpO2 **wajib** diisi dan hanya menerima nilai **1–100**; nilai kosong atau di luar rentang ditolak dengan pesan validasi. | FR-004; US-007 |
| **BR-005** | Nama Petugas diisi otomatis oleh sistem dari user yang sedang login (Master Staf); tidak dapat diubah manual. | FR-006; Master Staf (A2) |
| **BR-006** | Tanggal & Jam entri terisi otomatis dengan waktu sistem saat entri dibuat sebagai timestamp.| FR-006 |
| **BR-007** | Data ABCD dan seluruh entri observasi disimpan dan **langsung tampil kembali** saat tab Observasi Pasien dibuka ulang. | FR-003; FR-007; NFR-004 |
| **BR-008** | Header menampilkan **Kategori Triase** (bersumber dari **pendaftaran triase**, mis. PACS 1) dan **diagnosa kerja** (bersumber dari **Asesmen Dokter**, free text) secara read-only — **tampilan baru di v2** (belum ada di v1). | FR-002 |
| **BR-009** | Entri observasi dapat **diedit** (data dimuat ke form Data Observasi lalu diperbarui) dan **dihapus** lewat ikon aksi pada baris tabel.| FR-008 |
| **BR-010** | Diagnosa diisi bebas (free text) dan **wajib**; ICD-10 dipilih dari master ICD-10 (dropdown/lookup) dan **opsional**. | FR-004; Master ICD-10 |
| **BR-011** | **Shortcut I-CARE BPJS** aktif/tampil untuk pasien dengan penjamin **BPJS**, mengakses data riwayat pelayanan I-CARE dari tab observasi. | FR-009 |
| **BR-012** | Setiap perubahan pada **data ABCD** dicatat & ditampilkan sebagai info **"terakhir diperbarui: {tanggal jam} oleh {nama petugas}"** — bukan sekadar *last updated* tanpa ABCD seperti v1. | FR-010; Pain point UX |
| **BR-013** | Penambahan entri observasi dilakukan lewat **form pada section Data Observasi**; menekan **“Tambahkan”** memasukkan entri ke tabel. Pengubahan memuat entri ke form lalu **“Perbarui”**. Bukan input per-baris (inline), bukan modal popup. | FR-004; FR-008 |
| **BR-014** | Bila **diagnosa kerja** dari **Asesmen Dokter** berisi **lebih dari satu** entri, tampilan di header Observasi IGD menggabungkannya menjadi **satu kalimat dipisah koma**. | FR-002; Asesmen Dokter |
| **BR-015** | **Nadi** wajib, hanya menerima angka, **maksimal 3 digit** (0–999). | FR-004; US-007 |
| **BR-016** | **Respirasi** wajib, hanya menerima angka, **maksimal 2 digit** (0–99). | FR-004; US-007 |
| **BR-017** | **Suhu** wajib diisi (angka, satuan °C). | FR-004; US-007 |
| **BR-018** | Saat tombol **Simpan** ditekan: bila **belum ada entri observasi DAN data ABCD kosong**, sistem menampilkan **pop up "data observasi belum diisi"**. Bila sudah ada entri observasi (meski **ABCD kosong**), observasi **berhasil disimpan** — data ABCD bersifat **opsional**. | FR-011; US-011 |

## 9. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas IGD (dokter/perawat)**, saya ingin **mencatat hasil primary survey ABCD dalam satu tab observasi**, sehingga **kondisi awal pasien terdokumentasi di satu tempat**. | 1) Given tab Observasi Pasien terbuka, When mengisi ABCD & menekan SIMPAN, Then data ABCD tersimpan & info terakhir diperbarui muncul (BR-007; BR-012). 2) Given tab dibuka ulang, Then ABCD tampil kembali utuh. | FR-003; BR-007 |
| **US-002** | Sebagai **petugas IGD**, saya ingin **melihat Kategori Triase (dari pendaftaran triase) & diagnosa kerja (dari Asesmen Dokter) read-only di header**, sehingga **saya punya konteks kondisi pasien tanpa berpindah layar**. | 1) Given tab terbuka, When memuat header, Then Kategori Triase (mis. PACS 1) & diagnosa kerja tampil read-only (BR-008). 2) Given diagnosa kerja di Asesmen Dokter >1, When ditampilkan di header, Then digabung menjadi satu kalimat dipisah koma (BR-014). | FR-002; BR-008; BR-014 |
| **US-003** | Sebagai **petugas IGD**, saya ingin **menambah entri observasi berkala**, sehingga **perkembangan TTV/GCS/diagnosa terekam berkala**. | 1) Given form Data Observasi tampil, Then Tanggal & Jam terisi otomatis (BR-006). 2) Given semua field valid, When menekan “Tambahkan”, Then entri masuk ke tabel. | FR-004; BR-006; BR-013 |
| **US-004** | Sebagai **petugas IGD**, saya ingin **Total Skor GCS terhitung otomatis dari E/M/V**, sehingga **terhindar dari salah hitung**. | 1) Given mengisi E, M, V, Then Total Skor = E+M+V dan read-only (BR-001). 2) When mencoba mengetik Total Skor, Then tidak dapat diubah manual. | FR-005; BR-001 |
| **US-005** | Sebagai **petugas IGD**, saya ingin **melihat seluruh riwayat entri pada tabel Data Observasi lengkap dengan Nama Petugas & timestamp**, sehingga **saya bisa memantau tren kondisi pasien**. | 1) Given ada entri tersimpan, When membuka tab, Then seluruh entri tampil dengan GCS `E{e}M{m}V{v}`, Total Skor, TD `sistole / diastole`, TTV, Keterangan, Nama Petugas & timestamp. | FR-007; BR-005 |
| **US-006** | Sebagai **petugas IGD**, saya ingin **mengedit/menghapus entri observasi**, sehingga **kesalahan input bisa diperbaiki cepat**. | 1) Given entri di tabel, When menekan ikon edit, Then data entri dimuat ke form untuk diperbarui. 2) When menekan ikon hapus, Then entri terhapus (BR-009). | FR-008; BR-009; BR-013 |
| **US-007** | Sebagai **petugas IGD**, saya ingin **field wajib & rentang SpO2 divalidasi saat simpan**, sehingga **data observasi konsisten & lengkap**. | 1) Given Diagnosa/Nadi/Respirasi/Suhu kosong, When Simpan, Then muncul pesan validasi & entri tidak tersimpan (BR-003). 2) Given SpO2 di luar 1–100, When Simpan, Then ditolak (BR-004). | FR-004; BR-003; BR-004 |
| **US-008** | Sebagai **petugas IGD**, saya ingin **mengakses I-CARE BPJS langsung dari tab observasi untuk pasien BPJS**, sehingga **saya bisa melihat riwayat pelayanan tanpa berpindah aplikasi**. | 1) Given pasien BPJS, When menekan shortcut I-CARE, Then data I-CARE BPJS dapat diakses (BR-011). | FR-009; BR-011 |
| **US-009** | Sebagai **petugas IGD**, saya ingin **mengisi form Data Observasi lalu menekan “Tambahkan”**, sehingga **pencatatan terstruktur tanpa popup terpisah**. | 1) Given form terisi valid, When menekan “Tambahkan”, Then entri ditambahkan ke tabel (BR-013). | FR-004; BR-013 |
| **US-010** | Sebagai **petugas IGD**, saya ingin **melihat kapan & oleh siapa data ABCD terakhir diubah**, sehingga **perubahan kondisi pasien dapat ditelusuri**. | 1) Given data ABCD diubah & disimpan, Then info "terakhir diperbarui: {tanggal jam} oleh {petugas}" tampil (BR-012). | FR-010; BR-012 |
| **US-011** | Sebagai **petugas IGD**, saya ingin **diberi tahu bila menekan Simpan tanpa mengisi observasi maupun ABCD**, sehingga **saya tidak menyimpan data kosong**. | 1) Given entri observasi & ABCD kosong, When menekan Simpan, Then muncul pop up "data observasi belum diisi" (BR-018). 2) Given ada entri observasi & ABCD kosong, When menekan Simpan, Then observasi berhasil disimpan (BR-018). | FR-011; BR-018 |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Tab "Observasi Pasien"** — tersedia dalam modul Asesmen Gawat Darurat, sejajar dengan tab Asesmen Dokter & Asesmen Perawat. | US-001; Scope |
| **FR-002** | **Header read-only** — menampilkan No. RM, Nama, Tanggal Lahir, **Kategori Triase** (dari pendaftaran triase, mis. PACS 1), dan **diagnosa kerja** (dari Asesmen Dokter, free text; bila >1 digabung dipisah koma) — baru di v2. | US-002; BR-008; BR-014 |
| **FR-003** | **Primary survey ABCD** — empat field teks (Airway, Breathing, Circulation, Disability) yang dapat diisi & disimpan; ruang diringkas agar tabel lebih luas; menampilkan info terakhir diperbarui. | US-001; BR-007; BR-012 |
| **FR-004** | **Entri observasi via form** — form pada section Data Observasi; menekan **“Tambahkan”** menambahkan entri ke tabel (edit memuat entri ke form lalu **“Perbarui”**); field: Tanggal, Jam, Diagnosa (wajib), ICD-10 (opsional), GCS (E/M/V), Tekanan Darah (sistole/diastole), Nadi (wajib, maks 3 digit), Respirasi (wajib, maks 2 digit), Suhu (wajib), SpO2 (wajib, 1–100), Urin, Keterangan; validasi field wajib, batas digit, rentang SpO2, dan pesan error rentang GCS per variabel; aksi “Tambahkan”/“Perbarui”/“Batal”. | US-003; US-007; US-009; BR-002; BR-003; BR-004; BR-010; BR-013; BR-015; BR-016 |
| **FR-005** | **Auto-calculate Total Skor GCS** — dihitung otomatis dari E+M+V, ditampilkan read-only, tidak dapat diketik manual. | US-004; BR-001 |
| **FR-006** | **Pencatatan Nama Petugas & timestamp** — tiap entri terekam Nama Petugas (user login, Master Staf) & Tanggal/Jam (waktu sistem). | US-005; BR-005; BR-006 |
| **FR-007** | **Tabel Data Observasi** — menampilkan seluruh riwayat entri; data persist & tampil kembali saat tab dibuka ulang. | US-005; BR-007 |
| **FR-008** | **Edit & hapus entri** — melalui ikon aksi pada baris tabel; edit memuat entri ke form Data Observasi untuk diperbarui. | US-006; BR-009; BR-013 |
| **FR-009** | **Shortcut I-CARE BPJS** — akses cepat data I-CARE untuk pasien BPJS langsung dari tab observasi. | US-008; BR-011 |
| **FR-010** | **Info terakhir diperbarui untuk data ABCD** — menampilkan "terakhir diperbarui: {tanggal jam} oleh {petugas}" atas perubahan data ABCD (peningkatan dari v1 yang hanya menampilkan *last updated* tanpa ABCD). | US-010; BR-012 |
| **FR-011** | **Simpan tab Observasi** — validasi minimal: bila belum ada entri observasi dan ABCD kosong, tampilkan pop up "data observasi belum diisi"; selain itu simpan berhasil (ABCD opsional). | US-011; BR-018 |

## 11. Data Requirements (Spesifikasi Field)

> Field demografi (No. RM, Nama, Tanggal Lahir) **reuse definisi kanonik dari modul Pendaftaran (B1)** — nama, tipe, format, validasi **harus sama**.

### A. Layar INPUT — Form Entry Data Observasi (FR-004)
> Field-field berikut diisi pada **form Data Observasi** di dalam section (bukan modal popup, bukan per-baris). Menekan **“Tambahkan”** memasukkan entri ke tabel; form kemudian dikosongkan.

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| tanggal | Tanggal | date | Ya | dd/mm/yyyy | default waktu sistem saat entri | `[PERLU KONFIRMASI editable?]` |
| jam | Jam | time | Ya | HH:mm | default waktu sistem saat entri | `[PERLU KONFIRMASI editable?]` |
| diagnosa | Diagnosa | text | Ya | teks bebas | manual | wajib (BR-003) |
| icd10 | ICD-10 | dropdown (lookup) | Tidak | dari master ICD-10 | lookup Master ICD-10 | opsional (BR-010) |
| gcs_e | GCS — E (Eye) | number | Tidak | 1–4; di luar rentang → "Hanya angka 1-4" | manual | komponen GCS (BR-002) |
| gcs_m | GCS — M (Motor) | number | Tidak | 1–6; di luar rentang → "Hanya angka 1-6" | manual | komponen GCS (BR-002) |
| gcs_v | GCS — V (Verbal) | number | Tidak | 1–5; di luar rentang → "Hanya angka 1-5" | manual | komponen GCS (BR-002) |
| total_skor | Total Skor | number | — | read-only, = E+M+V | dibuat otomatis oleh sistem | BR-001; tidak dapat diketik |
| td_sistole | Tekanan Darah — Sistole | number | Tidak | mmHg | manual | tampil `sistole / diastole` |
| td_diastole | Tekanan Darah — Diastole | number | Tidak | mmHg | manual | — |
| nadi | Nadi | number | Ya | hanya angka, maks 3 digit (0–999) | manual | wajib (BR-003, BR-015) |
| respirasi | Respirasi | number | Ya | hanya angka, maks 2 digit (0–99) | manual | wajib (BR-003, BR-016) |
| suhu | Suhu | number | Ya | angka desimal (°C) | manual | wajib (BR-003, BR-017) |
| spo2 | SpO2 | number | Ya | wajib, 1–100 | manual | rentang (BR-004) |
| urin | Urin | number | Tidak | ml | manual | — |
| keterangan | Keterangan | textarea | Tidak | teks bebas | manual | — |

### B. Layar INPUT — Primary Survey ABCD (tab utama, FR-003)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| airway | Airway | textarea | Tidak | teks bebas | manual | area diringkas di v2 |
| breathing | Breathing | textarea | Tidak | teks bebas | manual | area diringkas di v2 |
| circulation | Circulation | textarea | Tidak | teks bebas | manual | area diringkas di v2 |
| disability | Disability | textarea | Tidak | teks bebas | manual | area diringkas di v2 |

### C. Data TER-GENERATE saat Simpan (FR-006, FR-010)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| nama_petugas | Nama Petugas | text | dari user login (Master Staf) | BR-005; read-only |
| total_skor | Total Skor GCS | number | dibuat otomatis = E+M+V | BR-001; read-only |
| timestamp | Tanggal & Jam entri | date/time | default waktu sistem saat entri | BR-006; `[PERLU KONFIRMASI editable?]` |
| abcd_updated_at | ABCD — terakhir diperbarui | datetime | waktu sistem saat ABCD disimpan | BR-012 |
| abcd_updated_by | ABCD — diperbarui oleh | text | user login saat ABCD disimpan | BR-012 |

### D. Layar TAMPIL — Tabel "Data Observasi" (FR-007)
> Baris bersifat read-only; ubah lewat ikon **edit** yang memuat entri ke form Data Observasi (lihat FR-004/FR-008).

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Tanggal | entri.tanggal | yyyy-mm-dd | sort ↑ default | kolom pertama; indikator sort tampil |
| Jam | entri.jam | HH:mm | — | — |
| Diagnosa | entri.diagnosa | text | — | free text |
| ICD-10 | entri.icd10 | text (kode/nama) | — | dari master ICD-10 |
| GCS | entri.gcs_e/m/v | `E{e}M{m}V{v}` | — | mis. E3M4V5 |
| Total Skor | entri.total_skor | number | — | auto (BR-001) |
| Tekanan Darah | entri.td_sistole/diastole | `{sistole} / {diastole}` | — | mis. 120 / 80 |
| Nadi | entri.nadi | number | — | x/menit |
| Respirasi | entri.respirasi | number | — | x/menit |
| Suhu | entri.suhu | number | — | °C |
| SpO2 | entri.spo2 | number | — | % |
| Urin | entri.urin | number | — | ml |
| Keterangan | entri.keterangan | text | — | — |
| Nama Petugas | entri.nama_petugas | text | — | dari user login (BR-005) |
| Aksi | — | ikon edit & hapus | — | FR-008; BR-013 |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Akses & simpan data observasi selesai < 1 detik. | Metrik; FR-004; FR-007 |
| **NFR-002** | Skalabilitas | Stabil menampung volume operasional 100–150 pasien IGD/hari (±70% umum/asuransi, ±30% BPJS) tanpa degradasi performa. | Metrik |
| **NFR-003** | Auditabilitas | 100% entri tersimpan dengan Nama Petugas & timestamp akurat; perubahan ABCD tercatat siapa & kapan. | Metrik; BR-005; BR-006; BR-012 |
| **NFR-004** | Reliabilitas | Data ABCD & entri observasi tidak hilang; tampil kembali utuh saat tab dibuka ulang. | BR-007 |
| **NFR-005** | Ergonomi UI / Usability | Layout rapi, penempatan tombol konsisten, ruang ABCD ringkas agar tabel Data Observasi lebih luas; form input ringkas. | Pain point UX |
| **NFR-006** | Keamanan / RBAC | CRUD observasi hanya untuk petugas IGD (dokter/perawat) yang berwenang. `[ASUMSI/PERLU KONFIRMASI]` | Domain knowledge |

## 13. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Master ICD-10** | Lookup kode/istilah ICD-10 pada entri. | Internal | FR-004 |
| **Master Staf (A2)** | Sumber Nama Petugas dari user login. | Internal | FR-006; BR-005 |
| **Pendaftaran Triase** | Sumber Kategori Triase (mis. PACS 1). | Internal | FR-002 |
| **Asesmen Dokter** (tab Asesmen IGD) | Sumber diagnosa kerja (free text; >1 digabung koma). | Internal (parent) | FR-002; BR-014 |
| **BPJS I-CARE** | Shortcut riwayat pelayanan pasien BPJS. | Live/API (Fase 1) | FR-009 |

**Dependency (tipe & dampak):**
| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Modul Asesmen Gawat Darurat (parent) | Hard | Tab Observasi tidak dapat berdiri sendiri tanpa container & identitas pasien. |
| Asesmen Dokter (tab parent) | Hard | Diagnosa kerja tidak tampil di header bila belum diisi di Asesmen Dokter. |
| Pendaftaran Triase | Hard | Kategori Triase tidak tampil bila belum ada data triase. |
| Master ICD-10 | Hard | Field ICD-10 tidak berfungsi tanpa master. |
| Master Staf (A2) | Hard | Nama Petugas tidak terisi tanpa data staf / user login. |
| BPJS I-CARE | Soft | Shortcut I-CARE tidak tersedia; sisa fitur observasi tetap berjalan. |

## 14. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| **D-01** | Metode input entri | Input entri via **form pada section Data Observasi**; menekan **“Tambahkan”** menambahkan entri ke tabel. **Bukan** input per-baris (inline) dan **bukan** modal popup. Edit memuat entri ke form lalu “Perbarui”. (BR-013; FR-004; FR-008) |
| **D-02** | Sumber & tampilan header (triase + diagnosa kerja) | **Kategori Triase** bersumber dari **pendaftaran triase** (mis. PACS 1); **diagnosa kerja** bersumber dari **Asesmen Dokter** (free text). Bila diagnosa kerja >1, ditampilkan sebagai **satu kalimat dipisah koma**. Elemen read-only baru di v2. (BR-008; BR-014; FR-002) |
| **D-03** | Shortcut I-CARE BPJS | Masuk **In Scope Fase 1**. Shortcut dari tab observasi untuk pasien BPJS (tampilan baru di v2). (BR-011; FR-009) |
| **D-04** | Riwayat/last-update ABCD | Perubahan **data ABCD** ikut ditampilkan dengan info **"terakhir diperbarui (kapan & oleh siapa)"**. Masuk **Fase 1**. (BR-012; FR-010) |
| **D-05** | Aturan validasi entri & tombol Simpan | **Wajib**: Diagnosa, Nadi, Respirasi, Suhu, SpO2. **Opsional**: ICD-10. **Nadi** maks 3 digit; **Respirasi** maks 2 digit; **SpO2** 1–100; **GCS** E 1–4 / M 1–6 / V 1–5 dengan pesan error per variabel (mis. "Hanya angka 1-4"). Tombol **Simpan**: bila observasi & ABCD kosong → pop up "data observasi belum diisi"; ABCD opsional. (BR-002–004, BR-010, BR-015–018; FR-004; FR-011) |

## 15. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Seluruh lingkup v2 modul ini: tab Observasi Pasien; ABCD + info terakhir diperbarui (kapan & oleh siapa); CRUD entri observasi via **form “Tambahkan”**; auto-Total Skor GCS; validasi field wajib & rentang SpO2; header read-only (Kategori Triase & diagnosa kerja); **shortcut I-CARE BPJS**; layout rapi. |
| **Fase 2** `[**]` | Belum ada item khusus untuk modul ini (reserved) — mis. jejak audit granular per-field/versi bila kelak dibutuhkan. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| R1 | Ketergantungan eksternal I-CARE BPJS — API belum tentu siap saat rilis. | Perlakukan sebagai Soft dependency; sisa fitur observasi tetap jalan bila I-CARE belum siap. |
| R2 | Infrastruktur RS tidak stabil → risiko entri gagal tersimpan. | Pastikan simpan cepat (< 1 dtk) & konfirmasi tersimpan; |
| R3 | Form + tabel menambah tinggi konten di section observasi. | Tata form ringkas (grid multi-kolom) di atas tabel; tabel tetap dapat digulir horizontal. |


## 19. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 2.0 | 3 Juli 2026 | Team Product | Draft awal PRD Observasi IGD dari catatan fitur + 3 mockup UI v1; baseline entri = modal; I-CARE BPJS, inline entry, & riwayat perubahan ditandai Fase 2; open questions dikumpulkan di §17. |
| 2.1 | 3 Juli 2026 | Team Product | Resolusi 4 open question (lihat §14 Keputusan Desain): (D-01) input entri jadi **inline pada baris tabel**; (D-02) **diagnosa kerja tampil di header** (baru v2, mockup lama = v1); (D-03) **shortcut I-CARE BPJS** masuk In Scope Fase 1; (D-04) perubahan **data ABCD** ditampilkan dengan info **terakhir diperbarui (kapan & oleh siapa)** (Fase 1). Penanda `[**]` pada item terkait dihapus; item dipindah dari Out Scope/Fase 2 ke In Scope; ditambah BR-013, US-009/010, FR-010 diperbarui, field abcd_updated_at/by, dan §14 Keputusan Desain. |
| 2.4 | 3 Juli 2026 | Team Product | Revisi metode input (D-01): dari **inline per-baris** menjadi **form pada section Data Observasi** + tombol **“Tambahkan”** (bukan modal popup, bukan per-baris). Edit memuat entri ke form lalu “Perbarui”. BR-009/013, FR-004/008, US-003/006/009, Data Requirements §11, D-01, Roadmap, R3, Asumsi & Open Questions disesuaikan. |
| 2.3 | 3 Juli 2026 | Team Product | Lengkapi aturan validasi (§14 D-05): Diagnosa/Nadi/Respirasi/Suhu/SpO2 **wajib**, ICD-10 **opsional**; Nadi maks 3 digit, Respirasi maks 2 digit, SpO2 1–100 (wajib); GCS menampilkan **pesan error per variabel** (mis. "Hanya angka 1-4") saat melebihi rentang. Tombol **Simpan**: pop up "data observasi belum diisi" bila observasi & ABCD kosong; ABCD opsional. Ditambah BR-015–018, FR-011, US-011; open question ICD/SpO2 & tipe input GCS ditutup. |
| 2.2 | 3 Juli 2026 | Team Product | Perjelas sumber & aturan tampilan header: **Kategori Triase** dari **pendaftaran triase** (mis. PACS 1); **diagnosa kerja** dari **Asesmen Dokter** (free text). Ditambah **BR-014** — bila diagnosa kerja >1, digabung menjadi satu kalimat dipisah koma. Dependency **Asesmen Dokter** & **Pendaftaran Triase** ditegaskan; **D-02** & terminologi header diperbarui (drop "/keluhan"). |
