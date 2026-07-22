# PRD — Inventory: Retur Pembelian

**Related Document:** Design Figma — Retur Barang v1.0; PRD Master Modul Inventory; PRD Penerimaan Barang dari Supplier (H2); PRD Master Data — Supplier, Barang Farmasi/Rumah Tangga/Gizi; PRD Master Barang Farmasi (batch & expired date); PRD Modul Pemusnahan Barang (H9); PRD Modul Keuangan (Nota Retur & jurnal); PRD Modul Role & Permission; PRD Modul Audit Trail; SOP Pengelolaan Narkotika & Psikotropika RS; List Fitur V2.xlsx (sheet MVP, code H8)
**Versi:** 1.1 - Konfirmasi PO: ambang approval Manajer Logistik (Rp 10jt), format Nota Retur, hapus alur Klarifikasi

## 1. Overview / Brief Summary

**Retur Pembelian** adalah fitur di Modul Inventory (Backoffice) untuk mencatat dan mengelola pengembalian barang dari **Gudang RS ke Supplier**. Ini adalah salah satu dari empat jenis retur pada modul Retur Barang (Retur Pembelian, Retur Distribusi, Retur Mutasi, Retur Pemakaian); PRD ini fokus pada **Retur Pembelian** (code **H8**).

Berbeda dengan alur *forward* (Pemesanan H1 → Penerimaan H2 → Distribusi H3), Retur Pembelian adalah jalur **reverse**: barang yang sudah/sedang diterima dari Supplier dikembalikan karena tidak layak, mis.:
- Barang **rusak** saat/ sesudah diterima.
- **Tidak sesuai pesanan** (jenis, jumlah, spesifikasi, salah kirim Supplier).
- **Mendekati Expired Date (ED)** di bawah ambang minimum saat penerimaan — ambang **standar RS tipe C & D** (default mis. ED < 6 bulan), **dapat dikonfigurasi** user pada fitur **Pengaturan**.
- Barang **recall** dari produsen/BPOM.

Fitur memastikan setiap retur ke Supplier **terdokumentasi** (ter-link ke dokumen Penerimaan Barang H2 & No. SP), **terotorisasi** oleh role berwenang, **mempengaruhi stok gudang secara real-time** melalui mekanisme: *soft-reservation* (saat retur diajukan) → *deduksi stok* (saat disetujui & barang keluar) → *penutupan/penyelesaian* (saat Supplier konfirmasi terima / pickup), serta menghasilkan **Nota Retur Pembelian** yang menjadi referensi untuk **Modul Keuangan** (kompensasi/penggantian/credit note Supplier).

**Highlight:**
- Retur **ter-link ke Penerimaan Barang (H2)** & **No. SP/No. Faktur** Supplier — tidak ada retur tanpa referensi penerimaan.
- Tracking **batch & expired date** untuk barang farmasi; barang retur kondisi rusak/ED otomatis ditandai **"Reserved for QC"** sehingga tidak ikut terhitung stok layak pakai.
- **Soft-reservation** mencegah barang yang akan diretur terlanjur didistribusikan/dipakai sebelum retur disetujui.
- Status **In-Transit / Dalam Pengiriman** eksplisit untuk rekonsiliasi stok selama barang dalam perjalanan kembali ke Supplier.
- **Nota Retur** + integrasi **Modul Keuangan** untuk pencatatan kompensasi/penggantian.
- Aturan khusus **Narkotika, Psikotropika, Prekursor (NPP)** dengan approval ganda Apoteker — **[Phase 2]**.
- Approval berjenjang untuk retur **bernilai besar** (Manajer Logistik) — **[Phase 2]**.

Target: RS Tipe **C & D** (selaras lampiran yang menyebut Tipe B & C) dengan SDM/IT terbatas — UI sederhana, alur jelas, mode dapat berjalan saat koneksi tidak stabil [ASUMSI].

## 2. Background

**Kondisi saat ini (masalah):**
- Retur ke Supplier dilakukan via koordinasi **telepon/email** Bagian Pengadaan **tanpa pencatatan formal** di sistem inventory. Nota Retur dibuat manual dan sering **tidak ter-link** dengan dokumen Penerimaan Barang (H2). *(sumber: Lampiran PRD_Retur_Barang.docx — Background)*
- Karena tidak tercatat di sistem, **stok gudang tidak terkoreksi** saat barang dikembalikan ke Supplier → muncul **selisih saat Stok Opname (H6)**.
- Tidak ada jejak **batch & ED** untuk barang yang diretur → sulit menelusuri klaim Supplier dan compliance (terutama farmasi & NPP).
- **Kompensasi/penggantian Supplier** tidak terekonsiliasi dengan Keuangan → potensi kerugian (barang sudah dikirim balik tapi credit note/penggantian tidak tertagih).
- Tidak ada **otorisasi berjenjang**; siapa saja bisa menjanjikan retur ke Supplier tanpa kontrol nilai/role.

