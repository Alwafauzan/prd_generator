# PRD — Master Data / Integrasi SATUSEHAT BPJS V1 V2 — Procedure (ICD-9-CM)

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A13); Modul Pelayanan — Asesmen Medis (konsumen, code fitur dikosongkan dulu); Modul Klaim BPJS/casemix (INA-CBG/IDRG, code fitur dikosongkan dulu); Modul Integrasi SATUSEHAT — Resource Procedure (code fitur dikosongkan dulu); Standar ICD-9-CM (WHO) & ICD-9 IM; Grouper INA-CBG/IDRG (BPJS)
**Versi:** 1.8 - Pengembangan (Modul RBAC dikeluarkan dari PRD ini atas instruksi pengembangan — referensi 'Modul RBAC' pada Related Document, Related Feature, dan Out Scope dihapus. Kontrol akses dasar tetap ada dan mengikuti peran pengguna via NFR-004 & FR-008, tanpa lagi membingkainya sebagai 'sementara sebelum RBAC'. Penomoran & isi section lain dipertahankan)

## 1. Overview / Brief Summary

**Master Data Procedure** adalah modul referensi terpusat (master data) di cluster **Control Panel** Neurovi SIMRS v2 yang mengelola **kode dan deskripsi prosedur/tindakan** berbasis klasifikasi **ICD-9-CM**. Modul ini berfungsi sebagai *single source of truth* untuk seluruh kode prosedur yang dipakai lintas modul.

Fungsi inti modul ini adalah **menyimpan kode ICD-9-CM (WHO) dan ICD-9 IM (Indonesian Modification)** yang nantinya digunakan pada **dokumen klinis (asesmen medis)**, **klaim BPJS/casemix (INA-CBG/IDRG)**, **integrasi SATUSEHAT**, dan **rekam medis/EMR**. Penting dicatat: **proses integrasi** (SATUSEHAT/BPJS) itu sendiri **berada pada code fitur lain**, bukan pada modul master ini — modul ini hanya **menyediakan dan memelihara referensi kodenya** untuk dikonsumsi modul-modul tersebut.

**Phase 1 (cakupan utama PRD ini):**
- Tambah & ubah data procedure melalui menu Master Data Procedure.
- Identitas utama: **kode** dan **deskripsi**, ditandai dengan **kategori** klasifikasi **ICD-9-CM (WHO)** atau **ICD-9 IM (Indonesian Modification)**. **Format kode identik untuk kedua kategori** (tidak ada perbedaan format kode antara WHO dan IM) — keduanya numerik dengan panjang **1–6 digit**.
- Klasifikasi terhadap grouper casemix melalui pilihan **validity**: `IDRG`, `IDRG-INACBG`, `INACBG`, atau `Tidak Ada`. Keempat nilai enum ini **sudah mewakili seluruh kombinasi keberlakuan grouper yang dibutuhkan**.
- **Validasi keunikan** (anti-duplikat) kode procedure.
- **Audit trail** — setiap perubahan **direkam dan disimpan di database** (siapa, kapan, apa). Audit trail **tidak ditampilkan di UI**; hanya tersimpan di basis data untuk keperluan penelusuran/akuntabilitas.
- **Soft delete** — aksi **Hapus** menandai `is_delete = true` di database sehingga procedure **hilang dari list dashboard** namun data **tidak terhapus permanen** dan dapat **dipulihkan**. **Pemulihan hanya dapat dilakukan langsung di database** (mengubah `is_delete = false`) — **tidak ada aksi Pulihkan melalui tampilan/UI**. Soft delete dijalankan langsung **tanpa mekanisme peringatan khusus** terhadap pemakaian di konsumen (aman karena konsumen menyimpan snapshot teks). **Tidak ada konsep status aktif/nonaktif** pada procedure ini.

**Phase 2 (di luar cakupan implementasi PRD ini, didokumentasikan untuk konteks):**
- **Impor & ekspor** data procedure secara massal (initial load, update berkala, migrasi antar instansi).

Data modul ini menjadi rujukan untuk **input tindakan pada asesmen medis**, **Klaim BPJS/casemix (INA-CBG/IDRG)**, **Integrasi SATUSEHAT**, dan **Rekam Medis/EMR**.

## 2. Background

Neurovi SIMRS v2 menargetkan **RS Tipe C & D** yang sebagian besar layanannya bergantung pada skema pembayaran **casemix (INA-CBG, ke depan IDRG)** melalui BPJS Kesehatan. Dalam skema ini, pengkodean tindakan medis dengan **ICD-9-CM dan ICD-9 IM** wajib pada proses grouping dan pengajuan klaim — kode tidak akurat berdampak langsung pada **klaim pending, dispute, atau penolakan**.

