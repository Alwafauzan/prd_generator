# PRD — Master Data / Integrasi SATUSEHAT BPJS V1 V2 — Procedure (ICD-9-CM)

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional, code A13); Modul Pelayanan — Asesmen Medis (konsumen, code fitur dikosongkan dulu); Modul Klaim BPJS/casemix (INA-CBG/IDRG, code fitur dikosongkan dulu); Modul Integrasi SATUSEHAT — Resource Procedure (code fitur dikosongkan dulu); Standar ICD-9-CM (WHO) & ICD-9 IM; Grouper INA-CBG/IDRG (BPJS)
**Versi:** 3.1 - Pengembangan (Penegasan kontrol aksi pada TAMPILAN DETAIL: layar Detail (read-only) TIDAK menyediakan ikon/tombol Hapus — selain sebelumnya juga tidak ada ikon/tombol Edit. Satu-satunya kontrol pada layar Detail adalah Tutup/Kembali. Aksi Hapus (soft delete) hanya tersedia melalui ikon Hapus pada baris LIST. Penyesuaian pada Overview, In Scope (Out Scope), Business Process (To-Be 6), Main Flow (Skenario 3), Business Rules (BR-010), User Stories (US-010), Functional Requirements (FR-013), Data Requirements (section D), dan NFR-009. Asumsi terkait dikonfirmasi. Struktur read-only Tampilan Detail (field sama persis dengan form input, tanpa field sistem, tanpa audit trail) & penomoran/isi section lain dipertahankan. Riwayat v3.0: penghapusan jalur Edit dari layar Detail; satu titik masuk Form Edit melalui ikon Edit pada baris list)

## 1. Overview / Brief Summary

**Master Data Procedure** adalah modul referensi terpusat (master data) di cluster **Control Panel** Neurovi SIMRS v2 yang mengelola **kode dan deskripsi prosedur/tindakan** berbasis klasifikasi **ICD-9-CM**. Modul ini berfungsi sebagai *single source of truth* untuk seluruh kode prosedur yang dipakai lintas modul.

Fungsi inti modul ini adalah **menyimpan kode ICD-9-CM (WHO) dan ICD-9 IM (Indonesian Modification)** yang nantinya digunakan pada **dokumen klinis (asesmen medis)**, **klaim BPJS/casemix (INA-CBG/IDRG)**, **integrasi SATUSEHAT**, dan **rekam medis/EMR**. Penting dicatat: **proses integrasi** (SATUSEHAT/BPJS) itu sendiri **berada pada code fitur lain**, bukan pada modul master ini — modul ini hanya **menyediakan dan memelihara referensi kodenya** untuk dikonsumsi modul-modul tersebut.

**Phase 1 (cakupan utama PRD ini):**
- Tambah & ubah data procedure melalui menu Master Data Procedure.
- **List/Dashboard procedure** menampilkan data `is_delete=false` dengan tiga **ikon aksi per baris**: **Detail**, **Edit**, dan **Hapus**.
- **Tampilan detail (read-only)** — menampilkan kembali data procedure yang **sudah diinput** dalam bentuk **read-only**. Field yang ditampilkan **identik persis dengan field pada form input** — yaitu **kode, deskripsi, kategori, validity, dan keterangan** — dan **TIDAK menampilkan field sistem apa pun** (mis. `procedure_id`/ID internal dan `is_delete` tidak ditampilkan). Data **tidak dapat diedit dari layar detail**. **Pada layar detail TIDAK ada ikon/tombol Edit MAUPUN ikon/tombol Hapus** — satu-satunya kontrol yang tersedia adalah **Tutup/Kembali**. Untuk mengubah data, pengguna **kembali ke list** dan menekan **ikon Edit pada baris** procedure terkait (FR-005); untuk menghapus (soft delete), pengguna **kembali ke list** dan menekan **ikon Hapus pada baris** procedure terkait (FR-010). Tampilan detail **hanya menampilkan detail field** dan **tidak menampilkan riwayat audit trail**.
- Identitas utama: **kode** dan **deskripsi**, ditandai dengan **kategori** klasifikasi **ICD-9-CM (WHO)** atau **ICD-9 IM (Indonesian Modification)**. **Format kode identik untuk kedua kategori** (tidak ada perbedaan format kode antara WHO dan IM) — keduanya numerik dengan panjang **1–6 digit**.
- Klasifikasi terhadap grouper casemix melalui pilihan **validity**: `IDRG`, `IDRG-INACBG`, `INACBG`, atau `Tidak Ada`. Keempat nilai enum ini **sudah mewakili seluruh kombinasi keberlakuan grouper yang dibutuhkan**.
- **Validasi keunikan** (anti-duplikat) kode procedure.
- **Audit trail** — setiap perubahan **direkam dan disimpan di database** (siapa, kapan, apa). Audit trail **tidak ditampilkan di UI** (termasuk **tidak ditampilkan pada tampilan detail**); hanya tersimpan di basis data untuk keperluan penelusuran/akuntabilitas.
- **Soft delete** — aksi **Hapus** (hanya tersedia melalui **ikon Hapus pada baris list**) menandai `is_delete = true` di database sehingga procedure **hilang dari list dashboard** namun data **tidak terhapus permanen** dan dapat **dipulihkan**. **Pemulihan hanya dapat dilakukan langsung di database** (mengubah `is_delete = false`) — **tidak ada aksi Pulihkan melalui tampilan/UI**. Soft delete dijalankan langsung **tanpa mekanisme peringatan khusus** terhadap pemakaian di modul lain, hanya **menampilkan modal konfirmasi**. **Tidak ada konsep status aktif/nonaktif** pada procedure ini.

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
- Belum ada cara **memeriksa data lengkap sebuah procedure secara aman** tanpa membuka form edit yang berisiko mengubah data secara tidak sengaja.