**Mengapa modul ini perlu:**
Menyediakan satu jalur **retur pembelian yang tercatat, terotorisasi, dan terintegrasi** dengan Penerimaan Barang (H2), master Supplier & Barang, Modul Keuangan, dan Audit Trail — sehingga stok akurat, klaim ke Supplier tertib, dan compliance farmasi/NPP terjaga.

*Catatan: alur As-Is/To-Be sebagian diturunkan secara analogi dari BPMN terkait (`g-backoffice-inventory-penerimaan`, `g-backoffice-inventory-distribusi`, `g-support-pharmacy-retur`) karena modul ini belum punya BPMN sendiri.* [ASUMSI]

## 3. In Scope

### Scope Definition (yang dikerjakan)
1. **Pengajuan Retur Pembelian** oleh Gudang, **ter-link ke dokumen Penerimaan Barang (H2)** / No. SP / No. Faktur Supplier, dengan pemilihan item + batch + jumlah + alasan retur.
2. **Soft-reservation stok** saat retur diajukan (barang ter-reserve, tidak bisa didistribusi/dipakai).
3. **Approval/persetujuan retur** oleh PJ/Kepala Gudang (dan Apoteker untuk barang farmasi).
4. **Deduksi stok gudang** saat retur disetujui & barang keluar; status **In-Transit** selama pengiriman ke Supplier.
5. **Penyelesaian retur**: konfirmasi Supplier menerima / pickup kurir Supplier → status **Selesai**.
6. **Penanganan kondisi barang** (rusak/ED/recall), penandaan **"Reserved for QC"** untuk farmasi.
7. **Nota Retur Pembelian** + pengiriman data ke **Modul Keuangan** (kompensasi: penggantian barang / credit note / refund) — pencatatan referensi.
8. **Dashboard & list** retur pembelian (filter status, supplier, periode) + **detail retur** + cetak Nota Retur.
9. **Pembatalan** retur (edge case) sebelum barang keluar.
10. **Audit trail** setiap perubahan status (link Modul Audit Trail).

### Out Scope (yang TIDAK dikerjakan di PRD ini)
- **Retur Distribusi, Retur Mutasi, Retur Pemakaian** (jenis retur lain — modul Retur Barang yang sama, PRD terpisah). *(In/Out boundary dari List Fitur: H8 = Retur Pembelian saja)*
- **Pemusnahan Barang (H9)** untuk barang rusak/ED yang **tidak dapat di-retur** ke Supplier → workflow lanjutan di modul terpisah (hanya disediakan *hand-off*).
- **Proses pembayaran/jurnal akuntansi** detail — dilakukan di **Modul Keuangan**; di sini hanya kirim referensi Nota Retur.
- **Workflow khusus NPP (approval ganda Apoteker)** dan **approval berjenjang Manajer Logistik nilai besar** → **[Phase 2]**.
- **Penilaian COA Persediaan / posting jurnal** (ada di Stok Opname/Keuangan).
- Integrasi **portal Supplier eksternal** (konfirmasi retur otomatis dari sistem Supplier) → **[Phase 2]** [ASUMSI].

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Semua retur ke Supplier tercatat di sistem | % retur pembelian tercatat vs total retur fisik | ≥ 95% dalam 3 bulan |
| Retur ter-link ke dokumen Penerimaan (H2) | % retur dengan referensi Penerimaan/No. SP terisi | 100% |
| Akurasi stok gudang | Selisih stok terkait retur saat Stok Opname (H6) | mendekati 0 / turun signifikan |
| Klaim Supplier terekonsiliasi | % Nota Retur terkirim ke Keuangan & berstatus terselesaikan | ≥ 90% [PERLU KONFIRMASI target] |
| Kecepatan proses retur | Rata-rata waktu Diajukan → Disetujui | ≤ 1 hari kerja [ASUMSI] |
| Compliance farmasi | % barang farmasi retur ber-batch & ED tercatat | 100% |
| Kontrol otorisasi | % retur disetujui oleh role berwenang (tanpa bypass) | 100% |

*Angka target bertanda [ASUMSI]/[PERLU KONFIRMASI] perlu divalidasi manajemen RS.*

## 5. Related Feature

Fitur terkait dari List Fitur (sheet MVP, cluster **Backoffice**):

| Code | Menu | Relasi dengan Retur Pembelian |
|------|------|------------------------------|
| **H8** | Inventory > Retur Pembelian | **Modul ini** |
| H1 | Inventory > Pemesanan Barang | Sumber dokumen pesanan (No. SP/PO) yang diretur |
| H2 | Inventory > Penerimaan Barang | **Referensi wajib** retur — item, batch, ED, supplier diturunkan dari penerimaan |
| H3 | Inventory > Distribusi Barang | Pola alur reverse (analogi soft-reserve/konfirmasi) |
| H4 | Inventory > Informasi Stok | Stok gudang & batch yang dikurangi/di-reserve oleh retur; field kanonik (kategori, gudang, status_batch, metode_nilai) |
| H5 | Inventory > Mutasi Stok | Kartu stok mencatat pergerakan jenis **Retur** |
| H6 | Inventory > Stok Opname | Konsumen akurasi stok hasil retur |
| H9 | Inventory > Pemusnahan Barang | Hand-off bila barang rusak/ED **tidak dapat** diretur |
| H11 | Inventory > Penggunaan Barang Unit | Konteks stok unit (di luar gudang) |

