# PRD — Permintaan Jadwal Operasi

**Related Document:** PRD Dashboard IBS — *hard dependency*; PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi — *hard dependency* (PRD terpisah, lihat Bagian 5); PRD Integrasi Bridging BPJS / Mobile JKN (MJKN); PRD Electronic Medical Record (EMR) Operasi; PRD Billing Operasi; Referensi Neurovi V1 — Modul Permintaan Jadwal Operasi
**Dokumen ID:** [PERLU KONFIRMASI — nomor dokumen belum diberikan]  ·  **Versi:** 2.2 (Draft — Revisi Validasi Status Pelayanan)
**Tanggal Disusun:** [PERLU KONFIRMASI] · **Tanggal Revisi:** 21 Juli 2026 · **Penyusun:** Team Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI]

## 1. Overview / Brief Summary

Modul **Permintaan Jadwal Operasi** memungkinkan dokter maupun tenaga kesehatan di unit pengirim — Rawat Jalan, IGD, Rawat Inap, dan VK — untuk mengajukan permintaan jadwal tindakan operasi bagi pasien secara terintegrasi dengan Instalasi Bedah Sentral (IBS). Pada Neurovi v1, permintaan jadwal operasi sudah tersedia, namun terdapat celah pada pengelolaan episode pelayanan: bila permintaan dibuat dari registrasi yang berbeda dengan episode aktif pasien saat operasi berlangsung, seluruh pencatatan tindakan operasi tetap mengacu pada registrasi lama.

Untuk Fase 1 (MVP), lingkup modul ini difokuskan pada lima kapabilitas inti: **(1)** pembuatan permintaan jadwal operasi dari keempat unit pengirim melalui masing-masing dashboard pelayanan (ikon *three dots* → menu aksi "Permintaan Jadwal Operasi"), **(2)** riwayat permintaan jadwal operasi berikut status terkininya, **(3)** akses **"Lihat Detail"** dari setiap record riwayat untuk menampilkan kembali data form permintaan yang telah dibuat dalam kondisi *read-only*, **(4)** audit trail atas seluruh aktivitas yang tercatat pada modul ini, dan **(5)** validasi status pelayanan agar fitur hanya dapat digunakan selama pelayanan pasien masih aktif. Apabila pasien sudah berstatus **Dipulangkan** atau **Diselesaikan**, menu/aksi **"Permintaan Jadwal Operasi"** dinonaktifkan dan pengguna tidak dapat membuka fitur maupun membuat permintaan baru. Fokus fungsional utama v2 adalah memastikan mekanisme penentuan registrasi/episode pelayanan aktif berjalan benar saat proses konfirmasi terjadi di sisi IBS, sehingga tindakan, BHP, obat, EMR operasi, dan billing operasi seluruhnya tercatat pada episode pelayanan yang tepat — meskipun proses **konfirmasi**, **penundaan**, dan **pembatalan** jadwal operasi itu sendiri didokumentasikan pada PRD terpisah, yaitu **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** (lihat Bagian 3 & 5).

> Referensi: tangkapan layar SIMRS Poli IGD — ikon *three dots* (⋮) pada dashboard pelayanan → menu aksi "Permintaan Jadwal Operasi"; modal "Permintaan Jadwal Operasi" (tab History & tab Buat Permintaan); aksi **"Lihat Detail"** pada tabel History; dan layar **"Detail Permintaan Jadwal Operasi"**.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — Draft user:
- Permintaan jadwal operasi dapat dibuat dari Rawat Jalan, IGD, Rawat Inap, dan VK melalui masing-masing dashboard pelayanan — dengan mengklik ikon *three dots* (⋮) lalu memilih menu aksi "Permintaan Jadwal Operasi" (lihat tangkapan layar Poli IGD).
- Form permintaan mencakup field: Cito (Ya/Tidak), Nama Dokter Operator, Nama Dokter Anestesi, Jenis Anestesi, Diagnosa, Tanggal Rencana Operasi, Jam Rencana Operasi, dan Rencana Tindakan.
- Tabel History menampilkan ringkasan permintaan dan menyediakan aksi **"Lihat Detail"** untuk membuka kembali data permintaan yang dipilih. Bisnis proses dan spesifikasi layar detail tersebut belum dijabarkan pada versi PRD sebelumnya.
- Field yang bersifat wajib diisi pada v1: Nama Dokter Operator, Jenis Anestesi, Diagnosa, Tanggal Rencana Operasi, Waktu Rencana Operasi, dan Rencana Tindakan.
- Apabila permintaan jadwal operasi dibuat dari registrasi yang berbeda dengan episode pelayanan pasien yang aktif, maka ketika jadwal dikonfirmasi oleh petugas IBS, seluruh tindakan operasi tetap tercatat pada registrasi saat order dibuat — bukan pada registrasi yang aktif saat konfirmasi.

**Masalah/pain point:**
- Aspek bisnis proses: tindakan operasi, penggunaan BHP, obat, maupun billing operasi dapat masuk ke registrasi lama yang seharusnya sudah selesai atau sudah dilakukan pelunasan, akibat mismatch antara registrasi saat order dibuat dan registrasi aktif saat operasi berlangsung.
- Aspek UX: riwayat permintaan jadwal operasi pada v1 belum menampilkan informasi audit trail secara lengkap (dibuat oleh, dikonfirmasi oleh, ditunda oleh, dibatalkan oleh, beserta waktunya), sehingga pengguna perlu membuka log sistem untuk menelusuri histori perubahan status. Selain itu, PRD sebelumnya belum mendefinisikan alur **"Lihat Detail"** dan aturan bahwa data form yang ditampilkan kembali harus bersifat *read-only*.
- Aspek logic system: sistem v1 tidak melakukan remapping registrasi ketika terjadi perubahan episode pelayanan (mis. pasien berpindah dari Rawat Jalan menjadi Rawat Inap) sebelum jadwal dikonfirmasi. Selain itu, perlu terdapat penjagaan agar permintaan jadwal operasi tidak dapat dibuat dari pelayanan pasien yang sudah berstatus **Dipulangkan** atau **Diselesaikan**.

