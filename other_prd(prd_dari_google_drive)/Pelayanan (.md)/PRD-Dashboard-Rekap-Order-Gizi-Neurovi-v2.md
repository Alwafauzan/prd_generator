# PRD — Dashboard Rekap Order Gizi

**Related Document:** Bisnis Proses Rekap Order Gizi; PRD Order Makanan Gizi Neurovi v2 (hard dependency); PRD Konfirmasi Order Makanan Gizi Neurovi v2 (hard dependency); PRD Print Dokumen Operasional Gizi (hard dependency untuk layout dokumen); Referensi UI Neurovi v1 — Rekap Order Makanan  
**Dokumen ID:** PRD-GIZI-REKAP-ORDER-v2.0 · **Versi:** 1.2 (Draft — Revisi Mekanisme Cetak Ulang)  
**Tanggal Disusun:** 21 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]  
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Dashboard Rekap Order Gizi merupakan fitur pada Modul Gizi Neurovi v2 yang digunakan oleh **Ahli Gizi** untuk menghitung kebutuhan produksi, distribusi, dan dokumentasi makanan berdasarkan order makanan pasien yang telah dikonfirmasi. Fitur diakses melalui **Gizi → Rekap Order Makanan** dan menyajikan ringkasan per waktu makan serta kelas/layanan, disertai detail Rekap Makanan Pokok, Rekap Data Diet, Rekap Catatan Diet, dan Rekap Menu Tambahan VIP Pendamping Pasien.

Pada Neurovi v1, petugas gizi telah dapat melihat rekap Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore; membuka detail rekap; serta memilih dokumen operasional yang akan dicetak. Neurovi v2 mempertahankan kapabilitas tersebut, memperjelas penggunaan snapshot data order, menyediakan export PDF, menyimpan snapshot hasil print secara permanen, serta memungkinkan dokumen tanggal sebelumnya dicetak ulang melalui filter tanggal dashboard dan panel Print yang sama. Neurovi v2 juga menambahkan rekap menu tambahan VIP bagi pendamping pasien.

Fitur ini bersifat read-mostly. Sumber kebenaran berasal dari order makanan berstatus **Terkonfirmasi**. Proses membuat, mengubah, mengonfirmasi, dan membatalkan order tetap berada pada fitur Order Makanan Gizi dan Konfirmasi Order Makanan Gizi.

> Referensi: `rekap order gizi.pdf`; tangkapan layar fitur Rekap Order Makanan Neurovi v1.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Petugas gizi dapat melihat ringkasan jumlah order untuk Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore.
- Jumlah ditampilkan berdasarkan VIP, Kelas I, Kelas II, Kelas III, Rawat Jalan, IGD, dan total keseluruhan.
- Petugas dapat memilih tanggal, melakukan refresh, membuka detail rekap, serta mencetak E-Ticket Makanan, Serah Terima Makanan, dan Sampel Makanan.
- Detail rekap dipisahkan menjadi Rekap Makanan Pokok, Rekap Data Diet, dan Rekap Catatan Diet.
- Belum tersedia rekap terstruktur untuk permintaan menu tambahan VIP bagi pendamping pasien.
- Aturan snapshot historis, cetak ulang, dan pemisahan menu pendamping belum dinyatakan secara eksplisit.

**Masalah/pain point:**
- **Aspek bisnis proses:** instalasi gizi memerlukan satu sumber perhitungan yang konsisten untuk produksi dan distribusi makanan, termasuk kebutuhan tambahan bagi pendamping pasien VIP.
- **Aspek UX:** informasi produksi harus mudah ditelusuri dari ringkasan ke detail, dengan pilihan dokumen print yang tidak ambigu.
- **Aspek logic system:** agregasi harus hanya menghitung order valid, mempertahankan histori saat master berubah, dan memastikan perpindahan unit pasien diterapkan pada waktu makan berikutnya tanpa mengubah snapshot waktu makan yang sudah dikonfirmasi.

**Dampak utama yang disasar v2:**
- Mengurangi perhitungan manual serta risiko kekurangan atau kelebihan produksi makanan.
- Menurunkan risiko catatan diet pasien terlewat pada proses produksi.
- Menjaga rekap historis tetap konsisten meskipun master, unit, atau kelas pasien berubah.
- Menyediakan hasil print yang dapat dicetak ulang secara identik berdasarkan snapshot permanen.
- Menyediakan perhitungan menu tambahan VIP pendamping secara otomatis dan terpisah.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP):** seluruh rekap, detail, filter, refresh, print trigger, cetak ulang, export PDF, dan rekap menu tambahan VIP yang tercantum pada dokumen ini.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)

1. **Entry point dashboard** — fitur tersedia pada **Gizi → Rekap Order Makanan**.
2. **Akses Ahli Gizi** — sementara hanya role Ahli Gizi yang dapat melihat dashboard, membuka detail, melihat data pasien, mencetak, mencetak ulang, dan mengekspor data.
3. **Ringkasan rekap order makanan** — menampilkan jumlah order Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore.
4. **Agregasi kelas dan layanan** — mengelompokkan jumlah berdasarkan VIP, Kelas I, Kelas II, Kelas III, Rawat Jalan, IGD, dan total keseluruhan.
5. **Filter tanggal pelayanan** — default hari ini; tanggal masa depan dapat dipilih dan menampilkan data kosong apabila belum terdapat order.
6. **Refresh data** — mengambil ulang agregasi terbaru dari order makanan yang telah dikonfirmasi.
7. **Drill down detail** — membuka Rekap Makanan Pokok, Rekap Data Diet, Rekap Catatan Diet, dan Rekap Menu Tambahan VIP Pendamping.
8. **Rekap makanan pokok** — menampilkan jumlah berdasarkan jenis makanan pokok, waktu makan, kelas/layanan, dan subtotal.
9. **Rekap data diet** — menampilkan seluruh jenis diet yang relevan, termasuk jenis diet dengan jumlah 0.
10. **Rekap catatan diet** — menampilkan pasien yang memiliki catatan diet khusus.
11. **Rekap menu tambahan VIP pendamping pasien** — menampilkan jumlah berdasarkan menu dan waktu pemberian Pagi/Siang/Sore; unit digunakan sebagai filter, bukan breakdown kolom/baris tambahan.
12. **Print dokumen operasional** — user memilih tepat satu jenis dokumen untuk setiap print job: E-Ticket Makanan, Serah Terima Makanan, atau Sampel Makanan.
13. **Filter unit print** — boleh menggunakan Semua Unit yang Diizinkan atau satu unit tertentu.
14. **Snapshot print permanen dan cetak ulang dari dashboard** — data hasil print disimpan permanen. Dokumen tanggal sebelumnya dapat dicetak ulang dengan memilih tanggal pada dashboard lalu menggunakan panel Print yang sama; tidak diperlukan halaman riwayat cetak khusus.
15. **Export PDF** — mengekspor rekap sesuai halaman dan filter aktif dalam format PDF.
16. **Validasi akses unit** — Ahli Gizi hanya dapat melihat, mencetak, atau mengekspor data unit yang berada dalam cakupan hak aksesnya.
17. **Metadata output** — hasil print menampilkan waktu cetak dan nama petugas; tidak menggunakan nomor tiket khusus.
18. **Sinkronisasi perpindahan pasien** — snapshot untuk waktu makan yang sudah dikonfirmasi tetap terkunci, sedangkan waktu makan berikutnya menggunakan unit/kelas terbaru sebelum dikonfirmasi.
19. **Tanpa cutoff produksi** — seluruh order Terkonfirmasi pada tanggal pelayanan dan waktu makan terkait dihitung tanpa batas waktu cutoff.

### Out Scope

- Pembuatan order makanan pasien dan menu tambahan VIP.
- Proses konfirmasi, koreksi, persetujuan, atau pembatalan order makanan.
- Pengaturan master makanan pokok, master diet, master waktu makan, master menu VIP, master kelas, dan master unit.
- Field, layout, dan desain final dokumen E-Ticket Makanan, Serah Terima Makanan, dan Sampel Makanan; dibahas pada PRD print terpisah.
- Pengelolaan stok bahan makanan, resep produksi dapur, costing, pembelian, dan inventori gizi.
- Penjadwalan tenaga produksi atau distribusi makanan.
- Pencatatan bukti serah terima elektronik oleh pasien/unit setelah distribusi.
- Perubahan status order dari dashboard rekap.
- Indikator bahwa hasil print lama sudah tidak sesuai setelah order dikoreksi.
- Halaman atau menu riwayat cetak khusus; cetak ulang dilakukan melalui filter tanggal dashboard dan panel Print yang sama.
- Nomor tiket atau sequence nomor tiket dokumen.
- Cutoff produksi berdasarkan jam tertentu.

