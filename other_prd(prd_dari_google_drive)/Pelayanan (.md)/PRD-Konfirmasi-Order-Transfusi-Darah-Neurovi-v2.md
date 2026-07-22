# PRD — Konfirmasi Order Transfusi Darah

**Related Document:** PRD Order Transfusi Darah Neurovi v2; PRD Cetak Permintaan Transfusi Darah `[PRD terpisah]`; Referensi Form Permintaan Transfusi Darah Neurovi v1  
**Dokumen ID:** PRD-LAB-TD-KONF-v2.0 · **Versi:** 1.2 (Draft — Revisi pemisahan simpan hasil dan penyelesaian order)  
**Tanggal Disusun:** 21 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** Product, UI/UX, Frontend, Backend, QA, dan perwakilan Laboratorium  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Fitur **Konfirmasi Order Transfusi Darah** digunakan oleh petugas Laboratorium untuk menerima, memeriksa, mengoreksi, dan mengelola permintaan transfusi darah yang dikirim dari unit pelayanan. Entry point pada Neurovi v2 berada di **Modul Laboratorium → menu Transfusi Darah**.

Pada Neurovi v1, detail permintaan ditampilkan melalui form yang memuat identitas pasien, nomor order, tanggal permintaan, dokter pengirim, diagnosis klinis, jenis transfusi, jumlah kantong, golongan darah, dan rhesus. Petugas dapat memperbarui golongan darah serta rhesus, kemudian menyimpan atau mencetak permintaan.

Pada Neurovi v2, proses tersebut disempurnakan melalui status order yang terstruktur, konfirmasi penerimaan, koreksi field tertentu tanpa kewajiban mengisi alasan perubahan, pembatalan dengan alasan wajib, pembaruan golongan darah/rhesus pasien, pencatatan hasil akhir crossmatch berupa **Compatible** atau **Tidak Compatible**, audit trail per transaksi, serta sinkronisasi status ke unit pengirim. SIMRS belum memiliki modul proses crossmatch maupun manajemen stok darah; proses crossmatch dan pencatatan stok tetap dilakukan di luar SIMRS. Fitur ini mencatat hasil akhir crossmatch sebagai prasyarat penyelesaian order. Penyimpanan hasil akhir tidak langsung mengubah status; pengguna tetap harus menjalankan aksi **Selesai** untuk menutup dan mengunci order.

> Referensi: bisnis proses terkonfirmasi dari pengguna dan lampiran Form Permintaan Transfusi Darah Neurovi v1.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — berdasarkan lampiran form:
- Petugas membuka detail permintaan dari **Laboratorium → Transfusi Darah**.
- Form menampilkan No. RM, nama pasien, tanggal lahir/umur, bangsal, nomor order, tanggal permintaan, dokter pengirim, diagnosis klinis, jenis transfusi, dan jumlah kantong.
- Golongan darah dapat dipilih melalui dropdown dan rhesus dipilih melalui opsi Positif atau Negatif.
- Tersedia aksi **Simpan**, **Kembali**, dan **Print**.
- Belum terlihat lifecycle status order, pembatalan, pencatatan hasil akhir crossmatch, maupun audit trail pada form yang dilampirkan.

**Masalah/pain point:**
- **Aspek bisnis proses:** unit pengirim dan Laboratorium belum memiliki indikator progres order yang seragam; koreksi kesalahan minor berpotensi membutuhkan komunikasi manual atau pembuatan order ulang.
- **Aspek UX:** petugas belum memperoleh status order yang jelas dan belum memiliki alur khusus untuk konfirmasi, pembatalan, atau penyelesaian order.
- **Aspek logic system:** koreksi, perubahan status, pembaruan golongan darah/rhesus, dan pembatalan belum secara eksplisit menghasilkan histori transaksi yang dapat ditelusuri.

**Dampak utama yang disasar v2:**
- Mempercepat penerimaan order dan mengurangi komunikasi manual antara unit pengirim dengan Laboratorium.
- Mengurangi kebutuhan membuat order baru akibat kesalahan input sederhana.
- Menjaga konsistensi data golongan darah/rhesus pasien dan status order pada seluruh modul terkait.
- Menyediakan pencatatan hasil akhir crossmatch tanpa membangun modul proses crossmatch pada fase ini.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = detail order, konfirmasi, koreksi data, pembatalan, update golongan darah/rhesus, pencatatan hasil akhir Compatible/Tidak Compatible, aksi penyelesaian order secara eksplisit, status order, audit trail per transaksi, penguncian order, dan sinkronisasi status.

> Dalam satu hari Laboratorium dapat menerima belasan hingga puluhan permintaan transfusi dari berbagai unit pelayanan. Seluruh aksi utama perlu berlangsung cepat agar tidak menghambat pelayanan.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Entry point Transfusi Darah** — tersedia melalui **Modul Laboratorium → Transfusi Darah**.
2. **Detail order transfusi** — menampilkan data pasien, data order, dokter pengirim, diagnosis klinis, jenis produk darah, jumlah kantong, golongan darah, rhesus, keterangan tambahan, status order, dan hasil akhir crossmatch bila sudah tersedia.
3. **Konfirmasi penerimaan order** — pengguna berwenang dapat mengubah status order baru dari **Menunggu Konfirmasi** menjadi **Dikonfirmasi Laboratorium**.
4. **Koreksi data order** — pengguna berwenang dapat mengoreksi jenis produk darah, jumlah kantong, golongan darah, rhesus, dan keterangan tambahan selama hasil akhir crossmatch belum disimpan dan order belum dibatalkan.
5. **Koreksi tanpa alasan perubahan** — pengguna tidak perlu mengisi alasan saat menyimpan koreksi; histori perubahan tetap dicatat melalui audit trail per transaksi.
6. **Update golongan darah/rhesus pasien** — nilai yang diperbarui menjadi referensi data klinis pasien, dengan nilai sebelumnya tetap tersimpan dalam histori.
7. **Opsi belum diketahui** — Golongan Darah dan Rhesus menyediakan pilihan eksplisit **Belum Diketahui**.
8. **Pencatatan hasil akhir crossmatch** — pengguna berwenang mencatat hasil akhir **Compatible** atau **Tidak Compatible** setelah proses crossmatch dilakukan di luar SIMRS.
9. **Penyelesaian order secara eksplisit** — penyimpanan hasil akhir crossmatch tidak mengubah status order. Setelah hasil tersimpan, pengguna harus menekan tombol **Selesai**; hanya aksi tersebut yang mengubah status menjadi **Selesai** dan mengunci order.
10. **Pembatalan order** — pembatalan dapat dilakukan pada status **Menunggu Konfirmasi** atau **Dikonfirmasi Laboratorium** selama hasil akhir crossmatch belum disimpan dan alasan pembatalan diisi.
11. **Manajemen status order** — status mengikuti transisi yang ditetapkan dan tidak dapat dilompati secara manual.
12. **Audit trail per transaksi** — mencatat pelaku, waktu, jenis aktivitas, data sebelum, data sesudah, dan alasan pembatalan bila aktivitasnya pembatalan.
13. **Sinkronisasi status** — status terbaru terlihat pada Dashboard Laboratorium, riwayat order transfusi, unit pengirim, dan detail order pasien tanpa reload manual.
14. **Kontrol akses berbasis permission** — setiap aksi dikendalikan melalui permission backend; pembagian role final masih memerlukan persetujuan stakeholder.

### Out Scope