**Dasar perancangan:**
1. **Audit trail sejak Phase 1** — karena data bersifat referensial dan dipakai langsung pada klaim, akuntabilitas perubahan menjadi kebutuhan mendasar. Audit trail **disimpan di database** (bukan fitur tampilan UI).
2. **Anti-duplikasi** — menjaga integritas data master.
3. **Transisi INA-CBG → IDRG** — sistem menandai validitas kode terhadap grouper yang berlaku (`IDRG`, `IDRG-INACBG`, `INACBG`, `Tidak Ada`) agar data akurat selama & setelah masa transisi tanpa migrasi ulang. Keempat nilai enum **dianggap final & mewakili seluruh kombinasi** yang dibutuhkan.
4. **Dua varian ICD-9-CM** — versi **WHO** vs **Indonesian Modification (IM)** perlu dibedakan sebagai **kategori/sumber rujukan** untuk kepatuhan & ketepatan pemilihan kode; **format kode keduanya sama** (numerik 1–6 digit).
5. **Soft delete** — data master yang pernah dirujuk transaksi tidak boleh hilang permanen; penghapusan dilakukan dengan menandai `is_delete = true` (procedure hilang dari list, data tetap di database). Soft delete dijalankan **tanpa peringatan khusus** karena konsumen menyimpan snapshot teks dan id. **Pemulihan dilakukan langsung di database** (`is_delete = false`), tidak melalui UI.
6. **Tampilan detail read-only** — menyediakan cara **melihat seluruh data procedure yang sudah diinput** tanpa membuka form edit, sehingga pemeriksaan data lebih aman (tidak berisiko mengubah data secara tidak sengaja). Tampilan ini **murni read-only** dan menampilkan **field yang sama persis dengan form input** (tanpa field sistem). **Pemisahan tegas peran aksi**: meninjau data (Detail) dipisahkan dari mengubah data (Edit) maupun menghapus data (Hapus) — layar Detail **tidak memiliki ikon/tombol Edit maupun ikon/tombol Hapus** sehingga benar-benar bebas risiko mengubah/menghapus data; perubahan dilakukan melalui **ikon Edit pada baris list** dan penghapusan melalui **ikon Hapus pada baris list**. Riwayat audit trail **tidak ditampilkan** di layar detail.

**Penjadwalan Phase 2:** impor/ekspor (volume kode besar, diperbarui regulator) dijadwalkan setelah struktur & validasi data inti stabil. **Soft delete & tampilan detail dimasukkan ke Phase 1** karena data master dapat segera dirujuk transaksi sehingga penghapusan yang aman dan peninjauan data yang aman dibutuhkan sejak awal.

## 3. In Scope

### Scope Definition (Phase 1 — yang dikerjakan)
- **CRU (Create, Read, Update)** data Master Procedure: tambah & ubah.
- **List/Dashboard procedure** dengan **tiga ikon aksi per baris**: **Detail** (buka tampilan read-only), **Edit** (buka Form Edit), dan **Hapus** (soft delete). **Ketiga aksi tersebut menjadi titik masuk tunggal masing-masing** — termasuk **Hapus hanya melalui ikon Hapus pada baris list**.
- **Tampilan Detail (read-only)** data procedure — menampilkan **field yang sama persis dengan form input** (kode, deskripsi, kategori, validity, keterangan) **tanpa field sistem** (`procedure_id`/ID internal & `is_delete` **tidak ditampilkan**) dan **tanpa bisa diedit**. **Pada layar Detail TIDAK ada ikon/tombol Edit MAUPUN ikon/tombol Hapus** — kontrol yang tersedia hanya **Tutup/Kembali**. Untuk mengubah data, pengguna **kembali ke list** lalu menekan **ikon Edit pada baris** procedure terkait (FR-005); untuk menghapus (soft delete), pengguna **kembali ke list** lalu menekan **ikon Hapus pada baris** procedure terkait (FR-010). Tampilan detail **tidak menampilkan riwayat audit trail** — hanya detail field saja.
- **Soft delete (Hapus)** data procedure melalui flag `is_delete` — **bukan** status aktif/nonaktif, dan **tanpa mekanisme peringatan khusus** hanya saja **menampilkan modal konfirmasi** saat menghapus. **Aksi Hapus hanya tersedia melalui ikon Hapus pada baris list**, **tidak tersedia pada Tampilan Detail**. **Pemulihan TIDAK disediakan di UI**; pemulihan hanya dilakukan langsung di database (`is_delete = false`).
- Field inti: `kode`, `deskripsi`, **kategori** (`ICD-9-CM WHO` / `ICD-9 IM`), **validity grouper** (`IDRG` / `IDRG-INACBG` / `INACBG` / `Tidak Ada`), `keterangan`. Field sistem: `is_delete` (penanda soft delete).
- **Validasi keunikan kode** (anti-duplikat) saat tambah/ubah.
- **Validasi field wajib** dengan pesan jelas "[nama field] wajib diisi".
- **Pencarian, filter, dan listing** data procedure (dashboard/list).
- **Audit trail** untuk setiap aktivitas tambah/ubah/hapus — **direkam & disimpan di database saja, tidak ditampilkan di UI** (termasuk tidak pada tampilan detail).
- Penyediaan data procedure sebagai **lookup/referensi (read-only)** untuk dikonsumsi modul Asesmen Medis, Klaim BPJS/casemix, Integrasi SATUSEHAT, dan EMR. Modul konsumen menyimpan **teks** kode+deskripsi (snapshot) beserta ID (lihat BR-009).
- **Penandaan kode** pada modul ini **hanya membedakan kategori** **ICD-9-CM (WHO)** dan **ICD-9 IM**. Penandaan ini **tidak berhubungan** dengan terminologi/pemetaan **SATUSEHAT** maupun **BPJS**, dan **tidak mengubah format kode** (format sama untuk WHO maupun IM).