## 4. Goals and Metrics

### Tujuan

1. Menyediakan rekap produksi makanan yang akurat, konsisten, dan mudah ditelusuri berdasarkan tanggal pelayanan.
2. Membantu Ahli Gizi menyiapkan jumlah makanan pasien dan menu tambahan VIP pendamping tanpa perhitungan manual.
3. Menjaga histori rekap serta hasil print agar dapat direproduksi secara identik.
4. Memastikan data layar, print, cetak ulang melalui filter tanggal dashboard, dan export PDF mengikuti sumber serta filter yang konsisten.

### Metrik (terukur)

| Metrik | Target | Sumber |
|---|---:|---|
| Initial load dashboard rekap | ≤ 2 detik | NFR-001 |
| Penerapan filter | ≤ 2 detik | NFR-002 |
| Drill down ke detail rekap | ≤ 1 detik | NFR-003 |
| Generate dokumen print | ≤ 5 detik | NFR-004 |
| Generate file export PDF | ≤ 5 detik | NFR-005 |
| Konsistensi subtotal dan total | 100% sesuai dataset order terkonfirmasi | BR-001–BR-012; NFR-008 |
| Kesesuaian hasil print awal dengan snapshot tersimpan | 100% | BR-027; NFR-011 |
| Kesesuaian hasil cetak ulang dengan print awal | 100% | BR-028; NFR-011 |
| Data unit di luar hak akses | 0 data terekspos | BR-024; NFR-009 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait

| Modul / Fitur | Peran terhadap Dashboard Rekap Order Gizi |
|---|---|
| Order Makanan Gizi | Sumber order makanan pasien, atribut snapshot, dan permintaan menu tambahan VIP pendamping. |
| Konfirmasi Order Makanan Gizi | Menentukan order/waktu makan yang masuk rekap serta menjadi bukti persetujuan menu pendamping VIP. |
| Master Makanan Pokok | Sumber referensi jenis makanan pokok; label historis tetap berasal dari snapshot order. |
| Master Diet | Sumber jenis diet yang dapat digunakan; daftar diet bernilai 0 tetap dapat ditampilkan. |
| Master Menu VIP | Sumber menu pendamping aktif; menu nonaktif tetap dapat tampil pada histori berdasarkan snapshot. |
| Master Waktu Makan | Sumber Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore; menu pendamping hanya menggunakan Pagi, Siang, dan Sore. |
| Master Unit, Kelas, dan Ruang Perawatan | Sumber unit/kelas terkini sebelum snapshot waktu makan dikonfirmasi dan sumber validasi cakupan akses. |
| Registrasi dan Pelayanan Pasien | Sumber identitas pasien, penjamin, unit, dan kelas yang direferensikan oleh order. |
| Authentication & Authorization | Menentukan role Ahli Gizi, user aktif, dan cakupan unit yang boleh diakses. |
| Print/Document Service | Membuat dokumen berdasarkan snapshot permanen dan mendukung cetak ulang melalui tanggal serta filter aktif pada dashboard. |
| Export Service | Membuat export PDF sesuai filter aktif. |

**Dependency lintas modul:** Order Makanan Gizi dan Konfirmasi Order Makanan Gizi merupakan hard dependency karena dashboard tidak menghasilkan data order secara mandiri. Layout dokumen print mengikuti PRD print terpisah.

### B. Persona

| Persona | Tipe | Peran terhadap Modul |
|---|---|---|
| Ahli Gizi | Primary | Melihat dashboard/detail/data pasien, menerapkan filter, mencetak, mencetak ulang dokumen tanggal sebelumnya melalui panel Print yang sama, dan mengekspor PDF sebagai dasar produksi/distribusi. |
| Petugas Pelayanan yang Membuat Order | Source actor | Membuat atau memperbarui order pada modul pelayanan; data menjadi sumber snapshot rekap. |
| Petugas/Ahli Gizi yang Mengonfirmasi Order | Source actor | Mengonfirmasi order dan menu pendamping sehingga menentukan data yang layak masuk rekap. |
| Administrator Sistem | Supporting | Mengelola master, role, permission, dan cakupan unit. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)

1. User pelayanan membuat order makanan pasien.
2. Instalasi gizi mengonfirmasi order.
3. Order terkonfirmasi masuk ke Rekap Order Makanan.
4. Petugas gizi memilih tanggal dan melihat ringkasan jumlah berdasarkan waktu makan serta kelas/layanan.
5. Petugas membuka detail Rekap Makanan Pokok, Rekap Data Diet, atau Rekap Catatan Diet.
6. Petugas memilih unit dan kebutuhan dokumen yang akan dicetak.
7. Petugas menggunakan hasil rekap dan dokumen sebagai dasar produksi serta distribusi makanan.
8. Permintaan menu tambahan VIP pendamping belum direkap secara khusus.

### B. To-Be (Neurovi v2 — Fase 1 MVP)

1. User pelayanan membuat order makanan pasien dan, bila berlaku, satu permintaan menu tambahan VIP untuk satu pendamping pada waktu pemberian terkait.
2. Data kelas, unit, penjamin, makanan pokok, diet, dan menu pendamping dicatat sebagai snapshot order.
3. Ahli Gizi melakukan konfirmasi order. Konfirmasi tersebut sekaligus menjadi bukti persetujuan menu pendamping VIP.
4. Snapshot untuk waktu makan yang dikonfirmasi dikunci dan digunakan sebagai sumber rekap historis.
5. Sistem memasukkan hanya order/waktu makan berstatus Terkonfirmasi ke dataset rekap berdasarkan tanggal pelayanan.
6. Sistem menghitung ringkasan per waktu makan serta mengelompokkannya berdasarkan VIP, Kelas I, Kelas II, Kelas III, Rawat Jalan, dan IGD.
7. Ahli Gizi membuka **Gizi → Rekap Order Makanan**. Tanggal default adalah hari ini; tanggal masa depan dapat dipilih dan menghasilkan empty state apabila belum ada data.
8. Ahli Gizi dapat melakukan refresh untuk mengambil perubahan order terbaru.
9. Ahli Gizi membuka detail Rekap Makanan Pokok, Rekap Data Diet, Rekap Catatan Diet, atau Rekap Menu Tambahan VIP Pendamping.
10. Rekap Data Diet tetap menampilkan jenis diet bernilai 0.
11. Rekap Menu Tambahan VIP hanya menghitung waktu Pagi, Siang, dan Sore serta menggunakan unit sebagai filter.
12. Bila pasien pindah unit/kelas setelah satu waktu makan dikonfirmasi, snapshot waktu makan tersebut tidak berubah. Data unit/kelas terbaru diterapkan pada waktu makan berikutnya sebelum dikonfirmasi.
13. Ahli Gizi dapat memilih Semua Unit yang Diizinkan atau satu unit tertentu, lalu memilih tepat satu jenis dokumen print.
14. Sistem membuat dokumen sesuai snapshot saat print, mencantumkan waktu dan nama petugas, serta menyimpan snapshot secara permanen.
15. Untuk mencetak ulang dokumen tanggal sebelumnya, Ahli Gizi memilih tanggal pelayanan lama pada dashboard, membuka panel Print yang sama, lalu menerapkan kembali unit, jenis dokumen, dan waktu makan yang sesuai.
16. Bila snapshot print yang sesuai ditemukan, sistem menggunakan snapshot tersebut sebagai sumber dokumen tanpa menghitung ulang order terkini.
17. Ahli Gizi dapat mengekspor halaman aktif ke PDF sesuai filter.
18. Seluruh order Terkonfirmasi pada tanggal pelayanan dihitung tanpa cutoff produksi.
19. Bila order dikoreksi atau dibatalkan melalui modul sumber, rekap mengikuti perubahan eksplisit tersebut setelah refresh. Perubahan referensi master atau perpindahan pasien saja tidak mengubah snapshot waktu makan yang telah dikonfirmasi.

### C. Perbedaan As-Is (V1) vs To-Be (V2)

