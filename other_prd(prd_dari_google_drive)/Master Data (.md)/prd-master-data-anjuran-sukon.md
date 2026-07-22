# PRD — Master Data Anjuran Sukon (Anjuran Surat Kontrol)

**Related Document:** List Fitur V2.xlsx (sheet MVP) — A30 Control Panel > Master Data > Anjuran Sukon; PRD terkait: Formulir Surat Kontrol (kode fitur dikosongkan dulu — lihat catatan), A1 User. Tidak ada BPMN khusus modul ini.
**Versi:** 1.7 - Penyelarasan Business Process: As-Is dinyatakan SAMA dengan To-Be (tidak ada perubahan proses untuk modul ini); To-Be dirapikan & dipastikan lengkap-benar (semua langkah, gateway, dan hasil akhir konsisten dengan BR/FR). Konsolidasi atas v1.6.

## 1. Overview / Brief Summary

**Master Data Anjuran Sukon** adalah kumpulan teks anjuran kontrol standar yang dapat digunakan ulang (*reusable*) ketika dokter/petugas mengisi field **Anjuran** pada **Formulir Surat Kontrol** (Sukon). Contoh anjuran: "Kontrol sesuai jadwal", "Kontrol jika ada keluhan", "Lakukan pemeriksaan lab sebelum kunjungan berikutnya".

Berbeda dengan master data konvensional yang dikelola via menu administrasi terpisah, master data ini dikelola **inline** — langsung dari dalam formulir saat surat kontrol sedang disusun. Field Anjuran disajikan sebagai **dropdown yang dapat dicari** (*searchable combobox*). Dari field ini user dapat:
- **Memilih** anjuran yang sudah tersimpan;
- **Menambah baru** (aksi *Tambah Baru*) tanpa berpindah menu — kolom isian menampilkan opsi mengetik anjuran baru atau memilih dari daftar yang sudah ada;
- **Mengubah** dan **menghapus** tiap item langsung dari daftar.

Karakteristik utama:
- **Global**: seluruh dokter & unit berbagi daftar yang sama → konsistensi redaksi se-RS.
- **Anti-duplikasi**: setiap tambah/ubah divalidasi dengan **pencocokan ternormalisasi** (case-insensitive, trim, normalisasi spasi, hapus tanda baca ujung). Normalisasi ini **tidak menyentuh sinonim/parafrase** — dua kalimat bermakna sama tapi beda kata tetap dianggap entri berbeda (lihat BR-001).

Tujuan: mempercepat dokumentasi tindak lanjut pasien, menjaga konsistensi redaksi antar dokter/kunjungan, dan meningkatkan kualitas data rekam medis — khususnya pada **RS Tipe C & D** yang sumber daya administratifnya terbatas.

> **Catatan scope (MVP):** Pengelolaan master dilakukan **sepenuhnya inline** dari formulir; **menu administrasi/halaman kelola terpisah tidak disediakan**.

## 2. Background

**Kondisi & masalah yang melatarbelakangi:**
- Setelah pemeriksaan, dokter kerap menerbitkan surat kontrol berisi anjuran tindak lanjut. Anjuran ini **repetitif** dan banyak yang berulang antar pasien.
- Tanpa master data anjuran (baseline historis), user **mengetik ulang manual** di setiap surat kontrol → pengisian lambat (terutama saat volume pasien tinggi), **redaksi tidak konsisten**, dan **rentan salah ketik** yang menurunkan kualitas data serta menyulitkan pelaporan.
- RS Tipe C & D umumnya **tidak punya petugas khusus** penyiapan master data terpusat di awal.

**Pendekatan yang dipilih (self-service inline / organik):**
- Master data anjuran dibangun **bertahap langsung dari dalam formulir** oleh dokter/petugas sesuai kebutuhan nyata, menghilangkan ketergantungan pada proses setup terpusat yang sering tidak praktis di RS kecil–menengah. Karena itu, **menu administrasi terpisah tidak diperlukan** pada MVP.

> **Catatan proses (penting untuk Business Process):** Pendekatan inline ini adalah **desain proses yang berlaku untuk modul ini**. Artinya, alur **As-Is dan To-Be tidak berbeda** — kondisi yang berjalan sudah sama dengan kondisi yang diharapkan. PRD ini **mendokumentasikan** alur tersebut secara benar dan lengkap, bukan mengusulkan transformasi proses. Skenario "ketik manual" di atas adalah **baseline tanpa fitur** (referensi historis), bukan kondisi As-Is modul ini.