- Pembuatan order transfusi dari Rawat Jalan, Rawat Inap, IGD, atau unit pelayanan lain; dibahas pada PRD Order Transfusi Darah.
- Proses operasional crossmatch, tahapan pemeriksaan crossmatch, pencatatan reagen, sampel, metode, detail hasil pemeriksaan, dan workflow teknis crossmatch.
- Modul atau pengelolaan stok darah; stok masih dicatat di luar SIMRS.
- Validasi ketersediaan stok terhadap perubahan jenis produk darah atau jumlah kantong.
- Penyiapan, reservasi, pengeluaran, penyerahan, pengembalian, dan pemusnahan kantong darah.
- Billing tindakan, klaim, dan proses kasir.
- Notifikasi proaktif melalui in-app notification, push notification, WhatsApp, atau kanal lainnya.
- Format cetak dan tombol **Print**; tetap dibutuhkan pada Neurovi v2 tetapi dibahas dalam PRD terpisah.

## 4. Goals and Metrics

### Tujuan

- Menyediakan proses konfirmasi order transfusi yang cepat, jelas, dan dapat ditelusuri.
- Memungkinkan koreksi kesalahan input tanpa meminta unit pengirim membuat order baru.
- Menyimpan hasil akhir crossmatch secara sederhana tanpa menambahkan modul proses crossmatch.
- Menjaga konsistensi status order dan referensi golongan darah/rhesus pasien.

### Metrik (terukur)

| Metrik | Target | Sumber |
|--------|--------|--------|
| Waktu membuka daftar order | `< 1 detik p95` pada beban operasional normal `[ASUMSI — rekomendasi awal]` | NFR-001 |
| Waktu membuka detail order | `< 1 detik p95` pada beban operasional normal `[ASUMSI — rekomendasi awal]` | NFR-002 |
| Waktu konfirmasi order | `< 1 detik p95` setelah request diterima sistem `[ASUMSI — rekomendasi awal]` | NFR-003 |
| Waktu menyimpan koreksi order | `< 1 detik p95` setelah validasi field terpenuhi `[ASUMSI — rekomendasi awal]` | NFR-004 |
| Waktu menyimpan hasil akhir | `< 1 detik p95` setelah input valid `[ASUMSI — rekomendasi awal]` | NFR-005 |
| Waktu menyelesaikan order | `< 1 detik p95` setelah aksi Selesai dikonfirmasi `[ASUMSI — rekomendasi awal]` | NFR-016 |
| Waktu pembatalan order | `< 1 detik p95` setelah guard dan alasan terpenuhi `[ASUMSI — rekomendasi awal]` | NFR-006 |
| Sinkronisasi status | Perubahan terlihat tanpa reload dengan latensi `≤ 3 detik p95` `[ASUMSI — rekomendasi awal]` | NFR-007 |
| Kelengkapan audit | 100% transaksi konfirmasi, koreksi, update golongan darah/rhesus, input hasil, penyelesaian order, dan pembatalan tercatat | NFR-010 |
| Konsistensi guard hasil dan penyelesaian | 100% penyimpanan hasil tidak mengubah status menjadi Selesai; 100% transisi ke Selesai hanya terjadi melalui aksi eksplisit setelah hasil tersedia | BR-017–BR-018; NFR-009 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul | Peran terhadap Modul |
|-------|-----------------------|
| Order Transfusi Darah dari unit pelayanan | Sumber order, data klinis, dokter pengirim, diagnosis, produk darah, jumlah kantong, dan keterangan tambahan. |
| Dashboard Laboratorium → Transfusi Darah | Entry point daftar order dan konsumen status terbaru. |
| Master Pasien / EMR | Sumber demografi pasien dan tujuan pembaruan referensi golongan darah/rhesus. |
| Master Produk Darah | Sumber pilihan jenis produk darah yang valid; tidak mencakup stok. |
| Master Staf & RBAC | Sumber identitas pengguna dan permission setiap aksi. |
| Audit Trail | Menyimpan histori aktivitas per transaksi. |
| Real-Time Event | Menyinkronkan status dan perubahan data antarhalaman tanpa notifikasi proaktif. |
| PRD Cetak Permintaan Transfusi | Menangani kebutuhan tombol dan format Print pada tiket terpisah. |

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Petugas Laboratorium berwenang | Primary | Melihat detail, mengonfirmasi, mengoreksi, memperbarui golongan darah/rhesus, mencatat hasil akhir, menyelesaikan order, dan membatalkan order sesuai permission. |
| Supervisor/Kepala Laboratorium | Secondary | Melakukan supervisi dan melihat audit trail sesuai permission. |
| Dokter/perawat/bidan atau petugas unit pengirim | Secondary | Melihat status terbaru order yang dikirim tanpa melihat audit, data before/after, atau alasan pembatalan. |
| Administrator sistem | Tersier | Mengatur role dan permission; tidak otomatis memiliki hak melakukan aksi klinis/operasional. |

### C. Rekomendasi Awal Role & Permission `[PERLU KONFIRMASI]`

> Rekomendasi berikut menggunakan prinsip least privilege dan tetap harus disetujui stakeholder rumah sakit.