### Out Scope (TIDAK dikerjakan di modul ini)
- **Ikon/tombol Edit pada layar Detail** → **tidak disediakan**; jalur edit hanya melalui ikon Edit pada baris list. Layar detail hanya menyediakan **Tutup/Kembali**.
- **Ikon/tombol Hapus pada layar Detail** → **tidak disediakan**; jalur hapus (soft delete) hanya melalui **ikon Hapus pada baris list**. Layar detail hanya menyediakan **Tutup/Kembali**.
- **Aksi Pulihkan melalui UI/tampilan** → **tidak disediakan**; pemulihan data ber-`is_delete=true` hanya dilakukan langsung di database.
- **Riwayat audit trail di UI** → **tidak disediakan**; audit trail hanya disimpan di database dan **tidak ditampilkan di mana pun pada UI, termasuk pada Tampilan Detail**. *(Catatan: **Tampilan Detail read-only kini disediakan di Phase 1**, namun **tanpa** riwayat audit trail — hanya menampilkan field yang sudah diinput.)*
- **Pengeditan data dari layar Detail** → **tidak disediakan**; layar detail bersifat read-only dan tidak memiliki kontrol edit, perubahan hanya melalui ikon Edit di list.
- **Penghapusan data dari layar Detail** → **tidak disediakan**; layar detail bersifat read-only dan tidak memiliki kontrol hapus, penghapusan (soft delete) hanya melalui ikon Hapus di list.
- **Menampilkan field sistem pada layar Detail** (mis. `procedure_id`, `is_delete`) → **tidak disediakan**; detail hanya menampilkan field yang sama dengan form input.
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
6. Menyediakan **peninjauan data yang aman** melalui tampilan detail read-only (lihat tanpa risiko mengubah/menghapus), dengan **pemisahan tegas** antara aksi meninjau (Detail), mengubah (Edit), dan menghapus (Hapus).

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
| Keamanan peninjauan | Tampilan detail bersifat read-only (0 jalur edit & 0 jalur hapus dari layar detail; 0 ikon Edit & 0 ikon Hapus di layar detail) | 100% read-only |
| Konsistensi tampilan | Field yang ditampilkan di Detail = field form input (0 field sistem bocor ke UI Detail) | 100% |

## 5. Related Feature

Fitur ini bagian dari cluster **Control Panel > Master Data / Integrasi SATUSEHAT BPJS V1 V2 > Procedure** (**code A13**).

Kode procedure dari master ini **dipakai untuk pencatatan tindakan pada asesmen medis** (bukan untuk order tindakan). Modul ini **tidak berhubungan dengan**: master diagnosa, master diagnosa perawat, Staff, Unit, maupun Jabatan.

> **Catatan:** Pengelolaan peran & hak akses (**RBAC**) **tidak dimasukkan ke dalam PRD ini** dan tidak dijadikan related feature di sini. Kontrol akses operasi CRU & soft delete pada modul ini bersifat **dasar dan mengikuti peran pengguna** yang berlaku (lihat **NFR-004** & **FR-008**).

**Modul terkait (konsumen kode procedure):**
| Modul | Code Fitur | Relasi |
|-------|-----------|--------|
| **Modul Pelayanan — Asesmen Medis** | (dikosongkan dulu) | **ID + Kode + deskripsi** procedure dipakai untuk **pencatatan/input tindakan** pada dokumen asesmen medis. Menyimpan **teks** kode + deskripsi + dan ID. |
| **Modul Klaim BPJS/casemix (INA-CBG/IDRG)** | (dikosongkan dulu) | Mengonsumsi **ID + kode + deskripsi** procedure beserta `validity` untuk grouping & klaim casemix. Deskripsi diperlukan untuk verifikasi/pembacaan koder, bukan hanya kodenya. Menyimpan **teks dan ID**. |
| **Modul Integrasi SATUSEHAT — Resource Procedure** | (dikosongkan dulu) | Mengonsumsi **ID + kode + deskripsi** procedure untuk mapping/kirim resource Procedure ke SATUSEHAT (deskripsi dipakai sebagai `display`/teks resource). **Proses integrasi berada di modul ini, bukan di master.** |

> Master Procedure berperan sebagai **penyedia referensi**; modul-modul konsumen di atas berperan sebagai **konsumen** yang mengambil **kode dan deskripsi** sekaligus. Code fitur konsumen **dikosongkan dulu** dan akan dilengkapi kemudian.

## 6. Business Process (As-Is / To-Be)

> Modul ini **belum punya BPMN sendiri**. Alur diturunkan dengan analogi dari proses master/terminologi (pola master data sejenis). Bagian turunan ditandai [ASUMSI].

### A. As-Is (kondisi saat ini)
1. User dapat melakukan **CRUD** pada menu **Master Data > Procedure**.
2. **Belum ada inputan kategori ICD-9-CM (WHO) atau ICD-9 IM** pada form procedure → varian klasifikasi tiap kode tidak terbedakan.
3. **Tidak ada penanda inputan klasifikasi terhadap grouper casemix (validity)** → keberlakuan kode terhadap INA-CBG/IDRG tidak tercatat.
4. Perubahan data tidak terekam secara terstruktur → sulit menelusuri sumber kesalahan klaim.
5. Risiko duplikasi kode belum dijaga ketat.
6. Belum ada tampilan **detail read-only** → untuk memeriksa data lengkap, user membuka form yang berisiko mengubah data.

### B. To-Be (kondisi diharapkan)
1. Admin Master Data membuka menu **Control Panel > Master Data > Procedure**.
2. Sistem menampilkan **list procedure** (kode, deskripsi, kategori, validity) yang `is_delete=false`, dengan pencarian & filter, serta **tiga ikon aksi per baris**: **Detail**, **Edit**, **Hapus**.
3. Admin klik **Tambah** → isi form (kode numerik 1–6 digit, deskripsi, **kategori ICD-9-CM WHO/IM**, **validity grouper**, keterangan).
4. **Gateway: Kode sudah ada (duplikat)?**
   - **Ya** → sistem menolak simpan + tampilkan pesan, arahkan edit data existing.
   - **Tidak** → **Gateway: Field wajib valid?** Bila ada field wajib kosong/tidak valid → kembali ke form & tampilkan pesan **"[nama field] wajib diisi"**; bila valid → lanjut simpan.
