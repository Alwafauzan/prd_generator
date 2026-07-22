# PRD — Inventory: Mutasi Stok (Mutasi Barang Antar Unit)

**Related Document:** PRD Master Modul Inventory; PRD Informasi Stok per Unit [H4]; PRD Distribusi Barang [H3]; PRD Penggunaan Barang Unit [H11]; PRD Stok Opname [H6]; PRD Master Data Unit/Instalasi/Barang Farmasi/Barang Rumah Tangga; PRD Role & Permission; PRD Audit Trail; SOP Pengelolaan Narkotika & Psikotropika RS; Design Figma — Mutasi Barang (https://www.figma.com/board/rNUY2jYduSWeliI4PHBRru/Mutasi-Barang)
**Versi:** 1.0 - Draft awal

## 1. Overview / Brief Summary

Fitur **Mutasi Stok (Mutasi Barang)** mencatat dan mengelola **perpindahan barang antar unit yang setara (peer-to-peer)** di lingkungan RS Tipe C & D. Berbeda dari **Distribusi Barang [H3]** yang bersifat top-down (gudang → unit), mutasi adalah perpindahan **antar unit** (mis. Rawat Inap → IGD) tanpa melalui gudang.

Fitur melibatkan dua peran unit:
- **Unit Peminta** — unit yang membutuhkan barang dan mengajukan permintaan ke unit lain.
- **Unit Tujuan** — unit pemilik stok yang menerima permintaan dan memutuskan tindakan (Approve / Adjustment / Reject).

Mutasi memastikan setiap pergerakan barang **terdokumentasi, terotorisasi oleh role berwenang di Unit Tujuan**, dan memengaruhi stok secara real-time melalui mekanisme:
1. **Soft-reservation** stok saat permintaan diajukan (mencegah double-promise / race condition antar permintaan).
2. **Deduksi** stok Unit Tujuan saat persetujuan.
3. **Akumulasi** stok Unit Peminta saat konfirmasi penerimaan.

**Highlight:**
- Tracking **batch & expired date (FEFO)** untuk barang farmasi. [Sumber: Lampiran]
- Aturan khusus **Narkotika, Psikotropika, Prekursor (NPP)** disiapkan untuk Phase 2. [PERLU KONFIRMASI scope phase]
- **Role hierarchy eksplisit**: Petugas/staf Unit (request only), PJ Shift/Kepala Unit (full action).
- **Urgency tag**: Normal / Urgent / Cito.
- Status **Dalam Pengiriman** eksplisit agar total stok RS tetap dapat direkonsiliasi selama barang dalam perjalanan fisik.

**Skenario contoh:** IGD kehabisan masker N95, Rawat Inap punya kelebihan. Petugas IGD membuat permintaan mutasi *Cito* ke Rawat Inap. PJ Shift Rawat Inap menerima badge counter, melihat stok (termasuk batch & ED), lalu **Approve** → stok Rawat Inap berkurang, status menjadi *Dalam Pengiriman*. Setelah fisik dikirim, PJ Shift IGD melakukan **Konfirmasi Penerimaan** → stok IGD bertambah, mutasi *Selesai*.

## 2. Background

Sebelum ada fitur Mutasi Stok terintegrasi, perpindahan barang antar unit dilakukan **informal** (telepon/chat) tanpa dokumentasi. Permasalahan: [Sumber: Lampiran PRD Mutasi Barang]

1. Tidak ada pencatatan resmi pergerakan barang antar unit → menyulitkan stok opname [H6].
2. Stok unit pengirim tidak otomatis berkurang & stok unit penerima tidak otomatis bertambah.
3. Tidak ada otorisasi formal dari Unit Tujuan — barang bisa diambil tanpa persetujuan kepala unit.
4. Sulit menelusuri riwayat permintaan, terutama bila ada selisih jumlah diminta vs diterima.
5. Unit Tujuan tidak punya visibility ketersediaan stoknya sendiri sebelum memutuskan.
6. Tidak ada jaminan kepatuhan regulasi farmasi (UU No. 35/2009 Narkotika; Permenkes No. 3/2015 Peredaran NPP; Permenkes No. 72/2016 Standar Pelayanan Kefarmasian di RS). [Sumber: Lampiran]
7. Audit eksternal & akreditasi (SNARS/STARKES) tidak terpenuhi karena tidak ada dokumen mutasi sah.

**Konteks RS Tipe C & D:** SDM & gudang terbatas, sering terjadi saling pinjam stok antar unit secara ad-hoc; fitur ini memberi jalur resmi yang ringan namun terdokumentasi. Internet bisa tidak stabil → pertimbangkan indikator status sinkronisasi. [ASUMSI]

**Dengan Mutasi Stok v1.0**, setiap perpindahan dicatat digital dengan workflow:
Permintaan (dengan urgency) → Review (opsi Request Klarifikasi) → Tindakan (Approve / Reject / Adjustment) → Pengiriman fisik (status *Dalam Pengiriman*) → Konfirmasi Penerimaan (opsi lapor diskrepansi).

## 3. In Scope

### Scope Definition (yang dikerjakan — Phase 1)
1. Menu **Inventaris → Mutasi Stok**.
2. **Dashboard Mutasi** dengan filter Urgency, Status, Unit Tujuan/Asal, Range Tanggal + **Badge Counter** permintaan masuk.
3. **Buat Permintaan Mutasi** dengan **Urgency Tag** (Normal / Urgent / Cito).
4. **Pembatalan Permintaan** oleh Unit Peminta sebelum tindakan final Unit Tujuan, dengan **validasi konkurensi** (kasus 2 UI dibuka bersamaan: cancel oleh peminta vs approve oleh pemberi). [Sumber: Lampiran]
5. **Lihat Detail Permintaan** + Daftar Barang Unit Tujuan (info **batch & ED** untuk Farmasi, FEFO).
6. **Tindakan**: Approve / Reject / Adjustment (pemenuhan parsial).
7. **Soft-Reservation** stok saat permintaan diajukan.
8. **Konfirmasi Penerimaan** oleh Unit Peminta, dengan opsi **lapor diskrepansi** (selisih jumlah/kondisi).
9. Status **Dalam Pengiriman** untuk rekonsiliasi total stok RS.
10. **Request Klarifikasi** dari Unit Tujuan ke Unit Peminta.
11. **Audit trail** tiap aksi (siapa minta/setuju/ubah, kapan, qty disepakati, batch terpakai, alasan).
12. Role hierarchy: staf (request only) vs PJ Shift/Kepala Unit (full action).

### Out Scope (TIDAK dikerjakan di Phase 1)
- Cetak **Dokumen Mutasi PDF + QR verifikasi** → Phase 2. [Sumber: Lampiran]
- Aturan khusus **NPP (Narkotika/Psikotropika/Prekursor)** lengkap → Phase 2. [PERLU KONFIRMASI]
- **Retur barang mutasi** (pengembalian sisa) penuh → [PERLU KONFIRMASI phase].
- Mutasi gudang↔unit (itu domain **Distribusi [H3]**).
- Pengadaan/pemesanan ke supplier (domain **Pemesanan [H1]**).
- Penyesuaian akuntansi/COA persediaan (domain Keuangan / Stok Opname [H6]).
- Mode offline penuh (hanya indikator status sinkron). [ASUMSI]

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Seluruh perpindahan barang antar unit terdokumentasi | % mutasi tercatat di sistem vs total mutasi aktual | ≥ 95% dalam 3 bulan [ASUMSI] |
| Otorisasi formal Unit Tujuan | % mutasi yang melewati approval PJ Shift/Kepala Unit | 100% |
| Akurasi stok unit | Selisih stok sistem vs fisik saat opname [H6] turun | < 2% [ASUMSI] |
| Kecepatan respon mutasi Cito | Median waktu Permintaan → Tindakan untuk urgency Cito | ≤ 15 menit [ASUMSI/PERLU KONFIRMASI] |
| Cegah double-promise | Jumlah insiden stok minus akibat mutasi | 0 |
| Kepatuhan audit/akreditasi | Tersedianya dokumen/audit trail mutasi saat audit | 100% transaksi punya jejak |
| Transparansi diskrepansi | % penerimaan dengan selisih yang terlapor (bukan diam-diam) | ≥ 90% [ASUMSI] |

## 5. Related Feature

Fitur terkait dalam cluster **Backoffice → Inventory** (List Fitur MVP):

| Code | Menu | Relasi dengan Mutasi Stok |
|------|------|---------------------------|
| H1 | Pemesanan Barang | Sumber pengadaan eksternal (alternatif bila tak ada unit yang bisa memutasi) |
| H2 | Penerimaan Barang | Pola konfirmasi penerimaan & validasi partial mirip |
| H3 | Distribusi Barang | Perpindahan gudang→unit (top-down); Mutasi = peer-to-peer (komplemen) |
| **H4** | **Informasi Stok** | **Sumber stok unit + batch/ED yang ditampilkan & dikurangi/ditambah** |
| **H5** | **Mutasi Stok** | **Modul ini** |
| H6 | Stok Opname | Mengonsumsi hasil mutasi; status *Dalam Pengiriman* perlu direkonsiliasi |
| H7 | Peminjaman & Pengembalian Barang | Mirip alur, beda niat (pinjam-kembali vs pindah permanen) |
| H11 | Penggunaan Barang Unit | Konsumsi stok unit setelah mutasi diterima |

Referensi master: Master Data **Unit (A3)**, Instalasi, **Barang Farmasi**, **Barang Rumah Tangga**; **Role & Permission**; **Audit Trail**.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — diturunkan dari Background & analogi BPMN distribusi]
1. Unit A kekurangan barang, menghubungi Unit B via telepon/chat.
2. Unit B mengecek stok manual, menyetujui lisan, menyerahkan barang fisik.
3. Tidak ada potongan/penambahan stok di sistem; pencatatan (bila ada) di kertas/Excel terpisah.
4. Saat stok opname [H6] muncul selisih yang sulit ditelusuri.