| Permission | Fungsi | Rekomendasi Role |
|------------|--------|------------------|
| `TRANSFUSION_ORDER_VIEW` | Melihat daftar dan detail order | Petugas Laboratorium, Supervisor Laboratorium |
| `TRANSFUSION_ORDER_CONFIRM` | Mengonfirmasi order | Petugas Laboratorium, Supervisor Laboratorium |
| `TRANSFUSION_ORDER_EDIT` | Mengoreksi field yang diizinkan | Petugas Laboratorium, Supervisor Laboratorium |
| `TRANSFUSION_BLOOD_PROFILE_UPDATE` | Memperbarui golongan darah/rhesus pasien | Petugas Laboratorium yang ditunjuk, Supervisor Laboratorium |
| `TRANSFUSION_RESULT_INPUT` | Mencatat hasil akhir Compatible/Tidak Compatible | Petugas Laboratorium yang ditunjuk, Supervisor Laboratorium |
| `TRANSFUSION_ORDER_COMPLETE` | Menjalankan aksi Selesai setelah hasil akhir tersimpan | Petugas Laboratorium yang ditunjuk, Supervisor Laboratorium |
| `TRANSFUSION_ORDER_CANCEL` | Membatalkan order selama guard terpenuhi | Petugas Laboratorium yang ditunjuk, Supervisor Laboratorium |
| `TRANSFUSION_AUDIT_VIEW` | Melihat audit per transaksi dan before/after | Supervisor Laboratorium atau role audit yang ditunjuk |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. Unit pelayanan membuat permintaan transfusi darah.
2. Permintaan masuk ke halaman **Laboratorium → Transfusi Darah**.
3. Petugas membuka detail permintaan.
4. Sistem menampilkan identitas pasien, data order, dokter, diagnosis, jenis transfusi, dan jumlah kantong.
5. Petugas memilih atau memperbarui golongan darah dan rhesus.
6. Petugas menyimpan perubahan melalui tombol **Simpan**.
7. Form menyediakan tombol **Print** dan **Kembali**, tetapi lampiran tidak menunjukkan lifecycle status, pembatalan, hasil akhir crossmatch, atau audit trail.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. Order yang berhasil dibuat oleh unit pelayanan masuk ke **Modul Laboratorium → Transfusi Darah** dengan status **Menunggu Konfirmasi**.
2. Petugas berwenang membuka detail dan memeriksa data pasien, dokter pengirim, diagnosis, jenis produk darah, jumlah kantong, golongan darah, rhesus, dan keterangan tambahan.
3. Petugas dapat mengoreksi field yang diizinkan selama order belum dibatalkan dan hasil akhir crossmatch belum disimpan.
4. Koreksi disimpan tanpa input alasan perubahan; sistem tetap membuat audit trail per transaksi berisi data sebelum dan sesudah.
5. Petugas melakukan konfirmasi; sistem mengubah status menjadi **Dikonfirmasi Laboratorium**.
6. Jika golongan darah/rhesus diperbarui, sistem memperbarui referensi data klinis pasien dan mempertahankan histori nilai sebelumnya tanpa persetujuan petugas kedua.
7. Proses crossmatch dilakukan di luar SIMRS dan tidak memiliki workflow atau status **Sedang Diproses** di dalam SIMRS.
8. Setelah proses crossmatch di luar SIMRS selesai, petugas berwenang mencatat hasil akhir **Compatible** atau **Tidak Compatible**.
9. Penyimpanan hasil akhir mempertahankan status **Dikonfirmasi Laboratorium**; sistem mencatat hasil, petugas, dan waktu, lalu menyediakan tombol **Selesai**.
10. Petugas menekan tombol **Selesai** untuk mengubah status order menjadi **Selesai** dan mengunci order.
11. Sebelum hasil akhir disimpan, petugas dapat membatalkan order dari status **Menunggu Konfirmasi** atau **Dikonfirmasi Laboratorium** dengan alasan pembatalan wajib.
12. Order yang sudah **Dibatalkan** tidak dapat diaktifkan kembali; unit pengirim harus membuat order baru.
13. Sistem menyinkronkan status terbaru ke halaman Laboratorium dan unit pengirim tanpa mengirim notifikasi proaktif.
14. Unit pengirim hanya dapat melihat status order; audit, data before/after, dan alasan pembatalan tidak ditampilkan kepada unit pengirim.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Entry point | Laboratorium → Transfusi Darah | Tetap pada Modul Laboratorium → Transfusi Darah. |
| Status order | Tidak terlihat pada form lampiran | Menunggu Konfirmasi, Dikonfirmasi Laboratorium, Selesai, atau Dibatalkan. |
| Konfirmasi | Aksi utama berupa Simpan | Aksi Konfirmasi eksplisit dan menghasilkan perubahan status. |
| Koreksi data | Golongan darah dan rhesus dapat diubah | Produk darah, jumlah kantong, golongan darah, rhesus, dan keterangan dapat dikoreksi. |
| Alasan koreksi | Tidak terlihat | Tidak diperlukan. |
| Golongan darah/rhesus | Positif/Negatif dan golongan darah yang diketahui | Menyediakan opsi **Belum Diketahui**. |
| Crossmatch | Tidak terlihat pada form | Proses tetap di luar SIMRS; SIMRS hanya menyimpan hasil akhir Compatible/Tidak Compatible. |
| Stok darah | Tidak terlihat | Tetap dikelola di luar SIMRS dan tidak divalidasi oleh fitur ini. |
| Pembatalan | Tidak terlihat | Tersedia sebelum hasil akhir crossmatch disimpan, dengan alasan wajib. |
| Penguncian | Tidak terlihat | Terjadi setelah pengguna menekan **Selesai** atau order dibatalkan; penyimpanan hasil akhir saja belum mengubah status menjadi Selesai. |
| Audit | Tidak terlihat | Dicatat per transaksi dengan data before/after; alasan hanya untuk pembatalan. |
| Unit pengirim | Tidak terlihat | Melihat status terbaru saja. |
| Print | Tersedia pada form | Tetap dibutuhkan, tetapi dikerjakan melalui PRD terpisah. |

## 7. Main Flow / Mindmap

### Skenario 1 — Konfirmasi order tanpa koreksi

1. Petugas membuka order berstatus **Menunggu Konfirmasi**.
2. Sistem menampilkan data lengkap order dan mengevaluasi permission pengguna.
3. Petugas memilih aksi **Konfirmasi**.
4. Sistem meminta konfirmasi akhir untuk menerima order.
5. Sistem mengubah status menjadi **Dikonfirmasi Laboratorium**, mencatat pengguna dan waktu, membuat audit transaksi, lalu menyinkronkan status.
6. Sistem menampilkan respons berhasil atau gagal; jika gagal, status tetap **Menunggu Konfirmasi**.

### Skenario 2 — Konfirmasi order dengan koreksi

1. Petugas membuka order yang belum dibatalkan dan belum memiliki hasil akhir crossmatch.
2. Petugas mengubah satu atau lebih field yang diizinkan.
3. Sistem memvalidasi format dan kelengkapan field tanpa melakukan validasi stok darah.
4. Petugas memilih **Konfirmasi** tanpa mengisi alasan perubahan.
5. Sistem menyimpan koreksi, status konfirmasi, dan audit per transaksi secara atomik.
6. Sistem menyinkronkan data terbaru pada halaman Laboratorium; unit pengirim hanya menerima pembaruan status.

### Skenario 3 — Koreksi setelah order dikonfirmasi

1. Petugas membuka order berstatus **Dikonfirmasi Laboratorium** yang belum memiliki hasil akhir crossmatch.
2. Petugas mengubah field yang diizinkan tanpa mengisi alasan perubahan.
3. Sistem menyimpan koreksi tanpa mengubah status order.
4. Sistem membuat satu audit transaksi yang memuat data sebelum dan sesudah.
5. Jika hasil akhir sudah tersimpan atau order sudah dibatalkan, backend menolak koreksi.

### Skenario 4 — Update golongan darah atau rhesus

1. Golongan darah dan/atau rhesus masih **Belum Diketahui** atau perlu dikoreksi.
2. Petugas dengan permission khusus memilih nilai golongan darah dan rhesus yang benar.
3. Sistem tidak meminta alasan perubahan atau persetujuan petugas kedua.
4. Sistem menyimpan nilai baru pada snapshot order dan memperbarui referensi klinis pasien.
5. Sistem mempertahankan nilai sebelumnya pada histori dan membuat audit per transaksi.
6. Jika pembaruan data pasien gagal, seluruh transaksi ditolak agar data order dan data pasien tidak berbeda.

### Skenario 5 — Pencatatan hasil akhir crossmatch

1. Order telah berstatus **Dikonfirmasi Laboratorium**.
2. Proses crossmatch telah dilakukan di luar SIMRS.
3. Petugas dengan permission khusus memilih hasil akhir **Compatible** atau **Tidak Compatible**.
4. Petugas menyimpan hasil akhir.
5. Sistem mencatat hasil, petugas, dan waktu serta membuat audit transaksi **Hasil Akhir Disimpan**, tetapi status tetap **Dikonfirmasi Laboratorium**.
6. Setelah hasil tersimpan, sistem menampilkan atau mengaktifkan tombol **Selesai**.
7. Petugas menekan **Selesai** dan mengonfirmasi aksi.
8. Sistem mengubah status menjadi **Selesai**, mencatat petugas dan waktu penyelesaian, membuat audit transaksi **Order Diselesaikan**, lalu mengunci order.
9. Kedua hasil, baik **Compatible** maupun **Tidak Compatible**, dapat digunakan sebagai prasyarat penyelesaian order.

### Skenario 6 — Pembatalan order

1. Petugas memilih aksi **Batalkan Order** pada order berstatus **Menunggu Konfirmasi** atau **Dikonfirmasi Laboratorium**.
2. Sistem memeriksa bahwa hasil akhir crossmatch belum tersimpan dan order belum dibatalkan.
3. Sistem menampilkan ringkasan order serta input alasan pembatalan.
4. Petugas mengisi alasan dan mengonfirmasi pembatalan.
5. Sistem mengubah status menjadi **Dibatalkan**, membuat audit transaksi, dan mengunci proses lanjutan.
6. Unit pengirim melihat status **Dibatalkan** tanpa melihat alasan pembatalan.
7. Jika permintaan masih diperlukan, unit pengirim harus membuat order baru.

### Skenario 7 — Perubahan ditolak karena order terkunci

1. Petugas membuka order berstatus **Selesai** atau **Dibatalkan**.
2. Sistem menampilkan data secara read-only dan keterangan bahwa order sudah dikunci.
3. Aksi koreksi, input hasil, konfirmasi, dan pembatalan tidak tersedia atau disabled sesuai status.
4. Backend tetap menolak request perubahan meskipun dikirim dari sesi lama atau melalui request langsung.