| Aspek | As-Is (V1) | To-Be (V2) |
|---|---|---|
| Entry point | Rekap Order Makanan pada Modul Gizi | Ditetapkan **Gizi → Rekap Order Makanan**. |
| Role | Belum ditegaskan pada PRD | Sementara hanya Ahli Gizi. |
| Tanggal | Filter tanggal tersedia | Default hari ini; tanggal masa depan diperbolehkan dan dapat kosong. |
| Snapshot | Belum eksplisit | Snapshot berasal dari data order dan dikunci per waktu makan saat konfirmasi. |
| Perpindahan unit/kelas | Belum eksplisit | Tidak mengubah waktu makan yang sudah dikonfirmasi; diterapkan pada waktu makan berikutnya. |
| Rekap Data Diet | Menampilkan data diet | Seluruh tipe relevan tetap tampil termasuk nilai 0. |
| Menu VIP nonaktif | Belum eksplisit | Tetap tampil pada histori apabila pernah diorder. |
| Menu pendamping | Belum tersedia secara khusus | Satu pendamping, quantity satu, waktu Pagi/Siang/Sore, unit sebagai filter. |
| Persetujuan menu pendamping | Belum eksplisit | Terjadi saat konfirmasi order gizi. |
| Print | Checkbox beberapa kebutuhan pada V1 | Tepat satu jenis dokumen per print job; unit dapat Semua Unit yang Diizinkan. |
| Nomor tiket | Disebut pada draft awal | Tidak digunakan. |
| Cetak ulang | Belum eksplisit | Dokumen tanggal sebelumnya dicetak ulang dari dashboard dengan memilih tanggal pelayanan dan filter print yang sama; sistem menggunakan snapshot print tersimpan tanpa halaman riwayat khusus. |
| Export | Belum ditetapkan | PDF. |
| Cutoff produksi | Belum eksplisit | Tidak ada cutoff. |

## 7. Main Flow / Mindmap

### Skenario 1 — Melihat Ringkasan Rekap Harian

1. Ahli Gizi membuka **Gizi → Rekap Order Makanan**.
2. Sistem menetapkan tanggal hari ini sebagai default.
3. Sistem mengambil order/waktu makan berstatus Terkonfirmasi pada tanggal pelayanan terpilih.
4. Sistem menampilkan Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore.
5. Setiap baris menampilkan VIP, Kelas I, Kelas II, Kelas III, Rawat Jalan, IGD, dan Total.
6. Ahli Gizi dapat memilih tanggal lain, termasuk tanggal masa depan.
7. Bila tanggal masa depan belum memiliki order Terkonfirmasi, sistem menampilkan nilai 0/empty state tanpa error.
8. Ahli Gizi dapat menekan Refresh; sistem memperbarui data dan informasi **last updated**.

### Skenario 2 — Drill Down Rekap Makanan Pokok

1. Ahli Gizi memilih **Lihat Detail**.
2. Sistem membuka halaman detail dengan tanggal aktif.
3. Ahli Gizi memilih tab **Rekap Makanan Pokok**.
4. Sistem menampilkan jenis makanan pokok, cakupan waktu makan, jumlah per kelas/layanan, dan subtotal.
5. Ahli Gizi dapat memfilter makanan pokok serta waktu makan.
6. Ahli Gizi dapat mengekspor hasil aktif ke PDF.

### Skenario 3 — Melihat Rekap Data Diet

1. Ahli Gizi memilih tab **Rekap Data Diet**.
2. Sistem menampilkan setiap jenis diet relevan beserta jumlah VIP, Kelas I, Kelas II, Kelas III, Rawat Jalan, IGD, dan subtotal.
3. Jenis diet dengan jumlah 0 tetap ditampilkan.
4. Ahli Gizi dapat memfilter tipe diet dan mengekspor hasil aktif ke PDF.

### Skenario 4 — Melihat Rekap Catatan Diet

1. Ahli Gizi memilih tab **Rekap Catatan Diet**.
2. Sistem hanya menampilkan order/pasien yang memiliki catatan diet.
3. Sistem menampilkan No RM, Nama Pasien, Penjamin, Unit, Waktu Makan, Jenis Diet, dan Catatan Diet.
4. Ahli Gizi dapat memilih tanggal, waktu makan, dan melakukan pencarian pasien.
5. Sistem menampilkan pagination ketika jumlah data melebihi kapasitas halaman.
6. Ahli Gizi dapat melihat teks catatan lengkap dan mengekspor data aktif ke PDF.

### Skenario 5 — Melihat Rekap Menu Tambahan VIP Pendamping

1. Ahli Gizi membuka tab **Rekap Menu Tambahan VIP Pendamping**.
2. Sistem mengambil permintaan menu pendamping yang telah disetujui saat konfirmasi order gizi.
3. Sistem hanya menghitung pasien pada kelas yang mengizinkan layanan VIP.
4. Setiap pasien hanya memiliki satu pendamping dan quantity menu pendamping maksimal satu pada waktu pemberian yang sama.
5. Sistem menampilkan Nama Menu VIP, jumlah Pagi, Siang, Sore, dan Total.
6. Unit digunakan sebagai filter; tabel tidak melakukan breakdown unit bersamaan dengan breakdown menu.
7. Menu VIP yang saat ini nonaktif tetap ditampilkan apabila terdapat snapshot historis pada tanggal yang dipilih.
8. Jumlah menu pendamping tidak ditambahkan ke jumlah makanan pasien.
9. Ahli Gizi dapat mengekspor hasil aktif ke PDF.

### Skenario 6 — Print Dokumen Operasional

1. Ahli Gizi menekan **Print**.
2. Sistem membuka panel/modal Print Rekap Order Makanan.
3. Filter Unit default ke **Semua Unit yang Diizinkan** dan dapat diubah menjadi satu unit tertentu.
4. Ahli Gizi memilih tepat satu jenis dokumen: **E-Ticket Makanan**, **Serah Terima Makanan**, atau **Sampel Makanan**.
5. Ahli Gizi memilih waktu makan yang diperlukan sesuai aturan dokumen pada PRD print terpisah.
6. Sistem memvalidasi tanggal, unit, jenis dokumen, waktu makan yang relevan, hak akses, dan ketersediaan data.
7. Bila valid, sistem membuat snapshot filter dan dataset, lalu menghasilkan dokumen dengan waktu cetak serta nama petugas.
8. Sistem menyimpan snapshot hasil print secara permanen.
9. Bila tidak ada data, sistem menolak proses tanpa membuat snapshot/dokumen final.

### Skenario 7 — Cetak Ulang Dokumen Tanggal Sebelumnya melalui Dashboard

1. Ahli Gizi memilih tanggal pelayanan sebelumnya pada filter tanggal Dashboard Rekap Order Makanan.
2. Sistem menampilkan rekap sesuai tanggal yang dipilih.
3. Ahli Gizi menekan **Print** dan menggunakan panel Print Rekap Order Makanan yang sama seperti proses print normal.
4. Ahli Gizi memilih **Semua Unit yang Diizinkan** atau satu unit, tepat satu jenis dokumen, serta waktu makan yang diperlukan.
5. Sistem menggunakan kombinasi tanggal pelayanan dan filter print aktif untuk mencari snapshot print yang sesuai.
6. Bila snapshot yang sesuai tersedia, sistem menghasilkan dokumen dari snapshot tersebut dan tidak menghitung ulang data order terkini.
7. Isi data cetak ulang harus sama dengan snapshot dokumen sebelumnya, meskipun setelah print awal terdapat koreksi order atau perubahan data sumber.
8. Proses ini tidak memerlukan halaman atau menu **Riwayat Cetak** khusus.
9. Isi dataset tetap mengacu pada snapshot sebelumnya. Metadata waktu dan petugas pada dokumen hasil print ulang menggunakan metadata proses print ulang.

### Skenario 8 — Perpindahan Unit/Kelas Antarwaktu Makan

1. Order untuk Makan Pagi telah dikonfirmasi dan snapshot unit/kelas dikunci.
2. Pasien berpindah unit atau kelas sebelum Makan Siang.
3. Rekap Makan Pagi tetap menggunakan unit/kelas snapshot saat konfirmasi Makan Pagi.
4. Data order untuk Makan Siang diperbarui menggunakan unit/kelas terbaru sebelum konfirmasi Makan Siang.
5. Setelah Makan Siang dikonfirmasi, snapshot Makan Siang dikunci dan masuk rekap pada unit/kelas terbaru.