### B. To-Be (kondisi diharapkan) [diturunkan dari Lampiran + analogi g-backoffice-inventory-distribusi & g-backoffice-inventory-stok-opname]
```
Unit Peminta                 Sistem                         Unit Tujuan (PJ Shift/Kepala)
-----------                  ------                         -----------------------------
Buat Permintaan Mutasi  ──►  Soft-reservation stok? 
(item, qty, urgency)         (tidak kurangi fisik,
                              tandai ter-reserve)  ──►  Badge counter +1, list permintaan
                                                         Buka detail + lihat stok sendiri
                                                         (batch & ED, FEFO)
                                                              │
                                            ┌──── Stok cukup? ─┴── Request Klarifikasi ──► (balik ke Peminta)
                                            │
                           Keputusan: Approve / Adjustment / Reject
                                            │
        ┌───────────────────────────────────┼───────────────────────────────┐
      Approve                            Adjustment(parsial)                Reject
        │                                    │                                │
  Sistem deduksi stok Tujuan           deduksi qty disetujui            lepas reservasi,
  pilih batch FEFO                     (sisa tak dipenuhi)              status Ditolak (+alasan)
  status = Dalam Pengiriman ◄──────────────┘
        │
  (barang dikirim fisik)
        ▼
Konfirmasi Penerimaan  ──►  Stok Peminta += qty diterima
(qty diterima / lapor          tutup mutasi: status Selesai
 diskrepansi)                   (jika diskrepansi → catat selisih)
```
Gateway diturunkan dari pola **"Sesuai?"/"Disetujui?"** (g-backoffice-inventory-stok-opname) dan **"Stok Item Cukup?"** (g-service-tindakan-bhp). [ASUMSI mapping]