**Dampak utama yang disasar v2:**
- Kesesuaian pencatatan tindakan, BHP, obat, EMR operasi, dan billing operasi dengan registrasi/episode pelayanan yang benar-benar aktif saat operasi dikonfirmasi.
- Ketertelusuran (auditability) penuh atas seluruh aktivitas permintaan jadwal operasi.
- Kemudahan pengguna dalam memverifikasi data permintaan yang pernah dibuat melalui tampilan detail tanpa risiko perubahan data.
- Pencegahan pembuatan permintaan baru dari pelayanan pasien yang sudah berstatus **Dipulangkan** atau **Diselesaikan**.
- Kepatuhan publikasi jadwal operasi ke Mobile JKN (MJKN) sesuai ketentuan web service BPJS.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = Permintaan Jadwal Operasi, Riwayat Jadwal Operasi, Detail Permintaan Jadwal Operasi (*read-only*), dan Audit Trail Jadwal Operasi, sebagaimana didefinisikan pada Bagian 3.

> Catatan volume/perilaku: sumber menyebutkan target performa maksimal 30 pasien operasi/hari.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Permintaan Jadwal Operasi** — pembuatan permintaan jadwal operasi dari Rawat Jalan, IGD, Rawat Inap, dan VK, mencakup penentuan dokter operator, dokter anestesi, jenis anestesi, diagnosa, tindakan operasi, status Cito/Non-Cito, serta tanggal dan jam rencana operasi.
2. **Riwayat Jadwal Operasi** — menampilkan seluruh riwayat permintaan jadwal operasi pasien beserta status terkininya (Menunggu Konfirmasi, Terkonfirmasi, Sedang Berlangsung, Selesai, Ditunda, Dibatalkan), termasuk aksi **"Lihat Detail"** pada setiap record.
3. **Detail Permintaan Jadwal Operasi** — menampilkan kembali data form permintaan yang dipilih dari History dalam kondisi *read-only*, tanpa aksi mengubah atau menyimpan data.
4. **Audit Trail Jadwal Operasi** — pencatatan seluruh aktivitas pengguna terkait permintaan jadwal operasi (dibuat oleh, tanggal & waktu, serta perubahan status yang relevan) untuk kebutuhan audit.
5. **Validasi Status Pelayanan Pasien** — mengaktifkan fitur Permintaan Jadwal Operasi hanya ketika pelayanan pasien masih aktif serta menonaktifkan menu/aksi fitur apabila pasien sudah berstatus **Dipulangkan** atau **Diselesaikan**.

### Out Scope
- **Penjadwalan SDM IBS** — diatur pada PRD/modul terpisah.
- **Penjadwalan Kamar Operasi** — diatur pada PRD/modul terpisah.
- **Master Tindakan Operasi** — data master, diatur pada PRD/modul terpisah.
- **Master Ruang Operasi** — data master, diatur pada PRD/modul terpisah.
- **Billing Rawat Inap** — di luar lingkup modul ini.
- **Bridging SEP BPJS** — di luar lingkup modul ini (berbeda dengan integrasi MJKN untuk publikasi jadwal, lihat Bagian 14).
- **Konfirmasi Jadwal Operasi** — proses konfirmasi oleh petugas IBS diatur pada **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** (*hard dependency*, lihat Bagian 5 & 14). Status hasil konfirmasi tetap ditampilkan pada Riwayat Jadwal Operasi modul ini.
- **Penundaan Jadwal Operasi** — proses penundaan jadwal diatur pada **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** (*hard dependency*). Status hasil penundaan tetap ditampilkan pada Riwayat Jadwal Operasi modul ini.
- **Pembatalan Jadwal Operasi** — proses pembatalan (baik oleh unit pengirim maupun petugas IBS) diatur pada **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** (*hard dependency*). Status hasil pembatalan tetap ditampilkan pada Riwayat Jadwal Operasi modul ini.
- **Integrasi Billing Operasi** — implementasi integrasi billing operasi diatur pada PRD/modul terpisah.

## 4. Goals and Metrics

### Tujuan
Menyediakan fitur Jadwal Operasi Pasien yang memungkinkan dokter maupun tenaga kesehatan melakukan permintaan jadwal operasi secara terintegrasi selama pelayanan pasien masih aktif, meninjau kembali detail permintaan yang pernah dibuat dalam kondisi *read-only*, memfasilitasi koordinasi antara unit pengirim dan Instalasi Bedah Sentral (IBS), serta memastikan seluruh pelayanan operasi tercatat pada episode pelayanan yang benar. Sistem mencegah akses dan pembuatan permintaan baru apabila pasien sudah berstatus **Dipulangkan** atau **Diselesaikan**. Fitur ini juga mendukung integrasi dengan Mobile JKN (MJKN) sesuai ketentuan BPJS sehingga pasien dapat memperoleh informasi jadwal operasi secara akurat.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Kapasitas pengelolaan pasien operasi per hari | Maksimal 30 pasien operasi/hari tanpa penurunan performa | NFR-001 |
| Akses dashboard pelayanan operasi | < 1 detik | NFR-002 |
| Konfirmasi jadwal operasi | < 1 detik | NFR-003 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul / Code | Peran terhadap Modul |
|----------------|-----------------------|
| Dashboard IBS | Menampilkan permintaan jadwal operasi yang masuk kepada petugas IBS (*hard dependency*, Out of Scope PRD ini). |
| PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi | PRD terpisah yang mengatur proses konfirmasi, penundaan, dan pembatalan jadwal operasi oleh petugas IBS/unit pengirim, termasuk penentuan registrasi aktif saat konfirmasi (*hard dependency*, Out of Scope PRD ini — lihat Bagian 3). |
| Electronic Medical Record (EMR) | Konsumen data hasil operasi (tindakan, dokter operator/anestesi, diagnosa) untuk pencatatan rekam medis. |
| Billing Operasi | Konsumen data jadwal operasi terkonfirmasi sebagai dasar billing tindakan operasi (integrasi implementasi Out of Scope). |
| Bridging BPJS / Mobile JKN (MJKN) | Konsumen data jadwal operasi untuk publikasi jadwal kepada pasien sesuai ketentuan web service BPJS. |
| Rawat Jalan / IGD / Rawat Inap / VK | Unit pengirim — sumber pembuatan permintaan jadwal operasi, melalui ikon *three dots* (⋮) pada masing-masing dashboard pelayanan. |