### Skenario 9 — Koreksi atau Pembatalan Order

1. Order dikoreksi atau dibatalkan secara eksplisit pada modul sumber.
2. Ahli Gizi melakukan refresh atau membuka ulang dashboard.
3. Sistem menggunakan versi order terkonfirmasi terbaru untuk koreksi yang diizinkan dan mengecualikan order Batal.
4. Sistem tidak menampilkan indikator bahwa dokumen print sebelumnya telah menjadi tidak sesuai.
5. Cetak ulang dokumen lama tetap menggunakan snapshot print awal.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|---|---|---|
| **BR-001** | Hanya order/waktu makan berstatus **Terkonfirmasi** yang masuk ke rekap. | PDF bisnis proses; FR-001; US-001 |
| **BR-002** | Order berstatus Batal tidak dihitung dalam rekap, print baru, maupun export. | PDF bisnis proses; FR-001; FR-015 |
| **BR-003** | Dasar tanggal rekap adalah tanggal pelayanan, bukan tanggal input order. | PDF bisnis proses; FR-002 |
| **BR-004** | Perubahan eksplisit pada order terkonfirmasi yang diizinkan oleh modul sumber memperbarui rekap setelah refresh; perubahan referensi master/registrasi tidak boleh mengubah snapshot yang sudah dikunci. | Konfirmasi stakeholder; FR-003; FR-021 |
| **BR-005** | Ringkasan, detail, print baru, dan export harus menggunakan aturan agregasi serta filter yang konsisten. | Performance Expectation; FR-017 |
| **BR-006** | Ringkasan waktu makan terdiri dari Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore. | Feature Capabilities; FR-004 |
| **BR-007** | Ringkasan dikelompokkan berdasarkan VIP, Kelas I, Kelas II, Kelas III, Rawat Jalan, dan IGD. | Feature Capabilities; FR-004 |
| **BR-008** | Total waktu makan merupakan jumlah seluruh kelompok kelas/layanan pada baris tersebut. | Logic System; FR-004 |
| **BR-009** | Subtotal Rekap Makanan Pokok merupakan jumlah seluruh kelas/layanan untuk makanan pokok dan filter yang sama. | Feature Capabilities; FR-007 |
| **BR-010** | Subtotal Rekap Data Diet merupakan jumlah seluruh kelas/layanan untuk jenis diet dan filter yang sama. | Feature Capabilities; FR-009 |
| **BR-011** | Rekap Catatan Diet hanya menampilkan data dengan catatan diet tidak kosong. | Feature Capabilities; FR-011 |
| **BR-012** | Seluruh subtotal dan total dihitung otomatis dan tidak dapat diedit dari dashboard. | Logic System; FR-004–FR-013 |
| **BR-013** | Menu tambahan VIP hanya dihitung untuk kelas yang mengizinkan layanan VIP dan telah disetujui saat konfirmasi order gizi. | Konfirmasi stakeholder; FR-013 |
| **BR-014** | Satu pasien hanya dapat memiliki satu pendamping dan quantity menu pendamping maksimal satu pada waktu pemberian yang sama. | Konfirmasi stakeholder; FR-013 |
| **BR-015** | Menu VIP yang dibatalkan tidak dihitung setelah refresh. | PDF bisnis proses; FR-003; FR-013 |
| **BR-016** | Rekap menu tambahan VIP dipisahkan dari rekap makanan pasien. | PDF bisnis proses; FR-014 |
| **BR-017** | Menu VIP nonaktif tidak dapat dipilih pada order baru, tetapi tetap tampil pada rekap historis apabila terdapat snapshot order. | Konfirmasi stakeholder; FR-013 |
| **BR-018** | Tanggal wajib tersedia untuk load, filter, print, dan export. | Validasi; FR-002; FR-015; FR-016 |
| **BR-019** | Waktu makan wajib dipilih pada proses detail/print yang mensyaratkan konteks waktu makan. | Validasi; FR-006; FR-015 |
| **BR-020** | Print baru mengikuti filter aktif dan menggunakan snapshot data saat proses print berhasil. | Print; FR-015 |
| **BR-021** | Sistem tidak boleh membuat dokumen print apabila hasil filter tidak memiliki data. | Validasi; FR-015 |
| **BR-022** | Dalam satu print job, user hanya dapat memilih satu jenis dokumen: E-Ticket, Serah Terima, atau Sampel Makanan. | Konfirmasi stakeholder; FR-015 |
| **BR-023** | Dokumen print wajib menampilkan waktu cetak dan nama petugas. | PDF bisnis proses; FR-015 |
| **BR-024** | Data dan unit yang dapat dilihat, dicetak, dan diekspor dibatasi oleh role Ahli Gizi serta cakupan unit user. | Konfirmasi stakeholder; FR-005; FR-018 |
| **BR-025** | Refresh memperbarui data, total, subtotal, dan last updated secara konsisten. | Performance Expectation; FR-003 |
| **BR-026** | Nilai agregasi kosong ditampilkan sebagai 0. | Baseline V1; FR-004–FR-013 |
| **BR-027** | Kelas, unit, penjamin, makanan pokok, diet, dan menu menggunakan snapshot data order. Snapshot waktu makan dikunci saat konfirmasi. | Konfirmasi stakeholder; FR-021 |
| **BR-028** | Snapshot hasil print disimpan permanen. Cetak ulang dilakukan dengan memilih tanggal pelayanan sebelumnya pada dashboard dan menggunakan panel Print yang sama; bila snapshot yang sesuai tersedia, sistem harus menggunakan snapshot tersebut tanpa menghitung ulang data terkini. | Konfirmasi stakeholder; FR-020 |
| **BR-029** | Tanggal default adalah hari ini; tanggal masa depan boleh dipilih dan dapat menghasilkan data kosong. | Konfirmasi stakeholder; FR-002 |
| **BR-030** | Jenis diet dengan jumlah 0 tetap ditampilkan pada Rekap Data Diet. | Konfirmasi stakeholder; FR-009 |
| **BR-031** | Waktu pemberian menu pendamping VIP hanya Pagi, Siang, dan Sore; waktu Snack tidak digunakan. | Konfirmasi stakeholder; FR-013 |
| **BR-032** | Unit pada Rekap Menu Tambahan VIP digunakan sebagai filter, bukan breakdown bersamaan dengan menu. | Konfirmasi stakeholder; FR-013 |
| **BR-033** | Filter Unit pada panel Print boleh default ke Semua Unit yang Diizinkan. | Konfirmasi stakeholder; FR-015 |
| **BR-034** | Hasil export menggunakan format PDF. | Konfirmasi stakeholder; FR-016 |
| **BR-035** | Sistem tidak menggunakan nomor tiket khusus untuk dokumen print pada fitur ini. | Konfirmasi stakeholder; FR-015 |
| **BR-036** | Sistem tidak menampilkan indikator ketidaksesuaian pada print lama setelah koreksi order. | Konfirmasi stakeholder; FR-020 |
| **BR-037** | Tidak terdapat cutoff produksi; semua order Terkonfirmasi pada tanggal pelayanan dan waktu makan terkait dihitung. | Konfirmasi stakeholder; FR-001 |
| **BR-038** | Field dan layout dokumen operasional mengikuti PRD print terpisah. | Konfirmasi stakeholder; Dependency |
| **BR-039** | Jika pasien berpindah unit/kelas, snapshot waktu makan yang sudah dikonfirmasi tetap; waktu makan berikutnya menggunakan data terbaru sebelum dikonfirmasi. | Konfirmasi stakeholder; FR-021 |