**Risiko & mitigasi:**
- Karena master bersifat **global** & dibangun banyak user, ada **risiko duplikasi**. Mitigasi: alur tambah **menampilkan daftar anjuran yang sudah ada** (mendorong pilih ulang daripada buat baru) + **validasi anti-duplikasi ternormalisasi**.
- **Batas mitigasi (sinonim):** validasi anti-duplikasi hanya menangkap duplikat *tekstual* (setelah normalisasi dasar), **tidak** menangkap anjuran bermakna sama dengan kata berbeda. Risiko duplikat semantik diterima pada MVP dan diredam dengan mendorong pilih ulang dari daftar saran. [ASUMSI: keputusan user — sinonim diabaikan]
- **Integritas historis**: penghapusan anjuran dari master **tidak memengaruhi surat kontrol yang sudah diterbitkan** — teks anjuran tersimpan sebagai snapshot di dokumen lama. Dengan begitu daftar tetap bersih & ringkas untuk pemakaian baru tanpa mengubah riwayat. [ASUMSI: nilai anjuran di-snapshot ke dokumen surat kontrol saat terbit]

## 3. In Scope

### Scope Definition (yang dikerjakan)
1. **Searchable combobox Anjuran** pada Formulir Surat Kontrol: cari + pilih anjuran existing dari master global.
2. **Tambah Baru (inline)**: buat anjuran baru dari dalam formulir; saat mengetik, sistem menampilkan saran/daftar yang sudah ada.
3. **Ubah (inline)** teks anjuran pada item daftar.
4. **Hapus (soft delete)** anjuran dari master tanpa mengganggu surat kontrol yang sudah terbit.
5. **Validasi anti-duplikasi** ternormalisasi (tekstual, tanpa sinonim) pada tambah & ubah.
6. **Master global** dipakai bersama lintas dokter/unit.
7. **Audit dasar** (`created_by`/`created_at`/`updated_by`/`updated_at`) pada setiap perubahan.

### Out Scope (yang TIDAK dikerjakan)
- Pengisian/penerbitan **Formulir Surat Kontrol** itu sendiri (modul terpisah) — di sini hanya perilaku field Anjuran.
- **Halaman kelola Master Data Anjuran terpisah** di Control Panel — **tidak diperlukan** pada MVP. Seluruh pengelolaan (tambah/ubah/hapus/cari) dilakukan **inline** dari dalam formulir. [PERLU KONFIRMASI: bila kelak dibutuhkan menu audit/cleanup khusus]
- **Deteksi duplikat berbasis sinonim/semantik** — normalisasi hanya tekstual; anjuran bermakna sama dengan redaksi berbeda dibiarkan sebagai entri terpisah. (Keputusan user.)
- Integrasi terminologi eksternal (SATUSEHAT/BPJS) untuk anjuran — anjuran bersifat **teks bebas terstandardisasi internal**, bukan kode. [ASUMSI]
- **Versioning/riwayat perubahan teks anjuran** — **tidak dibuat**; cukup **audit dasar** (siapa & kapan terakhir mengubah). (Keputusan user.)
- Hard delete data master.

## 4. Goals and Metrics

| Tujuan | Metrik | Target |
|---|---|---|
| Percepat pengisian anjuran | Rata-rata waktu mengisi field Anjuran per surat kontrol | Turun ≥50% vs ketik manual [ASUMSI baseline] |
| Dorong reuse, kurangi duplikasi | % anjuran dipilih dari daftar existing vs dibuat baru | ≥70% pilih existing setelah 1 bulan |
| Jaga konsistensi redaksi | Jumlah entri master duplikat (ternormalisasi tekstual) | 0 duplikat tekstual |
| Tingkatkan kualitas data RM | % surat kontrol dengan field anjuran terisi & valid | ≥95% |
| Adopsi self-service | Jumlah anjuran unik yang terbentuk organik | Tumbuh stabil lalu mendatar (kurva jenuh) |

[ASUMSI] Metrik baseline ditetapkan saat go-live; angka di atas indikatif untuk RS Tipe C & D.