Dependency lintas modul: **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** (Hard — konfirmasi/penundaan/pembatalan & penentuan registrasi aktif), **Dashboard IBS** (Hard — tampilan permintaan masuk), **Master Tindakan Operasi**, **Master Ruang Operasi**, **Master Dokter/SDM** (untuk pilihan Dokter Operator & Dokter Anestesi), **Bridging BPJS/MJKN**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter (Rajal/IGD/Ranap/VK) | Primary | Mengajukan permintaan jadwal operasi untuk pasien yang ditanganinya. |
| Perawat (Rajal/IGD/Ranap/VK) | Primary | Mengajukan permintaan jadwal operasi atas instruksi dokter, sesuai hak akses. |
| Petugas IBS | Secondary | Menerima permintaan jadwal operasi melalui Dashboard IBS dan menindaklanjutinya (konfirmasi/penundaan/pembatalan) sesuai **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** — di luar lingkup PRD ini, namun statusnya dikonsumsi oleh modul ini. |
| Pasien (peserta BPJS) | Tersier | Menerima informasi jadwal operasi melalui aplikasi Mobile JKN (MJKN). |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Dokter/perawat membuka dashboard pelayanan pasien (Rajal/IGD/Ranap/VK), mengklik ikon *three dots* (⋮), lalu memilih menu aksi "Permintaan Jadwal Operasi".
2. Pengguna mengisi form Buat Permintaan Jadwal Operasi (Cito, Dokter Operator, Dokter Anestesi, Jenis Anestesi, Diagnosa, Tanggal & Jam Rencana Operasi, Rencana Tindakan) lalu menyimpan.
3. Permintaan tercatat dengan status awal Menunggu Konfirmasi, mengacu pada registrasi yang aktif saat permintaan dibuat.
4. Pada History tersedia aksi **"Lihat Detail"**, namun versi PRD sebelumnya belum mendefinisikan bisnis proses, data yang ditampilkan, dan batasan interaksi pada layar detail.
5. Bila terjadi perubahan episode pelayanan pasien sebelum jadwal dikonfirmasi (mis. pasien berpindah dari Rawat Jalan ke Rawat Inap), sistem v1 tidak melakukan remapping — seluruh tindakan operasi tetap tercatat pada registrasi lama saat konfirmasi terjadi.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Dokter/perawat membuka dashboard pelayanan pasien (Rajal/IGD/Ranap/VK).
2. Sistem memeriksa status pelayanan pasien pada episode yang sedang dibuka.
3. Apabila pelayanan pasien masih aktif, menu/aksi **"Permintaan Jadwal Operasi"** tersedia dan dapat dipilih melalui ikon *three dots* (⋮).
4. Apabila pasien sudah berstatus **Dipulangkan** atau **Diselesaikan**, menu/aksi **"Permintaan Jadwal Operasi"** ditampilkan dalam kondisi *disabled*, tidak dapat dipilih, dan fitur tidak dapat dibuka dari episode tersebut.
5. Pengguna mengisi form Buat Permintaan Jadwal Operasi dengan field wajib: Nama Dokter Operator, Jenis Anestesi, Diagnosa, Tanggal Rencana Operasi, Jam Rencana Operasi, dan Rencana Tindakan; field Cito dan Nama Dokter Anestesi bersifat opsional (tidak wajib).
6. Permintaan tersimpan dengan status awal Menunggu Konfirmasi dan tercatat pada Audit Trail (dibuat oleh, tanggal & waktu).
7. Tab **"History Permintaan Jadwal Operasi"** menampilkan ringkasan seluruh permintaan pasien. Setiap record menyediakan aksi **"Lihat Detail"**.
8. Ketika pengguna memilih **"Lihat Detail"**, sistem menampilkan layar **"Detail Permintaan Jadwal Operasi"** yang memuat identitas pasien dan seluruh nilai form permintaan pada record yang dipilih.
9. Seluruh data pada layar detail bersifat *read-only*. Layar tidak menyediakan tombol Ubah, Simpan, Konfirmasi, Tunda, atau Batal. Tombol **"Kembali"** mengarahkan pengguna kembali ke History Permintaan Jadwal Operasi pasien yang sama.
10. Sistem mempertahankan histori order awal, namun saat jadwal dikonfirmasi oleh petugas IBS (proses konfirmasi diatur pada PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi, Out of Scope PRD ini), sistem menentukan registrasi/episode pelayanan yang aktif pada saat itu — bukan registrasi saat order dibuat — sebagai acuan pencatatan tindakan, BHP, obat, EMR operasi, dan billing operasi.
11. Apabila terjadi perubahan episode pelayanan sebelum konfirmasi, sistem melakukan remapping otomatis ke registrasi yang sedang aktif pada saat konfirmasi, tanpa mengubah histori permintaan jadwal operasi yang telah tercatat.
12. Status permintaan (Menunggu Konfirmasi/Terkonfirmasi/Sedang Berlangsung/Selesai/Ditunda/Dibatalkan) beserta detail audit trail-nya ditampilkan pada Riwayat Jadwal Operasi modul ini secara real-time mengikuti perubahan yang terjadi di Dashboard IBS.
13. Data jadwal operasi yang memenuhi syarat publikasi dikirim ke layanan Mobile JKN (MJKN) mengikuti ketentuan web service BPJS (lihat Bagian 14).

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Penentuan registrasi/episode pelayanan | Mengacu pada registrasi saat order dibuat, meskipun episode telah berubah | Mengacu pada registrasi yang aktif saat jadwal dikonfirmasi, dengan remapping otomatis |
| Riwayat & audit trail | Belum menampilkan detail audit trail lengkap; perlu buka log sistem | Riwayat menampilkan status terkini & detail audit trail lengkap (dibuat/dikonfirmasi/ditunda/dibatalkan oleh, beserta waktu) |
| Akses detail permintaan | Aksi tersedia pada referensi UI, tetapi bisnis proses dan batasan interaksinya belum tercantum pada PRD | Setiap record History memiliki aksi "Lihat Detail" yang membuka data form permintaan terpilih dalam kondisi *read-only* |
| Ketersediaan fitur berdasarkan status pelayanan | Belum didefinisikan secara eksplisit pada PRD | Menu/aksi "Permintaan Jadwal Operasi" hanya aktif selama pelayanan pasien masih aktif; status **Dipulangkan** atau **Diselesaikan** menyebabkan fitur *disabled* |
| Publikasi ke MJKN | `[ASUMSI: mengikuti ketentuan web service BPJS yang sama, belum ada indikasi perbedaan spesifik di v1 pada sumber]` | Mengikuti ketentuan web service BPJS: jadwal H+1 atau lebih & status belum terlaksana (terlaksana = 0), update otomatis saat status berubah |

