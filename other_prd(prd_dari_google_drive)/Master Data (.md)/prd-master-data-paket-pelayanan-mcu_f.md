# PRD — Master Data: Paket Pelayanan MCU

**Related Document:** Overview_Master_Data_Paket_MCU.md (Tim Product Tamtech International, v1.0, 23 Juni 2026); Related Feature: A44 Control Panel > Master Data > Paket Pelayanan MCU; referensi master item: A10 Tindakan, A13 Procedure, A14 Item Pemeriksaan Laboratorium, A29 Item Pemeriksaan Radiologi, A3 Unit, A23 Spesialisasi & SMF, A-Master Tarif (sumber tarif penunjang lain); referensi proses: g-support-mcu (Order paket MCU), g-admisi-onsite-registration (pemilihan paket saat pendaftaran)
**Versi:** 1.1 - Pengembangan (unik kode+nama, soft delete non-destruktif, import massal + preview di Phase 1, aturan concurrency, indikator markup, rancangan Phase 2 masa berlaku & versioning)

## 1. Overview / Brief Summary

**Modul:** Master Data — Paket Pelayanan Medical Check-Up (MCU)
**Produk:** Neurovi SIMRS v2 — Cluster Control Panel
**Kode Fitur:** A44 (Control Panel > Master Data > Paket Pelayanan MCU)

Layanan Medical Check-Up (MCU) terdiri atas sekumpulan pemeriksaan dari berbagai unit (laboratorium, radiologi, tindakan/pemeriksaan fisik, konsultasi, dan penunjang lain) yang ditawarkan sebagai **satu kesatuan produk** dengan harga tersendiri.

Modul **Master Data Paket MCU** menyediakan fungsi untuk **membundling** beberapa item pemeriksaan lintas unit menjadi satu produk Paket MCU yang memiliki **identitas (kode/nama), komposisi item, dan harga sendiri**. Paket berstatus **Aktif** selanjutnya dapat dipanggil sebagai satu produk pada modul hilir (pendaftaran/layanan, mis. proses *Order paket MCU* pada g-support-mcu).

Ini adalah modul **master data (CRUD)** di Control Panel — bukan modul transaksi. Fokusnya: definisi paket, komposisi item, logika harga (dua mode), pembekuan nilai (snapshot), pengaturan status/ketersediaan, **dan import massal paket dengan preview** untuk mempercepat injeksi data master dalam jumlah banyak. Cocok untuk RS Tipe C & D yang mulai memasarkan paket MCU sebagai produk siap jual tanpa harus menyusun ulang item satu per satu setiap pendaftaran.

**Catatan ruang lingkup rilis:**
- **Phase 1 (rilis ini):** CRUD paket, komposisi lintas unit, dua mode harga, snapshot, status, soft delete, **import massal + preview**.
- **Phase 2 (dirancang, belum diimplementasikan — ditandai `**` pada judul bagian):** **Masa berlaku (tanggal dari–sampai)** & **versioning** paket.

## 2. Background

**Masalah saat ini (As-Is):**
- Belum tersedia mekanisme untuk mendefinisikan paket MCU secara terstruktur di dalam sistem.
- Saat pasien MCU mendaftar, petugas harus memilih item pemeriksaan satu per satu dari berbagai master unit (Lab, Radiologi, Tindakan, dll), rawan terlewat/salah dan tidak konsisten antar pasien. 
- Harga paket tidak baku — penjumlahan tarif dilakukan manual, sulit dikontrol dan tidak dapat dipromosikan sebagai harga produk tunggal.
- Tidak ada satu sumber kebenaran komposisi paket yang dapat dipanggil ulang oleh modul pendaftaran/layanan (lih. *Order paket MCU* pada g-support-mcu, yang menuntut paket sudah terdefinisi).
- **Saat onboarding/go-live, RS bisa memiliki banyak paket sekaligus.** Menginput satu per satu lewat form sangat lambat dan rawan salah ketik.

**Kenapa modul ini perlu (To-Be):**
- Memungkinkan pengguna master data membuat/mengubah/mengelola Paket MCU sebagai satu produk: komposisi lintas unit, penetapan harga via dua mode, dan status ketersediaan.
- **Memungkinkan injeksi data master paket dalam jumlah banyak melalui import (CSV/XLSX) dengan tahap preview**, sehingga tidak perlu input satu per satu.
- Memberi modul hilir referensi paket siap pakai, sehingga proses *Order paket MCU* (g-support-mcu) tinggal memanggil paket aktif.
- Menjaga integritas harga historis lewat **snapshot** nilai akumulasi saat simpan, sehingga perubahan tarif master di kemudian hari tidak diam-diam mengubah harga paket tersimpan.

**Konteks RS Tipe C & D:** SDM terbatas → master paket + import massal mengurangi kerja manual berulang & risiko salah input saat pendaftaran MCU. Operasi modul dirancang **tahan terhadap koneksi internet tidak stabil** (bersifat internal/intranet, tanpa kebutuhan integrasi eksternal real-time).

## 3. In Scope

### 3.1 Scope Definition (Phase 1 — yang dikerjakan)
- **CRUD Paket MCU**: pembuatan & pengubahan header paket beserta komposisi item.
- **Picker komposisi item lintas unit**: menarik item dari master Laboratorium (A14), Radiologi (A29), Tindakan/Pemeriksaan (A10), Procedure (A13), Konsultasi/DPJP (referensi A23 Spesialisasi & SMF), dan penunjang lain (mis. EKG, treadmill, spirometri, audiometri) yang saat ini bersumber dari **master tarif layanan**
- **Dua mode harga**: (A) Akumulasi Tarif (default), (B) Harga Paket Manual.
- **Perhitungan total akumulasi tarif** otomatis berdasarkan komposisi item (Tarif satuan × Qty, dijumlah).
- **Indikator selisih (markup/diskon)**: sistem menginformasikan selisih `harga_paket` − `total_akumulasi_tarif`.
- **Pembekuan (snapshot)** nilai akumulasi pada saat paket disimpan.
- **Pengaturan status** Aktif/Non-aktif.
- **Penanda ketersediaan** agar paket aktif dapat dipanggil modul pendaftaran/layanan.
- **Keunikan ganda**: paket unik berdasarkan **`kode_paket` DAN `nama_paket`** (tidak boleh duplikat keduanya).
- **Soft delete** (penghapusan non-destruktif). **Hard delete tidak diperkenankan.**
- **Import massal paket (CSV/XLSX) dengan tahap PREVIEW** sebelum proses: unggah → validasi per baris → preview (baris valid vs error/duplikat) → konfirmasi proses **atau** batal. Tujuan: injeksi data master banyak paket sekaligus.
- **List/pencarian paket** di Control Panel (turunan standar master data). [ASUMSI]

