# PRD — Inventory: Pemesanan Barang Farmasi

**Kode Fitur:** H1
**PIC Product:** Baim, Fauzan
**Disetujui oleh:** M. Sulthan Farras Nanz — Chief Strategy & Growth Officer Tamtech International
**Related Document:** PRD Pemisahan SP RJ-RI; Template SP Farmasi; Design Figma
**Versi:** 1.0
**Tanggal:** 2026-06-13

---

## 1. Overview / Brief Summary

Fitur **Pemesanan Barang — Barang Farmasi (H1)** adalah modul untuk mengelola proses pembuatan, persetujuan, dan pelacakan **Surat Pemesanan (SP)** obat dan alat kesehatan farmasi ke supplier/PBF, yang dirancang khusus untuk RS Tipe C dan D di Indonesia.

**Konteks RS Tipe C dan D:**
- **RS Tipe C:** pelayanan medik spesialistik dasar, kapasitas 100–200 TT, umumnya RS daerah/swasta tingkat kabupaten.
- **RS Tipe D:** pelayanan medik dasar, kapasitas < 100 TT.
- Karakteristik operasional: struktur organisasi ramping, Bagian Logistik & Farmasi sering di-merge, manajemen direct & responsive. Volume transaksi 50–200 SP/bulan.

**Karakteristik khusus Farmasi** yang ditangani modul ini (tidak ada di pemesanan kategori barang lain):
- Workflow khusus NPP (Narkotika, Psikotropika, Prekursor) sesuai UU 35/2009 & Permenkes 3/2015.
- Approval mandatory APJ sesuai PP 51/2009 tentang Pekerjaan Kefarmasian.
- Validasi Formularium RS — obat di luar formularium memerlukan justifikasi APJ + KFT review.
- Validasi minimum ED at delivery (default 18 bulan).
- Cold chain awareness untuk vaksin dan obat tertentu.

**Penyesuaian v2 untuk RS Tipe C/D:**
- Approval flow **2-tier**: Staf Gudang → Kepala Gudang → APJ (final approver).
- Tidak ada Manajer Logistik/Keuangan terpisah.
- Validasi **CDOB dihilangkan** dari sistem — diserahkan ke APJ secara operasional/manual.
- Validasi NPP, Formularium, dan ED at Delivery **tetap ada** (regulasi mandatori).

**Scope pengguna:**
- RS Tipe C & D yang menggunakan SIMRS Neurovi.
- Kategori barang: Farmasi (Obat, Alkes Farmasi, BHP Farmasi).
- Role yang diberi akses: Staf Gudang Farmasi (pembuat), Kepala Gudang Farmasi (approver tier 1), APJ (final approver).

---

## 2. Background

Pengadaan obat dan alat kesehatan di RS adalah proses yang *highly regulated* dan kritikal terhadap operasional pelayanan pasien. Untuk RS Tipe C dan D dengan struktur organisasi yang lebih ramping, kompleksitas workflow yang sama dengan RS Tipe A/B akan membebani operasional. PRD v2 ini menyederhanakan workflow tanpa mengorbankan compliance regulasi farmasi yang wajib.

**Pain point sebelum sistem digital:**
- Pembuatan SP manual dengan typewriter atau Excel/Word — sering ada typo dan inkonsistensi.
- Validasi compliance manual: APJ harus cek NPP regulation manual, cek formularium manual — rawan kesalahan, terutama APJ yang sering tidak full-time.
- Audit trail lemah: saat audit BPOM, akreditasi, atau internal, sulit traceback siapa approve apa kapan.
- Duplikasi pemesanan: tanpa visibility ke PO outstanding, sering terjadi pemesanan ganda untuk obat yang sama.
- Tidak ada visibility status: Staf sering follow-up via telepon ke supplier atau cek arsip manual.
- Audit BPOM & akreditasi STARKES sulit dilakukan karena dokumen tersebar.

**Pertimbangan khusus RS Tipe C/D:**
- Tim Farmasi kecil (3–8 orang): 1 APJ, 1–2 TTK (Kepala Gudang Farmasi), 2–5 Staf Gudang/Farmasi.
- APJ sering tidak full-time (kunjungan beberapa hari per minggu) — workflow tidak boleh terlalu bergantung pada APJ presence.
- Resource IT terbatas: sistem harus simple, intuitive, dan minimal training.
- Volume transaksi lebih rendah: tidak perlu workflow approval multi-layer yang kompleks.

**Dengan PRD v2 ini, fitur Pemesanan Barang Farmasi menjadi:**
- Sesuai konteks operasional RS Tipe C/D — workflow sederhana 2-tier yang efisien.
- Tetap compliant terhadap UU 35/2009 Narkotika, Permenkes 72/2016 Standar Pelayanan Kefarmasian RS, PP 51/2009 Pekerjaan Kefarmasian.
- Memiliki audit trail lengkap untuk akreditasi STARKES dan audit BPOM.
- Mengotomasi validasi NPP, formularium, dan minimum ED at delivery.
- Workflow approval 2-tier yang clear: Staf Gudang (buat) → Kepala Gudang (review) → APJ (final approve).

---

## 3. In Scope

### Legend Phase
| Simbol | Phase |
|--------|-------|
| *(tanpa simbol)* | Phase 1 |
| `[**]` | Phase 2 |
| `[***]` | Phase 3 |
| `[****]` | Phase 4 |

### Scope yang Dikerjakan

| No | Scope / Area | Phase |
|----|-------------|-------|
| 1 | Dashboard Pemesanan Barang Farmasi dengan filter & search | Phase 1 |
| 2 | Buat Surat Pemesanan (SP) baru | Phase 1 |
| 3 | Edit Surat Pemesanan | Phase 1 |
| 4 | Lihat Detail SP (read-only untuk status yang sudah Approved) | Phase 1 |
| 5 | State Machine dengan 9 status (Dibuat, Menunggu Persetujuan Kepala Gudang, Menunggu Persetujuan APJ, Approved/Belum Diterima, Diterima Sebagian, Sudah Diterima, Ditolak, Dibatalkan, Expired) | Phase 1 |
| 6 | Snapshot Master Data (Barang, Supplier, Harga HNA) saat SP submit | Phase 1 |
| 7 | Workflow approval 2-tier: Staf Gudang → Kepala Gudang | Phase 1 |
| 8 | Cetak SP dalam format PDF resmi RS | Phase 1 |
| 9 | Batalkan SP | Phase 1 |
| 10 | Audit Trail / Riwayat Aktivitas | Phase 1 |
| 11 | Drag and Drop List Barang Pemesanan | Phase 1 |
| 12 | `[**]` Role & Otorisasi (RBAC) | Phase 2 |
| 13 | `[**]` Konfirmasi Penerimaan langsung dari Detail SP (shortcut UX) | Phase 2 |
| 14 | `[**]` Validasi Formularium RS | Phase 2 |
| 15 | `[**]` Workflow khusus NPP (Narkotika/Psikotropika/Prekursor) dengan validasi PBF khusus | Phase 2 |
| 16 | `[**]` Validasi minimum ED at delivery (default 18 bulan, configurable per barang) | Phase 2 |
| 17 | `[**]` Pemisahan SP RJ-RI — generate 2 SP otomatis dari 1 input | Phase 2 |
| 18 | `[**]` Export data SP ke Excel/CSV | Phase 2 |
| 19 | `[**]` Notifikasi push & email untuk approval & status change | Phase 2 |
| 20 | `[**]` Integrasi otomatis dengan modul Rencana Pengadaan (generate SP dari Rencana) | Phase 2 |
| 21 | `[**]` Validasi PO outstanding (warning jika ada PO untuk barang yang sama) | Phase 2 |
| 22 | `[**]` Tracking nomor seri kemasan NPP saat Penerimaan | Phase 2 |
| 23 | `[***]` Dashboard Visual untuk analisis pemesanan (trend, supplier performance) | Phase 3 |
| 24 | `[***]` Riwayat Transaksi terkonsolidasi per supplier | Phase 3 |
| 25 | `[***]` Persetujuan Direktur RS untuk SP bernilai besar | Phase 3 |
| 26 | `[****]` Vendor scoring & auto-recommendation supplier | Phase 4 |
| 27 | `[****]` Integrasi SIPNAP untuk pelaporan NPP otomatis | Phase 4 |