## 9. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|---|---|---|---|
| **US-001** | Sebagai **Ahli Gizi**, saya ingin melihat ringkasan order terkonfirmasi per waktu makan, sehingga saya dapat menentukan kebutuhan produksi harian. | **Given** terdapat order Terkonfirmasi pada tanggal terpilih, **When** dashboard dimuat, **Then** sistem menampilkan jumlah per waktu makan, kelas/layanan, dan total; order Batal tidak dihitung. | FR-001; FR-004; BR-001–BR-008 |
| **US-002** | Sebagai **Ahli Gizi**, saya ingin menggunakan tanggal hari ini sebagai default dan dapat memilih tanggal lain, sehingga rekap cepat diakses dan kebutuhan hari berikutnya dapat diperiksa. | **Given** dashboard dibuka, **When** sistem memuat filter tanggal, **Then** default adalah hari ini; **When** tanggal masa depan tanpa data dipilih, **Then** sistem menampilkan 0/empty state. | FR-002; BR-018; BR-029 |
| **US-003** | Sebagai **Ahli Gizi**, saya ingin me-refresh data, sehingga koreksi atau pembatalan terbaru pada order tercermin pada rekap. | **Given** dashboard telah terbuka, **When** Refresh ditekan, **Then** sistem mengambil ulang data, menghitung agregasi, dan memperbarui last updated. | FR-003; BR-004; BR-025 |
| **US-004** | Sebagai **Ahli Gizi**, saya ingin melihat rekap makanan pokok, sehingga saya dapat menyiapkan kebutuhan nasi, bubur, tim, blender, MPASI, dan jenis lainnya. | **Given** tanggal valid, **When** Rekap Makanan Pokok dibuka, **Then** sistem menampilkan makanan pokok, waktu makan, jumlah per kelas/layanan, dan subtotal. | FR-006–FR-008; BR-009 |
| **US-005** | Sebagai **Ahli Gizi**, saya ingin melihat seluruh jenis diet termasuk yang bernilai 0, sehingga daftar kebutuhan diet tetap lengkap dan konsisten. | **Given** Rekap Data Diet dibuka, **When** data dimuat, **Then** seluruh jenis diet relevan ditampilkan dan diet tanpa order bernilai 0. | FR-009; FR-010; BR-030 |
| **US-006** | Sebagai **Ahli Gizi**, saya ingin melihat pasien dengan catatan diet, sehingga instruksi khusus pasien tidak terlewat. | **Given** terdapat order dengan catatan diet, **When** Rekap Catatan Diet dibuka, **Then** hanya data dengan catatan tidak kosong yang ditampilkan beserta informasi pasien. | FR-011; FR-012; BR-011 |
| **US-007** | Sebagai **Ahli Gizi**, saya ingin melihat rekap menu pendamping VIP secara terpisah, sehingga porsi pendamping tidak memengaruhi jumlah makanan pasien. | **Given** terdapat menu pendamping yang disetujui saat konfirmasi, **When** rekap VIP dibuka, **Then** sistem menampilkan jumlah Pagi/Siang/Sore per menu dan unit hanya sebagai filter. | FR-013; FR-014; BR-013–BR-017; BR-031–BR-032 |
| **US-008** | Sebagai **Ahli Gizi**, saya ingin memilih satu jenis dokumen dan unit yang dibutuhkan, sehingga proses print tidak menghasilkan dokumen yang tidak dimaksudkan. | **Given** panel Print terbuka, **When** user memilih jenis dokumen lain, **Then** pilihan jenis dokumen sebelumnya digantikan; unit dapat Semua Unit yang Diizinkan. | FR-015; BR-022; BR-033 |
| **US-009** | Sebagai **Ahli Gizi**, saya ingin mencetak ulang dokumen tanggal sebelumnya melalui filter tanggal dan panel Print yang sama, sehingga saya tidak memerlukan halaman riwayat cetak terpisah dan isi dokumen tetap konsisten. | **Given** snapshot print tersedia untuk tanggal pelayanan dan kombinasi filter print yang dipilih, **When** Ahli Gizi memilih tanggal lama pada dashboard lalu menjalankan Print, **Then** sistem menghasilkan dokumen dari snapshot sebelumnya tanpa menghitung ulang order terkini. | FR-020; BR-028; BR-036 |
| **US-010** | Sebagai **Ahli Gizi**, saya ingin mengekspor rekap ke PDF sesuai filter, sehingga data dapat digunakan untuk kebutuhan operasional lanjutan. | **Given** filter valid, **When** Export ditekan, **Then** sistem menghasilkan PDF dalam ≤ 5 detik tanpa data di luar hak akses. | FR-016; BR-024; BR-034 |
| **US-011** | Sebagai **Ahli Gizi**, saya ingin snapshot waktu makan yang sudah dikonfirmasi tetap stabil ketika pasien berpindah unit, sehingga histori produksi tidak berubah dan waktu makan selanjutnya mengikuti lokasi terbaru. | **Given** Makan Pagi sudah dikonfirmasi dan pasien pindah unit sebelum Makan Siang, **When** rekap dimuat, **Then** Makan Pagi tetap pada unit lama dan Makan Siang yang dikonfirmasi setelah perpindahan masuk ke unit baru. | FR-021; BR-027; BR-039 |
| **US-012** | Sebagai **Ahli Gizi**, saya ingin hanya mengakses data sesuai role dan cakupan unit, sehingga kerahasiaan data pasien terjaga. | **Given** user bukan Ahli Gizi atau tidak berhak atas unit tertentu, **When** mengakses endpoint/dashboard/output, **Then** sistem menolak akses atau mengecualikan unit tersebut. | FR-005; FR-018; BR-024 |

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|---|---|---|
| **FR-001** | **Dataset order terkonfirmasi** — mengambil semua order/waktu makan Terkonfirmasi pada tanggal pelayanan tanpa cutoff dan mengecualikan order Batal. | US-001; BR-001–BR-003; BR-037 |
| **FR-002** | **Filter tanggal pelayanan** — menyediakan tanggal wajib, default hari ini, mengizinkan tanggal masa depan, dan menampilkan empty state jika tidak ada data. | US-002; BR-018; BR-029 |
| **FR-003** | **Refresh data** — mengambil versi order terbaru yang valid, menghitung ulang agregasi, dan memperbarui last updated. | US-003; BR-004; BR-025 |
| **FR-004** | **Ringkasan waktu makan** — menampilkan Makan Pagi, Snack Pagi, Makan Siang, Makan Sore, dan Snack Sore beserta VIP, I, II, III, Rawat Jalan, IGD, dan Total. | US-001; BR-006–BR-008; BR-026 |
| **FR-005** | **Filter dan pembatasan unit** — menyediakan unit dalam cakupan hak akses Ahli Gizi, termasuk opsi Semua Unit yang Diizinkan pada konteks yang mendukung. | US-012; BR-024; BR-033 |
| **FR-006** | **Drill down detail** — menyediakan Lihat Detail dan mempertahankan konteks tanggal serta waktu makan. | US-004; BR-019 |
| **FR-007** | **Rekap Makanan Pokok** — menampilkan jenis makanan pokok, waktu makan, jumlah per kelas/layanan, dan subtotal berdasarkan snapshot order. | US-004; BR-009; BR-027 |
| **FR-008** | **Filter Rekap Makanan Pokok** — menyediakan filter tanggal, makanan pokok, dan waktu makan. | US-004; BR-018; BR-019 |
| **FR-009** | **Rekap Data Diet** — menampilkan seluruh jenis diet relevan, jumlah per kelas/layanan, subtotal, dan nilai 0 untuk diet tanpa order. | US-005; BR-010; BR-030 |
| **FR-010** | **Filter Rekap Data Diet** — menyediakan filter tanggal dan tipe diet. | US-005; BR-018 |
| **FR-011** | **Rekap Catatan Diet** — menampilkan No RM, Nama Pasien, Penjamin, Unit, Waktu Makan, Jenis Diet, dan Catatan dari snapshot order yang memiliki catatan. | US-006; BR-011; BR-027 |
| **FR-012** | **Filter dan pagination Catatan Diet** — menyediakan tanggal, waktu makan, pencarian pasien, tampilan teks lengkap, dan pagination. | US-006; BR-018; BR-019 |
| **FR-013** | **Rekap Menu Tambahan VIP Pendamping** — menghitung hanya menu yang disetujui saat konfirmasi, maksimal satu pendamping/quantity satu, waktu Pagi/Siang/Sore, unit sebagai filter, dan menampilkan menu nonaktif pada histori. | US-007; BR-013–BR-017; BR-031–BR-032 |
| **FR-014** | **Pemisahan perhitungan pendamping** — menyajikan agregasi menu pendamping pada dataset/section terpisah yang tidak memengaruhi total makanan pasien. | US-007; BR-016 |
| **FR-015** | **Print dokumen operasional** — menyediakan unit Semua Unit yang Diizinkan/satu unit, single-select jenis dokumen, validasi data, metadata waktu dan petugas, serta tidak membuat nomor tiket. Layout mengikuti PRD print terpisah. | US-008; BR-018–BR-023; BR-033; BR-035; BR-038 |
| **FR-016** | **Export PDF** — menghasilkan PDF sesuai halaman dan filter aktif dengan pembatasan hak akses unit. | US-010; BR-024; BR-034 |
| **FR-017** | **Konsistensi sumber data** — menggunakan definisi agregasi dan filter yang sama untuk ringkasan, detail, print baru, dan export. | BR-005; BR-020 |
| **FR-018** | **Role-based access control** — pada rilis ini hanya role Ahli Gizi yang dapat melihat dashboard, detail, data pasien, print, cetak ulang, dan export; cakupan unit divalidasi di server. | US-012; BR-024 |
| **FR-019** | **Empty state dan validasi data kosong** — menampilkan nilai 0/empty state dan menolak print bila tidak ada data. | US-002; BR-021; BR-026 |
| **FR-020** | **Snapshot print dan cetak ulang melalui dashboard** — menyimpan tanggal pelayanan, filter, dataset, jenis dokumen, waktu, serta pembuat print secara permanen. Cetak ulang dijalankan dari dashboard dengan memilih tanggal lama dan filter print yang sesuai; sistem mengambil snapshot tersimpan tanpa menyediakan halaman riwayat cetak khusus. | US-009; BR-028; BR-036 |
| **FR-021** | **Snapshot per waktu makan dan perpindahan pasien** — mengambil atribut dari data order, mengunci snapshot saat konfirmasi per waktu makan, dan menggunakan unit/kelas terbaru untuk waktu makan berikutnya sebelum konfirmasi. | US-011; BR-004; BR-027; BR-039 |