### Skenario 8 — Konflik perubahan bersamaan

1. Dua petugas membuka order yang sama.
2. Petugas pertama menyimpan perubahan.
3. Petugas kedua mencoba menyimpan data dari versi lama.
4. Sistem menolak penyimpanan kedua, menampilkan informasi bahwa order telah diperbarui, lalu meminta pengguna memuat data terbaru.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Entry point fitur berada pada **Modul Laboratorium → Transfusi Darah**. | Konfirmasi stakeholder; FR-002 |
| **BR-002** | Setiap order baru dari unit pelayanan memiliki status awal **Menunggu Konfirmasi**. | Draft user; US-001; FR-001 |
| **BR-003** | Hanya pengguna dengan permission yang sesuai dapat melihat atau menjalankan aksi pada order transfusi. | Konfirmasi stakeholder; FR-003; NFR-008 |
| **BR-004** | Konfirmasi yang berhasil mengubah status order menjadi **Dikonfirmasi Laboratorium**. | Draft user; US-001; FR-004 |
| **BR-005** | Detail order menampilkan nomor order, tanggal permintaan, dokter pengirim, diagnosis klinis, produk darah, jumlah kantong, golongan darah, rhesus, keterangan tambahan, status, dan hasil akhir bila tersedia. | Feature Capabilities; FR-002 |
| **BR-006** | Field yang dapat dikoreksi hanya jenis produk darah, jumlah kantong, golongan darah, rhesus, dan keterangan tambahan. | Konfirmasi stakeholder; US-002; FR-005 |
| **BR-007** | Koreksi diperbolehkan pada status **Menunggu Konfirmasi** atau **Dikonfirmasi Laboratorium** selama order belum dibatalkan dan hasil akhir crossmatch belum disimpan. | Konfirmasi stakeholder; FR-005 |
| **BR-008** | Pengguna tidak perlu mengisi alasan ketika mengoreksi data order, termasuk koreksi golongan darah/rhesus. | Konfirmasi stakeholder; FR-005; FR-006 |
| **BR-009** | Setiap koreksi tetap menghasilkan audit trail per transaksi yang memuat data sebelum dan sesudah. | Konfirmasi stakeholder; FR-011 |
| **BR-010** | Sistem tidak melakukan validasi stok darah karena manajemen stok belum tersedia di SIMRS. | Konfirmasi stakeholder; Out Scope |
| **BR-011** | Golongan darah menyediakan opsi A, B, AB, O, dan **Belum Diketahui**. | Konfirmasi stakeholder; FR-006 |
| **BR-012** | Rhesus menyediakan opsi Positif, Negatif, dan **Belum Diketahui**. | Konfirmasi stakeholder; FR-006 |
| **BR-013** | Pembaruan golongan darah/rhesus memperbarui referensi klinis pasien dan mempertahankan histori nilai sebelumnya. | Draft user; FR-006 |
| **BR-014** | Koreksi golongan darah/rhesus tidak memerlukan verifikasi atau persetujuan petugas kedua. | Konfirmasi stakeholder; FR-006 |
| **BR-015** | SIMRS tidak memiliki workflow atau status **Sedang Diproses/Crossmatch**; proses crossmatch dilakukan di luar SIMRS. | Konfirmasi stakeholder; FR-007 |
| **BR-016** | Hasil akhir crossmatch yang disimpan di SIMRS hanya **Compatible** atau **Tidak Compatible**. | Konfirmasi stakeholder; FR-007 |
| **BR-017** | Status **Selesai** hanya terbentuk setelah hasil akhir crossmatch sudah disimpan dan pengguna menjalankan aksi **Selesai** secara eksplisit, terlepas dari hasil Compatible atau Tidak Compatible. | Konfirmasi stakeholder; FR-007; FR-010; FR-016 |
| **BR-018** | Penyimpanan hasil akhir crossmatch tidak mengubah status order; status tetap **Dikonfirmasi Laboratorium**. Setelah hasil tersimpan, koreksi dan pembatalan tidak tersedia, sedangkan aksi **Selesai** menjadi tersedia. | Konfirmasi stakeholder; FR-007; FR-008; FR-016 |
| **BR-019** | Pembatalan dapat dilakukan pada status Menunggu Konfirmasi atau Dikonfirmasi Laboratorium selama hasil akhir belum disimpan. | Konfirmasi stakeholder; FR-008 |
| **BR-020** | Alasan pembatalan wajib diisi dan dicatat pada audit trail. | Draft user; FR-008; FR-011 |
| **BR-021** | Status **Dibatalkan** merupakan status terminal; order tidak dapat diaktifkan kembali dan unit pengirim harus membuat order baru. | Konfirmasi stakeholder; FR-008; FR-010 |
| **BR-022** | Status tidak dapat diubah secara bebas atau melompati state machine. | Draft user; FR-010 |
| **BR-023** | Audit trail ditampilkan dan disimpan per transaksi, bukan sebagai satu baris terpisah untuk setiap field. | Konfirmasi stakeholder; FR-011; FR-015 |
| **BR-024** | Audit transaksi menyimpan data before/after field relevan, tetapi tidak menyimpan alasan koreksi. | Konfirmasi stakeholder; FR-011 |
| **BR-025** | Unit pengirim hanya melihat status order dan tidak melihat audit, data before/after, alasan koreksi, atau alasan pembatalan. | Konfirmasi stakeholder; FR-012 |
| **BR-026** | Sistem tidak mengirim notifikasi proaktif; perubahan hanya disinkronkan pada tampilan terkait. | Konfirmasi stakeholder; FR-012 |
| **BR-027** | Tombol dan format Print tetap dibutuhkan, tetapi implementasinya berada pada PRD terpisah. | Konfirmasi stakeholder; Out Scope |
| **BR-028** | Dokter pengirim dan diagnosis klinis bersifat read-only pada fitur konfirmasi. | Daftar field koreksi final; FR-002 |
| **BR-029** | Backend wajib memvalidasi permission, status, keberadaan hasil akhir, kelayakan aksi Selesai, dan versi data setiap kali menerima aksi; kondisi UI disabled bukan satu-satunya kontrol. | Logic system; FR-003; FR-009; FR-013; FR-016 |
| **BR-030** | Penyimpanan perubahan order, status, audit, dan update referensi golongan darah/rhesus harus konsisten secara transaksional. | Logic system; FR-006; FR-011; NFR-009 |

## 9. State Machine

### 9.1 Status Order Transfusi

| State | Makna | Aksi yang Tersedia |
|-------|-------|--------------------|
| **Menunggu Konfirmasi** | Order baru telah diterima dari unit pelayanan tetapi belum dikonfirmasi Laboratorium. | Lihat detail, koreksi, konfirmasi, atau batal sesuai permission. |
| **Dikonfirmasi Laboratorium** | Order telah diterima Laboratorium. Pada status ini hasil akhir dapat belum tersimpan atau sudah tersimpan tetapi order belum ditutup melalui aksi Selesai. | Sebelum hasil tersimpan: lihat detail, koreksi, update golongan darah/rhesus, input hasil akhir, atau batal. Setelah hasil tersimpan: lihat detail dan jalankan aksi Selesai sesuai permission. |
| **Selesai** | Hasil akhir crossmatch telah disimpan dan pengguna telah menjalankan aksi Selesai secara eksplisit. | Lihat detail dan audit sesuai permission; seluruh data operasional read-only. |
| **Dibatalkan** | Order dibatalkan sebelum hasil akhir crossmatch disimpan. | Lihat detail dan audit sesuai permission; order tidak dapat diaktifkan kembali. |