### Out Scope

| No | Scope |
|----|-------|
| 1 | Pemesanan Barang Rumah Tangga (PRD terpisah) |
| 2 | Pemesanan Barang Gizi (PRD terpisah) |
| 3 | Modul Rencana Pengadaan (PRD terpisah, integrasi di Phase 2) |
| 4 | Modul Penerimaan Barang (PRD terpisah, integrasi via API) |
| 5 | Modul Keuangan (Persediaan & Pembayaran) — integrasi via API only |
| 6 | Pembayaran DP / Down Payment ke supplier (handled by Modul Keuangan) |
| 7 | Validasi CDOB Supplier otomatis — diserahkan ke APJ secara operasional/manual |
| 8 | Negosiasi harga dengan supplier (manual offline) |
| 9 | Kontrak supplier jangka panjang (handled by Modul Master Supplier) |
| 10 | Pelaporan SIPNAP Narkotika ke BPOM otomatis (Phase 4) |
| 11 | Integrasi langsung dengan Bridging BPJS / SatuSehat untuk obat |
| 12 | Multi-currency procurement (default Rupiah saja) |
| 13 | Workflow Manajer Logistik & Manajer Keuangan terpisah |
| 14 | Integrasi E-Katalog LKPP (spesifik RS BLU, tidak relevan RS Tipe C/D swasta) |
| 15 | Auction / tender otomatis dengan multiple supplier |

---

## 4. Goals and Metrics

**Goals:**
1. Memudahkan Staf Gudang Farmasi membuat, mencetak, dan memantau SP dengan workflow yang disesuaikan untuk RS Tipe C/D.
2. Memastikan compliance terhadap regulasi farmasi Indonesia (UU 35/2009 Narkotika, Permenkes 72/2016, PP 51/2009).
3. Menyediakan audit trail lengkap untuk audit BPOM, akreditasi STARKES, dan internal audit.
4. Mengotomasi validasi NPP, formularium RS, dan minimum ED at delivery.
5. Mengintegrasikan data dengan Rencana Pengadaan, Penerimaan Barang, dan Keuangan untuk hindari duplikasi.
6. Mempercepat proses approval 2-tier dengan SLA jelas, mengakomodasi APJ yang tidak full-time.

**Metrics:**

| No | Metrics | Success Criteria |
|----|---------|-----------------|
| 1 | Compliance NPP | 100% SP obat NPP melalui workflow khusus dengan approval ganda Kepala Gudang + APJ |
| 2 | Akurasi Data Antar Modul | 100% data SP konsisten dengan Rencana, Penerimaan, dan Persediaan; selisih < 1% |
| 3 | Transparansi Audit Trail | 100% transaksi SP tercatat dengan field: user, role, action, before-after, timestamp, IP |
| 4 | Waktu Pembuatan SP | Staf dapat membuat & submit SP dengan ≤ 50 items dalam ≤ 5 menit |
| 5 | Waktu Approval Kepala Gudang (P95) | P95 ≤ 2 jam untuk SP Normal; ≤ 30 menit untuk Cito |
| 6 | Waktu Approval APJ (P95) | P95 ≤ 24 jam untuk SP Normal (mengakomodasi APJ part-time); ≤ 4 jam untuk Cito |
| 7 | Waktu Cetak SP | PDF SP dapat di-download/cetak dalam ≤ 30 detik setelah Approved |
| 8 | Reduction in Order Errors | Reduksi error pemesanan dari baseline X (manual) ke Y (sistem) minimum 70% |
| 9 | Penghematan Waktu Operasional | Reduksi waktu admin pengadaan dari 2 jam/SP (manual) ke ≤ 20 menit/SP |
| 10 | Formularium Compliance | 100% SP untuk obat formularium tanpa override; SP non-formularium dengan justifikasi APJ |

---

## 5. Related Feature

| Module | Feature | Integration Detail |
|--------|---------|-------------------|
| Master Data | Barang Farmasi | Sumber data master barang: nama, kode, kategori, formularium status, NPP status, ED requirements, harga HNA, satuan, preferred supplier |
| Master Data | Unit | Untuk menentukan tujuan gudang pemesanan |
| Master Data | Supplier | Sumber data supplier: nama PBF, status aktif, is_active_pbf_for_npp, lead_time, payment_terms, bank info |
| Master Data | User & Role | RBAC: role Staf Gudang Farmasi, Kepala Gudang Farmasi, APJ, Direktur RS, Auditor |
| Inventory | Rencana Pengadaan | Phase 2: generate SP otomatis dari Rencana yang Approved. Phase 1: manual reference Nomor Rencana di field optional |
| Inventory | Penerimaan Barang | Downstream: SP Approved muncul di dashboard Penerimaan. Saat Penerimaan disimpan: status SP auto-update ke Diterima Sebagian / Sudah Diterima |
| Inventory | Informasi Stok | API check stok current: warning jika SP untuk barang yang masih over-stock |
| Keuangan | Persediaan & Pembelian | API ke Modul Keuangan: validasi budget (warning only); commit budget saat SP Approved |

---

## 6. Business Process

### 6.1 As-Is (Kondisi Saat Ini — Manual / Sistem Lama)

- Staf Gudang Farmasi mengetik SP secara manual di Word / Excel / dokumen fisik.
- Data barang, supplier, dan harga diinput berulang kali, sering ada typo dan inkonsistensi.
- Validasi compliance manual: APJ harus cek manual referensi sertifikat supplier dari arsip fisik.
- Validasi NPP manual: untuk Narkotika, harus cek manual SK Penunjukan PBF untuk Narkotika dari Kemenkes.
- Validasi Formularium manual: APJ check buku formularium fisik.
- Approval routing manual: SP fisik di-print, dijalankan dari meja Staf → Kepala Gudang → APJ. Di RS Tipe C/D dengan APJ part-time, SP sering menunggu APJ datang ke RS.
- Tidak ada visibility status: Staf tidak tahu SP mereka stuck di approver siapa, sering follow-up manual via WhatsApp/telepon.
- Audit trail sulit: saat audit BPOM atau akreditasi, harus cari arsip fisik SP yang tercecer.
- Duplikasi pemesanan sering terjadi karena tidak ada visibility ke PO outstanding.

### 6.2 To-Be (Kondisi yang Diharapkan dengan Fitur Pemesanan v2)

1. Staf Gudang Farmasi buka menu **Inventaris → Pemesanan Barang Farmasi**.
2. Dashboard menampilkan list SP dengan filter status, supplier, daterange, dan search by nomor SP.
3. Klik tombol **[+]** untuk Buat SP baru.
4. Form Tambah SP: pilih Supplier (filter: status aktif saja); tambah items dengan auto-fill harga & satuan.
5. Sistem real-time validate: barang NPP? → trigger workflow khusus; obat non-formularium? → require justifikasi; total > budget? → warning.
6. Staf klik **Submit**. Sistem snapshot master data (Supplier, Barang, Harga) saat ini. Generate Nomor SP unik.
7. Staf dapat menyimpan sebagai **Dibuat** (status = Dibuat, dapat diedit kembali).
8. Setelah Submit: status → "Menunggu Persetujuan". Notifikasi otomatis ke Kepala Gudang Farmasi.
9. Kepala Gudang Farmasi buka SP, validate kebutuhan & qty. Approve atau reject dengan alasan.
10. Setelah approve: Status → "Belum Diterima". SP otomatis muncul di Dashboard Penerimaan Barang.
11. Staf dapat **Cetak SP** format PDF resmi RS untuk dikirim ke supplier.
12. Setelah barang diterima via modul Penerimaan: status SP auto-update ke "Diterima Sebagian" atau "Sudah Diterima".
13. **Khusus NPP**: workflow dengan validasi PBF yang ditunjuk pemerintah; approval ganda Kepala Gudang + APJ wajib; `[**]` tracking nomor seri kemasan saat Penerimaan (Phase 2).

