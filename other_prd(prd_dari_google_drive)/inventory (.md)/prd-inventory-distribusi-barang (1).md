# PRD — Inventory: Distribusi Barang

**Related Document:** Design Figma; PRD Master Modul Inventory (modul induk); PRD Detail — Informasi Stok [H4], Mutasi Stok [H5], Penggunaan Barang Unit [H11]; PRD Master Data — Unit, Barang Farmasi/Rumah Tangga/Gizi; PRD Master Batch & Expired Date Barang Farmasi (FEFO); PRD Rencana Pengadaan Barang [H10]; BPMN g-backoffice-inventory-distribusi.json
**Versi:** 1.1 - Revisi konfirmasi stakeholder (matriks role PJ Shift, retur per-distribusi, koreksi selisih qty, status Fase 1)

## 1. Overview / Brief Summary

Fitur **Distribusi Barang** (kode **H3**, cluster Backoffice → Inventory) digunakan untuk mencatat dan mengelola **perpindahan barang dari Unit Gudang ke Unit Non Gudang** (poli, ruang rawat, IGD, instalasi penunjang) di lingkungan RS Tipe C & D.

Distribusi berbeda dari **Mutasi Stok [H5]**:
- **Distribusi** = perpindahan *top-down* dari pusat stok (gudang) ke unit pengguna, terotorisasi oleh Unit Gudang.
- **Mutasi** = perpindahan *peer-to-peer* antar unit setara.

Fitur ini melibatkan dua peran unit:
- **Unit Peminta (Non Gudang)** — unit pengguna yang mengajukan permintaan barang ke gudang.
- **Unit Gudang** — unit pengelola stok pusat (Gudang Farmasi, Gudang Rumah Tangga, Gudang Gizi) yang memutuskan pemenuhan permintaan. Termasuk sub-gudang (mis. Depo Farmasi Rawat Inap, ditandai `parent_unit_id`) yang dapat berperan ganda: peminta ke gudang utama sekaligus sumber ke unit non-gudang.

Alur inti (selaras BPMN): **Permintaan Distribusi → Konfirmasi/Tindakan Gudang (Approve/Reject/Adjustment) → sistem mengurangi stok unit pemenuh → Penerimaan Distribusi oleh unit peminta**. Fitur juga mendukung **Retur Distribusi** (pengembalian barang dari unit non-gudang ke gudang). Untuk **barang Farmasi**, sistem melakukan **alokasi batch FEFO (First Expired First Out)** otomatis, dan **soft-reservation** stok mencegah race condition.

> Catatan cakupan BPMN vs Lampiran: ringkasan BPMN yang diberikan menggambarkan alur dasar Permintaan → Konfirmasi → Penerimaan tanpa eksplisit menyebut urgency/FEFO/retur, sementara Lampiran PRD memuat detail tambahan (Urgency Tag, FEFO, Retur, soft-reservation). Detail tambahan dari Lampiran diadopsi sebagai requirement dan ditandai sumbernya. [ASUMSI] Fitur penuh = gabungan BPMN + Lampiran.

## 2. Background

**Kondisi saat ini (As-Is):** Perpindahan barang dari gudang ke unit dilakukan dengan formulir kertas ("bon barang"/"permintaan pengeluaran barang") dan dicatat manual di buku gudang. Masalah yang timbul (dari Lampiran PRD):

1. Stok gudang tidak otomatis berkurang & stok unit tidak otomatis bertambah saat distribusi terjadi.
2. Unit peminta tidak punya *visibility* ketersediaan stok gudang sebelum mengajukan.
3. Sulit melacak pola konsumsi per unit sebagai dasar perencanaan pengadaan [H10].
4. Tidak ada *urgency tagging* → petugas gudang sulit menentukan prioritas pemenuhan.
5. Tidak ada pencatatan formal barang yang diretur dari unit ke gudang.
6. Sulit menelusuri riwayat distribusi untuk audit & stok opname [H6].
7. Barang farmasi tanpa batch tracking, FEFO, dan penanganan mendekati ED.
8. Tidak ada otorisasi formal yang membedakan petugas biasa vs penanggung jawab shift.
9. *Race condition* saat 2 unit meminta barang sama bisa menyebabkan stok negatif.

**Kenapa modul ini perlu (To-Be):** Setiap perpindahan barang dari gudang ke unit (dan retur) dicatat digital dengan workflow: **Permintaan (dengan urgency) → Tindakan Gudang (Approve/Reject/Adjustment) → Pengiriman (Dalam Pengiriman) → Konfirmasi Penerimaan**; untuk retur: **Permintaan Retur → Tindakan Gudang → Konfirmasi Penerimaan Fisik Retur**. Stok terupdate otomatis dengan **soft-reservation** untuk mencegah race condition, **snapshot master data** saat status Diajukan mencegah inkonsistensi, dan setiap transaksi menghasilkan **dokumen bukti** + **audit trail**. *(Catatan: status antara Klarifikasi/Review tidak dipakai di Fase 1 — lihat §6; penanganan perubahan langsung lewat Adjustment oleh PJ Shift Gudang.)*