> Catatan: target "0 duplikat" hanya menjamin tidak ada duplikat **tekstual** (sesudah normalisasi dasar). Duplikat **semantik/sinonim** tidak diukur sebagai pelanggaran karena di luar scope normalisasi (keputusan user).

## 5. Related Feature

Dari List Fitur V2 (sheet MVP), cluster **Control Panel**:

| Code | Menu | Relasi |
|---|---|---|
| **A30** | Control Panel > Master Data > **Anjuran Sukon** | **Modul ini** |
| A1 | Master Data > User | `created_by`/`updated_by` audit mengacu user |
| _(dikosongkan)_ | Formulir Surat Kontrol | Konsumen utama master ini — **kode fitur dikosongkan dulu** atas keputusan user; akan dilengkapi saat List Fitur final. Bukan blocker pembangunan modul A30. |

Modul konsumen utama: **Formulir Surat Kontrol** — field Anjuran memanggil master ini. Kode fitur sengaja dikosongkan pada iterasi ini (lihat baris tabel).

## 6. Business Process (As-Is / To-Be)

> **Penegasan (keputusan user):** Untuk modul ini **As-Is = To-Be** — kondisi yang berjalan sudah sama dengan kondisi yang diharapkan, sehingga **tidak ada perubahan proses**. PRD ini mendokumentasikan alur tersebut secara benar dan lengkap. Kedua sub-bagian di bawah karena itu **mendeskripsikan alur yang identik**; To-Be ditampilkan lebih rinci untuk memastikan setiap langkah, gateway, dan hasil akhir konsisten dengan Business Rules (§8) dan Functional Requirements (§10).

### A. As-Is (kondisi saat ini) — **identik dengan To-Be**
Alur pengelolaan anjuran via field combobox inline pada Formulir Surat Kontrol **sudah berjalan** persis seperti yang dijabarkan pada To-Be di bawah (cari → pilih existing, atau Tambah Baru dengan cek anti-duplikasi tekstual, serta ubah/hapus inline). Tidak ada langkah As-Is yang berbeda yang perlu diubah.

> Catatan: Skenario lama "dokter mengetik anjuran manual tanpa master" adalah **baseline historis tanpa fitur** (lihat §2 Background), **bukan** As-Is modul ini. Karena itu tidak dijadikan pembanding proses di sini.

### B. To-Be (kondisi yang berjalan & diharapkan — dipastikan benar) [ASUMSI: modul ini belum punya BPMN sendiri; alur diturunkan dari analogi proses terkait]
1. **Mulai:** Dokter menyelesaikan pemeriksaan → membuka Formulir Surat Kontrol → fokus ke field **Anjuran** (searchable combobox). *(Hanya anjuran berstatus aktif yang ditampilkan — BR-005.)*
2. Dokter **mengetik kata kunci** → sistem menampilkan (debounce, server-side) daftar anjuran **aktif** global yang cocok. (FR-001)
3. **Gateway — Anjuran yang sesuai sudah ada di daftar?**
   - **Ya** → dokter **memilih** dari daftar → field langsung terisi. → lanjut ke langkah 6.
   - **Tidak** → lanjut ke langkah 4 (Tambah Baru).
4. **Tambah Baru (inline):** dokter klik **Tambah Baru** → muncul kolom isian yang **tetap menampilkan daftar/saran existing** (mendorong pilih ulang, US-003) → dokter mengetik teks anjuran (3–255 char) → klik **Simpan**. (FR-002)
5. Sistem menjalankan **normalisasi tekstual** (trim + lowercase + collapse spasi + hapus tanda baca ujung) lalu **cek duplikat** terhadap entri **aktif** (BR-001, FR-003).
   - **Gateway — Duplikat tekstual ditemukan?**
     - **Ya** → sistem **memblok simpan**, menampilkan entri existing, dan menyarankan dokter **memilih entri tersebut** → kembali ke langkah 3 (pilih existing).
     - **Tidak** (termasuk kasus sinonim/redaksi berbeda yang bermakna sama — **sengaja tidak diblok**) → anjuran **tersimpan ke master global** (`status_aktif = aktif`, audit dasar dicatat) → **otomatis terpilih** pada field. (FR-004, BR-002, BR-006)