**Masalah saat ini (As-Is):**
- Membandingkan master data procedure **versi 1 vs versi 2**: **belum ada inputan kategori ICD-9-CM (WHO) atau ICD-9 IM** pada data procedure, sehingga sumber/varian klasifikasi tiap kode tidak dapat dibedakan.
- **Belum ada inputan klasifikasi terhadap grouper casemix (validity)**, sehingga keberlakuan tiap kode terhadap **INA-CBG/IDRG** tidak tercatat dan menyulitkan masa transisi grouper.
- Tanpa master procedure terpusat dan terstandar, pengkodean dilakukan manual/tersebar → rawan **inkonsistensi** dan **kode tidak valid**.
- Tidak ada penjejakan perubahan data referensi yang dipakai langsung pada klaim → **akuntabilitas rendah** saat terjadi ketidaksesuaian kode di hilir.
- Risiko **duplikasi kode** menimbulkan ambiguitas pada grouping & pelaporan.

**Dasar perancangan:**
1. **Audit trail sejak Phase 1** — karena data bersifat referensial dan dipakai langsung pada klaim, akuntabilitas perubahan menjadi kebutuhan mendasar. Audit trail **disimpan di database** (bukan fitur tampilan UI).
2. **Anti-duplikasi** — menjaga integritas data master.
3. **Transisi INA-CBG → IDRG** — sistem menandai validitas kode terhadap grouper yang berlaku (`IDRG`, `IDRG-INACBG`, `INACBG`, `Tidak Ada`) agar data akurat selama & setelah masa transisi tanpa migrasi ulang. Keempat nilai enum **dianggap final & mewakili seluruh kombinasi** yang dibutuhkan.
4. **Dua varian ICD-9-CM** — versi **WHO** vs **Indonesian Modification (IM)** perlu dibedakan sebagai **kategori/sumber rujukan** untuk kepatuhan & ketepatan pemilihan kode; **format kode keduanya sama** (numerik 1–6 digit).
5. **Soft delete** — data master yang pernah dirujuk transaksi tidak boleh hilang permanen; penghapusan dilakukan dengan menandai `is_delete = true` (procedure hilang dari list, data tetap di database). Soft delete dijalankan **tanpa peringatan khusus** karena konsumen menyimpan snapshot teks (aman secara referensial). **Pemulihan dilakukan langsung di database** (`is_delete = false`), tidak melalui UI.

**Penjadwalan Phase 2:** impor/ekspor (volume kode besar, diperbarui regulator) dijadwalkan setelah struktur & validasi data inti stabil. **Soft delete dimasukkan ke Phase 1** karena data master dapat segera dirujuk transaksi sehingga penghapusan yang aman (tanpa hard delete) dibutuhkan sejak awal.

## 3. In Scope

### Scope Definition (Phase 1 — yang dikerjakan)
- **CRU (Create, Read, Update)** data Master Procedure: tambah & ubah.
- **Soft delete (Hapus)** data procedure melalui flag `is_delete` — **bukan** status aktif/nonaktif, dan **tanpa mekanisme peringatan** saat menghapus. **Pemulihan TIDAK disediakan di UI**; pemulihan hanya dilakukan langsung di database (`is_delete = false`).
- Field inti: `kode`, `deskripsi`, **kategori** (`ICD-9-CM WHO` / `ICD-9 IM`), **validity grouper** (`IDRG` / `IDRG-INACBG` / `INACBG` / `Tidak Ada`), `keterangan`. Field sistem: `is_delete` (penanda soft delete).
- **Validasi keunikan kode** (anti-duplikat) saat tambah/ubah.
- **Validasi field wajib** dengan pesan jelas "[nama field] wajib diisi".
- **Pencarian, filter, dan listing** data procedure (dashboard/list).
- **Audit trail** untuk setiap aktivitas tambah/ubah/hapus — **direkam & disimpan di database saja, tidak ditampilkan di UI**.
- Penyediaan data procedure sebagai **lookup/referensi (read-only)** untuk dikonsumsi modul Asesmen Medis, Klaim BPJS/casemix, Integrasi SATUSEHAT, dan EMR. Modul konsumen menyimpan **teks** kode+deskripsi (snapshot), bukan ID/FK (lihat BR-009).
- **Penandaan kode** pada modul ini **hanya membedakan kategori** **ICD-9-CM (WHO)** dan **ICD-9 IM**. Penandaan ini **tidak berhubungan** dengan terminologi/pemetaan **SATUSEHAT** maupun **BPJS**, dan **tidak mengubah format kode** (format sama untuk WHO maupun IM).

### Out Scope (TIDAK dikerjakan di modul ini)
- **Aksi Pulihkan melalui UI/tampilan** → **tidak disediakan**; pemulihan data ber-`is_delete=true` hanya dilakukan langsung di database.
- **Tampilan detail + riwayat audit trail di UI** → **tidak disediakan**; audit trail hanya disimpan di database.
- **Impor & ekspor massal** data procedure → **Phase 2**.
- **Hard delete** data procedure (tidak akan disediakan; data master tidak dihapus permanen, hanya soft delete via `is_delete`).
- Proses **grouping/klaim casemix** itu sendiri (dimiliki modul Klaim BPJS/casemix) — modul ini hanya menyediakan referensi kode.
- **Pemetaan terminologi & proses integrasi SATUSEHAT/BPJS** — **berada di code fitur lain**, bukan di modul master ini.
- **Pengelolaan tarif** atas procedure — **tidak ada** di modul ini; pengelolaan tarif berada pada **modul Master Data Layanan**.
- Mapping otomatis ICD-9 ↔ ICD-10 (ranah diagnosa) — tidak ada keterkaitan pada modul ini.