**Transisi utama:**

```text
Menunggu Konfirmasi
    ├── Konfirmasi berhasil ──> Dikonfirmasi Laboratorium
    └── Batalkan (guard terpenuhi) ──> Dibatalkan

Dikonfirmasi Laboratorium
    ├── Simpan hasil Compatible/Tidak Compatible ──> tetap Dikonfirmasi Laboratorium (hasil tersimpan)
    ├── Klik Selesai (hasil sudah tersimpan) ──> Selesai
    └── Batalkan sebelum hasil tersimpan (guard terpenuhi) ──> Dibatalkan
```

> Tidak terdapat state **Sedang Diproses** atau **Crossmatch** pada SIMRS v2 fase ini.

### 9.2 Guard Transisi dan Aksi

| Transisi/Aksi | Guard |
|---------------|-------|
| Menunggu Konfirmasi → Dikonfirmasi Laboratorium | Pengguna memiliki permission konfirmasi, order belum dibatalkan, hasil akhir belum tersedia, dan data wajib valid. |
| Simpan hasil akhir pada Dikonfirmasi Laboratorium | Pengguna memiliki permission input hasil, hasil dipilih Compatible/Tidak Compatible, order belum dibatalkan, hasil belum tersimpan, dan versi data masih terbaru; status tidak berubah. |
| Dikonfirmasi Laboratorium → Selesai | Pengguna memiliki permission penyelesaian, hasil akhir sudah tersimpan, order belum dibatalkan, status masih Dikonfirmasi Laboratorium, dan versi data masih terbaru. |
| Menunggu/Dikonfirmasi → Dibatalkan | Pengguna memiliki permission pembatalan, hasil akhir belum disimpan, order belum dibatalkan, alasan pembatalan valid, dan versi data masih terbaru. |
| Koreksi data | Status Menunggu Konfirmasi atau Dikonfirmasi Laboratorium, hasil akhir belum disimpan, order belum dibatalkan, pengguna memiliki permission edit, dan versi data masih terbaru. |
| Update golongan darah/rhesus | Guard koreksi terpenuhi dan pengguna memiliki permission update profil darah pasien. |

## 10. User Stories

> Acceptance Criteria menggunakan pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas Laboratorium**, saya ingin melihat dan mengonfirmasi order baru, sehingga permintaan resmi diterima dan dapat ditindaklanjuti. | 1) Given order berstatus Menunggu Konfirmasi, When pengguna berwenang menekan Konfirmasi, Then status menjadi Dikonfirmasi Laboratorium dan waktu/petugas tercatat. 2) Given pengguna tidak memiliki permission, When mengirim aksi konfirmasi, Then sistem menolak tanpa perubahan data. | FR-002; FR-004; BR-002–BR-004 |
| **US-002** | Sebagai **petugas Laboratorium**, saya ingin mengoreksi kesalahan input tanpa mengisi alasan perubahan, sehingga perbaikan administratif dapat dilakukan dengan cepat. | 1) Given order belum Selesai/Dibatalkan, When field yang diizinkan diubah, Then sistem menyimpan nilai baru tanpa meminta alasan. 2) Then sistem membuat satu audit transaksi yang memuat before/after. | FR-005; FR-011; BR-006–BR-009 |
| **US-003** | Sebagai **petugas berwenang**, saya ingin memperbarui golongan darah dan rhesus pasien, sehingga data klinis pasien dapat digunakan sebagai referensi yang akurat. | 1) Given nilai Belum Diketahui atau perlu dikoreksi, When pengguna berwenang menyimpan nilai baru, Then order dan referensi klinis pasien diperbarui serta nilai lama tetap tersimpan. 2) Then sistem tidak meminta persetujuan petugas kedua. | FR-006; BR-011–BR-014 |
| **US-004** | Sebagai **petugas Laboratorium**, saya ingin mencatat hasil akhir crossmatch lalu menyelesaikan order melalui aksi terpisah, sehingga hasil dapat disimpan terlebih dahulu sebelum status ditutup. | 1) Given order berstatus Dikonfirmasi Laboratorium, When pengguna berwenang menyimpan Compatible atau Tidak Compatible, Then hasil tercatat tetapi status tetap Dikonfirmasi Laboratorium. 2) Given hasil sudah tersimpan, When pengguna berwenang menekan Selesai, Then status menjadi Selesai dan order terkunci. | FR-007; FR-009; FR-016; BR-015–BR-018 |
| **US-005** | Sebagai **petugas Laboratorium**, saya ingin membatalkan order yang salah sebelum hasil akhir disimpan, sehingga order tidak diteruskan. | 1) Given order memenuhi guard, When alasan pembatalan diisi dan pembatalan dikonfirmasi, Then status menjadi Dibatalkan. 2) Given hasil akhir sudah tersimpan, When membatalkan, Then sistem menolak. | FR-008; BR-019–BR-021 |
| **US-006** | Sebagai **petugas**, saya ingin order otomatis terkunci setelah Selesai atau Dibatalkan, sehingga data final tidak berubah. | Given order Selesai/Dibatalkan, When detail dibuka atau request update dikirim, Then data tampil read-only dan backend menolak perubahan. | FR-009; BR-018; BR-021; BR-029 |
| **US-007** | Sebagai **pengguna unit pengirim**, saya ingin melihat status terbaru, sehingga saya mengetahui progres order tanpa melihat data audit internal Laboratorium. | Given status order berubah, When sinkronisasi berhasil, Then unit pengirim melihat status terbaru tanpa audit, before/after, atau alasan pembatalan. | FR-012; BR-025–BR-026 |
| **US-008** | Sebagai **supervisor Laboratorium**, saya ingin melihat audit per transaksi, sehingga setiap aktivitas dapat ditelusuri secara utuh. | Given terdapat aktivitas pada order, When audit dibuka oleh pengguna berwenang, Then sistem menampilkan satu entri per transaksi beserta pelaku, waktu, before/after, dan alasan pembatalan bila relevan. | FR-011; FR-015; BR-023–BR-024 |
| **US-009** | Sebagai **petugas Laboratorium**, saya ingin mendapat informasi saat order telah diperbarui petugas lain, sehingga saya tidak menimpa perubahan terbaru. | Given data yang dibuka bukan versi terbaru, When pengguna menyimpan perubahan, Then sistem menolak konflik dan meminta pemuatan data terbaru. | FR-013; BR-029 |

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Penerimaan order** — sistem menerima order transfusi dari unit pelayanan dan menetapkan status awal Menunggu Konfirmasi. | US-001; BR-002 |
| **FR-002** | **Daftar dan detail order** — sistem menyediakan entry point Modul Laboratorium → Transfusi Darah serta menampilkan identitas pasien, konteks pelayanan, data order, field transfusi, status, dan hasil akhir bila tersedia. | US-001; BR-001; BR-005; BR-028 |
| **FR-003** | **Validasi akses dan status** — sebelum menampilkan atau mengeksekusi aksi, sistem mengevaluasi permission, status order, keberadaan hasil akhir, dan versi data. | US-001; US-006; BR-003; BR-029 |
| **FR-004** | **Konfirmasi order** — sistem menyediakan aksi Konfirmasi untuk pengguna berwenang dan menyimpan status Dikonfirmasi Laboratorium, petugas, serta waktu. | US-001; BR-004 |
| **FR-005** | **Koreksi order** — sistem mengizinkan perubahan jenis produk darah, jumlah kantong, golongan darah, rhesus, dan keterangan tambahan selama guard terpenuhi, tanpa input alasan perubahan dan tanpa validasi stok. | US-002; BR-006–BR-010 |
| **FR-006** | **Update referensi golongan darah/rhesus pasien** — sistem menyediakan opsi Belum Diketahui, menyimpan nilai pada order dan data klinis pasien, mempertahankan histori nilai lama, tidak meminta alasan perubahan, dan tidak memerlukan persetujuan petugas kedua. | US-003; BR-011–BR-014; BR-030 |
| **FR-007** | **Input hasil akhir crossmatch** — sistem menyediakan pilihan Compatible atau Tidak Compatible untuk order Dikonfirmasi Laboratorium; penyimpanan hasil mencatat hasil, petugas, dan waktu tanpa mengubah status order. | US-004; BR-015–BR-018 |
| **FR-008** | **Pembatalan order** — sistem menyediakan modal pembatalan berisi ringkasan order, input alasan wajib, validasi guard, konfirmasi akhir, perubahan status Dibatalkan, dan respons berhasil/gagal. | US-005; BR-019–BR-021 |
| **FR-009** | **Penguncian order** — setelah hasil akhir tersimpan, sistem menolak koreksi dan pembatalan tetapi tetap menyediakan aksi Selesai. Setelah status Selesai atau Dibatalkan, sistem mengubah form menjadi read-only dan menolak seluruh request perubahan operasional. | US-004; US-006; BR-018; BR-021; BR-029 |
| **FR-010** | **Kontrol state machine** — sistem hanya mengizinkan transisi status melalui aksi yang sesuai, termasuk pemisahan aksi Simpan Hasil Akhir dan Selesai, serta tidak menyediakan perubahan status bebas. | BR-017–BR-019; BR-022 |
| **FR-011** | **Audit trail per transaksi** — sistem mencatat setiap transaksi konfirmasi, koreksi, update golongan darah/rhesus, input hasil, perubahan status, dan pembatalan dengan before/after; alasan hanya disimpan pada pembatalan. | US-002; US-003; US-004; US-005; US-008; BR-009; BR-020; BR-023–BR-024 |
| **FR-012** | **Sinkronisasi status** — setelah transaksi berhasil, sistem memperbarui status pada halaman Laboratorium dan unit pengirim tanpa reload manual; unit pengirim hanya menerima status. | US-007; BR-025–BR-026 |
| **FR-013** | **Concurrency control** — sistem menggunakan versioning/optimistic locking atau mekanisme setara untuk mencegah lost update. | US-009; BR-029 |
| **FR-014** | **Respons aksi** — setiap aksi konfirmasi, koreksi, input hasil, penyelesaian order, dan pembatalan menampilkan respons berhasil atau gagal beserta penyebab yang dapat ditindaklanjuti. | Performance expectation; US-001–US-005 |
| **FR-015** | **Tampilan audit** — pengguna dengan permission audit dapat melihat satu entri per transaksi dan membuka detail before/after pada transaksi tersebut. | US-008; BR-023–BR-025 |
| **FR-016** | **Penyelesaian order eksplisit** — setelah hasil akhir tersimpan, sistem menyediakan aksi Selesai untuk pengguna berwenang. Aksi ini mengubah status dari Dikonfirmasi Laboratorium menjadi Selesai, menyimpan petugas dan waktu penyelesaian, membuat audit, serta mengunci order. | US-004; BR-017–BR-018; BR-022; BR-029 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi pasien, dokter, unit, dan penjamin **reuse definisi kanonik dari Master Pasien, Master Staf, Master Unit, serta modul registrasi/pelayanan** — nama, tipe, format, dan validasi harus sama.