6. **(Opsional) Kelola item dari daftar:**
   - **Ubah:** pilih aksi *Ubah* pada item → edit teks → ulangi validasi langkah 5 → simpan (berlaku global, tidak mengubah surat kontrol lama). (FR-005, BR-003)
   - **Hapus:** pilih aksi *Hapus* → konfirmasi → **soft delete** (`status_aktif = nonaktif`) → item hilang dari pemakaian baru, dokumen lama tetap utuh. (FR-006, BR-004/005)
7. **Selesai:** Surat kontrol diterbitkan → **teks anjuran di-snapshot** ke dokumen sehingga perubahan/penghapusan master di kemudian hari tidak mengubah dokumen yang sudah terbit. (FR-008, BR-003) [ASUMSI]

**Verifikasi kelengkapan alur (memastikan To-Be berjalan benar):** setiap gateway memiliki kedua cabang yang berujung pada hasil akhir yang valid (terpilih / tersimpah-lalu-terpilih / diarahkan pilih ulang); operasi ubah/hapus memakai validasi & soft delete yang sama; tiap langkah tertaut ke FR/BR terkait. Tidak ada cabang menggantung (*dangling*).

Acuan pola (analogi BPMN): "Load Master Data" & "Generate Smart Recommendation" pada *g-service-pathology-order*, dan pola pilih/tambah inline pada alur admisi. [ASUMSI: diturunkan dari analogi]

## 7. Main Flow / Mindmap

**Skenario 1 — Pilih anjuran existing (jalur utama):**
1. Buka Formulir Surat Kontrol → field Anjuran.
2. Ketik kata kunci → daftar tersaring muncul (debounce).
3. Pilih item → terisi pada field. Selesai.

**Skenario 2 — Tambah anjuran baru (tidak ada yang cocok):**
1. Ketik kata kunci → tidak ada yang persis cocok.
2. Klik **Tambah Baru** → muncul kolom isian (menampilkan juga daftar existing sebagai saran).
3. Ketik teks anjuran → klik Simpan.
4. Sistem normalisasi tekstual + cek duplikat.
   - Duplikat tekstual → tampilkan existing, blok simpan, sarankan pilih ulang.
   - Tidak (termasuk kasus sinonim/redaksi beda) → simpan ke master global, auto-terpilih.

**Skenario 3 — Ubah item:** pilih aksi *Ubah* pada item → edit teks → cek duplikat tekstual → simpan (berlaku global, tidak mengubah surat kontrol lama).

**Skenario 4 — Hapus item:** pilih aksi *Hapus* → konfirmasi → **soft delete** (status nonaktif) → item hilang dari daftar pemakaian baru; surat kontrol lama tetap utuh.

```mindmap
Field Anjuran (combobox)
├─ Cari & Pilih existing
├─ Tambah Baru → normalisasi tekstual → cek duplikat → simpan global
├─ Ubah item (global, historis aman)
└─ Hapus item (soft delete)
```

## 8. Business Rules

- **BR-001 (Anti-duplikasi ternormalisasi — tekstual):** Saat tambah/ubah, teks anjuran dinormalisasi dengan aturan **final** berikut:
  1. *trim* spasi di awal/akhir;
  2. *lowercase* (case-insensitive);
  3. *collapse* spasi/ tab ganda menjadi satu spasi;
  4. hapus tanda baca di **ujung** teks (mis. titik/koma/spasi akhir).
  
  **Sinonim, singkatan, dan parafrase TIDAK dinormalisasi** — dua teks yang bermakna sama tetapi berbeda kata dianggap **berbeda** dan diizinkan tersimpan. Jika hasil normalisasi sama persis dengan entri **aktif** yang sudah ada → **tolak simpan** & arahkan pilih entri existing. *(Keputusan user: sinonim diabaikan.)*
- **BR-002 (Master global):** Satu master anjuran dipakai bersama seluruh dokter & unit; tidak ada penyekatan per-unit.
- **BR-003 (Integritas historis):** Hapus/ubah anjuran **tidak mengubah** surat kontrol yang sudah diterbitkan (teks di-snapshot saat terbit). [ASUMSI]
- **BR-004 (Soft delete):** Hapus = set `status_aktif = nonaktif`; data tidak dihilangkan fisik agar relasi historis & audit aman.
- **BR-005 (Item nonaktif tidak muncul):** Anjuran nonaktif tidak tampil di combobox pemakaian baru, tetapi tetap terbaca pada dokumen lama.
- **BR-006 (Audit dasar):** Setiap tambah/ubah/hapus mencatat `created_by`/`updated_by` + timestamp. **Hanya audit dasar** (kondisi terakhir: siapa & kapan); **tidak menyimpan riwayat/versi nilai sebelumnya**. *(Keputusan user.)*