### 3.2 Out of Scope
| Item | Keterangan | Penanggung jawab |
|---|---|---|
| Auto-generate order saat paket dipilih | Pembentukan order pemeriksaan dari komposisi paket terjadi di **pendaftaran** (dikonfirmasi user) | Modul Pendaftaran/Order |
| Alokasi pendapatan per unit & jurnal | Breakdown pendapatan per item/unit untuk akuntansi | Modul Billing/Casemix |
| Harga per penjamin | Tidak diakomodasi; berlaku **harga tunggal untuk semua tipe pembayaran** | — |
| Filter gender/usia pada paket | Tidak diakomodasi | — |
| Duplicate/clone paket | Tidak diakomodasi | — |
| Mapping LOINC/SatuSehat/FHIR di level paket | Tidak diakomodasi; terminologi melekat pada item komponen saat order terbentuk | — |
| **Hard delete** | Tidak diperkenankan sama sekali; hanya soft delete/non-aktif | — |

### 3.3 **Rancangan Phase 2 (di luar rilis Phase 1)**
> Bagian ini **dirancang sekarang** namun **dikerjakan di Phase 2**. Lihat detail pada Section 14.
| Item | Keterangan |
|---|---|
| **Masa berlaku (tanggal dari–sampai)** | Paket punya periode aktif efektif `berlaku_mulai`–`berlaku_sampai`; paket hanya valid dipanggil modul hilir dalam rentang tersebut. |
| **Versioning paket** | Riwayat versi paket (mis. komposisi/harga berubah → versi baru), sehingga order historis tetap merujuk versi saat transaksi. |

## 4. Goals and Metrics

**Tujuan:** Memungkinkan pengguna master data membuat, mengubah, mengelola, **dan meng-import secara massal** Paket MCU — komposisi item lintas unit, penetapan harga dua mode, dan pengaturan status ketersediaan — agar paket dapat digunakan sebagai satu produk pada modul hilir (pendaftaran MCU).

| Goal | Metrik | Target |
|---|---|---|
| Paket MCU dapat didefinisikan terstruktur | Jumlah paket MCU aktif terdefinisi di master | ≥ 1 paket aktif siap pakai setelah go-live [ASUMSI] |
| **Percepatan injeksi data master via import** | Jumlah paket yang dapat di-import dalam 1 proses | ≥ 50 baris/proses tervalidasi & ter-preview [ASUMSI — disesuaikan] |
| **Akurasi import** | % baris valid yang berhasil diproses tepat setelah preview di-konfirmasi | 100% baris yang ditandai valid tersimpan; 0 baris error ikut tersimpan |
| Mengurangi kerja manual pemilihan item saat pendaftaran MCU | Waktu rata-rata pemilihan layanan MCU di pendaftaran | Turun dari pilih item satu-per-satu → **< 1 menit** pilih 1 paket [ASUMSI — disesuaikan, perlu validasi lapangan] |
| **Adopsi paket di pendaftaran MCU** | % pendaftaran MCU memakai paket terdefinisi (bukan item lepas) | **≥ 90% dalam 3 bulan setelah go-live** [ASUMSI — disesuaikan] |
| Integritas harga historis | Perubahan tarif master TIDAK mengubah harga paket tersimpan tanpa re-save | 100% snapshot terjaga (uji BR-006) |
| Akurasi perhitungan akumulasi | Selisih total akumulasi vs jumlah subtotal manual | 0 (otomatis) |
| Kontrol margin | Selisih (markup/diskon) tampil & dapat dipantau manajemen | 100% paket menampilkan indikator selisih |
| Kemudahan & keamanan pengelolaan | Paket dapat dinonaktifkan/diaktifkan & soft-delete tanpa kehilangan riwayat pelayanan | 100% non-destruktif; 0 kehilangan/error data history |

## 5. Related Feature

**Fitur ini:** `[A44]` Control Panel > Master Data > Paket Pelayanan MCU.

**Master data sumber komposisi item (dependency picker):**
- `[A14]` Item Pemeriksaan Laboratorium (Integrasi SATUSEHAT/BPJS V2)
- `[A29]` Item Pemeriksaan Radiologi (Integrasi SATUSEHAT/BPJS V2)
- `[A10]` Tindakan (Integrasi BPJS V2)
- `[A13]` Procedure (Integrasi SATUSEHAT/BPJS V1 V2)
- `[A23]` Spesialisasi & SMF — referensi item Konsultasi/DPJP
- `[A3]` Unit — sumber field `unit` (sumber unit item)
- **Master Tarif** — sumber item & tarif **penunjang lain** (EKG, treadmill, spirometri, audiometri) yang saat ini belum punya master tersendiri [PERLU KONFIRMASI nama master/kode fitur]

**Master pendukung:**
- `[A20]` Tipe Penjamin — relevan walau harga paket tunggal lintas penjamin (Out Scope harga per penjamin)
- `[A1]` User / `[A2]` Staff / `[A53]` RBAC — pencatat audit (created_by/updated_by) & kontrol akses import/CRUD

**Template & utilitas import (Phase 1):**
- **Template Import Paket MCU (CSV/XLSX)** — diunduh dari menu ini; format kolom lihat Section 11.F.

**Modul hilir yang mengonsumsi paket (bukan bagian modul ini):**
- Pendaftaran/Admisi — pemilihan paket MCU aktif saat registrasi; **pembentukan order dari komposisi paket terjadi di pendaftaran** (dikonfirmasi user). (lih. g-admisi-onsite-registration: "Pilih poli dan dokter" → analog pilih paket).
- Pelayanan Pendukung — proses **Order paket MCU** & **Print bundle hasil MCU** (g-support-mcu).
- Billing/Casemix — pemakaian harga paket (alokasi pendapatan per unit = Out Scope).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [tidak ada BPMN khusus A44; diturunkan dari overview + analogi g-admisi/g-support-mcu]
1. Tidak ada definisi paket MCU di sistem.
2. Saat pasien MCU mendaftar, petugas memilih item pemeriksaan satu per satu dari tiap master unit.
3. Total tarif dijumlah manual; tidak ada harga produk paket yang baku.
4. Komposisi tidak konsisten antar pasien dan tidak dapat dipanggil ulang.
5. Saat onboarding banyak paket, input dilakukan satu per satu (lambat, rawan salah). [ASUMSI]