---

## 7. Main Flow / State Diagram

### State Machine Lifecycle SP

```
START
  └─► [Dibuat]
         ├─ Submit ──────────────────► [Menunggu Persetujuan Kepala Gudang]
         └─ Cancel ──────────────────► [Dibatalkan]

[Menunggu Persetujuan Kepala Gudang]
         ├─ Approve ─────────────────► [Belum Diterima]
         ├─ Reject ──────────────────► [Ditolak]
         ├─ Edit & Save ─────────────► [Dibuat] (return)
         └─ Cancel ──────────────────► [Dibatalkan]

[Belum Diterima]
         ├─ Penerimaan partial ──────► [Diterima Sebagian]
         ├─ Penerimaan full ─────────► [Sudah Diterima]
         └─ > 90 hari tanpa aktivitas► [Expired] (Phase 2)

[Diterima Sebagian]
         ├─ Penerimaan tambahan ─────► [Diterima Sebagian] (terus)
         └─ Semua item diterima ─────► [Sudah Diterima]

[Sudah Diterima]   → TERMINAL (tidak ada transition)
[Ditolak]          → TERMINAL (view & referensi saja)
[Dibatalkan]       → TERMINAL (view untuk audit)
[Expired]          → TERMINAL (auto-cancel oleh sistem)
```

**Catatan state khusus NPP:**
- Menunggu Persetujuan Kepala Gudang → Menunggu Persetujuan APJ = WAJIB DUA-DUANYA.
- Tidak boleh skip Kepala Gudang untuk NPP (compliance UU 35/2009).
- Approval Kepala Gudang wajib include verifikasi PBF NPP.

**Perbandingan v2.0 vs v2.1:**
| Versi | Approval Flow |
|-------|--------------|
| v2.0 (RS Tipe B) | Staf → APJ (tier 1) → Manajer Logistik (tier 2) → Manajer Keuangan (tier 3) |
| v2.1 (RS Tipe C/D) | Staf → Kepala Gudang (tier 1) → APJ FINAL (tier 2) |

### Role & Otorisasi

Matrix Role × Aksi untuk RS Tipe C/D:

| Role | Buat Dibuat | Submit | Edit Dibuat | Edit Submitted | Approve Kepala Gudang | Batal | Lihat | Cetak |
|------|------------|--------|-------------|----------------|----------------------|-------|-------|-------|
| Staf Gudang Farmasi | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ (own SP, sebelum approved) | ✓ (own SP) | ✓ |
| Kepala Gudang Farmasi | ✓ | ✓ | ✓ | ✓ (during approval) | ✓ | ✓ (any SP Gudang, justifikasi) | ✓ (semua SP Gudang) | ✓ |
| Direktur RS / Manajemen | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (emergency override) | ✓ (semua) | ✓ |
| Auditor Internal | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (read-only) | ✓ (read-only) |

**Catatan Struktur Organisasi RS Tipe C/D:**
- Unit Gudang Farmasi: hanya 2 role — Staf Gudang Farmasi dan Kepala Gudang Farmasi.
- Tidak ada Manajer Logistik terpisah; fungsi merged ke Kepala Gudang Farmasi.
- Tidak ada Manajer Keuangan dalam workflow approval default — validasi budget sebagai warning only.

### Detail State Machine

| Status | Kategori | Deskripsi | Allowed Transitions |
|--------|---------|-----------|---------------------|
| Dibuat | Initial | SP baru dibuat oleh Staf Gudang, belum di-submit. Hanya pembuat yang bisa edit. Belum generated No SP. | Submit → Menunggu Persetujuan; Cancel → Dibatalkan |
| Menunggu Persetujuan | In Approval Tier 1 | Menunggu Persetujuan Kepala Gudang Farmasi. Kepala Gudang dapat edit minor untuk koreksi. Generated No SP. | Approve → Belum Diterima; Reject → Ditolak; Edit & save → Dibuat (return); Cancel → Dibatalkan; `[***]` Submit → Persetujuan Keuangan |
| `[***]` Persetujuan Keuangan | In Approval Tier 3 | SP yang telah disetujui Kepala Gudang, diteruskan ke Kepala Keuangan. | Setuju → Belum Diterima; Setuju (dengan perubahan kuantitas) → Belum Diterima; Tolak → Ditolak |
| Belum Diterima | Approved, awaiting goods | SP sudah lengkap approval. Otomatis muncul di Dashboard Penerimaan Barang. Tidak dapat di-edit lagi. | Penerimaan partial → Diterima Sebagian; Penerimaan full → Sudah Diterima; > 90 hari tanpa aktivitas → Expired (Phase 2) |
| Diterima Sebagian | Partial received | Sebagian items sudah diterima. Sisanya menunggu pengiriman selanjutnya. | Penerimaan tambahan → Diterima Sebagian atau Sudah Diterima; tidak bisa di-Cancel |
| Sudah Diterima | Terminal | Semua items sudah diterima. SP closed. Stok ter-update di Modul Persediaan. | Tidak ada transition. Hanya view & cetak untuk audit. |
| Ditolak | Terminal | SP di-reject oleh Kepala Gudang atau APJ dengan alasan. | Tidak ada transition. View untuk audit & referensi pembuatan SP baru. |
| Dibatalkan | Terminal | SP di-cancel oleh pembuat atau approver dengan alasan. Tidak ada efek ke modul lain. | Tidak ada transition. View untuk audit. |
| `[**]` Expired | Terminal auto | Auto-cancel oleh sistem jika SP Approved > 90 hari tanpa Penerimaan. | Tidak ada transition. |

---

## 8. Business Rules

| ID | Konteks | Field/Aspek | Rule | Error Message | Trigger |
|----|---------|-------------|------|---------------|---------|
| BR-V.1 | Header SP | Tanggal Pemesanan | Tidak boleh backdate (< today) | Tanggal pemesanan tidak boleh sebelum hari ini. | Submit |
| BR-V.2 | Header SP | Tanggal Pemesanan | Tidak boleh > today + 7 hari | Tanggal pemesanan maksimum 7 hari ke depan. | Submit |
| BR-V.3 | Header SP | Supplier | is_active=true required | Supplier tidak aktif. Tidak dapat dipilih. | Submit |
| BR-V.4 | Header SP | Urgency Cito | Keterangan mandatory min 20 char | Cito requires justification min 20 characters. | Submit |
| BR-V.5 | Header SP | NPP Item Detection | Jika ada item NPP, Supplier harus is_active_pbf_for_npp=true | Supplier tidak terdaftar sebagai PBF Narkotika. Tidak dapat untuk SP-NPP. | Add Item / Submit |
| BR-V.6 | Items | Qty | Min 0.001, Max 999,999 | Qty tidak valid. Range: 0.001 – 999,999. | Real-time |
| BR-V.7 | Items | Qty | Tidak boleh 0 atau negatif | Qty harus > 0. | Real-time |
| BR-V.8 | Items | Harga Unit | Tidak boleh 0 atau negatif | Harga harus > 0. | Real-time |
| BR-V.9 | Items | Duplicate Barang | Tidak boleh duplikat barang dalam satu SP | Barang sudah ada di SP. Akan otomatis di-merge qty? | Add Item |
| BR-V.10 | Items | Min 1 row | SP harus berisi minimal 1 item | SP harus berisi minimal 1 barang. | Submit |
| BR-V.11 | Items | Max 200 rows | Maksimum 200 items per SP | SP melebihi 200 items. Pisah menjadi multiple SP. | Add Item |
| BR-V.12 | Items | Non-Formularium | Justifikasi mandatory min 20 char | Obat non-formularium memerlukan justifikasi minimal 20 karakter. | Submit |
| BR-V.13 | Items | Override Harga | Justifikasi mandatory min 10 char | Override harga memerlukan justifikasi minimal 10 karakter. | Submit |
| BR-V.14 | Items | Cold Chain | Warning saat tambah barang cold chain | Barang memerlukan cold chain. Pastikan supplier dapat handle. | Add Item |
| BR-V.15 | SP-NPP | Approval Ganda | WAJIB approve Kepala Gudang + APJ | SP-NPP wajib approval ganda. Kepala Gudang tidak dapat di-skip. | Approval Flow |
| BR-V.16 | SP-NPP | SPN Attachment | Upload PDF SPN mandatory untuk APJ approve | Upload Surat Pesanan Narkotika (PDF) wajib untuk lanjutkan approval. | APJ Approve |
| BR-V.17 | Budget | Total > Budget | Warning only (tidak blocking di v2.1) | Total SP [Rp X] melebihi sisa budget [Rp Y]. Lanjutkan? | Submit / Approval |
| BR-V.18 | Concurrent Edit | Version Mismatch | Optimistic locking dengan version field | SP ini telah diubah oleh user lain. Refresh untuk lihat versi terbaru. | Save |
| BR-V.19 | Status Transition | Invalid Transition | Validate against State Machine rules | Transisi status tidak valid. Status saat ini: [X], target: [Y]. | Action |
| BR-V.20 | Role Permission | Insufficient Permission | Validate role × action di RBAC matrix | Anda tidak memiliki permission untuk aksi ini. | Action |
| BR-V.21 | Editing After Approval | Immutability | SP Approved+ tidak boleh di-edit | SP sudah Approved. Untuk perubahan, batalkan & buat SP baru. | Edit |
| BR-V.22 | Cancel Restriction | Cannot cancel after partial received | Status Diterima Sebagian / Sudah Diterima tidak boleh di-Cancel | SP sudah ada barang yang diterima. Tidak dapat dibatalkan. | Cancel |
| BR-V.23 | Audit Trail | Mandatory action logging | Semua aksi WAJIB di-log ke audit trail | (System error — log failed) | Any Action |