## 9. User Stories

- **US-001** — Sebagai **Dokter (DPJP)**, saya ingin **mencari & memilih anjuran yang sudah ada** dari dropdown, agar saya tidak perlu mengetik ulang dan pengisian lebih cepat. 
- **US-002** — Sebagai **Dokter**, saya ingin **menambah anjuran baru langsung dari formulir** tanpa pindah menu, agar saya bisa mendokumentasikan tindak lanjut yang belum ada di daftar. *(acuan pola inline)*
- **US-003** — Sebagai **Dokter**, saat menambah anjuran baru saya ingin **melihat daftar yang sudah ada**, agar saya cenderung memilih ulang dan menghindari duplikasi. 
- **US-004** — Sebagai **Sistem/Petugas**, saya ingin **validasi anti-duplikasi tekstual otomatis**, agar master tetap bersih dari duplikat persis (catatan: sinonim tidak dicek). 
- **US-005** — Sebagai **Dokter**, saya ingin **mengubah** teks anjuran, agar redaksi yang keliru dapat diperbaiki untuk pemakaian berikutnya.
- **US-006** — Sebagai **Dokter**, saya ingin **menghapus (soft delete)** anjuran yang tidak relevan, **tanpa merusak surat kontrol lama**, agar daftar tetap ringkas.
- **US-007** — Sebagai **Manajemen**, saya ingin **konsistensi redaksi anjuran** lintas dokter/kunjungan, agar pelaporan & analisis data RM lebih akurat.
- **US-008** — Sebagai **Admin/Manajemen**, saya ingin **mengetahui siapa & kapan** sebuah anjuran terakhir dibuat/diubah/dinonaktifkan (audit dasar), agar perubahan master dapat ditelusuri tanpa perlu riwayat versi penuh.

## 10. Functional Requirements

| ID | Requirement | Traceability |
|---|---|---|
| **FR-001** | Field Anjuran berupa **searchable combobox** yang menampilkan anjuran aktif (global) dengan pencarian *server-side* (debounce, limit hasil). | US-001, BR-002/005 |
| **FR-002** | Aksi **Tambah Baru** membuka kolom isian inline; saat user mengetik, sistem menampilkan saran/daftar existing yang mirip. | US-002, US-003 |
| **FR-003** | Saat simpan tambah/ubah, sistem menjalankan **normalisasi tekstual + cek duplikat** (BR-001, tanpa sinonim); jika duplikat persis → blok simpan, tampilkan entri existing, tawarkan pilih ulang. | US-003, US-004, BR-001 |
| **FR-004** | Anjuran baru yang valid tersimpan ke master **global** dan otomatis terpilih pada field yang sedang diisi. | US-002, BR-002 |
| **FR-005** | Aksi **Ubah** pada item: edit teks → validasi (FR-003) → simpan global; tidak mengubah surat kontrol terbit. | US-005, BR-003 |
| **FR-006** | Aksi **Hapus** = **soft delete** (`status_aktif=nonaktif`) dengan konfirmasi; item hilang dari pemakaian baru, data lama utuh. | US-006, BR-003/004/005 |
| **FR-008** | Teks anjuran di-**snapshot** ke dokumen surat kontrol saat penerbitan. | BR-003 [ASUMSI] |
| **FR-010** | Mencatat **audit dasar** (`created_by`,`created_at`,`updated_by`,`updated_at`) tiap perubahan — kondisi terakhir saja, **tanpa riwayat versi nilai**. | US-008, BR-006 |


## 11. Data Requirements (Spesifikasi Field)

### Entitas: `master_anjuran_sukon`