### A. Layar TAMPIL — Header Pasien dan Informasi Order (FR-002)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. RM | Master Pasien | Text | — | Read-only. |
| Nama Pasien | Master Pasien | Nama lengkap + status pasien bila tersedia | — | Read-only. |
| Tanggal Lahir / Umur | Master Pasien | `DD MMMM YYYY (xx Tahun)` | — | Mengikuti format kanonik. |
| Jenis Kelamin | Master Pasien | Label kanonik | — | Read-only. |
| Unit/Bangsal/Ruang | Registrasi aktif/order snapshot | Text | — | Menunjukkan lokasi pasien saat order dibuat. |
| Nomor Order | Order Transfusi | Text | — | Read-only dan unik. |
| Tanggal Permintaan | Order Transfusi | `DD-MM-YYYY HH:mm:ss` atau format kanonik | — | Read-only. |
| Dokter Pengirim | Order snapshot / Master Staf | Nama dokter | — | Read-only. |
| Diagnosis Klinis | Order snapshot / EMR | Text | — | Read-only. |
| Status Order | Order Transfusi | Badge | — | Menunggu Konfirmasi, Dikonfirmasi Laboratorium, Selesai, Dibatalkan. |
| Hasil Akhir Crossmatch | Order Transfusi | Badge/text | — | `—` bila belum tersedia; Compatible atau Tidak Compatible bila sudah disimpan. |
| Status Hasil Crossmatch | Keberadaan hasil akhir | Label/indikator | — | Belum Diinput atau Hasil Tersimpan; ketika hasil sudah tersimpan dan status masih Dikonfirmasi Laboratorium, tombol Selesai tersedia sesuai permission. |
| Indikator Terkunci | Status order/keberadaan hasil | Ikon + keterangan | — | Setelah hasil tersimpan, koreksi dan pembatalan terkunci; pada Selesai atau Dibatalkan seluruh aksi operasional terkunci. |

### B. Layar INPUT — Form Konfirmasi/Koreksi (FR-004, FR-005, FR-006)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `blood_product_id` | Jenis Produk Darah | Searchable dropdown | Ya | Harus aktif pada Master Produk Darah | Snapshot order / Master Produk Darah | Editable selama guard koreksi terpenuhi; tidak memeriksa stok. |
| `bag_quantity` | Jumlah Kantong | Integer | Ya | Bilangan bulat `> 0`; batas maksimum `[PERLU KONFIRMASI]` | Snapshot order | Per item produk darah; tidak memeriksa stok. |
| `blood_group` | Golongan Darah | Dropdown | Ya | A, B, AB, O, Belum Diketahui | Snapshot order / data klinis pasien | Editable dengan permission khusus. |
| `rhesus` | Rhesus | Radio/dropdown | Ya | Positif, Negatif, Belum Diketahui | Snapshot order / data klinis pasien | Editable dengan permission khusus. |
| `additional_note` | Keterangan Tambahan | Textarea | Tidak | Batas karakter `[PERLU KONFIRMASI]` | Snapshot order | Tidak membutuhkan alasan perubahan. |
| `confirm_action` | Konfirmasi Order | Action | — | Aktif bila pengguna memiliki permission dan data wajib valid | Manual | Dapat menyimpan koreksi sekaligus konfirmasi. |
| `save_correction_action` | Simpan Perubahan | Action | — | Aktif pada status yang dapat dikoreksi | Manual | Tidak menampilkan input alasan perubahan. |

### C. Layar INPUT — Hasil Akhir Crossmatch (FR-007)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `crossmatch_final_result` | Hasil Akhir Crossmatch | Radio/dropdown | Ya | Compatible atau Tidak Compatible | Manual | Hanya tersedia pada status Dikonfirmasi Laboratorium dan untuk pengguna berwenang. |
| `save_final_result_action` | Simpan Hasil Akhir | Action | — | Memerlukan konfirmasi eksplisit sebelum submit | Manual | Setelah berhasil, hasil tercatat tetapi status tetap Dikonfirmasi Laboratorium. |
| `complete_order_action` | Selesai | Action | — | Aktif hanya setelah hasil akhir tersimpan dan pengguna memiliki permission penyelesaian | Manual | Mengubah status menjadi Selesai dan mengunci order. |