## 11. Data Requirements (Spesifikasi Field)

> Field demografi dan penjamin **reuse definisi kanonik dari Modul Registrasi/Pelayanan Pasien dan Order Makanan Gizi**. Dashboard membaca snapshot order dan tidak mengubah data sumber.

### A. Layar Input — Filter Dashboard Utama

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `service_date` | Tanggal Pelayanan | date | Ya | `DD/MM/YYYY`; tanggal masa depan diperbolehkan | Default hari ini | Tanggal tanpa data menampilkan 0/empty state. |
| `refresh_action` | Refresh | action | Tidak | Aktif jika tanggal valid | Manual | Mengambil data terbaru dan memperbarui last updated. |
| `detail_action` | Lihat Detail | action | Tidak | Mempertahankan tanggal aktif | Sistem | Membuka halaman detail. |
| `print_action` | Print | action | Tidak | Hanya Ahli Gizi | Sistem | Membuka panel/modal Print. |

### B. Layar Tampil — Ringkasan Rekap Order Makanan

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Waktu Makan | Snapshot waktu makan | Label + ikon | Pagi → Snack Pagi → Siang → Sore → Snack Sore | Lima kategori tetap. |
| VIP | Agregasi snapshot order | Integer | Tanggal | Nilai kosong = 0. |
| Kelas I | Agregasi snapshot order | Integer | Tanggal | Nilai kosong = 0. |
| Kelas II | Agregasi snapshot order | Integer | Tanggal | Nilai kosong = 0. |
| Kelas III | Agregasi snapshot order | Integer | Tanggal | Nilai kosong = 0. |
| Rawat Jalan | Agregasi snapshot order | Integer | Tanggal | Nilai kosong = 0. |
| IGD | Agregasi snapshot order | Integer | Tanggal | Nilai kosong = 0. |
| Total | Kalkulasi | Integer tebal | Tanggal | Jumlah seluruh kelompok. |
| Last Updated | Waktu refresh berhasil | `DD/MM/YYYY HH:mm` + timezone RS | - | Bukan waktu perubahan order. |

### C. Layar Input — Filter Rekap Makanan Pokok

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `service_date` | Tanggal Pelayanan | date | Ya | `DD/MM/YYYY` | Diteruskan dari dashboard | Dapat diubah. |
| `staple_food_id` | Makanan Pokok | dropdown | Tidak | Referensi makanan pokok | Semua | Hasil historis menggunakan snapshot label. |
| `meal_time_id` | Waktu Makan | dropdown | Kondisional | Master waktu makan | Konteks drill down / semua | Wajib bila proses membutuhkan satu waktu makan. |
| `export_action` | Export PDF | action | Tidak | Filter valid; hanya Ahli Gizi | Sistem | Menghasilkan PDF halaman aktif. |

### D. Layar Tampil — Rekap Makanan Pokok

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Makanan Pokok | Snapshot makanan pokok | Text | Filter jenis | Label tidak berubah mengikuti master terkini. |
| Waktu Makan | Snapshot order | Text/rincian baris | Filter waktu | Dapat menampilkan parent dan child row. |
| VIP | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Kelas I | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Kelas II | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Kelas III | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Rawat Jalan | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| IGD | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Subtotal | Kalkulasi | Integer tebal | - | Jumlah seluruh kelas/layanan. |

### E. Layar Input — Filter Rekap Data Diet

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `service_date` | Tanggal Pelayanan | date | Ya | `DD/MM/YYYY` | Diteruskan dari dashboard | Dapat diubah. |
| `diet_type_id` | Tipe Diet | dropdown | Tidak | Master diet | Semua tipe diet | Kosong = semua. |
| `export_action` | Export PDF | action | Tidak | Filter valid; hanya Ahli Gizi | Sistem | Menghasilkan PDF halaman aktif. |

### F. Layar Tampil — Rekap Data Diet

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Tipe Diet | Master diet + snapshot historis | Text | Filter tipe diet | Tetap tampil walaupun seluruh nilai 0. |
| VIP | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Kelas I | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Kelas II | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Kelas III | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Rawat Jalan | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| IGD | Agregasi | Integer | Filter aktif | Nilai kosong = 0. |
| Subtotal | Kalkulasi | Integer tebal | - | Jumlah seluruh kelas/layanan. |

### G. Layar Input — Filter Rekap Catatan Diet

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `service_date` | Tanggal Pelayanan | date | Ya | `DD/MM/YYYY` | Diteruskan dari dashboard | Dapat diubah. |
| `meal_time_id` | Waktu Makan | dropdown | Ya untuk pencarian detail | Master waktu makan | Konteks sebelumnya / kosong | Validasi sesuai konteks. |
| `keyword` | Cari | search text | Tidak | No RM atau nama pasien `[ASUMSI berdasarkan UI V1]` | Kosong | Mekanisme trigger `[PERLU KONFIRMASI]`. |
| `export_action` | Export PDF | action | Tidak | Filter valid; hanya Ahli Gizi | Sistem | Menghasilkan PDF hasil terfilter. |

### H. Layar Tampil — Rekap Catatan Diet

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| No | Hasil pagination | Integer | Urutan hasil | Nomor urut. |
| No RM | Snapshot pasien | Text | Search | Reuse definisi kanonik. |
| Nama Pasien | Snapshot pasien | Text | Search | Reuse definisi kanonik. |
| Tipe Penjamin | Snapshot penjamin | Text | - | Tidak mengikuti perubahan penjamin terkini. |
| Unit | Snapshot unit per waktu makan | Text | Cakupan unit | Mengikuti unit yang dikunci saat konfirmasi waktu makan. |
| Waktu Makan | Snapshot order | Badge/text | Filter waktu | Contoh: Makan Pagi. |
| Jenis Diet | Snapshot diet | Text, dapat multi-value | - | Pemisah multi-diet konsisten. |
| Catatan | Snapshot catatan diet | Multiline text | - | Teks penuh harus dapat dibaca. |
| Pagination | Hasil query | Page control | - | Ukuran halaman dan sort `[PERLU KONFIRMASI]`. |

### I. Layar Input — Filter Rekap Menu Tambahan VIP Pendamping

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `service_date` | Tanggal Pelayanan | date | Ya | `DD/MM/YYYY` | Diteruskan dari dashboard | Dasar agregasi. |
| `unit_id` | Unit Perawatan | dropdown | Tidak | Cakupan akses Ahli Gizi | Semua Unit yang Diizinkan | Hanya sebagai filter. |
| `vip_menu_id` | Menu VIP | dropdown | Tidak | Menu aktif + snapshot menu historis pada tanggal terpilih | Semua | Menu nonaktif historis tetap dapat difilter/ditampilkan. |
| `serving_time` | Waktu Pemberian | dropdown | Tidak | Pagi / Siang / Sore | Semua | Tidak menyediakan Snack. |
| `export_action` | Export PDF | action | Tidak | Filter valid; hanya Ahli Gizi | Sistem | Menghasilkan PDF hasil terfilter. |