> **Catatan kontrol akses:** modul ini **tidak mencakup pengelolaan peran & hak akses (RBAC)** — RBAC **tidak dimasukkan ke dalam PRD ini**. Kontrol akses pada modul ini bersifat **dasar dan mengikuti peran pengguna yang berlaku** (lihat **NFR-004** & **FR-008**), bukan modul RBAC tersendiri.

## 4. Goals and Metrics

### Tujuan
1. Menyediakan **referensi kode prosedur ICD-9-CM yang konsisten & terstandar** sebagai single source of truth.
2. Menjamin **integritas data** melalui validasi anti-duplikat.
3. Menyediakan **akuntabilitas** perubahan data referensi melalui audit trail (tersimpan di database) sejak Phase 1.
4. Mendukung **transisi INA-CBG → IDRG** lewat penandaan validity grouper.
5. Membedakan **kategori ICD-9-CM (WHO) vs ICD-9 IM** pada setiap kode (format kode sama).

### Metrik (terukur)
> Catatan: modul hilir **Order Tindakan dan Billing TIDAK termasuk** konsumen master ini. Konsumen utama kode dari master ini adalah **dokumen klinis (asesmen medis)** beserta Klaim BPJS/casemix, Integrasi SATUSEHAT, dan EMR.

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Konsistensi kode | % pencatatan tindakan pada **dokumen klinis (asesmen medis)** memakai kode dari master ini | 100% |
| Kelengkapan kategori | % kode memiliki **kategori ICD-9-CM (WHO/IM)** terisi | 100% |
| Integritas data | Jumlah kode procedure duplikat di database (aktif/`is_delete=false`) | 0 |
| Akuntabilitas | % aktivitas tambah/ubah/hapus yang terekam audit trail di database | 100% |
| Kesiapan transisi | % kode memiliki nilai validity terisi (bukan kosong) | 100% |
| Efisiensi | Waktu rata-rata menambah 1 data procedure | < 1 menit |

## 5. Related Feature

Fitur ini bagian dari cluster **Control Panel > Master Data / Integrasi SATUSEHAT BPJS V1 V2 > Procedure** (**code A13**).

Kode procedure dari master ini **dipakai untuk pencatatan tindakan pada asesmen medis** (bukan untuk order tindakan). Modul ini **tidak berhubungan dengan**: master diagnosa, master diagnosa perawat, Staff, Unit, maupun Jabatan.

> **Catatan:** Pengelolaan peran & hak akses (**RBAC**) **tidak dimasukkan ke dalam PRD ini** dan tidak dijadikan related feature di sini. Kontrol akses operasi CRU & soft delete pada modul ini bersifat **dasar dan mengikuti peran pengguna** yang berlaku (lihat **NFR-004** & **FR-008**).

**Modul terkait (konsumen kode procedure):**
| Modul | Code Fitur | Relasi |
|-------|-----------|--------|
| **Modul Pelayanan — Asesmen Medis** | (dikosongkan dulu) | **Kode + deskripsi** procedure dipakai untuk **pencatatan/input tindakan** pada dokumen asesmen medis. Menyimpan **teks** kode+deskripsi (snapshot), bukan ID. |
| **Modul Klaim BPJS/casemix (INA-CBG/IDRG)** | (dikosongkan dulu) | Mengonsumsi **kode + deskripsi** procedure beserta `validity` untuk grouping & klaim casemix. Deskripsi diperlukan untuk verifikasi/pembacaan koder, bukan hanya kodenya. Menyimpan **teks**, bukan ID. |
| **Modul Integrasi SATUSEHAT — Resource Procedure** | (dikosongkan dulu) | Mengonsumsi **kode + deskripsi** procedure untuk mapping/kirim resource Procedure ke SATUSEHAT (deskripsi dipakai sebagai `display`/teks resource). **Proses integrasi berada di modul ini, bukan di master.** |

> Master Procedure berperan sebagai **penyedia referensi**; modul-modul konsumen di atas berperan sebagai **konsumen** yang mengambil **kode dan deskripsi** sekaligus. Code fitur konsumen **dikosongkan dulu** dan akan dilengkapi kemudian.

## 6. Business Process (As-Is / To-Be)

> Modul ini **belum punya BPMN sendiri**. Alur diturunkan dengan analogi dari proses master/terminologi (pola master data sejenis). Bagian turunan ditandai [ASUMSI].

### A. As-Is (kondisi saat ini)
1. User dapat melakukan **CRUD** pada menu **Master Data > Procedure**.
2. **Belum ada inputan kategori ICD-9-CM (WHO) atau ICD-9 IM** pada form procedure → varian klasifikasi tiap kode tidak terbedakan.
3. **Tidak ada penanda inputan klasifikasi terhadap grouper casemix (validity)** → keberlakuan kode terhadap INA-CBG/IDRG tidak tercatat.
4. Perubahan data tidak terekam secara terstruktur → sulit menelusuri sumber kesalahan klaim.
5. Risiko duplikasi kode belum dijaga ketat.