## 7. Main Flow / Mindmap

### Skenario 1 — Membuat permintaan jadwal operasi (alur normal)
1. Dokter/perawat memilih pasien dengan status pelayanan yang masih aktif pada dashboard pelayanan (Rajal/IGD/Ranap/VK).
2. Sistem menampilkan menu aksi **"Permintaan Jadwal Operasi"** dalam kondisi aktif. Pengguna mengklik ikon *three dots* (⋮) lalu memilih menu tersebut. 
3. Sistem menampilkan modal dengan tab "History Permintaan Jadwal Operasi" dan "Buat Permintaan Jadwal Operasi". 
4. Pengguna membuka tab "Buat Permintaan Jadwal Operasi" dan mengisi seluruh field wajib. 
5. Pengguna menekan tombol "SIMPAN". 
6. Sistem memvalidasi field wajib, menyimpan permintaan dengan status Menunggu Konfirmasi, dan mencatatnya pada Audit Trail.

### Skenario 2 — Melihat riwayat permintaan jadwal operasi pasien
1. Pengguna mengklik ikon *three dots* (⋮) lalu memilih menu aksi "Permintaan Jadwal Operasi" pada dashboard pelayanan pasien.
2. Tab "History Permintaan Jadwal Operasi" ditampilkan sebagai tab default, menampilkan kolom Tanggal Operasi, Jam Operasi, Dokter Operator, Diagnosa, Tindakan Operasi, Ruang Operasi, Status, dan aksi **"Lihat Detail"**.
3. Bila belum ada permintaan, sistem menampilkan pesan kosong dengan label **"Belum Ada Data"**.

### Skenario 3 — Melihat detail permintaan dari History
1. Pengguna membuka tab **"History Permintaan Jadwal Operasi"** dan memilih aksi **"Lihat Detail"** pada salah satu record.
2. Sistem membuka layar **"Detail Permintaan Jadwal Operasi"** untuk record yang dipilih.
3. Sistem menampilkan identitas pasien serta nilai Cito, Nama Dokter Operator, Nama Dokter Anestesi, Jenis Anestesi, Diagnosa, Rencana Tindakan, Tanggal Rencana Operasi, dan Jam Rencana Operasi.
4. Seluruh field ditampilkan dalam kondisi *read-only* dan tidak dapat diubah oleh pengguna.
5. Layar detail tidak menampilkan aksi Ubah atau Simpan, serta tidak menjadi entry point untuk konfirmasi, penundaan, maupun pembatalan jadwal.
6. Ketika pengguna memilih **"Kembali"**, sistem menutup layar detail dan menampilkan kembali History Permintaan Jadwal Operasi pasien yang sama.

### Skenario 4 — Permintaan bersifat Cito
1. Pengguna mengaktifkan opsi "Cito" = Ya pada form Buat Permintaan.
2. Sistem menyimpan status Cito sebagai penanda (*flag*) pada permintaan.
3. Pada Dashboard IBS, status Cito hanya ditampilkan sebagai penanda informasi dan **tidak memengaruhi** urutan tampil, notifikasi, maupun SLA proses konfirmasi — tidak ada perlakuan prioritas khusus di sisi sistem.

### Skenario 5 — Perubahan episode pelayanan sebelum & sesudah konfirmasi

**Sub-skenario 5A — Remapping otomatis (jadwal belum dikonfirmasi saat episode berubah)**
1. Pasien dari pelayanan Rawat Jalan membuat permintaan jadwal operasi untuk 2 hari ke depan.
2. Permintaan tersebut masuk ke Dashboard IBS dengan status **Menunggu Konfirmasi**.
3. Selama status masih Menunggu Konfirmasi, 2 hari kemudian pasien datang ke TPPRI untuk masuk Rawat Inap. Pada saat jadwal operasi dikonfirmasi oleh petugas IBS, sistem secara otomatis melakukan **remapping registrasi aktif** ke registrasi Rawat Inap yang baru terbentuk (BR-003; BR-004). Histori permintaan jadwal operasi awal (dibuat dari Rawat Jalan) tetap dipertahankan tanpa perubahan (BR-005), sementara seluruh transaksi pelayanan (tindakan, BHP, obat, EMR, billing) mengacu pada registrasi Rawat Inap yang aktif tersebut.

**Sub-skenario 5B — Jadwal sudah terkonfirmasi di episode lama, lalu terbentuk episode baru**
1. Berbeda dengan 5A, pada kasus ini petugas terkait sudah melakukan **konfirmasi jadwal operasi** saat pasien masih berada di episode pelayanan Rawat Jalan (sebelum pasien masuk Rawat Inap) — sehingga jadwal operasi tersebut mengikuti (ter-*lock* pada) registrasi episode Rawat Jalan itu.
2. Ketika 2 hari kemudian pasien datang ke TPPRI dan terbentuk episode pelayanan baru (registrasi Rawat Inap aktif), jadwal operasi yang sudah terkonfirmasi pada episode Rawat Jalan sebelumnya **dapat dibatalkan**, kemudian dibuatkan **permintaan jadwal operasi yang baru** yang mengacu pada registrasi Rawat Inap yang aktif (lihat BR-009; proses pembatalan & pembuatan ulang mengikuti PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi). `[ASUMSI: pembatalan & pembuatan permintaan baru pada 5B bersifat tindakan manual oleh petugas terkait, bukan proses otomatis oleh sistem, karena sumber tidak menyebutkan mekanisme otomatis untuk kasus jadwal yang sudah terkonfirmasi di episode yang tidak lagi aktif.]`