#### A. Layar INPUT — Form Tambah/Ubah Anjuran (inline dari formulir)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `anjuran_id` | ID Anjuran | text (UUID/seq) | Ya | unik, auto | auto-generate | tidak ditampilkan ke user |
| `teks_anjuran` | Teks Anjuran | text | Ya | 3–255 char (final), unik ternormalisasi tekstual (BR-001) | manual | field utama (combobox) |
| `teks_normal` | Teks Ternormalisasi | text | Ya | derived: trim + lowercase + collapse spasi + hapus tanda baca ujung (BR-001) | auto | dipakai untuk cek duplikat (FR-003); **tidak** memproses sinonim |
| `keterangan` | Keterangan | text | Tidak | maks 255 char | manual | **field kanonik** (konsisten dgn definisi bersama lintas-PRD) |
| `status_aktif` | Status Aktif | boolean | Ya | aktif/nonaktif | default **aktif** | **field kanonik**; hapus = set nonaktif (BR-004) |
| `created_by` | Dibuat Oleh | lookup | Ya | dari master User (A1) | auto (user login) | audit dasar |
| `created_at` | Tgl Dibuat | datetime | Ya | auto | auto | audit dasar |
| `updated_by` | Diubah Oleh | lookup | Tidak | dari master User (A1) | auto | audit dasar |
| `updated_at` | Tgl Diubah | datetime | Tidak | auto | auto | audit dasar |

> **Audit dasar (keputusan user):** hanya menyimpan kondisi terakhir (kolom di atas). **Tidak ada** tabel/riwayat versi nilai sebelumnya. Bila perlu jejak perubahan penuh, jadikan enhancement terpisah pasca-MVP.

#### B. Layar INPUT — Field Anjuran pada Formulir Surat Kontrol (combobox)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `anjuran_ref` | Anjuran | lookup (combobox) | Ya | harus referensi anjuran **aktif**, atau hasil Tambah Baru | lookup `master_anjuran_sukon` | searchable, debounce (FR-001) |
| `teks_snapshot` | Teks Anjuran (tercetak) | text | Ya | salinan `teks_anjuran` saat terbit (maks 255 char) | auto snapshot | integritas historis (FR-008) |

#### C. Layar TAMPIL — Saran saat Tambah Baru (anti-duplikasi)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Saran Anjuran Existing | query `LIKE` ternormalisasi tekstual atas `teks_normal` | list ringkas, highlight kecocokan | urut relevansi | mendorong pilih ulang (US-003); pencocokan tekstual, bukan sinonim |

> Layar daftar/kelola Master Data Anjuran terpisah **tidak disediakan** (Out Scope). Pencarian, ubah, dan hapus dilakukan **inline** melalui combobox pada formulir; tampilan status aktif/nonaktif & audit dasar tetap mengikuti aturan di tabel A.

## 12. Non-Functional Requirements

- **NFR-001 (Performa pencarian):** Hasil combobox tampil ≤500 ms untuk master ≤10.000 entri; gunakan index pada `teks_normal`. [ASUMSI volume RS Tipe C/D]
- **NFR-002 (Usability):** Alur tambah baru ≤3 klik dari field; combobox mendukung keyboard (panah + enter).
- **NFR-003 (Konsistensi data):** Constraint **unik** pada `teks_normal` di level database mencegah duplikasi balapan (race) selain validasi aplikasi (BR-001). Keunikan hanya pada level tekstual ternormalisasi (bukan semantik).
- **NFR-004 (Ketersediaan offline/jaringan):** Mengingat internet RS Tipe C/D bisa tidak stabil, master di-cache lokal/server on-prem; tidak bergantung layanan eksternal. [ASUMSI]
- **NFR-005 (Auditability):** Semua perubahan terekam sebagai **audit dasar** (FR-010) & dapat ditelusuri (siapa/kapan terakhir). Riwayat versi tidak disediakan (keputusan user).
- **NFR-007 (Skalabilitas teks):** `teks_anjuran` dibatasi **255 char (final, dikonfirmasi user)** untuk konsistensi tampilan & cetak.
- **NFR-008 (Integritas historis):** Operasi hapus/ubah tidak boleh mengubah snapshot pada dokumen terbit (BR-003).

> *Catatan revisi:* NFR-006 (Keamanan/RBAC) **dihapus** mengikuti penghapusan BR-007. Nomor NFR-006 dikosongkan agar ID lain tetap stabil.

## 13. Integrasi Eksternal

- **Tidak ada integrasi eksternal wajib** (BPJS/SATUSEHAT/Disdukcapil) untuk modul ini. Anjuran adalah **teks terstandardisasi internal**, bukan kode terminologi. [ASUMSI]