### B. To-Be (kondisi diharapkan)
1. Admin Master Data membuka menu **Control Panel > Master Data > Procedure**.
2. Sistem menampilkan **list procedure** (kode, deskripsi, kategori, validity) yang `is_delete=false`, dengan pencarian & filter.
3. Admin klik **Tambah** → isi form (kode numerik 1–6 digit, deskripsi, **kategori ICD-9-CM WHO/IM**, **validity grouper**, keterangan).
4. **Gateway: Kode sudah ada (duplikat)?**
   - **Ya** → sistem menolak simpan + tampilkan pesan, arahkan edit data existing.
   - **Tidak** → **Gateway: Field wajib valid?** Bila ada field wajib kosong/tidak valid → kembali ke form & tampilkan pesan **"[nama field] wajib diisi"**; bila valid → lanjut simpan.
5. Sistem **menyimpan** data, **merekam audit trail ke database** (user, timestamp, before/after) — tanpa tampilan UI khusus.
6. **Gateway: Edit data?** Admin pilih data → ubah field → validasi keunikan & field wajib ulang → simpan → audit trail tercatat di database.
7. Data tersedia sebagai **referensi** untuk **input tindakan pada asesmen medis**, **klaim BPJS/casemix**, **integrasi SATUSEHAT**, dan **EMR**. Konsumen mengambil **kode + deskripsi** dan menyimpan teks (snapshot), bukan ID.
8. **(Phase 1) Soft delete:** Admin dapat **menghapus** procedure dari list → sistem **langsung** set `is_delete = true` (tanpa peringatan khusus) → procedure **hilang dari list dashboard**, data tetap tersimpan → audit trail tercatat di database. **Pemulihan tidak tersedia di UI**; bila perlu, data dipulihkan langsung di database (`is_delete = false`). **Tidak ada status aktif/nonaktif.**
9. *(Phase 2)* Impor/ekspor massal data procedure.

## 7. Main Flow / Mindmap

### Skenario 1 — Tambah Procedure (Phase 1)
```
[Start] Admin buka menu Master Data Procedure
  → Tampil list + tombol Tambah
  → Klik Tambah → Form Procedure
  → Isi: kode (numerik 1-6 digit), deskripsi, kategori (WHO/IM), validity (IDRG/IDRG-INACBG/INACBG/Tidak Ada), keterangan
  → Klik Simpan
  → [Gateway] Kode duplikat?
        Ya  → Tolak + pesan error (mis. "Kode 99.99 sudah ada") → kembali ke form
        Tidak → [Gateway] Validasi field (wajib) lain valid?
              Tidak → kembali ke form & tampilkan pesan "[nama field] wajib diisi" (mis. "Deskripsi wajib diisi")
              Ya → Simpan ke DB → Rekam audit trail ke database → [End] "Procedure berhasil ditambahkan"
```

### Skenario 2 — Ubah Procedure (Phase 1)
```
[Start] Admin cari/pilih procedure dari list
  → Klik Edit → Form terisi data existing
  → Ubah field (kode/deskripsi/kategori/validity/keterangan)
  → Klik Simpan
  → [Gateway] Kode berubah & bentrok dengan kode lain?
        Ya  → Tolak + pesan → kembali ke form
        Tidak → [Gateway] Field wajib valid?
              Tidak → kembali ke form & tampilkan pesan "[nama field] wajib diisi"
              Ya → Simpan → Rekam audit trail (before/after) ke database → [End] "Perubahan tersimpan"
```

### Skenario 3 — Lihat/Cari (Phase 1)
```
[Start] Admin/Koder buka list → Cari by kode/deskripsi → Filter by kategori/validity → Lihat data di list
(Catatan: tidak ada layar detail + audit trail; audit trail hanya tersimpan di database)
```

### Skenario 4 — Hapus (Soft Delete) (Phase 1)
```
Hapus    : Pilih data dari list → klik Hapus → set is_delete = true (langsung, tanpa peringatan khusus) → procedure HILANG dari list dashboard (data tetap tersimpan di DB) → Rekam audit trail ke database → [End]
Pulihkan : TIDAK tersedia melalui tampilan/UI. Pemulihan hanya dilakukan langsung di database dengan mengubah is_delete menjadi false.
(Tidak ada status aktif/nonaktif; Hard delete TIDAK tersedia)
```

### Skenario 5 — Impor & Ekspor (Phase 2) [Out Scope Phase 1]
```
Impor (tombol "Impor" tersendiri):
  Klik tombol Impor → (opsional) unduh template → upload dokumen .csv / .xlsx
  → Validasi data (cek duplikat & format) baris per baris
  → Tampilkan ringkasan (sukses/gagal) → Commit

Ekspor (tombol "Ekspor" tersendiri):
  Klik tombol Ekspor (mengikuti filter aktif) → Generate file (.xlsx / .csv) → Unduh
```

## 8. Business Rules