### Skenario 6 — Pasien sudah Dipulangkan atau Diselesaikan
1. Pengguna membuka dashboard pelayanan pasien yang status pelayanannya sudah **Dipulangkan** atau **Diselesaikan**.
2. Sistem menampilkan menu/aksi **"Permintaan Jadwal Operasi"** dalam kondisi *disabled*.
3. Pengguna tidak dapat memilih menu tersebut, membuka modal Permintaan Jadwal Operasi, maupun membuat permintaan jadwal operasi baru dari episode pelayanan yang sudah selesai.
4. Data permintaan jadwal operasi yang sebelumnya telah tersimpan tidak diubah oleh penonaktifan fitur ini.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Satu permintaan jadwal operasi hanya dapat memiliki satu status aktif pada satu waktu (Menunggu Konfirmasi, Terkonfirmasi, Sedang Berlangsung, Selesai, Ditunda, atau Dibatalkan). | Draft user; FR-002 |
| **BR-002** | Field wajib pada form Buat Permintaan Jadwal Operasi: Nama Dokter Operator, Jenis Anestesi, Diagnosa, Tanggal Rencana Operasi, Jam Rencana Operasi, Rencana Tindakan. Field Cito dan Nama Dokter Anestesi tidak wajib. | Catatan kondisi as-is user; FR-001 |
| **BR-003** | Registrasi/episode pelayanan yang menjadi acuan pencatatan tindakan operasi, BHP, obat, EMR operasi, dan billing operasi adalah registrasi yang **aktif saat jadwal operasi dikonfirmasi** oleh petugas IBS, bukan registrasi saat permintaan pertama kali dibuat. | Draft user (Expected Improvement — Aspek Logic System); FR-003; *dieksekusi di PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi* |
| **BR-004** | Apabila terjadi perubahan episode pelayanan pasien **sebelum** jadwal dikonfirmasi, sistem melakukan remapping otomatis ke registrasi yang sedang aktif pada saat konfirmasi, tanpa mengubah histori permintaan jadwal operasi (lihat Skenario 5A). | Draft user; BR-003 |
| **BR-005** | Perubahan registrasi aktif pasien sebelum operasi tidak mengubah histori permintaan jadwal operasi yang sudah tercatat. | Draft user; BR-003; BR-004 |
| **BR-006** | Data jadwal operasi yang dipublikasikan ke Mobile JKN (MJKN) hanya jadwal H+1 atau lebih dengan status belum terlaksana (terlaksana = 0); perubahan status pelaksanaan operasi otomatis memperbarui data yang dikirim ke layanan BPJS. | Tambahan notes BPJS; FR-005 (Bagian 14) |
| **BR-007** | Jadwal berstatus Menunggu Konfirmasi dapat dibatalkan oleh unit pengirim sesuai hak akses; jadwal yang sudah Terkonfirmasi hanya dapat dibatalkan oleh petugas IBS atau pengguna dengan otorisasi sesuai, dengan alasan pembatalan wajib diisi. | Draft user (Expected Improvement); *implementasi Out of Scope — lihat PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi* |
| **BR-008** | Seluruh aktivitas pembuatan, perubahan, konfirmasi, penundaan, pembatalan, maupun penyelesaian jadwal operasi wajib tercatat pada Audit Trail. | Draft user; FR-004 |
| **BR-009** | Apabila jadwal operasi telah **dikonfirmasi** pada suatu episode pelayanan (mis. Rawat Jalan), dan kemudian terbentuk episode pelayanan baru yang aktif (mis. pasien masuk Rawat Inap via TPPRI) **sebelum** operasi dilaksanakan, maka jadwal operasi yang sudah terkonfirmasi pada episode lama tersebut dapat dibatalkan dan dibuatkan permintaan jadwal operasi baru yang mengacu pada registrasi aktif terbaru (lihat Skenario 5B). Berbeda dengan BR-004, kasus ini **tidak** melakukan remapping otomatis karena jadwal sudah dalam status Terkonfirmasi. | Draft user (klarifikasi Skenario 5B); *pembatalan & pembuatan ulang dieksekusi di PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi* |
| **BR-010** | Setiap record pada History Permintaan Jadwal Operasi menyediakan aksi **"Lihat Detail"** untuk membuka permintaan yang dipilih. | Draft user; referensi UI History; FR-002; FR-006 |
| **BR-011** | Layar Detail Permintaan Jadwal Operasi menampilkan identitas pasien dan nilai form yang tersimpan pada record terpilih. Seluruh field bersifat *read-only* dan tidak dapat diubah dari layar ini. | Draft user; referensi UI Detail; FR-006 |
| **BR-012** | Layar detail tidak menyediakan aksi Ubah, Simpan, Konfirmasi, Penundaan, atau Pembatalan. Aksi **"Kembali"** mengembalikan pengguna ke History Permintaan Jadwal Operasi pasien yang sama. | Draft user; referensi UI Detail; FR-006 |
| **BR-013** | Menu/aksi **"Permintaan Jadwal Operasi"** hanya dapat digunakan ketika status pelayanan pasien masih aktif. Apabila pasien sudah berstatus **Dipulangkan** atau **Diselesaikan**, menu/aksi ditampilkan dalam kondisi *disabled*, tidak dapat dipilih, dan pengguna tidak dapat membuka fitur atau membuat permintaan baru dari episode tersebut. | Draft user; FR-001; FR-007; US-007 |

## 9. State Machine

### 9.1 Status Permintaan Jadwal Operasi — Enam Kondisi

| State | Makna |
|-------|-------|
| Menunggu Konfirmasi | Permintaan telah dibuat oleh unit pengirim, belum ditindaklanjuti petugas IBS. |
| Terkonfirmasi | Petugas IBS telah mengonfirmasi jadwal (tanggal/jam/ruang operasi final). |
| Sedang Berlangsung | Tindakan operasi sedang dilaksanakan. |
| Selesai | Tindakan operasi telah selesai dilaksanakan. |
| Ditunda | Jadwal operasi ditunda dari jadwal semula. |
| Dibatalkan | Permintaan/jadwal operasi dibatalkan. |

- **Transisi:** Menunggu Konfirmasi → Terkonfirmasi → Sedang Berlangsung → Selesai (alur normal); Menunggu Konfirmasi → Dibatalkan; Terkonfirmasi → Ditunda / Dibatalkan; **Ditunda → Terkonfirmasi** (jadwal ulang — status Ditunda bukan status akhir, dapat kembali menjadi Terkonfirmasi ketika jadwal baru ditetapkan).
- Transisi status dieksekusi melalui Dashboard IBS, mengikuti business rule pada **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** (Out of Scope PRD ini); modul ini hanya menampilkan status terkini dan histori perubahannya pada Riwayat Jadwal Operasi.