5. Sistem **menyimpan** data, **merekam audit trail ke database** (user, timestamp, before/after) — tanpa tampilan UI khusus.
6. **Gateway: Lihat detail?** Admin/Koder klik **ikon Detail** pada baris list → buka **Tampilan Detail (read-only)** yang menampilkan **field yang sama persis dengan form input** (kode, deskripsi, kategori, validity, keterangan) **tanpa field sistem**. **Tidak ada aksi simpan/ubah/hapus dan TIDAK ada ikon/tombol Edit maupun ikon/tombol Hapus** pada layar ini; satu-satunya kontrol adalah **Tutup/Kembali**. Tampilan detail **tidak menampilkan audit trail**. Bila Admin ingin mengubah data, ia **kembali ke list** lalu menekan **ikon Edit** pada baris terkait; bila ingin menghapus, ia **kembali ke list** lalu menekan **ikon Hapus** pada baris terkait.
7. **Gateway: Edit data?** Admin menekan **ikon Edit pada baris list** (satu-satunya titik masuk Form Edit) → Form Edit terisi data existing → ubah field → validasi keunikan & field wajib ulang → simpan → audit trail tercatat di database.
8. Data tersedia sebagai **referensi** untuk **input tindakan pada asesmen medis**, **klaim BPJS/casemix**, **integrasi SATUSEHAT**, dan **EMR**. Konsumen mengambil **kode + deskripsi** (beserta ID) dan menyimpan teks (snapshot).
9. **(Phase 1) Soft delete:** Admin klik **ikon Hapus** pada baris list (satu-satunya titik masuk aksi Hapus) → sistem menampilkan **modal konfirmasi** → bila dikonfirmasi, **langsung** set `is_delete = true` (tanpa peringatan pemakaian di modul lain) → procedure **hilang dari list dashboard**, data tetap tersimpan → audit trail tercatat di database. **Pemulihan tidak tersedia di UI**; bila perlu, data dipulihkan langsung di database (`is_delete = false`). **Tidak ada status aktif/nonaktif.**
10. *(Phase 2)* Impor/ekspor massal data procedure.

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
[Start] Admin menekan IKON EDIT pada baris list (SATU-SATUNYA titik masuk Form Edit)
        (Catatan: layar Tampilan Detail TIDAK memiliki ikon/tombol Edit)
  → Form Edit terisi data existing
  → Ubah field (kode/deskripsi/kategori/validity/keterangan)
  → Klik Simpan
  → [Gateway] Kode berubah & bentrok dengan kode lain?
        Ya  → Tolak + pesan → kembali ke form
        Tidak → [Gateway] Field wajib valid?
              Tidak → kembali ke form & tampilkan pesan "[nama field] wajib diisi"
              Ya → Simpan → Rekam audit trail (before/after) ke database → [End] "Perubahan tersimpan"
```

### Skenario 3 — Lihat/Cari & Tampilan Detail (read-only) (Phase 1)
```
[Start] Admin buka list → Cari by kode/deskripsi → Filter by kategori/validity → Lihat data di list
  → (opsional) Klik IKON DETAIL pada salah satu baris
        → Tampilan Detail (read-only) menampilkan FIELD YANG SAMA PERSIS dengan form input:
          kode, deskripsi, kategori, validity, keterangan
          (TANPA field sistem: procedure_id & is_delete TIDAK ditampilkan)
        → Semua field bersifat read-only (tidak bisa diedit di layar ini)
        → Kontrol yang tersedia HANYA: Tutup/Kembali
          (TIDAK ada ikon/tombol Edit DAN TIDAK ada ikon/tombol Hapus di layar detail)
        → [Gateway] Mau mengubah data?
              Ya  → Tutup/Kembali ke list → klik IKON EDIT pada baris terkait → Form Edit (Skenario 2)
              Tidak → lanjut
        → [Gateway] Mau menghapus data?
              Ya  → Tutup/Kembali ke list → klik IKON HAPUS pada baris terkait → Soft delete (Skenario 4)
              Tidak → Tutup/Kembali ke list