---

## 9. User Stories

**User Story Utama:** Sebagai Admin Gudang Farmasi, saya dapat mengelola data pemesanan barang ke supplier, agar proses pemesanan barang menjadi lebih efisien, transparan, dan akuntabel.

| Kode | Fitur | User Story | Priority |
|------|-------|-----------|----------|
| FR1 | Dashboard | Sebagai Admin Gudang Farmasi, saya dapat melihat dashboard data SP yang pernah dibuat, agar data SP bisa terpantau dengan baik. | P0 |
| FR2 | Tambah SP | Sebagai Admin Gudang Farmasi, saya dapat membuat Surat Pemesanan (SP), agar pemesanan barang ke supplier dapat dilakukan. | P0 |
| FR3 | Submit SP | Sebagai Staf Gudang Farmasi, saya dapat submit SP untuk approval, agar SP dapat diproses oleh Kepala Gudang. | P0 |
| FR4 | Approval/Reject | Sebagai Kepala Gudang Farmasi, saya dapat review & approve/reject SP Farmasi sebelum di-forward ke APJ. | P0 |
| FR5 | Update SP | Sebagai Admin Gudang Farmasi, saya dapat mengubah detail SP dengan status Dibuat/Menunggu Persetujuan. | P0 |
| FR6 | Detail SP | Sebagai Admin Gudang Farmasi, saya dapat melihat detail SP, agar data SP yang pernah dibuat bisa dipantau. | P1 |
| FR7 | Batal SP | Sebagai pembuat atau approver, saya dapat membatalkan SP dengan justifikasi, agar SP yang tidak relevan dapat di-void tanpa hapus history. | P1 |
| FR8 | Cetak SP | Sebagai Admin Gudang, saya dapat mencetak SP, agar pihak di luar Gudang dapat melihat tanpa akses langsung ke sistem. | P1 |
| FR9 | Riwayat Aktivitas | Sebagai admin, saya dapat mengetahui kapan, oleh siapa, dan apa data tersebut diaktivitaskan. | P0 |
| FR10 | `[**]` Konfirmasi Penerimaan | Sebagai Admin Gudang Farmasi, saya dapat langsung melakukan konfirmasi Penerimaan dari Detail SP, tanpa perlu membuka menu Penerimaan lagi. | P2 |
| FR11 | `[**]` Pemisahan SP RJ-RI | Sebagai Admin Gudang Farmasi, saya dapat membuat SP otomatis untuk beberapa kategori SP dalam 1 form pemesanan. | P1 |
| FR12 | `[**]` Data Penerimaan Barang | Sebagai Admin Gudang Farmasi, saya dapat melihat data Penerimaan Barang terkait pada halaman Detail SP. | P2 |

---

## 10. Functional Requirements

### FR1 — Dashboard Pemesanan Barang Farmasi

**Criteria Details:**
- Terdapat tabel dengan kolom: Tanggal Pemesanan, Nomor SP, Nama Supplier, `[**]` Total Item, Perkiraan Biaya, `[**]` Urgency, Status SP, Aksi.
- Semua kolom dapat diklik untuk sorting.
- Filter: Daterange Tanggal Pemesanan (default 30 hari terakhir), Nama Supplier, Status SP, `[**]` Urgency.
- Search by: Nomor SP, Nama Supplier.
- Pagination: 10 data/halaman.
- Default sort: Nomor SP descending (terbaru di atas); `[**]` dikelompokkan berdasarkan urgensi (Cito/Urgent/Normal).
- Indikator Status: Dibuat (abu), Menunggu Persetujuan (kuning), Belum Diterima (biru), Diterima Sebagian (hijau muda), Sudah Diterima (hijau), Ditolak/Dibatalkan (merah).
- Kolom Aksi: Edit (Dibuat/Menunggu Persetujuan), Detail, Cetak SP (Approved+), Batal, `[**]` Konfirmasi Penerimaan (Approved/Diterima Sebagian).
- Visibility per role: Staf Gudang Farmasi hanya lihat SP yang dia buat; Kepala Gudang & Auditor lihat semua SP Farmasi.

**Acceptance Criteria:**
- AC1: Dashboard load dalam ≤ 2 detik untuk 500 records dengan pagination.
- AC2: Filter Daterange, Nama Supplier (multi-select), Status SP (multi-select) berfungsi.
- AC3: Search by Nomor SP, Nama Supplier, Item Name — real-time dengan debounce 300ms.
- AC4: Default sort Nomor SP descending, dapat diatur ascending/descending.
- AC5: Setiap kolom dapat diklik untuk sorting.
- AC6: Indikator status menggunakan color coding sesuai ketentuan.
- AC7: Kolom Aksi sesuai matriks role/status.
- AC9: Visibility per role diterapkan dengan benar.
- AC10: Hanya menampilkan SP barang farmasi.
- `[**]` AC11: No SP dikelompokkan berdasarkan urgensi (Normal/Urgent/Cito), Cito selalu di atas.

---

### FR2 — Tambah Pemesanan

**Criteria Details:**
- Tombol ➕ → tampilkan view Tambah Pemesanan (overlay). Tooltip: "Tambah Pemesanan".
- Section **Data Pemesanan** (Form Header): Gudang tujuan, Tanggal Pemesanan, No SP, Nama Supplier, `[**]` Urgency, Keterangan, Perkiraan Biaya.
- Section **Data Barang**: Nama Barang, Jumlah Pemesanan, Satuan, Harga, `[**]` Diskon, Sub Total, Tambah/Hapus baris.
- Section `[**]` **Form Total**: Total, PPN (%), Total PPN, Grand Total.
- Tiap baris dapat dipindahkan via Drag and Drop.
- Minimal 1 baris data untuk dapat menyimpan.
- `[**]` Kolom Jumlah Pemesanan sesuai konfigurasi Kategori SP dari Master Data (aturan detail di PRD Pemisahan SP RJ-RI).

**Acceptance Criteria:**
- AC1: Sub Total = Qty × Harga, dikalkulasi real-time.
- AC2: Qty dan Harga tidak boleh ≤ 0 atau negatif.
- AC4: Tombol "Simpan Dibuat" tidak memvalidasi semua mandatory field (kecuali Supplier). Tombol "Ajukan/Submit" memvalidasi seluruh mandatory field.
- `[**]` AC5: Grand Total = Sum of Sub Total + PPN.
- AC6: Kategori disimpan sebagai Unit Gudang Farmasi secara hardcoded/hidden berdasarkan menu.
- AC7: Tiap baris dapat dipindahkan via Drag and Drop sesuai preferensi user.