**Konteks RS Tipe C & D:** SDM IT & jumlah unit terbatas; perlu UI sederhana, default cerdas (FEFO otomatis), dan pertimbangan koneksi tidak stabil. [ASUMSI] Mode offline penuh tidak termasuk fase 1; minimal sistem harus mencegah double-submit & stok negatif saat koneksi labil.

## 3. In Scope

### Scope Definition (yang dikerjakan)
| No | Scope/Area |
|----|-----------|
| 1 | Menu Inventory → **Permintaan Distribusi** (Unit Peminta membuat permintaan ke gudang) |
| 2 | Menu Inventory → **Konfirmasi Distribusi** (Unit Gudang: Approve / Reject / **Adjustment** kuantitas) |
| 3 | Menu Inventory → **Penerimaan Distribusi** (Unit Peminta konfirmasi terima barang) |
| 4 | Dashboard/List per tahap (Permintaan, Konfirmasi, Penerimaan) dengan filter **Urgency, Status, Unit, Kategori** + badge counter |
| 5 | **Urgency Tag** permintaan: Normal / Urgent / Cito |
| 6 | Penambahan/edit/hapus item pada permintaan & saat konfirmasi (sesuai gateway BPMN "Ada Perubahan") |
| 7 | **Soft-reservation** stok saat permintaan Diajukan; pengurangan stok unit pemenuh saat konfirmasi |
| 8 | **FEFO** otomatis alokasi batch untuk barang Farmasi (override hanya Apoteker) |
| 9 | Pembatalan permintaan oleh Unit Peminta sebelum tindakan final gudang |
| 10 | **Retur Distribusi** (Unit Non Gudang → Gudang) dengan workflow simetris, **berbasis satu dokumen distribusi asal** |
| 11 | Dokumen bukti distribusi/retur + **audit trail** |

### Out Scope (yang TIDAK dikerjakan)
- **Mutasi Stok antar unit setara** → modul [H5].
- **Penerimaan Barang dari supplier** → modul [H2]; **Pemesanan Barang** → [H1].
- **Stok Opname** [H6], **Retur Pembelian ke supplier** [H8], **Pemusnahan Barang** [H9].
- Perhitungan **Rencana Pengadaan** dari pola konsumsi → modul [H10] (Distribusi hanya menyediakan data).
- Pembuatan/pengubahan **Master Unit** & **Master Barang** (hanya dikonsumsi via lookup).
- **Status antara Klarifikasi/Review** (Diajukan → Tindakan) — tidak dipakai Fase 1 (dikonfirmasi stakeholder); dapat dipertimbangkan fase berikut.
- [ASUMSI] Mode offline penuh & sinkronisasi multi-cabang.

## 4. Goals and Metrics

| Tujuan | Metrik terukur | Target [PERLU KONFIRMASI] |
|--------|----------------|---------------------------|
| Digitalisasi perpindahan barang gudang→unit | % distribusi tercatat di sistem (vs bon kertas) | ≥ 95% dalam 3 bulan |
| Akurasi stok | Selisih stok fisik vs sistem saat stok opname | ≤ 2% |
| Cegah stok negatif | Jumlah kejadian stok negatif akibat race condition | 0 |
| Kecepatan pemenuhan | Median waktu Permintaan → Konfirmasi gudang | ≤ 30 menit (jam kerja) |
| Prioritas tepat | % permintaan Cito dikonfirmasi ≤ 15 menit | ≥ 90% |
| Kepatuhan FEFO Farmasi | % alokasi batch mengikuti ED terdekat tanpa override | ≥ 98% |
| Traceability audit | % transaksi memiliki audit trail lengkap (peminta, penyetuju, batch, alasan) | 100% |
| Dukungan perencanaan | Tersedianya laporan pola konsumsi per unit untuk [H10] | Tersedia |

## 5. Related Feature

Dari List Fitur (cluster **Backoffice → Inventory**):

| Code | Menu | Relasi dengan Distribusi Barang |
|------|------|----------------------------------|
| H1 | Pemesanan Barang | Sumber pengisian stok gudang (hulu) |
| H2 | Penerimaan Barang | Stok gudang bertambah sebelum didistribusikan |
| **H3** | **Distribusi Barang** | **Modul ini** |
| H4 | Informasi Stok | Sumber data stok per gudang/unit & info batch/ED |
| H5 | Mutasi Stok | Beda konsep (peer-to-peer) — Distribusi = top-down |
| H6 | Stok Opname | Konsumen riwayat distribusi untuk rekonsiliasi |
| H7 | Peminjaman & Pengembalian Barang | Pola workflow serupa (referensi) |
| H8 | Retur Pembelian | Beda arah (ke supplier) vs Retur Distribusi (ke gudang internal) |
| H9 | Pemusnahan Barang | Barang retur rusak/ED dapat lanjut ke pemusnahan |
| H10 | Rencana Pengadaan Barang | Konsumen pola konsumsi hasil distribusi |
| H11 | Penggunaan Barang Unit | Mengurangi stok unit setelah barang diterima dari distribusi |