(Catatan: Tampilan Detail TIDAK menampilkan riwayat audit trail; audit trail hanya tersimpan di database)
```

### Skenario 4 — Hapus (Soft Delete) (Phase 1)
```
Hapus    : Pilih data dari list → klik IKON HAPUS pada baris list (SATU-SATUNYA titik masuk aksi Hapus; TIDAK tersedia dari layar Detail) → tampil modal konfirmasi → konfirmasi → set is_delete = true (tanpa peringatan pemakaian di modul lain) → procedure HILANG dari list dashboard (data tetap tersimpan di DB) → Rekam audit trail ke database → [End]
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
| **BR-005** | Setiap aktivitas **tambah, ubah & hapus (soft delete)** wajib **direkam & disimpan ke audit trail di database** (user, timestamp, data before/after) sejak Phase 1. Audit trail **tidak ditampilkan di UI** (termasuk tidak pada Tampilan Detail). Pemulihan dilakukan langsung di database, di luar pencatatan aplikasi. | Background poin 1 |
| **BR-006** | Data procedure **tidak dapat dihapus permanen**. Aksi **Hapus = soft delete**: sistem mengubah `is_delete = true` sehingga procedure **hilang dari list dashboard** namun data **tetap tersimpan** di database. Aksi Hapus **hanya tersedia melalui ikon Hapus pada baris list** (tidak tersedia dari layar Detail). Soft delete dijalankan **langsung tanpa peringatan/konfirmasi pemakaian** terhadap modul lain, hanya **menampilkan modal konfirmasi**. **Tidak ada status aktif/nonaktif.** **Pemulihan hanya dapat dilakukan langsung di database** dengan mengubah `is_delete = false` — **tidak ada aksi Pulihkan di UI**. | Background; In Scope; Skenario 4 |
| **BR-007** | `kode` mengikuti format ICD-9-CM: **numerik dengan panjang 1–6 digit** (titik berlaku sebagai pemisah, mis. `99.99`). **Format kode sama untuk WHO maupun IM** — tidak ada perbedaan format antara kedua kategori. | Standar ICD-9-CM; instruksi pengembangan |
| **BR-008** | *(Phase 2)* Impor: baris dengan kode duplikat/format salah ditolak per baris; mode `tambah` menolak kode existing, mode `tambah+update` memperbarui yang ada. | konsisten field `mode_import` |
| **BR-009** | Modul **lain** (Asesmen Medis/Klaim/Integrasi SATUSEHAT/EMR) **menyimpa ID + kode + deskripsi procedure**. Konsumen mengambil **ID, kode dan deskripsi** sekaligus. Tujuannya: saat procedure di-**soft delete**, data historis yang sudah dipakai **tidak ikut terhapus/terputus referensinya** — sekaligus alasan soft delete tidak memerlukan peringatan. | Instruksi konsistensi; FR-009; BR-006 |
| **BR-010** | **Tampilan Detail bersifat read-only** dan **menampilkan field yang sama persis dengan form input** procedure (`kode`, `deskripsi`, `kategori`, `validity`, `keterangan`) **tanpa kemampuan edit** dan **tanpa menampilkan field sistem** (`procedure_id`/ID internal & `is_delete` **tidak ditampilkan**). **Layar Detail TIDAK menyediakan ikon/tombol Edit MAUPUN ikon/tombol Hapus** — satu-satunya kontrol adalah **Tutup/Kembali**. Perubahan data **hanya** dilakukan melalui **ikon Edit pada baris list** (satu-satunya titik masuk Form Edit, FR-005); penghapusan (soft delete) **hanya** dilakukan melalui **ikon Hapus pada baris list** (FR-010). Tampilan detail **tidak menampilkan riwayat audit trail** — hanya menampilkan detail field. | Instruksi pengembangan; FR-013; FR-005; FR-010; US-010 |
| **BR-011** | **Pemisahan aksi pada list**: setiap baris list menyediakan tiga ikon aksi yang berbeda fungsi — **Detail** (buka tampilan read-only), **Edit** (buka Form Edit), dan **Hapus** (soft delete dengan modal konfirmasi). Ketiga aksi ini menjadi **titik masuk tunggal** masing-masing; aksi **Edit** dan **Hapus** **tidak** diduplikasi pada layar Detail. | Instruksi pengembangan; FR-001 |

## 9. User Stories

- **US-001** — Sebagai **Admin Master Data**, saya ingin **menambah data procedure (kode & deskripsi)** mengikuti standar ICD-9-CM (kode numerik 1–6 digit), agar tersedia referensi kode tindakan yang terstandar. *(source: To-Be step 3–5)*
- **US-002** — Sebagai **Admin Master Data**, saya ingin **sistem menolak kode procedure duplikat**, agar tidak terjadi ambiguitas pada grouping & pelaporan. *(source: BR-001)*
- **US-003** — Sebagai **Admin Master Data**, saya ingin **mengubah data procedure** yang sudah ada melalui **ikon Edit pada baris list**, agar data tetap mutakhir saat regulator memperbarui kode. *(source: To-Be step 7)*
- **US-004** — Sebagai **Admin Master Data**, saya ingin **menandai kategori (ICD-9-CM WHO / ICD-9 IM) dan validity grouper (IDRG/IDRG-INACBG/INACBG/Tidak Ada)** tiap kode, agar varian klasifikasi terbedakan dan data akurat selama & setelah transisi INA-CBG → IDRG. *(source: BR-003, BR-004)*
- **US-005** — Sebagai **Admin Master Data**, saya ingin **mencari & memfilter procedure** by kode/deskripsi/kategori/validity, agar cepat menemukan kode yang tepat. *(source: To-Be step 2; Skenario 3)*
- **US-006** — Sebagai **Supervisor/Auditor**, saya ingin **setiap perubahan procedure terekam & tersimpan di audit trail database** (siapa mengubah apa & kapan), agar dapat ditelusuri di tingkat data saat terjadi ketidaksesuaian klaim. **Audit trail tidak perlu ditampilkan di UI** — cukup tersimpan di database. *(source: BR-005)*
- **US-007** — Sebagai **dokter/petugas (Asesmen Medis/Klaim/Integrasi SATUSEHAT/EMR)**, saya ingin **mengambil referensi ID + kode + deskripsi procedure** dari master ini dan **menyimpan ID dan teksnya**, agar konsisten lintas modul dan tetap utuh meski procedure di-soft delete. *(source: Overview; BR-009)*
- **US-008** — Sebagai **Admin Master Data**, saya ingin **menghapus (soft delete) procedure dari list** melalui ikon Hapus pada baris list (dengan modal konfirmasi) sehingga ditandai `is_delete=true` tanpa menghilangkan datanya, agar keterhubungan dengan transaksi tetap terjaga. *(Catatan: aksi Hapus hanya tersedia dari ikon Hapus pada baris list, bukan dari layar Detail; pemulihan tidak tersedia di UI — bila perlu dipulihkan, dilakukan langsung di database dengan `is_delete=false`.)* *(source: BR-006; Phase 1)*
- **US-009** *(Phase 2)* — Sebagai **Admin Master Data**, saya ingin **impor/ekspor data procedure massal** lewat tombol tersendiri, agar pemuatan awal/pembaruan berkala/migrasi efisien. *(source: Out Scope)*
- **US-010** — Sebagai **Admin Master Data/Koder**, saya ingin **melihat tampilan detail (read-only) sebuah procedure** melalui ikon Detail pada baris list, yang menampilkan **field yang sama persis dengan form input** (kode, deskripsi, kategori, validity, keterangan) **tanpa field sistem**, agar dapat **memeriksa data lengkap tanpa risiko mengubah atau menghapusnya**. Layar detail **tidak memiliki ikon/tombol Edit maupun ikon/tombol Hapus** — hanya **Tutup/Kembali**; bila perlu mengubah saya kembali ke list dan menggunakan **ikon Edit pada baris**, bila perlu menghapus saya menggunakan **ikon Hapus pada baris**. Tampilan detail **tidak menampilkan riwayat audit trail**. *(source: BR-010; FR-013; FR-005; FR-010)*