## 7. Main Flow / Mindmap

**Skenario Utama (Happy Path) — Approve penuh:**
1. Petugas/PJ Unit Peminta buka **Inventaris → Mutasi Stok → Buat Permintaan**.
2. Pilih **Unit Tujuan**, tambah **item** (cari barang, qty), set **Urgency** (Normal/Urgent/Cito), isi keterangan. Submit.
3. Sistem membuat mutasi status **Menunggu Persetujuan**, melakukan **soft-reservation** di Unit Tujuan, menaikkan **badge counter** Unit Tujuan.
4. PJ Shift/Kepala Unit Tujuan buka detail, melihat **stok unit-nya** (batch & ED, FEFO).
5. PJ Shift menekan **Approve**.
6. Sistem **mengurangi stok Unit Tujuan** (pilih batch FEFO), set status **Dalam Pengiriman**, catat audit trail.
7. Barang dikirim fisik.
8. PJ Shift/Petugas Unit Peminta menekan **Konfirmasi Penerimaan** (qty sesuai).
9. Sistem **menambah stok Unit Peminta** (batch diwariskan), set status **Selesai**.

**Skenario Alternatif:**
- **A1 Adjustment (parsial):** stok Tujuan tak cukup → PJ Shift set qty disetujui < diminta + alasan → deduksi sebagian → *Dalam Pengiriman*.
- **A2 Reject:** PJ Shift menolak + alasan → reservasi dilepas → status **Ditolak**.
- **A3 Request Klarifikasi:** PJ Shift minta klarifikasi → status **Perlu Klarifikasi** → Peminta merespon → kembali ke review.
- **A4 Pembatalan oleh Peminta:** sebelum tindakan final → status **Dibatalkan**, reservasi dilepas. **Validasi konkurensi (BR-008):** jika Tujuan sedang meng-Approve di saat bersamaan, sistem tolak aksi yang kalah dan tampilkan notifikasi konflik.
- **A5 Diskrepansi saat penerimaan:** qty fisik ≠ qty dikirim → Peminta lapor diskrepansi → catat selisih, status **Selesai dengan Diskrepansi** untuk ditindaklanjuti (opname/retur). [PERLU KONFIRMASI penanganan selisih]
- **A6 Timeout:** mutasi tanpa tindakan dalam batas waktu → flag/escalation. [ASUMSI — disebut di Lampiran sebagai edge case]