Master terkait: **Master Unit** (`is_gudang`/`gudang`, `parent_unit_id`), **Master Barang** (`barang_id`, `kategori`, `satuan`), **Master Batch & ED** (Farmasi).

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI dari Lampiran]
1. Unit non-gudang menulis "bon barang" di kertas dan mengirim ke gudang.
2. Petugas gudang mengecek stok manual di buku gudang.
3. Barang dikeluarkan; pencatatan pengurangan/penambahan stok manual & sering terlambat.
4. Tidak ada prioritas, tidak ada batch tracking, retur tidak terdokumentasi.
5. Riwayat sulit ditelusuri saat audit/opname.

### B. To-Be (kondisi diharapkan — turunan BPMN g-backoffice-inventory-distribusi.json)
Aktor (lanes): **Unit Order (Peminta)**, **Unit Penerima Order (Gudang)**, **Sistem**.

1. **Unit Order** buka menu *Inventory → Permintaan Distribusi*; **Sistem** menampilkan list permintaan di dashboard.
2. Unit Order klik **Tambah** → Sistem menampilkan **form permintaan distribusi** → input item (+ urgency) → Sistem menyimpan permintaan & melakukan soft-reservation.
3. **Unit Gudang** buka menu *Inventory → Konfirmasi Distribusi*; Sistem menampilkan list konfirmasi.
4. Gateway **"Ada Perubahan?"**: 
   - **Ya** → gudang melakukan perubahan (Hapus item / Input item tambahan / Edit jumlah = Adjustment), lalu Simpan.
   - **Tidak ada perubahan** → klik **Konfirmasi** (Approve).
5. **Sistem menyimpan dan mengurangi stok di unit yang mengonfirmasi** (gudang); untuk Farmasi alokasi batch FEFO; status → Dalam Pengiriman.
6. **Unit Order** buka menu *Inventory → Penerimaan Distribusi*; Sistem menampilkan list penerimaan → **Menerima pemesanan barang** → stok unit peminta bertambah → **Selesai**.

> **Status proses (Fase 1) — dikonfirmasi stakeholder**: alur **cukup** memakai gateway **"Ada Perubahan?"** dari BPMN. Fase 1 **tidak** memerlukan status antara **Klarifikasi/Review** (antara Diajukan → Tindakan) seperti disebut draft Lampiran; bila ada perubahan, penanganannya langsung lewat **Adjustment oleh PJ Shift Gudang** (BR-009) tanpa state machine review terpisah. Status Klarifikasi/Review dapat dipertimbangkan di fase berikut.

[ASUMSI] Cabang Reject & Retur Distribusi tidak digambar eksplisit di BPMN ringkas namun ada di Lampiran → dimodelkan sebagai ekstensi workflow simetris.

## 7. Main Flow / Mindmap

### Skenario A — Permintaan & Pemenuhan (happy path, dari BPMN start→Selesai)
1. (Mulai) Unit Order → **Buka menu Inventory → Permintaan Distribusi**.
2. Sistem **menampilkan list permintaan distribusi** pada dashboard.
3. Unit Order **klik Tambah** → Sistem **menampilkan form permintaan distribusi**.
4. Unit Order **input item** (barang, qty, urgency) → **klik Tambah**.
5. Sistem **menyimpan permintaan distribusi** (status Diajukan + soft-reservation).
6. Unit Gudang **buka menu Inventory → Konfirmasi Distribusi** → Sistem **menampilkan list konfirmasi**.
7. **Gateway: Ada Perubahan?** *(aksi final di langkah ini hanya oleh PJ Shift Gudang — BR-009)*
   - **Tidak** → **Klik Konfirmasi** (Approve).
   - **Ya** → **Hapus item** / **Input item tambahan** / **Edit jumlah** (Adjustment) → **Simpan data**.
8. Sistem **menyimpan & mengurangi stok di unit yang mengonfirmasi** (gudang) + alokasi batch FEFO (Farmasi).
9. Unit Order **buka menu Inventory → Penerimaan Distribusi** → Sistem **menampilkan list penerimaan**.
10. Unit Order **menerima pemesanan barang** → stok unit peminta bertambah → **(Selesai)**. Bila **qty diterima < qty dipenuhi**, lakukan **koreksi + flag selisih** (BR-014), bukan auto-retur.

### Skenario B — Reject [ASUMSI/Lampiran]
Pada langkah 7, gudang (PJ Shift) memilih **Reject** (alasan wajib) → soft-reservation dilepas, stok gudang kembali, permintaan ditutup, unit peminta diberi notifikasi.

### Skenario C — Pembatalan oleh Peminta [Lampiran]
Selama status masih Diajukan (belum tindakan final gudang), Unit Order dapat **Batal** → soft-reservation dilepas.

### Skenario D — Retur Distribusi [Lampiran]
Unit Non Gudang **buat Permintaan Retur** **berbasis satu dokumen distribusi asal** (tidak lintas-distribusi; alasan: tidak terpakai/sisa berlebih/rusak/mendekati-ED/salah jenis) → Gudang **Tindakan Retur** → **Konfirmasi Penerimaan Fisik Retur** → stok unit berkurang, stok gudang bertambah, **tertelusur ke batch/aktivitas distribusi asal** (BR-013); barang rusak/ED dapat diarahkan ke [H9].