### D. Layar INPUT — Modal Pembatalan (FR-008)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| `order_summary` | Ringkasan Order | Read-only summary | — | Memuat nomor order, pasien, unit, dokter, produk, jumlah, dan status | Order Transfusi | Membantu mencegah salah pembatalan. |
| `cancellation_reason` | Alasan Pembatalan | Textarea | Ya | Tidak boleh kosong/hanya spasi; batas karakter `[PERLU KONFIRMASI]` | Manual | Disimpan pada audit; tidak ditampilkan kepada unit pengirim. |
| `cancel_confirmation` | Konfirmasi Pembatalan | Confirmation action | Ya | Aksi eksplisit sebelum submit | Manual | Mengubah status menjadi Dibatalkan bila guard terpenuhi. |

### E. Data yang Dibuat Otomatis saat Transaksi

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| `order_status` | Status Order | Enum | State machine | Diperbarui oleh aksi yang valid. |
| `confirmed_by` | Dikonfirmasi Oleh | UUID/reference | User login | Diisi saat konfirmasi berhasil. |
| `confirmed_at` | Waktu Konfirmasi | Datetime | Server timestamp | Tidak menggunakan waktu client. |
| `updated_by` | Diubah Oleh | UUID/reference | User login | Diisi untuk setiap koreksi. |
| `updated_at` | Waktu Perubahan | Datetime | Server timestamp | Diisi untuk setiap koreksi. |
| `crossmatch_result_by` | Hasil Dicatat Oleh | UUID/reference | User login | Diisi saat hasil akhir disimpan. |
| `crossmatch_result_at` | Waktu Hasil Disimpan | Datetime | Server timestamp | Tidak otomatis menjadi waktu penyelesaian order. |
| `completed_by` | Diselesaikan Oleh | UUID/reference | User login | Diisi saat pengguna menekan Selesai. |
| `completed_at` | Waktu Penyelesaian | Datetime | Server timestamp | Diisi saat status berhasil berubah menjadi Selesai. |
| `cancelled_by` | Dibatalkan Oleh | UUID/reference | User login | Diisi saat pembatalan berhasil. |
| `cancelled_at` | Waktu Pembatalan | Datetime | Server timestamp | Diisi saat pembatalan berhasil. |
| `record_version` | Versi Data | Integer/UUID | Dibuat sistem | Mendukung concurrency control. |
| `patient_blood_profile_update_id` | Referensi Update Profil Darah | UUID/reference | Master Pasien/EMR | Menghubungkan perubahan order dengan histori klinis pasien. |

### F. Audit Trail per Transaksi (FR-011)

| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| `audit_id` | ID Audit | UUID | Dibuat sistem | Unik dan immutable. |
| `order_id` | Referensi Order | UUID/reference | Order Transfusi | Wajib. |
| `transaction_id` | ID Transaksi | UUID/reference | Dibuat sistem | Satu ID untuk setiap aksi konfirmasi, simpan perubahan, simpan hasil, penyelesaian, atau pembatalan. |
| `action_type` | Jenis Aktivitas | Enum | CONFIRM, UPDATE, UPDATE_BLOOD_PROFILE, FINAL_RESULT, COMPLETE, CANCEL | FINAL_RESULT dan COMPLETE dicatat sebagai transaksi terpisah. |
| `actor_id` | Pelaku | UUID/reference | User login | Wajib. |
| `actor_name_snapshot` | Nama Pelaku | Text | Snapshot Master Staf | Menjaga keterbacaan histori. |
| `occurred_at` | Waktu Aktivitas | Datetime | Server timestamp | Wajib. |
| `before_data` | Data Sebelum | JSON/object | Snapshot sebelum transaksi | Menyimpan field relevan dalam satu transaksi. |
| `after_data` | Data Sesudah | JSON/object | Snapshot setelah transaksi | Menyimpan field relevan dalam satu transaksi. |
| `changed_fields` | Field yang Berubah | Array | Dibuat sistem | Digunakan dalam detail transaksi, bukan sebagai baris audit terpisah. |
| `cancellation_reason` | Alasan Pembatalan | Text/null | Input pengguna | Wajib hanya untuk CANCEL. |
| `source_module` | Sumber Aktivitas | Text/enum | `LAB_TRANSFUSION` | Seluruh aktivitas berasal dari fitur Transfusi Darah. |

### G. Layar TAMPIL — Riwayat Audit (FR-015)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | Audit Trail | `DD MMM YYYY HH:mm:ss` | Sort terbaru ke terlama | Satu baris/card per transaksi. |
| Aktivitas | Audit Trail | Label aksi | Filter jenis aksi bila diperlukan | Dikonfirmasi, Data Diubah, Profil Darah Diubah, Hasil Akhir Disimpan, Order Diselesaikan, Dibatalkan. |
| Pelaku | Audit Trail | Nama petugas | — | Menggunakan snapshot nama. |
| Ringkasan Perubahan | Audit Trail | Ringkasan transaksi | — | Tidak dipecah menjadi baris per field. |
| Detail Before/After | Audit Trail | Expand/detail | — | Hanya dapat dilihat pengguna dengan permission audit. |
| Alasan Pembatalan | Audit Trail | Text | — | Hanya tampil pada transaksi pembatalan. |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Daftar order terbuka dalam `< 1 detik p95` pada beban operasional normal. `[ASUMSI — rekomendasi awal]` | Performance Expectation |
| **NFR-002** | Performa | Detail order terbuka dalam `< 1 detik p95` pada beban operasional normal. `[ASUMSI — rekomendasi awal]` | Performance Expectation |
| **NFR-003** | Performa | Konfirmasi order selesai dalam `< 1 detik p95` setelah request diterima sistem. `[ASUMSI — rekomendasi awal]` | Performance Expectation |
| **NFR-004** | Performa | Koreksi order selesai dalam `< 1 detik p95` setelah validasi field terpenuhi. `[ASUMSI — rekomendasi awal]` | Performance Expectation |
| **NFR-005** | Performa | Penyimpanan hasil akhir selesai dalam `< 1 detik p95` setelah input valid. `[ASUMSI — rekomendasi awal]` | Performance Expectation |
| **NFR-006** | Performa | Pembatalan order selesai dalam `< 1 detik p95` setelah guard dan alasan valid. `[ASUMSI — rekomendasi awal]` | Performance Expectation |
| **NFR-007** | Real-Time | Perubahan status tampil tanpa reload manual dengan target latensi `≤ 3 detik p95`. `[ASUMSI — rekomendasi awal]` | Performance Expectation; FR-012 |
| **NFR-008** | Keamanan/RBAC | Aksi lihat detail, konfirmasi, koreksi, update profil darah, input hasil, penyelesaian order, pembatalan, dan lihat audit dikendalikan oleh permission backend. | BR-003; BR-029 |
| **NFR-009** | Reliabilitas | Penyimpanan hasil dan aksi Selesai diproses sebagai dua transaksi terpisah yang konsisten; perubahan order, status, audit, dan referensi klinis pasien harus konsisten serta mencegah lost update. | BR-017–BR-018; BR-029–BR-030; FR-013; FR-016 |
| **NFR-010** | Auditabilitas | Audit trail bersifat append-only/immutable bagi pengguna operasional dan mencatat 100% transaksi yang diwajibkan. | BR-023–BR-024; FR-011 |
| **NFR-011** | Usability | Saat aksi tidak tersedia, UI menampilkan status dan alasan sistem yang mudah dipahami. | FR-009; FR-014 |
| **NFR-012** | Konsistensi | Label status dan makna status harus sama pada Dashboard Laboratorium, riwayat order, unit pengirim, dan detail order. | BR-025; FR-012 |
| **NFR-013** | Privasi | Unit pengirim tidak dapat mengakses audit, before/after, atau alasan pembatalan; audit hanya tersedia sesuai permission. | BR-025; FR-015 |
| **NFR-014** | Responsivitas | Form dapat digunakan pada resolusi desktop operasional rumah sakit tanpa menyembunyikan informasi kritis atau aksi utama. | Referensi V1; UX expectation |
| **NFR-015** | Observabilitas | Kegagalan update data pasien, penyimpanan transaksi, dan sinkronisasi status memiliki log teknis serta correlation ID yang dapat ditelusuri. | Risk R1–R4 |
| **NFR-016** | Performa | Aksi Selesai mengubah status order dalam `< 1 detik p95` setelah konfirmasi pengguna diterima sistem. `[ASUMSI — rekomendasi awal]` | Metrik; FR-016 |