### B. To-Be (kondisi diharapkan) — turunan dari overview
**Proses 1 — Definisi Paket manual (modul ini, A44):**
1. Pengguna master data membuka menu Master Data > Paket Pelayanan MCU.
2. Klik *Tambah Paket* → isi header (Kode, Nama, Deskripsi, Status).
3. Buka picker komposisi → pilih item lintas unit (Lab/Radiologi/Tindakan/Procedure/Konsultasi/Penunjang), atur Qty.
4. Sistem menghitung **Total Akumulasi Tarif** secara live (Σ Tarif satuan × Qty).
5. Pilih **Mode Harga**: A (Akumulasi, default) atau B (Manual).
   - Mode A → Harga Paket MCU = total akumulasi (read-only).
   - Mode B → Harga Paket MCU diinput manual; akumulasi tampil sebagai pembanding **+ selisih (markup/diskon)**.
6. Klik *Simpan* → sistem **memvalidasi keunikan `kode_paket` DAN `nama_paket`** + komposisi ≥ 1 → bila lolos **membekukan (snapshot)** nilai akumulasi & harga final ke basis data.
7. Atur status Aktif → paket tersedia untuk modul hilir.

**Proses 2 — Import massal paket (modul ini, A44 — Phase 1):**
1. Pengguna mengunduh **template** CSV/XLSX.
2. Mengisi banyak paket sekaligus (header + komposisi) lalu **unggah** file.
3. Sistem **mem-parsing & memvalidasi tiap baris** (format, keunikan kode+nama, item valid, qty ≥ 1, dst).
4. Sistem menampilkan **PREVIEW**: ringkasan baris valid vs baris error/duplikat (beserta alasan).
5. **Decision — Lanjut proses?**
   - *OK / Proses* → hanya baris valid disimpan (snapshot dihitung saat simpan); baris error dilewati & dilaporkan.
   - *Batal* → tidak ada data tersimpan.
6. Sistem menampilkan **ringkasan hasil** (X tersimpan, Y dilewati + alasan).

**Proses 3 — Pemeliharaan:**
- Edit paket → akumulasi dihitung ulang dari tarif master terkini → snapshot diperbarui saat simpan ulang. **Penguncian optimistik** mencegah dua user saling timpa (lih. NFR-010).
- Toggle Non-aktif → paket tidak muncul di pilihan modul hilir, data tetap tersimpan.
- Soft delete → paket hilang dari daftar & pilihan; **riwayat pelayanan/order sebelumnya tetap utuh tanpa hilang/error**; **hard delete tidak diperkenankan**.

**Konsumsi oleh modul hilir (referensi, di luar modul ini):**
- Pendaftaran memilih paket aktif → **pembentukan order per komponen terjadi di pendaftaran** (g-support-mcu: *Order paket MCU*).

### C. **To-Be Phase 2 (dirancang, belum diimplementasikan)**
- **Masa berlaku**: saat simpan/edit, pengguna mengisi `berlaku_mulai`–`berlaku_sampai`; modul hilir hanya menampilkan paket yang aktif **dan** dalam rentang tanggal berlaku.
- **Versioning**: perubahan komposisi/harga membuat **versi baru**; order historis tetap merujuk versi pada saat transaksi (immutability harga historis di luar mekanisme snapshot per-transaksi). Lihat Section 14.

## 7. Main Flow / Mindmap

Narasi alur per skenario (tidak ada BPMN A44; diturunkan dari overview & analogi g-support-mcu / g-admisi-onsite-registration — [ASUMSI]).

**Skenario 1 — Buat Paket MCU baru (happy path):**
1. Aktor: Pengguna Master Data (Admin Control Panel) membuka menu *Paket Pelayanan MCU*.
2. Klik **Tambah Paket** → form header tampil.
3. Isi `kode_paket` (unik, maks 20 char alfanumerik), `nama_paket` (unik), `deskripsi` (opsional).
4. Buka **picker komposisi** → cari & pilih item dari master unit (A14/A29/A10/A13/konsultasi/penunjang). Tiap item tampil: nama, sumber unit, tarif satuan, qty (default 1), subtotal.
5. Tambah/kurangi item & ubah `qty` → **Total Akumulasi Tarif** dihitung ulang live.
6. Pilih **Mode Harga**:
   - **Decision: Mode Harga?** → *Akumulasi Tarif* (A, default): `harga_paket` = total akumulasi, read-only.
   - → *Harga Paket Manual* (B): input `harga_paket` manual; akumulasi tampil sebagai pembanding **+ selisih (markup/diskon)**.
7. Set `status` (default Aktif).
8. Klik **Simpan** → **Decision: Validasi lolos?**
   - Tidak → tampilkan pesan error spesifik (kode duplikat / **nama duplikat** / komposisi kosong / harga kosong / qty < 1) → kembali ke langkah edit.
   - Ya → sistem **snapshot** `total_akumulasi_tarif` & `harga_paket` → simpan → event *Paket MCU tersimpan*.
9. Paket Aktif siap dipanggil modul pendaftaran/layanan.

**Skenario 2 — Edit paket & refresh snapshot:**
1. Buka paket existing → sistem menangkap token versi (`updated_at`/`row_version`) untuk concurrency.
2. Akumulasi **dihitung ulang** dari tarif master terkini.
3. Ubah komposisi/qty/mode/harga → Simpan → **Decision: token versi masih sama?** Jika berubah (user lain sudah menyimpan) → tolak + minta muat ulang (NFR-010); jika sama → snapshot diperbarui.

**Skenario 3 — Import massal paket (Phase 1):**
1. Klik **Import** → unduh **template** (bila perlu).
2. **Unggah** file CSV/XLSX berisi banyak paket (header + komposisi).
3. Sistem **parse & validasi tiap baris** → **PREVIEW**: tabel baris valid (hijau) & baris error/duplikat (merah + alasan), plus ringkasan jumlah.
4. **Decision: Proses?**
   - **OK / Proses** → simpan hanya baris valid (snapshot saat simpan) → tampilkan **ringkasan hasil** (X tersimpan, Y dilewati).
   - **Batal** → keluar tanpa menyimpan apa pun.
5. (Opsional) unduh laporan baris yang gagal untuk diperbaiki & diunggah ulang. [ASUMSI]

**Skenario 4 — Non-aktifkan / Aktifkan:**
1. Toggle `status` → Non-aktif → paket tidak muncul di pilihan modul hilir, tetap tersimpan & bisa diaktifkan kembali.

**Skenario 5 — Soft delete (hard delete tidak diperkenankan):**
1. Klik Hapus → konfirmasi → paket di-soft-delete (hilang dari daftar/pilihan).
2. **Riwayat pelayanan/order yang sudah pernah memakai paket tetap utuh** (tidak hilang, tidak error). Tidak ada opsi hapus permanen.