Referensi lintas-cluster: **Master Supplier**, **Master Barang (Farmasi/RT/Gizi)**, **Modul Keuangan** (Nota Retur), **Role & Permission**, **Audit Trail**.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Lampiran & analogi BPMN]
1. Gudang/Pengadaan menemukan barang rusak/ED/tidak sesuai saat atau setelah penerimaan dari Supplier.
2. Koordinasi retur dilakukan via **telepon/email** ke Supplier — tanpa pencatatan di sistem inventory.
3. **Nota Retur dibuat manual** (Word/Excel), sering tidak ter-link dokumen Penerimaan Barang.
4. Barang dikirim balik secara fisik; **stok di sistem tidak dikurangi** → selisih saat opname.
5. Penggantian/credit note Supplier ditelusuri manual, **tidak terekonsiliasi** dengan Keuangan.

### B. To-Be (kondisi diharapkan) — turunan analogi BPMN penerimaan/distribusi/retur farmasi
1. **Buka menu Inventory - Retur Pembelian**; sistem menampilkan list retur pada dashboard (analogi `g-backoffice-inventory-penerimaan`: *Sistem menampilkan list … pada dashboard*).
2. Petugas Gudang **klik tambah retur**, **pilih dokumen Penerimaan Barang/No. SP** & **Supplier**; sistem menarik item, batch, ED, harga dari penerimaan (H2).
3. **Input item retur**: pilih item, batch, jumlah, **alasan retur**, kondisi (Rusak/ED/Tidak Sesuai/Recall) — analogi *Input item tambahan / Edit jumlah / Hapus item*.
4. **Simpan & Ajukan** → **Sistem soft-reserve stok** barang yang akan diretur (analogi soft-reservation pada Lampiran).
5. **PJ/Kepala Gudang review** → **Setuju/Tolak** (analogi gateway `Disetujui?` pada `g-backoffice-inventory-stok-opname`). Untuk **barang farmasi**, **Apoteker** ikut menyetujui (analogi `g-support-pharmacy-retur`: *Konfirmasi retur obat / Update status retur*).
6. Jika **Disetujui** → **stok gudang berkurang**, status **Disetujui + In-Transit**; sistem **generate Nota Retur**.
7. **Barang dikirim / pickup Supplier** → petugas **konfirmasi Supplier menerima**; status **Selesai**.
8. **Nota Retur** dikirim sebagai referensi ke **Modul Keuangan** untuk kompensasi/penggantian/credit note.
9. Jika **Ditolak** → retur batal, **soft-reserve dilepas**, stok kembali normal, alasan dicatat (analogi *Status SO = Ditolak / Input Alasan*).
10. Barang rusak/ED yang **tidak diterima** Supplier → **hand-off ke Pemusnahan Barang (H9)**.

## 7. Main Flow / Mindmap

**Aktor:** Petugas Gudang (request), PJ/Kepala Gudang (approval), Apoteker (approval barang farmasi), Bagian Pengadaan/Manajer Logistik (koordinasi Supplier — sebagian [Phase 2]), Supplier (eksternal, via koordinasi manual), Sistem, Modul Keuangan.

### Skenario A — Retur Pembelian Normal (barang rusak/ED, disetujui)
1. **[Start]** Ditemukan barang tidak layak dari penerimaan Supplier.
2. Petugas Gudang buka **Inventory - Retur Pembelian** → **Tambah Retur**.
3. Pilih **Supplier** + **Dokumen Penerimaan/No. SP** → sistem tarik item & batch.
4. Pilih item, batch, jumlah, **alasan** & **kondisi** → **Simpan & Ajukan**.
5. **[Gateway: Validasi]** Jumlah retur ≤ jumlah diterima & ≤ stok tersedia? **Tidak →** tolak input (error). **Ya →** lanjut.
6. Sistem **soft-reserve** stok item terpilih. Status = **Diajukan**.
7. **[Gateway: Barang farmasi?]** **Ya →** butuh persetujuan **Apoteker** + PJ Gudang. **Tidak →** persetujuan **PJ/Kepala Gudang**.
8. **[Gateway: Disetujui?]** **Tidak →** Skenario C. **Ya →** stok gudang **dikurangi**, status **Disetujui + In-Transit**, **Nota Retur** ter-generate.
9. Barang dikirim/pickup → petugas **Konfirmasi Supplier Menerima** (input tanggal, penerima, no. ekspedisi/pickup).
10. **[End]** Status **Selesai**. Nota Retur dikirim ke **Modul Keuangan** (kompensasi).