## 8. Business Rules

- **BR-001** Mutasi hanya antar **Unit** yang setara; tidak boleh Unit asal = Unit tujuan. (traceability: Buat Permintaan)
- **BR-002** Hanya role **PJ Shift / Kepala Unit** di Unit Tujuan yang boleh Approve/Adjustment/Reject; staf biasa **request only**. (Role & Permission)
- **BR-003** Saat permintaan diajukan, sistem melakukan **soft-reservation**: qty diminta ditandai ter-reserve di Unit Tujuan dan **tidak boleh dipromisikan ke mutasi lain** (cegah double-promise). (analogi "Stok Item Cukup?" g-service-tindakan-bhp)
- **BR-004** Stok fisik Unit Tujuan **baru berkurang saat Approve/Adjustment**, sejumlah qty disetujui. (g-backoffice-inventory-distribusi: "mengurangi stok di unit yang mengonfirmasi")
- **BR-005** Stok Unit Peminta **baru bertambah saat Konfirmasi Penerimaan**. Selama transit status = **Dalam Pengiriman** (masuk total stok RS, bukan stok unit manapun yang dapat dipakai).
- **BR-006** Barang **farmasi** wajib memilih **batch dengan FEFO** (First-Expired-First-Out); ED & batch ikut berpindah ke Unit Peminta. (Lampiran)
- **BR-007** **Adjustment** memerlukan **alasan**; **Reject** memerlukan **alasan**. Reservasi qty yang tidak dipenuhi otomatis dilepas.
- **BR-008** **Validasi konkurensi pembatalan vs approval**: bila Peminta membatalkan dan Tujuan menyetujui hampir bersamaan, hanya satu aksi yang menang (optimistic lock / versi record); aksi yang kalah ditolak dengan notifikasi. (Lampiran — kasus 2 UI dibuka berbarengan)
- **BR-009** Permintaan hanya bisa **dibatalkan oleh Unit Peminta** dan hanya **sebelum** tindakan final Unit Tujuan.
- **BR-010** Qty diminta & qty disetujui **> 0** dan **≤ stok tersedia** (tersedia = on-hand − ter-reserve). 
- **BR-011** Setiap transisi status menulis **audit trail** (aktor, waktu, qty, batch, alasan). (PRD Audit Trail)
- **BR-012** **NPP** (Narkotika/Psikotropika/Prekursor) memerlukan otorisasi/pencatatan tambahan sesuai UU 35/2009 & Permenkes 3/2015 → **Phase 2**. [PERLU KONFIRMASI]
- **BR-013** Konfirmasi Penerimaan dengan **diskrepansi** wajib mencatat selisih & alasan; tidak boleh menutup mutasi diam-diam. (analogi "penerimaan partial" g-backoffice-inventory-penerimaan)