## 8. Business Rules

- **BR-001** (Sumber wajib gudang): Unit Sumber Distribusi WAJIB unit bertipe gudang (`gudang = Ya`). Unit peminta WAJIB non-gudang. *(Lampiran)*
- **BR-002** (Sub-gudang ganda): Sub-gudang (`parent_unit_id` terisi) boleh berperan sebagai peminta ke gudang utama dan sumber ke unit non-gudang. *(Lampiran)*
- **BR-003** (Soft-reservation): Saat permintaan berstatus **Diajukan**, qty yang diminta direservasi (stok tersedia gudang berkurang sementara) untuk mencegah race condition & double-promise. Reservasi dilepas bila Reject/Batal/Expired. *(Lampiran; cegah race condition)*
- **BR-004** (Pengurangan stok): Stok gudang **berkurang permanen** saat **Konfirmasi (Approve/Adjustment)** — sesuai BPMN "Sistem menyimpan dan mengurangi stok di unit yang mengonfirmasi". Stok unit peminta **bertambah** saat **Penerimaan dikonfirmasi**.
- **BR-005** (Adjustment/parsial): Gateway "Ada Perubahan" → gudang dapat Edit jumlah/Hapus/Tambah item; **pemenuhan parsial** diizinkan bila stok gudang < permintaan penuh. Perubahan wajib tersimpan sebelum konfirmasi. *(BPMN + Lampiran)*
- **BR-006** (FEFO Farmasi): Untuk barang Farmasi, sistem **otomatis alokasi batch dengan ED terdekat lebih dulu**. **Override batch hanya boleh oleh Apoteker** dengan alasan. *(Lampiran)*
- **BR-007** (Snapshot master): Saat status Diajukan, sistem menyimpan **snapshot** nama/satuan/kategori barang & unit agar perubahan master tidak mengubah transaksi berjalan. *(Lampiran)*
- **BR-008** (Cegah stok negatif): Konfirmasi tidak boleh menghasilkan stok gudang < 0; bila stok berkurang sejak diajukan, gudang harus Adjustment. *(Lampiran)*
- **BR-009** (Otorisasi role — **dikonfirmasi stakeholder**): Aksi **Approve / Reject / Adjustment** final atas permintaan distribusi **hanya** dapat dilakukan oleh **PJ (Penanggung Jawab) Shift Gudang**. **Petugas Gudang/Unit biasa tidak berhak** melakukan ketiga aksi tersebut (hanya melihat list, menyiapkan/menginput permintaan, atau mengonfirmasi penerimaan di unitnya). Role aktif saat aksi dicatat di audit. Lihat matriks §8.1. *(Lampiran; konfirmasi stakeholder matriks role C&D)*
- **BR-010** (Pembatalan): Unit Peminta hanya boleh Batal selama belum ada tindakan final gudang. *(Lampiran)*
- **BR-011** (Urgency): Nilai urgency ∈ {Normal, Urgent, Cito}; mempengaruhi sort & badge prioritas, bukan otomatisasi approve. *(Lampiran)*
- **BR-012** (Dokumen & audit): Setiap distribusi/retur menghasilkan nomor dokumen unik + audit trail (peminta, penyetuju, waktu, qty, batch, alasan, role). *(Lampiran)*
- **BR-013** (Retur — **dikonfirmasi stakeholder**): Qty retur ≤ qty yang sebelumnya didistribusikan & masih ada di stok unit. **Retur tidak boleh parsial lintas-distribusi** — setiap retur **harus berdasarkan satu dokumen/aktivitas distribusi asalnya** dan tertelusur ke **batch/aktivitas distribusi** tersebut; satu dokumen retur **tidak** menggabungkan beberapa distribusi. *(Lampiran; konfirmasi stakeholder)*
- **BR-014** (Selisih qty saat penerimaan — **dikonfirmasi stakeholder**): Bila **`qty_diterima` < `qty_dipenuhi`** saat Penerimaan Distribusi, unit peminta melakukan **koreksi** nilai pada dokumen penerimaan dan sistem **memberi penanda (flag)** selisih tersebut pada detail penerimaan — **bukan** auto-retur dan **bukan** sekadar catatan bebas. Selisih ter-flag menjadi dasar telusur/rekonsiliasi (mis. retur terpisah bila barang fisik memang dikembalikan). *(Konfirmasi stakeholder)*

### 8.1 Matriks Role (RS Tipe C & D) — BR-009
| Aksi | Petugas Unit Peminta | Petugas Gudang | PJ Shift Gudang |
|------|:--:|:--:|:--:|
| Lihat list/detail permintaan, konfirmasi, penerimaan | ✔ | ✔ | ✔ |
| Buat / batalkan permintaan distribusi | ✔ | – | – |
| Konfirmasi penerimaan barang di unit (+ koreksi/flag selisih) | ✔ | – | – |
| Input/siapkan data konfirmasi (tanpa finalisasi) | – | ✔ | ✔ |
| **Approve / Reject** permintaan distribusi | – | – | ✔ |
| **Adjustment** (edit jumlah / hapus item / input item tambahan) | – | – | ✔ |
| Ajukan Retur Distribusi | ✔ | – | – |
| Tindakan & konfirmasi fisik Retur di gudang | – | – | ✔ |