## 10. Functional Requirements

### Phase 1
| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menyediakan **menu list Procedure** (hanya `is_delete=false`) dengan kolom kode, deskripsi, kategori, validity; mendukung pencarian & filter. Setiap baris menyediakan **tiga ikon aksi**: **Detail** (read-only), **Edit** (buka Form Edit), dan **Hapus** (soft delete). **Tidak ada filter/tampilan "Terhapus"** karena pemulihan dilakukan langsung di database (data ber-`is_delete=true` tidak diakses melalui UI). | US-005, BR-011, To-Be 2 |
| **FR-002** | Sistem menyediakan **form Tambah Procedure** dengan field kode (numerik 1–6 digit), deskripsi, kategori (ICD-9-CM WHO/IM), validity, keterangan. | US-001, US-004 |
| **FR-003** | Sistem **memvalidasi keunikan kode** (case-insensitive) saat simpan tambah/ubah; menolak & menampilkan pesan jika duplikat. | US-002, BR-001 |
| **FR-004** | Sistem **memvalidasi field wajib** (kode, deskripsi, kategori, validity) sebelum simpan; jika ada field wajib kosong/tidak valid (non-duplikat), kembali ke form **dan menampilkan pesan "[nama field] wajib diisi"** untuk tiap field bermasalah. | BR-002, BR-003, BR-004; Skenario 1 |
| **FR-005** | Sistem menyediakan **satu Form Edit Procedure** terisi data existing dan menyimpan perubahan dengan validasi keunikan & field wajib ulang. Form Edit ini memiliki **SATU titik masuk tunggal yaitu ikon Edit pada baris list**. **Tidak ada titik masuk Edit dari layar Tampilan Detail** (layar detail tidak menyediakan ikon/tombol Edit). | US-003, BR-010, BR-011 |
| **FR-006** | Sistem **merekam & menyimpan audit trail ke database** (user, timestamp, aksi, data before/after) pada setiap tambah/ubah/hapus. | US-006, BR-005 |
| **FR-007** | Audit trail procedure **disimpan di database saja dan TIDAK ditampilkan di UI** — termasuk **TIDAK ditampilkan pada Tampilan Detail (FR-013)**. **Tidak ada layar riwayat audit.** Data audit dapat diakses langsung melalui basis data untuk keperluan penelusuran/akuntabilitas. | US-006, BR-005, BR-010 |
| **FR-008** | Sistem **dapat** menerapkan kontrol akses dasar atas operasi CRU & soft delete **mengikuti peran pengguna** yang berlaku. | NFR-004 |
| **FR-009** | Sistem menyediakan **referensi/lookup procedure (read-only)** untuk dikonsumsi modul **Asesmen Medis, Klaim BPJS/casemix, Integrasi SATUSEHAT, dan EMR**, mengembalikan **kode + deskripsi** (beserta validity bila diperlukan). Konsumen menyimpan **teks** kode+deskripsi (snapshot) beserta ID (BR-009). | US-007, BR-009 |
| **FR-010** | Sistem menyediakan **Hapus (soft delete)** data procedure via flag `is_delete` melalui **ikon Hapus pada baris list** sebagai **satu-satunya titik masuk aksi Hapus**; aksi Hapus **tidak tersedia pada layar Tampilan Detail** (layar detail tidak menyediakan ikon/tombol Hapus). Soft delete dijalankan **tanpa peringatan pemakaian di modul lain, hanya menampilkan modal konfirmasi**; data **tidak dihapus permanen** dan **tidak ada status aktif/nonaktif**. **Aksi Pulihkan TIDAK disediakan di UI** — pemulihan hanya dilakukan langsung di database (`is_delete = false`). | US-008, BR-006, BR-010 |
| **FR-013** | Sistem menyediakan **Tampilan Detail Procedure (read-only)** yang dibuka dari **ikon Detail pada baris list**, menampilkan **field yang sama persis dengan form input** (`kode`, `deskripsi`, `kategori`, `validity`, `keterangan`) dalam bentuk **read-only/non-editable**, **TANPA menampilkan field sistem** apa pun (`procedure_id`/ID internal & `is_delete` tidak ditampilkan). Layar ini **tidak memiliki aksi simpan/ubah/hapus dan TIDAK menyediakan ikon/tombol Edit MAUPUN ikon/tombol Hapus**; satu-satunya kontrol adalah **Tutup/Kembali**. Untuk mengubah data, pengguna kembali ke list dan menggunakan **ikon Edit pada baris** (FR-005); untuk menghapus, pengguna kembali ke list dan menggunakan **ikon Hapus pada baris** (FR-010). Tampilan detail **tidak menampilkan riwayat audit trail** (FR-007). | US-010, BR-010, FR-005, FR-010 |

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
| `procedure_id` | ID Internal | text | Ya (auto) | UUID/auto-increment | auto-generate | tidak tampil/dikunci; **tidak ditampilkan di Tampilan Detail** |
| `kode` | Kode Procedure | text | Ya | **unik** (case-insensitive); numerik dengan titik sebagai pemisah; **panjang 1–6 digit**, mis. `99.99`; **format sama untuk WHO maupun IM**. Pesan bila kosong: "Kode wajib diisi" | manual | BR-001, BR-007 |
| `deskripsi` | Deskripsi Procedure | text | Ya | **maks 255 char**. Pesan bila kosong: "Deskripsi wajib diisi" | manual | BR-002; **deskripsi ditulis dalam Bahasa Inggris sesuai standar ICD-9-CM** (NFR-005); dikonsumsi modul Klaim & Integrasi bersama kode |
| `kategori` | Kategori | dropdown | Ya | enum: `ICD-9-CM WHO` / `ICD-9 IM`. Pesan bila kosong: "Kategori wajib diisi" | enum | BR-003; hanya pembeda kategori (bukan format kode, bukan terminologi SATUSEHAT/BPJS) |
| `validity` | Validity Grouper | dropdown | Ya | enum: `IDRG` / `IDRG-INACBG` / `INACBG` / `Tidak Ada` (enum final, mewakili seluruh kombinasi). Pesan bila kosong: "Validity wajib diisi" | enum | BR-004 |
| `keterangan` | Keterangan | text | Tidak | **maks 255 char** | manual | field kanonik `keterangan` |