### Skenario B — Barang tidak dapat diretur (Supplier menolak / recall non-return)
1. Pada langkah konfirmasi, Supplier **menolak menerima** / barang tak layak kirim.
2. Petugas tandai **Gagal Retur** + alasan.
3. Sistem tawarkan **hand-off ke Pemusnahan Barang (H9)**; barang farmasi tetap **Reserved for QC** sampai keputusan Apoteker.
4. **[End]** Status **Gagal Retur → diteruskan ke Pemusnahan**.

### Skenario C — Ditolak / Dibatalkan (edge case)
1. **Tolak**: PJ menolak → soft-reserve dilepas, stok normal, status **Ditolak** + alasan. Bila perlu revisi, pemohon membuat retur baru.
2. **Batal**: Pemohon batalkan sebelum disetujui → soft-reserve dilepas, status **Dibatalkan**.
3. **Timeout**: Diajukan melewati SLA → notifikasi pengingat ke approver [ASUMSI].

*Catatan: penomoran gateway/aktivitas mengacu analogi BPMN penerimaan, distribusi, stok-opname, dan retur farmasi karena H8 belum punya BPMN sendiri.* [ASUMSI]

## 8. Business Rules

| ID | Aturan | Sumber/Traceability |
|----|--------|---------------------|
| **BR-001** | Setiap Retur Pembelian **WAJIB** ter-link ke dokumen **Penerimaan Barang (H2)** / No. SP / No. Faktur Supplier. Tanpa referensi → retur tidak boleh dibuat. | Lampiran; analogi `g-backoffice-inventory-penerimaan` |
| **BR-002** | **Jumlah retur ≤ jumlah barang yang diterima** pada batch terkait **dan ≤ stok tersedia** di gudang. | Validasi stok |
| **BR-003** | Saat retur **Diajukan**, sistem **soft-reserve** stok item → barang **tidak dapat** didistribusi/dipakai/diretur lain sampai retur selesai/ditolak. | Lampiran (soft-reservation) |
| **BR-004** | Stok gudang **baru berkurang** saat retur **Disetujui** (bukan saat diajukan). Jika **Ditolak/Dibatalkan**, soft-reserve **dilepas** & stok kembali normal. | Lampiran; analogi gateway Disetujui? |
| **BR-005** | **Barang farmasi** yang diretur **WAJIB** mencantumkan **batch & expired date**; persetujuan melibatkan **Apoteker**. | Lampiran; `g-support-pharmacy-retur` |
| **BR-006** | Barang retur kondisi **Rusak/ED/recall** yang masih tercatat di gudang ditandai **status_batch = "Reserved for QC"** dan tidak dihitung sebagai stok layak pakai. | Field kanonik `status_batch` (H4) |
| **BR-007** | **Otorisasi role**: Petugas Gudang = ajukan saja; **PJ/Kepala Gudang** = setujui/tolak; **Apoteker** = setujui barang farmasi. Petugas tidak boleh menyetujui returnya sendiri. | Lampiran (role hierarchy) |
| **BR-008** | Status retur mengikuti enum: **Draft → Diajukan → Disetujui → In-Transit → Selesai**, atau **Ditolak / Dibatalkan / Gagal Retur**. Transisi mundur hanya via Batal. | State machine |
| **BR-009** | Setiap retur **Disetujui** menghasilkan **Nota Retur Pembelian** bernomor unik yang dikirim sebagai referensi ke **Modul Keuangan**. **Rekomendasi format penomoran:** `NRP/{YYYY}/{MM}/{NNNN}` (mis. `NRP/2026/06/0001`) — prefix **NRP** (Nota Retur Pembelian, dibedakan dari No. Retur transaksi `RP/...`), nomor urut **4 digit reset per bulan**, **gapless** (berurutan tanpa lompatan) untuk kebutuhan audit Keuangan; nomor di-generate sistem saat Nota dibuat (status Disetujui). Bila Modul Keuangan memiliki master penomoran dokumen, Nota Retur didaftarkan sebagai tipe `NRP` mengikuti tahun fiskal & format Keuangan. | Lampiran (Nota Retur); [DIKONFIRMASI PO] |
| **BR-010** | Barang yang **gagal diretur** ke Supplier diteruskan ke **Pemusnahan Barang (H9)**; tidak boleh dianggap stok normal. | Out Scope hand-off |
| **BR-011** | Semua perubahan status retur dicatat di **Audit Trail** (user, waktu, aksi, alasan). | Modul Audit Trail |
| **BR-012** | **[Phase 2]** Retur barang **NPP** memerlukan **approval ganda Apoteker** sesuai SOP Narkotika & Psikotropika. | Lampiran (NPP) |
| **BR-013** | **[Phase 2]** Retur bernilai **≥ Rp 10.000.000** memerlukan persetujuan **Manajer Logistik**. Ambang nilai **dapat dikonfigurasi** pada **Pengaturan Inventory** (default **Rp 10.000.000**). | Lampiran (nilai besar); [DIKONFIRMASI PO]; Pengaturan Inventory |
| **BR-014** | **alasan retur** wajib dipilih dari enum standar; bila "Lainnya" maka catatan teks wajib diisi. | Konsistensi data |
| **BR-015** | **Ambang ED minimum** saat penerimaan (default mis. **6 bulan**) merupakan **standar untuk RS tipe C & D**, namun **dapat dikonfigurasi** oleh user (nilai ambang ED) pada **fitur Pengaturan**. Barang dengan sisa ED di bawah ambang ini layak diretur dengan kondisi "Mendekati ED". | [DIKONFIRMASI PO]; fitur Pengaturan |
| **BR-016** | **Retur partial lintas-batch** dalam satu dokumen Penerimaan **diperbolehkan dalam satu transaksi retur** — beberapa batch dan/atau item berbeda dapat diretur sekaligus di bawah satu No. Retur. | [DIKONFIRMASI PO] |
| **BR-017** | **Jenis kompensasi** yang didukung Keuangan di **MVP mencakup ketiganya**: **Penggantian Barang**, **Credit Note**, dan **Refund**. | [DIKONFIRMASI PO]; FR-011 |