**Skenario 6 (referensi, di luar modul) — Order paket MCU (g-support-mcu):**
1. Saat **pendaftaran**, paket Aktif dipilih → **pembentukan order komponen terjadi di pendaftaran** → *Print bundle hasil MCU*.

**Skenario 7 — **Phase 2: paket dengan masa berlaku & versioning** (dirancang):**
1. Saat simpan, isi `berlaku_mulai`–`berlaku_sampai`. Modul hilir hanya menampilkan paket aktif **dan** dalam rentang berlaku.
2. Perubahan komposisi/harga membuat **versi baru** paket; versi lama disimpan untuk referensi order historis. Lihat Section 14.

## 8. Business Rules

| ID | Aturan | Sumber |
|---|---|---|
| **BR-001** | `kode_paket` wajib & **unik**, maks **20 karakter alfanumerik** (huruf+angka boleh). | Overview §4; konfirmasi user |
| **BR-001b** | `nama_paket` juga wajib **unik**. Paket dianggap duplikat bila **kode_paket ATAU nama_paket** bertabrakan dengan paket lain yang belum soft-deleted → tolak simpan/import. | Konfirmasi user |
| **BR-001c** | Keunikan **dievaluasi terhadap paket yang belum di-soft-delete**. Karena hard delete tidak diperkenankan, kode/nama dari paket soft-deleted tetap dipertahankan; bila terjadi tabrakan dengan paket soft-deleted, sistem **memperingatkan** dan menyarankan mengaktifkan/memulihkan paket lama alih-alih membuat duplikat. [ASUMSI penanganan] |
| **BR-002** | Sebuah paket **wajib memiliki ≥ 1 item** komposisi sebelum dapat disimpan (manual maupun import). | Konfirmasi user |
| **BR-003** | `qty` per item default 1, **boleh > 1**, harus bilangan bulat positif (≥ 1). | Overview §5.2 |
| **BR-004** | `subtotal` item = `tarif_satuan` × `qty`; **Total Akumulasi Tarif** = Σ subtotal. Dihitung ulang otomatis tiap item ditambah/dikurangi/qty diubah selama sesi edit. | Overview §5.3 |
| **BR-005** | **Mode Harga** wajib dipilih (default **Akumulasi**). Mode A → `harga_paket` = total akumulasi, read-only. Mode B → `harga_paket` diinput manual (flat), akumulasi tetap tampil sebagai pembanding. | Overview §6 |
| **BR-005b** | Sistem **menampilkan selisih (markup/diskon)** = `harga_paket` − `total_akumulasi_tarif`. Nilai positif = markup, negatif = diskon. Bersifat informatif (tidak memblok simpan). | Konfirmasi user |
| **BR-006** | **Snapshot**: nilai `total_akumulasi_tarif` (dan pada Mode A juga `harga_paket`) **dibekukan saat Simpan**. Perubahan tarif master unit setelahnya **tidak** otomatis mengubah nilai tersimpan; akumulasi hanya dihitung ulang saat paket dibuka & disimpan ulang. | Overview §6.3 |
| **BR-007** | **Harga tunggal**: berlaku satu harga paket untuk **semua tipe penjamin/pembayaran**. Tidak ada harga per penjamin. | Overview §3.2 |
| **BR-008** | Hanya paket berstatus **Aktif** yang muncul sebagai pilihan di modul pendaftaran/layanan. Paket **Non-aktif** tetap tersimpan, tidak muncul di modul hilir, dapat diaktifkan kembali. | Overview §7 |
| **BR-009** | **Soft delete (non-destruktif)**: paket yang dihapus tidak hilang permanen, tidak muncul di daftar/pilihan. **Riwayat pelayanan/order sebelumnya tetap utuh — tanpa hilang/error.** | Overview §7; konfirmasi user |
| **BR-010** | **Hard delete tidak diperkenankan** untuk paket apa pun. Penghapusan hanya melalui soft delete; non-aktif untuk menyembunyikan dari modul hilir. | Konfirmasi user |
| **BR-011** | `harga_paket`, `tarif_satuan`, `subtotal`, `total_akumulasi_tarif` adalah **Rupiah penuh tanpa sen/pecahan** (mis. Rp20.000). Disimpan sebagai bilangan bulat (integer rupiah). ≥ 0. | Konfirmasi user |
| **BR-012** | Item komposisi yang sumbernya (master unit/tarif) telah dinonaktifkan/dihapus → ditandai/diperingatkan saat edit; tidak boleh dihitung sebagai item aktif baru. | [ASUMSI] |
| **BR-013** | Mapping terminologi (LOINC/SATUSEHAT/FHIR) **tidak** dilakukan di level paket; melekat pada item komponen saat order terbentuk. | Overview §3.2 |
| **BR-014 (Import)** | Import diproses **hanya setelah preview dikonfirmasi (OK/Proses)**. Pilihan **Batal** → tidak ada baris tersimpan (all-or-nothing terhadap keputusan konfirmasi). | Konfirmasi user |
| **BR-015 (Import)** | Pada proses import, **hanya baris valid** yang disimpan; baris error/duplikat **dilewati** dan dilaporkan dengan alasan. Validasi tiap baris memenuhi BR-001/001b/002/003/005/011. | Konfirmasi user |
| **BR-016 (Import)** | **Duplikat di dalam file** (kode/nama berulang antar baris) maupun **duplikat terhadap data existing** → ditandai error di preview, tidak diproses. | Konfirmasi user |
| **BR-017 (Concurrency)** | Editing paket memakai **penguncian optimistik**: token versi (`updated_at`/`row_version`) ditangkap saat buka; bila berubah saat simpan → simpan ditolak dengan pesan "data telah diubah pengguna lain, muat ulang". | Konfirmasi user; NFR-010 |
| **BR-018** *(Phase 2)* | **Masa berlaku**: bila `berlaku_mulai`/`berlaku_sampai` diisi, paket hanya valid dipanggil modul hilir dalam rentang tersebut (selain harus Aktif). `berlaku_sampai` ≥ `berlaku_mulai`. | Rancangan Phase 2 |
| **BR-019** *(Phase 2)* | **Versioning**: perubahan komposisi/harga menghasilkan versi baru; order historis tetap merujuk versi saat transaksi. | Rancangan Phase 2 |

## 9. User Stories

