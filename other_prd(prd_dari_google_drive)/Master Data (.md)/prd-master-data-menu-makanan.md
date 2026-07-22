# PRD — Master Data: Menu Makanan

**Related Document:** PRD_Master Data_Barang Gizi.docx (A6); Master Data Satuan & Kemasan (A22); Order Menu Gizi (g-service-order-nutrition); Pemesanan Supplier Barang Gizi (g-backoffice-inventory-pemesanan); Rekap Order Makanan (g-support-nutrition-rekap); Design Figma
**Versi:** 1.4 - Fitur Pulihkan (restore) & layar Data Terhapus ditunda ke fase berikutnya (wewenang mengikuti pengaturan role); nilai Diet 'Lainnya' & mekanisme free-text diet_lainnya dihapus (Diet = 20 enum baku strict); constraint unik parsial nama_menu (is_deleted=false) dikonfirmasi diinginkan

## 1. Overview / Brief Summary

Modul **Master Data - Menu Makanan** (kode fitur **A9**, cluster **Control Panel**) berfungsi sebagai pusat pengelolaan data resep/menu makanan pada **Instalasi Gizi** rumah sakit Tipe C & D.

Setiap menu makanan terdiri atas **satu atau lebih bahan makanan** beserta atribut **Jenis Diet**, **Berat Kotor**, **BDD (Berat Dapat Dimakan)**, dan **Satuan**. Field *Bahan Makanan* merujuk ke **Master Barang Gizi (A6)** sebagai sumber data; field *Satuan* merujuk ke **Master Satuan & Kemasan (A22)**.

Menu makanan menjadi acuan pada proses **perencanaan menu (siklus menu)**, **produksi/pengolahan makanan**, serta **distribusi diet pasien** — sehingga komposisi dan kandungan gizi setiap menu **terstandar dan terdokumentasi**. Modul ini adalah **single source of truth** untuk seluruh definisi menu makanan yang dipakai modul Gizi (Order Menu Gizi, Pemesanan Supplier Barang Gizi).

Fungsi inti (CRUD master) **Phase 1**: **Dashboard/List**, **Tambah**, **Edit**, **Hapus (soft delete)** & **Nonaktifkan**, **Pencarian**, dengan **audit trail** pada setiap perubahan.

> **Catatan versi 1.4 (instruksi user terbaru):**
> 1. **Fitur Pulihkan (restore) data terhapus & layar 'Data Terhapus' DITUNDA ke fase berikutnya (Phase 2).** Di Phase 1 data terhapus tetap tersimpan (soft delete) demi integritas referensi, tetapi **tidak ada UI restore**. Saat fitur restore tersedia nanti, **wewenang aksinya mengikuti pengaturan role (RBAC A18/A53 + Akses Menu A37)** — tidak di-hardcode ke role tertentu (§7 Skenario 4, BR-15, FR-021, US-008).
> 2. **Nilai Diet 'Lainnya' beserta mekanisme field teks bebas `diet_lainnya` DIHAPUS.** Jenis Diet kini **strict 20 nilai enum baku** tanpa input bebas. Kebutuhan diet di luar daftar baku ditangani saat migrasi ke **master diet dinamis (fase berikutnya)**, bukan via free text (BR-11, §11.6.C).
> 3. **Constraint unik parsial pada `nama_menu` (hanya berlaku saat `is_deleted=false`) DIKONFIRMASI diinginkan** — nama menu boleh dipakai ulang setelah data lama di-soft-delete (NFR-003).
>
> **Catatan versi 1.3:**
> 1. **Aksi Hapus = soft delete** (dikonfirmasi user). Data tidak dihapus permanen dari basis data; hanya ditandai terhapus agar **referensi historis order/pemesanan tetap utuh** (§7 Skenario 4, BR-14, §11.1).
> 2. **Satu bahan boleh muncul lebih dari sekali dalam satu menu BILA Jenis Dietnya berbeda** (dikonfirmasi user). Duplikat hanya dilarang untuk kombinasi **Bahan + Diet yang identik** (BR-07, §11.2).
>
> **Catatan versi 1.2:**
> 1. **Bentuk Makanan** disederhanakan — **tipe Cair tidak lagi dipisah** (Jernih/Penuh/Kental) menjadi satu nilai **Cair** (§11.6.B).
> 2. **Singkatan diet kombinasi DMRG & DMDJ dikonfirmasi**: DMRG = DM + Rendah Garam, DMDJ = DM + Diet Jantung (§11.6.C).
> 3. **Satuan komposisi dikonfirmasi merujuk ke Master Satuan & Kemasan (A22)** (§11.2, §13).
>
> **Catatan versi 1.1:** Nilai baku (enum) untuk **Kategori Menu**, **Bentuk Makanan**, dan **Jenis Diet** ditetapkan secara *hardcoded/enum* — lihat **§11.6 Nilai Referensi (Enum)**.

## 2. Background

Sebelum modul ini dikembangkan, penyusunan menu dan perhitungan kebutuhan bahan banyak dilakukan **secara manual** (lembar kerja/Excel atau catatan fisik). Akibatnya:

- **Tidak ada acuan komposisi menu yang baku** untuk produksi dan distribusi diet.
- **Penamaan menu dan bahan rawan tidak konsisten** antar petugas Gizi → duplikasi & ambiguitas.
- Sulit menghitung kebutuhan bahan (BDD) secara konsisten saat perencanaan & pemesanan ke supplier.

Untuk RS Tipe C & D dengan SDM Instalasi Gizi terbatas, ketiadaan master baku menyebabkan ketergantungan pada pengetahuan personal dan tingginya potensi kesalahan saat order/produksi.

Modul ini dikembangkan menjadi **sumber kebenaran tunggal** bagi seluruh definisi menu makanan, sehingga komposisi menu konsisten, dapat dipakai ulang lintas proses gizi, dan mengurangi ketergantungan pada tim teknis. [ASUMSI] Detail kondisi As-Is per RS dapat bervariasi; bagian ini diturunkan dari narasi dokumen lampiran dan pola proses gizi terkait.

## 3. In Scope

### Scope Definition (Phase 1)
| No | Scope / Area |
|----|--------------|
| 1 | Dashboard / List Master Data Menu Makanan |
| 2 | Tambah Menu Makanan (data header menu + komposisi bahan) |
| 3 | Edit Menu Makanan (termasuk tambah/hapus baris bahan) |
| 4 | **Hapus (soft delete)** & Nonaktifkan Menu Makanan |
| 5 | Pencarian menu berdasarkan **nama menu** dan **kategori** |
| 6 | Komposisi bahan per menu: **Bahan Makanan, Diet, Berat Kotor, BDD, Satuan** |
| 7 | Validasi keunikan nama menu & kelengkapan komposisi |
| 8 | Audit trail / riwayat aktivitas perubahan menu (Tambah/Edit/Nonaktif/Hapus) |
| 9 | **Nilai enum baku**: Kategori Menu, Bentuk Makanan, Jenis Diet (20 nilai strict, §11.6) |
| 10 | **Lookup Satuan komposisi dari Master Satuan & Kemasan (A22)** |