## 9. User Stories

| ID | Sebagai | Saya ingin | Agar | Sumber (analogi BPMN) |
|----|---------|-----------|------|------------------------|
| **US-001** | Petugas Gudang | membuat retur pembelian yang ditarik dari dokumen penerimaan & No. SP | data item/batch/harga otomatis terisi tanpa input ulang | *Buka menu Inventory - Penerimaan; Lihat detail* |
| **US-002** | Petugas Gudang | memilih item, batch, jumlah, alasan & kondisi barang yang diretur | retur akurat sesuai barang tidak layak | *Input item tambahan; Edit jumlah; Hapus item* |
| **US-003** | Petugas Gudang | mengajukan retur dan sistem otomatis me-reserve stok | barang tidak terlanjur dipakai/distribusi sebelum disetujui | *Sistem menyimpan; soft-reservation* |
| **US-004** | PJ/Kepala Gudang | menyetujui/menolak retur | hanya retur valid yang diproses | gateway *Disetujui?* (stok-opname) |
| **US-005** | Apoteker | mengonfirmasi retur barang farmasi beserta batch & ED | compliance farmasi terjaga | `g-support-pharmacy-retur` *Konfirmasi retur obat* |
| **US-006** | Petugas Gudang | mengonfirmasi Supplier telah menerima barang retur | status retur tercatat Selesai & stok akurat | *Update status retur; menampilkan dashboard terupdate* |
| **US-007** | Bagian Keuangan | menerima Nota Retur sebagai referensi kompensasi Supplier | penggantian/credit note tertagih & terekonsiliasi | Lampiran (Nota Retur) |
| **US-008** | Petugas Gudang | menandai barang Reserved for QC bila rusak/ED | barang tak layak tidak terhitung stok pakai | field `status_batch` (H4) |
| **US-009** | Petugas Gudang | meneruskan barang gagal retur ke Pemusnahan (H9) | barang rusak terkelola sesuai prosedur | hand-off H9 |
| **US-010** | Manajemen | melihat dashboard & laporan retur pembelian per supplier/periode | memantau performa supplier & nilai retur | *Sistem menampilkan list … pada dashboard* |
| **US-011** | Auditor Internal | melihat jejak audit setiap perubahan status retur | akuntabilitas & investigasi selisih | Modul Audit Trail |
| **US-012** | Apoteker (NPP) | menyetujui retur NPP dengan approval ganda **[Phase 2]** | sesuai SOP Narkotika & Psikotropika | Lampiran (NPP) |

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menyediakan menu **Inventory > Retur Pembelian** dengan **dashboard list** retur (kartu ringkasan + tabel). | US-010 |
| **FR-002** | Sistem menyediakan form **Tambah Retur** dengan pemilihan **Supplier** & **Dokumen Penerimaan (H2)/No. SP**; sistem **menarik otomatis** item, batch, ED, harga satuan, jumlah diterima. | US-001, BR-001 |
| **FR-003** | Sistem memungkinkan **tambah/edit/hapus item** retur (item, batch, jumlah, alasan, kondisi) sebelum diajukan. | US-002 |
| **FR-004** | Sistem **memvalidasi** jumlah retur ≤ jumlah diterima batch & ≤ stok tersedia; menolak bila melewati. | BR-002 |
| **FR-005** | Saat **Ajukan**, sistem **soft-reserve** stok item & set status **Diajukan**; mencatat ke Audit Trail. | US-003, BR-003, FR-013 |
| **FR-006** | Sistem merutekan persetujuan: barang **farmasi** → Apoteker + PJ Gudang; non-farmasi → PJ/Kepala Gudang. | US-004, US-005, BR-005, BR-007 |
| **FR-007** | Approver dapat **Setuju / Tolak** dengan **alasan/catatan** wajib pada Tolak. | US-004, BR-008 |
| **FR-008** | Saat **Disetujui**, sistem **mengurangi stok** gudang, set status **Disetujui + In-Transit**, dan **generate Nota Retur** bernomor unik. | US-004, BR-004, BR-009 |
| **FR-009** | Sistem menandai batch barang rusak/ED yang masih tercatat sebagai **status_batch = Reserved for QC**. | US-008, BR-006 |
| **FR-010** | Petugas dapat **Konfirmasi Penerimaan Supplier** secara **manual** (tanggal, penerima, no. ekspedisi/pickup) → status **Selesai**. Tanpa integrasi portal Supplier di MVP. | US-006 |
| **FR-011** | Sistem **mengirim data Nota Retur** ke **Modul Keuangan** (jenis kompensasi: penggantian/credit note/refund). | US-007, BR-009 |
| **FR-012** | Sistem mendukung **Batal** (sebelum disetujui) & **Gagal Retur** (Supplier menolak) → lepas soft-reserve / hand-off **Pemusnahan (H9)**. | US-009, BR-004, BR-010 |
| **FR-013** | Sistem mencatat **Audit Trail** untuk setiap perubahan status (user, waktu, aksi, alasan). | US-011, BR-011 |
| **FR-014** | Sistem mencetak/ekspor **Nota Retur Pembelian** (PDF) untuk lampiran kurir/Supplier. | US-007 |
| **FR-015** | Dashboard mendukung **filter** (status, supplier, periode, kategori) & **pencarian** No. Retur/No. SP. | US-010 |
| **FR-016** | **[Phase 2]** Workflow **approval ganda Apoteker** untuk barang NPP. | US-012, BR-012 |
| **FR-017** | **[Phase 2]** Approval berjenjang **Manajer Logistik** untuk retur nilai **≥ Rp 10.000.000** (default; dikonfigurasi di **Pengaturan Inventory**). | BR-013 |