### 9.2 Ketentuan Publikasi ke MJKN per Status
Hanya permintaan berstatus **belum terlaksana** (setara flag `terlaksana = 0`, mencakup status Menunggu Konfirmasi dan Terkonfirmasi yang jadwalnya H+1 atau lebih) yang dipublikasikan ke MJKN; status Sedang Berlangsung/Selesai/Ditunda/Dibatalkan mengikuti pembaruan otomatis sesuai ketentuan BPJS (lihat BR-006 & Bagian 14).

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Buat Permintaan Jadwal Operasi** — sistem menyediakan form bagi dokter/perawat di Rawat Jalan, IGD, Rawat Inap, dan VK untuk membuat permintaan jadwal operasi ketika pelayanan pasien masih aktif, mencakup Cito, Dokter Operator, Dokter Anestesi, Jenis Anestesi, Diagnosa, Tanggal & Jam Rencana Operasi, dan Rencana Tindakan, dengan validasi field wajib. | US-001; BR-002; BR-013 |
| **FR-002** | **Riwayat Permintaan Jadwal Operasi** — sistem menampilkan seluruh riwayat permintaan jadwal operasi pasien beserta status terkininya (Menunggu Konfirmasi/Terkonfirmasi/Sedang Berlangsung/Selesai/Ditunda/Dibatalkan) dan menyediakan aksi **"Lihat Detail"** pada setiap record. | US-002; BR-001; BR-010 |
| **FR-003** | **Penentuan Registrasi Aktif saat Konfirmasi** — sistem menyediakan mekanisme penentuan & remapping registrasi/episode pelayanan aktif sebagai acuan pencatatan tindakan operasi, BHP, obat, EMR, dan billing operasi saat jadwal dikonfirmasi. | US-003; BR-003; BR-004; BR-005 |
| **FR-004** | **Audit Trail Jadwal Operasi** — sistem mencatat seluruh aktivitas pengguna (dibuat oleh, dikonfirmasi oleh, ditunda oleh, dibatalkan oleh) beserta tanggal & waktu pada setiap permintaan jadwal operasi. | US-004; BR-008 |
| **FR-005** | **Publikasi Jadwal ke MJKN** — sistem mengirim data jadwal operasi yang memenuhi syarat publikasi (H+1 atau lebih, status belum terlaksana) ke layanan Bridging BPJS/Mobile JKN, dan memperbarui data secara otomatis saat status pelaksanaan berubah. | US-005; BR-006 |
| **FR-006** | **Detail Permintaan Jadwal Operasi Read-only** — sistem membuka detail dari aksi "Lihat Detail" pada History, menampilkan identitas pasien dan seluruh nilai form permintaan pada record terpilih dalam kondisi *read-only*, serta menyediakan aksi "Kembali" ke History pasien yang sama. | US-006; BR-010; BR-011; BR-012 |
| **FR-007** | **Validasi Status Pelayanan pada Entry Point** — sistem memeriksa status pelayanan pasien sebelum mengaktifkan menu/aksi "Permintaan Jadwal Operasi". Status pelayanan aktif membuat fitur dapat digunakan, sedangkan status **Dipulangkan** atau **Diselesaikan** membuat fitur *disabled* dan tidak dapat dibuka. | US-007; BR-013 |

## 11. User Stories

> Format "Sebagai … ingin … sehingga …". AC pola Given-When-Then.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **dokter/perawat unit pengirim**, saya ingin **membuat permintaan jadwal operasi untuk pasien dengan pelayanan yang masih aktif**, sehingga **IBS dapat menjadwalkan operasi sesuai kebutuhan klinis**. | 1) Given status pelayanan pasien masih aktif, When pengguna memilih menu "Permintaan Jadwal Operasi" lalu tab "Buat Permintaan Jadwal Operasi", Then sistem menampilkan form input (BR-002; BR-013). 2) Given seluruh field wajib telah diisi, When pengguna menekan "SIMPAN", Then sistem menyimpan permintaan dengan status Menunggu Konfirmasi. 3) Given salah satu field wajib kosong, When pengguna menekan "SIMPAN", Then sistem menampilkan validasi dan menahan penyimpanan. | FR-001; BR-002; BR-013 |
| **US-002** | Sebagai **dokter/perawat/petugas terkait**, saya ingin **melihat riwayat permintaan jadwal operasi pasien beserta statusnya**, sehingga **saya dapat memantau tindak lanjut tanpa membuka log sistem**. | 1) Given pasien memiliki riwayat permintaan jadwal operasi, When pengguna membuka tab "History Permintaan Jadwal Operasi", Then sistem menampilkan tabel riwayat dengan kolom Tanggal Operasi, Jam Operasi, Dokter Operator, Diagnosa, Tindakan Operasi, Ruang Operasi, Status, dan aksi "Lihat Detail". 2) Given pasien belum memiliki riwayat, When tab dibuka, Then sistem menampilkan indikator data kosong. | FR-002; BR-010 |
| **US-003** | Sebagai **sistem**, saya ingin **menentukan registrasi/episode pelayanan yang aktif saat jadwal operasi dikonfirmasi**, sehingga **seluruh pelayanan operasi tercatat pada episode yang benar meskipun episode pasien telah berubah sejak order dibuat**. | 1) Given permintaan jadwal operasi dibuat pada registrasi A, When episode pelayanan pasien berubah menjadi registrasi B sebelum konfirmasi, Then saat konfirmasi terjadi sistem mengacu pada registrasi B (BR-003; BR-004). 2) Given remapping terjadi, When histori permintaan ditinjau, Then histori order awal tetap utuh tanpa perubahan referensi (BR-005). | FR-003 |
| **US-004** | Sebagai **auditor/petugas terkait**, saya ingin **melihat detail audit trail setiap permintaan jadwal operasi**, sehingga **saya dapat menelusuri siapa & kapan setiap aktivitas dilakukan**. | 1) Given suatu permintaan telah mengalami perubahan status, When pengguna membuka informasi audit trail permintaan, Then sistem menampilkan informasi dibuat oleh/dikonfirmasi oleh/ditunda oleh/dibatalkan oleh beserta tanggal & waktunya (BR-008). | FR-004 |
| **US-005** | Sebagai **pasien peserta BPJS**, saya ingin **melihat jadwal operasi saya melalui aplikasi Mobile JKN**, sehingga **saya mendapat informasi jadwal operasi yang akurat**. | 1) Given jadwal operasi berstatus belum terlaksana dan bertanggal H+1 atau lebih, When proses publikasi berjalan, Then jadwal tersebut tampil di MJKN (BR-006). 2) Given status pelaksanaan operasi berubah, When perubahan tersimpan, Then data yang dikirim ke MJKN diperbarui otomatis. | FR-005 |
| **US-006** | Sebagai **dokter/perawat/petugas terkait**, saya ingin **membuka detail permintaan dari History tanpa dapat mengubahnya**, sehingga **saya dapat memverifikasi data permintaan yang pernah dibuat dengan aman**. | 1) Given pengguna berada pada History dan sebuah record tersedia, When pengguna memilih "Lihat Detail", Then sistem menampilkan Detail Permintaan Jadwal Operasi untuk record tersebut (BR-010). 2) Given layar detail terbuka, Then identitas pasien dan seluruh nilai form permintaan tampil sesuai data tersimpan serta seluruh field bersifat *read-only* (BR-011). 3) Given pengguna berada pada layar detail, When memilih "Kembali", Then sistem kembali ke History pasien yang sama tanpa perubahan data (BR-012). | FR-006; BR-010; BR-011; BR-012 |
| **US-007** | Sebagai **petugas unit pengirim**, saya ingin **fitur Permintaan Jadwal Operasi dinonaktifkan ketika pelayanan pasien sudah Dipulangkan atau Diselesaikan**, sehingga **tidak terjadi pembuatan permintaan baru pada episode pelayanan yang sudah selesai**. | 1) Given status pelayanan pasien masih aktif, When pengguna membuka menu aksi pasien, Then "Permintaan Jadwal Operasi" tersedia dan dapat dipilih. 2) Given status pelayanan pasien adalah **Dipulangkan** atau **Diselesaikan**, When pengguna membuka menu aksi pasien, Then "Permintaan Jadwal Operasi" tampil *disabled* dan tidak dapat dipilih. 3) Given menu dalam kondisi *disabled*, When pengguna mencoba mengakses fitur, Then modal/form Permintaan Jadwal Operasi tidak dibuka dan tidak ada permintaan baru yang dibuat. | FR-007; BR-013 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi pasien **reuse definisi kanonik dari Data Sosial Pasien/Pendaftaran Pasien** — nama, tipe, format, dan sumber data harus konsisten pada form input maupun layar detail.