## 9. User Stories

- **US-001** Sebagai **Petugas Unit Peminta**, saya ingin membuat permintaan mutasi dengan tag urgency, agar kebutuhan mendesak (Cito) diprioritaskan. (source: "Sistem menampilkan form permintaan distribusi" — g-backoffice-inventory-distribusi)
- **US-002** Sebagai **Petugas Unit Peminta**, saya ingin menambah/menghapus item dalam satu permintaan, agar bisa minta beberapa barang sekaligus. (source: "Input item tambahan / Hapus item")
- **US-003** Sebagai **Unit Peminta**, saya ingin membatalkan permintaan yang belum ditindak, agar stok tidak ter-reserve sia-sia. (source: edge case pembatalan — Lampiran)
- **US-004** Sebagai **PJ Shift Unit Tujuan**, saya ingin melihat badge counter & daftar permintaan masuk, agar tahu ada mutasi yang menunggu. (source: "Sistem menampilkan list permintaan distribusi pada dashboard")
- **US-005** Sebagai **PJ Shift Unit Tujuan**, saya ingin melihat stok unit saya beserta batch & ED saat memutuskan, agar keputusan akurat dan FEFO terjaga. (source: Lampiran)
- **US-006** Sebagai **PJ Shift Unit Tujuan**, saya ingin menyetujui / menyesuaikan (parsial) / menolak permintaan dengan alasan, agar pemenuhan sesuai ketersediaan. (source: keputusan "Disetujui?" — g-backoffice-inventory-stok-opname)
- **US-007** Sebagai **PJ Shift Unit Tujuan**, saya ingin meminta klarifikasi ke Unit Peminta, agar tidak salah memenuhi permintaan ambigu. (source: edge case klarifikasi — Lampiran)
- **US-008** Sebagai **Unit Peminta**, saya ingin mengonfirmasi penerimaan dan melaporkan diskrepansi, agar stok yang masuk akurat. (source: "penerimaan partial" — g-backoffice-inventory-penerimaan)
- **US-009** Sebagai **Kepala Unit / Auditor**, saya ingin melihat riwayat & audit trail mutasi, agar memenuhi akreditasi (SNARS/STARKES). (source: Lampiran)
- **US-010** Sebagai **Sistem**, saya ingin mereservasi stok saat permintaan dibuat, agar tidak terjadi double-promise antar permintaan. (source: "Stok Item Cukup?" — g-service-tindakan-bhp)

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menampilkan **Dashboard Mutasi** berisi list mutasi (sebagai peminta & tujuan) dengan filter Urgency, Status, Unit, Range Tanggal, dan **badge counter** permintaan masuk. | US-004; g-...-distribusi |
| **FR-002** | Sistem menyediakan **form Buat Permintaan**: pilih Unit Tujuan, tambah item (cari barang + qty), set Urgency, keterangan. | US-001/002 |
| **FR-003** | Sistem melakukan **soft-reservation** stok Unit Tujuan saat permintaan disimpan (status Menunggu Persetujuan). | US-010; BR-003 |
| **FR-004** | Sistem menampilkan **Detail Permintaan** + daftar stok Unit Tujuan dengan batch & ED (FEFO) untuk farmasi. | US-005; BR-006 |
| **FR-005** | Sistem menyediakan tindakan **Approve / Adjustment / Reject** (Adjustment & Reject wajib alasan). | US-006; BR-007 |
| **FR-006** | Saat Approve/Adjustment, sistem **mengurangi stok Unit Tujuan** sejumlah qty disetujui memilih batch FEFO, set status **Dalam Pengiriman**. | BR-004/005/006 |
| **FR-007** | Sistem menyediakan **Request Klarifikasi** (status Perlu Klarifikasi) dan jalur respon dari Unit Peminta. | US-007 |
| **FR-008** | Sistem menyediakan **Pembatalan** oleh Unit Peminta sebelum tindakan final, dengan **validasi konkurensi** (optimistic lock). | US-003; BR-008/009 |
| **FR-009** | Sistem menyediakan **Konfirmasi Penerimaan** + input qty diterima & **lapor diskrepansi**; menambah stok Unit Peminta; set status Selesai / Selesai dengan Diskrepansi. | US-008; BR-013 |
| **FR-010** | Sistem mencatat **audit trail** setiap transisi status (aktor, waktu, qty, batch, alasan). | US-009; BR-011 |
| **FR-011** | Sistem menampilkan **status & timeline** mutasi (Menunggu Persetujuan → Disetujui/Disesuaikan/Ditolak/Dibatalkan → Dalam Pengiriman → Selesai). | US-009 |
| **FR-012** | Sistem memvalidasi qty (>0, ≤ stok tersedia = on-hand − reserved) dan mencegah Unit asal = Unit tujuan. | BR-001/010 |
| **FR-013** [Phase 2] | Cetak **Dokumen Mutasi PDF + QR** verifikasi. | Out Scope P1 |