> Yang **dikonfirmasi stakeholder** = pembatasan **Approve / Reject / Adjustment → hanya PJ Shift Gudang**. Pembagian baris lain bersifat [ASUMSI] turunan dan dapat disesuaikan. **Apoteker** tetap memegang hak khusus *override* batch FEFO (BR-006). **Manajemen/Logistik** hanya mengonsumsi audit trail & laporan.

## 9. User Stories

- **US-001** — Sebagai **Petugas Unit Peminta**, saya ingin **membuat permintaan distribusi ke gudang dengan menambah item & urgency**, agar **kebutuhan barang unit terpenuhi tepat waktu**. *(BPMN: "Klik tombol tambah" → "Sistem menampilkan form permintaan distribusi" → "Input item tambahan" → "Sistem menyimpan permintaan distribusi")*
- **US-002** — Sebagai **Petugas Unit Peminta**, saya ingin **melihat ketersediaan stok gudang (termasuk batch & ED untuk Farmasi) sebelum mengajukan**, agar **tidak meminta barang yang kosong**. *(Lampiran)*
- **US-003** — Sebagai **Unit Peminta**, saya ingin **membatalkan permintaan sebelum diproses gudang**, agar **soft-reservation dilepas bila kebutuhan berubah**. *(Lampiran; BR-010)*
- **US-004** — Sebagai **PJ Shift Gudang**, saya ingin **melihat list konfirmasi distribusi pada dashboard dengan filter urgency/status/unit**, agar **bisa memprioritaskan permintaan Cito**. *(BPMN: "Sistem menampilkan list konfirmasi distribusi pada dashboard")*
- **US-005** — Sebagai **PJ Shift Gudang**, saya ingin **menjadi satu-satunya role yang dapat melakukan Adjustment (edit jumlah / hapus / tambah item) lalu menyimpan**, agar **bisa memenuhi sebagian saat stok terbatas dengan perubahan terkendali & terotorisasi**. *(BPMN gateway "Ada Perubahan": Hapus item / Input item tambahan / Edit jumlah → Simpan data; konfirmasi stakeholder BR-009)*
- **US-006** — Sebagai **PJ Shift Gudang**, saya ingin **mengonfirmasi (Approve) atau menolak (Reject) permintaan**, agar **stok gudang berkurang sesuai keputusan resmi**. *(BPMN: "Klik konfirmasi" → "Sistem menyimpan dan mengurangi stok di unit yang mengonfirmasi")*
- **US-007** — Sebagai **Apoteker**, saya ingin **sistem mengalokasikan batch Farmasi secara FEFO otomatis dan hanya saya yang bisa override**, agar **barang dengan ED terdekat keluar lebih dulu**. *(Lampiran; BR-006)*
- **US-008** — Sebagai **Petugas Unit Peminta**, saya ingin **mengonfirmasi penerimaan barang dari gudang dan mengoreksi + menandai selisih bila qty diterima kurang**, agar **stok unit saya akurat dan selisih tertelusur**. *(BPMN: "Sistem menampilkan list penerimaan distribusi" → "Menerima pemesanan barang" → Selesai; BR-014)*
- **US-009** — Sebagai **Petugas Unit Peminta**, saya ingin **mengajukan retur barang ke gudang dengan alasan, berbasis satu dokumen distribusi asal**, agar **barang tidak terpakai/rusak/mendekati ED dikembalikan, tercatat, & tertelusur ke batch asal (tidak lintas-distribusi)**. *(Lampiran; Skenario D; BR-013)*
- **US-010** — Sebagai **Manajemen/Logistik**, saya ingin **menelusuri audit trail & pola konsumsi distribusi per unit**, agar **mendukung perencanaan pengadaan [H10] & audit/opname [H6]**. *(Lampiran; BR-012)*

## 10. Functional Requirements