## 14. Integrasi Internal & Dependency

> Fitur ini tidak memiliki integrasi eksternal yang disebutkan pada sumber. Seluruh dependency berada di dalam ekosistem SIMRS Neurovi. Modul stok darah dan modul proses crossmatch tidak menjadi dependency karena belum tersedia di SIMRS.

| Integrasi | Fungsi di Modul Ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Order Transfusi Darah** | Menyediakan order dan snapshot data dari unit pelayanan. | Internal — Hard dependency | FR-001; FR-002 |
| **Master Pasien / EMR** | Menyediakan demografi serta menerima update referensi golongan darah/rhesus. | Internal — Hard dependency | FR-006 |
| **Master Staf & RBAC** | Menyediakan identitas pengguna dan permission per aksi. | Internal — Hard dependency | FR-003; NFR-008 |
| **Master Produk Darah** | Menyediakan pilihan produk darah yang valid tanpa informasi stok. | Internal — Hard dependency | FR-005 |
| **Audit Trail** | Menyimpan aktivitas dan before/after per transaksi. | Internal — Hard dependency | FR-011; FR-015 |
| **Real-Time Event** | Menyinkronkan status antarhalaman tanpa notifikasi proaktif. | Internal — Hard dependency untuk target tanpa reload | FR-012 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD Order Transfusi Darah dan kontrak data order | Hard | Form konfirmasi tidak memiliki sumber order dan snapshot data yang konsisten. |
| Mekanisme histori golongan darah/rhesus pasien | Hard | Nilai lama berisiko tertimpa atau order tidak sinkron dengan data klinis pasien. |
| Master Staf dan konfigurasi permission | Hard | Sistem tidak dapat membatasi aksi sesuai kewenangan. |
| Audit trail per transaksi | Hard | Perubahan tidak dapat ditelusuri sesuai requirement. |
| Real-time event/websocket/polling setara | Hard untuk target tanpa reload | Status baru hanya terlihat setelah pengguna memuat ulang halaman. |
| PRD Cetak Permintaan Transfusi | Soft terhadap fitur konfirmasi | Konfirmasi tetap dapat berjalan, tetapi tombol dan format cetak belum tersedia. |

## 15. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| **D-001** | Entry point | Modul Laboratorium → Transfusi Darah. |
| **D-002** | Stok darah | Tidak ada manajemen atau validasi stok darah di SIMRS; stok dicatat di luar SIMRS. |
| **D-003** | Proses crossmatch | Tidak ada modul proses crossmatch di SIMRS pada fase ini. |
| **D-004** | Hasil crossmatch | SIMRS hanya mencatat hasil akhir Compatible atau Tidak Compatible. |
| **D-005** | Definisi Selesai | Status Selesai hanya terbentuk setelah hasil akhir crossmatch disimpan dan pengguna menekan tombol Selesai. Penyimpanan hasil saja tidak mengubah status. |
| **D-006** | Alasan koreksi | Koreksi order tidak memerlukan alasan perubahan. |
| **D-007** | Field koreksi | Hanya produk darah, jumlah kantong, golongan darah, rhesus, dan keterangan tambahan. |
| **D-008** | Opsi data belum diketahui | Golongan darah dan rhesus memiliki opsi Belum Diketahui. |
| **D-009** | Verifikasi kedua | Koreksi golongan darah/rhesus tidak memerlukan persetujuan petugas kedua. |
| **D-010** | Pembatalan | Dapat dilakukan pada Menunggu Konfirmasi atau Dikonfirmasi Laboratorium selama guard terpenuhi. |
| **D-011** | Reaktivasi order | Order Dibatalkan tidak dapat diaktifkan kembali; unit pengirim membuat order baru. |
| **D-012** | Notifikasi | Tidak ada notifikasi proaktif. |
| **D-013** | Audit | Ditampilkan per transaksi, bukan per field. |
| **D-014** | Visibilitas unit pengirim | Unit pengirim hanya melihat status, tanpa alasan atau before/after. |
| **D-015** | Print | Tetap dibutuhkan tetapi dibahas pada PRD terpisah. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| **R1** | Golongan darah/rhesus yang salah diperbarui ke data klinis pasien karena tidak ada verifikasi petugas kedua. | Permission khusus, konfirmasi eksplisit sebelum simpan, histori nilai lama, dan audit immutable. |
| **R2** | Pengguna menyimpan hasil akhir tetapi lupa menekan Selesai sehingga order tetap berstatus Dikonfirmasi Laboratorium. | Tampilkan indikator **Hasil Tersimpan — Belum Selesai** secara jelas pada dashboard/detail dan aktifkan tombol Selesai hanya ketika prasyarat terpenuhi. |
| **R3** | Dua petugas mengubah order yang sama dan terjadi lost update. | Record version/optimistic locking serta pesan konflik yang meminta pemuatan data terbaru. |
| **R4** | Status berhasil berubah pada halaman Laboratorium tetapi terlambat tampil pada unit pengirim. | Real-time event dengan retry atau polling setara, monitoring, dan rekonsiliasi status. |
| **R5** | Audit before/after menampilkan data sensitif kepada role yang tidak sesuai. | Permission audit khusus dan pembatasan unit pengirim hanya pada status. |
| **R6** | Batas jumlah kantong atau panjang input belum ditetapkan dan menimbulkan perilaku tidak konsisten. | Tetapkan batas pada keputusan stakeholder sebelum development selesai dan gunakan validasi frontend/backend yang sama. |

## 17. Asumsi

- `[ASUMSI]` Hasil akhir Compatible/Tidak Compatible dicatat melalui fitur Transfusi Darah setelah pemeriksaan dilakukan secara operasional di luar SIMRS.
- `[ASUMSI]` Koreksi tetap diperbolehkan sampai hasil akhir disimpan karena SIMRS tidak memiliki event yang menandai crossmatch mulai diproses; setelah hasil tersimpan, hanya aksi Selesai yang tersedia untuk melanjutkan status.
- `[ASUMSI]` Satu order dapat memiliki satu atau lebih item produk darah dan jumlah kantong disimpan per item, mengikuti struktur PRD Order Transfusi Darah.
- `[ASUMSI]` Rekomendasi role dan permission pada dokumen ini belum menjadi keputusan final rumah sakit.
- `[ASUMSI]` Target performa p95 dan latensi sinkronisasi pada dokumen ini adalah rekomendasi awal yang perlu divalidasi melalui uji teknis.

## 18. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 | 21 Juli 2026 | Team Product | Penyusunan awal PRD berdasarkan bisnis proses pengguna dan referensi form Neurovi v1. |
| 1.1 | 21 Juli 2026 | Team Product | Menghapus manajemen stok dan dependency modul crossmatch; menghapus alasan koreksi; menetapkan entry point Laboratorium → Transfusi Darah; menambahkan hasil akhir Compatible/Tidak Compatible; memperbarui status, pembatalan, audit per transaksi, role recommendation, performa, dan scope Print terpisah. |
| 1.2 | 21 Juli 2026 | Team Product | Memisahkan penyimpanan hasil akhir crossmatch dari penyelesaian order: simpan hasil mempertahankan status Dikonfirmasi Laboratorium, sedangkan status Selesai hanya terbentuk setelah pengguna menekan tombol Selesai. |
