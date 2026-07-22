# PRD — Master Data / Integrasi SATUSEHAT BPJS V2 — Item Pemeriksaan Laboratorium

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A14); PRD terkait: A3 Unit, A4 Barang Farmasi, A10 Tindakan, A11 Diagnosa, A13 Procedure, A29 Item Pemeriksaan Radiologi, A55 Jabatan; Standar: SATUSEHAT Terminology (LOINC), BPJS (LUPIS/tarif), Permenkes RME
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-06-19

## 1. Overview / Brief Summary

Modul **Master Data Item Pemeriksaan Laboratorium** adalah pusat pengelolaan data referensi pemeriksaan laboratorium pada SIMRS RS Tipe C & D. Modul mengelola katalog jenis pemeriksaan lab (kode, nama, kelompok pemeriksaan, satuan hasil, nilai rujukan, metode, turn around time/TAT, persiapan pasien, tarif) beserta parameter turunannya, jenis spesimen, dan pemetaan kode standar nasional.

Fokus rilis ini: **CRUD master item pemeriksaan lab + pemetaan kode SATUSEHAT (LOINC) dan kode BPJS** agar setiap item pemeriksaan terstandarisasi dan siap dipakai modul transaksi (order lab RJ/RI/IGD, hasil lab, billing) serta interoperabilitas.

Modul ini menjadi sumber kebenaran (single source of truth) item pemeriksaan: setiap permintaan, pelaksanaan, validasi hasil, dan penagihan lab merujuk ke data di sini.

[ASUMSI] Integrasi LIS dan render hasil ke transaksi berada di modul lain; modul ini hanya menyediakan referensi master + mapping kode.

## 2. Background

**Masalah saat ini (As-Is):**
- Daftar pemeriksaan lab dikelola manual (spreadsheet/dokumen Word) atau tersebar per petugas → nama & kode tidak seragam, rawan duplikat.
- Nilai rujukan, satuan, dan tarif tidak terpusat → hasil lab sulit diinterpretasi seragam, tarif salah saat billing.
- Belum ada pemetaan ke **kode SATUSEHAT (LOINC)** → hambatan kirim observation lab ke platform SATUSEHAT (kewajiban interoperabilitas Permenkes).
- Belum ada pemetaan tarif/kode BPJS → klaim & pelaporan tidak akurat.

**Kenapa modul perlu:**
- Standarisasi katalog lab lintas modul (RJ, RI, IGD, RME, Kasir, LIS).
- Memenuhi kewajiban RME & interoperabilitas SATUSEHAT.
- Mengurangi kerja manual SDM IT/lab yang terbatas di RS Tipe C & D.

[ASUMSI] Diturunkan dari pola master data lain (A4 Barang Farmasi, A10 Tindakan, A11 Diagnosa) yang sudah mengadopsi pola Integrasi SATUSEHAT BPJS V2.

## 3. In Scope

### Scope Definition (yang dikerjakan)
1. **CRUD Item Pemeriksaan Lab**: tambah, ubah, lihat detail, aktif/nonaktif (soft-delete). Tidak ada hard-delete bila item sudah dipakai transaksi.
2. **Pengelompokan**: kelompok pemeriksaan (hematologi, kimia klinik, imunologi, mikrobiologi, patologi klinik, urinalisis, dll).
3. **Parameter pemeriksaan**: untuk item bersifat panel/paket (mis. Darah Lengkap → Hb, leukosit, dst), kelola parameter anak beserta satuan & nilai rujukan per parameter.
4. **Nilai rujukan (reference range)** per kategori (jenis kelamin / kelompok usia).
5. **Atribut layanan**: satuan hasil, metode, TAT, persiapan pasien, jenis spesimen, tarif.
6. **Mapping kode standar**: SATUSEHAT (LOINC code + display + system URI), kode BPJS (bila ada).
7. **Pencarian, filter, sort** + **import/export massal** (CSV/XLSX) via template.
8. **Dashboard ringkasan** master lab.