---

### FR3 — Submit SP

**Criteria Details:**
- Tombol Submit di bottom form.
- Sistem validate semua mandatory field, snapshot master data, generate Nomor SP, set status, dan notify approver pertama (Kepala Gudang).

**Acceptance Criteria:**
- AC1: Tombol Submit aktif hanya bila semua mandatory field terisi & valid.
- AC2: Klik Submit: konfirmasi dialog "Submit SP ini untuk approval?"
- AC3: Sistem snapshot master data saat submit: nama supplier, nama barang, satuan, harga HNA.
- AC4: Generate Nomor SP final di submit (format: `SP-FRM-MMYYXXXX`, counter reset bulanan, UNIQUE global).
- AC5: Status berubah Dibuat → Menunggu Persetujuan.
- `[**]` AC6: Notifikasi otomatis ke Kepala Gudang Farmasi (in-app Phase 1; email & push Phase 2).
- AC9: Audit trail entry: SP_SUBMITTED dengan user, timestamp, IP.
- AC10: Setelah submit: redirect ke Dashboard dengan SP baru highlighted di paling atas.

---

### FR4 — Approval / Reject

**Criteria Details:**
- Kepala Gudang buka SP detail → tombol Approve, Reject.
- Kepala Gudang dapat lihat semua SP dengan status Menunggu Persetujuan di dashboard (filter default).

**Acceptance Criteria:**
- AC1: Kepala Gudang dapat lihat semua SP Menunggu Persetujuan di dashboard.
- AC2: Edit minor oleh Kepala Gudang: sistem record audit "Edited by Kepala Gudang: field X dari Y ke Z".
- AC3: Approve: konfirmasi dialog. Status → Belum Diterima.
- AC4: Reject: dialog muncul, mandatory input "Alasan Penolakan" (min 20 char). Status → Ditolak.
- AC5: SLA tracking: warning kuning pada SP jika sudah lewat 2 jam (Normal) / 30 menit (Cito) tanpa action.
- AC6: Audit trail: APPROVED / REJECTED dengan user_id, alasan, timestamp.

---

### FR5 — Update Pemesanan

**Criteria Details:**
- Edit aksesibel berdasarkan role & status (lihat Role & Otorisasi matrix).
- Form mirip Tambah SP dengan semua data ter-prefill.
- Tombol Edit Pemesanan muncul di kolom Aksi jika status SP = Dibuat atau Menunggu Persetujuan.
- Field yang dapat di-edit: Tanggal Pemesanan, Nama Supplier, Keterangan, `[**]` Urgensi, Nama Barang, Harga.
- Tombol Update di bawah. Setelah save → redirect ke Dashboard.

**Acceptance Criteria:**
- AC1: Staf Gudang Farmasi (pembuat) dapat edit SP status Dibuat & Menunggu Persetujuan.
- AC2: Kepala Gudang Farmasi dapat edit selama SP di Menunggu Persetujuan.
- AC3: Audit trail untuk setiap edit: action, field name, before-after, user, timestamp.
- `[**]` AC4: Auto-save draft setiap 30 detik (Phase 2).
- AC5: Concurrent edit detection: optimistic locking dengan version field. Save kedua: prompt merge.

---

### FR6 — Detail Pemesanan

**Criteria Details:**
- Tombol Detail Pemesanan muncul di kolom Aksi jika status = Belum Diterima, Dibatalkan, Diterima Sebagian, atau Sudah Diterima.
- Tampilan overlay. Semua kolom data disabled (tidak bisa diedit).
- Tombol Cetak SP di bagian bawah. Tombol Kembali di sebelah kiri.

**Acceptance Criteria:**
- AC1: Section utama: header data SP (read-only).
- AC2: Section Items: tabel items & subtotal.
- AC3: Section Penerimaan Barang: list Nomor Faktur, Tanggal Penerimaan, Status. Jika lebih dari 1, tampilkan semua dengan klik untuk drill-down.
- AC5: Tombol Cetak SP aktif untuk status Approved+; hidden untuk Dibuat & Ditolak.
- `[**]` AC6: Tombol Konfirmasi Penerimaan aktif untuk Approved & Diterima Sebagian.
- AC7: Tombol Batal aktif sesuai matriks role/status.

---

### FR7 — Batal Pemesanan

**Acceptance Criteria:**
- AC1: Pembuat (Staf Gudang Farmasi): dapat Batal SP status Dibuat & Menunggu Persetujuan (sebelum Kepala Gudang action).
- AC2: Kepala Gudang Farmasi: dapat Batal SP status Menunggu Persetujuan atau `[***]` Persetujuan Keuangan.
- AC5: TIDAK boleh Batal: status Diterima Sebagian, Sudah Diterima (sudah ada physical movement).
- AC6: Dialog Batal: "Yakin batal SP ini? Aksi ini tidak dapat di-undo." + textarea "Alasan Pembatalan" (mandatory, min 100 char).
- AC7: Setelah Batal: status → Dibatalkan (terminal). Tidak ada efek ke modul lain.
- AC8: Audit trail: CANCELLED dengan user, role, alasan, timestamp.

---

### FR8 — Cetak SP

**Criteria Details:**
- Klik Aksi → Cetak SP → muncul format Surat Pemesanan dalam format PDF.
- User dapat unduh ke internal storage device.

**Acceptance Criteria:**
- AC1: Terdapat tombol Cetak SP pada Detail SP dengan Status Belum Diterima.
- AC2: Terdapat tombol Cetak SP pada Aksi dengan Status Belum Diterima.
- AC3: Format Cetak SP sesuai format sistem (template resmi RS).
- AC4: File terunduh ke internal storage user.
- AC5: File berformat PDF.

---

### FR9 — Riwayat Aktivitas (Audit Trail)

**Criteria Details:**
- Sistem menyimpan data history aktivitas berupa:
  - Tanggal & waktu (format: dd/mm/yyyy HH:MM)
  - User ID / Nama yang melakukan action
  - Aktivitas action: Dibuat, Diubah, Dicetak, Disetujui, Ditolak
  - Data yang diubah: `Field: data sebelumnya → data update`
- Contoh: *Dibuat oleh 111/Agus pada 11/09/2026 13:13*
- Contoh: *Diubah oleh 222/Joko pada 12/09/2026 09:01 — Alamat: Solo → Jogja; No Telp: 0983717131 → 0931111112*

**Acceptance Criteria:**
- AC1: Riwayat aktivitas ditampilkan untuk setiap aktivitas setiap dokumen pemesanan.
- AC2: Tercatat sesuai format.
- AC3: Aktivitas tercatat sesuai action user.

---

### FR10 — `[**]` Konfirmasi Penerimaan dari Detail SP (Phase 2)

**Criteria Details:**
- Ketika Status SP = Belum Diterima atau Diterima Sebagian, pada halaman Detail SP terdapat tombol Konfirmasi Penerimaan.
- Klik → tampilkan halaman Penerimaan Barang (aturan detail di PRD Penerimaan Barang).
- Saat data Penerimaan disimpan: jika qty_received >= qty_ordered → status SP → Sudah Diterima; jika qty_received < qty_ordered → status SP → Diterima Sebagian.

---

### FR11 — `[**]` Pemisahan SP RJ-RI (Phase 2)

**Criteria Details:**
- Jika toggle "Pemisahan RJ/RI" aktif di sistem, ketika user klik Submit, sistem men-generate 2 Nomor SP berbeda (satu berakhiran -RJ, satu -RI) dan membagi Qty sesuai alokasi.
- Aturan detail di PRD Pemisahan SP RJ-RI.

---

### FR12 — `[**]` Data Penerimaan Barang di Detail SP (Phase 2)

**Criteria Details:**
- Section Data Penerimaan Barang di halaman Detail SP.
- Kolom: Nomor Faktur | Tanggal Penerimaan.
- Dapat muncul lebih dari 1 data (untuk SP Diterima Sebagian).
- Klik → buka halaman/tab baru halaman Detail Penerimaan.