### A. Header Form — Identitas Pasien (tampil sticky di seluruh form)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-------------------|------------------|---------|
| no_rm | No. RM | Read-only | — | — | Autofill dari Pendaftaran Pasien | Autofill, tidak dapat diubah user |
| nama_pasien | Nama Pasien | Read-only | — | — | Autofill dari Data Sosial Pasien — Nama Pasien | Autofill, tidak dapat diubah user |
| status_pasien | Status Pasien | Read-only | — | — | Autofill dari Data Sosial Pasien — Status Pasien | Autofill, tidak dapat diubah user |
| tanggal_lahir_umur | Tanggal Lahir + Umur | Read-only | — | Tanggal lahir + usia dalam tahun | Autofill dari Data Sosial Pasien — Tanggal Lahir + Umur Pasien | Autofill, tidak dapat diubah user |
| jenis_kelamin | Jenis Kelamin | Read-only | — | — | Autofill dari Data Sosial Pasien — Jenis Kelamin Pasien | Autofill, tidak dapat diubah user |

### B. Layar INPUT — Buat Permintaan Jadwal Operasi (FR-001)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| cito | Cito | Toggle (Ya/Tidak) | Tidak | — | Default: Tidak | BR-002 |
| dokter_operator | Nama Dokter Operator | Dropdown (lookup) | Ya | Pilih dari master staff | Master Staff | BR-002 |
| dokter_anestesi | Nama Dokter Anestesi | Dropdown (lookup) | Tidak | Pilih dari master staff | Master Staff | Opsional |
| jenis_anestesi | Jenis Anestesi | Dropdown | Ya | Enum | Tanpa Anestesi, Anestesi General, Anestesi Spinal| BR-002 |
| diagnosa | Diagnosa | Text | Ya | — | Manual | BR-002 |
| tanggal_rencana_operasi | Tanggal Rencana Operasi | Date picker | Ya | Format DD/MM/YYYY | Manual | BR-002 |
| jam_rencana_operasi | Jam Rencana Operasi | Time picker | Ya | Format HH:mm | Manual | BR-002 |
| rencana_tindakan | Rencana Tindakan | Textarea | Ya | — | Manual | BR-002 |

### C. Layar TAMPIL — History Permintaan Jadwal Operasi (FR-002)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|------------------|-------------|---------|
| Tanggal Operasi | Form buat permintaan jadwal operasi - Tanggal rencana operasi | DD/MM/YYYY | Sort ascending (default) | Dapat melakukan filter asc or desc |
| Jam Operasi | Form buat permintaan jadwal operasi - Jam rencana operasi | HH:mm | - | Default awal sesuai inputan form permintaan jadwal operasi (10:00) tetapi jika sudah terkonfirmasi maka jam operasi akan berubah menjadi (10:00 - 11:00) |
| Dokter Operator | Form buat permintaan jadwal operasi - Nama dokter operator | Text | — | — |
| Diagnosa | Form buat permintaan jadwal operasi - Diagnosa | Text | — | — |
| Tindakan Operasi | Konfirmasi permintaan jadwal operasi - Tindakan operasi | Text | — | Terisi setelah konfirmasi oleh petugas IBS; Out of Scope pengisian di PRD ini |
| Ruang Operasi | Konfirmasi permintaan jadwal operasi - Ruang operasi | Text | — | Terisi setelah konfirmasi oleh petugas IBS; Out of Scope pengisian di PRD ini |
| Status | State machine (Bagian 9) | Badge | Filter by status | BR-001 |
| Aksi | Record permintaan terpilih | Link **"Lihat Detail"** | — | Ditampilkan pada setiap record; membuka layar Detail Permintaan Jadwal Operasi (FR-006; BR-010) |

### D. Layar TAMPIL — Detail Permintaan Jadwal Operasi (FR-006)