### Out Scope
| No | Scope |
|----|-------|
| 1 | Pengelolaan data **bahan makanan beserta nilai gizinya** (dikelola di Master Barang Gizi A6) |
| 2 | **Perhitungan BDD otomatis** (BDD diinput manual di Phase 1) |
| 3 | Perencanaan menu / siklus menu (modul Gizi terpisah) |
| 4 | Validasi 'menu tidak dapat dinonaktifkan/dihapus bila masih dipakai pada perencanaan menu aktif' — *dikerjakan di fitur perencanaan menu yang berkaitan, bukan di phase ini* |
| 5 | Order/produksi/distribusi makanan (modul Pelayanan Gizi) |
| 6 | **Pengelolaan master enum secara dinamis oleh user** (Kategori/Bentuk/Diet bersifat *hardcoded* di Phase 1; CRUD master diet dinamis = fase berikutnya bila dibutuhkan) |
| 7 | **Pengelolaan master Satuan & Kemasan (A22)** — dikelola pada modulnya sendiri; di sini hanya dipakai sebagai lookup |
| 8 | **Fitur Pulihkan (restore) data terhapus & layar 'Data Terhapus'** — *ditunda ke fase berikutnya (Phase 2)* sesuai instruksi user v1.4. Phase 1 hanya menyimpan penanda soft delete; UI/aksi pemulihan belum disediakan. Saat dibangun, wewenangnya mengikuti **pengaturan role (RBAC)** |
| 9 | **Hard delete / purge permanen** data menu (mis. UI khusus admin untuk menghapus permanen dari recycle bin) — Phase 1 hanya soft delete; pembersihan permanen, bila perlu, dikerjakan di luar aplikasi/role super-admin pada fase berikutnya |
| 10 | **Mekanisme nilai Diet bebas / 'Lainnya'** — *dihapus* (instruksi user v1.4). Kebutuhan diet di luar 20 nilai baku ditangani saat migrasi ke master diet dinamis (fase berikutnya), bukan via input free text |

## 4. Goals and Metrics

### Goals
1. Menyediakan **pusat pengelolaan menu makanan yang terstandar** untuk Instalasi Gizi.
2. Memastikan **komposisi bahan setiap menu konsisten dan terdokumentasi**.
3. Mempermudah **perhitungan kebutuhan bahan (BDD)** pada perencanaan & pemesanan.
4. Menjadi **acuan tunggal** untuk perencanaan menu dan distribusi diet pasien.
5. **Membakukan klasifikasi menu** (Kategori, Bentuk Makanan, Jenis Diet) agar selaras lintas modul gizi.
6. **Menjaga integritas referensi historis** — penghapusan menu tidak boleh memutus jejak order/pemesanan yang sudah terjadi (soft delete).

### Metrics
| No | Metrik | Success Criteria |
|----|--------|------------------|
| 1 | Konsistensi data menu | **0% duplikasi** nama menu makanan aktif di sistem |
| 2 | Kemandirian user non-teknis | **100% Ahli Gizi** mampu menyusun menu tanpa bantuan tim teknis |
| 3 | Performa pencarian | Waktu pencarian data menu **< 3 detik** |
| 4 | Standardisasi klasifikasi | **100% menu** menggunakan nilai Kategori, Bentuk Makanan & Diet dari enum baku **tanpa free text** (Diet kini strict 20 enum, tanpa pengecualian) |
| 5 | Standardisasi satuan | **100% baris komposisi** menggunakan Satuan dari Master Satuan & Kemasan (A22), tanpa free text |
| 6 | Integritas referensi | **0 referensi historis** (order/pemesanan) menjadi rusak/yatim akibat penghapusan menu — terjamin oleh soft delete |

## 5. Related Feature

| No | Code | Module / Feature | Relasi |
|----|------|------------------|--------|
| 1 | **A6** | Master Data > Barang Gizi (New) | Field **Bahan Makanan** pada komposisi menu **diambil dari** master ini (lookup) |
| 2 | **A22** | Master Data > Satuan & Kemasan | Field **Satuan** pada komposisi menu **diambil dari** master ini (lookup) — *dikonfirmasi v1.2* |
| 3 | — | Pelayanan Gizi > **Order Menu Gizi** (g-service-order-nutrition) | Field menu makanan **merujuk** ke master ini saat order makanan pasien; soft delete menjaga rujukan historis tetap valid |
| 4 | — | Backoffice > **Pemesanan Supplier Barang Gizi** (g-backoffice-inventory-pemesanan) | Komposisi bahan menu menjadi dasar kebutuhan bahan untuk pemesanan |
| 5 | — | Pelayanan Pendukung > **Rekap Order Makanan** (g-support-nutrition-rekap) | Rekap/cetak (e-ticket, serah terima) memakai definisi menu dari master ini |

Fitur se-cluster Control Panel lain yang relevan secara pola: **A1 User**, **A2 Staff**, **A3 Unit**, **A55 Jabatan** (untuk identitas pembuat/pengubah & otorisasi akses menu). **Pengaturan Role / RBAC (A18/A53) & Akses Menu (A37)** menentukan wewenang seluruh aksi modul ini — termasuk Hapus dan (di fase berikutnya) Pulihkan. Lihat §13 untuk integrasi.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI]
1. Ahli Gizi menyusun menu & komposisi bahan secara manual (Excel/kertas).
2. Tidak ada validasi keunikan → nama menu dapat tertulis berbeda untuk menu yang sama.
3. Klasifikasi (kategori/bentuk/diet) ditulis bebas → istilah tidak seragam antar petugas.
4. Satuan bahan ditulis bebas (gr/gram/g) → tidak seragam dan menyulitkan agregasi kebutuhan.
5. Saat order/produksi/pemesanan, petugas menyalin ulang komposisi → rawan salah dan tidak terdokumentasi.
6. Menu yang salah/tidak dipakai dihapus dari lembar kerja → jejak historis hilang, sulit telusur.

### B. To-Be (kondisi diharapkan)
**Pengelolaan Menu Makanan**
1. Ahli Gizi / Admin Gizi mengakses menu **Master Data - Menu Makanan** (sesuai hak akses pada pengaturan role).
2. User dapat **menambah, mengubah, menonaktifkan, atau menghapus (soft delete)** menu makanan.
3. Data header menu: **Nama Menu, Kategori (enum baku), Bentuk Makanan (enum baku), Status**.

**Penyusunan Komposisi Bahan**
4. Untuk setiap menu, user menambahkan baris bahan: pilih **Bahan Makanan** (dari Master Barang Gizi A6), pilih **Diet** (enum baku, 20 nilai strict), isi **Berat Kotor**, **BDD**, dan pilih **Satuan** (dari Master Satuan & Kemasan A22). **Bahan yang sama boleh ditambahkan lebih dari sekali selama Jenis Dietnya berbeda.**