### Out Scope (yang TIDAK dikerjakan)
- Proses order/permintaan pemeriksaan lab (modul transaksi RJ/RI/IGD).
- Input & validasi hasil lab, worklist analis (modul Pelayanan Penunjang Lab / LIS).
- Pencatatan billing/penjurnalan (modul Kasir/Keuangan) — modul ini hanya menyimpan tarif referensi.
- Manajemen stok reagen/alat (modul Inventory) — modul ini hanya merujuk, [PERLU KONFIRMASI] apakah field reagen dikelola di sini atau di Inventory.
- Pengiriman observation lab ke SATUSEHAT secara real-time (dilakukan modul transaksi/integrasi).

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Katalog lab terstandarisasi | % item lab punya kode internal unik + kelompok terisi | 100% |
| Interoperabilitas SATUSEHAT | % item aktif termapping LOINC | ≥ 90% [ASUMSI target] |
| Akurasi billing lab | % item aktif punya tarif berlaku | 100% |
| Efisiensi entry data | Waktu input 1 item baru | < 3 menit [ASUMSI] |
| Kemudahan setup awal | Item ter-import via template massal | ≥ 80% katalog awal |
| Konsistensi hasil | % parameter punya satuan & nilai rujukan | 100% parameter numerik |

[PERLU KONFIRMASI] Angka target final ditetapkan manajemen RS/Lab.

## 5. Related Feature

Fitur terkait dari cluster **Control Panel** (List Fitur sheet MVP):

| Code | Menu | Relasi |
|------|------|--------|
| A14 | Master Data / Integrasi SATUSEHAT BPJS V2 > Item Pemeriksaan Laboratorium | **Modul ini** |
| A3 | Master Data > Unit | Lookup unit/instalasi lab pelaksana |
| A4 | Master Data > Barang Farmasi | Acuan reagen/BHP (bila dirujuk) |
| A10 | Master Data / Integrasi BPJS V2 > Tindakan | Pola mapping kode BPJS, tarif |
| A11 | Master Data / Integrasi SATUSEHAT BPJS V2 > Diagnosa | Pola mapping kode SATUSEHAT |
| A13 | Master Data / Integrasi SATUSEHAT BPJS V2 > Procedure | Pola mapping (analogi terdekat) |
| A29 | Master Data > Item Pemeriksaan Radiologi | Pola identik (kembar modul penunjang) |
| A55 | Master Data > Jabatan | Audit (dibuat/diubah oleh staf) |
| A18/A53 | Role / RBAC | Kontrol akses CRUD master |

[ASUMSI] Pola mapping SATUSEHAT/BPJS mengikuti A10/A11/A13 agar konsisten lintas master.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — tidak ada BPMN khusus]
1. Daftar pemeriksaan lab disimpan di spreadsheet/dokumen terpisah per petugas lab.
2. Penambahan/perubahan item dilakukan manual, tanpa validasi duplikat/standar.
3. Tarif dan nilai rujukan disalin manual ke sistem billing/hasil → rawan beda versi.
4. Tidak ada kode LOINC/BPJS → mapping dilakukan ad-hoc saat klaim/kirim SATUSEHAT.

### B. To-Be (kondisi diharapkan)
1. Petugas berwenang membuka **Control Panel > Master Data > Item Pemeriksaan Lab**.
2. Sistem menampilkan daftar item + filter (kelompok, status, unit).
3. Tambah/Ubah item → isi form (atribut + parameter + nilai rujukan + tarif).
4. **Mapping kode**: sistem menyediakan pencarian kode SATUSEHAT (LOINC) — pilih → simpan code/display/system. (analogi pola A11/A13 [ASUMSI]).
5. Sistem **validasi duplikat** (kode internal/nama) sebelum simpan — analogi dengan Duplicate Detection di g-admisi-onsite-registration.
6. Item tersimpan menjadi referensi yang dipakai modul order lab, hasil, billing, dan pengiriman SATUSEHAT.
7. Import massal untuk setup awal; export untuk audit/backup.
8. Nonaktifkan (bukan hapus) item yang sudah tidak dipakai namun pernah dipakai transaksi.

## 7. Main Flow / Mindmap