> **Field sistem (tidak diinput manual & tidak ditampilkan di Tampilan Detail):**
> - `procedure_id` (ID internal) — auto-generate, dikunci, **tidak ditampilkan** pada Tampilan Detail (FR-013).
> - `is_delete` (boolean, default `false`) — penanda **soft delete**; di-set `true` saat aksi **Hapus** (dari ikon Hapus pada baris list; langsung, hanya modal konfirmasi) sehingga procedure hilang dari list. **Pemulihan** (di-set `false`) **hanya dilakukan langsung di database**, tidak melalui UI. **Tidak ditampilkan** pada Tampilan Detail. **Tidak ada field status aktif/nonaktif.**
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
| Aksi | – | **tiga ikon: Detail / Edit / Hapus** | – | **Detail = buka tampilan read-only (FR-013)**; **Edit = SATU-SATUNYA titik masuk ke Form Edit (FR-005)**; **Hapus = SATU-SATUNYA titik masuk soft delete (modal konfirmasi, FR-010)**; **tidak ada tombol Pulihkan** |

### D. Layar TAMPIL — Detail Procedure (read-only) (FR-013, BR-010)
> Dibuka dari **ikon Detail** pada list. Menampilkan **field yang sama persis dengan form input** dalam bentuk **read-only** — semua field **dikunci/non-editable** (tidak ada input aktif maupun tombol Simpan). **TIDAK menampilkan field sistem apa pun** (`procedure_id`/ID internal & `is_delete` tidak ditampilkan). **Layar ini TIDAK memiliki ikon/tombol Edit MAUPUN ikon/tombol Hapus** — satu-satunya kontrol adalah **Tutup/Kembali**. Untuk mengubah data, pengguna kembali ke list dan menekan **ikon Edit pada baris** (FR-005); untuk menghapus (soft delete), pengguna kembali ke list dan menekan **ikon Hapus pada baris** (FR-010). **Tidak menampilkan riwayat audit trail** (audit trail hanya di database — FR-007).

| Field/Kolom | Sumber Data | Format Tampilan | Catatan |
|-------------|-------------|-----------------|---------|
| Kode | master_procedure.kode | text monospace (read-only) | sama dengan field form input; tidak dapat diedit |
| Deskripsi | master_procedure.deskripsi | text (read-only) | sama dengan field form input; **Bahasa Inggris (ICD-9-CM)** — NFR-005 |
| Kategori | master_procedure.kategori | badge WHO/IM (read-only) | sama dengan field form input; tidak dapat diedit |
| Validity | master_procedure.validity | badge IDRG/IDRG-INACBG/INACBG/Tidak Ada (read-only) | sama dengan field form input; tidak dapat diedit |
| Keterangan | master_procedure.keterangan | text (read-only) | sama dengan field form input; kosong bila tidak diisi |
| (Aksi) | – | tombol **Tutup/Kembali** saja | **TIDAK ada ikon/tombol Edit DAN TIDAK ada ikon/tombol Hapus di layar detail**; **tidak ada tombol Simpan/Pulihkan**; **tidak ada panel audit trail**. Perubahan dilakukan via ikon Edit pada baris list (FR-005); penghapusan via ikon Hapus pada baris list (FR-010) |

> **Catatan:** Tampilan Detail **menampilkan field yang sama persis dengan form input** (read-only), **TANPA field sistem** (`procedure_id`, `is_delete`), **TANPA ikon/tombol Edit**, **TANPA ikon/tombol Hapus**, dan **TIDAK** menampilkan audit trail (lihat FR-007) maupun aksi Pulihkan (lihat FR-010). Untuk mengubah data, kembali ke list lalu gunakan **ikon Edit pada baris**; untuk menghapus, kembali ke list lalu gunakan **ikon Hapus pada baris** procedure terkait.