**Rujukan & Penggunaan**
5. Menu berstatus **Aktif** dan **tidak terhapus** dipakai pada modul Gizi: **Order Menu Gizi** dan **Pemesanan Supplier Barang Gizi**.

**Validasi & Audit Trail**
6. Sistem memvalidasi keunikan nama menu & kelengkapan komposisi; setiap perubahan (Tambah/Edit/Nonaktif/Hapus) terekam dalam **audit trail**. Data yang dihapus ditandai sebagai terhapus (soft delete) dan tidak lagi tampil di Dashboard utama. (Pemulihan data terhapus = fase berikutnya.)

### Flow ringkas
`[Ahli Gizi] → Akses Menu Master Data - Menu Makanan → Input Nama Menu, Kategori & Bentuk (enum) & Komposisi Bahan (Diet enum 20 nilai, Satuan dari A22; bahan boleh berulang bila diet beda) → Validasi & Simpan → Menu tersedia untuk Perencanaan Menu, Produksi, dan Distribusi Gizi. Hapus → soft delete (data ditandai terhapus, jejak historis tetap utuh; pemulihan = fase berikutnya).`

## 7. Main Flow / Mindmap

**Aktor utama:** Ahli Gizi / Admin Gizi (otorisasi tiap aksi mengikuti pengaturan role — RBAC A18/A53 + Akses Menu A37; lihat §13).

### Skenario 1 — Lihat & Cari Menu (Dashboard)
1. User buka menu **Control Panel → Master Data → Menu Makanan**.
2. Sistem menampilkan **list menu yang tidak terhapus** (kolom: Nama Menu, Kategori, Status), default sort nama menu **ascending**, pagination 10/20/50/100.
3. User mengetik kata kunci di kolom pencarian (nama menu / kategori) → sistem menampilkan hasil filter (**< 3 detik**).

### Skenario 2 — Tambah Menu (alur utama)
1. User klik **Tambah** → sistem menampilkan form **Tambah Data Menu Makanan**.
2. User mengisi **header**: Nama Menu, **Kategori** (dropdown enum §11.6.A), **Bentuk Makanan** (dropdown enum §11.6.B), Status.
3. User menambah **baris komposisi bahan**: pilih Bahan Makanan (lookup A6) → pilih **Diet** (dropdown enum §11.6.C, 20 nilai) → isi Berat Kotor → isi BDD → pilih **Satuan** (lookup A22). Ulangi untuk bahan lain. **Bahan yang sama boleh dipilih lagi pada baris berbeda asalkan Dietnya berbeda** (BR-07).
4. User klik **Simpan**.
5. **Decision — Nama menu unik?** [BR-01]
   - Tidak (duplikat di antara data tidak terhapus) → sistem menampilkan **pesan error**, data tidak tersimpan.
   - Ya → lanjut.
6. **Decision — Komposisi lengkap & tidak ada duplikat Bahan+Diet?** [BR-02, BR-07] (minimal 1 baris bahan, seluruh kolom wajib terisi, tidak ada baris dengan kombinasi Bahan+Diet identik)
   - Tidak → sistem menampilkan **pesan error** pada baris/field yang kurang atau duplikat.
   - Ya → **sistem menyimpan** data + mencatat audit trail → menu muncul di Dashboard.

### Skenario 3 — Edit Menu
1. User klik **Edit** pada satu menu → form berisi data header + komposisi tersimpan.
2. Semua kolom **editable**, termasuk **menambah/menghapus baris bahan**.
3. Simpan → validasi sama seperti Tambah (termasuk BR-07) → perubahan **tercatat sebagai riwayat aktivitas**.

### Skenario 4 — Nonaktifkan / Hapus (Soft Delete) Menu
1. User pilih **Nonaktifkan** → status menu menjadi **Nonaktif** (tidak muncul sebagai pilihan di Order/Pemesanan, namun **tetap tampil di Dashboard** sebagai data nonaktif).
2. User pilih **Hapus** → sistem meminta **konfirmasi**. Setelah dikonfirmasi, sistem melakukan **soft delete**: menandai data sebagai terhapus (`is_deleted = true`, mengisi `deleted_at`, `deleted_by`) tanpa menghapus baris dari basis data. [KONFIRMASI v1.3]
3. Setelah soft delete: menu **tidak lagi tampil** di Dashboard utama maupun sebagai pilihan di Order/Pemesanan (BR-05/BR-14), namun **rujukan historis pada order/pemesanan yang sudah terjadi tetap valid** (data master masih ada di DB).
4. **[KONFIRMASI v1.4] Pemulihan (restore) data terhapus DITUNDA ke fase berikutnya (Phase 2).** Di Phase 1 **tidak ada UI/aksi restore** maupun layar 'Data Terhapus'; data terhapus hanya tersimpan dengan penanda `is_deleted=true` sebagai jaminan integritas. Saat fitur restore dibangun nanti, **wewenang aksinya mengikuti pengaturan role (RBAC A18/A53 + Akses Menu A37)** — tidak di-hardcode ke role tertentu; aksi restore juga dicatat di audit trail.
5. [ASUMSI] Pengecekan 'menu masih dipakai pada perencanaan menu aktif' **belum** dikerjakan di phase ini (out scope); namun karena hapus bersifat soft delete, integritas referensi tetap aman.

## 8. Business Rules