| ID | User Story | Sumber/Traceability |
|---|---|---|
| **US-001** | Sebagai **Pengguna Master Data**, saya ingin **membuat Paket MCU baru dengan kode (maks 20 alfanumerik), nama, dan deskripsi**, agar paket memiliki identitas yang dapat direferensikan order/billing. | Overview §4; BR-001 |
| **US-002** | Sebagai Pengguna Master Data, saya ingin **memilih item pemeriksaan lintas unit (Lab/Radiologi/Tindakan/Procedure/Konsultasi/Penunjang) lewat satu picker**, agar tidak perlu berpindah-pindah master. | Overview §5.1; analogi g-support-mcu |
| **US-003** | Sebagai Pengguna Master Data, saya ingin **mengatur Qty per item dan melihat subtotalnya**, agar item yang dibutuhkan berulang terhitung benar. | Overview §5.2 |
| **US-004** | Sebagai Pengguna Master Data, saya ingin **melihat Total Akumulasi Tarif terhitung otomatis & live saat mengedit komposisi**, agar tahu nilai paket tanpa hitung manual. | Overview §5.3 |
| **US-005** | Sebagai Pengguna Master Data, saya ingin **memilih mode harga Akumulasi atau Manual**, agar bisa menjual paket sesuai strategi. | Overview §6.1 |
| **US-006** | Sebagai Pengguna Master Data, saya ingin **akumulasi & selisih (markup/diskon) ditampilkan pada mode Manual**, agar tahu margin harga jual vs tarif. | Overview §6.2; BR-005b |
| **US-007** | Sebagai Pengguna Master Data, saya ingin **nilai akumulasi dibekukan saat simpan (snapshot)**, agar harga paket tidak berubah diam-diam ketika tarif master direvisi. | Overview §6.3 |
| **US-008** | Sebagai Pengguna Master Data, saya ingin **mengaktifkan/menonaktifkan paket**, agar hanya paket siap jual yang muncul di pendaftaran. | Overview §7 |
| **US-009** | Sebagai Pengguna Master Data, saya ingin **menghapus paket secara non-destruktif (soft delete) tanpa kehilangan riwayat pelayanan sebelumnya**, agar data historis tetap aman. Saya **tidak** memerlukan hard delete. | Overview §7; BR-009/010 |
| **US-010** | Sebagai Pengguna Master Data, saya ingin **mencari/memfilter daftar paket (kode/nama/status)**, agar cepat menemukan paket yang akan diedit. | [ASUMSI] |
| **US-011** | Sebagai Pengguna Master Data, saya ingin **sistem mencegah paket duplikat berdasarkan kode maupun nama**, agar tidak ada paket kembar yang membingungkan modul hilir. | BR-001/001b |
| **US-012 (Import)** | Sebagai Pengguna Master Data, saya ingin **mengunduh template lalu meng-import banyak paket sekaligus**, agar tidak perlu menginput data master satu per satu. | Overview §3.1; konfirmasi user |
| **US-013 (Import)** | Sebagai Pengguna Master Data, saya ingin **melihat preview hasil validasi import (baris valid vs error/duplikat) sebelum diproses**, agar bisa memutuskan **lanjut proses atau batal**. | BR-014/015/016 |
| **US-014 (Import)** | Sebagai Pengguna Master Data, saya ingin **ringkasan hasil import (jumlah tersimpan & dilewati beserta alasan)**, agar tahu baris mana yang perlu diperbaiki. | BR-015 |
| **US-015 (Concurrency)** | Sebagai Pengguna Master Data, saya ingin **diperingatkan bila paket yang saya edit sudah diubah pengguna lain**, agar perubahan tidak saling menimpa. | BR-017; NFR-010 |
| **US-016** | Sebagai **Petugas Pendaftaran (modul hilir)**, saya ingin **memilih satu Paket MCU aktif saat registrasi pasien MCU**, agar seluruh komponen pemeriksaan & harga ter-set sekaligus (**order terbentuk di pendaftaran**). | Analogi g-admisi [di luar scope A44] |
| **US-017** *(Phase 2)* | Sebagai Pengguna Master Data, saya ingin **menetapkan masa berlaku paket & menyimpan versi paket**, agar paket kedaluwarsa otomatis tidak terpakai dan order historis tetap merujuk versi yang benar. | Rancangan Phase 2; Section 14 |

## 10. Functional Requirements

Traceability: BPMN A44 tidak ada → diturunkan dari overview + analogi g-support-mcu ("Order paket MCU", "Buka menu MCU", "Simpan data") & g-admisi.