**Skenario 1 — Tambah Item Pemeriksaan Lab**
1. User buka menu Item Pemeriksaan Lab → klik **Tambah**.
2. Isi data umum (kode internal, nama, kelompok, jenis [tunggal/panel], unit pelaksana).
3. Isi atribut layanan (satuan, metode, TAT, persiapan pasien, jenis spesimen, tarif).
4. Bila jenis = panel/paket → tambah **parameter anak** (nama, satuan, nilai rujukan per kategori).
5. **Mapping LOINC**: cari & pilih kode SATUSEHAT → autofill display + system URI. Mapping kode BPJS (bila tersedia).
6. Klik **Simpan** → sistem cek duplikat (kode/nama).
   - Gateway: *Ada duplikat?* → **Ya**: tampilkan peringatan, blok simpan / minta konfirmasi. **Tidak**: lanjut.
7. Event: **Item tersimpan** & langsung tersedia di modul transaksi lab.

**Skenario 2 — Ubah / Nonaktifkan Item**
1. Cari item → buka detail → **Ubah** atau toggle **Status Aktif**.
2. Gateway: *Item dipakai transaksi?* → **Ya**: hanya boleh nonaktif (soft), perubahan tarif berlaku prospektif (snapshot harga di transaksi lama tetap — konsisten pola harga_satuan_snapshot dari konteks terkait). **Tidak**: boleh ubah penuh.
3. Simpan → audit log (oleh siapa, kapan).

**Skenario 3 — Import Massal**
1. Unduh template CSV/XLSX → isi → upload.
2. Sistem validasi baris (format, duplikat, kode wajib). Gateway: *Semua valid?* → **Ya**: commit semua. **Tidak**: tampilkan laporan baris gagal, commit yang valid / batalkan ([PERLU KONFIRMASI] mode partial vs all-or-nothing).

[ASUMSI] Gateway duplikat & validasi import diturunkan dari pola g-admisi-onsite-registration (Duplicate Detection) dan g-backoffice-inventory-penerimaan (validasi partial/penuh).

## 8. Business Rules

- **BR-001**: Kode internal item pemeriksaan **unik** dan wajib. Sistem menolak duplikat. (trace: Skenario 1 step 6)
- **BR-002**: Nama pemeriksaan tidak boleh sama persis dalam kelompok yang sama → peringatkan kemungkinan duplikat.
- **BR-003**: Item yang **sudah dipakai transaksi** tidak boleh dihapus permanen, hanya dinonaktifkan (soft-delete). (trace: Skenario 2)
- **BR-004**: Perubahan **tarif** berlaku prospektif; transaksi lama memakai harga snapshot saat order (konsisten `harga_satuan_snapshot`/`tgl_snapshot_harga` dari konteks terkait).
- **BR-005**: Item bertipe **panel/paket** wajib punya ≥ 1 parameter anak; item **tunggal** tidak punya parameter anak.
- **BR-006**: Parameter numerik wajib punya **satuan** dan **nilai rujukan** (boleh per jenis kelamin/usia).
- **BR-007**: Mapping **LOINC** wajib untuk item aktif yang menghasilkan observation yang dikirim ke SATUSEHAT [PERLU KONFIRMASI cakupan wajib].
- **BR-008**: Hanya role berwenang (mis. Admin Master / Penanggung Jawab Lab) yang dapat CRUD — kontrol via RBAC (A53).
- **BR-009**: Setiap create/update dicatat audit (user, timestamp).
- **BR-010**: Status default item baru = **aktif** (konsisten `status_aktif` default aktif dari konteks terkait).

## 9. User Stories