| ID | Rule | Sumber |
|----|------|--------|
| **BR-01** | **Nama menu wajib unik** (case-insensitive, trim) **di antara data yang tidak terhapus**. Jika duplikat saat simpan → tampilkan pesan error, batalkan simpan. Target metrik: 0% duplikasi. | Goals & Metrics, US Tambah |
| **BR-02** | Menu **wajib memiliki minimal 1 baris komposisi bahan**, dan setiap baris wajib mengisi seluruh kolom wajib (Bahan Makanan, Diet, Berat Kotor, BDD, Satuan). | Skenario 2 |
| **BR-03** | Field **Bahan Makanan** hanya boleh dipilih dari **Master Barang Gizi (A6)** yang berstatus aktif (tidak boleh free text). | Related Feature A6 |
| **BR-04** | **BDD ≤ Berat Kotor** dan keduanya bernilai > 0; keduanya menggunakan **Satuan yang sama** (field `satuan` per baris, dari A22). [ASUMSI] aturan logis gizi (BDD = bagian dapat dimakan ≤ berat kotor). | Analogi gizi, A22 |
| **BR-05** | Hanya menu berstatus **Aktif** dan **tidak terhapus** (`is_deleted = false`) yang muncul sebagai pilihan pada Order Menu Gizi & Pemesanan Supplier Barang Gizi. | Business Process |
| **BR-06** | Setiap **Tambah/Edit/Nonaktifkan/Hapus** menu **wajib tercatat di audit trail** (user, waktu, aksi, perubahan). Aksi **Pulihkan** akan ikut dicatat saat fitur tersebut tersedia (fase berikutnya). | US Edit |
| **BR-07** | **Bahan tidak boleh duplikat untuk kombinasi Bahan + Diet yang IDENTIK** dalam satu menu. **Bahan yang sama BOLEH muncul lebih dari sekali bila Jenis Dietnya berbeda** (dikonfirmasi user v1.3). Validasi keunikan baris = pasangan (`id_bahan`, `diet`). | Instruksi user v1.3 |
| **BR-08** | Validasi 'menu tidak dapat dinonaktifkan/dihapus bila masih dipakai perencanaan menu aktif' **ditangani di fitur perencanaan menu**, bukan phase ini. | Out Scope |
| **BR-09** | **Kategori** wajib dipilih dari enum baku (§11.6.A): *Makanan Pokok, Lauk Hewani, Lauk Nabati, Sayur, Buah, Snack, Minuman*. Tidak boleh free text. | Instruksi user v1.1 |
| **BR-10** | **Bentuk Makanan** wajib dipilih dari enum baku (§11.6.B): *Biasa, Lunak, Lumat/Lembik, Saring, Cair* (tipe Cair **tidak dipisah**). Tidak boleh free text. | Instruksi user v1.2 |
| **BR-11** | **Jenis Diet** wajib dipilih dari enum baku (§11.6.C) berisi **20 nilai strict**. **Tidak ada nilai 'Lainnya' maupun mekanisme field teks bebas** (dihapus per instruksi user v1.4). Kebutuhan diet di luar daftar baku **tidak** ditampung via input bebas, melainkan ditangani saat migrasi ke **master diet dinamis (fase berikutnya)**. | Instruksi user v1.4 |
| **BR-12** | Penambahan/perubahan nilai pada ketiga enum (Kategori/Bentuk/Diet) dilakukan oleh tim teknis (perubahan kode), bukan oleh user. CRUD master dinamis = fase berikutnya (Out Scope). | In/Out Scope |
| **BR-13** | Field **Satuan** pada komposisi hanya boleh dipilih dari **Master Satuan & Kemasan (A22)** yang aktif (tidak boleh free text). | Instruksi user v1.2, A22 |
| **BR-14** | **Aksi Hapus = soft delete** (dikonfirmasi user v1.3). Sistem **tidak menghapus baris** dari basis data, melainkan menandai `is_deleted = true` serta mengisi `deleted_at` & `deleted_by`. Data terhapus **dikecualikan** dari Dashboard utama, pencarian default, validasi keunikan nama (BR-01), dan pilihan Order/Pemesanan (BR-05) — sehingga **referensi historis order/pemesanan tetap utuh**. | Instruksi user v1.3 |
| **BR-15** | **[KONFIRMASI v1.4] Fitur Pemulihan (restore) data terhapus DITUNDA ke fase berikutnya (Phase 2).** Saat tersedia: restore mengembalikan `is_deleted = false`; bila nama menu hasil restore berbenturan dengan menu aktif, sistem menolak/meminta perubahan nama (jaga BR-01); dan **wewenang aksi restore mengikuti pengaturan role (RBAC A18/A53)** — bukan role tetap/hardcoded. | Instruksi user v1.4 (turunan BR-14) |
| **BR-16** | **Wewenang seluruh aksi modul** (Lihat/Tambah/Edit/Nonaktif/Hapus, serta Pulihkan pada fase berikutnya) **ditentukan oleh pengaturan role (RBAC A18/A53 + Akses Menu A37)**, tidak di-hardcode di modul ini. | Instruksi user v1.4 |

## 9. User Stories

| ID | Prioritas | User Story | Acceptance Criteria (ringkas) |
|----|-----------|------------|-------------------------------|
| **US-001** | P0 | Sebagai **Ahli Gizi**, saya dapat melihat **Dashboard** data Menu Makanan, agar seluruh menu beserta atributnya terpantau. | Klik Masterdata → Menu Makanan menampilkan list menu **tidak terhapus** (Nama Menu, Kategori, Status); default sort nama ASC; sort ASC/DESC per kolom; pencarian by nama & kategori; pagination 10/20/50/100. |
| **US-002** | P0 | Sebagai **Ahli Gizi**, saya dapat **menambahkan menu makanan baru beserta komposisi bahannya**, agar menu dapat dipakai untuk perencanaan & produksi. | Form Tambah berisi field Nama Menu, Kategori (dropdown enum), Bentuk Makanan (dropdown enum) + tabel komposisi (Bahan Makanan, Diet dropdown enum 20 nilai, Berat Kotor, BDD, Satuan lookup A22); bahan sama boleh berulang bila diet beda (BR-07); data tersimpan & muncul di Dashboard; nama unik (BR-01); komposisi lengkap (BR-02). |
| **US-003** | P0 | Sebagai **Ahli Gizi**, saya dapat **mengubah detail menu makanan**, agar data menu selalu sesuai kebutuhan. | Form Edit menampilkan data + komposisi tersimpan; semua kolom editable termasuk tambah/hapus baris bahan; perubahan tercatat sebagai riwayat aktivitas (BR-06). |
| **US-004** | P1 | Sebagai **Ahli Gizi**, saya dapat **menonaktifkan menu** yang tidak dipakai, agar daftar menu tetap relevan. | Status menu dapat diubah ke Nonaktif; menu nonaktif tidak muncul di Order/Pemesanan (BR-05) namun tetap tampil di Dashboard. Pengecekan pemakaian di perencanaan aktif = fitur lain (BR-08). |
| **US-005** | P2 | Sebagai **Ahli Gizi** (sesuai hak akses role), saya dapat **menghapus menu** yang salah/tidak relevan **tanpa merusak data historis**, agar master tetap bersih namun jejak order/pemesanan lama tetap utuh. | Aksi Hapus meminta konfirmasi; setelah dikonfirmasi sistem melakukan **soft delete** (`is_deleted=true`, isi `deleted_at`/`deleted_by`, BR-14); menu hilang dari Dashboard & pilihan Order/Pemesanan; baris DB tidak terhapus; aksi tercatat di audit trail (BR-06); wewenang aksi mengikuti pengaturan role (BR-16). |
| **US-006** | P1 | Sebagai **Ahli Gizi**, saya dapat **memilih Kategori, Bentuk Makanan, dan Jenis Diet dari daftar baku**, agar klasifikasi menu seragam dan tidak ambigu. | Ketiga field tampil sebagai dropdown dengan nilai dari §11.6; tidak menerima free text (BR-09/10/11); **Diet = strict 20 nilai enum, tanpa opsi 'Lainnya'/input bebas** (BR-11). |
| **US-007** | P1 | Sebagai **Ahli Gizi**, saya dapat **memilih Satuan komposisi dari master satuan baku (A22)**, agar satuan kebutuhan bahan konsisten lintas menu & dapat diagregasi saat pemesanan. | Field Satuan tampil sebagai dropdown/lookup dari Master Satuan & Kemasan (A22) aktif; tidak menerima free text (BR-13). |
| **US-008** | P2 | *(Ditunda Phase 2)* Sebagai **role berwenang (sesuai pengaturan role)**, saya dapat **melihat & memulihkan menu yang terhapus**, agar penghapusan yang keliru dapat dibatalkan. | **Tidak dikerjakan di Phase 1** (instruksi user v1.4). Saat dibangun: tersedia daftar/filter 'Data Terhapus'; aksi Pulihkan mengembalikan `is_deleted=false` (BR-15) dengan validasi nama unik (BR-01); **wewenang mengikuti pengaturan role (RBAC), bukan role hardcoded** (BR-16); aksi tercatat di audit trail. |