| ID | Requirement | Traceability (BPMN/Lampiran) |
|----|-------------|------------------------------|
| **FR-001** | Sistem menyediakan menu **Inventory → Permintaan Distribusi** dan menampilkan list permintaan pada dashboard. | BPMN: "Buka menu Inventory - Permintaan Distribusi" / "Sistem menampilkan list permintaan distribusi" |
| **FR-002** | Tombol **Tambah** membuka **form permintaan distribusi** (pilih gudang tujuan, item, qty, urgency, keterangan). | BPMN: "Klik tombol tambah" → "Sistem menampilkan form permintaan distribusi" |
| **FR-003** | Form mendukung **tambah banyak item** (input item tambahan) sebelum simpan. | BPMN: "Input item tambahan" |
| **FR-004** | Simpan permintaan menetapkan status **Diajukan** & melakukan **soft-reservation** stok gudang. | BPMN: "Sistem menyimpan permintaan distribusi"; BR-003 |
| **FR-005** | Unit Peminta dapat **membatalkan** permintaan selama belum ada tindakan final. | Lampiran; BR-010 |
| **FR-006** | Menu **Inventory → Konfirmasi Distribusi** menampilkan list konfirmasi dengan filter urgency/status/unit/kategori + badge counter. | BPMN: "Buka menu Inventory - Konfirmasi Distribusi" / "Sistem menampilkan list konfirmasi distribusi" |
| **FR-007** | Pada konfirmasi, sistem menyediakan keputusan **Approve / Reject / Adjustment** (Edit jumlah, Hapus item, Input item tambahan) dengan tombol **Simpan data** untuk perubahan. | BPMN gateway "Ada Perubahan"; BR-005 |
| **FR-008** | Reject mewajibkan alasan & melepas soft-reservation. | Lampiran; Skenario B |
| **FR-009** | Konfirmasi (Approve/Adjustment) **mengurangi stok gudang** secara permanen & set status **Dalam Pengiriman**. | BPMN: "Sistem menyimpan dan mengurangi stok di unit yang mengonfirmasi"; BR-004 |
| **FR-010** | Untuk barang Farmasi, sistem **mengalokasikan batch FEFO otomatis**; override batch hanya untuk Apoteker (dengan alasan). | Lampiran; BR-006 |
| **FR-011** | Menu **Inventory → Penerimaan Distribusi** menampilkan list barang masuk; **konfirmasi penerimaan** menambah stok unit peminta & menutup transaksi (Selesai). Bila `qty_diterima` < `qty_dipenuhi`, sistem mengakomodasi **koreksi** nilai & **menandai (flag) selisih** (BR-014) — bukan auto-retur. | BPMN: "Sistem menampilkan list penerimaan distribusi" → "Menerima pemesanan barang" → Selesai; BR-014 |
| **FR-012** | Sistem mendukung **Retur Distribusi**: buat permintaan retur (alasan) **berbasis satu dokumen/aktivitas distribusi asal** (tidak lintas-distribusi), tindakan gudang, konfirmasi penerimaan fisik retur; stok diperbarui simetris & **tertelusur ke batch asal**. | Lampiran; Skenario D; BR-013 |
| **FR-013** | Setiap transaksi menghasilkan **nomor dokumen unik** & dapat dicetak/diunduh sebagai bukti. | Lampiran; BR-012 |
| **FR-014** | Sistem mencatat **audit trail** (peminta, penyetuju, waktu, qty, batch, alasan, role aktif). | Lampiran; BR-012 |
| **FR-015** | Sistem menyimpan **snapshot** master barang/unit saat status Diajukan. | Lampiran; BR-007 |
| **FR-016** | Sistem mencegah stok gudang menjadi negatif saat konfirmasi (validasi real-time). | Lampiran; BR-008 |
| **FR-017** | Otorisasi: aksi final **Approve / Reject / Adjustment** atas permintaan distribusi **hanya** untuk role **PJ Shift Gudang**; petugas unit/gudang biasa tidak berhak. Aksi tercatat di audit trail (pelaku + waktu). Lihat matriks §8.1. | Lampiran; BR-009; konfirmasi stakeholder |

## 11. Data Requirements (Spesifikasi Field)

> Konsistensi: field `unit`, `barang_id`, `kategori`, `satuan`, `gudang`, `keterangan`, `keputusan`, `user_id`, `status_aktif` mengikuti definisi kanonik PRD terkait. Field tak pasti ditandai [PERLU KONFIRMASI].

### A. Form INPUT — Header Permintaan Distribusi (FR-002)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_distribusi | No. Dokumen | text | Ya | unik, auto-format DST-YYYYMM-xxxx | auto-generate | BR-012 |
| unit_peminta_id | Unit Peminta | lookup | Ya | unit non-gudang (`gudang`=Tidak) | master Unit (A3) | autofill dari user login [ASUMSI] |
| gudang_tujuan_id | Gudang Tujuan | lookup | Ya | unit `gudang`=Ya | master Unit (A3) | BR-001 |
| urgency | Urgency | dropdown | Ya | Normal / Urgent / Cito | enum, default Normal | BR-011 |
| tanggal_permintaan | Tanggal Permintaan | date | Ya | ≤ hari ini | auto (now) | |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik |
| status | Status | dropdown | Ya | Diajukan/Dikonfirmasi/Dalam Pengiriman/Selesai/Ditolak/Batal | auto, default Diajukan | tanpa status Klarifikasi/Review di Fase 1 (§6) |

### B. Form INPUT — Detail Item Permintaan (FR-003)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| barang_id | Barang | lookup | Ya | barang valid di master | master Barang (H4) | field kanonik |
| kategori | Kategori | dropdown/enum | Ya | dari master/enum kategori | autofill dari barang | field kanonik |
| satuan | Satuan | text | Ya | dari master item | autofill | field kanonik (read-only) |
| qty_diminta | Qty Diminta | number | Ya | > 0, integer | manual | |
| stok_gudang_tersedia | Stok Gudang Tersedia | number | Tidak | read-only | dari Informasi Stok (H4) | tampil saat input (US-002) |
| keterangan_item | Keterangan Item | text | Tidak | maks 255 char | manual | |