## 11. Data Requirements (Spesifikasi Field)

### A. Layar INPUT — Form Buat Permintaan Mutasi (header) — FR-002
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_mutasi | No. Mutasi | text | Ya | unik; pola `MT-YYYYMM-#####` [PERLU KONFIRMASI] | auto-generate | dibuat sistem saat simpan |
| unit_asal | Unit Peminta | dropdown(lookup) | Ya | dari master **Unit (A3)**; = unit user login | auto/lookup A3 | mengikuti definisi kanonik `unit` |
| unit_tujuan | Unit Tujuan | dropdown(lookup) | Ya | dari master **Unit (A3)**; ≠ unit_asal (BR-001) | lookup A3 | mengikuti `unit` kanonik |
| urgency | Urgency | dropdown/enum | Ya | Normal / Urgent / Cito | enum, default Normal | prioritas tampilan |
| tgl_permintaan | Tanggal Permintaan | date | Ya | ≤ hari ini | auto (now) | |
| keterangan | Keterangan | text | Tidak | maks 255 char | manual | **field kanonik** (reuse) |
| status | Status | dropdown/enum | Ya | Menunggu Persetujuan/Perlu Klarifikasi/Disetujui/Disesuaikan/Ditolak/Dibatalkan/Dalam Pengiriman/Selesai/Selesai dengan Diskrepansi | sistem | read-only bagi user |
| pemohon | Nama Pemohon | text | Ya | maks 100 char | autofill dari Staff | reuse `nama` kanonik |

### B. Layar INPUT — Detail Item Permintaan (baris item) — FR-002
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| kode_barang | Kode Barang | lookup | Ya | unik; pola `RT-#####` [PERLU KONFIRMASI] | lookup master barang | reuse kanonik `kode_barang` |
| nama_barang | Nama Barang | text | Ya | maks 150 char | autofill master | reuse kanonik `nama_barang` |
| kategori_barang | Kategori Barang | lookup | Tidak | dari master **Kategori Barang (A33)** | autofill | reuse kanonik; menentukan apakah farmasi/NPP |
| satuan | Satuan | text | Ya | dari master item | autofill | reuse kanonik `satuan` |
| qty_minta | Qty Diminta | number | Ya | >0; ≤ stok tersedia Unit Tujuan (BR-010) | manual | |
| qty_setuju | Qty Disetujui | number | Kondisional | 0..qty_minta; diisi saat Approve/Adjustment | input Unit Tujuan | parsial bila < qty_minta |
| qty_terima | Qty Diterima | number | Kondisional | 0..qty_setuju; saat Konfirmasi Penerimaan | input Unit Peminta | selisih → diskrepansi |
| batch | No. Batch | lookup | Kondisional (farmasi) | dari stok batch Unit Tujuan, FEFO (BR-006) | lookup Informasi Stok [H4] | wajib utk farmasi |
| expired_date | Expired Date (ED) | date | Kondisional (farmasi) | > hari ini; ikut batch | autofill dari batch | FEFO |
| alasan | Alasan | text | Kondisional | maks 255 char; wajib utk Adjustment/Reject (BR-007) | manual | reuse pola `deskripsi` |