## 11. Data Requirements (Spesifikasi Field)

Spesifikasi field per layar. Field kanonik (mis. `unit`, `gudang`, `kategori`, `status_batch`, `metode_nilai`, `barang_id`, `no_resep`) **mengikuti definisi modul lain (H4 dll)** — tidak dibuat ulang.

---
### A. Form Header Retur Pembelian (INPUT) — terkait FR-002
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_retur | No. Retur | text | Ya | unik, auto-generate (mis. RP/2026/06/0001) | auto | dibuat sistem saat simpan |
| tanggal_retur | Tanggal Retur | date | Ya | ≤ hari ini | default hari ini | |
| supplier_id | Supplier | lookup | Ya | valid di master Supplier | lookup master Supplier | |
| penerimaan_ref | Dokumen Penerimaan / No. SP | lookup | Ya | valid & milik supplier terpilih | lookup Penerimaan Barang (H2) | **BR-001** wajib |
| gudang | Gudang | boolean | Ya | Ya/Tidak | default Tidak | field kanonik (H4) — gudang asal barang |
| unit | Unit/Poli | dropdown | Ya | dari master Unit (A3) | lookup A3 | field kanonik — unit gudang pengaju |
| jenis_kompensasi | Jenis Kompensasi | dropdown | Ya | Penggantian Barang / Credit Note / Refund | enum | ketiganya didukung Keuangan di MVP (BR-017); dikirim ke Keuangan |
| catatan_header | Catatan | text | Tidak | maks 500 char | manual | |
| status_retur | Status | dropdown | Ya | Draft/Diajukan/Disetujui/In-Transit/Selesai/Ditolak/Dibatalkan/Gagal Retur | enum (BR-008) | dikelola sistem |

### B. Form Item Retur (INPUT, baris detail) — terkait FR-003, FR-004
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| barang_id | Barang | lookup | Ya | barang valid di master & ada di penerimaan ref | master barang / tarik dari H2 | field kanonik (H4) |
| kategori | Kategori | dropdown/enum | Ya | dari master/enum kategori | lookup/enum | field kanonik (H4) |
| batch_no | No. Batch | text | Ya (farmasi) | sesuai batch penerimaan | tarik dari H2 | **BR-005** wajib utk farmasi |
| expired_date | Expired Date | date | Ya (farmasi) | tanggal valid | tarik dari H2 | utk barang ber-ED |
| jumlah_diterima | Jumlah Diterima | number | – | read-only | tarik dari H2 | acuan validasi BR-002 |
| jumlah_retur | Jumlah Retur | number | Ya | > 0 dan ≤ jumlah_diterima & ≤ stok tersedia | manual | **BR-002** |
| satuan | Satuan | dropdown | Ya | dari master satuan barang | lookup | |
| harga_satuan | Harga Satuan | number | Tidak | ≥ 0, format Rp | tarik dari H2 | utk nilai Nota Retur |
| kondisi_barang | Kondisi Barang | dropdown | Ya | Rusak / Mendekati ED / Tidak Sesuai Pesanan / Recall / Lainnya (default) | enum | |
| alasan_retur | Alasan Retur | dropdown | Ya | enum standar; "Lainnya" → catatan wajib | enum (BR-014) | |
| catatan_item | Catatan Item | text | Kondisional | wajib jika alasan = Lainnya | manual | **BR-014** |
| status_batch | Status Batch | dropdown | Tidak | Available / Reserved for QC / Mendekati ED | enum (H4) | auto set Reserved for QC bila rusak/ED (BR-006) |