### C. Form INPUT — Konfirmasi / Adjustment oleh Gudang (FR-007)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keputusan | Keputusan | dropdown | Ya | Approve / Reject / Adjustment | enum | field kanonik (perluasan nilai); aksi final **hanya PJ Shift Gudang** (BR-009) |
| qty_dipenuhi | Qty Dipenuhi | number | Ya (jika Approve/Adjustment) | 0 ≤ qty ≤ qty_diminta & ≤ stok | default = qty_diminta | BR-005, BR-008 |
| batch_id | Batch (Farmasi) | lookup | Ya utk Farmasi | batch valid, ED terdekat (FEFO) | auto-FEFO; override Apoteker | BR-006 |
| alasan | Alasan | text | Ya (jika Reject/Adjustment/override) | maks 255 char | manual | BR-008, audit |
| pj_shift_user_id | PJ Shift (Penyetuju) | lookup | Ya | role PJ Gudang | user login (A1) | field kanonik `user_id`; aksi final terbatas role ini (BR-009) |

### D. Form INPUT — Penerimaan Distribusi (FR-011)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_distribusi | No. Dokumen | text | Ya | ada di list pengiriman | sistem | read-only |
| qty_diterima | Qty Diterima | number | Ya | 0 < qty ≤ qty_dipenuhi | default = qty_dipenuhi | bila < qty_dipenuhi → **koreksi + flag selisih** (BR-014), bukan auto-retur |
| flag_selisih | Tanda Selisih | badge | – | sistem-generate bila qty_diterima < qty_dipenuhi | auto | BR-014; dasar rekonsiliasi/telusur |
| tanggal_terima | Tanggal Terima | date | Ya | ≥ tanggal kirim | auto (now) | |
| catatan_penerimaan | Catatan Penerimaan | text | Bersyarat | maks 255 char; **wajib bila ada flag selisih** | manual | mis. barang kurang/rusak (pendamping flag, BR-014) |
| penerima_user_id | Penerima | lookup | Ya | user unit peminta | user login (A1) | field kanonik `user_id` |

### E. Form INPUT — Retur Distribusi (FR-012)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_distribusi_asal | Dokumen Distribusi Asal | lookup | Ya | **satu** dokumen distribusi yang sudah diterima unit | riwayat distribusi unit | BR-013; retur **tidak lintas-distribusi** |
| barang_id | Barang | lookup | Ya | termasuk dalam distribusi asal terpilih & masih ada di stok unit | dari distribusi asal | BR-013 |
| qty_retur | Qty Retur | number | Ya | > 0, ≤ qty diterima dari distribusi asal & ≤ stok unit | manual | BR-013 |
| alasan_retur | Alasan Retur | dropdown | Ya | Tidak terpakai/Sisa berlebih/Rusak/Mendekati ED/Salah jenis | enum | Lampiran |
| batch_id | Batch | lookup | Ya utk Farmasi | batch asal dari distribusi terpilih | dari distribusi asal | BR-013 (telusur batch) |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | field kanonik |

### F. Layar TAMPIL — Dashboard / List Distribusi (FR-001, FR-006, FR-011)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Badge Counter per status | count transaksi per status | angka pada tab | – | Diajukan/Konfirmasi/Penerimaan |
| No. Dokumen | distribusi.no_distribusi | text | sort terbaru | |
| Unit Peminta | master Unit | text | filter | field `unit` |
| Gudang Tujuan | master Unit | text | filter | |
| Urgency | distribusi.urgency | badge (Normal abu / Urgent kuning / Cito merah) | filter + sort prioritas | BR-011 |
| Kategori | item.kategori | text | filter | field kanonik |
| Jumlah Item | count detail | angka | – | |
| Status | distribusi.status | badge warna | filter | |
| Tanggal Permintaan | distribusi.tanggal_permintaan | dd-mm-yyyy hh:mm | sort default desc | |
| Aksi | – | tombol (Detail/Konfirmasi/Terima/Batal) | – | sesuai role & status; aksi final hanya PJ Shift (BR-009) |

### G. Layar TAMPIL — Detail Permintaan + Stok Gudang (US-002)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Barang | item.barang_id (snapshot) | text | – | BR-007 |
| Qty Diminta / Dipenuhi | item | number | – | |
| Satuan | item.satuan | text | – | field kanonik |
| Stok Gudang Tersedia | Informasi Stok (H4) | number | – | real-time |
| Batch / ED (Farmasi) | Master Batch & ED | kode batch + tgl ED (badge merah jika ≤ 90 hari) | sort ED asc (FEFO) | BR-006 |

### H. Layar TAMPIL — Audit Trail (FR-014)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit.timestamp | dd-mm-yyyy hh:mm:ss | sort desc | |
| Aksi | audit.aksi | text (Diajukan/Approve/Reject/Adjust/Terima/Retur) | filter | |
| User & Role | audit.user_id + role aktif | text | filter | field `user_id`; aksi final tercatat sebagai PJ Shift (BR-009) |
| Nilai Sebelum → Sesudah | audit.nilai_sebelum/sesudah | text/diff | – | qty/batch/status |
| Alasan | audit.alasan | text | – | |