### J. Layar Tampil — Rekap Menu Tambahan VIP Pendamping

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Nama Menu VIP | Snapshot menu VIP | Text | Filter menu | Menu nonaktif historis tetap tampil. |
| Pagi | Agregasi permintaan | Integer | Tanggal/unit/menu | Maksimal 1 per pasien. |
| Siang | Agregasi permintaan | Integer | Tanggal/unit/menu | Maksimal 1 per pasien. |
| Sore | Agregasi permintaan | Integer | Tanggal/unit/menu | Maksimal 1 per pasien. |
| Total | Kalkulasi | Integer tebal | - | Pagi + Siang + Sore. |
| Total Keseluruhan | Kalkulasi | Integer tebal | - | Total semua menu pada filter aktif. |

> Unit tidak ditampilkan sebagai breakdown kolom/baris; unit hanya memengaruhi dataset melalui filter.

### K. Layar Input — Panel/Modal Print Rekap Order

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| `unit_scope` | Unit | dropdown | Tidak | Semua Unit yang Diizinkan atau satu unit | Semua Unit yang Diizinkan | Tidak boleh memuat unit di luar akses. |
| `document_type` | Jenis Dokumen | radio/single-select | Ya | E-Ticket / Serah Terima / Sampel Makanan | Belum dipilih | Tepat satu jenis dokumen per print job. |
| `meal_time_ids[]` | Waktu Makan | multi-select/checkbox | Kondisional | Mengikuti aturan jenis dokumen | Tidak terpilih | Aturan final pada PRD print terpisah. |
| `print_action` | Print | action | - | Filter valid dan data tersedia | - | Membuat snapshot permanen dan dokumen. |

### L. Data yang Dibuat Otomatis saat Print

| Field | Label | Tipe | Format/Sumber | Catatan |
|---|---|---|---|---|
| `print_snapshot_id` | ID Snapshot Print | UUID/reference | Dibuat otomatis | Identifier internal; bukan nomor tiket dokumen. |
| `initial_printed_at` | Waktu Print Awal | datetime | Waktu server rumah sakit | Ditampilkan pada dokumen sesuai PRD print. |
| `initial_printed_by` | Petugas Print Awal | reference/string | User login | Ahli Gizi. |
| `document_type` | Jenis Dokumen | enum | E-Ticket / Serah Terima / Sampel | Single value. |
| `filter_snapshot` | Snapshot Filter | JSON/structured | Seluruh filter aktif | Disimpan permanen. |
| `data_snapshot` | Snapshot Dataset | JSON/structured/reference | Dataset final saat print berhasil | Disimpan permanen dan immutable. |
| `generation_status` | Status Generate | enum | Success / Failed | Snapshot final hanya dianggap valid saat Success. |

### M. Data Cetak Ulang melalui Filter Dashboard

| Field | Label | Tipe | Format/Sumber | Catatan |
|---|---|---|---|---|
| `service_date` | Tanggal Pelayanan | date | Filter tanggal aktif dashboard | Menentukan tanggal dokumen lama yang akan dicetak ulang. |
| `unit_scope` | Unit | reference/enum | Filter panel Print | Semua Unit yang Diizinkan atau satu unit. |
| `document_type` | Jenis Dokumen | enum | Filter panel Print | Tepat satu: E-Ticket / Serah Terima / Sampel Makanan. |
| `meal_time_ids[]` | Waktu Makan | array/reference | Filter panel Print | Mengikuti aturan dokumen pada PRD print terpisah. |
| `matched_print_snapshot_id` | Snapshot Print yang Ditemukan | UUID/reference | Hasil pencarian internal berdasarkan tanggal dan filter print | Tidak dipilih dari halaman riwayat oleh user. |
| `output_printed_at` | Waktu pada Output Print Ulang | datetime | `[PERLU KONFIRMASI]` metadata print awal atau waktu proses print ulang | Aturan final mengikuti PRD print terpisah. |
| `output_printed_by` | Petugas pada Output Print Ulang | reference/string | `[PERLU KONFIRMASI]` petugas print awal atau user yang menjalankan print ulang | Aturan final mengikuti PRD print terpisah. |
| `reprint_status` | Status Print Ulang | enum | Success / Failed | Untuk status proses operasional. |

### N. Data Export PDF

| Field | Label | Tipe | Format/Sumber | Catatan |
|---|---|---|---|---|
| `export_format` | Format Export | enum | `PDF` | Satu-satunya format pada scope ini. |
| `exported_at` | Waktu Export | datetime | Waktu server rumah sakit | Untuk audit. |
| `exported_by` | Petugas Export | reference/string | User login | Ahli Gizi. |
| `filter_snapshot` | Snapshot Filter Export | JSON/structured | Filter halaman aktif | Tidak boleh memuat unit di luar akses. |

## 12. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|---|---|---|---|
| **NFR-001** | Performa | Initial load dashboard selesai dalam ≤ 2 detik pada kondisi operasional normal. | Performance Expectation |
| **NFR-002** | Performa | Perubahan filter selesai menampilkan hasil dalam ≤ 2 detik. | Performance Expectation |
| **NFR-003** | Performa | Drill down detail selesai dalam ≤ 1 detik. | Performance Expectation |
| **NFR-004** | Performa | Generate dokumen print selesai dalam ≤ 5 detik. | Performance Expectation |
| **NFR-005** | Performa | Generate export PDF selesai dalam ≤ 5 detik. | Performance Expectation |
| **NFR-006** | Responsivitas | Dashboard tetap usable pada desktop operasional dan tabel memiliki scroll/pagination tanpa menutupi aksi utama. | Baseline UI V1 |
| **NFR-007** | Real-Time | Perubahan order tidak wajib push real-time, tetapi wajib terlihat setelah refresh berhasil. | FR-003 |
| **NFR-008** | Konsistensi | Ringkasan, detail, print baru, dan export dengan filter sama harus menghasilkan agregasi yang konsisten. | BR-005; FR-017 |
| **NFR-009** | Keamanan/RBAC | Role Ahli Gizi dan cakupan unit wajib divalidasi pada server untuk seluruh query dan output. | BR-024; FR-018 |
| **NFR-010** | Reliabilitas | Kegagalan query, print, reprint, atau export harus menampilkan pesan gagal dan tidak menampilkan data parsial sebagai hasil final. | FR-019; FR-020 |
| **NFR-011** | Auditabilitas | Print awal dan export merekam user, timestamp, filter/jenis output, snapshot sumber, serta status proses. Pencatatan metadata khusus print ulang mengikuti keputusan pada Pertanyaan Terbuka. | FR-020 |
| **NFR-012** | Immutability | Snapshot print yang telah berhasil disimpan tidak dapat berubah akibat koreksi order, perubahan master, atau perpindahan pasien. | BR-028 |
| **NFR-013** | Durabilitas | Snapshot print disimpan permanen sesuai kebijakan penyimpanan data rumah sakit dan dapat ditemukan kembali melalui tanggal pelayanan serta filter print yang digunakan pada dashboard. | Konfirmasi stakeholder |
| **NFR-014** | Usability | Filter aktif harus terlihat jelas dan dipertahankan ketika berpindah dari ringkasan ke detail. | FR-006 |
| **NFR-015** | Aksesibilitas | Informasi tidak hanya bergantung pada warna/ikon; label teks, fokus keyboard, dan state kontrol harus terbaca. | Standar UI Neurovi v2 |
| **NFR-016** | Skalabilitas | Agregasi dan pagination mendukung volume order harian tanpa memuat seluruh detail pasien ke client. | FR-004; FR-012 |
| **NFR-017** | Konfigurabilitas | Label master berasal dari master terkait; histori menggunakan label snapshot, bukan label master terbaru. | BR-027 |
| **NFR-018** | Zona Waktu | Tanggal pelayanan, last updated, waktu print, reprint, dan export menggunakan timezone konfigurasi rumah sakit. | Data Requirements |
| **NFR-019** | Privasi | Data pasien pada Rekap Catatan Diet, print, reprint, dan export tidak boleh terekspos melalui cache publik atau log aplikasi. | FR-011; FR-018 |

## 13. Integrasi Eksternal & Dependency

Fitur tidak memerlukan integrasi eksternal pihak ketiga. Seluruh integrasi merupakan dependency internal Neurovi SIMRS.