---

## 11. Data Requirements

### A. Dashboard Pemesanan Barang

| No | Data | Keterangan |
|----|------|-----------|
| 1 | Tanggal Pemesanan | Sumber: Detail Pemesanan Barang — Tanggal Pemesanan |
| 2 | Nomor SP | Sumber: Detail Pemesanan Barang — No. Pemesanan |
| 3 | Nama Supplier | Sumber: Detail Pemesanan Barang — Supplier |
| — | `[**]` Total Item | Sum [Total Item Barang] |
| 4 | Perkiraan Biaya | Sumber: Detail Pemesanan Barang — Grand Total |
| — | `[**]` Urgensi | Sumber: Detail → Urgensi |
| 5 | Status SP | Sesuai State Machine |
| — | Aksi | Buttons (Setuju / Tolak / Detail / Edit / Cetak / Batal / `[**]` Konfirmasi Penerimaan) — dihitung berdasarkan role + status |

### B. Tambah Pemesanan

#### B.1. Section Data Pemesanan (Form Header)

| No | Field | Tipe | Keterangan |
|----|-------|------|-----------|
| — | Gudang tujuan | Dropdown | Sumber: Master Data Unit — flag "Gudang". Mandatory. Auto-set ke Gudang Farmasi unit user yang login. Tidak dapat di-edit user. |
| 1 | Tanggal Pemesanan | Datepicker | Default: hari ini. Format: DD/MM/YYYY. Tidak boleh backdate. Mandatory. |
| — | Nomor SP | Auto-generated | Format: `SP-FRM-MMYYXXXX`. Counter reset bulanan. UNIQUE global. Generated saat submit (status = Menunggu Persetujuan). |
| 2 | Nama Supplier | Single Dropdown | Sumber: Master Data Supplier — is_aktif. Mandatory. Default: null. |
| — | `[**]` Urgensi | Radio Button | Pilihan: Normal / Urgent / Cito. Default: Normal. Mandatory. |
| — | Perkiraan Biaya | Auto Calculate | SUM [Sub Total]. Non-editable. Format: Rp 99.999,99. |
| 5 | Keterangan | Text Input | Max 200 char. Optional. |

#### B.2. Section Data Barang

| No | Field | Tipe | Keterangan |
|----|-------|------|-----------|
| 1 | Nama Barang | Single Dropdown | Sumber: Master Data Barang Farmasi — is_active=true. Format display: `<Nama Barang> <Satuan> <Dosis> <Sediaan> <Pabrikan>`. Search by nama barang. Referensi: master data supplier — daftar barang. Mandatory. |
| 2 | Jumlah Pemesanan | Numerik | Min 0, Max 99999. Boleh desimal. Tidak boleh negatif. Mandatory. `[**]` Jika ada konfigurasi Kategori SP, field ini dipecah per kategori (RJ/RI). |
| 3 | Satuan | Single Dropdown | Sumber: Master Data Barang Farmasi — Satuan. Mandatory. |
| 4 | Harga | Autofill | Sumber: Master Data Barang Farmasi — HNA. Format: Rp 99.999,99. |
| — | `[**]` Diskon | Autofill | Sumber: master data supplier — daftar barang. |
| 5 | Sub Total | Autofill | = (Jumlah Pemesanan × Harga) − Diskon. Format: Rp 99.999,99. |

#### `[**]` B.3. Section Form Total

| Field | Tipe | Keterangan |
|-------|------|-----------|
| Total | Auto-calculated | Sum [Sub Total] |
| PPN (%) | Checkbox | Jika Cek → 11%; Jika Uncek → 0% |
| Total PPN | Auto Calculated | Total × PPN (%) |
| Grand Total | Auto Calculated | Total + Total PPN |

#### C. Update Pemesanan
Detail Data Requirement sama seperti pada point B. Tambah Pemesanan.

#### D. Detail Pemesanan
Detail Data Requirement sama seperti pada point B. Tambah Pemesanan (semua field read-only).

#### E. Approve dan Reject Pemesanan

| Field | Tipe | Keterangan |
|-------|------|-----------|
| Alasan Penolakan | Freetext Input | Max 200 char. Optional (mandatory min 20 char via BR-V.4 jika Reject). |

---

## 12. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|---------|------------|
| NFR-1 | Performance | Dashboard load ≤ 2 detik untuk 500 records dengan pagination. |
| NFR-2 | Performance | Cetak PDF SP dapat di-download dalam ≤ 30 detik setelah Approved. |
| NFR-3 | Availability | Uptime sistem ≥ 99.5% (toleransi downtime < 4 jam/bulan). |
| NFR-4 | Security | Semua aksi dilindungi RBAC; unauthorized access → HTTP 403. |
| NFR-5 | Audit | Audit trail 100%: semua aksi dicatat dengan user, role, action, before-after, timestamp, IP. |
| NFR-6 | Audit Retention | Audit log disimpan minimum 5 tahun sesuai standar akreditasi STARKES. |
| NFR-7 | Concurrency | Optimistic locking dengan version field untuk mencegah concurrent edit conflicts. |
| NFR-8 | Mobile Responsive | UI harus mobile-responsive untuk mendukung approval APJ jarak jauh. |
| NFR-9 | Data Integrity | Transactional save — rollback jika gagal (mencegah partial saved state). |
| NFR-10 | Idempotency | Submit tombol: disabled setelah klik + idempotency key di backend untuk hindari double-submit. |
| NFR-11 | Scalability | Sistem mendukung volume 50–200 SP/bulan per RS Tipe C/D tanpa degradasi performa. |

---

## 13. Integrasi Eksternal & Internal

| Integrasi | Arah | Deskripsi |
|-----------|------|-----------|
| Master Data Barang Farmasi | Internal | Lookup data barang (nama, kategori, NPP status, formularium, HNA, satuan). |
| Master Data Supplier | Internal | Lookup data supplier (aktif, is_active_pbf_for_npp, bank info). |
| Master Data Unit (Gudang) | Internal | Lookup unit gudang untuk Gudang tujuan. |
| Master Data User & Role | Internal | RBAC — validasi role per aksi. |
| Modul Rencana Pengadaan | Internal | Phase 2: generate SP dari Rencana Approved. |
| Modul Penerimaan Barang | Internal | Downstream: SP Approved muncul di dashboard Penerimaan; status SP di-update otomatis. |
| Modul Informasi Stok | Internal | API check stok current: warning over-stock. |
| Modul Keuangan (Persediaan & Pembelian) | Internal | API validasi budget (warning only); commit budget saat SP Approved. |
| SIPNAP BPOM | Eksternal `[****]` | Phase 4: pelaporan NPP otomatis. `[PERLU KONFIRMASI]` |

---

## 14. Edge Cases & Mitigasi