| ID | Functional Requirement | Terkait |
|---|---|---|
| **FR-001** | Sistem menyediakan **menu Master Data > Paket Pelayanan MCU** dengan daftar paket (kode, nama, mode harga, harga, **selisih**, status) + aksi Tambah/Edit/Aktif-Nonaktif/Hapus/**Import**. | US-001,008,009,010,012 |
| **FR-002** | Sistem menyediakan **form header paket**: `kode_paket` (unik, maks 20 alfanumerik), `nama_paket` (unik), `deskripsi`, `status`. Validasi keunikan **kode DAN nama** saat simpan (BR-001/001b). | US-001,011; BR-001/001b |
| **FR-003** | Sistem menyediakan **picker komposisi item** yang menarik item dari master Lab (A14), Radiologi (A29), Tindakan (A10), Procedure (A13), Konsultasi/SMF (A23), dan **penunjang lain dari master tarif**; dapat dicari & difilter per sumber unit. | US-002; Overview §5.1 |
| **FR-004** | Untuk tiap baris item komposisi, sistem menampilkan: nama item, sumber unit, `tarif_satuan` (referensi dari master), `qty` (default 1, editable), `subtotal` (auto). | US-002,003 |
| **FR-005** | Sistem menghitung **Total Akumulasi Tarif = Σ(tarif_satuan × qty)** secara **live** setiap item ditambah/dihapus atau qty diubah. | US-004; BR-004 |
| **FR-006** | Sistem menyediakan pilihan **Mode Harga (A/B, default A)**. Mode A: `harga_paket` = total akumulasi, read-only. Mode B: `harga_paket` input manual; akumulasi & **selisih (markup/diskon)** tetap ditampilkan. | US-005,006; BR-005/005b |
| **FR-007** | Saat **Simpan**, sistem **membekukan (snapshot)** `total_akumulasi_tarif` ke DB; pada Mode A `harga_paket` juga mengikuti snapshot. Perubahan tarif master setelahnya tidak mengubah nilai tersimpan. | US-007; BR-006 |
| **FR-008** | Saat paket **dibuka untuk diedit**, sistem **menghitung ulang** akumulasi dari tarif master terkini, **menangkap token versi** untuk concurrency, dan menyimpan ulang snapshot saat disimpan. | US-007,015; BR-006,017 |
| **FR-009** | Sistem menerapkan **harga tunggal lintas penjamin** (tidak ada harga per tipe penjamin). | BR-007 |
| **FR-010** | Sistem menyediakan **toggle Aktif/Non-aktif**; hanya paket Aktif yang terekspos ke modul pendaftaran/layanan. | US-008; BR-008 |
| **FR-011** | Sistem menyediakan **soft delete non-destruktif**; paket terhapus tidak muncul di daftar/pilihan namun **data & riwayat pelayanan/order tetap utuh tanpa error**. **Hard delete tidak disediakan.** | US-009; BR-009/010 |
| **FR-012** | Sistem **mencatat audit** (created_by/at, updated_by/at, deleted_by/at) pada setiap perubahan/penghapusan paket & pada proses import. | [ASUMSI]; analogi g-emr "Catat audit log" |
| **FR-013** | Sistem **memvalidasi** sebelum simpan: kode unik (≤20 alfanumerik), **nama unik**, komposisi ≥ 1 item, qty ≥ 1, harga ≥ 0 (rupiah penuh), mode terpilih; tampilkan pesan error spesifik bila gagal. | BR-001,001b,002,003,005,011 |
| **FR-014** | Sistem **mengekspos paket Aktif** sebagai daftar produk yang dapat dipanggil modul pendaftaran/layanan (API/lookup internal). **Pembentukan order dari komposisi terjadi di pendaftaran** (Modul Order). | BR-008; Overview §3.2 |
| **FR-015** | Sistem memperingatkan bila item komposisi merujuk master unit/tarif yang sudah non-aktif/terhapus saat edit. | BR-012 [ASUMSI] |
| **FR-016** | Sistem menampilkan **indikator selisih (markup/diskon)** = `harga_paket` − `total_akumulasi_tarif` pada form & list. | US-006; BR-005b |
| **FR-017 (Import)** | Sistem menyediakan **unduh template Import Paket MCU (CSV/XLSX)** dengan kolom & contoh isian (Section 11.F). | US-012 |
| **FR-018 (Import)** | Sistem menerima **unggah file CSV/XLSX** (maks ukuran/jumlah baris [PERLU KONFIRMASI]), mem-parsing menjadi baris-baris kandidat paket + komposisi. | US-012 |
| **FR-019 (Import — Validasi)** | Sistem **memvalidasi tiap baris**: format kolom, `kode_paket` ≤20 alfanumerik & unik, `nama_paket` unik, item valid & ada di master, qty ≥ 1, harga rupiah penuh ≥ 0, **duplikat dalam-file** & **terhadap existing**. | BR-015,016 |
| **FR-020 (Import — Preview)** | Sistem menampilkan **PREVIEW** sebelum proses: tabel baris **valid** vs **error/duplikat** (dengan alasan per baris) + ringkasan jumlah. Pengguna memilih **Proses** atau **Batal**. | US-013; BR-014 |
| **FR-021 (Import — Proses)** | Pada **Proses**, sistem menyimpan **hanya baris valid** (snapshot dihitung saat simpan) dan **melewati** baris error; menampilkan **ringkasan hasil** (X tersimpan, Y dilewati + alasan). Pada **Batal**, tidak ada yang tersimpan. | US-013,014; BR-014,015 |
| **FR-022 (Import — Laporan gagal)** | Sistem menyediakan **unduh daftar baris gagal** beserta alasan untuk diperbaiki & diunggah ulang. [ASUMSI] | US-014 |
| **FR-023 (Concurrency)** | Sistem menerapkan **optimistic locking**: bila token versi paket berubah antara buka & simpan, simpan ditolak dengan pesan jelas & opsi muat ulang. | US-015; BR-017; NFR-010 |
| **FR-024** *(Phase 2)* | Sistem menyediakan field **`berlaku_mulai`/`berlaku_sampai`** & logika validitas rentang; modul hilir hanya menampilkan paket Aktif **dan** dalam rentang berlaku. | US-017; BR-018; Section 14 |
| **FR-025** *(Phase 2)* | Sistem menyimpan **versi paket**; perubahan komposisi/harga membuat versi baru, versi lama dipertahankan untuk referensi order historis. | US-017; BR-019; Section 14 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Header Paket MCU (FR-002, FR-006, FR-007, FR-016)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `kode_paket` | Kode Paket | text | Ya | **unik**, **maks 20 char, alfanumerik (huruf+angka)** | manual | Identitas referensi order/billing (BR-001) |
| `nama_paket` | Nama Paket | text | Ya | **unik**, maks 100 char | manual | Tidak boleh duplikat (BR-001b); konsisten dgn field kanonik `nama` |
| `deskripsi` | Deskripsi | text (panjang) | Tidak | maks 500 char [ASUMSI] | manual | Keterangan singkat paket |
| `mode_harga` | Mode Harga | dropdown/enum | Ya | `AKUMULASI` / `MANUAL` | enum, default `AKUMULASI` | Menentukan perilaku `harga_paket` (BR-005) |
| `total_akumulasi_tarif` | Total Akumulasi Tarif | number (Rp penuh) | Auto | read-only, integer ≥ 0, tanpa sen | auto Σ(subtotal) | Dibekukan saat simpan (BR-006) |
| `harga_paket` | Harga Paket MCU | number (Rp penuh) | Ya | integer ≥ 0, tanpa sen; read-only bila AKUMULASI, input bila MANUAL | mode A: auto = akumulasi; mode B: manual | Harga final, tunggal lintas penjamin (BR-007/011) |
| `selisih` | Selisih (Markup/Diskon) | number (Rp penuh) | Auto | = `harga_paket` − `total_akumulasi_tarif` | auto | + markup / − diskon; informatif (BR-005b) |
| `status_aktif` | Status | boolean | Ya | aktif / nonaktif | default aktif | Field kanonik `status_aktif` (konsisten lintas master). BR-008 |

### B. Layar INPUT — Baris Item Komposisi (picker, FR-003, FR-004)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `item_id` | Item Pemeriksaan | lookup | Ya | harus item valid dari master | lookup A14/A29/A10/A13/A23/master tarif | Pilih via picker lintas unit; paket wajib ≥ 1 item (BR-002) |
| `nama_item` | Nama Item | text | Auto | – | dari master item | Tampil read-only |
| `unit` | Sumber Unit | dropdown(lookup) | Auto | dari master Unit (A3) | lookup A3 | **Field kanonik `unit`** — reuse definisi A3 |
| `tarif_satuan` | Tarif Satuan | number (Rp penuh) | Auto | integer ≥ 0, read-only, tanpa sen | dari master tarif item | Referensi; basis subtotal |
| `qty` | Qty | number (int) | Ya | bilangan bulat ≥ 1 | default 1 | Boleh > 1 (BR-003) |
| `subtotal` | Subtotal | number (Rp penuh) | Auto | = tarif_satuan × qty, read-only | auto | BR-004 |

> Catatan picker: difilter berdasarkan sumber unit (Lab/Radiologi/Tindakan/Procedure/Konsultasi/Penunjang lain) & dicari per nama/kode item.

### C. Layar TAMPIL — List/Dashboard Paket MCU (FR-001)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Total Paket Aktif | count paket where status_aktif=true & not deleted | angka besar (kartu) | – | ringkasan |
| Kode Paket | paket_mcu.kode_paket | text | sort A-Z, filter cari | unik |
| Nama Paket | paket_mcu.nama_paket | text | sort A-Z, filter cari | unik |
| Jml Item | count komposisi paket | angka | sort | jumlah komponen |
| Mode Harga | paket_mcu.mode_harga | badge (Akumulasi/Manual) | filter | |
| Total Akumulasi | paket_mcu.total_akumulasi_tarif | mata uang Rp penuh (Rp20.000) | sort | nilai snapshot |
| Harga Paket | paket_mcu.harga_paket | mata uang Rp penuh | sort | harga final |
| Selisih | harga_paket − total_akumulasi | mata uang Rp (+/−), badge warna | sort | indikator markup/diskon (BR-005b) |
| Status | paket_mcu.status_aktif | badge (Aktif/Non-aktif) | filter | merah jika Non-aktif |
| Aksi | – | tombol Edit/Aktif-Nonaktif/Hapus(soft) | – | tanpa hard delete |

### D. Layar TAMPIL — Detail Paket (saat edit, FR-008)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Header paket | paket_mcu.* | label + nilai | – | kode/nama/deskripsi/mode/status |
| Tabel komposisi | komposisi item | tabel (nama, unit, tarif, qty, subtotal) | sort per unit | tarif dihitung ulang dari master terkini |
| Total Akumulasi (live) | Σ subtotal sesi edit | mata uang Rp penuh | – | live; disnapshot saat simpan |
| Harga Paket | paket_mcu.harga_paket | mata uang Rp penuh | – | read-only mode A / editable mode B |
| Pembanding + Selisih | harga_paket vs akumulasi | mata uang Rp + selisih (+/−) | – | BR-005/005b |
| Penanda versi (concurrency) | updated_at / row_version | tersembunyi (token) | – | dipakai optimistic locking (BR-017) |

### E. Layar IMPORT — Preview Hasil Validasi (FR-020, FR-021)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| No. Baris | file import | angka | sort | nomor baris di file |
| Kode Paket | baris.kode_paket | text | filter | dicek unik & ≤20 alfanumerik |
| Nama Paket | baris.nama_paket | text | filter | dicek unik |
| Jml Item | baris (komposisi) | angka | – | ≥ 1 (BR-002) |
| Harga/Mode | baris.harga_paket / mode | Rp penuh / badge | – | |
| Status Validasi | hasil validasi | badge **Valid (hijau)** / **Error (merah)** | filter | |
| Alasan Error | hasil validasi | text | – | mis. "kode duplikat", "nama sudah ada", "item tidak ditemukan", "qty < 1" |
| (Footer) Ringkasan | agregasi | "X valid, Y error" + tombol **Proses** / **Batal** | – | BR-014 |

> Setelah **Proses**: layar **Ringkasan Hasil** menampilkan jumlah tersimpan, jumlah dilewati, dan daftar/unduhan baris gagal (FR-021/022).

### F. Template Import Paket MCU (CSV/XLSX) (FR-017) [PERLU KONFIRMASI struktur final dgn tim dev]
Usulan struktur **dua sheet** (atau satu sheet baris berulang dikelompokkan `kode_paket`):
- **Sheet 1 — Header Paket**: `kode_paket`, `nama_paket`, `deskripsi`, `mode_harga` (AKUMULASI/MANUAL), `harga_paket` (isi bila MANUAL, rupiah penuh), `status_aktif` (default aktif).
- **Sheet 2 — Komposisi**: `kode_paket` (relasi ke header), `kode_item`/`item_id`, `qty`.
> Validasi import mengikuti BR-015/016. Bila satu sheet: tiap baris = 1 item komposisi, header paket diambil dari baris pertama per `kode_paket`.

### G. Entitas tersimpan (ringkas) [ASUMSI — struktur DB final ditentukan tim dev]
- **paket_mcu**: `id`, `kode_paket` (≤20, unik), `nama_paket` (unik), `deskripsi`, `mode_harga`, `total_akumulasi_tarif` (snapshot, int Rp), `harga_paket` (int Rp), `status_aktif`, `is_deleted` (soft delete), `created_by/at`, `updated_by/at`, `deleted_by/at`, `row_version` (optimistic lock).
- **paket_mcu_item** (komposisi): `id`, `paket_id`, `item_id`, `item_source_unit`, `tarif_satuan_snapshot` (int Rp), `qty`, `subtotal_snapshot` (int Rp).
- *(Phase 2)* **paket_mcu**: tambahan `berlaku_mulai`, `berlaku_sampai`; **paket_mcu_version**: `id`, `paket_id`, `version_no`, snapshot komposisi+harga, `created_at`. (Lihat Section 14.)

> Field tak pasti ditandai [PERLU KONFIRMASI]. Field bersama (`unit`, `status_aktif`) memakai definisi kanonik lintas-PRD (konsisten dgn A3/master lain). **Struktur DB final diserahkan ke tim dev** (per arahan user).

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| **NFR-001** | Performa | Perhitungan Total Akumulasi Tarif live ≤ 300 ms untuk komposisi ≤ 50 item. [ASUMSI] |
| **NFR-002** | Performa | List paket termuat ≤ 2 dtk untuk ≤ 500 paket (beban RS Tipe C/D). [ASUMSI] |
| **NFR-002b** | Performa (Import) | Validasi & preview import ≤ 5 dtk untuk ≤ 50 baris paket; tampilkan progress bila lebih. [ASUMSI] |
| **NFR-003** | Integritas data | Snapshot akumulasi & subtotal disimpan atomik bersama header (transaksi tunggal) agar konsisten (BR-006). Proses import menyimpan baris valid dalam transaksi terkontrol (parsial-aman: hanya baris valid commit). |
| **NFR-004** | Keamanan/Akses | Akses CRUD & Import dibatasi role master data via RBAC (A53); aksi tercatat audit (FR-012). |
| **NFR-005** | Auditability | Setiap create/update/soft-delete/toggle status/import menyimpan user & timestamp. |
| **NFR-006** | Reliabilitas | Soft delete & status non-aktif **tidak menghapus data fisik**; **riwayat pelayanan sebelumnya tetap utuh tanpa error/hilang**; data dapat dipulihkan (BR-009/010). Hard delete tidak tersedia. |
| **NFR-007** | Usability | Picker komposisi & layar import mendukung pencarian cepat, filter per unit, dan preview yang jelas; UI sederhana untuk SDM terbatas RS Tipe C/D. |
| **NFR-008** | Konsistensi mata uang | Semua nilai **Rupiah penuh tanpa sen/pecahan**, ditampilkan format ribuan (mis. Rp20.000); penyimpanan **integer rupiah** (BR-011). |
| **NFR-009** | Kompatibilitas / Reliabilitas jaringan | Berjalan baik pada **koneksi internet tidak stabil**: operasi master bersifat lokal/intranet, tanpa integrasi eksternal real-time. Proses import bersifat unggah-validasi-konfirmasi (idempotent terhadap retry: file yang sama tidak menggandakan data karena cek unik kode+nama). |
| **NFR-010** | Concurrency *(suggest)* | **Gunakan optimistic locking (disarankan)** untuk RS Tipe C/D: tangkap `row_version`/`updated_at` saat buka edit; saat simpan bandingkan; bila berubah → tolak + pesan "data telah diubah pengguna lain, muat ulang". **Hindari pessimistic lock** (berisiko lock menggantung saat koneksi putus). Untuk komposisi, simpan sebagai unit utuh (replace-all) dalam satu transaksi agar tidak ada partial merge antar user. (BR-017, FR-023) |

## 13. Integrasi Eksternal

**Modul ini TIDAK melakukan integrasi eksternal langsung.** Ini master data internal Control Panel. Operasi dirancang **tahan koneksi internet tidak stabil** (intranet/lokal).

**Integrasi internal (lookup ke master lain):**
- Master **Item Pemeriksaan Laboratorium (A14)** — sumber item Lab + tarif satuan.
- Master **Item Pemeriksaan Radiologi (A29)** — sumber item Radiologi + tarif.
- Master **Tindakan (A10)** / **Procedure (A13)** — sumber item tindakan/pemeriksaan fisik + tarif.
- Master **Spesialisasi & SMF (A23)** / referensi DPJP — item Konsultasi.
- Master **Unit (A3)** — field `unit` (sumber unit item) — pakai definisi kanonik.
- **Master Tarif** — sumber item & tarif **penunjang lain** (EKG, treadmill, spirometri, audiometri); saat ini belum ada master tersendiri [PERLU KONFIRMASI nama/kode master].

**Catatan terminologi & interoperabilitas SATUSEHAT:**
- Mapping **LOINC/SATUSEHAT/FHIR tidak dilakukan di level paket** (BR-013). Terminologi tetap melekat pada **item komponen** & diproses saat **order terbentuk di pendaftaran** (g-support-mcu).
- A14/A29/A10/A13 sendiri sudah berintegrasi SATUSEHAT/BPJS V2 di level item — paket hanya mereferensikan item-item tersebut.

**Integrasi ke modul hilir (konsumen, bukan dilakukan modul ini):**
- Pendaftaran/Admisi & Pelayanan (g-admisi-onsite-registration, g-support-mcu) memanggil daftar paket **Aktif** (FR-014); **pembentukan order komponen terjadi di pendaftaran**.
- Billing/Casemix memakai `harga_paket`; alokasi pendapatan per unit & jurnal = Out Scope (Modul Billing).

**Integrasi bersama (referensi konteks, tidak dipakai langsung di A44):** BPJS (VClaim/SEP), SATUSEHAT, Disdukcapil (NIK) — relevan di modul pendaftaran, bukan di master paket.

## 14. **Rancangan Phase 2 — Masa Berlaku & Versioning** (belum diimplementasikan)

> **Seluruh isi section ini adalah RANCANGAN Phase 2** — disiapkan sekarang agar desain Phase 1 (snapshot, soft delete, struktur entitas) sudah kompatibel, namun **belum dikerjakan pada rilis Phase 1**. Setiap sub-bagian ditandai `**` pada judulnya.

### 14.1 **Masa Berlaku (tanggal dari–sampai)**
- **Tujuan:** paket otomatis tidak terpakai di luar periode promosi/kontrak tanpa harus dinonaktifkan manual.
- **Field baru** (`paket_mcu`): `berlaku_mulai` (date, opsional), `berlaku_sampai` (date, opsional).
- **Aturan (BR-018):** `berlaku_sampai` ≥ `berlaku_mulai`; modul hilir menampilkan paket bila **status Aktif DAN tanggal hari ini ∈ [berlaku_mulai, berlaku_sampai]** (rentang kosong = berlaku selamanya).
- **Data Requirements tambahan (form header):**

| Field | Label | Tipe | Wajib | Validasi | Default |
|---|---|---|---|---|---|
| `berlaku_mulai` | Berlaku Mulai | date | Tidak | ≤ `berlaku_sampai` | kosong = tanpa batas awal |
| `berlaku_sampai` | Berlaku Sampai | date | Tidak | ≥ `berlaku_mulai` | kosong = tanpa batas akhir |

- **List/Dashboard tambahan:** kolom **Periode Berlaku** + badge **Kedaluwarsa** (merah) bila lewat `berlaku_sampai`.

### 14.2 **Versioning Paket**
- **Tujuan:** menjaga **integritas order historis** — order lama tetap merujuk komposisi/harga versi saat transaksi, meski paket direvisi.
- **Mekanisme (BR-019):** perubahan komposisi/harga yang disimpan → membuat **versi baru** (`version_no` inkremental); versi lama disimpan immutable.
- **Entitas baru (usulan):** `paket_mcu_version` (`id`, `paket_id`, `version_no`, snapshot header+komposisi+harga, `effective_at`, `created_by/at`).
- **Relasi modul hilir:** order MCU mereferensikan `paket_id` + `version_no` saat transaksi (koordinasi dgn Modul Order/Billing — di luar A44).
- **Catatan vs snapshot Phase 1:** snapshot Phase 1 sudah membekukan nilai per-record; versioning Phase 2 menambah **histori versi yang dapat ditelusuri** (audit komposisi antar waktu).

### 14.3 **FR/US terkait (lihat juga Section 9 & 10)**
- **FR-024**, **FR-025**, **US-017**, **BR-018**, **BR-019** (ditandai *(Phase 2)*).

### 14.4 **Dampak ke Phase 1 (kompatibilitas maju)**
- Struktur entitas Phase 1 (`paket_mcu`, `paket_mcu_item`, `row_version`) dirancang agar penambahan field tanggal & tabel versi tidak merombak skema inti. **Keputusan akhir skema diserahkan tim dev.** [ASUMSI]

## Asumsi
- [ASUMSI] Struktur DB final (tabel/field/versi) **diserahkan ke tim dev**; usulan dua tabel (paket_mcu + paket_mcu_item) + paket_mcu_version (Phase 2) hanya rancangan acuan.