### E. Penyimpanan Audit Trail (database only — TIDAK ditampilkan di UI) (FR-006, FR-007)
> Tabel `audit_trail` **direkam ke database** untuk setiap aksi tambah/ubah/hapus, namun **tidak memiliki layar tampilan** (termasuk tidak muncul pada Tampilan Detail). Struktur data disertakan agar dev menyiapkan skema penyimpanan, bukan untuk dirender. Pemulihan (`is_delete=false`) dilakukan langsung di database, di luar pencatatan aplikasi.

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
| **NFR-003** | Auditability | Audit trail bersifat **append-only**, **disimpan di database**, **tidak ditampilkan di UI** (termasuk pada Tampilan Detail), dan tidak dapat diubah/dihapus oleh pengguna. BR-005, FR-007 |
| **NFR-004** | Keamanan | Akses CRU & soft delete **mengikuti peran pengguna** yang berlaku (kontrol akses dasar).|
| **NFR-005** | Usability | **Label antarmuka, tombol, dan pesan validasi berbahasa Indonesia** (mis. duplikat "Kode 99.99 sudah ada"; field wajib "Deskripsi wajib diisi"). Namun **konten deskripsi procedure ditampilkan dalam Bahasa Inggris** mengikuti standar **ICD-9-CM dan ICD-9 IM** (deskripsi tindakan sesuai sumber WHO/IM). Ikon aksi pada list (Detail/Edit/Hapus) **konsisten & mudah dibedakan** secara visual. BR-002, BR-011, FR-004 |
| **NFR-006** | Kompatibilitas | Konsisten dengan pola modul master data sejenis untuk komponen form/detail/import/audit. |
| **NFR-007** | Skalabilitas data | Mendukung pembaruan berkala volume besar oleh regulator tanpa migrasi ulang (lihat validity). |
| **NFR-008** | Integritas referensial | Karena konsumen menyimpan **teks dan ID** ID+kode+deskripsi, **soft delete tidak memutus** data historis yang sudah dipakai sehingga aman dijalankan tanpa peringatan. BR-009, BR-006 |
| **NFR-009** | Keamanan data (read-only) | **Tampilan Detail wajib bersifat read-only**: tidak boleh ada jalur edit/simpan/hapus dari layar detail. **Layar detail TIDAK boleh menampilkan ikon/tombol Edit MAUPUN ikon/tombol Hapus** — satu-satunya kontrol adalah **Tutup/Kembali**; perubahan **hanya** melalui ikon Edit pada baris list (FR-005) dan penghapusan (soft delete) **hanya** melalui ikon Hapus pada baris list (FR-010). Field ditampilkan dalam mode non-editable, **terbatas pada field form input** (kode, deskripsi, kategori, validity, keterangan) dan **tidak memunculkan field sistem** (`procedure_id`, `is_delete`). FR-013, BR-010 |

> Catatan revisi: **Penegasan kontrol aksi pada Tampilan Detail** — selain jalur Edit (dihapus pada v3.0), kini **jalur/ikon Hapus juga DIHAPUS** dari layar Detail; layar Detail hanya menyediakan **Tutup/Kembali**. **FR-010** dipertegas: aksi Hapus hanya melalui **ikon Hapus pada baris list** (satu-satunya titik masuk). **FR-013, BR-010, NFR-009** dipertegas: layar detail tidak memiliki ikon Edit maupun Hapus. Sifat read-only Detail (field sama dengan form input, tanpa field sistem, tanpa audit trail) **dipertahankan**. **Modul RBAC tetap tidak termasuk** dalam PRD ini.

## 13. Integrasi Eksternal

> Modul ini bersifat **master/referensi murni**. **Proses integrasi SATUSEHAT dan BPJS berada pada code fitur lain**, bukan di modul ini. Modul master Procedure hanya **menyimpan & menyediakan kode + deskripsi ICD-9-CM (WHO) / ICD-9 IM** yang dikonsumsi modul-modul tersebut.

| Sistem/Modul | Tujuan | Arah | Catatan |
|--------------|--------|------|---------|
| **Modul Integrasi SATUSEHAT — Resource Procedure** | Mengambil **ID + kode + deskripsi** procedure untuk dipetakan/dikirim sebagai resource Procedure ke SATUSEHAT (deskripsi sebagai `display`/teks). | Master (penyedia) → modul integrasi (konsumen) | Proses mapping & call SATUSEHAT **bukan** tanggung jawab modul master ini. Menyimpan **ID dan teks** procedure. |
| **Modul Klaim BPJS/casemix (INA-CBG/IDRG)** | Mengambil **ID + kode + deskripsi** procedure beserta `validity` untuk grouping & klaim. | Master → modul klaim | Tidak ada call VClaim langsung dari master ini. Deskripsi dipakai untuk verifikasi/pembacaan koder. Menyimpan **ID dan teks**. |
| **Modul Pelayanan — Asesmen Medis** | Mengambil **ID + kode + deskripsi** procedure untuk **pencatatan tindakan** pada dokumen asesmen medis. | Master → asesmen medis | FR-009. Konsumen utama. Menyimpan **ID dan teks**. |
| **Rekam Medis/EMR** | Menampilkan/menyimpan kode + deskripsi procedure pada dokumen RME. | Master → EMR | FR-009. Menyimpan **ID dan teks**. |

**Catatan penyimpanan referensi (penting untuk dev konsumen):** modul konsumen **wajib menyimpan teks** (kode + deskripsi) procedure sebagai **snapshot** beserta ID. Dengan demikian, ketika procedure di-**soft delete** (`is_delete=true`), data yang sudah dipakai di transaksi/dokumen **tetap utuh dan tidak ikut terhapus** — inilah yang membuat soft delete **aman dijalankan tanpa peringatan** (BR-009, NFR-008).

**Catatan Interoperabilitas:** karena penandaan kode pada modul ini **hanya** membedakan kategori ICD-9-CM (WHO) vs ICD-9 IM (dengan **format kode yang sama** untuk keduanya), **tidak ada** field pemetaan terminologi SATUSEHAT/BPJS pada master ini. Pemetaan terminologi & seluruh proses integrasi ditangani modul integrasi terkait (code fitur lain, dikosongkan dulu).

## Asumsi
- [DIKONFIRMASI] Pada list/dashboard, setiap baris menyediakan tiga ikon aksi: Detail, Edit, dan Hapus — sesuai instruksi pengembangan.
- [DIKONFIRMASI] Tampilan Detail (read-only) TIDAK memiliki ikon/tombol Hapus — sesuai instruksi pengembangan terbaru. Aksi Hapus (soft delete) hanya tersedia melalui ikon Hapus pada baris list (FR-010).
- [DIKONFIRMASI] Tampilan Detail (read-only) TIDAK memiliki ikon/tombol Edit; perubahan data hanya melalui ikon Edit pada baris list (FR-005).
- [DIKONFIRMASI] Satu-satunya kontrol pada layar Tampilan Detail adalah Tutup/Kembali — tidak ada ikon/tombol Edit, Hapus, Simpan, maupun Pulihkan.
- [DIKONFIRMASI] Tampilan Detail menampilkan field yang sama persis dengan form input (kode, deskripsi, kategori, validity, keterangan) TANPA field sistem (procedure_id & is_delete tidak ditampilkan) dan TANPA riwayat audit trail.