| ID | Aturan | Sumber/Traceability |
|----|--------|---------------------|
| **BR-001** | Kode procedure **wajib unik** (case-insensitive, trim). Tidak boleh duplikat saat tambah maupun ubah. | To-Be step 4 |
| **BR-002** | `kode` dan `deskripsi` **wajib diisi** sebagai identitas utama. Jika field wajib kosong/tidak valid, sistem menampilkan pesan **"[nama field] wajib diisi"** dan kembali ke form. | Overview; Skenario 1 |
| **BR-003** | Setiap procedure wajib ditandai **kategori**: `ICD-9-CM WHO` **atau** `ICD-9 IM`. Penanda ini hanya membedakan kedua varian sebagai **kategori/sumber rujukan**, **tidak mengubah format kode** (format kode WHO dan IM sama), dan tidak terkait terminologi SATUSEHAT/BPJS. | Background poin 4; In Scope |
| **BR-004** | Setiap procedure wajib memiliki **validity grouper**: `IDRG`, `IDRG-INACBG`, `INACBG`, atau `Tidak Ada`. Tidak boleh kosong. Keempat nilai enum ini **final & sudah mewakili seluruh kombinasi keberlakuan grouper** yang dibutuhkan (tidak ada kombinasi lain / multi-pilih). | Background poin 3; Goals (kesiapan transisi) |
| **BR-005** | Setiap aktivitas **tambah, ubah & hapus (soft delete)** wajib **direkam & disimpan ke audit trail di database** (user, timestamp, data before/after) sejak Phase 1. Audit trail **tidak ditampilkan di UI**. Pemulihan dilakukan langsung di database, di luar pencatatan aplikasi. | Background poin 1 |
| **BR-006** | Data procedure **tidak dapat dihapus permanen**. Aksi **Hapus = soft delete**: sistem mengubah `is_delete = true` sehingga procedure **hilang dari list dashboard** namun data **tetap tersimpan** di database. Soft delete dijalankan **langsung tanpa peringatan/konfirmasi pemakaian** terhadap konsumen (aman karena konsumen menyimpan snapshot teks). **Tidak ada status aktif/nonaktif.** **Pemulihan hanya dapat dilakukan langsung di database** dengan mengubah `is_delete = false` — **tidak ada aksi Pulihkan di UI**. | Background; In Scope; Skenario 4 |
| **BR-007** | `kode` mengikuti format ICD-9-CM: **numerik dengan panjang 1–6 digit** (titik berlaku sebagai pemisah, mis. `99.99`). **Format kode sama untuk WHO maupun IM** — tidak ada perbedaan format antara kedua kategori. | Standar ICD-9-CM; instruksi pengembangan |
| **BR-008** | *(Phase 2)* Impor: baris dengan kode duplikat/format salah ditolak per baris; mode `tambah` menolak kode existing, mode `tambah+update` memperbarui yang ada. | konsisten field `mode_import` |
| **BR-009** | Modul **konsumen** (Asesmen Medis/Klaim/Integrasi SATUSEHAT/EMR) **menyimpan teks** kode+deskripsi procedure (snapshot), **bukan ID/FK** ke master ini. Konsumen mengambil **kode dan deskripsi** sekaligus. Tujuannya: saat procedure di-**soft delete**, data historis yang sudah dipakai **tidak ikut terhapus/terputus referensinya** — sekaligus alasan soft delete tidak memerlukan peringatan. | Instruksi konsistensi; FR-009; BR-006 |

## 9. User Stories

- **US-001** — Sebagai **Admin Master Data**, saya ingin **menambah data procedure (kode & deskripsi)** mengikuti standar ICD-9-CM (kode numerik 1–6 digit), agar tersedia referensi kode tindakan yang terstandar. *(source: To-Be step 3–5)*
- **US-002** — Sebagai **Admin Master Data**, saya ingin **sistem menolak kode procedure duplikat**, agar tidak terjadi ambiguitas pada grouping & pelaporan. *(source: BR-001)*
- **US-003** — Sebagai **Admin Master Data**, saya ingin **mengubah data procedure** yang sudah ada, agar data tetap mutakhir saat regulator memperbarui kode. *(source: To-Be step 6)*
- **US-004** — Sebagai **Admin Master Data**, saya ingin **menandai kategori (ICD-9-CM WHO / ICD-9 IM) dan validity grouper (IDRG/IDRG-INACBG/INACBG/Tidak Ada)** tiap kode, agar varian klasifikasi terbedakan dan data akurat selama & setelah transisi INA-CBG → IDRG. *(source: BR-003, BR-004)*
- **US-005** — Sebagai **Admin Master Data**, saya ingin **mencari & memfilter procedure** by kode/deskripsi/kategori/validity, agar cepat menemukan kode yang tepat. *(source: To-Be step 2; Skenario 3)*
- **US-006** — Sebagai **Supervisor/Auditor**, saya ingin **setiap perubahan procedure terekam & tersimpan di audit trail database** (siapa mengubah apa & kapan), agar dapat ditelusuri di tingkat data saat terjadi ketidaksesuaian klaim. **Audit trail tidak perlu ditampilkan di UI** — cukup tersimpan di database. *(source: BR-005)*
- **US-007** — Sebagai **dokter/petugas (Asesmen Medis/Klaim/Integrasi SATUSEHAT/EMR)**, saya ingin **mengambil referensi kode + deskripsi procedure** dari master ini dan **menyimpan teksnya (snapshot)**, agar konsisten lintas modul dan tetap utuh meski procedure di-soft delete. *(source: Overview; BR-009)*
- **US-008** — Sebagai **Admin Master Data**, saya ingin **menghapus (soft delete) procedure dari list** sehingga ditandai `is_delete=true` tanpa menghilangkan datanya (langsung tanpa peringatan), agar keterhubungan dengan transaksi tetap terjaga. *(Catatan: pemulihan tidak tersedia di UI; bila perlu dipulihkan, dilakukan langsung di database dengan `is_delete=false`.)* *(source: BR-006; Phase 1)*
- **US-009** *(Phase 2)* — Sebagai **Admin Master Data**, saya ingin **impor/ekspor data procedure massal** lewat tombol tersendiri, agar pemuatan awal/pembaruan berkala/migrasi efisien. *(source: Out Scope)*