- **US-001**: Sebagai Penanggung Jawab Lab, saya ingin menambah jenis pemeriksaan lab beserta atributnya, agar katalog lab seragam dipakai semua modul. (trace: Skenario 1)
- **US-002**: Sebagai Admin Master, saya ingin mengelompokkan pemeriksaan (hematologi, kimia klinik, dll), agar mudah dicari & dilaporkan.
- **US-003**: Sebagai Penanggung Jawab Lab, saya ingin mengisi nilai rujukan per jenis kelamin/usia, agar hasil lab terinterpretasi benar.
- **US-004**: Sebagai Admin Master, saya ingin memetakan item ke kode LOINC SATUSEHAT, agar hasil lab dapat dikirim ke platform SATUSEHAT. (trace: Skenario 1 step 5)
- **US-005**: Sebagai Petugas Lab, saya ingin mendefinisikan parameter anak pada pemeriksaan panel, agar tiap parameter punya satuan & nilai rujukan sendiri. (trace: BR-005)
- **US-006**: Sebagai Admin Master, saya ingin mencegah duplikat kode/nama saat simpan, agar tidak ada item ganda. (trace: BR-001/002)
- **US-007**: Sebagai Admin Master, saya ingin menonaktifkan item lama tanpa menghapus, agar histori transaksi tetap utuh. (trace: BR-003)
- **US-008**: Sebagai Admin Master, saya ingin mengimpor katalog lab secara massal via template, agar setup awal cepat. (trace: Skenario 3)
- **US-009**: Sebagai Kasir/Sistem Billing, saya ingin tarif lab tersedia terpusat & berlaku prospektif, agar penagihan akurat. (trace: BR-004)
- **US-010**: Sebagai Manajemen, saya ingin dashboard ringkasan master lab, agar tahu kelengkapan mapping & status item.

## 10. Functional Requirements

- **FR-001** CRUD item pemeriksaan lab (create/read/update, soft-delete). (US-001, US-007)
- **FR-002** Kelola master **kelompok pemeriksaan** (lookup). (US-002)
- **FR-003** Kelola **parameter anak** untuk item panel (sub-tabel dinamis). (US-005)
- **FR-004** Kelola **nilai rujukan** per parameter dengan kategori jenis kelamin & rentang usia. (US-003)
- **FR-005** Field atribut layanan: satuan, metode, TAT, persiapan pasien, jenis spesimen, tarif. (US-001)
- **FR-006** Pencarian kode **SATUSEHAT LOINC** (autocomplete) + simpan code/display/system URI. (US-004)
- **FR-007** Mapping kode **BPJS** (opsional, bila tersedia). (US-009)
- **FR-008** Validasi duplikat kode/nama saat simpan. (US-006, BR-001/002)
- **FR-009** **Import massal** CSV/XLSX dengan validasi baris + laporan error. (US-008)
- **FR-010** **Export** daftar item (CSV/XLSX) untuk audit/backup.
- **FR-011** Filter/sort daftar (kelompok, status, unit, mapping LOINC ada/tidak). (US-010)
- **FR-012** Dashboard ringkasan (total item, % termapping LOINC, % bertarif). (US-010)
- **FR-013** Audit log create/update (user, timestamp). (BR-009)
- **FR-014** Kontrol akses CRUD via RBAC. (BR-008)
- **FR-015** Snapshot tarif: simpan riwayat tarif berlaku per tanggal (prospektif). (BR-004)

## 11. Data Requirements (Spesifikasi Field)

### A. Form Tambah/Edit Item Pemeriksaan Lab (INPUT) — trace FR-001/005/006/007

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_item | Kode Pemeriksaan | text | Ya | unik, maks 20 char, alfanumerik | manual/auto-generate | BR-001, tidak boleh duplikat |
| nama_item | Nama Pemeriksaan | text | Ya | maks 100 char | manual | konsisten gaya `nama` (maks 100) |
| kelompok | Kelompok Pemeriksaan | dropdown(lookup) | Ya | dari master kelompok (FR-002) | lookup | hematologi/kimia klinik/imunologi/mikrobiologi/patklin/urinalisis |
| jenis_item | Jenis Pemeriksaan | dropdown | Ya | enum: tunggal / panel | manual | panel → wajib parameter (BR-005) |
| unit | Unit/Instalasi Pelaksana | dropdown(lookup) | Ya | dari master Unit (A3) | lookup A3 | konsisten field `unit` |
| jenis_spesimen | Jenis Spesimen | dropdown | Ya | enum: darah/urin/feses/serum/plasma/sputum/swab/lainnya | manual | [PERLU KONFIRMASI master spesimen terpisah?] |
| satuan_hasil | Satuan Hasil | dropdown/text | Bersyarat | utk item tunggal numerik | manual | konsisten konsep `satuan` |
| metode | Metode Pemeriksaan | text | Tidak | maks 100 char | manual | mis. flowcytometry, ELISA |
| tat_nilai | Turn Around Time | number | Tidak | > 0 | manual | + satuan waktu |
| tat_satuan | Satuan TAT | dropdown | Bersyarat | enum: menit/jam/hari | manual | wajib bila tat_nilai diisi |
| persiapan_pasien | Persiapan Pasien | text | Tidak | maks 255 char | manual | mis. puasa 8 jam |
| tarif | Tarif | number | Ya | >= 0, format Rupiah | manual | BR-004, snapshot prospektif (FR-015) |
| tgl_berlaku_tarif | Tarif Berlaku Mulai | date | Bersyarat | >= hari ini | manual | wajib bila ubah tarif |
| loinc_code | Kode SATUSEHAT (LOINC) | lookup | Bersyarat | format LOINC, dari pencarian | integrasi SATUSEHAT | BR-007, autofill display+system |
| loinc_display | LOINC Display | text | Auto | — | integrasi SATUSEHAT | read-only autofill |
| loinc_system | LOINC System URI | text | Auto | http://loinc.org | integrasi SATUSEHAT | read-only autofill |
| kode_bpjs | Kode BPJS | text | Tidak | sesуаi referensi BPJS | integrasi/manual | bila tersedia |
| status_aktif | Status Aktif | boolean | Ya | aktif/nonaktif | default aktif | konsisten `status_aktif` |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | |

### B. Sub-form Parameter Anak (INPUT, item panel) — trace FR-003/004

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| nama_parameter | Nama Parameter | text | Ya | maks 100 char | manual | mis. Hemoglobin |
| satuan | Satuan | dropdown/text | Bersyarat | wajib utk numerik | manual | BR-006 |
| tipe_nilai | Tipe Nilai | dropdown | Ya | enum: numerik/teks/positif-negatif | manual | |
| rujukan_min | Nilai Rujukan Min | number | Bersyarat | numerik | manual | wajib bila tipe numerik |
| rujukan_max | Nilai Rujukan Maks | number | Bersyarat | >= min | manual | |
| kategori_kelamin | Kategori Jenis Kelamin | dropdown | Tidak | enum: L/P/Semua | default Semua | konsisten `jenis_kelamin` (L/P) |
| usia_min | Usia Min (thn) | number | Tidak | >= 0 | manual | rentang rujukan per usia |
| usia_max | Usia Maks (thn) | number | Tidak | >= usia_min | manual | |
| loinc_code_param | LOINC Parameter | lookup | Tidak | format LOINC | integrasi SATUSEHAT | tiap parameter bisa punya LOINC sendiri |

### C. Form Import Massal (INPUT) — trace FR-009

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| file_import | File Item Lab | file | Ya | .csv/.xlsx, sesuai template | manual upload | konsisten `file_import` |
| mode_import | Mode Import | dropdown | Ya | enum: tambah baru / update / upsert | manual | konsisten `mode_import` |

### D. Dashboard / List Item Pemeriksaan Lab (TAMPIL) — trace FR-011/012

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Item Aktif | count item where status_aktif | angka besar (kartu) | – | ringkasan |
| % Termapping LOINC | count loinc_code not null / total aktif | persen + badge | – | indikator interoperabilitas |
| % Bertarif | count tarif>0 / total aktif | persen | – | indikator billing |
| Kode | item.kode_item | text | sort A-Z | |
| Nama Pemeriksaan | item.nama_item | text | sort, search | |
| Kelompok | item.kelompok | text | filter | |
| Jenis | item.jenis_item | badge (tunggal/panel) | filter | |
| Unit | item.unit | text | filter | dari A3 |
| Tarif | item.tarif | Rupiah (Rp) | sort | |
| LOINC | item.loinc_code | badge (ada/—) | filter | merah bila kosong |
| Status | item.status_aktif | badge (aktif/nonaktif) | filter | |
| Diubah Oleh | audit (staff) | text + timestamp | sort tgl | FR-013 |

[PERLU KONFIRMASI] Apakah reagen/alat lab dikelola sebagai field di sini atau relasi ke modul Inventory (A4).

## 12. Non-Functional Requirements