### C. Form Persetujuan / Konfirmasi (INPUT) — terkait FR-007, FR-010
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| keputusan | Keputusan | dropdown | Ya | Setuju / Tolak | manual | role: PJ Gudang / Apoteker (BR-007) |
| alasan_keputusan | Alasan/Catatan | text | Kondisional | wajib bila Tolak | manual | Audit Trail |
| approver | Disetujui Oleh | lookup | Ya | user dengan role berwenang | auto dari sesi login | bukan pengaju (BR-007) |
| tgl_kirim | Tanggal Kirim | date | Ya (saat konfirmasi) | ≤ hari ini | manual | langkah In-Transit |
| penerima_supplier | Penerima (Supplier) | text | Ya (saat Selesai) | maks 100 char | manual | konfirmasi terima |
| no_ekspedisi | No. Ekspedisi/Pickup | text | Tidak | maks 50 char | manual | bukti pengiriman |

### D. Dashboard / List Retur Pembelian (TAMPIL) — terkait FR-001, FR-015
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Retur Bulan Ini | count retur where periode = bulan berjalan | angka besar (kartu) | – | ringkasan |
| Nilai Retur Bulan Ini | sum(jumlah_retur × harga_satuan) | Rp | – | ringkasan |
| Retur Menunggu Persetujuan | count where status=Diajukan | angka (badge) | – | ringkasan |
| No. Retur | retur.no_retur | text | sort terbaru, search | |
| Tanggal | retur.tanggal_retur | dd-mm-yyyy | sort | |
| Supplier | master Supplier.nama | text | filter | |
| No. SP/Penerimaan | retur.penerimaan_ref | text | search | |
| Jumlah Item | count item retur | angka | – | |
| Nilai Retur | sum nilai item | Rp | sort | |
| Status | retur.status_retur | badge berwarna (Diajukan/Disetujui/Selesai/Ditolak) | filter | enum BR-008 |

### E. Detail Retur (TAMPIL) — terkait FR-008, FR-014
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Header retur | retur.* | label-value | – | supplier, no SP, status, jenis kompensasi |
| Daftar item | item retur.* | tabel | – | barang, batch, ED, jumlah, kondisi, alasan |
| Nilai total | sum nilai item | Rp | – | dasar Nota Retur |
| Riwayat status | Audit Trail | timeline (user, waktu, aksi) | sort waktu | BR-011 |
| No. Nota Retur | nota_retur.no | text (format `NRP/YYYY/MM/NNNN`) + tombol cetak PDF | – | FR-014, BR-009 |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| **NFR-001** | Performa | Dashboard list retur tampil ≤ 3 detik untuk ≤ 1.000 record [ASUMSI]. |
| **NFR-002** | Keandalan stok | Operasi soft-reserve & deduksi stok bersifat **atomik/transaksional** — tidak boleh stok ganda terkurang atau reserve menggantung bila gagal. |
| **NFR-003** | Keamanan & Otorisasi | Akses berbasis **Role & Permission**; aksi setuju/tolak hanya untuk role berwenang; pemohon tak bisa menyetujui returnya sendiri (BR-007). |
| **NFR-004** | Auditability | Semua perubahan status tercatat di Audit Trail (immutable), termasuk user, waktu, alasan (BR-011). |
| **NFR-005** | Ketersediaan/Offline | Mengingat RS tipe C&D dengan internet tak stabil, fitur sebaiknya tetap berfungsi pada jaringan lokal; sinkronisasi data saat koneksi pulih [ASUMSI]. |
| **NFR-006** | Usability | UI sederhana, alur ≤ 4 langkah utama, bahasa Indonesia, sesuai SDM IT terbatas. |
| **NFR-007** | Konsistensi data | Field kanonik (unit, gudang, kategori, status_batch, barang_id) mengikuti definisi bersama lintas-PRD; tidak ada definisi tandingan. |
| **NFR-008** | Integritas referensial | Retur tidak dapat dibuat tanpa referensi penerimaan valid (BR-001); penghapusan master Supplier/Barang yang masih dipakai retur dicegah. |
| **NFR-009** | Compliance | Penanganan farmasi/NPP mengikuti SOP Narkotika & Psikotropika RS (NPP detail [Phase 2]). |
| **NFR-010** | Skalabilitas cetak | Nota Retur dapat dicetak/ekspor PDF konsisten untuk arsip & lampiran kurir. |

## 13. Integrasi Eksternal

Catatan: Retur Pembelian sebagian besar berintegrasi dengan **modul internal SIMRS**; integrasi eksternal nasional terbatas.