**Integrasi internal (lintas modul):**
- **Formulir Surat Kontrol** (kode fitur **dikosongkan dulu** atas keputusan user) — konsumen utama master ini (combobox + snapshot teks). Ketiadaan kode bukan blocker; akan dilengkapi saat List Fitur final.
- **Master User (A1)** — sumber `created_by`/`updated_by` (audit dasar).

*Catatan SATUSEHAT:* Bila ke depan anjuran perlu dipetakan ke kode (mis. CarePlan/ServiceRequest pada FHIR), mapping ditambahkan terpisah. [PERLU KONFIRMASI kebutuhan interoperabilitas]

## Asumsi
- Revisi v1.7 (keputusan user): Untuk modul ini As-Is = To-Be — tidak ada perubahan proses; PRD mendokumentasikan alur yang sudah berjalan. Section Business Process diselaraskan: As-Is dinyatakan identik dengan To-Be, dan To-Be dirinci serta diverifikasi kelengkapannya (semua gateway bercabang lengkap, operasi ubah/hapus konsisten, tiap langkah tertaut FR/BR, tanpa cabang menggantung). Skenario 'ketik manual' direklasifikasi sebagai baseline historis tanpa fitur (di Background), bukan As-Is modul.
- Modul ini tidak punya BPMN sendiri; alur As-Is/To-Be diturunkan dari analogi proses terkait (g-service-pathology-order 'Load Master Data' & 'Smart Recommendation', pola inline admisi).
- Pengelolaan master dilakukan sepenuhnya inline dari formulir; halaman/menu administrasi terpisah tidak disediakan pada MVP.
- Teks anjuran di-snapshot ke dokumen surat kontrol saat penerbitan sehingga hapus/ubah master tidak mengubah dokumen lama (BR-003/FR-008).
- Hapus = soft delete (status_aktif=nonaktif), bukan hard delete (BR-004).
- Master bersifat global tanpa penyekatan per-unit (BR-002).
- Tidak ada integrasi terminologi eksternal (SATUSEHAT/BPJS) untuk anjuran pada MVP.
- Normalisasi duplikat (final): trim + lowercase + collapse spasi ganda + hapus tanda baca ujung. Sinonim/parafrase/singkatan TIDAK dinormalisasi — diabaikan (keputusan user).
- Audit dasar saja (siapa/kapan terakhir); tanpa riwayat/versioning nilai (keputusan user).
- Batas panjang teks anjuran 255 char adalah final, dikonfirmasi user (NFR-007).
- Kode fitur Formulir Surat Kontrol dikosongkan dulu atas keputusan user; bukan blocker pembangunan modul A30.
- Field kanonik status_aktif & keterangan mengikuti definisi bersama lintas-PRD.
- Volume master ≤10.000 entri untuk konteks RS Tipe C & D (dasar target performa).
- Revisi v1.6: Menutup 4 open question v1.5 berdasarkan keputusan user — (1) kode fitur Surat Kontrol dikosongkan, (2) normalisasi mengabaikan sinonim, (3) batas 255 char final, (4) cukup audit dasar tanpa versioning. Section terkait (Related Feature, BR-001, BR-006, In/Out Scope, NFR-005/007, Data Requirements, Integrasi) diselaraskan.
- Revisi v1.5 (tetap berlaku): Related Feature A11/A12/A10/A3 dihapus dari lingkup PRD ini beserta turunannya.
- Revisi v1.4 (tetap berlaku): BR-006 lama (validasi isi), BR-007 (RBAC), BR-008 (satu anjuran per surat kontrol) dihapus beserta turunannya (FR-009, NFR-006, referensi terkait).

## Pertanyaan Terbuka
- Tidak ada open question aktif untuk MVP. Semua pertanyaan terbuka v1.5 telah ditutup pada v1.6: (1) kode fitur Formulir Surat Kontrol dikosongkan dulu, (2) normalisasi anti-duplikasi mengabaikan sinonim, (3) batas teks 255 char final, (4) cukup audit dasar tanpa versioning.
- Pasca-MVP (bukan blocker): kode fitur Formulir Surat Kontrol perlu dilengkapi saat List Fitur difinalisasi.
- Pasca-MVP (bukan blocker): kebutuhan interoperabilitas SATUSEHAT (CarePlan/ServiceRequest) bila anjuran kelak perlu dipetakan ke kode.