## 12. Non-Functional Requirements

- **NFR-001 (Konkurensi/Integritas):** Pengurangan stok & soft-reservation harus transaksional (atomic) dan tahan race condition — 2 unit meminta barang sama tidak boleh menyebabkan stok negatif. *(BR-003, BR-008)*
- **NFR-002 (Performa):** Dashboard list & badge counter tampil ≤ 2 detik untuk ≤ 1.000 transaksi aktif (skala RS Tipe C/D). [PERLU KONFIRMASI volume]
- **NFR-003 (Ketersediaan/Jaringan):** Sistem mencegah double-submit saat koneksi labil (idempotensi simpan permintaan/konfirmasi). [ASUMSI] Mode offline penuh di luar fase 1.
- **NFR-004 (Audit & Retensi):** Audit trail immutable, tersimpan ≥ sesuai kebijakan rekam/inventaris RS. [PERLU KONFIRMASI masa retensi]
- **NFR-005 (Keamanan/Otorisasi):** Role-based access — Unit Peminta vs Petugas Gudang vs **PJ Shift Gudang** (pemegang aksi final Approve/Reject/Adjustment) vs Apoteker (override FEFO). *(BR-006, BR-009; matriks §8.1)*
- **NFR-006 (Usability):** Form sederhana, default FEFO & qty otomatis, badge urgency berwarna; ramah SDM terbatas.
- **NFR-007 (Traceability data):** Snapshot master data menjamin laporan historis konsisten meski master berubah. *(BR-007)*
- **NFR-008 (Auditability dokumen):** Setiap transaksi punya nomor dokumen unik dapat dicetak. *(BR-012)*

## 13. Integrasi Eksternal

Fitur ini bersifat **internal SIMRS** (Backoffice) — tidak ada integrasi langsung BPJS/SATUSEHAT/Disdukcapil pada alur distribusi.

**Integrasi internal antar-modul:**
| Modul | Arah | Data |
|-------|------|------|
| **Informasi Stok [H4]** | baca/tulis | Stok tersedia gudang & unit; soft-reservation; pengurangan/penambahan stok |
| **Master Batch & ED (Farmasi)** | baca/tulis | Alokasi batch FEFO, ED, override Apoteker |
| **Master Unit (A3)** | baca | `gudang`, `parent_unit_id`, daftar unit peminta/gudang |
| **Master Barang** | baca | `barang_id`, `kategori`, `satuan` |
| **Penggunaan Barang Unit [H11]** | tulis (hilir) | Barang diterima menjadi stok unit untuk dipakai |
| **Stok Opname [H6]** | baca | Riwayat distribusi untuk rekonsiliasi |
| **Rencana Pengadaan [H10]** | baca (hilir) | Pola konsumsi per unit |
| **Pemusnahan Barang [H9]** | tulis (opsional) | Barang retur rusak/ED diarahkan ke pemusnahan |
| **User/Akun (A1)** | baca | `user_id`, role (peminta/Petugas Gudang/PJ Shift/Apoteker) untuk otorisasi & audit |

[ASUMSI] Tidak ada interoperabilitas eksternal yang diwajibkan regulasi pada modul distribusi internal. [PERLU KONFIRMASI] bila ada kewajiban pelaporan logistik farmasi eksternal (mis. SIPNAP untuk narkotika/psikotropika).

## Asumsi
- [ASUMSI] Fitur penuh = gabungan alur BPMN (Permintaan→Konfirmasi→Penerimaan) + detail Lampiran (Urgency, FEFO, Retur, soft-reservation, audit).
- [ASUMSI] Unit peminta & gudang tujuan ter-autofill dari konteks user login / pilihan manual.
- [ASUMSI] Reject dan Retur Distribusi tidak tergambar eksplisit di BPMN ringkas, dimodelkan sebagai ekstensi workflow simetris dari Lampiran.
- [ASUMSI] Mode offline penuh & sinkronisasi multi-cabang di luar cakupan fase 1; minimal idempotensi anti double-submit.
- [ASUMSI] Nilai enum status: Diajukan, Dikonfirmasi, Dalam Pengiriman, Selesai, Ditolak, Batal (tanpa status Klarifikasi/Review di Fase 1 — dikonfirmasi stakeholder).
- [ASUMSI] Selain pembatasan Approve/Reject/Adjustment ke PJ Shift Gudang (dikonfirmasi stakeholder), pembagian aksi lain pada matriks role §8.1 bersifat turunan & dapat disesuaikan.
- [ASUMSI] Modul ini hanya mengonsumsi Master Unit & Master Barang (tidak mengubahnya).
- [ASUMSI] Penomoran dokumen format DST-YYYYMM-xxxx, dapat disesuaikan kebijakan RS.

## Pertanyaan Terbuka
- Target metrik (waktu konfirmasi, % FEFO, volume transaksi) perlu angka resmi dari manajemen.
- Masa retensi audit trail & dokumen distribusi sesuai kebijakan RS.
- Apakah barang Farmasi tertentu (narkotika/psikotropika) butuh pelaporan eksternal SIPNAP terkait pengeluaran/distribusi?