| Integrasi / Dependency | Fungsi di Modul Ini | Status | Trace |
|---|---|---|---|
| **Order Makanan Gizi** | Menyediakan order pasien, snapshot makanan pokok, diet, catatan, unit/kelas, waktu makan, dan menu VIP. | Internal — Hard dependency | FR-001; FR-007; FR-009; FR-011; FR-013; FR-021 |
| **Konfirmasi Order Makanan Gizi** | Menyediakan status Terkonfirmasi/Batal, mengunci snapshot per waktu makan, dan menjadi bukti persetujuan menu pendamping. | Internal — Hard dependency | BR-001; BR-002; BR-013; BR-027 |
| **Master Data Gizi** | Menyediakan referensi aktif untuk makanan pokok, diet, waktu makan, dan menu VIP. | Internal — Hard dependency | FR-007–FR-013 |
| **Registrasi/Pelayanan Pasien** | Menyediakan unit/kelas terbaru sebelum konfirmasi waktu makan berikutnya. | Internal — Hard dependency | FR-021 |
| **Authentication & Authorization** | Menyediakan role Ahli Gizi, user login, permission, dan cakupan unit. | Internal — Hard dependency | FR-005; FR-018 |
| **Print/Document Service** | Menghasilkan dokumen dari snapshot permanen serta mendukung pencarian dan print ulang berdasarkan tanggal pelayanan dan filter print aktif. | Internal — Hard dependency untuk print | FR-015; FR-020 |
| **PRD Print Dokumen Operasional Gizi** | Menetapkan field, layout, aturan waktu makan, dan format visual E-Ticket, Serah Terima, dan Sampel Makanan. | Dokumentasi — Hard dependency untuk finalisasi print | BR-038 |
| **Export Service** | Menghasilkan file PDF sesuai halaman dan filter aktif. | Internal — Hard dependency untuk export | FR-016 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|---|---|---|
| Kontrak status dan snapshot order per waktu makan | Hard | Rekap tidak dapat menentukan data yang layak dihitung atau mengunci histori dengan benar. |
| Mekanisme pembaruan unit/kelas untuk waktu makan berikutnya | Hard | Rekap dapat mendistribusikan makanan ke unit lama setelah pasien pindah. |
| Persistensi dan pencarian snapshot print permanen | Hard untuk print/print ulang | Dokumen lama tidak dapat ditemukan dan direproduksi secara identik melalui filter dashboard. |
| PRD/layout dokumen operasional | Hard untuk finalisasi print | Trigger dapat dibangun, tetapi dokumen final belum dapat dirilis. |
| Definisi struktur export per tab | Soft | Format PDF tersedia, tetapi bentuk file per tab/gabungan belum dapat difinalisasi. |

## 14. Keputusan Desain (Resolved)

| ID | Topik | Keputusan Final |
|---|---|---|
| **D-001** | Entry point | **Gizi → Rekap Order Makanan**. |
| **D-002** | Role | Sementara hanya Ahli Gizi untuk melihat dashboard/detail/data pasien, print, reprint, dan export. |
| **D-003** | Tanggal | Default hari ini; tanggal masa depan diperbolehkan dan dapat kosong. |
| **D-004** | Snapshot | Atribut berasal dari snapshot order dan dikunci per waktu makan saat konfirmasi. |
| **D-005** | Perpindahan pasien | Waktu makan terkonfirmasi tetap pada snapshot lama; waktu makan berikutnya menggunakan unit/kelas terbaru. |
| **D-006** | Diet bernilai 0 | Tetap ditampilkan. |
| **D-007** | Menu VIP nonaktif | Tetap muncul pada histori jika pernah diorder. |
| **D-008** | Persetujuan menu pendamping | Terjadi saat konfirmasi order gizi. |
| **D-009** | Jumlah pendamping | Satu pasien hanya satu pendamping dan quantity satu pada waktu yang sama. |
| **D-010** | Waktu menu pendamping | Pagi, Siang, dan Sore saja. |
| **D-011** | Dimensi unit rekap VIP | Unit hanya sebagai filter. |
| **D-012** | Unit print | Boleh default Semua Unit yang Diizinkan. |
| **D-013** | Pilihan dokumen print | Tepat satu jenis dokumen per print job. |
| **D-014** | Layout dokumen | Dibahas dalam PRD print terpisah. |
| **D-015** | Nomor tiket | Tidak digunakan. |
| **D-016** | Snapshot print dan entry point cetak ulang | Snapshot disimpan permanen. Cetak ulang dilakukan dari Dashboard Rekap Order Makanan dengan memilih tanggal pelayanan sebelumnya dan menggunakan panel Print yang sama; tidak ada halaman riwayat cetak khusus. |
| **D-017** | Export | PDF. |
| **D-018** | Indikator print lama | Tidak diperlukan setelah koreksi order. |
| **D-019** | Cutoff produksi | Tidak ada cutoff. |

## 15. Risk & Mitigation

| ID | Risiko | Mitigasi |
|---|---|---|
| **R1** | Perbedaan query antarhalaman menghasilkan total tidak konsisten. | Gunakan satu service agregasi dan reconciliation test untuk ringkasan, detail, print baru, dan export. |
| **R2** | Snapshot waktu makan salah unit setelah pasien pindah. | Kunci snapshot per waktu makan saat konfirmasi dan refresh unit/kelas order waktu makan berikutnya sebelum konfirmasi. |
| **R3** | Perubahan master mengubah label historis. | Simpan ID dan label snapshot pada order/konfirmasi. |
| **R4** | Menu pendamping tercampur dengan porsi pasien. | Pisahkan dataset dan automated test bahwa quantity pendamping tidak masuk total pasien. |
| **R5** | User mengakses unit di luar kewenangannya melalui request langsung. | Validasi role dan cakupan unit pada backend. |
| **R6** | Snapshot print permanen bertambah besar. | Gunakan penyimpanan terstruktur, kompresi bila diperlukan, indeks metadata, dan kebijakan backup sesuai standar rumah sakit. |
| **R7** | Print ulang tanggal sebelumnya mengambil agregasi terkini, bukan snapshot sebelumnya. | Service print wajib mencari snapshot berdasarkan tanggal pelayanan dan filter print aktif, lalu menggunakan dataset snapshot yang ditemukan tanpa menjalankan agregasi ulang. |
| **R8** | Catatan diet panjang terpotong. | Sediakan wrap/expand/tooltip dan akses teks penuh. |
| **R9** | Agregasi lambat pada volume tinggi. | Indeks tanggal pelayanan, status, unit, waktu makan; agregasi server-side; optimasi query. |

## 16. Asumsi

- `[ASUMSI]` Dashboard menggunakan refresh manual; tidak ada push update otomatis karena bisnis proses menyebut perubahan terlihat setelah refresh.
- `[ASUMSI]` Pencarian pada Rekap Catatan Diet mencakup No RM dan nama pasien berdasarkan baseline UI V1.
- `[ASUMSI]` Rekap Menu Tambahan VIP disajikan sebagai tab/section terpisah pada halaman detail.
- `[ASUMSI]` Rawat Jalan dan IGD diperlakukan sebagai kelompok layanan setara kolom kelas sesuai baseline V1.
- `[ASUMSI]` Single-select jenis dokumen dapat diwujudkan sebagai radio button, segmented control, atau dropdown sesuai design system Neurovi v2.

## 17. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|---|---|---|---|
| 1.0 Draft | 21 Juli 2026 | Team Product — Tamtech International | Dokumen awal berdasarkan bisnis proses Rekap Order Gizi dan baseline UI Neurovi v1. |
| 1.1 Draft | 21 Juli 2026 | Team Product — Tamtech International | Menetapkan entry point, role Ahli Gizi, default tanggal, snapshot per waktu makan, perilaku perpindahan unit/kelas, diet bernilai 0, histori menu VIP nonaktif, aturan menu pendamping, single-document print, tanpa nomor tiket, snapshot print permanen, export PDF, serta tanpa cutoff produksi. |
| 1.2 Draft | 22 Juli 2026 | Team Product — Tamtech International | Mengubah mekanisme cetak ulang: dokumen tanggal sebelumnya dicetak ulang melalui filter tanggal dashboard dan panel Print yang sama, tanpa halaman riwayat cetak khusus; pencarian snapshot mengikuti tanggal pelayanan dan filter print aktif. |