| Sistem | Jenis | Tujuan | Status |
|--------|-------|--------|--------|
| **Modul Keuangan** (internal) | API/event internal | Kirim **Nota Retur** sebagai referensi kompensasi/penggantian/credit note Supplier; pencatatan jurnal dilakukan di Keuangan | In Scope (referensi) — FR-011 |
| **Penerimaan Barang (H2)** (internal) | Lookup data | Sumber dokumen penerimaan, item, batch, ED, harga; basis BR-001 | In Scope |
| **Informasi Stok / Kartu Stok (H4/H5)** (internal) | Update stok | Soft-reserve, deduksi, pencatatan pergerakan jenis **Retur** | In Scope |
| **Master Supplier / Master Barang** (internal) | Lookup | Validasi supplier, barang, batch, satuan | In Scope |
| **Pemusnahan Barang (H9)** (internal) | Hand-off | Barang gagal retur diteruskan untuk pemusnahan | In Scope (hand-off) — FR-012 |
| **Audit Trail** (internal) | Logging | Jejak perubahan status retur | In Scope — FR-013 |
| **SATUSEHAT** | Interoperabilitas nasional | **Tidak relevan langsung** untuk retur pembelian (transaksi logistik internal-supplier) | Out / [PERLU KONFIRMASI] |
| **BPJS (VClaim/SEP), INA-CBG, Disdukcapil** | Nasional | **Tidak digunakan** pada Retur Pembelian | Out |
| **Portal Supplier eksternal** | API eksternal | Konfirmasi retur otomatis dari sistem Supplier — **[DIKONFIRMASI PO]** di MVP konfirmasi penerimaan Supplier dilakukan **MANUAL** oleh petugas (FR-010); integrasi portal ditunda | **[Phase 2]** |

*Catatan: blok integrasi nasional (BPJS/SATUSEHAT/Disdukcapil/INA-CBG) ada di konteks lintas-PRD, namun untuk modul logistik Retur Pembelian tidak dipakai langsung.*

## Asumsi
- [DIKONFIRMASI PO] Ambang nilai retur pemicu approval Manajer Logistik (BR-013) = Rp 10.000.000 (default), dapat dikonfigurasi pada Pengaturan Inventory.
- [DIKONFIRMASI PO] Alur 'Minta Klarifikasi'/'Klarifikasi' TIDAK termasuk dalam fitur ini; approver hanya Setuju/Tolak (revisi dilakukan dengan membuat retur baru / Batal lalu ajukan ulang).
- [DIKONFIRMASI PO] Format penomoran Nota Retur Pembelian: NRP/YYYY/MM/NNNN (nomor urut 4 digit reset per bulan, gapless), selaras konvensi Modul Keuangan (BR-009).
- [DIKONFIRMASI PO] Ambang ED minimum saat penerimaan = standar RS tipe C & D (default mis. 6 bulan), namun dapat dikonfigurasi user pada fitur Pengaturan (BR-015).
- [DIKONFIRMASI PO] Konfirmasi Supplier menerima retur dilakukan manual oleh petugas; tidak ada integrasi portal Supplier di MVP (FR-010).
- [DIKONFIRMASI PO] Semua jenis kompensasi (penggantian barang / credit note / refund) didukung Keuangan di MVP (BR-017).
- [DIKONFIRMASI PO] Retur partial lintas-batch dalam satu dokumen penerimaan diperbolehkan dalam satu transaksi retur (BR-016).
- [ASUMSI] Alur As-Is/To-Be & gateway diturunkan dari analogi BPMN g-backoffice-inventory-penerimaan, -distribusi, -stok-opname, dan g-support-pharmacy-retur karena H8 belum punya BPMN sendiri.
- [ASUMSI] PRD ini fokus pada Retur Pembelian (Gudang → Supplier) saja; jenis retur lain (Distribusi/Mutasi/Pemakaian) berada di PRD terpisah dalam modul Retur Barang yang sama.
- [ASUMSI] Stok berkurang saat retur Disetujui (bukan saat diajukan); saat diajukan hanya soft-reserve, sesuai mekanisme pada lampiran PRD_Retur_Barang.docx.
- [ASUMSI] Mode offline/sinkronisasi dipertimbangkan karena keterbatasan internet RS tipe C&D, namun implementasinya perlu dikonfirmasi.
- [ASUMSI] Integrasi nasional (BPJS/SATUSEHAT/Disdukcapil/INA-CBG) tidak dipakai pada modul logistik Retur Pembelian.
- [ASUMSI] Workflow NPP dan approval berjenjang nilai besar dijadwalkan Phase 2 sesuai lampiran.
- [ASUMSI] Target metrik (waktu approval, % rekonsiliasi) bersifat indikatif dan perlu validasi manajemen RS.

## Pertanyaan Terbuka
- SLA approval retur (timeout & reminder) — berapa lama sebelum eskalasi?
- Detail workflow NPP (approval ganda Apoteker) — apakah benar ditunda ke Phase 2 untuk RS tipe C&D?