## 10. Functional Requirements

### Phase 1
| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menyediakan **menu list Procedure** (hanya `is_delete=false`) dengan kolom kode, deskripsi, kategori, validity; mendukung pencarian & filter. **Tidak ada filter/tampilan "Terhapus"** karena pemulihan dilakukan langsung di database (data ber-`is_delete=true` tidak diakses melalui UI). | US-005, To-Be 2 |
| **FR-002** | Sistem menyediakan **form Tambah Procedure** dengan field kode (numerik 1–6 digit), deskripsi, kategori (ICD-9-CM WHO/IM), validity, keterangan. | US-001, US-004 |
| **FR-003** | Sistem **memvalidasi keunikan kode** (case-insensitive) saat simpan tambah/ubah; menolak & menampilkan pesan jika duplikat. | US-002, BR-001 |
| **FR-004** | Sistem **memvalidasi field wajib** (kode, deskripsi, kategori, validity) sebelum simpan; jika ada field wajib kosong/tidak valid (non-duplikat), kembali ke form **dan menampilkan pesan "[nama field] wajib diisi"** untuk tiap field bermasalah. | BR-002, BR-003, BR-004; Skenario 1 |
| **FR-005** | Sistem menyediakan **form Edit Procedure** terisi data existing dan menyimpan perubahan dengan validasi keunikan & field wajib ulang. | US-003 |
| **FR-006** | Sistem **merekam & menyimpan audit trail ke database** (user, timestamp, aksi, data before/after) pada setiap tambah/ubah/hapus. | US-006, BR-005 |
| **FR-007** | Audit trail procedure **disimpan di database saja dan TIDAK ditampilkan di UI** — **tidak ada layar detail + riwayat audit**. Data audit dapat diakses langsung melalui basis data untuk keperluan penelusuran/akuntabilitas. | US-006, BR-005 |
| **FR-008** | Sistem **dapat** menerapkan kontrol akses dasar atas operasi CRU & soft delete **mengikuti peran pengguna** yang berlaku. **Pengelolaan peran & hak akses (RBAC) tidak termasuk dalam PRD ini.** | [ASUMSI]; NFR-004 |
| **FR-009** | Sistem menyediakan **referensi/lookup procedure (read-only)** untuk dikonsumsi modul **Asesmen Medis, Klaim BPJS/casemix, Integrasi SATUSEHAT, dan EMR**, mengembalikan **kode + deskripsi** (beserta validity bila diperlukan). Konsumen menyimpan **teks** kode+deskripsi (snapshot), **bukan ID/FK** (BR-009). | US-007, BR-009 |
| **FR-010** | Sistem menyediakan **Hapus (soft delete)** data procedure via flag `is_delete`; soft delete dijalankan **langsung tanpa peringatan**; data **tidak dihapus permanen** dan **tidak ada status aktif/nonaktif**. **Aksi Pulihkan TIDAK disediakan di UI** — pemulihan hanya dilakukan langsung di database (`is_delete = false`). | US-008, BR-006 |

> **Catatan:** modul ini **tidak** menyimpan pemetaan terminologi SATUSEHAT/BPJS dan **tidak** menjalankan proses integrasi — pemetaan & integrasi berada pada **code fitur lain**. Modul ini hanya menyediakan kode + deskripsi ICD-9-CM/ICD-9 IM yang dikonsumsi modul integrasi tersebut.