> Traceability: modul ini **tidak punya BPMN sendiri**; user story diturunkan dari dokumen lampiran (PRD_Master_Data_Menu Makanan.docx) dan analogi proses **g-service-order-nutrition** (task: 'Data Order Gizi Masuk ke Modul Gizi - Order Makanan Pasien', 'Edit Item') serta **g-support-nutrition-rekap**.

## 10. Functional Requirements

| ID | Requirement | Prioritas | Trace |
|----|-------------|-----------|-------|
| **FR-001** | Sistem menampilkan **Dashboard/List** menu makanan (**hanya data tidak terhapus**) dengan kolom Nama Menu, Kategori, Status; default sort nama ASC. | P0 | US-001, BR-14 |
| **FR-002** | Sistem menyediakan **sorting ASC/DESC** pada kolom Nama Menu, Kategori, Status. | P0 | US-001 |
| **FR-003** | Sistem menyediakan **pencarian** berdasarkan nama menu & kategori (respons < 3 detik), mengecualikan data terhapus. | P0 | US-001, Metrik 3 |
| **FR-004** | Sistem menyediakan **pagination** 10/20/50/100 data per halaman. | P1 | US-001 |
| **FR-005** | Sistem menyediakan form **Tambah Menu** (header + tabel komposisi bahan), tombol tambah/hapus baris bahan. | P0 | US-002 |
| **FR-006** | Field **Bahan Makanan** berupa **lookup ke Master Barang Gizi (A6)** yang aktif. | P0 | US-002, BR-03 |
| **FR-007** | Sistem memvalidasi **keunikan nama menu** (di antara data tidak terhapus) sebelum simpan; tampilkan pesan error bila duplikat. | P0 | US-002, BR-01 |
| **FR-008** | Sistem memvalidasi **kelengkapan komposisi** (≥1 baris & kolom wajib terisi) sebelum simpan. | P0 | US-002, BR-02 |
| **FR-009** | Sistem menyimpan menu + komposisi dan menampilkannya di Dashboard. | P0 | US-002 |
| **FR-010** | Sistem menyediakan form **Edit** dengan seluruh kolom editable termasuk tambah/hapus baris bahan. | P0 | US-003 |
| **FR-011** | Sistem mencatat **audit trail / riwayat aktivitas** pada setiap Tambah/Edit/Nonaktif/Hapus (user, waktu, aksi); aksi Pulihkan dicatat saat fitur tersedia (fase berikutnya). | P0 | US-003, BR-06 |
| **FR-012** | Sistem menyediakan aksi **Nonaktifkan** (ubah status) dan **Hapus** (dengan konfirmasi). | P1 | US-004, US-005 |
| **FR-013** | Hanya menu **Aktif & tidak terhapus** yang diekspos sebagai pilihan ke modul Order Menu Gizi & Pemesanan Supplier Barang Gizi. | P1 | BR-05 |
| **FR-014** | Field **Kategori** ditampilkan sebagai **dropdown** dengan 7 nilai enum baku (§11.6.A); menolak nilai di luar daftar. | P0 | US-006, BR-09 |
| **FR-015** | Field **Bentuk Makanan** ditampilkan sebagai **dropdown** dengan 5 nilai enum baku (§11.6.B — tipe Cair tunggal); menolak nilai di luar daftar. | P0 | US-006, BR-10 |
| **FR-016** | Field **Diet** (per baris komposisi) ditampilkan sebagai **dropdown** dengan **20 nilai enum baku strict** (§11.6.C); menolak nilai di luar daftar; **tanpa opsi 'Lainnya'/free text**. | P0 | US-006, BR-11 |
| **FR-017** | **(Dihapus v1.4)** ~~Bila Diet = 'Lainnya', sistem menampilkan & mewajibkan field teks `diet_lainnya`.~~ Mekanisme nilai Diet bebas/'Lainnya' **dihilangkan** sesuai instruksi user — Jenis Diet kini strict 20 enum tanpa input bebas. | — | BR-11 |
| **FR-018** | Field **Satuan** (per baris komposisi) ditampilkan sebagai **dropdown/lookup ke Master Satuan & Kemasan (A22)** yang aktif; menolak nilai di luar master. | P0 | US-007, BR-13 |
| **FR-019** | Aksi **Hapus** dilakukan sebagai **soft delete**: sistem menandai `is_deleted=true` serta mengisi `deleted_at` & `deleted_by`, **tidak menghapus baris** dari basis data; data terhapus dikecualikan dari list/pencarian/validasi keunikan/pilihan Order. | P1 | US-005, BR-14 |
| **FR-020** | Sistem memvalidasi bahwa **kombinasi Bahan + Diet tidak duplikat** dalam satu menu; **bahan sama dengan Diet berbeda diizinkan**. Bila duplikat (Bahan+Diet identik) → tampilkan error pada baris bersangkutan. | P0 | US-002, BR-07 |
| **FR-021** | **(Ditunda Phase 2)** Sistem menyediakan daftar/filter **'Data Terhapus'** dan aksi **Pulihkan** (set `is_deleted=false`) dengan validasi keunikan nama (BR-01) dan pencatatan audit trail. **Tidak dikerjakan di Phase 1** (instruksi user v1.4); saat dibangun, **wewenang aksi mengikuti pengaturan role (RBAC), bukan role hardcoded**. | P2 (fase berikutnya) | US-008, BR-15, BR-16 |
| **FR-022** | Akses & seluruh aksi modul (Lihat/Tambah/Edit/Nonaktif/Hapus, serta Pulihkan di fase berikutnya) **ditegakkan berdasarkan pengaturan role** (RBAC A18/A53 + Akses Menu A37). | P1 | BR-16 |

## 11. Data Requirements (Spesifikasi Field)