| No | Case | Dampak | Mitigasi |
|----|------|--------|---------|
| C.1 | Supplier dinonaktifkan setelah SP dibuat (Draft) | Pembuat tidak dapat submit karena Supplier inactive. | Saat submit: re-validate Supplier status. Jika inactive: error "Supplier tidak aktif lagi. Pilih supplier lain." Field Supplier di-clear. |
| C.2 | Barang dinonaktifkan setelah SP dibuat (Draft) | Item tidak dapat di-process; SP tidak dapat di-submit. | Saat submit: re-validate item status. Jika inactive: error per row "Barang [X] tidak aktif. Hapus atau ganti." |
| C.3 | Harga master berubah setelah SP submit | Inkonsistensi nilai SP vs harga current saat penerimaan. | Snapshot harga saat submit (JSONB snapshot_master_data). Penerimaan pakai harga snapshot. Audit visible. |
| C.4 | APJ tidak available (part-time di RS Tipe C/D) | SP-NPP atau SP normal stuck menunggu APJ. | Sistem support APJ Pengganti via SK Penunjukan (di master_user). Auto-reroute ke APJ Pengganti. Phase 2: SMS/WhatsApp notif. |
| C.5 | Network failure saat submit | Data partial saved; status tidak konsisten. | Transactional save: rollback jika gagal. Frontend: error + retry button. Idempotency key. |
| C.6 | Concurrent edit oleh 2 user | Last-write wins; data loss. | Optimistic locking dengan version field. Save kedua: prompt "User lain telah edit SP. [Lihat changes] [Overwrite] [Cancel]". |
| C.7 | SP dibuat untuk barang yang ada PO outstanding | Double stock; risk over-stock & expired (Farmasi). | Warning di submit: "Sudah ada PO outstanding [Nomor] untuk barang [X] dengan qty [Y]. Tetap lanjutkan?" Phase 2: blocking dengan approval khusus. |
| C.8 | SP-NPP tapi Supplier kemudian dicabut status PBF NPP | SP tidak valid; berisiko legal. | Re-validate at approval. Jika supplier kehilangan PBF NPP: APJ tidak boleh approve. Reject mandatory dengan alasan. |
| C.9 | Obat non-formularium di SP | Compliance STARKES. | APJ override allowed dengan justifikasi & checkbox approval. Phase 2: integrasi dengan KFT review queue. |
| C.10 | Pemesanan emergency Cito jam non-working hours | APJ tidak available; SLA breach. | Phase 1: log pending. Phase 2: WhatsApp/SMS alert ke APJ on-call. Phase 3: emergency override Direktur RS dengan post-facto APJ review. |
| C.11 | SP di-submit duplikat (klik submit 2× cepat) | 2 SP duplikat. | Idempotency key di backend; tombol submit disabled setelah klik sampai response. Frontend: loading state. |
| C.12 | Master Supplier inactive di tengah workflow | Pemesanan tidak dapat di-track ke Penerimaan. | Cancel SP otomatis bila supplier inactive selama approval > 24 jam. Notify pembuat & approver. |
| C.13 | Penerimaan partial mismatch dengan SP | Stok tidak balance. | Penerimaan modul handle: qty_received != qty_ordered → status SP → Diterima Sebagian. Sisa qty tracked untuk reconciliation. |
| C.14 | User dengan role berubah di tengah workflow | Approval pending tidak valid lagi. | Re-validate role di setiap action. Jika role berubah: pending approval di-clear, notify untuk re-assign. |
| C.15 | Kepala Gudang dan APJ adalah orang yang sama (RS Tipe D kecil) | Conflict of interest. | Sistem WAJIB user berbeda untuk approve Kepala Gudang vs APJ. Jika sama: blocking error. Wajib SK pemisahan role. |
| C.16 | Obat life-saving urgent tapi PBF NPP unavailable | Procurement gagal; risk life-threatening. | Phase 2: emergency procurement protocol. Direktur RS override approve dengan justifikasi dokumenter. Post-facto review APJ. |
| C.17 | Cold Chain item tapi supplier tidak support cold chain delivery | Vaksin rusak saat delivery. | Phase 2: validasi cold_chain_supported di master_supplier. Phase 1: warning saja. Phase 3: tracking cold chain di Penerimaan. |
| C.18 | SP > 90 hari tanpa Penerimaan | Stale data; commitment tidak tertepati supplier. | Phase 2: auto-expire ke status Expired. Notify pembuat, Kepala Gudang, APJ. |
| C.19 | Mismatch ED yang diterima vs min_ed snapshot | Obat received dengan ED kurang dari kontrak. | Penerimaan modul handle: warning + need APJ approval untuk terima. Audit pelanggaran ED commitment. |
| C.20 | Format Nomor SP collision (race condition) | 2 SP dengan nomor sama. | Generate dengan DB sequence (atomic). Unique constraint di DB. Retry dengan increment jika collision. |
| C.21 | PDF generation timeout | User tidak dapat download SP. | Async generation: queue job. Notify user via in-app saat ready. Retry mechanism. |
| C.22 | Audit log storage full | Aksi gagal karena audit log tidak bisa write. | Monitoring + alert. Auto-archive audit log lama (> 1 tahun) ke cold storage. Tidak boleh degrade ke "continue without audit". |
| C.23 | RS Tipe D dengan struktur sangat minimal (Kepala Gudang merangkap Staf) | Approval menjadi formalitas. | Phase 1: support dengan asumsi APJ tetap external & approve mandatori. Phase 2: pertimbangkan simplified workflow 1-tier untuk RS Tipe D micro. |

---

## 15. Compliance & Regulatory Notes

| Regulasi | Ringkasan Aturan | Implementasi | Tingkat |
|---------|-----------------|--------------|---------|
| UU 35/2009 tentang Narkotika | Pengadaan Narkotika oleh RS harus dari PBF khusus yang ditunjuk Kemenkes. | Flag is_npp di master_barang; validasi Supplier is_active_pbf_for_npp; SPN attachment mandatory; approval ganda Kepala Gudang + APJ; audit trail extended untuk SP-NPP. | **CRITICAL** |
| Permenkes 3/2015 tentang Peredaran NPP Farmasi | Detail teknis peredaran NPP termasuk pencatatan kemasan, nomor seri, pelaporan ke BPOM (SIPNAP). | Phase 1: tracking SPN attachment, audit trail extended. Phase 2: tracking nomor seri kemasan saat Penerimaan. Phase 4: integrasi SIPNAP otomatis. | **CRITICAL** |
| PP 51/2009 tentang Pekerjaan Kefarmasian | APJ wajib bertanggung jawab atas perencanaan & pengadaan obat. | APJ approval mandatory sebagai FINAL APPROVER untuk semua SP obat. Tidak boleh skip APJ. APJ Pengganti dengan SK formal di master_user. | **CRITICAL** |
| Permenkes 72/2016 tentang Standar Pelayanan Kefarmasian di RS | Validasi formularium, pengelolaan obat termasuk perencanaan & pengadaan. | Validasi formularium dengan override APJ; standar workflow approval untuk obat; integrasi dengan formularium master data. CATATAN: Validasi CDOB di v2.1 tidak otomatis. | **HIGH** |
| Permenkes 31/2016 tentang Penyelenggaraan Pekerjaan Tenaga Sanitasi Lingkungan | Alkes farmasi: pengadaan dari distributor resmi. | Filter supplier dengan is_active=true (Phase 1). Phase 2: tambahan validasi distributor resmi. | **HIGH** |
| STARKES (Standar Akreditasi RS Indonesia) | PKPO: formularium, audit trail, manajemen obat. | Formularium integration; full audit trail dengan retention 5 tahun; compliance reporting. | **CRITICAL** |
| UU 36/2009 tentang Kesehatan | RS bertanggung jawab atas ketersediaan obat. | Goals fitur: memastikan ketersediaan obat melalui workflow terstandarisasi. | **HIGH** |
| Permenkes 11/2017 tentang Keselamatan Pasien | Pengelolaan obat termasuk pengadaan harus pertimbangkan keselamatan pasien. | Validasi min ED at delivery, validasi formularium, audit trail untuk traceability. | **HIGH** |
| Permenkes 56/2014 tentang Klasifikasi dan Perizinan Rumah Sakit | RS Tipe C/D dengan struktur organisasi lebih ramping. | PRD v2.1 disesuaikan untuk RS Tipe C/D: 2-tier approval tanpa Manajer Logistik & Manajer Keuangan terpisah. | **INFO** |

---

## 16. Developer Requirements — Skema Database

### Table: `purchase_orders` (Header Surat Pemesanan / SP)

Tabel yang menyimpan data utama dokumen pemesanan sebelum barang datang.