### C. Layar INPUT — Konfirmasi Penerimaan / Diskrepansi — FR-009
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| qty_terima | Qty Diterima | number | Ya | 0..qty_setuju | manual | |
| ada_diskrepansi | Ada Selisih? | boolean | Ya | true/false | default false | bila qty_terima ≠ qty_setuju → true |
| catatan_diskrepansi | Catatan Diskrepansi | text | Kondisional | maks 255 char; wajib bila ada_diskrepansi | manual | BR-013 |

### D. Layar TAMPIL — Dashboard Mutasi Stok — FR-001
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Badge Permintaan Masuk | count mutasi where unit_tujuan = unit user & status=Menunggu Persetujuan | angka badge | – | kartu/ikon notifikasi |
| No. Mutasi | mutasi.no_mutasi | text | sort terbaru | |
| Unit Asal / Tujuan | mutasi.unit_asal/unit_tujuan | text | filter Unit | |
| Urgency | mutasi.urgency | badge warna (Cito=merah) | filter; sort prioritas | |
| Tanggal | mutasi.tgl_permintaan | dd-mm-yyyy | sort | |
| Status | mutasi.status | badge status | filter Status | |
| Jumlah Item | count item per mutasi | angka | – | |

### E. Layar TAMPIL — Detail + Stok Unit Tujuan (FEFO) — FR-004
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama Barang | item.nama_barang | text | sort A-Z | |
| Stok Tersedia | Informasi Stok [H4] (on-hand − reserved) | angka | – | warna merah bila < qty diminta |
| Batch | stok_batch.batch | text | sort ED asc (FEFO) | farmasi |
| Expired Date | stok_batch.expired_date | dd-mm-yyyy + badge (mendekati ED) | sort | warna oranye bila < 90 hari [ASUMSI] |
| Qty Diminta | item.qty_minta | angka | – | |
| Qty Disetujui | item.qty_setuju | angka editable saat tindakan | – | |

## 12. Non-Functional Requirements

- **NFR-001 (Konkurensi/Integritas)** Operasi reservasi, deduksi, dan penambahan stok harus **atomik & transaksional**; penanganan race condition via optimistic lock/versi record (BR-008). Tidak boleh stok minus.
- **NFR-002 (Performa)** Dashboard & detail tampil ≤ 3 detik untuk ≤ 1.000 mutasi aktif. [ASUMSI]
- **NFR-003 (Auditability)** Semua transisi status tersimpan immutable di audit trail, dapat diekspor untuk akreditasi.
- **NFR-004 (Keamanan/Otorisasi)** Aksi terbatas per role (Role & Permission): staf request-only; PJ Shift/Kepala Unit full action. Aksi NPP butuh otorisasi tambahan (Phase 2).
- **NFR-005 (Ketersediaan)** Real-time update stok antar unit; bila internet tidak stabil (Tipe C/D), tampilkan **indikator status sinkronisasi** dan cegah aksi pada data basi. [ASUMSI]
- **NFR-006 (Usability)** Urgency Cito harus menonjol secara visual; alur tindakan ≤ 3 klik dari notifikasi. [ASUMSI]
- **NFR-007 (Konsistensi data)** Status *Dalam Pengiriman* harus dapat direkonsiliasi di Stok Opname [H6] agar total stok RS akurat.
- **NFR-008 (Kepatuhan)** Mendukung pemenuhan SNARS/STARKES & regulasi farmasi (dokumen/jejak mutasi).