### Phase 2 (didokumentasikan, di luar implementasi)
| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-011** | Sistem menyediakan **impor massal** lewat **tombol Impor tersendiri**: upload dokumen .csv/.xlsx → validasi data per baris → tampilkan ringkasan (sukses/gagal) → commit. | US-009, BR-008 |
| **FR-012** | Sistem menyediakan **ekspor data** lewat **tombol Ekspor tersendiri**: generate file (.xlsx/.csv) sesuai filter lalu unduh. | US-009 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Tambah/Edit Procedure (FR-002, FR-005)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `procedure_id` | ID Internal | text | Ya (auto) | UUID/auto-increment | auto-generate | tidak tampil/dikunci; **tidak** dipakai sebagai FK oleh konsumen (BR-009) |
| `kode` | Kode Procedure | text | Ya | **unik** (case-insensitive); numerik dengan titik sebagai pemisah; **panjang 1–6 digit**, mis. `99.99`; **format sama untuk WHO maupun IM**. Pesan bila kosong: "Kode wajib diisi" | manual | BR-001, BR-007 |
| `deskripsi` | Deskripsi Procedure | text | Ya | **maks 255 char**. Pesan bila kosong: "Deskripsi wajib diisi" | manual | BR-002; **deskripsi ditulis dalam Bahasa Inggris sesuai standar ICD-9-CM** (NFR-005); dikonsumsi modul Klaim & Integrasi bersama kode |
| `kategori` | Kategori | dropdown | Ya | enum: `ICD-9-CM WHO` / `ICD-9 IM`. Pesan bila kosong: "Kategori wajib diisi" | enum | BR-003; hanya pembeda kategori (bukan format kode, bukan terminologi SATUSEHAT/BPJS) |
| `validity` | Validity Grouper | dropdown | Ya | enum: `IDRG` / `IDRG-INACBG` / `INACBG` / `Tidak Ada` (enum final, mewakili seluruh kombinasi). Pesan bila kosong: "Validity wajib diisi" | enum | BR-004 |
| `keterangan` | Keterangan | text | Tidak | **maks 255 char** | manual | field kanonik `keterangan` |

> **Field sistem (tidak diinput manual):**
> - `is_delete` (boolean, default `false`) — penanda **soft delete**; di-set `true` saat aksi **Hapus** (langsung, tanpa peringatan) sehingga procedure hilang dari list. **Pemulihan** (di-set `false`) **hanya dilakukan langsung di database**, tidak melalui UI. **Tidak ada field status aktif/nonaktif.**
> - Field pemetaan terminologi SATUSEHAT (`satusehat_code`, `satusehat_system`) **tidak ada** pada modul ini — pemetaan tersebut ditangani **modul Integrasi SATUSEHAT (code fitur lain)**.

### B. Layar INPUT — Impor Massal (FR-011, Phase 2)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `file_import` | File Procedure | file | Ya | `.csv`/`.xlsx`, sesuai template | manual upload (tombol Impor) | field kanonik `file_import` |
| `mode_import` | Mode | dropdown | Ya | enum: `tambah` / `tambah+update` | enum | field kanonik `mode_import` |

### C. Layar TAMPIL — List / Dashboard Procedure (FR-001)
> Default list **hanya** menampilkan data `is_delete=false`. **Tidak ada filter/tampilan "Terhapus"** — data terhapus tidak dapat diakses atau dipulihkan melalui UI (pemulihan hanya via database). **Label antarmuka/tombol berbahasa Indonesia, namun konten data (kode & deskripsi procedure) berbahasa Inggris** sesuai standar ICD-9-CM (NFR-005).

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Procedure | count master_procedure where is_delete=false | angka besar (kartu) | – | ringkasan |
| Kode | master_procedure.kode | text monospace | sort A→Z; filter (search) | numerik 1–6 digit |
| Deskripsi | master_procedure.deskripsi | text | sort; filter (search) | **Bahasa Inggris (ICD-9-CM)** — NFR-005 |
| Kategori | master_procedure.kategori | badge (WHO/IM) | filter | |
| Validity | master_procedure.validity | badge (IDRG/IDRG-INACBG/INACBG/Tidak Ada) | filter | warna beda per nilai |
| Aksi | – | tombol (Edit/Hapus) | – | Hapus = soft delete (langsung); **tidak ada tombol Detail dan tidak ada tombol Pulihkan** |

> **Catatan:** **tidak ada layar Detail + Audit Trail** (lihat FR-007) dan **tidak ada aksi Pulihkan di UI** (lihat FR-010). Audit trail tersimpan di database dan tidak dirender di UI.

### D. Penyimpanan Audit Trail (database only — TIDAK ditampilkan di UI) (FR-006, FR-007)
> Tabel `audit_trail` **direkam ke database** untuk setiap aksi tambah/ubah/hapus, namun **tidak memiliki layar tampilan**. Struktur data disertakan agar dev menyiapkan skema penyimpanan, bukan untuk dirender. Pemulihan (`is_delete=false`) dilakukan langsung di database, di luar pencatatan aplikasi.