- **NFR-001** Performa: daftar item (≤ 5.000 baris) tampil < 2 detik; pencarian < 1 detik. [ASUMSI]
- **NFR-002** Ketersediaan: master dapat dibaca modul transaksi via cache lokal saat internet lab tidak stabil (RS Tipe C&D); sync mapping SATUSEHAT saat online. [ASUMSI]
- **NFR-003** Keamanan: CRUD hanya role berwenang (RBAC A53); audit log immutable.
- **NFR-004** Interoperabilitas: mapping LOINC mengikuti system URI `http://loinc.org` standar SATUSEHAT Terminology V2.
- **NFR-005** Validasi data: cegah duplikat & data tak lengkap di sisi server (bukan hanya client).
- **NFR-006** Usability: form mudah dipakai SDM lab non-IT; pesan error berbahasa Indonesia & jelas.
- **NFR-007** Auditability: setiap perubahan tarif tersimpan riwayatnya (FR-015).
- **NFR-008** Skalabilitas import: 1 file hingga [PERLU KONFIRMASI] baris diproses tanpa timeout.

## 13. Integrasi Eksternal

| Integrasi | Arah | Fungsi di modul ini | Catatan |
|-----------|------|---------------------|---------|
| **SATUSEHAT Terminology (LOINC)** | tarik (lookup) | Cari & simpan kode LOINC (code/display/system) untuk item & parameter | Wajib utk pengiriman observation lab oleh modul transaksi (BR-007) |
| **BPJS** | tarik/manual | Mapping kode/tarif BPJS bila tersedia | Pola mengikuti A10 Tindakan [ASUMSI] |
| **LIS (Laboratory Information System)** | konsumsi | LIS membaca master item/parameter sebagai referensi order & hasil | Modul ini penyedia data; integrasi runtime di modul Lab [PERLU KONFIRMASI ada LIS di RS Tipe C&D?] |
| **Modul internal** (RJ/RI/IGD, RME, Kasir) | konsumsi | Order lab, hasil, billing merujuk master ini | Tarif via snapshot (BR-004) |

**Catatan Interoperabilitas SATUSEHAT**: setiap item lab yang menghasilkan observasi sebaiknya termapping LOINC agar resource `Observation`/`ServiceRequest` valid saat dikirim. Modul ini hanya menyimpan mapping; pengiriman dilakukan modul transaksi/integrasi.

[ASUMSI] Tidak ada BPMN khusus modul ini; integrasi diturunkan dari pola master data lain (A4/A10/A11/A13) dan proses BPMN terkait (apotek online APOL untuk pola integrasi tarik/validasi/return response).

## Asumsi
- [ASUMSI] Modul tidak punya BPMN sendiri; alur As-Is/To-Be & gateway diturunkan dari pola g-admisi-onsite-registration (duplicate detection), g-backoffice-inventory-penerimaan (validasi partial/penuh), dan g-support-apotek-online-iter (pola integrasi tarik/validasi).
- [ASUMSI] Pola mapping SATUSEHAT/BPJS mengikuti master A10/A11/A13 agar konsisten lintas modul.
- [ASUMSI] RS Tipe C&D punya keterbatasan SDM IT & internet → disediakan cache lokal master + import massal untuk setup cepat.
- [ASUMSI] Soft-delete (nonaktif) dipakai, bukan hard-delete, untuk menjaga integritas histori transaksi.
- [ASUMSI] Tarif prospektif memakai mekanisme snapshot konsisten dengan harga_satuan_snapshot/tgl_snapshot_harga dari konteks PRD terkait.
- [ASUMSI] Field identitas seperti audit 'diubah oleh' memakai data Staff (A2) — nama/nip konsisten definisi kanonik.

## Pertanyaan Terbuka
- Reagen/alat lab dikelola sebagai field di modul ini atau relasi ke Inventory (A4)?
- Apakah RS Tipe C&D target punya LIS terpisah, atau hasil lab diinput manual di SIMRS?
- Mode import massal: all-or-nothing atau partial commit (baris valid tetap masuk)?
- Cakupan wajib mapping LOINC: semua item aktif atau hanya yang dikirim ke SATUSEHAT?
- Apakah kode BPJS tersedia untuk pemeriksaan lab, dan sumbernya (referensi LUPIS/manual)?
- Batas jumlah baris per file import & SLA performa final.
- Target % mapping LOINC dan metrik lain ditetapkan manajemen/lab.