### 11.1 Layar INPUT — Form Tambah/Edit Menu Makanan (Header)
_Trace: FR-005, FR-010, FR-014, FR-015, FR-019_

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `id_menu` | ID Menu | text | Ya | auto, unik | auto-generate | primary key, tidak ditampilkan/diedit user |
| `nama_menu` | Nama Menu Makanan | text | Ya | maks 100 char, **unik** (case-insensitive, trim, **di antara data tidak terhapus**) | manual | BR-01; pemicu pesan error bila duplikat |
| `kategori` | Kategori | dropdown/enum | Ya | salah satu dari 7 nilai enum (§11.6.A) | enum hardcoded | BR-09; tidak boleh free text |
| `bentuk_makanan` | Bentuk Makanan | dropdown/enum | Ya | salah satu dari 5 nilai enum (§11.6.B) | enum hardcoded | BR-10; tipe Cair tunggal; tidak boleh free text |
| `status_aktif` | Status | boolean | Ya | aktif / nonaktif | default **aktif** | konsisten dgn field kanonik `status_aktif` (A1/A6/dll) |
| `keterangan` | Keterangan | text | Tidak | maks 255 char | manual | konsisten dgn field kanonik `keterangan` |
| `is_deleted` | Penanda Terhapus | boolean | Ya | true / false | default **false** | **soft delete (BR-14)**; tidak diedit langsung user, diset oleh aksi Hapus; data true dikecualikan dari list & validasi |
| `deleted_at` | Waktu Dihapus | datetime | Tidak | diisi saat soft delete | sistem | null bila tidak terhapus |
| `deleted_by` | Dihapus Oleh | lookup | Tidak | user A1/A2 | sistem | identitas penghapus (audit); null bila tidak terhapus |

### 11.2 Layar INPUT — Tabel Komposisi Bahan (baris, dalam form yang sama)
_Trace: FR-005, FR-006, FR-008, FR-016, FR-018, FR-020, BR-02/03/04/07/11/13_

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `id_bahan` | Bahan Makanan | lookup | Ya | hanya dari Master Barang Gizi **A6** (aktif) | integrasi/lookup master A6 | BR-03; tidak boleh free text; **boleh muncul di >1 baris bila `diet` berbeda** |
| `diet` | Diet | dropdown/enum | Ya | salah satu dari **20 nilai enum strict** (§11.6.C) | enum hardcoded | BR-11; **tanpa opsi 'Lainnya'/free text** (v1.4); menyimpan kode/label diet |
| `berat_kotor` | Berat Kotor | number | Ya | > 0, desimal | manual | satuan mengikuti field `satuan` |
| `bdd` | BDD (Berat Dapat Dimakan) | number | Ya | > 0, **≤ berat_kotor** (BR-04) | manual | perhitungan otomatis = Out Scope; satuan = field `satuan` |
| `satuan` | Satuan | dropdown/lookup | Ya | hanya dari **Master Satuan & Kemasan (A22)** aktif | lookup master **A22** | BR-13; **dikonfirmasi merujuk A22** (v1.2); berlaku utk berat_kotor & bdd |

> **Catatan v1.4:** field `diet_lainnya` (teks bebas untuk Diet='Lainnya') **DIHAPUS**. Jenis Diet kini strict 20 enum.
>
> **Aturan baris (BR-02, BR-07):** minimal **1 baris**; **kunci keunikan baris = kombinasi (`id_bahan`, `diet`)**. Artinya **bahan yang sama boleh diinput beberapa kali selama nilai Diet berbeda** (dikonfirmasi user v1.3); yang dilarang hanya baris dengan **Bahan + Diet yang identik**.

### 11.3 Layar TAMPIL — Dashboard / List Menu Makanan
_Trace: FR-001..FR-004, FR-019_

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Menu Makanan | `menu.nama_menu` (where `is_deleted=false`) | text | **sort ASC/DESC** (default ASC); **search** | kata kunci pencarian; data terhapus dikecualikan |
| Kategori | `menu.kategori` | text/badge | sort ASC/DESC; **filter by enum (§11.6.A)** | filter dropdown 7 nilai |
| Status | `menu.status_aktif` | badge (Aktif/Nonaktif) | sort ASC/DESC | warna: Aktif=hijau, Nonaktif=abu |
| Aksi | — | tombol (Lihat/Edit/Nonaktif/Hapus) | – | **ditampilkan sesuai pengaturan role** (BR-16); Hapus → konfirmasi → soft delete |
| (footer) Pagination | jumlah data | 10/20/50/100 per halaman | – | FR-004 |

### 11.3b Layar TAMPIL — Data Terhapus (DITUNDA ke Phase 2)
_Trace: FR-021, BR-15 — **tidak dibangun di Phase 1** (instruksi user v1.4); spesifikasi disimpan sebagai acuan fase berikutnya._

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Menu | `menu.nama_menu` (where `is_deleted=true`) | text | search/sort | hanya data terhapus |
| Kategori | `menu.kategori` | text/badge | filter | |
| Dihapus Oleh | `menu.deleted_by` → A1/A2 (`nama`) | text | filter | |
| Waktu Dihapus | `menu.deleted_at` | datetime (dd-mm-yyyy HH:mm) | sort DESC default | |
| Aksi | — | tombol (Pulihkan) | – | **akses & aksi mengikuti pengaturan role (RBAC), bukan role hardcoded** (BR-15/BR-16); validasi nama unik saat restore (BR-15) |

### 11.4 Layar TAMPIL — Detail Menu (komposisi)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Bahan Makanan | join `id_bahan` → Barang Gizi A6 (nama) | text | – | nama bahan dari A6; satu bahan bisa tampil di beberapa baris bila diet beda |
| Diet | `komposisi.diet` | text/badge | filter | tampilkan label diet dari 20 enum baku (§11.6.C) |
| Berat Kotor | `komposisi.berat_kotor` | number + satuan | – | satuan dari A22 |
| BDD | `komposisi.bdd` | number + satuan | – | satuan dari A22 |
| Satuan | join `komposisi.satuan` → Satuan & Kemasan A22 (label) | text | – | label satuan dari A22 |