> Layar dibuka melalui aksi **"Lihat Detail"** pada History. Seluruh nilai harus berasal dari record permintaan yang dipilih dan ditampilkan dalam kondisi *read-only*. Tidak terdapat tombol Ubah atau Simpan.

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Nama | Data Sosial Pasien — Nama Pasien | Text | — | Read-only |
| No. RM | Pendaftaran Pasien — No. RM | Text | — | Read-only |
| Jenis Kelamin | Data Sosial Pasien — Jenis Kelamin | Text | — | Read-only |
| Tanggal Lahir + Umur | Data Sosial Pasien — Tanggal Lahir | DD/MM/YYYY + usia dalam tahun | — | Read-only |
| Cito | Permintaan Jadwal Operasi — Cito | Ya/Tidak | — | Read-only |
| Nama Dokter Operator | Permintaan Jadwal Operasi — Dokter Operator | Text | — | Read-only |
| Nama Dokter Anestesi | Permintaan Jadwal Operasi — Dokter Anestesi | Text atau `-` bila tidak diisi | — | Read-only; field opsional |
| Jenis Anestesi | Permintaan Jadwal Operasi — Jenis Anestesi | Text | — | Read-only |
| Diagnosa | Permintaan Jadwal Operasi — Diagnosa | Text | — | Read-only |
| Rencana Tindakan | Permintaan Jadwal Operasi — Rencana Tindakan | Text | — | Read-only |
| Tanggal Rencana Operasi | Permintaan Jadwal Operasi — Tanggal Rencana Operasi | DD/MM/YYYY | — | Read-only |
| Jam Rencana Operasi | Permintaan Jadwal Operasi — Jam Rencana Operasi | HH:mm | — | Read-only |
| Kembali | Navigasi layar | Tombol/link **"Kembali"** | — | Kembali ke History Permintaan Jadwal Operasi pasien yang sama; tidak mengubah data |

### E. Aturan Tampil/Aktivasi Entry Point Permintaan Jadwal Operasi (FR-007)

| Status Pelayanan Pasien | Kondisi Menu/Aksi | Perilaku Sistem | Catatan |
|-------------------------|-------------------|------------------|---------|
| Aktif | Enabled | Pengguna dapat membuka fitur Permintaan Jadwal Operasi dan membuat permintaan baru sesuai hak akses. | BR-013 |
| Dipulangkan | Disabled | Menu/aksi tidak dapat dipilih; modal/form tidak dibuka. | Tidak dapat membuat permintaan baru dari episode tersebut. |
| Diselesaikan | Disabled | Menu/aksi tidak dapat dipilih; modal/form tidak dibuka. | Tidak dapat membuat permintaan baru dari episode tersebut. |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Skalabilitas | Sistem mampu mengelola maksimal 30 pasien operasi/hari tanpa penurunan performa. | Metrik |
| **NFR-002** | Performa | Akses dashboard pelayanan operasi < 1 detik. | Metrik |
| **NFR-003** | Performa | Konfirmasi jadwal operasi < 1 detik. | Metrik; *proses konfirmasi Out of Scope, NFR ini menjadi acuan untuk PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi* |
| **NFR-004** | Auditabilitas | Riwayat perubahan jadwal operasi selalu tersedia untuk kebutuhan audit. | BR-008 |
| **NFR-005** | Keamanan/RBAC | Pembuatan, perubahan, konfirmasi, dan pembatalan jadwal operasi dilakukan sesuai hak akses dan business rule yang berlaku. | Draft user |
| **NFR-006** | Usability/Konsistensi | Layar Detail Permintaan Jadwal Operasi harus menunjukkan secara jelas bahwa seluruh data bersifat *read-only* serta tidak menampilkan kontrol Ubah atau Simpan. | FR-006; BR-011; BR-012 |

## 14. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Dashboard Pelayanan / Status Episode Pasien** | Menyediakan status pelayanan aktif, Dipulangkan, atau Diselesaikan sebagai dasar aktivasi entry point Permintaan Jadwal Operasi. | Internal — Hard Dependency | FR-007; BR-013 |
| **Dashboard IBS** | Menerima & menampilkan permintaan jadwal operasi bagi petugas IBS. | Internal — Hard Dependency | FR-002 |
| **PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi** | Menindaklanjuti permintaan (konfirmasi/penundaan/pembatalan) dan menentukan registrasi aktif. | Internal — Hard Dependency | FR-003; BR-003 |
| **Electronic Medical Record (EMR)** | Menerima data tindakan operasi, dokter operator/anestesi, dan diagnosa untuk pencatatan rekam medis. | Internal | FR-001 |
| **Billing Operasi** | Menerima data jadwal operasi terkonfirmasi sebagai dasar billing tindakan (implementasi integrasi Out of Scope). | Internal — Soft Dependency | Out of Scope |
| **Bridging BPJS / Mobile JKN (MJKN)** | Publikasi jadwal operasi kepada pasien sesuai ketentuan web service BPJS (jadwal H+1+, status belum terlaksana). | Live | FR-005; BR-006 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| Dashboard Pelayanan / Status Episode Pasien | Hard | Sistem tidak dapat menentukan apakah entry point Permintaan Jadwal Operasi harus aktif atau *disabled* (BR-013 tidak dapat dieksekusi). |
| PRD Konfirmasi, Penundaan & Pembatalan Jadwal Operasi | Hard | Status permintaan tidak dapat berubah dari Menunggu Konfirmasi; registrasi aktif tidak dapat ditentukan (BR-003 tidak dapat dieksekusi). |
| Master Dokter/SDM, Master Jenis Anestesi | Hard | Field Dokter Operator/Anestesi & Jenis Anestesi pada form tidak dapat diisi. |
| Master Ruang Operasi | Soft | Kolom Ruang Operasi pada Riwayat tidak dapat terisi hingga modul master tersedia. |

## 15. Asumsi

- `[ASUMSI]` Hak akses aksi **"Lihat Detail"** mengikuti hak akses pengguna untuk membuka History Permintaan Jadwal Operasi; tidak terdapat permission terpisah khusus untuk detail.

## 16. Pertanyaan Terbuka

- Tidak ada pertanyaan terbuka untuk penambahan validasi status pelayanan pada revisi ini.

## 17. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 2.0 | [PERLU KONFIRMASI] | Team Product — Tamtech International | Draft awal PRD Permintaan Jadwal Operasi. |
| 2.1 | 16 Juli 2026 | Team Product — Tamtech International | Menambahkan bisnis proses aksi **"Lihat Detail"** dari History, layar Detail Permintaan Jadwal Operasi *read-only*, business rules, FR-006, US-006, Data Requirements, dan NFR terkait. |
| 2.2 | 21 Juli 2026 | Team Product — Tamtech International | Menambahkan validasi status pelayanan: menu/aksi **"Permintaan Jadwal Operasi"** hanya aktif selama pelayanan pasien masih aktif dan menjadi *disabled* ketika pasien berstatus **Dipulangkan** atau **Diselesaikan**; termasuk pembaruan business process, BR-013, FR-007, US-007, Data Requirements, dan dependency. |