| Kolom (DB) | Sumber Data | Tipe/Format | Catatan |
|------------|-------------|-------------|---------|
| `timestamp` | sistem (waktu aksi) | datetime | append-only |
| `action` | aksi (Tambah/Ubah/Hapus) | enum | termasuk perubahan `is_delete` saat Hapus |
| `user` | akun/sesi login pelaku aksi | text | identitas dari sesi login; modul ini tidak terhubung ke master Staff |
| `before` / `after` | snapshot nilai field sebelum & sesudah | JSON | diff field per field (termasuk `is_delete`) |
> Append-only, tidak dapat diubah/dihapus pengguna (NFR-003). Diakses langsung melalui basis data, bukan melalui antarmuka aplikasi.

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| **NFR-001** | Performa | List & pencarian procedure tampil **< 2 detik** untuk dataset besar (puluhan ribu kode ICD-9). Gunakan indeks pada `kode` & `deskripsi`, serta filter `is_delete`. |
| **NFR-002** | Integritas | Constraint **unik** pada `kode` di level database (bukan hanya validasi aplikasi). BR-001 |
| **NFR-003** | Auditability | Audit trail bersifat **append-only**, **disimpan di database**, tidak ditampilkan di UI, dan tidak dapat diubah/dihapus oleh pengguna. BR-005, FR-007 |
| **NFR-004** | Keamanan | Akses CRU & soft delete **mengikuti peran pengguna** yang berlaku (kontrol akses dasar). **Pengelolaan peran & hak akses (RBAC) tidak termasuk dalam PRD ini.** FR-008 |
| **NFR-005** | Usability | **Label antarmuka, tombol, dan pesan validasi berbahasa Indonesia** (mis. duplikat "Kode 99.99 sudah ada"; field wajib "Deskripsi wajib diisi"). Namun **konten deskripsi procedure ditampilkan dalam Bahasa Inggris** mengikuti standar **ICD-9-CM dan ICD-9 IM** (deskripsi tindakan sesuai sumber WHO/IM). BR-002, FR-004 |
| **NFR-006** | Kompatibilitas | Konsisten dengan pola modul master data sejenis untuk komponen form/import/audit. |
| **NFR-007** | Skalabilitas data | Mendukung pembaruan berkala volume besar oleh regulator tanpa migrasi ulang (lihat validity). |
| **NFR-008** | Integritas referensial | Karena konsumen menyimpan **teks** kode+deskripsi (snapshot) bukan ID/FK, **soft delete tidak memutus** data historis yang sudah dipakai sehingga aman dijalankan tanpa peringatan. BR-009, BR-006 |

> Catatan revisi: **NFR Ketersediaan/Offline dihapus** atas instruksi pengembangan (modul master procedure tidak mensyaratkan mode offline khusus); NFR di-renumber agar rapi tanpa gap. **Modul RBAC tidak termasuk dalam PRD ini** — NFR-004 hanya mengatur kontrol akses dasar berbasis peran pengguna, bukan pengelolaan RBAC.

## 13. Integrasi Eksternal

> Modul ini bersifat **master/referensi murni**. **Proses integrasi SATUSEHAT dan BPJS berada pada code fitur lain**, bukan di modul ini. Modul master Procedure hanya **menyimpan & menyediakan kode + deskripsi ICD-9-CM (WHO) / ICD-9 IM** yang dikonsumsi modul-modul tersebut.

| Sistem/Modul | Tujuan | Arah | Catatan |
|--------------|--------|------|---------|
| **Modul Integrasi SATUSEHAT — Resource Procedure** | Mengambil **kode + deskripsi** procedure untuk dipetakan/dikirim sebagai resource Procedure ke SATUSEHAT (deskripsi sebagai `display`/teks). | Master (penyedia) → modul integrasi (konsumen) | Proses mapping & call SATUSEHAT **bukan** tanggung jawab modul master ini. Menyimpan **teks** procedure, bukan ID. |
| **Modul Klaim BPJS/casemix (INA-CBG/IDRG)** | Mengambil **kode + deskripsi** procedure beserta `validity` untuk grouping & klaim. | Master → modul klaim | Tidak ada call VClaim langsung dari master ini. Deskripsi dipakai untuk verifikasi/pembacaan koder. Menyimpan **teks**, bukan ID. |
| **Modul Pelayanan — Asesmen Medis** | Mengambil **kode + deskripsi** procedure untuk **pencatatan tindakan** pada dokumen asesmen medis. | Master → asesmen medis | FR-009. Konsumen utama. Menyimpan **teks**, bukan ID. |
| **Rekam Medis/EMR** | Menampilkan/menyimpan kode + deskripsi procedure pada dokumen RME. | Master → EMR | FR-009. Menyimpan **teks**, bukan ID. |

**Catatan penyimpanan referensi (penting untuk dev konsumen):** modul konsumen **wajib menyimpan teks** (kode + deskripsi) procedure sebagai **snapshot**, **bukan ID/FK** ke master ini. Dengan demikian, ketika procedure di-**soft delete** (`is_delete=true`), data yang sudah dipakai di transaksi/dokumen **tetap utuh dan tidak ikut terhapus** — inilah yang membuat soft delete **aman dijalankan tanpa peringatan** (BR-009, NFR-008).

**Catatan Interoperabilitas:** karena penandaan kode pada modul ini **hanya** membedakan kategori ICD-9-CM (WHO) vs ICD-9 IM (dengan **format kode yang sama** untuk keduanya), **tidak ada** field pemetaan terminologi SATUSEHAT/BPJS pada master ini. Pemetaan terminologi & seluruh proses integrasi ditangani modul integrasi terkait (code fitur lain, dikosongkan dulu).