## 13. Integrasi Eksternal

Modul Mutasi Stok bersifat **internal antar-unit**; **tidak ada integrasi eksternal (BPJS/SATUSEHAT/Disdukcapil) yang wajib** di Phase 1. [ASUMSI]

**Integrasi internal (antar modul SIMRS):**
| Sumber | Arah | Keterangan |
|--------|------|-----------|
| Master Data **Unit (A3)** / Instalasi | baca | sumber Unit Asal & Tujuan |
| Master Data **Barang Farmasi / Rumah Tangga** + **Kategori Barang (A33)** | baca | sumber item, satuan, klasifikasi (farmasi/NPP), pola batch & ED |
| **Informasi Stok [H4]** | baca + tulis | sumber stok per unit & batch (FEFO); reservasi/deduksi/akumulasi stok |
| **Stok Opname [H6]** | tulis (status) | status *Dalam Pengiriman* perlu direkonsiliasi |
| **Penggunaan Barang Unit [H11]** | hilir | konsumsi stok hasil mutasi |
| **Role & Permission** | baca | otorisasi staf vs PJ Shift/Kepala Unit |
| **Audit Trail** | tulis | jejak setiap aksi |
| **Notifikasi internal** | tulis | badge counter & alert Cito ke Unit Tujuan |

**Phase 2:** pencetakan **Dokumen Mutasi PDF + QR** (kemungkinan butuh layanan QR/verifikasi internal) dan kepatuhan **NPP** (pencatatan sesuai regulasi). [PERLU KONFIRMASI]

## Asumsi
- [ASUMSI] Alur As-Is & beberapa gateway diturunkan dari analogi BPMN distribusi, stok opname, penerimaan, dan tindakan-BHP karena modul Mutasi Stok belum punya BPMN sendiri.
- [ASUMSI] RS target Tipe C & D dengan internet kadang tidak stabil → ditambahkan indikator status sinkronisasi (NFR-005), tanpa mode offline penuh.
- [ASUMSI] Soft-reservation diimplementasikan sebagai kolom 'reserved' pada Informasi Stok [H4]; stok tersedia = on-hand − reserved.
- [ASUMSI] Field kanonik (unit, keterangan, satuan, kode_barang, nama_barang, nama, status_aktif, kategori_barang) direuse dari kamus lintas-PRD agar konsisten dengan modul lain.
- [ASUMSI] Target metrik (95% tercatat, <2% selisih, median Cito ≤15 menit) adalah angka awal yang perlu validasi manajemen.
- [ASUMSI] Status mutasi lengkap (Menunggu Persetujuan → ... → Selesai) diturunkan dari deskripsi workflow di Lampiran PRD Mutasi Barang dan disesuaikan penamaannya.
- [ASUMSI] Warna badge ED (oranye < 90 hari) sebagai default UI, belum ditetapkan kebijakan RS.

## Pertanyaan Terbuka
- Apakah penanganan NPP (Narkotika/Psikotropika/Prekursor) benar-benar ditunda ke Phase 2, atau ada subset minimal yang wajib di Phase 1? [BR-012]
- Format & pola penomoran No. Mutasi (MT-YYYYMM-#####) — apakah sesuai standar penomoran RS?
- Penanganan tindak lanjut diskrepansi penerimaan: apakah otomatis membuat selisih untuk opname, retur, atau penyesuaian manual? [A5]
- Adakah batas waktu (timeout) & mekanisme eskalasi untuk mutasi yang tidak ditindak, khususnya urgency Cito? [A6]
- Apakah retur barang mutasi (pengembalian sisa) masuk Phase 1 atau Phase berikutnya?
- Apakah RS Tipe C & D ini benar membutuhkan tracking batch & ED penuh (FEFO), atau hanya untuk kategori farmasi tertentu?
- Target SLA respon mutasi Cito (≤15 menit) perlu dikonfirmasi manajemen.
- Definisi pola kode_barang (RT-##### vs format farmasi) — perlu disamakan lintas modul inventory.