| Nama Kolom | Tipe Data | Nullable | Notes Dev |
|-----------|----------|---------|----------|
| id | uuid | NOT NULL | Primary Key |
| po_number | varchar(50) | NOT NULL | Unique. Generate otomatis. |
| po_category | varchar(10) | NOT NULL | Value: "RJ" atau "RI" (hasil split SP) atau kategori gudang ("FARMASI", "RUMAH TANGGA", "GIZI"). |
| supplier_id | uuid | NOT NULL | FK ke tabel master supplier. |
| warehouse_id | uuid | NOT NULL | FK ke tabel master unit (flag gudang). |
| po_date | date | NOT NULL | Tanggal pemesanan dibuat. |
| status | varchar(30) | NOT NULL | Enum: 'Dibuat', 'WAITING_APPROVAL', 'APPROVED' (Belum Diterima), 'PARTIAL_RECEIVED', 'FULL_RECEIVED', 'REJECTED', 'CANCELLED'. |
| subtotal | numeric(15,2) | NOT NULL | Total harga barang sebelum diskon/pajak. |
| discount_global | numeric(15,2) | NOT NULL | Diskon total dalam nominal rupiah (Default 0). |
| tax_ppn | numeric(15,2) | NOT NULL | Nominal PPN dari transaksi (Default 0). |
| additional_cost | numeric(15,2) | NOT NULL | Biaya tambahan/ongkir (Default 0). |
| grand_total | numeric(15,2) | NOT NULL | = (subtotal − discount_global + tax_ppn + additional_cost). |
| notes | text | NULL | Keterangan pemesanan. |
| reject_reason | text | NULL | Diisi jika status = 'REJECTED'. |
| cancel_reason | text | NULL | Diisi jika status = 'CANCELLED'. |
| approved_by | uuid | NULL | ID Kepala Gudang yang menyetujui. |
| approved_at | timestamp | NULL | Waktu persetujuan. |
| created_by | varchar(255) | NOT NULL | — |
| created_at | timestamp | NOT NULL | Default NOW(). |

### Table: `purchase_order_items` (Detail Barang Pemesanan)

Tabel yang menyimpan daftar barang yang dipesan dalam satu Nomor SP.

| Nama Kolom | Tipe Data | Nullable | Notes Dev |
|-----------|----------|---------|----------|
| id | uuid | NOT NULL | Primary Key |
| purchase_order_id | uuid | NOT NULL | FK ke purchase_orders.id (ON DELETE CASCADE). |
| item_id | uuid | NOT NULL | FK ke master data barang (Farmasi/Gizi/RT). |
| unit_id | uuid | NOT NULL | FK ke master data satuan (Satuan saat pesan). |
| qty_ordered | int | NOT NULL | Jumlah yang dipesan (Min 1). |
| qty_received | int | NOT NULL | **PENTING**: Default 0. Di-update otomatis saat ada penerimaan untuk tracking Diterima Sebagian (Partial). |
| unit_price | numeric(15,2) | NOT NULL | Harga satuan. |
| `[**]` discount_percent | numeric(5,2) | NOT NULL | Default 0. Maksimal 100.00. |
| `[**]` discount_amount | numeric(15,2) | NOT NULL | Nominal diskon per baris item. |
| subtotal | numeric(15,2) | NOT NULL | = (qty_ordered × unit_price) − discount_amount. |

### Table: `document_approval_logs` (Polymorphic Approval Log)

Tabel polymorphic yang dapat dipakai untuk approval PO, Mutasi, Gizi, dll di masa depan.

| Nama Kolom | Tipe Data | Nullable | Notes Dev |
|-----------|----------|---------|----------|
| id | uuid | NOT NULL | Primary Key |
| document_type | varchar(50) | NOT NULL | Penanda modul. Contoh: "PURCHASE_ORDER" |
| document_id | uuid | NOT NULL | FK ke ID dokumen (misal: purchase_orders.id) |
| approver_id | uuid | NOT NULL | FK ke user ID yang melakukan approval/reject |
| approver_role | varchar(50) | NOT NULL | Role saat approve (misal: "KEPALA_GUDANG") |
| action | varchar(20) | NOT NULL | Enum: 'APPROVED', 'REJECTED' |
| notes | text | NULL | Alasan penolakan / Catatan persetujuan |
| created_at | timestamp | NOT NULL | Kapan di-approve/reject |

---

## Open Questions

1. Apakah harga satuan bersifat optional saat pembuatan SP Draft dan dapat diisi/dikoreksi saat penerimaan barang di modul H2? `[PERLU KONFIRMASI]`
2. Format Nomor SP persis yang dipakai RS mitra — apakah `SP-FRM-MMYYXXXX` sudah final atau ada format yang berbeda per RS? `[PERLU KONFIRMASI]`
3. Apakah validasi minimum ED at delivery (default 18 bulan) bersifat hard block (tidak bisa submit) atau soft block (warning dengan override APJ)? `[PERLU KONFIRMASI]`
4. Apakah field ED diisi manual per item atau berasal dari master barang? `[PERLU KONFIRMASI]`
5. Apakah satu SP dapat memuat item dari lebih dari satu jenis barang (Obat + Alkes Farmasi + BHP Farmasi dalam satu SP)? `[PERLU KONFIRMASI]`
6. SP yang Ditolak: apakah dapat direvisi dan disubmit ulang (kembali ke Draft), atau harus buat SP baru? `[PERLU KONFIRMASI]`
7. Apakah notifikasi ke approver di Phase 1 bersifat in-app saja, dan push notification / email adalah Phase 2? `[PERLU KONFIRMASI]`
8. APJ Pengganti: bagaimana mekanisme penetapan APJ Pengganti dalam master_user? Apakah perlu SK formal yang di-upload ke sistem? `[PERLU KONFIRMASI]`
9. Kartu statistik dashboard (total SP bulan ini, menunggu persetujuan, dll) — apakah dihitung real-time atau dengan cache? Perlu review performa jika volume SP tinggi. `[PERLU KONFIRMASI]`
10. Integrasi SIPNAP (Phase 4): apakah ada API endpoint resmi dari BPOM yang bisa digunakan, atau memerlukan custom bridge? `[PERLU KONFIRMASI]`

---

## Assumptions

- **ASM-001**: Staf Gudang Farmasi dan Kepala Gudang Farmasi adalah dua orang yang berbeda. Di RS Tipe D yang sangat kecil, jika satu orang merangkap keduanya, sistem tetap mensyaratkan dua akun berbeda.
- **ASM-002**: APJ adalah user dengan role terpisah dari Kepala Gudang. Sistem wajib user berbeda untuk approve tier Kepala Gudang vs APJ (lihat C.15).
- **ASM-003**: APJ Pengganti dapat didaftarkan via SK Penunjukan di master_user untuk mengakomodasi APJ part-time.
- **ASM-004**: Validasi formularium dilakukan berdasarkan master formularium RS yang telah diinput di sistem.
- **ASM-005**: Harga satuan bersifat opsional saat pembuatan SP Draft dan dapat diisi atau dikoreksi saat penerimaan barang di modul H2.
- **ASM-006**: Validasi minimum ED at delivery diimplementasikan sebagai: ekspektasi ED barang yang akan diterima harus ≥ 18 bulan dari tanggal SP. Implementasi eksak perlu dikonfirmasi.
- **ASM-007**: Notifikasi ke approver bersifat in-app pada Phase 1; push notification atau email adalah opsional Phase 2.
- **ASM-008**: Modul H1 ini khusus untuk kategori Farmasi (Obat, Alkes Farmasi, BHP Farmasi). Pemesanan barang non-farmasi menggunakan modul atau alur terpisah.
- **ASM-009**: APJ dapat melakukan approval melalui antarmuka mobile-responsive untuk mendukung approval jarak jauh tanpa kehadiran fisik di RS.
- **ASM-010**: Satu SP diasumsikan dapat memuat item dari satu jenis barang saja (Obat ATAU Alkes Farmasi ATAU BHP Farmasi) — perlu konfirmasi apakah boleh campur dalam satu SP.
- **ASM-011**: Status lifecycle SP: Draft → Menunggu Persetujuan KG → Menunggu Persetujuan APJ → Disetujui / Ditolak. SP yang Ditolak dapat direvisi dan disubmit ulang (kembali ke Draft).
- **ASM-012**: Kartu statistik dashboard dihitung secara real-time dari database tanpa cache khusus — perlu review performa jika volume SP tinggi.

---

*PRD ini berlaku untuk Fitur H1 — Pemesanan Barang Farmasi. Dibuat berdasarkan dokumen "Pemesanan Barang - Barang Farmasi (1).docx" versi 1.0 tanggal 13 Juni 2026.*