### 11.5 Layar TAMPIL — Riwayat Aktivitas (Audit Trail)
_Trace: FR-011, BR-06_

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit.timestamp | datetime (dd-mm-yyyy HH:mm) | sort DESC default | |
| User | audit.user → A1/A2 (`nama`) | text | filter | pakai field kanonik `nama` |
| Aksi | audit.action | badge (Tambah/Edit/Nonaktif/**Hapus**) | filter | aksi Hapus = soft delete; badge **Pulihkan** ditambahkan saat fitur restore tersedia (fase berikutnya) |
| Perubahan | audit.diff | text/JSON ringkas | – | [ASUMSI] before/after; utk Hapus catat `is_deleted` false→true |

### 11.6 Nilai Referensi (Enum) — *hardcoded Phase 1*
_Trace: BR-09/10/11/12, FR-014/015/016_

#### A. Kategori Menu (`kategori`) — 7 nilai
| No | Nilai | Catatan |
|----|-------|---------|
| 1 | Makanan Pokok | sumber karbohidrat utama (nasi, bubur, kentang, dll) |
| 2 | Lauk Hewani | protein hewani |
| 3 | Lauk Nabati | protein nabati |
| 4 | Sayur | |
| 5 | Buah | |
| 6 | Snack | makanan selingan |
| 7 | Minuman | |

#### B. Bentuk Makanan (`bentuk_makanan`) — 5 nilai — *tipe Cair tidak dipisah* (instruksi user v1.2) [ASUMSI daftar perlu validasi Ahli Gizi]
Mengikuti tingkatan tekstur diet RS pada umumnya (Penuntun Diet/standar gizi RS). Sesuai instruksi user v1.2, **tipe Cair tidak dipecah** (Jernih/Penuh/Kental) → cukup satu nilai **Cair**.

| No | Nilai | Keterangan |
|----|-------|-----------|
| 1 | Biasa | makanan dengan tekstur normal/padat |
| 2 | Lunak | tekstur lunak, mudah dikunyah & dicerna |
| 3 | Lumat / Lembik | makanan dilumatkan/dihaluskan (mis. tim, lembik) |
| 4 | Saring | makanan disaring/halus tanpa serat kasar |
| 5 | Cair | seluruh makanan/minuman berbentuk cair (jernih, penuh, maupun kental) digabung dalam satu nilai |

> [ASUMSI] Daftar 5 nilai di atas masih perlu **divalidasi Ahli Gizi RS** untuk finalisasi penamaan (mis. apakah perlu memunculkan 'Lumat/Lembik' terpisah dari 'Saring'). Penyederhanaan tipe Cair menjadi satu nilai sudah sesuai instruksi user dan tidak perlu dikonfirmasi ulang.

#### C. Jenis Diet (`diet`) — *hardcoded, 20 nilai strict* (BR-11) — **nilai 'Lainnya' dihapus (v1.4)**
| No | Nilai | Singkatan |
|----|-------|-----------|
| 1 | Rendah Garam | RG |
| 2 | Rendah Protein | RPro |
| 3 | Rendah Lemak | RL |
| 4 | Rendah Karbohidrat | RKH |
| 5 | Rendah Purin | RP |
| 6 | Rendah Sisa | RS |
| 7 | Rendah Vitamin K | RVitK |
| 8 | Rendah Kalium | RK |
| 9 | Rendah Energi | — |
| 10 | Diet Jantung | DJ |
| 11 | Diet Lambung | DL |
| 12 | Diet Hati | DH |
| 13 | Diabetes Melitus | DM |
| 14 | Diet Ginjal | — |
| 15 | DM + Rendah Garam | DMRG |
| 16 | DM + Diet Jantung | DMDJ |
| 17 | Tinggi Protein | TP |
| 18 | Tinggi Serat | TS |
| 19 | Tinggi Kalium | TK |
| 20 | Tinggi Kalori Tinggi Protein | TKTP |

> **Dikonfirmasi (v1.4):** nilai **'Lainnya'** dan mekanisme field teks bebas `diet_lainnya` **DIHAPUS** — Jenis Diet kini strict **20 nilai** di atas, tanpa input bebas. Kebutuhan diet di luar daftar baku ditangani saat migrasi ke **master diet dinamis (fase berikutnya)**, bukan via free text. FR-017 menjadi tidak berlaku.
>
> **Dikonfirmasi (v1.2):** singkatan diet kombinasi **DMRG = DM (Diabetes Melitus) + Rendah Garam** dan **DMDJ = DM (Diabetes Melitus) + Diet Jantung**. Tidak lagi memerlukan konfirmasi.
>
> **Catatan keunikan baris (v1.3):** nilai `diet` inilah yang membedakan baris komposisi. Bahan yang sama (mis. *Beras*) boleh muncul beberapa kali bila Diet-nya berbeda (mis. *Beras* untuk Diet DM dan *Beras* untuk Diet Rendah Garam), tetapi tidak boleh dua baris *Beras* dengan Diet yang sama (BR-07/FR-020).

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| **NFR-001** | Performa | Pencarian & load list menu **< 3 detik** pada volume data wajar RS Tipe C&D (Metrik 3). Query list/pencarian wajib memfilter `is_deleted=false`; pertimbangkan index pada (`is_deleted`, `nama_menu`). |
| **NFR-002** | Usability | Form dapat dioperasikan **mandiri oleh Ahli Gizi non-teknis** (Metrik 2); label berbahasa Indonesia, validasi inline yang jelas; enum & lookup (Satuan A22) disajikan sebagai dropdown ber-label jelas; pesan error duplikat Bahan+Diet jelas pada baris bersangkutan. |
| **NFR-003** | Integritas Data | Keunikan nama menu ditegakkan di level aplikasi **dan** database. Karena soft delete dipakai, **constraint unik `nama_menu` bersifat parsial** (hanya berlaku bila `is_deleted=false`) agar nama yang sama **dapat dipakai ulang** setelah data lama dihapus — **perilaku ini DIKONFIRMASI diinginkan (instruksi user v1.4)**. Keunikan baris komposisi (`id_bahan`,`diet`) divalidasi server-side. Nilai enum (termasuk Diet 20 nilai strict) & referensi Satuan (A22) divalidasi server-side (whitelist/foreign key). |
| **NFR-004** | Auditability | Seluruh perubahan (Tambah/Edit/Nonaktif/Hapus; Pulihkan saat tersedia di fase berikutnya) tersimpan permanen di audit trail (tidak dapat diedit user). |
| **NFR-005** | Keamanan / Otorisasi | Akses modul & seluruh aksi dibatasi via **RBAC (A18/A53)** & Akses Menu (A37) — **wewenang mengikuti pengaturan role**, tidak di-hardcode. Aksi **Hapus** (dan **Pulihkan** pada fase berikutnya) hanya tersedia bagi role yang diberi izin pada pengaturan role (BR-16). |
| **NFR-006** | Ketersediaan | [ASUMSI] Untuk RS dengan internet tidak stabil, operasi master bersifat internal (tidak bergantung layanan eksternal), sehingga tetap dapat diakses selama server SIMRS lokal aktif. |
| **NFR-007** | Konsistensi | Field `status_aktif`, `keterangan`, `nama` mengikuti definisi kanonik lintas-PRD (A1/A2/A6); pola soft delete (`is_deleted`/`deleted_at`/`deleted_by`) sebaiknya selaras dengan konvensi soft delete master lain. Referensi Satuan memakai master kanonik A22. |
| **NFR-008** | Maintainability | Nilai enum (Kategori/Bentuk/Diet) didefinisikan terpusat (mis. konstanta/lookup) agar mudah diubah saat migrasi ke master dinamis pada fase berikutnya tanpa mengubah data tersimpan. Penghapusan opsi 'Lainnya' menyederhanakan validasi Diet menjadi whitelist tertutup. |
| **NFR-009** | Integritas Referensi | Soft delete (BR-14) menjamin record menu yang dirujuk order/pemesanan historis **tidak pernah hilang** dari basis data, sehingga laporan/rekap lama tetap dapat me-resolve nama & komposisi menu (Metrik 6). |

## 13. Integrasi Eksternal

Modul ini **tidak memiliki integrasi sistem eksternal langsung** (BPJS/SATUSEHAT/Disdukcapil) pada Phase 1 — ini adalah master data internal Instalasi Gizi.

### Integrasi Internal (antar-modul SIMRS)
| Dengan | Arah | Tujuan |
|--------|------|--------|
| **Master Barang Gizi (A6)** | A9 ← A6 | Field **Bahan Makanan** (lookup) — sumber data bahan. BR-03 |
| **Master Satuan & Kemasan (A22)** | A9 ← A22 | Nilai **Satuan** komposisi bahan diambil dari master ini (lookup). **Dikonfirmasi (v1.2).** BR-13 |
| **Jenis Diet** | — (enum internal) | Nilai **Diet** kini **hardcoded/enum 20 nilai strict** di modul ini (§11.6.C), bukan master eksternal, dan **tanpa opsi 'Lainnya'** (v1.4). Migrasi ke master dinamis = fase berikutnya bila dibutuhkan. |
| **Role / RBAC (A18/A53) & Akses Menu (A37)** | A9 ← A18/A37/A53 | **Menentukan wewenang seluruh aksi** modul (Lihat/Tambah/Edit/Nonaktif/Hapus; Pulihkan di fase berikutnya) — sesuai pengaturan role, tidak di-hardcode. BR-16, NFR-005 |
| **Order Menu Gizi** (g-service-order-nutrition) | A9 → Gizi | Hanya menu **aktif & tidak terhapus** menjadi pilihan order makanan pasien (BR-05). **Order historis tetap me-resolve menu yang sudah di-soft-delete** (BR-14/NFR-009). |
| **Pemesanan Supplier Barang Gizi** (g-backoffice-inventory-pemesanan) | A9 → Backoffice | Komposisi bahan jadi dasar kebutuhan pemesanan (satuan A22 memudahkan agregasi). |
| **Rekap Order Makanan** (g-support-nutrition-rekap) | A9 → Pendukung | Definisi menu dipakai pada rekap/cetak e-ticket & serah terima; soft delete menjaga rekap historis tetap utuh. |
| **User/Staff (A1/A2)** | A9 ← A1/A2 | Identitas pembuat/pengubah/penghapus pada audit trail & field `deleted_by` (`nama`). |

[PERLU KONFIRMASI] Apakah definisi menu/diet perlu dipetakan ke terminologi SATUSEHAT (mis. diet/nutrition order) untuk interoperabilitas RME di fase berikutnya. Bila ya, enum Jenis Diet (§11.6.C) perlu kolom kode pemetaan ke terminologi standar.

## Asumsi
- [ASUMSI] Kondisi As-Is (penyusunan menu manual via Excel/kertas) diturunkan dari narasi dokumen lampiran dan pola proses gizi terkait, bukan observasi langsung.
- [KONFIRMASI v1.4] Aktor & wewenang: otorisasi seluruh aksi (termasuk Hapus, dan Pulihkan pada fase berikutnya) **mengikuti pengaturan role (RBAC A18/A53 + Akses Menu A37)** — tidak di-hardcode ke role tertentu (BR-16).
- [KONFIRMASI v1.4] Fitur **Pulihkan (restore)** data terhapus & layar **'Data Terhapus'** **ditunda ke fase berikutnya (Phase 2)**; Phase 1 hanya menyimpan penanda soft delete tanpa UI restore.
- [KONFIRMASI v1.4] Nilai Diet **'Lainnya'** dan mekanisme field teks bebas `diet_lainnya` **DIHAPUS**; Jenis Diet kini strict **20 nilai enum** tanpa input bebas — sesuai instruksi user.
- [KONFIRMASI v1.4] Constraint unik `nama_menu` bersifat **parsial** (hanya berlaku untuk data `is_deleted=false`) sehingga nama dapat dipakai ulang setelah data lama di-soft-delete — **perilaku ini dikonfirmasi diinginkan** oleh user.
- [KONFIRMASI v1.3] Aksi **Hapus = soft delete** (`is_deleted=true` + `deleted_at`/`deleted_by`); data tidak dihapus permanen dari DB agar referensi historis order/pemesanan tetap utuh — sesuai instruksi user.
- [KONFIRMASI v1.3] **Satu bahan boleh muncul lebih dari sekali dalam satu menu BILA Jenis Dietnya berbeda**; keunikan baris komposisi = kombinasi (`id_bahan`,`diet`) — sesuai instruksi user.
- [KONFIRMASI v1.2] Bentuk Makanan **tidak memisahkan tipe Cair** (Jernih/Penuh/Kental digabung menjadi satu nilai 'Cair') — sesuai instruksi user.
- [KONFIRMASI v1.2] Singkatan diet kombinasi **DMRG = DM + Rendah Garam** dan **DMDJ = DM + Diet Jantung** — telah dikonfirmasi user.
- [ASUMSI] BDD bernilai > 0 dan ≤ Berat Kotor (logika gizi: bagian dapat dimakan tidak melebihi berat kotor); keduanya memakai Satuan yang sama.
- [KONFIRMASI v1.2] Satuan komposisi **merujuk ke Master Satuan & Kemasan (A22)** — telah dikonfirmasi user.
- [ASUMSI] Enum Kategori/Bentuk/Diet di Phase 1 bersifat hardcoded (perubahan via kode oleh tim teknis); migrasi ke master dinamis = fase berikutnya.
- [ASUMSI] Nonaktif/Hapus menu pada Phase 1 belum mengecek pemakaian di perencanaan menu aktif (validasi tersebut dikerjakan di fitur perencanaan menu — Out Scope); soft delete tetap menjaga integritas referensi.
- [ASUMSI] Audit trail menyimpan before/after perubahan, user (field kanonik `nama` dari A1/A2), waktu, dan aksi (Hapus tercatat; Pulihkan ikut tercatat saat fitur tersedia di fase berikutnya).
- [ASUMSI] Modul tidak bergantung layanan eksternal sehingga tetap dapat dioperasikan saat internet tidak stabil selama server SIMRS lokal aktif (relevan untuk RS Tipe C & D).

## Pertanyaan Terbuka
- Finalisasi penamaan daftar nilai **Bentuk Makanan** bersama Ahli Gizi RS (§11.6.B masih [ASUMSI] untuk penamaan); penyederhanaan tipe Cair menjadi satu nilai sudah final sesuai instruksi user v1.2. [PERLU KONFIRMASI penamaan]
- Adakah toleransi/aturan khusus pada validasi BDD ≤ Berat Kotor (mis. pembulatan), mengingat keduanya sudah memakai Satuan yang sama dari A22? [PERLU KONFIRMASI]
- Pada fase berikutnya saat fitur Pulihkan (restore) dibangun: role spesifik mana (dalam pengaturan role) yang diberi izin restore, dan apakah perlu hak terpisah dari hak Hapus? [PERLU KONFIRMASI fase berikutnya] (FR-021, BR-15/BR-16)
- Karena nilai Diet 'Lainnya' dihapus: bila ada kebutuhan diet baru di luar 20 nilai baku sebelum master dinamis tersedia, bagaimana penanganannya sementara (mis. request penambahan enum oleh tim teknis)? [PERLU KONFIRMASI]
- Perlukah pemetaan menu/diet ke terminologi SATUSEHAT untuk interoperabilitas RME di fase berikut, termasuk kode pemetaan pada enum Diet?